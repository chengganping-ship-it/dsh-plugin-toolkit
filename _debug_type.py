#!/usr/bin/env python3
"""Test typing into Lexical editor via paw type action."""
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

# First, focus on the editor by clicking it
focus_script = """
(() => {
    const editor = document.querySelector('[data-lexical-editor="true"]');
    if (!editor) return JSON.stringify({err: 'no lexical editor'});
    editor.focus();
    editor.click();
    // Also try the contenteditable parent
    const ce = editor.closest('[contenteditable="true"]');
    if (ce) { ce.focus(); ce.click(); }
    return JSON.stringify({ok: true, found: true});
})()
"""
print("Focusing editor...")
r = paw({"action": "evaluate", "script": focus_script})
print("Focus result:", r)

time.sleep(1)

# Try using the type action through evaluate first
# First check what's in the editor
check_script = """
(() => {
    const editor = document.querySelector('[data-lexical-editor="true"]');
    const ce = document.querySelector('[contenteditable="true"]');
    return JSON.stringify({
        lexical: editor ? editor.textContent.substring(0, 100) : null,
        editable: ce ? ce.textContent.substring(0, 100) : null,
        sel: window.getSelection().toString().substring(0, 50)
    });
})()
"""
print("\nChecking editor content BEFORE type:")
r = paw({"action": "evaluate", "script": check_script})
print(r)

# Now try using type action via element handle
print("\nAttempting type via type action...")
# First find the editor location to click on it
click_script = """
(() => {
    const editor = document.querySelector('[data-lexical-editor="true"]');
    if (!editor) return JSON.stringify({err: 'no editor'});
    const rect = editor.getBoundingClientRect();
    return JSON.stringify({x: rect.x + 50, y: rect.y + 20, w: rect.width, h: rect.height});
})()
"""
r = paw({"action": "evaluate", "script": click_script})
print("Editor position:", r)

if isinstance(r, dict) and "x" in r:
    x = r["x"]
    y = r["y"]
    # Click at position
    print(f"\nClicking at ({x}, {y})...")
    paw({"action": "click", "x": x, "y": y})
    time.sleep(0.5)
    
    # Try type action
    print("Typing test text...")
    paw({"action": "type", "text": "test comment"})
    time.sleep(1)
    
    # Check result
    r = paw({"action": "evaluate", "script": check_script})
    print("Editor content AFTER type:", r)
