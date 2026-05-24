import { APP_CONFIG } from '../config/app-config.js';
import { $ } from '../utils.js';

function setHeroBackground(target, imagePath) {
  target.style.backgroundImage = `${APP_CONFIG.hero.overlay}, url('${imagePath}')`;
}

export function initHeroSlider() {
  const primary = $('.hero-bg-primary');
  const secondary = $('.hero-bg-secondary');
  const images = APP_CONFIG.hero.images;
  if (!primary || !secondary || !images.length) return;

  let activeIndex = 0;
  setHeroBackground(primary, images[activeIndex]);
  if (images.length <= 1) return;

  setInterval(() => {
    const nextIndex = (activeIndex + 1) % images.length;
    setHeroBackground(secondary, images[nextIndex]);
    secondary.style.opacity = '1';
    setTimeout(() => {
      setHeroBackground(primary, images[nextIndex]);
      secondary.style.opacity = '0';
      activeIndex = nextIndex;
    }, APP_CONFIG.hero.fadeDuration);
  }, APP_CONFIG.hero.interval);
}
