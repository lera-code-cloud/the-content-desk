// Shared storage for the board, backed by Upstash Redis (REST API — no extra
// npm package needed, just fetch). This replaces the artifact-only
// `window.storage` API that content boards built inside Claude.ai use.
//
// Design: each post is stored as its OWN field in a Redis hash
// (`board:posts`), keyed by post id — NOT as one giant JSON blob. That means
// two people editing two different posts at the same time never overwrite
// each other. Only two people editing the EXACT same post at the EXACT same
// instant could still race — much narrower than clobbering the whole board.
//
// Required env vars (set these in the Vercel project settings):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
// (Create a free Redis database at https://upstash.com — the REST URL/token
// are shown on the database's dashboard page.)

import { sendPushToUser } from '../lib/push.js';

export const config = {
  maxDuration: 30,
};

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Storage is not configured: missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN env vars');
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// Several commands in ONE HTTP request, applied atomically (Upstash /multi-exec).
async function redisTx(commands) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Storage is not configured: missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN env vars');
  }
  const r = await fetch(url.replace(/\/$/, '') + '/multi-exec', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  const data = await r.json();
  if (!Array.isArray(data)) throw new Error((data && data.error) || 'Redis transaction failed');
  data.forEach((d) => { if (d && d.error) throw new Error(d.error); });
  return data.map((d) => d.result);
}

// ---- Bandwidth-friendly sync ------------------------------------------------
// The old version made every open tab download the WHOLE board (all posts,
// comments and base64 snippet images) every 4 seconds — that's what burned
// through Upstash's 10 GB/month. Now:
//   board:ver    — a counter bumped on ANY post write/delete (a few bytes)
//   board:lsver  — same, for "last seen" writes
//   board:revs   — hash postId -> revision string, changes whenever that post changes
// Clients poll only the two counters (one tiny MGET). Only when a counter moved
// do they fetch the revs map, and then download ONLY the posts whose rev changed.
const K_POSTS = 'board:posts';
const K_REVS = 'board:revs';
const K_VER = 'board:ver';
const K_LSVER = 'board:lsver';
const K_LASTSEEN = 'board:lastseen';
const K_FREACT = 'board:fieldreactions'; // hash postId -> JSON fieldReactions

// Field reactions (headline / lead / snippet). Keep in sync with App.jsx.
// One thumb + one score per person per field; same emoji again = remove,
// another emoji from the same group = replace.
const FIELD_REACTION_FIELDS = ['headline', 'lead', 'snippet'];
const FIELD_THUMBS = ['👍', '👎'];
const FIELD_SCORES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
function applyFieldReaction(fieldReactions, field, user, emoji) {
  const all = { ...(fieldReactions || {}) };
  const forField = { ...(all[field] || {}) };
  const group = FIELD_THUMBS.includes(emoji) ? FIELD_THUMBS : FIELD_SCORES;
  const mine = forField[user] || [];
  const had = mine.includes(emoji);
  const next = mine.filter((e) => !group.includes(e));
  if (!had) next.push(emoji);
  if (next.length) forField[user] = next; else delete forField[user];
  all[field] = forField;
  return all;
}

// Posts read straight from K_POSTS don't carry fieldReactions — add them back
// before sending a post to the client, so replacing the local copy with the
// server's doesn't make the reactions blink out.
async function attachFieldReactions(post) {
  if (!post || !post.id) return post;
  const raw = await redis(['HGET', K_FREACT, post.id]);
  post.fieldReactions = raw ? safeParse(raw, {}) : {};
  return post;
}

function newRev() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

async function writePost(post) {
  const rev = newRev();
  // fieldReactions live in their own small hash (K_FREACT) and are only changed
  // by toggleFieldReaction — so a full-post save from the author's browser
  // (possibly holding a stale copy) can never wipe a reviewer's 👍 / score.
  const { fieldReactions, ...rest } = post;
  await redisTx([
    ['HSET', K_POSTS, post.id, JSON.stringify(rest)],
    ['HSET', K_REVS, post.id, rev],
    ['INCR', K_VER],
  ]);
  return rev;
}

function flatToObj(flat, parse) {
  const out = {};
  for (let i = 0; i < (flat || []).length; i += 2) out[flat[i]] = parse ? safeParse(flat[i + 1], null) : flat[i + 1];
  return out;
}

