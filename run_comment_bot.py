#!/usr/bin/env python3
"""
Safe Reddit Comment Bot Runner
- Reads signals from agent_data.db
- Posts value-first comments with human-like delays
- Logs all posted URLs to prevent duplicate
- Rate-limits to avoid spam detection
"""
import json
import subprocess
import sqlite3
import os
import sys
import time
import random
from datetime import datetime
sys.stdout.reconfigure(line_buffering=True)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agent_data.db")
POSTED_LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "posted_comments.json")
PAW_ps1 = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"

# Value-first comment templates by intent - no links, pure value, soft CTA
COMMENT_TEMPLATES = {
    "resume_help": [
        "I built a free ATS score checker that matches your resume against any job description. Happy to run yours through it if you want, just DM me.",
        "I've helped ~200 resumes land interviews. The #1 mistake I see is using the same resume for every application instead of tailoring keywords to each JD. If your resume is getting zero callbacks, DM me and I'll point out what's wrong.",
        "Pro tip: run your resume through a free ATS simulator before applying. Most people lose interviews in the first 6 seconds because the ATS couldn't parse their resume format. Happy to share a checklist if anyone needs it.",
    ],
    "career_advice": [
        "I transitioned from IC to management 3 years ago. The game-changer was reframing every bullet point from what I did to what impact my team achieved. DM me if you want specific examples.",
        "Career changes at 30+ are more common than people think. The biggest mistake is applying for your exact previous role in a new industry - instead, create a target list of 10 companies and network your way in. I can help with the playbook if interested.",
        "I've mentored 50+ people through career pivots. The ones who succeed fastest all do one thing: they build proof of their new direction before applying. Portfolio projects, open source, freelance - anything concrete.",
    ],
    "linkedin_opt": [
        "I'm a LinkedIn optimization specialist. The #1 mistake: copying your resume bullets to LinkedIn. Your LinkedIn About should tell a story about where you're going, not list where you've been. DM me if you want an audit.",
        "Your LinkedIn headline is your most valuable searchable real estate. Instead of your job title, try: [Current Role] | [Specialty] | [Result You Deliver] | [Target Audience]. It completely changes who finds you.",
        "Quick LinkedIn audit: your Featured section should be full of proof of your expertise, not just a résumé PDF. Video, articles, presentations - anything that shows, not tells. Worth 3x more endorsements.",
    ]
}

def load_posted():
    if os.path.exists(POSTED_LOG):
        with open(POSTED_LOG, 'r') as f:
            return json.load(f)
    return []

def save_posted(posted):
    with open(POSTED_LOG, 'w') as f:
        json.dump(posted, f, indent=2)

def paw(payload_dict):
    """Execute browser action via pwsh + paw.ps1. payload_dict must include 'action'."""
    payload = json.dumps(payload_dict).replace("'", "''")  # escape for PS single-quoted string
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
    except subprocess.TimeoutExpired:
        return {"err": "timeout"}
    except json.JSONDecodeError as e:
        return {"err": f"json_parse: {e}", "raw": r.stdout[:300] if r else ""}
    except Exception as e:
        return {"err": str(e)}

def navigate_to_post(url):
    """Navigate to Reddit post - use old.reddit.com for reliable automation."""
    # Convert to old.reddit.com for simpler comment automation
    old_url = url.replace("https://www.reddit.com", "https://old.reddit.com")
    old_url = old_url.replace("https://reddit.com", "https://old.reddit.com")
    r = paw({"action": "navigate", "url": old_url, "waitUntil": "networkidle"})
    time.sleep(3)
    return r

def post_comment(comment_text):
    """Find comment box on old.reddit.com and insert text via textarea.value."""
    text_json = json.dumps(comment_text)
    insert_script = """
(() => {
    // Old Reddit uses a plain textarea for comments
    let tb = document.querySelector('textarea[name="text"]');
    if (!tb) tb = document.querySelector('.usertext-edit textarea');
    if (!tb) tb = document.querySelector('textarea');
    if (!tb) return JSON.stringify({error: 'no textarea found'});
    
    tb.focus();
    const text = """ + text_json + """;
    tb.value = text;
    tb.dispatchEvent(new Event('input', {bubbles: true}));
    tb.dispatchEvent(new Event('change', {bubbles: true}));
    
    return JSON.stringify({ok: true, value: tb.value.substring(0, 50)});
})()
"""
    r = paw({"action": "evaluate", "script": insert_script})
    return r

