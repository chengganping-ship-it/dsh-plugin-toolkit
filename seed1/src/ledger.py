"""Append-only SQLite ledger for Seed-1 entity."""

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).resolve().parent.parent / "seed1.db"


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ledger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('capital', 'income', 'expense')),
            amount_usd REAL NOT NULL CHECK(amount_usd >= 0),
            description TEXT NOT NULL,
            evidence TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn


def add_capital(amount_usd: float, description: str, evidence: str = "") -> dict:
    if amount_usd <= 0:
        raise ValueError("Capital must be positive")
    conn = init_db()
    ts = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT INTO ledger (timestamp, type, amount_usd, description, evidence, created_at) VALUES (?,?,?,?,?,?)",
        (ts, "capital", amount_usd, description, evidence, ts),
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "type": "capital", "amount_usd": amount_usd}


def add_income(amount_usd: float, description: str, evidence: str) -> dict:
    if amount_usd <= 0:
        raise ValueError("Income amount must be positive")
    if not evidence or not evidence.strip():
        raise ValueError("Income requires evidence (Law 1)")
    conn = init_db()
    ts = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT INTO ledger (timestamp, type, amount_usd, description, evidence, created_at) VALUES (?,?,?,?,?,?)",
        (ts, "income", amount_usd, description, evidence, ts),
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "type": "income", "amount_usd": amount_usd}


def add_expense(amount_usd: float, description: str, evidence: str = "") -> dict:
    if amount_usd <= 0:
        raise ValueError("Expense must be positive")
    conn = init_db()
    ts = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT INTO ledger (timestamp, type, amount_usd, description, evidence, created_at) VALUES (?,?,?,?,?,?)",
        (ts, "expense", amount_usd, description, evidence, ts),
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "type": "expense", "amount_usd": amount_usd}


def totals() -> dict:
    conn = init_db()
    rows = conn.execute("SELECT type, SUM(amount_usd) as total FROM ledger GROUP BY type").fetchall()
    conn.close()
    result = {"capital": 0.0, "income": 0.0, "expense": 0.0}
    for r in rows:
        result[r["type"]] = r["total"]
    result["profit"] = result["income"] - result["expense"]
    result["runway_days"] = None
    if result["expense"] > 0:
        # Simple runway: capital left / daily burn rate (annualized)
        annual_burn = result["expense"] * 365
        if annual_burn > 0:
            result["runway_days"] = round((result["capital"] - result["expense"]) / (annual_burn / 365), 1)
    return result


def verdict() -> dict:
    t = totals()
    profit = t["profit"]
    lines = [
        f"Capital: ${t['capital']:.2f}",
        f"Income: ${t['income']:.2f}",
        f"Expenses: ${t['expense']:.2f}",
        f"Profit: ${profit:.2f}",
    ]
    if profit > 0:
        status = "ALIVE"
    else:
        status = "DEAD"
    return {
        "status": status,
        "profit": profit,
        "details": "\n".join(lines),
    }
