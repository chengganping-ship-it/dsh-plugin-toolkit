/**
 * Market Regime Detector v4.0
 *
 * Breakthrough: Identifies which "state" the funding rate market is in
 * and auto-selects the optimal strategy.
 *
 * No competitor does this. They show you data. We tell you what to do.
 *
 * Detects 5 regimes:
 * 1. LOW_VOL_MEAN_REVERT — tight spreads, rates oscillate → mean reversion strategy
 * 2. HIGH_VOL_TREND — volatile, rates trending → momentum/trend following
 * 3. CRISIS — extreme rates, negative funding possible → capital preservation
 * 4. OPPORTUNITY — wide spreads, low vol → max size carry trades
 * 5. TRANSITION — regime changing → reduce size, wait for clarity
 *
 * Method: Combines spread dispersion, rate autocorrelation, and
 * realized volatility into a regime probability distribution.
 */

export type Regime =
  | 'LOW_VOL_MEAN_REVERT'
  | 'HIGH_VOL_TREND'
  | 'CRISIS'
  | 'OPPORTUNITY'
  | 'TRANSITION';

export interface RegimeState {
  current: Regime;
  previous: Regime;
  confidence: number;          // 0-100
  probabilities: Record<Regime, number>;
  recommendedStrategy: string;
  riskMultiplier: number;      // 0.5 = half size, 1.0 = normal, 1.5 = max size
  description: string;
  indicators: RegimeIndicators;
  timestamp: number;
}

interface RegimeIndicators {
  avgSpread: number;           // average spread across all pairs
  spreadDispersion: number;     // cross-pair spread std dev
  avgVolatility: number;        // average rate volatility
  autocorrelation: number;      // rate persistence (-1 to 1)
  extremeRateCount: number;     // count of |rate| > 0.05%
  trendStrength: number;        // 0-1, how directional rates are
}

// Regime history for smoothing
const regimeHistory: { regime: Regime; timestamp: number }[] = [];
const MAX_HISTORY = 60;

// Feature windows
const spreadWindow: number[] = [];
const volWindow: number[] = [];
const autocorrWindow: number[] = [];
const MAX_WINDOW = 120; // 10h at 5min

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - avg) ** 2, 0) / (arr.length - 1));
}

function autocorrelation(arr: number[], lag: number = 1): number {
  if (arr.length < lag + 5) return 0;
  const avg = mean(arr);
  let num = 0, den = 0;
  for (let i = lag; i < arr.length; i++) {
    num += (arr[i] - avg) * (arr[i - lag] - avg);
    den += (arr[i] - avg) ** 2;
  }
  if (den === 0) return 0;
  return num / den;
}

/**
 * Detect current market regime from rate data
 */
