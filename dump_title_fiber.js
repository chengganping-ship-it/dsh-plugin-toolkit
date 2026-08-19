(function(){
  var all = document.querySelectorAll("input[type=text]");
  var el = all[1]; // title input
  var fk = Object.keys(el).find(function(k){ return k.indexOf("__reactFiber") === 0; });
  if (!fk) return "no fiber";
  var f = el[fk];
  var results = [];
  var t = 0;
  while (f && t < 35) {
    t++;
    if (f.memoizedState) {
      var curState = f.memoizedState;
      var d = 0;
      while (curState && d < 25) {
        d++;
        var entry = { t: t, d: d };
        try {
          var q = curState.queue;
          var ms = curState.memoizedState;
          var lrs = q ? q.lastRenderedState : undefined;
          if (ms === undefined) {
            entry.msType = "undefined";
          } else if (typeof ms === "string") {
            entry.ms = ms.substring(0, 80);
          } else if (typeof ms === "number") {
            entry.ms = ms;
          } else if (typeof ms === "boolean") {
            entry.ms = ms;
          } else if (ms === null) {
            entry.ms = "null";
          } else if (typeof ms === "object") {
            try { entry.ms = JSON.stringify(ms).substring(0, 80); } catch(e) { entry.ms = "[err]"; }
          } else {
            entry.ms = "" + ms;
          }
          
          if (lrs === undefined) {
            entry.lrsType = "undefined";
          } else if (typeof lrs === "string") {
            entry.lrs = lrs.substring(0, 100);
          } else if (typeof lrs === "number") {
            entry.lrs = lrs;
          } else if (typeof lrs === "boolean") {
            entry.lrs = lrs;
          } else if (lrs === null) {
            entry.lrs = "null";
          } else if (typeof lrs === "object") {
            try { entry.lrs = JSON.stringify(lrs).substring(0, 100); } catch(e) { entry.lrs = "[err]"; }
          }
          
          entry.hasDispatch = !!(q && q.dispatch);
        } catch(e) {
          entry.error = e.message;
        }
        results.push(entry);
        curState = curState.next;
        if (!curState) break;
      }
    }
    f = f.return;
    if (!f) break;
  }
  return JSON.stringify(results);
})()
