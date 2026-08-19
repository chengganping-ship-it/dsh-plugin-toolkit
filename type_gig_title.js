(function(){
  var inp = document.querySelector("input[placeholder*='do something']");
  if (!inp) {
    var all = document.querySelectorAll("input[type=text]");
    for (var i = 0; i < all.length; i++) {
      if (all[i].placeholder && all[i].placeholder.indexOf("do something") !== -1) {
        inp = all[i];
        break;
      }
    }
  }
  if (!inp) return "no input found";
  var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  function typeChar(el, c) {
    el.focus();
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
  var text = "write ATS-optimized resumes with JD keyword gap";
  for (var i = 0; i < text.length; i++) typeChar(inp, text[i]);
  return "typed: " + inp.value + " len=" + inp.value.length;
})()
