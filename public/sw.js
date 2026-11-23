const CACHE_NAME = 'luminescent-cache-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install Event - Caching App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ONLY handle http/https requests, skip extensions, data/blob URLs, chrome:// etc.
  if (!url.protocol.startsWith('http')) return;

  // Skip caching for Google AI Studio API requests
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Strategy 1: Network-First (with Cache Fallback) for HTML document/navigation requests.
  // This ensures users always get the latest index.html pointing to latest hashed assets.
  if (event.request.mode === 'navigate' || 
      (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, fallback to cached index.html
          return caches.match('./index.html') || caches.match('/') || caches.match('./');
        })
    );
    return;
  }

  // Strategy 2: Cache-First / Stale-While-Revalidate for static resources (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
        }).catch(() => {/* Ignore network error when offline */});
        
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache new static resources dynamically
        if (networkResponse.status === 200 && (
          url.origin === self.location.origin && 
          !url.pathname.includes('/node_modules/')
        )) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
