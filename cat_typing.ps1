$js = @'
(function(){
  var input = document.activeElement;
  if(input && input.tagName === "INPUT"){
    input.focus();
    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(input, "Writing");
    input.dispatchEvent(new Event("input", {bubbles:true}));
    return "typed: " + input.value;
  }
  return "no input focused: " + (input ? input.tagName : "none");
})()
'@
$cmd = '{"action":"evaluate","script":"' + ($js -replace '"', '\"') + '"}'
paw browser-action $cmd
