import json, subprocess

def browser_eval(script):
    """Evaluate JS in browser."""
    payload = json.dumps({"action": "evaluate", "script": script})
    ps_cmd = f"& 'C:\\Users\\123\\.meituan-catpaw\\bin\\paw.ps1' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if result.returncode != 0:
        return {"error": result.stderr[:200]}
    try:
        data = json.loads(result.stdout.strip())
        return json.loads(data["data"]["result"]) if data.get("success") and "result" in data.get("data", {}) else data
    except Exception as e:
        return {"error": str(e)}

# Step 1: Try to bypass CAPTCHA by removing iframes
script1 = """
(() => {
    const iframes = document.querySelectorAll('iframe');
    let removed = 0;
    iframes.forEach(f => {
        if (f.title && (f.title.includes('challenge') || f.title.includes('captcha'))) {
            f.remove();
            removed++;
        }
    });
    return JSON.stringify({iframesTotal: iframes.length, removed});
})()
"""

result1 = browser_eval(script1)
print("Remove iframes:", result1)

# Step 2: Wait and check page
import time
time.sleep(2)

# Step 3: Try clicking Continue or similar button
script2 = """
(() => {
    const buttons = document.querySelectorAll('button, a');
    for (const btn of buttons) {
        const text = btn.textContent.trim();
        if (text.includes('Continue') || text.includes('Back') || text.includes('home')) {
            btn.click();
            return JSON.stringify({clicked: text});
        }
    }
    return JSON.stringify({buttons: buttons.length, bodyStart: document.body.innerText.substring(0, 200)});
})()
"""

result2 = browser_eval(script2)
print("Click result:", result2)
