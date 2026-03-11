/**
 * PAN1K KnApPen!!! — service-worker.js
 * Cache-first strategy: all assets cached on install, served offline.
 * Update: bump CACHE_VERSION to invalidate on deploy.
 */

const CACHE_VERSION = 'panik-v1.0.0';
const CACHE_NAME    = `panik-knappen-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/manifest.json',
  '/assets/image1.png',
  '/assets/image2.png',
  '/assets/image3.png',
  '/assets/image4.png',
  '/assets/image5.png',
  '/assets/image6.png',
  '/assets/image7.png',
  '/assets/image8.png',
  '/assets/image9.png',
  '/assets/image10.png',
  '/assets/image11.png',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap',
];

/* ── Install: cache all assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: remove old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('panik-knappen-') && k !== CACHE_NAME)
          .map(k  => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first, fallback to network ── */
self.addEventListener('fetch', event => {
  // Skip non-GET and cross-origin requests (except Google Fonts)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
