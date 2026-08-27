import { addSubscription, removeSubscription } from '../lib/push.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { action, user, subscription, endpoint } = req.body || {};

  try {
    if (action === 'getVapidKey') {
      const key = process.env.VAPID_PUBLIC_KEY;
      if (!key) { res.status(500).json({ error: 'VAPID_PUBLIC_KEY is not set on the server' }); return; }
      res.status(200).json({ key });
      return;
    }

    if (action === 'subscribe') {
      if (!user || !subscription || !subscription.endpoint) { res.status(400).json({ error: 'Missing user/subscription' }); return; }
      await addSubscription(user, subscription);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'unsubscribe') {
      if (!user || !endpoint) { res.status(400).json({ error: 'Missing user/endpoint' }); return; }
      await removeSubscription(user, endpoint);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'Unknown action: ' + action });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
