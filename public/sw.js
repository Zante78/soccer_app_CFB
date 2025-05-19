// Service Worker für Push-Benachrichtigungen
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/notification.png',
    badge: '/icons/badge.png',
    data: data.data,
    actions: data.actions,
    tag: data.tag,
    renotify: data.renotify,
    requireInteraction: data.requireInteraction
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action) {
    // Handle notification action clicks
    const actionData = event.notification.data?.actions?.[event.action];
    if (actionData?.url) {
      clients.openWindow(actionData.url);
    }
  } else {
    // Handle notification click
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open a new one
        return clients.openWindow(urlToOpen);
      })
    );
  }
});