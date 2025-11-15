const express = require('express');
const path = require('path');
const app = express();

// Middleware para JSON (API)
app.use(express.json());

// --- API Endpoints ---
app.get('/pedidos', (req, res) => res.json([{ id: 1, detalle: "Pedido 1" }]));

// --- Servir Flutter Web ---
app.use(express.static(path.join(__dirname, 'build/web')));

// Todas las rutas que no sean API van a index.html
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build/web', 'index.html')));

// Puerto dinámico para Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));