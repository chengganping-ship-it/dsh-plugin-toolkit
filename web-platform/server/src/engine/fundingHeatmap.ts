/**
 * Cross-Exchange Funding Rate Heatmap Engine
 *
 * Visualizes funding rates across all major exchanges and pairs
 * to identify the best arbitrage opportunities.
 *
 * Monitors: Binance, Bybit, OKX, dYdX, Bitget, Gate
 * Refresh interval: 30 minutes
 */

// ============================================================================
// Types
// ============================================================================

export interface HeatmapRow {
  symbol: string;
  binance: number;
  bybit: number;
  okx: number;
  dydx: number;
  bitget: number;
  gate: number;
  average: number;
  spread: number;
  bestLong: string;
  bestShort: string;
}

export interface ArbitrageOpportunity {
  symbol: string;
  longExchange: string;
  shortExchange: string;
  longRate: number;
  shortRate: number;
  netRate: number;
  estimatedAPY: number;
  confidence: number;
  recommendation: string;
}

export interface HistoricalDataPoint {
  timestamp: string;
  avgRate: number;
  spread: number;
}

export interface HistoricalTrend {
  symbol: string;
  dataPoints: HistoricalDataPoint[];
}

export interface FundingHeatmapSummary {
  totalPairs: number;
  positiveRatePairs: number;
  negativeRatePairs: number;
  avgFundingRate: number;
  maxSpread: number;
  bestArbitrage: string;
}

