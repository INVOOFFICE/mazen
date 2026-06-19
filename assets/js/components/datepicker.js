import { APP_CONFIG } from '../config/app-config.js';
import { $, padNumber } from '../utils.js';

export function initDatepicker() {
  const display = $('#datepickerDisplay');
  const dropdown = $('#datepickerDropdown');
  const hiddenInput = $('#reservationDateValue');
  const displayText = $('#dpDisplayText');
  const monthYear = $('#dpMonthYear');
  const daysGrid = $('#dpDays');
  const prevBtn = $('#dpPrevBtn');
  const nextBtn = $('#dpNextBtn');
  const wrapper = $('#datepickerWrap');
  if (!display || !dropdown || !hiddenInput || !displayText || !monthYear || !daysGrid || !prevBtn || !nextBtn || !wrapper) return;

  const months = APP_CONFIG.datepicker.months;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selected = null;

  const formatDisplay = (date) => `${months[date.getMonth()]} ${padNumber(date.getDate())}, ${date.getFullYear()}`;
  const close = () => {
    dropdown.classList.remove('open');
    display.classList.remove('open');
    display.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    dropdown.classList.add('open');
    display.classList.add('open');
    display.setAttribute('aria-expanded', 'true');
    renderCalendar();
  };

  function renderCalendar() {
    monthYear.textContent = `${months[viewMonth]} ${viewYear}`;
    daysGrid.innerHTML = '';
    const first = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    for (let i = 0; i < first; i++) {
      const day = document.createElement('span');
      day.className = 'dp-day other-month empty';
      day.textContent = daysInPrev - first + 1 + i;
      daysGrid.appendChild(day);
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const date = new Date(viewYear, viewMonth, dayNumber);
      const day = document.createElement('span');
      day.className = 'dp-day';
      day.textContent = dayNumber;
      if (date < today) day.classList.add('disabled');
      if (date.getTime() === today.getTime()) day.classList.add('today');
      if (selected && date.getTime() === selected.getTime()) day.classList.add('selected');
      if (!day.classList.contains('disabled')) {
        day.addEventListener('click', () => {
          selected = date;
          hiddenInput.value = `${viewYear}-${padNumber(viewMonth + 1)}-${padNumber(dayNumber)}`;
          displayText.textContent = formatDisplay(date);
          displayText.className = 'dp-value';
          close();
          renderCalendar();
        });
      }
      daysGrid.appendChild(day);
    }

    const total = first + daysInMonth;
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 1; i <= remaining; i++) {
      const day = document.createElement('span');
      day.className = 'dp-day other-month empty';
      day.textContent = i;
      daysGrid.appendChild(day);
    }
  }

  display.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.classList.contains('open') ? close() : open();
  });
  display.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dropdown.classList.contains('open') ? close() : open();
    }
    if (event.key === 'Escape') close();
  });
  prevBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  });
  nextBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  });
  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target)) close();
  });

  renderCalendar();
}

export function getSelectedDate() {
  const input = document.getElementById('reservationDateValue');
  return input ? input.value : '';
}

export function resetDatepicker() {
  const displayText = document.getElementById('dpDisplayText');
  const hiddenInput = document.getElementById('reservationDateValue');
  if (displayText) {
    displayText.textContent = 'Select a date';
    displayText.className = 'dp-placeholder';
  }
  if (hiddenInput) hiddenInput.value = '';
}
