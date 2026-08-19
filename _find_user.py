#!/usr/bin/env python3
"""Find actual Reddit username from browser."""
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

r = paw({"action": "evaluate", "script": """
(() => {
    const title = document.title;
    // Look for username in header: "Antique-Run6580 (1)"
    const header = document.body.innerText;
    const userMatch = header.match(/([A-Za-z0-9_-]+)\\s*\\(\\d+\\)/);
    const username = userMatch ? userMatch[1] : '';
    // Find the user menu or profile link
    const userLinks = [];
    document.querySelectorAll('a[href*="/user/"]').forEach(el => userLinks.push(el.textContent.substring(0, 30) + ' -> ' + (el.href || '').substring(0, 80)));
    return JSON.stringify({title, username, userLinks: userLinks.slice(0, 5)});
})()
"""})
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else str(r))
