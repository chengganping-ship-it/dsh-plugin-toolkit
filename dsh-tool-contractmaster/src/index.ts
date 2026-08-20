import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ==================== Plugin Metadata ====================

export const name = 'dsh-tool-contractmaster'
export const inject = ['tools']

// ==================== Seeded Random Utility ====================

function seededRandom(seed: string): () => number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return function () {
    h += 0x6D2B79F5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ==================== Type Definitions ====================

interface PartyInfo {
  name: string
  role: 'buyer' | 'seller' | 'licensor' | 'licensee' | 'employer' | 'employee' | 'lessor' | 'lessee' | 'partner' | 'other'
  jurisdiction?: string
  registration_number?: string
}

interface KeyTermField {
  field: string
  value: string
  notes?: string
}

interface DrafterInput {
  contract_type: string
  parties: PartyInfo[]
  key_terms: KeyTermField[]
  jurisdiction: string
  effective_date?: string
  duration_months?: number
  special_conditions?: string[]
}

interface DrafterResult {
  draft_id: string
  contract_type: string
  title: string
  sections: ContractSection[]
  party_clauses: PartyClause[]
  missing_terms: string[]
  recommendations: string[]
  risk_flags: string[]
}

interface ContractSection {
  number: string
  title: string
  content: string
  is_standard: boolean
}

interface PartyClause {
  party_name: string
  role: string
  obligations: string[]
  rights: string[]
}

interface ClauseAnalyzerInput {
  contract_text: string
  focus_areas: string[]
  risk_threshold?: 'low' | 'medium' | 'high'
}

interface ClauseAnalyzerResult {
  clauses: ExtractedClause[]
  risk_annotations: RiskAnnotation[]
  modification_suggestions: ModificationSuggestion[]
  overall_score: number
  summary: string
}

interface ExtractedClause {
  clause_number: string
  title: string
  text: string
  category: string
  importance: 'critical' | 'standard' | 'boilerplate'
  ambiguities: string[]
}

interface RiskAnnotation {
  clause_ref: string
  risk_level: 'high' | 'medium' | 'low'
  risk_type: string
  description: string
  suggested_mitigation: string
}

interface ModificationSuggestion {
  clause_ref: string
  current_issue: string
  suggested_text: string
  priority: 'must_fix' | 'recommended' | 'optional'
}

interface ObligationRecord {
  obligation_id: string
  description: string
  responsible_party: string
  deadline: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived'
  priority: 'critical' | 'high' | 'medium' | 'low'
  dependencies?: string[]
  completion_percentage?: number
}

interface ObligationTrackerInput {
  contract_obligations: ObligationRecord[]
  counterparties: string[]
  deadlines: string[]
  alert_days_before?: number
}

interface ObligationTrackerResult {
  obligations: ObligationRecord[]
  status_summary: ObligationStatusSummary
  upcoming_deadlines: ObligationAlert[]
  overdue_items: ObligationAlert[]
  party_workload: PartyWorkload[]
  compliance_rate: number
}

interface ObligationStatusSummary {
  total: number
  completed: number
  pending: number
  in_progress: number
  overdue: number
  waived: number
}

interface ObligationAlert {
  obligation_id: string
  description: string
  responsible_party: string
  deadline: string
  days_remaining: number
  urgency: 'critical' | 'warning' | 'info'
}

interface PartyWorkload {
  party: string
  total_obligations: number
  pending_count: number
  overdue_count: number
  risk_score: number
}

interface ContractPortfolioEntry {
  contract_id: string
  title: string
  contract_type: string
  counterparty: string
  start_date: string
  end_date: string
  value: number
  currency: string
  renewal_type: 'auto' | 'manual' | 'none'
  notice_period_days: number
  last_renewal_date?: string
}

interface RenewalRule {
  trigger: 'expiration' | 'milestone' | 'performance_review'
  lead_time_days: number
  auto_renew: boolean
  max_renewals: number
  escalation_threshold?: number
}

interface RenewalManagerInput {
  contract_portfolio: ContractPortfolioEntry[]
  renewal_rules: RenewalRule[]
  notice_periods: number[]
  strategy?: 'aggressive' | 'balanced' | 'conservative'
}

interface RenewalManagerResult {
  renewal_schedule: RenewalScheduleItem[]
  priority_actions: RenewalAction[]
  negotiation_points: NegotiationPoint[]
  risk_alerts: string[]
  cost_projections: CostProjection[]
}

interface RenewalScheduleItem {
  contract_id: string
  title: string
  current_end_date: string
  renewal_deadline: string
  action_required_by: string
  days_until_action: number
  renewal_type: string
  status: 'upcoming' | 'action_needed' | 'urgent' | 'expired'
}

interface RenewalAction {
  contract_id: string
  action_type: 'initiate_review' | 'send_notice' | 'negotiate_terms' | 'prepare_replacement' | 'execute_renewal'
  deadline: string
  owner: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  details: string
}

interface NegotiationPoint {
  contract_id: string
  point: string
  leverage: 'strong' | 'moderate' | 'weak'
  suggested_approach: string
}

interface CostProjection {
  contract_id: string
  current_value: number
  projected_value: number
  increase_percentage: number
  currency: string
}

interface RiskAssessorInput {
  contract_terms: string[]
  industry: string
  financial_exposure: number
  currency?: string
  counterparty_risk?: 'low' | 'medium' | 'high'
  market_volatility?: 'low' | 'medium' | 'high'
}

interface RiskAssessorResult {
  overall_risk_score: number
  risk_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  risk_categories: RiskCategory[]
  mitigation_recommendations: MitigationRecommendation[]
  exposure_analysis: ExposureAnalysis
  monitoring_indicators: string[]
}

interface RiskCategory {
  category: string
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
}

interface MitigationRecommendation {
  target_category: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  priority: number
}

interface ExposureAnalysis {
  max_exposure: number
  expected_exposure: number
  worst_case_exposure: number
  currency: string
  confidence_level: number
}

interface ComplianceCheckerInput {
  contract_clauses: string[]
  regulatory_requirements: string[]
  jurisdiction?: string
  industry?: string
  compliance_framework?: string
}

interface ComplianceCheckerResult {
  compliance_score: number
  compliant_count: number
  gaps: ComplianceGap[]
  required_revisions: RequiredRevision[]
  framework_coverage: FrameworkCoverage[]
  risk_implications: string[]
}

interface ComplianceGap {
  requirement: string
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_addressed'
  gap_description: string
  severity: 'critical' | 'major' | 'minor'
  contract_clause_ref?: string
}

interface RequiredRevision {
  clause_index: number
  current_text: string
  required_text: string
  rationale: string
  deadline_urgency: 'immediate' | 'before_execution' | 'post_execution'
}

interface FrameworkCoverage {
  framework: string
  covered: number
  total: number
  percentage: number
}

interface AmendmentInput {
  original_contract: string
  proposed_changes: ProposedChange[]
  analysis_depth?: 'surface' | 'standard' | 'deep'
}

interface ProposedChange {
  section_ref: string
  change_type: 'addition' | 'deletion' | 'modification' | 'replacement'
  original_text?: string
  proposed_text: string
  rationale?: string
}

interface AmendmentAnalyzerResult {
  impact_assessment: ImpactAssessment[]
  conflict_analysis: AmendmentConflict[]
  recommendations: AmendmentRecommendation[]
  overall_impact_score: number
  summary: string
}

interface ImpactAssessment {
  change_index: number
  section_ref: string
  change_type: string
  impact_level: 'high' | 'medium' | 'low'
  affected_sections: string[]
  legal_implications: string[]
  financial_implications: string[]
}

interface AmendmentConflict {
  change_a_index: number
  change_b_index: number
  conflict_type: 'contradiction' | 'redundancy' | 'dependency_breach'
  description: string
  resolution: string
}

interface AmendmentRecommendation {
  change_index: number
  recommendation: string
  action: 'accept' | 'modify' | 'reject' | 'defer'
  alternative_text?: string
  reasoning: string
}

interface SummarizerInput {
  contract_text: string
  summary_focus: 'full' | 'financial' | 'obligations' | 'risks' | 'key_dates' | 'termination'
  max_length?: number
  include_red_flags?: boolean
}

interface SummarizerResult {
  contract_type: string
  parties: SummaryParty[]
  key_terms: SummaryTerm[]
  critical_dates: CriticalDate[]
  financial_summary: FinancialSummary
  red_flags: string[]
  termination_conditions: string[]
  overall_summary: string
  word_count: number
}

interface SummaryParty {
  name: string
  role: string
  key_obligations: string[]
}

interface SummaryTerm {
  term: string
  value: string
  significance: 'critical' | 'important' | 'standard'
}

interface CriticalDate {
  event: string
  date: string
  days_from_now: number
  action_required: string
}

interface FinancialSummary {
  total_value?: number
  currency: string
  payment_schedule: string[]
  penalty_clauses: string[]
  financial_risks: string[]
}

// ==================== In-Memory Data Store ====================

const contractStore: Map<string, DrafterResult> = new Map()
const obligationStore: Map<string, ObligationRecord> = new Map()
let idCounter = 0

function generateId(prefix: string): string {
  idCounter++
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 7)
  return prefix + '_' + ts + '_' + idCounter.toString(36) + '_' + rand
}

// ==================== Analysis Helper Functions ====================

function extractClausesFromText(text: string): ExtractedClause[] {
  const clauses: ExtractedClause[] = []
  const lines = text.split('\n')
  let currentClause: Partial<ExtractedClause> | null = null
  let clauseCounter = 0

  const clausePatterns = [
    /^\s*(\d+[\.\d]*)\s+(.+)/,
    /^\s*CLAUSE\s+(\S+)\s*[:\-]?\s*(.+)?/i,
    /^\s*SECTION\s+(\S+)\s*[:\-]?\s*(.+)?/i,
    /^\s*ARTICLE\s+(\S+)\s*[:\-]?\s*(.+)?/i,
    /^\s*第[一二三四五六七八九十百]+[条款]/
  ]

  for (const line of lines) {
    let matched = false
    for (const pattern of clausePatterns) {
      const match = line.match(pattern)
      if (match) {
        if (currentClause && currentClause.text) {
          clauses.push(currentClause as ExtractedClause)
        }
        clauseCounter++
        currentClause = {
          clause_number: match[1] || String(clauseCounter),
          title: (match[2] || 'Untitled Clause').trim(),
          text: line,
          category: categorizeClause(line),
          importance: assessImportance(line),
          ambiguities: detectAmbiguities(line)
        }
        matched = true
        break
      }
    }
    if (!matched && currentClause) {
      currentClause.text += '\n' + line
    }
  }

  if (currentClause && currentClause.text) {
    clauses.push(currentClause as ExtractedClause)
  }

  if (clauses.length === 0 && text.trim().length > 0) {
    clauses.push({
      clause_number: '1',
      title: 'Full Contract Text',
      text: text,
      category: 'general',
      importance: 'standard',
      ambiguities: detectAmbiguities(text)
    })
  }

  return clauses
}

function categorizeClause(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('payment') || lower.includes('fee') || lower.includes('price') || lower.includes('compensation') || lower.includes('remuneration')) return 'financial'
  if (lower.includes('terminate') || lower.includes('termination') || lower.includes('cancel') || lower.includes('expir')) return 'termination'
  if (lower.includes('liability') || lower.includes('indemnif') || lower.includes('warrant') || lower.includes('guarantee')) return 'liability'
  if (lower.includes('confidential') || lower.includes('non-disclosure') || lower.includes('nda') || lower.includes('proprietary')) return 'confidentiality'
  if (lower.includes('intellectual property') || lower.includes('ip') || lower.includes('patent') || lower.includes('trademark') || lower.includes('copyright')) return 'intellectual_property'
  if (lower.includes('governing law') || lower.includes('jurisdiction') || lower.includes('dispute') || lower.includes('arbitration') || lower.includes('mediation')) return 'dispute_resolution'
  if (lower.includes('force majeure') || lower.includes('act of god') || lower.includes('unforeseeable')) return 'force_majeure'
  if (lower.includes('assignment') || lower.includes('transfer') || lower.includes('delegate')) return 'assignment'
  if (lower.includes('notice') || lower.includes('notification') || lower.includes('communicat')) return 'notice'
  if (lower.includes('represent') || lower.includes('covenant') || lower.includes('undertake') || lower.includes('agree to')) return 'representation'
  return 'general'
}

