#!/usr/bin/env python3
"""Check Reddit for responses to our comments."""
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
    except Exception as e:
        return {"err": str(e)}

# Go to old.reddit.com notifications/messages
paw({"action": "navigate", "url": "https://old.reddit.com/message/inbox/", "waitUntil": "networkidle"})
time.sleep(3)

r = paw({"action": "evaluate", "script": """
(() => {
    const title = document.title;
    const url = window.location.href;
    // Check for nav elements that show message count
    const nav = document.querySelector('#mail');
    const hasMail = nav ? nav.className : 'no nav';
    return JSON.stringify({title, url, hasMail});
})()
"""})
print("Inbox check:", r)
