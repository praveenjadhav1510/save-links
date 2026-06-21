const CACHE_NAME = 'save-links-cache-v2';

// Assets to cache immediately on installation (relative to service worker location)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.jpeg',
  './favicon.svg',
  './default.svg',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Avoid caching browser extensions, Chrome developer tools, etc.
  if (!url.protocol.startsWith('http')) return;

  // Caching strategy:
  // For static JS/CSS bundles and hashed files, use Cache-First.
  // For HTML, Manifest, API queries and other pages, use Network-First to ensure updates are fetched if online.
  const isStaticAsset = 
    url.pathname.includes('/static/') || 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.css') || 
    url.pathname.endsWith('.png') || 
    url.pathname.endsWith('.jpg') || 
    url.pathname.endsWith('.jpeg') || 
    url.pathname.endsWith('.svg') || 
    url.pathname.endsWith('.ico') || 
    url.pathname.endsWith('.woff') || 
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    // Cache First, falling back to Network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse) {
            return networkResponse;
          }
          const isOpaque = networkResponse.type === 'opaque';
          if (networkResponse.status === 200 || isOpaque) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // Network First, falling back to Cache
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // If response is valid, cache it (for offline fallback) and return it
          if (networkResponse) {
            const isOpaque = networkResponse.type === 'opaque';
            if (networkResponse.status === 200 || isOpaque) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          }
          return networkResponse;
        })
        .catch(() => {
          // If network request fails (e.g. offline), try serving from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // For page navigations, fall back to index.html if offline
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            // Fallback for default.svg/favicons if offline and not in cache
            if (url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.ico') || url.pathname.endsWith('.jpeg')) {
              return caches.match('./default.svg');
            }
            return Promise.reject('no-match');
          });
        })
    );
  }
});