function assessImportance(text: string): 'critical' | 'standard' | 'boilerplate' {
  const lower = text.toLowerCase()
  const criticalSignals = ['shall', 'must', 'material', 'substantial', 'notwithstanding', 'irrevocable', 'exclusive', 'unlimited', 'penalty', 'default']
  const boilerplateSignals = ['miscellaneous', 'general provisions', 'severability', 'entire agreement', 'counterparts', 'headings']

  for (const signal of criticalSignals) {
    if (lower.includes(signal)) return 'critical'
  }
  for (const signal of boilerplateSignals) {
    if (lower.includes(signal)) return 'boilerplate'
  }
  return 'standard'
}

function detectAmbiguities(text: string): string[] {
  const ambiguities: string[] = []
  const lower = text.toLowerCase()

  const vagueTerms = ['reasonable', 'best efforts', 'material', 'substantial', 'timely', 'adequate', 'satisfactory', 'appropriate', 'as soon as practicable', 'from time to time']
  for (const term of vagueTerms) {
    if (lower.includes(term)) {
      ambiguities.push('Contains vague term: "' + term + '" - consider defining with measurable criteria')
    }
  }

  if (lower.includes('including but not limited to') || lower.includes('including without limitation')) {
    ambiguities.push('Open-ended list ("including but not limited to") may create scope uncertainty')
  }

  if (/\b(he|she|it|they)\b/i.test(text) && !text.includes('Party')) {
    ambiguities.push('Pronoun references may be ambiguous - use specific party names')
  }

  if (lower.includes('etc.') || lower.includes('and so on') || lower.includes('and the like')) {
    ambiguities.push('Use of "etc." creates undefined scope')
  }

  return ambiguities
}

function calculateDateDaysFromNow(dateStr: string): number {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

// ==================== Plugin Entry Point ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: contract_drafter
  tools.register(defineTool({
    name: 'contract_drafter',
    description: 'Generate contract drafts based on contract type, party information, key terms, and jurisdiction. Produces structured contract sections with clause suggestions.',
    parameters: {
      draft_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_type (string), parties (array of {name, role, jurisdiction?, registration_number?}), key_terms (array of {field, value, notes?}), jurisdiction (string), effective_date? (ISO date), duration_months? (number), special_conditions? (string[])'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { draft_data: string }) {
      const data = JSON.parse(args.draft_data) as DrafterInput
      const result = draftContract(data)
      return formatDrafterResult(result)
    }
  }))

  // Tool 2: clause_analyzer
  tools.register(defineTool({
    name: 'clause_analyzer',
    description: 'Analyze contract clauses by extracting, categorizing, annotating risks, and suggesting modifications. Supports focused analysis on specific areas.',
    parameters: {
      analysis_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_text (string), focus_areas (string[]), risk_threshold? ("low"|"medium"|"high")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { analysis_input: string }) {
      const input = JSON.parse(args.analysis_input) as ClauseAnalyzerInput
      const result = analyzeClauses(input)
      return formatClauseAnalysisResult(result)
    }
  }))

  // Tool 3: obligation_tracker
  tools.register(defineTool({
    name: 'obligation_tracker',
    description: 'Track contract obligations across counterparties with deadline monitoring, status updates, and compliance rate calculations.',
    parameters: {
      tracker_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_obligations (array of {obligation_id, description, responsible_party, deadline, status, priority, dependencies?, completion_percentage?}), counterparties (string[]), deadlines (string[]), alert_days_before? (number, default 30)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { tracker_data: string }) {
      const input = JSON.parse(args.tracker_data) as ObligationTrackerInput
      const result = trackObligations(input)
      return formatObligationTrackerResult(result)
    }
  }))

  // Tool 4: renewal_manager
  tools.register(defineTool({
    name: 'renewal_manager',
    description: 'Manage contract renewals with scheduling, priority actions, negotiation point identification, and cost projections.',
    parameters: {
      renewal_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_portfolio (array of {contract_id, title, contract_type, counterparty, start_date, end_date, value, currency, renewal_type, notice_period_days, last_renewal_date?}), renewal_rules (array of {trigger, lead_time_days, auto_renew, max_renewals, escalation_threshold?}), notice_periods (number[]), strategy? ("aggressive"|"balanced"|"conservative")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { renewal_data: string }) {
      const input = JSON.parse(args.renewal_data) as RenewalManagerInput
      const result = manageRenewals(input)
      return formatRenewalManagerResult(result)
    }
  }))

  // Tool 5: risk_assessor
  tools.register(defineTool({
    name: 'risk_assessor',
    description: 'Assess contract risk across liability, financial, operational, and legal categories. Provides risk scoring and mitigation recommendations.',
    parameters: {
      risk_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_terms (string[]), industry (string), financial_exposure (number), currency? (string), counterparty_risk? ("low"|"medium"|"high"), market_volatility? ("low"|"medium"|"high")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_data: string }) {
      const input = JSON.parse(args.risk_data) as RiskAssessorInput
      const result = assessRisk(input)
      return formatRiskAssessorResult(result)
    }
  }))

  // Tool 6: compliance_checker
  tools.register(defineTool({
    name: 'compliance_checker',
    description: 'Check contract clauses against regulatory requirements. Identifies compliance gaps, required revisions, and framework coverage.',
    parameters: {
      compliance_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_clauses (string[]), regulatory_requirements (string[]), jurisdiction? (string), industry? (string), compliance_framework? (string)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { compliance_data: string }) {
      const input = JSON.parse(args.compliance_data) as ComplianceCheckerInput
      const result = checkCompliance(input)
      return formatComplianceCheckerResult(result)
    }
  }))

  // Tool 7: amendment_analyzer
  tools.register(defineTool({
    name: 'amendment_analyzer',
    description: 'Analyze proposed amendments to a contract. Assesses impact, detects conflicts between changes, and provides recommendations.',
    parameters: {
      amendment_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: original_contract (string), proposed_changes (array of {section_ref, change_type, original_text?, proposed_text, rationale?}), analysis_depth? ("surface"|"standard"|"deep")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { amendment_data: string }) {
      const input = JSON.parse(args.amendment_data) as AmendmentInput
      const result = analyzeAmendments(input)
      return formatAmendmentAnalyzerResult(result)
    }
  }))

  // Tool 8: contract_summarizer
  tools.register(defineTool({
    name: 'contract_summarizer',
    description: 'Generate structured summaries of contracts with focus areas including financial terms, obligations, risks, key dates, and termination conditions.',
    parameters: {
      summary_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_text (string), summary_focus ("full"|"financial"|"obligations"|"risks"|"key_dates"|"termination"), max_length? (number), include_red_flags? (boolean, default true)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { summary_data: string }) {
      const input = JSON.parse(args.summary_data) as SummarizerInput
      const result = summarizeContract(input)
      return formatSummarizerResult(result)
    }
  }))
}

// ==================== Tool 1: Contract Drafter ====================

function draftContract(data: DrafterInput): DrafterResult {
  const draftId = generateId('draft')
  const rng = seededRandom(draftId + data.contract_type)
  const warnings: string[] = []
  const recommendations: string[] = []

  if (!data.parties || data.parties.length < 2) {
    warnings.push('Contract requires at least two parties - currently only ' + (data.parties?.length || 0) + ' provided')
  }

  if (!data.key_terms || data.key_terms.length === 0) {
    warnings.push('No key terms provided - contract will use default template language')
  }

  const sections = generateContractSections(data, rng)
  const partyClauses = generatePartyClauses(data, rng)
  const missingTerms = identifyMissingTerms(data, rng)
  const riskFlags = identifyDraftRisks(data, rng)

  recommendations.push('Review all bracketed placeholders [in square brackets] before execution')
  recommendations.push('Have qualified legal counsel review the final draft')
  if (data.jurisdiction) {
    recommendations.push('Verify compliance with ' + data.jurisdiction + ' contract law requirements')
  }

  const result: DrafterResult = {
    draft_id: draftId,
    contract_type: data.contract_type,
    title: generateContractTitle(data),
    sections,
    party_clauses: partyClauses,
    missing_terms: missingTerms,
    recommendations,
    risk_flags: riskFlags
  }

  contractStore.set(draftId, result)
  return result
}

function generateContractTitle(data: DrafterInput): string {
  const typeMap: Record<string, string> = {
    'service_agreement': 'Service Agreement',
    'nda': 'Non-Disclosure Agreement',
    'employment': 'Employment Agreement',
    'sales': 'Sales Agreement',
    'lease': 'Lease Agreement',
    'licensing': 'Licensing Agreement',
    'partnership': 'Partnership Agreement',
    'consulting': 'Consulting Agreement',
    'vendor': 'Vendor Agreement',
    'sla': 'Service Level Agreement'
  }
  return typeMap[data.contract_type.toLowerCase()] || (data.contract_type + ' Agreement')
}

function generateContractSections(data: DrafterInput, rng: () => number): ContractSection[] {
  const sections: ContractSection[] = []
  let sectionNum = 1

  sections.push({
    number: String(sectionNum++),
    title: 'Preamble and Parties',
    content: generatePreamble(data),
    is_standard: true
  })

  sections.push({
    number: String(sectionNum++),
    title: 'Definitions',
    content: generateDefinitions(data),
    is_standard: true
  })

  sections.push({
    number: String(sectionNum++),
    title: 'Scope of Agreement',
    content: generateScopeSection(data),
    is_standard: false
  })

  const termSection = data.key_terms.find(t => t.field.toLowerCase().includes('term') || t.field.toLowerCase().includes('duration'))
  sections.push({
    number: String(sectionNum++),
    title: 'Term and Duration',
    content: termSection
      ? 'This Agreement shall commence on ' + (data.effective_date || '[Effective Date]') + ' and continue for a period of ' + termSection.value + ', unless earlier terminated in accordance with the provisions herein.'
      : 'This Agreement shall commence on ' + (data.effective_date || '[Effective Date]') + ' and continue for a period of ' + (data.duration_months || '[Duration]') + ' months, unless earlier terminated in accordance with the provisions herein.',
    is_standard: true
  })

  const paymentTerm = data.key_terms.find(t => t.field.toLowerCase().includes('payment') || t.field.toLowerCase().includes('price') || t.field.toLowerCase().includes('fee'))
  if (paymentTerm || data.contract_type.toLowerCase() !== 'nda') {
    sections.push({
      number: String(sectionNum++),
      title: 'Payment Terms',
      content: paymentTerm
        ? 'Total compensation: ' + paymentTerm.value + '. Payment shall be made in accordance with the schedule set forth in Schedule A. Late payments shall accrue interest at a rate of 1.5% per month or the maximum rate permitted by ' + data.jurisdiction + ' law, whichever is less.'
        : 'Payment terms shall be as set forth in Schedule A attached hereto. All payments shall be made in ' + (data.key_terms.find(t => t.field.toLowerCase().includes('currency'))?.value || 'USD') + ' within thirty (30) days of invoice date.',
      is_standard: false
    })
  }

  sections.push({
    number: String(sectionNum++),
    title: 'Representations and Warranties',
    content: generateWarrantiesSection(data),
    is_standard: true
  })

  sections.push({
    number: String(sectionNum++),
    title: 'Confidentiality',
    content: 'Each party agrees to maintain the confidentiality of all proprietary information disclosed under this Agreement for a period of [Confidentiality Period] years from the date of disclosure.',
    is_standard: true
  })

  sections.push({
    number: String(sectionNum++),
    title: 'Limitation of Liability',
    content: 'IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. The total aggregate liability under this Agreement shall not exceed [Liability Cap].',
    is_standard: true
  })

  sections.push({
    number: String(sectionNum++),
    title: 'Termination',
    content: generateTerminationSection(data),
    is_standard: true
  })

  sections.push({
    number: String(sectionNum++),
    title: 'Governing Law and Dispute Resolution',
    content: 'This Agreement shall be governed by and construed in accordance with the laws of ' + data.jurisdiction + '. Any disputes arising under this Agreement shall be resolved through [Arbitration/Mediation/Litigation] in ' + data.jurisdiction + '.',
    is_standard: true
  })

  sections.push({
    number: String(sectionNum++),
    title: 'General Provisions',
    content: generateGeneralProvisions(),
    is_standard: true
  })

  if (data.special_conditions && data.special_conditions.length > 0) {
    sections.push({
      number: String(sectionNum++),
      title: 'Special Conditions',
      content: data.special_conditions.map((c, i) => (i + 1) + '. ' + c).join('\n'),
      is_standard: false
    })
  }

  return sections
}

