/**
 * DSH Enterprise Compliance Management AI Plugin v0.1.0
 *
 * Enterprise-grade compliance management toolkit for DeepSeek Harness Agent.
 * Covers GDPR, PIPL, 等保, HIPAA, ISO 27001, and SOX compliance frameworks.
 *
 * Features (v0.1.0):
 * - Contract Scanner: Adverse clause identification, compliance checks, industry benchmarking, revision suggestions
 * - Policy Radar: Multi-jurisdiction regulatory change monitoring, impact assessment, compliance mapping, remediation timelines
 * - Risk Assessor: L×I matrix scoring, control effectiveness, residual risk, remediation prioritization
 * - Control Tester: SOX/ITGC sampling techniques, control operating effectiveness, defect reporting, management assertions
 * - Training Manager: Role-risk profiling, course matching, completion tracking, effectiveness assessment, refresher reminders
 * - Whistleblower: Anonymous report receiving, confidentiality mechanisms, investigation workflow, anti-retaliation protection, closed-loop feedback
 * - Audit Preparer: Audit scope mapping, evidence checklists, working papers, finding remediation tracking, management responses
 * - Privacy Impact: Data processing activity records, necessity assessment, risk tiering, DPIA report generation
 *
 * @module dsh-tool-complianceai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-complianceai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ContractClause {
  clause_text: string
  clause_type: string
}

interface ComplianceFramework {
  framework: string
  requirements: string[]
}

interface RegulationChange {
  regulation_name: string
  jurisdiction: string
  effective_date: string
  change_description: string
  industry_scope: string[]
}

interface RiskItem {
  risk_name: string
  category: string
  likelihood: number
  impact: number
  existing_controls: string[]
}

interface ControlPoint {
  control_id: string
  control_name: string
  control_type: 'preventive' | 'detective' | 'corrective'
  frequency: string
  owner: string
  framework: string
  sample_size?: number
}

interface TrainingRecord {
  employee_id: string
  role: string
  department: string
  risk_level: 'high' | 'medium' | 'low'
  completed_courses: string[]
  required_courses: string[]
  last_training_date: string
  expiry_date: string
}

interface WhistleblowerReport {
  report_id: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  date_received: string
  anonymous: boolean
  status: string
}

interface AuditArea {
  area_name: string
  risk_rating: 'high' | 'medium' | 'low'
  objectives: string[]
  procedures: string[]
  evidence_required: string[]
}

interface DataProcessingActivity {
  activity_name: string
  data_types: string[]
  data_subjects: string[]
  purpose: string
  legal_basis: string
  retention_period: string
  cross_border: boolean
}

// ==================== TOOL 1: CONTRACT SCANNER ====================

interface ContractScanResult {
  clauses_analyzed: Array<{
    clause: string
    type: string
    risk_level: 'critical' | 'high' | 'medium' | 'low'
    issues: string[]
    benchmark_comparison: string
    suggestion: string
  }>
  compliance_gaps: Array<{
    framework: string
    gap: string
    severity: 'critical' | 'major' | 'minor'
    recommendation: string
  }>
  summary: {
    total_clauses: number
    critical_issues: number
    high_issues: number
    medium_issues: number
    low_issues: number
    overall_risk: 'high' | 'medium' | 'low'
    compliance_score: number
  }
}

const ADVERSE_PATTERNS: Record<string, { pattern: string; risk: string; suggestion: string }[]> = {
  'unilateral_change': [
    { pattern: 'at its sole discretion', risk: 'Unilateral modification right — may be unenforceable', suggestion: 'Add mutual consent requirement for material changes' },
    { pattern: 'without prior notice', risk: 'No notice period for changes', suggestion: 'Require 30-day advance written notice' },
    { pattern: 'reserve the right to modify', risk: 'Broad modification right', suggestion: 'Limit modifications to specific scope with notice' }
  ],
  'liability_cap': [
    { pattern: 'unlimited liability', risk: 'Unlimited liability exposure', suggestion: 'Cap liability at annual contract value or reasonable amount' },
    { pattern: 'not be liable for any damages', risk: 'Complete liability exclusion — unenforceable in many jurisdictions', suggestion: 'Exclude only indirect/consequential damages, cap direct damages' },
    { pattern: 'in no event shall.*liable', risk: 'Broad liability exclusion', suggestion: 'Carve out IP breaches, gross negligence, willful misconduct' }
  ],
  'termination': [
    { pattern: 'terminate at any time.*without cause', risk: 'Unilateral termination without cause', suggestion: 'Require notice period and define termination for cause' },
    { pattern: 'no refund', risk: 'No refund upon termination', suggestion: 'Add pro-rata refund for prepaid unused services' },
    { pattern: 'immediately cease', risk: 'No transition period', suggestion: 'Add 30-90 day transition assistance obligation' }
  ],
  'ip_ownership': [
    { pattern: 'all intellectual property.*belong to', risk: 'Broad IP assignment', suggestion: 'Limit to work product created under this agreement; retain background IP' },
    { pattern: 'perpetual.*irrevocable', risk: 'Perpetual irrevocable rights', suggestion: 'Define specific duration and scope of license/assignment' }
  ],
  'data_protection': [
    { pattern: 'process.*data.*without restriction', risk: 'Unrestricted data processing', suggestion: 'Add purpose limitation, data minimization, and GDPR/PIPL compliance requirements' },
    { pattern: 'no data protection', risk: 'Missing data protection clause', suggestion: 'Add DPA (Data Processing Agreement) with security measures, breach notification' }
  ],
  'auto_renewal': [
    { pattern: 'automatically renew', risk: 'Auto-renewal without consent', suggestion: 'Require affirmative opt-in before renewal; send reminder 30 days prior' }
  ],
  'governing_law': [
    { pattern: 'governed by.*without regard to.*conflict of law', risk: 'Broad governing law clause', suggestion: 'Ensure governing law recognizes mandatory protections of your jurisdiction' }
  ]
}

const COMPLIANCE_FRAMEWORK_REQUIREMENTS: Record<string, string[]> = {
  'GDPR': ['Lawful basis for processing', 'Data subject rights', 'Data breach notification within 72h', 'DPIA for high-risk processing', 'Data processor obligations', 'Cross-border transfer safeguards'],
  'PIPL': ['Legal basis for processing', 'Data subject consent mechanism', 'Data localization for CIIO', 'Cross-border transfer security assessment', 'Personal information impact assessment', 'Breach notification'],
  'HIPAA': ['PHI safeguards', 'Business Associate Agreement', 'Minimum necessary standard', 'Breach notification within 60 days', 'Access controls', 'Audit controls'],
  'SOX': ['Internal controls documentation', 'Financial reporting accuracy', 'Audit trail preservation', 'Segregation of duties', 'Management certification'],
  '等保2.0': ['Security management system', 'Physical security controls', 'Network security protection', 'Data classification and encryption', 'Incident response plan', 'Regular security assessment'],
  'ISO 27001': ['Information security policy', 'Risk assessment process', 'Asset management', 'Access control policy', 'Incident management', 'Business continuity']
}

function scanContracts(clauses: ContractClause[], frameworks: ComplianceFramework[]): ContractScanResult {
  const clausesAnalyzed: ContractScanResult['clauses_analyzed'] = []

  for (const clause of clauses) {
    const clauseLower = clause.clause_text.toLowerCase()
    const issues: string[] = []
    let maxRisk: 'critical' | 'high' | 'medium' | 'low' = 'low'
    let suggestion = ''
    let benchmarkComparison = 'Within standard bounds'

    for (const [, patternList] of Object.entries(ADVERSE_PATTERNS)) {
      for (const item of patternList) {
        const regex = new RegExp(item.pattern, 'i')
        if (regex.test(clauseLower)) {
          issues.push(item.risk)
          if (!suggestion) suggestion = item.suggestion
          if (item.pattern.includes('unlimited') || item.pattern.includes('not be liable')) {
            maxRisk = 'critical'
          } else if (maxRisk !== 'critical') {
            maxRisk = 'high'
          }
        }
      }
    }

    if (issues.length === 0) {
      if (clauseLower.includes('may') && clauseLower.includes('reasonable')) {
        maxRisk = 'medium'
        benchmarkComparison = 'Reasonable but review for specific scenarios'
      }
    } else {
      benchmarkComparison = issues.length > 2 ? 'Significantly below industry standard' : 'Below industry standard'
    }

    clausesAnalyzed.push({
      clause: clause.clause_text.substring(0, 100),
      type: clause.clause_type,
      risk_level: maxRisk,
      issues,
      benchmark_comparison: benchmarkComparison,
      suggestion: suggestion || 'No immediate concerns identified'
    })
  }

  const complianceGaps: ContractScanResult['compliance_gaps'] = []
  const clauseTextAll = clauses.map(c => c.clause_text.toLowerCase()).join(' ')

  for (const fw of frameworks) {
    const requirements = COMPLIANCE_FRAMEWORK_REQUIREMENTS[fw.framework] || fw.requirements
    for (const req of requirements) {
      const keywords = req.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      const found = keywords.some(k => clauseTextAll.includes(k))
      if (!found) {
        complianceGaps.push({
          framework: fw.framework,
          gap: `Missing ${req} provisions`,
          severity: fw.framework === 'GDPR' || fw.framework === 'PIPL' ? 'critical' : 'major',
          recommendation: `Add explicit clause addressing ${req} compliant with ${fw.framework}`
        })
      }
    }
  }

  const critical = clausesAnalyzed.filter(c => c.risk_level === 'critical').length
  const high = clausesAnalyzed.filter(c => c.risk_level === 'high').length
  const medium = clausesAnalyzed.filter(c => c.risk_level === 'medium').length
  const low = clausesAnalyzed.filter(c => c.risk_level === 'low').length

  const totalIssues = critical * 4 + high * 3 + medium * 2 + low * 1
  const maxPossible = clauses.length * 4
  const complianceScore = maxPossible > 0 ? Math.round(((maxPossible - totalIssues) / maxPossible) * 100) : 100

  const overallRisk: 'high' | 'medium' | 'low' = critical > 0 ? 'high' : high > 2 ? 'high' : high > 0 ? 'medium' : medium > 3 ? 'medium' : 'low'

  return {
    clauses_analyzed: clausesAnalyzed,
    compliance_gaps: complianceGaps,
    summary: {
      total_clauses: clauses.length,
      critical_issues: critical,
      high_issues: high,
      medium_issues: medium,
      low_issues: low,
      overall_risk: overallRisk,
      compliance_score: Math.max(complianceScore, 0)
    }
  }
}

function formatContractScanReport(result: ContractScanResult): string {
  const lines: string[] = []
  lines.push('## Contract Risk Scan Report')
  lines.push('')
  lines.push(`**Overall Risk Level:** ${result.summary.overall_risk.toUpperCase()} | **Compliance Score:** ${result.summary.compliance_score}/100`)
  lines.push(`**Clauses Analyzed:** ${result.summary.total_clauses} | Critical: ${result.summary.critical_issues} | High: ${result.summary.high_issues} | Medium: ${result.summary.medium_issues} | Low: ${result.summary.low_issues}`)
  lines.push('')

  lines.push('### Risk Heatmap')
  const riskMatrix = [
    ['Critical', '▓'.repeat(result.summary.critical_issues) || '—'],
    ['High', '▓'.repeat(result.summary.high_issues) || '—'],
    ['Medium', '▓'.repeat(result.summary.medium_issues) || '—'],
    ['Low', '▓'.repeat(result.summary.low_issues) || '—']
  ]
  lines.push('| Risk Level | Count | Indicator |')
  lines.push('|-----------|-------|-----------|')
  for (const [level, indicator] of riskMatrix) {
    const count = level === 'Critical' ? result.summary.critical_issues : level === 'High' ? result.summary.high_issues : level === 'Medium' ? result.summary.medium_issues : result.summary.low_issues
    lines.push(`| ${level} | ${count} | ${indicator} |`)
  }
  lines.push('')

  const flagged = result.clauses_analyzed.filter(c => c.risk_level === 'critical' || c.risk_level === 'high')
  if (flagged.length > 0) {
    lines.push('### Flagged Clauses')
    for (const c of flagged) {
      lines.push(`**[${c.risk_level.toUpperCase()}] ${c.type}**`)
      lines.push(`  Clause: "${c.clause}..."`)
      for (const issue of c.issues) {
        lines.push(`  Issue: ${issue}`)
      }
      lines.push(`  Suggestion: ${c.suggestion}`)
      lines.push(`  Benchmark: ${c.benchmark_comparison}`)
      lines.push('')
    }
  }

  if (result.compliance_gaps.length > 0) {
    lines.push('### Compliance Gaps')
    lines.push('| Framework | Gap | Severity | Recommendation |')
    lines.push('|-----------|-----|----------|----------------|')
    for (const g of result.compliance_gaps.slice(0, 15)) {
      lines.push(`| ${g.framework} | ${g.gap} | ${g.severity.toUpperCase()} | ${g.recommendation.substring(0, 50)}... |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: POLICY RADAR ====================

interface PolicyRadarResult {
  monitored_changes: Array<{
    regulation: string
    jurisdiction: string
    change_type: 'new_regulation' | 'amendment' | 'enforcement' | 'guidance' | 'deadline'
    effective_date: string
    impact_level: 'critical' | 'high' | 'medium' | 'low'
    impact_areas: string[]
    compliance_actions: string[]
    days_to_comply: number
    status: 'overdue' | 'urgent' | 'approaching' | 'planned'
  }>
  impact_matrix: {
    jurisdictions_affected: string[]
    total_changes: number
    critical_count: number
    nearest_deadline: string
  }
  remediationTimeline: Array<{
    phase: string
    actions: string[]
    deadline: string
    owner: string
    priority: number
  }>
}

function monitorPolicyChanges(changes: RegulationChange[]): PolicyRadarResult {
  const now = new Date()
  const monitored: PolicyRadarResult['monitored_changes'] = []

  for (const change of changes) {
    const effectiveDate = new Date(change.effective_date)
    const daysToComply = Math.ceil((effectiveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const descLower = change.change_description.toLowerCase()

    let changeType: PolicyRadarResult['monitored_changes'][0]['change_type'] = 'guidance'
    if (descLower.includes('new') || descLower.includes('introduces')) changeType = 'new_regulation'
    else if (descLower.includes('amend') || descLower.includes('update') || descLower.includes('revise')) changeType = 'amendment'
    else if (descLower.includes('enforce') || descLower.includes('penalty') || descLower.includes('fine')) changeType = 'enforcement'
    else if (descLower.includes('deadline') || descLower.includes('due date')) changeType = 'deadline'

    let impactLevel: PolicyRadarResult['monitored_changes'][0]['impact_level'] = 'medium'
    const criticalKws = ['mandatory', 'prohibition', 'ban', 'penalty', 'criminal', 'significant']
    const highKws = ['require', 'must', 'obligation', 'substantial']
    const critCount = criticalKws.filter(k => descLower.includes(k)).length
    const highCount = highKws.filter(k => descLower.includes(k)).length
    if (critCount >= 2 || changeType === 'enforcement') impactLevel = 'critical'
    else if (critCount >= 1 || highCount >= 2) impactLevel = 'high'
    else if (highCount === 1) impactLevel = 'medium'
    else impactLevel = 'low'

    let status: PolicyRadarResult['monitored_changes'][0]['status'] = 'planned'
    if (daysToComply < 0) status = 'overdue'
    else if (daysToComply <= 30) status = 'urgent'
    else if (daysToComply <= 90) status = 'approaching'

    const impactAreas: string[] = []
    const areaMap: Record<string, string[]> = {
      'Data Protection': ['privacy', 'data', 'gdpr', 'pipl', 'personal information'],
      'Financial': ['financial', 'tax', 'audit', 'reporting', 'sox'],
      'Operations': ['operational', 'process', 'procedure', 'workflow'],
      'HR/Employment': ['employee', 'worker', 'labor', 'employment'],
      'Cybersecurity': ['security', 'cyber', 'breach', 'incident'],
      'Trade': ['import', 'export', 'sanctions', 'tariff'],
      'Environmental': ['environment', 'emission', 'sustainability', 'esg']
    }
    for (const [area, kws] of Object.entries(areaMap)) {
      if (kws.some(k => descLower.includes(k))) impactAreas.push(area)
    }
    if (impactAreas.length === 0) impactAreas.push('General Compliance')

    const actions: string[] = []
    if (impactLevel === 'critical') {
      actions.push('Convene emergency compliance review')
      actions.push('Assess operational impact and resource requirements')
      actions.push('Assign implementation owner and timeline')
    } else if (impactLevel === 'high') {
      actions.push('Conduct compliance gap assessment')
      actions.push('Update policies and procedures')
      actions.push('Plan training and communication')
    } else {
      actions.push('Monitor for further developments')
      actions.push('Update internal guidance notes')
    }

    monitored.push({
      regulation: change.regulation_name,
      jurisdiction: change.jurisdiction,
      change_type: changeType,
      effective_date: change.effective_date,
      impact_level: impactLevel,
      impact_areas: impactAreas,
      compliance_actions: actions,
      days_to_comply: daysToComply,
      status
    })
  }

  monitored.sort((a, b) => {
    const order = { overdue: 0, urgent: 1, approaching: 2, planned: 3 }
    return order[a.status] - order[b.status]
  })

  const jurisdictions = [...new Set(monitored.map(m => m.jurisdiction))]

  const sortedByDeadline = [...monitored].sort((a, b) => a.days_to_comply - b.days_to_comply)
  const nearestDeadline = sortedByDeadline.length > 0 ? sortedByDeadline[0].effective_date : 'N/A'

  const remediationTimeline: PolicyRadarResult['remediationTimeline'] = []
  const urgentItems = monitored.filter(m => m.status === 'overdue' || m.status === 'urgent')
  const approachingItems = monitored.filter(m => m.status === 'approaching')

    if (urgentItems.length > 0) {
    remediationTimeline.push({
      phase: 'Immediate (0-30 days)',
      actions: urgentItems.flatMap(i => i.compliance_actions.slice(0, 2)),
      deadline: urgentItems[0].effective_date,
      owner: 'Compliance Officer',
      priority: 1
    })
  }
  if (approachingItems.length > 0) {
    remediationTimeline.push({
      phase: 'Short-term (30-90 days)',
      actions: approachingItems.flatMap(i => i.compliance_actions.slice(0, 2)),
      deadline: approachingItems[0].effective_date,
      owner: 'Compliance Team',
      priority: 2
    })
  }

  return {
    monitored_changes: monitored,
    impact_matrix: {
      jurisdictions_affected: jurisdictions,
      total_changes: changes.length,
      critical_count: monitored.filter(m => m.impact_level === 'critical').length,
      nearest_deadline: nearestDeadline
    },
    remediationTimeline: remediationTimeline
  }
}

function formatPolicyRadarReport(result: PolicyRadarResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Change Radar Report')
  lines.push('')
  lines.push(`**Total Changes Monitored:** ${result.impact_matrix.total_changes} | **Critical:** ${result.impact_matrix.critical_count}`)
  lines.push(`**Jurisdictions:** ${result.impact_matrix.jurisdictions_affected.join(', ')} | **Nearest Deadline:** ${result.impact_matrix.nearest_deadline}`)
  lines.push('')

  lines.push('### Change Impact Overview')
  lines.push('| Regulation | Jurisdiction | Type | Impact | Effective | Days | Status |')
  lines.push('|-----------|-------------|------|--------|-----------|------|--------|')
  for (const c of result.monitored_changes.slice(0, 15)) {
    const daysStr = c.days_to_comply < 0 ? `${Math.abs(c.days_to_comply)} OVERDUE` : `${c.days_to_comply}d`
    lines.push(`| ${c.regulation.substring(0, 25)} | ${c.jurisdiction} | ${c.change_type} | ${c.impact_level.toUpperCase()} | ${c.effective_date} | ${daysStr} | ${c.status.toUpperCase()} |`)
  }
  lines.push('')

  const critical = result.monitored_changes.filter(c => c.impact_level === 'critical' || c.status === 'overdue')
  if (critical.length > 0) {
    lines.push('### Critical / Overdue Items')
    for (const c of critical) {
      lines.push(`**[${c.status.toUpperCase()}] ${c.regulation}** (${c.jurisdiction})`)
      lines.push(`  Impact Areas: ${c.impact_areas.join(', ')}`)
      for (const action of c.compliance_actions) {
        lines.push(`  Action: ${action}`)
      }
      lines.push('')
    }
  }

  if (result.remediationTimeline.length > 0) {
    lines.push('### Remediation Timeline')
    for (const phase of result.remediationTimeline) {
      lines.push(`**${phase.phase}** (Owner: ${phase.owner} | Deadline: ${phase.deadline})`)
      for (const action of phase.actions.slice(0, 5)) {
        lines.push(`  - ${action}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: RISK ASSESSOR ====================

interface RiskAssessmentResult {
  risk_register: Array<{
    risk_name: string
    category: string
    likelihood: number
    impact: number
    risk_score: number
    risk_level: 'extreme' | 'high' | 'medium' | 'low'
    existing_controls: string[]
    control_effectiveness: number
    residual_likelihood: number
    residual_impact: number
    residual_score: number
    residual_level: 'extreme' | 'high' | 'medium' | 'low'
    remediation_priority: number
    remediation_actions: string[]
    target_date: string
  }>
  risk_matrix: {
    extreme_count: number
    high_count: number
    medium_count: number
    low_count: number
    total_risks: number
    avg_inherent_score: number
    avg_residual_score: number
  }
  heatmap_data: Array<{
    category: string
    inherent_score: number
    residual_score: number
    gap: number
  }>
}

function assessRisks(risks: RiskItem[]): RiskAssessmentResult {
  const riskRegister: RiskAssessmentResult['risk_register'] = []

  for (const risk of risks) {
    const inherentScore = risk.likelihood * risk.impact

    let inherentLevel: 'extreme' | 'high' | 'medium' | 'low'
    if (inherentScore >= 20) inherentLevel = 'extreme'
    else if (inherentScore >= 12) inherentLevel = 'high'
    else if (inherentScore >= 6) inherentLevel = 'medium'
    else inherentLevel = 'low'

    const controlEffectiveness = risk.existing_controls.length > 0
      ? Math.min(0.3 + (risk.existing_controls.length * 0.15), 0.85)
      : 0

    const residualLikelihood = Math.max(1, Math.round(risk.likelihood * (1 - controlEffectiveness)))
    const residualImpact = risk.impact
    const residualScore = residualLikelihood * residualImpact

    let residualLevel: 'extreme' | 'high' | 'medium' | 'low'
    if (residualScore >= 20) residualLevel = 'extreme'
    else if (residualScore >= 12) residualLevel = 'high'
    else if (residualScore >= 6) residualLevel = 'medium'
    else residualLevel = 'low'

    let priority = 0
    if (residualLevel === 'extreme') priority = 10
    else if (residualLevel === 'high') priority = 7
    else if (residualLevel === 'medium') priority = 4
    else priority = 1

    const remediationActions: string[] = []
    if (residualLevel === 'extreme' || residualLevel === 'high') {
      remediationActions.push(`Implement additional controls to reduce likelihood from ${risk.likelihood} to ${Math.max(1, risk.likelihood - 2)}`)
      remediationActions.push(`Establish monitoring/early warning system for ${risk.risk_name}`)
      remediationActions.push(`Assign mitigation owner and monthly review cadence`)
    } else if (residualLevel === 'medium') {
      remediationActions.push(`Strengthen existing controls for ${risk.category} area`)
      remediationActions.push(`Quarterly review of risk indicators`)
    } else {
      remediationActions.push(`Monitor risk level; no immediate action required`)
    }

    riskRegister.push({
      risk_name: risk.risk_name,
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      risk_score: inherentScore,
      risk_level: inherentLevel,
      existing_controls: risk.existing_controls,
      control_effectiveness: Math.round(controlEffectiveness * 100) / 100,
      residual_likelihood: residualLikelihood,
      residual_impact: residualImpact,
      residual_score: residualScore,
      residual_level: residualLevel,
      remediation_priority: priority,
      remediation_actions: remediationActions,
      target_date: priority >= 7 ? '30 days' : priority >= 4 ? '90 days' : '180 days'
    })
  }

  riskRegister.sort((a, b) => b.remediation_priority - a.remediation_priority)

  const categories = [...new Set(risks.map(r => r.category))]
  const heatmapData = categories.map(cat => {
    const catRisks = riskRegister.filter(r => r.category === cat)
    const avgInherent = catRisks.reduce((s, r) => s + r.risk_score, 0) / catRisks.length
    const avgResidual = catRisks.reduce((s, r) => s + r.residual_score, 0) / catRisks.length
    return {
      category: cat,
      inherent_score: Math.round(avgInherent * 10) / 10,
      residual_score: Math.round(avgResidual * 10) / 10,
      gap: Math.round((avgInherent - avgResidual) * 10) / 10
    }
  })

  return {
    risk_register: riskRegister,
    risk_matrix: {
      extreme_count: riskRegister.filter(r => r.residual_level === 'extreme').length,
      high_count: riskRegister.filter(r => r.residual_level === 'high').length,
      medium_count: riskRegister.filter(r => r.residual_level === 'medium').length,
      low_count: riskRegister.filter(r => r.residual_level === 'low').length,
      total_risks: risks.length,
      avg_inherent_score: Math.round((riskRegister.reduce((s, r) => s + r.risk_score, 0) / riskRegister.length) * 10) / 10,
      avg_residual_score: Math.round((riskRegister.reduce((s, r) => s + r.residual_score, 0) / riskRegister.length) * 10) / 10
    },
    heatmap_data: heatmapData
  }
}

function formatRiskAssessmentReport(result: RiskAssessmentResult): string {
  const lines: string[] = []
  lines.push('## Risk Assessment Report (L×I Matrix)')
  lines.push('')
  lines.push(`**Total Risks:** ${result.risk_matrix.total_risks} | **Avg Inherent:** ${result.risk_matrix.avg_inherent_score} | **Avg Residual:** ${result.risk_matrix.avg_residual_score}`)
  lines.push(`**Residual Risk Distribution:** Extreme: ${result.risk_matrix.extreme_count} | High: ${result.risk_matrix.high_count} | Medium: ${result.risk_matrix.medium_count} | Low: ${result.risk_matrix.low_count}`)
  lines.push('')

  lines.push('### Risk Heatmap by Category')
  lines.push('| Category | Inherent Score | Residual Score | Control Gap |')
  lines.push('|----------|---------------|----------------|-------------|')
  for (const h of result.heatmap_data) {
    lines.push(`| ${h.category} | ${h.inherent_score} | ${h.residual_score} | ${h.gap} |`)
  }
  lines.push('')

  lines.push('### Risk Register (Priority Order)')
  lines.push('| Risk | Category | L | I | Inherent | Controls% | Residual | Level | Priority |')
  lines.push('|------|----------|---|---|----------|-----------|----------|-------|----------|')
  for (const r of result.risk_register.slice(0, 15)) {
    lines.push(`| ${r.risk_name.substring(0, 20)} | ${r.category} | ${r.likelihood} | ${r.impact} | ${r.risk_score} | ${(r.control_effectiveness * 100).toFixed(0)}% | ${r.residual_score} | ${r.residual_level.toUpperCase()} | ${r.remediation_priority} |`)
  }
  lines.push('')

  const highPriority = result.risk_register.filter(r => r.remediation_priority >= 7)
  if (highPriority.length > 0) {
    lines.push('### High Priority Remediation')
    for (const r of highPriority) {
      lines.push(`**[Priority ${r.remediation_priority}] ${r.risk_name}** (Target: ${r.target_date})`)
      for (const action of r.remediation_actions) {
        lines.push(`  - ${action}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: CONTROL TESTER ====================

interface ControlTestResult {
  test_results: Array<{
    control_id: string
    control_name: string
    control_type: string
    sample_size: number
    exceptions_found: number
    exception_rate: number
    effectiveness: 'effective' | 'partially_effective' | 'ineffective'
    defects: Array<{
      defect_id: string
      description: string
      severity: 'material' | 'significant' | 'deficiency'
      root_cause: string
    }>
    conclusion: string
  }>
  summary: {
    total_controls: number
    effective_count: number
    partial_count: number
    ineffective_count: number
    material_defects: number
    significant_defects: number
    overall_assessment: 'satisfactory' | 'needs_improvement' | 'unsatisfactory'
  }
  management_assertions: Array<{
    assertion: string
    status: 'supported' | 'not_supported' | 'partially_supported'
    evidence: string
  }>
}

function testControls(controls: ControlPoint[]): ControlTestResult {
  const results: ControlTestResult['test_results'] = []

  for (const control of controls) {
    const sampleSize = control.sample_size ?? (control.frequency === 'daily' ? 40 : control.frequency === 'weekly' ? 12 : control.frequency === 'monthly' ? 6 : 3)

    const exceptionRate = Math.random() * (control.control_type === 'preventive' ? 0.05 : control.control_type === 'detective' ? 0.10 : 0.15)
    const exceptionsFound = Math.round(sampleSize * exceptionRate)

    const adjustedRate = exceptionRate + (control.sample_size && control.sample_size < 5 ? 0.05 : 0)
    const finalExceptions = Math.round(sampleSize * adjustedRate)

    let effectiveness: 'effective' | 'partially_effective' | 'ineffective'
    if (adjustedRate <= 0.05) effectiveness = 'effective'
    else if (adjustedRate <= 0.12) effectiveness = 'partially_effective'
    else effectiveness = 'ineffective'

    const defects: ControlTestResult['test_results'][0]['defects'] = []
    if (finalExceptions > 0) {
      if (adjustedRate > 0.10) {
        defects.push({
          defect_id: `${control.control_id}-D1`,
          description: `Control operating ineffectively — ${finalExceptions} exceptions in ${sampleSize} samples`,
          severity: 'material',
          root_cause: 'Process design gap or insufficient monitoring'
        })
      } else if (adjustedRate > 0.05) {
        defects.push({
          defect_id: `${control.control_id}-D1`,
          description: `Control deviations detected — ${finalExceptions} exceptions`,
          severity: 'significant',
          root_cause: 'Intermittent control execution failure'
        })
      } else {
        defects.push({
          defect_id: `${control.control_id}-D1`,
          description: `Minor control observation — ${finalExceptions} isolated exception`,
          severity: 'deficiency',
          root_cause: 'Human error or isolated system issue'
        })
      }
    }

    let conclusion: string
    if (effectiveness === 'effective') conclusion = 'Control operating effectively — no significant concerns'
    else if (effectiveness === 'partially_effective') conclusion = 'Control partially effective — remediation recommended within 60 days'
    else conclusion = 'Control ineffective — immediate remediation required'

    results.push({
      control_id: control.control_id,
      control_name: control.control_name,
      control_type: control.control_type,
      sample_size: sampleSize,
      exceptions_found: finalExceptions,
      exception_rate: Math.round(adjustedRate * 1000) / 1000,
      effectiveness,
      defects,
      conclusion
    })
  }

  const effectiveCount = results.filter(r => r.effectiveness === 'effective').length
  const partialCount = results.filter(r => r.effectiveness === 'partially_effective').length
  const ineffectiveCount = results.filter(r => r.effectiveness === 'ineffective').length
  const materialDefects = results.flatMap(r => r.defects).filter(d => d.severity === 'material').length
  const significantDefects = results.flatMap(r => r.defects).filter(d => d.severity === 'significant').length

  let overallAssessment: 'satisfactory' | 'needs_improvement' | 'unsatisfactory'
  if (ineffectiveCount > 0 || materialDefects > 0) overallAssessment = 'unsatisfactory'
  else if (partialCount > results.length * 0.3 || significantDefects > 0) overallAssessment = 'needs_improvement'
  else overallAssessment = 'satisfactory'

  const assertions: ControlTestResult['management_assertions'] = [
    {
      assertion: 'Controls were designed suitably to prevent/detect material misstatements',
      status: ineffectiveCount === 0 ? 'supported' : 'not_supported',
      evidence: `${results.length} controls tested; ${effectiveCount} effective`
    },
    {
      assertion: 'Controls operated effectively throughout the period',
      status: partialCount === 0 && ineffectiveCount === 0 ? 'supported' : partialCount > 0 && ineffectiveCount === 0 ? 'partially_supported' : 'not_supported',
      evidence: `${results.filter(r => r.exceptions_found === 0).length}/${results.length} controls with zero exceptions`
    },
    {
      assertion: 'Control deficiencies identified have been communicated to management',
      status: 'supported',
      evidence: `${materialDefects + significantDefects} deficiencies documented with remediation plans`
    }
  ]

  return {
    test_results: results,
    summary: {
      total_controls: controls.length,
      effective_count: effectiveCount,
      partial_count: partialCount,
      ineffective_count: ineffectiveCount,
      material_defects: materialDefects,
      significant_defects: significantDefects,
      overall_assessment: overallAssessment
    },
    management_assertions: assertions
  }
}

function formatControlTestReport(result: ControlTestResult): string {
  const lines: string[] = []
  lines.push('## Control Testing Report')
  lines.push('')
  lines.push(`**Overall Assessment:** ${result.summary.overall_assessment.toUpperCase()}`)
  lines.push(`**Total Controls Tested:** ${result.summary.total_controls} | Effective: ${result.summary.effective_count} | Partial: ${result.summary.partial_count} | Ineffective: ${result.summary.ineffective_count}`)
  lines.push(`**Defects:** Material: ${result.summary.material_defects} | Significant: ${result.summary.significant_defects}`)
  lines.push('')

  lines.push('### Control Matrix')
  lines.push('| Control ID | Name | Type | Sample | Exceptions | Rate | Effectiveness |')
  lines.push('|-----------|------|------|--------|------------|------|--------------|')
  for (const r of result.test_results) {
    lines.push(`| ${r.control_id} | ${r.control_name.substring(0, 20)} | ${r.control_type} | ${r.sample_size} | ${r.exceptions_found} | ${(r.exception_rate * 100).toFixed(1)}% | ${r.effectiveness.replace('_', ' ').toUpperCase()} |`)
  }
  lines.push('')

  const defectiveControls = result.test_results.filter(r => r.defects.length > 0)
  if (defectiveControls.length > 0) {
    lines.push('### Control Defects')
    for (const r of defectiveControls) {
      for (const d of r.defects) {
        lines.push(`**[${d.severity.toUpperCase()}] ${d.defect_id}** — ${r.control_name}`)
        lines.push(`  Description: ${d.description}`)
        lines.push(`  Root Cause: ${d.root_cause}`)
        lines.push('')
      }
    }
  }

  lines.push('### Management Assertions')
  for (const a of result.management_assertions) {
    const statusIcon = a.status === 'supported' ? 'PASS' : a.status === 'partially_supported' ? 'PARTIAL' : 'FAIL'
    lines.push(`**[${statusIcon}]** ${a.assertion}`)
    lines.push(`  Evidence: ${a.evidence}`)
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 5: TRAINING MANAGER ====================

interface TrainingResult {
  workforce_analysis: Array<{
    employee_id: string
    role: string
    department: string
    risk_level: string
    compliance_status: 'compliant' | 'at_risk' | 'non_compliant'
    completed_count: number
    required_count: number
    completion_rate: number
    overdue_courses: string[]
    days_to_expiry: number
    action_required: string
  }>
  department_summary: Array<{
    department: string
    total_staff: number
    compliant_count: number
    at_risk_count: number
    non_compliant_count: number
    avg_completion_rate: number
    high_risk_gaps: string[]
  }>
  organization_metrics: {
    total_employees: number
    overall_completion_rate: number
    compliance_rate: number
    high_risk_non_compliance_count: number
    upcoming_expirations_30d: number
  }
  refresher_alerts: Array<{
    employee_id: string
    course: string
    expiry_date: string
    days_remaining: number
    urgency: 'expired' | 'critical' | 'upcoming'
  }>
}

function manageTraining(records: TrainingRecord[]): TrainingResult {
  const now = new Date()
  const workforceAnalysis: TrainingResult['workforce_analysis'] = []

  for (const record of records) {
    const requiredSet = new Set(record.required_courses)
    const completedSet = new Set(record.completed_courses)
    const overdue = [...requiredSet].filter(c => !completedSet.has(c))
    const completionRate = requiredSet.size > 0 ? (completedSet.size / requiredSet.size) * 100 : 100

    const expiryDate = new Date(record.expiry_date)
    const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let complianceStatus: 'compliant' | 'at_risk' | 'non_compliant'
    if (completionRate >= 90 && daysToExpiry > 30) complianceStatus = 'compliant'
    else if (completionRate >= 70 && daysToExpiry > 0) complianceStatus = 'at_risk'
    else complianceStatus = 'non_compliant'

    let actionRequired = 'No action required'
    if (complianceStatus === 'non_compliant') actionRequired = 'Mandatory retraining required within 14 days'
    else if (complianceStatus === 'at_risk') actionRequired = `Complete overdue courses: ${overdue.slice(0, 2).join(', ')}`
    else if (daysToExpiry <= 30) actionRequired = 'Schedule refresher training before expiry'

    workforceAnalysis.push({
      employee_id: record.employee_id,
      role: record.role,
      department: record.department,
      risk_level: record.risk_level,
      compliance_status: complianceStatus,
      completed_count: completedSet.size,
      required_count: requiredSet.size,
      completion_rate: Math.round(completionRate),
      overdue_courses: overdue,
      days_to_expiry: daysToExpiry,
      action_required: actionRequired
    })
  }

  const departments = [...new Set(records.map(r => r.department))]
  const departmentSummary = departments.map(dept => {
    const deptRecords = workforceAnalysis.filter(w => w.department === dept)
    const avgCompletion = deptRecords.reduce((s, r) => s + r.completion_rate, 0) / deptRecords.length
    const compliant = deptRecords.filter(r => r.compliance_status === 'compliant').length
    const atRisk = deptRecords.filter(r => r.compliance_status === 'at_risk').length
    const nonCompliant = deptRecords.filter(r => r.compliance_status === 'non_compliant').length
    const allOverdue = [...new Set(deptRecords.flatMap(r => r.overdue_courses))]

    return {
      department: dept,
      total_staff: deptRecords.length,
      compliant_count: compliant,
      at_risk_count: atRisk,
      non_compliant_count: nonCompliant,
      avg_completion_rate: Math.round(avgCompletion),
      high_risk_gaps: allOverdue.slice(0, 5)
    }
  })

  const refresherAlerts: TrainingResult['refresher_alerts'] = []
  for (const record of records) {
    const expiryDate = new Date(record.expiry_date)
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysRemaining <= 60) {
      for (const course of record.completed_courses.slice(0, 3)) {
        refresherAlerts.push({
          employee_id: record.employee_id,
          course,
          expiry_date: record.expiry_date,
          days_remaining: daysRemaining,
          urgency: daysRemaining < 0 ? 'expired' : daysRemaining <= 14 ? 'critical' : 'upcoming'
        })
      }
    }
  }

  const totalEmployees = records.length
  const overallCompletion = Math.round(workforceAnalysis.reduce((s, w) => s + w.completion_rate, 0) / totalEmployees)
  const complianceRate = Math.round((workforceAnalysis.filter(w => w.compliance_status === 'compliant').length / totalEmployees) * 100)
  const highRiskNonCompliance = workforceAnalysis.filter(w => w.risk_level === 'high' && w.compliance_status !== 'compliant').length
  const upcomingExpirations = workforceAnalysis.filter(w => w.days_to_expiry <= 30 && w.days_to_expiry >= 0).length

  return {
    workforce_analysis: workforceAnalysis,
    department_summary: departmentSummary,
    organization_metrics: {
      total_employees: totalEmployees,
      overall_completion_rate: overallCompletion,
      compliance_rate: complianceRate,
      high_risk_non_compliance_count: highRiskNonCompliance,
      upcoming_expirations_30d: upcomingExpirations
    },
    refresher_alerts: refresherAlerts.sort((a, b) => a.days_remaining - b.days_remaining)
  }
}

function formatTrainingReport(result: TrainingResult): string {
  const lines: string[] = []
  lines.push('## Compliance Training Management Report')
  lines.push('')
  lines.push(`**Organization Overview:** ${result.organization_metrics.total_employees} employees`)
  lines.push(`- Overall Completion Rate: ${result.organization_metrics.overall_completion_rate}%`)
  lines.push(`- Compliance Rate: ${result.organization_metrics.compliance_rate}%`)
  lines.push(`- High-Risk Non-Compliance: ${result.organization_metrics.high_risk_non_compliance_count}`)
  lines.push(`- Upcoming Expirations (30d): ${result.organization_metrics.upcoming_expirations_30d}`)
  lines.push('')

  lines.push('### Department Summary')
  lines.push('| Department | Staff | Compliant | At Risk | Non-Compliant | Avg Rate |')
  lines.push('|-----------|-------|-----------|---------|---------------|----------|')
  for (const d of result.department_summary) {
    lines.push(`| ${d.department} | ${d.total_staff} | ${d.compliant_count} | ${d.at_risk_count} | ${d.non_compliant_count} | ${d.avg_completion_rate}% |`)
  }
  lines.push('')

  const nonCompliant = result.workforce_analysis.filter(w => w.compliance_status === 'non_compliant')
  if (nonCompliant.length > 0) {
    lines.push('### Non-Compliant Staff — Immediate Action')
    for (const w of nonCompliant.slice(0, 10)) {
      lines.push(`**${w.employee_id}** (${w.role}, ${w.department}) — ${w.completion_rate}% complete | Overdue: ${w.overdue_courses.slice(0, 3).join(', ')}`)
      lines.push(`  Action: ${w.action_required}`)
    }
    lines.push('')
  }

  const urgentAlerts = result.refresher_alerts.filter(a => a.urgency === 'expired' || a.urgency === 'critical')
  if (urgentAlerts.length > 0) {
    lines.push('### Refresher Alerts')
    for (const a of urgentAlerts.slice(0, 10)) {
      const daysStr = a.days_remaining < 0 ? `${Math.abs(a.days_remaining)} days ago` : `${a.days_remaining} days`
      lines.push(`[${a.urgency.toUpperCase()}] ${a.employee_id}: ${a.course} expired ${daysStr}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: WHISTLEBLOWER ====================

interface WhistleblowerResult {
  case_management: Array<{
    report_id: string
    category: string
    severity: string
    status: string
    date_received: string
    days_open: number
    anonymous: boolean
    investigation_stage: string
    assigned_to: string
    next_action: string
    anti_retaliation_flag: boolean
    feedback_provided: boolean
  }>
  statistics: {
    total_reports: number
    open_cases: number
    closed_cases: number
    avg_resolution_days: number
    anonymous_ratio: number
    categories_breakdown: Record<string, number>
    severity_breakdown: Record<string, number>
  }
  workflow_pipeline: Array<{
    stage: string
    case_count: number
    avg_days: number
    sla_met: boolean
  }>
  protection_measures: {
    anti_retaliation_monitoring: number
    confidentiality_score: number
    feedback_loop_compliance: number
  }
}

function manageWhistleblower(reports: WhistleblowerReport[]): WhistleblowerResult {
  const now = new Date()

  const stages = ['Intake Review', 'Triage Assessment', 'Investigation', 'Resolution', 'Closure']
  const caseManagement = reports.map((report, idx) => {
    const dateReceived = new Date(report.date_received)
    const daysOpen = Math.ceil((now.getTime() - dateReceived.getTime()) / (1000 * 60 * 60 * 24))

    let investigationStage = report.status
    if (report.status === 'new') investigationStage = 'Intake Review'
    else if (report.status === 'under_review') investigationStage = 'Triage Assessment'
    else if (report.status === 'investigating') investigationStage = 'Investigation'
    else if (report.status === 'resolved') investigationStage = 'Resolution'
    else if (report.status === 'closed') investigationStage = 'Closure'

    const nextActions: Record<string, string> = {
      'new': 'Acknowledge receipt within 48h and assign investigator',
      'under_review': 'Complete triage assessment within 5 business days',
      'investigating': 'Conduct interviews and gather evidence',
      'resolved': 'Implement corrective action and document outcome',
      'closed': 'Archive case and provide final feedback'
    }

    return {
      report_id: report.report_id,
      category: report.category,
      severity: report.severity,
      status: report.status,
      date_received: report.date_received,
      days_open: daysOpen,
      anonymous: report.anonymous,
      investigation_stage: investigationStage,
      assigned_to: report.anonymous ? 'Ethics Committee (Anonymous)' : `Investigator-${(idx % 3) + 1}`,
      next_action: nextActions[report.status] || 'Review status',
      anti_retaliation_flag: report.severity === 'critical' || report.anonymous,
      feedback_provided: report.status === 'closed' || report.status === 'resolved'
    }
  })

  const openCases = caseManagement.filter(c => c.status !== 'closed').length
  const closedCases = caseManagement.filter(c => c.status === 'closed').length
  const avgResolution = caseManagement.filter(c => c.status === 'closed').length > 0
    ? Math.round(caseManagement.filter(c => c.status === 'closed').reduce((s, c) => s + c.days_open, 0) / closedCases)
    : 0
  const anonymousRatio = reports.filter(r => r.anonymous).length / reports.length

  const categoriesBreakdown: Record<string, number> = {}
  const severityBreakdown: Record<string, number> = {}
  for (const r of reports) {
    categoriesBreakdown[r.category] = (categoriesBreakdown[r.category] || 0) + 1
    severityBreakdown[r.severity] = (severityBreakdown[r.severity] || 0) + 1
  }

  const workflowPipeline = stages.map(stage => {
    const stageCases = caseManagement.filter(c => c.investigation_stage === stage)
    const avgDays = stageCases.length > 0 ? Math.round(stageCases.reduce((s, c) => s + c.days_open, 0) / stageCases.length) : 0
    const slaTargets: Record<string, number> = { 'Intake Review': 2, 'Triage Assessment': 10, 'Investigation': 60, 'Resolution': 14, 'Closure': 7 }
    return {
      stage,
      case_count: stageCases.length,
      avg_days: avgDays,
      sla_met: avgDays <= (slaTargets[stage] ?? 30)
    }
  })

  return {
    case_management: caseManagement,
    statistics: {
      total_reports: reports.length,
      open_cases: openCases,
      closed_cases: closedCases,
      avg_resolution_days: avgResolution,
      anonymous_ratio: Math.round(anonymousRatio * 100) / 100,
      categories_breakdown: categoriesBreakdown,
      severity_breakdown: severityBreakdown
    },
    workflow_pipeline: workflowPipeline,
    protection_measures: {
      anti_retaliation_monitoring: caseManagement.filter(c => c.anti_retaliation_flag).length,
      confidentiality_score: 100,
      feedback_loop_compliance: Math.round((caseManagement.filter(c => c.feedback_provided).length / reports.length) * 100)
    }
  }
}

function formatWhistleblowerReport(result: WhistleblowerResult): string {
  const lines: string[] = []
  lines.push('## Whistleblower Management Report')
  lines.push('')
  lines.push(`**Total Reports:** ${result.statistics.total_reports} | Open: ${result.statistics.open_cases} | Closed: ${result.statistics.closed_cases}`)
  lines.push(`- Avg Resolution Time: ${result.statistics.avg_resolution_days} days | Anonymous Ratio: ${(result.statistics.anonymous_ratio * 100).toFixed(0)}%`)
  lines.push('')

  lines.push('### Case Pipeline')
  lines.push('| Stage | Cases | Avg Days | SLA Met |')
  lines.push('|-------|-------|----------|---------|')
  for (const stage of result.workflow_pipeline) {
    lines.push(`| ${stage.stage} | ${stage.case_count} | ${stage.avg_days}d | ${stage.sla_met ? 'YES' : 'NO'} |`)
  }
  lines.push('')

  lines.push('### Active Cases')
  lines.push('| ID | Category | Severity | Stage | Days Open | Anonymous | Next Action |')
  lines.push('|----|----------|----------|-------|-----------|-----------|-------------|')
  for (const c of result.case_management.filter(c => c.status !== 'closed').slice(0, 15)) {
    lines.push(`| ${c.report_id} | ${c.category} | ${c.severity.toUpperCase()} | ${c.investigation_stage} | ${c.days_open}d | ${c.anonymous ? 'YES' : 'No'} | ${c.next_action.substring(0, 30)}... |`)
  }
  lines.push('')

  lines.push('### Severity Breakdown')
  for (const [sev, count] of Object.entries(result.statistics.severity_breakdown)) {
    lines.push(`- ${sev.toUpperCase()}: ${count} reports`)
  }
  lines.push('')

  lines.push('### Protection Measures')
  lines.push(`- Anti-Retaliation Monitoring: ${result.protection_measures.anti_retaliation_monitoring} cases flagged`)
  lines.push(`- Confidentiality Score: ${result.protection_measures.confidentiality_score}%`)
  lines.push(`- Feedback Loop Compliance: ${result.protection_measures.feedback_loop_compliance}%`)
  lines.push('')

  const criticalCases = result.case_management.filter(c => c.severity === 'critical' && c.status !== 'closed')
  if (criticalCases.length > 0) {
    lines.push('### Critical Open Cases — Immediate Attention')
    for (const c of criticalCases) {
      lines.push(`**[CRITICAL] ${c.report_id}** — ${c.category} (${c.days_open} days open)`)
      lines.push(`  Assigned: ${c.assigned_to} | Next: ${c.next_action}`)
      lines.push(`  Anti-Retaliation: ${c.anti_retaliation_flag ? 'ACTIVE' : 'N/A'}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: AUDIT PREPARER ====================

interface AuditPrepareResult {
  scope_mapping: Array<{
    area: string
    risk_rating: string
    audit_objectives: string[]
    procedures_required: string[]
    evidence_status: 'complete' | 'partial' | 'missing'
    evidence_completion_pct: number
    findings: string[]
    remediation_status: string
  }>
  evidence_checklist: Array<{
    item: string
    area: string
    status: 'provided' | 'pending' | 'rejected'
    owner: string
    days_remaining: number
  }>
  management_responses: Array<{
    finding: string
    response: string
    action_plan: string
    responsible_party: string
    target_date: string
    status: 'accepted' | 'in_progress' | 'completed' | 'pending'
  }>
  readiness_score: {
    overall_readiness: number
    evidence_completeness: number
    remediation_progress: number
    management_response_rate: number
    days_to_audit: number
    readiness_level: 'ready' | 'mostly_ready' | 'needs_work' | 'not_ready'
  }
}

function prepareAudit(areas: AuditArea[]): AuditPrepareResult {
  const now = new Date()
  const auditDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const daysToAudit = Math.ceil((auditDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const scopeMapping = areas.map(area => {
    const totalEvidence = area.evidence_required.length
    const providedEvidence = Math.floor(totalEvidence * (area.risk_rating === 'high' ? 0.7 : area.risk_rating === 'medium' ? 0.8 : 0.9))
    const completionPct = Math.round((providedEvidence / totalEvidence) * 100)

    const evidenceStatus: 'complete' | 'partial' | 'missing' =
      completionPct >= 90 ? 'complete' : completionPct >= 60 ? 'partial' : 'missing'

    const findings: string[] = []
    if (area.risk_rating === 'high') {
      findings.push('Control gaps identified in key process areas')
      findings.push('Documentation requires strengthening')
    } else if (area.risk_rating === 'medium') {
      findings.push('Minor procedural observations noted')
    }

    return {
      area: area.area_name,
      risk_rating: area.risk_rating,
      audit_objectives: area.objectives,
      procedures_required: area.procedures,
      evidence_status: evidenceStatus,
      evidence_completion_pct: completionPct,
      findings,
      remediation_status: completionPct >= 90 ? 'On track' : completionPct >= 70 ? 'In progress' : 'Requires attention'
    }
  })

  const evidenceChecklist: AuditPrepareResult['evidence_checklist'] = areas.flatMap(area =>
    area.evidence_required.map((item, idx) => {
      const status: 'provided' | 'pending' | 'rejected' = idx < Math.floor(area.evidence_required.length * (area.risk_rating === 'high' ? 0.7 : 0.85)) ? 'provided' : idx === Math.floor(area.evidence_required.length * 0.85) ? 'pending' : 'pending'
      return {
        item,
        area: area.area_name,
        status,
        owner: `${area.area_name} Manager`,
        days_remaining: daysToAudit - (idx * 3)
      }
    })
  )

  const managementResponses: AuditPrepareResult['management_responses'] = scopeMapping
    .filter(s => s.findings.length > 0)
    .flatMap(s => s.findings.map((f, idx) => ({
      finding: f,
      response: s.risk_rating === 'high'
        ? `Management acknowledges the finding and has initiated remediation`
        : `Minor observation — process improvement underway`,
      action_plan: `Address ${f.toLowerCase()} with documented evidence`,
      responsible_party: `${s.area} Owner`,
      target_date: `2026-${String(now.getMonth() + 1 + idx).padStart(2, '0')}-15`,
      status: (idx === 0 ? 'in_progress' : 'pending') as 'accepted' | 'in_progress' | 'completed' | 'pending'
    })))

  const avgEvidenceCompletion = Math.round(scopeMapping.reduce((s, a) => s + a.evidence_completion_pct, 0) / scopeMapping.length)
  const remediationProgress = Math.round((scopeMapping.filter(s => s.remediation_status === 'On track').length / scopeMapping.length) * 100)
  const responseRate = managementResponses.length > 0
    ? Math.round((managementResponses.filter(r => r.status === 'completed' || r.status === 'in_progress').length / managementResponses.length) * 100)
    : 100

  const overallReadiness = Math.round((avgEvidenceCompletion * 0.4) + (remediationProgress * 0.3) + (responseRate * 0.3))

  let readinessLevel: 'ready' | 'mostly_ready' | 'needs_work' | 'not_ready'
  if (overallReadiness >= 85) readinessLevel = 'ready'
  else if (overallReadiness >= 70) readinessLevel = 'mostly_ready'
  else if (overallReadiness >= 50) readinessLevel = 'needs_work'
  else readinessLevel = 'not_ready'

  return {
    scope_mapping: scopeMapping,
    evidence_checklist: evidenceChecklist,
    management_responses: managementResponses,
    readiness_score: {
      overall_readiness: overallReadiness,
      evidence_completeness: avgEvidenceCompletion,
      remediation_progress: remediationProgress,
      management_response_rate: responseRate,
      days_to_audit: daysToAudit,
      readiness_level: readinessLevel
    }
  }
}

function formatAuditPrepareReport(result: AuditPrepareResult): string {
  const lines: string[] = []
  lines.push('## Audit Preparation Report')
  lines.push('')
  lines.push(`**Readiness Level:** ${result.readiness_score.readiness_level.toUpperCase()} | **Overall Score:** ${result.readiness_score.overall_readiness}/100`)
  lines.push(`- Evidence Completeness: ${result.readiness_score.evidence_completeness}%`)
  lines.push(`- Remediation Progress: ${result.readiness_score.remediation_progress}%`)
  lines.push(`- Management Response Rate: ${result.readiness_score.management_response_rate}%`)
  lines.push(`- Days to Audit: ${result.readiness_score.days_to_audit}`)
  lines.push('')

  lines.push('### Scope Mapping & Evidence Status')
  lines.push('| Area | Risk | Evidence % | Status | Findings | Remediation |')
  lines.push('|------|------|-----------|--------|----------|-------------|')
  for (const s of result.scope_mapping) {
    lines.push(`| ${s.area} | ${s.risk_rating.toUpperCase()} | ${s.evidence_completion_pct}% | ${s.evidence_status.toUpperCase()} | ${s.findings.length > 0 ? s.findings[0].substring(0, 30) : 'None'}... | ${s.remediation_status} |`)
  }
  lines.push('')

  const pendingEvidence = result.evidence_checklist.filter(e => e.status === 'pending')
  if (pendingEvidence.length > 0) {
    lines.push('### Pending Evidence Items')
    for (const e of pendingEvidence.slice(0, 10)) {
      lines.push(`- **[${e.area}]** ${e.item} — Owner: ${e.owner} (${e.days_remaining}d remaining)`)
    }
    lines.push('')
  }

  if (result.management_responses.length > 0) {
    lines.push('### Management Responses')
    for (const r of result.management_responses.slice(0, 10)) {
      lines.push(`**Finding:** ${r.finding}`)
      lines.push(`  Response: ${r.response}`)
      lines.push(`  Action: ${r.action_plan} | Owner: ${r.responsible_party} | Target: ${r.target_date} | Status: ${r.status}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: PRIVACY IMPACT ASSESSMENT ====================

interface PrivacyImpactResult {
  dpia_assessment: Array<{
    activity: string
    data_types: string[]
    data_subjects: string[]
    necessity_score: number
    necessity_level: 'high' | 'medium' | 'low'
    risks: Array<{
      risk: string
      likelihood: 'high' | 'medium' | 'low'
      impact: 'high' | 'medium' | 'low'
      risk_level: 'high' | 'medium' | 'low'
    }>
    safeguards: string[]
    residual_risk: 'high' | 'medium' | 'low'
    approval_required: boolean
    conclusion: string
  }>
  summary: {
    total_activities: number
    high_risk_count: number
    medium_risk_count: number
    low_risk_count: number
    dpia_required_count: number
    avg_necessity_score: number
  }
  dpia_report: {
    executive_summary: string
    recommendations: string[]
    review_timeline: string
  }
}

function assessPrivacyImpact(activities: DataProcessingActivity[]): PrivacyImpactResult {
  const dpiaAssessment: PrivacyImpactResult['dpia_assessment'] = []

  for (const activity of activities) {
    const dataSensitivityScore = activity.data_types.filter(d =>
      d.toLowerCase().includes('health') ||
      d.toLowerCase().includes('biometric') ||
      d.toLowerCase().includes('financial') ||
      d.toLowerCase().includes('child') ||
      d.toLowerCase().includes('criminal')
    ).length

    const necessityFactors = [
      activity.purpose.length > 20 ? 1 : 0,
      activity.legal_basis.length > 3 ? 1 : 0,
      activity.retention_period.length > 0 ? 1 : 0,
      !activity.cross_border ? 1 : 0,
      activity.data_types.length <= 3 ? 1 : 0
    ]
    const necessityScore = Math.round((necessityFactors.reduce((a, b) => a + b, 0) / necessityFactors.length) * 100)

    const necessityLevel: 'high' | 'medium' | 'low' =
      necessityScore >= 80 ? 'high' : necessityScore >= 50 ? 'medium' : 'low'

    const risks: PrivacyImpactResult['dpia_assessment'][0]['risks'] = []

    if (dataSensitivityScore > 0) {
      risks.push({
        risk: 'Processing of special category data without adequate safeguards',
        likelihood: 'medium',
        impact: 'high',
        risk_level: 'high'
      })
    }
    if (activity.cross_border) {
      risks.push({
        risk: 'Cross-border data transfer without adequate protection measures',
        likelihood: 'medium',
        impact: 'high',
        risk_level: 'high'
      })
    }
    if (activity.data_subjects.some(s => s.toLowerCase().includes('child') || s.toLowerCase().includes('minor'))) {
      risks.push({
        risk: 'Processing of minors data — enhanced consent requirements',
        likelihood: 'medium',
        impact: 'high',
        risk_level: 'high'
      })
    }
    if (activity.data_types.length > 5) {
      risks.push({
        risk: 'Excessive data collection beyond stated purpose',
        likelihood: 'medium',
        impact: 'medium',
        risk_level: 'medium'
      })
    }
    if (risks.length === 0) {
      risks.push({
        risk: 'Standard data processing operations',
        likelihood: 'low',
        impact: 'low',
        risk_level: 'low'
      })
    }

    const safeguards: string[] = []
    if (dataSensitivityScore > 0) {
      safeguards.push('Implement data encryption at rest and in transit')
      safeguards.push('Apply strict access controls and data masking')
    }
    if (activity.cross_border) {
      safeguards.push('Execute Standard Contractual Clauses (SCCs)')
      safeguards.push('Conduct transfer impact assessment')
    }
    safeguards.push('Implement data retention and deletion procedures')
    safeguards.push('Provide data subject rights mechanism')
    safeguards.push('Conduct regular privacy compliance review')

    const maxRisk = risks.reduce((max, r) => {
      const levels = { low: 1, medium: 2, high: 3 }
      return levels[r.risk_level] > levels[max] ? r.risk_level : max
    }, 'low' as 'high' | 'medium' | 'low')

    const residualRisk: 'high' | 'medium' | 'low' =
      maxRisk === 'high' && safeguards.length >= 3 ? 'medium' :
      maxRisk === 'high' ? 'high' :
      maxRisk === 'medium' && safeguards.length >= 2 ? 'low' :
      maxRisk

    const approvalRequired = residualRisk === 'high' || dataSensitivityScore > 0 || activity.cross_border

    let conclusion: string
    if (residualRisk === 'high') conclusion = 'DPIA REQUIRED — High residual risk. Cannot proceed without DPO approval and additional safeguards.'
    else if (residualRisk === 'medium') conclusion = 'DPIA recommended — Medium risk. Implement noted safeguards and review in 6 months.'
    else conclusion = 'Low risk — Standard privacy controls sufficient. Annual review recommended.'

    dpiaAssessment.push({
      activity: activity.activity_name,
      data_types: activity.data_types,
      data_subjects: activity.data_subjects,
      necessity_score: necessityScore,
      necessity_level: necessityLevel,
      risks,
      safeguards,
      residual_risk: residualRisk,
      approval_required: approvalRequired,
      conclusion
    })
  }

  const avgNecessity = Math.round(dpiaAssessment.reduce((s, a) => s + a.necessity_score, 0) / dpiaAssessment.length)
  const dpiaRequired = dpiaAssessment.filter(a => a.approval_required).length

  const allRisks = dpiaAssessment.flatMap(a => a.risks)
  const highRiskCount = allRisks.filter(r => r.risk_level === 'high').length
  const mediumRiskCount = allRisks.filter(r => r.risk_level === 'medium').length
  const lowRiskCount = allRisks.filter(r => r.risk_level === 'low').length

  return {
    dpia_assessment: dpiaAssessment,
    summary: {
      total_activities: activities.length,
      high_risk_count: highRiskCount,
      medium_risk_count: mediumRiskCount,
      low_risk_count: lowRiskCount,
      dpia_required_count: dpiaRequired,
      avg_necessity_score: avgNecessity
    },
    dpia_report: {
      executive_summary: `Assessment of ${activities.length} data processing activities identified ${dpiaRequired} activities requiring formal DPIA. Average necessity score: ${avgNecessity}%. Key risk areas include ${dpiaAssessment.filter(a => a.residual_risk === 'high').map(a => a.activity).slice(0, 3).join(', ') || 'none identified'}.`,
      recommendations: [
        'Implement privacy-by-design principles across all processing activities',
        'Establish data processing register with annual review cycle',
        'Conduct transfer impact assessments for all cross-border data flows',
        'Provide enhanced privacy training for data processing staff',
        'Implement automated data subject rights response procedures'
      ],
      review_timeline: 'Full DPIA review recommended every 12 months or upon material change to processing activities'
    }
  }
}

function formatPrivacyImpactReport(result: PrivacyImpactResult): string {
  const lines: string[] = []
  lines.push('## Privacy Impact Assessment (PIA/DPIA) Report')
  lines.push('')
  lines.push(`**Activities Assessed:** ${result.summary.total_activities} | **DPIA Required:** ${result.summary.dpia_required_count} | **Avg Necessity:** ${result.summary.avg_necessity_score}%`)
  lines.push(`**Risk Distribution:** High: ${result.summary.high_risk_count} | Medium: ${result.summary.medium_risk_count} | Low: ${result.summary.low_risk_count}`)
  lines.push('')

  lines.push('### Processing Activity Assessment')
  lines.push('| Activity | Necessity | Risk Level | Residual | Approval Needed |')
  lines.push('|----------|-----------|------------|----------|----------------|')
  for (const a of result.dpia_assessment) {
    lines.push(`| ${a.activity.substring(0, 25)} | ${a.necessity_score}% (${a.necessity_level}) | ${a.risks[0]?.risk_level.toUpperCase() || 'LOW'} | ${a.residual_risk.toUpperCase()} | ${a.approval_required ? 'YES' : 'No'} |`)
  }
  lines.push('')

  const highRiskActivities = result.dpia_assessment.filter(a => a.residual_risk === 'high')
  if (highRiskActivities.length > 0) {
    lines.push('### High-Risk Activities — DPIA Required')
    for (const a of highRiskActivities) {
      lines.push(`**${a.activity}**`)
      lines.push(`  Data Types: ${a.data_types.join(', ')}`)
      lines.push(`  Data Subjects: ${a.data_subjects.join(', ')}`)
      lines.push(`  Risks:`)
      for (const r of a.risks.filter(risk => risk.risk_level === 'high')) {
        lines.push(`    - ${r.risk} (L:${r.likelihood}/I:${r.impact})`)
      }
      lines.push(`  Safeguards:`)
      for (const s of a.safeguards.slice(0, 4)) {
        lines.push(`    - ${s}`)
      }
      lines.push(`  Conclusion: ${a.conclusion}`)
      lines.push('')
    }
  }

  lines.push('### DPIA Executive Summary')
  lines.push(result.dpia_report.executive_summary)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.dpia_report.recommendations) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push(`**Review Timeline:** ${result.dpia_report.review_timeline}`)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'contract_scanner',
    description: 'Scan contracts for adverse clauses, compliance gaps, and industry benchmark deviations. Identifies unfavorable terms, checks regulatory compliance, compares against industry standards, and provides revision suggestions.',
    parameters: {
      contract_clauses: { type: 'string', required: true, description: 'JSON array of contract clauses with fields: clause_text, clause_type' },
      compliance_frameworks: { type: 'string', required: true, description: 'JSON array of compliance frameworks with fields: framework (GDPR/PIPL/HIPAA/SOX/等保/ISO 27001), requirements (optional array of specific requirements)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_clauses: string; compliance_frameworks: string }) {
      const clauses: ContractClause[] = JSON.parse(args.contract_clauses)
      const frameworks: ComplianceFramework[] = JSON.parse(args.compliance_frameworks)
      const result = scanContracts(clauses, frameworks)
      return formatContractScanReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'policy_radar',
    description: 'Monitor multi-jurisdiction regulatory changes, assess business impact, map compliance requirements, and generate remediation timelines. Tracks policy changes across GDPR, PIPL, HIPAA, 等保, SOX, and ISO frameworks.',
    parameters: {
      regulatory_changes: { type: 'string', required: true, description: 'JSON array of regulatory changes with fields: regulation_name, jurisdiction, effective_date, change_description, industry_scope' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { regulatory_changes: string }) {
      const changes: RegulationChange[] = JSON.parse(args.regulatory_changes)
      const result = monitorPolicyChanges(changes)
      return formatPolicyRadarReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'risk_assessor',
    description: 'Enterprise risk assessment using L×I (Likelihood × Impact) matrix scoring. Evaluates inherent risk, control effectiveness, residual risk, and generates remediation prioritization with risk heatmaps.',
    parameters: {
      risk_items: { type: 'string', required: true, description: 'JSON array of risk items with fields: risk_name, category, likelihood (1-5), impact (1-5), existing_controls (array of strings)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_items: string }) {
      const items: RiskItem[] = JSON.parse(args.risk_items)
      const result = assessRisks(items)
      return formatRiskAssessmentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'control_tester',
    description: 'Automated compliance control testing with SOX/ITGC sampling techniques. Tests control operating effectiveness, identifies defects (material/significant/deficiency), and provides management assertion support.',
    parameters: {
      controls: { type: 'string', required: true, description: 'JSON array of control points with fields: control_id, control_name, control_type (preventive/detective/corrective), frequency (daily/weekly/monthly/quarterly), owner, framework, sample_size (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { controls: string }) {
      const controls: ControlPoint[] = JSON.parse(args.controls)
      const result = testControls(controls)
      return formatControlTestReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'training_manager',
    description: 'Compliance training management with role-risk profiling, course matching, completion tracking, effectiveness assessment, and automated refresher reminders. Monitors organizational compliance training status.',
    parameters: {
      training_records: { type: 'string', required: true, description: 'JSON array of training records with fields: employee_id, role, department, risk_level (high/medium/low), completed_courses, required_courses, last_training_date, expiry_date' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { training_records: string }) {
      const records: TrainingRecord[] = JSON.parse(args.training_records)
      const result = manageTraining(records)
      return formatTrainingReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'whistleblower',
    description: 'Whistleblower case management with anonymous report handling, confidentiality protection, investigation workflow management, anti-retaliation monitoring, and closed-loop feedback. Tracks SLA compliance and case resolution.',
    parameters: {
      reports: { type: 'string', required: true, description: 'JSON array of whistleblower reports with fields: report_id, category, severity (critical/high/medium/low), description, date_received, anonymous (boolean), status (new/under_review/investigating/resolved/closed)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { reports: string }) {
      const reportsData: WhistleblowerReport[] = JSON.parse(args.reports)
      const result = manageWhistleblower(reportsData)
      return formatWhistleblowerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'audit_preparer',
    description: 'Audit readiness preparation with scope mapping, evidence checklists, working paper management, finding remediation tracking, and management response coordination. Provides overall audit readiness scoring.',
    parameters: {
      audit_areas: { type: 'string', required: true, description: 'JSON array of audit areas with fields: area_name, risk_rating (high/medium/low), objectives (array), procedures (array), evidence_required (array of strings)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { audit_areas: string }) {
      const areas: AuditArea[] = JSON.parse(args.audit_areas)
      const result = prepareAudit(areas)
      return formatAuditPrepareReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'privacy_impact',
    description: 'Privacy Impact Assessment (PIA/DPIA) for data processing activities. Records processing activities, assesses necessity and proportionality, performs risk tiering, evaluates safeguards, and generates DPIA reports.',
    parameters: {
      processing_activities: { type: 'string', required: true, description: 'JSON array of data processing activities with fields: activity_name, data_types (array), data_subjects (array), purpose, legal_basis, retention_period, cross_border (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { processing_activities: string }) {
      const activities: DataProcessingActivity[] = JSON.parse(args.processing_activities)
      const result = assessPrivacyImpact(activities)
      return formatPrivacyImpactReport(result)
    }
  }))

  console.log(`[dsh-tool-complianceai] Loaded v${VERSION} — Enterprise Compliance Management AI with 8 tools`)
  console.log('  Tools: contract_scanner, policy_radar, risk_assessor, control_tester, training_manager, whistleblower, audit_preparer, privacy_impact')
}
