(function(){
  var cookies = document.cookie.split(";");
  cookies.forEach(function(c){
    var parts = c.split("=");
    var name = parts[0].trim();
    if(name.startsWith("_px") || name.startsWith("pxv") || name.startsWith("px_")){
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
  });
  return "deleted: <br>" + document.cookie;
})()
