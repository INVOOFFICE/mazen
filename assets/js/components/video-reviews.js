import { APP_CONFIG } from '../config/app-config.js';
import { $$ } from '../utils.js';

export function initVideoReviews() {
  const reviews = $$('.vid-review');
  const dots = $$('.vid-dot');
  if (!reviews.length || !dots.length) return;

  let activeIndex = 0;
  const goToReview = (index) => {
    reviews[activeIndex]?.classList.remove('active');
    dots[activeIndex]?.classList.remove('active');
    activeIndex = index;
    reviews[activeIndex]?.classList.add('active');
    dots[activeIndex]?.classList.add('active');
  };

  dots.forEach((dot) => {
    const select = () => goToReview(Number(dot.dataset.reviewIndex));
    dot.addEventListener('click', select);
    dot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select();
      }
    });
  });

  setInterval(() => goToReview((activeIndex + 1) % reviews.length), APP_CONFIG.videoReviews.interval);
}
