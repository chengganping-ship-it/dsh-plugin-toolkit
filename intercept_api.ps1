# Intercept fetch/get to find gig save API
$inner = @'
(function(){
  // Store original fetch
  if (!window._origFetch) {
    window._origFetch = window.fetch;
    window._apiCalls = [];
    
    window.fetch = function() {
      var url = arguments[0];
      if (typeof url === "object") url = url.url;
      var opts = arguments[1] || {};
      window._apiCalls.push({url: String(url).slice(0,100), method: opts.method || "GET", body: opts.body ? String(opts.body).slice(0,100) : ""});
      return window._origFetch.apply(this, arguments);
    };
    
    // Also intercept XHR
    var origXhrOpen = XMLHttpRequest.prototype.open;
    var origXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function() {
      this._interceptInfo = {method: arguments[0], url: String(arguments[1]).slice(0,100)};
      origXhrOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function() {
      if (this._interceptInfo) {
        window._apiCalls.push(this._interceptInfo);
      }
      origXhrSend.apply(this, arguments);
    };
  }
  return "interceptor installed, current calls: " + window._apiCalls.length;
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
