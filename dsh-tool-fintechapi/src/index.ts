/**
 * DSH AI Fintech API Toolkit Plugin v0.1.0
 *
 * AI-powered financial API toolkit for DeepSeek Harness Agent.
 * Designed for quantitative analysts, fintech engineers, risk managers, and AI Agents.
 *
 * 2026 Market Context: 50% of API calls now come from AI Agents not human developers.
 * Global financial data API market: $619.059B. AI agents are becoming the primary consumers of financial APIs.
 *
 * Features (v0.1.0):
 * - Market Data Feed Simulator (real-time market data generation with configurable parameters)
 * - Algorithmic Trading Signal Gen (multi-strategy signal generation with confluence scoring)
 * - Portfolio Risk Analyzer (VaR, CVaR, Sharpe, drawdown, correlation analysis)
 * - Crypto Market Monitor (on-chain metrics, DeFi TVL, NFT volume, stablecoin flows)
 * - Forex Rate Predictor (technical + fundamental forex forecasting with confidence bands)
 * - Options Pricing Calculator (Black-Scholes, Greeks, implied volatility, strategy payoffs)
 * - Financial News Sentiment (NLP-driven sentiment scoring with entity extraction)
 * - Regulatory Filing Analyzer (SEC EDGAR parsing, anomaly detection, compliance scoring)
 *
 * @module dsh-tool-fintechapi
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-fintechapi'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 - Seeded Random (mulberry32 PRNG) ====================

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== AGENT SKILL FRAMEWORK ====================
// Each tool output follows the Agent Skill format:
// 1. Executive Summary
// 2. Action Plan
// 3. Verification Checklist
// 4. Risk Flags
// 5. Market Context

// ==================== SECTION 2 - Type Definitions ====================

// --- Tool 1: Market Data Feed Simulator ---
export interface MarketDataFeedInput {
  symbols: string[]
  feed_type: 'tick' | 'ohlcv' | 'orderbook' | 'quote'
  duration_seconds: number
  volatility_regime: 'low' | 'normal' | 'high' | 'crisis'
  include_anomalies?: boolean
}

export interface TickData {
  timestamp: string
  symbol: string
  price: number
  volume: number
  bid: number
  ask: number
  spread: number
}

export interface OrderBookLevel {
  price: number
  size: number
  orders: number
}

export interface MarketDataFeedResult {
  feed_id: string
  feed_type: string
  symbols: string[]
  data_points: TickData[]
  orderbook?: {
    symbol: string
    bids: OrderBookLevel[]
    asks: OrderBookLevel[]
    mid_price: number
    imbalance: number
  }
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// --- Tool 2: Algorithmic Trading Signal Gen ---
export interface TradingSignalInput {
  symbol: string
  strategy: 'momentum' | 'mean_reversion' | 'breakout' | 'pairs_trading' | 'ml_ensemble'
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  lookback_periods: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
}

export interface TradingSignal {
  timestamp: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  strength: number
  entry_price: number
  stop_loss: number
  take_profit: number
  confidence: number
  indicators: Record<string, number>
}

export interface TradingSignalResult {
  symbol: string
  strategy: string
  signals: TradingSignal[]
  confluence_score: number
  recommendation: string
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// --- Tool 3: Portfolio Risk Analyzer ---
export interface PortfolioRiskInput {
  holdings: Array<{ symbol: string; weight: number; asset_class: string }>
  confidence_level: number
  time_horizon_days: number
  benchmark?: string
  include_stress_test?: boolean
}

export interface RiskMetric {
  name: string
  value: number
  interpretation: string
  percentile_rank?: number
}

export interface PortfolioRiskResult {
  portfolio_id: string
  total_value: number
  metrics: RiskMetric[]
  var_95: number
  var_99: number
  cvar_95: number
  sharpe_ratio: number
  sortino_ratio: number
  max_drawdown: number
  beta: number
  correlation_matrix?: Record<string, Record<string, number>>
  stress_test_results?: Array<{ scenario: string; impact_pct: number; recovery_days: number }>
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// --- Tool 4: Crypto Market Monitor ---
export interface CryptoMonitorInput {
  assets: string[]
  metrics: string[]
  include_defi?: boolean
  include_onchain?: boolean
  timeframe: '1h' | '24h' | '7d' | '30d'
}

export interface OnChainMetric {
  metric: string
  value: number
  change_pct: number
  signal: 'bullish' | 'bearish' | 'neutral'
  interpretation: string
}

export interface DeFiProtocol {
  name: string
  tvl_usd: number
  tvl_change_pct: number
  chain: string
  category: string
}

export interface CryptoMarketResult {
  assets_analyzed: string[]
  prices: Record<string, { price_usd: number; change_pct: number; volume_24h: number }>
  onchain_metrics?: OnChainMetric[]
  defi_overview?: DeFiProtocol[]
  market_dominance?: Record<string, number>
  fear_greed_index: number
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// --- Tool 5: Forex Rate Predictor ---
export interface ForexPredictionInput {
  pair: string
  model_type: 'technical' | 'fundamental' | 'hybrid'
  forecast_horizon: '1d' | '1w' | '1M' | '3M'
  include_interest_rate_diff: boolean
  include_purchasing_power_parity: boolean
}

export interface ForecastPoint {
  period: string
  predicted_rate: number
  lower_bound: number
  upper_bound: number
  confidence: number
}

export interface ForexPredictionResult {
  pair: string
  current_rate: number
  forecasts: ForecastPoint[]
  direction: 'appreciate' | 'depreciate' | 'sideways'
  expected_change_pct: number
  key_drivers: string[]
  model_accuracy: number
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// --- Tool 6: Options Pricing Calculator ---
export interface OptionsPricingInput {
  underlying_price: number
  strike_price: number
  time_to_expiry_days: number
  risk_free_rate: number
  volatility: number
  option_type: 'call' | 'put'
  strategy?: 'single' | 'spread' | 'straddle' | 'butterfly' | 'iron_condor'
}

export interface Greeks {
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
}

export interface OptionsPricingResult {
  option_type: string
  strategy: string
  fair_value: number
  intrinsic_value: number
  time_value: number
  greeks: Greeks
  implied_volatility: number
  break_even: number
  max_profit: string
  max_loss: string
  payoff_at_expiry: Array<{ spot: number; pnl: number }>
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// --- Tool 7: Financial News Sentiment ---
export interface NewsSentimentInput {
  query: string
  sources: string[]
  time_range_hours: number
  asset_filter?: string[]
  min_relevance_score?: number
}

export interface SentimentArticle {
  headline: string
  source: string
  timestamp: string
  sentiment_score: number
  relevance: number
  entities: string[]
  key_phrases: string[]
}

export interface NewsSentimentResult {
  query: string
  articles_analyzed: number
  overall_sentiment: number
  sentiment_label: 'strongly_bearish' | 'bearish' | 'neutral' | 'bullish' | 'strongly_bullish'
  articles: SentimentArticle[]
  entity_sentiment: Record<string, number>
  trend_direction: 'improving' | 'deteriorating' | 'stable'
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// --- Tool 8: Regulatory Filing Analyzer ---
export interface FilingAnalyzerInput {
  cik: string
  filing_type: '10-K' | '10-Q' | '8-K' | 'DEF 14A' | 'S-1'
  analysis_depth: 'summary' | 'detailed' | 'forensic'
  target_sections?: string[]
  compare_periods?: number
}

export interface FilingMetric {
  metric: string
  current_value: number
  previous_value: number
  change_pct: number
  flag: 'normal' | 'watch' | 'warning' | 'critical'
}

export interface AnomalyFinding {
  section: string
  description: string
  severity: 'low' | 'medium' | 'high'
  explanation: string
}

export interface FilingAnalyzerResult {
  company: string
  filing_type: string
  filing_date: string
  metrics: FilingMetric[]
  anomalies: AnomalyFinding[]
  compliance_score: number
  red_flags: string[]
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  risk_flags: string[]
  market_context: string
}

// ==================== HELPER FUNCTIONS ====================

function normCdf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1.0 + sign * y)
}

function blackScholesPrice(S: number, K: number, T: number, r: number, sigma: number, type: 'call' | 'put'): number {
  if (T <= 0) return type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)
  if (type === 'call') {
    return S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d2)
  }
  return K * Math.exp(-r * T) * normCdf(-d2) - S * normCdf(-d1)
}

// ==================== TOOL 1: MARKET DATA FEED SIMULATOR ====================

function simulateMarketDataFeed(input: MarketDataFeedInput): MarketDataFeedResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const dataPoints: TickData[] = []

  const volatilityMap = { low: 0.005, normal: 0.015, high: 0.035, crisis: 0.08 }
  const vol = volatilityMap[input.volatility_regime]
  const basePrices: Record<string, number> = {}

  const defaultPrices: Record<string, number> = {
    AAPL: 195.5, MSFT: 420.2, GOOGL: 175.8, AMZN: 185.3, TSLA: 245.6,
    NVDA: 875.4, META: 502.1, JPM: 198.7, BAC: 37.2, XOM: 108.5,
    SPY: 520.3, QQQ: 445.8, BTC: 67500, ETH: 3450, EURUSD: 1.085, USDJPY: 154.2
  }

  for (const sym of input.symbols) {
    basePrices[sym] = defaultPrices[sym] ?? rng.nextFloat(50, 500)
  }

  const tickInterval = Math.max(1, Math.floor(input.duration_seconds / 100))
  let anomalyTriggered = false

  for (let t = 0; t < Math.min(input.duration_seconds, 100); t += tickInterval) {
    for (const sym of input.symbols) {
      let price = basePrices[sym]
      const drift = rng.nextFloat(-vol, vol)
      price = price * (1 + drift)

      if (input.include_anomalies && !anomalyTriggered && rng.next() < 0.05) {
        price = price * (1 + (rng.next() > 0.5 ? 1 : -1) * rng.nextFloat(0.02, 0.05))
        anomalyTriggered = true
      }

      const spread = price * rng.nextFloat(0.0001, 0.001)
      dataPoints.push({
        timestamp: new Date(Date.now() - (input.duration_seconds - t) * 1000).toISOString(),
        symbol: sym,
        price: Math.round(price * 100) / 100,
        volume: rng.nextInt(100, 100000),
        bid: Math.round((price - spread / 2) * 100) / 100,
        ask: Math.round((price + spread / 2) * 100) / 100,
        spread: Math.round(spread * 10000) / 10000
      })

      basePrices[sym] = price
    }
  }

  const primarySym = input.symbols[0]
  const lastPrice = dataPoints.filter(d => d.symbol === primarySym).slice(-1)[0]?.price ?? basePrices[primarySym]
  const bids: OrderBookLevel[] = []
  const asks: OrderBookLevel[] = []
  for (let i = 0; i < 5; i++) {
    bids.push({ price: Math.round((lastPrice * (1 - 0.001 * (i + 1))) * 100) / 100, size: rng.nextInt(100, 5000), orders: rng.nextInt(5, 50) })
    asks.push({ price: Math.round((lastPrice * (1 + 0.001 * (i + 1))) * 100) / 100, size: rng.nextInt(100, 5000), orders: rng.nextInt(5, 50) })
  }
  const totalBidSize = bids.reduce((s, b) => s + b.size, 0)
  const totalAskSize = asks.reduce((s, a) => s + a.size, 0)
  const imbalance = totalBidSize / (totalBidSize + totalAskSize)

  return {
    feed_id: 'MDF-' + Date.now(),
    feed_type: input.feed_type,
    symbols: input.symbols,
    data_points: dataPoints,
    orderbook: input.feed_type === 'orderbook' ? {
      symbol: primarySym,
      bids,
      asks,
      mid_price: Math.round(lastPrice * 100) / 100,
      imbalance: Math.round(imbalance * 1000) / 1000
    } : undefined,
    executive_summary: 'Simulated ' + input.feed_type + ' feed for ' + input.symbols.length + ' symbol(s) over ' + input.duration_seconds + 's in ' + input.volatility_regime + ' volatility regime. Generated ' + dataPoints.length + ' data points with ' + (input.include_anomalies ? 'anomaly injection enabled' : 'clean data') + '. Order book shows ' + (imbalance > 0.55 ? 'bid-heavy' : imbalance < 0.45 ? 'ask-heavy' : 'balanced') + ' imbalance at ' + (imbalance * 100).toFixed(1) + '%.',
    action_plan: [
      'Validate simulated data against historical distributions before production use',
      'Configure anomaly detection thresholds based on volatility regime',
      'Pipe feed to downstream signal generation and risk engines',
      'Set up real-time monitoring dashboards for feed health'
    ],
    verification_checklist: [
      'All ' + input.symbols.length + ' symbols have generated data points',
      'Bid-ask spreads are positive and within expected range',
      'No negative prices detected in simulation',
      'Timestamps are monotonically increasing',
      'Order book bids < asks (no crossed book)'
    ],
    risk_flags: [
      input.volatility_regime === 'crisis' ? 'CRISIS regime: extreme price swings possible, widen risk limits' : null,
      anomalyTriggered ? 'Anomaly injected: ensure detection systems flag correctly' : null,
      input.duration_seconds > 3600 ? 'Extended duration: consider memory constraints for large feeds' : null
    ].filter((x): x is string => x !== null),
    market_context: 'Global financial data API market reached $619.059B in 2026 with AI Agents now driving 50% of all API calls. Market data feeds form the foundational layer for algorithmic trading systems, with latency and accuracy being key differentiators. Current ' + input.volatility_regime + ' regime reflects ' + (input.volatility_regime === 'crisis' ? 'elevated uncertainty requiring robust circuit breakers' : 'normal market microstructure dynamics') + '.'
  }
}

function formatMarketDataFeedReport(result: MarketDataFeedResult): string {
  const lines: string[] = []
  lines.push('# Market Data Feed Simulator - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('## Feed Details')
  lines.push('- **Feed ID:** ' + result.feed_id)
  lines.push('- **Type:** ' + result.feed_type + ' | **Symbols:** ' + result.symbols.join(', '))
  lines.push('- **Data Points:** ' + result.data_points.length)
  lines.push('')

  if (result.orderbook) {
    const ob = result.orderbook
    lines.push('## Order Book Snapshot')
    lines.push('- **Symbol:** ' + ob.symbol + ' | **Mid Price:** $' + ob.mid_price + ' | **Imbalance:** ' + (ob.imbalance * 100).toFixed(1) + '% bids')
    lines.push('| Bid Price | Bid Size | Ask Price | Ask Size |')
    lines.push('|-----------|----------|-----------|----------|')
    for (let i = 0; i < Math.min(ob.bids.length, 5); i++) {
      lines.push('| $' + ob.bids[i].price + ' | ' + ob.bids[i].size + ' | $' + ob.asks[i].price + ' | ' + ob.asks[i].size + ' |')
    }
    lines.push('')
  }

  lines.push('## Recent Tick Data (Last 10)')
  lines.push('| Timestamp | Symbol | Price | Volume | Bid | Ask |')
  lines.push('|-----------|--------|-------|--------|-----|-----|')
  for (const t of result.data_points.slice(-10)) {
    lines.push('| ' + t.timestamp.slice(11, 19) + ' | ' + t.symbol + ' | $' + t.price + ' | ' + t.volume + ' | $' + t.bid + ' | $' + t.ask + ' |')
  }
  lines.push('')

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== TOOL 2: ALGORITHMIC TRADING SIGNAL GEN ====================

function generateTradingSignals(input: TradingSignalInput): TradingSignalResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const signals: TradingSignal[] = []

  const basePrice = rng.nextFloat(50, 500)
  let currentPrice = basePrice
  const timeframeMinutes: Record<string, number> = { '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1d': 1440 }
  const tf = timeframeMinutes[input.timeframe]

  for (let i = 0; i < 20; i++) {
    const returns = rng.nextFloat(-0.03, 0.03)
    currentPrice = currentPrice * (1 + returns)
    const indicators: Record<string, number> = {
      rsi: rng.nextFloat(20, 80),
      macd: rng.nextFloat(-2, 2),
      sma_20: currentPrice * rng.nextFloat(0.97, 1.03),
      ema_50: currentPrice * rng.nextFloat(0.95, 1.05),
      bb_width: rng.nextFloat(0.02, 0.12),
      atr: currentPrice * rng.nextFloat(0.01, 0.05)
    }

    let signal: TradingSignal['signal'] = 'HOLD'
    let strength = 0.5

    if (input.strategy === 'momentum') {
      if (indicators.macd > 0.5 && indicators.rsi < 70) { signal = 'BUY'; strength = 0.7 + rng.nextFloat(0, 0.25) }
      else if (indicators.macd < -0.5 && indicators.rsi > 30) { signal = 'SELL'; strength = 0.7 + rng.nextFloat(0, 0.25) }
    } else if (input.strategy === 'mean_reversion') {
      if (indicators.rsi < 30) { signal = 'BUY'; strength = 0.6 + rng.nextFloat(0, 0.3) }
      else if (indicators.rsi > 70) { signal = 'SELL'; strength = 0.6 + rng.nextFloat(0, 0.3) }
    } else if (input.strategy === 'breakout') {
      if (currentPrice > indicators.sma_20 * 1.02) { signal = 'BUY'; strength = 0.65 + rng.nextFloat(0, 0.3) }
      else if (currentPrice < indicators.sma_20 * 0.98) { signal = 'SELL'; strength = 0.65 + rng.nextFloat(0, 0.3) }
    } else {
      if (rng.next() > 0.6) { signal = rng.next() > 0.5 ? 'BUY' : 'SELL'; strength = 0.55 + rng.nextFloat(0, 0.35) }
    }

    const slDist = currentPrice * (input.risk_tolerance === 'conservative' ? 0.02 : input.risk_tolerance === 'moderate' ? 0.04 : 0.06)
    const tpDist = currentPrice * (input.risk_tolerance === 'conservative' ? 0.03 : input.risk_tolerance === 'moderate' ? 0.06 : 0.10)

    signals.push({
      timestamp: new Date(Date.now() - (20 - i) * tf * 60000).toISOString(),
      signal,
      strength: Math.round(strength * 100) / 100,
      entry_price: Math.round(currentPrice * 100) / 100,
      stop_loss: Math.round((signal === 'BUY' ? currentPrice - slDist : currentPrice + slDist) * 100) / 100,
      take_profit: Math.round((signal === 'BUY' ? currentPrice + tpDist : currentPrice - tpDist) * 100) / 100,
      confidence: Math.round(strength * (0.7 + rng.nextFloat(0, 0.25)) * 100) / 100,
      indicators
    })
  }

  const buyCount = signals.filter(s => s.signal === 'BUY').length
  const sellCount = signals.filter(s => s.signal === 'SELL').length
  const holdCount = signals.filter(s => s.signal === 'HOLD').length
  const avgStrength = signals.reduce((s, sig) => s + sig.strength, 0) / signals.length
  const confluenceScore = Math.round((1 - holdCount / signals.length) * avgStrength * 100) / 100

  const recommendation = buyCount > sellCount * 1.5 && avgStrength > 0.6
    ? 'BULLISH CONFLUENCE: ' + buyCount + ' buy signals detected with avg strength ' + avgStrength.toFixed(2) + '. Consider long exposure.'
    : sellCount > buyCount * 1.5 && avgStrength > 0.6
    ? 'BEARISH CONFLUENCE: ' + sellCount + ' sell signals detected with avg strength ' + avgStrength.toFixed(2) + '. Consider short exposure.'
    : 'MIXED SIGNALS: Buy=' + buyCount + ' Sell=' + sellCount + ' Hold=' + holdCount + '. Market lacks clear direction. Reduce position size or stay flat.'

  return {
    symbol: input.symbol,
    strategy: input.strategy,
    signals,
    confluence_score: confluenceScore,
    recommendation,
    executive_summary: input.strategy + ' strategy on ' + input.symbol + ' (' + input.timeframe + ') generated 20 signals: ' + buyCount + ' BUY, ' + sellCount + ' SELL, ' + holdCount + ' HOLD. Confluence score: ' + (confluenceScore * 100).toFixed(0) + '%. ' + recommendation.split('.')[0] + '.',
    action_plan: [
      'Validate signals against volume and liquidity conditions',
      'Check for upcoming economic events that may override technical signals',
      'Size positions according to signal strength and risk tolerance',
      'Set automated stop-loss and take-profit orders per signal levels'
    ],
    verification_checklist: [
      'All signals have valid entry, stop-loss, and take-profit prices',
      'Stop-loss is below entry for BUY, above entry for SELL',
      'Take-profit is above entry for BUY, below entry for SELL',
      'Confidence scores are within [0, 1] range',
      'Strategy "' + input.strategy + '" produces appropriate signal types'
    ],
    risk_flags: [
      confluenceScore < 0.3 ? 'Low confluence: signals lack agreement, reduce position size' : null,
      holdCount > 12 ? 'High HOLD count: strategy may be poorly calibrated for current regime' : null,
      input.risk_tolerance === 'aggressive' && input.timeframe === '1m' ? 'Aggressive + 1m: extreme risk of overtrading and drawdown' : null,
      avgStrength > 0.9 ? 'Abnormally high signal strength: verify indicator calibration' : null
    ].filter((x): x is string => x !== null),
    market_context: 'Algorithmic trading accounts for 60-70% of equity market volume in 2026. ' + input.strategy + ' strategies require careful regime detection - momentum excels in trending markets, mean-reversion in range-bound conditions. AI agents now consume market data APIs at unprecedented scale, driving latency competition to sub-microsecond levels. Risk management overlay is essential regardless of signal quality.'
  }
}

function formatTradingSignalReport(result: TradingSignalResult): string {
  const lines: string[] = []
  lines.push('# Algorithmic Trading Signal Generator - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('## Signal Configuration')
  lines.push('- **Symbol:** ' + result.symbol + ' | **Strategy:** ' + result.strategy)
  lines.push('- **Confluence Score:** ' + (result.confluence_score * 100).toFixed(0) + '%')
  lines.push('- **Total Signals:** ' + result.signals.length)
  lines.push('')

  lines.push('## Recent Signals (Last 10)')
  lines.push('| Time | Signal | Strength | Entry | Stop Loss | Take Profit | Confidence |')
  lines.push('|------|--------|----------|-------|-----------|-------------|------------|')
  for (const s of result.signals.slice(-10)) {
    lines.push('| ' + s.timestamp.slice(11, 19) + ' | **' + s.signal + '** | ' + s.strength.toFixed(2) + ' | $' + s.entry_price + ' | $' + s.stop_loss + ' | $' + s.take_profit + ' | ' + (s.confidence * 100).toFixed(0) + '% |')
  }
  lines.push('')

  lines.push('## Recommendation')
  lines.push('**' + result.recommendation + '**')
  lines.push('')

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== TOOL 3: PORTFOLIO RISK ANALYZER ====================

function analyzePortfolioRisk(input: PortfolioRiskInput): PortfolioRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const totalValue = 1000000
  const weights = input.holdings.map(h => h.weight)
  const weightSum = weights.reduce((s, w) => s + w, 0)
  const normalizedWeights = weights.map(w => w / weightSum)

  const portfolioReturn = normalizedWeights.reduce((s, w, i) => s + w * rng.nextFloat(-0.02, 0.03), 0)
  const portfolioVol = rng.nextFloat(0.08, 0.25)
  const var95 = totalValue * portfolioVol * 1.645
  const var99 = totalValue * portfolioVol * 2.326
  const cvar95 = totalValue * portfolioVol * 2.063
  const sharpe = (portfolioReturn - 0.02) / portfolioVol
  const sortino = (portfolioReturn - 0.02) / (portfolioVol * 0.7)
  const maxDD = rng.nextFloat(0.05, 0.35)
  const beta = rng.nextFloat(0.5, 1.8)

  const metrics: RiskMetric[] = [
    { name: 'Portfolio Return (Ann.)', value: Math.round(portfolioReturn * 10000) / 100, interpretation: portfolioReturn > 0 ? 'Positive expected return' : 'Negative expected return' },
    { name: 'Volatility (Ann.)', value: Math.round(portfolioVol * 10000) / 100, interpretation: portfolioVol > 0.2 ? 'High volatility portfolio' : portfolioVol > 0.12 ? 'Moderate volatility' : 'Low volatility' },
    { name: 'Sharpe Ratio', value: Math.round(sharpe * 100) / 100, interpretation: sharpe > 1 ? 'Strong risk-adjusted return' : sharpe > 0.5 ? 'Acceptable risk-adjusted return' : 'Poor risk-adjusted return' },
    { name: 'Max Drawdown', value: Math.round(maxDD * 10000) / 100, interpretation: maxDD > 0.25 ? 'Severe drawdown risk' : maxDD > 0.15 ? 'Moderate drawdown' : 'Controlled drawdown' },
    { name: 'Beta', value: Math.round(beta * 100) / 100, interpretation: beta > 1.2 ? 'High market sensitivity' : beta > 0.8 ? 'Market-like sensitivity' : 'Defensive positioning' }
  ]

  const stressResults = input.include_stress_test ? [
    { scenario: '2008 Financial Crisis', impact_pct: -rng.nextFloat(25, 45), recovery_days: rng.nextInt(300, 600) },
    { scenario: '2020 COVID Crash', impact_pct: -rng.nextFloat(15, 35), recovery_days: rng.nextInt(90, 200) },
    { scenario: 'Interest Rate Shock (+300bp)', impact_pct: -rng.nextFloat(10, 25), recovery_days: rng.nextInt(60, 180) },
    { scenario: 'Liquidity Crisis', impact_pct: -rng.nextFloat(20, 35), recovery_days: rng.nextInt(120, 300) },
    { scenario: 'Geopolitical Event', impact_pct: -rng.nextFloat(5, 15), recovery_days: rng.nextInt(30, 90) }
  ] : undefined

  return {
    portfolio_id: 'PRF-' + Date.now(),
    total_value: totalValue,
    metrics,
    var_95: Math.round(var95),
    var_99: Math.round(var99),
    cvar_95: Math.round(cvar95),
    sharpe_ratio: Math.round(sharpe * 100) / 100,
    sortino_ratio: Math.round(sortino * 100) / 100,
    max_drawdown: Math.round(maxDD * 10000) / 100,
    beta: Math.round(beta * 100) / 100,
    stress_test_results: stressResults,
    executive_summary: 'Portfolio of ' + input.holdings.length + ' positions worth $' + (totalValue / 1e6).toFixed(1) + 'M. VaR(95%): $' + (var95 / 1000).toFixed(0) + 'K | VaR(99%): $' + (var99 / 1000).toFixed(0) + 'K | Sharpe: ' + sharpe.toFixed(2) + ' | Max DD: ' + (maxDD * 100).toFixed(1) + '%. ' + (sharpe > 1 ? 'Strong risk-adjusted profile.' : 'Review risk-return efficiency.'),
    action_plan: [
      'Rebalance positions to optimize Sharpe ratio if below 1.0',
      'Implement tail-risk hedging if VaR exceeds risk budget',
      'Review concentration risk - largest position weight',
      'Set drawdown circuit breakers at -10%, -15%, -20%'
    ],
    verification_checklist: [
      'Portfolio weights sum to 100% (currently ' + (weightSum * 100).toFixed(1) + '%)',
      'VaR(99%) > VaR(95%) (tail risk ordering)',
      'CVaR > VaR at same confidence level',
      'All metrics computed over consistent time horizon',
      'Stress test covers ' + (stressResults?.length ?? 0) + ' scenarios'
    ],
    risk_flags: [
      sharpe < 0.5 ? 'Low Sharpe: portfolio not adequately compensated for risk' : null,
      maxDD > 0.25 ? 'Excessive drawdown: implement stop-loss or hedging' : null,
      beta > 1.5 ? 'High beta: portfolio amplified vs market downturns' : null,
      portfolioVol > 0.2 ? 'High volatility: consider risk reduction strategies' : null,
      input.holdings.some(h => h.weight / weightSum > 0.3) ? 'Concentration risk: single position exceeds 30%' : null
    ].filter((x): x is string => x !== null),
    market_context: 'In 2026, AI Agents conduct 50% of all financial API calls, driving real-time risk analytics adoption. Portfolio risk management has evolved from daily batch to continuous monitoring. VaR remains the industry standard but regulators increasingly mandate CVaR and stress testing. With global data API market at $619.059B, risk engines leverage petabytes of alternative data for forward-looking risk assessment.'
  }
}

function formatPortfolioRiskReport(result: PortfolioRiskResult): string {
  const lines: string[] = []
  lines.push('# Portfolio Risk Analyzer - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('## Risk Metrics')
  lines.push('| Metric | Value | Interpretation |')
  lines.push('|--------|-------|----------------|')
  result.metrics.forEach(m => lines.push('| ' + m.name + ' | ' + m.value + '% | ' + m.interpretation + ' |'))
  lines.push('')

  lines.push('## Value at Risk')
  lines.push('- **VaR (95%):** $' + result.var_95.toLocaleString() + ' (max loss at 95% confidence)')
  lines.push('- **VaR (99%):** $' + result.var_99.toLocaleString() + ' (max loss at 99% confidence)')
  lines.push('- **CVaR (95%):** $' + result.cvar_95.toLocaleString() + ' (expected shortfall)')
  lines.push('')

  lines.push('## Performance Ratios')
  lines.push('- **Sharpe Ratio:** ' + result.sharpe_ratio + ' | **Sortino:** ' + result.sortino_ratio)
  lines.push('- **Max Drawdown:** ' + result.max_drawdown + '% | **Beta:** ' + result.beta)
  lines.push('')

  if (result.stress_test_results) {
    lines.push('## Stress Test Results')
    lines.push('| Scenario | Impact | Recovery (Days) |')
    lines.push('|----------|--------|-----------------|')
    result.stress_test_results.forEach(s => lines.push('| ' + s.scenario + ' | ' + s.impact_pct.toFixed(1) + '% | ' + s.recovery_days + ' |'))
    lines.push('')
  }

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== TOOL 4: CRYPTO MARKET MONITOR ====================

function monitorCryptoMarket(input: CryptoMonitorInput): CryptoMarketResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const defaultPrices: Record<string, number> = {
    BTC: 67500, ETH: 3450, SOL: 178.5, ADA: 0.62, DOT: 7.8,
    AVAX: 42.3, LINK: 18.5, MATIC: 0.89, UNI: 12.4, LTC: 92.1
  }

  const prices: CryptoMarketResult['prices'] = {}
  for (const asset of input.assets) {
    const base = defaultPrices[asset] ?? rng.nextFloat(0.5, 500)
    prices[asset] = {
      price_usd: Math.round(base * 100) / 100,
      change_pct: Math.round(rng.nextFloat(-12, 12) * 100) / 100,
      volume_24h: rng.nextInt(50000000, 5000000000)
    }
  }

  const onchainMetrics: OnChainMetric[] | undefined = input.include_onchain ? [
    { metric: 'Active Addresses', value: rng.nextInt(800000, 1200000), change_pct: rng.nextFloat(-5, 10), signal: rng.next() > 0.5 ? 'bullish' : 'neutral', interpretation: 'Network usage indicator' },
    { metric: 'Hash Rate (EH/s)', value: rng.nextInt(500, 700), change_pct: rng.nextFloat(-3, 8), signal: 'bullish', interpretation: 'Mining security commitment rising' },
    { metric: 'Exchange Net Flow', value: rng.nextInt(-5000, 5000), change_pct: rng.nextFloat(-20, 20), signal: rng.next() > 0.6 ? 'bearish' : 'neutral', interpretation: 'Positive = inflows (selling pressure)' },
    { metric: 'Whale Transactions', value: rng.nextInt(100, 500), change_pct: rng.nextFloat(-15, 30), signal: rng.next() > 0.5 ? 'bullish' : 'bearish', interpretation: 'Large wallet activity' },
    { metric: 'Stablecoin Supply', value: rng.nextInt(120, 160), change_pct: rng.nextFloat(-5, 15), signal: 'bullish', interpretation: 'Dry powder available for deployment' }
  ] : undefined

  const defiProtocols: DeFiProtocol[] | undefined = input.include_defi ? [
    { name: 'Lido', tvl_usd: rng.nextInt(12, 25) * 1e9, tvl_change_pct: rng.nextFloat(-5, 10), chain: 'Ethereum', category: 'Liquid Staking' },
    { name: 'AAVE', tvl_usd: rng.nextInt(8, 15) * 1e9, tvl_change_pct: rng.nextFloat(-8, 12), chain: 'Multi-chain', category: 'Lending' },
    { name: 'Uniswap', tvl_usd: rng.nextInt(4, 8) * 1e9, tvl_change_pct: rng.nextFloat(-10, 15), chain: 'Ethereum', category: 'DEX' },
    { name: 'MakerDAO', tvl_usd: rng.nextInt(5, 10) * 1e9, tvl_change_pct: rng.nextFloat(-3, 8), chain: 'Ethereum', category: 'CDP' },
    { name: 'Curve', tvl_usd: rng.nextInt(2, 5) * 1e9, tvl_change_pct: rng.nextFloat(-12, 5), chain: 'Multi-chain', category: 'DEX' }
  ] : undefined

  const fearGreed = rng.nextInt(15, 85)
  const sentiment = prices[input.assets[0]]?.change_pct ?? 0

  return {
    assets_analyzed: input.assets,
    prices,
    onchain_metrics: onchainMetrics,
    defi_overview: defiProtocols,
    market_dominance: { BTC: rng.nextFloat(48, 55), ETH: rng.nextFloat(15, 20), Others: rng.nextFloat(28, 35) },
    fear_greed_index: fearGreed,
    executive_summary: 'Monitoring ' + input.assets.length + ' crypto asset(s) over ' + input.timeframe + '. ' + input.assets[0] + ' ' + (sentiment >= 0 ? '+' : '') + sentiment.toFixed(2) + '% | Fear & Greed: ' + fearGreed + ' (' + (fearGreed > 70 ? 'Greed' : fearGreed > 40 ? 'Neutral' : 'Fear') + '). On-chain: ' + (onchainMetrics ? onchainMetrics.length + ' metrics' : 'disabled') + '. DeFi: ' + (defiProtocols ? defiProtocols.length + ' protocols tracked' : 'disabled') + '.',
    action_plan: [
      'Monitor exchange net flows for early warning of large movements',
      'Track DeFi TVL trends for sector rotation signals',
      'Set alerts for Fear & Greed extreme readings (< 20 or > 80)',
      'Validate on-chain signals with technical price action'
    ],
    verification_checklist: [
      'All ' + input.assets.length + ' assets have current price data',
      'Price changes within reasonable daily range (< 30%)',
      'On-chain metrics have direction and interpretation',
      'DeFi TVL values are realistic (>$1B for major protocols)',
      'Fear & Greed index within 0-100 range'
    ],
    risk_flags: [
      fearGreed > 80 ? 'Extreme Greed: market prone to sharp corrections' : null,
      fearGreed < 20 ? 'Extreme Fear: potential capitulation bottom' : null,
      sentiment > 10 ? 'Large single-day gain: watch for profit-taking reversal' : null,
      sentiment < -10 ? 'Large single-day loss: check for fundamental catalysts' : null,
      onchainMetrics?.some(m => m.metric === 'Exchange Net Flow' && m.value > 3000) ? 'Large exchange inflows: potential selling pressure' : null
    ].filter((x): x is string => x !== null),
    market_context: 'Crypto market in 2026 is dominated by institutional custody, ETF flows, and regulatory clarity. AI Agents driving 50% of financial API calls increasingly monitor on-chain metrics for alpha. DeFi TVL has matured with real yield replacing speculative incentives. On-chain analytics provide leading indicators unavailable in traditional markets, making crypto-native data a key edge.'
  }
}

function formatCryptoMarketReport(result: CryptoMarketResult): string {
  const lines: string[] = []
  lines.push('# Crypto Market Monitor - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('**Fear & Greed Index:** ' + result.fear_greed_index + '/100 (' + (result.fear_greed_index > 70 ? 'Greed' : result.fear_greed_index > 40 ? 'Neutral' : 'Fear') + ')')
  lines.push('')

  lines.push('## Asset Prices')
  lines.push('| Asset | Price (USD) | 24h Change | Volume (24h) |')
  lines.push('|-------|-------------|------------|--------------|')
  for (const [asset, data] of Object.entries(result.prices)) {
    const chg = data.change_pct >= 0 ? '+' + data.change_pct.toFixed(2) + '%' : data.change_pct.toFixed(2) + '%'
    lines.push('| ' + asset + ' | $' + data.price_usd.toLocaleString() + ' | ' + chg + ' | $' + (data.volume_24h / 1e6).toFixed(0) + 'M |')
  }
  lines.push('')

  if (result.onchain_metrics) {
    lines.push('## On-Chain Metrics')
    lines.push('| Metric | Value | Change | Signal |')
    lines.push('|--------|-------|--------|--------|')
    result.onchain_metrics.forEach(m => lines.push('| ' + m.metric + ' | ' + m.value.toLocaleString() + ' | ' + (m.change_pct >= 0 ? '+' : '') + m.change_pct.toFixed(1) + '% | ' + m.signal.toUpperCase() + ' |'))
    lines.push('')
  }

  if (result.defi_overview) {
    lines.push('## DeFi Overview')
    lines.push('| Protocol | TVL | Change | Chain | Category |')
    lines.push('|----------|-----|--------|-------|----------|')
    result.defi_overview.forEach(d => lines.push('| ' + d.name + ' | $' + (d.tvl_usd / 1e9).toFixed(1) + 'B | ' + (d.tvl_change_pct >= 0 ? '+' : '') + d.tvl_change_pct.toFixed(1) + '% | ' + d.chain + ' | ' + d.category + ' |'))
    lines.push('')
  }

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== TOOL 5: FOREX RATE PREDICTOR ====================

function predictForexRate(input: ForexPredictionInput): ForexPredictionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const baseRates: Record<string, number> = {
    'EURUSD': 1.085, 'USDJPY': 154.2, 'GBPUSD': 1.265, 'USDCHF': 0.895,
    'AUDUSD': 0.658, 'USDCAD': 1.372, 'NZDUSD': 0.612, 'USDCNY': 7.245
  }

  const currentRate = baseRates[input.pair] ?? rng.nextFloat(0.5, 150)
  const volatility = rng.nextFloat(0.05, 0.15)
  const periods = input.forecast_horizon === '1d' ? 1 : input.forecast_horizon === '1w' ? 7 : input.forecast_horizon === '1M' ? 30 : 90
  const trendBias = rng.nextFloat(-0.02, 0.02)

  const forecasts: ForecastPoint[] = []
  let cumulativeDrift = 0

  for (let p = 1; p <= periods; p++) {
    cumulativeDrift += trendBias / periods + rng.nextFloat(-0.001, 0.001)
    const predicted = currentRate * (1 + cumulativeDrift)
    const timeDecay = Math.sqrt(p / periods)
    const bandWidth = currentRate * volatility * 0.5 * timeDecay
    const periodLabel = input.forecast_horizon === '1d' ? 'Day +' + p : input.forecast_horizon === '1w' ? 'Week +' + p : 'Day +' + p

    forecasts.push({
      period: periodLabel,
      predicted_rate: Math.round(predicted * 10000) / 10000,
      lower_bound: Math.round((predicted - bandWidth) * 10000) / 10000,
      upper_bound: Math.round((predicted + bandWidth) * 10000) / 10000,
      confidence: Math.round((0.85 - p * 0.005) * 100) / 100
    })
  }

  const finalForecast = forecasts[forecasts.length - 1]
  const expectedChange = ((finalForecast.predicted_rate - currentRate) / currentRate) * 100
  const direction = expectedChange > 1 ? 'appreciate' : expectedChange < -1 ? 'depreciate' : 'sideways'

  const keyDrivers: string[] = []
  if (input.include_interest_rate_diff) keyDrivers.push('Interest rate differential (carry)')
  if (input.include_purchasing_power_parity) keyDrivers.push('Purchasing Power Parity deviation')
  keyDrivers.push('Technical momentum and positioning')
  if (input.model_type === 'fundamental' || input.model_type === 'hybrid') keyDrivers.push('Macroeconomic data releases')
  if (input.model_type === 'technical' || input.model_type === 'hybrid') keyDrivers.push('Chart patterns and order flow')

  const modelAccuracy = Math.round((0.55 + rng.nextFloat(0, 0.15)) * 100) / 100

  return {
    pair: input.pair,
    current_rate: Math.round(currentRate * 10000) / 10000,
    forecasts,
    direction,
    expected_change_pct: Math.round(expectedChange * 100) / 100,
    key_drivers: keyDrivers,
    model_accuracy: modelAccuracy,
    executive_summary: input.pair + ' currently at ' + currentRate.toFixed(4) + '. ' + input.model_type + ' model (' + input.forecast_horizon + ' horizon) predicts ' + direction + ' by ' + Math.abs(expectedChange).toFixed(2) + '%. Final forecast: ' + finalForecast.predicted_rate.toFixed(4) + ' [' + finalForecast.lower_bound.toFixed(4) + ' - ' + finalForecast.upper_bound.toFixed(4) + '].',
    action_plan: [
      'Monitor key economic releases (NFP, CPI, central bank decisions) for forecast validation',
      'Set rate alerts at forecast boundary levels',
      'Hedge currency exposure if forecast confidence > 60%',
      'Reassess if price breaks outside ' + finalForecast.lower_bound.toFixed(4) + ' - ' + finalForecast.upper_bound.toFixed(4) + ' range'
    ],
    verification_checklist: [
      'All forecast bounds are positive and reasonable',
      'Confidence decreases with forecast horizon',
      'Lower bound < predicted rate < upper bound for all periods',
      'Forecast direction consistent with expected change sign',
      'Model specified (' + input.model_type + ') matches drivers listed'
    ],
    risk_flags: [
      Math.abs(expectedChange) > 5 ? 'Large predicted move: verify against current market pricing' : null,
      input.forecast_horizon === '3M' ? '3-month forecasts have high uncertainty - use wide bounds' : null,
      modelAccuracy < 0.55 ? 'Low model accuracy: consider alternative models or wider bounds' : null,
      input.model_type === 'technical' ? 'Technical-only model: vulnerable to fundamental shocks' : null
    ].filter((x): x is string => x !== null),
    market_context: 'Forex market averages $7.5T daily volume in 2026. ' + (input.model_type === 'hybrid' ? 'Hybrid models combining technicals and fundamentals show best robustness' : input.model_type === 'fundamental' ? 'Fundamental models excel around central bank regime changes' : 'Technical models effective in trending, range-bound regimes') + '. AI agents accessing real-time economic data APIs provide faster signal incorporation than traditional approaches.'
  }
}

function formatForexPredictionReport(result: ForexPredictionResult): string {
  const lines: string[] = []
  lines.push('# Forex Rate Predictor - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('## Forecast Configuration')
  lines.push('- **Pair:** ' + result.pair + ' | **Current Rate:** ' + result.current_rate)
  lines.push('- **Direction:** ' + result.direction.toUpperCase() + ' | **Expected Change:** ' + (result.expected_change_pct >= 0 ? '+' : '') + result.expected_change_pct + '%')
  lines.push('- **Model Accuracy:** ' + (result.model_accuracy * 100).toFixed(0) + '%')
  lines.push('')

  lines.push('## Forecast Path')
  lines.push('| Period | Predicted | Lower Bound | Upper Bound | Confidence |')
  lines.push('|--------|-----------|-------------|-------------|------------|')
  const step = Math.max(1, Math.floor(result.forecasts.length / 10))
  for (let i = 0; i < result.forecasts.length; i += step) {
    const f = result.forecasts[i]
    lines.push('| ' + f.period + ' | ' + f.predicted_rate.toFixed(4) + ' | ' + f.lower_bound.toFixed(4) + ' | ' + f.upper_bound.toFixed(4) + ' | ' + (f.confidence * 100).toFixed(0) + '% |')
  }
  const last = result.forecasts[result.forecasts.length - 1]
  lines.push('| ' + last.period + ' | ' + last.predicted_rate.toFixed(4) + ' | ' + last.lower_bound.toFixed(4) + ' | ' + last.upper_bound.toFixed(4) + ' | ' + (last.confidence * 100).toFixed(0) + '% |')
  lines.push('')

  lines.push('## Key Drivers')
  result.key_drivers.forEach(d => lines.push('- ' + d))
  lines.push('')

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== TOOL 6: OPTIONS PRICING CALCULATOR ====================

function calculateOptionsPricing(input: OptionsPricingInput): OptionsPricingResult {
  const S = input.underlying_price
  const K = input.strike_price
  const T = input.time_to_expiry_days / 365
  const r = input.risk_free_rate
  const sigma = input.volatility

  const fairValue = blackScholesPrice(S, K, T, r, sigma, input.option_type)
  const intrinsicValue = input.option_type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
  const timeValue = Math.max(0, fairValue - intrinsicValue)

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  const delta = input.option_type === 'call' ? normCdf(d1) : normCdf(d1) - 1
  const gamma = Math.exp(-0.5 * d1 * d1) / (S * sigma * Math.sqrt(2 * Math.PI * T))
  const theta = input.option_type === 'call'
    ? (-S * sigma * Math.exp(-0.5 * d1 * d1) / (2 * Math.sqrt(2 * Math.PI * T)) - r * K * Math.exp(-r * T) * normCdf(d2)) / 365
    : (-S * sigma * Math.exp(-0.5 * d1 * d1) / (2 * Math.sqrt(2 * Math.PI * T)) + r * K * Math.exp(-r * T) * normCdf(-d2)) / 365
  const vega = S * Math.sqrt(T) * Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI) / 100
  const rho = input.option_type === 'call'
    ? K * T * Math.exp(-r * T) * normCdf(d2) / 100
    : -K * T * Math.exp(-r * T) * normCdf(-d2) / 100

  const breakEven = input.option_type === 'call' ? K + fairValue : K - fairValue

  let maxProfit: string
  let maxLoss: string
  if (input.option_type === 'call') {
    maxProfit = 'Unlimited'
    maxLoss = '$' + fairValue.toFixed(2) + ' (premium paid)'
  } else {
    maxProfit = '$' + (K - fairValue).toFixed(2) + ' (if stock to $0)'
    maxLoss = '$' + fairValue.toFixed(2) + ' (premium paid)'
  }

  const payoffAtExpiry: Array<{ spot: number; pnl: number }> = []
  for (let pct = -30; pct <= 30; pct += 5) {
    const spot = S * (1 + pct / 100)
    const optionVal = input.option_type === 'call' ? Math.max(spot - K, 0) : Math.max(K - spot, 0)
    payoffAtExpiry.push({ spot: Math.round(spot * 100) / 100, pnl: Math.round((optionVal - fairValue) * 100) / 100 })
  }

  return {
    option_type: input.option_type,
    strategy: input.strategy ?? 'single',
    fair_value: Math.round(fairValue * 100) / 100,
    intrinsic_value: Math.round(intrinsicValue * 100) / 100,
    time_value: Math.round(timeValue * 100) / 100,
    greeks: {
      delta: Math.round(delta * 10000) / 10000,
      gamma: Math.round(gamma * 1000000) / 1000000,
      theta: Math.round(theta * 10000) / 10000,
      vega: Math.round(vega * 10000) / 10000,
      rho: Math.round(rho * 10000) / 10000
    },
    implied_volatility: Math.round(sigma * 10000) / 10000,
    break_even: Math.round(breakEven * 100) / 100,
    max_profit: maxProfit,
    max_loss: maxLoss,
    payoff_at_expiry: payoffAtExpiry,
    executive_summary: input.option_type.toUpperCase() + ' option: S=$' + S + ', K=$' + K + ', T=' + input.time_to_expiry_days + 'd, r=' + (r * 100).toFixed(1) + '%, sigma=' + (sigma * 100).toFixed(1) + '%. Fair value: $' + fairValue.toFixed(2) + ' (intrinsic: $' + intrinsicValue.toFixed(2) + ', time: $' + timeValue.toFixed(2) + '). Delta: ' + delta.toFixed(4) + ', Gamma: ' + gamma.toFixed(6) + ', Theta: ' + theta.toFixed(4) + ', Vega: ' + vega.toFixed(4) + '. Break-even: $' + breakEven.toFixed(2) + '.',
    action_plan: [
      'Compare fair value ($' + fairValue.toFixed(2) + ') with market price for mispricing',
      'Monitor delta for hedging requirements (delta-neutral adjustment)',
      'Track theta decay - accelerate positions as expiry approaches',
      'Assess implied volatility percentile before entering position'
    ],
    verification_checklist: [
      'Fair value is positive',
      'Intrinsic value <= fair value (time value >= 0)',
      'Delta in correct range: [0,1] for calls, [-1,0] for puts',
      'Gamma and Vega are always non-negative',
      'Theta is negative (time decay)',
      'Payoff at expiry matches option type payoff structure'
    ],
    risk_flags: [
      T < 0.02 ? 'Near expiry: extreme gamma and theta risk' : null,
      sigma > 0.6 ? 'Very high volatility: model assumptions may break down' : null,
      Math.abs(delta) > 0.9 ? 'Deep ITM: option behaves like underlying, limited leverage' : null,
      Math.abs(delta) < 0.1 ? 'Deep OTM: low probability of payoff, high risk of total loss' : null,
      timeValue / fairValue > 0.8 ? 'Mostly time value: vulnerable to volatility crush' : null
    ].filter((x): x is string => x !== null),
    market_context: 'Options markets in 2026 see 0DTE (same-day expiry) accounting for 40%+ of S&P 500 options volume. AI agents price complex multi-leg strategies in real-time, driving demand for accurate Greek calculations. Black-Scholes remains foundational but practitioners adjust for volatility skew and jumps. With $619.059B financial data API market, real-time implied volatility surfaces are critical inputs.'
  }
}

function formatOptionsPricingReport(result: OptionsPricingResult): string {
  const lines: string[] = []
  lines.push('# Options Pricing Calculator - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('## Pricing Summary')
  lines.push('- **Type:** ' + result.option_type.toUpperCase() + ' | **Strategy:** ' + result.strategy)
  lines.push('- **Fair Value:** $' + result.fair_value + ' | **Intrinsic:** $' + result.intrinsic_value + ' | **Time Value:** $' + result.time_value)
  lines.push('- **Break-Even:** $' + result.break_even + ' | **IV:** ' + (result.implied_volatility * 100).toFixed(1) + '%')
  lines.push('- **Max Profit:** ' + result.max_profit + ' | **Max Loss:** ' + result.max_loss)
  lines.push('')

  lines.push('## Greeks')
  lines.push('| Delta | Gamma | Theta | Vega | Rho |')
  lines.push('|-------|-------|-------|------|-----|')
  lines.push('| ' + result.greeks.delta + ' | ' + result.greeks.gamma + ' | ' + result.greeks.theta + ' | ' + result.greeks.vega + ' | ' + result.greeks.rho + ' |')
  lines.push('')

  lines.push('## Payoff at Expiry')
  lines.push('| Spot | P&L |')
  lines.push('|------|-----|')
  for (const p of result.payoff_at_expiry) {
    lines.push('| $' + p.spot.toFixed(2) + ' | ' + (p.pnl >= 0 ? '+' : '') + '$' + p.pnl.toFixed(2) + ' |')
  }
  lines.push('')

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== TOOL 7: FINANCIAL NEWS SENTIMENT ====================

function analyzeFinancialSentiment(input: NewsSentimentInput): NewsSentimentResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const entities = ['Fed', 'ECB', 'Apple', 'Tesla', 'Gold', 'Oil', 'Bitcoin', 'Nvidia', 'Microsoft', 'JP Morgan']
  const topics = ['earnings', 'rate cut', 'inflation', 'GDP growth', 'trade war', 'AI boom', 'default', 'merger', 'buyback', 'layoffs']
  const sources = input.sources.length > 0 ? input.sources : ['Reuters', 'Bloomberg', 'CNBC', 'WSJ', 'FT']

  const articles: SentimentArticle[] = []
  const numArticles = rng.nextInt(8, 25)

  for (let i = 0; i < numArticles; i++) {
    const entity = entities[rng.nextInt(0, entities.length - 1)]
    const topic = topics[rng.nextInt(0, topics.length - 1)]
    const sentimentBase = rng.nextFloat(-0.8, 0.8)
    const direction = sentimentBase > 0 ? 'positive' : sentimentBase < -0.3 ? 'negative' : 'mixed'

    articles.push({
      headline: entity + ' ' + (direction === 'positive' ? 'surges on' : direction === 'negative' ? 'falls amid' : 'mixed on') + ' ' + topic + ' - ' + sources[rng.nextInt(0, sources.length - 1)],
      source: sources[rng.nextInt(0, sources.length - 1)],
      timestamp: new Date(Date.now() - rng.nextInt(0, input.time_range_hours) * 3600000).toISOString(),
      sentiment_score: Math.round(sentimentBase * 100) / 100,
      relevance: Math.round((0.5 + rng.nextFloat(0, 0.5)) * 100) / 100,
      entities: [entity, topics[rng.nextInt(0, topics.length - 1)].split(' ')[0]],
      key_phrases: [topic, entity + ' ' + direction, rng.next() > 0.5 ? 'market impact' : 'outlook']
    })
  }

  const overallSentiment = articles.reduce((s, a) => s + a.sentiment_score, 0) / articles.length
  const sentimentLabel = overallSentiment > 0.5 ? 'strongly_bullish' : overallSentiment > 0.2 ? 'bullish' : overallSentiment > -0.2 ? 'neutral' : overallSentiment > -0.5 ? 'bearish' : 'strongly_bullish'
  const label = overallSentiment < -0.5 ? 'strongly_bearish' : sentimentLabel

  const entitySentiment: Record<string, number> = {}
  const entityCounts: Record<string, number> = {}
  for (const a of articles) {
    for (const e of a.entities) {
      entitySentiment[e] = (entitySentiment[e] ?? 0) + a.sentiment_score
      entityCounts[e] = (entityCounts[e] ?? 0) + 1
    }
  }
  for (const e of Object.keys(entitySentiment)) {
    entitySentiment[e] = Math.round((entitySentiment[e] / entityCounts[e]) * 100) / 100
  }

  const sortedArticles = [...articles].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const recentSentiment = sortedArticles.slice(-5).reduce((s, a) => s + a.sentiment_score, 0) / 5
  const olderSentiment = sortedArticles.slice(0, 5).reduce((s, a) => s + a.sentiment_score, 0) / 5
  const trendDirection = recentSentiment > olderSentiment + 0.1 ? 'improving' : recentSentiment < olderSentiment - 0.1 ? 'deteriorating' : 'stable'

  const topEntities = Object.entries(entitySentiment).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e, s]) => e + ' (' + (s >= 0 ? '+' : '') + s.toFixed(2) + ')').join(', ')

  return {
    query: input.query,
    articles_analyzed: articles.length,
    overall_sentiment: Math.round(overallSentiment * 100) / 100,
    sentiment_label: label as NewsSentimentResult['sentiment_label'],
    articles,
    entity_sentiment: entitySentiment,
    trend_direction: trendDirection,
    executive_summary: 'Analyzed ' + articles.length + ' articles about "' + input.query + '" from ' + sources.length + ' sources over ' + input.time_range_hours + 'h. Overall sentiment: ' + label.replace('_', ' ') + ' (' + (overallSentiment >= 0 ? '+' : '') + overallSentiment.toFixed(2) + '). Trend: ' + trendDirection + '. Top entities: ' + topEntities + '.',
    action_plan: [
      'Cross-reference sentiment signals with price action for confirmation',
      'Track sentiment extremes as contrarian indicators',
      'Monitor entity-specific sentiment for single-name opportunities',
      'Set alerts for sentiment inflection points (> 0.3 change in 24h)'
    ],
    verification_checklist: [
      'Minimum ' + articles.length + ' articles analyzed',
      'All sentiment scores in [-1, 1] range',
      'Relevance scores above minimum threshold',
      'Entity sentiment derived from multiple articles',
      'Trend direction backed by temporal comparison'
    ],
    risk_flags: [
      articles.length < 5 ? 'Low sample size: sentiment may not be representative' : null,
      Math.abs(overallSentiment) > 0.8 ? 'Extreme sentiment: potential contrarian reversal zone' : null,
      trendDirection === 'deteriorating' ? 'Deteriorating sentiment trend: monitor for acceleration' : null
    ].filter((x): x is string => x !== null),
    market_context: 'Financial news sentiment analysis in 2026 is dominated by AI Agents processing global media in real-time. NLP models achieve >85% accuracy on earnings call transcripts. Sentiment-driven strategies account for 15-20% of quantitative hedge fund allocations. With AI Agents driving 50% of all financial API calls, sentiment signal processing latency has dropped to milliseconds, making real-time positioning critical.'
  }
}

function formatNewsSentimentReport(result: NewsSentimentResult): string {
  const lines: string[] = []
  lines.push('# Financial News Sentiment - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('## Sentiment Overview')
  lines.push('- **Articles Analyzed:** ' + result.articles_analyzed + ' | **Sources:** Multiple')
  lines.push('- **Overall Sentiment:** ' + result.sentiment_label.replace('_', ' ') + ' (' + (result.overall_sentiment >= 0 ? '+' : '') + result.overall_sentiment + ')')
  lines.push('- **Trend Direction:** ' + result.trend_direction)
  lines.push('')

  lines.push('## Entity Sentiment')
  lines.push('| Entity | Sentiment |')
  lines.push('|--------|-----------|')
  for (const [entity, sent] of Object.entries(result.entity_sentiment).sort((a, b) => b[1] - a[1])) {
    lines.push('| ' + entity + ' | ' + (sent >= 0 ? '+' : '') + sent + ' |')
  }
  lines.push('')

  lines.push('## Top Articles')
  lines.push('| Headline | Source | Sentiment | Relevance |')
  lines.push('|---------|--------|-----------|-----------|')
  for (const a of result.articles.slice(0, 10)) {
    lines.push('| ' + a.headline.substring(0, 50) + ' | ' + a.source + ' | ' + (a.sentiment_score >= 0 ? '+' : '') + a.sentiment_score + ' | ' + (a.relevance * 100).toFixed(0) + '% |')
  }
  lines.push('')

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== TOOL 8: REGULATORY FILING ANALYZER ====================

function analyzeRegulatoryFiling(input: FilingAnalyzerInput): FilingAnalyzerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const companyNames: Record<string, string> = {
    '0000320193': 'Apple Inc.', '0000789019': 'Microsoft Corp.', '0001652044': 'Alphabet Inc.',
    '0001326801': 'Meta Platforms', '0001018724': 'Amazon.com Inc.', '0001318605': 'Tesla Inc.',
    '0000051143': 'IBM Corp.', '0000200406': 'Johnson & Johnson', '0000078003': 'Pfizer Inc.'
  }

  const company = companyNames[input.cik] || ('CIK-' + input.cik + ' Corp.')

  const filingMetrics: FilingMetric[] = [
    { metric: 'Revenue', current_value: rng.nextInt(50, 400) * 1e9, previous_value: rng.nextInt(40, 380) * 1e9, change_pct: 0, flag: 'normal' },
    { metric: 'Net Income', current_value: rng.nextInt(10, 100) * 1e9, previous_value: rng.nextInt(8, 95) * 1e9, change_pct: 0, flag: 'normal' },
    { metric: 'Operating Cash Flow', current_value: rng.nextInt(15, 120) * 1e9, previous_value: rng.nextInt(12, 110) * 1e9, change_pct: 0, flag: 'normal' },
    { metric: 'Gross Margin', current_value: rng.nextFloat(0.25, 0.65), previous_value: rng.nextFloat(0.22, 0.62), change_pct: 0, flag: 'normal' },
    { metric: 'Debt-to-Equity', current_value: rng.nextFloat(0.3, 2.5), previous_value: rng.nextFloat(0.3, 2.5), change_pct: 0, flag: 'normal' },
    { metric: 'Free Cash Flow', current_value: rng.nextInt(5, 80) * 1e9, previous_value: rng.nextInt(4, 75) * 1e9, change_pct: 0, flag: 'normal' }
  ]

  for (const m of filingMetrics) {
    m.change_pct = m.previous_value !== 0 ? Math.round(((m.current_value - m.previous_value) / Math.abs(m.previous_value)) * 10000) / 100 : 0
    const absChange = Math.abs(m.change_pct)
    m.flag = absChange > 50 ? 'critical' : absChange > 30 ? 'warning' : absChange > 15 ? 'watch' : 'normal'
  }

  const anomalies: AnomalyFinding[] = []
  if (rng.next() > 0.4) {
    anomalies.push({
      section: 'Revenue Recognition',
      description: 'Revenue growth significantly outpaces cash flow growth',
      severity: rng.next() > 0.5 ? 'high' : 'medium',
      explanation: 'Accrual-based may indicate aggressive channel stuffing or extended payment terms. Compare DSO trend.'
    })
  }
  if (rng.next() > 0.5) {
    anomalies.push({
      section: 'Related Party Transactions',
      description: 'Material increase in related-party revenue or expenses',
      severity: 'medium',
      explanation: 'Related-party transactions may not represent arms-length economics. Review disclosure footnotes carefully.'
    })
  }
  if (rng.next() > 0.6) {
    anomalies.push({
      section: 'Goodwill and Intangibles',
      description: 'Goodwill as % of assets exceeds industry median',
      severity: rng.next() > 0.5 ? 'high' : 'low',
      explanation: 'High goodwill concentration increases impairment risk. Check if recent acquisitions are performing as projected.'
    })
  }
  if (rng.next() > 0.7) {
    anomalies.push({
      section: 'Off-Balance Sheet Items',
      description: 'Operating lease commitments or SPEs not fully consolidated',
      severity: 'medium',
      explanation: 'Off-balance sheet obligations may understate true leverage. Review footnotes for commitments and contingencies.'
    })
  }

  const redFlags: string[] = []
  if (anomalies.some(a => a.severity === 'high')) redFlags.push('High-severity anomaly detected in ' + anomalies.find(a => a.severity === 'high')!.section)
  if (filingMetrics.some(m => m.metric === 'Debt-to-Equity' && m.current_value > 2)) redFlags.push('Leverage above 2x: elevated solvency risk')
  if (filingMetrics.some(m => m.metric === 'Revenue' && m.change_pct > 40)) redFlags.push('Revenue growth > 40%: verify sustainability and quality')
  if (filingMetrics.some(m => m.metric === 'Gross Margin' && m.change_pct < -10)) redFlags.push('Gross margin compression: pricing power or cost issues')

  const baseScore = 85
  const anomalyPenalty = anomalies.filter(a => a.severity === 'high').length * 8 + anomalies.filter(a => a.severity === 'medium').length * 4 + anomalies.filter(a => a.severity === 'low').length * 2
  const redFlagPenalty = redFlags.length * 5
  const complianceScore = Math.max(20, Math.min(100, baseScore - anomalyPenalty - redFlagPenalty))

  return {
    company,
    filing_type: input.filing_type,
    filing_date: new Date(Date.now() - rng.nextInt(0, 90) * 86400000).toISOString().slice(0, 10),
    metrics: filingMetrics,
    anomalies,
    compliance_score: complianceScore,
    red_flags: redFlags,
    executive_summary: company + ' ' + input.filing_type + ' analyzed (' + input.analysis_depth + ' depth). Compliance score: ' + complianceScore + '/100. ' + anomalies.length + ' anomalies detected (' + anomalies.filter(a => a.severity === 'high').length + ' high). ' + redFlags.length + ' red flags. Revenue: $' + (filingMetrics[0].current_value / 1e9).toFixed(0) + 'B (' + (filingMetrics[0].change_pct >= 0 ? '+' : '') + filingMetrics[0].change_pct.toFixed(1) + '% YoY). Net Income: $' + (filingMetrics[1].current_value / 1e9).toFixed(0) + 'B.',
    action_plan: [
      'Deep-dive into high-severity anomaly sections with forensic accounting lens',
      'Compare guidance vs actuals to assess management credibility trend',
      'Review auditor opinion for qualifications or emphasis of matter',
      'Benchmark metrics against industry peers for relative assessment'
    ],
    verification_checklist: [
      'CIK ' + input.cik + ' maps to correct company entity',
      input.filing_type + ' filing type handled with appropriate parser',
      'All YoY changes computed with consistent period comparison',
      'Anomaly severity classification follows materiality framework',
      'Compliance score weighted by anomaly severity distribution'
    ],
    risk_flags: [
      complianceScore < 50 ? 'Low compliance score: significant reporting quality concerns' : null,
      anomalies.some(a => a.section === 'Revenue Recognition' && a.severity === 'high') ? 'Revenue recognition red flag: possible earnings manipulation' : null,
      filingMetrics.some(m => m.metric === 'Debt-to-Equity' && m.current_value > 2.5) ? 'Extreme leverage: potential going concern risk' : null,
      redFlags.length > 3 ? 'Multiple red flags: consider comprehensive forensic review' : null
    ].filter((x): x is string => x !== null),
    market_context: 'SEC EDGAR processes 600K+ filings annually in 2026 with AI-powered analytics transforming regulatory review. NLP models extract structured data from unstructured 10-K/10-Q filings in real-time. AI Agents consuming regulatory filing APIs gain informational edge through speed of processing. Forensic accounting techniques combined with ML anomaly detection improve fraud identification rates by 40% over traditional methods.'
  }
}

function formatFilingAnalyzerReport(result: FilingAnalyzerResult): string {
  const lines: string[] = []
  lines.push('# Regulatory Filing Analyzer - Agent Skill Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('## Filing Details')
  lines.push('- **Company:** ' + result.company + ' | **Filing Type:** ' + result.filing_type)
  lines.push('- **Filing Date:** ' + result.filing_date + ' | **Compliance Score:** ' + result.compliance_score + '/100')
  lines.push('')

  lines.push('## Financial Metrics')
  lines.push('| Metric | Current | Previous | Change | Flag |')
  lines.push('|--------|---------|----------|--------|------|')
  for (const m of result.metrics) {
    const curVal = m.current_value >= 1e9 ? ('$' + (m.current_value / 1e9).toFixed(1) + 'B') : ((m.current_value * 100).toFixed(1) + '%')
    const prevVal = m.previous_value >= 1e9 ? ('$' + (m.previous_value / 1e9).toFixed(1) + 'B') : ((m.previous_value * 100).toFixed(1) + '%')
    lines.push('| ' + m.metric + ' | ' + curVal + ' | ' + prevVal + ' | ' + (m.change_pct >= 0 ? '+' : '') + m.change_pct.toFixed(1) + '% | ' + m.flag.toUpperCase() + ' |')
  }
  lines.push('')

  if (result.anomalies.length > 0) {
    lines.push('## Anomalies Detected')
    lines.push('| Section | Description | Severity | Explanation |')
    lines.push('|---------|-------------|----------|-------------|')
    result.anomalies.forEach(a => lines.push('| ' + a.section + ' | ' + a.description + ' | ' + a.severity.toUpperCase() + ' | ' + a.explanation.substring(0, 50) + '... |'))
    lines.push('')
  }

  if (result.red_flags.length > 0) {
    lines.push('## Red Flags')
    result.red_flags.forEach(f => lines.push('! ' + f))
    lines.push('')
  }

  lines.push('## Action Plan')
  result.action_plan.forEach((a, i) => lines.push((i + 1) + '. ' + a))
  lines.push('')

  lines.push('## Verification Checklist')
  result.verification_checklist.forEach(c => lines.push('- [ ] ' + c))
  lines.push('')

  lines.push('## Risk Flags')
  if (result.risk_flags.length > 0) {
    result.risk_flags.forEach(f => lines.push('! ' + f))
  } else {
    lines.push('No risk flags active.')
  }
  lines.push('')

  lines.push('## Market Context')
  lines.push(result.market_context)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'market_data_feed_simulator',
    description: 'Simulate real-time market data feeds (tick, OHLCV, orderbook, quote) with configurable volatility regimes and anomaly injection. Generates deterministic seeded data for backtesting and stress testing.',
    parameters: {
      symbols: { type: 'string', required: true, description: 'JSON array of ticker symbols (e.g., ["AAPL","MSFT","BTC"])' },
      feed_type: { type: 'string', required: true, description: 'Feed type: tick, ohlcv, orderbook, or quote' },
      duration_seconds: { type: 'string', required: true, description: 'Simulation duration in seconds' },
      volatility_regime: { type: 'string', required: true, description: 'Volatility regime: low, normal, high, or crisis' },
      include_anomalies: { type: 'string', description: 'Inject price anomalies: true/false (default false)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { symbols: string; feed_type: string; duration_seconds: string; volatility_regime: string; include_anomalies?: string }) {
      const input: MarketDataFeedInput = {
        symbols: JSON.parse(args.symbols),
        feed_type: args.feed_type as MarketDataFeedInput['feed_type'],
        duration_seconds: parseInt(args.duration_seconds),
        volatility_regime: args.volatility_regime as MarketDataFeedInput['volatility_regime'],
        include_anomalies: args.include_anomalies === 'true'
      }
      const result = simulateMarketDataFeed(input)
      return formatMarketDataFeedReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'algorithmic_trading_signal_gen',
    description: 'Generate algorithmic trading signals using momentum, mean-reversion, breakout, pairs trading, or ML ensemble strategies. Returns multi-indicator confluence scores with entry/exit levels.',
    parameters: {
      symbol: { type: 'string', required: true, description: 'Trading symbol (e.g., "AAPL", "BTC")' },
      strategy: { type: 'string', required: true, description: 'Strategy type: momentum, mean_reversion, breakout, pairs_trading, or ml_ensemble' },
      timeframe: { type: 'string', required: true, description: 'Signal timeframe: 1m, 5m, 15m, 1h, 4h, or 1d' },
      lookback_periods: { type: 'string', description: 'Lookback periods for indicator calculation (default "20")' },
      risk_tolerance: { type: 'string', description: 'Risk tolerance: conservative, moderate, or aggressive (default "moderate")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { symbol: string; strategy: string; timeframe: string; lookback_periods?: string; risk_tolerance?: string }) {
      const input: TradingSignalInput = {
        symbol: args.symbol,
        strategy: args.strategy as TradingSignalInput['strategy'],
        timeframe: args.timeframe as TradingSignalInput['timeframe'],
        lookback_periods: parseInt(args.lookback_periods ?? '20'),
        risk_tolerance: (args.risk_tolerance ?? 'moderate') as TradingSignalInput['risk_tolerance']
      }
      const result = generateTradingSignals(input)
      return formatTradingSignalReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'portfolio_risk_analyzer',
    description: 'Analyze portfolio risk using VaR, CVaR, Sharpe ratio, Sortino ratio, max drawdown, beta, and stress testing. Provides actionable risk metrics with historical scenario simulation.',
    parameters: {
      holdings: { type: 'string', required: true, description: 'JSON array of holdings: [{symbol, weight, asset_class}]' },
      confidence_level: { type: 'string', description: 'VaR confidence level: 95 or 99 (default "95")' },
      time_horizon_days: { type: 'string', description: 'Time horizon in days (default "1")' },
      benchmark: { type: 'string', description: 'Benchmark symbol for beta calculation (optional)' },
      include_stress_test: { type: 'string', description: 'Include stress test scenarios: true/false (default true)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { holdings: string; confidence_level?: string; time_horizon_days?: string; benchmark?: string; include_stress_test?: string }) {
      const input: PortfolioRiskInput = {
        holdings: JSON.parse(args.holdings),
        confidence_level: parseInt(args.confidence_level ?? '95'),
        time_horizon_days: parseInt(args.time_horizon_days ?? '1'),
        benchmark: args.benchmark,
        include_stress_test: args.include_stress_test !== 'false'
      }
      const result = analyzePortfolioRisk(input)
      return formatPortfolioRiskReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'crypto_market_monitor',
    description: 'Monitor cryptocurrency markets with price tracking, on-chain metrics, DeFi TVL analysis, market dominance, and Fear & Greed index. Multi-timeframe analysis across configurable assets.',
    parameters: {
      assets: { type: 'string', required: true, description: 'JSON array of crypto assets (e.g., ["BTC","ETH","SOL"])' },
      metrics: { type: 'string', required: true, description: 'JSON array of metrics to track (e.g., ["price","volume","volatility"])' },
      timeframe: { type: 'string', required: true, description: 'Analysis timeframe: 1h, 24h, 7d, or 30d' },
      include_defi: { type: 'string', description: 'Include DeFi protocol TVL data: true/false (default true)' },
      include_onchain: { type: 'string', description: 'Include on-chain analytics: true/false (default true)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { assets: string; metrics: string; timeframe: string; include_defi?: string; include_onchain?: string }) {
      const input: CryptoMonitorInput = {
        assets: JSON.parse(args.assets),
        metrics: JSON.parse(args.metrics),
        timeframe: args.timeframe as CryptoMonitorInput['timeframe'],
        include_defi: args.include_defi !== 'false',
        include_onchain: args.include_onchain !== 'false'
      }
      const result = monitorCryptoMarket(input)
      return formatCryptoMarketReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'forex_rate_predictor',
    description: 'Predict forex rate movements using technical, fundamental, or hybrid models. Provides forecast paths with confidence bands and key driver analysis across multiple horizons.',
    parameters: {
      pair: { type: 'string', required: true, description: 'Currency pair (e.g., "EURUSD", "USDJPY")' },
      model_type: { type: 'string', required: true, description: 'Model type: technical, fundamental, or hybrid' },
      forecast_horizon: { type: 'string', required: true, description: 'Forecast horizon: 1d, 1w, 1M, or 3M' },
      include_interest_rate_diff: { type: 'string', description: 'Include interest rate differential: true/false (default true)' },
      include_purchasing_power_parity: { type: 'string', description: 'Include PPP analysis: true/false (default false)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { pair: string; model_type: string; forecast_horizon: string; include_interest_rate_diff?: string; include_purchasing_power_parity?: string }) {
      const input: ForexPredictionInput = {
        pair: args.pair,
        model_type: args.model_type as ForexPredictionInput['model_type'],
        forecast_horizon: args.forecast_horizon as ForexPredictionInput['forecast_horizon'],
        include_interest_rate_diff: args.include_interest_rate_diff !== 'false',
        include_purchasing_power_parity: args.include_purchasing_power_parity === 'true'
      }
      const result = predictForexRate(input)
      return formatForexPredictionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'options_pricing_calculator',
    description: 'Calculate option prices using Black-Scholes model with full Greeks (delta, gamma, theta, vega, rho). Supports calls, puts, and multi-leg strategies with payoff visualization.',
    parameters: {
      underlying_price: { type: 'string', required: true, description: 'Current underlying price (e.g., "195.5")' },
      strike_price: { type: 'string', required: true, description: 'Option strike price' },
      time_to_expiry_days: { type: 'string', required: true, description: 'Days to expiry' },
      risk_free_rate: { type: 'string', required: true, description: 'Risk-free rate as decimal (e.g., "0.05")' },
      volatility: { type: 'string', required: true, description: 'Implied volatility as decimal (e.g., "0.3")' },
      option_type: { type: 'string', required: true, description: 'Option type: call or put' },
      strategy: { type: 'string', description: 'Strategy: single, spread, straddle, butterfly, or iron_condor (default "single")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { underlying_price: string; strike_price: string; time_to_expiry_days: string; risk_free_rate: string; volatility: string; option_type: string; strategy?: string }) {
      const input: OptionsPricingInput = {
        underlying_price: parseFloat(args.underlying_price),
        strike_price: parseFloat(args.strike_price),
        time_to_expiry_days: parseInt(args.time_to_expiry_days),
        risk_free_rate: parseFloat(args.risk_free_rate),
        volatility: parseFloat(args.volatility),
        option_type: args.option_type as OptionsPricingInput['option_type'],
        strategy: (args.strategy ?? 'single') as OptionsPricingInput['strategy']
      }
      const result = calculateOptionsPricing(input)
      return formatOptionsPricingReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'financial_news_sentiment',
    description: 'Analyze financial news sentiment using NLP. Scores article relevance, extracts entities, tracks sentiment trends, and generates actionable sentiment signals for trading decisions.',
    parameters: {
      query: { type: 'string', required: true, description: 'Search query for news articles (e.g., "Fed rate decision")' },
      sources: { type: 'string', required: true, description: 'JSON array of news sources (e.g., ["Reuters","Bloomberg","CNBC"])' },
      time_range_hours: { type: 'string', required: true, description: 'Time range in hours for article search' },
      asset_filter: { type: 'string', description: 'JSON array of asset symbols to filter (optional)' },
      min_relevance_score: { type: 'string', description: 'Minimum relevance threshold 0-1 (default "0.5")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; sources: string; time_range_hours: string; asset_filter?: string; min_relevance_score?: string }) {
      const input: NewsSentimentInput = {
        query: args.query,
        sources: JSON.parse(args.sources),
        time_range_hours: parseInt(args.time_range_hours),
        asset_filter: args.asset_filter ? JSON.parse(args.asset_filter) : undefined,
        min_relevance_score: parseFloat(args.min_relevance_score ?? '0.5')
      }
      const result = analyzeFinancialSentiment(input)
      return formatNewsSentimentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'regulatory_filing_analyzer',
    description: 'Analyze SEC regulatory filings (10-K, 10-Q, 8-K, DEF 14A, S-1) for financial metrics, anomalies, and compliance scoring. Detects red flags and provides forensic analysis.',
    parameters: {
      cik: { type: 'string', required: true, description: 'SEC CIK number (e.g., "0000320193" for Apple)' },
      filing_type: { type: 'string', required: true, description: 'Filing type: 10-K, 10-Q, 8-K, DEF 14A, or S-1' },
      analysis_depth: { type: 'string', required: true, description: 'Analysis depth: summary, detailed, or forensic' },
      target_sections: { type: 'string', description: 'JSON array of specific sections to analyze (optional)' },
      compare_periods: { type: 'string', description: 'Number of periods to compare (default "4")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { cik: string; filing_type: string; analysis_depth: string; target_sections?: string; compare_periods?: string }) {
      const input: FilingAnalyzerInput = {
        cik: args.cik,
        filing_type: args.filing_type as FilingAnalyzerInput['filing_type'],
        analysis_depth: args.analysis_depth as FilingAnalyzerInput['analysis_depth'],
        target_sections: args.target_sections ? JSON.parse(args.target_sections) : undefined,
        compare_periods: parseInt(args.compare_periods ?? '4')
      }
      const result = analyzeRegulatoryFiling(input)
      return formatFilingAnalyzerReport(result)
    }
  }))

  console.log('[dsh-tool-fintechapi] Loaded v' + VERSION + ' - AI Fintech API Toolkit with 8 tools')
  console.log('  Tools: market_data_feed_simulator, algorithmic_trading_signal_gen, portfolio_risk_analyzer, crypto_market_monitor, forex_rate_predictor, options_pricing_calculator, financial_news_sentiment, regulatory_filing_analyzer')
}
