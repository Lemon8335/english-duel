const CACHE = 'english-duel-v4';
const ASSETS = [
  '/english-duel/',
  '/english-duel/index.html',
  '/english-duel/manifest.json',
  '/english-duel/icon-192.png',
  '/english-duel/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(asset => fetch(asset).then(r => { if (r.ok) return c.put(asset, r); }).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for Firebase and API calls
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('anthropic') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
