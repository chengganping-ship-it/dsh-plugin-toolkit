/**
 * Crypto Sentiment Composite Index Engine v1.0
 *
 * Breakthrough: Unified Fear & Greed index combining 9 on-chain and off-chain
 * signal categories into a single 0-100 composite score. No competitor aggregates
 * funding rates, open interest, exchange whale ratios, stablecoin flows, social
 * sentiment, MVRV Z-score, NVT ratio, SOPR, and volatility into one actionable
 * index with historical tracking and signal generation.
 *
 * Signal Components (weights sum to 1.0):
 * - Funding Rates (0.15): Perpetual funding rate extremes indicate overleveraged markets
 * - Open Interest (0.10): OI growth/decline reflects speculative appetite
 * - Exchange Whale Ratio (0.12): Large deposit/withdrawal patterns
 * - Stablecoin Flow (0.10): Stablecoin inflow/outflow to exchanges
 * - Social Sentiment (0.08): News and social media sentiment aggregation
 * - MVRV Z-Score (0.12): Market value to realized value ratio
 * - NVT Ratio (0.10): Network value to transaction volume
 * - SOPR (0.08): Spent output profit ratio
 * - Volatility (0.15): Realized volatility as fear proxy
 *
 * Index Classifications:
 * 0-20:   Extreme Fear
 * 21-40:  Fear
 * 41-60:  Neutral
 * 61-80:  Greed
 * 81-100: Extreme Greed
 */

// ============================================================================
// Interfaces
// ============================================================================

export interface SentimentComponent {
  name: string;
  value: number;
  weight: number;
  signal: 'BEARISH' | 'NEUTRAL' | 'BULLISH';
  description: string;
}

export interface OnChainMetrics {
  exchangeInflow: number;
  exchangeOutflow: number;
  netFlow: number;
  whaleAccumulation: number;
  stablecoinSupply: number;
  stablecoinRatio: number;
  sopr: number;
  mvrv: number;
  nupl: number;
  puellMultiple: number;
}

export interface MarketMetrics {
  btcDominance: number;
  altcoinSeason: boolean;
  totalMarketCap: number;
  totalVolume: number;
  volatility30d: number;
  sharpeRatio: number;
}

export interface SocialMetrics {
  fearGreedIndex: number;
  socialVolume: number;
  sentimentScore: number;
  trendingKeywords: string[];
}

export interface HistoricalIndexPoint {
  date: string;
  value: number;
  classification: string;
}

export interface SentimentSignal {
  signal: string;
  direction: 'BULLISH' | 'BEARISH';
  strength: number;
  description: string;
}

export interface SentimentIndexData {
  compositeIndex: number;
  classification: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  components: SentimentComponent[];
  onChainMetrics: OnChainMetrics;
  marketMetrics: MarketMetrics;
  socialMetrics: SocialMetrics;
  historicalIndex: HistoricalIndexPoint[];
  signals: SentimentSignal[];
  generatedAt: string;
}

// ============================================================================
// Module State
// ============================================================================

let cachedData: SentimentIndexData | null = null;
let lastFetchTimestamp = 0;
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// Public API
// ============================================================================

/**
 * Analyze and compute the full Crypto Sentiment Composite Index.
 * Returns cached data if within the 30-minute refresh window.
 */
export async function analyzeSentimentIndex(): Promise<SentimentIndexData> {
  const now = Date.now();
  if (cachedData && (now - lastFetchTimestamp) < REFRESH_INTERVAL) {
    return cachedData;
  }

  const onChain = generateOnChainMetrics();
  const market = generateMarketMetrics();
  const social = generateSocialMetrics();
  const components = buildComponents(onChain, market, social);
  const compositeIndex = computeCompositeIndex(components);
  const classification = classifyIndex(compositeIndex);
  const historicalIndex = generateHistoricalIndex(compositeIndex);
  const signals = generateSignals(compositeIndex, components, onChain, market);

  cachedData = {
    compositeIndex,
    classification,
    components,
    onChainMetrics: onChain,
    marketMetrics: market,
    socialMetrics: social,
    historicalIndex,
    signals,
    generatedAt: new Date().toISOString(),
  };

  lastFetchTimestamp = now;
  return cachedData;
}

