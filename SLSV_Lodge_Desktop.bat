@echo off
title SLSV Lodge Management Desktop Application
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
start "" "%~dp0frontend\release\SLSV Lodge-win32-x64\SLSV Lodge.exe"
exit

