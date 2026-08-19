"""
Daily Report Generator

Generates end-of-day performance report including:
- P&L summary (gross, net, fees)
- Trade statistics (count, win rate, profit factor)
- Rejection reason distribution
- Fill vs slippage accuracy
- Suspicious market alerts
"""
import logging
import time
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


class DailyReport:
    """Generates and sends daily trading report"""
    
    def __init__(self, trade_logger, market_matcher=None, alerter=None):
        self.trade_logger = trade_logger
        self.matcher = market_matcher
        self.alerter = alerter
    
    async def generate_and_send(self, paper_broker=None, order_manager=None):
        """Generate daily report and send via Telegram"""
        
        report = self._generate_report(paper_broker, order_manager)
        
        # Send via telegram if available
        if self.alerter:
            await self._send_report(report)
        
        return report
    
    def _generate_report(self, paper_broker=None, order_manager=None) -> dict:
        """Collect all metrics into report dict"""
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        # P&L from trade logger
        daily_pnl = self.trade_logger.calculate_daily_pnl(today) if self.trade_logger else {}
        perf = self.trade_logger.get_performance_summary(days=1) if self.trade_logger else {}
        
        # Paper broker account
        account_summary = paper_broker.get_account_summary() if paper_broker else {}
        
        # Order manager stats
        order_stats = order_manager.get_stats() if order_manager else {}
        
        # Market matcher suspicious
        suspicious = self.matcher.get_suspicious_mappings() if self.matcher else []
        
        report = {
            "date": today,
            "pnl": {
                "realized": daily_pnl.get("net_pnl", 0),
                "gross": daily_pnl.get("gross_pnl", 0),
                "total_fees": daily_pnl.get("total_fees", 0),
                "unrealized": account_summary.get("unrealized_pnl", "N/A"),
            },
            "trades": {
                "total": daily_pnl.get("num_trades", 0),
                "wins": daily_pnl.get("num_wins", 0),
                "losses": daily_pnl.get("num_losses", 0),
                "win_rate": daily_pnl.get("win_rate", 0),
                "avg_win": daily_pnl.get("avg_win", 0),
                "avg_loss": daily_pnl.get("avg_loss", 0),
            },
            "performance": {
                "profit_factor": perf.get("profit_factor", 0),
                "max_drawdown_usd": perf.get("max_drawdown", 0),
                "sharpe": perf.get("sharpe", 0),
            },
            "account": account_summary,
            "orders": order_stats,
            "risks": {
                "suspicious_markets": len(suspicious),
                "suspicious_ids": suspicious[:5],
            },
        }
        
        return report
    
    def format_text(self, report: dict) -> str:
        """Format report as readable text"""
        
        trades = report["trades"]
        pnl = report["pnl"]
        perf = report["performance"]
        
        lines = [
            f"{'='*40}",
            f"DAILY TRADING REPORT - {report['date']}",
            f"{'='*40}",
            f"",
            f"P&L:",
            f"  Realized:   ${pnl['realized']:.2f}",
            f"  Gross:      ${pnl['gross']:.2f}",
            f"  Fees:      -${pnl['total_fees']:.2f}",
            f"  Unrealized: ${pnl['unrealized']}" if isinstance(pnl['unrealized'], str) else f"  Unrealized: ${pnl['unrealized']:.2f}",
            f"",
            f"Trades:",
            f"  Total:    {trades['total']}",
            f"  Won:      {trades['wins']}",
            f"  Lost:     {trades['losses']}",
            f"  Win Rate: {trades['win_rate']:.1%}" if trades['win_rate'] else "  Win Rate: N/A",
            f"  Avg Win:  ${trades['avg_win']:.2f}",
            f"  Avg Loss: ${trades['avg_loss']:.2f}",
            f"",
            f"Performance:",
            f"  Profit Factor: {perf['profit_factor']:.2f}",
            f"  Max Drawdown:  ${perf['max_drawdown_usd']:.2f}",
            f"  Sharpe (ann):  {perf['sharpe']:.2f}",
            f"",
        ]
        
        if report["risks"]["suspicious_markets"] > 0:
            lines.append(f"RISKS:")
            lines.append(f"  Suspicious markets: {report['risks']['suspicious_markets']}")
            lines.append(f"  IDs: {', '.join(report['risks']['suspicious_ids'])}")
        
        lines.append(f"{'='*40}")
        
        return "\n".join(lines)
    
    async def _send_report(self, report: dict):
        """Send report via telegram"""
        text = self.format_text(report)
        
        if self.alerter and hasattr(self.alerter, 'send'):
            await self.alerter.send(text)
