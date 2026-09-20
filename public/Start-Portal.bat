@echo off
setlocal
cd /d "%~dp0"

echo ===============================================================
echo   Quantix Platform Admin - local portal
echo ===============================================================
echo.
echo   Serving this folder on the first free port it can find,
echo   starting at 3001. The address is printed below.
echo.
echo   The API must also be running, at http://localhost:5104.
echo   Start it with Start-Quantix.bat in the API folder.
echo.
echo   Press Ctrl+C to stop.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-portal.ps1"

if errorlevel 1 (
  echo.
  echo   Could not start a local server on any port.
  echo.
  echo   Use the API package instead - it already contains this portal
  echo   and serves it at http://localhost:5104. Run Start-Quantix.bat
  echo   in the API folder.
  echo.
  pause
)
