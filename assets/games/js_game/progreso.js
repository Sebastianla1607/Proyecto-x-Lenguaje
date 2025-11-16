// progreso.js
let progreso = JSON.parse(localStorage.getItem("progreso")) || {
  racha: 0,
  fechaUltimaPregunta: null,
  puntos: 0,
  nivel: "Hierro"
};

function guardarProgreso() {
  localStorage.setItem("progreso", JSON.stringify(progreso));
}
