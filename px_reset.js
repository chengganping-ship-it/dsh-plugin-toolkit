(function(){
  var names = ["_pxvid", "_pxhd", "_pxde", "px_verified", "pxcts"];
  names.forEach(function(n){
    document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
  return "remaining cookies count: " + document.cookie.split(";").length;
})()
