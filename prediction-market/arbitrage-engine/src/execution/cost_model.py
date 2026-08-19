"""
Real Cost Model

Calculates all costs that reduce gross edge to net edge:
- Exchange fees
- Gas fees (for on-chain settlement)
- Slippage (execution cost)
- Funding cost (capital lockup time)
- Settlement risk discount
- Safety margin

Formula:
    net_edge = gross_edge - all_costs

IMPORTANT: All fee constants verified against exchange docs.
Last checked: 2025-08-08
Fee docs:
  - Polymarket: https://docs.polymarket.com/#fees (0% maker / 2% taker)
  - Kalshi: https://docs.kalshi.com/#fees (1-9 cents per share, max 7% of earnings)
"""
import logging
import time
from typing import Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TradeCosts:
    """Complete cost breakdown for a single trade"""
    gross_edge: float = 0.0          # % edge before costs
    exchange_fee: float = 0.0        # % exchange trading fee
    gas_fee: float = 0.0             # % gas cost (Polygon for Polymarket)
    slippage: float = 0.0            # % estimated slippage
    spread_cost: float = 0.0         # % bid-ask spread cost
    funding_cost: float = 0.0        # % capital lockup cost
    settlement_risk: float = 0.0     # % settlement risk discount
    safety_margin: float = 0.0       # % safety buffer
    
    @property
    def total_cost_pct(self) -> float:
        """Total cost as percentage"""
        return (self.exchange_fee + self.gas_fee + self.slippage + 
                self.spread_cost + self.funding_cost + self.settlement_risk + self.safety_margin)
    
    @property
    def net_edge(self) -> float:
        """Net edge after all costs"""
        return self.gross_edge - self.total_cost_pct
    
    def to_dict(self) -> dict:
        return {
            "gross_edge": f"{self.gross_edge:.4f} ({self.gross_edge*100:.2f}%)",
            "exchange_fee": f"{self.exchange_fee:.4f} ({self.exchange_fee*100:.2f}%)",
            "gas_fee": f"{self.gas_fee:.4f} ({self.gas_fee*100:.2f}%)",
            "slippage": f"{self.slippage:.4f} ({self.slippage*100:.2f}%)",
            "spread_cost": f"{self.spread_cost:.4f} ({self.spread_cost*100:.2f}%)",
            "funding_cost": f"{self.funding_cost:.4f} ({self.funding_cost*100:.2f}%)",
            "settlement_risk": f"{self.settlement_risk:.4f} ({self.settlement_risk*100:.2f}%)",
            "safety_margin": f"{self.safety_margin:.4f} ({self.safety_margin*100:.2f}%)",
            "total_cost_pct": f"{self.total_cost_pct:.4f} ({self.total_cost_pct*100:.2f}%)",
            "net_edge": f"{self.net_edge:.4f} ({self.net_edge*100:.2f}%)",
        }


