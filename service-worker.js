self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('meta-pwa-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/templates/index.html',
                '/static/style.css',
                '/static/script.js',
                '/manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
