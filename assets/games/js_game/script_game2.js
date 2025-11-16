let personajes = [];

// Cargar personajes desde la API
function cargarPersonajes() {
    fetch('https://api-nodepost-production.up.railway.app/candidatos')
        .then(res => res.json())
        .then(data => {

            personajes = data.map(p => ({
                id: p.id,
                nombre: p.nombre,
                foto_url: p.foto_url,
                votos: p.votos ?? 0
            }));

            if (document.getElementById('personajes-container')) {
                mostrarPersonajes();
            }
            if (document.getElementById('top10-container')) {
                mostrarTop10();
            }
        })
        .catch(err => console.error("Error cargando API:", err));
}

// Seleccionar personaje con cooldown
function seleccionarPersonaje(id) {
    const ultimoVoto = localStorage.getItem("ultimoVoto");
    const ahora = Date.now();

    if (ultimoVoto && (ahora - ultimoVoto) < 5 * 60 * 1000) {
        const s = Math.ceil((5*60*1000 - (ahora - ultimoVoto)) / 1000);
        alert(`Debes esperar ${s} segundos para votar de nuevo.`);
        return;
    }

    const personaje = personajes.find(p => p.id === id);
    if (!personaje) return;

    personaje.votos++;
    localStorage.setItem("ultimoVoto", ahora);

    alert(`Has apoyado a ${personaje.nombre}`);
}

// Mostrar top 10
function mostrarTop10() {
    const c = document.getElementById('top10-container');
    c.innerHTML = "";

    const top = [...personajes]
        .sort((a,b) => b.votos - a.votos)
        .slice(0,10);

    top.forEach((p,i) => {
        c.innerHTML += `
            <div class="top-personaje">
                <span>${i+1}</span>
                <img src="${p.foto_url}">
                <p>${p.nombre} - ${p.votos} votos</p>
            </div>
        `;
    });
}

// Ejecutar
cargarPersonajes();
