"""
Cross-Market Statistical Arbitrage Strategy

Detects and exploits price discrepancies between Polymarket and Kalshi
for the same underlying prediction event.

Strategy Logic:
1. Find matched markets (same question, different venues)
2. Compare implied probabilities
3. When spread > 2σ of 24h rolling mean, enter
4. When spread mean-reverts, exit
"""
import asyncio
import time
from typing import Optional
from collections import defaultdict
import math


class CrossMarketArbitrageEngine:
    """
    Cross-market statistical arbitrage between prediction exchanges.
    
    Key insight: The same event should have the same probability across venues.
    When it diverges, we bet on reversion.
    """
    
    def __init__(self, poly_client, kalshi_client, lookback_hours: int = 24):
        self.poly = poly_client
        self.kalshi = kalshi_client
        self.lookback_hours = lookback_hours
        
        # Spread history per market
        self.spread_history = defaultdict(list)  # question -> [(timestamp, spread)]
        self.active_positions = {}
        
        # Parameters
        self.entry_zscore = 2.0  # Enter when spread > 2 std devs
        self.exit_zscore = 0.5   # Exit when spread < 0.5 std devs
        self.min_spread = 0.02   # Minimum 2 cent spread to overcome fees
    
    def _compute_statistics(self, question: str) -> dict:
        """Compute mean and std of spread history"""
        history = self.spread_history.get(question, [])
        
        if len(history) < 6:
            return {"mean": 0, "std": float("inf"), "n": len(history)}
        
        spreads = [s for _, s in history[-self.lookback_hours:]]
        n = len(spreads)
        mean = sum(spreads) / n
        
        if n < 2:
            return {"mean": mean, "std": float("inf"), "n": n}
        
        variance = sum((s - mean) ** 2 for s in spreads) / (n - 1)
        std = math.sqrt(variance)
        
        return {"mean": mean, "std": std, "n": n}
    
    def _compute_z_score(self, spread: float, stats: dict) -> float:
        """Compute z-score of current spread vs history"""
        if stats["std"] == 0 or stats["std"] == float("inf"):
            return 0.0
        return (spread - stats["mean"]) / stats["std"]
    
    async def scan_opportunities(self) -> list:
        """
        Scan for cross-market arbitrage opportunities.
        
        Returns:
            List of opportunity dicts with:
            - market_question
            - poly_price, kalshi_price
            - spread, z_score
            - direction (long_poly_short_kalshi or long_kalshi_short_poly)
            - expected_profit, confidence
        """
        opportunities = []
        
        # Get markets from both venues
        poly_markets = await self.poly.get_markets(limit=100)
        kalshi_markets = await self.kalshi.get_markets(limit=100)
        
        # Build question index for Kalshi
        kalshi_index = {}
        for m in kalshi_markets:
            q = m.get("question", m.get("title", "")).lower().strip()
            if q:
                kalshi_index[q] = m
        
        # Compare each Polymarket with Kalshi
        for pm in poly_markets:
            question = pm.get("question", "").lower().strip()
            if not question:
                continue
            
            # Check for match (simplified - production uses LLM for fuzzy matching)
            if question not in kalshi_index:
                continue
            
            km = kalshi_index[question]
            
            # Get prices
            try:
                poly_price = float(pm.get("outcomePrices", "0.5").split(",")[0])
                kalshi_price = float(km.get("yes_bid", 0.5)) / 100  # Kalshi uses cents
            except (ValueError, TypeError):
                continue
            
            # Calculate spread
            spread = poly_price - kalshi_price
            
            # Update history
            self.spread_history[question].append((time.time(), spread))
            
            # Trim old history
            cutoff = time.time() - (self.lookback_hours * 3600)
            self.spread_history[question] = [
                (t, s) for t, s in self.spread_history[question] if t > cutoff
            ]
            
            # Compute statistics
            stats = self._compute_statistics(question)
            z_score = self._compute_z_score(spread, stats)
            
            # Check entry conditions
            if abs(z_score) > self.entry_zscore and abs(spread) > self.min_spread:
                # Calculate confidence and expected profit
                confidence = min(abs(z_score) / self.entry_zscore / 2, 1.0)
                expected_profit = abs(spread) * 0.7  # Assume 70% reversion
                
                opportunity = {
                    "market_question": question,
                    "poly_price": poly_price,
                    "kalshi_price": kalshi_price,
                    "spread": spread,
                    "z_score": z_score,
                    "direction": "long_poly_short_kalshi" if spread > 0 else "long_kalshi_short_poly",
                    "expected_profit": expected_profit,
                    "confidence": confidence,
                    "token_id": pm.get("condition_id", ""),
                    "timestamp": time.time()
                }
                opportunities.append(opportunity)
        
        # Sort by expected profit
        opportunities.sort(key=lambda x: x["expected_profit"], reverse=True)
        return opportunities
    
    async def scan_exit_opportunities(self) -> list:
        """
        Scan for positions that should be exited (spread reverted).
        
        Returns:
            List of positions to exit
        """
        exits = []
        
        for question, position in self.active_positions.items():
            history = self.spread_history.get(question, [])
            if not history:
                continue
            
            current_spread = history[-1][1] if history else 0
            stats = self._compute_statistics(question)
            z_score = self._compute_z_score(current_spread, stats)
            
            # Exit when spread mean-reverts to 0.5 sigma
            if abs(z_score) < self.exit_zscore:
                exits.append({
                    "market_question": question,
                    "current_spread": current_spread,
                    "z_score": z_score,
                    "pnl_estimate": abs(position["entry_spread"]) - abs(current_spread)
                })
        
        return exits
    
    def get_stats(self) -> dict:
        """Get engine statistics"""
        total_spreads = sum(len(h) for h in self.spread_history.values())
        return {
            "markets_tracked": len(self.spread_history),
            "spread_observations": total_spreads,
            "active_positions": len(self.active_positions),
            "recent_opportunities": len([h for h in self.spread_history.values() if len(h) > 10])
        }
