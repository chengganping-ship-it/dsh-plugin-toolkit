#!/usr/bin/env python3
import json, subprocess
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

script = """
(async()=>{
    try {
        const r = await fetch("https://old.reddit.com/user/Antique-Run6580/submitted.json?limit=10&raw_json=1", {credentials: "include"});
        const d = await r.json();
        const posts = (d.data?.children || []).map(function(c){
            var p = c.data;
            return {title: p.title, sub: p.subreddit, id: p.id, score: p.score, url: "https://old.reddit.com" + p.permalink, comments: p.num_comments};
        });
        return JSON.stringify({ok: true, posts: posts});
    } catch(e) {
        return JSON.stringify({error: e.message});
    }
})()
"""
r = paw({"action": "evaluate", "script": script})
if isinstance(r, dict) and r.get("ok"):
    for p in r.get("posts", []):
        print(f"[{p.get('comments',0)} comments] score={p.get('score',0)} sub={p.get('sub','')}")
        print(f"  Title: {p.get('title','')[:80]}")
        print(f"  URL: {p.get('url','')}")
        print()
else:
    print(json.dumps(r, ensure_ascii=False))
