#!/usr/bin/env python3
"""Click Save & Continue on Fiverr."""
import json, subprocess, time, sys
sys.stdout.reconfigure(line_buffering=True)

PAW_ps1 = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"

def paw(payload_dict):
    payload = json.dumps(payload_dict).replace("'", "''")
    ps_cmd = f"& '{PAW_ps1}' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            return {"err": f"rc={r.returncode}", "stderr": r.stderr[:300]}
        d = json.loads(r.stdout.strip())
        if d.get("success") and "result" in d.get("data", {}):
            r2 = d["data"]["result"]
            if isinstance(r2, str):
                try:
                    return json.loads(r2)
                except json.JSONDecodeError:
                    return r2
            return r2
        return d
    except Exception as e:
        return {"err": str(e)}

print("Clicking Save & Continue...")

# Find Save & Continue button and click it
r = paw({"action": "evaluate", "script": """
(() => {
    const btns = document.querySelectorAll('button, [role="button"]');
    for (const b of btns) {
        if (b.offsetParent !== null && b.textContent.trim() === 'Save & Continue') {
            b.click();
            return JSON.stringify({clicked: 'Save & Continue'});
        }
    }
    return JSON.stringify({err: 'no Save & Continue btn'});
})()
"""})
print(f"Click: {r}")
time.sleep(5)

# Check new state
title = paw({"action": "evaluate", "script": "document.title"})
url = paw({"action": "evaluate", "script": "window.location.href"})
content = paw({"action": "evaluate", "script": "document.body.innerText.substring(0, 1000)"})

print(f"\nAfter Save & Continue:")
print(f"Title: {title}")
print(f"URL: {url}")
print(f"Content: {content}")
