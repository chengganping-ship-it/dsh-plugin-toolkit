# Hive Protocol Agent - Windows 快速设置脚本
# 运行方式: Right-click -> Run with PowerShell

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🐝 Hive Protocol Agent 快速设置" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# 检查 Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "❌ 未检测到 Python，请先安装 Python 3.10+" -ForegroundColor Red
    Write-Host "   下载地址: https://python.org/downloads" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Python版本: $(python --version)" -ForegroundColor Green

# 创建虚拟环境
if (-not (Test-Path "venv")) {
    Write-Host "📦 创建虚拟环境..." -ForegroundColor Yellow
    python -m venv venv
}

# 激活虚拟环境
Write-Host "🚀 激活虚拟环境..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Yellow
pip install requests

# 创建配置目录
if (-not (Test-Path "hive_workspace")) {
    New-Item -ItemType Directory -Path "hive_workspace" | Out-Null
    Write-Host "✅ 创建工作目录: hive_workspace\" -ForegroundColor Green
}

# 完成
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "🎉 设置完成！" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 编辑 .env.example 文件，填入你的配置，保存为 .env" -ForegroundColor White
Write-Host "2. 运行: python hive_agent.py" -ForegroundColor White
Write-Host ""
Write-Host "或者在PowerShell中运行:" -ForegroundColor Cyan
Write-Host "  python hive_agent.py" -ForegroundColor White
Write-Host ""
pause
