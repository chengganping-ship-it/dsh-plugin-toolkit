function Invoke-Browser {
    param([hashtable]$Action)
    $json = $Action | ConvertTo-Json -Compress
    paw browser-action $json
}

# 精确按压坐标
$centerX = 395
$centerY = 171

# 移动到位
Invoke-Browser @{action="mouse"; x=$centerX; y=$centerY}
Start-Sleep -Milliseconds 300

# 按下
Invoke-Browser @{action="mousedown"; x=$centerX; y=$centerY; button="left"}
Write-Host "Pressed at $centerX, $centerY"

# 按压 3.5 秒，带人体抖动
$elapsed = 0
while ($elapsed -lt 3500) {
    $dx = Get-Random -Minimum -3 -Maximum 4
    $dy = Get-Random -Minimum -3 -Maximum 4
    Invoke-Browser @{action="mousemove"; x=($centerX + $dx); y=($centerY + $dy)}
    Start-Sleep -Milliseconds 40
    $elapsed += 40
}

# 释放
Invoke-Browser @{action="mouseup"; x=$centerX; y=$centerY; button="left"}
Write-Host "Released"
