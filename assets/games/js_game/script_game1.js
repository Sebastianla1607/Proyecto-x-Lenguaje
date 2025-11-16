document.addEventListener("DOMContentLoaded", () => {

  let progreso = JSON.parse(localStorage.getItem("progreso")) || {
    puntos: 0,
    racha: 0,
    nivel: "Hierro",
    fechaUltimaPregunta: null
  };

  function guardarProgreso() {
    localStorage.setItem("progreso", JSON.stringify(progreso));
  }

  function actualizarMedallas() {
    const medallas = {
      bronce: document.getElementById("medalla-bronce"),
      plata: document.getElementById("medalla-plata"),
      oro: document.getElementById("medalla-oro"),
      diamante: document.getElementById("medalla-diamante")
    };
    if(medallas.bronce) medallas.bronce.style.opacity = progreso.puntos >= 10 ? "1" : "0.3";
    if(medallas.plata) medallas.plata.style.opacity = progreso.puntos >= 20 ? "1" : "0.3";
    if(medallas.oro) medallas.oro.style.opacity = progreso.puntos >= 50 ? "1" : "0.3";
    if(medallas.diamante) medallas.diamante.style.opacity = progreso.puntos >= 100 ? "1" : "0.3";
  }

  function actualizarUI() {
    const rachaElem = document.getElementById("racha");
    const puntosElem = document.getElementById("puntos");
    const nivelElem = document.getElementById("nivel");

    if (rachaElem) rachaElem.textContent = progreso.racha;
    if (puntosElem) puntosElem.textContent = progreso.puntos;
    if (nivelElem) nivelElem.textContent = progreso.nivel;

    actualizarMedallas();
  }

  actualizarUI();

  const btnPregunta = document.getElementById("btn-pregunta");
  if(btnPregunta){
    btnPregunta.addEventListener("click", () => {

      // Generar índice aleatorio sin depender de preguntas.js
      const indicePregunta = Math.floor(Math.random()*5); // 5 preguntas
      localStorage.setItem("preguntaDelDia", JSON.stringify({ indice: indicePregunta }));

      // Actualizar racha diaria (modo test)
      const ayer = new Date(); ayer.setDate(ayer.getDate()-1);
      const fechaAyer = ayer.toISOString().split("T")[0];
      progreso.racha = progreso.fechaUltimaPregunta === fechaAyer ? progreso.racha+1 : 1;
      progreso.fechaUltimaPregunta = new Date().toISOString().split("T")[0];
      progreso.puntos++; // cada pregunta suma 1 punto

      if(progreso.puntos>=100) progreso.nivel="Diamante";
      else if(progreso.puntos>=50) progreso.nivel="Oro";
      else if(progreso.puntos>=20) progreso.nivel="Plata";
      else if(progreso.puntos>=10) progreso.nivel="Bronce";
      else progreso.nivel="Hierro";

      guardarProgreso();
      actualizarUI();

      window.location.href = "quiz.html";
    });
  }

});