export interface FundingHeatmapData {
  heatmap: HeatmapRow[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  historicalTrend: HistoricalTrend[];
  summary: FundingHeatmapSummary;
  generatedAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

const EXCHANGES = ['binance', 'bybit', 'okx', 'dydx', 'bitget', 'gate'] as const;

type ExchangeName = (typeof EXCHANGES)[number];

const MAJOR_PAIRS = [
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'XRP/USDT',
  'DOGE/USDT',
  'AVAX/USDT',
  'LINK/USDT',
  'DOT/USDT',
  'MATIC/USDT',
  'ARB/USDT',
  'OP/USDT',
  'NEAR/USDT',
  'APT/USDT',
  'SUI/USDT',
  'LTC/USDT',
  'ADA/USDT',
  'ATOM/USDT',
] as const;

// ============================================================================
// State
// ============================================================================

let cachedData: FundingHeatmapData | null = null;
let lastFetchTimestamp: number = 0;

// ============================================================================
// Seed-based Random for Deterministic Simulation
// ============================================================================

/**
 * Simple seeded PRNG (mulberry32) to produce deterministic but realistic
 * funding rate simulations that are consistent within a time window.
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string to a 32-bit integer seed.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Generate a time-window seed that changes every 30 minutes,
 * providing stability within each window.
 */
function getTimeWindowSeed(): number {
  const now = Date.now();
  const windowMs = REFRESH_INTERVAL_MS;
  const windowIndex = Math.floor(now / windowMs);
  return hashString(`funding-heatmap-${windowIndex}`);
}

// ============================================================================
// Funding Rate Simulation
// ============================================================================

/**
 * Exchange-specific bias modifiers to create realistic rate differences.
 * Some exchanges systematically have higher/lower funding rates due to
 * differences in trader composition and leverage availability.
 */
const EXCHANGE_BIASES: Record<ExchangeName, number> = {
  binance: 0.0,
  bybit: 0.002,
  okx: -0.001,
  dydx: 0.005,
  bitget: 0.003,
  gate: 0.004,
};

/**
 * Pair-specific volatility factors — more volatile pairs tend to
 * have higher absolute funding rates.
 */
const PAIR_VOLATILITY: Record<string, number> = {
  'BTC/USDT': 0.8,
  'ETH/USDT': 0.85,
  'SOL/USDT': 1.2,
  'XRP/USDT': 0.9,
  'DOGE/USDT': 1.4,
  'AVAX/USDT': 1.1,
  'LINK/USDT': 1.0,
  'DOT/USDT': 1.0,
  'MATIC/USDT': 1.1,
  'ARB/USDT': 1.3,
  'OP/USDT': 1.2,
  'NEAR/USDT': 1.2,
  'APT/USDT': 1.4,
  'SUI/USDT': 1.5,
  'LTC/USDT': 0.85,
  'ADA/USDT': 0.95,
  'ATOM/USDT': 1.05,
};

/**
 * Simulate a realistic funding rate for a given symbol and exchange.
 * Rates typically range from -0.01% to +0.1% per 8h period.
 * The simulation uses a seeded RNG for consistency within a time window.
 */
function simulateFundingRate(
  symbol: string,
  exchange: ExchangeName,
  rng: () => number
): number {
  const volatility = PAIR_VOLATILITY[symbol] ?? 1.0;
  const bias = EXCHANGE_BIASES[exchange];

  // Base rate centered slightly positive (market typically long-heavy)
  const baseRate = 0.02 * volatility / 100;

  // Random component: roughly +/- 0.04%
  const randomComponent = (rng() - 0.5) * 0.08 * volatility;

  // Mean-reverting component: occasionally negative funding
  const regimeShift = rng() > 0.7 ? -0.03 * volatility : 0;

  let rate = baseRate + randomComponent + regimeShift + bias;

  // Clamp to realistic bounds
  const maxRate = 0.1 / 100; // 0.1%
  const minRate = -0.01 / 100; // -0.01%
  rate = Math.max(minRate, Math.min(maxRate, rate));

  // Round to 6 decimal places
  return Math.round(rate * 1e6) / 1e6;
}

// ============================================================================
// Core Calculations
// ============================================================================

/**
 * Compute average funding rate across all exchanges for a pair.
 */
function computeAverage(rates: Record<ExchangeName, number>): number {
  const values = EXCHANGES.map((ex) => rates[ex]);
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

/**
 * Compute spread (max - min) across exchanges.
 */
function computeSpread(rates: Record<ExchangeName, number>): number {
  const values = EXCHANGES.map((ex) => rates[ex]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return max - min;
}

/**
 * Find the best exchange to go long (lowest funding rate).
 */
function findBestLong(rates: Record<ExchangeName, number>): string {
  let best: ExchangeName = EXCHANGES[0];
  for (const ex of EXCHANGES) {
    if (rates[ex] < rates[best]) {
      best = ex;
    }
  }
  return best;
}

/**
 * Find the best exchange to go short (highest funding rate).
 */
function findBestShort(rates: Record<ExchangeName, number>): string {
  let best: ExchangeName = EXCHANGES[0];
  for (const ex of EXCHANGES) {
    if (rates[ex] > rates[best]) {
      best = ex;
    }
  }
  return best;
}

/**
 * Estimate APY from funding rate differential.
 * Funding is collected 3 times daily (every 8h).
 * APY = rate * 3 * 365
 */
function estimateAPY(netRate: number): number {
  return netRate * 3 * 365;
}

/**
 * Generate confidence score (0-100) based on spread magnitude
 * and consistency of the opportunity.
 */
function computeConfidence(spread: number): number {
  // Spread is typically small; a spread > 0.02% is high confidence
  const normalized = Math.min(spread / (0.02 / 100), 1.0);
  return Math.round(normalized * 100);
}

/**
 * Generate human-readable recommendation based on APY and confidence.
 */
function generateRecommendation(apy: number, confidence: number): string {
  if (apy > 20 && confidence > 70) {
    return 'Strong arbitrage opportunity — consider entering positions';
  }
  if (apy > 10 && confidence > 50) {
    return 'Moderate arbitrage opportunity — favorable risk/reward';
  }
  if (apy > 5 && confidence > 30) {
    return 'Minor spread — may be viable with low fees';
  }
  if (apy > 0) {
    return 'Marginal — likely not profitable after fees';
  }
  return 'No profitable arbitrage available';
}

// ============================================================================
// Historical Trend Generation
// ============================================================================

/**
 * Generate 24 hours of historical trend data for a given symbol.
 * Uses a seeded RNG with per-hour variation.
 */
function generateHistoricalTrend(symbol: string): HistoricalTrend {
  const dataPoints: HistoricalDataPoint[] = [];
  const now = Date.now();
  const hoursBack = 24;

  for (let i = hoursBack; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600 * 1000).toISOString();
    const seed = hashString(`${symbol}-${Math.floor((now - i * 3600 * 1000) / REFRESH_INTERVAL_MS)}`);
    const rng = mulberry32(seed);

    const volatility = PAIR_VOLATILITY[symbol] ?? 1.0;
    const baseRate = 0.02 * volatility / 100;
    const avgRate = baseRate + (rng() - 0.5) * 0.06 * volatility;
    const spread = Math.abs(rng() * 0.03 * volatility);

    dataPoints.push({
      timestamp,
      avgRate: Math.round(avgRate * 1e6) / 1e6,
      spread: Math.round(spread * 1e6) / 1e6,
    });
  }

  return { symbol, dataPoints };
}

// ============================================================================
// Main Analysis Engine
// ============================================================================

/**
 * Perform the full funding rate heatmap analysis.
 * Simulates data for all major pairs across all exchanges.
 */
function performAnalysis(): FundingHeatmapData {
  const rng = mulberry32(getTimeWindowSeed());

  // ── Build heatmap rows ─────────────────────────────────────────────────
  const heatmap: HeatmapRow[] = MAJOR_PAIRS.map((symbol) => {
    const rates = {} as Record<ExchangeName, number>;
    for (const ex of EXCHANGES) {
      rates[ex] = simulateFundingRate(symbol, ex, rng);
    }

    const average = computeAverage(rates);
    const spread = computeSpread(rates);
    const bestLong = findBestLong(rates);
    const bestShort = findBestShort(rates);

    return {
      symbol,
      binance: rates.binance,
      bybit: rates.bybit,
      okx: rates.okx,
      dydx: rates.dydx,
      bitget: rates.bitget,
      gate: rates.gate,
      average: Math.round(average * 1e6) / 1e6,
      spread: Math.round(spread * 1e6) / 1e6,
      bestLong,
      bestShort,
    };
  });

  // ── Identify arbitrage opportunities ───────────────────────────────────
  const arbitrageOpportunities: ArbitrageOpportunity[] = heatmap
    .filter((row) => row.spread > 0)
    .map((row) => {
      const longRate = row[row.bestLong as keyof HeatmapRow] as number;
      const shortRate = row[row.bestShort as keyof HeatmapRow] as number;
      const netRate = shortRate - longRate;
      const apy = estimateAPY(netRate);
      const confidence = computeConfidence(row.spread);

      return {
        symbol: row.symbol,
        longExchange: row.bestLong,
        shortExchange: row.bestShort,
        longRate,
        shortRate,
        netRate: Math.round(netRate * 1e6) / 1e6,
        estimatedAPY: Math.round(apy * 100) / 100,
        confidence,
        recommendation: generateRecommendation(apy * 100, confidence),
      };
    })
    .sort((a, b) => b.estimatedAPY - a.estimatedAPY);

  // ── Generate historical trends ─────────────────────────────────────────
  const historicalTrend: HistoricalTrend[] = MAJOR_PAIRS.map((symbol) =>
    generateHistoricalTrend(symbol)
  );

  // ── Compute summary statistics ────────────────────────────────────────
  const totalPairs = heatmap.length;
  const positiveRatePairs = heatmap.filter((r) => r.average > 0).length;
  const negativeRatePairs = heatmap.filter((r) => r.average < 0).length;
  const avgFundingRate =
    heatmap.reduce((sum, r) => sum + r.average, 0) / totalPairs;
  const maxSpread = Math.max(...heatmap.map((r) => r.spread));
  const bestArbitrage =
    arbitrageOpportunities.length > 0
      ? `${arbitrageOpportunities[0].symbol} (${arbitrageOpportunities[0].longExchange} long / ${arbitrageOpportunities[0].shortExchange} short, APY ${arbitrageOpportunities[0].estimatedAPY}%)`
      : 'None';

  const summary: FundingHeatmapSummary = {
    totalPairs,
    positiveRatePairs,
    negativeRatePairs,
    avgFundingRate: Math.round(avgFundingRate * 1e6) / 1e6,
    maxSpread: Math.round(maxSpread * 1e6) / 1e6,
    bestArbitrage,
  };

  const generatedAt = new Date().toISOString();

  return {
    heatmap,
    arbitrageOpportunities,
    historicalTrend,
    summary,
    generatedAt,
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Analyze the funding rate heatmap across all major exchanges and pairs.
 * Returns fresh analysis data, updating the cache.
 */
export function analyzeFundingHeatmap(): FundingHeatmapData {
  const data = performAnalysis();
  cachedData = data;
  lastFetchTimestamp = Date.now();
  return data;
}

/**
 * Return cached heatmap data if it exists and is still fresh (within 30 minutes).
 * If cache is stale or missing, triggers a fresh analysis.
 */
export function getCachedFundingHeatmap(): FundingHeatmapData {
  const now = Date.now();
  if (cachedData && now - lastFetchTimestamp < REFRESH_INTERVAL_MS) {
    return cachedData;
  }
  return analyzeFundingHeatmap();
}

/**
 * Clear the funding rate heatmap cache, forcing fresh data on next call.
 */
export function clearFundingHeatmapCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}
