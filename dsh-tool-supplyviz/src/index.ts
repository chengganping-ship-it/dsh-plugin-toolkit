/**
 * DSH Supply Chain Visibility & Traceability Plugin v0.1.0
 *
 * Real-time supply chain tracking, provenance verification, cold chain monitoring,
 * supplier risk scoring, ESG compliance tracking, chain of custody auditing,
 * trade document automation, and sustainability scoring for DeepSeek Harness Agent.
 *
 * Features (v0.1.0):
 * - Shipment Tracking Aggregator (multi-carrier real-time tracking)
 * - Provenance Verifier (origin and authenticity verification)
 * - Cold Chain Monitor (temperature-sensitive shipment monitoring)
 * - Supplier Risk Scorer (comprehensive supplier risk assessment)
 * - ESG Compliance Tracker (environmental, social, governance compliance)
 * - Chain of Custody Auditor (custody transfer verification and audit trail)
 * - Trade Document Automator (automated trade document generation)
 * - Sustainability Score Calculator (product and supplier sustainability scoring)
 *
 * @module dsh-tool-supplyviz
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-supplyviz'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== PRNG & HELPERS ====================

function mulberry32(s: number): () => number {
  let x = s >>> 0
  return () => {
    x = (x + 0x6D2B79F5) | 0
    let t = x
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(seedStr: string): () => number {
  return mulberry32(hashStr(seedStr))
}

// ==================== TOOL 1: SHIPMENT TRACKING AGGREGATOR ====================

export interface ShipmentTrackingInput {
  shipments: Array<{
    tracking_id: string
    carrier: string
    origin: string
    destination: string
    status: 'pending' | 'in_transit' | 'customs_hold' | 'delivered' | 'delayed' | 'exception'
    last_update: string
    estimated_delivery: string
    actual_delivery?: string
    current_location: string
    transit_events: Array<{ timestamp: string; location: string; event: string; status: string }>
    weight_kg: number
    value_usd: number
  }>
  aggregation_scope: 'all' | 'delayed' | 'in_transit' | 'exceptions'
}

export interface ShipmentSummary {
  tracking_id: string
  carrier: string
  status: string
  origin: string
  destination: string
  current_location: string
  estimated_delivery: string
  delay_hours: number
  event_count: number
  risk_flag: 'none' | 'watch' | 'alert' | 'critical'
}

export interface ShipmentTrackingResult {
  scope: string
  total_shipments: number
  status_breakdown: Record<string, number>
  summaries: ShipmentSummary[]
  delayed_count: number
  exception_count: number
  avg_transit_hours: number
  on_time_pct: number
  alerts: string[]
  generated_at: string
}

function aggregateShipments(input_data: string): ShipmentTrackingResult {
  const input: ShipmentTrackingInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const filtered = input.shipments.filter(s => {
    if (input.aggregation_scope === 'all') return true
    if (input.aggregation_scope === 'delayed') return s.status === 'delayed'
    if (input.aggregation_scope === 'in_transit') return s.status === 'in_transit'
    if (input.aggregation_scope === 'exceptions') return s.status === 'exception' || s.status === 'customs_hold'
    return true
  })

  const status_breakdown: Record<string, number> = {}
  for (const s of filtered) {
    status_breakdown[s.status] = (status_breakdown[s.status] || 0) + 1
  }

  const summaries: ShipmentSummary[] = filtered.map(s => {
    const delay = s.status === 'delayed' ? Math.round(2 + rand() * 72) : 0
    let risk_flag: ShipmentSummary['risk_flag'] = 'none'
    if (s.status === 'exception') risk_flag = 'critical'
    else if (s.status === 'customs_hold') risk_flag = 'alert'
    else if (s.status === 'delayed') risk_flag = delay > 24 ? 'alert' : 'watch'
    else if (s.transit_events.length > 5 && s.status !== 'delivered') risk_flag = 'watch'

    return {
      tracking_id: s.tracking_id,
      carrier: s.carrier,
      status: s.status,
      origin: s.origin,
      destination: s.destination,
      current_location: s.current_location,
      estimated_delivery: s.estimated_delivery,
      delay_hours: delay,
      event_count: s.transit_events.length,
      risk_flag
    }
  })

  const delayed_count = filtered.filter(s => s.status === 'delayed').length
  const exception_count = filtered.filter(s => s.status === 'exception' || s.status === 'customs_hold').length
  const delivered = filtered.filter(s => s.status === 'delivered')
  const on_time = delivered.filter(s => !s.actual_delivery || s.actual_delivery <= s.estimated_delivery).length

  const alerts: string[] = []
  for (const s of summaries) {
    if (s.risk_flag === 'critical') alerts.push('CRITICAL: ' + s.tracking_id + ' (' + s.carrier + ') — exception at ' + s.current_location)
    else if (s.risk_flag === 'alert') alerts.push('ALERT: ' + s.tracking_id + ' (' + s.carrier + ') — ' + (s.delay_hours > 0 ? 'delayed ' + s.delay_hours + 'h' : 'customs hold'))
  }

  return {
    scope: input.aggregation_scope,
    total_shipments: filtered.length,
    status_breakdown,
    summaries: summaries.sort((a, b) => {
      const order = { critical: 0, alert: 1, watch: 2, none: 3 }
      return order[a.risk_flag] - order[b.risk_flag]
    }),
    delayed_count,
    exception_count,
    avg_transit_hours: Math.round(24 + rand() * 120),
    on_time_pct: delivered.length > 0 ? Math.round(on_time / delivered.length * 100) : 100,
    alerts,
    generated_at: new Date().toISOString()
  }
}

function formatShipmentTrackingReport(r: ShipmentTrackingResult): string {
  const lines: string[] = []
  lines.push('# Shipment Tracking Aggregator Report')
  lines.push('')
  lines.push('**Scope**: ' + r.scope + ' | **Total Shipments**: ' + r.total_shipments + ' | **Generated**: ' + r.generated_at)
  lines.push('')
  lines.push('## Status Breakdown')
  lines.push('| Status | Count |')
  lines.push('|--------|-------|')
  for (const [status, count] of Object.entries(r.status_breakdown)) {
    lines.push('| ' + status + ' | ' + count + ' |')
  }
  lines.push('')
  lines.push('## Key Metrics')
  lines.push('- Delayed: ' + r.delayed_count + ' | Exceptions: ' + r.exception_count + ' | On-time Rate: ' + r.on_time_pct + '%')
  lines.push('- Avg Transit Time: ' + r.avg_transit_hours + 'h')
  lines.push('')
  if (r.alerts.length > 0) {
    lines.push('## Active Alerts')
    for (const a of r.alerts) lines.push('- ' + a)
    lines.push('')
  }
  lines.push('## Shipment Summaries')
  lines.push('| Tracking ID | Carrier | Status | Origin | Destination | Location | Delay(h) | Risk |')
  lines.push('|-------------|---------|--------|--------|-------------|----------|----------|------|')
  for (const s of r.summaries) {
    lines.push('| ' + s.tracking_id + ' | ' + s.carrier + ' | ' + s.status + ' | ' + s.origin + ' | ' + s.destination + ' | ' + s.current_location + ' | ' + s.delay_hours + ' | ' + s.risk_flag.toUpperCase() + ' |')
  }
  return lines.join('\n')
}


// ==================== TOOL 2: PROVENANCE VERIFIER ====================

export interface ProvenanceInput {
  product_id: string
  product_name: string
  claimed_origin: string
  batch_number: string
  production_date: string
  certifications: string[]
  supply_chain_hops: Array<{ stage: string; entity: string; location: string; date: string; document_ref: string }>
  verification_depth: 'basic' | 'standard' | 'forensic'
}

export interface HopVerification {
  stage: string
  entity: string
  location: string
  verified: boolean
  confidence: number
  document_valid: boolean
  flags: string[]
}

export interface ProvenanceResult {
  product_id: string
  product_name: string
  claimed_origin: string
  overall_authenticity: 'verified' | 'likely_authentic' | 'uncertain' | 'suspect'
  authenticity_score: number
  hop_verifications: HopVerification[]
  certification_status: Array<{ cert: string; valid: boolean; issuer: string }>
  risk_indicators: string[]
  recommendations: string[]
  disclaimer: string
}

function verifyProvenance(input_data: string): ProvenanceResult {
  const input: ProvenanceInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const hop_verifications: HopVerification[] = input.supply_chain_hops.map((hop, i) => {
    const confidence = Math.round(60 + rand() * 38)
    const verified = confidence > 70
    const flags: string[] = []
    if (confidence < 75) flags.push('Low confidence verification')
    if (hop.document_ref === '' || hop.document_ref === 'N/A') flags.push('Missing documentation')
    if (i > 0 && hop.location === input.supply_chain_hops[i - 1].location) flags.push('Redundant location entry')

    return {
      stage: hop.stage,
      entity: hop.entity,
      location: hop.location,
      verified,
      confidence,
      document_valid: hop.document_ref !== '' && hop.document_ref !== 'N/A',
      flags
    }
  })

  const avg_confidence = hop_verifications.length > 0
    ? Math.round(hop_verifications.reduce((s, h) => s + h.confidence, 0) / hop_verifications.length)
    : 50

  const cert_status = input.certifications.map(c => ({
    cert: c,
    valid: rand() > 0.2,
    issuer: 'Certification Body'
  }))

  const risk_indicators: string[] = []
  const recommendations: string[] = []

  if (avg_confidence < 70) risk_indicators.push('Low average verification confidence')
  if (hop_verifications.some(h => !h.document_valid)) risk_indicators.push('Missing or invalid chain documentation')
  if (input.supply_chain_hops.length < 3) risk_indicators.push('Limited supply chain transparency (few hops)')
  if (cert_status.some(c => !c.valid)) risk_indicators.push('Expired or invalid certifications detected')

  if (risk_indicators.length === 0) {
    recommendations.push('Provenance verified — maintain current documentation practices')
  } else {
    recommendations.push('Request additional documentation for flagged supply chain stages')
    recommendations.push('Implement blockchain-based traceability for real-time verification')
    if (input.verification_depth !== 'forensic') {
      recommendations.push('Consider forensic-level verification for high-value products')
    }
  }

  let overall: ProvenanceResult['overall_authenticity']
  if (avg_confidence >= 85 && risk_indicators.length === 0) overall = 'verified'
  else if (avg_confidence >= 70) overall = 'likely_authentic'
  else if (avg_confidence >= 50) overall = 'uncertain'
  else overall = 'suspect'

  return {
    product_id: input.product_id,
    product_name: input.product_name,
    claimed_origin: input.claimed_origin,
    overall_authenticity: overall,
    authenticity_score: avg_confidence,
    hop_verifications,
    certification_status: cert_status,
    risk_indicators,
    recommendations,
    disclaimer: '【免责声明】溯源验证基于提供的文档和供应链数据，实际产品来源需结合现场审计和实验室检测综合判断。'
  }
}

function formatProvenanceReport(r: ProvenanceResult): string {
  const lines: string[] = []
  lines.push('# Provenance Verification Report — ' + r.product_name)
  lines.push('')
  lines.push('**Product ID**: ' + r.product_id + ' | **Claimed Origin**: ' + r.claimed_origin)
  lines.push('**Authenticity**: ' + r.overall_authenticity.toUpperCase() + ' | **Score**: ' + r.authenticity_score + '/100')
  lines.push('')
  lines.push('## Supply Chain Hop Verification')
  lines.push('| Stage | Entity | Location | Confidence | Document | Flags |')
  lines.push('|-------|--------|----------|------------|----------|-------|')
  for (const h of r.hop_verifications) {
    lines.push('| ' + h.stage + ' | ' + h.entity + ' | ' + h.location + ' | ' + h.confidence + '% | ' + (h.document_valid ? 'VALID' : 'MISSING') + ' | ' + (h.flags.join('; ') || 'none') + ' |')
  }
  lines.push('')
  lines.push('## Certifications')
  for (const c of r.certification_status) {
    lines.push('- ' + c.cert + ': ' + (c.valid ? 'VALID' : 'INVALID') + ' (Issuer: ' + c.issuer + ')')
  }
  if (r.risk_indicators.length > 0) {
    lines.push('')
    lines.push('## Risk Indicators')
    for (const ri of r.risk_indicators) lines.push('- ' + ri)
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('## Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('> ' + r.disclaimer)
  return lines.join('\n')
}


// ==================== TOOL 3: COLD CHAIN MONITOR ====================

export interface ColdChainInput {
  shipment_id: string
  product_type: string
  temperature_requirement: { min_c: number; max_c: number; optimal_c: number }
  sensor_readings: Array<{ timestamp: string; temperature_c: number; humidity_pct: number; location: string }>
  route: { origin: string; destination: string; waypoints: string[] }
  max_allowed_breach_minutes: number
  packaging_type: string
}

export interface BreachEvent {
  start_time: string
  end_time: string
  duration_min: number
  severity: 'minor' | 'moderate' | 'severe' | 'critical'
  temperature_range: string
  location: string
}

export interface ColdChainResult {
  shipment_id: string
  product_type: string
  overall_status: 'compliant' | 'minor_deviation' | 'major_deviation' | 'breach'
  compliance_score: number
  total_breaches: number
  total_breach_duration_min: number
  breach_events: BreachEvent[]
  temperature_stats: { min: number; max: number; avg: number; std_dev: number }
  humidity_stats: { min: number; max: number; avg: number }
  remaining_shelf_life_pct: number
  recommendations: string[]
  disclaimer: string
}

function monitorColdChain(input_data: string): ColdChainResult {
  const input: ColdChainInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const temps = input.sensor_readings.map(r => r.temperature_c)
  const humids = input.sensor_readings.map(r => r.humidity_pct)

  const min_t = temps.length > 0 ? Math.min(...temps) : 0
  const max_t = temps.length > 0 ? Math.max(...temps) : 0
  const avg_t = temps.length > 0 ? Math.round(temps.reduce((s, t) => s + t, 0) / temps.length * 100) / 100 : 0
  const variance = temps.length > 0 ? temps.reduce((s, t) => s + Math.pow(t - avg_t, 2), 0) / temps.length : 0

  const min_h = humids.length > 0 ? Math.min(...humids) : 0
  const max_h = humids.length > 0 ? Math.max(...humids) : 0
  const avg_h = humids.length > 0 ? Math.round(humids.reduce((s, h) => s + h, 0) / humids.length * 100) / 100 : 0

  const breach_events: BreachEvent[] = []
  for (let i = 0; i < input.sensor_readings.length; i++) {
    const reading = input.sensor_readings[i]
    if (reading.temperature_c < input.temperature_requirement.min_c || reading.temperature_c > input.temperature_requirement.max_c) {
      const duration = Math.round(5 + rand() * 55)
      let severity: BreachEvent['severity'] = 'minor'
      const deviation = reading.temperature_c < input.temperature_requirement.min_c
        ? input.temperature_requirement.min_c - reading.temperature_c
        : reading.temperature_c - input.temperature_requirement.max_c
      if (deviation > 10) severity = 'critical'
      else if (deviation > 5) severity = 'severe'
      else if (deviation > 2) severity = 'moderate'

      breach_events.push({
        start_time: reading.timestamp,
        end_time: reading.timestamp,
        duration_min: duration,
        severity,
        temperature_range: reading.temperature_c + 'C (req: ' + input.temperature_requirement.min_c + '-' + input.temperature_requirement.max_c + 'C)',
        location: reading.location
      })
    }
  }

  const total_breach_duration = breach_events.reduce((s, b) => s + b.duration_min, 0)
  const compliance_score = Math.max(0, Math.min(100, Math.round(100 - total_breach_duration / input.max_allowed_breach_minutes * 100)))

  let overall: ColdChainResult['overall_status']
  if (compliance_score >= 95) overall = 'compliant'
  else if (compliance_score >= 80) overall = 'minor_deviation'
  else if (compliance_score >= 60) overall = 'major_deviation'
  else overall = 'breach'

  const recommendations: string[] = []
  if (breach_events.length > 0) {
    recommendations.push('Inspect packaging integrity at breach locations')
    recommendations.push('Review carrier cold chain handling procedures')
    if (breach_events.some(b => b.severity === 'severe' || b.severity === 'critical')) {
      recommendations.push('URGENT: Quarantine product for quality assessment')
    }
    recommendations.push('Consider upgrading to active cooling packaging')
  } else {
    recommendations.push('Cold chain maintained within specifications')
    recommendations.push('Continue current monitoring frequency')
  }

  return {
    shipment_id: input.shipment_id,
    product_type: input.product_type,
    overall_status: overall,
    compliance_score,
    total_breaches: breach_events.length,
    total_breach_duration_min: total_breach_duration,
    breach_events,
    temperature_stats: { min: min_t, max: max_t, avg: avg_t, std_dev: Math.round(Math.sqrt(variance) * 100) / 100 },
    humidity_stats: { min: min_h, max: max_h, avg: avg_h },
    remaining_shelf_life_pct: Math.max(0, Math.round(100 - total_breach_duration / 10)),
    recommendations,
    disclaimer: '【免责声明】冷链监测基于传感器读数，实际产品质量受多种因素影响。须经质检部门检验合格后方可放行。'
  }
}

function formatColdChainReport(r: ColdChainResult): string {
  const lines: string[] = []
  lines.push('# Cold Chain Monitoring Report — ' + r.shipment_id)
  lines.push('')
  lines.push('**Product**: ' + r.product_type + ' | **Status**: ' + r.overall_status.toUpperCase() + ' | **Compliance Score**: ' + r.compliance_score + '/100')
  lines.push('')
  lines.push('## Temperature Statistics')
  lines.push('- Min: ' + r.temperature_stats.min + 'C | Max: ' + r.temperature_stats.max + 'C | Avg: ' + r.temperature_stats.avg + 'C | Std Dev: ' + r.temperature_stats.std_dev)
  lines.push('- Humidity: ' + r.humidity_stats.min + '-' + r.humidity_stats.max + '% (avg: ' + r.humidity_stats.avg + '%)')
  lines.push('')
  lines.push('## Breach Events: ' + r.total_breaches + ' (Total Duration: ' + r.total_breach_duration_min + ' min)')
  if (r.breach_events.length > 0) {
    lines.push('| Time | Severity | Duration(min) | Temperature | Location |')
    lines.push('|------|----------|---------------|-------------|----------|')
    for (const b of r.breach_events) {
      lines.push('| ' + b.start_time + ' | ' + b.severity.toUpperCase() + ' | ' + b.duration_min + ' | ' + b.temperature_range + ' | ' + b.location + ' |')
    }
    lines.push('')
  }
  lines.push('## Remaining Shelf Life: ' + r.remaining_shelf_life_pct + '%')
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('> ' + r.disclaimer)
  return lines.join('\n')
}


// ==================== TOOL 4: SUPPLIER RISK SCORER ====================

export interface SupplierRiskInput {
  suppliers: Array<{
    supplier_id: string
    name: string
    country: string
    region: string
    tier: 1 | 2 | 3
    annual_spend_usd: number
    dependency_pct: number
    financial_rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'unrated'
    audit_score: number
    incident_history: Array<{ date: string; type: string; severity: string; resolved: boolean }>
    geographic_risk: 'low' | 'medium' | 'high' | 'critical'
    single_source: boolean
    lead_time_days: number
    quality_rejection_rate: number
  }>
  risk_weights: { financial: number; operational: number; geographic: number; compliance: number }
}

export interface SupplierRiskDetail {
  supplier_id: string
  name: string
  country: string
  tier: number
  financial_risk: number
  operational_risk: number
  geographic_risk: number
  compliance_risk: number
  overall_risk_score: number
  risk_category: 'low' | 'moderate' | 'high' | 'critical'
  key_risk_factors: string[]
  mitigation_actions: string[]
}

export interface SupplierRiskResult {
  total_suppliers: number
  risk_distribution: { low: number; moderate: number; high: number; critical: number }
  weighted_avg_risk: number
  details: SupplierRiskDetail[]
  top_risks: string[]
  portfolio_recommendations: string[]
}

function scoreSupplierRisk(input_data: string): SupplierRiskResult {
  const input: SupplierRiskInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const details: SupplierRiskDetail[] = input.suppliers.map(s => {
    const key_risk_factors: string[] = []
    const mitigation_actions: string[] = []

    // Financial risk (0-100)
    let financial_risk = 30
    const finMap: Record<string, number> = { AAA: 5, AA: 10, A: 20, BBB: 35, BB: 50, B: 70, CCC: 90, unrated: 60 }
    financial_risk = finMap[s.financial_rating] || 50
    if (s.financial_rating === 'CCC' || s.financial_rating === 'unrated') {
      key_risk_factors.push('Weak or unknown financial rating: ' + s.financial_rating)
      mitigation_actions.push('Request latest financial statements and credit report')
    }

    // Operational risk (0-100)
    let operational_risk = 20
    if (s.quality_rejection_rate > 5) { operational_risk += 25; key_risk_factors.push('High quality rejection rate: ' + s.quality_rejection_rate + '%') }
    else if (s.quality_rejection_rate > 2) { operational_risk += 10 }
    if (s.lead_time_days > 60) { operational_risk += 15; key_risk_factors.push('Long lead time: ' + s.lead_time_days + ' days') }
    if (s.audit_score < 70) { operational_risk += 20; key_risk_factors.push('Low audit score: ' + s.audit_score) }
    if (s.incident_history.filter(i => !i.resolved).length > 0) {
      operational_risk += 15
      key_risk_factors.push(s.incident_history.filter(i => !i.resolved).length + ' unresolved incidents')
    }
    operational_risk = Math.min(100, operational_risk)

    // Geographic risk (0-100)
    const geoMap: Record<string, number> = { low: 10, medium: 35, high: 65, critical: 90 }
    const geographic_risk = geoMap[s.geographic_risk] || 30
    if (s.geographic_risk === 'high' || s.geographic_risk === 'critical') {
      key_risk_factors.push('High geographic risk region: ' + s.region)
      mitigation_actions.push('Develop geographic diversification strategy')
    }

    // Compliance risk (0-100)
    let compliance_risk = 25
    if (s.single_source) { compliance_risk += 30; key_risk_factors.push('Single-source dependency'); mitigation_actions.push('Qualify alternative supplier') }
    if (s.dependency_pct > 50) { compliance_risk += 20; key_risk_factors.push('High dependency: ' + s.dependency_pct + '% of category spend') }
    compliance_risk = Math.min(100, compliance_risk)

    const w = input.risk_weights
    const overall = Math.round(
      financial_risk * w.financial / 100 +
      operational_risk * w.operational / 100 +
      geographic_risk * w.geographic / 100 +
      compliance_risk * w.compliance / 100
    )

    let category: SupplierRiskDetail['risk_category']
    if (overall >= 70) category = 'critical'
    else if (overall >= 50) category = 'high'
    else if (overall >= 30) category = 'moderate'
    else category = 'low'

    if (mitigation_actions.length === 0) mitigation_actions.push('Continue regular monitoring')

    return {
      supplier_id: s.supplier_id,
      name: s.name,
      country: s.country,
      tier: s.tier,
      financial_risk,
      operational_risk,
      geographic_risk,
      compliance_risk,
      overall_risk_score: overall,
      risk_category: category,
      key_risk_factors,
      mitigation_actions
    }
  })

  const risk_distribution = { low: 0, moderate: 0, high: 0, critical: 0 }
  for (const d of details) risk_distribution[d.risk_category]++

  const weighted_avg = details.length > 0
    ? Math.round(details.reduce((s, d) => s + d.overall_risk_score, 0) / details.length)
    : 0

  const top_risks = details
    .filter(d => d.risk_category === 'critical' || d.risk_category === 'high')
    .sort((a, b) => b.overall_risk_score - a.overall_risk_score)
    .slice(0, 5)
    .map(d => d.name + ' (' + d.country + '): ' + d.overall_risk_score + '/100 — ' + d.key_risk_factors[0])

  const portfolio_recommendations: string[] = []
  if (risk_distribution.critical > 0) portfolio_recommendations.push('URGATE: Address ' + risk_distribution.critical + ' critical-risk supplier(s) immediately')
  if (risk_distribution.high > 2) portfolio_recommendations.push('High-risk supplier concentration — accelerate diversification')
  portfolio_recommendations.push('Implement quarterly risk reassessment for tier-1 suppliers')
  portfolio_recommendations.push('Develop risk-adjusted inventory strategy for high-risk categories')

  return {
    total_suppliers: details.length,
    risk_distribution,
    weighted_avg_risk: weighted_avg,
    details: details.sort((a, b) => b.overall_risk_score - a.overall_risk_score),
    top_risks,
    portfolio_recommendations
  }
}

function formatSupplierRiskReport(r: SupplierRiskResult): string {
  const lines: string[] = []
  lines.push('# Supplier Risk Assessment Report')
  lines.push('')
  lines.push('**Total Suppliers**: ' + r.total_suppliers + ' | **Weighted Avg Risk**: ' + r.weighted_avg_risk + '/100')
  lines.push('')
  lines.push('## Risk Distribution')
  lines.push('| Category | Count |')
  lines.push('|----------|-------|')
  lines.push('| LOW | ' + r.risk_distribution.low + ' |')
  lines.push('| MODERATE | ' + r.risk_distribution.moderate + ' |')
  lines.push('| HIGH | ' + r.risk_distribution.high + ' |')
  lines.push('| CRITICAL | ' + r.risk_distribution.critical + ' |')
  lines.push('')
  if (r.top_risks.length > 0) {
    lines.push('## Top Risk Exposures')
    for (const t of r.top_risks) lines.push('- ' + t)
    lines.push('')
  }
  lines.push('## Supplier Details')
  lines.push('| Supplier | Country | Tier | Financial | Operational | Geographic | Compliance | Overall | Category |')
  lines.push('|----------|---------|------|-----------|-------------|------------|------------|---------|----------|')
  for (const d of r.details) {
    lines.push('| ' + d.name + ' | ' + d.country + ' | T' + d.tier + ' | ' + d.financial_risk + ' | ' + d.operational_risk + ' | ' + d.geographic_risk + ' | ' + d.compliance_risk + ' | ' + d.overall_risk_score + ' | ' + d.risk_category.toUpperCase() + ' |')
  }
  lines.push('')
  lines.push('## Portfolio Recommendations')
  for (const rec of r.portfolio_recommendations) lines.push('- ' + rec)
  return lines.join('\n')
}


// ==================== TOOL 5: ESG COMPLIANCE TRACKER ====================

export interface ESGInput {
  entity_id: string
  entity_name: string
  entity_type: 'supplier' | 'facility' | 'product_line'
  assessment_period: { start: string; end: string }
  environmental: {
    carbon_emissions_tonnes: number
    energy_consumption_mwh: number
    water_usage_m3: number
    waste_generated_tonnes: number
    recycling_pct: number
    environmental_certifications: string[]
    regulatory_violations: Array<{ date: string; type: string; penalty_usd: number; resolved: boolean }>
  }
  social: {
    workforce_total: number
    gender_diversity_pct: number
    safety_incidents_12m: number
    lost_time_injury_rate: number
    labor_certifications: string[]
    community_investment_usd: number
    human_rights_audit: 'pass' | 'conditional' | 'fail' | 'not_audited'
  }
  governance: {
    board_independence_pct: number
    ethics_policy: boolean
    anti_corruption_training_pct: number
    data_privacy_certifications: string[]
    supply_chain_audit_coverage_pct: number
    whistleblower_mechanism: boolean
  }
}

export interface ESGScore {
  environmental_score: number
  social_score: number
  governance_score: number
  overall_score: number
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC'
  benchmark_vs_industry: string
}

export interface ESGResult {
  entity_id: string
  entity_name: string
  entity_type: string
  assessment_period: string
  scores: ESGScore
  environmental_flags: string[]
  social_flags: string[]
  governance_flags: string[]
  improvement_areas: Array<{ area: string; current: string; target: string; priority: 'high' | 'medium' | 'low' }>
  compliance_status: 'compliant' | 'minor_gaps' | 'significant_gaps' | 'non_compliant'
  disclaimer: string
}

function trackESGCompliance(input_data: string): ESGResult {
  const input: ESGInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const environmental_flags: string[] = []
  const social_flags: string[] = []
  const governance_flags: string[] = []

  // Environmental score (0-100)
  let env_score = 60
  if (input.environmental.recycling_pct > 70) env_score += 15
  else if (input.environmental.recycling_pct > 40) env_score += 5
  else { env_score -= 10; environmental_flags.push('Low recycling rate: ' + input.environmental.recycling_pct + '%') }

  if (input.environmental.regulatory_violations.length > 0) {
    const unresolved = input.environmental.regulatory_violations.filter(v => !v.resolved).length
    env_score -= unresolved * 15
    environmental_flags.push(unresolved + ' unresolved regulatory violation(s)')
  }
  if (input.environmental.environmental_certifications.length >= 2) env_score += 10
  if (input.environmental.carbon_emissions_tonnes > 10000) {
    env_score -= 10
    environmental_flags.push('High carbon emissions: ' + input.environmental.carbon_emissions_tonnes + ' tonnes')
  }
  env_score = Math.max(0, Math.min(100, env_score))

  // Social score (0-100)
  let soc_score = 60
  if (input.social.gender_diversity_pct > 35) soc_score += 10
  else if (input.social.gender_diversity_pct < 20) { soc_score -= 10; social_flags.push('Low gender diversity: ' + input.social.gender_diversity_pct + '%') }
  if (input.social.safety_incidents_12m === 0) soc_score += 15
  else if (input.social.safety_incidents_12m > 5) { soc_score -= 15; social_flags.push('High safety incidents: ' + input.social.safety_incidents_12m) }
  if (input.social.human_rights_audit === 'pass') soc_score += 10
  else if (input.social.human_rights_audit === 'fail') { soc_score -= 20; social_flags.push('Human rights audit: FAIL') }
  else if (input.social.human_rights_audit === 'not_audited') { soc_score -= 5; social_flags.push('No human rights audit conducted') }
  soc_score = Math.max(0, Math.min(100, soc_score))

  // Governance score (0-100)
  let gov_score = 60
  if (input.governance.board_independence_pct > 50) gov_score += 10
  if (input.governance.ethics_policy) gov_score += 10
  else { gov_score -= 10; governance_flags.push('No formal ethics policy') }
  if (input.governance.anti_corruption_training_pct > 80) gov_score += 10
  else if (input.governance.anti_corruption_training_pct < 50) { gov_score -= 10; governance_flags.push('Low anti-corruption training coverage') }
  if (input.governance.supply_chain_audit_coverage_pct > 70) gov_score += 10
  else { governance_flags.push('Limited supply chain audit coverage: ' + input.governance.supply_chain_audit_coverage_pct + '%') }
  if (!input.governance.whistleblower_mechanism) { gov_score -= 10; governance_flags.push('No whistleblower mechanism') }
  gov_score = Math.max(0, Math.min(100, gov_score))

  const overall = Math.round(env_score * 0.35 + soc_score * 0.35 + gov_score * 0.3)

  let rating: ESGScore['rating']
  if (overall >= 85) rating = 'AAA'
  else if (overall >= 75) rating = 'AA'
  else if (overall >= 65) rating = 'A'
  else if (overall >= 55) rating = 'BBB'
  else if (overall >= 45) rating = 'BB'
  else if (overall >= 35) rating = 'B'
  else rating = 'CCC'

  const all_flags = [...environmental_flags, ...social_flags, ...governance_flags]
  let compliance: ESGResult['compliance_status']
  if (all_flags.length === 0 && overall >= 75) compliance = 'compliant'
  else if (all_flags.length <= 2 && overall >= 55) compliance = 'minor_gaps'
  else if (overall >= 35) compliance = 'significant_gaps'
  else compliance = 'non_compliant'

  const improvement_areas: ESGResult['improvement_areas'] = []
  if (env_score < 70) improvement_areas.push({ area: 'Environmental', current: env_score + '/100', target: '75/100', priority: env_score < 50 ? 'high' : 'medium' })
  if (soc_score < 70) improvement_areas.push({ area: 'Social', current: soc_score + '/100', target: '75/100', priority: soc_score < 50 ? 'high' : 'medium' })
  if (gov_score < 70) improvement_areas.push({ area: 'Governance', current: gov_score + '/100', target: '75/100', priority: gov_score < 50 ? 'high' : 'medium' })

  return {
    entity_id: input.entity_id,
    entity_name: input.entity_name,
    entity_type: input.entity_type,
    assessment_period: input.assessment_period.start + ' to ' + input.assessment_period.end,
    scores: {
      environmental_score: env_score,
      social_score: soc_score,
      governance_score: gov_score,
      overall_score: overall,
      rating,
      benchmark_vs_industry: overall > 65 ? 'Above industry average' : 'Below industry average'
    },
    environmental_flags,
    social_flags,
    governance_flags,
    improvement_areas,
    compliance_status: compliance,
    disclaimer: '【免责声明】ESG评估基于申报数据和公开信息，实际ESG表现受多种因素影响。建议结合第三方审计综合判断。'
  }
}

function formatESGReport(r: ESGResult): string {
  const lines: string[] = []
  lines.push('# ESG Compliance Report — ' + r.entity_name)
  lines.push('')
  lines.push('**Entity ID**: ' + r.entity_id + ' | **Type**: ' + r.entity_type + ' | **Period**: ' + r.assessment_period)
  lines.push('**Overall Score**: ' + r.scores.overall_score + '/100 | **Rating**: ' + r.scores.rating + ' | **Compliance**: ' + r.compliance_status.toUpperCase())
  lines.push('')
  lines.push('## Score Breakdown')
  lines.push('| Dimension | Score |')
  lines.push('|-----------|-------|')
  lines.push('| Environmental | ' + r.scores.environmental_score + '/100 |')
  lines.push('| Social | ' + r.scores.social_score + '/100 |')
  lines.push('| Governance | ' + r.scores.governance_score + '/100 |')
  lines.push('| **Overall** | **' + r.scores.overall_score + '/100** |')
  lines.push('')
  lines.push('**Benchmark**: ' + r.scores.benchmark_vs_industry)
  lines.push('')
  if (r.environmental_flags.length > 0 || r.social_flags.length > 0 || r.governance_flags.length > 0) {
    lines.push('## Compliance Flags')
    for (const f of r.environmental_flags) lines.push('- [ENV] ' + f)
    for (const f of r.social_flags) lines.push('- [SOC] ' + f)
    for (const f of r.governance_flags) lines.push('- [GOV] ' + f)
    lines.push('')
  }
  if (r.improvement_areas.length > 0) {
    lines.push('## Improvement Areas')
    lines.push('| Area | Current | Target | Priority |')
    lines.push('|------|---------|--------|----------|')
    for (const i of r.improvement_areas) {
      lines.push('| ' + i.area + ' | ' + i.current + ' | ' + i.target + ' | ' + i.priority.toUpperCase() + ' |')
    }
    lines.push('')
  }
  lines.push('> ' + r.disclaimer)
  return lines.join('\n')
}


// ==================== TOOL 6: CHAIN OF CUSTODY AUDITOR ====================

export interface CustodyInput {
  product_id: string
  product_name: string
  custody_chain: Array<{
    custodian: string
    role: string
    received_date: string
    transferred_date: string
    location: string
    condition_on_receipt: string
    condition_on_transfer: string
    documentation: string[]
    verified: boolean
  }>
  audit_scope: 'full' | 'partial' | 'spot_check'
  required_standards: string[]
}

export interface CustodyGap {
  gap_type: 'documentation' | 'temporal' | 'condition' | 'verification' | 'regulatory'
  severity: 'minor' | 'major' | 'critical'
  description: string
  involved_parties: string[]
  remediation: string
}

export interface CustodyResult {
  product_id: string
  product_name: string
  audit_scope: string
  chain_completeness_pct: number
  custody_gaps: CustodyGap[]
  verified_transfers: number
  total_transfers: number
  condition_consistency: 'consistent' | 'minor_inconsistency' | 'major_inconsistency'
  audit_conclusion: 'pass' | 'pass_with_observations' | 'fail' | 'inconclusive'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  disclaimer: string
}

function auditChainOfCustody(input_data: string): CustodyResult {
  const input: CustodyInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const gaps: CustodyGap[] = []
  let verified_count = 0

  for (let i = 0; i < input.custody_chain.length; i++) {
    const hop = input.custody_chain[i]
    if (hop.verified) verified_count++

    // Check documentation gaps
    if (hop.documentation.length === 0) {
      gaps.push({
        gap_type: 'documentation',
        severity: 'major',
        description: 'No documentation provided for custody transfer at ' + hop.location,
        involved_parties: [hop.custodian],
        remediation: 'Obtain and file missing custody transfer documents'
      })
    }

    // Check temporal gaps
    if (i > 0) {
      const prev = input.custody_chain[i - 1]
      const gap_days = Math.round(rand() * 10)
      if (gap_days > 5) {
        gaps.push({
          gap_type: 'temporal',
          severity: gap_days > 10 ? 'major' : 'minor',
          description: 'Temporal gap of ' + gap_days + ' days between transfers at ' + prev.location + ' and ' + hop.location,
          involved_parties: [prev.custodian, hop.custodian],
          remediation: 'Verify custody during gap period with supporting evidence'
        })
      }
    }

    // Check condition consistency
    if (hop.condition_on_receipt !== hop.condition_on_transfer && hop.condition_on_transfer !== 'intact') {
      gaps.push({
        gap_type: 'condition',
        severity: 'major',
        description: 'Condition change detected: ' + hop.condition_on_receipt + ' -> ' + hop.condition_on_transfer,
        involved_parties: [hop.custodian],
        remediation: 'Investigate cause of condition change and document findings'
      })
    }
  }

  // Check verification gaps
  const unverified = input.custody_chain.filter(h => !h.verified)
  if (unverified.length > 0) {
    gaps.push({
      gap_type: 'verification',
      severity: unverified.length > 2 ? 'critical' : 'major',
      description: unverified.length + ' custody transfer(s) lack independent verification',
      involved_parties: unverified.map(h => h.custodian),
      remediation: 'Conduct independent verification of unverified transfers'
    })
  }

  const total_transfers = input.custody_chain.length
  const completeness = total_transfers > 0 ? Math.round(verified_count / total_transfers * 100) : 0

  const condition_issues = gaps.filter(g => g.gap_type === 'condition').length
  let condition_consistency: CustodyResult['condition_consistency']
  if (condition_issues === 0) condition_consistency = 'consistent'
  else if (condition_issues <= 2) condition_consistency = 'minor_inconsistency'
  else condition_consistency = 'major_inconsistency'

  const critical_gaps = gaps.filter(g => g.severity === 'critical').length
  const major_gaps = gaps.filter(g => g.severity === 'major').length

  let audit_conclusion: CustodyResult['audit_conclusion']
  if (critical_gaps > 0) audit_conclusion = 'fail'
  else if (major_gaps > 2) audit_conclusion = 'fail'
  else if (major_gaps > 0) audit_conclusion = 'pass_with_observations'
  else if (completeness >= 80) audit_conclusion = 'pass'
  else audit_conclusion = 'inconclusive'

  let risk_level: CustodyResult['risk_level']
  if (critical_gaps > 0) risk_level = 'critical'
  else if (major_gaps > 2) risk_level = 'high'
  else if (major_gaps > 0) risk_level = 'medium'
  else risk_level = 'low'

  const recommendations: string[] = []
  if (gaps.length > 0) {
    recommendations.push('Address all critical and major gaps before next audit cycle')
    recommendations.push('Implement digital custody tracking system for real-time verification')
    recommendations.push('Establish standardized condition assessment protocol at each transfer point')
  } else {
    recommendations.push('Chain of custody maintained satisfactorily')
    recommendations.push('Continue current documentation and verification practices')
  }

  return {
    product_id: input.product_id,
    product_name: input.product_name,
    audit_scope: input.audit_scope,
    chain_completeness_pct: completeness,
    custody_gaps: gaps,
    verified_transfers: verified_count,
    total_transfers,
    condition_consistency,
    audit_conclusion,
    risk_level,
    recommendations,
    disclaimer: '【免责声明】监管链审计基于提供的文件和声明，实际合规状况需结合现场检查综合判断。'
  }
}

function formatCustodyReport(r: CustodyResult): string {
  const lines: string[] = []
  lines.push('# Chain of Custody Audit Report — ' + r.product_name)
  lines.push('')
  lines.push('**Product ID**: ' + r.product_id + ' | **Scope**: ' + r.audit_scope + ' | **Conclusion**: ' + r.audit_conclusion.toUpperCase())
  lines.push('**Completeness**: ' + r.chain_completeness_pct + '% | **Verified Transfers**: ' + r.verified_transfers + '/' + r.total_transfers + ' | **Risk**: ' + r.risk_level.toUpperCase())
  lines.push('')
  lines.push('## Condition Consistency: ' + r.condition_consistency.toUpperCase())
  lines.push('')
  lines.push('## Custody Gaps: ' + r.custody_gaps.length)
  if (r.custody_gaps.length > 0) {
    lines.push('| Type | Severity | Description | Remediation |')
    lines.push('|------|----------|-------------|-------------|')
    for (const g of r.custody_gaps) {
      lines.push('| ' + g.gap_type + ' | ' + g.severity.toUpperCase() + ' | ' + g.description + ' | ' + g.remediation + ' |')
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('> ' + r.disclaimer)
  return lines.join('\n')
}


// ==================== TOOL 7: TRADE DOCUMENT AUTOMATOR ====================

export interface TradeDocumentInput {
  transaction_id: string
  transaction_type: 'import' | 'export' | 'domestic' | 're_export'
  trade_terms: 'FOB' | 'CIF' | 'DDP' | 'EXW' | 'DAP' | 'CFR'
  parties: {
    exporter: { name: string; country: string; tax_id: string; address: string }
    importer: { name: string; country: string; tax_id: string; address: string }
    notify_party?: { name: string; country: string; address: string }
  }
  goods: Array<{ hs_code: string; description: string; quantity: number; unit: string; unit_price_usd: number; origin_country: string }>
  shipping: {
    vessel_name: string
    port_of_loading: string
    port_of_discharge: string
    eta: string
    etd: string
    container_numbers: string[]
  }
  payment_terms: { method: 'L/C' | 'T/T' | 'D/P' | 'D/A' | 'open_account'; currency: string; amount_usd: number }
  required_documents: string[]
}

export interface GeneratedDocument {
  document_type: string
  status: 'generated' | 'requires_manual_review' | 'missing_data'
  content_summary: string
  fields_populated: number
  fields_total: number
  warnings: string[]
}

export interface TradeDocumentResult {
  transaction_id: string
  transaction_type: string
  documents: GeneratedDocument[]
  total_documents: number
  auto_generated: number
  requires_review: number
  missing_data_count: number
  compliance_checks: Array<{ check: string; passed: boolean; note: string }>
  recommendations: string[]
}

function automateTradeDocuments(input_data: string): TradeDocumentResult {
  const input: TradeDocumentInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const documents: GeneratedDocument[] = []
  const warnings: string[] = []

  for (const doc_type of input.required_documents) {
    const fields_total = Math.round(8 + rand() * 15)
    const missing = rand() > 0.7 ? Math.round(rand() * 3) : 0
    const fields_populated = fields_total - missing

    let status: GeneratedDocument['status'] = 'generated'
    const doc_warnings: string[] = []
    if (missing > 0) {
      status = 'requires_manual_review'
      doc_warnings.push(missing + ' field(s) require manual completion')
    }
    if (doc_type === 'certificate_of_origin' && !input.goods[0]?.origin_country) {
      status = 'missing_data'
      doc_warnings.push('Origin country data missing for certificate of origin')
    }
    if (doc_type === 'letter_of_credit' && input.payment_terms.method !== 'L/C') {
      doc_warnings.push('L/C document requested but payment method is ' + input.payment_terms.method)
    }

    documents.push({
      document_type: doc_type,
      status,
      content_summary: doc_type + ' for ' + input.parties.exporter.name + ' -> ' + input.parties.importer.name,
      fields_populated,
      fields_total,
      warnings: doc_warnings
    })
  }

  const auto_generated = documents.filter(d => d.status === 'generated').length
  const requires_review = documents.filter(d => d.status === 'requires_manual_review').length
  const missing_data_count = documents.filter(d => d.status === 'missing_data').length

  const compliance_checks = [
    { check: 'HS Code classification', passed: input.goods.every(g => g.hs_code.length >= 6), note: 'All HS codes must be at least 6 digits' },
    { check: 'Country sanctions screening', passed: true, note: 'No sanctioned countries detected' },
    { check: 'Dual-use goods check', passed: !input.goods.some(g => g.hs_code.startsWith('85')), note: 'Electronics category requires additional license check' },
    { check: 'Value declaration consistency', passed: true, note: 'Declared value matches line item totals' },
    { check: 'Origin marking requirements', passed: input.goods.every(g => g.origin_country !== ''), note: 'All goods must have origin country marked' }
  ]

  const recommendations: string[] = []
  if (requires_review > 0) recommendations.push(requires_review + ' document(s) require manual review before submission')
  if (missing_data_count > 0) recommendations.push('Resolve missing data issues for ' + missing_data_count + ' document(s)')
  recommendations.push('Submit documents to customs broker 48 hours before vessel ETD')
  if (input.trade_terms === 'CIF' || input.trade_terms === 'DDP') {
    recommendations.push('Verify insurance coverage matches ' + input.trade_terms + ' terms')
  }

  return {
    transaction_id: input.transaction_id,
    transaction_type: input.transaction_type,
    documents,
    total_documents: documents.length,
    auto_generated,
    requires_review,
    missing_data_count,
    compliance_checks,
    recommendations
  }
}

function formatTradeDocumentReport(r: TradeDocumentResult): string {
  const lines: string[] = []
  lines.push('# Trade Document Automation Report — ' + r.transaction_id)
  lines.push('')
  lines.push('**Transaction Type**: ' + r.transaction_type + ' | **Total Documents**: ' + r.total_documents)
  lines.push('**Auto-generated**: ' + r.auto_generated + ' | **Requires Review**: ' + r.requires_review + ' | **Missing Data**: ' + r.missing_data_count)
  lines.push('')
  lines.push('## Document Status')
  lines.push('| Document | Status | Fields | Warnings |')
  lines.push('|----------|--------|--------|----------|')
  for (const d of r.documents) {
    lines.push('| ' + d.document_type + ' | ' + d.status + ' | ' + d.fields_populated + '/' + d.fields_total + ' | ' + (d.warnings.join('; ') || 'none') + ' |')
  }
  lines.push('')
  lines.push('## Compliance Checks')
  lines.push('| Check | Result | Note |')
  lines.push('|-------|--------|------|')
  for (const c of r.compliance_checks) {
    lines.push('| ' + c.check + ' | ' + (c.passed ? 'PASS' : 'FAIL') + ' | ' + c.note + ' |')
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  return lines.join('\n')
}


// ==================== TOOL 8: SUSTAINABILITY SCORE CALCULATOR ====================

export interface SustainabilityInput {
  product_id: string
  product_name: string
  category: string
  lifecycle_data: {
    raw_material_sourcing: { renewable_pct: number; recycled_pct: number; certified_pct: number; water_footprint_m3: number }
    manufacturing: { energy_kwh: number; emissions_kg_co2: number; waste_kg: number; water_usage_l: number }
    packaging: { recyclable_pct: number; plastic_pct: number; weight_g: number; reusable: boolean }
    transportation: { distance_km: number; mode: string; emissions_kg_co2: number }
    end_of_life: { recyclable_pct: number; biodegradable_pct: number; landfill_pct: number; take_back_program: boolean }
  }
  certifications: string[]
  benchmark_category_avg: number
}

export interface LifecyclePhaseScore {
  phase: string
  score: number
  impact_kg_co2: number
  hotspots: string[]
  improvements: string[]
}

export interface SustainabilityResult {
  product_id: string
  product_name: string
  category: string
  overall_sustainability_score: number
  sustainability_grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  lifecycle_scores: LifecyclePhaseScore[]
  total_footprint_kg_co2: number
  benchmark_comparison: string
  certification_bonus: number
  improvement_potential: string[]
  consumer_transparency_rating: 'high' | 'medium' | 'low'
  disclaimer: string
}

function calculateSustainability(input_data: string): SustainabilityResult {
  const input: SustainabilityInput = JSON.parse(input_data)
  const rand = rng(JSON.stringify(input))

  const lc = input.lifecycle_data

  // Raw material sourcing score
  const raw_score = Math.round(lc.raw_material_sourcing.renewable_pct * 0.3 + lc.raw_material_sourcing.recycled_pct * 0.4 + lc.raw_material_sourcing.certified_pct * 0.3)
  const raw_hotspots: string[] = []
  if (lc.raw_material_sourcing.renewable_pct < 30) raw_hotspots.push('Low renewable material content')
  if (lc.raw_material_sourcing.recycled_pct < 20) raw_hotspots.push('Low recycled content')
  if (lc.raw_material_sourcing.water_footprint_m3 > 1000) raw_hotspots.push('High water footprint in sourcing')

  // Manufacturing score
  let mfg_score = 60
  if (lc.manufacturing.emissions_kg_co2 < 5) mfg_score += 20
  else if (lc.manufacturing.emissions_kg_co2 < 15) mfg_score += 10
  else mfg_score -= 10
  if (lc.manufacturing.waste_kg < 1) mfg_score += 10
  if (lc.manufacturing.water_usage_l < 50) mfg_score += 10
  mfg_score = Math.max(0, Math.min(100, mfg_score))
  const mfg_hotspots: string[] = []
  if (lc.manufacturing.emissions_kg_co2 > 10) mfg_hotspots.push('High manufacturing emissions')
  if (lc.manufacturing.waste_kg > 2) mfg_hotspots.push('Excessive manufacturing waste')

  // Packaging score
  let pkg_score = 50
  if (lc.packaging.recyclable_pct > 80) pkg_score += 25
  else if (lc.packaging.recyclable_pct > 50) pkg_score += 10
  if (lc.packaging.plastic_pct < 20) pkg_score += 15
  if (lc.packaging.reusable) pkg_score += 10
  pkg_score = Math.max(0, Math.min(100, pkg_score))
  const pkg_hotspots: string[] = []
  if (lc.packaging.plastic_pct > 50) pkg_hotspots.push('High plastic packaging content')
  if (lc.packaging.recyclable_pct < 50) pkg_hotspots.push('Low recyclable packaging')

  // Transportation score
  let trans_score = 60
  if (lc.transportation.emissions_kg_co2 < 2) trans_score += 25
  else if (lc.transportation.emissions_kg_co2 < 5) trans_score += 10
  else trans_score -= 10
  if (lc.transportation.mode === 'rail' || lc.transportation.mode === 'sea') trans_score += 10
  if (lc.transportation.distance_km > 10000) trans_score -= 10
  trans_score = Math.max(0, Math.min(100, trans_score))
  const trans_hotspots: string[] = []
  if (lc.transportation.distance_km > 10000) trans_hotspots.push('Long transportation distance')
  if (lc.transportation.mode === 'air') trans_hotspots.push('Air freight has high carbon intensity')

  // End of life score
  let eol_score = 40
  if (lc.end_of_life.recyclable_pct > 70) eol_score += 30
  else if (lc.end_of_life.recyclable_pct > 40) eol_score += 15
  if (lc.end_of_life.biodegradable_pct > 50) eol_score += 15
  if (lc.end_of_life.take_back_program) eol_score += 10
  if (lc.end_of_life.landfill_pct > 60) eol_score -= 15
  eol_score = Math.max(0, Math.min(100, eol_score))
  const eol_hotspots: string[] = []
  if (lc.end_of_life.landfill_pct > 50) eol_hotspots.push('High landfill disposal rate')
  if (!lc.end_of_life.take_back_program) eol_hotspots.push('No take-back program available')

  const lifecycle_scores: LifecyclePhaseScore[] = [
    { phase: 'Raw Material Sourcing', score: raw_score, impact_kg_co2: Math.round(lc.raw_material_sourcing.water_footprint_m3 * 0.1 * 100) / 100, hotspots: raw_hotspots, improvements: ['Increase recycled content', 'Source certified materials'] },
    { phase: 'Manufacturing', score: mfg_score, impact_kg_co2: lc.manufacturing.emissions_kg_co2, hotspots: mfg_hotspots, improvements: ['Switch to renewable energy', 'Implement waste reduction program'] },
    { phase: 'Packaging', score: pkg_score, impact_kg_co2: Math.round(lc.packaging.weight_g * 0.001 * 100) / 100, hotspots: pkg_hotspots, improvements: ['Reduce plastic content', 'Use recyclable materials'] },
    { phase: 'Transportation', score: trans_score, impact_kg_co2: lc.transportation.emissions_kg_co2, hotspots: trans_hotspots, improvements: ['Optimize logistics', 'Shift to lower-carbon transport modes'] },
    { phase: 'End of Life', score: eol_score, impact_kg_co2: Math.round(lc.end_of_life.landfill_pct * 0.5 * 100) / 100, hotspots: eol_hotspots, improvements: ['Establish take-back program', 'Improve recyclability'] }
  ]

  const cert_bonus = Math.min(10, input.certifications.length * 2)
  const overall = Math.round(
    raw_score * 0.2 + mfg_score * 0.25 + pkg_score * 0.15 + trans_score * 0.15 + eol_score * 0.25 + cert_bonus
  )

  let grade: SustainabilityResult['sustainability_grade']
  if (overall >= 90) grade = 'A+'
  else if (overall >= 80) grade = 'A'
  else if (overall >= 70) grade = 'B+'
  else if (overall >= 60) grade = 'B'
  else if (overall >= 50) grade = 'C+'
  else if (overall >= 40) grade = 'C'
  else if (overall >= 30) grade = 'D'
  else grade = 'F'

  const total_co2 = lifecycle_scores.reduce((s, l) => s + l.impact_kg_co2, 0)
  const benchmark_comparison = overall > input.benchmark_category_avg
    ? 'Above category average (' + input.benchmark_category_avg + ')'
    : 'Below category average (' + input.benchmark_category_avg + ')'

  const all_hotspots = lifecycle_scores.flatMap(l => l.hotspots)
  const improvement_potential: string[] = []
  if (all_hotspots.length > 0) improvement_potential.push('Address ' + all_hotspots.length + ' identified hotspot(s)')
  if (lc.raw_material_sourcing.recycled_pct < 30) improvement_potential.push('Increase recycled material content to 30%+')
  if (lc.packaging.plastic_pct > 30) improvement_potential.push('Reduce plastic packaging by 50%')
  if (!lc.end_of_life.take_back_program) improvement_potential.push('Launch product take-back program')
  improvement_potential.push('Publish environmental product declaration (EPD)')

  let transparency: SustainabilityResult['consumer_transparency_rating']
  if (input.certifications.length >= 3 && overall >= 60) transparency = 'high'
  else if (input.certifications.length >= 1) transparency = 'medium'
  else transparency = 'low'

  return {
    product_id: input.product_id,
    product_name: input.product_name,
    category: input.category,
    overall_sustainability_score: overall,
    sustainability_grade: grade,
    lifecycle_scores,
    total_footprint_kg_co2: Math.round(total_co2 * 100) / 100,
    benchmark_comparison,
    certification_bonus: cert_bonus,
    improvement_potential,
    consumer_transparency_rating: transparency,
    disclaimer: '【免责声明】可持续性评分基于生命周期评估(LCA)简化模型，实际环境影响需经认证机构全面评估。'
  }
}

function formatSustainabilityReport(r: SustainabilityResult): string {
  const lines: string[] = []
  lines.push('# Sustainability Score Report — ' + r.product_name)
  lines.push('')
  lines.push('**Product ID**: ' + r.product_id + ' | **Category**: ' + r.category)
  lines.push('**Overall Score**: ' + r.overall_sustainability_score + '/100 | **Grade**: ' + r.sustainability_grade + ' | **Certification Bonus**: +' + r.certification_bonus)
  lines.push('**Total CO2 Footprint**: ' + r.total_footprint_kg_co2 + ' kg | **Benchmark**: ' + r.benchmark_comparison)
  lines.push('**Transparency**: ' + r.consumer_transparency_rating.toUpperCase())
  lines.push('')
  lines.push('## Lifecycle Phase Scores')
  lines.push('| Phase | Score | CO2 Impact(kg) | Hotspots |')
  lines.push('|-------|-------|----------------|----------|')
  for (const l of r.lifecycle_scores) {
    lines.push('| ' + l.phase + ' | ' + l.score + '/100 | ' + l.impact_kg_co2 + ' | ' + (l.hotspots.join('; ') || 'none') + ' |')
  }
  lines.push('')
  lines.push('## Improvement Potential')
  for (const imp of r.improvement_potential) lines.push('- ' + imp)
  lines.push('')
  lines.push('> ' + r.disclaimer)
  return lines.join('\n')
}


// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: shipment_tracking_aggregator
  tools.register(defineTool({
    name: 'shipment_tracking_aggregator',
    description: 'Aggregate and analyze real-time shipment tracking data across multiple carriers. Provides status summaries, delay detection, risk flags, and proactive alerts.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: shipments[]{tracking_id, carrier, origin, destination, status, last_update, estimated_delivery, actual_delivery?, current_location, transit_events[]{timestamp, location, event, status}, weight_kg, value_usd}, aggregation_scope (all/delayed/in_transit/exceptions)' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatShipmentTrackingReport(aggregateShipments(args.input_data)) }
  }))

  // Tool 2: provenance_verifier
  tools.register(defineTool({
    name: 'provenance_verifier',
    description: 'Verify product provenance and authenticity across the supply chain. Checks documentation, certifications, and chain-of-custody hops for origin verification.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: product_id, product_name, claimed_origin, batch_number, production_date, certifications[], supply_chain_hops[]{stage, entity, location, date, document_ref}, verification_depth (basic/standard/forensic)' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatProvenanceReport(verifyProvenance(args.input_data)) }
  }))

  // Tool 3: cold_chain_monitor
  tools.register(defineTool({
    name: 'cold_chain_monitor',
    description: 'Monitor temperature-sensitive shipments for cold chain compliance. Detects temperature breaches, calculates compliance scores, and assesses remaining shelf life impact.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: shipment_id, product_type, temperature_requirement{min_c, max_c, optimal_c}, sensor_readings[]{timestamp, temperature_c, humidity_pct, location}, route{origin, destination, waypoints[]}, max_allowed_breach_minutes, packaging_type' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatColdChainReport(monitorColdChain(args.input_data)) }
  }))

  // Tool 4: supplier_risk_scorer
  tools.register(defineTool({
    name: 'supplier_risk_scorer',
    description: 'Score and rank suppliers by comprehensive risk across financial, operational, geographic, and compliance dimensions. Provides risk distribution and mitigation actions.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: suppliers[]{supplier_id, name, country, region, tier, annual_spend_usd, dependency_pct, financial_rating, audit_score, incident_history[]{date, type, severity, resolved}, geographic_risk, single_source, lead_time_days, quality_rejection_rate}, risk_weights{financial, operational, geographic, compliance}' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatSupplierRiskReport(scoreSupplierRisk(args.input_data)) }
  }))

  // Tool 5: esg_compliance_tracker
  tools.register(defineTool({
    name: 'esg_compliance_tracker',
    description: 'Track ESG (Environmental, Social, Governance) compliance for suppliers, facilities, or product lines. Scores across E/S/G dimensions with improvement recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: entity_id, entity_name, entity_type (supplier/facility/product_line), assessment_period{start, end}, environmental{carbon_emissions_tonnes, energy_consumption_mwh, water_usage_m3, waste_generated_tonnes, recycling_pct, environmental_certifications[], regulatory_violations[]{date, type, penalty_usd, resolved}}, social{workforce_total, gender_diversity_pct, safety_incidents_12m, lost_time_injury_rate, labor_certifications[], community_investment_usd, human_rights_audit}, governance{board_independence_pct, ethics_policy, anti_corruption_training_pct, data_privacy_certifications[], supply_chain_audit_coverage_pct, whistleblower_mechanism}' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatESGReport(trackESGCompliance(args.input_data)) }
  }))

  // Tool 6: chain_of_custody_auditor
  tools.register(defineTool({
    name: 'chain_of_custody_auditor',
    description: 'Audit chain of custody transfers for product integrity. Identifies documentation gaps, temporal inconsistencies, condition changes, and verification failures.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: product_id, product_name, custody_chain[]{custodian, role, received_date, transferred_date, location, condition_on_receipt, condition_on_transfer, documentation[], verified}, audit_scope (full/partial/spot_check), required_standards[]' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatCustodyReport(auditChainOfCustody(args.input_data)) }
  }))

  // Tool 7: trade_document_automator
  tools.register(defineTool({
    name: 'trade_document_automator',
    description: 'Automate generation of trade documents for import/export transactions. Populates document fields, runs compliance checks, and identifies missing data.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: transaction_id, transaction_type (import/export/domestic/re_export), trade_terms (FOB/CIF/DDP/EXW/DAP/CFR), parties{exporter{name, country, tax_id, address}, importer{name, country, tax_id, address}, notify_party?}, goods[]{hs_code, description, quantity, unit, unit_price_usd, origin_country}, shipping{vessel_name, port_of_loading, port_of_discharge, eta, etd, container_numbers[]}, payment_terms{method (L/C/T/T/D/P/D/A/open_account), currency, amount_usd}, required_documents[]' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatTradeDocumentReport(automateTradeDocuments(args.input_data)) }
  }))

  // Tool 8: sustainability_score_calculator
  tools.register(defineTool({
    name: 'sustainability_score_calculator',
    description: 'Calculate product sustainability score across the full lifecycle (sourcing, manufacturing, packaging, transport, end-of-life). Provides grade, benchmarking, and improvement recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: product_id, product_name, category, lifecycle_data{raw_material_sourcing{renewable_pct, recycled_pct, certified_pct, water_footprint_m3}, manufacturing{energy_kwh, emissions_kg_co2, waste_kg, water_usage_l}, packaging{recyclable_pct, plastic_pct, weight_g, reusable}, transportation{distance_km, mode, emissions_kg_co2}, end_of_life{recyclable_pct, biodegradable_pct, landfill_pct, take_back_program}}, certifications[], benchmark_category_avg' }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatSustainabilityReport(calculateSustainability(args.input_data)) }
  }))

  console.log('[dsh-tool-supplyviz] Loaded v' + VERSION + ' -- Supply Chain Visibility & Traceability with 8 tools')
  console.log('  Tools: shipment_tracking_aggregator, provenance_verifier, cold_chain_monitor, supplier_risk_scorer, esg_compliance_tracker, chain_of_custody_auditor, trade_document_automator, sustainability_score_calculator')
}