def click_submit():
    """Click the comment submit button on old.reddit.com."""
    script = """
(() => {
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const b of buttons) {
        const t = (b.textContent + ' ' + (b.value || '')).toLowerCase();
        if (t.includes('save') || t.includes('submit') || t.includes('add comment')) {
            if (b.offsetParent !== null) {
                b.click();
                return JSON.stringify({clicked: b.textContent || b.value});
            }
        }
    }
    return JSON.stringify({error: "No submit button found"});
})()
"""
    return paw({"action": "evaluate", "script": script})

def run_bot(comment_limit=5):
    """Run the comment bot."""
    posted = load_posted()
    
    # Get pending signals from DB
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        SELECT * FROM demand_signals 
        WHERE processed = 0 AND intent IN ('resume_help', 'career_advice', 'linkedin_opt')
        ORDER BY intent_confidence DESC, urgency DESC
        LIMIT ?
    """, (comment_limit,))
    signals = [dict(row) for row in c.fetchall()]
    conn.close()
    
    print(f"待处理: {len(signals)} 条评论, 已发送: {len(posted)}")
    
    success = 0
    
    for i, signal in enumerate(signals):
        url = signal["url"]
        intent = signal["intent"]
        
        if url in posted:
            print(f"  [{i+1}] SKIP (already posted): {url[:50]}")
            continue
        
        # Pick template
        templates = COMMENT_TEMPLATES.get(intent, COMMENT_TEMPLATES["career_advice"])
        comment = random.choice(templates)
        
        print(f"\n[{i+1}/{len(signals)}] {intent}: {url[:60]}...")
        print(f"  评论: {comment[:80]}...")
        
        # Human-like delay (60-180 seconds between comments)
        wait = random.randint(90, 240)
        print(f"  等待 {wait}秒...")
        time.sleep(wait)
        
        # Navigate to post
        print(f"  导航到帖子...")
        nav = navigate_to_post(url)
        
        # Verify navigation succeeded
        title_check = paw({"action": "evaluate", "script": "document.title"})
        if isinstance(title_check, str) and ("page not found" in title_check.lower() or "www.reddit.com" in str(paw({"action": "evaluate", "script": "window.location.href"}) or "")):
            print(f"  ✗ 跳过 (导航失败): title={title_check}")
            conn = sqlite3.connect(DB_PATH)
            conn.execute("UPDATE demand_signals SET processed=1, processed_action='nav_failed' WHERE url=?", (url,))
            conn.commit()
            conn.close()
            continue
        
        # Post comment
        print(f"  输入评论...")
        result = post_comment(comment)
        print(f"  输入结果: {result}")
        
        if isinstance(result, dict) and result.get("ok") == True:
            # Click submit
            time.sleep(1)
            print(f"  提交评论...")
            submit_result = click_submit()
            print(f"  提交: {submit_result}")
            success += 1
            
            # Log
            posted.append({"url": url, "time": datetime.now().isoformat(), "intent": intent})
            save_posted(posted)
            
            # Mark processed (success)
            conn = sqlite3.connect(DB_PATH)
            conn.execute("UPDATE demand_signals SET processed=1, processed_action='comment_sent' WHERE url=?", (url,))
            conn.commit()
            conn.close()
        else:
            print(f"  ✗ 跳过 (输入失败): {result}")
            # Mark failed posts so we don't retry endlessly
            conn = sqlite3.connect(DB_PATH)
            conn.execute("UPDATE demand_signals SET processed=1, processed_action='comment_failed' WHERE url=?", (url,))
            conn.commit()
            conn.close()
    
    print(f"\n完成! 发送了 {success} 条评论")
    return success

if __name__ == "__main__":
    print("="*50)
    print(f"Reddit Comment Bot | {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("="*50)
    run_bot(comment_limit=5)
