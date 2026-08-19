# Find all inputs and identify category selector
$inner = @'
(function(){
  var inputs = document.querySelectorAll("input");
  var results = [];
  for (var i = 0; i < inputs.length; i++) {
    var el = inputs[i];
    if (el.className.indexOf("dummyInput") > -1 || el.className.indexOf("select") > -1 || el.id.indexOf("select") > -1) {
      results.push({i: i, id: el.id, cls: el.className.slice(0, 50), type: el.type, name: el.name, val: el.value.slice(0, 30)});
    }
  }
  return JSON.stringify(results);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
