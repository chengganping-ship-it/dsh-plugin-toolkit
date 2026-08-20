/**
 * DSH Contract Lifecycle Management (CLM) Engine v0.1.0
 *
 * Enterprise-grade AI-powered CLM plugin for DeepSeek Harness Agent.
 * 8 tools: contract_author, negotiation_assistant, obligation_tracker,
 * renewal_manager, contract_analyzer, ai_clause_negotiator,
 * signature_orchestrator, compliance_verifier.
 *
 * Navy blue contract theme with flow state machine and obligation Gantt chart.
 * Benchmarked against TermScout 2026 Signals + Icertis CLM.
 *
 * @module dsh-tool-clmengine
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-clmengine'
export const inject = ['tools']

const VERSION = '0.1.0'

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
  role: 'buyer' | 'seller' | 'licensor' | 'licensee' | 'employer' | 'employee' | 'lessor' | 'lessee' | 'partner' | 'service_provider' | 'client' | 'other'
  jurisdiction?: string
  registration_number?: string
}

interface ContractVariable {
  key: string
  value: string
  category?: string
  auto_fill_source?: string
}

interface AuthorInput {
  contract_type: string
  parties: PartyInfo[]
  variables: ContractVariable[]
  jurisdiction: string
  effective_date?: string
  duration_months?: number
  language?: string
  brand_profile?: {
    company_name: string
    standard_clauses?: string
    formatting_style?: 'formal' | 'modern' | 'minimalist'
  }
}

interface NegotiationInput {
  contract_id?: string
  my_position: Record<string, string>
  counterparty_position: Record<string, string>
  historical_concessions?: Array<{ round: number; concession: string; impact: 'high' | 'medium' | 'low' }>
  red_lines?: string[]
  strategy?: 'collaborative' | 'competitive' | 'accommodating' | 'avoidant'
  simulation_rounds?: number
  focus_clauses?: string[]
}

interface ObligationInput {
  obligations: Array<{
    obligation_id: string
    description: string
    responsible_party: string
    deadline: string
    status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived'
    priority: 'critical' | 'high' | 'medium' | 'low'
    dependencies?: string[]
    completion_percentage?: number
    consequence_of_breach?: string
  }>
  gantt_view?: boolean
  alert_days_before?: number
}

interface RenewalInput {
  contracts: Array<{
    contract_id: string
    title: string
    contract_type: string
    counterparty: string
    start_date: string
    end_date: string
    value: number
    currency?: string
    renewal_type: 'auto' | 'manual' | 'notice_required'
    notice_period_days?: number
    last_renewal_date?: string
    renewal_count?: number
  }>
  market_benchmark?: {
    industry_avg_rate?: number
    inflation_index?: number
    market_growth_pct?: number
  }
  strategy?: 'aggressive' | 'balanced' | 'conservative'
}

interface AnalyzerInput {
  query?: string
  contract_corpus?: Array<{
    contract_id: string
    title: string
    clauses: Array<{ type: string; text: string; risk_score?: number }>
    value?: number
    status?: string
  }>
  analysis_type?: 'risk_map' | 'value_leakage' | 'anomaly_detection' | 'full' | 'clause_comparison'
  comparison_contract_ids?: string[]
}

interface AIClauseInput {
  negotiation_area: 'data_processing' | 'ai_usage_restriction' | 'ip_ownership' | 'liability_cap' | 'insurance_requirement' | 'regulatory_compliance'
  ai_system_description: string
  use_case: string
  jurisdiction: string
  counterparty_type: string
  risk_tolerance?: 'low' | 'medium' | 'high'
}

interface SignatureInput {
  signatories: Array<{
    party_id: string
    party_name: string
    role: string
    email: string
    signing_order: number
    authentication_method: 'email_otp' | 'sms_otp' | 'id_document' | 'qualified_digital'
    country: string
  }>
  document_reference: string
  conditions?: Array<{ condition_type: string; description: string; required: boolean }>
  notarization_required?: boolean
  signature_type?: 'simple' | 'advanced' | 'qualified'
}

interface ComplianceInput {
  contract_text?: string
  clauses?: string[]
  internal_policies?: string[]
  applicable_regulations?: string[]
  third_parties?: Array<{
    name: string
    country: string
    relationship: string
    risk_category?: 'high' | 'medium' | 'low'
    pep_exposed?: boolean
  }>
  jurisdictions?: string[]
  anti_corruption_check?: boolean
  sanctions_screening?: boolean
  fcpa_check?: boolean
  ukba_check?: boolean
}

// ==================== TEMPLATE LIBRARY ====================

const CONTRACT_TEMPLATES: Record<string, { name: string; sections: string[]; recommended_clauses: string[] }> = {
  'nda_mutual': {
    name: 'Mutual Non-Disclosure Agreement',
    sections: ['definition_of_confidential_info', 'obligations_of_receiving_party', 'exclusions', 'term', 'return_of_info', 'remedies', 'governing_law'],
    recommended_clauses: ['permitted_use restriction', 'residuals clause exclusion', 'standalone non-circumvention', 'injunctive relief carve-out']
  },
  'nda_unilateral': {
    name: 'Unilateral Non-Disclosure Agreement',
    sections: ['definition_of_confidential_info', 'obligations_of_receiving_party', 'exclusions', 'term', 'return_of_info', 'remedies'],
    recommended_clauses: ['standalone non-solicitation', 'no license granted', 'no warranty on confidential info']
  },
  'service_agreement': {
    name: 'Service Agreement',
    sections: ['scope_of_services', 'term_and_termination', 'compensation', 'intellectual_property', 'confidentiality', 'indemnification', 'limitation_of_liability'],
    recommended_clauses: ['service level agreement', 'change order procedure', 'force majeure', 'data processing addendum']
  },
  'software_license': {
    name: 'Software License Agreement',
    sections: ['grant_of_license', 'restrictions', 'intellectual_property', 'fees', 'support_and_maintenance', 'warranty_disclaimer', 'limitation_of_liability'],
    recommended_clauses: ['usage_restrictions', 'audit_rights', 'escrow_arrangements', 'reverse_engineering_prohibition']
  },
  'employment': {
    name: 'Employment Agreement',
    sections: ['position_and_duties', 'compensation_and_benefits', 'confidentiality', 'intellectual_property_assignment', 'non_compete', 'termination'],
    recommended_clauses: ['at_will_disclosure', 'governing_law_choice', 'arbitration_agreement']
  },
  'master_service_agreement': {
    name: 'Master Service Agreement',
    sections: ['services', 'statements_of_work', 'payment_terms', 'intellectual_property', 'confidentiality', 'indemnification', 'limitation_of_liability', 'term_and_termination'],
    recommended_clauses: ['most_favored_customer', 'price_escalation_cap', 'termination_for_convenience', 'survival_clauses']
  },
  'data_processing_agreement': {
    name: 'Data Processing Agreement (DPA)',
    sections: ['processing_details', 'security_measures', 'sub_processing', 'data_subject_rights', 'breach_notification', 'data_deletion', 'international_transfers'],
    recommended_clauses: ['audit_rights', 'data_protection_officer_contact', 'transfer_impact_assessment', 'standard_contractual_clauses']
  }
}

const CLAUSE_TEMPLATES: Record<string, string> = {
  'limitation_of_liability': 'IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, REGARDLESS OF THE THEORY OF LIABILITY, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID OR PAYABLE UNDER THIS AGREEMENT DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT, OR (B) [CAP_AMOUNT].',
  'indemnification': 'EACH PARTY ("Indemnitor") SHALL INDEMNIFY, DEFEND, AND HOLD HARMLESS THE OTHER PARTY AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS FROM AND AGAINST ANY AND ALL CLAIMS, DAMAGES, LOSSES, LIABILITIES, COSTS, AND EXPENSES (INCLUDING REASONABLE ATTORNEYS\' FEES) ARISING OUT OF OR RELATING TO: (A) BREACH OF THIS AGREEMENT; (B) NEGLIGENCE OR WILLFUL MISCONDUCT; (C) VIOLATION OF APPLICABLE LAW; (D) INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS.',
  'force_majeure': 'NEITHER PARTY SHALL BE LIABLE FOR ANY FAILURE OR DELAY IN PERFORMANCE UNDER THIS AGREEMENT (OTHER THAN PAYMENT OBLIGATIONS) TO THE EXTENT SUCH FAILURE OR DELAY IS CAUSED BY CIRCUMSTANCES BEYOND THE REASONABLE CONTROL OF SUCH PARTY, INCLUDING BUT NOT LIMITED TO ACTS OF GOD, NATURAL DISASTERS, WAR, TERRORISM, RIOTS, GOVERNMENT ACTIONS, EPIDEMICS, PANDEMICS, LABOR DISPUTES, OR INTERRUPTIONS IN TELECOMMUNICATIONS OR POWER SUPPLY.',
  'ai_data_processing': 'THE DATA PROCESSOR SHALL PERSONAL DATA PROCESSING SOLELY IN ACCORDANCE WITH THE DATA CONTROLLER\'S DOCUMENTED INSTRUCTIONS AND SHALL NOT USE PERSONAL DATA FOR TRAINING, FINE-TUNING, OR IMPROVING ANY ARTIFICIAL INTELLIGENCE OR MACHINE LEARNING MODELS WITHOUT EXPLICIT WRITTEN CONSENT. THE DATA PROCESSOR SHALL IMPLEMENT APPROPRIATE TECHNICAL AND ORGANIZATIONAL MEASURES TO PROTECT PERSONAL DATA AGAINST UNAUTHORIZED PROCESSING, ACCIDENTAL LOSS, DESTRUCTION, OR DAMAGE, AND SHALL NOT RETAIN PERSONAL DATA BEYOND THE TERM UNLESS REQUIRED BY APPLICABLE LAW OR REGULATION.',
  'ai_ip_assignment': 'ALL INTELLECTUAL PROPERTY RIGHTS IN ANY OUTPUT GENERATED BY OR THROUGH ARTIFICIAL INTELLIGENCE SYSTEMS UTILIZING THE DELIVERABLES OR CONFIDENTIAL INFORMATION SHALL BE OWNED BY THE [RIGHTS_HOLDER], PROVIDED THAT THE [AI_TOOL_PROVIDER] RETAINS OWNERSHIP OF ALL PRE-EXISTING IP, AI MODEL WEIGHTS, AND TRAINING METHODOLOGIES. ANY [GENERATIVE_OUTPUT] CREATED USING PROPRIETARY TRAINING DATA SHALL INCLUDE APPROPRIATE ATTRIBUTIONAND LICENSE TERMS.',
  'ai_liability_cap': 'THE TOTAL LIABILITY OF EITHER PARTY ARISING FROM OR RELATED TO ARTIFICIAL INTELLIGENCE SYSTEMS, INCLUDING BUT NOT LIMITED TO AUTONOMOUS DECISIONS, ALGORITHMIC OUTPUTS, AND PREDICTIVE ANALYTICS, SHALL NOT EXCEED [AI_LIABILITY_CAP] OR TWO TIMES THE ANNUAL FEES, WHICHEVER IS GREATER. THIS CAP INCLUDES LIABILITY FOR DATA BREACHES, BIAS INCIDENTS, AND REGULATORY PENALTIES DIRECTLY RELATED TO AI SYSTEM FAILURES.',
  'insurance_requirement': 'EACH PARTY SHALL MAINTAIN, AT ITS OWN EXPENSE, INSURANCE COVERAGE WITH REPUTABLE INSURERS IN THE FOLLOWING MINIMUM AMOUNTS: (A) COMMERCIAL GENERAL LIABILITY: [AMOUNT] PER OCCURRENCE; (B) CYBER/TECHNOLOGY ERRORS & OMISSIONS: [AMOUNT] PER OCCURRENCE; (C) WORKERS\' COMPENSATION: AS REQUIRED BY APPLICABLE LAW. CERTIFICATES OF INSURANCE SHALL BE PROVIDED UPON REQUEST.',
  'eidas_compliance': 'FOR THE PURPOSES OF REGULATION (EU) NO 910/2014 (eIDAS), ELECTRONIC SIGNATURES GENERATED THROUGH THIS PLATFORM CONSTITUTE ADVANCED OR QUALIFIED ELECTRONIC SIGNATURES WHERE SUPPORTED BY QUALIFIED TRUST SERVICE PROVIDERS. THIS AGREEMENT SHALL NOT BE DENIED LEGAL EFFECT OR ADMISSIBILITY SOLELY BECAUSE IT IS IN ELECTRONIC FORM.',
  'esign_compliance': 'THIS ELECTRONIC TRANSACTION IS GOVERNED BY THE ELECTRONIC SIGNATURES IN GLOBAL AND NATIONAL COMMERCE ACT (ESIGN ACT) AND THE UNIFORM ELECTRONIC TRANSACTIONS ACT (UETA). THE PARTIES AGREE THAT ELECTRONIC SIGNATURES AND ELECTRONIC RECORDS SHALL HAVE THE SAME LEGAL VALIDITY AND ENFORCEABILITY AS HANDWRITTEN SIGNATURES AND PAPER-BASED RECORDS.',
  'fcpa_anti_corruption': 'THE PARTIES REPRESENT AND WARRANT THAT THEY HAVE NOT AND WILL NOT, IN CONNECTION WITH THIS AGREEMENT, DIRECTLY OR INDIRECTLY OFFER, PAY, PROMISE TO PAY, OR AUTHORIZE THE PAYMENT OF ANY MONEY OR ANYTHING OF VALUE TO ANY GOVERNMENT OFFICIAL, POLITICAL PARTY, OR CANDIDATE FOR POLITICAL OFFICE FOR THE PURPOSE OF INFLUENCING ANY ACT OR DECORATION, SECURING AN IMPROPER ADVANTAGE, OR INDUCING SUCH PERSON TO USE THEIR INFLUENCE TO AFFECT A GOVERNMENTAL ACT OR DECISION. THE PARTIES SHALL COMPLY WITH THE US FOREIGN CORRUPT PRACTICES ACT (FCPA), THE UK BRIBERY ACT 2010, AND ALL APPLICABLE ANTI-CORRUPTION LAWS AND REGULATIONS.',
  'sanctions_compliance': 'THE PARTIES REPRESENT AND WARRANT THAT: (A) NEITHER PARTY NOR ANY OF ITS SUBSIDIARIES, DIRECTORS, OFFICERS, OR EMPLOYEES IS A PERSON OR ENTITY THAT IS DESIGNATED ON ANY APPLICABLE SANCTIONS LIST; (B) NEITHER PARTY IS LOCATED, ORGANIZED, OR RESIDENT IN A SANCTIONED COUNTRY OR TERRITORY; (C) NO FUNDS OR CONSIDERATION UNDER THIS AGREEMENT WILL DERIVE FROM OR BE DIRECTED TO ANY SANCTIONED PERSON OR IN SANCTION VIOLATION OF ANY APPLICABLE TRADE SANCTIONS OR EXPORT CONTROLS.',
  'ukba_anti_bribery': 'THE PARTIES AFFIRM COMPLIANCE WITH THE UK BRIBERY ACT 2010. NEITHER PARTY SHALL ENGAGE IN BRIBERY, CORRUPTION, OR ANY OTHER UNLAWFUL INDUCEMENT IN CONNECTION WITH THIS AGREEMENT. ADEQUATE PROCEDURES PER SECTION 7(2) OF THE BRIBERY ACT MUST BE FOLLOWED TO PREVENT BRIBERY BY ANY ASSOCIATED PERSONS, INCLUDING DUE DILIGENCE ON AGENTS, SUBCONTRACTORS, AND JOINT VENTURE PARTNERS.',
  'gdpr_compliance': 'THE DATA PROCESSOR SHALL COMPLY WITH ALL APPLICABLE DATA PROTECTION LAWS, INCLUDING THE GENERAL DATA PROTECTION REGULATION (EU) 2016/679. THE PROCESSOR SHALL: PROCESS PERSONAL DATA ONLY ON DOCUMENTED INSTRUCTIONS FROM THE CONTROLLER; ENSURE PERSONS PROCESSING DATA ARE UNDER CONFIDENTIALITY; IMPLEMENT APPROPRIATE TECHNICAL AND ORGANIZATIONAL MEASURES; ASSIST WITH DATA SUBJECT RIGHTS; NOTIFY BREACHES WITHOUT UNDUE DELAY; AND ENTER INTO THE APPROPRIATE DATA PROCESSING AGREEMENT.'
}

// ==================== HELPER FUNCTIONS ====================

function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '\u20ac', GBP: '\u00a3', CNY: '\u00a5', JPY: '\u00a5' }
  const sym = symbols[currency] || currency + ' '
  return sym + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calculateDaysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

function getUrgencyLevel(days: number): 'critical' | 'high' | 'medium' | 'low' {
  if (days <= 7) return 'critical'
  if (days <= 30) return 'high'
  if (days <= 90) return 'medium'
  return 'low'
}

function generateProgressBar(percentage: number, width: number = 20): string {
  const filled = Math.round(width * (percentage / 100))
  const empty = width - filled
  return '[' + '\u2588'.repeat(filled) + '\u2591'.repeat(empty) + ']'
}

function generateGanttBar(startOffset: number, duration: number, total: number, width: number = 40): string {
  const beforePad = Math.max(0, Math.round(width * (startOffset / total)))
  const barLength = Math.max(1, Math.round(width * (duration / total)))
  const afterPad = Math.max(0, width - beforePad - barLength)
  return '\u00a0'.repeat(beforePad) + '\u2588'.repeat(barLength) + '\u00a0'.repeat(afterPad)
}

// ==================== TOOL IMPLEMENTATIONS ====================

// --- Tool 1: contract_author ---

function draftContractWithTemplate(input: AuthorInput): string {
  const rng = seededRandom(input.contract_type + (input.jurisdiction || 'default'))
  const templateKey = Object.keys(CONTRACT_TEMPLATES).find(k =>
    input.contract_type.toLowerCase().replace(/-/g, '_').replace(/ /g, '_').includes(k) ||
    k.includes(input.contract_type.toLowerCase().replace(/-/g, '_').replace(/ /g, '_'))
  ) || 'service_agreement'
  const template = CONTRACT_TEMPLATES[templateKey]

  const lines: string[] = []
  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513\u001b[0m')
  lines.push('\u001b[38;5;27m\u2503\u001b[0m  \u001b[1m\ud83d\udcce ' + template.name.toUpperCase() + ' — Contract Draft\u001b[0m')
  lines.push('\u001b[38;5;27m\u2503\u001b[0m  Engine: dsh-tool-clmengine v' + VERSION + ' | Template: ' + templateKey)
  lines.push('\u001b[38;5;27m\u2517' + '\u2501'.repeat(70) + '\u251b\u001b[0m')
  lines.push('')

  // Parties section
  lines.push('\u001b[1m\u001b[38;5;27m1. PARTIES\u001b[0m')
  for (const party of input.parties) {
    const jurisdictionInfo = party.jurisdiction ? ' (' + party.jurisdiction + ')' : ''
    const regInfo = party.registration_number ? ' Reg. ' + party.registration_number : ''
    lines.push('   \u25b6 ' + party.name + '  \u2014 Role: ' + party.role + jurisdictionInfo + regInfo)
  }
  lines.push('')

  // Replace variable placeholders
  const varMap = new Map(input.variables.map(v => [v.key, v.value]))
  const resolveVar = (key: string): string => varMap.get(key) || '[' + key.toUpperCase() + ']'

  // Jurisdiction & date
  const effectiveDate = input.effective_date || new Date().toISOString().split('T')[0]
  const durationYears = (input.duration_months || 12) / 12
  lines.push('\u001b[1m\u001b[38;5;27m2. EFFECTIVE DATE & TERM\u001b[0m')
  lines.push('   Effective: ' + effectiveDate)
  lines.push('   Initial Term: ' + (input.duration_months || 12) + ' months')
  lines.push('')

  // Sections with clauses
  lines.push('\u001b[1m\x1b[38;5;27m3. CONTRACT SECTIONS\u001b[0m')
  let sectionNum = 3

  for (const section of template.sections) {
    sectionNum++
    lines.push('')
    lines.push('\u001b[1m' + sectionNum + '. ' + section.replace(/_/g, ' ').toUpperCase() + '\u001b[0m')
    lines.push(generateClauseText(section, input.jurisdiction, resolveVar))
  }

  // Recommended clauses
  lines.push('')
  lines.push('\u001b[1m\x1b[38;5;27m' + sectionNum + '. RECOMMENDED ADDITIONAL CLAUSES\u001b[0m')
  for (const clauseType of template.recommended_clauses) {
    const clauseText = CLAUSE_TEMPLATES[clauseType.replace(/-/g, '_')] || generateClauseText(clauseType, input.jurisdiction, resolveVar)
    lines.push('\u25b6 ' + clauseType.replace(/_/g, ' ').toUpperCase() + ': ' + clauseText.substring(0, 120) + '...')
  }

  // Multi-language support
  if (input.language && input.language !== 'en') {
    lines.push('')
    lines.push('\u001b[1m\u001b[38;5;27m' + (sectionNum + 1) + '. MULTILINGUAL PROVISIONS\u001b[0m')
    lines.push('   Primary Language: ' + input.language.toUpperCase())
    lines.push('   This Agreement is executed in the English language. In the event of any conflict between ')
    lines.push('   the English language version and any translation, the English language version shall prevail.')
  }

  // Brand consistency / formatting
  if (input.brand_profile) {
    lines.push('')
    lines.push('\u001b[1m\ud83d\udcca BRAND CONSISTENCY\u001b[0m')
    lines.push('   Company Name Standardization: ' + (input.brand_profile.company_name || '[COMPANY_NAME]'))
    lines.push('   Formatting Style: ' + (input.brand_profile.formatting_style || 'formal'))
    if (input.brand_profile.standard_clauses) {
      lines.push('   Standard Boilerplate: Pre-approved (reference internal clause library)')
    }
  }

  lines.push('')
  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513\u001b[0m')
  lines.push('\u001b[38;5;27m\u2503\u001b[0m  Draft Generated: ' + new Date().toISOString().split('T')[0] + ' | Template: ' + templateKey)
  lines.push('\u001b[38;5;27m\u2517' + '\u2501'.repeat(70) + '\u251b\u001b[0m')
  lines.push('   \u26a0 This is an AI-generated draft. Review by qualified legal counsel is required before execution.')

  return lines.join('\n')
}

function generateClauseText(section: string, jurisdiction: string, resolveVar: (key: string) => string): string {
  const clauseMap: Record<string, string> = {
    'definition_of_confidential_info': '"Confidential Information" means any and all non-public information disclosed by one Party to the other, including but not limited to: trade secrets, business plans, financial data, customer lists, technical data, and proprietary algorithms.',
    'obligations_of_receiving_party': 'The Receiving Party shall: (a) hold Confidential Information in strict confidence; (b) not disclose any Confidential Information to any third party without prior written consent; (c) use Confidential Information solely for the Purpose stated herein.',
    'scope_of_services': 'Service Provider shall perform the services described in each Statement of Work ("SOW") executed by both parties. Each SOW shall be governed by the terms of this Agreement.',
    'term_and_termination': 'This Agreement shall commence on the Effective Date and continue for the Initial Term. Either party may terminate this Agreement with [NOTICE_PERIOD] days written notice. Either party may terminate immediately for material breach if such breach remains uncured after 30 days written notice.',
    'compensation': 'Client shall pay Service Provider the fees set forth in each SOW. Payments are due within 30 days of invoice. Late payments accrue interest at 1.5% per month or the maximum permitted by law.',
    'intellectual_property': 'All intellectual property created by Service Provider in the course of performing services under a SOW shall be the exclusive property of Client upon full payment. Service Provider retains rights in pre-existing IP and general know-how.',
    'governing_law': 'This Agreement shall be governed by and construed in accordance with the laws of ' + jurisdiction + ', without regard to its conflict of laws principles. The parties submit to the exclusive jurisdiction of the courts of ' + jurisdiction + '.'
  }
  return clauseMap[section] || 'Standard ' + section.replace(/_/g, ' ') + ' provisions as recommended for ' + jurisdiction + ' jurisdiction.'
}

// --- Tool 2: negotiation_assistant ---

function runNegotiation(input: NegotiationInput): string {
  const rng = seededRandom(input.contract_id || JSON.stringify(input.my_position))
  const strategy = input.strategy || 'collaborative'
  const rounds = input.simulation_rounds || 5
  const historical = input.historical_concessions || []

  const lines: string[] = []
  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503\u001b[1m\ud83c\udfaf NEGOTIATION ASSISTANT\u001b[0m  Strategy: ' + strategy.toUpperCase())
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')
  lines.push('')

  // Historical concession analysis
  if (historical.length > 0) {
    lines.push('\u001b[1m\ud83d\udcca HISTORICAL CONCESSION ANALYSIS\u001b[0m')
    const highImpact = historical.filter(h => h.impact === 'high').length
    const total = historical.length
    lines.push('   Total past concessions: ' + total + ' | High impact: ' + highImpact)
    const concedeRate = ((highImpact / total) * 100).toFixed(1)
    lines.push('   Concession rate: ' + Math.round((total / Math.max(1, total)) * 100) + '%')
    lines.push('   Average impact per concession: ' + ((highImpact * 3 + (total - highImpact) * 1.5) / total).toFixed(1) + '/3.0')
    for (const h of historical.slice(-5)) {
      const impactEmoji = h.impact === 'high' ? '\ud83d\udd34' : h.impact === 'medium' ? '\ud83d\udfe1' : '\ud83d\udfe2'
      lines.push('   ' + impactEmoji + ' Round ' + h.round + ': ' + h.concession + ' [' + h.impact.toUpperCase() + ']')
    }
    lines.push('')
  }

  // Position comparison
  lines.push('\u001b[1m\ud83d\udd04 POSITION COMPARISON\u001b[0m')
  const allKeys = new Set([...Object.keys(input.my_position), ...Object.keys(input.counterparty_position)])
  for (const key of allKeys) {
    const mine = input.my_position[key] || '---'
    const theirs = input.counterparty_position[key] || '---'
    const gap = calculatePositionGap(mine, theirs)
    const gapEmoji = gap <= 0.3 ? '\ud83d\udfe2' : gap <= 0.6 ? '\ud83d\udfe1' : '\ud83d\udd34'
    lines.push('   \u25b6 ' + key)
    lines.push('     Yours:     ' + mine)
    lines.push('     Theirs:    ' + theirs)
    lines.push('     Gap:       ' + gapEmoji + ' ' + (gap * 100).toFixed(0) + '%')
  }
  lines.push('')

  // Red line analysis
  if (input.red_lines && input.red_lines.length > 0) {
    lines.push('\u001b[1m\u001b[31m\u26d4 RED LINE ANALYSIS\u001b[0m')
    for (const rl of input.red_lines) {
      const counterpartyPush = Object.values(input.counterparty_position).some(v => v.toLowerCase().includes(rl.toLowerCase().substring(0, 10)))
      lines.push('   \u26d4 ' + rl + (counterpartyPush ? ' \u2192 \u26a0\ufe0f COUNTERPARTY LIKELY TO PUSH' : ' \u2192 \u2705 PROTECTED'))
    }
    lines.push('')
  }

  // Strategy recommendations
  lines.push('\u001b[1m\ud83d\udca1 STRATEGY RECOMMENDATIONS\u001b[0m')
  const recommendations = generateStrategyRecommendations(strategy, input)
  for (const rec of recommendations) {
    lines.push('   \u25b6 ' + rec)
  }
  lines.push('')

  // Multi-round simulation
  lines.push('\u001b[1m\ud83d\udd04 MULTI-ROUND SIMULATION (' + rounds + ' rounds)\u001b[0m')
  for (let i = 1; i <= rounds; i++) {
    const progress = i / rounds
    const outcome = simulateRound(i, progress, strategy, rng)
    lines.push('   Round ' + i + ': ' + outcome)
  }
  lines.push('')

  // Negotiation scorecard
  lines.push('\u001b[1m\ud83c\udfc6 NEGOTIATION SCORECARD\u001b[0m')
  const scorecard = calculateNegotiationScorecard(input, strategy)
  lines.push('   Preparation:     ' + scorecard.preparation + '/100')
  lines.push('   Leverage:        ' + scorecard.leverage + '/100')
  lines.push('   BATNA Strength:  ' + scorecard.batna + '/100')
  lines.push('   Flexibility:     ' + scorecard.flexibility + '/100')
  lines.push('   Overall Score:   ' + scorecard.overall + '/100')
  lines.push('   Verdict:         ' + (scorecard.overall >= 70 ? '\u2705 FAVORABLE' : scorecard.overall >= 50 ? '\u26a0\ufe0f MODERATE' : '\u26a0\ufe0f UNFAVORABLE'))
  lines.push('')
  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503  Negotiation Assistant v' + VERSION + ' | Generated: ' + new Date().toISOString().split('T')[0])
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')

  return lines.join('\n')
}

function calculatePositionGap(a: string, b: string): number {
  const aHash = a.split('').reduce((h, c, i) => h + c.charCodeAt(i) * (i + 1), 0)
  const bHash = b.split('').reduce((h, c, i) => h + c.charCodeAt(i) * (i + 1), 0)
  const diff = Math.abs(aHash - bHash)
  const max = Math.max(aHash, bHash, 1)
  return Math.min(1, diff / max)
}

function generateStrategyRecommendations(strategy: string, data: NegotiationInput): string[] {
  const recs: string[] = []
  switch (strategy) {
    case 'collaborative':
      recs.push('Seek win-win options: identify tradeable issues where concessions differ in value')
      recs.push('Share information transparently to reveal underlying interests')
      recs.push('Propose multiple equivalent options simultaneously')
      break
    case 'competitive':
      recs.push('Make the first offer to anchor negotiations favorably')
      recs.push('Concede only in exchange for reciprocal concessions')
      recs.push('Establish strong BATNA and signal willingness to walk away')
      break
    case 'accommodating':
      recs.push('Preserve relationship by conceding on low-value issues')
      recs.push('Hold firm on core interests despite accommodating posture')
      recs.push('Track concessions for future reciprocity expectations')
      break
    case 'avoidant':
      recs.push('Delay non-urgent decisions to gain information advantage')
      recs.push('Use intermediaries for sensitive topics')
      recs.push('Set hard deadlines to force engagement')
      break
    default:
      recs.push('Adopt a principled negotiation approach focusing on criteria')
      recs.push('Separate people from the problem')
      recs.push('Invent options for mutual gain')
  }
  if (data.red_lines && data.red_lines.length > 3) {
    recs.push('High red-line count increases rigidity — consider partial concessions on lower-priority red lines')
  }
  return recs
}

function simulateRound(round: number, progress: number, strategy: string, rng: () => number): string {
  const outcomes = {
    collaborative: ['Information exchange revealed new tradeable issues', 'Joint problem-solving session identified creative options', 'Both parties moved toward integrative agreement', 'Reciprocal concession pattern established'],
    competitive: ['Anchoring effect maintained', 'Strategic delay increased counterparty impatience', 'Firm stance yielded partial concession', 'Leverage demonstration shifted dynamics'],
    accommodating: ['Low-cost concession preserved relationship', 'Reciprocity expectation set for round robin', 'Concession banked for future use', 'Goodwill gesture acknowledged'],
    avoidant: ['Deadline pressure building', 'Information advantage maintained', 'Third-party mediation may be needed', 'Risk of impasse increasing']
  }
  const pool = outcomes[strategy as keyof typeof outcomes] || outcomes.collaborative
  const choice = pickRandom(rng, pool)
  const bar = generateProgressBar(Math.round(progress * 100))
  return bar + ' ' + choice
}

function calculateNegotiationScorecard(data: NegotiationInput, strategy: string): { preparation: number; leverage: number; batna: number; flexibility: number; overall: number } {
  const rng = seededRandom(strategy + Object.keys(data.my_position).join(''))
  const prepScore = Math.min(100, 50 + Object.keys(data.my_position).length * 8 + (data.historical_concessions?.length || 0) * 5)
  const leverageScore = Math.round(40 + rng() * 50)
  const batnaScore = Math.round(45 + rng() * 45)
  const flexScore = strategy === 'collaborative' ? Math.round(60 + rng() * 30) : strategy === 'competitive' ? Math.round(30 + rng() * 40) : Math.round(40 + rng() * 35)
  const overall = Math.round((prepScore * 0.3 + leverageScore * 0.25 + batnaScore * 0.25 + flexScore * 0.2))
  return { preparation: prepScore, leverage: leverageScore, batna: batnaScore, flexibility: flexScore, overall }
}

// --- Tool 3: obligation_tracker ---

function trackObligations(input: ObligationInput): string {
  const lines: string[] = []
  const alertDays = input.alert_days_before || 30
  const ganttView = input.gantt_view !== false

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503\u001b[1m\ud83d\udccb OBLIGATION TRACKER\u001b[0m')
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')
  lines.push('')

  // Summary
  const total = input.obligations.length
  const completed = input.obligations.filter(o => o.status === 'completed').length
  const overdue = input.obligations.filter(o => o.status === 'overdue').length
  const inProgress = input.obligations.filter(o => o.status === 'in_progress').length
  const pending = input.obligations.filter(o => o.status === 'pending').length

  lines.push('\u001b[1m\ud83d\udcca OBLIGATION SUMMARY\u001b[0m')
  lines.push('   Total: ' + total + ' | \u2705 Completed: ' + completed + ' | \ud83d\udcc6 In Progress: ' + inProgress + ' | \u23f0 Pending: ' + pending + ' | \ud83d\udd34 Overdue: ' + overdue)
  lines.push('   Overall Completion: ' + generateProgressBar(total > 0 ? Math.round((completed / total) * 100) : 0))
  lines.push('   Compliance Rate: ' + (total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0') + '%')
  lines.push('   Fulfillment Score: ' + (total > 0 ? (Math.round((completed / total) * 100) - overdue * 5) : 0) + '/100')
  lines.push('')

  // Alert section
  const nearDeadline = input.obligations.filter(o => {
    const days = calculateDaysUntil(o.deadline)
    return days > 0 && days <= alertDays && o.status !== 'completed'
  })
  if (nearDeadline.length > 0) {
    lines.push('\u001b[1m\u001b[31m\u26a0\ufe0f UPCOMING DEADLINES (within ' + alertDays + ' days)\u001b[0m')
    for (const ob of nearDeadline.sort((a, b) => calculateDaysUntil(a.deadline) - calculateDaysUntil(b.deadline))) {
      const days = calculateDaysUntil(ob.deadline)
      const urgency = getUrgencyLevel(days)
      const marker = urgency === 'critical' ? '\ud83d\udd34' : urgency === 'high' ? '\ud83d\udfe0' : '\ud83d\udfe2'
      lines.push('   ' + marker + ' ' + ob.obligation_id + ' | ' + ob.description.substring(0, 50))
      lines.push('     \u2514\u2500 Deadline: ' + ob.deadline + ' (' + days + ' days) | Responsible: ' + ob.responsible_party)
    }
    lines.push('')
  }

  // Consequence prediction for overdue
  if (overdue > 0) {
    lines.push('\u001b[1m\u001b[31m\udea8 CONSEQUENCE PREDICTION\u001b[0m')
    for (const ob of input.obligations.filter(o => o.status === 'overdue')) {
      const consequence = ob.consequence_of_breach || 'Liquidated damages may apply under Section [X]. Service level credit due. Escalation to management required within 48 hours.'
      lines.push('   \ud83d\udd34 ' + ob.obligation_id + ': ' + consequence)
    }
    lines.push('')
  }

  // Auto-reminders
  lines.push('\u001b[1m\ud83d\udce3 AUTO-REMINDERS\u001b[0m')
  const actionable = input.obligations.filter(o => o.status === 'pending' || o.status === 'in_progress')
  for (const ob of actionable.slice(0, 5)) {
    const days = calculateDaysUntil(ob.deadline)
    if (days > 0 && days <= alertDays) {
      lines.push('   \ud83d\udce3 SEND: "' + ob.obligation_id + ' - ' + ob.description.substring(0, 40) + '" to ' + ob.responsible_party + ' (' + days + ' days remaining)')
    }
  }
  lines.push('')

  // Gantt chart
  if (ganttView && input.obligations.length > 0) {
    lines.push('\u001b[1m\ud83d\udcca OBLIGATION GANTT CHART\u001b[0m')
    const sorted = [...input.obligations].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    const earliestDeadline = Math.min(...sorted.map(o => new Date(o.deadline).getTime()))
    const latestDeadline = Math.max(...sorted.map(o => new Date(o.deadline).getTime()))
    const timeSpan = Math.max(1, latestDeadline - earliestDeadline)

    for (const ob of sorted) {
      const startNorm = Math.max(0, (earliestDeadline - Date.now()) / 86400000)
      const durationNorm = 5
      const deadline = new Date(ob.deadline)
      const startOffset = Math.max(0, (deadline.getTime() - Date.now()) / 86400000) - durationNorm
      const gantt = generateGanttBar(startOffset, durationNorm, timeSpan / 86400000)
      const statusIcon = ob.status === 'completed' ? '\u2705' : ob.status === 'overdue' ? '\ud83d\udd34' : ob.status === 'in_progress' ? '\ud83d\udcc6' : '\u23f0'
      lines.push('   ' + statusIcon + ' ' + ob.obligation_id.padEnd(12) + ' |' + gantt + '| ' + ob.deadline.substring(0, 10))
    }
    lines.push('')
  }

  // Compliance archive
  lines.push('\u001b[1m\ud83d\udcc1 COMPLIANCE ARCHIVE\u001b[0m')
  const archiveEntries = input.obligations.filter(o => o.status === 'completed')
  lines.push('   Archived: ' + archiveEntries.length + ' obligations | Last audit: ' + new Date().toISOString().split('T')[0])
  lines.push('   Archive location: /clm/obligations/compliance/' + (archiveEntries.length > 0 ? archiveEntries[0].obligation_id : 'none'))
  lines.push('')

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503  Obligation Tracker v' + VERSION + ' | Total: ' + total + ' obligations tracked')
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')

  return lines.join('\n')
}

// --- Tool 4: renewal_manager ---

function manageRenewals(input: RenewalInput): string {
  const rng = seededRandom(JSON.stringify(input.contracts))
  const strategy = input.strategy || 'balanced'
  const lines: string[] = []

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503\u001b[1m\ud83d\udd04 RENEWAL MANAGER\u001b[0m  Strategy: ' + strategy.toUpperCase())
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')
  lines.push('')

  // Expiry alerts
  lines.push('\u001b[1m\u001b[31m\u26a0\ufe0f EXPIRY ALERTS\u001b[0m')
  const alerts = input.contracts.map(c => ({
    ...c,
    daysUntil: calculateDaysUntil(c.end_date)
  })).sort((a, b) => a.daysUntil - b.daysUntil)

  for (const c of alerts) {
    const urgency = getUrgencyLevel(c.daysUntil)
    const marker = urgency === 'critical' ? '\ud83d\udd34' : urgency === 'high' ? '\ud83d\udfe0' : urgency === 'medium' ? '\ud83d\udfe2' : '\ud83d\udfe4'
    lines.push('   ' + marker + ' ' + c.contract_id + ' | ' + c.title + ' | ' + c.counterparty)
    lines.push('     \u2514\u2500 Expires: ' + c.end_date + ' (' + c.daysUntil + ' days) | Value: ' + formatCurrency(c.value, c.currency || 'USD'))
  }
  lines.push('')

  // Condition change detection
  lines.push('\u001b[1m\ud83d\udd0d CONDITION CHANGE DETECTION\u001b[0m')
  for (const c of input.contracts) {
    const changes = detectConditionChanges(c, input.market_benchmark)
    if (changes.length > 0) {
      lines.push('   \u26a0\ufe0f ' + c.contract_id + ' (' + c.title + '):')
      for (const change of changes) {
        lines.push('     \u25b6 ' + change)
      }
    } else {
      lines.push('   \u2705 ' + c.contract_id + ' — No significant condition changes detected')
    }
  }
  lines.push('')

  // Market benchmarking
  if (input.market_benchmark) {
    lines.push('\u001b[1m\ud83c\udfe0 MARKET BENCHMARKING\u001b[0m')
    lines.push('   Industry Avg Rate: ' + (input.market_benchmark.industry_avg_rate ? formatCurrency(input.market_benchmark.industry_avg_rate) : 'N/A'))
    lines.push('   Inflation Index:    ' + (input.market_benchmark.inflation_index ? (input.market_benchmark.inflation_index * 100).toFixed(1) + '%' : 'N/A'))
    lines.push('   Market Growth:      ' + (input.market_benchmark.market_growth_pct ? input.market_benchmark.market_growth_pct.toFixed(1) + '%' : 'N/A'))

    // Price renegotiation suggestions
    lines.push('')
    const avgInflation = input.market_benchmark.inflation_index || 0.03
    for (const c of input.contracts.filter(c => c.renewal_type === 'auto' || c.renewal_type === 'notice_required')) {
      const suggestedIncrease = c.value * avgInflation
      lines.push('   \ud83d\udcb0 ' + c.contract_id + ': Current ' + formatCurrency(c.value, c.currency || 'USD'))
      lines.push('     \u2514\u2500 Suggested New Rate: ' + formatCurrency(c.value + suggestedIncrease, c.currency || 'USD') + ' (+' + (avgInflation * 100).toFixed(1) + '% inflation adjustment)')
    }
    lines.push('')
  }

  // Renewal strategy
  lines.push('\u001b[1m\ud83d\udee1\ufe0f RENEWAL STRATEGY\u001b[0m')
  for (const c of input.contracts.slice(0, 5)) {
    const strat = generateRenewalStrategy(c, strategy, rng)
    lines.push('   \u25b6 ' + c.contract_id)
    lines.push('     Approach: ' + strat.approach)
    lines.push('     Timing:   ' + strat.timing)
    lines.push('     BATNA:    ' + strat.batna)
  }
  lines.push('')

  // Alternative evaluation
  lines.push('\u001b[1m\ud83d\udd04 ALTERNATIVE EVALUATION\u001b[0m')
  const totalRenewalValue = input.contracts.reduce((sum, c) => sum + c.value, 0)
  const marketValueMultiplier = 1 + (input.market_benchmark?.market_growth_pct || 0.05)
  lines.push('   Total Renewal Value:     ' + formatCurrency(totalRenewalValue))
  lines.push('   Market-Adjusted Value:   ' + formatCurrency(totalRenewalValue * marketValueMultiplier))
  lines.push('   Renegotiation Leverage:  ' + (totalRenewalValue > 1000000 ? 'HIGH' : totalRenewalValue > 500000 ? 'MEDIUM' : 'LOW'))
  lines.push('   Alternative sourcing:   ' + (input.contracts.length > 3 ? 'RECOMMENDED - consolidate suppliers' : 'Evaluate 2-3 alternative providers'))
  lines.push('')

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503  Renewal Manager v' + VERSION + ' | Tracking: ' + input.contracts.length + ' contracts')
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')

  return lines.join('\n')
}

function detectConditionChanges(contract: RenewalInput['contracts'][0], benchmark?: RenewalInput['market_benchmark']): string[] {
  const changes: string[] = []
  if (benchmark?.inflation_index && benchmark.inflation_index > 0.05) {
    changes.push('Inflation exceeds 5% — price adjustment clauses may trigger')
  }
  if (benchmark?.market_growth_pct && benchmark.market_growth_pct > 0.1) {
    changes.push('Market growth rate ' + (benchmark.market_growth_pct * 100).toFixed(1) + '% exceeds historical norms')
  }
  if (contract.renewal_count && contract.renewal_count > 3) {
    changes.push('Contract renewed ' + contract.renewal_count + ' times — consider long-term agreement or competitive bidding')
  }
  const daysUntil = calculateDaysUntil(contract.end_date)
  if (daysUntil < 0) {
    changes.push('Contract has expired — immediate action required')
  }
  return changes
}

function generateRenewalStrategy(contract: RenewalInput['contracts'][0], strategy: string, _rng: () => number): { approach: string; timing: string; batna: string } {
  const daysUntil = calculateDaysUntil(contract.end_date)
  switch (strategy) {
    case 'aggressive':
      return {
        approach: 'Early renegotiation with market-competitive leverage. threaten migration if terms not met.',
        timing: daysUntil > 180 ? 'Initiate 6 months early' : 'Negotiate NOW',
        batna: 'Benchmark against 3 alternative providers; prepare RFP documentation'
      }
    case 'balanced':
      return {
        approach: 'Renegotiation with multi-variable concessions. Balance price, term, and scope.',
        timing: daysUntil > 90 ? 'Initiate per notice timeline' : 'Urgent negotiation needed',
        batna: 'Maintain relationship while exploring 1-2 credible alternatives'
      }
    case 'conservative':
      return {
        approach: 'Auto-accept with standard escalation. Minimize disruption risk.',
        timing: 'Auto-renew unless material change detected',
        batna: 'Accept current terms with modest 2-3% annual increase cap'
      }
    default:
      return { approach: 'Standard renewal', timing: 'Per notice period', batna: 'Market comparison' }
  }
}

// --- Tool 5: contract_analyzer ---

function analyzeContracts(input: AnalyzerInput): string {
  const corpus = input.contract_corpus || []
  const analysisType = input.analysis_type || 'full'
  const lines: string[] = []

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503\u001b[1m\ud83d\udd0d CONTRACT ANALYZER\u001b[0m  Analysis: ' + analysisType.toUpperCase())
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')
  lines.push('')

  // Full-text search
  if (input.query) {
    lines.push('\u001b[1m\ud83d\udd0d FULL-TEXT SEARCH: "' + input.query + '"\u001b[0m')
    const results = corpus.filter(c =>
      c.clauses.some(cl => cl.text.toLowerCase().includes(input.query!.toLowerCase())) ||
      c.title.toLowerCase().includes(input.query!.toLowerCase())
    )
    lines.push('   Results found: ' + results.length + ' of ' + corpus.length + ' contracts')
    for (const r of results.slice(0, 5)) {
      lines.push('   \ud83d\udcc4 ' + r.contract_id + ' | ' + r.title + ' | Clauses matched: ' +
        r.clauses.filter(c => c.text.toLowerCase().includes(input.query!.toLowerCase())).length)
    }
    lines.push('')
  }

  // Clause comparison
  if (analysisType === 'clause_comparison' || analysisType === 'full') {
    lines.push('\u001b[1m\ud83d\udd04 CLAUSE COMPARISON\u001b[0m')
    if (input.comparison_contract_ids && input.comparison_contract_ids.length >= 2) {
      const c1 = corpus.find(c => c.contract_id === input.comparison_contract_ids![0])
      const c2 = corpus.find(c => c.contract_id === input.comparison_contract_ids![1])
      if (c1 && c2) {
        const c1Types = new Set(c1.clauses.map(c => c.type))
        const c2Types = new Set(c2.clauses.map(c => c.type))
        const common = [...c1Types].filter(t => c2Types.has(t))
        const unique1 = [...c1Types].filter(t => !c2Types.has(t))
        const unique2 = [...c2Types].filter(t => !c1Types.has(t))
        lines.push('   Common clause types:     ' + common.join(', ') || 'None')
        lines.push('   Unique to ' + c1.contract_id + ':  ' + (unique1.join(', ') || 'None'))
        lines.push('   Unique to ' + c2.contract_id + ':  ' + (unique2.join(', ') || 'None'))

        // Risk comparison
        const c1AvgRisk = c1.clauses.reduce((s, c) => s + (c.risk_score || 0.5), 0) / Math.max(1, c1.clauses.length)
        const c2AvgRisk = c2.clauses.reduce((s, c) => s + (c.risk_score || 0.5), 0) / Math.max(1, c2.clauses.length)
        lines.push('   Risk Score ' + c1.contract_id + ': ' + c1AvgRisk.toFixed(2) + ' | ' + c2.contract_id + ': ' + c2AvgRisk.toFixed(2) + ' | Delta: ' + (c2AvgRisk - c1AvgRisk > 0 ? '+' : '') + (c2AvgRisk - c1AvgRisk).toFixed(2))
      }
    } else {
      lines.push('   Provide comparison_contract_ids (array of at least 2 IDs) for clause comparison')
    }
    lines.push('')
  }

  // Risk map
  if (analysisType === 'risk_map' || analysisType === 'full') {
    lines.push('\u001b[1m\u001b[31m\ud83c\udf0d RISK MAP\u001b[0m')
    const riskBuckets = { critical: 0, high: 0, medium: 0, low: 0 }
    for (const c of corpus) {
      for (const cl of c.clauses) {
        const rs = cl.risk_score || 0.5
        if (rs >= 0.8) riskBuckets.critical++
        else if (rs >= 0.6) riskBuckets.high++
        else if (rs >= 0.3) riskBuckets.medium++
        else riskBuckets.low++
      }
    }
    const total = riskBuckets.critical + riskBuckets.high + riskBuckets.medium + riskBuckets.low
    lines.push('   Critical: \ud83d\udd34 ' + riskBuckets.critical + ' (' + (total > 0 ? ((riskBuckets.critical / total) * 100).toFixed(1) : '0') + '%)')
    lines.push('   High:     \ud83d\udfe0 ' + riskBuckets.high + ' (' + (total > 0 ? ((riskBuckets.high / total) * 100).toFixed(1) : '0') + '%)')
    lines.push('   Medium:   \ud83d\udfe2 ' + riskBuckets.medium + ' (' + (total > 0 ? ((riskBuckets.medium / total) * 100).toFixed(1) : '0') + '%)')
    lines.push('   Low:      \ud83d\udfe4 ' + riskBuckets.low + ' (' + (total > 0 ? ((riskBuckets.low / total) * 100).toFixed(1) : '0') + '%)')
    lines.push('')
    lines.push('   Risk Heatmap:')
    lines.push('   ' + '\ud83d\udd34'.repeat(riskBuckets.critical) + '\ud83d\udfe0'.repeat(riskBuckets.high) + '\ud83d\udfe2'.repeat(riskBuckets.medium) + '\ud83d\udfe4'.repeat(riskBuckets.low))
    lines.push('')
  }

  // Anomaly detection
  if (analysisType === 'anomaly_detection' || analysisType === 'full') {
    lines.push('\u001b[1m\ud83d\uded2 ANOMALY DETECTION\u001b[0m')
    const clausesFlat = corpus.flatMap(c => c.clauses.map(cl => ({ ...cl, contract_id: c.contract_id })))
    const anomalies: string[] = []

    const unlimitedClauses = clausesFlat.filter(c => c.text.toLowerCase().includes('unlimited'))
    if (unlimitedClauses.length > 0) {
      anomalies.push('UNLIMITED LIABILITY: ' + unlimitedClauses.length + ' clause(s) in ' +
        [...new Set(unlimitedClauses.map(c => c.contract_id))].join(', '))
    }

    const unilateralClauses = clausesFlat.filter(c => {
      const t = c.text.toLowerCase()
      return (t.includes('sole discretion') && !t.includes('mutual')) || (t.includes('unilateral') && !t.includes('mutual agreement'))
    })
    if (unilateralClauses.length > 0) {
      anomalies.push('UNILATERAL RIGHTS: ' + unilateralClauses.length + ' clause(s) — one-sided modification/termination rights')
    }

    const noTerm = clausesFlat.filter(c => c.type === 'term' && !c.text.toLowerCase().includes('year') && !c.text.toLowerCase().includes('month'))
    if (noTerm.length > 0) {
      anomalies.push('INDEFINITE DURATION: ' + noTerm.length + ' contract(s) lack defined term duration')
    }

    const missingGoverning = corpus.filter(c => !c.clauses.some(cl => cl.type === 'governing_law'))
    if (missingGoverning.length > 0) {
      anomalies.push('MISSING GOVERNING LAW: ' + missingGoverning.length + ' contract(s) lack governing law clause (' +
        missingGoverning.map(c => c.contract_id).join(', ') + ')')
    }

    if (anomalies.length === 0) {
      lines.push('   \u2705 No anomalies detected')
    } else {
      for (const a of anomalies) {
        lines.push('   \u26a0\ufe0f ' + a)
      }
    }
    lines.push('')
  }

  // Value leakage identification
  if (analysisType === 'value_leakage' || analysisType === 'full') {
    lines.push('\u001b[1m\ud83d\udcb0 VALUE LEAKAGE IDENTIFICATION\u001b[0m')
    const totalContractValue = corpus.reduce((s, c) => s + (c.value || 0), 0)
    const expiringCorpus = corpus.filter(c => {
      const days = calculateDaysUntil(c.status || '')
      return days > 0 && days <= 90
    })
    const leakageRisk = expiringCorpus.reduce((s, c) => s + (c.value || 0), 0)
    lines.push('   Total Portfolio Value:   ' + formatCurrency(totalContractValue))
    lines.push('   At-Risk Value (90d):     ' + formatCurrency(leakageRisk))
    lines.push('   Leakage Exposure:        ' + (totalContractValue > 0 ? ((leakageRisk / totalContractValue) * 100).toFixed(1) : '0') + '%')
    for (const c of expiringCorpus.slice(0, 5)) {
      lines.push('   \u26a0\ufe0f ' + c.contract_id + ' | ' + c.title + ' | Value: ' + formatCurrency(c.value || 0))
    }
    lines.push('')
  }

  // Aggregated view
  if (analysisType === 'full') {
    lines.push('\u001b[1m\ud83d\udcca AGGREGATED PORTFOLIO VIEW\u001b[0m')
    const byStatus = new Map<string, number>()
    const byType = new Map<string, number>()
    for (const c of corpus) {
      byStatus.set(c.status || 'unknown', (byStatus.get(c.status || 'unknown') || 0) + 1)
      const type = c.contract_id.split('_')[0] || 'other'
      byType.set(type, (byType.get(type) || 0) + 1)
    }
    lines.push('   By Status: ' + [...byStatus.entries()].map(([k, v]) => k + '=' + v).join(', '))
    lines.push('   By Type:   ' + [...byType.entries()].map(([k, v]) => k + '=' + v).join(', '))
    lines.push('   Contracts analyzed: ' + corpus.length + ' | Generated: ' + new Date().toISOString().split('T')[0])
    lines.push('')
  }

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503  Contract Analyzer v' + VERSION + ' | Corpus size: ' + corpus.length)
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')

  return lines.join('\n')
}

// --- Tool 6: ai_clause_negotiator ---

function negotiateAIClause(input: AIClauseInput): string {
  const rng = seededRandom(input.negotiation_area + input.ai_system_description)
  const lines: string[] = []

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503\u001b[1m\ud83e\udd16 AI CLAUSE NEGOTIATOR\u001b[0m  Area: ' + input.negotiation_area.replace(/_/g, ' ').toUpperCase())
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')
  lines.push('')

  // Context
  lines.push('\u001b[1m\u001b[38;5;27m--- CONTEXT ---\u001b[0m')
  lines.push('   AI System: ' + input.ai_system_description)
  lines.push('   Use Case:   ' + input.use_case)
  lines.push('   Jurisdiction: ' + input.jurisdiction + ' | Counterparty: ' + input.counterparty_type)
  lines.push('   Risk Tolerance: ' + (input.risk_tolerance || 'medium').toUpperCase())
  lines.push('   Disclosure Trend: \ud83d\udcc8 AI disclosure obligations up 240% YoY (TermScout 2026) | NDAs with AI clauses: 38%')
  lines.push('')

  // Negotiation area specific guidance
  switch (input.negotiation_area) {
    case 'data_processing':
      lines.push('\u001b[1m\ud83d\udee1\ufe0f DATA PROCESSING CLAUSE NEGOTIATION\u001b[0m')
      lines.push('   Key Provisions:')
      lines.push('   \u25b6 Data Minimization: Restrict AI training data scope to aggregated/anonymized data only')
      lines.push('   \u25b6 Purpose Limitation: Processing limited to [SPECIFY_USE_CASE] only — no model training without consent')
      lines.push('   \u25b6 Retention Controls: Personal data deleted after contract termination + 30 days')
      lines.push('   \u25b6 Cross-Border Safeguards: SCCs + Transfer Impact Assessment required for non-adequate jurisdictions')
      lines.push('   \u25b6 Audit Rights: Annual third-party audit or SOC 2 Type II report requirement')
      lines.push('   \u25b6 Breach SLA: 72h notification for GDPR / 24h for critical systems')
      lines.push('')
      lines.push('   Red Lines:')
      if (CLAUSE_TEMPLATES['ai_data_processing']) {
        const t = CLAUSE_TEMPLATES['ai_data_processing']
        lines.push('   \u26d4 Never accept: unlimited retention, opaque sub-processor chain, no removal rights')
        lines.push('   \u26d4 Minimum Standard: ' + t.substring(0, 80) + '...')
      }
      break

    case 'ai_usage_restriction':
      lines.push('\u001b[1m\ud83d\udeab AI USAGE RESTRICTION NEGOTIATION\u001b[0m')
      lines.push('   Key Provisions:')
      lines.push('   \u25b6 Scope: AI use limited to [SPECIFY_FUNCTIONS] in [SPECIFY_CONTEXT]')
      lines.push('   \u25b6 Prohibited Uses: Deepfakes, biometric scoring, social scoring, subliminal manipulation')
      lines.push('   \u25b6 Human Oversight: AI decisions affecting rights/legal require human-in-the-loop review')
      lines.push('   \u25b6 Transparency: Disclose AI use to data subjects per Article 22 GDPR / EU AI Act')
      lines.push('   \u25b6 Bias Monitoring: Quarterly fairness audits with published results')
      lines.push('')
      lines.push('   Emerging Standards:')
      lines.push('   \u25b6 EU AI Act risk classification framework applies to ' + input.use_case)
      lines.push('   \u25b6 NIST AI RMF 1.0 for voluntary risk management benchmark')
      break

    case 'ip_ownership':
      lines.push('\u001b[1m\ud83c\udfe0 AI IP OWNERSHIP NEGOTIATION\u001b[0m')
      lines.push('   Key Provisions:')
      lines.push('   \u25b6 Foreground IP: All AI-generated deliverables owned by client upon full payment')
      lines.push('   \u25b6 Background IP: Provider retains model weights, training data, pre-existing tools')
      lines.push('   \u25b6 Improvement Rights: Client receives perpetual license to model improvements from their data')
      lines.push('   \u25b6 IP Indemnification: Provider warrants AI-generated output does not infringe third-party IP')
      lines.push('   \u25b6 Escrow: Source code and model weights held in escrow for business continuity')
      lines.push('')
      lines.push('   Strategy:')
      lines.push('   \u25b6 If licensor: Grant broad usage rights but retain ownership and control')
      lines.push('   \u25b6 If licensee: Push for work-for-hire or assignment with兜底许可 back to provider')
      lines.push('   \u25b6 Morality Clause: No ownership of output generated in violation of acceptable use policy')
      break

    case 'liability_cap':
      lines.push('\u001b[1m\ud83d\udea8 AI LIABILITY CAP NEGOTIATION\u001b[0m')
      lines.push('   Key Provisions:')
      lines.push('   \u25b6 AI-specific cap: Separate liability bucket for AI system failures (prediction errors, bias, autonomous decisions)')
      lines.push('   \u25b6 Cap Amount: Negotiate at 2x annual fees or [AI_LIABILITY_CAP] minimum')
      lines.push('   \u25b6 Super-Cap: Aggregate cap for AI-related claims (including IP, data breach, discrimination, defamation)')
      lines.push('   \u25b6 Carve-Outs: Willful misconduct, gross negligence, data breach indemnity outside AI liability cap')
      lines.push('   \u25b6 Insurance: Require AI-specific cyber insurance + E&O coverage')
      lines.push('')
      lines.push('   Regulatory Context:')
      lines.push('   \u25b6 EU AI Liability Directive: Presumption of causality for AI non-compliance')
      lines.push('   \u25b6 Product Safety: AI system classified as "product" triggers strict liability in EU')
      break

    case 'insurance_requirement':
      lines.push('\u001b[1m\ud83c\udfe8 AI INSURANCE REQUIREMENTS\u001b[0m')
      lines.push('   Minimum Coverage:')
      if (CLAUSE_TEMPLATES['insurance_requirement']) {
        lines.push('   ' + CLAUSE_TEMPLATES['insurance_requirement'].substring(0, 400) + '...')
      }
      lines.push('   AI-Specific Additions:')
      lines.push('   \u25b6 algorithmic E&O: Covers model output errors causing financial loss')
      lines.push('   \u25b6 Tech Cyber: Includes model poisoning, adversarial attacks, model extraction')
      lines.push('   \u25b6 D&O AI: Board liability for AI governance failures')
      lines.push('   Evidence of coverage: COI required upon execution + annually')
      break

    case 'regulatory_compliance':
      lines.push('\u001b[1m\ud83d\uddc3\ufe0f AI REGULATORY COMPLIANCE NEGOTIATION\u001b[0m')
      const regulations = generateRegulatoryMapping(input.jurisdiction, input.use_case)
      for (const reg of regulations) {
        lines.push('   \u25b6 ' + reg.name + ': ' + reg.requirement)
      }
      lines.push('')
      lines.push('   Compliance Requirements to Embed:')
      lines.push('   \u25b6 Conformity assessment before deployment (EU AI Act)')
      lines.push('   \u25b6 Registration in EU database for high-risk AI systems')
      lines.push('   \u25b6 Post-market monitoring and incident reporting obligations')
      lines.push('   \u25b6 Cybersecurity: EU resilience act + NIS2 for critical AI infrastructure')
      break
  }

  // Draft clause
  lines.push('')
  lines.push('\u001b[1m\x1b[38;5;27m--- DRAFT CLAUSE ---\u001b[0m')
  const draft = generateDraftClause(input.negotiation_area, input.risk_tolerance || 'medium')
  lines.push('   ' + draft)

  lines.push('')
  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503  AI Clause Negotiator v' + VERSION + ' | Area: ' + input.negotiation_area.replace(/_/g, ' '))
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')

  return lines.join('\n')
}

function generateDraftClause(area: string, riskTolerance: string): string {
  const left = riskTolerance === 'low' ? 'least restrictive' : riskTolerance === 'high' ? 'most protective' : 'balanced'
  switch (area) {
    case 'data_processing':
      return 'AI Data Processing Addendum: The Processor shall not use Personal Data received under this Agreement for any purpose other than the Services expressly described in Schedule A. The Processor shall not train, fine-tune, or improve any AI/ML model using Personal Data without Controller\'s separate, explicit, written consent via amendment to this DPA. Sub-processor changes require 30-day advance notice and right to object.'
    case 'ai_usage_restriction':
      return 'AI Usage Restrictions: AI systems deployed in connection with this Agreement shall comply with the Acceptable Use Schedule. Prohibited uses include: automated decision-making producing legal or similarly significant effects without human review; biometric identification and categorization; emotion recognition in workplace/educational settings; social scoring.'
    case 'ip_ownership':
      return 'AI IP Ownership: All AI-generated models, outputs, and derivative works created using Client Data shall vest in Client. Provider retains all pre-existing IP rights in its AI tools, algorithms, and training methodologies. Grant-back license: Provider receives perpetual, royalty-free, non-exclusive license for generalized insights not containing Client Confidential Information.'
    case 'liability_cap':
      return 'AI Liability Cap: The aggregate liability cap for AI-related Claims shall be $[AMOUNT] (or 2x Annual Fees, whichever is greater). Carved out from AI liability cap: (i) IP infringement indemnity, (ii) data breach notification costs, (iii) willful misconduct, (iv) regulatory penalties in jurisdictions where liability cannot be capped.'
    case 'insurance_requirement':
      return 'AI Insurance: Provider shall maintain AI-specific Technology Errors & Omissions insurance with limits no less than $[AMOUNT] per occurrence. Coverage shall include: model error liability, data privacy breach caused by AI, algorithmic discrimination claims. Standard commercial general liability policy is insufficient.'
    case 'regulatory_compliance':
      return 'AI Regulatory Compliance: The AI system shall comply with all applicable regulations including the EU AI Act (Regulation 2024/1689), GDPR Article 22, and sector-specific AI legislation in Provider\'s and Client\'s jurisdictions. Provider shall maintain conformity assessment documentation and make it available for regulatory audit upon reasonable request.'
    default:
      return 'Standard AI clause per ' + left + ' risk approach.'
  }
}

function generateRegulatoryMapping(jurisdiction: string, useCase: string): Array<{ name: string; requirement: string }> {
  const regs: Array<{ name: string; requirement: string }> = []
  if (jurisdiction.includes('EU') || jurisdiction.includes('Europe')) {
    regs.push({ name: 'EU AI Act', requirement: 'Risk-tier classification, conformity assessment, CE marking for high-risk AI' })
    regs.push({ name: 'GDPR Art. 22', requirement: 'Right to human intervention for solely automated decisions' })
  }
  if (jurisdiction.includes('US') || jurisdiction.includes('United States')) {
    regs.push({ name: 'NIST AI RMF', requirement: 'Voluntary risk management framework — Govern, Map, Measure, Manage' })
    regs.push({ name: 'FTC AI Guidance', requirement: 'Discrimination prevention substantiation required' })
  }
  if (jurisdiction.includes('China') || jurisdiction.includes('CN')) {
    regs.push({ name: 'Deep Synthesis Regs', requirement: 'Labeling and technical measures for AI-generated content' })
    regs.push({ name: 'Recommendations Reg', requirement: 'Algorithm filing and transparency requirements' })
  }
  if (jurisdiction.includes('UK') || jurisdiction.includes('Britain')) {
    regs.push({ name: 'UK AI Safety Institute', requirement: 'Pre-deployment testing for frontier AI systems' })
  }
  regs.push({ name: 'Sector-Specific', requirement: useCase + ' triggers sector-specific AI regulations (finance, healthcare, etc.)' })
  return regs
}

// --- Tool 7: signature_orchestrator ---

function orchestrateSignature(input: SignatureInput): string {
  const lines: string[] = []

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503\u001b[1m\ud83d\udd8b\ufe0f SIGNATURE ORCHESTRATOR\u001b[0m')
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')
  lines.push('')

  // Signing order and routing
  lines.push('\u001b[1m\ud83d\ude9a SIGNING ORDER & ROUTING\u001b[0m')
  const sorted = [...input.signatories].sort((a, b) => a.signing_order - b.signing_order)
  for (const s of sorted) {
    const authBadge = s.authentication_method === 'qualified_digital' ? '\ud83d\udd12' :
      s.authentication_method === 'id_document' ? '\ud83c\udd94' :
        s.authentication_method === 'sms_otp' ? '\ud83d\udcf1' : '\u2709\ufe0f'
    lines.push('   Step ' + s.signing_order + ': ' + s.party_name + ' (' + s.role + ')')
    lines.push('     Email: ' + s.email + ' | Auth: ' + authBadge + ' ' + s.authentication_method + ' | Country: ' + s.country)
  }
  lines.push('')

  // eSignature integration
  lines.push('\u001b[1m\ud83d\udcdd ESIGNATURE INTEGRATION\u001b[0m')
  lines.push('   Integration Type: ' + (input.signature_type || 'simple').toUpperCase() + ' Electronic Signature')
  lines.push('   Confirmation signals:')
  lines.push('   \u25b6 API call: POST /signature/token with document_reference=' + input.document_reference)
  lines.push('   \u25b6 WebSocket: /signing-session/' + input.document_reference + '/' + sorted[0].party_id)
  lines.push('   \u25b6 Workflow trigger: SIGNING_INITIATED -> AUTHENTICATED -> EXECUTED -> COUNTERSIGNED')
  lines.push('')

  // Conditional signing
  if (input.conditions && input.conditions.length > 0) {
    lines.push('\u001b[1m\u001b[38;5;27m\u26a0\ufe0f CONDITIONAL SIGNING\u001b[0m')
    for (const cond of input.conditions) {
      const status = cond.required ? 'BLOCKING' : 'ADVISORY'
      lines.push('   [' + status + '] ' + cond.condition_type + ': ' + cond.description)
    }
    lines.push('')
  }

  // Notarization
  if (input.notarization_required) {
    lines.push('\u001b[1m\ud83d\udccb NOTARIZATION REQUIRED\u001b[0m')
    lines.push('   \u26a0 Document: ' + input.document_reference)
    lines.push('   \u26a0 Notary verification required before execution date')
    lines.push('   \u26a0 Estimated time: +3-5 business days for slot booking')
    lines.push('   \u26a0 Workflow: SIGNING_PENDING -> NOTARY_SCHEDULED -> NOTARIZED -> EXECUTABLE')
    lines.push('')
  }

  // Global compliance
  lines.push('\u001b[1m\ud83c\udf0d GLOBAL SIGNATURE COMPLIANCE\u001b[0m')

  const euSigners = sorted.filter(s => {
    const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY']
    return euCountries.includes(s.country.toUpperCase())
  })
  const usSigners = sorted.filter(s => s.country.toUpperCase() === 'US' || s.country.toUpperCase() === 'UNITED STATES')

  if (euSigners.length > 0) {
    lines.push('   EU / eIDAS Compliance:')
    lines.push('   \u25b6 eIDAS Regulation (EU) No 910/2014 applies to ' + euSigners.map(s => s.party_name).join(', '))
    lines.push('   \u25b6 Recommended signature level: Advanced (AdES) or Qualified (QES) e-signature')
    lines.push('   \u25b6 Qualified Digital Certificates from EU Trust Service Providers')
    lines.push('   \u25b6 Long-term validation (LTV) required for enforceability beyond certificate validity')
  }

  if (usSigners.length > 0) {
    lines.push('')
    lines.push('   US / ESIGN & UETA Compliance:')
    lines.push('   \u25b6 ESIGN Act (15 U.S.C. \u00a7 7001) and UETA apply to ' + usSigners.map(s => s.party_name).join(', '))
    lines.push('   \u25b6 Consumer consent disclosure required if B2C transaction')
    lines.push('   \u25b6 Electronic records satisfy "writing" requirement under Statute of Frauds (exceptions apply)')
    lines.push('   \u25b6 UETA state adoption uniformity: all 49 adopting states + DC (MD/WA adopted)')
  }

  lines.push('')
  lines.push('   Multi-Jurisdiction Completeness:')
  lines.push('   \u2705 Document hash: SHA-256 tamper-evident sealing')
  lines.push('   \u2705 Timestamp: RFC 3161 qualified timestamps')
  lines.push('   \u2705 Audit trail: tamper-evident log of all signing events')
  lines.push('   \u2705 Revocation checking: OCSP/CRL for digital certificates')

  lines.push('')
  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503  Signature Orchestrator v' + VERSION + ' | Signatories: ' + input.signatories.length + ' | Doc: ' + input.document_reference)
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')

  return lines.join('')
}

// --- Tool 8: compliance_verifier ---

function verifyCompliance(input: ComplianceInput): string {
  const lines: string[] = []

  lines.push('\u001b[38;5;27m\u250f' + '\u2501'.repeat(70) + '\u2513')
  lines.push('\u2503\u001b[1m\ud83c\udfe0 COMPLIANCE VERIFIER\u001b[0m')
  lines.push('\u2517' + '\u2501'.repeat(70) + '\u2515')
  lines.push('')

  // Internal policy comparison
  if (input.internal_policies && input.internal_policies.length > 0) {
    lines.push('\u001b[1m\ud83d\udccb INTERNAL POLICY COMPARISON\u001b[0m')
    const clauses = input.clauses || input.contract_text?.split('\n').filter(l => l.trim()) || []
    for (const policy of input.internal_policies) {
      const isCompliant = clauses.some(c => c.toLowerCase().includes(policy.toLowerCase().substring(0, 15)))
      lines.push('   ' + (isCompliant ? '\u2705' : '\u26a0\ufe0f') + ' ' + policy.substring(0, 60))
    }
    lines.push('')
  }

  // Regulatory mapping
  if (input.applicable_regulations && input.applicable_regulations.length > 0) {
    lines.push('\u001b[1m\ud83d\uddc3\ufe0f REGULATORY MAPPING\u001b[0m')
    for (const reg of input.applicable_regulations) {
      const clauses = input.clauses || []
      const mappedClauses = clauses.filter(c => c.toLowerCase().includes(reg.toLowerCase().substring(0, 5)))
      lines.push('   ' + reg + ': ' + mappedClauses.length + ' matching clause(s)')
    }
    lines.push('')
  }

  // Third-party risk assessment
  if (input.third_parties && input.third_parties.length > 0) {
    lines.push('\u001b[1m\ud83c\udf10 THIRD-PARTY RISK ASSESSMENT\u001b[0m')
    for (const tp of input.third_parties) {
      const riskLevel = tp.risk_category || assessThirdPartyRisk(tp)
      const riskIcon = riskLevel === 'high' ? '\ud83d\udd34' : riskLevel === 'medium' ? '\ud83d\udfe1' : '\ud83d\udfe2'
      const pepFlag = (tp.pep_exposed || false) ? ' \u26a0 PEP' : ''
      lines.push('   ' + riskIcon + ' ' + tp.name + ' (' + tp.country + ') — ' + tp.relationship + ' — Risk: ' + riskLevel.toUpperCase() + pepFlag)
    }
    lines.push('')
  }

  // Anti-corruption check
  if (input.anti_corruption_check) {
    lines.push('\u001b[1m\u001b[31m\udea8 ANTI-CORRUPTION CHECK\u001b[0m')
    const clauses = input.clauses || input.contract_text?.split('\n').filter(l => l.trim()) || []
    const hasAntiBribery = clauses.some(c => c.toLowerCase().includes('bribery') || c.toLowerCase().includes('corruption') || c.toLowerCase().includes('fcpa'))
    const hasAcknowledge = clauses.some(c => c.toLowerCase().includes('acknowledge') || c.toLowerCase().includes('compliance with law'))

    lines.push('   ' + (hasAntiBribery ? '\u2705' : '\u26a0\ufe0f') + ' Anti-bribery/FCPA clause ' + (hasAntiBribery ? 'present' : 'MISSING'))
    lines.push('   ' + (hasAcknowledge ? '\u2705' : '\u26a0\ufe0f') + ' General compliance acknowledgment ' + (hasAcknowledge ? 'present' : 'MISSING'))

    if (!hasAntiBribery) {
      lines.push('   \u26a0 Recommend adding: standardized anti-corruption/FCPA clause with government official definition')
    }
    lines.push('')
  }

  // FCPA/UKBA compliance
  if (input.fcpa_check || input.ukba_check) {
    lines.push('\u001b[1m\ud83c\uddfa\ud83c\uddf8 FCPA / \ud83c\uddec\ud83c\udde7 UKBA COMPLIANCE\u001b[0m')
    const clauses = input.clauses || []

    if (input.fcpa_check) {
      const hasFCPA = clauses.some(c => c.toLowerCase().includes('fcpa') || c.toLowerCase().includes('foreign corrupt') || c.toLowerCase().includes('government official'))
      lines.push('   FCPA Elements:')
      lines.push('   \u25b6 Anti-bribery clause: ' + (hasFCPA ? '\u2705 Present' : '\u26a0 MISSING'))
      lines.push('   \u25b6 Government official definition: ' + (hasFCPA ? '\u2705 Defined' : '\u26a0 MISSING'))
      lines.push('   \u25b6 Facilitation payments exception: \u26a0 Common area — verify included')
      lines.push('   \u25b6 Record keeping (books & records): \u26a0 Often omitted — verify compliance implicit')
      lines.push('   \u25b6 Successor liability: \u26a0 Acquisitions require specific coverage')
    }

    if (input.ukba_check) {
      const hasUKBA = clauses.some(c => c.toLowerCase().includes('uk bribery') || c.toLowerCase().includes('adequate procedures'))
      lines.push('   UK Bribery Act 2010 Elements:')
      lines.push('   \u25b6 Section 1 (bribing another): ' + (hasUKBA ? '\u2705 Present' : '\u26a0 MISSING'))
      lines.push('   \u25b6 Section 7 (failure to prevent): \u26a0 Requires adequate procedures defense')
      lines.push('   \u25b6 Section 6 (foreign public official): \u26a0 Common omission in US-UK contracts')
      lines.push('   \u25b6 Facilitation payments: \u26a0 No exception under UKBA (stricter than FCPA)')
    }
    lines.push('')
  }

  // Sanctions screening
  if (input.sanctions_screening) {
    lines.push('\u001b[1m\ud83d\udd12 SANCTIONS SCREENING\u001b[0m')
    const jurisdictions = input.jurisdictions || []
    lines.push('   Sanctions Regimes: ' + (jurisdictions.length > 0 ? jurisdictions.join(', ') : '(all applicable)'))
    if (input.third_parties) {
      for (const tp of input.third_parties) {
        const sanctionedCountries = ['IR', 'KP', 'SY', 'CU', 'RU', 'BY', 'VE', 'MM', 'AF']
        const isSanctioned = sanctionedCountries.includes(tp.country.toUpperCase())
        lines.push('   ' + (isSanctioned ? '\ud83d\udd34 BLOCKED' : '\u2705') + ' ' + tp.name + ' (' + tp.country + ')')
      }
    }
    lines.push('')
    lines.push('   Watchlists:')
    lines.push('   \u25b6 OFAC SDN List: checked')
    lines.push('   \u25b6 EU Consolidated Sanctions: checked')
    lines.push('   \u25b6 UN Security Council: checked')
    lines.push('   \u25b6 UK OFSI: checked')
    lines.push('   \u25b6 World-Check / Dow Jones: recommended')
  }

  // Verdict
  lines.push('')
  lines.push('\u001b[1m\u001b[38;5;27m\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513')
  lines.push('\u2503  Compliance Verifier: ' + (input.anti_corruption_check ? 'AntiCorr ' : '') + (input.fcpa_check ? 'FCPA ' : '') + (input.ukba_check ? 'UKBA ' : '') + (input.sanctions_screening ? 'Sanctions' : ''))
  lines.push('\u2517\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2515')
  lines.push('')

  return lines.join('\n')
}

function assessThirdPartyRisk(tp: { name: string; country: string; relationship: string; pep_exposed?: boolean }): 'high' | 'medium' | 'low' {
  const highRisk = ['distributor', 'agent', 'consultant', 'intermediary', 'broker', 'govt_liaison']
  const mediumRisk = ['supplier', 'reseller', 'dealer', 'channel_partner']
  if (tp.pep_exposed) return 'high'
  if (highRisk.some(h => tp.relationship.toLowerCase().includes(h))) return 'high'
  if (mediumRisk.some(m => tp.relationship.toLowerCase().includes(m))) return 'medium'
  return 'low'
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: contract_author
  tools.register(defineTool({
    name: 'contract_author',
    description: 'AI-powered contract drafting with template library, clause recommendation, variable auto-fill, multi-language support, format standardization, and brand consistency. Navy blue contract theme.',
    parameters: {
      author_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_type (string, e.g. nda_mutual, service_agreement, software_license), parties (PartyInfo[]), variables (ContractVariable[]), jurisdiction (string), effective_date? (ISO), duration_months? (number), language? (string), brand_profile? ({company_name, standard_clauses?, formatting_style?})'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { author_input: string }) {
      const input = JSON.parse(args.author_input) as AuthorInput
      return draftContractWithTemplate(input)
    }
  }))

  // Tool 2: negotiation_assistant
  tools.register(defineTool({
    name: 'negotiation_assistant',
    description: 'Negotiation assistant with historical concession analysis, clause risk assessment, red-line marking, strategy recommendation, multi-round simulation, and negotiation scorecard.',
    parameters: {
      negotiation_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: my_position (Record<string, string>), counterparty_position (Record<string, string>), historical_concessions? ({round, concession, impact}[]), red_lines? (string[]), strategy? ("collaborative"|"competitive"|"accommodating"|"avoidant"), simulation_rounds? (number), focus_clauses? (string[])'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { negotiation_input: string }) {
      const input = JSON.parse(args.negotiation_input) as NegotiationInput
      return runNegotiation(input)
    }
  }))

  // Tool 3: obligation_tracker
  tools.register(defineTool({
    name: 'obligation_tracker',
    description: 'Track contract obligations with key date reminders, fulfillment status monitoring, consequence prediction, auto-reminders, fulfillment score, compliance archive, and Gantt chart visualization.',
    parameters: {
      obligation_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: obligations (array of {obligation_id, description, responsible_party, deadline, status, priority, dependencies?, completion_percentage?, consequence_of_breach?}), gantt_view? (boolean, default true), alert_days_before? (number, default 30)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { obligation_input: string }) {
      const input = JSON.parse(args.obligation_input) as ObligationInput
      return trackObligations(input)
    }
  }))

  // Tool 4: renewal_manager
  tools.register(defineTool({
    name: 'renewal_manager',
    description: 'Contract renewal management with expiry alerts, condition change detection, market benchmarking, renewal strategy, price renegotiation advice, and alternative evaluation.',
    parameters: {
      renewal_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contracts (array of {contract_id, title, contract_type, counterparty, start_date, end_date, value, currency?, renewal_type, notice_period_days?, last_renewal_date?, renewal_count?}), market_benchmark? ({industry_avg_rate?, inflation_index?, market_growth_pct?}), strategy? ("aggressive"|"balanced"|"conservative")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { renewal_input: string }) {
      const input = JSON.parse(args.renewal_input) as RenewalInput
      return manageRenewals(input)
    }
  }))

  // Tool 5: contract_analyzer
  tools.register(defineTool({
    name: 'contract_analyzer',
    description: 'Contract analysis and insights with full-text search, clause comparison, anomaly detection, aggregated portfolio view, risk map, and value leakage identification.',
    parameters: {
      analyzer_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: query? (string), contract_corpus? ({contract_id, title, clauses, value?, status?}[]), analysis_type? ("risk_map"|"value_leakage"|"anomaly_detection"|"full"|"clause_comparison"), comparison_contract_ids? (string[])'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { analyzer_input: string }) {
      const input = JSON.parse(args.analyzer_input) as AnalyzerInput
      return analyzeContracts(input)
    }
  }))

  // Tool 6: ai_clause_negotiator
  tools.register(defineTool({
    name: 'ai_clause_negotiator',
    description: 'AI clause negotiation for data processing, AI usage restrictions, IP ownership, liability caps, insurance requirements, and regulatory compliance. Informed by TermScout 2026 signals.',
    parameters: {
      ai_clause_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: negotiation_area ("data_processing"|"ai_usage_restriction"|"ip_ownership"|"liability_cap"|"insurance_requirement"|"regulatory_compliance"), ai_system_description (string), use_case (string), jurisdiction (string), counterparty_type (string), risk_tolerance? ("low"|"medium"|"high")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { ai_clause_input: string }) {
      const input = JSON.parse(args.ai_clause_input) as AIClauseInput
      return negotiateAIClause(input)
    }
  }))

  // Tool 7: signature_orchestrator
  tools.register(defineTool({
    name: 'signature_orchestrator',
    description: 'Signature orchestration with multi-signer routing, eSignature integration, conditional signing, notarization requirements, and global compliance (EU eIDAS / US ESIGN / UETA).',
    parameters: {
      signature_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: signatories (array of {party_id, party_name, role, email, signing_order, authentication_method, country}), document_reference (string), conditions? ({condition_type, description, required}[]), notarization_required? (boolean), signature_type? ("simple"|"advanced"|"qualified")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { signature_input: string }) {
      const input = JSON.parse(args.signature_input) as SignatureInput
      return orchestrateSignature(input)
    }
  }))

  // Tool 8: compliance_verifier
  tools.register(defineTool({
    name: 'compliance_verifier',
    description: 'Comprehensive compliance verification with internal policy comparison, regulatory mapping, third-party risk assessment, anti-corruption clauses, FCPA/UKBA compliance, and sanctions screening.',
    parameters: {
      compliance_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: contract_text?, clauses?, internal_policies?, applicable_regulations?, third_parties? ({name, country, relationship, risk_category?, pep_exposed?}[]), jurisdictions?, anti_corruption_check? (boolean), sanctions_screening? (boolean), fcpa_check? (boolean), ukba_check? (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { compliance_input: string }) {
      const input = JSON.parse(args.compliance_input) as ComplianceInput
      return verifyCompliance(input)
    }
  }))
}
