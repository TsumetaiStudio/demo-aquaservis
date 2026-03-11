var CACHE_NAME = 'cistimebazeny-v4';
var urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css?v=14',
    '/css/hero.css?v=14',
    '/css/pages.css?v=14',
    '/css/gallery.css?v=14',
    '/css/cookies.css?v=14',
    '/js/main.js?v=14',
    '/js/cookies.js?v=14',
    '/manifest.json',
    '/favicon.svg?v=2'
];

self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).then(function(response) {
            if (response && response.status === 200 && response.type === 'basic') {
                var responseToCache = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
        }).catch(function() {
            return caches.match(event.request);
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
        }).then(function() {
            return self.clients.claim();
        })
    );
});
