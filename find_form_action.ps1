# Find the actual form submission endpoint by examining React fiber/internal state
$inner = @'
(function(){
  // Find React root or use event listener tracing
  var allScripts = document.querySelectorAll("script");
  var matches = [];
  for (var i = 0; i < allScripts.length; i++) {
    var text = allScripts[i].textContent || "";
    if (text.length < 100) continue;
    // Look for save endpoints
    var re = /["'](\/[^"']*(?:save|submit|create|gig|wizard)[^"']*)["']/gi;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (matches.indexOf(m[1]) === -1) matches.push(m[1]);
      if (matches.length > 20) break;
    }
    if (matches.length > 20) break;
  }
  return JSON.stringify(matches);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
