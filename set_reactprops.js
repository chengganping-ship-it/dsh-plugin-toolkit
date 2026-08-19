(function(){
  var results = [];
  var inputs = document.querySelectorAll("input[type=text]");
  
  function setViaReactProps(input, val) {
    var key = Object.keys(input).find(function(k){ return k.startsWith("__reactProps") });
    if (!key) return "no reactProps";
    var rp = input[key];
    if (!rp.onChange) return "no onChange";
    // Set native value first
    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(input, val);
    // Create a proper event-like object
    var event = new Event('input', { bubbles: true });
    Object.defineProperty(event, 'target', { writable: false, value: input });
    // Call onChange
    rp.onChange(event);
    return "set via reactProps: " + input.value;
  }
  
  if (inputs[0]) {
    var r1 = setViaReactProps(inputs[0], "Alex M.");
    results.push("dn: " + r1);
  }
  if (inputs[1]) {
    var r2 = setViaReactProps(inputs[1], "ATS Resume Writer");
    results.push("title: " + r2);
  }
  
  return results.join(" | ");
})()
