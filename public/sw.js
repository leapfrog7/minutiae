const CACHE_NAME = 'minutiae-cache-v1'
const APP_SHELL = [
  '/minutiae/',
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
        .then((response) => {
          const responseCopy = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/minutiae/', responseCopy)
          })
          return response
        })
        .catch(() => caches.match('/minutiae/')),
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
