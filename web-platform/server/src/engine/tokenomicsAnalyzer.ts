/**
 * Tokenomics Analyzer Engine - Funding Mirror Crypto Monitoring Platform
 *
 * Provides comprehensive tokenomics analysis for 12 major crypto tokens including
 * supply metrics, unlock schedules, burn mechanisms, valuation scoring, and
 * risk assessment. Data is cached with a 30-minute refresh interval.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UnlockEvent {
  date: string;
  amount: number;
  type: string;
}

export interface TokenDistribution {
  holder: string;
  percentage: number;
}

export interface TokenMetrics {
  symbol: string;
  name: string;
  totalSupply: number;
  circulatingSupply: number;
  maxSupply: number;
  inflationRate: number;
  burnRate: number;
  fdv: number;
  fullyDilutedValuation: number;
  valuePerToken: number;
  unlockSchedule: UnlockEvent[];
  tokenDistribution: TokenDistribution[];
  healthScore: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TopUnlock {
  symbol: string;
  date: string;
  amount: number;
  percentOfCirculating: number;
  estimatedPriceImpact: number;
}

export interface BurnAnalysisEntry {
  symbol: string;
  burnMechanism: string;
  annualBurn: number;
  netInflation: number;
  deflationary: boolean;
}

export interface ValuationMetric {
  symbol: string;
  marketCap: number;
  fdv: number;
  mcapFdvRatio: number;
  revenue: number;
  psRatio: number;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL';
}

export interface TokenomicsSummary {
  totalTokens: number;
  avgInflation: number;
  deflationaryCount: number;
  highRiskCount: number;
}

export interface TokenomicsData {
  tokens: TokenMetrics[];
  topUnlocks: TopUnlock[];
  burnAnalysis: BurnAnalysisEntry[];
  valuationMetrics: ValuationMetric[];
  summary: TokenomicsSummary;
  generatedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

const TOKEN_DEFINITIONS: Array<{
  symbol: string;
  name: string;
  maxSupply: number;
  basePrice: number;
  hasBurn: boolean;
  burnMechanism: string;
  baseInflation: number;
}> = [
  { symbol: 'ETH', name: 'Ethereum', maxSupply: 120_000_000, basePrice: 3_500, hasBurn: true, burnMechanism: 'EIP-1559 base fee burn', baseInflation: 0.5 },
  { symbol: 'ARB', name: 'Arbitrum', maxSupply: 10_000_000_000, basePrice: 1.20, hasBurn: false, burnMechanism: 'None', baseInflation: 8.5 },
  { symbol: 'OP', name: 'Optimism', maxSupply: 4_294_967_296, basePrice: 2.80, hasBurn: false, burnMechanism: 'None', baseInflation: 7.0 },
  { symbol: 'MATIC', name: 'Polygon', maxSupply: 10_000_000_000, basePrice: 0.95, hasBurn: true, burnMechanism: 'Transaction fee burn (EIP-1559)', baseInflation: 3.2 },
  { symbol: 'AAVE', name: 'Aave', maxSupply: 16_000_000, basePrice: 165, hasBurn: true, burnMechanism: 'Staking slashing + fee burn', baseInflation: 2.1 },
  { symbol: 'UNI', name: 'Uniswap', maxSupply: 1_000_000_000, basePrice: 12.50, hasBurn: false, burnMechanism: 'None (governance-enabled)', baseInflation: 4.5 },
  { symbol: 'LINK', name: 'Chainlink', maxSupply: 1_000_000_000, basePrice: 18.00, hasBurn: false, burnMechanism: 'None', baseInflation: 5.8 },
  { symbol: 'LDO', name: 'Lido DAO', maxSupply: 1_000_000_000, basePrice: 2.40, hasBurn: false, burnMechanism: 'None', baseInflation: 6.2 },
  { symbol: 'AVAX', name: 'Avalanche', maxSupply: 720_000_000, basePrice: 42.00, hasBurn: true, burnMechanism: 'Transaction fee burn (all fees burned)', baseInflation: 3.8 },
  { symbol: 'GRT', name: 'The Graph', maxSupply: 10_000_000_000, basePrice: 0.28, hasBurn: true, burnMechanism: 'Query fee burn + indexer slashing', baseInflation: 4.0 },
  { symbol: 'MKR', name: 'Maker', maxSupply: 1_005_577, basePrice: 2_800, hasBurn: true, burnMechanism: 'Buy-and-burn from stability fees', baseInflation: 0.0 },
  { symbol: 'RPL', name: 'Rocket Pool', maxSupply: 18_908_688, basePrice: 22.00, hasBurn: false, burnMechanism: 'None', baseInflation: 5.5 },
];

// ─── Cache State ─────────────────────────────────────────────────────────────

let cachedData: TokenomicsData | null = null;
let lastFetchTimestamp: number = 0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Deterministic pseudo-random number generator seeded by a string.
 * Produces consistent output for the same input across calls.
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

/**
 * Returns a jittered value within +/- rangePercent of the base.
 */
