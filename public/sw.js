const STATIC_CACHE = 'on-this-day-static-v1';
const API_CACHE = 'on-this-day-api-v1';
const IMAGE_CACHE = 'on-this-day-images-v1';
const MAX_API_CACHE_ITEMS = 80;
const MAX_IMAGE_CACHE_ITEMS = 160;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, API_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isCacheableApiRequest = (url) =>
  url.origin === 'https://api.wikimedia.org' ||
  (url.origin.endsWith('.wikipedia.org') &&
    (url.pathname.startsWith('/api/rest_v1/') ||
      url.pathname === '/w/api.php'));

const isCacheableImageRequest = (url) =>
  url.origin === 'https://upload.wikimedia.org';

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trimCache(cacheName, cacheName === IMAGE_CACHE ? MAX_IMAGE_CACHE_ITEMS : MAX_API_CACHE_ITEMS);
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
};

const trimCache = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;

  await Promise.all(keys.slice(0, keys.length - maxItems).map((key) => cache.delete(key)));
};

const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('Network request failed');
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isCacheableImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  if (isCacheableApiRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
        return;
      }
      self.clients.openWindow('/');
    }),
  );
});
