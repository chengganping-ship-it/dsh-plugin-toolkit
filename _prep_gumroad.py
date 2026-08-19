#!/usr/bin/env python3
"""Prepare zip files for each n8n template."""
import json, os, sys, zipfile, textwrap
sys.stdout.reconfigure(line_buffering=True)

TEMPLATE_DIR = r"C:\Users\123\.meituan-catpaw\14880026\desk_default_workspace\n8n_templates"
OUTPUT_DIR = r"C:\Users\123\.meituan-catpaw\14880026\desk_default_workspace\gumroad_products"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Product information from gumroad_listing_prep.md
PRODUCTS = {
    "ats-score-api": {
        "name": "ATS Score API (Resume Optimizer)",
        "price": 49,
        "tagline": "Turn any Job Description vs Resume into an ATS compatibility score",
        "description": textwrap.dedent("""\
            Build your own ATS scoring API:
            - Receives resume (text) + JD (text) via webhook
            - Extracts keywords, skills, years of experience via OpenAI
            - Calculates match score 0-100
            - Returns JSON with missing keywords, strengths, improvement suggestions
            - Can be integrated into any career coaching app or job board

            Perfect for: EdTech startups, career coaches, HR tech founders, job board operators

            What you get:
            - n8n workflow JSON file (import directly into your n8n instance)
            - Setup guide with API endpoint configuration
            - OpenAI prompt templates included
        """)
    },
    "reddit-alert-telegram": {
        "name": "Reddit Keyword Monitor → Telegram Alerts",
        "price": 39,
        "tagline": "Automate Reddit lead generation by scanning subreddits for buyer intent signals",
        "description": textwrap.dedent("""\
            Turn Reddit into a lead generation engine:
            - Scans 20+ subreddits every hour for buying signals (resume help, tool requests, recommendations)
            - Classifies intent using keyword matching + OpenAI
            - Sends instant Telegram alerts for high-intent leads
            - Logs everything to Google Sheets for tracking

            Perfect for: agencies, freelancers, SaaS founders, lead gen services

            What you get:
            - n8n workflow JSON file (import directly into your n8n instance)
            - Subreddit list + keyword configuration
            - Telegram bot setup instructions
        """)
    },
    "us-tariff-monitor": {
        "name": "US Tariff & Trade Policy Monitor",
        "price": 29,
        "tagline": "Real-time US tariff updates with AI impact analysis for importers/exporters",
        "description": textwrap.dedent("""\
            Monitor US trade policy changes and understand their impact:
            - Scrapes Federal Register, White House, Commerce Dept for tariff announcements
            - AI analyzes new policies and reports affected HS codes
            - Summarizes impact for your products
            - Sends email digest with action items

            Perfect for: import/export businesses, supply chain managers, trade compliance officers, e-commerce sellers

            What you get:
            - n8n workflow JSON file (import directly into your n8n instance)
            - Source URL configuration
            - AI prompt templates for impact analysis
        """)
    },
    "linkedin-score-ai": {
        "name": "LinkedIn Profile AI Scorer",
        "price": 29,
        "tagline": "AI-powered LinkedIn profile analysis with actionable improvement suggestions",
        "description": textwrap.dedent("""\
            Automatically analyze LinkedIn profiles and get score + suggestions:
            - Scrape LinkedIn profile data via API
            - Send to OpenAI GPT-4 for professional analysis
            - Returns headline optimization, summary rewrite suggestions, experience bullet improvements
            - Results delivered via email formatted as a report

            Perfect for: career coaches, recruiters, job seekers, LinkedIn consultants

            What you get:
            - n8n workflow JSON file (import directly into your n8n instance)
            - OpenAI GPT-4 prompt templates
            - Email template for reports
        """)
    },
    "crypto-funding-monitor": {
        "name": "Crypto Funding Rate Monitor → Google Sheets",
        "price": 19,
        "tagline": "Track crypto funding rates across exchanges for arbitrage opportunities",
        "description": textwrap.dedent("""\
            Built for crypto traders who want to track funding rates without manual monitoring:
            - Fetches funding rates every 15 minutes from Binance, Bybit, OKX APIs
            - Calculates annualized rates
            - Sends Telegram alerts when rates exceed your threshold
            - Logs data to Google Sheets for historical analysis

            Perfect for: crypto traders, funding rate arbitrage seekers, DeFi analysts

            What you get:
            - n8n workflow JSON file (import directly into your n8n instance)
            - Exchange API configuration
            - Google Sheets template + Telegram bot setup
        """)
    }
}

created = []
for product_id, info in PRODUCTS.items():
    json_path = os.path.join(TEMPLATE_DIR, f"{product_id}.json")
    if not os.path.exists(json_path):
        print(f"SKIP: {json_path} not found")
        continue
    
    # Create output directory for this product
    product_dir = os.path.join(OUTPUT_DIR, product_id)
    os.makedirs(product_dir, exist_ok=True)
    
    # Copy workflow JSON
    import shutil
    shutil.copy2(json_path, os.path.join(product_dir, "workflow.json"))
    
    # Write README.md
    readme = f"""# {info['name']}

{info['tagline']}

## Description

{info['description']}

## Installation

1. Download this zip file
2. Open your n8n instance
3. Go to Workflows → Import from File
4. Select the workflow.json file
5. Configure your credentials (OpenAI, Telegram, etc.)
6. Activate the workflow

## Requirements

- n8n instance (self-hosted or cloud)
- OpenAI API key (for AI-powered features)
- Relevant API keys for integrations (Telegram Bot, Google Sheets, etc.)

## Support

For questions or customization requests, contact us.
"""
    with open(os.path.join(product_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme)
    
    # Create zip file
    zip_path = os.path.join(OUTPUT_DIR, f"{product_id}.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(os.path.join(product_dir, "workflow.json"), "workflow.json")
        zf.write(os.path.join(product_dir, "README.md"), "README.md")
    
    size = os.path.getsize(zip_path)
    print(f"OK: {product_id}.zip ({size} bytes) - ${info['price']}")
    created.append({
        "id": product_id,
        "zip": zip_path,
        "price": info["price"],
        "name": info["name"]
    })

print(f"\nTotal: {len(created)} products created in {OUTPUT_DIR}")