function safeParse(s, fallback) {
  try { return JSON.parse(s); } catch (e) { return fallback; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { action } = req.body || {};

  try {
    // Cheap heartbeat — what every tab polls. ~30 bytes, 1 command.
    if (action === 'getVersion') {
      const [v, lsv] = await redis(['MGET', K_VER, K_LSVER]);
      res.status(200).json({ v: v || '0', lsv: lsv || '0' });
      return;
    }

    // Which posts exist and their current revision (ids + short strings, no content).
    if (action === 'getRevs') {
      const [v, revsFlat] = await redisTx([['GET', K_VER], ['HGETALL', K_REVS]]);
      res.status(200).json({ v: v || '0', revs: flatToObj(revsFlat, false) });
      return;
    }

    // Download only the posts that actually changed.
    if (action === 'getPosts') {
      const { ids } = req.body || {};
      if (!Array.isArray(ids) || !ids.length) { res.status(200).json({ posts: {} }); return; }
      const [raw, fr] = await redisTx([['HMGET', K_POSTS, ...ids], ['HMGET', K_FREACT, ...ids]]);
      const posts = {};
      ids.forEach((id, i) => {
        const p = raw && raw[i] ? safeParse(raw[i], null) : null;
        if (p) p.fieldReactions = fr && fr[i] ? safeParse(fr[i], {}) : {};
        posts[id] = p;
      });
      res.status(200).json({ posts });
      return;
    }

    if (action === 'getLastSeen') {
      const [lsv, flat] = await redisTx([['GET', K_LSVER], ['HGETALL', K_LASTSEEN]]);
      res.status(200).json({ lsv: lsv || '0', lastSeen: flatToObj(flat, true) });
      return;
    }

    // Full load — only on first open of the app (or if the client lost track).
    if (action === 'getAll') {
      const [v, lsv, postsFlat, lastSeenFlat, revsFlat, frFlat] = await redisTx([
        ['GET', K_VER],
        ['GET', K_LSVER],
        ['HGETALL', K_POSTS],
        ['HGETALL', K_LASTSEEN],
        ['HGETALL', K_REVS],
        ['HGETALL', K_FREACT],
      ]);
      const posts = flatToObj(postsFlat, true);
      const fieldReactions = flatToObj(frFlat, true);
      Object.keys(posts).forEach((id) => { if (posts[id]) posts[id].fieldReactions = fieldReactions[id] || {}; });
      const lastSeen = flatToObj(lastSeenFlat, true);
      const revs = flatToObj(revsFlat, false);
      // One-time migration: posts saved before this version have no rev yet.
      const missing = Object.keys(posts).filter((id) => !revs[id]);
      if (missing.length) {
        const pairs = [];
        missing.forEach((id) => { revs[id] = 'legacy'; pairs.push(id, 'legacy'); });
        await redis(['HSET', K_REVS, ...pairs]);
      }
      res.status(200).json({ posts, lastSeen, revs, v: v || '0', lsv: lsv || '0' });
      return;
    }

    if (action === 'savePost') {
      const { post } = req.body || {};
      if (!post || !post.id) { res.status(400).json({ error: 'Missing post.id' }); return; }
      const rev = await writePost(post);
      res.status(200).json({ ok: true, postId: post.id, rev });
      return;
    }

    if (action === 'deletePost') {
      const { postId } = req.body || {};
      if (!postId) { res.status(400).json({ error: 'Missing postId' }); return; }
      await redisTx([
        ['HDEL', K_POSTS, postId],
        ['HDEL', K_REVS, postId],
        ['HDEL', K_FREACT, postId],
        ['INCR', K_VER],
      ]);
      res.status(200).json({ ok: true, postId, deleted: true });
      return;
    }

    if (action === 'appendComment') {
      const { postId, comment } = req.body || {};
      if (!postId || !comment) { res.status(400).json({ error: 'Missing postId/comment' }); return; }
      const raw = await redis(['HGET', K_POSTS, postId]);
      if (!raw) { res.status(404).json({ error: 'Post not found' }); return; }
      const post = safeParse(raw, null);
      if (!post) { res.status(500).json({ error: 'Stored post is corrupted' }); return; }
      post.comments = [...(post.comments || []), comment];
      const rev = await writePost(post);

      // Notify: the post's author (if someone else commented on it) and anyone
      // explicitly @mentioned — but never the person who just wrote the comment.
      const recipients = new Set();
      if (post.author && post.author !== comment.author) recipients.add(post.author);
      (comment.mentions || []).forEach((m) => { if (m !== comment.author) recipients.add(m); });
      const isMentionOf = (name) => (comment.mentions || []).includes(name);
      await Promise.all(Array.from(recipients).map((name) => {
        const title = isMentionOf(name) ? `${comment.author} mentioned you` : `${comment.author} commented on your post`;
        return sendPushToUser(name, {
          title,
          body: comment.text.slice(0, 140),
          tag: 'content-desk-comment',
          postId,
        }).catch((e) => console.error('push failed for', name, e.message));
      }));

      await attachFieldReactions(post);
      res.status(200).json({ post, postId, rev });
      return;
    }

    if (action === 'toggleReaction') {
      const { postId, commentId, user, emoji } = req.body || {};
      if (!postId || !commentId || !user || !emoji) { res.status(400).json({ error: 'Missing postId/commentId/user/emoji' }); return; }
      const raw = await redis(['HGET', K_POSTS, postId]);
      if (!raw) { res.status(404).json({ error: 'Post not found' }); return; }
      const post = safeParse(raw, null);
      if (!post) { res.status(500).json({ error: 'Stored post is corrupted' }); return; }
      const comment = (post.comments || []).find((c) => c.id === commentId);
      if (!comment) { res.status(404).json({ error: 'Comment not found' }); return; }
      comment.reactions = comment.reactions || {};
      // One reaction per person per comment — toggling your current pick removes
      // it, picking a different one replaces it.
      if (comment.reactions[user] === emoji) delete comment.reactions[user];
      else comment.reactions[user] = emoji;
      const rev = await writePost(post);
      await attachFieldReactions(post);
      res.status(200).json({ post, postId, rev });
      return;
    }

    if (action === 'toggleTopicReaction') {
      const { postId, user, emoji } = req.body || {};
      if (!postId || !user || !emoji) { res.status(400).json({ error: 'Missing postId/user/emoji' }); return; }
      const raw = await redis(['HGET', K_POSTS, postId]);
      if (!raw) { res.status(404).json({ error: 'Post not found' }); return; }
      const post = safeParse(raw, null);
      if (!post) { res.status(500).json({ error: 'Stored post is corrupted' }); return; }
      post.reactions = post.reactions || {};
      // Same one-reaction-per-person model as comments, but on the topic itself.
      if (post.reactions[user] === emoji) delete post.reactions[user];
      else post.reactions[user] = emoji;
      const rev = await writePost(post);
      await attachFieldReactions(post);
      res.status(200).json({ post, postId, rev });
      return;
    }

    if (action === 'toggleFieldReaction') {
      const { postId, field, user, emoji } = req.body || {};
      if (!postId || !field || !user || !emoji) { res.status(400).json({ error: 'Missing postId/field/user/emoji' }); return; }
      if (!FIELD_REACTION_FIELDS.includes(field)) { res.status(400).json({ error: 'Unknown field: ' + field }); return; }
      if (![...FIELD_THUMBS, ...FIELD_SCORES].includes(emoji)) { res.status(400).json({ error: 'Unsupported emoji' }); return; }
      const [exists, frRaw] = await redisTx([['HEXISTS', K_POSTS, postId], ['HGET', K_FREACT, postId]]);
      if (!exists) { res.status(404).json({ error: 'Post not found' }); return; }
      const fieldReactions = applyFieldReaction(frRaw ? safeParse(frRaw, {}) : {}, field, user, emoji);
      // Bump the post's rev too, so other open tabs pick the change up on their next poll.
      const rev = newRev();
      await redisTx([
        ['HSET', K_FREACT, postId, JSON.stringify(fieldReactions)],
        ['HSET', K_REVS, postId, rev],
        ['INCR', K_VER],
      ]);
      res.status(200).json({ post: { id: postId, fieldReactions }, postId, rev });
      return;
    }

    if (action === 'editComment') {
      const { postId, commentId, text, mentions } = req.body || {};
      if (!postId || !commentId || typeof text !== 'string') { res.status(400).json({ error: 'Missing postId/commentId/text' }); return; }
      const raw = await redis(['HGET', K_POSTS, postId]);
      if (!raw) { res.status(404).json({ error: 'Post not found' }); return; }
      const post = safeParse(raw, null);
      if (!post) { res.status(500).json({ error: 'Stored post is corrupted' }); return; }
      const comment = (post.comments || []).find((c) => c.id === commentId);
      if (!comment) { res.status(404).json({ error: 'Comment not found' }); return; }
      comment.text = text;
      comment.mentions = Array.isArray(mentions) ? mentions : [];
      comment.editedAt = new Date().toISOString();
      const rev = await writePost(post);
      await attachFieldReactions(post);
      res.status(200).json({ post, postId, rev });
      return;
    }

    if (action === 'saveLastSeen') {
      const { user, seenMap } = req.body || {};
      if (!user) { res.status(400).json({ error: 'Missing user' }); return; }
      await redisTx([
        ['HSET', K_LASTSEEN, user, JSON.stringify(seenMap || {})],
        ['INCR', K_LSVER],
      ]);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'clearAll') {
      await redisTx([
        ['DEL', K_POSTS],
        ['DEL', K_REVS],
        ['DEL', K_FREACT],
        ['DEL', K_LASTSEEN],
        ['INCR', K_VER],
        ['INCR', K_LSVER],
      ]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'Unknown action: ' + action });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
