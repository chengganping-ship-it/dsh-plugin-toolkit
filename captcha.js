(function(){
  var captcha=document.querySelector("iframe[title='人工验证挑战']");
  if(!captcha) return 'no captcha found';
  var r=captcha.getBoundingClientRect();
  return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height});
})()
