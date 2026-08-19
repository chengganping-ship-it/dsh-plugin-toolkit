(function(){
  var all = document.querySelectorAll("div");
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
    var triesF = 0;
    while (f && triesF < 80) {
      triesF++;
      if (f.memoizedState) {
        var curState = f.memoizedState;
        var hookDepth = 0;
        while (curState && hookDepth < 25) {
          hookDepth++;
          try {
            var q = curState.queue;
            if (q && q.lastRenderedState !== undefined && q.dispatch && typeof q.dispatch === "function") {
              var lrsType = typeof q.lastRenderedState;
              if (lrsType === "object" && q.lastRenderedState !== null) {
                var keys = Object.keys(q.lastRenderedState);
                if (keys.indexOf("1") >= 0 && keys.indexOf("isStepValid") < 0) {
                  if (q.lastRenderedState["1"] && q.lastRenderedState["1"].isStepValid === false) {
                    var dispatch = q.dispatch;
                    dispatch({type:"SET_FIELD_VALUE",payload:{stepId:1,fieldName:"one_liner_title",value:"ATS Resume Writer",isValid:true,isDirty:true}});
                    return JSON.stringify({found:true,keys:keys,hasOneLiner: q.lastRenderedState["1"].fields && q.lastRenderedState["1"].fields.one_liner_title ? true : false});
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
  return "not found";
})()
