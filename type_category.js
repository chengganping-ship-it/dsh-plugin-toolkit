(function(){
  var input = document.querySelector("input[aria-label='SELECT A CATEGORY']") || document.querySelector("form#gig-edit-create-form input[type=text]");
  if(input){
    input.focus();
    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(input, "Writing");
    input.dispatchEvent(new Event("input", {bubbles:true}));
    return "typed: " + input.value;
  }
  return "not found";
})()
