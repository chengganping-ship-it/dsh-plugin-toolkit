"""
Slippage Model

Models execution slippage based on:
- Order book depth
- Order size relative to available liquidity
- Market volatility
- Time of day (for traditional markets)
- Urgency of execution

Slippage is the difference between the expected price and the actual execution price.
We estimate it BEFORE trading to avoid entering trades where slippage kills the edge.
"""
import logging
from typing import Optional, List, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class OrderBookLevel:
    """Price level in order book"""
    price: float
    size: float  # Number of shares at this price


@dataclass
class SlippageEstimate:
    """Estimated slippage for a hypothetical order"""
    order_size: float
    available_liquidity: float
    expected_slippage_pct: float  # As percentage of order value
    expected_slippage_usd: float
    can_fill_completely: bool
    avg_fill_price: float
    worst_fill_price: float


class SlippageModel:
    """
    Estimates slippage based on order book depth.
    
    Uses actual order book data to simulate market impact.
    """
    
    # Base slippage parameters
    BASE_SLIPPAGE = 0.0005  # 0.05% base
    SIZE_IMPACT_FACTOR = 0.1  # 10% of order size as % of book
    VOLATILITY_FACTOR = 0.05  # High vol markets have higher slippage
    
    def __init__(self):
        self.history: List[dict] = []  # Track prediction vs actual
    
    def estimate_slippage(self, 
                         order_size: float,
                         order_side: str,  # "buy" or "sell"
                         order_book: dict) -> SlippageEstimate:
        """
        Estimate slippage for an order.
        
        Args:
            order_size: Size of order in USD
            order_side: "buy" (consume asks) or "sell" (consume bids)
            order_book: Dict with keys "bids" and "asks", each list of (price, size)
        
        Returns:
            SlippageEstimate with predicted impact
        """
        if order_side == "buy":
            levels = order_book.get("asks", [])
        else:
            levels = order_book.get("bids", [])
        
        if not levels:
            # No order book data - assume worst case
            return SlippageEstimate(
                order_size=order_size,
                available_liquidity=0,
                expected_slippage_pct=0.01,  # Assume 1%
                expected_slippage_usd=order_size * 0.01,
                can_fill_completely=False,
                avg_fill_price=0,
                worst_fill_price=0,
            )
        
        # Calculate available liquidity
        total_liquidity = sum(size for _, size in levels)
        
        if total_liquidity == 0:
            return SlippageEstimate(
                order_size=order_size,
                available_liquidity=0,
                expected_slippage_pct=0.02,
                expected_slippage_usd=order_size * 0.02,
                can_fill_completely=False,
                avg_fill_price=0,
                worst_fill_price=0,
            )
        
        # Simulate fills walking through the book
        remaining_to_fill = order_size
        total_cost = 0.0
        total_shares = 0.0
        worst_price = levels[0][0]
        
        for price, size in levels:
            fill_price = price
            fill_size = min(remaining_to_fill / price if price > 0 else 0, size)
            
            if fill_size <= 0:
                break
            
            total_cost += fill_size * fill_price
            total_shares += fill_size
            remaining_to_fill -= fill_size * fill_price
            worst_price = fill_price
            
            if remaining_to_fill <= 0.001:
                break
        
        can_fill = remaining_to_fill <= 0.001
        
        if total_shares > 0:
            avg_fill_price = total_cost / total_shares
            entry_price = levels[0][0]
            
            if order_side == "buy":
                slippage_pct = (avg_fill_price - entry_price) / entry_price if entry_price > 0 else 0
            else:
                slippage_pct = (entry_price - avg_fill_price) / entry_price if entry_price > 0 else 0
        else:
            avg_fill_price = levels[0][0]
            slippage_pct = 0.02  # Default high slippage
        
        slippage_pct = max(slippage_pct, self.BASE_SLIPPAGE)
        slippage_usd = order_size * slippage_pct
        
        return SlippageEstimate(
            order_size=order_size,
            available_liquidity=total_liquidity,
            expected_slippage_pct=slippage_pct,
            expected_slippage_usd=slippage_usd,
            can_fill_completely=can_fill,
            avg_fill_price=avg_fill_price,
            worst_fill_price=worst_price,
        )
    
    def estimate_kalshi_slippage(self, 
                                  contracts: int,
                                  side: str,
                                  yes_bids: List[Tuple[int, int]],
                                  yes_asks: List[Tuple[int, int]]) -> SlippageEstimate:
        """
        Special slippage estimation for Kalshi (price in cents).
        
        Args:
            contracts: Number of contracts to trade
            side: "buy" or "sell"
            yes_bids: List of (price_cents, quantity) for YES bids
            yes_asks: List of (price_cents, quantity) for YES asks
        """
        if side == "buy":
            levels = yes_asks
        else:
            levels = yes_bids
        
        if not levels:
            return SlippageEstimate(
                order_size=contracts,
                available_liquidity=0,
                expected_slippage_pct=0.01,
                expected_slippage_usd=contracts * 0.01,
                can_fill_completely=False,
                avg_fill_price=0,
                worst_fill_price=0,
            )
        
        # Convert to (price_usd, size) format
        usd_levels = [(cents / 100.0, qty) for cents, qty in levels]
        
        order_size_usd = contracts * (levels[0][0] / 100.0)
        
        return self.estimate_slippage(order_size_usd, side, {"bids": usd_levels, "asks": usd_levels})
    
    def can_execute_safely(self, 
                          order_size: float,
                          order_side: str,
                          order_book: dict,
                          max_slippage_pct: float = 0.005) -> Tuple[bool, float]:
        """
        Quick check: can we execute within slippage tolerance?
        
        Returns:
            (can_execute, estimated_slippage_pct)
        """
        estimate = self.estimate_slippage(order_size, order_side, order_book)
        can_execute = (estimate.expected_slippage_pct <= max_slippage_pct and 
                      estimate.can_fill_completely)
        return can_execute, estimate.expected_slippage_pct
    
    def get_safe_order_size(self,
                           available_capital: float,
                           order_side: str,
                           order_book: dict,
                           max_slippage_pct: float = 0.005) -> float:
        """
        Calculate maximum order size that keeps slippage under threshold.
        
        Returns:
            Maximum safe order size in USD
        """
        # Binary search for max size
        low = 0
        high = min(available_capital, self._get_total_book_value(order_book))
        
        best_size = 0
        
        for _ in range(20):  # 20 iterations of binary search
            mid = (low + high) / 2
            
            estimate = self.estimate_slippage(mid, order_side, order_book)
            
            if estimate.expected_slippage_pct <= max_slippage_pct and estimate.can_fill_completely:
                best_size = mid
                low = mid
            else:
                high = mid
        
        return best_size
    
    def _get_total_book_value(self, order_book: dict) -> float:
        """Get total value of all levels in order book"""
        total = 0.0
        for side in ["bids", "asks"]:
            for price, size in order_book.get(side, []):
                total += price * size
        return total
    
    def record_actual_slippage(self, expected: float, actual: float, order_size: float):
        """Record prediction accuracy for model improvement"""
        self.history.append({
            "expected_slippage": expected,
            "actual_slippage": actual,
            "order_size": order_size,
            "error": actual - expected,
        })
    
    def get_accuracy_stats(self) -> dict:
        """Get prediction accuracy stats"""
        if not self.history:
            return {"samples": 0}
        
        errors = [h["error"] for h in self.history]
        abs_errors = [abs(e) for e in errors]
        
        return {
            "samples": len(self.history),
            "mean_error": sum(errors) / len(errors),
            "mean_abs_error": sum(abs_errors) / len(abs_errors),
            "max_error": max(abs_errors),
        }
