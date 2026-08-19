#!/usr/bin/env python3
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

# Analyze all inputs on Fiverr page
r = paw({"action": "evaluate", "script": """
(() => {
    const inputs = document.querySelectorAll('input, textarea');
    const results = [];
    for (const el of inputs) {
        const rect = el.getBoundingClientRect();
        results.push({
            tag: el.tagName,
            type: el.type || '',
            name: el.name || '',
            placeholder: el.placeholder || '',
            className: el.className.substring(0, 60),
            id: el.id || '',
            visible: rect.width > 0 && rect.height > 0,
            w: Math.round(rect.width),
            h: Math.round(rect.height)
        });
    }
    return JSON.stringify(results);
})()
"""})
print("All inputs on Fiverr page:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else str(r))

# Also check for specific Fiverr components
r2 = paw({"action": "evaluate", "script": """
(() => {
    const body = document.body.innerText;
    const hasTitle = body.toLowerCase().includes('title');
    const hasDescription = body.toLowerCase().includes('description');
    const hasCategory = body.toLowerCase().includes('category');
    const hasPricing = body.toLowerCase().includes('pricing') || body.toLowerCase().includes('price');
    const snippet = body.substring(0, 800);
    return JSON.stringify({hasTitle, hasDescription, hasCategory, hasPricing, snippet});
})()
"""})
print("\nPage content:")
print(json.dumps(r2, indent=2, ensure_ascii=False) if isinstance(r2, dict) else str(r2))
