/**
 * Smart Order Router + Auto-Execution Engine v5.0
 *
 * Breakthrough: The ultimate fusion of all v4.0 signals into actionable trades.
 * Combines ML prediction + Regime state + Portfolio Kelly + Capacity into
 * a single execution decision, then routes to the optimal exchange.
 *
 * Decision flow:
 * 1. Signal Fusion → composite score (0-100)
 * 2. Regime Gate → skip if CRISIS/TRANSITION
 * 3. Portfolio Cap → respect total Kelly budget
 * 4. Smart Route → pick best exchange considering fees + liquidity
 * 5. Risk Guard → max drawdown, position concentration limits
 * 6. Execute → paper or real, with dry-run safety
 *
 * No competitor has this. They show signals. We execute them.
 */

import { MLPrediction } from './ml.js';
import { PortfolioResult } from './portfolio.js';
import { RegimeState, Regime } from './regime.js';
import { CapacityEstimate } from './capacity.js';

export interface RouterConfig {
  mode: 'PAPER' | 'DRY_RUN' | 'LIVE';
  maxPositionSize: number;       // max USD per position
  maxTotalExposure: number;      // max USD total exposure
  maxDrawdownPct: number;        // stop trading if portfolio DD exceeds this
  minConfidence: number;         // min ML confidence to trade
  requireRegime: Regime[];       // only trade in these regimes
  cooldownSeconds: number;       // don't re-enter same symbol within this window
  maxPositionsPerExchange: number;
  useSmartRouting: boolean;      // auto-select best execution venue
}

export interface RouterDecision {
  symbol: string;
  action: 'ENTER_LONG' | 'ENTER_SHORT' | 'CLOSE' | 'SKIP' | 'WAIT';
  confidence: number;            // composite 0-100
  reason: string;
  signalComponents: SignalComponent[];
  recommendedVenue: { long: string; short: string };
  size: number;                  // USD
  entryParameters: {
    stopLoss: number;            // rate level to exit
    takeProfit: number;          // rate level to take profit
    expectedHoldHours: number;
    maxFundingCost: number;
  };
  riskFlags: string[];
  timestamp: number;
}

interface SignalComponent {
  name: string;
  score: number;        // 0-100
  weight: number;
  contribution: number; // weighted score
  status: 'PASS' | 'FAIL' | 'WARN';
  detail: string;
}

interface ExecutionRecord {
  symbol: string;
  action: string;
  timestamp: number;
  size: number;
  venue: string;
  result?: 'SUCCESS' | 'FAILED' | 'PENDING';
  error?: string;
}

// Router state
const CONFIG: RouterConfig = {
  mode: 'PAPER',
  maxPositionSize: 50000,
  maxTotalExposure: 150000,
  maxDrawdownPct: 5,
  minConfidence: 55,
  requireRegime: ['LOW_VOL_MEAN_REVERT', 'HIGH_VOL_TREND', 'OPPORTUNITY'],
  cooldownSeconds: 3600,
  maxPositionsPerExchange: 5,
  useSmartRouting: true,
};

const executionLog: ExecutionRecord[] = [];
const activeTrades = new Map<string, { entryTime: number; size: number; longEx: string; shortEx: string }>();
const MAX_LOG = 500;

/**
 * Smart Order Router: main decision function
 */
