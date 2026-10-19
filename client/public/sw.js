/**
 * Pokémon GO Dex Tracker - Service Worker
 * Provides offline caching, lightning-fast app shell loading, and native-app feel.
 */

const CACHE_NAME = 'pogo-dex-v3';
// Content-hashed build output (/assets/*): immutable, cache-first, trimmed so old deploys don't pile up
const ASSET_CACHE = 'pogo-dex-assets-v1';
const MAX_ASSET_ENTRIES = 40;
// Remote Pokémon sprites: cache-first so the dex keeps its images offline
const SPRITE_CACHE = 'pogo-dex-sprites-v1';
const MAX_SPRITE_ENTRIES = 4000;
const SPRITE_HOSTS = ['raw.githubusercontent.com'];
const KNOWN_CACHES = [CACHE_NAME, ASSET_CACHE, SPRITE_CACHE];

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  // cache.keys() is in insertion order, so drop the oldest entries first
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
}

async function cacheFirst(request, cacheName, maxEntries, fetchRequest = request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(fetchRequest);
  if (response && response.ok) {
    await cache.put(request, response.clone());
    trimCache(cacheName, maxEntries);
  }
  return response;
}

// Core assets to pre-cache immediately during installation
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './favicon.ico',
  './icons/apple-touch-icon.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-maskable-192x192.png',
  './icons/icon-maskable-512x512.png',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !KNOWN_CACHES.includes(name))
          .map((name) => {
            console.log('[SW] Deleting legacy cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore non-http(s) requests (e.g. extensions)
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation requests (HTML page): Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('./') || await caches.match('./index.html');
          if (fallback) return fallback;
          return new Response('Offline - Pokémon GO Dex Tracker is currently offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. API calls: Network-first
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Remote sprites: request with CORS (GitHub raw serves ACAO: *) so the response is
  //    cacheable without opaque-response quota padding; fall back to a plain request
  if (SPRITE_HOSTS.includes(url.hostname)) {
    const corsRequest = new Request(request.url, { mode: 'cors', credentials: 'omit' });
    event.respondWith(
      cacheFirst(request, SPRITE_CACHE, MAX_SPRITE_ENTRIES, corsRequest).catch(() => fetch(request))
    );
    return;
  }

  // Ignore other cross-origin requests
  if (url.origin !== self.location.origin) return;

  // 4. Hashed build assets never change: Cache-first
  if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, MAX_ASSET_ENTRIES));
    return;
  }

  // 5. Other static files (icons, costume images, manifest): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
