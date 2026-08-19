#!/usr/bin/env python3
"""Debug current page structure."""
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

# Evaluate page structure
script = """
(() => {
    const result = {
        url: window.location.href,
        title: document.title,
        editables: document.querySelectorAll('[contenteditable="true"]').length,
        textboxes: document.querySelectorAll('[role="textbox"]').length,
        commentClasses: [],
        reactEditors: document.querySelectorAll('[data-lexical-editor]').length,
        commentSections: document.querySelectorAll('[data-testid="post-content"]').length,
        shadowHosts: 0
    };
    // Check for shadow DOM editors
    const all = document.querySelectorAll('*');
    for (const el of all) {
        if (el.shadowRoot) result.shadowHosts++;
    }
    // Get all contenteditable parents info
    const editables = document.querySelectorAll('[contenteditable="true"]');
    for (const e of editables) {
        result.commentClasses.push({
            tag: e.tagName,
            className: e.className.substring(0, 100),
            placeholder: e.getAttribute('data-placeholder') || '',
            text: e.textContent.substring(0, 30)
        });
    }
    return JSON.stringify(result);
})()
"""
r = paw({"action": "evaluate", "script": script})
print("Page debug:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)
