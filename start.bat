@echo off
rem Arc Descent - local server launcher (ES modules cannot load from file://)
rem serve.py disables caching so updated modules are never served stale
start "arc-descent-server" cmd /c "python "%~dp0serve.py" 8137"
rem fallback if python is missing:  npx -y http-server -p 8137 -c-1 "%~dp0"
timeout /t 1 >nul
start "" http://localhost:8137/
