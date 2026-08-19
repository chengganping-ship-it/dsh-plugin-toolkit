#!/usr/bin/env python3
"""Open a new tab and navigate to Upwork."""
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

print("Opening new tab to Upwork...")
paw({"action": "tab-new", "url": "https://www.upwork.com/"})
time.sleep(5)

title = paw({"action": "evaluate", "script": "document.title"})
url = paw({"action": "evaluate", "script": "window.location.href"})
print(f"Tab title: {title}")
print(f"Tab URL: {url}")

# Try Fiverr again if we're on about:blank
paw({"action": "navigate", "url": "https://www.fiverr.com/", "waitUntil": "networkidle"})
time.sleep(5)

title2 = paw({"action": "evaluate", "script": "document.title"})
url2 = paw({"action": "evaluate", "script": "window.location.href"})
print(f"\nAfter Fiverr nav:")
print(f"Title: {title2}")
print(f"URL: {url2}")

content = paw({"action": "evaluate", "script": "document.body.innerText.substring(0, 400)"})
print(f"Content: {content}")
