const CACHE_NAME = 'bosque-sara-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './assets_juego/witch/idle.png',
  './assets_juego/witch/run.png',
  './assets_juego/witch/jump.png',
  './assets_juego/witchFinal/witchpack/blink.png',
  './assets_juego/mushroom/AnimatedMushroomRed.png',
  './assets_juego/mushroom/AnimatedMushroomBlue.png',
  './assets_juego/mushroom/AnimatedMushroomPink.png',
  './assets_juego/background/background.png',
  './assets_juego/background/middleground.png',
  './assets_juego/background/cavernas.jpg',
  './assets_juego/background/bloque.png',
  './assets_juego/background/dirt.png'
];

// Instalación: Precargar assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Peticiones: Cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache new successful GET requests
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback a index.html para navegación si está offline
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
