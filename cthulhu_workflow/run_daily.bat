@echo off
chcp 65001 >nul
echo ============================================
echo   克苏鲁有声书 每日运营脚本
echo ============================================
echo.
echo [1] 生成今日音频
echo [2] 查看发布清单
echo [3] 记录今日数据
echo [4] 运行复盘
echo [5] 退出
echo.
set /p choice=请选择操作 (1-5):

if "%choice%"=="1" goto generate
if "%choice%"=="2" goto checklist
if "%choice%"=="3" goto data
if "%choice%"=="4" goto review
if "%choice%"=="5" goto end

:generate
echo.
echo 正在运行工作流...
python workflow_engine.py run
pause
goto end

:checklist
echo.
echo 最近的发布清单:
dir /b publish\checklist_*.json 2>nul
echo.
set /p checklist=请输入要查看的清单文件名:
type publish\%checklist% 2>nul
pause
goto end

:data
echo.
set /p platform=平台名称:
set /p plays=播放量:
set /p likes=点赞数:
set /p revenue=收益:
echo %date%,%platform%,,%plays%,0,%likes%,0,0,%revenue%, >> data\tracker.csv
echo 数据已记录!
pause
goto end

:review
echo.
echo 正在运行复盘...
python workflow_engine.py review
pause
goto end

:end
