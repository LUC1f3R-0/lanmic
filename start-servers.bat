@echo off
echo Starting LANMIC Authentication System...

echo Starting Backend Server (Port 3002)...
start "Backend Server" cmd /k "cd backend && npm run start:dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3002
echo API Docs: http://localhost:3002/api
echo.
echo Press any key to exit...
pause >nul
