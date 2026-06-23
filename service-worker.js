const CACHE = "vita-one-helenica-1";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./config.js", "./app.js",
  "./manifest.webmanifest", "./assets/vita-icon.svg", "./assets/vita-one-logo.svg",
  "./assets/frieze-meander.svg", "./assets/ionic-column-fragment.svg", "./assets/classical-bust.svg",
  "./assets/vita-icon-192.png", "./assets/vita-icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => null));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => null);
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "VITA", body: "Tienes algo pendiente.", target: "hoy", tag: "vita" };
  try { data = { ...data, ...event.data.json() }; } catch { if (event.data) data.body = event.data.text(); }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "./assets/vita-icon-192.png",
    badge: "./assets/vita-icon-192.png",
    tag: data.tag,
    renotify: true,
    data: { url: `./#${data.target || "hoy"}` }
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "./#hoy";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) {
      client.navigate(url);
      return client.focus();
    }
    return clients.openWindow(url);
  }));
});
