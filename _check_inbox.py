#!/usr/bin/env python3
"""Check Reddit inbox for DMs and comment replies."""
import json, subprocess, time
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

# Navigate to Reddit inbox (old reddit for easy parsing)
print("Navigating to Reddit inbox...")
paw({"action": "navigate", "url": "https://old.reddit.com/message/inbox/", "waitUntil": "networkidle"})
time.sleep(4)

# Check page + messages
r = paw({"action": "evaluate", "script": """
(() => {
    const result = {
        url: window.location.href,
        title: document.title,
        messageCount: 0,
        messages: [],
        unreadCount: ''
    };
    
    // Get unread indicator
    const unread = document.querySelector('.unread-count');
    if (unread) result.unreadCount = unread.textContent;
    
    // Message list
    const msgs = document.querySelectorAll('.message');
    result.messageCount = msgs.length;
    
    // Extract first 20 messages
    for (let i = 0; i < Math.min(msgs.length, 20); i++) {
        const m = msgs[i];
        const subjectEl = m.querySelector('.message-subject, .subject');
        const senderEl = m.querySelector('.sender-info, .author');
        const bodyEl = m.querySelector('.message-body, .md');
        const timeEl = m.querySelector('time');
        
        result.messages.push({
            subject: subjectEl ? subjectEl.textContent.trim().substring(0, 100) : '',
            from: senderEl ? senderEl.textContent.trim().substring(0, 50) : '',
            body: bodyEl ? bodyEl.textContent.trim().substring(0, 200) : '',
            time: timeEl ? timeEl.textContent.trim() : ''
        });
    }
    
    return JSON.stringify(result);
})()
"""})

print("\nReddit Inbox:")
print(json.dumps(r, indent=2, ensure_ascii=False) if isinstance(r, dict) else str(r))

# Also check comment replies
print("\n\nComment replies check...")
paw({"action": "navigate", "url": "https://old.reddit.com/message/comments/", "waitUntil": "networkidle"})
time.sleep(3)

r2 = paw({"action": "evaluate", "script": """
(() => {
    const result = {count: 0, replies: []};
    const msgs = document.querySelectorAll('.message');
    result.count = msgs.length;
    for (let i = 0; i < Math.min(msgs.length, 10); i++) {
        const m = msgs[i];
        const subjectEl = m.querySelector('.message-subject, .subject');
        const bodyEl = m.querySelector('.message-body, .md');
        result.replies.push({
            subject: subjectEl ? subjectEl.textContent.trim().substring(0, 100) : '',
            body: bodyEl ? bodyEl.textContent.trim().substring(0, 150) : ''
        });
    }
    return JSON.stringify(result);
})()
"""})

print("\nComment Replies:")
print(json.dumps(r2, indent=2, ensure_ascii=False) if isinstance(r2, dict) else str(r2))
