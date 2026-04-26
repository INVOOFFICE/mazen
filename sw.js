const CACHE_NAME = 'mazen-chef-cache-v1';
const ASSETS = [
  '/mazen/',
  '/mazen/index.html',
  '/mazen/manifest.json',
  '/mazen/logo.png',
  '/mazen/pwa.jpeg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