export function detectRegime(
  rates: { spread: number; volatility: number; fundingRate: number }[]
): RegimeState {
  if (rates.length < 5) {
    return {
      current: 'TRANSITION', previous: 'TRANSITION', confidence: 0,
      probabilities: { LOW_VOL_MEAN_REVERT: 0.2, HIGH_VOL_TREND: 0.2, CRISIS: 0.2, OPPORTUNITY: 0.2, TRANSITION: 0.2 },
      recommendedStrategy: 'WAIT',
      riskMultiplier: 0.5,
      description: '数据不足，等待更多样本',
      indicators: { avgSpread: 0, spreadDispersion: 0, avgVolatility: 0, autocorrelation: 0, extremeRateCount: 0, trendStrength: 0 },
      timestamp: Date.now(),
    };
  }

  // Update feature windows
  const avgSpread = mean(rates.map(r => r.spread));
  const volatilities = rates.map(r => r.volatility);
  const avgVol = mean(volatilities);
  const fundingRates = rates.map(r => r.fundingRate);

  spreadWindow.push(avgSpread);
  volWindow.push(avgVol);
  if (spreadWindow.length > MAX_WINDOW) spreadWindow.shift();
  if (volWindow.length > MAX_WINDOW) volWindow.shift();

  // Compute indicators
  const spreadDispersion = stdDev(rates.map(r => r.spread));
  const autocorr = autocorrelation(spreadWindow.length > 20 ? spreadWindow : [avgSpread]);
  autocorrWindow.push(autocorr);
  if (autocorrWindow.length > MAX_WINDOW) autocorrWindow.shift();

  const extremeRateCount = rates.filter(r => Math.abs(r.fundingRate) > 0.0005).length;

  // Trend strength: how many rates moving same direction
  const ratesArr = spreadWindow.length >= 6 ? spreadWindow : [avgSpread];
  const recentDiff = ratesArr.slice(-3).map((v, i) => i > 0 ? v - ratesArr[i - 1] : 0);
  const trendSignCount = recentDiff.filter(d => d > 0).length - recentDiff.filter(d => d < 0).length;
  const trendStrength = Math.abs(trendSignCount) / Math.max(1, recentDiff.length - 1);

  const indicators: RegimeIndicators = {
    avgSpread,
    spreadDispersion,
    avgVolatility: avgVol,
    autocorrelation: autocorr,
    extremeRateCount,
    trendStrength,
  };

  // Calculate regime probabilities
  const probs = calculateRegimeProbabilities(indicators);

  // Select regime with highest probability
  let current: Regime = 'TRANSITION';
  let maxProb = 0;
  for (const [regime, prob] of Object.entries(probs)) {
    if (prob > maxProb) {
      maxProb = prob;
      current = regime as Regime;
    }
  }

  // Smoothing: require regime to persist for at least 3 observations
  const previous = regimeHistory.length > 0 ? regimeHistory[regimeHistory.length - 1].regime : current;
  regimeHistory.push({ regime: current, timestamp: Date.now() });
  if (regimeHistory.length > MAX_HISTORY) regimeHistory.shift();

  // If regime changed, check if it's persistent
  let smoothedRegime = current;
  let confidence = Math.round(maxProb * 100);

  if (current !== previous) {
    const last3 = regimeHistory.slice(-3);
    if (last3.length >= 3 && last3.every(r => r.regime === current)) {
      smoothedRegime = current;
    } else {
      smoothedRegime = previous; // stick with previous until new regime persists
      confidence = Math.max(20, confidence - 20);
    }
  }

  // Strategy mapping
  const { strategy, riskMultiplier, description } = getStrategyForRegime(smoothedRegime, indicators);

  return {
    current: smoothedRegime,
    previous,
    confidence,
    probabilities: probs,
    recommendedStrategy: strategy,
    riskMultiplier,
    description,
    indicators,
    timestamp: Date.now(),
  };
}

/**
 * Calculate probability of each regime given current indicators
 */
function calculateRegimeProbabilities(ind: RegimeIndicators): Record<Regime, number> {
  const probs: Record<Regime, number> = {
    LOW_VOL_MEAN_REVERT: 0.1,
    HIGH_VOL_TREND: 0.1,
    CRISIS: 0.05,
    OPPORTUNITY: 0.1,
    TRANSITION: 0.1,
  };

  // LOW_VOL_MEAN_REVERT: low vol, low dispersion, negative autocorrelation
  if (ind.avgVolatility < 0.0003) {
    probs.LOW_VOL_MEAN_REVERT += 0.3;
  }
  if (ind.autocorrelation < 0.2) {
    probs.LOW_VOL_MEAN_REVERT += 0.2;
  }
  if (ind.spreadDispersion < 0.001) {
    probs.LOW_VOL_MEAN_REVERT += 0.1;
  }

  // HIGH_VOL_TREND: high vol, high autocorrelation, strong trend
  if (ind.avgVolatility > 0.001) {
    probs.HIGH_VOL_TREND += 0.25;
  }
  if (ind.autocorrelation > 0.5) {
    probs.HIGH_VOL_TREND += 0.25;
  }
  if (ind.trendStrength > 0.5) {
    probs.HIGH_VOL_TREND += 0.15;
  }

  // CRISIS: extreme rates, very high vol
  if (ind.extremeRateCount > 3) {
    probs.CRISIS += 0.4;
  }
  if (ind.avgVolatility > 0.002) {
    probs.CRISIS += 0.3;
  }
  if (ind.avgSpread > 0.005) {
    probs.CRISIS += 0.1;
  }

  // OPPORTUNITY: wide spreads, low vol, no extremes
  if (ind.avgSpread > 0.002 && ind.avgVolatility < 0.0005) {
    probs.OPPORTUNITY += 0.4;
  }
  if (ind.extremeRateCount === 0 && ind.avgSpread > 0.001) {
    probs.OPPORTUNITY += 0.2;
  }

  // TRANSITION: mixed signals, regime uncertainty
  const indicatorDispersion = stdDev([ind.avgVolatility * 10000, ind.spreadDispersion * 10000, Math.abs(ind.autocorrelation)]);
  if (indicatorDispersion > 1.5) {
    probs.TRANSITION += 0.3;
  }
  if (ind.avgVolatility > 0.0005 && ind.avgVolatility < 0.001 && ind.autocorrelation > 0.2 && ind.autocorrelation < 0.6) {
    probs.TRANSITION += 0.15;
  }

  // Normalize
  const total = Object.values(probs).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(probs)) {
    probs[key as Regime] = probs[key as Regime] / total;
  }

  return probs;
}

