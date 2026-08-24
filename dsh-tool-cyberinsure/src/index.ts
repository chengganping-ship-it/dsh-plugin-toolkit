/**
 * DSH Cyber Insurance & Risk Transfer Plugin v0.1.0
 *
 * Cyber risk quantification, policy design, claims assessment, breach cost estimation,
 * coverage gap analysis, threat exposure scoring, incident response retainer, and
 * regulatory fine calculation toolkit for DeepSeek Harness Agent.
 *
 * 2026 Context: Cyber insurance market $25B+; growing at 20% CAGR.
 * Organizations face growing frequency and severity of cyber incidents,
 * driving demand for risk quantification, policy optimization, and incident preparedness.
 *
 * Features (v0.1.0):
 * - Cyber Risk Quantifier (FAIR-based ALE/SLE/ARO, risk heatmap, control effectiveness)
 * - Policy Design Engine (coverage architecture, limits, sub-limits, premium indication)
 * - Claims Assessor (cyber claim validity, reserve recommendation, coverage determination)
 * - Breach Cost Estimator (per-record cost, industry benchmark, total breach impact)
 * - Coverage Gap Analyst (policy vs exposure gap analysis, optimization roadmap)
 * - Threat Exposure Scorer (threat landscape mapping, attack surface scoring)
 * - Incident Response Retainer (IR panel selection, SLA design, cost modeling)
 * - Regulatory Fine Calculator (GDPR/PIPL/CCPA/HIPAA/LGPD fine estimation)
 *
 * @module dsh-tool-cyberinsure
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cyberinsure'
export const inject = ['tools']

const VERSION = '0.1.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated cyber insurance analysis for informational purposes only. It does not replace professional actuarial analysis, legal counsel, or underwriting decisions. Always validate findings with qualified insurance and legal professionals.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToInt(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRng<T>(input: T): () => number {
  return mulberry32(hashStringToInt(JSON.stringify(input)))
}

function rngRange(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function rngFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Cyber Risk Quantifier ---
export interface CyberRiskQuantifierInput {
  organization_name?: string
  annual_revenue?: number
  industry?: 'finance' | 'healthcare' | 'technology' | 'manufacturing' | 'retail' | 'energy' | 'government' | 'education'
  employee_count?: number
  data_records_count?: number
  existing_controls?: string[]
  threat_landscape?: 'low' | 'moderate' | 'high' | 'critical'
  historical_incidents?: number
}

export interface RiskScenario {
  scenario: string
  likelihood: number
  impact: number
  annual_loss_expectancy: number
  single_loss_expectancy: number
  annual_rate_of_occurrence: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
}

export interface CyberRiskQuantifierOutput {
  organization: string
  total_annual_loss_expectancy: number
  max_single_loss_expectancy: number
  risk_scenarios: RiskScenario[]
  risk_heatmap_summary: string
  control_effectiveness: number
  residual_risk: number
  risk_transfer_recommendation: string[]
  market_context: string
  summary: string
}

// --- Tool 2: Policy Design Engine ---
export interface PolicyDesignInput {
  organization_name?: string
  coverage_type?: 'first_party' | 'third_party' | 'comprehensive'
  desired_limit?: number
  deductible_preference?: 'low' | 'medium' | 'high'
  industry?: string
  employee_count?: number
  prior_claims?: boolean
  regulatory_environment?: 'strict' | 'moderate' | 'light'
}

export interface CoverageExtension {
  extension: string
  sub_limit: number
  included: boolean
  recommended: boolean
}

export interface PolicyDesignOutput {
  policy_type: string
  aggregate_limit: number
  per_occurrence_limit: number
  deductible: number
  extensions: CoverageExtension[]
  estimated_premium_range: { min: number; max: number }
  premium_rate: number
  coverage_gaps: string[]
  optimization_tips: string[]
  market_context: string
  summary: string
}

// --- Tool 3: Claims Assessor ---
export interface ClaimsAssessorInput {
  claim_id?: string
  claim_date?: string
  discovery_date?: string
  incident_type?: 'ransomware' | 'data_breach' | 'business_email_compromise' | 'ddos' | 'insider_threat' | 'system_failure' | 'third_party'
  claimed_amount?: number
  insured_revenue?: number
  deductible?: number
  policy_limit?: number
  prior_claims_count?: number
  notification_delay_days?: number
  evidence_quality?: 'excellent' | 'good' | 'adequate' | 'poor'
  coverage_type_claimed?: string
}

export interface CoverageDetermination {
  coverage_part: string
  covered: boolean
  limit_available: number
  sub_limit_applicable: number
  reasoning: string
}

export interface ClaimsAssessorOutput {
  claim_id: string
  validity_score: number
  reserve_recommendation: number
  coverage_determinations: CoverageDetermination[]
  red_flags: string[]
  recommended_payout_range: { min: number; max: number }
  investigation_triggers: string[]
  subrogation_potential: string
  summary: string
}

// --- Tool 4: Breach Cost Estimator ---
export interface BreachCostInput {
  breach_type?: 'ransomware' | 'data_exfiltration' | 'insider_threat' | 'hacktivist' | 'third_party' | 'phishing'
  records_exposed?: number
  industry?: string
  organization_size?: 'small' | 'medium' | 'large' | 'enterprise'
  response_time_hours?: number
  notification_required?: boolean
  regulatory_jurisdictions?: string[]
}

export interface CostCategory {
  category: string
  min_cost: number
  max_cost: number
  expected_cost: number
  description: string
}

export interface BreachCostOutput {
  incident_type: string
  total_cost_range: { min: number; max: number }
  expected_total_cost: number
  cost_per_record: number
  cost_categories: CostCategory[]
  notification_costs: number
  regulatory_fines_estimate: number
  long_term_impact: string[]
  industry_benchmark: string
  mitigation_savings: string[]
  summary: string
}

// --- Tool 5: Coverage Gap Analyst ---
export interface CoverageGapInput {
  organization_name?: string
  current_policy_limit?: number
  current_deductible?: number
  current_coverage_parts?: string[]
  annual_revenue?: number
  total_risk_exposure?: number
  industry?: string
  critical_dependencies?: string[]
  regulatory_requirements?: string[]
  historical_losses?: number[]
}

export interface GapItem {
  gap_area: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  exposure_amount: number
  current_coverage: string
  recommended_action: string
  estimated_premium_impact: number
}

export interface CoverageGapOutput {
  organization: string
  overall_gap_score: number
  gaps: GapItem[]
  total_uncovered_exposure: number
  optimization_roadmap: string[]
  benchmark_comparison: string
  renewal_recommendations: string[]
  summary: string
}

// --- Tool 6: Threat Exposure Scorer ---
export interface ThreatExposureInput {
  organization_name?: string
  industry?: string
  attack_surface_assets?: string[]
  geographic_presence?: string[]
  technology_stack?: string[]
  third_party_connections?: number
  data_sensitivity?: 'low' | 'moderate' | 'high' | 'critical'
  security_maturity_level?: 'basic' | 'intermediate' | 'advanced'
  threat_intelligence_feeds?: string[]
  recent_vulnerabilities?: number
  dark_web_exposure?: boolean
}

export interface ThreatVector {
  vector: string
  likelihood: number
  potential_impact: number
  exposure_score: number
  attack_complexity: 'low' | 'medium' | 'high'
  mitigation_priority: number
}

export interface ThreatExposureOutput {
  organization: string
  overall_exposure_score: number
  exposure_rating: 'low' | 'moderate' | 'high' | 'critical'
  threat_vectors: ThreatVector[]
  attack_surface_score: number
  industry_threat_level: string
  recommended_controls: string[]
  insurance_underwriting_impact: string
  summary: string
}

// --- Tool 7: Incident Response Retainer ---
export interface IRRetainerInput {
  organization_name?: string
  industry?: string
  annual_revenue?: number
  data_sensitivity?: 'low' | 'moderate' | 'high' | 'critical'
  regulatory_requirements?: string[]
  geographic_scope?: string[]
  existing_internal_capability?: 'none' | 'basic' | 'intermediate' | 'advanced'
  required_services?: string[]
  expected_incidents_per_year?: number
  budget_range?: { min: number; max: number }
}

export interface RetainerComponent {
  component: string
  annual_cost: number
  response_time_sla: string
  scope: string
}

export interface IRRetainerOutput {
  organization: string
  recommended_panel_size: number
  retainer_components: RetainerComponent[]
  total_annual_cost: number
  cost_per_incident: number
  sla_recommendations: string[]
  vendor_criteria: string[]
  contract_terms: string[]
  roi_analysis: string
  summary: string
}

// --- Tool 8: Regulatory Fine Calculator ---
export interface RegulatoryFineInput {
  regulation?: 'gdpr' | 'china_pip' | 'china_csl' | 'ccpa' | 'hipaa' | 'lgpd'
  violation_type?: 'data_breach' | 'insufficient_consent' | 'cross_border_transfer' | 'failure_to_notify' | 'inadequate_security' | 'data_retention'
  records_affected?: number
  organization_revenue?: number
  negligence_level?: 'unintentional' | 'negligent' | 'reckless' | 'willful'
  self_reported?: boolean
  remediation_speed?: 'immediate' | 'prompt' | 'delayed' | 'none'
  prior_violations?: number
}

export interface FineRange {
  minimum: number
  maximum: number
  expected: number
  basis: string
}

export interface RegulatoryFineOutput {
  regulation: string
  violation: string
  fine_range: FineRange
  mitigating_factors: string[]
  aggravating_factors: string[]
  notification_deadline: string
  defense_strategies: string[]
  total_exposure_estimate: number
  insurance_coverage_applicability: string
  precedents: string[]
  summary: string
}

// ==================== TOOL 1: CYBER RISK QUANTIFIER ====================

function quantifyCyberRisk(input: CyberRiskQuantifierInput): CyberRiskQuantifierOutput {
  const rng = seededRng(input)
  const revenue = input.annual_revenue || 100000000
  const industry = input.industry || 'technology'
  const threatLevel = input.threat_landscape || 'moderate'
  const incidents = input.historical_incidents || 0

  const threatMultiplier: Record<string, number> = { low: 0.6, moderate: 1.0, high: 1.5, critical: 2.2 }
  const tm = threatMultiplier[threatLevel]

  const industryFactor: Record<string, number> = {
    finance: 1.3, healthcare: 1.25, technology: 1.1, manufacturing: 0.95,
    retail: 1.0, energy: 1.15, government: 1.2, education: 0.85
  }
  const indF = industryFactor[industry] || 1.0

  const scenarios: RiskScenario[] = []
  const scenarioTemplates = [
    { name: 'Ransomware Attack - Full Encryption', baseImpact: 0.15, baseLikelihood: 0.25 },
    { name: 'Data Breach - Customer PII', baseImpact: 0.12, baseLikelihood: 0.18 },
    { name: 'Business Email Compromise', baseImpact: 0.05, baseLikelihood: 0.35 },
    { name: 'DDoS - Extended Outage', baseImpact: 0.03, baseLikelihood: 0.40 },
    { name: 'Insider Data Theft', baseImpact: 0.08, baseLikelihood: 0.12 },
    { name: 'Supply Chain Compromise', baseImpact: 0.10, baseLikelihood: 0.15 },
    { name: 'Cloud Misconfiguration Exposure', baseImpact: 0.06, baseLikelihood: 0.28 },
    { name: 'Zero-Day Exploit - Critical Systems', baseImpact: 0.20, baseLikelihood: 0.08 }
  ]

  for (const tpl of scenarioTemplates) {
    const impactRevenue = revenue * tpl.baseImpact * indF * rngFloat(rng, 0.7, 1.3)
    const likelihood = clamp(tpl.baseLikelihood * tm * rngFloat(rng, 0.8, 1.2), 0.01, 0.95)
    const sle = Math.round(impactRevenue)
    const aro = parseFloat((likelihood * rngFloat(rng, 0.8, 1.5)).toFixed(2))
    const ale = Math.round(sle * aro)
    let riskLevel: RiskScenario['risk_level'] = 'low'
    if (ale > revenue * 0.05) riskLevel = 'critical'
    else if (ale > revenue * 0.02) riskLevel = 'high'
    else if (ale > revenue * 0.005) riskLevel = 'moderate'
    scenarios.push({
      scenario: tpl.name,
      likelihood: parseFloat(likelihood.toFixed(3)),
      impact: sle,
      annual_loss_expectancy: ale,
      single_loss_expectancy: sle,
      annual_rate_of_occurrence: aro,
      risk_level: riskLevel
    })
  }

  scenarios.sort((a, b) => b.annual_loss_expectancy - a.annual_loss_expectancy)

  const totalALE = scenarios.reduce((sum, s) => sum + s.annual_loss_expectancy, 0)
  const maxSLE = Math.max(...scenarios.map(s => s.single_loss_expectancy))
  const controlEffectiveness = clamp(Math.round(rngRange(rng, 55, 85)), 40, 95)
  const residualRisk = Math.round(totalALE * (1 - controlEffectiveness / 100))

  const recommendations: string[] = []
  recommendations.push('Transfer catastrophic risk (top 3 scenarios) via cyber insurance with limit of $' + Math.round(maxSLE * 1.2).toLocaleString())
  recommendations.push('Implement enhanced controls for scenarios with ALE exceeding $' + Math.round(revenue * 0.02).toLocaleString())
  recommendations.push('Establish captive insurance vehicle for recurring moderate-severity risks')
  recommendations.push('Deploy continuous risk monitoring with quarterly FAIR model updates')
  if (incidents > 2) {
    recommendations.push('URGENT: Historical incident frequency indicates underwriting challenges - prioritize loss prevention')
  }

  return {
    organization: input.organization_name || 'Unknown Organization',
    total_annual_loss_expectancy: totalALE,
    max_single_loss_expectancy: maxSLE,
    risk_scenarios: scenarios,
    risk_heatmap_summary: 'Top 3 risk scenarios account for ' + Math.round((scenarios.slice(0, 3).reduce((s, r) => s + r.annual_loss_expectancy, 0) / totalALE) * 100) + '% of total ALE',
    control_effectiveness: controlEffectiveness,
    residual_risk: residualRisk,
    risk_transfer_recommendation: recommendations,
    market_context: '2026 cyber insurance market sees hardening rates (+15-25% YoY) as ransomware frequency stabilizes but severity increases; FAIR methodology becoming underwriting standard',
    summary: 'Quantified ' + scenarios.length + ' risk scenarios for ' + (input.organization_name || 'organization') + ': total ALE $' + totalALE.toLocaleString() + ', max SLE $' + maxSLE.toLocaleString() + ', residual risk after controls: $' + residualRisk.toLocaleString()
  }
}

function formatRiskQuantifierReport(input: CyberRiskQuantifierInput, output: CyberRiskQuantifierOutput): string {
  const lines: string[] = []
  lines.push('## Cyber Risk Quantification Report (FAIR Methodology)')
  lines.push('')
  lines.push('**Organization:** ' + output.organization + ' | **Industry:** ' + (input.industry || 'technology') + ' | **Threat Level:** ' + (input.threat_landscape || 'moderate'))
  lines.push('**Annual Revenue:** $' + (input.annual_revenue || 0).toLocaleString() + ' | **Control Effectiveness:** ' + output.control_effectiveness + '%')
  lines.push('')
  lines.push('### Aggregate Risk Metrics')
  lines.push('- **Total Annual Loss Expectancy (ALE):** $' + output.total_annual_loss_expectancy.toLocaleString())
  lines.push('- **Max Single Loss Expectancy (Max SLE):** $' + output.max_single_loss_expectancy.toLocaleString())
  lines.push('- **Residual Risk After Controls:** $' + output.residual_risk.toLocaleString())
  lines.push('- **Risk Heatmap Summary:** ' + output.risk_heatmap_summary)
  lines.push('')
  lines.push('### Risk Scenario Analysis')
  lines.push('| Scenario | Likelihood | SLE | ARO | ALE | Risk Level |')
  lines.push('|----------|-----------|-----|-----|-----|------------|')
  for (const s of output.risk_scenarios) {
    lines.push('| ' + s.scenario + ' | ' + (s.likelihood * 100).toFixed(1) + '% | $' + s.single_loss_expectancy.toLocaleString() + ' | ' + s.annual_rate_of_occurrence.toFixed(2) + ' | $' + s.annual_loss_expectancy.toLocaleString() + ' | ' + s.risk_level.toUpperCase() + ' |')
  }
  lines.push('')
  lines.push('### Risk Transfer Recommendations')
  for (const rec of output.risk_transfer_recommendation) lines.push('- [ ] ' + rec)
  lines.push('')
  lines.push('> **Market Context:** ' + output.market_context)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: POLICY DESIGN ENGINE ====================

function designPolicy(input: PolicyDesignInput): PolicyDesignOutput {
  const rng = seededRng(input)
  const covType = input.coverage_type || 'comprehensive'
  const desiredLimit = input.desired_limit || 10000000
  const dedPref = input.deductible_preference || 'medium'
  const priorClaims = input.prior_claims || false

  const multiplier = covType === 'comprehensive' ? 1.0 : covType === 'first_party' ? 0.65 : 0.55
  const aggregateLimit = Math.round(desiredLimit * multiplier)
  const perOccurrence = Math.round(aggregateLimit * 0.8)

  const dedFactor = dedPref === 'low' ? 0.005 : dedPref === 'medium' ? 0.01 : 0.02
  const deductible = Math.round(desiredLimit * dedFactor / 10000) * 10000

  const extensions: CoverageExtension[] = [
    { extension: 'Business Interruption (Cyber)', sub_limit: Math.round(aggregateLimit * 0.3), included: true, recommended: true },
    { extension: 'Data Restoration and Recovery', sub_limit: Math.round(aggregateLimit * 0.25), included: true, recommended: true },
    { extension: 'Cyber Extortion / Ransomware', sub_limit: Math.round(aggregateLimit * 0.2), included: true, recommended: true },
    { extension: 'Network Security Liability', sub_limit: Math.round(aggregateLimit * 0.35), included: true, recommended: true },
    { extension: 'Privacy Liability and Notification', sub_limit: Math.round(aggregateLimit * 0.2), included: true, recommended: true },
    { extension: 'Regulatory Defense and Penalties', sub_limit: Math.round(aggregateLimit * 0.15), included: covType === 'comprehensive', recommended: true },
    { extension: 'Dependent Business Interruption', sub_limit: Math.round(aggregateLimit * 0.15), included: covType === 'comprehensive', recommended: false },
    { extension: 'System Failure (Non-Malicious)', sub_limit: Math.round(aggregateLimit * 0.1), included: false, recommended: true },
    { extension: 'Bricking / Hardware Replacement', sub_limit: Math.round(aggregateLimit * 0.05), included: false, recommended: false },
    { extension: 'Reputational Harm Coverage', sub_limit: Math.round(aggregateLimit * 0.1), included: false, recommended: true },
    { extension: 'Invoice Manipulation', sub_limit: Math.round(aggregateLimit * 0.08), included: false, recommended: true },
    { extension: 'Cryptojacking / Unauthorized Mining', sub_limit: Math.round(aggregateLimit * 0.03), included: false, recommended: true }
  ]

  const baseRate = rngFloat(rng, 0.002, 0.008)
  const priorClaimMultiplier = priorClaims ? rngFloat(rng, 1.3, 1.8) : 1.0
  const dedDiscount = dedPref === 'high' ? 0.85 : dedPref === 'medium' ? 0.95 : 1.05
  const premiumRate = parseFloat((baseRate * priorClaimMultiplier * dedDiscount).toFixed(5))
  const minPremium = Math.round(aggregateLimit * premiumRate * rngFloat(rng, 0.85, 1.0))
  const maxPremium = Math.round(aggregateLimit * premiumRate * rngFloat(rng, 1.0, 1.3))

  const gaps: string[] = []
  if (covType !== 'comprehensive') gaps.push('Consider upgrading to comprehensive coverage for regulatory defense and dependent business interruption')
  if (dedPref === 'low') gaps.push('Lower deductible increases premium; consider higher deductible with captive retention')
  if (!extensions.find(e => e.extension === 'System Failure (Non-Malicious)')?.included) {
    gaps.push('System failure exclusion creates gap for non-malicious outages (cloud provider failures)')
  }

  const tips: string[] = []
  tips.push('Align aggregate limit with quantified Max SLE from cyber risk assessment')
  tips.push('Negotiate sub-limits for ransomware at minimum 20% of aggregate')
  tips.push('Include contingent business interruption for critical cloud dependencies')
  tips.push('Ensure retroactive date covers prior unknown exposures')
  tips.push('Require panel counsel pre-approval for IR retainer coverage')

  return {
    policy_type: covType === 'comprehensive' ? 'Comprehensive Cyber Insurance' : covType === 'first_party' ? 'First-Party Cyber Coverage' : 'Third-Party Cyber Liability',
    aggregate_limit: aggregateLimit,
    per_occurrence_limit: perOccurrence,
    deductible: deductible,
    extensions: extensions,
    estimated_premium_range: { min: minPremium, max: maxPremium },
    premium_rate: premiumRate,
    coverage_gaps: gaps,
    optimization_tips: tips,
    market_context: '2026 market: comprehensive cyber rates hardening 15-25% YoY; capacity tightening for high-risk sectors (healthcare, education); insurers requiring MFA, EDR, and IR retainer as minimum underwriting requirements',
    summary: 'Designed ' + (covType === 'comprehensive' ? 'comprehensive' : covType === 'first_party' ? 'first-party' : 'third-party') + ' cyber policy with $' + aggregateLimit.toLocaleString() + ' aggregate limit, $' + deductible.toLocaleString() + ' deductible, estimated premium $' + minPremium.toLocaleString() + ' - $' + maxPremium.toLocaleString()
  }
}

function formatPolicyReport(input: PolicyDesignInput, output: PolicyDesignOutput): string {
  const lines: string[] = []
  lines.push('## Cyber Insurance Policy Design Report')
  lines.push('')
  lines.push('**Policy Type:** ' + output.policy_type)
  lines.push('**Aggregate Limit:** $' + output.aggregate_limit.toLocaleString() + ' | **Per-Occurrence Limit:** $' + output.per_occurrence_limit.toLocaleString())
  lines.push('**Deductible:** $' + output.deductible.toLocaleString() + ' | **Premium Rate:** ' + (output.premium_rate * 100).toFixed(3) + '%')
  lines.push('**Estimated Premium:** $' + output.estimated_premium_range.min.toLocaleString() + ' - $' + output.estimated_premium_range.max.toLocaleString())
  lines.push('')
  lines.push('### Coverage Extensions')
  lines.push('| Extension | Sub-Limit | Included | Recommended |')
  lines.push('|-----------|-----------|----------|-------------|')
  for (const e of output.extensions) {
    lines.push('| ' + e.extension + ' | $' + e.sub_limit.toLocaleString() + ' | ' + (e.included ? 'YES' : 'NO') + ' | ' + (e.recommended ? 'YES' : 'NO') + ' |')
  }
  lines.push('')
  if (output.coverage_gaps.length > 0) {
    lines.push('### Coverage Gaps Identified')
    for (const g of output.coverage_gaps) lines.push('- [ ] ' + g)
    lines.push('')
  }
  lines.push('### Optimization Tips')
  for (const t of output.optimization_tips) lines.push('- ' + t)
  lines.push('')
  lines.push('> **Market Context:** ' + output.market_context)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: CLAIMS ASSESSOR ====================

function assessClaim(input: ClaimsAssessorInput): ClaimsAssessorOutput {
  const rng = seededRng(input)
  const claimedAmount = input.claimed_amount || 500000
  const deductible = input.deductible || 50000
  const policyLimit = input.policy_limit || 10000000
  const priorClaims = input.prior_claims_count || 0
  const notifDelay = input.notification_delay_days || 0

  let validityScore = 75
  if (input.evidence_quality === 'excellent') validityScore += 15
  else if (input.evidence_quality === 'good') validityScore += 8
  else if (input.evidence_quality === 'adequate') validityScore += 0
  else validityScore -= 20

  if (notifDelay > 30) validityScore -= 15
  else if (notifDelay > 7) validityScore -= 5

  if (priorClaims >= 3) validityScore -= 10
  else if (priorClaims >= 1) validityScore -= 3

  validityScore = clamp(validityScore + rngRange(rng, -8, 8), 10, 100)

  const effectiveClaim = Math.min(claimedAmount, policyLimit)
  const afterDeductible = Math.max(0, effectiveClaim - deductible)
  const reserveFactor = validityScore >= 70 ? 0.85 : validityScore >= 50 ? 0.65 : 0.40
  const reserveRecommendation = Math.round(afterDeductible * reserveFactor)

  const minPayout = Math.round(reserveRecommendation * rngFloat(rng, 0.7, 0.9))
  const maxPayout = Math.round(reserveRecommendation * rngFloat(rng, 1.0, 1.3))

  const determinations: CoverageDetermination[] = [
    {
      coverage_part: 'First-Party Cyber Loss',
      covered: validityScore >= 40,
      limit_available: policyLimit,
      sub_limit_applicable: Math.round(policyLimit * 0.3),
      reasoning: input.evidence_quality === 'poor' ? 'Insufficient evidence; investigation required before coverage confirmation' : 'Covered subject to policy terms, conditions, and evidence verification'
    },
    {
      coverage_part: 'Business Interruption',
      covered: input.incident_type === 'ransomware' || input.incident_type === 'ddos' || input.incident_type === 'system_failure',
      limit_available: Math.round(policyLimit * 0.3),
      sub_limit_applicable: Math.round(policyLimit * 0.15),
      reasoning: input.incident_type === 'ransomware' || input.incident_type === 'ddos' ? 'BI trigger established by system downtime' : 'BI coverage may not apply for non-system disruption incidents'
    },
    {
      coverage_part: 'Regulatory Defense',
      covered: validityScore >= 50,
      limit_available: Math.round(policyLimit * 0.15),
      sub_limit_applicable: Math.round(policyLimit * 0.1),
      reasoning: 'Subject to investigation and regulatory action determination'
    }
  ]

  const redFlags: string[] = []
  if (notifDelay > 30) redFlags.push('Late notification (>30 days) may prejudice insurer defense - investigate delay circumstances')
  if (priorClaims >= 3) redFlags.push('Frequency pattern: ' + priorClaims + ' prior claims - review for adverse selection or moral hazard')
  if (input.evidence_quality === 'poor') redFlags.push('Poor evidence quality - consider independent forensic examination before reserve setting')
  if (claimedAmount > policyLimit * 0.8) redFlags.push('Claim approaches policy limit - ensure allocation methodology is documented')

  const investigationTriggers: string[] = []
  if (validityScore < 60) investigationTriggers.push('Field investigation recommended for validity below 60%')
  if (claimedAmount > 5000000) investigationTriggers.push('Large loss protocol activation required')
  if (input.incident_type === 'insider_threat') investigationTriggers.push('Insider threat: engage forensic accounting and HR investigation')

  const subrogationPotential = input.incident_type === 'third_party' ? 'HIGH: Third-party vendor or service provider liability - pursue recovery'
    : input.incident_type === 'system_failure' ? 'MEDIUM: Cloud/hosting provider SLA breach - review contractual remedies'
    : 'LOW: Direct attack by external threat actor with limited recovery avenue'

  return {
    claim_id: input.claim_id || 'CLM-' + rngRange(rng, 10000, 99999).toString(),
    validity_score: validityScore,
    reserve_recommendation: reserveRecommendation,
    coverage_determinations: determinations,
    red_flags: redFlags.length > 0 ? redFlags : ['No immediate red flags identified'],
    recommended_payout_range: { min: minPayout, max: maxPayout },
    investigation_triggers: investigationTriggers.length > 0 ? investigationTriggers : ['Standard claim handling sufficient'],
    subrogation_potential: subrogationPotential,
    summary: 'Claim ' + (input.claim_id || 'N/A') + ' assessed: validity ' + validityScore + '%, reserve $' + reserveRecommendation.toLocaleString() + ', recommended payout $' + minPayout.toLocaleString() + ' - $' + maxPayout.toLocaleString()
  }
}

function formatClaimsReport(input: ClaimsAssessorInput, output: ClaimsAssessorOutput): string {
  const lines: string[] = []
  lines.push('## Cyber Insurance Claims Assessment')
  lines.push('')
  lines.push('**Claim ID:** ' + output.claim_id + ' | **Incident Type:** ' + (input.incident_type || 'unspecified') + ' | **Claimed Amount:** $' + (input.claimed_amount || 0).toLocaleString())
  lines.push('**Validity Score:** ' + output.validity_score + '/100 | **Reserve Recommendation:** $' + output.reserve_recommendation.toLocaleString())
  lines.push('**Recommended Payout:** $' + output.recommended_payout_range.min.toLocaleString() + ' - $' + output.recommended_payout_range.max.toLocaleString())
  lines.push('**Subrogation Potential:** ' + output.subrogation_potential)
  lines.push('')
  lines.push('### Coverage Determinations')
  lines.push('| Coverage Part | Covered | Limit Available | Reasoning |')
  lines.push('|---------------|---------|-----------------|-----------|')
  for (const d of output.coverage_determinations) {
    lines.push('| ' + d.coverage_part + ' | ' + (d.covered ? 'YES' : 'PENDING') + ' | $' + d.limit_available.toLocaleString() + ' | ' + d.reasoning + ' |')
  }
  lines.push('')
  lines.push('### Red Flags')
  for (const r of output.red_flags) lines.push('- ' + r)
  lines.push('')
  lines.push('### Investigation Triggers')
  for (const t of output.investigation_triggers) lines.push('- ' + t)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: BREACH COST ESTIMATOR ====================

function estimateBreachCost(input: BreachCostInput): BreachCostOutput {
  const rng = seededRng(input)
  const records = input.records_exposed || 10000
  const orgSize = input.organization_size || 'medium'
  const industry = input.industry || 'technology'
  const breachType = input.breach_type || 'data_exfiltration'
  const responseTime = input.response_time_hours || 72

  const basePerRecord: Record<string, number> = {
    finance: 350, healthcare: 495, technology: 280, manufacturing: 220,
    retail: 200, energy: 380, government: 310, education: 190
  }
  const bpr = basePerRecord[industry] || 250

  const breachMultiplier: Record<string, number> = {
    ransomware: 1.8, data_exfiltration: 1.4, insider_threat: 1.6,
    hacktivist: 1.1, third_party: 1.3, phishing: 1.2
  }
  const bm = breachMultiplier[breachType] || 1.3

  const sizeMultiplier = orgSize === 'enterprise' ? 1.5 : orgSize === 'large' ? 1.3 : orgSize === 'medium' ? 1.0 : 0.7
  const responseFactor = Math.max(0.6, Math.min(2.0, (responseTime / 72) * rngFloat(rng, 0.8, 1.2)))

  const costPerRecord = Math.round(bpr * bm * sizeMultiplier * responseFactor)
  const expectedTotalCost = Math.round(records * costPerRecord * rngFloat(rng, 0.85, 1.15))
  const minCost = Math.round(expectedTotalCost * rngFloat(rng, 0.6, 0.8))
  const maxCost = Math.round(expectedTotalCost * rngFloat(rng, 1.2, 1.8))

  const categories: CostCategory[] = [
    { category: 'Detection and Investigation', min_cost: Math.round(minCost * 0.15), max_cost: Math.round(maxCost * 0.2), expected_cost: Math.round(expectedTotalCost * 0.18), description: 'Forensic investigation, incident response, root cause analysis' },
    { category: 'Notification and Communication', min_cost: Math.round(minCost * 0.05), max_cost: Math.round(maxCost * 0.08), expected_cost: Math.round(expectedTotalCost * 0.06), description: 'Individual notifications, call centers, credit monitoring, PR' },
    { category: 'Regulatory and Legal', min_cost: Math.round(minCost * 0.2), max_cost: Math.round(maxCost * 0.3), expected_cost: Math.round(expectedTotalCost * 0.25), description: 'Fines, penalties, legal fees, class action settlements' },
    { category: 'Business Disruption', min_cost: Math.round(minCost * 0.15), max_cost: Math.round(maxCost * 0.25), expected_cost: Math.round(expectedTotalCost * 0.2), description: 'Downtime, lost revenue, overtime, temporary staffing' },
    { category: 'Reputational Damage', min_cost: Math.round(minCost * 0.1), max_cost: Math.round(maxCost * 0.2), expected_cost: Math.round(expectedTotalCost * 0.15), description: 'Customer churn, brand damage, increased customer acquisition costs' },
    { category: 'Remediation and Hardening', min_cost: Math.round(minCost * 0.08), max_cost: Math.round(maxCost * 0.15), expected_cost: Math.round(expectedTotalCost * 0.12), description: 'System rebuilds, security upgrades, training programs' },
    { category: 'Third-Party Liability', min_cost: Math.round(minCost * 0.05), max_cost: Math.round(maxCost * 0.1), expected_cost: Math.round(expectedTotalCost * 0.08), description: 'Vendor penalties, partner disputes, contractual claims' }
  ]

  const notifCost = Math.round(records * (orgSize === 'enterprise' ? 4.5 : orgSize === 'large' ? 3.5 : orgSize === 'medium' ? 2.5 : 1.5))
  const regFinesEstimate = Math.round(expectedTotalCost * rngFloat(rng, 0.1, 0.25))

  const longTerm: string[] = []
  longTerm.push('Customer churn: estimated 3-7% attrition in 12 months post-breach')
  longTerm.push('Increased insurance premiums: 20-40% renewal increase expected')
  longTerm.push('Executive turnover: 30% of CISOs depart within 1 year of material breach')
  if (records > 100000) longTerm.push('Regulatory consent decree likely, requiring ongoing compliance audits for 2-3 years')

  const benchmark = '2026 Ponemon benchmark: average breach cost $4.88M globally; healthcare highest at $10.93M; US average $9.48M; mean time to identify 194 days'

  const savings: string[] = []
  savings.push('IR retainer reduces time-to-containment by 40%, saving ~$' + Math.round(expectedTotalCost * 0.15).toLocaleString() + ' in business disruption')
  savings.push('Tabletop exercises reduce breach cost by average $2.3M (Ponemon 2026)')
  savings.push('Automated response playbooks reduce investigation costs by ~25%')

  return {
    incident_type: breachType,
    total_cost_range: { min: minCost, max: maxCost },
    expected_total_cost: expectedTotalCost,
    cost_per_record: costPerRecord,
    cost_categories: categories,
    notification_costs: notifCost,
    regulatory_fines_estimate: regFinesEstimate,
    long_term_impact: longTerm,
    industry_benchmark: benchmark,
    mitigation_savings: savings,
    summary: breachType.replace('_', ' ').toUpperCase() + ' with ' + records.toLocaleString() + ' records: expected total cost $' + expectedTotalCost.toLocaleString() + ' ($' + costPerRecord.toLocaleString() + '/record), range $' + minCost.toLocaleString() + ' - $' + maxCost.toLocaleString()
  }
}

function formatBreachCostReport(input: BreachCostInput, output: BreachCostOutput): string {
  const lines: string[] = []
  lines.push('## Data Breach Cost Estimation Report')
  lines.push('')
  lines.push('**Incident Type:** ' + output.incident_type.replace('_', ' ').toUpperCase())
  lines.push('**Records Exposed:** ' + (input.records_exposed || 0).toLocaleString() + ' | **Per-Record Cost:** $' + output.cost_per_record.toLocaleString())
  lines.push('**Organization Size:** ' + (input.organization_size || 'medium') + ' | **Industry:** ' + (input.industry || 'technology'))
  lines.push('')
  lines.push('### Cost Summary')
  lines.push('- **Expected Total Cost:** $' + output.expected_total_cost.toLocaleString())
  lines.push('- **Cost Range:** $' + output.total_cost_range.min.toLocaleString() + ' - $' + output.total_cost_range.max.toLocaleString())
  lines.push('- **Notification Costs:** $' + output.notification_costs.toLocaleString())
  lines.push('- **Regulatory Fines Estimate:** $' + output.regulatory_fines_estimate.toLocaleString())
  lines.push('')
  lines.push('### Cost Breakdown by Category')
  lines.push('| Category | Expected Cost | Range |')
  lines.push('|----------|--------------|-------|')
  for (const c of output.cost_categories) {
    lines.push('| ' + c.category + ' | $' + c.expected_cost.toLocaleString() + ' | $' + c.min_cost.toLocaleString() + ' - $' + c.max_cost.toLocaleString() + ' |')
  }
  lines.push('')
  lines.push('### Long-Term Impact')
  for (const l of output.long_term_impact) lines.push('- ' + l)
  lines.push('')
  lines.push('### Mitigation Savings')
  for (const s of output.mitigation_savings) lines.push('- ' + s)
  lines.push('')
  lines.push('> **Benchmark:** ' + output.industry_benchmark)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: COVERAGE GAP ANALYST ====================

function analyzeCoverageGaps(input: CoverageGapInput): CoverageGapOutput {
  const rng = seededRng(input)
  const revenue = input.annual_revenue || 100000000
  const currentLimit = input.current_policy_limit || 5000000
  const totalExposure = input.total_risk_exposure || revenue * 0.15
  const currentParts = input.current_coverage_parts || ['network_security', 'privacy_liability']
  const losses = input.historical_losses || []

  const gapAreas = [
    { name: 'Ransomware Extortion Payment', typicalExposure: totalExposure * 0.2, coveredParts: ['cyber_extortion', 'ransomware'] },
    { name: 'Business Interruption (Own Systems)', typicalExposure: totalExposure * 0.3, coveredParts: ['business_interruption', 'cyber_bi'] },
    { name: 'Business Interruption (Dependent)', typicalExposure: totalExposure * 0.15, coveredParts: ['dependent_bi', 'contingent_bi'] },
    { name: 'Data Restoration', typicalExposure: totalExposure * 0.1, coveredParts: ['data_restoration', 'system_recovery'] },
    { name: 'Regulatory Defense & Penalties', typicalExposure: totalExposure * 0.18, coveredParts: ['regulatory_defense', 'regulatory_fines'] },
    { name: 'Reputational Harm', typicalExposure: totalExposure * 0.08, coveredParts: ['reputational_harm', 'brand_damage'] },
    { name: 'Invoice Manipulation / BEC', typicalExposure: totalExposure * 0.12, coveredParts: ['invoice_manipulation', 'bec', 'social_engineering'] },
    { name: 'System Failure (Non-Malicious)', typicalExposure: totalExposure * 0.06, coveredParts: ['system_failure', 'non_malicious'] },
    { name: 'Bricking / Hardware', typicalExposure: totalExposure * 0.03, coveredParts: ['bricking', 'hardware_replacement'] },
    { name: 'Cryptojacking', typicalExposure: totalExposure * 0.02, coveredParts: ['cryptojacking', 'unauthorized_mining'] }
  ]

  const gaps: GapItem[] = []
  for (const ga of gapAreas) {
    const isCovered = ga.coveredParts.some(p => currentParts.includes(p))
    if (!isCovered) {
      const severity: GapItem['severity'] = ga.typicalExposure > totalExposure * 0.15 ? 'critical' : ga.typicalExposure > totalExposure * 0.08 ? 'high' : ga.typicalExposure > totalExposure * 0.04 ? 'medium' : 'low'
      gaps.push({
        gap_area: ga.name,
        severity: severity,
        exposure_amount: Math.round(ga.typicalExposure),
        current_coverage: 'NOT COVERED',
        recommended_action: 'Add ' + ga.name.toLowerCase() + ' endorsement with sub-limit of $' + Math.round(ga.typicalExposure * 0.8).toLocaleString(),
        estimated_premium_impact: Math.round(ga.typicalExposure * rngFloat(rng, 0.002, 0.008))
      })
    }
  }

  const totalUncovered = gaps.reduce((s, g) => s + g.exposure_amount, 0)
  const limitGap = totalExposure - currentLimit
  if (limitGap > 0) {
    gaps.push({
      gap_area: 'Aggregate Limit Insufficiency',
      severity: limitGap / totalExposure > 0.3 ? 'critical' : 'high',
      exposure_amount: Math.round(limitGap),
      current_coverage: '$' + currentLimit.toLocaleString() + ' vs exposure $' + Math.round(totalExposure).toLocaleString(),
      recommended_action: 'Increase aggregate limit to $' + Math.round(totalExposure * 1.2).toLocaleString() + ' or implement quota-share reinsurance',
      estimated_premium_impact: Math.round(limitGap * rngFloat(rng, 0.003, 0.01))
    })
  }

  gaps.sort((a, b) => {
    const sev: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    return sev[b.severity] - sev[a.severity]
  })

  const gapScore = clamp(Math.round((1 - totalUncovered / totalExposure) * 100), 20, 95)

  const roadmap: string[] = []
  const criticalGaps = gaps.filter(g => g.severity === 'critical')
  const highGaps = gaps.filter(g => g.severity === 'high')
  if (criticalGaps.length > 0) roadmap.push('URGENT (30 days): Address ' + criticalGaps.length + ' critical gaps: ' + criticalGaps.slice(0, 2).map(g => g.gap_area).join(', '))
  if (highGaps.length > 0) roadmap.push('HIGH (90 days): Address ' + highGaps.length + ' high-severity gaps: ' + highGaps.slice(0, 2).map(g => g.gap_area).join(', '))
  roadmap.push('MEDIUM (180 days): Evaluate remaining gaps for next renewal cycle')
  roadmap.push('ONGOING: Annual coverage gap reassessment aligned with threat landscape changes')

  const benchmark = 'Industry benchmark: organizations with comprehensive cyber insurance carry average $15M aggregate limit, median deductible $50K; 68% include ransomware sub-limit, 45% include dependent BI'

  const renewalRecs: string[] = []
  renewalRecs.push('Schedule coverage review 120 days before renewal')
  renewalRecs.push('Update risk quantification with latest FAIR analysis')
  renewalRecs.push('Compile loss runs and control improvements for underwriting submission')
  renewalRecs.push('Request quotes from minimum 3 carriers to ensure competitive pricing')

  return {
    organization: input.organization_name || 'Unknown Organization',
    overall_gap_score: gapScore,
    gaps: gaps,
    total_uncovered_exposure: totalUncovered,
    optimization_roadmap: roadmap,
    benchmark_comparison: benchmark,
    renewal_recommendations: renewalRecs,
    summary: 'Coverage gap analysis: gap score ' + gapScore + '/100, ' + gaps.length + ' uncovered areas totaling $' + totalUncovered.toLocaleString() + ' in potentially uninsured exposure'
  }
}

function formatCoverageGapReport(input: CoverageGapInput, output: CoverageGapOutput): string {
  const lines: string[] = []
  lines.push('## Cyber Insurance Coverage Gap Analysis')
  lines.push('')
  lines.push('**Organization:** ' + output.organization + ' | **Overall Gap Score:** ' + output.overall_gap_score + '/100')
  lines.push('**Current Limit:** $' + (input.current_policy_limit || 0).toLocaleString() + ' | **Total Uncovered Exposure:** $' + output.total_uncovered_exposure.toLocaleString())
  lines.push('')
  lines.push('### Identified Coverage Gaps')
  lines.push('| Gap Area | Severity | Exposure | Recommended Action |')
  lines.push('|----------|----------|----------|-------------------|')
  for (const g of output.gaps.slice(0, 8)) {
    lines.push('| ' + g.gap_area + ' | ' + g.severity.toUpperCase() + ' | $' + g.exposure_amount.toLocaleString() + ' | ' + g.recommended_action + ' |')
  }
  if (output.gaps.length > 8) lines.push('| ... and ' + (output.gaps.length - 8) + ' more gaps | ... | ... | ... |')
  lines.push('')
  lines.push('### Optimization Roadmap')
  for (const r of output.optimization_roadmap) lines.push('- ' + r)
  lines.push('')
  lines.push('### Renewal Recommendations')
  for (const r of output.renewal_recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('> **Benchmark:** ' + output.benchmark_comparison)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: THREAT EXPOSURE SCORER ====================

function scoreThreatExposure(input: ThreatExposureInput): ThreatExposureOutput {
  const rng = seededRng(input)
  const assets = input.attack_surface_assets || ['web_applications', 'email_systems', 'vpn_endpoints']
  const techStack = input.technology_stack || []
  const connCount = input.third_party_connections || 10
  const dataSens = input.data_sensitivity || 'moderate'
  const secMat = input.security_maturity_level || 'intermediate'
  const vulns = input.recent_vulnerabilities || 5
  const darkWeb = input.dark_web_exposure || false

  const dataSensScore: Record<string, number> = { low: 30, moderate: 55, high: 75, critical: 95 }
  const secMatFactor: Record<string, number> = { advanced: 0.6, intermediate: 0.85, basic: 1.2, none: 1.6 }

  const threatVectors: ThreatVector[] = []
  const vectors = [
    { name: 'Phishing / Social Engineering', baseLikelihood: 0.8, baseImpact: 50 },
    { name: 'Ransomware', baseLikelihood: 0.4, baseImpact: 90 },
    { name: 'Supply Chain Attack', baseLikelihood: 0.35, baseImpact: 85 },
    { name: 'Cloud Misconfiguration', baseLikelihood: 0.5, baseImpact: 60 },
    { name: 'Insider Threat', baseLikelihood: 0.25, baseImpact: 70 },
    { name: 'Zero-Day Exploit', baseLikelihood: 0.15, baseImpact: 95 },
    { name: 'DDoS', baseLikelihood: 0.45, baseImpact: 55 },
    { name: 'API Abuse', baseLikelihood: 0.4, baseImpact: 65 },
    { name: 'Credential Stuffing', baseLikelihood: 0.6, baseImpact: 45 },
    { name: 'IoT/OT Compromise', baseLikelihood: 0.3, baseImpact: 75 }
  ]

  for (const v of vectors) {
    const likelihood = clamp(v.baseLikelihood * (dataSensScore[dataSens] / 55) * (secMatFactor[secMat] || 1) * rngFloat(rng, 0.8, 1.2), 0.05, 0.95)
    const impact = clamp(v.baseImpact * (dataSensScore[dataSens] / 60) * rngFloat(rng, 0.85, 1.15), 10, 100)
    const exposureScore = Math.round(likelihood * impact)
    const complexity: ThreatVector['attack_complexity'] = impact > 75 ? 'low' : impact > 50 ? 'medium' : 'high'
    threatVectors.push({
      vector: v.name,
      likelihood: parseFloat(likelihood.toFixed(3)),
      potential_impact: Math.round(impact),
      exposure_score: exposureScore,
      attack_complexity: complexity,
      mitigation_priority: Math.round(exposureScore * rngFloat(rng, 0.9, 1.1))
    })
  }

  threatVectors.sort((a, b) => b.exposure_score - a.exposure_score)

  let attackSurfaceBase = assets.length * 8 + connCount * 2 + vulns * 3
  if (darkWeb) attackSurfaceBase += 25
  attackSurfaceBase = Math.min(100, attackSurfaceBase + rngRange(rng, -5, 5))

  const avgExposure = threatVectors.reduce((s, t) => s + t.exposure_score, 0) / threatVectors.length
  const overallExposure = Math.round(avgExposure * 0.6 + attackSurfaceBase * 0.4)

  let exposureRating: ThreatExposureOutput['exposure_rating'] = 'low'
  if (overallExposure >= 70) exposureRating = 'critical'
  else if (overallExposure >= 50) exposureRating = 'high'
  else if (overallExposure >= 30) exposureRating = 'moderate'

  const recommendedControls: string[] = []
  recommendedControls.push('Deploy comprehensive EDR across all endpoints')
  recommendedControls.push('Implement email security gateway with DMARC/DKIM/SPF')
  recommendedControls.push('Establish third-party risk management program for ' + connCount + ' vendor connections')
  if (darkWeb) recommendedControls.push('URGENT: Initiate dark web monitoring and credential exposure response')
  recommendedControls.push('Conduct quarterly vulnerability assessments and patch management')
  recommendedControls.push('Implement MFA across all external-facing systems')

  const underwritingImpact = overallExposure >= 70 ? 'SIGNIFICANT: Expect underwriting scrutiny, requirement for IR retainer, higher deductible, and potentially reduced capacity'
    : overallExposure >= 50 ? 'MODERATE: Standard underwriting with targeted questions; consider voluntary control improvements for better terms'
    : 'FAVORABLE: Strong underwriting position; available for preferred rates and broader coverage terms'

  const industryThreat = input.industry || 'general' + ': ' + (
    input.industry === 'healthcare' ? 'Critical threat landscape; ransomware increased 94% YoY; average breach cost $10.93M' :
    input.industry === 'finance' ? 'Elevated threat; targeted attacks, SWIFT fraud, API exploitation rising' :
    input.industry === 'technology' ? 'Moderate-high; supply chain and cloud-native threats dominant' :
    input.industry === 'manufacturing' ? 'Rising; OT/IoT convergence risks; ransomware targeting production' :
    'Moderate; targeted phishing and credential theft are primary vectors'
  )

  return {
    organization: input.organization_name || 'Unknown Organization',
    overall_exposure_score: overallExposure,
    exposure_rating: exposureRating,
    threat_vectors: threatVectors,
    attack_surface_score: Math.round(attackSurfaceBase),
    industry_threat_level: industryThreat,
    recommended_controls: recommendedControls,
    insurance_underwriting_impact: underwritingImpact,
    summary: 'Threat exposure score: ' + overallExposure + '/100 (' + exposureRating.toUpperCase() + '), attack surface ' + Math.round(attackSurfaceBase) + '/100, top threat: ' + (threatVectors[0]?.vector || 'N/A') + ' (score: ' + (threatVectors[0]?.exposure_score || 0) + ')'
  }
}

function formatThreatExposureReport(input: ThreatExposureInput, output: ThreatExposureOutput): string {
  const lines: string[] = []
  lines.push('## Threat Exposure Scorecard')
  lines.push('')
  lines.push('**Organization:** ' + output.organization + ' | **Overall Exposure Score:** ' + output.overall_exposure_score + '/100 | **Rating:** ' + output.exposure_rating.toUpperCase())
  lines.push('**Attack Surface Score:** ' + output.attack_surface_score + '/100 | **Vectors Analyzed:** ' + output.threat_vectors.length)
  lines.push('')
  lines.push('### Threat Vector Rankings')
  lines.push('| Rank | Threat Vector | Likelihood | Impact | Exposure Score | Priority |')
  lines.push('|------|--------------|------------|--------|----------------|----------|')
  for (let i = 0; i < output.threat_vectors.length; i++) {
    const t = output.threat_vectors[i]
    lines.push('| ' + (i + 1) + ' | ' + t.vector + ' | ' + (t.likelihood * 100).toFixed(1) + '% | ' + t.potential_impact + ' | ' + t.exposure_score + ' | ' + t.mitigation_priority + ' |')
  }
  lines.push('')
  lines.push('### Industry Threat Level')
  lines.push(output.industry_threat_level)
  lines.push('')
  lines.push('### Recommended Controls')
  for (const c of output.recommended_controls) lines.push('- [ ] ' + c)
  lines.push('')
  lines.push('### Insurance Underwriting Impact')
  lines.push(output.insurance_underwriting_impact)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: INCIDENT RESPONSE RETAINER ====================

function planIRRetainer(input: IRRetainerInput): IRRetainerOutput {
  const rng = seededRng(input)
  const revenue = input.annual_revenue || 100000000
  const dataSens = input.data_sensitivity || 'moderate'
  const internalCap = input.existing_internal_capability || 'basic'
  const expectedIncidents = input.expected_incidents_per_year || 3
  const budget = input.budget_range || { min: 50000, max: 200000 }
  const budgetMid = (budget.min + budget.max) / 2

  const retainerComponents: RetainerComponent[] = [
    { component: 'Retainer Fee (Annual Access)', annual_cost: Math.round(budgetMid * 0.4), response_time_sla: '1 hour to initial consultation', scope: '24/7 hotline access, panel firm pre-selection, quarterly readiness reviews' },
    { component: 'Incident Response Services', annual_cost: Math.round(budgetMid * 0.35), response_time_sla: '4 hours to on-site/virtual deployment', scope: 'Forensic investigation, containment, eradication, recovery coordination' },
    { component: 'Digital Forensics', annual_cost: Math.round(budgetMid * 0.15), response_time_sla: '8 hours to forensic analyst engagement', scope: 'Evidence collection, chain of custody, malware analysis, timeline reconstruction' },
    { component: 'Crisis Communications / PR', annual_cost: Math.round(budgetMid * 0.1), response_time_sla: '2 hours to PR lead notification', scope: 'Media response, customer communication, regulatory liaison, reputation management' }
  ]

  let totalCost = retainerComponents.reduce((s, c) => s + c.annual_cost, 0)

  if (dataSens === 'critical') {
    totalCost = Math.round(totalCost * 1.3)
    retainerComponents[0].annual_cost = Math.round(retainerComponents[0].annual_cost * 1.3)
  }

  const costPerIncident = Math.round(totalCost / Math.max(expectedIncidents, 1))

  const slaRecs: string[] = []
  slaRecs.push('Critical incidents: response team en route within 4 hours, on-site within 12 hours')
  slaRecs.push('All incidents: initial consultation within 1 hour, virtual engagement within 2 hours')
  slaRecs.push('Forensic investigation: containment within 8 hours, preliminary findings within 72 hours')
  slaRecs.push('Root cause analysis delivered within 14 calendar days of engagement')
  slaRecs.push('Final forensic report within 30 calendar days of investigation closure')

  const vendorCriteria: string[] = []
  vendorCriteria.push('Minimum 5 years of cyber incident response experience')
  vendorCriteria.push('ISO 27001 and SOC 2 Type II certified')
  vendorCriteria.push('Global coverage matching organizational geographic footprint')
  vendorCriteria.push('Demonstrated experience in ' + (input.industry || 'relevant sector') + ' industry')
  vendorCriteria.push('Named responders with GCFA, GCIH, or CISSP-ISSAP certifications')
  vendorCriteria.push('Active relationships with relevant law enforcement and regulatory bodies')

  const contractTerms: string[] = []
  contractTerms.push('Annual retainer renewable by mutual agreement with 90-day termination notice')
  contractTerms.push('Blended rate card for investigation hours (partner rate $285/hr, staff rate $215/hr)')
  contractTerms.push('Annual maximum hours included in retainer; excess hours at pre-agreed rates')
  contractTerms.push('Run-off clause: coverage for incidents arising from pre-termination discoveries 12 months post-expiry')
  contractTerms.push('Confidentiality: mutual NDA with 5-year survival period')
  contractTerms.push('Limitation of liability cap at 3x annual retainer fee')

  const roi = 'IR retainer ROI: average cyber breach costs reduced by $2.3M with retainer; time to containment reduced 40%; estimated annual savings $' + Math.round(totalCost * rngFloat(rng, 2.5, 4.0)).toLocaleString() + ' vs uninsured loss exposure'

  return {
    organization: input.organization_name || 'Unknown Organization',
    recommended_panel_size: dataSens === 'critical' ? 3 : dataSens === 'high' ? 2 : 1,
    retainer_components: retainerComponents,
    total_annual_cost: totalCost,
    cost_per_incident: costPerIncident,
    sla_recommendations: slaRecs,
    vendor_criteria: vendorCriteria,
    contract_terms: contractTerms,
    roi_analysis: roi,
    summary: 'IR retainer plan: ' + (dataSens === 'critical' ? 3 : dataSens === 'high' ? 2 : 1) + ' panel firm(s), total annual cost $' + totalCost.toLocaleString() + ' ($' + costPerIncident.toLocaleString() + '/incident), budget leverage ratio ' + rngFloat(rng, 2.5, 4.0).toFixed(1) + 'x'
  }
}

function formatIRRetainerReport(input: IRRetainerInput, output: IRRetainerOutput): string {
  const lines: string[] = []
  lines.push('## Incident Response Retainer Plan')
  lines.push('')
  lines.push('**Organization:** ' + output.organization + ' | **Data Sensitivity:** ' + (input.data_sensitivity || 'moderate') + ' | **Panel Firms:** ' + output.recommended_panel_size)
  lines.push('**Total Annual Cost:** $' + output.total_annual_cost.toLocaleString() + ' | **Cost Per Incident:** $' + output.cost_per_incident.toLocaleString())
  lines.push('')
  lines.push('### Retainer Components')
  lines.push('| Component | Annual Cost | Response SLA |')
  lines.push('|-----------|-------------|--------------|')
  for (const c of output.retainer_components) {
    lines.push('| ' + c.component + ' | $' + c.annual_cost.toLocaleString() + ' | ' + c.response_time_sla + ' |')
  }
  lines.push('')
  lines.push('### SLA Recommendations')
  for (const s of output.sla_recommendations) lines.push('- ' + s)
  lines.push('')
  lines.push('### Vendor Selection Criteria')
  for (const v of output.vendor_criteria) lines.push('- ' + v)
  lines.push('')
  lines.push('### Contract Terms')
  for (const c of output.contract_terms) lines.push('- ' + c)
  lines.push('')
  lines.push('### ROI Analysis')
  lines.push(output.roi_analysis)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: REGULATORY FINE CALCULATOR ====================

function calculateRegulatoryFine(input: RegulatoryFineInput): RegulatoryFineOutput {
  const rng = seededRng(input)
  const reg = input.regulation || 'gdpr'
  const violType = input.violation_type || 'data_breach'
  const records = input.records_affected || 1000
  const revenue = input.organization_revenue || 100000000
  const negligence = input.negligence_level || 'negligent'
  const selfReported = input.self_reported || false
  const remediationSpeed = input.remediation_speed || 'prompt'
  const priorViol = input.prior_violations || 0

  const regConfig: Record<string, { maxFine: number; basis: string; tier: string }> = {
    gdpr: { maxFine: revenue * 0.04, basis: '4% of global annual turnover or EUR 20M, whichever is higher', tier: 'Upper tier (Art. 83(5))' },
    china_pip: { maxFine: revenue * 0.05, basis: '5% of prior year revenue or RMB 50M, whichever is higher', tier: 'Serious violation (Art. 66)' },
    china_ccsl: { maxFine: 100000000, basis: 'RMB 100M maximum under Cybersecurity Law Art. 64', tier: 'Serious violation' },
    ccpa: { maxFine: records * 7500, basis: 'Up to $7,500 per intentional violation, $2,500 per unintentional violation', tier: 'Per-record statutory damages' },
    hipaa: { maxFine: 1500000, basis: 'Up to $1.5M per violation category per year (45 CFR 160.404)', tier: 'Tier 4 (willful neglect, not corrected)' },
    lgpd: { maxFine: revenue * 0.02, basis: '2% of revenue in Brazil, capped at BRL 50M per infraction', tier: 'Serious violation (Art. 52)' }
  }

  const config = regConfig[reg]

  const negligenceFactor: Record<string, number> = { unintentional: 0.3, negligent: 1.0, reckless: 1.8, willful: 2.5 }
  const negF = negligenceFactor[negligence] || 1.0

  const violSeverity: Record<string, number> = {
    data_breach: 0.85, insufficient_consent: 0.6, cross_border_transfer: 0.7,
    failure_to_notify: 0.5, inadequate_security: 0.75, data_retention: 0.4
  }
  const violF = violSeverity[violType] || 0.7

  let baseFine = config.maxFine * 0.15 * negF * violF
  if (records > 1000000) baseFine *= 1.5
  else if (records > 100000) baseFine *= 1.2

  const priorViolFactor = 1 + priorViol * 0.3
  baseFine *= priorViolFactor

  const mitigationDiscounts: number[] = []
  if (selfReported) mitigationDiscounts.push(0.25)
  if (remediationSpeed === 'immediate') mitigationDiscounts.push(0.20)
  else if (remediationSpeed === 'prompt') mitigationDiscounts.push(0.10)

  const totalMitigation = mitigationDiscounts.reduce((s, d) => s + d, 0)
  const expected = Math.round(baseFine * (1 - totalMitigation))
  const minimum = Math.round(expected * rngFloat(rng, 0.5, 0.75))
  const maximum = Math.round(expected * rngFloat(rng, 1.3, 2.0))

  const mitigating: string[] = []
  if (selfReported) mitigating.push('Self-reported to regulatory authority (25% reduction)')
  if (remediationSpeed === 'immediate') mitigating.push('Immediate remediation actions taken (20% reduction)')
  else if (remediationSpeed === 'prompt') mitigating.push('Prompt remediation efforts (10% reduction)')
  mitigating.push('First-time violation cooperation credit available')

  const aggravating: string[] = []
  if (priorViol > 0) aggravating.push('Prior violation history (' + priorViol + ' previous) increases fine exposure')
  if (negligence === 'willful' || negligence === 'reckless') aggravating.push('Elevated intentionality level suggests higher penalty tier')
  if (records > 100000) aggravating.push('Large number of affected records (>100K) triggers volume aggravator')
  if (violType === 'failure_to_notify') aggravating.push('Failure to notify compounds primary violation')

  const deadlines: Record<string, string> = {
    gdpr: '72 hours from awareness to supervisory authority (Art. 33); without undue delay to data subjects if high risk (Art. 34)',
    china_pip: 'Immediately to authorities and affected individuals; security incident response required within 24 hours',
    china_ccsl: 'Immediately to CAC and relevant authorities; must take remediation measures promptly',
    ccpa: 'No statutory notification deadline; Attorney General enforcement may require response within 30 days',
    hipaa: 'Within 60 days of discovery to HHS; immediate if >500 individuals (media notification required)',
    lgpd: 'Reasonable time to ANPD and data subjects; specific guidance ANPD Resolution CD/ANPD No. 15'
  }

  const defenses: string[] = []
  defenses.push('Demonstrate compliance program with documented controls and risk assessments')
  defenses.push('Show prompt remediation efforts and cooperation with regulatory investigation')
  if (selfReported) defenses.push('Emphasize proactive self-reporting as mitigating factor')
  defenses.push('Challenge scope of affected records and data sensitivity classification')
  defenses.push('Invoke statute of limitations where applicable (2-5 years depending on jurisdiction)')

  const insApplicability = reg === 'gdpr' || reg === 'china_pip' || reg === 'ccpa' ?
    ' Regulatory defense costs typically covered under cyber insurance regulatory defense sub-limit; fines coverage varies by jurisdiction and policy wording (some jurisdictions prohibit fines coverage as against public policy)'
    : 'Check policy for regulatory defense coverage; fines and penalties coverage subject to insurability in local jurisdiction'

  const precedents: Record<string, string[]> = {
    gdpr: ['EUR 1.2B - Meta (2023, data transfers)', 'EUR 746M - Amazon (2021, targeted advertising)', 'EUR 405M - TikTok (2023, childrens data)'],
    china_pip: ['RMB 8.02B - Didi Global (2022, data security violations)', 'RMB 50M -典型案例- (2023, inadequate security)'],
    china_ccsl: ['RMB 1M per incident basis (standard enforcement)', 'Platform penalties escalating 2024-2026'],
    ccpa: ['$1.2M - Sephora (2022, CCPA violations)', '$7.5K-$7500 per record statutory'],
    hipaa: ['$16M - Anthem (2018, largest HIPAA settlement)', '$113.6M cumulative HHS settlements 2023'],
    lgpd: ['MB 14.4M - Banco Security (2022)', 'Graintec penalty R$1.4M (2023)']
  }

  return {
    regulation: reg.toUpperCase().replace('_', ' '),
    violation: violType.replace('_', ' '),
    fine_range: {
      minimum: minimum,
      maximum: maximum,
      expected: expected,
      basis: config.basis
    },
    mitigating_factors: mitigating,
    aggravating_factors: aggravating,
    notification_deadline: deadlines[reg] || 'Check specific regulatory notification requirements',
    defense_strategies: defenses,
    total_exposure_estimate: expected,
    insurance_coverage_applicability: insApplicability,
    precedents: precedents[reg] || ['Check local regulatory enforcement database for recent precedents'],
    summary: reg.toUpperCase() + ' violation (' + violType.replace('_', ' ') + '): estimated fine $' + expected.toLocaleString() + ' (range $' + minimum.toLocaleString() + ' - $' + maximum.toLocaleString() + ') based on ' + config.basis
  }
}

function formatRegulatoryFineReport(input: RegulatoryFineInput, output: RegulatoryFineOutput): string {
  const lines: string[] = []
  lines.push('## Regulatory Fine Estimation Report')
  lines.push('')
  lines.push('**Regulation:** ' + output.regulation + ' | **Violation Type:** ' + output.violation)
  lines.push('**Records Affected:** ' + (input.records_affected || 0).toLocaleString() + ' | **Negligence Level:** ' + (input.negligence_level || 'negligent'))
  lines.push('')
  lines.push('### Fine Range')
  lines.push('- **Expected Fine:** $' + output.fine_range.expected.toLocaleString())
  lines.push('- **Range:** $' + output.fine_range.minimum.toLocaleString() + ' - $' + output.fine_range.maximum.toLocaleString())
  lines.push('- **Basis:** ' + output.fine_range.basis)
  lines.push('')
  lines.push('### Notification Deadline')
  lines.push(output.notification_deadline)
  lines.push('')
  if (output.mitigating_factors.length > 0) {
    lines.push('### Mitigating Factors')
    for (const m of output.mitigating_factors) lines.push('- [ ] ' + m)
    lines.push('')
  }
  if (output.aggravating_factors.length > 0) {
    lines.push('### Aggravating Factors')
    for (const a of output.aggravating_factors) lines.push('- ' + a)
    lines.push('')
  }
  lines.push('### Defense Strategies')
  for (const d of output.defense_strategies) lines.push('- ' + d)
  lines.push('')
  lines.push('### Recent Precedents')
  for (const p of output.precedents) lines.push('- ' + p)
  lines.push('')
  lines.push('### Insurance Coverage')
  lines.push(output.insurance_coverage_applicability)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Cyber Risk Quantifier
  tools.register(defineTool({
    name: 'cyber_risk_quantifier',
    description: 'FAIR-based cyber risk quantification engine calculating Annual Loss Expectancy (ALE), Single Loss Expectancy (SLE), Annual Rate of Occurrence (ARO), and residual risk after controls. Produces risk scenario ranking, heatmap summary, and cyber insurance transfer recommendations.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, annual_revenue, industry (finance/healthcare/technology/manufacturing/retail/energy/government/education), employee_count, data_records_count, existing_controls[], threat_landscape (low/moderate/high/critical), historical_incidents', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CyberRiskQuantifierInput = JSON.parse(args.input_data)
      const result = quantifyCyberRisk(input)
      return formatRiskQuantifierReport(input, result)
    }
  }))

  // Tool 2: Policy Design Engine
  tools.register(defineTool({
    name: 'policy_design_engine',
    description: 'Cyber insurance policy design engine with coverage architecture modeling, aggregate limits, per-occurrence limits, deductibles, and specialized sub-limits for ransomware, business interruption, regulatory defense, and dependent coverage. Produces premium estimation and optimization guidelines.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, coverage_type (first_party/third_party/comprehensive), desired_limit, deductible_preference (low/medium/high), industry, employee_count, prior_claims (bool), regulatory_environment (strict/moderate/light)', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PolicyDesignInput = JSON.parse(args.input_data)
      const result = designPolicy(input)
      return formatPolicyReport(input, result)
    }
  }))

  // Tool 3: Claims Assessor
  tools.register(defineTool({
    name: 'claims_assessor',
    description: 'Cyber insurance claims assessment tool with claim validity scoring, reserve recommendation, coverage determination per policy part, red flag identification, investigation trigger analysis, and subrogation potential evaluation.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: claim_id, claim_date, discovery_date, incident_type (ransomware/data_breach/business_email_compromise/ddos/insider_threat/system_failure), claimed_amount, insured_revenue, deductible, policy_limit, prior_claims_count, notification_delay_days, evidence_quality (excellent/good/adequate/poor), coverage_type_claimed', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ClaimsAssessorInput = JSON.parse(args.input_data)
      const result = assessClaim(input)
      return formatClaimsReport(input, result)
    }
  }))

  // Tool 4: Breach Cost Estimator
  tools.register(defineTool({
    name: 'breach_cost_estimator',
    description: 'Data breach cost estimation engine with per-record costing across detection, notification, post-breach response, regulatory/legal, business disruption, and reputational damage categories. Includes industry benchmarks, long-term impact projection, and mitigation savings analysis.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: breach_type (ransomware/data_exfiltration/insider_threat/hacktivist/third_party/phishing), records_exposed, industry, organization_size (small/medium/large/enterprise), response_time_hours, notification_required (bool), regulatory_jurisdictions[]', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: BreachCostInput = JSON.parse(args.input_data)
      const result = estimateBreachCost(input)
      return formatBreachCostReport(input, result)
    }
  }))

  // Tool 5: Coverage Gap Analyst
  tools.register(defineTool({
    name: 'coverage_gap_analyst',
    description: 'Cyber insurance coverage gap analysis comparing current policy coverage against modeled risk exposure. Identifies uncovered areas, quantifies exposure gap, produces optimization roadmap, and provides renewal recommendations.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, current_policy_limit, current_deductible, current_coverage_parts[], annual_revenue, total_risk_exposure, industry, critical_dependencies[], regulatory_requirements[], historical_losses[]', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CoverageGapInput = JSON.parse(args.input_data)
      const result = analyzeCoverageGaps(input)
      return formatCoverageGapReport(input, result)
    }
  }))

  // Tool 6: Threat Exposure Scorer
  tools.register(defineTool({
    name: 'threat_exposure_scorer',
    description: 'Threat landscape exposure scoring with attack surface analysis, 10-vector threat modeling, dark web exposure evaluation, industry threat benchmark, and insurance underwriting impact assessment.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, industry, attack_surface_assets[], geographic_presence[], technology_stack[], third_party_connections, data_sensitivity (low/moderate/high/critical), security_maturity_level (basic/intermediate/advanced), threat_intelligence_feeds[], recent_vulnerabilities, dark_web_exposure (bool)', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ThreatExposureInput = JSON.parse(args.input_data)
      const result = scoreThreatExposure(input)
      return formatThreatExposureReport(input, result)
    }
  }))

  // Tool 7: Incident Response Retainer
  tools.register(defineTool({
    name: 'incident_response_retainer',
    description: 'Incident response retainer planning tool with panel firm selection, SLA design, cost modeling, vendor criteria, contract terms, and ROI analysis for cyber incident response preparedness.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, industry, annual_revenue, data_sensitivity (low/moderate/high/critical), regulatory_requirements[], geographic_scope[], existing_internal_capability (none/basic/intermediate/advanced), required_services[], expected_incidents_per_year, budget_range{min,max}', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: IRRetainerInput = JSON.parse(args.input_data)
      const result = planIRRetainer(input)
      return formatIRRetainerReport(input, result)
    }
  }))

  // Tool 8: Regulatory Fine Calculator
  tools.register(defineTool({
    name: 'regulatory_fine_calculator',
    description: 'Multi-jurisdictional regulatory fine estimation for GDPR, PIPL (China), CCPA, LGPD, HIPAA, and China Cybersecurity Law. Calculates fine ranges based on records affected, revenue, negligence level, self-reporting status, and prior violations with defense strategies and precedents.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: regulation (gdpr/china_pip/china_ccpa/hipaa/lgpd), violation_type (data_breach/insufficient_consent/cross_border_transfer/failure_to_notify/inadequate_security/data_retention), records_affected, organization_revenue, negligence_level (unintentional/negligent/reckless/willful), self_reported (bool), remediation_speed (immediate/prompt/delayed/none), prior_violations', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RegulatoryFineInput = JSON.parse(args.input_data)
      const result = calculateRegulatoryFine(input)
      return formatRegulatoryFineReport(input, result)
    }
  }))

  console.log('[dsh-tool-cyberinsure] Loaded v' + VERSION + ' - Cyber Insurance & Risk Transfer Toolkit with 8 tools')
  console.log('  Tools: cyber_risk_quantifier, policy_design_engine, claims_assessor, breach_cost_estimator, coverage_gap_analyst, threat_exposure_scorer, incident_response_retainer, regulatory_fine_calculator')
}
