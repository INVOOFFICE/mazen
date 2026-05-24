import { $$ } from '../utils.js';

let revealObserver;

export function initReveal() {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal').forEach((element) => revealObserver.observe(element));
}

export function refreshReveal(scope = document) {
  if (!revealObserver) return;
  $$('.reveal', scope).forEach((element) => {
    element.classList.remove('visible');
    setTimeout(() => revealObserver.observe(element), 50);
  });
}
