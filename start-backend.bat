@echo off
title Smart Restaurant - Backend
cd /d "%~dp0backend"
node node_modules\nodemon\bin\nodemon.js server.js
pause