class CostModel:
    """
    Real-world cost model for prediction market arbitrage.
    
    All fees based on actual exchange documentation as of 2025-2026.
    """
    
    # === Polymarket Fee Structure ===
    POLYMARKET_MAKER_FEE = 0.0    # 0% maker (rebate in some cases)
    POLYMARKET_TAKER_FEE = 0.02   # 2% taker fee
    POLYMARKET_GAS_PER_TX = 0.01  # ~$0.01 per transaction on Polygon
    POLYMARKET_SETTLE_GAS = 0.03  # ~$0.03 for settlement
    
    # === Kalshi Fee Structure ===
    KALSHI_YES_FEE_PER_SHARE = 0.01  # 1 cent per share for prices >= $0.50
    KALSHI_NO_FEE_PER_SHARE = 0.01   # Same for NO
    KALSHI_MAX_FEE_RATE = 0.07       # Max 7% of earnings
    
    # === Slippage Estimates ===
    SLIPPAGE_LIQUID = 0.001     # 0.1% for liquid markets (>$1M daily)
    SLIPPAGE_MEDIUM = 0.003     # 0.3% for medium liquidity
    SILLIQUID_SLIPPAGE = 0.008 # 0.8% for illiquid markets
    
    # === Polygon Gas (in MATIC) ===
    MATIC_PRICE_USD = 0.25      # Conservative estimate
    POLYGON_GAS_GWEI = 30
    
    def __init__(self, safety_margin: float = 0.005, funding_annual_rate: float = 0.05):
        """
        Args:
            safety_margin: % safety buffer on top of calculated costs
            funding_annual_rate: Annual rate for capital cost (e.g., 5%)
        """
        self.safety_margin = safety_margin
        self.funding_annual_rate = funding_annual_rate
    
    def calculate_polymarket_costs(self, price: float, size_usd: float, 
                                   side: str, is_maker: bool = False) -> TradeCosts:
        """
        Calculate all costs for a Polymarket trade.
        """
        # Exchange fee
        if is_maker:
            exchange_fee_usd = 0.0
        else:
            exchange_fee_usd = size_usd * self.POLYMARKET_TAKER_FEE
        
        gas_usd = self.POLYMARKET_GAS_PER_TX + self.POLYMARKET_SETTLE_GAS
        slippage_usd = size_usd * self.SLIPPAGE_MEDIUM
        spread_usd = size_usd * 0.005
        
        return TradeCosts(
            gross_edge=0.0,
            exchange_fee=exchange_fee_usd / size_usd if size_usd > 0 else 0,
            gas_fee=gas_usd / size_usd if size_usd > 0 else 0,
            slippage=slippage_usd / size_usd if size_usd > 0 else 0,
            spread_cost=spread_usd / size_usd if size_usd > 0 else 0,
            funding_cost=0.0,
            settlement_risk=0.002,
            safety_margin=self.safety_margin,
        )
    
    def calculate_kalshi_costs(self, price_cents: int, size: int) -> TradeCosts:
        """
        Calculate all costs for a Kalshi trade.
        """
        size_usd = size * price_cents / 100.0
        
        per_share_fee = 1  # 1 cent minimum
        exchange_fee_usd = size * per_share_fee / 100.0
        
        max_earnings = size * (100 - price_cents) / 100.0
        capped_fee = max_earnings * self.KALSHI_MAX_FEE_RATE
        exchange_fee_usd = min(exchange_fee_usd, capped_fee)
        
        slippage_usd = size_usd * self.SLIPPAGE_MEDIUM
        spread_usd = size_usd * 0.005
        
        return TradeCosts(
            gross_edge=0.0,
            exchange_fee=exchange_fee_usd / size_usd if size_usd > 0 else 0,
            gas_fee=0.0,
            slippage=slippage_usd / size_usd if size_usd > 0 else 0,
            spread_cost=spread_usd / size_usd if size_usd > 0 else 0,
            funding_cost=0.0,
            settlement_risk=0.0,
            safety_margin=self.safety_margin,
        )
    
    def calculate_funding_cost(self, size_usd: float, hold_days: float) -> float:
        """
        Calculate cost of capital lockup.
        """
        daily_rate = self.funding_annual_rate / 365.0
        return daily_rate * hold_days
    
    def calculate_cross_market_costs(self, 
                                     poly_price: float, 
                                     kalshi_price_cents: int,
                                     size_usd: float,
                                     hold_days: float,
                                     poly_liquidity: str = "medium",
                                     kalshi_liquidity: str = "medium") -> TradeCosts:
        """
        Calculate combined costs for cross-market arbitrage.
        """
        # Polymarket leg
        poly_slippage = {
            "high": self.SLIPPAGE_LIQUID,
            "medium": self.SLIPPAGE_MEDIUM,
            "low": self.SILLIQUID_SLIPPAGE,
        }.get(poly_liquidity, self.SLIPPAGE_MEDIUM)
        
        poly_exchange_fee = size_usd * self.POLYMARKET_TAKER_FEE
        poly_gas = self.POLYMARKET_GAS_PER_TX * 2 + self.POLYMARKET_SETTLE_GAS
        poly_slippage_usd = size_usd * poly_slippage
        poly_spread = size_usd * 0.005
        
        # Kalshi leg
        kalshi_slippage = {
            "high": self.SLIPPAGE_LIQUID,
            "medium": self.SLIPPAGE_MEDIUM,
            "low": self.SILLIQUID_SLIPPAGE,
        }.get(kalshi_liquidity, self.SLIPPAGE_MEDIUM)
        
        kalshi_contracts = size_usd / (poly_price if poly_price > 0 else 0.5)
        kalshi_size_usd = kalshi_contracts * (kalshi_price_cents / 100.0)
        
        kalshi_exchange_fee = kalshi_contracts * 0.01
        kalshi_slippage_usd = kalshi_size_usd * kalshi_slippage
        kalshi_spread = kalshi_size_usd * 0.005
        
        # Combined
        total_usd = size_usd + kalshi_size_usd
        total_fees = (poly_exchange_fee + kalshi_exchange_fee + 
                     poly_gas + 
                     poly_slippage_usd + kalshi_slippage_usd +
                     poly_spread + kalshi_spread)
        
        funding = self.calculate_funding_cost(total_usd, hold_days)
        
        return TradeCosts(
            gross_edge=0.0,
            exchange_fee=(poly_exchange_fee + kalshi_exchange_fee) / total_usd,
            gas_fee=poly_gas / total_usd,
            slippage=(poly_slippage_usd + kalshi_slippage_usd) / total_usd,
            spread_cost=(poly_spread + kalshi_spread) / total_usd,
            funding_cost=funding,
            settlement_risk=0.001,
            safety_margin=self.safety_margin,
        )
    
    def should_execute(self, net_edge: float, min_edge: float = 0.015) -> bool:
        """
        Decision gate: should we execute this trade?
        """
        return net_edge >= min_edge
