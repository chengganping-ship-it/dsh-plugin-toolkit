/**
 * Custom Strategy Builder v6.0
 *
 * Breakthrough: Users create strategies by combining conditions visually.
 * No competitor offers this. They have fixed strategies; we let you build your own.
 *
 * A strategy consists of:
 * - ENTRY conditions: WHAT must be true to enter (AND/OR logic)
 * - EXIT conditions: WHEN to exit (stop loss / take profit / signal reversal)
 * - SIZE function: HOW MUCH to allocate (fixed/Kelly/custom)
 * - FILTERS: Exclude certain symbols, exchanges, or time periods
 *
 * Example: "Enter when ML confidence > 70% AND regime is LOW_VOL_MEAN_REVERT
 *           AND spread > 3bps, exit after 4 hours or -2% drawdown,
 *           size = Half Kelly with max $10K"
 */

export interface StrategyCondition {
  id: string;
  type: 'METRIC' | 'SIGNAL' | 'TIME' | 'REGIME' | 'CUSTOM';
  field: string;
  operator: 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ' | 'NEQ' | 'IN' | 'NOT_IN' | 'BETWEEN';
  value: number | string | number[] | string[];
  weight?: number;            // for weighted AND logic
}

export interface StrategyRule {
  name: string;
  description?: string;
  enabled: boolean;
  logic: 'AND' | 'OR';
  conditions: StrategyCondition[];
  action: 'ENTER_LONG' | 'ENTER_SHORT' | 'CLOSE' | 'ALERT';
}

