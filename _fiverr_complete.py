#!/usr/bin/env python3
"""
Complete Fiverr Gig creation form using browser automation.
Handles the complex React combo-box for category selection.
"""
import json
import subprocess
import sys
import time

BROWSER_CMD = "paw"

def browser_action(payload):
    """Execute browser action and return result."""
    if isinstance(payload, dict):
        payload = json.dumps(payload)
    cmd = f"{BROWSER_CMD} browser-action '{payload}'"
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            return {"error": result.stderr[:200]}
        return json.loads(result.stdout.strip())
    except Exception as e:
        return {"error": str(e)}

def browser_eval(script):
    """Evaluate JavaScript."""
    return browser_action({"action": "evaluate", "script": script})

def select_category_and_fill():
    """Complete the entire gig creation form."""
    
    # Step 1: Fill title
    print("Step 1: Filling title...")
    browser_action({"action": "fill", "selector": "@e90", "value": "I will professionally optimize your resume for ATS and recruiters"})
    time.sleep(0.5)
    
    # Step 2: Select category using JS to trigger React state change
    print("Step 2: Selecting category...")
    # Click the combobox to open it
    browser_action({"action": "click", "selector": "@e97"})
    time.sleep(1)
    
    # Use evaluate to find and click Writing & Translation
    result = browser_eval("""
        // Find all dropdown options
        const options = document.querySelectorAll('[class*="option"], [class*="item"], [id*="option"]');
        const texts = Array.from(options).map(o => o.textContent.trim());
        JSON.stringify({count: options.length, texts: texts.slice(0, 10)});
    """)
    print(f"  Dropdown options: {result}")
    
    # Try clicking Writing & Translation by text
    browser_action({"action": "getbytext", "text": "Writing & Translation", "subaction": "click"})
    time.sleep(1)
    
    # Step 3: Fill tags
    print("Step 3: Filling tags...")
    browser_action({"action": "fill", "selector": "@e95", "value": "resume optimization"})
    time.sleep(0.3)
    browser_action({"action": "fill", "selector": "@e96", "value": "ATS keywords"})
    time.sleep(0.3)
    
    # Step 4: Click Save & Continue
    print("Step 4: Clicking Save & Continue...")
    browser_action({"action": "click", "selector": "@e11"})
    time.sleep(2)
    
    # Check URL
    url = browser_eval("window.location.href")
    print(f"  Current URL: {url}")
    
    return url

if __name__ == "__main__":
    select_category_and_fill()
