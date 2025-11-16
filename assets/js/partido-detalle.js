/* partido-detalle.js
   Carga los detalles de un partido por `id` desde la API o JSON local
*/
(function(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const api = 'https://api-nodepost-production.up.railway.app/partidos';
  const local = '../assets/data/partidos.json';

  function setText(idEl, text){
    const el = document.getElementById(idEl);
    if(el) el.textContent = text || '';
  }

  function setImageBg(idEl, url, alt){
    const el = document.getElementById(idEl);
    if(!el) return;
    if(url) {
      el.style.backgroundImage = `url('${url}')`;
      if(alt) el.setAttribute('data-alt', alt);
    } else {
      el.style.backgroundImage = '';
    }
  }

  if(!id){
    setText('party-name', 'Partido no especificado');
    setText('party-description', 'No se especificó el partido a mostrar.');
    return;
  }

  async function fetchJson(url){
    try{
      const r = await fetch(url, {cache: 'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.json();
    }catch(e){
      console.debug('fetch fail', url, e);
      return null;
    }
  }

  (async function load(){
    // 1) Intentar ruta específica /partidos/:id
    let single = await fetchJson(`${api}/${encodeURIComponent(id)}`);
    // Si la API responde con un objeto partido directo, úsalo
    if (single && !Array.isArray(single) && (single.id || single.nombre)) {
      const party = single;
      setText('party-name', party.nombre || party.name || '—');
      setText('party-sigla', party.sigla || '—');
      setText('party-description', party.descripcion || '—');
      setText('party-ideologia', party.ideologia || '—');
      setText('party-lider', party.lider || '—');
      setText('party-estado', party.estado || '—');
      setText('party-fecha', party.fecha_fundacion ? new Date(party.fecha_fundacion).toLocaleDateString() : (party.fecha_fundacion || '—'));
      const sitio = document.getElementById('party-sitio');
      if(sitio){ sitio.href = party.sitio_web || '#'; sitio.textContent = party.sitio_web || '—'; }
      setImageBg('party-photo', party.foto_url || party.logo_url || party.image || 'https://via.placeholder.com/300');
      return;
    }

    // 2) Si no está la ruta específica, intentar la lista completa (API o local)
    let data = await fetchJson(api);
    if(!data) data = await fetchJson(local);
    if(!data){
      setText('party-name','Error');
      setText('party-description','No se pudieron cargar datos del partido.');
      return;
    }

    const items = Array.isArray(data) ? data : (data.partidos || data.data || data.results || []);
    const party = items.find(p => String(p.id) === String(id));
    if(!party){
      setText('party-name','Partido no encontrado');
      setText('party-description', `No se encontró partido con id ${id}`);
      return;
    }

    setText('party-name', party.nombre || party.name || '—');
    setText('party-sigla', party.sigla || '—');
    setText('party-description', party.descripcion || '—');
    setText('party-ideologia', party.ideologia || '—');
    setText('party-lider', party.lider || '—');
    setText('party-estado', party.estado || '—');
    setText('party-fecha', party.fecha_fundacion ? new Date(party.fecha_fundacion).toLocaleDateString() : (party.fecha_fundacion || '—'));
    const sitio2 = document.getElementById('party-sitio');
    if(sitio2){ sitio2.href = party.sitio_web || '#'; sitio2.textContent = party.sitio_web || '—'; }
    setImageBg('party-photo', party.foto_url || party.logo_url || party.image || 'https://via.placeholder.com/300');

  })();

  // back button
  const back = document.getElementById('back-btn');
  if(back) back.addEventListener('click', ()=> window.history.back());

})();
