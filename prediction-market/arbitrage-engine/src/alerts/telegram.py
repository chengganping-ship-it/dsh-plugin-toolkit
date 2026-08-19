"""
Telegram Alerts

Sends real-time notifications for:
- New arbitrage opportunities
- Trade executions
- Risk events (circuit breaker, max drawdown)
- Daily P&L summary
"""
import logging
import aiohttp
import time
from typing import Optional

logger = logging.getLogger(__name__)


class TelegramAlerter:
    """
    Sends alerts via Telegram Bot API.
    
    Setup:
    1. Create bot via @BotFather on Telegram
    2. Get chat ID from @userinfobot
    3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
    """
    
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
        self.enabled = bool(bot_token and chat_id)
    
    async def send(self, message: str, parse_mode: str = "HTML"):
        """Send a message"""
        if not self.enabled:
            return False
        
        url = f"{self.base_url}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": message,
            "parse_mode": parse_mode,
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, timeout=10) as resp:
                    if resp.status == 200:
                        return True
                    logger.error(f"Telegram send failed: {resp.status}")
                    return False
        except Exception as e:
            logger.error(f"Telegram error: {e}")
            return False
    
    async def notify_opportunity(self, signal: dict):
        """Alert new arbitrage opportunity"""
        msg = f"""
<b>ARBITRAGE OPPORTUNITY</b>
Market: <code>{signal.get('market_question', 'N/A')}</code>
Spread: <b>{signal.get('spread', 0):.4f}</b> (Z={signal.get('z_score', 0):.2f})
Direction: {signal.get('direction', 'N/A')}
Expected P&L: <b>${signal.get('expected_profit', 0) * signal.get('size', 0):.2f}</b>
        """
        await self.send(msg)
    
    async def notify_trade(self, trade: dict):
        """Alert trade execution"""
        msg = f"""
<b>TRADE EXECUTED</b>
Exchange: <code>{trade.get('exchange', 'N/A')}</code>
Side: <b>{trade.get('side', 'N/A')} {trade.get('outcome', 'N/A')}</b>
Size: {trade.get('size', 0)}
Price: ${trade.get('price', 0):.4f}
Fee: ${trade.get('fee', 0):.4f}
        """
        await self.send(msg)
    
    async def notify_risk(self, event: str, details: str):
        """Alert risk event"""
        msg = f"""
<b>RISK EVENT</b>
Type: <b>{event}</b>
Details: {details}
Time: {time.strftime('%Y-%m-%d %H:%M:%S')}
        """
        await self.send(msg)
    
    async def notify_daily_summary(self, data: dict):
        """Send daily P&L summary"""
        msg = f"""
<b>DAILY P&L SUMMARY</b>
Date: {data.get('date', 'N/A')}
Trades: <b>{data.get('num_trades', 0)}</b> ({data.get('num_wins', 0)}W/{data.get('num_losses', 0)}L)
Win Rate: <b>{data.get('win_rate', 0):.1%}</b>
Net P&L: <b>${data.get('net_pnl', 0):.2f}</b>
Fees: ${data.get('total_fees', 0):.2f}
        """
        await self.send(msg)
    
    async def notify_circuit_breaker(self, level: str, reasons: list):
        """Alert circuit breaker triggered"""
        msg = f"""
<b>CIRCUIT BREAKER TRIGGERED</b>
Level: <b>{level}</b>
Reasons:
{chr(10).join(f"• {r}" for r in reasons)}
Action: All new positions blocked
        """
        await self.send(msg)
