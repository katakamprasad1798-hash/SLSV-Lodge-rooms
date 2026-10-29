@echo off
title SLSV Lodge - Backend Server
echo ========================================================
echo   SLSV Lodge Management System - Backend Server
echo ========================================================
echo.
echo Local PC Access:    http://localhost:8000
echo Local Wi-Fi Access: http://10.205.190.249:8000
echo API Docs:           http://localhost:8000/docs
echo.
echo Starting backend server on 0.0.0.0:8000...
echo.

cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause

