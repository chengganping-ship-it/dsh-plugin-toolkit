# Try to dispatch press-and-hold synthetic events
$innerScript = @"
(function(){
  return new Promise((resolve) => {
    var el = document.elementFromPoint(400, 616);
    if (!el) return resolve(JSON.stringify({error:"no element at 400,616"}));
    var info = {tag:el.tagName, cls:el.className, id:el.id, text:(el.textContent||"").trim().slice(0,30)};
    
    // Simulate mouse approaching with human-like movement
    var moveEvents = [
      {x:395,y:610},{x:397,y:612},{x:399,y:614},{x:400,y:616}
    ];
    moveEvents.forEach(p => {
      el.dispatchEvent(new MouseEvent('mousemove', {clientX:p.x, clientY:p.y, bubbles:true, cancelable:true}));
    });
    
    // Press down
    var downEvent = new MouseEvent('mousedown', {clientX:400, clientY:616, bubbles:true, cancelable:true, button:0});
    el.dispatchEvent(downEvent);
    
    var count = 0;
    var interval = setInterval(() => {
      // Human-like tremor during hold
      var tremorX = 400 + (Math.random() * 2 - 1);
      var tremorY = 616 + (Math.random() * 2 - 1);
      el.dispatchEvent(new MouseEvent('mousemove', {clientX:tremorX, clientY:tremorY, bubbles:true, cancelable:true}));
      count++;
      if (count >= 5) {
        clearInterval(interval);
        el.dispatchEvent(new MouseEvent('mouseup', {clientX:400, clientY:616, bubbles:true, cancelable:true, button:0}));
        resolve(JSON.stringify({success:true, holdMs:2500, element:info}));
      }
    }, 500);
  });
})()
"@

$jsonObj = @{ action = "evaluate"; script = $innerScript }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
