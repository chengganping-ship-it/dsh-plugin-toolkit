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
    var triesF = 0;
    while (f && triesF < 60) {
      triesF++;
      if (f.memoizedState) {
        var curState = f.memoizedState;
        var hookDepth = 0;
        while (curState && hookDepth < 25) {
          hookDepth++;
          try {
            var lrs = curState.queue ? curState.queue.lastRenderedState : undefined;
            var lrsStr = lrs !== undefined ? JSON.stringify(lrs) : null;
            if (lrsStr && lrsStr.indexOf("one_liner_title") >= 0 && curState.queue && curState.queue.dispatch) {
              var dispatch = curState.queue.dispatch;
              var curr = curState.queue.lastRenderedState;
              var newState = JSON.parse(JSON.stringify(curr));
              newState["1"].fields.one_liner_title.isValid = true;
              newState["1"].fields.one_liner_title.isDirty = true;
              newState["1"].isStepValid = true;
              delete newState["1"].globalErrorMessage;
              var result = [];
              try { dispatch({type:"SET_FIELD_VALUE",payload:{stepId:1,fieldName:"one_liner_title",value:"ATS Resume Writer",isValid:true,isDirty:true}}); result.push("SET_FIELD_VALUE"); } catch(e) { result.push("err1:"+e.message); }
              try { dispatch({type:"SET_STEP_VALID",payload:{stepId:1,isValid:true}}); result.push("SET_STEP_VALID"); } catch(e) { result.push("err2:"+e.message); }
              return JSON.stringify({dispatched: result, stateIsNowStepValid: newState["1"].isStepValid});
            }
          } catch(e) {
            return JSON.stringify({err: e.message});
          }
          if (curState.next) curState = curState.next; else break;
        }
      }
      if (f.return) f = f.return; else break;
    }
  }
  return "not found";
})()
