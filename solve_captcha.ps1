# Step 1: Find the CAPTCHA button position inside the unnamed iframe
$step1 = '(function(){
  var iframes = document.querySelectorAll("iframe");
  for (var i = 0; i < iframes.length; i++) {
    var rect = iframes[i].getBoundingClientRect();
    if (rect.width > 700 && rect.height > 500) {
      try {
        var doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
        var all = doc.querySelectorAll("*");
        var btnInfo = [];
        for (var j = 0; j < all.length; j++) {
          var el = all[j];
          var r = el.getBoundingClientRect();
          var text = (el.textContent || "").trim().substring(0, 40);
          if ((el.tagName === "BUTTON" || el.tagName === "DIV" || el.tagName === "A") && r.width > 50 && r.height > 20) {
            btnInfo.push({tag: el.tagName, cls: el.className.slice(0,50), text: text, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), cx: Math.round(r.x+r.width/2), cy: Math.round(r.y+r.height/2)});
          }
        }
        return JSON.stringify({frameIdx: i, found: btnInfo});
      } catch(e) {
        return JSON.stringify({frameIdx: i, error: e.message});
      }
    }
  }
  return JSON.stringify({error: "no large iframe found"});
})()'

$jsonObj = @{ action = "evaluate"; script = $step1 }
$json = $jsonObj | ConvertTo-Json -Compress
Write-Host "=== Finding CAPTCHA button ==="
paw browser-action $json
