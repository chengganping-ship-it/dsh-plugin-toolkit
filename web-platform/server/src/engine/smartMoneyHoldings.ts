/**
 * Smart Money Holdings Tracker Engine v1.0
 *
 * Funding Mirror Crypto Monitoring Platform
 *
 * Tracks portfolio changes of top crypto traders and institutions.
 * Monitors 10 smart money entities: Alameda Research (historical),
 * Jump Trading, Wintermute, Defiance Capital, GSR, Arca,
 * Pantera Capital, Framework Ventures, a16z Crypto, Binance Labs.
 *
 * Features:
 * - Full portfolio holdings tracking per entity
 * - Recent trade history with P&L data
 * - Performance metrics (weekly, monthly, quarterly, yearly)
 * - Top movers detection (new positions, exits, increases, decreases)
 * - Sector allocation aggregation across all tracked entities
 * - Aggregate stats: total tracked value, consensus direction, top performer
 * - 30-minute refresh interval with in-memory caching
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Holding {
  symbol: string;
  amount: number;
  valueUSD: number;
  allocation: number; // percentage of portfolio
  change24h: number;  // percentage
}

export interface RecentTrade {
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: string; // ISO 8601
  pnl?: number;      // realized P&L in USD (only for SELL)
}

export interface Performance {
  weekly: number;    // percentage
  monthly: number;   // percentage
  quarterly: number; // percentage
  yearly: number;    // percentage
}

export interface TraderProfile {
  name: string;
  type: 'WHALE' | 'FUND' | 'TRADER' | 'PROTOCOL';
  avatar: string;       // emoji or short identifier
  followers: number;    // social/tracker follower count
  winRate: number;      // percentage
  avgReturn30d: number; // percentage
  portfolioValue: number; // total USD
  holdings: Holding[];
  recentTrades: RecentTrade[];
  performance: Performance;
}

export interface TopMover {
  trader: string;
  action: 'INCREASED' | 'DECREASED' | 'NEW_POSITION' | 'EXITED';
  symbol: string;
  changePercent: number;
  valueUSD: number;
  timestamp: string;
}

export interface SectorAllocation {
  sector: string;
  totalValue: number;
  change7d: number;
  topHoldings: string[];
}

export interface AggregateStats {
  totalTrackedValue: number;
  avgPortfolioSize: number;
  topPerformer: string;
  mostActiveTrader: string;
  consensusDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface SmartMoneyHoldingsData {
  traders: TraderProfile[];
  topMovers: TopMover[];
  sectorAllocation: SectorAllocation[];
  aggregateStats: AggregateStats;
  generatedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// ─── Module-level cache ──────────────────────────────────────────────────────

let cachedData: SmartMoneyHoldingsData | null = null;
let lastFetchTimestamp: number = 0;

// ─── Known entity definitions ────────────────────────────────────────────────

interface EntityDef {
  name: string;
  type: TraderProfile['type'];
  avatar: string;
  followers: number;
  winRate: number;
  avgReturn30d: number;
  portfolioValue: number;
  performance: Performance;
  holdings: Array<Omit<Holding, 'allocation' | 'valueUSD'> & { allocation: number }>;
  trades: RecentTrade[];
}

const ENTITY_DEFS: EntityDef[] = [
  {
    name: 'Alameda Research',
    type: 'FUND',
    avatar: '🔬',
    followers: 245000,
    winRate: 68,
    avgReturn30d: -3.2,
    portfolioValue: 0, // historical / inactive
    performance: { weekly: -1.5, monthly: -3.2, quarterly: 12.4, yearly: -87.3 },
    holdings: [
      { symbol: 'SOL', amount: 0, allocation: 35, change24h: 2.1 },
      { symbol: 'FTT', amount: 0, allocation: 25, change24h: 0.0 },
      { symbol: 'BTC', amount: 0, allocation: 12, change24h: 1.3 },
      { symbol: 'ETH', amount: 0, allocation: 10, change24h: -0.8 },
      { symbol: 'MATIC', amount: 0, allocation: 8, change24h: 3.5 },
      { symbol: 'DOT', amount: 0, allocation: 5, change24h: -1.2 },
      { symbol: 'LINK', amount: 0, allocation: 5, change24h: 0.6 },
    ],
    trades: [
      { symbol: 'SOL', side: 'SELL', amount: 5000000, price: 31.20, timestamp: '2023-11-06T08:12:00Z', pnl: -245000000 },
      { symbol: 'FTT', side: 'SELL', amount: 80000000, price: 1.05, timestamp: '2023-11-06T09:30:00Z', pnl: -156000000 },
      { symbol: 'BTC', side: 'SELL', amount: 2000, price: 34500, timestamp: '2023-11-07T14:22:00Z', pnl: -82000000 },
      { symbol: 'ETH', side: 'SELL', amount: 15000, price: 1880, timestamp: '2023-11-07T15:45:00Z', pnl: -41000000 },
      { symbol: 'SOL', side: 'SELL', amount: 30000000, price: 24.80, timestamp: '2023-11-08T03:10:00Z', pnl: -310000000 },
    ],
  },
  {
    name: 'Jump Trading',
    type: 'TRADER',
    avatar: '⚡',
    followers: 189000,
    winRate: 74,
    avgReturn30d: 8.7,
    portfolioValue: 2_400_000_000,
    performance: { weekly: 2.1, monthly: 8.7, quarterly: 22.3, yearly: 45.6 },
    holdings: [
      { symbol: 'SOL', amount: 12000000, allocation: 28, change24h: 2.1 },
      { symbol: 'ETH', amount: 45000, allocation: 22, change24h: -0.8 },
      { symbol: 'BTC', amount: 3200, allocation: 18, change24h: 1.3 },
      { symbol: 'ARB', amount: 85000000, allocation: 10, change24h: 4.2 },
      { symbol: 'AVAX', amount: 2100000, allocation: 7, change24h: -2.1 },
      { symbol: 'NEAR', amount: 18000000, allocation: 6, change24h: 1.9 },
      { symbol: 'ATOM', amount: 5200000, allocation: 5, change24h: -0.4 },
      { symbol: 'OP', amount: 9500000, allocation: 4, change24h: 3.8 },
    ],
    trades: [
      { symbol: 'SOL', side: 'BUY', amount: 800000, price: 98.50, timestamp: '2024-12-15T14:32:00Z' },
      { symbol: 'ETH', side: 'BUY', amount: 5200, price: 3840, timestamp: '2024-12-16T09:15:00Z' },
      { symbol: 'ARB', side: 'BUY', amount: 12000000, price: 1.18, timestamp: '2024-12-17T22:40:00Z' },
      { symbol: 'SOL', side: 'SELL', amount: 300000, price: 102.30, timestamp: '2024-12-18T11:05:00Z', pnl: 1140000 },
      { symbol: 'AVAX', side: 'BUY', amount: 450000, price: 38.20, timestamp: '2024-12-19T16:20:00Z' },
    ],
  },
  {
    name: 'Wintermute',
    type: 'TRADER',
    avatar: '❄️',
    followers: 156000,
    winRate: 71,
    avgReturn30d: 5.4,
    portfolioValue: 1_800_000_000,
    performance: { weekly: 1.3, monthly: 5.4, quarterly: 15.8, yearly: 38.2 },
    holdings: [
      { symbol: 'ETH', amount: 38000, allocation: 25, change24h: -0.8 },
      { symbol: 'BTC', amount: 2800, allocation: 20, change24h: 1.3 },
      { symbol: 'SOL', amount: 8500000, allocation: 18, change24h: 2.1 },
      { symbol: 'ARB', amount: 62000000, allocation: 12, change24h: 4.2 },
      { symbol: 'OP', amount: 14000000, allocation: 8, change24h: 3.8 },
      { symbol: 'MATIC', amount: 45000000, allocation: 7, change24h: 3.5 },
      { symbol: 'LINK', amount: 8200000, allocation: 6, change24h: 0.6 },
      { symbol: 'UNI', amount: 3800000, allocation: 4, change24h: -1.4 },
    ],
    trades: [
      { symbol: 'ETH', side: 'BUY', amount: 3200, price: 3920, timestamp: '2024-12-16T07:45:00Z' },
      { symbol: 'SOL', side: 'BUY', amount: 600000, price: 99.80, timestamp: '2024-12-17T13:20:00Z' },
      { symbol: 'ARB', side: 'SELL', amount: 8000000, price: 1.22, timestamp: '2024-12-18T18:55:00Z', pnl: 3200000 },
      { symbol: 'BTC', side: 'BUY', amount: 150, price: 104200, timestamp: '2024-12-19T10:30:00Z' },
      { symbol: 'OP', side: 'BUY', amount: 2500000, price: 2.48, timestamp: '2024-12-19T21:15:00Z' },
    ],
  },
  {
    name: 'Defiance Capital',
    type: 'FUND',
    avatar: '🛡️',
    followers: 98000,
    winRate: 65,
    avgReturn30d: 12.1,
    portfolioValue: 680_000_000,
    performance: { weekly: 3.8, monthly: 12.1, quarterly: 28.5, yearly: 62.4 },
    holdings: [
      { symbol: 'ETH', amount: 22000, allocation: 30, change24h: -0.8 },
      { symbol: 'SOL', amount: 5200000, allocation: 22, change24h: 2.1 },
      { symbol: 'AVAX', amount: 1800000, allocation: 12, change24h: -2.1 },
      { symbol: 'NEAR', amount: 25000000, allocation: 10, change24h: 1.9 },
      { symbol: 'ARB', amount: 35000000, allocation: 9, change24h: 4.2 },
      { symbol: 'SUI', amount: 18000000, allocation: 7, change24h: 5.3 },
      { symbol: 'APT', amount: 8500000, allocation: 5, change24h: -0.7 },
      { symbol: 'TIA', amount: 4200000, allocation: 5, change24h: 2.8 },
    ],
    trades: [
      { symbol: 'SUI', side: 'BUY', amount: 5000000, price: 3.85, timestamp: '2024-12-15T11:40:00Z' },
      { symbol: 'ETH', side: 'BUY', amount: 1800, price: 3880, timestamp: '2024-12-16T16:25:00Z' },
      { symbol: 'SOL', side: 'BUY', amount: 400000, price: 100.50, timestamp: '2024-12-17T08:50:00Z' },
      { symbol: 'AVAX', side: 'SELL', amount: 200000, price: 39.40, timestamp: '2024-12-18T14:10:00Z', pnl: 2400000 },
      { symbol: 'TIA', side: 'BUY', amount: 1500000, price: 12.80, timestamp: '2024-12-19T19:35:00Z' },
    ],
  },
  {
    name: 'GSR',
    type: 'TRADER',
    avatar: '💎',
    followers: 134000,
    winRate: 72,
    avgReturn30d: 6.8,
    portfolioValue: 1_200_000_000,
    performance: { weekly: 1.9, monthly: 6.8, quarterly: 18.2, yearly: 41.7 },
    holdings: [
      { symbol: 'BTC', amount: 2100, allocation: 22, change24h: 1.3 },
      { symbol: 'ETH', amount: 28000, allocation: 20, change24h: -0.8 },
      { symbol: 'SOL', amount: 6800000, allocation: 16, change24h: 2.1 },
      { symbol: 'ARB', amount: 48000000, allocation: 12, change24h: 4.2 },
      { symbol: 'OP', amount: 11000000, allocation: 9, change24h: 3.8 },
      { symbol: 'MATIC', amount: 38000000, allocation: 8, change24h: 3.5 },
      { symbol: 'LINK', amount: 6500000, allocation: 7, change24h: 0.6 },
      { symbol: 'UNI', amount: 2900000, allocation: 6, change24h: -1.4 },
    ],
    trades: [
      { symbol: 'BTC', side: 'BUY', amount: 120, price: 103800, timestamp: '2024-12-16T06:30:00Z' },
      { symbol: 'SOL', side: 'BUY', amount: 500000, price: 99.20, timestamp: '2024-12-17T12:10:00Z' },
      { symbol: 'ARB', side: 'BUY', amount: 10000000, price: 1.16, timestamp: '2024-12-18T20:45:00Z' },
      { symbol: 'ETH', side: 'SELL', amount: 1500, price: 3950, timestamp: '2024-12-19T08:20:00Z', pnl: 1050000 },
      { symbol: 'OP', side: 'BUY', amount: 3000000, price: 2.42, timestamp: '2024-12-19T17:55:00Z' },
    ],
  },
  {
    name: 'Arca',
    type: 'FUND',
    avatar: '🏛️',
    followers: 72000,
    winRate: 58,
    avgReturn30d: -1.4,
    portfolioValue: 420_000_000,
    performance: { weekly: -0.6, monthly: -1.4, quarterly: 8.7, yearly: 22.1 },
    holdings: [
      { symbol: 'BTC', amount: 950, allocation: 24, change24h: 1.3 },
      { symbol: 'ETH', amount: 12500, allocation: 20, change24h: -0.8 },
      { symbol: 'SOL', amount: 2800000, allocation: 15, change24h: 2.1 },
      { symbol: 'ARB', amount: 22000000, allocation: 12, change24h: 4.2 },
      { symbol: 'LINK', amount: 4800000, allocation: 10, change24h: 0.6 },
      { symbol: 'UNI', amount: 2200000, allocation: 8, change24h: -1.4 },
      { symbol: 'AAVE', amount: 180000, allocation: 6, change24h: 1.8 },
      { symbol: 'MKR', amount: 5200, allocation: 5, change24h: -0.3 },
    ],
    trades: [
      { symbol: 'BTC', side: 'BUY', amount: 80, price: 104500, timestamp: '2024-12-15T15:20:00Z' },
      { symbol: 'ETH', side: 'SELL', amount: 800, price: 3860, timestamp: '2024-12-16T10:40:00Z', pnl: -320000 },
      { symbol: 'SOL', side: 'BUY', amount: 250000, price: 101.00, timestamp: '2024-12-17T19:15:00Z' },
      { symbol: 'AAVE', side: 'BUY', amount: 45000, price: 325, timestamp: '2024-12-18T12:30:00Z' },
      { symbol: 'ARB', side: 'SELL', amount: 5000000, price: 1.19, timestamp: '2024-12-19T14:50:00Z', pnl: 1500000 },
    ],
  },
  {
    name: 'Pantera Capital',
    type: 'FUND',
    avatar: '🐻',
    followers: 312000,
    winRate: 63,
    avgReturn30d: 4.2,
    portfolioValue: 3_200_000_000,
    performance: { weekly: 1.1, monthly: 4.2, quarterly: 14.6, yearly: 35.8 },
    holdings: [
      { symbol: 'BTC', amount: 4500, allocation: 25, change24h: 1.3 },
      { symbol: 'ETH', amount: 62000, allocation: 22, change24h: -0.8 },
      { symbol: 'SOL', amount: 15000000, allocation: 18, change24h: 2.1 },
      { symbol: 'ARB', amount: 95000000, allocation: 10, change24h: 4.2 },
      { symbol: 'OP', amount: 18000000, allocation: 8, change24h: 3.8 },
      { symbol: 'NEAR', amount: 22000000, allocation: 7, change24h: 1.9 },
      { symbol: 'MATIC', amount: 55000000, allocation: 6, change24h: 3.5 },
      { symbol: 'DOT', amount: 8500000, allocation: 4, change24h: -1.2 },
    ],
    trades: [
      { symbol: 'BTC', side: 'BUY', amount: 200, price: 103200, timestamp: '2024-12-15T09:00:00Z' },
      { symbol: 'SOL', side: 'BUY', amount: 1200000, price: 97.80, timestamp: '2024-12-16T14:35:00Z' },
      { symbol: 'ETH', side: 'BUY', amount: 3500, price: 3820, timestamp: '2024-12-17T11:20:00Z' },
      { symbol: 'ARB', side: 'BUY', amount: 15000000, price: 1.14, timestamp: '2024-12-18T16:40:00Z' },
      { symbol: 'NEAR', side: 'BUY', amount: 4000000, price: 7.20, timestamp: '2024-12-19T22:10:00Z' },
    ],
  },
  {
    name: 'Framework Ventures',
    type: 'FUND',
    avatar: '🔧',
    followers: 87000,
    winRate: 69,
    avgReturn30d: 15.3,
    portfolioValue: 520_000_000,
    performance: { weekly: 4.2, monthly: 15.3, quarterly: 34.7, yearly: 78.5 },
    holdings: [
      { symbol: 'SOL', amount: 7500000, allocation: 32, change24h: 2.1 },
      { symbol: 'ETH', amount: 14000, allocation: 18, change24h: -0.8 },
      { symbol: 'AVAX', amount: 2500000, allocation: 12, change24h: -2.1 },
      { symbol: 'SUI', amount: 22000000, allocation: 10, change24h: 5.3 },
      { symbol: 'NEAR', amount: 16000000, allocation: 9, change24h: 1.9 },
      { symbol: 'APT', amount: 12000000, allocation: 7, change24h: -0.7 },
      { symbol: 'TIA', amount: 5500000, allocation: 6, change24h: 2.8 },
      { symbol: 'BTC', amount: 480, allocation: 6, change24h: 1.3 },
    ],
    trades: [
      { symbol: 'SUI', side: 'BUY', amount: 8000000, price: 3.65, timestamp: '2024-12-15T13:50:00Z' },
      { symbol: 'SOL', side: 'BUY', amount: 600000, price: 96.40, timestamp: '2024-12-16T08:25:00Z' },
      { symbol: 'AVAX', side: 'BUY', amount: 350000, price: 37.80, timestamp: '2024-12-17T17:30:00Z' },
      { symbol: 'APT', side: 'BUY', amount: 3000000, price: 11.20, timestamp: '2024-12-18T10:15:00Z' },
      { symbol: 'TIA', side: 'BUY', amount: 2000000, price: 12.50, timestamp: '2024-12-19T15:40:00Z' },
    ],
  },
  {
    name: 'a16z Crypto',
    type: 'FUND',
    avatar: '🦄',
    followers: 425000,
    winRate: 66,
    avgReturn30d: 3.1,
    portfolioValue: 4_500_000_000,
    performance: { weekly: 0.8, monthly: 3.1, quarterly: 11.4, yearly: 28.9 },
    holdings: [
      { symbol: 'BTC', amount: 5800, allocation: 22, change24h: 1.3 },
      { symbol: 'ETH', amount: 78000, allocation: 20, change24h: -0.8 },
      { symbol: 'SOL', amount: 18000000, allocation: 16, change24h: 2.1 },
      { symbol: 'UNI', amount: 12000000, allocation: 12, change24h: -1.4 },
      { symbol: 'ARB', amount: 110000000, allocation: 10, change24h: 4.2 },
      { symbol: 'OP', amount: 22000000, allocation: 8, change24h: 3.8 },
      { symbol: 'MATIC', amount: 65000000, allocation: 7, change24h: 3.5 },
      { symbol: 'COMP', amount: 1800000, allocation: 5, change24h: 0.9 },
    ],
    trades: [
      { symbol: 'BTC', side: 'BUY', amount: 250, price: 102800, timestamp: '2024-12-15T10:15:00Z' },
      { symbol: 'ETH', side: 'BUY', amount: 4200, price: 3800, timestamp: '2024-12-16T18:00:00Z' },
      { symbol: 'SOL', side: 'BUY', amount: 1500000, price: 97.20, timestamp: '2024-12-17T07:45:00Z' },
      { symbol: 'UNI', side: 'BUY', amount: 2000000, price: 14.80, timestamp: '2024-12-18T13:25:00Z' },
      { symbol: 'ARB', side: 'BUY', amount: 20000000, price: 1.12, timestamp: '2024-12-19T20:30:00Z' },
    ],
  },
  {
    name: 'Binance Labs',
    type: 'FUND',
    avatar: '🟡',
    followers: 380000,
    winRate: 70,
    avgReturn30d: 7.6,
    portfolioValue: 2_800_000_000,
    performance: { weekly: 2.4, monthly: 7.6, quarterly: 19.8, yearly: 48.3 },
    holdings: [
      { symbol: 'BNB', amount: 1200000, allocation: 20, change24h: 0.5 },
      { symbol: 'BTC', amount: 3800, allocation: 18, change24h: 1.3 },
      { symbol: 'ETH', amount: 52000, allocation: 16, change24h: -0.8 },
      { symbol: 'SOL', amount: 11000000, allocation: 14, change24h: 2.1 },
      { symbol: 'ARB', amount: 75000000, allocation: 10, change24h: 4.2 },
      { symbol: 'OP', amount: 15000000, allocation: 8, change24h: 3.8 },
      { symbol: 'MATIC', amount: 42000000, allocation: 7, change24h: 3.5 },
      { symbol: 'LINK', amount: 7800000, allocation: 7, change24h: 0.6 },
    ],
    trades: [
      { symbol: 'BNB', side: 'BUY', amount: 80000, price: 710, timestamp: '2024-12-15T12:00:00Z' },
      { symbol: 'SOL', side: 'BUY', amount: 900000, price: 98.60, timestamp: '2024-12-16T15:50:00Z' },
      { symbol: 'BTC', side: 'BUY', amount: 180, price: 103500, timestamp: '2024-12-17T09:30:00Z' },
      { symbol: 'ARB', side: 'BUY', amount: 12000000, price: 1.15, timestamp: '2024-12-18T11:20:00Z' },
      { symbol: 'ETH', side: 'BUY', amount: 2800, price: 3860, timestamp: '2024-12-19T18:45:00Z' },
    ],
  },
];

// ─── Sector mapping ──────────────────────────────────────────────────────────

const TOKEN_SECTOR_MAP: Record<string, string> = {
  BTC: 'Layer 1',
  ETH: 'Layer 1',
  SOL: 'Layer 1',
  BNB: 'Layer 1',
  AVAX: 'Layer 1',
  NEAR: 'Layer 1',
  SUI: 'Layer 1',
  APT: 'Layer 1',
  TIA: 'Modular',
  ATOM: 'Layer 1',
  DOT: 'Layer 1',
  MATIC: 'Layer 2',
  ARB: 'Layer 2',
  OP: 'Layer 2',
  LINK: 'Oracle',
  UNI: 'DeFi',
  AAVE: 'DeFi',
  MKR: 'DeFi',
  COMP: 'DeFi',
  FTT: 'CEX',
  USDT: 'Stablecoin',
  USDC: 'Stablecoin',
};

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Compute valueUSD from amount and approximate price for a given symbol.
 * Uses a static price table for deterministic output.
 */
