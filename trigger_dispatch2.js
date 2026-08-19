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
                // Check if it has isStepValid property
                if (q.lastRenderedState["1"] && q.lastRenderedState["1"].isStepValid === false) {
                  var dispatch = q.dispatch;
                  var results = [];
                  try {
                    dispatch({type:"SET_FIELD_VALUE",payload:{stepId:1,fieldName:"one_liner_title",value:"ATS Resume Writer",isValid:true,isDirty:true}});
                    results.push("ok1");
                  } catch(e1) { results.push("e1:"+e1.message); }
                  try {
                    dispatch({type:"CHECK_VALIDITY"});
                    results.push("ok2");
                  } catch(e2) { results.push("e2:"+e2.message); }
                  return JSON.stringify({depth:triesF,hookDepth:hookDepth,results:results,lrsKey:Object.keys(q.lastRenderedState)})
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
