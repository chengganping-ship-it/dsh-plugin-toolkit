"""
Order Manager - Full State Machine for Order Lifecycle

States:
    SIGNAL_CREATED -> RISK_CHECKED -> ORDER_CREATED -> ORDER_SUBMITTED 
    -> PARTIALLY_FILLED -> FILLED -> HEDGE_SUBMITTED -> HEDGED 
    -> SETTLED -> RECONCILED

Plus error states:
    REJECTED, FAILED, TIMEOUT, CANCELLED
"""
import time
import uuid
import logging
from enum import Enum
from typing import Optional, Dict, List
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


class OrderState(Enum):
    """Order lifecycle states"""
    SIGNAL_CREATED = "signal_created"
    RISK_CHECKED = "risk_checked"
    ORDER_CREATED = "order_created"
    ORDER_SUBMITTED = "order_submitted"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    HEDGE_SUBMITTED = "hedge_submitted"
    HEDGED = "hedged"
    SETTLED = "settled"
    RECONCILED = "reconciled"
    
    # Error states
    REJECTED = "rejected"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


class OrderAction(Enum):
    """Actions that trigger state transitions"""
    CREATE = "create"
    SUBMIT = "submit"
    FILL_PARTIAL = "fill_partial"
    FILL_COMPLETE = "fill_complete"
    SUBMIT_HEDGE = "submit_ledge"
    HEDGE_COMPLETE = "hedge_complete"
    SETTLE = "settle"
    RECONCILE = "reconcile"
    REJECT = "reject"
    FAIL = "fail"
    TIMEOUT = "timeout"
    CANCEL = "cancel"


# Valid state transitions
TRANSITIONS = {
    OrderState.SIGNAL_CREATED: {
        OrderAction.CREATE: OrderState.ORDER_CREATED,
        OrderAction.REJECT: OrderState.REJECTED,
        OrderAction.FAIL: OrderState.FAILED,
    },
    OrderState.ORDER_CREATED: {
        OrderAction.SUBMIT: OrderState.ORDER_SUBMITTED,
        OrderAction.CANCEL: OrderState.CANCELLED,
        OrderAction.REJECT: OrderState.REJECTED,
    },
    OrderState.ORDER_SUBMITTED: {
        OrderAction.FILL_PARTIAL: OrderState.PARTIALLY_FILLED,
        OrderAction.FILL_COMPLETE: OrderState.FILLED,
        OrderAction.TIMEOUT: OrderState.TIMEOUT,
        OrderAction.CANCEL: OrderState.CANCELLED,
        OrderAction.FAIL: OrderState.FAILED,
    },
    OrderState.PARTIALLY_FILLED: {
        OrderAction.FILL_PARTIAL: OrderState.PARTIALLY_FILLED,
        OrderAction.FILL_COMPLETE: OrderState.FILLED,
        OrderAction.TIMEOUT: OrderState.TIMEOUT,
        OrderAction.CANCEL: OrderState.CANCELLED,
        OrderAction.FAIL: OrderState.FAILED,
    },
    OrderState.FILLED: {
        OrderAction.SUBMIT_HEDGE: OrderState.HEDGE_SUBMITTED,
        OrderAction.SETTLE: OrderState.SETTLED,
        OrderAction.FAIL: OrderState.FAILED,
    },
    OrderState.HEDGE_SUBMITTED: {
        OrderAction.HEDGE_COMPLETE: OrderState.HEDGED,
        OrderAction.FAIL: OrderState.FAILED,
    },
    OrderState.HEDGED: {
        OrderAction.SETTLE: OrderState.SETTLED,
    },
    OrderState.SETTLED: {
        OrderAction.RECONCILE: OrderState.RECONCILED,
    },
}


@dataclass
class Order:
    """Represents a single order in the system"""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:12])
    signal_id: str = ""
    exchange: str = ""  # "polymarket" or "kalshi"
    market_id: str = ""
    side: str = ""  # "buy" or "sell"
    outcome: str = ""  # "yes" or "no"
    price: float = 0.0
    size: float = 0.0
    filled_size: float = 0.0
    avg_fill_price: float = 0.0
    state: OrderState = OrderState.SIGNAL_CREATED
    created_at: float = field(default_factory=time.time)
    submitted_at: Optional[float] = None
    filled_at: Optional[float] = None
    settled_at: Optional[float] = None
    rejected_reason: str = ""
    metadata: dict = field(default_factory=dict)
    child_orders: List[str] = field(default_factory=list)  # Hedge orders


