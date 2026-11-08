const cachePrefix = 'japan-trip-2027-itinerary-';
const cacheName = cachePrefix + 'v1';
const home = new URL('./', self.registration.scope);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.add(new Request(home, {cache: 'reload'}));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(cachePrefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.mode !== 'navigate' || url.origin !== home.origin ||
      ![home.pathname, home.pathname + 'index.html'].includes(url.pathname)) return;
  event.respondWith(loadItinerary(event.request));
});

async function loadItinerary(request) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(home, response.clone()).catch(() => {});
      return response;
    }
    return await cache.match(home) || response;
  } catch {
    return await cache.match(home) || Response.error();
  }
}
