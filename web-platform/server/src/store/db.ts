/**
 * SQLite persistence layer for funding rate history, trades, and analytics.
 * Uses better-sqlite3 for synchronous high-performance access.
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

let db: Database.Database;

export function initDb(dataDir = './data'): Database.Database {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  db = new Database(path.join(dataDir, 'funding.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  migrate();
  return db;
}

export function getDb(): Database.Database {
  if (!db) initDb();
  return db;
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS funding_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exchange TEXT NOT NULL,
      symbol TEXT NOT NULL,
      funding_rate REAL NOT NULL,
      mark_price REAL,
      open_interest REAL,
      volume_24h REAL,
      next_funding_ts INTEGER,
      fetched_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rates_ex_sym_ts ON funding_rates(exchange, symbol, fetched_at);
    CREATE INDEX IF NOT EXISTS idx_rates_fetched ON funding_rates(fetched_at);

    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      long_ex TEXT NOT NULL,
      short_ex TEXT NOT NULL,
      spread_pct REAL NOT NULL,
      net_annualized REAL NOT NULL,
      risk_score INTEGER,
      capacity_usd REAL,
      detected_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_opps_sym_ts ON opportunities(symbol, detected_at);

    CREATE TABLE IF NOT EXISTS anomalies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      exchange TEXT NOT NULL,
      type TEXT NOT NULL,
      severity INTEGER,
      current_rate REAL,
      baseline_rate REAL,
      z_score REAL,
      description TEXT,
      detected_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_anom_ts ON anomalies(detected_at);

    CREATE TABLE IF NOT EXISTS paper_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      direction TEXT NOT NULL,
      spread_pct REAL,
      entry_ts INTEGER NOT NULL,
      exit_ts INTEGER,
      entry_price_long REAL,
      entry_price_short REAL,
      exit_price_long REAL,
      exit_price_short REAL,
      pnl_pct REAL,
      status TEXT DEFAULT 'OPEN',
      close_reason TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_trades_status ON paper_trades(status);

    CREATE TABLE IF NOT EXISTS backtest_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      strategy TEXT NOT NULL,
      symbol TEXT,
      start_ts INTEGER,
      end_ts INTEGER,
      total_return REAL,
      sharpe REAL,
      max_drawdown REAL,
      win_rate REAL,
      trade_count INTEGER,
      params TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
  `);
}

export interface RateRecord {
  exchange: string; symbol: string; fundingRate: number;
  markPrice?: number; openInterest?: number; volume24h?: number;
  nextFundingTs?: number; fetchedAt: number;
}

export function insertRates(records: RateRecord[]) {
  if (!records.length) return;
  const stmt = getDb().prepare(`
    INSERT INTO funding_rates (exchange, symbol, funding_rate, mark_price, open_interest, volume_24h, next_funding_ts, fetched_at)
    VALUES (@exchange, @symbol, @fundingRate, @markPrice, @openInterest, @volume24h, @nextFundingTs, @fetchedAt)
  `);
  const tx = getDb().transaction((recs: RateRecord[]) => {
    for (const r of recs) stmt.run(r);
  });
  tx(records);
}

export function insertOpportunity(o: {
  symbol: string; longEx: string; shortEx: string;
  spreadPct: number; netAnnualized: number; riskScore?: number;
  capacityUsd?: number; detectedAt: number;
}) {
  getDb().prepare(`
    INSERT INTO opportunities (symbol, long_ex, short_ex, spread_pct, net_annualized, risk_score, capacity_usd, detected_at)
    VALUES (@symbol, @longEx, @shortEx, @spreadPct, @netAnnualized, @riskScore, @capacityUsd, @detectedAt)
  `).run(o);
}

export function getRateHistory(exchange: string, symbol: string, hours = 24): RateRecord[] {
  const since = Date.now() - hours * 3600000;
  return getDb().prepare(`
    SELECT * FROM funding_rates
    WHERE exchange = ? AND symbol = ? AND fetched_at > ?
    ORDER BY fetched_at ASC
  `).all(exchange, symbol, since) as RateRecord[];
}

export function getLatestRates(symbol: string): RateRecord[] {
  return getDb().prepare(`
    SELECT fr.* FROM funding_rates fr
    INNER JOIN (
      SELECT exchange, MAX(fetched_at) as max_ts
      FROM funding_rates WHERE symbol = ?
      GROUP BY exchange
    ) latest ON fr.exchange = latest.exchange AND fr.fetched_at = latest.max_ts
    WHERE fr.symbol = ?
  `).all(symbol, symbol) as RateRecord[];
}

export function getTopOpportunities(limit = 20, hours = 24): any[] {
  const since = Date.now() - hours * 3600000;
  return getDb().prepare(`
    SELECT symbol, long_ex, short_ex,
           AVG(spread_pct) as avg_spread,
           AVG(net_annualized) as avg_net,
           MAX(net_annualized) as max_net,
           COUNT(*) as occurrence_count,
           AVG(risk_score) as avg_risk
    FROM opportunities
    WHERE detected_at > ?
    GROUP BY symbol, long_ex, short_ex
    ORDER BY avg_net DESC
    LIMIT ?
  `).all(since, limit);
}

export function getAnomalySummary(hours = 24): any[] {
  const since = Date.now() - hours * 3600000;
  return getDb().prepare(`
    SELECT symbol, type, COUNT(*) as count, MAX(severity) as max_severity,
           AVG(z_score) as avg_zscore
    FROM anomalies
    WHERE detected_at > ?
    GROUP BY symbol, type
    ORDER BY max_severity DESC
  `).all(since);
}

export function getDbStats(): { rates: number; opportunities: number; anomalies: number; trades: number; oldestRate: number } {
  const rates = (getDb().prepare('SELECT COUNT(*) as c FROM funding_rates').get() as any).c;
  const opps = (getDb().prepare('SELECT COUNT(*) as c FROM opportunities').get() as any).c;
  const anom = (getDb().prepare('SELECT COUNT(*) as c FROM anomalies').get() as any).c;
  const trades = (getDb().prepare('SELECT COUNT(*) as c FROM paper_trades').get() as any).c;
  const oldest = getDb().prepare('SELECT MIN(fetched_at) as ts FROM funding_rates').get() as any;
  return { rates, opportunities: opps, anomalies: anom, trades, oldestRate: oldest?.ts || 0 };
}
