const CACHE_NAME = 'mazen-chef-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './menu.html',
  './manifest.json',
  './assets/css/main.css?v=3',
  './assets/css/components.css?v=3',
  './assets/css/responsive.css?v=3',
  './assets/css/menu.css?v=3',
  './assets/js/app.js?v=2',
  './assets/js/menu.js?v=2',
  './assets/images/logo.png',
  './assets/images/pwa.jpeg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
