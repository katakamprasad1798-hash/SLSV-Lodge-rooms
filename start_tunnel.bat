@echo off
title SLSV Lodge - Cloudflare Tunnel
echo ========================================================
echo   SLSV Lodge Management System - Cloudflare Tunnel
echo ========================================================
echo.
echo Forwarding http://localhost:8000 to the internet...
echo Look for the https://*.trycloudflare.com URL below.
echo.
echo Copy that URL and append /api into the APK Server URL setting.
echo.

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8000
pause

