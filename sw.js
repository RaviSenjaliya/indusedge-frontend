
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {
    title: 'IndusEdge Update',
    body: 'New technical specifications are available.',
    icon: '/icon.png'
  };

  const options = {
    body: data.body,
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/1087/1087080.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/1087/1087080.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {action: 'explore', title: 'View Catalog'},
      {action: 'close', title: 'Close'}
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#/products')
    );
  }
});