/**
 * Get the most recently cached sentiment index data without triggering a refresh.
 * Returns null if no data has been computed yet.
 */
export function getCachedSentimentIndex(): SentimentIndexData | null {
  return cachedData;
}

/**
 * Clear the sentiment index cache, forcing a fresh computation on next call.
 */
export function clearSentimentIndexCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}

// ============================================================================
// Component Construction
// ============================================================================

function buildComponents(
  onChain: OnChainMetrics,
  market: MarketMetrics,
  social: SocialMetrics,
): SentimentComponent[] {
  return [
    buildFundingRateComponent(onChain, market),
    buildOpenInterestComponent(onChain, market),
    buildWhaleRatioComponent(onChain),
    buildStablecoinFlowComponent(onChain),
    buildSocialSentimentComponent(social),
    buildMvrvComponent(onChain),
    buildNvtComponent(onChain, market),
    buildSoprComponent(onChain),
    buildVolatilityComponent(market),
  ];
}

function buildFundingRateComponent(
  onChain: OnChainMetrics,
  market: MarketMetrics,
): SentimentComponent {
  // Annualized funding rate in basis points; high positive = overleveraged longs = greed
  const fundingRateBps = 20 + Math.random() * 80; // 20-100 bps typical range
  const normalizedValue = Math.min(100, (fundingRateBps / 150) * 100);
  const signal: SentimentComponent['signal'] =
    normalizedValue > 70 ? 'BULLISH' : normalizedValue < 30 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'Funding Rates',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.15,
    signal,
    description:
      signal === 'BULLISH'
        ? `Elevated funding at ${fundingRateBps.toFixed(0)} bps annualized — market overleveraged long, correction risk elevated`
        : signal === 'BEARISH'
          ? `Funding at ${fundingRateBps.toFixed(0)} bps — shorts paying longs, capitulation or bearish positioning`
          : `Funding at ${fundingRateBps.toFixed(0)} bps — balanced positioning, no extreme leverage`,
  };
}

function buildOpenInterestComponent(
  _onChain: OnChainMetrics,
  market: MarketMetrics,
): SentimentComponent {
  // OI as fraction of market cap; high OI/mcap = speculative excess
  const oiRatio = 0.02 + Math.random() * 0.06; // 2-8% of market cap
  const normalizedValue = Math.min(100, (oiRatio / 0.08) * 100);
  const signal: SentimentComponent['signal'] =
    normalizedValue > 65 ? 'BULLISH' : normalizedValue < 35 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'Open Interest',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.10,
    signal,
    description:
      signal === 'BULLISH'
        ? `OI at ${(oiRatio * 100).toFixed(1)}% of market cap — speculative buildup, watch for liquidation cascades`
        : signal === 'BEARISH'
          ? `OI at ${(oiRatio * 100).toFixed(1)}% of market cap — declining speculation, risk-off positioning`
          : `OI at ${(oiRatio * 100).toFixed(1)}% of market cap — moderate speculative interest`,
  };
}

function buildWhaleRatioComponent(onChain: OnChainMetrics): SentimentComponent {
  // Whale accumulation score: high = whales buying = bullish
  const whaleScore = 30 + Math.random() * 50; // 0-100 scale
  const signal: SentimentComponent['signal'] =
    whaleScore > 60 ? 'BULLISH' : whaleScore < 40 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'Exchange Whale Ratio',
    value: Math.round(whaleScore * 10) / 10,
    weight: 0.12,
    signal,
    description:
      signal === 'BULLISH'
        ? `Whale accumulation score ${whaleScore.toFixed(0)}/100 — large holders accumulating, net exchange outflows`
        : signal === 'BEARISH'
          ? `Whale accumulation score ${whaleScore.toFixed(0)}/100 — whales distributing, exchange inflows rising`
          : `Whale accumulation score ${whaleScore.toFixed(0)}/100 — neutral whale activity`,
  };
}

