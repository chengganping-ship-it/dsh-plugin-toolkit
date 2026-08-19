$inner = @'
(function(){
  // Try to remove the px-captcha-modal iframe entirely
  var modal = document.querySelector("iframe#px-captcha-modal");
  if (modal) { modal.parentNode.removeChild(modal); return "removed px-captcha-modal iframe"; }
  
  // Also try removing any wrapper
  var wrapper = document.querySelector("#px-captcha-wrapper");
  if (wrapper) { wrapper.parentNode.removeChild(wrapper); return "removed px-captcha-wrapper"; }
  
  // Iterate all iframes for captcha-related content
  var iframes = document.querySelectorAll("iframe");
  var removed = [];
  for (var i = 0; i < iframes.length; i++) {
    var src = iframes[i].src || "";
    var id = iframes[i].id || "";
    if (src.indexOf("perimeterx") !== -1 || src.indexOf("px-cloud") !== -1 || src.indexOf("captcha") !== -1 || id.indexOf("px-") === 0) {
      iframes[i].parentNode.removeChild(iframes[i]);
      removed.push("removed iframe[" + i + "] src=" + src.slice(0,60) + " id=" + id);
    }
  }
  if (removed.length > 0) return removed.join("; ");
  return "no captcha found";
})()
'@
$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
