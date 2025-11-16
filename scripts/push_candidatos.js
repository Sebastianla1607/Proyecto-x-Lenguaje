// Script para subir candidatos a la API remota
// Uso: desde la raíz del proyecto
// 1) Instalar dependencias (si no las tienes): npm install node-fetch@2
// 2) Poner los candidatos en `assets/data/candidatos_to_upload.json` (array)
// 3) Ejecutar: node scripts\push_candidatos.js
// Opcional: si la API requiere autenticación, exporta `API_TOKEN` y el script
// añadirá el header `Authorization: Bearer <token>` automáticamente.

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // requiere node-fetch@2

const API = process.env.API_URL || 'https://api-nodepost-production.up.railway.app/candidatos';
const API_TOKEN = process.env.API_TOKEN || null;
const filePath = path.join(__dirname, '..', 'assets', 'data', 'candidatos_to_upload.json');

async function loadCandidates() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error('El archivo debe contener un array de candidatos');
  return arr;
}

async function postCandidate(c) {
  const headers = { 'Content-Type': 'application/json' };
  if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`;

  const res = await fetch(API, {
    method: 'POST',
    headers,
    body: JSON.stringify(c),
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, body: text };
}

(async function main() {
  try {
    const candidatos = await loadCandidates();
    console.log('Candidatos a subir:', candidatos.length);
    for (const c of candidatos) {
      try {
        const r = await postCandidate(c);
        console.log(`id=${c.id || '-'} -> ${r.status} ${r.ok ? 'OK' : 'FAIL'}`);
        if (!r.ok) console.log('Respuesta:', r.body);
      } catch (e) {
        console.error('Error subiendo candidato', c.id || '-', e.message);
      }
    }
    console.log('Proceso terminado. Revisa la API para confirmar los cambios.');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
