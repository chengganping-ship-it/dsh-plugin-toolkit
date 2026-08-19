#!/usr/bin/env python3
"""Diagnose Reddit karma situation and comment survival."""
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

# Check profile
print("=== Checking Reddit Profile ===")
paw({"action": "navigate", "url": "https://old.reddit.com/user/xingyue_ai", "waitUntil": "networkidle"})
time.sleep(4)

script = """
(() => {
    return JSON.stringify({
        title: document.title,
        bodySnippet: document.body.innerText.substring(0, 1000)
    });
})()
"""
r = paw({"action": "evaluate", "script": script})
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else str(r))

# Check if our comment survived on a Resume post
print("\n=== Checking comment survival on r/Resume ===")
paw({"action": "navigate", "url": "https://old.reddit.com/r/Resume/comments/1vr8lhl/critique_my_res/", "waitUntil": "networkidle"})
time.sleep(4)

script2 = """
(() => {
    const bodyText = document.body.innerText;
    const keywords = ['xingyue', 'ATS score', 'resume land', '200 resumes', 'LinkedIn audit'];
    let found = false;
    let matches = [];
    for (const kw of keywords) {
        if (bodyText.toLowerCase().includes(kw.toLowerCase())) {
            found = true;
            matches.push(kw);
        }
    }
    // Check for deleted comment markers
    const hasDeleted = bodyText.includes('[deleted]') || bodyText.includes('AutoModerator');
    return JSON.stringify({found, matches, hasDeleted, title: document.title, snip: bodyText.substring(0, 600)});
})()
"""
r2 = paw({"action": "evaluate", "script": script2})
print(json.dumps(r2, indent=2, ensure_ascii=False) if isinstance(r2, dict) else str(r2))

# Check account age (go to new reddit profile)
print("\n=== Checking account details (new reddit) ===")
paw({"action": "navigate", "url": "https://www.reddit.com/user/xingyue_ai/", "waitUntil": "networkidle"})
time.sleep(5)

script3 = """
(() => {
    return JSON.stringify({
        title: document.title,
        bodySnippet: document.body.innerText.substring(0, 1500)
    });
})()
"""
r3 = paw({"action": "evaluate", "script": script3})
print(json.dumps(r3, indent=2, ensure_ascii=False) if isinstance(r3, dict) else str(r3))
