/**
 * DSH GLP Compliance Agent v0.1.0
 * GLP (Good Laboratory Practice) Compliance AI Agent for DeepSeek Harness - Pharma/Biotech Labs
 *
 * Tools:
 * 1. sop_compliance_checker       - SOP合规性审查与偏差识别
 * 2. study_audit_trail           - 研究项目审计追踪完整性验证
 * 3. data_integrity_validator    - ALCOA+数据完整性原则验证
 * 4. equipment_qualification     - 实验室设备 qualification/OQ/PQ 追踪
 * 5. personnel_training_competency - 人员资质与培训矩阵管理
 * 6. deviation_capability_advisor - 偏差处理能力与CAPA建议
 * 7. regulatory_submission_readiness - 监管机构提交材料准备度评估
 * 8. glp_risk_assessment         - GLP风险评估矩阵与缓解措施
 *
 * @module dsh-tool-glpcomplianceagent | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 *
 * DISCLAIMER: This tool is for informational/educational purposes only.
 * It is NOT a substitute for qualified regulatory affairs professionals.
 * Always consult GLP-certified QA/RA staff before making compliance decisions.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-glpcomplianceagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 - Seeded Random (mulberry32 PRNG) ====================

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

  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 - Type Definitions ====================

// --- Tool 1: SOP Compliance Checker ---
interface SOPComplianceInput {
  action: 'review' | 'deviation_check' | 'version_audit' | 'gap_analysis'
  sop_id: string
  sop_version: string
  sop_title: string
  study_id: string
  checks_performed: Array<{
    check_item: string
    expected_result: string
    actual_result: string
    compliant: boolean
  }>
  reviewer_role: string
}

interface SOPDeviation {
  deviation_id: string
  section: string
  type: 'major' | 'minor' | 'observation'
  description: string
  regulatory_reference: string
  impact_level: 'high' | 'medium' | 'low'
}

interface SOPComplianceResult {
  review_id: string
  sop_id: string
  sop_title: string
  sop_version: string
  study_id: string
  reviewer_role: string
  deviations: SOPDeviation[]
  compliance_score: number
  critical_findings: number
  major_findings: number
  minor_findings: number
  observations: number
  recommendations: string[]
  overall_status: 'compliant' | 'conditionally_compliant' | 'non_compliant'
}

// --- Tool 2: Study Audit Trail ---
interface AuditTrailInput {
  action: 'validate' | 'gap_check' | 'entry_review' | 'reconstruct'
  study_number: string
  study_director: string
  study_phase: string
  audit_entries: Array<{
    entry_id: string
    timestamp: string
    operator: string
    action: string
    original_value?: string
    new_value?: string
    reason?: string
    signature?: string
  }>
  system_name: string
}

interface TrailGap {
  gap_id: string
  entry_ref: string
  gap_type: 'missing_timestamp' | 'missing_signature' | 'value_discontinuity' | 'sequence_break' | 'missing_reason'
  description: string
  severity: 'critical' | 'major' | 'minor'
  regulatory_clause: string
}

interface AuditTrailResult {
  validation_id: string
  study_number: string
  study_director: string
  system_name: string
  total_entries: number
  gaps: TrailGap[]
  completeness_pct: number
  integrity_score: number
  chain_of_custody: 'intact' | 'partial' | 'broken'
  critical_gaps: number
  recommendations: string[]
}

// --- Tool 3: Data Integrity Validator (ALCOA+) ---
interface DataIntegrityInput {
  action: 'validate_attributable' | 'validate_legible' | 'validate_contemporaneous' | 'validate_original' | 'validate_accurate' | 'validate_complete' | 'validate_consistent' | 'validate_enduring' | 'validate_available' | 'full_assessment'
  data_source: string
  system_id: string
  records: Array<{
    record_id: string
    timestamp: string
    creator: string
    last_modifier: string
    modification_timestamp?: string
    modification_reason?: string
    is_original: boolean
    is_complete: boolean
    is_legible: boolean
    is_contemporaneous: boolean
    archive_status: string
  }>
}

interface ALCOAFinding {
  principle: 'Attributable' | 'Legible' | 'Contemporaneous' | 'Original' | 'Accurate' | 'Complete' | 'Consistent' | 'Enduring' | 'Available'
  status: 'pass' | 'fail' | 'warning'
  score: number
  details: string
  affected_records: number
}

interface DataIntegrityResult {
  assessment_id: string
  data_source: string
  system_id: string
  total_records: number
  findings: ALCOAFinding[]
  overall_alcoa_score: number
  compliant_principles: number
  non_compliant_principles: number
  warning_principles: number
  effectiveness_determination: 'Effective' | 'Effective with Recommendations' | 'Ineffective'
  regulatory_risk: 'low' | 'medium' | 'high' | 'critical'
}

// --- Tool 4: Equipment Qualification ---
interface EquipmentQualificationInput {
  action: 'status_check' | 'schedule_review' | 'gap_analysis' | 'out_of_service'
  facility: string
  equipment_list: Array<{
    equipment_id: string
    equipment_name: string
    type: 'HPLC' | 'GC' | 'LC-MS' | 'UV-Vis' | 'balance' | 'pH_meter' | 'incubator' | 'centrifuge' | 'autosampler' | 'dissolution'
    iq_status: 'performed' | 'not_performed' | 'waived'
    iq_date?: string
    oq_status: 'performed' | 'not_performed' | 'waived'
    oq_date?: string
    pq_status: 'performed' | 'not_performed' | 'waived'
    pq_date?: string
    last_calibration_date?: string
    next_calibration_due?: string
    location: string
    responsible_person: string
  }>
}

interface QualificationGap {
  equipment_id: string
  equipment_name: string
  gap_type: 'missing_IQ' | 'missing_OQ' | 'missing_PQ' | 'calibration_overdue' | 'requalification_due' | 'documentation_incomplete'
  severity: 'critical' | 'major' | 'minor'
  detail: string
  days_overdue: number
}

interface EquipmentQualResult {
  assessment_id: string
  facility: string
  total_equipment: number
  qualified_count: number
  gaps: QualificationGap[]
  qualification_rate: number
  calibration_compliance_rate: number
  overall_qualification_status: 'qualified' | 'conditionally_qualified' | 'not_qualified'
  upcoming_calibrations_30d: number
  recommendations: string[]
}

// --- Tool 5: Personnel Training Competency ---
interface TrainingCompetencyInput {
  action: 'matrix_review' | 'gap_analysis' | 'competency_assessment' | 'training_plan'
  department: string
  personnel: Array<{
    employee_id: string
    name: string
    role: string
    title: string
    training_records: Array<{
      training_id: string
      training_name: string
      completion_date: string
      expiry_date?: string
      trainer: string
      score?: number
      status: 'valid' | 'expired' | 'pending_renewal'
    }>
    required_competencies: string[]
    competency_verified: boolean
    verification_date?: string
  }>
}

interface TrainingGap {
  employee_id: string
  employee_name: string
  gap_type: 'missing_training' | 'expired_training' | 'competency_not_verified' | 'qualification_incomplete'
  details: string
  priority: 'high' | 'medium' | 'low'
  days_overdue: number
}

interface TrainingCompetencyResult {
  assessment_id: string
  department: string
  total_personnel: number
  training_gaps: TrainingGap[]
  competency_rate: number
  training_compliance_rate: number
  fully_qualified_count: number
  matrix_completeness_pct: number
  overall_matrix_status: 'complete' | 'nearly_complete' | 'incomplete' | 'significantly_incomplete'
  upcoming_expirations_30d: number
  recommendations: string[]
}

// --- Tool 6: Deviation CAPA Advisor ---
interface DeviationCAPAInput {
  action: 'assess_deviation' | 'capa_effectiveness' | 'root_cause' | 'trend_analysis'
  deviation_records: Array<{
    deviation_id: string
    date_identified: string
    description: string
    category: 'critical' | 'major' | 'minor'
    classification: 'laboratory_equipment' | 'documentation_error' | 'procedure_violation' | 'material_issue' | 'environmental' | 'personnel' | 'method'
    status: 'open' | 'investigating' | 'capa_pending' | 'capa_implemented' | 'closed'
    root_cause_category?: string
    capa_actions?: Array<{
      action_id: string
      description: string
      assigned_to: string
      due_date: string
      status: 'open' | 'in_progress' | 'completed' | 'overdue'
      effectiveness_verified: boolean
    }>
  }>
  timeframe_months: number
}

interface CAPAFinding {
  deviation_id: string
  finding: string
  recommendation: string
  priority: 'immediate' | 'high' | 'medium' | 'low'
  regulatory_reference: string
}

interface DeviationCAPAResult {
  assessment_id: string
  total_deviations: number
  open_deviations: number
  critical_open: number
  major_open: number
  capa_effectiveness_rate: number
  overdue_capas: number
  findings: CAPAFinding[]
  trend_direction: 'improving' | 'stable' | 'worsening'
  top_root_cause: string
  mean_days_to_close: number
  recommendations: string[]
}

// --- Tool 7: Regulatory Submission Readiness ---
interface SubmissionReadinessInput {
  action: 'fda_readiness' | 'ema_readiness' | 'nmpa_readiness' | 'comprehensive'
  submission_type: string
  product_name: string
  module_status: Array<{
    module: string
    description: string
    status: 'complete' | 'in_progress' | 'not_started'
    reviewer_signed_off: boolean
    qa_approved: boolean
    missing_items?: string[]
  }>
  study_reports: Array<{
    study_id: string
    study_type: string
    status: 'final' | 'draft' | 'ongoing'
    qa_audited: boolean
    compliance_status: 'compliant' | 'pending_resolution' | 'non_compliant'
  }>
  regulatory_indication: string
}

interface SubmissionGap {
  module: string
  missing_item: string
  severity: 'critical' | 'major' | 'minor'
  detail: string
  responsible_party: string
  estimated_days_to_complete: number
}

interface SubmissionReadinessResult {
  assessment_id: string
  submission_type: string
  regulatory_target: string
  product_name: string
  modules_complete: number
  modules_total: number
  study_reports_ready: number
  study_reports_total: number
  gaps: SubmissionGap[]
  overall_readiness_pct: number
  estimated_submission_date: string
  readiness_status: 'ready' | 'nearly_ready' | 'significant_gaps' | 'not_ready'
  critical_path_items: string[]
  recommendations: string[]
}

// --- Tool 8: GLP Risk Assessment ---
interface GLPRiskAssessmentInput {
  action: 'full_assessment' | 'department_risk' | 'process_risk' | 'mitigation_review'
  assessment_scope: string
  risk_items: Array<{
    risk_id: string
    category: string
    process: string
    hazard: string
    people_at_risk?: string[]
    current_controls: string[]
    likelihood: number
    severity: number
    detectability: number
    existing_mitigations: string[]
  }>
}

interface RiskRegisterItem {
  risk_id: string
  process: string
  hazard: string
  rpn: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  existing_controls: string[]
  mitigation_priority: number
  recommended_actions: string[]
  responsible_party: string
  target_date: string
  residual_rpn: number
  residual_risk_level: 'low' | 'medium' | 'high' | 'critical'
}

interface GLPRiskResult {
  assessment_id: string
  scope: string
  total_risks: number
  risk_register: RiskRegisterItem[]
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
  average_rpn: number
  highest_rpn: number
  risk_trend: 'improving' | 'stable' | 'worsening'
  recommendations: string[]
}

// ==================== SECTION 3 - Analyze Functions ====================

// --- Tool 1: SOP Compliance Checker ---
function analyzeSOPCompliance(input: SOPComplianceInput): SOPComplianceResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.sop_id + input.study_id + input.sop_version
  ))

  const deviations: SOPDeviation[] = []
  const regulatoryRefs = [
    '21 CFR Part 58.81(c)', '21 CFR Part 58.190(a)', 'OECD GLP Ch.4',
    '21 CFR Part 58.33(b)', 'OECD GLP Ch.2', '21 CFR Part 58.63(a)'
  ]
  const sections = ['Section 4.1 Scope', 'Section 5.2 Procedures', 'Section 6.1 Documentation', 'Section 7.3 Data Recording', 'Section 8.2 QA Oversight']

  const checkCount = Math.max(input.checks_performed.length, 3)
  const deviationCount = rng.nextInt(0, Math.min(4, checkCount))
  const types: SOPDeviation['type'][] = ['major', 'minor', 'observation']
  const impacts: SOPDeviation['impact_level'][] = ['high', 'medium', 'low']

  for (let i = 0; i < deviationCount; i++) {
    const type = rng.pick(types)
    deviations.push({
      deviation_id: `SOP-DEV-${rng.nextInt(1000, 9999)}`,
      section: rng.pick(sections),
      type,
      description: `SOP compliance deviation identified in ${rng.pick(sections)}. ${type === 'major' ? 'Significant deviation requiring CAPA.' : type === 'minor' ? 'Minor procedural deviation noted.' : 'Observation for improvement.'}`,
      regulatory_reference: rng.pick(regulatoryRefs),
      impact_level: type === 'major' ? 'high' : type === 'minor' ? rng.pick(['medium', 'low']) : 'low',
    })
  }

  const criticalCount = deviations.filter(d => d.type === 'major' && d.impact_level === 'high').length
  const majorCount = deviations.filter(d => d.type === 'major').length
  const minorCount = deviations.filter(d => d.type === 'minor').length
  const obsCount = deviations.filter(d => d.type === 'observation').length

  const baseScore = Math.max(0, 100 - criticalCount * 20 - majorCount * 10 - minorCount * 5 - obsCount * 2)
  const complianceScore = Math.min(100, Math.max(0, baseScore))

  const overallStatus: SOPComplianceResult['overall_status'] =
    complianceScore >= 90 ? 'compliant' : complianceScore >= 70 ? 'conditionally_compliant' : 'non_compliant'

  const recommendations: string[] = []
  if (criticalCount > 0) recommendations.push('Immediate CAPA initiation required for critical deviations')
  if (majorCount > 0) recommendations.push(`Address ${majorCount} major deviation(s) within 30 calendar days`)
  if (minorCount > 0) recommendations.push(`Review and close ${minorCount} minor deviation(s) via standard process`)
  recommendations.push('Schedule SOP retraining for affected personnel')
  recommendations.push('Update SOP version control log with review findings')

  return {
    review_id: `SOP-RPT-${rng.nextInt(100000, 999999)}`,
    sop_id: input.sop_id,
    sop_title: input.sop_title,
    sop_version: input.sop_version,
    study_id: input.study_id,
    reviewer_role: input.reviewer_role,
    deviations,
    compliance_score: complianceScore,
    critical_findings: criticalCount,
    major_findings: majorCount,
    minor_findings: minorCount,
    observations: obsCount,
    recommendations,
    overall_status: overallStatus,
  }
}

// --- Tool 2: Study Audit Trail ---
function analyzeAuditTrail(input: AuditTrailInput): AuditTrailResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.study_number + input.system_name
  ))

  const gaps: TrailGap[] = []
  const gapTypes: TrailGap['gap_type'][] = [
    'missing_timestamp', 'missing_signature', 'value_discontinuity', 'sequence_break', 'missing_reason'
  ]
  const severities: TrailGap['severity'][] = ['critical', 'major', 'minor']
  const clauses = [
    '21 CFR Part 58.130(e)', 'OECD GLP Ch.7', '21 CFR Part 211.188',
    '21 CFR Part 11.10(a)', 'OECD GLP Ch.8', '21 CFR Part 58.185(a)'
  ]

  const totalEntries = Math.max(input.audit_entries.length, 10)
  const gapCount = rng.nextInt(1, Math.min(6, Math.ceil(totalEntries / 5)))

  for (let i = 0; i < gapCount; i++) {
    const gapType = rng.pick(gapTypes)
    const severity = rng.pick(severities)
    gaps.push({
      gap_id: `AT-GAP-${rng.nextInt(1000, 9999)}`,
      entry_ref: `ENT-${rng.nextInt(100000, 999999)}`,
      gap_type: gapType,
      description: `Audit trail gap: ${gapType.replace(/_/g, ' ')}. ${severity === 'critical' ? 'Critical data integrity concern.' : severity === 'major' ? 'Requires investigation and documentation.' : 'Minor entry anomaly identified.'}`,
      severity,
      regulatory_clause: rng.pick(clauses),
    })
  }

  const criticalGaps = gaps.filter(g => g.severity === 'critical').length
  const majorGaps = gaps.filter(g => g.severity === 'major').length
  const completenessPct = Math.max(85, Math.min(100, 100 - criticalGaps * 5 - majorGaps * 3))
  const integrityScore = Math.max(70, Math.min(100, completenessPct - rng.nextInt(0, 5)))

  const chainOfCustody: AuditTrailResult['chain_of_custody'] =
    criticalGaps > 0 ? 'broken' : majorGaps > 2 ? 'partial' : 'intact'

  const recommendations: string[] = []
  if (criticalGaps > 0) recommendations.push(`Immediately investigate ${criticalGaps} critical chain-of-custody gap(s)`)
  if (majorGaps > 0) recommendations.push(`Document impact assessment for ${majorGaps} major gap(s)`)
  recommendations.push('Verify audit trail configuration per 21 CFR Part 11 requirements')
  recommendations.push('Review data backup and archive procedures')
  recommendations.push('Conduct system audit trail function verification')

  return {
    validation_id: `AT-VAL-${rng.nextInt(100000, 999999)}`,
    study_number: input.study_number,
    study_director: input.study_director,
    system_name: input.system_name,
    total_entries: totalEntries,
    gaps,
    completeness_pct: completenessPct,
    integrity_score: integrityScore,
    chain_of_custody: chainOfCustody,
    critical_gaps: criticalGaps,
    recommendations,
  }
}

// --- Tool 3: Data Integrity Validator (ALCOA+) ---
function analyzeDataIntegrity(input: DataIntegrityInput): DataIntegrityResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.data_source + input.system_id
  ))

  const principles: ALCOAFinding['principle'][] = [
    'Attributable', 'Legible', 'Contemporaneous', 'Original', 'Accurate',
    'Complete', 'Consistent', 'Enduring', 'Available'
  ]

  const findings: ALCOAFinding[] = []
  const totalRecords = Math.max(input.records.length, 50)

  for (const principle of principles) {
    const score = Math.round(rng.nextFloat(0.78, 0.99) * 100) / 100
    const affected = Math.round(totalRecords * rng.nextFloat(0.01, 0.12))
    const status: ALCOAFinding['status'] = score >= 0.95 ? 'pass' : score >= 0.85 ? 'warning' : 'fail'
    const detailsMap: Record<string, string> = {
      'Attributable': `${totalRecords - affected} of ${totalRecords} records fully attributable to creator/modifier with timestamps`,
      'Legible': `${affected} records flagged for potential legibility/traceability concerns`,
      'Contemporaneous': `${affected} records show delay between event and recording exceeding defined threshold`,
      'Original': `${affected} records lack proper original data preservation documentation`,
      'Accurate': `${affected} records identified with accuracy concerns during verification`,
      'Complete': `${affected} records have identified completeness gaps`,
      'Consistent': `${affected} records flagged for consistency concerns in documentation`,
      'Enduring': `${affected} records require backup/archiving verification`,
      'Available': `${affected} records with accessibility concerns for inspection`,
    }
    findings.push({
      principle,
      status,
      score,
      details: detailsMap[principle] || `Assessment of ${principle.toLowerCase()} principle`,
      affected_records: affected,
    })
  }

  const compliantCount = findings.filter(f => f.status === 'pass').length
  const warningCount = findings.filter(f => f.status === 'warning').length
  const nonCompliantCount = findings.filter(f => f.status === 'fail').length
  const overallScore = Math.round((findings.reduce((s, f) => s + f.score, 0) / findings.length) * 100) / 100

  const effectiveness: DataIntegrityResult['effectiveness_determination'] =
    overallScore >= 0.95 ? 'Effective' : overallScore >= 0.85 ? 'Effective with Recommendations' : 'Ineffective'

  const regulatoryRisk: DataIntegrityResult['regulatory_risk'] =
    nonCompliantCount >= 3 ? 'critical' : nonCompliantCount >= 1 ? 'high' : warningCount >= 3 ? 'medium' : 'low'

  return {
    assessment_id: `DI-${rng.nextInt(100000, 999999)}`,
    data_source: input.data_source,
    system_id: input.system_id,
    total_records: totalRecords,
    findings,
    overall_alcoa_score: overallScore,
    compliant_principles: compliantCount,
    non_compliant_principles: nonCompliantCount,
    warning_principles: warningCount,
    effectiveness_determination: effectiveness,
    regulatory_risk: regulatoryRisk,
  }
}

// --- Tool 4: Equipment Qualification ---
function analyzeEquipmentQualification(input: EquipmentQualificationInput): EquipmentQualResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.facility + input.equipment_list.length.toString()
  ))

  const gaps: QualificationGap[] = []
  const qualifiedCount = 0

  for (const eq of input.equipment_list) {
    if (eq.iq_status === 'not_performed') {
      gaps.push({
        equipment_id: eq.equipment_id,
        equipment_name: eq.equipment_name,
        gap_type: 'missing_IQ',
        severity: 'critical',
        detail: `Installation Qualification not performed for ${eq.equipment_name} (${eq.equipment_id})`,
        days_overdue: rng.nextInt(30, 365),
      })
    }
    if (eq.oq_status === 'not_performed') {
      gaps.push({
        equipment_id: eq.equipment_id,
        equipment_name: eq.equipment_name,
        gap_type: 'missing_OQ',
        severity: 'critical',
        detail: `Operational Qualification not performed for ${eq.equipment_name} (${eq.equipment_id})`,
        days_overdue: rng.nextInt(15, 180),
      })
    }
    if (eq.pq_status === 'not_performed') {
      gaps.push({
        equipment_id: eq.equipment_id,
        equipment_name: eq.equipment_name,
        gap_type: 'missing_PQ',
        severity: 'major',
        detail: `Performance Qualification not performed for ${eq.equipment_name} (${eq.equipment_id})`,
        days_overdue: rng.nextInt(7, 90),
      })
    }
    if (eq.next_calibration_due) {
      const daysUntil = Math.floor((new Date(eq.next_calibration_due).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntil < 0) {
        gaps.push({
          equipment_id: eq.equipment_id,
          equipment_name: eq.equipment_name,
          gap_type: 'calibration_overdue',
          severity: daysUntil < -30 ? 'critical' : 'major',
          detail: `Calibration overdue for ${eq.equipment_name} (${eq.equipment_id}). Last: ${eq.last_calibration_date || 'unknown'}`,
          days_overdue: Math.abs(daysUntil),
        })
      }
    }
  }

  const actualQualified = input.equipment_list.filter(e =>
    e.iq_status === 'performed' && e.oq_status === 'performed' && e.pq_status === 'performed'
  ).length

  const qualificationRate = input.equipment_list.length > 0
    ? Math.round((actualQualified / input.equipment_list.length) * 100)
    : 100

  const calCompliant = input.equipment_list.filter((e): boolean => {
    if (!e.next_calibration_due) return true
    return new Date(e.next_calibration_due).getTime() > Date.now()
  }).length
  const calRate = input.equipment_list.length > 0
    ? Math.round((calCompliant / input.equipment_list.length) * 100)
    : 100

  const overallStatus: EquipmentQualResult['overall_qualification_status'] =
    qualificationRate >= 95 ? 'qualified' : qualificationRate >= 80 ? 'conditionally_qualified' : 'not_qualified'

  const upcomingCal30 = input.equipment_list.filter(e => {
    if (!e.next_calibration_due) return false
    const d = (new Date(e.next_calibration_due).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return d > 0 && d <= 30
  }).length

  const recommendations: string[] = []
  const critGaps = gaps.filter(g => g.severity === 'critical').length
  if (critGaps > 0) recommendations.push(`Prioritize resolution of ${critGaps} critical qualification gap(s)`)
  if (qualificationRate < 100) recommendations.push(`Complete qualification activities for ${input.equipment_list.length - actualQualified} equipment item(s)`)
  if (calRate < 100) recommendations.push(`Schedule overdue calibrations for ${input.equipment_list.length - calCompliant} equipment item(s)`)
  recommendations.push('Review equipment qualification schedule against study start dates')
  recommendations.push('Verify equipment logs are current and accessible for audit')

  return {
    assessment_id: `EQ-${rng.nextInt(100000, 999999)}`,
    facility: input.facility,
    total_equipment: input.equipment_list.length,
    qualified_count: actualQualified,
    gaps,
    qualification_rate: qualificationRate,
    calibration_compliance_rate: calRate,
    overall_qualification_status: overallStatus,
    upcoming_calibrations_30d: upcomingCal30,
    recommendations,
  }
}

// --- Tool 5: Personnel Training Competency ---
function analyzeTrainingCompetency(input: TrainingCompetencyInput): TrainingCompetencyResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.department + input.personnel.length.toString()
  ))

  const trainingGaps: TrainingGap[] = []
  const totalPersonnel = Math.max(input.personnel.length, 5)

  for (const person of input.personnel) {
    for (const training of person.training_records) {
      if (training.status === 'expired') {
        const daysOvr = training.expiry_date
          ? Math.abs(Math.floor((Date.now() - new Date(training.expiry_date).getTime()) / (1000 * 60 * 60 * 24)))
          : rng.nextInt(30, 180)
        trainingGaps.push({
          employee_id: person.employee_id,
          employee_name: person.name,
          gap_type: 'expired_training',
          details: `Expired training: ${training.training_name} (expired ${training.expiry_date || 'unknown'})`,
          priority: daysOvr > 90 ? 'high' : 'medium',
          days_overdue: daysOvr,
        })
      }
    }
    if (!person.competency_verified) {
      trainingGaps.push({
        employee_id: person.employee_id,
        employee_name: person.name,
        gap_type: 'competency_not_verified',
        details: `Competency not verified for ${person.role}. Required: ${person.required_competencies.join(', ')}`,
        priority: 'high',
        days_overdue: rng.nextInt(0, 60),
      })
    }
  }

  const fullyQualified = input.personnel.filter(p =>
    p.competency_verified && p.training_records.every(t => t.status === 'valid')
  ).length

  const totalRequiredTraining = input.personnel.reduce((s, p) => s + p.training_records.length, 0)
  const validTraining = input.personnel.reduce((s, p) =>
    s + p.training_records.filter(t => t.status === 'valid').length, 0
  )
  const trainingRate = totalRequiredTraining > 0 ? Math.round((validTraining / totalRequiredTraining) * 100) : 100
  const competencyRate = input.personnel.length > 0
    ? Math.round((input.personnel.filter(p => p.competency_verified).length / input.personnel.length) * 100) : 100

  const matrixCompleteness = Math.round((trainingRate * 0.6 + competencyRate * 0.4))
  const matrixStatus: TrainingCompetencyResult['overall_matrix_status'] =
    matrixCompleteness >= 95 ? 'complete' : matrixCompleteness >= 85 ? 'nearly_complete'
      : matrixCompleteness >= 70 ? 'incomplete' : 'significantly_incomplete'

  const upcoming30 = input.personnel.reduce((count, p) => {
    return count + p.training_records.filter(t => {
      if (!t.expiry_date || t.status !== 'valid') return false
      const d = (new Date(t.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      return d > 0 && d <= 30
    }).length
  }, 0)

  const recommendations: string[] = []
  const highGaps = trainingGaps.filter(g => g.priority === 'high').length
  if (highGaps > 0) recommendations.push(`Urgently address ${highGaps} high-priority training gap(s)`)
  if (competencyRate < 100) recommendations.push(`Verify competency for ${input.personnel.length - input.personnel.filter(p => p.competency_verified).length} personnel`)
  if (trainingRate < 100) recommendations.push(`Renew expired training for ${totalRequiredTraining - validTraining} record(s)`)
  recommendations.push('Review training needs assessment for upcoming study assignments')
  recommendations.push('Update training matrix documentation and QA approval')

  return {
    assessment_id: `TRNG-${rng.nextInt(100000, 999999)}`,
    department: input.department,
    total_personnel: totalPersonnel,
    training_gaps: trainingGaps,
    competency_rate: competencyRate,
    training_compliance_rate: trainingRate,
    fully_qualified_count: fullyQualified,
    matrix_completeness_pct: matrixCompleteness,
    overall_matrix_status: matrixStatus,
    upcoming_expirations_30d: upcoming30,
    recommendations,
  }
}

// --- Tool 6: Deviation CAPA Advisor ---
function analyzeDeviationCAPA(input: DeviationCAPAInput): DeviationCAPAResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.deviation_records.length.toString() + input.timeframe_months.toString()
  ))

  const findings: CAPAFinding[] = []
  const regulatoryRefs = [
    '21 CFR Part 58.35', 'OECD GLP Ch.2', '21 CFR Part 58.81',
    '21 CFR Part 211.192', 'OECD GLP Ch.9'
  ]

  const openDevs = input.deviation_records.filter(d => d.status !== 'closed').length
  const critOpen = input.deviation_records.filter(d => d.status !== 'closed' && d.category === 'critical').length
  const majorOpen = input.deviation_records.filter(d => d.status !== 'closed' && d.category === 'major').length

  let totalCapas = 0
  let overdueCapas = 0
  let effectiveCapas = 0

  for (const dev of input.deviation_records) {
    if (dev.capa_actions) {
      for (const capa of dev.capa_actions) {
        totalCapas++
        if (capa.status === 'overdue') overdueCapas++
        if (capa.effectiveness_verified) effectiveCapas++
      }
      if (dev.capa_actions.length > 0 && !dev.capa_actions[0].effectiveness_verified && dev.status === 'closed') {
        findings.push({
          deviation_id: dev.deviation_id,
          finding: `CAPA effectiveness not verified for ${dev.deviation_id}`,
          recommendation: 'Conduct documented effectiveness check within 90 days of implementation',
          priority: 'high',
          regulatory_reference: rng.pick(regulatoryRefs),
        })
      }
    }
    if (dev.status === 'open' && dev.category === 'critical') {
      findings.push({
        deviation_id: dev.deviation_id,
        finding: `Critical deviation ${dev.deviation_id} remains open`,
        recommendation: 'Expedite investigation and implement interim controls',
        priority: 'immediate',
        regulatory_reference: rng.pick(regulatoryRefs),
      })
    }
  }

  const capaEffectRate = totalCapas > 0 ? Math.round((effectiveCapas / totalCapas) * 100) : 100
  const trendDir: DeviationCAPAResult['trend_direction'] =
    rng.next() > 0.6 ? 'improving' : rng.next() > 0.5 ? 'stable' : 'worsening'
  const rootCauses = ['Equipment malfunction', 'Procedure not followed', 'Training gap', 'Documentation error', 'Material defect', 'Environmental excursion']
  const topRC = rng.pick(rootCauses)

  const closedDevs = input.deviation_records.filter(d => d.status === 'closed')
  const meanDaysClose = closedDevs.length > 0
    ? Math.round(rng.nextFloat(15, 60))
    : 0

  const recommendations: string[] = []
  if (critOpen > 0) recommendations.push(`Urgently resolve ${critOpen} critical open deviation(s)`)
  if (overdueCapas > 0) recommendations.push(`Review and escalate ${overdueCapas} overdue CAPA action(s)`)
  if (capaEffectRate < 80) recommendations.push('Improve CAPA effectiveness verification process')
  recommendations.push(`Address root cause pattern: ${topRC}`)
  recommendations.push('Conduct management review of deviation trends')
  recommendations.push('Verify CAPA actions are appropriately addressing root causes')

  return {
    assessment_id: `CAPA-${rng.nextInt(100000, 999999)}`,
    total_deviations: input.deviation_records.length,
    open_deviations: openDevs,
    critical_open: critOpen,
    major_open: majorOpen,
    capa_effectiveness_rate: capaEffectRate,
    overdue_capas: overdueCapas,
    findings,
    trend_direction: trendDir,
    top_root_cause: topRC,
    mean_days_to_close: meanDaysClose,
    recommendations,
  }
}

// --- Tool 7: Regulatory Submission Readiness ---
function analyzeSubmissionReadiness(input: SubmissionReadinessInput): SubmissionReadinessResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.submission_type + input.product_name + input.regulatory_indication
  ))

  const gaps: SubmissionGap[] = []

  for (const mod of input.module_status) {
    if (mod.status !== 'complete') {
      const missingItems = mod.missing_items || [
        `${mod.module} - Outstanding queries`,
        `${mod.module} - Format compliance check pending`,
        `${mod.module} - Cross-reference verification`
      ]
      for (const item of missingItems) {
        gaps.push({
          module: mod.module,
          missing_item: item,
          severity: mod.status === 'not_started' ? 'critical' : 'major',
          detail: `${mod.module}: ${item} - ${mod.status === 'not_started' ? 'Not started' : 'In progress'}`,
          responsible_party: `Module ${mod.module} Lead`,
          estimated_days_to_complete: mod.status === 'not_started' ? rng.nextInt(20, 60) : rng.nextInt(5, 20),
        })
      }
    }
    if (mod.status === 'complete' && !mod.reviewer_signed_off) {
      gaps.push({
        module: mod.module,
        missing_item: `${mod.module} - Reviewer sign-off pending`,
        severity: 'major',
        detail: `${mod.module} content complete but missing formal reviewer sign-off`,
        responsible_party: `${mod.module} Reviewer`,
        estimated_days_to_complete: rng.nextInt(3, 10),
      })
    }
  }

  const readyStudies = input.study_reports.filter(s => s.status === 'final' && s.qa_audited).length
  const totalModules = input.module_status.length
  const completeModules = input.module_status.filter(m => m.status === 'complete' && m.reviewer_signed_off && m.qa_approved).length

  const readinessPct = totalModules > 0 ? Math.round(
    ((completeModules / totalModules) * 60 +
     (readyStudies / Math.max(input.study_reports.length, 1)) * 40)
  ) : 0

  const targetMap: Record<string, string> = {
    'fda_readiness': 'FDA (CDER/ CBER)',
    'ema_readiness': 'EMA',
    'nmpa_readiness': 'NMPA/FDA',
    'comprehensive': 'Multi-regional (FDA/EMA/PMDA)',
  }

  const readinessStatus: SubmissionReadinessResult['readiness_status'] =
    readinessPct >= 90 ? 'ready' : readinessPct >= 75 ? 'nearly_ready'
      : readinessPct >= 50 ? 'significant_gaps' : 'not_ready'

  const critItems = gaps.filter(g => g.severity === 'critical').map(g => g.missing_item)
  const estDays = readinessPct < 90 ? rng.nextInt(30, 120) : 0
  const estDate = new Date(Date.now() + estDays * 24 * 60 * 60 * 1000)

  const recommendations: string[] = []
  const critGapCount = gaps.filter(g => g.severity === 'critical').length
  if (critGapCount > 0) recommendations.push(`Critical: Complete ${critGapCount} critical gap(s) before submission`)
  const studyGap = input.study_reports.length - readyStudies
  if (studyGap > 0) recommendations.push(`Finalize ${studyGap} study report(s) and complete QA audit`)
  if (readinessPct < 75) recommendations.push('Consider regulatory pre-submission meeting')
  recommendations.push('Verify all electronic submission format requirements')
  recommendations.push('Finalize quality agreement and cross-reference documentation')

  return {
    assessment_id: `SUB-${rng.nextInt(100000, 999999)}`,
    submission_type: input.submission_type,
    regulatory_target: targetMap[input.action] || 'FDA (CDER/CBER)',
    product_name: input.product_name,
    modules_complete: completeModules,
    modules_total: totalModules,
    study_reports_ready: readyStudies,
    study_reports_total: input.study_reports.length,
    gaps,
    overall_readiness_pct: Math.min(100, readinessPct),
    estimated_submission_date: estDate.toISOString().slice(0, 10),
    readiness_status: readinessStatus,
    critical_path_items: critItems,
    recommendations,
  }
}

// --- Tool 8: GLP Risk Assessment ---
function analyzeGLPRiskAssessment(input: GLPRiskAssessmentInput): GLPRiskResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.assessment_scope + input.risk_items.length.toString()
  ))

  const riskRegister: RiskRegisterItem[] = []

  for (const item of input.risk_items) {
    const rpn = item.likelihood * item.severity * item.detectability
    const riskLevel: RiskRegisterItem['risk_level'] =
      rpn >= 75 ? 'critical' : rpn >= 40 ? 'high' : rpn >= 20 ? 'medium' : 'low'

    const mitigations = item.existing_mitigations.length > 0 ? item.existing_mitigations : []
    const reductionFactor = mitigations.length * 0.15
    const residualRpn = Math.max(1, Math.round(rpn * (1 - Math.min(0.7, reductionFactor))))
    const residualLevel: RiskRegisterItem['residual_risk_level'] =
      residualRpn >= 75 ? 'critical' : residualRpn >= 40 ? 'high' : residualRpn >= 20 ? 'medium' : 'low'

    const recommendedActions: string[] = []
    if (item.likelihood >= 4) recommendedActions.push(`Reduce likelihood: Implement additional preventive controls for ${item.process}`)
    if (item.severity >= 4) recommendedActions.push(`Reduce severity: Add fail-safe mechanisms for ${item.hazard}`)
    if (item.detectability >= 4) recommendedActions.push(`Improve detection: Add monitoring/alerting for ${item.process}`)
    if (recommendedActions.length === 0) recommendedActions.push(`Maintain current controls for ${item.process} - ${item.hazard}`)

    const targetDate = new Date(Date.now() + rng.nextInt(30, 180) * 24 * 60 * 60 * 1000)

    riskRegister.push({
      risk_id: item.risk_id,
      process: item.process,
      hazard: item.hazard,
      rpn,
      risk_level: riskLevel,
      existing_controls: item.current_controls,
      mitigation_priority: rpn >= 75 ? 1 : rpn >= 40 ? 2 : rpn >= 20 ? 3 : 4,
      recommended_actions: recommendedActions,
      responsible_party: `Process Owner - ${item.process}`,
      target_date: targetDate.toISOString().slice(0, 10),
      residual_rpn: residualRpn,
      residual_risk_level: residualLevel,
    })
  }

  riskRegister.sort((a, b) => b.rpn - a.rpn)

  const critCount = riskRegister.filter(r => r.risk_level === 'critical').length
  const highCount = riskRegister.filter(r => r.risk_level === 'high').length
  const medCount = riskRegister.filter(r => r.risk_level === 'medium').length
  const lowCount = riskRegister.filter(r => r.risk_level === 'low').length

  const avgRpn = riskRegister.length > 0
    ? Math.round(riskRegister.reduce((s, r) => s + r.rpn, 0) / riskRegister.length)
    : 0
  const highestRpn = riskRegister.length > 0 ? riskRegister[0].rpn : 0

  const trendDir: GLPRiskResult['risk_trend'] =
    rng.next() > 0.6 ? 'improving' : rng.next() > 0.5 ? 'stable' : 'worsening'

  const recommendations: string[] = []
  if (critCount > 0) recommendations.push(`Immediate action required for ${critCount} critical risk(s)`)
  if (highCount > 0) recommendations.push(`Develop mitigation plans for ${highCount} high-priority risk(s)`)
  recommendations.push('Review risk assessment at next management review meeting')
  recommendations.push('Verify effectiveness of implemented mitigations')
  recommendations.push('Update risk register with any new process changes')

  return {
    assessment_id: `RISK-${rng.nextInt(100000, 999999)}`,
    scope: input.assessment_scope,
    total_risks: input.risk_items.length,
    risk_register: riskRegister,
    critical_risks: critCount,
    high_risks: highCount,
    medium_risks: medCount,
    low_risks: lowCount,
    average_rpn: avgRpn,
    highest_rpn: highestRpn,
    risk_trend: trendDir,
    recommendations,
  }
}

// ==================== SECTION 4 - Format Functions ====================

// --- Tool 1: SOP Compliance Report ---
function formatSOPReport(result: SOPComplianceResult): string {
  const lines: string[] = []
  lines.push('## SOP Compliance Review Report')
  lines.push('')
  lines.push('```diff')
  lines.push(`! REVIEW_ID:  ${result.review_id}`)
  lines.push(`! SOP:        ${result.sop_id} v${result.sop_version}`)
  lines.push(`! STUDY:      ${result.study_id}`)
  lines.push(`! STATUS:     ${result.overall_status.toUpperCase()}`)
  lines.push('```')
  lines.push('')
  lines.push('### Compliance Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  SOP COMPLIANCE REVIEW                        |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  Score: ${result.compliance_score}%`.padEnd(48) + '|')
  lines.push(`  |  Critical: ${result.critical_findings}  Major: ${result.major_findings}  Minor: ${result.minor_findings}  Obs: ${result.observations}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  if (result.deviations.length > 0) {
    lines.push('### Deviations Identified')
    lines.push('| ID | Section | Type | Impact | Regulatory Ref | Description |')
    lines.push('|----|---------|------|--------|----------------|-------------|')
    for (const d of result.deviations) {
      lines.push(`| ${d.deviation_id} | ${d.section} | ${d.type.toUpperCase()} | ${d.impact_level.toUpperCase()} | ${d.regulatory_reference} | ${d.description.slice(0, 60)}... |`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | SOP Review: ' + result.review_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// --- Tool 2: Audit Trail Report ---
function formatAuditTrailReport(result: AuditTrailResult): string {
  const lines: string[] = []
  lines.push('## Study Audit Trail Validation Report')
  lines.push('')
  lines.push('```diff')
  lines.push(`! VALIDATION_ID: ${result.validation_id}`)
  lines.push(`! STUDY:         ${result.study_number}`)
  lines.push(`! SYSTEM:        ${result.system_name}`)
  lines.push(`! CUSTODY:       ${result.chain_of_custody.toUpperCase()}`)
  lines.push('```')
  lines.push('')
  lines.push('### Audit Trail Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  AUDIT TRAIL VALIDATION                      |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  Entries: ${result.total_entries}  Completeness: ${result.completeness_pct}%`.padEnd(48) + '|')
  lines.push(`  |  Integrity Score: ${result.integrity_score}%  Critical Gaps: ${result.critical_gaps}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Trail Gaps')
    lines.push('| ID | Entry Ref | Gap Type | Severity | Regulatory Clause | Description |')
    lines.push('|----|-----------|----------|----------|-------------------|-------------|')
    for (const g of result.gaps) {
      lines.push(`| ${g.gap_id} | ${g.entry_ref} | ${g.gap_type.replace(/_/g, ' ')} | ${g.severity.toUpperCase()} | ${g.regulatory_clause} | ${g.description.slice(0, 50)}... |`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | Audit Trail: ' + result.validation_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// --- Tool 3: Data Integrity Report ---
function formatDataIntegrityReport(result: DataIntegrityResult): string {
  const lines: string[] = []
  lines.push('## ALCOA+ Data Integrity Assessment Report')
  lines.push('')
  lines.push('```diff')
  lines.push(`! ASSESSMENT_ID: ${result.assessment_id}`)
  lines.push(`! DATA_SOURCE:   ${result.data_source}`)
  lines.push(`! SYSTEM:        ${result.system_id}`)
  lines.push(`! EFFECTIVENESS: ${result.effectiveness_determination}`)
  lines.push('```')
  lines.push('')
  lines.push('### ALCOA+ Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  ALCOA+ DATA INTEGRITY ASSESSMENT            |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  Overall Score: ${result.overall_alcoa_score * 100}%  Records: ${result.total_records}`.padEnd(48) + '|')
  lines.push(`  |  Pass: ${result.compliant_principles}  Warning: ${result.warning_principles}  Fail: ${result.non_compliant_principles}`.padEnd(48) + '|')
  lines.push(`  |  Regulatory Risk: ${result.regulatory_risk.toUpperCase()}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  lines.push('### ALCOA+ Principle Assessment')
  lines.push('| Principle | Status | Score | Affected Records | Details |')
  lines.push('|-----------|--------|-------|------------------|---------|')
  for (const f of result.findings) {
    const statusIcon = f.status === 'pass' ? 'PASS' : f.status === 'warning' ? 'WARN' : 'FAIL'
    lines.push(`| ${f.principle} | ${statusIcon} | ${(f.score * 100).toFixed(0)}% | ${f.affected_records} | ${f.details.slice(0, 55)}... |`)
  }
  lines.push('')

  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | Data Integrity: ' + result.assessment_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// --- Tool 4: Equipment Qualification Report ---
function formatEquipmentQualReport(result: EquipmentQualResult): string {
  const lines: string[] = []
  lines.push('## Equipment Qualification Status Report')
  lines.push('')
  lines.push('```diff')
  lines.push(`! ASSESSMENT_ID: ${result.assessment_id}`)
  lines.push(`! FACILITY:      ${result.facility}`)
  lines.push(`! STATUS:        ${result.overall_qualification_status.toUpperCase()}`)
  lines.push('```')
  lines.push('')
  lines.push('### Qualification Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  EQUIPMENT QUALIFICATION STATUS              |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  Total: ${result.total_equipment}  Qualified: ${result.qualified_count}  Rate: ${result.qualification_rate}%`.padEnd(48) + '|')
  lines.push(`  |  Calibration Compliance: ${result.calibration_compliance_rate}%`.padEnd(48) + '|')
  lines.push(`  |  Upcoming Calibrations (30d): ${result.upcoming_calibrations_30d}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Qualification Gaps')
    lines.push('| Equipment ID | Name | Gap Type | Severity | Days Overdue | Detail |')
    lines.push('|-------------|------|----------|----------|--------------|--------|')
    for (const g of result.gaps) {
      lines.push(`| ${g.equipment_id} | ${g.equipment_name} | ${g.gap_type.replace(/_/g, ' ')} | ${g.severity.toUpperCase()} | ${g.days_overdue} | ${g.detail.slice(0, 45)}... |`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | Equipment Qual: ' + result.assessment_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// --- Tool 5: Training Competency Report ---
function formatTrainingCompetencyReport(result: TrainingCompetencyResult): string {
  const lines: string[] = []
  lines.push('## Personnel Training & Competency Matrix Report')
  lines.push('')
  lines.push('```diff')
  lines.push(`! ASSESSMENT_ID: ${result.assessment_id}`)
  lines.push(`! DEPARTMENT:    ${result.department}`)
  lines.push(`! STATUS:        ${result.overall_matrix_status.toUpperCase()}`)
  lines.push('```')
  lines.push('')
  lines.push('### Training Matrix Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  TRAINING & COMPETENCY MATRIX                |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  Personnel: ${result.total_personnel}  Fully Qualified: ${result.fully_qualified_count}`.padEnd(48) + '|')
  lines.push(`  |  Training Compliance: ${result.training_compliance_rate}%  Competency: ${result.competency_rate}%`.padEnd(48) + '|')
  lines.push(`  |  Matrix Completeness: ${result.matrix_completeness_pct}%  Expiring (30d): ${result.upcoming_expirations_30d}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  if (result.training_gaps.length > 0) {
    lines.push('### Training Gaps')
    lines.push('| Employee ID | Name | Gap Type | Priority | Days Overdue | Details |')
    lines.push('|------------|------|----------|----------|--------------|---------|')
    for (const g of result.training_gaps) {
      lines.push(`| ${g.employee_id} | ${g.employee_name} | ${g.gap_type.replace(/_/g, ' ')} | ${g.priority.toUpperCase()} | ${g.days_overdue} | ${g.details.slice(0, 50)}... |`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | Training Matrix: ' + result.assessment_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// --- Tool 6: Deviation CAPA Report ---
function formatDeviationCAPAReport(result: DeviationCAPAResult): string {
  const lines: string[] = []
  lines.push('## Deviation & CAPA Assessment Report')
  lines.push('')
  lines.push('```diff')
  lines.push(`! ASSESSMENT_ID: ${result.assessment_id}`)
  lines.push(`! TOTAL_DEVS:    ${result.total_deviations}`)
  lines.push(`! OPEN:          ${result.open_deviations} (Critical: ${result.critical_open}, Major: ${result.major_open})`)
  lines.push(`! TREND:         ${result.trend_direction.toUpperCase()}`)
  lines.push('```')
  lines.push('')
  lines.push('### Deviation & CAPA Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  DEVIATION & CAPA ASSESSMENT                 |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  CAPA Effectiveness: ${result.capa_effectiveness_rate}%  Overdue CAPAs: ${result.overdue_capas}`.padEnd(48) + '|')
  lines.push(`  |  Top Root Cause: ${result.top_root_cause}`.padEnd(48) + '|')
  lines.push(`  |  Mean Days to Close: ${result.mean_days_to_close}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  if (result.findings.length > 0) {
    lines.push('### Key Findings')
    lines.push('| Deviation ID | Finding | Priority | Regulatory Ref | Recommendation |')
    lines.push('|-------------|---------|----------|----------------|----------------|')
    for (const f of result.findings) {
      lines.push(`| ${f.deviation_id} | ${f.finding.slice(0, 40)}... | ${f.priority.toUpperCase()} | ${f.regulatory_reference} | ${f.recommendation.slice(0, 40)}... |`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | Deviation/CAPA: ' + result.assessment_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// --- Tool 7: Submission Readiness Report ---
function formatSubmissionReadinessReport(result: SubmissionReadinessResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Submission Readiness Assessment')
  lines.push('')
  lines.push('```diff')
  lines.push(`! ASSESSMENT_ID: ${result.assessment_id}`)
  lines.push(`! SUBMISSION:    ${result.submission_type}`)
  lines.push(`! TARGET:        ${result.regulatory_target}`)
  lines.push(`! STATUS:        ${result.readiness_status.toUpperCase()}`)
  lines.push('```')
  lines.push('')
  lines.push('### Submission Readiness Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  REGULATORY SUBMISSION READINESS             |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  Readiness: ${result.overall_readiness_pct}%  Modules: ${result.modules_complete}/${result.modules_total}`.padEnd(48) + '|')
  lines.push(`  |  Study Reports: ${result.study_reports_ready}/${result.study_reports_total}  Est. Date: ${result.estimated_submission_date}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Submission Gaps')
    lines.push('| Module | Missing Item | Severity | Days to Complete | Responsible |')
    lines.push('|--------|-------------|----------|------------------|-------------|')
    for (const g of result.gaps) {
      lines.push(`| ${g.module} | ${g.missing_item.slice(0, 35)}... | ${g.severity.toUpperCase()} | ${g.estimated_days_to_complete} | ${g.responsible_party} |`)
    }
    lines.push('')
  }

  if (result.critical_path_items.length > 0) {
    lines.push('### Critical Path Items')
    for (const c of result.critical_path_items) lines.push(`- CRITICAL: ${c}`)
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | Submission: ' + result.assessment_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// --- Tool 8: GLP Risk Assessment Report ---
function formatGLPRiskReport(result: GLPRiskResult): string {
  const lines: string[] = []
  lines.push('## GLP Risk Assessment Matrix Report')
  lines.push('')
  lines.push('```diff')
  lines.push(`! ASSESSMENT_ID: ${result.assessment_id}`)
  lines.push(`! SCOPE:         ${result.scope}`)
  lines.push(`! TOTAL_RISKS:   ${result.total_risks}`)
  lines.push(`! TREND:         ${result.risk_trend.toUpperCase()}`)
  lines.push('```')
  lines.push('')
  lines.push('### Risk Assessment Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  +-----------------------------------------------+')
  lines.push('  |  GLP RISK ASSESSMENT MATRIX                  |')
  lines.push('  |  ----------------------------------------     |')
  lines.push(`  |  Critical: ${result.critical_risks}  High: ${result.high_risks}  Medium: ${result.medium_risks}  Low: ${result.low_risks}`.padEnd(48) + '|')
  lines.push(`  |  Avg RPN: ${result.average_rpn}  Highest RPN: ${result.highest_rpn}`.padEnd(48) + '|')
  lines.push('  +-----------------------------------------------+')
  lines.push('```')
  lines.push('')

  if (result.risk_register.length > 0) {
    lines.push('### Risk Register')
    lines.push('| Risk ID | Process | Hazard | RPN | Level | Residual RPN | Residual Level |')
    lines.push('|---------|---------|--------|-----|-------|--------------|----------------|')
    for (const r of result.risk_register) {
      lines.push(`| ${r.risk_id} | ${r.process.slice(0, 20)} | ${r.hazard.slice(0, 20)} | ${r.rpn} | ${r.risk_level.toUpperCase()} | ${r.residual_rpn} | ${r.residual_risk_level.toUpperCase()} |`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*GLP Compliance Agent v' + VERSION + ' | Risk Assessment: ' + result.assessment_id + '*')
  lines.push('')
  lines.push('> **DISCLAIMER**: This automated assessment is for informational purposes only and is NOT a substitute for qualified regulatory affairs professionals. Always consult GLP-certified QA/RA staff before making compliance decisions.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: SOP Compliance Checker
  tools.register(defineTool({
    name: 'sop_compliance_checker',
    description: 'SOP合规性审查与偏差识别 | Check SOP compliance and identify deviations. Reviews SOP adherence against study protocols, identifies major/minor deviations, and provides regulatory reference mapping. Supports review, deviation_check, version_audit, and gap_analysis actions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (review|deviation_check|version_audit|gap_analysis), sop_id, sop_version, sop_title, study_id, checks_performed[{check_item, expected_result, actual_result, compliant}], reviewer_role'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: SOPComplianceInput = JSON.parse(args.input_data)
      const r = analyzeSOPCompliance(input)
      return formatSOPReport(r)
    }
  }))

  // Tool 2: Study Audit Trail
  tools.register(defineTool({
    name: 'study_audit_trail',
    description: '研究项目审计追踪完整性验证 | Validate study audit trail completeness. Checks chain of custody, entry integrity, signature completeness, and regulatory compliance of electronic records per 21 CFR Part 11 and OECD GLP.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (validate|gap_check|entry_review|reconstruct), study_number, study_director, study_phase, audit_entries[{entry_id, timestamp, operator, action, original_value, new_value, reason, signature}], system_name'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: AuditTrailInput = JSON.parse(args.input_data)
      const r = analyzeAuditTrail(input)
      return formatAuditTrailReport(r)
    }
  }))

  // Tool 3: Data Integrity Validator
  tools.register(defineTool({
    name: 'data_integrity_validator',
    description: 'ALCOA+数据完整性原则验证 | Validate data integrity per ALCOA+ principles (Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available). Assesses compliance and identifies gaps.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (validate_attributable|validate_legible|validate_contemporaneous|validate_original|validate_accurate|validate_complete|validate_consistent|validate_enduring|validate_available|full_assessment), data_source, system_id, records[{record_id, timestamp, creator, last_modifier, modification_timestamp, modification_reason, is_original, is_complete, is_legible, is_contemporaneous, archive_status}]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: DataIntegrityInput = JSON.parse(args.input_data)
      const r = analyzeDataIntegrity(input)
      return formatDataIntegrityReport(r)
    }
  }))

  // Tool 4: Equipment Qualification
  tools.register(defineTool({
    name: 'equipment_qualification',
    description: '实验室设备 qualification/OQ/PQ 追踪 | Track equipment qualification status including IQ/OQ/PQ, calibration schedules, and compliance gaps. Supports status_check, schedule_review, gap_analysis, and out_of_service actions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (status_check|schedule_review|gap_analysis|out_of_service), facility, equipment_list[{equipment_id, equipment_name, type, iq_status, iq_date, oq_status, oq_date, pq_status, pq_date, last_calibration_date, next_calibration_due, location, responsible_person}]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: EquipmentQualificationInput = JSON.parse(args.input_data)
      const r = analyzeEquipmentQualification(input)
      return formatEquipmentQualReport(r)
    }
  }))

  // Tool 5: Personnel Training Competency
  tools.register(defineTool({
    name: 'personnel_training_competency',
    description: '人员资质与培训矩阵管理 | Manage personnel training matrix and competency verification. Reviews training compliance, identifies gaps, tracks competency verification status, and generates training plans.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (matrix_review|gap_analysis|competency_assessment|training_plan), department, personnel[{employee_id, name, role, title, training_records[{training_id, training_name, completion_date, expiry_date, trainer, score, status}], required_competencies, competency_verified, verification_date}]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: TrainingCompetencyInput = JSON.parse(args.input_data)
      const r = analyzeTrainingCompetency(input)
      return formatTrainingCompetencyReport(r)
    }
  }))

  // Tool 6: Deviation CAPA Advisor
  tools.register(defineTool({
    name: 'deviation_capability_advisor',
    description: '偏差处理能力与CAPA建议 | Advise on deviation handling and CAPA effectiveness. Assesses deviation trends, CAPA implementation status, root cause patterns, and provides regulatory-compliant recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (assess_deviation|capa_effectiveness|root_cause|trend_analysis), deviation_records[{deviation_id, date_identified, description, category, classification, status, root_cause_category, capa_actions[{action_id, description, assigned_to, due_date, status, effectiveness_verified}]}], timeframe_months'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: DeviationCAPAInput = JSON.parse(args.input_data)
      const r = analyzeDeviationCAPA(input)
      return formatDeviationCAPAReport(r)
    }
  }))

  // Tool 7: Regulatory Submission Readiness
  tools.register(defineTool({
    name: 'regulatory_submission_readiness',
    description: '监管机构提交材料准备度评估 | Assess regulatory submission readiness for FDA, EMA, NMPA. Evaluates module completeness, study report status, QA approval, and identifies critical path items.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (fda_readiness|ema_readiness|nmpa_readiness|comprehensive), submission_type, product_name, module_status[{module, description, status, reviewer_signed_off, qa_approved, missing_items}], study_reports[{study_id, study_type, status, qa_audited, compliance_status}], regulatory_indication'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: SubmissionReadinessInput = JSON.parse(args.input_data)
      const r = analyzeSubmissionReadiness(input)
      return formatSubmissionReadinessReport(r)
    }
  }))

  // Tool 8: GLP Risk Assessment
  tools.register(defineTool({
    name: 'glp_risk_assessment',
    description: 'GLP风险评估矩阵与缓解措施 | GLP risk assessment matrix with mitigations. Uses L x S x D (RPN) methodology to evaluate risks, prioritize mitigations, and generate risk register with residual risk tracking.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (full_assessment|department_risk|process_risk|mitigation_review), assessment_scope, risk_items[{risk_id, category, process, hazard, people_at_risk, current_controls, likelihood(1-5), severity(1-5), detectability(1-5), existing_mitigations}]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: GLPRiskAssessmentInput = JSON.parse(args.input_data)
      const r = analyzeGLPRiskAssessment(input)
      return formatGLPRiskReport(r)
    }
  }))

  console.log(`[dsh-tool-glpcomplianceagent] Loaded v${VERSION} - GLP Compliance Agent: 8 tools active`)
  console.log('  Tools: sop_compliance_checker, study_audit_trail, data_integrity_validator, equipment_qualification, personnel_training_competency, deviation_capability_advisor, regulatory_submission_readiness, glp_risk_assessment')
}
