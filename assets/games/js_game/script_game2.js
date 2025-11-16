let personajes = [];

// Cargar personajes desde la API
function cargarPersonajes() {
    fetch('https://api-nodepost-production.up.railway.app/candidatos')
        .then(res => res.json())
        .then(data => {
            // Solo tomamos id, nombre y foto_url
            personajes = data.map(p => ({ id: p.id, nombre: p.nombre, foto_url: p.foto_url, votos: 0 }));

            if (document.getElementById('personajes-container')) {
                mostrarPersonajes();
            }
            if (document.getElementById('top10-container')) {
                mostrarTop10();
            }
        })
        .catch(err => console.error('Error cargando API:', err));
}

// Mostrar los personajes en select_personaje.html
function mostrarPersonajes() {
    const contenedor = document.getElementById('personajes-container');
    contenedor.innerHTML = '';

    personajes.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('personaje-card');
        card.innerHTML = `
            <img src="${p.foto_url}" alt="${p.nombre}">
            <p>${p.nombre}</p>
        `;
        card.addEventListener('click', () => seleccionarPersonaje(p.id));
        contenedor.appendChild(card);
    });
}

// Seleccionar personaje y controlar cooldown 5 min
function seleccionarPersonaje(id) {
    const ultimoVoto = localStorage.getItem('ultimoVoto');
    const ahora = Date.now();

    if (ultimoVoto && (ahora - ultimoVoto) < 5 * 60 * 1000) {
        const tiempoRestante = Math.ceil((5*60*1000 - (ahora - ultimoVoto)) / 1000);
        alert(`Debes esperar ${tiempoRestante} segundos para votar de nuevo.`);
        return;
    }

    const personaje = personajes.find(p => p.id === id);
    personaje.votos += 1;
    localStorage.setItem('ultimoVoto', ahora);

    alert(`Has apoyado a ${personaje.nombre}`);
}

// Mostrar top 10 en ranking.html
function mostrarTop10() {
    const topContainer = document.getElementById('top10-container');
    topContainer.innerHTML = '';

    const top10 = [...personajes].sort((a,b) => b.votos - a.votos).slice(0,10);

    top10.forEach((p,index) => {
        const item = document.createElement('div');
        item.classList.add('top-personaje');
        item.innerHTML = `
            <span>${index+1}</span>
            <img src="${p.foto_url}" alt="${p.nombre}">
            <p>${p.nombre} - ${p.votos} votos</p>
        `;
        topContainer.appendChild(item);
    });
}

// Ejecutamos la carga
cargarPersonajes();