class OrderManager:
    """
    Manages order lifecycle with state machine.
    
    All orders go through this manager. It tracks state, enforces valid
    transitions, and logs everything for reconciliation.
    """
    
    def __init__(self, max_open_orders: int = 20, order_timeout: int = 10):
        self.orders: Dict[str, Order] = {}
        self.max_open_orders = max_open_orders
        self.order_timeout_seconds = order_timeout
        self.transition_log: List[dict] = []
    
    def create_order(self, exchange: str, market_id: str, side: str,
                    outcome: str, price: float, size: float,
                    signal_id: str = "") -> Optional[Order]:
        """
        Create a new order from a signal.
        
        Returns:
            Order if created, None if max orders exceeded
        """
        # Check open order limit
        open_count = sum(1 for o in self.orders.values() 
                        if o.state in [OrderState.ORDER_CREATED, OrderState.ORDER_SUBMITTED, OrderState.PARTIALLY_FILLED])
        if open_count >= self.max_open_orders:
            logger.warning(f"Max open orders reached ({self.max_open_orders}). Rejecting new order.")
            return None
        
        order = Order(
            signal_id=signal_id,
            exchange=exchange,
            market_id=market_id,
            side=side,
            outcome=outcome,
            price=price,
            size=size,
            state=OrderState.SIGNAL_CREATED
        )
        
        self.orders[order.id] = order
        self._transition(order, OrderAction.CREATE)
        
        logger.info(f"Order created: {order.id} | {exchange} | {side} {outcome} | {size} @ ${price:.4f}")
        return order
    
    def submit_order(self, order_id: str) -> bool:
        """Submit an order to the exchange"""
        order = self.orders.get(order_id)
        if not order:
            logger.error(f"Order {order_id} not found")
            return False
        
        success = self._transition(order, OrderAction.SUBMIT)
        if success:
            order.submitted_at = time.time()
            logger.info(f"Order submitted: {order_id}")
        return success
    
    def fill_order(self, order_id: str, fill_price: float, fill_size: float) -> bool:
        """Record a fill on an order"""
        order = self.orders.get(order_id)
        if not order:
            return False
        
        order.filled_size += fill_size
        
        # Calculate average fill price (VWAP)
        if order.avg_fill_price == 0:
            order.avg_fill_price = fill_price
        else:
            total_cost = order.avg_fill_price * (order.filled_size - fill_size) + fill_price * fill_size
            order.avg_fill_price = total_cost / order.filled_size
        
        # Determine if fully filled
        remaining = order.size - order.filled_size
        if remaining <= 0.001:  # Allow small rounding error
            order.filled_at = time.time()
            return self._transition(order, OrderAction.FILL_COMPLETE)
        else:
            return self._transition(order, OrderAction.FILL_PARTIAL)
    
    def submit_hedge(self, order_id: str, hedge_order_id: str) -> bool:
        """Record that a hedge order was submitted"""
        order = self.orders.get(order_id)
        if not order:
            return False
        
        order.child_orders.append(hedge_order_id)
        return self._transition(order, OrderAction.SUBMIT_HEDGE)
    
    def complete_hedge(self, order_id: str) -> bool:
        """Mark hedge as complete"""
        order = self.orders.get(order_id)
        if not order:
            return False
        return self._transition(order, OrderAction.HEDGE_COMPLETE)
    
    def settle_order(self, order_id: str) -> bool:
        """Mark order as settled"""
        order = self.orders.get(order_id)
        if not order:
            return False
        
        success = self._transition(order, OrderAction.SETTLE)
        if success:
            order.settled_at = time.time()
        return success
    
    def reconcile(self, order_id: str) -> bool:
        """Final reconciliation of settled order"""
        order = self.orders.get(order_id)
        if not order:
            return False
        return self._transition(order, OrderAction.RECONCILE)
    
    def reject(self, order_id: str, reason: str) -> bool:
        """Reject an order with reason"""
        order = self.orders.get(order_id)
        if not order:
            return False
        
        order.rejected_reason = reason
        return self._transition(order, OrderAction.REJECT)
    
    def cancel(self, order_id: str) -> bool:
        """Cancel an open order"""
        order = self.orders.get(order_id)
        if not order:
            return False
        return self._transition(order, OrderAction.CANCEL)
    
    def timeout(self, order_id: str) -> bool:
        """Mark order as timed out"""
        order = self.orders.get(order_id)
        if not order:
            return False
        return self._transition(order, OrderAction.TIMEOUT)
    
    def check_timeouts(self) -> List[str]:
        """Check for orders that have exceeded timeout"""
        timed_out = []
        now = time.time()
        
        for order in self.orders.values():
            if order.state == OrderState.ORDER_SUBMITTED and order.submitted_at:
                elapsed = now - order.submitted_at
                if elapsed > self.order_timeout_seconds:
                    logger.warning(f"Order {order.id} timed out after {elapsed:.1f}s")
                    self.timeout(order.id)
                    timed_out.append(order.id)
        
        return timed_out
    
    def get_open_orders(self) -> List[Order]:
        """Get all open (non-terminal) orders"""
        terminal = [OrderState.FILLED, OrderState.SETTLED, OrderState.RECONCILED,
                   OrderState.REJECTED, OrderState.FAILED, OrderState.CANCELLED, OrderState.TIMEOUT]
        return [o for o in self.orders.values() if o.state not in terminal]
    
    def get_filled_orders(self) -> List[Order]:
        """Get all filled orders waiting for settlement"""
        return [o for o in self.orders.values() if o.state in [OrderState.FILLED, OrderState.HEDGED]]
    
    def get_stats(self) -> dict:
        """Get order manager statistics"""
        states = {}
        for order in self.orders.values():
            state_name = order.state.value
            states[state_name] = states.get(state_name, 0) + 1
        
        return {
            "total_orders": len(self.orders),
            "open_orders": len(self.get_open_orders()),
            "filled_orders": len(self.get_filled_orders()),
            "state_distribution": states,
            "order_timeout_seconds": self.order_timeout_seconds,
        }
    
    def _transition(self, order: Order, action: OrderAction) -> bool:
        """
        Perform state transition if valid.
        
        Returns:
            True if transition was successful
        """
        current = order.state
        valid_transitions = TRANSITIONS.get(current, {})
        new_state = valid_transitions.get(action)
        
        if new_state is None:
            logger.error(f"Invalid transition: {current.value} -> {action.value}")
            return False
        
        old_state = order.state
        order.state = new_state
        
        log_entry = {
            "timestamp": time.time(),
            "order_id": order.id,
            "from_state": old_state.value,
            "to_state": new_state.value,
            "action": action.value,
        }
        self.transition_log.append(log_entry)
        
        logger.debug(f"Order {order.id}: {old_state.value} -> {new_state.value}")
        return True
    
    def export_log(self) -> List[dict]:
        """Export full transition log for auditing"""
        return self.transition_log
