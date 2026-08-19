#!/usr/bin/env python3
"""
Engage with people who replied to our posts!
Reply to comments on our own posts to build karma.
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

def find_and_click_reply(post_url):
    """Go to our own post and click 'reply' on the first comment."""
    paw({"action": "navigate", "url": post_url, "waitUntil": "networkidle"})
    time.sleep(3)
    
    # Find a comment that's NOT by AutoModerator, click reply
    script = """
(() => {
    const comments = document.querySelectorAll('.message');
    // On old reddit comments page, structure is different
    // Try new approach: find .comment elements
    const allComments = document.querySelectorAll('.comment');
    for (const c of allComments) {
        const authorEl = c.querySelector('.author, .tagline a');
        if (!authorEl) continue;
        const author = authorEl.textContent;
        if (author === 'AutoModerator' || author === 'Antique-Run6580') continue;
        // Find reply link/button
        const replyLink = c.querySelector('a.reply-button, .reply-button a, a[href*="reply"], .flatlist a[href="#"]');
        if (replyLink) {
            replyLink.click();
            return JSON.stringify({clicked: true, author, nearby: replyLink.closest('.entry')?.textContent?.substring(0, 100) || ''});
        }
        // Alternative: look for any clickable reply-like text
        const links = c.querySelectorAll('a');
        for (const l of links) {
            if (l.textContent.toLowerCase() === 'reply') {
                l.click();
                return JSON.stringify({clicked: true, author, text: l.textContent});
            }
        }
    }
    return JSON.stringify({clicked: false, commentCount: allComments.length});
})()
"""
    return paw({"action": "evaluate", "script": script})

def reply_in_post(post_url, reply_text):
    """Reply to the first human comment on our own post."""
    print(f"\nReplying on {post_url}...")
    r = find_and_click_reply(post_url)
    print(f"  Clicked reply: {r}")
    
    if isinstance(r, dict) and r.get("clicked"):
        time.sleep(2)
        text_json = json.dumps(reply_text)
        script = r"""
(() => {
    const textareas = document.querySelectorAll('textarea');
    let replyBox = null;
    for (const ta of textareas) {
        const rect = ta.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && ta.offsetParent !== null) {
            replyBox = ta;
        }
    }
    if (!replyBox) return JSON.stringify({err: 'no visible reply box', count: textareas.length});
    replyBox.focus();
""" + '    replyBox.value = ' + text_json + ';\n' + r"""
    replyBox.dispatchEvent(new Event('input', {bubbles: true}));
    replyBox.dispatchEvent(new Event('change', {bubbles: true}));
    return JSON.stringify({ok: true, val: replyBox.value.substring(0, 50)});
})()
"""
        r2 = paw({"action": "evaluate", "script": script})
        print(f"  Text: {r2}")
        
        if isinstance(r2, dict) and r2.get("ok"):
            time.sleep(1)
            # Click save/submit
            submit_script = """
(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
        if (b.textContent.toLowerCase() === 'save' || b.textContent.toLowerCase() === 'reply') {
            if (b.offsetParent !== null) {
                b.click();
                return JSON.stringify({clicked: b.textContent});
            }
        }
    }
    // Try input submit
    const inputs = document.querySelectorAll('input[type="submit"]');
    for (const i of inputs) {
        if (i.offsetParent !== null) {
            i.click();
            return JSON.stringify({clicked: i.value});
        }
    }
    return JSON.stringify({err: 'no btn'});
})()
"""
            r3 = paw({"action": "evaluate", "script": submit_script})
            print(f"  Submit: {r3}")
            time.sleep(2)
            return True
    return False

def main():
    print("="*60)
    print(f"Reply & Engage Bot | {time.strftime('%Y-%m-%d %H:%M')}")
    print("="*60)
    
    # Our posts that received engagement
    posts = [
        {
            "url": "https://old.reddit.com/r/AskReddit/comments/1vrt0j5/career_changers_who_switched_after_30_whats_one/",
            "reply": "I totally get this. What field did you switch from/to? I work with people making similar jumps and I've noticed the psychological hurdle is often bigger than the practical one - most people underestimate how transferable existing experience really is."
        },
        {
            "url": "https://old.reddit.com/r/NoStupidQuestions/comments/1vrte9h/is_it_normal_to_feel_like_your_resume_is_lying/",
            "reply": "This is a really common concern. The key distinction: you're not fabricating, you're reframing. A strong resume emphasizes different aspects of the SAME experience for different audiences. But you're right - it can feel weird at first!"
        },
        {
            "url": "https://old.reddit.com/r/CasualConversation/comments/1vrtgp2/linkedin_has_become_a_weird_mix_of_job_board/",
            "reply": "Haha yeah the LinkedIn humblebrag is its own genre at this point. I mostly use it as a job board now - connect with 2-3 recruiters, apply, ignore everything else. The posts can be fun though, especially the 'journey' stories."
        }
    ]
    
    for i, post in enumerate(posts):
        print(f"\n[{i+1}/{len(posts)}] Post: {post['url'][-40:]}")
        print(f"  Reply: {post['reply'][:60]}...")
        
        wait = random.randint(30, 60)
        print(f"  Waiting {wait}s...")
        time.sleep(wait)
        
        reply_in_post(post["url"], post["reply"])
    
    # Check karma
    print("\n\nChecking karma after replies...")
    paw({"action": "navigate", "url": "https://old.reddit.com/user/Antique-Run6580/", "waitUntil": "networkidle"})
    time.sleep(3)
    r = paw({"action": "evaluate", "script": """
(() => {
    const text = document.body.innerText;
    const match = text.match(/(\d[\d,]*)\s*comment karma/i);
    const pmatch = text.match(/(\d[\d,]*)\s*post karma/i);
    return JSON.stringify({commentKarma: match ? match[1] : '0', postKarma: pmatch ? pmatch[1] : '0'});
})()
"""})
    print(f"Karma: {r}")
    print("\nDone!")

if __name__ == "__main__":
    main()
