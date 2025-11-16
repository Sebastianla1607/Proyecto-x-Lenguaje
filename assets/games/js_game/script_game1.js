// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {

  // --- Inicializar progreso ---
  let progreso = JSON.parse(localStorage.getItem("progreso")) || {
    puntos: 0,
    racha: 0,
    nivel: "Hierro",
    fechaUltimaPregunta: null
  };

  // --- Función para guardar progreso ---
  function guardarProgreso() {
    localStorage.setItem("progreso", JSON.stringify(progreso));
  }

  // --- Función para actualizar medallas ---
  function actualizarMedallas() {
    const medallaBronce = document.getElementById("medalla-bronce");
    const medallaPlata = document.getElementById("medalla-plata");
    const medallaOro = document.getElementById("medalla-oro");
    const medallaDiamante = document.getElementById("medalla-diamante");

    if (medallaBronce) medallaBronce.style.opacity = progreso.puntos >= 10 ? "1" : "0.3";
    if (medallaPlata) medallaPlata.style.opacity = progreso.puntos >= 20 ? "1" : "0.3";
    if (medallaOro) medallaOro.style.opacity = progreso.puntos >= 50 ? "1" : "0.3";
    if (medallaDiamante) medallaDiamante.style.opacity = progreso.puntos >= 100 ? "1" : "0.3";
  }

  // --- Función para actualizar la UI ---
  function actualizarUI() {
    const rachaElem = document.getElementById("racha");
    const puntosElem = document.getElementById("puntos");
    const nivelElem = document.getElementById("nivel");

    if (rachaElem) rachaElem.textContent = progreso.racha;
    if (puntosElem) puntosElem.textContent = progreso.puntos;
    if (nivelElem) nivelElem.textContent = progreso.nivel;

    actualizarMedallas();
  }

  // Mostrar datos iniciales
  actualizarUI();

  // --- Botón Pregunta del Día ---
  const btnPregunta = document.getElementById("btn-pregunta");
  if (btnPregunta) {
    btnPregunta.addEventListener("click", () => {
      const hoy = new Date().toISOString().split("T")[0];

      // Verificar si ya respondió hoy
      if (progreso.fechaUltimaPregunta === hoy) {
        alert("Ya respondiste la pregunta de hoy");
        return;
      }

      // Calcular racha
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const fechaAyer = ayer.toISOString().split("T")[0];
      progreso.racha = progreso.fechaUltimaPregunta === fechaAyer ? progreso.racha + 1 : 1;
      progreso.fechaUltimaPregunta = hoy;

      // Elegir pregunta aleatoria
      const indicePregunta = Math.floor(Math.random() * preguntas.length);
      localStorage.setItem("preguntaDelDia", JSON.stringify({ indice: indicePregunta }));

      // Actualizar puntos y nivel
      progreso.puntos++;
      if (progreso.puntos >= 100) progreso.nivel = "Diamante";
      else if (progreso.puntos >= 50) progreso.nivel = "Oro";
      else if (progreso.puntos >= 20) progreso.nivel = "Plata";
      else if (progreso.puntos >= 10) progreso.nivel = "Bronce";
      else progreso.nivel = "Hierro";

      // Guardar progreso y actualizar UI
      guardarProgreso();
      actualizarUI();

      // Redirigir a la pantalla de preguntas
      window.location.href = "/HTML/quiz.html";
    });
  }

});
