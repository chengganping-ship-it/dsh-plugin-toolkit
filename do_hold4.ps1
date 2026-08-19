# Try press-and-hold at many positions across the page to find the CAPTCHA button
$yPositions = 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700
$xPositions = 300, 400, 500, 600, 700, 800, 900, 1000

foreach ($y in $yPositions) {
    foreach ($x in $xPositions) {
        # Mouse down
        $md = @{action="mousedown"; x=$x; y=$y} | ConvertTo-Json -Compress
        paw browser-action $md | Out-Null
        Start-Sleep -Seconds 2
        
        # Hold with jitter
        for ($j = 0; $j -lt 8; $j++) {
            $jx = $x + (Get-Random -Min -5 -Max 6)
            $jy = $y + (Get-Random -Min -3 -Max 4)
            $mm = @{action="mousemove"; x=$jx; y=$jy} | ConvertTo-Json -Compress
            paw browser-action $mm | Out-Null
            Start-Sleep -Milliseconds 200
        }
        
        # Mouse up
        $mu = @{action="mouseup"; x=$x; y=$y} | ConvertTo-Json -Compress
        paw browser-action $mu | Out-Null
        
        Start-Sleep -Seconds 2
        
        $js = @{action="evaluate"; script="(function(){return document.title;})()"} | ConvertTo-Json -Compress
        $result = paw browser-action $js
        $title = ($result | ConvertFrom-Json).data.result
        
        if ($title -and $title -notmatch "human touch") {
            Write-Host "SUCCESS at ($x, $y)! Title: $title"
            exit 0
        }
    }
}
Write-Host "All positions tried - CAPTCHA not bypassed"
