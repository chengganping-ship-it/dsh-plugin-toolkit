#!/usr/bin/env python3
"""Navigate browser to Reddit."""
import json, subprocess, time
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
    except subprocess.TimeoutExpired:
        return {"err": "timeout"}
    except Exception as e:
        return {"err": str(e)}

# Navigate to Reddit
print("Navigating to Reddit...")
paw({"action":"navigate","url":"https://www.reddit.com","waitUntil":"networkidle"})
time.sleep(3)

# Check title
title = paw({"action":"evaluate","script":"document.title"})
print(f"Page title: {title}")
print("Done.")
