(function(){
  const API = 'https://api-nodepost-production.up.railway.app/partidos';
  const LOCAL = '../assets/data/partidos.json';
  const BUILTIN = [
    {
      id: 1,
      nombre: 'Fuerza Popular',
      sigla: 'FP',
      descripcion: 'Partido peruano de orientación conservadora-liberal.',
      logo_url: 'https://i.postimg.cc/QMyDMpTZ/fplogo.png',
      sitio_web: 'https://fuerzapopular.com.pe/'
    },
    {
      id: 2,
      nombre: 'Renovación Popular',
      sigla: 'RP',
      descripcion: 'Partido conservador centrado en orden y seguridad.',
      logo_url: 'https://i.postimg.cc/SjFNxc3w/R.jpg',
      sitio_web: 'https://renovacionpopular.org'
    }
  ];

  const partyList = document.getElementById('partyList');
  if (!partyList) return console.warn('No se encontró #partyList en la página');

  function render(parties){
    // ordenar alfabéticamente por nombre antes de renderizar
    const sorted = Array.isArray(parties)
      ? parties.slice().sort((a, b) => {
          const an = (a.nombre || a.name || '').toString();
          const bn = (b.nombre || b.name || '').toString();
          return an.localeCompare(bn, 'es', { sensitivity: 'base' });
        })
      : [];

    partyList.innerHTML = '';
    for (const p of sorted) {
      const li = document.createElement('li');
      li.className = 'party';

      const a = document.createElement('a');
      a.className = 'item';
      // Enlaza a la página de detalle del partido con querystring `id`
      a.href = `Partido_Perfil.html?id=${encodeURIComponent(p.id ?? '')}`;
      a.dataset.partyId = p.id ?? '';
      // Exponer la sigla también como atributo para búsquedas precisas
      if (p.sigla) a.dataset.sigla = String(p.sigla);

      const img = document.createElement('img');
      img.className = 'logo';
      img.src = p.logo_url || p.foto_url || 'https://via.placeholder.com/80x80?text=?';
      img.alt = p.nombre || 'Partido';

      const span = document.createElement('span');
      span.innerText = (p.nombre || 'Partido') + (p.sigla ? ` (${p.sigla})` : '');

      a.appendChild(img);
      a.appendChild(span);
      li.appendChild(a);
      partyList.appendChild(li);
    }
  }

  async function tryFetch(url){
    try{
      const r = await fetch(url, {cache: 'no-store'});
      if(!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      if(Array.isArray(data) && data.length>0) return data;
      // If API returns object with data property
      if(data && Array.isArray(data.data) && data.data.length>0) return data.data;
      return null;
    }catch(e){
      console.debug('fetch fail', url, e);
      return null;
    }
  }

  (async function load(){
    // 1) Try remote API
    const remote = await tryFetch(API);
    if(remote){
      console.info('Partidos: datos cargados desde API remota', remote.length);
      render(remote);
      return;
    }

    // 2) Try local JSON
    const local = await tryFetch(LOCAL);
    if(local){
      console.info('Partidos: datos cargados desde JSON local', local.length);
      render(local);
      return;
    }

    // 3) Fallback builtin
    console.warn('Partidos: usando datos embebidos (fallback)');
    render(BUILTIN);
  })();

})();
