// Mostrar datos iniciales
document.getElementById("racha").textContent = progreso.racha;
document.getElementById("puntos").textContent = progreso.puntos;
document.getElementById("nivel").textContent = progreso.nivel;

// Mostrar medallas según puntos
function actualizarMedallas() {
  document.getElementById("medalla-bronce").style.opacity = progreso.puntos >= 10 ? "1" : "0.3";
  document.getElementById("medalla-plata").style.opacity = progreso.puntos >= 20 ? "1" : "0.3";
  document.getElementById("medalla-oro").style.opacity = progreso.puntos >= 50 ? "1" : "0.3";
  document.getElementById("medalla-diamante").style.opacity = progreso.puntos >= 100 ? "1" : "0.3";
}
actualizarMedallas();

// Botón Pregunta del Día
document.getElementById("btn-pregunta").addEventListener("click", () => {
  const hoy = new Date().toISOString().split("T")[0];
  if(progreso.fechaUltimaPregunta === hoy) {
    alert("Ya respondiste la pregunta de hoy");
    return;
  }

  // Guardar fecha y sumar racha si es consecutiva
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const fechaAyer = ayer.toISOString().split("T")[0];

  progreso.racha = progreso.fechaUltimaPregunta === fechaAyer ? progreso.racha + 1 : 1;
  progreso.fechaUltimaPregunta = hoy;
  progreso.puntos++; // por responder (suponemos correcta)
  
  // Actualizar nivel
  if (progreso.puntos >= 100) progreso.nivel = "Diamante";
  else if (progreso.puntos >= 50) progreso.nivel = "Oro";
  else if (progreso.puntos >= 20) progreso.nivel = "Plata";
  else if (progreso.puntos >= 10) progreso.nivel = "Bronce";
  else progreso.nivel = "Hierro";

  guardarProgreso();

  // Actualizar UI
  document.getElementById("racha").textContent = progreso.racha;
  document.getElementById("puntos").textContent = progreso.puntos;
  document.getElementById("nivel").textContent = progreso.nivel;
  actualizarMedallas();

  alert("Pregunta del día desbloqueada (aún falta la pantalla de preguntas)");
});
