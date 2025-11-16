const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); //esto va con el link

const API_URL = process.env.API_URL || 'https://api-nodepost-production.up.railway.app';
const DATA_DIR = path.join(__dirname, 'assets', 'data');

async function fetchWithFallback(remotePath, localFileName, builtin = []) {
  try {
    const url = `${API_URL.replace(/\/$/, '')}/${remotePath.replace(/^\//, '')}`;
    const resp = await axios.get(url, { timeout: 5000 });
    if (resp && resp.status === 200) return resp.data;
  } catch (err) {}
  try {
    const full = path.join(DATA_DIR, localFileName);
    const txt = await fs.readFile(full, 'utf8');
    return JSON.parse(txt);
  } catch (err) {}
  return builtin;
}

// API
app.get('/api/candidatos', async (req, res) => {
  res.json(await fetchWithFallback('/candidatos', 'candidatos.json', []));
});

app.get('/api/partidos', async (req, res) => {
  res.json(await fetchWithFallback('/partidos', 'partidos.json', []));
});

app.get('/api/noticias', async (req, res) => {
  res.json(await fetchWithFallback('/noticias', 'noticias.json', []));
});

app.get('/api/locales', async (req, res) => {
  res.json(await fetchWithFallback('/locales', 'locales.json', []));
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', api_url: API_URL });
});

// Archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'HTML')));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) 
    return res.status(404).json({ error: 'Not found' });

  res.sendFile(path.join(__dirname, 'HTML', 'index.html'));
});

// Puerto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
