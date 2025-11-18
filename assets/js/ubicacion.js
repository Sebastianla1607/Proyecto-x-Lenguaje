// Frontend/assets/js/ubicacion.js
// Intenta: API remota -> ../assets/data/locales.json -> builtin fallback
const UBICACION_REMOTE = 'https://api-nodepost-production.up.railway.app/local';
const UBICACION_LOCAL_JSON = '../assets/data/locales.json';
const UBICACION_FALLBACK = [
  {
    id: 1,
    nombre: 'Colegio José Antonio Encinas',
    direccion: 'Av. Universitaria 3000',
    distrito: 'Los Olivos',
    provincia: 'Lima',
    region: 'Lima',
    lat: -11.973,
    lon: -77.068,
    created_at: '2025-11-15T07:18:45.682Z'
  },
  {
    id: 2,
    nombre: 'Colegio Bartolomé Herrera',
    direccion: 'Av. La Marina 1500',
    distrito: 'San Miguel',
    provincia: 'Lima',
    region: 'Lima',
    lat: -12.084,
    lon: -77.07,
    created_at: '2025-11-15T07:18:45.682Z'
  }
];

let map, markersLayer, routeLine, userMarker;
let highlightLayer;

async function tryFetchJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    if (Array.isArray(j)) return j;
    if (j && Array.isArray(j.data)) return j.data;
    return null;
  } catch (err) {
    console.debug('tryFetchJson failed for', url, err && err.message ? err.message : err);
    return null;
  }
}

