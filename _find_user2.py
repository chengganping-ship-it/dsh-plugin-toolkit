#!/usr/bin/env python3
"""Look at the page more carefully."""
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

# Go to old reddit homepage to see header with username
paw({"action": "navigate", "url": "https://old.reddit.com/", "waitUntil": "networkidle"})
time.sleep(3)

r = paw({"action": "evaluate", "script": """
(() => {
    const title = document.title;
    // The header has: "Antique-Run6580 (1)|messages|notifications21|chat messages1|preferences|logout"
    const bodyLines = document.body.innerText.substring(0, 600);
    // Look for all profile/usernames via anchors
    const anchors = [];
    document.querySelectorAll('a').forEach(a => {
        if (a.href && (a.href.includes('/user/') || a.textContent.includes('logout') || a.textContent.includes('preferences'))) {
            anchors.push({text: a.textContent.substring(0, 40), href: a.href.substring(0, 80)});
        }
    });
    // Look for mail/mail icon
    const mail = document.querySelector('#mail, .mail, .havemail, [href*="message"]');
    return JSON.stringify({title, bodyLines, anchors, mailStatus: mail ? mail.className : 'no mail el'});
})()
"""})
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else str(r))
