# Sentinel 7x24 自动运行 — Windows 计划任务设置脚本
# 用法: 以管理员身份运行 PowerShell，然后执行:
#   powershell -ExecutionPolicy Bypass -File setup-task.ps1

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodePath = (Get-Command node).Source
$sentinelScript = Join-Path $scriptDir "dist\sentinel.js"
$configFile = Join-Path $scriptDir "sentinel.json"

if (-not (Test-Path $sentinelScript)) {
    Write-Error "找不到 $sentinelScript. 请先运行: cd $scriptDir && npm install && npm run build"
    exit 1
}

$taskName = "FundingRateSentinel"
$arguments = "`"$sentinelScript`" --config `"$configFile`""

# 创建任务: 开机自启、后台运行
$action = New-ScheduledTaskAction -Execute $nodePath -Argument $arguments -WorkingDirectory $scriptDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
        -Settings $settings -Principal $principal -Description "Funding Rate Arbitrage Sentinel - 7x24" -Force
    Write-Host "✅ 任务 '$taskName' 创建成功" -ForegroundColor Green
    Write-Host "   状态: 已注册" -ForegroundColor Cyan

    # 立即启动
    Start-ScheduledTask -TaskName $taskName
    Write-Host "   已启动" -ForegroundColor Green

    Write-Host ""
    Write-Host "管理命令:" -ForegroundColor Yellow
    Write-Host "  查看状态: Get-ScheduledTask -TaskName '$taskName'"
    Write-Host "  停止:     Stop-ScheduledTask -TaskName '$taskName'"
    Write-Host "  启动:     Start-ScheduledTask -TaskName '$taskName'"
    Write-Host "  删除:     Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
    Write-Host "  查看日志: Get-Content '$(Join-Path $scriptDir 'out.log')' -Tail 20 -Wait"
} catch {
    Write-Error "创建失败: $_"
}
