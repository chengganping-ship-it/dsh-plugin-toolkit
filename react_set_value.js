(function(){
  var results = [];
  var inputs = document.querySelectorAll("input[type=text]");
  
  function setReactValue(input, newVal) {
    // Try React fiber approach
    var key = Object.keys(input).find(function(k){return k.startsWith("__reactFiber")});
    if(key) {
      var fiber = input[key];
      var tries = 0;
      while(fiber && tries < 30) {
        tries++;
        if(fiber.memoizedProps && fiber.memoizedProps.onChange) {
          var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, newVal);
          fiber.memoizedProps.onChange({target:{value:newVal}, preventDefault:function(){}, persist:function(){}, currentTarget:{value:newVal}, type:"change"});
          return true;
        }
        fiber = fiber.return;
      }
    }
    // Fallback: try native setter + React onChange via _valueTracker
    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(input, newVal);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return false;
  }
  
  // First input: Display Name = Alex Morgan
  if(inputs[0]) {
    var r1 = setReactValue(inputs[0], "Alex Morgan");
    results.push("displayName: " + r1 + " value=" + inputs[0].value);
  }
  
  // Second input: Title = ATS Resume Writer  
  if(inputs[1]) {
    var r2 = setReactValue(inputs[1], "ATS Resume Writer");
    results.push("title: " + r2 + " value=" + inputs[1].value);
  }
  
  return results.join(" | ");
})()
