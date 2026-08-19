/**
 * DSH Legal Document Intelligence Plugin v0.1.0
 *
 * Contract analysis, clause extraction, obligation tracking, and legal risk assessment toolkit for DeepSeek Harness Agent.
 * Designed for legal professionals, contract managers, and compliance officers.
 *
 * Features (v0.1.0):
 * - Contract Clause Extraction (identify and classify contract clauses)
 * - Obligation Tracking (extract and monitor contractual obligations)
 * - Legal Risk Scoring (assess overall contract risk profile)
 * - NDA Analyzer (non-disclosure agreement deep analysis)
 * - Employment Contract Reviewer (employment agreement assessment)
 * - SLA Evaluator (service level agreement analysis)
 * - Lease Agreement Analyzer (commercial/residential lease review)
 * - Merger Clause Detector (entire agreement clause identification)
 *
 * @module dsh-tool-legalmind
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-legalmind'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ExtractedClause {
  type: string
  text: string
  location: { start: number; end: number }
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  notes: string
}

interface Obligation {
  description: string
  deadline: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'unknown'
  responsible_party: string
  consequences: string
  source_clause: string
}

interface RiskAssessment {
  overall_score: number
  high_risk_clauses: Array<{ clause: string; risk: string; severity: string }>
  missing_standard_provisions: string[]
  recommendations: string[]
}

interface NDAAnalysis {
  scope: string
  duration: string
  exclusions: string[]
  non_compete_clause: { present: boolean; details: string; enforceability: string }
  remedies: string[]
  risk_level: string
  key_concerns: string[]
}

interface EmploymentReview {
  compensation: { base_salary: string; bonus: string; equity: string; benefits: string[] }
  termination: { notice_period: string; severance: string; for_cause_definition: string; at_will: boolean }
  ip_assignment: { present: boolean; scope: string; concerns: string[] }
  non_compete: { present: boolean; duration: string; geographic_scope: string; enforceability: string }
  benefits: string[]
  overall_assessment: string
  red_flags: string[]
}

interface SLAEvaluation {
  uptime_guarantee: { percentage: string; measurement_period: string; exclusions: string[] }
  penalty_clauses: Array<{ trigger: string; penalty: string; cap: string }>
  exclusion_scope: string[]
  measurement_method: string
  escalation_procedure: string[]
  risk_level: string
  recommendations: string[]
}

interface LeaseAnalysis {
  rent_terms: { base_rent: string; currency: string; payment_frequency: string; deposit: string }
  escalation_clauses: Array<{ type: string; rate: string; frequency: string }>
  maintenance: { landlord_responsibilities: string[]; tenant_responsibilities: string[] }
  termination: { notice_period: string; early_termination_penalty: string; conditions: string[] }
  renewal_options: Array<{ type: string; terms: string; notice_required: string }>
  risk_level: string
  key_concerns: string[]
}

interface MergerClauseResult {
  merger_clause_present: boolean
  clause_text: string
  entire_agreement_scope: string
  amendment_requirements: string
  survival_clauses: Array<{ clause: string; survives: boolean; duration: string }>
  prior_agreements_superseded: string[]
  risk_level: string
  recommendations: string[]
}

// ==================== TOOL 1: CONTRACT CLAUSE EXTRACTOR ====================

function extractClauses(
  contractText: string,
  clauseTypes?: string[]
): ExtractedClause[] {
  const results: ExtractedClause[] = []
  const text = contractText

  const defaultTypes = [
    'indemnification', 'limitation_of_liability', 'termination',
    'confidentiality', 'force_majeure', 'governing_law',
    'dispute_resolution', 'warranty', 'intellectual_property',
    'payment_terms', 'non_compete', 'assignment'
  ]

  const typesToSearch = clauseTypes && clauseTypes.length > 0 ? clauseTypes : defaultTypes

  const patterns: Record<string, { regex: RegExp; riskMap: Record<string, ExtractedClause['risk_level']> }> = {
    indemnification: {
      regex: /indemnif(y|ication|ies|ied)|hold\s+harmless|defend.*against\s+claims/gi,
      riskMap: { high: 'critical', medium: 'high', default: 'medium' }
    },
    limitation_of_liability: {
      regex: /limitation\s+of\s+liability|liability\s+cap|aggregate\s+liability|consequential\s+damages/gi,
      riskMap: { high: 'high', default: 'medium' }
    },
    termination: {
      regex: /terminat(e|ion|able)|cancel(lation)?|expiration|cease.*(agreement|contract)/gi,
      riskMap: { default: 'medium' }
    },
    confidentiality: {
      regex: /confidential(ity|information)|non-disclosure|proprietary\s+information|trade\s+secret/gi,
      riskMap: { default: 'medium' }
    },
    force_majeure: {
      regex: /force\s+majeure|act\s+of\s+god|beyond\s+reasonable\s+control|unforeseeable\s+circumstances/gi,
      riskMap: { default: 'low' }
    },
    governing_law: {
      regex: /governing\s+law|jurisdiction|applicable\s+law|venue|forum\s+selection/gi,
      riskMap: { default: 'low' }
    },
    dispute_resolution: {
      regex: /dispute\s+resolution|arbitration|mediation|litigation|class\s+action\s+waiver/gi,
      riskMap: { default: 'medium' }
    },
    warranty: {
      regex: /warrant(y|ies)|represent(ation|s)|as-is|disclaimer|merchantab/gi,
      riskMap: { default: 'medium' }
    },
    intellectual_property: {
      regex: /intellectual\s+property|patent|trademark|copyright|ip\s+rights|work\s+product/gi,
      riskMap: { high: 'high', default: 'medium' }
    },
    payment_terms: {
      regex: /payment\s+terms|invoice|net\s+\d+|late\s+fee|interest\s+on\s+overdue/gi,
      riskMap: { default: 'low' }
    },
    non_compete: {
      regex: /non-compete|non\s+compete|restrictive\s+covenant|non-solicitation|non-solicit/gi,
      riskMap: { high: 'high', default: 'medium' }
    },
    assignment: {
      regex: /assign(ment|able)|transfer.*(rights|obligations)|successors|delegat(e|ion)/gi,
      riskMap: { default: 'low' }
    }
  }

  for (const clauseType of typesToSearch) {
    const pattern = patterns[clauseType.toLowerCase()]
    if (!pattern) continue

    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
    while ((match = regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - 50)
      const end = Math.min(text.length, match.index + match[0].length + 100)
      const contextText = text.slice(start, end).trim()

      let riskLevel: ExtractedClause['risk_level'] = pattern.riskMap.default
      if (pattern.riskMap.high && /unlimited|sole|absolute|irrevocable|perpetual/i.test(contextText)) {
        riskLevel = pattern.riskMap.high
      }

      const notes = generateClauseNotes(clauseType, contextText)

      results.push({
        type: clauseType,
        text: contextText,
        location: { start: match.index, end: match.index + match[0].length },
        risk_level: riskLevel,
        notes
      })
    }
  }

  return results
}

function generateClauseNotes(clauseType: string, context: string): string {
  const notes: string[] = []
  if (/unlimited|no\s+limit|without\s+cap/i.test(context)) {
    notes.push('Unlimited exposure detected')
  }
  if (/sole\s+discretion|at\s+its\s+discretion/i.test(context)) {
    notes.push('Discretionary language present')
  }
  if (/irrevocable|perpetual|indefinite/i.test(context)) {
    notes.push('Perpetual/irrevocable term detected')
  }
  if (/automatic(ally)?\s+renew/i.test(context)) {
    notes.push('Auto-renewal provision found')
  }
  if (notes.length === 0) {
    notes.push('Standard clause language')
  }
  return notes.join('; ')
}

function formatClauseExtraction(clauses: ExtractedClause[]): string {
  const lines: string[] = []
  lines.push('## Contract Clause Extraction Report')
  lines.push('')
  lines.push(`**Total Clauses Found:** ${clauses.length}`)
  lines.push('')

  const grouped = new Map<string, ExtractedClause[]>()
  for (const c of clauses) {
    if (!grouped.has(c.type)) grouped.set(c.type, [])
    grouped.get(c.type)!.push(c)
  }

  const critical = clauses.filter(c => c.risk_level === 'critical')
  const high = clauses.filter(c => c.risk_level === 'high')

  if (critical.length > 0 || high.length > 0) {
    lines.push('### Risk Summary')
    if (critical.length > 0) lines.push(`- **CRITICAL:** ${critical.length} clause(s) require immediate attention`)
    if (high.length > 0) lines.push(`- **HIGH:** ${high.length} clause(s) need review`)
    lines.push('')
  }

  for (const [type, items] of grouped) {
    lines.push(`### ${type.replace(/_/g, ' ').toUpperCase()} (${items.length} found)`)
    for (const item of items) {
      lines.push(`**[${item.risk_level.toUpperCase()}]** Location chars ${item.location.start}-${item.location.end}`)
      lines.push(`> "${item.text.substring(0, 150)}${item.text.length > 150 ? '...' : ''}"`)
      lines.push(`*Notes: ${item.notes}*`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: OBLIGATION TRACKER ====================

function trackObligations(
  contractText: string,
  partyName?: string
): Obligation[] {
  const obligations: Obligation[] = []
  const text = contractText

  const obligationPatterns = [
    { regex: /shall\s+([^.;]+)/gi, type: 'mandatory' },
    { regex: /must\s+([^.;]+)/gi, type: 'mandatory' },
    { regex: /is\s+required\s+to\s+([^.;]+)/gi, type: 'mandatory' },
    { regex: /agrees?\s+to\s+([^.;]+)/gi, type: 'commitment' },
    { regex: /obligated\s+to\s+([^.;]+)/gi, type: 'mandatory' },
    { regex: /responsible\s+for\s+([^.;]+)/gi, type: 'responsibility' },
    { regex: /warrant(s|ing)\s+(that\s+)?([^.;]+)/gi, type: 'warranty' },
    { regex: /covenants?\s+(that\s+)?([^.;]+)/gi, type: 'covenant' }
  ]

  const deadlinePatterns = [
    /within\s+(\d+\s+(days?|weeks?|months?|years?))/gi,
    /no\s+later\s+than\s+([^.;,]+)/gi,
    /on\s+or\s+before\s+([^.;,]+)/gi,
    /by\s+([^.;,]+\d{4})/gi,
    /effective\s+date/gi,
    /upon\s+([^.;,]+)/gi
  ]

  const consequencePatterns = [
    /failure\s+to\s+[^.]*(?:result\s+in|shall\s+constitute|entitles?\s+)/gi,
    /breach\s+of\s+[^.]*(?:entitles?|shall\s+result)/gi,
    /in\s+the\s+event\s+of\s+default[^.]*/gi,
    /remed(y|ies)\s+(include|for)[^.]*/gi
  ]

  for (const pattern of obligationPatterns) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
    while ((match = regex.exec(text)) !== null) {
      const description = (match[1] || match[3] || match[2] || '').trim()
      if (description.length < 10) continue

      const contextStart = Math.max(0, match.index - 200)
      const contextEnd = Math.min(text.length, match.index + match[0].length + 200)
      const context = text.slice(contextStart, contextEnd)

      let deadline = 'Not specified'
      for (const dp of deadlinePatterns) {
        const dm = new RegExp(dp.source, dp.flags).exec(context)
        if (dm) {
          deadline = dm[0].trim()
          break
        }
      }

      let responsibleParty = 'Both parties'
      if (partyName) {
        if (new RegExp(partyName, 'i').test(context)) {
          responsibleParty = partyName
        }
      } else {
        const partyMatch = context.match(/(?:party|parties|vendor|client|contractor|employer|employee|licensor|licensee|buyer|seller|lessor|lessee)/i)
        if (partyMatch) {
          responsibleParty = partyMatch[0]
        }
      }

      let consequences = 'Not specified'
      for (const cp of consequencePatterns) {
        const cm = new RegExp(cp.source, cp.flags).exec(context)
        if (cm) {
          consequences = cm[0].trim().substring(0, 150)
          break
        }
      }

      const status: Obligation['status'] = determineStatus(context, deadline)

      obligations.push({
        description: description.substring(0, 200),
        deadline,
        status,
        responsible_party: responsibleParty,
        consequences,
        source_clause: match[0].trim()
      })
    }
  }

  return obligations
}