function generatePreamble(data: DrafterInput): string {
  const partyList = data.parties.map(p => p.name + ' (' + p.role + ')').join(', ')
  return 'This ' + generateContractTitle(data) + ' (the "Agreement") is entered into as of ' + (data.effective_date || '[Effective Date]') + ' by and between ' + partyList + '. Each party referred to individually as a "Party" and collectively as the "Parties."'
}

function generateDefinitions(data: DrafterInput): string {
  const defs: string[] = []
  defs.push('"Business Day" means any day other than a Saturday, Sunday, or public holiday in ' + data.jurisdiction + '.')
  defs.push('"Confidential Information" means all non-public information disclosed by one Party to another in connection with this Agreement.')
  defs.push('"Effective Date" means the date first written above.')
  if (data.contract_type.toLowerCase().includes('service') || data.contract_type.toLowerCase() === 'sla') {
    defs.push('"Services" means the services to be performed by Service Provider as described in Schedule A.')
    defs.push('"Deliverables" means all work product, documents, and materials produced under this Agreement.')
  }
  if (data.contract_type.toLowerCase() === 'licensing' || data.contract_type.toLowerCase() === 'nda') {
    defs.push('"Licensed Material" means the intellectual property or materials licensed under this Agreement.')
  }
  return defs.join('\n\n')
}

function generateScopeSection(data: DrafterInput): string {
  const scopeTerm = data.key_terms.find(t => t.field.toLowerCase().includes('scope') || t.field.toLowerCase().includes('description'))
  if (scopeTerm) {
    return 'The scope of this Agreement is defined as follows: ' + scopeTerm.value + '. Any work outside this scope requires a written change order signed by both Parties.'
  }
  return 'The scope of this Agreement shall be as described in Schedule A attached hereto. Any modifications to the scope must be agreed upon in writing by both Parties through a formal change order process.'
}

function generateWarrantiesSection(data: DrafterInput): string {
  const warranties: string[] = []
  warranties.push('Each Party represents and warrants that:')
  warranties.push('(a) It has the full power and authority to enter into and perform this Agreement.')
  warranties.push('(b) This Agreement constitutes a valid and binding obligation enforceable in accordance with its terms.')
  warranties.push('(c) Its performance under this Agreement will not violate any applicable law or regulation.')
  if (data.contract_type.toLowerCase() === 'licensing' || data.contract_type.toLowerCase() === 'sales') {
    warranties.push('(d) It holds clear title to all materials, products, or intellectual property provided under this Agreement.')
    warranties.push('(e) All products and services will conform to the specifications set forth in this Agreement.')
  }
  return warranties.join('\n')
}

function generateTerminationSection(data: DrafterInput): string {
  const clauses: string[] = []
  clauses.push('Either party may terminate this Agreement:')
  clauses.push('(a) For convenience upon [Notice Period] days prior written notice to the other Party.')
  clauses.push('(b) Immediately upon written notice if the other Party materially breaches this Agreement and fails to cure such breach within thirty (30) days of receiving written notice thereof.')
  clauses.push('(c) Immediately if the other Party becomes insolvent, files for bankruptcy, or ceases operations.')
  clauses.push('Upon termination, all outstanding payments shall become due within fifteen (15) days. Sections relating to Confidentiality, Limitation of Liability, and Governing Law shall survive termination.')
  return clauses.join('\n')
}

function generateGeneralProvisions(): string {
  const provisions: string[] = []
  provisions.push('Entire Agreement: This Agreement constitutes the entire agreement between the Parties and supersedes all prior negotiations, representations, and agreements.')
  provisions.push('Amendment: No modification of this Agreement shall be effective unless in writing and signed by both Parties.')
  provisions.push('Severability: If any provision is held invalid, the remaining provisions shall continue in full force and effect.')
  provisions.push('Waiver: Failure to enforce any provision shall not constitute a waiver of future enforcement.')
  provisions.push('Assignment: Neither party may assign this Agreement without the prior written consent of the other Party, except in connection with a merger or acquisition.')
  provisions.push('Notices: All notices shall be in writing and delivered to the addresses specified herein.')
  provisions.push('Counterparts: This Agreement may be executed in counterparts, each of which shall be deemed an original.')
  return provisions.join('\n\n')
}

function generatePartyClauses(data: DrafterInput, _rng: () => number): PartyClause[] {
  return data.parties.map(party => {
    const obligations: string[] = []
    const rights: string[] = []

    obligations.push('Perform all duties and responsibilities as set forth in this Agreement')
    obligations.push('Comply with all applicable laws and regulations in ' + (party.jurisdiction || data.jurisdiction))
    obligations.push('Maintain confidentiality of all proprietary information received')

    rights.push('Receive timely payment/compensation as specified herein')
    rights.push('Terminate this Agreement under the conditions specified in the Termination section')
    rights.push('Seek legal remedies for breach of this Agreement')

    if (party.role === 'seller' || party.role === 'licensor' || party.role === 'lessor') {
      obligations.push('Deliver goods/services in accordance with agreed specifications and timelines')
      obligations.push('Provide warranty support as defined in this Agreement')
      rights.push('Receive payment within agreed terms')
      rights.push('Retain intellectual property rights not expressly transferred')
    }
    if (party.role === 'buyer' || party.role === 'licensee' || party.role === 'lessee') {
      obligations.push('Make payments in accordance with the Payment Terms section')
      obligations.push('Provide necessary access and cooperation for performance')
      rights.push('Receive goods/services meeting agreed specifications')
      rights.push('Reject non-conforming deliverables within [Inspection Period] days')
    }

    return {
      party_name: party.name,
      role: party.role,
      obligations,
      rights
    }
  })
}

function identifyMissingTerms(data: DrafterInput, _rng: () => number): string[] {
  const missing: string[] = []
  const termFields = data.key_terms.map(t => t.field.toLowerCase())

  const standardTerms = ['payment', 'term', 'termination', 'liability cap', 'governing law', 'confidentiality period', 'notice period']
  for (const std of standardTerms) {
    if (!termFields.some(f => f.includes(std))) {
      missing.push(std.charAt(0).toUpperCase() + std.slice(1))
    }
  }

  if (!data.effective_date) {
    missing.push('Effective Date')
  }
  if (!data.duration_months && !termFields.some(f => f.includes('term') || f.includes('duration'))) {
    missing.push('Contract Duration')
  }

  return missing
}

function identifyDraftRisks(data: DrafterInput, _rng: () => number): string[] {
  const risks: string[] = []

  if (!data.key_terms.some(t => t.field.toLowerCase().includes('liability'))) {
    risks.push('No liability cap defined - unlimited exposure risk')
  }
  if (!data.key_terms.some(t => t.field.toLowerCase().includes('termination'))) {
    risks.push('No termination clause specified - exit strategy undefined')
  }
  if (!data.key_terms.some(t => t.field.toLowerCase().includes('ip') || t.field.toLowerCase().includes('intellectual'))) {
    risks.push('Intellectual property ownership not addressed')
  }
  if (data.parties.length > 3) {
    risks.push('Multi-party agreement increases coordination complexity and joint liability risk')
  }
  if (!data.jurisdiction) {
    risks.push('No governing law specified - dispute resolution jurisdiction unclear')
  }

  return risks
}

// ==================== Tool 2: Clause Analyzer ====================

function analyzeClauses(input: ClauseAnalyzerInput): ClauseAnalyzerResult {
  const clauses = extractClausesFromText(input.contract_text)
  const riskAnnotations: RiskAnnotation[] = []
  const modificationSuggestions: ModificationSuggestion[] = []
  const threshold = input.risk_threshold || 'medium'

  for (const clause of clauses) {
    const risks = assessClauseRisks(clause, input.focus_areas)
    riskAnnotations.push(...risks)

    if (clause.ambiguities.length > 0) {
      for (const ambiguity of clause.ambiguities) {
        modificationSuggestions.push({
          clause_ref: clause.clause_number,
          current_issue: ambiguity,
          suggested_text: 'Define measurable criteria for: ' + ambiguity.replace('Contains vague term: ', '').replace(' - consider defining with measurable criteria', ''),
          priority: clause.importance === 'critical' ? 'must_fix' : 'recommended'
        })
      }
    }
  }

  const filteredAnnotations = filterByThreshold(riskAnnotations, threshold)
  const overallScore = calculateClauseScore(clauses, filteredAnnotations)

  return {
    clauses,
    risk_annotations: filteredAnnotations,
    modification_suggestions: modificationSuggestions,
    overall_score: overallScore,
    summary: generateClauseSummary(clauses, filteredAnnotations, overallScore)
  }
}

function assessClauseRisks(clause: ExtractedClause, focusAreas: string[]): RiskAnnotation[] {
  const annotations: RiskAnnotation[] = []
  const lower = clause.text.toLowerCase()

  if (focusAreas.length === 0 || focusAreas.some(f => lower.includes(f.toLowerCase()))) {
    if (lower.includes('unlimited') || lower.includes('irrevocable')) {
      annotations.push({
        clause_ref: clause.clause_number,
        risk_level: 'high',
        risk_type: 'unbounded_obligation',
        description: 'Clause contains unbounded or irrevocable commitment',
        suggested_mitigation: 'Add reasonable caps, time limits, or termination conditions'
      })
    }

    if (lower.includes('penalty') || lower.includes('liquidated damages')) {
      annotations.push({
        clause_ref: clause.clause_number,
        risk_level: 'medium',
        risk_type: 'penalty_exposure',
        description: 'Penalty or liquidated damages clause detected',
        suggested_mitigation: 'Verify penalty amounts are proportionate and enforceable under governing law'
      })
    }

    if (lower.includes('exclusive') || lower.includes('sole discretion')) {
      annotations.push({
        clause_ref: clause.clause_number,
        risk_level: 'medium',
        risk_type: 'unilateral_control',
        description: 'Clause grants exclusive rights or sole discretion to one party',
        suggested_mitigation: 'Add mutual consent requirements or objective criteria for discretion'
      })
    }

    if (lower.includes('automatic') && lower.includes('renew')) {
      annotations.push({
        clause_ref: clause.clause_number,
        risk_level: 'low',
        risk_type: 'auto_renewal',
        description: 'Automatic renewal clause detected',
        suggested_mitigation: 'Ensure adequate notice period for non-renewal is specified'
      })
    }

    if (clause.category === 'liability' && !lower.includes('cap') && !lower.includes('limit')) {
      annotations.push({
        clause_ref: clause.clause_number,
        risk_level: 'high',
        risk_type: 'uncapped_liability',
        description: 'Liability clause without cap or limitation',
        suggested_mitigation: 'Insert a reasonable liability cap (e.g., 12 months of fees paid)'
      })
    }
  }

  return annotations
}

function filterByThreshold(annotations: RiskAnnotation[], threshold: string): RiskAnnotation[] {
  const levelMap: Record<string, string[]> = {
    high: ['high'],
    medium: ['high', 'medium'],
    low: ['high', 'medium', 'low']
  }
  const allowed = levelMap[threshold] || levelMap['medium']
  return annotations.filter(a => allowed.includes(a.risk_level))
}

