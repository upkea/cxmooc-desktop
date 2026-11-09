@echo off
chcp 65001 >nul
title 学习通桌面版
cd /d "%~dp0"
if not exist "node_modules\electron\dist\electron.exe" (
  echo [错误] 没找到 Electron 运行时，请先双击 get-electron-bin 或重新运行安装。
  pause
  exit /b 1
)
"node_modules\electron\dist\electron.exe" .