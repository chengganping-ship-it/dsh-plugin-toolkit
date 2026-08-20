#!/usr/bin/env python3
"""Create remaining 4 products on Gumroad via CLI."""
import json, subprocess, time, sys
sys.stdout.reconfigure(line_buffering=True)

PAW_ps1 = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"

def paw(payload_dict):
    payload = json.dumps(payload_dict).replace("'", "''")
    ps_cmd = f"& '{PAW_ps1}' browser-action '{payload}'"
    cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
        if r.returncode != 0:
            return {"err": f"rc={r.returncode}", "stderr": r.stderr[:300]}
        d = json.loads(r.stdout.strip())
        if d.get("success") and "result" in d.get("data", {}):
            r2 = d["data"]["result"]
            if isinstance(r2, str):
                try:
                    return json.loads(r2)
                except:
                    return r2
            return r2
        return d
    except Exception as e:
        return {"err": str(e)}

# Products to create
PRODUCTS = [
    {
        "name": "Reddit Keyword Monitor → Telegram Alerts",
        "price": 39.99,
        "description": "Track any subreddit for specific keywords in real-time. Get instant Telegram notifications when matching posts appear.\n\nWhat you get:\n- n8n workflow JSON file\n- Subreddit list + keyword configuration\n- Telegram bot setup instructions",
        "zip": "reddit-alert-telegram.zip"
    },
    {
        "name": "US Tariff & Trade Policy Monitor",
        "price": 29.99,
        "description": "Monitor USITC tariff schedule for changes. Critical for Amazon FBA sellers and cross-border e-commerce businesses.\n\nWhat you get:\n- n8n workflow JSON file\n- Source URL configuration\n- AI prompt templates for impact analysis",
        "zip": "us-tariff-monitor.zip"
    },
    {
        "name": "LinkedIn Profile AI Scorer",
        "price": 29.99,
        "description": "Automatically analyze any LinkedIn profile using GPT-4 and email a detailed score report with strengths, weaknesses, and actionable improvement suggestions.\n\nWhat you get:\n- n8n workflow JSON file\n- OpenAI GPT-4 prompt templates\n- Email template for reports",
        "zip": "linkedin-score-ai.zip"
    },
    {
        "name": "Crypto Funding Rate Monitor → Google Sheets",
        "price": 19.99,
        "description": "Track crypto funding rates across exchanges for arbitrage opportunities.\n\nWhat you get:\n- n8n workflow JSON file\n- Exchange API configuration\n- Google Sheets template + Telegram bot setup",
        "zip": "crypto-funding-monitor.zip"
    }
]

ZIP_DIR = r"C:\Users\123\.meituan-catpaw\14880026\desk_default_workspace\gumroad_products"

print("Creating products on Gumroad...")
print("Note: This uses the browser CLI to navigate and create products.")
print("=" * 60)

for i, product in enumerate(PRODUCTS):
    print(f"\n[{i+1}/4] {product['name']} - ${product['price']}")
    print(f"  ZIP: {product['zip']}")
    print(f"  This product will need to be created manually or via browser automation.")

print("\n" + "=" * 60)
print("Products to create:")
for p in PRODUCTS:
    print(f"  - {p['name']}: ${p['price']} ({p['zip']})")

print("\nNext steps:")
print("1. Navigate to https://gumroad.com/products/new")
print("2. For each product, fill name + price, upload zip, publish")
print("3. Share product URLs on social media")
