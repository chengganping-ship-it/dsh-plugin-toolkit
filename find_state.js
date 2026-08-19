(function(){
  var results = [];
  var allElements = document.querySelectorAll("*");
  for (var i = 0; i < allElements.length; i++) {
    var keys = Object.keys(allElements[i]);
    var fk = null;
    for (var j = 0; j < keys.length; j++) {
      if (keys[j].indexOf("__reactFiber") === 0) {
        fk = keys[j];
        break;
      }
    }
    if (!fk) continue;
    var f = allElements[i][fk];
    var tries = 0;
    while (f && tries < 5) {
      tries++;
      if (f.memoizedState) {
        var cur = f.memoizedState;
        var depth = 0;
        while (cur && depth < 10) {
          depth++;
          var ms = cur.memoizedState;
          var lrs = cur.queue ? cur.queue.lastRenderedState : undefined;
          var found = false;
          if (typeof ms === "string" && ms.indexOf("Add title") >= 0) {
            found = true;
          }
          if (typeof lrs === "string" && lrs.indexOf("Add title") >= 0) {
            found = true;
          }
          if (found) {
            results.push({
              elIndex: i,
              fiberTries: tries,
              hookDepth: depth,
              ms: typeof ms === "string" ? ms : typeof ms,
              lrs: typeof lrs === "string" ? lrs : typeof lrs,
              hasDispatch: !!(cur.queue && cur.queue.dispatch)
            });
          }
          if (cur.next) {
            cur = cur.next;
          } else {
            break;
          }
        }
      }
      if (f.return) {
        f = f.return;
      } else {
        break;
      }
    }
  }
  return JSON.stringify(results.slice(0, 10));
})()
