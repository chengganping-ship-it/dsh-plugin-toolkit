#!/usr/bin/env python3
"""Complete Fiverr gig form - title, category, tags."""
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

print("="*60)
print(f"Complete Fiverr Form | {time.strftime('%Y-%m-%d %H:%M')}")
print("="*60)

# Step 1: Try to re-type the full title
print("\n[Step 1] Re-typing title (clear + type)...")
# Triple click to select all in textarea, then type
r = paw({"action": "click", "selector": "textarea._25a7db", "clickCount": 3})
print(f"  Select all: {r}")
time.sleep(0.5)

full_title = "I will optimize your resume and LinkedIn profile for ATS and recruiters"
r2 = paw({"action": "type", "selector": "textarea._25a7db", "text": full_title})
print(f"  Type: {r2}")
time.sleep(1)

# Verify
r3 = paw({"action": "evaluate", "script": """
(() => {
    const ta = document.querySelector('textarea._25a7db');
    return JSON.stringify({value: ta ? ta.value : 'N/A'});
})()
"""})
print(f"  Value: {r3}")

# Step 2: Select Category using React combo box
print("\n[Step 2] Opening category dropdown...")
# Find the category combo-box trigger
r4 = paw({"action": "evaluate", "script": """
(() => {
    // Look for the category trigger button
    const all = document.querySelectorAll('[class*="combo-box"], [class*="dropdown"], [class*="orca-combo"]');
    const results = [];
    for (const el of all) {
        if (el.textContent.includes('SELECT A CATEGORY') || el.textContent.includes('CATEGORY')) {
            results.push({class: el.className.substring(0, 80), tag: el.tagName, text: el.textContent.substring(0, 50)});
        }
    }
    return JSON.stringify({categoryTriggers: results, formText: document.body.innerText.substring(0, 400)});
})()
"""})
print(f"  Category triggers: {r4}")

category_info = r4 if isinstance(r4, dict) else {}
triggers = category_info.get("categoryTriggers", [])

if triggers:
    # Click the first category trigger to open dropdown
    first_class = triggers[0].get("class", "")
    print(f"  Clicking category trigger: {first_class[:60]}...")
    
    # Use click on the element's position
    r5 = paw({"action": "evaluate", "script": f"""
(() => {{
    const el = document.querySelector('[class="{first_class}"]');
    if (el) {{
        el.click();
        return JSON.stringify({{clicked: true}});
    }}
    return JSON.stringify({{err: 'not found'}});
}})()
"""})
    print(f"  Click: {r5}")
    time.sleep(2)
    
    # Now search for "Writing & Content" or similar
    print("  Selecting category: Writing & Content -> Resume Writing")
    r6 = paw({"action": "evaluate", "script": """
(() => {
    // Look for category options
    const opts = document.querySelectorAll('[role="option"], [class*="option"], li, div[class*="item"]');
    for (const o of opts) {
        if (o.textContent.toLowerCase().includes('writing') || o.textContent.toLowerCase().includes('content')) {
            if (o.offsetParent !== null && o.textContent.length < 50) {
                o.click();
                return JSON.stringify({clicked: o.textContent.trim()});
            }
        }
    }
    return JSON.stringify({err: 'no option found'});
})()
"""})
    print(f"  Select: {r6}")
    time.sleep(1)
    
    # Try subcategory
    print("  Selecting subcategory: Resumes & Cover Letters")
    r7 = paw({"action": "evaluate", "script": """
(() => {
    const opts = document.querySelectorAll('[role="option"], [class*="option"], li');
    for (const o of opts) {
        if (o.textContent.toLowerCase().includes('resume') && o.offsetParent !== null && o.textContent.length < 40) {
            o.click();
            return JSON.stringify({clicked: o.textContent.trim()});
        }
    }
    return JSON.stringify({err: 'no sub found'});
})()
"""})
    print(f"  Subcategory: {r7}")

# Step 3: Verify state
print("\n[Step 3] Verifying state...")
r8 = paw({"action": "evaluate", "script": "document.body.innerText.substring(0, 1000)"})
print(f"Page: {r8}")

print("\nForm completion in progress. Next would be tags, pricing, description.")
