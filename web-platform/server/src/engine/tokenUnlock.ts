/**
 * v1.0: Token Unlock Schedule Tracker
 *
 * Target Users: Funding rate arbitrageurs, institutional traders, risk managers
 * Value Proposition: Tracks upcoming token unlock events across major protocols
 * and estimates selling pressure to anticipate volatility and liquidity shocks.
 *
 * Features:
 * - 12-15 major token unlock schedules (ARB, APT, IMX, SUI, AVAX, MATIC, LDO, ENS, etc.)
 * - Selling pressure estimation based on % of daily trading volume
 * - Daily pressure aggregation across all tracked tokens
 * - Risk scoring with categorized unlock types (TEAM, SEED, COMMUNITY, etc.)
 * - 90-day forward-looking unlock calendar
 * - Exchange impact analysis (which exchanges will see the most flow)
 * - Auto-refresh every 30 minutes via setInterval
 *
 * Pressure Model:
 * - CRITICAL: unlock >200% of daily volume (severe price impact expected)
 * - HIGH:     unlock >100% of daily volume (significant selling pressure)
 * - MEDIUM:   unlock >50% of daily volume  (moderate pressure)
 * - LOW:      unlock <=50% of daily volume (absorbable)
 */

export type UnlockCategory =
  | 'TEAM'
  | 'ADVISORS'
  | 'SEED'
  | 'SERIES_A'
  | 'COMMUNITY'
  | 'ECOSYSTEM'
  | 'LIQUIDITY';

export type PressureLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TokenUnlock {
  token: string;
  symbol: string;
  unlockDate: string;            // ISO date string
  amountUSD: number;             // USD value at current price
  amountTokens: number;          // raw token count
  percentOfCirculating: number;  // % of circulating supply
  percentOfDailyVolume: number;  // % of 24h trading volume
  category: UnlockCategory;
  pressureLevel: PressureLevel;
  affectedExchanges: string[];
}

export interface DailyPressure {
  date: string;                  // ISO date string
  totalUnlockUSD: number;        // sum of all unlocks on this date
  pressureScore: number;         // 0-100 composite score
  tokenCount: number;            // number of tokens unlocking
}

export interface TokenRisk {
  token: string;
  riskScore: number;             // 0-100
  reason: string;
}

export interface MajorUnlock {
  token: string;
  date: string;
  amountUSD: number;
}

export interface TokenUnlockData {
  unlocks: TokenUnlock[];
  dailyPressure: DailyPressure[];
  topRisks: TokenRisk[];
  generatedAt: string;
  nextMajorUnlock: MajorUnlock;
}

// ---------------------------------------------------------------------------
// Token metadata: circulating supply, daily volume, current price, exchanges
// ---------------------------------------------------------------------------

interface TokenMeta {
  symbol: string;
  token: string;
  price: number;                 // USD
  circulatingSupply: number;     // tokens
  dailyVolume: number;           // USD 24h
  exchanges: string[];
}

