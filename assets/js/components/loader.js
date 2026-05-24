import { $ } from '../utils.js';

export function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader')?.classList.add('hidden'), 1800);
  });
}
