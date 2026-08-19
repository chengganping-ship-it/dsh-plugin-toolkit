$inner = @'
(function(){
  var iframes = document.querySelectorAll("iframe");
  var results = [];
  for (var i = 0; i < iframes.length; i++) {
    var f = iframes[i];
    try {
      var rect = f.getBoundingClientRect();
      results.push({
        i: i,
        title: f.title || "(none)",
        src: (f.src || "").slice(0, 100),
        x: rect ? Math.round(rect.x) : "?",
        y: rect ? Math.round(rect.y) : "?",
        w: rect ? Math.round(rect.width) : "?",
        h: rect ? Math.round(rect.height) : "?"
      });
    } catch(e) {
      results.push({i: i, err: e.message});
    }
  }
  return JSON.stringify(results);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
