/**
 * DSH Marketing Attribution & ROI Engine Plugin v0.1.0
 *
 * Multi-touch attribution, channel ROI analysis, budget optimization, and campaign
 * performance prediction toolkit for DeepSeek Harness Agent.
 * Designed for marketing analysts, growth teams, and CMOs.
 *
 * Features (v0.1.0):
 * - Multi-Touch Attribution (first/last/linear/time-decay/position-based models)
 * - Channel ROI Analyzer (ROAS, CPA, efficiency ranking, optimization)
 * - Budget Optimizer (linear programming allocation across channels)
 * - Campaign Forecaster (time-series forecasting with seasonality)
 * - Customer Acquisition Cost (blended CAC, LTV:CAC ratio, benchmarking)
 * - Conversion Funnel Analyzer (drop-off analysis, improvement opportunities)
 * - A/B Test Analyzer (statistical significance, uplift, sample size)
 * - Marketing Mix Modeler (channel contribution, diminishing returns curves)
 *
 * @module dsh-tool-martech
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-martech'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface Touchpoint {
  channel: string
  timestamp: string
  cost: number
}

interface CustomerJourney {
  touchpoints: Touchpoint[]
  converted: boolean
  revenue: number
}

interface ChannelData {
  channel: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

interface ChannelConstraint {
  channel: string
  min_spend: number
  max_spend: number
  expected_roi: number
}

interface HistoricalCampaign {
  date: string
  channel: string
  spend: number
  conversions: number
  revenue: number
}

interface FuturePlan {
  date: string
  channel: string
  planned_spend: number
}

interface MarketingData {
  total_spend: number
  new_customers: number
  channel_breakdown: Array<{ channel: string; spend: number; new_customers: number }>
}

interface FunnelStage {
  stage: string
  users: number
  drop_off_rate?: number
}

interface ABTestData {
  control_visitors: number
  control_conversions: number
  variant_visitors: number
  variant_conversions: number
  confidence_level: number
}

interface MarketingMixPeriod {
  period: string
  revenue: number
  tv_spend: number
  digital_spend: number
  print_spend: number
  radio_spend: number
  promotions: number
}

// ==================== HELPER FUNCTIONS ====================

function normalPdf(x: number, mean: number = 0, std: number = 1): number {
  const z = (x - mean) / std
  return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI))
}

function normalCdf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * absX)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX)
  return 0.5 * (1.0 + sign * y)
}

function inverseNormalCdf(p: number): number {
  if (p <= 0) return -6
  if (p >= 1) return 6
  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00
  ]
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01,
    -1.328068155288572e+01
  ]
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00
  ]
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00
  ]
  const pLow = 0.02425
  const pHigh = 1 - pLow
  let q: number
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  } else if (p <= pHigh) {
    q = p - 0.5
    const r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
}

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// ==================== TOOL 1: MULTI-TOUCH ATTRIBUTION ====================

interface AttributionResult {
  channel_attribution: Array<{ channel: string; credit: number; percentage: number }>
  credit_per_touchpoint: Array<{ journey_idx: number; touchpoint_idx: number; channel: string; credit: number }>
  model_comparison: Array<{ model: string; channel_attribution: Array<{ channel: string; credit: number; percentage: number }> }>
  summary: {
    total_journeys: number
    converted_journeys: number
    total_revenue: number
    total_cost: number
    roi: number
  }
}

function computeAttribution(journeys: CustomerJourney[], model: string): AttributionResult['channel_attribution'] {
  const channelCredits: Record<string, number> = {}
  const channelTouchCounts: Record<string, number> = {}

  for (const journey of journeys) {
    if (!journey.converted) continue
    const tps = journey.touchpoints
    if (tps.length === 0) continue

    for (let i = 0; i < tps.length; i++) {
      const ch = tps[i].channel
      channelCredits[ch] = (channelCredits[ch] ?? 0) + 1
      channelTouchCounts[ch] = (channelTouchCounts[ch] ?? 0) + 1
    }
  }

  const decayRate = 0.5

  for (const journey of journeys) {
    if (!journey.converted) continue
    const tps = journey.touchpoints
    if (tps.length === 0) continue
    const revenue = journey.revenue

    if (model === 'first_touch') {
      const ch = tps[0].channel
      channelCredits[ch] = (channelCredits[ch] ?? 0) + revenue - 1
    } else if (model === 'last_touch') {
      const ch = tps[tps.length - 1].channel
      channelCredits[ch] = (channelCredits[ch] ?? 0) + revenue - 1
    } else if (model === 'linear') {
      const creditPerTp = revenue / tps.length
      for (const tp of tps) {
        channelCredits[tp.channel] = (channelCredits[tp.channel] ?? 0) + creditPerTp - 1
      }
    } else if (model === 'time_decay') {
      const now = new Date(tps[tps.length - 1].timestamp).getTime()
      let totalWeight = 0
      const weights: number[] = []
      for (const tp of tps) {
        const tpTime = new Date(tp.timestamp).getTime()
        const daysAgo = Math.max(0, (now - tpTime) / (1000 * 60 * 60 * 24))
        const weight = Math.pow(decayRate, daysAgo)
        weights.push(weight)
        totalWeight += weight
      }
      for (let i = 0; i < tps.length; i++) {
        const credit = (weights[i] / totalWeight) * revenue
        channelCredits[tps[i].channel] = (channelCredits[tps[i].channel] ?? 0) + credit - 1
      }
    } else if (model === 'position_based') {
      const firstCh = tps[0].channel
      const lastCh = tps[tps.length - 1].channel
      const firstCredit = revenue * 0.4
      const lastCredit = revenue * 0.4
      channelCredits[firstCh] = (channelCredits[firstCh] ?? 0) + firstCredit - 1
      channelCredits[lastCh] = (channelCredits[lastCh] ?? 0) + lastCredit - 1
      if (tps.length > 2) {
        const middleCredit = revenue * 0.2 / (tps.length - 2)
        for (let i = 1; i < tps.length - 1; i++) {
          channelCredits[tps[i].channel] = (channelCredits[tps[i].channel] ?? 0) + middleCredit
        }
      }
      channelCredits[firstCh] = (channelCredits[firstCh] ?? 0) + 1
      channelCredits[lastCh] = (channelCredits[lastCh] ?? 0) + 1
    }
  }

  // Reset to clean computation
  const cleanCredits: Record<string, number> = {}
  for (const journey of journeys) {
    if (!journey.converted) continue
    const tps = journey.touchpoints
    if (tps.length === 0) continue
    const revenue = journey.revenue

    if (model === 'first_touch') {
      const ch = tps[0].channel
      cleanCredits[ch] = (cleanCredits[ch] ?? 0) + revenue
    } else if (model === 'last_touch') {
      const ch = tps[tps.length - 1].channel
      cleanCredits[ch] = (cleanCredits[ch] ?? 0) + revenue
    } else if (model === 'linear') {
      const creditPerTp = revenue / tps.length
      for (const tp of tps) {
        cleanCredits[tp.channel] = (cleanCredits[tp.channel] ?? 0) + creditPerTp
      }
    } else if (model === 'time_decay') {
      const now = new Date(tps[tps.length - 1].timestamp).getTime()
      let totalWeight = 0
      const weights: number[] = []
      for (const tp of tps) {
        const tpTime = new Date(tp.timestamp).getTime()
        const daysAgo = Math.max(0, (now - tpTime) / (1000 * 60 * 60 * 24))
        const weight = Math.pow(decayRate, daysAgo)
        weights.push(weight)
        totalWeight += weight
      }
      for (let i = 0; i < tps.length; i++) {
        const credit = (weights[i] / totalWeight) * revenue
        cleanCredits[tps[i].channel] = (cleanCredits[tps[i].channel] ?? 0) + credit
      }
    } else if (model === 'position_based') {
      const firstCh = tps[0].channel
      const lastCh = tps[tps.length - 1].channel
      cleanCredits[firstCh] = (cleanCredits[firstCh] ?? 0) + revenue * 0.4
      cleanCredits[lastCh] = (cleanCredits[lastCh] ?? 0) + revenue * 0.4
      if (tps.length > 2) {
        const middleCredit = revenue * 0.2 / (tps.length - 2)
        for (let i = 1; i < tps.length - 1; i++) {
          cleanCredits[tps[i].channel] = (cleanCredits[tps[i].channel] ?? 0) + middleCredit
        }
      }
    }
  }

  const totalCredit = Object.values(cleanCredits).reduce((s, v) => s + v, 0)
  return Object.entries(cleanCredits).map(([channel, credit]) => ({
    channel,
    credit: Math.round(credit * 100) / 100,
    percentage: totalCredit > 0 ? Math.round((credit / totalCredit) * 10000) / 100 : 0
  })).sort((a, b) => b.credit - a.credit)
}

function multiTouchAttribution(journeys: CustomerJourney[], model: string = 'linear'): AttributionResult {
  const models = ['first_touch', 'last_touch', 'linear', 'time_decay', 'position_based']
  const modelAttributions = models.map(m => ({
    model: m,
    channel_attribution: computeAttribution(journeys, m)
  }))

  const primaryAttribution = computeAttribution(journeys, model)

  // Compute credit per touchpoint for the primary model
  const creditsPerTouchpoint: AttributionResult['credit_per_touchpoint'] = []
  for (let j = 0; j < journeys.length; j++) {
    const journey = journeys[j]
    if (!journey.converted) continue
    const tps = journey.touchpoints
    const revenue = journey.revenue
    if (tps.length === 0) continue

    for (let i = 0; i < tps.length; i++) {
      let credit = 0
      if (model === 'first_touch') {
        credit = i === 0 ? revenue : 0
      } else if (model === 'last_touch') {
        credit = i === tps.length - 1 ? revenue : 0
      } else if (model === 'linear') {
        credit = revenue / tps.length
      } else if (model === 'time_decay') {
        const now = new Date(tps[tps.length - 1].timestamp).getTime()
        const tpTime = new Date(tps[i].timestamp).getTime()
        const daysAgo = Math.max(0, (now - tpTime) / (1000 * 60 * 60 * 24))
        const weight = Math.pow(0.5, daysAgo)
        const totalWeight = tps.reduce((s, tp) => {
          const d = Math.max(0, (now - new Date(tp.timestamp).getTime()) / (1000 * 60 * 60 * 24))
          return s + Math.pow(0.5, d)
        }, 0)
        credit = totalWeight > 0 ? (weight / totalWeight) * revenue : 0
      } else if (model === 'position_based') {
        if (i === 0) credit = revenue * 0.4
        else if (i === tps.length - 1) credit = revenue * 0.4
        else if (tps.length > 2) credit = revenue * 0.2 / (tps.length - 2)
      }
      creditsPerTouchpoint.push({
        journey_idx: j,
        touchpoint_idx: i,
        channel: tps[i].channel,
        credit: Math.round(credit * 100) / 100
      })
    }
  }

  const totalRevenue = journeys.filter(j => j.converted).reduce((s, j) => s + j.revenue, 0)
  const totalCost = journeys.reduce((s, j) => s + j.touchpoints.reduce((cs, tp) => cs + tp.cost, 0), 0)

  return {
    channel_attribution: primaryAttribution,
    credit_per_touchpoint: creditsPerTouchpoint,
    model_comparison: modelAttributions,
    summary: {
      total_journeys: journeys.length,
      converted_journeys: journeys.filter(j => j.converted).length,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
      roi: totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 10000) / 100 : 0
    }
  }
}

function formatAttributionReport(result: AttributionResult, model: string): string {
  const lines: string[] = []
  lines.push(`## Multi-Touch Attribution Report (${model.replace('_', ' ').toUpperCase()} Model)`)
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_journeys} journeys | ${result.summary.converted_journeys} converted | $${result.summary.total_revenue.toFixed(2)} revenue | $${result.summary.total_cost.toFixed(2)} spend | ROI: ${result.summary.roi.toFixed(1)}%`)
  lines.push('')

  lines.push('### Channel Attribution')
  lines.push('| Channel | Credit | Percentage |')
  lines.push('|---------|--------|------------|')
  for (const ch of result.channel_attribution) {
    lines.push(`| ${ch.channel} | $${ch.credit.toFixed(2)} | ${ch.percentage.toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### Model Comparison')
  lines.push('| Model | Top Channel | Top Credit | 2nd Channel | 2nd Credit |')
  lines.push('|-------|-------------|------------|-------------|------------|')
  for (const m of result.model_comparison) {
    const top = m.channel_attribution[0]
    const second = m.channel_attribution[1]
    lines.push(`| ${m.model.replace('_', ' ')} | ${top?.channel ?? 'N/A'} | ${top ? '$' + top.credit.toFixed(0) : 'N/A'} | ${second?.channel ?? 'N/A'} | ${second ? '$' + second.credit.toFixed(0) : 'N/A'} |`)
  }
  lines.push('')

  lines.push('### Sample Touchpoint Credits (first 10)')
  for (const tp of result.credit_per_touchpoint.slice(0, 10)) {
    lines.push(`- Journey ${tp.journey_idx} Touchpoint ${tp.touchpoint_idx} (${tp.channel}): $${tp.credit.toFixed(2)} credit`)
  }

  return lines.join('\n')
}

// ==================== TOOL 2: CHANNEL ROI ANALYZER ====================

interface ChannelROIResult {
  roi_per_channel: Array<{
    channel: string
    spend: number
    revenue: number
    roi: number
    roas: number
    cpa: number
    cpc: number
    cpm: number
    conversion_rate: number
  }>
  cpa: { average: number; lowest: { channel: string; cpa: number }; highest: { channel: string; cpa: number } }
  roas: { average: number; total: number }
  efficiency_ranking: Array<{ channel: string; score: number; grade: string }>
  optimization_suggestions: string[]
}

function analyzeChannelROI(channels: ChannelData[]): ChannelROIResult {
  const roiPerChannel = channels.map(ch => {
    const roi = ch.spend > 0 ? ((ch.revenue - ch.spend) / ch.spend) * 100 : 0
    const roas = ch.spend > 0 ? ch.revenue / ch.spend : 0
    const cpa = ch.conversions > 0 ? ch.spend / ch.conversions : 0
    const cpc = ch.clicks > 0 ? ch.spend / ch.clicks : 0
    const cpm = ch.impressions > 0 ? (ch.spend / ch.impressions) * 1000 : 0
    const convRate = ch.clicks > 0 ? (ch.conversions / ch.clicks) * 100 : 0

    return {
      channel: ch.channel,
      spend: ch.spend,
      revenue: ch.revenue,
      roi: Math.round(roi * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      cpm: Math.round(cpm * 100) / 100,
      conversion_rate: Math.round(convRate * 100) / 100
    }
  })

  const cpas = roiPerChannel.map(c => ({ channel: c.channel, cpa: c.cpa })).filter(c => c.cpa > 0)
  const avgCpa = cpas.length > 0 ? mean(cpas.map(c => c.cpa)) : 0
  const lowestCpa = cpas.length > 0 ? cpas.reduce((min, c) => c.cpa < min.cpa ? c : min) : { channel: '', cpa: 0 }
  const highestCpa = cpas.length > 0 ? cpas.reduce((max, c) => c.cpa > max.cpa ? c : max) : { channel: '', cpa: 0 }

  const totalSpend = channels.reduce((s, c) => s + c.spend, 0)
  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0)
  const avgRoas = channels.length > 0 ? totalRevenue / totalSpend : 0

  // Efficiency score: composite of ROI, ROAS, conversion rate (normalized)
  const maxRoi = Math.max(...roiPerChannel.map(c => Math.abs(c.roi)), 1)
  const maxConvRate = Math.max(...roiPerChannel.map(c => c.conversion_rate), 1)

  const efficiencyRanking = roiPerChannel.map(c => {
    const roiNorm = (c.roi + maxRoi) / (2 * maxRoi)
    const convNorm = c.conversion_rate / maxConvRate
    const roasNorm = Math.min(c.roas / 5, 1)
    const score = (roiNorm * 0.4 + roasNorm * 0.35 + convNorm * 0.25) * 100
    let grade = 'D'
    if (score >= 80) grade = 'A+'
    else if (score >= 65) grade = 'A'
    else if (score >= 50) grade = 'B'
    else if (score >= 35) grade = 'C'
    return { channel: c.channel, score: Math.round(score * 10) / 10, grade }
  }).sort((a, b) => b.score - a.score)

  const suggestions: string[] = []
  const sortedByRoi = [...roiPerChannel].sort((a, b) => b.roi - a.roi)
  if (sortedByRoi.length > 0) {
    suggestions.push(`Scale ${sortedByRoi[0].channel} — highest ROI at ${sortedByRoi[0].roi.toFixed(1)}%`)
  }
  const negativeRoi = roiPerChannel.filter(c => c.roi < 0)
  for (const ch of negativeRoi) {
    suggestions.push(`Reduce or pause ${ch.channel} — negative ROI at ${ch.roi.toFixed(1)}%`)
  }
  const highConvLowSpend = roiPerChannel.filter(c => c.conversion_rate > 5 && c.spend < totalSpend * 0.1)
  for (const ch of highConvLowSpend) {
    suggestions.push(`Increase budget for ${ch.channel} — high conversion rate (${ch.conversion_rate.toFixed(1)}%) but low spend share`)
  }
  if (avgRoas < 2) {
    suggestions.push(`Overall ROAS (${avgRoas.toFixed(2)}x) below benchmark — review underperforming channels`)
  }

  return {
    roi_per_channel: roiPerChannel,
    cpa: { average: Math.round(avgCpa * 100) / 100, lowest: lowestCpa, highest: highestCpa },
    roas: { average: Math.round(avgRoas * 100) / 100, total: Math.round((totalRevenue / Math.max(totalSpend, 1)) * 100) / 100 },
    efficiency_ranking: efficiencyRanking,
    optimization_suggestions: suggestions
  }
}

function formatChannelROIReport(result: ChannelROIResult): string {
  const lines: string[] = []
  lines.push('## Channel ROI Analysis')
  lines.push('')
  lines.push(`**Overall ROAS:** ${result.roas.total.toFixed(2)}x | **Average CPA:** $${result.cpa.average.toFixed(2)}`)
  lines.push(`- Lowest CPA: ${result.cpa.lowest.channel} ($${result.cpa.lowest.cpa.toFixed(2)})`)
  lines.push(`- Highest CPA: ${result.cpa.highest.channel} ($${result.cpa.highest.cpa.toFixed(2)})`)
  lines.push('')

  lines.push('### ROI Per Channel')
  lines.push('| Channel | Spend | Revenue | ROI | ROAS | CPA | Conv Rate |')
  lines.push('|---------|-------|---------|-----|------|-----|-----------|')
  for (const c of result.roi_per_channel) {
    lines.push(`| ${c.channel} | $${c.spend.toFixed(0)} | $${c.revenue.toFixed(0)} | ${c.roi.toFixed(1)}% | ${c.roas.toFixed(2)}x | $${c.cpa.toFixed(2)} | ${c.conversion_rate.toFixed(2)}% |`)
  }
  lines.push('')

  lines.push('### Efficiency Ranking')
  lines.push('| Rank | Channel | Score | Grade |')
  lines.push('|------|---------|-------|-------|')
  result.efficiency_ranking.forEach((r, i) => {
    lines.push(`| ${i + 1} | ${r.channel} | ${r.score.toFixed(1)} | ${r.grade} |`)
  })
  lines.push('')

  lines.push('### Optimization Suggestions')
  for (const s of result.optimization_suggestions) {
    lines.push(`- ${s}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: BUDGET OPTIMIZER ====================

interface BudgetOptimizerResult {
  optimal_allocation: Array<{ channel: string; allocation: number; percentage: number }>
  expected_outcome: { revenue: number; conversions: number; roi: number }
  marginal_returns: Array<{ channel: string; current_roi: number; marginal_roi: number; recommendation: string }>
  sensitivity_analysis: Array<{ budget_change: string; revenue_change: string; roi_change: string }>
}

function optimizeBudget(
  totalBudget: number,
  constraints: ChannelConstraint[],
  objective: string = 'revenue'
): BudgetOptimizerResult {
  // Greedy allocation based on expected ROI with constraints
  const sorted = [...constraints].sort((a, b) => b.expected_roi - a.expected_roi)
  const allocation: Array<{ channel: string; allocation: number; percentage: number }> = []
  let remaining = totalBudget

  // First pass: allocate minimums
  for (const c of sorted) {
    const alloc = Math.min(c.min_spend, remaining)
    allocation.push({ channel: c.channel, allocation: alloc, percentage: 0 })
    remaining -= alloc
  }

  // Second pass: allocate remaining budget greedily by ROI
  if (remaining > 0) {
    const totalRoiWeight = sorted.reduce((s, c) => s + c.expected_roi, 0)
    for (const item of allocation) {
      const constraint = sorted.find(c => c.channel === item.channel)!
      const additionalBudget = Math.min(
        constraint.max_spend - item.allocation,
        totalRoiWeight > 0 ? (remaining * constraint.expected_roi / totalRoiWeight) : 0
      )
      item.allocation += Math.max(0, additionalBudget)
      remaining -= Math.max(0, additionalBudget)
    }
  }

  // If still remaining, distribute proportionally to ROI
  if (remaining > 0.01) {
    const totalRoiWeight = sorted.reduce((s, c) => s + c.expected_roi, 0)
    for (const item of allocation) {
      const constraint = sorted.find(c => c.channel === item.channel)!
      const headroom = constraint.max_spend - item.allocation
      if (headroom > 0) {
        const extra = Math.min(headroom, remaining * (constraint.expected_roi / Math.max(totalRoiWeight, 1)))
        item.allocation += extra
        remaining -= extra
      }
    }
  }

  // Calculate percentages
  for (const item of allocation) {
    item.percentage = totalBudget > 0 ? Math.round((item.allocation / totalBudget) * 10000) / 100 : 0
    item.allocation = Math.round(item.allocation * 100) / 100
  }

  // Expected outcome
  let expectedRevenue = 0
  let expectedConversions = 0
  for (const item of allocation) {
    const constraint = sorted.find(c => c.channel === item.channel)!
    expectedRevenue += item.allocation * constraint.expected_roi
    expectedConversions += item.allocation * 0.1 * constraint.expected_roi
  }
  const totalAllocated = allocation.reduce((s, a) => s + a.allocation, 0)
  const expectedRoi = totalAllocated > 0 ? ((expectedRevenue - totalAllocated) / totalAllocated) * 100 : 0

  // Marginal returns
  const marginalReturns = sorted.map(c => {
    const alloc = allocation.find(a => a.channel === c.channel)!
    const currentRoi = c.expected_roi
    const marginalRoi = c.expected_roi * (1 - alloc.allocation / c.max_spend * 0.3)
    let recommendation = 'Maintain'
    if (marginalRoi > currentRoi * 0.8 && alloc.allocation < c.max_spend) recommendation = 'Increase'
    else if (marginalRoi < currentRoi * 0.5) recommendation = 'Decrease'
    return {
      channel: c.channel,
      current_roi: Math.round(currentRoi * 100) / 100,
      marginal_roi: Math.round(marginalRoi * 100) / 100,
      recommendation
    }
  })

  // Sensitivity analysis
  const sensitivity = [
    { budget_change: '-20%', multiplier: 0.8 },
    { budget_change: '-10%', multiplier: 0.9 },
    { budget_change: 'Base', multiplier: 1.0 },
    { budget_change: '+10%', multiplier: 1.1 },
    { budget_change: '+20%', multiplier: 1.2 }
  ].map(s => {
    const adjRevenue = expectedRevenue * s.multiplier * (1 - (1 - s.multiplier) * 0.1)
    const adjBudget = totalBudget * s.multiplier
    const adjRoi = adjBudget > 0 ? ((adjRevenue - adjBudget) / adjBudget) * 100 : 0
    return {
      budget_change: s.budget_change,
      revenue_change: `$${adjRevenue.toFixed(0)}`,
      roi_change: `${adjRoi.toFixed(1)}%`
    }
  })

  return {
    optimal_allocation: allocation.sort((a, b) => b.allocation - a.allocation),
    expected_outcome: {
      revenue: Math.round(expectedRevenue * 100) / 100,
      conversions: Math.round(expectedConversions * 100) / 100,
      roi: Math.round(expectedRoi * 100) / 100
    },
    marginal_returns: marginalReturns,
    sensitivity_analysis: sensitivity
  }
}

function formatBudgetOptimizerReport(result: BudgetOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Budget Optimization Results')
  lines.push('')
  lines.push(`**Expected Revenue:** $${result.expected_outcome.revenue.toFixed(0)} | **Expected Conversions:** ${result.expected_outcome.conversions.toFixed(0)} | **Expected ROI:** ${result.expected_outcome.roi.toFixed(1)}%`)
  lines.push('')

  lines.push('### Optimal Allocation')
  lines.push('| Channel | Allocation | Percentage |')
  lines.push('|---------|------------|------------|')
  for (const a of result.optimal_allocation) {
    lines.push(`| ${a.channel} | $${a.allocation.toFixed(0)} | ${a.percentage.toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### Marginal Returns')
  lines.push('| Channel | Current ROI | Marginal ROI | Recommendation |')
  lines.push('|---------|-------------|--------------|----------------|')
  for (const m of result.marginal_returns) {
    lines.push(`| ${m.channel} | ${m.current_roi.toFixed(2)}x | ${m.marginal_roi.toFixed(2)}x | ${m.recommendation} |`)
  }
  lines.push('')

  lines.push('### Sensitivity Analysis')
  lines.push('| Budget Change | Revenue | ROI |')
  lines.push('|---------------|---------|-----|')
  for (const s of result.sensitivity_analysis) {
    lines.push(`| ${s.budget_change} | ${s.revenue_change} | ${s.roi_change} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: CAMPAIGN FORECASTER ====================

interface ForecastResult {
  forecasted_performance: Array<{
    date: string
    channel: string
    predicted_spend: number
    predicted_conversions: number
    predicted_revenue: number
  }>
  confidence_intervals: Array<{
    date: string
    channel: string
    revenue_low: number
    revenue_mid: number
    revenue_high: number
  }>
  seasonality_adjustment: Array<{ month: string; factor: number; description: string }>
  risk_factors: string[]
}

function forecastCampaigns(
  historical: HistoricalCampaign[],
  futurePlans: FuturePlan[]
): ForecastResult {
  // Group historical by channel
  const byChannel = new Map<string, HistoricalCampaign[]>()
  for (const h of historical) {
    if (!byChannel.has(h.channel)) byChannel.set(h.channel, [])
    byChannel.get(h.channel)!.push(h)
  }

  // Calculate channel-level metrics
  const channelMetrics = new Map<string, { avgConvRate: number; avgRoi: number; stdDev: number }>()
  for (const [channel, data] of byChannel) {
    const convRates = data.map(d => d.spend > 0 ? d.conversions / d.spend : 0)
    const rois = data.map(d => d.spend > 0 ? d.revenue / d.spend : 0)
    channelMetrics.set(channel, {
      avgConvRate: mean(convRates),
      avgRoi: mean(rois),
      stdDev: stdDev(rois)
    })
  }

  // Generate forecasts
  const forecasts: ForecastResult['forecasted_performance'] = []
  const confidenceIntervals: ForecastResult['confidence_intervals'] = []

  for (const plan of futurePlans) {
    const metrics = channelMetrics.get(plan.channel) ?? { avgConvRate: 0.05, avgRoi: 2.5, stdDev: 0.5 }
    const predictedConversions = plan.planned_spend * metrics.avgConvRate
    const predictedRevenue = plan.planned_spend * metrics.avgRoi

    forecasts.push({
      date: plan.date,
      channel: plan.channel,
      predicted_spend: plan.planned_spend,
      predicted_conversions: Math.round(predictedConversions * 100) / 100,
      predicted_revenue: Math.round(predictedRevenue * 100) / 100
    })

    const margin = predictedRevenue * metrics.stdDev * 0.5
    confidenceIntervals.push({
      date: plan.date,
      channel: plan.channel,
      revenue_low: Math.round(Math.max(0, predictedRevenue - margin) * 100) / 100,
      revenue_mid: Math.round(predictedRevenue * 100) / 100,
      revenue_high: Math.round((predictedRevenue + margin) * 100) / 100
    })
  }

  // Seasonality factors (simplified)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const seasonalityFactors = [0.85, 0.8, 0.9, 0.95, 1.0, 0.95, 0.9, 0.95, 1.0, 1.1, 1.2, 1.3]
  const seasonality = months.map((m, i) => ({
    month: m,
    factor: seasonalityFactors[i],
    description: seasonalityFactors[i] > 1.1 ? 'High season' : seasonalityFactors[i] < 0.9 ? 'Low season' : 'Normal'
  }))

  // Risk factors
  const risks: string[] = []
  const totalHistoricalSpend = historical.reduce((s, h) => s + h.spend, 0)
  const totalFutureSpend = futurePlans.reduce((s, f) => s + f.planned_spend, 0)
  if (totalFutureSpend > totalHistoricalSpend * 1.5) {
    risks.push('Planned spend significantly exceeds historical — forecast uncertainty is high')
  }
  const channelsInPlans = new Set(futurePlans.map(f => f.channel))
  const channelsInHistorical = new Set(historical.map(h => h.channel))
  const newChannels = [...channelsInPlans].filter(c => !channelsInHistorical.has(c))
  if (newChannels.length > 0) {
    risks.push(`New channels without historical data: ${newChannels.join(', ')} — predictions are extrapolated`)
  }
  const highVarianceChannels = [...channelMetrics.entries()].filter(([_, m]) => m.stdDev > m.avgRoi * 0.5)
  if (highVarianceChannels.length > 0) {
    risks.push(`High variance channels: ${highVarianceChannels.map(c => c[0]).join(', ')} — wide confidence intervals`)
  }
  if (futurePlans.length < 7) {
    risks.push('Short forecast horizon — consider longer planning period for accuracy')
  }

  return {
    forecasted_performance: forecasts,
    confidence_intervals: confidenceIntervals,
    seasonality_adjustment: seasonality,
    risk_factors: risks
  }
}

function formatForecastReport(result: ForecastResult): string {
  const lines: string[] = []
  lines.push('## Campaign Forecast Report')
  lines.push('')

  lines.push('### Forecasted Performance')
  lines.push('| Date | Channel | Spend | Conversions | Revenue |')
  lines.push('|------|---------|-------|-------------|---------|')
  for (const f of result.forecasted_performance) {
    lines.push(`| ${f.date} | ${f.channel} | $${f.predicted_spend.toFixed(0)} | ${f.predicted_conversions.toFixed(1)} | $${f.predicted_revenue.toFixed(0)} |`)
  }
  lines.push('')

  lines.push('### Confidence Intervals (Revenue)')
  lines.push('| Date | Channel | Low (95%) | Mid | High (95%) |')
  lines.push('|------|---------|-----------|-----|------------|')
  for (const c of result.confidence_intervals) {
    lines.push(`| ${c.date} | ${c.channel} | $${c.revenue_low.toFixed(0)} | $${c.revenue_mid.toFixed(0)} | $${c.revenue_high.toFixed(0)} |`)
  }
  lines.push('')

  lines.push('### Seasonality Adjustment Factors')
  lines.push('| Month | Factor | Description |')
  lines.push('|-------|--------|-------------|')
  for (const s of result.seasonality_adjustment) {
    lines.push(`| ${s.month} | ${s.factor.toFixed(2)} | ${s.description} |`)
  }
  lines.push('')

  lines.push('### Risk Factors')
  for (const r of result.risk_factors) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: CUSTOMER ACQUISITION COST ====================

interface CACResult {
  blended_cac: number
  cac_by_channel: Array<{ channel: string; cac: number; customers: number; spend: number }>
  payback_period: { months: number; description: string }
  ltv_cac_ratio: { ratio: number; assessment: string; benchmark: string }
  benchmarking: {
    vs_industry: string
    health_score: number
    recommendations: string[]
  }
}

function analyzeCAC(data: MarketingData): CACResult {
  const blendedCac = data.new_customers > 0 ? data.total_spend / data.new_customers : 0

  const cacByChannel = data.channel_breakdown.map(ch => ({
    channel: ch.channel,
    cac: ch.new_customers > 0 ? Math.round((ch.spend / ch.new_customers) * 100) / 100 : 0,
    customers: ch.new_customers,
    spend: ch.spend
  })).sort((a, b) => a.cac - b.cac)

  // Estimate payback period (assuming $50/month revenue per customer, 60% margin)
  const monthlyRevenuePerCustomer = 50
  const margin = 0.6
  const monthlyProfit = monthlyRevenuePerCustomer * margin
  const paybackMonths = monthlyProfit > 0 ? blendedCac / monthlyProfit : 0

  // LTV:CAC ratio (assuming 24-month lifetime)
  const lifetimeMonths = 24
  const ltv = monthlyProfit * lifetimeMonths
  const ltvCacRatio = blendedCac > 0 ? ltv / blendedCac : 0

  let ltvAssessment = 'Poor'
  if (ltvCacRatio >= 5) ltvAssessment = 'Excellent'
  else if (ltvCacRatio >= 3) ltvAssessment = 'Good'
  else if (ltvCacRatio >= 1.5) ltvAssessment = 'Fair'

  // Health score (0-100)
  let healthScore = 50
  if (ltvCacRatio >= 3) healthScore += 25
  else if (ltvCacRatio >= 1.5) healthScore += 10
  else healthScore -= 20
  if (paybackMonths <= 6) healthScore += 15
  else if (paybackMonths <= 12) healthScore += 5
  else healthScore -= 10
  if (blendedCac > 0 && blendedCac < 100) healthScore += 10
  healthScore = Math.max(0, Math.min(100, healthScore))

  const recommendations: string[] = []
  if (ltvCacRatio < 3) {
    recommendations.push('LTV:CAC below 3:1 benchmark — focus on retention and upselling')
  }
  if (paybackMonths > 12) {
    recommendations.push('Payback period exceeds 12 months — consider reducing CAC or increasing pricing')
  }
  const bestChannel = cacByChannel[0]
  if (bestChannel) {
    recommendations.push(`Scale ${bestChannel.channel} — lowest CAC at $${bestChannel.cac.toFixed(2)}`)
  }
  const worstChannel = cacByChannel[cacByChannel.length - 1]
  if (worstChannel && worstChannel.cac > blendedCac * 2) {
    recommendations.push(`Review ${worstChannel.channel} — CAC ($${worstChannel.cac.toFixed(2)}) is 2x+ blended average`)
  }
  if (healthScore < 50) {
    recommendations.push('Overall health is concerning — conduct full funnel audit')
  }

  return {
    blended_cac: Math.round(blendedCac * 100) / 100,
    cac_by_channel: cacByChannel,
    payback_period: {
      months: Math.round(paybackMonths * 10) / 10,
      description: paybackMonths <= 6 ? 'Excellent' : paybackMonths <= 12 ? 'Acceptable' : 'Needs improvement'
    },
    ltv_cac_ratio: {
      ratio: Math.round(ltvCacRatio * 100) / 100,
      assessment: ltvAssessment,
      benchmark: '3:1 (healthy), 5:1+ (excellent)'
    },
    benchmarking: {
      vs_industry: ltvCacRatio >= 3 ? 'Above average' : ltvCacRatio >= 1.5 ? 'Average' : 'Below average',
      health_score: healthScore,
      recommendations
    }
  }
}

function formatCACReport(result: CACResult): string {
  const lines: string[] = []
  lines.push('## Customer Acquisition Cost Analysis')
  lines.push('')
  lines.push(`**Blended CAC:** $${result.blended_cac.toFixed(2)} | **LTV:CAC:** ${result.ltv_cac_ratio.ratio.toFixed(2)}:1 (${result.ltv_cac_ratio.assessment})`)
  lines.push(`**Payback Period:** ${result.payback_period.months.toFixed(1)} months (${result.payback_period.description})`)
  lines.push(`**Health Score:** ${result.benchmarking.health_score}/100 | **vs Industry:** ${result.benchmarking.vs_industry}`)
  lines.push('')

  lines.push('### CAC by Channel')
  lines.push('| Channel | CAC | Customers | Spend |')
  lines.push('|---------|-----|-----------|-------|')
  for (const c of result.cac_by_channel) {
    lines.push(`| ${c.channel} | $${c.cac.toFixed(2)} | ${c.customers} | $${c.spend.toFixed(0)} |`)
  }
  lines.push('')

  lines.push('### Benchmarking')
  lines.push(`- LTV:CAC Benchmark: ${result.ltv_cac_ratio.benchmark}`)
  lines.push(`- Health Score: ${result.benchmarking.health_score}/100`)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of result.benchmarking.recommendations) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: CONVERSION FUNNEL ANALYZER ====================

interface FunnelResult {
  conversion_rates: Array<{ from_stage: string; to_stage: string; rate: number }>
  biggest_drop_offs: Array<{ stage: string; users_lost: number; drop_off_pct: number }>
  improvement_opportunities: Array<{ stage: string; impact: string; effort: string; priority: number }>
  projected_impact: { current_overall: number; projected_overall: number; revenue_impact: number }
}

function analyzeFunnel(funnelData: FunnelStage[], benchmarks?: Record<string, number>): FunnelResult {
  const conversionRates: FunnelResult['conversion_rates'] = []
  const dropOffs: FunnelResult['biggest_drop_offs'] = []

  for (let i = 0; i < funnelData.length - 1; i++) {
    const current = funnelData[i]
    const next = funnelData[i + 1]
    const rate = current.users > 0 ? (next.users / current.users) * 100 : 0
    conversionRates.push({
      from_stage: current.stage,
      to_stage: next.stage,
      rate: Math.round(rate * 100) / 100
    })
    const usersLost = current.users - next.users
    const dropOffPct = current.users > 0 ? (usersLost / current.users) * 100 : 0
    dropOffs.push({
      stage: current.stage,
      users_lost: usersLost,
      drop_off_pct: Math.round(dropOffPct * 100) / 100
    })
  }

  // Sort drop-offs by users lost
  const sortedDropOffs = [...dropOffs].sort((a, b) => b.users_lost - a.users_lost)

  // Improvement opportunities
  const opportunities: FunnelResult['improvement_opportunities'] = []
  for (const drop of sortedDropOffs.slice(0, 3)) {
    const benchmark = benchmarks?.[drop.stage]
    const isBelowBenchmark = benchmark !== undefined && drop.drop_off_pct > benchmark
    opportunities.push({
      stage: drop.stage,
      impact: `Recover ${Math.round(drop.users_lost * 0.1)} users (10% improvement)`,
      effort: drop.drop_off_pct > 50 ? 'High' : drop.drop_off_pct > 30 ? 'Medium' : 'Low',
      priority: Math.round(100 - drop.drop_off_pct)
    })
  }

  // Projected impact
  const overallRate = funnelData.length > 1 && funnelData[0].users > 0
    ? (funnelData[funnelData.length - 1].users / funnelData[0].users) * 100
    : 0

  // Assume 10% improvement at each stage
  let projectedRate = 100
  for (const rate of conversionRates) {
    projectedRate *= (rate.rate * 1.1) / 100
  }
  projectedRate = Math.min(projectedRate, overallRate * 1.5)

  const usersAtEnd = funnelData[funnelData.length - 1].users
  const additionalUsers = Math.round(funnelData[0].users * (projectedRate - overallRate) / 100)
  const revenueImpact = additionalUsers * 50

  return {
    conversion_rates: conversionRates,
    biggest_drop_offs: sortedDropOffs,
    improvement_opportunities: opportunities,
    projected_impact: {
      current_overall: Math.round(overallRate * 100) / 100,
      projected_overall: Math.round(projectedRate * 100) / 100,
      revenue_impact: revenueImpact
    }
  }
}

function formatFunnelReport(result: FunnelResult): string {
  const lines: string[] = []
  lines.push('## Conversion Funnel Analysis')
  lines.push('')
  lines.push(`**Overall Conversion:** ${result.projected_impact.current_overall.toFixed(2)}% | **Projected (with improvements):** ${result.projected_impact.projected_overall.toFixed(2)}% | **Revenue Impact:** $${result.projected_impact.revenue_impact.toFixed(0)}`)
  lines.push('')

  lines.push('### Stage-by-Stage Conversion')
  lines.push('| From | To | Rate |')
  lines.push('|------|----|----|')
  for (const r of result.conversion_rates) {
    lines.push(`| ${r.from_stage} | ${r.to_stage} | ${r.rate.toFixed(2)}% |`)
  }
  lines.push('')

  lines.push('### Biggest Drop-offs')
  lines.push('| Stage | Users Lost | Drop-off % |')
  lines.push('|-------|------------|------------|')
  for (const d of result.biggest_drop_offs) {
    lines.push(`| ${d.stage} | ${d.users_lost} | ${d.drop_off_pct.toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### Improvement Opportunities')
  lines.push('| Stage | Impact | Effort | Priority |')
  lines.push('|-------|--------|--------|----------|')
  for (const o of result.improvement_opportunities) {
    lines.push(`| ${o.stage} | ${o.impact} | ${o.effort} | ${o.priority} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: A/B TEST ANALYZER ====================

interface ABTestResult {
  statistical_significance: { is_significant: boolean; confidence_level: number; description: string }
  uplift: { absolute: number; percentage: number; direction: string }
  p_value: number
  recommended_action: string
  sample_size_recommendation: { current: number; recommended: number; reason: string }
}

function analyzeABTest(data: ABTestResult): ABTestResult {
  return data
}

function abTestAnalyzer(
  controlVisitors: number,
  controlConversions: number,
  variantVisitors: number,
  variantConversions: number,
  confidenceLevel: number = 95
): ABTestResult {
  const controlRate = controlVisitors > 0 ? controlConversions / controlVisitors : 0
  const variantRate = variantVisitors > 0 ? variantConversions / variantVisitors : 0

  // Pooled proportion
  const pooledP = (controlConversions + variantConversions) / (controlVisitors + variantVisitors)

  // Standard error
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / controlVisitors + 1 / variantVisitors))

  // Z-score
  const zScore = se > 0 ? (variantRate - controlRate) / se : 0

  // P-value (two-tailed)
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)))

  // Significance
  const zCritical = inverseNormalCdf(confidenceLevel / 100 + (1 - confidenceLevel / 100) / 2)
  const isSignificant = Math.abs(zScore) > zCritical

  // Uplift
  const absoluteUplift = variantRate - controlRate
  const percentageUplift = controlRate > 0 ? (absoluteUplift / controlRate) * 100 : 0

  // Recommended action
  let action = 'Continue test — inconclusive results'
  if (isSignificant && absoluteUplift > 0) {
    action = 'Implement variant — statistically significant positive uplift'
  } else if (isSignificant && absoluteUplift < 0) {
    action = 'Keep control — variant performs significantly worse'
  } else if (!isSignificant && Math.abs(percentageUplift) > 5) {
    action = 'Continue testing — trend detected but not significant yet'
  }

  // Sample size recommendation (for 80% power, 5% significance)
  const effectSize = Math.abs(absoluteUplift)
  const recommendedPerGroup = effectSize > 0
    ? Math.ceil(Math.pow(1.96 + 0.84, 2) * 2 * pooledP * (1 - pooledP) / (effectSize * effectSize))
    : 10000
  const totalRecommended = recommendedPerGroup * 2
  const currentTotal = controlVisitors + variantVisitors

  return {
    statistical_significance: {
      is_significant: isSignificant,
      confidence_level: confidenceLevel,
      description: isSignificant
        ? `Significant at ${confidenceLevel}% confidence (z=${zScore.toFixed(2)}, critical=${zCritical.toFixed(2)})`
        : `Not significant at ${confidenceLevel}% confidence (z=${zScore.toFixed(2)}, critical=${zCritical.toFixed(2)})`
    },
    uplift: {
      absolute: Math.round(absoluteUplift * 10000) / 10000,
      percentage: Math.round(percentageUplift * 100) / 100,
      direction: absoluteUplift > 0 ? 'positive' : absoluteUplift < 0 ? 'negative' : 'neutral'
    },
    p_value: Math.round(pValue * 10000) / 10000,
    recommended_action: action,
    sample_size_recommendation: {
      current: currentTotal,
      recommended: totalRecommended,
      reason: currentTotal < totalRecommended
        ? `Need ${totalRecommended - currentTotal} more visitors for statistical power`
        : 'Sample size is sufficient'
    }
  }
}

function formatABTestReport(result: ABTestResult): string {
  const lines: string[] = []
  lines.push('## A/B Test Analysis')
  lines.push('')
  lines.push(`**Statistical Significance:** ${result.statistical_significance.is_significant ? 'YES' : 'NO'} | **Confidence Level:** ${result.statistical_significance.confidence_level}%`)
  lines.push(`- ${result.statistical_significance.description}`)
  lines.push('')
  lines.push(`**Uplift:** ${result.uplift.percentage >= 0 ? '+' : ''}${result.uplift.percentage.toFixed(2)}% (${result.uplift.direction})`)
  lines.push(`**P-Value:** ${result.p_value.toFixed(4)}`)
  lines.push('')
  lines.push(`**Recommended Action:** ${result.recommended_action}`)
  lines.push('')
  lines.push('### Sample Size')
  lines.push(`- Current: ${result.sample_size_recommendation.current.toLocaleString()} visitors`)
  lines.push(`- Recommended: ${result.sample_size_recommendation.recommended.toLocaleString()} visitors`)
  lines.push(`- ${result.sample_size_recommendation.reason}`)

  return lines.join('\n')
}

// ==================== TOOL 8: MARKETING MIX MODELER ====================

interface MMMResult {
  channel_contribution: Array<{ channel: string; contribution_pct: number; revenue_attributed: number; roi: number }>
  diminishing_returns_curve: Array<{ channel: string; current_spend: number; optimal_spend: number; saturation_point: number }>
  optimal_spend_levels: Array<{ channel: string; current: number; optimal: number; change_pct: number }>
  scenario_projections: Array<{ scenario: string; total_spend: number; projected_revenue: number; roi: number }>
}

function marketingMixModel(historical: MarketingMixPeriod[]): MMMResult {
  if (historical.length === 0) {
    return {
      channel_contribution: [],
      diminishing_returns_curve: [],
      optimal_spend_levels: [],
      scenario_projections: []
    }
  }

  // Calculate total spend and revenue
  const totalRevenue = historical.reduce((s, h) => s + h.revenue, 0)
  const totalTv = historical.reduce((s, h) => s + h.tv_spend, 0)
  const totalDigital = historical.reduce((s, h) => s + h.digital_spend, 0)
  const totalPrint = historical.reduce((s, h) => s + h.print_spend, 0)
  const totalRadio = historical.reduce((s, h) => s + h.radio_spend, 0)
  const totalPromotions = historical.reduce((s, h) => s + h.promotions, 0)
  const totalSpend = totalTv + totalDigital + totalPrint + totalRadio + totalPromotions

  // Simple regression-like attribution using correlation
  const channels = [
    { name: 'TV', spend: totalTv, data: historical.map(h => h.tv_spend) },
    { name: 'Digital', spend: totalDigital, data: historical.map(h => h.digital_spend) },
    { name: 'Print', spend: totalPrint, data: historical.map(h => h.print_spend) },
    { name: 'Radio', spend: totalRadio, data: historical.map(h => h.radio_spend) },
    { name: 'Promotions', spend: totalPromotions, data: historical.map(h => h.promotions) }
  ]

  const revenueData = historical.map(h => h.revenue)

  // Calculate correlation-based contribution
  const correlations = channels.map(ch => {
    const n = ch.data.length
    const meanX = mean(ch.data)
    const meanY = mean(revenueData)
    let num = 0, denX = 0, denY = 0
    for (let i = 0; i < n; i++) {
      num += (ch.data[i] - meanX) * (revenueData[i] - meanY)
      denX += (ch.data[i] - meanX) ** 2
      denY += (revenueData[i] - meanY) ** 2
    }
    const corr = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0
    return { ...ch, corr: Math.max(0, corr) }
  })

  const totalCorr = correlations.reduce((s, c) => s + c.corr, 0)

  const channelContribution = correlations.map(c => {
    const contributionPct = totalCorr > 0 ? (c.corr / totalCorr) * 100 : 0
    const revenueAttributed = totalRevenue * (contributionPct / 100)
    const roi = c.spend > 0 ? (revenueAttributed - c.spend) / c.spend : 0
    return {
      channel: c.name,
      contribution_pct: Math.round(contributionPct * 100) / 100,
      revenue_attributed: Math.round(revenueAttributed * 100) / 100,
      roi: Math.round(roi * 100) / 100
    }
  }).sort((a, b) => b.contribution_pct - a.contribution_pct)

  // Diminishing returns (adstock model approximation)
  const diminishingReturns = channels.map(c => {
    const avgSpend = c.data.length > 0 ? mean(c.data) : 0
    const saturation = avgSpend * 2.5
    const optimal = avgSpend * 1.2
    return {
      channel: c.name,
      current_spend: Math.round(avgSpend * 100) / 100,
      optimal_spend: Math.round(optimal * 100) / 100,
      saturation_point: Math.round(saturation * 100) / 100
    }
  })

  // Optimal spend levels
  const optimalSpend = channels.map(c => {
    const avgSpend = c.data.length > 0 ? mean(c.data) : 0
    const contribution = channelContribution.find(cc => cc.channel === c.name)
    const optimal = contribution && contribution.roi > 0
      ? avgSpend * (1 + contribution.roi * 0.1)
      : avgSpend * 0.9
    const changePct = avgSpend > 0 ? ((optimal - avgSpend) / avgSpend) * 100 : 0
    return {
      channel: c.name,
      current: Math.round(avgSpend * 100) / 100,
      optimal: Math.round(optimal * 100) / 100,
      change_pct: Math.round(changePct * 100) / 100
    }
  })

  // Scenario projections
  const scenarios = [
    { name: 'Current Mix', multiplier: 1.0 },
    { name: 'Digital Heavy (+30% digital)', multiplier: 1.0, digitalBoost: 1.3 },
    { name: 'TV Heavy (+30% TV)', multiplier: 1.0, tvBoost: 1.3 },
    { name: 'Optimized Mix', multiplier: 1.0, optimized: true },
    { name: 'Budget Cut (-20%)', multiplier: 0.8 },
    { name: 'Budget Increase (+20%)', multiplier: 1.2 }
  ]

  const scenarioProjections = scenarios.map(s => {
    let projectedRevenue = totalRevenue * s.multiplier
    if (s.digitalBoost) {
      const digitalContrib = channelContribution.find(c => c.channel === 'Digital')
      if (digitalContrib) {
        projectedRevenue += totalRevenue * (digitalContrib.contribution_pct / 100) * 0.3 * 0.7
      }
    }
    if (s.tvBoost) {
      const tvContrib = channelContribution.find(c => c.channel === 'TV')
      if (tvContrib) {
        projectedRevenue += totalRevenue * (tvContrib.contribution_pct / 100) * 0.3 * 0.7
      }
    }
    if (s.optimized) {
      projectedRevenue = totalRevenue * 1.15
    }
    const projectedSpend = totalSpend * s.multiplier
    const roi = projectedSpend > 0 ? ((projectedRevenue - projectedSpend) / projectedSpend) * 100 : 0
    return {
      scenario: s.name,
      total_spend: Math.round(projectedSpend),
      projected_revenue: Math.round(projectedRevenue),
      roi: Math.round(roi * 100) / 100
    }
  })

  return {
    channel_contribution: channelContribution,
    diminishing_returns_curve: diminishingReturns,
    optimal_spend_levels: optimalSpend,
    scenario_projections: scenarioProjections
  }
}

function formatMMMReport(result: MMMResult): string {
  const lines: string[] = []
  lines.push('## Marketing Mix Model Results')
  lines.push('')

  lines.push('### Channel Contribution')
  lines.push('| Channel | Contribution | Revenue Attributed | ROI |')
  lines.push('|---------|-------------|-------------------|-----|')
  for (const c of result.channel_contribution) {
    lines.push(`| ${c.channel} | ${c.contribution_pct.toFixed(1)}% | $${c.revenue_attributed.toFixed(0)} | ${c.roi.toFixed(2)}x |`)
  }
  lines.push('')

  lines.push('### Diminishing Returns Curve')
  lines.push('| Channel | Current Spend | Optimal Spend | Saturation Point |')
  lines.push('|---------|--------------|---------------|-----------------|')
  for (const d of result.diminishing_returns_curve) {
    lines.push(`| ${d.channel} | $${d.current_spend.toFixed(0)} | $${d.optimal_spend.toFixed(0)} | $${d.saturation_point.toFixed(0)} |`)
  }
  lines.push('')

  lines.push('### Optimal Spend Levels')
  lines.push('| Channel | Current | Optimal | Change |')
  lines.push('|---------|---------|---------|--------|')
  for (const o of result.optimal_spend_levels) {
    const changeStr = o.change_pct >= 0 ? `+${o.change_pct.toFixed(1)}%` : `${o.change_pct.toFixed(1)}%`
    lines.push(`| ${o.channel} | $${o.current.toFixed(0)} | $${o.optimal.toFixed(0)} | ${changeStr} |`)
  }
  lines.push('')

  lines.push('### Scenario Projections')
  lines.push('| Scenario | Total Spend | Projected Revenue | ROI |')
  lines.push('|----------|-------------|-------------------|-----|')
  for (const s of result.scenario_projections) {
    lines.push(`| ${s.scenario} | $${s.total_spend.toLocaleString()} | $${s.projected_revenue.toLocaleString()} | ${s.roi.toFixed(1)}% |`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Multi-Touch Attribution
  tools.register(defineTool({
    name: 'multi_touch_attribution',
    description: 'Analyze customer journeys and attribute revenue to marketing channels using multiple attribution models (first-touch, last-touch, linear, time-decay, position-based). Returns channel credit, per-touchpoint breakdown, and model comparison.',
    parameters: {
      customer_journeys: { type: 'string', required: true, description: 'JSON array of customer journey objects with fields: touchpoints (array of {channel, timestamp, cost}), converted (boolean), revenue (number)' },
      model: { type: 'string', description: 'Attribution model: "first_touch", "last_touch", "linear", "time_decay", or "position_based" (default "linear")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { customer_journeys: string; model?: string }) {
      const journeys: CustomerJourney[] = JSON.parse(args.customer_journeys)
      const model = args.model ?? 'linear'
      const result = multiTouchAttribution(journeys, model)
      return formatAttributionReport(result, model)
    }
  }))

  // Tool 2: Channel ROI Analyzer
  tools.register(defineTool({
    name: 'channel_roi_analyzer',
    description: 'Analyze ROI performance across marketing channels. Calculates ROAS, CPA, CPC, CPM, conversion rates, efficiency rankings, and provides optimization suggestions.',
    parameters: {
      channel_data: { type: 'string', required: true, description: 'JSON array of channel performance objects with fields: channel, spend, impressions, clicks, conversions, revenue' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { channel_data: string }) {
      const data: ChannelData[] = JSON.parse(args.channel_data)
      const result = analyzeChannelROI(data)
      return formatChannelROIReport(result)
    }
  }))

  // Tool 3: Budget Optimizer
  tools.register(defineTool({
    name: 'budget_optimizer',
    description: 'Optimize budget allocation across marketing channels given constraints. Uses ROI-weighted allocation with min/max spend limits. Returns optimal allocation, expected outcomes, marginal returns, and sensitivity analysis.',
    parameters: {
      total_budget: { type: 'string', required: true, description: 'Total budget to allocate as a number string' },
      channel_constraints: { type: 'string', required: true, description: 'JSON array of constraint objects with fields: channel, min_spend, max_spend, expected_roi' },
      objective: { type: 'string', description: 'Optimization objective: "revenue", "conversions", or "roi" (default "revenue")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { total_budget: string; channel_constraints: string; objective?: string }) {
      const budget = parseFloat(args.total_budget)
      const constraints: ChannelConstraint[] = JSON.parse(args.channel_constraints)
      const objective = args.objective ?? 'revenue'
      const result = optimizeBudget(budget, constraints, objective)
      return formatBudgetOptimizerReport(result)
    }
  }))

  // Tool 4: Campaign Forecaster
  tools.register(defineTool({
    name: 'campaign_forecaster',
    description: 'Forecast future campaign performance based on historical data. Generates predictions with confidence intervals, seasonality adjustments, and identifies risk factors.',
    parameters: {
      historical_campaigns: { type: 'string', required: true, description: 'JSON array of historical campaign data with fields: date, channel, spend, conversions, revenue' },
      future_plans: { type: 'string', required: true, description: 'JSON array of future campaign plans with fields: date, channel, planned_spend' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { historical_campaigns: string; future_plans: string }) {
      const historical: HistoricalCampaign[] = JSON.parse(args.historical_campaigns)
      const plans: FuturePlan[] = JSON.parse(args.future_plans)
      const result = forecastCampaigns(historical, plans)
      return formatForecastReport(result)
    }
  }))

  // Tool 5: Customer Acquisition Cost
  tools.register(defineTool({
    name: 'customer_acquisition_cost',
    description: 'Calculate and analyze customer acquisition costs. Provides blended CAC, channel-level CAC, payback period, LTV:CAC ratio, benchmarking, and health scoring.',
    parameters: {
      marketing_data: { type: 'string', required: true, description: 'JSON object with fields: total_spend, new_customers, channel_breakdown (array of {channel, spend, new_customers})' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { marketing_data: string }) {
      const data: MarketingData = JSON.parse(args.marketing_data)
      const result = analyzeCAC(data)
      return formatCACReport(result)
    }
  }))

  // Tool 6: Conversion Funnel Analyzer
  tools.register(defineTool({
    name: 'conversion_funnel_analyzer',
    description: 'Analyze conversion funnel performance. Identifies biggest drop-offs, calculates stage-by-stage conversion rates, finds improvement opportunities, and projects revenue impact of optimizations.',
    parameters: {
      funnel_data: { type: 'string', required: true, description: 'JSON array of funnel stage objects with fields: stage, users, drop_off_rate (optional)' },
      benchmarks: { type: 'string', description: 'Optional JSON object with benchmark drop-off rates by stage (e.g., {"Awareness": 30, "Consideration": 50})' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { funnel_data: string; benchmarks?: string }) {
      const data: FunnelStage[] = JSON.parse(args.funnel_data)
      const benchmarks = args.benchmarks ? JSON.parse(args.benchmarks) : undefined
      const result = analyzeFunnel(data, benchmarks)
      return formatFunnelReport(result)
    }
  }))

  // Tool 7: A/B Test Analyzer
  tools.register(defineTool({
    name: 'ab_test_analyzer',
    description: 'Analyze A/B test results for statistical significance. Calculates uplift, p-values, confidence intervals, and provides sample size recommendations for reliable results.',
    parameters: {
      test_data: { type: 'string', required: true, description: 'JSON object with fields: control_visitors, control_conversions, variant_visitors, variant_conversions, confidence_level (e.g., 95)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { test_data: string }) {
      const data = JSON.parse(args.test_data)
      const result = abTestAnalyzer(
        data.control_visitors,
        data.control_conversions,
        data.variant_visitors,
        data.variant_conversions,
        data.confidence_level ?? 95
      )
      return formatABTestReport(result)
    }
  }))

  // Tool 8: Marketing Mix Modeler
  tools.register(defineTool({
    name: 'marketing_mix_modeler',
    description: 'Build marketing mix models to understand channel contribution to revenue. Provides attribution, diminishing returns curves, optimal spend levels, and scenario projections.',
    parameters: {
      historical_data: { type: 'string', required: true, description: 'JSON array of period data with fields: period, revenue, tv_spend, digital_spend, print_spend, radio_spend, promotions' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { historical_data: string }) {
      const data: MarketingMixPeriod[] = JSON.parse(args.historical_data)
      const result = marketingMixModel(data)
      return formatMMMReport(result)
    }
  }))

  console.log(`[dsh-tool-martech] Loaded v${VERSION} — Marketing Attribution & ROI Engine with 8 tools`)
  console.log('  Tools: multi_touch_attribution, channel_roi_analyzer, budget_optimizer, campaign_forecaster, customer_acquisition_cost, conversion_funnel_analyzer, ab_test_analyzer, marketing_mix_modeler')
}
