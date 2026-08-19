# Look at all script tags that contain data or URLs about the Fiverr GUI
$findApi = '(function(){
  var results = [];
  // Look at all links with various href patterns
  var links = document.querySelectorAll("link[href]");
  links.forEach(function(el) {
    var href = el.getAttribute("href") || "";
    if (href.includes("gig") || href.includes("manage")) results.push("link: " + href.slice(0,80));
  });

  // Look for script tags with inline content containing API paths
  var scripts = document.querySelectorAll("script");
  for (var i = 0; i < scripts.length; i++) {
    var text = scripts[i].textContent || "";
    if (text.length > 50 && text.length < 10000) {
      var matches = text.match(/["\']\/api\/v\d\/[^"\']+/g);
      if (matches) {
        matches.forEach(function(m) { results.push("api-match: " + m); });
      }
      var matches2 = text.match(/["\'][^"\']*graphql[^"\']*/gi);
      if (matches2) {
        matches2.forEach(function(m) { results.push("graphql: " + m.slice(0,80)); });
      }
      var matches3 = text.match(/["\'][^"\']*gig[^"\']*save[^"\']*["\']|["\'][^"\']*save[^"\']*gig[^"\']*["\']/gi);
      if (matches3) {
        matches3.forEach(function(m) { results.push("save-gig: " + m.slice(0,80)); });
      }
      var matches4 = text.match(/["\'][^"\']*wizard[^"\']*["\']/gi);
      if (matches4) {
        matches4.forEach(function(m) { results.push("wizard: " + m.slice(0,80)); });
      }
    }
    if (results.length > 15) break;
  }
  return JSON.stringify(results.slice(0,20));
})()'

$jsonObj = @{ action = "evaluate"; script = $findApi }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
