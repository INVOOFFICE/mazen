import { APP_CONFIG } from '../config/app-config.js';
import { $, formatDisplayDate } from '../utils.js';
import { getSelectedDate, resetDatepicker } from './datepicker.js';
import { supabase } from '../supabase-client.js';

export function initReservationForm() {
  const form = $('#reservationForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form.querySelector('input[type=text]').value.trim();
    const phone = form.querySelector('input[type=tel]').value.trim();
    const email = form.querySelector('input[type=email]').value.trim();
    const selects = form.querySelectorAll('select');
    const branch = selects[0].value;
    const time = selects[1].value;
    const guests = selects[2].value;
    const date = getSelectedDate();
    const special = form.querySelector('input[placeholder*="Allergies"]')?.value.trim() || '';

    let dateDisplay = date;
    if (date) dateDisplay = formatDisplayDate(new Date(date + 'T00:00:00'));

    const message = `🍽️ *New Table Reservation - Mazen Chef*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📧 *Email:* ${email}
🏠 *Branch:* ${branch}
📅 *Date:* ${dateDisplay}
🕐 *Time:* ${time}
👥 *Guests:* ${guests}${special ? '\n📝 *Special Requests:* ' + special : ''}

_Sent via mazenchef.ma_`;

    const buttonLabel = form.querySelector('button[type=submit] span');
    const submitButton = buttonLabel?.parentElement;
    if (buttonLabel && submitButton) {
      buttonLabel.textContent = 'Envoi en cours...';
      submitButton.style.background = '#d8b66f';
      submitButton.style.color = '#15100a';
    }

    try {
      await supabase.from('reservations').insert({
        name,
        phone,
        email,
        branch,
        date,
        time,
        guests,
        special_requests: special,
        status: 'pending',
      });
    } catch (err) {
      console.warn('Réservation non sauvegardée dans Supabase:', err.message);
    }

    setTimeout(() => {
      window.open(`https://wa.me/${APP_CONFIG.whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
      if (buttonLabel && submitButton) {
        buttonLabel.textContent = 'Confirm Reservation';
        submitButton.style.background = '';
        submitButton.style.color = '';
      }
      form.reset();
      resetDatepicker();
    }, 800);
  });
}
