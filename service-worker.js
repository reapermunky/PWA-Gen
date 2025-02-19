// service-worker.js

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('meta-pwa-cache-v1').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/static/style.css',
          '/static/script.js',
          '/manifest.json',
          '/static/templates.json'  // Ensure this path matches your repo structure
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    // Always fetch templates.json fresh to avoid caching issues
    if (event.request.url.endsWith('templates.json')) {
      event.respondWith(fetch(event.request));
      return;
    }
  
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  