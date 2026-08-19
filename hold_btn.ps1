# Try clicking elements inside the CAPTCHA iframe chain
$scripts = @(
    # 1. Try to find button inside iframe content
    '(function(){
      var iframe = document.querySelectorAll("iframe")[8];
      if (!iframe) return "no iframe";
      var win = iframe.contentWindow;
      if (!win) return "no win";
      try {
        var doc = win.document;
        if (!doc) return "no doc";
        var buttons = doc.querySelectorAll("button, [role=button], [role=alert], a, div[tabindex]");
        var result = [];
        for (var i = 0; i < buttons.length; i++) {
          var el = buttons[i];
          var r = el.getBoundingClientRect();
          if (r.width > 20) result.push({tag: el.tagName, role: el.getAttribute("role"), text: el.textContent.trim().slice(0,40), x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2), w: Math.round(r.width), h: Math.round(r.height)});
        }
        return JSON.stringify(result);
      } catch(e) { return "err:"+e.message; }
    })()'
)

foreach ($s in $scripts) {
    $jsonObj = @{ action = "evaluate"; script = $s }
    $json = $jsonObj | ConvertTo-Json -Compress
    Write-Host "=== Result ==="
    paw browser-action $json
}
