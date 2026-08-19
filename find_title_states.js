(function(){
  var all = document.querySelectorAll("*");
  var titleRelatedStates = [];
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
            var q = curState.queue;
            if (q && q.dispatch && q.lastRenderedState !== undefined) {
              var ms = curState.memoizedState;
              var lrs = q.lastRenderedState;
              
              // Check if this is a string state that could be the title value
              if (typeof lrs === "string" && lrs.length < 150) {
                titleRelatedStates.push({
                  elTag: all[i].tagName,
                  elClass: (all[i].className || "").substring(0, 60),
                  fiberDepth: t,
                  hookDepth: d,
                  value: lrs,
                  hasDispatch: true
                });
              }
              
              // Check object state for nested title value
              if (lrs && typeof lrs === "object" && !lrs["1"]) {
                var objKeys = Object.keys(lrs);
                if (objKeys.length < 15 && objKeys.length > 0) {
                  var foundTitleKey = null;
                  for (var k = 0; k < objKeys.length; k++) {
                    var key = objKeys[k];
                    var val = lrs[key];
                    if (key.toLowerCase().indexOf("title") >= 0 && typeof val === "string") {
                      foundTitleKey = { key: key, val: val };
                    }
                    if (key === "value" && typeof val === "string" && val.length < 150) {
                      foundTitleKey = { key: "value", val: val };
                    }
                  }
                  if (foundTitleKey) {
                    titleRelatedStates.push({
                      type: "obj_with_title",
                      elTag: all[i].tagName,
                      objKeys: objKeys,
                      titleKey: foundTitleKey.key,
                      titleVal: foundTitleKey.val,
                      keyCount: objKeys.length
                    });
                  }
                }
              }
            }
          } catch(e) {}
          if (curState.next) curState = curState.next; else break;
        }
      }
      if (f.return) f = f.return; else break;
    }
  }
  return JSON.stringify(titleRelatedStates.slice(0, 25));
})()