function calculateClauseScore(clauses: ExtractedClause[], annotations: RiskAnnotation[]): number {
  if (clauses.length === 0) return 100
  const highRisks = annotations.filter(a => a.risk_level === 'high').length
  const medRisks = annotations.filter(a => a.risk_level === 'medium').length
  const lowRisks = annotations.filter(a => a.risk_level === 'low').length
  const penalty = highRisks * 15 + medRisks * 8 + lowRisks * 3
  return Math.max(0, 100 - penalty)
}

function generateClauseSummary(clauses: ExtractedClause[], annotations: RiskAnnotation[], score: number): string {
  const critical = clauses.filter(c => c.importance === 'critical').length
  const highRisks = annotations.filter(a => a.risk_level === 'high').length
  return 'Analyzed ' + clauses.length + ' clauses (' + critical + ' critical). Found ' + annotations.length + ' risk annotations (' + highRisks + ' high-risk). Overall clause health score: ' + score + '/100.'
}

// ==================== Tool 3: Obligation Tracker ====================

function trackObligations(input: ObligationTrackerInput): ObligationTrackerResult {
  const alertDays = input.alert_days_before ?? 30
  const obligations = input.contract_obligations
  const now = Date.now()

  for (const ob of obligations) {
    obligationStore.set(ob.obligation_id, ob)
  }

  const statusSummary: ObligationStatusSummary = {
    total: obligations.length,
    completed: obligations.filter(o => o.status === 'completed').length,
    pending: obligations.filter(o => o.status === 'pending').length,
    in_progress: obligations.filter(o => o.status === 'in_progress').length,
    overdue: obligations.filter(o => o.status === 'overdue').length,
    waived: obligations.filter(o => o.status === 'waived').length
  }

  const upcomingDeadlines: ObligationAlert[] = []
  const overdueItems: ObligationAlert[] = []

  for (const ob of obligations) {
    if (ob.status === 'completed' || ob.status === 'waived') continue

    const deadline = new Date(ob.deadline).getTime()
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) {
      overdueItems.push({
        obligation_id: ob.obligation_id,
        description: ob.description,
        responsible_party: ob.responsible_party,
        deadline: ob.deadline,
        days_remaining: daysRemaining,
        urgency: 'critical'
      })
    } else if (daysRemaining <= alertDays) {
      const urgency: ObligationAlert['urgency'] = daysRemaining <= 7 ? 'critical' : daysRemaining <= 14 ? 'warning' : 'info'
      upcomingDeadlines.push({
        obligation_id: ob.obligation_id,
        description: ob.description,
        responsible_party: ob.responsible_party,
        deadline: ob.deadline,
        days_remaining: daysRemaining,
        urgency
      })
    }
  }

  upcomingDeadlines.sort((a, b) => a.days_remaining - b.days_remaining)
  overdueItems.sort((a, b) => a.days_remaining - b.days_remaining)

  const partyWorkload = calculatePartyWorkload(obligations, input.counterparties)
  const complianceRate = statusSummary.total > 0
    ? (statusSummary.completed / statusSummary.total) * 100
    : 0

  return {
    obligations,
    status_summary: statusSummary,
    upcoming_deadlines: upcomingDeadlines,
    overdue_items: overdueItems,
    party_workload: partyWorkload,
    compliance_rate: complianceRate
  }
}

function calculatePartyWorkload(obligations: ObligationRecord[], counterparties: string[]): PartyWorkload[] {
  return counterparties.map(party => {
    const partyObs = obligations.filter(o => o.responsible_party === party)
    const pending = partyObs.filter(o => o.status === 'pending' || o.status === 'in_progress').length
    const overdue = partyObs.filter(o => o.status === 'overdue').length
    const criticalPending = partyObs.filter(o => o.priority === 'critical' && o.status !== 'completed').length
    const riskScore = Math.min(100, overdue * 25 + criticalPending * 15 + pending * 5)

    return {
      party,
      total_obligations: partyObs.length,
      pending_count: pending,
      overdue_count: overdue,
      risk_score: riskScore
    }
  })
}

// ==================== Tool 4: Renewal Manager ====================

function manageRenewals(input: RenewalManagerInput): RenewalManagerResult {
  const strategy = input.strategy || 'balanced'
  const now = Date.now()
  const renewalSchedule: RenewalScheduleItem[] = []
  const priorityActions: RenewalAction[] = []
  const negotiationPoints: NegotiationPoint[] = []
  const costProjections: CostProjection[] = []

  for (const contract of input.contract_portfolio) {
    const endDate = new Date(contract.end_date).getTime()
    const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    const noticeDeadline = new Date(contract.end_date)
    noticeDeadline.setDate(noticeDeadline.getDate() - contract.notice_period_days)
    const daysUntilNotice = Math.ceil((noticeDeadline.getTime() - now) / (1000 * 60 * 60 * 24))

    let status: RenewalScheduleItem['status'] = 'upcoming'
    if (daysUntilExpiry < 0) status = 'expired'
    else if (daysUntilNotice <= 0) status = 'urgent'
    else if (daysUntilNotice <= 30) status = 'action_needed'

    renewalSchedule.push({
      contract_id: contract.contract_id,
      title: contract.title,
      current_end_date: contract.end_date,
      renewal_deadline: noticeDeadline.toISOString().split('T')[0],
      action_required_by: new Date(now + Math.max(daysUntilNotice, 0) * 86400000).toISOString().split('T')[0],
      days_until_action: daysUntilNotice,
      renewal_type: contract.renewal_type,
      status
    })

    if (status === 'urgent' || status === 'action_needed') {
      const actionType: RenewalAction['action_type'] = status === 'urgent' ? 'send_notice' : 'initiate_review'
      priorityActions.push({
        contract_id: contract.contract_id,
        action_type: actionType,
        deadline: noticeDeadline.toISOString().split('T')[0],
        owner: contract.counterparty,
        priority: status === 'urgent' ? 'critical' : 'high',
        details: status === 'urgent'
          ? 'Notice period has passed - immediate action required to avoid auto-renewal or expiration'
          : 'Initiate renewal review process - notice deadline approaching'
      })
    }

    const points = generateNegotiationPoints(contract, strategy)
    negotiationPoints.push(...points)

    const increasePct = strategy === 'aggressive' ? 5 + Math.random() * 10 : strategy === 'conservative' ? -2 + Math.random() * 5 : 2 + Math.random() * 5
    costProjections.push({
      contract_id: contract.contract_id,
      current_value: contract.value,
      projected_value: Math.round(contract.value * (1 + increasePct / 100)),
      increase_percentage: Math.round(increasePct * 100) / 100,
      currency: contract.currency
    })
  }

  renewalSchedule.sort((a, b) => a.days_until_action - b.days_until_action)
  priorityActions.sort((a, b) => {
    const pMap: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return pMap[a.priority] - pMap[b.priority]
  })

  const riskAlerts: string[] = []
  const expiredCount = renewalSchedule.filter(r => r.status === 'expired').length
  const urgentCount = renewalSchedule.filter(r => r.status === 'urgent').length
  if (expiredCount > 0) riskAlerts.push(expiredCount + ' contract(s) have expired without renewal action')
  if (urgentCount > 0) riskAlerts.push(urgentCount + ' contract(s) require immediate renewal notice')
  const autoRenewCount = input.contract_portfolio.filter(c => c.renewal_type === 'auto').length
  if (autoRenewCount > 0) riskAlerts.push(autoRenewCount + ' contract(s) have auto-renewal - verify if renewal is desired')

  return {
    renewal_schedule: renewalSchedule,
    priority_actions: priorityActions,
    negotiation_points: negotiationPoints,
    risk_alerts: riskAlerts,
    cost_projections: costProjections
  }
}

function generateNegotiationPoints(contract: ContractPortfolioEntry, strategy: string): NegotiationPoint[] {
  const points: NegotiationPoint[] = []

  if (contract.value > 100000) {
    points.push({
      contract_id: contract.contract_id,
      point: 'Volume discount for high-value contract',
      leverage: 'strong',
      suggested_approach: strategy === 'aggressive' ? 'Demand 15-20% reduction' : 'Request 5-10% reduction with commitment to longer term'
    })
  }

  if (contract.renewal_type === 'auto') {
    points.push({
      contract_id: contract.contract_id,
      point: 'Auto-renewal clause modification',
      leverage: 'moderate',
      suggested_approach: 'Negotiate removal of auto-renewal or extend notice period to 90 days'
    })
  }

  points.push({
    contract_id: contract.contract_id,
    point: 'Price escalation cap',
    leverage: strategy === 'conservative' ? 'weak' : 'moderate',
    suggested_approach: 'Cap annual increases at CPI or 3%, whichever is lower'
  })

  return points
}

// ==================== Tool 5: Risk Assessor ====================

function assessRisk(input: RiskAssessorInput): RiskAssessorResult {
  const rng = seededRandom(input.industry + String(input.financial_exposure))
  const currency = input.currency || 'USD'
  const counterpartyRisk = input.counterparty_risk || 'medium'
  const marketVolatility = input.market_volatility || 'medium'

  const categories: RiskCategory[] = []

  const liabilityScore = assessLiabilityRisk(input.contract_terms, rng)
  categories.push({
    category: 'Liability & Indemnification',
    score: liabilityScore,
    level: scoreToLevel(liabilityScore),
    factors: [
      'Unlimited liability exposure detected: ' + (liabilityScore > 60 ? 'Yes' : 'No'),
      'Indemnification obligations present: ' + (input.contract_terms.some(t => t.toLowerCase().includes('indemnif')) ? 'Yes' : 'No'),
      'Insurance requirements: ' + (input.contract_terms.some(t => t.toLowerCase().includes('insurance')) ? 'Defined' : 'Not specified')
    ]
  })

  const financialScore = assessFinancialRisk(input, rng)
  categories.push({
    category: 'Financial Exposure',
    score: financialScore,
    level: scoreToLevel(financialScore),
    factors: [
      'Total financial exposure: ' + currency + ' ' + input.financial_exposure.toLocaleString(),
      'Payment terms risk: ' + (financialScore > 50 ? 'Elevated' : 'Manageable'),
      'Counterparty credit risk: ' + counterpartyRisk
    ]
  })

  const operationalScore = assessOperationalRisk(input.contract_terms, rng)
  categories.push({
    category: 'Operational Risk',
    score: operationalScore,
    level: scoreToLevel(operationalScore),
    factors: [
      'Performance obligations complexity: ' + (operationalScore > 50 ? 'High' : 'Moderate'),
      'Dependency on third parties: ' + (input.contract_terms.some(t => t.toLowerCase().includes('subcontractor') || t.toLowerCase().includes('third party')) ? 'Yes' : 'No'),
      'Service level requirements: ' + (input.contract_terms.some(t => t.toLowerCase().includes('sla') || t.toLowerCase().includes('uptime')) ? 'Defined' : 'Not specified')
    ]
  })

  const legalScore = assessLegalRisk(input.contract_terms, rng)
  categories.push({
    category: 'Legal & Regulatory',
    score: legalScore,
    level: scoreToLevel(legalScore),
    factors: [
      'Governing law clarity: ' + (input.contract_terms.some(t => t.toLowerCase().includes('governing law') || t.toLowerCase().includes('jurisdiction')) ? 'Defined' : 'Unclear'),
      'Dispute resolution mechanism: ' + (input.contract_terms.some(t => t.toLowerCase().includes('arbitration') || t.toLowerCase().includes('mediation')) ? 'Specified' : 'Not specified'),
      'Regulatory compliance requirements: ' + (legalScore > 50 ? 'Complex' : 'Standard')
    ]
  })

  const marketScore = assessMarketRisk(marketVolatility, rng)
  categories.push({
    category: 'Market & External',
    score: marketScore,
    level: scoreToLevel(marketScore),
    factors: [
      'Market volatility exposure: ' + marketVolatility,
      'Force majeure coverage: ' + (input.contract_terms.some(t => t.toLowerCase().includes('force majeure')) ? 'Present' : 'Absent'),
      'Currency fluctuation risk: ' + (input.financial_exposure > 500000 ? 'Significant' : 'Limited')
    ]
  })

  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length
  )

  const mitigationRecommendations = generateMitigationRecommendations(categories, input)
  const exposureAnalysis = calculateExposureAnalysis(input, rng)
  const monitoringIndicators = generateMonitoringIndicators(categories)

  return {
    overall_risk_score: overallScore,
    risk_grade: scoreToGrade(overallScore),
    risk_categories: categories,
    mitigation_recommendations: mitigationRecommendations,
    exposure_analysis: exposureAnalysis,
    monitoring_indicators: monitoringIndicators
  }
}

