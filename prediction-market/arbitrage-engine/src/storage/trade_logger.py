"""
Trade Logger - Persistent Trade Records

Stores all trades, fills, and PnL for:
- Regulatory compliance
- Performance analysis
- Tax reporting
- Strategy optimization

Storage: SQLite (default), PostgreSQL (production)
"""
import json
import time
import sqlite3
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


@dataclass
class TradeRecord:
    """Complete trade record"""
    trade_id: str
    timestamp: float
    signal_type: str  # "cross_market", "news_alpha", "combo_arb", "market_maker"
    exchange: str  # "polymarket" / "kalshi" / "cross"
    market_id: str
    market_question: str
    side: str
    outcome: str  # "yes" / "no"
    size: float
    price: float
    expected_pnl: float
    actual_pnl: float = 0.0
    fees: float = 0.0
    slippage: float = 0.0
    hold_time_hours: float = 0.0
    exit_price: float = 0.0
    exit_timestamp: float = 0.0
    status: str = "open"  # "open", "closed", "expired", "cancelled"
    metadata: str = "{}"  # JSON string for extra data


class TradeLogger:
    """
    Persistent storage for all trade data.
    
    Tables:
    - trades: All trades with entry/exit details
    - fills: Individual fill records
    - positions: Current and historical positions
    - daily_pnl: Aggregated daily P&L for reporting
    """
    
    def __init__(self, db_path: str = "data/arbitrage.db"):
        self.db_path = db_path
        self.conn = None
        self._init_db()
    
    def _init_db(self):
        """Initialize database schema"""
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        cursor = self.conn.cursor()
        
        # Trades table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS trades (
            trade_id TEXT PRIMARY KEY,
            timestamp REAL,
            signal_type TEXT,
            exchange TEXT,
            market_id TEXT,
            market_question TEXT,
            side TEXT,
            outcome TEXT,
            size REAL,
            price REAL,
            expected_pnl REAL,
            actual_pnl REAL DEFAULT 0,
            fees REAL DEFAULT 0,
            slippage REAL DEFAULT 0,
            hold_time_hours REAL DEFAULT 0,
            exit_price REAL DEFAULT 0,
            exit_timestamp REAL DEFAULT 0,
            status TEXT DEFAULT 'open',
            metadata TEXT DEFAULT '{}',
            created_at REAL DEFAULT (strftime('%s', 'now'))
        )
        """)
        
        # Fills table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS fills (
            fill_id TEXT PRIMARY KEY,
            trade_id TEXT,
            timestamp REAL,
            exchange TEXT,
            market_id TEXT,
            side TEXT,
            filled_size REAL,
            fill_price REAL,
            fee REAL,
            slippage REAL,
            FOREIGN KEY (trade_id) REFERENCES trades(trade_id)
        )
        """)
        
        # Daily P&L summary
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_pnl (
            date TEXT PRIMARY KEY,
            num_trades INTEGER,
            num_wins INTEGER,
            num_losses INTEGER,
            gross_pnl REAL,
            total_fees REAL,
            net_pnl REAL,
            win_rate REAL,
            avg_win REAL,
            avg_loss REAL,
            max_drawdown REAL,
            sharpe REAL
        )
        """)
        
        # Indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fills_trade ON fills(trade_id)")
        
        self.conn.commit()
        logger.info(f"Trade logger initialized: {self.db_path}")
    
    def record_trade(self, trade: TradeRecord) -> bool:
        """Record a new trade"""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
            INSERT INTO trades (trade_id, timestamp, signal_type, exchange, market_id,
                              market_question, side, outcome, size, price, expected_pnl,
                              actual_pnl, fees, status, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                trade.trade_id, trade.timestamp, trade.signal_type, trade.exchange,
                trade.market_id, trade.market_question, trade.side, trade.outcome,
                trade.size, trade.price, trade.expected_pnl, trade.actual_pnl,
                trade.fees, trade.status, trade.metadata
            ))
            self.conn.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to record trade: {e}")
            return False
    
    def close_trade(self, trade_id: str, exit_price: float, actual_pnl: float, fees: float):
        """Record trade closure"""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
            UPDATE trades 
            SET exit_price = ?, actual_pnl = ?, fees = ?, status = 'closed',
                hold_time_hours = (? - timestamp) / 3600, exit_timestamp = ?,
                slippage = ABS(exit_price - price) / price
            WHERE trade_id = ?
            """, (exit_price, actual_pnl, fees, time.time(), time.time(), trade_id))
            self.conn.commit()
        except Exception as e:
            logger.error(f"Failed to close trade: {e}")
    
    def get_trade(self, trade_id: str) -> Optional[TradeRecord]:
        """Get single trade record"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM trades WHERE trade_id = ?", (trade_id,))
        row = cursor.fetchone()
        if row:
            return self._row_to_trade(row)
        return None
    
    def get_open_trades(self) -> List[TradeRecord]:
        """Get all open trades"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM trades WHERE status = 'open'")
        return [self._row_to_trade(row) for row in cursor.fetchall()]
    
    def get_trades_by_date(self, date: str) -> List[TradeRecord]:
        """Get trades for a specific date (YYYY-MM-DD)"""
        cursor = self.conn.cursor()
        start = datetime.strptime(date, "%Y-%m-%d").timestamp()
        end = start + 86400
        cursor.execute("SELECT * FROM trades WHERE timestamp >= ? AND timestamp < ?", (start, end))
        return [self._row_to_trade(row) for row in cursor.fetchall()]
    
    def calculate_daily_pnl(self, date: Optional[str] = None) -> dict:
        """Calculate daily P&L summary"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        trades = self.get_trades_by_date(date)
        closed = [t for t in trades if t.status == "closed"]
        
        if not closed:
            return {"date": date, "num_trades": 0, "net_pnl": 0}
        
        wins = [t for t in closed if t.actual_pnl > 0]
        losses = [t for t in closed if t.actual_pnl < 0]
        
        total_pnl = sum(t.actual_pnl for t in closed)
        total_fees = sum(t.fees for t in closed)
        
        return {
            "date": date,
            "num_trades": len(closed),
            "num_wins": len(wins),
            "num_losses": len(losses),
            "win_rate": len(wins) / len(closed),
            "gross_pnl": sum(t.actual_pnl + t.fees for t in closed),
            "total_fees": total_fees,
            "net_pnl": total_pnl - total_fees,
            "avg_win": sum(t.actual_pnl for t in wins) / len(wins) if wins else 0,
            "avg_loss": sum(t.actual_pnl for t in losses) / len(losses) if losses else 0,
        }
    
    def get_performance_summary(self, days: int = 30) -> dict:
        """
        Get performance summary for last N days.
        Key metrics: Sharpe, Max Drawdown, Win Rate, Profit Factor
        """
        end = time.time()
        start = end - (days * 86400)
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT actual_pnl, fees, status FROM trades 
            WHERE timestamp >= ? AND status = 'closed'
        """, (start,))
        
        pnls = []
        for row in cursor.fetchall():
            pnls.append({"pnl": row[0], "fee": row[1]})
        
        if not pnls:
            return {"days": days, "total_trades": 0}
        
        net_pnls = [p["pnl"] - p["fee"] for p in pnls]
        total_pnl = sum(net_pnls)
        winning = [p for p in net_pnls if p > 0]
        losing = [p for p in net_pnls if p < 0]
        
        # Sharpe (annualized, assuming daily Sharpe * sqrt(365))
        if len(net_pnls) > 1:
            mean = sum(net_pnls) / len(net_pnls)
            var = sum((x - mean) ** 2 for x in net_pnls) / (len(net_pnls) - 1)
            std = var ** 0.5 if var > 0 else 0.001
            sharpe = (mean / std) * (365 ** 0.5) if std > 0 else 0
        else:
            sharpe = 0
        
        # Max drawdown
        peak = 0
        max_dd = 0
        cum = 0
        for p in net_pnls:
            cum += p
            peak = max(peak, cum)
            dd = peak - cum
            max_dd = max(max_dd, dd)
        
        return {
            "days": days,
            "total_trades": len(pnls),
            "total_pnl": total_pnl,
            "avg_pnl": total_pnl / len(pnls),
            "win_rate": len(winning) / len(pnls),
            "profit_factor": abs(sum(winning)) / abs(sum(losing)) if losing else float('inf'),
            "sharpe": sharpe,
            "max_drawdown": max_dd,
            "best_trade": max(net_pnls),
            "worst_trade": min(net_pnls),
        }
    
    def export_csv(self, filepath: str, days: int = 30):
        """Export trades to CSV for tax/analysis"""
        import csv
        
        end = time.time()
        start = end - (days * 86400)
        
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM trades WHERE timestamp >= ?", (start,))
        
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            columns = [desc[0] for desc in cursor.description]
            writer.writerow(columns)
            writer.writerows(cursor.fetchall())
    
    def _row_to_trade(self, row) -> TradeRecord:
        """Convert DB row to TradeRecord"""
        return TradeRecord(
            trade_id=row[0],
            timestamp=row[1],
            signal_type=row[2],
            exchange=row[3],
            market_id=row[4],
            market_question=row[5],
            side=row[6],
            outcome=row[7],
            size=row[8],
            price=row[9],
            expected_pnl=row[10],
            actual_pnl=row[11],
            fees=row[12],
            slippage=row[13],
            hold_time_hours=row[14],
            exit_price=row[15],
            exit_timestamp=row[16],
            status=row[17],
            metadata=row[18] if len(row) > 18 else "{}",
        )
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