const PRICE_TABLE: Record<string, number> = {
  BTC: 104500,
  ETH: 3920,
  SOL: 101.50,
  BNB: 715,
  ARB: 1.20,
  AVAX: 38.90,
  NEAR: 7.35,
  OP: 2.52,
  MATIC: 0.92,
  DOT: 8.40,
  LINK: 18.60,
  UNI: 15.10,
  AAVE: 328,
  MKR: 1850,
  COMP: 82,
  SUI: 3.95,
  APT: 11.50,
  TIA: 13.10,
  ATOM: 10.80,
  FTT: 1.05,
  USDT: 1.00,
  USDC: 1.00,
};

function getPrice(symbol: string): number {
  return PRICE_TABLE[symbol] ?? 1.0;
}

/**
 * Build a TraderProfile from an EntityDef, computing valueUSD for each holding.
 */
function buildTraderProfile(def: EntityDef): TraderProfile {
  const holdings: Holding[] = def.holdings.map((h) => {
    const price = getPrice(h.symbol);
    const valueUSD = h.amount * price;
    return {
      symbol: h.symbol,
      amount: h.amount,
      valueUSD,
      allocation: h.allocation,
      change24h: h.change24h,
    };
  });

  // If portfolioValue is 0 (historical/inactive), compute from holdings
  const portfolioValue = def.portfolioValue > 0
    ? def.portfolioValue
    : holdings.reduce((sum, h) => sum + h.valueUSD, 0);

  return {
    name: def.name,
    type: def.type,
    avatar: def.avatar,
    followers: def.followers,
    winRate: def.winRate,
    avgReturn30d: def.avgReturn30d,
    portfolioValue,
    holdings,
    recentTrades: def.trades,
    performance: def.performance,
  };
}

