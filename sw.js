var CACHE_NAME = 'aquaservis-v2';
var urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css?v=13',
    '/css/hero.css?v=13',
    '/css/pages.css?v=13',
    '/css/gallery.css?v=13',
    '/css/cookies.css?v=13',
    '/js/main.js?v=13',
    '/js/cookies.js?v=13',
    '/manifest.json'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request).then(function(response) {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;
                var responseToCache = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        })
    );
});
