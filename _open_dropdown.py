#!/usr/bin/env python3
import json, subprocess, time
PAW = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"
def paw(payload_dict):
    payload = json.dumps(payload_dict).replace("'", "''")
    ps_cmd = f"& '{PAW}' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if r.returncode != 0:
            return {"err": f"rc={r.returncode}"}
        d = json.loads(r.stdout.strip())
        if d.get("success") and "result" in d.get("data", {}):
            r2 = d["data"]["result"]
            if isinstance(r2, str):
                try:
                    return json.loads(r2)
                except:
                    return r2
            return r2
        return d
    except Exception as e:
        return {"err": str(e)}

# Find the parent container of "Select A Category" and simulate click via dispatchEvent
r = paw({"action": "evaluate", "script": """
(() => {
    // Find SPAN with "Select A Category"
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node, found = null;
    while (node = walker.nextNode()) {
        const t = node.textContent.trim();
        if (t === 'Select A Category') {
            found = node.parentElement;
            break;
        }
    }
    if (!found) return JSON.stringify({err: 'no node found'});
    
    // Walk up to find clickable parent
    let el = found;
    let levels = [];
    for (let i = 0; i < 6; i++) {
        if (!el) break;
        levels.push({tag: el.tagName, cls: (el.className||'').substring(0, 50), cursor: getComputedStyle(el).cursor, hasClick: el.onclick !== null});
        el = el.parentElement;
    }
    
    // Try clicking using dispatchEvent for both parents and child
    let clickResult = 'tried';
    try {
        // Try the parent first (3 levels up)
        let target = found.parentElement;
        if (target) {
            target.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window}));
            target.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window}));
            target.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
            clickResult = 'dispatched click on parent';
        }
    } catch(e) {
        clickResult = 'err: ' + e.message;
    }
    
    return JSON.stringify({levels, clickResult});
})()
"""})
print("Click attempt:", r)
time.sleep(3)

# Check dropdown state
r2 = paw({"action": "evaluate", "script": """
(() => {
    const options = [];
    document.querySelectorAll('[role="option"], [class*="option-option"], [class*="dropdown"], li').forEach(el => {
        if (el.offsetParent !== null && el.textContent.trim().length > 2 && el.textContent.trim().length < 40) {
            options.push({tag: el.tagName, cls: (el.className||'').substring(0, 50), text: el.textContent.trim()});
        }
    });
    return JSON.stringify({options: options.slice(0, 30)});
})()
"""})
print("Options after:", r2)
