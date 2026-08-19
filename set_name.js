(function(){
  var input = document.querySelectorAll("input[type=text]")[0];
  var key = Object.keys(input).find(function(k){return k.startsWith("__reactFiber")});
  if(!key) return "no fiber";
  var fiber = input[key];
  var tries = 0;
  while(fiber && tries < 30){
    tries++;
    if(fiber.memoizedProps && fiber.memoizedProps.onChange){
      fiber.memoizedProps.onChange({target:{value:"Alex Morgan"},preventDefault:function(){},persist:function(){},type:"change"});
      return "called onChange";
    }
    fiber = fiber.return;
  }
  return "not found after " + tries;
})()
