#!/usr/bin/env python3
"""Find the category dropdown trigger element."""
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

# Find all elements near "SELECT A CATEGORY" text
r = paw({"action": "evaluate", "script": """
(() => {
    const results = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.includes('SELECT A CATEGORY') || node.textContent.includes('SELECT A SUBCATEGORY')) {
            let el = node.parentElement;
            // Walk up to find clickable parent
            for (let i = 0; i < 5; i++) {
                if (!el) break;
                const rect = el.getBoundingClientRect();
                results.push({
                    tag: el.tagName,
                    cls: el.className.substring(0, 80),
                    text: el.textContent.substring(0, 60),
                    w: Math.round(rect.width),
                    h: Math.round(rect.height),
                    cursor: getComputedStyle(el).cursor,
                    clickable: el.onclick !== null || el.getAttribute('role') === 'button' || el.getAttribute('tabindex') !== null
                });
                el = el.parentElement;
            }
        }
    }
    return JSON.stringify(results);
})()
"""})
print("Elements near SELECT A CATEGORY:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)
