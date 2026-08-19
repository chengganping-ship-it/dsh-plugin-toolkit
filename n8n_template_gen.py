#!/usr/bin/env python3
"""
n8n Workflow Template Generator + Lister
Generates commercial-ready n8n workflow templates for monetization.
Outputs JSON files ready to import into n8n.
"""
import json
import os
from datetime import datetime

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "n8n_templates")

def ensure_dir():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

def generate_template(template_id, name, description, category, nodes, connections):
    """Generate a valid n8n workflow JSON."""
    workflow = {
        "name": name,
        "nodes": nodes,
        "connections": connections,
        "settings": {},
        "staticData": None,
        "tags": [
            {"name": category},
            {"name": "automation"}
        ],
        "triggerCount": 1,
        "updatedAt": datetime.now().isoformat(),
        "versionId": "1"
    }
    
    filepath = os.path.join(OUTPUT_DIR, f"{template_id}.json")
    with open(filepath, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    return filepath

def generate_all_templates():
    """Generate a batch of n8n templates."""
    ensure_dir()
    generated = []
    
    # Template 1: Monitor Reddit for Keywords & Alert via Telegram
    nodes1 = [
        {
            "parameters": {"url": "https://www.reddit.com/r/{{ $json.subreddit }}.new.json?limit=50", "options": {}},
            "id": "reddit-trigger",
            "name": "Reddit Feed",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "conditions": {
                    "string": [{"value1": "={{ $json.data.title.toLowerCase() }}", "operation": "contains", "value2": "={{ $json.keyword }}"}]
                }
            },
            "id": "filter",
            "name": "Filter Keywords",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [450, 300]
        },
        {
            "parameters": {
                "chatId": "YOUR_CHAT_ID",
                "text": "=🔔 Reddit Alert: {{ $json.data.title }}\nhttps://reddit.com{{ $json.data.permalink }}"
            },
            "id": "telegram",
            "name": "Send Telegram",
            "type": "n8n-nodes-base.telegram",
            "typeVersion": 1.1,
            "position": [650, 300]
        }
    ]
    connections1 = {
        "Reddit Feed": {"main": [[{"node": "Filter Keywords", "type": "main", "index": 0}]]},
        "Filter Keywords": {"main": [[{"node": "Send Telegram", "type": "main", "index": 0}], []]}
    }
    generated.append(generate_template("reddit-alert-telegram", "Reddit Keyword Monitor → Telegram Alerts", "Monitor any subreddit for specific keywords and receive instant Telegram notifications when matching posts are found. Perfect for tracking brand mentions, job opportunities, or competitor discussions.", "Marketing", nodes1, connections1))
    
    # Template 2: Daily Crypto Funding Rate Monitor
    nodes2 = [
        {
            "parameters": {"url": "https://api.binance.com/fapi/v1/premiumIndex", "options": {}},
            "id": "binance-api",
            "name": "Binance API",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "conditions": {
                    "number": [{"value1": "={{ parseFloat($json.lastFundingRate) }}", "operation": "larger", "value2": 0.05}]
                }
            },
            "id": "high-rate",
            "name": "High Rate?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [450, 300]
        },
        {
            "parameters": {
                "operation": "append",
                "sheetId": "YOUR_SHEET_ID",
                "columns": {"mappingMode": "defineBelow", "values": {"symbol": "={{ $json.symbol }}", "rate": "={{ $json.lastFundingRate }}", "time": "={{ new Date().toISOString() }}"}}
            },
            "id": "sheet",
            "name": "Log to Sheet",
            "type": "n8n-nodes-base.googleSheets",
            "typeVersion": 4.1,
            "position": [650, 300]
        }
    ]
    connections2 = {
        "Binance API": {"main": [[{"node": "High Rate?", "type": "main", "index": 0}]]},
        "High Rate?": {"main": [[{"node": "Log to Sheet", "type": "main", "index": 0}], []]}
    }
    generated.append(generate_template("crypto-funding-monitor", "Crypto Funding Rate Monitor → Google Sheets", "Track Binance perpetual funding rates daily. Automatically log to Google Sheets when rates exceed threshold. Great for delta-neutral strategy research.", "Finance", nodes2, connections2))
    
    # Template 3: LinkedIn Profile Scoring via AI
    nodes3 = [
        {
            "parameters": {"url": "={{ $json.profileUrl }}", "options": {}},
            "id": "fetch-profile",
            "name": "Fetch Profile",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "resource": "chat",
                "operation": "complete",
                "model": "gpt-4o-mini",
                "messages": {"values": [{"role": "system", "content": "You are a career coach. Score this LinkedIn profile 1-100 for hiring success. Return JSON: {score:number, strengths:string[], weaknesses:string[], suggestions:string[]}"}, {"role": "user", "content": "={{ $json.html_content }}"}]},
                "options": {}
            },
            "id": "openai",
            "name": "AI Score",
            "type": "n8n-nodes-base.openAi",
            "typeVersion": 1,
            "position": [450, 300]
        },
        {
            "parameters": {
                "toEmail": "={{ $json.email }}",
                "subject": "=Your LinkedIn Profile Score: {{ $json.score }}/100",
                "text": "=Here's your AI-generated LinkedIn profile score and suggestions:\n\n{{ $json.suggestions }}"
            },
            "id": "email",
            "name": "Send Report",
            "type": "n8n-nodes-base.emailSend",
            "typeVersion": 2,
            "position": [650, 300]
        }
    ]
    connections3 = {
        "Fetch Profile": {"main": [[{"node": "AI Score", "type": "main", "index": 0}]]},
        "AI Score": {"main": [[{"node": "Send Report", "type": "main", "index": 0}]]}
    }
    generated.append(generate_template("linkedin-score-ai", "LinkedIn Profile AI Scorer", "Automatically fetch any LinkedIn profile, score it using AI, and email a detailed improvement report. Useful for career coaches and HR consultants.", "HR", nodes3, connections3))
    
    # Template 4: Cross-border E-commerce Policy Monitor
    nodes4 = [
        {
            "parameters": {
                "url": "https://www.usitc.gov/tata/hts/HTS-Pages.htm",
                "options": {}
            },
            "id": "fetch-policy",
            "name": "USITC Tariff Page",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "conditions": {
                    "string": [{"value1": "={{ $hash.digest($json.html, 'sha256') }}", "operation": "notEqual", "value2": "={{ $env.LAST_HASH }}"}]
                }
            },
            "id": "changed",
            "name": "Content Changed?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [450, 300]
        },
        {
            "parameters": {
                "text": "=⚠️ USITC Tariff page has been updated! Check for new regulations affecting your product categories.",
                "chatId": "YOUR_CHAT_ID"
            },
            "id": "alert",
            "name": "Send Alert",
            "type": "n8n-nodes-base.telegram",
            "typeVersion": 1.1,
            "position": [650, 300]
        }
    ]
    connections4 = {
        "USITC Tariff Page": {"main": [[{"node": "Content Changed?", "type": "main", "index": 0}]]},
        "Content Changed?": {"main": [[{"node": "Send Alert", "type": "main", "index": 0}], []]}
    }
    generated.append(generate_template("us-tariff-monitor", "US Tariff/Policy Change Monitor (Cross-border)", "Monitor the USITC Harmonized Tariff Schedule for changes that affect cross-border e-commerce. Get instant Telegram notifications when tariff rules update. Critical for Amazon FBA and import businesses.", "E-commerce", nodes4, connections4))
    
    # Template 5: Resume ATS Score Calculator
    nodes5 = [
        {
            "parameters": {
                "httpMethod": "POST",
                "path": "ats-check",
                "responseMode": "responseNode",
                "options": {}
            },
            "id": "webhook",
            "name": "Webhook Trigger",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 1.1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "resource": "chat",
                "operation": "complete",
                "model": "gpt-4o-mini",
                "messages": {"values": [{"role": "system", "content": "You are an ATS (Applicant Tracking System) optimization expert. Compare the resume against the job description. Return JSON: {score:number 0-100, matched_keywords:string[], missing_keywords:string[], improvement_suggestions:string[], rewritten_bullets:string[]}"}, {"role": "user", "content": "Resume: {{ $json.resume }}\nJob Description: {{ $json.job_description }}"}]},
                "options": {}
            },
            "id": "ats-ai",
            "name": "ATS Analyzer",
            "type": "n8n-nodes-base.openAi",
            "typeVersion": 1,
            "position": [450, 300]
        },
        {
            "parameters": {
                "respondWith": "json",
                "responseBody": "={{ JSON.stringify({ats_score: $json.score, matched: $json.matched_keywords, missing: $json.missing_keywords, suggestions: $json.improvement_suggestions}) }}"
            },
            "id": "respond",
            "name": "Respond with Score",
            "type": "n8n-nodes-base.respondToWebhook",
            "typeVersion": 1,
            "position": [650, 300]
        }
    ]
    connections5 = {
        "Webhook Trigger": {"main": [[{"node": "ATS Analyzer", "type": "main", "index": 0}]]},
        "ATS Analyzer": {"main": [[{"node": "Respond with Score", "type": "main", "index": 0}]]}
    }
    generated.append(generate_template("ats-score-api", "ATS Resume Score Calculator (API)", "Drop-in ATS scoring API. Accepts resume text + job description POST request, returns ATS score + missing keywords + improvement suggestions. Perfect for career coaching SaaS products.", "HR", nodes5, connections5))
    
    return generated

