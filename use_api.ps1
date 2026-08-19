# Step 1: Look for Fiverr internal API endpoints by examining page scripts
$findApi = '(function(){
  // Look for API endpoints in page scripts
  var scripts = document.querySelectorAll("script");
  var apiPatterns = [];
  for (var i = 0; i < scripts.length; i++) {
    var text = scripts[i].textContent || "";
    if (text.includes("gig") || text.includes("GIG") || text.includes("api")) {
      var lines = text.split("\n");
      for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        if ((line.includes("/api/") || line.includes("/gig") || line.includes("graphql")) && line.length < 200) {
          apiPatterns.push(line.trim().slice(0, 100));
        }
      }
    }
    if (apiPatterns.length > 10) break;
  }
  return JSON.stringify(apiPatterns.slice(0, 20));
})()'

$jsonObj = @{ action = "evaluate"; script = $findApi }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
