@echo off
setlocal

:: Kill any existing instances to clear ports (optional but safer)
taskkill /F /IM uvicorn.exe /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Sentinel Backend Service" >nul 2>&1

cd /d "%~dp0backend"

:: Activate Virtual Environment
set VENV_PATH=C:\Users\dhanu\OneDrive\Desktop\Trading_algorithm\myenv
call "%VENV_PATH%\Scripts\activate.bat"

:: Start Backend Hidden
:: We use /B to run in same process, but since we will wrap this bat in VBS, 
:: the whole thing is hidden.
:: However, uvicorn blocks. So we must use START /B to fork it.
start "Sentinel Backend Service" /B python -m uvicorn main:app --host 0.0.0.0 --port 3000 >nul 2>&1

:: Wait for server to boot
timeout /t 4 /nobreak >nul

:: Open in App Mode (Chrome or Edge)
:: Try standard paths.
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000"
) else (
    start msedge --app="http://localhost:3000"
)

exit
