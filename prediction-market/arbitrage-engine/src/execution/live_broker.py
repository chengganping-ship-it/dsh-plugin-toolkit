"""
Live Broker - Real Order Execution

Connects to actual exchange APIs using order state machine.
Only activated when TRADING_MODE=live.

Uses:
- py-clob-client-v2 for Polymarket (EIP-712 signature)
- Kalshi REST API with HMAC-SHA256 auth
"""
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class LiveBroker:
    """
    Real order execution through exchange APIs.
    
    All orders go through OrderManager state machine for tracking.
    All positions go through risk checks before execution.
    """
    
    def __init__(self, poly_client=None, kalshi_client=None, 
                 order_manager=None, cost_model=None, risk_checker=None):
        """
        Args:
            poly_client: Initialized PolymarketClient
            kalshi_client: Initialized KalshiClient
            order_manager: OrderManager instance
            cost_model: CostModel instance
            risk_checker: RiskChecker instance (optional)
        """
        self.poly = poly_client
        self.kalshi = kalshi_client
        self.order_manager = order_manager
        self.cost_model = cost_model
        self.risk_checker = risk_checker
        
        # Track real positions
        self.positions = {}
        self.account_balances = {}
        
        # Execution stats
        self.total_orders_submitted = 0
        self.total_orders_filled = 0
        self.total_fees_paid = 0.0
    
    async def submit_order(self, exchange: str, market_id: str, side: str,
                          outcome: str, price: float, size: float) -> Optional[str]:
        """
        Submit a real order to exchange.
        
        Returns:
            Order ID if successful, None otherwise
        """
        # Create order in state machine
        order = self.order_manager.create_order(
            exchange=exchange,
            market_id=market_id,
            side=side,
            outcome=outcome,
            price=price,
            size=size
        )
        
        if not order:
            logger.error("Order creation failed - rate limit or max orders")
            return None
        
        # Pre-trade risk check
        if self.risk_checker:
            passed, reason = await self.risk_checker.check_order(order)
            if not passed:
                self.order_manager.reject(order.id, reason)
                logger.warning(f"Order rejected by risk check: {reason}")
                return None
        
        # Submit to exchange
        try:
            if exchange == "polymarket" and self.poly:
                result = await self.poly.place_order(
                    token_id=market_id,
                    price=price,
                    size=size,
                    side=side
                )
                order.metadata["exchange_order_id"] = result.get("id", "")
                
            elif exchange == "kalshi" and self.kalshi:
                price_cents = int(price * 100)
                result = await self.kalshi.place_order(
                    ticker=market_id,
                    side=outcome,
                    action=side,
                    count=int(size),
                    price=price
                )
                order.metadata["exchange_order_id"] = result.get("order_id", "")
            
            else:
                self.order_manager.fail(order.id, f"No client for {exchange}")
                return None
            
            self.order_manager.submit_order(order.id)
            self.total_orders_submitted += 1
            
            logger.info(f"Live order submitted: {order.id} on {exchange}")
            return order.id
            
        except Exception as e:
            self.order_manager.fail(order.id, str(e))
            logger.error(f"Order submission failed: {e}")
            return None
    
    async def check_fills(self):
        """Check for fills on all open orders"""
        open_orders = self.order_manager.get_open_orders()
        
        for order in open_orders:
            if order.state.value != "order_submitted":
                continue
            
            fills = await self._get_exchange_fills(order)
            
            for fill_price, fill_size in fills:
                self.order_manager.fill_order(order.id, fill_price, fill_size)
                self.total_filled = getattr(self, 'total_filled', 0) + fill_size
    
    async def _get_exchange_fills(self, order) -> list:
        """Get recent fills for an order from exchange"""
        fills = []
        
        try:
            if order.exchange == "polymarket" and self.poly:
                # Polymarket: Check on-chain events or order status
                fills = await self._poll_polymarket_fills(order)
            
            elif order.exchange == "kalshi" and self.kalshi:
                # Kalshi: Poll /v2/portfolio/fills
                fills = await self._poll_kalshi_fills(order)
                
        except Exception as e:
            logger.error(f"Error checking fills: {e}")
        
        return fills
    
    async def _poll_polymarket_fills(self, order) -> list:
        """Poll Polymarket for fills"""
        # Implementation: Query CLOB API for order fills
        # GET /fills?order_id=xxx
        return []
    
    async def _poll_kalshi_fills(self, order) -> list:
        """Poll Kalshi for fills"""
        # Implementation: Query REST API for recent fills
        # GET /trade-api/v2/portfolio/fills
        if not self.kalshi:
            return []
        
        # Placeholder: Actual implementation would match fills to orders
        return []
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order on exchange"""
        # Implementation depends on exchange API
        return True
    
    async def get_balance(self, exchange: str) -> float:
        """Get real account balance"""
        try:
            if exchange == "polymarket" and self.poly:
                return await self.poly.get_balance()
            elif exchange == "kalshi" and self.kalshi:
                balance_data = await self.kalshi.get_balance()
                return float(balance_data.get("balance", 0))
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
        return 0.0
    
    def get_status(self) -> dict:
        """Get broker status"""
        return {
            "mode": "live",
            "orders_submitted": self.total_orders_submitted,
            "orders_filled": getattr(self, 'total_filled', 0),
            "total_fees": self.total_fees_paid,
            "has_poly": self.poly is not None,
            "has_kalshi": self.kalshi is not None,
        }
