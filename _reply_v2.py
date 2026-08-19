#!/usr/bin/env python3
"""Reply to comments on our posts to build karma."""
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

def reply_to_comment(post_url, reply_text):
    """Navigate to post, find first human comment, reply to it."""
    print(f"  Loading {post_url}...")
    paw({"action": "navigate", "url": post_url, "waitUntil": "networkidle"})
    time.sleep(3)
    
    # Find and click reply on first non-AutoMod comment
    click_script = """
(() => {
    const comments = document.querySelectorAll('.comment');
    for (const c of comments) {
        const authorEl = c.querySelector('.author');
        if (!authorEl) continue;
        const author = authorEl.textContent.trim();
        if (author === 'AutoModerator' || author === 'Antique-Run6580') continue;
        // Find reply button
        const replyBtn = c.querySelector('.reply-button a, a.reply-btn');
        if (replyBtn) {
            replyBtn.click();
            return JSON.stringify({clicked: true, author: author});
        }
        // Alternative: any "reply" link
        const links = c.querySelectorAll('a');
        for (const l of links) {
            if (l.textContent.trim().toLowerCase() === 'reply') {
                l.click();
                return JSON.stringify({clicked: true, author: author, via: 'link'});
            }
        }
    }
    return JSON.stringify({clicked: false, totalComments: comments.length});
})()
"""
    r = paw({"action": "evaluate", "script": click_script})
    print(f"    Click: {r}")
    
    if isinstance(r, dict) and r.get("clicked"):
        time.sleep(2)
        # Type reply
        text_json = json.dumps(reply_text)
        type_script = """
(() => {
    const textareas = document.querySelectorAll('textarea');
    let box = null;
    for (const ta of textareas) {
        if (ta.offsetParent !== null && ta.getBoundingClientRect().width > 0) {
            box = ta;
            break;
        }
    }
    if (!box) return JSON.stringify({err: 'no box', count: textareas.length});
    box.focus();
""" + "    box.value = " + text_json + ";\n" + """
    box.dispatchEvent(new Event('input', {bubbles: true}));
    box.dispatchEvent(new Event('change', {bubbles: true}));
    return JSON.stringify({ok: true, val: box.value.substring(0, 40)});
})()
"""
        r2 = paw({"action": "evaluate", "script": type_script})
        print(f"    Type: {r2}")
        
        if isinstance(r2, dict) and r2.get("ok"):
            time.sleep(1)
            # Click save
            save_script = """
(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
        if (b.textContent.trim().toLowerCase() === 'save' && b.offsetParent !== null) {
            b.click();
            return JSON.stringify({clicked: 'save'});
        }
    }
    return JSON.stringify({err: 'no save btn'});
})()
"""
            r3 = paw({"action": "evaluate", "script": save_script})
            print(f"    Save: {r3}")
            time.sleep(2)
            return True
    return False

def main():
    print("="*60)
    print(f"Reply v2 | {time.strftime('%Y-%m-%d %H:%M')}")
    print("="*60)
    
    posts = [
        {
            "url": "https://old.reddit.com/r/AskReddit/comments/1vs8n98/recruiters_of_reddit_whats_the_1_reason_you/",
            "reply": "Great insights! The formatting issue is real - I've seen recruiters say they reject resumes just because they can't scan them in 6 seconds. The key is making the most important info immediately visible. Thanks for sharing!"
        },
        {
            "url": "https://old.reddit.com/r/NoStupidQuestions/comments/1vs8j49/is_it_normal_to_feel_like_your_resume_is_lying/",
            "reply": "This is such a common concern. The distinction I always make: you're not fabricating, you're reframing. Same experience, different emphasis. But I totally get the weird feeling - it's like code-switching for your career."
        },
        {
            "url": "https://old.reddit.com/r/AskReddit/comments/1vs8hzh/career_changers_who_switched_after_30_whats_one/",
            "reply": "Love hearing these stories. The psychological barrier is often the hardest part - once you actually make the jump, most people wonder why they didn't do it sooner. What field did you switch into?"
        }
    ]
    
    for i, post in enumerate(posts):
        print(f"\n[{i+1}/{len(posts)}] {post['url'][-40:]}")
        wait = random.randint(30, 60)
        print(f"  Waiting {wait}s...")
        time.sleep(wait)
        reply_to_comment(post["url"], post["reply"])
    
    # Check karma
    print("\n\nKarma check:")
    paw({"action": "navigate", "url": "https://old.reddit.com/user/Antique-Run6580/", "waitUntil": "networkidle"})
    time.sleep(3)
    r = paw({"action": "evaluate", "script": """
(() => {
    const text = document.body.innerText;
    const cm = text.match(/(\\d[\\d,]*)\\s*comment karma/i);
    const pm = text.match(/(\\d[\\d,]*)\\s*post karma/i);
    return JSON.stringify({commentKarma: cm ? cm[1] : '0', postKarma: pm ? pm[1] : '0'});
})()
"""})
    print(f"Karma: {r}")
    print("\nDone!")

if __name__ == "__main__":
    main()
