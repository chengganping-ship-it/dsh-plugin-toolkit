"""
Multi-level Circuit Breaker System

Triggers:
1. Daily loss limit
2. Max drawdown from peak
3. Consecutive losses streak
4. Volatility spike (abnormal P&L variance)
"""
import time
from typing import Optional
from collections import deque


class CircuitBreaker:
    """
    Trading circuit breaker - stops trading when risk limits exceeded.
    
    Levels:
    - WARNING: Alert only, continue trading
    - SOFT: Reduce position sizes by 50%
    - HARD: Stop opening new positions, close existing gradually
    - EMERGENCY: Close ALL positions immediately
    """
    
    def __init__(self, 
                 max_daily_loss_pct: float = 0.05,
                 max_drawdown_pct: float = 0.15,
                 max_consecutive_losses: int = 5,
                 volatility_threshold: float = 3.0,
                 lookback_trades: int = 50):
        """
        Args:
            max_daily_loss_pct: Maximum daily loss as fraction of capital
            max_drawdown_pct: Maximum drawdown from peak capital
            max_consecutive_losses: Stop after N consecutive losing trades
            volatility_threshold: Z-score threshold for abnormal P&L
            lookback_trades: Number of trades for rolling statistics
        """
        self.max_daily_loss_pct = max_daily_loss_pct
        self.max_drawdown_pct = max_drawdown_pct
        self.max_consecutive_losses = max_consecutive_losses
        self.volatility_threshold = volatility_threshold
        self.lookback = lookback_trades
        
        # State
        self.daily_pnl = 0.0
        self.peak_capital = 0.0
        self.current_drawdown = 0.0
        self.consecutive_losses = 0
        self.trade_pnls = deque(maxlen=lookback_trades)
        self.last_reset_date = time.strftime("%Y-%m-%d")
        self.level = "GREEN"  # GREEN, WARNING, SOFT, HARD, EMERGENCY
    
    def check(self, current_capital: float, trade_pnl: float = 0) -> dict:
        """
        Check all circuit breaker conditions.
        
        Args:
            current_capital: Current total portfolio value
            trade_pnl: P&L from the most recent trade
            
        Returns:
            Dict with level, triggered (bool), reasons (list), action (str)
        """
        reasons = []
        self._reset_daily_if_needed()
        
        # Update PnL tracking
        self.daily_pnl += trade_pnl
        self.trade_pnls.append(trade_pnl)
        
        # Update consecutive losses
        if trade_pnl < 0:
            self.consecutive_losses += 1
        else:
            self.consecutive_losses = 0
        
        # Update drawdown
        self.peak_capital = max(self.peak_capital, current_capital)
        if self.peak_capital > 0:
            self.current_drawdown = (self.peak_capital - current_capital) / self.peak_capital
        
        # Check each limit
        # 1. Daily loss limit
        daily_loss = -self.daily_pnl / max(current_capital, 1)
        if daily_loss > self.max_daily_loss_pct:
            reasons.append(f"Daily loss limit exceeded: {daily_loss:.1%} > {self.max_daily_loss_pct:.1%}")
        
        # 2. Max drawdown
        if self.current_drawdown > self.max_drawdown_pct:
            reasons.append(f"Max drawdown exceeded: {self.current_drawdown:.1%} > {self.max_drawdown_pct:.1%}")
        
        # 3. Consecutive losses
        if self.consecutive_losses >= self.max_consecutive_losses:
            reasons.append(f"Consecutive losses: {self.consecutive_losses}")
        
        # 4. Abnormal volatility
        if len(self.trade_pnls) >= 20:
            mean = sum(self.trade_pnls) / len(self.trade_pnls)
            std = (sum((x - mean) ** 2 for x in self.trade_pnls) / len(self.trade_pnls)) ** 0.5
            if std > 0:
                z_score = (trade_pnl - mean) / std
                if abs(z_score) > self.volatility_threshold:
                    reasons.append(f"Abnormal P&L: z-score={z_score:.2f}")
        
        # Determine circuit breaker level
        n_reasons = len(reasons)
        if n_reasons == 0:
            level = "GREEN"
            action = "CONTINUE"
        elif n_reasons == 1:
            level = "WARNING"
            action = "CONTINUE"
        elif n_reasons == 2:
            level = "SOFT"
            action = "REDUCE_SIZE"
        elif n_reasons >= 3:
            level = "HARD"
            action = "STOP_NEW"
        else:
            level = "EMERGENCY"
            action = "CLOSE_ALL"
        
        self.level = level
        
        return {
            "level": level,
            "triggered": n_reasons > 0,
            "reasons": reasons,
            "action": action,
            "metrics": {
                "daily_pnl": self.daily_pnl,
                "current_drawdown": self.current_drawdown,
                "consecutive_losses": self.consecutive_losses,
            }
        }
    
    def _reset_daily_if_needed(self):
        """Reset daily counters at midnight UTC"""
        today = time.strftime("%Y-%m-%d")
        if today != self.last_reset_date:
            self.daily_pnl = 0.0
            self.consecutive_losses = 0
            self.last_reset_date = today
    
    def manual_reset(self):
        """Manually reset circuit breaker (after review)"""
        self.daily_pnl = 0.0
        self.consecutive_losses = 0
        self.level = "GREEN"
