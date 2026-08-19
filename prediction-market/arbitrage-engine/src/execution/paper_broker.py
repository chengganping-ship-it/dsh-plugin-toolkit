"""
Paper Trading Broker

Simulates order execution using real market data.
Tracks virtual PnL, fees, and slippage as if trading live.

Modes:
- paper: Pure simulation, no real orders
- shadow: Reads real order book, simulates fills based on real data
"""
import time
import logging
from typing import Optional, Dict, List
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class FillModel(Enum):
    """How to simulate fills"""
    IMMEDIATE = "immediate"       # Fill at current price
    REALISTIC = "realistic"       # Fill based on order book depth
    WORST_CASE = "worst_case"     # Fill at worst reasonable price
    RANDOM = "random"             # Random fill within spread


@dataclass
class PaperPosition:
    """Virtual position"""
    market_id: str
    exchange: str
    side: str  # "yes" or "no" for long, "no" for short
    size: float
    avg_price: float
    unrealized_pnl: float = 0.0
    realized_pnl: float = 0.0
    opened_at: float = field(default_factory=time.time)
    last_update: float = field(default_factory=time.time)


@dataclass 
class PaperAccount:
    """Simulated account balance"""
    initial_balance: float = 1000.0
    cash: float = 1000.0
    margin_used: float = 0.0
    realized_pnl: float = 0.0
    unrealized_pnl: float = 0.0
    total_fees_paid: float = 0.0
    num_trades: int = 0
    
    @property
    def total_equity(self) -> float:
        return self.cash + self.unrealized_pnl
    
    @property
    def free_cash(self) -> float:
        return self.cash - self.margin_used
    
    @property
    def total_return_pct(self) -> float:
        if self.initial_balance == 0:
            return 0.0
        return (self.total_equity - self.initial_balance) / self.initial_balance


