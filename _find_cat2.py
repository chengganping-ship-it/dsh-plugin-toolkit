#!/usr/bin/env python3
"""Find category element by rendered position."""
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

# Use a different approach - focus on form area
r = paw({"action": "evaluate", "script": """
(() => {
    // Find all visible text nodes containing select or category
    const results = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        const t = node.textContent.toLowerCase();
        if (t.includes('category') || t.includes('subcategory') || t.includes('select a')) {
            const el = node.parentElement;
            if (el && el.offsetParent !== null) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 20 && rect.height > 10) {
                    results.push({
                        text: node.textContent.trim().substring(0, 60),
                        tag: el.tagName,
                        cls: (el.className || '').substring(0, 80),
                        x: Math.round(rect.x + rect.width/2),
                        y: Math.round(rect.y + rect.height/2)
                    });
                }
            }
        }
    }
    return JSON.stringify(results.slice(0, 20));
})()
"""})
print("Category-related elements:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)
