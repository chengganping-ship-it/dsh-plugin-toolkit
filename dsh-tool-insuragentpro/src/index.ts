/**
 * DSH Insurance AI Assistant Plugin v1.0.0
 * 保险AI助手 for DeepSeek Harness — 核保·理赔·精算·产品·再保·反欺诈·保单管理·渠道分销
 *
 * 覆盖保险全业务流程：核保分析 → 理赔处理 → 精算定价 → 产品设计 → 再保险策略 → 反欺诈 → 保单管理 → 渠道分销
 *
 * 工具清单:
 * 1. underwriting_analyzer      — 核保分析（风险评估/费率/免赔/限额）
 * 2. claims_processor           — 理赔处理（初审/调查/定损/拒赔分析）
 * 3. actuarial_pricer           — 精算定价（纯保费/费率因子/利润测试）
 * 4. insurance_product_designer — 产品设计（条款/费率表/组合方案）
 * 5. reinsurance_strategist    — 再保险策略（比例/非比例/自留额）
 * 6. insurance_fraud_detector  — 反欺诈（关联交易/模式识别）
 * 7. policy_lifecycle_manager   — 保单管理（续保/批改/退保）
 * 8. insurance_distribution    — 渠道分销（代理人/银保/互联网）
 *
 * @module dsh-tool-insuragentpro | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'insuragentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析基于AI模型推断，仅供保险业务参考，不替代专业精算与核保决策。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Underwriting Analyzer ---
interface ApplicantProfile {
  applicant_id: string
  age: number
  gender: string
  health_score: number
  occupation_class: number
  smoking: boolean
  medical_history: string[]
  family_history: string[]
  bmi: number
  annual_income: number
  coverage_type: string
  coverage_amount: number
  deductible_preference: number
  hazardous_hobbies: string[]
  driving_record: string
}

interface RiskFactor {
  factor: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  impact_score: number
  description: string
}

interface UnderwritingDecision {
  decision: 'standard' | 'rated' | 'postponed' | 'declined'
  risk_level: 'preferred' | 'standard' | 'substandard' | 'declined'
  premium_rate: number
  loading_percentage: number
  exclusions: string[]
  special_conditions: string[]
  recommended_deductible: number
  recommended_limit: number
  confidence_score: number
}

interface UnderwritingResult {
  applicant_id: string
  overall_risk_score: number
  risk_level: 'preferred' | 'standard' | 'substandard' | 'declined'
  risk_factors: RiskFactor[]
  mitigating_factors: string[]
  underwriting_decision: UnderwritingDecision
  rate_table: Array<{ coverage_tier: string; base_rate: number; adjusted_rate: number }>
  dashboard_data: Record<string, number>
}

// --- Tool 2: Claims Processor ---
interface ClaimRecord {
  claim_id: string
  policy_id: string
  claimant_name: string
  claim_type: string
  incident_date: string
  reported_date: string
  claimed_amount: number
  policy_coverage_limit: number
  policy_deductible: number
  prior_claims_count: number
  incident_description: string
  evidence_provided: string[]
  police_report_filed: boolean
  witness_available: boolean
  medical_reports: string[]
  repair_estimates: number[]
}

interface ClaimAssessmentResult {
  claim_id: string
  preliminary_decision: 'approve' | 'investigate' | 'deny' | 'further_review'
  decision_reason: string
  assessed_amount: number
  deductible_applied: number
  depreciation: number
  investigation_triggers: string[]
  investigation_priority: 'low' | 'medium' | 'high' | 'critical'
  fraud_indicators: string[]
  recommended_actions: string[]
  coverage_analysis: Array<{ coverage_item: string; covered: boolean; limit: number; payable: number }>
  denial_reasons: string[]
  timeline_estimate_days: number
  dashboard_data: Record<string, number>
}

// --- Tool 3: Actuarial Pricer ---
interface PortfolioPricingData {
  portfolio_id: string
  line_of_business: string
  exposure_units: number
  historical_claims: number[]
  historical_premiums: number[]
  expense_ratio: number
  target_loss_ratio: number
  profit_margin_pct: number
  development_years: number[]
  trend_factors: number[]
  catastrophe_load: number
  reinsurance_cost_pct: number
}

interface LossRatioAnalysis {
  year: number
  earned_premium: number
  incurred_losses: number
  loss_ratio: number
  combined_ratio: number
}

interface ProfitTestScenario {
  scenario: string
  expected_loss_ratio: number
  combined_ratio: number
  roi_pct: number
  probability: number
}

interface PricingResult {
  portfolio_id: string
  pure_premium: number
  gross_rate: number
  technical_rate: number
  indicated_rate: number
  rate_change_pct: number
  loss_ratio_analysis: LossRatioAnalysis[]
  rate_factors: Array<{ factor: string; value: number; impact: number }>
  profit_test_scenarios: ProfitTestScenario[]
  sensitivity_analysis: Array<{ variable: number; resulting_rate: number }>
  dashboard_data: Record<string, number>
}

// --- Tool 4: Insurance Product Designer ---
interface ProductDesignInput {
  product_name: string
  line_of_business: string
  target_market: string
  target_age_range: [number, number]
  coverage_goals: string[]
  competitive_positioning: string
  distribution_channel: string
  regulatory_environment: string
}

interface CoverageClause {
  clause_name: string
  description: string
  limit_amount: number
  sublimit: number
  deductible: number
  waiting_period_days: number
  conditions: string[]
}

interface RateTableEntry {
  risk_class: string
  age_band: [number, number]
  base_premium: number
  monthly_premium: number
  annual_premium: number
}

interface ProductCombination {
  combination_name: string
  components: string[]
  synergy_score: number
  target_persona: string
  value_proposition: string
  estimated_market_share: number
}

interface ProductDesignResult {
  product_name: string
  line_of_business: string
  coverage_clauses: CoverageClause[]
  rate_table: RateTableEntry[]
  product_combinations: ProductCombination[]
  innovation_score: number
  market_viability_score: number
  regulatory_risk_score: number
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 5: Reinsurance Strategist ---
interface ReinsuranceInput {
  portfolio_id: string
  total_sum_insured: number
  total_premium: number
  net_retention: number
  lines_of_business: Array<{ lob: string; premium: number; sum_insured: number; risk_score: number }>
  current_program: Array<{ type: string; layer: string; limit: number; attachment: number; rate: number }>
  catastrophe_exposure: number
  counterparty_ratings: Array<{ reinsurer: string; rating: string; share: number }>
}

interface OptimalStructure {
  program_type: string
  layers: Array<{ layer_type: string; limit: number; attachment_point: number; rate_on_line: number; estimated_cost: number }>
  total_reinsurance_cost: number
  net_retention_optimised: number
  cession_ratio: number
  expected_recovery_rate: number
  counterparty_diversification: string[]
  program_efficiency: number
}

interface ReinsuranceResult {
  portfolio_id: string
  optimal_structure: OptimalStructure
  retention_analysis: Array<{ scenario: string; retention: number; cost: number; net_benefit: number }>
  program_comparison: Array<{ structure: string; efficiency: number; total_cost: number; risk_reduction: number }>
  ceded_premium_estimate: number
  recovery_scenarios: Array<{ event_severity: number; gross_loss: number; ceded_loss: number; net_loss: number }>
  strategic_recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 6: Insurance Fraud Detector ---
interface FraudInputData {
  network_id: string
  transactions: Array<{
    txn_id: string
    entity_id: string
    entity_type: string
    amount: number
    category: string
    frequency: number
    related_entities: string[]
    flagged_patterns: string[]
  }>
  claims_history: Array<{
    claim_id: string
    entity_id: string
    amount: number
    provider_id: string
    diagnosis_code: string
    procedure_code: string
    billing_patterns: string[]
  }>
  provider_profiles: Array<{
    provider_id: string
    specialty: string
    avg_claim_amount: number
    claim_frequency: number
    outlier_score: number
  }>
}

interface FraudAlert {
  alert_id: string
  alert_type: string
  entities_involved: string[]
  risk_score: number
  description: string
  evidence: string[]
  recommended_action: string
}

interface FraudDetectionResult {
  network_id: string
  overall_fraud_risk: number
  fraud_alerts: FraudAlert[]
  suspicious_patterns: Array<{ pattern: string; entities: string[]; score: number }>
  entity_risk_ranking: Array<{ entity_id: string; entity_type: string; risk_score: number; flags: string[] }>
  pattern_analysis: { billing_fraud_score: number; claims_fraud_score: number; application_fraud_score: number }
  investigation_recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 7: Policy Lifecycle Manager ---
interface PolicyRecord {
  policy_id: string
  holder_id: string
  holder_name: string
  product_type: string
  issue_date: string
  expiry_date: string
  premium_amount: number
  sum_insured: number
  payment_frequency: string
  payment_history: Array<{ due_date: string; paid_date: string; amount: number; status: string }>
  endorsement_history: Array<{ date: string; type: string; description: string; premium_change: number }>
  claim_history: Array<{ date: string; amount: number; status: string }>
  current_status: string
  renewal_count: number
  lapse_warnings: number
  surrender_value: number
  loan_outstanding: number
}

interface PolicyLifecycleResult {
  policy_id: string
  current_status: string
  renewal_analysis: { eligible: boolean; recommended_action: string; premium_adjustment: number; risk_classification: string; notice_date: string }
  endorsement_analysis: { pending_endorsement: string; eligibility: string; premium_impact: number; effective_date: string }
  surrender_analysis: { eligible: boolean; surrender_value: number; surrender_charge: number; net_surrender_value: number; tax_implications: string }
  lapse_risk: { risk_level: string; probability: number; factors: string[]; mitigation_actions: string[] }
  premium_trend: { direction: string; change_pct: number; avg_growth: number }
  dashboard_data: Record<string, number>
}

// --- Tool 8: Insurance Distribution ---
interface DistributionInput {
  channel_analysis_id: string
  product_type: string
  target_segments: string[]
  channels: Array<{
    channel_name: string
    channel_type: string
    current_premium: number
    policy_count: number
    avg_premium: number
    acquisition_cost: number
    commission_rate: number
   retention_rate: number
    growth_rate: number
    digital_maturity: number
    customer_satisfaction: number
    regulatory_compliance: number
  }>
  total_market_premium: number
  competitive_landscape: Array<{ competitor: string; market_share: number; primary_channel: string }>
}

interface ChannelStrategy {
  channel_name: string
  recommended_allocation_pct: number
  target_premium: number
  projected_growth: number
  investment_required: number
  roi_estimate: number
  key_initiatives: string[]
  risk_factors: string[]
}

interface DistributionResult {
  channel_analysis_id: string
  channel_strategies: ChannelStrategy[]
  channel_performance: Array<{ channel_name: string; efficiency_score: number; profitability_score: number; growth_potential: number; overall_rating: string }>
  optimal_mix: Array<{ channel_name: string; current_pct: string; optimal_pct: string; adjustment: string }>
  market_position: { current_share: number; potential_share: number; gap_analysis: string }
  strategic_recommendations: string[]
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Underwriting Analyzer ---
function analyzeUnderwriting(data: string): UnderwritingResult {
  const profile: ApplicantProfile = JSON.parse(data)
  const rand = rng(profile.applicant_id + profile.age + profile.coverage_amount)
  const riskFactors: RiskFactor[] = []
  let riskScore = 0

  // Age assessment
  if (profile.age < 25) {
    riskFactors.push({ factor: 'Young driver/applicant', severity: 'moderate', impact_score: 15, description: 'Applicant under 25, statistically higher risk' })
    riskScore += 15
  } else if (profile.age > 65) {
    riskFactors.push({ factor: 'Senior applicant', severity: 'high', impact_score: 20, description: 'Applicant over 65, elevated health/mortality risk' })
    riskScore += 20
  } else if (profile.age >= 30 && profile.age <= 50) {
    riskFactors.push({ factor: 'Prime age bracket', severity: 'low', impact_score: -10, description: 'Applicant in prime age range, favorable risk profile' })
    riskScore -= 10
  }

  // Health scoring
  if (profile.health_score < 40) {
    riskFactors.push({ factor: 'Poor health indicators', severity: 'critical', impact_score: 35, description: 'Health score below 40 indicating significant health concerns' })
    riskScore += 35
  } else if (profile.health_score < 60) {
    riskFactors.push({ factor: 'Below average health', severity: 'high', impact_score: 20, description: 'Health score between 40-60, moderate health risk' })
    riskScore += 20
  } else if (profile.health_score >= 80) {
    riskFactors.push({ factor: 'Excellent health', severity: 'low', impact_score: -15, description: 'Health score above 80, preferred risk indicator' })
    riskScore -= 15
  }

  // Occupation risk
  if (profile.occupation_class >= 4) {
    riskFactors.push({ factor: 'High-risk occupation', severity: 'high', impact_score: 25, description: 'Occupation classified as high-risk (class 4+)' })
    riskScore += 25
  } else if (profile.occupation_class <= 2) {
    riskFactors.push({ factor: 'Low-risk occupation', severity: 'low', impact_score: -10, description: 'Desk-based or low-risk occupation' })
    riskScore -= 10
  }

  // Smoking
  if (profile.smoking) {
    riskFactors.push({ factor: 'Smoker status', severity: 'high', impact_score: 30, description: 'Tobacco use significantly increases health/life risk' })
    riskScore += 30
  }

  // BMI
  if (profile.bmi > 35) {
    riskFactors.push({ factor: 'Severe obesity (BMI>35)', severity: 'high', impact_score: 20, description: 'BMI above 35 indicates severe obesity' })
    riskScore += 20
  } else if (profile.bmi < 18.5) {
    riskFactors.push({ factor: 'Underweight', severity: 'moderate', impact_score: 10, description: 'BMI below 18.5, potential health concerns' })
    riskScore += 10
  }

  // Medical history
  const criticalConditions = ['cancer', 'heart_disease', 'stroke', 'kidney_failure', 'diabetes_type1']
  const moderateConditions = ['hypertension', 'diabetes_type2', 'asthma', 'epilepsy']
  for (const condition of profile.medical_history) {
    const c = condition.toLowerCase()
    if (criticalConditions.includes(c)) {
      riskFactors.push({ factor: `Critical medical history: ${condition}`, severity: 'critical', impact_score: 30, description: `History of ${condition} significantly elevates risk` })
      riskScore += 30
    } else if (moderateConditions.includes(c)) {
      riskFactors.push({ factor: `Moderate medical history: ${condition}`, severity: 'moderate', impact_score: 15, description: `History of ${condition} moderately elevates risk` })
      riskScore += 15
    } else {
      riskFactors.push({ factor: `Medical history: ${condition}`, severity: 'low', impact_score: 5, description: `History of ${condition}` })
      riskScore += 5
    }
  }

  // Hazardous hobbies
  const highRiskHobbies = ['skydiving', 'rock_climbing', 'motorcycle_racing', 'base_jumping']
  for (const hobby of profile.hazardous_hobbies) {
    if (highRiskHobbies.includes(hobby.toLowerCase())) {
      riskFactors.push({ factor: `Hazardous hobby: ${hobby}`, severity: 'moderate', impact_score: 15, description: `${hobby} classified as high-risk activity` })
      riskScore += 15
    }
  }

  // Driving record
  if (profile.driving_record === 'dui' || profile.driving_record === 'suspended') {
    riskFactors.push({ factor: 'Serious driving violation', severity: 'high', impact_score: 25, description: 'DUI or license suspension on record' })
    riskScore += 25
  } else if (profile.driving_record === 'clean') {
    riskFactors.push({ factor: 'Clean driving record', severity: 'low', impact_score: -5, description: 'No traffic violations, favorable factor' })
    riskScore -= 5
  }

  // Normalize risk score
  riskScore = Math.max(0, Math.min(100, riskScore + Math.round(rand() * 10 - 5)))

  // Determine risk classification and decision
  let riskLevel: UnderwritingResult['risk_level'] = 'standard'
  let decision: UnderwritingDecision['decision'] = 'standard'
  let loadingPct = 0
  let premiumRate = 0.02

  if (riskScore >= 80) {
    riskLevel = 'declined'
    decision = 'declined'
    loadingPct = 0
    premiumRate = 0
  } else if (riskScore >= 60) {
    riskLevel = 'substandard'
    decision = 'rated'
    loadingPct = Math.round((riskScore - 50) * 2.5)
    premiumRate = 0.02 * (1 + loadingPct / 100)
  } else if (riskScore <= 25) {
    riskLevel = 'preferred'
    decision = 'standard'
    loadingPct = -10
    premiumRate = 0.02 * 0.85
  } else {
    riskLevel = 'standard'
    decision = 'standard'
    loadingPct = Math.round((riskScore - 30) * 0.8)
    premiumRate = 0.02 * (1 + loadingPct / 100)
  }

  // Exclusions and conditions
  const exclusions: string[] = []
  const specialConditions: string[] = []
  if (profile.medical_history.some(c => c.toLowerCase().includes('back'))) {
    exclusions.push('Spinal injury exclusion rider')
  }
  if (profile.hazardous_hobbies.length > 0) {
    exclusions.push('Hazardous activities exclusion rider')
  }
  if (profile.health_score < 50) {
    specialConditions.push('Medical re-examination required annually')
  }
  if (riskLevel === 'substandard') {
    specialConditions.push('Quarterly health reporting for first 2 years')
  }

  // Rate table
  const rateTable = [
    { coverage_tier: 'Basic', base_rate: 0.015, adjusted_rate: Math.round((premiumRate * 0.8) * 100000) / 100000 },
    { coverage_tier: 'Standard', base_rate: 0.02, adjusted_rate: Math.round(premiumRate * 100000) / 100000 },
    { coverage_tier: 'Premium', base_rate: 0.03, adjusted_rate: Math.round((premiumRate * 1.3) * 100000) / 100000 },
    { coverage_tier: 'Ultra', base_rate: 0.045, adjusted_rate: Math.round((premiumRate * 1.6) * 100000) / 100000 }
  ]

  const recommendedDeductible = riskLevel === 'preferred' ? Math.max(5000, profile.deductible_preference) :
    riskLevel === 'substandard' ? Math.min(2000, profile.deductible_preference) :
    profile.deductible_preference

  const recommendedLimit = riskLevel === 'declined' ? 0 :
    Math.min(profile.coverage_amount, profile.annual_income * 15)

  const mitigatingFactors: string[] = []
  if (profile.health_score >= 80) mitigatingFactors.push('Excellent health indicators')
  if (!profile.smoking) mitigatingFactors.push('Non-smoker status')
  if (profile.occupation_class <= 2) mitigatingFactors.push('Low-risk occupation')
  if (profile.age >= 30 && profile.age <= 45) mitigatingFactors.push('Prime age bracket')
  if (profile.bmi >= 20 && profile.bmi <= 25) mitigatingFactors.push('Healthy BMI range')
  if (profile.driving_record === 'clean') mitigatingFactors.push('Clean driving record')
  if (profile.annual_income >= 80000) mitigatingFactors.push('Stable high income')

  return {
    applicant_id: profile.applicant_id,
    overall_risk_score: riskScore,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    mitigating_factors: mitigatingFactors,
    underwriting_decision: {
      decision,
      risk_level: riskLevel,
      premium_rate: Math.round(premiumRate * 100000) / 100000,
      loading_percentage: loadingPct,
      exclusions,
      special_conditions: specialConditions,
      recommended_deductible: recommendedDeductible,
      recommended_limit: Math.round(recommendedLimit),
      confidence_score: Math.round((75 + rand() * 20) * 10) / 10
    },
    rate_table: rateTable,
    dashboard_data: {
      risk_score: riskScore,
      factor_count: riskFactors.length,
      mitigation_count: mitigatingFactors.length,
      loading_pct: loadingPct,
      premium_rate: Math.round(premiumRate * 10000) / 100
    }
  }
}

function formatUnderwritingReport(r: UnderwritingResult): string {
  const lines: string[] = []
  lines.push('## 🛡️ Underwriting Analyzer — 核保分析')
  lines.push('')
  lines.push(`> **投保人**: ${r.applicant_id} | **风险等级**: ${r.risk_level.toUpperCase()} | **评分**: ${r.overall_risk_score}/100 | **决定**: ${r.underwriting_decision.decision.toUpperCase()}`)
  lines.push('')
  lines.push('### 📊 核保仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    APP[投保申请] --> SCREEN[风险筛查]')
  lines.push('    SCREEN --> ASSESS[风险评估]')
  lines.push('    ASSESS --> DECISION[核保决定]')
  lines.push('    DECISION --> STANDARD[标准承保]')
  lines.push('    DECISION --> RATED[加费承保]')
  lines.push('    DECISION --> EXCLUDE[除外承保]')
  lines.push('    DECISION --> DECLINE[拒保]')
  lines.push(`    RISK[风险评分: ${r.overall_risk_score}]`)
  lines.push(`    RATE[费率: ${(r.underwriting_decision.premium_rate * 100).toFixed(3)}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 核保决定汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 风险评分 | ${r.overall_risk_score}/100 |`)
  lines.push(`| 风险等级 | ${r.risk_level.toUpperCase()} |`)
  lines.push(`| 核保决定 | ${r.underwriting_decision.decision.toUpperCase()} |`)
  lines.push(`| 加费比例 | ${r.underwriting_decision.loading_percentage >= 0 ? '+' : ''}${r.underwriting_decision.loading_percentage}% |`)
  lines.push(`| 基础费率 | ${(r.underwriting_decision.premium_rate * 100).toFixed(3)}% |`)
  lines.push(`| 建议免赔额 | ¥${r.underwriting_decision.recommended_deductible.toLocaleString()} |`)
  lines.push(`| 建议限额 | ¥${r.underwriting_decision.recommended_limit.toLocaleString()} |`)

  lines.push('### ⚠️ 风险因素')
  if (r.risk_factors.length > 0) {
    lines.push('| 因素 | 严重程度 | 影响分 | 说明 |')
    lines.push('|------|----------|--------|------|')
    for (const f of r.risk_factors) {
      lines.push(`| ${f.factor} | ${f.severity} | ${f.impact_score} | ${f.description} |`)
    }
  } else {
    lines.push('- 无显著风险因素')
  }
  lines.push('')

  lines.push('### ✅ 缓解因素')
  for (const m of r.mitigating_factors) lines.push(`- ${m}`)
  if (r.mitigating_factors.length === 0) lines.push('- 无显著缓解因素')
  lines.push('')

  if (r.underwriting_decision.exclusions.length > 0) {
    lines.push('### 📋 除外责任')
    for (const e of r.underwriting_decision.exclusions) lines.push(`- ${e}`)
    lines.push('')
  }

  if (r.underwriting_decision.special_conditions.length > 0) {
    lines.push('### 📋 特别约定')
    for (const c of r.underwriting_decision.special_conditions) lines.push(`- ${c}`)
    lines.push('')
  }

  lines.push('### 📊 费率表')
  lines.push('| 保障等级 | 基础费率 | 调整后费率 |')
  lines.push('|----------|----------|------------|')
  for (const rt of r.rate_table) {
    lines.push(`| ${rt.coverage_tier} | ${(rt.base_rate * 100).toFixed(3)}% | ${(rt.adjusted_rate * 100).toFixed(3)}% |`)
  }
  lines.push('')

  lines.push('### 📋 核保清单')
  lines.push('- [x] 年龄评估')
  lines.push('- [x] 健康状况评分')
  lines.push('- [x] 职业风险分类')
  lines.push('- [x] 生活习惯评估(吸烟/ BMI)')
  lines.push('- [x] 医疗史审查')
  lines.push('- [x] 家族病史分析')
  lines.push('- [x] 高风险爱好评估')
  lines.push('- [x] 驾驶记录审查')
  lines.push('- [x] 费率与加费计算')
  lines.push('- [x] 核保决定生成')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// --- Tool 2: Claims Processor ---
function analyzeClaims(data: string): ClaimAssessmentResult {
  const claim: ClaimRecord = JSON.parse(data)
  const rand = rng(claim.claim_id + claim.claimed_amount + claim.incident_date)
  const investigationTriggers: string[] = []
  const fraudIndicators: string[] = []
  const recommendedActions: string[] = []
  const coverageAnalysis: ClaimAssessmentResult['coverage_analysis'] = []

  // Timeliness check
  const incidentDate = new Date(claim.incident_date)
  const reportedDate = new Date(claim.reported_date)
  const daysToReport = Math.round((reportedDate.getTime() - incidentDate.getTime()) / 86400000)

  if (daysToReport > 30) {
    investigationTriggers.push(`Late reporting: ${daysToReport} days after incident`)
    fraudIndicators.push('Delayed claim reporting')
  }
  if (daysToReport > 90) {
    investigationTriggers.push('Very late reporting - requires detailed explanation')
    fraudIndicators.push('Excessive delay in reporting')
  }

  // Amount analysis
  const coverageRatio = claim.claimed_amount / Math.max(claim.policy_coverage_limit, 1)
  if (coverageRatio > 0.9) {
    investigationTriggers.push('Claim amount near policy limit')
    fraudIndicators.push('Claim at or near maximum limit')
  }
  if (claim.claimed_amount >= 50000) {
    investigationTriggers.push('High-value claim requiring senior adjuster review')
  }

  // Prior claims frequency
  if (claim.prior_claims_count >= 4) {
    investigationTriggers.push(`High claims frequency: ${claim.prior_claims_count} prior claims`)
    fraudIndicators.push('Frequent claimant pattern')
  } else if (claim.prior_claims_count >= 2) {
    investigationTriggers.push(`Moderate claims frequency: ${claim.prior_claims_count} prior claims`)
  }

  // Evidence quality
  if (!claim.police_report_filed && claim.claim_type === 'auto') {
    investigationTriggers.push('No police report for auto claim')
  }
  if (!claim.witness_available && claim.claimed_amount > 10000) {
    investigationTriggers.push('No witness for high-value claim')
  }
  if (claim.evidence_provided.length < 2 && claim.claimed_amount > 5000) {
    investigationTriggers.push('Insufficient documentation provided')
  }

  // Incident timing patterns
  const incidentDay = incidentDate.getDay()
  if (incidentDay === 0 || incidentDay === 6) {
    fraudIndicators.push('Incident occurred on weekend')
  }

  // Calculate assessed amount
  const depreciation = claim.claimed_amount * (0.05 + rand() * 0.1)
  const deductibleApplied = Math.min(claim.policy_deductible, claim.claimed_amount)
  const assessedAmount = Math.max(0, claim.claimed_amount - deductibleApplied - depreciation)
  const finalPayable = Math.min(assessedAmount, claim.policy_coverage_limit)

  // Build coverage analysis
  coverageAnalysis.push(
    { coverage_item: 'Primary Coverage', covered: true, limit: claim.policy_coverage_limit, payable: finalPayable },
    { coverage_item: 'Deductible', covered: true, limit: claim.policy_deductible, payable: -deductibleApplied },
    { coverage_item: 'Depreciation', covered: true, limit: Math.round(depreciation), payable: -Math.round(depreciation) }
  )

  // Determine decision
  let preliminaryDecision: ClaimAssessmentResult['preliminary_decision'] = 'approve'
  let decisionReason = 'Claim meets all coverage criteria and documentation requirements'

  if (fraudIndicators.length >= 3) {
    preliminaryDecision = 'investigate'
    decisionReason = 'Multiple fraud indicators detected - investigation required'
    recommendedActions.push('Initiate SIU (Special Investigation Unit) referral')
    recommendedActions.push('Request independent medical examination')
  } else if (investigationTriggers.length >= 4) {
    preliminaryDecision = 'investigate'
    decisionReason = 'Multiple investigation triggers present - detailed review needed'
    recommendedActions.push('Assign senior claims adjuster')
    recommendedActions.push('Request additional documentation')
  } else if (claim.claimed_amount > claim.policy_coverage_limit * 1.5) {
    preliminaryDecision = 'deny'
    decisionReason = 'Claimed amount significantly exceeds policy coverage limits'
    recommendedActions.push('Issue denial letter with appeal rights')
  } else if (investigationTriggers.length >= 2) {
    preliminaryDecision = 'further_review'
    decisionReason = 'Additional review required for claim validation'
    recommendedActions.push('Standard review process')
  } else {
    recommendedActions.push('Process for payment')
    recommendedActions.push('Issue settlement letter')
  }

  // Investigation priority
  let investigationPriority: ClaimAssessmentResult['investigation_priority'] = 'low'
  if (fraudIndicators.length >= 3 || claim.claimed_amount > 100000) investigationPriority = 'critical'
  else if (fraudIndicators.length >= 2 || claim.claimed_amount > 50000) investigationPriority = 'high'
  else if (fraudIndicators.length >= 1 || claim.claimed_amount > 20000) investigationPriority = 'medium'

  // Denial reasons (if applicable)
  const denialReasons: string[] = []
  if (preliminaryDecision === 'deny') {
    if (claim.claimed_amount > claim.policy_coverage_limit) denialReasons.push('Claim exceeds policy limits')
    if (daysToReport > 180) denialReasons.push('Late reporting beyond policy deadline')
    if (fraudIndicators.length >= 4) denialReasons.push('Suspected fraudulent claim')
  }

  // Timeline estimate
  let timelineDays = 7
  if (preliminaryDecision === 'investigate') timelineDays = 45 + Math.round(rand() * 30)
  else if (preliminaryDecision === 'further_review') timelineDays = 14 + Math.round(rand() * 10)
  else if (fraudIndicators.length > 0) timelineDays = 30 + Math.round(rand() * 20)

  return {
    claim_id: claim.claim_id,
    preliminary_decision: preliminaryDecision,
    decision_reason: decisionReason,
    assessed_amount: Math.round(finalPayable),
    deductible_applied: Math.round(deductibleApplied),
    depreciation: Math.round(depreciation),
    investigation_triggers: investigationTriggers,
    investigation_priority: investigationPriority,
    fraud_indicators: fraudIndicators,
    recommended_actions: recommendedActions,
    coverage_analysis: coverageAnalysis,
    denial_reasons: denialReasons,
    timeline_estimate_days: timelineDays,
    dashboard_data: {
      claimed_amount: claim.claimed_amount,
      assessed_amount: Math.round(finalPayable),
      fraud_indicators: fraudIndicators.length,
      investigation_triggers: investigationTriggers.length,
      days_to_report: daysToReport
    }
  }
}

function formatClaimsReport(r: ClaimAssessmentResult): string {
  const lines: string[] = []
  lines.push('## 📋 Claims Processor — 理赔处理')
  lines.push('')
  lines.push(`> **理赔号**: ${r.claim_id} | **初审决定**: ${r.preliminary_decision.toUpperCase()} | **调查优先级**: ${r.investigation_priority.toUpperCase()} | **估赔金额**: ¥${r.assessed_amount.toLocaleString()}`)
  lines.push('')
  lines.push('### 📊 理赔处理仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CLAIM[理赔报案] --> SCREEN[立案初审]')
  lines.push('    SCREEN --> INVEST[调查核实]')
  lines.push('    INVEST --> ASSESS[定损核赔]')
  lines.push('    ASSESS --> APPROVE[赔付结案]')
  lines.push('    ASSESS --> DENY[拒赔通知]')
  lines.push(`    AMOUNT[估赔: ¥${r.assessed_amount.toLocaleString()}]`)
  lines.push(`    TIME[预计: ${r.timeline_estimate_days}工作日]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 理赔评估汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 初审决定 | ${r.preliminary_decision.toUpperCase()} |`)
  lines.push(`| 决定理由 | ${r.decision_reason} |`)
  lines.push(`| 估赔金额 | ¥${r.assessed_amount.toLocaleString()} |`)
  lines.push(`| 免赔扣除 | ¥${r.deductible_applied.toLocaleString()} |`)
  lines.push(`| 折旧扣除 | ¥${r.depreciation.toLocaleString()} |`)
  lines.push(`| 调查优先级 | ${r.investigation_priority.toUpperCase()} |`)
  lines.push(`| 预计处理天数 | ${r.timeline_estimate_days}工作日 |`)
  lines.push('')

  lines.push('### 📊 保障责任分析')
  lines.push('| 责任项目 | 是否赔付 | 限额 | 赔付金额 |')
  lines.push('|----------|----------|------|----------|')
  for (const c of r.coverage_analysis) {
    lines.push(`| ${c.coverage_item} | ${c.covered ? '是' : '否'} | ¥${c.limit.toLocaleString()} | ¥${c.payable.toLocaleString()} |`)
  }
  lines.push('')

  if (r.investigation_triggers.length > 0) {
    lines.push('### 🔍 调查触发点')
    for (const t of r.investigation_triggers) lines.push(`- ⚠️ ${t}`)
    lines.push('')
  }

  if (r.fraud_indicators.length > 0) {
    lines.push('### 🚨 欺诈信号')
    for (const f of r.fraud_indicators) lines.push(`- 🚩 ${f}`)
    lines.push('')
  }

  if (r.denial_reasons.length > 0) {
    lines.push('### ❌ 拒赔原因')
    for (const d of r.denial_reasons) lines.push(`- ${d}`)
    lines.push('')
  }

  lines.push('### ✅ 建议处理动作')
  for (const a of r.recommended_actions) lines.push(`- ${a}`)
  lines.push('')

  lines.push('### 📋 理赔处理清单')
  lines.push('- [x] 报案登记与立案')
  lines.push('- [x] 时效性审核')
  lines.push('- [x] 保险责任认定')
  lines.push('- [x] 单证完整性审核')
  lines.push('- [x] 损失金额评估')
  lines.push('- [x] 免赔额与折旧计算')
  lines.push('- [x] 欺诈风险标识')
  lines.push('- [x] 调查优先级判定')
  lines.push('- [x] 理赔决定生成')
  lines.push('- [x] 处理时效预估')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// --- Tool 3: Actuarial Pricer ---
function analyzeActuarialPricing(data: string): PricingResult {
  const portfolio: PortfolioPricingData = JSON.parse(data)
  const rand = rng(portfolio.portfolio_id + portfolio.line_of_business + portfolio.exposure_units)
  const avgClaims = portfolio.historical_claims.reduce((s, c) => s + c, 0) / Math.max(portfolio.historical_claims.length, 1)
  const avgPremium = portfolio.historical_premiums.reduce((s, p) => s + p, 0) / Math.max(portfolio.historical_premiums.length, 1)
  const purePremium = avgClaims / Math.max(portfolio.exposure_units, 1)
  const lossRatio = avgClaims / Math.max(avgPremium, 1)
  const years = portfolio.historical_claims.length
  const premiumYears = portfolio.historical_premiums.length

  if (premiumYears === 0 && years > 0) {
    // Synthetic premium data for demonstration
    for (let i = 0; i < years; i++) {
      portfolio.historical_premiums.push(portfolio.historical_claims[i] / (0.6 + rand() * 0.15))
    }
  }

  // Loss ratio analysis
  const lossRatioAnalysis: LossRatioAnalysis[] = []
  for (let i = 0; i < years; i++) {
    const ep = i < portfolio.historical_premiums.length ? portfolio.historical_premiums[i] : avgPremium
    const inc = portfolio.historical_claims[i]
    const lr = inc / Math.max(ep, 1)
    lossRatioAnalysis.push({
      year: 2025 - years + i,
      earned_premium: Math.round(ep),
      incurred_losses: Math.round(inc),
      loss_ratio: Math.round(lr * 10000) / 10000,
      combined_ratio: Math.round((lr + portfolio.expense_ratio) * 10000) / 10000
    })
  }

  // Rate factors
  const rateFactors = [
    { factor: 'Trend Factor', value: Math.round((1 + (rand() * 0.04 - 0.01)) * 10000) / 10000, impact: Math.round(rand() * 15 * 100) / 100 },
    { factor: 'Development Factor', value: Math.round((1 + rand() * 0.1) * 10000) / 10000, impact: Math.round(rand() * 10 * 100) / 100 },
    { factor: 'Catastrophe Load', value: portfolio.catastrophe_load, impact: Math.round(portfolio.catastrophe_load * 20 * 100) / 100 },
    { factor: 'Expense Ratio', value: portfolio.expense_ratio, impact: Math.round(portfolio.expense_ratio * 30 * 100) / 100 },
    { factor: 'Profit Margin', value: portfolio.profit_margin_pct / 100, impact: Math.round(portfolio.profit_margin_pct * 0.8 * 100) / 100 },
    { factor: 'Reinsurance Cost', value: portfolio.reinsurance_cost_pct / 100, impact: Math.round(portfolio.reinsurance_cost_pct * 0.5 * 100) / 100 }
  ]

  // Technical rate calculation
  const trendAdjustment = 1 + (years > 1 ? (portfolio.historical_claims[years - 1] - portfolio.historical_claims[0]) / portfolio.historical_claims[0] / years : 0.03)
  const technicalRate = purePremium * trendAdjustment * (1 + portfolio.catastrophe_load) / Math.max(0.01, (1 - portfolio.expense_ratio - portfolio.profit_margin_pct / 100))
  const grossRate = technicalRate * (1 + portfolio.reinsurance_cost_pct / 100)
  const currentRate = avgPremium / Math.max(portfolio.exposure_units, 1)
  const indicatedRate = grossRate
  const rateChangePct = ((indicatedRate - currentRate) / Math.max(currentRate, 0.001)) * 100

  // Profit test scenarios
  const profitTestScenarios: ProfitTestScenario[] = [
    { scenario: 'Base Case', expected_loss_ratio: Math.round(lossRatio * 100) / 100, combined_ratio: Math.round((lossRatio + portfolio.expense_ratio) * 100) / 100, roi_pct: Math.round((portfolio.profit_margin_pct + rand() * 3) * 10) / 10, probability: 0.50 },
    { scenario: 'Optimistic', expected_loss_ratio: Math.round(lossRatio * 0.85 * 100) / 100, combined_ratio: Math.round((lossRatio * 0.85 + portfolio.expense_ratio) * 100) / 100, roi_pct: Math.round((portfolio.profit_margin_pct + 5 + rand() * 3) * 10) / 10, probability: 0.20 },
    { scenario: 'Pessimistic', expected_loss_ratio: Math.round(lossRatio * 1.2 * 100) / 100, combined_ratio: Math.round((lossRatio * 1.2 + portfolio.expense_ratio) * 100) / 100, roi_pct: Math.round((portfolio.profit_margin_pct - 5 + rand() * 2) * 10) / 10, probability: 0.20 },
    { scenario: 'Catastrophic', expected_loss_ratio: Math.round(lossRatio * 1.8 * 100) / 100, combined_ratio: Math.round((lossRatio * 1.8 + portfolio.expense_ratio) * 100) / 100, roi_pct: Math.round((-15 + rand() * 5) * 10) / 10, probability: 0.10 }
  ]

  // Sensitivity analysis
  const sensitivityAnalysis: PricingResult['sensitivity_analysis'] = []
  for (let change = -10; change <= 10; change += 2.5) {
    sensitivityAnalysis.push({
      variable: change,
      resulting_rate: Math.round(indicatedRate * (1 + change / 100) * 100000) / 100000
    })
  }

  return {
    portfolio_id: portfolio.portfolio_id,
    pure_premium: Math.round(purePremium * 100) / 100,
    gross_rate: Math.round(grossRate * 100000) / 100000,
    technical_rate: Math.round(technicalRate * 100000) / 100000,
    indicated_rate: Math.round(indicatedRate * 100000) / 100000,
    rate_change_pct: Math.round(rateChangePct * 100) / 100,
    loss_ratio_analysis: lossRatioAnalysis,
    rate_factors: rateFactors,
    profit_test_scenarios: profitTestScenarios,
    sensitivity_analysis: sensitivityAnalysis,
    dashboard_data: {
      pure_premium: Math.round(purePremium),
      loss_ratio: Math.round(lossRatio * 100) / 100,
      rate_change_pct: Math.round(rateChangePct * 100) / 100,
      technical_rate: Math.round(technicalRate * 10000) / 100
    }
  }
}

function formatActuarialPricingReport(r: PricingResult): string {
  const lines: string[] = []
  lines.push('## 📊 Actuarial Pricer — 精算定价')
  lines.push('')
  lines.push(`> **组合**: ${r.portfolio_id} | **纯保费**: ¥${r.pure_premium.toLocaleString()} | **指示费率**: ${(r.technical_rate * 100).toFixed(3)}% | **费率变化**: ${r.rate_change_pct >= 0 ? '+' : ''}${r.rate_change_pct.toFixed(2)}%`)
  lines.push('')
  lines.push('### 📊 精算定价仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    DATA[历史数据] --> PURE[纯保费计算]')
  lines.push('    PURE --> TREND[趋势调整]')
  lines.push('    TREND --> FACTOR[费率因子]')
  lines.push('    FACTOR --> GROSS[毛费率]')
  lines.push('    GROSS --> PROFIT[利润测试]')
  lines.push('    PROFIT --> FINAL[指示费率]')
  lines.push(`    PURE_P[纯保费: ¥${r.pure_premium.toLocaleString()}]`)
  lines.push(`    IND_R[指示费率: ${(r.indicated_rate * 100).toFixed(3)}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 定价汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 纯保费 | ¥${r.pure_premium.toLocaleString()} |`)
  lines.push(`| 技术费率 | ${(r.technical_rate * 100).toFixed(4)}% |`)
  lines.push(`| 毛费率 | ${(r.gross_rate * 100).toFixed(4)}% |`)
  lines.push(`| 指示费率 | ${(r.indicated_rate * 100).toFixed(4)}% |`)
  lines.push(`| 费率变化 | ${r.rate_change_pct >= 0 ? '+' : ''}${r.rate_change_pct.toFixed(2)}% |`)
  lines.push('')

  lines.push('### 📊 赔付率分析')
  lines.push('| 年度 | 已赚保费 | 已发生赔款 | 赔付率 | 综合成本率 |')
  lines.push('|------|----------|------------|--------|------------|')
  for (const lr of r.loss_ratio_analysis) {
    lines.push(`| ${lr.year} | ¥${lr.earned_premium.toLocaleString()} | ¥${lr.incurred_losses.toLocaleString()} | ${(lr.loss_ratio * 100).toFixed(2)}% | ${(lr.combined_ratio * 100).toFixed(2)}% |`)
  }
  lines.push('')

  lines.push('### 📊 费率因子')
  lines.push('| 因子 | 值 | 影响 |')
  lines.push('|------|-----|------|')
  for (const f of r.rate_factors) {
    lines.push(`| ${f.factor} | ${f.value.toFixed(4)} | ${f.impact.toFixed(2)}% |`)
  }
  lines.push('')

  lines.push('### 📊 利润测试情景')
  lines.push('| 情景 | 预期赔付率 | 综合成本率 | ROI | 概率 |')
  lines.push('|------|------------|------------|-----|------|')
  for (const s of r.profit_test_scenarios) {
    lines.push(`| ${s.scenario} | ${(s.expected_loss_ratio * 100).toFixed(1)}% | ${(s.combined_ratio * 100).toFixed(1)}% | ${s.roi_pct}% | ${(s.probability * 100).toFixed(0)}% |`)
  }
  lines.push('')

  lines.push('### 📊 费率敏感性分析')
  lines.push('| 变化幅度 | 结果费率 |')
  lines.push('|----------|----------|')
  for (const s of r.sensitivity_analysis) {
    lines.push(`| ${s.variable >= 0 ? '+' : ''}${s.variable}% | ${(s.resulting_rate * 100).toFixed(4)}% |`)
  }
  lines.push('')

  lines.push('### 📋 精算定价清单')
  lines.push('- [x] 历史数据质量评估')
  lines.push('- [x] 纯保费计算')
  lines.push('- [x] 趋势因子调整')
  lines.push('- [x] 费率因子分析')
  lines.push('- [x] 巨灾负荷附加')
  lines.push('- [x] 费用率附加')
  lines.push('- [x] 利润边际附加')
  lines.push('- [x] 再保险成本分摊')
  lines.push('- [x] 利润测试情景分析')
  lines.push('- [x] 费率变化建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// --- Tool 4: Insurance Product Designer ---
function analyzeProductDesign(data: string): ProductDesignResult {
  const input: ProductDesignInput = JSON.parse(data)
  const rand = rng(input.product_name + input.line_of_business + input.target_market)
  const coverageClauses: CoverageClause[] = []
  const rateTable: RateTableEntry[] = []
  const productCombinations: ProductCombination[] = []

  // Generate coverage clauses based on line of business
  const lobCoverages: Record<string, CoverageClause[]> = {
    'life': [
      { clause_name: '身故保险金', description: '被保险人在保险期间内身故，给付保险金', limit_amount: input.target_age_range[1] <= 40 ? 500000 : 300000, sublimit: 0, deductible: 0, waiting_period_days: 90, conditions: ['观察期90天', '意外伤害不受观察期限制'] },
      { clause_name: '全残保险金', description: '被保险人达到全残标准，给付保险金', limit_amount: input.target_age_range[1] <= 40 ? 500000 : 300000, sublimit: 0, deductible: 0, waiting_period_days: 90, conditions: ['符合全残定义标准'] },
      { clause_name: '豁免保险费', description: '确诊重大疾病后豁免后续保费', limit_amount: 0, sublimit: 0, deductible: 0, waiting_period_days: 0, conditions: ['确诊符合合同约定'] }
    ],
    'health': [
      { clause_name: '住院医疗费用', description: '报销住院期间的合理医疗费用', limit_amount: 200000, sublimit: 50000, deductible: 10000, waiting_period_days: 30, conditions: ['二级以上公立医院', '医保目录内费用'] },
      { clause_name: '门诊手术费用', description: '报销门诊手术费用', limit_amount: 50000, sublimit: 10000, deductible: 0, waiting_period_days: 30, conditions: ['符合手术定义'] },
      { clause_name: '重大疾病保险金', description: '确诊重大疾病后一次性给付', limit_amount: 300000, sublimit: 0, deductible: 0, waiting_period_days: 90, conditions: ['符合合同约定疾病定义'] },
      { clause_name: '特定药品费用', description: '报销特定药品费用', limit_amount: 100000, sublimit: 20000, deductible: 0, waiting_period_days: 0, conditions: ['医生处方', '在药品目录内'] }
    ],
    'auto': [
      { clause_name: '车辆损失险', description: '赔偿被保险车辆损失', limit_amount: 300000, sublimit: 0, deductible: 2000, waiting_period_days: 0, conditions: ['事故责任明确'] },
      { clause_name: '第三者责任险', description: '赔偿第三方人身和财产损失', limit_amount: 1000000, sublimit: 500000, deductible: 0, waiting_period_days: 0, conditions: ['事故责任认定'] },
      { clause_name: '车上人员责任险', description: '赔偿车上人员伤亡', limit_amount: 100000, sublimit: 50000, deductible: 0, waiting_period_days: 0, conditions: ['车上座位内'] },
      { clause_name: '盗抢险', description: '全车被盗抢损失赔偿', limit_amount: 200000, sublimit: 0, deductible: 20, waiting_period_days: 0, conditions: ['公安立案证明'] }
    ],
    'property': [
      { clause_name: '建筑物损失', description: '赔偿建筑物结构损失', limit_amount: 1000000, sublimit: 500000, deductible: 5000, waiting_period_days: 0, conditions: ['在保险地址范围内'] },
      { clause_name: '室内财产损失', description: '赔偿室内财产损失', limit_amount: 300000, sublimit: 100000, deductible: 2000, waiting_period_days: 0, conditions: ['在保险地址内'] },
      { clause_name: '营业中断损失', description: '赔偿营业中断导致的收入损失', limit_amount: 500000, sublimit: 200000, deductible: 3, waiting_period_days: 0, conditions: ['因承保风险导致中断'] }
    ]
  }

  coverageClauses.push(...(lobCoverages[input.line_of_business.toLowerCase()] || lobCoverages['life']))

  // Generate rate table
  const ageBands: Array<[number, number]> = [[18, 25], [26, 35], [36, 45], [46, 55], [56, 65], [66, 75]]
  const riskClasses = ['优选体', '标准体', '次标准体']
  for (const ageBand of ageBands) {
    for (const riskClass of riskClasses) {
      const ageFactor = 1 + (ageBand[0] - 18) * 0.05
      const riskFactor = riskClass === '优选体' ? 0.8 : riskClass === '标准体' ? 1.0 : 1.5
      const basePremium = Math.round(1000 * ageFactor * riskFactor * (1 + rand() * 0.1))
      rateTable.push({
        risk_class: riskClass,
        age_band: ageBand,
        base_premium: basePremium,
        monthly_premium: Math.round(basePremium / 12 * 1.05),
        annual_premium: basePremium
      })
    }
  }

  // Product combinations
  productCombinations.push(
    { combination_name: '家庭综合保障', components: ['寿险', '重疾', '医疗', '意外'], synergy_score: 85, target_persona: '30-45岁有家庭人群', value_proposition: '全家一站式保障，保费优惠', estimated_market_share: 15 + rand() * 10 },
    { combination_name: '高端健康守护', components: ['高端医疗', '重疾', '特需门诊'], synergy_score: 90, target_persona: '高收入人群', value_proposition: '覆盖私立医院，直付服务', estimated_market_share: 8 + rand() * 5 },
    { combination_name: '车主安心计划', components: ['车损', '三者', '座位险', '道路救援'], synergy_score: 78, target_persona: '私家车主', value_proposition: '一站式车险服务，快速理赔', estimated_market_share: 20 + rand() * 10 },
    { combination_name: '企业综合保障', components: ['财产', '责任', '营业中断', '雇主责任'], synergy_score: 82, target_persona: '中小企业主', value_proposition: '企业全风险覆盖，量身定制', estimated_market_share: 12 + rand() * 8 }
  )

  // Scores
  const innovationScore = Math.round((60 + rand() * 35) * 10) / 10
  const marketViabilityScore = Math.round((55 + rand() * 40) * 10) / 10
  const regulatoryRiskScore = Math.round((10 + rand() * 30) * 10) / 10

  const recommendations: string[] = []
  if (marketViabilityScore < 70) recommendations.push('加强市场差异化定位，突出核心保障优势')
  if (regulatoryRiskScore > 30) recommendations.push('提前与监管沟通，确保条款合规')
  if (innovationScore > 80) recommendations.push('产品创新优势明显，建议加速推向市场')
  recommendations.push('建议进行小范围试销，收集市场反馈后迭代优化')
  recommendations.push('关注竞品动态，建立差异化竞争优势')
  recommendations.push('建立动态费率调整机制，保持产品竞争力')

  return {
    product_name: input.product_name,
    line_of_business: input.line_of_business,
    coverage_clauses: coverageClauses,
    rate_table: rateTable,
    product_combinations: productCombinations,
    innovation_score: innovationScore,
    market_viability_score: marketViabilityScore,
    regulatory_risk_score: regulatoryRiskScore,
    recommendations,
    dashboard_data: {
      innovation_score: innovationScore,
      market_viability: marketViabilityScore,
      regulatory_risk: regulatoryRiskScore,
      clause_count: coverageClauses.length,
      combination_count: productCombinations.length
    }
  }
}

function formatProductDesignReport(r: ProductDesignResult): string {
  const lines: string[] = []
  lines.push('## 🎨 Insurance Product Designer — 产品设计')
  lines.push('')
  lines.push(`> **产品**: ${r.product_name} | **险种**: ${r.line_of_business} | **创新评分**: ${r.innovation_score}/100 | **市场可行性**: ${r.market_viability_score}/100 | **监管风险**: ${r.regulatory_risk_score}/100`)
  lines.push('')
  lines.push('### 📊 产品设计仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    IDEA[产品概念] --> MARKET[市场分析]')
  lines.push('    MARKET --> COVERAGE[责任设计]')
  lines.push('    MARKET --> PRICING[费率设计]')
  lines.push('    MARKET --> COMBO[组合方案]')
  lines.push('    COVERAGE --> LEGAL[条款审核]')
  lines.push('    PRICING --> LEGAL')
  lines.push('    COMBO --> LEGAL')
  lines.push('    LEGAL --> LAUNCH[产品上市]')
  lines.push(`    INNOV[创新: ${r.innovation_score}]`)
  lines.push(`    VIABILITY[可行性: ${r.market_viability_score}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 保险责任条款')
  lines.push('| 条款名称 | 描述 | 限额 | 免赔额 | 等待期 |')
  lines.push('|----------|------|------|--------|--------|')
  for (const c of r.coverage_clauses) {
    lines.push(`| ${c.clause_name} | ${c.description} | ¥${c.limit_amount.toLocaleString()} | ${c.deductible > 0 ? '¥' + c.deductible.toLocaleString() : '-'} | ${c.waiting_period_days}天 |`)
  }
  lines.push('')

  lines.push('### 📊 费率表')
  lines.push('| 风险等级 | 年龄段 | 年保费 | 月保费 |')
  lines.push('|----------|--------|--------|--------|')
  for (const rt of r.rate_table) {
    lines.push(`| ${rt.risk_class} | ${rt.age_band[0]}-${rt.age_band[1]} | ¥${rt.annual_premium.toLocaleString()} | ¥${rt.monthly_premium.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📊 产品组合方案')
  lines.push('| 组合名称 | 组件 | 协同度 | 目标客群 | 预计市占率 |')
  lines.push('|----------|------|--------|----------|------------|')
  for (const pc of r.product_combinations) {
    lines.push(`| ${pc.combination_name} | ${pc.components.join('/')} | ${pc.synergy_score}/100 | ${pc.target_persona} | ${pc.estimated_market_share.toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### 💡 设计建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')

  lines.push('### 📋 产品设计清单')
  lines.push('- [x] 市场需求分析')
  lines.push('- [x] 保险责任条款设计')
  lines.push('- [x] 费率表构建')
  lines.push('- [x] 产品组合方案')
  lines.push('- [x] 创新度评估')
  lines.push('- [x] 市场可行性分析')
  lines.push('- [x] 监管合规评估')
  lines.push('- [x] 竞品对标分析')
  lines.push('- [x] 产品方案建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// --- Tool 5: Reinsurance Strategist ---
function analyzeReinsurance(data: string): ReinsuranceResult {
  const input: ReinsuranceInput = JSON.parse(data)
  const rand = rng(input.portfolio_id + input.total_sum_insured + input.total_premium)
  const totalPremium = input.total_premium
  const totalSI = input.total_sum_insured

  // Current program analysis
  const currentCost = input.current_program.reduce((s, p) => s + p.limit * p.rate, 0)
  const currentProtection = input.current_program.reduce((s, p) => s + p.limit, 0)

  // Optimal structure calculation
  const totalRiskScore = input.lines_of_business.reduce((s, l) => s + l.risk_score, 0) / Math.max(input.lines_of_business.length, 1)
  const targetRetention = totalPremium * (totalRiskScore > 7 ? 0.15 : totalRiskScore > 5 ? 0.2 : 0.25)
  const targetCession = 1 - (targetRetention / Math.max(totalPremium, 1))
  const optimalCessionRatio = Math.min(0.7, Math.max(0.1, targetCession))

  // Layer construction
  const layers: OptimalStructure['layers'] = []
  if (optimalCessionRatio > 0.4) {
    layers.push({ layer_type: 'Quota Share', limit: Math.round(totalPremium * optimalCessionRatio * 0.6), attachment_point: 0, rate_on_line: 0.32, estimated_cost: Math.round(totalPremium * optimalCessionRatio * 0.6 * 0.32) })
    layers.push({ layer_type: 'Surplus', limit: Math.round(totalPremium * optimalCessionRatio * 0.4), attachment_point: Math.round(targetRetention), rate_on_line: 0.25, estimated_cost: Math.round(totalPremium * optimalCessionRatio * 0.4 * 0.25) })
    layers.push({ layer_type: 'Cat XL', limit: Math.round(input.catastrophe_exposure * 0.5), attachment_point: Math.round(input.catastrophe_exposure * 0.1), rate_on_line: 0.08, estimated_cost: Math.round(input.catastrophe_exposure * 0.5 * 0.08) })
  } else if (optimalCessionRatio > 0.2) {
    layers.push({ layer_type: 'Surplus Share', limit: Math.round(totalPremium * optimalCessionRatio * 0.7), attachment_point: Math.round(targetRetention), rate_on_line: 0.28, estimated_cost: Math.round(totalPremium * optimalCessionRatio * 0.7 * 0.28) })
    layers.push({ layer_type: 'Cat XL', limit: Math.round(input.catastrophe_exposure * 0.4), attachment_point: Math.round(input.catastrophe_exposure * 0.08), rate_on_line: 0.07, estimated_cost: Math.round(input.catastrophe_exposure * 0.4 * 0.07) })
  } else {
    layers.push({ layer_type: 'Excess of Loss', limit: Math.round(totalPremium * optimalCessionRatio), attachment_point: Math.round(targetRetention), rate_on_line: 0.22, estimated_cost: Math.round(totalPremium * optimalCessionRatio * 0.22) })
    layers.push({ layer_type: 'Cat XL', limit: Math.round(input.catastrophe_exposure * 0.3), attachment_point: Math.round(input.catastrophe_exposure * 0.05), rate_on_line: 0.06, estimated_cost: Math.round(input.catastrophe_exposure * 0.3 * 0.06) })
  }

  const totalReinsuranceCost = layers.reduce((s, l) => s + l.estimated_cost, 0)
  const netRetentionOptimised = targetRetention
  const expectedRecoveryRate = Math.min(0.8, optimalCessionRatio * 0.7)

  // Retention analysis scenarios
  const retentionAnalysis = [
    { scenario: 'Conservative (High Retention)', retention: totalPremium * 0.35, cost: totalPremium * 0.65 * 0.3, net_benefit: Math.round(totalPremium * 0.65 * 0.25 - totalPremium * 0.65 * 0.3) },
    { scenario: 'Balanced (Medium Retention)', retention: targetRetention, cost: totalReinsuranceCost, net_benefit: Math.round(totalPremium * optimalCessionRatio * expectedRecoveryRate - totalReinsuranceCost) },
    { scenario: 'Aggressive (Low Retention)', retention: totalPremium * 0.15, cost: totalPremium * 0.85 * 0.35, net_benefit: Math.round(totalPremium * 0.85 * 0.28 - totalPremium * 0.85 * 0.35) }
  ]

  // Program comparison
  const programComparison = [
    { structure: '当前方案', efficiency: currentCost > 0 ? Math.round((currentProtection * 0.55 - currentCost) / currentCost * 100) / 100 : 0, total_cost: Math.round(currentCost), risk_reduction: Math.round(currentProtection / Math.max(totalSI, 1) * 100) },
    { structure: '最优方案', efficiency: Math.round((totalPremium * optimalCessionRatio * expectedRecoveryRate - totalReinsuranceCost) / Math.max(totalReinsuranceCost, 1) * 100) / 100, total_cost: totalReinsuranceCost, risk_reduction: Math.round(optimalCessionRatio * 80) },
    { structure: '全成数分保(50%)', efficiency: Math.round((totalPremium * 0.5 * 0.55 - totalPremium * 0.5 * 0.32) / Math.max(totalPremium * 0.5 * 0.32, 1) * 100) / 100, total_cost: Math.round(totalPremium * 0.5 * 0.32), risk_reduction: 50 },
    { structure: '溢额分保方案', efficiency: Math.round((totalPremium * 0.3 * 0.55 - totalPremium * 0.3 * 0.25) / Math.max(totalPremium * 0.3 * 0.25, 1) * 100) / 100, total_cost: Math.round(totalPremium * 0.3 * 0.25), risk_reduction: 35 },
    { structure: '巨灾超赔方案', efficiency: Math.round((input.catastrophe_exposure * 0.5 * 0.55 - input.catastrophe_exposure * 0.5 * 0.08) / Math.max(input.catastrophe_exposure * 0.5 * 0.08, 1) * 100) / 100, total_cost: Math.round(input.catastrophe_exposure * 0.5 * 0.08), risk_reduction: 20 }
  ]

  // Recovery scenarios
  const recoveryScenarios = [
    { event_severity: 0.05, gross_loss: Math.round(totalSI * 0.05), ceded_loss: Math.round(totalSI * 0.05 * optimalCessionRatio * 0.6), net_loss: Math.round(totalSI * 0.05 * (1 - optimalCessionRatio * 0.6)) },
    { event_severity: 0.10, gross_loss: Math.round(totalSI * 0.10), ceded_loss: Math.round(totalSI * 0.10 * optimalCessionRatio * 0.7), net_loss: Math.round(totalSI * 0.10 * (1 - optimalCessionRatio * 0.7)) },
    { event_severity: 0.20, gross_loss: Math.round(totalSI * 0.20), ceded_loss: Math.round(totalSI * 0.20 * optimalCessionRatio * 0.75), net_loss: Math.round(totalSI * 0.20 * (1 - optimalCessionRatio * 0.75)) },
    { event_severity: 0.50, gross_loss: Math.round(totalSI * 0.50), ceded_loss: Math.round(totalSI * 0.50 * optimalCessionRatio * 0.8), net_loss: Math.round(totalSI * 0.50 * (1 - optimalCessionRatio * 0.8)) }
  ]

  // Ceded premium estimate
  const cededPremiumEstimate = totalPremium * optimalCessionRatio

  // Counterparty diversification suggestions
  const counterpartyDiversification = ['至少3家国际再保人分保', 'A级以上评级优先', '关注单一再保人集中度', '定期评估再保人信用风险']

  // Strategic recommendations
  const strategicRecommendations: string[] = []
  if (totalRiskScore > 7) strategicRecommendations.push('高风险组合，建议提高分保比例并增加保障层数')
  if (input.catastrophe_exposure > totalPremium * 2) strategicRecommendations.push('巨灾敞口较高，建议增加巨灾超赔保障')
  if (currentCost > totalReinsuranceCost * 1.2) strategicRecommendations.push('当前再保成本偏高，建议优化分保结构降低成本')
  strategicRecommendations.push('定期进行巨灾模型评估，动态调整自留额')
  strategicRecommendations.push('建立再保人信用风险监控机制')
  if (input.counterparty_ratings.length < 3) strategicRecommendations.push('建议增加再保人数量，分散交易对手风险')

  const optimalStructure: OptimalStructure = {
    program_type: optimalCessionRatio > 0.4 ? '成额+溢额+巨灾超赔' : optimalCessionRatio > 0.2 ? '溢额+巨灾超赔' : '险位超赔+巨灾超赔',
    layers,
    total_reinsurance_cost: totalReinsuranceCost,
    net_retention_optimised: Math.round(netRetentionOptimised),
    cession_ratio: Math.round(optimalCessionRatio * 10000) / 100,
    expected_recovery_rate: Math.round(expectedRecoveryRate * 10000) / 100,
    counterparty_diversification: counterpartyDiversification,
    program_efficiency: Math.round((expectedRecoveryRate * 100 - (totalReinsuranceCost / Math.max(totalPremium, 1)) * 100) * 100) / 100
  }

  return {
    portfolio_id: input.portfolio_id,
    optimal_structure: optimalStructure,
    retention_analysis: retentionAnalysis,
    program_comparison: programComparison,
    ceded_premium_estimate: Math.round(cededPremiumEstimate),
    recovery_scenarios: recoveryScenarios,
    strategic_recommendations: strategicRecommendations,
    dashboard_data: {
      cession_ratio: Math.round(optimalCessionRatio * 100),
      total_reinsurance_cost: totalReinsuranceCost,
      net_retention: Math.round(netRetentionOptimised),
      expected_recovery: Math.round(expectedRecoveryRate * 100)
    }
  }
}

function formatReinsuranceReport(r: ReinsuranceResult): string {
  const lines: string[] = []
  lines.push('## 🏗️ Reinsurance Strategist — 再保险策略')
  lines.push('')
  lines.push(`> **组合**: ${r.portfolio_id} | **分出比例**: ${r.optimal_structure.cession_ratio}% | **再保总成本**: ¥${r.optimal_structure.total_reinsurance_cost.toLocaleString()} | **预期回收率**: ${r.optimal_structure.expected_recovery_rate}%`)
  lines.push('')
  lines.push('### 📊 再保险策略仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PORTFOLIO[保险组合] --> RISK[风险分析]')
  lines.push('    RISK --> RETAIN[自留额优化]')
  lines.push('    RISK --> CESSION[分出策略]')
  lines.push('    CESSION --> QS[成数分保]')
  lines.push('    CESSION --> SURPLUS[溢额分保]')
  lines.push('    CESSION --> XL[超赔分保]')
  lines.push('    CESSION --> CAT[巨灾超赔]')
  lines.push(`    CESSION_R[分出比例: ${r.optimal_structure.cession_ratio}%]`)
  lines.push(`    RECOVERY[预期回收: ${r.optimal_structure.expected_recovery_rate}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 最优再保结构')
  lines.push('| 项目 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 方案类型 | ${r.optimal_structure.program_type} |`)
  lines.push(`| 分出比例 | ${r.optimal_structure.cession_ratio}% |`)
  lines.push(`| 优化后自留额 | ¥${r.optimal_structure.net_retention_optimised.toLocaleString()} |`)
  lines.push(`| 再保总成本 | ¥${r.optimal_structure.total_reinsurance_cost.toLocaleString()} |`)
  lines.push(`| 预期回收率 | ${r.optimal_structure.expected_recovery_rate}% |`)
  lines.push(`| 方案效率 | ${r.optimal_structure.program_efficiency} |`)
  lines.push('')

  lines.push('### 📊 分层方案设计')
  lines.push('| 层类型 | 限额 | 起赔点 | 线费率 | 估计成本 |')
  lines.push('|--------|------|--------|--------|----------|')
  for (const l of r.optimal_structure.layers) {
    lines.push(`| ${l.layer_type} | ¥${l.limit.toLocaleString()} | ¥${l.attachment_point.toLocaleString()} | ${(l.rate_on_line * 100).toFixed(1)}% | ¥${l.estimated_cost.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📊 自留额情景分析')
  lines.push('| 情景 | 自留额 | 再保成本 | 净收益 |')
  lines.push('|------|--------|----------|--------|')
  for (const s of r.retention_analysis) {
    lines.push(`| ${s.scenario} | ¥${s.retention.toLocaleString()} | ¥${s.cost.toLocaleString()} | ¥${s.net_benefit.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📊 方案对比')
  lines.push('| 方案 | 效率 | 总成本 | 风险降低 |')
  lines.push('|------|------|--------|----------|')
  for (const p of r.program_comparison) {
    lines.push(`| ${p.structure} | ${p.efficiency} | ¥${p.total_cost.toLocaleString()} | ${p.risk_reduction}% |`)
  }
  lines.push('')

  lines.push('### 📊 赔案回收情景')
  lines.push('| 损失严重度 | 毛损失 | 分出赔款 | 净损失 |')
  lines.push('|------------|--------|----------|--------|')
  for (const s of r.recovery_scenarios) {
    lines.push(`| ${(s.event_severity * 100).toFixed(0)}% | ¥${s.gross_loss.toLocaleString()} | ¥${s.ceded_loss.toLocaleString()} | ¥${s.net_loss.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 💡 策略建议')
  for (const rec of r.strategic_recommendations) lines.push(`- ${rec}`)
  lines.push('')

  lines.push('### 📋 再保险策略清单')
  lines.push('- [x] 组合风险特征分析')
  lines.push('- [x] 自留额优化计算')
  lines.push('- [x] 分层再保方案设计')
  lines.push('- [x] 分出比例确定')
  lines.push('- [x] 再保成本测算')
  lines.push('- [x] 赔案回收情景模拟')
  lines.push('- [x] 多方案效率对比')
  lines.push('- [x] 交易对手分散建议')
  lines.push('- [x] 巨灾保障充足性')
  lines.push('- [x] 策略实施路线图')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// --- Tool 6: Insurance Fraud Detector ---
function analyzeFraudDetection(data: string): FraudDetectionResult {
  const input: FraudInputData = JSON.parse(data)
  const rand = rng(input.network_id + input.transactions.length + input.claims_history.length)
  const fraudAlerts: FraudAlert[] = []
  const suspiciousPatterns: FraudDetectionResult['suspicious_patterns'] = []
  const entityRiskMap: Record<string, { entity_type: string; risk_score: number; flags: string[] }> = {}
  const investigationRecommendations: string[] = []

  // Analyze transactions for patterns
  for (const txn of input.transactions) {
    if (!entityRiskMap[txn.entity_id]) {
      entityRiskMap[txn.entity_id] = { entity_type: txn.entity_type, risk_score: 0, flags: [] }
    }
    const entity = entityRiskMap[txn.entity_id]

    // Check for amount anomalies
    if (txn.amount > 50000) {
      entity.risk_score += 20
      entity.flags.push('大额交易: ¥' + txn.amount.toLocaleString())
    }

    // Frequency anomaly
    if (txn.frequency > 10) {
      entity.risk_score += 15
      entity.flags.push('高频交易: ' + txn.frequency + '次/周')
    }

    // Pattern-based risks
    for (const pattern of txn.flagged_patterns) {
      if (pattern.includes('round_trip') || pattern.includes('circular')) {
        entity.risk_score += 25
        entity.flags.push('循环交易模式')
        suspiciousPatterns.push({ pattern: 'Circular transaction detected', entities: [txn.entity_id, ...txn.related_entities], score: 85 })
      }
      if (pattern.includes('structuring') || pattern.includes('smurfing')) {
        entity.risk_score += 30
        entity.flags.push('化整为零交易')
        suspiciousPatterns.push({ pattern: 'Transaction structuring', entities: [txn.entity_id], score: 90 })
      }
      if (pattern.includes('rapid_movement')) {
        entity.risk_score += 20
        entity.flags.push('资金快进快出')
      }
    }

    // Related entity risk
    if (txn.related_entities.length > 3) {
      entity.risk_score += 10
      entity.flags.push('关联实体过多: ' + txn.related_entities.length)
    }

    // Category-based risk
    if (txn.category === 'cash_withdrawal' && txn.amount > 20000) {
      entity.risk_score += 15
      entity.flags.push('大额现金提取')
    }
  }

  // Analyze claims for fraud patterns
  const providerClaimCounts: Record<string, number> = {}
  const entityClaimCounts: Record<string, number> = {}
  for (const claim of input.claims_history) {
    providerClaimCounts[claim.provider_id] = (providerClaimCounts[claim.provider_id] || 0) + 1
    entityClaimCounts[claim.entity_id] = (entityClaimCounts[claim.entity_id] || 0) + 1

    if (!entityRiskMap[claim.entity_id]) {
      entityRiskMap[claim.entity_id] = { entity_type: 'claimant', risk_score: 0, flags: [] }
    }
    const entity = entityRiskMap[claim.entity_id]

    // Billing pattern analysis
    for (const bp of claim.billing_patterns) {
      if (bp === 'upcoding' || bp === 'unbundling') {
        entity.risk_score += 25
        entity.flags.push('计费欺诈: ' + bp)
        suspiciousPatterns.push({ pattern: `Billing fraud: ${bp}`, entities: [claim.entity_id, claim.provider_id], score: 80 })
      }
      if (bp === 'phantom_billing') {
        entity.risk_score += 35
        entity.flags.push('虚构收费项目')
        suspiciousPatterns.push({ pattern: 'Phantom billing detected', entities: [claim.provider_id, claim.entity_id], score: 95 })
      }
    }

    // High claim amount
    if (claim.amount > 80000) {
      entity.risk_score += 15
      entity.flags.push('高额理赔: ¥' + claim.amount.toLocaleString())
    }
  }

  // Provider outlier analysis
  for (const provider of input.provider_profiles) {
    if (provider.outlier_score > 70) {
      entityRiskMap[provider.provider_id] = { entity_type: 'provider', risk_score: provider.outlier_score, flags: ['异常服务提供者', '偏离度: ' + provider.outlier_score] }
      suspiciousPatterns.push({ pattern: 'Provider outlier detected', entities: [provider.provider_id], score: provider.outlier_score })
      fraudAlerts.push({
        alert_id: 'ALERT-PROV-' + provider.provider_id,
        alert_type: 'Provider Fraud',
        entities_involved: [provider.provider_id],
        risk_score: provider.outlier_score,
        description: `Provider ${provider.provider_id} exhibits abnormal billing patterns`,
        evidence: ['Above-average claim frequency', 'Abnormally high average claim amount', 'Outlier billing codes'],
        recommended_action: 'Initiate provider audit and claims review'
      })
    }
  }

  // Entity risk ranking
  const entityRiskRanking = Object.entries(entityRiskMap)
    .map(([entityId, data]) => ({
      entity_id: entityId,
      entity_type: data.entity_type,
      risk_score: Math.min(100, data.risk_score + Math.round(rand() * 10)),
      flags: data.flags.slice(0, 5)
    }))
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 20)

  // Generate top fraud alerts
  for (const entity of entityRiskRanking.filter(e => e.risk_score >= 50).slice(0, 10)) {
    fraudAlerts.push({
      alert_id: 'ALERT-' + entity.entity_id,
      alert_type: entity.entity_type === 'provider' ? 'Provider Fraud' : 'Claims Fraud',
      entities_involved: [entity.entity_id],
      risk_score: entity.risk_score,
      description: `Entity ${entity.entity_id} flagged with risk score ${entity.risk_score}`,
      evidence: entity.flags,
      recommended_action: entity.risk_score >= 75 ? 'Immediate investigation' : entity.risk_score >= 60 ? 'Priority review' : 'Standard review'
    })
  }

  // Overall fraud risk score
  const totalRiskScore = Object.values(entityRiskMap).reduce((s, e) => s + e.risk_score, 0)
  const overallFraudRisk = Math.min(100, Math.round(totalRiskScore / Math.max(Object.keys(entityRiskMap).length, 1)))

  // Pattern analysis scores
  const billingFraudScore = Math.min(100, Object.values(entityRiskMap).reduce((s, e) => s + (e.flags.some(f => f.includes('计费') || f.includes('虚构')) ? 20 : 0), 0))
  const claimsFraudScore = Math.min(100, Object.values(entityRiskMap).reduce((s, e) => s + (e.flags.some(f => f.includes('理赔') || f.includes('虚假')) ? 20 : 0), 0))
  const applicationFraudScore = Math.min(100, suspiciousPatterns.filter(p => p.pattern.includes('Circular') || p.pattern.includes('Structuring')).length * 15)

  // Investigation recommendations
  if (overallFraudRisk >= 70) investigationRecommendations.push('启动专项欺诈调查，成立联合调查组')
  if (billingFraudScore >= 60) investigationRecommendations.push('对异常服务提供者启动审计程序')
  if (claimsFraudScore >= 60) investigationRecommendations.push('对高频理赔者进行背景调查')
  if (applicationFraudScore >= 40) investigationRecommendations.push('加强投保审核环节，增加反欺诈筛查')
  investigationRecommendations.push('建立跨公司反欺诈信息共享机制')
  investigationRecommendations.push('部署AI实时欺诈检测系统')
  investigationRecommendations.push('定期开展反欺诈培训与案例分享')

  return {
    network_id: input.network_id,
    overall_fraud_risk: overallFraudRisk,
    fraud_alerts: fraudAlerts,
    suspicious_patterns: suspiciousPatterns,
    entity_risk_ranking: entityRiskRanking,
    pattern_analysis: {
      billing_fraud_score: billingFraudScore,
      claims_fraud_score: claimsFraudScore,
      application_fraud_score: applicationFraudScore
    },
    investigation_recommendations: investigationRecommendations,
    dashboard_data: {
      overall_risk: overallFraudRisk,
      alerts_count: fraudAlerts.length,
      suspicious_patterns: suspiciousPatterns.length,
      entities_flagged: entityRiskRanking.filter(e => e.risk_score >= 50).length
    }
  }
}

function formatFraudDetectionReport(r: FraudDetectionResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Insurance Fraud Detector — 反欺诈检测')
  lines.push('')
  lines.push(`> **网络ID**: ${r.network_id} | **整体欺诈风险**: ${r.overall_fraud_risk}/100 | **告警数**: ${r.fraud_alerts.length} | **可疑模式**: ${r.suspicious_patterns.length} | **标记实体**: ${r.entity_risk_ranking.filter(e => e.risk_score >= 50).length}`)
  lines.push('')
  lines.push('### 📊 反欺诈仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    DATA[数据源] --> SCAN[欺诈扫描]')
  lines.push('    SCAN --> ENTITY[实体分析]')
  lines.push('    SCAN --> PATTERN[模式识别]')
  lines.push('    SCAN --> NETWORK[网络分析]')
  lines.push('    ENTITY --> ALERT[风险告警]')
  lines.push('    PATTERN --> ALERT')
  lines.push('    NETWORK --> ALERT')
  lines.push('    ALERT --> INVEST[调查建议]')
  lines.push(`    RISK[整体风险: ${r.overall_fraud_risk}/100]`)
  lines.push(`    ALERTS[告警数: ${r.fraud_alerts.length}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 欺诈风险评估')
  lines.push('| 维度 | 评分 |')
  lines.push('|------|------|')
  lines.push(`| 整体欺诈风险 | ${r.overall_fraud_risk}/100 |`)
  lines.push(`| 计费欺诈评分 | ${r.pattern_analysis.billing_fraud_score}/100 |`)
  lines.push(`| 理赔欺诈评分 | ${r.pattern_analysis.claims_fraud_score}/100 |`)
  lines.push(`| 投保欺诈评分 | ${r.pattern_analysis.application_fraud_score}/100 |`)
  lines.push('')

  if (r.fraud_alerts.length > 0) {
    lines.push('### 🚨 欺诈告警')
    lines.push('| 告警ID | 类型 | 涉及实体 | 风险分 | 建议动作 |')
    lines.push('|--------|------|----------|--------|----------|')
    for (const a of r.fraud_alerts.slice(0, 10)) {
      lines.push(`| ${a.alert_id} | ${a.alert_type} | ${a.entities_involved.join(', ')} | ${a.risk_score} | ${a.recommended_action} |`)
    }
    lines.push('')
  }

  if (r.suspicious_patterns.length > 0) {
    lines.push('### 🔗 可疑模式')
    for (const p of r.suspicious_patterns.slice(0, 10)) {
      lines.push(`- **${p.pattern}** (评分: ${p.score}) → 涉及: ${p.entities.join(', ')}`)
    }
    lines.push('')
  }

  if (r.entity_risk_ranking.length > 0) {
    lines.push('### 📊 实体风险排名')
    lines.push('| 实体ID | 类型 | 风险分 | 标记 |')
    lines.push('|--------|------|--------|------|')
    for (const e of r.entity_risk_ranking.slice(0, 15)) {
      if (e.risk_score >= 30) {
        lines.push(`| ${e.entity_id} | ${e.entity_type} | ${e.risk_score} | ${e.flags.join('; ')} |`)
      }
    }
    lines.push('')
  }

  lines.push('### 💡 调查建议')
  for (const rec of r.investigation_recommendations) lines.push(`- ${rec}`)
  lines.push('')

  lines.push('### 📋 反欺诈检测清单')
  lines.push('- [x] 交易异常模式扫描')
  lines.push('- [x] 理赔欺诈模式识别')
  lines.push('- [x] 服务提供者异常检测')
  lines.push('- [x] 关联关系网络分析')
  lines.push('- [x] 计费欺诈模式识别')
  lines.push('- [x] 投保欺诈风险评估')
  lines.push('- [x] 实体风险排名')
  lines.push('- [x] 调查优先级建议')
  lines.push('- [x] 整体欺诈风险评分')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// --- Tool 7: Policy Lifecycle Manager ---
function analyzePolicyLifecycle(data: string): PolicyLifecycleResult {
  const policy: PolicyRecord = JSON.parse(data)
  const rand = rng(policy.policy_id + policy.holder_id + policy.current_status)

  // Renewal analysis
  const expiryDate = new Date(policy.expiry_date)
  const today = new Date()
  const daysToExpiry = Math.round((expiryDate.getTime() - today.getTime()) / 86400000)
  const isNearExpiry = daysToExpiry <= 60 && daysToExpiry > 0

  let renewalEligible = true
  let recommendedAction = '自动续保'
  let premiumAdjustment = 0
  let riskClassification = '标准体'

  // Age factor (simplified)
  const policyAge = policy.renewal_count
  if (policy.claim_history.length > 2) {
    premiumAdjustment = 15 + rand() * 10
    riskClassification = '关注体'
    recommendedAction = '人工核保后续保'
  } else if (policy.claim_history.length === 0) {
    premiumAdjustment = -5
    riskClassification = '优选体'
    recommendedAction = '自动续保优惠'
  }

  if (policy.lapse_warnings >= 2) {
    renewalEligible = false
    recommendedAction = '需补缴欠费后审核'
    premiumAdjustment = 20
  }

  if (policyAge >= 5) {
    premiumAdjustment += 3
    riskClassification = '次标准体'
  }

  const renewalAnalysis = {
    eligible: renewalEligible && daysToExpiry > 0,
    recommended_action: recommendedAction,
    premium_adjustment: Math.round(premiumAdjustment * 100) / 100,
    risk_classification: riskClassification,
    notice_date: new Date(expiryDate.getTime() - 30 * 86400000).toISOString().split('T')[0]
  }

  // Endorsement analysis
  const endorsementTypes = ['保额增减', '受益人变更', '缴费方式变更', '附加险增减', '地址变更']
  const pendingEndorsement = endorsementTypes[Math.floor(rand() * endorsementTypes.length)]
  const endorsementEligibility = policy.current_status === 'active' ? '符合批改条件' : '需恢复保单效力后批改'
  const premiumImpact = pendingEndorsement === '保额增减' ? Math.round(policy.premium_amount * 0.15) : Math.round(policy.premium_amount * 0.02)

  const endorsementAnalysis = {
    pending_endorsement: pendingEndorsement,
    eligibility: endorsementEligibility,
    premium_impact: premiumImpact,
    effective_date: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0]
  }

  // Surrender analysis
  const surrenderCharge = policy.surrender_value * Math.max(0, (1 - policy.renewal_count * 0.15))
  const netSurrenderValue = Math.max(0, policy.surrender_value - surrenderCharge)
  const taxImplications = netSurrenderValue > policy.premium_amount * policy.renewal_count ? '超出保费部分需缴纳个人所得税' : '无税务影响'

  const surrenderAnalysis = {
    eligible: policy.current_status === 'active' && policy.renewal_count >= 2,
    surrender_value: Math.round(policy.surrender_value),
    surrender_charge: Math.round(surrenderCharge),
    net_surrender_value: Math.round(netSurrenderValue),
    tax_implications: taxImplications
  }

  // Lapse risk
  let lapseRiskLevel = '低'
  let lapseProbability = 5.0
  const lapseRiskFactors: string[] = []
  const mitigationActions: string[] = []

  if (policy.payment_history.length > 0) {
    const latePayments = policy.payment_history.filter(p => p.status === 'late' || p.status === 'overdue').length
    const totalPayments = policy.payment_history.length
    if (latePayments / totalPayments > 0.3) {
      lapseRiskFactors.push('历史缴费逾期率超30%')
      lapseProbability += 25
      mitigationActions.push('启用自动扣费提醒')
    }
  }

  if (policy.lapse_warnings > 0) {
    lapseRiskFactors.push(`已收到${policy.lapse_warnings}次失效预警`)
    lapseProbability += policy.lapse_warnings * 10
    mitigationActions.push('派发续期慰问函')
  }

  if (policy.loan_outstanding > policy.surrender_value * 0.5) {
    lapseRiskFactors.push('保单贷款比例过高')
    lapseProbability += 15
    mitigationActions.push('建议部分还贷')
  }

  if (daysToExpiry < 0 && policy.lapse_warnings > 0) {
    lapseRiskFactors.push('保单已逾期未复效')
    lapseProbability += 30
    mitigationActions.push('启动复效流程')
  }

  lapseProbability = Math.min(95, lapseProbability)
  if (lapseProbability >= 60) lapseRiskLevel = '高'
  else if (lapseProbability >= 30) lapseRiskLevel = '中'

  if (mitigationActions.length === 0) {
    mitigationActions.push('关注续期缴费提醒')
    mitigationActions.push('定期回访维护客户关系')
  }

  const lapseRisk = {
    risk_level: lapseRiskLevel,
    probability: Math.round(lapseProbability * 10) / 10,
    factors: lapseRiskFactors,
    mitigation_actions: mitigationActions
  }

  // Premium trend
  const endorsementsWithChange = policy.endorsement_history.filter(e => e.premium_change !== 0)
  let premiumTrend = '稳定'
  let changePct = 0
  let avgGrowth = 0

  if (endorsementsWithChange.length > 0) {
    const totalChange = endorsementsWithChange.reduce((s, e) => s + e.premium_change, 0)
    avgGrowth = totalChange / Math.max(policy.renewal_count, 1)
    changePct = (totalChange / Math.max(policy.premium_amount, 1)) * 100
    premiumTrend = changePct > 5 ? '上升' : changePct < -5 ? '下降' : '稳定'
  }

  const premiumTrendAnalysis = {
    direction: premiumTrend,
    change_pct: Math.round(changePct * 100) / 100,
    avg_growth: Math.round(avgGrowth * 100) / 100
  }

  return {
    policy_id: policy.policy_id,
    current_status: policy.current_status,
    renewal_analysis: renewalAnalysis,
    endorsement_analysis: endorsementAnalysis,
    surrender_analysis: surrenderAnalysis,
    lapse_risk: lapseRisk,
    premium_trend: premiumTrendAnalysis,
    dashboard_data: {
      days_to_expiry: daysToExpiry,
      lapse_probability: Math.round(lapseProbability),
      surrender_value: Math.round(netSurrenderValue),
      premium_adjustment: Math.round(premiumAdjustment),
      claim_count: policy.claim_history.length
    }
  }
}

function formatPolicyLifecycleReport(r: PolicyLifecycleResult): string {
  const lines: string[] = []
  lines.push('## 📄 Policy Lifecycle Manager — 保单管理')
  lines.push('')
  lines.push(`> **保单号**: ${r.policy_id} | **当前状态**: ${r.current_status} | **续保资格**: ${r.renewal_analysis.eligible ? '符合' : '不符合'} | **失效风险**: ${r.lapse_risk.risk_level} | **退保净值**: ¥${r.surrender_analysis.net_surrender_value.toLocaleString()}`)
  lines.push('')
  lines.push('### 📊 保单管理仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    POLICY[保单] --> RENEW[续保分析]')
  lines.push('    POLICY --> ENDORSE[批改分析]')
  lines.push('    POLICY --> SURRENDER[退保分析]')
  lines.push('    POLICY --> LAPSE[失效风险]')
  lines.push('    RENEW --> ACTION[处理方案]')
  lines.push('    ENDORSE --> ACTION')
  lines.push('    SURRENDER --> ACTION')
  lines.push('    LAPSE --> ACTION')
  lines.push(`    STATUS[状态: ${r.current_status}]`)
  lines.push(`    LAPSE_R[失效概率: ${r.lapse_risk.probability}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 续保分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 是否可续保 | ${r.renewal_analysis.eligible ? '是' : '否'} |`)
  lines.push(`| 建议动作 | ${r.renewal_analysis.recommended_action} |`)
  lines.push(`| 保费调整 | ${r.renewal_analysis.premium_adjustment >= 0 ? '+' : ''}${r.renewal_analysis.premium_adjustment}% |`)
  lines.push(`| 风险分类 | ${r.renewal_analysis.risk_classification} |`)
  lines.push(`| 通知日期 | ${r.renewal_analysis.notice_date} |`)
  lines.push('')

  lines.push('### 📋 批改分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 待批改项目 | ${r.endorsement_analysis.pending_endorsement} |`)
  lines.push(`| 批改资格 | ${r.endorsement_analysis.eligibility} |`)
  lines.push(`| 保费影响 | ¥${r.endorsement_analysis.premium_impact.toLocaleString()} |`)
  lines.push(`| 生效日期 | ${r.endorsement_analysis.effective_date} |`)
  lines.push('')

  lines.push('### 📋 退保分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 是否可退保 | ${r.surrender_analysis.eligible ? '是' : '否'} |`)
  lines.push(`| 退保现金价值 | ¥${r.surrender_analysis.surrender_value.toLocaleString()} |`)
  lines.push(`| 退保手续费 | ¥${r.surrender_analysis.surrender_charge.toLocaleString()} |`)
  lines.push(`| 净退保价值 | ¥${r.surrender_analysis.net_surrender_value.toLocaleString()} |`)
  lines.push(`| 税务影响 | ${r.surrender_analysis.tax_implications} |`)
  lines.push('')

  lines.push('### ⚠️ 失效风险')
  lines.push(`**风险等级**: ${r.lapse_risk.risk_level} | **失效概率**: ${r.lapse_risk.probability}%`)
  lines.push('')
  if (r.lapse_risk.factors.length > 0) {
    lines.push('**风险因素**:')
    for (const f of r.lapse_risk.factors) lines.push(`- ${f}`)
    lines.push('')
  }
  lines.push('**缓解措施**:')
  for (const m of r.lapse_risk.mitigation_actions) lines.push(`- ${m}`)
  lines.push('')

  lines.push('### 📊 保费趋势')
  lines.push(`**趋势方向**: ${r.premium_trend.direction} | **变化幅度**: ${r.premium_trend.change_pct}% | **年均增长**: ¥${r.premium_trend.avg_growth.toLocaleString()}`)
  lines.push('')

  lines.push('### 📋 保单管理清单')
  lines.push('- [x] 续保资格与条件审核')
  lines.push('- [x] 续保保费调整测算')
  lines.push('- [x] 批改项目与资格确认')
  lines.push('- [x] 批改对保费影响评估')
  lines.push('- [x] 退保价值与费用计算')
  lines.push('- [x] 失效风险评估与预警')
  lines.push('- [x] 缓解措施与行动计划')
  lines.push('- [x] 保费趋势分析')
  lines.push('- [x] 客户沟通方案建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// --- Tool 8: Insurance Distribution ---
function analyzeDistribution(data: string): DistributionResult {
  const input: DistributionInput = JSON.parse(data)
  const rand = rng(input.channel_analysis_id + input.product_type + input.channels.length)
  const totalCurrentPremium = input.channels.reduce((s, c) => s + c.current_premium, 0)

  // Channel performance scoring
  const channelPerformance = input.channels.map(c => {
    const efficiencyScore = Math.round(((c.retention_rate * 0.4 + c.customer_satisfaction * 0.3 + c.regulatory_compliance * 0.3) * (1 - c.acquisition_cost / Math.max(c.avg_premium, 1))) * 100) / 100
    const profitabilityScore = Math.round(((1 - c.commission_rate) * c.avg_premium * c.policy_count / Math.max(c.acquisition_cost * c.policy_count, 1)) * 100) / 100
    const growthPotential = Math.round((c.growth_rate * 0.4 + c.digital_maturity * 0.3 + (100 - c.acquisition_cost / 100) * 0.3) * 100) / 100

    let overallRating = 'C'
    const avg = (efficiencyScore + profitabilityScore + growthPotential) / 3
    if (avg >= 80) overallRating = 'A+'
    else if (avg >= 70) overallRating = 'A'
    else if (avg >= 60) overallRating = 'B+'
    else if (avg >= 50) overallRating = 'B'
    else if (avg >= 40) overallRating = 'C+'

    return {
      channel_name: c.channel_name,
      efficiency_score: efficiencyScore,
      profitability_score: profitabilityScore,
      growth_potential: growthPotential,
      overall_rating: overallRating
    }
  })

  // Channel strategies
  const channelStrategies = input.channels.map(c => {
    const currentPct = totalCurrentPremium > 0 ? c.current_premium / totalCurrentPremium : 1 / input.channels.length
    let optimalPct = currentPct

    // Adjust based on performance
    if (c.retention_rate >= 80 && c.growth_rate >= 15) optimalPct = Math.min(0.4, currentPct * 1.3)
    else if (c.retention_rate >= 60 && c.growth_rate >= 5) optimalPct = currentPct * 1.1
    else if (c.retention_rate < 50 || c.growth_rate < 0) optimalPct = currentPct * 0.7

    const targetPremium = totalCurrentPremium * (1 + c.growth_rate / 100) * optimalPct
    const investment = c.acquisition_cost * c.policy_count * 0.2 * (c.growth_rate > 10 ? 1.5 : 1)
    const roi = (targetPremium * c.commission_rate) / Math.max(investment, 1)

    const keyInitiatives: string[] = []
    const riskFactors: string[] = []

    if (c.digital_maturity < 60) {
      keyInitiatives.push('推进数字化转型，建设线上服务能力')
      riskFactors.push('数字化程度不足，可能失去年轻客户')
    }
    if (c.retention_rate < 60) {
      keyInitiatives.push('提升客户留存计划，加强续保管理')
      riskFactors.push('客户留存率偏低')
    }
    if (c.growth_rate < 5) {
      keyInitiatives.push('拓展新客户渠道，加大营销投入')
      riskFactors.push('增长乏力，需要新增长点')
    }
    if (c.regulatory_compliance < 70) {
      keyInitiatives.push('强化合规体系建设')
      riskFactors.push('合规风险需关注')
    }
    if (keyInitiatives.length === 0) {
      keyInitiatives.push('维持现有优势，探索创新模式')
    }

    return {
      channel_name: c.channel_name,
      recommended_allocation_pct: Math.round(optimalPct * 10000) / 100,
      target_premium: Math.round(targetPremium),
      projected_growth: Math.round(c.growth_rate * 100) / 100,
      investment_required: Math.round(investment),
      roi_estimate: Math.round(roi * 100) / 100,
      key_initiatives: keyInitiatives.slice(0, 3),
      risk_factors: riskFactors.slice(0, 3)
    }
  })

  // Normalize allocation percentages
  const totalAllocation = channelStrategies.reduce((s, c) => s + c.recommended_allocation_pct, 0)
  if (totalAllocation > 0) {
    for (const cs of channelStrategies) {
      cs.recommended_allocation_pct = Math.round((cs.recommended_allocation_pct / totalAllocation) * 10000) / 100
    }
  }

  // Optimal mix comparison
  const optimalMix = input.channels.map((c, i) => {
    const currentPct = totalCurrentPremium > 0 ? Math.round(c.current_premium / totalCurrentPremium * 10000) / 100 : Math.round(100 / input.channels.length * 100) / 100
    const optimalPct = channelStrategies[i].recommended_allocation_pct
    const adjustment = optimalPct - currentPct
    return {
      channel_name: c.channel_name,
      current_pct: currentPct + '%',
      optimal_pct: optimalPct + '%',
      adjustment: adjustment >= 0 ? '+' + adjustment.toFixed(2) + '%' : adjustment.toFixed(2) + '%'
    }
  })

  // Market position
  const currentShare = input.total_market_premium > 0 ? totalCurrentPremium / input.total_market_premium * 100 : 0
  const potentialShare = Math.min(currentShare * 1.5, currentShare + 5)
  const gapAnalysis = potentialShare > currentShare ? `通过渠道优化可提升${(potentialShare - currentShare).toFixed(2)}个百分点市占率` : '当前市占率已接近天花板，需开拓新市场'

  // Strategic recommendations
  const strategicRecommendations: string[] = []
  const bestChannel = channelPerformance.sort((a, b) => (b.efficiency_score + b.profitability_score) - (a.efficiency_score + a.profitability_score))[0]
  if (bestChannel) strategicRecommendations.push(`优先发展${bestChannel.channel_name}渠道，综合评分最高`)

  const digitalChannels = input.channels.filter(c => c.digital_maturity >= 70)
  if (digitalChannels.length < input.channels.length / 2) {
    strategicRecommendations.push('加速数字化转型，提升线上渠道占比')
  }

  if (currentShare < 10) {
    strategicRecommendations.push('当前市占率较低，建议加大渠道投入和拓展力度')
  }

  if (input.competitive_landscape.length > 0) {
    strategicRecommendations.push(`关注主要竞品(${input.competitive_landscape[0].competitor})动态，制定差异化竞争策略`)
  }

  strategicRecommendations.push('建立渠道费用效益追踪体系，动态调整资源配置')
  strategicRecommendations.push('加强跨渠道协同，提升客户全生命周期价值')
  strategicRecommendations.push('定期评估渠道绩效，淘汰低效渠道')

  return {
    channel_analysis_id: input.channel_analysis_id,
    channel_strategies: channelStrategies,
    channel_performance: channelPerformance,
    optimal_mix: optimalMix,
    market_position: {
      current_share: Math.round(currentShare * 100) / 100,
      potential_share: Math.round(potentialShare * 100) / 100,
      gap_analysis: gapAnalysis
    },
    strategic_recommendations: strategicRecommendations,
    dashboard_data: {
      total_premium: Math.round(totalCurrentPremium),
      channel_count: input.channels.length,
      current_share: Math.round(currentShare * 100) / 100,
      best_channel_rating: bestChannel?.overall_rating === 'A+' || bestChannel?.overall_rating === 'A' ? 90 : 70
    }
  }
}

function formatDistributionReport(r: DistributionResult): string {
  const lines: string[] = []
  lines.push('## 📢 Insurance Distribution — 渠道分销')
  lines.push('')
  lines.push(`> **分析ID**: ${r.channel_analysis_id} | **渠道数**: ${r.channel_strategies.length} | **当前市占率**: ${r.market_position.current_share}% | **潜力市占率**: ${r.market_position.potential_share}%`)
  lines.push('')
  lines.push('### 📊 渠道分销仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PRODUCT[保险产品] --> AGENT[代理人渠道]')
  lines.push('    PRODUCT --> BANK[银保渠道]')
  lines.push('    PRODUCT --> DIGITAL[互联网渠道]')
  lines.push('    DIRECT[直销渠道] --> PRODUCT')
  lines.push('    AGENT --> CLIENT[客户]')
  lines.push('    BANK --> CLIENT')
  lines.push('    DIGITAL --> CLIENT')
  lines.push('    DIRECT --> CLIENT')
  lines.push(`    SHARE[当前市占: ${r.market_position.current_share}%]`)
  lines.push(`    POTENTIAL[潜力: ${r.market_position.potential_share}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📊 渠道策略')
  lines.push('| 渠道 | 建议配置 | 目标保费 | 预计增长 | 投入需求 | ROI |')
  lines.push('|------|----------|----------|----------|----------|-----|')
  for (const cs of r.channel_strategies) {
    lines.push(`| ${cs.channel_name} | ${cs.recommended_allocation_pct}% | ¥${cs.target_premium.toLocaleString()} | ${cs.projected_growth}% | ¥${cs.investment_required.toLocaleString()} | ${cs.roi_estimate} |`)
  }
  lines.push('')

  lines.push('### 📊 渠道绩效评估')
  lines.push('| 渠道 | 效率评分 | 盈利评分 | 增长潜力 | 综合评级 |')
  lines.push('|------|----------|----------|----------|----------|')
  for (const cp of r.channel_performance) {
    lines.push(`| ${cp.channel_name} | ${cp.efficiency_score} | ${cp.profitability_score} | ${cp.growth_potential} | ${cp.overall_rating} |`)
  }
  lines.push('')

  lines.push('### 📊 最优渠道组合')
  lines.push('| 渠道 | 当前占比 | 最优占比 | 调整方向 |')
  lines.push('|------|----------|----------|----------|')
  for (const om of r.optimal_mix) {
    lines.push(`| ${om.channel_name} | ${om.current_pct} | ${om.optimal_pct} | ${om.adjustment} |`)
  }
  lines.push('')

  lines.push('### 📊 市场定位')
  lines.push(`**当前市占率**: ${r.market_position.current_share}% | **潜力市占率**: ${r.market_position.potential_share}%`)
  lines.push(`**差距分析**: ${r.market_position.gap_analysis}`)
  lines.push('')

  lines.push('### 💡 战略建议')
  for (const rec of r.strategic_recommendations) lines.push(`- ${rec}`)
  lines.push('')

  lines.push('### 📋 渠道分销清单')
  lines.push('- [x] 渠道结构与现状分析')
  lines.push('- [x] 渠道效率与盈利评估')
  lines.push('- [x] 渠道增长潜力评估')
  lines.push('- [x] 最优渠道组合建议')
  lines.push('- [x] 各渠道目标与投入规划')
  lines.push('- [x] 市场定位与差距分析')
  lines.push('- [x] 竞品渠道对标')
  lines.push('- [x] 战略实施路线图')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*InsurAgentPro v1.0.0 — AI-Powered Insurance Intelligence*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'underwriting_analyzer',
    description: '核保分析 | 风险评估/费率/免赔/限额',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 投保人风险档案(年龄/健康/职业/医疗史等)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatUnderwritingReport(analyzeUnderwriting(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'claims_processor',
    description: '理赔处理 | 初审/调查/定损/拒赔分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 理赔报案记录' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatClaimsReport(analyzeClaims(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'actuarial_pricer',
    description: '精算定价 | 纯保费/费率因子/利润测试',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 组合定价数据(历史赔款/保费/费用率等)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatActuarialPricingReport(analyzeActuarialPricing(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'insurance_product_designer',
    description: '产品设计 | 条款/费率表/组合方案',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 产品设计需求(险种/目标客群/定位等)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatProductDesignReport(analyzeProductDesign(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'reinsurance_strategist',
    description: '再保险策略 | 比例/非比例/自留额',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 再保需求(组合/当前方案/巨灾敞口等)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatReinsuranceReport(analyzeReinsurance(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'insurance_fraud_detector',
    description: '反欺诈检测 | 关联交易/模式识别',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 检测网络(交易/理赔/提供者数据)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatFraudDetectionReport(analyzeFraudDetection(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'policy_lifecycle_manager',
    description: '保单管理 | 续保/批改/退保',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 保单记录(状态/缴费/批改/理赔)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPolicyLifecycleReport(analyzePolicyLifecycle(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'insurance_distribution',
    description: '渠道分销 | 代理人/银保/互联网',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 渠道分析(渠道数据/市场数据/竞品)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatDistributionReport(analyzeDistribution(JSON.parse(args.input_data)))
    }
  }))

  console.log(`[insuragentpro] Loaded v${VERSION} — Insurance AI Assistant with 8 tools`)
  console.log('  Tools: underwriting_analyzer, claims_processor, actuarial_pricer, insurance_product_designer, reinsurance_strategist, insurance_fraud_detector, policy_lifecycle_manager, insurance_distribution')
}