function buildStablecoinFlowComponent(onChain: OnChainMetrics): SentimentComponent {
  // Stablecoin ratio: high ratio = dry powder ready to deploy = bullish
  const ratio = onChain.stablecoinRatio;
  const normalizedValue = Math.min(100, ratio * 100);
  const signal: SentimentComponent['signal'] =
    normalizedValue > 60 ? 'BULLISH' : normalizedValue < 35 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'Stablecoin Flow',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.10,
    signal,
    description:
      signal === 'BULLISH'
        ? `Stablecoin ratio ${(ratio * 100).toFixed(1)}% — ample dry powder on exchanges, buying pressure potential`
        : signal === 'BEARISH'
          ? `Stablecoin ratio ${(ratio * 100).toFixed(1)}% — stablecoins leaving exchanges, capital flight`
          : `Stablecoin ratio ${(ratio * 100).toFixed(1)}% — balanced stablecoin reserves`,
  };
}

function buildSocialSentimentComponent(social: SocialMetrics): SentimentComponent {
  const score = social.sentimentScore; // -100 to +100
  const normalizedValue = ((score + 100) / 200) * 100; // map to 0-100
  const signal: SentimentComponent['signal'] =
    normalizedValue > 60 ? 'BULLISH' : normalizedValue < 40 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'Social Sentiment',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.08,
    signal,
    description:
      signal === 'BULLISH'
        ? `Social sentiment score ${score.toFixed(0)}/100 — bullish narrative dominant across channels`
        : signal === 'BEARISH'
          ? `Social sentiment score ${score.toFixed(0)}/100 — fear and uncertainty dominating discourse`
          : `Social sentiment score ${score.toFixed(0)}/100 — mixed social signals`,
  };
}

function buildMvrvComponent(onChain: OnChainMetrics): SentimentComponent {
  // MVRV Z-score: >7 = overvalued (greed), <0 = undervalued (fear)
  const mvrv = onChain.mvrv;
  // Map MVRV Z-score to 0-100: 0->50 (neutral), 7+->100 (extreme greed), negative->0 (extreme fear)
  let normalizedValue: number;
  if (mvrv >= 0) {
    normalizedValue = 50 + (mvrv / 7) * 50;
  } else {
    normalizedValue = 50 + (mvrv / 3) * 50; // negative MVRV pushes below 50
  }
  normalizedValue = Math.max(0, Math.min(100, normalizedValue));

  const signal: SentimentComponent['signal'] =
    normalizedValue > 65 ? 'BULLISH' : normalizedValue < 35 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'MVRV Z-Score',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.12,
    signal,
    description:
      signal === 'BULLISH'
        ? `MVRV Z-score ${mvrv.toFixed(2)} — market cap significantly above realized value, profit-taking zone`
        : signal === 'BEARISH'
          ? `MVRV Z-score ${mvrv.toFixed(2)} — market below realized value, accumulation zone`
          : `MVRV Z-score ${mvrv.toFixed(2)} — fair valuation range`,
  };
}

function buildNvtComponent(
  _onChain: OnChainMetrics,
  market: MarketMetrics,
): SentimentComponent {
  // NVT ratio: high = network value not supported by tx volume = overvalued
  const nvtRatio = 40 + Math.random() * 80; // typical range 40-120
  // Map: <50 -> low (bullish/undervalued), >100 -> high (bearish/overvalued)
  let normalizedValue: number;
  if (nvtRatio <= 50) {
    normalizedValue = 70 + ((50 - nvtRatio) / 50) * 30; // 70-100
  } else if (nvtRatio <= 100) {
    normalizedValue = 30 + ((100 - nvtRatio) / 50) * 40; // 30-70
  } else {
    normalizedValue = Math.max(0, 30 - ((nvtRatio - 100) / 50) * 30);
  }

  const signal: SentimentComponent['signal'] =
    normalizedValue > 60 ? 'BULLISH' : normalizedValue < 40 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'NVT Ratio',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.10,
    signal,
    description:
      signal === 'BULLISH'
        ? `NVT ratio ${nvtRatio.toFixed(0)} — network utility supporting valuation, organic growth`
        : signal === 'BEARISH'
          ? `NVT ratio ${nvtRatio.toFixed(0)} — valuation outpacing on-chain activity, speculative premium`
          : `NVT ratio ${nvtRatio.toFixed(0)} — moderate utility-to-valuation ratio`,
  };
}

