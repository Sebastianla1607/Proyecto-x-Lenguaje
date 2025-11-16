(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const localApi = '../assets/data/candidatos.json';
  const api = 'https://api-nodepost-production.up.railway.app/candidatos';

  const BUILTIN_CANDIDATES = [
    { "id": 1, "nombre": "Keiko Fujimori", "foto_url": "https://i.postimg.cc/SRVzXT7m/pers-Keiko-Fujimori121216811183.jpg" },
    { "id": 2, "nombre": "Luz Adriana Soto", "foto_url": "https://i.imgur.com/foto_luz.png" },
    { "id": 3, "nombre": "Carlos Rivera Flores", "foto_url": "https://i.imgur.com/foto_carlos.png" },
    { "id": 4, "nombre": "Rafael López Aliaga", "foto_url": "https://i.postimg.cc/7YFq31Bp/porky.jpg" },
    { "id": 5, "nombre": "Rocío del Pilar Martínez", "foto_url": "https://i.imgur.com/foto_rocio.png" },
    { "id": 6, "nombre": "Jorge Medina Rivas", "foto_url": "https://i.imgur.com/foto_jorge.png" }
  ];

  const photoByName = {
    'keiko fujimori': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Keiko_Fujimori_2016.jpg',
    'rafael lópez aliaga': 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Rafael_L%C3%B3pez_Aliaga.jpg',
    'luis gutiérrez': 'https://via.placeholder.com/300?text=Luis+Guti%C3%A9rrez',
    'maría torres': 'https://via.placeholder.com/300?text=Mar%C3%ADa+Torres',
    'carlos pérez': 'https://via.placeholder.com/300?text=Carlos+P%C3%A9rez',
    'juana rivas': 'https://via.placeholder.com/300?text=Juana+Rivas'
  };

  function getPhotoFromName(name) {
    if (!name) return null;
    const key = name.toLowerCase();
    for (const k of Object.keys(photoByName)) {
      if (key.includes(k)) return photoByName[k];
    }
    return null;
  }

    let currentCandidateName = null;
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

  function setBackground(id, url, alt) {
    const el = document.getElementById(id);
    if (!el) return;
    if (url) {
      el.style.backgroundImage = `url('${url}')`;
      if (alt) el.setAttribute('data-alt', alt);
    } else {
      el.style.backgroundImage = '';
    }
  }

  if (!id) {
    setText('candidate-name', 'Candidato no especificado');
    setText('candidate-description', 'No se ha especificado el candidato a mostrar.');
    return;
  }

  // Try local JSON first, then fallback to remote API
  fetch(localApi)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Local not found'))))
    .catch(() => fetch(api).then((res) => (res.ok ? res.json() : Promise.reject(new Error('Error en la respuesta')))))
    .then((data) => {
      console.debug('candidato-perfil.js: datos recibidos:', data);
      const items = Array.isArray(data) ? data : data.candidatos || data.results || [];
      // Buscar el candidato comparando varias posibles claves de id
      function getId(x) { return x && (x.id || x.ID || x._id || x.id_candidato || x.idCandidato || x.idC) || null; }
      let candidate = items.find((x) => String(getId(x)) === String(id));
      // Si no se encontró en la respuesta, intentar el respaldo BUILTIN_CANDIDATES
      if (!candidate) {
        candidate = BUILTIN_CANDIDATES.find((x) => String(getId(x)) === String(id));
      }
      if (!candidate) {
        console.warn('candidato-perfil.js: candidato no encontrado. id buscado=', id, 'primeros items=', items && items.slice ? items.slice(0,5) : items);
        setText('candidate-name', 'Candidato no encontrado');
        setText('candidate-description', 'No se encontró el candidato con id ' + id);
        return;
      }

      const name = candidate.nombre || candidate.name || 'Sin nombre';
      const party = candidate.partido || candidate.party || '';
      const edad = candidate.edad ? candidate.edad + ' años' : '';
      const ciudad = candidate.ciudad || '';
      const cargo = candidate.cargo || '';
      const tipoCandidatura = candidate.tipo_candidatura || candidate.tipo || '';
      const nivel = candidate.nivel || '';
      const createdAt = candidate.created_at || candidate.createdAt || candidate.creado || '';
      // Detect chamber (Diputado / Senado) from explicit field or inferred from cargo
      const rawChamber = candidate.camara || candidate.camara_tipo || candidate.tipo || candidate.chamber || '';
      function detectChamber(value, cargoText) {
        const v = (value || cargoText || '').toString().toLowerCase();
        if (!v) return '';
        // Presidencia
        if (v.includes('presid') || v.includes('presidente') || v.includes('presidencia')) return 'Presidencia';
        // Parlamento Andino
        if (v.includes('parl') || v.includes('andino') || v.includes('parlamento')) return 'Parlamento Andino';
        // Diputado / Diputada
        if (v.includes('dip') || v.includes('diput')) return 'Cámara: Diputado(a)';
        // Senado
        if (v.includes('sen') || v.includes('senad')) return 'Cámara: Senado';
        // Congreso general
        if (v.includes('congres') || v.includes('congresista')) return 'Congreso';
        return value || cargoText || '';
      }
      const plan = candidate.plan_electoral || candidate.plan || 'Sin plan publicado.';
      const descripcion = candidate.descripcion || '';
      const hoja = candidate.hoja_vida || candidate.hojaDeVida || 'No disponible.';
      const actividades = candidate.actividades || candidate.activities || 'No disponible.';
      const ubicacionMesa = candidate.ubicacion_mesa || candidate.ubicacion || candidate.mesa || candidate.table_location || '';

      setText('candidate-name', name);
        currentCandidateName = name;
      // resolver partido usando partido_id si es necesario
      (function resolveAndSetParty() {
        const partidosLocal = '../assets/data/partidos.json';
        if (party && party.trim()) {
          setText('candidate-party', party);
          return;
        }
        const pid = candidate.partido_id || candidate.party_id || candidate.partidoId || candidate.partido || null;
        if (!pid) {
          setText('candidate-party', '');
          return;
        }
        fetch(partidosLocal)
          .then((r) => (r.ok ? r.json() : []))
          .then((pr) => {
            if (Array.isArray(pr)) {
              const found = pr.find((p) => String(p.id) === String(pid));
              if (found) {
                setText('candidate-party', found.nombre || found.name || '');
                return;
              }
            }
            // fallback: mostrar id si no se encuentra nombre
            setText('candidate-party', String(pid));
          })
          .catch((e) => {
            console.debug('No se pudo cargar partidos para perfil', e);
            setText('candidate-party', String(pid));
          });
      })();
      setText('candidate-description', descripcion || plan || '—');
      // Información personal ampliada: edad, ciudad, tipo y nivel
      const personalParts = [edad, ciudad];
      if (tipoCandidatura) personalParts.push(tipoCandidatura);
      if (nivel) personalParts.push(nivel);
      setText('candidate-personal', personalParts.filter(Boolean).join(' · '));
      // created at (fecha de creación del registro)
      if (createdAt) {
        const createdEl = document.getElementById('candidate-created');
        if (createdEl) {
          try {
            const d = new Date(createdAt);
            createdEl.textContent = 'Registro: ' + (isNaN(d.getTime()) ? createdAt : d.toLocaleString());
            createdEl.className = 'text-xs text-gray-500 dark:text-gray-400';
          } catch (e) {
            createdEl.textContent = 'Registro: ' + createdAt;
          }
        }
      }
      // populate chamber field if present
      const chamberText = detectChamber(rawChamber, cargo);
      setText('candidate-chamber', chamberText || '—');
      // populate table location (short row)
      setText('candidate-table-location', ubicacionMesa || '—');
      // populate the dedicated RF3.2 apartado (full text + actions)
      const fullLocationEl = document.getElementById('candidate-table-location-full');
      if (fullLocationEl) fullLocationEl.textContent = ubicacionMesa || '—';

      const mapLink = document.getElementById('candidate-map-link');
      const copyBtn = document.getElementById('copy-table-location');
      const ubicacionPageLink = document.getElementById('candidate-ubicacion-link');
      // detect coordinates if provided
      const lat = candidate.lat || candidate.latitude || candidate.latitud || candidate.latitud_gps || candidate.LAT || '';
      const lng = candidate.lng || candidate.longitude || candidate.long || candidate.longitud || candidate.LON || '';
      if (ubicacionMesa) {
        // build maps link: prefer coordinates if available
        let href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ubicacionMesa);
        if (lat && lng) href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat + ',' + lng);
        if (mapLink) {
          mapLink.href = href;
          mapLink.classList.remove('hidden');
        }
        // also build internal Ubicacion.html link to center the app's map
        if (ubicacionPageLink) {
          try {
            let ubicHref = '';
            if (lat && lng) {
              ubicHref = `Ubicacion.html?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&title=${encodeURIComponent(name)}`;
            } else {
              // fallback to a text query (search) so Ubicacion page can filter
              ubicHref = `Ubicacion.html?query=${encodeURIComponent(ubicacionMesa || name)}&title=${encodeURIComponent(name)}`;
            }
            ubicacionPageLink.href = ubicHref;
            ubicacionPageLink.classList.remove('hidden');
          } catch (e) {
            console.warn('Error building ubicacion page link', e);
          }
        }
        if (copyBtn) {
          copyBtn.classList.remove('hidden');
          // attach click listener (use once)
          copyBtn.addEventListener('click', async () => {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(ubicacionMesa);
                alert('Dirección copiada al portapapeles');
              } else {
                prompt('Copia la dirección:', ubicacionMesa);
              }
            } catch (e) {
              prompt('Copia la dirección:', ubicacionMesa);
            }
          });
        }
      } else {
        if (mapLink) mapLink.classList.add('hidden');
        if (copyBtn) copyBtn.classList.add('hidden');
      }
      // compute and show short badge near the name (Parl. Andino, Dip., Sen.)
      function badgeFromChamber(chamberText) {
        if (!chamberText) return '';
        const t = chamberText.toString().toLowerCase();
        if (t.includes('andino') || t.includes('parl')) return 'Parl. Andino';
        if (t.includes('presid')) return 'Presidencia';
        if (t.includes('dip')) return 'Dip.';
        if (t.includes('sen')) return 'Sen.';
        if (t.includes('congres')) return 'Congreso';
        return '';
      }
      // clases para colorear la badge según tipo
      function badgeClassFromType(chamberText) {
        const t = (chamberText || '').toString().toLowerCase();
        if (t.includes('presid')) return 'bg-amber-100 text-amber-800';
        if (t.includes('andino') || t.includes('parl')) return 'bg-indigo-100 text-indigo-800';
        if (t.includes('dip')) return 'bg-green-100 text-green-800';
        if (t.includes('sen')) return 'bg-red-100 text-red-800';
        if (t.includes('congres')) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
      }
      const badgeText = badgeFromChamber(chamberText);
      const badgeEl = document.getElementById('candidate-badge');
      if (badgeEl) {
        if (badgeText) {
          badgeEl.textContent = badgeText;
          // aplicar clases de color reconocibles
          badgeEl.className = 'inline-block text-xs font-semibold px-2 py-0.5 rounded ' + badgeClassFromType(badgeText);
          badgeEl.classList.remove('hidden');
          badgeEl.setAttribute('aria-label', badgeText);
        } else {
          badgeEl.classList.add('hidden');
        }
      }

      // plan section
      const planEl = document.getElementById('candidate-plan');
      if (planEl) {
        planEl.innerHTML = '';
        const p = document.createElement('p');
        p.className = 'text-gray-700 dark:text-gray-300';
        p.textContent = plan;
        planEl.appendChild(p);

        const h2 = document.createElement('h4');
        h2.className = 'mt-4 font-bold';
        h2.textContent = 'Hoja de vida';
        planEl.appendChild(h2);
        const hv = document.createElement('p');
        hv.className = 'text-gray-700 dark:text-gray-300';
        hv.textContent = hoja;
        planEl.appendChild(hv);

        const h3 = document.createElement('h4');
        h3.className = 'mt-4 font-bold';
        h3.textContent = 'Actividades';
        planEl.appendChild(h3);
        const act = document.createElement('p');
        act.className = 'text-gray-700 dark:text-gray-300';
        act.textContent = actividades;
        planEl.appendChild(act);
      }

      // Rellenar Formación / Experiencia / Historial si existen elementos
      const eduEl = document.getElementById('candidate-education');
      const expEl = document.getElementById('candidate-experience');
      const histEl = document.getElementById('candidate-history');
      const educationText = candidate.formacion_academica || candidate.educacion || candidate.hoja_vida || '';
      const experienceText = candidate.experiencia_laboral || candidate.experiencia || candidate.actividades || '';
      const historyText = candidate.historial_politico || candidate.historial || candidate.descripcion || '';
      if (eduEl) eduEl.textContent = educationText || '—';
      if (expEl) expEl.textContent = experienceText || '—';
      if (histEl) histEl.textContent = historyText || '—';

      // photo
      const photo = candidate.photo || candidate.foto || candidate.avatar || candidate.foto_url || getPhotoFromName(name) || 'https://via.placeholder.com/300';
      setBackground('candidate-photo', photo, `Fotografía de ${name}`);
      console.info('candidato-perfil.js: cargado candidato:', { id: candidate.id, name });

      // cargar propuestas y mostrarlas
      fetch('https://api-nodepost-production.up.railway.app/propuestas')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Error propuestas'))))
        .then((propuestasData) => {
          const propuestas = Array.isArray(propuestasData) ? propuestasData : propuestasData.results || [];
          const my = propuestas.filter((p) => String(p.candidato_id) === String(candidate.id));
          const container = document.getElementById('candidate-proposals');
          if (!container) return;
          container.innerHTML = '';
          if (!my || my.length === 0) {
            container.textContent = 'No hay propuestas publicadas.';
            return;
          }
          for (const prop of my) {
            const card = document.createElement('div');
            card.className = 'rounded-lg bg-white dark:bg-gray-800/50 p-3 ring-1 ring-gray-200 dark:ring-gray-700';
            const h = document.createElement('h4');
            h.className = 'font-bold text-gray-800 dark:text-gray-200';
            h.textContent = prop.sector || 'General';
            const p = document.createElement('p');
            p.className = 'text-sm text-gray-700 dark:text-gray-300 mt-1';
            p.textContent = prop.descripcion || '';
            const small = document.createElement('small');
            small.className = 'text-xs text-gray-500 dark:text-gray-400 block mt-2';
            small.textContent = prop.created_at ? new Date(prop.created_at).toLocaleString() : '';
            card.appendChild(h);
            card.appendChild(p);
            card.appendChild(small);
            container.appendChild(card);
          }
        })
        .catch((err) => {
          console.error('Error cargando propuestas:', err);
          const container = document.getElementById('candidate-proposals');
          if (container) container.textContent = 'Error cargando propuestas.';
        });
    })
    .catch((err) => {
      console.error('Error cargando candidato:', err);
      setText('candidate-name', 'Error');
      setText('candidate-description', 'No se pudo cargar la información del candidato.');
    });

    // UI interactions: back button, share, tabs
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.addEventListener('click', () => window.history.back());

    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const url = window.location.href;
        const title = currentCandidateName || document.getElementById('candidate-name')?.textContent || 'Candidato';
        try {
          if (navigator.share) {
            await navigator.share({ title, url });
          } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            alert('URL copiada al portapapeles');
          } else {
            prompt('Copia la URL:', url);
          }
        } catch (e) {
          console.warn('Compartir falló', e);
        }
      });
    }

    // Tabs navigation
    const tabLinks = document.querySelectorAll('a[data-target]');
    if (tabLinks && tabLinks.length) {
      tabLinks.forEach((a) => {
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          const target = a.getAttribute('data-target');
          if (!target) return;
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // active tab styling: remove from siblings
          tabLinks.forEach((s) => s.classList.remove('border-b-primary', 'text-gray-900'));
          a.classList.add('border-b-primary', 'text-gray-900');
        });
      });
    }
})();
