#!/usr/bin/env python3
"""
Reddit Karma Builder v1
Posts quality content to zero/low-karma-requirement subreddits
to build up comment karma so we can resume our comment strategy.
"""
import json, subprocess, time, random, sys
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

# Posts to make - genuine, helpful, no links (Reddit hates self-promotion early)
POSTS = [
    {
        "sub": "r/AskReddit",
        "title": "Career changers who switched after 30, what's one thing you wish you'd known before making the jump?",
        "flair": "Careers"
    },
    {
        "sub": "r/NoStupidQuestions",
        "title": "Is it normal to feel like your resume is 'lying' when you tailor it to job descriptions?",
        "body": "I've been job hunting for 3 months and every time I adjust my resume to match a JD, it feels like I'm fabricating experience. But everyone says you should 'tailor your resume' - where's the line between optimizing and lying?"
    },
    {
        "sub": "r/CasualConversation",
        "title": "LinkedIn has become a weird mix of job board, Facebook, and a humblebrag contest",
        "body": "I opened LinkedIn today and saw 12 'I'm thrilled to announce...' posts, 5 'After 87 rejections I finally...' stories, and someone who posted a screenshot of their salary. Is this what professional networking is now?"
    },
    {
        "sub": "r/DoesAnybodyElse",
        "title": "Feel weird applying to jobs when your current role title doesn't match what you actually do?",
        "body": "My official title is 'Analyst' but I do project management, data engineering, and some dev work. Every time I apply for a PM job, my resume doesn't 'look' like a PM. Does anyone else have this problem?"
    },
    {
        "sub": "r/AskReddit",
        "title": "Recruiters of Reddit: what's the #1 reason you reject a resume in the first 6 seconds?",
        "body": "Always curious what gets a resume immediately passed over versus what makes someone pause and read more."
    },
    {
        "sub": "r/OutOfTheLoop",
        "title": "What's with all the 'I landed a $200k tech job after 3 months of leetcode' posts on LinkedIn?",
        "body": "Is this some new humblebrag trend or are people actually doing this?"
    },
]

def submit_post(subreddit, title, body=""):
    """Submit a text post to old.reddit.com."""
    sub = subreddit.replace("r/", "")
    url = f"https://old.reddit.com/r/{sub}/submit"
    
    # Navigate to submit page
    print(f"  Navigating to {url}...")
    paw({"action": "navigate", "url": url, "waitUntil": "networkidle"})
    time.sleep(3)
    
    # Fill in title
    title_json = json.dumps(title)
    title_script = f"""
(() => {{
    let tb = document.querySelector('#title-field textarea, #title-field-ani textarea, input[name="title"]');
    if (!tb) tb = document.querySelector('textarea[name="title"]');
    if (!tb) return JSON.stringify({{err: 'no title field'}});
    tb.focus();
    tb.value = {title_json};
    tb.dispatchEvent(new Event('input', {{bubbles: true}}));
    tb.dispatchEvent(new Event('change', {{bubbles: true}}));
    return JSON.stringify({{ok: true, val: tb.value.substring(0, 50)}});
}})()
"""
    r = paw({"action": "evaluate", "script": title_script})
    print(f"    Title: {r}")
    
    if isinstance(r, dict) and r.get("ok") and body:
        # Fill in body
        body_json = json.dumps(body)
        body_script = f"""
(() => {{
    let tb = document.querySelector('#text-field textarea, #text-field-ani textarea, textarea[name="text"]');
    if (!tb) return JSON.stringify({{err: 'no body field'}});
    tb.focus();
    tb.value = {body_json};
    tb.dispatchEvent(new Event('input', {{bubbles: true}}));
    tb.dispatchEvent(new Event('change', {{bubbles: true}}));
    return JSON.stringify({{ok: true, val: tb.value.substring(0, 50)}});
}})()
"""
        r2 = paw({"action": "evaluate", "script": body_script})
        print(f"    Body: {r2}")
    
    time.sleep(1)
    
    # Click submit
    submit_script = """
(() => {
    const btns = document.querySelectorAll('button, input[type="submit"]');
    for (const b of btns) {
        const t = (b.textContent + ' ' + (b.value || '')).toLowerCase();
        if (t.includes('submit') && b.offsetParent !== null) {
            b.click();
            return JSON.stringify({clicked: b.textContent || b.value});
        }
    }
    return JSON.stringify({err: 'no submit btn'});
})()
"""
    r3 = paw({"action": "evaluate", "script": submit_script})
    print(f"    Submit: {r3}")
    
    # Wait and check result
    time.sleep(3)
    title_check = paw({"action": "evaluate", "script": "document.title"})
    print(f"    Result page: {title_check}")
    
    return True

def main():
    print("="*60)
    print(f"Reddit Karma Builder v1 | {time.strftime('%Y-%m-%d %H:%M')}")
    print("="*60)
    
    # First check current karma
    paw({"action": "navigate", "url": "https://old.reddit.com/user/Antique-Run6580/", "waitUntil": "networkidle"})
    time.sleep(3)
    r = paw({"action": "evaluate", "script": """
(() => {
    const text = document.body.innerText;
    const match = text.match(/(\\d[\\d,]*)\\s*comment karma/i);
    const pmatch = text.match(/(\\d[\\d,]*)\\s*post karma/i);
    return JSON.stringify({commentKarma: match ? match[1] : '0', postKarma: pmatch ? pmatch[1] : '0'});
})()
"""})
    print(f"Current karma: {r}")
    
    # Post each
    for i, post in enumerate(POSTS):
        print(f"\n[{i+1}/{len(POSTS)}] Posting to {post['sub']}: {post['title'][:60]}...")
        
        # Wait between posts (human-like + avoid rate limit)
        wait = random.randint(60, 120)
        print(f"  Waiting {wait}s before posting...")
        time.sleep(wait)
        
        submit_post(post["sub"], post["title"], post.get("body", ""))
    
    # Check karma again
    print("\n\nFinal karma check:")
    paw({"action": "navigate", "url": "https://old.reddit.com/user/Antique-Run6580/", "waitUntil": "networkidle"})
    time.sleep(3)
    r = paw({"action": "evaluate", "script": """
(() => {
    const text = document.body.innerText;
    const match = text.match(/(\\d[\\d,]*)\\s*comment karma/i);
    const pmatch = text.match(/(\\d[\\d,]*)\\s*post karma/i);
    return JSON.stringify({commentKarma: match ? match[1] : '0', postKarma: pmatch ? pmatch[1] : '0'});
})()
"""})
    print(f"After posting: {r}")
    print("\n" + "="*60)
    print("Done! Check results in 30-60 min after upvotes accumulate.")

if __name__ == "__main__":
    main()
