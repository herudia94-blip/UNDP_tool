var CACHE_NAME = 'undp-field-v1';
var STATIC_ASSETS = [
    './',
    './index.html',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('fetch', function(e) {
    var url = e.request.url;

    // Cache map tiles from OpenStreetMap
    if (url.includes('tile.openstreetmap.org')) {
        e.respondWith(
            caches.open('undp-map-tiles').then(function(cache) {
                return cache.match(e.request).then(function(cached) {
                    if (cached) return cached;
                    return fetch(e.request).then(function(response) {
                        cache.put(e.request, response.clone());
                        return response;
                    }).catch(function() {
                        return cached;
                    });
                });
            })
        );
        return;
    }

    // For everything else, try network first, fall back to cache
    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request);
        })
    );
});