class PaperBroker:
    """
    Paper trading broker with realistic fill simulation.
    
    Usage:
        broker = PaperBroker(initial_balance=1000, fill_model=FillModel.REALISTIC)
        broker.connect_exchange("polymarket", poly_client)
        broker.connect_exchange("kalshi", kalshi_client)
        
        order_id = broker.place_order("polymarket", market_id, "buy", "yes", price=0.45, size=100)
        
        # On each tick
        broker.check_fills()  # Simulate fills based on real data
        broker.update_positions()  # Update unrealized PnL
    """
    
    def __init__(self, initial_balance: float = 1000.0, 
                 fill_model: FillModel = FillModel.REALISTIC,
                 latency_ms: float = 100):
        """
        Args:
            initial_balance: Starting virtual balance in USD
            fill_model: How to simulate fills
            latency_ms: Simulated execution latency in milliseconds
        """
        self.account = PaperAccount(initial_balance=initial_balance, cash=initial_balance)
        self.fill_model = fill_model
        self.latency_ms = latency_ms
        
        # Exchange clients
        self.exchanges: Dict[str, any] = {}
        
        # Orders and positions
        self.open_orders: Dict[str, dict] = {}
        self.positions: Dict[str, PaperPosition] = {}
        self.closed_positions: List[PaperPosition] = []
        
        # Trade history
        self.trade_history: List[dict] = []
        
        # Tracking
        self.order_counter = 0
        self.last_check_time = time.time()
    
    def connect_exchange(self, name: str, client: any):
        """Connect to a real exchange client (for data, not orders)"""
        self.exchanges[name] = client
        logger.info(f"Connected to {name} for market data")
    
    def place_order(self, exchange: str, market_id: str, side: str, outcome: str,
                   price: float, size: float, order_type: str = "limit") -> str:
        """
        Place a virtual order.
        
        Returns:
            order_id
        """
        # Check if we have enough cash
        required_cash = size * price
        if required_cash > self.account.free_cash:
            logger.warning(f"Insufficient cash: need ${required_cash:.2f}, have ${self.account.free_cash:.2f}")
            return ""
        
        self.order_counter += 1
        order_id = f"paper_{self.order_counter}"
        
        self.open_orders[order_id] = {
            "id": order_id,
            "exchange": exchange,
            "market_id": market_id,
            "side": side,
            "outcome": outcome,
            "price": price,
            "size": size,
            "filled_size": 0.0,
            "avg_fill_price": 0.0,
            "status": "open",
            "created_at": time.time(),
            "order_type": order_type,
        }
        
        # Reserve cash for the order
        self.account.margin_used += required_cash
        
        logger.info(f"Paper order placed: {order_id} | {exchange} | {side} {outcome} | {size} @ ${price:.4f}")
        return order_id
    
    def cancel_order(self, order_id: str) -> bool:
        """Cancel a virtual order"""
        if order_id not in self.open_orders:
            return False
        
        order = self.open_orders[order_id]
        remaining_size = order["size"] - order["filled_size"]
        released_cash = remaining_size * order["price"]
        
        self.account.margin_used -= released_cash
        order["status"] = "cancelled"
        
        del self.open_orders[order_id]
        logger.info(f"Order cancelled: {order_id}")
        return True
    
    def check_fills(self):
        """
        Check if any open orders should be filled based on real market data.
        This should be called on every tick.
        """
        if not self.exchanges:
            return
        
        for order_id, order in list(self.open_orders.items()):
            if order["status"] != "open":
                continue
            
            exchange_name = order["exchange"]
            exchange = self.exchanges.get(exchange_name)
            
            if not exchange:
                continue
            
            # Get real market data to determine fill
            fill_price = self._simulate_fill_price(exchange, order)
            
            if fill_price is not None:
                self._execute_fill(order_id, fill_price)
    
    def _simulate_fill_price(self, exchange: any, order: dict) -> Optional[float]:
        """
        Simulate fill price based on fill model.
        
        Returns:
            Fill price if order should fill, None otherwise
        """
        time_since_open = time.time() - order["created_at"]
        
        # Simulate latency
        if time_since_open < self.latency_ms / 1000:
            return None
        
        try:
            if hasattr(exchange, 'get_price'):
                current_price = exchange.get_price(order["market_id"], "sell" if order["side"] == "buy" else "buy")
            else:
                current_price = order["price"]  # Fallback
        except:
            current_price = order["price"]
        
        if self.fill_model == FillModel.IMMEDIATE:
            return current_price
        
        elif self.fill_model == FillModel.REALISTIC:
            # Limit order fills if market crosses our price
            if order["side"] == "buy" and current_price <= order["price"]:
                return min(order["price"], current_price * 1.001)  # Small slippage
            elif order["side"] == "sell" and current_price >= order["price"]:
                return max(order["price"], current_price * 0.999)
            return None
        
        elif self.fill_model == FillModel.WORST_CASE:
            if order["side"] == "buy" and current_price <= order["price"]:
                return current_price * 1.005  # 0.5% worst case slippage
            elif order["side"] == "sell" and current_price >= order["price"]:
                return current_price * 0.995
            return None
        
        elif self.fill_model == FillModel.RANDOM:
            import random
            if random.random() < 0.3:  # 30% chance to fill
                slippage = random.uniform(0, 0.005)
                if order["side"] == "buy":
                    return current_price * (1 + slippage)
                else:
                    return current_price * (1 - slippage)
            return None
    
    def _execute_fill(self, order_id: str, fill_price: float):
        """Execute a fill on a paper order"""
        order = self.open_orders[order_id]
        remaining = order["size"] - order["filled_size"]
        
        # Calculate fee (conservative)
        fee_rate = 0.02 if order["exchange"] == "polymarket" else 0.01
        fee = remaining * fill_price * fee_rate
        
        # Update order
        order["filled_size"] += remaining
        order["avg_fill_price"] = fill_price
        order["status"] = "filled"
        
        # Update margin
        original_reserve = remaining * order["price"]
        actual_cost = remaining * fill_price + fee
        self.account.margin_used -= original_reserve
        
        # Update cash
        if order["side"] == "buy":
            self.account.cash -= actual_cost
        else:
            self.account.cash += remaining * fill_price - fee
        
        self.account.total_fees_paid += fee
        self.account.num_trades += 1
        
        # Update or create position
        position_key = f"{order['exchange']}_{order['market_id']}_{order['outcome']}"
        
        if position_key in self.positions:
            pos = self.positions[position_key]
            # Update position
            total_size = pos.size + remaining
            pos.avg_price = (pos.avg_price * pos.size + fill_price * remaining) / total_size
            pos.size = total_size
        else:
            self.positions[position_key] = PaperPosition(
                market_id=order["market_id"],
                exchange=order["exchange"],
                side=order["outcome"],
                size=remaining,
                avg_price=fill_price,
            )
        
        # Record trade
        self.trade_history.append({
            "timestamp": time.time(),
            "order_id": order_id,
            "exchange": order["exchange"],
            "market_id": order["market_id"],
            "side": order["side"],
            "outcome": order["outcome"],
            "size": remaining,
            "price": fill_price,
            "fee": fee,
        })
        
        del self.open_orders[order_id]
        logger.info(f"FILLED: {order_id} | {order['exchange']} | {order['side']} {order['outcome']} | "
                   f"{remaining} @ ${fill_price:.4f} | Fee: ${fee:.4f}")
    
    def update_positions(self):
        """Update unrealized PnL based on current market prices"""
        self.account.unrealized_pnl = 0.0
        
        for key, pos in self.positions.items():
            exchange = self.exchanges.get(pos.exchange)
            if not exchange or pos.size <= 0:
                continue
            
            try:
                if hasattr(exchange, 'get_price'):
                    current_price = exchange.get_price(pos.market_id, "sell")
                    pos.unrealized_pnl = pos.size * (current_price - pos.avg_price)
                    self.account.unrealized_pnl += pos.unrealized_pnl
                    pos.last_update = time.time()
            except:
                pass
    
    def close_position(self, position_key: str, exit_price: float) -> float:
        """Close a position"""
        if position_key not in self.positions:
            return 0.0
        
        pos = self.positions[position_key]
        pnl = pos.size * (exit_price - pos.avg_price)
        
        # Apply fee
        fee_rate = 0.02 if pos.exchange == "polymarket" else 0.01
        fee = pos.size * exit_price * fee_rate
        pnl -= fee
        self.account.total_fees_paid += fee
        
        # Update cash
        self.account.cash += pos.size * exit_price - fee
        self.account.realized_pnl += pnl
        self.account.unrealized_pnl -= pos.unrealized_pnl
        
        pos.realized_pnl = pnl
        self.closed_positions.append(pos)
        del self.positions[position_key]
        
        logger.info(f"Position closed: {position_key} | PnL: ${pnl:.2f} | Fee: ${fee:.4f}")
        return pnl
    
    def get_account_summary(self) -> dict:
        """Get account summary"""
        return {
            "initial_balance": f"${self.account.initial_balance:.2f}",
            "cash": f"${self.account.cash:.2f}",
            "margin_used": f"${self.account.margin_used:.2f}",
            "total_equity": f"${self.account.total_equity:.2f}",
            "total_return": f"{self.account.total_return_pct:.2%}",
            "realized_pnl": f"${self.account.realized_pnl:.2f}",
            "unrealized_pnl": f"${self.account.unrealized_pnl:.2f}",
            "total_fees": f"${self.account.total_fees_paid:.2f}",
            "num_trades": self.account.num_trades,
            "open_positions": len(self.positions),
            "open_orders": len(self.open_orders),
        }
    
    def get_positions_summary(self) -> list:
        """Get summary of all open positions"""
        result = []
        for key, pos in self.positions.items():
            result.append({
                "position_key": key,
                "exchange": pos.exchange,
                "market_id": pos.market_id,
                "side": pos.side,
                "size": pos.size,
                "avg_price": pos.avg_price,
                "unrealized_pnl": pos.unrealized_pnl,
                "pnl_pct": (pos.unrealized_pnl / (pos.size * pos.avg_price)) if pos.avg_price > 0 else 0,
            })
        return result
