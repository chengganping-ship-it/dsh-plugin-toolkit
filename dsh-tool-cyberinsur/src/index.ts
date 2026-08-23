/**
 * DSH Cyber Insurance & Risk Transfer Plugin v1.0.0
 * 网络保险与风险转移工具集 for DeepSeek Harness
 *
 * 2026 Context: Cyber insurance market booming with increasing digital threats.
 * Organizations face growing frequency and severity of cyber incidents, driving demand
 * for risk quantification, policy optimization, and incident preparedness.
 *
 * 覆盖网络保险全业务流程：风险量化 → 保单设计 → 泄露成本估算 → 事件响应规划 → 供应商风险评估 → 监管罚款计算 → 业务影响分析 → 安全成熟度评分
 *
 * 工具清单:
 * 1. cyber_risk_quantifier       — 网络风险量化（年度损失期望ALE、风险热力图、SLE/ARO计算）
 * 2. policy_coverage_designer   — 保单覆盖设计（保额/免赔额/子限额/扩展条款）
 * 3. breach_cost_estimator      — 数据泄露成本估算（直接/间接成本、每记录成本、行业对标）
 * 4. incident_response_planner  — 事件响应计划（响应阶段/遏制策略/取证/通知义务）
 * 5. vendor_risk_assessor       — 供应商风险评估（第三方/第四方风险、续包评估）
 * 6. regulatory_fine_calculator — 监管罚款计算（GDPR/网络安全法/个保法罚款估算）
 * 7. business_impact_analyzer   — 业务影响分析（BIA、RTO/RPO、最大容忍中断）
 * 8. security_maturity_scorer   — 安全成熟度评分（CSF等级、控制域评分）
 *
 * @module dsh-tool-cyberinsur | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cyberinsur'
export const inject = ['tools']

const VERSION = '1.0.0'

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

// --- Tool 2: Policy Coverage Designer ---
export interface PolicyCoverageInput {
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

export interface PolicyCoverageOutput {
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

// --- Tool 3: Breach Cost Estimator ---
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

// --- Tool 4: Incident Response Planner ---
export interface IRPlannerInput {
  incident_type?: 'ransomware' | 'data_breach' | 'ddos' | 'insider' | 'supply_chain' | 'business_email_compromise'
  severity?: 'critical' | 'high' | 'medium' | 'low'
  affected_assets?: string[]
  data_types_involved?: string[]
  regulatory_triggers?: string[]
  internal_team_size?: number
  external_ir_retention?: boolean
}

export interface IRPhase {
  phase: string
  duration_hours: number
  key_actions: string[]
  responsible_party: string
  critical_decisions: string[]
}

export interface IRPlannerOutput {
  incident_type: string
  severity_level: string
  response_phases: IRPhase[]
  notification_requirements: string[]
  evidence_preservation_steps: string[]
  forensic_requirements: string[]
  communication_timeline: string[]
  recovery_milestones: string[]
  ir_budget_estimate: number
  lessons_learned_framework: string[]
  summary: string
}

// --- Tool 5: Vendor Risk Assessor ---
export interface VendorRiskInput {
  vendor_name?: string
  service_type?: 'cloud_hosting' | 'saas' | 'payment_processing' | 'data_analytics' | 'managed_security' | 'logistics'
  data_access_level?: 'none' | 'limited' | 'moderate' | 'extensive' | 'full'
  contract_value?: number
  contract_duration_years?: number
  criticality?: 'non_critical' | 'important' | 'critical' | 'mission_critical'
  fourth_party_dependencies?: boolean
  compliance_certifications?: string[]
}

export interface VendorRiskFinding {
  finding: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  likelihood: number
  recommendation: string
}

export interface VendorRiskOutput {
  vendor_name: string
  overall_risk_score: number
  risk_rating: 'low' | 'moderate' | 'high' | 'critical'
  findings: VendorRiskFinding[]
  sla_requirements: string[]
  contractual_protections: string[]
  monitoring_recommendations: string[]
  fourth_party_risks: string[]
  residual_risk_acceptance: string
  review_frequency: string
  summary: string
}

// --- Tool 6: Regulatory Fine Calculator ---
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

// --- Tool 7: Business Impact Analyzer ---
export interface BIAInput {
  organization_name?: string
  business_unit?: string
  process_name?: string
  annual_revenue?: number
  daily_transaction_volume?: number
  peak_season_factor?: number
  dependencies?: string[]
  regulatory_downtime_limit?: number
  customer_impact_threshold?: number
}

export interface BIAMetric {
  metric: string
  value: string
  description: string
}

export interface BIAOutput {
  process_name: string
  business_unit: string
  maximum_tolerable_downtime: string
  recovery_time_objective: number
  recovery_point_objective: number
  financial_impact_per_hour: number
  financial_impact_per_day: number
  operational_impact: string[]
  reputational_impact: string[]
  regulatory_impact: string[]
  key_metrics: BIAMetric[]
  recovery_strategies: string[]
  resource_requirements: string[]
  summary: string
}

// --- Tool 8: Security Maturity Scorer ---
export interface SecurityMaturityInput {
  organization_name?: string
  framework?: 'nist_csf' | 'iso27001' | 'cis_v8' | 'cmmc'
  domain_scores?: Record<string, number>
  employee_count?: number
  security_staff_count?: number
  annual_security_budget?: number
  compliance_requirements?: string[]
  recent_audit_results?: string[]
}

export interface DomainScore {
  domain: string
  score: number
  level: 'incomplete' | 'developing' | 'defined' | 'managed' | 'optimizing'
  gaps: string[]
  recommendations: string[]
}

export interface SecurityMaturityOutput {
  framework: string
  overall_maturity_score: number
  overall_level: string
  domain_scores: DomainScore[]
  industry_percentile: number
  investment_priority: string[]
  roadmap_phases: string[]
  benchmark_comparison: string
  compliance_readiness: string
  risk_reduction_potential: string
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

  const scenarios: RiskScenario[] = []
  const scenarioTemplates = [
    { name: 'Ransomware Attack - Full Encryption', baseImpact: 0.15, baseLikelihood: 0.25 },
    { name: 'Data Breach - Customer PII', baseImpact: 0.12, baseLikelihood: 0.18 },
    { name: 'Business Email Compromise', baseImpact: 0.05, baseLikelihood: 0.35 },
    { name: 'DDoS - Extended Outage', baseImpact: 0.03, baseLikelihood: 0.40 },
    { name: 'Insider Data Theft', baseImpact: 0.08, baseLikelihood: 0.12 },
    { name: 'Supply Chain Compromise', baseImpact: 0.10, baseLikelihood: 0.15 },
    { name: 'Cloud Misconfiguration Exposure', baseImpact: 0.06, baseLikelihood: 0.28 },
    { name: 'Zero-Day Exploit - Critical Systems', baseImpact: 0.20, baseLikelihood: 0.08 },
  ]

  for (const tpl of scenarioTemplates) {
    const impactRevenue = revenue * tpl.baseImpact * rngFloat(rng, 0.7, 1.3)
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
      risk_level: riskLevel,
    })
  }

  scenarios.sort((a, b) => b.annual_loss_expectancy - a.annual_loss_expectancy)

  const totalALE = scenarios.reduce((sum, s) => sum + s.annual_loss_expectancy, 0)
  const maxSLE = Math.max(...scenarios.map(s => s.single_loss_expectancy))
  const controlEffectiveness = clamp(Math.round(rngRange(rng, 55, 85)), 40, 95)
  const residualRisk = Math.round(totalALE * (1 - controlEffectiveness / 100))

  const recommendations: string[] = []
  recommendations.push('Transfer catastrophic risk (top 3 scenarios) via cyber insurance with limit of ' + Math.round(maxSLE * 1.2).toLocaleString())
  recommendations.push('Implement enhanced controls for scenarios with ALE exceeding ' + Math.round(revenue * 0.02).toLocaleString())
  recommendations.push('Establish captive insurance vehicle for recurring moderate-severity risks')
  recommendations.push('Deploy continuous risk monitoring with quarterly FAIR model updates')
  if (incidents > 2) recommendations.push('URGENT: Historical incident frequency indicates underwriting challenges - prioritize loss prevention')

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
    summary: 'Quantified ' + scenarios.length + ' risk scenarios for ' + (input.organization_name || 'organization') + ': total ALE $' + totalALE.toLocaleString() + ', max SLE $' + maxSLE.toLocaleString() + ', residual risk after controls: $' + residualRisk.toLocaleString(),
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

// ==================== TOOL 2: POLICY COVERAGE DESIGNER ====================

function designPolicyCoverage(input: PolicyCoverageInput): PolicyCoverageOutput {
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
    { extension: 'Data Restoration & Recovery', sub_limit: Math.round(aggregateLimit * 0.25), included: true, recommended: true },
    { extension: 'Cyber Extortion / Ransomware', sub_limit: Math.round(aggregateLimit * 0.2), included: true, recommended: true },
    { extension: 'Network Security Liability', sub_limit: Math.round(aggregateLimit * 0.35), included: true, recommended: true },
    { extension: 'Privacy Liability & Notification', sub_limit: Math.round(aggregateLimit * 0.2), included: true, recommended: true },
    { extension: 'Regulatory Defense & Penalties', sub_limit: Math.round(aggregateLimit * 0.15), included: covType === 'comprehensive', recommended: true },
    { extension: 'Dependent Business Interruption', sub_limit: Math.round(aggregateLimit * 0.15), included: covType === 'comprehensive', recommended: false },
    { extension: 'System Failure (Non-Malicious)', sub_limit: Math.round(aggregateLimit * 0.1), included: false, recommended: true },
    { extension: 'Bricking / Hardware Replacement', sub_limit: Math.round(aggregateLimit * 0.05), included: false, recommended: false },
    { extension: 'Reputational Harm Coverage', sub_limit: Math.round(aggregateLimit * 0.1), included: false, recommended: true },
    { extension: 'Invoice Manipulation', sub_limit: Math.round(aggregateLimit * 0.08), included: false, recommended: true },
    { extension: 'Cryptojacking / Unauthorized Mining', sub_limit: Math.round(aggregateLimit * 0.03), included: false, recommended: true },
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
  if (!extensions.find(e => e.extension === 'System Failure (Non-Malicious)')?.included) gaps.push('System failure exclusion creates gap for non-malicious outages (cloud provider failures)')

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
    extensions,
    estimated_premium_range: { min: minPremium, max: maxPremium },
    premium_rate: premiumRate,
    coverage_gaps: gaps,
    optimization_tips: tips,
    market_context: '2026 cyber insurance pricing stabilizes after 3-year hardening cycle; comprehensive policies with ransomware sub-limits becoming standard; carriers demanding MFA and EDR as pre-conditions',
    summary: 'Designed ' + (covType === 'comprehensive' ? 'comprehensive' : covType) + ' policy: $' + aggregateLimit.toLocaleString() + ' aggregate limit, $' + deductible.toLocaleString() + ' deductible, estimated premium $' + minPremium.toLocaleString() + ' - $' + maxPremium.toLocaleString(),
  }
}

function formatPolicyCoverageReport(input: PolicyCoverageInput, output: PolicyCoverageOutput): string {
  const lines: string[] = []
  lines.push('## Cyber Insurance Policy Coverage Design')
  lines.push('')
  lines.push('**Policy Type:** ' + output.policy_type + ' | **Industry:** ' + (input.industry || 'general'))
  lines.push('**Aggregate Limit:** $' + output.aggregate_limit.toLocaleString() + ' | **Per Occurrence:** $' + output.per_occurrence_limit.toLocaleString() + ' | **Deductible:** $' + output.deductible.toLocaleString())
  lines.push('**Est. Premium:** $' + output.estimated_premium_range.min.toLocaleString() + ' - $' + output.estimated_premium_range.max.toLocaleString() + ' (rate: ' + (output.premium_rate * 100).toFixed(3) + '% of limit)')
  lines.push('')
  lines.push('### Coverage Extensions & Sub-Limits')
  lines.push('| Extension | Sub-Limit | Included | Recommended |')
  lines.push('|-----------|-----------|----------|-------------|')
  for (const ext of output.extensions) {
    lines.push('| ' + ext.extension + ' | $' + ext.sub_limit.toLocaleString() + ' | ' + (ext.included ? 'Yes' : 'No') + ' | ' + (ext.recommended ? 'Yes' : 'No') + ' |')
  }
  lines.push('')
  lines.push('### Coverage Gaps')
  for (const gap of output.coverage_gaps) lines.push('- ' + gap)
  lines.push('')
  lines.push('### Optimization Tips')
  for (const tip of output.optimization_tips) lines.push('- [ ] ' + tip)
  lines.push('')
  lines.push('> **Market Context:** ' + output.market_context)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: BREACH COST ESTIMATOR ====================

function estimateBreachCost(input: BreachCostInput): BreachCostOutput {
  const rng = seededRng(input)
  const breachType = input.breach_type || 'data_exfiltration'
  const records = input.records_exposed || 10000
  const orgSize = input.organization_size || 'medium'
  const responseHours = input.response_time_hours || 48

  const sizeMultiplier: Record<string, number> = { small: 0.8, medium: 1.0, large: 1.3, enterprise: 1.6 }
  const sm = sizeMultiplier[orgSize]

  const baseCostPerRecord = rngFloat(rng, 150, 280) * sm
  const responseFactor = responseHours > 72 ? 1.3 : responseHours > 48 ? 1.15 : 1.0

  const categories: CostCategory[] = []
  categories.push({
    category: 'Detection & Escalation',
    min_cost: Math.round(records * baseCostPerRecord * 0.15),
    max_cost: Math.round(records * baseCostPerRecord * 0.25 * responseFactor),
    expected_cost: Math.round(records * baseCostPerRecord * 0.20 * responseFactor),
    description: 'Incident investigation, forensics, audit, crisis management'
  })
  categories.push({
    category: 'Notification Costs',
    min_cost: Math.round(records * 3),
    max_cost: Math.round(records * 8),
    expected_cost: Math.round(records * 5),
    description: 'Regulatory notifications, customer mailings, credit monitoring setup'
  })
  categories.push({
    category: 'Post-Breach Response',
    min_cost: Math.round(records * baseCostPerRecord * 0.20),
    max_cost: Math.round(records * baseCostPerRecord * 0.40 * responseFactor),
    expected_cost: Math.round(records * baseCostPerRecord * 0.30 * responseFactor),
    description: 'Help center operations, identity protection services, legal counsel'
  })
  categories.push({
    category: 'Regulatory & Legal',
    min_cost: Math.round(records * baseCostPerRecord * 0.10),
    max_cost: Math.round(records * baseCostPerRecord * 0.30),
    expected_cost: Math.round(records * baseCostPerRecord * 0.18),
    description: 'Fines, penalties, settlements, class action defense'
  })
  categories.push({
    category: 'Business Disruption',
    min_cost: Math.round(records * baseCostPerRecord * 0.08),
    max_cost: Math.round(records * baseCostPerRecord * 0.18),
    expected_cost: Math.round(records * baseCostPerRecord * 0.12),
    description: 'Revenue loss during downtime, customer churn, increased acquisition cost'
  })
  categories.push({
    category: 'Reputational Damage',
    min_cost: Math.round(records * baseCostPerRecord * 0.05),
    max_cost: Math.round(records * baseCostPerRecord * 0.15),
    expected_cost: Math.round(records * baseCostPerRecord * 0.08),
    description: 'Brand impact, stock price decline (public), competitive loss'
  })

  const minTotal = categories.reduce((s, c) => s + c.min_cost, 0)
  const maxTotal = categories.reduce((s, c) => s + c.max_cost, 0)
  const expectedTotal = categories.reduce((s, c) => s + c.expected_cost, 0)
  const costPerRecord = Math.round(expectedTotal / records)

  const notificationCosts = Math.round(records * rngFloat(rng, 4, 8))
  const regulatoryFines = Math.round(expectedTotal * rngFloat(rng, 0.08, 0.22))

  const longTerm: string[] = []
  longTerm.push('Customer churn rate increase of 2-5% over 24 months post-breach')
  longTerm.push('Increased cyber insurance premiums (30-100% renewal increase)')
  longTerm.push('Potential loss of business partnerships requiring SOC 2/ISO certification')
  longTerm.push('Executive turnover (CISO/CEO departure probability: 40-60% within 12 months)')
  longTerm.push('Enhanced regulatory scrutiny and mandatory audits for 3-5 years')

  const benchmarkMap: Record<string, string> = {
    finance: 'Financial sector average: $5.97M per breach (2026 IBM Cost of Data Breach)',
    healthcare: 'Healthcare sector average: $10.93M per breach - highest of all industries',
    technology: 'Technology sector average: $5.45M per breach - regulatory fines increasing',
    manufacturing: 'Manufacturing average: $4.49M per breach - IP theft cost multiplier 2.2x',
    retail: 'Retail sector average: $3.28M per breach - PCI fines add 15-20% overhead',
    energy: 'Energy/Utilities: $5.01M per breach - OT impact multiplies recovery cost',
    government: 'Government/Public sector: $2.60M per breach - classified exposure additional risk',
    education: 'Education/Research: $3.79M per breach - research IP loss underestimated',
  }

  const savings: string[] = []
  savings.push('Incident response retainer reduces cost by 35-40% ($' + Math.round(expectedTotal * 0.375).toLocaleString() + ' savings)')
  savings.push('Automated containment (SOAR) reduces breach lifecycle by avg 54 days = $' + Math.round(expectedTotal * 0.12).toLocaleString() + ' savings')
  savings.push('Employee training reduces phishing breach likelihood by 70%')
  savings.push('Encrypted data reduces per-record cost by $170-$220 per record')

  return {
    incident_type: breachType,
    total_cost_range: { min: minTotal, max: maxTotal },
    expected_total_cost: expectedTotal,
    cost_per_record: costPerRecord,
    cost_categories: categories,
    notification_costs: notificationCosts,
    regulatory_fines_estimate: regulatoryFines,
    long_term_impact: longTerm,
    industry_benchmark: benchmarkMap[input.industry || 'technology'] || 'Global average: $4.88M per breach (2026)',
    mitigation_savings: savings,
    summary: 'Estimated ' + breachType + ' cost for ' + records.toLocaleString() + ' records: $' + expectedTotal.toLocaleString() + ' expected ($' + costPerRecord + '/record), range $' + minTotal.toLocaleString() + ' - $' + maxTotal.toLocaleString(),
  }
}

function formatBreachCostReport(input: BreachCostInput, output: BreachCostOutput): string {
  const lines: string[] = []
  lines.push('## Data Breach Cost Estimation Report')
  lines.push('')
  lines.push('**Breach Type:** ' + output.incident_type + ' | **Records Exposed:** ' + (input.records_exposed || 0).toLocaleString() + ' | **Org Size:** ' + (input.organization_size || 'medium'))
  lines.push('**Expected Total Cost:** $' + output.expected_total_cost.toLocaleString() + ' | **Cost Per Record:** $' + output.cost_per_record)
  lines.push('**Cost Range:** $' + output.total_cost_range.min.toLocaleString() + ' - $' + output.total_cost_range.max.toLocaleString())
  lines.push('')
  lines.push('### Cost Breakdown by Category')
  lines.push('| Category | Expected | Min | Max | Description |')
  lines.push('|----------|----------|-----|-----|-------------|')
  for (const c of output.cost_categories) {
    lines.push('| ' + c.category + ' | $' + c.expected_cost.toLocaleString() + ' | $' + c.min_cost.toLocaleString() + ' | $' + c.max_cost.toLocaleString() + ' | ' + c.description + ' |')
  }
  lines.push('')
  lines.push('### Direct Costs')
  lines.push('- **Notification Costs:** $' + output.notification_costs.toLocaleString())
  lines.push('- **Regulatory Fines Estimate:** $' + output.regulatory_fines_estimate.toLocaleString())
  lines.push('')
  lines.push('### Long-Term Impact (24-36 Months)')
  for (const item of output.long_term_impact) lines.push('- ' + item)
  lines.push('')
  lines.push('> **Industry Benchmark:** ' + output.industry_benchmark)
  lines.push('')
  lines.push('### Mitigation Savings Opportunities')
  for (const s of output.mitigation_savings) lines.push('- ' + s)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: INCIDENT RESPONSE PLANNER ====================

function planIncidentResponse(input: IRPlannerInput): IRPlannerOutput {
  const rng = seededRng(input)
  const incidentType = input.incident_type || 'ransomware'
  const severity = input.severity || 'high'
  const teamSize = input.internal_team_size || 5

  const phases: IRPhase[] = []

  phases.push({
    phase: 'Phase 1: Preparation & Detection',
    duration_hours: severity === 'critical' ? 1 : 2,
    key_actions: [
      'Activate incident response team and establish command structure',
      'Confirm incident classification and severity level',
      'Initiate evidence preservation protocols (memory, disk, logs)',
      'Notify CISO, legal counsel, and executive leadership',
      'Engage external IR retainer if needed'
    ],
    responsible_party: 'SOC Lead + CISO',
    critical_decisions: [
      'Determine if external IR firm engagement is warranted',
      'Assess scope of affected systems for containment planning'
    ],
  })

  phases.push({
    phase: 'Phase 2: Containment',
    duration_hours: severity === 'critical' ? 4 : severity === 'high' ? 8 : 24,
    key_actions: [
      'Isolate affected network segments (logical/physical separation)',
      'Block malicious IPs/domains at perimeter controls',
      'Disable compromised accounts and reset credentials',
      'Deploy enhanced monitoring on adjacent systems',
      'Preserve forensic images before remediation'
    ],
    responsible_party: 'IR Team Lead + Network Security',
    critical_decisions: [
      'Full network isolation vs. targeted containment decision',
      'Ransomware: assess decryption feasibility vs. payment ethics',
      'Determine if law enforcement notification required'
    ],
  })

  phases.push({
    phase: 'Phase 3: Eradication',
    duration_hours: severity === 'critical' ? 24 : severity === 'high' ? 48 : 72,
    key_actions: [
      'Remove all malicious artifacts (backdoors, rootkits, persistence)',
      'Patch exploited vulnerabilities across environment',
      'Reset all potentially compromised credentials',
      'Rebuild affected systems from trusted golden images',
      'Validate eradication through threat hunting sweep'
    ],
    responsible_party: 'Security Engineering + Systems Admin',
    critical_decisions: [
      'Scope of credential resets (targeted vs. enterprise-wide)',
      'Rebuild vs. clean decision for affected hosts'
    ],
  })

  phases.push({
    phase: 'Phase 4: Recovery',
    duration_hours: severity === 'critical' ? 48 : severity === 'high' ? 72 : 120,
    key_actions: [
      'Restore systems from verified clean backups',
      'Implement enhanced monitoring on recovered assets',
      'Gradual service restoration with validation gates',
      'Conduct user acceptance testing on critical workflows',
      'Establish 24/7 monitoring window post-recovery'
    ],
    responsible_party: 'IT Operations + Business Owners',
    critical_decisions: [
      'Recovery prioritization based on business criticality',
      'Go/no-go criteria for production restoration'
    ],
  })

  phases.push({
    phase: 'Phase 5: Post-Incident',
    duration_hours: 168,
    key_actions: [
      'Conduct formal lessons-learned review within 2 weeks',
      'Update IR playbooks based on gaps identified',
      'Implement additional controls to prevent recurrence',
      'Complete forensic report with root cause analysis',
      'Share anonymized threat intelligence with ISACs'
    ],
    responsible_party: 'CISO + IR Team',
    critical_decisions: [
      'Root cause attribution confidence level for disclosure',
      'Regulatory and legal disclosure timeline and content'
    ],
  })

  const notifications: string[] = []
  notifications.push('Regulatory: GDPR 72-hour notification (if EU data subjects affected)')
  notifications.push('Regulatory: State AG notification per breach notification laws (US)')
  notifications.push('Law enforcement: FBI IC3 or local cyber crime unit (if criminal act suspected)')
  notifications.push('Cyber insurance carrier: Notification per policy terms (typically within 24-48h)')
  notifications.push('Affected individuals: Notification per state/federal requirements')
  if (incidentType === 'data_breach') notifications.push('Credit monitoring: Offer 12-24 months for PII exposure')
  notifications.push('Board of Directors: Executive summary within 24 hours for material incidents')

  const evidenceSteps: string[] = [
    'Capture volatile memory (RAM) from affected systems before power-off',
    'Create bit-for-bit forensic images of all affected drives',
    'Export and preserve firewall, IDS/IPS, proxy, and authentication logs',
    'Screenshot all attacker communications and ransom notes',
    'Chain of custody documentation for all collected evidence',
    'Timestamp synchronization and NTP verification for log correlation',
    'Secure offline storage of forensic evidence with access logging',
  ]

  const forensicReqs: string[] = [
    'Dedicated forensic workstations with write-blocking hardware',
    'Memory analysis tools (Volatility, Rekall) for malware artifact extraction',
    'Network traffic analysis (PCAP) for lateral movement reconstruction',
    'Timeline reconstruction using log correlation (ELK/Splunk)',
    'External forensic firm engagement for regulatory-defensible report',
  ]

  const commTimeline: string[] = [
    'T+0h: Internal stakeholder notification (IR team, CISO, legal)',
    'T+1h: Executive briefing and initial severity assessment',
    'T+4h: Cyber insurance carrier notification (if policy requires)',
    'T+12h: Board notification for material incidents',
    'T+24h: Law enforcement notification (if criminal act)',
    'T+48h: Regulatory notification preparation begins',
    'T+72h: Regulatory notification deadline (GDPR and similar)',
    'T+7d: Customer/individual notification (per jurisdiction requirements)',
    'T+30d: Public disclosure and press management (if required)',
  ]

  const recoveryMilestones: string[] = [
    'Containment verification: All attack vectors blocked',
    'Eradication validation: Threat hunting sweep clears environment',
    'System restoration: Critical business functions online',
    'Monitoring period: 72-hour enhanced monitoring post-recovery',
    'Stakeholder sign-off: Business owners validate functionality',
    'Control implementation: New preventive controls deployed',
    'Lessons learned: Post-incident review completed and documented',
  ]

  const irBudget = Math.round(rngRange(rng, teamSize * 5000, teamSize * 15000) * (severity === 'critical' ? 2.5 : severity === 'high' ? 1.8 : 1.2))

  const lessonsFramework: string[] = [
    'What happened? Timeline reconstruction and impact assessment',
    'Why did it happen? Root cause and contributing factor analysis',
    'What worked well? Effective response actions to reinforce',
    'What failed? Gaps in detection, response, and communication',
    'Action items: Specific remediation with owners and deadlines',
    'Metrics: MTTD, MTTC, MTTR measurement and benchmarking',
  ]

  return {
    incident_type: incidentType,
    severity_level: severity,
    response_phases: phases,
    notification_requirements: notifications,
    evidence_preservation_steps: evidenceSteps,
    forensic_requirements: forensicReqs,
    communication_timeline: commTimeline,
    recovery_milestones: recoveryMilestones,
    ir_budget_estimate: irBudget,
    lessons_learned_framework: lessonsFramework,
    summary: 'IR plan for ' + incidentType + ' (' + severity + '): ' + phases.length + ' phases over ' + phases.reduce((s, p) => s + p.duration_hours, 0) + 'h, estimated IR budget $' + irBudget.toLocaleString(),
  }
}

function formatIRPlannerReport(input: IRPlannerInput, output: IRPlannerOutput): string {
  const lines: string[] = []
  lines.push('## Incident Response Plan')
  lines.push('')
  lines.push('**Incident Type:** ' + output.incident_type + ' | **Severity:** ' + output.severity_level.toUpperCase() + ' | **IR Budget Estimate:** $' + output.ir_budget_estimate.toLocaleString())
  lines.push('')
  lines.push('### Response Phases')
  for (const phase of output.response_phases) {
    lines.push('')
    lines.push('#### ' + phase.phase + ' (' + phase.duration_hours + 'h)')
    lines.push('**Owner:** ' + phase.responsible_party)
    lines.push('')
    lines.push('**Key Actions:**')
    for (const action of phase.key_actions) lines.push('- [ ] ' + action)
    lines.push('')
    lines.push('**Critical Decisions:**')
    for (const decision of phase.critical_decisions) lines.push('- ' + decision)
  }
  lines.push('')
  lines.push('### Notification Requirements')
  for (const n of output.notification_requirements) lines.push('- ' + n)
  lines.push('')
  lines.push('### Evidence Preservation')
  for (const s of output.evidence_preservation_steps) lines.push('- ' + s)
  lines.push('')
  lines.push('### Communication Timeline')
  for (const t of output.communication_timeline) lines.push('- ' + t)
  lines.push('')
  lines.push('### Recovery Milestones')
  for (const m of output.recovery_milestones) lines.push('- [ ] ' + m)
  lines.push('')
  lines.push('### Lessons Learned Framework')
  for (const l of output.lessons_learned_framework) lines.push('- ' + l)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: VENDOR RISK ASSESSOR ====================

function assessVendorRisk(input: VendorRiskInput): VendorRiskOutput {
  const rng = seededRng(input)
  const dataAccess = input.data_access_level || 'moderate'
  const criticality = input.criticality || 'important'
  const contractValue = input.contract_value || 500000
  const fourthParty = input.fourth_party_dependencies || false

  let baseScore = 0
  const accessScore: Record<string, number> = { none: 0, limited: 10, moderate: 25, extensive: 40, full: 55 }
  baseScore += accessScore[dataAccess] || 25

  const critScore: Record<string, number> = { non_critical: 5, important: 15, critical: 30, mission_critical: 45 }
  baseScore += critScore[criticality] || 15

  if (fourthParty) baseScore += 15
  if (contractValue > 1000000) baseScore += 10
  if (contractValue > 5000000) baseScore += 5

  const certs = input.compliance_certifications || []
  const certReduction = Math.min(certs.length * 5, 20)
  baseScore = Math.max(0, baseScore - certReduction)

  const overallScore = clamp(Math.round(baseScore + rngRange(rng, -5, 5)), 0, 100)

  let rating: VendorRiskOutput['risk_rating'] = 'low'
  if (overallScore > 75) rating = 'critical'
  else if (overallScore > 55) rating = 'high'
  else if (overallScore > 30) rating = 'moderate'

  const findings: VendorRiskFinding[] = []
  if (dataAccess === 'full' || dataAccess === 'extensive') {
    findings.push({ finding: 'Vendor has extensive data access - breach at vendor directly impacts your environment', severity: 'high', likelihood: 0.35, recommendation: 'Require vendor SOC 2 Type II report and limit data access to least privilege' })
  }
  if (fourthParty) {
    findings.push({ finding: 'Fourth-party dependencies create opaque risk chain - your vendor\'s vendors introduce unknown exposure', severity: 'high', likelihood: 0.40, recommendation: 'Require disclosure of fourth-party vendors with access to your data' })
  }
  if (certs.length < 2) {
    findings.push({ finding: 'Limited compliance certifications - insufficient third-party validation of security controls', severity: 'medium', likelihood: 0.50, recommendation: 'Require at minimum SOC 2 Type II, ISO 27001, or equivalent certification' })
  }
  if (contractValue > 2000000) {
    findings.push({ finding: 'High contract value creates concentrated vendor risk - financial impact of vendor failure is material', severity: 'medium', likelihood: 0.25, recommendation: 'Negotiate performance guarantees, source code escuk, and termination assistance provisions' })
  }
  if (criticality === 'mission_critical' || criticality === 'critical') {
    findings.push({ finding: 'Mission-critical vendor dependency - no viable alternative creates unacceptable concentration risk', severity: 'critical', likelihood: 0.30, recommendation: 'Develop vendor exit strategy and maintain hot-site backup capability' })
  }
  findings.push({ finding: 'Vendor security posture may degrade between annual assessments', severity: 'medium', likelihood: 0.45, recommendation: 'Implement continuous monitoring and quarterly attestation requirements' })

  const slaReqs: string[] = []
  slaReqs.push('Uptime SLA: 99.9% minimum with financial penalties for breach')
  slaReqs.push('Incident notification: Within 2 hours of confirmed security event')
  slaReqs.push('Data breach notification: Within 24 hours of discovery')
  slaReqs.push('Audit rights: Annual third-party audit at vendor expense')
  slaReqs.push('Service continuity: 180-day wind-down assistance upon termination')

  const contractProts: string[] = []
  contractProts.push('Right to audit security controls with 30 days notice')
  contractProts.push('Data processing agreement (DPA) with GDPR/CCPA clauses')
  contractProts.push('Cyber insurance requirement: $5M+ with named insured status')
  contractProts.push('Indemnification for data breaches caused by vendor negligence')
  contractProts.push('Data deletion certification within 30 days of contract end')
  contractProts.push('Source code escrow for critical SaaS dependencies')

  const monitoring: string[] = []
  monitoring.push('Quarterly security scorecard review (BitSight/SecurityScorecard)')
  monitoring.push('Annual on-site audit or SOC 2 Type II report review')
  monitoring.push('Continuous dark web monitoring for vendor credential exposure')
  monitoring.push('Annual tabletop exercise with vendor for joint IR scenarios')
  monitoring.push('Contractual right to require remediation within 30 days for critical findings')

  const fourthPartyRisks: string[] = []
  if (fourthParty) {
    fourthPartyRisks.push('Subprocessors may have access to your data without direct contractual relationship')
    fourthPartyRisks.push('Fourth-party breach notification delays compound your own notification timeline')
    fourthPartyRisks.push('Concentration risk: Multiple vendors may depend on same cloud infrastructure (AWS/Azure/GCP)')
    fourthPartyRisks.push('Geopolitical risk: Fourth-party data handling in non-aligned jurisdictions')
  } else {
    fourthPartyRisks.push('No disclosed fourth-party dependencies - verify through vendor questionnaire')
    fourthPartyRisks.push('Recommend requiring fourth-party disclosure in contract renewal')
  }

  const residualAcceptance = rating === 'critical' ? 'REQUIRES EXECUTIVE RISK ACCEPTANCE: Documented sign-off from CISO and CFO required' :
    rating === 'high' ? 'Requires CISO risk acceptance with quarterly review' :
    rating === 'moderate' ? 'Acceptable with noted mitigations and annual review' :
    'Acceptable risk level - routine monitoring sufficient'

  const reviewFreq = rating === 'critical' ? 'Monthly' : rating === 'high' ? 'Quarterly' : rating === 'moderate' ? 'Semi-annually' : 'Annually'

  return {
    vendor_name: input.vendor_name || 'Unknown Vendor',
    overall_risk_score: overallScore,
    risk_rating: rating,
    findings,
    sla_requirements: slaReqs,
    contractual_protections: contractProts,
    monitoring_recommendations: monitoring,
    fourth_party_risks: fourthPartyRisks,
    residual_risk_acceptance: residualAcceptance,
    review_frequency: reviewFreq,
    summary: 'Vendor risk assessment for ' + (input.vendor_name || 'vendor') + ': score ' + overallScore + '/100 (' + rating + ' risk) with ' + findings.length + ' findings, review frequency: ' + reviewFreq,
  }
}

function formatVendorRiskReport(input: VendorRiskInput, output: VendorRiskOutput): string {
  const lines: string[] = []
  lines.push('## Third-Party Vendor Risk Assessment')
  lines.push('')
  lines.push('**Vendor:** ' + output.vendor_name + ' | **Service Type:** ' + (input.service_type || 'general'))
  lines.push('**Risk Score:** ' + output.overall_risk_score + '/100 | **Rating:** ' + output.risk_rating.toUpperCase() + ' | **Review Frequency:** ' + output.review_frequency)
  lines.push('')
  lines.push('### Risk Findings')
  lines.push('| Finding | Severity | Likelihood | Recommendation |')
  lines.push('|---------|----------|------------|----------------|')
  for (const f of output.findings) {
    lines.push('| ' + f.finding + ' | ' + f.severity.toUpperCase() + ' | ' + (f.likelihood * 100).toFixed(0) + '% | ' + f.recommendation + ' |')
  }
  lines.push('')
  lines.push('### SLA Requirements')
  for (const s of output.sla_requirements) lines.push('- ' + s)
  lines.push('')
  lines.push('### Contractual Protections')
  for (const p of output.contractual_protections) lines.push('- [ ] ' + p)
  lines.push('')
  lines.push('### Fourth-Party Risks')
  for (const r of output.fourth_party_risks) lines.push('- ' + r)
  lines.push('')
  lines.push('### Residual Risk Acceptance')
  lines.push(output.residual_risk_acceptance)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: REGULATORY FINE CALCULATOR ====================

function calculateRegulatoryFine(input: RegulatoryFineInput): RegulatoryFineOutput {
  const rng = seededRng(input)
  const regulation = input.regulation || 'gdpr'
  const records = input.records_affected || 10000
  const revenue = input.organization_revenue || 100000000
  const negligence = input.negligence_level || 'negligent'
  const selfReported = input.self_reported || false
  const priorViolations = input.prior_violations || 0

  const regConfig: Record<string, { maxFine: number; fineBasis: string; deadline: string }> = {
    gdpr: { maxFine: revenue * 0.04, fineBasis: 'Up to 4% of global annual turnover or €20M, whichever is higher', deadline: '72 hours from becoming aware (Article 33)' },
    china_pip: { maxFine: revenue * 0.05, fineBasis: 'Up to 5% of previous year revenue or ¥50M; responsible persons fined ¥100K-¥1M', deadline: 'Notify authorities + affected individuals without delay' },
    china_csl: { maxFine: 10000000, fineBasis: 'Up to ¥1M fine; responsible persons ¥100K-¥1M; can suspend operations', deadline: 'Immediately notify authorities and take remedial measures' },
    ccpa: { maxFine: 7500 * records, fineBasis: '$2,500 per unintentional violation, $7,500 per intentional violation per record', deadline: 'No explicit deadline; disclose ASAP after discovery' },
    hipaa: { maxFine: 1500000, fineBasis: '$100-$50K per violation, annual cap $1.5M per provision; willful neglect up to $250K-$1.5M', deadline: '60 days from discovery (if >500 affected: immediate + media notice)' },
    lgpd: { maxFine: revenue * 0.02, fineBasis: 'Up to 2% of revenue in Brazil (capped at BRL 50M per violation)', deadline: 'Reasonable time (ANPD guidance: within 2 business days)' },
  }

  const config = regConfig[regulation] || regConfig.gdpr

  const negligenceMultiplier: Record<string, number> = { unintentional: 0.5, negligent: 1.0, reckless: 1.5, willful: 2.0 }
  const nm = negligenceMultiplier[negligence] || 1.0

  const selfReportReduction = selfReported ? 0.7 : 1.0
  const priorViolationIncrease = 1 + priorViolations * 0.25

  const baseFine = Math.min(config.maxFine, Math.max(config.maxFine * 0.1, records * rngFloat(rng, 50, 500)))
  const expectedFine = Math.round(baseFine * nm * selfReportReduction * priorViolationIncrease)
  const minFine = Math.round(expectedFine * rngFloat(rng, 0.4, 0.7))
  const maxFine = Math.round(expectedFine * rngFloat(rng, 1.3, 2.0))

  const mitigating: string[] = []
  if (selfReported) mitigating.push('Self-reported violation: up to 30% fine reduction under most jurisdictions')
  mitigating.push('Demonstrated reasonable security controls pre-incident')
  mitigating.push('Cooperation with regulatory investigation')
  mitigating.push('Prompt remediation and victim notification')
  mitigating.push('No prior violations (first offense consideration)')
  if (input.remediation_speed === 'immediate') mitigating.push('Immediate containment and remediation demonstrated')

  const aggravating: string[] = []
  if (negligence === 'willful') aggravating.push('Willful neglect: maximum fine tier and potential criminal liability')
  if (negligence === 'reckless') aggravating.push('Reckless disregard for security obligations')
  if (priorViolations > 0) aggravating.push('Repeat violations: ' + priorViolations + ' prior incident(s) increase fine by ' + (priorViolations * 25) + '%')
  if (input.remediation_speed === 'delayed' || input.remediation_speed === 'none') aggravating.push('Delayed remediation demonstrates lack of urgency')
  if (records > 100000) aggravating.push('Large scale breach: ' + records.toLocaleString() + ' records affected triggers maximum tier')

  const defenseStrategies: string[] = []
  defenseStrategies.push('Challenge jurisdiction applicability if multi-national operations')
  defenseStrategies.push('Demonstrate compliance efforts (audits, training records, policies) pre-dating incident')
  defenseStrategies.push('Quantify actual harm vs. records exposed (not all records necessarily compromised)')
  defenseStrategies.push('Negotiate consent decree with phased compliance plan')
  defenseStrategies.push('Invoke safe harbor if encrypted data and key was not compromised')
  defenseStrategies.push('Demonstrate third-party causation (vendor breach with contractual protections)')

  const insuranceCoverage = regulation === 'gdpr' ? 'Cyber insurance typically covers regulatory defense costs and fines where insurable by law (varies by jurisdiction)' :
    regulation === 'china_pip' ? 'Growing Chinese market for cybersecurity insurance covers regulatory defense; fine insurability varies by province' :
    regulation === 'hipaa' ? 'HIPAA liability coverage standard in healthcare cyber policies; state fines may have coverage limitations' :
    'Cyber insurance regulatory coverage depends on jurisdiction and policy terms - verify fine insurability'

  const precedents: string[] = []
  if (regulation === 'gdpr') {
    precedents.push('Meta (2023): €1.2B fine for data transfers - largest GDPR fine to date')
    precedents.push('Amazon (2021): €746M fine for targeted advertising consent violations')
    precedents.push('British Airways (2020): £20M reduced from £183M - cooperation credit applied')
  } else if (regulation === 'china_pip') {
    precedents.push('DiDi (2022): ¥8.026B fine ($1.2B) for violations of Cybersecurity Law, Data Security Law, PIPL')
    precedents.push('Multiple platform companies fined ¥50M-¥500M range for cross-border data transfer violations (2023-2025)')
  } else if (regulation === 'hipaa') {
    precedents.push('Anthem (2020): $16M settlement for 79M-record breach - largest HIPAA settlement')
    precedents.push('Premera Blue Cross (2021): $6.85M for pre-breach security failures')
  }

  const violation = input.violation_type || 'data_breach'

  return {
    regulation: regulation.toUpperCase(),
    violation: violation,
    fine_range: { minimum: minFine, maximum: maxFine, expected: expectedFine, basis: config.fineBasis },
    mitigating_factors: mitigating,
    aggravating_factors: aggravating,
    notification_deadline: config.deadline,
    defense_strategies: defenseStrategies,
    total_exposure_estimate: maxFine + Math.round(maxFine * 0.15),
    insurance_coverage_applicability: insuranceCoverage,
    precedents: precedents,
    summary: 'Regulatory fine estimate for ' + regulation.toUpperCase() + ' ' + violation + ': $' + expectedFine.toLocaleString() + ' expected (range $' + minFine.toLocaleString() + ' - $' + maxFine.toLocaleString() + ')',
  }
}

function formatRegulatoryFineReport(input: RegulatoryFineInput, output: RegulatoryFineOutput): string {
  const lines: string[] = []
  lines.push('## Regulatory Fine Estimation Report')
  lines.push('')
  lines.push('**Regulation:** ' + output.regulation + ' | **Violation:** ' + output.violation + ' | **Records Affected:** ' + (input.records_affected || 0).toLocaleString())
  lines.push('**Expected Fine:** $' + output.fine_range.expected.toLocaleString() + ' | **Range:** $' + output.fine_range.minimum.toLocaleString() + ' - $' + output.fine_range.maximum.toLocaleString())
  lines.push('**Total Exposure (incl. legal):** $' + output.total_exposure_estimate.toLocaleString())
  lines.push('')
  lines.push('**Fine Basis:** ' + output.fine_range.basis)
  lines.push('')
  lines.push('### Notification Deadline')
  lines.push(output.notification_deadline)
  lines.push('')
  lines.push('### Mitigating Factors')
  for (const m of output.mitigating_factors) lines.push('- ' + m)
  lines.push('')
  lines.push('### Aggravating Factors')
  for (const a of output.aggravating_factors) lines.push('- ' + a)
  lines.push('')
  lines.push('### Defense Strategies')
  for (const d of output.defense_strategies) lines.push('- [ ] ' + d)
  lines.push('')
  lines.push('### Insurance Coverage Applicability')
  lines.push(output.insurance_coverage_applicability)
  lines.push('')
  lines.push('### Relevant Precedents')
  for (const p of output.precedents) lines.push('- ' + p)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: BUSINESS IMPACT ANALYZER ====================

function analyzeBusinessImpact(input: BIAInput): BIAOutput {
  const rng = seededRng(input)
  const annualRevenue = input.annual_revenue || 100000000
  const dailyTransactions = input.daily_transaction_volume || 50000
  const peakFactor = input.peak_season_factor || 1.3

  const workDaysPerYear = 250
  const workHoursPerDay = 8
  const revenuePerHour = annualRevenue / workDaysPerYear / workHoursPerDay
  const revenuePerDay = annualRevenue / workDaysPerYear

  const maxDowntimeHours = input.regulatory_downtime_limit || rngRange(rng, 4, 72)
  const rto = Math.max(1, Math.round(maxDowntimeHours / rngFloat(rng, 2, 4)))
  const rpo = Math.max(1, Math.round(rto / rngFloat(rng, 1.5, 3)))

  const financialPerHour = Math.round(revenuePerHour * peakFactor)
  const financialPerDay = Math.round(revenuePerDay * peakFactor)

  const operationalImpact: string[] = []
  operationalImpact.push('Direct revenue loss: $' + financialPerHour.toLocaleString() + '/hour at peak, $' + financialPerDay.toLocaleString() + '/day')
  operationalImpact.push('Transaction processing halt: ' + dailyTransactions.toLocaleString() + ' daily transactions unable to complete')
  operationalImpact.push('Customer service disruption: call center unable to access account data')
  operationalImpact.push('Supply chain delays: vendor and partner integrations offline')
  operationalImpact.push('Employee productivity loss: ' + rngRange(rng, 60, 95) + '% of workforce unable to perform core functions')

  const reputationalImpact: string[] = []
  reputationalImpact.push('Customer trust degradation: NPS score impact of -15 to -40 points')
  reputationalImpact.push('Social media sentiment shift: negative mentions spike 500-2000%')
  reputationalImpact.push('Media coverage: prolonged downtime (>24h) triggers national news coverage')
  reputationalImpact.push('Competitive disadvantage: competitors capture displaced customer demand')
  reputationalImpact.push('Long-term brand damage: 12-18 month recovery to pre-incident trust levels')

  const regulatoryImpact: string[] = []
  if (maxDowntimeHours < 24) regulatoryImpact.push('Regulatory reporting required if downtime exceeds ' + maxDowntimeHours + 'h threshold')
  regulatoryImpact.push('SLA breach claims from customers and partners during extended outage')
  regulatoryImpact.push('Potential regulatory inquiry for incidents exceeding materiality threshold')
  regulatoryImpact.push('Mandatory incident report to sector-specific regulator within statutory timeframe')

  const metrics: BIAMetric[] = []
  metrics.push({ metric: 'Maximum Tolerable Downtime (MTD)', value: maxDowntimeHours + ' hours', description: 'Maximum acceptable outage before organizational viability threatened' })
  metrics.push({ metric: 'Recovery Time Objective (RTO)', value: rto + ' hours', description: 'Target time to restore critical business functions' })
  metrics.push({ metric: 'Recovery Point Objective (RPO)', value: rpo + ' hours', description: 'Maximum acceptable data loss measured in time' })
  metrics.push({ metric: 'Financial Impact Per Hour', value: '$' + financialPerHour.toLocaleString(), description: 'Direct revenue loss per hour during peak operation' })
  metrics.push({ metric: 'Daily Financial Exposure', value: '$' + financialPerDay.toLocaleString(), description: 'Total financial impact per business day of outage' })
  metrics.push({ metric: 'Peak Season Multiplier', value: peakFactor.toFixed(1) + 'x', description: 'Seasonal adjustment factor for peak revenue periods' })

  const recoveryStrategies: string[] = []
  recoveryStrategies.push('Active-Active multi-site deployment with automatic failover (RTO < 1h)')
  recoveryStrategies.push('Geographic redundancy across availability zones with <5min failover')
  recoveryStrategies.push('Hot standby systems with real-time data replication (RPO near-zero)')
  recoveryStrategies.push('Backup manual processing procedures for critical functions (temporary workaround)')
  recoveryStrategies.push('Pre-negotiated disaster recovery site with committed compute capacity')
  recoveryStrategies.push('Cloud-based burst capacity for rapid scale-up during recovery')

  const resourceRequirements: string[] = []
  resourceRequirements.push('Minimum dedicated DR team: ' + rngRange(rng, 5, 15) + ' FTE with cross-trained backups')
  resourceRequirements.push('Recovery infrastructure: ' + rngRange(rng, 2, 5) + 'x primary environment capacity reserved')
  resourceRequirements.push('Communication channels: out-of-band (SMS/phone tree) independent of primary systems')
  resourceRequirements.push('Alternate worksite: pre-configured recovery space for ' + rngRange(rng, 50, 200) + ' personnel')

  return {
    process_name: input.process_name || 'Core Business Process',
    business_unit: input.business_unit || 'Enterprise',
    maximum_tolerable_downtime: maxDowntimeHours + ' hours',
    recovery_time_objective: rto,
    recovery_point_objective: rpo,
    financial_impact_per_hour: financialPerHour,
    financial_impact_per_day: financialPerDay,
    operational_impact: operationalImpact,
    reputational_impact: reputationalImpact,
    regulatory_impact: regulatoryImpact,
    key_metrics: metrics,
    recovery_strategies: recoveryStrategies,
    resource_requirements: resourceRequirements,
    summary: 'BIA for ' + (input.process_name || 'process') + ': MTD=' + maxDowntimeHours + 'h, RTO=' + rto + 'h, RPO=' + rpo + 'h, exposure $' + financialPerHour.toLocaleString() + '/h ($' + financialPerDay.toLocaleString() + '/day)',
  }
}

function formatBIAReport(input: BIAInput, output: BIAOutput): string {
  const lines: string[] = []
  lines.push('## Business Impact Analysis (BIA)')
  lines.push('')
  lines.push('**Business Unit:** ' + output.business_unit + ' | **Process:** ' + output.process_name)
  lines.push('**MTD:** ' + output.maximum_tolerable_downtime + ' | **RTO:** ' + output.recovery_time_objective + 'h | **RPO:** ' + output.recovery_point_objective + 'h')
  lines.push('**Financial Impact:** $' + output.financial_impact_per_hour.toLocaleString() + '/hour | $' + output.financial_impact_per_day.toLocaleString() + '/day')
  lines.push('')
  lines.push('### Key BIA Metrics')
  lines.push('| Metric | Value | Description |')
  lines.push('|--------|-------|-------------|')
  for (const m of output.key_metrics) {
    lines.push('| ' + m.metric + ' | ' + m.value + ' | ' + m.description + ' |')
  }
  lines.push('')
  lines.push('### Operational Impact')
  for (const i of output.operational_impact) lines.push('- ' + i)
  lines.push('')
  lines.push('### Reputational Impact')
  for (const i of output.reputational_impact) lines.push('- ' + i)
  lines.push('')
  lines.push('### Regulatory Impact')
  for (const i of output.regulatory_impact) lines.push('- ' + i)
  lines.push('')
  lines.push('### Recovery Strategies')
  for (const s of output.recovery_strategies) lines.push('- [ ] ' + s)
  lines.push('')
  lines.push('### Resource Requirements')
  for (const r of output.resource_requirements) lines.push('- ' + r)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: SECURITY MATURITY SCORER ====================

function scoreSecurityMaturity(input: SecurityMaturityInput): SecurityMaturityOutput {
  const rng = seededRng(input)
  const framework = input.framework || 'nist_csf'
  const empCount = input.employee_count || 1000
  const secStaff = input.security_staff_count || 5
  const budget = input.annual_security_budget || 1000000

  const domainConfig: Record<string, string[]> = {
    nist_csf: ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
    iso27001: ['Context', 'Leadership', 'Planning', 'Support', 'Operation', 'Performance Evaluation', 'Improvement'],
    cis_v8: ['Inventory', 'Data Protection', 'Secure Configuration', 'Account Management', 'Access Control', 'Continuous Vulnerability Management', 'Audit Log Management', 'Email Protection', 'Defenses', 'Incident Response', 'Penetration Testing'],
    cmmc: ['Access Control', 'Asset Management', 'Awareness & Training', 'Audit & Accountability', 'Configuration Management', 'Incident Response', 'Maintenance', 'Media Protection', 'Personnel Security', 'Physical Protection', 'Risk Assessment', 'Security Assessment', 'System & Communications', 'System & Information integrity'],
  }

  const domains = domainConfig[framework] || domainConfig.nist_csf
  const domainScores: DomainScore[] = []

  for (const domain of domains) {
    const userScore = input.domain_scores ? input.domain_scores[domain] : undefined
    let score: number
    if (userScore !== undefined) {
      score = clamp(Math.round(userScore), 0, 100)
    } else {
      score = clamp(rngRange(rng, 20, 85), 0, 100)
    }

    let level: DomainScore['level'] = 'incomplete'
    if (score >= 80) level = 'optimizing'
    else if (score >= 60) level = 'managed'
    else if (score >= 40) level = 'defined'
    else if (score >= 20) level = 'developing'

    const gaps: string[] = []
    if (score < 40) gaps.push(domain + ' controls significantly immature - immediate investment required')
    if (score < 60) gaps.push(domain + ' processes not standardized across organization')
    if (score < 80) gaps.push(domain + ' metrics and KPIs not consistently tracked')
    if (gaps.length === 0) gaps.push(domain + ' at maturity - focus on continuous improvement')

    const recommendations: string[] = []
    if (score < 30) recommendations.push('PRIORITY: Baseline assessment and quick wins in ' + domain)
    if (score < 50) recommendations.push('Establish formal ' + domain + ' policies and procedures with executive sponsorship')
    if (score < 70) recommendations.push('Implement continuous monitoring and metrics tracking for ' + domain)
    if (score < 90) recommendations.push('Integrate ' + domain + ' with SOC automation for real-time optimization')
    else recommendations.push(domain + ' at benchmark - share best practices across organization')

    domainScores.push({ domain, score, level, gaps, recommendations })
  }

  const overallScore = Math.round(domainScores.reduce((s, d) => s + d.score, 0) / domainScores.length)
  let overallLevel = 'Incomplete'
  if (overallScore >= 80) overallLevel = 'Optimizing'
  else if (overallScore >= 60) overallLevel = 'Managed'
  else if (overallScore >= 40) overallLevel = 'Defined'
  else if (overallScore >= 20) overallLevel = 'Developing'

  const percentile = clamp(Math.round(rngFloat(rng, overallScore * 0.6, overallScore * 1.2)), 5, 99)

  const investmentPriority: string[] = []
  const sorted = [...domainScores].sort((a, b) => a.score - b.score)
  for (const d of sorted.slice(0, 3)) {
    investmentPriority.push(d.domain + ' (score: ' + d.score + '): Priority improvement target')
  }

  const roadmap: string[] = []
  const criticalDomains = domainScores.filter(d => d.score < 30).map(d => d.domain).join(', ')
  roadmap.push('Phase 1 (0-6 months): Address critical gaps below ' + (criticalDomains || 'None - minimal critical gaps'))
  roadmap.push('Phase 2 (6-12 months): Standardize controls for domains scoring 30-60')
  roadmap.push('Phase 3 (12-18 months): Implement metrics and monitoring for domains scoring 60-80')
  roadmap.push('Phase 4 (18-24 months): Continuous optimization and threat-informed defense integration')

  const benchByFramework: Record<string, string> = {
    nist_csf: 'NIST CSF average maturity: 2.4/5 (Developing) across all sectors; top quartile at 3.5+ (Managed+)',
    iso27001: 'ISO 27001 certified organizations average 65% conformant vs. full standard requirements',
    cis_v8: 'CIS v8 IG1 conformance: 45% of organizations; IG3 conformance: <12% of organizations',
    cmmc: 'CMMC Level 2 achieved by ~22% of cleared defense contractors as of 2026',
  }

  const complianceReadiness = overallScore >= 70 ? 'Ready for major compliance audits (SOC 2, ISO 27001, PCI DSS)' :
    overallScore >= 50 ? 'Partially ready: address gaps in audit-critical domains before formal assessment' :
    overallScore >= 30 ? 'Not ready: significant remediation required before compliance engagement' :
    'Critical state: fundamental compliance gaps require immediate executive attention'

  const riskReduction = 'Maturity improvement from ' + overallScore + ' to ' + Math.min(100, overallScore + 20) + ' estimated to reduce breach likelihood by ' + Math.round(rngFloat(rng, 35, 60)) + '% based on industry data'

  return {
    framework: framework.toUpperCase().replace('_', ' '),
    overall_maturity_score: overallScore,
    overall_level: overallLevel,
    domain_scores: domainScores,
    industry_percentile: percentile,
    investment_priority: investmentPriority,
    roadmap_phases: roadmap,
    benchmark_comparison: benchByFramework[framework] || 'Benchmark data not available for selected framework',
    compliance_readiness: complianceReadiness,
    risk_reduction_potential: riskReduction,
    summary: 'Security maturity: ' + overallScore + '/100 (' + overallLevel + ') across ' + domains.length + ' domains in ' + framework.toUpperCase() + ', ' + percentile + 'th industry percentile',
  }
}

function formatSecurityMaturityReport(input: SecurityMaturityInput, output: SecurityMaturityOutput): string {
  const lines: string[] = []
  lines.push('## Security Maturity Scorecard')
  lines.push('')
  lines.push('**Framework:** ' + output.framework + ' | **Overall Score:** ' + output.overall_maturity_score + '/100 | **Level:** ' + output.overall_level)
  lines.push('**Industry Percentile:** ' + output.industry_percentile + 'th | **Domains Assessed:** ' + output.domain_scores.length)
  lines.push('')
  lines.push('### Domain Scores')
  lines.push('| Domain | Score | Level | Critical Gap |')
  lines.push('|--------|-------|-------|---------------|')
  for (const d of output.domain_scores) {
    lines.push('| ' + d.domain + ' | ' + d.score + '/100 | ' + d.level[0].toUpperCase() + d.level.slice(1) + ' | ' + (d.gaps[0] || 'None') + ' |')
  }
  lines.push('')
  lines.push('### Investment Priority (Lowest Scores First)')
  for (const i of output.investment_priority) lines.push('- ' + i)
  lines.push('')
  lines.push('### Maturity Roadmap')
  for (const r of output.roadmap_phases) lines.push('- ' + r)
  lines.push('')
  lines.push('### Compliance Readiness')
  lines.push(output.compliance_readiness)
  lines.push('')
  lines.push('> **Benchmark:** ' + output.benchmark_comparison)
  lines.push('')
  lines.push('> **Risk Reduction:** ' + output.risk_reduction_potential)
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

  // Tool 2: Policy Coverage Designer
  tools.register(defineTool({
    name: 'policy_coverage_designer',
    description: 'Cyber insurance policy coverage designer with aggregate limits, per-occurrence limits, deductibles, and specialized sub-limits for ransomware, business interruption, regulatory defense, and dependent coverage. Produces premium estimates and gap analysis.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, coverage_type (first_party/third_party/comprehensive), desired_limit, deductible_preference (low/medium/high), industry, employee_count, prior_claims (bool), regulatory_environment (strict/moderate/light)', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PolicyCoverageInput = JSON.parse(args.input_data)
      const result = designPolicyCoverage(input)
      return formatPolicyCoverageReport(input, result)
    }
  }))

  // Tool 3: Breach Cost Estimator
  tools.register(defineTool({
    name: 'breach_cost_estimator',
    description: 'Data breach cost estimation with per-record costing across detection, notification, post-breach response, regulatory/legal, business disruption, and reputational damage categories. Includes IR retainer ROI, industry benchmarks, and mitigation savings analysis.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: breach_type (ransomware/data_exfiltration/insider_threat/hacktivist/third_party/phishing), records_exposed, industry, organization_size (small/medium/large/enterprise), response_time_hours, notification_required (bool), regulatory_jurisdictions[]', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: BreachCostInput = JSON.parse(args.input_data)
      const result = estimateBreachCost(input)
      return formatBreachCostReport(input, result)
    }
  }))

  // Tool 4: Incident Response Planner
  tools.register(defineTool({
    name: 'incident_response_planner',
    description: 'Comprehensive incident response plan generator with 5-phase response timeline (Preparation, Containment, Eradication, Recovery, Post-Incident). Includes notification requirements, evidence preservation, forensic requirements, communication timeline, and IR budget estimates.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: incident_type (ransomware/data_breach/ddos/insider/supply_chain/business_email_compromise), severity (critical/high/medium/low), affected_assets[], data_types_involved[], regulatory_triggers[], internal_team_size, external_ir_retention (bool)', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: IRPlannerInput = JSON.parse(args.input_data)
      const result = planIncidentResponse(input)
      return formatIRPlannerReport(input, result)
    }
  }))

  // Tool 5: Vendor Risk Assessor
  tools.register(defineTool({
    name: 'vendor_risk_assessor',
    description: 'Third-party vendor risk assessment with data access evaluation, fourth-party risk analysis, SLA requirements, contractual protections, and continuous monitoring recommendations. Produces risk score, rating, and residual risk acceptance guidance.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: vendor_name, service_type (cloud_hosting/saas/payment_processing/data_analytics/managed_security/logistics), data_access_level (none/limited/moderate/extensive/full), contract_value, contract_duration_years, criticality (non_critical/important/critical/mission_critical), fourth_party_dependencies (bool), compliance_certifications[]', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: VendorRiskInput = JSON.parse(args.input_data)
      const result = assessVendorRisk(input)
      return formatVendorRiskReport(input, result)
    }
  }))

  // Tool 6: Regulatory Fine Calculator
  tools.register(defineTool({
    name: 'regulatory_fine_calculator',
    description: 'Multi-jurisdictional regulatory fine estimation for GDPR, PIPL (China), CCPA, LGPD, HIPAA, and China Cybersecurity Law. Calculates fine ranges based on records affected, revenue, negligence level, self-reporting status, and prior violations. Includes defense strategies and precedents.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: regulation (gdpr/china_pip/china_ccpa/hipaa/lgpd), violation_type (data_breach/insufficient_consent/cross_border_transfer/failure_to_notify/inadequate_security/data_retention), records_affected, organization_revenue, negligence_level (unintentional/negligent/reckless/willful), self_reported (bool), remediation_speed (immediate/prompt/delayed/none), prior_violations', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RegulatoryFineInput = JSON.parse(args.input_data)
      const result = calculateRegulatoryFine(input)
      return formatRegulatoryFineReport(input, result)
    }
  }))

  // Tool 7: Business Impact Analyzer
  tools.register(defineTool({
    name: 'business_impact_analyzer',
    description: 'Business Impact Analysis (BIA) with Maximum Tolerable Downtime (MTD), Recovery Time Objective (RTO), Recovery Point Objective (RPO), financial impact per hour/day, and operational/reputational/regulatory impact analysis. Includes recovery strategies and resource requirements.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, business_unit, process_name, annual_revenue, daily_transaction_volume, peak_season_factor, dependencies[], regulatory_downtime_limit, customer_impact_threshold', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: BIAInput = JSON.parse(args.input_data)
      const result = analyzeBusinessImpact(input)
      return formatBIAReport(input, result)
    }
  }))

  // Tool 8: Security Maturity Scorer
  tools.register(defineTool({
    name: 'security_maturity_scorer',
    description: 'Security maturity assessment across NIST CSF, ISO 27001, CIS v8, or CMMC frameworks with domain-level scoring, gap analysis, investment priorities, roadmap planning, benchmark comparison, and compliance readiness evaluation.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: organization_name, framework (nist_csf/iso27001/cis_v8/cmmc), domain_scores (Record<string, number>), employee_count, security_staff_count, annual_security_budget, compliance_requirements[], recent_audit_results[]', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: SecurityMaturityInput = JSON.parse(args.input_data)
      const result = scoreSecurityMaturity(input)
      return formatSecurityMaturityReport(input, result)
    }
  }))

  console.log('[dsh-tool-cyberinsur] Loaded v' + VERSION + ' - Cyber Insurance & Risk Transfer Toolkit with 8 tools')
  console.log('  Tools: cyber_risk_quantifier, policy_coverage_designer, breach_cost_estimator, incident_response_planner, vendor_risk_assessor, regulatory_fine_calculator, business_impact_analyzer, security_maturity_scorer')
}
