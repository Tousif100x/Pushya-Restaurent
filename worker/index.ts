// Custom PWA Service Worker extension for Pushya Planet
declare const importScripts: any;
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Native push listener for background notifications when app is closed / phone is locked
self.addEventListener('push', function(event: any) {
  console.log('[SW worker/index.ts] Native push event received:', event);

  let title = '🔔 New Order Received!';
  let body = 'You have a new order pending. Tap to view.';
  let url = '/admin/dashboard';
  let orderId = '';

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.notification?.title || payload.data?.title || payload.title || title;
      body = payload.notification?.body || payload.data?.body || payload.body || body;
      url = payload.data?.url || payload.url || url;
      orderId = payload.data?.orderId || '';
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: '/icon512_maskable.png',
    badge: '/icon512_maskable.png',
    tag: orderId || 'new-order-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    vibrate: [500, 200, 500, 200, 1000],
    data: { url: url, orderId: orderId },
    actions: [
      { action: 'view', title: '👀 View Order' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ]
  };

  event.waitUntil((self as any).registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', function(event: any) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/admin/dashboard';

  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients: any[]) {
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      return (self as any).clients.openWindow(url);
    })
  );
});
