@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "FRONT=%CD%\FrontEnd"
set "BACK=%CD%\Backend\venv\config"
set "VENV=%CD%\.launcher-venv-windows"
if not exist "%FRONT%\package.json" (echo Missing FrontEnd\package.json & pause & exit /b 1)
if not exist "%BACK%\manage.py" (echo Missing Backend\venv\config\manage.py & pause & exit /b 1)
where npm >nul 2>&1 || (echo Node.js/npm not found. Install Node.js. & pause & exit /b 1)
if not exist "%VENV%\Scripts\python.exe" (
  py -3.14 -m venv "%VENV%" 2>nul
  if not exist "%VENV%\Scripts\python.exe" py -3.13 -m venv "%VENV%" 2>nul
  if not exist "%VENV%\Scripts\python.exe" py -3.12 -m venv "%VENV%" 2>nul
  if not exist "%VENV%\Scripts\python.exe" (echo Python 3.12+ required. Install it and enable py launcher. & pause & exit /b 1)
)
"%VENV%\Scripts\python.exe" -c "import django, rest_framework, decouple, corsheaders, django_filters, drf_spectacular, rest_framework_simplejwt, PIL" >nul 2>&1
if errorlevel 1 (
  "%VENV%\Scripts\python.exe" -m pip install -r "%CD%\launcher-requirements.txt"
  if errorlevel 1 (echo Python dependency installation failed & pause & exit /b 1)
)
if not exist "%FRONT%\node_modules" (
  pushd "%FRONT%"
  if exist package-lock.json (call npm ci) else (call npm install)
  if errorlevel 1 (popd & echo npm install failed & pause & exit /b 1)
  popd
)
if not exist "%BACK%\.env" echo WARNING: Backend .env file is missing.
if "%RUN_MIGRATIONS%"=="1" (
  pushd "%BACK%"
  "%VENV%\Scripts\python.exe" manage.py migrate --noinput
  if errorlevel 1 (popd & pause & exit /b 1)
  popd
)
echo Frontend: http://127.0.0.1:5173
echo Backend:  http://127.0.0.1:8000
echo Two windows will open. Close them to stop the servers.
start "AlgoHub Backend" /D "%BACK%" cmd /k ""%VENV%\Scripts\python.exe" manage.py runserver 127.0.0.1:8000"
start "AlgoHub Frontend" /D "%FRONT%" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"
exit /b 0
