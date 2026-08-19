# Search for actual save/submit API endpoints in page resources
$inner = @'
(function(){
  // Check bigQueryEnrichment which might have API info
  if (window.bigQueryEnrichment) return "bigQuery: "+JSON.stringify(window.bigQueryEnrichment.url);
  
  // Search all loaded JavaScript resources
  var resources = performance.getEntriesByType("resource");
  var apiLike = resources.filter(function(r) {
    return r.name.indexOf("api") > -1 || r.name.indexOf("gig") > -1 || r.name.indexOf("wizard") > -1;
  }).map(function(r) { return r.name.slice(0, 100); });
  
  // Also look at the page HTML for form attributes
  var forms = document.querySelectorAll("form");
  var formInfo = [];
  forms.forEach(function(f) {
    formInfo.push({action: f.action, method: f.method, id: f.id, name: f.name});
  });
  
  return JSON.stringify({resources: apiLike.slice(0,15), forms: formInfo});
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