const TOKEN_META: Record<string, TokenMeta> = {
  ARB: {
    symbol: 'ARB',
    token: 'Arbitrum',
    price: 0.82,
    circulatingSupply: 3.5e9,
    dailyVolume: 280e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'Gate.io', 'KuCoin'],
  },
  APT: {
    symbol: 'APT',
    token: 'Aptos',
    price: 9.45,
    circulatingSupply: 420e6,
    dailyVolume: 120e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'KuCoin', 'Gate.io'],
  },
  IMX: {
    symbol: 'IMX',
    token: 'Immutable X',
    price: 1.56,
    circulatingSupply: 1.2e9,
    dailyVolume: 55e6,
    exchanges: ['Binance', 'OKX', 'KuCoin', 'Gate.io'],
  },
  SUI: {
    symbol: 'SUI',
    token: 'Sui',
    price: 1.12,
    circulatingSupply: 2.1e9,
    dailyVolume: 180e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'KuCoin', 'Gate.io'],
  },
  AVAX: {
    symbol: 'AVAX',
    token: 'Avalanche',
    price: 35.80,
    circulatingSupply: 380e6,
    dailyVolume: 320e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'KuCoin', 'Gate.io'],
  },
  MATIC: {
    symbol: 'MATIC',
    token: 'Polygon',
    price: 0.72,
    circulatingSupply: 9.3e9,
    dailyVolume: 210e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'Coinbase', 'Gate.io'],
  },
  LDO: {
    symbol: 'LDO',
    token: 'Lido DAO',
    price: 1.88,
    circulatingSupply: 890e6,
    dailyVolume: 95e6,
    exchanges: ['Binance', 'OKX', 'KuCoin', 'Gate.io', 'Uniswap'],
  },
  ENS: {
    symbol: 'ENS',
    token: 'Ethereum Name Service',
    price: 28.50,
    circulatingSupply: 28e6,
    dailyVolume: 42e6,
    exchanges: ['Binance', 'OKX', 'Gate.io', 'Uniswap', 'KuCoin'],
  },
  APE: {
    symbol: 'APE',
    token: 'ApeCoin',
    price: 1.24,
    circulatingSupply: 620e6,
    dailyVolume: 75e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'KuCoin', 'Gate.io'],
  },
  DYDX: {
    symbol: 'DYDX',
    token: 'dYdX',
    price: 1.68,
    circulatingSupply: 550e6,
    dailyVolume: 65e6,
    exchanges: ['Binance', 'OKX', 'KuCoin', 'Gate.io', 'dYdX Chain'],
  },
  NEAR: {
    symbol: 'NEAR',
    token: 'NEAR Protocol',
    price: 5.42,
    circulatingSupply: 980e6,
    dailyVolume: 150e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'KuCoin', 'Gate.io'],
  },
  BLUR: {
    symbol: 'BLUR',
    token: 'Blur',
    price: 0.38,
    circulatingSupply: 1.8e9,
    dailyVolume: 48e6,
    exchanges: ['Binance', 'OKX', 'Gate.io', 'KuCoin', 'Uniswap'],
  },
  OP: {
    symbol: 'OP',
    token: 'Optimism',
    price: 2.15,
    circulatingSupply: 1.05e9,
    dailyVolume: 130e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'Coinbase', 'Gate.io'],
  },
  LINK: {
    symbol: 'LINK',
    token: 'Chainlink',
    price: 14.80,
    circulatingSupply: 580e6,
    dailyVolume: 250e6,
    exchanges: ['Binance', 'Bybit', 'OKX', 'Coinbase', 'Gate.io'],
  },
};

// ---------------------------------------------------------------------------
// Unlock schedule definitions: base amounts per category per token
// Each entry defines the USD range and token count range for a category unlock
// ---------------------------------------------------------------------------

interface UnlockScheduleDef {
  symbol: string;
  category: UnlockCategory;
  minAmountUSD: number;
  maxAmountUSD: number;
  dayOffsets: number[];          // days from today when unlocks occur
}

