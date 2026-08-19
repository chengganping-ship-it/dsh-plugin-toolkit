(function(){
  var found = "none";
  var all = document.querySelectorAll("*");
  for(var j=0;j<all.length;j++){
    var el = all[j];
    if(el.textContent && el.textContent.trim() === "Writing & Translation" && el.children.length === 0){
      el.click();
      found = "clicked:" + el.tagName;
      break;
    }
  }
  return found;
})()
