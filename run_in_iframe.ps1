$js = Get-Content "C:\Users\123\.meituan-catpaw\14880026\desk_default_workspace\remove_px.js" -Raw
$jsEscaped = $js -replace '"', '\"'
$payload = '{"action":"evaluate","script":"' + $jsEscaped + '"}'
Write-Host "Running in px-captcha-modal frame..."
& paw browser-action $payload
