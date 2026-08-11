importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Synchronous Firebase initialization for service worker
const firebaseConfig = {
  apiKey: "AIzaSyBcEXNEVL_H1u5jeb72hw9hL_n00J24pC0",
  authDomain: "pushya-restaurent.firebaseapp.com",
  projectId: "pushya-restaurent",
  storageBucket: "pushya-restaurent.firebasestorage.app",
  messagingSenderId: "212682055583",
  appId: "1:212682055583:web:27a63e16cd8157880ae7aa",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Native push handler — displays notification on locked phone screen & closed app
self.addEventListener('push', function(event) {
  console.log('[firebase-messaging-sw.js] Native push event received:', event);

  let title = '🔔 New Order Received!';
  let body = 'You have a new order pending. Tap to view.';
  let url = '/admin/dashboard';
  let orderId = '';
  let type = 'new_order'; // new_order | pending_reminder | order_update

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.notification?.title || payload.data?.title || payload.title || title;
      body  = payload.notification?.body  || payload.data?.body  || payload.body  || body;
      url   = payload.data?.url  || payload.url  || url;
      orderId = payload.data?.orderId || '';
      type  = payload.data?.type || type;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  // Use a stable tag for reminders so they REPLACE the previous notification
  const tag = type === 'pending_reminder'
    ? 'pending-order-reminder'
    : (orderId || 'order-' + Date.now());

  const options = {
    body: body,
    icon: '/app-icon-192.png',
    badge: '/app-icon-192.png',
    tag: tag,
    renotify: true,          // re-notify even if same tag (makes phone buzz again)
    requireInteraction: true, // stays on screen until dismissed
    vibrate: [500, 200, 500, 200, 1000],
    silent: false,
    data: { url: url, orderId: orderId, type: type },
    actions: [
      { action: 'view',    title: '👀 Open Dashboard' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/admin/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Focus existing admin tab if already open
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