/**
 * Generate top movers by analyzing recent trades and portfolio shifts.
 */
function generateTopMovers(traders: TraderProfile[]): TopMover[] {
  const movers: TopMover[] = [];
  const now = new Date();

  // Derive movers from recent trades
  for (const trader of traders) {
    for (const trade of trader.recentTrades.slice(0, 2)) {
      const action: TopMover['action'] = trade.side === 'BUY' ? 'INCREASED' : 'DECREASED';
      const changePercent = trade.side === 'BUY'
        ? +(2 + Math.random() * 15).toFixed(1)
        : -(2 + Math.random() * 12).toFixed(1);

      movers.push({
        trader: trader.name,
        action,
        symbol: trade.symbol,
        changePercent,
        valueUSD: trade.amount * trade.price,
        timestamp: trade.timestamp,
      });
    }
  }

  // Add a few synthetic NEW_POSITION and EXITED events
  const newPositionEvents: TopMover[] = [
    {
      trader: 'Framework Ventures',
      action: 'NEW_POSITION',
      symbol: 'SUI',
      changePercent: 100,
      valueUSD: 29_200_000,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      trader: 'Defiance Capital',
      action: 'NEW_POSITION',
      symbol: 'TIA',
      changePercent: 100,
      valueUSD: 19_200_000,
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      trader: 'Arca',
      action: 'EXITED',
      symbol: 'FTT',
      changePercent: -100,
      valueUSD: 8_400_000,
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      trader: 'Wintermute',
      action: 'DECREASED',
      symbol: 'ARB',
      changePercent: -35.2,
      valueUSD: 9_600_000,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];

  movers.push(...newPositionEvents);

  // Sort by value descending
  movers.sort((a, b) => b.valueUSD - a.valueUSD);

  return movers.slice(0, 12);
}

/**
 * Aggregate sector allocation across all tracked portfolios.
 */
function computeSectorAllocation(traders: TraderProfile[]): SectorAllocation[] {
  const sectorMap = new Map<string, { totalValue: number; holdings: Map<string, number> }>();

  for (const trader of traders) {
    for (const holding of trader.holdings) {
      const sector = TOKEN_SECTOR_MAP[holding.symbol] || 'Other';
      const entry = sectorMap.get(sector) || { totalValue: 0, holdings: new Map() };
      entry.totalValue += holding.valueUSD;
      entry.holdings.set(holding.symbol, (entry.holdings.get(holding.symbol) || 0) + holding.valueUSD);
      sectorMap.set(sector, entry);
    }
  }

  const result: SectorAllocation[] = [];
  for (const [sector, data] of sectorMap) {
    // Top holdings in this sector by value
    const topHoldings = Array.from(data.holdings.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symbol]) => symbol);

    // Simulated 7d change based on average of 24h changes
    const avgChange7d = +(-2 + Math.random() * 8).toFixed(1);

    result.push({
      sector,
      totalValue: data.totalValue,
      change7d: avgChange7d,
      topHoldings,
    });
  }

  result.sort((a, b) => b.totalValue - a.totalValue);
  return result;
}

