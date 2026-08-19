"""
Prediction Market AI Arbitrage Engine - Production Entry Point

Modes:
- paper: Pure simulation, no real orders
- shadow: Real market data, simulated orders
- live: Real trading (requires funded accounts)
"""
import asyncio
import logging
import os
import sys
from datetime import datetime
from typing import Optional

from config import Config
from exchanges.polymarket import PolymarketClient
from exchanges.kalshi import KalshiClient
from strategies.cross_market_arb import CrossMarketArbitrageEngine
from strategies.news_alpha import NewsAlphaEngine
from risk.kelly import KellyCriterion
from risk.circuit_breaker import CircuitBreaker
from monitoring.dashboard import DashboardServer
from execution.order_manager import OrderManager, OrderState
from execution.paper_broker import PaperBroker, FillModel
from execution.live_broker import LiveBroker
from execution.cost_model import CostModel
from execution.slippage_model import SlippageModel
from data.market_matcher import MarketMatcher
from storage.trade_logger import TradeLogger, TradeRecord
from alerts.telegram import TelegramAlerter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler('logs/engine.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ArbitrageEngine:
    """
    Production-grade prediction market arbitrage engine.
    
    Features:
    - Multi-mode operation (paper/shadow/live)
    - Real cost modeling (fees, gas, slippage)
    - Full order state machine
    - Slippage estimation
    - Cross-market matching
    - Circuit breaker risk management
    - Telegram alerts
    - Trade logging with SQLite
    """
    
    def __init__(self):
        self.config = Config()
        self.running = False
        
        # Mode
        self.mode = os.getenv("TRADING_MODE", "paper")  # paper, shadow, live
        logger.info(f"Starting in {self.mode.upper()} mode")
        
        # Exchange clients
        self.poly_client = None
        self.kalshi_client = None
        
        # Strategies
        self.cross_market = None
        self.news_alpha = None
        self.market_matcher = MarketMatcher()
        
        # Execution layer
        self.order_manager = OrderManager(max_open_orders=20, order_timeout=10)
        self.paper_broker = None
        self.live_broker = None
        
        # Analysis
        self.cost_model = CostModel(safety_margin=0.005, funding_annual_rate=0.05)
        self.slippage_model = SlippageModel()
        
        # Risk
        self.kelly = None
        self.circuit_breaker = None
        
        # Storage & alerts
        self.trade_logger = None
        self.alerter = None
        
        # Metrics
        self.total_trades = 0
        self.total_pnl = 0.0
        self.win_count = 0
        self.loss_count = 0
        self.start_time = None
    
    async def initialize(self):
        """Initialize all components based on mode"""
        logger.info("="*60)
        logger.info("Initializing Prediction Market Arbitrage Engine")
        logger.info(f"Mode: {self.mode.upper()}")
        logger.info("="*60)
        
        # Initialize exchange clients
        if self.config.polymarket_private_key:
            self.poly_client = PolymarketClient(
                private_key=self.config.polymarket_private_key,
                chain_id=self.config.polymarket_chain_id
            )
            await self.poly_client.initialize()
            logger.info("Polymarket client initialized")
        
        if self.config.kalshi_api_key:
            self.kalshi_client = KalshiClient(
                api_key=self.config.kalshi_api_key,
                private_key=self.config.kalshi_private_key,
                email=self.config.kalshi_email
            )
            logger.info("Kalshi client initialized")
        
        # Strategies
        if self.poly_client and self.kalshi_client:
            self.cross_market = CrossMarketArbitrageEngine(
                poly_client=self.poly_client,
                kalshi_client=self.kalshi_client,
                lookback_hours=24
            )
        
        if self.config.llm_api_key:
            self.news_alpha = NewsAlphaEngine(
                llm_api_key=self.config.llm_api_key,
                llm_provider=self.config.llm_provider,
                model_name=self.config.model_name,
                poly_client=self.poly_client,
                kalshi_client=self.kalshi_client
            )
        
        # Execution layer
        if self.mode == "paper":
            self.paper_broker = PaperBroker(
                initial_balance=self.config.initial_capital,
                fill_model=FillModel.REALISTIC,
                latency_ms=100
            )
            if self.poly_client:
                self.paper_broker.connect_exchange("polymarket", self.poly_client)
            if self.kalshi_client:
                self.paper_broker.connect_exchange("kalshi", self.kalshi_client)
            logger.info(f"Paper broker initialized with ${self.config.initial_capital}")
        
        elif self.mode == "shadow":
            self.paper_broker = PaperBroker(
                initial_balance=self.config.initial_capital,
                fill_model=FillModel.REALISTIC,
                latency_ms=50
            )
            if self.poly_client:
                self.paper_broker.connect_exchange("polymarket", self.poly_client)
            if self.kalshi_client:
                self.paper_broker.connect_exchange("kalshi", self.kalshi_client)
            logger.info("Shadow mode: real data, simulated orders")
        
        elif self.mode == "live":
            self.live_broker = LiveBroker(
                poly_client=self.poly_client,
                kalshi_client=self.kalshi_client,
                order_manager=self.order_manager,
                cost_model=self.cost_model
            )
            logger.info("LIVE mode: real orders will be placed")
        
        # Risk management
        self.kelly = KellyCriterion(
            capital=self.config.initial_capital,
            fraction=self.config.kelly_fraction
        )
        self.circuit_breaker = CircuitBreaker(
            max_daily_loss_pct=self.config.max_daily_loss / self.config.initial_capital,
            max_drawdown_pct=self.config.max_drawdown,
            consecutive_losses=5
        )
        
        # Storage & alerts
        self.trade_logger = TradeLogger()
        
        telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        telegram_chat = os.getenv("TELEGRAM_CHAT_ID", "")
        if telegram_token and telegram_chat:
            self.alerter = TelegramAlerter(telegram_token, telegram_chat)
        
        self.start_time = asyncio.get_event_loop().time()
        logger.info("All components initialized successfully")
    
    async def run(self):
        """Main run loop"""
        self.running = True
        logger.info("Starting main loop...")
        
        while self.running:
            try:
                await self._tick()
                await asyncio.sleep(self.config.tick_interval_seconds)
            except KeyboardInterrupt:
                logger.info("Shutdown signal received")
                self.running = False
            except Exception as e:
                logger.error(f"Error in main loop: {e}", exc_info=True)
                await asyncio.sleep(30)
        
        await self.shutdown()
    
    async def _tick(self):
        """Single iteration of the main loop"""
        # 1. Check circuit breaker
        capital = await self._get_total_capital()
        pnl_delta = 0  # Would come from actual trade
        cb_status = self.circuit_breaker.check(capital, pnl_delta)
        
        if cb_status["level"] in ["HARD", "EMERGENCY"]:
            logger.warning(f"Circuit breaker: {cb_status['level']}")
            if self.alerter:
                await self.alerter.notify_circuit_breaker(cb_status["level"], cb_status["reasons"])
            return
        
        # 2. Check order timeouts
        timed_out = self.order_manager.check_timeouts()
        if timed_out:
            logger.warning(f"Orders timed out: {timed_out}")
        
        # 3. Paper broker fill check
        if self.paper_broker:
            self.paper_broker.check_fills()
            self.paper_broker.update_positions()
        
        # 4. Scan cross-market opportunities (only in paper/shadow or if live with capital)
        if self.cross_market and self.mode != "live":
            opportunities = await self.cross_market.scan_opportunities()
            for opp in opportunities:
                await self._process_opportunity(opp)
        
        # 5. Log metrics periodically
        if int(asyncio.get_event_loop().time()) % 300 == 0:  # Every 5 min
            await self._log_status()
    
    async def _process_opportunity(self, opp: dict):
        """Process an arbitrage opportunity with full cost analysis"""
        # Calculate real costs
        gross_edge = abs(opp['spread'])
        
        costs = self.cost_model.calculate_cross_market_costs(
            poly_price=opp['poly_price'],
            kalshi_price_cents=int(opp['kalshi_price'] * 100),
            size_usd=self.config.max_position_size * 0.5,
            hold_days=7,  # Estimated
        )
        costs.gross_edge = gross_edge
        
        net_edge = costs.net_edge
        
        # Decision gate
        if not self.cost_model.should_execute(net_edge, min_edge=0.015):
            logger.debug(f"Opportunity rejected: net_edge={net_edge:.4f} < min")
            return
        
        # Kelly sizing
        odds = max(opp['poly_price'], 0.5) / max(opp['kalshi_price'], 0.5)
        size = self.kelly.position_size(
            win_prob=opp['confidence'],
            odds=odds,
            max_size=self.config.max_position_size
        )
        
        if size < 10:  # Minimum $10
            return
        
        logger.info(f"EXECUTE: {opp['market_question'][:50]}... | "
                   f"Net edge: {net_edge:.4f} | Size: ${size:.2f}")
        
        # Execute based on mode
        if self.mode == "paper" and self.paper_broker:
            # Paper trade
            self.paper_broker.place_order(
                exchange="polymarket",
                market_id=opp['token_id'],
                side="buy" if "long_poly" in opp['direction'] else "sell",
                outcome="yes",
                price=opp['poly_price'],
                size=size / opp['poly_price']
            )
        
        elif self.mode == "live" and self.live_broker:
            # Live trade
            await self.live_broker.submit_order(
                exchange="polymarket",
                market_id=opp['token_id'],
                side="buy" if "long_poly" in opp['direction'] else "sell",
                outcome="yes",
                price=opp['poly_price'],
                size=size / opp['poly_price']
            )
        
        # Log trade
        self.total_trades += 1
        if self.trade_logger:
            trade = TradeRecord(
                trade_id=f"trade_{int(asyncio.get_event_loop().time())}_{self.total_trades}",
                timestamp=asyncio.get_event_loop().time(),
                signal_type="cross_market",
                exchange="cross",
                market_id=opp['token_id'],
                market_question=opp['market_question'],
                side="buy",
                outcome="yes",
                size=size,
                price=opp['poly_price'],
                expected_pnl=size * gross_edge,
                metadata=str({"direction": opp['direction'], "costs": costs.to_dict()})
            )
            self.trade_logger.record_trade(trade)
        
        if self.alerter:
            await self.alerter.notify_trade({
                "exchange": "cross_market",
                "side": "buy",
                "outcome": "yes",
                "size": size,
                "price": opp['poly_price'],
                "fee": costs.total_cost_pct * size,
            })
    
    async def _log_status(self):
        """Log current status"""
        uptime = asyncio.get_event_loop().time() - self.start_time
        
        logger.info("="*50)
        logger.info(f"STATUS | Uptime: {int(uptime)}s | Mode: {self.mode} | Trades: {self.total_trades}")
        
        if self.paper_broker:
            summary = self.paper_broker.get_account_summary()
            logger.info(f"ACCOUNT | Equity: {summary['total_equity']} | "
                       f"Return: {summary['total_return']} | "
                       f"Trades: {summary['num_trades']}")
        
        if self.order_manager:
            stats = self.order_manager.get_stats()
            logger.info(f"ORDERS | Total: {stats['total_orders']} | "
                       f"Open: {stats['open_orders']} | "
                       f"Filled: {stats['filled_orders']}")
        
        logger.info("="*50)
    
    async def _get_total_capital(self) -> float:
        """Get total capital"""
        if self.paper_broker:
            return self.paper_broker.account.total_equity
        return self.config.initial_capital + self.total_pnl
    
    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down engine...")
        
        # Close all positions
        if self.paper_broker:
            for key in list(self.paper_broker.positions.keys()):
                self.paper_broker.close_position(key, 0.5)  # Simplified exit
        
        # Final summary
        if self.trade_logger:
            perf = self.trade_logger.get_performance_summary(days=1)
            logger.info(f"Final performance: {perf}")
        
        self.running = False


async def main():
    """Entry point"""
    engine = ArbitrageEngine()
    await engine.initialize()
    
    # Start dashboard
    dashboard = DashboardServer(engine)
    asyncio.create_task(dashboard.start())
    
    # Run
    await engine.run()


if __name__ == "__main__":
    asyncio.run(main())
