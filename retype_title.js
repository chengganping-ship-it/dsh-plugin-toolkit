(function(){
  var ta = document.querySelector("textarea.gig-title-textarea");
  if (!ta) return "no textarea";
  ta.focus();
  var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  nativeSetter.call(ta, "");
  ta.dispatchEvent(new Event("input", {bubbles: true}));
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
  var text = "write ATS optimized resumes with JD keyword gap";
  for (var i = 0; i < text.length; i++) typeChar(ta, text[i]);
  return "typed: " + ta.value;
})()
