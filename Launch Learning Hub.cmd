@echo off
setlocal
cd /d "%~dp0"
if not exist "%~dp0node_modules\electron\dist\electron.exe" (
  echo The desktop runtime is not installed yet. See README.md.
  pause
  exit /b 1
)
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0."
exit /b 0
