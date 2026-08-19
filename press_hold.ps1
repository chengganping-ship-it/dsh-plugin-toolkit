function Invoke-Browser {
    param([hashtable]$Action)
    $json = $Action | ConvertTo-Json -Compress
    paw browser-action $json
}

# Human-like press and hold with micro-movements at the iframe position
$centerX = 640
$centerY = 530

# Move to button position
Invoke-Browser @{action="mouse"; x=$centerX; y=$centerY}
Start-Sleep -Milliseconds 200

# Press down
Invoke-Browser @{action="mousedown"; x=$centerX; y=$centerY; button="left"}
Write-Host "Pressed down at $centerX, $centerY"

# Hold with micro-tremors (human-like) for 3.5 seconds
$holdMs = 3500
$elapsed = 0
while ($elapsed -lt $holdMs) {
    $dx = Get-Random -Minimum -2 -Maximum 3
    $dy = Get-Random -Minimum -2 -Maximum 3
    $newX = $centerX + $dx
    $newY = $centerY + $dy
    Invoke-Browser @{action="mousemove"; x=$newX; y=$newY}
    Start-Sleep -Milliseconds 50
    $elapsed += 50
}

# Release
Invoke-Browser @{action="mouseup"; x=$centerX; y=$centerY; button="left"}
Write-Host "Released at $centerX, $centerY"
