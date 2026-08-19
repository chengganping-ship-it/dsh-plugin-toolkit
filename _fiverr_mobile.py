#!/usr/bin/env python3
"""Try Fiverr mobile site for simpler form."""
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
print(f"Fiverr Mobile Attempt | {time.strftime('%Y-%m-%d %H:%M')}")
print("="*60)

# Navigate to Fiverr mobile
print("\n[Step 1] Navigating to Fiverr mobile...")
paw({"action": "navigate", "url": "https://m.fiverr.com/users/u_cbe4bf124f8c/manage_gigs/new?wizard=0&tab=general", "waitUntil": "networkidle"})
time.sleep(5)

title = paw({"action": "evaluate", "script": "document.title"})
url = paw({"action": "evaluate", "script": "window.location.href"})
print(f"  Title: {title}")
print(f"  URL: {url}")

# Check for CAPTCHA
r = paw({"action": "evaluate", "script": """
(() => {
    const body = document.body.innerText;
    const hasCaptcha = body.toLowerCase().includes('captcha') || 
                       body.toLowerCase().includes('human touch') ||
                       document.querySelector('iframe[src*="captcha"]') !== null;
    return JSON.stringify({hasCaptcha, title: document.title, snip: body.substring(0, 400)});
})()
"""})
print(f"  State: {r}")

state = r if isinstance(r, dict) else {}
if state.get("hasCaptcha"):
    print("\n⚠ CAPTCHA on mobile too!")
else:
    print("\n✓ No CAPTCHA on mobile!")
    
    # Check inputs
    r2 = paw({"action": "evaluate", "script": """
(() => {
    const inputs = document.querySelectorAll('input, textarea');
    const results = [];
    for (const el of inputs) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0) {
            results.push({tag: el.tagName, type: el.type, name: el.name, ph: (el.placeholder||'').substring(0, 40), w: Math.round(rect.width)});
        }
    }
    return JSON.stringify(results);
})()
"""})
    print(f"  Inputs: {r2}")
