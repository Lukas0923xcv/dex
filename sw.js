/**
 * Pokémon GO Dex Tracker - Service Worker
 * Provides offline caching, lightning-fast app shell loading, and native-app feel.
 */

// v4 / assets-v2: drops caches that could contain responses of an auth proxy (e.g. authentik) on the same domain
const CACHE_NAME = 'pogo-dex-v4';
// Content-hashed build output (/assets/*): immutable, cache-first, trimmed so old deploys don't pile up
const ASSET_CACHE = 'pogo-dex-assets-v2';
const MAX_ASSET_ENTRIES = 40;
// Remote Pokémon sprites: cache-first so the dex keeps its images offline
const SPRITE_CACHE = 'pogo-dex-sprites-v1';
const MAX_SPRITE_ENTRIES = 4000;
const SPRITE_HOSTS = ['raw.githubusercontent.com'];
const KNOWN_CACHES = [CACHE_NAME, ASSET_CACHE, SPRITE_CACHE];

// Paths that belong to an authentication proxy in front of the app (authentik, Authelia, oauth2-proxy,
// Cloudflare Access). The service worker must never intercept or cache these, otherwise login pages break
// (stale scripts, cached API calls, redirects answered with the offline app shell).
const AUTH_PATH_PREFIXES = [
  '/outpost.goauthentik.io/', '/if/', '/flows/', '/static/', '/api/v3/', '/application/', '/source/', '/-/', '/ws/',
  '/oauth2/', '/cdn-cgi/', '/.well-known/'
];

function isAuthProxyPath(pathname) {
  return AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// The app's own API lives at <base>/api/<resource>; only cache successful JSON from it
function isAppApi(url) {
  return /\/api\/(?!v3\/)/.test(url.pathname);
}

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

  // Never touch an auth proxy's login flow on our own domain; let the browser handle it directly
  if (url.origin === self.location.origin && isAuthProxyPath(url.pathname)) return;

  // 1. Navigation requests (HTML page): Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache the app itself: no redirects (login), no foreign HTML
          const isAppPage = response.status === 200 && !response.redirected && response.type === 'basic';
          if (isAppPage) {
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

  // 2. API calls of the app (same origin only): Network-first
  if (url.origin === self.location.origin && isAppApi(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const isJson = (response.headers.get('content-type') || '').includes('application/json');
          if (response.status === 200 && !response.redirected && isJson) {
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
