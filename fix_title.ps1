$inner = @'
(function(){
  var title = document.querySelector("textarea.gig-title-textarea");
  if (!title) return "no textarea";
  var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  nativeSetter.call(title, "write ATS optimized resumes with JD keyword gap analysis");
  title.dispatchEvent(new Event("input", {bubbles: true}));
  title.dispatchEvent(new Event("change", {bubbles: true}));
  var hidden = document.querySelector("input[name=\"gig[title]\"]");
  if (hidden) {
    var hiddenSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    hiddenSetter.call(hidden, "write ATS optimized resumes with JD keyword gap analysis");
    hidden.dispatchEvent(new Event("change", {bubbles: true}));
  }
  return "title: " + title.value.slice(0, 50);
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
