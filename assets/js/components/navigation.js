import { $, $$, setBodyScrollLocked } from '../utils.js';

export function initNavigation() {
  const navbar = $('#navbar');
  const backTop = $('#back-top');
  const floatCta = $('.floating-cta');
  const mobileMenu = $('#mobileMenu');
  const hamburger = $('#hamburger');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 80);
    const visible = window.scrollY > 400;
    backTop?.classList.toggle('visible', visible);
    floatCta?.classList.toggle('visible', visible);
  });

  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
    hamburger.classList.toggle('open');
    setBodyScrollLocked(mobileMenu?.classList.contains('open'));
  });

  $$('#mobileMenu a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      hamburger?.classList.remove('open');
      setBodyScrollLocked(false);
    });
  });
}
