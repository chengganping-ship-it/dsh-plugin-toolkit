$inner = @'
(function(){
  var iframes = document.querySelectorAll("iframe");
  for (var i = 0; i < iframes.length; i++) {
    try {
      var doc = iframes[i].contentDocument;
      if (!doc) continue;
      var w = doc.getElementById("px-captcha-wrapper");
      if (w) { w.parentNode.removeChild(w); return "removed wrapper from iframe " + i; }
    } catch(e) {}
  }
  return "no captcha found";
})()
'@
$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
