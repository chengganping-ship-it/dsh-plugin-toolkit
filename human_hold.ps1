# Human-like press-and-hold simulation

# Phase 1: Approach movement with deceleration curve
$approach = @(
    @{x=320; y=595; s=5},
    @{x=350; y=605; s=4},
    @{x=375; y=612; s=3},
    @{x=390; y=615; s=3},
    @{x=397; y=616; s=2},
    @{x=400; y=616; s=2}
)

Write-Host "=== Phase 1: Approach ==="
foreach ($p in $approach) {
    paw browser-action "{\"action\":\"mouse\",\"x\":$($p.x),\"y\":$($p.y),\"steps\":$($p.s)}"
    Start-Sleep -Milliseconds 60
}

Write-Host "=== Phase 2: Press down ==="
paw browser-action '{"action":"mousedown","x":400,"y":616,"button":"left"}'
Start-Sleep -Milliseconds 100

Write-Host "=== Phase 3: Hold with micro-tremor ==="
# Simulate involuntary finger tremors during press
$jitter = @(
    @{dx=0; dy=0; ms=400},
    @{dx=1; dy=-1; ms=300},
    @{dx=-1; dy=1; ms=350},
    @{dx=0; dy=0; ms=300},
    @{dx=1; dy=0; ms=400},
    @{dx=-1; dy=-1; ms=250},
    @{dx=0; dy=1; ms=300},
    @{dx=1; dy=0; ms=350},
    @{dx=0; dy=0; ms=300}
)

foreach ($j in $jitter) {
    $jx = 400 + $j.dx
    $jy = 616 + $j.dy
    paw browser-action "{\"action\":\"mouse\",\"x\":$jx,\"y\":$jy,\"steps\":1}"
    Start-Sleep -Milliseconds $j.ms
}

Write-Host "=== Phase 4: Release ==="
paw browser-action '{"action":"mouseup","x":400,"y":616,"button":"left"}'
Write-Host "=== Done ==="
