import { initPwa } from './components/pwa.js';
import { initLoader } from './components/loader.js';
import { initNavigation } from './components/navigation.js';
import { initReveal } from './components/reveal.js';
import { initLightbox } from './components/lightbox.js';
import { initVideoReviews } from './components/video-reviews.js';
import { initReservationForm } from './components/reservation.js';
import { initDatepicker } from './components/datepicker.js';
import { initMenuFullEmbed } from './components/menu-full-embed.js';

document.addEventListener('DOMContentLoaded', () => {
  initPwa();
  initLoader();
  initNavigation();
  initReveal();
  initLightbox();
  initVideoReviews();
  initReservationForm();
  initDatepicker();
  initMenuFullEmbed();
});
