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

# Click at coordinates for "Select A Category"
print("Clicking at (578, 609)...")
r = paw({"action": "click", "x": 578, "y": 609})
print("Click result:", r)
time.sleep(3)

# Check if dropdown opened
r2 = paw({"action": "evaluate", "script": """
(() => {
    const title = document.title;
    const bodySnip = document.body.innerText.substring(0, 300);
    // Check for visible options
    const options = [];
    document.querySelectorAll('[role="option"], [class*="option"]').forEach(el => {
        if (el.offsetParent !== null) options.push({cls: el.className.substring(0, 50), text: el.textContent.trim().substring(0, 30)});
    });
    return JSON.stringify({title, optionsSnip: options.slice(0, 20)});
})()
"""})
print("After click:", r2)
