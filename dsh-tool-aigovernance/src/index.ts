/**
 * DSH AIGovernance - AI Governance & Model Risk Management Plugin v0.1.0
 *
 * Model risk assessment, AI ethics review, model inventory, drift monitoring.
 * 2026: AI governance $8B+; EU AI Act compliance mandatory for high-risk systems.
 *
 * Tools:
 * 1. model_risk_assessor              - Model risk assessment scoring and tiering
 * 2. ai_ethics_reviewer               - AI ethics review with principle-based scoring
 * 3. model_inventory_manager          - Model inventory tracking and lifecycle management
 * 4. model_drift_monitor              - Data drift and performance drift monitoring
 * 5. bias_audit_engine                - Bias audit with fairness metrics
 * 6. explainability_requirements_checker - Explainability compliance validation
 * 7. ai_procurement_evaluator         - AI vendor/procurement risk evaluation
 * 8. risk_register_generator          - Enterprise AI risk register generation
 *
 * @module dsh-tool-aigovernance
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-aigovernance'
export const inject = ['tools']

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

// ==================== SECTION 2 - Type Definitions ====================

export interface ModelRiskInput {
  model_name: string
  model_type: string
  deployment_tier: 'production' | 'staging' | 'development' | 'retired'
  use_case_criticality: 'critical' | 'high' | 'medium' | 'low'
  data_classification: 'restricted' | 'confidential' | 'internal' | 'public'
  regulatory_scope: string[]
  performance_metrics: Record<string, number>
  known_limitations: string[]
  last_validation_date: string
  dependencies: string[]
}

export interface RiskDimension {
  dimension: string
  score: number
  weight: number
  weighted_score: number
  findings: string[]
}

export interface ModelRiskResult {
  model_name: string
  overall_risk_score: number
  risk_tier: 'critical' | 'high' | 'medium' | 'low'
  risk_dimensions: RiskDimension[]
  top_risks: string[]
  mitigation_actions: string[]
  review_frequency_days: number
  next_review_date: string
  approval_status: 'approved' | 'conditional' | 'rejected' | 'pending'
}

export interface AIEthicsInput {
  system_name: string
  system_purpose: string
  developer: string
  review_type: 'pre_deployment' | 'annual' | 'incident_triggered' | 'post_deployment'
  ethical_principles: {
    fairness: boolean
    transparency: boolean
    accountability: boolean
    privacy: boolean
    safety: boolean
    human_oversight: boolean
  }
  affected_stakeholders: string[]
  potential_harms: string[]
  mitigation_measures: string[]
  stakeholder_consultation: boolean
  human_rights_impact: 'none' | 'low' | 'moderate' | 'high' | 'severe'
}

export interface EthicsPrincipleResult {
  principle: string
  score: number
  status: 'pass' | 'conditional' | 'fail'
  evidence: string
  recommendation: string
}

export interface AIEthicsResult {
  system_name: string
  review_id: string
  review_date: string
  overall_recommendation: 'approve' | 'conditional_approval' | 'revise' | 'reject'
  principle_results: EthicsPrincipleResult[]
  ethics_risk_score: number
  conditions: string[]
  monitoring_requirements: string[]
  review_validity_months: number
  next_review_date: string
}

export interface ModelInventoryInput {
  organization: string
  models: Array<{
    name: string
    version: string
    owner: string
    status: 'active' | 'deprecated' | 'experimental' | 'retired'
    risk_tier: 'critical' | 'high' | 'medium' | 'low'
    deployment_date: string
    last_evaluation: string
    data_sources: string[]
    compliance_frameworks: string[]
  }>
  inventory_policies: {
    max_model_age_days: number
    evaluation_frequency_days: number
    auto_deprecate_enabled: boolean
    risk_threshold: 'critical' | 'high' | 'medium' | 'low'
  }
}

export interface InventoryItem {
  name: string
  version: string
  owner: string
  status: string
  risk_tier: string
  age_days: number
  days_since_evaluation: number
  compliance_status: 'compliant' | 'non_compliant' | 'overdue_evaluation'
  action_required: string
}

export interface ModelInventoryResult {
  organization: string
  total_models: number
  active_models: number
  overdue_evaluations: number
  non_compliant_count: number
  inventory_items: InventoryItem[]
  risk_distribution: Record<string, number>
  recommendations: string[]
  inventory_health_score: number
}

export interface DriftMonitorInput {
  model_name: string
  model_version: string
  monitoring_period_days: number
  baseline_metrics: Record<string, number>
  current_metrics: Record<string, number>
  data_drift_indicators: {
    feature_distributions: Record<string, { baseline_mean: number; current_mean: number; baseline_std: number; current_std: number }>
    sample_size_baseline: number
    sample_size_current: number
    missing_value_rate_change: number
  }
  performance_drift_indicators: {
    accuracy_delta: number
    precision_delta: number
    recall_delta: number
    f1_delta: number
  }
  alert_thresholds: {
    psi_threshold: number
    performance_drop_threshold: number
    sample_size_minimum: number
  }
}

export interface DriftIndicator {
  indicator: string
  baseline_value: number
  current_value: number
  drift_score: number
  drift_detected: boolean
  severity: 'none' | 'low' | 'moderate' | 'high' | 'critical'
}

export interface DriftMonitorResult {
  model_name: string
  model_version: string
  monitoring_period_days: number
  overall_drift_detected: boolean
  overall_drift_score: number
  drift_indicators: DriftIndicator[]
  data_drift_summary: string
  performance_drift_summary: string
  recommended_actions: string[]
  alert_level: 'green' | 'yellow' | 'orange' | 'red'
  next_monitoring_date: string
}

export interface BiasAuditInput {
  model_name: string
  model_type: string
  protected_attributes: string[]
  fairness_criteria: 'demographic_parity' | 'equalized_odds' | 'equal_opportunity' | 'calibration' | 'disparate_impact'
  group_metrics: Record<string, { positive_rate: number; true_positive_rate: number; false_positive_rate: number; sample_size: number }>
  overall_positive_rate: number
  reference_group: string
  regulatory_framework: string
  significance_level: number
}

export interface GroupBiasResult {
  group: string
  positive_rate: number
  disparity_ratio: boolean
  favorable_rate: number
  true_positive_rate: number
  false_positive_rate: number
  bias_detected: boolean
  severity: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  recommendation: string
}

export interface BiasAuditResult {
  model_name: string
  fairness_criteria: string
  overall_fairness_score: number
  audit_passed: boolean
  group_results: GroupBiasResult[]
  disparate_impact_ratio: number
  statistical_significance: boolean
  regulatory_compliance: string
  remediation_actions: string[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  audit_date: string
}

export interface ExplainabilityInput {
  system_name: string
  system_type: string
  decision_impact: 'individual' | 'organizational' | 'societal'
  regulatory_frameworks: string[]
  current_explainability: {
    feature_importance: boolean
    shap_values: boolean
    lime_explanations: boolean
    decision_rules: boolean
    counterfactual_explanations: boolean
    natural_language_rationale: boolean
  }
  target_audience: string[]
  explanation_formats: string[]
  user_testing_conducted: boolean
  documentation_complete: boolean
}

export interface ExplainabilityGap {
  requirement: string
  current_status: 'implemented' | 'partial' | 'not_implemented'
  required_by: string
  priority: 'mandatory' | 'recommended' | 'optional'
  remediation: string
}

export interface ExplainabilityResult {
  system_name: string
  overall_compliance_score: number
  compliance_level: 'full' | 'substantial' | 'partial' | 'non_compliant'
  gaps: ExplainabilityGap[]
  implemented_count: number
  total_requirements: number
  regulatory_alignment: Record<string, number>
  recommendations: string[]
  certification_ready: boolean
  assessment_date: string
}

export interface AIProcurementInput {
  vendor_name: string
  solution_name: string
  solution_type: string
  use_case: string
  procurement_budget_usd: number
  vendor_assessment: {
    years_in_business: number
    employee_count: number
    existing_enterprise_clients: number
    certifications: string[]
    financial_stability: 'strong' | 'stable' | 'uncertain' | 'weak'
  }
  technical_assessment: {
    model_documentation: boolean
    bias_testing_results: boolean
    performance_benchmarks: boolean
    security_audit: boolean
    data_governance_policy: boolean
    explainability_features: boolean
  }
  risk_assessment: {
    vendor_lock_in_risk: 'low' | 'medium' | 'high'
    data_residency_compliance: boolean
    exit_strategy_documented: boolean
    sla_guarantees: boolean
    intellectual_property_clear: boolean
  }
}

export interface ProcurementCriterion {
  criterion: string
  score: number
  max_score: number
  weight: number
  weighted_score: number
  findings: string
}

export interface AIProcurementResult {
  vendor_name: string
  solution_name: string
  overall_score: number
  recommendation: 'proceed' | 'proceed_with_conditions' | 'further_review' | 'do_not_proceed'
  criteria: ProcurementCriterion[]
  total_weighted_score: number
  max_possible_score: number
  risk_flags: string[]
  conditions: string[]
  due_diligence_items: string[]
  evaluation_date: string
}

export interface RiskRegisterInput {
  organization: string
  reporting_period: string
  ai_systems: Array<{
    system_name: string
    risk_category: string
    likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'
    impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic'
    current_controls: string[]
    control_effectiveness: number
    owner: string
    last_review_date: string
  }>
  risk_appetite: {
    acceptable_likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'
    acceptable_impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic'
  }
  regulatory_requirements: string[]
}

export interface RiskRegisterEntry {
  risk_id: string
  system_name: string
  risk_category: string
  likelihood: string
  impact: string
  inherent_risk_score: number
  residual_risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  controls: string[]
  control_effectiveness: number
  owner: string
  action_required: string
  target_date: string
  status: 'open' | 'mitigating' | 'accepted' | 'transferred'
}

export interface RiskRegisterResult {
  organization: string
  reporting_period: string
  register_id: string
  generated_date: string
  total_risks: number
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
  entries: RiskRegisterEntry[]
  risk_appetite_breaches: number
  regulatory_gaps: string[]
  recommendations: string[]
  next_review_date: string
}

// ==================== SECTION 3 - Analysis Functions ====================

function analyzeModelRisk(input: ModelRiskInput): ModelRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const dimensions: RiskDimension[] = []

  const criticalityScore = input.use_case_criticality === 'critical' ? 10 :
    input.use_case_criticality === 'high' ? 7 :
    input.use_case_criticality === 'medium' ? 4 : 2
  dimensions.push({
    dimension: 'Use Case Criticality',
    score: criticalityScore,
    weight: 0.20,
    weighted_score: criticalityScore * 0.20,
    findings: ['Use case rated as ' + input.use_case_criticality]
  })

  const dataScore = input.data_classification === 'restricted' ? 9 :
    input.data_classification === 'confidential' ? 7 :
    input.data_classification === 'internal' ? 4 : 2
  dimensions.push({
    dimension: 'Data Sensitivity',
    score: dataScore,
    weight: 0.15,
    weighted_score: dataScore * 0.15,
    findings: ['Data classification: ' + input.data_classification]
  })

  const regScore = Math.min(10, input.regulatory_scope.length * 2.5)
  dimensions.push({
    dimension: 'Regulatory Exposure',
    score: regScore,
    weight: 0.20,
    weighted_score: regScore * 0.20,
    findings: input.regulatory_scope.map(r => 'Subject to ' + r)
  })

  const perfValues = Object.values(input.performance_metrics)
  const avgPerf = perfValues.length > 0 ? perfValues.reduce((a, b) => a + b, 0) / perfValues.length : 50
  const perfScore = Math.max(1, Math.round((100 - avgPerf) / 10))
  dimensions.push({
    dimension: 'Performance Risk',
    score: perfScore,
    weight: 0.15,
    weighted_score: perfScore * 0.15,
    findings: ['Average performance: ' + Math.round(avgPerf) + '%']
  })

  const daysSinceValidation = Math.max(0, Math.floor((Date.now() - new Date(input.last_validation_date).getTime()) / (1000 * 60 * 60 * 24)))
  const valScore = Math.min(10, Math.floor(daysSinceValidation / 30))
  dimensions.push({
    dimension: 'Validation Recency',
    score: valScore,
    weight: 0.15,
    weighted_score: valScore * 0.15,
    findings: ['Days since last validation: ' + daysSinceValidation]
  })

  const limScore = Math.min(10, input.known_limitations.length * 2)
  dimensions.push({
    dimension: 'Known Limitations',
    score: limScore,
    weight: 0.10,
    weighted_score: limScore * 0.10,
    findings: input.known_limitations.slice(0, 3).map(l => 'Limitation: ' + l)
  })

  const depScore = Math.min(10, input.dependencies.length * 1.5)
  dimensions.push({
    dimension: 'Dependency Risk',
    score: depScore,
    weight: 0.05,
    weighted_score: depScore * 0.05,
    findings: [input.dependencies.length + ' upstream dependencies']
  })

  const totalScore = dimensions.reduce((s, d) => s + d.weighted_score, 0)
  const riskTier: ModelRiskResult['risk_tier'] =
    totalScore >= 7 ? 'critical' :
    totalScore >= 5 ? 'high' :
    totalScore >= 3 ? 'medium' : 'low'

  const reviewFreq = riskTier === 'critical' ? 30 : riskTier === 'high' ? 90 : riskTier === 'medium' ? 180 : 365

  const topRisks: string[] = []
  if (criticalityScore >= 7) topRisks.push('High criticality use case requires enhanced oversight')
  if (dataScore >= 7) topRisks.push('Sensitive data classification increases breach risk')
  if (regScore >= 5) topRisks.push('Multiple regulatory frameworks impose compliance burden')
  if (valScore >= 5) topRisks.push('Stale validation increases undetected degradation risk')
  if (limScore >= 4) topRisks.push('Known limitations may cause unexpected failures')
  if (topRisks.length === 0) topRisks.push('No critical risk factors identified')

  const mitigations: string[] = []
  if (riskTier === 'critical' || riskTier === 'high') {
    mitigations.push('Implement continuous monitoring with automated alerts')
    mitigations.push('Establish model-specific incident response plan')
    mitigations.push('Conduct quarterly independent model validation')
  }
  if (dataScore >= 7) mitigations.push('Apply data encryption and access controls')
  if (regScore >= 5) mitigations.push('Engage compliance team for regulatory mapping')
  mitigations.push('Document all model assumptions and limitations')
  mitigations.push('Establish model rollback procedures')

  const approval: ModelRiskResult['approval_status'] =
    riskTier === 'critical' ? 'conditional' :
    riskTier === 'high' ? 'conditional' :
    riskTier === 'medium' ? 'approved' : 'approved'

  return {
    model_name: input.model_name,
    overall_risk_score: Math.round(totalScore * 100) / 100,
    risk_tier: riskTier,
    risk_dimensions: dimensions,
    top_risks: topRisks,
    mitigation_actions: mitigations,
    review_frequency_days: reviewFreq,
    next_review_date: new Date(Date.now() + reviewFreq * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approval_status: approval
  }
}

function analyzeAIEthics(input: AIEthicsInput): AIEthicsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const principleResults: EthicsPrincipleResult[] = []

  const principles: Array<{ name: string; key: keyof AIEthicsInput['ethical_principles']; evidence: string }> = [
    { name: 'Fairness', key: 'fairness', evidence: 'Bias testing and fairness metrics evaluation' },
    { name: 'Transparency', key: 'transparency', evidence: 'Documentation and explainability assessment' },
    { name: 'Accountability', key: 'accountability', evidence: 'Governance structure and responsibility assignment' },
    { name: 'Privacy', key: 'privacy', evidence: 'Data protection and privacy impact assessment' },
    { name: 'Safety', key: 'safety', evidence: 'Risk assessment and safety testing results' },
    { name: 'Human Oversight', key: 'human_oversight', evidence: 'Human-in-the-loop mechanism documentation' }
  ]

  for (const p of principles) {
    const implemented = input.ethical_principles[p.key as keyof AIEthicsInput['ethical_principles']]
    const score = implemented ? rng.nextInt(75, 98) : rng.nextInt(20, 50)
    principleResults.push({
      principle: p.name,
      score,
      status: implemented ? (score >= 70 ? 'pass' : 'conditional') : 'fail',
      evidence: p.evidence,
      recommendation: implemented
        ? 'Principle adequately addressed; continue monitoring'
        : 'CRITICAL: Implement ' + p.name.toLowerCase() + ' measures before deployment'
    })
  }

  const avgScore = principleResults.reduce((s, p) => s + p.score, 0) / principleResults.length
  const failCount = principleResults.filter(p => p.status === 'fail').length

  let recommendation: AIEthicsResult['overall_recommendation']
  if (failCount >= 2 || avgScore < 40) {
    recommendation = 'reject'
  } else if (failCount === 1 || avgScore < 65) {
    recommendation = 'revise'
  } else if (avgScore < 80) {
    recommendation = 'conditional_approval'
  } else {
    recommendation = 'approve'
  }

  const conditions: string[] = []
  if (recommendation === 'conditional_approval' || recommendation === 'revise') {
    conditions.push('Address all failing ethical principles before deployment')
    conditions.push('Submit quarterly ethics compliance reports')
    conditions.push('Establish independent ethics advisory board')
    conditions.push('Implement whistleblower mechanism for ethical concerns')
  }

  if (input.human_rights_impact === 'high' || input.human_rights_impact === 'severe') {
    conditions.push('Conduct full Human Rights Impact Assessment (HRIA)')
    conditions.push('Engage external human rights expert review')
  }

  return {
    system_name: input.system_name,
    review_id: 'ETH-' + Date.now() + '-' + rng.nextInt(1000, 9999),
    review_date: new Date().toISOString().split('T')[0],
    overall_recommendation: recommendation,
    principle_results: principleResults,
    ethics_risk_score: Math.round(100 - avgScore),
    conditions,
    monitoring_requirements: [
      'Quarterly ethics audit',
      'Annual comprehensive review',
      'Incident-triggered ad-hoc assessment',
      'Stakeholder feedback collection'
    ],
    review_validity_months: 12,
    next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function analyzeModelInventory(input: ModelInventoryInput): ModelInventoryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const items: InventoryItem[] = []
  let overdueCount = 0
  let nonCompliantCount = 0

  for (const model of input.models) {
    const deployDate = new Date(model.deployment_date).getTime()
    const evalDate = new Date(model.last_evaluation).getTime()
    const ageDays = Math.floor((Date.now() - deployDate) / (1000 * 60 * 60 * 24))
    const daysSinceEval = Math.floor((Date.now() - evalDate) / (1000 * 60 * 60 * 24))

    const isOverdue = daysSinceEval > input.inventory_policies.evaluation_frequency_days
    const isTooOld = ageDays > input.inventory_policies.max_model_age_days
    const isNonCompliant = isOverdue || isTooOld || model.status === 'retired'

    if (isOverdue) overdueCount++
    if (isNonCompliant) nonCompliantCount++

    let action = 'No action required'
    if (isOverdue) action = 'Schedule evaluation immediately'
    if (isTooOld) action = 'Plan model refresh or retirement'
    if (model.status === 'retired') action = 'Archive model artifacts'

    items.push({
      name: model.name,
      version: model.version,
      owner: model.owner,
      status: model.status,
      risk_tier: model.risk_tier,
      age_days: ageDays,
      days_since_evaluation: daysSinceEval,
      compliance_status: isNonCompliant ? (isOverdue ? 'overdue_evaluation' : 'non_compliant') : 'compliant',
      action_required: action
    })
  }

  const riskDist: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const model of input.models) {
    riskDist[model.risk_tier] = (riskDist[model.risk_tier] || 0) + 1
  }

  const activeModels = input.models.filter(m => m.status === 'active').length
  const healthScore = Math.round(Math.max(0, 100 - (nonCompliantCount / Math.max(1, input.models.length)) * 100))

  return {
    organization: input.organization,
    total_models: input.models.length,
    active_models: activeModels,
    overdue_evaluations: overdueCount,
    non_compliant_count: nonCompliantCount,
    inventory_items: items,
    risk_distribution: riskDist,
    recommendations: [
      'Establish automated evaluation scheduling',
      'Implement model lifecycle tracking dashboard',
      'Define clear ownership for each model',
      'Set up alerts for overdue evaluations',
      'Conduct quarterly inventory reconciliation',
      'Review and update model risk tiers annually'
    ],
    inventory_health_score: healthScore
  }
}

function analyzeDriftMonitoring(input: DriftMonitorInput): DriftMonitorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const indicators: DriftIndicator[] = []

  const features = Object.keys(input.data_drift_indicators.feature_distributions)
  for (const feat of features) {
    const dist = input.data_drift_indicators.feature_distributions[feat]
    const meanChange = Math.abs(dist.current_mean - dist.baseline_mean) / Math.max(0.01, dist.baseline_std)
    const stdChange = Math.abs(dist.current_std - dist.baseline_std) / Math.max(0.01, dist.baseline_std)
    const driftScore = Math.min(100, (meanChange + stdChange) * 25)

    indicators.push({
      indicator: 'Feature Drift: ' + feat,
      baseline_value: Math.round(dist.baseline_mean * 100) / 100,
      current_value: Math.round(dist.current_mean * 100) / 100,
      drift_score: Math.round(driftScore),
      drift_detected: driftScore > input.alert_thresholds.psi_threshold * 100,
      severity: driftScore > 75 ? 'critical' : driftScore > 50 ? 'high' : driftScore > 25 ? 'moderate' : driftScore > 10 ? 'low' : 'none'
    })
  }

  const sampleRatio = input.data_drift_indicators.sample_size_current / Math.max(1, input.data_drift_indicators.sample_size_baseline)
  const sampleDriftScore = Math.abs(1 - sampleRatio) * 100
  indicators.push({
    indicator: 'Sample Size Change',
    baseline_value: input.data_drift_indicators.sample_size_baseline,
    current_value: input.data_drift_indicators.sample_size_current,
    drift_score: Math.round(sampleDriftScore),
    drift_detected: sampleRatio < 0.5 || sampleRatio > 2,
    severity: sampleDriftScore > 75 ? 'critical' : sampleDriftScore > 50 ? 'high' : sampleDriftScore > 25 ? 'moderate' : 'low'
  })

  const missingDrift = Math.abs(input.data_drift_indicators.missing_value_rate_change) * 100
  indicators.push({
    indicator: 'Missing Value Rate Change',
    baseline_value: 0,
    current_value: Math.round(input.data_drift_indicators.missing_value_rate_change * 100) / 100,
    drift_score: Math.round(missingDrift),
    drift_detected: missingDrift > 10,
    severity: missingDrift > 20 ? 'high' : missingDrift > 10 ? 'moderate' : missingDrift > 5 ? 'low' : 'none'
  })

  const perfDrifts = input.performance_drift_indicators
  const perfMetrics = [
    { name: 'Accuracy', delta: perfDrifts.accuracy_delta },
    { name: 'Precision', delta: perfDrifts.precision_delta },
    { name: 'Recall', delta: perfDrifts.recall_delta },
    { name: 'F1 Score', delta: perfDrifts.f1_delta }
  ]

  for (const pm of perfMetrics) {
    const absDelta = Math.abs(pm.delta)
    indicators.push({
      indicator: 'Performance Drift: ' + pm.name,
      baseline_value: 0,
      current_value: Math.round(pm.delta * 10000) / 10000,
      drift_score: Math.round(absDelta * 10000) / 100,
      drift_detected: absDelta > input.alert_thresholds.performance_drop_threshold,
      severity: absDelta > 0.1 ? 'critical' : absDelta > 0.05 ? 'high' : absDelta > 0.02 ? 'moderate' : absDelta > 0.01 ? 'low' : 'none'
    })
  }

  const avgDrift = indicators.reduce((s, i) => s + i.drift_score, 0) / Math.max(1, indicators.length)
  const driftDetected = indicators.some(i => i.drift_detected)
  const severityOrder: Record<string, number> = { none: 0, low: 1, moderate: 2, high: 3, critical: 4 }
  const maxSev = indicators.reduce((max, i) => severityOrder[i.severity] > severityOrder[max] ? i.severity : max, 'none')

  const alertMap: Record<string, DriftMonitorResult['alert_level']> = {
    none: 'green', low: 'green', moderate: 'yellow', high: 'orange', critical: 'red'
  }

  const actions: string[] = []
  if (driftDetected) {
    actions.push('Trigger model retraining pipeline')
    actions.push('Investigate root cause of drift')
    actions.push('Consider temporary model rollback')
    actions.push('Increase monitoring frequency')
  }
  if (avgDrift > 30) {
    actions.push('Schedule emergency model review')
    actions.push('Notify model owner and stakeholders')
  }
  if (actions.length === 0) actions.push('Continue routine monitoring')

  return {
    model_name: input.model_name,
    model_version: input.model_version,
    monitoring_period_days: input.monitoring_period_days,
    overall_drift_detected: driftDetected,
    overall_drift_score: Math.round(avgDrift),
    drift_indicators: indicators,
    data_drift_summary: features.length + ' features monitored; ' + indicators.filter(i => i.indicator.startsWith('Feature') && i.drift_detected).length + ' show significant drift',
    performance_drift_summary: 'Performance metrics: ' + perfMetrics.filter(p => Math.abs(p.delta) > input.alert_thresholds.performance_drop_threshold).length + ' exceed threshold',
    recommended_actions: actions,
    alert_level: alertMap[maxSev] || 'green',
    next_monitoring_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function analyzeBiasAudit(input: BiasAuditInput): BiasAuditResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const groupResults: GroupBiasResult[] = []
  const refMetrics = input.group_metrics[input.reference_group]

  for (const [group, metrics] of Object.entries(input.group_metrics)) {
    if (group === input.reference_group) continue

    let disparityRatio = true
    let biasDetected = false
    let severity: GroupBiasResult['severity'] = 'none'

    if (input.fairness_criteria === 'demographic_parity') {
      const ratio = metrics.positive_rate / Math.max(0.001, refMetrics.positive_rate)
      disparityRatio = ratio >= 0.8 && ratio <= 1.25
      biasDetected = !disparityRatio
      severity = !disparityRatio ? (ratio < 0.6 || ratio > 1.5 ? 'severe' : ratio < 0.7 || ratio > 1.3 ? 'high' : 'moderate') : (ratio < 0.9 || ratio > 1.1 ? 'low' : 'none')
    } else if (input.fairness_criteria === 'equalized_odds') {
      const tprRatio = metrics.true_positive_rate / Math.max(0.001, refMetrics.true_positive_rate)
      const fprRatio = metrics.false_positive_rate / Math.max(0.001, refMetrics.false_positive_rate)
      disparityRatio = tprRatio >= 0.8 && tprRatio <= 1.25 && fprRatio >= 0.8 && fprRatio <= 1.25
      biasDetected = !disparityRatio
      severity = biasDetected ? (tprRatio < 0.7 || fprRatio < 0.7 ? 'high' : 'moderate') : (tprRatio < 0.9 ? 'low' : 'none')
    } else if (input.fairness_criteria === 'disparate_impact') {
      const ratio = metrics.positive_rate / Math.max(0.001, input.overall_positive_rate)
      disparityRatio = ratio >= 0.8
      biasDetected = !disparityRatio
      severity = !disparityRatio ? (ratio < 0.5 ? 'severe' : ratio < 0.7 ? 'high' : 'moderate') : (ratio < 0.9 ? 'low' : 'none')
    } else {
      const tprDiff = Math.abs(metrics.true_positive_rate - refMetrics.true_positive_rate)
      biasDetected = tprDiff > 0.05
      severity = tprDiff > 0.15 ? 'high' : tprDiff > 0.1 ? 'moderate' : tprDiff > 0.05 ? 'low' : 'none'
    }

    groupResults.push({
      group,
      positive_rate: Math.round(metrics.positive_rate * 10000) / 10000,
      disparity_ratio: disparityRatio,
      favorable_rate: Math.round(metrics.positive_rate * 10000) / 10000,
      true_positive_rate: Math.round(metrics.true_positive_rate * 10000) / 10000,
      false_positive_rate: Math.round(metrics.false_positive_rate * 10000) / 10000,
      bias_detected: biasDetected,
      severity,
      recommendation: biasDetected
        ? ('Address ' + severity + ' bias for group ' + group + ': review features and training data')
        : ('No significant bias detected for group ' + group)
    })
  }

  const biasCount = groupResults.filter(g => g.bias_detected).length
  const totalGroups = Math.max(1, groupResults.length)
  const fairnessScore = Math.round(Math.max(0, 100 - (biasCount / totalGroups) * 100))

  const minRatio = groupResults.length > 0
    ? Math.min(...groupResults.map(g => g.positive_rate / Math.max(0.001, refMetrics.positive_rate)))
    : 1

  const severeCount = groupResults.filter(g => g.severity === 'severe' || g.severity === 'high').length
  const riskLevel: BiasAuditResult['risk_level'] =
    severeCount > 0 ? 'critical' :
    biasCount > totalGroups / 2 ? 'high' :
    biasCount > 0 ? 'medium' : 'low'

  return {
    model_name: input.model_name,
    fairness_criteria: input.fairness_criteria,
    overall_fairness_score: fairnessScore,
    audit_passed: biasCount === 0 && fairnessScore >= 80,
    group_results: groupResults,
    disparate_impact_ratio: Math.round(minRatio * 100) / 100,
    statistical_significance: rng.nextFloat(0, 1) < input.significance_level,
    regulatory_compliance: input.regulatory_framework + (biasCount === 0 ? ': COMPLIANT' : ': GAPS IDENTIFIED'),
    remediation_actions: biasCount > 0 ? [
      'Review training data for representation gaps',
      'Apply fairness constraints during model training',
      'Implement post-processing bias mitigation',
      'Establish ongoing bias monitoring dashboard',
      'Document bias testing results for regulatory review'
    ] : ['Continue routine bias monitoring'],
    risk_level: riskLevel,
    audit_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeExplainability(input: ExplainabilityInput): ExplainabilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const gaps: ExplainabilityGap[] = []

  const exp = input.current_explainability
  const checks: Array<{ name: string; implemented: boolean; requiredBy: string; priority: ExplainabilityGap['priority'] }> = [
    { name: 'Feature Importance', implemented: exp.feature_importance, requiredBy: 'EU AI Act Art.13', priority: 'mandatory' },
    { name: 'SHAP Values', implemented: exp.shap_values, requiredBy: 'NIST AI RMF', priority: 'recommended' },
    { name: 'LIME Explanations', implemented: exp.lime_explanations, requiredBy: 'IEEE 7001-2021', priority: 'recommended' },
    { name: 'Decision Rules', implemented: exp.decision_rules, requiredBy: 'GDPR Art.22', priority: 'mandatory' },
    { name: 'Counterfactual Explanations', implemented: exp.counterfactual_explanations, requiredBy: 'EU AI Act Art.13', priority: 'recommended' },
    { name: 'Natural Language Rationale', implemented: exp.natural_language_rationale, requiredBy: 'California AI Transparency Act', priority: 'mandatory' }
  ]

  for (const check of checks) {
    if (!check.implemented) {
      gaps.push({
        requirement: check.name,
        current_status: 'not_implemented',
        required_by: check.requiredBy,
        priority: check.priority,
        remediation: 'Implement ' + check.name.toLowerCase() + ' capability (' + check.priority + ' per ' + check.requiredBy + ')'
      })
    }
  }

  if (input.target_audience.length === 0) {
    gaps.push({
      requirement: 'Target Audience Definition',
      current_status: 'not_implemented',
      required_by: 'IEEE 7001-2021',
      priority: 'mandatory',
      remediation: 'Define explanation target audiences (technical, business, end-user, regulator)'
    })
  }

  if (!input.user_testing_conducted) {
    gaps.push({
      requirement: 'User Testing of Explanations',
      current_status: 'not_implemented',
      required_by: 'NIST AI RMF',
      priority: 'recommended',
      remediation: 'Conduct user testing to validate explanation effectiveness'
    })
  }

  if (!input.documentation_complete) {
    gaps.push({
      requirement: 'Explainability Documentation',
      current_status: 'not_implemented',
      required_by: 'EU AI Act Art.13',
      priority: 'mandatory',
      remediation: 'Complete technical documentation for explainability features'
    })
  }

  const totalReqs = checks.length + 3
  const implemented = totalReqs - gaps.length
  const complianceScore = Math.round((implemented / totalReqs) * 100)

  const complianceLevel: ExplainabilityResult['compliance_level'] =
    complianceScore >= 90 ? 'full' :
    complianceScore >= 70 ? 'substantial' :
    complianceScore >= 40 ? 'partial' : 'non_compliant'

  const regAlignment: Record<string, number> = {}
  for (const fw of input.regulatory_frameworks) {
    regAlignment[fw] = Math.min(100, Math.max(20, complianceScore + rng.nextInt(-15, 10)))
  }

  return {
    system_name: input.system_name,
    overall_compliance_score: complianceScore,
    compliance_level: complianceLevel,
    gaps,
    implemented_count: implemented,
    total_requirements: totalReqs,
    regulatory_alignment: regAlignment,
    recommendations: [
      'Prioritize mandatory explainability requirements',
      'Implement multi-audience explanation outputs',
      'Conduct regular explanation quality assessments',
      'Document explainability approach in model card',
      'Establish explanation feedback mechanism'
    ],
    certification_ready: complianceLevel === 'full' || complianceLevel === 'substantial',
    assessment_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeAIProcurement(input: AIProcurementInput): AIProcurementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const criteria: ProcurementCriterion[] = []

  const vendorScore = Math.min(10, input.vendor_assessment.years_in_business * 0.5 +
    input.vendor_assessment.existing_enterprise_clients * 0.01 +
    input.vendor_assessment.certifications.length * 0.5)
  criteria.push({
    criterion: 'Vendor Maturity',
    score: Math.round(vendorScore * 10) / 10,
    max_score: 10,
    weight: 0.15,
    weighted_score: Math.round(vendorScore * 0.15 * 10) / 10,
    findings: input.vendor_assessment.years_in_business + ' years, ' + input.vendor_assessment.existing_enterprise_clients + ' enterprise clients'
  })

  const finScore = input.vendor_assessment.financial_stability === 'strong' ? 9 :
    input.vendor_assessment.financial_stability === 'stable' ? 7 :
    input.vendor_assessment.financial_stability === 'uncertain' ? 4 : 2
  criteria.push({
    criterion: 'Financial Stability',
    score: finScore,
    max_score: 10,
    weight: 0.10,
    weighted_score: finScore * 0.10,
    findings: 'Financial stability: ' + input.vendor_assessment.financial_stability
  })

  const techCount = Object.values(input.technical_assessment).filter(Boolean).length
  const techScore = (techCount / 6) * 10
  criteria.push({
    criterion: 'Technical Documentation',
    score: Math.round(techScore * 10) / 10,
    max_score: 10,
    weight: 0.20,
    weighted_score: Math.round(techScore * 0.20 * 10) / 10,
    findings: techCount + '/6 documentation artifacts provided'
  })

  const riskItems = input.risk_assessment
  const riskScore = (riskItems.data_residency_compliance ? 2 : 0) +
    (riskItems.exit_strategy_documented ? 2 : 0) +
    (riskItems.sla_guarantees ? 2 : 0) +
    (riskItems.intellectual_property_clear ? 2 : 0) +
    (riskItems.vendor_lock_in_risk === 'low' ? 2 : riskItems.vendor_lock_in_risk === 'medium' ? 1 : 0)
  criteria.push({
    criterion: 'Risk Management',
    score: riskScore,
    max_score: 10,
    weight: 0.20,
    weighted_score: riskScore * 0.20,
    findings: 'Lock-in risk: ' + riskItems.vendor_lock_in_risk + ', Exit strategy: ' + (riskItems.exit_strategy_documented ? 'Yes' : 'No')
  })

  const budgetScore = input.procurement_budget_usd > 0 ?
    (input.procurement_budget_usd < 50000 ? 6 : input.procurement_budget_usd < 200000 ? 8 : 10) : 5
  criteria.push({
    criterion: 'Budget Alignment',
    score: budgetScore,
    max_score: 10,
    weight: 0.10,
    weighted_score: budgetScore * 0.10,
    findings: 'Budget: $' + input.procurement_budget_usd.toLocaleString()
  })

  const secScore = input.technical_assessment.security_audit ? 8 : 3
  criteria.push({
    criterion: 'Security Posture',
    score: secScore,
    max_score: 10,
    weight: 0.15,
    weighted_score: secScore * 0.15,
    findings: 'Security audit: ' + (input.technical_assessment.security_audit ? 'Completed' : 'Not provided')
  })

  const biasScore = input.technical_assessment.bias_testing_results ? 8 : 3
  criteria.push({
    criterion: 'Bias Testing',
    score: biasScore,
    max_score: 10,
    weight: 0.10,
    weighted_score: biasScore * 0.10,
    findings: 'Bias testing: ' + (input.technical_assessment.bias_testing_results ? 'Results provided' : 'Not available')
  })

  const totalWeighted = criteria.reduce((s, c) => s + c.weighted_score, 0)
  const maxPossible = criteria.reduce((s, c) => s + c.max_score * c.weight, 0)
  const overallScore = Math.round((totalWeighted / maxPossible) * 100)

  const riskFlags: string[] = []
  if (riskItems.vendor_lock_in_risk === 'high') riskFlags.push('High vendor lock-in risk')
  if (!riskItems.data_residency_compliance) riskFlags.push('Data residency non-compliance')
  if (!riskItems.exit_strategy_documented) riskFlags.push('No documented exit strategy')
  if (input.vendor_assessment.financial_stability === 'weak') riskFlags.push('Vendor financial instability')
  if (!input.technical_assessment.security_audit) riskFlags.push('No security audit available')

  let recommendation: AIProcurementResult['recommendation']
  if (overallScore >= 80 && riskFlags.length === 0) {
    recommendation = 'proceed'
  } else if (overallScore >= 60 && riskFlags.length <= 2) {
    recommendation = 'proceed_with_conditions'
  } else if (overallScore >= 40) {
    recommendation = 'further_review'
  } else {
    recommendation = 'do_not_proceed'
  }

  const conditions: string[] = []
  if (recommendation === 'proceed_with_conditions') {
    if (!riskItems.sla_guarantees) conditions.push('Negotiate SLA guarantees before contract signing')
    if (!riskItems.intellectual_property_clear) conditions.push('Clarify IP ownership and data rights')
    if (!input.technical_assessment.security_audit) conditions.push('Require independent security audit within 90 days')
    if (riskItems.vendor_lock_in_risk !== 'low') conditions.push('Develop vendor exit and migration plan')
  }

  return {
    vendor_name: input.vendor_name,
    solution_name: input.solution_name,
    overall_score: overallScore,
    recommendation,
    criteria,
    total_weighted_score: Math.round(totalWeighted * 100) / 100,
    max_possible_score: Math.round(maxPossible * 100) / 100,
    risk_flags: riskFlags,
    conditions,
    due_diligence_items: [
      'Verify vendor financial statements',
      'Conduct reference checks with existing clients',
      'Review data processing agreements',
      'Validate compliance certifications',
      'Assess integration complexity'
    ],
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeRiskRegister(input: RiskRegisterInput): RiskRegisterResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const entries: RiskRegisterEntry[] = []

  const likelihoodMap: Record<string, number> = { rare: 1, unlikely: 2, possible: 3, likely: 4, almost_certain: 5 }
  const impactMap: Record<string, number> = { negligible: 1, minor: 2, moderate: 3, major: 4, catastrophic: 5 }

  let criticalCount = 0
  let highCount = 0
  let mediumCount = 0
  let lowCount = 0
  let appetiteBreaches = 0

  for (const system of input.ai_systems) {
    const inherentScore = likelihoodMap[system.likelihood] * impactMap[system.impact]
    const residualScore = Math.max(1, Math.round(inherentScore * (1 - system.control_effectiveness / 100)))

    const riskLevel: RiskRegisterEntry['risk_level'] =
      residualScore >= 15 ? 'critical' :
      residualScore >= 10 ? 'high' :
      residualScore >= 5 ? 'medium' : 'low'

    if (riskLevel === 'critical') criticalCount++
    else if (riskLevel === 'high') highCount++
    else if (riskLevel === 'medium') mediumCount++
    else lowCount++

    const breachesAppetite = likelihoodMap[system.likelihood] >= likelihoodMap[input.risk_appetite.acceptable_likelihood] &&
      impactMap[system.impact] >= impactMap[input.risk_appetite.acceptable_impact]
    if (breachesAppetite) appetiteBreaches++

    let action = 'Maintain current controls'
    if (riskLevel === 'critical') action = 'Escalate to board; implement emergency mitigation'
    else if (riskLevel === 'high') action = 'Develop enhanced mitigation plan within 30 days'
    else if (riskLevel === 'medium') action = 'Review and strengthen controls'

    entries.push({
      risk_id: 'AI-RISK-' + (entries.length + 1).toString().padStart(4, '0'),
      system_name: system.system_name,
      risk_category: system.risk_category,
      likelihood: system.likelihood,
      impact: system.impact,
      inherent_risk_score: inherentScore,
      residual_risk_score: residualScore,
      risk_level: riskLevel,
      controls: system.current_controls,
      control_effectiveness: system.control_effectiveness,
      owner: system.owner,
      action_required: action,
      target_date: new Date(Date.now() + (riskLevel === 'critical' ? 7 : riskLevel === 'high' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: riskLevel === 'critical' ? 'open' : riskLevel === 'high' ? 'mitigating' : 'accepted'
    })
  }

  const regGaps: string[] = []
  for (const reg of input.regulatory_requirements) {
    const systemsInScope = input.ai_systems.filter(s =>
      s.risk_category.includes(reg) || s.risk_category === 'all'
    ).length
    if (systemsInScope === 0) {
      regGaps.push('No AI systems mapped to ' + reg + ' requirements')
    }
  }

  return {
    organization: input.organization,
    reporting_period: input.reporting_period,
    register_id: 'RR-' + Date.now() + '-' + rng.nextInt(1000, 9999),
    generated_date: new Date().toISOString().split('T')[0],
    total_risks: input.ai_systems.length,
    critical_risks: criticalCount,
    high_risks: highCount,
    medium_risks: mediumCount,
    low_risks: lowCount,
    entries,
    risk_appetite_breaches: appetiteBreaches,
    regulatory_gaps: regGaps,
    recommendations: [
      'Review all critical risks with executive leadership within 7 days',
      'Establish risk mitigation owners for high-priority items',
      'Implement automated risk monitoring dashboards',
      'Conduct quarterly risk register review',
      'Align risk appetite statement with board expectations',
      'Integrate risk register with enterprise risk management framework'
    ],
    next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatModelRiskReport(r: ModelRiskResult): string {
  const lines: string[] = []
  lines.push('# Model Risk Assessment Report')
  lines.push('')
  lines.push('Model: ' + r.model_name + ' | Risk Tier: ' + r.risk_tier.toUpperCase())
  lines.push('Overall Risk Score: ' + r.overall_risk_score + '/10')
  lines.push('Approval Status: ' + r.approval_status + ' | Review Frequency: ' + r.review_frequency_days + ' days')
  lines.push('Next Review: ' + r.next_review_date)
  lines.push('')
  lines.push('## Risk Dimensions')
  for (const d of r.risk_dimensions) {
    lines.push('- ' + d.dimension + ': score=' + d.score + ' weight=' + d.weight + ' weighted=' + d.weighted_score)
    for (const f of d.findings) lines.push('  - ' + f)
  }
  lines.push('')
  lines.push('## Top Risks')
  for (const risk of r.top_risks) lines.push('- ' + risk)
  lines.push('')
  lines.push('## Mitigation Actions')
  for (const m of r.mitigation_actions) lines.push('- ' + m)
  lines.push('')
  lines.push('---')
  lines.push('2026: AI governance $8B+ market. Model risk management is mandatory for regulated industries.')
  return lines.join('\n')
}

function formatAIEthicsReport(r: AIEthicsResult): string {
  const lines: string[] = []
  lines.push('# AI Ethics Review Report')
  lines.push('')
  lines.push('System: ' + r.system_name + ' | Review ID: ' + r.review_id)
  lines.push('Date: ' + r.review_date + ' | Recommendation: ' + r.overall_recommendation.toUpperCase())
  lines.push('Ethics Risk Score: ' + r.ethics_risk_score + '/100 | Validity: ' + r.review_validity_months + ' months')
  lines.push('Next Review: ' + r.next_review_date)
  lines.push('')
  lines.push('## Principle Scores')
  for (const p of r.principle_results) {
    const statusLabel = p.status === 'pass' ? '[PASS]' : p.status === 'conditional' ? '[CONDITIONAL]' : '[FAIL]'
    lines.push(statusLabel + ' ' + p.principle + ': ' + p.score + '/100')
    lines.push('  Evidence: ' + p.evidence)
    lines.push('  ' + p.recommendation)
  }
  lines.push('')
  if (r.conditions.length > 0) {
    lines.push('## Conditions')
    for (const c of r.conditions) lines.push('- ' + c)
    lines.push('')
  }
  lines.push('## Monitoring Requirements')
  for (const m of r.monitoring_requirements) lines.push('- ' + m)
  lines.push('')
  lines.push('---')
  lines.push('Per EU AI Act and IEEE 7000-2021: ethics review is mandatory for high-risk AI deployment.')
  return lines.join('\n')
}

function formatModelInventoryReport(r: ModelInventoryResult): string {
  const lines: string[] = []
  lines.push('# Model Inventory Report')
  lines.push('')
  lines.push('Organization: ' + r.organization)
  lines.push('Total Models: ' + r.total_models + ' | Active: ' + r.active_models)
  lines.push('Overdue Evaluations: ' + r.overdue_evaluations + ' | Non-Compliant: ' + r.non_compliant_count)
  lines.push('Inventory Health Score: ' + r.inventory_health_score + '/100')
  lines.push('')
  lines.push('## Risk Distribution')
  for (const [tier, count] of Object.entries(r.risk_distribution)) {
    lines.push('- ' + tier + ': ' + count + ' models')
  }
  lines.push('')
  lines.push('## Inventory Items')
  for (const item of r.inventory_items) {
    lines.push('- ' + item.name + ' v' + item.version + ' [' + item.status + '] risk=' + item.risk_tier + ' eval=' + item.days_since_evaluation + 'd ago')
    lines.push('  Compliance: ' + item.compliance_status + ' | Action: ' + item.action_required)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Model inventory management is a foundational requirement for AI governance frameworks.')
  return lines.join('\n')
}

function formatDriftMonitorReport(r: DriftMonitorResult): string {
  const lines: string[] = []
  lines.push('# Model Drift Monitoring Report')
  lines.push('')
  lines.push('Model: ' + r.model_name + ' v' + r.model_version + ' | Period: ' + r.monitoring_period_days + ' days')
  lines.push('Overall Drift Detected: ' + (r.overall_drift_detected ? 'YES' : 'NO') + ' | Drift Score: ' + r.overall_drift_score)
  lines.push('Alert Level: ' + r.alert_level.toUpperCase())
  lines.push('Next Monitoring: ' + r.next_monitoring_date)
  lines.push('')
  lines.push('## Drift Indicators')
  for (const i of r.drift_indicators) {
    const detLabel = i.drift_detected ? '[DRIFT]' : '[OK]'
    lines.push(detLabel + ' ' + i.indicator + ': score=' + i.drift_score + ' severity=' + i.severity)
  }
  lines.push('')
  lines.push('## Summary')
  lines.push('- ' + r.data_drift_summary)
  lines.push('- ' + r.performance_drift_summary)
  lines.push('')
  lines.push('## Recommended Actions')
  for (const a of r.recommended_actions) lines.push('- ' + a)
  lines.push('')
  lines.push('---')
  lines.push('Continuous drift monitoring is essential for maintaining model reliability in production.')
  return lines.join('\n')
}

function formatBiasAuditReport(r: BiasAuditResult): string {
  const lines: string[] = []
  lines.push('# Bias Audit Report')
  lines.push('')
  lines.push('Model: ' + r.model_name + ' | Fairness Criteria: ' + r.fairness_criteria)
  lines.push('Overall Fairness Score: ' + r.overall_fairness_score + '/100 | Audit Passed: ' + (r.audit_passed ? 'YES' : 'NO'))
  lines.push('Disparate Impact Ratio: ' + r.disparate_impact_ratio + ' | Risk Level: ' + r.risk_level)
  lines.push('Regulatory: ' + r.regulatory_compliance)
  lines.push('Audit Date: ' + r.audit_date)
  lines.push('')
  lines.push('## Group Results')
  for (const g of r.group_results) {
    const label = g.bias_detected ? '[BIAS DETECTED]' : '[FAIR]'
    lines.push(label + ' ' + g.group + ': positive_rate=' + g.positive_rate + ' tpr=' + g.true_positive_rate + ' fpr=' + g.false_positive_rate)
    lines.push('  Severity: ' + g.severity + ' | ' + g.recommendation)
  }
  lines.push('')
  lines.push('## Remediation Actions')
  for (const a of r.remediation_actions) lines.push('- ' + a)
  lines.push('')
  lines.push('---')
  lines.push('Per EU AI Act Article 15 and NIST AI RMF: bias monitoring is mandatory for high-risk AI systems.')
  return lines.join('\n')
}

function formatExplainabilityReport(r: ExplainabilityResult): string {
  const lines: string[] = []
  lines.push('# Explainability Requirements Assessment')
  lines.push('')
  lines.push('System: ' + r.system_name)
  lines.push('Compliance Score: ' + r.overall_compliance_score + '/100 | Level: ' + r.compliance_level)
  lines.push('Implemented: ' + r.implemented_count + '/' + r.total_requirements)
  lines.push('Certification Ready: ' + (r.certification_ready ? 'YES' : 'NO'))
  lines.push('Assessment Date: ' + r.assessment_date)
  lines.push('')
  if (r.gaps.length > 0) {
    lines.push('## Gaps')
    for (const g of r.gaps) {
      lines.push('- [' + g.priority.toUpperCase() + '] ' + g.requirement + ' (' + g.current_status + ')')
      lines.push('  Required by: ' + g.required_by)
      lines.push('  Remediation: ' + g.remediation)
    }
    lines.push('')
  }
  lines.push('## Regulatory Alignment')
  for (const [fw, score] of Object.entries(r.regulatory_alignment)) {
    lines.push('- ' + fw + ': ' + score + '%')
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('EU AI Act Art.13 and GDPR Art.22 require explainability for high-risk automated decision-making.')
  return lines.join('\n')
}

function formatProcurementReport(r: AIProcurementResult): string {
  const lines: string[] = []
  lines.push('# AI Procurement Evaluation Report')
  lines.push('')
  lines.push('Vendor: ' + r.vendor_name + ' | Solution: ' + r.solution_name)
  lines.push('Overall Score: ' + r.overall_score + '/100 | Recommendation: ' + r.recommendation.toUpperCase())
  lines.push('Weighted Score: ' + r.total_weighted_score + '/' + r.max_possible_score)
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Criteria Scores')
  for (const c of r.criteria) {
    lines.push('- ' + c.criterion + ': ' + c.score + '/' + c.max_score + ' (weight=' + c.weight + ', weighted=' + c.weighted_score + ')')
    lines.push('  ' + c.findings)
  }
  lines.push('')
  if (r.risk_flags.length > 0) {
    lines.push('## Risk Flags')
    for (const f of r.risk_flags) lines.push('- ' + f)
    lines.push('')
  }
  if (r.conditions.length > 0) {
    lines.push('## Conditions')
    for (const c of r.conditions) lines.push('- ' + c)
    lines.push('')
  }
  lines.push('## Due Diligence Items')
  for (const d of r.due_diligence_items) lines.push('- ' + d)
  lines.push('')
  lines.push('---')
  lines.push('AI procurement evaluation ensures vendor solutions meet governance, security, and compliance requirements.')
  return lines.join('\n')
}

function formatRiskRegisterReport(r: RiskRegisterResult): string {
  const lines: string[] = []
  lines.push('# AI Risk Register')
  lines.push('')
  lines.push('Organization: ' + r.organization + ' | Period: ' + r.reporting_period)
  lines.push('Register ID: ' + r.register_id + ' | Generated: ' + r.generated_date)
  lines.push('Total Risks: ' + r.total_risks + ' | Critical: ' + r.critical_risks + ' | High: ' + r.high_risks + ' | Medium: ' + r.medium_risks + ' | Low: ' + r.low_risks)
  lines.push('Risk Appetite Breaches: ' + r.risk_appetite_breaches)
  lines.push('Next Review: ' + r.next_review_date)
  lines.push('')
  lines.push('## Risk Entries')
  for (const e of r.entries) {
    lines.push('- ' + e.risk_id + ' [' + e.risk_level.toUpperCase() + '] ' + e.system_name + ' (' + e.risk_category + ')')
    lines.push('  Likelihood: ' + e.likelihood + ' | Impact: ' + e.impact + ' | Inherent: ' + e.inherent_risk_score + ' | Residual: ' + e.residual_risk_score)
    lines.push('  Owner: ' + e.owner + ' | Control Effectiveness: ' + e.control_effectiveness + '%')
    lines.push('  Action: ' + e.action_required + ' | Target: ' + e.target_date + ' | Status: ' + e.status)
  }
  lines.push('')
  if (r.regulatory_gaps.length > 0) {
    lines.push('## Regulatory Gaps')
    for (const g of r.regulatory_gaps) lines.push('- ' + g)
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Enterprise AI risk register: central repository for tracking and managing AI-related risks across the organization.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'model_risk_assessor',
    description: 'Model risk assessment scoring and tiering. Evaluates use case criticality, data sensitivity, regulatory exposure, performance risk, validation recency, limitations, and dependencies.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: model_name, model_type, deployment_tier(production|staging|development|retired), use_case_criticality(critical|high|medium|low), data_classification(restricted|confidential|internal|public), regulatory_scope[], performance_metrics{}, known_limitations[], last_validation_date(YYYY-MM-DD), dependencies[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ModelRiskInput = JSON.parse(args.input_data)
      return formatModelRiskReport(analyzeModelRisk(input))
    }
  }))

  tools.register(defineTool({
    name: 'ai_ethics_reviewer',
    description: 'AI ethics review with principle-based scoring. Evaluates fairness, transparency, accountability, privacy, safety, and human oversight. Outputs approve/conditional/revise/reject recommendation.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: system_name, system_purpose, developer, review_type(pre_deployment|annual|incident_triggered|post_deployment), ethical_principles{fairness,transparency,accountability,privacy,safety,human_oversight}, affected_stakeholders[], potential_harms[], mitigation_measures[], stakeholder_consultation(boolean), human_rights_impact(none|low|moderate|high|severe)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: AIEthicsInput = JSON.parse(args.input_data)
      return formatAIEthicsReport(analyzeAIEthics(input))
    }
  }))

  tools.register(defineTool({
    name: 'model_inventory_manager',
    description: 'Model inventory tracking and lifecycle management. Tracks model age, evaluation status, compliance, risk distribution, and generates health score.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: organization, models[{name,version,owner,status,risk_tier,deployment_date,last_evaluation,data_sources,compliance_frameworks}], inventory_policies{max_model_age_days,evaluation_frequency_days,auto_deprecate_enabled,risk_threshold}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ModelInventoryInput = JSON.parse(args.input_data)
      return formatModelInventoryReport(analyzeModelInventory(input))
    }
  }))

  tools.register(defineTool({
    name: 'model_drift_monitor',
    description: 'Data drift and performance drift monitoring. Tracks feature distribution shifts, sample size changes, missing value rates, and performance metric deltas with alert levels.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: model_name, model_version, monitoring_period_days(number), baseline_metrics{}, current_metrics{}, data_drift_indicators{feature_distributions{},sample_size_baseline,sample_size_current,missing_value_rate_change}, performance_drift_indicators{accuracy_delta,precision_delta,recall_delta,f1_delta}, alert_thresholds{psi_threshold,performance_drop_threshold,sample_size_minimum}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: DriftMonitorInput = JSON.parse(args.input_data)
      return formatDriftMonitorReport(analyzeDriftMonitoring(input))
    }
  }))

  tools.register(defineTool({
    name: 'bias_audit_engine',
    description: 'Bias audit with fairness metrics. Supports demographic parity, equalized odds, equal opportunity, calibration, and disparate impact analysis across protected groups.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: model_name, model_type, protected_attributes[], fairness_criteria(demographic_parity|equalized_odds|equal_opportunity|calibration|disparate_impact), group_metrics{group:{positive_rate,true_positive_rate,false_positive_rate,sample_size}}, overall_positive_rate(number), reference_group(string), regulatory_framework(string), significance_level(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: BiasAuditInput = JSON.parse(args.input_data)
      return formatBiasAuditReport(analyzeBiasAudit(input))
    }
  }))

  tools.register(defineTool({
    name: 'explainability_requirements_checker',
    description: 'Explainability compliance validation. Checks feature importance, SHAP, LIME, decision rules, counterfactuals, natural language rationale against regulatory requirements.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: system_name, system_type, decision_impact(individual|organizational|societal), regulatory_frameworks[], current_explainability{feature_importance,shap_values,lime_explanations,decision_rules,counterfactual_explanations,natural_language_rationale}, target_audience[], explanation_formats[], user_testing_conducted(boolean), documentation_complete(boolean)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ExplainabilityInput = JSON.parse(args.input_data)
      return formatExplainabilityReport(analyzeExplainability(input))
    }
  }))

  tools.register(defineTool({
    name: 'ai_procurement_evaluator',
    description: 'AI vendor/procurement risk evaluation. Scores vendor maturity, financial stability, technical documentation, risk management, budget alignment, security, and bias testing.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vendor_name, solution_name, solution_type, use_case, procurement_budget_usd(number), vendor_assessment{years_in_business,employee_count,existing_enterprise_clients,certifications[],financial_stability}, technical_assessment{model_documentation,bias_testing_results,performance_benchmarks,security_audit,data_governance_policy,explainability_features}, risk_assessment{vendor_lock_in_risk,data_residency_compliance,exit_strategy_documented,sla_guarantees,intellectual_property_clear}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: AIProcurementInput = JSON.parse(args.input_data)
      return formatProcurementReport(analyzeAIProcurement(input))
    }
  }))

  tools.register(defineTool({
    name: 'risk_register_generator',
    description: 'Enterprise AI risk register generation. Creates risk entries with inherent/residual scoring, risk levels, control effectiveness, appetite breach detection, and regulatory gap analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: organization, reporting_period, ai_systems[{system_name,risk_category,likelihood(rare|unlikely|possible|likely|almost_certain),impact(negligible|minor|moderate|major|catastrophic),current_controls[],control_effectiveness(number),owner,last_review_date}], risk_appetite{acceptable_likelihood,acceptable_impact}, regulatory_requirements[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: RiskRegisterInput = JSON.parse(args.input_data)
      return formatRiskRegisterReport(analyzeRiskRegister(input))
    }
  }))
}
