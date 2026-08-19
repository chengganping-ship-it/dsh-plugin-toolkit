# Comprehensive PerimeterX pointer+mouse event dispatch
$inner = @'
(function(){
  var iframe = document.querySelectorAll("iframe")[8];
  if (!iframe) return "no iframe[8]";
  var doc = iframe.contentDocument;
  var win = iframe.contentWindow;
  var target = doc.getElementById("px-captcha");
  if (!target) return "no px-captcha";
  var rect = target.getBoundingClientRect();
  var cx = rect.x + rect.width / 2;
  var cy = rect.y + rect.height / 2;
  
  function fire(type, x, y, isPointer) {
    var Ctor = isPointer ? win.PointerEvent : win.MouseEvent;
    var opts = {
      clientX: x, clientY: y, bubbles: true, cancelable: true,
      screenX: x, screenY: y, view: win, pointerId: 1, pointerType: "mouse",
      button: 0, buttons: 1, isPrimary: true
    };
    var ev = new Ctor(type, opts);
    target.dispatchEvent(ev);
  }
  
  var steps = [];
  
  // Approach with micro-delays
  var approach = [[350,606],[375,610],[390,614],[397,615],[400,616]];
  approach.forEach(function(p) {
    fire("pointermove", p[0], p[1], true);
    fire("mousemove", p[0], p[1], false);
  });
  
  // Press
  fire("pointerdown", cx, cy, true);
  fire("mousedown", cx, cy, false);
  
  // Hold with jitter
  var jitters = [[0,0,400],[1,-1,200],[-1,1,200],[0,0,300],[1,0,200],[-1,-1,200]];
  jitters.forEach(function(j) {
    fire("pointermove", cx+j[0], cy+j[1], true);
    fire("mousemove", cx+j[0], cy+j[1], false);
  });
  
  // Release
  fire("pointerup", cx, cy, true);
  fire("mouseup", cx, cy, false);
  fire("click", cx, cy, false);
  
  return JSON.stringify({fired:true, cx:Math.round(cx), cy:Math.round(cy), targetTag:target.tagName, targetClass:target.className});
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