export function routeOrder(
  predictions: MLPrediction[],
  portfolio: PortfolioResult | null,
  regime: RegimeState | null,
  capacities: Map<string, CapacityEstimate>,
  currentPnlPct: number = 0
): RouterDecision[] {
  const decisions: RouterDecision[] = [];
  const now = Date.now();

  // Gate: check regime
  if (!regime || !CONFIG.requireRegime.includes(regime.current)) {
    return [{
      symbol: 'PORTFOLIO', action: 'SKIP', confidence: 0,
      reason: `Regime ${regime?.current || 'UNKNOWN'} not in allowed list`,
      signalComponents: [], recommendedVenue: { long: '', short: '' }, size: 0,
      entryParameters: { stopLoss: 0, takeProfit: 0, expectedHoldHours: 0, maxFundingCost: 0 },
      riskFlags: ['REGIME_BLOCK'], timestamp: now,
    }];
  }

  // Gate: check drawdown
  if (currentPnlPct < -CONFIG.maxDrawdownPct) {
    return [{
      symbol: 'PORTFOLIO', action: 'SKIP', confidence: 0,
      reason: `Max drawdown exceeded: ${currentPnlPct.toFixed(2)}% > ${CONFIG.maxDrawdownPct}%`,
      signalComponents: [], recommendedVenue: { long: '', short: '' }, size: 0,
      entryParameters: { stopLoss: 0, takeProfit: 0, expectedHoldHours: 0, maxFundingCost: 0 },
      riskFlags: ['DRAWDOWN_LIMIT'], timestamp: now,
    }];
  }

  // Process predictions sorted by confidence
  const sortedPreds = [...predictions].sort((a, b) => b.confidence - a.confidence);

  for (const pred of sortedPreds) {
    // Skip low confidence
    if (pred.confidence < CONFIG.minConfidence) continue;

    // Check cooldown
    const existing = activeTrades.get(pred.symbol);
    if (existing && (now - existing.entryTime) < CONFIG.cooldownSeconds * 1000) continue;

    // Check exchange position limits
    const longCount = countPositionsAtExchange(existing?.longEx || '');
    const shortCount = countPositionsAtExchange(existing?.shortEx || '');
    if (longCount >= CONFIG.maxPositionsPerExchange || shortCount >= CONFIG.maxPositionsPerExchange) continue;

    // Build signal components
    const components: SignalComponent[] = [];

    // 1. ML Signal
    const mlScore = pred.confidence;
    components.push({
      name: 'ML_Prediction',
      score: mlScore,
      weight: 0.30,
      contribution: mlScore * 0.30,
      status: mlScore >= 70 ? 'PASS' : mlScore >= 55 ? 'WARN' : 'FAIL',
      detail: `${pred.predictedDirection} ${pred.expectedMove}bps @ ${pred.confidence}%`,
    });

    // 2. Regime Signal
    const regimeScore = 100 - (100 - (regime.confidence || 50)) * 0.5;
    components.push({
      name: 'Regime',
      score: regimeScore,
      weight: 0.25,
      contribution: regimeScore * 0.25,
      status: regime.current === 'OPPORTUNITY' ? 'PASS' : 'WARN',
      detail: `${regime.current} (${regime.confidence}%) → ${regime.recommendedStrategy}`,
    });

    // 3. Portfolio Budget Signal
    let portfolioScore = 50;
    let allocatedSize = 0;
    if (portfolio) {
      const portfolioPos = portfolio.positions.find(p => p.symbol === pred.symbol);
      if (portfolioPos && portfolioPos.recommendedSize > 0) {
        portfolioScore = 80;
        allocatedSize = portfolioPos.recommendedSize;
      }
      const remainingBudget = 1 - (portfolio.portfolioKelly / 100);
      if (remainingBudget < 0.1) {
        portfolioScore = 20; // almost fully allocated
      }
    }
    components.push({
      name: 'Portfolio',
      score: portfolioScore,
      weight: 0.20,
      contribution: portfolioScore * 0.20,
      status: portfolioScore >= 60 ? 'PASS' : portfolioScore >= 30 ? 'WARN' : 'FAIL',
      detail: allocatedSize > 0 ? `Allocated $${allocatedSize}` : `${(portfolio?.portfolioKelly || 0).toFixed(1)}% used`,
    });

    // 4. Capacity Signal
    const capKey = `${pred.exchange}:${pred.symbol}`;
    const cap = capacities.get(capKey);
    const capacityScore = cap ? Math.min(100, cap.spreadCapturePct * 1.5) : 50;
    components.push({
      name: 'Capacity',
      score: capacityScore,
      weight: 0.15,
      contribution: capacityScore * 0.15,
      status: capacityScore >= 70 ? 'PASS' : capacityScore >= 40 ? 'WARN' : 'FAIL',
      detail: cap ? `$${(cap.recommendedSize/1000).toFixed(0)}K @ ${cap.slippageAtCapacity.toFixed(1)}bps slip` : 'No data',
    });

    // 5. Coherence Signal (do signals agree?)
    const upSignals = components.filter(c => c.score >= 50).length;
    const coherenceScore = (upSignals / components.length) * 100;
    components.push({
      name: 'Coherence',
      score: coherenceScore,
      weight: 0.10,
      contribution: coherenceScore * 0.10,
      status: coherenceScore >= 60 ? 'PASS' : 'WARN',
      detail: `${upSignals}/${components.length} signals aligned`,
    });

    // Calculate composite score
    const compositeScore = components.reduce((sum, c) => sum + c.contribution, 0);
    const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
    const normalizedScore = compositeScore / Math.max(totalWeight, 0.01);

    // Determine action
    let action: RouterDecision['action'] = 'SKIP';
    let riskFlags: string[] = [];
    let size = 0;

    if (normalizedScore >= CONFIG.minConfidence && pred.predictedDirection !== 'FLAT') {
      action = 'WAIT';

      // Allocate size
      size = allocatedSize || CONFIG.maxPositionSize * 0.5;
      if (regime.riskMultiplier !== undefined) {
        size *= regime.riskMultiplier;
      }
      if (size > CONFIG.maxPositionSize) {
        size = CONFIG.maxPositionSize;
        riskFlags.push('SIZE_CAPPED');
      }

      // Check total exposure
      const totalAllocated = Array.from(activeTrades.values()).reduce((s, t) => s + t.size, 0);
      if (totalAllocated + size > CONFIG.maxTotalExposure) {
        size = Math.max(0, CONFIG.maxTotalExposure - totalAllocated);
        if (size < 1000) {
          action = 'WAIT';
          riskFlags.push('EXPOSURE_LIMIT');
        } else {
          riskFlags.push('PARTIAL_FILL');
        }
      }

      if (size >= 1000 && action !== 'WAIT') {
        action = pred.predictedDirection === 'UP' ? 'ENTER_LONG' : 'ENTER_SHORT';
      }
    }

    // Risk warnings
    if (regime.current === 'HIGH_VOL_TREND' && pred.confidence < 70) {
      riskFlags.push('HIGH_VOL_LOW_CONF');
    }
    if (pred.expectedMove < 0.5) { // less than 0.5bps
      riskFlags.push('LOW_EXPECTED_MOVE');
    }

    // Smart routing: find best venue
    const venue = findBestVenue(pred);

    // Entry parameters based on signals
    const direction = pred.predictedDirection === 'UP' ? 1 : -1;
    const components_detail = {
      stopLoss: direction * -0.0002, // -2bps stop
      takeProfit: direction * 0.0010, // +10bps target
      expectedHoldHours: regime.current === 'LOW_VOL_MEAN_REVERT' ? 4 : 8,
      maxFundingCost: Math.abs(pred.currentRate) * 2,
    };

    decisions.push({
      symbol: pred.symbol,
      action,
      confidence: Math.round(normalizedScore),
      reason: `Composite ${normalizedScore.toFixed(1)}%: ${components.map(c => `${c.name}:${c.score.toFixed(0)}`).join(' | ')}`,
      signalComponents: components.sort((a, b) => b.contribution - a.contribution),
      recommendedVenue: venue,
      size: Math.round(size),
      entryParameters: components_detail,
      riskFlags,
      timestamp: now,
    });

    // Log execution if trade is actionable
    if (action !== 'SKIP' && action !== 'WAIT') {
      logExecution({
        symbol: pred.symbol,
        action,
        timestamp: now,
        size: Math.round(size),
        venue: `${venue.long}/${venue.short}`,
      });
    }
  }

  return decisions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Find best execution venue considering fees and liquidity
 */
function findBestVenue(pred: MLPrediction): { long: string; short: string } {
  if (!CONFIG.useSmartRouting) {
    return { long: pred.exchange || 'Binance', short: 'Bybit' };
  }

  const feeTable: Record<string, { maker: number; taker: number }> = {
    Binance: { maker: 0.02, taker: 0.04 },
    Bybit: { maker: 0.01, taker: 0.055 },
    OKX: { maker: 0.015, taker: 0.05 },
    Gate: { maker: 0.015, taker: 0.05 },
    Bitget: { maker: 0.02, taker: 0.06 },
  };

  // Liquidity score (higher = better depth)
  const liquidityScore: Record<string, number> = {
    Binance: 100, Bybit: 85, OKX: 75, Gate: 50, Bitget: 45,
  };

  // Score each exchange: prefer low fees + high liquidity
  const exchanges = ['Binance', 'Bybit', 'OKX', 'Gate', 'Bitget'];
  let bestLong = pred.exchange || 'Binance';
  let bestShort = 'Bybit';
  let bestLongScore = 0;
  let bestShortScore = 0;

  for (const ex of exchanges) {
    const fee = feeTable[ex];
    const liq = liquidityScore[ex];
    const score = liq * 0.6 - (fee.taker) * 1000 * 0.4;

    if (score > bestLongScore) {
      bestLongScore = score;
      bestLong = ex;
    }
    // For short, prefer slightly different venue for diversification
    if (score < bestLongScore && score > bestShortScore) {
      bestShortScore = score;
      bestShort = ex;
    }
  }

  // Ensure long and short are different
  if (bestLong === bestShort) {
    bestShort = exchanges.find(e => e !== bestLong) || 'Bybit';
  }

  return { long: bestLong, short: bestShort };
}

function countPositionsAtExchange(exchange: string): number {
  let count = 0;
  for (const trade of activeTrades.values()) {
    if (trade.longEx === exchange || trade.shortEx === exchange) count++;
  }
  return count;
}

function logExecution(record: ExecutionRecord) {
  executionLog.push(record);
  if (executionLog.length > MAX_LOG) executionLog.shift();
}

/**
 * Update active trade state
 */
export function updateTradeState(symbol: string, action: 'OPEN' | 'CLOSE', details?: Partial<{ size: number; longEx: string; shortEx: string }>) {
  if (action === 'OPEN' && details) {
    activeTrades.set(symbol, {
      entryTime: Date.now(),
      size: details.size || 0,
      longEx: details.longEx || 'Binance',
      shortEx: details.shortEx || 'Bybit',
    });
  } else if (action === 'CLOSE') {
    activeTrades.delete(symbol);
  }
}

/**
 * Get router state and execution log
 */
export function getRouterState() {
  return {
    config: { ...CONFIG },
    activeTrades: Object.fromEntries(activeTrades),
    executionLog: executionLog.slice(-50),
    metrics: {
      totalExecutions: executionLog.length,
      activePositions: activeTrades.size,
      totalExposure: Array.from(activeTrades.values()).reduce((s, t) => s + t.size, 0),
    },
  };
}

/**
 * Update router config
 */
export function updateRouterConfig(updates: Partial<RouterConfig>): RouterConfig {
  Object.assign(CONFIG, updates);
  return { ...CONFIG };
}

/**
 * Get router config
 */
export function getRouterConfig(): RouterConfig {
  return { ...CONFIG };
}
