(function(){
  var iframes = document.querySelectorAll("iframe");
  var iframe = null;
  for (var j = 0; j < iframes.length; j++) {
    if (iframes[j].title && iframes[j].title.indexOf("验证") !== -1) {
      iframe = iframes[j];
      break;
    }
  }
  if (!iframe) return "no iframe found";
  try {
    var win = iframe.contentWindow;
    var btn = win.document.querySelector("button");
    if (!btn) return "no button in iframe";
    btn.dispatchEvent(new win.Event("mousedown", {bubbles:true}));
    btn.dispatchEvent(new win.Event("pointerdown", {bubbles:true}));
    btn.dispatchEvent(new win.Event("touchstart", {bubbles:true}));
    btn.dispatchEvent(new win.MouseEvent("mousedown", {bubbles:true, cancelable:true}));
    return "events dispatched";
  } catch(e) {
    return "error: " + e.message;
  }
})()
