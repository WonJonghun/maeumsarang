@echo off
setlocal
set "certFile=%~dp0intranet-192.168.90.20.cer"

if not exist "%certFile%" (
    echo Certificate file not found. Keep this script and the .cer file together.
    goto failed
)

certutil -hashfile "%certFile%" SHA256 | findstr /i /x "EEA48CB694C2F3AB59AB0A54A3CB536082FCA4E680FD70E3EF850918B9779831" >nul
if errorlevel 1 (
    echo Certificate fingerprint mismatch. Nothing was installed.
    goto failed
)

certutil -user -addstore Root "%certFile%"
if errorlevel 1 goto failed

echo.
echo Certificate installed for the CURRENT Windows user.
echo Close all Edge or Chrome windows, then open:
echo https://192.168.90.20:8081
pause
exit /b 0

:failed
echo.
echo Installation failed. Contact the intranet administrator.
pause
exit /b 1
