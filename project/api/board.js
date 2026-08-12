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
    if (action === 'getAll') {
      const [postsFlat, lastSeenFlat] = await Promise.all([
        redis(['HGETALL', 'board:posts']),
        redis(['HGETALL', 'board:lastseen']),
      ]);
      const posts = {};
      for (let i = 0; i < (postsFlat || []).length; i += 2) {
        posts[postsFlat[i]] = safeParse(postsFlat[i + 1], null);
      }
      const lastSeen = {};
      for (let i = 0; i < (lastSeenFlat || []).length; i += 2) {
        lastSeen[lastSeenFlat[i]] = safeParse(lastSeenFlat[i + 1], {});
      }
      res.status(200).json({ posts, lastSeen });
      return;
    }

    if (action === 'savePost') {
      const { post } = req.body || {};
      if (!post || !post.id) { res.status(400).json({ error: 'Missing post.id' }); return; }
      await redis(['HSET', 'board:posts', post.id, JSON.stringify(post)]);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'deletePost') {
      const { postId } = req.body || {};
      if (!postId) { res.status(400).json({ error: 'Missing postId' }); return; }
      await redis(['HDEL', 'board:posts', postId]);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'appendComment') {
      const { postId, comment } = req.body || {};
      if (!postId || !comment) { res.status(400).json({ error: 'Missing postId/comment' }); return; }
      const raw = await redis(['HGET', 'board:posts', postId]);
      if (!raw) { res.status(404).json({ error: 'Post not found' }); return; }
      const post = safeParse(raw, null);
      if (!post) { res.status(500).json({ error: 'Stored post is corrupted' }); return; }
      post.comments = [...(post.comments || []), comment];
      await redis(['HSET', 'board:posts', postId, JSON.stringify(post)]);

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

      res.status(200).json({ post });
      return;
    }

    if (action === 'toggleReaction') {
      const { postId, commentId, user, emoji } = req.body || {};
      if (!postId || !commentId || !user || !emoji) { res.status(400).json({ error: 'Missing postId/commentId/user/emoji' }); return; }
      const raw = await redis(['HGET', 'board:posts', postId]);
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
      await redis(['HSET', 'board:posts', postId, JSON.stringify(post)]);
      res.status(200).json({ post });
      return;
    }

    if (action === 'saveLastSeen') {
      const { user, seenMap } = req.body || {};
      if (!user) { res.status(400).json({ error: 'Missing user' }); return; }
      await redis(['HSET', 'board:lastseen', user, JSON.stringify(seenMap || {})]);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'clearAll') {
      await Promise.all([
        redis(['DEL', 'board:posts']),
        redis(['DEL', 'board:lastseen']),
      ]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'Unknown action: ' + action });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
