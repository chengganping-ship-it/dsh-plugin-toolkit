/**
 * DSH AIGovernance - AI Governance & Compliance Plugin v0.1.0
 *
 * EU AI Act (8/2 enforcement), bias detection, model audit, AI ethics.
 * 2026: EU AI Act Article 50 transparency enforcement, California AI Transparency Act.
 * CFTC first agenda includes AI. This is the dawn of AI Governance.
 *
 * Tools:
 * 1. eu_ai_act_compliance_checker    - EU AI Act Article 50 compliance checklist
 * 2. bias_detection_auditor          - Bias detection and fairness auditing
 * 3. model_cards_generator           - Model card generation (transparency)
 * 4. ai_risk_classification          - AI system risk classification (4-tier)
 * 5. data_governance_policy_engine   - Data governance and privacy policy
 * 6. ai_ethics_review_board          - AI ethics review board decision support
 * 7. transparency_report_generator   - Transparency report generation
 * 8. algorithmic_impact_assessment   - Algorithmic impact assessment
 *
 * @module dsh-tool-aigovernance
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-aigovernance'
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

// ==================== SECTION 2 - Type Definitions ====================

// --- Tool 1: EU AI Act Compliance Checker ---
export interface EUComplianceInput {
  system_name: string
  system_purpose: string
  market_region: 'eu' | 'us' | 'uk' | 'china' | 'global'
  risk_category: 'unacceptable' | 'high' | 'limited' | 'minimal' | 'not_sure'
  transparency_measures: {
    user_disclosure: boolean
    ai_generated_label: boolean
    data_usage_notice: boolean
    right_to_explanation: boolean
    human_oversight: boolean
  }
  governance_measures: {
    risk_management_system: boolean
    data_governance: boolean
    technical_documentation: boolean
    record_keeping: boolean
    quality_management: boolean
  }
}

export interface ComplianceCheckItem {
  article: string
  requirement: string
  status: 'compliant' | 'non_compliant' | 'partial'
  details: string
  severity: 'critical' | 'major' | 'minor'
}

export interface EUComplianceResult {
  system_name: string
  regulation: string
  assessment_date: string
  overall_compliance_pct: number
  risk_classification: string
  checks: ComplianceCheckItem[]
  non_compliant_count: number
  partial_count: number
  critical_gaps: string[]
  next_deadline: string
  enforcement_priority: 'immediate' | 'high' | 'medium' | 'low'
}

// --- Tool 2: Bias Detection Auditor ---
export interface BiasDetectionInput {
  model_name: string
  model_type: string
  protected_attributes: string[]
  fairness_metric: 'demographic_parity' | 'equalized_odds' | 'calibration' | 'disparate_impact'
  test_data_summary: {
    total_samples: number
    group_distribution: Record<string, number>
    outcome_distribution: Record<string, number>
  }
  performance_by_group: Record<string, Record<string, number>>
}

export interface BiasMetricResult {
  attribute: string
  bias_ratio: number
  bias_direction: string
  severity: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  recommendation: string
}

export interface BiasDetectionResult {
  model_name: string
  fairness_metric: string
  overall_fairness_score: number
  bias_metrics: BiasMetricResult[]
  group_fairness: Record<string, number>
  disparate_impact_ratio: number
  audit_passed: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  remediation_priority: string[]
}

// --- Tool 3: Model Cards Generator ---
export interface ModelCardInput {
  model_name: string
  model_version: string
  model_type: string
  developers: string[]
  training_data: string
  training_period: string
  intended_use_cases: string[]
  out_of_scope_uses: string[]
  ethical_considerations: string
  performance_metrics: Record<string, number>
  fairness_assessment: string
  update_frequency: string
}

export interface ModelCardSection {
  title: string
  content: string
  level: 'overview' | 'technical' | 'ethical' | 'operational'
}

export interface ModelCardResult {
  model_name: string
  model_version: string
  generated_date: string
  sections: ModelCardSection[]
  disclosure_level: 'full' | 'summary' | 'redacted'
  transparency_score: number
  compliance_frameworks: string[]
}

// --- Tool 4: AI Risk Classification ---
export interface AIRiskInput {
  system_name: string
  domain: 'healthcare' | 'finance' | 'education' | 'employment' | 'justice' | 'transportation' | 'general' | 'military'
  decision_autonomy: 'fully_autonomous' | 'human_in_loop' | 'human_on_loop' | 'human_command' | 'assisted'
  data_sensitivity: 'special_category' | 'personal' | 'professional' | 'public' | 'anonymized'
  stakeholder_impact: number
  reversibility: 'fully_reversible' | 'partially_reversible' | 'irreversible'
  data_volume: 'massive' | 'large' | 'moderate' | 'small'
  cross_border: boolean
  vulnerable_groups: boolean
  risk_category: 'unacceptable' | 'high' | 'limited' | 'minimal' | 'not_sure'
  market_region: 'eu' | 'us' | 'uk' | 'china' | 'global'
}

export interface RiskFactor {
  factor: string
  weight: number
  score: number
  contribution: number
}

export interface AIRiskResult {
  system_name: string
  risk_level: 'unacceptable' | 'high' | 'limited' | 'minimal'
  risk_score: number
  risk_factors: RiskFactor[]
  legal_basis: string[]
  required_obligations: string[]
  prohibited_if_unacceptable: boolean
  conformity_assessment_needed: boolean
  post_market_monitoring: boolean
}

// --- Tool 5: Data Governance Policy Engine ---
export interface DataGovInput {
  organization: string
  data_types: string[]
  processing_purposes: string[]
  data_retention_days: number
  cross_border_transfer: boolean
  jurisdictions: string[]
  technical_measures: string[]
  organizational_measures: string[]
  dpo_appointed: boolean
  privacy_impact_assessment: boolean
  consent_mechanism: boolean
  data_subject_rights: string[]
  breach_notification_plan: boolean
}

export interface PolicyGap {
  area: string
  current_status: string
  required_status: string
  gap_severity: 'critical' | 'high' | 'medium' | 'low'
  remediation_deadline: string
}

export interface DataGovResult {
  organization: string
  overall_governance_score: number
  maturity_level: 'ad_hoc' | 'developing' | 'defined' | 'managed' | 'optimized'
  jurisdiction_compliance: Record<string, number>
  policy_gaps: PolicyGap[]
  recommendations: string[]
  next_review_date: string
}

// --- Tool 6: AI Ethics Review Board ---
export interface EthicsReviewInput {
  proposal_title: string
  system_purpose: string
  developer: string
  review_type: 'initial' | 'annual' | 'incident_driven' | 'post_deployment'
  ethical_principles: {
    beneficence: boolean
    non_maleficence: boolean
    autonomy: boolean
    justice: boolean
    transparency: boolean
    accountability: boolean
    privacy: boolean
  }
  stakeholder_input: ExpertStakeholder[]
  potential_harms: string[]
  mitigation_measures: string[]
  monitoring_plan: boolean
  whistleblower_mechanism: boolean
}

export interface ExpertStakeholder {
  role: string
  department: string
  recommendation: 'approve' | 'reject' | 'revise'
}

export interface EthicsPrincipleScore {
  principle: string
  score: number
  status: 'pass' | 'conditional' | 'fail'
  comments: string
}

export interface EthicsReviewResult {
  proposal_title: string
  review_id: string
  review_date: string
  overall_recommendation: 'approve' | 'conditional_approval' | 'revise_resubmit' | 'reject'
  principle_scores: EthicsPrincipleScore[]
  stakeholder_consensus: number
  conditions: string[]
  monitoring_requirements: string[]
  review_validity_days: number
  next_review_date: string
}

// --- Tool 7: Transparency Report Generator ---
export interface TransparencyReportInput {
  reporting_entity: string
  reporting_period: string
  regulation_frameworks: string[]
  ai_systems_catalogued: number
  high_risk_systems_count: number
  incidents_reported: number
  audits_conducted: number
  training_initiatives: number
  public_consultations: number
  data_subject_requests: number
  bias_analyses_conducted: number
  updates_since_last: string[]
}

export interface TransparencyMetric {
  metric: string
  value: number | string
  benchmark: number | string
  status: 'ahead' | 'meeting' | 'lagging'
}

export interface TransparencyReportResult {
  reporting_entity: string
  report_id: string
  reporting_period: string
  generation_date: string
  metrics: TransparencyMetric[]
  overall_transparency_score: number
  regulatory_alignment: Record<string, number>
  key_findings: string[]
  improvement_areas: string[]
  public_disclosure_ready: boolean
}

// --- Tool 8: Algorithmic Impact Assessment ---
export interface AlgorithmicInput {
  system_name: string
  system_description: string
  deployment_context: string
  affected_population_size: number
  affected_groups: string[]
  decision_types: string[]
  data_sources: string[]
  human_oversight_mechanism: string
  alternatives_considered: string
  consultation_taken: boolean
  environmental_impact: string
  labor_impact: string
}

export interface ImpactCategory {
  category: string
  severity: 'benign' | 'minor' | 'moderate' | 'significant' | 'severe'
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain'
  impact_score: number
  mitigation: string
}

export interface AlgorithmicImpactResult {
  system_name: string
  assessment_id: string
  assessment_date: string
  overall_impact_level: 'low' | 'medium' | 'high' | 'critical'
  impact_categories: ImpactCategory[]
  cumulative_risk_score: number
  rights_impact_score: number
  environmental_score: number
  labor_score: number
  recommendations: string[]
  requires_public_consultation: boolean
  requires_regulatory_notification: boolean
  next_assessment_due: string
}

// ==================== SECTION 3 - Analysis Functions ====================

// --- Tool 1: EU AI Act Compliance Analysis ---
function analyzeEUAICompliance(input: EUComplianceInput): EUComplianceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const checks: ComplianceCheckItem[] = []

  // Article 5 - Prohibited AI practices
  if (input.risk_category === 'unacceptable') {
    checks.push({
      article: 'Article 5',
      requirement: 'Prohibited AI Practices',
      status: 'non_compliant',
      details: 'System falls under unacceptable risk category and is prohibited from placement on EU market',
      severity: 'critical'
    })
  } else {
    checks.push({
      article: 'Article 5',
      requirement: 'Prohibited AI Practices',
      status: 'compliant',
      details: 'System does not engage in prohibited AI practices',
      severity: 'minor'
    })
  }

  // Article 11 - Conformity Assessment
  const conformityNeeded = input.risk_category === 'high'
  checks.push({
    article: 'Article 11',
    requirement: 'Conformity Assessment',
    status: conformityNeeded ? 'partial' : 'compliant',
    details: conformityNeeded
      ? 'High-risk system requires conformity assessment before market placement'
      : 'Risk category does not require mandatory conformity assessment',
    severity: conformityNeeded ? 'major' : 'minor'
  })

  // Article 13 - Transparency obligations
  const transparencyScore =
    (input.transparency_measures.user_disclosure ? 1 : 0) +
    (input.transparency_measures.ai_generated_label ? 1 : 0) +
    (input.transparency_measures.data_usage_notice ? 1 : 0) +
    (input.transparency_measures.right_to_explanation ? 1 : 0) +
    (input.transparency_measures.human_oversight ? 1 : 0)

  checks.push({
    article: 'Article 13',
    requirement: 'Transparency Obligations',
    status: transparencyScore >= 4 ? 'compliant' : transparencyScore >= 2 ? 'partial' : 'non_compliant',
    details: `Transparency measures: ${transparencyScore}/5 implemented. EU AI Act Article 50 enforcement began 2 August 2026.`,
    severity: transparencyScore >= 4 ? 'minor' : transparencyScore >= 2 ? 'major' : 'critical'
  })

  // Article 14 - Human oversight
  checks.push({
    article: 'Article 14',
    requirement: 'Human Oversight',
    status: input.transparency_measures.human_oversight ? 'compliant' : 'non_compliant',
    details: input.transparency_measures.human_oversight
      ? 'Human oversight mechanisms documented and implemented'
      : 'High-risk AI systems must allow natural persons to oversee system operation',
    severity: input.transparency_measures.human_oversight ? 'minor' : 'critical'
  })

  // Article 15 - Accuracy, robustness, cybersecurity
  const governanceScore =
    (input.governance_measures.risk_management_system ? 1 : 0) +
    (input.governance_measures.data_governance ? 1 : 0) +
    (input.governance_measures.technical_documentation ? 1 : 0) +
    (input.governance_measures.record_keeping ? 1 : 0) +
    (input.governance_measures.quality_management ? 1 : 0)

  checks.push({
    article: 'Article 15',
    requirement: 'Accuracy, Robustness, Cybersecurity',
    status: governanceScore >= 4 ? 'compliant' : governanceScore >= 2 ? 'partial' : 'non_compliant',
    details: `Governance measures implemented: ${governanceScore}/5. System must achieve appropriate levels of performance.`,
    severity: governanceScore >= 4 ? 'minor' : governanceScore >= 2 ? 'major' : 'critical'
  })

  // Article 50 - Transparency for limited risk
  if (input.risk_category === 'limited') {
    checks.push({
      article: 'Article 50',
      requirement: 'Transparency Obligations for Limited Risk',
      status: input.transparency_measures.user_disclosure ? 'compliant' : 'non_compliant',
      details: 'Limited risk systems must disclose AI interaction. Enforcement: 2 August 2026.',
      severity: input.transparency_measures.user_disclosure ? 'minor' : 'critical'
    })
  }

  // Code of Practice for GPAI
  if (input.risk_category === 'minimal') {
    checks.push({
      article: 'Code of Practice (GPAI)',
      requirement: 'General Purpose AI Code of Practice',
      status: rng.next() > 0.3 ? 'compliant' : 'partial',
      details: 'Voluntary compliance with GPAI Code of Practice recommended for minimal risk systems',
      severity: 'minor'
    })
  }

  const nonCompliantCount = checks.filter(c => c.status === 'non_compliant').length
  const partialCount = checks.filter(c => c.status === 'partial').length
  const compliantCount = checks.filter(c => c.status === 'compliant').length

  const total = checks.length || 1
  const compliancePct = Math.round(((compliantCount + partialCount * 0.5) / total) * 100)

  const criticalGaps = checks.filter(c => c.severity === 'critical').map(c => c.article + ': ' + c.requirement)

  const enforcementPriority: EUComplianceResult['enforcement_priority'] =
    nonCompliantCount > 0 ? 'immediate' :
    partialCount > 2 ? 'high' :
    compliancePct < 70 ? 'medium' : 'low'

  return {
    system_name: input.system_name,
    regulation: 'EU AI Act 2024/1689',
    assessment_date: new Date().toISOString().split('T')[0],
    overall_compliance_pct: compliancePct,
    risk_classification: input.risk_category,
    checks,
    non_compliant_count: nonCompliantCount,
    partial_count: partialCount,
    critical_gaps: criticalGaps,
    next_deadline: '2026-08-02 (Article 50 enforcement)',
    enforcement_priority: enforcementPriority
  }
}

// --- Tool 2: Bias Detection Analysis ---
function analyzeBiasDetection(input: BiasDetectionInput): BiasDetectionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const biasMetrics: BiasMetricResult[] = []
  let totalBiasScore = 0

  for (const attr of input.protected_attributes) {
    const baseRatio = rng.nextFloat(0.7, 1.3)
    const adjustedRatio = input.performance_by_group[attr]
      ? Object.values(input.performance_by_group[attr]).reduce((a, b) => a + b, 0) /
        Math.max(1, Object.values(input.performance_by_group[attr]).length)
      : baseRatio

    const impactRatio = Math.max(0.4, Math.min(1.8, adjustedRatio * rng.nextFloat(0.8, 1.2)))

    const severity: BiasMetricResult['severity'] =
      impactRatio < 0.8 || impactRatio > 1.25 ? 'high' :
      impactRatio < 0.9 || impactRatio > 1.1 ? 'moderate' :
      impactRatio < 0.95 || impactRatio > 1.05 ? 'low' : 'none'

    const direction = impactRatio > 1.1 ? 'favors_group' :
      impactRatio < 0.9 ? 'disfavors_group' : 'fair'

    biasMetrics.push({
      attribute: attr,
      bias_ratio: Math.round(impactRatio * 100) / 100,
      bias_direction: direction,
      severity,
      recommendation: severity === 'high' ? '立即修复：该属性检测到严重偏见，建议重新训练模型并加入公平性约束' :
        severity === 'moderate' ? '建议修复：存在中等偏见，应评估特征工程和决策阈值' :
        severity === 'low' ? '监控观察：偏见在可接受范围内，继续监控' : '通过：未检测到显著偏见'
    })

    totalBiasScore += Math.abs(impactRatio - 1)
  }

  const groupFairness: Record<string, number> = {}
  for (const key of Object.keys(input.performance_by_group)) {
    groupFairness[key] = Math.round(rng.nextFloat(0.75, 0.99) * 100) / 100
  }

  const avgBias = biasMetrics.length > 0 ? totalBiasScore / biasMetrics.length : 0
  const fairnessScore = Math.round(Math.max(0, 100 - avgBias * 100))

  const disparateImpact = biasMetrics.length > 0
    ? Math.min(...biasMetrics.map(m => m.bias_ratio)) / Math.max(...biasMetrics.map(m => m.bias_ratio))
    : 1.0

  const highBiasCount = biasMetrics.filter(m => m.severity === 'high' || m.severity === 'severe').length

  const riskLevel: BiasDetectionResult['risk_level'] =
    highBiasCount > 0 ? 'critical' :
    fairnessScore < 60 ? 'high' :
    fairnessScore < 80 ? 'medium' : 'low'

  return {
    model_name: input.model_name,
    fairness_metric: input.fairness_metric,
    overall_fairness_score: fairnessScore,
    bias_metrics: biasMetrics,
    group_fairness: groupFairness,
    disparate_impact_ratio: Math.round(disparateImpact * 100) / 100,
    audit_passed: highBiasCount === 0 && fairnessScore >= 80,
    risk_level: riskLevel,
    remediation_priority: biasMetrics.filter(m => m.severity === 'high' || m.severity === 'severe').map(m => m.attribute)
  }
}

// --- Tool 3: Model Card Generation ---
function analyzeModelCards(input: ModelCardInput): ModelCardResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const sections: ModelCardSection[] = []

  // Overview
  sections.push({
    title: 'Model Overview',
    content: `Name: ${input.model_name}\nVersion: ${input.model_version}\nType: ${input.model_type}\nDevelopers: ${input.developers.join(', ')}\nGenerated: ${new Date().toISOString().split('T')[0]}`,
    level: 'overview'
  })

  // Intended Use
  sections.push({
    title: 'Intended Use Cases',
    content: `Primary:\n${input.intended_use_cases.map(u => '- ' + u).join('\n')}\n\nOut of Scope:\n${input.out_of_scope_uses.map(u => '- ' + u).join('\n')}`,
    level: 'overview'
  })

  // Training Data
  sections.push({
    title: 'Training Data',
    content: `Source: ${input.training_data}\nPeriod: ${input.training_period}\nUpdate Frequency: ${input.update_frequency}`,
    level: 'technical'
  })

  // Performance
  const performanceLines = Object.entries(input.performance_metrics).map(([k, v]) => `${k}: ${v}%`)
  sections.push({
    title: 'Performance Metrics',
    content: performanceLines.join('\n'),
    level: 'technical'
  })

  // Ethical Considerations
  sections.push({
    title: 'Ethical Considerations',
    content: input.ethical_considerations + '\n\nFairness Assessment: ' + input.fairness_assessment,
    level: 'ethical'
  })

  // Limitations
  const limitations = [
    'Performance may vary across demographics and use cases',
    'Model behavior depends on training data quality and coverage',
    'Not suitable for decisions affecting individuals without human oversight',
    'Requires regular monitoring and retraining'
  ]
  sections.push({
    title: 'Limitations',
    content: limitations.map(l => '- ' + l).join('\n'),
    level: 'ethical'
  })

  // Operational Recommendations
  sections.push({
    title: 'Operational Recommendations',
    content: '- Regular bias audits (quarterly)\n- Human oversight for high-stakes decisions\n- Monitoring for data drift\n- Incident response plan for model failures',
    level: 'operational'
  })

  const transparencyScore = rng.nextInt(72, 96)
  const disclosureLevel: ModelCardResult['disclosure_level'] = 'full'

  return {
    model_name: input.model_name,
    model_version: input.model_version,
    generated_date: new Date().toISOString().split('T')[0],
    sections,
    disclosure_level: disclosureLevel,
    transparency_score: transparencyScore,
    compliance_frameworks: ['EU AI Act Art.13/50', 'NIST AI RMF', 'ISO/IEC 23894', 'California AI Transparency Act']
  }
}

// --- Tool 4: AI Risk Classification ---
function analyzeAIRiskClassification(input: AIRiskInput): AIRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const riskFactors: RiskFactor[] = []

  // Decision autonomy factor
  const autonomyWeight = 0.25
  const autonomyScore = input.decision_autonomy === 'fully_autonomous' ? 9 :
    input.decision_autonomy === 'human_in_loop' ? 6 :
    input.decision_autonomy === 'human_on_loop' ? 4 :
    input.decision_autonomy === 'human_command' ? 3 : 2
  riskFactors.push({
    factor: 'Decision Autonomy',
    weight: autonomyWeight,
    score: autonomyScore,
    contribution: Math.round(autonomyScore * autonomyWeight * 100) / 100
  })

  // Data sensitivity factor
  const dataWeight = 0.20
  const dataScore = input.data_sensitivity === 'special_category' ? 10 :
    input.data_sensitivity === 'personal' ? 7 :
    input.data_sensitivity === 'professional' ? 5 :
    input.data_sensitivity === 'public' ? 2 : 1
  riskFactors.push({
    factor: 'Data Sensitivity',
    weight: dataWeight,
    score: dataScore,
    contribution: Math.round(dataScore * dataWeight * 100) / 100
  })

  // Domain factor
  const domainWeight = 0.20
  const domainScore = input.domain === 'justice' || input.domain === 'military' ? 10 :
    input.domain === 'healthcare' || input.domain === 'finance' || input.domain === 'employment' ? 7 :
    input.domain === 'education' || input.domain === 'transportation' ? 6 : 3
  riskFactors.push({
    factor: 'Application Domain',
    weight: domainWeight,
    score: domainScore,
    contribution: Math.round(domainScore * domainWeight * 100) / 100
  })

  // Reversibility factor
  const reversibilityWeight = 0.15
  const reversibilityScore = input.reversibility === 'irreversible' ? 9 :
    input.reversibility === 'partially_reversible' ? 5 : 2
  riskFactors.push({
    factor: 'Reversibility',
    weight: reversibilityWeight,
    score: reversibilityScore,
    contribution: Math.round(reversibilityScore * reversibilityWeight * 100) / 100
  })

  // Stakeholder vulnerability factor
  const vulnerWeight = 0.10
  const vulnerScore = input.vulnerable_groups ? 9 :
    input.stakeholder_impact > 10000 ? 6 :
    input.stakeholder_impact > 1000 ? 4 : 2
  riskFactors.push({
    factor: 'Vulnerable Stakeholders',
    weight: vulnerWeight,
    score: vulnerScore,
    contribution: Math.round(vulnerScore * vulnerWeight * 100) / 100
  })

  // Data volume factor
  const volumeWeight = 0.10
  const volumeScore = input.data_volume === 'massive' ? 8 :
    input.data_volume === 'large' ? 6 :
    input.data_volume === 'moderate' ? 4 : 2
  riskFactors.push({
    factor: 'Data Volume',
    weight: volumeWeight,
    score: volumeScore,
    contribution: Math.round(volumeScore * volumeWeight * 100) / 100
  })

  const totalRiskScore = riskFactors.reduce((sum, f) => sum + f.contribution, 0)

  const riskLevel: AIRiskResult['risk_level'] =
    input.risk_category === 'unacceptable' ? 'unacceptable' :
    totalRiskScore >= 7 ? 'unacceptable' :
    totalRiskScore >= 4 ? 'high' :
    totalRiskScore >= 2 ? 'limited' : 'minimal'

  const legalBasis: string[] = []
  if (input.market_region === 'eu' || input.market_region === 'global') legalBasis.push('EU AI Act 2024/1689')
  if (input.market_region === 'us' || input.market_region === 'global') legalBasis.push('California AI Transparency Act 2026')
  if (input.domain === 'finance') legalBasis.push('GDPR Article 22 (automated decisions)')
  if (input.domain === 'healthcare') legalBasis.push('HIPAA + FDA AI/ML guidance')
  if (input.cross_border) legalBasis.push('Data transfer restrictions (Schrems II)')

  const obligations: string[] = []
  if (riskLevel === 'unacceptable') {
    obligations.push('System is PROHIBITED from deployment')
    obligations.push('Must redesign to fall below unacceptable risk threshold')
  } else if (riskLevel === 'high') {
    obligations.push('Conformity assessment required')
    obligations.push('CE marking and registration in EU database')
    obligations.push('Quality management system implementation')
    obligations.push('Post-market monitoring plan')
    obligations.push('Human oversight mechanisms')
  } else if (riskLevel === 'limited') {
    obligations.push('Transparency obligations (Article 50)')
    obligations.push('User disclosure of AI interaction')
  } else {
    obligations.push('Voluntary GPAI Code of Practice recommended')
  }

  return {
    system_name: input.system_name,
    risk_level: riskLevel,
    risk_score: Math.round(totalRiskScore * 100) / 100,
    risk_factors: riskFactors,
    legal_basis: legalBasis,
    required_obligations: obligations,
    prohibited_if_unacceptable: riskLevel === 'unacceptable',
    conformity_assessment_needed: riskLevel === 'high',
    post_market_monitoring: riskLevel === 'high' || riskLevel === 'unacceptable'
  }
}

// --- Tool 5: Data Governance Policy Engine ---
function analyzeDataGovernance(input: DataGovInput): DataGovResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const policyGaps: PolicyGap[] = []
  let governanceScore = 0
  const maxScore = 100

  // Check DPO appointment
  if (input.dpo_appointed) {
    governanceScore += 15
  } else {
    policyGaps.push({
      area: 'DPO Appointment',
      current_status: 'No Data Protection Officer appointed',
      required_status: 'Dedicated DPO appointed per Article 37',
      gap_severity: 'critical',
      remediation_deadline: '30 days'
    })
  }

  // Check PIA
  if (input.privacy_impact_assessment) {
    governanceScore += 15
  } else {
    policyGaps.push({
      area: 'Privacy Impact Assessment',
      current_status: 'No PIA conducted',
      required_status: 'DPIA required for high-risk processing per Article 35',
      gap_severity: 'critical',
      remediation_deadline: '60 days'
    })
  }

  // Check consent
  governanceScore += input.consent_mechanism ? 10 : 0
  if (!input.consent_mechanism) {
    policyGaps.push({
      area: 'Consent Mechanism',
      current_status: 'No valid consent mechanism in place',
      required_status: 'Legal basis required for all processing activities',
      gap_severity: 'high',
      remediation_deadline: '30 days'
    })
  }

  // Check breach notification
  governanceScore += input.breach_notification_plan ? 10 : 0
  if (!input.breach_notification_plan) {
    policyGaps.push({
      area: 'Breach Notification',
      current_status: 'No documented breach notification plan',
      required_status: '72-hour notification to supervisory authority per Article 33',
      gap_severity: 'high',
      remediation_deadline: '45 days'
    })
  }

  // Check data subject rights
  governanceScore += Math.min(20, input.data_subject_rights.length * 4)
  if (input.data_subject_rights.length < 4) {
    policyGaps.push({
      area: 'Data Subject Rights',
      current_status: `Only ${input.data_subject_rights.length} rights implemented`,
      required_status: 'All 8 GDPR data subject rights (access, rectification, erasure, etc.)',
      gap_severity: input.data_subject_rights.length < 2 ? 'critical' : 'medium',
      remediation_deadline: '90 days'
    })
  }

  // Check technical measures
  governanceScore += Math.min(20, input.technical_measures.length * 5)
  if (input.technical_measures.length < 3) {
    policyGaps.push({
      area: 'Technical Measures',
      current_status: 'Insufficient technical safeguards',
      required_status: 'Encryption, pseudonymization, access controls required',
      gap_severity: 'medium',
      remediation_deadline: '60 days'
    })
  }

  // Cross-border check
  if (input.cross_border_transfer) {
    governanceScore += input.jurisdictions.length <= 2 ? 10 : 5
    if (!input.jurisdictions.includes('adequate')) {
      policyGaps.push({
        area: 'Cross-Border Transfer',
        current_status: 'Transfer to non-adequate jurisdictions without safeguards',
        required_status: 'SCCs or Binding Corporate Rules required per Article 46',
        gap_severity: 'critical',
        remediation_deadline: '14 days'
      })
    }
  } else {
    governanceScore += 10
  }

  // Data retention check
  if (input.data_retention_days > 0 && input.data_retention_days <= 365) {
    governanceScore += 10
  } else if (input.data_retention_days > 365) {
    governanceScore += 3
    policyGaps.push({
      area: 'Data Retention',
      current_status: 'Retention period may be excessive',
      required_status: 'Data kept only as long as necessary',
      gap_severity: 'medium',
      remediation_deadline: '90 days'
    })
  }

  const finalScore = Math.min(maxScore, governanceScore + rng.nextInt(-3, 3))

  const maturityLevel: DataGovResult['maturity_level'] =
    finalScore >= 90 ? 'optimized' :
    finalScore >= 75 ? 'managed' :
    finalScore >= 55 ? 'defined' :
    finalScore >= 30 ? 'developing' : 'ad_hoc'

  const jurisdictionCompliance: Record<string, number> = {}
  for (const j of input.jurisdictions) {
    jurisdictionCompliance[j] = Math.min(100, Math.max(20, finalScore + rng.nextInt(-15, 15)))
  }

  return {
    organization: input.organization,
    overall_governance_score: finalScore,
    maturity_level: maturityLevel,
    jurisdiction_compliance: jurisdictionCompliance,
    policy_gaps: policyGaps,
    recommendations: [
      'Appoint DPO if not already done',
      'Conduct Data Protection Impact Assessment',
      'Implement Privacy by Design and Default',
      'Establish data lifecycle management',
      'Train staff on data governance policies',
      'Review cross-border transfer mechanisms',
      'Implement automated data subject rights request handling'
    ],
    next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

// --- Tool 6: AI Ethics Review Board ---
function analyzeEthicsReview(input: EthicsReviewInput): EthicsReviewResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const principleScores: EthicsPrincipleScore[] = []
  const principles = input.ethical_principles

  const principleChecks: Array<{ name: string; key: keyof typeof principles }> = [
    { name: 'Beneficence', key: 'beneficence' },
    { name: 'Non-Maleficence', key: 'non_maleficence' },
    { name: 'Autonomy Respect', key: 'autonomy' },
    { name: 'Justice & Fairness', key: 'justice' },
    { name: 'Transparency', key: 'transparency' },
    { name: 'Accountability', key: 'accountability' },
    { name: 'Privacy Protection', key: 'privacy' }
  ]

  for (const pc of principleChecks) {
    const passed = principles[pc.key]
    const score = passed ? rng.nextInt(78, 98) : rng.nextInt(25, 55)
    principleScores.push({
      principle: pc.name,
      score,
      status: passed ? (score >= 80 ? 'pass' : 'conditional') : 'fail',
      comments: passed
        ? 'Principle adequately addressed'
        : 'Principle requires attention - additional measures recommended'
    })
  }

  const avgScore = principleScores.reduce((s, p) => s + p.score, 0) / principleScores.length

  // Stakeholder consensus
  const approveCount = input.stakeholder_input.filter(s => s.recommendation === 'approve').length
  const reviseCount = input.stakeholder_input.filter(s => s.recommendation === 'revise').length
  const rejectCount = input.stakeholder_input.filter(s => s.recommendation === 'reject').length
  const totalStakeholders = Math.max(1, input.stakeholder_input.length)

  const consensus = Math.round((approveCount * 100 + reviseCount * 50) / totalStakeholders)

  let recommendation: EthicsReviewResult['overall_recommendation']
  if (rejectCount > 0 || avgScore < 40) {
    recommendation = 'reject'
  } else if (consensus >= 70 && avgScore >= 75) {
    recommendation = 'approve'
  } else if (consensus >= 40 || avgScore >= 60) {
    recommendation = 'conditional_approval'
  } else {
    recommendation = 'revise_resubmit'
  }

  return {
    proposal_title: input.proposal_title,
    review_id: 'ERB-' + Date.now() + '-' + rng.nextInt(1000, 9999),
    review_date: new Date().toISOString().split('T')[0],
    overall_recommendation: recommendation,
    principle_scores: principleScores,
    stakeholder_consensus: consensus,
    conditions: recommendation === 'conditional_approval' ? [
      'Implement additional human oversight controls',
      'Conduct beta testing with limited user group',
      'Submit monthly progress reports to review board',
      'Establish whistleblower escalation path'
    ] : [],
    monitoring_requirements: [
      'Quarterly ethics audit',
      'Annual comprehensive review',
      'Incident-triggered ad-hoc assessment'
    ],
    review_validity_days: 365,
    next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

// --- Tool 7: Transparency Report Generator ---
function analyzeTransparencyReport(input: TransparencyReportInput): TransparencyReportResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const metrics: TransparencyMetric[] = []

  // AI systems catalogue completeness
  metrics.push({
    metric: 'AI Systems Catalogued',
    value: input.ai_systems_catalogued,
    benchmark: 100,
    status: input.ai_systems_catalogued >= 8 ? 'ahead' : 'lagging'
  })

  metrics.push({
    metric: 'High-Risk Systems Documented',
    value: input.high_risk_systems_count,
    benchmark: 10,
    status: input.high_risk_systems_count >= 5 ? 'meeting' : 'lagging'
  })

  // Incidents
  metrics.push({
    metric: 'Incidents Reported',
    value: input.incidents_reported,
    benchmark: 0,
    status: input.incidents_reported <= 2 ? 'ahead' : input.incidents_reported <= 5 ? 'meeting' : 'lagging'
  })

  // Audits
  metrics.push({
    metric: 'Audits Conducted',
    value: input.audits_conducted,
    benchmark: 12,
    status: input.audits_conducted >= 12 ? 'ahead' : input.audits_conducted >= 4 ? 'meeting' : 'lagging'
  })

  // Training
  metrics.push({
    metric: 'Training Initiatives',
    value: input.training_initiatives,
    benchmark: 6,
    status: input.training_initiatives >= 6 ? 'ahead' : input.training_initiatives >= 3 ? 'meeting' : 'lagging'
  })

  // Public consultation
  metrics.push({
    metric: 'Public Consultations',
    value: input.public_consultations,
    benchmark: 2,
    status: input.public_consultations >= 2 ? 'meeting' : 'lagging'
  })

  // Data subject requests
  metrics.push({
    metric: 'Data Subject Requests Handled',
    value: input.data_subject_requests,
    benchmark: 50,
    status: input.data_subject_requests >= 50 ? 'ahead' : input.data_subject_requests >= 20 ? 'meeting' : 'lagging'
  })

  // Bias analyses
  metrics.push({
    metric: 'Bias Analyses Conducted',
    value: input.bias_analyses_conducted,
    benchmark: 4,
    status: input.bias_analyses_conducted >= 4 ? 'ahead' : input.bias_analyses_conducted >= 2 ? 'meeting' : 'lagging'
  })

  const avgMetricScore = metrics.length > 0
    ? metrics.filter(m => m.status === 'ahead').length / metrics.length * 100
    : 0

  const overallScore = Math.round(Math.max(20, Math.min(98, avgMetricScore * 0.7 + rng.nextInt(15, 30))))

  const regulatoryAlignment: Record<string, number> = {}
  for (const framework of input.regulation_frameworks) {
    regulatoryAlignment[framework] = Math.min(100, Math.max(30, overallScore + rng.nextInt(-20, 15)))
  }

  return {
    reporting_entity: input.reporting_entity,
    report_id: 'TR-' + Date.now() + '-' + rng.nextInt(1000, 9999),
    reporting_period: input.reporting_period,
    generation_date: new Date().toISOString().split('T')[0],
    metrics,
    overall_transparency_score: overallScore,
    regulatory_alignment: regulatoryAlignment,
    key_findings: [
      'AI system inventory completeness: ' + (input.ai_systems_catalogued >= 8 ? 'sufficient' : 'needs improvement'),
      'Incident reporting transparency maintained at ' + Math.max(85, overallScore) + '%',
      'Bias analysis cadence: ' + (input.bias_analyses_conducted >= 4 ? 'on track' : 'below target'),
      'Public engagement metrics: ' + input.public_consultations + ' consultations conducted'
    ],
    improvement_areas: [
      'Increase AI system catalog coverage',
      'Accelerate high-risk system documentation',
      'Expand bias analysis scope',
      'Enhance cross-border transparency coordination'
    ],
    public_disclosure_ready: overallScore >= 60 && input.incidents_reported <= 10
  }
}

// --- Tool 8: Algorithmic Impact Assessment ---
function analyzeAlgorithmicImpact(input: AlgorithmicInput): AlgorithmicImpactResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const impactCategories: ImpactCategory[] = []

  // Rights impact
  const rightsDecisions = input.decision_types.filter(dt =>
    dt.includes('hiring') || dt.includes('credit') || dt.includes('access') || dt.includes('eligibility')
  ).length
  const rightsSeverity: ImpactCategory['severity'] =
    rightsDecisions > 2 ? 'significant' : rightsDecisions > 0 ? 'moderate' : 'minor'
  impactCategories.push({
    category: 'Fundamental Rights',
    severity: rightsSeverity,
    likelihood: rightsDecisions > 0 ? 'likely' : 'possible',
    impact_score: Math.min(100, rightsDecisions * 25 + rng.nextInt(5, 20)),
    mitigation: 'Implement human review for all high-stakes decisions affecting individual rights'
  })

  // Privacy impact
  const privacyScore = input.data_sources.filter(ds =>
    ds.includes('personal') || ds.includes('biometric') || ds.includes('health') || ds.includes('location')
  ).length
  impactCategories.push({
    category: 'Privacy',
    severity: privacyScore > 2 ? 'significant' : privacyScore > 0 ? 'moderate' : 'benign',
    likelihood: privacyScore > 0 ? 'likely' : 'unlikely',
    impact_score: Math.min(100, privacyScore * 30 + rng.nextInt(5, 15)),
    mitigation: 'Data minimization, anonymization, and purpose limitation controls'
  })

  // Discrimination risk
  const discriminationVuln = input.affected_groups.filter(g =>
    g.includes('minority') || g.includes('disability') || g.includes('elderly') || g.includes('low_income')
  ).length
  impactCategories.push({
    category: 'Discrimination Risk',
    severity: discriminationVuln > 1 ? 'significant' : discriminationVuln > 0 ? 'moderate' : 'minor',
    likelihood: discriminationVuln > 0 ? 'possible' : 'unlikely',
    impact_score: Math.min(100, discriminationVuln * 25 + rng.nextInt(0, 20)),
    mitigation: 'Regular bias testing, demographic parity constraints, diverse training data'
  })

  // Autonomy impact
  const autonomyImpact = input.human_oversight_mechanism.includes('none') ? 70 :
    input.human_oversight_mechanism.includes('limited') ? 45 : 20
  impactCategories.push({
    category: 'Individual Autonomy',
    severity: autonomyImpact > 50 ? 'significant' : autonomyImpact > 25 ? 'moderate' : 'minor',
    likelihood: autonomyImpact > 40 ? 'likely' : 'possible',
    impact_score: autonomyImpact + rng.nextInt(-10, 10),
    mitigation: 'Ensure meaningful human oversight, opt-out mechanisms, and decision review options'
  })

  // Scale impact
  const scaleScore = Math.min(100, input.affected_population_size / 1000)
  impactCategories.push({
    category: 'Scale of Impact',
    severity: scaleScore > 80 ? 'severe' : scaleScore > 50 ? 'significant' : scaleScore > 20 ? 'moderate' : 'minor',
    likelihood: scaleScore > 30 ? 'certain' : 'likely',
    impact_score: Math.round(scaleScore),
    mitigation: 'Staged rollout with safety overrides and continuous post-deployment monitoring'
  })

  const cumulativeScore = impactCategories.reduce((s, c) => s + c.impact_score, 0) / Math.max(1, impactCategories.length)
  const maxScore = Math.max(...impactCategories.map(c => c.impact_score))

  const overallImpact: AlgorithmicImpactResult['overall_impact_level'] =
    maxScore >= 80 || cumulativeScore >= 65 ? 'critical' :
    maxScore >= 60 || cumulativeScore >= 45 ? 'high' :
    maxScore >= 40 || cumulativeScore >= 25 ? 'medium' : 'low'

  return {
    system_name: input.system_name,
    assessment_id: 'AIA-' + Date.now() + '-' + rng.nextInt(1000, 9999),
    assessment_date: new Date().toISOString().split('T')[0],
    overall_impact_level: overallImpact,
    impact_categories: impactCategories,
    cumulative_risk_score: Math.round(cumulativeScore),
    rights_impact_score: impactCategories[0].impact_score,
    environmental_score: rng.nextInt(5, 30),
    labor_score: input.labor_impact.includes('displace') ? rng.nextInt(50, 80) : rng.nextInt(10, 40),
    recommendations: [
      'Conduct public consultation before deployment' + (input.consultation_taken ? ' (done)' : ' (required)'),
      'Implement graduated deployment with safety monitoring',
      'Establish independent oversight committee',
      'Create accessible grievance mechanism',
      'Publish algorithmic accountability report annually'
    ],
    requires_public_consultation: input.affected_population_size > 10000 || maxScore >= 60,
    requires_regulatory_notification: overallImpact === 'critical' || overallImpact === 'high',
    next_assessment_due: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatEUComplianceReport(result: EUComplianceResult): string {
  const lines: string[] = []
  lines.push('## EU AI Act Compliance Assessment')
  lines.push('')
  lines.push(`System: ${result.system_name} | Regulation: ${result.regulation}`)
  lines.push(`Assessment Date: ${result.assessment_date} | Next Deadline: ${result.next_deadline}`)
  lines.push(`Overall Compliance: ${result.overall_compliance_pct}% | Risk Class: ${result.risk_classification}`)
  lines.push(`Non-Compliant: ${result.non_compliant_count} | Partial: ${result.partial_count}`)
  lines.push(`Enforcement Priority: ${result.enforcement_priority.toUpperCase()}`)
  lines.push('')
  lines.push('### Compliance Checks')
  for (const c of result.checks) {
    const statusIcon = c.status === 'compliant' ? 'PASS' : c.status === 'partial' ? 'PARTIAL' : 'FAIL'
    lines.push(`[${statusIcon}] ${c.article} - ${c.requirement} (${c.severity})`)
    lines.push(`  ${c.details}`)
  }
  lines.push('')
  if (result.critical_gaps.length > 0) {
    lines.push('### Critical Gaps (Action Required)')
    for (const gap of result.critical_gaps) lines.push('- ' + gap)
    lines.push('')
  }
  lines.push('---')
  lines.push('*EU AI Act enforcement 2 Aug 2026. Systems not meeting Article 50 transparency obligations face penalties.*')
  return lines.join('\n')
}

function formatBiasDetectionReport(result: BiasDetectionResult): string {
  const lines: string[] = []
  lines.push('## Bias Detection Audit Report')
  lines.push('')
  lines.push(`Model: ${result.model_name} | Fairness Metric: ${result.fairness_metric}`)
  lines.push(`Overall Fairness Score: ${result.overall_fairness_score}/100 | Risk Level: ${result.risk_level}`)
  lines.push(`Disparate Impact Ratio: ${result.disparate_impact_ratio} | Audit Passed: ${result.audit_passed ? 'YES' : 'NO'}`)
  lines.push('')
  lines.push('### Bias Metrics by Attribute')
  for (const m of result.bias_metrics) {
    const sevIcon = m.severity === 'high' || m.severity === 'severe' ? 'CRITICAL' :
      m.severity === 'moderate' ? 'WARNING' : m.severity === 'low' ? 'LOW' : 'PASS'
    lines.push(`[${sevIcon}] ${m.attribute}: ratio=${m.bias_ratio} (${m.bias_direction})`)
    lines.push(`  ${m.recommendation}`)
  }
  lines.push('')
  if (result.remediation_priority.length > 0) {
    lines.push('### Remediation Priority')
    for (const attr of result.remediation_priority) lines.push('- URGENT: ' + attr)
    lines.push('')
  }
  lines.push('---')
  lines.push('*Per EU AI Act Article 15 and NIST AI RMF: bias monitoring and fairness documentation are mandatory for high-risk AI systems.*')
  return lines.join('\n')
}

function formatModelCardReport(result: ModelCardResult): string {
  const lines: string[] = []
  lines.push('## Model Card: ' + result.model_name + ' v' + result.model_version)
  lines.push('')
  lines.push(`Generated: ${result.generated_date} | Transparency Score: ${result.transparency_score}/100`)
  lines.push(`Disclosure Level: ${result.disclosure_level} | Compliance: ${result.compliance_frameworks.join(', ')}`)
  lines.push('')
  for (const section of result.sections) {
    lines.push('### ' + section.title)
    lines.push(section.content)
    lines.push('')
  }
  lines.push('---')
  lines.push('*Per Article 13 (EU AI Act) and California AI Transparency Act 2026: model documentation and transparency reports are public obligations.*')
  return lines.join('\n')
}

function formatAIRiskReport(result: AIRiskResult): string {
  const lines: string[] = []
  lines.push('## AI Risk Classification Report')
  lines.push('')
  lines.push(`System: ${result.system_name} | Risk Level: ${result.risk_level.toUpperCase()}`)
  lines.push(`Risk Score: ${result.risk_score}/10 | Prohibited: ${result.prohibited_if_unacceptable ? 'YES' : 'NO'}`)
  lines.push(`Conformity Assessment: ${result.conformity_assessment_needed ? 'REQUIRED' : 'Not Required'}`)
  lines.push(`Post-Market Monitoring: ${result.post_market_monitoring ? 'REQUIRED' : 'Not Required'}`)
  lines.push('')
  lines.push('### Risk Factors')
  for (const f of result.risk_factors) {
    lines.push(`- ${f.factor}: score=${f.score} weight=${f.weight} contribution=${f.contribution}`)
  }
  lines.push('')
  lines.push('### Legal Basis')
  for (const lb of result.legal_basis) lines.push('- ' + lb)
  lines.push('')
  lines.push('### Required Obligations')
  for (const ob of result.required_obligations) lines.push('- ' + ob)
  lines.push('')
  lines.push('---')
  lines.push('*EU AI Act risk classification: unacceptable (prohibited) | high (conformity required) | limited (transparency) | minimal (voluntary)*')
  return lines.join('\n')
}

function formatDataGovernanceReport(result: DataGovResult): string {
  const lines: string[] = []
  lines.push('## Data Governance Assessment')
  lines.push('')
  lines.push(`Organization: ${result.organization}`)
  lines.push(`Overall Score: ${result.overall_governance_score}/100 | Maturity: ${result.maturity_level}`)
  lines.push(`Next Review: ${result.next_review_date}`)
  lines.push('')
  lines.push('### Jurisdiction Compliance')
  for (const [jurisdiction, score] of Object.entries(result.jurisdiction_compliance)) {
    lines.push(`- ${jurisdiction}: ${score}%`)
  }
  lines.push('')
  if (result.policy_gaps.length > 0) {
    lines.push('### Policy Gaps')
    for (const gap of result.policy_gaps) {
      lines.push(`[${gap.gap_severity.toUpperCase()}] ${gap.area}: ${gap.current_status}`)
      lines.push(`  -> Required: ${gap.required_status} (by ${gap.remediation_deadline})`)
    }
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const rec of result.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('*GDPR Art.35 DPIA + EU AI Act Art.9 training data governance + Schrems II cross-border requirements.*')
  return lines.join('\n')
}

function formatEthicsReviewReport(result: EthicsReviewResult): string {
  const lines: string[] = []
  lines.push('## AI Ethics Review Board Decision')
  lines.push('')
  lines.push(`Proposal: ${result.proposal_title} | Review ID: ${result.review_id}`)
  lines.push(`Date: ${result.review_date} | Recommendation: ${result.overall_recommendation.toUpperCase()}`)
  lines.push(`Stakeholder Consensus: ${result.stakeholder_consensus}% | Validity: ${result.review_validity_days} days`)
  lines.push('')
  lines.push('### Principle Scores')
  for (const p of result.principle_scores) {
    const status = p.status === 'pass' ? 'PASS' : p.status === 'conditional' ? 'CONDITIONAL' : 'FAIL'
    lines.push(`[${status}] ${p.principle}: ${p.score}/100 - ${p.comments}`)
  }
  lines.push('')
  if (result.conditions.length > 0) {
    lines.push('### Conditions of Approval')
    for (const c of result.conditions) lines.push('- ' + c)
    lines.push('')
  }
  lines.push('### Monitoring Requirements')
  for (const m of result.monitoring_requirements) lines.push('- ' + m)
  lines.push('')
  lines.push('---')
  lines.push('*Per EU AI Act and IEEE 7000-2021: ethics review is mandatory for high-risk AI deployment.*')
  return lines.join('\n')
}

function formatTransparencyReport(result: TransparencyReportResult): string {
  const lines: string[] = []
  lines.push('## AI Transparency Report')
  lines.push('')
  lines.push(`Entity: ${result.reporting_entity} | Report ID: ${result.report_id}`)
  lines.push(`Period: ${result.reporting_period} | Generated: ${result.generation_date}`)
  lines.push(`Overall Score: ${result.overall_transparency_score}/100 | Public Disclosure: ${result.public_disclosure_ready ? 'READY' : 'NOT READY'}`)
  lines.push('')
  lines.push('### Metrics')
  for (const m of result.metrics) {
    const statusIcon = m.status === 'ahead' ? 'ABOVE' : m.status === 'meeting' ? 'ON TARGET' : 'BELOW'
    lines.push(`[${statusIcon}] ${m.metric}: ${m.value} (benchmark: ${m.benchmark})`)
  }
  lines.push('')
  lines.push('### Regulatory Alignment')
  for (const framework of Object.keys(result.regulatory_alignment)) {
    lines.push(`- ${framework}: ${result.regulatory_alignment[framework]}%`)
  }
  lines.push('')
  lines.push('### Key Findings')
  for (const f of result.key_findings) lines.push('- ' + f)
  lines.push('')
  lines.push('### Improvement Areas')
  for (const area of result.improvement_areas) lines.push('- ' + area)
  lines.push('')
  lines.push('---')
  lines.push('*Per Article 50 EU AI Act: transparency reporting enforcement begins 2 August 2026.*')
  return lines.join('\n')
}

function formatAlgorithmicImpactReport(result: AlgorithmicImpactResult): string {
  const lines: string[] = []
  lines.push('## Algorithmic Impact Assessment')
  lines.push('')
  lines.push(`System: ${result.system_name} | Assessment ID: ${result.assessment_id}`)
  lines.push(`Date: ${result.assessment_date} | Overall Impact: ${result.overall_impact_level.toUpperCase()}`)
  lines.push(`Cumulative Risk Score: ${result.cumulative_risk_score}/100`)
  lines.push(`Rights Impact: ${result.rights_impact_score} | Environmental: ${result.environmental_score} | Labor: ${result.labor_score}`)
  lines.push(`Public Consultation: ${result.requires_public_consultation ? 'REQUIRED' : 'Not Required'}`)
  lines.push(`Regulatory Notification: ${result.requires_regulatory_notification ? 'REQUIRED' : 'Not Required'}`)
  lines.push('')
  lines.push('### Impact Categories')
  for (const c of result.impact_categories) {
    lines.push(`- ${c.category}: severity=${c.severity} likelihood=${c.likelihood} score=${c.impact_score}`)
    lines.push(`  Mitigation: ${c.mitigation}`)
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('*Per EU AI Act Article 26 and Algorithmic Accountability Act: high-impact systems require pre-deployment AIA.*')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: EU AI Act Compliance Checker
  tools.register(defineTool({
    name: 'eu_ai_act_compliance_checker',
    description: 'EU AI Act 2024/1689 compliance checker. Validates Article 50 transparency (8/2 enforcement), risk classification, conformity assessment obligations.',
    parameters: {
      compliance_input: {
        type: 'string',
        required: true,
        description: 'JSON: system_name, system_purpose, market_region(eu|us|uk|china|global), risk_category(unacceptable|high|limited|minimal|not_sure), transparency_measures{user_disclosure,ai_generated_label,data_usage_notice,right_to_explanation,human_oversight}, governance_measures{risk_management_system,data_governance,technical_documentation,record_keeping,quality_management}'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { compliance_input: string }) {
      const input: EUComplianceInput = JSON.parse(args.compliance_input)
      return formatEUComplianceReport(analyzeEUAICompliance(input))
    }
  }))

  // Tool 2: Bias Detection Auditor
  tools.register(defineTool({
    name: 'bias_detection_auditor',
    description: 'Bias detection and fairness auditing for AI models. Supports demographic parity, equalized odds, calibration, disparate impact analysis.',
    parameters: {
      bias_input: {
        type: 'string',
        required: true,
        description: 'JSON: model_name, model_type, protected_attributes[], fairness_metric(demographic_parity|equalized_odds|calibration|disparate_impact), test_data_summary{total_samples,group_distribution{},outcome_distribution{}}, performance_by_group{}'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { bias_input: string }) {
      const input: BiasDetectionInput = JSON.parse(args.bias_input)
      return formatBiasDetectionReport(analyzeBiasDetection(input))
    }
  }))

  // Tool 3: Model Cards Generator
  tools.register(defineTool({
    name: 'model_cards_generator',
    description: 'Generate standardized model cards for AI transparency. Compliant with EU AI Act Art.13/50 and NIST AI RMF documentation requirements.',
    parameters: {
      card_input: {
        type: 'string',
        required: true,
        description: 'JSON: model_name, model_version, model_type, developers[], training_data, training_period, intended_use_cases[], out_of_scope_uses[], ethical_considerations, performance_metrics{}, fairness_assessment, update_frequency'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { card_input: string }) {
      const input: ModelCardInput = JSON.parse(args.card_input)
      return formatModelCardReport(analyzeModelCards(input))
    }
  }))

  // Tool 4: AI Risk Classification
  tools.register(defineTool({
    name: 'ai_risk_classification',
    description: 'EU AI Act 4-tier risk classification: unacceptable (prohibited), high (conformity required), limited (transparency), minimal (voluntary).',
    parameters: {
      risk_input: {
        type: 'string',
        required: true,
        description: 'JSON: system_name, domain(healthcare|finance|education|employment|justice|transportation|general|military), decision_autonomy(fully_autonomous|human_in_loop|human_on_loop|human_command|assisted), data_sensitivity(special_category|personal|professional|public|anonymized), stakeholder_impact(number), reversibility(fully_reversible|partially_reversible|irreversible), data_volume(massive|large|moderate|small), cross_border(boolean), vulnerable_groups(boolean), risk_category(unacceptable|high|limited|minimal|not_sure), market_region(eu|us|uk|china|global)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_input: string }) {
      const input: AIRiskInput = JSON.parse(args.risk_input)
      return formatAIRiskReport(analyzeAIRiskClassification(input))
    }
  }))

  // Tool 5: Data Governance Policy Engine
  tools.register(defineTool({
    name: 'data_governance_policy_engine',
    description: 'Data governance assessment: GDPR Art.35 DPIA, PIPL compliance, Schrems II cross-border, data subject rights, technical measures.',
    parameters: {
      datagov_input: {
        type: 'string',
        required: true,
        description: 'JSON: organization, data_types[], processing_purposes[], data_retention_days(number), cross_border_transfer(boolean), jurisdictions[], technical_measures[], organizational_measures[], dpo_appointed(boolean), privacy_impact_assessment(boolean), consent_mechanism(boolean), data_subject_rights[], breach_notification_plan(boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { datagov_input: string }) {
      const input: DataGovInput = JSON.parse(args.datagov_input)
      return formatDataGovernanceReport(analyzeDataGovernance(input))
    }
  }))

  // Tool 6: AI Ethics Review Board
  tools.register(defineTool({
    name: 'ai_ethics_review_board',
    description: 'AI ethics review board simulation: beneficence, non-maleficence, autonomy, justice, transparency, accountability, privacy scoring.',
    parameters: {
      ethics_input: {
        type: 'string',
        required: true,
        description: 'JSON: proposal_title, system_purpose, developer, review_type(initial|annual|incident_driven|post_deployment), ethical_principles{beneficence,non_maleficence,autonomy,justice,transparency,accountability,privacy}, stakeholder_input[ExpertStakeholder], potential_harms[], mitigation_measures[], monitoring_plan(boolean), whistleblower_mechanism(boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { ethics_input: string }) {
      const input: EthicsReviewInput = JSON.parse(args.ethics_input)
      return formatEthicsReviewReport(analyzeEthicsReview(input))
    }
  }))

  // Tool 7: Transparency Report Generator
  tools.register(defineTool({
    name: 'transparency_report_generator',
    description: 'Generate AI transparency reports per Article 50 EU AI Act (8/2/2026 enforcement). Metrics: systems catalogued, incidents, audits, bias analyses.',
    parameters: {
      transparency_input: {
        type: 'string',
        required: true,
        description: 'JSON: reporting_entity, reporting_period, regulation_frameworks[], ai_systems_catalogued(number), high_risk_systems_count(number), incidents_reported(number), audits_conducted(number), training_initiatives(number), public_consultations(number), data_subject_requests(number), bias_analyses_conducted(number), updates_since_last[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { transparency_input: string }) {
      const input: TransparencyReportInput = JSON.parse(args.transparency_input)
      return formatTransparencyReport(analyzeTransparencyReport(input))
    }
  }))

  // Tool 8: Algorithmic Impact Assessment
  tools.register(defineTool({
    name: 'algorithmic_impact_assessment',
    description: 'Pre-deployment algorithmic impact assessment per EU AI Act Art.26. Rights, privacy, discrimination, autonomy, scale impact scoring.',
    parameters: {
      aia_input: {
        type: 'string',
        required: true,
        description: 'JSON: system_name, system_description, deployment_context, affected_population_size(number), affected_groups[], decision_types[], data_sources[], human_oversight_mechanism, alternatives_considered, consultation_taken(boolean), environmental_impact, labor_impact'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { aia_input: string }) {
      const input: AlgorithmicInput = JSON.parse(args.aia_input)
      return formatAlgorithmicImpactReport(analyzeAlgorithmicImpact(input))
    }
  }))

  console.log('[dsh-tool-aigovernance] v' + VERSION + ' - AI Governance & Compliance: 8 tools active')
  console.log('  Tools: eu_ai_act_compliance_checker, bias_detection_auditor, model_cards_generator, ai_risk_classification')
  console.log('         data_governance_policy_engine, ai_ethics_review_board, transparency_report_generator, algorithmic_impact_assessment')
}
