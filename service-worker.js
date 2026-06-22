const CACHE_NAME = 'vita-static-v2-1-0';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './config.js',
  './app.js',
  './manifest.webmanifest',
  './assets/vita-icon.svg',
  './assets/vita-icon-192.png',
  './assets/vita-icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => null)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => null);
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
  );
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'VITA',
    body: 'Tienes un aviso pendiente.',
    target: 'hoy'
  };

  try {
    payload = {
      ...payload,
      ...event.data.json()
    };
  } catch {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const target = payload.target || 'hoy';

  event.waitUntil(
    self.registration.showNotification(payload.title || 'VITA', {
      body: payload.body || 'Tienes un aviso pendiente.',
      icon: './assets/vita-icon-192.png',
      badge: './assets/vita-icon-192.png',
      tag: payload.tag || payload.id || `vita-${Date.now()}`,
      renotify: false,
      data: {
        url: `./#${target}`,
        target
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : './#hoy';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return null;
    })
  );
});
