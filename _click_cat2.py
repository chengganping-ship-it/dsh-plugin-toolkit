#!/usr/bin/env python3
import json, subprocess, time
PAW = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"
def paw(payload_dict):
    payload = json.dumps(payload_dict).replace("'", "''")
    ps_cmd = f"& '{PAW}' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
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

# Use JavaScript to find and click the deepest element containing "Select A Category"
r = paw({"action": "evaluate", "script": """
(() => {
    // Walk through all elements to find the deepest clickable target
    const all = document.querySelectorAll('*');
    const matches = [];
    for (const el of all) {
        // Check if element directly contains "Select A Category" text
        for (const child of el.childNodes) {
            if (child.nodeType === 3 && child.textContent.trim() === 'Select A Category') {
                const rect = el.getBoundingClientRect();
                if (rect.width > 10 && rect.height > 10) {
                    matches.push({
                        tag: el.tagName,
                        cls: (el.className || '').substring(0, 80),
                        text: el.textContent.trim().substring(0, 40),
                        x: Math.round(rect.x + rect.width/2),
                        y: Math.round(rect.y + rect.height/2),
                        role: el.getAttribute('role') || '',
                        tabIdx: el.getAttribute('tabindex') || ''
                    });
                }
            }
        }
    }
    return JSON.stringify(matches);
})()
"""})
print("Deepest elements containing 'Select A Category':")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else r)
