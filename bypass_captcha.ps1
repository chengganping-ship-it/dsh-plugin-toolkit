# Try to use the same session to call Fiverr internal API
$innerScript = '(function(){
  var results = {cookies: document.cookie.substring(0,200), localStorage: {}};
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.includes("gig")) results.localStorage[key] = localStorage.getItem(key).substring(0, 100);
    }
  } catch(e) {}
  return JSON.stringify(results);
})()'

$jsonObj = @{ action = "evaluate"; script = $innerScript }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
