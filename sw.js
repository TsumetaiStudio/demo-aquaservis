var CACHE_NAME = 'cistimebazeny-v5';
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
    '/pool-icon.svg'
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
    // Force fresh favicon/manifest — never serve from cache
    if (event.request.url.indexOf('favicon') !== -1 ||
        event.request.url.indexOf('pool-icon') !== -1 ||
        event.request.url.indexOf('manifest') !== -1) {
        event.respondWith(fetch(event.request));
        return;
    }
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
                cacheNames.map(function(name) {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});