function assessLiabilityRisk(terms: string[], rng: () => number): number {
  let score = 30 + Math.floor(rng() * 20)
  const text = terms.join(' ').toLowerCase()
  if (text.includes('unlimited liability')) score += 25
  if (text.includes('indemnif')) score += 10
  if (text.includes('consequential damages')) score += 15
  if (text.includes('cap') || text.includes('limitation')) score -= 15
  if (text.includes('insurance')) score -= 10
  return Math.min(100, Math.max(0, score))
}

function assessFinancialRisk(input: RiskAssessorInput, rng: () => number): number {
  let score = 25 + Math.floor(rng() * 20)
  if (input.financial_exposure > 1000000) score += 20
  else if (input.financial_exposure > 500000) score += 10
  if (input.counterparty_risk === 'high') score += 20
  else if (input.counterparty_risk === 'medium') score += 10
  const text = input.contract_terms.join(' ').toLowerCase()
  if (text.includes('payment upon completion')) score += 10
  if (text.includes('milestone payment')) score -= 10
  if (text.includes('letter of credit')) score -= 15
  return Math.min(100, Math.max(0, score))
}

function assessOperationalRisk(terms: string[], rng: () => number): number {
  let score = 20 + Math.floor(rng() * 20)
  const text = terms.join(' ').toLowerCase()
  if (text.includes('penalty')) score += 15
  if (text.includes('sla') || text.includes('uptime')) score += 10
  if (text.includes('subcontractor')) score += 10
  if (text.includes('acceptance criteria')) score -= 5
  if (text.includes('change order')) score -= 5
  return Math.min(100, Math.max(0, score))
}

function assessLegalRisk(terms: string[], rng: () => number): number {
  let score = 20 + Math.floor(rng() * 15)
  const text = terms.join(' ').toLowerCase()
  if (!text.includes('governing law')) score += 15
  if (!text.includes('dispute') && !text.includes('arbitration')) score += 10
  if (text.includes('regulatory') || text.includes('compliance')) score += 10
  if (text.includes('waiver')) score += 5
  return Math.min(100, Math.max(0, score))
}

function assessMarketRisk(volatility: string, rng: () => number): number {
  const base = volatility === 'high' ? 60 : volatility === 'medium' ? 40 : 20
  return Math.min(100, Math.max(0, base + Math.floor(rng() * 15) - 5))
}

function scoreToLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical'
  if (score >= 55) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score <= 25) return 'A'
  if (score <= 40) return 'B'
  if (score <= 60) return 'C'
  if (score <= 80) return 'D'
  return 'F'
}

function generateMitigationRecommendations(categories: RiskCategory[], input: RiskAssessorInput): MitigationRecommendation[] {
  const recommendations: MitigationRecommendation[] = []
  let priority = 1

  for (const cat of categories) {
    if (cat.score >= 55) {
      if (cat.category === 'Liability & Indemnification') {
        recommendations.push({
          target_category: cat.category,
          recommendation: 'Negotiate a liability cap at 12-24 months of contract value',
          impact: 'high',
          effort: 'medium',
          priority: priority++
        })
        recommendations.push({
          target_category: cat.category,
          recommendation: 'Require comprehensive insurance coverage from counterparty',
          impact: 'medium',
          effort: 'low',
          priority: priority++
        })
      }
      if (cat.category === 'Financial Exposure') {
        recommendations.push({
          target_category: cat.category,
          recommendation: 'Structure payments on milestone basis with retainage',
          impact: 'high',
          effort: 'medium',
          priority: priority++
        })
        recommendations.push({
          target_category: cat.category,
          recommendation: 'Obtain parent company guarantee or letter of credit',
          impact: 'high',
          effort: 'high',
          priority: priority++
        })
      }
      if (cat.category === 'Operational Risk') {
        recommendations.push({
          target_category: cat.category,
          recommendation: 'Define clear acceptance criteria and change management process',
          impact: 'medium',
          effort: 'medium',
          priority: priority++
        })
      }
      if (cat.category === 'Legal & Regulatory') {
        recommendations.push({
          target_category: cat.category,
          recommendation: 'Specify governing law and arbitration venue explicitly',
          impact: 'medium',
          effort: 'low',
          priority: priority++
        })
      }
    }
  }

  if (input.financial_exposure > 500000) {
    recommendations.push({
      target_category: 'General',
      recommendation: 'Conduct enhanced due diligence on counterparty financial stability',
      impact: 'high',
      effort: 'medium',
      priority: priority++
    })
  }

  return recommendations
}

function calculateExposureAnalysis(input: RiskAssessorInput, rng: () => number): ExposureAnalysis {
  const maxExposure = input.financial_exposure * (1.2 + rng() * 0.3)
  const expectedExposure = input.financial_exposure * (0.3 + rng() * 0.2)
  const worstCase = input.financial_exposure * (1.5 + rng() * 0.5)

  return {
    max_exposure: Math.round(maxExposure),
    expected_exposure: Math.round(expectedExposure),
    worst_case_exposure: Math.round(worstCase),
    currency: input.currency || 'USD',
    confidence_level: 0.85 + Math.round(rng() * 10) / 100
  }
}

function generateMonitoringIndicators(categories: RiskCategory[]): string[] {
  const indicators: string[] = []
  for (const cat of categories) {
    if (cat.score >= 55) {
      indicators.push(cat.category + ' score above threshold (' + cat.score + '/100) - requires monthly review')
    }
  }
  indicators.push('Counterparty financial health - quarterly credit check')
  indicators.push('Contract performance metrics - monthly SLA tracking')
  indicators.push('Regulatory changes in applicable jurisdiction - ongoing monitoring')
  return indicators
}

// ==================== Tool 6: Compliance Checker ====================

function checkCompliance(input: ComplianceCheckerInput): ComplianceCheckerResult {
  const gaps: ComplianceGap[] = []
  const requiredRevisions: RequiredRevision[] = []
  const contractText = input.contract_clauses.join('\n').toLowerCase()

  let compliantCount = 0
  for (const requirement of input.regulatory_requirements) {
    const reqLower = requirement.toLowerCase()
    const isCompliant = contractText.includes(reqLower) || isSemanticallyCovered(contractText, reqLower)

    if (isCompliant) {
      compliantCount++
      gaps.push({
        requirement,
        status: 'compliant',
        gap_description: 'Requirement is addressed in contract clauses',
        severity: 'minor'
      })
    } else {
      const partialMatch = checkPartialCompliance(contractText, reqLower)
      if (partialMatch) {
        gaps.push({
          requirement,
          status: 'partial',
          gap_description: 'Requirement partially addressed - additional specificity needed',
          severity: 'major'
        })
      } else {
        gaps.push({
          requirement,
          status: 'non_compliant',
          gap_description: 'Requirement not addressed in current contract clauses',
          severity: 'critical'
        })

        requiredRevisions.push({
          clause_index: input.contract_clauses.length,
          current_text: '[Not Present]',
          required_text: 'Add clause addressing: ' + requirement,
          rationale: 'Required for compliance with ' + (input.compliance_framework || 'applicable regulations'),
          deadline_urgency: 'before_execution'
        })
      }
    }
  }

  const frameworkCoverage: FrameworkCoverage[] = []
  if (input.compliance_framework) {
    const covered = compliantCount
    const total = input.regulatory_requirements.length
    frameworkCoverage.push({
      framework: input.compliance_framework,
      covered,
      total,
      percentage: total > 0 ? Math.round((covered / total) * 100) : 0
    })
  }

  const complianceScore = input.regulatory_requirements.length > 0
    ? Math.round((compliantCount / input.regulatory_requirements.length) * 100)
    : 100

  const riskImplications: string[] = []
  const criticalGaps = gaps.filter(g => g.severity === 'critical').length
  if (criticalGaps > 0) {
    riskImplications.push(criticalGaps + ' critical compliance gap(s) - contract execution not recommended')
  }
  if (complianceScore < 50) {
    riskImplications.push('Overall compliance below 50% - significant legal exposure')
  }
  if (input.jurisdiction && criticalGaps > 0) {
    riskImplications.push('Non-compliance with ' + input.jurisdiction + ' regulations may result in penalties')
  }

  return {
    compliance_score: complianceScore,
    compliant_count: compliantCount,
    gaps,
    required_revisions: requiredRevisions,
    framework_coverage: frameworkCoverage,
    risk_implications: riskImplications
  }
}

function isSemanticallyCovered(contractText: string, requirement: string): boolean {
  const semanticMap: Record<string, string[]> = {
    'data protection': ['privacy', 'personal data', 'gdpr', 'data processing', 'data security'],
    'anti-bribery': ['anti-corruption', 'bribery', 'ethical conduct', 'gift policy'],
    'intellectual property': ['ip ownership', 'patent', 'trademark', 'copyright', 'license'],
    'termination': ['terminate', 'termination', 'cancel', 'expiration'],
    'confidentiality': ['confidential', 'non-disclosure', 'proprietary', 'trade secret'],
    'payment': ['compensation', 'fee', 'price', 'invoice', 'remuneration'],
    'liability': ['indemnif', 'warrant', 'guarantee', 'limitation of liability'],
    'governing law': ['jurisdiction', 'applicable law', 'governed by', 'venue']
  }

  const keywords = semanticMap[requirement] || []
  return keywords.some(kw => contractText.includes(kw))
}

function checkPartialCompliance(contractText: string, requirement: string): boolean {
  const words = requirement.split(/\s+/).filter(w => w.length > 3)
  const matchCount = words.filter(w => contractText.includes(w)).length
  return matchCount > 0 && matchCount < words.length
}

// ==================== Tool 7: Amendment Analyzer ====================

function analyzeAmendments(input: AmendmentInput): AmendmentAnalyzerResult {
  const depth = input.analysis_depth || 'standard'
  const impactAssessments: ImpactAssessment[] = []
  const conflictAnalysis: AmendmentConflict[] = []
  const recommendations: AmendmentRecommendation[] = []

  for (let i = 0; i < input.proposed_changes.length; i++) {
    const change = input.proposed_changes[i]
    const impact = assessAmendmentImpact(change, input.original_contract, depth)
    impactAssessments.push({ change_index: i, ...impact })

    const recommendation = generateAmendmentRecommendation(change, impact, depth)
    recommendations.push({ change_index: i, ...recommendation })
  }

  for (let i = 0; i < input.proposed_changes.length; i++) {
    for (let j = i + 1; j < input.proposed_changes.length; j++) {
      const conflict = detectConflict(input.proposed_changes[i], input.proposed_changes[j], i, j)
      if (conflict) {
        conflictAnalysis.push(conflict)
      }
    }
  }

  const overallImpactScore = impactAssessments.length > 0
    ? Math.round(impactAssessments.reduce((sum, a) => sum + (a.impact_level === 'high' ? 75 : a.impact_level === 'medium' ? 50 : 25), 0) / impactAssessments.length)
    : 0

  const impactLabel = overallImpactScore > 66 ? 'high' : overallImpactScore > 33 ? 'medium' : 'low'
  const summary = 'Analyzed ' + input.proposed_changes.length + ' proposed change(s) with ' + conflictAnalysis.length + ' conflict(s) detected. Overall impact score: ' + overallImpactScore + '/100 (' + impactLabel + ' impact).'

  return {
    impact_assessment: impactAssessments,
    conflict_analysis: conflictAnalysis,
    recommendations,
    overall_impact_score: overallImpactScore,
    summary
  }
}

