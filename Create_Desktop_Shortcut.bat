@echo off
set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\SLSV Lodge Management.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%~dp0frontend\release\SLSV Lodge-win32-x64\SLSV Lodge.exe" >> %SCRIPT%
echo oLink.WorkingDirectory = "%~dp0frontend\release\SLSV Lodge-win32-x64" >> %SCRIPT%
echo oLink.Description = "Sri Lakshmi Srungara Vallabha Service Rooms & Lodge Management" >> %SCRIPT%
echo oLink.IconLocation = "%~dp0frontend\public\icon.ico, 0" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo Desktop shortcut created successfully on your Windows Desktop!
