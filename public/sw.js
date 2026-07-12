const CACHE_NAME = 'minutiae-cache-v2'
const APP_ROOT = '/minutiae/'
const APP_SHELL = [
  APP_ROOT,
  '/minutiae/manifest.webmanifest',
  '/minutiae/icons/icon-192.png',
  '/minutiae/icons/icon-512.png',
  '/minutiae/icons/maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => caches.match(APP_ROOT))
      .then((response) => refreshAppShell(response))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const requestUrl = new URL(request.url)

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          await refreshAppShell(response.clone())
          return response
        })
        .catch(() => caches.match(APP_ROOT)),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response
        }

        const responseCopy = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseCopy)
        })
        return response
      })
    }),
  )
})

async function refreshAppShell(response) {
  if (!response || !response.ok) {
    return
  }

  const html = await response.clone().text()
  const assetUrls = Array.from(
    html.matchAll(/(?:src|href)=["']([^"']+)["']/g),
    (match) => new URL(match[1], self.location.origin),
  )
    .filter(
      (url) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith(`${APP_ROOT}assets/`),
    )
    .map((url) => url.href)
  const cache = await caches.open(CACHE_NAME)

  await cache.put(APP_ROOT, response)

  if (assetUrls.length > 0) {
    await cache.addAll(assetUrls)
  }

  const activeAssets = new Set(assetUrls)
  const cachedRequests = await cache.keys()
  await Promise.all(
    cachedRequests.map((cachedRequest) => {
      const cachedUrl = new URL(cachedRequest.url)
      const isOldAsset =
        cachedUrl.pathname.startsWith(`${APP_ROOT}assets/`) &&
        !activeAssets.has(cachedRequest.url)

      return isOldAsset ? cache.delete(cachedRequest) : Promise.resolve(false)
    }),
  )
}
