# Find Fiverr internal API endpoints by looking at page JS
$findApi = '(function(){
  var all = document.querySelectorAll("script");
  var endpoints = [];
  for (var i = 0; i < all.length; i++) {
    var src = all[i].src || "";
    var text = all[i].textContent || "";
    if (src.includes("gig") || src.includes("wizard") || text.includes("gigs/new") || text.includes("save_gig")) {
      endpoints.push({src: src.slice(0,100), text: text.slice(0,200)});
    }
  }
  return JSON.stringify(endpoints.slice(0,5));
})()'

$jsonObj = @{ action = "evaluate"; script = $findApi }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
