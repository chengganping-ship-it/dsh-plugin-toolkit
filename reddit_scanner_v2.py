#!/usr/bin/env python3
"""
Reddit Demand Signal Scanner v2
Uses browser's fetch API (via PawBrowser) to scan subreddits for buyer signals.
No cookie extraction needed - browser already has login session.
"""
import json
import subprocess
import sys
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agent_data.db")
BROWSER_CMD = "paw"

# Subreddits to scan for resume/career/linkedin optimization demands
SUBREDDITS = [
    "r/resumes", "r/resume", "r/jobs", "r/careerguidance",
    "r/careeradvice", "r/findapath", "r/ITCareerQuestions",
    "r/cscareerquestions", "r/recruitinghell", "r/antiwork",
    "r/GetEmployed", "r/employment", "r/interviews",
    "r/linkedin", "r/hiring", "r/remotework"
]

# Intent keywords for classification
INTENT_PATTERNS = {
    "resume_help": [
        "resume", "cv", "curriculum vitae", "review my resume",
        "resume help", "resume feedback", "fix my resume",
        "resume critique", "resume review", "ats", "applicant tracking"
    ],
    "career_advice": [
        "career advice", "career change", "should i", "what career",
        "job search", "finding a job", "stuck in", "need advice",
        "help me", "struggling", "unemployed", "laid off"
    ],
    "linkedin_opt": [
        "linkedin", "linked in", "linkedin profile", "linkedin headline",
        "linkedin summary", "linkedin optimization", "linkedin help",
        "networking", "personal brand"
    ]
}

def browser_eval(script: str) -> dict:
    """Execute JavaScript in browser and return result."""
    payload = json.dumps({"action": "evaluate", "script": script})
    ps_cmd = f"& 'C:\\Users\\123\\.meituan-catpaw\\bin\\paw.ps1' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            return {"error": f"rc={result.returncode}", "stderr": result.stderr[:200]}
        data = json.loads(result.stdout.strip())
        if data.get("success") and "result" in data.get("data", {}):
            r = data["data"]["result"]
            if isinstance(r, str):
                try:
                    return json.loads(r)
                except json.JSONDecodeError:
                    return r
            return r
        return data
    except subprocess.TimeoutExpired:
        return {"error": "timeout"}
    except json.JSONDecodeError as e:
        return {"error": f"json_parse: {e}", "raw": result.stdout[:300]}
    except Exception as e:
        return {"error": str(e)}

def ensure_reddit_tab():
    """Make sure we're on reddit.com."""
    result = browser_eval("window.location.href")
    if "reddit.com" not in str(result):
        payload = json.dumps({"action":"navigate","url":"https://www.reddit.com"})
        ps_cmd = f"& 'C:\\Users\\123\\.meituan-catpaw\\bin\\paw.ps1' browser-action '{payload}'"
        cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
        subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        import time
        time.sleep(2)

def search_subreddit(subreddit: str, limit: int = 25) -> list:
    """Get recent posts from a subreddit using .json endpoint."""
    # Normalize subreddit name (strip r/ prefix)
    sub = subreddit.replace("r/", "")
    
    # Use /new.json which works reliably
    url = f"https://www.reddit.com/r/{sub}/new.json?limit={limit}&raw_json=1"
    
    script = """
(async()=>{
    try {
        const r = await fetch(\"""" + url + """\", {credentials: "include"});
        if (!r.ok) return JSON.stringify({error: "HTTP " + r.status});
        const d = await r.json();
        const posts = (d.data?.children || []).map(c => {
            const p = c.data;
            return {
                id: p.id,
                title: p.title,
                body: p.selftext?.substring(0, 500) || "",
                author: p.author,
                subreddit: p.subreddit,
                url: "https://reddit.com" + p.permalink,
                created_utc: p.created_utc,
                score: p.score,
                num_comments: p.num_comments
            };
        });
        return JSON.stringify({ok: true, count: posts.length, posts});
    } catch(e) {
        return JSON.stringify({error: e.message});
    }
})()
"""
    result = browser_eval(script)
    if isinstance(result, dict) and "error" in result:
        print(f"    [DEBUG] API error: {result}")
        return []
    if isinstance(result, dict) and "posts" in result:
        return result["posts"]
    if isinstance(result, list):
        return result
    print(f"    [DEBUG] Unexpected result type: {type(result).__name__} = {str(result)[:200]}")
    return []

