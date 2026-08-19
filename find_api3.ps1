# Look at ALL script contents to find API endpoints
$inner = @'
(function(){
  var scripts = document.querySelectorAll("script");
  var results = [];
  for (var i = 0; i < scripts.length; i++) {
    var text = scripts[i].textContent || "";
    // Find any URL path patterns that look like API endpoints
    var lines = text.split(";");
    for (var j = 0; j < lines.length; j++) {
      if (lines[j].indexOf("/api/") > -1) results.push(lines[j].trim().slice(0, 100));
      else if (lines[j].indexOf("/v1/") > -1) results.push(lines[j].trim().slice(0, 100));
      else if (lines[j].indexOf("/gigs") > -1 && lines[j].length < 100) results.push(lines[j].trim().slice(0,100));
    }
    if (results.length > 30) break;
  }
  return JSON.stringify(results.slice(0, 30));
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
