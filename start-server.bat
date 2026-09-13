@echo off
title Tile Kings Local Web Server Launcher
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
