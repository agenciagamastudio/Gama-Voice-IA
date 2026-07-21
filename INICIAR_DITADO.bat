@echo off
title GAMA Voz - Ditado Global
echo ============================================
echo   GAMA Voz - Ditado Global
echo   Segure Ctrl+Shift+Alt+Espaco e fale.
echo   Solte para o texto aparecer onde o cursor estiver.
echo ============================================
cd /d "%~dp0backend"
python ditado_global.py
pause
