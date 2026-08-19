# ATS Score API (Resume Optimizer)

Turn any Job Description vs Resume into an ATS compatibility score

## Description

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
