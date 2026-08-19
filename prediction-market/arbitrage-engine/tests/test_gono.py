"""
Go / No-Go Gate Tests

These tests MUST all pass before going live with any real money.

Run: pytest tests/test_gono.py -v

If ANY test fails — DO NOT GO LIVE. Fix the issue first.
"""
import pytest
import os
import sys
import time
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from execution.cost_model import CostModel
from execution.inventory_manager import InventoryManager


# ========================================
# GATE 1: Cost Model Sanity Checks
# ========================================

class TestCostModelSanity:
    """Cost model must produce sane, non-zero costs"""
    
    def test_polymarket_costs_nonzero(self):
        """Polymarket trade must have non-zero total cost"""
        model = CostModel(safety_margin=0.005)
        costs = model.calculate_polymarket_costs(0.5, 100, "buy")
        
        assert costs.total_cost_pct > 0
        assert costs.exchange_fee > 0  # 2% taker
        assert costs.gas_fee > 0
    
    def test_kalshi_costs_nonzero(self):
        """Kalshi trade must have non-zero exchange fee"""
        model = CostModel()
        costs = model.calculate_kalshi_costs(42, 100)  # 42 cents, 100 contracts
        
        assert costs.total_cost_pct > 0
        assert costs.exchange_fee > 0
        assert costs.gas_fee == 0  # No gas on Kalshi
    
    def test_cross_market_costs_higher(self):
        """Cross-market should cost more than single-market"""
        model = CostModel()
        
        single = model.calculate_polymarket_costs(0.5, 100, "buy")
        cross = model.calculate_cross_market_costs(0.5, 48, 100, 7)
        
        assert cross.total_cost_pct >= single.total_cost_pct
    
    def test_net_edge_can_negative(self):
        """If gross edge < total costs, net edge should be negative"""
        model = CostModel()
        
        costs = model.calculate_polymarket_costs(0.5, 100, "buy")
        costs.gross_edge = 0.001  # 0.1% - less than costs
        
        assert costs.net_edge < 0
    
    def test_should_execute_rejects_low_edge(self):
        """Cost model should reject trades with insufficient edge"""
        model = CostModel()
        
        # 1% edge should be rejected (min is 1.5%)
        assert model.should_execute(0.01, min_edge=0.015) is False
        
        # 3% edge should pass
        assert model.should_execute(0.03, min_edge=0.015) is True


# ========================================
# GATE 2: Inventory Manager Kill Switch
# ========================================

class TestKillSwitch:
    """Kill switch must halt trading immediately"""
    
    def test_kill_switch_blocks_all(self):
        """When kill switch active, no trades allowed"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            kill_path = f.name
        
        try:
            inv = InventoryManager()
            inv.kill_switch_path = kill_path
            
            # Create kill switch
            with open(kill_path, 'w') as f:
                f.write("test")
            
            assert inv.is_kill_switch_active() is True
            
            allowed, reason = inv.check_trade_direction(100, "long_poly_short_kalshi")
            assert allowed is False
            assert "KILL" in reason
            
        finally:
            if os.path.exists(kill_path):
                os.remove(kill_path)
    
    def test_kill_switch_clear(self):
        """Kill switch should be clearable"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            kill_path = f.name
        
        try:
            inv = InventoryManager()
            inv.kill_switch_path = kill_path
            
            inv.trigger_kill_switch("test")
            assert inv.is_kill_switch_active() is True
            
            inv.clear_kill_switch()
            assert inv.is_kill_switch_active() is False
            
        finally:
            if os.path.exists(kill_path):
                os.remove(kill_path)
    
    def test_skew_block(self):
        """Skew beyond threshold should block one direction"""
        inv = InventoryManager(warn_threshold=0.70, block_threshold=0.85)
        
        # Simulate 90% balance on Polymarket
        inv.update_balance("polymarket", cash=90, locked=0)
        inv.update_balance("kalshi", cash=10, locked=0)
        
        # Should block long_poly (would increase skew)
        allowed, reason = inv.check_trade_direction(10, "long_poly_short_kalshi")
        assert allowed is False
        
        # Should allow long_kalshi_reverse_poly (reduces skew)
        allowed, reason = inv.check_trade_direction(10, "long_kalshi_short_poly")
        assert allowed is True
    
    def test_capital_score_prefers_short_duration(self):
        """Higher annualized score for same edge but shorter duration"""
        inv = InventoryManager()
        inv.update_balance("polymarket", cash=500, locked=0)
        inv.update_balance("kalshi", cash=500, locked=0)
        
        # Same edge, different lockup times
        score_short = inv.get_capital_score(0.02, 0.01, 2, "long_poly_short_kalshi")
        score_long = inv.get_capital_score(0.02, 0.01, 90, "long_poly_short_kalshi")
        
        assert score_short > score_long
    
    def test_capital_score_boosts_rebalance(self):
        """Trades that fix imbalance should get score boost"""
        inv = InventoryManager()
        inv.update_balance("polymarket", cash=700, locked=0)  # 70% on poly
        inv.update_balance("kalshi", cash=300, locked=0)
        
        # Direction that reduces skew
        score_fix = inv.get_capital_score(0.02, 0.01, 7, "long_kalshi_short_poly")
        # Direction that worsens skew
        score_worse = inv.get_capital_score(0.02, 0.01, 7, "long_poly_short_kalshi")
        
        assert score_fix >= score_worse


# ========================================
# GATE 3: Live Mode Parameters Conservative
# ========================================

class TestLiveParameters:
    """Verify live mode parameters are conservative enough"""
    
    def test_max_position_below_capital(self):
        """Single position should be < 50% of capital"""
        max_position = float(os.getenv("MAX_POSITION_SIZE_USD", "50"))
        initial_capital = float(os.getenv("INITIAL_CAPITAL", "1000"))
        
        assert max_position < initial_capital * 0.5
    
    def test_max_loss_reasonable(self):
        """Daily max loss should be < 10% of capital (target 3-5%)"""
        max_loss = float(os.getenv("MAX_DAILY_LOSS_USD", "50"))
        initial_capital = float(os.getenv("INITIAL_CAPITAL", "1000"))
        
        assert max_loss < initial_capital * 0.10
        # Also verify it's in the target range (3-5%)
        assert max_loss <= initial_capital * 0.05
    
    def test_min_edge_positive(self):
        """Min edge should be at least 1%"""
        min_edge = float(os.getenv("MIN_NET_EDGE", "0.015"))
        
        assert min_edge >= 0.01


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