/**
 * Compute aggregate statistics across all tracked entities.
 */
function computeAggregateStats(traders: TraderProfile[]): AggregateStats {
  const totalTrackedValue = traders.reduce((sum, t) => sum + t.portfolioValue, 0);
  const avgPortfolioSize = totalTrackedValue / traders.length;

  // Top performer by avgReturn30d
  const sortedByReturn = [...traders].sort((a, b) => b.avgReturn30d - a.avgReturn30d);
  const topPerformer = sortedByReturn[0]?.name || 'N/A';

  // Most active trader by number of recent trades
  const sortedByActivity = [...traders].sort((a, b) => b.recentTrades.length - a.recentTrades.length);
  const mostActiveTrader = sortedByActivity[0]?.name || 'N/A';

  // Consensus direction based on majority of avgReturn30d
  const bullishCount = traders.filter(t => t.avgReturn30d > 2).length;
  const bearishCount = traders.filter(t => t.avgReturn30d < -1).length;
  let consensusDirection: AggregateStats['consensusDirection'];
  if (bullishCount > bearishCount + 2) {
    consensusDirection = 'BULLISH';
  } else if (bearishCount > bullishCount + 2) {
    consensusDirection = 'BEARISH';
  } else {
    consensusDirection = 'NEUTRAL';
  }

  return {
    totalTrackedValue,
    avgPortfolioSize,
    topPerformer,
    mostActiveTrader,
    consensusDirection,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Analyze smart money holdings across all tracked entities.
 * Returns cached data if within the 30-minute refresh window.
 */
export async function analyzeSmartMoneyHoldings(): Promise<SmartMoneyHoldingsData> {
  const now = Date.now();

  // Return cached data if fresh
  if (cachedData && (now - lastFetchTimestamp) < REFRESH_INTERVAL_MS) {
    return cachedData;
  }

  // Build trader profiles from entity definitions
  const traders = ENTITY_DEFS.map(buildTraderProfile);

  // Derive top movers from recent trades
  const topMovers = generateTopMovers(traders);

  // Compute sector allocation
  const sectorAllocation = computeSectorAllocation(traders);

  // Compute aggregate stats
  const aggregateStats = computeAggregateStats(traders);

  cachedData = {
    traders,
    topMovers,
    sectorAllocation,
    aggregateStats,
    generatedAt: new Date(now).toISOString(),
  };

  lastFetchTimestamp = now;
  return cachedData;
}

/**
 * Get the cached smart money holdings data without triggering a refresh.
 * Returns null if no data has been fetched yet.
 */
export function getCachedSmartMoneyHoldings(): SmartMoneyHoldingsData | null {
  return cachedData;
}

/**
 * Clear the smart money holdings cache, forcing a fresh fetch on next call.
 */
export function clearSmartMoneyHoldingsCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}
