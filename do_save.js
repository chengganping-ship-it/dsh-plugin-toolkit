(async function(){
  // try Save
  var btns=document.querySelectorAll('button');
  for(var i=0;i<btns.length;i++){
    if(btns[i].textContent.trim()==='Save'){
      btns[i].click();
      return 'clicked Save';
    }
  }
  return 'not found';
})()
