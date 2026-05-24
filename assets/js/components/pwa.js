import { APP_CONFIG } from '../config/app-config.js';
import { $ } from '../utils.js';

let deferredPrompt;

export function initPwa() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(APP_CONFIG.serviceWorkerPath).catch((err) => console.log('SW failed: ', err));
    });
  }

  const banner = $('#pwa-banner');
  const installBtn = $('#pwa-install-btn');
  const closeBtn = $('#pwa-close-btn');
  if (!banner || !installBtn || !closeBtn) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    setTimeout(() => {
      banner.classList.add('show');
      setTimeout(() => banner.classList.remove('show'), 10000);
    }, 2000);
  });

  installBtn.addEventListener('click', async () => {
    banner.classList.remove('show');
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  closeBtn.addEventListener('click', () => banner.classList.remove('show'));
}
