# Find the CAPTCHA button on the new challenge page
$inner = @'
(function(){
  // Find iframes with title containing verification challenge
  var iframes = document.querySelectorAll("iframe");
  var results = [];
  for (var i = 0; i < iframes.length; i++) {
    var f = iframes[i];
    var title = f.title || "";
    if (title.indexOf("验证") > -1 || title.indexOf("captcha") > -1 || title.indexOf("challenge") > -1) {
      var rect = f.getBoundingClientRect();
      results.push({i:i, title:title, x:Math.round(rect.x), y:Math.round(rect.y), w:Math.round(rect.width), h:Math.round(rect.height)});
    }
  }
  // Also look for any "按住" or "Press" text elements
  var all = document.querySelectorAll("button, [role=button]");
  for (var j = 0; j < all.length; j++) {
    var btn = all[j];
    if (btn.textContent && (btn.textContent.indexOf("按") > -1 || btn.textContent.indexOf("Press") > -1 || btn.textContent.indexOf("Hold") > -1)) {
      var r = btn.getBoundingClientRect();
      results.push({tag:"BUTTON", text:btn.textContent.trim(), x:Math.round(r.x + r.width/2), y:Math.round(r.y + r.height/2), w:Math.round(r.width), h:Math.round(r.height)});
    }
  }
  return JSON.stringify(results);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