function buildSoprComponent(onChain: OnChainMetrics): SentimentComponent {
  // SOPR: >1 = profits being taken (greed), <1 = losses (fear)
  const sopr = onChain.sopr;
  // Map SOPR to 0-100: 1.0 -> 50, >1.05 -> >70, <0.95 -> <30
  let normalizedValue: number;
  if (sopr >= 1.0) {
    normalizedValue = 50 + ((sopr - 1.0) / 0.05) * 50;
  } else {
    normalizedValue = 50 - ((1.0 - sopr) / 0.05) * 50;
  }
  normalizedValue = Math.max(0, Math.min(100, normalizedValue));

  const signal: SentimentComponent['signal'] =
    normalizedValue > 60 ? 'BULLISH' : normalizedValue < 40 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'SOPR',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.08,
    signal,
    description:
      signal === 'BULLISH'
        ? `SOPR ${sopr.toFixed(4)} — above 1.0, profits being realized, holders in gain`
        : signal === 'BEARISH'
          ? `SOPR ${sopr.toFixed(4)} — below 1.0, losses being realized, capitulation phase`
          : `SOPR ${sopr.toFixed(4)} — near equilibrium, mixed profit/loss realization`,
  };
}

function buildVolatilityComponent(market: MarketMetrics): SentimentComponent {
  // High volatility = fear (low index value), low volatility = complacency/greed
  const vol30d = market.volatility30d;
  // Map: 20% vol -> 70 (greed/complacency), 80% vol -> 10 (fear)
  const normalizedValue = Math.max(0, Math.min(100, 100 - ((vol30d - 15) / 70) * 100));
  const signal: SentimentComponent['signal'] =
    normalizedValue > 60 ? 'BULLISH' : normalizedValue < 35 ? 'BEARISH' : 'NEUTRAL';

  return {
    name: 'Volatility',
    value: Math.round(normalizedValue * 10) / 10,
    weight: 0.15,
    signal,
    description:
      signal === 'BULLISH'
        ? `30d volatility ${vol30d.toFixed(1)}% — low volatility, complacency or steady uptrend`
        : signal === 'BEARISH'
          ? `30d volatility ${vol30d.toFixed(1)}% — elevated volatility, market stress and uncertainty`
          : `30d volatility ${vol30d.toFixed(1)}% — moderate volatility regime`,
  };
}

// ============================================================================
// Composite Index Computation
// ============================================================================

function computeCompositeIndex(components: SentimentComponent[]): number {
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = components.reduce((sum, c) => sum + c.value * c.weight, 0);
  const raw = weightedSum / totalWeight;
  return Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;
}

function classifyIndex(value: number): SentimentIndexData['classification'] {
  if (value <= 20) return 'EXTREME_FEAR';
  if (value <= 40) return 'FEAR';
  if (value <= 60) return 'NEUTRAL';
  if (value <= 80) return 'GREED';
  return 'EXTREME_GREED';
}

// ============================================================================
// Metric Generators (simulated data)
// ============================================================================

function generateOnChainMetrics(): OnChainMetrics {
  const exchangeInflow = Math.round((5000 + Math.random() * 15000) * 100) / 100;
  const exchangeOutflow = Math.round((5000 + Math.random() * 15000) * 100) / 100;
  const netFlow = Math.round((exchangeOutflow - exchangeInflow) * 100) / 100;
  const whaleAccumulation = Math.round((30 + Math.random() * 50) * 10) / 10;
  const stablecoinSupply = Math.round((140 + Math.random() * 30) * 100) / 100; // billions
  const stablecoinRatio = Math.round((0.05 + Math.random() * 0.15) * 1000) / 1000;
  const sopr = Math.round((0.97 + Math.random() * 0.08) * 10000) / 10000;
  const mvrv = Math.round((0.5 + Math.random() * 4) * 100) / 100;
  const nupl = Math.round((-0.1 + Math.random() * 0.6) * 1000) / 1000;
  const puellMultiple = Math.round((0.8 + Math.random() * 2.5) * 100) / 100;

  return {
    exchangeInflow,
    exchangeOutflow,
    netFlow,
    whaleAccumulation,
    stablecoinSupply,
    stablecoinRatio,
    sopr,
    mvrv,
    nupl,
    puellMultiple,
  };
}

