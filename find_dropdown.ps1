$inner = @'
(function(){
  // Look for react-select menu portal and all menu items
  var portals = document.querySelectorAll("[class*=menu-portal], [class*=menu], [class*=option]");
  var results = [];
  portals.forEach(function(el) {
    results.push({
      tag: el.tagName,
      cls: el.className.slice(0, 50),
      text: el.textContent.trim().slice(0, 50),
      vis: el.style.display
    });
  });
  
  // Also look for SELECT elements
  var selects = document.querySelectorAll("select");
  selects.forEach(function(el) {
    results.push({tag:"SELECT#"+el.id, name:el.name, optCount:el.options.length});
  });
  
  // Also look for any newly opened dropdowns/overlays
  var overlays = document.querySelectorAll("[class*=overlay], [class*=dropdown], [class*=portal]");
  overlays.forEach(function(el) {
    var r = el.getBoundingClientRect();
    if (r.width > 0) results.push({overlay: el.tagName, cls: el.className.slice(0,30), w: r.width, h: r.height});
  });
  
  return JSON.stringify(results);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