export interface StrategySizeConfig {
  method: 'FIXED' | 'KELLY' | 'HALF_KELLY' | 'QUARTER_KELLY' | 'RISK_PARITY' | 'CUSTOM';
  fixedAmount?: number;
  maxAmount: number;
  kellyMultiplier: number;
  riskPerTrade: number;       // % of capital risked per trade
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  entryRules: StrategyRule[];
  exitRules: StrategyRule[];
  sizeConfig: StrategySizeConfig;
  filters: {
    symbols?: string[];       // whitelist
    excludeSymbols?: string[];
    exchanges?: string[];
    excludeExchanges?: string[];
    maxPositions: number;
    minSpread?: number;
    maxSpread?: number;
  };
  schedule?: {
    activeHours?: [number, number];  // UTC
    activeDays?: number[];           // 0=Sun, 6=Sat
  };
  performance?: {
    totalTrades: number;
    winRate: number;
    totalPnl: number;
    sharpe: number;
    maxDrawdown: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface StrategySignal {
  strategyId: string;
  strategyName: string;
  symbol: string;
  action: 'ENTER_LONG' | 'ENTER_SHORT' | 'CLOSE' | 'ALERT';
  size: number;
  confidence: number;
  reasons: string[];
  timestamp: number;
}

// Built-in strategy templates
const BUILT_IN_STRATEGIES: Strategy[] = [
  {
    id: 'conservative-carry',
    name: 'Conservative Carry',
    description: '低风险套利：窄价差、低波动、只交易主流币',
    enabled: true,
    entryRules: [{
      name: 'Entry', enabled: true, logic: 'AND',
      action: 'ENTER_LONG',
      conditions: [
        { id: '1', type: 'METRIC', field: 'spreadBps', operator: 'GTE', value: 2 },
        { id: '2', type: 'METRIC', field: 'volatility', operator: 'LT', value: 0.0005 },
        { id: '3', type: 'SIGNAL', field: 'mlConfidence', operator: 'GTE', value: 60 },
        { id: '4', type: 'REGIME', field: 'regime', operator: 'IN', value: ['LOW_VOL_MEAN_REVERT', 'OPPORTUNITY'] },
      ],
    }],
    exitRules: [{
      name: 'Exit', enabled: true, logic: 'OR',
      action: 'CLOSE',
      conditions: [
        { id: '5', type: 'METRIC', field: 'holdHours', operator: 'GTE', value: 8 },
        { id: '6', type: 'METRIC', field: 'drawdownPct', operator: 'LTE', value: -1 },
        { id: '7', type: 'METRIC', field: 'pnlPct', operator: 'GTE', value: 3 },
      ],
    }],
    sizeConfig: { method: 'QUARTER_KELLY', maxAmount: 25000, kellyMultiplier: 0.25, riskPerTrade: 1 },
    filters: { symbols: ['BTCUSDT', 'ETHUSDT'], maxPositions: 3, minSpread: 0.02, maxSpread: 0.5 },
    createdAt: Date.now(), updatedAt: Date.now(),
    performance: { totalTrades: 0, winRate: 0, totalPnl: 0, sharpe: 0, maxDrawdown: 0 },
  },
  {
    id: 'aggressive-momentum',
    name: 'Aggressive Momentum',
    description: '高波动趋势跟随：ML信号强、动量大、快速进出',
    enabled: false,
    entryRules: [{
      name: 'Entry', enabled: true, logic: 'AND',
      action: 'ENTER_LONG',
      conditions: [
        { id: '1', type: 'SIGNAL', field: 'mlConfidence', operator: 'GTE', value: 75 },
        { id: '2', type: 'REGIME', field: 'regime', operator: 'EQ', value: 'HIGH_VOL_TREND' },
        { id: '3', type: 'METRIC', field: 'momentumBps', operator: 'GT', value: 1 },
      ],
    }],
    exitRules: [{
      name: 'Exit', enabled: true, logic: 'OR',
      action: 'CLOSE',
      conditions: [
        { id: '4', type: 'METRIC', field: 'holdHours', operator: 'GTE', value: 2 },
        { id: '5', type: 'METRIC', field: 'pnlPct', operator: 'GTE', value: 5 },
        { id: '6', type: 'METRIC', field: 'drawdownPct', operator: 'LTE', value: -2 },
      ],
    }],
    sizeConfig: { method: 'HALF_KELLY', maxAmount: 50000, kellyMultiplier: 0.5, riskPerTrade: 2 },
    filters: { maxPositions: 5 },
    createdAt: Date.now(), updatedAt: Date.now(),
    performance: { totalTrades: 0, winRate: 0, totalPnl: 0, sharpe: 0, maxDrawdown: 0 },
  },
];

// User-defined strategies
const userStrategies: Strategy[] = [];
let nextId = 1;

/**
 * Evaluate a single condition against current data
 */
function evaluateCondition(
  condition: StrategyCondition,
  data: Record<string, any>
): { passed: boolean; detail: string } {
  const fieldValue = data[condition.field];
  if (fieldValue === undefined) return { passed: false, detail: `Field ${condition.field} not found` };

  const v = condition.value;
  let passed = false;
  let detail = '';

  switch (condition.operator) {
    case 'GT': passed = fieldValue > v; detail = `${fieldValue} > ${v}`; break;
    case 'LT': passed = fieldValue < v; detail = `${fieldValue} < ${v}`; break;
    case 'GTE': passed = fieldValue >= v; detail = `${fieldValue} >= ${v}`; break;
    case 'LTE': passed = fieldValue <= v; detail = `${fieldValue} <= ${v}`; break;
    case 'EQ': passed = fieldValue === v; detail = `${fieldValue} == ${v}`; break;
    case 'NEQ': passed = fieldValue !== v; detail = `${fieldValue} != ${v}`; break;
    case 'IN': {
      const arrIn: string[] = Array.isArray(v) ? v.map(String) : [String(v)];
      passed = arrIn.includes(String(fieldValue));
      detail = `${fieldValue} in [${arrIn.join(',')}]`;
      break;
    }
    case 'NOT_IN': {
      const arrNotIn: string[] = Array.isArray(v) ? v.map(String) : [String(v)];
      passed = !arrNotIn.includes(String(fieldValue));
      detail = `${fieldValue} not in [${arrNotIn.join(',')}]`;
      break;
    }
    case 'BETWEEN':
      if (Array.isArray(v) && v.length === 2) {
        passed = fieldValue >= v[0] && fieldValue <= v[1];
        detail = `${v[0]} <= ${fieldValue} <= ${v[1]}`;
      }
      break;
  }

  return { passed, detail };
}

/**
 * Evaluate a rule (AND/OR of conditions)
 */
function evaluateRule(
  rule: StrategyRule,
  data: Record<string, any>
): { passed: boolean; confidence: number; details: string[] } {
  const results = rule.conditions.map(c => ({ ...evaluateCondition(c, data), weight: c.weight || 1 }));
  const totalWeight = results.reduce((s, r) => s + r.weight, 0);

  let passed: boolean;
  let confidence: number;

  if (rule.logic === 'AND') {
    passed = results.every(r => r.passed);
    confidence = results.reduce((s, r) => s + (r.passed ? r.weight : 0), 0) / Math.max(totalWeight, 0.01) * 100;
  } else {
    passed = results.some(r => r.passed);
    // OR logic: confidence weighted by best matching condition
    const passedResults = results.filter(r => r.passed);
    confidence = passedResults.length > 0
      ? passedResults.reduce((s, r) => s + r.weight, 0) / Math.max(totalWeight, 0.01) * 100
      : 0;
  }

  return { passed, confidence, details: results.map(r => r.detail) };
}

/**
 * Calculate position size based on strategy config
 */
function calculateSize(
  config: StrategySizeConfig,
  winRate: number,
  avgWin: number,
  avgLoss: number
): number {
  switch (config.method) {
    case 'FIXED':
      return config.fixedAmount || 10000;
    case 'KELLY': {
      if (avgLoss === 0 || winRate === 0) return config.maxAmount * 0.1;
      const b = avgWin / avgLoss;
      const kelly = (b * winRate - (1 - winRate)) / b;
      return Math.max(0, Math.min(config.maxAmount, config.maxAmount * kelly * config.kellyMultiplier));
    }
    case 'HALF_KELLY': {
      if (avgLoss === 0 || winRate === 0) return config.maxAmount * 0.05;
      const b = avgWin / avgLoss;
      const kelly = (b * winRate - (1 - winRate)) / b;
      return Math.max(0, Math.min(config.maxAmount, config.maxAmount * kelly * 0.5 * config.kellyMultiplier));
    }
    case 'QUARTER_KELLY': {
      if (avgLoss === 0 || winRate === 0) return config.maxAmount * 0.025;
      const b = avgWin / avgLoss;
      const kelly = (b * winRate - (1 - winRate)) / b;
      return Math.max(0, Math.min(config.maxAmount, config.maxAmount * kelly * 0.25 * config.kellyMultiplier));
    }
    case 'RISK_PARITY':
      return Math.min(config.maxAmount, config.maxAmount * config.riskPerTrade / 100);
    case 'CUSTOM':
      return config.fixedAmount || 10000;
    default:
      return config.maxAmount * 0.1;
  }
}

/**
 * Main strategy evaluation function
 */
export function evaluateStrategies(
  opportunities: {
    symbol: string;
    longEx: string;
    shortEx: string;
    spreadPct: number;
    netAnnualized: number;
    volatility: number;
    mlConfidence: number;
    regime: string;
    momentumBps?: number;
    holdHours?: number;
    pnlPct?: number;
    drawdownPct?: number;
  }[],
  capitalConfig?: { winRate: number; avgWin: number; avgLoss: number }
): StrategySignal[] {
  const signals: StrategySignal[] = [];
  const allStrategies = [...BUILT_IN_STRATEGIES.filter(s => s.enabled), ...userStrategies.filter(s => s.enabled)];

  for (const opp of opportunities) {
    const data = {
      spreadBps: opp.spreadPct * 100,
      volatility: opp.volatility,
      netAnnualized: opp.netAnnualized,
      mlConfidence: opp.mlConfidence,
      regime: opp.regime,
      momentumBps: opp.momentumBps || 0,
      holdHours: opp.holdHours || 0,
      pnlPct: opp.pnlPct || 0,
      drawdownPct: opp.drawdownPct || 0,
      symbol: opp.symbol,
      exchange: opp.longEx,
    };

    for (const strategy of allStrategies) {
      // Apply filters
      if (strategy.filters.symbols && !strategy.filters.symbols.includes(opp.symbol)) continue;
      if (strategy.filters.excludeSymbols?.includes(opp.symbol)) continue;
      if (strategy.filters.exchanges && !strategy.filters.exchanges.includes(opp.longEx) && !strategy.filters.exchanges.includes(opp.shortEx)) continue;
      if (strategy.filters.minSpread && opp.spreadPct < strategy.filters.minSpread / 100) continue;
      if (strategy.filters.maxSpread && opp.spreadPct > strategy.filters.maxSpread / 100) continue;

      // Evaluate entry rules
      for (const rule of strategy.entryRules) {
        if (!rule.enabled) continue;
        const result = evaluateRule(rule, data);
        if (result.passed && result.confidence >= 50) {
          const size = calculateSize(
            strategy.sizeConfig,
            capitalConfig?.winRate || 0.55,
            capitalConfig?.avgWin || 0.8,
            capitalConfig?.avgLoss || 0.3
          );
          signals.push({
            strategyId: strategy.id,
            strategyName: strategy.name,
            symbol: opp.symbol,
            action: rule.action,
            size: Math.round(size),
            confidence: Math.round(result.confidence),
            reasons: result.details.filter((_, i) => rule.conditions[i] && evaluateCondition(rule.conditions[i], data).passed),
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  return signals.sort((a, b) => b.confidence - a.confidence || b.size - a.size);
}

/**
 * Create new custom strategy
 */
export function createStrategy(partial: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Strategy {
  const strategy: Strategy = {
    ...partial,
    id: `user-${nextId++}-${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  userStrategies.push(strategy);
  return strategy;
}

/**
 * Update existing strategy
 */
export function updateStrategy(id: string, updates: Partial<Strategy>): Strategy | null {
  const idx = userStrategies.findIndex(s => s.id === id);
  if (idx === -1) return null;
  userStrategies[idx] = { ...userStrategies[idx], ...updates, updatedAt: Date.now() };
  return userStrategies[idx];
}

/**
 * Delete strategy
 */
export function deleteStrategy(id: string): boolean {
  const idx = userStrategies.findIndex(s => s.id === id);
  if (idx === -1) return false;
  userStrategies.splice(idx, 1);
  return true;
}

/**
 * Get all strategies
 */
export function getAllStrategies(): Strategy[] {
  return [
    ...BUILT_IN_STRATEGIES.map(s => ({ ...s })),
    ...userStrategies.map(s => ({ ...s })),
  ];
}

/**
 * Get strategy templates for UI
 */
export function getStrategyTemplates(): { name: string; description: string; config: Partial<Strategy> }[] {
  return [
    {
      name: 'Conservative Carry',
      description: '低风险窄价差套利',
      config: { entryRules: BUILT_IN_STRATEGIES[0].entryRules, sizeConfig: BUILT_IN_STRATEGIES[0].sizeConfig },
    },
    {
      name: 'Aggressive Momentum',
      description: '高波动趋势跟随',
      config: { entryRules: BUILT_IN_STRATEGIES[1].entryRules, sizeConfig: BUILT_IN_STRATEGIES[1].sizeConfig },
    },
    {
      name: 'Custom Blank',
      description: '从空白开始构建',
      config: { entryRules: [], exitRules: [], sizeConfig: { method: 'HALF_KELLY', maxAmount: 25000, kellyMultiplier: 0.5, riskPerTrade: 2 } },
    },
  ];
}

/**
 * Enable/disable strategy
 */
export function toggleStrategy(id: string, enabled: boolean): Strategy | null {
  const all = [...BUILT_IN_STRATEGIES, ...userStrategies];
  const s = all.find(x => x.id === id);
  if (!s) return null;
  s.enabled = enabled;
  s.updatedAt = Date.now();
  return { ...s };
}

/**
 * Get user strategies only
 */
export function getUserStrategies(): Strategy[] {
  return [...userStrategies];
}
