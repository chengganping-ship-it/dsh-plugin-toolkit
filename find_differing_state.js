(function(){
  var all = document.querySelectorAll("input[type=text]");
  var results = [];
  for (var idx = 0; idx < all.length; idx++) {
    var el = all[idx];
    var fk = Object.keys(el).find(function(k){ return k.indexOf("__reactFiber") === 0; });
    if (!fk) continue;
    var f = el[fk];
    var t = 0;
    while (f && t < 30) {
      t++;
      if (f.memoizedState) {
        var curState = f.memoizedState;
        var d = 0;
        while (curState && d < 20) {
          d++;
          try {
            var q = curState.queue;
            if (q && typeof q.dispatch === "function") {
              var lrs = q.lastRenderedState;
              var ms = curState.memoizedState;
              var lrsInfo = null;
              if (typeof lrs === "string" && lrs !== "ATS Resume Writer" && lrs !== "Alex M." && lrs.length > 0 && lrs.length < 200) {
                lrsInfo = { type: "string", val: lrs };
              } else if (typeof lrs === "object" && lrs !== null) {
                var keys = Object.keys(lrs);
                if (keys.length > 0 && keys.length < 10) {
                  lrsInfo = { type: "object", keys: keys, hasValueProp: lrs.value !== undefined };
                  if (lrsInfo.hasValueProp && typeof lrs.value === "string" && lrs.value !== "ATS Resume Writer" && lrs.value !== "Alex M.") {
                    lrsInfo.valuePreview = lrs.value.substring(0, 50);
                  }
                }
              } else if (typeof lrs === "boolean" || typeof lrs === "number") {
                lrsInfo = { type: typeof lrs, val: "" + lrs };
              }
              if (lrsInfo) {
                results.push({
                  inputIndex: idx,
                  fiberDepth: t,
                  hookDepth: d,
                  lrs: lrsInfo
                });
              }
            }
          } catch(e) {}
          curState = curState.next || null;
        }
      }
      f = f.return || null;
    }
  }
  return JSON.stringify(results);
})()
