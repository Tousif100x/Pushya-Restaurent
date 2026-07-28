importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase config is injected at build time via next.config.ts rewrites / public file generation.
// The __FIREBASE_CONFIG__ object is populated by the /api/firebase-config endpoint fetched on sw install.
let firebaseConfig = null;

// On install, fetch config from the app so the SW has it for background messages
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    fetch('/api/firebase-config')
      .then(r => r.json())
      .then(config => {
        if (config && config.apiKey) {
          firebaseConfig = config;
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
        }
      })
      .catch(err => console.warn('[firebase-messaging-sw.js] Could not fetch config:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Also try to init immediately from URL params as a fallback for immediate use
const searchParams = new URLSearchParams(location.search);
const paramApiKey = searchParams.get('apiKey');
if (paramApiKey && !firebase.apps.length) {
  firebase.initializeApp({
    apiKey: paramApiKey,
    projectId: searchParams.get('projectId'),
    messagingSenderId: searchParams.get('messagingSenderId'),
    appId: searchParams.get('appId'),
  });
}

// Set up background messaging after app is initialized
function setupMessaging() {
  try {
    if (!firebase.apps.length) return;
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function(payload) {
      console.log('[firebase-messaging-sw.js] Background message:', payload);

      const notificationTitle = payload.notification?.title || '🔔 New Order!';
      const notificationBody = payload.notification?.body || 'You have a new order pending.';
      const orderId = payload.data?.orderId || '';
      const url = payload.data?.url || '/admin/dashboard';

      self.registration.showNotification(notificationTitle, {
        body: notificationBody,
        icon: '/icon512_maskable.png',
        badge: '/icon512_maskable.png',
        tag: orderId || 'new-order',         // Prevents duplicate notifications for same order
        renotify: true,                       // Vibrates even if tag matches
        requireInteraction: true,             // Stays on screen until dismissed
        vibrate: [500, 200, 500, 200, 1000],
        data: { url, orderId },
        actions: [
          { action: 'view', title: '👀 View Order' },
          { action: 'dismiss', title: '✕ Dismiss' },
        ],
      });
    });
  } catch (e) {
    console.error('[firebase-messaging-sw.js] Messaging setup error:', e);
  }
}

// Run setup after a tick so firebase.apps is populated
setTimeout(setupMessaging, 100);

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/admin/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Focus existing admin tab if open
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
