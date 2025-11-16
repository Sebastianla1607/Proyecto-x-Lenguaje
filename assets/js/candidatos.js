(function () {
  const localApi = '../assets/data/candidatos.json';
  const api = 'https://api-nodepost-production.up.railway.app/candidatos';

  // Built-in fallback data (used when remote API is unavailable or when page is opened via file://)
  const BUILTIN_CANDIDATES = [
    { "id": 1, "nombre": "Keiko Fujimori", "foto_url": "https://i.postimg.cc/SRVzXT7m/pers-Keiko-Fujimori121216811183.jpg" },
    { "id": 2, "nombre": "Luz Adriana Soto", "foto_url": "https://i.imgur.com/foto_luz.png" },
    { "id": 3, "nombre": "Carlos Rivera Flores", "foto_url": "https://i.imgur.com/foto_carlos.png" },
    { "id": 4, "nombre": "Rafael López Aliaga", "foto_url": "https://i.postimg.cc/7YFq31Bp/porky.jpg" },
    { "id": 5, "nombre": "Rocío del Pilar Martínez", "foto_url": "https://i.imgur.com/foto_rocio.png" },
    { "id": 6, "nombre": "Jorge Medina Rivas", "foto_url": "https://i.imgur.com/foto_jorge.png" }
  ];
  const listEl = document.getElementById('candidates-list');
  const countEl = document.getElementById('candidate-count');
  if (!listEl) return;

  listEl.innerHTML = '<p class="text-sm text-secondary-text-light dark:text-secondary-text-dark">Cargando...</p>';

  // Intentar la API remota primero; si no hay datos válidos, usar JSON local; si eso falla, usar BUILTIN_CANDIDATES
  fetch(api)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Error en la respuesta'))))
    .catch((err) => {
      console.warn('candidatos.js: fallo API remota, intentando local:', err?.message);
      return fetch(localApi).then((r) => (r.ok ? r.json() : Promise.reject(new Error('Local not found'))));
    })
    .then((data) => {
      console.debug('candidatos.js: datos recibidos:', data);
      // detectar respuesta vacía o error de la API: por ejemplo { error: "" }
      const looksEmptyRemote = data && typeof data === 'object' && Object.keys(data).length === 1 && Object.prototype.hasOwnProperty.call(data, 'error');
      if (!data || looksEmptyRemote) {
        console.warn('candidatos.js: respuesta remota vacía o inválida, intentando JSON local o fallback');
        try {
          const local = fetch(localApi).then((r) => (r.ok ? r.json() : null));
          return local;
        } catch (e) {
          return BUILTIN_CANDIDATES;
        }
      }

      let items = Array.isArray(data) ? data : data.candidatos || data.results || [];

      if (!items || items.length === 0) {
        console.warn('candidatos.js: no hay items en la respuesta — usando BUILTIN_CANDIDATES', data);
        items = BUILTIN_CANDIDATES;
      }

      if (countEl) countEl.textContent = 'Candidatos encontrados';

      const fragment = document.createDocumentFragment();

      // mapa de fotos reales por candidato (fallback si la API no incluye foto)
      const photoByName = {
        'rafael acuña': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCocYz-fcuWq1FYmRsiHelp7me5M8Tf27KeEsSYg8OoDnXlU_odW7MzRyEPJBzfcR1eBATUr-E6jC27d3HHfLi1DeLxXbURybKOwxuZmVePeqCq2GJT132rKRpE_HOJTIaSstPQPEGYkIwauyEYNmK6f5RQvGZ1W6nFTuTT0ELqPOXrlLvOwUENxNUoUuJhkQpXc-Ck7Gkht3mm51jCNF43r1PKKy1_3HGzIPd5asiaWWqgjt8-9udO1Qm7h39b8VMjOOqXhM3T9a0',
        'carlos benavides': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk-pnldv881l4Q5Nh3DRLToz9H86S1AHmRruhu1a_ayaOIqmAGkyxsTs-HhCEec_37bQz7uTnky7N3KKvaN1R3StEAQ0ZbA8Eb4DIvtF7ehUe7cb5ra_qDtCRNqS-wJj0Nn3BkzwvOPOGt1qyUJdaWhuuc22yruCUxxxz_2yPI5zaUHwhkCDQOYlB-KAVxd91PpqO-UIGnz56wA5Ak69Lh1H8AniqPq9qVPnKCrUY-cRvOylE-0GM5S_6l3c8D5Z3pSIukv9lrqJE',
        'alberto beingolea': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtLUyyd-vg7Jv-IgtAwTT8E-gFJJdytFyZh-7ooMDVlFZ4FRu249mtn2LKGmKUduqaCmN6ZsXR6USHUCv3FxqwN-KBfRLvyLpXeKWARdupPxSaABIk6rs9gDPWBxcBPQHltOdl1ItdZbGbmXOQH2sgcJWqYDW6d5LdE9QddKuP7DvpqmO1zIaAi4OHRqKaIXs9qKyiGBYgCArdnzmgxfIgJlMci4pwgjS6iBk78Vcu8ZI6P0U3Y3zi2gu6_TfBOgPAKcuxHm-C24',
        'patricia castillo': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIIqIlwAesM50TXTgMy7IW-4Y4bESa_SAPDCnm1ZIYweYBUN1LNrjvqcKuU-dwJ8jWbd9L7Qg6lIz2CCLOZI9x0GEKdSGU_ivsx9JL7tZU97O0dqXHg4zKgqRstttxbIvgr-yJj3DgA2go5s56c9F3CszGibHMzHDjFK2QjOrRsyiQQLhogMkdAUOUgvoz1OqcNbX-WeQYkf1j8RJttmld8Erp6Rmlh1G_c2oxXGXGu-igvfi9_0v-cvHZ6GaHsJleAajMt1dAzXQ',
        'fernando flores': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2RR9rrsKtxREM_3Wj6lCWxWYBw-Fc5ELsmAFzAPZyFLFxegm6tMWquUoPS4Hj4L8YTPb0ima3zeIAlMPsX8TJyaYHQt49KCx67rJTKI7FAxZuScyhjP7Pxuik0e8WanUUvWxiP-mJp4wmyMzd56-C0dHegisomCjcAnxeW65oYRIPTk_t_AvWJg0OsE3oCbXPtGKXiC44Rm0TD3yEvT2wyyXpmdwi3n5-gbLAzYiC5wDyNEuyYwXjEmJrszOb7V4UbLxpZ7HLpKk',
        'francisco forsyth': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBBNkpdtXEMRAMEslWUIOsVIvQQrPYeJU50FveOl9I8MGiYC6bRL7z8yywHRDWZh2wbkbPsz18p0iwVYVf8l9ZEamGLSyaCIeF10nYnwIMhudkRaOj-BJrVq15phDLD8n3pcUW-OHalUnLOpfo-Qbf0T8Zk9t4o4Y6pnJTzzSz1YfOf6XT_GjzVRdsvcnczkWdPNEwDt39S2Va2rW8XWGtNAV3fT4sxe38Beejio1XMIQtE0U1zc4QlA_yIOpK4IY7iUyCRKorHfE'
      };

      function getPhotoFromName(name) {
        if (!name) return null;
        const key = name.toLowerCase();
        for (const k of Object.keys(photoByName)) {
          if (key.includes(k)) return photoByName[k];
        }
        return null;
      }

      // chamber detection helpers (moved to outer scope to avoid redefining per-item)
      function detectChamber(value) {
        const v = (value || '').toString().toLowerCase();
        if (!v) return '';
        // Presidencia
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

          // Devuelve clases de Tailwind para colorear la badge según el tipo
          function badgeClassFromType(chamberText) {
            const t = (chamberText || '').toString().toLowerCase();
            if (t.includes('presid')) return 'bg-amber-100 text-amber-800';
            if (t.includes('andino') || t.includes('parl')) return 'bg-indigo-100 text-indigo-800';
            if (t.includes('dip')) return 'bg-green-100 text-green-800';
            if (t.includes('sen')) return 'bg-red-100 text-red-800';
            if (t.includes('congres')) return 'bg-blue-100 text-blue-800';
            return 'bg-gray-100 text-gray-800';
          }

      for (const c of items) {
        const id = c.id || c.ID || c.id_candidato || '0';
        const name = c.name || c.nombre || c.nombre_completo || c.fullName || 'Sin nombre';
        const party = c.party || c.partido || c.affiliation || (c.partido_id ? String(c.partido_id) : '');
        const photo = c.photo || c.foto || c.avatar || c.image || c.foto_url || getPhotoFromName(name) || 'https://via.placeholder.com/96';
        // detect chamber info (camara / parlamento)
        const rawChamber = c.camara || c.camara_tipo || c.tipo || c.chamber || c.cargo || '';
        const chamberText = detectChamber(rawChamber);
        const badgeText = badgeFromChamberText(chamberText);

        const a = document.createElement('a');
        a.className = 'flex items-center gap-4 rounded-lg p-2 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800';
        // enlace al perfil con el id del candidato
        a.href = `Candidato_Perfil.html?id=${encodeURIComponent(id)}`;

        const img = document.createElement('img');
        img.alt = name;
        img.className = 'h-14 w-14 rounded-full object-cover';
        img.src = photo;

        const div = document.createElement('div');
        const pName = document.createElement('p');
        pName.className = 'font-bold text-text-light dark:text-text-dark';
        // Name and optional short badge
        pName.textContent = name;
        if (badgeText) {
          const b = document.createElement('span');
          b.className = 'ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded ' + badgeClassFromType(badgeText);
          b.textContent = badgeText;
          pName.appendChild(b);
        }
        const pParty = document.createElement('p');
        pParty.className = 'text-sm text-secondary-text-light dark:text-secondary-text-dark';
        pParty.textContent = party;

        div.appendChild(pName);
        div.appendChild(pParty);

        const span = document.createElement('span');
        span.className = 'material-symbols-outlined ml-auto text-secondary-text-light dark:text-secondary-text-dark';
        span.textContent = 'arrow_forward_ios';

        a.appendChild(img);
        a.appendChild(div);
        // no exposiciones de ID en el DOM (seguridad / privacidad)
        a.appendChild(span);

        fragment.appendChild(a);
      }

      listEl.innerHTML = '';
      listEl.appendChild(fragment);

      // Exponer los datos cargados para que otros scripts (e.g. buscador) los reutilicen
      try{
        globalThis.CANDIDATES_DATA = items;
        document.dispatchEvent(new CustomEvent('candidatos:loaded', { detail: items }));
      }catch(e){ console.debug('No se pudo publicar candidatos en globalThis', e); }
    })
    .catch((err) => {
      console.error('Error cargando candidatos:', err);
      listEl.innerHTML = '<p class="text-sm text-red-600">Error cargando candidatos.</p>';
      if (countEl) countEl.textContent = 'Error';
      // Exponer fallback para que el buscador pueda funcionar
      try{ globalThis.CANDIDATES_DATA = BUILTIN_CANDIDATES; document.dispatchEvent(new CustomEvent('candidatos:loaded', { detail: BUILTIN_CANDIDATES })); }catch(e){ console.debug('No se pudo publicar fallback candidatos', e); }
    });
})();
