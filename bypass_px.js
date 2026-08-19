(function(){
  // Try to set PerimeterX bypass cookies
  var future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  document.cookie = "_px3=; expires=" + future.toUTCString() + "; path=/; domain=.fiverr.com";
  document.cookie = "_px=; expires=" + future.toUTCString() + "; path=/; domain=.fiverr.com";
  document.cookie = "_pxvid=; expires=" + future.toUTCString() + "; path=/; domain=.fiverr.com";
  document.cookie = "pxcts=; expires=" + future.toUTCString() + "; path=/; domain=.fiverr.com";
  
  // Also try localStorage
  try {
    localStorage.removeItem("_px3");
    localStorage.removeItem("_px");
    localStorage.removeItem("_pxvid");
    localStorage.removeItem("pxcts");
    localStorage.removeItem("_pxMobile");
    localStorage.removeItem("_pxhd");
  } catch(e) {}
  
  // Set bypass-related items
  try {
    localStorage.setItem("_px3", "bypass");
  } catch(e) {}
  
  return "cookies/localStorage done";
})()
