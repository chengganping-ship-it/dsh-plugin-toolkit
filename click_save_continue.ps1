$inner = @'
(() => {
  var buttons = Array.from(document.querySelectorAll('button'));
  var saveContinue = buttons.find(function(b) { return b.textContent.trim().indexOf('Save & Continue') > -1; });
  if (saveContinue) {
    saveContinue.click();
    return 'clicked Save & Continue';
  }
  // Try by class
  var byClass = document.querySelector('.js-gig-submit, .btn-submit');
  if (byClass) {
    byClass.click();
    return 'clicked by class';
  }
  return 'no button found';
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
