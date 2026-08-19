#!/usr/bin/env python3
"""Navigate to a post, scroll, and inspect comment area."""
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

# Navigate to a post that we know allows comments
url = "https://www.reddit.com/r/linkedin/comments/1vqto9r/linkedin_need_help_with_headline/"
print(f"Navigating to {url}...")
paw({"action": "navigate", "url": url, "waitUntil": "networkidle"})
time.sleep(4)

# Scroll down to find comment area
print("Scrolling...")
paw({"action": "evaluate", "script": "window.scrollTo(0, document.body.scrollHeight*0.6)"})
time.sleep(2)

# Check what's on the page
script = """
(() => {
    const editors = document.querySelectorAll('[contenteditable="true"]');
    const lexical = document.querySelectorAll('[data-lexical-editor="true"]');
    const textboxes = document.querySelectorAll('[role="textbox"]');
    
    let results = {
        editables: editors.length,
        lexical: lexical.length,
        textboxes: textboxes.length,
        details: []
    };
    
    for (const e of editors) {
        const rect = e.getBoundingClientRect();
        results.details.push({
            tag: e.tagName,
            ce: e.contentEditable,
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            visible: rect.width > 0,
            placeholder: e.getAttribute('data-placeholder') || e.textContent.substring(0, 50)
        });
    }
    
    return JSON.stringify(results);
})()
"""
r = paw({"action": "evaluate", "script": script})
print("Page state after scroll:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)

# If editor is visible, try clicking it properly
if isinstance(r, dict):
    for detail in r.get("details", []):
        if detail.get("visible"):
            print(f"\nVisible editor found at ({detail['left']+10}, {detail['top']}+10)")
            # Click on it
            paw({"action": "click", "x": detail["left"]+10, "y": detail["top"]+10})
            time.sleep(1)
            
            # Try type action with selector approach
            type_result = paw({"action": "type", "selector": "[contenteditable='true']", "text": "Hello test"})
            print("Type with selector result:", type_result)
            break
    
    time.sleep(1)
    # Check content
    r = paw({"action": "evaluate", "script": """
(() => {
    const ce = document.querySelector('[contenteditable="true"]');
    return JSON.stringify({text: ce ? ce.textContent.substring(0,100) : 'NOT FOUND'});
})()
"""})
    print("\nEditor content:", r)
