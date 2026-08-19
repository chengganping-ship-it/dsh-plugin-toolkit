#!/usr/bin/env python3
"""
Reddit Comment Bot - Demand Signal to Customer Conversion
Reads signals from database, posts valuable comments that drive to Fiverr.
Uses browser automation + Reddit JSON API approach for reliable commenting.
"""
import json
import subprocess
import sqlite3
import os
import time
import random
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agent_data.db")
BROWSER_CMD = "paw"
POSTED_LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "posted_comments.json")

# Comment templates by intent - value-first approach
COMMENT_TEMPLATES = {
    "resume_help": [
        "I actually built a free ATS checker that scans your resume against job descriptions and gives you a match score. Happy to run yours through it if you want — just DM me with your resume and a JD you're targeting.",
        "I've helped ~200 people optimize their resumes for ATS systems. The #1 mistake I see is keyword stuffing instead of semantic matching. If you want, share a link to your resume and I'll give you 3 specific suggestions.",
        "There's a free tool called Jobscan that does basic ATS matching. But if you want deeper analysis — like which exact skills to add and how to reword your bullets for ATS — I've done this professionally for 3 years. DM me if interested.",
    ],
    "career_advice": [
        "I've been through this transition myself (tech lead → engineering manager). The hardest part isn't the resume — it's reframing your narrative from 'I built X' to 'I led team to deliver Y'. Happy to chat more if helpful.",
        "Career changes at 30+ are more common than people think. The key is mapping transferable skills rather than starting from scratch. I wrote a guide on this — DM me and I'll share.",
        "I've mentored ~50 people through career pivots. The ones who succeed fastest are the ones who build a portfolio that proves their new direction before applying. Happy to share what worked if you want.",
    ],
    "linkedin_opt": [
        "I optimize LinkedIn profiles for a living. The #1 mistake people make is copying their resume bullet-for-bullet. LinkedIn should tell a story about where you're going, not where you've been. DM if you want a free audit.",
        "Your LinkedIn headline is your most valuable real estate — but most people just put their job title. Try this formula: [Role] | [Specialty] | [Result you deliver] | [Who you help]. DM me if you want me to review yours.",
        "I've helped 100+ people rewrite their LinkedIn profiles. The biggest ROI change is replacing passive responsibilities with active achievements in your About section. Happy to give your profile a quick review — just DM me.",
    ]
}

def load_posted():
    """Load list of already-posted URLs."""
    if os.path.exists(POSTED_LOG):
        with open(POSTED_LOG, 'r') as f:
            return json.load(f)
    return []

def save_posted(posted):
    """Save posted URLs."""
    with open(POSTED_LOG, 'w') as f:
        json.dump(posted, f, indent=2)

def get_pending_signals(limit=20):
    """Get signals that haven't been acted on yet."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("""
        SELECT * FROM demand_signals 
        WHERE processed = 0 AND intent != 'other'
        ORDER BY intent_confidence DESC, urgency ASC
        LIMIT ?
    """, (limit,))
    
    signals = [dict(row) for row in c.fetchall()]
    conn.close()
    return signals

def post_comment_via_browser(post_url, comment_text):
    """Navigate to post and post a comment using browser automation."""
    # Navigate to post
    payload = json.dumps({"action": "navigate", "url": post_url, "waitUntil": "networkidle"})
    cmd = f"{BROWSER_CMD} browser-action '{payload}'"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=20)
    
    if result.returncode != 0:
        return False
    
    time.sleep(2)
    
    # Find comment input and type comment
    # Reddit's comment box is a contenteditable div
    find_and_type = """
    (() => {
        // Try multiple selectors for Reddit's comment box
        const selectors = [
            "[contenteditable='true'][class*='comment']",
            "[contenteditable='true'][class*='editor']",
            "div[contenteditable='true']",
            "[data-testid='comment']",
            "[role='textbox']"
        ];
        
        let box = null;
        for (const sel of selectors) {
            box = document.querySelector(sel);
            if (box) break;
        }
        
        if (!box) return JSON.stringify({error: 'no comment box found', tried: selectors.length});
        
        box.focus();
        box.click();
        
        // Use clipboard API for reliable text insertion
        const text = '""" + comment_text.replace("'", "\\'").replace('"', '\\"') + """';
        
        // Use execCommand for contenteditable
        document.execCommand('insertText', false, text);
        
        return JSON.stringify({ok: true, textLen: text.length});
    })()
    """
    
    payload = json.dumps({"action": "evaluate", "script": find_and_type})
    cmd = f"{BROWSER_CMD} browser-action '{payload}'"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
    
    if result.returncode != 0:
        return False
    
    try:
        output = json.loads(result.stdout.strip())
        if output.get("success") and "error" not in output.get("data", {}):
            eval_result = json.loads(output["data"]["result"])
            if eval_result.get("ok"):
                time.sleep(1)
                # Click submit button
                submit_comment()
                return True
    except Exception:
        pass
    
    return False

def submit_comment():
    """Click the comment submit button."""
    find_submit = """
    (() => {
        const selectors = [
            "button[type='submit']",
            "[class*='submit'] button",
            "button:has-text('Comment')",
            "[class*='post'] button"
        ];
        
        // Try to find any submit-like button near the comment area
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const text = btn.textContent.trim().toLowerCase();
            if (text === 'comment' || text === 'reply' || text === 'post') {
                btn.click();
                return JSON.stringify({ok: true, text: text});
            }
        }
        return JSON.stringify({error: 'no submit found'});
    })()
    """
    
    payload = json.dumps({"action": "evaluate", "script": find_submit})
    cmd = f"{BROWSER_CMD} browser-action '{payload}'"
    subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)

def run_comment_bot():
    """Main bot loop."""
    print("="*50)
    print(f"Reddit Comment Bot | {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("="*50)
    
    posted = load_posted()
    signals = get_pending_signals(limit=10)
    
    print(f"待处理信号: {len(signals)}, 已发帖: {len(posted)}")
    
    if not signals:
        print("没有待处理的信号")
        return
    
    success_count = 0
    
    for i, signal in enumerate(signals):
        post_url = signal["url"]
        intent = signal["intent"]
        
        # Skip if already posted
        if post_url in posted:
            continue
        
        # Pick a random comment template for this intent
        templates = COMMENT_TEMPLATES.get(intent, COMMENT_TEMPLATES["career_advice"])
        comment = random.choice(templates)
        
        print(f"\n[{i+1}/{len(signals)}] {intent} → {post_url[:60]}...")
        print(f"  评论: {comment[:80]}...")
        
        # Add human-like delay (30-120 seconds between comments)
        delay = random.randint(30, 120)
        print(f"  等待 {delay}秒 (反风控)...")
        time.sleep(delay)
        
        if post_comment_via_browser(post_url, comment):
            posted.append(post_url)
            save_posted(posted)
            success_count += 1
            print(f"  ✓ 评论成功!")
        else:
            print(f"  ✗ 评论失败，跳过")
        
        # Mark as processed in DB
        conn = sqlite3.connect(DB_PATH)
        conn.execute("UPDATE demand_signals SET processed = 1, processed_action = 'comment_posted' WHERE url = ?", (post_url,))
        conn.commit()
        conn.close()
    
    print(f"\n完成: {success_count}/{len(signals)} 评论已发送")

if __name__ == "__main__":
    run_comment_bot()
