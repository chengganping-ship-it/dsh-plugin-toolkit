/**
 * DSH Supply Chain Risk Early Warning System Plugin v0.1.0
 *
 * Comprehensive supply chain risk monitoring and resilience toolkit for DeepSeek Harness Agent.
 * Designed for supply chain managers, procurement officers, and risk analysts.
 *
 * Features (v0.1.0):
 * - Supplier Health Scorer (financial and operational health assessment)
 * - Geopolitical Risk Mapper (regional risk heat map with mitigation)
 * - Disruption Early Warning (predictive disruption alerts with actions)
 * - Alternative Supplier Finder (ranked alternatives with switching costs)
 * - Logistics Bottleneck Detector (route analysis with alternatives)
 * - Cost Volatility Tracker (input cost volatility with hedging)
 * - Single Source Detector (dependency analysis with diversification plans)
 * - Supply Chain Resilience Scorer (overall resilience with roadmap)
 *
 * @module dsh-tool-supplyrisk
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-supplyrisk'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface SupplierData {
  supplier_id: string
  name: string
  country: string
  revenue: number
  profit_margin: number
  debt_ratio: number
  on_time_delivery: number
  quality_score: number
  years_in_business: number
}

interface RegionData {
  country: string
  region: string
  political_stability_index: number
  trade_restriction_level: number
  sanctions_risk: number
  labor_risk: number
}

interface DisruptionIndicator {
  indicator_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  region: string
  affected_suppliers: string[]
  lead_time_days: number
  probability: number
}

interface SupplierRequirements {
  product_category: string
  required_volume: number
  quality_standard: string
  preferred_regions: string[]
  max_cost_premium: number
}

interface LogisticsRoute {
  route: string
  transport_mode: string
  avg_transit_time: number
  current_transit_time: number
  cost_change_pct: number
  reliability_score: number
}

interface CostInputData {
  input_name: string
  monthly_prices: number[]
  supplier_concentration: number
  demand_growth: number
  substitute_availability: number
}

interface SourcingData {
  product_id: string
  supplier_id: string
  is_single_source: boolean
  annual_spend: number
  switching_lead_time: number
  inventory_days: number
}

interface ResilienceData {
  redundancy_index: number
  flexibility_score: number
  visibility_score: number
  collaboration_index: number
  recovery_time_days: number
}

// ==================== TOOL 1: SUPPLIER HEALTH SCORER ====================

interface SupplierHealthResult {
  scores: Array<{
    supplier_id: string
    name: string
    country: string
    financial_score: number
    operational_score: number
    overall_score: number
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    risk_flags: string[]
    recommendations: string[]
  }>
  summary: {
    total_scored: number
    healthy_count: number
    at_risk_count: number
    critical_count: number
    avg_overall_score: number
  }
}

function scoreSupplierHealth(suppliers: SupplierData[]): SupplierHealthResult {
  const scores: SupplierHealthResult['scores'] = []

  for (const s of suppliers) {
    const risk_flags: string[] = []
    const recommendations: string[] = []

    // Financial score (0-100)
    let financial = 50
    if (s.profit_margin > 0.15) financial += 20
    else if (s.profit_margin > 0.08) financial += 10
    else if (s.profit_margin > 0) financial += 0
    else { financial -= 20; risk_flags.push('Negative profit margin') }

    if (s.debt_ratio < 0.3) financial += 15
    else if (s.debt_ratio < 0.5) financial += 5
    else if (s.debt_ratio < 0.7) financial -= 10
    else { financial -= 20; risk_flags.push('High debt ratio') }

    if (s.revenue > 100000000) financial += 10
    else if (s.revenue > 50000000) financial += 5
    else if (s.revenue < 10000000) { financial -= 5; risk_flags.push('Low revenue base') }

    if (s.years_in_business > 15) financial += 5
    else if (s.years_in_business < 3) { financial -= 10; risk_flags.push('Limited operating history') }

    financial = Math.max(0, Math.min(100, financial))

    // Operational score (0-100)
    let operational = 40
    if (s.on_time_delivery > 0.95) operational += 30
    else if (s.on_time_delivery > 0.9) operational += 20
    else if (s.on_time_delivery > 0.8) operational += 5
    else if (s.on_time_delivery > 0.7) operational -= 10
    else { operational -= 20; risk_flags.push('Poor delivery performance') }

    if (s.quality_score > 90) operational += 30
    else if (s.quality_score > 80) operational += 20
    else if (s.quality_score > 70) operational += 10
    else if (s.quality_score > 60) operational -= 5
    else { operational -= 15; risk_flags.push('Below standard quality') }

    if (s.years_in_business > 10) operational += 5
    else if (s.years_in_business < 3) operational -= 5

    operational = Math.max(0, Math.min(100, operational))

    // Overall score
    const overall = Math.round(financial * 0.45 + operational * 0.55)

    let risk_level: SupplierHealthResult['scores'][0]['risk_level']
    if (overall >= 75) {
      risk_level = 'low'
      recommendations.push('Maintain current partnership')
    } else if (overall >= 55) {
      risk_level = 'medium'
      recommendations.push('Monitor quarterly performance')
      recommendations.push('Request improvement plan for weak areas')
    } else if (overall >= 35) {
      risk_level = 'high'
      recommendations.push('Develop contingency sourcing options')
      recommendations.push('Increase inspection frequency')
      recommendations.push('Negotiate performance guarantees')
    } else {
      risk_level = 'critical'
      recommendations.push('URGENT: Identify replacement supplier')
      recommendations.push('Reduce dependency immediately')
      recommendations.push('Audit supplier facilities')
    }

    scores.push({
      supplier_id: s.supplier_id,
      name: s.name,
      country: s.country,
      financial_score: Math.round(financial),
      operational_score: Math.round(operational),
      overall_score: overall,
      risk_level,
      risk_flags,
      recommendations
    })
  }

  scores.sort((a, b) => a.overall_score - b.overall_score)

  return {
    scores,
    summary: {
      total_scored: scores.length,
      healthy_count: scores.filter(s => s.risk_level === 'low').length,
      at_risk_count: scores.filter(s => s.risk_level === 'medium' || s.risk_level === 'high').length,
      critical_count: scores.filter(s => s.risk_level === 'critical').length,
      avg_overall_score: Math.round(scores.reduce((s, r) => s + r.overall_score, 0) / scores.length)
    }
  }
}

function formatSupplierHealthReport(result: SupplierHealthResult): string {
  const lines: string[] = []
  lines.push('## Supplier Health Score Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_scored} suppliers scored`)
  lines.push(`- Healthy: ${result.summary.healthy_count} | At Risk: ${result.summary.at_risk_count} | Critical: ${result.summary.critical_count}`)
  lines.push(`- Average Overall Score: ${result.summary.avg_overall_score}/100`)
  lines.push('')

  lines.push('### Supplier Scores (sorted by risk)')
  lines.push('| Supplier | Country | Financial | Operational | Overall | Risk Level |')
  lines.push('|----------|---------|-----------|-------------|---------|------------|')
  for (const s of result.scores) {
    lines.push(`| ${s.name} (${s.supplier_id}) | ${s.country} | ${s.financial_score}/100 | ${s.operational_score}/100 | ${s.overall_score}/100 | ${s.risk_level.toUpperCase()} |`)
  }

  const flagged = result.scores.filter(s => s.risk_flags.length > 0)
  if (flagged.length > 0) {
    lines.push('')
    lines.push('### Risk Flags')
    for (const s of flagged.slice(0, 10)) {
      lines.push(`**${s.name}** [${s.risk_level.toUpperCase()}]: ${s.risk_flags.join(', ')}`)
    }
  }

  const critical = result.scores.filter(s => s.risk_level === 'critical' || s.risk_level === 'high')
  if (critical.length > 0) {
    lines.push('')
    lines.push('### Recommendations for High-Risk Suppliers')
    for (const s of critical) {
      lines.push(`**${s.name}** (${s.supplier_id}):`)
      for (const r of s.recommendations) {
        lines.push(`  - ${r}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: GEOPOLITICAL RISK MAPPER ====================

interface GeopoliticalResult {
  regions: Array<{
    country: string
    region: string
    composite_risk: number
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    risk_factors: string[]
    mitigating_strategies: string[]
    monitoring_priority: 'routine' | 'elevated' | 'high' | 'urgent'
  }>
  heatmap: {
    most_risky: string[]
    safest: string[]
    avg_composite_risk: number
  }
}

function mapGeopoliticalRisks(regions: RegionData[]): GeopoliticalResult {
  const results: GeopoliticalResult['regions'] = []

  for (const r of regions) {
    const risk_factors: string[] = []
    const mitigating_strategies: string[] = []

    // Composite risk (0-100, higher = more risky)
    let composite = 0

    // Political stability (inverted: lower stability = higher risk)
    if (r.political_stability_index < 30) {
      composite += 30
      risk_factors.push('Severe political instability')
      mitigating_strategies.push('Diversify sourcing away from this region')
      mitigating_strategies.push('Establish safety stock for critical materials')
    } else if (r.political_stability_index < 50) {
      composite += 20
      risk_factors.push('Below-average political stability')
      mitigating_strategies.push('Monitor political developments weekly')
    } else if (r.political_stability_index < 70) {
      composite += 10
      risk_factors.push('Moderate political instability')
      mitigating_strategies.push('Maintain standard monitoring')
    } else {
      composite += 5
    }

    // Trade restrictions
    if (r.trade_restriction_level > 7) {
      composite += 25
      risk_factors.push('Severe trade restrictions/tariffs')
      mitigating_strategies.push('Explore tariff engineering options')
      mitigating_strategies.push('Identify preferential trade agreement routes')
    } else if (r.trade_restriction_level > 4) {
      composite += 15
      risk_factors.push('Moderate trade barriers')
      mitigating_strategies.push('Review incoterms to optimize duty exposure')
    } else if (r.trade_restriction_level > 2) {
      composite += 5
    }

    // Sanctions risk
    if (r.sanctions_risk > 7) {
      composite += 25
      risk_factors.push('Elevated sanctions exposure')
      mitigating_strategies.push('Conduct enhanced due diligence on all transactions')
      mitigating_strategies.push('Establish sanctions compliance review process')
      mitigating_strategies.push('Create contingency for sudden supply cutoff')
    } else if (r.sanctions_risk > 4) {
      composite += 15
      risk_factors.push('Moderate sanctions risk')
      mitigating_strategies.push('Monitor regulatory announcements')
    } else if (r.sanctions_risk > 2) {
      composite += 5
    }

    // Labor risk
    if (r.labor_risk > 7) {
      composite += 20
      risk_factors.push('High labor disruption risk')
      mitigating_strategies.push('Assess alternative labor markets')
      mitigating_strategies.push('Review supplier labor practices')
    } else if (r.labor_risk > 4) {
      composite += 10
      risk_factors.push('Moderate labor risk')
      mitigating_strategies.push('Engage supplier on labor compliance')
    } else if (r.labor_risk > 2) {
      composite += 5
    }

    composite = Math.min(100, composite)

    let risk_level: GeopoliticalResult['regions'][0]['risk_level']
    let monitoring_priority: GeopoliticalResult['regions'][0]['monitoring_priority']
    if (composite >= 70) {
      risk_level = 'critical'
      monitoring_priority = 'urgent'
    } else if (composite >= 50) {
      risk_level = 'high'
      monitoring_priority = 'high'
    } else if (composite >= 30) {
      risk_level = 'medium'
      monitoring_priority = 'elevated'
    } else {
      risk_level = 'low'
      monitoring_priority = 'routine'
    }

    if (risk_factors.length === 0) {
      risk_factors.push('No significant geopolitical risks identified')
      mitigating_strategies.push('Continue routine monitoring')
    }

    results.push({
      country: r.country,
      region: r.region,
      composite_risk: composite,
      risk_level,
      risk_factors,
      mitigating_strategies,
      monitoring_priority
    })
  }

  results.sort((a, b) => b.composite_risk - a.composite_risk)

  return {
    regions: results,
    heatmap: {
      most_risky: results.filter(r => r.risk_level === 'critical' || r.risk_level === 'high').map(r => r.country),
      safest: results.filter(r => r.risk_level === 'low').map(r => r.country),
      avg_composite_risk: Math.round(results.reduce((s, r) => s + r.composite_risk, 0) / results.length)
    }
  }
}

function formatGeopoliticalReport(result: GeopoliticalResult): string {
  const lines: string[] = []
  lines.push('## Geopolitical Risk Heat Map')
  lines.push('')
  lines.push(`**Average Composite Risk:** ${result.heatmap.avg_composite_risk}/100`)
  lines.push(`**High Risk Regions:** ${result.heatmap.most_risky.join(', ') || 'None'}`)
  lines.push(`**Safest Regions:** ${result.heatmap.safest.join(', ') || 'None'}`)
  lines.push('')

  lines.push('### Regional Risk Assessment')
  lines.push('| Country | Region | Composite Risk | Risk Level | Monitoring |')
  lines.push('|---------|--------|----------------|------------|------------|')
  for (const r of result.regions) {
    lines.push(`| ${r.country} | ${r.region} | ${r.composite_risk}/100 | ${r.risk_level.toUpperCase()} | ${r.monitoring_priority.toUpperCase()} |`)
  }

  const highRisk = result.regions.filter(r => r.risk_level === 'high' || r.risk_level === 'critical')
  if (highRisk.length > 0) {
    lines.push('')
    lines.push('### High/Critical Risk Regions - Mitigation Strategies')
    for (const r of highRisk) {
      lines.push(`**${r.country}** (${r.region}) — Risk: ${r.composite_risk}/100`)
      lines.push(`  Risk factors: ${r.risk_factors.join('; ')}`)
      lines.push(`  Mitigation:`)
      for (const m of r.mitigating_strategies) {
        lines.push(`  - ${m}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: DISRUPTION EARLY WARNING ====================

interface DisruptionWarningResult {
  warnings: Array<{
    indicator_type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    region: string
    affected_suppliers_count: number
    lead_time_days: number
    probability: number
    warning_level: 'green' | 'yellow' | 'orange' | 'red'
    recommended_actions: string[]
    timeline: string
  }>
  overall_threat_level: 'low' | 'medium' | 'high' | 'severe'
  immediate_actions: string[]
}

function generateDisruptionWarnings(indicators: DisruptionIndicator[]): DisruptionWarningResult {
  const warnings: DisruptionWarningResult['warnings'] = []
  let maxThreat = 0

  for (const ind of indicators) {
    const riskScore = (ind.probability * 100) * (
      ind.severity === 'critical' ? 1.0 :
      ind.severity === 'high' ? 0.75 :
      ind.severity === 'medium' ? 0.5 : 0.25
    )
    maxThreat = Math.max(maxThreat, riskScore)

    let warning_level: DisruptionWarningResult['warnings'][0]['warning_level']
    const recommended_actions: string[] = []

    if (riskScore > 60) {
      warning_level = 'red'
      recommended_actions.push('Activate crisis management team')
      recommended_actions.push('Contact affected suppliers immediately')
      recommended_actions.push('Evaluate emergency sourcing options')
      recommended_actions.push('Alert downstream customers of potential delays')
    } else if (riskScore > 40) {
      warning_level = 'orange'
      recommended_actions.push('Increase safety stock for affected categories')
      recommended_actions.push('Pre-qualify backup suppliers')
      recommended_actions.push('Review contract force majeure clauses')
    } else if (riskScore > 20) {
      warning_level = 'yellow'
      recommended_actions.push('Monitor indicator developments closely')
      recommended_actions.push('Update disruption response plan')
      recommended_actions.push('Communicate potential risk to stakeholders')
    } else {
      warning_level = 'green'
      recommended_actions.push('Maintain routine monitoring')
      recommended_actions.push('Verify contingency plans are current')
    }

    const timeline = ind.lead_time_days <= 7 ? 'Immediate (within 1 week)' :
      ind.lead_time_days <= 30 ? 'Short-term (1-4 weeks)' :
      ind.lead_time_days <= 90 ? 'Medium-term (1-3 months)' : 'Long-term (>3 months)'

    warnings.push({
      indicator_type: ind.indicator_type,
      severity: ind.severity,
      region: ind.region,
      affected_suppliers_count: ind.affected_suppliers.length,
      lead_time_days: ind.lead_time_days,
      probability: ind.probability,
      warning_level,
      recommended_actions,
      timeline
    })
  }

  warnings.sort((a, b) => {
    const level_order = { red: 0, orange: 1, yellow: 2, green: 3 }
    return level_order[a.warning_level] - level_order[b.warning_level]
  })

  let overall_threat_level: DisruptionWarningResult['overall_threat_level']
  if (maxThreat > 60) overall_threat_level = 'severe'
  else if (maxThreat > 40) overall_threat_level = 'high'
  else if (maxThreat > 20) overall_threat_level = 'medium'
  else overall_threat_level = 'low'

  const immediate_actions: string[] = []
  if (overall_threat_level === 'severe' || overall_threat_level === 'high') {
    immediate_actions.push('Convene supply chain risk committee')
    immediate_actions.push('Assess inventory buffer adequacy')
    immediate_actions.push('Prepare customer communication templates')
    immediate_actions.push('Review insurance coverage for supply disruption')
  } else if (overall_threat_level === 'medium') {
    immediate_actions.push('Update risk dashboard for stakeholders')
    immediate_actions.push('Validate backup supplier contracts')
  } else {
    immediate_actions.push('Continue standard monitoring protocols')
  }

  return { warnings, overall_threat_level, immediate_actions }
}

function formatDisruptionWarningReport(result: DisruptionWarningResult): string {
  const lines: string[] = []
  lines.push('## Disruption Early Warning Report')
  lines.push('')
  lines.push(`**Overall Threat Level:** ${result.overall_threat_level.toUpperCase()}`)
  lines.push('')

  if (result.immediate_actions.length > 0) {
    lines.push('### Immediate Actions Required')
    for (const a of result.immediate_actions) {
      lines.push(`- ${a}`)
    }
    lines.push('')
  }

  const level_emoji = { red: 'RED', orange: 'ORANGE', yellow: 'YELLOW', green: 'GREEN' }
  lines.push('### Warning Details')
  lines.push('| Indicator | Region | Severity | Probability | Lead Time | Warning Level | Timeline |')
  lines.push('|-----------|--------|----------|-------------|-----------|---------------|----------|')
  for (const w of result.warnings) {
    lines.push(`| ${w.indicator_type} | ${w.region} | ${w.severity.toUpperCase()} | ${(w.probability * 100).toFixed(0)}% | ${w.lead_time_days}d | ${level_emoji[w.warning_level]} | ${w.timeline} |`)
  }

  const critical_warnings = result.warnings.filter(w => w.warning_level === 'red' || w.warning_level === 'orange')
  if (critical_warnings.length > 0) {
    lines.push('')
    lines.push('### Critical Warnings - Recommended Actions')
    for (const w of critical_warnings) {
      lines.push(`**${w.indicator_type}** [${level_emoji[w.warning_level]}] — ${w.region} (${w.affected_suppliers_count} suppliers)`)
      for (const a of w.recommended_actions) {
        lines.push(`  - ${a}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: ALTERNATIVE SUPPLIER FINDER ====================

interface AlternativeSupplierResult {
  alternatives: Array<{
    rank: number
    supplier_name: string
    supplier_id: string
    country: string
    match_score: number
    estimated_cost_premium: number
    switching_cost_estimate: number
    qualification_timeline_days: number
    strengths: string[]
    risks: string[]
    recommendation: string
  }>
  summary: {
    total_found: number
    within_budget_count: number
    avg_cost_premium: number
    fastest_qualification: number
  }
}

function findAlternativeSuppliers(
  requirements: SupplierRequirements,
  current_suppliers: Array<{ supplier_id: string; name: string; country: string; quality_rating: number; capacity: number; unit_cost: number }>
): AlternativeSupplierResult {
  // Simulate a database of potential alternative suppliers
  const potential_suppliers = [
    { supplier_name: 'GlobalTech Components', supplier_id: 'ALT-001', country: 'Vietnam', quality_rating: 88, capacity: 50000, unit_cost_multiplier: 0.92 },
    { supplier_name: 'PrecisionParts Ltd', supplier_id: 'ALT-002', country: 'Mexico', quality_rating: 91, capacity: 35000, unit_cost_multiplier: 1.05 },
    { supplier_name: 'ReliableSource Inc', supplier_id: 'ALT-003', country: 'Poland', quality_rating: 85, capacity: 45000, unit_cost_multiplier: 0.98 },
    { supplier_name: 'QualityFirst Manufacturing', supplier_id: 'ALT-004', country: 'India', quality_rating: 82, capacity: 80000, unit_cost_multiplier: 0.88 },
    { supplier_name: 'Apex Supply Co', supplier_id: 'ALT-005', country: 'Thailand', quality_rating: 79, capacity: 60000, unit_cost_multiplier: 0.90 },
    { supplier_name: 'Nordic Precision AB', supplier_id: 'ALT-006', country: 'Sweden', quality_rating: 95, capacity: 25000, unit_cost_multiplier: 1.12 },
    { supplier_name: 'EastWind Industries', supplier_id: 'ALT-007', country: 'Taiwan', quality_rating: 93, capacity: 40000, unit_cost_multiplier: 1.03 },
    { supplier_name: 'Continental Parts GmbH', supplier_id: 'ALT-008', country: 'Germany', quality_rating: 94, capacity: 30000, unit_cost_multiplier: 1.15 },
  ]

  const current_ids = new Set(current_suppliers.map(s => s.supplier_id))
  const avg_current_cost = current_suppliers.length > 0
    ? current_suppliers.reduce((s, c) => s + c.unit_cost, 0) / current_suppliers.length
    : 100

  const alternatives: AlternativeSupplierResult['alternatives'] = []

  for (const ps of potential_suppliers) {
    if (current_ids.has(ps.supplier_id)) continue

    const strengths: string[] = []
    const risks: string[] = []

    // Quality match
    let match_score = 0
    const qualityThreshold = parseInt(requirements.quality_standard) || 80
    if (ps.quality_rating >= qualityThreshold + 10) {
      match_score += 30
      strengths.push('Exceeds quality requirements')
    } else if (ps.quality_rating >= qualityThreshold) {
      match_score += 20
      strengths.push('Meets quality requirements')
    } else if (ps.quality_rating >= qualityThreshold - 5) {
      match_score += 10
      risks.push('Slightly below quality target')
    } else {
      match_score += 0
      risks.push('Below quality requirements')
    }

    // Capacity match
    if (ps.capacity >= requirements.required_volume * 1.5) {
      match_score += 25
      strengths.push('Ample capacity for volume + growth')
    } else if (ps.capacity >= requirements.required_volume) {
      match_score += 15
      strengths.push('Meets volume requirements')
    } else if (ps.capacity >= requirements.required_volume * 0.7) {
      match_score += 8
      risks.push('May need capacity expansion')
    } else {
      risks.push('Insufficient capacity')
    }

    // Region preference
    const in_preferred = requirements.preferred_regions.some(r =>
      ps.country.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(ps.country.toLowerCase())
    )
    if (in_preferred) {
      match_score += 20
      strengths.push('Located in preferred region')
    } else {
      match_score += 5
      risks.push('Outside preferred regions')
    }

    // Cost competitiveness
    const cost_premium = ((ps.unit_cost_multiplier * avg_current_cost - avg_current_cost) / avg_current_cost) * 100
    if (cost_premium <= 0) {
      match_score += 25
      strengths.push('Cost advantage vs current suppliers')
    } else if (cost_premium <= requirements.max_cost_premium) {
      match_score += 15
      strengths.push(`Within cost premium budget (${cost_premium.toFixed(1)}%)`)
    } else if (cost_premium <= requirements.max_cost_premium * 1.5) {
      match_score += 5
      risks.push(`Exceeds cost premium target (${cost_premium.toFixed(1)}%)`)
    } else {
      risks.push(`Significantly over budget (${cost_premium.toFixed(1)}%)`)
    }

    // Risk factors
    const highRiskCountries = ['Myanmar', 'Belarus', 'North Korea']
    if (highRiskCountries.includes(ps.country)) {
      match_score -= 15
      risks.push('High geopolitical risk country')
    }

    // Switching cost estimate (simplified)
    const switching_cost = avg_current_cost * requirements.required_volume * 0.05 +
      (ps.country !== current_suppliers[0]?.country ? 25000 : 5000)

    // Qualification timeline
    const qualification_days = ps.country === current_suppliers[0]?.country ? 30 : 60 + Math.floor(Math.random() * 30)

    let recommendation: string
    if (match_score >= 75) {
      recommendation = 'Strong candidate — initiate qualification'
    } else if (match_score >= 55) {
      recommendation = 'Viable option — request quotation and sample'
    } else if (match_score >= 35) {
      recommendation = 'Potential backup — monitor for improvement'
    } else {
      recommendation = 'Not recommended at this time'
    }

    alternatives.push({
      rank: 0,
      supplier_name: ps.supplier_name,
      supplier_id: ps.supplier_id,
      country: ps.country,
      match_score: Math.max(0, Math.min(100, match_score)),
      estimated_cost_premium: cost_premium,
      switching_cost_estimate: Math.round(switching_cost),
      qualification_timeline_days: qualification_days,
      strengths,
      risks,
      recommendation
    })
  }

  alternatives.sort((a, b) => b.match_score - a.match_score)
  alternatives.forEach((a, i) => { a.rank = i + 1 })

  const within_budget = alternatives.filter(a => a.estimated_cost_premium <= requirements.max_cost_premium)

  return {
    alternatives,
    summary: {
      total_found: alternatives.length,
      within_budget_count: within_budget.length,
      avg_cost_premium: Math.round(alternatives.reduce((s, a) => s + a.estimated_cost_premium, 0) / alternatives.length * 10) / 10,
      fastest_qualification: alternatives.length > 0 ? Math.min(...alternatives.map(a => a.qualification_timeline_days)) : 0
    }
  }
}

function formatAlternativeSupplierReport(result: AlternativeSupplierResult): string {
  const lines: string[] = []
  lines.push('## Alternative Supplier Analysis')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_found} alternatives identified, ${result.summary.within_budget_count} within cost premium budget`)
  lines.push(`- Average Cost Premium: ${result.summary.avg_cost_premium}%`)
  lines.push(`- Fastest Qualification: ${result.summary.fastest_qualification} days`)
  lines.push('')

  lines.push('### Ranked Alternative Suppliers')
  lines.push('| Rank | Supplier | Country | Match Score | Cost Premium | Switching Cost | Qual. Time |')
  lines.push('|------|----------|---------|-------------|--------------|----------------|------------|')
  for (const a of result.alternatives.slice(0, 10)) {
    const premium = a.estimated_cost_premium >= 0 ? `+${a.estimated_cost_premium.toFixed(1)}%` : `${a.estimated_cost_premium.toFixed(1)}%`
    lines.push(`| ${a.rank} | ${a.supplier_name} (${a.supplier_id}) | ${a.country} | ${a.match_score}/100 | ${premium} | $${(a.switching_cost_estimate / 1000).toFixed(0)}K | ${a.qualification_timeline_days}d |`)
  }

  const top = result.alternatives.filter(a => a.match_score >= 60)
  if (top.length > 0) {
    lines.push('')
    lines.push('### Top Recommendations')
    for (const a of top.slice(0, 5)) {
      lines.push(`**${a.rank}. ${a.supplier_name}** (${a.supplier_id}) — Score: ${a.match_score}/100`)
      lines.push(`  Strengths: ${a.strengths.join('; ')}`)
      if (a.risks.length > 0) {
        lines.push(`  Risks: ${a.risks.join('; ')}`)
      }
      lines.push(`  Verdict: ${a.recommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: LOGISTICS BOTTLENECK DETECTOR ====================

interface BottleneckResult {
  bottlenecks: Array<{
    route: string
    transport_mode: string
    severity: 'minor' | 'moderate' | 'severe' | 'critical'
    transit_time_increase_pct: number
    cost_change_pct: number
    reliability_impact: string
    alternative_routes: string[]
    recommended_actions: string[]
  }>
  summary: {
    total_routes_analyzed: number
    bottleneck_count: number
    critical_bottlenecks: number
    avg_transit_increase_pct: number
  }
}

function detectLogisticsBottlenecks(logistics_data: LogisticsRoute[]): BottleneckResult {
  const bottlenecks: BottleneckResult['bottlenecks'] = []

  for (const route of logistics_data) {
    const transit_increase = ((route.current_transit_time - route.avg_transit_time) / route.avg_transit_time) * 100

    if (transit_increase <= 10 && route.cost_change_pct <= 5) continue

    let severity: BottleneckResult['bottlenecks'][0]['severity']
    const alternative_routes: string[] = []
    const recommended_actions: string[] = []

    if (transit_increase > 50 || route.reliability_score < 50) {
      severity = 'critical'
      alternative_routes.push(`Air freight ${route.route} (faster, higher cost)`)
      alternative_routes.push(`Alternative port routing via hub`)
      alternative_routes.push(`Consider nearshoring for this lane`)
      recommended_actions.push('Immediately explore alternative modes')
      recommended_actions.push('Activate backup logistics providers')
      recommended_actions.push('Alert planning team of extended lead times')
    } else if (transit_increase > 30 || route.reliability_score < 70) {
      severity = 'severe'
      alternative_routes.push(`Alternative carrier on ${route.route}`)
      alternative_routes.push(`Consolidated shipments to improve efficiency`)
      recommended_actions.push('Book additional capacity in advance')
      recommended_actions.push('Negotiate priority handling with carriers')
      recommended_actions.push('Review inventory buffers for affected SKUs')
    } else if (transit_increase > 15 || route.reliability_score < 80) {
      severity = 'moderate'
      alternative_routes.push(`Secondary routing option for ${route.route}`)
      recommended_actions.push('Monitor transit times weekly')
      recommended_actions.push('Evaluate carrier performance quarterly')
    } else {
      severity = 'minor'
      recommended_actions.push('Track trends for deterioration signs')
      recommended_actions.push('Benchmark against industry standards')
    }

    const reliability_impact = route.reliability_score >= 90 ? 'Minimal impact on reliability' :
      route.reliability_score >= 75 ? 'Moderate reliability reduction' :
      route.reliability_score >= 60 ? 'Significant reliability issues' : 'Severe reliability breakdown'

    bottlenecks.push({
      route: route.route,
      transport_mode: route.transport_mode,
      severity,
      transit_time_increase_pct: Math.round(transit_increase * 10) / 10,
      cost_change_pct: route.cost_change_pct,
      reliability_impact,
      alternative_routes,
      recommended_actions
    })
  }

  bottlenecks.sort((a, b) => {
    const severity_order = { critical: 0, severe: 1, moderate: 2, minor: 3 }
    return severity_order[a.severity] - severity_order[b.severity]
  })

  return {
    bottlenecks,
    summary: {
      total_routes_analyzed: logistics_data.length,
      bottleneck_count: bottlenecks.length,
      critical_bottlenecks: bottlenecks.filter(b => b.severity === 'critical' || b.severity === 'severe').length,
      avg_transit_increase_pct: bottlenecks.length > 0
        ? Math.round(bottlenecks.reduce((s, b) => s + b.transit_time_increase_pct, 0) / bottlenecks.length * 10) / 10
        : 0
    }
  }
}

function formatBottleneckReport(result: BottleneckResult): string {
  const lines: string[] = []
  lines.push('## Logistics Bottleneck Analysis')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_routes_analyzed} routes analyzed, ${result.summary.bottleneck_count} bottlenecks detected`)
  lines.push(`- Critical/Severe: ${result.summary.critical_bottlenecks}`)
  lines.push(`- Average Transit Increase: ${result.summary.avg_transit_increase_pct}%`)
  lines.push('')

  if (result.bottlenecks.length === 0) {
    lines.push('No significant bottlenecks detected. All routes operating within normal parameters.')
    return lines.join('\n')
  }

  lines.push('### Detected Bottlenecks')
  lines.push('| Route | Mode | Severity | Transit Increase | Cost Change | Reliability |')
  lines.push('|-------|------|----------|------------------|-------------|-------------|')
  for (const b of result.bottlenecks) {
    lines.push(`| ${b.route} | ${b.transport_mode} | ${b.severity.toUpperCase()} | +${b.transit_time_increase_pct}% | ${b.cost_change_pct >= 0 ? '+' : ''}${b.cost_change_pct}% | ${b.reliability_impact} |`)
  }

  const critical = result.bottlenecks.filter(b => b.severity === 'critical' || b.severity === 'severe')
  if (critical.length > 0) {
    lines.push('')
    lines.push('### Critical Bottlenecks - Action Plan')
    for (const b of critical) {
      lines.push(`**${b.route}** [${b.severity.toUpperCase()}]`)
      lines.push(`  Alternative routes: ${b.alternative_routes.join('; ')}`)
      lines.push(`  Recommended actions:`)
      for (const a of b.recommended_actions) {
        lines.push(`  - ${a}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: COST VOLATILITY TRACKER ====================

interface CostVolatilityResult {
  metrics: Array<{
    input_name: string
    volatility_index: number
    volatility_level: 'low' | 'moderate' | 'high' | 'extreme'
    price_trend: 'rising' | 'stable' | 'falling' | 'volatile'
    max_drawdown: number
    avg_price: number
    current_vs_avg_pct: number
    hedging_recommendations: string[]
    risk_factors: string[]
  }>
  summary: {
    total_inputs_tracked: number
    high_volatility_count: number
    avg_volatility_index: number
    most_volatile: string
  }
}

function trackCostVolatility(cost_data: CostInputData[]): CostVolatilityResult {
  const metrics: CostVolatilityResult['metrics'] = []

  for (const item of cost_data) {
    const prices = item.monthly_prices
    if (prices.length < 2) continue

    const avg_price = prices.reduce((s, p) => s + p, 0) / prices.length
    const current_price = prices[prices.length - 1]

    // Standard deviation of returns
    const returns: number[] = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    const avg_return = returns.reduce((s, r) => s + r, 0) / returns.length
    const variance = returns.reduce((s, r) => s + Math.pow(r - avg_return, 2), 0) / returns.length
    const std_dev = Math.sqrt(variance)
    const volatility_index = std_dev * Math.sqrt(12) * 100 // Annualized

    // Max drawdown
    let peak = prices[0]
    let max_dd = 0
    for (const p of prices) {
      if (p > peak) peak = p
      const dd = (peak - p) / peak
      if (dd > max_dd) max_dd = dd
    }

    // Price trend
    const first_half = prices.slice(0, Math.floor(prices.length / 2))
    const second_half = prices.slice(Math.floor(prices.length / 2))
    const first_avg = first_half.reduce((s, p) => s + p, 0) / first_half.length
    const second_avg = second_half.reduce((s, p) => s + p, 0) / second_half.length
    const trend_change = (second_avg - first_avg) / first_avg

    let price_trend: CostVolatilityResult['metrics'][0]['price_trend']
    if (volatility_index > 30) price_trend = 'volatile'
    else if (trend_change > 0.1) price_trend = 'rising'
    else if (trend_change < -0.1) price_trend = 'falling'
    else price_trend = 'stable'

    let volatility_level: CostVolatilityResult['metrics'][0]['volatility_level']
    if (volatility_index > 40) volatility_level = 'extreme'
    else if (volatility_index > 25) volatility_level = 'high'
    else if (volatility_index > 12) volatility_level = 'moderate'
    else volatility_level = 'low'

    const hedging_recommendations: string[] = []
    const risk_factors: string[] = []

    if (item.supplier_concentration > 0.8) {
      risk_factors.push('High supplier concentration')
      hedging_recommendations.push('Diversify supplier base to reduce concentration risk')
    }
    if (item.demand_growth > 0.15) {
      risk_factors.push('Rapid demand growth')
      hedging_recommendations.push('Lock in long-term contracts before further price increases')
    }
    if (item.substitute_availability < 3) {
      risk_factors.push('Limited substitute availability')
      hedging_recommendations.push('Invest in R&D for alternative materials')
    }
    if (volatility_level === 'extreme' || volatility_level === 'high') {
      hedging_recommendations.push('Consider commodity futures or options hedging')
      hedging_recommendations.push('Implement price adjustment clauses in contracts')
    }
    if (item.demand_growth > 0.1 && price_trend === 'rising') {
      hedging_recommendations.push('Build strategic inventory buffer')
    }
    if (hedging_recommendations.length === 0) {
      hedging_recommendations.push('Maintain current procurement strategy')
    }

    metrics.push({
      input_name: item.input_name,
      volatility_index: Math.round(volatility_index * 10) / 10,
      volatility_level,
      price_trend,
      max_drawdown: Math.round(max_dd * 1000) / 10,
      avg_price: Math.round(avg_price * 100) / 100,
      current_vs_avg_pct: Math.round(((current_price - avg_price) / avg_price) * 1000) / 10,
      hedging_recommendations,
      risk_factors
    })
  }

  metrics.sort((a, b) => b.volatility_index - a.volatility_index)

  return {
    metrics,
    summary: {
      total_inputs_tracked: metrics.length,
      high_volatility_count: metrics.filter(m => m.volatility_level === 'high' || m.volatility_level === 'extreme').length,
      avg_volatility_index: Math.round(metrics.reduce((s, m) => s + m.volatility_index, 0) / metrics.length * 10) / 10,
      most_volatile: metrics.length > 0 ? metrics[0].input_name : ''
    }
  }
}

function formatCostVolatilityReport(result: CostVolatilityResult): string {
  const lines: string[] = []
  lines.push('## Cost Volatility Tracker')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_inputs_tracked} inputs tracked`)
  lines.push(`- High/Extreme Volatility: ${result.summary.high_volatility_count}`)
  lines.push(`- Average Volatility Index: ${result.summary.avg_volatility_index}%`)
  lines.push(`- Most Volatile: ${result.summary.most_volatile}`)
  lines.push('')

  lines.push('### Volatility Metrics')
  lines.push('| Input | Volatility Index | Level | Trend | Max Drawdown | Current vs Avg |')
  lines.push('|-------|-----------------|-------|-------|--------------|----------------|')
  for (const m of result.metrics) {
    const vs_avg = m.current_vs_avg_pct >= 0 ? `+${m.current_vs_avg_pct}%` : `${m.current_vs_avg_pct}%`
    lines.push(`| ${m.input_name} | ${m.volatility_index}% | ${m.volatility_level.toUpperCase()} | ${m.price_trend.toUpperCase()} | ${m.max_drawdown}% | ${vs_avg} |`)
  }

  const high_vol = result.metrics.filter(m => m.volatility_level === 'high' || m.volatility_level === 'extreme')
  if (high_vol.length > 0) {
    lines.push('')
    lines.push('### High Volatility Inputs - Hedging Recommendations')
    for (const m of high_vol) {
      lines.push(`**${m.input_name}** [${m.volatility_level.toUpperCase()}] — Volatility: ${m.volatility_index}%, Trend: ${m.price_trend}`)
      if (m.risk_factors.length > 0) {
        lines.push(`  Risk factors: ${m.risk_factors.join('; ')}`)
      }
      for (const h of m.hedging_recommendations) {
        lines.push(`  - ${h}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: SINGLE SOURCE DETECTOR ====================

interface SingleSourceResult {
  dependencies: Array<{
    product_id: string
    supplier_id: string
    is_single_source: boolean
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    annual_spend: number
    switching_lead_time: number
    inventory_days: number
    exposure_score: number
    mitigation_urgency: 'routine' | 'planned' | 'urgent' | 'immediate'
    diversification_plan: string[]
  }>
  summary: {
    total_products_analyzed: number
    single_source_count: number
    total_single_source_spend: number
    avg_switching_lead_time: number
    critical_count: number
  }
}

function detectSingleSource(sourcing_data: SourcingData[]): SingleSourceResult {
  const dependencies: SingleSourceResult['dependencies'] = []

  for (const sd of sourcing_data) {
    if (!sd.is_single_source) {
      dependencies.push({
        product_id: sd.product_id,
        supplier_id: sd.supplier_id,
        is_single_source: false,
        risk_level: 'low',
        annual_spend: sd.annual_spend,
        switching_lead_time: sd.switching_lead_time,
        inventory_days: sd.inventory_days,
        exposure_score: 0,
        mitigation_urgency: 'routine',
        diversification_plan: ['Multiple sources already in place — maintain competition']
      })
      continue
    }

    // Calculate exposure score (0-100)
    let exposure = 40 // Base score for single source

    if (sd.annual_spend > 1000000) exposure += 20
    else if (sd.annual_spend > 500000) exposure += 15
    else if (sd.annual_spend > 100000) exposure += 10
    else if (sd.annual_spend > 50000) exposure += 5

    if (sd.switching_lead_time > 90) exposure += 20
    else if (sd.switching_lead_time > 60) exposure += 15
    else if (sd.switching_lead_time > 30) exposure += 10
    else exposure += 5

    if (sd.inventory_days < 7) exposure += 20
    else if (sd.inventory_days < 14) exposure += 15
    else if (sd.inventory_days < 30) exposure += 10
    else exposure += 5

    exposure = Math.min(100, exposure)

    let risk_level: SingleSourceResult['dependencies'][0]['risk_level']
    let mitigation_urgency: SingleSourceResult['dependencies'][0]['mitigation_urgency']
    const diversification_plan: string[] = []

    if (exposure >= 75) {
      risk_level = 'critical'
      mitigation_urgency = 'immediate'
      diversification_plan.push('URGENT: Identify and qualify at least one alternative supplier')
      diversification_plan.push('Build 30-day safety stock minimum')
      diversification_plan.push('Develop make-or-insource option evaluation')
      diversification_plan.push('Create emergency procurement SOP')
    } else if (exposure >= 55) {
      risk_level = 'high'
      mitigation_urgency = 'urgent'
      diversification_plan.push('Initiate alternative supplier qualification (target: 60 days)')
      diversification_plan.push('Increase safety stock to 21 days minimum')
      diversification_plan.push('Negotiate priority allocation clause with supplier')
      diversification_plan.push('Map supplier sub-tier dependencies')
    } else if (exposure >= 35) {
      risk_level = 'medium'
      mitigation_urgency = 'planned'
      diversification_plan.push('Research potential alternative suppliers')
      diversification_plan.push('Maintain 14-day inventory buffer')
      diversification_plan.push('Include volume flexibility clause in contracts')
    } else {
      risk_level = 'low'
      mitigation_urgency = 'planned'
      diversification_plan.push('Monitor supplier performance regularly')
      diversification_plan.push('Identify potential backup suppliers for future qualification')
    }

    dependencies.push({
      product_id: sd.product_id,
      supplier_id: sd.supplier_id,
      is_single_source: true,
      risk_level,
      annual_spend: sd.annual_spend,
      switching_lead_time: sd.switching_lead_time,
      inventory_days: sd.inventory_days,
      exposure_score: exposure,
      mitigation_urgency,
      diversification_plan
    })
  }

  dependencies.sort((a, b) => b.exposure_score - a.exposure_score)

  const single_source = dependencies.filter(d => d.is_single_source)
  const total_spend = single_source.reduce((s, d) => s + d.annual_spend, 0)
  const avg_lead = single_source.length > 0
    ? Math.round(single_source.reduce((s, d) => s + d.switching_lead_time, 0) / single_source.length)
    : 0

  return {
    dependencies,
    summary: {
      total_products_analyzed: dependencies.length,
      single_source_count: single_source.length,
      total_single_source_spend: total_spend,
      avg_switching_lead_time: avg_lead,
      critical_count: dependencies.filter(d => d.risk_level === 'critical').length
    }
  }
}

function formatSingleSourceReport(result: SingleSourceResult): string {
  const lines: string[] = []
  lines.push('## Single Source Dependency Analysis')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_products_analyzed} products analyzed`)
  lines.push(`- Single Source Dependencies: ${result.summary.single_source_count}`)
  lines.push(`- Total Single-Source Spend: $${(result.summary.total_single_source_spend / 1000000).toFixed(2)}M`)
  lines.push(`- Average Switching Lead Time: ${result.summary.avg_switching_lead_time} days`)
  lines.push(`- Critical Dependencies: ${result.summary.critical_count}`)
  lines.push('')

  const single_sources = result.dependencies.filter(d => d.is_single_source)
  if (single_sources.length > 0) {
    lines.push('### Single Source Dependencies')
    lines.push('| Product | Supplier | Risk Level | Spend | Switch Time | Inventory | Exposure | Urgency |')
    lines.push('|---------|----------|------------|-------|-------------|-----------|----------|---------|')
    for (const d of single_sources) {
      lines.push(`| ${d.product_id} | ${d.supplier_id} | ${d.risk_level.toUpperCase()} | $${(d.annual_spend / 1000).toFixed(0)}K | ${d.switching_lead_time}d | ${d.inventory_days}d | ${d.exposure_score}/100 | ${d.mitigation_urgency.toUpperCase()} |`)
    }

    const critical = single_sources.filter(d => d.risk_level === 'critical' || d.risk_level === 'high')
    if (critical.length > 0) {
      lines.push('')
      lines.push('### Critical/High Risk - Diversification Plans')
      for (const d of critical) {
        lines.push(`**${d.product_id}** [${d.risk_level.toUpperCase()}] — Supplier: ${d.supplier_id}`)
        for (const p of d.diversification_plan) {
          lines.push(`  - ${p}`)
        }
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: SUPPLY CHAIN RESILIENCE SCORER ====================

interface ResilienceResult {
  overall_score: number
  resilience_level: 'fragile' | 'adequate' | 'robust' | 'antifragile'
  dimension_scores: {
    redundancy: { score: number; assessment: string; gaps: string[] }
    flexibility: { score: number; assessment: string; gaps: string[] }
    visibility: { score: number; assessment: string; gaps: string[] }
    collaboration: { score: number; assessment: string; gaps: string[] }
    recovery: { score: number; assessment: string; gaps: string[] }
  }
  strengths: string[]
  vulnerabilities: string[]
  improvement_roadmap: Array<{
    priority: number
    initiative: string
    impact: 'low' | 'medium' | 'high'
    effort: 'low' | 'medium' | 'high'
    timeframe: string
    estimated_score_improvement: number
  }>
}

function scoreResilience(data: ResilienceData): ResilienceResult {
  const dimension_scores: ResilienceResult['dimension_scores'] = {
    redundancy: { score: 0, assessment: '', gaps: [] },
    flexibility: { score: 0, assessment: '', gaps: [] },
    visibility: { score: 0, assessment: '', gaps: [] },
    collaboration: { score: 0, assessment: '', gaps: [] },
    recovery: { score: 0, assessment: '', gaps: [] }
  }

  // Redundancy assessment
  dimension_scores.redundancy.score = Math.round(data.redundancy_index * 100)
  if (data.redundancy_index >= 0.7) {
    dimension_scores.redundancy.assessment = 'Strong multi-source coverage across key categories'
  } else if (data.redundancy_index >= 0.4) {
    dimension_scores.redundancy.assessment = 'Partial redundancy; some critical gaps remain'
    dimension_scores.redundancy.gaps.push('Limited backup suppliers for A-class materials')
  } else {
    dimension_scores.redundancy.assessment = 'Significant single-point-of-failure risks'
    dimension_scores.redundancy.gaps.push('Critical components have no backup source')
    dimension_scores.redundancy.gaps.push('No supplier redundancy strategy implemented')
  }

  // Flexibility assessment
  dimension_scores.flexibility.score = Math.round(data.flexibility_score * 100)
  if (data.flexibility_score >= 0.7) {
    dimension_scores.flexibility.assessment = 'Supply chain can adapt quickly to demand shifts'
  } else if (data.flexibility_score >= 0.4) {
    dimension_scores.flexibility.assessment = 'Moderate flexibility; limited surge capacity'
    dimension_scores.flexibility.gaps.push('Volume adjustment mechanisms are slow')
    dimension_scores.flexibility.gaps.push('Limited cross-training of procurement team')
  } else {
    dimension_scores.flexibility.assessment = 'Rigid supply chain with minimal adaptation ability'
    dimension_scores.flexibility.gaps.push('Fixed-volume contracts limit agility')
    dimension_scores.flexibility.gaps.push('No alternative manufacturing processes qualified')
  }

  // Visibility assessment
  dimension_scores.visibility.score = Math.round(data.visibility_score * 100)
  if (data.visibility_score >= 0.7) {
    dimension_scores.visibility.assessment = 'End-to-end supply chain transparency achieved'
  } else if (data.visibility_score >= 0.4) {
    dimension_scores.visibility.assessment = 'Tier-1 visibility only; sub-tier unknown'
    dimension_scores.visibility.gaps.push('No real-time inventory visibility beyond tier-1')
    dimension_scores.visibility.gaps.push('Limited sub-tier mapping')
  } else {
    dimension_scores.visibility.assessment = 'Significant blind spots in supply chain'
    dimension_scores.visibility.gaps.push('Manual, delayed data collection')
    dimension_scores.visibility.gaps.push('No supplier risk monitoring system')
  }

  // Collaboration assessment
  dimension_scores.collaboration.score = Math.round(data.collaboration_index * 100)
  if (data.collaboration_index >= 0.7) {
    dimension_scores.collaboration.assessment = 'Deep strategic partnerships with key suppliers'
  } else if (data.collaboration_index >= 0.4) {
    dimension_scores.collaboration.assessment = 'Transactional relationships dominate'
    dimension_scores.collaboration.gaps.push('Limited supplier development programs')
    dimension_scores.collaboration.gaps.push('Infrequent joint planning sessions')
  } else {
    dimension_scores.collaboration.assessment = 'Adversarial or purely transactional supplier relationships'
    dimension_scores.collaboration.gaps.push('No collaborative forecasting with suppliers')
    dimension_scores.collaboration.gaps.push('Supplier information sharing is minimal')
  }

  // Recovery assessment
  const recovery_score = Math.max(0, Math.min(1, 1 - (data.recovery_time_days / 365)))
  dimension_scores.recovery.score = Math.round(recovery_score * 100)
  if (data.recovery_time_days <= 7) {
    dimension_scores.recovery.assessment = 'Excellent recovery capability (< 1 week)'
  } else if (data.recovery_time_days <= 30) {
    dimension_scores.recovery.assessment = 'Good recovery capability (1-4 weeks)'
    dimension_scores.recovery.gaps.push('Recovery plans not tested recently')
  } else if (data.recovery_time_days <= 90) {
    dimension_scores.recovery.assessment = 'Moderate recovery; significant disruption duration'
    dimension_scores.recovery.gaps.push('No documented recovery playbooks')
    dimension_scores.recovery.gaps.push('Recovery drills are infrequent')
  } else {
    dimension_scores.recovery.assessment = 'Slow recovery; extended vulnerability window'
    dimension_scores.recovery.gaps.push('No formal business continuity plan')
    dimension_scores.recovery.gaps.push('Recovery dependencies not documented')
  }

  // Overall score
  const overall = Math.round(
    dimension_scores.redundancy.score * 0.25 +
    dimension_scores.flexibility.score * 0.2 +
    dimension_scores.visibility.score * 0.2 +
    dimension_scores.collaboration.score * 0.15 +
    dimension_scores.recovery.score * 0.2
  )

  let resilience_level: ResilienceResult['resilience_level']
  if (overall >= 80) resilience_level = 'antifragile'
  else if (overall >= 60) resilience_level = 'robust'
  else if (overall >= 40) resilience_level = 'adequate'
  else resilience_level = 'fragile'

  const strengths: string[] = []
  const vulnerabilities: string[] = []

  for (const [dim, vals] of Object.entries(dimension_scores)) {
    if (vals.score >= 70) strengths.push(`${dim.charAt(0).toUpperCase() + dim.slice(1)} (${vals.score}/100)`)
    if (vals.score < 50) vulnerabilities.push(`${dim.charAt(0).toUpperCase() + dim.slice(1)} (${vals.score}/100)`)
  }

  // Generate improvement roadmap
  const improvements: Array<{ score: number; initiative: string; impact: 'low' | 'medium' | 'high'; effort: 'low' | 'medium' | 'high'; timeframe: string; improvement: number }> = []

  if (dimension_scores.redundancy.score < 70) {
    improvements.push({ score: dimension_scores.redundancy.score, initiative: 'Implement multi-source strategy for top 20% of spend', impact: 'high', effort: 'high', timeframe: '6-12 months', improvement: 15 })
    improvements.push({ score: dimension_scores.redundancy.score, initiative: 'Qualify backup suppliers for all single-source items', impact: 'high', effort: 'medium', timeframe: '3-6 months', improvement: 10 })
  }
  if (dimension_scores.flexibility.score < 70) {
    improvements.push({ score: dimension_scores.flexibility.score, initiative: 'Negotiate volume flexibility clauses in key contracts', impact: 'medium', effort: 'low', timeframe: '1-3 months', improvement: 8 })
    improvements.push({ score: dimension_scores.flexibility.score, initiative: 'Develop surge capacity agreements with contract manufacturers', impact: 'medium', effort: 'medium', timeframe: '3-6 months', improvement: 7 })
  }
  if (dimension_scores.visibility.score < 70) {
    improvements.push({ score: dimension_scores.visibility.score, initiative: 'Deploy supply chain control tower for real-time visibility', impact: 'high', effort: 'high', timeframe: '6-12 months', improvement: 12 })
    improvements.push({ score: dimension_scores.visibility.score, initiative: 'Map sub-tier supplier network (at least 3 levels deep)', impact: 'medium', effort: 'medium', timeframe: '4-8 months', improvement: 8 })
  }
  if (dimension_scores.collaboration.score < 70) {
    improvements.push({ score: dimension_scores.collaboration.score, initiative: 'Launch supplier development program for strategic partners', impact: 'medium', effort: 'medium', timeframe: '3-6 months', improvement: 7 })
    improvements.push({ score: dimension_scores.collaboration.score, initiative: 'Implement collaborative forecasting (CPFR) with top 10 suppliers', impact: 'medium', effort: 'low', timeframe: '2-4 months', improvement: 6 })
  }
  if (dimension_scores.recovery.score < 70) {
    improvements.push({ score: dimension_scores.recovery.score, initiative: 'Develop and test supply chain continuity playbooks', impact: 'high', effort: 'medium', timeframe: '2-4 months', improvement: 10 })
    improvements.push({ score: dimension_scores.recovery.score, initiative: 'Conduct annual supply chain disruption simulation exercises', impact: 'medium', effort: 'low', timeframe: 'Ongoing', improvement: 5 })
  }

  improvements.sort((a, b) => a.score - b.score)

  const improvement_roadmap = improvements.map((imp, i) => ({
    priority: i + 1,
    initiative: imp.initiative,
    impact: imp.impact,
    effort: imp.effort,
    timeframe: imp.timeframe,
    estimated_score_improvement: imp.improvement
  }))

  return {
    overall_score: overall,
    resilience_level,
    dimension_scores,
    strengths,
    vulnerabilities,
    improvement_roadmap
  }
}

function formatResilienceReport(result: ResilienceResult): string {
  const lines: string[] = []
  lines.push('## Supply Chain Resilience Score')
  lines.push('')
  lines.push(`**Overall Resilience Score:** ${result.overall_score}/100`)
  lines.push(`**Resilience Level:** ${result.resilience_level.toUpperCase()}`)
  lines.push('')

  lines.push('### Dimension Breakdown')
  lines.push('| Dimension | Score | Assessment |')
  lines.push('|-----------|-------|------------|')
  lines.push(`| Redundancy | ${result.dimension_scores.redundancy.score}/100 | ${result.dimension_scores.redundancy.assessment.substring(0, 60)} |`)
  lines.push(`| Flexibility | ${result.dimension_scores.flexibility.score}/100 | ${result.dimension_scores.flexibility.assessment.substring(0, 60)} |`)
  lines.push(`| Visibility | ${result.dimension_scores.visibility.score}/100 | ${result.dimension_scores.visibility.assessment.substring(0, 60)} |`)
  lines.push(`| Collaboration | ${result.dimension_scores.collaboration.score}/100 | ${result.dimension_scores.collaboration.assessment.substring(0, 60)} |`)
  lines.push(`| Recovery | ${result.dimension_scores.recovery.score}/100 | ${result.dimension_scores.recovery.assessment.substring(0, 60)} |`)
  lines.push('')

  if (result.strengths.length > 0) {
    lines.push('### Key Strengths')
    for (const s of result.strengths) {
      lines.push(`+ ${s}`)
    }
    lines.push('')
  }

  if (result.vulnerabilities.length > 0) {
    lines.push('### Key Vulnerabilities')
    for (const v of result.vulnerabilities) {
      lines.push(`- ${v}`)
    }
    lines.push('')
  }

  // Show gaps per dimension
  const dims_with_gaps = Object.entries(result.dimension_scores).filter(([, v]) => v.gaps.length > 0)
  if (dims_with_gaps.length > 0) {
    lines.push('### Identified Gaps')
    for (const [dim, vals] of dims_with_gaps) {
      for (const gap of vals.gaps) {
        lines.push(`- [${dim.toUpperCase()}] ${gap}`)
      }
    }
    lines.push('')
  }

  if (result.improvement_roadmap.length > 0) {
    lines.push('### Improvement Roadmap')
    lines.push('| Priority | Initiative | Impact | Effort | Timeframe | Est. Improvement |')
    lines.push('|----------|------------|--------|--------|-----------|-----------------|')
    for (const r of result.improvement_roadmap.slice(0, 10)) {
      lines.push(`| ${r.priority} | ${r.initiative.substring(0, 50)} | ${r.impact.toUpperCase()} | ${r.effort.toUpperCase()} | ${r.timeframe} | +${r.estimated_score_improvement} pts |`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'supplier_health_scorer',
    description: 'Score supplier financial and operational health based on revenue, profit margin, debt ratio, delivery performance, quality score, and business history. Returns health scores with risk flags and recommendations.',
    parameters: {
      suppliers: { type: 'string', required: true, description: 'JSON array of supplier data objects with fields: supplier_id, name, country, revenue, profit_margin, debt_ratio, on_time_delivery, quality_score, years_in_business' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { suppliers: string }) {
      const data: SupplierData[] = JSON.parse(args.suppliers)
      const result = scoreSupplierHealth(data)
      return formatSupplierHealthReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'geopolitical_risk_mapper',
    description: 'Map geopolitical risks by region based on political stability, trade restrictions, sanctions exposure, and labor risk. Generates a risk heat map with mitigation strategies.',
    parameters: {
      regions: { type: 'string', required: true, description: 'JSON array of region data objects with fields: country, region, political_stability_index (0-100, higher=more stable), trade_restriction_level (0-10), sanctions_risk (0-10), labor_risk (0-10)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { regions: string }) {
      const data: RegionData[] = JSON.parse(args.regions)
      const result = mapGeopoliticalRisks(data)
      return formatGeopoliticalReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'disruption_early_warning',
    description: 'Generate early warnings for potential supply disruptions based on indicators. Returns warning levels (green/yellow/orange/red) with recommended actions and timeline assessment.',
    parameters: {
      indicators: { type: 'string', required: true, description: 'JSON array of disruption indicator objects with fields: indicator_type, severity (low/medium/high/critical), region, affected_suppliers (array), lead_time_days, probability (0-1)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { indicators: string }) {
      const data: DisruptionIndicator[] = JSON.parse(args.indicators)
      const result = generateDisruptionWarnings(data)
      return formatDisruptionWarningReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'alternative_supplier_finder',
    description: 'Find alternative suppliers for risk mitigation. Matches product requirements against potential suppliers and returns ranked alternatives with switching cost estimates.',
    parameters: {
      requirements: { type: 'string', required: true, description: 'JSON object with fields: product_category, required_volume, quality_standard, preferred_regions (array), max_cost_premium (percentage)' },
      current_suppliers: { type: 'string', required: true, description: 'JSON array of current supplier objects with fields: supplier_id, name, country, quality_rating, capacity, unit_cost' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { requirements: string; current_suppliers: string }) {
      const reqs: SupplierRequirements = JSON.parse(args.requirements)
      const curr: Array<{ supplier_id: string; name: string; country: string; quality_rating: number; capacity: number; unit_cost: number }> = JSON.parse(args.current_suppliers)
      const result = findAlternativeSuppliers(reqs, curr)
      return formatAlternativeSupplierReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'logistics_bottleneck_detector',
    description: 'Detect logistics bottlenecks by analyzing transit time changes and cost variations. Identifies bottleneck severity and suggests alternative routes with recommended actions.',
    parameters: {
      logistics_data: { type: 'string', required: true, description: 'JSON array of logistics route objects with fields: route, transport_mode, avg_transit_time (days), current_transit_time (days), cost_change_pct, reliability_score (0-100)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { logistics_data: string }) {
      const data: LogisticsRoute[] = JSON.parse(args.logistics_data)
      const result = detectLogisticsBottlenecks(data)
      return formatBottleneckReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'cost_volatility_tracker',
    description: 'Track cost volatility of key inputs using historical price data. Calculates volatility indices, identifies trends, and provides hedging recommendations.',
    parameters: {
      cost_data: { type: 'string', required: true, description: 'JSON array of cost input objects with fields: input_name, monthly_prices (array), supplier_concentration (0-1), demand_growth (decimal), substitute_availability (0-10)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { cost_data: string }) {
      const data: CostInputData[] = JSON.parse(args.cost_data)
      const result = trackCostVolatility(data)
      return formatCostVolatilityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'single_source_detector',
    description: 'Detect single-source dependencies across the supply base. Calculates exposure scores, identifies critical dependencies, and generates diversification plans.',
    parameters: {
      sourcing_data: { type: 'string', required: true, description: 'JSON array of sourcing data objects with fields: product_id, supplier_id, is_single_source (boolean), annual_spend, switching_lead_time (days), inventory_days' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { sourcing_data: string }) {
      const data: SourcingData[] = JSON.parse(args.sourcing_data)
      const result = detectSingleSource(data)
      return formatSingleSourceReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'supply_chain_resilience_scorer',
    description: 'Score overall supply chain resilience across five dimensions: redundancy, flexibility, visibility, collaboration, and recovery. Generates an improvement roadmap with prioritized initiatives.',
    parameters: {
      resilience_data: { type: 'string', required: true, description: 'JSON object with fields: redundancy_index (0-1), flexibility_score (0-1), visibility_score (0-1), collaboration_index (0-1), recovery_time_days' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { resilience_data: string }) {
      const data: ResilienceData = JSON.parse(args.resilience_data)
      const result = scoreResilience(data)
      return formatResilienceReport(result)
    }
  }))

  console.log(`[dsh-tool-supplyrisk] Loaded v${VERSION} — Supply Chain Risk Early Warning System with 8 tools`)
  console.log('  Tools: supplier_health_scorer, geopolitical_risk_mapper, disruption_early_warning, alternative_supplier_finder, logistics_bottleneck_detector, cost_volatility_tracker, single_source_detector, supply_chain_resilience_scorer')
}
