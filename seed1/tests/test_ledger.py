"""Seed-1 tests — survival math must be boring and correct.

Runs with:  pytest tests/ -v  (from seed1/)
"""
from __future__ import annotations

import datetime as _dt
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))

import ledger as L  # noqa: E402


def make_ledger(tmp_path):
    return L.Ledger(tmp_path / "t.db")


def test_capital_and_totals(tmp_path):
    lg = make_ledger(tmp_path)
    lg.add_capital(100.0, "human-injection")
    t = lg.totals()
    assert t["capital"] == 100.0
    assert t["profit"] == 0.0
    assert t["runway"] == 100.0
    lg.close()


def test_income_without_evidence_rejected(tmp_path):
    lg = make_ledger(tmp_path)
    lg.add_capital(100.0, "human-injection")
    try:
        lg.add_income(10.0, "fiverr-order")
        raised = False
    except ValueError:
        raised = True
    assert raised, "income without evidence must be rejected (Law 1)"
    assert lg.totals()["income"] == 0.0
    lg.close()


def test_profit_math_alive(tmp_path):
    lg = make_ledger(tmp_path)
    lg.add_capital(100.0, "human-injection")
    lg.add_expense(20.0, "domain", evidence="invoice-1")
    lg.add_income(45.0, "fiverr-order", evidence="order-FX123")
    t = lg.totals()
    assert t["profit"] == 25.0        # 45 - 20
    assert t["runway"] == 125.0       # 100 + 45 - 20
    lg.close()


def test_verdict_dead_at_zero_income(tmp_path):
    lg = make_ledger(tmp_path)
    contract = {"born": "2026-08-19", "deadline": "2026-10-18"}
    lg.add_capital(100.0, "human-injection")
    lg.add_expense(5.0, "tools", evidence="invoice-2")
    v = L.verdict(lg, contract, today=_dt.date(2026, 10, 19))
    assert v["status"] == "DEAD"      # profit = -5
    lg.close()


def test_verdict_alive_with_profit(tmp_path):
    lg = make_ledger(tmp_path)
    contract = {"born": "2026-08-19", "deadline": "2026-10-18"}
    lg.add_capital(100.0, "human-injection")
    lg.add_expense(10.0, "tools", evidence="invoice-3")
    lg.add_income(30.0, "sale", evidence="order-A1")
    v = L.verdict(lg, contract, today=_dt.date(2026, 10, 19))
    assert v["status"] == "ALIVE"     # profit = 20
    lg.close()


def test_verdict_pending_before_deadline(tmp_path):
    lg = make_ledger(tmp_path)
    contract = {"born": "2026-08-19", "deadline": "2026-10-18"}
    lg.add_capital(100.0, "human-injection")
    v = L.verdict(lg, contract, today=_dt.date(2026, 9, 1))
    assert v["status"] == "PENDING"
    assert v["days_left"] == 47
    lg.close()


def test_zero_or_negative_amount_rejected(tmp_path):
    lg = make_ledger(tmp_path)
    for bad in (0.0, -5.0):
        try:
            lg.add_expense(bad, "x")
            raised = False
        except ValueError:
            raised = True
        assert raised
    lg.close()


def test_real_contract_shape():
    c = L.load_contract()
    assert c["capital_committed_usd"] == 100.0
    assert c["deadline"] > c["born"]
    assert len(c["laws"]) >= 5
