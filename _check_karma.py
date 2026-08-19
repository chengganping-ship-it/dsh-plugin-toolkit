#!/usr/bin/env python3
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

paw({"action": "navigate", "url": "https://old.reddit.com/user/Antique-Run6580/", "waitUntil": "networkidle"})
time.sleep(4)

r = paw({"action": "evaluate", "script": """
(() => {
    const text = document.body.innerText;
    const karmaMatch = text.match(/(\\d[\\d,]*)\\s*comment karma/i);
    const postKarmaMatch = text.match(/(\\d[\\d,]*)\\s*post karma/i);
    const awarderMatch = text.match(/(\\d[\\d,]*)\\s*awarder/i);
    const awardeeMatch = text.match(/(\\d[\\d,]*)\\s*awardee/i);
    const ageMatch = text.match(/redditor for\\s+(.+?)\\s*$/im);
    return JSON.stringify({
        title: document.title,
        commentKarma: karmaMatch ? karmaMatch[1] : 'not found',
        postKarma: postKarmaMatch ? postKarmaMatch[1] : 'not found',
        awarder: awarderMatch ? awarderMatch[1] : '',
        awardee: awardeeMatch ? awardeeMatch[1] : '',
        age: ageMatch ? ageMatch[1].trim() : '',
        bodySnippet: text.substring(text.indexOf('comment'), text.indexOf('comment') + 300)
    });
})()
"""})
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else str(r))
