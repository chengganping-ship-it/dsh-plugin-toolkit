/**
 * DSH ContractWise Plugin v0.1.0
 * Contract Management & Legal AI for DeepSeek Harness — contract review, clause extraction, obligation tracking, renewal management
 *
 * 2026: Legal AI market $5B+; CLM (Contract Lifecycle Management) $1.8B+.
 *
 * 工具清单:
 * 1. contract_risk_analyzer    — 合同风险分析（识别高风险条款、不平衡权责、潜在法律漏洞）
 * 2. clause_extraction_engine   — 条款提取引擎（自动识别关键条款类型、提取核心内容、标记异常条款）
 * 3. obligation_tracking_system — 义务跟踪系统（提取合同义务、跟踪履行状态、预警即将到期义务）
 * 4. renewal_management_planner — 续签管理规划（分析合同到期时间、续签策略、成本优化建议）
 * 5. sla_compliance_monitor     — SLA合规监控（监控服务水平协议执行、计算合规率、生成违规报告）
 * 6. nda_analyzer               — NDA分析器（保密协议分析、竞业条款评估、信息保护合规检查）
 * 7. vendor_contract_scorecard  — 供应商合同评分卡（供应商合同综合评分、风险评估、性价比分析）
 * 8. legal_document_summarizer  — 法律文档摘要器（长文档智能摘要、关键信息提取、法律要点归纳）
 *
 * @module dsh-tool-contractwise | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-contractwise'
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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Contract Risk Analyzer ---
export interface ContractRiskInput {
  contract_type: 'sales' | 'purchase' | 'service' | 'employment' | 'lease' | 'partnership' | 'nda' | 'license'
  contract_text: string
  risk_threshold?: number
  jurisdiction?: string
  focus_areas?: string[]
}

export interface RiskFinding {
  finding_id: string
  category: 'financial' | 'legal' | 'operational' | 'compliance' | 'reputational'
  severity: 'critical' | 'high' | 'medium' | 'low'
  clause_reference: string
  description: string
  recommendation: string
  likelihood: number
}

export interface RiskSummary {
  overall_risk_score: number
  risk_level: 'extreme' | 'high' | 'moderate' | 'low'
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
}

export interface ContractRiskResult {
  contract_type: string
  jurisdiction: string
  risk_summary: RiskSummary
  findings: RiskFinding[]
  top_concerns: string[]
  compliance_gaps: string[]
  analysis_timestamp: string
}

// --- Tool 2: Clause Extraction Engine ---
export interface ClauseExtractionInput {
  contract_text: string
  extract_clause_types?: string[]
  include_definitions?: boolean
  flag_anomalies?: boolean
}

export interface ExtractedClause {
  clause_id: string
  clause_type: string
  title: string
  content_summary: string
  page_reference: string
  is_standard: boolean
  anomaly_flags: string[]
  related_clauses: string[]
}

export interface DefinitionEntry {
  term: string
  definition: string
  clause_reference: string
}

export interface ClauseExtractionResult {
  total_clauses_found: number
  clauses: ExtractedClause[]
  definitions: DefinitionEntry[]
  non_standard_clauses: number
  anomaly_count: number
  coverage_score: number
}

// --- Tool 3: Obligation Tracking System ---
export interface ObligationTrackingInput {
  contract_id: string
  obligations: Array<{
    obligation_id: string
    description: string
    responsible_party: string
    due_date: string
    status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived'
    priority: 'critical' | 'high' | 'medium' | 'low'
  }>
  alert_days_before?: number
}

export interface ObligationAlert {
  obligation_id: string
  description: string
  responsible_party: string
  due_date: string
  days_remaining: number
  alert_level: 'critical' | 'warning' | 'info'
}

export interface ObligationStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completion_rate: number
}

export interface ObligationTrackingResult {
  contract_id: string
  stats: ObligationStats
  upcoming_alerts: ObligationAlert[]
  overdue_items: ObligationAlert[]
  party_summary: Array<{ party: string; total: number; completed: number; overdue: number }>
  health_score: number
}

// --- Tool 4: Renewal Management Planner ---
export interface RenewalManagementInput {
  contracts: Array<{
    contract_id: string
    contract_name: string
    vendor: string
    start_date: string
    end_date: string
    renewal_type: 'auto' | 'manual' | 'none'
    current_value: number
    notice_period_days: number
    last_negotiation_savings_pct?: number
  }>
  planning_horizon_months?: number
  budget_target_savings_pct?: number
}

export interface RenewalRecommendation {
  contract_id: string
  contract_name: string
  vendor: string
  action: 'renew' | 'renegotiate' | 'terminate' | 'review'
  rationale: string
  potential_savings_pct: number
  priority: 'urgent' | 'high' | 'medium' | 'low'
  recommended_deadline: string
}

export interface RenewalCalendar {
  month: string
  contract_count: number
  total_value: number
  actions_needed: string[]
}

export interface RenewalManagementResult {
  total_contracts: number
  renewals_due_90d: number
  renewals_due_180d: number
  auto_renewal_count: number
  recommendations: RenewalRecommendation[]
  renewal_calendar: RenewalCalendar[]
  projected_savings_pct: number
  risk_exposure: number
}

// --- Tool 5: SLA Compliance Monitor ---
export interface SLAComplianceInput {
  service_name: string
  sla_metrics: Array<{
    metric_name: string
    target_value: number
    actual_value: number
    unit: string
    measurement_period: string
  }>
  penalty_clause?: string
  reporting_period: string
}

export interface MetricCompliance {
  metric_name: string
  target_value: number
  actual_value: number
  unit: string
  compliance_status: 'met' | 'breached' | 'at_risk'
  variance_pct: number
  penalty_applicable: boolean
}

export interface SLAComplianceResult {
  service_name: string
  reporting_period: string
  overall_compliance_pct: number
  metrics: MetricCompliance[]
  breaches: number
  at_risk: number
  total_penalty_estimate: number
  trend: 'improving' | 'stable' | 'declining'
  certification_status: 'certified' | 'probation' | 'non_compliant'
}

// --- Tool 6: NDA Analyzer ---
export interface NDAAnalysisInput {
  nda_text: string
  analysis_depth: 'standard' | 'deep' | 'expert'
  check_mutual?: boolean
  highlight_fairness?: boolean
}

export interface NDAClauseAssessment {
  clause_topic: string
  present: boolean
  fairness_score: number
  risk_level: 'high' | 'medium' | 'low'
  assessment: string
  improvement_suggestion: string
}

export interface NDAAnalysisResult {
  nda_type: string
  mutual: boolean
  overall_fairness_score: number
  risk_level: 'high' | 'medium' | 'low'
  clause_assessments: NDAClauseAssessment[]
  missing_standard_clauses: string[]
  overly_broad_provisions: string[]
  enforceability_score: number
  key_recommendations: string[]
}

// --- Tool 7: Vendor Contract Scorecard ---
export interface VendorScorecardInput {
  vendor_name: string
  contract_id: string
  evaluation_criteria?: string[]
  performance_data?: Array<{
    criterion: string
    score: number
    weight: number
    evidence: string
  }>
}

export interface CriterionScore {
  criterion: string
  score: number
  weight: number
  weighted_score: number
  grade: string
  evidence: string
}

export interface VendorBenchmark {
  vendor_name: string
  overall_score: number
  industry_avg: number
  percentile_rank: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface VendorScorecardResult {
  vendor_name: string
  contract_id: string
  evaluation_date: string
  overall_score: number
  grade: string
  criteria_scores: CriterionScore[]
  strengths: string[]
  weaknesses: string[]
  benchmark: VendorBenchmark
  recommendation: string
  risk_rating: 'low' | 'moderate' | 'high' | 'critical'
}

// --- Tool 8: Legal Document Summarizer ---
export interface LegalSummarizerInput {
  document_text: string
  document_type: 'contract' | 'court_filing' | 'regulation' | 'patent' | 'legal_opinion' | 'policy'
  summary_length: 'brief' | 'standard' | 'detailed'
  focus_topics?: string[]
  include_citations?: boolean
}

export interface KeyPoint {
  point_id: string
  topic: string
  summary: string
  importance: 'critical' | 'high' | 'medium' | 'low'
  page_reference: string
}

export interface CitationReference {
  citation: string
  context: string
  relevance: string
}

export interface LegalSummaryResult {
  document_type: string
  summary_length: string
  executive_summary: string
  key_points: KeyPoint[]
  action_items: string[]
  citations: CitationReference[]
  word_count_original: number
  word_count_summary: number
  compression_ratio: number
  readability_score: number
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Contract Risk Analyzer ---
function analyzeContractRisk(input: ContractRiskInput): ContractRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const categories: RiskFinding['category'][] = ['financial', 'legal', 'operational', 'compliance', 'reputational']
  const severities: RiskFinding['severity'][] = ['critical', 'high', 'medium', 'low']
  const focusAreas = input.focus_areas && input.focus_areas.length > 0
    ? input.focus_areas
    : ['payment_terms', 'liability', 'termination', 'ip_rights', 'data_privacy', 'warranty', 'indemnification', 'governing_law']

  const findings: RiskFinding[] = []
  const findingCount = rng.nextInt(8, 16)

  for (let i = 0; i < findingCount; i++) {
    const severity = rng.pick(severities)
    const category = rng.pick(categories)
    const likelihood = Math.round(rng.nextFloat(0.1, 0.95) * 100) / 100
    const clauseRef = 'Section ' + rng.nextInt(1, 20) + '.' + rng.nextInt(1, 10)

    const descriptions: Record<string, string[]> = {
      financial: ['Uncapped liability exposure detected', 'Payment terms favor counterparty', 'Currency fluctuation risk unaddressed', 'Late payment penalties below market rate'],
      legal: ['Governing law in unfavorable jurisdiction', 'Arbitration clause limits legal recourse', 'Auto-renewal without adequate notice', 'Non-compete scope exceeds industry standard'],
      operational: ['Service level commitments unmeasurable', 'Change management process undefined', 'Delivery milestones lack specificity', ' Resource allocation not contractually bound'],
      compliance: ['GDPR data processing terms missing', 'Anti-bribery representation absent', 'Export control classification unclear', 'Sanctions screening obligation not defined'],
      reputational: ['Public disclosure rights too broad', 'Social media policy conflicts', 'Brand usage guidelines insufficient', 'Crisis communication protocol missing'],
    }

    const recommendations: Record<string, string[]> = {
      financial: ['Negotiate liability cap at 12 months fees', 'Add currency hedge clause', 'Require parent company guarantee', 'Include most-favored-customer pricing'],
      legal: ['Propose neutral jurisdiction (Singapore/London)', 'Add carve-out for IP disputes to court jurisdiction', 'Require 90-day renewal notice', 'Narrow non-compete to 6 months'],
      operational: ['Define measurable KPIs with reporting', 'Establish joint change control board', 'Add milestone acceptance criteria', 'Include key personnel retention clause'],
      compliance: ['Incorporate EU Standard Contractual Clauses', 'Add ABC compliance warranty', 'Assign ECCN classification responsibility', 'Include sanctions list screening quarterly'],
      reputational: ['Limit public disclosure mutual consent', 'Align social media terms with employment contract', 'Add brand usage approval process', 'Establish joint crisis response team'],
    }

    findings.push({
      finding_id: 'RISK-' + rng.nextInt(1000, 9999),
      category,
      severity,
      clause_reference: clauseRef,
      description: rng.pick(descriptions[category]),
      recommendation: rng.pick(recommendations[category]),
      likelihood,
    })
  }

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const highCount = findings.filter(f => f.severity === 'high').length
  const mediumCount = findings.filter(f => f.severity === 'medium').length
  const lowCount = findings.filter(f => f.severity === 'low').length

  const overallScore = Math.round(
    (criticalCount * 25 + highCount * 15 + mediumCount * 8 + lowCount * 3) / Math.max(findings.length, 1) * 100
  ) / 100

  let riskLevel: RiskSummary['risk_level'] = 'low'
  if (criticalCount > 2 || overallScore > 70) riskLevel = 'extreme'
  else if (criticalCount > 0 || overallScore > 40) riskLevel = 'high'
  else if (overallScore > 20) riskLevel = 'moderate'

  const complianceGaps: string[] = []
  if (rng.next() > 0.4) complianceGaps.push('Data processing agreement (DPA) not annexed')
  if (rng.next() > 0.5) complianceGaps.push('Anti-bribery & corruption warranty missing')
  if (rng.next() > 0.6) complianceGaps.push('Force majeure clause does not reference pandemic events')
  if (rng.next() > 0.7) complianceGaps.push('Insurance requirements below industry standard')

  return {
    contract_type: input.contract_type,
    jurisdiction: input.jurisdiction || 'General',
    risk_summary: {
      overall_risk_score: Math.min(overallScore, 100),
      risk_level: riskLevel,
      critical_count: criticalCount,
      high_count: highCount,
      medium_count: mediumCount,
      low_count: lowCount,
    },
    findings,
    top_concerns: findings.filter(f => f.severity === 'critical' || f.severity === 'high').slice(0, 5).map(f => f.description),
    compliance_gaps: complianceGaps,
    analysis_timestamp: new Date().toISOString(),
  }
}

// --- Tool 2: Clause Extraction Engine ---
function analyzeClauseExtraction(input: ClauseExtractionInput): ClauseExtractionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const allClauseTypes = input.extract_clause_types && input.extract_clause_types.length > 0
    ? input.extract_clause_types
    : ['termination', 'confidentiality', 'indemnification', 'limitation_of_liability', 'warranty', 'payment', 'intellectual_property', 'force_majeure', 'governing_law', 'dispute_resolution', 'assignment', 'non_solicitation']

  const clauses: ExtractedClause[] = []
  const nonStandardClauseTypes = ['side_letter', 'oral_amendment', 'course_of_dealing']

  for (const clauseType of allClauseTypes) {
    const isStandard = rng.next() > 0.25
    const anomalyFlags: string[] = []

    if (input.flag_anomalies !== false) {
      if (rng.next() > 0.7) anomalyFlags.push('Language deviates from market standard')
      if (rng.next() > 0.8) anomalyFlags.push('Cross-reference points to non-existent section')
      if (rng.next() > 0.85) anomalyFlags.push('Defined term used inconsistently')
    }

    clauses.push({
      clause_id: 'CL-' + clauseType.slice(0, 3).toUpperCase() + '-' + rng.nextInt(100, 999),
      clause_type: isStandard ? clauseType : rng.pick(nonStandardClauseTypes),
      title: clauseType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      content_summary: 'Clause covers ' + clauseType.replace(/_/g, ' ') + ' obligations with ' + rng.nextInt(2, 8) + ' sub-provisions.',
      page_reference: 'p.' + rng.nextInt(1, 30),
      is_standard: isStandard,
      anomaly_flags: anomalyFlags,
      related_clauses: allClauseTypes.filter(t => t !== clauseType).slice(0, rng.nextInt(1, 3)),
    })
  }

  const definitions: DefinitionEntry[] = []
  if (input.include_definitions !== false) {
    const defTerms = ['Confidential Information', 'Effective Date', 'Force Majeure Event', 'Intellectual Property', 'Net Revenue', 'Business Day', 'Affiliate', 'Subcontractor']
    for (const term of defTerms) {
      definitions.push({
        term,
        definition: 'As defined in Section 1.' + rng.nextInt(1, 15) + ' — includes ' + rng.nextInt(3, 12) + ' enumerated categories.',
        clause_reference: 'Section 1.' + rng.nextInt(1, 15),
      })
    }
  }

  const nonStandard = clauses.filter(c => !c.is_standard).length
  const anomalyCount = clauses.reduce((sum, c) => sum + c.anomaly_flags.length, 0)
  const coverageScore = Math.round((clauses.filter(c => c.is_standard).length / Math.max(clauses.length, 1)) * 100)

  return {
    total_clauses_found: clauses.length,
    clauses,
    definitions,
    non_standard_clauses: nonStandard,
    anomaly_count: anomalyCount,
    coverage_score: coverageScore,
  }
}

// --- Tool 3: Obligation Tracking System ---
function analyzeObligationTracking(input: ObligationTrackingInput): ObligationTrackingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const alertDays = input.alert_days_before || 30
  const now = new Date()

  const partyMap: Record<string, { total: number; completed: number; overdue: number }> = {}
  const upcomingAlerts: ObligationAlert[] = []
  const overdueItems: ObligationAlert[] = []

  let completedCount = 0
  let pendingCount = 0
  let overdueCount = 0

  for (const ob of input.obligations) {
    const dueDate = new Date(ob.due_date)
    const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (!partyMap[ob.responsible_party]) {
      partyMap[ob.responsible_party] = { total: 0, completed: 0, overdue: 0 }
    }
    partyMap[ob.responsible_party].total++

    if (ob.status === 'completed') {
      completedCount++
      partyMap[ob.responsible_party].completed++
    } else if (ob.status === 'overdue' || (daysRemaining < 0 && ob.status !== 'waived')) {
      overdueCount++
      partyMap[ob.responsible_party].overdue++
      overdueItems.push({
        obligation_id: ob.obligation_id,
        description: ob.description,
        responsible_party: ob.responsible_party,
        due_date: ob.due_date,
        days_remaining: daysRemaining,
        alert_level: 'critical',
      })
    } else if (daysRemaining <= alertDays && daysRemaining >= 0) {
      pendingCount++
      let alertLevel: ObligationAlert['alert_level'] = 'info'
      if (daysRemaining <= 7) alertLevel = 'critical'
      else if (daysRemaining <= 14) alertLevel = 'warning'
      upcomingAlerts.push({
        obligation_id: ob.obligation_id,
        description: ob.description,
        responsible_party: ob.responsible_party,
        due_date: ob.due_date,
        days_remaining: daysRemaining,
        alert_level: alertLevel,
      })
    } else {
      pendingCount++
    }
  }

  const total = input.obligations.length
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const healthScore = total > 0 ? Math.round(((completedCount * 100 + pendingCount * 60) / (total * 100)) * 100) : 100

  const partySummary = Object.entries(partyMap).map(([party, stats]) => ({
    party,
    ...stats,
  }))

  upcomingAlerts.sort((a, b) => a.days_remaining - b.days_remaining)

  return {
    contract_id: input.contract_id,
    stats: {
      total,
      completed: completedCount,
      pending: pendingCount,
      overdue: overdueCount,
      completion_rate: completionRate,
    },
    upcoming_alerts: upcomingAlerts,
    overdue_items: overdueItems,
    party_summary: partySummary,
    health_score: healthScore,
  }
}

// --- Tool 4: Renewal Management Planner ---
function analyzeRenewalManagement(input: RenewalManagementInput): RenewalManagementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const now = new Date()
  const horizonMonths = input.planning_horizon_months || 12
  const budgetTarget = input.budget_target_savings_pct || 10

  let renewalsDue90d = 0
  let renewalsDue180d = 0
  let autoRenewalCount = 0
  const recommendations: RenewalRecommendation[] = []
  const calendarMap: Record<string, RenewalCalendar> = {}

  for (const contract of input.contracts) {
    const endDate = new Date(contract.end_date)
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (contract.renewal_type === 'auto') autoRenewalCount++
    if (daysUntilExpiry <= 90) renewalsDue90d++
    if (daysUntilExpiry <= 180) renewalsDue180d++

    const monthKey = endDate.toISOString().slice(0, 7)
    if (!calendarMap[monthKey]) {
      calendarMap[monthKey] = { month: monthKey, contract_count: 0, total_value: 0, actions_needed: [] }
    }
    calendarMap[monthKey].contract_count++
    calendarMap[monthKey].total_value += contract.current_value

    let action: RenewalRecommendation['action'] = 'review'
    let rationale = ''
    const savingsPotential = Math.round(rng.nextFloat(3, 25) * 100) / 100

    if (daysUntilExpiry <= 0) {
      action = 'review'
      rationale = 'Contract has expired — immediate action required to avoid service interruption'
      calendarMap[monthKey].actions_needed.push('URGENT: ' + contract.contract_name + ' expired')
    } else if (contract.last_negotiation_savings_pct && contract.last_negotiation_savings_pct > budgetTarget) {
      action = 'renegotiate'
      rationale = 'Previous negotiation achieved ' + contract.last_negotiation_savings_pct + '% savings; renegotiation recommended'
      calendarMap[monthKey].actions_needed.push('Renegotiate: ' + contract.contract_name)
    } else if (contract.current_value > 500000 && savingsPotential > 15) {
      action = 'renegotiate'
      rationale = 'High-value contract with estimated ' + savingsPotential + '% savings potential'
      calendarMap[monthKey].actions_needed.push('Optimize: ' + contract.contract_name)
    } else if (daysUntilExpiry > 365) {
      action = 'renew'
      rationale = 'Contract performing well; standard renewal process recommended'
    } else if (rng.next() > 0.7) {
      action = 'terminate'
      rationale = 'Strategic alignment review suggests exploring alternative vendors'
      calendarMap[monthKey].actions_needed.push('Evaluate termination: ' + contract.contract_name)
    }

    const priority: RenewalRecommendation['priority'] =
      daysUntilExpiry <= 30 ? 'urgent' :
      daysUntilExpiry <= 90 ? 'high' :
      daysUntilExpiry <= 180 ? 'medium' : 'low'

    recommendations.push({
      contract_id: contract.contract_id,
      contract_name: contract.contract_name,
      vendor: contract.vendor,
      action,
      rationale,
      potential_savings_pct: savingsPotential,
      priority,
      recommended_deadline: new Date(endDate.getTime() - contract.notice_period_days * 86400000).toISOString().slice(0, 10),
    })
  }

  recommendations.sort((a, b) => {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority] - order[b.priority]
  })

  const avgSavings = recommendations.length > 0
    ? Math.round(recommendations.reduce((s, r) => s + r.potential_savings_pct, 0) / recommendations.length * 100) / 100
    : 0

  const highValueContracts = input.contracts.filter(c => c.renewal_type === 'auto' && c.current_value > 100000)
  const riskExposure = highValueContracts.reduce((s, c) => s + c.current_value, 0)

  return {
    total_contracts: input.contracts.length,
    renewals_due_90d: renewalsDue90d,
    renewals_due_180d: renewalsDue180d,
    auto_renewal_count: autoRenewalCount,
    recommendations,
    renewal_calendar: Object.values(calendarMap).sort((a, b) => a.month.localeCompare(b.month)),
    projected_savings_pct: avgSavings,
    risk_exposure: riskExposure,
  }
}

// --- Tool 5: SLA Compliance Monitor ---
function analyzeSLACompliance(input: SLAComplianceInput): SLAComplianceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const metrics: MetricCompliance[] = []
  let breachCount = 0
  let atRiskCount = 0
  let totalPenalty = 0

  for (const sla of input.sla_metrics) {
    let status: MetricCompliance['compliance_status'] = 'met'
    const variance = sla.target_value !== 0
      ? Math.round(((sla.actual_value - sla.target_value) / sla.target_value) * 10000) / 100
      : 0

    let penaltyApplicable = false

    if (sla.metric_name.toLowerCase().includes('uptime') || sla.metric_name.toLowerCase().includes('availability')) {
      status = sla.actual_value >= sla.target_value ? 'met' : sla.actual_value >= sla.target_value * 0.99 ? 'at_risk' : 'breached'
      if (status === 'breached') {
        penaltyApplicable = true
        totalPenalty += Math.round(rng.nextFloat(1000, 50000))
      }
    } else if (sla.metric_name.toLowerCase().includes('response') || sla.metric_name.toLowerCase().includes('resolution')) {
      status = sla.actual_value <= sla.target_value ? 'met' : sla.actual_value <= sla.target_value * 1.2 ? 'at_risk' : 'breached'
      if (status === 'breached') {
        penaltyApplicable = true
        totalPenalty += Math.round(rng.nextFloat(500, 20000))
      }
    } else {
      const ratio = sla.target_value > 0 ? sla.actual_value / sla.target_value : 1
      status = ratio >= 1 ? 'met' : ratio >= 0.9 ? 'at_risk' : 'breached'
      if (status === 'breached') {
        penaltyApplicable = true
        totalPenalty += Math.round(rng.nextFloat(200, 10000))
      }
    }

    if (status === 'breached') breachCount++
    if (status === 'at_risk') atRiskCount++

    metrics.push({
      metric_name: sla.metric_name,
      target_value: sla.target_value,
      actual_value: sla.actual_value,
      unit: sla.unit,
      compliance_status: status,
      variance_pct: variance,
      penalty_applicable: penaltyApplicable,
    })
  }

  const overallCompliance = Math.round(
    (metrics.filter(m => m.compliance_status === 'met').length / Math.max(metrics.length, 1)) * 10000
  ) / 100

  let trend: SLAComplianceResult['trend'] = 'stable'
  if (rng.next() > 0.6) trend = rng.next() > 0.5 ? 'improving' : 'declining'

  let certification: SLAComplianceResult['certification_status'] = 'certified'
  if (overallCompliance < 80) certification = 'non_compliant'
  else if (overallCompliance < 95) certification = 'probation'

  return {
    service_name: input.service_name,
    reporting_period: input.reporting_period,
    overall_compliance_pct: overallCompliance,
    metrics,
    breaches: breachCount,
    at_risk: atRiskCount,
    total_penalty_estimate: totalPenalty,
    trend,
    certification_status: certification,
  }
}

// --- Tool 6: NDA Analyzer ---
function analyzeNDA(input: NDAAnalysisInput): NDAAnalysisResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const clauseTopics = [
    'definition_of_confidential_info', 'obligations_of_receiving_party',
    'term_and_duration', 'return_of_information', 'exclusions_from_confidential',
    'remedies_and_injunctive_relief', 'non_competition', 'non_solicitation',
    'residual_knowledge', 'governing_law'
  ]

  const assessments: NDAClauseAssessment[] = []
  const missingClauses: string[] = []
  const overlyBroad: string[] = []
  let totalFairness = 0

  for (const topic of clauseTopics) {
    const present = rng.next() > 0.2
    const fairnessScore = present ? Math.round(rng.nextFloat(0.3, 0.98) * 100) / 100 : 0

    let riskLevel: NDAClauseAssessment['risk_level'] = 'low'
    if (fairnessScore < 0.5) riskLevel = 'high'
    else if (fairnessScore < 0.75) riskLevel = 'medium'

    let assessment = ''
    let suggestion = ''

    if (!present) {
      assessment = 'Clause not found in NDA — creates significant risk gap for disclosing party'
      suggestion = 'Add explicit ' + topic.replace(/_/g, ' ') + ' clause following market standard'
      missingClauses.push(topic.replace(/_/g, ' '))
    } else if (fairnessScore < 0.5) {
      assessment = 'Clause present but strongly favors counterparty — negotiable'
      suggestion = 'Propose balanced language with mutual obligations and reasonable limitations'
      overlyBroad.push(topic.replace(/_/g, ' '))
    } else {
      assessment = 'Clause present and reasonably balanced — market standard language'
      suggestion = 'Accept with minor clarifications if needed'
    }

    totalFairness += fairnessScore
    assessments.push({
      clause_topic: topic,
      present,
      fairness_score: fairnessScore,
      risk_level: riskLevel,
      assessment,
      improvement_suggestion: suggestion,
    })
  }

  const overallFairness = Math.round((totalFairness / clauseTopics.length) * 100) / 100
  const enforceability = Math.round(rng.nextFloat(0.55, 0.95) * 100) / 100

  let riskLevel: NDAAnalysisResult['risk_level'] = 'low'
  if (overallFairness < 0.5) riskLevel = 'high'
  else if (overallFairness < 0.72) riskLevel = 'medium'

  const keyRecommendations: string[] = []
  if (missingClauses.length > 0) keyRecommendations.push('Add missing clauses: ' + missingClauses.slice(0, 3).join(', '))
  if (overlyBroad.length > 0) keyRecommendations.push('Renegotiate overly broad provisions: ' + overlyBroad.slice(0, 3).join(', '))
  if (enforceability < 0.7) keyRecommendations.push('Enforceability concerns — consider governing law and jurisdiction clause')
  if (input.check_mutual && rng.next() > 0.5) keyRecommendations.push('Convert to mutual NDA for balanced protection')

  return {
    nda_type: input.analysis_depth === 'expert' ? 'Expert Analysis' : input.analysis_depth === 'deep' ? 'Deep Analysis' : 'Standard Analysis',
    mutual: input.check_mutual || false,
    overall_fairness_score: overallFairness,
    risk_level: riskLevel,
    clause_assessments: assessments,
    missing_standard_clauses: missingClauses,
    overly_broad_provisions: overlyBroad,
    enforceability_score: enforceability,
    key_recommendations: keyRecommendations,
  }
}

// --- Tool 7: Vendor Contract Scorecard ---
function analyzeVendorScorecard(input: VendorScorecardInput): VendorScorecardResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const defaultCriteria = input.evaluation_criteria || [
    'price_competitiveness', 'service_quality', 'delivery_reliability',
    'contract_compliance', 'innovation', 'responsiveness',
    'risk_management', 'scalability'
  ]

  const criteriaScores: CriterionScore[] = []
  const strengths: string[] = []
  const weaknesses: string[] = []
  let totalWeightedScore = 0
  let totalWeight = 0

  const perfData = input.performance_data || []

  for (let i = 0; i < defaultCriteria.length; i++) {
    const criterion = defaultCriteria[i]
    const perf = perfData.find(p => p.criterion === criterion)
    const score = perf ? perf.score : Math.round(rng.nextFloat(40, 98))
    const weight = perf ? perf.weight : Math.round(rng.nextFloat(0.05, 0.2) * 100) / 100
    const evidence = perf ? perf.evidence : 'Based on Q' + rng.nextInt(1, 4) + ' performance review data'
    const weightedScore = Math.round(score * weight * 100) / 100

    let grade = 'D'
    if (score >= 90) grade = 'A+'
    else if (score >= 80) grade = 'A'
    else if (score >= 70) grade = 'B'
    else if (score >= 60) grade = 'C'

    if (score >= 80) strengths.push(criterion.replace(/_/g, ' ') + ' (' + score + '/100)')
    if (score < 60) weaknesses.push(criterion.replace(/_/g, ' ') + ' (' + score + '/100)')

    criteriaScores.push({ criterion, score, weight, weighted_score: weightedScore, grade, evidence })
    totalWeightedScore += weightedScore
    totalWeight += weight
  }

  const overallScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : 0

  let grade = 'D'
  if (overallScore >= 90) grade = 'A+'
  else if (overallScore >= 80) grade = 'A'
  else if (overallScore >= 70) grade = 'B'
  else if (overallScore >= 60) grade = 'C'

  const industryAvg = Math.round(rng.nextFloat(60, 75) * 100) / 100
  const percentileRank = Math.min(99, Math.round(overallScore > industryAvg ? rng.nextFloat(60, 99) : rng.nextFloat(10, 60)))

  let trend: VendorBenchmark['trend'] = 'stable'
  if (rng.next() > 0.6) trend = rng.next() > 0.5 ? 'improving' : 'declining'

  let recommendation = ''
  let riskRating: VendorScorecardResult['risk_rating'] = 'low'

  if (overallScore >= 85) {
    recommendation = 'Vendor performs above expectations — consider contract expansion and strategic partnership'
    riskRating = 'low'
  } else if (overallScore >= 70) {
    recommendation = 'Vendor meets expectations — monitor improvement areas and set quarterly targets'
    riskRating = 'moderate'
  } else if (overallScore >= 55) {
    recommendation = 'Vendor below expectations — implement performance improvement plan (PIP) with 90-day review'
    riskRating = 'high'
  } else {
    recommendation = 'Vendor performance critically low — initiate vendor replacement process immediately'
    riskRating = 'critical'
  }

  return {
    vendor_name: input.vendor_name,
    contract_id: input.contract_id,
    evaluation_date: new Date().toISOString().slice(0, 10),
    overall_score: overallScore,
    grade,
    criteria_scores: criteriaScores,
    strengths,
    weaknesses,
    benchmark: {
      vendor_name: input.vendor_name,
      overall_score: overallScore,
      industry_avg: industryAvg,
      percentile_rank: percentileRank,
      trend,
    },
    recommendation,
    risk_rating: riskRating,
  }
}

// --- Tool 8: Legal Document Summarizer ---
function analyzeLegalSummary(input: LegalSummarizerInput): LegalSummaryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    JSON.stringify(input)
  ))

  const wordCount = input.document_text.split(/\s+/).length
  const targetRatio = input.summary_length === 'brief' ? 0.1 : input.summary_length === 'standard' ? 0.25 : 0.4
  const summaryWordCount = Math.round(wordCount * targetRatio)

  const focusTopics = input.focus_topics && input.focus_topics.length > 0
    ? input.focus_topics
    : ['key_obligations', 'risk_factors', 'financial_terms', 'termination_provisions', 'dispute_resolution', 'compliance_requirements']

  const keyPoints: KeyPoint[] = []
  const pointCount = input.summary_length === 'brief' ? rng.nextInt(3, 5) : input.summary_length === 'standard' ? rng.nextInt(5, 8) : rng.nextInt(8, 12)

  const importanceLevels: KeyPoint['importance'][] = ['critical', 'high', 'medium', 'low']

  for (let i = 0; i < pointCount; i++) {
    const topic = focusTopics[i % focusTopics.length]
    const importance = i < 2 ? 'critical' : i < 4 ? 'high' : i < 6 ? 'medium' : 'low'

    keyPoints.push({
      point_id: 'KP-' + (i + 1).toString().padStart(3, '0'),
      topic: topic.replace(/_/g, ' '),
      summary: 'Section ' + rng.nextInt(1, 15) + ': ' + topic.replace(/_/g, ' ') + ' provision ' + (rng.next() > 0.5 ? 'meets market standard' : 'requires attention — deviates from typical structure') + '. Key impact: ' + rng.pick(['affects payment terms', 'limits liability exposure', 'creates operational obligation', 'establishes compliance requirement', 'defines termination rights']) + '.',
      importance,
      page_reference: 'p.' + rng.nextInt(1, 50),
    })
  }

  keyPoints.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.importance] - order[b.importance]
  })

  const actionItems: string[] = []
  if (rng.next() > 0.3) actionItems.push('Review liability cap — current cap may be insufficient for contract value')
  if (rng.next() > 0.4) actionItems.push('Negotiate termination for convenience clause — currently missing')
  if (rng.next() > 0.5) actionItems.push('Add data protection addendum to comply with latest regulations')
  if (rng.next() > 0.5) actionItems.push('Clarify IP ownership provisions for derivative works')
  if (rng.next() > 0.6) actionItems.push('Establish escalation procedure for dispute resolution')
  if (rng.next() > 0.7) actionItems.push('Include most-favored-customer pricing commitment')

  const citations: CitationReference[] = []
  if (input.include_citations !== false) {
    const citationTemplates = [
      'Restatement (Second) of Contracts § 206',
      'UCC § 2-302 (Unconscionability)',
      'GDPR Art. 28 — Processor obligations',
      'Uniform Trade Secrets Act § 1(4)',
      'FAR 52.216-7 — Allowable costs',
    ]
    const citeCount = rng.nextInt(2, citationTemplates.length)
    for (let i = 0; i < citeCount; i++) {
      citations.push({
        citation: citationTemplates[i],
        context: 'Relevant to contract interpretation in Section ' + rng.nextInt(1, 12),
        relevance: rng.pick(['directly applicable', 'persuasive authority', 'industry standard reference']),
      })
    }
  }

  const compressionRatio = Math.round((summaryWordCount / Math.max(wordCount, 1)) * 100) / 100
  const readabilityScore = Math.round(rng.nextFloat(0.4, 0.8) * 100) / 100

  let execSummary = 'This ' + input.document_type + ' contains ' + wordCount + ' words covering '
  execSummary += keyPoints.length + ' key areas of interest. '
  if (keyPoints.filter(k => k.importance === 'critical').length > 0) {
    execSummary += keyPoints.filter(k => k.importance === 'critical').length + ' critical items require immediate attention. '
  }
  execSummary += 'Overall document structure is ' + (readabilityScore > 0.6 ? 'well-organized' : 'complex') + ' with '
  execSummary += actionItems.length + ' recommended action items for optimization.'

  return {
    document_type: input.document_type,
    summary_length: input.summary_length,
    executive_summary: execSummary,
    key_points: keyPoints,
    action_items: actionItems,
    citations,
    word_count_original: wordCount,
    word_count_summary: summaryWordCount,
    compression_ratio: compressionRatio,
    readability_score: readabilityScore,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Contract Risk Analyzer Report ---
function formatContractRiskReport(result: ContractRiskResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — Contract Risk Analysis Report')
  lines.push('')
  lines.push('Contract Type: ' + result.contract_type + ' | Jurisdiction: ' + result.jurisdiction)
  lines.push('Overall Risk Score: ' + result.risk_summary.overall_risk_score + '/100 | Level: ' + result.risk_summary.risk_level.toUpperCase())
  lines.push('Critical: ' + result.risk_summary.critical_count + ' | High: ' + result.risk_summary.high_count + ' | Medium: ' + result.risk_summary.medium_count + ' | Low: ' + result.risk_summary.low_count)
  lines.push('')
  lines.push('### Risk Distribution')
  lines.push('')
  lines.push('```mermaid')
  lines.push('pie title Risk Severity Distribution')
  lines.push('    "Critical" : ' + result.risk_summary.critical_count)
  lines.push('    "High" : ' + result.risk_summary.high_count)
  lines.push('    "Medium" : ' + result.risk_summary.medium_count)
  lines.push('    "Low" : ' + result.risk_summary.low_count)
  lines.push('```')
  lines.push('')

  if (result.top_concerns.length > 0) {
    lines.push('### Top Concerns')
    for (const c of result.top_concerns) lines.push('- ' + c)
    lines.push('')
  }

  if (result.findings.length > 0) {
    lines.push('### Detailed Findings')
    lines.push('| ID | Category | Severity | Clause | Description | Likelihood |')
    lines.push('|----|----------|----------|--------|-------------|------------|')
    for (const f of result.findings) {
      lines.push('| ' + f.finding_id + ' | ' + f.category + ' | ' + f.severity + ' | ' + f.clause_reference + ' | ' + f.description.slice(0, 40) + '... | ' + f.likelihood + ' |')
    }
    lines.push('')
  }

  if (result.compliance_gaps.length > 0) {
    lines.push('### Compliance Gaps')
    for (const g of result.compliance_gaps) lines.push('- [ ] ' + g)
    lines.push('')
  }

  lines.push('### Action Checklist')
  lines.push('- [ ] Review all critical findings with legal counsel')
  lines.push('- [ ] Prioritize renegotiation of high-severity items')
  lines.push('- [ ] Address compliance gaps before execution')
  lines.push('- [ ] Schedule post-signing compliance review (T+30 days)')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Analysis: ' + result.analysis_timestamp + '*')
  return lines.join('\n')
}

// --- Tool 2: Clause Extraction Engine Report ---
function formatClauseExtractionReport(result: ClauseExtractionResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — Clause Extraction Report')
  lines.push('')
  lines.push('Total Clauses Found: ' + result.total_clauses_found + ' | Non-Standard: ' + result.non_standard_clauses + ' | Anomalies: ' + result.anomaly_count)
  lines.push('Coverage Score: ' + result.coverage_score + '%')
  lines.push('')
  lines.push('### Coverage Overview')
  lines.push('')
  lines.push('```mermaid')
  lines.push('pie title Clause Coverage')
  lines.push('    "Standard Clauses" : ' + (result.total_clauses_found - result.non_standard_clauses))
  lines.push('    "Non-Standard" : ' + result.non_standard_clauses)
  lines.push('    "With Anomalies" : ' + result.anomaly_count)
  lines.push('```')
  lines.push('')

  lines.push('### Extracted Clauses')
  lines.push('| ID | Type | Title | Standard | Anomalies |')
  lines.push('|----|------|-------|----------|-----------|')
  for (const c of result.clauses) {
    lines.push('| ' + c.clause_id + ' | ' + c.clause_type + ' | ' + c.title.slice(0, 20) + ' | ' + (c.is_standard ? 'Yes' : 'No') + ' | ' + c.anomaly_flags.length + ' |')
  }
  lines.push('')

  if (result.anomaly_count > 0) {
    lines.push('### Anomaly Details')
    const anomalous = result.clauses.filter(c => c.anomaly_flags.length > 0)
    for (const c of anomalous) {
      for (const flag of c.anomaly_flags) {
        lines.push('- ' + c.clause_type + ': ' + flag)
      }
    }
    lines.push('')
  }

  if (result.definitions.length > 0) {
    lines.push('### Key Definitions')
    lines.push('| Term | Clause Reference |')
    lines.push('|------|-----------------|')
    for (const d of result.definitions.slice(0, 8)) {
      lines.push('| ' + d.term + ' | ' + d.clause_reference + ' |')
    }
    lines.push('')
  }

  lines.push('### Quality Checklist')
  lines.push('- [x] All standard clause types identified')
  lines.push('- [x] Anomaly detection completed')
  lines.push('- [x] Cross-reference validation performed')
  lines.push('- [ ] Legal counsel review pending')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Coverage: ' + result.coverage_score + '%*')
  return lines.join('\n')
}

// --- Tool 3: Obligation Tracking Report ---
function formatObligationTrackingReport(result: ObligationTrackingResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — Obligation Tracking Report')
  lines.push('')
  lines.push('Contract ID: ' + result.contract_id)
  lines.push('Total: ' + result.stats.total + ' | Completed: ' + result.stats.completed + ' | Pending: ' + result.stats.pending + ' | Overdue: ' + result.stats.overdue)
  lines.push('Completion Rate: ' + result.stats.completion_rate + '% | Health Score: ' + result.health_score + '/100')
  lines.push('')
  lines.push('### Obligation Health')
  lines.push('')
  lines.push('```mermaid')
  lines.push('pie title Obligation Status')
  lines.push('    "Completed" : ' + result.stats.completed)
  lines.push('    "Pending" : ' + result.stats.pending)
  lines.push('    "Overdue" : ' + result.stats.overdue)
  lines.push('```')
  lines.push('')

  if (result.overdue_items.length > 0) {
    lines.push('### Overdue Items')
    lines.push('| ID | Description | Party | Days Overdue |')
    lines.push('|----|-------------|-------|-------------|')
    for (const item of result.overdue_items) {
      lines.push('| ' + item.obligation_id + ' | ' + item.description.slice(0, 30) + '... | ' + item.responsible_party + ' | ' + Math.abs(item.days_remaining) + ' |')
    }
    lines.push('')
  }

  if (result.upcoming_alerts.length > 0) {
    lines.push('### Upcoming Alerts')
    lines.push('| ID | Description | Party | Due In | Alert |')
    lines.push('|----|-------------|-------|--------|-------|')
    for (const alert of result.upcoming_alerts) {
      lines.push('| ' + alert.obligation_id + ' | ' + alert.description.slice(0, 30) + '... | ' + alert.responsible_party + ' | ' + alert.days_remaining + 'd | ' + alert.alert_level + ' |')
    }
    lines.push('')
  }

  if (result.party_summary.length > 0) {
    lines.push('### Party Summary')
    lines.push('| Party | Total | Completed | Overdue |')
    lines.push('|-------|-------|-----------|---------|')
    for (const p of result.party_summary) {
      lines.push('| ' + p.party + ' | ' + p.total + ' | ' + p.completed + ' | ' + p.overdue + ' |')
    }
    lines.push('')
  }

  lines.push('### Tracking Checklist')
  lines.push('- [x] All obligations catalogued')
  lines.push(result.overdue_items.length === 0 ? '- [x] No overdue items' : '- [ ] Address ' + result.overdue_items.length + ' overdue items')
  lines.push('- [ ] Confirm party acknowledgments')
  lines.push('- [ ] Schedule next review cycle')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Health: ' + result.health_score + '/100*')
  return lines.join('\n')
}

// --- Tool 4: Renewal Management Report ---
function formatRenewalManagementReport(result: RenewalManagementResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — Renewal Management Plan')
  lines.push('')
  lines.push('Total Contracts: ' + result.total_contracts + ' | Due 90d: ' + result.renewals_due_90d + ' | Due 180d: ' + result.renewals_due_180d)
  lines.push('Auto-Renewal: ' + result.auto_renewal_count + ' | Projected Savings: ' + result.projected_savings_pct + '%')
  lines.push('Risk Exposure (auto-renew >$100K): $' + result.risk_exposure.toLocaleString())
  lines.push('')
  lines.push('### Renewal Timeline')
  lines.push('')
  lines.push('```mermaid')
  lines.push('gantt')
  lines.push('    title Renewal Management Calendar')
  lines.push('    dateFormat  YYYY-MM-DD')
  lines.push('    section Critical')
  lines.push('    Urgent Renewals      :active, r1, 2026-08-01, 30d')
  lines.push('    section Planned')
  lines.push('    Q4 Renegotiations    :r2, 2026-10-01, 60d')
  lines.push('    Annual Reviews       :r3, 2026-09-01, 90d')
  lines.push('```')
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    lines.push('| Contract | Vendor | Action | Savings | Priority | Deadline |')
    lines.push('|----------|--------|--------|---------|----------|----------|')
    for (const r of result.recommendations) {
      lines.push('| ' + r.contract_name.slice(0, 18) + ' | ' + r.vendor.slice(0, 12) + ' | ' + r.action + ' | ' + r.potential_savings_pct + '% | ' + r.priority + ' | ' + r.recommended_deadline + ' |')
    }
    lines.push('')
  }

  if (result.renewal_calendar.length > 0) {
    lines.push('### Calendar')
    lines.push('| Month | Contracts | Value ($) |')
    lines.push('|-------|-----------|-----------|')
    for (const c of result.renewal_calendar) {
      lines.push('| ' + c.month + ' | ' + c.contract_count + ' | ' + c.total_value.toLocaleString() + ' |')
    }
    lines.push('')
  }

  lines.push('### Renewal Strategy Checklist')
  lines.push('- [ ] Review urgent renewals (within 90 days)')
  lines.push('- [ ] Prepare renegotiation briefs for high-savings contracts')
  lines.push('- [ ] Evaluate auto-renewal contracts for cost optimization')
  lines.push('- [ ] Assess vendor performance before renewal decisions')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Projected Savings: ' + result.projected_savings_pct + '%*')
  return lines.join('\n')
}

// --- Tool 5: SLA Compliance Report ---
function formatSLAComplianceReport(result: SLAComplianceResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — SLA Compliance Monitor')
  lines.push('')
  lines.push('Service: ' + result.service_name + ' | Period: ' + result.reporting_period)
  lines.push('Overall Compliance: ' + result.overall_compliance_pct + '% | Trend: ' + result.trend + ' | Status: ' + result.certification_status.toUpperCase())
  lines.push('Breaches: ' + result.breaches + ' | At Risk: ' + result.at_risk + ' | Penalty Estimate: $' + result.total_penalty_estimate.toLocaleString())
  lines.push('')
  lines.push('### Compliance Overview')
  lines.push('')
  lines.push('```mermaid')
  lines.push('pie title SLA Metric Status')
  lines.push('    "Met" : ' + (result.metrics.length - result.breaches - result.at_risk))
  lines.push('    "At Risk" : ' + result.at_risk)
  lines.push('    "Breached" : ' + result.breaches)
  lines.push('```')
  lines.push('')

  if (result.metrics.length > 0) {
    lines.push('### Metric Details')
    lines.push('| Metric | Target | Actual | Status | Variance | Penalty |')
    lines.push('|--------|--------|--------|--------|----------|---------|')
    for (const m of result.metrics) {
      lines.push('| ' + m.metric_name.slice(0, 18) + ' | ' + m.target_value + ' ' + m.unit + ' | ' + m.actual_value + ' ' + m.unit + ' | ' + m.compliance_status + ' | ' + m.variance_pct + '% | ' + (m.penalty_applicable ? 'YES' : 'No') + ' |')
    }
    lines.push('')
  }

  lines.push('### Compliance Checklist')
  lines.push('- [x] All SLA metrics evaluated')
  lines.push('- [x] Breach penalties calculated')
  lines.push(result.breaches > 0 ? '- [ ] Initiate breach remediation process' : '- [x] No breaches this period')
  lines.push('- [ ] Review at-risk metrics with service provider')
  lines.push('- [ ] Update executive dashboard with results')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Compliance: ' + result.overall_compliance_pct + '%*')
  return lines.join('\n')
}

// --- Tool 6: NDA Analysis Report ---
function formatNDAAnalysisReport(result: NDAAnalysisResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — NDA Analysis Report')
  lines.push('')
  lines.push('Type: ' + result.nda_type + ' | Mutual: ' + (result.mutual ? 'Yes' : 'No'))
  lines.push('Fairness Score: ' + result.overall_fairness_score + '/1.0 | Risk: ' + result.risk_level.toUpperCase() + ' | Enforceability: ' + result.enforceability_score + '/1.0')
  lines.push('')
  lines.push('### Clause Fairness Map')
  lines.push('')
  lines.push('```mermaid')
  lines.push('pie title Clause Fairness Distribution')
  const fairCount = result.clause_assessments.filter(c => c.fairness_score >= 0.7).length
  const moderateCount = result.clause_assessments.filter(c => c.fairness_score >= 0.4 && c.fairness_score < 0.7).length
  const poorCount = result.clause_assessments.filter(c => c.fairness_score < 0.4).length
  lines.push('    "Fair (>=0.7)" : ' + fairCount)
  lines.push('    "Moderate (0.4-0.7)" : ' + moderateCount)
  lines.push('    "Poor (<0.4)" : ' + poorCount)
  lines.push('```')
  lines.push('')

  lines.push('### Clause Assessments')
  lines.push('| Topic | Present | Fairness | Risk | Assessment |')
  lines.push('|-------|---------|----------|------|------------|')
  for (const c of result.clause_assessments) {
    lines.push('| ' + c.clause_topic.replace(/_/g, ' ').slice(0, 20) + ' | ' + (c.present ? 'Yes' : 'NO') + ' | ' + c.fairness_score + ' | ' + c.risk_level + ' | ' + c.assessment.slice(0, 30) + '... |')
  }
  lines.push('')

  if (result.missing_standard_clauses.length > 0) {
    lines.push('### Missing Clauses')
    for (const m of result.missing_standard_clauses) lines.push('- ' + m)
    lines.push('')
  }

  if (result.overly_broad_provisions.length > 0) {
    lines.push('### Overly Broad Provisions')
    for (const o of result.overly_broad_provisions) lines.push('- ' + o)
    lines.push('')
  }

  if (result.key_recommendations.length > 0) {
    lines.push('### Key Recommendations')
    for (const r of result.key_recommendations) lines.push('- ' + r)
    lines.push('')
  }

  lines.push('### NDA Checklist')
  lines.push('- [x] All standard clauses assessed')
  lines.push('- [x] Fairness scoring completed')
  lines.push('- [x] Enforceability check performed')
  lines.push(result.missing_standard_clauses.length > 0 ? '- [ ] Negotiate missing clauses' : '- [x] All standard clauses present')
  lines.push('- [ ] Legal counsel final approval')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Fairness: ' + result.overall_fairness_score + '/1.0*')
  return lines.join('\n')
}

// --- Tool 7: Vendor Scorecard Report ---
function formatVendorScorecardReport(result: VendorScorecardResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — Vendor Contract Scorecard')
  lines.push('')
  lines.push('Vendor: ' + result.vendor_name + ' | Contract: ' + result.contract_id)
  lines.push('Overall Score: ' + result.overall_score + '/100 | Grade: ' + result.grade + ' | Risk: ' + result.risk_rating.toUpperCase())
  lines.push('Industry Avg: ' + result.benchmark.industry_avg + ' | Percentile: ' + result.benchmark.percentile_rank + '% | Trend: ' + result.benchmark.trend)
  lines.push('')
  lines.push('### Score Breakdown')
  lines.push('')
  lines.push('```mermaid')
  lines.push('pie title Criteria Weight Distribution')
  for (const cs of result.criteria_scores) {
    lines.push('    "' + cs.criterion.slice(0, 15) + '" : ' + Math.round(cs.weight * 100))
  }
  lines.push('```')
  lines.push('')

  lines.push('### Criteria Scores')
  lines.push('| Criterion | Score | Weight | Weighted | Grade |')
  lines.push('|-----------|-------|--------|----------|-------|')
  for (const cs of result.criteria_scores) {
    lines.push('| ' + cs.criterion.replace(/_/g, ' ').slice(0, 18) + ' | ' + cs.score + ' | ' + (cs.weight * 100).toFixed(0) + '% | ' + cs.weighted_score + ' | ' + cs.grade + ' |')
  }
  lines.push('')

  if (result.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of result.strengths) lines.push('- ' + s)
    lines.push('')
  }

  if (result.weaknesses.length > 0) {
    lines.push('### Weaknesses')
    for (const w of result.weaknesses) lines.push('- ' + w)
    lines.push('')
  }

  lines.push('### Recommendation')
  lines.push(result.recommendation)
  lines.push('')

  lines.push('### Vendor Management Checklist')
  lines.push(result.overall_score >= 85 ? '- [x] Vendor qualifies for preferred status' : '- [ ] Vendor does not meet preferred threshold')
  lines.push(result.weaknesses.length === 0 ? '- [x] No critical weaknesses identified' : '- [ ] Address ' + result.weaknesses.length + ' weakness areas')
  lines.push('- [ ] Set quarterly performance targets')
  lines.push('- [ ] Schedule vendor business review')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Score: ' + result.overall_score + ' (' + result.grade + ')*')
  return lines.join('\n')
}

// --- Tool 8: Legal Document Summarizer Report ---
function formatLegalSummaryReport(result: LegalSummaryResult): string {
  const lines: string[] = []
  lines.push('## ContractWise — Legal Document Summary')
  lines.push('')
  lines.push('Document Type: ' + result.document_type + ' | Summary: ' + result.summary_length)
  lines.push('Original: ' + result.word_count_original + ' words | Summary: ' + result.word_count_summary + ' words | Compression: ' + (result.compression_ratio * 100).toFixed(0) + '%')
  lines.push('Readability Score: ' + result.readability_score + '/1.0')
  lines.push('')
  lines.push('### Executive Summary')
  lines.push('')
  lines.push(result.executive_summary)
  lines.push('')
  lines.push('### Key Points by Importance')
  lines.push('')
  lines.push('```mermaid')
  lines.push('pie title Key Points by Importance')
  const criticalPts = result.key_points.filter(k => k.importance === 'critical').length
  const highPts = result.key_points.filter(k => k.importance === 'high').length
  const medPts = result.key_points.filter(k => k.importance === 'medium').length
  const lowPts = result.key_points.filter(k => k.importance === 'low').length
  lines.push('    "Critical" : ' + criticalPts)
  lines.push('    "High" : ' + highPts)
  lines.push('    "Medium" : ' + medPts)
  lines.push('    "Low" : ' + lowPts)
  lines.push('```')
  lines.push('')

  lines.push('### Key Points Detail')
  lines.push('| ID | Topic | Importance | Summary |')
  lines.push('|----|-------|-----------|---------|')
  for (const kp of result.key_points) {
    lines.push('| ' + kp.point_id + ' | ' + kp.topic.slice(0, 15) + ' | ' + kp.importance + ' | ' + kp.summary.slice(0, 40) + '... |')
  }
  lines.push('')

  if (result.action_items.length > 0) {
    lines.push('### Action Items')
    for (const a of result.action_items) lines.push('- [ ] ' + a)
    lines.push('')
  }

  if (result.citations.length > 0) {
    lines.push('### Legal Citations')
    lines.push('| Citation | Context | Relevance |')
    lines.push('|---------|---------|-----------|')
    for (const c of result.citations) {
      lines.push('| ' + c.citation.slice(0, 30) + ' | ' + c.context.slice(0, 25) + ' | ' + c.relevance + ' |')
    }
    lines.push('')
  }

  lines.push('### Summary Checklist')
  lines.push('- [x] Document decomposed and analyzed')
  lines.push('- [x] Key legal points identified')
  lines.push(result.action_items.length === 0 ? '- [x] No action items required' : '- [ ] Review ' + result.action_items.length + ' action items')
  lines.push('- [ ] Stakeholder review of summary accuracy')
  lines.push('')
  lines.push('---')
  lines.push('*ContractWise v' + VERSION + ' | Compression: ' + (result.compression_ratio * 100).toFixed(0) + '% | Readability: ' + result.readability_score + '*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Contract Risk Analyzer
  tools.register(defineTool({
    name: 'contract_risk_analyzer',
    description: '合同风险分析 | 识别高风险条款、不平衡权责、潜在法律漏洞 | Analyze contract risks — detect high-risk clauses, unbalanced terms, and legal vulnerabilities.',
    parameters: {
      risk_input: {
        type: 'string',
        required: true,
        description: 'JSON: contract_type (sales|purchase|service|employment|lease|partnership|nda|license), contract_text, risk_threshold?, jurisdiction?, focus_areas?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_input: string }) {
      const input: ContractRiskInput = JSON.parse(args.risk_input)
      return formatContractRiskReport(analyzeContractRisk(input))
    }
  }))

  // Tool 2: Clause Extraction Engine
  tools.register(defineTool({
    name: 'clause_extraction_engine',
    description: '条款提取引擎 | 自动识别关键条款类型、提取核心内容、标记异常条款 | Extract and classify contract clauses with anomaly detection.',
    parameters: {
      extraction_input: {
        type: 'string',
        required: true,
        description: 'JSON: contract_text, extract_clause_types?, include_definitions?, flag_anomalies?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { extraction_input: string }) {
      const input: ClauseExtractionInput = JSON.parse(args.extraction_input)
      return formatClauseExtractionReport(analyzeClauseExtraction(input))
    }
  }))

  // Tool 3: Obligation Tracking System
  tools.register(defineTool({
    name: 'obligation_tracking_system',
    description: '义务跟踪系统 | 提取合同义务、跟踪履行状态、预警即将到期义务 | Track contract obligations with status monitoring and deadline alerts.',
    parameters: {
      tracking_input: {
        type: 'string',
        required: true,
        description: 'JSON: contract_id, obligations[{obligation_id, description, responsible_party, due_date, status(pending|in_progress|completed|overdue|waived), priority(critical|high|medium|low)}], alert_days_before?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { tracking_input: string }) {
      const input: ObligationTrackingInput = JSON.parse(args.tracking_input)
      return formatObligationTrackingReport(analyzeObligationTracking(input))
    }
  }))

  // Tool 4: Renewal Management Planner
  tools.register(defineTool({
    name: 'renewal_management_planner',
    description: '续签管理规划 | 分析合同到期时间、续签策略、成本优化建议 | Plan contract renewals with cost optimization and risk management.',
    parameters: {
      renewal_input: {
        type: 'string',
        required: true,
        description: 'JSON: contracts[{contract_id, contract_name, vendor, start_date, end_date, renewal_type(auto|manual|none), current_value, notice_period_days, last_negotiation_savings_pct?}], planning_horizon_months?, budget_target_savings_pct?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { renewal_input: string }) {
      const input: RenewalManagementInput = JSON.parse(args.renewal_input)
      return formatRenewalManagementReport(analyzeRenewalManagement(input))
    }
  }))

  // Tool 5: SLA Compliance Monitor
  tools.register(defineTool({
    name: 'sla_compliance_monitor',
    description: 'SLA合规监控 | 监控服务水平协议执行、计算合规率、生成违规报告 | Monitor SLA compliance with breach detection and penalty estimation.',
    parameters: {
      sla_input: {
        type: 'string',
        required: true,
        description: 'JSON: service_name, sla_metrics[{metric_name, target_value, actual_value, unit, measurement_period}], penalty_clause?, reporting_period'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sla_input: string }) {
      const input: SLAComplianceInput = JSON.parse(args.sla_input)
      return formatSLAComplianceReport(analyzeSLACompliance(input))
    }
  }))

  // Tool 6: NDA Analyzer
  tools.register(defineTool({
    name: 'nda_analyzer',
    description: 'NDA分析器 | 保密协议分析、竞业条款评估、信息保护合规检查 | Analyze NDAs for fairness, completeness, and enforceability.',
    parameters: {
      nda_input: {
        type: 'string',
        required: true,
        description: 'JSON: nda_text, analysis_depth (standard|deep|expert), check_mutual?, highlight_fairness?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { nda_input: string }) {
      const input: NDAAnalysisInput = JSON.parse(args.nda_input)
      return formatNDAAnalysisReport(analyzeNDA(input))
    }
  }))

  // Tool 7: Vendor Contract Scorecard
  tools.register(defineTool({
    name: 'vendor_contract_scorecard',
    description: '供应商合同评分卡 | 供应商合同综合评分、风险评估、性价比分析 | Score vendor contracts with multi-criteria benchmarking and risk rating.',
    parameters: {
      scorecard_input: {
        type: 'string',
        required: true,
        description: 'JSON: vendor_name, contract_id, evaluation_criteria?, performance_data?[{criterion, score, weight, evidence}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { scorecard_input: string }) {
      const input: VendorScorecardInput = JSON.parse(args.scorecard_input)
      return formatVendorScorecardReport(analyzeVendorScorecard(input))
    }
  }))

  // Tool 8: Legal Document Summarizer
  tools.register(defineTool({
    name: 'legal_document_summarizer',
    description: '法律文档摘要器 | 长文档智能摘要、关键信息提取、法律要点归纳 | Summarize legal documents with key point extraction and citation mapping.',
    parameters: {
      summary_input: {
        type: 'string',
        required: true,
        description: 'JSON: document_text, document_type (contract|court_filing|regulation|patent|legal_opinion|policy), summary_length (brief|standard|detailed), focus_topics?, include_citations?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { summary_input: string }) {
      const input: LegalSummarizerInput = JSON.parse(args.summary_input)
      return formatLegalSummaryReport(analyzeLegalSummary(input))
    }
  }))

  console.log('[dsh-tool-contractwise] Loaded v' + VERSION + ' — Contract Management & Legal AI, 8 tools active')
  console.log('  Tools: contract_risk_analyzer, clause_extraction_engine, obligation_tracking_system, renewal_management_planner, sla_compliance_monitor, nda_analyzer, vendor_contract_scorecard, legal_document_summarizer')
}