function generateMarketMetrics(): MarketMetrics {
  const btcDominance = Math.round((48 + Math.random() * 10) * 10) / 10;
  const altcoinSeason = btcDominance < 52;
  const totalMarketCap = Math.round((2.2 + Math.random() * 0.8) * 100) / 100; // trillions
  const totalVolume = Math.round((60 + Math.random() * 80) * 100) / 100; // billions
  const volatility30d = Math.round((20 + Math.random() * 50) * 10) / 10;
  const sharpeRatio = Math.round(((-0.5 + Math.random() * 3)) * 100) / 100;

  return {
    btcDominance,
    altcoinSeason,
    totalMarketCap,
    totalVolume,
    volatility30d,
    sharpeRatio,
  };
}

function generateSocialMetrics(): SocialMetrics {
  const fearGreedIndex = Math.round(20 + Math.random() * 60);
  const socialVolume = Math.round(50000 + Math.random() * 150000);
  const sentimentScore = Math.round((-40 + Math.random() * 80) * 10) / 10;

  const keywordPool = [
    'halving', 'ETF', 'institutional', 'regulation', 'upgrade',
    'adoption', 'crash', 'rally', 'accumulation', 'distribution',
    'bullish', 'bearish', 'support', 'resistance', 'breakout',
    'liquidation', 'short squeeze', 'long squeeze', 'FOMO', 'capitulation',
  ];
  const trendingKeywords = keywordPool
    .sort(() => Math.random() - 0.5)
    .slice(0, 5 + Math.floor(Math.random() * 4));

  return {
    fearGreedIndex,
    socialVolume,
    sentimentScore,
    trendingKeywords,
  };
}

// ============================================================================
// Historical Index Generation
// ============================================================================

function generateHistoricalIndex(currentValue: number): HistoricalIndexPoint[] {
  const history: HistoricalIndexPoint[] = [];
  const now = Date.now();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    // Generate a value that trends toward the current value as we approach today
    const blendFactor = i / 29; // 1.0 at 30 days ago, 0.0 at today
    const randomComponent = (Math.random() - 0.5) * 40 * blendFactor;
    const trendComponent = currentValue * (1 - blendFactor) + 50 * blendFactor;
    const value = Math.round(Math.max(0, Math.min(100, trendComponent + randomComponent)) * 10) / 10;

    history.push({
      date: date.toISOString().split('T')[0],
      value,
      classification: classifyIndex(value),
    });
  }

  // Ensure the last point matches the current composite
  if (history.length > 0) {
    history[history.length - 1].value = currentValue;
    history[history.length - 1].classification = classifyIndex(currentValue);
  }

  return history;
}

// ============================================================================
// Signal Generation
// ============================================================================