def generate_listing_metadata():
    """Generate marketplace listing metadata for each template."""
    templates = [
        {
            "id": "reddit-alert-telegram",
            "name": "Reddit Keyword Monitor → Telegram Alerts",
            "description": "Track any subreddit for specific keywords in real-time. Get instant Telegram notifications when matching posts appear. Ideal for brand monitoring, job hunting, and competitive intelligence.",
            "price": 9.99,
            "tags": ["reddit", "telegram", "social media", "monitoring", "alerts"]
        },
        {
            "id": "crypto-funding-monitor",
            "name": "Crypto Funding Rate Monitor → Google Sheets",
            "description": "Automatically track Binance perpetual funding rates. Log extreme values to Google Sheets for delta-neutral arbitrage strategy research. Includes threshold filtering.",
            "price": 14.99,
            "tags": ["crypto", "binance", "finance", "funding rate", "google sheets"]
        },
        {
            "id": "linkedin-score-ai",
            "name": "LinkedIn Profile AI Scorer",
            "description": "Automatically analyze any LinkedIn profile using GPT-4 and email a detailed score report with strengths, weaknesses, and actionable improvement suggestions.",
            "price": 19.99,
            "tags": ["linkedin", "AI", "career", "scoring", "coach"]
        },
        {
            "id": "us-tariff-monitor",
            "name": "US Tariff/Policy Change Monitor (Cross-border)",
            "description": "Monitor USITC tariff schedule for changes. Critical for Amazon FBA sellers and cross-border e-commerce businesses needing instant notifications of policy shifts.",
            "price": 24.99,
            "tags": ["e-commerce", "tariff", "import", "policy", "cross-border"]
        },
        {
            "id": "ats-score-api",
            "name": "ATS Resume Score Calculator (API)",
            "description": "Drop-in REST API for ATS resume scoring. Accepts resume text + job description, returns match score + missing keywords + rewrite suggestions. Perfect for career services.",
            "price": 29.99,
            "tags": ["ATS", "resume", "scoring", "career", "API"]
        }
    ]
    
    filepath = os.path.join(OUTPUT_DIR, "templates_metadata.json")
    with open(filepath, 'w') as f:
        json.dump(templates, f, indent=2)
    
    return templates

if __name__ == "__main__":
    print("="*50)
    print("n8n Template Generator")
    print("="*50)
    
    generated = generate_all_templates()
    print(f"\n生成了 {len(generated)} 个模板:")
    for g in generated:
        print(f"  - {os.path.basename(g)}")
    
    metadata = generate_listing_metadata()
    print(f"\n生成了 listing metadata ({len(metadata)} 模板)")
    
    print(f"\n输出目录: {OUTPUT_DIR}")
    print("\n下一步:")
    print("1. 在每个模板中填入 YOUR_CHAT_ID / YOUR_SHEET_ID / YOUR_API_KEY")
    print("2. 导入 .json 到 n8n 验证工作流")
    print("3. 上架到 n8n marketplace / Gumroad / LemonSqueezy")
    print(f"\n潜在月收入: ${sum(t['price'] for t in metadata):.0f} (按每模板10次销售/月)")
