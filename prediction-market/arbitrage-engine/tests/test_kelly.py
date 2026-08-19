"""
Tests for Kelly Criterion implementation
"""
import pytest
import sys
sys.path.insert(0, "src")

from risk.kelly import KellyCriterion


class TestKellyCriterion:
    
    def test_basic_calculation(self):
        """Kelly fraction for 60% win prob at 2.0 odds"""
        kelly = KellyCriterion(capital=1000, fraction=1.0)
        f = kelly.kelly_fraction(0.6, 2.0)
        # f* = (0.6 * 1 - 0.4) / 1 = 0.2
        assert f == pytest.approx(0.2, rel=1e-2)
    
    def test_fractional_kelly(self):
        """Fractional Kelly should be smaller"""
        full = KellyCriterion(capital=1000, fraction=1.0)
        quarter = KellyCriterion(capital=1000, fraction=0.25)
        
        f_full = full.kelly_fraction(0.6, 2.0)
        f_quarter = quarter.kelly_fraction(0.6, 2.0)
        
        assert f_quarter == pytest.approx(f_full * 0.25, rel=1e-2)
    
    def test_negative_edge(self):
        """No bet when expected value is negative"""
        kelly = KellyCriterion(capital=1000)
        f = kelly.kelly_fraction(0.4, 1.5)  # EV = 0.4*0.5 - 0.6 = -0.4
        assert f == 0.0
    
    def test_position_size(self):
        """Position size calculation"""
        kelly = KellyCriterion(capital=1000, fraction=0.25)
        size = kelly.position_size(0.6, 2.0)
        
        # f* = 0.2, fractional = 0.05, size = 50
        assert size == pytest.approx(50.0, rel=1e-2)
    
    def test_position_size_capped(self):
        """Position size respects max_size cap"""
        kelly = KellyCriterion(capital=10000, fraction=1.0)
        size = kelly.position_size(0.7, 3.0, max_size=100)
        
        assert size <= 100
    
    def test_growth_rate_positive(self):
        """Expected growth rate should be positive for +EV bets"""
        kelly = KellyCriterion(capital=1000, fraction=0.25)
        g = kelly.growth_rate(0.6, 2.0)
        
        assert g > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
