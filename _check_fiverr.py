#!/usr/bin/env python3
import json, subprocess

def paw(action):
    payload = json.dumps(action)
    ps = f"& 'C:\\Users\\123\\.meituan-catpaw\\bin\\paw.ps1' browser-action '{payload}'"
    r = subprocess.run(["pwsh","-NoProfile","-Command", ps], capture_output=True, text=True, timeout=20)
    if r.returncode != 0:
        return {"err": r.stderr[:200]}
    try:
        d = json.loads(r.stdout.strip())
        if d.get("success") and "result" in d.get("data",{}):
            return d["data"]["result"]
        return d
    except:
        return {"raw": r.stdout[:300]}

# Simple check
print("URL:", paw({"action":"url"}))
print("Title:", paw({"action":"evaluate","script":"document.title"}))
body = paw({"action":"evaluate","script":"document.body.innerText.substring(0,400)"})
print("Body:", body)
