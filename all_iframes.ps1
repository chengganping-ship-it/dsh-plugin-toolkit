$inner = @'
(function(){
  var iframes = document.querySelectorAll("iframe");
  var results = [];
  for (var i = 0; i < iframes.length; i++) {
    var f = iframes[i];
    var rect = f.getBoundingClientRect();
    results.push({
      i: i,
      title: f.title || "(none)",
      src: (f.src || "").slice(0, 100),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      w: Math.round(rect.width),
      h: Math.round(rect.height)
    });
  }
  return JSON.stringify(results);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
