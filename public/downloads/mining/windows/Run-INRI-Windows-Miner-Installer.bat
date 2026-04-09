@echo off
setlocal
set "URL=https://www.inri.life/downloads/mining/windows/INRI-Windows-Miner-Installer.ps1"
set "PS1=%TEMP%\INRI-Windows-Miner-Installer.ps1"
echo Downloading INRI Windows Miner Installer...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%URL%' -OutFile '%PS1%'; & '%PS1%'"
if errorlevel 1 (
  echo.
  echo Installer failed. Run this file as Administrator and try again.
  pause
)
endlocal
