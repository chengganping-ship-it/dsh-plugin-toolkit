# Find iframe[title=人工验证挑战] rect from parent document perspective
$inner = @'
(function(){
  var iframes = document.querySelectorAll("iframe");
  var results = [];
  for (var i = 0; i < iframes.length; i++) {
    var f = iframes[i];
    if (f.title && f.title.indexOf("验") > -1) {
      var rect = f.getBoundingClientRect();
      results.push({
        title: f.title, 
        src: (f.src || "").slice(0, 80),
        x: Math.round(rect.x), 
        y: Math.round(rect.y), 
        w: Math.round(rect.width), 
        h: Math.round(rect.height)
      });
    }
  }
  return JSON.stringify(results);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
