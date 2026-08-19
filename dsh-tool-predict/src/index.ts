/**
 * DSH Predictive Analytics Engine Plugin v0.1.0
 *
 * Statistical analysis and forecasting toolkit for DeepSeek Harness Agent.
 * Designed for analysts, data scientists, product managers, and business strategists.
 *
 * Features (v0.1.0):
 * - Time Series Forecaster (moving average, exponential smoothing, linear regression)
 * - Trend Predictor (direction, strength, momentum, reversal signals)
 * - Anomaly Detector (outlier identification with deviation scoring)
 * - Demand Forecaster (seasonality decomposition, promotion lift estimation)
 * - Churn Predictor (customer churn probability with risk factors)
 * - Revenue Projector (multi-scenario revenue projections)
 * - Risk Propensity Scorer (decision risk scoring with expected values)
 * - Scenario Simulator (Monte Carlo simulation with sensitivity analysis)
 *
 * @module dsh-tool-predict
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-predict'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface TimeSeriesPoint {
  date: string
  value: number
}

interface ForecastPoint {
  period: string
  forecast: number
  lowerBound: number
  upperBound: number
}

interface ForecastResult {
  method: string
  forecasts: ForecastPoint[]
  accuracy: {
    mape: number
    rmse: number
    mae: number
    r2: number
  }
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface TrendDataPoint {
  timestamp: string
  value: number
}

interface TrendResult {
  direction: 'bullish' | 'bearish' | 'sideways'
  strength: number
  momentum: {
    shortTerm: number
    mediumTerm: number
    longTerm: number
    acceleration: number
  }
  reversalSignals: Array<{
    type: string
    strength: number
    description: string
  }>
  support: number
  resistance: number
  summary: string
}

interface AnomalyPoint {
  timestamp: string
  value: number
  expectedValue: number
  deviation: number
  zscore: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  classification: string
}

interface AnomalyResult {
  anomalies: AnomalyPoint[]
  baselineStats: {
    mean: number
    stdDev: number
    median: number
    q1: number
    q3: number
  }
  sensitivity: string
  summary: {
    totalAnalyzed: number
    anomalyCount: number
    anomalyRate: number
    highSeverityCount: number
  }
}

interface DemandPoint {
  date: string
  value: number
}

interface ExternalFactor {
  name: string
  impact: number
  date?: string
}

interface DemandForecastResult {
  forecast: Array<{
    period: string
    predictedDemand: number
    lowerBound: number
    upperBound: number
    seasonalityFactor: number
  }>
  seasonality: {
    pattern: string
    peakPeriods: string[]
    troughPeriods: string[]
    seasonalIndices: number[]
  }
  promotionLift: Array<{
    period: string
    estimatedLift: number
    confidence: number
  }>
  accuracy: {
    mape: number
    bias: number
  }
}

interface CustomerData {
  customerId?: string
  tenure?: number
  usage?: number
  supportTickets?: number
  paymentDelays?: number
  [key: string]: unknown
}

interface ChurnResult {
  predictions: Array<{
    customerId: string
    churnProbability: number
    riskTier: 'low' | 'medium' | 'high' | 'critical'
    riskFactors: string[]
    retentionRecommendation: string
    estimatedLifetimeValue: number
  }>
  summary: {
    totalAnalyzed: number
    highRiskCount: number
    avgChurnProbability: number
    topRiskFactors: Array<{ factor: string; impact: number }>
  }
}

interface RevenuePoint {
  period: string
  revenue: number
}

interface GrowthAssumptions {
  baseGrowthRate?: number
  seasonalityFactor?: number
  marketExpansion?: number
  churnImpact?: number
}

interface RevenueProjection {
  scenario: string
  probability: number
  projections: Array<{
    period: string
    revenue: number
    growth: number
    cumulativeGrowth: number
  }>
  metrics: {
    totalProjectedRevenue: number
    avgGrowthRate: number
    peakRevenue: number
    peakPeriod: string
  }
}

interface RevenueResult {
  scenarios: RevenueProjection[]
  assumptions: GrowthAssumptions
  summary: {
    baseCaseNPV: number
    bestCaseNPV: number
    worstCaseNPV: number
    expectedValue: number
  }
}

interface DecisionOption {
  name: string
  expectedReturn: number
  maxLoss: number
  successProbability: number
  timeHorizon: number
}

interface DecisionContext {
  options: DecisionOption[]
  constraints?: {
    maxRisk?: number
    minReturn?: number
    timeLimit?: number
    budget?: number
  }
  historicalOutcomes?: Array<{
    option: string
    outcome: number
    date: string
  }>
}

interface RiskScore {
  option: string
  riskScore: number
  expectedValue: number
  riskAdjustedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  recommendation: string
}

interface RiskPropensityResult {
  scores: RiskScore[]
  optimalChoice: string
  riskBudgetUtilization: number
  diversificationBenefit: number
  summary: string
}

interface SimulationVariable {
  name: string
  min: number
  max: number
  distribution: 'uniform' | 'normal' | 'triangular' | 'lognormal'
  mean?: number
  stdDev?: number
}

interface ScenarioSimulationResult {
  iterations: number
  statistics: {
    mean: number
    median: number
    stdDev: number
    min: number
    max: number
    percentile5: number
    percentile25: number
    percentile75: number
    percentile95: number
  }
  distribution: Array<{
    range: string
    frequency: number
    probability: number
  }>
  sensitivity: Array<{
    variable: string
    correlation: number
    impactRank: number
    contribution: number
  }>
  probabilityOfSuccess: number
  valueAtRisk: number
}

// ==================== TOOL 1: TIME SERIES FORECASTER ====================

function forecastTimeSeries(
  series: TimeSeriesPoint[],
  periods: number,
  method: 'moving_average' | 'exponential_smoothing' | 'linear_regression' = 'linear_regression'
): ForecastResult {
  if (series.length < 3) {
    return {
      method,
      forecasts: [],
      accuracy: { mape: 0, rmse: 0, mae: 0, r2: 0 },
      trend: 'stable'
    }
  }

  const values = series.map(p => p.value)
  const n = values.length
  let forecasts: ForecastPoint[] = []

  if (method === 'moving_average') {
    const windowSize = Math.min(3, Math.floor(n / 2))
    let sum = 0
    for (let i = n - windowSize; i < n; i++) {
      sum += values[i]
    }
    const avg = sum / windowSize
    const stdDev = calculateStdDev(values)
    for (let i = 1; i <= periods; i++) {
      forecasts.push({
        period: `T+${i}`,
        forecast: round(avg),
        lowerBound: round(avg - 1.96 * stdDev),
        upperBound: round(avg + 1.96 * stdDev)
      })
    }
  } else if (method === 'exponential_smoothing') {
    const alpha = 0.3
    let smoothed = values[0]
    for (let i = 1; i < n; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed
    }
    const trend = n > 1 ? (values[n - 1] - values[0]) / n : 0
    const stdDev = calculateStdDev(values)
    for (let i = 1; i <= periods; i++) {
      const forecast = smoothed + trend * i
      const margin = stdDev * Math.sqrt(i) * 1.96
      forecasts.push({
        period: `T+${i}`,
        forecast: round(forecast),
        lowerBound: round(forecast - margin),
        upperBound: round(forecast + margin)
      })
    }
  } else {
    const xMean = (n - 1) / 2
    const yMean = values.reduce((s, v) => s + v, 0) / n
    let ssxy = 0
    let ssxx = 0
    for (let i = 0; i < n; i++) {
      ssxy += (i - xMean) * (values[i] - yMean)
      ssxx += (i - xMean) * (i - xMean)
    }
    const slope = ssxx > 0 ? ssxy / ssxx : 0
    const intercept = yMean - slope * xMean
    const residuals: number[] = []
    for (let i = 0; i < n; i++) {
      residuals.push(values[i] - (intercept + slope * i))
    }
    const residualStd = calculateStdDev(residuals)
    for (let i = 1; i <= periods; i++) {
      const forecast = intercept + slope * (n - 1 + i)
      const margin = residualStd * Math.sqrt(1 + 1 / n + Math.pow((n - 1 + i - xMean), 2) / ssxx) * 1.96
      forecasts.push({
        period: `T+${i}`,
        forecast: round(forecast),
        lowerBound: round(forecast - margin),
        upperBound: round(forecast + margin)
      })
    }
  }

  const accuracy = calculateForecastAccuracy(values, method)
  const trend = determineTrend(values)

  return { method, forecasts, accuracy, trend }
}

function calculateForecastAccuracy(values: number[], method: string): ForecastResult['accuracy'] {
  const n = values.length
  if (n < 3) return { mape: 0, rmse: 0, mae: 0, r2: 0 }

  const predictions: number[] = []
  if (method === 'moving_average') {
    const ws = Math.min(3, Math.floor(n / 2))
    for (let i = ws; i < n; i++) {
      let sum = 0
      for (let j = i - ws; j < i; j++) sum += values[j]
      predictions.push(sum / ws)
    }
  } else if (method === 'exponential_smoothing') {
    const alpha = 0.3
    let s = values[0]
    for (let i = 1; i < n; i++) {
      predictions.push(s)
      s = alpha * values[i] + (1 - alpha) * s
    }
  } else {
    const xMean = (n - 1) / 2
    const yMean = values.reduce((s, v) => s + v, 0) / n
    let ssxy = 0
    let ssxx = 0
    for (let i = 0; i < n; i++) {
      ssxy += (i - xMean) * (values[i] - yMean)
      ssxx += (i - xMean) * (i - xMean)
    }
    const slope = ssxx > 0 ? ssxy / ssxx : 0
    const intercept = yMean - slope * xMean
    for (let i = 0; i < n; i++) {
      predictions.push(intercept + slope * i)
    }
  }

  const actual = method === 'exponential_smoothing' ? values.slice(1) : (method === 'moving_average' ? values.slice(Math.min(3, Math.floor(n / 2))) : values)
  const pred = method === 'exponential_smoothing' ? predictions : (method === 'moving_average' ? predictions : predictions)

  const len = Math.min(actual.length, pred.length)
  let mapeSum = 0
  let rmseSum = 0
  let maeSum = 0
  let ssRes = 0
  const mean = actual.reduce((s, v) => s + v, 0) / actual.length
  let ssTot = 0
  let count = 0

  for (let i = 0; i < len; i++) {
    const a = actual[i]
    const p = pred[i]
    if (a !== 0) {
      mapeSum += Math.abs((a - p) / a)
      count++
    }
    rmseSum += (a - p) * (a - p)
    maeSum += Math.abs(a - p)
    ssRes += (a - p) * (a - p)
    ssTot += (a - mean) * (a - mean)
  }

  return {
    mape: count > 0 ? (mapeSum / count) * 100 : 0,
    rmse: len > 0 ? Math.sqrt(rmseSum / len) : 0,
    mae: len > 0 ? maeSum / len : 0,
    r2: ssTot > 0 ? 1 - ssRes / ssTot : 0
  }
}

function determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable'
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = values.reduce((s, v) => s + v, 0) / n
  let ssxy = 0
  let ssxx = 0
  for (let i = 0; i < n; i++) {
    ssxy += (i - xMean) * (values[i] - yMean)
    ssxx += (i - xMean) * (i - xMean)
  }
  const slope = ssxx > 0 ? ssxy / ssxx : 0
  const threshold = Math.abs(yMean) * 0.01
  if (slope > threshold) return 'increasing'
  if (slope < -threshold) return 'decreasing'
  return 'stable'
}

function formatForecastReport(result: ForecastResult): string {
  const lines: string[] = []
  lines.push('## Time Series Forecast Report')
  lines.push('')
  lines.push(`**Method:** ${result.method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`)
  lines.push(`**Trend:** ${result.trend.toUpperCase()}`)
  lines.push('')
  lines.push('### Accuracy Metrics')
  lines.push(`- MAPE: ${result.accuracy.mape.toFixed(2)}%`)
  lines.push(`- RMSE: ${result.accuracy.rmse.toFixed(4)}`)
  lines.push(`- MAE: ${result.accuracy.mae.toFixed(4)}`)
  lines.push(`- R-squared: ${result.accuracy.r2.toFixed(4)}`)
  lines.push('')
  lines.push('### Forecast')
  lines.push('| Period | Forecast | Lower Bound (95%) | Upper Bound (95%) |')
  lines.push('|--------|----------|-------------------|-------------------|')
  for (const f of result.forecasts) {
    lines.push(`| ${f.period} | ${f.forecast} | ${f.lowerBound} | ${f.upperBound} |`)
  }
  return lines.join('\n')
}

// ==================== TOOL 2: TREND PREDICTOR ====================

function predictTrend(
  data: TrendDataPoint[],
  window: number = 5
): TrendResult {
  if (data.length < 2) {
    return {
      direction: 'sideways',
      strength: 0,
      momentum: { shortTerm: 0, mediumTerm: 0, longTerm: 0, acceleration: 0 },
      reversalSignals: [],
      support: 0,
      resistance: 0,
      summary: 'Insufficient data for trend analysis'
    }
  }

  const values = data.map(d => d.value)
  const n = values.length
  const w = Math.min(window, Math.floor(n / 2))

  const shortMA = calculateMA(values, Math.min(3, w))
  const mediumMA = calculateMA(values, w)
  const longMA = calculateMA(values, Math.min(w * 2, n))

  const shortTerm = shortMA.length >= 2 ? shortMA[shortMA.length - 1] - shortMA[shortMA.length - 2] : 0
  const mediumTerm = mediumMA.length >= 2 ? mediumMA[mediumMA.length - 1] - mediumMA[mediumMA.length - 2] : 0
  const longTerm = longMA.length >= 2 ? longMA[longMA.length - 1] - longMA[longMA.length - 2] : 0
  const acceleration = shortTerm - (shortMA.length >= 3 ? shortMA[shortMA.length - 2] - shortMA[shortMA.length - 3] : 0)

  let direction: TrendResult['direction'] = 'sideways'
  const lastValue = values[n - 1]
  if (shortMA.length > 0 && mediumMA.length > 0) {
    if (shortMA[shortMA.length - 1] > mediumMA[mediumMA.length - 1] && lastValue > shortMA[shortMA.length - 1]) {
      direction = 'bullish'
    } else if (shortMA[shortMA.length - 1] < mediumMA[mediumMA.length - 1] && lastValue < shortMA[shortMA.length - 1]) {
      direction = 'bearish'
    }
  }

  const strength = calculateTrendStrength(values, w)
  const reversalSignals = detectReversalSignals(values, w)
  const support = Math.min(...values.slice(-w))
  const resistance = Math.max(...values.slice(-w))

  const summary = `${direction.toUpperCase()} trend detected with ${(strength * 100).toFixed(0)}% strength. ` +
    `Momentum: short=${shortTerm >= 0 ? '+' : ''}${shortTerm.toFixed(2)}, ` +
    `medium=${mediumTerm >= 0 ? '+' : ''}${mediumTerm.toFixed(2)}. ` +
    `${reversalSignals.length > 0 ? reversalSignals.length + ' reversal signal(s) active.' : 'No reversal signals.'}`

  return {
    direction,
    strength,
    momentum: { shortTerm, mediumTerm, longTerm, acceleration },
    reversalSignals,
    support,
    resistance,
    summary
  }
}

function calculateMA(values: number[], window: number): number[] {
  const result: number[] = []
  for (let i = window - 1; i < values.length; i++) {
    let sum = 0
    for (let j = i - window + 1; j <= i; j++) sum += values[j]
    result.push(sum / window)
  }
  return result
}

function calculateTrendStrength(values: number[], window: number): number {
  const n = values.length
  if (n < 2) return 0
  const xMean = (n - 1) / 2
  const yMean = values.reduce((s, v) => s + v, 0) / n
  let ssxy = 0
  let ssxx = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    ssxy += (i - xMean) * (values[i] - yMean)
    ssxx += (i - xMean) * (i - xMean)
    ssTot += (values[i] - yMean) * (values[i] - yMean)
  }
  const slope = ssxx > 0 ? ssxy / ssxx : 0
  const ssRes = ssTot - (ssxy * ssxy) / Math.max(ssxx, 0.001)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0
  const normalizedSlope = yMean !== 0 ? Math.abs(slope / yMean) : 0
  return Math.min(Math.sqrt(Math.max(r2, 0)) * (1 + normalizedSlope) / 2, 1)
}

function detectReversalSignals(values: number[], window: number): TrendResult['reversalSignals'] {
  const signals: TrendResult['reversalSignals'] = []
  const n = values.length
  if (n < window * 2) return signals

  const recent = values.slice(-window)
  const previous = values.slice(-window * 2, -window)
  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
  const prevAvg = previous.reduce((s, v) => s + v, 0) / previous.length
  const overallTrend = recentAvg - prevAvg

  if (Math.abs(overallTrend) > 0) {
    const lastThree = values.slice(-3)
    if (overallTrend > 0 && lastThree[2] < lastThree[1] && lastThree[1] < lastThree[0]) {
      signals.push({
        type: 'bearish_divergence',
        strength: 0.7,
        description: 'Price declining while trend is bullish — potential reversal'
      })
    } else if (overallTrend < 0 && lastThree[2] > lastThree[1] && lastThree[1] > lastThree[0]) {
      signals.push({
        type: 'bullish_divergence',
        strength: 0.7,
        description: 'Price rising while trend is bearish — potential reversal'
      })
    }
  }

  const stdDev = calculateStdDev(values)
  const lastValue = values[n - 1]
  const mean = values.reduce((s, v) => s + v, 0) / n
  if (lastValue > mean + 2 * stdDev) {
    signals.push({
      type: 'overbought',
      strength: 0.6,
      description: 'Value significantly above mean — overbought conditions'
    })
  } else if (lastValue < mean - 2 * stdDev) {
    signals.push({
      type: 'oversold',
      strength: 0.6,
      description: 'Value significantly below mean — oversold conditions'
    })
  }

  return signals
}

function formatTrendReport(result: TrendResult): string {
  const lines: string[] = []
  lines.push('## Trend Prediction Report')
  lines.push('')
  lines.push(`**Direction:** ${result.direction.toUpperCase()} | **Strength:** ${(result.strength * 100).toFixed(0)}%`)
  lines.push(`**Support:** ${result.support.toFixed(2)} | **Resistance:** ${result.resistance.toFixed(2)}`)
  lines.push('')
  lines.push('### Momentum Indicators')
  lines.push(`- Short-term: ${result.momentum.shortTerm >= 0 ? '+' : ''}${result.momentum.shortTerm.toFixed(4)}`)
  lines.push(`- Medium-term: ${result.momentum.mediumTerm >= 0 ? '+' : ''}${result.momentum.mediumTerm.toFixed(4)}`)
  lines.push(`- Long-term: ${result.momentum.longTerm >= 0 ? '+' : ''}${result.momentum.longTerm.toFixed(4)}`)
  lines.push(`- Acceleration: ${result.momentum.acceleration >= 0 ? '+' : ''}${result.momentum.acceleration.toFixed(4)}`)
  lines.push('')

  if (result.reversalSignals.length > 0) {
    lines.push('### Reversal Signals')
    for (const sig of result.reversalSignals) {
      lines.push(`- [${(sig.strength * 100).toFixed(0)}% strength] ${sig.type.replace(/_/g, ' ')}: ${sig.description}`)
    }
    lines.push('')
  }

  lines.push(`**Summary:** ${result.summary}`)
  return lines.join('\n')
}

// ==================== TOOL 3: ANOMALY DETECTOR ====================

function detectAnomalies(
  data: TrendDataPoint[],
  sensitivity: 'low' | 'medium' | 'high' = 'medium'
): AnomalyResult {
  if (data.length < 3) {
    return {
      anomalies: [],
      baselineStats: { mean: 0, stdDev: 0, median: 0, q1: 0, q3: 0 },
      sensitivity,
      summary: { totalAnalyzed: data.length, anomalyCount: 0, anomalyRate: 0, highSeverityCount: 0 }
    }
  }

  const values = data.map(d => d.value)
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const stdDev = calculateStdDev(values)
  const sorted = [...values].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]

  const zThreshold = sensitivity === 'low' ? 3.0 : sensitivity === 'high' ? 1.5 : 2.0
  const anomalies: AnomalyPoint[] = []

  for (let i = 0; i < data.length; i++) {
    const val = data[i].value
    const zscore = stdDev > 0 ? (val - mean) / stdDev : 0
    const absZ = Math.abs(zscore)

    if (absZ > zThreshold) {
      const severity: AnomalyPoint['severity'] = absZ > 3.5 ? 'critical' : absZ > 2.5 ? 'high' : absZ > 2 ? 'medium' : 'low'
      const classification = classifyAnomaly(val, mean, zscore, i > 0 ? values[i - 1] : val)
      anomalies.push({
        timestamp: data[i].timestamp,
        value: val,
        expectedValue: round(mean),
        deviation: round(val - mean),
        zscore: round(zscore),
        severity,
        classification
      })
    }
  }

  const highSeverity = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical').length

  return {
    anomalies,
    baselineStats: { mean: round(mean), stdDev: round(stdDev), median: round(median), q1: round(q1), q3: round(q3) },
    sensitivity,
    summary: {
      totalAnalyzed: data.length,
      anomalyCount: anomalies.length,
      anomalyRate: (anomalies.length / data.length) * 100,
      highSeverityCount: highSeverity
    }
  }
}

function classifyAnomaly(value: number, mean: number, zscore: number, prevValue: number): string {
  if (zscore > 0) {
    if (value > prevValue * 1.5) return 'spike'
    return 'positive_outlier'
  } else {
    if (value < prevValue * 0.5) return 'drop'
    return 'negative_outlier'
  }
}

function formatAnomalyReport(result: AnomalyResult): string {
  const lines: string[] = []
  lines.push('## Anomaly Detection Report')
  lines.push('')
  lines.push(`**Sensitivity:** ${result.sensitivity.toUpperCase()} | **Total Analyzed:** ${result.summary.totalAnalyzed}`)
  lines.push(`**Anomalies Found:** ${result.summary.anomalyCount} (${result.summary.anomalyRate.toFixed(1)}%) | High Severity: ${result.summary.highSeverityCount}`)
  lines.push('')
  lines.push('### Baseline Statistics')
  lines.push(`- Mean: ${result.baselineStats.mean} | Std Dev: ${result.baselineStats.stdDev}`)
  lines.push(`- Median: ${result.baselineStats.median} | Q1: ${result.baselineStats.q1} | Q3: ${result.baselineStats.q3}`)
  lines.push('')

  if (result.anomalies.length > 0) {
    lines.push('### Detected Anomalies')
    lines.push('| Timestamp | Value | Expected | Deviation | Z-Score | Severity | Type |')
    lines.push('|-----------|-------|----------|-----------|---------|----------|------|')
    for (const a of result.anomalies.slice(0, 20)) {
      lines.push(`| ${a.timestamp} | ${a.value} | ${a.expectedValue} | ${a.deviation >= 0 ? '+' : ''}${a.deviation} | ${a.zscore >= 0 ? '+' : ''}${a.zscore} | ${a.severity.toUpperCase()} | ${a.classification} |`)
    }
    if (result.anomalies.length > 20) {
      lines.push(`| ... | ... | ... | ... | ... | ... | +${result.anomalies.length - 20} more |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: DEMAND FORECASTER ====================

function forecastDemand(
  demandHistory: DemandPoint[],
  seasonality: string = 'auto',
  externalFactors?: ExternalFactor[]
): DemandForecastResult {
  if (demandHistory.length < 3) {
    return {
      forecast: [],
      seasonality: { pattern: 'insufficient_data', peakPeriods: [], troughPeriods: [], seasonalIndices: [] },
      promotionLift: [],
      accuracy: { mape: 0, bias: 0 }
    }
  }

  const values = demandHistory.map(d => d.value)
  const n = values.length
  const mean = values.reduce((s, v) => s + v, 0) / n
  const stdDev = calculateStdDev(values)

  const detectedSeasonality = seasonality === 'auto' ? detectSeasonality(values) : seasonality
  const seasonalIndices = calculateSeasonalIndices(values, detectedSeasonality)
  const periods = Math.min(12, Math.max(3, Math.floor(n / 2)))

  const trend = (values[n - 1] - values[0]) / n
  const forecast: DemandForecastResult['forecast'] = []

  for (let i = 1; i <= periods; i++) {
    const seasonalIdx = seasonalIndices[i % seasonalIndices.length]
    const baseForecast = mean + trend * i
    const predicted = baseForecast * seasonalIdx
    const margin = stdDev * 1.96 * Math.sqrt(i)
    forecast.push({
      period: `Period+${i}`,
      predictedDemand: round(predicted),
      lowerBound: round(Math.max(0, predicted - margin)),
      upperBound: round(predicted + margin),
      seasonalityFactor: round(seasonalIdx)
    })
  }

  const promotionLift: DemandForecastResult['promotionLift'] = []
  if (externalFactors && externalFactors.length > 0) {
    for (const factor of externalFactors) {
      if (factor.name.toLowerCase().includes('promo') || factor.name.toLowerCase().includes('campaign')) {
        promotionLift.push({
          period: factor.date ?? 'upcoming',
          estimatedLift: round(factor.impact * mean / 100),
          confidence: Math.min(0.9, 0.5 + Math.abs(factor.impact) / 100)
        })
      }
    }
  }

  const mape = calculateDemandMAPE(values, trend)

  return {
    forecast,
    seasonality: {
      pattern: detectedSeasonality,
      peakPeriods: identifyPeakPeriods(seasonalIndices),
      troughPeriods: identifyTroughPeriods(seasonalIndices),
      seasonalIndices: seasonalIndices.map(v => round(v))
    },
    promotionLift,
    accuracy: { mape, bias: round((trend / Math.max(mean, 0.01)) * 100) }
  }
}

function detectSeasonality(values: number[]): string {
  const n = values.length
  if (n < 4) return 'none'

  let maxAutocorr = 0
  let bestPeriod = 0
  const mean = values.reduce((s, v) => s + v, 0) / n

  for (let lag = 2; lag <= Math.min(Math.floor(n / 2), 12); lag++) {
    let numerator = 0
    let denominator = 0
    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean)
    }
    for (let i = 0; i < n; i++) {
      denominator += (values[i] - mean) * (values[i] - mean)
    }
    const autocorr = denominator > 0 ? numerator / denominator : 0
    if (autocorr > maxAutocorr) {
      maxAutocorr = autocorr
      bestPeriod = lag
    }
  }

  if (maxAutocorr > 0.3 && bestPeriod > 0) {
    return `periodic_${bestPeriod}`
  }
  return 'none'
}

function calculateSeasonalIndices(values: number[], pattern: string): number[] {
  const n = values.length
  const mean = values.reduce((s, v) => s + v, 0) / n

  if (pattern === 'none' || !pattern.startsWith('periodic_')) {
    return new Array(Math.min(n, 4)).fill(1)
  }

  const period = parseInt(pattern.split('_')[1])
  if (isNaN(period) || period < 1) return [1]

  const indices: number[] = []
  for (let i = 0; i < period; i++) {
    let sum = 0
    let count = 0
    for (let j = i; j < n; j += period) {
      sum += values[j]
      count++
    }
    indices.push(count > 0 && mean > 0 ? (sum / count) / mean : 1)
  }
  return indices
}

function identifyPeakPeriods(indices: number[]): string[] {
  const peaks: string[] = []
  const mean = indices.reduce((s, v) => s + v, 0) / indices.length
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] > mean * 1.1) peaks.push(`Period ${i + 1}`)
  }
  return peaks
}

function identifyTroughPeriods(indices: number[]): string[] {
  const troughs: string[] = []
  const mean = indices.reduce((s, v) => s + v, 0) / indices.length
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] < mean * 0.9) troughs.push(`Period ${i + 1}`)
  }
  return troughs
}

function calculateDemandMAPE(values: number[], trend: number): number {
  const n = values.length
  if (n < 2) return 0
  let sum = 0
  let count = 0
  for (let i = 1; i < n; i++) {
    const predicted = values[i - 1] + trend
    if (values[i] !== 0) {
      sum += Math.abs((values[i] - predicted) / values[i])
      count++
    }
  }
  return count > 0 ? (sum / count) * 100 : 0
}

function formatDemandReport(result: DemandForecastResult): string {
  const lines: string[] = []
  lines.push('## Demand Forecast Report')
  lines.push('')
  lines.push(`**Seasonality Pattern:** ${result.seasonality.pattern}`)
  lines.push(`**Accuracy:** MAPE ${result.accuracy.mape.toFixed(2)}% | Bias: ${result.accuracy.bias >= 0 ? '+' : ''}${result.accuracy.bias}%`)
  lines.push('')

  if (result.seasonality.peakPeriods.length > 0) {
    lines.push(`**Peak Periods:** ${result.seasonality.peakPeriods.join(', ')}`)
  }
  if (result.seasonality.troughPeriods.length > 0) {
    lines.push(`**Trough Periods:** ${result.seasonality.troughPeriods.join(', ')}`)
  }
  lines.push('')

  lines.push('### Demand Forecast')
  lines.push('| Period | Predicted | Lower Bound | Upper Bound | Seasonality |')
  lines.push('|--------|-----------|-------------|-------------|-------------|')
  for (const f of result.forecast) {
    lines.push(`| ${f.period} | ${f.predictedDemand} | ${f.lowerBound} | ${f.upperBound} | ${f.seasonalityFactor} |`)
  }

  if (result.promotionLift.length > 0) {
    lines.push('')
    lines.push('### Promotion Lift Estimates')
    for (const p of result.promotionLift) {
      lines.push(`- ${p.period}: +${p.estimatedLift} units (${(p.confidence * 100).toFixed(0)}% confidence)`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: CHURN PREDICTOR ====================

function predictChurn(customerData: CustomerData[]): ChurnResult {
  if (customerData.length === 0) {
    return {
      predictions: [],
      summary: { totalAnalyzed: 0, highRiskCount: 0, avgChurnProbability: 0, topRiskFactors: [] }
    }
  }

  const predictions: ChurnResult['predictions'] = []
  const riskFactorCounts = new Map<string, { count: number; totalImpact: number }>()

  for (const customer of customerData) {
    const id = (customer.customerId as string) ?? `CUST-${predictions.length + 1}`
    const tenure = (customer.tenure as number) ?? 12
    const usage = (customer.usage as number) ?? 50
    const supportTickets = (customer.supportTickets as number) ?? 0
    const paymentDelays = (customer.paymentDelays as number) ?? 0

    let churnScore = 0
    const riskFactors: string[] = []

    if (tenure < 3) {
      churnScore += 0.25
      riskFactors.push('Low tenure (<3 months)')
      incrementRiskFactor(riskFactorCounts, 'low_tenure', 0.25)
    } else if (tenure < 6) {
      churnScore += 0.1
      riskFactors.push('Short tenure (<6 months)')
      incrementRiskFactor(riskFactorCounts, 'short_tenure', 0.1)
    }

    if (usage < 20) {
      churnScore += 0.3
      riskFactors.push('Very low usage (<20%)')
      incrementRiskFactor(riskFactorCounts, 'very_low_usage', 0.3)
    } else if (usage < 50) {
      churnScore += 0.15
      riskFactors.push('Low usage (<50%)')
      incrementRiskFactor(riskFactorCounts, 'low_usage', 0.15)
    }

    if (supportTickets > 5) {
      churnScore += 0.2
      riskFactors.push('High support tickets (>5)')
      incrementRiskFactor(riskFactorCounts, 'high_support_tickets', 0.2)
    } else if (supportTickets > 2) {
      churnScore += 0.08
      riskFactors.push('Elevated support tickets (>2)')
      incrementRiskFactor(riskFactorCounts, 'elevated_support_tickets', 0.08)
    }

    if (paymentDelays > 2) {
      churnScore += 0.25
      riskFactors.push('Multiple payment delays (>2)')
      incrementRiskFactor(riskFactorCounts, 'payment_delays', 0.25)
    } else if (paymentDelays > 0) {
      churnScore += 0.1
      riskFactors.push('Payment delay history')
      incrementRiskFactor(riskFactorCounts, 'payment_delay_history', 0.1)
    }

    const churnProbability = Math.min(churnScore, 0.95)
    const riskTier: ChurnResult['predictions'][0]['riskTier'] =
      churnProbability > 0.6 ? 'critical' : churnProbability > 0.4 ? 'high' : churnProbability > 0.2 ? 'medium' : 'low'

    const ltv = calculateEstimatedLTV(tenure, usage, churnProbability)
    const recommendation = generateRetentionRecommendation(riskTier, riskFactors)

    predictions.push({
      customerId: id,
      churnProbability: round(churnProbability),
      riskTier,
      riskFactors,
      retentionRecommendation: recommendation,
      estimatedLifetimeValue: round(ltv)
    })
  }

  predictions.sort((a, b) => b.churnProbability - a.churnProbability)

  const highRisk = predictions.filter(p => p.riskTier === 'high' || p.riskTier === 'critical')
  const avgChurn = predictions.reduce((s, p) => s + p.churnProbability, 0) / predictions.length

  const topRiskFactors = Array.from(riskFactorCounts.entries())
    .map(([factor, data]) => ({ factor, impact: data.totalImpact / data.count }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)

  return {
    predictions,
    summary: {
      totalAnalyzed: customerData.length,
      highRiskCount: highRisk.length,
      avgChurnProbability: round(avgChurn),
      topRiskFactors
    }
  }
}

function incrementRiskFactor(map: Map<string, { count: number; totalImpact: number }>, factor: string, impact: number): void {
  const existing = map.get(factor) ?? { count: 0, totalImpact: 0 }
  existing.count++
  existing.totalImpact += impact
  map.set(factor, existing)
}

function calculateEstimatedLTV(tenure: number, usage: number, churnProbability: number): number {
  const monthlyValue = usage * 0.5
  const expectedLifetime = churnProbability > 0 ? (1 - churnProbability) / Math.max(churnProbability, 0.01) : 24
  return monthlyValue * Math.min(expectedLifetime, 24) + tenure * 2
}

function generateRetentionRecommendation(riskTier: string, riskFactors: string[]): string {
  if (riskTier === 'critical') {
    return `URGENT: Immediate outreach required. Assign dedicated account manager. Offer personalized retention package. Key issues: ${riskFactors.slice(0, 2).join(', ')}.`
  } else if (riskTier === 'high') {
    return `Schedule check-in call within 7 days. Consider offering incentive or discount. Address: ${riskFactors[0] ?? 'general engagement'}.`
  } else if (riskTier === 'medium') {
    return `Monitor closely. Send engagement campaign. Provide usage tips to increase adoption.`
  }
  return 'Maintain regular engagement. Consider upsell opportunities.'
}

function formatChurnReport(result: ChurnResult): string {
  const lines: string[] = []
  lines.push('## Churn Prediction Report')
  lines.push('')
  lines.push(`**Total Analyzed:** ${result.summary.totalAnalyzed} | **High Risk:** ${result.summary.highRiskCount}`)
  lines.push(`**Average Churn Probability:** ${(result.summary.avgChurnProbability * 100).toFixed(1)}%`)
  lines.push('')

  if (result.summary.topRiskFactors.length > 0) {
    lines.push('### Top Risk Factors')
    for (const rf of result.summary.topRiskFactors) {
      lines.push(`- ${rf.factor.replace(/_/g, ' ')}: avg impact ${(rf.impact * 100).toFixed(1)}%`)
    }
    lines.push('')
  }

  lines.push('### Customer Risk Assessment')
  lines.push('| Customer | Churn Prob | Risk Tier | Key Factors | LTV |')
  lines.push('|----------|------------|-----------|-------------|-----|')
  for (const p of result.predictions.slice(0, 15)) {
    const factors = p.riskFactors.length > 0 ? p.riskFactors[0] : 'None'
    lines.push(`| ${p.customerId} | ${(p.churnProbability * 100).toFixed(1)}% | ${p.riskTier.toUpperCase()} | ${factors} | $${p.estimatedLifetimeValue} |`)
  }
  if (result.predictions.length > 15) {
    lines.push(`| ... | ... | ... | ... | +${result.predictions.length - 15} more |`)
  }

  const critical = result.predictions.filter(p => p.riskTier === 'critical')
  if (critical.length > 0) {
    lines.push('')
    lines.push('### Critical Risk Customers')
    for (const c of critical.slice(0, 5)) {
      lines.push(`- **${c.customerId}**: ${(c.churnProbability * 100).toFixed(1)}% — ${c.retentionRecommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: REVENUE PROJECTOR ====================

function projectRevenue(
  revenueHistory: RevenuePoint[],
  assumptions?: GrowthAssumptions,
  numScenarios: number = 3
): RevenueResult {
  if (revenueHistory.length < 2) {
    return {
      scenarios: [],
      assumptions: assumptions ?? {},
      summary: { baseCaseNPV: 0, bestCaseNPV: 0, worstCaseNPV: 0, expectedValue: 0 }
    }
  }

  const revenues = revenueHistory.map(r => r.revenue)
  const n = revenues.length
  const baseGrowth = assumptions?.baseGrowthRate ?? calculateHistoricalGrowth(revenues)
  const seasonalityFactor = assumptions?.seasonalityFactor ?? 0
  const marketExpansion = assumptions?.marketExpansion ?? 0
  const churnImpact = assumptions?.churnImpact ?? 0

  const periods = 12
  const scenarios: RevenueProjection[] = []

  const scenarioConfigs = [
    { name: 'Best Case', multiplier: 1.3, probability: 0.2 + marketExpansion * 0.01 },
    { name: 'Base Case', multiplier: 1.0, probability: 0.5 },
    { name: 'Worst Case', multiplier: 0.7, probability: 0.3 - marketExpansion * 0.01 }
  ].slice(0, numScenarios)

  let bestNPV = 0
  let baseNPV = 0
  let worstNPV = 0
  let expectedValue = 0

  for (const config of scenarioConfigs) {
    const projections: RevenueProjection['projections'] = []
    let lastRevenue = revenues[n - 1]
    let totalRevenue = 0
    let peakRevenue = 0
    let peakPeriod = ''

    for (let i = 1; i <= periods; i++) {
      const growthRate = (baseGrowth * config.multiplier) - churnImpact + seasonalityFactor * Math.sin((i / periods) * Math.PI * 2)
      const revenue = lastRevenue * (1 + growthRate / 100)
      const cumulativeGrowth = ((revenue - revenues[0]) / revenues[0]) * 100
      lastRevenue = revenue
      totalRevenue += revenue

      if (revenue > peakRevenue) {
        peakRevenue = revenue
        peakPeriod = `M+${i}`
      }

      projections.push({
        period: `M+${i}`,
        revenue: round(revenue),
        growth: round(growthRate),
        cumulativeGrowth: round(cumulativeGrowth)
      })
    }

    const avgGrowth = projections.reduce((s, p) => s + p.growth, 0) / projections.length
    const npv = totalRevenue / Math.pow(1 + 0.1, periods / 12)

    if (config.name === 'Best Case') bestNPV = npv
    if (config.name === 'Base Case') baseNPV = npv
    if (config.name === 'Worst Case') worstNPV = npv
    expectedValue += npv * config.probability

    scenarios.push({
      scenario: config.name,
      probability: config.probability,
      projections,
      metrics: {
        totalProjectedRevenue: round(totalRevenue),
        avgGrowthRate: round(avgGrowth),
        peakRevenue: round(peakRevenue),
        peakPeriod
      }
    })
  }

  return {
    scenarios,
    assumptions: {
      baseGrowthRate: baseGrowth,
      seasonalityFactor,
      marketExpansion,
      churnImpact
    },
    summary: {
      baseCaseNPV: round(baseNPV),
      bestCaseNPV: round(bestNPV),
      worstCaseNPV: round(worstNPV),
      expectedValue: round(expectedValue)
    }
  }
}

function calculateHistoricalGrowth(revenues: number[]): number {
  const n = revenues.length
  if (n < 2) return 0
  const totalGrowth = ((revenues[n - 1] - revenues[0]) / Math.max(revenues[0], 0.01)) * 100
  return totalGrowth / (n - 1)
}

function formatRevenueReport(result: RevenueResult): string {
  const lines: string[] = []
  lines.push('## Revenue Projection Report')
  lines.push('')
  lines.push(`**Assumptions:** Base growth ${result.assumptions.baseGrowthRate?.toFixed(1) ?? 0}% | Market expansion: ${result.assumptions.marketExpansion ?? 0}% | Churn impact: ${result.assumptions.churnImpact ?? 0}%`)
  lines.push('')
  lines.push('### Scenario Summary')
  lines.push('| Scenario | Probability | Total Revenue | Avg Growth | Peak Revenue | Peak Period |')
  lines.push('|----------|-------------|---------------|------------|--------------|-------------|')
  for (const s of result.scenarios) {
    lines.push(`| ${s.scenario} | ${(s.probability * 100).toFixed(0)}% | $${s.metrics.totalProjectedRevenue.toLocaleString()} | ${s.metrics.avgGrowthRate}% | $${s.metrics.peakRevenue.toLocaleString()} | ${s.metrics.peakPeriod} |`)
  }
  lines.push('')
  lines.push('### NPV Analysis')
  lines.push(`- Best Case NPV: $${result.summary.bestCaseNPV.toLocaleString()}`)
  lines.push(`- Base Case NPV: $${result.summary.baseCaseNPV.toLocaleString()}`)
  lines.push(`- Worst Case NPV: $${result.summary.worstCaseNPV.toLocaleString()}`)
  lines.push(`- Expected Value: $${result.summary.expectedValue.toLocaleString()}`)
  lines.push('')

  const baseCase = result.scenarios.find(s => s.scenario === 'Base Case')
  if (baseCase) {
    lines.push('### Base Case Monthly Projections')
    lines.push('| Period | Revenue | Growth | Cumulative |')
    lines.push('|--------|---------|--------|------------|')
    for (const p of baseCase.projections) {
      lines.push(`| ${p.period} | $${p.revenue.toLocaleString()} | ${p.growth >= 0 ? '+' : ''}${p.growth}% | ${p.cumulativeGrowth >= 0 ? '+' : ''}${p.cumulativeGrowth}% |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: RISK PROPENSITY SCORER ====================

function scoreRiskPropensity(context: DecisionContext): RiskPropensityResult {
  if (!context.options || context.options.length === 0) {
    return {
      scores: [],
      optimalChoice: '',
      riskBudgetUtilization: 0,
      diversificationBenefit: 0,
      summary: 'No options provided for risk scoring'
    }
  }

  const scores: RiskScore[] = []
  const maxRisk = context.constraints?.maxRisk ?? 100
  const minReturn = context.constraints?.minReturn ?? 0

  for (const option of context.options) {
    const ev = option.expectedReturn * option.successProbability + option.maxLoss * (1 - option.successProbability)
    const risk = Math.abs(option.maxLoss) / Math.max(option.expectedReturn, 0.01) * (1 - option.successProbability)
    const riskScore = Math.min(risk * 20, 100)
    const riskAdjustedReturn = ev / Math.max(risk, 0.01)
    const sharpe = risk > 0 ? (ev - minReturn) / (risk * 10) : ev
    const maxDrawdown = Math.abs(option.maxLoss)

    let recommendation = 'Acceptable'
    if (riskScore > 70) {
      recommendation = 'High Risk — Consider reducing exposure or hedging'
    } else if (riskScore < 30 && ev > minReturn) {
      recommendation = 'Low Risk — Favorable risk/reward, consider increasing allocation'
    } else if (ev < minReturn) {
      recommendation = 'Below minimum return threshold — Reject'
    }

    scores.push({
      option: option.name,
      riskScore: round(riskScore),
      expectedValue: round(ev),
      riskAdjustedReturn: round(riskAdjustedReturn),
      sharpeRatio: round(sharpe),
      maxDrawdown: round(maxDrawdown),
      recommendation
    })
  }

  scores.sort((a, b) => b.riskAdjustedReturn - a.riskAdjustedReturn)
  const optimal = scores[0]?.option ?? ''
  const avgRisk = scores.reduce((s, sc) => s + sc.riskScore, 0) / scores.length
  const riskBudgetUtilization = Math.min((avgRisk / maxRisk) * 100, 100)
  const diversificationBenefit = scores.length > 1 ? round((1 - calculateStdDev(scores.map(s => s.riskScore)) / Math.max(avgRisk, 0.01)) * 100) : 0

  const summary = `Optimal choice: **${optimal}** with risk-adjusted return of ${scores[0]?.riskAdjustedReturn ?? 0}. ` +
    `Risk budget utilization: ${riskBudgetUtilization.toFixed(0)}%. ` +
    `${scores.filter(s => s.riskScore > 70).length} high-risk option(s) identified.`

  return {
    scores,
    optimalChoice: optimal,
    riskBudgetUtilization: round(riskBudgetUtilization),
    diversificationBenefit,
    summary
  }
}

function formatRiskScoreReport(result: RiskPropensityResult): string {
  const lines: string[] = []
  lines.push('## Risk Propensity Scorecard')
  lines.push('')
  lines.push(`**Optimal Choice:** ${result.optimalChoice}`)
  lines.push(`**Risk Budget Utilization:** ${result.riskBudgetUtilization}% | **Diversification Benefit:** ${result.diversificationBenefit}%`)
  lines.push('')
  lines.push('### Risk Scores by Option')
  lines.push('| Option | Risk Score | Expected Value | Risk-Adj Return | Sharpe | Max Drawdown | Recommendation |')
  lines.push('|--------|------------|----------------|------------------|--------|--------------|----------------|')
  for (const s of result.scores) {
    lines.push(`| ${s.option} | ${s.riskScore} | ${s.expectedValue} | ${s.riskAdjustedReturn} | ${s.sharpeRatio} | ${s.maxDrawdown} | ${s.recommendation} |`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  return lines.join('\n')
}

// ==================== TOOL 8: SCENARIO SIMULATOR ====================

function simulateScenarios(
  baseCase: Record<string, number>,
  variables: SimulationVariable[],
  iterations: number = 1000
): ScenarioSimulationResult {
  const results: number[] = []
  const varNames = Object.keys(baseCase)
  const baseValue = varNames.reduce((s, k) => s + baseCase[k], 0)

  for (let i = 0; i < iterations; i++) {
    let iterationValue = baseValue
    for (const v of variables) {
      const randomValue = generateRandomValue(v)
      iterationValue += randomValue - ((v.min + v.max) / 2)
    }
    results.push(iterationValue)
  }

  results.sort((a, b) => a - b)

  const mean = results.reduce((s, v) => s + v, 0) / results.length
  const median = results[Math.floor(results.length / 2)]
  const stdDev = calculateStdDev(results)
  const min = results[0]
  const max = results[results.length - 1]

  const distribution = createDistribution(results, mean, stdDev)
  const sensitivity = calculateSensitivity(baseCase, variables, iterations)
  const probSuccess = results.filter(r => r > baseValue).length / results.length
  const var95 = results[Math.floor(results.length * 0.05)]

  return {
    iterations,
    statistics: {
      mean: round(mean),
      median: round(median),
      stdDev: round(stdDev),
      min: round(min),
      max: round(max),
      percentile5: round(results[Math.floor(results.length * 0.05)]),
      percentile25: round(results[Math.floor(results.length * 0.25)]),
      percentile75: round(results[Math.floor(results.length * 0.75)]),
      percentile95: round(results[Math.floor(results.length * 0.95)])
    },
    distribution,
    sensitivity,
    probabilityOfSuccess: round(probSuccess),
    valueAtRisk: round(var95)
  }
}

function generateRandomValue(variable: SimulationVariable): number {
  const { min, max, distribution, mean, stdDev } = variable

  switch (distribution) {
    case 'normal': {
      const m = mean ?? (min + max) / 2
      const s = stdDev ?? (max - min) / 4
      return boxMuller(m, s)
    }
    case 'triangular': {
      const mode = mean ?? (min + max) / 2
      const u = Math.random()
      const f = (mode - min) / (max - min)
      if (u < f) {
        return min + Math.sqrt(u * (max - min) * (mode - min))
      }
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode))
    }
    case 'lognormal': {
      const m = mean ?? (min + max) / 2
      const s = stdDev ?? (max - min) / 4
      const normal = boxMuller(Math.log(Math.max(m, 0.01)), s / Math.max(m, 0.01))
      return Math.exp(normal)
    }
    case 'uniform':
    default:
      return min + Math.random() * (max - min)
  }
}

function boxMuller(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2)
  return mean + z * stdDev
}

function createDistribution(results: number[], mean: number, stdDev: number): ScenarioSimulationResult['distribution'] {
  const numBins = 10
  const min = results[0]
  const max = results[results.length - 1]
  const binWidth = (max - min) / numBins
  const bins: number[] = new Array(numBins).fill(0)

  for (const r of results) {
    const binIdx = Math.min(Math.floor((r - min) / Math.max(binWidth, 0.001)), numBins - 1)
    bins[binIdx]++
  }

  return bins.map((freq, i) => ({
    range: `${round(min + i * binWidth)}-${round(min + (i + 1) * binWidth)}`,
    frequency: freq,
    probability: round(freq / results.length)
  }))
}

function calculateSensitivity(
  baseCase: Record<string, number>,
  variables: SimulationVariable[],
  iterations: number
): ScenarioSimulationResult['sensitivity'] {
  const baseValue = Object.values(baseCase).reduce((s, v) => s + v, 0)
  const correlations: ScenarioSimulationResult['sensitivity'] = []

  for (const v of variables) {
    const impacts: number[] = []
    for (let i = 0; i < Math.min(iterations, 200); i++) {
      const val = generateRandomValue(v)
      impacts.push(val - (v.min + v.max) / 2)
    }
    const avgImpact = impacts.reduce((s, v) => s + Math.abs(v), 0) / impacts.length
    const range = v.max - v.min
    const correlation = range > 0 ? avgImpact / range : 0

    correlations.push({
      variable: v.name,
      correlation: round(correlation),
      impactRank: 0,
      contribution: round(avgImpact)
    })
  }

  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
  for (let i = 0; i < correlations.length; i++) {
    correlations[i].impactRank = i + 1
  }

  return correlations
}

function formatSimulationReport(result: ScenarioSimulationResult): string {
  const lines: string[] = []
  lines.push('## Scenario Simulation Report')
  lines.push('')
  lines.push(`**Iterations:** ${result.iterations.toLocaleString()}`)
  lines.push(`**Probability of Success:** ${(result.probabilityOfSuccess * 100).toFixed(1)}% | **Value at Risk (95%):** ${result.valueAtRisk}`)
  lines.push('')
  lines.push('### Result Statistics')
  lines.push(`- Mean: ${result.statistics.mean} | Median: ${result.statistics.median}`)
  lines.push(`- Std Dev: ${result.statistics.stdDev}`)
  lines.push(`- Min: ${result.statistics.min} | Max: ${result.statistics.max}`)
  lines.push(`- 5th Percentile: ${result.statistics.percentile5} | 95th Percentile: ${result.statistics.percentile95}`)
  lines.push(`- 25th Percentile: ${result.statistics.percentile25} | 75th Percentile: ${result.statistics.percentile75}`)
  lines.push('')

  lines.push('### Probability Distribution')
  lines.push('| Range | Frequency | Probability |')
  lines.push('|-------|-----------|-------------|')
  for (const d of result.distribution) {
    const bar = '#'.repeat(Math.min(Math.round(d.probability * 50), 50))
    lines.push(`| ${d.range} | ${d.frequency} | ${(d.probability * 100).toFixed(1)}% ${bar} |`)
  }
  lines.push('')

  if (result.sensitivity.length > 0) {
    lines.push('### Sensitivity Analysis')
    lines.push('| Variable | Correlation | Impact Rank | Contribution |')
    lines.push('|----------|-------------|-------------|--------------|')
    for (const s of result.sensitivity) {
      lines.push(`| ${s.variable} | ${s.correlation} | #${s.impactRank} | ${s.contribution} |`)
    }
  }

  return lines.join('\n')
}

// ==================== UTILITY FUNCTIONS ====================

function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'time_series_forecaster',
    description: 'Forecast future values from historical time series data. Supports moving average, exponential smoothing, and linear regression methods. Returns forecasts with confidence intervals and accuracy metrics (MAPE, RMSE, MAE, R-squared).',
    parameters: {
      series: { type: 'string', required: true, description: 'JSON array of data points with fields: date (string), value (number)' },
      periods: { type: 'string', required: true, description: 'Number of future periods to forecast' },
      method: { type: 'string', description: 'Forecasting method: "moving_average", "exponential_smoothing", or "linear_regression" (default)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { series: string; periods: string; method?: string }) {
      const data: TimeSeriesPoint[] = JSON.parse(args.series)
      const periods = parseInt(args.periods)
      const method = (args.method as 'moving_average' | 'exponential_smoothing' | 'linear_regression') ?? 'linear_regression'
      const result = forecastTimeSeries(data, periods, method)
      return formatForecastReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'trend_predictor',
    description: 'Predict trend direction and strength from time series data. Provides momentum indicators (short/medium/long-term), acceleration metrics, support/resistance levels, and reversal signal detection.',
    parameters: {
      data: { type: 'string', required: true, description: 'JSON array of data points with fields: timestamp (string), value (number)' },
      window: { type: 'string', description: 'Analysis window size (default "5")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { data: string; window?: string }) {
      const data: TrendDataPoint[] = JSON.parse(args.data)
      const window = parseInt(args.window ?? '5')
      const result = predictTrend(data, window)
      return formatTrendReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'anomaly_detector',
    description: 'Detect anomalies in data series using statistical methods. Identifies outliers with z-scores, deviation metrics, and pattern classification (spike, drop, positive/negative outlier). Configurable sensitivity.',
    parameters: {
      data: { type: 'string', required: true, description: 'JSON array of data points with fields: timestamp (string), value (number)' },
      sensitivity: { type: 'string', description: 'Detection sensitivity: "low" (z>3), "medium" (z>2), or "high" (z>1.5)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { data: string; sensitivity?: string }) {
      const data: TrendDataPoint[] = JSON.parse(args.data)
      const sensitivity = (args.sensitivity as 'low' | 'medium' | 'high') ?? 'medium'
      const result = detectAnomalies(data, sensitivity)
      return formatAnomalyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'demand_forecaster',
    description: 'Forecast product or service demand with seasonality decomposition and promotion lift estimates. Detects seasonal patterns, identifies peak/trough periods, and quantifies external factor impacts.',
    parameters: {
      demand_history: { type: 'string', required: true, description: 'JSON array of demand data points with fields: date (string), value (number)' },
      seasonality: { type: 'string', description: 'Seasonality pattern: "auto" (detect), "none", or "periodic_N" (default "auto")' },
      external_factors: { type: 'string', description: 'Optional JSON array of external factors with fields: name, impact (percentage), date' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { demand_history: string; seasonality?: string; external_factors?: string }) {
      const data: DemandPoint[] = JSON.parse(args.demand_history)
      const seasonality = args.seasonality ?? 'auto'
      const factors: ExternalFactor[] | undefined = args.external_factors ? JSON.parse(args.external_factors) : undefined
      const result = forecastDemand(data, seasonality, factors)
      return formatDemandReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'churn_predictor',
    description: 'Predict customer churn probability using behavioral features (tenure, usage, support tickets, payment delays). Returns risk tiers, contributing factors, retention recommendations, and estimated lifetime value.',
    parameters: {
      customer_data: { type: 'string', required: true, description: 'JSON array of customer objects with fields: customerId, tenure (months), usage (0-100), supportTickets, paymentDelays' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { customer_data: string }) {
      const data: CustomerData[] = JSON.parse(args.customer_data)
      const result = predictChurn(data)
      return formatChurnReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'revenue_projector',
    description: 'Project future revenue across multiple scenarios (best/base/worst case). Calculates growth rates, NPV, and peak revenue periods. Supports custom growth assumptions and market expansion factors.',
    parameters: {
      revenue_history: { type: 'string', required: true, description: 'JSON array of revenue data points with fields: period (string), revenue (number)' },
      growth_assumptions: { type: 'string', description: 'Optional JSON object with fields: baseGrowthRate (%), seasonalityFactor, marketExpansion (%), churnImpact (%)' },
      scenarios: { type: 'string', description: 'Number of scenarios to generate: "2" or "3" (default "3")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { revenue_history: string; growth_assumptions?: string; scenarios?: string }) {
      const data: RevenuePoint[] = JSON.parse(args.revenue_history)
      const assumptions: GrowthAssumptions | undefined = args.growth_assumptions ? JSON.parse(args.growth_assumptions) : undefined
      const numScenarios = parseInt(args.scenarios ?? '3')
      const result = projectRevenue(data, assumptions, numScenarios)
      return formatRevenueReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'risk_propensity_scorer',
    description: 'Score risk propensity for decision options. Evaluates expected value, risk-adjusted returns, Sharpe ratio, and maximum drawdown. Provides optimal choice recommendation and risk budget utilization.',
    parameters: {
      decision_context: { type: 'string', required: true, description: 'JSON object with fields: options (array of {name, expectedReturn, maxLoss, successProbability, timeHorizon}), constraints (optional {maxRisk, minReturn, timeLimit, budget}), historicalOutcomes (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { decision_context: string }) {
      const context: DecisionContext = JSON.parse(args.decision_context)
      const result = scoreRiskPropensity(context)
      return formatRiskScoreReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'scenario_simulator',
    description: 'Run Monte Carlo simulation with multiple variables and distributions. Returns probability distributions, sensitivity analysis, value at risk (VaR), and success probability. Supports uniform, normal, triangular, and lognormal distributions.',
    parameters: {
      base_case: { type: 'string', required: true, description: 'JSON object with base case variable values: {variableName: value, ...}' },
      variables: { type: 'string', required: true, description: 'JSON array of simulation variables with fields: name, min, max, distribution ("uniform", "normal", "triangular", "lognormal"), mean (optional), stdDev (optional)' },
      iterations: { type: 'string', description: 'Number of simulation iterations (default "1000")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { base_case: string; variables: string; iterations?: string }) {
      const baseCase: Record<string, number> = JSON.parse(args.base_case)
      const variables: SimulationVariable[] = JSON.parse(args.variables)
      const iterations = parseInt(args.iterations ?? '1000')
      const result = simulateScenarios(baseCase, variables, iterations)
      return formatSimulationReport(result)
    }
  }))

  console.log(`[dsh-tool-predict] Loaded v${VERSION} — Predictive Analytics Engine with 8 tools`)
  console.log('  Tools: time_series_forecaster, trend_predictor, anomaly_detector, demand_forecaster, churn_predictor, revenue_projector, risk_propensity_scorer, scenario_simulator')
}
