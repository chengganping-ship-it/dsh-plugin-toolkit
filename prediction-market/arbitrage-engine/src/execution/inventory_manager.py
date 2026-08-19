"""
Inventory Manager - Dual-Venue Balance Monitoring

CRITICAL INSIGHT: Kalshi USD and Polymarket USDC are in SEPARATE accounts.
Real-world transfer time = hours to days. This means:

1. You must pre-fund both sides
2. Long-term one-directional arbitrage will deplete one side
3. You need monitoring + automatic skew correction

This module:
- Monitors balance on both venues
- Alerts when skew exceeds thresholds
- Soft-constrains trading direction when one side is low
- Never auto-transfers (that requires human action)
"""
import logging
import os
from typing import Dict, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class VenueBalance:
    """Balance state for a single venue"""
    venue: str  # "polymarket" or "kalshi"
    cash: float = 0.0       # Available to trade
    locked: float = 0.0      # In open positions
    pending: float = 0.0     # Deposits/withdrawals in flight
    
    @property
    def total(self) -> float:
        return self.cash + self.locked + self.pending
    
    @property
    def deployable(self) -> float:
        return self.cash - self.locked


@dataclass
class BalanceSkew:
    """Skew analysis result"""
    polymarket_pct: float   # % of total on Polymarket
    kalshi_pct: float       # % of total on Kalshi
    warn: bool              # Exceeds warn threshold
    block: bool             # Exceeds block threshold
    needs_rebalance: bool   # True if manual action needed


class InventoryManager:
    """
    Monitors and manages dual-venue inventory for cross-market arbitrage.
    
    Soft constraints (configurable):
    - VENUE_BALANCE_SKEW_WARN: Alert when one venue > this %
    - VENUE_BALANCE_SKEW_BLOCK: Only accept reverse-direction trades above this %
    
    Kill switch:
    - KILL_SWITCH_FILE: If this file exists, halt all new trading
    """
    
    WARN_THRESHOLD = 0.70     # 70% on one side = alert
    BLOCK_THRESHOLD = 0.85    # 85% = only reverse trades allowed
    
    def __init__(self, warn_threshold: float = 0.70, block_threshold: float = 0.85):
        self.warn_threshold = warn_threshold
        self.block_threshold = block_threshold
        self.balances: Dict[str, VenueBalance] = {
            "polymarket": VenueBalance("polymarket"),
            "kalshi": VenueBalance("kalshi"),
        }
        self.kill_switch_path = os.getenv("KILL_SWITCH_FILE", "/tmp/HALT")
    
    def update_balance(self, venue: str, cash: float, locked: float = 0, pending: float = 0):
        """Update venue balance (called after each tick)"""
        self.balances[venue] = VenueBalance(
            venue=venue, cash=cash, locked=locked, pending=pending
        )
        
    def get_skew(self) -> BalanceSkew:
        """Calculate current balance skew"""
        poly = self.balances.get("polymarket")
        kalshi = self.balances.get("kalshi")
        
        poly_total = poly.total if poly else 0
        kalshi_total = kalshi.total if kalshi else 0
        total = poly_total + kalshi_total
        
        if total <= 0:
            return BalanceSkew(0.5, 0.5, False, False, False)
        
        poly_pct = poly_total / total
        kalshi_pct = kalshi_total / total
        
        warn = max(poly_pct, kalshi_pct) > self.warn_threshold
        block = max(poly_pct, kalshi_pct) > self.block_threshold
        
        return BalanceSkew(
            polymarket_pct=poly_pct,
            kalshi_pct=kalshi_pct,
            warn=warn,
            block=block,
            needs_rebalance=warn,
        )
    
    def check_trade_direction(self, size_usd: float, direction: str) -> Tuple[bool, str]:
        """
        Check if a trade should be allowed given current inventory.
        
        Args:
            size_usd: Trade size in USD
            direction: "long_poly_short_kalshi" or "long_kalshi_short_poly"
            
        Returns:
            (allowed: bool, reason: str)
        """
        # Check kill switch first
        if self.is_kill_switch_active():
            return False, "KILL SWITCH ACTIVE"
        
        skew = self.get_skew()
        
        if skew.block:
            # Only allow trades that REDUCE the skew
            if skew.polymarket_pct > 0.5 and direction == "long_kalshi_short_poly":
                return True, "Reverse skew correction"
            elif skew.kalshi_pct > 0.5 and direction == "long_poly_short_kalshi":
                return True, "Reverse skew correction"
            else:
                return False, f"Balance skew too high (poly={skew.polymarket_pct:.0%})"
        
        return True, "OK"
    
    def is_kill_switch_active(self) -> bool:
        """Check if kill switch file exists"""
        return os.path.exists(self.kill_switch_path)
    
    def trigger_kill_switch(self, reason: str):
        """Create kill switch file"""
        with open(self.kill_switch_path, 'w') as f:
            f.write(f"Triggered at: {__import__('time').strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
            f.write(f"Reason: {reason}\n")
        logger.critical(f"KILL SWITCH TRIGGERED: {reason}")
    
    def clear_kill_switch(self):
        """Remove kill switch file"""
        if os.path.exists(self.kill_switch_path):
            os.remove(self.kill_switch_path)
            logger.info("Kill switch cleared")
    
    def get_status(self) -> dict:
        """Get full inventory status"""
        skew = self.get_skew()
        
        return {
            "polymarket": {
                "cash": self.balances["polymarket"].cash,
                "locked": self.balances["polymarket"].locked,
                "total": self.balances["polymarket"].total,
            },
            "kalshi": {
                "cash": self.balances["kalshi"].cash,
                "locked": self.balances["kalshi"].locked,
                "total": self.balances["kalshi"].total,
            },
            "skew": {
                "polymarket_pct": f"{skew.polymarket_pct:.1%}",
                "kalshi_pct": f"{skew.kalshi_pct:.1%}",
                "warn": skew.warn,
                "block": skew.block,
            },
            "kill_switch": self.is_kill_switch_active(),
        }
    
    def get_capital_score(self, expected_return: float, risk: float, 
                          days_to_resolution: float, direction: str) -> float:
        """
        Score opportunities by risk-adjusted return, normalized by capital lockup time.
        
        Score = expected_return / risk / sqrt(days_to_resolution)
        
        This naturally prefers short-duration, high-edge opportunities.
        
        Args:
            expected_return: Expected return as decimal (e.g., 0.03 = 3%)
            risk: Risk estimate as decimal (e.g., 0.01 = 1% max loss)
            days_to_resolution: Days until market resolves
            direction: Trade direction for skew adjustment
        """
        if risk <= 0 or days_to_resolution <= 0:
            return 0.0
        
        # Base Sharpe-like score
        score = expected_return / risk
        
        # Normalize by time (opportunity cost)
        time_factor = 1.0 / (days_to_resolution ** 0.5)
        annualized_score = score * time_factor * (365 ** 0.5)
        
        # Skew adjustment: boost score for trades that correct imbalance
        skew = self.get_skew()
        if skew.warn:
            if skew.polymarket_pct > 0.5 and direction == "long_kalshi_short_poly":
                annualized_score *= 1.2  # 20% boost for rebalancing
            elif skew.kalshi_pct > 0.5 and direction == "long_poly_short_kalshi":
                annualized_score *= 1.2
        
        return annualized_score
