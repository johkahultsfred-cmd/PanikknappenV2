const CACHE_NAME = "panikknappen-v2-shell-v4";
const APP_SHELL_FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/portal.css",
  "assets/css/pwa.css",
  "assets/js/pwa.js",
  "assets/js/family-lock.js",
  "assets/icons/icon.svg",
  "assets/icons/icon-maskable.svg",
  "assets/vendor/gsap.min.js",
  "apps/child/index.html",
  "apps/child/style.css",
  "apps/child/script.js",
  "apps/family/index.html",
  "apps/family/style.css",
  "apps/family/script.js"
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") return response;
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() => null);
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "🚨 Paniklarm",
    body: "Nytt larm i familjeläget.",
    url: "/apps/family/"
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        ...payload,
        ...parsed
      };
    } catch (error) {
      // fallback till standardpayload
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/assets/icons/icon.svg",
      badge: "/assets/icons/icon-maskable.svg",
      data: {
        url: payload.url || "/apps/family/",
        incidentId: payload.incidentId || null,
        familyId: payload.familyId || null
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/apps/family/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
