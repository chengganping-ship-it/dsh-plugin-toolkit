# Human-like captcha button press
# Target: center of viewport ~(718, 529) where the PerimeterX hold button usually is

# Phase 1: Approach from upper-left with deceleration curve
$approach = @(
    @{x=400; y=350; s=5},
    @{x=550; y=440; s=4},
    @{x=650; y=490; s=3},
    @{x=700; y=515; s=3},
    @{x=715; y=525; s=2},
    @{x=718; y=528; s=2}
)

Write-Host "=== Phase 1: Approach ==="
foreach ($p in $approach) {
    paw browser-action "{\"action\":\"mouse\",\"x\":$($p.x),\"y\":$($p.y),\"steps\":$($p.s)}"
    Start-Sleep -Milliseconds 60
}

Write-Host "=== Phase 2: Press down ==="
paw browser-action '{"action":"mousedown","x":718,"y":528,"button":"left"}'
Start-Sleep -Milliseconds 100

Write-Host "=== Phase 3: Hold 8s with micro-tremor ==="
$jitter = @(
    @{dx=0; dy=0; ms=800},
    @{dx=1; dy=-1; ms=600},
    @{dx=-1; dy=1; ms=700},
    @{dx=0; dy=0; ms=600},
    @{dx=1; dy=0; ms=800},
    @{dx=-1; dy=-1; ms=500},
    @{dx=0; dy=1; ms=600},
    @{dx=1; dy=1; ms=700},
    @{dx=-1; dy=0; ms=600},
    @{dx=0; dy=-1; ms=700},
    @{dx=0; dy=0; ms=500}
)

foreach ($j in $jitter) {
    $jx = 718 + $j.dx
    $jy = 528 + $j.dy
    paw browser-action "{\"action\":\"mouse\",\"x\":$jx,\"y\":$jy,\"steps\":1}"
    Start-Sleep -Milliseconds $j.ms
}

Write-Host "=== Phase 4: Release ==="
paw browser-action '{"action":"mouseup","x":718,"y":528,"button":"left"}'
Write-Host "=== Done ==="