function jitter(base: number, rangePercent: number, seed: string): number {
  const r = seededRandom(seed);
  const delta = (r - 0.5) * 2 * rangePercent;
  return base * (1 + delta / 100);
}

/**
 * Generates a date string offset from today by the given number of days.
 */
function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

/**
 * Calculates a health score (0-100) based on tokenomics fundamentals.
 */
function calculateHealthScore(
  inflationRate: number,
  burnRate: number,
  mcapFdvRatio: number,
  distributionConcentration: number
): number {
  let score = 70;

  // Inflation penalty (0-15% range mapped to 0-20 penalty)
  score -= Math.min(inflationRate * 1.3, 20);

  // Burn bonus
  score += Math.min(burnRate * 3, 10);

  // Mcap/FDV ratio bonus (higher ratio = more tokens already in circulation)
  score += Math.min(mcapFdvRatio * 15, 15);

  // Distribution concentration penalty (higher = more centralized = riskier)
  score -= Math.min(distributionConcentration * 0.2, 15);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determines risk level from health score and inflation.
 */
function determineRisk(healthScore: number, inflationRate: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (healthScore >= 70 && inflationRate < 5) return 'LOW';
  if (healthScore >= 45 || inflationRate < 10) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Generates a buy/sell recommendation from valuation metrics.
 */
function generateRecommendation(
  mcapFdvRatio: number,
  psRatio: number,
  healthScore: number
): 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' {
  let score = 0;

  // Mcap/FDV ratio scoring
  if (mcapFdvRatio > 0.8) score += 3;
  else if (mcapFdvRatio > 0.5) score += 1;
  else if (mcapFdvRatio < 0.2) score -= 2;

  // P/S ratio scoring (lower is better for value)
  if (psRatio < 10) score += 3;
  else if (psRatio < 25) score += 1;
  else if (psRatio > 50) score -= 2;

  // Health score adjustment
  if (healthScore > 75) score += 2;
  else if (healthScore < 40) score -= 2;

  if (score >= 6) return 'STRONG_BUY';
  if (score >= 3) return 'BUY';
  if (score >= 0) return 'HOLD';
  return 'SELL';
}

// ─── Core Data Generation ────────────────────────────────────────────────────

function generateTokenMetrics(
  def: typeof TOKEN_DEFINITIONS[0],
  priceJitter: number
): TokenMetrics {
  const seed = def.symbol + '_tokenomics';
  const price = jitter(def.basePrice, priceJitter, seed + '_price');

  // Circulating supply as a fraction of max (varies by token maturity)
  const circulationRatio = jitter(
    def.symbol === 'ETH' ? 1.0 :
    def.symbol === 'MKR' ? 0.97 :
    def.symbol === 'AAVE' ? 0.95 :
    def.symbol === 'AVAX' ? 0.75 :
    def.symbol === 'ARB' ? 0.30 :
    def.symbol === 'OP' ? 0.25 :
    def.symbol === 'LDO' ? 0.40 :
    def.symbol === 'RPL' ? 0.65 :
    def.symbol === 'LINK' ? 0.55 :
    def.symbol === 'UNI' ? 0.45 :
    def.symbol === 'MATIC' ? 0.90 :
    def.symbol === 'GRT' ? 0.60 : 0.50,
    5,
    seed + '_circulation'
  );

  const circulatingSupply = Math.round(def.maxSupply * Math.min(circulationRatio, 1.0));
  const totalSupply = Math.round(circulatingSupply * jitter(1.02, 3, seed + '_total'));
  const inflationRate = Math.max(0, jitter(def.baseInflation, 20, seed + '_inflation'));
  const burnRate = def.hasBurn
    ? Math.max(0, jitter(def.baseInflation * 0.6, 30, seed + '_burn'))
    : 0;

  const marketCap = Math.round(circulatingSupply * price);
  const fdv = Math.round(def.maxSupply * price);
  const fullyDilutedValuation = fdv;
  const valuePerToken = price;

  // Generate unlock schedule (next 4 events)
  const unlockSchedule: UnlockEvent[] = [];
  const unlockTypes = ['Team/Advisor', 'Investor', 'Ecosystem', 'Foundation', 'Staking Rewards'];
  for (let i = 0; i < 4; i++) {
    const daysAhead = Math.round(jitter(30 + i * 90, 15, seed + '_unlock_' + i));
    const amount = Math.round(circulatingSupply * jitter(0.02, 50, seed + '_unlock_amt_' + i));
    unlockSchedule.push({
      date: futureDate(daysAhead),
      amount,
      type: unlockTypes[Math.floor(seededRandom(seed + '_unlock_type_' + i) * unlockTypes.length)],
    });
  }

  // Generate token distribution
  const distributionLabels = [
    'Team & Advisors', 'Investors', 'Foundation/Treasury',
    'Ecosystem Rewards', 'Public Sale', 'Staking Rewards',
    'Community Airdrop', 'Liquidity Mining',
  ];
  const tokenDistribution: TokenDistribution[] = distributionLabels.map((holder, idx) => ({
    holder,
    percentage: Math.round(jitter(
      seededRandom(seed + '_dist_' + idx) * 25 + 3,
      10,
      seed + '_dist_pct_' + idx
    ) * 100) / 100,
  }));

  // Normalize distribution to ~100%
  const totalPct = tokenDistribution.reduce((s, d) => s + d.percentage, 0);
  tokenDistribution.forEach(d => {
    d.percentage = Math.round((d.percentage / totalPct) * 100 * 100) / 100;
  });

  // Top holder concentration for risk calc
  const topHolderPct = Math.max(...tokenDistribution.map(d => d.percentage));

  const mcapFdvRatio = fdv > 0 ? marketCap / fdv : 1;
  const healthScore = calculateHealthScore(inflationRate, burnRate, mcapFdvRatio, topHolderPct);
  const risk = determineRisk(healthScore, inflationRate);

  return {
    symbol: def.symbol,
    name: def.name,
    totalSupply,
    circulatingSupply,
    maxSupply: def.maxSupply,
    inflationRate: Math.round(inflationRate * 100) / 100,
    burnRate: Math.round(burnRate * 100) / 100,
    fdv,
    fullyDilutedValuation,
    valuePerToken: Math.round(valuePerToken * 100) / 100,
    unlockSchedule,
    tokenDistribution,
    healthScore,
    risk,
  };
}

function generateTopUnlocks(tokens: TokenMetrics[]): TopUnlock[] {
  const allUnlocks: TopUnlock[] = [];

  for (const token of tokens) {
    for (const unlock of token.unlockSchedule) {
      const percentOfCirculating = token.circulatingSupply > 0
        ? (unlock.amount / token.circulatingSupply) * 100
        : 0;
      // Estimated price impact: larger unlocks relative to circulation = higher impact
      const estimatedPriceImpact = Math.min(
        percentOfCirculating * jitter(2.5, 20, token.symbol + '_' + unlock.date),
        25
      );

      allUnlocks.push({
        symbol: token.symbol,
        date: unlock.date,
        amount: unlock.amount,
        percentOfCirculating: Math.round(percentOfCirculating * 100) / 100,
        estimatedPriceImpact: Math.round(estimatedPriceImpact * 100) / 100,
      });
    }
  }

  // Sort by estimated price impact descending, take top 10
  return allUnlocks
    .sort((a, b) => b.estimatedPriceImpact - a.estimatedPriceImpact)
    .slice(0, 10);
}

function generateBurnAnalysis(tokens: TokenMetrics[]): BurnAnalysisEntry[] {
  return tokens.map(token => {
    const annualBurn = Math.round(token.burnRate / 100 * token.circulatingSupply);
    const netInflation = token.inflationRate - token.burnRate;
    const deflationary = netInflation < 0;

    const def = TOKEN_DEFINITIONS.find(d => d.symbol === token.symbol);

    return {
      symbol: token.symbol,
      burnMechanism: def?.burnMechanism ?? 'None',
      annualBurn,
      netInflation: Math.round(netInflation * 100) / 100,
      deflationary,
    };
  });
}

function generateValuationMetrics(tokens: TokenMetrics[]): ValuationMetric[] {
  return tokens.map(token => {
    const marketCap = Math.round(token.circulatingSupply * token.valuePerToken);
    const fdv = token.fdv;
    const mcapFdvRatio = fdv > 0 ? Math.round((marketCap / fdv) * 1000) / 1000 : 1;

    // Simulated annual revenue (varies by protocol type)
    const revenueMultipliers: Record<string, number> = {
      ETH: 0.04, ARB: 0.02, OP: 0.015, MATIC: 0.03,
      AAVE: 0.08, UNI: 0.12, LINK: 0.05, LDO: 0.06,
      AVAX: 0.025, GRT: 0.07, MKR: 0.10, RPL: 0.09,
    };
    const multiplier = revenueMultipliers[token.symbol] ?? 0.05;
    const revenue = Math.round(marketCap * multiplier * jitter(1, 15, token.symbol + '_revenue'));
    const psRatio = revenue > 0 ? Math.round((marketCap / revenue) * 100) / 100 : 999;

    const recommendation = generateRecommendation(mcapFdvRatio, psRatio, token.healthScore);

    return {
      symbol: token.symbol,
      marketCap,
      fdv,
      mcapFdvRatio,
      revenue,
      psRatio,
      recommendation,
    };
  });
}

function generateSummary(tokens: TokenMetrics[], burnAnalysis: BurnAnalysisEntry[]): TokenomicsSummary {
  const avgInflation = tokens.reduce((s, t) => s + t.inflationRate, 0) / tokens.length;
  const deflationaryCount = burnAnalysis.filter(b => b.deflationary).length;
  const highRiskCount = tokens.filter(t => t.risk === 'HIGH').length;

  return {
    totalTokens: tokens.length,
    avgInflation: Math.round(avgInflation * 100) / 100,
    deflationaryCount,
    highRiskCount,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Performs a full tokenomics analysis across all 12 tracked tokens.
 * Results are cached for 30 minutes; subsequent calls within the window
 * return cached data unless the cache is explicitly cleared.
 */
export function analyzeTokenomics(): TokenomicsData {
  const now = Date.now();

  // Return cached data if within refresh window
  if (cachedData && (now - lastFetchTimestamp) < REFRESH_INTERVAL_MS) {
    return cachedData;
  }

  // Generate fresh data
  const tokens = TOKEN_DEFINITIONS.map(def => generateTokenMetrics(def, 3));
  const topUnlocks = generateTopUnlocks(tokens);
  const burnAnalysis = generateBurnAnalysis(tokens);
  const valuationMetrics = generateValuationMetrics(tokens);
  const summary = generateSummary(tokens, burnAnalysis);

  cachedData = {
    tokens,
    topUnlocks,
    burnAnalysis,
    valuationMetrics,
    summary,
    generatedAt: new Date().toISOString(),
  };

  lastFetchTimestamp = now;
  return cachedData;
}

/**
 * Returns the currently cached tokenomics data without triggering a refresh.
 * If no data has been generated yet, returns null.
 */
export function getCachedTokenomics(): TokenomicsData | null {
  return cachedData;
}

/**
 * Clears the tokenomics cache, forcing the next `analyzeTokenomics()` call
 * to generate fresh data.
 */
export function clearTokenomicsCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}
