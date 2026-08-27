/**
 * DSH Insurance Claims Automation Plugin v0.1.0
 *
 * End-to-end insurance claims processing toolkit for DeepSeek Harness Agent.
 * Covers the full claims lifecycle from first notice to settlement, recovery,
 * analytics, and customer self-service. Ocean-green themed status dashboards
 * and payment funnel visualizations included.
 *
 * Features (v0.1.0):
 * - Claim First Notice (multi-channel intake, policy validation, liability triage, survey dispatch, case filing, duty disclosure)
 * - Loss Assessment Engine (damage estimation, residual value, repair vs. Third-party adjustment, survey report, dispute review)
 * - Coverage Verifier (policy clause application, scope analysis, exclusion elimination, liability apportionment, proximate cause, claims-made triggers)
 * - Fraud Detector (duplicate claim ID, temporal anomalies, network analysis, amount deviation, pattern matching, risk scoring)
 * - Settlement Negotiator (compensation calculation, negotiation strategy, concession boundaries, court-outcome estimation, mediation advice, optimized payout)
 * - Recovery Tracker (at-fault party ID, recovery amount, statute of limitations, recovery strategy, apportionment, success probability)
 * - Claims Analytics Dashboard (loss ratio, average claim cost, cycle time, denial ratio, reserves, IBNR, channel distribution)
 * - Customer Claim Portal (self-service claims, progress tracking, document upload, satisfaction rating, renewal advice, coverage-gap analysis)
 *
 * @module dsh-tool-insuranceclaim
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-insuranceclaim'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM ====================

function createSeededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) & 0x7fffffff
    return (hash & 0x7fffffff) / 0x7fffffff
  }
}

function seededRandom(seed: string, index: number): number {
  return createSeededRandom(`${seed}-${index}`)()
}

// ==================== HELPERS ====================

function calculateDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

function bar(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function funnelBar(label: string, value: number, max: number, width: number = 30): string {
  const filled = Math.round((value / max) * width)
  const pad = ' '.repeat(Math.max(0, width - filled))
  const filledBar = '▓'.repeat(filled)
  return `  ${label.padEnd(24)} │${pad}${filledBar}│ ${value.toLocaleString()}`
}

// ==================== SHARED DASHBOARD ====================

function buildClaimsStatusDashboard(statuses: Array<{ status: string; count: number; color?: string }>, title: string): string {
  const total = statuses.reduce((s, r) => s + r.count, 0)
  const max = Math.max(...statuses.map(s => s.count))
  const lines: string[] = []
  lines.push(`  ┌─ ${title} ${'─'.repeat(Math.max(1, 50 - title.length))}┐`)
  for (const row of statuses) {
    const pct = total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0'
    const b = bar(row.count, max, 18)
    lines.push(`  │ ${row.status.padEnd(16)} ${b} ${String(row.count).padStart(5)} (${pct}%) │`)
  }
  lines.push(`  │ ${'TOTAL'.padEnd(16)} ${'─'.repeat(18)} ${String(total).padStart(5)} (100%) │`)
  lines.push(`  └${'─'.repeat(54)}┘`)
  return lines.join('\n')
}

function buildPaymentFunnel(stages: Array<{ stage: string; count: number; amount?: number }>, title: string): string {
  const max = Math.max(...stages.map(s => s.count))
  const lines: string[] = []
  lines.push(`  ┌─ ${title} ${'─'.repeat(Math.max(1, 50 - title.length))}┐`)
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i]
    const amtStr = s.amount !== undefined ? `  $${s.amount.toLocaleString()}` : ''
    lines.push(funnelBar('▶ ' + s.stage, s.count, max, 28) + amtStr)
    if (i < stages.length - 1) {
      const dropRate = stages[i].count > 0 ? (((stages[i].count - stages[i + 1].count) / stages[i].count) * 100).toFixed(1) : '0.0'
      lines.push(`  ${' '.repeat(24)} │${'  ↓ drop ' + dropRate + '%'.padEnd(26)}│`)
    }
  }
  lines.push(`  └${'─'.repeat(54)}┘`)
  return lines.join('\n')
}

// ==================== TYPES: TOOL 1 - CLAIM FIRST NOTICE ====================

interface FirstNoticeInput {
  claim_no?: string
  policy_no: string
  incident_date: string
  report_date: string
  channel: 'phone' | 'app' | 'web' | 'agent' | 'wechat' | 'counter'
  claimant_name: string
  contact_phone: string
  incident_type: string
  incident_location: string
  description: string
  injuries_reported: boolean
  third_party_involved: boolean
  police_report_filed: boolean
  police_report_no?: string
  estimated_loss?: number
  policy_type: string
  coverage_types: string[]
  policy_effective: string
  policy_expiry: string
}

interface PolicyValidationResult {
  policy_active: boolean
  coverage_applicable: string[]
  coverage_excluded: string[]
  within_term: boolean
  waiting_period_ok: boolean
  premium_current: boolean
  validation_score: number
}

interface LiabilityTriageResult {
  preliminary_liability: string
  liability_basis: string
  recommended_action: string
  urgency_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  investigation_required: boolean
}

interface SurveyDispatchResult {
  surveyor_assigned: string
  surveyor_contact: string
  estimated_arrival: string
  survey_type: string
  special_instructions: string[]
}

interface CaseFilingResult {
  case_no: string
  filing_date: string
  handling_unit: string
  assigned_adjuster: string
  initial_reserve: number
  filing_category: string
}

interface DutyDisclosureResult {
  duties_disclosed: string[]
  claimant_rights: string[]
  next_steps: string[]
  timeline_commitments: string[]
}

// ==================== TYPES: TOOL 2 - LOSS ASSESSMENT ====================

interface LossAssessmentInput {
  claim_no: string
  asset_type: string
  asset_description: string
  asset_value: number
  asset_age_years: number
  damage_description: string
  damage_type: string
  damage_percentage: number
  repair_estimate: number
  replacement_cost: number
  salvage_value: number
  depreciation_rate: number
  third_party_surveyor: string
  third_party_report_no?: string
  dispute_flag: boolean
  previous_damage: boolean
  usage_type: string
  location: string
}

interface DamageAssessment {
  total_loss: boolean
  loss_percentage: number
  repair_cost: number
  replacement_cost: number
  actual_cash_value: number
  adjusted_loss: number
}

interface RepairVsResetDecision {
  recommendation: 'REPAIR' | 'REPLACE' | 'TOTAL_LOSS'
  economic_repair_ratio: number
  decision_rationale: string
  salvage_impact: number
  net_cost_repair: number
  net_cost_replace: number
  savings: number
}

interface ThirdPartyAdjustment {
  surveyor_name: string
  survey_amount: number
  company_amount: number
  variance: number
  variance_pct: number
  adjustment_notes: string[]
  reconciliation: string
}

// ==================== TYPES: TOOL 3 - COVERAGE VERIFIER ====================

interface CoverageVerifyInput {
  claim_no: string
  policy_type: string
  trigger_type: 'occurrence' | 'claims-made'
  policy_period_start: string
  policy_period_end: string
  retroactive_date?: string
  incident_date: string
  claim_reported_date: string
  coverage_grants: string[]
  exclusion_clauses: string[]
  policy_limits: Array<{ coverage: string; limit: string; deductible: number }>
  underlying_facts: string[]
  peril_code: string
  cause_of_loss_chain: string[]
  applicable_laws: string[]
  concurrent_causes: string[]
}

interface ClauseApplicability {
  clause: string
  applicable: boolean
  applicability_score: number
  analysis: string
}

interface ExclusionAnalysis {
  exclusion: string
  triggered: boolean
  trigger_facts: string[]
  exception_applicable: boolean
  exception_clause?: string
}

interface ProximateCauseResult {
  dominant_cause: string
  cause_chain: string[]
  covered_peril_involved: boolean
  excluded_peril_involved: boolean
  apportionment_required: boolean
  apportionment_pct: number
}

// ==================== TYPES: TOOL 4 - FRAUD DETECTOR ====================

interface FraudDetectionInput {
  claim_no: string
  insured_name: string
  claim_amount: number
  claim_type: string
  incident_date: string
  report_date: string
  policy_inception: string
  prior_claims_count: number
  prior_claims_amount: number
  relationship_to_beneficiary: string
  financial_status: string
  employment_status: string
  medical_reports: boolean
  witness_available: boolean
  digital_footprint: boolean
  social_media_flags: string[]
  claim_amount_deviation: number
  similar_claims_pattern: boolean
  time_pattern: string
}

interface DuplicateClaimResult {
  duplicate_detected: boolean
  matched_claims: Array<{ claim_id: string; similarity: number; reason: string }>
  cross_reference_sources: string[]
}

interface TemporalAnomalyResult {
  anomaly_detected: boolean
  anomalies: Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; description: string }>
  pattern_score: number
}

interface NetworkAnalysisResult {
  connections_found: Array<{ entity: string; relation: string; risk_flag: boolean }>
  network_risk_score: number
  hidden_relationships: string[]
  high_risk_entities: string[]
}

interface FraudRiskScore {
  overall_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  components: Array<{ component: string; score: number; weight: number }>
  recommendation: string
  investigation_priority: number
}

// ==================== TYPES: TOOL 5 - SETTLEMENT NEGOTIATOR ====================

interface SettlementInput {
  claim_no: string
  claim_type: string
  claimed_amount: number
  assessed_amount: number
  policy_limit: number
  deductible: number
  liability_percentage: number
  claimant_expectation: number
  negotiation_rounds: number
  mediation_available: boolean
  litigation_threat: boolean
  precedent_cases: Array<{ case_ref: string; awarded_amount: number; facts_similar: boolean }>
  injury_severity: string
  economic_damages: number
  non_economic_damages: number
  jurisdiction: string
  policy_type: string
}

interface CompensationCalculation {
  gross_entitlement: number
  deductible_applied: number
  liability_adjusted: number
  policy_limit_capped: number
  net_settlement_range: { low: number; mid: number; high: number }
  recommended_offer: number
}

interface NegotiationStrategy {
  opening_offer: number
  target_settlement: number
  walk_away_point: number
  concession_pattern: string[]
  leverage_points: string[]
  weaknesses: string[]
}

interface CourtOutcomeEstimate {
  estimated_award: number
  award_range: { low: number; high: number }
  litigation_cost: number
  duration_months: number
  probability_favorable: number
  expected_value: number
}

// ==================== TYPES: TOOL 6 - RECOVERY TRACKER ====================

interface RecoveryInput {
  claim_no: string
  claim_paid_amount: number
  at_fault_party: string
  at_fault_party_insurer?: string
  at_fault_contact: string
  fault_percentage: number
  liability_established: boolean
  statute_of_limitations_date: string
  incident_date: string
  jurisdiction: string
  defendant_assets: number
  defendant_insurance_limit?: number
  subrogation_waiver: boolean
  comparative_fault: boolean
  recovery_expenses: number
  third_party_legal_counsel: string
}

interface RecoveryAmountCalculation {
  gross_recovery: number
  expense_deduction: number
  net_recovery: number
  insured_recovery: number
  insurer_recovery: number
  recovery_percentage: number
}

interface RecoveryStrategy {
  recommended_approach: string
  timeline: string
  demands_to_issue: string[]
  negotiation_leverage: string[]
  litigation_recommended: boolean
  litigation_threshold: number
  settlement_range: { low: number; high: number }
}

interface RecoverySuccessProbability {
  overall_probability: number
  factors: Array<{ factor: string; impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; weight: number }>
  risk_adjustment: number
  expected_recovery: number
}

// ==================== TYPES: TOOL 7 - CLAIMS ANALYTICS ====================

interface ClaimsAnalyticsInput {
  reporting_period: string
  business_line: string
  channel_mix: Array<{ channel: string; claims_count: number; premium: number }>
  total_claims_count: number
  total_claims_paid: number
  total_reserves: number
  total_premium_earned: number
  claims_closed: number
  claims_pending: number
  claims_denied: number
  denial_reasons: Array<{ reason: string; count: number }>
  average_settlement_days: number
  ibnr_estimate: number
  case_reserves: Array<{ claim_no: string; reserve: number; paid: number }>
  development_triangles?: string
}

interface LossRatioMetrics {
  loss_ratio: number
  combined_ratio: number
  frequency: number
  severity: number
  pure_premium: number
  benchmark_comparison: string
}

interface ReserveAnalysis {
  total_reserves: number
  case_reserves: number
  ibnr: number
  bulk_reserves: number
  adequacy_ratio: number
  development_factor: number
  projected_ultimate: number
}

// ==================== TYPES: TOOL 8 - CUSTOMER CLAIM PORTAL ====================

interface CustomerPortalInput {
  customer_id: string
  customer_name: string
  policy_no: string
  policy_type: string
  claim_history: Array<{ claim_no: string; type: string; status: string; amount: number; date: string }>
  current_claim_ref?: string
  satisfaction_scores: Array<{ claim_no: string; score: number; feedback: string }>
  coverage_gaps: Array<{ coverage: string; current: number; recommended: number }>
  renewal_due_date: string
  payment_history: string
  documents_uploaded: Array<{ name: string; date: string; status: string }>
  communication_preferences: string[]
}

interface SelfServiceClaimResult {
  eligible: boolean
  eligibility_reason: string
  fast_track_available: boolean
  estimated_processing_days: number
  required_documents: string[]
  next_steps: string[]
}

interface CoverageGapAnalysis {
  gaps: Array<{ coverage: string; current: number; recommended: number; gap: number; priority: 'LOW' | 'MEDIUM' | 'HIGH' }>
  total_gap_amount: number
  recommendations: string[]
}

// ==================== TOOL 1 IMPLEMENTATION: CLAIM FIRST NOTICE ====================

function validatePolicy(input: FirstNoticeInput): PolicyValidationResult {
  const withinTerm = calculateDaysBetween(input.policy_effective, input.incident_date) >= 0 &&
    calculateDaysBetween(input.incident_date, input.policy_expiry) >= 0
  const waitingPeriodOk = calculateDaysBetween(input.policy_effective, input.incident_date) >= 15
  const premiumCurrent = true

  const coverageApplicable: string[] = []
  const coverageExcluded: string[] = []
  for (const ct of input.coverage_types) {
    if (input.policy_type.toLowerCase().includes(ct.toLowerCase()) ||
        ct.toLowerCase().includes(input.incident_type.toLowerCase().split(' ')[0])) {
      coverageApplicable.push(ct)
    } else {
      coverageExcluded.push(ct)
    }
  }
  if (coverageApplicable.length === 0) coverageApplicable.push(...input.coverage_types.slice(0, 1))

  const validationScore = (withinTerm ? 25 : 0) + (waitingPeriodOk ? 25 : 0) + (premiumCurrent ? 25 : 0) + (coverageApplicable.length > 0 ? 25 : 0)

  return {
    policy_active: withinTerm && premiumCurrent,
    coverage_applicable: coverageApplicable,
    coverage_excluded: coverageExcluded,
    within_term: withinTerm,
    waiting_period_ok: waitingPeriodOk,
    premium_current: premiumCurrent,
    validation_score: validationScore
  }
}

function triageLiability(input: FirstNoticeInput): LiabilityTriageResult {
  let preliminary = 'UNDETERMINED'
  let basis = 'Initial assessment pending full investigation'
  let action = 'Proceed with standard investigation'
  let urgency: LiabilityTriageResult['urgency_level'] = 'MEDIUM'
  let investigationRequired = true

  if (input.injuries_reported && input.third_party_involved) {
    preliminary = 'LIKELY INSURED LIABLE'
    basis = 'Injury + third-party involvement suggests insured liability; duty of care likely breached'
    action = 'Immediate investigation and evidence preservation required'
    urgency = 'CRITICAL'
  } else if (input.third_party_involved) {
    preliminary = 'POSSIBLE SHARED LIABILITY'
    basis = 'Third-party involvement; liability requires fault determination'
    action = 'Dispatch surveyor, collect third-party details, obtain police report'
    urgency = 'HIGH'
  } else if (input.injuries_reported) {
    preliminary = 'LIKELY INSURED LIABILITY'
    basis = 'Injury reported; premises/operations liability under evaluation'
    action = 'Medical assessment, site inspection required'
    urgency = 'HIGH'
  } else {
    preliminary = 'FIRST PARTY LOSS'
    basis = 'No third-party involvement; first-party property/bodily coverage applies'
    action = 'Verify coverage limits, schedule survey'
    urgency = 'MEDIUM'
  }

  if (input.police_report_filed) {
    basis += '; police report on file supports official record'
  }

  return { preliminary_liability: preliminary, liability_basis: basis, recommended_action: action, urgency_level: urgency, investigation_required: investigationRequired }
}

function dispatchSurveyor(input: FirstNoticeInput, liability: LiabilityTriageResult): SurveyDispatchResult {
  const surveyorPool = ['Zhang Wei - Senior', 'Li Ming - Property', 'Wang Fang - Auto', 'Chen Jie - Liability', 'Yang Bo - Catastrophe']
  const idx = Math.floor(seededRandom(input.policy_no, 1) * surveyorPool.length)
  const assigned = surveyorPool[idx]

  const surveyTypes: Record<string, string> = {
    CRITICAL: 'Emergency on-site survey within 4 hours',
    HIGH: 'Priority survey within 24 hours',
    MEDIUM: 'Standard survey within 48 hours',
    LOW: 'Scheduled survey within 5 business days'
  }

  const instructions: string[] = []
  if (input.injuries_reported) instructions.push('Document all injury details and medical reports')
  if (input.third_party_involved) instructions.push('Collect third-party contact and insurance details')
  if (input.police_report_filed) instructions.push('Obtain police report No. ' + (input.police_report_no || 'TBD'))
  instructions.push('Photograph all damage, scene context, and contributing factors')
  instructions.push('Interview witnesses and document statements')

  return {
    surveyor_assigned: assigned,
    surveyor_contact: `139-${String(Math.floor(seededRandom(input.policy_no, 2) * 9000 + 1000))}-${String(Math.floor(seededRandom(input.policy_no, 3) * 9000 + 1000))}`,
    estimated_arrival: surveyTypes[liability.urgency_level],
    survey_type: liability.urgency_level === 'CRITICAL' || liability.urgency_level === 'HIGH' ? 'PRIORITY ON-SITE' : 'STANDARD',
    special_instructions: instructions
  }
}

function fileCase(input: FirstNoticeInput, liability: LiabilityTriageResult, seed: string): CaseFilingResult {
  const caseNo = `CLM-${new Date().getFullYear()}-${String(Math.floor(seededRandom(seed, 1) * 90000 + 10000))}`
  const units: Record<string, string> = {
    CRITICAL: 'Major Claims Division',
    HIGH: 'Specialty Claims Unit',
    MEDIUM: 'Standard Claims Department',
    LOW: 'Express Claims Processing'
  }
  const adjusters = ['Liu Yang', 'Zhao Ting', 'Sun Hao', 'Wu Xin', 'Xu Lei']
  const adjIdx = Math.floor(seededRandom(seed, 2) * adjusters.length)

  return {
    case_no: caseNo,
    filing_date: input.report_date,
    handling_unit: units[liability.urgency_level],
    assigned_adjuster: adjusters[adjIdx],
    initial_reserve: (input.estimated_loss || 10000) * 1.2,
    filing_category: input.incident_type.toUpperCase().replace(/\s+/g, '_')
  }
}

function discloseDuties(input: FirstNoticeInput, liability: LiabilityTriageResult): DutyDisclosureResult {
  return {
    duties_disclosed: [
      'Duty of utmost good faith (Uberrimae Fidei)',
      'Insurer obligation to investigate within statutory timeframe',
      'Duty to defend insured against third-party claims',
      'Obligation to communicate coverage determination in writing',
      'Duty to provide claim reference and adjuster contact'
    ],
    claimant_rights: [
      'Right to receive written acknowledgment within 24 hours',
      'Right to request surveyor credentials and scope',
      'Right to independent damage assessment',
      'Right to dispute coverage determination with written appeal',
      'Right to regulatory complaint if dissatisfied with handling'
    ],
    next_steps: [
      'Surveyor will contact you within the committed timeframe',
      'Preserve all evidence and documentation',
      'Do not admit liability or make settlement offers',
      'Submit all supporting documents via designated channel',
      'Direct questions to assigned adjuster'
    ],
    timeline_commitments: [
      'Acknowledgment issued: within 24 hours of receipt',
      'Survey completed: per urgency commitment',
      'Coverage determination: within 15 business days of complete documentation',
      'Settlement offer: within 10 business days of agreement',
      'Payment issued: within 5 business days of acceptance'
    ]
  }
}

function formatFirstNoticeReport(
  input: FirstNoticeInput,
  validation: PolicyValidationResult,
  liability: LiabilityTriageResult,
  survey: SurveyDispatchResult,
  caseFile: CaseFilingResult,
  disclosure: DutyDisclosureResult
): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║          FIRST NOTICE OF CLAIM — OCEAN CLAIMS              ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push(buildClaimsStatusDashboard([
    { status: 'NOTIFIED', count: 1 },
    { status: 'VALIDATING', count: 1 },
    { status: 'SURVEYING', count: 0 },
    { status: 'ADJUSTING', count: 0 },
    { status: 'RESOLVED', count: 0 }
  ], 'Claim Lifecycle Status'))

  lines.push('')
  lines.push('  ─── INCIDENT SUMMARY ───────────────────────────────────────')
  lines.push(`  Claim Ref:            ${caseFile.case_no}`)
  lines.push(`  Policy No:            ${input.policy_no}`)
  lines.push(`  Channel:              ${input.channel.toUpperCase()}`)
  lines.push(`  Claimant:             ${input.claimant_name}`)
  lines.push(`  Contact:              ${input.contact_phone}`)
  lines.push(`  Incident Date:        ${input.incident_date}`)
  lines.push(`  Report Date:          ${input.report_date}`)
  lines.push(`  Type:                 ${input.incident_type}`)
  lines.push(`  Location:             ${input.incident_location}`)
  lines.push(`  Description:          ${input.description}`)
  if (input.estimated_loss) lines.push(`  Estimated Loss:       $${input.estimated_loss.toLocaleString()}`)

  lines.push('')
  lines.push('  ─── POLICY VALIDATION ──────────────────────────────────────')
  lines.push(`  Policy Active:        ${validation.policy_active ? 'YES — In-force and valid' : 'NO — Policy lapsed or invalid'}`)
  lines.push(`  Within Term:          ${validation.within_term ? 'YES' : 'NO'}`)
  lines.push(`  Waiting Period:       ${validation.waiting_period_ok ? 'SATISFIED' : 'NOT MET — May affect coverage'}`)
  lines.push(`  Premium Status:       ${validation.premium_current ? 'CURRENT' : 'OVERDUE'}`)
  lines.push(`  Applicable Coverage:  ${validation.coverage_applicable.join(', ')}`)
  if (validation.coverage_excluded.length > 0) {
    lines.push(`  Excluded Coverage:    ${validation.coverage_excluded.join(', ')}`)
  }
  lines.push(`  Validation Score:     ${validation.validation_score}/100`)

  lines.push('')
  lines.push('  ─── PRELIMINARY LIABILITY TRIAGE ─────────────────────────')
  lines.push(`  Liability:            ${liability.preliminary_liability}`)
  lines.push(`  Basis:                ${liability.liability_basis}`)
  lines.push(`  Urgency:              ${liability.urgency_level}`)
  lines.push(`  Recommended Action:   ${liability.recommended_action}`)
  lines.push(`  Investigation Needed: ${liability.investigation_required ? 'YES' : 'NO'}`)

  lines.push('')
  lines.push('  ─── SURVEY DISPATCH ───────────────────────────────────────')
  lines.push(`  Surveyor Assigned:    ${survey.surveyor_assigned}`)
  lines.push(`  Contact:              ${survey.surveyor_contact}`)
  lines.push(`  Estimated Arrival:    ${survey.estimated_arrival}`)
  lines.push(`  Survey Type:          ${survey.survey_type}`)
  lines.push('  Special Instructions:')
  for (const instr of survey.special_instructions) {
    lines.push(`    * ${instr}`)
  }

  lines.push('')
  lines.push('  ─── CASE FILING ───────────────────────────────────────────')
  lines.push(`  Case No:              ${caseFile.case_no}`)
  lines.push(`  Filing Date:          ${caseFile.filing_date}`)
  lines.push(`  Handling Unit:        ${caseFile.handling_unit}`)
  lines.push(`  Adjuster:             ${caseFile.assigned_adjuster}`)
  lines.push(`  Initial Reserve:      $${Math.round(caseFile.initial_reserve).toLocaleString()}`)
  lines.push(`  Category:             ${caseFile.filing_category}`)

  lines.push('')
  lines.push('  ─── DUTY DISCLOSURE & CLAIMANT RIGHTS ─────────────────────')
  lines.push('  Duties Disclosed:')
  for (const d of disclosure.duties_disclosed) lines.push(`    * ${d}`)
  lines.push('')
  lines.push('  Claimant Rights:')
  for (const r of disclosure.claimant_rights) lines.push(`    * ${r}`)
  lines.push('')
  lines.push('  Next Steps:')
  for (const s of disclosure.next_steps) lines.push(`    * ${s}`)
  lines.push('')
  lines.push('  Timeline Commitments:')
  for (const t of disclosure.timeline_commitments) lines.push(`    * ${t}`)

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL (Initial Stage) ─────────────────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Claims Notified', count: 1 },
    { stage: 'Under Review', count: 1 },
    { stage: 'Survey Complete', count: 0 },
    { stage: 'Approval', count: 0 },
    { stage: 'Payment', count: 0 }
  ], 'Claims Processing Funnel'))

  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 2 IMPLEMENTATION: LOSS ASSESSMENT ====================

function assessDamage(input: LossAssessmentInput): DamageAssessment {
  const lossPct = input.damage_percentage / 100
  const totalLoss = lossPct >= 0.75
  const repairCost = Math.min(input.repair_estimate, input.replacement_cost * 0.9)
  const depreciation = input.asset_value * (input.depreciation_rate / 100) * input.asset_age_years
  const actualCashValue = Math.max(0, input.asset_value - depreciation)
  const adjustedLoss = totalLoss ? actualCashValue : Math.min(repairCost, actualCashValue) * lossPct

  return {
    total_loss: totalLoss,
    loss_percentage: lossPct * 100,
    repair_cost: Math.round(repairCost * 100) / 100,
    replacement_cost: input.replacement_cost,
    actual_cash_value: Math.round(actualCashValue * 100) / 100,
    adjusted_loss: Math.round(adjustedLoss * 100) / 100
  }
}

function decideRepairVsReset(input: LossAssessmentInput, damage: DamageAssessment): RepairVsResetDecision {
  const economicRepairRatio = damage.repair_cost / Math.max(1, input.replacement_cost)
  let recommendation: RepairVsResetDecision['recommendation']
  let rationale: string
  const salvageImpact = input.salvage_value
  const netCostRepair = damage.repair_cost - salvageImpact
  const netCostReplace = input.replacement_cost - salvageImpact

  if (damage.total_loss) {
    recommendation = 'TOTAL_LOSS'
    rationale = `Loss ratio ${damage.loss_percentage.toFixed(0)}% exceeds 75% threshold. Asset declared total loss; settlement on Actual Cash Value basis.`
  } else if (economicRepairRatio > 0.7) {
    recommendation = 'REPLACE'
    rationale = `Economic repair ratio ${(economicRepairRatio * 100).toFixed(0)}% exceeds 70% threshold. Replacement more cost-effective than repair.`
  } else {
    recommendation = 'REPAIR'
    rationale = `Economic repair ratio ${(economicRepairRatio * 100).toFixed(0)}% within acceptable range. Restoration recommended.`
  }

  return {
    recommendation,
    economic_repair_ratio: Math.round(economicRepairRatio * 10000) / 100,
    decision_rationale: rationale,
    salvage_impact: salvageImpact,
    net_cost_repair: Math.round(netCostRepair * 100) / 100,
    net_cost_replace: Math.round(netCostReplace * 100) / 100,
    savings: Math.round(Math.abs(netCostRepair - netCostReplace) * 100) / 100
  }
}

function runThirdPartyAdjustment(input: LossAssessmentInput, damage: DamageAssessment): ThirdPartyAdjustment {
  const variance = input.third_party_surveyor ? (damage.adjusted_loss - (input.asset_value || damage.adjusted_loss)) : 0
  const variancePct = damage.adjusted_loss > 0 ? (variance / damage.adjusted_loss) * 100 : 0
  const notes: string[] = []
  let reconciliation = 'No third-party survey; relying on internal assessment'

  if (input.third_party_surveyor && input.third_party_report_no) {
    reconciliation = `Survey by ${input.third_party_surveyor} (Report ${input.third_party_report_no}): amount reconciled with internal assessment`
    if (Math.abs(variancePct) > 15) {
      notes.push(`Material variance detected: ${variancePct.toFixed(1)}% — escalation to technical committee recommended`)
    }
    if (input.dispute_flag) {
      notes.push('Dispute noted: initiate formal dispute resolution clause per policy terms')
    }
    if (input.previous_damage) {
      notes.push('Previous damage identified: segregate pre-existing deterioration from current loss')
    }
  }

  return {
    surveyor_name: input.third_party_surveyor,
    survey_amount: input.asset_value || damage.adjusted_loss,
    company_amount: damage.adjusted_loss,
    variance: Math.round(variance * 100) / 100,
    variance_pct: Math.round(variancePct * 100) / 100,
    adjustment_notes: notes,
    reconciliation
  }
}

function formatLossAssessmentReport(
  input: LossAssessmentInput,
  damage: DamageAssessment,
  decision: RepairVsResetDecision,
  adjustment: ThirdPartyAdjustment
): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║             LOSS ASSESSMENT ENGINE — OCEAN CLAIMS          ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push('  ─── ASSET DETAILS ─────────────────────────────────────────')
  lines.push(`  Claim No:             ${input.claim_no}`)
  lines.push(`  Asset Type:           ${input.asset_type}`)
  lines.push(`  Description:          ${input.asset_description}`)
  lines.push(`  Asset Value:          $${input.asset_value.toLocaleString()}`)
  lines.push(`  Asset Age:            ${input.asset_age_years} years`)
  lines.push(`  Location:             ${input.location}`)
  lines.push(`  Usage:                ${input.usage_type}`)
  lines.push(`  Damage Type:          ${input.damage_type}`)
  lines.push(`  Damage Description:   ${input.damage_description}`)
  lines.push(`  Damage Percentage:    ${input.damage_percentage}%`)

  lines.push('')
  lines.push('  ─── DAMAGE ASSESSMENT ──────────────────────────────────────')
  lines.push(`  Total Loss:           ${damage.total_loss ? 'YES — Asset declared constructive/actual total loss' : 'NO — Repairable'}`)
  lines.push(`  Loss Percentage:      ${damage.loss_percentage.toFixed(1)}%`)
  lines.push(`  Repair Cost:          $${damage.repair_cost.toLocaleString()}`)
  lines.push(`  Replacement Cost:     $${damage.replacement_cost.toLocaleString()}`)
  lines.push(`  Actual Cash Value:    $${damage.actual_cash_value.toLocaleString()}`)
  lines.push(`  Adjusted Loss:        $${damage.adjusted_loss.toLocaleString()}`)

  lines.push('')
  lines.push('  ─── REPAIR vs. REPLACE DECISION ──────────────────────────')
  lines.push(`  Recommendation:       ${decision.recommendation}`)
  lines.push(`  Economic Repair Ratio: ${decision.economic_repair_ratio}%`)
  lines.push(`  Rationale:            ${decision.decision_rationale}`)
  lines.push(`  Salvage Impact:       $${decision.salvage_impact.toLocaleString()}`)
  lines.push(`  Net Cost (Repair):    $${decision.net_cost_repair.toLocaleString()}`)
  lines.push(`  Net Cost (Replace):   $${decision.net_cost_replace.toLocaleString()}`)
  lines.push(`  Savings:              $${decision.savings.toLocaleString()}`)
  lines.push(`  ${decision.recommendation === 'REPAIR' ? 'Repair option saves insurer on net cost basis' : decision.recommendation === 'REPLACE' ? 'Replacement proves more economical given total cost of repair' : 'Total loss settlement at actual cash value minus salvage'}`)

  lines.push('')
  lines.push('  ─── THIRD-PARTY / SURVEYOR ADJUSTMENT ─────────────────────')
  lines.push(`  Surveyor:             ${adjustment.surveyor_name || 'N/A'}`)
  lines.push(`  Survey Amount:        $${adjustment.survey_amount.toLocaleString()}`)
  lines.push(`  Company Amount:       $${adjustment.company_amount.toLocaleString()}`)
  lines.push(`  Variance:             $${adjustment.variance.toLocaleString()} (${adjustment.variance_pct}%)`)
  lines.push(`  Reconciliation:       ${adjustment.reconciliation}`)
  if (adjustment.adjustment_notes.length > 0) {
    lines.push('  Notes:')
    for (const n of adjustment.adjustment_notes) lines.push(`    * ${n}`)
  }

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL — Assessment to Settlement ─────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Claims Registered', count: 1 },
    { stage: 'Assessment Done', count: 1 },
    { stage: 'Dispute Resolution', count: input.dispute_flag ? 1 : 0 },
    { stage: 'Approval', count: 0 },
    { stage: 'Payment', count: 0 }
  ], 'Assessment Funnel'))

  lines.push('')
  lines.push(buildClaimsStatusDashboard([
    { status: 'REGISTERED', count: 1 },
    { status: 'ASSESSED', count: 1 },
    { status: 'DISPUTED', count: input.dispute_flag ? 1 : 0 },
    { status: 'APPROVED', count: 0 },
    { status: 'PAID', count: 0 }
  ], 'Assessment Status'))

  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 3 IMPLEMENTATION: COVERAGE VERIFIER ====================

function analyzeClauses(input: CoverageVerifyInput): ClauseApplicability[] {
  return input.coverage_grants.map(clause => {
    const clauseScore = input.underlying_facts.some(f =>
      f.toLowerCase().includes(clause.toLowerCase().split(' ')[0])
    ) ? 85 + Math.floor(seededRandom(clause, 1) * 15) : 20 + Math.floor(seededRandom(clause, 2) * 30)
    return {
      clause,
      applicable: clauseScore >= 50,
      applicability_score: clauseScore,
      analysis: clauseScore >= 50
        ? `Clause applicable: facts support coverage grant with ${clauseScore}% confidence`
        : `Clause applicability uncertain: need additional fact development (${clauseScore}%)`
    }
  })
}

function analyzeExclusions(input: CoverageVerifyInput): ExclusionAnalysis[] {
  return input.exclusion_clauses.map(exclusion => {
    const triggered = input.underlying_facts.some(f =>
      f.toLowerCase().includes(exclusion.toLowerCase().split(' ')[0])
    )
    const exceptionApplicable = triggered && seededRandom(exclusion, 1) > 0.5
    return {
      exclusion,
      triggered,
      trigger_facts: triggered ? input.underlying_facts.filter(f => f.toLowerCase().includes(exclusion.toLowerCase().split(' ')[0])) : [],
      exception_applicable: exceptionApplicable,
      exception_clause: exceptionApplicable ? `Exception narrows scope of ${exclusion}` : undefined
    }
  })
}

function determineProximateCause(input: CoverageVerifyInput): ProximateCauseResult {
  const causeChain = input.cause_of_loss_chain.length > 0 ? input.cause_of_loss_chain : ['Initial event', 'Proximate cause', 'Resulting loss']
  const coveredPeril = input.peril_code && !input.exclusion_clauses.some(e => e.includes(input.peril_code))
  const excludedPeril = input.exclusion_clauses.some(e => input.peril_code && e.includes(input.peril_code))
  const apportionment = input.concurrent_causes.length > 1
  const apportionmentPct = apportionment ? Math.round(100 / input.concurrent_causes.length) : 100

  return {
    dominant_cause: causeChain[causeChain.length - 1] || 'Undetermined',
    cause_chain: causeChain,
    covered_peril_involved: !!coveredPeril,
    excluded_peril_involved: excludedPeril,
    apportionment_required: apportionment,
    apportionment_pct: apportionmentPct
  }
}

function applyClaimsMadeTriggers(input: CoverageVerifyInput): { within_period: boolean; retro_compliant: boolean; late_reporting: boolean; analysis: string } {
  const withinPeriod = calculateDaysBetween(input.policy_period_start, input.incident_date) >= 0 &&
    calculateDaysBetween(input.incident_date, input.policy_period_end) >= 0
  const retroCompliant = input.retroactive_date
    ? calculateDaysBetween(input.retroactive_date, input.incident_date) >= 0
    : true
  const lateReporting = calculateDaysBetween(input.incident_date, input.claim_reported_date) > 365

  let analysis = `Policy period check: ${withinPeriod ? 'WITHIN' : 'OUTSIDE'} policy period. `
  analysis += `Retroactive date compliance: ${retroCompliant ? 'COMPLIANT' : 'VIOLATION — incident predates retro date'}. `
  analysis += `Reporting timeliness: ${lateReporting ? 'LATE — potential prejudice defense available' : 'TIMELY'}.`

  return { within_period: withinPeriod, retro_compliant: retroCompliant, late_reporting: lateReporting, analysis }
}

function formatCoverageReport(
  input: CoverageVerifyInput,
  clauses: ClauseApplicability[],
  exclusions: ExclusionAnalysis[],
  proximateCause: ProximateCauseResult,
  claimsMade: ReturnType<typeof applyClaimsMadeTriggers>
): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║              COVERAGE VERIFIER — OCEAN CLAIMS              ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push('  ─── POLICY REFERENCE ────────────────────────────────────────')
  lines.push(`  Claim No:             ${input.claim_no}`)
  lines.push(`  Policy Type:          ${input.policy_type}`)
  lines.push(`  Trigger Type:         ${input.trigger_type.toUpperCase()}`)
  lines.push(`  Policy Period:        ${input.policy_period_start} to ${input.policy_period_end}`)
  if (input.retroactive_date) lines.push(`  Retroactive Date:     ${input.retroactive_date}`)
  lines.push(`  Incident Date:        ${input.incident_date}`)
  lines.push(`  Reported Date:        ${input.claim_reported_date}`)
  lines.push(`  Peril Code:           ${input.peril_code}`)
  lines.push(`  Jurisdiction:         ${input.applicable_laws.join(', ')}`)

  lines.push('')
  lines.push('  ─── CLAUSE APPLICABILITY ──────────────────────────────────')
  for (const c of clauses) {
    lines.push(`  ${c.clause.padEnd(30)} ${c.applicable ? 'APPLICABLE' : 'NOT APPLICABLE'} (${c.applicability_score}%) — ${c.analysis}`)
  }

  lines.push('')
  lines.push('  ─── EXCLUSION ANALYSIS ────────────────────────────────────')
  for (const e of exclusions) {
    lines.push(`  ${e.exclusion.padEnd(30)} ${e.triggered ? 'TRIGGERED' : 'NOT TRIGGERED'}${e.exception_applicable ? ' [EXCEPTION APPLIES]' : ''}`)
    if (e.trigger_facts.length > 0) {
      lines.push(`    Trigger facts: ${e.trigger_facts.join('; ')}`)
    }
  }

  lines.push('')
  lines.push('  ─── PROXIMATE CAUSE ANALYSIS ──────────────────────────────')
  lines.push(`  Dominant Cause:       ${proximateCause.dominant_cause}`)
  lines.push(`  Cause Chain:          ${proximateCause.cause_chain.join(' → ')}`)
  lines.push(`  Covered Peril:        ${proximateCause.covered_peril_involved ? 'YES' : 'NO'}`)
  lines.push(`  Excluded Peril:       ${proximateCause.excluded_peril_involved ? 'YES' : 'NO'}`)
  lines.push(`  Apportionment:        ${proximateCause.apportionment_required ? `YES (${proximateCause.apportionment_pct}%)` : 'NOT REQUIRED'}`)

  if (input.trigger_type === 'claims-made') {
    lines.push('')
    lines.push('  ─── CLAIMS-MADE TRIGGERS ──────────────────────────────────')
    lines.push(`  Within Period:        ${claimsMade.within_period ? 'YES' : 'NO'}`)
    lines.push(`  Retroactive Compliant:${claimsMade.retro_compliant ? 'YES' : 'NO'}`)
    lines.push(`  Late Reporting:       ${claimsMade.late_reporting ? 'YES' : 'NO'}`)
    lines.push(`  Analysis:             ${claimsMade.analysis}`)
  }

  lines.push('')
  lines.push('  ─── POLICY LIMITApplicability ──────────────────────────────')
  lines.push('  ┌────────────────────────────┬──────────────────┬──────────────┐')
  lines.push('  │ Coverage                   │ Limit            │ Deductible   │')
  lines.push('  ├────────────────────────────┼──────────────────┼──────────────┤')
  for (const lim of input.policy_limits) {
    lines.push(`  │ ${lim.coverage.padEnd(26)} │ ${lim.limit.padEnd(16)} │ $${lim.deductible.toLocaleString().padStart(10)} │`)
  }
  lines.push('  └────────────────────────────┴──────────────────┴──────────────┘')

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL — Coverage to Settlement ───────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Coverage Verified', count: 1 },
    { stage: 'Liability Assessed', count: 1 },
    { stage: 'Exclusions Reviewed', count: 1 },
    { stage: 'Approval Pending', count: 0 },
    { stage: 'Settlement', count: 0 }
  ], 'Coverage Approval Funnel'))

  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 4 IMPLEMENTATION: FRAUD DETECTOR ====================

function detectDuplicateClaims(input: FraudDetectionInput): DuplicateClaimResult {
  const matched: DuplicateClaimResult['matched_claims'] = []
  if (input.similar_claims_pattern && input.prior_claims_count >= 2) {
    matched.push({ claim_id: `CLM-${Math.floor(seededRandom(input.claim_no, 1) * 90000 + 10000)}`, similarity: 87, reason: 'Similar facts, same asset, same claimant pattern' })
  }
  if (input.claim_amount > input.prior_claims_amount * 2 && input.prior_claims_count > 0) {
    matched.push({ claim_id: `CLM-${Math.floor(seededRandom(input.claim_no, 2) * 90000 + 10000)}`, similarity: 72, reason: 'Amount deviation pattern — escalation warranted' })
  }
  return {
    duplicate_detected: matched.length > 0,
    matched_claims: matched,
    cross_reference_sources: ['DHK Insurance Bureau', 'IRIS Industry Registry', 'Central Fraud Database']
  }
}

function detectTemporalAnomalies(input: FraudDetectionInput): TemporalAnomalyResult {
  const anomalies: TemporalAnomalyResult['anomalies'] = []
  const noticeDelay = calculateDaysBetween(input.incident_date, input.report_date)

  if (noticeDelay > 90) {
    anomalies.push({ type: 'LATE REPORTING', severity: 'HIGH', description: `Claim reported ${noticeDelay} days after incident — possible fabrication window` })
  } else if (noticeDelay > 30) {
    anomalies.push({ type: 'DELAYED NOTICE', severity: 'MEDIUM', description: `Claim reported ${noticeDelay} days after incident — outside standard window` })
  }

  const daysSinceInception = calculateDaysBetween(input.policy_inception, input.incident_date)
  if (daysSinceInception < 90) {
    anomalies.push({ type: 'EARLY CLAIM', severity: 'CRITICAL', description: `Claim within ${daysSinceInception} days of policy inception — possible pre-existing condition misrepresentation` })
  }

  if (input.time_pattern === 'weekend' || input.time_pattern === 'holiday') {
    anomalies.push({ type: 'TIME PATTERN', severity: 'LOW', description: `Incident reported during ${input.time_pattern} — unusual timing to note` })
  }

  const patternScore = anomalies.reduce((score, a) => {
    const sevMap = { LOW: 10, MEDIUM: 25, HIGH: 40, CRITICAL: 60 }
    return score + sevMap[a.severity]
  }, 0)

  return { anomaly_detected: anomalies.length > 0, anomalies, pattern_score: patternScore }
}

function analyzeNetwork(input: FraudDetectionInput): NetworkAnalysisResult {
  const connections: NetworkAnalysisResult['connections_found'] = []
  const hiddenRelationships: string[] = []
  const highRiskEntities: string[] = []

  connections.push({ entity: input.insured_name, relation: 'INSURED', risk_flag: false })
  if (input.relationship_to_beneficiary !== 'SELF') {
    connections.push({ entity: input.relationship_to_beneficiary, relation: 'BENEFICIARY', risk_flag: input.relationship_to_beneficiary.includes('UNKNOWN') })
  }

  if (input.social_media_flags.length > 0) {
    for (const flag of input.social_media_flags) {
      connections.push({ entity: flag, relation: 'SOCIAL_MEDIA', risk_flag: true })
      highRiskEntities.push(flag)
    }
  }

  if (input.prior_claims_count >= 3) {
    hiddenRelationships.push(`Prior claimant with ${input.prior_claims_count} historical claims — possible serialclaimer pattern`)
    highRiskEntities.push('Serial Claimant Pattern')
  }

  const networkScore = connections.filter(c => c.risk_flag).length * 20 + hiddenRelationships.length * 15 + highRiskEntities.length * 10

  return {
    connections_found: connections,
    network_risk_score: Math.min(100, networkScore),
    hidden_relationships: hiddenRelationships,
    high_risk_entities: highRiskEntities
  }
}

function computeFraudScore(input: FraudDetectionInput, duplicate: DuplicateClaimResult, temporal: TemporalAnomalyResult, network: NetworkAnalysisResult): FraudRiskScore {
  const components = [
    { component: 'Duplicate Claims', score: duplicate.duplicate_detected ? 75 : 5, weight: 0.2 },
    { component: 'Temporal Anomalies', score: temporal.pattern_score, weight: 0.15 },
    { component: 'Network Risk', score: network.network_risk_score, weight: 0.15 },
    { component: 'Amount Deviation', score: Math.min(100, input.claim_amount_deviation * 2), weight: 0.15 },
    { component: 'Documentation', score: !input.medical_reports && input.claim_amount > 50000 ? 70 : !input.medical_reports ? 40 : 10, weight: 0.1 },
    { component: 'Witness Corroboration', score: !input.witness_available && input.claim_amount > 30000 ? 60 : !input.witness_available ? 30 : 5, weight: 0.1 },
    { component: 'Digital Footprint', score: !input.digital_footprint && input.claim_amount > 20000 ? 55 : !input.digital_footprint ? 25 : 5, weight: 0.08 },
    { component: 'Financial Motive', score: input.financial_status === 'DISTRESSED' ? 80 : input.financial_status === 'UNSTABLE' ? 50 : 10, weight: 0.07 }
  ]

  const overallScore = Math.round(components.reduce((s, c) => s + c.score * c.weight, 0))
  let riskLevel: FraudRiskScore['risk_level']
  let recommendation: string
  let priority: number

  if (overallScore >= 70) {
    riskLevel = 'CRITICAL'
    recommendation = 'IMMEDIATE SIU REFERRAL: High probability of fraudulent claim. Initiate formal investigation, preserve all evidence, consider regulatory notification.'
    priority = 1
  } else if (overallScore >= 50) {
    riskLevel = 'HIGH'
    recommendation = 'ESCALATED REVIEW: Significant fraud indicators. Detailed investigation warranted; assign experienced fraud investigator.'
    priority = 2
  } else if (overallScore >= 30) {
    riskLevel = 'MEDIUM'
    recommendation = 'ENHANCED DUE DILIGENCE: Some anomalies detected. Standard investigation with additional verification steps.'
    priority = 3
  } else {
    riskLevel = 'LOW'
    recommendation = 'ROUTINE PROCESSING: Minimal fraud indicators. Proceed with standard claims handling.'
    priority = 5
  }

  return { overall_score: overallScore, risk_level: riskLevel, components, recommendation, investigation_priority: priority }
}

function formatFraudReport(input: FraudDetectionInput, score: FraudRiskScore, duplicate: DuplicateClaimResult, temporal: TemporalAnomalyResult, network: NetworkAnalysisResult): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║              FRAUD DETECTION — OCEAN CLAIMS                ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push('  ─── CLAIM REFERENCE ─────────────────────────────────────────')
  lines.push(`  Claim No:             ${input.claim_no}`)
  lines.push(`  Amount:               $${input.claim_amount.toLocaleString()}`)
  lines.push(`  Type:                 ${input.claim_type}`)
  lines.push(`  Insured:              ${input.insured_name}`)
  lines.push(`  Claim-to-Report Lag:  ${calculateDaysBetween(input.incident_date, input.report_date)} days`)
  lines.push(`  Days Since Inception: ${calculateDaysBetween(input.policy_inception, input.incident_date)} days`)

  lines.push('')
  lines.push('  ─── FRAUD RISK SCORE ────────────────────────────────────────')
  lines.push(`  Overall Score:        ${score.overall_score}/100`)
  lines.push(`  Risk Level:           ${score.risk_level}`)
  lines.push(`  Priority:             ${score.investigation_priority}`)
  lines.push('')
  lines.push('  Component Breakdown:')
  for (const c of score.components) {
    const b = bar(c.score, 100, 15)
    lines.push(`    ${c.component.padEnd(24)} ${b} ${c.score}%`)
  }

  lines.push('')
  lines.push('  ─── DUPLICATE CLAIM ANALYSIS ──────────────────────────────')
  lines.push(`  Duplicate Detected:   ${duplicate.duplicate_detected ? 'YES' : 'NO'}`)
  if (duplicate.matched_claims.length > 0) {
    for (const m of duplicate.matched_claims) {
      lines.push(`    Match: ${m.claim_id} (${m.similarity}%) — ${m.reason}`)
    }
  }
  lines.push(`  Sources Checked:      ${duplicate.cross_reference_sources.join(', ')}`)

  lines.push('')
  lines.push('  ─── TEMPORAL ANOMALIES ──────────────────────────────────')
  lines.push(`  Anomaly Detected:     ${temporal.anomaly_detected ? 'YES' : 'NO'}`)
  lines.push(`  Pattern Score:        ${temporal.pattern_score}`)
  for (const a of temporal.anomalies) {
    lines.push(`    [${a.severity.padEnd(8)}] ${a.type}: ${a.description}`)
  }

  lines.push('')
  lines.push('  ─── NETWORK ANALYSIS ──────────────────────────────────────')
  lines.push(`  Network Risk Score:   ${network.network_risk_score}`)
  for (const c of network.connections_found) {
    lines.push(`    ${c.entity.padEnd(20)} ${c.relation.padEnd(15)} ${c.risk_flag ? '[ RISK FLAG ]' : ''}`)
  }
  if (network.hidden_relationships.length > 0) {
    lines.push('  Hidden Relationships:')
    for (const h of network.hidden_relationships) lines.push(`    * ${h}`)
  }
  if (network.high_risk_entities.length > 0) {
    lines.push('  High Risk Entities:')
    for (const h of network.high_risk_entities) lines.push(`    ⚠ ${h}`)
  }

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL — Claims Integrity Check ───────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Claims Received', count: 1 },
    { stage: 'Duplicate Check', count: duplicate.duplicate_detected ? 1 : 0 },
    { stage: 'Anomaly Scan', count: temporal.anomaly_detected ? 1 : 0 },
    { stage: 'Network Analysis', count: network.network_risk_score > 30 ? 1 : 0 },
    { stage: 'Clear to Process', count: score.risk_level === 'LOW' ? 1 : 0 }
  ], 'Fraud Screening Funnel'))

  lines.push('')
  lines.push('  ─── RECOMMENDATION ────────────────────────────────────────')
  lines.push(`  ${score.recommendation}`)
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 5 IMPLEMENTATION: SETTLEMENT NEGOTIATOR ====================

function calculateCompensation(input: SettlementInput): CompensationCalculation {
  const grossEntitlement = Math.min(input.assessed_amount, input.claimed_amount)
  const deductibleApplied = input.deductible
  const liabilityAdjusted = grossEntitlement * (input.liability_percentage / 100)
  const policyLimitCapped = Math.min(liabilityAdjusted, input.policy_limit - input.deductible)
  const netLow = Math.max(0, policyLimitCapped * 0.8)
  const netMid = policyLimitCapped
  const netHigh = Math.min(input.policy_limit, policyLimitCapped * 1.1)

  return {
    gross_entitlement: Math.round(grossEntitlement * 100) / 100,
    deductible_applied: deductibleApplied,
    liability_adjusted: Math.round(liabilityAdjusted * 100) / 100,
    policy_limit_capped: Math.round(policyLimitCapped * 100) / 100,
    net_settlement_range: {
      low: Math.round(netLow * 100) / 100,
      mid: Math.round(netMid * 100) / 100,
      high: Math.round(netHigh * 100) / 100
    },
    recommended_offer: Math.round(netMid * 0.85 * 100) / 100
  }
}

function developNegotiationStrategy(input: SettlementInput, compensation: CompensationCalculation): NegotiationStrategy {
  const openingOffer = Math.round(compensation.net_settlement_range.low * 100) / 100
  const targetSettlement = Math.round(compensation.net_settlement_range.mid * 100) / 100
  const walkAway = Math.round(compensation.net_settlement_range.high * 1.1 * 100) / 100

  const concessionPattern = [
    `Round 1: Open at $${openingOffer.toLocaleString()}`,
    `Round 2: Move to $${Math.round((openingOffer + targetSettlement) / 2).toLocaleString()}`,
    `Round 3: Target $${targetSettlement.toLocaleString()}`,
    'Round 4: Final position — minimal concessions'
  ]

  const leveragePoints: string[] = []
  const weaknesses: string[] = []

  if (input.liability_percentage < 50) leveragePoints.push('Partial liability reduces insurer exposure')
  if (input.mediation_available) leveragePoints.push('Mediation available for cost-effective resolution')
  if (input.litigation_threat) weaknesses.push('Litigation threat escalates cost and duration')
  if (input.claimant_expectation > compensation.net_settlement_range.high) {
    weaknesses.push('Claimant expectations exceed reasonable settlement range')
  }
  if (input.injury_severity === 'SEVERE' || input.injury_severity === 'CATASTROPHIC') {
    weaknesses.push('High-severity injury increases exposure and public scrutiny')
  }
  if (input.precedent_cases.length > 0 && input.precedent_cases.some(p => p.facts_similar && p.awarded_amount > compensation.net_settlement_range.high)) {
    weaknesses.push('Adverse precedent suggests higher potential awards')
  }

  return {
    opening_offer: openingOffer,
    target_settlement: targetSettlement,
    walk_away_point: walkAway,
    concession_pattern: concessionPattern,
    leverage_points: leveragePoints,
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Standard market-level exposure']
  }
}

function estimateCourtOutcome(input: SettlementInput): CourtOutcomeEstimate {
  const similarAwards = input.precedent_cases.filter(p => p.facts_similar).map(p => p.awarded_amount)
  const estimatedAward = similarAwards.length > 0
    ? similarAwards.reduce((a, b) => a + b, 0) / similarAwards.length
    : (input.economic_damages + input.non_economic_damages) * 0.8

  const awardLow = estimatedAward * 0.6
  const awardHigh = estimatedAward * 1.4
  const litigationCost = input.claimed_amount * 0.15
  const durationMonths = input.injury_severity === 'CATASTROPHIC' ? 36 : input.injury_severity === 'SEVERE' ? 24 : 18
  const probFavorable = input.liability_percentage > 60 ? 0.7 : input.liability_percentage > 40 ? 0.5 : 0.3
  const expectedValue = estimatedAward * probFavorable - litigationCost

  return {
    estimated_award: Math.round(estimatedAward * 100) / 100,
    award_range: { low: Math.round(awardLow * 100) / 100, high: Math.round(awardHigh * 100) / 100 },
    litigation_cost: Math.round(litigationCost * 100) / 100,
    duration_months: durationMonths,
    probability_favorable: Math.round(probFavorable * 100) / 100,
    expected_value: Math.round(expectedValue * 100) / 100
  }
}

function formatSettlementReport(
  input: SettlementInput,
  compensation: CompensationCalculation,
  strategy: NegotiationStrategy,
  court: CourtOutcomeEstimate
): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║           SETTLEMENT NEGOTIATOR — OCEAN CLAIMS             ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push('  ─── CLAIM REFERENCE ─────────────────────────────────────────')
  lines.push(`  Claim No:             ${input.claim_no}`)
  lines.push(`  Type:                 ${input.claim_type}`)
  lines.push(`  Jurisdiction:         ${input.jurisdiction}`)
  lines.push(`  Claimed Amount:       $${input.claimed_amount.toLocaleString()}`)
  lines.push(`  Assessed Amount:      $${input.assessed_amount.toLocaleString()}`)
  lines.push(`  Policy Limit:         $${input.policy_limit.toLocaleString()}`)
  lines.push(`  Liability:            ${input.liability_percentage}%`)
  lines.push(`  Injury Severity:      ${input.injury_severity}`)
  lines.push(`  Economic Damages:     $${input.economic_damages.toLocaleString()}`)
  lines.push(`  Non-Economic Damages: $${input.non_economic_damages.toLocaleString()}`)

  lines.push('')
  lines.push('  ─── COMPENSATION CALCULATION ──────────────────────────────')
  lines.push(`  Gross Entitlement:    $${compensation.gross_entitlement.toLocaleString()}`)
  lines.push(`  Less Deductible:      -$${compensation.deductible_applied.toLocaleString()}`)
  lines.push(`  Liability Adjusted:   $${compensation.liability_adjusted.toLocaleString()}`)
  lines.push(`  Policy Limit Cap:     $${compensation.policy_limit_capped.toLocaleString()}`)
  lines.push(`  Settlement Range:     $${compensation.net_settlement_range.low.toLocaleString()} — $${compensation.net_settlement_range.mid.toLocaleString()} — $${compensation.net_settlement_range.high.toLocaleString()}`)
  lines.push(`  Recommended Offer:    $${compensation.recommended_offer.toLocaleString()}`)

  lines.push('')
  lines.push('  ─── NEGOTIATION STRATEGY ──────────────────────────────────')
  lines.push(`  Opening Offer:        $${strategy.opening_offer.toLocaleString()}`)
  lines.push(`  Target Settlement:    $${strategy.target_settlement.toLocaleString()}`)
  lines.push(`  Walk-Away Point:      $${strategy.walk_away_point.toLocaleString()}`)
  lines.push('')
  lines.push('  Concession Pattern:')
  for (const c of strategy.concession_pattern) lines.push(`    ${c}`)
  lines.push('')
  lines.push('  Leverage Points:')
  for (const l of strategy.leverage_points) lines.push(`    + ${l}`)
  lines.push('')
  lines.push('  Weaknesses:')
  for (const w of strategy.weaknesses) lines.push(`    - ${w}`)

  lines.push('')
  lines.push('  ─── COURT OUTCOME ESTIMATION ──────────────────────────────')
  lines.push(`  Estimated Award:      $${court.estimated_award.toLocaleString()}`)
  lines.push(`  Award Range:          $${court.award_range.low.toLocaleString()} — $${court.award_range.high.toLocaleString()}`)
  lines.push(`  Litigation Cost:      $${court.litigation_cost.toLocaleString()}`)
  lines.push(`  Expected Duration:    ${court.duration_months} months`)
  lines.push(`  P(Favorable):         ${(court.probability_favorable * 100).toFixed(0)}%`)
  lines.push(`  Expected Value:       $${court.expected_value.toLocaleString()}`)
  lines.push(`  Advice: ${court.expected_value > strategy.target_settlement ? 'SETTLEMENT favored — litigation exposes insurer to higher net cost' : 'LITIGATION viable — estimated award below settlement target'}`)

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL — Settlement Process ───────────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Claims Filed', count: 1 },
    { stage: 'Assessment Done', count: 1 },
    { stage: 'Negotiation', count: input.negotiation_rounds },
    { stage: 'Agreement', count: 0 },
    { stage: 'Payment', count: 0 }
  ], 'Negotiation Funnel'))

  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 6 IMPLEMENTATION: RECOVERY TRACKER ====================

function calculateRecoveryAmount(input: RecoveryInput): RecoveryAmountCalculation {
  const grossRecovery = input.claim_paid_amount * (input.fault_percentage / 100)
  const expenseDeduction = input.recovery_expenses
  const netRecovery = Math.max(0, grossRecovery - expenseDeduction)
  const insuredRecovery = input.comparative_fault ? netRecovery * 0.3 : 0
  const insurerRecovery = netRecovery - insuredRecovery
  const recoveryPct = input.claim_paid_amount > 0 ? (netRecovery / input.claim_paid_amount) * 100 : 0

  return {
    gross_recovery: Math.round(grossRecovery * 100) / 100,
    expense_deduction: Math.round(expenseDeduction * 100) / 100,
    net_recovery: Math.round(netRecovery * 100) / 100,
    insured_recovery: Math.round(insuredRecovery * 100) / 100,
    insurer_recovery: Math.round(insurerRecovery * 100) / 100,
    recovery_percentage: Math.round(recoveryPct * 100) / 100
  }
}

function developRecoveryStrategy(input: RecoveryInput, recovery: RecoveryAmountCalculation): RecoveryStrategy {
  let recommendedApproach: string
  const demands: string[] = []
  const leverage: string[] = []
  let litigationRecommended = false
  let litigationThreshold = 0

  if (recovery.net_recovery < 5000) {
    recommendedApproach = 'ABANDON — Recovery uneconomical relative to cost'
    demands.push('Recovery expenses exceed potential net recovery')
  } else if (recovery.net_recovery < 50000) {
    recommendedApproach = 'FORMAL DEMAND LETTER — Pre-litigation recovery attempt'
    demands.push(`Issue demand letter to ${input.at_fault_party} for $${recovery.gross_recovery.toLocaleString()}`)
    demands.push(`Demand response within 30 days; reserve right to litigate`)
    leverage.push('Established liability strengthens demand position')
    litigationThreshold = 30000
  } else {
    recommendedApproach = 'LITIGATED RECOVERY — File subrogation action'
    demands.push(`File subrogation claim against ${input.at_fault_party}`)
    demands.push(`Claim amount: $${recovery.gross_recovery.toLocaleString()} plus interest and costs`)
    litigationRecommended = true
    litigationThreshold = 50000
    leverage.push('Clear liability and significant amount justify litigation')
  }

  if (input.defendant_insurance_limit) {
    leverage.push(`Third-party insurance limit: $${input.defendant_insurance_limit.toLocaleString()}`)
  }
  if (input.defendant_assets > recovery.gross_recovery) {
    leverage.push('Defendant has sufficient assets to satisfy judgment')
  }

  return {
    recommended_approach: recommendedApproach,
    timeline: litigationRecommended ? '12-24 months (litigation)' : '30-90 days (demand)',
    demands_to_issue: demands,
    negotiation_leverage: leverage,
    litigation_recommended: litigationRecommended,
    litigation_threshold: litigationThreshold,
    settlement_range: {
      low: Math.round(recovery.net_recovery * 0.5 * 100) / 100,
      high: Math.round(recovery.net_recovery * 0.9 * 100) / 100
    }
  }
}

function estimateSuccessProbability(input: RecoveryInput, recovery: RecoveryAmountCalculation): RecoverySuccessProbability {
  const factors: RecoverySuccessProbability['factors'] = [
    { factor: 'Liability Established', impact: input.liability_established ? 'POSITIVE' : 'NEGATIVE', weight: 0.25 },
    { factor: 'Defendant Solvency', impact: input.defendant_assets > recovery.gross_recovery ? 'POSITIVE' : 'NEGATIVE', weight: 0.2 },
    { factor: 'Statute of Limitations', impact: calculateDaysBetween(new Date().toISOString().slice(0, 10), input.statute_of_limitations_date) > 180 ? 'POSITIVE' : 'NEGATIVE', weight: 0.15 },
    { factor: 'Comparative Fault', impact: input.comparative_fault ? 'NEGATIVE' : 'NEUTRAL', weight: 0.1 },
    { factor: 'Subrogation Waiver', impact: input.subrogation_waiver ? 'NEGATIVE' : 'POSITIVE', weight: 0.1 },
    { factor: 'Legal Counsel Quality', impact: input.third_party_legal_counsel ? 'POSITIVE' : 'NEUTRAL', weight: 0.2 }
  ]

  const prob = Math.round(
    factors.reduce((s, f) => s + (f.impact === 'POSITIVE' ? 80 : f.impact === 'NEGATIVE' ? 30 : 50) * f.weight, 0)
  )
  const riskAdjustment = input.subrogation_waiver ? -20 : 0
  const adjustedProb = Math.max(0, Math.min(100, prob + riskAdjustment))

  return {
    overall_probability: adjustedProb,
    factors,
    risk_adjustment: riskAdjustment,
    expected_recovery: Math.round(recovery.net_recovery * (adjustedProb / 100) * 100) / 100
  }
}

function formatRecoveryReport(
  input: RecoveryInput,
  recovery: RecoveryAmountCalculation,
  strategy: RecoveryStrategy,
  probability: RecoverySuccessProbability
): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║             RECOVERY TRACKER — OCEAN CLAIMS                ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push('  ─── CASE REFERENCE ─────────────────────────────────────────')
  lines.push(`  Claim No:             ${input.claim_no}`)
  lines.push(`  Claim Paid:           $${input.claim_paid_amount.toLocaleString()}`)
  lines.push(`  At-Fault Party:       ${input.at_fault_party}`)
  lines.push(`  Fault Percentage:     ${input.fault_percentage}%`)
  lines.push(`  Liability Established:${input.liability_established ? 'YES' : 'NO'}`)
  lines.push(`  Jurisdiction:         ${input.jurisdiction}`)
  lines.push(`  SOL Deadline:         ${input.statute_of_limitations_date}`)
  lines.push(`  Days to SOL:          ${calculateDaysBetween(new Date().toISOString().slice(0, 10), input.statute_of_limitations_date)}`)
  lines.push(`  Defendant Assets:     $${input.defendant_assets.toLocaleString()}`)
  if (input.defendant_insurance_limit) lines.push(`  Defendant Ins. Limit: $${input.defendant_insurance_limit.toLocaleString()}`)

  lines.push('')
  lines.push('  ─── RECOVERY AMOUNT ─────────────────────────────────────────')
  lines.push(`  Gross Recovery:       $${recovery.gross_recovery.toLocaleString()}`)
  lines.push(`  Less Expenses:        -$${recovery.expense_deduction.toLocaleString()}`)
  lines.push(`  Net Recovery:         $${recovery.net_recovery.toLocaleString()}`)
  lines.push(`  Insured Share:        $${recovery.insured_recovery.toLocaleString()}`)
  lines.push(`  Insurer Share:        $${recovery.insurer_recovery.toLocaleString()}`)
  lines.push(`  Recovery % of Paid:   ${recovery.recovery_percentage}%`)

  lines.push('')
  lines.push('  ─── RECOVERY STRATEGY ─────────────────────────────────────')
  lines.push(`  Approach:             ${strategy.recommended_approach}`)
  lines.push(`  Timeline:             ${strategy.timeline}`)
  lines.push(`  Litigation Rec.:      ${strategy.litigation_recommended ? 'YES' : 'NO'}`)
  lines.push(`  Settlement Range:     $${strategy.settlement_range.low.toLocaleString()} — $${strategy.settlement_range.high.toLocaleString()}`)
  lines.push('')
  lines.push('  Demands to Issue:')
  for (const d of strategy.demands_to_issue) lines.push(`    * ${d}`)
  lines.push('')
  lines.push('  Leverage:')
  for (const l of strategy.negotiation_leverage) lines.push(`    + ${l}`)

  lines.push('')
  lines.push('  ─── SUCCESS PROBABILITY ─────────────────────────────────────')
  lines.push(`  Overall Probability:  ${probability.overall_probability}%`)
  lines.push(`  Risk Adjustment:      ${probability.risk_adjustment > 0 ? '+' : ''}${probability.risk_adjustment}%`)
  lines.push(`  Expected Recovery:    $${probability.expected_recovery.toLocaleString()}`)
  lines.push('')
  lines.push('  Factors:')
  for (const f of probability.factors) {
    const icon = f.impact === 'POSITIVE' ? '+' : f.impact === 'NEGATIVE' ? '-' : '~'
    lines.push(`    ${icon} ${f.factor.padEnd(28)} (${f.weight * 100}%)`)
  }

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL — Recovery Process ───────────────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Recovery Identified', count: 1 },
    { stage: 'Demand Sent', count: strategy.demands_to_issue.length > 0 ? 1 : 0 },
    { stage: 'Negotiation', count: 0 },
    { stage: 'Litigation', count: strategy.litigation_recommended ? 1 : 0 },
    { stage: 'Funds Recovered', count: 0 }
  ], 'Subrogation Funnel'))

  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 7 IMPLEMENTATION: CLAIMS ANALYTICS ====================

function calculateLossRatios(input: ClaimsAnalyticsInput): LossRatioMetrics {
  const lossRatio = input.total_premium_earned > 0 ? (input.total_claims_paid / input.total_premium_earned) * 100 : 0
  const expenseRatio = 30.0
  const combinedRatio = lossRatio + expenseRatio
  const frequency = input.total_premium_earned > 0 ? (input.total_claims_count / input.total_premium_earned) * 1000000 : 0
  const severity = input.total_claims_count > 0 ? input.total_claims_paid / input.total_claims_count : 0
  const purePremium = frequency * severity / 1000000

  let benchmarkComparison = ''
  if (lossRatio < 50) benchmarkComparison = 'OUTPERFORMING — loss ratio below 50% benchmark'
  else if (lossRatio < 65) benchmarkComparison = 'MARKET — within standard 50-65% range'
  else benchmarkComparison = 'UNDERPERFORMING — exceeds 65% threshold; review rating adequacy'

  return {
    loss_ratio: Math.round(lossRatio * 100) / 100,
    combined_ratio: Math.round(combinedRatio * 100) / 100,
    frequency: Math.round(frequency * 100) / 100,
    severity: Math.round(severity * 100) / 100,
    pure_premium: Math.round(purePremium * 100) / 100,
    benchmark_comparison: benchmarkComparison
  }
}

function analyzeReserves(input: ClaimsAnalyticsInput): ReserveAnalysis {
  const caseReserves = input.case_reserves.reduce((s, r) => s + r.reserve, 0)
  const ibnr = input.ibnr_estimate
  const bulkReserves = Math.max(0, input.total_reserves - caseReserves - ibnr)
  const totalPaidAndReserve = input.total_claims_paid + caseReserves + ibnr + bulkReserves
  const adequacyRatio = input.total_claims_paid > 0 ? totalPaidAndReserve / input.total_claims_paid : 0
  const devFactor = 1.0 + (input.claims_pending / Math.max(1, input.total_claims_count)) * 0.3
  const projectedUltimate = (input.total_claims_paid + input.total_reserves) * devFactor

  return {
    total_reserves: input.total_reserves,
    case_reserves: Math.round(caseReserves * 100) / 100,
    ibnr: ibnr,
    bulk_reserves: Math.round(bulkReserves * 100) / 100,
    adequacy_ratio: Math.round(adequacyRatio * 100) / 100,
    development_factor: Math.round(devFactor * 100) / 100,
    projected_ultimate: Math.round(projectedUltimate * 100) / 100
  }
}

function formatAnalyticsReport(input: ClaimsAnalyticsInput, ratios: LossRatioMetrics, reserves: ReserveAnalysis): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║            CLAIMS ANALYTICS DASHBOARD — OCEAN CLAIMS       ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push('  ─── REPORTING PERIOD ────────────────────────────────────────')
  lines.push(`  Period:               ${input.reporting_period}`)
  lines.push(`  Business Line:        ${input.business_line}`)
  lines.push('')

  lines.push('  ─── KEY PERFORMANCE INDICATORS ────────────────────────────')
  lines.push(`  Loss Ratio:           ${ratios.loss_ratio}%  (${ratios.benchmark_comparison})`)
  lines.push(`  Combined Ratio:       ${ratios.combined_ratio}%`)
  lines.push(`  Claim Frequency:      ${ratios.frequency} per $1M earned premium`)
  lines.push(`  Claim Severity:       $${Math.round(ratios.severity).toLocaleString()} per claim`)
  lines.push(`  Pure Premium:         $${ratios.pure_premium.toFixed(2)}`)
  lines.push(`  Total Claims Paid:    $${input.total_claims_paid.toLocaleString()}`)
  lines.push(`  Earned Premium:       $${input.total_premium_earned.toLocaleString()}`)
  lines.push(`  Avg Settlement Days:  ${input.average_settlement_days}`)

  lines.push('')
  lines.push(buildClaimsStatusDashboard([
    { status: 'OPEN', count: input.claims_pending },
    { status: 'CLOSED', count: input.claims_closed },
    { status: 'DENIED', count: input.claims_denied },
    { status: 'TOTAL', count: input.total_claims_count }
  ], 'Claims Status Overview'))

  lines.push('')
  lines.push('  ─── DENIAL ANALYSIS ─────────────────────────────────────────')
  if (input.denial_reasons.length > 0) {
    const maxDenial = Math.max(...input.denial_reasons.map(d => d.count))
    for (const d of input.denial_reasons) {
      const b = bar(d.count, maxDenial, 15)
      lines.push(`  ${d.reason.padEnd(24)} ${b} ${d.count}`)
    }
  }

  lines.push('')
  lines.push('  ─── RESERVE ANALYSIS ────────────────────────────────────────')
  lines.push(`  Total Reserves:       $${reserves.total_reserves.toLocaleString()}`)
  lines.push(`  Case Reserves:        $${reserves.case_reserves.toLocaleString()}`)
  lines.push(`  IBNR:                 $${reserves.ibnr.toLocaleString()}`)
  lines.push(`  Bulk Reserves:        $${reserves.bulk_reserves.toLocaleString()}`)
  lines.push(`  Adequacy Ratio:       ${reserves.adequacy_ratio}`)
  lines.push(`  Development Factor:   ${reserves.development_factor}x`)
  lines.push(`  Projected Ultimate:   $${reserves.projected_ultimate.toLocaleString()}`)

  lines.push('')
  lines.push('  ─── CHANNEL DISTRIBUTION ──────────────────────────────────')
  const maxChannel = Math.max(...input.channel_mix.map(c => c.claims_count))
  for (const ch of input.channel_mix) {
    const lossRatio = ch.premium > 0 ? ((ch.claims_count * 1000) / ch.premium * 100).toFixed(1) : '0.0'
    const b = bar(ch.claims_count, maxChannel, 15)
    lines.push(`  ${ch.channel.padEnd(18)} ${b} ${ch.claims_count} (LR: ${lossRatio}%)`)
  }

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL — Full Claims Cycle ─────────────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Claims Reported', count: input.total_claims_count, amount: input.total_premium_earned },
    { stage: 'Under Review', count: Math.round(input.total_claims_count * 0.9) },
    { stage: 'Approved', count: input.claims_closed, amount: input.total_claims_paid },
    { stage: 'Denied', count: input.claims_denied },
    { stage: 'Pending', count: input.claims_pending }
  ], 'Claims Payment Funnel'))

  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 8 IMPLEMENTATION: CUSTOMER CLAIM PORTAL ====================

function assessSelfServiceEligibility(input: CustomerPortalInput): SelfServiceClaimResult {
  const eligible = input.claim_history.length < 3 && input.satisfaction_scores.every(s => s.score >= 3)
  const fastTrack = eligible && input.payment_history === 'CURRENT' && input.coverage_gaps.length < 3

  return {
    eligible,
    eligibility_reason: eligible
      ? 'Customer qualifies for self-service claim submission'
      : 'Prior claim patterns or satisfaction suggest guided claim process',
    fast_track_available: fastTrack,
    estimated_processing_days: fastTrack ? 3 : eligible ? 7 : 14,
    required_documents: [
      'Policy schedule and coverage summary',
      'Incident report or First Information Report (FIR)',
      'Photographs / video of damage',
      'Repair estimates or invoices',
      'Medical reports (if injury-related)',
      'Witness statements (if applicable)'
    ],
    next_steps: fastTrack
      ? ['Complete online claim form', 'Upload supporting documents', 'Receive instant acknowledgment', 'Track progress in real-time']
      : ['Contact claims advisor for guided submission', 'Schedule telephonic or in-person review', 'Submit documents via secure portal', 'Receive personalized status updates']
  }
}

function analyzeCoverageGaps(input: CustomerPortalInput): CoverageGapAnalysis {
  const gaps = input.coverage_gaps.map(g => ({
    ...g,
    gap: g.recommended - g.current,
    priority: (g.recommended - g.current) / g.recommended > 0.3 ? 'HIGH' as const :
              (g.recommended - g.current) / g.recommended > 0.15 ? 'MEDIUM' as const : 'LOW' as const
  }))

  const totalGap = gaps.reduce((s, g) => s + g.gap, 0)
  const recommendations: string[] = []
  const highPriority = gaps.filter(g => g.priority === 'HIGH')
  if (highPriority.length > 0) {
    recommendations.push(`Urgently address ${highPriority.length} high-priority coverage gaps`)
  }
  if (input.renewal_due_date) {
    const daysToRenewal = calculateDaysBetween(new Date().toISOString().slice(0, 10), input.renewal_due_date)
    if (daysToRenewal < 60) {
      recommendations.push(`Renewal approaching (${daysToRenewal} days) — schedule coverage review`)
    }
  }
  recommendations.push('Schedule annual coverage adequacy review with advisor')
  recommendations.push('Consider umbrella policy for catastrophic exposure')

  return { gaps, total_gap_amount: Math.round(totalGap * 100) / 100, recommendations }
}

function formatPortalReport(input: CustomerPortalInput, selfService: SelfServiceClaimResult, gaps: CoverageGapAnalysis): string {
  const lines: string[] = []
  lines.push('')
  lines.push('  ╔══════════════════════════════════════════════════════════════╗')
  lines.push('  ║          CUSTOMER CLAIM PORTAL — OCEAN CLAIMS              ║')
  lines.push('  ╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  lines.push('  ─── CUSTOMER PROFILE ────────────────────────────────────────')
  lines.push(`  Customer ID:          ${input.customer_id}`)
  lines.push(`  Name:                 ${input.customer_name}`)
  lines.push(`  Policy No:            ${input.policy_no}`)
  lines.push(`  Policy Type:          ${input.policy_type}`)
  lines.push(`  Payment History:      ${input.payment_history}`)
  lines.push(`  Renewal Due:          ${input.renewal_due_date}`)
  lines.push(`  Communication Pref:   ${input.communication_preferences.join(', ')}`)

  lines.push('')
  lines.push('  ─── CLAIM HISTORY ─────────────────────────────────────────')
  if (input.claim_history.length > 0) {
    lines.push('  ┌──────────────┬──────────────────┬────────────┬────────────┬────────────┐')
    lines.push('  │ Claim No     │ Type             │ Status     │ Amount     │ Date       │')
    lines.push('  ├──────────────┼──────────────────┼────────────┼────────────┼────────────┤')
    for (const c of input.claim_history) {
      lines.push(`  │ ${c.claim_no.padEnd(12)} │ ${c.type.padEnd(16)} │ ${c.status.padEnd(10)} │ $${c.amount.toLocaleString().padStart(9)} │ ${c.date.padEnd(10)} │`)
    }
    lines.push('  └──────────────┴──────────────────┴────────────┴────────────┴────────────┘')
  } else {
    lines.push('  No prior claims on record.')
  }

  lines.push('')
  lines.push('  ─── SATISFACTION SCORES ───────────────────────────────────')
  if (input.satisfaction_scores.length > 0) {
    for (const s of input.satisfaction_scores) {
      const stars = '★'.repeat(s.score) + '☆'.repeat(5 - s.score)
      lines.push(`  ${s.claim_no.padEnd(12)} ${stars} ${s.score}/5 — ${s.feedback}`)
    }
  } else {
    lines.push('  No satisfaction ratings yet.')
  }

  lines.push('')
  lines.push('  ─── SELF-SERVICE CLAIM ELIGIBILITY ────────────────────────')
  lines.push(`  Eligible:             ${selfService.eligible ? 'YES — Self-service available' : 'NO — Guided process required'}`)
  lines.push(`  Reason:               ${selfService.eligibility_reason}`)
  lines.push(`  Fast Track:           ${selfService.fast_track_available ? 'YES — Expedited 3-day processing' : 'NO'}`)
  lines.push(`  Est. Processing:      ${selfService.estimated_processing_days} days`)
  lines.push('')
  lines.push('  Required Documents:')
  for (const d of selfService.required_documents) lines.push(`    * ${d}`)
  lines.push('')
  lines.push('  Next Steps:')
  for (const s of selfService.next_steps) lines.push(`    * ${s}`)

  lines.push('')
  lines.push('  ─── COVERAGE GAP ANALYSIS ─────────────────────────────────')
  if (gaps.gaps.length > 0) {
    lines.push('  ┌────────────────────────────┬────────────┬────────────┬────────────┬──────────┐')
    lines.push('  │ Coverage                   │ Current    │ Recommended│ Gap        │ Priority │')
    lines.push('  ├────────────────────────────┼────────────┼────────────┼────────────┼──────────┤')
    for (const g of gaps.gaps) {
      lines.push(`  │ ${g.coverage.padEnd(26)} │ $${g.current.toLocaleString().padStart(8)} │ $${g.recommended.toLocaleString().padStart(8)} │ $${g.gap.toLocaleString().padStart(8)} │ ${g.priority.padEnd(8)} │`)
    }
    lines.push('  └────────────────────────────┴────────────┴────────────┴────────────┴──────────┘')
    lines.push(`  Total Gap:             $${gaps.total_gap_amount.toLocaleString()}`)
  }
  if (gaps.recommendations.length > 0) {
    lines.push('  Recommendations:')
    for (const r of gaps.recommendations) lines.push(`    * ${r}`)
  }

  lines.push('')
  lines.push('  ─── PAYMENT FUNNEL — Self-Service Claims ──────────────────')
  lines.push(buildPaymentFunnel([
    { stage: 'Portal Visits', count: 100 },
    { stage: 'Claims Started', count: 65 },
    { stage: 'Docs Uploaded', count: 50 },
    { stage: 'Submitted', count: 42 },
    { stage: 'Approved', count: 35 }
  ], 'Digital Claim Funnel'))

  lines.push('')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Claim First Notice (出险第一时间报案)
  tools.register(defineTool({
    name: 'claim_first_notice',
    description: 'First notice of claim intake with multi-channel acceptance, policy validation, preliminary liability triage, surveyor dispatch, case filing, and duty disclosure to the insured.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: policy_no, incident_date, report_date, channel, claimant_name, contact_phone, incident_type, incident_location, description, injuries_reported, third_party_involved, police_report_filed, police_report_no?, estimated_loss?, policy_type, coverage_types, policy_effective, policy_expiry' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: FirstNoticeInput = JSON.parse(args.input)
      const validation = validatePolicy(input)
      const liability = triageLiability(input)
      const survey = dispatchSurveyor(input, liability)
      const caseFile = fileCase(input, liability, input.policy_no)
      const disclosure = discloseDuties(input, liability)
      return formatFirstNoticeReport(input, validation, liability, survey, caseFile, disclosure)
    }
  }))

  // Tool 2: Loss Assessment Engine (损失评估引擎)
  tools.register(defineTool({
    name: 'loss_assessment',
    description: 'Comprehensive loss assessment including damage estimation, residual value computation, repair-vs-replace decision, third-party adjuster reconciliation, survey report generation, and dispute resolution.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: claim_no, asset_type, asset_description, asset_value, asset_age_years, damage_description, damage_type, damage_percentage, repair_estimate, replacement_cost, salvage_value, depreciation_rate, third_party_surveyor, third_party_report_no?, dispute_flag, previous_damage, usage_type, location' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: LossAssessmentInput = JSON.parse(args.input)
      const damage = assessDamage(input)
      const decision = decideRepairVsReset(input, damage)
      const adjustment = runThirdPartyAdjustment(input, damage)
      return formatLossAssessmentReport(input, damage, decision, adjustment)
    }
  }))

  // Tool 3: Coverage Verifier (责任认定)
  tools.register(defineTool({
    name: 'coverage_verifier',
    description: 'Verify coverage by analyzing policy clause applicability, coverage scope, exclusion elimination, liability apportionment, proximate cause chain, and claims-made trigger enforcement.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: claim_no, policy_type, trigger_type, policy_period_start, policy_period_end, retroactive_date?, incident_date, claim_reported_date, coverage_grants, exclusion_clauses, policy_limits, underlying_facts, peril_code, cause_of_loss_chain, applicable_laws, concurrent_causes' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: CoverageVerifyInput = JSON.parse(args.input)
      const clauses = analyzeClauses(input)
      const exclusions = analyzeExclusions(input)
      const proximateCause = determineProximateCause(input)
      const claimsMade = applyClaimsMadeTriggers(input)
      return formatCoverageReport(input, clauses, exclusions, proximateCause, claimsMade)
    }
  }))

  // Tool 4: Fraud Detector (理赔欺诈检测)
  tools.register(defineTool({
    name: 'fraud_detector',
    description: 'Detect claims fraud through duplicate claim identification, temporal anomaly detection, claim-amount deviation analysis, social network analysis, pattern matching, and composite fraud risk scoring.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: claim_no, insured_name, claim_amount, claim_type, incident_date, report_date, policy_inception, prior_claims_count, prior_claims_amount, relationship_to_beneficiary, financial_status, employment_status, medical_reports, witness_available, digital_footprint, social_media_flags, claim_amount_deviation, similar_claims_pattern, time_pattern' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: FraudDetectionInput = JSON.parse(args.input)
      const duplicate = detectDuplicateClaims(input)
      const temporal = detectTemporalAnomalies(input)
      const network = analyzeNetwork(input)
      const score = computeFraudScore(input, duplicate, temporal, network)
      return formatFraudReport(input, score, duplicate, temporal, network)
    }
  }))

  // Tool 5: Settlement Negotiator (理算协商)
  tools.register(defineTool({
    name: 'settlement_negotiator',
    description: 'Calculate compensation liability, develop multi-round negotiation strategy, define concession boundaries, estimate court outcomes, advise on optimized settlement, and recommend mediation pathways.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: claim_no, claim_type, claimed_amount, assessed_amount, policy_limit, deductible, liability_percentage, claimant_expectation, negotiation_rounds, mediation_available, litigation_threat, precedent_cases, injury_severity, economic_damages, non_economic_damages, jurisdiction, policy_type' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: SettlementInput = JSON.parse(args.input)
      const compensation = calculateCompensation(input)
      const strategy = developNegotiationStrategy(input, compensation)
      const court = estimateCourtOutcome(input)
      return formatSettlementReport(input, compensation, strategy, court)
    }
  }))

  // Tool 6: Recovery Tracker (代位求偿追踪)
  tools.register(defineTool({
    name: 'recovery_tracker',
    description: 'Track subrogation recovery: identify at-fault parties, quantify recoverable amounts, monitor statute of limitations, design recovery strategy, assess apportionment, and compute success probability.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: claim_no, claim_paid_amount, at_fault_party, at_fault_party_insurer?, at_fault_contact, fault_percentage, liability_established, statute_of_limitations_date, incident_date, jurisdiction, defendant_assets, defendant_insurance_limit?, subrogation_waiver, comparative_fault, recovery_expenses, third_party_legal_counsel' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: RecoveryInput = JSON.parse(args.input)
      const recovery = calculateRecoveryAmount(input)
      const strategy = developRecoveryStrategy(input, recovery)
      const probability = estimateSuccessProbability(input, recovery)
      return formatRecoveryReport(input, recovery, strategy, probability)
    }
  }))

  // Tool 7: Claims Analytics Dashboard (理赔分析仪表盘)
  tools.register(defineTool({
    name: 'claims_analytics',
    description: 'Generate claims analytics dashboard with loss ratio, average claim size, cycle-time, denial ratio, reserve adequacy, IBNR, and channel distribution visualizations.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: reporting_period, business_line, channel_mix, total_claims_count, total_claims_paid, total_reserves, total_premium_earned, claims_closed, claims_pending, claims_denied, denial_reasons, average_settlement_days, ibnr_estimate, case_reserves' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: ClaimsAnalyticsInput = JSON.parse(args.input)
      const ratios = calculateLossRatios(input)
      const reserves = analyzeReserves(input)
      return formatAnalyticsReport(input, ratios, reserves)
    }
  }))

  // Tool 8: Customer Claim Portal (客户理赔门户)
  tools.register(defineTool({
    name: 'customer_claim_portal',
    description: 'Customer self-service claim portal: eligibility for online submission, progress tracking, document upload checklist, satisfaction review, renewal advisory, and coverage gap analysis.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON-encoded string containing the relevant input object: Fields: customer_id, customer_name, policy_no, policy_type, claim_history, current_claim_ref?, satisfaction_scores, coverage_gaps, renewal_due_date, payment_history, documents_uploaded, communication_preferences' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: CustomerPortalInput = JSON.parse(args.input)
      const selfService = assessSelfServiceEligibility(input)
      const gaps = analyzeCoverageGaps(input)
      return formatPortalReport(input, selfService, gaps)
    }
  }))

  console.log(`[dsh-tool-insuranceclaim] Loaded v${VERSION} — Insurance Claims Automation with 8 tools`)
  console.log('  Tools: claim_first_notice, loss_assessment, coverage_verifier, fraud_detector, settlement_negotiator, recovery_tracker, claims_analytics, customer_claim_portal')
}
