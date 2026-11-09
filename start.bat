@echo off
title cxmooc-desktop
cd /d "%~dp0"
if not exist "node_modules\electron\dist\electron.exe" (
  echo [ERROR] electron.exe not found. Run: node get-electron-bin.js
  pause
  exit /b 1
)
echo Starting app...
"node_modules\electron\dist\electron.exe" . --no-sandbox --no-zygote --disable-gpu-compositing --use-angle=d3d11-warp-webgl
if errorlevel 1 (
  echo.
  echo [FAILED] exit code = %errorlevel%
  echo - If another instance is running: kill all electron.exe in Task Manager, then retry
  echo - Send me everything printed above
  pause
)