function assessAmendmentImpact(change: ProposedChange, originalContract: string, depth: string): Omit<ImpactAssessment, 'change_index'> {
  const affectedSections: string[] = []
  const legalImplications: string[] = []
  const financialImplications: string[] = []

  let impactLevel: 'high' | 'medium' | 'low' = 'low'

  if (change.change_type === 'deletion' || change.change_type === 'replacement') {
    impactLevel = 'high'
  } else if (change.change_type === 'modification') {
    impactLevel = 'medium'
  }

  const lowerProposed = change.proposed_text.toLowerCase()
  if (lowerProposed.includes('payment') || lowerProposed.includes('fee') || lowerProposed.includes('price')) {
    financialImplications.push('Direct financial impact - payment terms modified')
    impactLevel = 'high'
  }
  if (lowerProposed.includes('liability') || lowerProposed.includes('indemnif')) {
    legalImplications.push('Liability allocation changed - risk profile altered')
    impactLevel = 'high'
  }
  if (lowerProposed.includes('terminate') || lowerProposed.includes('termination')) {
    legalImplications.push('Termination rights modified - exit strategy affected')
    impactLevel = 'high'
  }
  if (lowerProposed.includes('term') || lowerProposed.includes('duration') || lowerProposed.includes('period')) {
    financialImplications.push('Contract duration change affects total value')
  }

  if (depth === 'deep') {
    const originalLower = originalContract.toLowerCase()
    if (change.original_text && !originalLower.includes(change.original_text.toLowerCase().substring(0, 30))) {
      legalImplications.push('Original text not found in contract - verify section reference accuracy')
    }
    affectedSections.push(change.section_ref)
    if (change.change_type === 'addition') {
      legalImplications.push('New clause may interact with existing provisions - cross-reference review needed')
    }
  }

  return {
    section_ref: change.section_ref,
    change_type: change.change_type,
    impact_level: impactLevel,
    affected_sections: affectedSections,
    legal_implications: legalImplications,
    financial_implications: financialImplications
  }
}

function generateAmendmentRecommendation(change: ProposedChange, impact: Omit<ImpactAssessment, 'change_index'>, _depth: string): Omit<AmendmentRecommendation, 'change_index'> {
  let action: AmendmentRecommendation['action'] = 'accept'
  let recommendation = ''
  const reasoningParts: string[] = []

  if (impact.impact_level === 'high') {
    if (impact.legal_implications.length > 0) {
      action = 'modify'
      recommendation = 'Legal review required before accepting this change'
      reasoningParts.push('High legal impact detected')
    }
    if (impact.financial_implications.length > 0) {
      action = 'modify'
      recommendation = recommendation || 'Financial impact assessment needed'
      reasoningParts.push('Significant financial implications')
    }
  } else if (impact.impact_level === 'medium') {
    action = 'modify'
    recommendation = 'Consider refining language to reduce ambiguity'
    reasoningParts.push('Moderate impact - optimization possible')
  } else {
    action = 'accept'
    recommendation = 'Low impact change - acceptable as proposed'
    reasoningParts.push('Minimal impact on contract')
  }

  if (change.change_type === 'deletion') {
    action = 'modify'
    recommendation = 'Deletion may create gaps - consider replacement instead'
    reasoningParts.push('Deletion risks creating unaddressed areas')
  }

  return {
    recommendation,
    action,
    reasoning: reasoningParts.join('; ') || 'Standard review complete'
  }
}

function detectConflict(changeA: ProposedChange, changeB: ProposedChange, idxA: number, idxB: number): AmendmentConflict | null {
  const textA = changeA.proposed_text.toLowerCase()
  const textB = changeB.proposed_text.toLowerCase()

  if (changeA.section_ref === changeB.section_ref && changeA.change_type === 'deletion' && changeB.change_type === 'modification') {
    return {
      change_a_index: idxA,
      change_b_index: idxB,
      conflict_type: 'dependency_breach',
      description: 'Deletion of section conflicts with modification of same section',
      resolution: 'Apply modification first, then evaluate if deletion is still needed'
    }
  }

  if ((textA.includes('increase') && textB.includes('decrease')) || (textA.includes('decrease') && textB.includes('increase'))) {
    if (textA.includes('payment') && textB.includes('payment')) {
      return {
        change_a_index: idxA,
        change_b_index: idxB,
        conflict_type: 'contradiction',
        description: 'Conflicting directions for payment terms',
        resolution: 'Reconcile payment direction - determine if increase or decrease is intended'
      }
    }
  }

  if (textA.includes('exclusive') && textB.includes('non-exclusive') && textA.includes('license') && textB.includes('license')) {
    return {
      change_a_index: idxA,
      change_b_index: idxB,
      conflict_type: 'contradiction',
      description: 'License exclusivity terms conflict',
      resolution: 'Clarify intended license model (exclusive vs non-exclusive)'
    }
  }

  return null
}

// ==================== Tool 8: Contract Summarizer ====================

function summarizeContract(input: SummarizerInput): SummarizerResult {
  const text = input.contract_text
  const focus = input.summary_focus
  const includeRedFlags = input.include_red_flags !== false
  const maxLength = input.max_length || 2000

  const contractType = detectContractType(text)
  const parties = extractParties(text)
  const keyTerms = extractKeyTerms(text)
  const criticalDates = extractCriticalDates(text)
  const financialSummary = extractFinancialSummary(text)
  const terminationConditions = extractTerminationConditions(text)
  const redFlags = includeRedFlags ? identifyRedFlags(text) : []

  const overallSummary = generateOverallSummary(text, focus, maxLength)

  return {
    contract_type: contractType,
    parties,
    key_terms: keyTerms,
    critical_dates: criticalDates,
    financial_summary: financialSummary,
    red_flags: redFlags,
    termination_conditions: terminationConditions,
    overall_summary: overallSummary,
    word_count: text.split(/\s+/).length
  }
}

function detectContractType(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('non-disclosure') || lower.includes('confidentiality agreement') || lower.includes('nda')) return 'Non-Disclosure Agreement'
  if (lower.includes('employment') || lower.includes('employee') || lower.includes('hire')) return 'Employment Agreement'
  if (lower.includes('service') && lower.includes('perform')) return 'Service Agreement'
  if (lower.includes('license') || lower.includes('licensor') || lower.includes('licensee')) return 'Licensing Agreement'
  if (lower.includes('purchase') || lower.includes('sale') || lower.includes('buyer') || lower.includes('seller')) return 'Sales/Purchase Agreement'
  if (lower.includes('lease') || lower.includes('lessor') || lower.includes('lessee') || lower.includes('rent')) return 'Lease Agreement'
  if (lower.includes('partnership') || lower.includes('partner')) return 'Partnership Agreement'
  if (lower.includes('consultant') || lower.includes('consulting')) return 'Consulting Agreement'
  if (lower.includes('vendor') || lower.includes('supplier')) return 'Vendor/Supplier Agreement'
  return 'General Agreement'
}

function extractParties(text: string): SummaryParty[] {
  const parties: SummaryParty[] = []
  const partyPatterns = [
    /between\s+(.+?)\s*\(?.*?\)?\s+and\s+(.+?)\s*[,\n]/i,
    /(?:party|parties)[:\s]+(.+?)(?:;|\n|$)/i,
    /(.+?)\s*\(\s*["']?(?:the\s+)?"?(buyer|seller|licensor|licensee|employer|employee|lessor|lessee|client|contractor)"?\s*\)/i
  ]

  for (const pattern of partyPatterns) {
    const match = text.match(pattern)
    if (match) {
      if (match.length >= 3 && match[2] && !match[2].includes('\n')) {
        parties.push({
          name: match[1].trim().substring(0, 50),
          role: 'primary',
          key_obligations: extractObligationsForParty(text, match[1].trim())
        })
        parties.push({
          name: match[2].trim().substring(0, 50),
          role: 'counterparty',
          key_obligations: extractObligationsForParty(text, match[2].trim())
        })
      }
      break
    }
  }

  if (parties.length === 0) {
    parties.push({
      name: 'Party A',
      role: 'primary',
      key_obligations: ['See full contract for obligations']
    })
    parties.push({
      name: 'Party B',
      role: 'counterparty',
      key_obligations: ['See full contract for obligations']
    })
  }

  return parties
}

function extractObligationsForParty(text: string, partyName: string): string[] {
  const obligations: string[] = []
  const sentences = text.split(/[.!?]+/)
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(partyName.toLowerCase().split(' ')[0].toLowerCase())) {
      if (sentence.toLowerCase().includes('shall') || sentence.toLowerCase().includes('must') || sentence.toLowerCase().includes('agrees to')) {
        obligations.push(sentence.trim().substring(0, 100))
      }
    }
  }
  return obligations.slice(0, 3)
}

function extractKeyTerms(text: string): SummaryTerm[] {
  const terms: SummaryTerm[] = []
  const lower = text.toLowerCase()

  const termPatterns: Array<{ pattern: RegExp; termName: string; significance: SummaryTerm['significance'] }> = [
    { pattern: /(?:term|duration|period)\s*(?:of)?\s*(\d+\s*(?:year|month|day)s?)/i, termName: 'Contract Term', significance: 'critical' },
    { pattern: /(?:total\s*)?(?:value|amount|price|fee|compensation)\s*(?:of)?s*[$€£]?\s*([\d,]+(?:\.\d{2})?)/i, termName: 'Total Value', significance: 'critical' },
    { pattern: /(?:payment\s*terms?|net)\s*(\d+\s*days)/i, termName: 'Payment Terms', significance: 'important' },
    { pattern: /(?:governing\s*law|governed\s*by)\s*(?:the\s*)?(?:laws?\s*of)?\s*(.+?)(?:\.|,|\n)/i, termName: 'Governing Law', significance: 'important' },
    { pattern: /(?:notice\s*period)\s*(?:of)?\s*(\d+\s*(?:day|month)s?)/i, termName: 'Notice Period', significance: 'important' },
    { pattern: /(?:liability\s*cap|cap\s*on\s*liability)\s*(?:of)?\s*[$€£]?\s*([\d,]+)/i, termName: 'Liability Cap', significance: 'critical' }
  ]

  for (const tp of termPatterns) {
    const match = text.match(tp.pattern)
    if (match) {
      terms.push({
        term: tp.termName,
        value: match[1] ? match[1].trim() : match[0].trim().substring(0, 50),
        significance: tp.significance
      })
    }
  }

  return terms
}

