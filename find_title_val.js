(function(){
  var all = document.querySelectorAll("*");
  for (var i = 0; i < all.length; i++) {
    var fk = null;
    var ks = Object.keys(all[i]);
    for (var j = 0; j < ks.length; j++) {
      if (ks[j].indexOf("__reactFiber") === 0) {
        fk = ks[j];
        break;
      }
    }
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
            var lrs = curState.queue ? curState.queue.lastRenderedState : undefined;
            var lrsStr = lrs !== undefined ? JSON.stringify(lrs) : null;
            if (lrsStr && lrsStr.indexOf("one_liner_title") >= 0) {
              return JSON.stringify({
                found: true,
                hasDispatch: !!(curState.queue && curState.queue.dispatch),
                lrsPreview: lrsStr.substring(0, 1000)
              });
            }
          } catch(e) {}
          if (curState.next) curState = curState.next; else break;
        }
      }
      if (f.return) f = f.return; else break;
    }
  }
  return "not found";
})()
