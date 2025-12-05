@echo off
setlocal
title Sentinel Browser Launcher

echo ==================================================
echo       SENTINEL BROWSER - SECURE AI AGENT
echo ==================================================
echo.

:: 1. Build Frontend
echo [1/4] Building Frontend...
cd /d "%~dp0frontend_app"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
call npm run build
if %errorlevel% neq 0 (
    echo Error: Frontend build failed.
    pause
    exit /b
)

:: 2. Setup Backend
echo [2/4] Setting up Backend...
cd /d "%~dp0backend"

:: Activate Virtual Environment (User specified path)
set VENV_PATH=C:\Users\dhanu\OneDrive\Desktop\Trading_algorithm\myenv
if exist "%VENV_PATH%\Scripts\activate.bat" (
    call "%VENV_PATH%\Scripts\activate.bat"
) else (
    echo Warning: Virtual environment not found at %VENV_PATH%.
    echo Please ensure the path is correct.
    pause
    exit /b
)

:: Install dependencies
pip install -r requirements.txt >nul 2>&1

:: 3. Launch Server
echo [3/4] Launching Sentinel Backend...
:: Start uvicorn in a new window so this script can continue
start "Sentinel Server" /MIN python -m uvicorn main:app --host 0.0.0.0 --port 3000

:: 4. Open Browser
echo [4/4] Opening Interface...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ==================================================
echo    SUCCESS! Sentinel is active.
echo    The backend is running in the background.
echo    Close the "Sentinel Server" window to stop it.
echo ==================================================
echo.
pause
