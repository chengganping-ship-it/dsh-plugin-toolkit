#!/usr/bin/env python3
"""Debug: find a post with open comments and test it."""
import json, subprocess, time, random
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

# Get recent posts from r/resumes that might allow comments
url = "https://www.reddit.com/r/resumes/new.json?limit=10&raw_json=1"
script = f"""
(async()=>{{
    try {{
        const r = await fetch("{url}", {{credentials: "include"}});
        if (!r.ok) return JSON.stringify({{error: "HTTP " + r.status}});
        const d = await r.json();
        const posts = (d.data?.children || []).map(({{
            id: c.data.id,
            title: c.data.title.substring(0, 80),
            num_comments: c.data.num_comments,
            permalink: "https://www.reddit.com" + c.data.permalink
        }});
        return JSON.stringify({{ok: true, posts}});
    }} catch(e) {{
        return JSON.stringify({{error: e.message}});
    }}
}})()
"""
r = paw({"action": "evaluate", "script": script})
print("Recent r/resumes posts:")

test_url = None
if isinstance(r, dict) and r.get("ok"):
    for p in r.get("posts", []):
        print(f"  [{p['num_comments']} comments] {p['title']}")
        print(f"      {p['permalink']}")
        if p["num_comments"] > 0 and test_url is None:
            test_url = p["permalink"]

# Pick a post with comments
if not test_url:
    test_url = "https://www.reddit.com/r/resumes/comments/1vrubp6/resume_help_needed_for_data_analyst_role/"

print(f"\n\nTesting: {test_url}")
paw({"action": "navigate", "url": test_url, "waitUntil": "networkidle"})
time.sleep(5)

# Check for comment section
check_script = """
(() => {
    // Scroll to where comments should be
    window.scrollTo(0, 800);
    
    const result = {
        url: window.location.href,
        title: document.title,
        
        // Look for comment-related elements
        commentsContainer: document.querySelector('[data-testid="post-comments"]') ? true : false,
        commentsContainer2: document.querySelector('[data-testid="post-container"]') ? true : false,
        
        // All contenteditable elements
        editables: [],
        
        // Anything with "comment" in its text/aria
        commentElements: [],
        
        // Comment count
        commentCount: ''
    };
    
    // Check editables
    const allEditables = document.querySelectorAll('[contenteditable="true"]');
    for (const e of allEditables) {
        const rect = e.getBoundingClientRect();
        result.editables.push({
            tag: e.tagName,
            ce: e.contentEditable,
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            placeholder: e.getAttribute('data-placeholder') || ''
        });
    }
    
    // Comments count
    const commentTexts = document.querySelectorAll('[data-click-id="comments"]');
    if (commentTexts.length > 0) result.commentCount = commentTexts[0].textContent;
    
    return JSON.stringify(result);
})()
"""
r = paw({"action": "evaluate", "script": check_script})
print("\nAfter 5s wait:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)

# Wait longer and check again
time.sleep(5)
r = paw({"action": "evaluate", "script": check_script})
print("\nAfter 10s wait:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)
