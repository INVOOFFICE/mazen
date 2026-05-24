export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export function setBodyScrollLocked(isLocked) {
  document.body.style.overflow = isLocked ? 'hidden' : '';
}

export function padNumber(value) {
  return String(value).padStart(2, '0');
}

export function formatDisplayDate(date, locale = 'en-GB') {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
