#!/usr/bin/env python3
"""Try old.reddit.com for simpler comment automation."""
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

# Convert URL to old.reddit.com format
url = "https://old.reddit.com/r/linkedin/comments/1vqto9r/linkedin_need_help_with_headline/"
print(f"Navigating to: {url}")
paw({"action": "navigate", "url": url, "waitUntil": "networkidle"})
time.sleep(5)

# Check page
r = paw({"action": "evaluate", "script": """
(() => {
    return JSON.stringify({
        url: window.location.href,
        title: document.title,
        editables: document.querySelectorAll('textarea, [contenteditable="true"]').length,
        commentboxes: document.querySelectorAll('textarea[name="text"], .usertext-edit textarea').length,
        bodyText: document.body.innerText.substring(0, 200)
    });
})()
"""})
print("\nOld Reddit page state:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)

# Try to find and type in the comment textarea
if isinstance(r, dict) and r.get("title") and "linkedin" in r.get("title", "").lower():
    # The title confirms we're on the right page
    type_script = """
(() => {
    // Try multiple selectors for old reddit comment box
    let tb = document.querySelector('textarea[name="text"]');
    if (!tb) tb = document.querySelector('.usertext-edit textarea');
    if (!tb) tb = document.querySelector('textarea');
    if (!tb) return JSON.stringify({err: 'no textarea found'});
    
    // Focus and type
    tb.focus();
    tb.value = 'test comment here';
    
    // For old reddit, the textarea is plain - no React state to update
    // Just dispatching input event
    tb.dispatchEvent(new Event('input', {bubbles: true}));
    
    return JSON.stringify({ok: true, value: tb.value});
})()
"""
    print("\nAttempting to type in comment box...")
    r = paw({"action": "evaluate", "script": type_script})
    print("Type result:", r)
