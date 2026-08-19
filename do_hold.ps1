# Try to use Playwright mouse API via page context
# First find coordinates of press button
$findScript = '(function(){
  var iframe = document.querySelectorAll("iframe")[8];
  if (!iframe) return JSON.stringify({err: "no iframe"});
  
  var doc;
  try {
    doc = iframe.contentDocument || iframe.contentWindow.document;
  } catch(e) { return JSON.stringify({err: "doc: "+e.message}); }
  
  if (!doc) return JSON.stringify({err: "no doc"});
  
  // Look for all clickable elements
  var all = doc.querySelectorAll("*");
  var candidates = [];
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    var text = (el.textContent || "").trim();
    var rect = el.getBoundingClientRect();
    if (rect.width > 40 && rect.height > 20 && rect.y > 40 && rect.y < 250) {
      candidates.push({
        idx: i,
        tag: el.tagName,
        cls: el.className.slice(0,40),
        text: text.slice(0,30),
        x: Math.round(rect.x + rect.width/2),
        y: Math.round(rect.y + rect.height/2),
        w: Math.round(rect.width),
        h: Math.round(rect.height)
      });
    }
  }
  return JSON.stringify(candidates);
})()'

$jsonObj = @{ action = "evaluate"; script = $findScript }
$json = $jsonObj | ConvertTo-Json -Compress
Write-Host "=== Finding button candidates ==="
paw browser-action $json
