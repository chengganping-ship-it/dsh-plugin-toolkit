#!/usr/bin/env python3
"""Control Fiverr form using JS evaluate (no paw click/type)."""
import json, subprocess, time, sys
sys.stdout.reconfigure(line_buffering=True)

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

print("="*60)
print(f"Fiverr JS Mode | {time.strftime('%Y-%m-%d %H:%M')}")
print("="*60)

# Step 1: Clear and re-type title (use execCommand for React compatibility)
print("\n[Step 1] Clearing & typing title...")
title_text = "I will professionally optimize your resume and LinkedIn profile"
title_json = json.dumps(title_text)

r = paw({"action": "evaluate", "script": """
(() => {
    const ta = document.querySelector('textarea._25a7db');
    if (!ta) return JSON.stringify({err: 'no textarea'});
    ta.focus();
    ta.click();
    // Select all and delete
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    // Insert text
""" + "    document.execCommand('insertText', false, " + title_json + ");\n" + """
    return JSON.stringify({ok: true, val: ta.value});
})()
"""})
print(f"  Title: {r}")
time.sleep(2)

# Step 2: Open Category dropdown
print("\n[Step 2] Opening Category dropdown...")
r2 = paw({"action": "evaluate", "script": """
(() => {
    // Find clickable element with SELECT A CATEGORY
    const all = document.querySelectorAll('div, button, span, a');
    for (const el of all) {
        if (el.textContent.trim() === 'SELECT A CATEGORY' && el.offsetParent !== null) {
            el.click();
            return JSON.stringify({clicked: true, tag: el.tagName, cls: el.className.substring(0, 60)});
        }
    }
    // Try parent approach
    const labels = document.querySelectorAll('[class*="combo"]');
    for (const el of labels) {
        if (el.textContent.includes('SELECT A CATEGORY') && el.offsetParent !== null) {
            el.click();
            return JSON.stringify({clicked: true, tag: el.tagName, cls: el.className.substring(0, 60)});
        }
    }
    return JSON.stringify({err: 'no element found'});
})()
"""})
print(f"  Open: {r2}")
time.sleep(2)

# Step 3: Look for and click "Writing & Content" in dropdown
print("[Step 3] Selecting category: Writing & Content...")
r3 = paw({"action": "evaluate", "script": """
(() => {
    const items = document.querySelectorAll('[role="option"], li, div[class*="item"], span[class*="item"], [class*="option"], [class*="menu-item"]');
    for (const el of items) {
        if (el.textContent.trim() === 'Writing & Content' && el.offsetParent !== null) {
            el.click();
            return JSON.stringify({clicked: 'Writing & Content'});
        }
    }
    // Broader search
    for (const el of document.querySelectorAll('*')) {
        if (el.textContent.trim() === 'Writing & Content' && el.offsetParent !== null && el.children.length === 0) {
            el.click();
            return JSON.stringify({clicked: 'Writing & Content', tag: el.tagName});
        }
    }
    return JSON.stringify({err: 'not found', items: items.length});
})()
"""})
print(f"  Category: {r3}")
time.sleep(2)

# Step 4: Select Subcategory
print("[Step 4] Selecting subcategory...")
r4 = paw({"action": "evaluate", "script": """
(() => {
    const items = document.querySelectorAll('[role="option"], li, div[class*="item"], [class*="option"]');
    for (const el of items) {
        if ((el.textContent.trim() === 'Resumes & Cover Letters' || el.textContent.toLowerCase().includes('resume')) && el.offsetParent !== null && el.textContent.length < 30) {
            el.click();
            return JSON.stringify({clicked: el.textContent.trim()});
        }
    }
    // Try all elements
    for (const el of document.querySelectorAll('*')) {
        if (el.textContent.trim() === 'Resumes & Cover Letters' && el.offsetParent !== null && el.children.length === 0) {
            el.click();
            return JSON.stringify({clicked: 'Resumes & Cover Letters'});
        }
    }
    return JSON.stringify({err: 'sub not found'});
})()
"""})
print(f"  Subcategory: {r4}")
time.sleep(2)

# Step 5: State check
print("\n[Step 5] State check...")
r5 = paw({"action": "evaluate", "script": "document.body.innerText.substring(0, 600)"})
print(f"Page: {r5}")
