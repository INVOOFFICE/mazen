import { $, $$, setBodyScrollLocked } from '../utils.js';

function openLightbox(src) {
  const image = $('#lb-img');
  const lightbox = $('#lightbox');
  if (!image || !lightbox) return;
  image.src = src;
  lightbox.classList.add('open');
  setBodyScrollLocked(true);
}

function closeLightbox() {
  $('#lightbox')?.classList.remove('open');
  setBodyScrollLocked(false);
}

export function initLightbox() {
  const lightbox = $('#lightbox');
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  $('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  $$('[data-lightbox-src]').forEach((item) => {
    const open = () => openLightbox(item.dataset.lightboxSrc);
    item.addEventListener('click', open);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}
