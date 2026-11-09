@echo off
set LOG=D:\work\cxmooc-desktop\launch.log
echo ======================================>> "%LOG%"
echo %date% %time%>> "%LOG%"
echo APPDATA=%APPDATA%>> "%LOG%"
cd /d "D:\work\cxmooc-desktop"
if not exist "node_modules\electron\dist\electron.exe" (
  echo [ERROR] electron.exe not found>> "%LOG%"
  echo [ERROR] electron.exe not found
  pause
  exit /b 1
)
del /q "D:\work\cxmooc-desktop\chromium.log" 2>nul
echo launching now (will wait 10s)...
"node_modules\electron\dist\electron.exe" . --no-sandbox --no-zygote --disable-gpu-compositing --use-angle=d3d11-warp-webgl --enable-logging=file --log-file=D:\work\cxmooc-desktop\chromium.log --v=0
set EL=%errorlevel%
echo launch-return=%EL%>> "%LOG%"
timeout /t 10 /nobreak >nul
echo ---- electron processes after 10s ---- >> "%LOG%"
tasklist /fi "imagename eq electron.exe" >> "%LOG%" 2>&1
echo ---- end ---- >> "%LOG%"
echo.
echo return-code=%EL%
echo electron.exe processes right now (ignore the 4 with start time yesterday / dsh-pet):
tasklist /fi "imagename eq electron.exe"
echo.
echo [A] a NEW electron.exe listed (started just now) = app IS running, check taskbar or tray
echo [B] only old ones or NO TASKS = still failing, keep window open and reply "done2"
pause