const CACHE_NAME = 'casadomotica-v1';
const urlsToCache = [
  '/casadomotica-app/index.html',
  '/casadomotica-app/manifest.json',
  '/casadomotica-app/icon-192.png',
  '/casadomotica-app/icon-512.png',
  '/casadomotica-app/sw.js'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Pulizia vecchia cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch degli eventi
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Restituisce la risorsa dalla cache se disponibile, altrimenti la recupera dalla rete
        return response || fetch(event.request).then((fetchResponse) => {
          // Clona la risposta per salvarla nella cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }).catch(() => {
          // In caso di errore di rete, restituisce una pagina offline (se definita)
          if (event.request.mode === 'navigate') {
            return caches.match('/casadomotica-app/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});