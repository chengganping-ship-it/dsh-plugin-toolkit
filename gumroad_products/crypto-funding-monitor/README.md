# Crypto Funding Rate Monitor → Google Sheets

Track crypto funding rates across exchanges for arbitrage opportunities

## Description

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
