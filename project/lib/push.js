// Shared helper for sending Web Push notifications. Lives OUTSIDE /api so Vercel
// doesn't treat it as its own route — it's just a plain module imported by
// api/board.js (when a comment/mention happens) and api/push.js (subscribe mgmt).
//
// Required env vars:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  — generate once with:
//     node -e "console.log(require('web-push').generateVAPIDKeys())"
//   VAPID_SUBJECT — a mailto: or https: contact URL, e.g. mailto:you@example.com

import webpush from 'web-push';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  if (!pub || !priv) throw new Error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not set');
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Storage is not configured');
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

function safeParse(s, fallback) {
  try { return JSON.parse(s); } catch (e) { return fallback; }
}

// One user can have several subscriptions (phone + laptop, etc). Stored as a
// JSON array under a Redis hash field keyed by username.
export async function getSubscriptions(user) {
  const raw = await redis(['HGET', 'board:pushsubs', user]);
  return raw ? safeParse(raw, []) : [];
}

export async function addSubscription(user, subscription) {
  const subs = await getSubscriptions(user);
  const deduped = subs.filter((s) => s.endpoint !== subscription.endpoint);
  deduped.push(subscription);
  await redis(['HSET', 'board:pushsubs', user, JSON.stringify(deduped)]);
}

export async function removeSubscription(user, endpoint) {
  const subs = await getSubscriptions(user);
  const kept = subs.filter((s) => s.endpoint !== endpoint);
  await redis(['HSET', 'board:pushsubs', user, JSON.stringify(kept)]);
}

// Sends `payload` (a plain object, will be JSON-stringified) to every device
// `user` has subscribed from. Silently drops subscriptions that are no longer
// valid (410/404 — the browser unsubscribed or the endpoint expired) so dead
// entries don't pile up forever.
export async function sendPushToUser(user, payload) {
  ensureConfigured();
  const subs = await getSubscriptions(user);
  if (!subs.length) return;
  const body = JSON.stringify(payload);
  const stillValid = [];
  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, body);
      stillValid.push(sub);
    } catch (e) {
      // 404/410 = the subscription is gone for good; anything else, keep it
      // (could be a transient network blip) rather than deleting on a guess.
      if (e.statusCode !== 404 && e.statusCode !== 410) stillValid.push(sub);
    }
  }));
  if (stillValid.length !== subs.length) {
    await redis(['HSET', 'board:pushsubs', user, JSON.stringify(stillValid)]);
  }
}
