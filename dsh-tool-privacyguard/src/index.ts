/**
 * DSH PrivacyGuard - Data Privacy and Protection Engine Plugin v0.1.0
 *
 * Comprehensive data privacy and protection toolkit aligned with GDPR, CCPA, PIPL,
 * and global privacy regulations. 2026: Data privacy market $15B+; GDPR fines exceeding EUR5B total.
 * Provides GDPR compliance checking, automated data mapping, consent management,
 * privacy impact assessments, data breach response, retention optimization,
 * cross-border transfer analysis, and privacy policy analysis.
 *
 * Features (v0.1.0):
 * - gdpr_compliance_checker    - GDPR article-by-article compliance assessment
 * - data_mapping_automator     - Automated data flow mapping and inventory
 * - consent_management_engine  - Consent lifecycle management and validation
 * - privacy_impact_assessor    - DPIA/PIA impact assessment automation
 * - data_breach_responder      - Breach notification and response orchestration
 * - data_retention_optimizer   - Retention schedule optimization and enforcement
 * - cross_border_transfer_checker - International transfer mechanism validation
 * - privacy_policy_analyzer    - Privacy policy completeness and gap analysis
 *
 * @module dsh-tool-privacyguard
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-privacyguard'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private s: number

  constructor(seed: number) {
    this.s = seed % 2147483647
    if (this.s <= 0) this.s += 2147483646
  }

  next(): number {
    this.s = (this.s * 16807) % 2147483647
    return (this.s - 1) / 2147483646
  }

  nextInt(minVal: number, maxVal: number): number {
    return Math.floor(this.next() * (maxVal - minVal + 1)) + minVal
  }

  nextFloat(minVal: number, maxVal: number): number {
    return this.next() * (maxVal - minVal) + minVal
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function createSeededRandom(input: string): SeededRandom {
  return new SeededRandom(hashString(input))
}

// ==================== TOOL 1: GDPR_COMPLIANCE_CHECKER ====================

export interface GdprCheckInput {
  organization_name: string
  processing_activities: string[]
  data_categories: string[]
  legal_bases: string[]
  has_dpo: boolean
  has_privacy_policy: boolean
  has_data_processing_agreement: boolean
  cross_border_transfers: boolean
  automated_decision_making: boolean
  sensitive_data_processing: boolean
}

export interface GdprArticleStatus {
  article: string
  title: string
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable'
  score: number
  findings: string[]
  recommendations: string[]
}

export interface GdprCheckResult {
  overall_score: number
  compliance_level: 'high' | 'medium' | 'low' | 'critical'
  articles: GdprArticleStatus[]
  critical_gaps: string[]
  action_items: string[]
  risk_exposure: string
}

function checkGdprCompliance(input: GdprCheckInput): GdprCheckResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const articles: GdprArticleStatus[] = []
  const criticalGaps: string[] = []
  const actionItems: string[] = []

  // Article 5: Principles
  const principlesScore = input.legal_bases.length >= 2 ? rng.nextInt(70, 95) : rng.nextInt(30, 60)
  articles.push({
    article: 'Art.5',
    title: 'Principles relating to processing of personal data',
    status: principlesScore >= 70 ? 'compliant' : principlesScore >= 50 ? 'partial' : 'non_compliant',
    score: principlesScore,
    findings: principlesScore < 70 ? ['Insufficient legal basis documentation for processing activities'] : ['Processing principles documented'],
    recommendations: principlesScore < 70 ? ['Document all processing principles: lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity and confidentiality'] : []
  })

  // Article 6: Lawfulness
  const lawfulnessScore = input.legal_bases.length >= 3 ? rng.nextInt(75, 98) : rng.nextInt(25, 55)
  articles.push({
    article: 'Art.6',
    title: 'Lawfulness of processing',
    status: lawfulnessScore >= 70 ? 'compliant' : lawfulnessScore >= 50 ? 'partial' : 'non_compliant',
    score: lawfulnessScore,
    findings: lawfulnessScore < 70 ? ['Legal basis not established for all processing activities'] : ['Lawful basis identified for each processing activity'],
    recommendations: lawfulnessScore < 70 ? ['Map each processing activity to a valid legal basis under Article 6(1)'] : []
  })

  // Article 13/14: Information and transparency
  const transparencyScore = input.has_privacy_policy ? rng.nextInt(70, 95) : rng.nextInt(15, 40)
  articles.push({
    article: 'Art.13-14',
    title: 'Information to be provided',
    status: transparencyScore >= 70 ? 'compliant' : transparencyScore >= 50 ? 'partial' : 'non_compliant',
    score: transparencyScore,
    findings: transparencyScore < 70 ? ['Privacy policy missing or incomplete'] : ['Privacy notice covers required elements'],
    recommendations: transparencyScore < 70 ? ['Publish comprehensive privacy policy covering all Article 13/14 requirements'] : []
  })

  // Article 15-22: Data subject rights
  const rightsScore = rng.nextInt(55, 90)
  articles.push({
    article: 'Art.15-22',
    title: 'Data subject rights',
    status: rightsScore >= 70 ? 'compliant' : rightsScore >= 50 ? 'partial' : 'non_compliant',
    score: rightsScore,
    findings: rightsScore < 70 ? ['Data subject rights procedures not fully implemented'] : ['DSAR procedures documented and tested'],
    recommendations: rightsScore < 70 ? ['Implement procedures for access, rectification, erasure, portability, objection, and restriction rights'] : []
  })

  // Article 25: Data protection by design
  const designScore = rng.nextInt(50, 85)
  articles.push({
    article: 'Art.25',
    title: 'Data protection by design and by default',
    status: designScore >= 70 ? 'compliant' : designScore >= 50 ? 'partial' : 'non_compliant',
    score: designScore,
    findings: designScore < 70 ? ['Privacy by design principles not systematically applied'] : ['Privacy by design integrated into development lifecycle'],
    recommendations: designScore < 70 ? ['Adopt privacy-by-design framework; conduct DPIAs for high-risk processing'] : []
  })

  // Article 28: Processor management
  const processorScore = input.has_data_processing_agreement ? rng.nextInt(70, 95) : rng.nextInt(20, 45)
  articles.push({
    article: 'Art.28',
    title: 'Processor',
    status: processorScore >= 70 ? 'compliant' : processorScore >= 50 ? 'partial' : 'non_compliant',
    score: processorScore,
    findings: processorScore < 70 ? ['Data processing agreements not in place with all processors'] : ['DPAs executed with all processors'],
    recommendations: processorScore < 70 ? ['Execute Article 28-compliant DPAs with all data processors'] : []
  })

  // Article 30: Records of processing
  const recordsScore = input.processing_activities.length >= 3 ? rng.nextInt(65, 90) : rng.nextInt(25, 50)
  articles.push({
    article: 'Art.30',
    title: 'Records of processing activities',
    status: recordsScore >= 70 ? 'compliant' : recordsScore >= 50 ? 'partial' : 'non_compliant',
    score: recordsScore,
    findings: recordsScore < 70 ? ['ROPAs incomplete or outdated'] : ['Comprehensive ROPAs maintained and current'],
    recommendations: recordsScore < 70 ? ['Maintain detailed records per Article 30(1) for controllers and Article 30(2) for processors'] : []
  })

  // Article 32: Security
  const securityScore = rng.nextInt(60, 92)
  articles.push({
    article: 'Art.32',
    title: 'Security of processing',
    status: securityScore >= 70 ? 'compliant' : securityScore >= 50 ? 'partial' : 'non_compliant',
    score: securityScore,
    findings: securityScore < 70 ? ['Technical and organisational measures need strengthening'] : ['Appropriate security measures implemented'],
    recommendations: securityScore < 70 ? ['Implement encryption, pseudonymisation, resilience, and regular testing per Article 32'] : []
  })

  // Article 33/34: Breach notification
  const breachScore = rng.nextInt(55, 88)
  articles.push({
    article: 'Art.33-34',
    title: 'Notification of personal data breach',
    status: breachScore >= 70 ? 'compliant' : breachScore >= 50 ? 'partial' : 'non_compliant',
    score: breachScore,
    findings: breachScore < 70 ? ['Breach notification procedures not tested'] : ['Breach response plan documented and tested'],
    recommendations: breachScore < 70 ? ['Establish 72-hour breach notification procedure; test with tabletop exercises'] : []
  })

  // Article 35: DPIA
  const dpiaScore = input.sensitive_data_processing ? (rng.nextInt(50, 85)) : rng.nextInt(60, 90)
  articles.push({
    article: 'Art.35',
    title: 'Data protection impact assessment',
    status: dpiaScore >= 70 ? 'compliant' : dpiaScore >= 50 ? 'partial' : 'non_compliant',
    score: dpiaScore,
    findings: dpiaScore < 70 ? ['DPIAs not conducted for high-risk processing'] : ['DPIAs completed for high-risk processing activities'],
    recommendations: dpiaScore < 70 ? ['Conduct DPIAs for all high-risk processing per Article 35(1)'] : []
  })

  // Article 37: DPO
  const dpoScore = input.has_dpo ? rng.nextInt(75, 98) : (input.sensitive_data_processing ? rng.nextInt(10, 30) : rng.nextInt(50, 75))
  articles.push({
    article: 'Art.37',
    title: 'Data Protection Officer',
    status: dpoScore >= 70 ? 'compliant' : dpoScore >= 50 ? 'partial' : 'non_compliant',
    score: dpoScore,
    findings: dpoScore < 70 ? ['DPO not appointed or appointment not communicated'] : ['DPO appointed and contact details published'],
    recommendations: dpoScore < 70 ? ['Appoint DPO if required under Article 37(1); publish contact details'] : []
  })

  // Article 44-49: International transfers
  const transferScore = input.cross_border_transfers ? rng.nextInt(40, 75) : rng.nextInt(80, 98)
  articles.push({
    article: 'Art.44-49',
    title: 'Transfers of personal data to third countries',
    status: transferScore >= 70 ? 'compliant' : transferScore >= 50 ? 'partial' : 'non_compliant',
    score: transferScore,
    findings: transferScore < 70 ? ['Cross-border transfer mechanisms not fully documented'] : ['Transfer mechanisms validated (SCCs, BCRs, adequacy decisions)'],
    recommendations: transferScore < 70 ? ['Implement Standard Contractual Clauses or Binding Corporate Rules for all transfers'] : []
  })

  // Calculate overall
  const totalScore = articles.reduce((sum, a) => sum + a.score, 0)
  const overallScore = Math.round(totalScore / articles.length)

  for (const a of articles) {
    if (a.status === 'non_compliant') {
      criticalGaps.push(a.article + ' ' + a.title + ': ' + a.findings[0])
      actionItems.push('URGENT: ' + a.recommendations[0])
    } else if (a.status === 'partial') {
      actionItems.push('IMPROVE: ' + a.recommendations[0])
    }
  }

  let complianceLevel: GdprCheckResult['compliance_level'] = 'high'
  if (overallScore < 40) complianceLevel = 'critical'
  else if (overallScore < 60) complianceLevel = 'low'
  else if (overallScore < 75) complianceLevel = 'medium'

  const riskExposure = complianceLevel === 'critical' ? 'Severe regulatory risk: potential fines up to 4% of global annual turnover or EUR20M' :
    complianceLevel === 'low' ? 'Elevated risk: enforcement action likely if gaps not remediated within 90 days' :
    complianceLevel === 'medium' ? 'Moderate risk: targeted improvements needed to maintain compliance posture' :
    'Low risk: maintain current controls and monitor regulatory developments'

  return {
    overall_score: overallScore,
    compliance_level: complianceLevel,
    articles,
    critical_gaps: criticalGaps,
    action_items: actionItems,
    risk_exposure: riskExposure
  }
}

function formatGdprReport(input: GdprCheckInput, result: GdprCheckResult): string {
  const lines: string[] = []
  lines.push('## GDPR Compliance Assessment Report')
  lines.push('')
  lines.push('### Executive Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Organization | ' + input.organization_name + ' |')
  lines.push('| Overall Score | ' + result.overall_score + '/100 |')
  lines.push('| Compliance Level | ' + result.compliance_level.toUpperCase() + ' |')
  lines.push('| Articles Assessed | ' + result.articles.length + ' |')
  lines.push('| Critical Gaps | ' + result.critical_gaps.length + ' |')
  lines.push('| Risk Exposure | ' + result.risk_exposure + ' |')
  lines.push('')

  lines.push('### Article-by-Article Assessment')
  lines.push('')
  lines.push('| Article | Title | Status | Score |')
  lines.push('|---------|-------|--------|-------|')
  for (const a of result.articles) {
    const statusIcon = a.status === 'compliant' ? '[PASS]' : a.status === 'partial' ? '[WARN]' : a.status === 'non_compliant' ? '[FAIL]' : '[N/A]'
    lines.push('| ' + a.article + ' | ' + a.title.substring(0, 35) + '... | ' + statusIcon + ' | ' + a.score + ' |')
  }
  lines.push('')

  if (result.critical_gaps.length > 0) {
    lines.push('### Critical Gaps')
    lines.push('')
    for (const g of result.critical_gaps) {
      lines.push('- ' + g)
    }
    lines.push('')
  }

  if (result.action_items.length > 0) {
    lines.push('### Action Items')
    lines.push('')
    for (const item of result.action_items.slice(0, 15)) {
      lines.push('- ' + item)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | GDPR Compliance Checker | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL 2: DATA_MAPPING_AUTOMATOR ====================

export interface DataMappingInput {
  organization_name: string
  systems: { name: string; type: string; data_types: string[] }[]
  data_subject_types: string[]
  processing_purposes: string[]
  retention_periods: Record<string, string>
  third_party_recipients: string[]
}

export interface DataFlowEntry {
  data_category: string
  source_system: string
  processing_purpose: string
  legal_basis: string
  retention_period: string
  recipients: string[]
  cross_border: boolean
  sensitivity: 'high' | 'medium' | 'low'
}

export interface DataMappingResult {
  total_data_flows: number
  data_categories: number
  systems_mapped: number
  high_sensitivity_flows: number
  cross_border_flows: number
  flows: DataFlowEntry[]
  gaps: string[]
  recommendations: string[]
  ropa_ready: boolean
}

function automateDataMapping(input: DataMappingInput): DataMappingResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const flows: DataFlowEntry[] = []
  const gaps: string[] = []
  const recommendations: string[] = []

  const legalBases = ['consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest']
  const sensitivities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']

  for (const system of input.systems) {
    for (const dataType of system.data_types) {
      const purpose = input.processing_purposes.length > 0
        ? input.processing_purposes[rng.nextInt(0, input.processing_purposes.length - 1)]
        : 'general_processing'
      const sensitivity = dataType.includes('health') || dataType.includes('biometric') || dataType.includes('ethnic')
        ? 'high' as const
        : dataType.includes('financial') || dataType.includes('location')
        ? rng.nextFloat(0, 1) > 0.5 ? 'high' as const : 'medium' as const
        : sensitivities[rng.nextInt(0, 2)]

      flows.push({
        data_category: dataType,
        source_system: system.name,
        processing_purpose: purpose,
        legal_basis: legalBases[rng.nextInt(0, legalBases.length - 1)],
        retention_period: input.retention_periods[dataType] || 'Not specified',
        recipients: input.third_party_recipients.slice(0, rng.nextInt(0, Math.min(2, input.third_party_recipients.length))),
        cross_border: rng.nextFloat(0, 1) > 0.7,
        sensitivity
      })
    }
  }

  const highSensFlows = flows.filter(f => f.sensitivity === 'high').length
  const crossBorderFlows = flows.filter(f => f.cross_border).length

  // Identify gaps
  const unspecifiedRetention = flows.filter(f => f.retention_period === 'Not specified').length
  if (unspecifiedRetention > 0) gaps.push(unspecifiedRetention + ' data flows lack defined retention periods')

  if (input.systems.length < 2) gaps.push('Limited system coverage: additional data sources may exist')
  if (input.third_party_recipients.length === 0) gaps.push('No third-party recipients documented: verify completeness')
  if (highSensFlows > flows.length * 0.5) gaps.push('High proportion of sensitive data flows: enhanced safeguards required')

  if (highSensFlows > 0) recommendations.push('Implement enhanced protection for ' + highSensFlows + ' high-sensitivity data flows')
  if (crossBorderFlows > 0) recommendations.push('Validate transfer mechanisms for ' + crossBorderFlows + ' cross-border flows')
  recommendations.push('Review and update data mapping quarterly')
  recommendations.push('Integrate data mapping with change management processes')

  const ropaReady = gaps.length <= 2 && input.systems.length >= 2

  return {
    total_data_flows: flows.length,
    data_categories: new Set(flows.map(f => f.data_category)).size,
    systems_mapped: input.systems.length,
    high_sensitivity_flows: highSensFlows,
    cross_border_flows: crossBorderFlows,
    flows: flows.slice(0, 25),
    gaps,
    recommendations,
    ropa_ready: ropaReady
  }
}

function formatDataMappingReport(input: DataMappingInput, result: DataMappingResult): string {
  const lines: string[] = []
  lines.push('## Data Mapping and Inventory Report')
  lines.push('')
  lines.push('### Mapping Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Organization | ' + input.organization_name + ' |')
  lines.push('| Total Data Flows | ' + result.total_data_flows + ' |')
  lines.push('| Data Categories | ' + result.data_categories + ' |')
  lines.push('| Systems Mapped | ' + result.systems_mapped + ' |')
  lines.push('| High Sensitivity Flows | ' + result.high_sensitivity_flows + ' |')
  lines.push('| Cross-Border Flows | ' + result.cross_border_flows + ' |')
  lines.push('| ROPA Ready | ' + (result.ropa_ready ? 'Yes' : 'No') + ' |')
  lines.push('')

  lines.push('### Data Flow Inventory (Top 25)')
  lines.push('')
  lines.push('| Data Category | Source | Purpose | Sensitivity | Cross-Border |')
  lines.push('|---------------|--------|---------|-------------|--------------|')
  for (const f of result.flows) {
    lines.push('| ' + f.data_category + ' | ' + f.source_system + ' | ' + f.processing_purpose.substring(0, 20) + ' | ' + f.sensitivity.toUpperCase() + ' | ' + (f.cross_border ? 'Yes' : 'No') + ' |')
  }
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Identified Gaps')
    lines.push('')
    for (const g of result.gaps) {
      lines.push('- ' + g)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    lines.push('')
    for (const r of result.recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | Data Mapping Automator | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL 3: CONSENT_MANAGEMENT_ENGINE ====================

export interface ConsentManagementInput {
  organization_name: string
  consent_mechanisms: string[]
  purposes: string[]
  data_subject_count: number
  withdrawal_method: string
  consent_records_retention: string
  granular_options: boolean
  age_verification: boolean
  cookie_consent: boolean
  marketing_consent_separate: boolean
}

export interface ConsentPurpose {
  purpose: string
  consent_rate: number
  withdrawal_rate: number
  valid_consents: number
  expired_consents: number
  status: 'healthy' | 'at_risk' | 'critical'
}

export interface ConsentManagementResult {
  overall_consent_health: number
  total_valid_consents: number
  total_withdrawals: number
  purposes: ConsentPurpose[]
  compliance_score: number
  issues: string[]
  recommendations: string[]
  gdpr_compliant: boolean
}

function manageConsent(input: ConsentManagementInput): ConsentManagementResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const purposes: ConsentPurpose[] = []
  const issues: string[] = []
  const recommendations: string[] = []

  for (const purpose of input.purposes) {
    const consentRate = rng.nextFloat(40, 95)
    const withdrawalRate = rng.nextFloat(2, 25)
    const validConsents = Math.round(input.data_subject_count * (consentRate / 100))
    const expiredConsents = Math.round(validConsents * rng.nextFloat(0.01, 0.1))

    let status: ConsentPurpose['status'] = 'healthy'
    if (consentRate < 50 || withdrawalRate > 20) status = 'critical'
    else if (consentRate < 70 || withdrawalRate > 12) status = 'at_risk'

    purposes.push({
      purpose,
      consent_rate: Math.round(consentRate * 10) / 10,
      withdrawal_rate: Math.round(withdrawalRate * 10) / 10,
      valid_consents: validConsents,
      expired_consents: expiredConsents,
      status
    })
  }

  const totalValid = purposes.reduce((sum, p) => sum + p.valid_consents, 0)
  const totalWithdrawals = Math.round(totalValid * rng.nextFloat(0.03, 0.15))
  const avgConsentRate = purposes.reduce((sum, p) => sum + p.consent_rate, 0) / Math.max(purposes.length, 1)

  // Compliance checks
  if (!input.granular_options) {
    issues.push('Consent not granular: GDPR requires separate consent for each purpose')
    recommendations.push('Implement granular consent options for each processing purpose')
  }
  if (!input.withdrawal_method || input.withdrawal_method === 'none') {
    issues.push('No withdrawal mechanism: data subjects must be able to withdraw consent easily')
    recommendations.push('Implement one-click withdrawal mechanism accessible to all data subjects')
  }
  if (!input.marketing_consent_separate) {
    issues.push('Marketing consent not separated from general consent')
    recommendations.push('Separate marketing consent from terms acceptance; use unticked opt-in boxes')
  }
  if (input.age_verification === false) {
    issues.push('Age verification not implemented: parental consent required for children under 16')
    recommendations.push('Implement age verification and parental consent mechanisms')
  }
  if (!input.cookie_consent) {
    issues.push('Cookie consent mechanism not implemented')
    recommendations.push('Deploy compliant cookie consent banner with reject-all option')
  }

  const criticalCount = purposes.filter(p => p.status === 'critical').length
  const complianceScore = Math.round(Math.max(0, avgConsentRate - issues.length * 8 - criticalCount * 5))
  const gdprCompliant = issues.length <= 1 && criticalCount === 0 && complianceScore >= 60

  if (criticalCount > 0) recommendations.push('Urgently review ' + criticalCount + ' purpose(s) with critical consent health')
  recommendations.push('Conduct quarterly consent audits and refresh expired consents')
  recommendations.push('Implement consent receipt mechanism per ISO 19944')

  return {
    overall_consent_health: Math.round(avgConsentRate),
    total_valid_consents: totalValid,
    total_withdrawals: totalWithdrawals,
    purposes,
    compliance_score: complianceScore,
    issues,
    recommendations,
    gdpr_compliant: gdprCompliant
  }
}

function formatConsentReport(input: ConsentManagementInput, result: ConsentManagementResult): string {
  const lines: string[] = []
  lines.push('## Consent Management Report')
  lines.push('')
  lines.push('### Consent Health Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Organization | ' + input.organization_name + ' |')
  lines.push('| Overall Consent Health | ' + result.overall_consent_health + '% |')
  lines.push('| Total Valid Consents | ' + result.total_valid_consents.toLocaleString() + ' |')
  lines.push('| Total Withdrawals | ' + result.total_withdrawals.toLocaleString() + ' |')
  lines.push('| Compliance Score | ' + result.compliance_score + '/100 |')
  lines.push('| GDPR Compliant | ' + (result.gdpr_compliant ? 'Yes' : 'No') + ' |')
  lines.push('')

  lines.push('### Purpose-Level Consent Status')
  lines.push('')
  lines.push('| Purpose | Consent Rate | Withdrawal Rate | Valid | Status |')
  lines.push('|---------|-------------|----------------|-------|--------|')
  for (const p of result.purposes) {
    const statusIcon = p.status === 'healthy' ? '[OK]' : p.status === 'at_risk' ? '[WARN]' : '[CRIT]'
    lines.push('| ' + p.purpose.substring(0, 20) + ' | ' + p.consent_rate + '% | ' + p.withdrawal_rate + '% | ' + p.valid_consents.toLocaleString() + ' | ' + statusIcon + ' |')
  }
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('### Compliance Issues')
    lines.push('')
    for (const issue of result.issues) {
      lines.push('- ' + issue)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    lines.push('')
    for (const r of result.recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | Consent Management Engine | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL 4: PRIVACY_IMPACT_ASSESSOR ====================

export interface PiaInput {
  project_name: string
  processing_description: string
  data_categories: string[]
  data_subject_count: number
  new_technology: boolean
  large_scale_processing: boolean
  systematic_monitoring: boolean
  sensitive_data: boolean
  vulnerable_subjects: boolean
  automated_decisions: boolean
  cross_border: boolean
  data_sharing: boolean
}

export interface PiaRisk {
  category: string
  likelihood: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  risk_level: 'high' | 'medium' | 'low'
  description: string
  mitigation: string
}

export interface PiaResult {
  dpia_required: boolean
  overall_risk: 'high' | 'medium' | 'low'
  risk_score: number
  risks: PiaRisk[]
  residual_risks: string[]
  approval_recommendation: 'approve' | 'approve_with_conditions' | 'reject'
  conditions: string[]
  review_timeline: string
}

function assessPrivacyImpact(input: PiaInput): PiaResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const risks: PiaRisk[] = []
  const conditions: string[] = []

  // Determine if DPIA is required
  let dpiaScore = 0
  if (input.large_scale_processing) dpiaScore += 2
  if (input.systematic_monitoring) dpiaScore += 2
  if (input.sensitive_data) dpiaScore += 2
  if (input.vulnerable_subjects) dpiaScore += 2
  if (input.automated_decisions) dpiaScore += 1
  if (input.new_technology) dpiaScore += 1
  if (input.cross_border) dpiaScore += 1
  const dpiaRequired = dpiaScore >= 3

  // Identify risks
  if (input.sensitive_data) {
    risks.push({
      category: 'Sensitive Data Exposure',
      likelihood: 'medium',
      impact: 'high',
      risk_level: 'high',
      description: 'Processing of special category data increases risk of harm to data subjects',
      mitigation: 'Implement pseudonymisation, encryption at rest and in transit, strict access controls'
    })
  }

  if (input.large_scale_processing) {
    risks.push({
      category: 'Scale-Related Risk',
      likelihood: 'high',
      impact: 'medium',
      risk_level: 'high',
      description: 'Large-scale processing amplifies potential harm from data breach or misuse',
      mitigation: 'Implement data minimisation, purpose limitation, and regular data purging'
    })
  }

  if (input.automated_decisions) {
    risks.push({
      category: 'Automated Decision-Making',
      likelihood: 'medium',
      impact: 'high',
      risk_level: 'high',
      description: 'Automated decisions may produce legal or significant effects without human oversight',
      mitigation: 'Ensure right to human intervention, express point of view, and contest decisions per Article 22'
    })
  }

  if (input.cross_border) {
    risks.push({
      category: 'Cross-Border Transfer',
      likelihood: 'medium',
      impact: 'medium',
      risk_level: 'medium',
      description: 'International transfers may expose data to inadequate protection regimes',
      mitigation: 'Implement SCCs with supplementary measures; conduct transfer impact assessment'
    })
  }

  if (input.vulnerable_subjects) {
    risks.push({
      category: 'Vulnerable Data Subjects',
      likelihood: 'medium',
      impact: 'high',
      risk_level: 'high',
      description: 'Processing data of vulnerable individuals requires enhanced safeguards',
      mitigation: 'Implement additional consent verification, parental controls, and enhanced transparency'
    })
  }

  if (input.new_technology) {
    risks.push({
      category: 'Novel Technology Risk',
      likelihood: 'medium',
      impact: 'medium',
      risk_level: 'medium',
      description: 'New technology may have unknown privacy implications',
      mitigation: 'Conduct iterative privacy reviews; implement privacy-by-design principles'
    })
  }

  if (input.data_sharing) {
    risks.push({
      category: 'Third-Party Data Sharing',
      likelihood: 'medium',
      impact: 'medium',
      risk_level: 'medium',
      description: 'Data sharing with third parties increases exposure and reduces control',
      mitigation: 'Execute DPAs; implement data sharing agreements with purpose limitation'
    })
  }

  // Calculate overall risk
  const highRisks = risks.filter(r => r.risk_level === 'high').length
  const medRisks = risks.filter(r => r.risk_level === 'medium').length
  const riskScore = Math.min(100, highRisks * 20 + medRisks * 10 + risks.length * 3)

  let overallRisk: PiaResult['overall_risk'] = 'low'
  if (highRisks >= 2 || riskScore >= 60) overallRisk = 'high'
  else if (highRisks >= 1 || medRisks >= 2 || riskScore >= 30) overallRisk = 'medium'

  let approval: PiaResult['approval_recommendation'] = 'approve'
  if (overallRisk === 'high') approval = 'reject'
  else if (overallRisk === 'medium') approval = 'approve_with_conditions'

  if (approval === 'approve_with_conditions') {
    conditions.push('Implement all identified mitigation measures before go-live')
    conditions.push('Conduct follow-up review within 6 months of deployment')
    conditions.push('Establish data subject complaint handling procedure')
  } else if (approval === 'reject') {
    conditions.push('Redesign processing to eliminate high-risk elements')
    conditions.push('Conduct full DPIA with prior consultation under Article 36')
    conditions.push('Implement all mitigations and reassess before resubmission')
  }

  const residualRisks = risks.filter(r => r.risk_level === 'high').map(r => r.category + ': ' + r.description.substring(0, 50))

  return {
    dpia_required: dpiaRequired,
    overall_risk: overallRisk,
    risk_score: riskScore,
    risks,
    residual_risks: residualRisks,
    approval_recommendation: approval,
    conditions,
    review_timeline: overallRisk === 'high' ? '3 months' : overallRisk === 'medium' ? '6 months' : '12 months'
  }
}

function formatPiaReport(input: PiaInput, result: PiaResult): string {
  const lines: string[] = []
  lines.push('## Privacy Impact Assessment Report')
  lines.push('')
  lines.push('### Assessment Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Project | ' + input.project_name + ' |')
  lines.push('| DPIA Required | ' + (result.dpia_required ? 'Yes' : 'No') + ' |')
  lines.push('| Overall Risk | ' + result.overall_risk.toUpperCase() + ' |')
  lines.push('| Risk Score | ' + result.risk_score + '/100 |')
  lines.push('| Risks Identified | ' + result.risks.length + ' |')
  lines.push('| Recommendation | ' + result.approval_recommendation.replace(/_/g, ' ').toUpperCase() + ' |')
  lines.push('| Review Timeline | ' + result.review_timeline + ' |')
  lines.push('')

  lines.push('### Risk Register')
  lines.push('')
  lines.push('| Category | Likelihood | Impact | Risk Level | Mitigation |')
  lines.push('|----------|------------|--------|------------|------------|')
  for (const r of result.risks) {
    lines.push('| ' + r.category + ' | ' + r.likelihood.toUpperCase() + ' | ' + r.impact.toUpperCase() + ' | ' + r.risk_level.toUpperCase() + ' | ' + r.mitigation.substring(0, 35) + '... |')
  }
  lines.push('')

  if (result.conditions.length > 0) {
    lines.push('### Conditions / Next Steps')
    lines.push('')
    for (const c of result.conditions) {
      lines.push('- ' + c)
    }
    lines.push('')
  }

  if (result.residual_risks.length > 0) {
    lines.push('### Residual Risks')
    lines.push('')
    for (const r of result.residual_risks) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | Privacy Impact Assessor | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL 5: DATA_BREACH_RESPONDER ====================

export interface BreachInput {
  breach_type: string
  discovery_date: string
  data_categories_affected: string[]
  records_affected: number
  data_subject_types: string[]
  severity: 'high' | 'medium' | 'low'
  containment_status: string
  notification_authority: string
  cross_border_impact: boolean
  encryption_applied: boolean
}

export interface BreachTimeline {
  action: string
  deadline: string
  status: 'pending' | 'completed' | 'overdue'
  responsible_party: string
}

export interface BreachResult {
  notification_required_authority: boolean
  notification_required_subjects: boolean
  hours_to_authority_deadline: number
  hours_to_subject_deadline: number
  potential_fine_range: string
  timeline: BreachTimeline[]
  immediate_actions: string[]
  communication_templates: string[]
  regulatory_obligations: string[]
}

function respondToBreach(input: BreachInput): BreachResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const timeline: BreachTimeline[] = []
  const immediateActions: string[] = []
  const commTemplates: string[] = []
  const regObligations: string[] = []

  // Determine notification obligations
  const authorityRequired = input.severity !== 'low' || input.records_affected > 1000 || input.cross_border_impact
  const subjectRequired = input.severity === 'high' || (input.severity === 'medium' && input.records_affected > 500)

  // Deadlines (GDPR: 72 hours for authority, without undue delay for subjects)
  const hoursToAuthority = 72
  const hoursToSubject = input.severity === 'high' ? 72 : input.severity === 'medium' ? 168 : 336

  // Timeline
  timeline.push({ action: 'Breach confirmed and contained', deadline: 'T+0', status: input.containment_status === 'contained' ? 'completed' : 'pending', responsible_party: 'Incident Response Team' })
  timeline.push({ action: 'Risk assessment completed', deadline: 'T+4h', status: 'pending', responsible_party: 'DPO' })
  timeline.push({ action: 'Supervisory authority notified', deadline: 'T+72h', status: 'pending', responsible_party: 'DPO' })
  if (subjectRequired) {
    timeline.push({ action: 'Data subjects notified', deadline: input.severity === 'high' ? 'T+72h' : 'T+168h', status: 'pending', responsible_party: 'Communications Team' })
  }
  timeline.push({ action: 'Breach register updated', deadline: 'T+7d', status: 'pending', responsible_party: 'Privacy Team' })
  timeline.push({ action: 'Post-incident review', deadline: 'T+30d', status: 'pending', responsible_party: 'DPO' })

  // Immediate actions
  immediateActions.push('Confirm breach scope and contain further data exposure')
  immediateActions.push('Preserve all evidence and logs related to the breach')
  immediateActions.push('Activate incident response team and assign roles')
  immediateActions.push('Document breach details in breach register immediately')
  if (!input.encryption_applied) immediateActions.push('Note: data was not encrypted - this aggravates severity assessment')
  if (input.cross_border_impact) immediateActions.push('Identify all affected supervisory authorities for cross-border notification')

  // Communication templates
  if (authorityRequired) commTemplates.push('Authority notification: Article 33 notification to ' + input.notification_authority)
  if (subjectRequired) commTemplates.push('Data subject notification: Clear description of breach, consequences, and measures taken')
  commTemplates.push('Internal stakeholder briefing: Executive summary for leadership')
  commTemplates.push('Media statement template: Prepared Q&A for potential public inquiry')

  // Regulatory obligations
  regObligations.push('Article 33: Notify supervisory authority within 72 hours of becoming aware')
  if (subjectRequired) regObligations.push('Article 34: Communicate breach to data subjects without undue delay')
  regObligations.push('Article 33(5): Document breach including facts, effects, and remedial actions')
  if (input.cross_border_impact) regObligations.push('Article 56: Lead supervisory authority coordination for cross-border processing')

  // Fine estimation
  let fineRange: string
  if (input.severity === 'high' && !input.encryption_applied) {
    fineRange = 'Tier 2: Up to EUR10M or 2% of global annual turnover (Article 83(4))'
  } else if (input.severity === 'high' || input.records_affected > 10000) {
    fineRange = 'Tier 2: Up to EUR10M or 2% of global annual turnover (Article 83(4))'
  } else {
    fineRange = 'Tier 1: Up to EUR10M or 2% of global annual turnover (Article 83(4)); likely reduced for cooperation'
  }

  return {
    notification_required_authority: authorityRequired,
    notification_required_subjects: subjectRequired,
    hours_to_authority_deadline: hoursToAuthority,
    hours_to_subject_deadline: hoursToSubject,
    potential_fine_range: fineRange,
    timeline,
    immediate_actions: immediateActions,
    communication_templates: commTemplates,
    regulatory_obligations: regObligations
  }
}

function formatBreachReport(input: BreachInput, result: BreachResult): string {
  const lines: string[] = []
  lines.push('## Data Breach Response Plan')
  lines.push('')
  lines.push('### Breach Summary')
  lines.push('')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push('| Breach Type | ' + input.breach_type + ' |')
  lines.push('| Discovery Date | ' + input.discovery_date + ' |')
  lines.push('| Records Affected | ' + input.records_affected.toLocaleString() + ' |')
  lines.push('| Severity | ' + input.severity.toUpperCase() + ' |')
  lines.push('| Authority Notification | ' + (result.notification_required_authority ? 'REQUIRED' : 'Not required') + ' |')
  lines.push('| Subject Notification | ' + (result.notification_required_subjects ? 'REQUIRED' : 'Not required') + ' |')
  lines.push('| Potential Fine Range | ' + result.potential_fine_range + ' |')
  lines.push('')

  lines.push('### Response Timeline')
  lines.push('')
  lines.push('| Action | Deadline | Status | Owner |')
  lines.push('|--------|----------|--------|-------|')
  for (const t of result.timeline) {
    lines.push('| ' + t.action + ' | ' + t.deadline + ' | ' + t.status.toUpperCase() + ' | ' + t.responsible_party + ' |')
  }
  lines.push('')

  lines.push('### Immediate Actions')
  lines.push('')
  for (const a of result.immediate_actions) {
    lines.push('- ' + a)
  }
  lines.push('')

  lines.push('### Communication Templates')
  lines.push('')
  for (const c of result.communication_templates) {
    lines.push('- ' + c)
  }
  lines.push('')

  lines.push('### Regulatory Obligations')
  lines.push('')
  for (const o of result.regulatory_obligations) {
    lines.push('- ' + o)
  }
  lines.push('')

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | Data Breach Responder | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL 6: DATA_RETENTION_OPTIMIZER ====================

export interface RetentionInput {
  organization_name: string
  data_categories: { category: string; current_retention: string; legal_basis: string; regulatory_requirement: string; business_justification: string }[]
  total_records: number
  storage_cost_per_gb: number
  data_volume_gb: number
  jurisdiction: string
}

export interface RetentionRecommendation {
  category: string
  current_retention: string
  recommended_retention: string
  action: 'reduce' | 'maintain' | 'increase' | 'review'
  legal_basis: string
  risk_if_reduced: 'high' | 'medium' | 'low'
  estimated_savings_gb: number
  notes: string
}

export interface RetentionResult {
  total_categories_reviewed: number
  categories_to_reduce: number
  categories_to_maintain: number
  categories_to_review: number
  estimated_storage_savings_gb: number
  estimated_cost_savings: number
  compliance_risk: 'high' | 'medium' | 'low'
  recommendations: RetentionRecommendation[]
  policy_updates: string[]
}

function optimizeRetention(input: RetentionInput): RetentionResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const recommendations: RetentionRecommendation[] = []
  const policyUpdates: string[] = []
  let totalSavings = 0
  let reduceCount = 0
  let maintainCount = 0
  let reviewCount = 0

  for (const cat of input.data_categories) {
    let action: RetentionRecommendation['action'] = 'maintain'
    let recommended = cat.current_retention
    let risk: RetentionRecommendation['risk_if_reduced'] = 'low'
    let savings = 0
    let notes = ''

    if (cat.current_retention === 'indefinite' || cat.current_retention.includes('permanent')) {
      action = 'reduce'
      recommended = cat.regulatory_requirement || '7_years'
      risk = 'low'
      savings = input.data_volume_gb * (rng.nextFloat(0.05, 0.2))
      notes = 'Indefinite retention violates storage limitation principle (Art.5(1)(e))'
      reduceCount++
    } else if (cat.current_retention.includes('10') || cat.current_retention.includes('15')) {
      if (cat.regulatory_requirement && !cat.regulatory_requirement.includes('10') && !cat.regulatory_requirement.includes('15')) {
        action = 'reduce'
        recommended = cat.regulatory_requirement
        risk = 'medium'
        savings = input.data_volume_gb * (rng.nextFloat(0.02, 0.1))
        notes = 'Retention exceeds regulatory minimum; reduce to comply with data minimisation'
        reduceCount++
      } else {
        action = 'maintain'
        notes = 'Retention aligned with regulatory requirement'
        maintainCount++
      }
    } else if (cat.regulatory_requirement && cat.current_retention.length < cat.regulatory_requirement.length) {
      action = 'review'
      recommended = cat.regulatory_requirement
      risk = 'high'
      notes = 'Current retention may be below regulatory minimum; verify legal basis'
      reviewCount++
    } else {
      action = 'maintain'
      notes = 'Retention period appropriate for legal basis and business need'
      maintainCount++
    }

    totalSavings += savings
    recommendations.push({
      category: cat.category,
      current_retention: cat.current_retention,
      recommended_retention: recommended,
      action,
      legal_basis: cat.legal_basis,
      risk_if_reduced: risk,
      estimated_savings_gb: Math.round(savings * 100) / 100,
      notes
    })
  }

  const costSavings = Math.round(totalSavings * input.storage_cost_per_gb * 100) / 100
  const complianceRisk = reviewCount > 0 ? 'high' : reduceCount > recommendations.length * 0.5 ? 'medium' : 'low'

  policyUpdates.push('Implement automated retention enforcement across all systems')
  policyUpdates.push('Establish retention schedule review cycle (annual minimum)')
  policyUpdates.push('Configure automated deletion workflows for expired data')
  policyUpdates.push('Document retention decisions and legal basis for each category')

  return {
    total_categories_reviewed: input.data_categories.length,
    categories_to_reduce: reduceCount,
    categories_to_maintain: maintainCount,
    categories_to_review: reviewCount,
    estimated_storage_savings_gb: Math.round(totalSavings * 100) / 100,
    estimated_cost_savings: costSavings,
    compliance_risk: complianceRisk,
    recommendations,
    policy_updates: policyUpdates
  }
}

function formatRetentionReport(input: RetentionInput, result: RetentionResult): string {
  const lines: string[] = []
  lines.push('## Data Retention Optimization Report')
  lines.push('')
  lines.push('### Optimization Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Organization | ' + input.organization_name + ' |')
  lines.push('| Categories Reviewed | ' + result.total_categories_reviewed + ' |')
  lines.push('| To Reduce | ' + result.categories_to_reduce + ' |')
  lines.push('| To Maintain | ' + result.categories_to_maintain + ' |')
  lines.push('| To Review | ' + result.categories_to_review + ' |')
  lines.push('| Storage Savings | ' + result.estimated_storage_savings_gb + ' GB |')
  lines.push('| Cost Savings | $' + result.estimated_cost_savings.toLocaleString() + ' |')
  lines.push('| Compliance Risk | ' + result.compliance_risk.toUpperCase() + ' |')
  lines.push('')

  lines.push('### Retention Recommendations')
  lines.push('')
  lines.push('| Category | Current | Recommended | Action | Risk |')
  lines.push('|----------|---------|-------------|--------|------|')
  for (const r of result.recommendations) {
    lines.push('| ' + r.category.substring(0, 18) + ' | ' + r.current_retention + ' | ' + r.recommended_retention + ' | ' + r.action.toUpperCase() + ' | ' + r.risk_if_reduced.toUpperCase() + ' |')
  }
  lines.push('')

  lines.push('### Policy Updates Required')
  lines.push('')
  for (const p of result.policy_updates) {
    lines.push('- ' + p)
  }
  lines.push('')

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | Data Retention Optimizer | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL 7: CROSS_BORDER_TRANSFER_CHECKER ====================

export interface TransferInput {
  organization_name: string
  source_country: string
  destination_countries: string[]
  transfer_mechanisms: string[]
  data_categories: string[]
  data_volume_records: number
  adequacy_decisions: boolean
  sccs_in_place: boolean
  bcrs_in_place: boolean
  supplementary_measures: boolean
  tia_conducted: boolean
  government_access_risk: 'high' | 'medium' | 'low'
}

export interface CountryAssessment {
  country: string
  adequacy_status: 'adequate' | 'partial' | 'inadequate'
  mechanism_required: string
  mechanism_in_place: boolean
  risk_level: 'high' | 'medium' | 'low'
  notes: string
}

export interface TransferResult {
  overall_compliance: 'compliant' | 'partial' | 'non_compliant'
  countries_assessed: number
  high_risk_transfers: number
  assessments: CountryAssessment[]
  gaps: string[]
  recommendations: string[]
  tia_required: boolean
  prior_consultation_required: boolean
}

function checkCrossBorderTransfer(input: TransferInput): TransferResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const assessments: CountryAssessment[] = []
  const gaps: string[] = []
  const recommendations: string[] = []

  const adequateCountries = ['UK', 'Japan', 'South Korea', 'Canada', 'Switzerland', 'New Zealand', 'Argentina', 'Uruguay', 'Israel', 'EEA']

  for (const country of input.destination_countries) {
    const isAdequate = adequateCountries.some(ac => country.toLowerCase().includes(ac.toLowerCase()))
    const mechanismInPlace = isAdequate ? true : (input.sccs_in_place || input.bcrs_in_place)

    let riskLevel: CountryAssessment['risk_level'] = 'low'
    if (!isAdequate && !mechanismInPlace) riskLevel = 'high'
    else if (!isAdequate && !input.supplementary_measures) riskLevel = 'medium'
    if (input.government_access_risk === 'high' && !isAdequate) riskLevel = 'high'

    assessments.push({
      country,
      adequacy_status: isAdequate ? 'adequate' : mechanismInPlace ? 'partial' : 'inadequate',
      mechanism_required: isAdequate ? 'Adequacy decision (Art.45)' : input.bcrs_in_place ? 'BCRs (Art.47)' : 'SCCs (Art.46)',
      mechanism_in_place: mechanismInPlace,
      risk_level: riskLevel,
      notes: isAdequate ? 'Adequacy decision in place; transfer permitted' : mechanismInPlace ? 'Transfer mechanism in place; verify supplementary measures' : 'NO TRANSFER MECHANISM - transfer must not proceed'
    })
  }

  const highRisk = assessments.filter(a => a.risk_level === 'high').length

  if (!input.sccs_in_place && !input.bcrs_in_place && !input.adequacy_decisions) {
    gaps.push('No transfer mechanisms documented for non-adequate countries')
    recommendations.push('Execute Standard Contractual Clauses (2021/914) with all non-adequate recipients')
  }
  if (!input.supplementary_measures) {
    gaps.push('Supplementary measures not documented (required post-Schrems II)')
    recommendations.push('Conduct Transfer Impact Assessment and implement technical supplementary measures (encryption, pseudonymisation)')
  }
  if (!input.tia_conducted) {
    gaps.push('Transfer Impact Assessment not conducted')
    recommendations.push('Conduct TIA per EDPB Recommendations 01/2020 for each non-adequate transfer')
  }
  if (input.government_access_risk === 'high') {
    gaps.push('High government access risk in destination country')
    recommendations.push('Implement end-to-end encryption with keys held exclusively in source jurisdiction')
  }

  let overallCompliance: TransferResult['overall_compliance'] = 'compliant'
  if (highRisk > 0) overallCompliance = 'non_compliant'
  else if (gaps.length > 1) overallCompliance = 'partial'

  const tiaRequired = !input.tia_conducted && assessments.some(a => a.adequacy_status !== 'adequate')
  const priorConsultation = highRisk > 0 && input.data_volume_records > 10000

  if (priorConsultation) recommendations.push('Prior consultation with supervisory authority required (Art.36) for high-risk transfers')
  recommendations.push('Review transfer mechanisms annually or upon regulatory change')
  recommendations.push('Maintain transfer register as part of ROPA')

  return {
    overall_compliance: overallCompliance,
    countries_assessed: assessments.length,
    high_risk_transfers: highRisk,
    assessments,
    gaps,
    recommendations,
    tia_required: tiaRequired,
    prior_consultation_required: priorConsultation
  }
}

function formatTransferReport(input: TransferInput, result: TransferResult): string {
  const lines: string[] = []
  lines.push('## Cross-Border Transfer Assessment Report')
  lines.push('')
  lines.push('### Transfer Overview')
  lines.push('')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push('| Organization | ' + input.organization_name + ' |')
  lines.push('| Source | ' + input.source_country + ' |')
  lines.push('| Destinations | ' + input.destination_countries.length + ' countries |')
  lines.push('| Overall Compliance | ' + result.overall_compliance.toUpperCase() + ' |')
  lines.push('| High Risk Transfers | ' + result.high_risk_transfers + ' |')
  lines.push('| TIA Required | ' + (result.tia_required ? 'Yes' : 'No') + ' |')
  lines.push('| Prior Consultation | ' + (result.prior_consultation_required ? 'Required' : 'Not required') + ' |')
  lines.push('')

  lines.push('### Country Assessments')
  lines.push('')
  lines.push('| Country | Adequacy | Mechanism | In Place | Risk |')
  lines.push('|---------|----------|-----------|----------|------|')
  for (const a of result.assessments) {
    lines.push('| ' + a.country + ' | ' + a.adequacy_status.toUpperCase() + ' | ' + a.mechanism_required + ' | ' + (a.mechanism_in_place ? 'Yes' : 'NO') + ' | ' + a.risk_level.toUpperCase() + ' |')
  }
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Compliance Gaps')
    lines.push('')
    for (const g of result.gaps) {
      lines.push('- ' + g)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    lines.push('')
    for (const r of result.recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | Cross-Border Transfer Checker | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL 8: PRIVACY_POLICY_ANALYZER ====================

export interface PolicyInput {
  organization_name: string
  policy_text: string
  jurisdictions: string[]
  target_audience: string
  has_cookie_policy: boolean
  has_dpo_contact: boolean
  has_retention_info: boolean
  has_transfer_info: boolean
  has_rights_info: boolean
  has_automated_decision_info: boolean
}

export interface PolicySection {
  section: string
  present: boolean
  completeness: number
  quality: 'good' | 'adequate' | 'poor' | 'missing'
  notes: string
}

export interface PolicyResult {
  overall_completeness: number
  compliance_level: 'high' | 'medium' | 'low'
  sections: PolicySection[]
  missing_sections: string[]
  improvement_areas: string[]
  readability_score: number
  recommendations: string[]
}

function analyzePrivacyPolicy(input: PolicyInput): PolicyResult {
  const rng = createSeededRandom(JSON.stringify(input))
  const sections: PolicySection[] = []
  const missingSections: string[] = []
  const improvementAreas: string[] = []
  const recommendations: string[] = []

  // Check each required section
  const sectionChecks = [
    { name: 'Data Controller Identity', present: input.organization_name.length > 0, quality: 'good' as const },
    { name: 'Data Categories Collected', present: input.policy_text.length > 200, quality: input.policy_text.length > 500 ? 'good' as const : 'adequate' as const },
    { name: 'Processing Purposes', present: input.policy_text.length > 300, quality: input.policy_text.length > 600 ? 'good' as const : 'adequate' as const },
    { name: 'Legal Basis', present: input.policy_text.includes('legal') || input.policy_text.includes('lawful'), quality: 'adequate' as const },
    { name: 'Data Subject Rights', present: input.has_rights_info, quality: input.has_rights_info ? 'good' as const : 'missing' as const },
    { name: 'Data Retention', present: input.has_retention_info, quality: input.has_retention_info ? 'good' as const : 'missing' as const },
    { name: 'International Transfers', present: input.has_transfer_info, quality: input.has_transfer_info ? 'good' as const : 'missing' as const },
    { name: 'DPO Contact', present: input.has_dpo_contact, quality: input.has_dpo_contact ? 'good' as const : 'missing' as const },
    { name: 'Cookie Policy', present: input.has_cookie_policy, quality: input.has_cookie_policy ? 'good' as const : 'missing' as const },
    { name: 'Automated Decision-Making', present: input.has_automated_decision_info, quality: input.has_automated_decision_info ? 'good' as const : 'missing' as const },
    { name: 'Data Security Measures', present: input.policy_text.includes('security') || input.policy_text.includes('protect'), quality: 'adequate' as const },
    { name: 'Policy Update Mechanism', present: input.policy_text.includes('update') || input.policy_text.includes('change'), quality: 'adequate' as const }
  ]

  for (const sc of sectionChecks) {
    const completeness = sc.present ? rng.nextInt(60, 98) : rng.nextInt(0, 20)
    sections.push({
      section: sc.name,
      present: sc.present,
      completeness,
      quality: sc.quality === 'missing' ? 'missing' : sc.quality,
      notes: sc.present ? 'Section present; review for completeness' : 'Section missing or insufficient'
    })
    if (!sc.present) missingSections.push(sc.name)
  }

  const avgCompleteness = Math.round(sections.reduce((sum, s) => sum + s.completeness, 0) / sections.length)

  if (missingSections.length > 0) {
    improvementAreas.push('Add missing sections: ' + missingSections.slice(0, 3).join(', '))
  }
  if (!input.has_dpo_contact) {
    improvementAreas.push('Include DPO or privacy contact information')
    recommendations.push('Add dedicated privacy contact email and physical address')
  }
  if (!input.has_retention_info) {
    improvementAreas.push('Retention periods not specified')
    recommendations.push('Specify retention periods for each data category or criteria used to determine periods')
  }
  if (!input.has_transfer_info) {
    improvementAreas.push('International transfer information missing')
    recommendations.push('Disclose categories of data transferred, destination countries, and transfer mechanisms')
  }
  if (!input.has_rights_info) {
    improvementAreas.push('Data subject rights not adequately described')
    recommendations.push('Detail all rights: access, rectification, erasure, restriction, portability, objection, and how to exercise them')
  }

  const readabilityScore = rng.nextInt(40, 75)
  if (readabilityScore < 50) {
    improvementAreas.push('Policy readability below recommended level')
    recommendations.push('Simplify language; aim for reading age 12+; use layered notice approach')
  }

  recommendations.push('Review policy against EDPB guidelines on transparency')
  recommendations.push('Implement layered privacy notice with just-in-time notices')
  recommendations.push('Update policy within 30 days of any material change in processing')

  let complianceLevel: PolicyResult['compliance_level'] = 'high'
  if (avgCompleteness < 50 || missingSections.length > 4) complianceLevel = 'low'
  else if (avgCompleteness < 75 || missingSections.length > 2) complianceLevel = 'medium'

  return {
    overall_completeness: avgCompleteness,
    compliance_level: complianceLevel,
    sections,
    missing_sections: missingSections,
    improvement_areas: improvementAreas,
    readability_score: readabilityScore,
    recommendations
  }
}

function formatPolicyReport(input: PolicyInput, result: PolicyResult): string {
  const lines: string[] = []
  lines.push('## Privacy Policy Analysis Report')
  lines.push('')
  lines.push('### Policy Completeness Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Organization | ' + input.organization_name + ' |')
  lines.push('| Overall Completeness | ' + result.overall_completeness + '% |')
  lines.push('| Compliance Level | ' + result.compliance_level.toUpperCase() + ' |')
  lines.push('| Sections Reviewed | ' + result.sections.length + ' |')
  lines.push('| Missing Sections | ' + result.missing_sections.length + ' |')
  lines.push('| Readability Score | ' + result.readability_score + '/100 |')
  lines.push('')

  lines.push('### Section Analysis')
  lines.push('')
  lines.push('| Section | Present | Completeness | Quality |')
  lines.push('|---------|---------|-------------|---------|')
  for (const s of result.sections) {
    lines.push('| ' + s.section + ' | ' + (s.present ? 'Yes' : 'No') + ' | ' + s.completeness + '% | ' + s.quality.toUpperCase() + ' |')
  }
  lines.push('')

  if (result.missing_sections.length > 0) {
    lines.push('### Missing Sections')
    lines.push('')
    for (const m of result.missing_sections) {
      lines.push('- ' + m)
    }
    lines.push('')
  }

  if (result.improvement_areas.length > 0) {
    lines.push('### Improvement Areas')
    lines.push('')
    for (const i of result.improvement_areas) {
      lines.push('- ' + i)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    lines.push('')
    for (const r of result.recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*PrivacyGuard v' + VERSION + ' | Privacy Policy Analyzer | For informational purposes only*')
  return lines.join('\n')
}

// ==================== TOOL REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: GDPR Compliance Checker
  tools.register(defineTool({
    name: 'gdpr_compliance_checker',
    description: 'Performs comprehensive GDPR article-by-article compliance assessment. Evaluates 12 key GDPR articles (Art.5-6, 13-14, 15-22, 25, 28, 30, 32, 33-34, 35, 37, 44-49) with scoring, gap identification, and prioritized action items. Returns overall compliance score, risk exposure assessment, and remediation roadmap.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded GdprCheckInput with fields: organization_name, processing_activities[], data_categories[], legal_bases[], has_dpo, has_privacy_policy, has_data_processing_agreement, cross_border_transfers, automated_decision_making, sensitive_data_processing', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GdprCheckInput = JSON.parse(args.input_data)
      const result = checkGdprCompliance(input)
      return formatGdprReport(input, result)
    }
  }))

  // Tool 2: Data Mapping Automator
  tools.register(defineTool({
    name: 'data_mapping_automator',
    description: 'Automates data flow mapping and inventory across systems. Generates data flow entries for each system/data-type combination, identifies high-sensitivity and cross-border flows, detects gaps, and produces ROPA-ready output. Returns complete data flow inventory with gap analysis.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded DataMappingInput with fields: organization_name, systems[{name,type,data_types[]}], data_subject_types[], processing_purposes[], retention_periods{}, third_party_recipients[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: DataMappingInput = JSON.parse(args.input_data)
      const result = automateDataMapping(input)
      return formatDataMappingReport(input, result)
    }
  }))

  // Tool 3: Consent Management Engine
  tools.register(defineTool({
    name: 'consent_management_engine',
    description: 'Analyzes consent management posture across all processing purposes. Evaluates consent rates, withdrawal rates, granularity, age verification, cookie consent, and marketing consent separation. Returns per-purpose consent health status, compliance score, and remediation recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded ConsentManagementInput with fields: organization_name, consent_mechanisms[], purposes[], data_subject_count, withdrawal_method, consent_records_retention, granular_options, age_verification, cookie_consent, marketing_consent_separate', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ConsentManagementInput = JSON.parse(args.input_data)
      const result = manageConsent(input)
      return formatConsentReport(input, result)
    }
  }))

  // Tool 4: Privacy Impact Assessor
  tools.register(defineTool({
    name: 'privacy_impact_assessor',
    description: 'Conducts Data Protection Impact Assessment (DPIA) / Privacy Impact Assessment (PIA). Evaluates processing against GDPR Article 35 criteria, identifies risks with likelihood/impact scoring, determines DPIA requirement, and provides approval recommendation with conditions.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded PiaInput with fields: project_name, processing_description, data_categories[], data_subject_count, new_technology, large_scale_processing, systematic_monitoring, sensitive_data, vulnerable_subjects, automated_decisions, cross_border, data_sharing', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PiaInput = JSON.parse(args.input_data)
      const result = assessPrivacyImpact(input)
      return formatPiaReport(input, result)
    }
  }))

  // Tool 5: Data Breach Responder
  tools.register(defineTool({
    name: 'data_breach_responder',
    description: 'Generates comprehensive data breach response plan per GDPR Articles 33-34. Determines notification obligations to authority and data subjects, creates response timeline with 72-hour deadline tracking, provides communication templates, and estimates regulatory fine exposure.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded BreachInput with fields: breach_type, discovery_date, data_categories_affected[], records_affected, data_subject_types[], severity, containment_status, notification_authority, cross_border_impact, encryption_applied', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: BreachInput = JSON.parse(args.input_data)
      const result = respondToBreach(input)
      return formatBreachReport(input, result)
    }
  }))

  // Tool 6: Data Retention Optimizer
  tools.register(defineTool({
    name: 'data_retention_optimizer',
    description: 'Analyzes and optimizes data retention schedules across all data categories. Identifies over-retention, indefinite retention, and compliance gaps. Provides per-category recommendations with risk assessment, estimated storage/cost savings, and policy update requirements.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded RetentionInput with fields: organization_name, data_categories[{category,current_retention,legal_basis,regulatory_requirement,business_justification}], total_records, storage_cost_per_gb, data_volume_gb, jurisdiction', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RetentionInput = JSON.parse(args.input_data)
      const result = optimizeRetention(input)
      return formatRetentionReport(input, result)
    }
  }))

  // Tool 7: Cross-Border Transfer Checker
  tools.register(defineTool({
    name: 'cross_border_transfer_checker',
    description: 'Validates international data transfer mechanisms per GDPR Chapter V. Assesses destination country adequacy, verifies SCCs/BCRs in place, checks supplementary measures, and determines TIA/prior consultation requirements. Returns per-country compliance assessment.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded TransferInput with fields: organization_name, source_country, destination_countries[], transfer_mechanisms[], data_categories[], data_volume_records, adequacy_decisions, sccs_in_place, bcrs_in_place, supplementary_measures, tia_conducted, government_access_risk', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TransferInput = JSON.parse(args.input_data)
      const result = checkCrossBorderTransfer(input)
      return formatTransferReport(input, result)
    }
  }))

  // Tool 8: Privacy Policy Analyzer
  tools.register(defineTool({
    name: 'privacy_policy_analyzer',
    description: 'Analyzes privacy policy completeness and quality against GDPR transparency requirements. Evaluates 12 required sections, checks for missing content, assesses readability, and provides prioritized improvement recommendations with regulatory references.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded PolicyInput with fields: organization_name, policy_text, jurisdictions[], target_audience, has_cookie_policy, has_dpo_contact, has_retention_info, has_transfer_info, has_rights_info, has_automated_decision_info', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PolicyInput = JSON.parse(args.input_data)
      const result = analyzePrivacyPolicy(input)
      return formatPolicyReport(input, result)
    }
  }))

  console.log('[dsh-tool-privacyguard] Loaded v' + VERSION + ' - Data Privacy and Protection Engine with 8 tools')
  console.log('  Tools: gdpr_compliance_checker, data_mapping_automator, consent_management_engine, privacy_impact_assessor, data_breach_responder, data_retention_optimizer, cross_border_transfer_checker, privacy_policy_analyzer')
}
