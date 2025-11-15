// index.js - control del contador y utilidades mínimas
// Fecha oficial de las Elecciones Generales del Perú 2026 (ajustable)
const ELECTION_ISO = '2026-04-12T07:00:00-05:00';
const TARGET = new Date(ELECTION_ISO);

function addMonths(date, months) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) d.setDate(0);
  return d;
}

function updateCountdownIndex() {  
  const now = new Date();
  if (isNaN(TARGET.getTime())) return;
  if (now >= TARGET) {
    const el = document.getElementById('countdown');
    if (el) el.innerText = '¡Día de las Elecciones!';
    return;
  }

  let months = (TARGET.getFullYear() - now.getFullYear()) * 12 + (TARGET.getMonth() - now.getMonth());
  let anchor = addMonths(now, months);
  if (anchor > TARGET) { months -= 1; anchor = addMonths(now, months); }
  let remainder = TARGET.getTime() - anchor.getTime();
  if (remainder < 0) remainder = 0;

  const MS_DAY = 24*60*60*1000;
  const MS_HOUR = 60*60*1000;
  const MS_MIN = 60*1000;

  const days = Math.floor(remainder / MS_DAY);
  remainder -= days * MS_DAY;
  const hours = Math.floor(remainder / MS_HOUR);
  remainder -= hours * MS_HOUR;
  const minutes = Math.floor(remainder / MS_MIN);
  remainder -= minutes * MS_MIN;
  

  const monthsEl = document.getElementById('months');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (monthsEl) monthsEl.textContent = String(months);
  if (daysEl) daysEl.textContent = String(days);
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2,'0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2,'0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2,'0');
}

// Ejecutar inmediatamente y cada segundo
updateCountdownIndex();
setInterval(updateCountdownIndex, 1000);
