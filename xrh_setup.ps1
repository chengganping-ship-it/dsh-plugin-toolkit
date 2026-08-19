# Setup XHR interceptor to capture Save & Continue request
$inner = @'
(function(){
  if (window._xhrHooked) return "already hooked";
  
  window._xhrLog = [];
  window._xhrHooked = true;
  
  // Intercept XMLHttpRequest
  var origOpen = XMLHttpRequest.prototype.open;
  var origSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function() {
    this._xhrInfo = {method: arguments[0], url: arguments[1]};
    origOpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    var self = this;
    var entry = Object.assign({}, self._xhrInfo);
    if (arguments[0]) {
      try { entry.body = typeof arguments[0] === "string" ? arguments[0].slice(0,500) : "non-string"; } catch(e) {}
    }
    window._xhrLog.push(entry);
    this.addEventListener("load", function() {
      entry.response = self.responseText ? self.responseText.slice(0,200) : "";
    });
    origSend.apply(this, arguments);
  };
  
  // Intercept fetch
  var origFetch = window.fetch;
  window.fetch = function() {
    var url = typeof arguments[0] === "string" ? arguments[0] : arguments[0].url;
    var opts = arguments[1] || {};
    var entry = {method: opts.method || "GET", url: String(url)};
    if (opts.body) {
      try { entry.body = typeof opts.body === "string" ? opts.body.slice(0,500) : "non-string"; } catch(e) {}
    }
    window._xhrLog.push(entry);
    return origFetch.apply(this, arguments).then(function(resp) {
      return resp.clone().text().then(function(t) {
        entry.response = t.slice(0,200);
        entry.status = resp.status;
        return resp;
      });
    });
  };
  
  return "XSS hook installed";
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
