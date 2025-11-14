const CACHE_NAME = 'winebuddy-cache-v1';

// List of core files to cache for offline support.  Paths are relative to the
// service worker location (`/Wine-App-Test/`).  Adjust this list whenever
// adding new entry points or critical assets.
const CORE_ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'logo.png',
  'localStorage.js'
];

// On install, pre-cache the core assets so the app can start offline.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// On activate, remove old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

// Helper to determine if a request is HTML by checking the Accept header.
function isHtmlRequest(request) {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

// Fetch handler: network-first for HTML; cache-first for other assets.
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }
  const request = event.request;
  if (isHtmlRequest(request)) {
    // For HTML, try network first to get the latest; fall back to cache
    event.respondWith(
      fetch(request).then(response => {
        const respClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
        return response;
      }).catch(() => caches.match(request))
    );
  } else {
    // For other resources, try cache first, then network
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          // Cache the fetched response for future offline use
          const respClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
          return response;
        });
      })
    );
  }
});