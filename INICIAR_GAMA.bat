@echo off
setlocal enabledelayedexpansion
title GAMA Voz - Frontend & Backend
color 0A

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  🎤 GAMA VOZ - Inicializando Sistema...        ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Matar APENAS processos GAMA anteriores (por porta, não por nome)
REM Isso evita matar Claude Code, browsers e outras ferramentas
echo [SETUP] Limpando portas anteriores...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5001') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173') do taskkill /PID %%a /F >nul 2>&1
timeout /t 2 /nobreak >nul

echo [1/2] Iniciando Backend (FastAPI/Uvicorn)...
cd /d "%~dp0backend"
start "GAMA Backend" cmd /k python -m uvicorn main:app --reload --port 5001
timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend (Vite/React)...
cd /d "%~dp0frontend"
start "GAMA Frontend" cmd /k npm run dev

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  ✅ GAMA Voz iniciado com sucesso!           ║
echo ╚════════════════════════════════════════════════╝
echo.
echo 🔗 Acesse em seu navegador:
echo.
echo   Frontend:  http://localhost:5173/
echo   Backend:   http://localhost:5001/docs
echo.
echo ⏹️  Para fechar tudo: execute FECHAR_GAMA.bat
echo.
pause
