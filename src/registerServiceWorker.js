export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/minutiae/sw.js')
      .catch((error) => {
        console.warn('Minutiae service worker registration failed.', error)
      })
  })
}