def classify_intent(title: str, body: str) -> dict:
    """Classify intent based on keyword patterns."""
    text = (title + " " + body).lower()
    scores = {}
    
    for intent, keywords in INTENT_PATTERNS.items():
        score = sum(1 for kw in keywords if kw.lower() in text)
        # Normalize: score / number of keywords, capped at 1.0
        scores[intent] = min(score / max(len(keywords) * 0.3, 1), 1.0)
    
    # Find best match
    best_intent = max(scores, key=scores.get)
    best_score = scores[best_intent]
    
    if best_score < 0.1:
        return {"intent": "other", "confidence": 1.0 - best_score, "scores": scores}
    
    return {"intent": best_intent, "confidence": round(best_score, 2), "scores": scores}

def init_db():
    """Create database if not exists."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS demand_signals (
            signal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            author TEXT,
            title TEXT,
            body TEXT,
            url TEXT UNIQUE,
            intent TEXT,
            intent_confidence REAL DEFAULT 0.0,
            urgency TEXT DEFAULT 'medium',
            budget_hint TEXT,
            keywords TEXT,
            captured_at TEXT,
            processed INTEGER DEFAULT 0,
            proposal_sent INTEGER DEFAULT 0,
            processed_action TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_signal(signal: dict):
    """Save demand signal to SQLite database."""
    if not os.path.exists(DB_PATH):
        init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if already exists
    c.execute("SELECT signal_id FROM demand_signals WHERE url = ?", (signal["url"],))
    if c.fetchone():
        conn.close()
        return False
    
    c.execute("""
        INSERT INTO demand_signals 
        (source, author, title, body, url, intent, intent_confidence, 
         urgency, budget_hint, keywords, captured_at, processed, proposal_sent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    """, (
        signal["source"],
        signal["author"],
        signal["title"],
        signal["body"],
        signal["url"],
        signal["intent"],
        signal["confidence"],
        signal.get("urgency", "medium"),
        signal.get("budget_hint", ""),
        signal.get("keywords", ""),
        signal["captured_at"]
    ))
    conn.commit()
    conn.close()
    return True

def scan_all():
    """Scan all subreddits and save signals."""
    ensure_reddit_tab()
    
    total_found = 0
    total_saved = 0
    all_signals = []
    
    for sub in SUBREDDITS:
        print(f"\n扫描 {sub}...")
        try:
            posts = search_subreddit(sub, limit=25)
            if not posts:
                print(f"  无结果 (posts={type(posts).__name__})")
                # Debug: show what we got
                if isinstance(posts, dict) and "error" in posts:
                    print(f"  ERROR: {posts}")
                continue
            
            saved = 0
            for post in posts:
                intent_result = classify_intent(post["title"], post["body"])
                
                # Only keep posts with actionable intent
                if intent_result["intent"] == "other":
                    continue
                
                # Calculate urgency based on post freshness and content
                age_hours = (datetime.now().timestamp() - post["created_utc"]) / 3600
                urgency = "high" if age_hours < 6 else ("medium" if age_hours < 24 else "low")
                
                signal = {
                    "source": f"reddit/{post['subreddit']}",
                    "author": post["author"],
                    "title": post["title"],
                    "body": post["body"],
                    "url": post["url"],
                    "intent": intent_result["intent"],
                    "confidence": intent_result["confidence"],
                    "urgency": urgency,
                    "budget_hint": "",
                    "keywords": ",".join([k for k, v in sorted(
                        intent_result["scores"].items(), key=lambda x: -x[1]
                    )[:2]]),
                    "captured_at": datetime.now().isoformat()
                }
                
                if save_signal(signal):
                    saved += 1
                    total_saved += 1
                    all_signals.append(signal)
            
            print(f"  找到 {len(posts)} 帖, 保存 {saved} 信号")
            total_found += len(posts)
            
        except Exception as e:
            print(f"  错误: {e}")
            continue
    
    print(f"\n{'='*50}")
    print(f"扫描完成: 总计 {total_found} 帖, 新增 {total_saved} 信号")
    
    # Summary by intent
    from collections import Counter
    intents = Counter(s["intent"] for s in all_signals)
    print(f"意图分布: {dict(intents)}")
    
    return all_signals

if __name__ == "__main__":
    print("="*50)
    print(f"Reddit Demand Scanner v2 | {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("="*50)
    
    signals = scan_all()
    
    # Print top signals
    if signals:
        print(f"\n{'='*50}")
        print("优先级信号 (高意图分):")
        print("="*50)
        sorted_signals = sorted(signals, key=lambda x: -x["confidence"])
        for s in sorted_signals[:10]:
            print(f"\n[{s['intent']}] {s['title'][:60]}...")
            print(f"  用户: {s['author']} | 子版: {s['source']}")
            print(f"  链接: {s['url']}")
