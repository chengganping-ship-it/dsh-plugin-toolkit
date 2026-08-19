/**
 * DSH Crypto Arbitrage Signal Engine Plugin v0.1.0
 *
 * Cross-exchange arbitrage detection and market intelligence toolkit for DeepSeek Harness Agent.
 * Designed for quantitative traders, arbitrageurs, and crypto analysts.
 *
 * Features (v0.1.0):
 * - Funding Rate Arbitrage Analyzer (CEX funding rate comparison)
 * - Cross-Exchange Spread Monitor (price discrepancy detection)
 * - Whale Movement Tracker (large wallet flow analysis)
 * - Liquidation Heatmap Generator (cluster identification)
 * - Volatility Regime Classifier (market state assessment)
 * - Basis Spread Monitor (futures vs spot premium tracking)
 * - Arbitrage Opportunity Scorer (composite scoring engine)
 * - Historical Funding Backtest (PnL simulation from funding data)
 *
 * @module dsh-tool-cryptosignal
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cryptosignal'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ArbitrageSignal {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  exchange?: string
  pair?: string
  currentValue: number
  threshold: number
  recommendation: string
  confidence: number
  timeframe?: string
  metadata?: Record<string, unknown>
}

interface FundingRateData {
  exchange: string
  pair: string
  fundingRate: number
  predictedRate: number
  nextFundingTime: number
  interval: number
  openInterest?: number
  volume24h?: number
}

interface SpreadData {
  pair: string
  exchangeA: string
  exchangeB: string
  priceA: number
  priceB: number
  spreadPercent: number
  volumeA: number
  volumeB: number
  transferTime: number
  networkFee: number
}

interface WhaleTransaction {
  hash: string
  timestamp: number
  from: string
  to: string
  token: string
  amount: number
  valueUsd: number
  exchange?: string
  isExchangeInflow: boolean
  isExchangeOutflow: boolean
}

interface LiquidationLevel {
  price: number
  longLiquidations: number
  shortLiquidations: number
  totalValue: number
  exchange: string
  pair: string
}

interface VolatilityMetrics {
  pair: string
  atmIv: number
  realizedVol24h: number
  realizedVol7d: number
  volRatio: number
  regime: 'low' | 'normal' | 'high' | 'extreme'
  termStructure: 'contango' | 'backwardation'
  skew25d: number
  ivRank: number
  ivPercentile: number
}

interface BasisData {
  pair: string
  spotPrice: number
  futuresPrice: number
  contractExpiry: number
  basisPercent: number
  annualizedBasis: number
  daysToExpiry: number
  fundingRate?: number
  historicalAvgBasis: number
  basisZscore: number
}

interface BacktestResult {
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  avgHoldTime: number
  totalFundingEarned: number
  totalFundingPaid: number
  netFunding: number
  trades: number
  profitableDays: number
  losingDays: number
  maxConsecutiveLosses: number
  calmarRatio: number
}

// ==================== TOOL 1: FUNDING RATE ARBITRAGE ANALYZER ====================

interface FundingRateResult {
  opportunities: Array<{
    pair: string
    buyExchange: string
    sellExchange: string
    rateDifference: number
    annualizedApr: number
    risk: 'low' | 'medium' | 'high'
    confidence: number
  }>
  marketOverview: {
    highestRate: { pair: string; exchange: string; rate: number }
    lowestRate: { pair: string; exchange: string; rate: number }
    averageRate: number
    totalPairsAnalyzed: number
  }
  signals: ArbitrageSignal[]
}

function analyzeFundingRates(
  exchangeData: FundingRateData[],
  minRateDiff: number = 0.001,
  minApr: number = 5
): FundingRateResult {
  const opportunities: FundingRateResult['opportunities'] = []
  const signals: ArbitrageSignal[] = []

  const grouped = new Map<string, FundingRateData[]>()
  for (const d of exchangeData) {
    const key = d.pair
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(d)
  }

  for (const [pair, rates] of grouped) {
    if (rates.length < 2) continue
    rates.sort((a, b) => a.fundingRate - b.fundingRate)
    const lowest = rates[0]
    const highest = rates[rates.length - 1]
    const rateDiff = highest.fundingRate - lowest.fundingRate

    if (rateDiff >= minRateDiff) {
      const intervalsPerYear = (365 * 24) / lowest.interval
      const annualizedApr = rateDiff * intervalsPerYear * 100
      if (annualizedApr >= minApr) {
        const riskScore = assessFundingRisk(lowest, highest)
        opportunities.push({
          pair,
          buyExchange: lowest.exchange,
          sellExchange: highest.exchange,
          rateDifference: rateDiff,
          annualizedApr,
          risk: riskScore,
          confidence: calculateConfidence(lowest, highest, rateDiff)
        })

        if (annualizedApr > 50 && rateDiff > 0.01) {
          signals.push({
            type: 'funding_rate_spike',
            severity: 'critical',
            pair,
            currentValue: rateDiff,
            threshold: minRateDiff,
            recommendation: `Urgent: ${rateDiff.toFixed(4)} funding spread on ${pair} between ${lowest.exchange} (${lowest.fundingRate.toFixed(6)}) and ${highest.exchange} (${highest.fundingRate.toFixed(6)})`,
            confidence: 0.9,
            timeframe: `${lowest.interval}h funding interval`
          })
        }
      }
    }
  }

  opportunities.sort((a, b) => b.annualizedApr - a.annualizedApr)

  const allRates = exchangeData.map(d => d.fundingRate)
  const marketOverview = {
    highestRate: exchangeData.reduce((max, d) => d.fundingRate > max.rate ? { pair: d.pair, exchange: d.exchange, rate: d.fundingRate } : max, { pair: '', exchange: '', rate: -Infinity }),
    lowestRate: exchangeData.reduce((min, d) => d.fundingRate < min.rate ? { pair: d.pair, exchange: d.exchange, rate: d.fundingRate } : min, { pair: '', exchange: '', rate: Infinity }),
    averageRate: allRates.reduce((s, r) => s + r, 0) / allRates.length,
    totalPairsAnalyzed: grouped.size
  }

  return { opportunities, marketOverview, signals }
}

function assessFundingRisk(low: FundingRateData, high: FundingRateData): 'low' | 'medium' | 'high' {
  const riskFactors = 0
  if (Math.abs(high.fundingRate) > 0.01) riskFactors + 2
  if ((high.openInterest ?? 0) < 1000000) riskFactors + 1
  if ((high.volume24h ?? 0) < 10000000) riskFactors + 1
  if (riskFactors >= 3) return 'high'
  if (riskFactors >= 1) return 'medium'
  return 'low'
}

function calculateConfidence(low: FundingRateData, high: FundingRateData, diff: number): number {
  let conf = 0.5
  if ((low.openInterest ?? 0) > 10000000) conf += 0.15
  if ((high.openInterest ?? 0) > 10000000) conf += 0.15
  if ((low.volume24h ?? 0) > 50000000) conf += 0.1
  if ((high.volume24h ?? 0) > 50000000) conf += 0.1
  if (diff > 0.005) conf += 0.1
  return Math.min(conf, 0.99)
}

function formatFundingRateReport(result: FundingRateResult): string {
  const lines: string[] = []
  lines.push('## Funding Rate Arbitrage Report')
  lines.push('')
  lines.push(`**Market Overview:** ${result.marketOverview.totalPairsAnalyzed} pairs analyzed`)
  lines.push(`- Highest Rate: ${result.marketOverview.highestRate.pair} @ ${result.marketOverview.highestRate.exchange} = ${(result.marketOverview.highestRate.rate * 100).toFixed(4)}%`)
  lines.push(`- Lowest Rate: ${result.marketOverview.lowestRate.pair} @ ${result.marketOverview.lowestRate.exchange} = ${(result.marketOverview.lowestRate.rate * 100).toFixed(4)}%`)
  lines.push(`- Average Rate: ${(result.marketOverview.averageRate * 100).toFixed(4)}%`)
  lines.push('')

  if (result.opportunities.length > 0) {
    lines.push(`### Top ${Math.min(result.opportunities.length, 10)} Opportunities`)
    lines.push('| Pair | Buy (Short) | Sell (Long) | Rate Diff | APR | Risk | Confidence |')
    lines.push('|------|------------|-------------|-----------|-----|------|------------|')
    for (const opp of result.opportunities.slice(0, 10)) {
      lines.push(`| ${opp.pair} | ${opp.buyExchange} | ${opp.sellExchange} | ${(opp.rateDifference * 100).toFixed(4)}% | ${opp.annualizedApr.toFixed(1)}% | ${opp.risk} | ${(opp.confidence * 100).toFixed(0)}% |`)
    }
  }

  if (result.signals.length > 0) {
    lines.push('')
    lines.push('### Critical Signals')
    for (const sig of result.signals) {
      lines.push(`[${sig.severity.toUpperCase()}] ${sig.recommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: CROSS-EXCHANGE SPREAD MONITOR ====================

interface CrossSpreadResult {
  spreads: Array<{
    pair: string
    exchangeA: string
    exchangeB: string
    priceA: number
    priceB: number
    spreadPct: number
    profitableAfterFees: boolean
    estimatedProfit: number
    confidence: number
    volumeScore: number
  }>
  alerts: ArbitrageSignal[]
  summary: {
    totalSpreadsAnalyzed: number
    profitableSpreads: number
    avgSpread: number
    maxSpread: number
  }
}

function analyzeCrossExchangeSpreads(
  spreadData: SpreadData[],
  minSpread: number = 0.5,
  tradingFee: number = 0.001,
  withdrawalFee: number = 0.0005
): CrossSpreadResult {
  const results: CrossSpreadResult['spreads'] = []
  const alerts: ArbitrageSignal[] = []

  for (const sd of spreadData) {
    const totalFees = (tradingFee * 2 + withdrawalFee) * 100
    const netSpread = sd.spreadPercent - totalFees
    const profitable = netSpread > 0
    const volumeScore = Math.min(sd.volumeA, sd.volumeB) / Math.max(sd.volumeA, sd.volumeB)

    results.push({
      pair: sd.pair,
      exchangeA: sd.exchangeA,
      exchangeB: sd.exchangeB,
      priceA: sd.priceA,
      priceB: sd.priceB,
      spreadPct: sd.spreadPercent,
      profitableAfterFees: profitable,
      estimatedProfit: netSpread,
      confidence: profitable ? Math.min(0.5 + (netSpread / 5) + (volumeScore * 0.3), 0.95) : 0.1,
      volumeScore
    })

    if (sd.spreadPercent > 2 && profitable) {
      alerts.push({
        type: 'cross_exchange_spread',
        severity: sd.spreadPercent > 5 ? 'critical' : 'high',
        pair: sd.pair,
        currentValue: sd.spreadPercent,
        threshold: minSpread,
        recommendation: `Spread: ${sd.spreadPercent.toFixed(2)}% on ${sd.pair} between ${sd.exchangeA} ($${sd.priceA.toFixed(2)}) and ${sd.exchangeB} ($${sd.priceB.toFixed(2)}). Net: ${netSpread.toFixed(2)}%`,
        confidence: 0.85,
        timeframe: `Transfer: ${sd.transferTime}min`
      })
    }
  }

  const profitableCount = results.filter(r => r.profitableAfterFees).length
  const spreads = results.map(r => r.spreadPct)

  return {
    spreads: results.sort((a, b) => b.spreadPct - a.spreadPct),
    alerts,
    summary: {
      totalSpreadsAnalyzed: results.length,
      profitableSpreads: profitableCount,
      avgSpread: spreads.reduce((s, v) => s + v, 0) / spreads.length,
      maxSpread: Math.max(...spreads)
    }
  }
}

function formatCrossSpreadReport(result: CrossSpreadResult): string {
  const lines: string[] = []
  lines.push('## Cross-Exchange Spread Monitor')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalSpreadsAnalyzed} spreads analyzed, ${result.summary.profitableSpreads} profitable`)
  lines.push(`- Average Spread: ${result.summary.avgSpread.toFixed(3)}%`)
  lines.push(`- Max Spread: ${result.summary.maxSpread.toFixed(3)}%`)
  lines.push('')

  const profitable = result.spreads.filter(s => s.profitableAfterFees)
  if (profitable.length > 0) {
    lines.push('### Profitable Spreads')
    lines.push('| Pair | Buy On | Sell On | Spread | Net Profit | Volume Score |')
    lines.push('|------|--------|---------|--------|------------|-------------|')
    for (const s of profitable.slice(0, 15)) {
      lines.push(`| ${s.pair} | ${s.exchangeA} ($${s.priceA.toFixed(2)}) | ${s.exchangeB} ($${s.priceB.toFixed(2)}) | ${s.spreadPct.toFixed(3)}% | ${s.estimatedProfit.toFixed(3)}% | ${s.volumeScore.toFixed(2)} |`)
    }
  }

  if (result.alerts.length > 0) {
    lines.push('')
    lines.push('### Spread Alerts')
    for (const alert of result.alerts) {
      lines.push(`[${alert.severity.toUpperCase()}] ${alert.recommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: WHALE MOVEMENT TRACKER ====================

interface WhaleResult {
  movements: Array<{
    token: string
    totalVolume: number
    inflow: number
    outflow: number
    netFlow: number
    transactionCount: number
    avgTxSize: number
    largestTx: number
    exchangeInflow: number
    exchangeOutflow: number
    netExchangeFlow: number
    signal: 'bullish' | 'bearish' | 'neutral' | 'distribution' | 'accumulation'
    confidence: number
  }>
  recentLargeTransactions: WhaleResult['movements']
  summary: {
    totalTracked: number
    totalVolumeUsd: number
    bullishCount: number
    bearishCount: number
    largestMovement: { token: string; valueUsd: number; type: string }
  }
}

function analyzeWhaleMovements(
  transactions: WhaleTransaction[],
  minValueUsd: number = 100000
): WhaleResult {
  const filtered = transactions.filter(t => t.valueUsd >= minValueUsd)
  const grouped = new Map<string, WhaleTransaction[]>()

  for (const tx of filtered) {
    const key = tx.token
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(tx)
  }

  const movements: WhaleResult['movements'] = []

  for (const [token, txs] of grouped) {
    const inflow = txs.filter(t => !t.isExchangeInflow).reduce((s, t) => s + t.valueUsd, 0)
    const outflow = txs.filter(t => t.isExchangeOutflow).reduce((s, t) => s + t.valueUsd, 0)
    const exchangeInflow = txs.filter(t => t.isExchangeInflow).reduce((s, t) => s + t.valueUsd, 0)
    const exchangeOutflow = txs.filter(t => t.isExchangeOutflow).reduce((s, t) => s + t.valueUsd, 0)
    const totalVolume = txs.reduce((s, t) => s + t.valueUsd, 0)
    const values = txs.map(t => t.valueUsd)
    const largestTx = Math.max(...values)
    const avgTxSize = totalVolume / txs.length

    const netExchangeFlow = exchangeOutflow - exchangeInflow
    let signal: WhaleResult['movements'][0]['signal'] = 'neutral'
    let confidence = 0.5

    if (netExchangeFlow > totalVolume * 0.3) {
      signal = 'accumulation'
      confidence = 0.75
    } else if (netExchangeFlow < -totalVolume * 0.3) {
      signal = 'distribution'
      confidence = 0.75
    } else if (inflow > outflow * 2) {
      signal = 'bullish'
      confidence = 0.65
    } else if (outflow > inflow * 2) {
      signal = 'bearish'
      confidence = 0.65
    }

    movements.push({
      token,
      totalVolume,
      inflow,
      outflow,
      netFlow: inflow - outflow,
      transactionCount: txs.length,
      avgTxSize,
      largestTx,
      exchangeInflow,
      exchangeOutflow,
      netExchangeFlow,
      signal,
      confidence
    })
  }

  movements.sort((a, b) => b.totalVolume - a.totalVolume)

  const bullish = movements.filter(m => m.signal === 'bullish' || m.signal === 'accumulation').length
  const bearish = movements.filter(m => m.signal === 'bearish' || m.signal === 'distribution').length

  return {
    movements,
    recentLargeTransactions: movements.slice(0, 10),
    summary: {
      totalTracked: movements.length,
      totalVolumeUsd: movements.reduce((s, m) => s + m.totalVolume, 0),
      bullishCount: bullish,
      bearishCount: bearish,
      largestMovement: movements.length > 0 ? {
        token: movements[0].token,
        valueUsd: movements[0].largestTx,
        type: movements[0].signal
      } : { token: '', valueUsd: 0, type: 'none' }
    }
  }
}

function formatWhaleReport(result: WhaleResult): string {
  const lines: string[] = []
  lines.push('## Whale Movement Tracker')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalTracked} tokens tracked, $${(result.summary.totalVolumeUsd / 1e6).toFixed(1)}M total volume`)
  lines.push(`- Bullish signals: ${result.summary.bullishCount} | Bearish signals: ${result.summary.bearishCount}`)
  lines.push(`- Largest: ${result.summary.largestMovement.token} - $${(result.summary.largestMovement.valueUsd / 1e6).toFixed(2)}M (${result.summary.largestMovement.type})`)
  lines.push('')

  lines.push('### Top Movements by Volume')
  lines.push('| Token | Net Exchange Flow | Signal | Tx Count | Largest Tx | Confidence |')
  lines.push('|-------|-------------------|--------|----------|------------|------------|')
  for (const m of result.movements.slice(0, 15)) {
    const netFlowStr = m.netExchangeFlow >= 0 ? `+$${(m.netExchangeFlow / 1e6).toFixed(2)}M` : `-$${(Math.abs(m.netExchangeFlow) / 1e6).toFixed(2)}M`
    lines.push(`| ${m.token} | ${netFlowStr} | ${m.signal.toUpperCase()} | ${m.transactionCount} | $${(m.largestTx / 1e6).toFixed(2)}M | ${(m.confidence * 100).toFixed(0)}% |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: LIQUIDATION HEATMAP ====================

interface HeatmapResult {
  clusters: Array<{
    priceLevel: number
    totalLiquidations: number
    longLiqs: number
    shortLiqs: number
    totalValue: number
    density: 'sparse' | 'moderate' | 'dense' | 'extreme'
    magnetRisk: 'low' | 'medium' | 'high'
  }>
  targetedLevels: number[]
  currentPrice: number
  nearestLiquidation: { price: number; distance: number; side: string; value: number }
  summary: {
    totalLiquidationValue: number
    longDominance: number
    shortDominance: number
    maxClusterValue: number
    maxClusterPrice: number
  }
}

function analyzeLiquidationHeatmap(
  liquidationLevels: LiquidationLevel[],
  currentPrice: number,
  clusterRange: number = 0.02
): HeatmapResult {
  const sorted = [...liquidationLevels].sort((a, b) => a.price - b.price)
  const clusters: HeatmapResult['clusters'] = []

  let i = 0
  while (i < sorted.length) {
    const base = sorted[i]
    let clusterValue = base.totalValue
    let longTotal = base.longLiquidations
    let shortTotal = base.shortLiquidations
    let totalLiqs = base.longLiquidations + base.shortLiquidations
    let j = i + 1

    while (j < sorted.length && (sorted[j].price - base.price) / base.price <= clusterRange) {
      clusterValue += sorted[j].totalValue
      longTotal += sorted[j].longLiquidations
      shortTotal += sorted[j].shortLiquidations
      totalLiqs += sorted[j].longLiquidations + sorted[j].shortLiquidations
      j++
    }

    const avgPrice = base.price
    let density: HeatmapResult['clusters'][0]['density'] = 'sparse'
    let magnetRisk: HeatmapResult['clusters'][0]['magnetRisk'] = 'low'

    if (clusterValue > 50000000) {
      density = 'extreme'
      magnetRisk = 'high'
    } else if (clusterValue > 20000000) {
      density = 'dense'
      magnetRisk = 'high'
    } else if (clusterValue > 5000000) {
      density = 'moderate'
      magnetRisk = 'medium'
    }

    clusters.push({
      priceLevel: avgPrice,
      totalLiquidations: totalLiqs,
      longLiqs: longTotal,
      shortLiqs: shortTotal,
      totalValue: clusterValue,
      density,
      magnetRisk
    })
    i = j
  }

  clusters.sort((a, b) => b.totalValue - a.totalValue)

  const targetedLevels = clusters
    .filter(c => c.magnetRisk === 'high')
    .slice(0, 5)
    .map(c => c.priceLevel)

  let nearest = { price: 0, distance: Infinity, side: '', value: 0 }
  for (const c of clusters) {
    const dist = Math.abs(c.priceLevel - currentPrice) / currentPrice
    if (dist < nearest.distance) {
      nearest = {
        price: c.priceLevel,
        distance: dist,
        side: c.longLiqs > c.shortLiqs ? 'shorts' : 'longs',
        value: c.totalValue
      }
    }
  }

  const totalValue = liquidationLevels.reduce((s, l) => s + l.totalValue, 0)
  const totalLongs = liquidationLevels.reduce((s, l) => s + l.longLiquidations, 0)
  const totalShorts = liquidationLevels.reduce((s, l) => s + l.shortLiquidations, 0)

  return {
    clusters,
    targetedLevels,
    currentPrice,
    nearestLiquidation: nearest,
    summary: {
      totalLiquidationValue: totalValue,
      longDominance: totalLongs / (totalLongs + totalShorts),
      shortDominance: totalShorts / (totalLongs + totalShorts),
      maxClusterValue: clusters.length > 0 ? clusters[0].totalValue : 0,
      maxClusterPrice: clusters.length > 0 ? clusters[0].priceLevel : 0
    }
  }
}

function formatHeatmapReport(result: HeatmapResult): string {
  const lines: string[] = []
  lines.push('## Liquidation Heatmap Analysis')
  lines.push('')
  lines.push(`**Current Price:** $${result.currentPrice.toFixed(2)}`)
  lines.push(`**Total Liquidation Pool:** $${(result.summary.totalLiquidationValue / 1e6).toFixed(1)}M`)
  lines.push(`- Long dominance: ${(result.summary.longDominance * 100).toFixed(1)}% | Short dominance: ${(result.summary.shortDominance * 100).toFixed(1)}%`)
  lines.push(`- Max cluster: $${(result.summary.maxClusterValue / 1e6).toFixed(1)}M at $${result.summary.maxClusterPrice.toFixed(2)}`)
  lines.push('')

  lines.push(`### Nearest Liquidation Magnet`)
  const dir = result.nearestLiquidation.price > result.currentPrice ? 'above' : 'below'
  lines.push(`- $${result.nearestLiquidation.price.toFixed(2)} (${dir}, ${(result.nearestLiquidation.distance * 100).toFixed(2)}% away)`)
  lines.push(`- ${result.nearestLiquidation.side} liquidations: $${(result.nearestLiquidation.value / 1e6).toFixed(1)}M`)
  lines.push('')

  lines.push('### Top Liquidation Clusters')
  lines.push('| Price Level | Value | Density | Magnet Risk | Long/Short |')
  lines.push('|-------------|-------|---------|-------------|------------|')
  for (const c of result.clusters.slice(0, 10)) {
    lines.push(`| $${c.priceLevel.toFixed(2)} | $${(c.totalValue / 1e6).toFixed(1)}M | ${c.density} | ${c.magnetRisk} | ${c.longLiqs}/${c.shortLiqs} |`)
  }

  if (result.targetedLevels.length > 0) {
    lines.push('')
    lines.push('### Price Targets (High Magnet Risk)')
    lines.push(result.targetedLevels.map(p => `$${p.toFixed(2)}`).join(', '))
  }

  return lines.join('\n')
}

// ==================== TOOL 5: VOLATILITY REGIME CLASSIFIER ====================

interface VolatilityResult {
  classification: {
    currentRegime: 'low' | 'normal' | 'high' | 'extreme'
    ivRank: number
    ivPercentile: number
    realizedVol: number
    impliedVsRealized: number
    termStructure: string
    skewInterpretation: string
    recommendedStrategy: string
    confidence: number
  }
  signals: ArbitrageSignal[]
  straddleFairValue: number
  strangleFairValue: number
  expectedMove1d: number
  expectedMove7d: number
}

function classifyVolatilityRegime(
  metrics: VolatilityMetrics,
  historicalIv: number[]
): VolatilityResult {
  const avgHistIv = historicalIv.reduce((s, v) => s + v, 0) / historicalIv.length
  const currentIv = metrics.atmIv
  const ivVsRealized = currentIv / Math.max(metrics.realizedVol24h, 0.01)

  let recommendedStrategy: string
  let confidence = 0.6

  if (metrics.regime === 'low') {
    recommendedStrategy = 'Consider long gamma: buy straddles/strangles, sell iron condors after moves'
    confidence = 0.7
  } else if (metrics.regime === 'high') {
    recommendedStrategy = 'Consider short gamma: sell straddles, iron condors, or credit spreads'
    confidence = 0.75
  } else if (metrics.regime === 'extreme') {
    recommendedStrategy = 'Reduce size, widen stops, consider volatility arbitrage if term structure permits'
    confidence = 0.65
  } else {
    recommendedStrategy = 'Neutral: range-bound strategies, calendar spreads if term structure steep'
    confidence = 0.6
  }

  if (ivVsRealized > 1.5) {
    recommendedStrategy += ' | IV significantly above realized — premium selling favored'
    confidence += 0.1
  } else if (ivVsRealized < 0.7) {
    recommendedStrategy += ' | IV below realized — premium buying may be favorable'
    confidence += 0.1
  }

  const signals: ArbitrageSignal[] = []
  if (metrics.ivRank > 80) {
    signals.push({
      type: 'iv_rank_extreme',
      severity: 'high',
      pair: metrics.pair,
      currentValue: metrics.ivRank,
      threshold: 80,
      recommendation: `IV Rank at ${metrics.ivRank}% — historically expensive, favor selling premium`,
      confidence: 0.8
    })
  }
  if (metrics.ivRank < 20) {
    signals.push({
      type: 'iv_rank_low',
      severity: 'medium',
      pair: metrics.pair,
      currentValue: metrics.ivRank,
      threshold: 20,
      recommendation: `IV Rank at ${metrics.ivRank}% — historically cheap, consider buying options`,
      confidence: 0.75
    })
  }

  return {
    classification: {
      currentRegime: metrics.regime,
      ivRank: metrics.ivRank,
      ivPercentile: metrics.ivPercentile,
      realizedVol: metrics.realizedVol24h,
      impliedVsRealized: ivVsRealized,
      termStructure: metrics.termStructure,
      skewInterpretation: metrics.skew25d > 3 ? 'puts expensive (fear)' : metrics.skew25d < -3 ? 'calls expensive (greed)' : 'relatively flat',
      recommendedStrategy,
      confidence: Math.min(confidence, 0.95)
    },
    signals,
    straddleFairValue: currentIv * Math.sqrt(1 / 365) * 100,
    strangleFairValue: currentIv * 0.85 * Math.sqrt(1 / 365) * 100,
    expectedMove1d: currentIv * Math.sqrt(1 / 365) * 100,
    expectedMove7d: currentIv * Math.sqrt(7 / 365) * 100
  }
}

function formatVolatilityReport(result: VolatilityResult): string {
  const c = result.classification
  const lines: string[] = []
  lines.push('## Volatility Regime Analysis')
  lines.push('')
  lines.push(`**Regime:** ${c.currentRegime.toUpperCase()} | **IV Rank:** ${c.ivRank}% | **IV Percentile:** ${c.ivPercentile}%`)
  lines.push(`**Realized Vol (24h):** ${(c.realizedVol * 100).toFixed(1)}% | **IV/RV Ratio:** ${c.impliedVsRealized.toFixed(2)}`)
  lines.push(`**Term Structure:** ${c.termStructure} | **Skew:** ${c.skewInterpretation}`)
  lines.push('')
  lines.push(`### Expected Moves`)
  lines.push(`- 1-Day: ±${result.expectedMove1d.toFixed(2)}%`)
  lines.push(`- 7-Day: ±${result.expectedMove7d.toFixed(2)}%`)
  lines.push(`- Straddle Fair Value: ${result.straddleFairValue.toFixed(2)}% of spot`)
  lines.push(`- Strangle Fair Value: ${result.strangleFairValue.toFixed(2)}% of spot`)
  lines.push('')
  lines.push(`**Strategy:** ${c.recommendedStrategy}`)
  lines.push(`**Confidence:** ${(c.confidence * 100).toFixed(0)}%`)

  if (result.signals.length > 0) {
    lines.push('')
    lines.push('### Volatility Signals')
    for (const sig of result.signals) {
      lines.push(`[${sig.severity.toUpperCase()}] ${sig.recommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: BASIS SPREAD MONITOR ====================

interface BasisResult {
  opportunities: Array<{
    pair: string
    spotPrice: number
    futuresPrice: number
    basisPct: number
    annualizedYield: number
    daysToExpiry: number
    zscore: number
    premiumToHistorical: number
    recommendation: string
    riskScore: number
  }>
  summary: {
    positiveBasisCount: number
    negativeBasisCount: number
    avgAnnualizedYield: number
    maxYield: { pair: string; yield: number }
    avgZscore: number
  }
  signals: ArbitrageSignal[]
}

function analyzeBasisSpreads(
  basisData: BasisData[],
  minAnnualizedYield: number = 5,
  zscoreThreshold: number = 2
): BasisResult {
  const opportunities: BasisResult['opportunities'] = []
  const signals: ArbitrageSignal[] = []

  for (const bd of basisData) {
    if (bd.daysToExpiry <= 0) continue
    const annualized = bd.annualizedBasis
    const premiumToHist = bd.historicalAvgBasis !== 0
      ? (bd.basisPercent - bd.historicalAvgBasis) / Math.abs(bd.historicalAvgBasis)
      : 0

    let recommendation = 'Hold / No Action'
    if (annualized > minAnnualizedYield && bd.basisZscore > -1) {
      recommendation = `Cash-and-carry: Buy spot $${bd.spotPrice.toFixed(2)}, Short futures $${bd.futuresPrice.toFixed(2)}`
    } else if (bd.basisPercent < -2 && bd.basisZscore < -2) {
      recommendation = `Reverse basis: Short spot, Buy futures (deeply backwardated)`
    }

    let riskScore = 3
    if (bd.daysToExpiry < 3) riskScore += 2
    if (bd.daysToExpiry > 30) riskScore -= 1
    if (Math.abs(bd.basisZscore) > 3) riskScore += 1

    opportunities.push({
      pair: bd.pair,
      spotPrice: bd.spotPrice,
      futuresPrice: bd.futuresPrice,
      basisPct: bd.basisPercent,
      annualizedYield: annualized,
      daysToExpiry: bd.daysToExpiry,
      zscore: bd.basisZscore,
      premiumToHistorical: premiumToHist,
      recommendation,
      riskScore: Math.max(1, Math.min(riskScore, 10))
    })

    if (annualized > 20 && bd.basisZscore > zscoreThreshold) {
      signals.push({
        type: 'extreme_basis',
        severity: annualized > 50 ? 'critical' : 'high',
        pair: bd.pair,
        currentValue: annualized,
        threshold: minAnnualizedYield,
        recommendation: `Basis trade: ${bd.pair} annualized ${annualized.toFixed(1)}% (z-score: ${bd.basisZscore.toFixed(2)})`,
        confidence: 0.8,
        timeframe: `${bd.daysToExpiry} days to expiry`
      })
    }
  }

  opportunities.sort((a, b) => b.annualizedYield - a.annualizedYield)
  const positiveCount = opportunities.filter(o => o.basisPct > 0).length
  const yields = opportunities.map(o => o.annualizedYield)
  const zscores = opportunities.map(o => o.zscore)

  return {
    opportunities,
    summary: {
      positiveBasisCount: positiveCount,
      negativeBasisCount: opportunities.length - positiveCount,
      avgAnnualizedYield: yields.reduce((s, y) => s + y, 0) / yields.length,
      maxYield: opportunities.length > 0 ? {
        pair: opportunities[0].pair,
        yield: opportunities[0].annualizedYield
      } : { pair: '', yield: 0 },
      avgZscore: zscores.reduce((s, z) => s + z, 0) / zscores.length
    },
    signals
  }
}

function formatBasisReport(result: BasisResult): string {
  const lines: string[] = []
  lines.push('## Basis Spread Monitor')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.positiveBasisCount} positive basis, ${result.summary.negativeBasisCount} negative`)
  lines.push(`- Avg Annualized Yield: ${result.summary.avgAnnualizedYield.toFixed(1)}%`)
  lines.push(`- Max Yield: ${result.summary.maxYield.pair} at ${result.summary.maxYield.yield.toFixed(1)}%`)
  lines.push('')

  lines.push('### Basis Opportunities')
  lines.push('| Pair | Spot | Futures | Basis % | Ann. Yield | Days | Z-Score | Action |')
  lines.push('|------|------|---------|---------|------------|------|---------|--------|')
  for (const o of result.opportunities.slice(0, 12)) {
    const yieldStr = o.annualizedYield >= 0 ? `+${o.annualizedYield.toFixed(1)}%` : `${o.annualizedYield.toFixed(1)}%`
    lines.push(`| ${o.pair} | $${o.spotPrice.toFixed(2)} | $${o.futuresPrice.toFixed(2)} | ${o.basisPct.toFixed(3)}% | ${yieldStr} | ${o.daysToExpiry} | ${o.zscore.toFixed(2)} | ${o.recommendation.substring(0, 40)}... |`)
  }

  if (result.signals.length > 0) {
    lines.push('')
    lines.push('### Basis Signals')
    for (const sig of result.signals) {
      lines.push(`[${sig.severity.toUpperCase()}] ${sig.recommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: ARBITRAGE OPPORTUNITY SCORER ====================

interface OpportunityResult {
  scored: Array<{
    id: string
    pair: string
    strategy: string
    exchanges: string[]
    grossApr: number
    netApr: number
    riskAdjustedReturn: number
    compositeScore: number
    factors: {
      spreadScore: number
      volumeScore: number
      stabilityScore: number
      fundingScore: number
      competitionScore: number
    }
    recommendation: string
    actionRequired: string
  }>
  topPick: OpportunityResult['scored'][0] | null
  marketEfficiency: number
  summary: {
    totalScored: number
    highScoreCount: number
    avgCompositeScore: number
    bestStrategy: string
  }
}

function scoreArbitrageOpportunities(
  opportunities: Array<{
    pair: string
    strategy: 'funding_arbitrage' | 'cross_exchange' | 'basis_trade' | 'triangular' | 'statistical'
    exchanges: string[]
    grossApr: number
    costEstimate: number
    historicalStability: number
    avgVolume: number
    competitionLevel: 'low' | 'medium' | 'high'
    fundingRate?: number
  }>
): OpportunityResult {
  const scored: OpportunityResult['scored'] = []

  for (const opp of opportunities) {
    const spreadScore = Math.min(opp.grossApr / 50, 1)
    const volumeScore = Math.min(opp.avgVolume / 100000000, 1)
    const stabilityScore = opp.historicalStability
    const fundingScore = opp.fundingRate ? Math.min(Math.abs(opp.fundingRate) * 1000, 1) : 0.5
    const competitionMap = { low: 1, medium: 0.6, high: 0.3 }
    const competitionScore = competitionMap[opp.competitionLevel]

    const composite = (
      spreadScore * 0.3 +
      volumeScore * 0.2 +
      stabilityScore * 0.2 +
      fundingScore * 0.15 +
      competitionScore * 0.15
    )

    const netApr = opp.grossApr - opp.costEstimate
    const riskAdj = netApr * stabilityScore * (1 - (1 - competitionScore) * 0.5)

    let recommendation = 'Monitor'
    let actionRequired = 'No action'
    if (composite > 0.75 && netApr > 10) {
      recommendation = 'Strong Buy — Execute immediately'
      actionRequired = 'Deploy capital within 1 hour'
    } else if (composite > 0.6 && netApr > 5) {
      recommendation = 'Favorable — Consider execution'
      actionRequired = 'Prepare positions'
    } else if (composite > 0.4) {
      recommendation = 'Marginal — Hold for now'
      actionRequired = 'Set alert for score > 0.6'
    }

    scored.push({
      id: `${opp.pair}-${opp.strategy}-${Date.now()}`,
      pair: opp.pair,
      strategy: opp.strategy,
      exchanges: opp.exchanges,
      grossApr: opp.grossApr,
      netApr,
      riskAdjustedReturn: riskAdj,
      compositeScore: composite,
      factors: { spreadScore, volumeScore, stabilityScore, fundingScore, competitionScore },
      recommendation,
      actionRequired
    })
  }

  scored.sort((a, b) => b.compositeScore - a.compositeScore)

  const highScores = scored.filter(s => s.compositeScore > 0.6)
  const avgScore = scored.reduce((s, o) => s + o.compositeScore, 0) / scored.length
  const strategyGroups = new Map<string, number>()
  for (const s of scored) {
    strategyGroups.set(s.strategy, (strategyGroups.get(s.strategy) ?? 0) + s.compositeScore)
  }
  let bestStrategy = ''
  let bestStratScore = -1
  for (const [strat, score] of strategyGroups) {
    if (score > bestStratScore) {
      bestStratScore = score
      bestStrategy = strat
    }
  }

  return {
    scored,
    topPick: scored.length > 0 ? scored[0] : null,
    marketEfficiency: 1 - avgScore,
    summary: {
      totalScored: scored.length,
      highScoreCount: highScores.length,
      avgCompositeScore: avgScore,
      bestStrategy
    }
  }
}

function formatOpportunityReport(result: OpportunityResult): string {
  const lines: string[] = []
  lines.push('## Arbitrage Opportunity Scorecard')
  lines.push('')
  lines.push(`**Market Efficiency:** ${(result.marketEfficiency * 100).toFixed(1)}% | **Avg Score:** ${(result.summary.avgCompositeScore * 100).toFixed(1)}%`)
  lines.push(`**Total Analyzed:** ${result.summary.totalScored} | **High Score (>60%):** ${result.summary.highScoreCount}`)
  lines.push(`**Best Strategy:** ${result.summary.bestStrategy}`)
  lines.push('')

  if (result.topPick) {
    const t = result.topPick
    lines.push('### Top Pick')
    lines.push(`**${t.pair}** — ${t.strategy} on ${t.exchanges.join(' / ')}`)
    lines.push(`- Gross APR: ${t.grossApr.toFixed(1)}% | Net APR: ${t.netApr.toFixed(1)}%`)
    lines.push(`- Composite Score: ${(t.compositeScore * 100).toFixed(1)}%`)
    lines.push(`- Recommendation: ${t.recommendation}`)
    lines.push(`- Action: ${t.actionRequired}`)
    lines.push('')
  }

  lines.push('### All Scored Opportunities')
  lines.push('| Pair | Strategy | Gross APR | Net APR | Score | Action |')
  lines.push('|------|----------|-----------|---------|-------|--------|')
  for (const s of result.scored.slice(0, 15)) {
    lines.push(`| ${s.pair} | ${s.strategy} | ${s.grossApr.toFixed(1)}% | ${s.netApr.toFixed(1)}% | ${(s.compositeScore * 100).toFixed(0)}% | ${s.recommendation.substring(0, 25)} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: HISTORICAL FUNDING BACKTEST ====================

interface HistoricalFundingResult {
  backtest: BacktestResult
  period: {
    start: number
    end: number
    days: number
  }
  fundingPnL: Array<{
    day: string
    rate: number
    cumulative: number
  }>
  drawdownSeries: number[]
  recommendations: string[]
  warnings: string[]
}

function backtestHistoricalFunding(
  fundingHistory: Array<{ timestamp: number; rate: number; price: number }>,
  positionSize: number = 100000,
  holdingPeriod: number = 3,
  fundingInterval: number = 8
): HistoricalFundingResult {
  if (fundingHistory.length === 0) {
    return {
      backtest: { totalReturn: 0, sharpeRatio: 0, maxDrawdown: 0, winRate: 0, avgHoldTime: 0, totalFundingEarned: 0, totalFundingPaid: 0, netFunding: 0, trades: 0, profitableDays: 0, losingDays: 0, maxConsecutiveLosses: 0, calmarRatio: 0 },
      period: { start: 0, end: 0, days: 0 },
      fundingPnL: [],
      drawdownSeries: [],
      recommendations: ['No funding data provided'],
      warnings: ['Provide historical funding rates to run backtest']
    }
  }

  const dailyPnL: number[] = []
  const fundingPoints: HistoricalFundingResult['fundingPnL'] = []
  let cumulative = 0
  let totalEarned = 0
  let totalPaid = 0
  let profitableDays = 0
  let losingDays = 0
  let maxConsecutiveLosses = 0
  let currentConsecutive = 0
  let peak = 0
  let maxDrawdown = 0

  for (let i = 0; i < fundingHistory.length; i += Math.floor(24 / fundingInterval)) {
    const rate = fundingHistory[i].rate
    const dailyPn = rate * positionSize * (rate > 0 ? 1 : -1)
    cumulative += dailyPn

    if (rate > 0) {
      totalEarned += dailyPn
      profitableDays++
      currentConsecutive = 0
    } else {
      totalPaid += Math.abs(dailyPn)
      losingDays++
      currentConsecutive++
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutive)
    }

    if (cumulative > peak) peak = cumulative
    const drawdown = peak > 0 ? (peak - cumulative) / peak : 0
    maxDrawdown = Math.max(maxDrawdown, drawdown)
    dailyPnL.push(dailyPn)

    if (i % (Math.floor(24 / fundingInterval) * 7) === 0) {
      fundingPoints.push({
        day: new Date(fundingHistory[i].timestamp).toISOString().slice(0, 10),
        rate,
        cumulative
      })
    }
  }

  const totalDays = Math.floor(fundingHistory.length / (24 / fundingInterval))
  const avgReturn = dailyPnL.reduce((s, v) => s + v, 0) / dailyPnL.length
  const variance = dailyPnL.reduce((s, v) => s + Math.pow(v - avgReturn, 2), 0) / dailyPnL.length
  const stdDev = Math.sqrt(variance)
  const sharpeDaily = stdDev > 0 ? (avgReturn / stdDev) : 0
  const sharpeAnnual = sharpeDaily * Math.sqrt(365)
  const totalReturn = (cumulative / positionSize) * 100
  const winRate = (profitableDays / (profitableDays + losingDays)) * 100
  const calmar = maxDrawdown > 0 ? (totalReturn / 100) / maxDrawdown : 0

  const recommendations: string[] = []
  const warnings: string[] = []

  if (sharpeAnnual > 2) {
    recommendations.push('Strong strategy — consider scaling up position')
  } else if (sharpeAnnual > 1) {
    recommendations.push('Decent risk-adjusted returns — viable with proper sizing')
  } else {
    warnings.push('Suboptimal Sharpe ratio — consider filtering by regime')
  }

  if (maxDrawdown > 0.15) {
    warnings.push(`High drawdown (${(maxDrawdown * 100).toFixed(1)}%) — reduce position size`)
  }
  if (winRate < 40) {
    warnings.push(`Low win rate (${winRate.toFixed(0)}%) — funding direction may be unfavorable`)
  }
  if (maxConsecutiveLosses > 10) {
    warnings.push(`${maxConsecutiveLosses} consecutive loss periods — consider asymmetric rebalancing`)
  }

  return {
    backtest: {
      totalReturn,
      sharpeRatio: sharpeAnnual,
      maxDrawdown,
      winRate,
      avgHoldTime: holdingPeriod,
      totalFundingEarned: totalEarned,
      totalFundingPaid: totalPaid,
      netFunding: cumulative,
      trades: Math.floor(totalDays / holdingPeriod),
      profitableDays,
      losingDays,
      maxConsecutiveLosses,
      calmarRatio: calmar
    },
    period: {
      start: fundingHistory[0].timestamp,
      end: fundingHistory[fundingHistory.length - 1].timestamp,
      days: totalDays
    },
    fundingPnL: fundingPoints,
    drawdownSeries: dailyPnL.map((_, idx) => {
      const slice = dailyPnL.slice(0, idx + 1)
      const cum = slice.reduce((s, v) => s + v, 0)
      return cum
    }),
    recommendations,
    warnings
  }
}

function formatHistoricalFundingReport(result: HistoricalFundingResult): string {
  const b = result.backtest
  const lines: string[] = []
  lines.push('## Historical Funding Backtest Results')
  lines.push('')
  lines.push(`**Period:** ${result.period.days} days | ${new Date(result.period.start).toISOString().slice(0, 10)} → ${new Date(result.period.end).toISOString().slice(0, 10)}`)
  lines.push('')
  lines.push('### Performance')
  lines.push(`- Total Return: ${b.totalReturn >= 0 ? '+' : ''}${b.totalReturn.toFixed(2)}%`)
  lines.push(`- Sharpe Ratio (ann.): ${b.sharpeRatio.toFixed(2)}`)
  lines.push(`- Max Drawdown: ${(b.maxDrawdown * 100).toFixed(2)}%`)
  lines.push(`- Win Rate: ${b.winRate.toFixed(1)}%`)
  lines.push(`- Calmar Ratio: ${b.calmarRatio.toFixed(2)}`)
  lines.push('')
  lines.push('### Funding P&L')
  lines.push(`- Total Earned: $${b.totalFundingEarned.toFixed(2)}`)
  lines.push(`- Total Paid: $${b.totalFundingPaid.toFixed(2)}`)
  lines.push(`- Net Funding: $${b.netFunding.toFixed(2)}`)
  lines.push(`- Profitable Days: ${b.profitableDays} | Losing Days: ${b.losingDays}`)
  lines.push(`- Max Consecutive Losses: ${b.maxConsecutiveLosses}`)
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`✓ ${r}`)
    }
  }
  if (result.warnings.length > 0) {
    lines.push('### Warnings')
    for (const w of result.warnings) {
      lines.push(`⚠ ${w}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'funding_rate_analyzer',
    description: 'Analyze funding rates across centralized exchanges to identify arbitrage opportunities. Compares rates between exchanges, calculates APR, assesses risk, and provides actionable trade recommendations.',
    parameters: {
      exchange_data: { type: 'string', required: true, description: 'JSON array of funding rate data objects with fields: exchange, pair, funding_rate, predicted_rate, interval_hours, open_interest, volume_24h' },
      min_rate_diff: { type: 'string', description: 'Minimum rate difference to flag (default "0.001")' },
      min_apr: { type: 'string', description: 'Minimum annualized APR % to include (default "5")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { exchange_data: string; min_rate_diff?: string; min_apr?: string }) {
      const data: FundingRateData[] = JSON.parse(args.exchange_data)
      const result = analyzeFundingRates(data, parseFloat(args.min_rate_diff ?? '0.001'), parseFloat(args.min_apr ?? '5'))
      return formatFundingRateReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'cross_exchange_spread',
    description: 'Monitor price spreads between exchanges to detect cross-exchange arbitrage opportunities. Calculates profitability after fees and identifies actionable spreads.',
    parameters: {
      spread_data: { type: 'string', required: true, description: 'JSON array of spread data objects with fields: pair, exchange_a, exchange_b, price_a, price_b, spread_percent, volume_a, volume_b, transfer_time_minutes, network_fee_usd' },
      trading_fee: { type: 'string', description: 'Trading fee per side as decimal (default "0.001")' },
      withdrawal_fee: { type: 'string', description: 'Withdrawal/transfer fee as decimal (default "0.0005")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { spread_data: string; trading_fee?: string; withdrawal_fee?: string }) {
      const data: SpreadData[] = JSON.parse(args.spread_data)
      const result = analyzeCrossExchangeSpreads(data, 0.5, parseFloat(args.trading_fee ?? '0.001'), parseFloat(args.withdrawal_fee ?? '0.0005'))
      return formatCrossSpreadReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'whale_movement_tracker',
    description: 'Track large cryptocurrency transactions and exchange flows. Identifies accumulation/distribution patterns and generates bullish/bearish signals based on whale behavior.',
    parameters: {
      transactions: { type: 'string', required: true, description: 'JSON array of transaction objects with fields: hash, timestamp, from, to, token, amount, value_usd, exchange, is_exchange_inflow, is_exchange_outflow' },
      min_value_usd: { type: 'string', description: 'Minimum USD value to consider (default "100000")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { transactions: string; min_value_usd?: string }) {
      const data: WhaleTransaction[] = JSON.parse(args.transactions)
      const result = analyzeWhaleMovements(data, parseFloat(args.min_value_usd ?? '100000'))
      return formatWhaleReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'liquidation_heatmap',
    description: 'Analyze liquidation levels to identify price magnets and cluster zones. Maps liquidation density and generates a heatmap of potential price targets where cascades may occur.',
    parameters: {
      liquidation_levels: { type: 'string', required: true, description: 'JSON array of liquidation data objects with fields: price, long_liquidations, short_liquidations, total_value_usd, exchange, pair' },
      current_price: { type: 'string', required: true, description: 'Current market price as a number string' },
      cluster_range_pct: { type: 'string', description: 'Price range % for clustering (default "2")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { liquidation_levels: string; current_price: string; cluster_range_pct?: string }) {
      const levels = JSON.parse(args.liquidation_levels)
      const data = levels.map((l: Record<string, unknown>) => ({
        price: l.price as number,
        longLiquidations: (l.long_liquidations as number) ?? 0,
        shortLiquidations: (l.short_liquidations as number) ?? 0,
        totalValue: l.total_value_usd as number,
        exchange: (l.exchange as string) ?? '',
        pair: (l.pair as string) ?? ''
      }))
      const result = analyzeLiquidationHeatmap(data, parseFloat(args.current_price), parseFloat(args.cluster_range_pct ?? '2') / 100)
      return formatHeatmapReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'volatility_regime',
    description: 'Classify current market volatility regime using IV rank, IV percentile, realized vol, term structure, and skew. Recommends optimal options strategies for the current regime.',
    parameters: {
      metrics: { type: 'string', required: true, description: 'JSON object with fields: pair, atm_iv, realized_vol_24h, realized_vol_7d, term_structure, skew_25d, iv_rank, iv_percentile' },
      historical_iv: { type: 'string', description: 'JSON array of historical IV values for percentile calculation' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { metrics: string; historical_iv?: string }) {
      const m = JSON.parse(args.metrics)
      const metrics: VolatilityMetrics = {
        pair: m.pair,
        atmIv: m.atm_iv,
        realizedVol24h: m.realized_vol_24h,
        realizedVol7d: m.realized_vol_7d ?? m.realized_vol_24h,
        volRatio: m.atm_iv / Math.max(m.realized_vol_24h, 0.01),
        regime: m.iv_rank > 70 ? 'high' : m.iv_rank > 40 ? 'normal' : 'low',
        termStructure: m.term_structure ?? 'contango',
        skew25d: m.skew_25d ?? 0,
        ivRank: m.iv_rank,
        ivPercentile: m.iv_percentile
      }
      const histIv = args.historical_iv ? JSON.parse(args.historical_iv) : []
      const result = classifyVolatilityRegime(metrics, histIv)
      return formatVolatilityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'basis_spread_monitor',
    description: 'Monitor basis spreads (futures premium/discount to spot) for cash-and-carry arbitrage opportunities. Calculates annualized yields, z-scores, and trade recommendations.',
    parameters: {
      basis_data: { type: 'string', required: true, description: 'JSON array of basis data objects with fields: pair, spot_price, futures_price, contract_expiry (unix timestamp), historical_avg_basis' },
      min_annualized_yield: { type: 'string', description: 'Minimum annualized yield % (default "5")' },
      zscore_threshold: { type: 'string', description: 'Z-score threshold for signals (default "2")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { basis_data: string; min_annualized_yield?: string; zscore_threshold?: string }) {
      const raw = JSON.parse(args.basis_data)
      const now = Date.now() / 1000
      const data: BasisData[] = raw.map((b: Record<string, unknown>) => {
        const spot = b.spot_price as number
        const fut = b.futures_price as number
        const expiry = b.contract_expiry as number
        const daysToExp = Math.max(0, (expiry - now) / 86400)
        const basis = ((fut - spot) / spot) * 100
        const annBasis = daysToExp > 0 ? basis * (365 / daysToExp) : 0
        const histAvg = (b.historical_avg_basis as number) ?? 0
        return {
          pair: b.pair as string,
          spotPrice: spot,
          futuresPrice: fut,
          contractExpiry: expiry,
          basisPercent: basis,
          annualizedBasis: annBasis,
          daysToExpiry: daysToExp,
          historicalAvgBasis: histAvg,
          basisZscore: histAvg !== 0 ? (basis - histAvg) / Math.max(Math.abs(histAvg) * 0.5, 0.001) : 0
        }
      })
      const result = analyzeBasisSpreads(data, parseFloat(args.min_annualized_yield ?? '5'), parseFloat(args.zscore_threshold ?? '2'))
      return formatBasisReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'arbitrage_opportunity_scorer',
    description: 'Score and rank arbitrage opportunities across multiple dimensions (spread, volume, stability, funding, competition). Returns composite scores and ranked recommendations.',
    parameters: {
      opportunities: { type: 'string', required: true, description: 'JSON array of opportunity objects with fields: pair, strategy, exchanges, gross_apr, cost_estimate, historical_stability, avg_volume_usd, competition_level, funding_rate' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { opportunities: string }) {
      const data = JSON.parse(args.opportunities)
      const result = scoreArbitrageOpportunities(data)
      return formatOpportunityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'historical_funding_backtest',
    description: 'Backtest funding rate strategies using historical data. Calculates Sharpe ratio, max drawdown, win rate, and generates P&L series with actionable recommendations.',
    parameters: {
      funding_history: { type: 'string', required: true, description: 'JSON array of funding data points with fields: timestamp (unix), rate (decimal), price' },
      position_size_usd: { type: 'string', description: 'Position size in USD (default "100000")' },
      holding_period_days: { type: 'string', description: 'Holding period in days (default "3")' },
      funding_interval_hours: { type: 'string', description: 'Funding interval in hours (default "8")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { funding_history: string; position_size_usd?: string; holding_period_days?: string; funding_interval_hours?: string }) {
      const raw = JSON.parse(args.funding_history)
      const data = raw.map((f: Record<string, unknown>) => ({
        timestamp: f.timestamp as number,
        rate: f.rate as number,
        price: (f.price as number) ?? 0
      }))
      const result = backtestHistoricalFunding(data, parseFloat(args.position_size_usd ?? '100000'), parseFloat(args.holding_period_days ?? '3'), parseFloat(args.funding_interval_hours ?? '8'))
      return formatHistoricalFundingReport(result)
    }
  }))

  console.log(`[dsh-tool-cryptosignal] Loaded v${VERSION} — Crypto Arbitrage Signal Engine with 8 tools`)
  console.log('  Tools: funding_rate_analyzer, cross_exchange_spread, whale_movement_tracker, liquidation_heatmap, volatility_regime, basis_spread_monitor, arbitrage_opportunity_scorer, historical_funding_backtest')
}