function extractCriticalDates(text: string): CriticalDate[] {
  const dates: CriticalDate[] = []
  const datePatterns: Array<{ pattern: RegExp; event: string; action: string }> = [
    { pattern: /(?:effective\s*date|commencement\s*date)[:\s]*(\w+\s+\d{1,2},?\s*\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, event: 'Effective Date', action: 'Contract becomes active' },
    { pattern: /(?:expiration|expiry|end\s*date)[:\s]*(\w+\s+\d{1,2},?\s*\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, event: 'Expiration Date', action: 'Renewal or termination decision required' },
    { pattern: /(?:first\s*payment|initial\s*payment|down\s*payment)[:\s]*(\w+\s+\d{1,2},?\s*\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, event: 'First Payment Due', action: 'Process initial payment' },
    { pattern: /(?:delivery\s*date|completion\s*date)[:\s]*(\w+\s+\d{1,2},?\s*\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, event: 'Delivery/Completion Date', action: 'Verify deliverables' }
  ]

  for (const dp of datePatterns) {
    const match = text.match(dp.pattern)
    if (match) {
      const dateStr = match[1].trim()
      const parsed = new Date(dateStr)
      if (!isNaN(parsed.getTime())) {
        dates.push({
          event: dp.event,
          date: dateStr,
          days_from_now: calculateDateDaysFromNow(dateStr),
          action_required: dp.action
        })
      }
    }
  }

  return dates
}

function extractFinancialSummary(text: string): FinancialSummary {
  const paymentSchedule: string[] = []
  const penaltyClauses: string[] = []
  const financialRisks: string[] = []

  const lower = text.toLowerCase()
  const valueMatch = text.match(/[$€£]\s*([\d,]+(?:\.\d{2})?)/)

  if (lower.includes('monthly payment') || lower.includes('monthly fee')) paymentSchedule.push('Monthly payment schedule')
  if (lower.includes('quarterly')) paymentSchedule.push('Quarterly payment schedule')
  if (lower.includes('annual') && lower.includes('payment')) paymentSchedule.push('Annual payment schedule')
  if (lower.includes('milestone')) paymentSchedule.push('Milestone-based payments')
  if (lower.includes('upon signing') || lower.includes('upon execution')) paymentSchedule.push('Upfront payment upon execution')
  if (paymentSchedule.length === 0) paymentSchedule.push('Payment schedule not explicitly defined')

  if (lower.includes('late payment') || lower.includes('interest on overdue')) penaltyClauses.push('Late payment interest clause')
  if (lower.includes('penalty')) penaltyClauses.push('Penalty clause present')
  if (lower.includes('liquidated damages')) penaltyClauses.push('Liquidated damages clause')

  if (lower.includes('unlimited liability')) financialRisks.push('Unlimited liability exposure')
  if (lower.includes('price escalation') || lower.includes('annual increase')) financialRisks.push('Price escalation risk')
  if (!lower.includes('payment terms') && !lower.includes('compensation')) financialRisks.push('Payment terms not clearly defined')

  return {
    total_value: valueMatch ? parseInt(valueMatch[1].replace(/,/g, '')) : undefined,
    currency: text.includes('€') ? 'EUR' : text.includes('£') ? 'GBP' : 'USD',
    payment_schedule: paymentSchedule,
    penalty_clauses: penaltyClauses,
    financial_risks: financialRisks
  }
}

function extractTerminationConditions(text: string): string[] {
  const conditions: string[] = []
  const lower = text.toLowerCase()

  if (lower.includes('terminate for convenience')) conditions.push('Termination for convenience allowed')
  if (lower.includes('terminate for cause') || lower.includes('material breach')) conditions.push('Termination for cause/material breach')
  if (lower.includes('insolvency') || lower.includes('bankruptcy')) conditions.push('Termination upon insolvency/bankruptcy')
  if (lower.includes('change of control')) conditions.push('Termination upon change of control')
  if (lower.includes('force majeure')) conditions.push('Termination for prolonged force majeure')
  if (conditions.length === 0) conditions.push('Standard termination provisions apply')

  return conditions
}

function identifyRedFlags(text: string): string[] {
  const flags: string[] = []
  const lower = text.toLowerCase()

  if (lower.includes('unlimited liability')) flags.push('Unlimited liability clause - no cap on damages')
  if (lower.includes('irrevocable')) flags.push('Irrevocable commitments detected')
  if (lower.includes('sole discretion') && !lower.includes('reasonable')) flags.push('Unilateral sole discretion without reasonableness standard')
  if (lower.includes('automatic renewal') && !lower.includes('notice')) flags.push('Auto-renewal without clear notice mechanism')
  if (!lower.includes('governing law') && !lower.includes('jurisdiction')) flags.push('No governing law clause - dispute resolution uncertain')
  if (lower.includes('waiver of jury trial')) flags.push('Jury trial waiver detected')
  if (lower.includes('assignment') && lower.includes('without consent')) flags.push('Assignment restrictions may limit flexibility')
  if (lower.includes('non-compete') || lower.includes('non-solicit')) flags.push('Non-compete/non-solicit restrictions present')

  return flags
}

function generateOverallSummary(text: string, focus: string, maxLength: number): string {
  const wordCount = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)

  let summary = ''
  const focusIntro: Record<string, string> = {
    full: 'This contract',
    financial: 'Financial analysis of this contract',
    obligations: 'Obligation analysis of this contract',
    risks: 'Risk assessment of this contract',
    key_dates: 'Key dates analysis of this contract',
    termination: 'Termination analysis of this contract'
  }

  summary = (focusIntro[focus] || 'This contract') + ' contains approximately ' + wordCount + ' words across ' + sentences.length + ' substantive provisions. '

  if (focus === 'financial') {
    summary += 'Key financial terms should be reviewed for payment schedule, total value, and penalty provisions. '
  } else if (focus === 'obligations') {
    summary += 'Primary obligations include performance standards, delivery requirements, and compliance duties. '
  } else if (focus === 'risks') {
    summary += 'Risk areas include liability exposure, termination rights, and regulatory compliance. '
  } else if (focus === 'key_dates') {
    summary += 'Critical dates include effective date, payment deadlines, and renewal windows. '
  } else if (focus === 'termination') {
    summary += 'Termination provisions define exit conditions, notice periods, and post-termination obligations. '
  }

  summary += 'A thorough legal review is recommended before execution.'

  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...'
  }

  return summary
}

// ==================== Format Functions ====================

function formatDrafterResult(result: DrafterResult): string {
  const lines: string[] = []
  lines.push('# Contract Draft: ' + result.title)
  lines.push('')
  lines.push('**Draft ID:** `' + result.draft_id + '`')
  lines.push('**Contract Type:** ' + result.contract_type)
  lines.push('**Jurisdiction:** Refer to governing law section')
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Table of Contents')
  lines.push('')
  for (const section of result.sections) {
    lines.push('- **' + section.number + '.** ' + section.title + (section.is_standard ? '' : ' *'))
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const section of result.sections) {
    lines.push('## ' + section.number + '. ' + section.title)
    lines.push('')
    lines.push(section.content)
    lines.push('')
  }

  if (result.party_clauses.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Party Obligations Summary')
    lines.push('')
    for (const pc of result.party_clauses) {
      lines.push('### ' + pc.party_name + ' (' + pc.role + ')')
      lines.push('')
      lines.push('**Obligations:**')
      for (const ob of pc.obligations) {
        lines.push('- ' + ob)
      }
      lines.push('')
      lines.push('**Rights:**')
      for (const r of pc.rights) {
        lines.push('- ' + r)
      }
      lines.push('')
    }
  }

  if (result.missing_terms.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('##  Missing Terms')
    lines.push('')
    for (const mt of result.missing_terms) {
      lines.push('-  ' + mt)
    }
    lines.push('')
  }

  if (result.risk_flags.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('##  Risk Flags')
    lines.push('')
    for (const rf of result.risk_flags) {
      lines.push('-  ' + rf)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')

  return lines.join('\n')
}

function formatClauseAnalysisResult(result: ClauseAnalyzerResult): string {
  const lines: string[] = []
  lines.push('# Clause Analysis Report')
  lines.push('')
  lines.push('## Overview')
  lines.push('')
  lines.push('- **Clauses Analyzed:** ' + result.clauses.length)
  lines.push('- **Risk Annotations:** ' + result.risk_annotations.length)
  lines.push('- **Modification Suggestions:** ' + result.modification_suggestions.length)
  lines.push('- **Overall Health Score:** ' + result.overall_score + '/100')
  lines.push('')

  if (result.clauses.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Extracted Clauses')
    lines.push('')
    for (const clause of result.clauses) {
      const importanceIcon = clause.importance === 'critical' ? '' : clause.importance === 'standard' ? '' : ''
      lines.push('### ' + importanceIcon + ' Clause ' + clause.clause_number + ': ' + clause.title)
      lines.push('')
      lines.push('> ' + clause.text.substring(0, 200) + (clause.text.length > 200 ? '...' : ''))
      lines.push('')
      lines.push('- **Category:** ' + clause.category + ' | **Importance:** ' + clause.importance)
      if (clause.ambiguities.length > 0) {
        lines.push('- **Ambiguities:**')
        for (const amb of clause.ambiguities) {
          lines.push('  - ' + amb)
        }
      }
      lines.push('')
    }
  }

  if (result.risk_annotations.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Risk Annotations')
    lines.push('')
    for (const ann of result.risk_annotations) {
      const levelIcon = ann.risk_level === 'high' ? '' : ann.risk_level === 'medium' ? '' : ''
      lines.push('### ' + levelIcon + ' ' + ann.clause_ref + ' - ' + ann.risk_type)
      lines.push('')
      lines.push('- **Level:** ' + ann.risk_level.toUpperCase())
      lines.push('- **Description:** ' + ann.description)
      lines.push('- **Mitigation:** ' + ann.suggested_mitigation)
      lines.push('')
    }
  }

  if (result.modification_suggestions.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Modification Suggestions')
    lines.push('')
    for (const sug of result.modification_suggestions) {
      const priorityIcon = sug.priority === 'must_fix' ? '' : sug.priority === 'recommended' ? '' : ''
      lines.push('### ' + priorityIcon + ' ' + sug.clause_ref + ' [' + sug.priority + ']')
      lines.push('')
      lines.push('- **Issue:** ' + sug.current_issue)
      lines.push('- **Suggested Text:** ' + sug.suggested_text)
      lines.push('')
    }
  }

  return lines.join('\n')
}

function formatObligationTrackerResult(result: ObligationTrackerResult): string {
  const lines: string[] = []
  lines.push('# Obligation Tracking Report')
  lines.push('')
  lines.push('## Status Summary')
  lines.push('')
  lines.push('| Status | Count |')
  lines.push('|--------|-------|')
  lines.push('| Total | ' + result.status_summary.total + ' |')
  lines.push('| Completed | ' + result.status_summary.completed + ' |')
  lines.push('| In Progress | ' + result.status_summary.in_progress + ' |')
  lines.push('| Pending | ' + result.status_summary.pending + ' |')
  lines.push('| Overdue | ' + result.status_summary.overdue + ' |')
  lines.push('| Waived | ' + result.status_summary.waived + ' |')
  lines.push('| **Compliance Rate** | **' + result.compliance_rate.toFixed(1) + '%** |')
  lines.push('')

  if (result.overdue_items.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('##  Overdue Items')
    lines.push('')
    for (const item of result.overdue_items) {
      lines.push('### ' + item.obligation_id)
      lines.push('')
      lines.push('- **Description:** ' + item.description)
      lines.push('- **Responsible Party:** ' + item.responsible_party)
      lines.push('- **Deadline:** ' + item.deadline)
      lines.push('- **Days Overdue:** ' + Math.abs(item.days_remaining))
      lines.push('- **Urgency:** ' + item.urgency.toUpperCase())
      lines.push('')
    }
  }

  if (result.upcoming_deadlines.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('##  Upcoming Deadlines')
    lines.push('')
    for (const item of result.upcoming_deadlines) {
      const urgencyIcon = item.urgency === 'critical' ? '' : item.urgency === 'warning' ? '' : ''
      lines.push('### ' + urgencyIcon + ' ' + item.obligation_id)
      lines.push('')
      lines.push('- **Description:** ' + item.description)
      lines.push('- **Responsible Party:** ' + item.responsible_party)
      lines.push('- **Deadline:** ' + item.deadline)
      lines.push('- **Days Remaining:** ' + item.days_remaining)
      lines.push('- **Urgency:** ' + item.urgency.toUpperCase())
      lines.push('')
    }
  }

  if (result.party_workload.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Party Workload')
    lines.push('')
    lines.push('| Party | Total | Pending | Overdue | Risk Score |')
    lines.push('|-------|-------|---------|---------|------------|')
    for (const pw of result.party_workload) {
      lines.push('| ' + pw.party + ' | ' + pw.total_obligations + ' | ' + pw.pending_count + ' | ' + pw.overdue_count + ' | ' + pw.risk_score + '/100 |')
    }
    lines.push('')
  }

  return lines.join('\n')
}

function formatRenewalManagerResult(result: RenewalManagerResult): string {
  const lines: string[] = []
  lines.push('# Contract Renewal Management Report')
  lines.push('')

  if (result.risk_alerts.length > 0) {
    lines.push('##  Risk Alerts')
    lines.push('')
    for (const alert of result.risk_alerts) {
      lines.push('-  ' + alert)
    }
    lines.push('')
  }

  if (result.renewal_schedule.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Renewal Schedule')
    lines.push('')
    lines.push('| Contract | Title | End Date | Action By | Days Left | Status |')
    lines.push('|----------|-------|---------|-----------|-----------|--------|')
    for (const item of result.renewal_schedule) {
      const statusIcon = item.status === 'urgent' ? '' : item.status === 'action_needed' ? '' : item.status === 'expired' ? '' : ''
      lines.push('| ' + item.contract_id.substring(0, 12) + ' | ' + item.title.substring(0, 20) + ' | ' + item.current_end_date + ' | ' + item.renewal_deadline + ' | ' + item.days_until_action + ' | ' + statusIcon + ' ' + item.status + ' |')
    }
    lines.push('')
  }

  if (result.priority_actions.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Priority Actions')
    lines.push('')
    for (const action of result.priority_actions) {
      const priorityIcon = action.priority === 'critical' ? '' : action.priority === 'high' ? '' : ''
      lines.push('### ' + priorityIcon + ' ' + action.action_type.replace(/_/g, ' ').toUpperCase())
      lines.push('')
      lines.push('- **Contract:** ' + action.contract_id)
      lines.push('- **Deadline:** ' + action.deadline)
      lines.push('- **Owner:** ' + action.owner)
      lines.push('- **Priority:** ' + action.priority.toUpperCase())
      lines.push('- **Details:** ' + action.details)
      lines.push('')
    }
  }

  if (result.negotiation_points.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Negotiation Points')
    lines.push('')
    for (const np of result.negotiation_points) {
      const leverageIcon = np.leverage === 'strong' ? '' : np.leverage === 'moderate' ? '' : ''
      lines.push('### ' + leverageIcon + ' ' + np.contract_id.substring(0, 12) + ' - ' + np.point)
      lines.push('')
      lines.push('- **Leverage:** ' + np.leverage)
      lines.push('- **Approach:** ' + np.suggested_approach)
      lines.push('')
    }
  }

  if (result.cost_projections.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Cost Projections')
    lines.push('')
    lines.push('| Contract | Current Value | Projected Value | Increase % |')
    lines.push('|----------|---------------|-----------------|------------|')
    for (const cp of result.cost_projections) {
      lines.push('| ' + cp.contract_id.substring(0, 12) + ' | ' + cp.currency + ' ' + cp.current_value.toLocaleString() + ' | ' + cp.currency + ' ' + cp.projected_value.toLocaleString() + ' | ' + cp.increase_percentage + '% |')
    }
    lines.push('')
  }

  return lines.join('\n')
}

function formatRiskAssessorResult(result: RiskAssessorResult): string {
  const lines: string[] = []
  lines.push('# Contract Risk Assessment Report')
  lines.push('')
  lines.push('## Overall Risk')
  lines.push('')
  const gradeIcon = result.risk_grade === 'A' ? '' : result.risk_grade === 'B' ? '' : result.risk_grade === 'C' ? '' : result.risk_grade === 'D' ? '' : ''
  lines.push('**Risk Score:** ' + result.overall_risk_score + '/100')
  lines.push('**Risk Grade:** ' + gradeIcon + ' ' + result.risk_grade)
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Risk Categories')
  lines.push('')
  for (const cat of result.risk_categories) {
    const levelIcon = cat.level === 'critical' ? '' : cat.level === 'high' ? '' : cat.level === 'medium' ? '' : ''
    lines.push('### ' + levelIcon + ' ' + cat.category)
    lines.push('')
    lines.push('- **Score:** ' + cat.score + '/100 | **Level:** ' + cat.level.toUpperCase())
    lines.push('- **Factors:**')
    for (const f of cat.factors) {
      lines.push('  - ' + f)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Exposure Analysis')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Maximum Exposure | ' + result.exposure_analysis.currency + ' ' + result.exposure_analysis.max_exposure.toLocaleString() + ' |')
  lines.push('| Expected Exposure | ' + result.exposure_analysis.currency + ' ' + result.exposure_analysis.expected_exposure.toLocaleString() + ' |')
  lines.push('| Worst Case | ' + result.exposure_analysis.currency + ' ' + result.exposure_analysis.worst_case_exposure.toLocaleString() + ' |')
  lines.push('| Confidence Level | ' + (result.exposure_analysis.confidence_level * 100).toFixed(0) + '% |')
  lines.push('')

  if (result.mitigation_recommendations.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Mitigation Recommendations')
    lines.push('')
    for (const rec of result.mitigation_recommendations) {
      lines.push('### Priority ' + rec.priority + ': ' + rec.target_category)
      lines.push('')
      lines.push('- **Recommendation:** ' + rec.recommendation)
      lines.push('- **Impact:** ' + rec.impact + ' | **Effort:** ' + rec.effort)
      lines.push('')
    }
  }

  if (result.monitoring_indicators.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Monitoring Indicators')
    lines.push('')
    for (const ind of result.monitoring_indicators) {
      lines.push('- ' + ind)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function formatComplianceCheckerResult(result: ComplianceCheckerResult): string {
  const lines: string[] = []
  lines.push('# Compliance Check Report')
  lines.push('')
  lines.push('## Overview')
  lines.push('')
  const scoreIcon = result.compliance_score >= 80 ? '' : result.compliance_score >= 50 ? '' : ''
  lines.push('**Compliance Score:** ' + scoreIcon + ' ' + result.compliance_score + '%')
  lines.push('**Compliant Requirements:** ' + result.compliant_count)
  lines.push('**Total Requirements:** ' + result.gaps.length)
  lines.push('')

  if (result.framework_coverage.length > 0) {
    lines.push('## Framework Coverage')
    lines.push('')
    for (const fc of result.framework_coverage) {
      lines.push('- **' + fc.framework + ':** ' + fc.covered + '/' + fc.total + ' (' + fc.percentage + '%)')
    }
    lines.push('')
  }

  if (result.gaps.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Compliance Gaps')
    lines.push('')
    for (const gap of result.gaps) {
      const statusIcon = gap.status === 'compliant' ? '' : gap.status === 'partial' ? '' : gap.status === 'non_compliant' ? '' : ' '
      lines.push('### ' + statusIcon + ' ' + gap.requirement)
      lines.push('')
      lines.push('- **Status:** ' + gap.status.replace(/_/g, ' '))
      lines.push('- **Severity:** ' + gap.severity.toUpperCase())
      lines.push('- **Description:** ' + gap.gap_description)
      lines.push('')
    }
  }

  if (result.required_revisions.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Required Revisions')
    lines.push('')
    for (const rev of result.required_revisions) {
      lines.push('### Clause ' + rev.clause_index + ' [' + rev.deadline_urgency.replace(/_/g, ' ') + ']')
      lines.push('')
      lines.push('- **Current:** ' + rev.current_text)
      lines.push('- **Required:** ' + rev.required_text)
      lines.push('- **Rationale:** ' + rev.rationale)
      lines.push('')
    }
  }

  if (result.risk_implications.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('##  Risk Implications')
    lines.push('')
    for (const ri of result.risk_implications) {
      lines.push('-  ' + ri)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function formatAmendmentAnalyzerResult(result: AmendmentAnalyzerResult): string {
  const lines: string[] = []
  lines.push('# Amendment Analysis Report')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  if (result.impact_assessment.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Impact Assessment')
    lines.push('')
    for (const impact of result.impact_assessment) {
      const levelIcon = impact.impact_level === 'high' ? '' : impact.impact_level === 'medium' ? '' : ''
      lines.push('### ' + levelIcon + ' Change #' + (impact.change_index + 1) + ' - ' + impact.section_ref)
      lines.push('')
      lines.push('- **Type:** ' + impact.change_type + ' | **Impact:** ' + impact.impact_level.toUpperCase())
      if (impact.legal_implications.length > 0) {
        lines.push('- **Legal Implications:**')
        for (const li of impact.legal_implications) {
          lines.push('  - ' + li)
        }
      }
      if (impact.financial_implications.length > 0) {
        lines.push('- **Financial Implications:**')
        for (const fi of impact.financial_implications) {
          lines.push('  - ' + fi)
        }
      }
      lines.push('')
    }
  }

  if (result.conflict_analysis.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('##  Conflict Analysis')
    lines.push('')
    for (const conflict of result.conflict_analysis) {
      lines.push('###  Conflict: Change #' + (conflict.change_a_index + 1) + ' vs Change #' + (conflict.change_b_index + 1))
      lines.push('')
      lines.push('- **Type:** ' + conflict.conflict_type)
      lines.push('- **Description:** ' + conflict.description)
      lines.push('- **Resolution:** ' + conflict.resolution)
      lines.push('')
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of result.recommendations) {
      const actionIcon = rec.action === 'accept' ? '' : rec.action === 'modify' ? '' : rec.action === 'reject' ? '' : ''
      lines.push('### ' + actionIcon + ' Change #' + (rec.change_index + 1) + ' - ' + rec.action.toUpperCase())
      lines.push('')
      lines.push('- **Recommendation:** ' + rec.recommendation)
      lines.push('- **Reasoning:** ' + rec.reasoning)
      lines.push('')
    }
  }

  return lines.join('\n')
}

function formatSummarizerResult(result: SummarizerResult): string {
  const lines: string[] = []
  lines.push('# Contract Summary Report')
  lines.push('')
  lines.push('## Contract Overview')
  lines.push('')
  lines.push('- **Type:** ' + result.contract_type)
  lines.push('- **Word Count:** ' + result.word_count)
  lines.push('')

  if (result.parties.length > 0) {
    lines.push('## Parties')
    lines.push('')
    for (const party of result.parties) {
      lines.push('### ' + party.name + ' (' + party.role + ')')
      lines.push('')
      if (party.key_obligations.length > 0) {
        lines.push('**Key Obligations:**')
        for (const ob of party.key_obligations) {
          lines.push('- ' + ob)
        }
      }
      lines.push('')
    }
  }

  if (result.key_terms.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Key Terms')
    lines.push('')
    lines.push('| Term | Value | Significance |')
    lines.push('|------|-------|-------------|')
    for (const term of result.key_terms) {
      const sigIcon = term.significance === 'critical' ? '' : term.significance === 'important' ? '' : ''
      lines.push('| ' + term.term + ' | ' + term.value + ' | ' + sigIcon + ' ' + term.significance + ' |')
    }
    lines.push('')
  }

  if (result.critical_dates.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Critical Dates')
    lines.push('')
    for (const date of result.critical_dates) {
      const daysIcon = date.days_from_now < 0 ? '' : date.days_from_now < 30 ? '' : ''
      lines.push('### ' + daysIcon + ' ' + date.event)
      lines.push('')
      lines.push('- **Date:** ' + date.date)
      lines.push('- **Days from now:** ' + date.days_from_now)
      lines.push('- **Action Required:** ' + date.action_required)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push('')
  lines.push('## Financial Summary')
  lines.push('')
  if (result.financial_summary.total_value) {
    lines.push('- **Total Value:** ' + result.financial_summary.currency + ' ' + result.financial_summary.total_value.toLocaleString())
  }
  lines.push('- **Payment Schedule:**')
  for (const ps of result.financial_summary.payment_schedule) {
    lines.push('  - ' + ps)
  }
  if (result.financial_summary.penalty_clauses.length > 0) {
    lines.push('- **Penalty Clauses:**')
    for (const pc of result.financial_summary.penalty_clauses) {
      lines.push('  - ' + pc)
    }
  }
  if (result.financial_summary.financial_risks.length > 0) {
    lines.push('- **Financial Risks:**')
    for (const fr of result.financial_summary.financial_risks) {
      lines.push('  - ' + fr)
    }
  }
  lines.push('')

  if (result.termination_conditions.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Termination Conditions')
    lines.push('')
    for (const tc of result.termination_conditions) {
      lines.push('- ' + tc)
    }
    lines.push('')
  }

  if (result.red_flags.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('##  Red Flags')
    lines.push('')
    for (const rf of result.red_flags) {
      lines.push('-  ' + rf)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Overall Summary')
  lines.push('')
  lines.push(result.overall_summary)
  lines.push('')

  return lines.join('\n')
}
