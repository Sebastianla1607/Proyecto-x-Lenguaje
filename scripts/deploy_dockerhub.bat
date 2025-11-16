@echo off
REM Deploy script for Windows (cmd.exe)
REM Requires environment variables: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN

if "%DOCKERHUB_USERNAME%"=="" (
  echo Error: set DOCKERHUB_USERNAME environment variable and rerun.
  exit /b 1
)
if "%DOCKERHUB_TOKEN%"=="" (
  echo Error: set DOCKERHUB_TOKEN environment variable and rerun.
  exit /b 1
)

set IMAGE_NAME=%DOCKERHUB_USERNAME%/proyecto-x:latest

echo Building Docker image %IMAGE_NAME% ...
docker build -t %IMAGE_NAME% .
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)

echo Logging in to Docker Hub ...
echo %DOCKERHUB_TOKEN% | docker login -u %DOCKERHUB_USERNAME% --password-stdin
if errorlevel 1 (
  echo Docker login failed.
  exit /b 1
)

echo Pushing image ...
docker push %IMAGE_NAME%
if errorlevel 1 (
  echo Push failed.
  exit /b 1
)

echo Image pushed: %IMAGE_NAME%

REM Optional: trigger Render deploy if variables are present
if not "%RENDER_API_KEY%"=="" if not "%RENDER_SERVICE_ID%"=="" (
  echo Triggering Render deploy...
  curl -X POST "https://api.render.com/v1/services/%RENDER_SERVICE_ID%/deploys" -H "Authorization: Bearer %RENDER_API_KEY%" -H "Content-Type: application/json" -d "{\"clearCache\": true}"
)

echo Done.
