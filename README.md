# Proyecto X - Despliegue

Este repositorio contiene el frontend y utilidades para desplegarlo. Aquí encontrarás pasos rápidos para construir y desplegar en Railway, opciones con Docker y cómo ejecutar localmente.

## Requisitos
- Node.js 16–18 (recomendado)
- npm

## Comandos útiles (local)
- Instalar dependencias:
```bash
npm ci
```
- Build de producción:
```bash
npm run build
```
- Servir la carpeta `build/` localmente (producción):
```bash
npm run start:prod
# o usando npx serve
npx serve -s build -l 3000
```

## Despliegue en Railway (rápido)
1. Conecta este repositorio a un proyecto en Railway.
2. En **Build settings** configura:
   - Build command: `npm ci && npm run build`
   - Start command: dejar vacío (Rails usará `Procfile`) o `npm run start:prod`
3. Asegúrate de que Railway use Node 18 (ver `engines` en `package.json` o configura Node en los settings del proyecto).
4. Railway detectará `Procfile` y ejecutará `web: npm run start:prod`, que sirve `build/` con `serve`.

## Despliegue con Docker
El repo incluye un `Dockerfile` multi-stage que construye la app y la sirve con `nginx`.

Para construir localmente:
```bash
docker build -t proyecto-x .
docker run -p 8080:80 proyecto-x
```
Luego abre `http://localhost:8080`.

En Railway puedes elegir desplegar desde Dockerfile si prefieres control completo sobre la imagen.

## Variables de entorno
- Para el frontend no son necesarias por defecto, pero si usas variables env coloca un fichero `.env` en la raíz (no subir a git) o configura Secrets en GitHub/Railway.
- Para la app móvil y CI, define `API_URL` como secret:
  - GitHub: `Settings > Secrets > New repository secret` → `API_URL` = `https://api-nodepost-production.up.railway.app`
  - Railway: Project → Variables → Add variable `API_URL`

## GitHub Actions
Se incluye un ejemplo en `.github/workflows/android-build.yml` que inyecta `API_URL` desde secrets y construye Android (si aplica a tu proyecto móvil).

## Probar la API (rápido)
Desde tu máquina:
```bash
curl -i https://api-nodepost-production.up.railway.app/
```
Para un endpoint concreto:
```bash
curl -sS https://api-nodepost-production.up.railway.app/noticias | jq .
```

## Notas finales
- Mantén `.env` fuera del repositorio (añadido a `.gitignore`).
- `start:prod` usa `serve -s build -l $PORT` (Procfile) — Railway ejecutará este comando en producción.
- Si prefieres que sirva la carpeta `HTML/` (tu contenido estático original) en vez de la build de React, dímelo y preparo los cambios.

Si quieres que haga algún ajuste automático adicional (ej. añadir `.nvmrc`, más secrets, o instrucciones para CI específicas), dime cuál y lo implemento.
# Proyecto-x-Lenguaje
le dimos duro hasta el final
