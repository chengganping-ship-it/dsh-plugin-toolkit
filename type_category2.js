(function(){
  var all = document.querySelectorAll("input[type=text]");
  for (var i = 0; i < all.length; i++) {
    if (all[i].placeholder && all[i].placeholder.indexOf("category") !== -1) {
      all[i].focus();
      var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      function typeChar(el, c) {
        var kd = new KeyboardEvent("keydown", { key: c, bubbles: true });
        var kp = new KeyboardEvent("keypress", { key: c, charCode: c.charCodeAt(0), bubbles: true });
        var ku = new KeyboardEvent("keyup", { key: c, bubbles: true });
        el.dispatchEvent(kd);
        el.dispatchEvent(kp);
        nativeSetter.call(el, el.value + c);
        var ie = document.createEvent("HTMLEvents");
        ie.initEvent("input", true, true);
        el.dispatchEvent(ie);
        el.dispatchEvent(ku);
      }
      var text = "Writing";
      for (var j = 0; j < text.length; j++) typeChar(all[i], text[j]);
      return "typed " + all[i].value + " in placeholder=" + all[i].placeholder;
    }
  }
  return "no category input found";
})()