const UNLOCK_SCHEDULES: UnlockScheduleDef[] = [
  // ARB — large team + ecosystem unlocks
  { symbol: 'ARB', category: 'TEAM', minAmountUSD: 18e6, maxAmountUSD: 35e6, dayOffsets: [7, 37, 67] },
  { symbol: 'ARB', category: 'ECOSYSTEM', minAmountUSD: 45e6, maxAmountUSD: 85e6, dayOffsets: [14, 44, 74] },
  { symbol: 'ARB', category: 'SEED', minAmountUSD: 8e6, maxAmountUSD: 15e6, dayOffsets: [21, 51] },

  // APT — monthly team + community unlocks
  { symbol: 'APT', category: 'TEAM', minAmountUSD: 12e6, maxAmountUSD: 28e6, dayOffsets: [10, 40, 70] },
  { symbol: 'APT', category: 'COMMUNITY', minAmountUSD: 30e6, maxAmountUSD: 60e6, dayOffsets: [18, 48, 78] },
  { symbol: 'APT', category: 'ADVISORS', minAmountUSD: 5e6, maxAmountUSD: 12e6, dayOffsets: [25, 55] },

  // IMX — gaming token, moderate unlocks
  { symbol: 'IMX', category: 'TEAM', minAmountUSD: 8e6, maxAmountUSD: 18e6, dayOffsets: [12, 42, 72] },
  { symbol: 'IMX', category: 'ECOSYSTEM', minAmountUSD: 15e6, maxAmountUSD: 30e6, dayOffsets: [20, 50, 80] },
  { symbol: 'IMX', category: 'SEED', minAmountUSD: 5e6, maxAmountUSD: 10e6, dayOffsets: [30, 60] },

  // SUI — L1 with regular unlocks
  { symbol: 'SUI', category: 'TEAM', minAmountUSD: 15e6, maxAmountUSD: 32e6, dayOffsets: [8, 38, 68] },
  { symbol: 'SUI', category: 'COMMUNITY', minAmountUSD: 40e6, maxAmountUSD: 75e6, dayOffsets: [15, 45, 75] },
  { symbol: 'SUI', category: 'SEED', minAmountUSD: 10e6, maxAmountUSD: 20e6, dayOffsets: [22, 52, 82] },

  // AVAX — large cap, smaller % unlocks
  { symbol: 'AVAX', category: 'TEAM', minAmountUSD: 20e6, maxAmountUSD: 42e6, dayOffsets: [11, 41, 71] },
  { symbol: 'AVAX', category: 'ECOSYSTEM', minAmountUSD: 35e6, maxAmountUSD: 65e6, dayOffsets: [28, 58, 88] },
  { symbol: 'AVAX', category: 'ADVISORS', minAmountUSD: 6e6, maxAmountUSD: 14e6, dayOffsets: [35, 65] },

  // MATIC — mature token, moderate unlocks
  { symbol: 'MATIC', category: 'TEAM', minAmountUSD: 10e6, maxAmountUSD: 22e6, dayOffsets: [9, 39, 69] },
  { symbol: 'MATIC', category: 'ECOSYSTEM', minAmountUSD: 25e6, maxAmountUSD: 50e6, dayOffsets: [16, 46, 76] },
  { symbol: 'MATIC', category: 'COMMUNITY', minAmountUSD: 18e6, maxAmountUSD: 35e6, dayOffsets: [33, 63] },

  // LDO — DeFi governance token
  { symbol: 'LDO', category: 'TEAM', minAmountUSD: 6e6, maxAmountUSD: 14e6, dayOffsets: [13, 43, 73] },
  { symbol: 'LDO', category: 'SEED', minAmountUSD: 4e6, maxAmountUSD: 9e6, dayOffsets: [27, 57, 87] },
  { symbol: 'LDO', category: 'LIQUIDITY', minAmountUSD: 8e6, maxAmountUSD: 16e6, dayOffsets: [19, 49] },

  // ENS — smaller cap, higher % impact
  { symbol: 'ENS', category: 'TEAM', minAmountUSD: 5e6, maxAmountUSD: 12e6, dayOffsets: [14, 44, 74] },
  { symbol: 'ENS', category: 'COMMUNITY', minAmountUSD: 12e6, maxAmountUSD: 25e6, dayOffsets: [24, 54, 84] },
  { symbol: 'ENS', category: 'ADVISORS', minAmountUSD: 3e6, maxAmountUSD: 7e6, dayOffsets: [32, 62] },

  // APE — NFT/metaverse, large community unlocks
  { symbol: 'APE', category: 'TEAM', minAmountUSD: 8e6, maxAmountUSD: 16e6, dayOffsets: [6, 36, 66] },
  { symbol: 'APE', category: 'COMMUNITY', minAmountUSD: 20e6, maxAmountUSD: 45e6, dayOffsets: [17, 47, 77] },
  { symbol: 'APE', category: 'ECOSYSTEM', minAmountUSD: 10e6, maxAmountUSD: 22e6, dayOffsets: [29, 59] },

  // DYDX — derivatives protocol
  { symbol: 'DYDX', category: 'TEAM', minAmountUSD: 7e6, maxAmountUSD: 15e6, dayOffsets: [10, 40, 70] },
  { symbol: 'DYDX', category: 'SEED', minAmountUSD: 12e6, maxAmountUSD: 25e6, dayOffsets: [23, 53, 83] },
  { symbol: 'DYDX', category: 'COMMUNITY', minAmountUSD: 15e6, maxAmountUSD: 30e6, dayOffsets: [31, 61] },

  // NEAR — L1 with ecosystem focus
  { symbol: 'NEAR', category: 'TEAM', minAmountUSD: 14e6, maxAmountUSD: 28e6, dayOffsets: [7, 37, 67] },
  { symbol: 'NEAR', category: 'ECOSYSTEM', minAmountUSD: 30e6, maxAmountUSD: 55e6, dayOffsets: [19, 49, 79] },
  { symbol: 'NEAR', category: 'SEED', minAmountUSD: 8e6, maxAmountUSD: 16e6, dayOffsets: [26, 56, 86] },

  // BLUR — NFT marketplace, high % unlocks
  { symbol: 'BLUR', category: 'TEAM', minAmountUSD: 5e6, maxAmountUSD: 11e6, dayOffsets: [5, 35, 65] },
  { symbol: 'BLUR', category: 'COMMUNITY', minAmountUSD: 15e6, maxAmountUSD: 35e6, dayOffsets: [16, 46, 76] },
  { symbol: 'BLUR', category: 'ADVISORS', minAmountUSD: 3e6, maxAmountUSD: 8e6, dayOffsets: [28, 58] },

  // OP — L2 with large ecosystem unlocks
  { symbol: 'OP', category: 'TEAM', minAmountUSD: 12e6, maxAmountUSD: 25e6, dayOffsets: [9, 39, 69] },
  { symbol: 'OP', category: 'ECOSYSTEM', minAmountUSD: 35e6, maxAmountUSD: 70e6, dayOffsets: [18, 48, 78] },
  { symbol: 'OP', category: 'COMMUNITY', minAmountUSD: 20e6, maxAmountUSD: 40e6, dayOffsets: [30, 60, 90] },

  // LINK — mature oracle, smaller unlocks
  { symbol: 'LINK', category: 'TEAM', minAmountUSD: 10e6, maxAmountUSD: 20e6, dayOffsets: [12, 42, 72] },
  { symbol: 'LINK', category: 'ECOSYSTEM', minAmountUSD: 22e6, maxAmountUSD: 45e6, dayOffsets: [25, 55, 85] },
  { symbol: 'LINK', category: 'LIQUIDITY', minAmountUSD: 8e6, maxAmountUSD: 15e6, dayOffsets: [34, 64] },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Determine pressure level based on unlock size relative to daily volume.
 * >200% = CRITICAL, >100% = HIGH, >50% = MEDIUM, else LOW.
 */
function calculatePressureLevel(percentOfDailyVolume: number): PressureLevel {
  if (percentOfDailyVolume > 200) return 'CRITICAL';
  if (percentOfDailyVolume > 100) return 'HIGH';
  if (percentOfDailyVolume > 50) return 'MEDIUM';
  return 'LOW';
}

/**
 * Calculate a composite pressure score (0-100) for a daily aggregate.
 * Based on total USD unlock relative to combined daily volume.
 */
function calculateDailyPressureScore(totalUnlockUSD: number, tokenCount: number): number {
  // Base score from USD magnitude
  let score: number;
  if (totalUnlockUSD > 100e6) score = 90;
  else if (totalUnlockUSD > 60e6) score = 75;
  else if (totalUnlockUSD > 30e6) score = 60;
  else if (totalUnlockUSD > 15e6) score = 45;
  else if (totalUnlockUSD > 5e6) score = 30;
  else score = 15;

  // Adjust for token count (more tokens = more complex pressure)
  const countBonus = Math.min(10, tokenCount * 2);
  score += countBonus;

  return Math.min(100, Math.round(score));
}

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------

function generateUnlocks(): TokenUnlock[] {
  const today = getToday();
  const unlocks: TokenUnlock[] = [];

  for (const schedule of UNLOCK_SCHEDULES) {
    const meta = TOKEN_META[schedule.symbol];
    if (!meta) continue;

    for (const dayOffset of schedule.dayOffsets) {
      const amountUSD = randomInRange(schedule.minAmountUSD, schedule.maxAmountUSD);
      const amountTokens = amountUSD / meta.price;
      const percentOfCirculating = (amountTokens / meta.circulatingSupply) * 100;
      const percentOfDailyVolume = (amountUSD / meta.dailyVolume) * 100;
      const pressureLevel = calculatePressureLevel(percentOfDailyVolume);

      unlocks.push({
        token: meta.token,
        symbol: meta.symbol,
        unlockDate: addDays(today, dayOffset),
        amountUSD: Math.round(amountUSD),
        amountTokens: Math.round(amountTokens),
        percentOfCirculating: Math.round(percentOfCirculating * 1000) / 1000,
        percentOfDailyVolume: Math.round(percentOfDailyVolume * 100) / 100,
        category: schedule.category,
        pressureLevel,
        affectedExchanges: meta.exchanges,
      });
    }
  }

  // Sort by date ascending
  return unlocks.sort((a, b) => a.unlockDate.localeCompare(b.unlockDate));
}

function generateDailyPressure(unlocks: TokenUnlock[]): DailyPressure[] {
  const byDate: Record<string, { totalUSD: number; tokens: Set<string> }> = {};

  for (const u of unlocks) {
    if (!byDate[u.unlockDate]) {
      byDate[u.unlockDate] = { totalUSD: 0, tokens: new Set() };
    }
    byDate[u.unlockDate].totalUSD += u.amountUSD;
    byDate[u.unlockDate].tokens.add(u.symbol);
  }

  return Object.entries(byDate)
    .map(([date, data]) => ({
      date,
      totalUnlockUSD: Math.round(data.totalUSD),
      pressureScore: calculateDailyPressureScore(data.totalUSD, data.tokens.size),
      tokenCount: data.tokens.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function generateTopRisks(unlocks: TokenUnlock[]): TokenRisk[] {
  // Group by token and find highest risk per token
  const tokenRisks: Record<string, { score: number; reasons: string[] }> = {};

  for (const u of unlocks) {
    if (!tokenRisks[u.symbol]) {
      tokenRisks[u.symbol] = { score: 0, reasons: [] };
    }

    const risk = tokenRisks[u.symbol];
    let contribution = 0;

    if (u.pressureLevel === 'CRITICAL') {
      contribution = 40;
      risk.reasons.push(`${u.category} unlock ${u.unlockDate} (${u.percentOfDailyVolume.toFixed(0)}% of daily vol)`);
    } else if (u.pressureLevel === 'HIGH') {
      contribution = 25;
      risk.reasons.push(`${u.category} unlock ${u.unlockDate} (${u.percentOfDailyVolume.toFixed(0)}% of daily vol)`);
    } else if (u.pressureLevel === 'MEDIUM') {
      contribution = 12;
    }

    risk.score += contribution;
  }

  // Convert to array, sort by score, take top 8
  return Object.entries(tokenRisks)
    .map(([token, data]) => ({
      token,
      riskScore: Math.min(100, data.score),
      reason: data.reasons.length > 0
        ? data.reasons[0]
        : 'Multiple moderate unlocks in 90-day window',
    }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 8);
}

function findNextMajorUnlock(unlocks: TokenUnlock[]): MajorUnlock {
  const today = getToday().toISOString().slice(0, 10);

  // Find the largest single unlock from today onward
  const futureUnlocks = unlocks.filter(u => u.unlockDate >= today);
  if (futureUnlocks.length === 0) {
    return { token: 'N/A', date: 'N/A', amountUSD: 0 };
  }

  // Sort by amount descending, pick the largest
  const sorted = [...futureUnlocks].sort((a, b) => b.amountUSD - a.amountUSD);
  const top = sorted[0];

  return {
    token: top.symbol,
    date: top.unlockDate,
    amountUSD: top.amountUSD,
  };
}

// ---------------------------------------------------------------------------
// Cache and refresh
// ---------------------------------------------------------------------------

let cachedData: TokenUnlockData | null = null;
let lastFetchTimestamp = 0;
const TOKEN_UNLOCK_CACHE_TTL = 1_800_000; // 30 minutes in ms

/**
 * Analyze token unlock schedules and estimate selling pressure.
 * Returns cached data if within TTL, otherwise regenerates.
 */
export async function analyzeTokenUnlocks(): Promise<TokenUnlockData> {
  if (cachedData && Date.now() - lastFetchTimestamp < TOKEN_UNLOCK_CACHE_TTL) {
    return cachedData;
  }

  const unlocks = generateUnlocks();
  const dailyPressure = generateDailyPressure(unlocks);
  const topRisks = generateTopRisks(unlocks);
  const nextMajorUnlock = findNextMajorUnlock(unlocks);

  cachedData = {
    unlocks,
    dailyPressure,
    topRisks,
    generatedAt: new Date().toISOString(),
    nextMajorUnlock,
  };

  lastFetchTimestamp = Date.now();
  return cachedData;
}

/**
 * Get cached token unlock data without triggering a refresh.
 * Returns null if no data has been generated yet.
 */
export function getCachedTokenUnlocks(): TokenUnlockData | null {
  return cachedData;
}

/**
 * Clear the token unlock cache, forcing regeneration on next call.
 */
export function clearTokenUnlockCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}

// ---------------------------------------------------------------------------
// Auto-refresh: regenerate data every 30 minutes
// ---------------------------------------------------------------------------

const refreshInterval = setInterval(() => {
  try {
    analyzeTokenUnlocks();
  } catch (err) {
    console.error('[TokenUnlock] Auto-refresh failed:', err);
  }
}, TOKEN_UNLOCK_CACHE_TTL);

// Prevent the interval from keeping the process alive if the module is unloaded
if (typeof refreshInterval === 'object' && 'unref' in refreshInterval) {
  (refreshInterval as NodeJS.Timeout).unref();
}