function ensureMap() {
  if (map) return;
  // Valor por defecto: Lima
  try {
    map = L.map('map', { zoomControl: true }).setView([-12.0464, -77.0428], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  } catch (e) {
    console.warn('Leaflet no pudo inicializarse:', e);
  }
}

function clearRoute() {
  if (routeLine) {
    try { map.removeLayer(routeLine); } catch(e){}
    routeLine = null;
  }
}

function renderLocations(list) {
  const container = document.getElementById('locationsList');
  container.innerHTML = '';
  ensureMap();
  if (markersLayer) markersLayer.clearLayers();

  if (!list || list.length === 0) {
    container.innerHTML = '<p class="text-sm text-secondary-text-light dark:text-secondary-text-dark">No hay locales disponibles.</p>';
    return;
  }

  list.forEach(loc => {
    const card = document.createElement('div');
    card.className = 'rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 shadow-sm cursor-pointer';
    const name = document.createElement('h3');
    name.className = 'text-sm font-semibold text-text-light dark:text-text-dark';
    name.textContent = loc.nombre || loc.name || 'Local sin nombre';
    const addr = document.createElement('p');
    addr.className = 'text-xs text-secondary-text-light dark:text-secondary-text-dark mt-1';
    addr.textContent = loc.direccion || loc.address || '';
    const meta = document.createElement('p');
    meta.className = 'text-xs text-secondary-text-light dark:text-secondary-text-dark mt-1';
    meta.textContent = `${loc.distrito || loc.district || ''} · ${loc.provincia || ''} · ${loc.region || ''}`;

    const actions = document.createElement('div');
    actions.className = 'mt-3 flex gap-2';
    const maps = document.createElement('a');
    maps.className = 'text-xs px-3 py-1 bg-primary/10 text-primary rounded-full';
    maps.target = '_blank';
    maps.rel = 'noopener noreferrer';
    const lat = loc.lat || loc.latitude || loc.latitud;
    const lon = loc.lon || loc.longitude || loc.longitud || loc.lng;
    if (lat && lon) {
      maps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lon)}`;
      maps.textContent = 'Abrir en Maps';
    } else {
      maps.href = '#';
      maps.textContent = 'Sin coordenadas';
      maps.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const btnView = document.createElement('button');
    btnView.className = 'text-xs px-3 py-1 border border-border-light rounded-full';
    btnView.textContent = 'Ver en mapa';

    actions.appendChild(btnView);
    actions.appendChild(maps);

    card.appendChild(name);
    card.appendChild(addr);
    card.appendChild(meta);
    card.appendChild(actions);

    card.addEventListener('click', () => selectLocationOnMap({ lat, lon, title: name.textContent }));
    btnView.addEventListener('click', (ev) => { ev.stopPropagation(); selectLocationOnMap({ lat, lon, title: name.textContent }); });

    container.appendChild(card);

    // marker
    if (lat && lon && markersLayer) {
      try {
        const m = L.marker([lat, lon]).addTo(markersLayer).bindPopup(`<strong>${(loc.nombre||loc.name)}</strong><br>${loc.direccion || ''}`);
        m.on('click', () => {
          selectLocationOnMap({ lat, lon, title: loc.nombre || loc.name });
        });
      } catch (e) {
        console.debug('marker create failed', e);
      }
    }
  });
}

function setStatus(source) {
  const el = document.getElementById('loc-status');
  if (!el) return;
  el.textContent = `Fuente: ${source} · ${new Date().toLocaleString()}`;
}

function selectLocationOnMap({ lat, lon, title }) {
  if (!map) return;
  if (!lat || !lon) return alert('Coordenadas no disponibles para este local');
  clearRoute();
  try {
    map.setView([lat, lon], 16);
    // add a highlighted marker for the selected target
    try {
      if (!highlightLayer) highlightLayer = L.layerGroup().addTo(map);
      highlightLayer.clearLayers();
      const circle = L.circleMarker([lat, lon], { radius: 8, color: '#ff6f00', fillColor: '#ffcc66', fillOpacity: 0.9 }).addTo(highlightLayer);
      circle.bindPopup(`<strong>${title || 'Destino'}</strong>`).openPopup();
    } catch(e) {
      console.debug('highlight marker error', e);
    }
    if (userMarker) userMarker.addTo(map);
    routeLine = null;
    // intentar geolocalizar para dibujar ruta simple
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const start = [pos.coords.latitude, pos.coords.longitude];
        const end = [lat, lon];
        if (routeLine) try { map.removeLayer(routeLine); } catch(e){}
        routeLine = L.polyline([start, end], { color: 'var(--tw-color-primary, #29B6F6)' , weight: 3, dashArray: '5,8' }).addTo(map);
        const bounds = L.latLngBounds([start, end]);
        map.fitBounds(bounds, { padding: [60, 60] });
      }, () => {
        // si falla geolocalización, solo centrar
        map.setView([lat, lon], 16);
        try { if (highlightLayer) highlightLayer.eachLayer(l => l.openPopup && l.openPopup()); } catch(e){}
      }, { maximumAge: 60000, timeout: 5000 });
    }
    setStatus(`seleccionado: ${title}`);
  } catch (e) {
    console.warn('selectLocationOnMap error', e);
  }
}

function applySearch(list) {
  const input = document.getElementById('loc-search');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    if (!term) {
      renderLocations(list);
      return;
    }
    const filtered = list.filter(it => ((it.nombre || it.name || '') + ' ' + (it.distrito || it.district || '') + ' ' + (it.direccion || it.address || '')).toString().toLowerCase().includes(term));
    renderLocations(filtered);
  });
}

function processInitialParams(list) {
  try {
    const params = new URLSearchParams(window.location.search);
    const plat = params.get('lat');
    const plon = params.get('lon') || params.get('lng');
    const query = params.get('query') || params.get('q');
    const title = params.get('title') || params.get('nombre');
    if (plat && plon) {
      const lat = parseFloat(plat);
      const lon = parseFloat(plon);
      if (!isNaN(lat) && !isNaN(lon)) {
        // center map on provided coordinates
        selectLocationOnMap({ lat, lon, title: title || 'Ubicación' });
        return;
      }
    }
    if (query && Array.isArray(list) && list.length) {
      const term = query.toString().toLowerCase();
      const found = list.find(l => (((l.nombre||l.name||'') + ' ' + (l.direccion||l.address||'')).toString().toLowerCase().includes(term)));
      if (found) {
        const lat = found.lat || found.latitude || found.latitud;
        const lon = found.lon || found.longitude || found.longitud || found.lng;
        if (lat && lon) {
          selectLocationOnMap({ lat: parseFloat(lat), lon: parseFloat(lon), title: found.nombre || found.name || query });
          return;
        }
        // if found but no coords, populate search input so user can see the card
        const input = document.getElementById('loc-search');
        if (input) {
          input.value = query;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else {
        const input = document.getElementById('loc-search');
        if (input) {
          input.value = query;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  } catch (e) {
    console.debug('processInitialParams error', e);
  }
}

async function loadAndRender() {
  let list = null;
  let source = 'fallback';

  ensureMap();

  // 1) Remote API
  list = await tryFetchJson(UBICACION_REMOTE);
  if (Array.isArray(list) && list.length) {
    source = 'api (remota)';
    console.info('Ubicacion: cargado desde API remota');
    renderLocations(list);
    setStatus(source);
    applySearch(list);
    processInitialParams(list);
    return;
  }

  // 2) local JSON
  list = await tryFetchJson(UBICACION_LOCAL_JSON);
  if (Array.isArray(list) && list.length) {
    source = 'assets/locales.json';
    console.info('Ubicacion: cargado desde JSON local');
    renderLocations(list);
    setStatus(source);
    applySearch(list);
    processInitialParams(list);
    return;
  }

  // 3) fallback builtin
  list = UBICACION_FALLBACK;
  source = 'fallback incorporado';
  console.info('Ubicacion: usando fallback incorporado');
  renderLocations(list);
  setStatus(source);
  applySearch(list);
  processInitialParams(list);
}

// inicializa cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAndRender);
} else {
  loadAndRender();
}
