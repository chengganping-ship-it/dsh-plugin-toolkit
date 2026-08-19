$findApi = @'
(function(){
  var results = [];
  var scripts = document.querySelectorAll("script");
  for (var i = 0; i < scripts.length; i++) {
    var text = scripts[i].textContent || "";
    if (text.length > 100 && text.indexOf("gig") > -1 && text.length < 3000) {
      results.push("SCR"+i+": "+text.substring(0,150));
    }
    if (results.length > 5) break;
  }
  // Also look at window.__INITIAL_DATA__ or window.appConfig
  if (window.__PUBLIC_DATA__) results.push("PUB_DATA: "+JSON.stringify(Object.keys(window.__PUBLIC_DATA__)));
  if (window.__INITIAL_STATE__) results.push("INIT_STATE: "+JSON.stringify(Object.keys(window.__INITIAL_STATE__)));
  if (window.app) results.push("app: "+typeof window.app);
  return JSON.stringify(results);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $findApi }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
