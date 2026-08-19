#!/usr/bin/env python3
"""Navigate browser to Gumroad and check if accessible."""
import json, subprocess, time, sys
sys.stdout.reconfigure(line_buffering=True)

PAW_ps1 = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"

def paw(payload_dict):
    payload = json.dumps(payload_dict).replace("'", "''")
    ps_cmd = f"& '{PAW_ps1}' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
        if r.returncode != 0:
            return {"err": f"rc={r.returncode}", "stderr": r.stderr[:500]}
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

# First check current state
print("Checking current browser state...")
title = paw({"action": "evaluate", "script": "document.title"})
url = paw({"action": "evaluate", "script": "window.location.href"})
print(f"Title: {title}")
print(f"URL: {url}")

# Navigate to Gumroad
print("\nNavigating to Gumroad...")
paw({"action": "navigate", "url": "https://gumroad.com/", "waitUntil": "networkidle"})
time.sleep(4)

title2 = paw({"action": "evaluate", "script": "document.title"})
url2 = paw({"action": "evaluate", "script": "window.location.href"})
content = paw({"action": "evaluate", "script": "document.body.innerText.substring(0, 800)"})
print(f"After Gumroad nav:")
print(f"Title: {title2}")
print(f"URL: {url2}")
print(f"Content: {content}")
