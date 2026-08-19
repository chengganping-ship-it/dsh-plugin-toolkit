#!/usr/bin/env python3
"""Fill Fiverr gig form and submit."""
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

print("="*60)
print(f"Fill Fiverr Gig | {time.strftime('%Y-%m-%d %H:%M')}")
print("="*60)

# Step 1: Focus on the textarea and use type action
print("\n[Step 1] Clicking textarea...")
r = paw({"action": "click", "selector": "textarea._25a7db"})
print(f"  Click: {r}")

time.sleep(1)

# Clear existing text and type new title using keyboard simulation
title_text = "I will optimize your resume and LinkedIn profile for ATS"

print("[Step 2] Typing title...")
r2 = paw({"action": "type", "selector": "textarea._25a7db", "text": title_text})
print(f"  Type: {r2}")

time.sleep(2)

# Check what we typed
r3 = paw({"action": "evaluate", "script": """
(() => {
    const ta = document.querySelector('textarea._25a7db');
    return JSON.stringify({value: ta ? ta.value : 'no textarea'});
})()
"""})
print(f"  Current value: {r3}")

# Step 3: Save/publish
print("\n[Step 3] Looking for publish/save button...")
r4 = paw({"action": "evaluate", "script": """
(() => {
    const allBtns = document.querySelectorAll('button, [role="button"]');
    const visible = [];
    for (const b of allBtns) {
        if (b.offsetParent !== null && b.textContent.trim()) {
            visible.push(b.textContent.trim().substring(0, 50));
        }
    }
    return JSON.stringify({buttons: visible});
})()
"""})
print(f"  Buttons: {r4}")

print("\nDone Step 1. Need to verify before proceeding to category/description.")
