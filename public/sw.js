// Service Worker for Push Notifications
// This handles incoming push notifications when the app is in the background

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', event => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (_e) {
      data = { title: 'V1ta Notification', body: event.data.text() };
    }
  }

  const title = data.title || 'V1ta';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.data?.notificationId || 'v1ta-notification',
    data: data.data || { url: '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: data.data?.url
      ? [
          { action: 'view', title: 'View' },
          { action: 'close', title: 'Dismiss' },
        ]
      : [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Handle action buttons
  if (event.action === 'close') {
    return;
  }

  // Navigate to the notification URL
  const urlToOpen = new URL(event.notification.data?.url || '/positions', self.location.origin)
    .href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if there's already a window open with the app
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate
          return client.focus().then(() => {
            if ('navigate' in client) {
              return client.navigate(urlToOpen);
            }
          });
        }
      }

      // Open a new window if none exist
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
