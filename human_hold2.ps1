# Human-like press-and-hold simulation
function Invoke-Browser {
    param([hashtable]$Action)
    $json = $Action | ConvertTo-Json -Compress
    paw browser-action $json
}

# Phase 1: Approach
Write-Host "=== Phase 1: Approach ==="
$path = @(
    @{x=320;y=595;s=5},
    @{x=355;y=606;s=4},
    @{x=380;y=613;s=3},
    @{x=395;y=616;s=2},
    @{x=400;y=616;s=2}
)
foreach ($p in $path) {
    Invoke-Browser @{action="mouse"; x=$p.x; y=$p.y; steps=$p.s}
    Start-Sleep -Milliseconds 60
}

# Phase 2: Press
Write-Host "=== Phase 2: Press ==="
Invoke-Browser @{action="mousedown"; x=400; y=616; button="left"}
Start-Sleep -Milliseconds 200

# Phase 3: Hold with micro-tremors
Write-Host "=== Phase 3: Hold ==="
$jitter = @(
    @{x=400;y=616;d=400},
    @{x=401;y=615;d=300},
    @{x=399;y=617;d=350},
    @{x=400;y=616;d=300},
    @{x=402;y=615;d=400},
    @{x=398;y=616;d=300},
    @{x=401;y=617;d=250},
    @{x=400;y=616;d=300}
)
foreach ($j in $jitter) {
    Invoke-Browser @{action="mouse"; x=$j.x; y=$j.y; steps=1}
    Start-Sleep -Milliseconds $j.d
}

# Phase 4: Release
Write-Host "=== Phase 4: Release ==="
Invoke-Browser @{action="mouseup"; x=400; y=616; button="left"}
Write-Host "=== DONE ==="
