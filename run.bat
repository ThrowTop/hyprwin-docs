@echo off
setlocal
cd /d "%~dp0"
set "SITE_URL=http://localhost:4321/hyprwin-docs/"

if not exist "node_modules\" (
    call npm install
    if errorlevel 1 goto :error
)

call npx --no-install astro dev stop >nul 2>&1

call npm run dev -- --open
if errorlevel 1 goto :error

start "" "%SITE_URL%"
exit /b 0

:error
echo.
echo Failed to start the HyprWin documentation site.
pause
exit /b 1
