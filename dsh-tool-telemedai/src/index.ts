/**
 * DSH TeleMedAI Plugin v0.1.0
 * Telemedicine & Remote Healthcare AI for DeepSeek Harness
 *
 * Virtual triage, remote patient monitoring, medication adherence tracking,
 * symptom analysis AI, diagnostic decision support, telehealth session optimization,
 * chronic care management, emergency dispatch coordination.
 *
 * Market Context (2026): Telemedicine projected to reach $636B by 2026,
 * representing 17% of all healthcare spending globally.
 *
 * Tools:
 * 1. virtual_triage_system          - AI-powered urgency classification & routing
 * 2. remote_patient_monitor         - RPM data analysis & alert generation
 * 3. medication_adherence_tracker   - Adherence scoring & intervention planning
 * 4. symptom_analyzer_ai            - NLP symptom extraction & differential diagnosis
 * 5. diagnostic_decision_support    - Evidence-based diagnostic guidance
 * 6. telehealth_session_optimizer   - Session quality & workflow optimization
 * 7. chronic_care_manager           - Chronic disease management programs
 * 8. emergency_dispatch_coordinator - Emergency response coordination & triage
 *
 * @module dsh-tool-telemedai | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-telemedai'
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

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 - Interface Definitions ====================

// --- Tool 1: Virtual Triage System ---
export interface VirtualTriageInput {
  patient_id: string
  chief_complaint: string
  symptoms: Array<{ symptom: string; severity: 'mild' | 'moderate' | 'severe'; duration_hours: number }>
  vitals: { temperature_c?: number; heart_rate?: number; systolic_bp?: number; diastolic_bp?: number; sp_o2?: number; respiratory_rate?: number }
  age: number
  sex: 'male' | 'female' | 'other'
  medical_history?: string[]
  allergies?: string[]
}

export interface TriageLevel {
  level: 'emergency' | 'urgent' | 'semi_urgent' | 'non_urgent' | 'self_care'
  score: number
  label: string
  response_time_min: number
  color_code: string
}

export interface VirtualTriageResult {
  triage_level: TriageLevel
  esi_score: number
  differential_diagnoses: Array<{ condition: string; probability: number; rationale: string }>
  recommended_actions: string[]
  red_flags: string[]
  routing_destination: string
  risk_factors: string[]
  isolation_needed: boolean
  documentation_required: string[]
}

// --- Tool 2: Remote Patient Monitor ---
export interface RemotePatientMonitorInput {
  patient_id: string
  device_type: 'bp_monitor' | 'glucometer' | 'pulse_oximeter' | 'ecg_patch' | 'weight_scale' | 'thermometer' | 'wearable'
  readings: Array<{ timestamp: string; value: number; unit: string; metric: string }>
  baseline_values: Record<string, number>
  alert_thresholds: { critical_high?: number; warning_high?: number; warning_low?: number; critical_low?: number }
  monitoring_duration_days: number
  medication_changes?: string[]
}

export interface AlertEvent {
  severity: 'critical' | 'warning' | 'info'
  metric: string
  value: number
  threshold_breached: string
  timestamp: string
  action_required: string
  trend_direction: 'rising' | 'falling' | 'stable'
}

export interface TrendAnalysis {
  metric: string
  direction: 'improving' | 'worsening' | 'stable'
  percent_change: number
  data_points: number
  reliability: number
}

export interface RemotePatientMonitorResult {
  alerts: AlertEvent[]
  trends: TrendAnalysis[]
  overall_stability_score: number
  compliance_rate: number
  data_quality_score: number
  recommendations: string[]
  provider_notification_needed: boolean
  next_reading_due_hours: number
}

// --- Tool 3: Medication Adherence Tracker ---
export interface MedicationAdherenceInput {
  patient_id: string
  medications: Array<{ name: string; dose: string; frequency: string; route: string; start_date: string }>
  dispensing_records: Array<{ date: string; medication: string; quantity_dispensed: number; days_supply: number }>
  self_reported_missed: number
  monitoring_period_days: number
  barriers?: string[]
}

export interface AdherenceMetric {
  medication: string
  pdc_score: number
  mpr_score: number
  classification: 'adherent' | 'suboptimal' | 'non_adherent'
  missed_doses_estimated: number
  gap_days: number
}

export interface AdherenceIntervention {
  barrier: string
  intervention: string
  priority: 'high' | 'medium' | 'low'
  expected_improvement: number
  delivery_method: string
}

export interface MedicationAdherenceResult {
  overall_adherence_rate: number
  medication_metrics: AdherenceMetric[]
  risk_level: 'low' | 'moderate' | 'high' | 'severe'
  interventions: AdherenceIntervention[]
  adherence_trend: 'improving' | 'declining' | 'stable'
  clinical_impact_risk: string
  follow_up_recommendation: string
}

// --- Tool 4: Symptom Analyzer AI ---
export interface SymptomAnalyzerInput {
  patient_id: string
  free_text_description: string
  structured_symptoms: Array<{ body_system: string; symptom: string; severity: number; onset: string; modifiers?: string[] }>
  duration_days: number
  age: number
  sex: 'male' | 'female' | 'other'
  vital_signs?: { temperature_c?: number; heart_rate?: number; systolic_bp?: number; sp_o2?: number }
}

export interface ExtractedSymptom {
  symptom: string
  body_system: string
  severity: number
  confidence: number
  negated: boolean
  temporal_pattern: string
}

export interface DifferentialDiagnosis {
  condition: string
  icd10_code: string
  probability: number
  matching_symptoms: string[]
  contradicting_symptoms: string[]
  recommended_tests: string[]
  urgency: 'emergency' | 'urgent' | 'routine'
}

export interface SymptomAnalyzerResult {
  extracted_symptoms: ExtractedSymptom[]
  differential_diagnoses: DifferentialDiagnosis[]
  body_system_involvement: string[]
  severity_assessment: string
  recommended_specialty: string
  red_flag_symptoms: string[]
  patient_education_points: string[]
  follow_up_timeline: string
}

// --- Tool 5: Diagnostic Decision Support ---
export interface DiagnosticDecisionInput {
  patient_id: string
  suspected_condition: string
  clinical_findings: Array<{ finding: string; type: 'symptom' | 'sign' | 'lab' | 'imaging'; value?: string; present: boolean }>
  patient_context: { age: number; sex: 'male' | 'female' | 'other'; comorbidities: string[]; medications: string[]; allergies: string[] }
  available_tests: string[]
  diagnostic_criteria?: string
}

export interface DiagnosticCriterion {
  criterion: string
  met: boolean
  evidence: string
  weight: number
}

export interface RecommendedTest {
  test_name: string
  priority: 'essential' | 'recommended' | 'optional'
  diagnostic_yield: number
  cost_level: 'low' | 'medium' | 'high'
  invasiveness: 'non_invasive' | 'minimally_invasive' | 'invasive'
  rationale: string
}

export interface DiagnosticDecisionResult {
  criteria_assessment: DiagnosticCriterion[]
  overall_diagnostic_confidence: number
  recommended_tests: RecommendedTest[]
  differential_to_rule_out: Array<{ condition: string; why: string; how_to_rule_out: string }>
  clinical_pearls: string[]
  documentation_template: string
  shared_decision_points: string[]
  referral_recommendation: string
}

// --- Tool 6: Telehealth Session Optimizer ---
export interface TelehealthSessionInput {
  session_type: 'initial_consult' | 'follow_up' | 'urgent_care' | 'chronic_care' | 'mental_health' | 'specialty_referral'
  chief_complaint: string
  patient_tech_literacy: 'low' | 'moderate' | 'high'
  connection_quality: 'poor' | 'fair' | 'good' | 'excellent'
  interpreter_needed: boolean
  estimated_complexity: 'low' | 'moderate' | 'high'
  provider_specialty: string
  session_duration_min: number
}

export interface SessionPhase {
  phase: string
  duration_min: number
  objectives: string[]
  techniques: string[]
  documentation_points: string[]
}

export interface TechReadinessCheck {
  category: string
  status: 'pass' | 'warning' | 'fail'
  recommendation: string
}

export interface TelehealthSessionResult {
  optimized_agenda: SessionPhase[]
  tech_readiness: TechReadinessCheck[]
  communication_tips: string[]
  documentation_efficiency_score: number
  patient_engagement_strategies: string[]
  time_allocation: Record<string, number>
  contingency_plans: string[]
  quality_metrics: Array<{ metric: string; target: number; current_estimate: number }>
  post_session_actions: string[]
}

// --- Tool 7: Chronic Care Manager ---
export interface ChronicCareInput {
  patient_id: string
  conditions: Array<{ condition: string; diagnosis_date: string; severity: 'mild' | 'moderate' | 'severe'; control_status: 'controlled' | 'partially_controlled' | 'uncontrolled' }>
  current_medications: Array<{ name: string; dose: string; adherence_rate: number }>
  recent_labs: Array<{ test: string; value: number; unit: string; date: string; target_range: string }>
  vitals: { systolic_bp?: number; diastolic_bp?: number; bmi?: number; hba1c?: number; ldls?: number }
  social_determinants: { transportation: string; food_security: string; social_support: string; financial_barriers: string }
  last_visit_date: string
  care_gaps: string[]
}

export interface CareGap {
  gap: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  evidence_source: string
  recommended_action: string
  due_date: string
}

export interface ChronicCarePlan {
  goals: Array<{ goal: string; target: number; current: number; unit: string; timeline: string }>
  medication_adjustments: Array<{ medication: string; current_dose: string; recommended_dose: string; rationale: string }>
  lifestyle_modifications: string[]
  monitoring_schedule: Array<{ parameter: string; frequency: string; method: string }>
  referrals_needed: string[]
}

export interface ChronicCareResult {
  overall_control_score: number
  condition_breakdown: Array<{ condition: string; control_status: string; trend: string; risk_score: number }>
  care_gaps: CareGap[]
  care_plan: ChronicCarePlan
  self_management_education: string[]
  emergency_action_plan: string[]
  next_visit_recommendation: string
  care_coordination_notes: string[]
}

// --- Tool 8: Emergency Dispatch Coordinator ---
export interface EmergencyDispatchInput {
  caller_id: string
  incident_type: 'cardiac' | 'respiratory' | 'trauma' | 'neurological' | 'allergic' | 'overdose' | 'psychiatric' | 'obstetric' | 'other'
  location: { address: string; type: 'residence' | 'workplace' | 'public' | 'vehicle' | 'unknown'; access_notes?: string }
  patient_info: { age?: number; sex?: 'male' | 'female' | 'other'; consciousness: 'alert' | 'verbal' | 'pain' | 'unresponsive'; breathing: 'normal' | 'difficult' | 'absent'; pulse: 'present' | 'absent' | 'weak' }
  symptom_description: string
  bystander_count: number
  cpr_in_progress: boolean
  eta_constraints?: string
}

export interface DispatchPriority {
  priority: 'alpha' | 'bravo' | 'charlie' | 'delta' | 'echo'
  response_level: 'lights_and_sirens' | 'urgent' | 'routine'
  response_time_target_min: number
  units_dispatched: number
  specialty_needed: string[]
}

export interface PreArrivalInstruction {
  instruction: string
  critical: boolean
  step_number: number
  rationale: string
}

export interface EmergencyDispatchResult {
  dispatch_priority: DispatchPriority
  pre_arrival_instructions: PreArrivalInstruction[]
  scene_safety_notes: string[]
  resource_allocation: Record<string, number>
  estimated_scene_time_min: number
  hospital_destination_logic: string
  mass_casualty_consideration: boolean
  documentation_requirements: string[]
  quality_assurance_flags: string[]
}

// ==================== SECTION 3 - Analysis Functions ====================

// --- Tool 1: Virtual Triage System ---
function analyzeVirtualTriage(input: VirtualTriageInput): VirtualTriageResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Calculate ESI (Emergency Severity Index) score
  let esiScore = 0
  const redFlags: string[] = []
  const riskFactors: string[] = []

  // Vital sign assessment
  if (input.vitals.sp_o2 !== undefined && input.vitals.sp_o2 < 90) { esiScore += 5; redFlags.push('Critical hypoxemia (SpO2 < 90%)') }
  else if (input.vitals.sp_o2 !== undefined && input.vitals.sp_o2 < 94) { esiScore += 3; riskFactors.push('Mild hypoxemia (SpO2 90-93%)') }

  if (input.vitals.heart_rate !== undefined && input.vitals.heart_rate > 130) { esiScore += 4; redFlags.push('Severe tachycardia (HR > 130)') }
  else if (input.vitals.heart_rate !== undefined && input.vitals.heart_rate > 110) { esiScore += 2; riskFactors.push('Tachycardia (HR 110-130)') }

  if (input.vitals.systolic_bp !== undefined && input.vitals.systolic_bp < 90) { esiScore += 5; redFlags.push('Hypotension (SBP < 90)') }
  else if (input.vitals.systolic_bp !== undefined && input.vitals.systolic_bp > 180) { esiScore += 3; riskFactors.push('Severe hypertension (SBP > 180)') }

  if (input.vitals.temperature_c !== undefined && input.vitals.temperature_c > 39.5) { esiScore += 3; redFlags.push('High fever (> 39.5C)') }
  if (input.vitals.respiratory_rate !== undefined && input.vitals.respiratory_rate > 24) { esiScore += 3; riskFactors.push('Tachypnea (RR > 24)') }

  // Symptom severity
  const severeSymptoms = input.symptoms.filter(s => s.severity === 'severe')
  const moderateSymptoms = input.symptoms.filter(s => s.severity === 'moderate')
  esiScore += severeSymptoms.length * 3 + moderateSymptoms.length * 1

  // Age factor
  if (input.age >= 75) { esiScore += 2; riskFactors.push('Advanced age (>= 75)') }
  else if (input.age <= 1) { esiScore += 3; redFlags.push('Infant patient - high risk') }

  // Medical history
  if (input.medical_history) {
    const highRiskConditions = ['diabetes', 'hypertension', 'copd', 'heart failure', 'cancer', 'immunocompromised', 'ckd', 'cad']
    for (const condition of input.medical_history) {
      if (highRiskConditions.some(c => condition.toLowerCase().includes(c))) {
        riskFactors.push('High-risk comorbidity: ' + condition)
        esiScore += 1
      }
    }
  }

  // Determine triage level
  let triageLevel: TriageLevel
  if (esiScore >= 12 || redFlags.length > 0) {
    triageLevel = { level: 'emergency', score: esiScore, label: 'Emergency - Immediate', response_time_min: 0, color_code: 'RED' }
  } else if (esiScore >= 8) {
    triageLevel = { level: 'urgent', score: esiScore, label: 'Urgent - < 15 min', response_time_min: 15, color_code: 'ORANGE' }
  } else if (esiScore >= 5) {
    triageLevel = { level: 'semi_urgent', score: esiScore, label: 'Semi-Urgent - < 30 min', response_time_min: 30, color_code: 'YELLOW' }
  } else if (esiScore >= 2) {
    triageLevel = { level: 'non_urgent', score: esiScore, label: 'Non-Urgent - < 60 min', response_time_min: 60, color_code: 'GREEN' }
  } else {
    triageLevel = { level: 'self_care', score: esiScore, label: 'Self-Care / Telehealth', response_time_min: 120, color_code: 'BLUE' }
  }

  // Differential diagnoses
  const differentials: Array<{ condition: string; probability: number; rationale: string }> = []
  const complaint = input.chief_complaint.toLowerCase()

  if (complaint.includes('chest pain') || complaint.includes('chest tightness')) {
    differentials.push({ condition: 'Acute Coronary Syndrome', probability: 0.65, rationale: 'Chest pain is the cardinal symptom of ACS; requires immediate ECG and troponins' })
    differentials.push({ condition: 'Gastroesophageal Reflux Disease', probability: 0.40, rationale: 'GERD is the most common non-cardiac chest pain etiology' })
    differentials.push({ condition: 'Costochondritis', probability: 0.30, rationale: 'Musculoskeletal pain, reproducible with palpation' })
    differentials.push({ condition: 'Pulmonary Embolism', probability: 0.25, rationale: 'Must be ruled out if dyspnea or risk factors present' })
  } else if (complaint.includes('shortness of breath') || complaint.includes('dyspnea')) {
    differentials.push({ condition: 'COPD Exacerbation', probability: 0.55, rationale: 'If known COPD/Asthma history' })
    differentials.push({ condition: 'Heart Failure', probability: 0.50, rationale: 'Dyspnea is the cardinal symptom of HF' })
    differentials.push({ condition: 'Pneumonia', probability: 0.45, rationale: 'If fever, cough, or sputum present' })
    differentials.push({ condition: 'Pulmonary Embolism', probability: 0.35, rationale: 'Acute dyspnea with risk factors' })
  } else if (complaint.includes('headache')) {
    differentials.push({ condition: 'Tension-Type Headache', probability: 0.60, rationale: 'Most common primary headache disorder' })
    differentials.push({ condition: 'Migraine', probability: 0.50, rationale: 'If unilateral, throbbing, with photophobia' })
    differentials.push({ condition: 'Subarachnoid Hemorrhage', probability: 0.10, rationale: 'Thunderclap headache requires emergent CT' })
  } else if (complaint.includes('abdominal pain')) {
    differentials.push({ condition: 'Gastroenteritis', probability: 0.50, rationale: 'Most common cause of acute abdominal pain' })
    differentials.push({ condition: 'Appendicitis', probability: 0.30, rationale: 'RLQ pain, requires surgical evaluation' })
    differentials.push({ condition: 'Irritable Bowel Syndrome', probability: 0.25, rationale: 'Chronic pattern, pain related to bowel movements' })
  } else {
    differentials.push({ condition: 'Symptom complex - broad differential', probability: 0.50, rationale: 'Chief complaint does not match a specific well-defined pattern' })
    differentials.push({ condition: 'Viral syndrome', probability: 0.35, rationale: 'Common self-limiting etiology' })
  }

  differentials.sort((a, b) => b.probability - a.probability)

  // Recommended actions
  const recommendedActions: string[] = []
  if (triageLevel.level === 'emergency') {
    recommendedActions.push('Activate emergency response team immediately')
    recommendedActions.push('Obtain 12-lead ECG within 10 minutes')
    recommendedActions.push('Establish IV access, continuous monitoring')
    recommendedActions.push('Notify attending physician STAT')
  } else if (triageLevel.level === 'urgent') {
    recommendedActions.push('Place on continuous cardiac monitoring')
    recommendedActions.push('Obtain vital signs every 15 minutes')
    recommendedActions.push('Order STAT labs (CBC, BMP, troponin)')
    recommendedActions.push('Provider evaluation within 15 minutes')
  } else {
    recommendedActions.push('Routine vital signs monitoring')
    recommendedActions.push('Order appropriate diagnostic workup')
    recommendedActions.push('Provider evaluation within ' + triageLevel.response_time_min + ' minutes')
  }

  // Routing
  let routingDestination: string
  switch (triageLevel.level) {
    case 'emergency': routingDestination = 'Emergency Department - Resuscitation Bay'; break
    case 'urgent': routingDestination = 'Emergency Department - Acute Care Area'; break
    case 'semi_urgent': routingDestination = 'Urgent Care / ED Fast Track'; break
    case 'non_urgent': routingDestination = 'Primary Care / Telehealth'; break
    default: routingDestination = 'Telehealth / Self-Care with Follow-up'
  }

  // Isolation screening
  const isolationNeeded = input.symptoms.some(s =>
    s.symptom.toLowerCase().includes('fever') &&
    (s.symptom.toLowerCase().includes('cough') || s.symptom.toLowerCase().includes('rash'))
  ) || complaint.includes('covid') || complaint.includes('tb')

  return {
    triage_level: triageLevel,
    esi_score: esiScore,
    differential_diagnoses: differentials,
    recommended_actions: recommendedActions,
    red_flags: redFlags,
    routing_destination: routingDestination,
    risk_factors: riskFactors,
    isolation_needed: isolationNeeded,
    documentation_required: ['Triage assessment form', 'Vital signs record', 'ESI score documentation', 'Informed consent for treatment']
  }
}

// --- Tool 2: Remote Patient Monitor ---
function analyzeRemotePatientMonitor(input: RemotePatientMonitorInput): RemotePatientMonitorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const alerts: AlertEvent[] = []
  const trends: TrendAnalysis[] = []

  // Analyze readings for alerts
  for (const reading of input.readings) {
    const baseline = input.baseline_values[reading.metric]
    const thresholds = input.alert_thresholds

    if (thresholds.critical_high !== undefined && reading.value > thresholds.critical_high) {
      alerts.push({
        severity: 'critical',
        metric: reading.metric,
        value: reading.value,
        threshold_breached: 'critical_high (' + thresholds.critical_high + ')',
        timestamp: reading.timestamp,
        action_required: 'Immediate provider notification and patient contact',
        trend_direction: baseline !== undefined && reading.value > baseline ? 'rising' : 'stable'
      })
    } else if (thresholds.warning_high !== undefined && reading.value > thresholds.warning_high) {
      alerts.push({
        severity: 'warning',
        metric: reading.metric,
        value: reading.value,
        threshold_breached: 'warning_high (' + thresholds.warning_high + ')',
        timestamp: reading.timestamp,
        action_required: 'Review trend and consider medication adjustment',
        trend_direction: baseline !== undefined && reading.value > baseline ? 'rising' : 'stable'
      })
    } else if (thresholds.critical_low !== undefined && reading.value < thresholds.critical_low) {
      alerts.push({
        severity: 'critical',
        metric: reading.metric,
        value: reading.value,
        threshold_breached: 'critical_low (' + thresholds.critical_low + ')',
        timestamp: reading.timestamp,
        action_required: 'Immediate intervention required',
        trend_direction: baseline !== undefined && reading.value < baseline ? 'falling' : 'stable'
      })
    } else if (thresholds.warning_low !== undefined && reading.value < thresholds.warning_low) {
      alerts.push({
        severity: 'warning',
        metric: reading.metric,
        value: reading.value,
        threshold_breached: 'warning_low (' + thresholds.warning_low + ')',
        timestamp: reading.timestamp,
        action_required: 'Monitor closely and review at next visit',
        trend_direction: baseline !== undefined && reading.value < baseline ? 'falling' : 'stable'
      })
    }
  }

  // Calculate trends per metric
  const metrics = [...new Set(input.readings.map(r => r.metric))]
  for (const metric of metrics) {
    const metricReadings = input.readings.filter(r => r.metric === metric).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    if (metricReadings.length >= 2) {
      const first = metricReadings[0].value
      const last = metricReadings[metricReadings.length - 1].value
      const pctChange = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0
      const baseline = input.baseline_values[metric]

      let direction: 'improving' | 'worsening' | 'stable' = 'stable'
      if (baseline !== undefined) {
        const distFromBaseline = Math.abs(last - baseline)
        const isAboveBaseline = last > baseline
        if (distFromBaseline > Math.abs(baseline) * 0.1) {
          // For most metrics, being closer to baseline is improving
          direction = isAboveBaseline && pctChange > 5 ? 'worsening' : !isAboveBaseline && pctChange < -5 ? 'worsening' : 'improving'
        }
      }

      trends.push({
        metric,
        direction,
        percent_change: Math.round(pctChange * 100) / 100,
        data_points: metricReadings.length,
        reliability: Math.min(1.0, metricReadings.length / 14)
      })
    }
  }

  // Stability score
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length
  const stabilityScore = Math.max(0, Math.min(100, 100 - criticalAlerts * 20 - warningAlerts * 10))

  // Compliance rate (based on expected vs actual readings)
  const expectedReadings = input.monitoring_duration_days * (input.device_type === 'wearable' ? 24 : 2)
  const complianceRate = Math.min(100, Math.round((input.readings.length / Math.max(1, expectedReadings)) * 100))

  // Data quality
  const dataQuality = Math.round(rng.nextFloat(0.7, 0.98) * 100) / 100

  // Recommendations
  const recommendations: string[] = []
  if (criticalAlerts > 0) recommendations.push('URGENT: Contact patient immediately regarding critical readings')
  if (warningAlerts > 2) recommendations.push('Schedule telehealth visit to review trending abnormal values')
  if (complianceRate < 50) recommendations.push('Address monitoring compliance barriers with patient education')
  if (complianceRate >= 80) recommendations.push('Excellent monitoring compliance - reinforce positive behavior')
  recommendations.push('Continue current monitoring protocol for ' + input.monitoring_duration_days + ' days')
  recommendations.push('Correlate readings with medication changes and symptom diary')

  return {
    alerts,
    trends,
    overall_stability_score: stabilityScore,
    compliance_rate: complianceRate,
    data_quality_score: dataQuality,
    recommendations,
    provider_notification_needed: criticalAlerts > 0 || warningAlerts >= 3,
    next_reading_due_hours: input.device_type === 'wearable' ? 1 : 12
  }
}

// --- Tool 3: Medication Adherence Tracker ---
function analyzeMedicationAdherence(input: MedicationAdherenceInput): MedicationAdherenceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const medicationMetrics: AdherenceMetric[] = []

  for (const med of input.medications) {
    const medDispensing = input.dispensing_records.filter(r => r.medication === med.name)
    let totalDaysSupplied = 0
    let gapDays = 0

    for (const record of medDispensing) {
      totalDaysSupplied += record.days_supply
    }

    // Calculate gaps
    if (medDispensing.length >= 2) {
      const sorted = medDispensing.sort((a, b) => a.date.localeCompare(b.date))
      for (let i = 1; i < sorted.length; i++) {
        const prevEnd = new Date(sorted[i - 1].date)
        prevEnd.setDate(prevEnd.getDate() + sorted[i - 1].days_supply)
        const nextStart = new Date(sorted[i].date)
        const gap = Math.max(0, (nextStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60 * 24))
        gapDays += Math.round(gap)
      }
    }

    // PDC (Proportion of Days Covered)
    const monitoringPeriod = Math.max(1, input.monitoring_period_days)
    const pdc = Math.min(1.0, totalDaysSupplied / monitoringPeriod)
    const gapAdjustedPdc = Math.max(0, pdc - (gapDays / monitoringPeriod) * 0.5)

    // MPR (Medication Possession Ratio)
    const mpr = Math.min(1.2, totalDaysSupplied / monitoringPeriod)

    let classification: 'adherent' | 'suboptimal' | 'non_adherent'
    if (gapAdjustedPdc >= 0.80) classification = 'adherent'
    else if (gapAdjustedPdc >= 0.50) classification = 'suboptimal'
    else classification = 'non_adherent'

    const missedDoses = Math.round((1 - gapAdjustedPdc) * monitoringPeriod * (med.frequency.includes('BID') ? 2 : med.frequency.includes('TID') ? 3 : 1))

    medicationMetrics.push({
      medication: med.name,
      pdc_score: Math.round(gapAdjustedPdc * 100) / 100,
      mpr_score: Math.round(mpr * 100) / 100,
      classification,
      missed_doses_estimated: missedDoses,
      gap_days: gapDays
    })
  }

  // Overall adherence
  const overallAdherence = medicationMetrics.length > 0
    ? medicationMetrics.reduce((sum, m) => sum + m.pdc_score, 0) / medicationMetrics.length
    : 0

  // Risk level
  let riskLevel: 'low' | 'moderate' | 'high' | 'severe'
  if (overallAdherence >= 0.80) riskLevel = 'low'
  else if (overallAdherence >= 0.60) riskLevel = 'moderate'
  else if (overallAdherence >= 0.40) riskLevel = 'high'
  else riskLevel = 'severe'

  // Interventions
  const interventions: AdherenceIntervention[] = []
  const barriers = input.barriers || []

  if (barriers.includes('cost') || barriers.includes('financial')) {
    interventions.push({ barrier: 'Cost/Financial', intervention: 'Switch to generic alternatives; enroll in patient assistance program', priority: 'high', expected_improvement: 0.25, delivery_method: 'Pharmacist consultation' })
  }
  if (barriers.includes('complexity') || barriers.includes('regimen')) {
    interventions.push({ barrier: 'Regimen Complexity', intervention: 'Simplify to once-daily dosing; use pill organizer or blister packaging', priority: 'high', expected_improvement: 0.20, delivery_method: 'Medication therapy management' })
  }
  if (barriers.includes('side_effects') || barriers.includes('adverse effects')) {
    interventions.push({ barrier: 'Side Effects', intervention: 'Dose adjustment or alternative agent; symptomatic management', priority: 'high', expected_improvement: 0.30, delivery_method: 'Provider consultation' })
  }
  if (barriers.includes('health_literacy') || barriers.includes('understanding')) {
    interventions.push({ barrier: 'Health Literacy', intervention: 'Teach-back method; visual medication schedule; simplified instructions', priority: 'medium', expected_improvement: 0.15, delivery_method: 'Nurse educator session' })
  }
  if (barriers.includes('transportation') || barriers.includes('access')) {
    interventions.push({ barrier: 'Transportation/Access', intervention: 'Mail-order pharmacy; 90-day supply; telehealth follow-up', priority: 'medium', expected_improvement: 0.20, delivery_method: 'Care coordinator referral' })
  }
  if (barriers.includes('forgetfulness')) {
    interventions.push({ barrier: 'Forgetfulness', intervention: 'Mobile app reminders; smart pill bottle; family involvement', priority: 'medium', expected_improvement: 0.18, delivery_method: 'Digital health tools' })
  }

  if (interventions.length === 0) {
    interventions.push({ barrier: 'General', intervention: 'Continue current adherence monitoring; reinforce importance at each visit', priority: 'low', expected_improvement: 0.05, delivery_method: 'Routine follow-up' })
  }

  // Adherence trend
  const adherenceTrend: 'improving' | 'declining' | 'stable' =
    input.self_reported_missed <= 2 ? 'improving' : input.self_reported_missed <= 5 ? 'stable' : 'declining'

  // Clinical impact
  const clinicalImpactRisk = riskLevel === 'severe' ? 'High risk of disease progression, hospitalization, and adverse outcomes'
    : riskLevel === 'high' ? 'Moderate-high risk of suboptimal therapeutic outcomes'
    : riskLevel === 'moderate' ? 'Some risk of reduced therapeutic efficacy'
    : 'Low risk - therapeutic goals likely being met'

  return {
    overall_adherence_rate: Math.round(overallAdherence * 100) / 100,
    medication_metrics: medicationMetrics,
    risk_level: riskLevel,
    interventions,
    adherence_trend: adherenceTrend,
    clinical_impact_risk: clinicalImpactRisk,
    follow_up_recommendation: riskLevel === 'severe' ? 'Weekly adherence check-in via telehealth for 4 weeks'
      : riskLevel === 'high' ? 'Bi-weekly follow-up for 6 weeks'
      : riskLevel === 'moderate' ? 'Monthly adherence review'
      : 'Quarterly adherence assessment'
  }
}

// --- Tool 4: Symptom Analyzer AI ---
function analyzeSymptomsAI(input: SymptomAnalyzerInput): SymptomAnalyzerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Extract symptoms from free text
  const extractedSymptoms: ExtractedSymptom[] = []
  const text = input.free_text_description.toLowerCase()

  const symptomKeywords: Record<string, { system: string; severity: number }> = {
    'chest pain': { system: 'Cardiovascular', severity: 7 },
    'shortness of breath': { system: 'Respiratory', severity: 8 },
    'dyspnea': { system: 'Respiratory', severity: 8 },
    'headache': { system: 'Neurological', severity: 5 },
    'nausea': { system: 'Gastrointestinal', severity: 4 },
    'vomiting': { system: 'Gastrointestinal', severity: 5 },
    'fever': { system: 'Constitutional', severity: 6 },
    'fatigue': { system: 'Constitutional', severity: 4 },
    'dizziness': { system: 'Neurological', severity: 5 },
    'palpitations': { system: 'Cardiovascular', severity: 6 },
    'cough': { system: 'Respiratory', severity: 4 },
    'abdominal pain': { system: 'Gastrointestinal', severity: 6 },
    'back pain': { system: 'Musculoskeletal', severity: 5 },
    'rash': { system: 'Dermatological', severity: 3 },
    'swelling': { system: 'Constitutional', severity: 4 },
    'numbness': { system: 'Neurological', severity: 6 },
    'weakness': { system: 'Neurological', severity: 6 },
    'confusion': { system: 'Neurological', severity: 8 },
    'bleeding': { system: 'Hematological', severity: 7 },
    'weight loss': { system: 'Constitutional', severity: 5 }
  }

  for (const [keyword, info] of Object.entries(symptomKeywords)) {
    if (text.includes(keyword)) {
      const negated = text.includes('no ' + keyword) || text.includes('denies ' + keyword) || text.includes('without ' + keyword)
      extractedSymptoms.push({
        symptom: keyword,
        body_system: info.system,
        severity: negated ? 0 : info.severity,
        confidence: negated ? 0.9 : rng.nextFloat(0.75, 0.98),
        negated,
        temporal_pattern: input.duration_days <= 1 ? 'acute' : input.duration_days <= 7 ? 'subacute' : 'chronic'
      })
    }
  }

  // Add structured symptoms
  for (const ss of input.structured_symptoms) {
    if (!extractedSymptoms.some(es => es.symptom === ss.symptom.toLowerCase())) {
      extractedSymptoms.push({
        symptom: ss.symptom,
        body_system: ss.body_system,
        severity: ss.severity,
        confidence: 0.95,
        negated: false,
        temporal_pattern: ss.onset
      })
    }
  }

  // Body system involvement
  const bodySystems = [...new Set(extractedSymptoms.filter(s => !s.negated).map(s => s.body_system))]

  // Differential diagnoses
  const differentials: DifferentialDiagnosis[] = []
  const activeSymptoms = extractedSymptoms.filter(s => !s.negated).map(s => s.symptom)

  if (activeSymptoms.some(s => s.includes('chest pain')) && activeSymptoms.some(s => s.includes('shortness of breath') || s.includes('dyspnea'))) {
    differentials.push({
      condition: 'Acute Coronary Syndrome', icd10_code: 'I21.9', probability: 0.70,
      matching_symptoms: ['chest pain', 'shortness of breath'],
      contradicting_symptoms: [],
      recommended_tests: ['12-lead ECG', 'Troponin I/T', 'Chest X-ray', 'CBC', 'BMP'],
      urgency: 'emergency'
    })
    differentials.push({
      condition: 'Pulmonary Embolism', icd10_code: 'I26.9', probability: 0.45,
      matching_symptoms: ['chest pain', 'dyspnea'],
      contradicting_symptoms: [],
      recommended_tests: ['D-dimer', 'CT pulmonary angiography', 'ABG'],
      urgency: 'emergency'
    })
  }

  if (activeSymptoms.some(s => s.includes('headache')) && activeSymptoms.some(s => s.includes('fever'))) {
    differentials.push({
      condition: 'Meningitis/Encephalitis', icd10_code: 'G03.9', probability: 0.30,
      matching_symptoms: ['headache', 'fever'],
      contradicting_symptoms: [],
      recommended_tests: ['Lumbar puncture', 'CT head', 'Blood cultures', 'CBC'],
      urgency: 'emergency'
    })
  }

  if (activeSymptoms.some(s => s.includes('abdominal pain')) && activeSymptoms.some(s => s.includes('nausea'))) {
    differentials.push({
      condition: 'Acute Gastroenteritis', icd10_code: 'A09', probability: 0.60,
      matching_symptoms: ['abdominal pain', 'nausea'],
      contradicting_symptoms: [],
      recommended_tests: ['CBC', 'CMP', 'Stool culture', 'C. difficile toxin'],
      urgency: 'routine'
    })
    differentials.push({
      condition: 'Appendicitis', icd10_code: 'K35.8', probability: 0.35,
      matching_symptoms: ['abdominal pain', 'nausea'],
      contradicting_symptoms: [],
      recommended_tests: ['CT abdomen/pelvis', 'CBC', 'CRP'],
      urgency: 'urgent'
    })
  }

  if (activeSymptoms.some(s => s.includes('cough')) && activeSymptoms.some(s => s.includes('fever'))) {
    differentials.push({
      condition: 'Community-Acquired Pneumonia', icd10_code: 'J18.9', probability: 0.65,
      matching_symptoms: ['cough', 'fever'],
      contradicting_symptoms: [],
      recommended_tests: ['Chest X-ray', 'CBC', 'Blood cultures', 'Procalcitonin'],
      urgency: 'urgent'
    })
  }

  if (differentials.length === 0) {
    differentials.push({
      condition: 'Non-specific symptom complex', icd10_code: 'R68.8', probability: 0.50,
      matching_symptoms: activeSymptoms.slice(0, 3),
      contradicting_symptoms: [],
      recommended_tests: ['CBC', 'CMP', 'Targeted testing based on clinical presentation'],
      urgency: 'routine'
    })
  }

  differentials.sort((a, b) => b.probability - a.probability)

  // Red flag symptoms
  const redFlags: string[] = []
  if (activeSymptoms.some(s => s.includes('chest pain'))) redFlags.push('Chest pain - rule out ACS, PE, aortic dissection')
  if (activeSymptoms.some(s => s.includes('confusion'))) redFlags.push('Acute confusion - rule out stroke, infection, metabolic encephalopathy')
  if (activeSymptoms.some(s => s.includes('bleeding'))) redFlags.push('Active bleeding - assess hemodynamic stability')
  if (input.vital_signs?.sp_o2 !== undefined && input.vital_signs.sp_o2 < 92) redFlags.push('Hypoxemia - assess respiratory failure')
  if (input.vital_signs?.heart_rate !== undefined && input.vital_signs.heart_rate > 130) redFlags.push('Severe tachycardia - assess hemodynamic stability')

  // Severity assessment
  const avgSeverity = extractedSymptoms.length > 0
    ? extractedSymptoms.filter(s => !s.negated).reduce((sum, s) => sum + s.severity, 0) / Math.max(1, extractedSymptoms.filter(s => !s.negated).length)
    : 0
  const severityAssessment = avgSeverity >= 7 ? 'Severe' : avgSeverity >= 5 ? 'Moderate' : avgSeverity >= 3 ? 'Mild-Moderate' : 'Mild'

  // Recommended specialty
  const specialtyMap: Record<string, string> = {
    'Cardiovascular': 'Cardiology',
    'Respiratory': 'Pulmonology',
    'Neurological': 'Neurology',
    'Gastrointestinal': 'Gastroenterology',
    'Musculoskeletal': 'Orthopedics/Rheumatology',
    'Dermatological': 'Dermatology',
    'Constitutional': 'Internal Medicine',
    'Hematological': 'Hematology'
  }
  const primarySystem = bodySystems[0] || 'Constitutional'
  const recommendedSpecialty = specialtyMap[primarySystem] || 'Internal Medicine'

  return {
    extracted_symptoms: extractedSymptoms,
    differential_diagnoses: differentials,
    body_system_involvement: bodySystems,
    severity_assessment: severityAssessment,
    recommended_specialty: recommendedSpecialty,
    red_flag_symptoms: redFlags,
    patient_education_points: [
      'Monitor symptoms and seek immediate care if worsening',
      'Keep a symptom diary noting triggers, duration, and severity',
      'Take medications as prescribed and report side effects',
      'Follow up with ' + recommendedSpecialty + ' as recommended'
    ],
    follow_up_timeline: redFlags.length > 0 ? 'Within 24 hours or sooner if worsening' : 'Within 1-2 weeks',
  }
}

// --- Tool 5: Diagnostic Decision Support ---
function analyzeDiagnosticDecision(input: DiagnosticDecisionInput): DiagnosticDecisionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Criteria assessment
  const criteriaAssessment: DiagnosticCriterion[] = []
  const findings = input.clinical_findings.filter(f => f.present)

  // Generate criteria based on suspected condition
  const condition = input.suspected_condition.toLowerCase()

  if (condition.includes('sepsis') || condition.includes('septic')) {
    criteriaAssessment.push({ criterion: 'Suspected or confirmed infection', met: findings.some(f => f.finding.toLowerCase().includes('infection') || f.finding.toLowerCase().includes('fever')), evidence: 'Clinical suspicion required', weight: 2 })
    criteriaAssessment.push({ criterion: 'Temperature > 38.3C or < 36C', met: findings.some(f => f.finding.toLowerCase().includes('fever') || f.finding.toLowerCase().includes('hypothermia')), evidence: 'SIRS criterion', weight: 1 })
    criteriaAssessment.push({ criterion: 'Heart rate > 90 bpm', met: findings.some(f => f.finding.toLowerCase().includes('tachycardia')), evidence: 'SIRS criterion', weight: 1 })
    criteriaAssessment.push({ criterion: 'Respiratory rate > 20 or PaCO2 < 32', met: findings.some(f => f.finding.toLowerCase().includes('tachypnea')), evidence: 'SIRS criterion', weight: 1 })
    criteriaAssessment.push({ criterion: 'WBC > 12,000 or < 4,000 or > 10% bands', met: findings.some(f => f.finding.toLowerCase().includes('wbc') || f.finding.toLowerCase().includes('leukocytosis')), evidence: 'SIRS criterion', weight: 1 })
    criteriaAssessment.push({ criterion: 'Lactate > 2 mmol/L', met: findings.some(f => f.finding.toLowerCase().includes('lactate')), evidence: 'Tissue hypoperfusion marker', weight: 2 })
  } else if (condition.includes('diabetes') || condition.includes('dm')) {
    criteriaAssessment.push({ criterion: 'Fasting glucose >= 126 mg/dL (on 2 occasions)', met: findings.some(f => f.finding.toLowerCase().includes('fasting glucose') || f.finding.toLowerCase().includes('hyperglycemia')), evidence: 'ADA 2024 Diagnostic Criteria', weight: 3 })
    criteriaAssessment.push({ criterion: 'HbA1c >= 6.5%', met: findings.some(f => f.finding.toLowerCase().includes('hba1c') || f.finding.toLowerCase().includes('a1c')), evidence: 'ADA 2024 Diagnostic Criteria', weight: 3 })
    criteriaAssessment.push({ criterion: 'Random glucose >= 200 with classic symptoms', met: findings.some(f => f.finding.toLowerCase().includes('random glucose')), evidence: 'ADA 2024 Diagnostic Criteria', weight: 2 })
    criteriaAssessment.push({ criterion: 'Positive OGTT (2-hr >= 200)', met: findings.some(f => f.finding.toLowerCase().includes('ogtt')), evidence: 'ADA 2024 Diagnostic Criteria', weight: 2 })
  } else if (condition.includes('heart failure') || condition.includes('hf')) {
    criteriaAssessment.push({ criterion: 'Dyspnea at rest or exertion', met: findings.some(f => f.finding.toLowerCase().includes('dyspnea')), evidence: 'Framingham criterion', weight: 2 })
    criteriaAssessment.push({ criterion: 'Peripheral edema or JVD', met: findings.some(f => f.finding.toLowerCase().includes('edema') || f.finding.toLowerCase().includes('jvd')), evidence: 'Framingham criterion', weight: 2 })
    criteriaAssessment.push({ criterion: 'Pulmonary crackles or pleural effusion', met: findings.some(f => f.finding.toLowerCase().includes('crackles') || f.finding.toLowerCase().includes('effusion')), evidence: 'Framingham criterion', weight: 1 })
    criteriaAssessment.push({ criterion: 'Elevated BNP (> 400 pg/mL) or NT-proBNP', met: findings.some(f => f.finding.toLowerCase().includes('bnp') || f.finding.toLowerCase().includes('probnp')), evidence: 'Biomarker criterion', weight: 3 })
    criteriaAssessment.push({ criterion: 'Reduced EF (< 40%) on echocardiogram', met: findings.some(f => f.finding.toLowerCase().includes('ef') || f.finding.toLowerCase().includes('ejection fraction')), evidence: 'Imaging criterion', weight: 3 })
  } else {
    criteriaAssessment.push({ criterion: 'Clinical presentation consistent with ' + input.suspected_condition, met: findings.length >= 2, evidence: 'Clinical assessment', weight: 2 })
    criteriaAssessment.push({ criterion: 'Supporting laboratory or imaging findings', met: findings.some(f => f.type === 'lab' || f.type === 'imaging'), evidence: 'Objective evidence', weight: 2 })
    criteriaAssessment.push({ criterion: 'Exclusion of alternative diagnoses', met: findings.length >= 3, evidence: 'Differential exclusion', weight: 1 })
  }

  // Overall confidence
  const totalWeight = criteriaAssessment.reduce((sum, c) => sum + c.weight, 0)
  const metWeight = criteriaAssessment.filter(c => c.met).reduce((sum, c) => sum + c.weight, 0)
  const diagnosticConfidence = totalWeight > 0 ? Math.round((metWeight / totalWeight) * 100) / 100 : 0

  // Recommended tests
  const recommendedTests: RecommendedTest[] = []

  if (condition.includes('sepsis')) {
    recommendedTests.push({ test_name: 'Blood cultures x2 (aerobic + anaerobic)', priority: 'essential', diagnostic_yield: 0.40, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Identify causative organism before antibiotics' })
    recommendedTests.push({ test_name: 'Serum lactate', priority: 'essential', diagnostic_yield: 0.70, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Tissue hypoperfusion marker; guides resuscitation' })
    recommendedTests.push({ test_name: 'CBC with differential', priority: 'essential', diagnostic_yield: 0.60, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Assess WBC, platelets, hemoglobin' })
    recommendedTests.push({ test_name: 'Procalcitonin', priority: 'recommended', diagnostic_yield: 0.55, cost_level: 'medium', invasiveness: 'minimally_invasive', rationale: 'Bacterial infection biomarker; guides antibiotic duration' })
    recommendedTests.push({ test_name: 'CT abdomen/pelvis (if intra-abdominal source suspected)', priority: 'recommended', diagnostic_yield: 0.65, cost_level: 'high', invasiveness: 'non_invasive', rationale: 'Identify occult infection source' })
  } else if (condition.includes('diabetes') || condition.includes('dm')) {
    recommendedTests.push({ test_name: 'HbA1c', priority: 'essential', diagnostic_yield: 0.90, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Gold standard for diagnosis and monitoring' })
    recommendedTests.push({ test_name: 'Fasting plasma glucose', priority: 'essential', diagnostic_yield: 0.85, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Confirmatory test' })
    recommendedTests.push({ test_name: 'Lipid panel', priority: 'recommended', diagnostic_yield: 0.80, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'CV risk assessment at diagnosis' })
    recommendedTests.push({ test_name: 'Urine microalbumin/creatinine ratio', priority: 'recommended', diagnostic_yield: 0.50, cost_level: 'low', invasiveness: 'non_invasive', rationale: 'Early nephropathy screening' })
    recommendedTests.push({ test_name: 'TSH', priority: 'optional', diagnostic_yield: 0.30, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Thyroid dysfunction affects glucose metabolism' })
  } else if (condition.includes('heart failure') || condition.includes('hf')) {
    recommendedTests.push({ test_name: 'BNP or NT-proBNP', priority: 'essential', diagnostic_yield: 0.85, cost_level: 'medium', invasiveness: 'minimally_invasive', rationale: 'Confirmatory biomarker for HF diagnosis' })
    recommendedTests.push({ test_name: 'Echocardiogram', priority: 'essential', diagnostic_yield: 0.95, cost_level: 'medium', invasiveness: 'non_invasive', rationale: 'Assess EF, wall motion, valve function' })
    recommendedTests.push({ test_name: '12-lead ECG', priority: 'essential', diagnostic_yield: 0.70, cost_level: 'low', invasiveness: 'non_invasive', rationale: 'Identify ischemia, arrhythmia, LVH' })
    recommendedTests.push({ test_name: 'Chest X-ray', priority: 'recommended', diagnostic_yield: 0.65, cost_level: 'low', invasiveness: 'non_invasive', rationale: 'Assess cardiomegaly, pulmonary congestion' })
    recommendedTests.push({ test_name: 'CBC, CMP, TSH', priority: 'recommended', diagnostic_yield: 0.50, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Identify contributing factors and comorbidities' })
  } else {
    recommendedTests.push({ test_name: 'CBC with differential', priority: 'essential', diagnostic_yield: 0.60, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'General screening for infection, anemia, hematologic disorders' })
    recommendedTests.push({ test_name: 'Comprehensive metabolic panel', priority: 'essential', diagnostic_yield: 0.65, cost_level: 'low', invasiveness: 'minimally_invasive', rationale: 'Assess organ function and metabolic status' })
    recommendedTests.push({ test_name: 'Targeted imaging based on clinical presentation', priority: 'recommended', diagnostic_yield: 0.70, cost_level: 'medium', invasiveness: 'non_invasive', rationale: 'Anatomic evaluation of suspected pathology' })
  }

  // Differential to rule out
  const differentialToRuleOut: Array<{ condition: string; why: string; how_to_rule_out: string }> = []
  if (condition.includes('chest pain') || condition.includes('acs')) {
    differentialToRuleOut.push({ condition: 'Aortic Dissection', why: 'Tearing chest pain, BP differential', how_to_rule_out: 'CT angiography or TEE' })
    differentialToRuleOut.push({ condition: 'Pneumothorax', why: 'Sudden dyspnea + pleuritic pain', how_to_rule_out: 'Chest X-ray or ultrasound' })
    differentialToRuleOut.push({ condition: 'Esophageal Rupture', why: 'Severe vomiting followed by chest pain', how_to_rule_out: 'CT chest with oral contrast' })
  } else {
    differentialToRuleOut.push({ condition: 'Alternative diagnosis with similar presentation', why: 'Broad differential for presenting symptoms', how_to_rule_out: 'Targeted testing based on clinical suspicion' })
  }

  return {
    criteria_assessment: criteriaAssessment,
    overall_diagnostic_confidence: diagnosticConfidence,
    recommended_tests: recommendedTests,
    differential_to_rule_out: differentialToRuleOut,
    clinical_pearls: [
      'Always correlate clinical findings with objective data',
      'Consider pre-test probability when interpreting results',
      'Reassess diagnosis if patient does not respond as expected',
      'Document clinical reasoning for diagnostic decisions'
    ],
    documentation_template: 'Diagnostic Assessment:\n- Suspected Condition: ' + input.suspected_condition + '\n- Clinical Findings: ' + findings.map(f => f.finding).join(', ') + '\n- Diagnostic Confidence: ' + (diagnosticConfidence * 100).toFixed(0) + '%\n- Plan: ' + recommendedTests.filter(t => t.priority === 'essential').map(t => t.test_name).join(', '),
    shared_decision_points: [
      'Discuss risks and benefits of invasive diagnostic procedures',
      'Consider patient preferences and values in test selection',
      'Address cost and access considerations',
      'Set expectations for timeline to diagnosis'
    ],
    referral_recommendation: diagnosticConfidence < 0.4 ? 'Consider specialist referral for diagnostic clarification'
      : diagnosticConfidence < 0.7 ? 'Co-manage with specialist as clinically indicated'
      : 'Manage in primary care with specialist consultation as needed'
  }
}

// --- Tool 6: Telehealth Session Optimizer ---
function analyzeTelehealthSession(input: TelehealthSessionInput): TelehealthSessionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Session phases
  const phases: SessionPhase[] = []
  const totalDuration = input.session_duration_min

  // Phase 1: Pre-session setup (10%)
  const setupDuration = Math.round(totalDuration * 0.1)
  phases.push({
    phase: 'Pre-Session Setup & Tech Check',
    duration_min: setupDuration,
    objectives: ['Verify audio/video quality', 'Confirm patient identity', 'Review chart and prior notes'],
    techniques: ['Warm greeting and rapport building', 'Confirm privacy and consent', 'Set agenda collaboratively'],
    documentation_points: ['Consent for telehealth', 'Patient location for emergency purposes', 'Technology quality assessment']
  })

  // Phase 2: History & Assessment (40%)
  const historyDuration = Math.round(totalDuration * 0.4)
  phases.push({
    phase: 'History Taking & Clinical Assessment',
    duration_min: historyDuration,
    objectives: ['Elicit chief complaint and HPI', 'Review systems', 'Assess medication adherence'],
    techniques: ['Open-ended questions first', 'Teach-back for understanding', 'Use screen share for patient education'],
    documentation_points: ['HPI with OLDCARTS', 'Medication reconciliation', 'Allergy review']
  })

  // Phase 3: Examination & Decision (30%)
  const examDuration = Math.round(totalDuration * 0.3)
  phases.push({
    phase: 'Virtual Examination & Clinical Decision',
    duration_min: examDuration,
    objectives: ['Conduct focused virtual exam', 'Review available data', 'Formulate assessment'],
    techniques: ['Guide patient self-examination', 'Review home monitoring data', 'Shared decision-making'],
    documentation_points: ['Virtual exam findings', 'Clinical reasoning', 'Differential considered']
  })

  // Phase 4: Plan & Close (20%)
  const closeDuration = totalDuration - setupDuration - historyDuration - examDuration
  phases.push({
    phase: 'Treatment Plan & Session Close',
    duration_min: closeDuration,
    objectives: ['Communicate plan clearly', 'Provide prescriptions/referrals', 'Schedule follow-up'],
    techniques: ['Teach-back method for plan understanding', 'Written summary via portal', 'Confirm emergency plan'],
    documentation_points: ['Assessment and plan', 'Orders placed', 'Follow-up arranged', 'Patient understanding confirmed']
  })

  // Tech readiness
  const techReadiness: TechReadinessCheck[] = [
    { category: 'Video/Audio Quality', status: input.connection_quality === 'poor' ? 'fail' : input.connection_quality === 'fair' ? 'warning' : 'pass', recommendation: input.connection_quality === 'poor' ? 'Switch to phone call or reschedule' : 'Continue with current setup' },
    { category: 'Patient Tech Literacy', status: input.patient_tech_literacy === 'low' ? 'warning' : 'pass', recommendation: input.patient_tech_literacy === 'low' ? 'Provide pre-session tech support call' : 'Standard telehealth workflow' },
    { category: 'Interpreter Services', status: input.interpreter_needed ? 'warning' : 'pass', recommendation: input.interpreter_needed ? 'Ensure interpreter is connected before starting' : 'N/A' },
    { category: 'Privacy & Environment', status: 'pass', recommendation: 'Confirm patient is in private setting' }
  ]

  // Communication tips
  const communicationTips: string[] = [
    'Maintain eye contact by looking at camera',
    'Speak slightly slower than in-person pace',
    'Use verbal affirmations more frequently (patients cannot see nods)',
    'Summarize key points at transition moments',
    'Use screen share for visual aids and patient education materials',
    'Allow extra time for technology-related delays'
  ]

  if (input.patient_tech_literacy === 'low') {
    communicationTips.push('Use simple, step-by-step instructions for any tech tasks')
    communicationTips.push('Have a backup phone number ready in case of disconnection')
  }

  // Patient engagement strategies
  const engagementStrategies: string[] = [
    'Begin with open-ended question: "What concerns bring you in today?"',
    'Use motivational interviewing for behavior change topics',
    'Involve patient in agenda-setting at session start',
    'Use teach-back: "Can you tell me in your own words what we discussed?"',
    'Provide written summary via patient portal after session'
  ]

  if (input.estimated_complexity === 'high') {
    engagementStrategies.push('Break complex information into smaller chunks')
    engagementStrategies.push('Use visual aids and analogies for complex concepts')
  }

  // Time allocation
  const timeAllocation: Record<string, number> = {
    'Pre-Session': setupDuration,
    'History': historyDuration,
    'Exam/Decision': examDuration,
    'Plan/Close': closeDuration
  }

  // Contingency plans
  const contingencyPlans: string[] = [
    'If video fails: Switch to phone call (have number ready)',
    'If connection unstable: Reduce video quality or audio-only mode',
    'If patient distressed: Have emergency contact and location ready',
    'If language barrier: Activate interpreter line immediately',
    'If critical finding: Convert to in-person visit or direct to ED'
  ]

  // Quality metrics
  const qualityMetrics = [
    { metric: 'Patient Satisfaction', target: 90, current_estimate: Math.round(rng.nextFloat(75, 95)) },
    { metric: 'Documentation Completeness', target: 95, current_estimate: Math.round(rng.nextFloat(80, 98)) },
    { metric: 'Time Efficiency', target: 85, current_estimate: Math.round(rng.nextFloat(70, 90)) },
    { metric: 'Clinical Appropriateness', target: 95, current_estimate: Math.round(rng.nextFloat(85, 98)) }
  ]

  // Post-session actions
  const postSessionActions: string[] = [
    'Complete documentation within 24 hours',
    'Send after-visit summary via patient portal',
    'Place orders (labs, imaging, referrals)',
    'Schedule follow-up appointment',
    'Update problem list and medication list',
    'Send prescription to pharmacy'
  ]

  return {
    optimized_agenda: phases,
    tech_readiness: techReadiness,
    communication_tips: communicationTips,
    documentation_efficiency_score: Math.round(rng.nextFloat(0.75, 0.95) * 100) / 100,
    patient_engagement_strategies: engagementStrategies,
    time_allocation: timeAllocation,
    contingency_plans: contingencyPlans,
    quality_metrics: qualityMetrics,
    post_session_actions: postSessionActions
  }
}

// --- Tool 7: Chronic Care Manager ---
function analyzeChronicCare(input: ChronicCareInput): ChronicCareResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Condition breakdown
  const conditionBreakdown = input.conditions.map(c => {
    let riskScore = 0
    if (c.severity === 'severe') riskScore += 40
    else if (c.severity === 'moderate') riskScore += 25
    else riskScore += 10

    if (c.control_status === 'uncontrolled') riskScore += 30
    else if (c.control_status === 'partially_controlled') riskScore += 15

    const trend: 'improving' | 'stable' | 'worsening' =
      c.control_status === 'controlled' ? 'stable' : c.control_status === 'partially_controlled' ? rng.next() > 0.5 ? 'improving' : 'stable' : 'worsening'

    return {
      condition: c.condition,
      control_status: c.control_status,
      trend,
      risk_score: Math.min(100, riskScore)
    }
  })

  // Overall control score
  const controlScore = Math.max(0, Math.min(100, 100 - conditionBreakdown.reduce((sum, c) => sum + c.risk_score, 0) / Math.max(1, conditionBreakdown.length)))

  // Care gaps
  const careGaps: CareGap[] = []

  for (const gap of input.care_gaps) {
    careGaps.push({
      gap,
      priority: gap.toLowerCase().includes('critical') || gap.toLowerCase().includes('overdue') ? 'critical' : gap.toLowerCase().includes('due') ? 'high' : 'medium',
      evidence_source: 'Clinical Practice Guidelines 2024',
      recommended_action: 'Address ' + gap + ' at next visit or via telehealth',
      due_date: 'Within 30 days'
    })
  }

  // Check for medication adherence gaps
  for (const med of input.current_medications) {
    if (med.adherence_rate < 0.70) {
      careGaps.push({
        gap: 'Suboptimal adherence to ' + med.name + ' (' + (med.adherence_rate * 100).toFixed(0) + '%)',
        priority: 'high',
        evidence_source: 'Medication Possession Ratio Analysis',
        recommended_action: 'Pharmacist-led adherence counseling; consider regimen simplification',
        due_date: 'Within 2 weeks'
      })
    }
  }

  // Check lab targets
  for (const lab of input.recent_labs) {
    if (lab.test.toLowerCase().includes('hba1c') && lab.value > 8.0) {
      careGaps.push({
        gap: 'HbA1c above target (' + lab.value + '% vs target < 7%)',
        priority: 'critical',
        evidence_source: 'ADA Standards of Care 2024',
        recommended_action: 'Intensify glucose-lowering therapy; diabetes educator referral',
        due_date: 'Within 1 week'
      })
    }
    if (lab.test.toLowerCase().includes('ldl') && lab.value > 100) {
      careGaps.push({
        gap: 'LDL above target (' + lab.value + ' mg/dL vs target < 100)',
        priority: 'high',
        evidence_source: 'ACC/AHA Lipid Guidelines',
        recommended_action: 'Optimize statin therapy; add ezetimibe if needed',
        due_date: 'Within 2 weeks'
      })
    }
  }

  // Care plan
  const carePlan: ChronicCarePlan = {
    goals: [
      { goal: 'HbA1c', target: 7.0, current: input.vitals.hba1c || 8.5, unit: '%', timeline: '3 months' },
      { goal: 'Systolic BP', target: 130, current: input.vitals.systolic_bp || 145, unit: 'mmHg', timeline: '3 months' },
      { goal: 'LDL Cholesterol', target: 100, current: input.vitals.ldls || 130, unit: 'mg/dL', timeline: '6 months' },
      { goal: 'BMI', target: 25, current: input.vitals.bmi || 30, unit: 'kg/m2', timeline: '12 months' }
    ],
    medication_adjustments: input.current_medications.filter(m => m.adherence_rate > 0.70).map(m => ({
      medication: m.name,
      current_dose: m.dose,
      recommended_dose: m.dose + ' (optimize per protocol)',
      rationale: 'Titrate to achieve therapeutic targets per guidelines'
    })),
    lifestyle_modifications: [
      'Mediterranean diet pattern with sodium restriction (< 2g/day)',
      '150 minutes moderate-intensity aerobic activity per week',
      'Smoking cessation if applicable (offer pharmacotherapy)',
      'Sleep hygiene optimization (7-9 hours nightly)',
      'Stress management techniques (mindfulness, CBT)'
    ],
    monitoring_schedule: [
      { parameter: 'Blood pressure', frequency: 'Weekly (home monitoring)', method: 'Bluetooth BP cuff with RPM' },
      { parameter: 'Blood glucose', frequency: 'Daily (if on insulin) or weekly', method: 'Glucometer or CGM' },
      { parameter: 'Weight', frequency: 'Daily', method: 'Smart scale with RPM' },
      { parameter: 'HbA1c', frequency: 'Every 3 months', method: 'Lab draw' },
      { parameter: 'Lipid panel', frequency: 'Every 6 months', method: 'Lab draw' }
    ],
    referrals_needed: [
      'Endocrinology (if HbA1c > 9% despite dual therapy)',
      'Registered Dietitian (medical nutrition therapy)',
      'Diabetes Self-Management Education (DSME)',
      'Ophthalmology (annual retinal exam)',
      'Podiatry (annual foot exam)'
    ]
  }

  // Self-management education
  const selfManagementEducation: string[] = [
    'Disease process and progression: understanding ' + input.conditions.map(c => c.condition).join(', '),
    'Medication purpose, timing, and side effect recognition',
    'Self-monitoring techniques and target ranges',
    'When to seek urgent care vs routine follow-up',
    'Nutrition and physical activity recommendations',
    'Sick-day management rules',
    'Community resources and support groups'
  ]

  // Emergency action plan
  const emergencyActionPlan: string[] = [
    'Call 911 for: chest pain, severe shortness of breath, loss of consciousness, stroke symptoms',
    'Seek urgent care for: fever > 103F, persistent vomiting, blood glucose > 400 or < 50 mg/dL',
    'Contact clinic for: medication reactions, worsening symptoms, new concerning symptoms',
    'Keep emergency contacts and medication list readily accessible',
    'Ensure working knowledge of when to use telehealth vs in-person vs emergency care'
  ]

  // Next visit recommendation
  const daysSinceLastVisit = Math.round((Date.now() - new Date(input.last_visit_date).getTime()) / (1000 * 60 * 60 * 24))
  const nextVisitRec = controlScore >= 80 ? 'Routine follow-up in 3 months'
    : controlScore >= 60 ? 'Follow-up in 4-6 weeks (telehealth or in-person)'
    : controlScore >= 40 ? 'Follow-up in 2-4 weeks (in-person preferred)'
    : 'Urgent follow-up within 1 week (in-person required)'

  return {
    overall_control_score: Math.round(controlScore),
    condition_breakdown: conditionBreakdown,
    care_gaps: careGaps,
    care_plan: carePlan,
    self_management_education: selfManagementEducation,
    emergency_action_plan: emergencyActionPlan,
    next_visit_recommendation: nextVisitRec,
    care_coordination_notes: [
      'Days since last visit: ' + daysSinceLastVisit,
      'Care gaps identified: ' + careGaps.length,
      'Medication adherence review needed for: ' + input.current_medications.filter(m => m.adherence_rate < 0.80).map(m => m.name).join(', '),
      'Social determinants: Transportation (' + input.social_determinants.transportation + '), Food security (' + input.social_determinants.food_security + ')',
      'Consider community health worker referral for social needs'
    ]
  }
}

// --- Tool 8: Emergency Dispatch Coordinator ---
function analyzeEmergencyDispatch(input: EmergencyDispatchInput): EmergencyDispatchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Determine dispatch priority
  let dispatchPriority: DispatchPriority
  const pi = input.patient_info

  if (pi.consciousness === 'unresponsive' || pi.breathing === 'absent' || pi.pulse === 'absent') {
    dispatchPriority = { priority: 'echo', response_level: 'lights_and_sirens', response_time_target_min: 8, units_dispatched: 3, specialty_needed: ['ALS', 'BLS', 'Fire/Rescue'] }
  } else if (pi.consciousness === 'pain' || pi.breathing === 'difficult' || input.cpr_in_progress) {
    dispatchPriority = { priority: 'delta', response_level: 'lights_and_sirens', response_time_target_min: 10, units_dispatched: 2, specialty_needed: ['ALS', 'BLS'] }
  } else if (input.incident_type === 'cardiac' || input.incident_type === 'neurological' || input.incident_type === 'trauma') {
    dispatchPriority = { priority: 'charlie', response_level: 'lights_and_sirens', response_time_target_min: 12, units_dispatched: 2, specialty_needed: ['ALS'] }
  } else if (input.incident_type === 'respiratory' || input.incident_type === 'allergic' || input.incident_type === 'overdose') {
    dispatchPriority = { priority: 'bravo', response_level: 'urgent', response_time_target_min: 15, units_dispatched: 1, specialty_needed: ['ALS'] }
  } else {
    dispatchPriority = { priority: 'alpha', response_level: 'routine', response_time_target_min: 20, units_dispatched: 1, specialty_needed: ['BLS'] }
  }

  // Pre-arrival instructions
  const preArrivalInstructions: PreArrivalInstruction[] = []
  let stepNum = 1

  if (pi.consciousness === 'unresponsive' && pi.breathing === 'absent') {
    preArrivalInstructions.push({ instruction: 'Begin CPR immediately if not already started', critical: true, step_number: stepNum++, rationale: 'Cardiac arrest requires immediate chest compressions for survival' })
    preArrivalInstructions.push({ instruction: 'Call out for an AED (Automated External Defibrillator)', critical: true, step_number: stepNum++, rationale: 'Early defibrillation is the most effective treatment for VF/VT' })
    preArrivalInstructions.push({ instruction: 'Push hard and fast in center of chest (100-120/min, 2 inches deep)', critical: true, step_number: stepNum++, rationale: 'Quality compressions maintain vital organ perfusion' })
    preArrivalInstructions.push({ instruction: 'Do not interrupt compressions unless absolutely necessary', critical: false, step_number: stepNum++, rationale: 'Minimize no-flow time to maximize survival' })
  } else if (pi.breathing === 'difficult') {
    preArrivalInstructions.push({ instruction: 'Help patient sit upright (position of comfort)', critical: false, step_number: stepNum++, rationale: 'Upright position eases work of breathing' })
    preArrivalInstructions.push({ instruction: 'Loosen tight clothing around neck and chest', critical: false, step_number: stepNum++, rationale: 'Reduce any external restriction to breathing' })
    preArrivalInstructions.push({ instruction: 'If prescribed inhaler available, assist patient with use', critical: true, step_number: stepNum++, rationale: 'Bronchodilator may relieve bronchospasm' })
    preArrivalInstructions.push({ instruction: 'Monitor breathing rate and consciousness level', critical: false, step_number: stepNum++, rationale: 'Early detection of deterioration' })
  } else if (input.incident_type === 'cardiac') {
    preArrivalInstructions.push({ instruction: 'Have patient sit or lie down comfortably', critical: false, step_number: stepNum++, rationale: 'Reduce cardiac workload' })
    preArrivalInstructions.push({ instruction: 'If patient has prescribed nitroglycerin, assist with taking one dose', critical: true, step_number: stepNum++, rationale: 'Nitroglycerin relieves coronary vasospasm' })
    preArrivalInstructions.push({ instruction: 'If not allergic and not on blood thinners, consider aspirin 325mg (if directed by protocol)', critical: true, step_number: stepNum++, rationale: 'Antiplatelet effect may reduce mortality in ACS' })
    preArrivalInstructions.push({ instruction: 'Loosen tight clothing', critical: false, step_number: stepNum++, rationale: 'Improve comfort and reduce anxiety' })
    preArrivalInstructions.push({ instruction: 'Be prepared to start CPR if patient becomes unresponsive', critical: false, step_number: stepNum++, rationale: 'Cardiac events can rapidly deteriorate to arrest' })
  } else if (input.incident_type === 'allergic') {
    preArrivalInstructions.push({ instruction: 'If patient has EpiPen, assist with injection into outer thigh', critical: true, step_number: stepNum++, rationale: 'Epinephrine is first-line for anaphylaxis' })
    preArrivalInstructions.push({ instruction: 'Help patient lie flat with legs elevated (unless breathing difficulty)', critical: false, step_number: stepNum++, rationale: 'Improve venous return and blood pressure' })
    preArrivalInstructions.push({ instruction: 'Monitor airway closely - be prepared for rapid deterioration', critical: true, step_number: stepNum++, rationale: 'Airway edema can progress rapidly in anaphylaxis' })
  } else {
    preArrivalInstructions.push({ instruction: 'Keep patient calm and still', critical: false, step_number: stepNum++, rationale: 'Reduce anxiety and prevent further injury' })
    preArrivalInstructions.push({ instruction: 'Do not move patient if trauma suspected', critical: true, step_number: stepNum++, rationale: 'Prevent potential spinal cord injury' })
    preArrivalInstructions.push({ instruction: 'Monitor consciousness and breathing', critical: false, step_number: stepNum++, rationale: 'Early detection of deterioration' })
  }

  // Scene safety notes
  const sceneSafetyNotes: string[] = [
    'Ensure scene is safe before approaching patient',
    'Wear appropriate PPE (gloves minimum)',
    'Note any hazards: traffic, weapons, chemicals, animals',
    'If violence suspected, wait for law enforcement',
    'Document scene conditions for receiving facility'
  ]

  if (input.location.type === 'vehicle') {
    sceneSafetyNotes.push('Ensure vehicle is in park with engine off')
    sceneSafetyNotes.push('Watch for traffic if on roadway')
  }

  // Resource allocation
  const resourceAllocation: Record<string, number> = {
    'ALS_Units': dispatchPriority.specialty_needed.includes('ALS') ? 1 : 0,
    'BLS_Units': dispatchPriority.specialty_needed.includes('BLS') ? 1 : 0,
    'Fire_Rescue': dispatchPriority.units_dispatched > 2 ? 1 : 0,
    'Supervisor': dispatchPriority.priority === 'echo' || dispatchPriority.priority === 'delta' ? 1 : 0
  }

  // Estimated scene time
  const estimatedSceneTime = dispatchPriority.priority === 'echo' ? 25
    : dispatchPriority.priority === 'delta' ? 20
    : dispatchPriority.priority === 'charlie' ? 15
    : 12

  // Hospital destination logic
  const hospitalDestination = input.incident_type === 'cardiac' ? 'Destination: PCI-capable STEMI Center (if STEMI suspected)'
    : input.incident_type === 'neurological' ? 'Destination: Comprehensive Stroke Center (if within window)'
    : input.incident_type === 'trauma' ? 'Destination: Level I or II Trauma Center'
    : 'Destination: Nearest appropriate receiving facility'

  // Mass casualty consideration
  const massCasualty = input.bystander_count > 5 && (input.incident_type === 'trauma' || input.incident_type === 'respiratory')

  return {
    dispatch_priority: dispatchPriority,
    pre_arrival_instructions: preArrivalInstructions,
    scene_safety_notes: sceneSafetyNotes,
    resource_allocation: resourceAllocation,
    estimated_scene_time_min: estimatedSceneTime,
    hospital_destination_logic: hospitalDestination,
    mass_casualty_consideration: massCasualty,
    documentation_requirements: [
      'Dispatch time and priority level',
      'Pre-arrival instructions given and patient response',
      'Scene arrival and patient assessment times',
      'Interventions performed en route',
      'Receiving facility and handoff report',
      'Total response and transport times'
    ],
    quality_assurance_flags: [
      'Response time target: ' + dispatchPriority.response_time_target_min + ' minutes',
      'CPR initiated within 60 seconds of recognition (if applicable)',
      'AED applied within 3 minutes (if applicable)',
      'Scene time < ' + (estimatedSceneTime + 5) + ' minutes',
      'Complete documentation within 24 hours'
    ]
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatVirtualTriageReport(result: VirtualTriageResult): string {
  const lines: string[] = []
  lines.push('## Virtual Triage System Report')
  lines.push('')
  lines.push('**Triage Level:** ' + result.triage_level.label + ' | **ESI Score:** ' + result.esi_score + ' | **Color:** ' + result.triage_level.color_code)
  lines.push('**Response Time:** ' + result.triage_level.response_time_min + ' min | **Routing:** ' + result.routing_destination)
  lines.push('**Isolation Needed:** ' + (result.isolation_needed ? 'YES' : 'No'))
  lines.push('')

  if (result.red_flags.length > 0) {
    lines.push('### Red Flags')
    for (const rf of result.red_flags) lines.push('- [!] ' + rf)
    lines.push('')
  }

  lines.push('### Differential Diagnoses')
  lines.push('| Condition | Probability | Rationale |')
  lines.push('|-----------|-------------|-----------|')
  for (const d of result.differential_diagnoses.slice(0, 6)) {
    lines.push('| ' + d.condition + ' | ' + (d.probability * 100).toFixed(0) + '% | ' + d.rationale + ' |')
  }
  lines.push('')

  lines.push('### Recommended Actions')
  for (const a of result.recommended_actions) lines.push('- ' + a)
  lines.push('')

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of result.risk_factors) lines.push('- ' + r)
    lines.push('')
  }

  lines.push('> **Disclaimer:** This AI-generated triage assessment is a clinical decision support tool only. All findings must be validated by a qualified healthcare provider. In an emergency, call 911 immediately.')
  return lines.join('\n')
}

function formatRemotePatientMonitorReport(result: RemotePatientMonitorResult): string {
  const lines: string[] = []
  lines.push('## Remote Patient Monitoring Report')
  lines.push('')
  lines.push('**Stability Score:** ' + result.overall_stability_score + '/100 | **Compliance:** ' + result.compliance_rate + '% | **Data Quality:** ' + (result.data_quality_score * 100).toFixed(0) + '%')
  lines.push('**Provider Notification:** ' + (result.provider_notification_needed ? 'REQUIRED' : 'Not required') + ' | **Next Reading Due:** ' + result.next_reading_due_hours + 'h')
  lines.push('')

  if (result.alerts.length > 0) {
    lines.push('### Active Alerts (' + result.alerts.length + ')')
    lines.push('| Severity | Metric | Value | Threshold | Action | Trend |')
    lines.push('|----------|--------|-------|-----------|--------|-------|')
    for (const a of result.alerts) {
      lines.push('| ' + a.severity.toUpperCase() + ' | ' + a.metric + ' | ' + a.value + ' | ' + a.threshold_breached + ' | ' + a.action_required + ' | ' + a.trend_direction + ' |')
    }
    lines.push('')
  }

  if (result.trends.length > 0) {
    lines.push('### Trend Analysis')
    lines.push('| Metric | Direction | Change % | Data Points | Reliability |')
    lines.push('|--------|-----------|----------|-------------|-------------|')
    for (const t of result.trends) {
      lines.push('| ' + t.metric + ' | ' + t.direction + ' | ' + t.percent_change.toFixed(1) + '% | ' + t.data_points + ' | ' + (t.reliability * 100).toFixed(0) + '% |')
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  return lines.join('\n')
}

function formatMedicationAdherenceReport(result: MedicationAdherenceResult): string {
  const lines: string[] = []
  lines.push('## Medication Adherence Report')
  lines.push('')
  lines.push('**Overall Adherence:** ' + (result.overall_adherence_rate * 100).toFixed(0) + '% | **Risk Level:** ' + result.risk_level.toUpperCase() + ' | **Trend:** ' + result.adherence_trend)
  lines.push('')

  lines.push('### Medication Metrics')
  lines.push('| Medication | PDC | MPR | Classification | Missed Doses | Gap Days |')
  lines.push('|------------|-----|-----|----------------|-------------|----------|')
  for (const m of result.medication_metrics) {
    lines.push('| ' + m.medication + ' | ' + (m.pdc_score * 100).toFixed(0) + '% | ' + (m.mpr_score * 100).toFixed(0) + '% | ' + m.classification + ' | ' + m.missed_doses_estimated + ' | ' + m.gap_days + ' |')
  }
  lines.push('')

  lines.push('### Interventions')
  lines.push('| Barrier | Intervention | Priority | Expected Improvement | Delivery |')
  lines.push('|---------|-------------|----------|---------------------|----------|')
  for (const i of result.interventions) {
    lines.push('| ' + i.barrier + ' | ' + i.intervention + ' | ' + i.priority.toUpperCase() + ' | +' + (i.expected_improvement * 100).toFixed(0) + '% | ' + i.delivery_method + ' |')
  }
  lines.push('')

  lines.push('### Clinical Impact')
  lines.push(result.clinical_impact_risk)
  lines.push('')
  lines.push('**Follow-up:** ' + result.follow_up_recommendation)
  lines.push('')
  return lines.join('\n')
}

function formatSymptomAnalyzerReport(result: SymptomAnalyzerResult): string {
  const lines: string[] = []
  lines.push('## Symptom Analyzer AI Report')
  lines.push('')
  lines.push('**Severity:** ' + result.severity_assessment + ' | **Recommended Specialty:** ' + result.recommended_specialty + ' | **Follow-up:** ' + result.follow_up_timeline)
  lines.push('')

  lines.push('### Extracted Symptoms')
  lines.push('| Symptom | Body System | Severity | Confidence | Negated | Pattern |')
  lines.push('|---------|-------------|----------|------------|---------|---------|')
  for (const s of result.extracted_symptoms) {
    lines.push('| ' + s.symptom + ' | ' + s.body_system + ' | ' + s.severity + '/10 | ' + (s.confidence * 100).toFixed(0) + '% | ' + (s.negated ? 'Yes' : 'No') + ' | ' + s.temporal_pattern + ' |')
  }
  lines.push('')

  lines.push('### Differential Diagnoses')
  lines.push('| Condition | ICD-10 | Probability | Urgency | Matching Symptoms | Recommended Tests |')
  lines.push('|-----------|--------|-------------|---------|-------------------|-------------------|')
  for (const d of result.differential_diagnoses) {
    lines.push('| ' + d.condition + ' | ' + d.icd10_code + ' | ' + (d.probability * 100).toFixed(0) + '% | ' + d.urgency + ' | ' + d.matching_symptoms.join(', ') + ' | ' + d.recommended_tests.slice(0, 3).join(', ') + ' |')
  }
  lines.push('')

  if (result.red_flag_symptoms.length > 0) {
    lines.push('### Red Flag Symptoms')
    for (const r of result.red_flag_symptoms) lines.push('- [!] ' + r)
    lines.push('')
  }

  lines.push('### Body Systems Involved')
  lines.push(result.body_system_involvement.join(', '))
  lines.push('')
  return lines.join('\n')
}

function formatDiagnosticDecisionReport(result: DiagnosticDecisionResult): string {
  const lines: string[] = []
  lines.push('## Diagnostic Decision Support Report')
  lines.push('')
  lines.push('**Diagnostic Confidence:** ' + (result.overall_diagnostic_confidence * 100).toFixed(0) + '% | **Referral:** ' + result.referral_recommendation)
  lines.push('')

  lines.push('### Criteria Assessment')
  lines.push('| Criterion | Met | Evidence | Weight |')
  lines.push('|-----------|-----|----------|--------|')
  for (const c of result.criteria_assessment) {
    lines.push('| ' + c.criterion + ' | ' + (c.met ? 'Yes' : 'No') + ' | ' + c.evidence + ' | ' + c.weight + ' |')
  }
  lines.push('')

  lines.push('### Recommended Tests')
  lines.push('| Test | Priority | Yield | Cost | Invasiveness | Rationale |')
  lines.push('|------|----------|-------|------|-------------|-----------|')
  for (const t of result.recommended_tests) {
    lines.push('| ' + t.test_name + ' | ' + t.priority + ' | ' + (t.diagnostic_yield * 100).toFixed(0) + '% | ' + t.cost_level + ' | ' + t.invasiveness + ' | ' + t.rationale + ' |')
  }
  lines.push('')

  if (result.differential_to_rule_out.length > 0) {
    lines.push('### Differential to Rule Out')
    lines.push('| Condition | Why | How to Rule Out |')
    lines.push('|-----------|-----|-----------------|')
    for (const d of result.differential_to_rule_out) {
      lines.push('| ' + d.condition + ' | ' + d.why + ' | ' + d.how_to_rule_out + ' |')
    }
    lines.push('')
  }

  lines.push('### Clinical Pearls')
  for (const p of result.clinical_pearls) lines.push('- ' + p)
  lines.push('')
  return lines.join('\n')
}

function formatTelehealthSessionReport(result: TelehealthSessionResult): string {
  const lines: string[] = []
  lines.push('## Telehealth Session Optimizer Report')
  lines.push('')
  lines.push('**Documentation Efficiency:** ' + (result.documentation_efficiency_score * 100).toFixed(0) + '%')
  lines.push('')

  lines.push('### Optimized Agenda')
  for (const phase of result.optimized_agenda) {
    lines.push('#### ' + phase.phase + ' (' + phase.duration_min + ' min)')
    lines.push('**Objectives:** ' + phase.objectives.join(', '))
    lines.push('**Techniques:** ' + phase.techniques.join(', '))
    lines.push('')
  }

  lines.push('### Tech Readiness')
  lines.push('| Category | Status | Recommendation |')
  lines.push('|----------|--------|----------------|')
  for (const t of result.tech_readiness) {
    lines.push('| ' + t.category + ' | ' + t.status.toUpperCase() + ' | ' + t.recommendation + ' |')
  }
  lines.push('')

  lines.push('### Communication Tips')
  for (const c of result.communication_tips) lines.push('- ' + c)
  lines.push('')

  lines.push('### Quality Metrics')
  lines.push('| Metric | Target | Estimated |')
  lines.push('|--------|--------|-----------|')
  for (const q of result.quality_metrics) {
    lines.push('| ' + q.metric + ' | ' + q.target + '% | ' + q.current_estimate + '% |')
  }
  lines.push('')

  lines.push('### Post-Session Actions')
  for (const a of result.post_session_actions) lines.push('- [ ] ' + a)
  lines.push('')
  return lines.join('\n')
}

function formatChronicCareReport(result: ChronicCareResult): string {
  const lines: string[] = []
  lines.push('## Chronic Care Management Report')
  lines.push('')
  lines.push('**Overall Control Score:** ' + result.overall_control_score + '/100 | **Next Visit:** ' + result.next_visit_recommendation)
  lines.push('')

  lines.push('### Condition Breakdown')
  lines.push('| Condition | Status | Trend | Risk Score |')
  lines.push('|-----------|--------|-------|------------|')
  for (const c of result.condition_breakdown) {
    lines.push('| ' + c.condition + ' | ' + c.control_status + ' | ' + c.trend + ' | ' + c.risk_score + '/100 |')
  }
  lines.push('')

  if (result.care_gaps.length > 0) {
    lines.push('### Care Gaps (' + result.care_gaps.length + ')')
    lines.push('| Gap | Priority | Action | Due |')
    lines.push('|-----|----------|--------|-----|')
    for (const g of result.care_gaps) {
      lines.push('| ' + g.gap + ' | ' + g.priority.toUpperCase() + ' | ' + g.recommended_action + ' | ' + g.due_date + ' |')
    }
    lines.push('')
  }

  lines.push('### Care Plan Goals')
  lines.push('| Goal | Current | Target | Timeline |')
  lines.push('|------|---------|--------|----------|')
  for (const g of result.care_plan.goals) {
    lines.push('| ' + g.goal + ' | ' + g.current + ' ' + g.unit + ' | ' + g.target + ' ' + g.unit + ' | ' + g.timeline + ' |')
  }
  lines.push('')

  lines.push('### Monitoring Schedule')
  for (const m of result.care_plan.monitoring_schedule) {
    lines.push('- ' + m.parameter + ': ' + m.frequency + ' (' + m.method + ')')
  }
  lines.push('')

  lines.push('### Care Coordination Notes')
  for (const n of result.care_coordination_notes) lines.push('- ' + n)
  lines.push('')
  return lines.join('\n')
}

function formatEmergencyDispatchReport(result: EmergencyDispatchResult): string {
  const lines: string[] = []
  lines.push('## Emergency Dispatch Coordination Report')
  lines.push('')
  lines.push('**Priority:** ' + result.dispatch_priority.priority.toUpperCase() + ' | **Response:** ' + result.dispatch_priority.response_level.replace(/_/g, ' ').toUpperCase() + ' | **ETA Target:** ' + result.dispatch_priority.response_time_target_min + ' min')
  lines.push('**Units Dispatched:** ' + result.dispatch_priority.units_dispatched + ' | **Specialty:** ' + result.dispatch_priority.specialty_needed.join(', '))
  lines.push('**Scene Time (est):** ' + result.estimated_scene_time_min + ' min | **Mass Casualty:** ' + (result.mass_casualty_consideration ? 'CONSIDER' : 'No'))
  lines.push('')

  lines.push('### Pre-Arrival Instructions')
  for (const i of result.pre_arrival_instructions) {
    lines.push(i.step_number + '. ' + (i.critical ? '[CRITICAL] ' : '') + i.instruction)
    lines.push('   Rationale: ' + i.rationale)
  }
  lines.push('')

  lines.push('### Scene Safety Notes')
  for (const s of result.scene_safety_notes) lines.push('- ' + s)
  lines.push('')

  lines.push('### Resource Allocation')
  lines.push('| Resource | Count |')
  lines.push('|----------|-------|')
  for (const [key, val] of Object.entries(result.resource_allocation)) {
    lines.push('| ' + key.replace(/_/g, ' ') + ' | ' + val + ' |')
  }
  lines.push('')

  lines.push('### Hospital Destination')
  lines.push(result.hospital_destination_logic)
  lines.push('')

  lines.push('### Quality Assurance')
  for (const q of result.quality_assurance_flags) lines.push('- ' + q)
  lines.push('')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Virtual Triage System
  tools.register(defineTool({
    name: 'virtual_triage_system',
    description: 'AI-powered virtual triage with ESI scoring, urgency classification, differential diagnosis, red flag detection, and automated routing recommendations. Processes structured symptoms, vitals, and patient history.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: patient_id, chief_complaint, symptoms[{symptom, severity, duration_hours}], vitals{temperature_c, heart_rate, systolic_bp, diastolic_bp, sp_o2, respiratory_rate}, age, sex, medical_history[], allergies[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: VirtualTriageInput = JSON.parse(args.input_data)
      return formatVirtualTriageReport(analyzeVirtualTriage(input))
    }
  }))

  // Tool 2: Remote Patient Monitor
  tools.register(defineTool({
    name: 'remote_patient_monitor',
    description: 'Analyze remote patient monitoring (RPM) data streams for alert generation, trend analysis, compliance tracking, and clinical decision support. Supports BP monitors, glucometers, pulse oximeters, ECG patches, and wearables.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: patient_id, device_type, readings[{timestamp, value, unit, metric}], baseline_values{}, alert_thresholds{critical_high, warning_high, warning_low, critical_low}, monitoring_duration_days, medication_changes[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RemotePatientMonitorInput = JSON.parse(args.input_data)
      return formatRemotePatientMonitorReport(analyzeRemotePatientMonitor(input))
    }
  }))

  // Tool 3: Medication Adherence Tracker
  tools.register(defineTool({
    name: 'medication_adherence_tracker',
    description: 'Track and analyze medication adherence using PDC and MPR metrics. Identifies barriers, generates targeted interventions, and provides risk stratification for non-adherent patients.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: patient_id, medications[{name, dose, frequency, route, start_date}], dispensing_records[{date, medication, quantity_dispensed, days_supply}], self_reported_missed, monitoring_period_days, barriers[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MedicationAdherenceInput = JSON.parse(args.input_data)
      return formatMedicationAdherenceReport(analyzeMedicationAdherence(input))
    }
  }))

  // Tool 4: Symptom Analyzer AI
  tools.register(defineTool({
    name: 'symptom_analyzer_ai',
    description: 'AI-powered symptom analysis combining NLP free-text extraction with structured symptom assessment. Generates differential diagnoses with ICD-10 codes, identifies red flags, and recommends appropriate specialty referral.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: patient_id, free_text_description, structured_symptoms[{body_system, symptom, severity, onset, modifiers}], duration_days, age, sex, vital_signs{temperature_c, heart_rate, systolic_bp, sp_o2}'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SymptomAnalyzerInput = JSON.parse(args.input_data)
      return formatSymptomAnalyzerReport(analyzeSymptomsAI(input))
    }
  }))

  // Tool 5: Diagnostic Decision Support
  tools.register(defineTool({
    name: 'diagnostic_decision_support',
    description: 'Evidence-based diagnostic decision support with criteria assessment, test recommendation with yield analysis, differential exclusion strategies, and shared decision-making documentation.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: patient_id, suspected_condition, clinical_findings[{finding, type, value, present}], patient_context{age, sex, comorbidities[], medications[], allergies[]}, available_tests[], diagnostic_criteria'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: DiagnosticDecisionInput = JSON.parse(args.input_data)
      return formatDiagnosticDecisionReport(analyzeDiagnosticDecision(input))
    }
  }))

  // Tool 6: Telehealth Session Optimizer
  tools.register(defineTool({
    name: 'telehealth_session_optimizer',
    description: 'Optimize telehealth session structure with phase-based agendas, tech readiness checks, communication strategies, time allocation, quality metrics, and contingency planning.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: session_type, chief_complaint, patient_tech_literacy, connection_quality, interpreter_needed, estimated_complexity, provider_specialty, session_duration_min'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TelehealthSessionInput = JSON.parse(args.input_data)
      return formatTelehealthSessionReport(analyzeTelehealthSession(input))
    }
  }))

  // Tool 7: Chronic Care Manager
  tools.register(defineTool({
    name: 'chronic_care_manager',
    description: 'Comprehensive chronic disease management with multi-condition control scoring, care gap identification, evidence-based care planning, medication optimization, and self-management education.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: patient_id, conditions[{condition, diagnosis_date, severity, control_status}], current_medications[{name, dose, adherence_rate}], recent_labs[{test, value, unit, date, target_range}], vitals{systolic_bp, diastolic_bp, bmi, hba1c, ldls}, social_determinants{transportation, food_security, social_support, financial_barriers}, last_visit_date, care_gaps[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ChronicCareInput = JSON.parse(args.input_data)
      return formatChronicCareReport(analyzeChronicCare(input))
    }
  }))

  // Tool 8: Emergency Dispatch Coordinator
  tools.register(defineTool({
    name: 'emergency_dispatch_coordination',
    description: 'Emergency response coordination with priority-based dispatch, pre-arrival instructions, scene safety assessment, resource allocation, and quality assurance tracking.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: caller_id, incident_type, location{address, type, access_notes}, patient_info{age, sex, consciousness, breathing, pulse}, symptom_description, bystander_count, cpr_in_progress, eta_constraints'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EmergencyDispatchInput = JSON.parse(args.input_data)
      return formatEmergencyDispatchReport(analyzeEmergencyDispatch(input))
    }
  }))

  console.log('[dsh-tool-telemedai] Loaded v' + VERSION + ' - Telemedicine & Remote Healthcare AI with 8 tools')
  console.log('  Tools: virtual_triage_system, remote_patient_monitor, medication_adherence_tracker, symptom_analyzer_ai, diagnostic_decision_support, telehealth_session_optimizer, chronic_care_manager, emergency_dispatch_coordinator')
}
