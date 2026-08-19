# Check iframe[0] dimensions now that it should be visible
$innerScript = '(function(){
  var iframe = document.querySelectorAll("iframe")[0];
  if (!iframe) return "no iframe";
  var rect = iframe.getBoundingClientRect();
  return JSON.stringify({src: iframe.src.slice(0,100), w: rect.width, h: rect.height, x: rect.x, y: rect.y, display: iframe.style.display});
})()'

$jsonObj = @{ action = "evaluate"; script = $innerScript }
$json = $jsonObj | ConvertTo-Json -Compress
Write-Host "=== Check iframe[0] ==="
paw browser-action $json
