@echo off
chcp 65001 >nul
title Funding Rate Sentinel
cd /d "%~dp0"
echo 正在启动 Sentinel...
echo.
node dist\sentinel.js --config sentinel.json
pause
