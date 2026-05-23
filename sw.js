const CACHE_NAME = 'records-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install Event - Cache Core Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Forces the waiting service worker to become active
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Takes control of open pages immediately
  );
});

// Fetch Event - Cache-First Policy with Network Fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(e.request).then((networkResponse) => {
        // Don't cache third-party CDN scripts on the fly unless you want to,
        // just return the network response safely.
        return networkResponse;
      }).catch(() => {
        // Fallback if both fail (offline lookups)
        return new Response('Network error occurred', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
