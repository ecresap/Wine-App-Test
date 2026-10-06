const CACHE_NAME = 'winebuddy-cache-v2';

const CORE_ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'logo.png',
  'localStorage.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames =>
        Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
      ),
      self.clients.claim()
    ])
  );
});

function isAppCodeRequest(request) {
  const url = new URL(request.url);
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html') ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/localStorage.js') ||
    url.pathname.endsWith('/manifest.json');
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  const request = event.request;

  // Network-first for app code so deployments do not remain pinned to an old
  // cached build. This never touches localStorage, where tasting data lives.
  if (isAppCodeRequest(request)) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first remains appropriate for static visual assets.
  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      })
    )
  );
});