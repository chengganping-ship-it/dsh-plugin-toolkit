"""
Configuration management
Loads from .env file or environment variables
"""
import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Config:
    """Engine configuration"""
    
    # === Exchange Keys ===
    polymarket_private_key: str = ""
    polymarket_chain_id: int = 137  # Polygon
    
    kalshi_api_key: str = ""
    kalshi_private_key: str = ""
    kalshi_email: str = ""
    
    # === LLM ===
    llm_api_key: str = ""
    llm_provider: str = "deepseek"  # openai / deepseek / claude / groq
    model_name: str = "deepseek-chat"
    
    # === Risk Parameters ===
    initial_capital: float = 1000.0
    max_position_size: float = 500.0
    max_daily_loss: float = 100.0
    max_drawdown: float = 0.15
    min_edge_threshold: float = 0.03
    kelly_fraction: float = 0.25
    max_concurrent_positions: int = 8
    
    # === Engine ===
    tick_interval_seconds: int = 30
    log_level: str = "INFO"
    
    # === Database ===
    database_url: str = "sqlite:///data/arbitrage.db"
    
    def __post_init__(self):
        """Load from environment"""
        self.polymarket_private_key = os.getenv("POLYMARKET_PRIVATE_KEY", self.polymarket_private_key)
        self.kalshi_api_key = os.getenv("KALSHI_API_KEY", self.kalshi_api_key)
        self.kalshi_private_key = os.getenv("KALSHI_PRIVATE_KEY", self.kalshi_private_key)
        self.kalshi_email = os.getenv("KALSHI_EMAIL", self.kalshi_email)
        self.llm_api_key = os.getenv("LLM_API_KEY", self.llm_api_key)
        self.llm_provider = os.getenv("LLM_PROVIDER", self.llm_provider)
        self.model_name = os.getenv("MODEL_NAME", self.model_name)
        
        self.initial_capital = float(os.getenv("INITIAL_CAPITAL", self.initial_capital))
        self.max_position_size = float(os.getenv("MAX_POSITION_SIZE_USD", self.max_position_size))
        self.max_daily_loss = float(os.getenv("MAX_DAILY_LOSS_USD", self.max_daily_loss))
        self.max_drawdown = float(os.getenv("MAX_DRAWDOWN_PCT", self.max_drawdown))
        self.kelly_fraction = float(os.getenv("KELLY_FRACTION", self.kelly_fraction))
