#!/usr/bin/env python3
"""Fiverr form - fresh approach with correct coordinates."""
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
                except:
                    return r2
            return r2
        return d
    except Exception as e:
        return {"err": str(e)}

print("="*60)
print(f"Fiverr v2 | {time.strftime('%Y-%m-%d %H:%M')}")
print("="*60)

# Navigate to Fiverr
print("\n[Step 1] Navigating to Fiverr...")
paw({"action": "navigate", "url": "https://www.fiverr.com/users/u_cbe4bf124f8c/manage_gigs/new?wizard=0&tab=general", "waitUntil": "networkidle"})
time.sleep(5)

# Check state
r = paw({"action": "evaluate", "script": """
(() => {
    return JSON.stringify({
        title: document.title,
        url: window.location.href,
        snip: document.body.innerText.substring(0, 500)
    });
})()
"""})
print(f"State: {r}")

state = r if isinstance(r, dict) else {}
if "login" in str(state.get("title", "")).lower():
    print("Need to log in!")
    sys.exit(1)

# Find category element coordinates
print("\n[Step 2] Finding category element...")
r2 = paw({"action": "evaluate", "script": """
(() => {
    const results = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
        if (el.childNodes.length <= 3 && el.textContent.trim() === 'Select A Category' && el.offsetParent !== null) {
            const rect = el.getBoundingClientRect();
            results.push({
                tag: el.tagName,
                cls: (el.className || '').substring(0, 80),
                x: Math.round(rect.x + rect.width/2),
                y: Math.round(rect.y + rect.height/2),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
                parentTag: el.parentElement ? el.parentElement.tagName : 'none'
            });
        }
    }
    return JSON.stringify(results);
})()
"""})
print(f"Category elements: {r2}")

elements = r2 if isinstance(r2, list) else []
if elements:
    el = elements[0]
    x, y = el["x"], el["y"]
    print(f"\n[Step 3] Clicking at ({x}, {y})...")
    
    # Use paw click with x,y
    r3 = paw({"action": "click", "x": x, "y": y})
    print(f"Click: {r3}")
    time.sleep(3)
    
    # Check if dropdown opened
    r4 = paw({"action": "evaluate", "script": """
(() => {
    const opts = [];
    document.querySelectorAll('*').forEach(el => {
        if (el.offsetParent !== null && el.textContent.trim().length > 2 && el.textContent.trim().length < 30) {
            const t = el.textContent.trim();
            if (t === 'Writing & Content' || t === 'Business' || t === 'Lifestyle' || t === 'Digital Marketing') {
                opts.push({tag: el.tagName, text: t, cls: (el.className||'').substring(0, 50)});
            }
        }
    });
    return JSON.stringify({options: opts, bodySnip: document.body.innerText.substring(0, 300)});
})()
"""})
    print(f"After click: {r4}")

print("\nDone.")
