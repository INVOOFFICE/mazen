export function registerServiceWorker(path = 'sw.js') {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(path).catch((err) => console.log('SW failed: ', err));
  });
}
