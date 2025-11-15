// URL base de la API. Cuando se use en navegador sin bundler, se usará
// la URL por defecto. En entornos con bundler (CRA, Vite, etc.) puedes
// definir `REACT_APP_API_URL` o la variable correspondiente.
export const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
  ? process.env.REACT_APP_API_URL
  : "https://api-nodepost-production.up.railway.app";

// Helper pequeño para llamadas a la API que construye la URL y parsea JSON.
export async function fetchApi(path, options) {
  const prefix = path.startsWith('/') ? '' : '/';
  const url = `${API_URL}${prefix}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch error ${res.status}: ${text}`);
  }
  return res.json();
}

// Ejemplo de uso (descomenta/importa en el archivo que necesite hacer la petición):
// import { API_URL, fetchApi } from './config';
// fetchApi('/mi-endpoint')
//   .then(data => console.log(data))
//   .catch(err => console.error(err));