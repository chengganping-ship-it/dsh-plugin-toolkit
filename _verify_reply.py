#!/usr/bin/env python3
"""Verify our replies are visible."""
import json, subprocess, time
PAW_ps1 = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"
def paw(payload_dict):
    payload = json.dumps(payload_dict).replace("'", "''")
    ps_cmd = f"& '{PAW_ps1}' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            return {"err": f"rc={r.returncode}"}
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

# Check the recruiters post
paw({"action": "navigate", "url": "https://old.reddit.com/r/AskReddit/comments/1vs8n98/recruiters_of_reddit_whats_the_1_reason_you/", "waitUntil": "networkidle"})
time.sleep(4)

r = paw({"action": "evaluate", "script": """
(() => {
    const bodyText = document.body.innerText;
    // Look for our reply keywords
    const keywords = ['formatting issue', 'Great insights', 'recruiters say'];
    let found = false;
    let matches = [];
    for (const kw of keywords) {
        if (bodyText.includes(kw)) {
            found = true;
            matches.push(kw);
        }
    }
    // Check for deleted
    const hasDeleted = bodyText.includes('[deleted]');
    // Count comments
    const comments = document.querySelectorAll('.comment');
    return JSON.stringify({found, matches, hasDeleted, commentCount: comments.length, title: document.title});
})()
"""})
print("Verify reply:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)
