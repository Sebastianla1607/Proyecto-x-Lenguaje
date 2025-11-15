const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = process.env.API_URL || 'https://api-nodepost-production.up.railway.app';
const DATA_DIR = path.join(__dirname, 'assets', 'data');

async function fetchWithFallback(remotePath, localFileName, builtin = []) {
  // 1) Try remote
  try {
    const url = `${API_URL.replace(/\/$/, '')}/${remotePath.replace(/^\//, '')}`;
    const resp = await axios.get(url, { timeout: 5000 });
    if (resp && resp.status === 200) return resp.data;
  } catch (err) {
    // ignore and fallback
  }

  // 2) Try local file
  try {
    const full = path.join(DATA_DIR, localFileName);
    const txt = await fs.readFile(full, 'utf8');
    return JSON.parse(txt);
  } catch (err) {
    // ignore and fallback
  }

  // 3) Builtin fallback
  return builtin;
}

// API endpoints
app.get('/api/candidatos', async (req, res) => {
  const data = await fetchWithFallback('/candidatos', 'candidatos.json', []);
  res.json(data);
});

app.get('/api/partidos', async (req, res) => {
  const data = await fetchWithFallback('/partidos', 'partidos.json', []);
  res.json(data);
});

app.get('/api/noticias', async (req, res) => {
  const data = await fetchWithFallback('/noticias', 'noticias.json', []);
  res.json(data);
});

app.get('/api/locales', async (req, res) => {
  const data = await fetchWithFallback('/locales', 'locales.json', []);
  res.json(data);
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', api_url: API_URL });
});

// Servir los archivos estáticos de la aplicación (CRA `build/`)
app.use(express.static(path.join(__dirname, 'build')));

// Todas las rutas van al index.html (soporta client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Puerto dinámico para Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
