#!/usr/bin/env python3
"""
Try to clear Fiverr session and retry gig creation.
"""
import json, subprocess, time

def paw_eval(script):
    """Use pwsh to evaluate JS."""
    payload = json.dumps({"action": "evaluate", "script": script})
    ps = f"& 'C:\\Users\\123\\.meituan-catpaw\\bin\\paw.ps1' browser-action '{payload}'"
    r = subprocess.run(["pwsh","-NoProfile","-Command", ps], capture_output=True, text=True, timeout=20)
    if r.returncode != 0:
        return {"err": r.stderr[:200]}
    try:
        d = json.loads(r.stdout.strip())
        return json.loads(d["data"]["result"]) if d.get("success") and "result" in d.get("data",{}) else d
    except Exception as e:
        return {"err": str(e)}

def paw_action(action_dict):
    payload = json.dumps(action_dict)
    ps = f"& 'C:\\Users\\123\\.meituan-catpaw\\bin\\paw.ps1' browser-action '{payload}'"
    r = subprocess.run(["pwsh","-NoProfile","-Command", ps], capture_output=True, text=True, timeout=20)
    if r.returncode != 0:
        return {"err": r.stderr[:200]}
    try:
        return json.loads(r.stdout.strip())
    except:
        return {"raw": r.stdout[:300]}

# Step 1: Clear all storage types
print("Step 1: Clearing storage...")
r = paw_eval("localStorage.clear(); sessionStorage.clear(); 'cleared'")
print(f"  Storage: {r}")

# Step 2: Navigate to gig creation with possible cache bypass
print("\nStep 2: Navigating to gig creation page...")
r = paw_action({"action":"navigate","url":"https://www.fiverr.com/users/u_cbe4bf124f8c/manage_gigs/new?wizard=0&tab=general&_t="+str(int(time.time())),"waitUntil":"networkidle"})
print(f"  Navigate: {r}")

time.sleep(3)

# Step 3: Check page
r = paw_eval("document.title + ' | ' + window.location.href")
print(f"  Page: {r}")

# Step 4: Check if still CAPTCHA
r = paw_eval("document.body.innerText.substring(0,300)")
print(f"  Body: {r}")
