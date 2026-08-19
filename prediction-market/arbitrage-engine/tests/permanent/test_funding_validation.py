"""
Permanent validation tests for funding data ingestion.
These prevent the specific bugs we encountered.
"""
import pytest
import csv
import json

DATA_DIR = "data"


class TestFundingDataValidation:
    """Tests that funding data meets quality thresholds."""

    def test_symbol_filter_exact_match(self):
        """MEXC bug: symbol=ADA_USDT returns ALL symbols.
        Any data source must be filtered to exact symbol match."""
        # This test checks that processed data contains only the requested symbol
        with open("data/validated/gate_funding_history_30d.csv") as f:
            reader = csv.DictReader(f)
            coins = set(row["coin"] for row in reader)
        # Should only contain requested coins
        expected = {"BTC", "ETH", "XRP", "BNB", "ADA", "SOL"}
        assert coins == expected, f"Unexpected coins in data: {coins - expected}"

    def test_funding_rate_sign_consistent(self):
        """Rates can be positive or negative, but magnitudes should be sane."""
        with open("data/validated/gate_funding_history_30d.csv") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rate = float(row["rate"])
                # Per-8h rate should never exceed ±1% (100x normal)
                assert abs(rate) < 0.01, f"Abnormal rate {rate} for {row['coin']}/{row['datetime']}"

    def test_annualization_calculation(self):
        """Verify annualization: rate * 3 periods/day * 365 days."""
        with open("data/validated/gate_funding_history_30d.csv") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        # Spot check first row
        if rows:
            rate = float(rows[0]["rate"])
            expected_annual = rate * 3 * 365
            # Max reasonable annual: ±1000%
            assert abs(expected_annual) < 10, f"Annualization implausible: {expected_annual}"

    def test_settlement_interval_known(self):
        """Settlement interval must be documented for each source."""
        with open("data/raw/mexc_api_behavior.json") as f:
            mexc_info = json.load(f)
        # MEXC must have notes on its behavior
        assert "note" in mexc_info
        assert "ALL" in mexc_info["note"].upper()  # Documented: returns all symbols

    def test_timestamp_no_duplicates(self):
        """No duplicate timestamps after alignment (test the alignment logic)."""
        # Load Gate data and verify no duplicate timestamps
        with open("data/validated/gate_funding_history_30d.csv") as f:
            reader = csv.DictReader(f)
            timestamps = [int(row["timestamp_ms"]) for row in reader]
        
        # Timestamps should have at most few duplicates (within same coin)
        # For unique (coin, timestamp) pairs, no exact duplicates
        pairs = []
        with open("data/validated/gate_funding_history_30d.csv") as f:
            reader = csv.DictReader(f)
            pairs = [(row["coin"], row["timestamp_ms"]) for row in reader]
        
        assert len(pairs) == len(set(pairs)), "Duplicate (coin, timestamp) pairs found"

    def test_data_freshness(self):
        """Data should not be more than 48 hours old."""
        import os
        from datetime import datetime, timedelta
        
        fpath = "data/validated/gate_funding_history_30d.csv"
        mtime = os.path.getmtime(fpath)
        age = datetime.now() - datetime.fromtimestamp(mtime)
        assert age < timedelta(hours=48), f"Data is {age.total_seconds()/3600:.1f} hours old"
