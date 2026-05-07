const CACHE_NAME = 'gld-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop old caches from previous SW versions
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await clients.claim();
    })(),
  );
});

const isCacheable = (request) => {
  if (request.method !== 'GET') return false;
  const url = request.url;
  // Skip extension URLs, blob:, data:, chrome:// — these can't be cached
  if (!url.startsWith('http')) return false;
  if (url.startsWith('chrome-extension://')) return false;
  // Skip cross-origin RPC / wallet calls — they fail opaque-mode caching
  return true;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!isCacheable(request)) return; // Let the browser handle it normally

  // Network-first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request)),
    );
    return;
  }

  // Cache-first for static assets, with safe put()
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only cache real successful basic responses (not opaque/redirect/error)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        // Best-effort cache write — never throw on quota / storage issues
        caches.open(CACHE_NAME)
          .then((cache) => cache.put(request, clone))
          .catch(() => { /* ignore quota / cache-corruption errors */ });
        return response;
      });
    }),
  );
});
