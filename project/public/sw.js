// Minimal service worker just for Web Push. It doesn't do any offline
// caching — its only job is to receive push events and show a notification,
// and to focus/open the app when that notification is tapped.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'The Content Desk', body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'The Content Desk';
  const postId = data.postId || null;
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'content-desk',
    data: { postId, url: postId ? `/?postId=${encodeURIComponent(postId)}` : '/' },
    // Sound itself is played by the OS/browser using its own default
    // notification sound — the Web Push API has no way to set a custom sound
    // file. `silent: false` just makes sure we never accidentally suppress
    // it, and `vibrate` adds a buzz pattern on Android (iOS ignores this).
    silent: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const postId = event.notification.data && event.notification.data.postId;
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      const existing = clientList.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        // Preferred path: message the already-open app to jump there instantly,
        // no reload. Also focus it so it comes to the front.
        existing.postMessage({ type: 'jump-to-post', postId });
        if ('focus' in existing) { try { await existing.focus(); } catch (e) { /* ignore */ } }
        // iOS's Web Push implementation for home-screen apps doesn't always
        // reliably deliver postMessage/focus to an already-running standalone
        // app — as a second attempt, force the URL itself if the browser
        // supports it, so the app's own on-load URL handling can pick it up.
        if (postId && 'navigate' in existing) {
          try { await existing.navigate(targetUrl); } catch (e) { /* not supported here, ignore */ }
        }
        return;
      }
      // No tab open at all — open a fresh one with the post id in the URL, the
      // app reads that on load and jumps there once the board has loaded.
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