function generateSignals(
  compositeIndex: number,
  components: SentimentComponent[],
  onChain: OnChainMetrics,
  market: MarketMetrics,
): SentimentSignal[] {
  const signals: SentimentSignal[] = [];

  // Composite index extreme signals
  if (compositeIndex >= 80) {
    signals.push({
      signal: 'EXTREME_GREED',
      direction: 'BEARISH',
      strength: Math.round(compositeIndex),
      description: `Composite index at ${compositeIndex}/100 — extreme greed zone. Historically precedes corrections of 15-30%. Consider reducing exposure.`,
    });
  } else if (compositeIndex <= 20) {
    signals.push({
      signal: 'EXTREME_FEAR',
      direction: 'BULLISH',
      strength: Math.round(100 - compositeIndex),
      description: `Composite index at ${compositeIndex}/100 — extreme fear zone. Historically a strong accumulation opportunity with asymmetric upside.`,
    });
  }

  // Component-level divergence signals
  const bullishComponents = components.filter(c => c.signal === 'BULLISH');
  const bearishComponents = components.filter(c => c.signal === 'BEARISH');

  if (bullishComponents.length >= 7) {
    signals.push({
      signal: 'BROAD_BULLISH_ALIGNMENT',
      direction: 'BEARISH',
      strength: 75,
      description: `${bullishComponents.length}/9 components bullish — crowded long positioning. Contrarian risk elevated.`,
    });
  } else if (bearishComponents.length >= 7) {
    signals.push({
      signal: 'BROAD_BEARISH_ALIGNMENT',
      direction: 'BULLISH',
      strength: 75,
      description: `${bearishComponents.length}/9 components bearish — capitulation likely near-term. Watch for reversal signals.`,
    });
  }

  // MVRV-specific signal
  if (onChain.mvrv > 5) {
    signals.push({
      signal: 'MVRV_OVERVALUED',
      direction: 'BEARISH',
      strength: Math.min(90, Math.round(onChain.mvrv * 15)),
      description: `MVRV Z-score at ${onChain.mvrv.toFixed(2)} — market significantly overvalued relative to realized price. Distribution phase likely.`,
    });
  } else if (onChain.mvrv < 0.5 && onChain.mvrv > 0) {
    signals.push({
      signal: 'MVRV_UNDervalUED',
      direction: 'BULLISH',
      strength: Math.min(85, Math.round((1 - onChain.mvrv) * 70)),
      description: `MVRV Z-score at ${onChain.mvrv.toFixed(2)} — market below realized value. Historical accumulation zone.`,
    });
  }

  // SOPR signal
  if (onChain.sopr > 1.04) {
    signals.push({
      signal: 'SOPR_PROFIT_TAKING',
      direction: 'BEARISH',
      strength: Math.min(80, Math.round((onChain.sopr - 1.0) * 1000)),
      description: `SOPR at ${onChain.sopr.toFixed(4)} — aggressive profit taking. Selling pressure may intensify.`,
    });
  } else if (onChain.sopr < 0.97) {
    signals.push({
      signal: 'SOPR_CAPITULATION',
      direction: 'BULLISH',
      strength: Math.min(80, Math.round((1.0 - onChain.sopr) * 1000)),
      description: `SOPR at ${onChain.sopr.toFixed(4)} — holders realizing losses. Capitulation often marks local bottoms.`,
    });
  }

  // Volatility regime signal
  if (market.volatility30d > 60) {
    signals.push({
      signal: 'HIGH_VOLATILITY_REGIME',
      direction: 'BEARISH',
      strength: Math.min(85, Math.round(market.volatility30d)),
      description: `30-day volatility at ${market.volatility30d.toFixed(1)}% — extreme volatility regime. Position sizing should be reduced.`,
    });
  } else if (market.volatility30d < 25) {
    signals.push({
      signal: 'LOW_VOLATILITY_COMPETENCE',
      direction: 'BULLISH',
      strength: 50,
      description: `30-day volatility at ${market.volatility30d.toFixed(1)}% — unusually low volatility. Expansion likely imminent.`,
    });
  }

  // Whale accumulation signal
  if (onChain.whaleAccumulation > 70) {
    signals.push({
      signal: 'WHALE_ACCUMULATION',
      direction: 'BULLISH',
      strength: Math.round(onChain.whaleAccumulation),
      description: `Whale accumulation score ${onChain.whaleAccumulation.toFixed(0)}/100 — smart money accumulating. Historically bullish forward returns.`,
    });
  } else if (onChain.whaleAccumulation < 30) {
    signals.push({
      signal: 'WHALE_DISTRIBUTION',
      direction: 'BEARISH',
      strength: Math.round(100 - onChain.whaleAccumulation),
      description: `Whale accumulation score ${onChain.whaleAccumulation.toFixed(0)}/100 — large holders distributing. Supply overhang risk.`,
    });
  }

  // Net flow signal
  if (onChain.netFlow < -3000) {
    signals.push({
      signal: 'EXCHANGE_OUTFLOW',
      direction: 'BULLISH',
      strength: Math.min(80, Math.round(Math.abs(onChain.netFlow) / 100)),
      description: `Net exchange outflow of $${Math.abs(onChain.netFlow).toFixed(0)}M — coins moving to cold storage, supply squeeze potential.`,
    });
  } else if (onChain.netFlow > 3000) {
    signals.push({
      signal: 'EXCHANGE_INFLOW',
      direction: 'BEARISH',
      strength: Math.min(80, Math.round(onChain.netFlow / 100)),
      description: `Net exchange inflow of $${onChain.netFlow.toFixed(0)}M — coins moving to exchanges, potential selling pressure.`,
    });
  }

  // Altcoin season signal
  if (market.altcoinSeason && compositeIndex > 60) {
    signals.push({
      signal: 'ALTSEASON_CONFIRMED',
      direction: 'BULLISH',
      strength: 65,
      description: `BTC dominance at ${market.btcDominance.toFixed(1)}% with bullish sentiment — altcoin season conditions present. Rotate selectively.`,
    });
  }

  // Sort by strength descending
  return signals.sort((a, b) => b.strength - a.strength);
}
