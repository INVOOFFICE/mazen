import { $$ } from '../utils.js';
import { refreshReveal } from './reveal.js';

export function initMenuPreview() {
  $$('.menu-grid .menu-card').forEach((element, index) => {
    element.style.transitionDelay = `${index * 80}ms`;
  });

  $$('[data-pdf-placeholder]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      alert('Mazen menu PDF will be available soon!');
    });
  });

  $$('.menu-tab').forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      if (!tab) return;
      $$('.menu-tab').forEach((item) => item.classList.remove('active'));
      $$('.menu-panel').forEach((panel) => panel.classList.remove('active'));
      button.classList.add('active');
      const panel = document.getElementById(`panel-${tab}`);
      panel?.classList.add('active');
      if (panel) refreshReveal(panel);
    });
  });
}
