$inner = @'
(function(){
  var catSelector = document.getElementById("react-select-37998-input");
  if (!catSelector) return "no cat selector";
  catSelector.click();
  catSelector.focus();
  return "opened";
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
