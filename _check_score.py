#!/usr/bin/env python3
"""Check comment scores on our posts."""
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

# Check posts and look for our comment scores
paw({"action": "navigate", "url": "https://old.reddit.com/r/AskReddit/comments/1vs8n98/recruiters_of_reddit_whats_the_1_reason_you/", "waitUntil": "networkidle"})
time.sleep(4)

r = paw({"action": "evaluate", "script": """
(() => {
    const comments = document.querySelectorAll('.comment');
    const results = [];
    for (const c of comments) {
        const authorEl = c.querySelector('.author');
        const scoreEl = c.querySelector('.score');
        if (!authorEl) continue;
        const author = authorEl.textContent.trim();
        const score = scoreEl ? scoreEl.textContent.trim() : 'no score';
        const isUs = author === 'Antique-Run6580';
        results.push({author, score, isUs});
    }
    return JSON.stringify(results);
})()
"""})
print("Comment scores on our post:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)
