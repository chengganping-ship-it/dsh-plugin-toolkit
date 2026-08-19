$ErrorActionPreference = "Stop"

# Build the script we want to evaluate
$innerScript = @'
(function(){
  var iframes = document.querySelectorAll("iframe");
  var results = [];
  for (var i = 0; i < iframes.length; i++) {
    var rect = iframes[i].getBoundingClientRect();
    if (rect.width > 100 && rect.height > 50) {
      results.push({
        title: iframes[i].title || "none",
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height)
      });
    }
  }
  return JSON.stringify(results, null, 2);
})()
'@

# Convert to single-line for JSON
$oneLine = $innerScript -replace "`r`n", " " -replace "`n", " " -replace "\s+", " "

# Build JSON using .NET to avoid escaping issues
$jsonObj = @{ action = "evaluate"; script = $oneLine }
$json = $jsonObj | ConvertTo-Json -Compress

Write-Host "Sending JSON: $json"

& paw browser-action $json
