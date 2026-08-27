@echo off
chcp 65001 >nul
title 🎙️ 克苏鲁有声书 自循环系统

echo ══════════════════════════════════════════════════
echo    🎙️ 克苏鲁有声书 自循环闭环系统 v2.0
echo ══════════════════════════════════════════════════
echo.
echo  请选择要启动的模式:
echo.
echo    [1] 🚀 全自动模式 (启动24/7调度器)
echo    [2] 📊 查看Web看板 (http://localhost:8899)
echo    [3] 🔄 运行一次自循环 (手动)
echo    [4] 🎵 生成下一篇音频
echo    [5] 📝 查看最新日报
echo    [6] 📖 打开系统总览文档
echo.
echo ══════════════════════════════════════════════════
set /p choice=请输入数字 (1-6):

if "%choice%"=="1" goto scheduler
if "%choice%"=="2" goto dashboard
if "%choice%"=="3" goto loop
if "%choice%"=="4" goto audio
if "%choice%"=="5" goto report
if "%choice%"=="6" goto docs
goto end

:scheduler
echo.
echo 🚀 启动24/7全自动调度器...
echo   任务列表:
echo   - 每日02:00  自循环(复盘+策略进化)
echo   - 每日03:00  自动处理下一篇内容
echo   - 每周一09:00 生成周报
echo   - 每月1号10:00 月度策略调整
echo.
echo   按 Ctrl+C 停止
echo.
python scheduler.py
goto end

:dashboard
echo.
echo 📊 启动Web看板...
start http://localhost:8899
python dashboard.py
goto end

:loop
echo.
echo 🔄 运行一次自循环...
python self_loop_engine.py
pause
goto end

:audio
echo.
echo 🎵 生成下一篇音频...
python workflow_engine.py run
pause
goto end

:report
echo.
echo 📝 最新日报:
type data\daily_report_*.txt 2>nul
pause
goto end

:docs
echo.
echo 📖 打开系统总览...
start 系统总览.md
goto end

:end
