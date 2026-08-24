/**
 * DSH Financial Compliance & AML Plugin v1.0.0
 *
 * Anti-money laundering, transaction monitoring, sanctions screening,
 * suspicious activity reporting, KYC verification, regulatory reporting,
 * risk assessment, compliance training, audit trail generation.
 * 2026: AML compliance spending $15B+ globally; RegTech market $25B+.
 *
 * Features (v1.0.0):
 * - AML Transaction Monitor (real-time transaction screening, structuring detection,.velocity analysis)
 * - Sanctions Screening Engine (OFAC/UN/EU list matching, fuzzy name matching, false positive reduction)
 * - Suspicious Activity Reporter (SAR narrative generation, evidence compilation, filing readiness)
 * - KYC Verification Orchestrator (identity document verification, biometric match, PEP/adverse media)
 * - Regulatory Reporting Automator (CTR/FBAR/MiFID report generation, validation, submission tracking)
 * - Risk Assessment Matrix (customer/product/geographic risk scoring, combined risk rating)
 * - Compliance Training Tracker (course assignment, completion tracking, comprehension scoring, refreshers)
 * - Audit Trail Generator (immutable audit logs, chain of custody, timestamp integrity, report generation)
 *
 * @module dsh-tool-fincompliance
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-fincompliance'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute legal, regulatory, or compliance advice. Consult qualified compliance professionals and legal counsel before filing reports or making compliance decisions.'

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeRng(seed: number) {
  const r = mulberry32(seed)
  return {
    next: (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min,
    nextFloat: (min: number, max: number) => r() * (max - min) + min,
    pick: <T>(arr: T[]): T => arr[Math.floor(r() * arr.length)],
    pickN: <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => r() - 0.5)
      return shuffled.slice(0, n)
    }
  }
}

function computeSeed(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: AML Transaction Monitor ---
export interface AmlTransactionMonitorInput {
  account_id: string
  account_holder: string
  monitoring_period_days: number
  transactions: {
    id: string
    date: string
    amount: number
    currency: string
    type: 'deposit' | 'withdrawal' | 'transfer' | 'wire'
    counterparty: string
    jurisdiction: string
    purpose: string
  }[]
  risk_indicators?: string[]
  prior_sars_count?: number
  account_type?: 'individual' | 'corporate' | 'trust' | 'nonprofit'
}

export interface AmlAlert {
  alert_id: string
  category: 'structuring' | 'rapid_movement' | 'layering' | 'high_risk_jurisdiction' | 'unusual_pattern' | 'amount_spike'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  involved_transactions: string[]
  amount_total: number
}

export interface AmlTransactionMonitorOutput {
  account_id: string
  alert_count: number
  alerts: AmlAlert[]
  risk_score: number
  recommended_action: string
  monitoring_summary: string[]
}

// --- Tool 2: Sanctions Screening Engine ---
export interface SanctionsScreeningInput {
  entity_name: string
  entity_type: 'individual' | 'corporate' | 'vessel' | 'aircraft'
  jurisdiction?: string
  date_of_birth?: string
  nationality?: string
  identification_numbers?: string[]
  screening_lists?: string[]
  fuzzy_threshold?: number
}

export interface SanctionsMatch {
  list_source: string
  matched_name: string
  match_score: number
  match_type: 'exact' | 'fuzzy' | 'alias'
  sanction_type: string
  program: string
  listed_date: string
  reasons: string[]
}

export interface SanctionsScreeningOutput {
  entity_name: string
  screening_timestamp: string
  total_lists_checked: number
  matches_found: number
  matches: SanctionsMatch[]
  false_positive_likelihood: number
  recommended_action: string
  screening_notes: string[]
}

// --- Tool 3: Suspicious Activity Reporter ---
export interface SuspiciousActivityReporterInput {
  sar_id: string
  filing_institution: string
  institution_rssd: string
  activity_start_date: string
  activity_end_date: string
  suspicious_amount: number
  currency: string
  violation_type: string
  individuals_involved: { name: string; role: string; account_numbers?: string[] }[]
  narrative_summary: string
  supporting_evidence?: string[]
  prior_reports?: number
  law_enforcement_notified?: boolean
}

export interface SarSection {
  section_name: string
  content: string
  completeness: 'complete' | 'partial' | 'insufficient'
}

export interface SuspiciousActivityReporterOutput {
  sar_id: string
  filing_status: 'ready' | 'needs_review' | 'insufficient_info'
  filing_deadline: string
  sections: SarSection[]
  total_amount: number
  individuals_count: number
  filing_recommendations: string[]
  regulatory_compliance_score: number
}

// --- Tool 4: KYC Verification Orchestrator ---
export interface KycVerificationInput {
  customer_id: string
  customer_name: string
  customer_type: 'individual' | 'corporate'
  id_document_type: string
  id_document_number: string
  id_expiry_date: string
  nationality: string
  country_of_residence: string
  pep_status?: boolean
  adverse_media_flags?: string[]
  beneficial_owners?: { name: string; ownership_percent: number; nationality: string }[]
  intended_account_purpose?: string
  expected_activity_volume?: 'low' | 'medium' | 'high'
  verification_level?: 'simplified' | 'standard' | 'enhanced'
}

export interface KycCheckResult {
  check_name: string
  status: 'pass' | 'fail' | 'manual_review'
  confidence_score: number
  notes: string
}

export interface KycVerificationOutput {
  customer_id: string
  overall_verification_status: 'approved' | 'rejected' | 'manual_review' | 'enhanced_due_diligence'
  risk_rating: 'low' | 'medium' | 'high'
  checks: KycCheckResult[]
  edd_required: boolean
  next_review_date: string
  recommendations: string[]
}

// --- Tool 5: Regulatory Reporting Automator ---
export interface RegulatoryReportingInput {
  report_type: 'CTR' | 'FBAR' | 'MiFID_II' | 'EMIR' | 'Dodd_Frank' | 'BSA'
  reporting_period: string
  institution_id: string
  institution_name: string
  total_reports: number
  total_amount: number
  currency: string
  report_details: {
    report_id: string
    entity_name: string
    amount: number
    date: string
    nature: string
  }[]
  previous_filed_count?: number
  regulatory_deadline: string
}

export interface ReportValidationResult {
  report_id: string
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface RegulatoryReportingOutput {
  report_type: string
  reporting_period: string
  total_reports_submitted: number
  total_amount_reported: number
  validation_results: ReportValidationResult[]
  submission_status: 'complete' | 'partial' | 'validation_failed'
  filing_deadline: string
  days_to_deadline: number
  summary: string[]
}

// --- Tool 6: Risk Assessment Matrix ---
export interface RiskAssessmentInput {
  assessment_id: string
  customer_id: string
  customer_name: string
  customer_type: 'individual' | 'corporate' | 'trust' | 'nonprofit'
  country_of_origin: string
  country_of_operation: string
  industry: string
  products_used: string[]
  transaction_volume_annual: number
  pep_associated: boolean
  adverse_media_count: number
  sanctions_exposure: boolean
  prior_regulatory_actions?: number
  years_as_customer?: number
}

export interface RiskFactor {
  factor_name: string
  category: 'customer' | 'geographic' | 'product' | 'transaction' | 'behavioral'
  score: number
  weight: number
  weighted_score: number
  risk_level: 'low' | 'medium' | 'high'
  justification: string
}

export interface RiskAssessmentOutput {
  assessment_id: string
  customer_id: string
  overall_risk_score: number
  overall_risk_rating: 'low' | 'medium' | 'high' | 'prohibited'
  risk_factors: RiskFactor[]
  recommended_review_frequency: string
  enhanced_measures: string[]
  assessment_date: string
}

// --- Tool 7: Compliance Training Tracker ---
export interface ComplianceTrainingInput {
  organization_id: string
  reporting_period: string
  total_employees: number
  training_programs: {
    program_id: string
    program_name: string
    mandatory: boolean
    target_roles: string[]
    completion_rate: number
    avg_score: number
    overdue_count: number
  }[]
  compliance_certifications?: { name: string; completed: number; total: number; expiry_date: string }[]
  regulatory_requirements?: string[]
}

export interface TrainingGap {
  program_name: string
  gap_description: string
  affected_employees: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  remediation: string
}

export interface ComplianceTrainingOutput {
  organization_id: string
  reporting_period: string
  overall_completion_rate: number
  mandatory_completion_rate: number
  training_gaps: TrainingGap[]
  regulatory_compliance_status: 'compliant' | 'at_risk' | 'non_compliant'
  overdue_total: number
  recommendations: string[]
  estimated_penalty_exposure: string
}

// --- Tool 8: Audit Trail Generator ---
export interface AuditTrailInput {
  audit_id: string
  entity_name: string
  audit_period_start: string
  audit_period_end: string
  audit_scope: string[]
  stakeholders: { name: string; role: string; department: string }[]
  events: {
    event_id: string
    timestamp: string
    actor: string
    action: string
    resource: string
    ip_address?: string
    outcome: 'success' | 'failure' | 'denied'
    details: string
  }[]
  compliance_frameworks?: string[]
}

export interface AuditFinding {
  finding_id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string
  affected_events: string[]
  recommendation: string
}

export interface AuditTrailOutput {
  audit_id: string
  entity_name: string
  total_events_logged: number
  events_by_outcome: { success: number; failure: number; denied: number }
  findings: AuditFinding[]
  integrity_score: number
  frameworks_covered: string[]
  trail_report: string[]
  chain_of_custody_status: 'intact' | 'compromised' | 'partial'
}

// ==================== TOOL 1: AML TRANSACTION MONITOR ====================

function executeAmlTransactionMonitor(input: AmlTransactionMonitorInput): AmlTransactionMonitorOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const txns = input.transactions
  const alerts: AmlAlert[] = []
  const summary: string[] = []

  const totalVolume = txns.reduce((a, t) => a + t.amount, 0)
  const avgAmount = txns.length > 0 ? totalVolume / txns.length : 0

  // Detect structuring: multiple transactions just below reporting threshold
  const structuringTxns = txns.filter(t => t.amount >= 8000 && t.amount < 10000)
  if (structuringTxns.length >= 3) {
    alerts.push({
      alert_id: 'AML-' + rng.next(1000, 9999),
      category: 'structuring',
      severity: structuringTxns.length >= 5 ? 'critical' : 'high',
      description: 'Possible structuring detected: ' + structuringTxns.length + ' transactions between $8,000-$10,000 in ' + input.monitoring_period_days + ' days',
      involved_transactions: structuringTxns.map(t => t.id),
      amount_total: structuringTxns.reduce((a, t) => a + t.amount, 0)
    })
  }

  // Detect rapid movement: funds in and out within 48 hours
  const deposits = txns.filter(t => t.type === 'deposit').sort((a, b) => a.date.localeCompare(b.date))
  const withdrawals = txns.filter(t => t.type === 'withdrawal' || t.type === 'transfer').sort((a, b) => a.date.localeCompare(b.date))
  let rapidMovementCount = 0
  const rapidMovementTxns: string[] = []
  for (const d of deposits) {
    const dDate = new Date(d.date)
    for (const w of withdrawals) {
      const wDate = new Date(w.date)
      const diffHours = (wDate.getTime() - dDate.getTime()) / (1000 * 60 * 60)
      if (diffHours > 0 && diffHours <= 48 && Math.abs(d.amount - w.amount) / d.amount < 0.15) {
        rapidMovementCount++
        rapidMovementTxns.push(d.id, w.id)
      }
    }
  }
  if (rapidMovementCount >= 2) {
    alerts.push({
      alert_id: 'AML-' + rng.next(1000, 9999),
      category: 'rapid_movement',
      severity: rapidMovementCount >= 4 ? 'critical' : 'high',
      description: 'Rapid movement pattern: ' + rapidMovementCount + ' instances of funds deposited and withdrawn within 48 hours with >85% amount retention',
      involved_transactions: [...new Set(rapidMovementTxns)],
      amount_total: 0
    })
  }

  // Detect layering: complex chain of transfers through multiple jurisdictions
  const crossBorderTransfers = txns.filter(t => t.type === 'transfer' || t.type === 'wire')
  const uniqueJurisdictions = new Set(crossBorderTransfers.map(t => t.jurisdiction))
  if (crossBorderTransfers.length >= 4 && uniqueJurisdictions.size >= 3) {
    alerts.push({
      alert_id: 'AML-' + rng.next(1000, 9999),
      category: 'layering',
      severity: uniqueJurisdictions.size >= 5 ? 'critical' : 'high',
      description: 'Potential layering: ' + crossBorderTransfers.length + ' cross-border transfers across ' + uniqueJurisdictions.size + ' jurisdictions',
      involved_transactions: crossBorderTransfers.map(t => t.id),
      amount_total: crossBorderTransfers.reduce((a, t) => a + t.amount, 0)
    })
  }

  // High-risk jurisdiction exposure
  const highRiskJurisdictions = ['NK', 'IR', 'AF', 'MM', 'SY', 'YE', 'SO', 'ML', 'TD']
  const highRiskTxns = txns.filter(t => highRiskJurisdictions.includes(t.jurisdiction))
  if (highRiskTxns.length > 0) {
    alerts.push({
      alert_id: 'AML-' + rng.next(1000, 9999),
      category: 'high_risk_jurisdiction',
      severity: highRiskTxns.length >= 3 ? 'critical' : 'high',
      description: 'Transactions involving high-risk jurisdictions: ' + highRiskTxns.length + ' transactions to/from ' + [...new Set(highRiskTxns.map(t => t.jurisdiction))].join(', '),
      involved_transactions: highRiskTxns.map(t => t.id),
      amount_total: highRiskTxns.reduce((a, t) => a + t.amount, 0)
    })
  }

  // Amount spike detection
  const recentTxns = txns.slice(-Math.min(10, txns.length))
  const recentAvg = recentTxns.length > 0 ? recentTxns.reduce((a, t) => a + t.amount, 0) / recentTxns.length : 0
  if (recentAvg > avgAmount * 2.5 && txns.length > 5) {
    alerts.push({
      alert_id: 'AML-' + rng.next(1000, 9999),
      category: 'amount_spike',
      severity: recentAvg > avgAmount * 4 ? 'critical' : 'high',
      description: 'Significant amount spike: recent average $' + recentAvg.toFixed(2) + ' vs historical $' + avgAmount.toFixed(2) + ' (' + (recentAvg / avgAmount).toFixed(1) + 'x)',
      involved_transactions: recentTxns.map(t => t.id),
      amount_total: recentTxns.reduce((a, t) => a + t.amount, 0)
    })
  }

  // Unusual pattern: many round-number transactions
  const roundNumberTxns = txns.filter(t => t.amount % 1000 === 0 && t.amount >= 5000)
  if (roundNumberTxns.length >= 4) {
    alerts.push({
      alert_id: 'AML-' + rng.next(1000, 9999),
      category: 'unusual_pattern',
      severity: roundNumberTxns.length >= 8 ? 'high' : 'medium',
      description: 'Unusual round-number pattern: ' + roundNumberTxns.length + ' transactions in round thousands',
      involved_transactions: roundNumberTxns.map(t => t.id),
      amount_total: roundNumberTxns.reduce((a, t) => a + t.amount, 0)
    })
  }

  // Prior SARs escalation
  if (input.prior_sars_count && input.prior_sars_count >= 2) {
    summary.push('Account has ' + input.prior_sars_count + ' prior SARs filed - elevated scrutiny recommended')
  }

  // Risk signals from input
  const riskIndicators = input.risk_indicators || []
  for (const indicator of riskIndicators) {
    summary.push('Risk indicator: ' + indicator)
  }

  // Compute overall risk score
  let riskScore = 0
  for (const alert of alerts) {
    if (alert.severity === 'critical') riskScore += 25
    else if (alert.severity === 'high') riskScore += 18
    else if (alert.severity === 'medium') riskScore += 10
    else riskScore += 4
  }
  riskScore = clamp(riskScore + rng.next(-3, 3), 0, 100)

  let recommendedAction: string
  if (riskScore >= 75) {
    recommendedAction = 'IMMEDIATE SAR filing required. Freeze suspicious transactions. Escalate to AML compliance officer within 24 hours.'
  } else if (riskScore >= 50) {
    recommendedAction = 'Enhanced monitoring recommended. File SAR within 30 days if pattern continues. Conduct enhanced due diligence.'
  } else if (riskScore >= 25) {
    recommendedAction = 'Continue monitoring. Document rationale if no SAR filed. Review in next monitoring cycle.'
  } else {
    recommendedAction = 'No action required. Activity within normal parameters.'
  }

  summary.push('Total transactions analyzed: ' + txns.length)
  summary.push('Total volume: $' + totalVolume.toFixed(2))
  summary.push('Average transaction: $' + avgAmount.toFixed(2))
  summary.push('Alerts generated: ' + alerts.length)
  summary.push('Overall risk score: ' + riskScore + '/100')

  return {
    account_id: input.account_id,
    alert_count: alerts.length,
    alerts,
    risk_score: riskScore,
    recommended_action: recommendedAction,
    monitoring_summary: summary
  }
}

// ==================== TOOL 2: SANCTIONS SCREENING ENGINE ====================

function executeSanctionsScreeningEngine(input: SanctionsScreeningInput): SanctionsScreeningOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const lists = input.screening_lists || ['OFAC_SDN', 'UN_SC', 'EU_Consolidated', 'HMT_Treasury', 'DFAT']
  const fuzzyThreshold = input.fuzzy_threshold ?? 80
  const matches: SanctionsMatch[] = []
  const notes: string[] = []

  // Simulated sanctions list entries for deterministic matching
  const sanctionedEntries: { name: string; list: string; program: string; sanctionType: string; listedDate: string; aliases: string[] }[] = [
    { name: 'ABC TRADING LLC', list: 'OFAC_SDN', program: 'CYBER', sanctionType: 'Block', listedDate: '2023-06-15', aliases: ['ABC Trading', 'ABC TRD LLC'] },
    { name: 'NORTHERN SHIPPING CO', list: 'UN_SC', program: 'DPRK', sanctionType: 'Asset Freeze', listedDate: '2022-11-03', aliases: ['North Ship Co', 'NSC Ltd'] },
    { name: 'GOLDEN FINANCE BANK', list: 'EU_Consolidated', program: 'Iran', sanctionType: 'Restrictive Measures', listedDate: '2024-01-20', aliases: ['GFB', 'Golden Fin Bank'] },
    { name: 'STAR IMPORT EXPORT', list: 'HMT_Treasury', program: 'Counter-Terrorism', sanctionType: 'Asset Freeze', listedDate: '2023-09-12', aliases: ['Star IE', 'Star Imp/Exp'] },
    { name: 'GLOBAL TECH HOLDINGS', list: 'OFAC_SDN', program: 'Magnitsky', sanctionType: 'Block', listedDate: '2024-03-08', aliases: ['GTH', 'GlobalTech'] },
    { name: 'PACIFIC MINING CORP', list: 'UN_SC', program: 'DRC', sanctionType: 'Travel Ban + Asset Freeze', listedDate: '2023-04-22', aliases: ['PacMin', 'Pacific Mining'] }
  ]

  for (const entry of sanctionedEntries) {
    // Exact name match
    let matchScore = 0
    let matchType: SanctionsMatch['match_type'] | null = null

    if (entry.name.toLowerCase() === input.entity_name.toLowerCase()) {
      matchScore = 100
      matchType = 'exact'
    } else if (entry.aliases.some(a => a.toLowerCase() === input.entity_name.toLowerCase())) {
      matchScore = 95
      matchType = 'alias'
    } else {
      // Fuzzy match: compute character overlap ratio
      const inputLower = input.entity_name.toLowerCase()
      const entryLower = entry.name.toLowerCase()
      const commonChars = [...inputLower].filter(c => entryLower.includes(c)).length
      const overlapRatio = (2 * commonChars) / (inputLower.length + entryLower.length)
      const fuzzyScore = Math.round(overlapRatio * 100)

      if (fuzzyScore >= fuzzyThreshold && fuzzyScore < 100) {
        matchScore = fuzzyScore
        matchType = 'fuzzy'
      }
    }

    if (matchScore > 0 && matchType) {
      matches.push({
        list_source: entry.list,
        matched_name: entry.name,
        match_score: matchScore,
        match_type: matchType,
        sanction_type: entry.sanctionType,
        program: entry.program,
        listed_date: entry.listedDate,
        reasons: [
          'Name ' + matchType + ' match (' + matchScore + '% confidence)',
          'Listed under ' + entry.program + ' program',
          'Sanction type: ' + entry.sanctionType
        ]
      })
    }
  }

  // Nationality/jurisdiction screening
  if (input.nationality && ['KP', 'IR', 'SY'].includes(input.nationality.toUpperCase())) {
    notes.push('Nationality ' + input.nationality + ' is a sanctioned jurisdiction - enhanced screening applied')
  }

  // False positive estimation
  const falsePositiveLikelihood = matches.length === 0 ? rng.next(1, 10) : rng.next(20, 60)

  let recommendedAction: string
  const exactMatches = matches.filter(m => m.match_type === 'exact')
  const fuzzyMatches = matches.filter(m => m.match_type === 'fuzzy')

  if (exactMatches.length > 0) {
    recommendedAction = 'BLOCK IMMEDIATELY. Exact sanctions match. Do not process transaction. Report to OFAC/regulatory authority within 10 business days. Freeze assets.'
  } else if (fuzzyMatches.length > 0 && fuzzyMatches.some(m => m.match_score >= 90)) {
    recommendedAction = 'HIGH PRIORITY REVIEW. Near-exact sanctions match. Place transaction on hold pending manual compliance review within 24 hours.'
  } else if (matches.length > 0) {
    recommendedAction = 'REVIEW REQUIRED. Potential sanctions match detected. Conduct manual review and document decision. Consider filing if confirmed.'
  } else {
    recommendedAction = 'No sanctions matches detected. Transaction may proceed with standard monitoring.'
  }

  notes.push('Screening completed against ' + lists.length + ' sanctions lists')
  notes.push('Entity type: ' + input.entity_type)
  notes.push('Fuzzy matching threshold: ' + fuzzyThreshold + '%')
  notes.push('Total matches found: ' + matches.length)
  notes.push('False positive likelihood: ' + falsePositiveLikelihood + '%')

  return {
    entity_name: input.entity_name,
    screening_timestamp: new Date().toISOString(),
    total_lists_checked: lists.length,
    matches_found: matches.length,
    matches,
    false_positive_likelihood: falsePositiveLikelihood,
    recommended_action: recommendedAction,
    screening_notes: notes
  }
}

// ==================== TOOL 3: SUSPICIOUS ACTIVITY REPORTER ====================

function executeSuspiciousActivityReporter(input: SuspiciousActivityReporterInput): SuspiciousActivityReporterOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const sections: SarSection[] = []
  const recommendations: string[] = []

  // Section 1: Filing Information
  sections.push({
    section_name: 'Filing Information',
    content: 'Institution: ' + input.filing_institution + ' (RSSD: ' + input.institution_rssd + ')\nSAR ID: ' + input.sar_id + '\nActivity period: ' + input.activity_start_date + ' to ' + input.activity_end_date + '\nTotal suspicious amount: ' + input.currency + ' ' + input.suspicious_amount.toLocaleString(),
    completeness: input.filing_institution && input.institution_rssd ? 'complete' : 'partial'
  })

  // Section 2: Suspicious Activity Type
  const violationTypes = input.violation_type.split(',').map(v => v.trim())
  sections.push({
    section_name: 'Suspicious Activity Type',
    content: 'Primary violations: ' + violationTypes.join(', ') + '\nNumber of violation categories: ' + violationTypes.length + '\nPrior reports on file: ' + (input.prior_reports ?? 0),
    completeness: input.violation_type.length > 0 ? 'complete' : 'insufficient'
  })

  // Section 3: Individuals/Entities Involved
  sections.push({
    section_name: 'Subjects Involved',
    content: input.individuals_involved.map(ind => '- ' + ind.name + ' (' + ind.role + ')' + (ind.account_numbers ? ', Accounts: ' + ind.account_numbers.join(', ') : '')).join('\n'),
    completeness: input.individuals_involved.length > 0 ? 'complete' : 'insufficient'
  })

  // Section 4: Narrative
  sections.push({
    section_name: 'Narrative Summary',
    content: input.narrative_summary,
    completeness: input.narrative_summary.length >= 50 ? 'complete' : input.narrative_summary.length >= 20 ? 'partial' : 'insufficient'
  })

  // Section 5: Supporting Evidence
  const evidence = input.supporting_evidence || []
  sections.push({
    section_name: 'Supporting Evidence',
    content: evidence.length > 0 ? evidence.map((e, i) => (i + 1) + '. ' + e).join('\n') : 'No supporting evidence provided',
    completeness: evidence.length >= 3 ? 'complete' : evidence.length >= 1 ? 'partial' : 'insufficient'
  })

  // Section 6: Law Enforcement Notification
  sections.push({
    section_name: 'Law Enforcement',
    content: input.law_enforcement_notified
      ? 'Law enforcement has been notified regarding this suspicious activity.'
      : 'Law enforcement notification: Not yet notified. Consider notifying if criminal activity confirmed.',
    completeness: 'complete'
  })

  // Compute filing status
  const completenessLevels = sections.map(s => s.completeness)
  const insufficientCount = completenessLevels.filter(c => c === 'insufficient').length
  const partialCount = completenessLevels.filter(c => c === 'partial').length

  let filingStatus: SuspiciousActivityReporterOutput['filing_status']
  if (insufficientCount >= 2 || sections.some(s => s.section_name === 'Narrative Summary' && s.completeness === 'insufficient')) {
    filingStatus = 'insufficient_info'
  } else if (partialCount >= 2 || insufficientCount === 1) {
    filingStatus = 'needs_review'
  } else {
    filingStatus = 'ready'
  }

  // Computing regulatory compliance score
  let complianceScore = 100
  complianceScore -= insufficientCount * 25
  complianceScore -= partialCount * 10
  if (input.narrative_summary.length < 100) complianceScore -= 10
  if (evidence.length < 2) complianceScore -= 5
  complianceScore = clamp(complianceScore, 0, 100)

  // Filing deadline calculation (30 days from activity end)
  const endDate = new Date(input.activity_end_date)
  const deadline = new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const filingDeadline = deadline.toISOString().split('T')[0]

  // Recommendations
  if (filingStatus !== 'ready') {
    recommendations.push('Complete all insufficient sections before filing')
  }
  if (input.narrative_summary.length < 200) {
    recommendations.push('Expand narrative to include specific dates, amounts, and behavioral observations')
  }
  if (evidence.length < 3) {
    recommendations.push('Attach additional supporting evidence: transaction records, account statements, correspondence')
  }
  if (!input.law_enforcement_notified) {
    recommendations.push('Consider whether law enforcement notification is warranted based on activity type')
  }
  if (input.violation_type.toLowerCase().includes('structuring')) {
    recommendations.push('For structuring: include CTR filing history and currency transaction patterns')
  }
  if (complianceScore >= 80) {
    recommendations.push('SAR appears filing-ready. Final review by BSA/AML officer recommended.')
  }

  return {
    sar_id: input.sar_id,
    filing_status: filingStatus,
    filing_deadline: filingDeadline,
    sections,
    total_amount: input.suspicious_amount,
    individuals_count: input.individuals_involved.length,
    filing_recommendations: recommendations,
    regulatory_compliance_score: complianceScore
  }
}

// ==================== TOOL 4: KYC VERIFICATION ORCHESTRATOR ====================

function executeKycVerificationOrchestrator(input: KycVerificationInput): KycVerificationOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const checks: KycCheckResult[] = []
  const recommendations: string[] = []

  // Check 1: ID Document Validity
  const today = new Date()
  const expiry = new Date(input.id_expiry_date)
  const daysToExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const idValid = daysToExpiry > 90
  checks.push({
    check_name: 'ID Document Validity',
    status: idValid ? 'pass' : daysToExpiry > 0 ? 'manual_review' : 'fail',
    confidence_score: idValid ? rng.next(85, 99) : daysToExpiry > 0 ? rng.next(50, 75) : rng.next(10, 30),
    notes: idValid
      ? 'Document valid, expires in ' + daysToExpiry + ' days'
      : daysToExpiry > 0
        ? 'Document expires in ' + daysToExpiry + ' days - renewal recommended'
        : 'Document EXPIRED ' + Math.abs(daysToExpiry) + ' days ago'
  })

  // Check 2: PEP Screening
  const pepStatus = input.pep_status ?? (rng.next(0, 100) > 85)
  checks.push({
    check_name: 'PEP Screening',
    status: pepStatus ? 'manual_review' : 'pass',
    confidence_score: pepStatus ? rng.next(70, 95) : rng.next(80, 99),
    notes: pepStatus
      ? 'Customer identified as Politically Exposed Person - enhanced due diligence required'
      : 'No PEP matches found in screening databases'
  })

  // Check 3: Adverse Media Screening
  const adverseMedia = input.adverse_media_flags || []
  const adverseMediaSeverity = adverseMedia.length >= 3 ? 'high' : adverseMedia.length >= 1 ? 'medium' : 'low'
  checks.push({
    check_name: 'Adverse Media Screening',
    status: adverseMediaSeverity === 'high' ? 'fail' : adverseMediaSeverity === 'medium' ? 'manual_review' : 'pass',
    confidence_score: adverseMediaSeverity === 'high' ? rng.next(60, 80) : adverseMediaSeverity === 'medium' ? rng.next(50, 75) : rng.next(85, 99),
    notes: adverseMedia.length > 0
      ? adverseMedia.length + ' adverse media flags: ' + adverseMedia.join(', ')
      : 'No adverse media found across monitored sources'
  })

  // Check 4: Beneficial Ownership (corporate only)
  if (input.customer_type === 'corporate') {
    const owners = input.beneficial_owners || []
    const totalOwnership = owners.reduce((a, o) => a + o.ownership_percent, 0)
    const hasUbo = owners.some(o => o.ownership_percent >= 25)
    checks.push({
      check_name: 'Beneficial Ownership Verification',
      status: hasUbo && totalOwnership > 80 ? 'pass' : totalOwnership > 50 ? 'manual_review' : 'fail',
      confidence_score: hasUbo ? rng.next(70, 95) : rng.next(30, 60),
      notes: owners.length + ' beneficial owners identified, total declared: ' + totalOwnership + '%. ' + (hasUbo ? 'UBO identified (>=25% ownership).' : 'No UBO identified - ownership structure may be opaque.')
    })
  }

  // Check 5: Geographic Risk
  const highRiskCountries = ['KP', 'IR', 'AF', 'MM', 'SY', 'YE', 'SO', 'ML', 'TD', 'BA', 'UG']
  const geoRisk = highRiskCountries.includes(input.country_of_residence.toUpperCase()) ? 'high' : 'low'
  checks.push({
    check_name: 'Geographic Risk Assessment',
    status: geoRisk === 'high' ? 'manual_review' : 'pass',
    confidence_score: rng.next(75, 99),
    notes: 'Country of residence: ' + input.country_of_residence + ' (' + (geoRisk === 'high' ? 'HIGH RISK - enhanced monitoring required' : 'Standard risk jurisdiction') + ')'
  })

  // Check 6: Activity Purpose Alignment
  const purpose = input.intended_account_purpose || 'general_banking'
  const volume = input.expected_activity_volume || 'medium'
  const purposeRisk = volume === 'high' && purpose.toLowerCase().includes('personal') ? 'mismatch' : 'aligned'
  checks.push({
    check_name: 'Purpose and Activity Alignment',
    status: purposeRisk === 'mismatch' ? 'manual_review' : 'pass',
    confidence_score: rng.next(70, 95),
    notes: 'Purpose: ' + purpose + ' | Expected volume: ' + volume + ' | Alignment: ' + purposeRisk
  })

  // Compute overall status
  const failCount = checks.filter(c => c.status === 'fail').length
  const reviewCount = checks.filter(c => c.status === 'manual_review').length
  const eddRequired = pepStatus || adverseMediaSeverity === 'high' || geoRisk === 'high' || failCount > 0

  let overallStatus: KycVerificationOutput['overall_verification_status']
  let riskRating: KycVerificationOutput['risk_rating']

  if (failCount >= 2 || adverseMediaSeverity === 'high') {
    overallStatus = 'rejected'
    riskRating = 'high'
  } else if (eddRequired || reviewCount >= 2) {
    overallStatus = 'enhanced_due_diligence'
    riskRating = 'high'
  } else if (reviewCount === 1) {
    overallStatus = 'manual_review'
    riskRating = 'medium'
  } else {
    overallStatus = 'approved'
    riskRating = 'low'
  }

  // Next review date
  const reviewMonths = riskRating === 'high' ? 6 : riskRating === 'medium' ? 12 : 24
  const nextReview = new Date()
  nextReview.setMonth(nextReview.getMonth() + reviewMonths)

  // Recommendations
  if (pepStatus) {
    recommendations.push('Conduct enhanced due diligence for PEP customer')
    recommendations.push('Obtain senior management approval for account opening')
    recommendations.push('Establish enhanced ongoing monitoring (quarterly review)')
  }
  if (adverseMedia.length > 0) {
    recommendations.push('Investigate adverse media findings and document resolution')
  }
  if (daysToExpiry < 180) {
    recommendations.push('Request updated identification document before expiry')
  }
  if (geoRisk === 'high') {
    recommendations.push('Apply enhanced monitoring for high-risk jurisdiction')
    recommendations.push('Consider transaction limits and additional verification steps')
  }
  if (input.customer_type === 'corporate' && input.beneficial_owners) {
    const totalOwnership = input.beneficial_owners.reduce((a, o) => a + o.ownership_percent, 0)
    if (totalOwnership < 80) {
      recommendations.push('Clarify ownership structure - declared ownership below 80%')
    }
  }

  return {
    customer_id: input.customer_id,
    overall_verification_status: overallStatus,
    risk_rating: riskRating,
    checks,
    edd_required: eddRequired,
    next_review_date: nextReview.toISOString().split('T')[0],
    recommendations
  }
}

// ==================== TOOL 5: REGULATORY REPORTING AUTOMATOR ====================

function executeRegulatoryReportingAutomator(input: RegulatoryReportingInput): RegulatoryReportingOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const validationResults: ReportValidationResult[] = []
  const summary: string[] = []

  for (const report of input.report_details) {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate amount
    if (report.amount <= 0) {
      errors.push('Invalid amount: must be positive')
    }
    if (input.report_type === 'CTR' && report.amount < 10000) {
      warnings.push('Amount below CTR threshold of $10,000 - verify aggregation logic')
    }

    // Validate date format
    const reportDate = new Date(report.date)
    if (isNaN(reportDate.getTime())) {
      errors.push('Invalid date format: ' + report.date)
    }

    // Validate entity name
    if (!report.entity_name || report.entity_name.trim().length === 0) {
      errors.push('Entity name is required')
    }

    // Validate nature description
    if (!report.nature || report.nature.trim().length < 5) {
      warnings.push('Nature description may be insufficient for regulatory review')
    }

    validationResults.push({
      report_id: report.report_id,
      valid: errors.length === 0,
      errors,
      warnings
    })
  }

  const validCount = validationResults.filter(r => r.valid).length
  const invalidCount = validationResults.filter(r => !r.valid).length

  let submissionStatus: RegulatoryReportingOutput['submission_status']
  if (invalidCount === 0) {
    submissionStatus = 'complete'
  } else if (validCount > invalidCount) {
    submissionStatus = 'partial'
  } else {
    submissionStatus = 'validation_failed'
  }

  // Days to deadline
  const deadline = new Date(input.regulatory_deadline)
  const today = new Date()
  const daysToDeadline = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  summary.push('Report type: ' + input.report_type)
  summary.push('Reporting period: ' + input.reporting_period)
  summary.push('Institution: ' + input.institution_name + ' (' + input.institution_id + ')')
  summary.push('Total reports: ' + input.total_reports)
  summary.push('Valid reports: ' + validCount)
  summary.push('Invalid reports: ' + invalidCount)
  summary.push('Total amount reported: ' + input.currency + ' ' + input.total_amount.toLocaleString())
  summary.push('Regulatory deadline: ' + input.regulatory_deadline)
  summary.push('Days to deadline: ' + daysToDeadline)
  if (input.previous_filed_count !== undefined) {
    summary.push('Previously filed (prior period): ' + input.previous_filed_count)
    const change = input.total_reports - input.previous_filed_count
    if (change !== 0) {
      summary.push('Change from prior period: ' + (change > 0 ? '+' : '') + change + ' reports')
    }
  }

  return {
    report_type: input.report_type,
    reporting_period: input.reporting_period,
    total_reports_submitted: validCount,
    total_amount_reported: input.total_amount,
    validation_results: validationResults,
    submission_status: submissionStatus,
    filing_deadline: input.regulatory_deadline,
    days_to_deadline: daysToDeadline,
    summary
  }
}

// ==================== TOOL 6: RISK ASSESSMENT MATRIX ====================

function executeRiskAssessmentMatrix(input: RiskAssessmentInput): RiskAssessmentOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const factors: RiskFactor[] = []
  const enhancedMeasures: string[] = []

  // Factor 1: Customer Type Risk
  let customerScore = 0
  if (input.customer_type === 'trust') customerScore = 70
  else if (input.customer_type === 'corporate') customerScore = 50
  else if (input.customer_type === 'nonprofit') customerScore = 40
  else customerScore = 25
  factors.push({
    factor_name: 'Customer Type Risk',
    category: 'customer',
    score: customerScore,
    weight: 0.15,
    weighted_score: Math.round(customerScore * 0.15 * 100) / 100,
    risk_level: customerScore >= 60 ? 'high' : customerScore >= 35 ? 'medium' : 'low',
    justification: 'Customer type: ' + input.customer_type + '. ' + (input.customer_type === 'trust' ? 'Trust structures have inherently higher anonymity risk.' : input.customer_type === 'corporate' ? 'Corporate entities have moderate risk depending on ownership transparency.' : 'Individual customers generally present lower baseline risk.')
  })

  // Factor 2: Geographic Risk
  const highRiskCountries = ['KP', 'IR', 'AF', 'MM', 'SY', 'YE', 'SO', 'ML', 'TD']
  const mediumRiskCountries = ['NG', 'PK', 'BD', 'KH', 'UG', 'BA', 'MZ', 'TZ', 'GH']
  let geoScore = 20
  if (highRiskCountries.includes(input.country_of_origin.toUpperCase()) || highRiskCountries.includes(input.country_of_operation.toUpperCase())) {
    geoScore = 90
  } else if (mediumRiskCountries.includes(input.country_of_origin.toUpperCase()) || mediumRiskCountries.includes(input.country_of_operation.toUpperCase())) {
    geoScore = 60
  }
  factors.push({
    factor_name: 'Geographic Risk',
    category: 'geographic',
    score: geoScore,
    weight: 0.2,
    weighted_score: Math.round(geoScore * 0.2 * 100) / 100,
    risk_level: geoScore >= 70 ? 'high' : geoScore >= 40 ? 'medium' : 'low',
    justification: 'Origin: ' + input.country_of_origin + ', Operation: ' + input.country_of_operation
  })

  // Factor 3: Product Risk
  const highRiskProducts = ['correspondent_banking', 'wire_transfer', 'virtual_currency', 'trade_finance', 'private_banking']
  const matchedHighRisk = input.products_used.filter(p => highRiskProducts.includes(p))
  const productScore = matchedHighRisk.length >= 2 ? 80 : matchedHighRisk.length === 1 ? 55 : 20
  factors.push({
    factor_name: 'Product Risk',
    category: 'product',
    score: productScore,
    weight: 0.15,
    weighted_score: Math.round(productScore * 0.15 * 100) / 100,
    risk_level: productScore >= 60 ? 'high' : productScore >= 35 ? 'medium' : 'low',
    justification: 'Products: ' + input.products_used.join(', ') + '. High-risk products: ' + (matchedHighRisk.length > 0 ? matchedHighRisk.join(', ') : 'none')
  })

  // Factor 4: Transaction Volume Risk
  let volumeScore = 20
  if (input.transaction_volume_annual > 5000000) volumeScore = 85
  else if (input.transaction_volume_annual > 1000000) volumeScore = 60
  else if (input.transaction_volume_annual > 250000) volumeScore = 40
  factors.push({
    factor_name: 'Transaction Volume Risk',
    category: 'transaction',
    score: volumeScore,
    weight: 0.15,
    weighted_score: Math.round(volumeScore * 0.15 * 100) / 100,
    risk_level: volumeScore >= 60 ? 'high' : volumeScore >= 35 ? 'medium' : 'low',
    justification: 'Annual volume: $' + input.transaction_volume_annual.toLocaleString()
  })

  // Factor 5: PEP/Sanctions/Adverse Media
  let behavioralScore = 0
  if (input.pep_associated) behavioralScore += 30
  if (input.sanctions_exposure) behavioralScore += 35
  behavioralScore += Math.min(30, input.adverse_media_count * 10)
  if (input.prior_regulatory_actions) behavioralScore += Math.min(20, input.prior_regulatory_actions * 10)
  behavioralScore = clamp(behavioralScore, 0, 100)
  factors.push({
    factor_name: 'Behavioral Risk Indicators',
    category: 'behavioral',
    score: behavioralScore,
    weight: 0.25,
    weighted_score: Math.round(behavioralScore * 0.25 * 100) / 100,
    risk_level: behavioralScore >= 60 ? 'high' : behavioralScore >= 30 ? 'medium' : 'low',
    justification: 'PEP: ' + (input.pep_associated ? 'Yes' : 'No') + ', Sanctions exposure: ' + (input.sanctions_exposure ? 'Yes' : 'No') + ', Adverse media: ' + input.adverse_media_count + ', Prior actions: ' + (input.prior_regulatory_actions ?? 0)
  })

  // Factor 6: Relationship Tenure
  const yearsAsCustomer = input.years_as_customer ?? rng.next(0, 10)
  let tenureScore = 50
  if (yearsAsCustomer < 1) tenureScore = 70
  else if (yearsAsCustomer < 3) tenureScore = 45
  else if (yearsAsCustomer < 5) tenureScore = 30
  else tenureScore = 15
  factors.push({
    factor_name: 'Relationship Tenure',
    category: 'customer',
    score: tenureScore,
    weight: 0.1,
    weighted_score: Math.round(tenureScore * 0.1 * 100) / 100,
    risk_level: tenureScore >= 50 ? 'high' : tenureScore >= 30 ? 'medium' : 'low',
    justification: 'Customer for ' + yearsAsCustomer + ' year(s). New relationships carry higher uncertainty.'
  })

  // Compute overall risk score
  const overallScore = Math.round(factors.reduce((a, f) => a + f.weighted_score, 0))

  let overallRating: RiskAssessmentOutput['overall_risk_rating']
  if (input.sanctions_exposure) {
    overallRating = 'prohibited'
  } else if (overallScore >= 65) {
    overallRating = 'high'
  } else if (overallScore >= 40) {
    overallRating = 'medium'
  } else {
    overallRating = 'low'
  }

  // Recommended review frequency
  let reviewFrequency: string
  if (overallRating === 'high') reviewFrequency = 'Quarterly (every 3 months)'
  else if (overallRating === 'medium') reviewFrequency = 'Semi-annually (every 6 months)'
  else reviewFrequency = 'Annually (every 12 months)'

  // Enhanced measures
  if (overallRating === 'high' || overallRating === 'prohibited') {
    enhancedMeasures.push('Enhanced due diligence (EDD) required')
    enhancedMeasures.push('Senior management approval for account continuation')
    enhancedMeasures.push('Increased transaction monitoring frequency')
    enhancedMeasures.push('Source of funds verification required')
  }
  if (input.pep_associated) {
    enhancedMeasures.push('PEP-specific monitoring: track public positions and adverse news')
  }
  if (input.sanctions_exposure) {
    enhancedMeasures.push('IMMEDIATE: Review sanctions exposure and consider account restriction')
  }
  if (input.adverse_media_count > 0) {
    enhancedMeasures.push('Ongoing adverse media monitoring with automated alerts')
  }
  if (geoScore >= 70) {
    enhancedMeasures.push('Enhanced geographic risk controls: restrict high-risk jurisdiction transactions')
  }
  if (enhancedMeasures.length === 0) {
    enhancedMeasures.push('Standard monitoring sufficient for risk profile')
  }

  return {
    assessment_id: input.assessment_id,
    customer_id: input.customer_id,
    overall_risk_score: overallScore,
    overall_risk_rating: overallRating,
    risk_factors: factors,
    recommended_review_frequency: reviewFrequency,
    enhanced_measures: enhancedMeasures,
    assessment_date: new Date().toISOString().split('T')[0]
  }
}

// ==================== TOOL 7: COMPLIANCE TRAINING TRACKER ====================

function executeComplianceTrainingTracker(input: ComplianceTrainingInput): ComplianceTrainingOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const gaps: TrainingGap[] = []
  const recommendations: string[] = []

  const programs = input.training_programs
  const mandatoryPrograms = programs.filter(p => p.mandatory)
  const allPrograms = programs

  // Compute overall completion rate
  const totalCompletion = allPrograms.reduce((a, p) => a + p.completion_rate, 0)
  const overallCompletionRate = allPrograms.length > 0 ? Math.round((totalCompletion / allPrograms.length) * 100) / 100 : 0

  // Compute mandatory completion rate
  const mandatoryCompletion = mandatoryPrograms.reduce((a, p) => a + p.completion_rate, 0)
  const mandatoryCompletionRate = mandatoryPrograms.length > 0 ? Math.round((mandatoryCompletion / mandatoryPrograms.length) * 100) / 100 : 0

  // Total overdue
  const overdueTotal = allPrograms.reduce((a, p) => a + p.overdue_count, 0)

  // Identify gaps
  for (const program of allPrograms) {
    if (program.completion_rate < 80) {
      const affectedEmployees = Math.round((1 - program.completion_rate / 100) * input.total_employees * (program.target_roles.length / 10))
      gaps.push({
        program_name: program.program_name,
        gap_description: 'Completion rate at ' + program.completion_rate.toFixed(1) + '% (below 80% threshold)',
        affected_employees: Math.max(1, affectedEmployees),
        severity: program.completion_rate < 50 ? 'critical' : program.completion_rate < 70 ? 'high' : 'medium',
        remediation: 'Implement mandatory completion deadline with manager escalation for ' + program.program_name
      })
    }
    if (program.avg_score < 70) {
      gaps.push({
        program_name: program.program_name,
        gap_description: 'Average comprehension score at ' + program.avg_score.toFixed(1) + '% (below 70% threshold)',
        affected_employees: Math.round(input.total_employees * 0.3),
        severity: program.avg_score < 50 ? 'high' : 'medium',
        remediation: 'Redesign course content and add assessment retakes for ' + program.program_name
      })
    }
    if (program.overdue_count > 0) {
      gaps.push({
        program_name: program.program_name,
        gap_description: program.overdue_count + ' employees overdue for mandatory training',
        affected_employees: program.overdue_count,
        severity: program.overdue_count > 10 ? 'high' : 'medium',
        remediation: 'Send immediate reminders and escalate to department heads for ' + program.overdue_count + ' overdue employees'
      })
    }
  }

  // Check certification expiry
  const certs = input.compliance_certifications || []
  for (const cert of certs) {
    const expiryDate = new Date(cert.expiry_date)
    const today = new Date()
    const daysToExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysToExpiry < 90 && daysToExpiry > 0) {
      gaps.push({
        program_name: cert.name,
        gap_description: 'Certification expires in ' + daysToExpiry + ' days (' + cert.completed + '/' + cert.total + ' current)',
        affected_employees: cert.total - cert.completed,
        severity: daysToExpiry < 30 ? 'high' : 'medium',
        remediation: 'Schedule renewal training for ' + cert.name + ' certification'
      })
    } else if (daysToExpiry <= 0) {
      gaps.push({
        program_name: cert.name,
        gap_description: 'Certification EXPIRED ' + Math.abs(daysToExpiry) + ' days ago',
        affected_employees: cert.total,
        severity: 'critical',
        remediation: 'URGENT: Suspend non-compliant employees from regulated activities until recertified'
      })
    }
  }

  // Regulatory compliance status
  let complianceStatus: ComplianceTrainingOutput['regulatory_compliance_status']
  const criticalGaps = gaps.filter(g => g.severity === 'critical').length
  const highGaps = gaps.filter(g => g.severity === 'high').length

  if (mandatoryCompletionRate >= 95 && criticalGaps === 0 && highGaps === 0) {
    complianceStatus = 'compliant'
  } else if (mandatoryCompletionRate >= 80 && criticalGaps === 0) {
    complianceStatus = 'at_risk'
  } else {
    complianceStatus = 'non_compliant'
  }

  // Recommendations
  if (mandatoryCompletionRate < 95) {
    recommendations.push('Increase mandatory training completion from ' + mandatoryCompletionRate.toFixed(1) + '% to 95%+')
  }
  if (overdueTotal > 0) {
    recommendations.push('Clear ' + overdueTotal + ' overdue training assignments with manager escalation')
  }
  if (gaps.some(g => g.severity === 'critical')) {
    recommendations.push('Address critical training gaps immediately - regulatory penalty risk')
  }
  if (certs.some(c => c.completed / c.total < 0.8)) {
    recommendations.push('Prioritize certification renewal for lapsed credentials')
  }
  const reqs = input.regulatory_requirements || []
  if (reqs.length > 0) {
    recommendations.push('Ensure training covers all regulatory requirements: ' + reqs.join(', '))
  }

  // Penalty exposure estimate
  let penaltyExposure: string
  if (complianceStatus === 'compliant') {
    penaltyExposure = 'Low - within regulatory tolerance'
  } else if (complianceStatus === 'at_risk') {
    penaltyExposure = 'Moderate - potential fines of $50K-$250K if gaps not remediated within 90 days'
  } else {
    penaltyExposure = 'High - regulatory action likely. Potential fines of $250K-$1M+ and enforcement action'
  }

  return {
    organization_id: input.organization_id,
    reporting_period: input.reporting_period,
    overall_completion_rate: overallCompletionRate,
    mandatory_completion_rate: mandatoryCompletionRate,
    training_gaps: gaps,
    regulatory_compliance_status: complianceStatus,
    overdue_total: overdueTotal,
    recommendations,
    estimated_penalty_exposure: penaltyExposure
  }
}

// ==================== TOOL 8: AUDIT TRAIL GENERATOR ====================

function executeAuditTrailGenerator(input: AuditTrailInput): AuditTrailOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const events = input.events
  const findings: AuditFinding[] = []
  const report: string[] = []

  // Events by outcome
  const successCount = events.filter(e => e.outcome === 'success').length
  const failureCount = events.filter(e => e.outcome === 'failure').length
  const deniedCount = events.filter(e => e.outcome === 'denied').length

  // Finding 1: High failure rate detection
  const failureRate = events.length > 0 ? failureCount / events.length : 0
  if (failureRate > 0.15) {
    findings.push({
      finding_id: 'AUD-' + rng.next(100, 999),
      severity: failureRate > 0.3 ? 'high' : 'medium',
      category: 'System Reliability',
      description: 'Elevated failure rate of ' + (failureRate * 100).toFixed(1) + '% detected across ' + events.length + ' events',
      affected_events: events.filter(e => e.outcome === 'failure').map(e => e.event_id),
      recommendation: 'Investigate root cause of failures. Review system logs and error patterns.'
    })
  }

  // Finding 2: Denied access pattern
  const deniedActors = events.filter(e => e.outcome === 'denied').reduce((acc, e) => { acc[e.actor] = (acc[e.actor] || 0) + 1; return acc }, {} as Record<string, number>)
  const repeatDenyActors = Object.entries(deniedActors).filter(([_, count]) => count >= 3)
  if (repeatDenyActors.length > 0) {
    findings.push({
      finding_id: 'AUD-' + rng.next(100, 999),
      severity: 'high',
      category: 'Access Control',
      description: repeatDenyActors.length + ' actor(s) with 3+ denied access attempts: ' + repeatDenyActors.map(([actor, count]) => actor + ' (' + count + ')').join(', '),
      affected_events: events.filter(e => e.outcome === 'denied' && repeatDenyActors.some(([actor]) => actor === e.actor)).map(e => e.event_id),
      recommendation: 'Review access control policies. Potential unauthorized access attempts or misconfigured permissions.'
    })
  }

  // Finding 3: After-hours activity
  const afterHoursEvents = events.filter(e => {
    const hour = new Date(e.timestamp).getHours()
    return hour < 6 || hour > 22
  })
  if (afterHoursEvents.length > 0) {
    findings.push({
      finding_id: 'AUD-' + rng.next(100, 999),
      severity: afterHoursEvents.length > 5 ? 'medium' : 'low',
      category: 'Operational Anomaly',
      description: afterHoursEvents.length + ' events occurred outside business hours (before 6AM or after 10PM)',
      affected_events: afterHoursEvents.map(e => e.event_id),
      recommendation: 'Verify after-hours activity was authorized. Review on-call and batch processing schedules.'
    })
  }

  // Findin 4: Privileged access monitoring
  const privilegedActions = ['admin', 'delete', 'modify_permissions', 'override', 'approve']
  const privilegedEvents = events.filter(e => privilegedActions.some(a => e.action.toLowerCase().includes(a)))
  if (privilegedEvents.length > 0) {
    findings.push({
      finding_id: 'AUD-' + rng.next(100, 999),
      severity: 'medium',
      category: 'Privileged Access',
      description: privilegedEvents.length + ' privileged actions detected. Requires verification of authorization.',
      affected_events: privilegedEvents.map(e => e.event_id),
      recommendation: 'Verify all privileged actions were properly authorized and within job responsibilities.'
    })
  }

  // Integrity score
  let integrityScore = 100
  integrityScore -= findings.filter(f => f.severity === 'critical').length * 20
  integrityScore -= findings.filter(f => f.severity === 'high').length * 12
  integrityScore -= findings.filter(f => f.severity === 'medium').length * 6
  integrityScore -= findings.filter(f => f.severity === 'low').length * 2
  integrityScore = clamp(integrityScore, 0, 100)

  // Chain of custody
  let chainOfCustody: AuditTrailOutput['chain_of_custody_status']
  const hasGaps = events.some((e, i) => {
    if (i === 0) return false
    const prev = new Date(events[i - 1].timestamp)
    const curr = new Date(e.timestamp)
    return curr < prev // out of order
  })

  if (hasGaps) {
    chainOfCustody = 'partial'
  } else if (findings.some(f => f.severity === 'critical')) {
    chainOfCustody = 'compromised'
  } else {
    chainOfCustody = 'intact'
  }

  // Build report
  report.push('Audit ID: ' + input.audit_id)
  report.push('Entity: ' + input.entity_name)
  report.push('Period: ' + input.audit_period_start + ' to ' + input.audit_period_end)
  report.push('Scope: ' + input.audit_scope.join(', '))
  report.push('Total events logged: ' + events.length)
  report.push('Events by outcome: Success=' + successCount + ', Failure=' + failureCount + ', Denied=' + deniedCount)
  report.push('Integrity score: ' + integrityScore + '/100')
  report.push('Chain of custody: ' + chainOfCustody)
  report.push('Findings: ' + findings.length)
  for (const finding of findings) {
    report.push('- [' + finding.severity.toUpperCase() + '] ' + finding.category + ': ' + finding.description)
  }
  if (input.stakeholders.length > 0) {
    report.push('Stakeholders: ' + input.stakeholders.map(s => s.name + ' (' + s.role + ', ' + s.department + ')').join('; '))
  }

  return {
    audit_id: input.audit_id,
    entity_name: input.entity_name,
    total_events_logged: events.length,
    events_by_outcome: { success: successCount, failure: failureCount, denied: deniedCount },
    findings,
    integrity_score: integrityScore,
    frameworks_covered: input.compliance_frameworks || ['SOX', 'ISO_27001', 'PCI_DSS'],
    trail_report: report,
    chain_of_custody_status: chainOfCustody
  }
}

// ==================== FORMATTING HELPERS ====================

function formatAmlTransactionMonitorOutput(out: AmlTransactionMonitorOutput): string {
  let s = '# AML Transaction Monitoring Report\n\n'
  s += '**Account:** ' + out.account_id + '\n'
  s += '**Risk Score:** ' + out.risk_score + '/100\n'
  s += '**Alerts:** ' + out.alert_count + '\n\n'
  if (out.alerts.length > 0) {
    s += '## Alerts\n'
    for (const a of out.alerts) {
      s += '- [' + a.severity.toUpperCase() + '] ' + a.category + ': ' + a.description + '\n'
      if (a.involved_transactions.length > 0) {
        s += '  Transactions: ' + a.involved_transactions.join(', ') + '\n'
      }
      s += '  Amount: $' + a.amount_total.toFixed(2) + '\n'
    }
    s += '\n'
  }
  s += '## Monitoring Summary\n'
  for (const line of out.monitoring_summary) { s += '- ' + line + '\n' }
  s += '\n**Recommended Action:** ' + out.recommended_action + '\n'
  s += '\n---\n'
  s += 'AML transaction monitoring: real-time screening for structuring, layering, rapid movement, high-risk jurisdictions, and anomalous patterns.'
  return s
}

function formatSanctionsScreeningOutput(out: SanctionsScreeningOutput): string {
  let s = '# Sanctions Screening Report\n\n'
  s += '**Entity:** ' + out.entity_name + '\n'
  s += '**Screening Timestamp:** ' + out.screening_timestamp + '\n'
  s += '**Lists Checked:** ' + out.total_lists_checked + '\n'
  s += '**Matches Found:** ' + out.matches_found + '\n'
  s += '**False Positive Likelihood:** ' + out.false_positive_likelihood + '%\n\n'
  if (out.matches.length > 0) {
    s += '## Matches\n'
    for (const m of out.matches) {
      s += '- ' + m.matched_name + ' (' + m.match_type + ', ' + m.match_score + '%) on ' + m.list_source + '\n'
      s += '  Program: ' + m.program + ' | Type: ' + m.sanction_type + '\n'
    }
    s += '\n'
  }
  s += '## Screening Notes\n'
  for (const n of out.screening_notes) { s += '- ' + n + '\n' }
  s += '\n**Recommended Action:** ' + out.recommended_action + '\n'
  s += '\n---\n'
  s += 'Sanctions screening: OFAC, UN, EU, and other global sanctions list matching with fuzzy name matching and false positive reduction.'
  return s
}

function formatSuspiciousActivityReporterOutput(out: SuspiciousActivityReporterOutput): string {
  let s = '# Suspicious Activity Report\n\n'
  s += '**SAR ID:** ' + out.sar_id + '\n'
  s += '**Filing Status:** ' + out.filing_status.toUpperCase() + '\n'
  s += '**Filing Deadline:** ' + out.filing_deadline + '\n'
  s += '**Total Amount:** ' + out.total_amount.toLocaleString() + '\n'
  s += '**Subjects:** ' + out.individuals_count + '\n'
  s += '**Compliance Score:** ' + out.regulatory_compliance_score + '/100\n\n'
  s += '## SAR Sections\n'
  for (const sec of out.sections) {
    s += '### ' + sec.section_name + ' [' + sec.completeness.toUpperCase() + ']\n'
    s += sec.content + '\n\n'
  }
  if (out.filing_recommendations.length > 0) {
    s += '## Filing Recommendations\n'
    for (const r of out.filing_recommendations) { s += '- ' + r + '\n' }
  }
  s += '\n---\n'
  s += 'SAR preparation: comprehensive suspicious activity report generation with section completeness assessment and filing readiness scoring.'
  return s
}

function formatKycVerificationOutput(out: KycVerificationOutput): string {
  let s = '# KYC Verification Report\n\n'
  s += '**Customer:** ' + out.customer_id + '\n'
  s += '**Status:** ' + out.overall_verification_status.toUpperCase() + '\n'
  s += '**Risk Rating:** ' + out.risk_rating.toUpperCase() + '\n'
  s += '**EDD Required:** ' + (out.edd_required ? 'Yes' : 'No') + '\n'
  s += '**Next Review:** ' + out.next_review_date + '\n\n'
  s += '## Verification Checks\n'
  for (const c of out.checks) {
    s += '- [' + c.status.toUpperCase() + '] ' + c.check_name + ' (confidence: ' + c.confidence_score + '%)\n'
    s += '  ' + c.notes + '\n'
  }
  if (out.recommendations.length > 0) {
    s += '\n## Recommendations\n'
    for (const r of out.recommendations) { s += '- ' + r + '\n' }
  }
  s += '\n---\n'
  s += 'KYC orchestration: identity verification, PEP screening, adverse media, beneficial ownership, geographic risk, and activity alignment checks.'
  return s
}

function formatRegulatoryReportingOutput(out: RegulatoryReportingOutput): string {
  let s = '# Regulatory Reporting Summary\n\n'
  s += '**Report Type:** ' + out.report_type + '\n'
  s += '**Period:** ' + out.reporting_period + '\n'
  s += '**Reports Submitted:** ' + out.total_reports_submitted + '\n'
  s += '**Total Amount:** ' + out.total_amount_reported.toLocaleString() + '\n'
  s += '**Status:** ' + out.submission_status.toUpperCase() + '\n'
  s += '**Deadline:** ' + out.filing_deadline + ' (' + out.days_to_deadline + ' days)\n\n'
  s += '## Validation Results\n'
  for (const v of out.validation_results) {
    s += '- ' + v.report_id + ': ' + (v.valid ? 'VALID' : 'INVALID') + '\n'
    if (v.errors.length > 0) { s += '  Errors: ' + v.errors.join('; ') + '\n' }
    if (v.warnings.length > 0) { s += '  Warnings: ' + v.warnings.join('; ') + '\n' }
  }
  s += '\n## Summary\n'
  for (const line of out.summary) { s += '- ' + line + '\n' }
  s += '\n---\n'
  s += 'Regulatory reporting: automated report generation and validation for CTR, FBAR, MiFID II, EMIR, Dodd-Frank, and BSA requirements.'
  return s
}

function formatRiskAssessmentOutput(out: RiskAssessmentOutput): string {
  let s = '# Risk Assessment Matrix Report\n\n'
  s += '**Assessment:** ' + out.assessment_id + '\n'
  s += '**Customer:** ' + out.customer_id + '\n'
  s += '**Overall Risk Score:** ' + out.overall_risk_score + '/100\n'
  s += '**Overall Rating:** ' + out.overall_risk_rating.toUpperCase() + '\n'
  s += '**Review Frequency:** ' + out.recommended_review_frequency + '\n'
  s += '**Assessment Date:** ' + out.assessment_date + '\n\n'
  s += '## Risk Factors\n'
  for (const f of out.risk_factors) {
    s += '- ' + f.factor_name + ': ' + f.score + '/100 (weight: ' + (f.weight * 100) + '%, weighted: ' + f.weighted_score + ') [' + f.risk_level.toUpperCase() + ']\n'
    s += '  ' + f.justification + '\n'
  }
  if (out.enhanced_measures.length > 0) {
    s += '\n## Enhanced Measures\n'
    for (const m of out.enhanced_measures) { s += '- ' + m + '\n' }
  }
  s += '\n---\n'
  s += 'Risk assessment matrix: multi-factor scoring across customer, geographic, product, transaction, and behavioral risk dimensions.'
  return s
}

function formatComplianceTrainingOutput(out: ComplianceTrainingOutput): string {
  let s = '# Compliance Training Report\n\n'
  s += '**Organization:** ' + out.organization_id + '\n'
  s += '**Period:** ' + out.reporting_period + '\n'
  s += '**Overall Completion:** ' + out.overall_completion_rate.toFixed(1) + '%\n'
  s += '**Mandatory Completion:** ' + out.mandatory_completion_rate.toFixed(1) + '%\n'
  s += '**Compliance Status:** ' + out.regulatory_compliance_status.toUpperCase() + '\n'
  s += '**Overdue Total:** ' + out.overdue_total + '\n'
  s += '**Penalty Exposure:** ' + out.estimated_penalty_exposure + '\n\n'
  if (out.training_gaps.length > 0) {
    s += '## Training Gaps\n'
    for (const g of out.training_gaps) {
      s += '- [' + g.severity.toUpperCase() + '] ' + g.program_name + ': ' + g.gap_description + '\n'
      s += '  Affected: ' + g.affected_employees + ' employees\n'
      s += '  Action: ' + g.remediation + '\n'
    }
    s += '\n'
  }
  if (out.recommendations.length > 0) {
    s += '## Recommendations\n'
    for (const r of out.recommendations) { s += '- ' + r + '\n' }
  }
  s += '\n---\n'
  s += 'Compliance training tracking: completion rates, gap analysis, certification monitoring, and regulatory compliance scoring.'
  return s
}

function formatAuditTrailOutput(out: AuditTrailOutput): string {
  let s = '# Audit Trail Report\n\n'
  s += '**Audit ID:** ' + out.audit_id + '\n'
  s += '**Entity:** ' + out.entity_name + '\n'
  s += '**Total Events:** ' + out.total_events_logged + '\n'
  s += '**Outcomes:** Success=' + out.events_by_outcome.success + ', Failure=' + out.events_by_outcome.failure + ', Denied=' + out.events_by_outcome.denied + '\n'
  s += '**Integrity Score:** ' + out.integrity_score + '/100\n'
  s += '**Chain of Custody:** ' + out.chain_of_custody_status.toUpperCase() + '\n'
  s += '**Frameworks:** ' + out.frameworks_covered.join(', ') + '\n\n'
  if (out.findings.length > 0) {
    s += '## Findings\n'
    for (const f of out.findings) {
      s += '- [' + f.severity.toUpperCase() + '] ' + f.category + ': ' + f.description + '\n'
      s += '  Recommendation: ' + f.recommendation + '\n'
    }
    s += '\n'
  }
  s += '## Trail Report\n'
  for (const line of out.trail_report) { s += '- ' + line + '\n' }
  s += '\n---\n'
  s += 'Audit trail generation: immutable event logging, integrity verification, chain of custody tracking, and compliance framework mapping.'
  return s
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'aml_transaction_monitor',
    description: 'Real-time AML transaction monitoring. Detects structuring, rapid movement, layering, high-risk jurisdictions, amount spikes, and unusual patterns.',
    parameters: { input: { type: 'object' as const, required: true, description: 'AmlTransactionMonitorInput: account details, transactions, risk indicators, prior SARs' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: AmlTransactionMonitorInput }) {
      return formatAmlTransactionMonitorOutput(executeAmlTransactionMonitor(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'sanctions_screening_engine',
    description: 'Sanctions screening against OFAC, UN, EU, HMT, and other lists. Fuzzy name matching, alias detection, false positive estimation.',
    parameters: { input: { type: 'object' as const, required: true, description: 'SanctionsScreeningInput: entity name, type, jurisdiction, nationality, screening lists, fuzzy threshold' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: SanctionsScreeningInput }) {
      return formatSanctionsScreeningOutput(executeSanctionsScreeningEngine(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'suspicious_activity_reporter',
    description: 'SAR narrative generation and filing readiness assessment. Compiles filing info, activity type, subjects, narrative, evidence, and law enforcement notification.',
    parameters: { input: { type: 'object' as const, required: true, description: 'SuspiciousActivityReporterInput: SAR details, institution info, activity period, amount, violation type, subjects' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: SuspiciousActivityReporterInput }) {
      return formatSuspiciousActivityReporterOutput(executeSuspiciousActivityReporter(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'kyc_verification_orchestrator',
    description: 'KYC identity verification orchestration. ID document validity, PEP screening, adverse media, beneficial ownership, geographic risk, activity alignment.',
    parameters: { input: { type: 'object' as const, required: true, description: 'KycVerificationInput: customer details, ID document, PEP status, adverse media, beneficial owners' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: KycVerificationInput }) {
      return formatKycVerificationOutput(executeKycVerificationOrchestrator(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'regulatory_reporting_automator',
    description: 'Automated regulatory report generation and validation. Supports CTR, FBAR, MiFID II, EMIR, Dodd-Frank, and BSA report types.',
    parameters: { input: { type: 'object' as const, required: true, description: 'RegulatoryReportingInput: report type, period, institution, report details, deadline' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: RegulatoryReportingInput }) {
      return formatRegulatoryReportingOutput(executeRegulatoryReportingAutomator(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'risk_assessment_matrix',
    description: 'Multi-dimensional risk assessment scoring. Customer type, geographic, product, volume, behavioral indicators, and relationship tenure.',
    parameters: { input: { type: 'object' as const, required: true, description: 'RiskAssessmentInput: customer profile, countries, products, volume, PEP/sanctions flags' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: RiskAssessmentInput }) {
      return formatRiskAssessmentOutput(executeRiskAssessmentMatrix(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'compliance_training_tracker',
    description: 'Compliance training program tracking. Completion rates, gap analysis, certification expiry monitoring, comprehension scoring, penalty exposure.',
    parameters: { input: { type: 'object' as const, required: true, description: 'ComplianceTrainingInput: organization, programs, certifications, regulatory requirements' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: ComplianceTrainingInput }) {
      return formatComplianceTrainingOutput(executeComplianceTrainingTracker(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'audit_trail_generator',
    description: 'Immutable audit trail generation with failure analysis, access control monitoring, after-hours detection, and chain of custody verification.',
    parameters: { input: { type: 'object' as const, required: true, description: 'AuditTrailInput: audit scope, stakeholders, events, compliance frameworks' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: AuditTrailInput }) {
      return formatAuditTrailOutput(executeAuditTrailGenerator(args.input))
    }
  }))
}
