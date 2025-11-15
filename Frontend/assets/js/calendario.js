/* Calendario dinámico: renderiza meses, permite navegar y filtrar por panel (todos/votantes/miembros).
   Inicializa mostrando el mes de la fecha de votación. */

(function () {
  const votingDate = new Date(2026, 3, 12); // 12 April 2026 (meses 0-indexados)
  // `current` guarda el mes visible. Inicializamos en el mes actual por defecto.
  let current = new Date();
  let currentFilter = 'todos'; // 'todos' | 'votantes' | 'miembros'

  // Eventos extraídos de las páginas originales. Ajusta/añade según necesites.
  const events = [
    // 1 Febrero: cierre de padrón — también relevante para el sorteo/miembros
     // Eventos actualizados según solicitud del usuario (reemplazan los anteriores)
     { date: '2025-12-26', title: 'Inicio: Impugnaciones y resolución de tachas a la cédula de sufragio', types: ['todos','votantes'], description: 'Inicio del período para impugnaciones y resolución de tachas a la cédula.' },
     { date: '2026-01-15', title: 'Cierre: Impugnaciones y resolución de tachas a la cédula de sufragio', types: ['todos','votantes'], description: 'Cierre del período de impugnaciones y resoluciones.' },

     // Publicación diseño de la cédula
     { date: '2026-01-12', title: 'Publicación definitiva del diseño de cédula para las Elecciones Generales 2026', types: ['todos','votantes'] },
     { date: '2026-01-22', title: 'Publicación definitiva del diseño de cédula (confirmación)', types: ['todos','votantes'] },

     // Sorteo y proceso de miembros de mesa
     { date: '2026-01-29', title: 'Sorteo de miembros de mesa', types: ['miembros'] },
     { date: '2026-01-30', title: 'Inicio: Proceso de impugnación, apelaciones y resolución de tachas a miembros de mesa', types: ['miembros'], description: 'Periodo de impugnaciones y apelaciones para miembros de mesa.' },
     { date: '2026-02-11', title: 'Cierre: Proceso de impugnación, apelaciones y resolución de tachas a miembros de mesa', types: ['miembros'] },

     // Febrero: Sorteo de ubicación y publicación de lista de miembros
     { date: '2026-02-01', title: 'Sorteo de ubicación de candidaturas o símbolos en la cédula de sufragio', types: ['todos'] },
     { date: '2026-02-15', title: 'Publicación definitiva de la lista de miembros de mesa', types: ['miembros'] },

     // Marzo: límite de retiro y 1ª jornada de capacitación
     { date: '2026-03-29', title: 'Fecha límite: Retiro y/o renuncia de listas de candidatos', types: ['todos'] },
     { date: '2026-03-29', title: '1ª jornada de capacitación a miembros de mesa para las Elecciones Generales 2026', types: ['miembros'] },

     // Abril: simulacro, 2ª jornada y día de elecciones
     { date: '2026-04-05', title: 'Simulacro del Sistema de Cómputo Electoral', types: ['miembros'] },
     { date: '2026-04-12', title: '2ª jornada de capacitación a miembros de mesa', types: ['miembros'] },
     { date: '2026-04-12', title: 'ELECCIONES GENERALES 2026', types: ['todos','votantes'], description: 'Día de Votación - Elecciones Generales 2026' }
  ];

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function formatYMD(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('mes-titulo');
    if (!grid || !title) return;

    const year = current.getFullYear();
    const month = current.getMonth();
    title.textContent = `${monthNames[month]} ${year}`;

    // Primer día del mes (0 domingo ... 6 sábado), queremos semana que inicia Lunes
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7; // convierte domingo(0) a 6, lunes(1) a 0, etc.
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Construir celdas
    let html = '';
    // vacíos por offset
    for (let i = 0; i < offset; i++) {
      html += `<div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const ymd = formatYMD(dateObj);
      const dayEvents = events.filter(e => e.date === ymd);

      // Determinar si alguna de las events coincide con el filtro activo
      let highlight = '';
      if (dayEvents.length > 0) {
        // si filtro es 'todos' mostramos todos como marcado
        if (currentFilter === 'todos') {
          // preferencia de color: miembros > votantes > default
          if (dayEvents.some(ev => ev.types.includes('miembros'))) highlight = 'bg-filter-member text-black font-semibold';
          else if (dayEvents.some(ev => ev.types.includes('votantes'))) highlight = 'bg-filter-voter text-black font-semibold';
          else highlight = 'bg-primary text-black font-semibold';
        } else {
          // Si el día tiene evento del tipo activo, se resalta
          if (dayEvents.some(ev => ev.types.includes(currentFilter))) {
            highlight = currentFilter === 'miembros' ? 'bg-filter-member text-black font-semibold' : 'bg-filter-voter text-black font-semibold';
          }
        }
      }

      // Si el día es la fecha exacta de votación, agregar clase primaria
      if (ymd === formatYMD(votingDate)) {
        highlight = 'bg-primary text-black font-semibold';
      }

      const todayYmd = formatYMD(new Date());
      const isToday = ymd === todayYmd;
      const isVotingDay = ymd === formatYMD(votingDate);

      const dotColor = dayEvents.some(ev=>ev.types.includes('miembros')) ? 'bg-filter-member' : (dayEvents.some(ev=>ev.types.includes('votantes')) ? 'bg-filter-voter' : 'bg-primary');
      const dotHtml = dayEvents.length > 0 ? `<div class="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${dotColor} ${isVotingDay ? 'now-dot' : ''}"></div>` : '';

      const extraClasses = isToday ? ' now-day' : '';

      // Incluir data-ymd para permitir selección desde panel
      html += `<div class="flex items-center justify-center" data-ymd="${ymd}">
            <div class="relative flex size-8 items-center justify-center rounded-full ${highlight || 'font-medium text-slate-700 dark:text-slate-300'}${extraClasses}">
              <span>${day}</span>
              ${dotHtml}
            </div>
          </div>`;
    }

    grid.innerHTML = html;
  }

  // Calcula el countdown hasta votingDate en meses, días, horas y minutos
  function calculateCountdown() {
    const now = new Date();
    let months = votingDate.getFullYear() - now.getFullYear();
    months = months * 12 + (votingDate.getMonth() - now.getMonth());

    let tempDate = new Date(now);
    tempDate.setMonth(tempDate.getMonth() + months);

    let days = Math.floor((votingDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      months--;
      tempDate.setMonth(tempDate.getMonth() - 1);
      days = Math.floor((votingDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const remainingMs = votingDate.getTime() - now.getTime();
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    // Actualizar DOM si existe
    const elMonths = document.getElementById('count-months');
    const elDays = document.getElementById('count-days');
    const elHours = document.getElementById('count-hours');
    const elMinutes = document.getElementById('count-minutes');
    if (elMonths) elMonths.textContent = String(Math.max(0, months)).padStart(2, '0');
    if (elDays) elDays.textContent = String(Math.max(0, days)).padStart(2, '0');
    if (elHours) elHours.textContent = String(Math.max(0, hours)).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(Math.max(0, minutes)).padStart(2, '0');
  }

  // Genera dinámicamente los panels de eventos desde el array `events`
  function renderEventPanels() {
    // Mostrar eventos próximos del mes actualmente visible, respetando el filtro activo
    const year = current.getFullYear();
    const month = current.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = `${year}-${String(month + 1).padStart(2,'0')}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`;

    // para 'todos' incluimos cualquier evento dentro del mes; además agrupamos por tipo
    const groups = { todos: [], votantes: [], miembros: [] };
    for (const ev of events.slice().sort((a,b) => a.date.localeCompare(b.date))) {
      if (ev.date < monthStart || ev.date > monthEnd) continue; // fuera del mes
      groups.todos.push(ev);
      if (Array.isArray(ev.types)) {
        if (ev.types.includes('votantes')) groups.votantes.push(ev);
        if (ev.types.includes('miembros')) groups.miembros.push(ev);
      }
    }

    // Para cada panel, renderizar solo los eventos del mes y según el filtro
    for (const key of ['todos','votantes','miembros']) {
      const container = document.getElementById('events-panel-' + key);
      if (!container) continue;
      const inner = document.createElement('div');
      inner.className = 'flex flex-col gap-3 event-list';
      if (!groups[key].length) {
        inner.innerHTML = `<p class="text-sm text-secondary-text-light dark:text-secondary-text-dark">No hay eventos para esta categoría en ${monthNames[month]}.</p>`;
        container.innerHTML = '';
        container.appendChild(inner);
        continue;
      }
      for (const ev of groups[key]) {
        const card = document.createElement('article');
        card.className = 'event-card';
        let peopleHtml = '';
        if (Array.isArray(ev.people) && ev.people.length) {
          peopleHtml = `<div class="mt-2 text-sm text-slate-700 dark:text-slate-300"><strong>Miembros:</strong><ul class="ml-4 list-disc">${ev.people.map(p => `<li>${p}</li>`).join('')}</ul></div>`;
        }
        card.innerHTML = `
          <div class="icon bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-50">
            <span class="material-symbols-outlined">${ev.icon || 'event'}</span>
          </div>
          <div class="flex-1">
            <div class="text-sm meta">${(new Date(ev.date)).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})}</div>
            <div class="title">${ev.title}</div>
            ${ev.description ? `<p class="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">${ev.description}</p>` : ''}
            ${peopleHtml}
            <div class="mt-2">
              <button class="event-action" data-evdate="${ev.date}">Ver en calendario</button>
            </div>
          </div>`;
        inner.appendChild(card);
      }
      container.innerHTML = '';
      container.appendChild(inner);
    }

    // Nota: ahora usamos delegación global en `DOMContentLoaded` para manejar los clicks
  }

  // Resaltar un día (centrar mes y aplicar clase temporal)
  function highlightDay(ymd) {
    try {
      const d = new Date(ymd);
      current = new Date(d.getFullYear(), d.getMonth(), 1);
      renderCalendar();
      // esperar a que DOM se actualice
      setTimeout(() => {
        const el = document.querySelector(`[data-ymd='${ymd}'] .relative`);
        if (el) {
          el.classList.add('highlighted-day', 'pulse-highlight');
          setTimeout(() => {
            el.classList.remove('pulse-highlight');
          }, 1400);
          // quitar highlight después de un tiempo
          setTimeout(() => { el.classList.remove('highlighted-day'); }, 4000);
        }
      }, 80);
    } catch (e) { console.warn('highlightDay error', e); }
  }

  function changeMonth(delta) {
    current = new Date(current.getFullYear(), current.getMonth() + delta, 1);
    renderCalendar();
    renderEventPanels();
  }

  // showPanel mantiene compatibilidad con botones previos
  window.showPanel = function showPanel(name) {
    // name expected: 'panel-todos' | 'panel-votantes' | 'panel-miembros'
    const map = { 'panel-todos': 'todos', 'panel-votantes': 'votantes', 'panel-miembros': 'miembros' };
    currentFilter = map[name] || 'todos';

    // Ajusta clases de botón activo
    const btns = document.getElementsByClassName('filter-btn');
    for (const b of btns) {
      b.classList.remove('bg-primary', 'text-black', 'font-semibold');
    }
    const activeBtn = document.getElementById('btn-' + name);
    if (activeBtn) activeBtn.classList.add('bg-primary', 'text-black', 'font-semibold');

    // Mostrar la sección de eventos correspondiente
    const eventsPanels = document.getElementsByClassName('events-panel');
    for (const ep of eventsPanels) {
      ep.classList.add('hidden');
    }
    const evId = 'events-panel-' + (map[name] || 'todos');
    const evTarget = document.getElementById(evId);
    if (evTarget) evTarget.classList.remove('hidden');

    // Navegación inteligente: si hay eventos para este filtro, mover el calendario
    try {
      const filterType = currentFilter;
      const today = new Date();
      const matchingDates = events
        .filter(e => Array.isArray(e.types) && e.types.includes(filterType))
        .map(e => new Date(e.date))
        .sort((a,b) => a - b);

      if (matchingDates.length) {
        // intentar elegir la próxima fecha >= hoy, si no existe elegir la primera
        let chosen = matchingDates.find(d => d >= new Date(today.getFullYear(), today.getMonth(), today.getDate()));
        if (!chosen) chosen = matchingDates[0];
        current = new Date(chosen.getFullYear(), chosen.getMonth(), 1);
      }
    } catch (e) {
      console.debug('calendar smart-nav error', e);
    }

    renderCalendar();
    renderEventPanels();
    // Aplicar clase de tema en el contenedor para cambiar paleta según filtro
    try {
      const root = document.getElementById('calendar-root');
      if (root) {
        root.classList.remove('theme-todos','theme-votantes','theme-miembros');
        const themeMap = { todos: 'theme-todos', votantes: 'theme-votantes', miembros: 'theme-miembros' };
        const theme = themeMap[currentFilter] || 'theme-todos';
        root.classList.add(theme);
      }
    } catch (e) { console.debug('theme apply error', e); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Buttons for selecting panels
    const btnTodos = document.getElementById('btn-panel-todos');
    const btnVotantes = document.getElementById('btn-panel-votantes');
    const btnMiembros = document.getElementById('btn-panel-miembros');
    if (btnTodos) btnTodos.addEventListener('click', function () { window.showPanel('panel-todos'); });
    if (btnVotantes) btnVotantes.addEventListener('click', function () { window.showPanel('panel-votantes'); });
    if (btnMiembros) btnMiembros.addEventListener('click', function () { window.showPanel('panel-miembros'); });

    // Month navigation
    const prev = document.getElementById('btn-prev-month');
    const next = document.getElementById('btn-next-month');
    if (prev) prev.addEventListener('click', function () { changeMonth(-1); });
    if (next) next.addEventListener('click', function () { changeMonth(1); });

    // Iniciar mostrando el mes actual (no navegar automáticamente al mes de votación)
    current = new Date();
    renderCalendar();
    // Renderizar panels para el mes actual y activar 'todos' visualmente sin forzar smart-nav
    renderEventPanels();
    // Activar botón 'Todos' y mostrar su panel
    const btns = document.getElementsByClassName('filter-btn');
    for (const b of btns) { b.classList.remove('bg-primary', 'text-black', 'font-semibold'); }
    if (btnTodos) btnTodos.classList.add('bg-primary', 'text-black', 'font-semibold');
    const eventsPanels = document.getElementsByClassName('events-panel');
    for (const ep of eventsPanels) { ep.classList.add('hidden'); }
    const evTarget = document.getElementById('events-panel-todos');
    if (evTarget) evTarget.classList.remove('hidden');
    // Inicializar tema visual según el filtro por defecto
    try {
      const root = document.getElementById('calendar-root');
      if (root) {
        root.classList.remove('theme-todos','theme-votantes','theme-miembros');
        root.classList.add('theme-todos');
      }
    } catch(e){ console.debug('theme init error', e); }
    // Delegación global para botones 'Ver en calendario' (evita reañadir listeners tras cada render)
    document.addEventListener('click', function(e){
      const btn = e.target.closest && e.target.closest('.event-action');
      if (!btn) return;
      const date = btn.dataset && btn.dataset.evdate;
      if (!date) return;
      highlightDay(date);
      const grid = document.getElementById('calendar-grid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    // Reloj en tiempo real y comprobación de día de votación
    function updateClock() {
      const now = new Date();
      const clockEl = document.getElementById('current-clock');
      if (clockEl) {
        const opts = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        // forzar formato en español sin AM/PM
        const s = now.toLocaleString('es-ES', { ...opts, hour12: false });
        clockEl.textContent = s.replace(/\./g, '');
      }

      // Si hoy es el día de votación, asegurarse de mostrar ese mes y refrescar resaltado
      const todayYmd = formatYMD(now);
      if (todayYmd === formatYMD(votingDate)) {
        const votingMonthStart = new Date(votingDate.getFullYear(), votingDate.getMonth(), 1);
        // Si no estamos en el mes de votación, muévelo
        if (current.getFullYear() !== votingMonthStart.getFullYear() || current.getMonth() !== votingMonthStart.getMonth()) {
          current = votingMonthStart;
          renderCalendar();
        } else {
          // Re-render para actualizar resaltado del día actual
          renderCalendar();
        }
      } else {
        // Si no es día de votación, también queremos resaltar el día actual en el calendario
        // si el mes visible es el mes actual
        if (current.getFullYear() === now.getFullYear() && current.getMonth() === now.getMonth()) {
          renderCalendar();
        }
      }
      // actualizar countdown
      try { calculateCountdown(); } catch(e){ console.debug('countdown error', e); }
      }

      // Actualiza el reloj y el calendario cada segundo
      updateClock();
      setInterval(updateClock, 1000);
  });

})();
