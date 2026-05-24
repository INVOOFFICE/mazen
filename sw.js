const CACHE_NAME = 'mazen-chef-cache-v6';
const ASSETS = [
  './',
  './index.html',
  './menu.html',
  './manifest.json',
  './robots.txt',
  './sitemap.xml',
  './llms.txt',
  './assets/css/main.css?v=3',
  './assets/css/components.css?v=4',
  './assets/css/responsive.css?v=4',
  './assets/css/menu.css?v=4',
  './assets/js/app.js?v=3',
  './assets/js/menu.js?v=2',
  './assets/js/pwa-register.js',
  './assets/js/utils.js',
  './assets/js/config/app-config.js',
  './assets/js/components/pwa.js',
  './assets/js/components/loader.js',
  './assets/js/components/navigation.js',
  './assets/js/components/reveal.js',
  './assets/js/components/lightbox.js',
  './assets/js/components/video-reviews.js',
  './assets/js/components/reservation.js',
  './assets/js/components/datepicker.js',
  './assets/js/components/menu-preview.js',
  './assets/images/logo.png',
  './assets/images/pwa.jpeg',
  './assets/images/icons/pwa-192.png',
  './assets/images/icons/pwa-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('mazen-chef-cache-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          const requestUrl = new URL(event.request.url);
          if (requestUrl.origin === self.location.origin && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return Response.error();
        });
    })
  );
});
