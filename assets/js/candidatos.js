 (function () {
  const API = 'https://api-nodepost-production.up.railway.app/candidatos';
  const LOCAL = '../assets/data/candidatos.json';
  const PARTIES_LOCAL = '../assets/data/partidos.json';

  const BUILTIN = [
    { id: 1, nombre: 'Keiko Fujimori', foto_url: 'https://i.postimg.cc/SRVzXT7m/pers-Keiko-Fujimori121216811183.jpg' },
    { id: 2, nombre: 'Luz Adriana Soto', foto_url: 'https://i.imgur.com/foto_luz.png' },
    { id: 3, nombre: 'Carlos Rivera Flores', foto_url: 'https://i.imgur.com/foto_carlos.png' },
    { id: 4, nombre: 'Rafael López Aliaga', foto_url: 'https://i.postimg.cc/7YFq31Bp/porky.jpg' },
    { id: 5, nombre: 'Rocío del Pilar Martínez', foto_url: 'https://i.imgur.com/foto_rocio.png' },
    { id: 6, nombre: 'Jorge Medina Rivas', foto_url: 'https://i.imgur.com/foto_jorge.png' }
  ];

  const listEl = document.getElementById('candidates-list');
  const countEl = document.getElementById('candidate-count');
  if (!listEl) return console.warn('No se encontró #candidates-list');

  listEl.innerHTML = '<p class="text-sm text-secondary-text-light dark:text-secondary-text-dark">Cargando...</p>';

  async function tryFetch(url) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      if (Array.isArray(d) && d.length > 0) return d;
      if (d && Array.isArray(d.data) && d.data.length > 0) return d.data;
      return null;
    } catch (e) {
      console.debug('fetch fail', url, e);
      return null;
    }
  }

  // Helpers
  const photoByName = {
    'rafael acuña': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCocYz-fcuWq1FYmRsiHelp7me5M8Tf27KeEsSYg8OoDnXlU_odW7MzRyEPJBzfcR1eBATUr-E6jC27d3HHfLi1DeLxXbURybKOwxuZmVePeqCq2GJT132rKRpE_HOJTIaSstPQPEGYkIwauyEYNmK6f5RQvGZ1W6nFTuTT0ELqPOXrlLvOwUENxNUoUuJhkQpXc-Ck7Gkht3mm51jCNF43r1PKKy1_3HGzIPd5asiaWWqgjt8-9udO1Qm7h39b8VMjOOqXhM3T9a0',
    'carlos benavides': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk-pnldv881l4Q5Nh3DRLToz9H86S1AHmRruhu1a_ayaOIqmAGkyxsTs-HhCEec_37bQz7uTnky7N3KKvaN1R3StEAQ0ZbA8Eb4DIvtF7ehUe7cb5ra_qDtCRNqS-wJj0Nn3BkzwvOPOGt1qyUJdaWhuuc22yruCUxxxz_2yPI5zaUHwhkCDQOYlB-KAVxd91PpqO-UIGnz56wA5Ak69Lh1H8AniqPq9qVPnKCrUY-cRvOylE-0GM5S_6l3c8D5Z3pSIukv9lrqJE'
  };

  function getPhotoFromName(name) {
    if (!name) return null;
    const key = name.toLowerCase();
    for (const k of Object.keys(photoByName)) if (key.includes(k)) return photoByName[k];
    return null;
  }

  function detectChamber(value) {
    const v = (value || '').toString().toLowerCase();
    if (!v) return '';
    if (v.includes('presid') || v.includes('presidente') || v.includes('presidencia')) return 'Presidencia';
    if (v.includes('parl') || v.includes('andino') || v.includes('parlamento')) return 'Parlamento Andino';
    if (v.includes('dip') || v.includes('diput')) return 'Cámara: Diputado(a)';
    if (v.includes('sen') || v.includes('senad')) return 'Cámara: Senado';
    if (v.includes('congres') || v.includes('congresista')) return 'Congreso';
    return '';
  }

  function badgeFromChamberText(chamberText) {
    if (!chamberText) return '';
    const t = chamberText.toString().toLowerCase();
    if (t.includes('andino') || t.includes('parl')) return 'Parl. Andino';
    if (t.includes('presid')) return 'Presidencia';
    if (t.includes('dip')) return 'Dip.';
    if (t.includes('sen')) return 'Sen.';
    if (t.includes('congres')) return 'Congreso';
    return '';
  }

  function badgeClassFromType(chamberText) {
    const t = (chamberText || '').toString().toLowerCase();
    if (t.includes('presid')) return 'bg-amber-100 text-amber-800';
    if (t.includes('andino') || t.includes('parl')) return 'bg-indigo-100 text-indigo-800';
    if (t.includes('dip')) return 'bg-green-100 text-green-800';
    if (t.includes('sen')) return 'bg-red-100 text-red-800';
    if (t.includes('congres')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  }

  // mapas de partidos
  const partiesById = {};
  const partySiglaById = {};

  function render(items) {
    // ordenar alfabéticamente por nombre antes de renderizar
    const sorted = Array.isArray(items)
      ? items.slice().sort((a, b) => {
          const an = (a.nombre || a.name || '').toString();
          const bn = (b.nombre || b.name || '').toString();
          return an.localeCompare(bn, 'es', { sensitivity: 'base' });
        })
      : [];

    const frag = document.createDocumentFragment();
    // reconstruir fragment usando lista ordenada
    for (const c of sorted) {
      const id = c.id || c.ID || c.id_candidato || '0';
      const name = c.name || c.nombre || c.nombre_completo || c.fullName || 'Sin nombre';
      let partyName = c.party || c.partido || c.affiliation || '';
      let partyId = c.partido_id || c.party_id || c.partyId || '';

      if (!partyName && (partyId || partyId === 0)) {
        const key = String(partyId);
        if (Object.prototype.hasOwnProperty.call(partiesById, key) && partiesById[key]) {
          partyName = partiesById[key];
        } else {
          partyName = '';
        }
      }

      const photo = c.photo || c.foto || c.avatar || c.image || c.foto_url || getPhotoFromName(name) || 'https://via.placeholder.com/96';
      const rawChamber = c.camara || c.camara_tipo || c.tipo || c.chamber || c.cargo || '';
      const chamberText = detectChamber(rawChamber);
      const badgeText = badgeFromChamberText(chamberText);

      const a = document.createElement('a');
      a.className = 'flex items-center gap-4 rounded-lg p-2 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800';
      a.href = `Candidato_Perfil.html?id=${encodeURIComponent(id)}`;
      a.setAttribute('data-candidate-id', String(id));
      a.setAttribute('data-name', String(name));
      if (partyId || partyId === 0) a.setAttribute('data-party-id', String(partyId));
      // exponer sigla del partido si la conocemos
      const sig = partyId ? (partySiglaById[String(partyId)] || '') : (c.sigla || c.party_sigla || '');
      if (sig) a.setAttribute('data-sigla', String(sig));

      // Anotar propiedades en el objeto candidato para que el buscador las use
      try {
        if (sig) c.sigla = String(sig);
        if (partyId || partyId === 0) c.party_id = partyId;
        if (partyName) c.party_name = partyName;
      } catch (e) { /* no bloquear si no se puede mutar */ }

      const img = document.createElement('img');
      img.alt = name;
      img.className = 'h-14 w-14 rounded-full object-cover';
      img.src = photo;

      const div = document.createElement('div');
      const pName = document.createElement('p');
      pName.className = 'font-bold text-text-light dark:text-text-dark';
      pName.textContent = name;
      if (badgeText) {
        const b = document.createElement('span');
        b.className = 'ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded ' + badgeClassFromType(badgeText);
        b.textContent = badgeText;
        pName.appendChild(b);
      }

      div.appendChild(pName);

      if (partyName && partyName.trim() !== '') {
        const pParty = document.createElement('p');
        pParty.className = 'text-sm text-secondary-text-light dark:text-secondary-text-dark';
        pParty.textContent = partyName;
        div.appendChild(pParty);
      }

      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined ml-auto text-secondary-text-light dark:text-secondary-text-dark';
      arrow.textContent = 'arrow_forward_ios';

      a.appendChild(img);
      a.appendChild(div);
      a.appendChild(arrow);

      frag.appendChild(a);
    }

    listEl.innerHTML = '';
    listEl.appendChild(frag);

    if (countEl) countEl.textContent = `${sorted.length} Candidatos encontrados`;

    try {
      globalThis.CANDIDATES_DATA = sorted;
      document.dispatchEvent(new CustomEvent('candidatos:loaded', { detail: sorted }));
    } catch (e) { console.debug('No se pudo publicar candidatos en globalThis', e); }
  }

  (async function load() {
    // cargar partidos locales primero para mapear nombres/siglas
    const parties = (await tryFetch(PARTIES_LOCAL)) || [];
    if (Array.isArray(parties)) {
      for (const p of parties) {
        if (p && (p.id || p.id === 0)) {
          partiesById[String(p.id)] = p.nombre || '';
          partySiglaById[String(p.id)] = p.sigla || '';
        }
      }
    }

    // luego cargar candidatos: remote -> local -> builtin
    const remote = await tryFetch(API);
    if (remote) {
      console.info('Candidatos: datos cargados desde API remota', remote.length);
      render(remote);
      return;
    }

    const local = await tryFetch(LOCAL);
    if (local) {
      console.info('Candidatos: datos cargados desde JSON local', local.length);
      render(local);
      return;
    }

    console.warn('Candidatos: usando datos embebidos (fallback)');
    render(BUILTIN);
  })();

})();
