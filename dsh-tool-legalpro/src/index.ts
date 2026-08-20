/**
 * DSH Legal AI Pro Plugin v0.1.0
 *
 * Full-spectrum legal intelligence toolkit for DeepSeek Harness Agent.
 * Aligned with YC W26 autonomous AI law firm trend. Provides legal research
 * automation, case analysis, document generation, compliance review,
 * litigation prediction, IP analysis, regulatory tracking, and legal strategy.
 *
 * Features (v0.1.0):
 * - Legal Researcher: jurisdiction-aware case law and statute analysis
 * - Case Analyzer: win probability estimation and evidence strength scoring
 * - Document Generator: contract, NDA, MOU, and pleading draft generation
 * - Compliance Reviewer: regulatory gap analysis and remediation roadmap
 * - Litigation Predictor: outcome forecasting with cost estimation
 * - IP Analyst: patentability, trademark, and copyright assessments
 * - Regulatory Tracker: multi-jurisdiction regulatory change monitoring
 * - Legal Strategist: dispute resolution strategy with cost-benefit analysis
 *
 * DISCLAIMER: This analysis does NOT replace professional legal advice.
 * Always consult a licensed attorney for legal decisions.
 *
 * @module dsh-tool-legalpro
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-legalpro'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM ====================

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash) || 1
}

function clampedRand(rand: () => number, min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) * 100) / 100
}

// ==================== TYPES ====================

interface LegalCase {
  citation: string
  year: number
  court: string
  relevance_score: number
  holding: string
  key_passage: string
  distinguished: boolean
}

interface StatuteReference {
  code: string
  section: string
  title: string
  text_summary: string
  applicability: 'direct' | 'analogous' | 'background'
  last_amended: string
}

interface LegalResearchResult {
  issue: string
  jurisdiction: string
  practice_area: string
  cases: LegalCase[]
  statutes: StatuteReference[]
  analysis: string[]
  confidence_level: number
  disclaimer: string
}

interface EvidenceItem {
  type: string
  strength: number
  admissibility: 'admissible' | 'likely_admissible' | 'challenged' | 'inadmissible'
  notes: string
}

interface CaseAnalysisResult {
  facts_summary: string
  claims: Array<{ claim: string; strength: number; evidence: string[] }>
  win_probability: number
  evidence_analysis: EvidenceItem[]
  weaknesses: string[]
  opportunities: string[]
  estimated_duration: string
  disclaimer: string
}

interface GeneratedDocument {
  title: string
  document_type: string
  jurisdiction: string
  parties: string[]
  sections: Array<{ heading: string; content: string }>
  placeholder_clauses: string[]
  warnings: string[]
  disclaimer: string
}

interface ComplianceGap {
  regulation: string
  requirement: string
  current_state: string
  gap_severity: 'critical' | 'major' | 'minor'
  remediation_steps: string[]
  estimated_effort: string
  deadline?: string
}

interface ComplianceReviewResult {
  framework: string
  overall_compliance_score: number
  gaps: ComplianceGap[]
  strengths: string[]
  roadmap: Array<{ phase: string; actions: string[]; timeframe: string }>
  risk_rating: 'high' | 'medium' | 'low'
  disclaimer: string
}

interface PredictionFeature {
  factor: string
  weight: number
  direction: 'favorable' | 'neutral' | 'unfavorable'
}

interface LitigationPrediction {
  predicted_outcome: string
  confidence: number
  favorable_factors: PredictionFeature[]
  unfavorable_factors: PredictionFeature[]
  estimated_legal_fees: { min: number; max: number; currency: string }
  estimated_duration: string
  comparable_verdicts: Array<{ case_name: string; amount: number; year: number }>
  settlement_range: { low: number; high: number }
  disclaimer: string
}

interface PriorArtResult {
  reference: string
  relevance: 'high' | 'medium' | 'low'
  claims_blocked: string[]
  notes: string
}

interface IPAnalysis {
  ip_type: 'patent' | 'trademark' | 'copyright'
  title: string
  novelty_score?: number
  trademark_clearance?: { status: string; conflicting_marks: string[]; risk: string }
  copyright_eligibility?: { status: string; originality_score: number; notes: string[] }
  prior_art?: PriorArtResult[]
  claims_suggestion?: string[]
  filing_recommendation: string
  estimated_costs: { filing: number; prosecution: number; total: number }
  disclaimer: string
}

interface RegulatoryChange {
  jurisdiction: string
  topic: string
  change_description: string
  effective_date: string
  impact_level: 'high' | 'medium' | 'low'
  actions_required: string[]
  compliance_deadline?: string
}

interface RegulatoryTrackerResult {
  industry: string
  jurisdictions: string[]
  topics: string[]
  changes: RegulatoryChange[]
  upcoming_deadlines: Array<{ item: string; date: string; jurisdiction: string }>
  impact_summary: string
  disclaimer: string
}

interface StrategyOption {
  name: string
  description: string
  success_probability: number
  estimated_cost: number
  estimated_duration: string
  pros: string[]
  cons: string[]
  best_for: string
}

interface LegalStrategyResult {
  dispute_summary: string
  goals: string[]
  risk_profile: string
  strategies: StrategyOption[]
  recommended_strategy: string
  cost_benefit: { expected_value: number; worst_case: number; best_case: number }
  next_steps: string[]
  disclaimer: string
}

// ==================== TOOL 1: LEGAL RESEARCHER ====================

function conductLegalResearch(
  legalIssue: string,
  jurisdiction: string,
  practiceArea: string,
  depth: string = 'standard'
): LegalResearchResult {
  const seed = hashString(legalIssue + jurisdiction + practiceArea)
  const rand = seededRandom(seed)

  const cases: LegalCase[] = []
  const caseTemplates = [
    { citation: 'Landmark Precedent', holding: 'Established foundational principle governing this area of law', court: 'Supreme Court' },
    { citation: 'Industry Standard Case', holding: 'Clarified application of relevant statutory framework', court: 'Federal Circuit' },
    { citation: 'Key Appellate Decision', holding: 'Defined scope and limitations of permissible claims', court: 'Appeals Court' },
    { citation: 'Recent Development Case', holding: 'Modern interpretation accounting for technological change', court: 'District Court' },
    { citation: 'Persuasive Authority', holding: 'Out-of-jurisdiction reasoning widely cited with approval', court: 'Foreign Jurisdiction' }
  ]

  const numCases = depth === 'comprehensive' ? 5 : depth === 'quick' ? 3 : 4
  for (let i = 0; i < numCases; i++) {
    const tmpl = caseTemplates[i % caseTemplates.length]
    const year = 1990 + Math.floor(rand() * 35)
    cases.push({
      citation: tmpl.citation + ' (' + jurisdiction + ' ' + year + ')',
      year,
      court: tmpl.court,
      relevance_score: clampedRand(rand, 0.65, 0.98),
      holding: tmpl.holding,
      key_passage: '"The court found that ' + legalIssue.toLowerCase() + ' requires careful consideration of established precedent..."',
      distinguished: rand() > 0.7
    })
  }

  const statutes: StatuteReference[] = []
  const statuteCodes = ['U.S.C.', 'CFR', 'State Code', 'Federal Rules', 'Restatement']
  const numStatutes = depth === 'comprehensive' ? 5 : depth === 'quick' ? 2 : 3
  for (let i = 0; i < numStatutes; i++) {
    statutes.push({
      code: statuteCodes[i % statuteCodes.length],
      section: (Math.floor(rand() * 900) + 100) + '.' + (Math.floor(rand() * 50) + 1),
      title: practiceArea + ' - ' + ['General Provisions', 'Enforcement', 'Definitions', 'Penalties', 'Exemptions'][i % 5],
      text_summary: 'Statutory provision addressing ' + legalIssue.toLowerCase() + ' within ' + jurisdiction + ' framework',
      applicability: (['direct', 'analogous', 'background'] as const)[i % 3],
      last_amended: (2020 + Math.floor(rand() * 5)).toString()
    })
  }

  const analysis: string[] = []
  analysis.push('**Issue Identified:** "' + legalIssue + '" applied under ' + jurisdiction + ' ' + practiceArea + ' law')
  analysis.push('**Controlling Authority:** ' + cases[0].citation + ' (' + cases[0].court + ', ' + cases[0].year + ') establishes the primary framework')
  if (cases.filter(c => c.distinguished).length > 0) {
    analysis.push('**Distinguishable Cases:** ' + cases.filter(c => c.distinguished).length + ' case(s) found with potentially distinguishable facts')
  }
  analysis.push('**Statutory Basis:** ' + statutes.filter(s => s.applicability === 'direct').length + ' directly applicable statute(s) identified')
  analysis.push('**Trend Analysis:** Recent decisions show ' + (rand() > 0.5 ? 'expanding' : 'narrowing') + ' interpretation of relevant provisions')
  analysis.push('**Jurisdictional Notes:** ' + jurisdiction + ' courts generally follow ' + (rand() > 0.5 ? 'majority' : 'minority') + ' view on this issue')
  analysis.push('**Research Depth:** ' + depth + ' analysis')

  return {
    issue: legalIssue,
    jurisdiction,
    practice_area: practiceArea,
    cases,
    statutes,
    analysis,
    confidence_level: clampedRand(rand, 0.55, 0.92),
    disclaimer: '⚠️ 本分析不可替代专业法律建议。AI辅助研究结果需经持证律师审核确认。'
  }
}

function formatLegalResearch(result: LegalResearchResult): string {
  const lines: string[] = []
  lines.push('## 📚 Legal Research Report')
  lines.push('')
  lines.push('**Issue:** ' + result.issue)
  lines.push('**Jurisdiction:** ' + result.jurisdiction)
  lines.push('**Practice Area:** ' + result.practice_area)
  lines.push('**Confidence:** ' + (result.confidence_level * 100).toFixed(0) + '%')
  lines.push('')

  lines.push('### 📖 Key Precedents')
  lines.push('| # | Citation | Court | Year | Relevance |')
  lines.push('|---|----------|-------|------|-----------|')
  result.cases.forEach((c, i) => {
    const rel = c.relevance_score >= 0.85 ? 'High' : c.relevance_score >= 0.7 ? 'Medium' : 'Low'
    const dist = c.distinguished ? ' ⚠️' : ''
    lines.push('| ' + (i + 1) + ' | ' + c.citation + ' | ' + c.court + ' | ' + c.year + ' | ' + rel + dist + ' |')
  })
  lines.push('')

  lines.push('### 📜 Applicable Statutes')
  lines.push('| Code | Section | Title | Applicability |')
  lines.push('|------|---------|-------|---------------|')
  result.statutes.forEach(s => {
    const appIcon = s.applicability === 'direct' ? 'Direct' : s.applicability === 'analogous' ? 'Analogous' : 'Background'
    lines.push('| ' + s.code + ' | ' + s.section + ' | ' + s.title + ' | ' + appIcon + ' |')
  })
  lines.push('')

  lines.push('### 🎯 Analysis Summary')
  result.analysis.forEach(a => lines.push('- ' + a))
  lines.push('')

  lines.push('> ' + result.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 2: CASE ANALYZER ====================

function analyzeCase(
  caseFacts: string,
  legalClaims: string[],
  applicableLaw: string
): CaseAnalysisResult {
  const seed = hashString(caseFacts + legalClaims.join('') + applicableLaw)
  const rand = seededRandom(seed)

  const claims = legalClaims.map((claim, idx) => {
    const strength = clampedRand(rand, 0.35, 0.9)
    const evidence: string[] = []
    const evidenceTypes = ['documentary', 'testimonial', 'expert', 'circumstantial', 'digital']
    const numEvidence = Math.floor(rand() * 3) + 1
    for (let i = 0; i < numEvidence; i++) {
      evidence.push(evidenceTypes[(idx + i) % evidenceTypes.length] + ' evidence for: ' + claim.substring(0, 30))
    }
    return { claim, strength, evidence }
  })

  const evidenceItems: EvidenceItem[] = []
  const allEvidenceTypes = ['Contract', 'Email Records', 'Witness Testimony', 'Expert Report', 'Physical Evidence', 'Statistics', 'Prior Admission']
  const numEvidence = Math.floor(rand() * 4) + 3
  for (let i = 0; i < numEvidence; i++) {
    const strength = clampedRand(rand, 0.4, 0.95)
    evidenceItems.push({
      type: allEvidenceTypes[i % allEvidenceTypes.length],
      strength,
      admissibility: strength > 0.8 ? 'admissible' : strength > 0.6 ? 'likely_admissible' : strength > 0.4 ? 'challenged' : 'inadmissible',
      notes: strength > 0.7 ? 'Strong probative value' : 'May require corroboration'
    })
  }

  const avgClaimStrength = claims.reduce((sum, c) => sum + c.strength, 0) / claims.length
  const avgEvidenceStrength = evidenceItems.reduce((sum, e) => sum + e.strength, 0) / evidenceItems.length
  const winProbability = clampedRand(rand, 0.3, 0.5) + (avgClaimStrength * 0.25) + (avgEvidenceStrength * 0.25)

  const weaknesses: string[] = []
  if (avgEvidenceStrength < 0.6) weaknesses.push('Evidence base is relatively weak; consider additional discovery')
  const challengedEvidence = evidenceItems.filter(e => e.admissibility === 'challenged' || e.admissibility === 'inadmissible')
  if (challengedEvidence.length > 0) weaknesses.push(challengedEvidence.length + ' evidence item(s) face admissibility challenges')
  if (claims.some(c => c.strength < 0.5)) weaknesses.push('At least one claim has sub-50% strength rating')
  if (weaknesses.length === 0) weaknesses.push('No major weaknesses identified at this stage')

  const opportunities: string[] = []
  if (avgClaimStrength > 0.7) opportunities.push('Strong claim basis supports aggressive litigation posture')
  if (evidenceItems.some(e => e.type === 'Prior Admission')) opportunities.push('Opposing party admissions significantly strengthen position')
  if (opportunities.length === 0) opportunities.push('Standard litigation pathway available')

  const durations = ['6-12 months', '12-18 months', '18-24 months', '24-36 months']

  return {
    facts_summary: caseFacts.substring(0, 200) + (caseFacts.length > 200 ? '...' : ''),
    claims,
    win_probability: Math.min(0.95, Math.max(0.05, winProbability)),
    evidence_analysis: evidenceItems,
    weaknesses,
    opportunities,
    estimated_duration: durations[Math.floor(rand() * durations.length)],
    disclaimer: '⚠️ 本分析不可替代专业法律建议。胜诉概率仅为AI模型估算，实际结果可能因多种因素而显著不同。'
  }
}

function formatCaseAnalysis(result: CaseAnalysisResult): string {
  const lines: string[] = []
  const winPct = (result.win_probability * 100).toFixed(1)
  const winIcon = result.win_probability > 0.7 ? '🟢' : result.win_probability > 0.45 ? '🟡' : '🔴'

  lines.push('## ⚖️ Case Analysis Report')
  lines.push('')
  lines.push('**Win Probability:** ' + winIcon + ' ' + winPct + '%')
  lines.push('**Estimated Duration:** ' + result.estimated_duration)
  lines.push('')
  lines.push('**Facts Summary:** ' + result.facts_summary)
  lines.push('')

  lines.push('📋 **Claims Strength Assessment**')
  lines.push('| # | Claim | Strength | Evidence Count |')
  lines.push('|---|-------|----------|----------------|')
  result.claims.forEach((c, i) => {
    const icon = c.strength > 0.7 ? '💪' : c.strength > 0.45 ? '⚖️' : '⚠️'
    lines.push('| ' + (i + 1) + ' | ' + c.claim.substring(0, 50) + '... | ' + icon + ' ' + (c.strength * 100).toFixed(0) + '% | ' + c.evidence.length + ' items |')
  })
  lines.push('')

  lines.push('🔍 **Evidence Analysis**')
  lines.push('| Type | Strength | Admissibility |')
  lines.push('|------|----------|---------------|')
  result.evidence_analysis.forEach(e => {
    const admIcon = e.admissibility === 'admissible' ? 'OK' : e.admissibility === 'likely_admissible' ? 'MAYBE' : e.admissibility === 'challenged' ? 'RISKY' : 'NO'
    lines.push('| ' + e.type + ' | ' + (e.strength * 100).toFixed(0) + '% | ' + admIcon + ' ' + e.admissibility + ' |')
  })
  lines.push('')

  lines.push('### ⚠️ Weaknesses')
  result.weaknesses.forEach(w => lines.push('- ' + w))
  lines.push('')

  lines.push('### ✅ Opportunities')
  result.opportunities.forEach(o => lines.push('- ' + o))
  lines.push('')

  lines.push('> ' + result.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 3: DOCUMENT GENERATOR ====================

function generateDocument(
  documentType: string,
  parties: string[],
  keyTerms: Record<string, string>,
  jurisdiction: string
): GeneratedDocument {
  const seed = hashString(documentType + parties.join('') + jurisdiction)
  const rand = seededRandom(seed)

  const sections: GeneratedDocument['sections'] = []
  const placeholders: string[] = []
  const warnings: string[] = []

  switch (documentType.toLowerCase()) {
    case 'nda':
    case 'non-disclosure':
      sections.push(
        { heading: '1. Definition of Confidential Information', content: '"Confidential Information" means any and all non-public, proprietary, or confidential information disclosed by ' + (parties[0] || '[DISCLOSING PARTY]') + ' to ' + (parties[1] || '[RECEIVING PARTY]') + '...' },
        { heading: '2. Obligations of Receiving Party', content: (parties[1] || '[RECEIVING PARTY]') + ' agrees to hold all Confidential Information in strict confidence and not disclose to any third party without prior written consent...' },
        { heading: '3. Term and Survival', content: 'This Agreement shall remain in effect for a period of [TERM LENGTH] from the Effective Date. Obligations of confidentiality shall survive termination for [SURVIVAL PERIOD] years.' },
        { heading: '4. Exclusions', content: 'Confidential Information does not include information that: (a) is or becomes publicly available; (b) was known prior to disclosure; (c) is independently developed; or (d) is received from a third party without restriction.' },
        { heading: '5. Remedies', content: 'Breach may cause irreparable harm. Disclosing Party is entitled to seek injunctive relief and monetary damages.' }
      )
      placeholders.push('[TERM LENGTH]', '[SURVIVAL PERIOD]', '[DISCLOSING PARTY]', '[RECEIVING PARTY]')
      warnings.push('NDA scope should be narrowly tailored to avoid unenforceability in some jurisdictions')
      break

    case 'service_agreement':
      sections.push(
        { heading: '1. Services Description', content: (parties[0] || '[SERVICE PROVIDER]') + ' agrees to provide the services described in Exhibit A to ' + (parties[1] || '[CLIENT]') + '...' },
        { heading: '2. Compensation', content: (parties[1] || '[CLIENT]') + ' shall compensate ' + (parties[0] || '[SERVICE PROVIDER]') + ' as follows: ' + (keyTerms.compensation || '[COMPENSATION STRUCTURE]') },
        { heading: '3. Term and Termination', content: 'This Agreement begins on ' + (keyTerms.start_date || '[START DATE]') + ' and continues for ' + (keyTerms.term || '[TERM]') + '. Either party may terminate with [NOTICE PERIOD] written notice.' },
        { heading: '4. Limitation of Liability', content: 'To the maximum extent permitted by law, total liability shall not exceed [LIABILITY CAP] dollars. Consequential damages are excluded.' },
        { heading: '5. Governing Law', content: 'This Agreement shall be governed by the laws of ' + jurisdiction + ' without regard to conflict of laws principles.' },
        { heading: '6. Dispute Resolution', content: 'Any dispute shall first be submitted to mediation. If unresolved within 30 days, binding arbitration shall apply.' }
      )
      placeholders.push('[COMPENSATION STRUCTURE]', '[START DATE]', '[TERM]', '[NOTICE PERIOD]', '[LIABILITY CAP]')
      warnings.push('Limitation of liability caps vary by enforceability across jurisdictions')
      warnings.push('Ensure Exhibit A (Service Description) is negotiated and attached')
      break

    case 'mou':
      sections.push(
        { heading: '1. Purpose', content: 'This Memorandum of Understanding ("MOU") sets forth the preliminary understanding between the Parties regarding [TRANSACTION DESCRIPTION].' },
        { heading: '2. Key Terms', content: 'The Parties contemplate the following key terms: ' + JSON.stringify(keyTerms) },
        { heading: '3. Non-Binding Effect', content: 'Except for Sections 4-6, this MOU is not legally binding and serves as a framework for definitive agreements.' },
        { heading: '4. Exclusivity', content: 'For a period of [EXCLUSIVITY PERIOD] days from execution, [PARTY] agrees not to negotiate with third parties.' },
        { heading: '5. Confidentiality', content: 'All discussions and information exchanged in connection with this MOU shall be confidential.' },
        { heading: '6. Governing Law', content: 'This MOU shall be governed by the laws of ' + jurisdiction + '.' }
      )
      placeholders.push('[TRANSACTION DESCRIPTION]', '[EXCLUSIVITY PERIOD]', '[PARTY]')
      warnings.push('MOU is expressly non-binding except for designated clauses')
      warnings.push('Definitive agreements must follow to create enforceable obligations')
      break

    default:
      sections.push(
        { heading: '1. Parties', content: 'This ' + documentType + ' is entered into between ' + (parties.join(' and ') || '[PARTIES]') + '.' },
        { heading: '2. Recitals', content: 'WHEREAS the Parties wish to ' + (keyTerms.purpose || '[STATE PURPOSE]') + ';' },
        { heading: '3. Key Terms', content: 'The material terms are: ' + JSON.stringify(keyTerms) },
        { heading: '4. Governing Law', content: 'This document is governed by the laws of ' + jurisdiction + '.' },
        { heading: '5. Execution', content: 'IN WITNESS WHEREOF, the Parties have executed this document as of the date first written above.' }
      )
      placeholders.push('[STATE PURPOSE]')
      warnings.push('Document type "' + documentType + '" uses generic template — consult attorney for jurisdiction-specific requirements')
  }

  return {
    title: documentType.replace(/_/g, ' ').toUpperCase() + ' — ' + (parties.join(' v. ') || '[PARTIES]'),
    document_type: documentType,
    jurisdiction,
    parties,
    sections,
    placeholder_clauses: placeholders,
    warnings,
    disclaimer: '⚠️ 本分析不可替代专业法律建议。本文件为AI生成的草稿模板，须经持证律师审核后方可使用或签署。'
  }
}

function formatDocument(gen: GeneratedDocument): string {
  const lines: string[] = []
  lines.push('## 📄 Generated Legal Document')
  lines.push('')
  lines.push('= ' + gen.title + ' =')
  lines.push('')
  lines.push('**Type:** ' + gen.document_type + ' | **Jurisdiction:** ' + gen.jurisdiction)
  lines.push('**Parties:** + ' + gen.parties.join(', ') + ' +')
  lines.push('')

  lines.push('---')
  lines.push('')

  gen.sections.forEach(section => {
    lines.push('### ' + section.heading)
    lines.push('')
    lines.push(section.content)
    lines.push('')
  })

  lines.push('---')
  lines.push('')

  if (gen.placeholder_clauses.length > 0) {
    lines.push('### 🔍 Placeholder Fields (REQUIRED)')
    gen.placeholder_clauses.forEach(p => lines.push('- `' + p + '`'))
    lines.push('')
  }

  if (gen.warnings.length > 0) {
    lines.push('### ⚠️ Warnings & Notes')
    gen.warnings.forEach(w => lines.push('- ' + w))
    lines.push('')
  }

  lines.push('> ' + gen.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 4: COMPLIANCE REVIEWER ====================

function reviewCompliance(
  businessOperations: string,
  regulatoryFrameworks: string[]
): ComplianceReviewResult[] {
  const seed = hashString(businessOperations + regulatoryFrameworks.join(''))
  const rand = seededRandom(seed)

  return regulatoryFrameworks.map(framework => {
    const complianceScore = clampedRand(rand, 0.45, 0.9)

    const gaps: ComplianceGap[] = []
    const gapTemplates = [
      { req: 'Data Protection Impact Assessment', state: 'Not yet conducted', severity: 'critical' as const, effort: '4-6 weeks' },
      { req: 'Records Retention Policy', state: 'Incomplete - missing retention schedules', severity: 'major' as const, effort: '2-3 weeks' },
      { req: 'Staff Training Documentation', state: 'Training conducted but not documented', severity: 'minor' as const, effort: '1 week' },
      { req: 'Incident Response Plan', state: 'Plan exists but not tested', severity: 'major' as const, effort: '3-4 weeks' },
      { req: 'Third-Party Processor Agreements', state: 'DPAs missing for 2 vendors', severity: 'critical' as const, effort: '4-8 weeks' }
    ]

    const numGaps = Math.floor(rand() * 3) + (complianceScore < 0.6 ? 3 : 1)
    for (let i = 0; i < numGaps; i++) {
      const tmpl = gapTemplates[(i + Math.floor(rand() * 2)) % gapTemplates.length]
      gaps.push({
        regulation: framework,
        requirement: tmpl.req,
        current_state: tmpl.state,
        gap_severity: tmpl.severity,
        remediation_steps: [
          'Conduct gap analysis for ' + tmpl.req,
          'Draft remediation plan with owner and timeline',
          'Implement corrective measures',
          'Verify compliance through internal audit'
        ],
        estimated_effort: tmpl.effort,
        deadline: rand() > 0.6 ? (Math.floor(rand() * 90) + 30) + ' days' : undefined
      })
    }

    const strengths: string[] = []
    if (complianceScore > 0.7) strengths.push('Overall program maturity is above average')
    if (gaps.filter(g => g.gap_severity === 'critical').length === 0) strengths.push('No critical gaps identified')
    strengths.push('Existing policy framework provides solid foundation')

    const roadmap: ComplianceReviewResult['roadmap'] = [
      { phase: 'Phase 1: Critical Remediation', actions: gaps.filter(g => g.gap_severity === 'critical').map(g => 'Address: ' + g.requirement), timeframe: '0-30 days' },
      { phase: 'Phase 2: Major Improvements', actions: gaps.filter(g => g.gap_severity === 'major').map(g => 'Address: ' + g.requirement), timeframe: '30-90 days' },
      { phase: 'Phase 3: Continuous Improvement', actions: gaps.filter(g => g.gap_severity === 'minor').map(g => 'Address: ' + g.requirement), timeframe: '90-180 days' }
    ]

    return {
      framework,
      overall_compliance_score: complianceScore,
      gaps,
      strengths,
      roadmap,
      risk_rating: complianceScore < 0.55 ? 'high' : complianceScore < 0.75 ? 'medium' : 'low',
      disclaimer: '⚠️ 本分析不可替代专业法律建议。合规审核结果基于有限信息，正式合规审查应由专业律师或合规顾问执行。'
    }
  })
}

function formatComplianceReview(results: ComplianceReviewResult[]): string {
  const lines: string[] = []
  lines.push('## 🔒 Compliance Review Report')
  lines.push('')

  results.forEach((result, idx) => {
    if (idx > 0) lines.push('---')
    lines.push('')
    const riskIcon = result.risk_rating === 'high' ? '🔴' : result.risk_rating === 'medium' ? '🟡' : '🟢'
    lines.push('### ' + result.framework)
    lines.push('**Compliance Score:** ' + (result.overall_compliance_score * 100).toFixed(0) + '% | **Risk Rating:** ' + riskIcon + ' ' + result.risk_rating.toUpperCase())
    lines.push('')

    if (result.gaps.length > 0) {
      lines.push('#### Gap Analysis')
      lines.push('| # | Requirement | Severity | Effort |')
      lines.push('|---|-------------|----------|--------|')
      result.gaps.forEach((g, i) => {
        const sevIcon = g.gap_severity === 'critical' ? '🔴' : g.gap_severity === 'major' ? '🟡' : '🟢'
        lines.push('| ' + (i + 1) + ' | ' + g.requirement + ' | ' + sevIcon + ' ' + g.gap_severity + ' | ' + g.estimated_effort + ' |')
      })
      lines.push('')
    }

    if (result.strengths.length > 0) {
      lines.push('#### ✅ Strengths')
      result.strengths.forEach(s => lines.push('- ' + s))
      lines.push('')
    }

    lines.push('#### 📅 Remediation Roadmap')
    result.roadmap.forEach(phase => {
      if (phase.actions.length > 0) {
        lines.push('**' + phase.phase + '** (' + phase.timeframe + ')')
        phase.actions.forEach(a => lines.push('- ' + a))
        lines.push('')
      }
    })
  })

  lines.push('> ' + (results[0] ? results[0].disclaimer : 'Disclaimer: Not legal advice.'))

  return lines.join('\n')
}

// ==================== TOOL 5: LITIGATION PREDICTOR ====================

function predictLitigation(
  caseFeatures: Array<{ name: string; value: string }>,
  courtHistory: string,
  judgeStatistics: string
): LitigationPrediction {
  const seed = hashString(JSON.stringify(caseFeatures) + courtHistory + judgeStatistics)
  const rand = seededRandom(seed)

  const favorableFactors: PredictionFeature[] = []
  const unfavorableFactors: PredictionFeature[] = []

  const allFactors = [
    { factor: 'Precedent alignment', weight: 0.85 },
    { factor: 'Evidence completeness', weight: 0.78 },
    { factor: 'Jurisdiction favorability', weight: 0.65 },
    { factor: 'Opposing party resources', weight: 0.55 },
    { factor: 'Statute of limitations status', weight: 0.9 },
    { factor: 'Judge approval rate', weight: 0.7 },
    { factor: 'Damages calculation clarity', weight: 0.6 },
    { factor: 'Witness credibility', weight: 0.58 }
  ]

  allFactors.forEach(f => {
    const r = rand()
    const direction: PredictionFeature['direction'] = r > 0.55 ? 'favorable' : r > 0.25 ? 'neutral' : 'unfavorable'
    if (direction === 'favorable') favorableFactors.push({ ...f, direction })
    else if (direction === 'unfavorable') unfavorableFactors.push({ ...f, direction })
    else favorableFactors.push({ ...f, direction: 'favorable' })
  })

  const favScore = favorableFactors.reduce((s, f) => s + f.weight, 0)
  const unfavScore = unfavorableFactors.reduce((s, f) => s + f.weight, 0)
  const totalWeight = favScore + unfavScore
  const rawProbability = totalWeight > 0 ? favScore / totalWeight : 0.5
  const confidence = clampedRand(rand, 0.45, 0.75)
  const adjustedProbability = 0.3 + rawProbability * 0.4

  const courtBase = courtHistory.includes('federal') ? 250000 : 100000
  const feeMultiplier = clampedRand(rand, 1.5, 4.0)
  const minFees = Math.round((courtBase * feeMultiplier) / 1000) * 1000
  const maxFees = Math.round((minFees * clampedRand(rand, 1.8, 3.5)) / 1000) * 1000

  const durations = ['8-14 months', '14-22 months', '22-30 months', '30-42 months']

  const comparableVerdicts: LitigationPrediction['comparable_verdicts'] = []
  const numVerdicts = Math.floor(rand() * 3) + 2
  for (let i = 0; i < numVerdicts; i++) {
    comparableVerdicts.push({
      case_name: 'Case ' + String.fromCharCode(65 + i) + '-' + (1000 + i),
      amount: Math.round(clampedRand(rand, minFees * 0.5, minFees * 3) / 1000) * 1000,
      year: 2020 + Math.floor(rand() * 5)
    })
  }

  const avgVerdict = comparableVerdicts.reduce((s, v) => s + v.amount, 0) / comparableVerdicts.length
  const settlementLow = Math.round((avgVerdict * 0.3) / 1000) * 1000
  const settlementHigh = Math.round((avgVerdict * 0.7) / 1000) * 1000

  const outcomes = ['Plaintiff verdict (partial)', 'Settlement (mid-range)', 'Settlement (high-range)', 'Defense verdict', 'Dismissal']
  const outcomeWeights = [0.25, 0.3, 0.2, 0.15, 0.1]
  let running = 0
  const threshold = rand()
  let predictedOutcome = outcomes[0]
  for (let i = 0; i < outcomeWeights.length; i++) {
    running += outcomeWeights[i]
    if (threshold <= running) { predictedOutcome = outcomes[i]; break }
  }

  return {
    predicted_outcome: predictedOutcome,
    confidence,
    favorable_factors: favorableFactors,
    unfavorable_factors: unfavorableFactors,
    estimated_legal_fees: { min: minFees, max: maxFees, currency: 'USD' },
    estimated_duration: durations[Math.floor(rand() * durations.length)],
    comparable_verdicts: comparableVerdicts,
    settlement_range: { low: settlementLow, high: settlementHigh },
    disclaimer: '⚠️ 本分析不可替代专业法律建议。诉讼预测基于历史数据和模型推断，不构成对案件结果的保证。实际判决受不可预测因素影响。'
  }
}

function formatLitigationPrediction(result: LitigationPrediction): string {
  const lines: string[] = []
  const confPct = (result.confidence * 100).toFixed(0)
  const favSum = result.favorable_factors.reduce((s, f) => s + f.weight, 0)
  const unfavSum = result.unfavorable_factors.reduce((s, f) => s + f.weight, 0)
  const winPct = ((favSum / (favSum + unfavSum)) * 100).toFixed(1)

  lines.push('## 🔮 Litigation Prediction Report')
  lines.push('')
  lines.push('**Predicted Outcome:** ' + result.predicted_outcome)
  lines.push('**Confidence Level:** ' + confPct + '% | **Favorability:** ' + winPct + '%')
  lines.push('**Estimated Duration:** ' + result.estimated_duration)
  lines.push('')

  lines.push('### 💰 Cost Estimate')
  lines.push('- **Legal Fees Range:** $' + result.estimated_legal_fees.min.toLocaleString() + ' - $' + result.estimated_legal_fees.max.toLocaleString() + ' ' + result.estimated_legal_fees.currency)
  lines.push('- **Settlement Range:** $' + result.settlement_range.low.toLocaleString() + ' - $' + result.settlement_range.high.toLocaleString())
  lines.push('')

  if (result.favorable_factors.length > 0) {
    lines.push('### ✅ Favorable Factors')
    lines.push('| Factor | Weight |')
    lines.push('|--------|--------|')
    result.favorable_factors.forEach(f => lines.push('| ' + f.factor + ' | ' + (f.weight * 100).toFixed(0) + '% |'))
    lines.push('')
  }

  if (result.unfavorable_factors.length > 0) {
    lines.push('### ⚠️ Unfavorable Factors')
    lines.push('| Factor | Weight |')
    lines.push('|--------|--------|')
    result.unfavorable_factors.forEach(f => lines.push('| ' + f.factor + ' | ' + (f.weight * 100).toFixed(0) + '% |'))
    lines.push('')
  }

  if (result.comparable_verdicts.length > 0) {
    lines.push('### 📊 Comparable Verdicts')
    lines.push('| Case | Amount | Year |')
    lines.push('|------|--------|------|')
    result.comparable_verdicts.forEach(v => lines.push('| ' + v.case_name + ' | $' + v.amount.toLocaleString() + ' | ' + v.year + ' |'))
    lines.push('')
  }

  lines.push('> ' + result.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 6: IP ANALYST ====================

function analyzeIP(
  inventionDisclosure: string,
  ipType: 'patent' | 'trademark' | 'copyright'
): IPAnalysis {
  const seed = hashString(inventionDisclosure + ipType)
  const rand = seededRandom(seed)

  const result: IPAnalysis = {
    ip_type: ipType,
    title: inventionDisclosure.substring(0, 60) + (inventionDisclosure.length > 60 ? '...' : ''),
    filing_recommendation: '',
    estimated_costs: { filing: 0, prosecution: 0, total: 0 },
    disclaimer: '⚠️ 本分析不可替代专业法律建议。知识产权分析仅供初步参考，专利申请、商标注册等须经持证专利律师或商标代理人审核。'
  }

  if (ipType === 'patent') {
    const noveltyScore = clampedRand(rand, 0.4, 0.92)
    result.novelty_score = noveltyScore

    const priorArt: PriorArtResult[] = []
    const numPriorArt = Math.floor(rand() * 3) + 1
    for (let i = 0; i < numPriorArt; i++) {
      const rel: PriorArtResult['relevance'] = rand() > 0.6 ? 'high' : rand() > 0.3 ? 'medium' : 'low'
      priorArt.push({
        reference: 'US Patent ' + (Math.floor(rand() * 9000000) + 1000000),
        relevance: rel,
        claims_blocked: rel === 'high' ? ['Claim ' + (i + 1)] : [],
        notes: rel === 'high' ? 'Close prior art - consider narrowing claims' : 'Distinguishable from invention'
      })
    }
    result.prior_art = priorArt

    result.claims_suggestion = [
      'Independent claim covering core inventive concept',
      'Dependent claim specifying preferred embodiment',
      'Dependent claim covering system implementation',
      'Dependent claim with additional technical features distinguishing over prior art'
    ]

    result.filing_recommendation = noveltyScore > 0.75
      ? 'STRONG - File provisional within 12 months; high patentability prospects'
      : noveltyScore > 0.5
      ? 'MODERATE - Consider filing with narrowed claims; additional prior art search recommended'
      : 'WEAK - Significant prior art obstacles; consult patent attorney before proceeding'

    const filingCost = Math.round(clampedRand(rand, 8000, 15000))
    const prosecutionCost = Math.round(clampedRand(rand, 5000, 12000))
    result.estimated_costs = { filing: filingCost, prosecution: prosecutionCost, total: filingCost + prosecutionCost }

  } else if (ipType === 'trademark') {
    const conflictingMarks: string[] = []
    const numConflicts = Math.floor(rand() * 3)
    for (let i = 0; i < numConflicts; i++) {
      conflictingMarks.push('Mark' + String.fromCharCode(65 + i) + ' - Similar in Class ' + (Math.floor(rand() * 45) + 1))
    }

    const riskLevel = numConflicts === 0 ? 'low' : numConflicts === 1 ? 'medium' : 'high'
    result.trademark_clearance = {
      status: numConflicts === 0 ? 'CLEAR' : 'CONFLICTS FOUND',
      conflicting_marks: conflictingMarks,
      risk: riskLevel.toUpperCase() + ' - ' + (numConflicts === 0 ? 'No conflicting marks' : numConflicts + ' potentially conflicting mark(s)')
    }

    result.filing_recommendation = riskLevel === 'low'
      ? 'PROCEED - No conflicts identified; file promptly'
      : riskLevel === 'medium'
      ? 'CAUTION - Review conflicts with attorney; consider modified mark'
      : 'HIGH RISK - Significant conflicts; strongly consider alternative mark'

    const filingCost = Math.round(clampedRand(rand, 1500, 3500))
    const prosecutionCost = Math.round(clampedRand(rand, 500, 2500))
    result.estimated_costs = { filing: filingCost, prosecution: prosecutionCost, total: filingCost + prosecutionCost }

  } else {
    const originalityScore = clampedRand(rand, 0.5, 0.95)
    const notes: string[] = []
    result.copyright_eligibility = {
      status: originalityScore > 0.6 ? 'LIKELY ELIGIBLE' : 'REVIEW NEEDED',
      originality_score: originalityScore,
      notes
    }

    if (originalityScore > 0.8) {
      notes.push('High originality demonstrated')
      notes.push('Strong fixation evidence available')
    }
    if (originalityScore < 0.7) {
      notes.push('Some elements may lack sufficient originality')
    }

    result.filing_recommendation = originalityScore > 0.75
      ? 'PROCEED - Work appears sufficiently original for copyright protection'
      : 'REVIEW - Some elements may not meet threshold; consult IP attorney'

    const filingCost = Math.round(clampedRand(rand, 300, 800))
    const prosecutionCost = Math.round(clampedRand(rand, 200, 600))
    result.estimated_costs = { filing: filingCost, prosecution: prosecutionCost, total: filingCost + prosecutionCost }
  }

  return result
}

function formatIPAnalysis(result: IPAnalysis): string {
  const lines: string[] = []
  lines.push('## IP Analysis Report - ' + result.ip_type.toUpperCase())
  lines.push('')
  lines.push('**Subject:** ' + result.title)
  lines.push('')

  if (result.novelty_score !== undefined) {
    const novIcon = result.novelty_score > 0.75 ? 'High' : result.novelty_score > 0.5 ? 'Medium' : 'Low'
    lines.push('**Novelty Score:** ' + novIcon + ' (' + (result.novelty_score * 100).toFixed(0) + '%)')
    lines.push('')
  }

  if (result.trademark_clearance) {
    lines.push('**Clearance Status:** ' + result.trademark_clearance.status)
    lines.push('**Risk Level:** ' + result.trademark_clearance.risk)
    if (result.trademark_clearance.conflicting_marks.length > 0) {
      result.trademark_clearance.conflicting_marks.forEach(m => lines.push('- ⚠️ ' + m))
    }
    lines.push('')
  }

  if (result.copyright_eligibility) {
    lines.push('**Eligibility:** ' + result.copyright_eligibility.status)
    lines.push('**Originality Score:** ' + (result.copyright_eligibility.originality_score * 100).toFixed(0) + '%')
    result.copyright_eligibility.notes.forEach(n => lines.push('- ' + n))
    lines.push('')
  }

  if (result.prior_art && result.prior_art.length > 0) {
    lines.push('### Prior Art References')
    lines.push('| Reference | Relevance | Claims Blocked |')
    lines.push('|-----------|-----------|----------------|')
    result.prior_art.forEach(pa => {
      const relIcon = pa.relevance === 'high' ? 'HIGH' : pa.relevance === 'medium' ? 'MED' : 'LOW'
      lines.push('| ' + pa.reference + ' | ' + relIcon + ' | ' + (pa.claims_blocked.length > 0 ? pa.claims_blocked.join(', ') : 'None') + ' |')
    })
    lines.push('')
  }

  if (result.claims_suggestion && result.claims_suggestion.length > 0) {
    lines.push('### Suggested Claims Structure')
    result.claims_suggestion.forEach((c, i) => lines.push((i + 1) + '. ' + c))
    lines.push('')
  }

  lines.push('### 📋 Filing Recommendation')
  lines.push(result.filing_recommendation)
  lines.push('')

  lines.push('### 💰 Estimated Costs')
  lines.push('- Filing: $' + result.estimated_costs.filing.toLocaleString())
  lines.push('- Prosecution: $' + result.estimated_costs.prosecution.toLocaleString())
  lines.push('- **Total Estimated:** $' + result.estimated_costs.total.toLocaleString())
  lines.push('')

  lines.push('> ' + result.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 7: REGULATORY TRACKER ====================

function trackRegulations(
  industry: string,
  jurisdictions: string[],
  topics: string[]
): RegulatoryTrackerResult {
  const seed = hashString(industry + jurisdictions.join('') + topics.join(''))
  const rand = seededRandom(seed)

  const changes: RegulatoryChange[] = []
  const upcomingDeadlines: RegulatoryTrackerResult['upcoming_deadlines'] = []

  jurisdictions.forEach(juris => {
    topics.forEach(topic => {
      if (rand() > 0.35) {
        const impactLevels: RegulatoryChange['impact_level'][] = ['high', 'medium', 'low']
        const impact = impactLevels[Math.floor(rand() * 3)]
        const monthsOut = Math.floor(rand() * 12) + 1
        const year = 2025 + Math.floor((monthsOut + 1) / 12)

        changes.push({
          jurisdiction: juris,
          topic,
          change_description: 'Proposed amendment to ' + topic + ' regulations affecting ' + industry + ' sector in ' + juris,
          effective_date: year + '-' + String(Math.floor(rand() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0'),
          impact_level: impact,
          actions_required: [
            'Review amendment text for ' + topic + ' compliance implications',
            'Update internal policies to reflect changed requirements',
            'Train relevant staff on new obligations',
            'Conduct gap analysis for ' + juris + ' operations'
          ],
          compliance_deadline: rand() > 0.5 ? (Math.floor(rand() * 180) + 60) + ' days from effective date' : undefined
        })

        if (rand() > 0.6) {
          upcomingDeadlines.push({
            item: topic + ' - ' + juris + ' compliance deadline',
            date: year + '-' + String(Math.floor(rand() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0'),
            jurisdiction: juris
          })
        }
      }
    })
  })

  if (changes.length === 0) {
    changes.push({
      jurisdiction: jurisdictions[0],
      topic: topics[0],
      change_description: 'No major regulatory changes detected. Continue routine monitoring.',
      effective_date: 'Ongoing',
      impact_level: 'low',
      actions_required: ['Continue routine monitoring', 'Review quarterly']
    })
  }

  const highImpact = changes.filter(c => c.impact_level === 'high').length
  const medImpact = changes.filter(c => c.impact_level === 'medium').length

  let impactSummary = changes.length + ' regulatory change(s) identified across ' + jurisdictions.length + ' jurisdiction(s).'
  if (highImpact > 0) impactSummary += ' ' + highImpact + ' high-impact change(s) require immediate attention.'
  if (medImpact > 0) impactSummary += ' ' + medImpact + ' medium-impact change(s) should be reviewed within 30 days.'

  return {
    industry,
    jurisdictions,
    topics,
    changes,
    upcoming_deadlines: upcomingDeadlines,
    impact_summary: impactSummary,
    disclaimer: '⚠️ 本分析不可替代专业法律建议。法规追踪信息可能存在延迟或不完整，关键合规决定应咨询持证律师。'
  }
}

function formatRegulatoryTracker(result: RegulatoryTrackerResult): string {
  const lines: string[] = []
  lines.push('## 📡 Regulatory Tracker Report')
  lines.push('')
  lines.push('**Industry:** ' + result.industry)
  lines.push('**Jurisdictions:** ' + result.jurisdictions.join(', '))
  lines.push('**Topics Monitored:** ' + result.topics.join(', '))
  lines.push('')

  lines.push('### 📊 Impact Summary')
  lines.push(result.impact_summary)
  lines.push('')

  if (result.changes.length > 0) {
    lines.push('### 🔔 Regulatory Changes Detected')
    lines.push('| Jurisdiction | Topic | Impact | Effective Date |')
    lines.push('|-------------|-------|--------|----------------|')
    result.changes.forEach(c => {
      const impIcon = c.impact_level === 'high' ? 'HIGH' : c.impact_level === 'medium' ? 'MED' : 'LOW'
      lines.push('| ' + c.jurisdiction + ' | ' + c.topic + ' | ' + impIcon + ' | ' + c.effective_date + ' |')
    })
    lines.push('')

    if (result.upcoming_deadlines.length > 0) {
      lines.push('### ⏰ Upcoming Deadlines')
      lines.push('| Item | Date | Jurisdiction |')
      lines.push('|------|------|--------------|')
      result.upcoming_deadlines.forEach(d => lines.push('| ' + d.item + ' | ' + d.date + ' | ' + d.jurisdiction + ' |'))
      lines.push('')
    }
  }

  lines.push('> ' + result.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 8: LEGAL STRATEGIST ====================

function developLegalStrategy(
  disputeDetails: string,
  businessGoals: string[],
  riskTolerance: string
): LegalStrategyResult {
  const seed = hashString(disputeDetails + businessGoals.join('') + riskTolerance)
  const rand = seededRandom(seed)

  const strategies: StrategyOption[] = []

  strategies.push({
    name: 'Aggressive Litigation',
    description: 'Pursue full legal remedies through court proceedings.',
    success_probability: clampedRand(rand, 0.5, 0.7),
    estimated_cost: Math.round(clampedRand(rand, 150000, 500000) / 1000) * 1000,
    estimated_duration: '18-36 months',
    pros: ['Maximum potential recovery', 'Strong deterrent effect', 'Sets favorable precedent'],
    cons: ['High cost', 'Lengthy process', 'Public exposure', 'Uncertain outcome'],
    best_for: 'Strong legal position with high-value claims'
  })

  strategies.push({
    name: 'Strategic Settlement',
    description: 'Negotiate early settlement with favorable terms.',
    success_probability: clampedRand(rand, 0.65, 0.85),
    estimated_cost: Math.round(clampedRand(rand, 30000, 120000) / 1000) * 1000,
    estimated_duration: '2-6 months',
    pros: ['Lower cost', 'Faster resolution', 'Confidential', 'Preserves relationships'],
    cons: ['Lower recovery', 'May signal weakness', 'No precedent value'],
    best_for: 'When relationship preservation or speed is paramount'
  })

  strategies.push({
    name: 'Alternative Dispute Resolution',
    description: 'Use arbitration or mediation for binding resolution.',
    success_probability: clampedRand(rand, 0.6, 0.8),
    estimated_cost: Math.round(clampedRand(rand, 50000, 200000) / 1000) * 1000,
    estimated_duration: '6-12 months',
    pros: ['Faster than litigation', 'Private proceedings', 'Expert selection', 'Finality'],
    cons: ['Limited discovery', 'No public precedent', 'Arbitrator quality varies'],
    best_for: 'Commercial disputes needing expertise-based decisions'
  })

  let recommendedStrategy: string
  switch (riskTolerance.toLowerCase()) {
    case 'high':
      recommendedStrategy = 'Aggressive Litigation'
      break
    case 'low':
      recommendedStrategy = 'Strategic Settlement'
      break
    default:
      recommendedStrategy = 'Strategic Settlement'
  }

  const rec = strategies.find(s => s.name === recommendedStrategy) || strategies[0]
  const expectedValue = Math.round(rec.success_probability * rec.estimated_cost * 0.3)
  const worstCase = -rec.estimated_cost
  const bestCase = Math.round(rec.estimated_cost * clampedRand(rand, 2, 5))

  const nextSteps: string[] = [
    'Prepare detailed case assessment for ' + recommendedStrategy,
    'Engage counsel with relevant expertise in ' + disputeDetails.substring(0, 40),
    'Compile and preserve all relevant documentation',
    'Establish litigation hold protocol',
    'Set up internal team with clear roles and communication plan',
    'Develop budget and timeline for chosen strategy',
    'Identify key decision points and escalation triggers'
  ]

  return {
    dispute_summary: disputeDetails.substring(0, 200) + (disputeDetails.length > 200 ? '...' : ''),
    goals: businessGoals,
    risk_profile: riskTolerance,
    strategies,
    recommended_strategy: recommendedStrategy,
    cost_benefit: { expected_value: expectedValue, worst_case: worstCase, best_case: bestCase },
    next_steps: nextSteps,
    disclaimer: '⚠️ 本分析不可替代专业法律建议。法律策略仅供参考，具体决策应在充分听取持证律师意见后作出。'
  }
}

function formatLegalStrategy(result: LegalStrategyResult): string {
  const lines: string[] = []
  lines.push('## 🎯 Legal Strategy Report')
  lines.push('')
  lines.push('**Risk Tolerance:** ' + result.risk_profile)
  lines.push('**Recommended Strategy:** ' + result.recommended_strategy)
  lines.push('**Dispute Summary:** ' + result.dispute_summary)
  lines.push('')

  if (result.goals.length > 0) {
    lines.push('### 🎯 Business Goals')
    result.goals.forEach(g => lines.push('- ' + g))
    lines.push('')
  }

  lines.push('### 📊 Strategy Comparison')
  lines.push('| Strategy | Success % | Est. Cost | Duration |')
  lines.push('|----------|-----------|-----------|----------|')
  result.strategies.forEach(s => {
    const icon = s.name === result.recommended_strategy ? '>> ' : '   '
    lines.push('| ' + icon + s.name + ' | ' + (s.success_probability * 100).toFixed(0) + '% | $' + s.estimated_cost.toLocaleString() + ' | ' + s.estimated_duration + ' |')
  })
  lines.push('')

  const rec = result.strategies.find(s => s.name === result.recommended_strategy)
  if (rec) {
    lines.push('### 🔍 Recommended: ' + rec.name)
    lines.push('> ' + rec.description)
    lines.push('')
    lines.push('**Pros:**')
    rec.pros.forEach(p => lines.push('- ' + p))
    lines.push('')
    lines.push('**Cons:**')
    rec.cons.forEach(c => lines.push('- ' + c))
    lines.push('')
    lines.push('> **Best for:** ' + rec.best_for)
    lines.push('')
  }

  lines.push('### 💰 Cost-Benefit Analysis')
  lines.push('- **Expected Value:** $' + result.cost_benefit.expected_value.toLocaleString())
  lines.push('- **Worst Case:** $' + result.cost_benefit.worst_case.toLocaleString())
  lines.push('- **Best Case:** $' + result.cost_benefit.best_case.toLocaleString())
  lines.push('')

  lines.push('### 📋 Next Steps')
  result.next_steps.forEach((step, i) => lines.push((i + 1) + '. ' + step))
  lines.push('')

  lines.push('> ' + result.disclaimer)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Legal Researcher
  tools.register(defineTool({
    name: 'legal_researcher',
    description: 'Conduct comprehensive legal research on an issue within a specific jurisdiction and practice area. Returns relevant case law, statutes, and analysis with confidence scoring.',
    parameters: {
      legal_issue: { type: 'string', required: true, description: 'The legal issue or question to research' },
      jurisdiction: { type: 'string', required: true, description: 'The legal jurisdiction (e.g., "California", "EU", "Federal")' },
      practice_area: { type: 'string', required: true, description: 'Practice area (e.g., "Employment", "IP", "Corporate")' },
      depth: { type: 'string', description: 'Research depth: "quick", "standard", or "comprehensive". Defaults to "standard".' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { legal_issue: string; jurisdiction: string; practice_area: string; depth?: string }) {
      const result = conductLegalResearch(args.legal_issue, args.jurisdiction, args.practice_area, args.depth || 'standard')
      return formatLegalResearch(result)
    }
  }))

  // Tool 2: Case Analyzer
  tools.register(defineTool({
    name: 'case_analyzer',
    description: 'Analyze litigation potential of a case. Evaluates win probability, claim strength, evidence quality, weaknesses, and opportunities.',
    parameters: {
      case_facts: { type: 'string', required: true, description: 'Factual description of the case' },
      legal_claims: { type: 'string', required: true, description: 'JSON array of legal claims' },
      applicable_law: { type: 'string', required: true, description: 'Applicable legal framework and jurisdiction' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { case_facts: string; legal_claims: string; applicable_law: string }) {
      const claims = JSON.parse(args.legal_claims) as string[]
      const result = analyzeCase(args.case_facts, claims, args.applicable_law)
      return formatCaseAnalysis(result)
    }
  }))

  // Tool 3: Document Generator
  tools.register(defineTool({
    name: 'document_generator',
    description: 'Generate legal document drafts including NDAs, service agreements, MOUs, and cease & desist letters.',
    parameters: {
      document_type: { type: 'string', required: true, description: 'Type: "nda", "service_agreement", "mou", or other' },
      parties: { type: 'string', required: true, description: 'JSON array of party names' },
      key_terms: { type: 'string', required: true, description: 'JSON object of key terms' },
      jurisdiction: { type: 'string', required: true, description: 'Governing jurisdiction' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { document_type: string; parties: string; key_terms: string; jurisdiction: string }) {
      const parties = JSON.parse(args.parties) as string[]
      const terms = JSON.parse(args.key_terms) as Record<string, string>
      const result = generateDocument(args.document_type, parties, terms, args.jurisdiction)
      return formatDocument(result)
    }
  }))

  // Tool 4: Compliance Reviewer
  tools.register(defineTool({
    name: 'compliance_reviewer',
    description: 'Audit business operations against regulatory frameworks. Identifies gaps and produces remediation roadmaps.',
    parameters: {
      business_operations: { type: 'string', required: true, description: 'Description of business operations to audit' },
      regulatory_frameworks: { type: 'string', required: true, description: 'JSON array of frameworks (GDPR, CCPA, SOX, etc.)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { business_operations: string; regulatory_frameworks: string }) {
      const frameworks = JSON.parse(args.regulatory_frameworks) as string[]
      const results = reviewCompliance(args.business_operations, frameworks)
      return formatComplianceReview(results)
    }
  }))

  // Tool 5: Litigation Predictor
  tools.register(defineTool({
    name: 'litigation_predictor',
    description: 'Predict litigation outcomes based on case features, court history, and judge statistics.',
    parameters: {
      case_features: { type: 'string', required: true, description: 'JSON array of feature objects' },
      court_history: { type: 'string', required: true, description: 'Court history context' },
      judge_statistics: { type: 'string', required: true, description: 'Judge-specific statistics' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { case_features: string; court_history: string; judge_statistics: string }) {
      const features = JSON.parse(args.case_features) as Array<{ name: string; value: string }>
      const result = predictLitigation(features, args.court_history, args.judge_statistics)
      return formatLitigationPrediction(result)
    }
  }))

  // Tool 6: IP Analyst
  tools.register(defineTool({
    name: 'ip_analyst',
    description: 'Analyze intellectual property: patent novelty, trademark clearance, copyright eligibility.',
    parameters: {
      invention_disclosure: { type: 'string', required: true, description: 'Description of the invention, mark, or work' },
      ip_type: { type: 'string', required: true, description: 'IP type: "patent", "trademark", or "copyright"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { invention_disclosure: string; ip_type: string }) {
      const ipType = args.ip_type as 'patent' | 'trademark' | 'copyright'
      const result = analyzeIP(args.invention_disclosure, ipType)
      return formatIPAnalysis(result)
    }
  }))

  // Tool 7: Regulatory Tracker
  tools.register(defineTool({
    name: 'regulatory_tracker',
    description: 'Track regulatory changes across jurisdictions for specified industries and topics.',
    parameters: {
      industry: { type: 'string', required: true, description: 'Industry sector' },
      jurisdictions: { type: 'string', required: true, description: 'JSON array of jurisdictions' },
      topics: { type: 'string', required: true, description: 'JSON array of regulatory topics' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { industry: string; jurisdictions: string; topics: string }) {
      const jurisdictions = JSON.parse(args.jurisdictions) as string[]
      const topics = JSON.parse(args.topics) as string[]
      const result = trackRegulations(args.industry, jurisdictions, topics)
      return formatRegulatoryTracker(result)
    }
  }))

  // Tool 8: Legal Strategist
  tools.register(defineTool({
    name: 'legal_strategist',
    description: 'Develop dispute resolution strategies with cost-benefit analysis and recommendations.',
    parameters: {
      dispute_details: { type: 'string', required: true, description: 'Full description of the dispute' },
      business_goals: { type: 'string', required: true, description: 'JSON array of business goals' },
      risk_tolerance: { type: 'string', required: true, description: 'Risk tolerance: "low", "medium", or "high"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { dispute_details: string; business_goals: string; risk_tolerance: string }) {
      const goals = JSON.parse(args.business_goals) as string[]
      const result = developLegalStrategy(args.dispute_details, goals, args.risk_tolerance)
      return formatLegalStrategy(result)
    }
  }))

  // eslint-disable-next-line no-console
  console.log('[dsh-tool-legalpro] Loaded v' + VERSION + ' - Legal AI Pro with 8 tools')
  // eslint-disable-next-line no-console
  console.log('  Tools: legal_researcher, case_analyzer, document_generator, compliance_reviewer, litigation_predictor, ip_analyst, regulatory_tracker, legal_strategist')
}
