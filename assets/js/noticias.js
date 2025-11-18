(function(){
  const API = 'https://api-nodepost-production.up.railway.app/noticias';
  const LOCAL = '../assets/data/noticias.json';
  const BUILTIN = [
    {
      id: 1,
      titulo: 'Elecciones 2026: Estos son los congresistas que postularan a la reeleccion como diputados y senadores',
      contenido: 'Al menos 80 congresistas buscarán la reelección. Las listas para las primarias muestran a los parlamentarios que entrarán en la campaña. Aún faltan definiciones por disputas internas.',
      url: 'https://elcomercio.pe/politica/congreso/elecciones-2026-estos-son-los-congresistas-que-postularan-a-la-reeleccion-como-diputados-y-senadores-bicameralidad-congreso-bicameral-elecciones-primarias-tlcnota-noticia/#google_vignette',
      fecha: '2025-11-04T00:00:00.000Z'
    }
  ];

  const container = document.getElementById('newsList');
  if(!container) return console.warn('No se encontró #newsList');

  function formatDate(iso){
    try{ const d = new Date(iso); return d.toLocaleDateString(); }catch(e){ return iso; }
  }

  function createCard(n){
    const card = document.createElement('article');
    card.className = 'overflow-hidden rounded-xl border border-border bg-card shadow-card hover:shadow-lg transition-shadow';

    const img = document.createElement('img');
    img.className = 'h-56 w-full object-cover';
    img.alt = n.titulo || 'Noticia';
    // seleccionar posible URL de imagen desde varias claves
    const imgUrl = n.foto_url || n.imagen || n.image || n.urlToImage || (n.media && n.media.url) || '';
    // si es una página/álbum de Imgur, intentar construir enlace directo i.imgur.com/<id>.jpg
    let finalImg = '';
    try{
      if(imgUrl){
        const albumMatch = imgUrl.match(/imgur\.com\/(?:a|gallery)\/([A-Za-z0-9]+)/i);
        const directMatch = imgUrl.match(/imgur\.com\/([A-Za-z0-9]+)(?:\.[a-z]{2,4})?$/i);
        if(albumMatch){
          finalImg = 'https://i.imgur.com/' + albumMatch[1] + '.jpg';
        } else if(directMatch){
          finalImg = 'https://i.imgur.com/' + directMatch[1] + '.jpg';
        } else {
          finalImg = imgUrl;
        }
      }
    }catch(e){
      console.debug('noticias.js: error parsing img url', imgUrl, e);
      finalImg = imgUrl;
    }
    img.src = finalImg || 'https://via.placeholder.com/800x400?text=Noticia';
    img.addEventListener('error', ()=>{
      console.warn('noticias.js: error cargando imagen, usando placeholder', finalImg, n);
      img.src = 'https://via.placeholder.com/800x400?text=No+imagen';
    });
    console.debug('noticias.js: imagen usada ->', img.src);

    const body = document.createElement('div');
    body.className = 'p-4';

    const h2 = document.createElement('h2');
    h2.className = 'text-xl font-bold leading-tight text-text-primary hover:text-accent transition-colors cursor-pointer';
    h2.innerText = n.titulo || 'Sin título';

    const p = document.createElement('p');
    p.className = 'mt-2 text-text-secondary';
    p.innerText = n.contenido || '';

    const footer = document.createElement('div');
    footer.className = 'mt-4 flex items-center justify-between';

    const date = document.createElement('p');
    date.className = 'text-sm text-text-secondary';
    date.innerText = 'Publicado: ' + formatDate(n.fecha);

    const likeBtn = document.createElement('button');
    likeBtn.className = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-accent transition-colors hover:bg-sky-50';
    likeBtn.innerHTML = '<span class="material-symbols-outlined text-xl">favorite</span><span class="text-sm font-medium">Me gusta</span>';
    likeBtn.onclick = (e)=>{
      e.stopPropagation();
      const icon = likeBtn.querySelector('.material-symbols-outlined');
      const liked = likeBtn.dataset.liked === '1';
      if(liked){
        likeBtn.dataset.liked = '0';
        icon.innerText = 'favorite';
        likeBtn.classList.remove('bg-sky-100');
      } else {
        likeBtn.dataset.liked = '1';
        icon.innerText = 'favorite';
        likeBtn.classList.add('bg-sky-100');
      }
    };

    // clicking title or card opens source in new tab
    const openSource = ()=>{
      if(n.url){
        try{ window.open(n.url, '_blank'); }catch(e){ location.href = n.url; }
      }
    };

    h2.addEventListener('click', openSource);
    card.addEventListener('click', openSource);

    footer.appendChild(date);
    footer.appendChild(likeBtn);

    body.appendChild(h2);
    body.appendChild(p);
    body.appendChild(footer);

    card.appendChild(img);
    card.appendChild(body);

    return card;
  }

  async function tryFetch(url){
    try{
      const r = await fetch(url, {cache: 'no-store'});
      if(!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      if(Array.isArray(data) && data.length>0) return data;
      if(data && Array.isArray(data.data) && data.data.length>0) return data.data;
      return null;
    }catch(e){
      console.debug('fetch fail', url, e);
      return null;
    }
  }

  (async function load(){
    const remote = await tryFetch(API);
    if(remote){ console.info('Noticias: cargadas desde API remota', remote.length); remote.forEach(n=> container.appendChild(createCard(n))); return; }
    const local = await tryFetch(LOCAL);
    if(local){ console.info('Noticias: cargadas desde JSON local', local.length); local.forEach(n=> container.appendChild(createCard(n))); return; }
    console.warn('Noticias: usando datos embebidos (fallback)'); BUILTIN.forEach(n=> container.appendChild(createCard(n)));
  })();

})();
