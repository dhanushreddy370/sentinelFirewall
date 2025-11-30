@echo off
setlocal
title Sentinel Browser Launcher

echo ==================================================
echo       SENTINEL BROWSER - SECURE AI AGENT
echo ==================================================
echo.

:: Navigate to the backend directory
cd /d "%~dp0backend"

echo [1/3] Verifying Python Environment...
:: Install dependencies quietly
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Could not install dependencies. Please ensure Python is installed and added to PATH.
    pause
    exit /b
)

echo [2/3] Launching Sentinel Backend...
:: Start the server in a new minimized window
start "Sentinel Server" /MIN python -m uvicorn main:app --host 0.0.0.0 --port 3000

echo [3/3] Waiting for server to initialize...
timeout /t 4 /nobreak >nul

echo [4/4] Opening Comet Browser Interface...
start http://localhost:3000

echo.
echo ==================================================
echo    SUCCESS! Sentinel is active.
echo    The backend is running in the background.
echo    Close the "Sentinel Server" window to stop it.
echo ==================================================
echo.
pause
