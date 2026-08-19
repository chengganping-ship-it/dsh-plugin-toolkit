#!/usr/bin/env python3
"""Try Fiverr gig publishing again - CAPTCHA cooldown should have passed."""
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
print(f"Fiverr Republish Attempt | {time.strftime('%Y-%m-%d %H:%M')}")
print("="*60)

# Navigate to Fiverr new gig page
print("\n[Step 1] Navigating to Fiverr...")
paw({"action": "navigate", "url": "https://www.fiverr.com/users/u_cbe4bf124f8c/manage_gigs/new?wizard=0&tab=general", "waitUntil": "networkidle"})
time.sleep(5)

# Check current state
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
                       body.toLowerCase().includes('verify') ||
                       document.querySelector('iframe[src*="captcha"]') !== null ||
                       document.querySelector('[class*="captcha"]') !== null;
    const hasForm = document.querySelector('input, textarea, form') !== null;
    return JSON.stringify({hasCaptcha, hasForm, title: document.title});
})()
"""})
print(f"  Page state: {r}")

page_state = r if isinstance(r, dict) else {}
if page_state.get("hasCaptcha"):
    print("\n⚠ CAPTCHA DETECTED - Still blocked!")
    print("Waiting 30 min and will try again...")
    sys.exit(1)
elif "login" in str(title).lower() or "sign in" in str(title).lower():
    print("\n⚠ Need to log in first")
    sys.exit(1)
else:
    print("\n✓ No CAPTCHA detected! Proceeding with gig setup...")
    
    # Try to fill in gig title
    title_json = json.dumps("I will optimize your resume and linkedin profile for ATS and recruiters")
    fill_script = f"""
(() => {{
    // Find gig title input
    const inputs = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
    for (const inp of inputs) {{
        const ph = (inp.placeholder || '').toLowerCase();
        const name = (inp.name || '').toLowerCase();
        if (ph.includes('title') || name.includes('title') || ph.includes('gig') || name === 'title') {{
            inp.focus();
            inp.value = {title_json};
            inp.dispatchEvent(new Event('input', {{bubbles: true}}));
            return JSON.stringify({{ok: true, found: true, name: inp.name || 'no name'}});
        }}
    }}
    return JSON.stringify({{ok: false, inputCount: inputs.length}});
}})()
"""
    r2 = paw({"action": "evaluate", "script": fill_script})
    print(f"  Fill title: {r2}")
    
    # Check page again after fill
    time.sleep(2)
    title_after = paw({"action": "evaluate", "script": "document.title"})
    url_after = paw({"action": "evaluate", "script": "window.location.href"})
    print(f"  After fill - Title: {title_after}, URL: {url_after}")
    
    # Look for submit/save buttons
    r3 = paw({"action": "evaluate", "script": """
(() => {
    const btns = document.querySelectorAll('button[type="submit"], input[type="submit"], button.publish, button.save');
    const result = [];
    for (const b of btns) {
        if (b.offsetParent !== null) {
            result.push({text: b.textContent.trim().substring(0, 50), tag: b.tagName, type: b.type || ''});
        }
    }
    return JSON.stringify({buttons: result});
})()
"""})
    print(f"  Submit buttons: {r3}")

print("\nDone with Fiverr attempt.")
