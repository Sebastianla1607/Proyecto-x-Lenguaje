(function () {
  // Fecha de votación: 12 de abril de 2026, a las 00:00
  const votingDate = new Date(2026, 3, 12, 0, 0, 0);

  function formatNumber(n) { return String(n); }

  function updateCountdown() {
    const now = new Date();
    const monthsEl = document.getElementById('count-months');
    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minutesEl = document.getElementById('count-minutes');

    if (!monthsEl || !daysEl || !hoursEl || !minutesEl) return;

    if (now >= votingDate) {
      monthsEl.textContent = '0';
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      return;
    }

    // Calcular meses completos restantes
    let totalMonths = (votingDate.getFullYear() - now.getFullYear()) * 12 + (votingDate.getMonth() - now.getMonth());

    // Ajustar si el día actual en el "mes calculado" ya pasó respecto a la fecha de votación
    let candidate = new Date(now.getFullYear(), now.getMonth() + totalMonths, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    if (candidate > votingDate) {
      totalMonths -= 1;
      candidate = new Date(now.getFullYear(), now.getMonth() + totalMonths, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    }

    // Ahora la diferencia entre votingDate y candidate nos da días/h/m restantes
    let diff = votingDate - candidate; // ms

    const days = Math.floor(diff / (24 * 3600 * 1000));
    diff -= days * 24 * 3600 * 1000;
    const hours = Math.floor(diff / (3600 * 1000));
    diff -= hours * 3600 * 1000;
    const minutes = Math.floor(diff / (60 * 1000));

    monthsEl.textContent = formatNumber(totalMonths);
    daysEl.textContent = formatNumber(days);
    hoursEl.textContent = formatNumber(hours);
    minutesEl.textContent = formatNumber(minutes);
  }

  // Actualizar una vez al cargar y cada segundo
  document.addEventListener('DOMContentLoaded', function () {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  });

})();
