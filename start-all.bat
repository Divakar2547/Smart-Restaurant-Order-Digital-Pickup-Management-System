@echo off
title Smart Restaurant - Start All
echo Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && node node_modules\nodemon\bin\nodemon.js server.js"
timeout /t 3 /nobreak > nul
echo Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && node node_modules\react-scripts\bin\react-scripts.js start"
echo.
echo Both servers starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
