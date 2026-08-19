#!/usr/bin/env python3
"""Test one comment on old reddit."""
import json, subprocess, time, random, sqlite3, os, sys
sys.stdout.reconfigure(line_buffering=True)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agent_data.db")
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

print("=== Testing ONE comment ===", flush=True)

# Get one signal from DB
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()
c.execute("""
    SELECT * FROM demand_signals 
    WHERE processed = 0 AND intent IN ('resume_help', 'career_advice', 'linkedin_opt')
    ORDER BY intent_confidence DESC
    LIMIT 1
""")
row = c.fetchone()
if not row:
    print("No pending signals!", flush=True)
    sys.exit(1)

signal = dict(row)
print(f"URL: {signal['url']}", flush=True)
print(f"Intent: {signal['intent']}", flush=True)

# Old reddit URL
old_url = signal['url'].replace("https://www.reddit.com", "https://old.reddit.com").replace("https://reddit.com", "https://old.reddit.com")
print(f"\nNavigating to: {old_url}", flush=True)
paw({"action": "navigate", "url": old_url, "waitUntil": "networkidle"})
time.sleep(3)

# Check page
r = paw({"action": "evaluate", "script": "JSON.stringify({title: document.title, url: window.location.href, textareas: document.querySelectorAll('textarea').length})"})
print(f"Page: {r}", flush=True)

# Type in comment
comment = "I built a free ATS score checker that matches your resume against any job description. Happy to run yours through it if you want, just DM me."
text_json = json.dumps(comment)
type_script = """
(() => {
    let tb = document.querySelector('textarea[name="text"]');
    if (!tb) return JSON.stringify({err: 'no textarea'});
    tb.focus();
    tb.value = """ + text_json + """;
    tb.dispatchEvent(new Event('input', {bubbles: true}));
    return JSON.stringify({ok: true, val: tb.value.substring(0, 40)});
})()
"""
r = paw({"action": "evaluate", "script": type_script})
print(f"Type result: {r}", flush=True)

if isinstance(r, dict) and r.get("ok"):
    time.sleep(1)
    # Click submit (old reddit "save" button)
    r = paw({"action": "evaluate", "script": """
(() => {
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const b of buttons) {
        const t = (b.textContent + ' ' + b.value).toLowerCase();
        if (t.includes('save') || t.includes('submit') || t.includes('comment') || t.includes('add comment')) {
            if (b.offsetParent !== null) {
                b.click();
                return JSON.stringify({clicked: b.textContent || b.value});
            }
        }
    }
    return JSON.stringify({err: 'no submit btn'});
})()
"""})
    print(f"Submit result: {r}", flush=True)
    
    # Mark as processed
    conn.execute("UPDATE demand_signals SET processed=1, processed_action='comment_sent' WHERE url=?", (signal['url'],))
    conn.commit()
    print("Marked as sent!", flush=True)
else:
    print(f"Failed to type!", flush=True)

conn.close()
print("\nDone!", flush=True)
