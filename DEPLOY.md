# Despliegue — Instrucciones rápidas

Esto prepara y despliega la aplicación desde el repositorio `Proyecto-x-Lenguaje`.

Requisitos locales
- Docker instalado y funcionando.
- (Opcional) `curl` para triggers HTTP.

Opciones de despliegue
1) Despliegue mediante GitHub Actions (recomendado)
   - Tenemos el workflow en `.github/workflows/ci-deploy.yml`. Al hacer `git push` a `main` se construye la imagen y se sube a GHCR. También puede subir a Docker Hub si configuras secrets.
   - Añade los siguientes Secrets en tu repositorio GitHub (Settings → Secrets → Actions):
     - `DOCKERHUB_USERNAME` — tu usuario Docker Hub
     - `DOCKERHUB_TOKEN` — token o contraseña de Docker Hub
     - (Opcional) `RENDER_API_KEY` y `RENDER_SERVICE_ID` — para que el workflow dispare un deploy en Render

   - Para activar: commit + push a `main` y abre Actions → CI Build & Deploy para ver logs.

2) Despliegue manual (desde Windows `cmd.exe`)
   - Establece variables de entorno en la sesión CMD:

```cmd
set DOCKERHUB_USERNAME=tu_usuario
set DOCKERHUB_TOKEN=tu_token
```

   - Ejecuta el script que construye y hace push a Docker Hub:

```cmd
cd \ruta\a\Proyecto-x-Lenguaje
scripts\deploy_dockerhub.bat
```

   - Si quieres trigger un deploy en Render, configura también:

```cmd
set RENDER_API_KEY=tu_api_key
set RENDER_SERVICE_ID=tu_service_id
```

3) Ejecutar localmente (prueba rápida antes de push)
```cmd
docker build -t proyecto-x-local:latest .
docker run -p 8080:8080 proyecto-x-local:latest
```
Luego abre `http://localhost:8080`.

Notas técnicas
- El servidor Node usa `process.env.PORT || 8080` (archivo `index.js`). El `Dockerfile` expone 8080.
- CI construye y sube a `ghcr.io/<owner>/<repo>` con tag `latest` y `sha`.

Siguientes pasos sugeridos
- Dime a qué proveedor quieres desplegar (Render, Azure, Heroku, AWS, etc.) para generar plantillas o `render.yaml`/`azure` config.
- O, si quieres que yo empuje y dispare el workflow, da acceso a tu repositorio/credenciales (no recomendado por seguridad).