function determineStatus(context: string, deadline: string): Obligation['status'] {
  if (/completed|fulfilled|satisfied|performed|delivered/i.test(context)) return 'completed'
  if (/in\s+progress|ongoing|currently|actively/i.test(context)) return 'in_progress'
  if (/overdue|past\s+due|expired|lapsed|failed\s+to/i.test(context)) return 'overdue'
  if (deadline !== 'Not specified') return 'pending'
  return 'unknown'
}

function formatObligationReport(obligations: Obligation[], partyName?: string): string {
  const lines: string[] = []
  lines.push('## Obligation Tracking Report')
  lines.push('')
  if (partyName) lines.push(`**Filtered for Party:** ${partyName}`)
  lines.push(`**Total Obligations Found:** ${obligations.length}`)
  lines.push('')

  const statusCounts = {
    pending: obligations.filter(o => o.status === 'pending').length,
    in_progress: obligations.filter(o => o.status === 'in_progress').length,
    completed: obligations.filter(o => o.status === 'completed').length,
    overdue: obligations.filter(o => o.status === 'overdue').length,
    unknown: obligations.filter(o => o.status === 'unknown').length
  }

  lines.push('### Status Overview')
  lines.push(`- Pending: ${statusCounts.pending} | In Progress: ${statusCounts.in_progress} | Completed: ${statusCounts.completed} | Overdue: ${statusCounts.overdue} | Unknown: ${statusCounts.unknown}`)
  lines.push('')

  const overdue = obligations.filter(o => o.status === 'overdue')
  if (overdue.length > 0) {
    lines.push('### OVERDUE OBLIGATIONS (Action Required)')
    for (const o of overdue) {
      lines.push(`- **${o.description.substring(0, 100)}** | Party: ${o.responsible_party} | Deadline: ${o.deadline}`)
    }
    lines.push('')
  }

  lines.push('### All Obligations')
  lines.push('| # | Description | Deadline | Status | Responsible Party |')
  lines.push('|---|-------------|----------|--------|-------------------|')
  for (let i = 0; i < obligations.length; i++) {
    const o = obligations[i]
    lines.push(`| ${i + 1} | ${o.description.substring(0, 60)}... | ${o.deadline} | ${o.status.toUpperCase()} | ${o.responsible_party} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: LEGAL RISK SCORER ====================

function scoreLegalRisk(
  contractText: string,
  jurisdiction?: string
): RiskAssessment {
  const text = contractText
  const highRiskClauses: RiskAssessment['high_risk_clauses'] = []
  const missingProvisions: string[] = []
  const recommendations: string[] = []
  let riskScore = 0

  // Check for high-risk indicators
  const riskIndicators = [
    { pattern: /unlimited\s+liability/i, risk: 'Unlimited liability exposure', severity: 'critical', score: 25 },
    { pattern: /irrevocable/i, risk: 'Irrevocable commitment', severity: 'high', score: 15 },
    { pattern: /perpetual|indefinite\s+duration/i, risk: 'Perpetual/indefinite term', severity: 'high', score: 15 },
    { pattern: /sole\s+discretion/i, risk: 'Unilateral discretion granted', severity: 'high', score: 12 },
    { pattern: /automatic(ally)?\s+renew/i, risk: 'Auto-renewal without notice', severity: 'medium', score: 8 },
    { pattern: /waiver\s+of\s+(class\s+action|jury\s+trial)/i, risk: 'Rights waiver (class action/jury)', severity: 'high', score: 14 },
    { pattern: /consequential\s+damages.*exclud/i, risk: 'Consequential damages exclusion', severity: 'medium', score: 10 },
    { pattern: /non-compete.*\d+\s*(years?|months?)/i, risk: 'Restrictive non-compete clause', severity: 'high', score: 12 },
    { pattern: /assignment.*(without|prior)\s+consent/i, risk: 'Assignment restriction', severity: 'medium', score: 8 },
    { pattern: /indemnif.*(all|any\s+and\s+all)/i, risk: 'Broad indemnification obligation', severity: 'high', score: 15 },
    { pattern: /liquidated\s+damages/i, risk: 'Liquidated damages provision', severity: 'medium', score: 10 },
    { pattern: /exclusive\s+(remedy|jurisdiction)/i, risk: 'Exclusive remedy/jurisdiction', severity: 'medium', score: 8 }
  ]

  for (const indicator of riskIndicators) {
    if (indicator.pattern.test(text)) {
      highRiskClauses.push({ clause: indicator.pattern.source, risk: indicator.risk, severity: indicator.severity })
      riskScore += indicator.score
    }
  }

  // Check for missing standard provisions
  const standardProvisions = [
    { pattern: /force\s+majeure/i, name: 'Force Majeure clause' },
    { pattern: /confidential(ity|information)/i, name: 'Confidentiality provision' },
    { pattern: /governing\s+law|jurisdiction/i, name: 'Governing law clause' },
    { pattern: /dispute\s+resolution|arbitration|mediation/i, name: 'Dispute resolution mechanism' },
    { pattern: /terminat(e|ion)/i, name: 'Termination clause' },
    { pattern: /limitation\s+of\s+liability/i, name: 'Limitation of liability' },
    { pattern: /entire\s+agreement|merger\s+clause/i, name: 'Entire agreement clause' },
    { pattern: /amendment/i, name: 'Amendment provision' },
    { pattern: /notices?/i, name: 'Notice provision' },
    { pattern: /assignment/i, name: 'Assignment clause' },
    { pattern: /waiver/i, name: 'Waiver clause' },
    { pattern: /severability/i, name: 'Severability clause' }
  ]

  for (const provision of standardProvisions) {
    if (!provision.pattern.test(text)) {
      missingProvisions.push(provision.name)
    }
  }

  if (missingProvisions.length > 0) {
    riskScore += missingProvisions.length * 3
  }

  // Generate recommendations
  if (highRiskClauses.some(c => c.severity === 'critical')) {
    recommendations.push('URGENT: Critical risk clauses detected — seek legal counsel before signing')
  }
  if (highRiskClauses.some(c => c.risk.includes('Unlimited liability'))) {
    recommendations.push('Negotiate a liability cap (e.g., 12 months fees or fixed amount)')
  }
  if (highRiskClauses.some(c => c.risk.includes('non-compete'))) {
    recommendations.push('Review non-compete for reasonableness of duration and geographic scope')
  }
  if (missingProvisions.includes('Force Majeure clause')) {
    recommendations.push('Add Force Majeure clause to address unforeseeable events')
  }
  if (missingProvisions.includes('Limitation of liability')) {
    recommendations.push('Include limitation of liability to cap exposure')
  }
  if (missingProvisions.includes('Dispute resolution mechanism')) {
    recommendations.push('Add dispute resolution clause (arbitration or mediation preferred)')
  }
  if (jurisdiction) {
    recommendations.push(`Verify compliance with ${jurisdiction} statutory requirements`)
  }
  if (riskScore > 50) {
    recommendations.push('Overall risk is HIGH — comprehensive legal review strongly recommended')
  } else if (riskScore > 25) {
    recommendations.push('Moderate risk — targeted review of flagged clauses recommended')
  } else {
    recommendations.push('Risk level acceptable — standard review sufficient')
  }

  return {
    overall_score: Math.min(riskScore, 100),
    high_risk_clauses: highRiskClauses,
    missing_standard_provisions: missingProvisions,
    recommendations
  }
}

function formatRiskReport(assessment: RiskAssessment, jurisdiction?: string): string {
  const lines: string[] = []
  lines.push('## Legal Risk Assessment Report')
  lines.push('')
  if (jurisdiction) lines.push(`**Jurisdiction:** ${jurisdiction}`)
  lines.push(`**Overall Risk Score:** ${assessment.overall_score}/100`)
  const riskLabel = assessment.overall_score > 50 ? 'HIGH' : assessment.overall_score > 25 ? 'MODERATE' : 'LOW'
  lines.push(`**Risk Level:** ${riskLabel}`)
  lines.push('')

  if (assessment.high_risk_clauses.length > 0) {
    lines.push('### High Risk Clauses')
    for (const clause of assessment.high_risk_clauses) {
      lines.push(`- **[${clause.severity.toUpperCase()}]** ${clause.risk}`)
    }
    lines.push('')
  }

  if (assessment.missing_standard_provisions.length > 0) {
    lines.push('### Missing Standard Provisions')
    for (const provision of assessment.missing_standard_provisions) {
      lines.push(`- ${provision}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const rec of assessment.recommendations) {
    lines.push(`- ${rec}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: NDA ANALYZER ====================

function analyzeNDA(ndaText: string): NDAAnalysis {
  const text = ndaText

  // Scope analysis
  let scope = 'Standard'
  if (/all\s+information|any\s+and\s+all|without\s+limitation/i.test(text)) {
    scope = 'Very broad — covers all information shared'
  } else if (/only\s+marked|identified\s+as\s+confidential|labeled/i.test(text)) {
    scope = 'Narrow — only covers marked/identified information'
  } else if (/oral|written|electronic|visual/i.test(text)) {
    scope = 'Moderate — covers specified forms of information'
  }

  // Duration
  let duration = 'Not specified'
  const durationMatch = text.match(/(\d+)\s*(years?|months?)\s*(from|after|following)/i)
  if (durationMatch) {
    duration = `${durationMatch[1]} ${durationMatch[2]} ${durationMatch[3]} disclosure`
  } else if (/perpetual|indefinite|survive.*terminat/i.test(text)) {
    duration = 'Perpetual (survives termination)'
  } else if (/term\s+of\s+(this\s+)?agreement/i.test(text)) {
    duration = 'Duration of the agreement only'
  }

  // Exclusions
  const exclusions: string[] = []
  if (/publicly\s+(available|known)|public\s+domain/i.test(text)) exclusions.push('Publicly available information')
  if (/already\s+(known|in\s+possession|disclosed)/i.test(text)) exclusions.push('Already known to recipient')
  if (/independently\s+developed/i.test(text)) exclusions.push('Independently developed information')
  if (/third\s+party.*(lawfully|legally|without\s+restriction)/i.test(text)) exclusions.push('Lawfully received from third party')
  if (/required\s+by\s+law|court\s+order|governmental/i.test(text)) exclusions.push('Required by law or court order')
  if (exclusions.length === 0) exclusions.push('No explicit exclusions found')

  // Non-compete clause
  let nonCompetePresent = false
  let nonCompeteDetails = 'None'
  let nonCompeteEnforceability = 'N/A'
  if (/non-compete|non\s+compete|refrain\s+from.*compet/i.test(text)) {
    nonCompetePresent = true
    const ncMatch = text.match(/non-compete[^.]*\./i) || text.match(/refrain\s+from[^.]*\./i)
    nonCompeteDetails = ncMatch ? ncMatch[0].trim() : 'Non-compete clause present but details unclear'
    nonCompeteEnforceability = /reasonable|limited\s+scope|geographic\s+restriction/i.test(text)
      ? 'Potentially enforceable (reasonable scope)'
      : 'May be unenforceable (overly broad)'
  }

  // Remedies
  const remedies: string[] = []
  if (/injunction|injunctive\s+relief/i.test(text)) remedies.push('Injunctive relief available')
  if (/damages|monetary\s+damages|compensatory/i.test(text)) remedies.push('Monetary damages')
  if (/specific\s+performance/i.test(text)) remedies.push('Specific performance')
  if (/liquidated\s+damages/i.test(text)) remedies.push('Liquidated damages')
  if (/attorney'?s?\s+fees/i.test(text)) remedies.push("Attorney's fees")
  if (remedies.length === 0) remedies.push('No specific remedies enumerated')

  // Key concerns
  const keyConcerns: string[] = []
  if (/one-way|unilateral|only\s+one\s+party/i.test(text)) keyConcerns.push('One-way NDA (asymmetric obligations)')
  if (/no\s+time\s+limit|perpetual|indefinite/i.test(text)) keyConcerns.push('No time limit on confidentiality')
  if (/all\s+information|any\s+information/i.test(text)) keyConcerns.push('Overly broad definition of confidential information')
  if (!/return|destroy|delete.*confidential/i.test(text)) keyConcerns.push('No provision for return/destruction of materials')
  if (!/survive|survival/i.test(text)) keyConcerns.push('No survival clause (obligations may end with agreement)')

  // Risk level
  let riskLevel = 'low'
  if (keyConcerns.length >= 3) riskLevel = 'high'
  else if (keyConcerns.length >= 1) riskLevel = 'medium'

  return { scope, duration, exclusions, non_compete_clause: { present: nonCompetePresent, details: nonCompeteDetails, enforceability: nonCompeteEnforceability }, remedies, risk_level: riskLevel, key_concerns: keyConcerns }
}

function formatNDAReport(analysis: NDAAnalysis): string {
  const lines: string[] = []
  lines.push('## NDA Analysis Report')
  lines.push('')
  lines.push(`**Risk Level:** ${analysis.risk_level.toUpperCase()}`)
  lines.push('')
  lines.push(`**Scope:** ${analysis.scope}`)
  lines.push(`**Duration:** ${analysis.duration}`)
  lines.push('')

  lines.push('### Exclusions from Confidential Information')
  for (const ex of analysis.exclusions) {
    lines.push(`- ${ex}`)
  }
  lines.push('')

  lines.push('### Non-Compete Clause')
  lines.push(`- **Present:** ${analysis.non_compete_clause.present ? 'Yes' : 'No'}`)
  if (analysis.non_compete_clause.present) {
    lines.push(`- **Details:** ${analysis.non_compete_clause.details}`)
    lines.push(`- **Enforceability:** ${analysis.non_compete_clause.enforceability}`)
  }
  lines.push('')

  lines.push('### Available Remedies')
  for (const r of analysis.remedies) {
    lines.push(`- ${r}`)
  }
  lines.push('')

  if (analysis.key_concerns.length > 0) {
    lines.push('### Key Concerns')
    for (const c of analysis.key_concerns) {
      lines.push(`- ${c}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: EMPLOYMENT CONTRACT REVIEWER ====================

function reviewEmploymentContract(
  contractText: string,
  employeeRole?: string
): EmploymentReview {
  const text = contractText

  // Compensation
  const baseSalaryMatch = text.match(/(?:salary|compensation|base\s+pay)[^.]*\$?([\d,]+(?:\.\d{2})?)/i)
  const bonusMatch = text.match(/(?:bonus|incentive)[^.]*(\d+%|\$?[\d,]+)/i)
  const equityMatch = text.match(/(?:equity|stock|option|rsu|restricted\s+stock)[^.]*/i)

  const compensation = {
    base_salary: baseSalaryMatch ? `$${baseSalaryMatch[1]}` : 'Not specified',
    bonus: bonusMatch ? bonusMatch[0].trim() : 'Not specified',
    equity: equityMatch ? equityMatch[0].trim() : 'Not specified',
    benefits: extractBenefits(text)
  }

  // Termination
  const noticeMatch = text.match(/(?:notice\s+period|notice\s+of)[^.]*\d+\s*(days?|weeks?|months?)/i)
  const severanceMatch = text.match(/severance[^.]*\d+[^.]*/i)
  const forCauseMatch = text.match(/for\s+cause[^.]*/i)
  const atWill = /at-will|at\s+will|terminat(e|ion).*any\s+time.*without\s+cause/i.test(text)

  const termination = {
    notice_period: noticeMatch ? noticeMatch[0].trim() : 'Not specified',
    severance: severanceMatch ? severanceMatch[0].trim() : 'Not specified',
    for_cause_definition: forCauseMatch ? forCauseMatch[0].trim() : 'Not specified',
    at_will: atWill
  }

  // IP Assignment
  let ipPresent = false
  let ipScope = 'Not specified'
  const ipConcerns: string[] = []
  if (/intellectual\s+property|ip\s+assignment|work\s+product|invention\s+assignment/i.test(text)) {
    ipPresent = true
    if (/all\s+inventions|any\s+and\s+all|worldwide/i.test(text)) {
      ipScope = 'Very broad — all inventions worldwide'
      ipConcerns.push('Overly broad IP assignment scope')
    } else if (/during\s+employment|within\s+scope\s+of\s+employment/i.test(text)) {
      ipScope = 'Limited to employment scope'
    } else {
      ipScope = 'Present — scope unclear'
    }
    if (/prior\s+invention|excluded\s+invention/i.test(text)) {
      ipConcerns.push('Prior invention exclusion present (favorable)')
    } else {
      ipConcerns.push('No prior invention exclusion clause')
    }
  }

  const ip_assignment = { present: ipPresent, scope: ipScope, concerns: ipConcerns }

  // Non-compete
  let ncPresent = false
  let ncDuration = 'N/A'
  let ncGeoScope = 'N/A'
  let ncEnforceability = 'N/A'
  if (/non-compete|non\s+compete|restrictive\s+covenant/i.test(text)) {
    ncPresent = true
    const durMatch = text.match(/non-compete[^.]*(\d+)\s*(years?|months?)/i)
    ncDuration = durMatch ? `${durMatch[1]} ${durMatch[2]}` : 'Duration not specified'
    const geoMatch = text.match(/(?:within|radius\s+of)\s+([^.]*(?:miles?|km|kilometers?|states?|countries?))/i)
    ncGeoScope = geoMatch ? geoMatch[0].trim() : 'Geographic scope not specified'
    ncEnforceability = /reasonable|limited|narrow/i.test(text)
      ? 'Potentially enforceable'
      : 'May be unenforceable (overly broad)'
  }

  const non_compete = { present: ncPresent, duration: ncDuration, geographic_scope: ncGeoScope, enforceability: ncEnforceability }

  // Red flags
  const redFlags: string[] = []
  if (atWill) redFlags.push('At-will employment (can be terminated without cause)')
  if (ipConcerns.includes('Overly broad IP assignment scope')) redFlags.push('Broad IP assignment may cover personal projects')
  if (ncPresent && /(2|two|24)\s*years?/i.test(ncDuration)) redFlags.push('Non-compete duration exceeds 2 years')
  if (!/garden\s+leave|paid\s+during\s+non-compete/i.test(text) && ncPresent) redFlags.push('No compensation during non-compete period')
  if (/probation(?:ary)?\s*period/i.test(text)) redFlags.push('Probationary period clause present')
  if (employeeRole && !new RegExp(employeeRole, 'i').test(text)) redFlags.push(`Role "${employeeRole}" not explicitly mentioned in contract`)

  // Overall assessment
  let overallAssessment = 'Standard employment contract'
  if (redFlags.length >= 3) overallAssessment = 'HIGH RISK — Multiple red flags detected, legal review strongly recommended'
  else if (redFlags.length >= 1) overallAssessment = 'MODERATE RISK — Some concerns identified, review recommended'
  else overallAssessment = 'LOW RISK — Standard terms, no major concerns'

  return {
    compensation,
    termination,
    ip_assignment,
    non_compete,
    benefits: compensation.benefits,
    overall_assessment: overallAssessment,
    red_flags: redFlags
  }
}

function extractBenefits(text: string): string[] {
  const benefits: string[] = []
  if (/health\s+insurance|medical|dental|vision/i.test(text)) benefits.push('Health insurance')
  if (/401k|retirement|pension/i.test(text)) benefits.push('Retirement plan')
  if (/pto|paid\s+time\s+off|vacation|annual\s+leave/i.test(text)) benefits.push('Paid time off')
  if (/life\s+insurance/i.test(text)) benefits.push('Life insurance')
  if (/disability|short-term\s+disability|long-term\s+disability/i.test(text)) benefits.push('Disability insurance')
  if (/stock\s+option|equity|rsu/i.test(text)) benefits.push('Equity compensation')
  if (/remote\s+work|work\s+from\s+home|telecommut/i.test(text)) benefits.push('Remote work option')
  if (/professional\s+development|training\s+budget|education/i.test(text)) benefits.push('Professional development')
  if (benefits.length === 0) benefits.push('No specific benefits enumerated')
  return benefits
}

function formatEmploymentReport(review: EmploymentReview, employeeRole?: string): string {
  const lines: string[] = []
  lines.push('## Employment Contract Review')
  lines.push('')
  if (employeeRole) lines.push(`**Employee Role:** ${employeeRole}`)
  lines.push(`**Overall Assessment:** ${review.overall_assessment}`)
  lines.push('')

  lines.push('### Compensation')
  lines.push(`- Base Salary: ${review.compensation.base_salary}`)
  lines.push(`- Bonus: ${review.compensation.bonus}`)
  lines.push(`- Equity: ${review.compensation.equity}`)
  lines.push('')

  lines.push('### Benefits')
  for (const b of review.benefits) {
    lines.push(`- ${b}`)
  }
  lines.push('')

  lines.push('### Termination')
  lines.push(`- Notice Period: ${review.termination.notice_period}`)
  lines.push(`- Severance: ${review.termination.severance}`)
  lines.push(`- For Cause Definition: ${review.termination.for_cause_definition}`)
  lines.push(`- At-Will: ${review.termination.at_will ? 'Yes' : 'No'}`)
  lines.push('')

  lines.push('### IP Assignment')
  lines.push(`- **Present:** ${review.ip_assignment.present ? 'Yes' : 'No'}`)
  if (review.ip_assignment.present) {
    lines.push(`- **Scope:** ${review.ip_assignment.scope}`)
    for (const c of review.ip_assignment.concerns) {
      lines.push(`- *${c}*`)
    }
  }
  lines.push('')

  lines.push('### Non-Compete')
  lines.push(`- **Present:** ${review.non_compete.present ? 'Yes' : 'No'}`)
  if (review.non_compete.present) {
    lines.push(`- **Duration:** ${review.non_compete.duration}`)
    lines.push(`- **Geographic Scope:** ${review.non_compete.geographic_scope}`)
    lines.push(`- **Enforceability:** ${review.non_compete.enforceability}`)
  }
  lines.push('')

  if (review.red_flags.length > 0) {
    lines.push('### Red Flags')
    for (const rf of review.red_flags) {
      lines.push(`- ${rf}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: SLA EVALUATOR ====================

function evaluateSLA(slaText: string): SLAEvaluation {
  const text = slaText

  // Uptime guarantee
  let uptimePercentage = 'Not specified'
  let uptimePeriod = 'Not specified'
  const uptimeExclusions: string[] = []
  const uptimeMatch = text.match(/(\d+\.?\d*)%\s*(uptime|availability)/i)
  if (uptimeMatch) uptimePercentage = `${uptimeMatch[1]}%`
  const periodMatch = text.match(/(?:measured|calculated)\s*(?:over|on)[^.]*(monthly|quarterly|annually|per\s+(?:calendar\s+)?month|per\s+year)/i)
  if (periodMatch) uptimePeriod = periodMatch[1]
  if (/scheduled\s+maintenance/i.test(text)) uptimeExclusions.push('Scheduled maintenance')
  if (/force\s+majeure/i.test(text)) uptimeExclusions.push('Force majeure events')
  if (/third\s+party|vendor|provider.*(outage|failure)/i.test(text)) uptimeExclusions.push('Third-party failures')
  if (/customer.*(error|fault|equipment)/i.test(text)) uptimeExclusions.push('Customer-caused issues')
  if (/emergency\s+maintenance/i.test(text)) uptimeExclusions.push('Emergency maintenance')

  const uptime_guarantee = { percentage: uptimePercentage, measurement_period: uptimePeriod, exclusions: uptimeExclusions }

  // Penalty clauses
  const penaltyClauses: SLAEvaluation['penalty_clauses'] = []
  const penaltyMatches = text.matchAll(/(?:service\s+credit|penalty|credit\s+for)[^.]*\d+%[^.]*/gi)
  for (const m of penaltyMatches) {
    const triggerMatch = m[0].match(/(?:below|less\s+than|under)\s+(\d+\.?\d*)%/i)
    const penaltyMatch = m[0].match(/(\d+%)|(?:credit\s+of)\s+\$?([\d,]+)/i)
    const capMatch = m[0].match(/(?:cap(?:ped)?\s+at|maximum\s+of)\s+(\d+%|\$?[\d,]+)/i)
    penaltyClauses.push({
      trigger: triggerMatch ? `Below ${triggerMatch[1]}% uptime` : 'SLA breach',
      penalty: penaltyMatch ? (penaltyMatch[1] || `$${penaltyMatch[2]}`) : 'Service credit',
      cap: capMatch ? (capMatch[1] || `$${capMatch[2]}`) : 'Not specified'
    })
  }

  // Exclusion scope
  const exclusionScope: string[] = []
  if (/scheduled\s+maintenance[^.]*/i.test(text)) exclusionScope.push('Scheduled maintenance windows')
  if (/force\s+majeure[^.]*/i.test(text)) exclusionScope.push('Force majeure')
  if (/customer.*(equipment|network|error|fault)/i.test(text)) exclusionScope.push('Customer equipment/network')
  if (/third\s+party[^.]*/i.test(text)) exclusionScope.push('Third-party services')
  if (/beta|preview|experimental/i.test(text)) exclusionScope.push('Beta/preview features')
  if (exclusionScope.length === 0) exclusionScope.push('No explicit exclusions found')

  // Measurement method
  let measurementMethod = 'Not specified'
  if (/monitor(ed|ing|ing)\s+(tool|system|probe|agent)/i.test(text)) {
    measurementMethod = 'Active monitoring via probes/agents'
  } else if (/ping|icmp|http\s+check/i.test(text)) {
    measurementMethod = 'Network-level checks (ping/HTTP)'
  } else if (/api\s+endpoint|health\s+check/i.test(text)) {
    measurementMethod = 'API health check endpoints'
  } else if (/customer\s+report|ticket/i.test(text)) {
    measurementMethod = 'Customer-reported incidents'
  }

  // Escalation procedure
  const escalationProcedure: string[] = []
  if (/tier\s*[1234]|level\s*[1234]|L[1234]/i.test(text)) {
    escalationProcedure.push('Tiered support levels (L1-L4)')
  }
  if (/escalat(e|ation)[^.]*/i.test(text)) {
    const escMatch = text.match(/escalat(e|ation)[^.]*/gi)
    if (escMatch) escalationProcedure.push(escMatch[0].trim())
  }
  if (/response\s+time[^.]*\d+[^.]*/i.test(text)) {
    const respMatch = text.match(/response\s+time[^.]*\d+[^.]*/i)
    if (respMatch) escalationProcedure.push(`Response time: ${respMatch[0].trim()}`)
  }
  if (/resolution\s+time[^.]*\d+[^.]*/i.test(text)) {
    const resMatch = text.match(/resolution\s+time[^.]*\d+[^.]*/i)
    if (resMatch) escalationProcedure.push(`Resolution time: ${resMatch[0].trim()}`)
  }
  if (escalationProcedure.length === 0) escalationProcedure.push('No formal escalation procedure defined')

  // Risk level
  let riskLevel = 'low'
  if (parseFloat(uptimePercentage) < 99.5 || penaltyClauses.length === 0) riskLevel = 'high'
  else if (parseFloat(uptimePercentage) < 99.9) riskLevel = 'medium'

  // Recommendations
  const recommendations: string[] = []
  if (parseFloat(uptimePercentage) < 99.9) recommendations.push('Negotiate higher uptime guarantee (industry standard: 99.9%+)')
  if (penaltyClauses.length === 0) recommendations.push('Add service credit/penalty clauses for SLA breaches')
  if (uptimeExclusions.length > 3) recommendations.push('Reduce scope of uptime exclusions')
  if (/customer.*report/i.test(measurementMethod)) recommendations.push('Implement active monitoring instead of relying on customer reports')
  if (escalationProcedure.length === 0) recommendations.push('Define formal escalation procedure with response/resolution times')

  return { uptime_guarantee, penalty_clauses: penaltyClauses, exclusion_scope: exclusionScope, measurement_method: measurementMethod, escalation_procedure: escalationProcedure, risk_level: riskLevel, recommendations }
}

function formatSLAReport(evaluation: SLAEvaluation): string {
  const lines: string[] = []
  lines.push('## SLA Evaluation Report')
  lines.push('')
  lines.push(`**Risk Level:** ${evaluation.risk_level.toUpperCase()}`)
  lines.push('')
  lines.push(`**Uptime Guarantee:** ${evaluation.uptime_guarantee.percentage} (measured ${evaluation.uptime_guarantee.measurement_period})`)
  lines.push('')

  if (evaluation.uptime_guarantee.exclusions.length > 0) {
    lines.push('### Uptime Exclusions')
    for (const ex of evaluation.uptime_guarantee.exclusions) {
      lines.push(`- ${ex}`)
    }
    lines.push('')
  }

  if (evaluation.penalty_clauses.length > 0) {
    lines.push('### Penalty Clauses')
    for (const p of evaluation.penalty_clauses) {
      lines.push(`- Trigger: ${p.trigger} | Penalty: ${p.penalty} | Cap: ${p.cap}`)
    }
    lines.push('')
  }

  lines.push('### Exclusion Scope')
  for (const ex of evaluation.exclusion_scope) {
    lines.push(`- ${ex}`)
  }
  lines.push('')

  lines.push(`**Measurement Method:** ${evaluation.measurement_method}`)
  lines.push('')

  lines.push('### Escalation Procedure')
  for (const e of evaluation.escalation_procedure) {
    lines.push(`- ${e}`)
  }
  lines.push('')

  if (evaluation.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of evaluation.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: LEASE AGREEMENT ANALYZER ====================

function analyzeLeaseAgreement(
  leaseText: string,
  propertyType?: string
): LeaseAnalysis {
  const text = leaseText

  // Rent terms
  const rentMatch = text.match(/(?:rent|lease\s+payment)[^.]*\$?([\d,]+(?:\.\d{2})?)/i)
  const currencyMatch = text.match(/(?:USD|EUR|GBP|CNY|\$|€|£)/i)
  const freqMatch = text.match(/(?:monthly|quarterly|annually|per\s+(?:calendar\s+)?month|per\s+annum)/i)
  const depositMatch = text.match(/(?:security\s+deposit|deposit)[^.]*\$?([\d,]+(?:\.\d{2})?)/i)

  const rent_terms = {
    base_rent: rentMatch ? `$${rentMatch[1]}` : 'Not specified',
    currency: currencyMatch ? currencyMatch[0] : 'Not specified',
    payment_frequency: freqMatch ? freqMatch[0] : 'Not specified',
    deposit: depositMatch ? `$${depositMatch[1]}` : 'Not specified'
  }

  // Escalation clauses
  const escalationClauses: LeaseAnalysis['escalation_clauses'] = []
  if (/CPI|consumer\s+price\s+index/i.test(text)) {
    escalationClauses.push({ type: 'CPI-based', rate: 'Tied to CPI', frequency: 'Annual' })
  }
  if (/(\d+)%\s*(?:increase|escalation|annual)/i.test(text)) {
    const pctMatch = text.match(/(\d+)%\s*(?:increase|escalation|annual)/i)
    escalationClauses.push({ type: 'Fixed percentage', rate: `${pctMatch ? pctMatch[1] : '?'}%`, frequency: 'Annual' })
  }
  if (/fair\s+market\s+value|FMV|market\s+rate/i.test(text)) {
    escalationClauses.push({ type: 'Market rate adjustment', rate: 'FMV-based', frequency: 'Periodic' })
  }
  if (/step[\s-]?up/i.test(text)) {
    escalationClauses.push({ type: 'Step-up', rate: 'Predetermined increases', frequency: 'Scheduled' })
  }
  if (escalationClauses.length === 0) escalationClauses.push({ type: 'None', rate: 'N/A', frequency: 'N/A' })

  // Maintenance
  const landlordResponsibilities: string[] = []
  const tenantResponsibilities: string[] = []
  if (/landlord.*(repair|maintain|structural|roof|exterior|HVAC|plumbing|electrical)/i.test(text)) {
    landlordResponsibilities.push('Structural repairs')
  }
  if (/tenant.*(repair|maintain|interior|minor)/i.test(text)) {
    tenantResponsibilities.push('Interior/minor repairs')
  }
  if (/common\s+area|CAM|shared/i.test(text)) {
    landlordResponsibilities.push('Common area maintenance (CAM)')
  }
  if (landlordResponsibilities.length === 0) landlordResponsibilities.push('Not explicitly defined')
  if (tenantResponsibilities.length === 0) tenantResponsibilities.push('Not explicitly defined')

  const maintenance = { landlord_responsibilities: landlordResponsibilities, tenant_responsibilities: tenantResponsibilities }

  // Termination
  const noticeMatch = text.match(/(?:notice\s+period|terminate)[^.]*\d+\s*(days?|months?)/i)
  const etpMatch = text.match(/(?:early\s+termination|break\s+clause)[^.]*/i)
  const conditions: string[] = []
  if (/default|breach|non-payment/i.test(text)) conditions.push('Default/breach')
  if (/insolvency|bankruptcy/i.test(text)) conditions.push('Insolvency')
  if (/mutual\s+consent|agreement/i.test(text)) conditions.push('Mutual consent')
  if (/condemnation|eminent\s+domain/i.test(text)) conditions.push('Government action')
  if (conditions.length === 0) conditions.push('Not explicitly defined')

  const termination = {
    notice_period: noticeMatch ? noticeMatch[0].trim() : 'Not specified',
    early_termination_penalty: etpMatch ? etpMatch[0].trim() : 'Not specified',
    conditions
  }

  // Renewal options
  const renewalOptions: LeaseAnalysis['renewal_options'] = []
  if (/renew(al)?[^.]*/i.test(text)) {
    const renewMatch = text.match(/renew(al)?[^.]*/gi)
    if (renewMatch) {
      for (const r of renewMatch.slice(0, 3)) {
        renewalOptions.push({ type: 'Renewal option', terms: r.trim(), notice_required: 'See lease terms' })
      }
    }
  }
  if (/automatic(ally)?\s+renew|evergreen/i.test(text)) {
    renewalOptions.push({ type: 'Auto-renewal (evergreen)', terms: 'Automatic unless notice given', notice_required: 'Typically 60-90 days' })
  }
  if (renewalOptions.length === 0) renewalOptions.push({ type: 'None', terms: 'No renewal option', notice_required: 'N/A' })

  // Key concerns
  const keyConcerns: string[] = []
  if (/unlimited|sole\s+discretion/i.test(text)) keyConcerns.push('Landlord discretion clauses present')
  if (/personal\s+guarantee/i.test(text)) keyConcerns.push('Personal guarantee required')
  if (/triple\s+net|NNN/i.test(text)) keyConcerns.push('Triple net lease (NNN) — tenant bears all costs')
  if (/exclusive\s+use/i.test(text)) keyConcerns.push('Exclusive use clause (verify scope)')
  if (/right\s+of\s+first\s+(refusal|offer)/i.test(text)) keyConcerns.push('Right of first refusal/offer present')
  if (propertyType && !new RegExp(propertyType, 'i').test(text)) keyConcerns.push(`Property type "${propertyType}" not explicitly mentioned`)

  // Risk level
  let riskLevel = 'low'
  if (keyConcerns.length >= 3) riskLevel = 'high'
  else if (keyConcerns.length >= 1) riskLevel = 'medium'

  return { rent_terms, escalation_clauses: escalationClauses, maintenance, termination, renewal_options: renewalOptions, risk_level: riskLevel, key_concerns: keyConcerns }
}

function formatLeaseReport(analysis: LeaseAnalysis, propertyType?: string): string {
  const lines: string[] = []
  lines.push('## Lease Agreement Analysis')
  lines.push('')
  if (propertyType) lines.push(`**Property Type:** ${propertyType}`)
  lines.push(`**Risk Level:** ${analysis.risk_level.toUpperCase()}`)
  lines.push('')

  lines.push('### Rent Terms')
  lines.push(`- Base Rent: ${analysis.rent_terms.base_rent}`)
  lines.push(`- Currency: ${analysis.rent_terms.currency}`)
  lines.push(`- Payment Frequency: ${analysis.rent_terms.payment_frequency}`)
  lines.push(`- Security Deposit: ${analysis.rent_terms.deposit}`)
  lines.push('')

  lines.push('### Escalation Clauses')
  for (const e of analysis.escalation_clauses) {
    lines.push(`- ${e.type}: ${e.rate} (${e.frequency})`)
  }
  lines.push('')

  lines.push('### Maintenance Responsibilities')
  lines.push('**Landlord:**')
  for (const r of analysis.maintenance.landlord_responsibilities) lines.push(`- ${r}`)
  lines.push('**Tenant:**')
  for (const r of analysis.maintenance.tenant_responsibilities) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### Termination')
  lines.push(`- Notice Period: ${analysis.termination.notice_period}`)
  lines.push(`- Early Termination Penalty: ${analysis.termination.early_termination_penalty}`)
  lines.push('- Conditions:')
  for (const c of analysis.termination.conditions) lines.push(`  - ${c}`)
  lines.push('')

  lines.push('### Renewal Options')
  for (const r of analysis.renewal_options) {
    lines.push(`- ${r.type}: ${r.terms} (Notice: ${r.notice_required})`)
  }
  lines.push('')

  if (analysis.key_concerns.length > 0) {
    lines.push('### Key Concerns')
    for (const c of analysis.key_concerns) {
      lines.push(`- ${c}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: MERGER CLAUSE DETECTOR ====================

function detectMergerClause(contractText: string): MergerClauseResult {
  const text = contractText

  // Check for merger clause
  const mergerPatterns = [
    /entire\s+agreement/i,
    /merger\s+clause/i,
    /integration\s+clause/i,
    /this\s+agreement\s+constitutes\s+the\s+entire/i,
    /supersed(e|es|ed)\s+all\s+prior/i,
    /merger\s+and\s+integration/i
  ]

  let mergerClausePresent = false
  let clauseText = 'Not found'
  for (const pattern of mergerPatterns) {
    const match = text.match(new RegExp(pattern.source + '[^.]*/', 'i'))
    if (match) {
      mergerClausePresent = true
      clauseText = match[0].trim()
      break
    }
  }

  // Entire agreement scope
  let entireAgreementScope = 'Not specified'
  if (/all\s+prior\s+(agreements?|negotiations?|discussions?|understandings?|representations?)/i.test(text)) {
    entireAgreementScope = 'Supersedes all prior agreements, negotiations, and understandings'
  } else if (/all\s+prior\s+agreements?/i.test(text)) {
    entireAgreementScope = 'Supersedes all prior agreements'
  } else if (/oral\s+and\s+written/i.test(text)) {
    entireAgreementScope = 'Covers both oral and written prior communications'
  }

  // Amendment requirements
  let amendmentRequirements = 'Not specified'
  if (/amendment[^.]*(?:written|signed|executed)[^.]*/i.test(text)) {
    const amdMatch = text.match(/amendment[^.]*(?:written|signed|executed)[^.]*/i)
    amendmentRequirements = amdMatch ? amdMatch[0].trim() : 'Written amendment required'
  } else if (/no\s+amendment[^.]*oral/i.test(text)) {
    amendmentRequirements = 'Oral amendments prohibited; written only'
  } else if (/waiver[^.]*written/i.test(text)) {
    amendmentRequirements += ' | Waivers must be in writing'
  }

  // Survival clauses
  const survivalClauses: MergerClauseResult['survival_clauses'] = []
  const survivalPatterns = [
    { name: 'Confidentiality', pattern: /confidential(ity|information).*survive/i },
    { name: 'Indemnification', pattern: /indemnif(y|ication).*survive/i },
    { name: 'Limitation of Liability', pattern: /limitation\s+of\s+liability.*survive/i },
    { name: 'Intellectual Property', pattern: /intellectual\s+property.*survive/i },
    { name: 'Warranty', pattern: /warrant(y|ies).*survive/i },
    { name: 'Dispute Resolution', pattern: /dispute\s+resolution.*survive/i },
    { name: 'Non-Compete', pattern: /non-compete.*survive/i },
    { name: 'Payment Obligations', pattern: /payment.*survive/i }
  ]

  for (const sp of survivalPatterns) {
    if (sp.pattern.test(text)) {
      const durMatch = text.match(new RegExp(sp.pattern.source + '[^.]*\\d+\\s*(years?|months?)', 'i'))
      survivalClauses.push({
        clause: sp.name,
        survives: true,
        duration: durMatch ? durMatch[0].trim() : 'Duration not specified'
      })
    }
  }

  // Prior agreements superseded
  const priorAgreementsSuperseded: string[] = []
  if (/all\s+prior\s+agreements?/i.test(text)) priorAgreementsSuperseded.push('All prior agreements')
  if (/prior\s+negotiations?/i.test(text)) priorAgreementsSuperseded.push('Prior negotiations')
  if (/prior\s+representations?/i.test(text)) priorAgreementsSuperseded.push('Prior representations')
  if (/oral\s+agreements?/i.test(text)) priorAgreementsSuperseded.push('Oral agreements')
  if (/letters?\s+of\s+intent/i.test(text)) priorAgreementsSuperseded.push('Letters of intent')
  if (/memoranda?\s+of\s+understanding/i.test(text)) priorAgreementsSuperseded.push('Memoranda of understanding')
  if (priorAgreementsSuperseded.length === 0) priorAgreementsSuperseded.push('Not explicitly listed')

  // Risk level
  let riskLevel = 'low'
  if (!mergerClausePresent) riskLevel = 'high'
  else if (survivalClauses.length === 0) riskLevel = 'medium'

  // Recommendations
  const recommendations: string[] = []
  if (!mergerClausePresent) {
    recommendations.push('CRITICAL: No merger/entire agreement clause found — add to prevent disputes about prior agreements')
  }
  if (survivalClauses.length === 0) {
    recommendations.push('Add survival clauses for key obligations (confidentiality, indemnification, IP)')
  }
  if (/oral.*amend/i.test(text) && !/no\s+amendment.*oral/i.test(text)) {
    recommendations.push('Clarify that amendments must be in writing only')
  }
  if (priorAgreementsSuperseded.includes('All prior agreements')) {
    recommendations.push('Verify that intended prior agreements (e.g., NDAs) are explicitly excluded if needed')
  }
  if (recommendations.length === 0) {
    recommendations.push('Merger clause appears adequate — standard review recommended')
  }

  return {
    merger_clause_present: mergerClausePresent,
    clause_text: clauseText,
    entire_agreement_scope: entireAgreementScope,
    amendment_requirements: amendmentRequirements,
    survival_clauses: survivalClauses,
    prior_agreements_superseded: priorAgreementsSuperseded,
    risk_level: riskLevel,
    recommendations
  }
}

function formatMergerClauseReport(result: MergerClauseResult): string {
  const lines: string[] = []
  lines.push('## Merger Clause Detection Report')
  lines.push('')
  lines.push(`**Merger Clause Present:** ${result.merger_clause_present ? 'YES' : 'NO'}`)
  lines.push(`**Risk Level:** ${result.risk_level.toUpperCase()}`)
  lines.push('')

  if (result.merger_clause_present) {
    lines.push('### Clause Text')
    lines.push(`> "${result.clause_text}"`)
    lines.push('')
  }

  lines.push(`**Entire Agreement Scope:** ${result.entire_agreement_scope}`)
  lines.push('')
  lines.push(`**Amendment Requirements:** ${result.amendment_requirements}`)
  lines.push('')

  lines.push('### Prior Agreements Superseded')
  for (const p of result.prior_agreements_superseded) {
    lines.push(`- ${p}`)
  }
  lines.push('')

  if (result.survival_clauses.length > 0) {
    lines.push('### Survival Clauses')
    for (const s of result.survival_clauses) {
      lines.push(`- **${s.clause}:** Survives (${s.duration})`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'contract_clause_extractor',
    description: 'Extract and classify clauses from contract text. Identifies clause types, locations, risk levels, and provides contextual notes for each extracted clause.',
    parameters: {
      contract_text: { type: 'string', required: true, description: 'Full text of the contract to analyze' },
      clause_types: { type: 'string', description: 'Optional JSON array of clause types to search for (e.g., ["indemnification", "termination", "confidentiality"]). Defaults to all standard types.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_text: string; clause_types?: string }) {
      const types = args.clause_types ? JSON.parse(args.clause_types) as string[] : undefined
      const result = extractClauses(args.contract_text, types)
      return formatClauseExtraction(result)
    }
  }))

  tools.register(defineTool({
    name: 'obligation_tracker',
    description: 'Extract and track contractual obligations from contract text. Identifies responsible parties, deadlines, status, and consequences of non-compliance.',
    parameters: {
      contract_text: { type: 'string', required: true, description: 'Full text of the contract to analyze' },
      party_name: { type: 'string', description: 'Optional party name to filter obligations by responsible party' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_text: string; party_name?: string }) {
      const result = trackObligations(args.contract_text, args.party_name)
      return formatObligationReport(result, args.party_name)
    }
  }))

  tools.register(defineTool({
    name: 'legal_risk_scorer',
    description: 'Assess overall legal risk of a contract. Scores risk based on high-risk clauses, missing standard provisions, and provides actionable recommendations.',
    parameters: {
      contract_text: { type: 'string', required: true, description: 'Full text of the contract to assess' },
      jurisdiction: { type: 'string', description: 'Optional jurisdiction for compliance context (e.g., "California", "EU", "New York")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_text: string; jurisdiction?: string }) {
      const result = scoreLegalRisk(args.contract_text, args.jurisdiction)
      return formatRiskReport(result, args.jurisdiction)
    }
  }))

  tools.register(defineTool({
    name: 'nda_analyzer',
    description: 'Deep analysis of Non-Disclosure Agreements. Evaluates scope, duration, exclusions, non-compete clauses, remedies, and identifies key concerns.',
    parameters: {
      nda_text: { type: 'string', required: true, description: 'Full text of the NDA to analyze' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { nda_text: string }) {
      const result = analyzeNDA(args.nda_text)
      return formatNDAReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'employment_contract_reviewer',
    description: 'Review employment contracts for compensation, termination clauses, IP assignment, non-compete provisions, and benefits. Identifies red flags and provides overall assessment.',
    parameters: {
      contract_text: { type: 'string', required: true, description: 'Full text of the employment contract to review' },
      employee_role: { type: 'string', description: 'Optional employee role/title to verify against contract terms' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_text: string; employee_role?: string }) {
      const result = reviewEmploymentContract(args.contract_text, args.employee_role)
      return formatEmploymentReport(result, args.employee_role)
    }
  }))

  tools.register(defineTool({
    name: 'sla_evaluator',
    description: 'Evaluate Service Level Agreements. Analyzes uptime guarantees, penalty clauses, exclusion scope, measurement methods, and escalation procedures.',
    parameters: {
      sla_text: { type: 'string', required: true, description: 'Full text of the SLA to evaluate' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { sla_text: string }) {
      const result = evaluateSLA(args.sla_text)
      return formatSLAReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'lease_agreement_analyzer',
    description: 'Analyze lease agreements for commercial or residential properties. Reviews rent terms, escalation clauses, maintenance responsibilities, termination conditions, and renewal options.',
    parameters: {
      lease_text: { type: 'string', required: true, description: 'Full text of the lease agreement to analyze' },
      property_type: { type: 'string', description: 'Optional property type (e.g., "commercial", "residential", "industrial", "retail")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { lease_text: string; property_type?: string }) {
      const result = analyzeLeaseAgreement(args.lease_text, args.property_type)
      return formatLeaseReport(result, args.property_type)
    }
  }))

  tools.register(defineTool({
    name: 'merger_clause_detector',
    description: 'Detect and analyze merger/entire agreement clauses in contracts. Identifies clause presence, scope, amendment requirements, survival clauses, and superseded agreements.',
    parameters: {
      contract_text: { type: 'string', required: true, description: 'Full text of the contract to analyze for merger clauses' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_text: string }) {
      const result = detectMergerClause(args.contract_text)
      return formatMergerClauseReport(result)
    }
  }))

  console.log(`[dsh-tool-legalmind] Loaded v${VERSION} — Legal Document Intelligence with 8 tools`)
  console.log('  Tools: contract_clause_extractor, obligation_tracker, legal_risk_scorer, nda_analyzer, employment_contract_reviewer, sla_evaluator, lease_agreement_analyzer, merger_clause_detector')
}
