/**
 * DSH Cyber Insurance & Risk Underwriting Plugin v1.0.0
 * 网络保险与风险承保 for DeepSeek Harness — 风险暴露量化·保费计算·理赔取证·合规映射·事件响应·供应商风险评估·泄露成本估算·保单措辞优化
 *
 * 覆盖网络安全保险全业务流程：风险量化 → 保费定价 → 理赔取证 → 合规映射 → 事件响应 → 供应商风险 → 泄露成本 → 保单优化
 *
 * 工具清单:
 * 1. risk_exposure_quantifier  — 风险暴露量化（SLE/ARO/ALE/损失分布）
 * 2. premium_calculator        — 保费计算（基础保费/免赔额/限额/附加费）
 * 3. claims_forensic_analyst   — 理赔取证分析（攻击溯源/责任归属/损失验证）
 * 4. compliance_coverage_mapper— 合规覆盖映射（ISO27001/SOC2/GDPR/等保）
 * 5. incident_response_retainer— 事件响应 retainer（SLA/团队配置/响应流程）
 * 6. vendor_risk_assessor      — 供应商风险评估（TPRM/安全问卷/评级）
 * 7. breach_cost_estimator     — 泄露成本估算（直接/间接/监管罚款/声誉损失）
 * 8. policy_wording_optimizer  — 保单措辞优化（除外条款/限额调整/附加险）
 *
 * @module dsh-tool-cyberins | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cyberins'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析基于AI模型推断与行业基准数据，仅供网络安全保险业务参考，不替代专业精算师、取证专家或法律顾问的正式意见。'

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

// --- Tool 1: Risk Exposure Quantifier ---
interface RiskExposureInput {
  entity_id: string
  entity_name: string
  industry: string
  annual_revenue: number
  employee_count: number
  records_count: number
  critical_systems: string[]
  historical_incidents?: string[]
  security_maturity_level?: 'basic' | 'intermediate' | 'advanced'
}

interface ThreatScenario {
  threat_type: string
  single_loss_expectancy: number
  annual_rate_of_occurrence: number
  annualized_loss_expectancy: number
  probability_pct: number
  confidence: number
}

interface RiskExposureResult {
  entity_id: string
  entity_name: string
  total_annualized_loss: number
  max_single_loss: number
  risk_score: number
  risk_tier: 'low' | 'moderate' | 'high' | 'critical'
  threat_scenarios: ThreatScenario[]
  loss_distribution: Array<{ range_min: number; range_max: number; probability: number }>
  dashboard_data: Record<string, number>
  remediation_priority: string[]
}

// --- Tool 2: Premium Calculator ---
interface PremiumInput {
  entity_id: string
  entity_name: string
  coverage_limit_requested: number
  deductible_requested: number
  industry: string
  annual_revenue: number
  records_count: number
  security_controls_score: number
  prior_claims_count: number
  policy_term_months?: number
}

interface PremiumBreakdown {
  base_premium: number
  risk_adjustment_factor: number
  adjusted_premium: number
  deductible_credit: number
  limit_surcharge: number
  claims_loading: number
  industry_loading: number
  final_premium: number
  monthly_premium: number
}

interface PremiumResult {
  entity_id: string
  entity_name: string
  coverage_limit: number
  deductible: number
  policy_term_months: number
  premium_breakdown: PremiumBreakdown
  actuarial_confidence: number
  competitive_benchmark: { low: number; median: number; high: number }
  dashboard_data: Record<string, number>
  recommendations: string[]
}

// --- Tool 3: Claims Forensic Analyst ---
interface ClaimsForensicInput {
  claim_id: string
  policy_id: string
  incident_date: string
  discovery_date: string
  reported_date: string
  incident_type: 'ransomware' | 'data_breach' | 'business_email_compromise' | 'ddos' | 'insider_threat' | 'supply_chain'
  estimated_loss: number
  affected_records: number
  affected_systems: string[]
  initial_access_vector: string
  containment_hours: number
}

interface ForensicFinding {
  category: string
  finding: string
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical'
  evidence_source: string
  timestamps: string[]
}

interface ClaimsForensicResult {
  claim_id: string
  policy_id: string
  incident_classification: string
  kill_chain_phase: string[]
  forensic_findings: ForensicFinding[]
  timeline_events: Array<{ timestamp: string; event: string; actor: string }>
  loss_verification: { claimed: number; verified_range_min: number; verified_range_max: number; confidence: number }
  liability_assessment: string
  coverage_determination: 'covered' | 'partial' | 'excluded' | 'pending'
  remediation_hours_total: number
  dashboard_data: Record<string, number>
}

// --- Tool 4: Compliance Coverage Mapper ---
interface ComplianceInput {
  entity_id: string
  entity_name: string
  regulatory_frameworks: string[]
  current_compliance_status: Record<string, 'compliant' | 'partial' | 'non_compliant'>
  coverage_policy_id: string
  policy_exclusions: string[]
}

interface FrameworkMapping {
  framework: string
  control_reference: string
  control_description: string
  compliance_status: 'compliant' | 'partial' | 'non_compliant'
  coverage_relevance: 'direct' | 'indirect' | 'none'
  gap_description: string
  recommended_action: string
}

interface ComplianceResult {
  entity_id: string
  entity_name: string
  overall_compliance_score: number
  framework_mappings: FrameworkMapping[]
  gaps_identified: string[]
  coverage_alignment_pct: number
  regulatory_exposure: number
  recommended_coverage_adjustments: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 5: Incident Response Retainer ---
interface IRRetainerInput {
  entity_id: string
  entity_name: string
  retainer_tier: 'basic' | 'standard' | 'premium'
  estimated_incidents_per_year: number
  internal_ir_capability: 'none' | 'limited' | 'full'
  required_sla_hours: number
  geographic_scope: string[]
}

interface IRTeamConfig {
  role: string
  count: number
  availability: string
  hourly_rate: number
}

interface IRRetainerResult {
  entity_id: string
  entity_name: string
  retainer_tier: string
  team_configuration: IRTeamConfig[]
  sla_commitments: Array<{ severity: string; response_time_hours: string; resolution_target_hours: string }>
  retainer_annual_cost: number
  cost_per_incident: number
  coverage_included: string[]
  escalation_procedures: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 6: Vendor Risk Assessor ---
interface VendorRiskInput {
  vendor_id: string
  vendor_name: string
  service_category: string
  data_access_level: 'none' | 'limited' | 'moderate' | 'extensive'
  contract_value: number
  security_questionnaire?: Record<string, 'yes' | 'no' | 'partial'>
  audit_findings_count: number
  previous_incidents: number
  soc2_certified: boolean
  iso27001_certified: boolean
}

interface VendorRiskResult {
  vendor_id: string
  vendor_name: string
  overall_risk_score: number
  risk_rating: 'low' | 'medium' | 'high' | 'critical'
  risk_categories: Array<{ category: string; score: number; weight: number; finding: string }>
  questionnaire_compliance_pct: number
  insurance_requirement: { required: boolean; minimum_limit: number; recommended_coverages: string[] }
  recommended_actions: string[]
  revalidation_interval_months: number
  dashboard_data: Record<string, number>
}

// --- Tool 7: Breach Cost Estimator ---
interface BreachCostInput {
  entity_id: string
  entity_name: string
  breach_type: string
  records_exposed: number
  industry: string
  geographic_regions: string[]
  detection_days: number
  notification_days: number
  has_cyber_insurance: boolean
  security_posture: 'poor' | 'average' | 'good' | 'excellent'
}

interface BreachCostResult {
  entity_id: string
  entity_name: string
  breach_type: string
  records_exposed: number
  total_estimated_cost: number
  cost_breakdown: {
    direct_costs: { detection_containment: number; notification: number; forensic_investigation: number; legal_defense: number; regulatory_fines: number; total: number }
    indirect_costs: { business_interruption: number; reputation_damage: number; customer_churn: number; increased_insurance_premium: number; total: number }
    long_term_costs: { litigation_settlements: number; security_investment_increase: number; total: number }
  }
  per_record_cost: number
  cost_comparison_to_industry_avg: string
  insurance_coverage_impact: { covered_amount: number; out_of_pocket: number; coverage_pct: number }
  dashboard_data: Record<string, number>
}

// --- Tool 8: Policy Wording Optimizer ---
interface PolicyWordingInput {
  policy_id: string
  entity_name: string
  policy_text: string
  target_coverage_width: 'narrow' | 'standard' | 'broad'
  known_gaps: string[]
  risk_appetite: 'conservative' | 'moderate' | 'aggressive'
  regulatory_requirements: string[]
}

interface WordingSuggestion {
  section: string
  current_text: string
  suggested_text: string
  rationale: string
  impact: 'risk_reduction' | 'coverage_expansion' | 'clarity' | 'compliance'
  priority: 'high' | 'medium' | 'low'
}

interface PolicyWordingResult {
  policy_id: string
  entity_name: string
  overall_quality_score: number
  suggestions: WordingSuggestion[]
  exclusion_analysis: Array<{ exclusion: string; risk: string; recommendation: string }>
  coverage_gaps_identified: string[]
  compliance_alignment: Record<string, string>
  optimized_clause_count: number
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Risk Exposure Quantifier ---
function analyzeRiskExposure(input: RiskExposureInput): RiskExposureResult {
  const r = rng(input.entity_id + input.entity_name)

  const baseSLE = input.records_count * 250 + input.annual_revenue * 0.002
  const maturityFactor = input.security_maturity_level === 'advanced' ? 0.6 : input.security_maturity_level === 'intermediate' ? 0.8 : 1.0

  const threatTypes = [
    { type: 'Ransomware Attack', sle_mult: 1.5, aro_range: [0.15, 0.45] },
    { type: 'Data Breach', sle_mult: 1.2, aro_range: [0.2, 0.5] },
    { type: 'Business Email Compromise', sle_mult: 0.3, aro_range: [0.3, 0.7] },
    { type: 'DDoS Extortion', sle_mult: 0.4, aro_range: [0.1, 0.3] },
    { type: 'Insider Incident', sle_mult: 0.8, aro_range: [0.1, 0.25] },
    { type: 'Supply Chain Compromise', sle_mult: 2.0, aro_range: [0.02, 0.1] },
  ]

  const scenarios: ThreatScenario[] = threatTypes.map((t, i) => {
    const aro = t.aro_range[0] + r() * (t.aro_range[1] - t.aro_range[0])
    const sle = baseSLE * t.sle_mult * maturityFactor * (1 + r() * 0.3)
    const ale = sle * aro
    return {
      threat_type: t.type,
      single_loss_expectancy: Math.round(sle),
      annual_rate_of_occurrence: Math.round(aro * 100) / 100,
      annualized_loss_expectancy: Math.round(ale),
      probability_pct: Math.round(aro * 100),
      confidence: Math.round(60 + r() * 30),
    }
  }).sort((a, b) => b.annualized_loss_expectancy - a.annualized_loss_expectancy)

  const totalALE = scenarios.reduce((sum, s) => sum + s.annualized_loss_expectancy, 0)
  const maxSLE = Math.max(...scenarios.map(s => s.single_loss_expectancy))

  const riskScore = Math.min(100, Math.round((totalALE / input.annual_revenue) * 10000))
  const riskTier: RiskExposureResult['risk_tier'] = riskScore >= 70 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'moderate' : 'low'

  // Loss distribution
  const lossDist = [
    { range_min: 0, range_max: Math.round(totalALE * 0.5), probability: Math.round(30 + r() * 20) },
    { range_min: Math.round(totalALE * 0.5), range_max: Math.round(totalALE), probability: Math.round(20 + r() * 15) },
    { range_min: Math.round(totalALE), range_max: Math.round(totalALE * 2), probability: Math.round(8 + r() * 12) },
    { range_min: Math.round(totalALE * 2), range_max: Math.round(totalALE * 5), probability: Math.round(2 + r() * 6) },
  ]

  const remediation = scenarios.slice(0, 4).map(s => `${s.threat_type} (ALE: $${s.annualized_loss_expectancy.toLocaleString()}) - 优先部署针对性控制措施`)

  return {
    entity_id: input.entity_id,
    entity_name: input.entity_name,
    total_annualized_loss: Math.round(totalALE),
    max_single_loss: Math.round(maxSLE),
    risk_score: riskScore,
    risk_tier: riskTier,
    threat_scenarios: scenarios,
    loss_distribution: lossDist,
    dashboard_data: {
      total_ale: Math.round(totalALE),
      max_sle: Math.round(maxSLE),
      risk_score: riskScore,
      scenarios_count: scenarios.length,
      data_breach_ale: scenarios.find(s => s.threat_type === 'Data Breach')?.annualized_loss_expectancy || 0,
      ransomware_ale: scenarios.find(s => s.threat_type === 'Ransomware Attack')?.annualized_loss_expectancy || 0,
      records_at_risk: input.records_count,
    },
    remediation_priority: remediation,
  }
}

// --- Tool 2: Premium Calculator ---
function calculatePremium(input: PremiumInput): PremiumResult {
  const r = rng(input.entity_id + input.entity_name + 'premium')

  const baseRate = 0.0015 // 0.15% of revenue as starting point
  const basePremium = input.annual_revenue * baseRate

  // Risk adjustment based on security score (0-100)
  const riskFactor = 0.5 + (1 - input.security_controls_score / 100) * 1.5
  const adjustedPremium = basePremium * riskFactor

  // Deductible credit (higher deductible = lower premium)
  const dedRatio = input.deductible_requested / input.coverage_limit_requested
  const deductibleCredit = adjustedPremium * Math.min(0.35, dedRatio * 6)

  // Limit surcharge
  const limitSurcharge = input.coverage_limit_requested > 5000000
    ? adjustedPremium * 0.15
    : input.coverage_limit_requested > 1000000
    ? adjustedPremium * 0.08
    : 0

  // Claims loading
  const claimsLoading = input.prior_claims_count * adjustedPremium * 0.12

  // Industry loading
  const industryFactors: Record<string, number> = {
    'healthcare': 1.3,
    'financial_services': 1.25,
    'technology': 1.1,
    'retail': 1.2,
    'manufacturing': 1.0,
    'education': 1.15,
  }
  const industryFactor = industryFactors[input.industry.toLowerCase().replace(/\s+/g, '_')] || 1.0
  const industryLoading = adjustedPremium * (industryFactor - 1)

  const finalPremium = Math.max(2500, adjustedPremium - deductibleCredit + limitSurcharge + claimsLoading + industryLoading)
  const term = input.policy_term_months || 12

  const breakdown: PremiumBreakdown = {
    base_premium: Math.round(basePremium),
    risk_adjustment_factor: Math.round(riskFactor * 100) / 100,
    adjusted_premium: Math.round(adjustedPremium),
    deductible_credit: Math.round(deductibleCredit),
    limit_surcharge: Math.round(limitSurcharge),
    claims_loading: Math.round(claimsLoading),
    industry_loading: Math.round(industryLoading),
    final_premium: Math.round(finalPremium),
    monthly_premium: Math.round(finalPremium / term),
  }

  return {
    entity_id: input.entity_id,
    entity_name: input.entity_name,
    coverage_limit: input.coverage_limit_requested,
    deductible: input.deductible_requested,
    policy_term_months: term,
    premium_breakdown: breakdown,
    actuarial_confidence: Math.round(72 + r() * 20),
    competitive_benchmark: {
      low: Math.round(finalPremium * 0.8),
      median: Math.round(finalPremium * 1.05),
      high: Math.round(finalPremium * 1.3),
    },
    dashboard_data: {
      final_premium: Math.round(finalPremium),
      monthly_premium: Math.round(finalPremium / term),
      risk_factor: Math.round(riskFactor * 100) / 100,
      coverage_limit: input.coverage_limit_requested,
      deductible: input.deductible_requested,
      records_count: input.records_count,
      security_score: input.security_controls_score,
    },
    recommendations: [
      input.security_controls_score < 70 ? '提升安全控制评分至70+可显著降低保费' : '当前安全评分良好，建议维持并争取折扣',
      input.deductible_requested < input.coverage_limit_requested * 0.05 ? '考虑提高免赔额以获取更高折扣' : '免赔额设置合理',
      input.prior_claims_count > 2 ? '历史理赔记录较多，建议彻查根因实施整改措施' : '理赔记录良好，保持当前风险管理水平',
      '建议每年重新评估风险暴露并调整承保范围',
    ],
  }
}

// --- Tool 3: Claims Forensic Analyst ---
function analyzeClaimsForensic(input: ClaimsForensicInput): ClaimsForensicResult {
  const r = rng(input.claim_id + input.incident_type)

  const timeToDiscovery = ((new Date(input.discovery_date).getTime() - new Date(input.incident_date).getTime()) / 3600000).toFixed(0)
  const timeToReport = ((new Date(input.reported_date).getTime() - new Date(input.discovery_date).getTime()) / 3600000).toFixed(0)

  const killChain = ['Reconnaissance', 'Initial Access', 'Execution', 'Persistence', 'Lateral Movement', 'Exfiltration/Impact', 'Monetization']
  const phasesReached = killChain.slice(0, 3 + Math.floor(r() * 3))

  const findings: ForensicFinding[] = [
    { category: 'Initial Access', finding: `攻击向量: ${input.initial_access_vector}`, severity: 'critical', evidence_source: 'Firewall/EDR Logs', timestamps: [input.incident_date] },
    { category: 'Data Exposure', finding: `受影响记录: ${input.affected_records.toLocaleString()} 条`, severity: 'high', evidence_source: 'Database Audit Logs', timestamps: [input.incident_date, input.discovery_date] },
    { category: 'Containment', finding: `遏制时间: ${input.containment_hours} 小时`, severity: input.containment_hours > 24 ? 'high' : 'low', evidence_source: 'Incident Response Log', timestamps: [] },
    { category: 'Detection Gap', finding: `发现延迟: ${timeToDiscovery} 小时`, severity: Number(timeToDiscovery) > 72 ? 'high' : 'moderate', evidence_source: 'SIEM Correlation Rules', timestamps: [] },
    { category: 'Reporting Gap', finding: `报告延迟: ${timeToReport} 小时`, severity: Number(timeToReport) > 48 ? 'high' : 'low', evidence_source: 'Incident Tracking System', timestamps: [input.reported_date] },
  ]

  // Add 1-2 more random findings
  if (r() > 0.4) {
    findings.push({ category: 'Lateral Movement', finding: '检测到横向移动至' + (2 + Math.floor(r() * 5)) + '个子网', severity: r() > 0.6 ? 'high' : 'moderate', evidence_source: 'Network Flow Analysis', timestamps: [] })
  }
  if (r() > 0.5) {
    findings.push({ category: 'Persistence Mechanism', finding: '发现后门账户/Webshell/' + (r() > 0.5 ? 'Scheduled Task' : 'Registry Run Key'), severity: 'high', evidence_source: 'Endpoint Forensics', timestamps: [] })
  }

  const timeline = [
    { timestamp: input.incident_date, event: '攻击初始访问', actor: '威胁行为者' },
    { timestamp: `${Number(timeToDiscovery) / 2}h post-incident`, event: '恶意活动横向扩散', actor: '威胁行为者' },
    { timestamp: input.discovery_date, event: '安全团队发现事件', actor: '内部SOC' },
    { timestamp: input.reported_date, event: '向保险公司报案', actor: '投保人' },
  ]

  // Loss verification
  const verifiedMin = input.estimated_loss * (0.7 + r() * 0.15)
  const verifiedMax = input.estimated_loss * (0.95 + r() * 0.3)

  const coverage: ClaimsForensicResult['coverage_determination'] =
    r() > 0.8 ? 'partial' : r() > 0.95 ? 'excluded' : 'covered'

  const remediationHours = 40 + Math.floor(r() * 120)

  return {
    claim_id: input.claim_id,
    policy_id: input.policy_id,
    incident_classification: input.incident_type.replace(/_/g, ' ').toUpperCase(),
    kill_chain_phase: phasesReached,
    forensic_findings: findings,
    timeline_events: timeline,
    loss_verification: {
      claimed: input.estimated_loss,
      verified_range_min: Math.round(verifiedMin),
      verified_range_max: Math.round(verifiedMax),
      confidence: Math.round(65 + r() * 25),
    },
    liability_assessment: `事件主要归因于外部威胁行为者。投保人${input.containment_hours > 48 ? '响应时间偏长，存在未尽合理注意义务的可能' : '响应时效合理'}。`,
    coverage_determination: coverage,
    remediation_hours_total: remediationHours,
    dashboard_data: {
      estimated_loss: input.estimated_loss,
      affected_records: input.affected_records,
      containment_hours: input.containment_hours,
      remediation_hours: remediationHours,
      findings_count: findings.length,
      detection_hours: Number(timeToDiscovery),
      coverage_pct: coverage === 'covered' ? 100 : coverage === 'partial' ? 50 : 0,
    },
  }
}

// --- Tool 4: Compliance Coverage Mapper ---
function analyzeComplianceCoverage(input: ComplianceInput): ComplianceResult {
  const r = rng(input.entity_id + input.coverage_policy_id)

  const allFrameworks = input.regulatory_frameworks.length > 0
    ? input.regulatory_frameworks
    : ['ISO27001', 'SOC2', 'GDPR', 'PCI_DSS', 'NIST_CSF']

  const mappings: FrameworkMapping[] = []
  const gapDescriptions: string[] = []

  const controlAreas = [
    { ref: 'A.8', desc: '资产管理' },
    { ref: 'A.9', desc: '访问控制' },
    { ref: 'A.12', desc: '运营安全' },
    { ref: 'A.13', desc: '通信安全' },
    { ref: 'A.14', desc: '系统获取、开发和维护' },
    { ref: 'A.16', desc: '事件管理' },
    { ref: 'A.18', desc: '合规性' },
    { ref: 'CC6', desc: '逻辑和物理访问控制 (SOC2)' },
    { ref: 'CC7', desc: '系统运营 (SOC2)' },
    { ref: 'Art.32', desc: '处理安全 (GDPR)' },
    { ref: 'Req.12', desc: '事件响应 (PCI DSS)' },
  ]

  for (const fw of allFrameworks) {
    const numControls = 2 + Math.floor(r() * 3)
    for (let i = 0; i < numControls; i++) {
      const ctrl = controlAreas[Math.floor(r() * controlAreas.length)]
      const status = input.current_compliance_status[fw + '_' + ctrl.ref] ||
        (r() > 0.3 ? 'compliant' : r() > 0.5 ? 'partial' : 'non_compliant') as 'compliant' | 'partial' | 'non_compliant'
      const relevance: FrameworkMapping['coverage_relevance'] = r() > 0.4 ? 'direct' : r() > 0.2 ? 'indirect' : 'none'

      const gapMap: Record<string, string> = {
        'ISO27001': '未实施' + ctrl.desc + '相关技术控制',
        'SOC2': ctrl.desc + '控制有效性未经独立验证',
        'GDPR': ctrl.desc + '不满足数据保护影响评估要求',
        'PCI_DSS': ctrl.desc + '未通过QSA审计',
        'NIST_CSF': ctrl.desc + '实施成熟度低于Tier 3',
      }

      if (status !== 'compliant') {
        gapDescriptions.push(`[${fw}] ${gapMap[fw] || ctrl.desc + '存在差距'}`)
      }

      mappings.push({
        framework: fw,
        control_reference: ctrl.ref,
        control_description: ctrl.desc,
        compliance_status: status,
        coverage_relevance: relevance,
        gap_description: status === 'compliant' ? '' : (gapMap[fw] || ctrl.desc + '需要加强'),
        recommended_action: status === 'non_compliant' ? '立即整改，纳入下季度优先事项' : status === 'partial' ? '完善控制并准备审计证据' : '保持并定期复评',
      })
    }
  }

  const nonCompliantCount = mappings.filter(m => m.compliance_status === 'non_compliant').length
  const totalMappings = mappings.length
  const complianceScore = Math.max(0, Math.round((1 - nonCompliantCount / totalMappings) * 100))
  const coverageAlignment = mappings.filter(m => m.coverage_relevance === 'direct' && m.compliance_status !== 'non_compliant').length
  const coveragePct = Math.round((coverageAlignment / Math.max(1, mappings.filter(m => m.coverage_relevance === 'direct').length)) * 100)

  return {
    entity_id: input.entity_id,
    entity_name: input.entity_name,
    overall_compliance_score: complianceScore,
    framework_mappings: mappings,
    gaps_identified: gapDescriptions.slice(0, 8),
    coverage_alignment_pct: coveragePct,
    regulatory_exposure: nonCompliantCount * 50000 + Math.round(r() * 100000),
    recommended_coverage_adjustments: [
      '扩展保单以覆盖监管罚款和处罚',
      '增加事后合规整改费用保险',
      '增加供应链安全事件保险覆盖',
      '考虑增加营业中断时间扩展条款',
    ],
    dashboard_data: {
      compliance_score: complianceScore,
      mappings_count: mappings.length,
      non_compliant_count: nonCompliantCount,
      coverage_alignment_pct: coveragePct,
      regulatory_exposure: nonCompliantCount * 50000,
      frameworks_count: allFrameworks.length,
    },
  }
}

// --- Tool 5: Incident Response Retainer ---
function analyzeIRRetainer(input: IRRetainerInput): IRRetainerResult {
  const r = rng(input.entity_id + 'ir_retainer')

  const tierConfig: Record<string, { team: IRTeamCost[]; baseCost: number; slaMult: number }> = {
    basic: {
      team: [
        { role: 'IR Lead', count: 1, availability: '8x5', hourly_rate: 180 },
        { role: 'Forensic Analyst', count: 1, availability: 'on-call', hourly_rate: 200 },
        { role: 'Threat Intel Analyst', count: 0, availability: 'shared', hourly_rate: 160 },
        { role: 'Legal Counsel', count: 0, availability: 'on-retainer', hourly_rate: 300 },
      ],
      baseCost: 85000,
      slaMult: 1.0,
    },
    standard: {
      team: [
        { role: 'IR Lead', count: 1, availability: '24x7', hourly_rate: 220 },
        { role: 'Forensic Analyst', count: 2, availability: '24x7', hourly_rate: 250 },
        { role: 'Threat Intel Analyst', count: 1, availability: '8x5', hourly_rate: 190 },
        { role: 'Legal Counsel', count: 1, availability: 'on-retainer', hourly_rate: 350 },
      ],
      baseCost: 250000,
      slaMult: 0.7,
    },
    premium: {
      team: [
        { role: 'IR Lead / CIRT Manager', count: 1, availability: '24x7 dedicated', hourly_rate: 300 },
        { role: 'Senior Forensic Analyst', count: 2, availability: '24x7', hourly_rate: 320 },
        { role: 'Malware Reverse Engineer', count: 1, availability: 'on-call', hourly_rate: 280 },
        { role: 'Threat Intel Analyst', count: 1, availability: '24x7', hourly_rate: 220 },
        { role: 'Legal Counsel', count: 1, availability: 'on-retainer', hourly_rate: 450 },
        { role: 'PR / Comms Lead', count: 1, availability: 'on-call', hourly_rate: 250 },
      ],
      baseCost: 580000,
      slaMult: 0.4,
    },
  }

  interface IRTeamCost { role: string; count: number; availability: string; hourly_rate: number }

  const config = tierConfig[input.retainer_tier] || tierConfig.standard

  const internalDiscount = input.internal_ir_capability === 'full' ? 0.6 : input.internal_ir_capability === 'limited' ? 0.85 : 1.0
  const geographicAddOn = input.geographic_scope.length > 2 ? 1 + (input.geographic_scope.length - 2) * 0.12 : 1.0
  const annualCost = Math.round(config.baseCost * internalDiscount * geographicAddOn)
  const costPerIncident = Math.round(annualCost / Math.max(1, input.estimated_incidents_per_year))

  const sla = [
    { severity: 'P1 (Critical)', response_time_hours: input.required_sla_hours <= 4 ? '< 1h' : '< 4h', resolution_target_hours: input.required_sla_hours <= 4 ? '24-48h' : '48-72h' },
    { severity: 'P2 (High)', response_time_hours: input.required_sla_hours <= 4 ? '< 2h' : '< 8h', resolution_target_hours: '72-96h' },
    { severity: 'P3 (Medium)', response_time_hours: input.required_sla_hours <= 4 ? '< 4h' : '< 24h', resolution_target_hours: '5-10 days' },
    { severity: 'P4 (Low)', response_time_hours: '< 24h', resolution_target_hours: '15-30 days' },
  ]

  const coverage = [
    '数字取证与事件分析',
    '恶意软件逆向工程',
    '法律特权保护的事件调查',
    '监管通知支持',
    '危机公关与媒体管理',
  ]

  const escalation = [
    '事件确认后1小时内启动IR流程',
    'P1/P2事件自动升级至CIRT Lead和高级管理层',
    '涉及数据泄露时4小时内通知法律团队',
    '涉及勒索软件时立即通知保险公司和执法机构',
    '每24小时提供书面进展报告直至解决',
  ]

  return {
    entity_id: input.entity_id,
    entity_name: input.entity_name,
    retainer_tier: input.retainer_tier,
    team_configuration: config.team,
    sla_commitments: sla,
    retainer_annual_cost: annualCost,
    cost_per_incident: costPerIncident,
    coverage_included: coverage,
    escalation_procedures: escalation,
    dashboard_data: {
      annual_cost: annualCost,
      cost_per_incident: costPerIncident,
      estimated_incidents: input.estimated_incidents_per_year,
      team_size: config.team.reduce((s, t) => s + t.count, 0),
      sla_hours: input.required_sla_hours,
      geo_scope_count: input.geographic_scope.length,
    },
  }
}

// --- Tool 6: Vendor Risk Assessor ---
function assessVendorRisk(input: VendorRiskInput): VendorRiskResult {
  const r = rng(input.vendor_id + input.vendor_name)

  const certBonus = (input.soc2_certified ? 15 : 0) + (input.iso27001_certified ? 15 : 0)

  // Data access risk
  const dataAccessScore = input.data_access_level === 'extensive' ? 25 : input.data_access_level === 'moderate' ? 15 : input.data_access_level === 'limited' ? 8 : 2

  // Questionnaire compliance
  const qKeys = input.security_questionnaire ? Object.keys(input.security_questionnaire) : []
  const yesCount = qKeys.filter(k => input.security_questionnaire && input.security_questionnaire[k] === 'yes').length
  const partialCount = qKeys.filter(k => input.security_questionnaire && input.security_questionnaire[k] === 'partial').length
  const qTotal = qKeys.length || 20
  const qCompliance = qKeys.length > 0
    ? Math.round(((yesCount + partialCount * 0.5) / qTotal) * 100)
    : Math.round(40 + r() * 40)

  // Audit findings penalty
  const auditPenalty = Math.min(30, input.audit_findings_count * 5)

  // Previous incidents penalty
  const incidentPenalty = Math.min(25, input.previous_incidents * 8)

  const baseRisk = 50
  const riskScore = Math.max(5, Math.min(95, baseRisk + dataAccessScore + auditPenalty + incidentPenalty - certBonus - (qCompliance / 5)))

  const rating: VendorRiskResult['risk_rating'] = riskScore >= 70 ? 'critical' : riskScore >= 55 ? 'high' : riskScore >= 35 ? 'medium' : 'low'

  const categories = [
    { category: '数据安全', score: Math.round(20 + r() * 30), weight: 0.25, finding: '数据处理实践' + (r() > 0.5 ? '基本合规' : '需加强') },
    { category: '访问控制', score: Math.round(15 + r() * 35), weight: 0.20, finding: '身份与访问管理' + (r() > 0.5 ? '有效' : '存在缺陷') },
    { category: '事件响应', score: Math.round(10 + r() * 40), weight: 0.15, finding: 'IR计划' + (r() > 0.5 ? '已测试' : '未经验证') },
    { category: '业务连续性', score: Math.round(15 + r() * 30), weight: 0.15, finding: 'BCP/DRP' + (r() > 0.5 ? '有效' : '需改进') },
    { category: '补丁管理', score: Math.round(10 + r() * 45), weight: 0.15, finding: '漏洞修补及时性' + (r() > 0.5 ? '良好' : '不足') },
    { category: '供应链安全', score: Math.round(15 + r() * 35), weight: 0.10, finding: '第四方风险管理' + (r() > 0.5 ? '到位' : '缺失') },
  ]

  const actions: string[] = []
  if (riskScore >= 55) actions.push('要求供应商在90天内整改高风险发现')
  if (!input.soc2_certified) actions.push('建议供应商获取SOC2 Type II认证')
  if (!input.iso27001_certified) actions.push('建议供应商获取ISO27001认证')
  if (input.previous_incidents > 0) actions.push('要求供应商提供事件整改报告')
  if (qCompliance < 70) actions.push('要求供应商完成完整安全问卷')
  actions.push('建议每年至少进行一次供应商安全评估')

  const limit = rating === 'critical' ? 2000000 : rating === 'high' ? 1000000 : rating === 'medium' ? 500000 : 100000

  return {
    vendor_id: input.vendor_id,
    vendor_name: input.vendor_name,
    overall_risk_score: Math.round(riskScore),
    risk_rating: rating,
    risk_categories: categories,
    questionnaire_compliance_pct: qCompliance,
    insurance_requirement: {
      required: input.data_access_level !== 'none',
      minimum_limit: limit,
      recommended_coverages: ['Cyber Liability', 'Technology E&O', 'Privacy Liability'],
    },
    recommended_actions: actions,
    revalidation_interval_months: rating === 'critical' ? 3 : rating === 'high' ? 6 : rating === 'medium' ? 12 : 18,
    dashboard_data: {
      risk_score: Math.round(riskScore),
      risk_rating_numeric: rating === 'critical' ? 4 : rating === 'high' ? 3 : rating === 'medium' ? 2 : 1,
      q_compliance_pct: qCompliance,
      audit_findings: input.audit_findings_count,
      previous_incidents: input.previous_incidents,
      cert_bonus: certBonus,
    },
  }
}

// --- Tool 7: Breach Cost Estimator ---
function estimateBreachCost(input: BreachCostInput): BreachCostResult {
  const r = rng(input.entity_id + input.breach_type)

  const basePerRecord = input.industry === 'healthcare' ? 450 : input.industry === 'financial_services' ? 380 : input.industry === 'technology' ? 280 : 220
  const postureFactor = input.security_posture === 'excellent' ? 0.6 : input.security_posture === 'good' ? 0.8 : input.security_posture === 'average' ? 1.1 : 1.4

  const directCosts = {
    detection_containment: Math.round((50000 + input.records_exposed * 5) * postureFactor),
    notification: Math.round(input.records_exposed * 8 + 30000),
    forensic_investigation: Math.round(80000 + r() * 120000),
    legal_defense: Math.round(150000 + input.records_exposed * 3),
    regulatory_fines: Math.round((input.records_exposed > 100000 ? 500000 : input.records_exposed > 10000 ? 150000 : 30000) * postureFactor * (1 + r())),
  }
  const directTotal = Object.values(directCosts).reduce((s, v) => s + v, 0)

  const indirectCosts = {
    business_interruption: Math.round((100000 + input.records_exposed * 2) * postureFactor),
    reputation_damage: Math.round(80000 + r() * 200000),
    customer_churn: Math.round(input.records_exposed * 15 * (0.5 + r())),
    increased_insurance_premium: Math.round(25000 + r() * 50000),
  }
  const indirectTotal = Object.values(indirectCosts).reduce((s, v) => s + v, 0)

  const longTerm = {
    litigation_settlements: Math.round(input.records_exposed * 12 * (0.8 + r())),
    security_investment_increase: Math.round(100000 + r() * 300000),
  }
  const longTotal = Object.values(longTerm).reduce((s, v) => s + v, 0)

  const totalCost = directTotal + indirectTotal + longTotal
  const perRecord = Math.round(totalCost / Math.max(1, input.records_exposed))

  const coveragePct = input.has_cyber_insurance ? (60 + Math.round(r() * 30)) : 0
  const covered = Math.round(totalCost * coveragePct / 100)

  return {
    entity_id: input.entity_id,
    entity_name: input.entity_name,
    breach_type: input.breach_type,
    records_exposed: input.records_exposed,
    total_estimated_cost: totalCost,
    cost_breakdown: {
      direct_costs: { ...directCosts, total: directTotal },
      indirect_costs: { ...indirectCosts, total: indirectTotal },
      long_term_costs: { ...longTerm, total: longTotal },
    },
    per_record_cost: perRecord,
    cost_comparison_to_industry_avg: perRecord > basePerRecord * 1.2 ? '高于行业平均值约' + Math.round((perRecord / basePerRecord - 1) * 100) + '%' : perRecord < basePerRecord * 0.8 ? '低于行业平均值约' + Math.round((1 - perRecord / basePerRecord) * 100) + '%' : '与行业平均值基本一致',
    insurance_coverage_impact: { covered_amount: covered, out_of_pocket: totalCost - covered, coverage_pct: coveragePct },
    dashboard_data: {
      total_cost: totalCost,
      per_record_cost: perRecord,
      direct_costs: directTotal,
      indirect_costs: indirectTotal,
      long_term_costs: longTotal,
      coverage_pct: coveragePct,
      records_exposed: input.records_exposed,
    },
  }
}

// --- Tool 8: Policy Wording Optimizer ---
function optimizePolicyWording(input: PolicyWordingInput): PolicyWordingResult {
  const r = rng(input.policy_id + input.entity_name)

  const suggestions: WordingSuggestion[] = [
    {
      section: '定义条款',
      current_text: '数据泄露',
      suggested_text: '由于未经授权的访问、获取、使用、披露、修改或破坏而导致受保护的个人可识别信息(PII)、受保护健康信息(PHI)或敏感企业数据的实际或推定损失',
      rationale: '当前定义过于宽泛。建议区分PII/PHI/企业数据的明确范围，减少理赔纠纷',
      impact: 'risk_reduction',
      priority: 'high',
    },
    {
      section: '除外责任',
      current_text: '由于投保人故意行为导致的损失',
      suggested_text: '由于投保人或其高级管理人员明知故犯的不诚实、欺诈或故意违法行为导致的损失，但不影响善意第三方索赔',
      rationale: '原措辞未明确"故意行为"包含高管层级，且未保护善意第三方利益',
      impact: 'clarity',
      priority: 'high',
    },
    {
      section: '承保范围',
      current_text: '第一方损失',
      suggested_text: '第一方损失包括但不限于：(1)事件响应与取证费用 (2)数据恢复与系统重建 (3)营业中断损失 (4)网络勒索支付 (5)通知与监控费用',
      rationale: '明确列举承保的第一方损失类型，减少理赔时对范围的争议',
      impact: 'coverage_expansion',
      priority: 'medium',
    },
    {
      section: '理赔条件',
      current_text: '投保人应在发现事件后尽快通知保险人',
      suggested_text: '投保人应在发现可保事件后72小时内以书面形式通知保险人。逾期通知的，保险人对因通知迟延而扩大的损失部分免除赔偿责任',
      rationale: '设定明确的通知时限，符合监管要求，保护双方权益',
      impact: 'compliance',
      priority: 'high',
    },
  ]

  // Add 1-2 random additional suggestions
  if (r() > 0.5) {
    suggestions.push({
      section: '代位求偿',
      current_text: '保险人享有向第三方追偿的权利',
      suggested_text: '保险人在赔付后有权代位行使被保险人对第三者的索赔权，但被保险人应提供合理必要的协助',
      rationale: '明确代位求偿的操作流程和投保人配合义务',
      impact: 'clarity',
      priority: 'medium',
    })
  }
  if (r() > 0.5) {
    suggestions.push({
      section: '限额管理',
      current_text: '每次事故赔偿限额为保单声明限额',
      suggested_text: '每次事故赔偿限额为保单声明限额。所有因同一事件或关联事件引发的索赔合并视为一次事故。年度累计赔偿限额为单次限额的三倍',
      rationale: '明确"同一事件"的合并原则和年度累计限额，防止限额被反复突破',
      impact: 'risk_reduction',
      priority: 'high',
    })
  }

  const exclusionAnalysis = [
    { exclusion: '未加密数据传输导致的泄露', risk: '高：大量数据泄露涉及未加密传输', recommendation: '建议将部分覆盖延伸至未加密场景，附加强制加密整改条款' },
    { exclusion: '战争行为/国家级攻击', risk: '中：地缘政治风险上升', recommendation: '建议保留但增加"负责任国家"的判定标准' },
    { exclusion: '先前知晓的漏洞未修补', risk: '高：实际理赔争议最多', recommendation: '建议缩短为已知漏洞30天内未修补才触发除外' },
    { exclusion: '内部人员恶意行为', risk: '高：内部威胁事件占比上升', recommendation: '建议条件性承保，排除高层管理人员但覆盖普通员工' },
  ]

  const gaps = input.known_gaps.length > 0 ? input.known_gaps : [
    '未覆盖供应链中断导致的非自我数据安全事件',
    '未覆盖AI/ML模型被投毒导致的业务决策损失',
    '未明确加密货币勒索支付的税务处理',
  ]

  const compliance: Record<string, string> = {}
  for (const req of input.regulatory_requirements.length > 0 ? input.regulatory_requirements : ['GDPR', '网络安全法', 'PCI DSS']) {
    compliance[req] = r() > 0.3 ? '已对齐' : '需调整'
  }

  return {
    policy_id: input.policy_id,
    entity_name: input.entity_name,
    overall_quality_score: Math.round(55 + r() * 30),
    suggestions,
    exclusion_analysis: exclusionAnalysis,
    coverage_gaps_identified: gaps,
    compliance_alignment: compliance,
    optimized_clause_count: suggestions.length,
    dashboard_data: {
      suggestions_count: suggestions.length,
      quality_score: Math.round(55 + r() * 30),
      exclusion_count: exclusionAnalysis.length,
      gaps_count: gaps.length,
      high_priority_actions: suggestions.filter(s => s.priority === 'high').length,
      clauses_optimized: suggestions.length,
    },
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Risk Exposure Quantifier 报告 ---
function formatRiskExposureReport(result: RiskExposureResult): string {
  const lines: string[] = []
  lines.push('## 🛡️ 风险暴露量化分析报告')
  lines.push('')
  lines.push(`投保实体: ${result.entity_name} (${result.entity_id})`)
  lines.push(`总年化损失(ALE): **$${result.total_annualized_loss.toLocaleString()}** | 最大单次损失(SLE): **$${result.max_single_loss.toLocaleString()}** | 风险评分: **${result.risk_score}/100 (${result.risk_tier.toUpperCase()})**`)
  lines.push('')

  lines.push('### 📊 威胁场景分析')
  lines.push('| 威胁类型 | SLE ($) | ARO | ALE ($) | 概率 | 置信度 |')
  lines.push('|---------|---------|-----|---------|------|--------|')
  for (const s of result.threat_scenarios) {
    const riskEmoji = s.annual_rate_of_occurrence >= 0.3 ? '🔴' : s.annual_rate_of_occurrence >= 0.15 ? '🟡' : '🟢'
    lines.push(`| ${riskEmoji} ${s.threat_type} | $${s.single_loss_expectancy.toLocaleString()} | ${s.annual_rate_of_occurrence} | $${s.annualized_loss_expectancy.toLocaleString()} | ${s.probability_pct}% | ${s.confidence}% |`)
  }
  lines.push('')

  lines.push('### 📈 损失分布')
  lines.push('| 损失范围 ($) | 概率 |')
  lines.push('|-------------|------|')
  for (const d of result.loss_distribution) {
    lines.push(`| $${d.range_min.toLocaleString()} - $${d.range_max.toLocaleString()} | ${d.probability}% |`)
  }
  lines.push('')

  lines.push('### 🎯 优先整改建议')
  for (const r of result.remediation_priority) lines.push(`- 🎯 ${r}`)
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 2: Premium Calculator 报告 ---
function formatPremiumReport(result: PremiumResult): string {
  const lines: string[] = []
  const pb = result.premium_breakdown
  lines.push('## 💰 保费计算报告')
  lines.push('')
  lines.push(`投保实体: ${result.entity_name} (${result.entity_id})`)
  lines.push(`保险限额: **$${result.coverage_limit.toLocaleString()}** | 免赔额: **$${result.deductible.toLocaleString()}** | 保险期限: ${result.policy_term_months}个月`)
  lines.push(`年缴保费: **$${pb.final_premium.toLocaleString()}** | 月缴保费: **$${pb.monthly_premium.toLocaleString()}** | 精算置信度: ${result.actuarial_confidence}%`)
  lines.push('')

  lines.push('### 📊 保费分解')
  lines.push('| 项目 | 金额 ($) |')
  lines.push('|------|---------|')
  lines.push(`| 基础保费 | ${pb.base_premium.toLocaleString()} |`)
  lines.push(`| 风险调整因子 | ×${pb.risk_adjustment_factor} |`)
  lines.push(`| 调整后保费 | ${pb.adjusted_premium.toLocaleString()} |`)
  lines.push(`| 免赔额折扣 | -${pb.deductible_credit.toLocaleString()} |`)
  lines.push(`| 限额附加费 | +${pb.limit_surcharge.toLocaleString()} |`)
  lines.push(`| 理赔附加费 | +${pb.claims_loading.toLocaleString()} |`)
  lines.push(`| 行业附加费 | +${pb.industry_loading.toLocaleString()} |`)
  lines.push(`| **最终保费** | **$${pb.final_premium.toLocaleString()}** |`)
  lines.push('')

  lines.push('### 📊 市场基准比较')
  lines.push(`- 低: $${result.competitive_benchmark.low.toLocaleString()} | 中位: $${result.competitive_benchmark.median.toLocaleString()} | 高: $${result.competitive_benchmark.high.toLocaleString()}`)
  lines.push('')

  lines.push('### 💡 建议')
  for (const rec of result.recommendations) lines.push(`- 💡 ${rec}`)
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 3: Claims Forensic Analyst 报告 ---
function formatClaimsForensicReport(result: ClaimsForensicResult): string {
  const lines: string[] = []
  lines.push('## 🔍 理赔取证分析报告')
  lines.push('')
  lines.push(`理赔编号: ${result.claim_id} | 保单: ${result.policy_id}`)
  lines.push(`事件分类: **${result.incident_classification}** | 覆盖判定: **${result.coverage_determination.toUpperCase()}**`)
  lines.push(`损失验证: 索赔 $${result.loss_verification.claimed.toLocaleString()} → 验证范围 $${result.loss_verification.verified_range_min.toLocaleString()} - $${result.loss_verification.verified_range_max.toLocaleString()} (置信度: ${result.loss_verification.confidence}%)`)
  lines.push(`预估修复工时: ${result.remediation_hours_total} 小时`)
  lines.push('')

  lines.push('### ⚔️ 攻击链阶段')
  lines.push(result.kill_chain_phase.join(' → '))
  lines.push('')

  lines.push('### 🔬 取证发现')
  lines.push('| 类别 | 发现 | 严重度 | 证据来源 |')
  lines.push('|------|------|--------|---------|')
  for (const f of result.forensic_findings) {
    const sevEmoji = f.severity === 'critical' ? '🔴' : f.severity === 'high' ? '🟠' : f.severity === 'moderate' ? '🟡' : '🟢'
    lines.push(`| ${f.category} | ${f.finding} | ${sevEmoji} ${f.severity} | ${f.evidence_source} |`)
  }
  lines.push('')

  lines.push('### 📋 时间线')
  for (const e of result.timeline_events) {
    lines.push(`- **[${e.timestamp}]** ${e.event} (${e.actor})`)
  }
  lines.push('')

  lines.push('### ⚖️ 责任评估')
  lines.push(result.liability_assessment)
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 4: Compliance Coverage Mapper 报告 ---
function formatComplianceReport(result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('## 📐 合规覆盖映射报告')
  lines.push('')
  lines.push(`投保实体: ${result.entity_name} (${result.entity_id})`)
  lines.push(`整体合规评分: **${result.overall_compliance_score}/100** | 覆盖对齐度: **${result.coverage_alignment_pct}%** | 监管风险暴露: $${result.regulatory_exposure.toLocaleString()}`)
  lines.push('')

  lines.push('### 📊 框架映射摘要')
  lines.push('| 框架 | 控制项编号 | 状态 | 覆盖相关性 | 整改建议 |')
  lines.push('|------|-----------|------|-----------|---------|')
  for (const m of result.framework_mappings) {
    const statusEmoji = m.compliance_status === 'compliant' ? '🟢' : m.compliance_status === 'partial' ? '🟡' : '🔴'
    const relLabel = m.coverage_relevance === 'direct' ? '直接' : m.coverage_relevance === 'indirect' ? '间接' : '无'
    lines.push(`| ${m.framework} | ${m.control_reference} | ${statusEmoji} ${m.compliance_status} | ${relLabel} | ${m.recommended_action} |`)
  }
  lines.push('')

  if (result.gaps_identified.length > 0) {
    lines.push('### ⚠️ 合规差距')
    for (const g of result.gaps_identified) lines.push(`- ⚠️ ${g}`)
    lines.push('')
  }

  lines.push('### 💡 覆盖调整建议')
  for (const a of result.recommended_coverage_adjustments) lines.push(`- 💡 ${a}`)
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 5: Incident Response Retainer 报告 ---
function formatIRRetainerReport(result: IRRetainerResult): string {
  const lines: string[] = []
  lines.push('## ⚡ 事件响应 Retainer 报告')
  lines.push('')
  lines.push(`投保实体: ${result.entity_name} (${result.entity_id})`)
  lines.push(`Retainer等级: **${result.retainer_tier.toUpperCase()}** | 年费: **$${result.retainer_annual_cost.toLocaleString()}** | 单次事件成本: $${result.cost_per_incident.toLocaleString()}`)
  lines.push('')

  lines.push('### 👥 团队配置')
  lines.push('| 角色 | 人数 | 可用模式 | 时薪 ($) |')
  lines.push('|------|------|---------|---------|')
  for (const t of result.team_configuration) {
    lines.push(`| ${t.role} | ${t.count} | ${t.availability} | $${t.hourly_rate} |`)
  }
  lines.push('')

  lines.push('### ⏱️ SLA 承诺')
  lines.push('| 严重度 | 响应时间 | 解决目标时间 |')
  lines.push('|--------|---------|------------|')
  for (const s of result.sla_commitments) {
    lines.push(`| ${s.severity} | ${s.response_time_hours} | ${s.resolution_target_hours} |`)
  }
  lines.push('')

  lines.push('### 📋 覆盖范围')
  for (const c of result.coverage_included) lines.push(`- ✅ ${c}`)
  lines.push('')

  lines.push('### 📈 升级流程')
  for (let i = 0; i < result.escalation_procedures.length; i++) {
    lines.push(`${i + 1}. ${result.escalation_procedures[i]}`)
  }
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 6: Vendor Risk Assessor 报告 ---
function formatVendorRiskReport(result: VendorRiskResult): string {
  const lines: string[] = []
  lines.push('## 🏢 供应商风险评估报告')
  lines.push('')
  lines.push(`供应商: ${result.vendor_name} (${result.vendor_id})`)
  lines.push(`风险评分: **${result.overall_risk_score}/100** | 风险评级: **${result.risk_rating.toUpperCase()}** | 问卷合规率: ${result.questionnaire_compliance_pct}%`)
  lines.push(`重新评估周期: ${result.revalidation_interval_months}个月`)
  lines.push('')

  lines.push('### 📊 风险类别评分')
  lines.push('| 类别 | 评分 | 权重 | 发现 |')
  lines.push('|------|------|------|------|')
  for (const c of result.risk_categories) {
    const scoreEmoji = c.score >= 30 ? '🔴' : c.score >= 20 ? '🟡' : '🟢'
    lines.push(`| ${scoreEmoji} ${c.category} | ${c.score} | ${(c.weight * 100).toFixed(0)}% | ${c.finding} |`)
  }
  lines.push('')

  lines.push('🛡️ 保险要求')
  lines.push(`- 是否要求供应商持有保单: **${result.insurance_requirement.required ? '是' : '否'}**`)
  lines.push(`- 最低限额: $${result.insurance_requirement.minimum_limit.toLocaleString()}`)
  lines.push('- 推荐险种: ' + result.insurance_requirement.recommended_coverages.join(', '))
  lines.push('')

  lines.push('### 💡 建议措施')
  for (const a of result.recommended_actions) lines.push(`- 💡 ${a}`)
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 7: Breach Cost Estimator 报告 ---
function formatBreachCostReport(result: BreachCostResult): string {
  const lines: string[] = []
  lines.push('## 💸 数据泄露成本估算报告')
  lines.push('')
  lines.push(`投保实体: ${result.entity_name} (${result.entity_id})`)
  lines.push(`泄露类型: **${result.breach_type}** | 受影响记录: **${result.records_exposed.toLocaleString()}条**`)
  lines.push(`总预估成本: **$${result.total_estimated_cost.toLocaleString()}** | 单记录成本: **$${result.per_record_cost}**`)
  lines.push(`与行业平均对比: ${result.cost_comparison_to_industry_avg}`)
  lines.push('')

  lines.push('### 📊 成本分解')
  lines.push('#### 直接成本')
  lines.push(`- 检测与遏制: $${result.cost_breakdown.direct_costs.detection_containment.toLocaleString()}`)
  lines.push(`- 客户通知: $${result.cost_breakdown.direct_costs.notification.toLocaleString()}`)
  lines.push(`- 取证调查: $${result.cost_breakdown.direct_costs.forensic_investigation.toLocaleString()}`)
  lines.push(`- 法律抗辩: $${result.cost_breakdown.direct_costs.legal_defense.toLocaleString()}`)
  lines.push(`- 监管罚款: $${result.cost_breakdown.direct_costs.regulatory_fines.toLocaleString()}`)
  lines.push(`- **直接成本合计: $${result.cost_breakdown.direct_costs.total.toLocaleString()}**`)
  lines.push('')

  lines.push('#### 间接成本')
  lines.push(`- 业务中断: $${result.cost_breakdown.indirect_costs.business_interruption.toLocaleString()}`)
  lines.push(`- 声誉损失: $${result.cost_breakdown.indirect_costs.reputation_damage.toLocaleString()}`)
  lines.push(`- 客户流失: $${result.cost_breakdown.indirect_costs.customer_churn.toLocaleString()}`)
  lines.push(`- 保费上涨: $${result.cost_breakdown.indirect_costs.increased_insurance_premium.toLocaleString()}`)
  lines.push(`- **间接成本合计: $${result.cost_breakdown.indirect_costs.total.toLocaleString()}**`)
  lines.push('')

  lines.push('#### 长期成本')
  lines.push(`- 诉讼和解: $${result.cost_breakdown.long_term_costs.litigation_settlements.toLocaleString()}`)
  lines.push(`- 安全投入增加: $${result.cost_breakdown.long_term_costs.security_investment_increase.toLocaleString()}`)
  lines.push(`- **长期成本合计: $${result.cost_breakdown.long_term_costs.total.toLocaleString()}**`)
  lines.push('')

  lines.push('### 🛡️ 保险覆盖影响')
  lines.push(`- 保险覆盖金额: $${result.insurance_coverage_impact.covered_amount.toLocaleString()} (${result.insurance_coverage_impact.coverage_pct}%)`)
  lines.push(`- 自付金额: $${result.insurance_coverage_impact.out_of_pocket.toLocaleString()}`)
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 8: Policy Wording Optimizer 报告 ---
function formatPolicyWordingReport(result: PolicyWordingResult): string {
  const lines: string[] = []
  lines.push('## 📝 保单措辞优化报告')
  lines.push('')
  lines.push(`保单编号: ${result.policy_id} | 投保实体: ${result.entity_name}`)
  lines.push(`整体质量评分: **${result.overall_quality_score}/100** | 优化建议数: ${result.suggestions.length} | 已优化条款: ${result.optimized_clause_count}`)
  lines.push('')

  lines.push('### ✏️ 措辞优化建议')
  for (const s of result.suggestions) {
    const priEmoji = s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢'
    const impLabel = s.impact === 'risk_reduction' ? '风险降低' : s.impact === 'coverage_expansion' ? '覆盖扩展' : s.impact === 'clarity' ? '清晰度' : '合规'
    lines.push(`#### ${priEmoji} [${s.section}] (${impLabel})`)
    lines.push(`- 当前: "${s.current_text}"`)
    lines.push(`- 建议: "${s.suggested_text}"`)
    lines.push(`- 理由: ${s.rationale}`)
    lines.push('')
  }

  lines.push('### 🚫 除外责任分析')
  for (const e of result.exclusion_analysis) {
    lines.push(`- **${e.exclusion}** (风险: ${e.risk})`)
    lines.push(`  - 建议: ${e.recommendation}`)
  }
  lines.push('')

  lines.push('### ⚠️ 覆盖差距')
  for (const g of result.coverage_gaps_identified) lines.push(`- ⚠️ ${g}`)
  lines.push('')

  lines.push('### 📐 合规对齐')
  for (const [fw, status] of Object.entries(result.compliance_alignment)) {
    const emoji = status === '已对齐' ? '✅' : '⚠️'
    lines.push(`- ${emoji} ${fw}: ${status}`)
  }
  lines.push('')

  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Risk Exposure Quantifier — 风险暴露量化
  tools.register(defineTool({
    name: 'risk_exposure_quantifier',
    description: '风险暴露量化分析 | 基于SLE/ARO/ALE模型量化网络风险暴露，输出威胁场景、损失分布和优先整改建议 | Quantify cyber risk exposure using SLE/ARO/ALE methodology with threat scenarios and loss distribution.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: entity_id, entity_name, industry, annual_revenue, employee_count, records_count, critical_systems[], historical_incidents[], security_maturity_level(basic|intermediate|advanced)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RiskExposureInput = JSON.parse(args.input_data)
      return formatRiskExposureReport(analyzeRiskExposure(input))
    }
  }))

  // Tool 2: Premium Calculator — 保费计算
  tools.register(defineTool({
    name: 'premium_calculator',
    description: '网络保险保费计算 | 基于风险评分、行业因子、安全控制、历史理赔计算保费，输出保费分解和市场基准 | Calculate cyber insurance premium with risk-adjusted pricing and competitive benchmarking.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: entity_id, entity_name, coverage_limit_requested, deductible_requested, industry, annual_revenue, records_count, security_controls_score(0-100), prior_claims_count, policy_term_months'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PremiumInput = JSON.parse(args.input_data)
      return formatPremiumReport(calculatePremium(input))
    }
  }))

  // Tool 3: Claims Forensic Analyst — 理赔取证分析
  tools.register(defineTool({
    name: 'claims_forensic_analyst',
    description: '理赔取证分析 | 对网络保险理赔进行攻击链分析、取证发现、损失验证和覆盖判定 | Forensic analysis of cyber insurance claims with kill chain mapping and loss verification.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: claim_id, policy_id, incident_date, discovery_date, reported_date, incident_type(ransomware|data_breach|business_email_compromise|ddos|insider_threat|supply_chain), estimated_loss, affected_records, affected_systems[], initial_access_vector, containment_hours'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ClaimsForensicInput = JSON.parse(args.input_data)
      return formatClaimsForensicReport(analyzeClaimsForensic(input))
    }
  }))

  // Tool 4: Compliance Coverage Mapper — 合规覆盖映射
  tools.register(defineTool({
    name: 'compliance_coverage_mapper',
    description: '合规覆盖映射 | 将ISO27001/SOC2/GDPR/PCI DSS等合规框架映射到保险覆盖范围，识别差距 | Map regulatory compliance frameworks to insurance coverage and identify gaps.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: entity_id, entity_name, regulatory_frameworks[], current_compliance_status{}, coverage_policy_id, policy_exclusions[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ComplianceInput = JSON.parse(args.input_data)
      return formatComplianceReport(analyzeComplianceCoverage(input))
    }
  }))

  // Tool 5: Incident Response Retainer — 事件响应 Retainer
  tools.register(defineTool({
    name: 'incident_response_retainer',
    description: '事件响应Retainer方案 | 设计IR团队配置、SLA承诺、年费和升级流程 | Design incident response retainer with team configuration, SLA commitments, and cost estimation.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: entity_id, entity_name, retainer_tier(basic|standard|premium), estimated_incidents_per_year, internal_ir_capability(none|limited|full), required_sla_hours, geographic_scope[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: IRRetainerInput = JSON.parse(args.input_data)
      return formatIRRetainerReport(analyzeIRRetainer(input))
    }
  }))

  // Tool 6: Vendor Risk Assessor — 供应商风险评估
  tools.register(defineTool({
    name: 'vendor_risk_assessor',
    description: '供应商风险评估 | TPRM评估：安全问卷合规、审计发现、认证状态、保险要求 | Third-party vendor risk assessment with security questionnaire and insurance requirements.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vendor_id, vendor_name, service_category, data_access_level(none|limited|moderate|extensive), contract_value, security_questionnaire{}, audit_findings_count, previous_incidents, soc2_certified(boolean), iso27001_certified(boolean)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: VendorRiskInput = JSON.parse(args.input_data)
      return formatVendorRiskReport(assessVendorRisk(input))
    }
  }))

  // Tool 7: Breach Cost Estimator — 泄露成本估算
  tools.register(defineTool({
    name: 'breach_cost_estimator',
    description: '数据泄露成本估算 | 估算直接/间接/长期成本，含行业对比和保险覆盖影响 | Estimate total breach cost including direct, indirect, and long-term costs with insurance impact.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: entity_id, entity_name, breach_type, records_exposed, industry, geographic_regions[], detection_days, notification_days, has_cyber_insurance(boolean), security_posture(poor|average|good|excellent)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: BreachCostInput = JSON.parse(args.input_data)
      return formatBreachCostReport(estimateBreachCost(input))
    }
  }))

  // Tool 8: Policy Wording Optimizer — 保单措辞优化
  tools.register(defineTool({
    name: 'policy_wording_optimizer',
    description: '保单措辞优化 | 分析网络保险保单条款，提供措辞优化建议、除外责任分析和覆盖差距识别 | Optimize cyber insurance policy wording with clause suggestions and coverage gap analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: policy_id, entity_name, policy_text, target_coverage_width(narrow|standard|broad), known_gaps[], risk_appetite(conservative|moderate|aggressive), regulatory_requirements[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PolicyWordingInput = JSON.parse(args.input_data)
      return formatPolicyWordingReport(optimizePolicyWording(input))
    }
  }))

  console.log(`[dsh-tool-cyberins] Loaded v${VERSION} — Cyber Insurance & Risk Underwriting, 8 tools active`)
  console.log('  Tools: risk_exposure_quantifier, premium_calculator, claims_forensic_analyst, compliance_coverage_mapper, incident_response_retainer, vendor_risk_assessor, breach_cost_estimator, policy_wording_optimizer')
}
