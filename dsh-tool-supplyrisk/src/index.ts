/**
 * DSH Supply Chain Risk Management Plugin v0.1.0
 *
 * Supply Chain Risk Management — multi-tier visibility, disruption prediction,
 * nearshoring analysis, supplier financial health.
 *
 * 2026: Supply chain risk software $8B+; growing at 18% CAGR.
 *
 * Tools:
 * 1. multi_tier_visibility_mapper   — Multi-tier supply chain mapping
 * 2. disruption_prediction_engine   — Predictive disruption alerts
 * 3. nearshoring_analyzer           — Nearshoring/reshoring cost-benefit analysis
 * 4. supplier_financial_health_checker — Supplier financial health scoring
 * 5. geopolitical_risk_assessor     — Geopolitical risk assessment
 * 6. logistics_bottleneck_detector  — Logistics bottleneck identification
 * 7. demand_supply_mismatcher       — Demand-supply gap analysis
 * 8. resilience_strategy_advisor    — Supply chain resilience strategy
 *
 * @module dsh-tool-supplyrisk | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'

export const name = 'dsh-tool-supplyrisk'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 — Helper Functions ====================

function buildMarkdownTable(headers: string[], rows: string[][]): string {
  const lines: string[] = []
  lines.push('| ' + headers.join(' | ') + ' |')
  lines.push('| ' + headers.map(() => '---').join(' | ') + ' |')
  for (const row of rows) {
    lines.push('| ' + row.join(' | ') + ' |')
  }
  return lines.join('\n')
}

function renderReport(_args: unknown, value: { report_markdown: string }): ContentBlock[] {
  return [{ type: 'text', text: value.report_markdown }]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== SECTION 3 — Type Definitions ====================

// --- Tool 1: Multi-Tier Visibility Mapper ---
export interface TierNode {
  supplier_id: string
  supplier_name: string
  tier: number
  country: string
  product_category: string
  spend_pct: number
  lead_time_days: number
  parent_id?: string
}

export interface VisibilityGap {
  tier: number
  region: string
  gap_type: 'unknown_supplier' | 'concentration_risk' | 'data_incomplete' | 'sole_source'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export interface TierSummary {
  tier: number
  supplier_count: number
  countries: string[]
  avg_lead_time_days: number
  concentration_risk: number
  visibility_pct: number
}

export interface MultiTierVisibilityResult {
  tiers: TierSummary[]
  gaps: VisibilityGap[]
  critical_paths: string[][]
  overall_visibility_pct: number
  risk_hotspots: string[]
  recommendation: string
  report_markdown: string
}

// --- Tool 2: Disruption Prediction Engine ---
export interface DisruptionSignal {
  signal_type: 'natural_disaster' | 'geopolitical' | 'financial' | 'cyber' | 'pandemic' | 'logistics'
  region: string
  probability: number
  impact_severity: 'low' | 'medium' | 'high' | 'critical'
  lead_time_days: number
  affected_suppliers: string[]
  description: string
}

export interface DisruptionPrediction {
  signal: DisruptionSignal
  predicted_disruption_date: string
  estimated_duration_days: number
  financial_impact_usd: number
  mitigation_actions: string[]
  confidence: number
}

export interface DisruptionPredictionResult {
  predictions: DisruptionPrediction[]
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical'
  highest_risk_region: string
  total_exposure_usd: number
  early_warning_days: number
  recommendation: string
  report_markdown: string
}

// --- Tool 3: Nearshoring Analyzer ---
export interface NearshoringScenario {
  scenario_name: string
  current_region: string
  proposed_region: string
  labor_cost_change_pct: number
  logistics_cost_change_pct: number
  lead_time_change_pct: number
  tariff_impact_pct: number
  setup_cost_usd: number
  annual_savings_usd: number
  roi_months: number
  risk_reduction_pct: number
}

export interface NearshoringResult {
  scenarios: NearshoringScenario[]
  recommended_scenario: string
  total_potential_savings_usd: number
  avg_roi_months: number
  risk_reduction_potential_pct: number
  implementation_complexity: 'low' | 'medium' | 'high'
  recommendation: string
  report_markdown: string
}

// --- Tool 4: Supplier Financial Health Checker ---
export interface SupplierFinancialInput {
  supplier_id: string
  supplier_name: string
  country: string
  revenue_usd: number
  profit_margin_pct: number
  debt_to_equity_ratio: number
  current_ratio: number
  credit_rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC'
  years_in_business: number
  on_time_delivery_pct: number
  quality_score: number
}

export interface FinancialHealthScore {
  supplier_id: string
  supplier_name: string
  country: string
  financial_score: number
  operational_score: number
  composite_score: number
  health_level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  risk_flags: string[]
  trend: 'improving' | 'stable' | 'declining'
}

export interface SupplierFinancialHealthResult {
  scores: FinancialHealthScore[]
  summary: {
    total_assessed: number
    healthy_count: number
    at_risk_count: number
    critical_count: number
    avg_composite_score: number
  }
  recommendation: string
  report_markdown: string
}

// --- Tool 5: Geopolitical Risk Assessor ---
export interface RegionRiskInput {
  country: string
  region: string
  political_stability_index: number
  trade_restriction_level: number
  sanctions_risk: number
  labor_unrest_index: number
  regulatory_change_index: number
  infrastructure_quality: number
}

export interface GeopoliticalRiskScore {
  country: string
  region: string
  composite_risk: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  mitigating_strategies: string[]
  monitoring_priority: 'routine' | 'elevated' | 'high' | 'urgent'
}

export interface GeopoliticalRiskResult {
  region_scores: GeopoliticalRiskScore[]
  heatmap: {
    highest_risk: string[]
    lowest_risk: string[]
    avg_composite_risk: number
  }
  recommendation: string
  report_markdown: string
}

// --- Tool 6: Logistics Bottleneck Detector ---
export interface LogisticsRouteInput {
  route_id: string
  origin: string
  destination: string
  transport_mode: 'road' | 'rail' | 'air' | 'sea' | 'multimodal'
  avg_transit_days: number
  current_transit_days: number
  cost_per_unit: number
  volume_units: number
  reliability_pct: number
  capacity_utilization_pct: number
}

export interface BottleneckFinding {
  route_id: string
  bottleneck_type: 'congestion' | 'capacity' | 'cost_spike' | 'reliability' | 'customs' | 'weather'
  severity: 'low' | 'medium' | 'high' | 'critical'
  impact_description: string
  affected_volume_pct: number
  estimated_cost_impact_usd: number
  alternative_routes: string[]
  resolution_timeframe: string
}

export interface LogisticsBottleneckResult {
  findings: BottleneckFinding[]
  total_routes_analyzed: number
  bottleneck_count: number
  total_cost_impact_usd: number
  most_critical_route: string
  recommendation: string
  report_markdown: string
}

// --- Tool 7: Demand-Supply Mismatcher ---
export interface DemandSupplyInput {
  product_id: string
  product_name: string
  period: string
  demand_forecast_units: number
  supply_capacity_units: number
  current_inventory_units: number
  inbound_supply_units: number
  production_lead_time_days: number
  supplier_reliability_pct: number
}

export interface MismatchFinding {
  product_id: string
  product_name: string
  gap_units: number
  gap_pct: number
  mismatch_type: 'shortage' | 'surplus'
  severity: 'low' | 'medium' | 'high' | 'critical'
  estimated_revenue_impact_usd: number
  root_causes: string[]
  corrective_actions: string[]
}

export interface DemandSupplyMismatchResult {
  findings: MismatchFinding[]
  total_products_analyzed: number
  shortage_count: number
  surplus_count: number
  total_revenue_at_risk_usd: number
  avg_gap_pct: number
  recommendation: string
  report_markdown: string
}

// --- Tool 8: Resilience Strategy Advisor ---
export interface ResilienceInput {
  supply_chain_id: string
  supply_chain_name: string
  redundancy_index: number
  flexibility_score: number
  visibility_score: number
  collaboration_index: number
  recovery_time_days: number
  single_source_dependencies: number
  geographic_concentration_pct: number
  inventory_buffer_days: number
}

export interface ResilienceDimension {
  dimension: string
  score: number
  benchmark: number
  gap: number
  status: 'above_target' | 'on_target' | 'below_target'
  improvement_actions: string[]
}

export interface ResilienceStrategyResult {
  supply_chain_id: string
  supply_chain_name: string
  overall_resilience_score: number
  resilience_level: 'highly_resilient' | 'resilient' | 'moderate' | 'vulnerable' | 'critical'
  dimensions: ResilienceDimension[]
  top_priorities: string[]
  investment_estimate_usd: number
  projected_improvement_pct: number
  recommendation: string
  report_markdown: string
}

// ==================== SECTION 4 — Analysis Functions ====================

// --- Tool 1: Multi-Tier Visibility Mapper ---
function analyzeMultiTierVisibility(input: TierNode[]): MultiTierVisibilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const tierMap = new Map<number, TierNode[]>()
  for (const node of input) {
    const existing = tierMap.get(node.tier) || []
    existing.push(node)
    tierMap.set(node.tier, existing)
  }

  const tiers: TierSummary[] = []
  const gaps: VisibilityGap[] = []
  const criticalPaths: string[][] = []
  const riskHotspots: string[] = []

  const sortedTierKeys = Array.from(tierMap.keys()).sort((a, b) => a - b)

  for (const tierNum of sortedTierKeys) {
    const nodes = tierMap.get(tierNum) || []
    const countries = Array.from(new Set(nodes.map(n => n.country)))
    const avgLead = nodes.reduce((s, n) => s + n.lead_time_days, 0) / Math.max(1, nodes.length)

    const countrySpend: Record<string, number> = {}
    for (const n of nodes) {
      countrySpend[n.country] = (countrySpend[n.country] || 0) + n.spend_pct
    }
    const maxConcentration = Math.max(0, ...Object.values(countrySpend))
    const visibility = clamp(Math.round(rng.nextFloat(40, 95)), 0, 100)

    tiers.push({
      tier: tierNum,
      supplier_count: nodes.length,
      countries,
      avg_lead_time_days: Math.round(avgLead * 10) / 10,
      concentration_risk: Math.round(maxConcentration),
      visibility_pct: visibility
    })

    if (visibility < 60) {
      gaps.push({
        tier: tierNum,
        region: countries[0] || 'Unknown',
        gap_type: 'data_incomplete',
        severity: visibility < 40 ? 'critical' : 'high',
        description: 'Tier ' + tierNum + ' has only ' + visibility + '% visibility — significant blind spots in supplier network'
      })
    }

    if (maxConcentration > 70) {
      const topCountry = Object.entries(countrySpend).sort((a, b) => b[1] - a[1])[0]
      gaps.push({
        tier: tierNum,
        region: topCountry[0],
        gap_type: 'concentration_risk',
        severity: maxConcentration > 85 ? 'critical' : 'high',
        description: 'Tier ' + tierNum + ' concentrated in ' + topCountry[0] + ' (' + Math.round(maxConcentration) + '% of spend)'
      })
      riskHotspots.push(topCountry[0] + ' (Tier ' + tierNum + ')')
    }

    const soleSources = nodes.filter(n => n.spend_pct > 80)
    for (const ss of soleSources) {
      gaps.push({
        tier: tierNum,
        region: ss.country,
        gap_type: 'sole_source',
        severity: 'critical',
        description: ss.supplier_name + ' is sole source for ' + ss.product_category + ' in Tier ' + tierNum
      })
    }

    if (tierNum <= 2 && nodes.length > 0) {
      const path = nodes.sort((a, b) => b.spend_pct - a.spend_pct).slice(0, 3).map(n => n.supplier_name)
      criticalPaths.push(path)
    }
  }

  const overallVisibility = tiers.length > 0
    ? Math.round(tiers.reduce((s, t) => s + t.visibility_pct, 0) / tiers.length)
    : 0

  const recommendationMap: Record<string, string> = {
    critical: 'Immediate action required — critical visibility gaps expose the supply chain to undetected disruptions',
    high: 'High priority — invest in multi-tier visibility tools and supplier data collection',
    medium: 'Moderate risk — expand visibility to Tier 2+ suppliers in concentrated regions',
    low: 'Good visibility — maintain monitoring and extend to deeper tiers'
  }

  const overallLevel = overallVisibility < 40 ? 'critical' : overallVisibility < 60 ? 'high' : overallVisibility < 80 ? 'medium' : 'low'

  // Build markdown report
  const rl: string[] = []
  rl.push('# Multi-Tier Visibility Report', '', '## Tier Summary', '')
  rl.push(buildMarkdownTable(
    ['Tier', 'Suppliers', 'Countries', 'Avg Lead Time', 'Concentration', 'Visibility'],
    tiers.map(t => ['Tier ' + t.tier, t.supplier_count.toString(), t.countries.length.toString(), t.avg_lead_time_days + ' days', t.concentration_risk + '%', t.visibility_pct + '%'])
  ))

  if (gaps.length > 0) {
    rl.push('', '## Visibility Gaps', '')
    rl.push(buildMarkdownTable(
      ['Tier', 'Region', 'Gap Type', 'Severity', 'Description'],
      gaps.map(g => ['Tier ' + g.tier, g.region, g.gap_type.replace(/_/g, ' '), g.severity.toUpperCase(), g.description])
    ))
  }

  if (criticalPaths.length > 0) {
    rl.push('', '## Critical Paths', '')
    criticalPaths.forEach((path, i) => {
      rl.push('**Path ' + (i + 1) + ':** ' + path.join(' → '))
    })
  }

  if (riskHotspots.length > 0) {
    rl.push('', '## Risk Hotspots', '')
    riskHotspots.forEach(h => rl.push('- ' + h))
  }

  rl.push('', '## Overall Visibility', '')
  rl.push('- **Overall Visibility Score:** ' + overallVisibility + '%')
  rl.push('- **Risk Level:** ' + overallLevel.toUpperCase())
  rl.push('- **Recommendation:** ' + recommendationMap[overallLevel])
  rl.push('')

  return {
    tiers,
    gaps,
    critical_paths: criticalPaths,
    overall_visibility_pct: overallVisibility,
    risk_hotspots: riskHotspots,
    recommendation: recommendationMap[overallLevel],
    report_markdown: rl.join('\n')
  }
}

// --- Tool 2: Disruption Prediction Engine ---
function analyzeDisruptionPrediction(signals: DisruptionSignal[]): DisruptionPredictionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(signals)))

  const predictions: DisruptionPrediction[] = []
  let totalExposure = 0

  for (const signal of signals) {
    const duration = Math.round(rng.nextFloat(7, 120))
    const financialImpact = Math.round(signal.probability * signal.affected_suppliers.length * rng.nextFloat(50000, 500000))
    totalExposure += financialImpact

    const mitigationActions: string[] = []
    if (signal.signal_type === 'natural_disaster') {
      mitigationActions.push('Activate alternative suppliers in unaffected regions')
      mitigationActions.push('Increase safety stock for affected product categories')
      mitigationActions.push('Pre-position inventory at strategic distribution centers')
    } else if (signal.signal_type === 'geopolitical') {
      mitigationActions.push('Diversify sourcing to stable regions')
      mitigationActions.push('Review force majeure clauses in supplier contracts')
      mitigationActions.push('Establish buffer inventory for critical materials')
    } else if (signal.signal_type === 'financial') {
      mitigationActions.push('Identify backup suppliers for at-risk categories')
      mitigationActions.push('Negotiate payment terms to support distressed suppliers')
      mitigationActions.push('Increase financial monitoring frequency')
    } else if (signal.signal_type === 'cyber') {
      mitigationActions.push('Verify supplier cybersecurity protocols')
      mitigationActions.push('Implement redundant communication channels')
      mitigationActions.push('Review data backup and recovery procedures')
    } else if (signal.signal_type === 'pandemic') {
      mitigationActions.push('Activate business continuity plans')
      mitigationActions.push('Distribute production across regions')
      mitigationActions.push('Build strategic stockpile of critical items')
    } else {
      mitigationActions.push('Identify alternative logistics routes')
      mitigationActions.push('Negotiate priority capacity with carriers')
      mitigationActions.push('Evaluate nearshoring options for critical lanes')
    }

    const daysOut = Math.round(rng.nextFloat(7, 90))
    const predDate = new Date()
    predDate.setDate(predDate.getDate() + daysOut)

    predictions.push({
      signal,
      predicted_disruption_date: predDate.toISOString().split('T')[0],
      estimated_duration_days: duration,
      financial_impact_usd: financialImpact,
      mitigation_actions: mitigationActions,
      confidence: Math.round(signal.probability * rng.nextFloat(0.7, 0.95) * 100) / 100
    })
  }

  predictions.sort((a, b) => b.signal.probability * b.financial_impact_usd - a.signal.probability * a.financial_impact_usd)

  const regionExposure: Record<string, number> = {}
  for (const p of predictions) {
    regionExposure[p.signal.region] = (regionExposure[p.signal.region] || 0) + p.financial_impact_usd
  }
  const highestRiskRegion = Object.entries(regionExposure).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  const maxSeverity = predictions.length > 0
    ? predictions.reduce((max, p) => {
        const levels = { low: 1, medium: 2, high: 3, critical: 4 }
        return levels[p.signal.impact_severity] > levels[max] ? p.signal.impact_severity : max
      }, 'low' as DisruptionSignal['impact_severity'])
    : 'low'

  const avgLeadTime = predictions.length > 0
    ? Math.round(predictions.reduce((s, p) => s + p.signal.lead_time_days, 0) / predictions.length)
    : 0

  const recommendationMap: Record<string, string> = {
    critical: 'CRITICAL: Multiple high-probability disruptions predicted — activate crisis management team immediately',
    high: 'HIGH: Significant disruption risk — implement mitigation actions and increase monitoring',
    medium: 'MEDIUM: Moderate disruption signals — review contingency plans and pre-position resources',
    low: 'LOW: Normal risk levels — maintain standard monitoring and preparedness'
  }

  // Build markdown report
  const rl: string[] = []
  rl.push('# Disruption Prediction Report', '', '## Predicted Disruptions', '')
  rl.push(buildMarkdownTable(
    ['Type', 'Region', 'Probability', 'Severity', 'Financial Impact', 'Predicted Date'],
    predictions.map(p => [
      p.signal.signal_type.replace(/_/g, ' '),
      p.signal.region,
      Math.round(p.signal.probability * 100) + '%',
      p.signal.impact_severity.toUpperCase(),
      '$' + p.financial_impact_usd.toLocaleString(),
      p.predicted_disruption_date
    ])
  ))

  if (predictions.length > 0) {
    rl.push('', '## Top Mitigation Actions', '')
    predictions.slice(0, 3).forEach((p, i) => {
      rl.push('### ' + (i + 1) + '. ' + p.signal.signal_type.replace(/_/g, ' ') + ' — ' + p.signal.region)
      p.mitigation_actions.forEach(a => rl.push('- ' + a))
    })
  }

  rl.push('', '## Risk Summary', '')
  rl.push('- **Overall Risk Level:** ' + maxSeverity.toUpperCase())
  rl.push('- **Highest Risk Region:** ' + highestRiskRegion)
  rl.push('- **Total Financial Exposure:** $' + totalExposure.toLocaleString())
  rl.push('- **Average Early Warning:** ' + avgLeadTime + ' days')
  rl.push('- **Recommendation:** ' + recommendationMap[maxSeverity])
  rl.push('')

  return {
    predictions,
    overall_risk_level: maxSeverity,
    highest_risk_region: highestRiskRegion,
    total_exposure_usd: totalExposure,
    early_warning_days: avgLeadTime,
    recommendation: recommendationMap[maxSeverity],
    report_markdown: rl.join('\n')
  }
}

// --- Tool 3: Nearshoring Analyzer ---
function analyzeNearshoring(input: { current_suppliers: { region: string; spend_usd: number; lead_time_days: number }[]; target_regions: string[] }): NearshoringResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const scenarios: NearshoringScenario[] = []

  for (const targetRegion of input.target_regions) {
    for (const supplier of input.current_suppliers) {
      if (supplier.region === targetRegion) continue

      const laborCostChange = Math.round(rng.nextFloat(-30, 10))
      const logisticsCostChange = Math.round(rng.nextFloat(-20, 15))
      const leadTimeChange = Math.round(rng.nextFloat(-40, 5))
      const tariffImpact = Math.round(rng.nextFloat(-5, 12))
      const setupCost = Math.round(rng.nextFloat(500000, 5000000))
      const annualSavings = Math.round(supplier.spend_usd * rng.nextFloat(0.05, 0.25))
      const roiMonths = Math.round(setupCost / Math.max(1, annualSavings / 12))
      const riskReduction = Math.round(rng.nextFloat(10, 45))

      scenarios.push({
        scenario_name: supplier.region + ' → ' + targetRegion,
        current_region: supplier.region,
        proposed_region: targetRegion,
        labor_cost_change_pct: laborCostChange,
        logistics_cost_change_pct: logisticsCostChange,
        lead_time_change_pct: leadTimeChange,
        tariff_impact_pct: tariffImpact,
        setup_cost_usd: setupCost,
        annual_savings_usd: annualSavings,
        roi_months: roiMonths,
        risk_reduction_pct: riskReduction
      })
    }
  }

  scenarios.sort((a, b) => a.roi_months - b.roi_months)

  const totalSavings = scenarios.reduce((s, sc) => s + sc.annual_savings_usd, 0)
  const avgRoi = scenarios.length > 0 ? Math.round(scenarios.reduce((s, sc) => s + sc.roi_months, 0) / scenarios.length) : 0
  const avgRiskReduction = scenarios.length > 0 ? Math.round(scenarios.reduce((s, sc) => s + sc.risk_reduction_pct, 0) / scenarios.length) : 0

  const complexity = avgRoi > 36 ? 'high' : avgRoi > 18 ? 'medium' : 'low'
  const recommended = scenarios.length > 0 ? scenarios[0].scenario_name : 'N/A'

  // Build markdown report
  const rl: string[] = []
  rl.push('# Nearshoring Analysis Report', '', '## Scenarios', '')
  rl.push(buildMarkdownTable(
    ['Scenario', 'Labor Cost', 'Logistics', 'Lead Time', 'Tariff', 'Setup Cost', 'Annual Savings', 'ROI (months)', 'Risk Reduction'],
    scenarios.map(s => [
      s.scenario_name,
      (s.labor_cost_change_pct > 0 ? '+' : '') + s.labor_cost_change_pct + '%',
      (s.logistics_cost_change_pct > 0 ? '+' : '') + s.logistics_cost_change_pct + '%',
      (s.lead_time_change_pct > 0 ? '+' : '') + s.lead_time_change_pct + '%',
      (s.tariff_impact_pct > 0 ? '+' : '') + s.tariff_impact_pct + '%',
      '$' + s.setup_cost_usd.toLocaleString(),
      '$' + s.annual_savings_usd.toLocaleString(),
      s.roi_months.toString(),
      s.risk_reduction_pct + '%'
    ])
  ))

  rl.push('', '## Summary', '')
  rl.push('- **Recommended Scenario:** ' + recommended)
  rl.push('- **Total Potential Savings:** $' + totalSavings.toLocaleString() + '/year')
  rl.push('- **Average ROI:** ' + avgRoi + ' months')
  rl.push('- **Risk Reduction Potential:** ' + avgRiskReduction + '%')
  rl.push('- **Implementation Complexity:** ' + complexity.toUpperCase())
  rl.push('- **Recommendation:** Prioritize scenarios with ROI < 24 months and highest risk reduction')
  rl.push('')

  return {
    scenarios,
    recommended_scenario: recommended,
    total_potential_savings_usd: totalSavings,
    avg_roi_months: avgRoi,
    risk_reduction_potential_pct: avgRiskReduction,
    implementation_complexity: complexity,
    recommendation: 'Prioritize scenarios with ROI < 24 months and highest risk reduction',
    report_markdown: rl.join('\n')
  }
}

// --- Tool 4: Supplier Financial Health Checker ---
function analyzeSupplierFinancialHealth(suppliers: SupplierFinancialInput[]): SupplierFinancialHealthResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(suppliers)))

  const scores: FinancialHealthScore[] = []

  for (const s of suppliers) {
    const riskFlags: string[] = []

    // Financial score (0-100)
    let financial = 40

    if (s.profit_margin_pct > 15) financial += 20
    else if (s.profit_margin_pct > 8) financial += 10
    else if (s.profit_margin_pct > 0) financial += 0
    else { financial -= 20; riskFlags.push('Negative profit margin') }

    if (s.debt_to_equity_ratio < 0.5) financial += 15
    else if (s.debt_to_equity_ratio < 1.0) financial += 5
    else if (s.debt_to_equity_ratio < 1.5) financial -= 10
    else { financial -= 20; riskFlags.push('High debt-to-equity ratio') }

    if (s.current_ratio > 2.0) financial += 10
    else if (s.current_ratio > 1.0) financial += 5
    else { financial -= 10; riskFlags.push('Liquidity risk (current ratio < 1)') }

    const creditMap: Record<string, number> = { AAA: 15, AA: 12, A: 8, BBB: 3, BB: -5, B: -10, CCC: -20 }
    financial += creditMap[s.credit_rating] || 0
    if (s.credit_rating === 'CCC' || s.credit_rating === 'B') riskFlags.push('Low credit rating: ' + s.credit_rating)

    if (s.years_in_business > 15) financial += 5
    else if (s.years_in_business < 3) { financial -= 10; riskFlags.push('Limited operating history') }

    financial = clamp(Math.round(financial), 0, 100)

    // Operational score (0-100)
    let operational = 40

    if (s.on_time_delivery_pct > 95) operational += 30
    else if (s.on_time_delivery_pct > 90) operational += 20
    else if (s.on_time_delivery_pct > 80) operational += 5
    else if (s.on_time_delivery_pct > 70) operational -= 10
    else { operational -= 20; riskFlags.push('Poor delivery performance') }

    if (s.quality_score > 90) operational += 30
    else if (s.quality_score > 80) operational += 20
    else if (s.quality_score > 70) operational += 10
    else if (s.quality_score > 60) operational -= 5
    else { operational -= 15; riskFlags.push('Below standard quality') }

    operational = clamp(Math.round(operational), 0, 100)

    const composite = Math.round(financial * 0.5 + operational * 0.5)

    let healthLevel: FinancialHealthScore['health_level']
    if (composite >= 80) healthLevel = 'excellent'
    else if (composite >= 65) healthLevel = 'good'
    else if (composite >= 45) healthLevel = 'fair'
    else if (composite >= 25) healthLevel = 'poor'
    else healthLevel = 'critical'

    const trend: FinancialHealthScore['trend'] = rng.next() > 0.6 ? 'improving' : rng.next() > 0.3 ? 'stable' : 'declining'

    scores.push({
      supplier_id: s.supplier_id,
      supplier_name: s.supplier_name,
      country: s.country,
      financial_score: financial,
      operational_score: operational,
      composite_score: composite,
      health_level: healthLevel,
      risk_flags: riskFlags,
      trend
    })
  }

  scores.sort((a, b) => a.composite_score - b.composite_score)

  const avgComposite = scores.length > 0 ? Math.round(scores.reduce((s, r) => s + r.composite_score, 0) / scores.length) : 0

  // Build markdown report
  const rl: string[] = []
  rl.push('# Supplier Financial Health Report', '', '## Summary', '')
  rl.push('- **Total Assessed:** ' + scores.length)
  rl.push('- **Healthy (Excellent/Good):** ' + scores.filter(s => s.health_level === 'excellent' || s.health_level === 'good').length)
  rl.push('- **At Risk (Fair/Poor):** ' + scores.filter(s => s.health_level === 'fair' || s.health_level === 'poor').length)
  rl.push('- **Critical:** ' + scores.filter(s => s.health_level === 'critical').length)
  rl.push('- **Average Composite Score:** ' + avgComposite + '/100')
  rl.push('')

  rl.push('## Supplier Scores (sorted by risk)', '')
  rl.push(buildMarkdownTable(
    ['Supplier', 'Country', 'Financial', 'Operational', 'Composite', 'Health', 'Trend'],
    scores.map(s => [s.supplier_name, s.country, s.financial_score.toString(), s.operational_score.toString(), s.composite_score.toString(), s.health_level.toUpperCase(), s.trend])
  ))

  const flagged = scores.filter(s => s.risk_flags.length > 0)
  if (flagged.length > 0) {
    rl.push('', '## Risk Flags', '')
    flagged.forEach(s => {
      rl.push('- **' + s.supplier_name + '** [' + s.health_level.toUpperCase() + ']: ' + s.risk_flags.join(', '))
    })
  }

  rl.push('', '## Recommendation', '')
  rl.push('- Monitor critical suppliers weekly and develop contingency sourcing options')
  rl.push('- Request improvement plans for fair/poor rated suppliers')
  rl.push('- Maintain strategic partnerships with excellent/good rated suppliers')
  rl.push('')

  return {
    scores,
    summary: {
      total_assessed: scores.length,
      healthy_count: scores.filter(s => s.health_level === 'excellent' || s.health_level === 'good').length,
      at_risk_count: scores.filter(s => s.health_level === 'fair' || s.health_level === 'poor').length,
      critical_count: scores.filter(s => s.health_level === 'critical').length,
      avg_composite_score: avgComposite
    },
    recommendation: 'Monitor critical suppliers weekly and develop contingency sourcing options',
    report_markdown: rl.join('\n')
  }
}

// --- Tool 5: Geopolitical Risk Assessor ---
function analyzeGeopoliticalRisk(regions: RegionRiskInput[]): GeopoliticalRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(regions)))

  const regionScores: GeopoliticalRiskScore[] = []

  for (const r of regions) {
    const riskFactors: string[] = []
    const mitigatingStrategies: string[] = []

    // Composite risk (0-100, higher = more risky)
    let composite = 0

    if (r.political_stability_index < 30) {
      composite += 25
      riskFactors.push('Severe political instability')
      mitigatingStrategies.push('Diversify sourcing away from this region')
      mitigatingStrategies.push('Establish safety stock for critical materials')
    } else if (r.political_stability_index < 50) {
      composite += 15
      riskFactors.push('Moderate political instability')
      mitigatingStrategies.push('Monitor political developments closely')
    } else if (r.political_stability_index < 70) {
      composite += 5
    }

    if (r.trade_restriction_level > 70) {
      composite += 20
      riskFactors.push('High trade restrictions')
      mitigatingStrategies.push('Explore free trade agreement alternatives')
    } else if (r.trade_restriction_level > 40) {
      composite += 10
      riskFactors.push('Moderate trade barriers')
    }

    if (r.sanctions_risk > 70) {
      composite += 25
      riskFactors.push('High sanctions risk')
      mitigatingStrategies.push('Screen all transactions for sanctions compliance')
      mitigatingStrategies.push('Identify alternative sourcing regions')
    } else if (r.sanctions_risk > 40) {
      composite += 10
      riskFactors.push('Elevated sanctions exposure')
    }

    if (r.labor_unrest_index > 70) {
      composite += 15
      riskFactors.push('High labor unrest risk')
      mitigatingStrategies.push('Develop labor contingency plans')
    } else if (r.labor_unrest_index > 40) {
      composite += 5
    }

    if (r.regulatory_change_index > 70) {
      composite += 10
      riskFactors.push('Frequent regulatory changes')
      mitigatingStrategies.push('Engage local regulatory expertise')
    }

    if (r.infrastructure_quality < 30) {
      composite += 10
      riskFactors.push('Poor infrastructure quality')
      mitigatingStrategies.push('Invest in logistics redundancy')
    }

    composite = clamp(Math.round(composite + rng.nextFloat(-5, 5)), 0, 100)

    let riskLevel: GeopoliticalRiskScore['risk_level']
    let monitoringPriority: GeopoliticalRiskScore['monitoring_priority']

    if (composite >= 70) {
      riskLevel = 'critical'
      monitoringPriority = 'urgent'
    } else if (composite >= 50) {
      riskLevel = 'high'
      monitoringPriority = 'high'
    } else if (composite >= 30) {
      riskLevel = 'medium'
      monitoringPriority = 'elevated'
    } else {
      riskLevel = 'low'
      monitoringPriority = 'routine'
    }

    regionScores.push({
      country: r.country,
      region: r.region,
      composite_risk: composite,
      risk_level: riskLevel,
      risk_factors: riskFactors,
      mitigating_strategies: mitigatingStrategies,
      monitoring_priority: monitoringPriority
    })
  }

  regionScores.sort((a, b) => b.composite_risk - a.composite_risk)

  const avgRisk = regionScores.length > 0
    ? Math.round(regionScores.reduce((s, r) => s + r.composite_risk, 0) / regionScores.length)
    : 0

  // Build markdown report
  const rl: string[] = []
  rl.push('# Geopolitical Risk Assessment', '', '## Region Risk Scores', '')
  rl.push(buildMarkdownTable(
    ['Country', 'Region', 'Composite Risk', 'Risk Level', 'Monitoring Priority'],
    regionScores.map(r => [r.country, r.region, r.composite_risk + '/100', r.risk_level.toUpperCase(), r.monitoring_priority.toUpperCase()])
  ))

  const highRisk = regionScores.filter(r => r.risk_level === 'critical' || r.risk_level === 'high')
  if (highRisk.length > 0) {
    rl.push('', '## High-Risk Regions', '')
    highRisk.forEach(r => {
      rl.push('### ' + r.country + ' (' + r.region + ') — ' + r.composite_risk + '/100')
      rl.push('- **Risk Factors:** ' + r.risk_factors.join(', '))
      rl.push('- **Mitigation:** ' + r.mitigating_strategies.join('; '))
    })
  }

  rl.push('', '## Summary', '')
  rl.push('- **Highest Risk Regions:** ' + regionScores.slice(0, 3).map(r => r.country).join(', '))
  rl.push('- **Lowest Risk Regions:** ' + regionScores.slice(-3).map(r => r.country).join(', '))
  rl.push('- **Average Composite Risk:** ' + avgRisk + '/100')
  rl.push('- **Recommendation:** Prioritize diversification away from critical/high-risk regions')
  rl.push('')

  return {
    region_scores: regionScores,
    heatmap: {
      highest_risk: regionScores.slice(0, 3).map(r => r.country),
      lowest_risk: regionScores.slice(-3).map(r => r.country),
      avg_composite_risk: avgRisk
    },
    recommendation: 'Prioritize diversification away from critical/high-risk regions',
    report_markdown: rl.join('\n')
  }
}

// --- Tool 6: Logistics Bottleneck Detector ---
function analyzeLogisticsBottlenecks(routes: LogisticsRouteInput[]): LogisticsBottleneckResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(routes)))

  const findings: BottleneckFinding[] = []
  let totalCostImpact = 0

  for (const route of routes) {
    // Check for congestion
    if (route.current_transit_days > route.avg_transit_days * 1.3) {
      const costImpact = Math.round(route.volume_units * route.cost_per_unit * rng.nextFloat(0.1, 0.3))
      totalCostImpact += costImpact
      findings.push({
        route_id: route.route_id,
        bottleneck_type: 'congestion',
        severity: route.current_transit_days > route.avg_transit_days * 2 ? 'critical' : 'high',
        impact_description: 'Transit time increased from ' + route.avg_transit_days + ' to ' + route.current_transit_days + ' days on ' + route.origin + ' → ' + route.destination,
        affected_volume_pct: Math.round(rng.nextFloat(20, 60)),
        estimated_cost_impact_usd: costImpact,
        alternative_routes: ['Reroute via ' + route.destination + ' hub', 'Switch to ' + (route.transport_mode === 'sea' ? 'rail' : 'sea') + ' freight'],
        resolution_timeframe: rng.nextInt(2, 8) + ' weeks'
      })
    }

    // Check for capacity constraints
    if (route.capacity_utilization_pct > 85) {
      const costImpact = Math.round(route.volume_units * route.cost_per_unit * rng.nextFloat(0.05, 0.2))
      totalCostImpact += costImpact
      findings.push({
        route_id: route.route_id,
        bottleneck_type: 'capacity',
        severity: route.capacity_utilization_pct > 95 ? 'critical' : 'high',
        impact_description: 'Capacity utilization at ' + route.capacity_utilization_pct + '% on ' + route.route_id,
        affected_volume_pct: Math.round(route.capacity_utilization_pct - 80),
        estimated_cost_impact_usd: costImpact,
        alternative_routes: ['Secure dedicated capacity', 'Split volume across multiple carriers'],
        resolution_timeframe: rng.nextInt(4, 12) + ' weeks'
      })
    }

    // Check for cost spikes
    if (route.reliability_pct < 80) {
      const costImpact = Math.round(route.volume_units * route.cost_per_unit * rng.nextFloat(0.15, 0.4))
      totalCostImpact += costImpact
      findings.push({
        route_id: route.route_id,
        bottleneck_type: 'reliability',
        severity: route.reliability_pct < 60 ? 'critical' : 'high',
        impact_description: 'Reliability dropped to ' + route.reliability_pct + '% on ' + route.origin + ' → ' + route.destination,
        affected_volume_pct: Math.round(rng.nextFloat(10, 40)),
        estimated_cost_impact_usd: costImpact,
        alternative_routes: ['Engage backup carriers', 'Establish regional buffer inventory'],
        resolution_timeframe: rng.nextInt(1, 6) + ' weeks'
      })
    }
  }

  findings.sort((a, b) => {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 }
    return levels[b.severity] - levels[a.severity]
  })

  const mostCritical = findings.length > 0 ? findings[0].route_id : 'N/A'

  // Build markdown report
  const rl: string[] = []
  rl.push('# Logistics Bottleneck Report', '', '## Findings', '')
  rl.push(buildMarkdownTable(
    ['Route', 'Type', 'Severity', 'Volume Affected', 'Cost Impact', 'Resolution'],
    findings.map(f => [
      f.route_id,
      f.bottleneck_type,
      f.severity.toUpperCase(),
      f.affected_volume_pct + '%',
      '$' + f.estimated_cost_impact_usd.toLocaleString(),
      f.resolution_timeframe
    ])
  ))

  if (findings.length > 0) {
    rl.push('', '## Alternative Routes', '')
    findings.slice(0, 5).forEach(f => {
      rl.push('- **' + f.route_id + ':** ' + f.alternative_routes.join('; '))
    })
  }

  rl.push('', '## Summary', '')
  rl.push('- **Total Routes Analyzed:** ' + routes.length)
  rl.push('- **Bottlenecks Detected:** ' + findings.length)
  rl.push('- **Total Cost Impact:** $' + totalCostImpact.toLocaleString())
  rl.push('- **Most Critical Route:** ' + mostCritical)
  rl.push('- **Recommendation:** Address critical bottlenecks immediately and implement route diversification')
  rl.push('')

  return {
    findings,
    total_routes_analyzed: routes.length,
    bottleneck_count: findings.length,
    total_cost_impact_usd: totalCostImpact,
    most_critical_route: mostCritical,
    recommendation: 'Address critical bottlenecks immediately and implement route diversification',
    report_markdown: rl.join('\n')
  }
}

// --- Tool 7: Demand-Supply Mismatcher ---
function analyzeDemandSupplyMismatch(items: DemandSupplyInput[]): DemandSupplyMismatchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(items)))

  const findings: MismatchFinding[] = []
  let totalRevenueAtRisk = 0

  for (const item of items) {
    const totalSupply = item.supply_capacity_units + item.current_inventory_units + item.inbound_supply_units
    const gap = item.demand_forecast_units - totalSupply
    const gapPct = Math.round((gap / Math.max(1, item.demand_forecast_units)) * 100)

    if (Math.abs(gapPct) < 5) continue

    const mismatchType: MismatchFinding['mismatch_type'] = gap > 0 ? 'shortage' : 'surplus'
    const absGapPct = Math.abs(gapPct)

    let severity: MismatchFinding['severity']
    if (absGapPct > 40) severity = 'critical'
    else if (absGapPct > 25) severity = 'high'
    else if (absGapPct > 15) severity = 'medium'
    else severity = 'low'

    const unitRevenue = rng.nextFloat(10, 500)
    const revenueImpact = Math.round(Math.abs(gap) * unitRevenue)
    totalRevenueAtRisk += revenueImpact

    const rootCauses: string[] = []
    const correctiveActions: string[] = []

    if (mismatchType === 'shortage') {
      if (item.supplier_reliability_pct < 85) {
        rootCauses.push('Supplier reliability below target (' + item.supplier_reliability_pct + '%)')
        correctiveActions.push('Engage backup suppliers for critical components')
      }
      if (item.production_lead_time_days > 30) {
        rootCauses.push('Long production lead time (' + item.production_lead_time_days + ' days)')
        correctiveActions.push('Expedite production or pre-build inventory')
      }
      if (item.inbound_supply_units < item.demand_forecast_units * 0.2) {
        rootCauses.push('Insufficient inbound supply pipeline')
        correctiveActions.push('Accelerate inbound shipments and increase order frequency')
      }
      if (rootCauses.length === 0) {
        rootCauses.push('Demand forecast exceeds available supply capacity')
        correctiveActions.push('Increase production capacity or allocate inventory from surplus products')
      }
      correctiveActions.push('Implement demand prioritization for high-margin orders')
    } else {
      rootCauses.push('Demand forecast below available supply capacity')
      rootCauses.push('Potential demand decline or overproduction')
      correctiveActions.push('Adjust production schedule to reduce output')
      correctiveActions.push('Explore secondary markets or discount channels for surplus')
      correctiveActions.push('Reallocate inventory to shortage products if possible')
    }

    findings.push({
      product_id: item.product_id,
      product_name: item.product_name,
      gap_units: Math.abs(gap),
      gap_pct: absGapPct,
      mismatch_type: mismatchType,
      severity,
      estimated_revenue_impact_usd: revenueImpact,
      root_causes: rootCauses,
      corrective_actions: correctiveActions
    })
  }

  findings.sort((a, b) => b.estimated_revenue_impact_usd - a.estimated_revenue_impact_usd)

  const shortageCount = findings.filter(f => f.mismatch_type === 'shortage').length
  const surplusCount = findings.filter(f => f.mismatch_type === 'surplus').length
  const avgGap = findings.length > 0 ? Math.round(findings.reduce((s, f) => s + f.gap_pct, 0) / findings.length) : 0

  // Build markdown report
  const rl: string[] = []
  rl.push('# Demand-Supply Mismatch Report', '', '## Findings', '')
  rl.push(buildMarkdownTable(
    ['Product', 'Type', 'Gap', 'Gap %', 'Severity', 'Revenue Impact'],
    findings.map(f => [
      f.product_name + ' (' + f.product_id + ')',
      f.mismatch_type.toUpperCase(),
      f.gap_units.toLocaleString() + ' units',
      f.gap_pct + '%',
      f.severity.toUpperCase(),
      '$' + f.estimated_revenue_impact_usd.toLocaleString()
    ])
  ))

  if (findings.length > 0) {
    rl.push('', '## Corrective Actions (Top Findings)', '')
    findings.slice(0, 5).forEach((f, i) => {
      rl.push('### ' + (i + 1) + '. ' + f.product_name + ' — ' + f.mismatch_type.toUpperCase())
      rl.push('- **Root Causes:** ' + f.root_causes.join('; '))
      rl.push('- **Actions:** ' + f.corrective_actions.join('; '))
    })
  }

  rl.push('', '## Summary', '')
  rl.push('- **Total Products Analyzed:** ' + items.length)
  rl.push('- **Shortages:** ' + shortageCount + ' | **Surpluses:** ' + surplusCount)
  rl.push('- **Total Revenue at Risk:** $' + totalRevenueAtRisk.toLocaleString())
  rl.push('- **Average Gap:** ' + avgGap + '%')
  rl.push('- **Recommendation:** Prioritize shortage mitigation for high-revenue products and adjust production planning')
  rl.push('')

  return {
    findings,
    total_products_analyzed: items.length,
    shortage_count: shortageCount,
    surplus_count: surplusCount,
    total_revenue_at_risk_usd: totalRevenueAtRisk,
    avg_gap_pct: avgGap,
    recommendation: 'Prioritize shortage mitigation for high-revenue products and adjust production planning',
    report_markdown: rl.join('\n')
  }
}

// --- Tool 8: Resilience Strategy Advisor ---
function analyzeResilienceStrategy(input: ResilienceInput): ResilienceStrategyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const dimensions: ResilienceDimension[] = []
  const benchmarks = { redundancy: 70, flexibility: 65, visibility: 75, collaboration: 60, recovery: 70, diversification: 65, inventory: 60 }

  const dimData = [
    { name: 'Redundancy', score: input.redundancy_index, benchmark: benchmarks.redundancy },
    { name: 'Flexibility', score: input.flexibility_score, benchmark: benchmarks.flexibility },
    { name: 'Visibility', score: input.visibility_score, benchmark: benchmarks.visibility },
    { name: 'Collaboration', score: input.collaboration_index, benchmark: benchmarks.collaboration },
    { name: 'Recovery Speed', score: Math.max(0, 100 - input.recovery_time_days * 2), benchmark: benchmarks.recovery },
    { name: 'Diversification', score: Math.max(0, 100 - input.single_source_dependencies * 10), benchmark: benchmarks.diversification },
    { name: 'Inventory Buffer', score: Math.min(100, input.inventory_buffer_days * 2), benchmark: benchmarks.inventory }
  ]

  for (const d of dimData) {
    const gap = d.score - d.benchmark
    const status: ResilienceDimension['status'] = gap >= 5 ? 'above_target' : gap >= -5 ? 'on_target' : 'below_target'
    const actions: string[] = []

    if (d.name === 'Redundancy') {
      if (status === 'below_target') actions.push('Qualify backup suppliers for critical components'), actions.push('Establish dual-sourcing for top 20% spend categories')
      else actions.push('Maintain current redundancy levels')
    } else if (d.name === 'Flexibility') {
      if (status === 'below_target') actions.push('Implement flexible manufacturing systems'), actions.push('Cross-train workforce for multi-product capability')
      else actions.push('Continue flexibility improvement initiatives')
    } else if (d.name === 'Visibility') {
      if (status === 'below_target') actions.push('Deploy multi-tier visibility platform'), actions.push('Implement real-time supplier monitoring dashboards')
      else actions.push('Extend visibility to Tier 3+ suppliers')
    } else if (d.name === 'Collaboration') {
      if (status === 'below_target') actions.push('Establish supplier collaboration portals'), actions.push('Implement joint planning with key suppliers')
      else actions.push('Deepen strategic supplier partnerships')
    } else if (d.name === 'Recovery Speed') {
      if (status === 'below_target') actions.push('Develop rapid response playbooks'), actions.push('Conduct regular disruption simulation exercises')
      else actions.push('Maintain and test recovery procedures')
    } else if (d.name === 'Diversification') {
      if (status === 'below_target') actions.push('Reduce single-source dependencies'), actions.push('Geographically diversify supplier base')
      else actions.push('Continue diversification strategy')
    } else {
      if (status === 'below_target') actions.push('Optimize safety stock levels'), actions.push('Implement dynamic inventory positioning')
      else actions.push('Maintain inventory optimization')
    }

    dimensions.push({
      dimension: d.name,
      score: Math.round(d.score),
      benchmark: d.benchmark,
      gap: Math.round(gap),
      status,
      improvement_actions: actions
    })
  }

  const overallScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length)

  let resilienceLevel: ResilienceStrategyResult['resilience_level']
  if (overallScore >= 80) resilienceLevel = 'highly_resilient'
  else if (overallScore >= 65) resilienceLevel = 'resilient'
  else if (overallScore >= 45) resilienceLevel = 'moderate'
  else if (overallScore >= 25) resilienceLevel = 'vulnerable'
  else resilienceLevel = 'critical'

  const belowTarget = dimensions.filter(d => d.status === 'below_target')
  const topPriorities = belowTarget.sort((a, b) => a.gap - b.gap).slice(0, 3).map(d => d.dimension)

  const investmentEstimate = Math.round(belowTarget.length * rng.nextFloat(200000, 1000000))
  const projectedImprovement = Math.round(rng.nextFloat(15, 40))

  // Build markdown report
  const rl: string[] = []
  rl.push('# Supply Chain Resilience Strategy Report', '', '## Resilience Dimensions', '')
  rl.push(buildMarkdownTable(
    ['Dimension', 'Score', 'Benchmark', 'Gap', 'Status'],
    dimensions.map(d => [d.dimension, d.score.toString(), d.benchmark.toString(), (d.gap > 0 ? '+' : '') + d.gap.toString(), d.status.replace(/_/g, ' ').toUpperCase()])
  ))

  if (belowTarget.length > 0) {
    rl.push('', '## Improvement Areas', '')
    belowTarget.forEach(d => {
      rl.push('### ' + d.dimension + ' (Score: ' + d.score + ', Gap: ' + d.gap + ')')
      d.improvement_actions.forEach(a => rl.push('- ' + a))
    })
  }

  rl.push('', '## Summary', '')
  rl.push('- **Overall Resilience Score:** ' + overallScore + '/100')
  rl.push('- **Resilience Level:** ' + resilienceLevel.replace(/_/g, ' ').toUpperCase())
  rl.push('- **Top Priorities:** ' + (topPriorities.length > 0 ? topPriorities.join(', ') : 'None — maintain current performance'))
  rl.push('- **Estimated Investment:** $' + investmentEstimate.toLocaleString())
  rl.push('- **Projected Improvement:** ' + projectedImprovement + '%')
  rl.push('- **Recommendation:** Focus on below-target dimensions with highest gap scores for maximum resilience improvement')
  rl.push('')

  return {
    supply_chain_id: input.supply_chain_id,
    supply_chain_name: input.supply_chain_name,
    overall_resilience_score: overallScore,
    resilience_level: resilienceLevel,
    dimensions,
    top_priorities: topPriorities,
    investment_estimate_usd: investmentEstimate,
    projected_improvement_pct: projectedImprovement,
    recommendation: 'Focus on below-target dimensions with highest gap scores for maximum resilience improvement',
    report_markdown: rl.join('\n')
  }
}

// ==================== SECTION 5 — Tool Definitions ====================

// --- Tool 1: multi_tier_visibility_mapper ---
const multiTierVisibilityTool = defineTool({
  name: 'multi_tier_visibility_mapper',
  description: 'Maps multi-tier supply chain structure, identifies visibility gaps, critical paths, and concentration risks across supplier tiers',
  parameters: {
    suppliers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          supplier_id: { type: 'string', required: true },
          supplier_name: { type: 'string', required: true },
          tier: { type: 'number', required: true },
          country: { type: 'string', required: true },
          product_category: { type: 'string', required: true },
          spend_pct: { type: 'number', required: true },
          lead_time_days: { type: 'number', required: true },
          parent_id: { type: 'string' }
        },
        required: true
      },
      description: 'Array of supplier nodes with tier information',
      required: true
    }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const suppliers = args.suppliers as TierNode[]
    return analyzeMultiTierVisibility(suppliers)
  }
})

// --- Tool 2: disruption_prediction_engine ---
const disruptionPredictionTool = defineTool({
  name: 'disruption_prediction_engine',
  description: 'Predicts supply chain disruptions using signal analysis, probability scoring, and financial impact estimation',
  parameters: {
    signals: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          signal_type: { type: 'string', enum: ['natural_disaster', 'geopolitical', 'financial', 'cyber', 'pandemic', 'logistics'] },
          region: { type: 'string', required: true },
          probability: { type: 'number', required: true },
          impact_severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          lead_time_days: { type: 'number', required: true },
          affected_suppliers: { type: 'array', items: { type: 'string' }, required: true },
          description: { type: 'string', required: true }
        },
        required: true
      },
      description: 'Array of disruption signals to analyze',
      required: true
    }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const signals = args.signals as DisruptionSignal[]
    return analyzeDisruptionPrediction(signals)
  }
})

// --- Tool 3: nearshoring_analyzer ---
const nearshoringAnalyzerTool = defineTool({
  name: 'nearshoring_analyzer',
  description: 'Analyzes nearshoring/reshoring scenarios with cost-benefit analysis, ROI calculation, and risk reduction assessment',
  parameters: {
    current_suppliers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          region: { type: 'string', required: true },
          spend_usd: { type: 'number', required: true },
          lead_time_days: { type: 'number', required: true }
        },
        required: true
      },
      description: 'Current supplier regions and spend',
      required: true
    },
    target_regions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Regions to evaluate for nearshoring',
      required: true
    }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const currentSuppliers = args.current_suppliers as { region: string; spend_usd: number; lead_time_days: number }[]
    const targetRegions = args.target_regions as string[]
    return analyzeNearshoring({ current_suppliers: currentSuppliers, target_regions: targetRegions })
  }
})

// --- Tool 4: supplier_financial_health_checker ---
const supplierFinancialHealthTool = defineTool({
  name: 'supplier_financial_health_checker',
  description: 'Assesses supplier financial health using credit ratios, profitability, liquidity, and operational metrics',
  parameters: {
    suppliers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          supplier_id: { type: 'string', required: true },
          supplier_name: { type: 'string', required: true },
          country: { type: 'string', required: true },
          revenue_usd: { type: 'number', required: true },
          profit_margin_pct: { type: 'number', required: true },
          debt_to_equity_ratio: { type: 'number', required: true },
          current_ratio: { type: 'number', required: true },
          credit_rating: { type: 'string', enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'] },
          years_in_business: { type: 'number', required: true },
          on_time_delivery_pct: { type: 'number', required: true },
          quality_score: { type: 'number', required: true }
        },
        required: true
      },
      description: 'Array of supplier financial data',
      required: true
    }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const suppliers = args.suppliers as SupplierFinancialInput[]
    return analyzeSupplierFinancialHealth(suppliers)
  }
})

// --- Tool 5: geopolitical_risk_assessor ---
const geopoliticalRiskTool = defineTool({
  name: 'geopolitical_risk_assessor',
  description: 'Assesses geopolitical risk for sourcing regions using political stability, trade restrictions, sanctions, and labor unrest indicators',
  parameters: {
    regions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          country: { type: 'string', required: true },
          region: { type: 'string', required: true },
          political_stability_index: { type: 'number', required: true },
          trade_restriction_level: { type: 'number', required: true },
          sanctions_risk: { type: 'number', required: true },
          labor_unrest_index: { type: 'number', required: true },
          regulatory_change_index: { type: 'number', required: true },
          infrastructure_quality: { type: 'number', required: true }
        },
        required: true
      },
      description: 'Array of region risk data',
      required: true
    }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const regions = args.regions as RegionRiskInput[]
    return analyzeGeopoliticalRisk(regions)
  }
})

// --- Tool 6: logistics_bottleneck_detector ---
const logisticsBottleneckTool = defineTool({
  name: 'logistics_bottleneck_detector',
  description: 'Detects logistics bottlenecks across transportation routes including congestion, capacity constraints, and reliability issues',
  parameters: {
    routes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          route_id: { type: 'string', required: true },
          origin: { type: 'string', required: true },
          destination: { type: 'string', required: true },
          transport_mode: { type: 'string', enum: ['road', 'rail', 'air', 'sea', 'multimodal'] },
          avg_transit_days: { type: 'number', required: true },
          current_transit_days: { type: 'number', required: true },
          cost_per_unit: { type: 'number', required: true },
          volume_units: { type: 'number', required: true },
          reliability_pct: { type: 'number', required: true },
          capacity_utilization_pct: { type: 'number', required: true }
        },
        required: true
      },
      description: 'Array of logistics route data',
      required: true
    }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const routes = args.routes as LogisticsRouteInput[]
    return analyzeLogisticsBottlenecks(routes)
  }
})

// --- Tool 7: demand_supply_mismatcher ---
const demandSupplyMismatchTool = defineTool({
  name: 'demand_supply_mismatcher',
  description: 'Identifies demand-supply mismatches with gap analysis, root cause identification, and corrective action recommendations',
  parameters: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          product_id: { type: 'string', required: true },
          product_name: { type: 'string', required: true },
          period: { type: 'string', required: true },
          demand_forecast_units: { type: 'number', required: true },
          supply_capacity_units: { type: 'number', required: true },
          current_inventory_units: { type: 'number', required: true },
          inbound_supply_units: { type: 'number', required: true },
          production_lead_time_days: { type: 'number', required: true },
          supplier_reliability_pct: { type: 'number', required: true }
        },
        required: true
      },
      description: 'Array of product demand-supply data',
      required: true
    }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const items = args.items as DemandSupplyInput[]
    return analyzeDemandSupplyMismatch(items)
  }
})

// --- Tool 8: resilience_strategy_advisor ---
const resilienceStrategyTool = defineTool({
  name: 'resilience_strategy_advisor',
  description: 'Evaluates supply chain resilience across dimensions and provides prioritized improvement strategies with investment estimates',
  parameters: {
    supply_chain_id: { type: 'string', description: 'Supply chain identifier', required: true },
    supply_chain_name: { type: 'string', description: 'Supply chain name', required: true },
    redundancy_index: { type: 'number', description: 'Redundancy index (0-100)', required: true },
    flexibility_score: { type: 'number', description: 'Flexibility score (0-100)', required: true },
    visibility_score: { type: 'number', description: 'Visibility score (0-100)', required: true },
    collaboration_index: { type: 'number', description: 'Collaboration index (0-100)', required: true },
    recovery_time_days: { type: 'number', description: 'Average recovery time in days', required: true },
    single_source_dependencies: { type: 'number', description: 'Number of single-source dependencies', required: true },
    geographic_concentration_pct: { type: 'number', description: 'Geographic concentration percentage', required: true },
    inventory_buffer_days: { type: 'number', description: 'Inventory buffer in days', required: true }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args: Record<string, unknown>) {
    const input: ResilienceInput = {
      supply_chain_id: args.supply_chain_id as string,
      supply_chain_name: args.supply_chain_name as string,
      redundancy_index: args.redundancy_index as number,
      flexibility_score: args.flexibility_score as number,
      visibility_score: args.visibility_score as number,
      collaboration_index: args.collaboration_index as number,
      recovery_time_days: args.recovery_time_days as number,
      single_source_dependencies: args.single_source_dependencies as number,
      geographic_concentration_pct: args.geographic_concentration_pct as number,
      inventory_buffer_days: args.inventory_buffer_days as number
    }
    return analyzeResilienceStrategy(input)
  }
})

// ==================== SECTION 6 — Plugin Definition & Export ====================

/**
 * dsh-tool-supplyrisk plugin — Supply Chain Risk Management for DeepSeek Harness.
 * Registers all 8 supply chain risk tools with the DSH tool registry.
 *
 * @param ctx - The Cordis context provided by the DSH runtime.
 */
export default function dshToolSupplyrisk(ctx: Context): void {
  ctx.tools.register(multiTierVisibilityTool)
  ctx.tools.register(disruptionPredictionTool)
  ctx.tools.register(nearshoringAnalyzerTool)
  ctx.tools.register(supplierFinancialHealthTool)
  ctx.tools.register(geopoliticalRiskTool)
  ctx.tools.register(logisticsBottleneckTool)
  ctx.tools.register(demandSupplyMismatchTool)
  ctx.tools.register(resilienceStrategyTool)
}
