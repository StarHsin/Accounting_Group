// frontend/public/sw.js
const CACHE_NAME = 'group-accounting-v1';
const urlsToCache = [
  '/',
  '/Homepage',
  '/static/js/bundle.js', // 調整為你的 bundle 名稱
  '/static/css/main.css', // 調整為你的 CSS 名稱
  // 添加其他靜態資源
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});