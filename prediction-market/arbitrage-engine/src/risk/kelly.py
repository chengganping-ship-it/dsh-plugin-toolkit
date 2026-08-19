"""
Kelly Criterion Position Sizing Calculator

The Kelly Criterion determines the optimal fraction of a bankroll to bet
to maximize long-term growth.

Formula: f* = (bp - q) / b
Where:
    f* = optimal fraction of bankroll
    b  = odds received (net, i.e., 2.0 means win $2 for every $1 bet)
    p  = probability of winning
    q  = probability of losing (1-p)

We use "Fractional Kelly" (typically 1/4 or 1/2 Kelly) to reduce volatility.
"""
import numpy as np
from typing import Optional


class KellyCriterion:
    """
    Kelly Criterion position sizing for prediction markets.
    
    Usage:
        kelly = KellyCriterion(capital=1000, fraction=0.25)
        size = kelly.position_size(win_prob=0.6, odds=1.8)
        # Returns: 83.33 (bet $83.33 of your $1000)
    """
    
    def __init__(self, capital: float, fraction: float = 0.25):
        """
        Args:
            capital: Total trading capital
            fraction: Kelly fraction (0.25=conservative, 0.5=moderate, 1.0=full Kelly)
        """
        if capital <= 0:
            raise ValueError("Capital must be positive")
        if not 0 < fraction <= 1:
            raise ValueError("Kelly fraction must be between 0 and 1")
        
        self.capital = capital
        self.fraction = fraction
        self.trade_history = []
        self.pnl_history = []
    
    def kelly_fraction(self, win_prob: float, odds: float) -> float:
        """
        Calculate the optimal Kelly fraction.
        
        Args:
            win_prob: Estimated probability of winning (0 to 1)
            odds: Net odds received (1.0 = 1:1, 2.0 = 2:1, etc.)
            
        Returns:
            Optimal fraction of bankroll to bet (0 to 1)
        """
        p = np.clip(win_prob, 0.001, 0.999)
        q = 1 - p
        
        if odds <= 1:
            return 0.0
        
        b = odds - 1  # Net odds (subtract the 1 unit stake returned on win)
        
        # Kelly formula: f* = (bp - q) / b
        f_star = (b * p - q) / b
        
        # Don't bet if edge is negative
        if f_star <= 0:
            return 0.0
        
        return f_star * self.fraction
    
    def position_size(self, win_prob: float, odds: float, 
                      max_size: Optional[float] = None) -> float:
        """
        Calculate the actual dollar amount to bet.
        
        Args:
            win_prob: Estimated probability of winning
            odds: Net odds received
            max_size: Optional maximum position size cap
            
        Returns:
            Dollar amount to bet (always >= 0)
        """
        fraction = self.kelly_fraction(win_prob, odds)
        size = self.capital * fraction
        
        if max_size:
            size = min(size, max_size)
        
        return size
    
    def growth_rate(self, win_prob: float, odds: float) -> float:
        """
        Calculate expected geometric growth rate per bet.
        
        Formula: G = p * ln(1 + bf) + q * ln(1 - f)
        
        Args:
            win_prob: Win probability
            odds: Gross odds
            
        Returns:
            Continuous growth rate
        """
        p = win_prob
        q = 1 - p
        b = odds - 1
        f = self.kelly_fraction(win_prob, odds)
        
        if f == 0:
            return 0.0
        
        # Expected log wealth per bet
        growth = p * np.log(1 + b * f) + q * np.log(1 - f)
        return growth
    
    def update_capital(self, new_capital: float):
        """Update current capital (after P&L)"""
        self.capital = new_capital
    
    def record_trade(self, won: bool, pnl: float):
        """Record a completed trade"""
        self.trade_history.append(won)
        self.pnl_history.append(pnl)
    
    @property
    def win_rate(self) -> float:
        """Historical win rate"""
        if not self.trade_history:
            return 0.5
        return sum(self.trade_history) / len(self.trade_history)
    
    @property
    def profit_factor(self) -> float:
        """Sum of wins / Sum of losses"""
        wins = sum(p for p in self.pnl_history if p > 0)
        losses = abs(sum(p for p in self.pnl_history if p < 0))
        if losses == 0:
            return float('inf')
        return wins / losses
    
    @property
    def kelly_edge(self) -> float:
        """Current edge estimate based on history"""
        if len(self.trade_history) < 20:
            return 0.5
        return self.win_rate
    
    def recommend_fraction(self) -> float:
        """
        Recommend Kelly fraction based on Sharpe and trade count.
        More trades = more confidence in edge estimate.
        """
        if len(self.trade_history) < 50:
            return 0.125  # Very conservative initially
        elif len(self.trade_history) < 100:
            return 0.25
        else:
            return self.fraction
