(function(){
  var all = document.querySelectorAll("*");
  var fixed = [];
  for (var i = 0; i < all.length; i++) {
    var fk = Object.keys(all[i]).find(function(k){ return k.indexOf("__reactFiber") === 0; });
    if (!fk) continue;
    var f = all[i][fk];
    var t = 0;
    while (f && t < 60) {
      t++;
      if (f.memoizedState) {
        var curState = f.memoizedState;
        var d = 0;
        while (curState && d < 25) {
          d++;
          try {
            if (curState.queue && curState.queue.lastRenderedState !== undefined) {
              var lrs = curState.queue.lastRenderedState;
              if (typeof lrs === "string" && lrs.indexOf("Unable to transform response") >= 0) {
                if (typeof curState.queue.dispatch === "function") {
                  try { curState.queue.dispatch({type: "RESET"}); fixed.push("RESET t"+t+" d"+d); } catch(e) {}
                  try { curState.queue.dispatch({type: "reset"}); fixed.push("reset"); } catch(e) {}
                  try { curState.queue.dispatch({type: "CLEAR_ERROR"}); fixed.push("CLEAR_ERROR"); } catch(e) {}
                }
                curState.queue.lastRenderedState = "";
                curState.memoizedState = "";
                fixed.push("cleared t"+t+" d"+d);
              }
            }
          } catch(e) {}
          curState = curState.next || null;
        }
      }
      f = f.return || null;
    }
  }
  return "fixed: " + fixed.join(", ");
})()
