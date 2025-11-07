@echo off
echo Starting GCN Robustness Lab - Full Application
echo =============================================
echo.

echo Starting Backend Server...
start "GCN Backend" cmd /k "cd /d %~dp0 && python run.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Development Server...
start "GCN Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul