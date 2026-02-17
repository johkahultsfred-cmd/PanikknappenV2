const CACHE_NAME = "panikknappen-v2-shell-v1";
const APP_SHELL_FILES = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/css/portal.css",
  "/assets/js/pwa.js",
  "/assets/icons/icon.svg",
  "/assets/icons/icon-maskable.svg",
  "/assets/vendor/gsap.min.js",
  "/apps/child/index.html",
  "/apps/child/style.css",
  "/apps/child/script.js",
  "/apps/family/index.html",
  "/apps/family/style.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
