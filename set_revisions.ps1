$inner = @'
(function() {
  var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  var hiddenMap = {};
  document.querySelectorAll('input[type="hidden"]').forEach(function(inp) {
    if (inp.name) hiddenMap[inp.name] = inp;
  });
  
  var mods = [
    ['gig[packages][1][content][613][pricing_factor][included_modifications]', '1'],
    ['gig[packages][2][content][720][pricing_factor][included_modifications]', '2'],
    ['gig[packages][3][content][827][pricing_factor][included_modifications]', '3']
  ];
  
  var result = {};
  mods.forEach(function(m) {
    var el = hiddenMap[m[0]];
    if (el) {
      nativeSetter.call(el, m[1]);
      el.dispatchEvent(new Event('change', {bubbles: true}));
      result[m[0]] = el.value;
    } else {
      result[m[0]] = 'MISSING';
    }
  });
  
  return JSON.stringify(result);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