/**
 * Map regime to strategy parameters
 */
function getStrategyForRegime(regime: Regime, ind: RegimeIndicators) {
  switch (regime) {
    case 'LOW_VOL_MEAN_REVERT':
      return {
        strategy: 'MEAN_REVERSION',
        riskMultiplier: 0.6,
        description: `低波动均值回归环境 | 费率震荡区间窄，适合高抛低吸 | vol=${(ind.avgVolatility * 10000).toFixed(2)}bps`,
      };
    case 'HIGH_VOL_TREND':
      return {
        strategy: 'MOMENTUM',
        riskMultiplier: 0.8,
        description: `高波动趋势环境 | 费率有方向性，跟随趋势 | autocorr=${ind.autocorrelation.toFixed(2)}`,
      };
    case 'CRISIS':
      return {
        strategy: 'CAPITAL_PRESERVATION',
        riskMultiplier: 0.0,
        description: `🚨 危机模式 | 费率极端异常，暂停新开仓，收紧止损 | extremes=${ind.extremeRateCount}`,
      };
    case 'OPPORTUNITY':
      return {
        strategy: 'MAX_CARRY',
        riskMultiplier: 1.5,
        description: `⭐ 黄金机会 | 价差宽、波动低，加码吃费率 | spread=${(ind.avgSpread * 100).toFixed(3)}%`,
      };
    case 'TRANSITION':
    default:
      return {
        strategy: 'REDUCE_SIZE',
        riskMultiplier: 0.4,
        description: `过渡期 | 市场状态不明，减仓观望 | 等待明确信号`,
      };
  }
}

/**
 * Get regime transition statistics
 */
export function getRegimeStats(): {
  current: Regime;
  duration: number;  // minutes in current regime
  transitions: { from: Regime; to: Regime; at: number }[];
  distribution: Record<Regime, number>;
} {
  if (regimeHistory.length === 0) {
    return {
      current: 'TRANSITION', duration: 0, transitions: [],
      distribution: { LOW_VOL_MEAN_REVERT: 0, HIGH_VOL_TREND: 0, CRISIS: 0, OPPORTUNITY: 0, TRANSITION: 0 },
    };
  }

  const current = regimeHistory[regimeHistory.length - 1];

  // Find regime start
  let regimeStart = regimeHistory.length - 1;
  for (let i = regimeHistory.length - 2; i >= 0; i--) {
    if (regimeHistory[i].regime !== current.regime) break;
    regimeStart = i;
  }
  const duration = Math.round((Date.now() - regimeHistory[regimeStart].timestamp) / 60000);

  // Transitions
  const transitions: { from: Regime; to: Regime; at: number }[] = [];
  for (let i = 1; i < regimeHistory.length; i++) {
    if (regimeHistory[i].regime !== regimeHistory[i - 1].regime) {
      transitions.push({
        from: regimeHistory[i - 1].regime,
        to: regimeHistory[i].regime,
        at: regimeHistory[i].timestamp,
      });
    }
  }

  // Distribution
  const distribution: Record<Regime, number> = {
    LOW_VOL_MEAN_REVERT: 0, HIGH_VOL_TREND: 0, CRISIS: 0, OPPORTUNITY: 0, TRANSITION: 0,
  };
  for (const h of regimeHistory) {
    distribution[h.regime]++;
  }
  const total = regimeHistory.length;
  for (const key of Object.keys(distribution)) {
    distribution[key as Regime] = +(distribution[key as Regime] / total).toFixed(3);
  }

  return { current: current.regime, duration, transitions: transitions.slice(-10), distribution };
}

/**
 * Convenience: get current regime
 */
export function getCurrentRegime(): Regime {
  return regimeHistory.length > 0 ? regimeHistory[regimeHistory.length - 1].regime : 'TRANSITION';
}
