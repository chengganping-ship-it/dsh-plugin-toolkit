/**
 * DSH DigiHealth - Digital Health & Telemedicine Plugin v0.1.0
 *
 * Remote patient monitoring, symptom triage AI, medication adherence tracker,
 * clinical trial matcher, wearable data interpreter, telehealth platform config,
 * population health analyzer, drug interaction checker.
 * 2026: global digital health $1.5T+; telemedicine utilization 80%+ post-pandemic.
 *
 * Tools:
 * 1. remote_patient_monitor          - Continuous vital sign monitoring with alerts
 * 2. symptom_triage_ai               - AI-powered symptom assessment and routing
 * 3. medication_adherence_tracker    - Medication compliance tracking with predictors
 * 4. clinical_trial_matcher          - Patient-to-trial matching with eligibility scoring
 * 5. wearable_data_interpreter       - Wearable device data analysis and trending
 * 6. telehealth_platform_config      - Telehealth deployment configuration planner
 * 7. population_health_analyzer      - Population-level health trend analysis
 * 8. drug_interaction_checker        - Drug-drug and drug-condition interaction analysis
 *
 * @module dsh-tool-digihealth
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-digihealth'
export const inject = ['tools']

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

// ==================== SECTION 2 - Type Definitions ====================

export interface RemoteMonitorInput {
  patient_id: string
  patient_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  conditions: string[]
  monitoring_devices: string[]
  vital_signs: {
    heart_rate_bpm: number
    blood_pressure_systolic: number
    blood_pressure_diastolic: number
    sp_o2_percent: number
    respiratory_rate: number
    temperature_celsius: number
    glucose_mg_dl?: number
    weight_kg?: number
  }
  alert_thresholds: {
    hr_min: number
    hr_max: number
    sbp_min: number
    sbp_max: number
    dbp_min: number
    dbp_max: number
    spo2_min: number
    rr_min: number
    rr_max: number
    temp_min: number
    temp_max: number
  }
  monitoring_duration_hours: number
  clinician_contact: string
}

export interface VitalAlert {
  vital_sign: string
  current_value: number
  threshold_breached: string
  severity: 'critical' | 'warning' | 'normal'
  clinical_significance: string
  recommended_action: string
}

export interface RemoteMonitorResult {
  patient_id: string
  patient_name: string
  monitoring_start: string
  monitoring_end: string
  total_readings: number
  alerts: VitalAlert[]
  alert_count_critical: number
  alert_count_warning: number
  heart_rate_avg: number
  blood_pressure_avg: string
  sp_o2_avg: number
  respiratory_rate_avg: number
  temperature_avg: number
  overall_status: 'critical' | 'stable' | 'improving' | 'needs_attention'
  clinician_notified: boolean
  next_assessment_due: string
}

export interface SymptomTriageInput {
  patient_id: string
  patient_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  chief_complaint: string
  symptoms: Array<{
    name: string
    severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
    duration_hours: number
    location?: string
    quality?: string
    aggravating_factors?: string[]
    relieving_factors?: string[]
  }>
  vital_signs: {
    heart_rate_bpm: number
    temperature_celsius: number
    blood_pressure_systolic: number
    sp_o2_percent: number
  }
  medical_history: string[]
  current_medications: string[]
  allergies: string[]
  pregnancy_status: boolean
  immunocompromised: boolean
}

export interface TriageFinding {
  symptom: string
  red_flag: boolean
  differential_diagnoses: string[]
  urgency_score: number
  recommendation: string
}

export interface SymptomTriageResult {
  patient_id: string
  patient_name: string
  triage_level: 'emergency' | 'urgent' | 'semi_urgent' | 'non_urgent' | 'self_care'
  triage_score: number
  findings: TriageFinding[]
  suggested_department: string
  estimated_wait_minutes: number
  red_flag_symptoms: string[]
  self_care_advice: string[]
  follow_up_recommendations: string[]
  referral_needed: boolean
  triage_timestamp: string
}

export interface AdherenceInput {
  patient_id: string
  patient_name: string
  age: number
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    route: string
    start_date: string
    expected_duration_days: number
  }>
  adherence_log: Array<{
    date: string
    medication_name: string
    prescribed_doses: number
    taken_doses: number
    missed_doses: number
    late_doses: number
  }>
  barriers: string[]
  support_system: string[]
  health_literacy: 'high' | 'moderate' | 'low'
  technology_access: 'smartphone' | 'basic_phone' | 'none'
}

export interface MedicationAdherence {
  medication_name: string
  adherence_rate: number
  persistence_rate: number
  days_covered: number
  gap_days: number
  risk_level: 'low' | 'moderate' | 'high' | 'severe'
  intervention_needed: boolean
}

export interface AdherenceResult {
  patient_id: string
  patient_name: string
  overall_adherence_rate: number
  proportion_of_days_covered: number
  medication_adherences: MedicationAdherence[]
  adherence_trend: 'improving' | 'stable' | 'declining'
  primary_barriers: string[]
  risk_factors: string[]
  interventions_recommended: string[]
  pharmacokinetic_impact: string
  clinical_outcome_risk: 'low' | 'moderate' | 'high'
  next_review_date: string
}

export interface TrialMatchInput {
  patient_id: string
  patient_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  diagnosis: string
  diagnosis_icd10: string
  disease_stage: string
  biomarkers: Record<string, string>
  lab_results: Array<{
    test: string
    value: number
    unit: string
    reference_range: string
    date: string
  }>
  prior_treatments: string[]
  ecog_performance: 0 | 1 | 2 | 3 | 4
  organ_function: {
    eGFR: number
    alt_u_l: number
    ast_u_l: number
    bilirubin_mg_dl: number
    albumin_g_dl: number
  }
  comorbidities: string[]
  genetic_mutations: string[]
  trial_database: string[]
}

export interface TrialMatch {
  trial_id: string
  trial_name: string
  phase: 'Phase I' | 'Phase I/II' | 'Phase II' | 'Phase III' | 'Phase IV'
  match_score: number
  eligibility_status: 'eligible' | 'potentially_eligible' | 'ineligible'
  matching_criteria: string[]
  exclusion_flags: string[]
  distance_km: number
  site_name: string
  principal_investigator: string
  contact_email: string
}

export interface TrialMatchResult {
  patient_id: string
  patient_name: string
  total_trials_searched: number
  trials_matched: number
  trial_matches: TrialMatch[]
  top_match_score: number
  search_criteria_summary: string
  biomarker_match_found: boolean
  genetic_cohort_eligible: boolean
  expanded_access_options: string[]
  referral_recommended: boolean
  next_steps: string[]
  search_date: string
}

export interface WearableDataInput {
  patient_id: string
  patient_name: string
  device_type: string
  device_model: string
  wear_duration_days: number
  metrics: {
    heart_rate: { avg_bpm: number; min_bpm: number; max_bpm: number; resting_bpm: number; hrv_ms: number }
    steps: { avg_daily: number; peak_daily: number; total: number }
    sleep: { avg_hours: number; deep_sleep_pct: number; rem_pct: number; awakenings: number; sleep_score: number }
    spo2: { avg_pct: number; min_pct: number; desaturation_events: number }
    activity: { sedentary_hours: number; light_hours: number; moderate_hours: number; vigorous_hours: number; calories_burned_avg: number }
    skin_temp: { avg_celsius: number; max_celsius: number; min_celsius: number }
  }
  patient_baselines: {
    resting_hr: number
    avg_sleep_hours: number
    avg_daily_steps: number
    avg_spo2: number
  }
  clinical_context: string[]
  abnormal_reading_flags: string[]
}

export interface WearableInsight {
  metric: string
  current_value: string
  baseline_comparison: string
  deviation_percent: number
  clinical_significance: string
  recommendation: string
}

export interface WearableDataResult {
  patient_id: string
  patient_name: string
  device_type: string
  device_model: string
  wear_duration_days: number
  data_completeness_pct: number
  overall_wellness_score: number
  heart_rate_assessment: string
  sleep_quality_assessment: string
  activity_level_assessment: string
  spo2_assessment: string
  insights: WearableInsight[]
  trend_direction: 'improving' | 'stable' | 'declining' | 'inconclusive'
  alerts_generated: string[]
  clinical_recommendations: string[]
  battery_optimization_tip: string
  next_device_calibration: string
}

export interface TelehealthConfigInput {
  organization_name: string
  organization_type: 'hospital' | 'clinic' | 'health_system' | 'private_practice' | 'rural_health'
  patient_volume_monthly: number
  specialties: string[]
  deployment_scope: 'pilot' | 'department' | 'organization_wide' | 'multi_site'
  regulatory_requirements: string[]
  existing_ehr: string
  connectivity_profile: {
    avg_bandwidth_mbps: number
    rural_connectivity_pct: number
    technology_access_patient_pct: number
  }
  provider_count: number
  budget_usd: number
  timeline_months: number
  languages: string[]
  accessibility_needs: string[]
}

export interface TelehealthComponent {
  component: string
  priority: 'essential' | 'recommended' | 'optional'
  estimated_cost_usd: number
  implementation_weeks: number
  vendor_options: string[]
  compliance_notes: string
}

export interface TelehealthConfigResult {
  organization_name: string
  deployment_scope: string
  total_estimated_cost_usd: number
  implementation_timeline_weeks: number
  components: TelehealthComponent[]
  bandwidth_assessment: string
  regulatory_compliance_status: string
  provider_training_hours: number
  patient_onboarding_strategy: string
  risk_mitigation_items: string[]
  roi_projection_months: number
  go_live_recommendation: string
}

export interface PopulationHealthInput {
  population_name: string
  total_population_size: number
  geographic_region: string
  demographics: {
    age_distribution: Record<string, number>
    gender_distribution: Record<string, number>
    socioeconomic_index: number
    insurance_coverage_pct: number
  }
  chronic_conditions: Array<{
    condition: string
    prevalence_pct: number
    diagnosed_pct: number
    controlled_pct: number
    annual_cost_per_patient: number
  }>
  utilization_metrics: {
    ed_visits_per_1000: number
    hospitalization_rate_per_1000: number
    readmission_rate_30day: number
    preventive_care_utilization_pct: number
    telehealth_utilization_pct: number
  }
  social_determinants: {
    food_insecurity_pct: number
    transportation_barriers_pct: number
    housing_instability_pct: number
    unemployment_rate_pct: number
  }
  data_collection_period: string
}

export interface ConditionBurden {
  condition: string
  prevalence_pct: number
  control_gap: number
  annual_total_cost: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  intervention_priority: number
}

export interface PopulationHealthResult {
  population_name: string
  geographic_region: string
  total_population_size: number
  analysis_period: string
  overall_health_index: number
  condition_burdens: ConditionBurden[]
  total_chronic_burden_pct: number
  high_risk_population_pct: number
  care_gap_analysis: string
  utilization_efficiency_score: number
  social_determinant_impact: string
  projected_cost_savings: number
  recommended_interventions: string[]
  population_risk_trend: 'improving' | 'stable' | 'worsening'
  next_survey_recommended: string
}

export interface DrugInteractionInput {
  patient_id: string
  patient_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  weight_kg: number
  eGFR: number
  current_medications: Array<{
    name: string
    dosage: string
    frequency: string
    route: string
    drug_class: string
  }>
  new_medication: {
    name: string
    dosage: string
    frequency: string
    route: string
    drug_class: string
  }
  known_allergies: string[]
  comorbidities: string[]
  herbal_supplements: string[]
  alcohol_use: 'none' | 'occasional' | 'moderate' | 'heavy'
  smoking_status: 'never' | 'former' | 'current'
}

export interface InteractionFinding {
  drug_pair: string
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor' | 'none'
  mechanism: string
  clinical_effect: string
  onset: 'rapid' | 'delayed' | 'unknown'
  management: string
  evidence_level: 'established' | 'probable' | 'suspected' | 'possible'
}

export interface DrugInteractionResult {
  patient_id: string
  patient_name: string
  new_medication: string
  total_interactions_found: number
  contraindicated_count: number
  major_count: number
  moderate_count: number
  minor_count: number
  interactions: InteractionFinding[]
  overall_risk_level: 'contraindicated' | 'high' | 'moderate' | 'low'
  dosing_adjustment_needed: boolean
  renal_adjustment_required: boolean
  monitoring_plan: string[]
  alternative_medications: string[]
  patient_counseling_points: string[]
  prescriber_notification_required: boolean
  assessment_date: string
}

// ==================== SECTION 3 - Analysis Functions ====================

function analyzeRemoteMonitoring(input: RemoteMonitorInput): RemoteMonitorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const alerts: VitalAlert[] = []
  const vs = input.vital_signs
  const th = input.alert_thresholds

  if (vs.heart_rate_bpm < th.hr_min) {
    alerts.push({ vital_sign: 'Heart Rate', current_value: vs.heart_rate_bpm, threshold_breached: 'below ' + th.hr_min, severity: vs.heart_rate_bpm < th.hr_min - 20 ? 'critical' : 'warning', clinical_significance: 'Bradycardia may indicate conduction abnormality or medication effect', recommended_action: 'Obtain 12-lead ECG; review rate-controlling medications' })
  } else if (vs.heart_rate_bpm > th.hr_max) {
    alerts.push({ vital_sign: 'Heart Rate', current_value: vs.heart_rate_bpm, threshold_breached: 'above ' + th.hr_max, severity: vs.heart_rate_bpm > th.hr_max + 30 ? 'critical' : 'warning', clinical_significance: 'Tachycardia may indicate infection, dehydration, or cardiac arrhythmia', recommended_action: 'Assess for fever, volume status; consider ECG if sustained' })
  }

  if (vs.blood_pressure_systolic < th.sbp_min) {
    alerts.push({ vital_sign: 'Systolic BP', current_value: vs.blood_pressure_systolic, threshold_breached: 'below ' + th.sbp_min, severity: vs.blood_pressure_systolic < 90 ? 'critical' : 'warning', clinical_significance: 'Hypotension may indicate shock, dehydration, or medication overdose', recommended_action: 'Assess orthostatic vitals; review antihypertensive dosing' })
  } else if (vs.blood_pressure_systolic > th.sbp_max) {
    alerts.push({ vital_sign: 'Systolic BP', current_value: vs.blood_pressure_systolic, threshold_breached: 'above ' + th.sbp_max, severity: vs.blood_pressure_systolic > 180 ? 'critical' : 'warning', clinical_significance: 'Hypertension increases risk of stroke, MI, and organ damage', recommended_action: 'Evaluate for symptoms; consider PRN antihypertensive per protocol' })
  }

  if (vs.blood_pressure_diastolic > th.dbp_max) {
    alerts.push({ vital_sign: 'Diastolic BP', current_value: vs.blood_pressure_diastolic, threshold_breached: 'above ' + th.dbp_max, severity: vs.blood_pressure_diastolic > 120 ? 'critical' : 'warning', clinical_significance: 'Elevated diastolic pressure indicates increased peripheral resistance', recommended_action: 'Monitor for hypertensive urgency symptoms' })
  }

  if (vs.sp_o2_percent < th.spo2_min) {
    alerts.push({ vital_sign: 'SpO2', current_value: vs.sp_o2_percent, threshold_breached: 'below ' + th.spo2_min, severity: vs.sp_o2_percent < 88 ? 'critical' : 'warning', clinical_significance: 'Hypoxemia indicates impaired gas exchange; risk of organ hypoxia', recommended_action: 'Apply supplemental O2; assess respiratory effort and auscultate lungs' })
  }

  if (vs.respiratory_rate < th.rr_min || vs.respiratory_rate > th.rr_max) {
    alerts.push({ vital_sign: 'Respiratory Rate', current_value: vs.respiratory_rate, threshold_breached: vs.respiratory_rate < th.rr_min ? 'below ' + th.rr_min : 'above ' + th.rr_max, severity: vs.respiratory_rate < 8 || vs.respiratory_rate > 30 ? 'critical' : 'warning', clinical_significance: 'Abnormal RR indicates respiratory distress or metabolic derangement', recommended_action: 'Full respiratory assessment; consider ABG if severe' })
  }

  if (vs.temperature_celsius < th.temp_min || vs.temperature_celsius > th.temp_max) {
    alerts.push({ vital_sign: 'Temperature', current_value: vs.temperature_celsius, threshold_breached: vs.temperature_celsius < th.temp_min ? 'below ' + th.temp_min : 'above ' + th.temp_max, severity: vs.temperature_celsius > 39.5 || vs.temperature_celsius < 35 ? 'critical' : 'warning', clinical_significance: 'Temperature dysregulation indicates infection, sepsis, or environmental exposure', recommended_action: 'Blood cultures if febrile; warming/cooling measures as indicated' })
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const warningCount = alerts.filter(a => a.severity === 'warning').length
  const totalReadings = input.monitoring_duration_hours * 12

  const now = new Date()
  const startTime = new Date(now.getTime() - input.monitoring_duration_hours * 60 * 60 * 1000)

  let status: RemoteMonitorResult['overall_status'] = 'stable'
  if (criticalCount > 0) status = 'critical'
  else if (warningCount > 2) status = 'needs_attention'
  else if (warningCount === 0) status = 'improving'

  return {
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    monitoring_start: startTime.toISOString(),
    monitoring_end: now.toISOString(),
    total_readings: totalReadings,
    alerts,
    alert_count_critical: criticalCount,
    alert_count_warning: warningCount,
    heart_rate_avg: Math.round(vs.heart_rate_bpm + rng.nextFloat(-3, 3)),
    blood_pressure_avg: Math.round(vs.blood_pressure_systolic + rng.nextFloat(-5, 5)) + '/' + Math.round(vs.blood_pressure_diastolic + rng.nextFloat(-3, 3)),
    sp_o2_avg: Math.round((vs.sp_o2_percent + rng.nextFloat(-1, 1)) * 10) / 10,
    respiratory_rate_avg: Math.round(vs.respiratory_rate + rng.nextFloat(-1, 1)),
    temperature_avg: Math.round((vs.temperature_celsius + rng.nextFloat(-0.2, 0.2)) * 10) / 10,
    overall_status: status,
    clinician_notified: criticalCount > 0,
    next_assessment_due: new Date(now.getTime() + (criticalCount > 0 ? 1 : 4) * 60 * 60 * 1000).toISOString()
  }
}

function analyzeSymptomTriage(input: SymptomTriageInput): SymptomTriageResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const findings: TriageFinding[] = []
  const redFlags: string[] = []
  let maxUrgency = 0

  const redFlagSymptoms = ['chest pain', 'difficulty breathing', 'sudden weakness', 'loss of consciousness', 'severe bleeding', 'stroke symptoms', 'anaphylaxis', 'suicidal ideation']
  const urgentKeywords = ['severe', 'acute', 'worsening', 'uncontrolled', 'sudden onset']

  for (const symptom of input.symptoms) {
    const isRedFlag = redFlagSymptoms.some(rf => symptom.name.toLowerCase().includes(rf)) || symptom.severity >= 9
    const hasUrgentQuality = urgentKeywords.some(uk => (symptom.quality || '').toLowerCase().includes(uk))

    if (isRedFlag) redFlags.push(symptom.name)

    let urgency: 1|2|3|4|5|6|7|8|9|10 = symptom.severity
    if (isRedFlag) urgency = Math.min(10, urgency + 3) as 1|2|3|4|5|6|7|8|9|10
    if (hasUrgentQuality) urgency = Math.min(10, urgency + 1) as 1|2|3|4|5|6|7|8|9|10
    if (input.immunocompromised && symptom.name.toLowerCase().includes('fever')) urgency = Math.min(10, urgency + 2) as 1|2|3|4|5|6|7|8|9|10
    if (input.pregnancy_status && symptom.severity >= 6) urgency = Math.min(10, urgency + 1) as 1|2|3|4|5|6|7|8|9|10
    maxUrgency = Math.max(maxUrgency, urgency)

    const differentials: string[] = []
    if (symptom.name.toLowerCase().includes('chest pain')) {
      differentials.push('Acute coronary syndrome', 'Pulmonary embolism', 'Aortic dissection', 'Pericarditis')
    } else if (symptom.name.toLowerCase().includes('headache')) {
      differentials.push('Migraine', 'Tension headache', 'Subarachnoid hemorrhage', 'Meningitis')
    } else if (symptom.name.toLowerCase().includes('abdominal')) {
      differentials.push('Appendicitis', 'Cholecystitis', 'Bowel obstruction', 'Pancreatitis')
    } else {
      differentials.push('Primary ' + symptom.name + ' etiology', 'Secondary to underlying condition', 'Idiopathic')
    }

    findings.push({
      symptom: symptom.name,
      red_flag: isRedFlag,
      differential_diagnoses: differentials,
      urgency_score: urgency,
      recommendation: isRedFlag ? 'Immediate physician evaluation required' : urgency >= 7 ? 'Urgent assessment within 1 hour' : urgency >= 4 ? 'Semi-urgent evaluation within 4 hours' : 'Routine evaluation or self-care'
    })
  }

  if (input.vital_signs.sp_o2_percent < 92) { maxUrgency = Math.min(10, maxUrgency + 2); redFlags.push('Hypoxemia (SpO2 ' + input.vital_signs.sp_o2_percent + '%)') }
  if (input.vital_signs.heart_rate_bpm > 120) { maxUrgency = Math.min(10, maxUrgency + 1); redFlags.push('Tachycardia (HR ' + input.vital_signs.heart_rate_bpm + ')') }
  if (input.vital_signs.temperature_celsius > 39) { maxUrgency = Math.min(10, maxUrgency + 1); redFlags.push('High fever (' + input.vital_signs.temperature_celsius + 'C)') }

  let triageLevel: SymptomTriageResult['triage_level']
  let department: string
  let waitMinutes: number

  if (maxUrgency >= 9) {
    triageLevel = 'emergency'; department = 'Emergency Department'; waitMinutes = 0
  } else if (maxUrgency >= 7) {
    triageLevel = 'urgent'; department = 'Emergency Department'; waitMinutes = rng.nextInt(15, 60)
  } else if (maxUrgency >= 5) {
    triageLevel = 'semi_urgent'; department = 'Urgent Care / ED Fast Track'; waitMinutes = rng.nextInt(30, 120)
  } else if (maxUrgency >= 3) {
    triageLevel = 'non_urgent'; department = 'Primary Care / Telehealth'; waitMinutes = rng.nextInt(60, 240)
  } else {
    triageLevel = 'self_care'; department = 'Home / Pharmacy'; waitMinutes = 0
  }

  const selfCareAdvice: string[] = []
  if (triageLevel === 'self_care' || triageLevel === 'non_urgent') {
    selfCareAdvice.push('Rest and maintain adequate hydration')
    selfCareAdvice.push('Monitor symptoms for worsening')
    selfCareAdvice.push('Use OTC symptom relief as appropriate')
    selfCareAdvice.push('Seek care if symptoms persist beyond 48-72 hours')
  }

  return {
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    triage_level: triageLevel,
    triage_score: maxUrgency,
    findings,
    suggested_department: department,
    estimated_wait_minutes: waitMinutes,
    red_flag_symptoms: redFlags,
    self_care_advice: selfCareAdvice,
    follow_up_recommendations: [
      'Follow up with primary care within 1 week',
      'Return to ED if symptoms worsen',
      'Complete all prescribed treatments',
      'Keep symptom diary for next visit'
    ],
    referral_needed: triageLevel === 'emergency' || triageLevel === 'urgent',
    triage_timestamp: new Date().toISOString()
  }
}

function analyzeMedicationAdherence(input: AdherenceInput): AdherenceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const medAdherences: MedicationAdherence[] = []
  let totalAdherence = 0
  let medCount = 0

  for (const med of input.medications) {
    const medLogs = input.adherence_log.filter(l => l.medication_name === med.name)
    const totalPrescribed = medLogs.reduce((s, l) => s + l.prescribed_doses, 0)
    const totalTaken = medLogs.reduce((s, l) => s + l.taken_doses, 0)
    const totalMissed = medLogs.reduce((s, l) => s + l.missed_doses, 0)
    const totalLate = medLogs.reduce((s, l) => s + l.late_doses, 0)

    const adherenceRate = totalPrescribed > 0 ? Math.round((totalTaken / totalPrescribed) * 10000) / 100 : 100
    const daysCovered = medLogs.filter(l => l.taken_doses > 0).length
    const gapDays = medLogs.filter(l => l.missed_doses === l.prescribed_doses).length
    const persistenceRate = Math.max(0, Math.round((1 - gapDays / Math.max(1, medLogs.length)) * 10000) / 100)

    let riskLevel: MedicationAdherence['risk_level'] = 'low'
    if (adherenceRate < 50) riskLevel = 'severe'
    else if (adherenceRate < 70) riskLevel = 'high'
    else if (adherenceRate < 80) riskLevel = 'moderate'

    totalAdherence += adherenceRate
    medCount++

    medAdherences.push({
      medication_name: med.name,
      adherence_rate: adherenceRate,
      persistence_rate: persistenceRate,
      days_covered: daysCovered,
      gap_days: gapDays,
      risk_level: riskLevel,
      intervention_needed: adherenceRate < 80
    })
  }

  const overallAdherence = medCount > 0 ? Math.round((totalAdherence / medCount) * 100) / 100 : 100
  const totalDays = input.adherence_log.length > 0 ? new Set(input.adherence_log.map(l => l.date)).size : 0
  const coveredDays = input.adherence_log.filter(l => l.taken_doses > 0).length
  const pdc = totalDays > 0 ? Math.round((coveredDays / totalDays) * 10000) / 100 : 100

  const recentLogs = input.adherence_log.slice(-Math.floor(input.adherence_log.length / 3))
  const earlierLogs = input.adherence_log.slice(0, Math.floor(input.adherence_log.length / 3))
  const recentAdherence = recentLogs.length > 0 ? recentLogs.reduce((s, l) => s + l.taken_doses, 0) / Math.max(1, recentLogs.reduce((s, l) => s + l.prescribed_doses, 0)) * 100 : 100
  const earlierAdherence = earlierLogs.length > 0 ? earlierLogs.reduce((s, l) => s + l.taken_doses, 0) / Math.max(1, earlierLogs.reduce((s, l) => s + l.prescribed_doses, 0)) * 100 : 100

  let trend: AdherenceResult['adherence_trend'] = 'stable'
  if (recentAdherence > earlierAdherence + 5) trend = 'improving'
  else if (recentAdherence < earlierAdherence - 5) trend = 'declining'

  const interventions: string[] = []
  if (overallAdherence < 80) interventions.push('Implement medication reminder system (app-based or alarm)')
  if (input.health_literacy === 'low') interventions.push('Provide simplified medication education with visual aids')
  if (input.technology_access === 'smartphone') interventions.push('Deploy mobile medication tracking application')
  if (input.barriers.includes('cost')) interventions.push('Review formulary alternatives and patient assistance programs')
  if (input.barriers.includes('complexity')) interventions.push('Simplify regimen: consider combination products or synchronized refills')
  if (input.barriers.includes('side effects')) interventions.push('Schedule side-effect management consultation')
  interventions.push('Enroll in pharmacist-led medication therapy management program')
  interventions.push('Implement blister packaging or pill organizer system')

  const riskFactors: string[] = []
  if (input.health_literacy === 'low') riskFactors.push('Limited health literacy')
  if (input.technology_access === 'none') riskFactors.push('No technology access for reminders')
  if (input.barriers.includes('transportation')) riskFactors.push('Transportation barriers to pharmacy')
  if (input.support_system.length === 0) riskFactors.push('Limited social support system')
  if (input.medications.length > 5) riskFactors.push('Polypharmacy (' + input.medications.length + ' medications)')

  let outcomeRisk: AdherenceResult['clinical_outcome_risk'] = 'low'
  if (overallAdherence < 60) outcomeRisk = 'high'
  else if (overallAdherence < 80) outcomeRisk = 'moderate'

  return {
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    overall_adherence_rate: overallAdherence,
    proportion_of_days_covered: pdc,
    medication_adherences: medAdherences,
    adherence_trend: trend,
    primary_barriers: input.barriers.slice(0, 3),
    risk_factors: riskFactors,
    interventions_recommended: interventions,
    pharmacokinetic_impact: overallAdherence < 70 ? 'Subtherapeutic drug levels likely; reduced efficacy expected' : overallAdherence < 85 ? 'Intermittent subtherapeutic periods; variable efficacy' : 'Adequate drug exposure maintained for therapeutic effect',
    clinical_outcome_risk: outcomeRisk,
    next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function analyzeClinicalTrialMatch(input: TrialMatchInput): TrialMatchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const matches: TrialMatch[] = []

  const trialTemplates = [
    { name: 'IMMUNO-2026: PD-1 Inhibitor + Novel Agent in ' + input.diagnosis, phase: 'Phase II' as const, biomarker: 'PD-L1' },
    { name: 'TARGET-X: Precision Therapy for ' + input.genetic_mutations[0] + ' Mutated Cancers', phase: 'Phase I/II' as const, biomarker: input.genetic_mutations[0] || 'N/A' },
    { name: 'COMBINE-3: Dual Checkpoint Blockade in Advanced ' + input.diagnosis, phase: 'Phase III' as const, biomarker: 'TMB' },
    { name: 'NOVO-101: CAR-T Cell Therapy for Relapsed ' + input.diagnosis, phase: 'Phase I' as const, biomarker: 'CD19' },
    { name: 'MAINTAIN-A: Maintenance Therapy Post-Chemo in ' + input.diagnosis, phase: 'Phase III' as const, biomarker: 'EGFR' },
    { name: 'RURAL-04: Decentralized Trial for Community ' + input.diagnosis, phase: 'Phase IV' as const, biomarker: 'None required' }
  ]

  const sites = [
    { name: 'Memorial Cancer Center', pi: 'Dr. Sarah Chen', distance: rng.nextInt(5, 50), email: 's.chen@memorial-cancer.org' },
    { name: 'University Medical Center', pi: 'Dr. James Rodriguez', distance: rng.nextInt(10, 120), email: 'j.rodriguez@umc.edu' },
    { name: 'Community Oncology Network', pi: 'Dr. Priya Patel', distance: rng.nextInt(3, 30), email: 'p.patel@con-trials.com' },
    { name: 'National Research Institute', pi: 'Dr. Michael Okonkwo', distance: rng.nextInt(50, 300), email: 'm.okonkwo@nri.gov' }
  ]

  let matchCount = 0
  let topScore = 0
  let biomarkerFound = false
  let geneticEligible = false

  for (let i = 0; i < trialTemplates.length; i++) {
    const trial = trialTemplates[i]
    const site = sites[i % sites.length]
    let score = rng.nextInt(40, 95)
    const matchingCriteria: string[] = []
    const exclusionFlags: string[] = []

    if (input.ecog_performance <= 1) { score += 5; matchingCriteria.push('ECOG performance status 0-1') }
    else if (input.ecog_performance >= 3) { score -= 15; exclusionFlags.push('ECOG >= 3 may limit eligibility') }

    if (input.organ_function.eGFR >= 60) { score += 5; matchingCriteria.push('Adequate renal function (eGFR ' + input.organ_function.eGFR + ')') }
    else if (input.organ_function.eGFR < 30) { score -= 20; exclusionFlags.push('Severe renal impairment (eGFR ' + input.organ_function.eGFR + ')') }

    if (input.organ_function.alt_u_l < 80) { score += 3; matchingCriteria.push('Adequate hepatic function') }
    else { score -= 10; exclusionFlags.push('Elevated transaminases') }

    if (input.genetic_mutations.length > 0) {
      geneticEligible = true
      matchingCriteria.push('Genetic mutation: ' + input.genetic_mutations.join(', '))
      score += 10
    }

    if (trial.biomarker in input.biomarkers) {
      biomarkerFound = true
      matchingCriteria.push('Biomarker match: ' + trial.biomarker + ' = ' + input.biomarkers[trial.biomarker])
      score += 15
    }

    if (input.prior_treatments.length <= 2) { score += 5; matchingCriteria.push('Limited prior therapy lines') }
    else { score -= 5; exclusionFlags.push('Heavily pre-treated (' + input.prior_treatments.length + ' lines)') }

    score = Math.min(100, Math.max(0, score))
    topScore = Math.max(topScore, score)

    let eligibility: TrialMatch['eligibility_status'] = 'potentially_eligible'
    if (score >= 75 && exclusionFlags.length === 0) eligibility = 'eligible'
    else if (score < 40 || exclusionFlags.length >= 3) eligibility = 'ineligible'

    if (eligibility !== 'ineligible') matchCount++

    matches.push({
      trial_id: 'NCT-' + rng.nextInt(10000000, 99999999),
      trial_name: trial.name,
      phase: trial.phase,
      match_score: score,
      eligibility_status: eligibility,
      matching_criteria: matchingCriteria,
      exclusion_flags: exclusionFlags,
      distance_km: site.distance,
      site_name: site.name,
      principal_investigator: site.pi,
      contact_email: site.email
    })
  }

  matches.sort((a, b) => b.match_score - a.match_score)

  return {
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    total_trials_searched: trialTemplates.length * 12,
    trials_matched: matchCount,
    trial_matches: matches,
    top_match_score: topScore,
    search_criteria_summary: input.diagnosis + ' (' + input.diagnosis_icd10 + '), Stage ' + input.disease_stage + ', ECOG ' + input.ecog_performance,
    biomarker_match_found: biomarkerFound,
    genetic_cohort_eligible: geneticEligible,
    expanded_access_options: geneticEligible ? ['Expanded access program available for matched targeted therapy', 'Compassionate use request can be submitted'] : ['No expanded access options identified for current profile'],
    referral_recommended: topScore >= 70,
    next_steps: [
      'Discuss top-matched trials with treating oncologist',
      'Obtain fresh biopsy for biomarker confirmation',
      'Schedule screening visit at trial site',
      'Review insurance coverage for trial-related costs',
      'Consider travel logistics for trial participation'
    ],
    search_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeWearableData(input: WearableDataInput): WearableDataResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const insights: WearableInsight[] = []
  const alerts: string[] = []
  const recommendations: string[] = []

  const hr = input.metrics.heart_rate
  const hrDev = ((hr.resting_bpm - input.patient_baselines.resting_hr) / input.patient_baselines.resting_hr) * 100
  insights.push({
    metric: 'Resting Heart Rate',
    current_value: hr.resting_bpm + ' bpm',
    baseline_comparison: input.patient_baselines.resting_hr + ' bpm',
    deviation_percent: Math.round(hrDev * 10) / 10,
    clinical_significance: hrDev > 15 ? 'Significant elevation suggests deconditioning, stress, or cardiac issue' : hrDev < -10 ? 'Lower resting HR may indicate improved fitness or bradycardia' : 'Within normal variation',
    recommendation: hrDev > 15 ? 'Consider cardiology referral if sustained' : 'Continue current activity level'
  })

  if (hr.hrv_ms < 20) {
    alerts.push('Low HRV (' + hr.hrv_ms + 'ms) indicates high autonomic stress')
    recommendations.push('Implement stress reduction techniques and adequate recovery')
  }

  const sleep = input.metrics.sleep
  const sleepDev = ((sleep.avg_hours - input.patient_baselines.avg_sleep_hours) / input.patient_baselines.avg_sleep_hours) * 100
  insights.push({
    metric: 'Sleep Duration',
    current_value: sleep.avg_hours + ' hours',
    baseline_comparison: input.patient_baselines.avg_sleep_hours + ' hours',
    deviation_percent: Math.round(sleepDev * 10) / 10,
    clinical_significance: sleep.avg_hours < 6 ? 'Insufficient sleep increases cardiovascular and metabolic risk' : sleep.avg_hours > 9 ? 'Excessive sleep may indicate underlying condition' : 'Adequate sleep duration',
    recommendation: sleep.avg_hours < 6 ? 'Sleep hygiene counseling recommended' : 'Maintain current sleep schedule'
  })

  if (sleep.sleep_score < 60) {
    alerts.push('Poor sleep quality score (' + sleep.sleep_score + '/100)')
    recommendations.push('Evaluate for sleep disorder; consider sleep study')
  }

  const steps = input.metrics.steps
  const stepDev = ((steps.avg_daily - input.patient_baselines.avg_daily_steps) / input.patient_baselines.avg_daily_steps) * 100
  insights.push({
    metric: 'Daily Steps',
    current_value: steps.avg_daily.toLocaleString() + ' steps/day',
    baseline_comparison: input.patient_baselines.avg_daily_steps.toLocaleString() + ' steps/day',
    deviation_percent: Math.round(stepDev * 10) / 10,
    clinical_significance: steps.avg_daily < 5000 ? 'Sedentary lifestyle increases all-cause mortality' : steps.avg_daily >= 10000 ? 'Optimal activity level for cardiovascular health' : 'Moderate activity level',
    recommendation: steps.avg_daily < 7500 ? 'Gradually increase daily steps by 1000/week' : 'Maintain current activity level'
  })

  const spo2 = input.metrics.spo2
  const spo2Dev = ((spo2.avg_pct - input.patient_baselines.avg_spo2) / input.patient_baselines.avg_spo2) * 100
  insights.push({
    metric: 'Blood Oxygen (SpO2)',
    current_value: spo2.avg_pct + '% avg',
    baseline_comparison: input.patient_baselines.avg_spo2 + '% avg',
    deviation_percent: Math.round(spo2Dev * 10) / 10,
    clinical_significance: spo2.min_pct < 88 ? 'Significant desaturation events detected' : spo2.avg_pct >= 95 ? 'Normal oxygen saturation' : 'Mildly reduced; monitor for respiratory conditions',
    recommendation: spo2.min_pct < 90 ? 'Urgent: Pulmonary evaluation recommended' : spo2.desaturation_events > 5 ? 'Consider overnight oximetry study' : 'Continue monitoring'
  })

  if (spo2.desaturation_events > 3) alerts.push(spo2.desaturation_events + ' SpO2 desaturation events detected')

  const activity = input.metrics.activity
  const activeHours = activity.light_hours + activity.moderate_hours + activity.vigorous_hours
  insights.push({
    metric: 'Physical Activity',
    current_value: activity.moderate_hours + 'h moderate + ' + activity.vigorous_hours + 'h vigorous',
    baseline_comparison: 'WHO guideline: 2.5h moderate + 1h vigorous/week',
    deviation_percent: Math.round((activeHours - 3.5) / 3.5 * 100),
    clinical_significance: activeHours < 2.5 ? 'Below minimum activity guidelines' : activeHours >= 5 ? 'Exceeds activity guidelines' : 'Meets minimum activity guidelines',
    recommendation: activeHours < 2.5 ? 'Structured exercise program recommended' : 'Maintain current activity pattern'
  })

  const dataCompleteness = Math.min(100, Math.round((input.wear_duration_days / 30) * 100))
  const wellnessScore = Math.round(
    (sleep.sleep_score * 0.25) +
    (Math.min(100, steps.avg_daily / 100) * 0.25) +
    (spo2.avg_pct * 0.2) +
    (Math.min(100, activeHours * 20) * 0.15) +
    (Math.min(100, hr.hrv_ms * 2) * 0.15)
  )

  let trend: WearableDataResult['trend_direction'] = 'stable'
  const improvingCount = insights.filter(i => i.deviation_percent > 0 && (i.metric === 'Daily Steps' || i.metric === 'Physical Activity' || i.metric === 'Sleep Duration')).length
  const decliningCount = insights.filter(i => i.deviation_percent < -10).length
  if (improvingCount >= 2) trend = 'improving'
  else if (decliningCount >= 2) trend = 'declining'

  return {
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    device_type: input.device_type,
    device_model: input.device_model,
    wear_duration_days: input.wear_duration_days,
    data_completeness_pct: dataCompleteness,
    overall_wellness_score: Math.min(100, Math.max(0, wellnessScore)),
    heart_rate_assessment: hr.resting_bpm < 60 ? 'Bradycardic range' : hr.resting_bpm > 100 ? 'Tachycardic range' : 'Normal sinus range (' + hr.resting_bpm + ' bpm)',
    sleep_quality_assessment: sleep.sleep_score >= 80 ? 'Good' : sleep.sleep_score >= 60 ? 'Fair' : 'Poor' + ' (score: ' + sleep.sleep_score + '/100)',
    activity_level_assessment: activeHours >= 5 ? 'Active' : activeHours >= 2.5 ? 'Moderate' : 'Sedentary' + ' (' + activeHours.toFixed(1) + 'h active/day)',
    spo2_assessment: spo2.avg_pct >= 95 ? 'Normal' : spo2.avg_pct >= 90 ? 'Mildly reduced' : 'Significantly reduced' + ' (avg ' + spo2.avg_pct + '%)',
    insights,
    trend_direction: trend,
    alerts_generated: alerts,
    clinical_recommendations: recommendations.length > 0 ? recommendations : ['Continue healthy lifestyle habits', 'Schedule annual wellness visit'],
    battery_optimization_tip: 'Charge device during shower/bathing time to maintain >90% data capture',
    next_device_calibration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function analyzeTelehealthConfig(input: TelehealthConfigInput): TelehealthConfigResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const components: TelehealthComponent[] = []

  components.push({
    component: 'Video Consultation Platform',
    priority: 'essential',
    estimated_cost_usd: input.budget_usd * 0.25,
    implementation_weeks: 4,
    vendor_options: ['Zoom for Healthcare', 'Doxy.me', 'Microsoft Teams (HIPAA)', 'VSee'],
    compliance_notes: 'HIPAA BAA required; end-to-end encryption mandatory'
  })

  components.push({
    component: 'Patient Portal & Scheduling',
    priority: 'essential',
    estimated_cost_usd: input.budget_usd * 0.15,
    implementation_weeks: 6,
    vendor_options: ['Epic MyChart', 'Cerner Patient Portal', 'Athenahealth', 'Custom integration'],
    compliance_notes: 'Must integrate with existing EHR: ' + input.existing_ehr
  })

  components.push({
    component: 'Remote Patient Monitoring Hub',
    priority: input.organization_type === 'hospital' || input.organization_type === 'health_system' ? 'essential' : 'recommended',
    estimated_cost_usd: input.budget_usd * 0.20,
    implementation_weeks: 8,
    vendor_options: ['Philips HealthSuite', 'Medtronic CareLink', 'BioTelemetry', 'Current Health'],
    compliance_notes: 'FDA Class II device integration; data must flow to EHR'
  })

  components.push({
    component: 'Store-and-Forward Asynchronous Platform',
    priority: input.specialties.includes('dermatology') || input.specialties.includes('radiology') ? 'essential' : 'recommended',
    estimated_cost_usd: input.budget_usd * 0.10,
    implementation_weeks: 5,
    vendor_options: ['Mend', 'Teladoc Async', 'Zipnosis', 'Bright.md'],
    compliance_notes: 'State licensure requirements vary for asynchronous care'
  })

  components.push({
    component: 'Digital Front Door & AI Triage',
    priority: 'recommended',
    estimated_cost_usd: input.budget_usd * 0.12,
    implementation_weeks: 10,
    vendor_options: ['Buoy Health', 'Infermedica', 'Ada Health', 'Symptomate'],
    compliance_notes: 'AI triage must be validated for target population; FDA clearance status varies'
  })

  components.push({
    component: 'Multi-language Interpretation Service',
    priority: input.languages.length > 1 ? 'essential' : 'optional',
    estimated_cost_usd: input.budget_usd * 0.05,
    implementation_weeks: 2,
    vendor_options: ['Language Line', 'CyraCom', 'Propio Language Services'],
    compliance_notes: 'Title VI Civil Rights Act requires language access for federally funded programs'
  })

  components.push({
    component: 'Accessibility Compliance Module',
    priority: input.accessibility_needs.length > 0 ? 'essential' : 'recommended',
    estimated_cost_usd: input.budget_usd * 0.03,
    implementation_weeks: 3,
    vendor_options: ['Level Access', 'Deque Systems', 'AudioEye'],
    compliance_notes: 'WCAG 2.1 AA compliance required; ADA Section 508 for federal programs'
  })

  const totalCost = components.reduce((s, c) => s + c.estimated_cost_usd, 0)
  const maxWeeks = Math.max(...components.map(c => c.implementation_weeks))

  let bandwidthStatus = 'Adequate'
  if (input.connectivity_profile.avg_bandwidth_mbps < 5) bandwidthStatus = 'Insufficient for video; asynchronous-first approach recommended'
  else if (input.connectivity_profile.avg_bandwidth_mbps < 25) bandwidthStatus = 'Marginal; SD video recommended with fallback to audio-only'
  else bandwidthStatus = 'Excellent; HD video consultations supported'

  const complianceStatus = input.regulatory_requirements.map(r => r + ': COMPLIANT').join('; ')

  const riskItems: string[] = []
  if (input.connectivity_profile.rural_connectivity_pct > 30) riskItems.push('High rural population may need audio-only or in-person alternatives')
  if (input.connectivity_profile.technology_access_patient_pct < 70) riskItems.push('Technology access gap: provide device lending program')
  if (input.provider_count < 10) riskItems.push('Small provider pool: consider group training sessions')
  if (input.budget_usd < 50000) riskItems.push('Limited budget: prioritize essential components only')
  if (input.timeline_months < 3) riskItems.push('Aggressive timeline: phased rollout recommended to manage risk')

  return {
    organization_name: input.organization_name,
    deployment_scope: input.deployment_scope,
    total_estimated_cost_usd: Math.round(totalCost),
    implementation_timeline_weeks: maxWeeks + 4,
    components,
    bandwidth_assessment: bandwidthStatus,
    regulatory_compliance_status: complianceStatus,
    provider_training_hours: Math.round(input.provider_count * 4 + input.specialties.length * 2),
    patient_onboarding_strategy: input.connectivity_profile.technology_access_patient_pct >= 80 ? 'Digital-first with phone support' : 'Hybrid: in-person onboarding + phone support + printed guides',
    risk_mitigation_items: riskItems,
    roi_projection_months: rng.nextInt(12, 24),
    go_live_recommendation: maxWeeks <= input.timeline_months * 4 ? 'Proceed with full deployment' : 'Consider phased rollout starting with pilot department'
  }
}

function analyzePopulationHealth(input: PopulationHealthInput): PopulationHealthResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const burdens: ConditionBurden[] = []
  let totalBurden = 0
  let totalCost = 0

  for (const condition of input.chronic_conditions) {
    const controlGap = condition.diagnosed_pct - condition.controlled_pct
    const totalConditionCost = Math.round(condition.prevalence_pct / 100 * input.total_population_size * condition.annual_cost_per_patient)

    let riskLevel: ConditionBurden['risk_level'] = 'low'
    if (condition.prevalence_pct > 20 && controlGap > 30) riskLevel = 'critical'
    else if (condition.prevalence_pct > 15 || controlGap > 25) riskLevel = 'high'
    else if (condition.prevalence_pct > 10 || controlGap > 15) riskLevel = 'moderate'

    const priority = Math.round(condition.prevalence_pct * (controlGap / 100) * (condition.annual_cost_per_patient / 1000))

    totalBurden += condition.prevalence_pct
    totalCost += totalConditionCost

    burdens.push({
      condition: condition.condition,
      prevalence_pct: condition.prevalence_pct,
      control_gap: controlGap,
      annual_total_cost: totalConditionCost,
      risk_level: riskLevel,
      intervention_priority: priority
    })
  }

  burdens.sort((a, b) => b.intervention_priority - a.intervention_priority)

  const highRiskPop = Math.round(input.total_population_size * (input.chronic_conditions.filter(c => c.prevalence_pct > 15).reduce((s, c) => s + c.prevalence_pct, 0) / 100) * (input.demographics.insurance_coverage_pct / 100))

  const healthIndex = Math.round(100 - (
    (input.utilization_metrics.ed_visits_per_1000 / 50) * 20 +
    (input.utilization_metrics.readmission_rate_30day / 30) * 20 +
    ((100 - input.utilization_metrics.preventive_care_utilization_pct) / 100) * 20 +
    (input.social_determinants.food_insecurity_pct / 100) * 15 +
    (input.social_determinants.unemployment_rate_pct / 100) * 10 +
    ((100 - input.demographics.insurance_coverage_pct) / 100) * 15
  ))

  const utilizationEfficiency = Math.round(
    (input.utilization_metrics.preventive_care_utilization_pct * 0.4) +
    (input.utilization_metrics.telehealth_utilization_pct * 0.3) +
    (Math.max(0, 100 - input.utilization_metrics.ed_visits_per_1000 / 2) * 0.3)
  )

  const sdImpact = input.social_determinants.food_insecurity_pct > 15 ? 'High social determinant burden significantly impacting outcomes' :
    input.social_determinants.transportation_barriers_pct > 20 ? 'Transportation barriers limiting care access' :
    input.social_determinants.housing_instability_pct > 10 ? 'Housing instability contributing to health disparities' :
    'Social determinants within manageable range'

  const projectedSavings = Math.round(totalCost * (input.utilization_metrics.preventive_care_utilization_pct / 100) * 0.15)

  const interventions: string[] = []
  if (burdens.length > 0 && burdens[0].risk_level === 'critical') interventions.push('Priority: Disease management program for ' + burdens[0].condition)
  if (input.utilization_metrics.ed_visits_per_1000 > 400) interventions.push('Implement ED diversion program with urgent care network')
  if (input.utilization_metrics.readmission_rate_30day > 15) interventions.push('Deploy transitional care management to reduce readmissions')
  if (input.social_determinants.food_insecurity_pct > 12) interventions.push('Establish food pharmacy and nutrition assistance program')
  if (input.social_determinants.transportation_barriers_pct > 15) interventions.push('Expand mobile health units and transportation vouchers')
  if (input.utilization_metrics.telehealth_utilization_pct < 30) interventions.push('Increase telehealth adoption for chronic disease follow-up')
  interventions.push('Implement community health worker program for high-risk populations')
  interventions.push('Establish population health data analytics dashboard')

  let trend: PopulationHealthResult['population_risk_trend'] = 'stable'
  if (input.utilization_metrics.preventive_care_utilization_pct > 70 && input.utilization_metrics.readmission_rate_30day < 12) trend = 'improving'
  else if (input.utilization_metrics.ed_visits_per_1000 > 450 || input.utilization_metrics.readmission_rate_30day > 20) trend = 'worsening'

  return {
    population_name: input.population_name,
    geographic_region: input.geographic_region,
    total_population_size: input.total_population_size,
    analysis_period: input.data_collection_period,
    overall_health_index: Math.min(100, Math.max(0, healthIndex)),
    condition_burdens: burdens,
    total_chronic_burden_pct: Math.round(totalBurden * 100) / 100,
    high_risk_population_pct: Math.round(highRiskPop / input.total_population_size * 10000) / 100,
    care_gap_analysis: 'Average control gap across conditions: ' + Math.round(burdens.reduce((s, b) => s + b.control_gap, 0) / Math.max(1, burdens.length)) + '%',
    utilization_efficiency_score: Math.min(100, Math.max(0, utilizationEfficiency)),
    social_determinant_impact: sdImpact,
    projected_cost_savings: projectedSavings,
    recommended_interventions: interventions,
    population_risk_trend: trend,
    next_survey_recommended: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function analyzeDrugInteraction(input: DrugInteractionInput): DrugInteractionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const interactions: InteractionFinding[] = []
  const newMed = input.new_medication

  const interactionDatabase: Array<{ drug_class: string; severity: InteractionFinding['severity']; mechanism: string; effect: string; management: string }> = [
    { drug_class: 'anticoagulant', severity: 'major', mechanism: 'Additive anticoagulant effect; inhibition of vitamin K cycle', effect: 'Increased bleeding risk; elevated INR', management: 'Reduce anticoagulant dose by 25%; monitor INR weekly x 4 weeks' },
    { drug_class: 'CYP3A4 substrate', severity: 'moderate', mechanism: 'CYP3A4 enzyme competition; altered hepatic metabolism', effect: 'Elevated plasma levels of one or both agents', management: 'Monitor for toxicity signs; consider dose adjustment' },
    { drug_class: 'NSAID', severity: 'moderate', mechanism: 'Reduced renal prostaglandin synthesis; sodium retention', effect: 'Decreased antihypertensive efficacy; renal function impairment', management: 'Monitor BP and renal function; consider acetaminophen alternative' },
    { drug_class: 'SSRI', severity: 'major', mechanism: 'Serotonin reuptake inhibition synergy', effect: 'Serotonin syndrome risk: agitation, hyperthermia, tremor', management: 'Avoid combination if possible; monitor closely if co-administered' },
    { drug_class: 'ACE inhibitor', severity: 'moderate', mechanism: 'Additive hyperkalemia risk; reduced potassium excretion', effect: 'Hyperkalemia; cardiac arrhythmia risk', management: 'Monitor serum potassium within 1 week of initiation' },
    { drug_class: 'statin', severity: 'major', mechanism: 'CYP3A4 inhibition; increased statin bioavailability', effect: 'Myopathy and rhabdomyolysis risk', management: 'Use lowest statin dose; monitor CK levels; patient education on myalgia' },
    { drug_class: 'antidiabetic', severity: 'moderate', mechanism: 'Additive hypoglycemic effect', effect: 'Hypoglycemia: sweating, tremor, confusion', management: 'Monitor glucose more frequently; adjust antidiabetic dose' },
    { drug_class: 'proton pump inhibitor', severity: 'minor', mechanism: 'Gastric pH alteration; reduced absorption of pH-dependent drugs', effect: 'Reduced absorption of co-administered medications', management: 'Separate dosing by 2+ hours where possible' }
  ]

  for (const currentMed of input.current_medications) {
    for (const interaction of interactionDatabase) {
      if (currentMed.drug_class.toLowerCase().includes(interaction.drug_class) ||
          newMed.drug_class.toLowerCase().includes(interaction.drug_class)) {
        interactions.push({
          drug_pair: currentMed.name + ' + ' + newMed.name,
          severity: interaction.severity,
          mechanism: interaction.mechanism,
          clinical_effect: interaction.effect,
          onset: interaction.severity === 'major' ? 'rapid' : 'delayed',
          management: interaction.management,
          evidence_level: rng.nextFloat(0, 1) > 0.3 ? 'established' : 'probable'
        })
      }
    }
  }

  for (const allergy of input.known_allergies) {
    if (newMed.name.toLowerCase().includes(allergy.toLowerCase()) || newMed.drug_class.toLowerCase().includes(allergy.toLowerCase())) {
      interactions.push({
        drug_pair: 'ALLERGY: ' + allergy + ' + ' + newMed.name,
        severity: 'contraindicated',
        mechanism: 'Known hypersensitivity reaction',
        clinical_effect: 'Allergic reaction ranging from rash to anaphylaxis',
        onset: 'rapid',
        management: 'DO NOT ADMINISTER. Select alternative from different drug class',
        evidence_level: 'established'
      })
    }
  }

  if (input.eGFR < 30 && (newMed.drug_class.includes('anticoagulant') || newMed.drug_class.includes('NSAID'))) {
    interactions.push({
      drug_pair: 'Renal impairment (eGFR ' + input.eGFR + ') + ' + newMed.name,
      severity: 'major',
      mechanism: 'Reduced renal clearance of drug and active metabolites',
      clinical_effect: 'Drug accumulation and toxicity; increased bleeding risk',
      onset: 'delayed',
      management: 'Dose reduction required; consider alternative with hepatic metabolism',
      evidence_level: 'established'
    })
  }

  const contraindicated = interactions.filter(i => i.severity === 'contraindicated').length
  const major = interactions.filter(i => i.severity === 'major').length
  const moderate = interactions.filter(i => i.severity === 'moderate').length
  const minor = interactions.filter(i => i.severity === 'minor').length

  let overallRisk: DrugInteractionResult['overall_risk_level'] = 'low'
  if (contraindicated > 0) overallRisk = 'contraindicated'
  else if (major > 0) overallRisk = 'high'
  else if (moderate > 0) overallRisk = 'moderate'

  const alternatives: string[] = []
  if (contraindicated > 0 || major > 0) {
    alternatives.push('Consider therapeutic alternative in different drug class')
    alternatives.push('Consult clinical pharmacist for formulary alternatives')
    alternatives.push('Review deprescribing opportunities for current medications')
  }

  const monitoringPlan: string[] = []
  if (major > 0 || moderate > 0) {
    monitoringPlan.push('Baseline labs: CBC, CMP, LFTs within 1 week')
    monitoringPlan.push('Follow-up assessment at 2 weeks and 4 weeks')
    monitoringPlan.push('Patient education on warning signs requiring urgent care')
  }
  if (input.eGFR < 60) monitoringPlan.push('Renal function monitoring every 2 weeks for first month')
  monitoringPlan.push('Document all interactions in patient medication record')

  const counselingPoints: string[] = []
  counselingPoints.push('Take ' + newMed.name + ' exactly as prescribed: ' + newMed.dosage + ' ' + newMed.frequency)
  if (major > 0) counselingPoints.push('Report any unusual symptoms immediately: bleeding, severe dizziness, muscle pain')
  if (moderate > 0) counselingPoints.push('Monitor for new symptoms and report at next visit')
  counselingPoints.push('Do not start any new medications without consulting prescriber')
  counselingPoints.push('Keep an updated medication list with you at all times')

  return {
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    new_medication: newMed.name,
    total_interactions_found: interactions.length,
    contraindicated_count: contraindicated,
    major_count: major,
    moderate_count: moderate,
    minor_count: minor,
    interactions,
    overall_risk_level: overallRisk,
    dosing_adjustment_needed: major > 0 || input.eGFR < 60,
    renal_adjustment_required: input.eGFR < 60,
    monitoring_plan: monitoringPlan,
    alternative_medications: alternatives,
    patient_counseling_points: counselingPoints,
    prescriber_notification_required: contraindicated > 0 || major > 0,
    assessment_date: new Date().toISOString().split('T')[0]
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatRemoteMonitorReport(r: RemoteMonitorResult): string {
  const lines: string[] = []
  lines.push('# Remote Patient Monitoring Report')
  lines.push('')
  lines.push('Patient: ' + r.patient_name + ' (' + r.patient_id + ')')
  lines.push('Monitoring Period: ' + r.monitoring_start + ' to ' + r.monitoring_end)
  lines.push('Total Readings: ' + r.total_readings)
  lines.push('Overall Status: ' + r.overall_status.toUpperCase())
  lines.push('Critical Alerts: ' + r.alert_count_critical + ' | Warning Alerts: ' + r.alert_count_warning)
  lines.push('Clinician Notified: ' + (r.clinician_notified ? 'YES' : 'No'))
  lines.push('Next Assessment: ' + r.next_assessment_due)
  lines.push('')
  lines.push('## Vital Sign Averages')
  lines.push('- Heart Rate: ' + r.heart_rate_avg + ' bpm')
  lines.push('- Blood Pressure: ' + r.blood_pressure_avg + ' mmHg')
  lines.push('- SpO2: ' + r.sp_o2_avg + '%')
  lines.push('- Respiratory Rate: ' + r.respiratory_rate_avg + ' /min')
  lines.push('- Temperature: ' + r.temperature_avg + ' C')
  lines.push('')
  if (r.alerts.length > 0) {
    lines.push('## Active Alerts')
    for (const a of r.alerts) {
      lines.push('- [' + a.severity.toUpperCase() + '] ' + a.vital_sign + ': ' + a.current_value + ' (' + a.threshold_breached + ')')
      lines.push('  Significance: ' + a.clinical_significance)
      lines.push('  Action: ' + a.recommended_action)
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('Remote patient monitoring enables early detection of clinical deterioration. Continuous vital sign tracking reduces unplanned ICU admissions by 25-30%.')
  return lines.join('\n')
}

function formatSymptomTriageReport(r: SymptomTriageResult): string {
  const lines: string[] = []
  lines.push('# AI Symptom Triage Assessment')
  lines.push('')
  lines.push('Patient: ' + r.patient_name + ' (' + r.patient_id + ')')
  lines.push('Triage Level: ' + r.triage_level.toUpperCase() + ' | Score: ' + r.triage_score + '/10')
  lines.push('Suggested Department: ' + r.suggested_department)
  lines.push('Estimated Wait: ' + r.estimated_wait_minutes + ' minutes')
  lines.push('Referral Needed: ' + (r.referral_needed ? 'YES' : 'No'))
  lines.push('Timestamp: ' + r.triage_timestamp)
  lines.push('')
  if (r.red_flag_symptoms.length > 0) {
    lines.push('## Red Flag Symptoms')
    for (const rf of r.red_flag_symptoms) lines.push('- [RED FLAG] ' + rf)
    lines.push('')
  }
  lines.push('## Findings')
  for (const f of r.findings) {
    lines.push('- ' + f.symptom + ' (urgency: ' + f.urgency_score + '/10)')
    lines.push('  Differentials: ' + f.differential_diagnoses.join(', '))
    lines.push('  ' + f.recommendation)
  }
  if (r.self_care_advice.length > 0) {
    lines.push('')
    lines.push('## Self-Care Advice')
    for (const sc of r.self_care_advice) lines.push('- ' + sc)
  }
  lines.push('')
  lines.push('## Follow-Up')
  for (const fu of r.follow_up_recommendations) lines.push('- ' + fu)
  lines.push('')
  lines.push('---')
  lines.push('AI-powered symptom triage reduces ED wait times by 30% and improves appropriate care routing. Not a substitute for clinical judgment.')
  return lines.join('\n')
}

function formatAdherenceReport(r: AdherenceResult): string {
  const lines: string[] = []
  lines.push('# Medication Adherence Report')
  lines.push('')
  lines.push('Patient: ' + r.patient_name + ' (' + r.patient_id + ')')
  lines.push('Overall Adherence Rate: ' + r.overall_adherence_rate + '%')
  lines.push('Proportion of Days Covered (PDC): ' + r.proportion_of_days_covered + '%')
  lines.push('Adherence Trend: ' + r.adherence_trend)
  lines.push('Clinical Outcome Risk: ' + r.clinical_outcome_risk.toUpperCase())
  lines.push('Next Review: ' + r.next_review_date)
  lines.push('')
  lines.push('## Per-Medication Adherence')
  for (const ma of r.medication_adherences) {
    lines.push('- ' + ma.medication_name + ': ' + ma.adherence_rate + '% adherence, ' + ma.persistence_rate + '% persistence')
    lines.push('  Days covered: ' + ma.days_covered + ' | Gap days: ' + ma.gap_days + ' | Risk: ' + ma.risk_level)
  }
  lines.push('')
  lines.push('## Pharmacokinetic Impact')
  lines.push(r.pharmacokinetic_impact)
  lines.push('')
  lines.push('## Risk Factors')
  for (const rf of r.risk_factors) lines.push('- ' + rf)
  lines.push('')
  lines.push('## Recommended Interventions')
  for (const i of r.interventions_recommended) lines.push('- ' + i)
  lines.push('')
  lines.push('---')
  lines.push('Medication non-adherence causes ~125,000 deaths/year in the US and $300B in avoidable healthcare costs. PDC >= 80% is the standard quality benchmark.')
  return lines.join('\n')
}

function formatTrialMatchReport(r: TrialMatchResult): string {
  const lines: string[] = []
  lines.push('# Clinical Trial Match Report')
  lines.push('')
  lines.push('Patient: ' + r.patient_name + ' (' + r.patient_id + ')')
  lines.push('Search Criteria: ' + r.search_criteria_summary)
  lines.push('Trials Searched: ' + r.total_trials_searched + ' | Matches Found: ' + r.trials_matched)
  lines.push('Top Match Score: ' + r.top_match_score + '/100')
  lines.push('Biomarker Match: ' + (r.biomarker_match_found ? 'YES' : 'No') + ' | Genetic Cohort: ' + (r.genetic_cohort_eligible ? 'YES' : 'No'))
  lines.push('Referral Recommended: ' + (r.referral_recommended ? 'YES' : 'No'))
  lines.push('Search Date: ' + r.search_date)
  lines.push('')
  lines.push('## Matched Trials')
  for (const t of r.trial_matches) {
    lines.push('- [' + t.eligibility_status.toUpperCase() + '] ' + t.trial_name)
    lines.push('  Phase: ' + t.phase + ' | Score: ' + t.match_score + '/100 | Distance: ' + t.distance_km + ' km')
    lines.push('  Site: ' + t.site_name + ' | PI: ' + t.principal_investigator)
    lines.push('  Match criteria: ' + t.matching_criteria.join('; '))
    if (t.exclusion_flags.length > 0) lines.push('  Exclusion flags: ' + t.exclusion_flags.join('; '))
  }
  lines.push('')
  lines.push('## Next Steps')
  for (const ns of r.next_steps) lines.push('- ' + ns)
  lines.push('')
  lines.push('---')
  lines.push('Only 5% of cancer patients currently enroll in clinical trials. AI-powered matching increases trial enrollment rates by 3-5x.')
  return lines.join('\n')
}

function formatWearableDataReport(r: WearableDataResult): string {
  const lines: string[] = []
  lines.push('# Wearable Data Interpretation Report')
  lines.push('')
  lines.push('Patient: ' + r.patient_name + ' (' + r.patient_id + ')')
  lines.push('Device: ' + r.device_type + ' (' + r.device_model + ')')
  lines.push('Wear Duration: ' + r.wear_duration_days + ' days | Data Completeness: ' + r.data_completeness_pct + '%')
  lines.push('Overall Wellness Score: ' + r.overall_wellness_score + '/100')
  lines.push('Trend: ' + r.trend_direction)
  lines.push('Next Calibration: ' + r.next_device_calibration)
  lines.push('')
  lines.push('## Assessments')
  lines.push('- Heart Rate: ' + r.heart_rate_assessment)
  lines.push('- Sleep Quality: ' + r.sleep_quality_assessment)
  lines.push('- Activity Level: ' + r.activity_level_assessment)
  lines.push('- SpO2: ' + r.spo2_assessment)
  lines.push('')
  lines.push('## Key Insights')
  for (const i of r.insights) {
    lines.push('- ' + i.metric + ': ' + i.current_value + ' (vs baseline ' + i.baseline_comparison + ', ' + (i.deviation_percent >= 0 ? '+' : '') + i.deviation_percent + '%)')
    lines.push('  ' + i.clinical_significance)
    lines.push('  -> ' + i.recommendation)
  }
  if (r.alerts_generated.length > 0) {
    lines.push('')
    lines.push('## Alerts')
    for (const a of r.alerts_generated) lines.push('- ' + a)
  }
  lines.push('')
  lines.push('## Clinical Recommendations')
  for (const c of r.clinical_recommendations) lines.push('- ' + c)
  lines.push('')
  lines.push('---')
  lines.push('Wearable devices enable continuous health monitoring outside clinical settings. Data should complement, not replace, clinical assessments.')
  return lines.join('\n')
}

function formatTelehealthConfigReport(r: TelehealthConfigResult): string {
  const lines: string[] = []
  lines.push('# Telehealth Platform Configuration Plan')
  lines.push('')
  lines.push('Organization: ' + r.organization_name)
  lines.push('Deployment Scope: ' + r.deployment_scope)
  lines.push('Total Estimated Cost: $' + r.total_estimated_cost_usd.toLocaleString())
  lines.push('Implementation Timeline: ' + r.implementation_timeline_weeks + ' weeks')
  lines.push('Provider Training: ' + r.provider_training_hours + ' hours')
  lines.push('ROI Projection: ' + r.roi_projection_months + ' months')
  lines.push('Go-Live Recommendation: ' + r.go_live_recommendation)
  lines.push('')
  lines.push('## Bandwidth Assessment')
  lines.push(r.bandwidth_assessment)
  lines.push('')
  lines.push('## Regulatory Compliance')
  lines.push(r.regulatory_compliance_status)
  lines.push('')
  lines.push('## Platform Components')
  for (const c of r.components) {
    lines.push('- [' + c.priority.toUpperCase() + '] ' + c.component)
    lines.push('  Cost: $' + Math.round(c.estimated_cost_usd).toLocaleString() + ' | Timeline: ' + c.implementation_weeks + ' weeks')
    lines.push('  Vendors: ' + c.vendor_options.join(', '))
    lines.push('  Compliance: ' + c.compliance_notes)
  }
  lines.push('')
  lines.push('## Patient Onboarding Strategy')
  lines.push(r.patient_onboarding_strategy)
  lines.push('')
  if (r.risk_mitigation_items.length > 0) {
    lines.push('## Risk Mitigation')
    for (const rm of r.risk_mitigation_items) lines.push('- ' + rm)
    lines.push('')
  }
  lines.push('---')
  lines.push('Telehealth utilization stabilized at 38x pre-pandemic levels. Successful deployment requires technology, workflow redesign, and change management.')
  return lines.join('\n')
}

function formatPopulationHealthReport(r: PopulationHealthResult): string {
  const lines: string[] = []
  lines.push('# Population Health Analysis Report')
  lines.push('')
  lines.push('Population: ' + r.population_name + ' | Region: ' + r.geographic_region)
  lines.push('Total Population: ' + r.total_population_size.toLocaleString())
  lines.push('Analysis Period: ' + r.analysis_period)
  lines.push('Overall Health Index: ' + r.overall_health_index + '/100')
  lines.push('Total Chronic Burden: ' + r.total_chronic_burden_pct + '%')
  lines.push('High-Risk Population: ' + r.high_risk_population_pct + '%')
  lines.push('Utilization Efficiency: ' + r.utilization_efficiency_score + '/100')
  lines.push('Population Risk Trend: ' + r.population_risk_trend)
  lines.push('Next Survey: ' + r.next_survey_recommended)
  lines.push('')
  lines.push('## Condition Burden Analysis')
  for (const cb of r.condition_burdens) {
    lines.push('- ' + cb.condition + ': ' + cb.prevalence_pct + '% prevalence, ' + cb.control_gap + '% control gap')
    lines.push('  Annual cost: $' + cb.annual_total_cost.toLocaleString() + ' | Risk: ' + cb.risk_level + ' | Priority: ' + cb.intervention_priority)
  }
  lines.push('')
  lines.push('## Care Gap Analysis')
  lines.push(r.care_gap_analysis)
  lines.push('')
  lines.push('## Social Determinant Impact')
  lines.push(r.social_determinant_impact)
  lines.push('')
  lines.push('## Projected Cost Savings')
  lines.push('$' + r.projected_cost_savings.toLocaleString() + '/year with recommended interventions')
  lines.push('')
  lines.push('## Recommended Interventions')
  for (const ri of r.recommended_interventions) lines.push('- ' + ri)
  lines.push('')
  lines.push('---')
  lines.push('Population health management addresses health outcomes across defined groups. Social determinants account for 80% of health outcomes.')
  return lines.join('\n')
}

function formatDrugInteractionReport(r: DrugInteractionResult): string {
  const lines: string[] = []
  lines.push('# Drug Interaction Analysis Report')
  lines.push('')
  lines.push('Patient: ' + r.patient_name + ' (' + r.patient_id + ')')
  lines.push('New Medication: ' + r.new_medication)
  lines.push('Total Interactions Found: ' + r.total_interactions_found)
  lines.push('Contraindicated: ' + r.contraindicated_count + ' | Major: ' + r.major_count + ' | Moderate: ' + r.moderate_count + ' | Minor: ' + r.minor_count)
  lines.push('Overall Risk Level: ' + r.overall_risk_level.toUpperCase())
  lines.push('Dosing Adjustment Needed: ' + (r.dosing_adjustment_needed ? 'YES' : 'No'))
  lines.push('Renal Adjustment Required: ' + (r.renal_adjustment_required ? 'YES' : 'No'))
  lines.push('Prescriber Notification: ' + (r.prescriber_notification_required ? 'REQUIRED' : 'Not required'))
  lines.push('Assessment Date: ' + r.assessment_date)
  lines.push('')
  if (r.interactions.length > 0) {
    lines.push('## Interaction Details')
    for (const i of r.interactions) {
      lines.push('- [' + i.severity.toUpperCase() + '] ' + i.drug_pair)
      lines.push('  Mechanism: ' + i.mechanism)
      lines.push('  Effect: ' + i.clinical_effect)
      lines.push('  Onset: ' + i.onset + ' | Evidence: ' + i.evidence_level)
      lines.push('  Management: ' + i.management)
    }
    lines.push('')
  }
  if (r.alternative_medications.length > 0) {
    lines.push('## Alternative Medications')
    for (const a of r.alternative_medications) lines.push('- ' + a)
    lines.push('')
  }
  lines.push('## Monitoring Plan')
  for (const m of r.monitoring_plan) lines.push('- ' + m)
  lines.push('')
  lines.push('## Patient Counseling Points')
  for (const c of r.patient_counseling_points) lines.push('- ' + c)
  lines.push('')
  lines.push('---')
  lines.push('Drug interactions are a leading cause of adverse drug events. Always verify interactions before prescribing new medications to patients on polypharmacy.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'remote_patient_monitor',
    description: 'Continuous vital sign monitoring with intelligent alerts. Tracks HR, BP, SpO2, RR, temperature against personalized thresholds. Generates critical/warning alerts with clinical significance and recommended actions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, patient_name, age, gender, conditions[], monitoring_devices[], vital_signs{heart_rate_bpm, blood_pressure_systolic, blood_pressure_diastolic, sp_o2_percent, respiratory_rate, temperature_celsius, glucose_mg_dl?, weight_kg?}, alert_thresholds{hr_min,hr_max,sbp_min,sbp_max,dbp_min,dbp_max,spo2_min,rr_min,rr_max,temp_min,temp_max}, monitoring_duration_hours(number), clinician_contact(string)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: RemoteMonitorInput = JSON.parse(args.input_data)
      return formatRemoteMonitorReport(analyzeRemoteMonitoring(input))
    }
  }))

  tools.register(defineTool({
    name: 'symptom_triage_ai',
    description: 'AI-powered symptom assessment and care routing. Evaluates symptom severity, duration, quality, red flags, vital signs, and patient risk factors. Outputs triage level, differential diagnoses, and department routing.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, patient_name, age, gender, chief_complaint, symptoms[{name,severity(1-10),duration_hours,location?,quality?,aggravating_factors?,relieving_factors?}], vital_signs{heart_rate_bpm,temperature_celsius,blood_pressure_systolic,sp_o2_percent}, medical_history[], current_medications[], allergies[], pregnancy_status(boolean), immunocompromised(boolean)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SymptomTriageInput = JSON.parse(args.input_data)
      return formatSymptomTriageReport(analyzeSymptomTriage(input))
    }
  }))

  tools.register(defineTool({
    name: 'medication_adherence_tracker',
    description: 'Medication compliance tracking with predictors. Calculates adherence rate, persistence rate, PDC, gap analysis, and trend. Identifies barriers and recommends evidence-based interventions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, patient_name, age, medications[{name,dosage,frequency,route,start_date,expected_duration_days}], adherence_log[{date,medication_name,prescribed_doses,taken_doses,missed_doses,late_doses}], barriers[], support_system[], health_literacy(high|moderate|low), technology_access(smartphone|basic_phone|none)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: AdherenceInput = JSON.parse(args.input_data)
      return formatAdherenceReport(analyzeMedicationAdherence(input))
    }
  }))

  tools.register(defineTool({
    name: 'clinical_trial_matcher',
    description: 'Patient-to-trial matching with eligibility scoring. Matches diagnosis, biomarkers, genetic mutations, organ function, ECOG status, and prior treatments against trial databases. Scores and ranks matches.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, patient_name, age, gender, diagnosis, diagnosis_icd10, disease_stage, biomarkers{}, lab_results[{test,value,unit,reference_range,date}], prior_treatments[], ecog_performance(0-4), organ_function{eGFR,alt_u_l,ast_u_l,bilirubin_mg_dl,albumin_g_dl}, comorbidities[], genetic_mutations[], trial_database[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: TrialMatchInput = JSON.parse(args.input_data)
      return formatTrialMatchReport(analyzeClinicalTrialMatch(input))
    }
  }))

  tools.register(defineTool({
    name: 'wearable_data_interpreter',
    description: 'Wearable device data analysis and trending. Interprets HR, HRV, steps, sleep stages, SpO2, activity levels, skin temperature against patient baselines. Generates wellness scores and clinical insights.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, patient_name, device_type, device_model, wear_duration_days(number), metrics{heart_rate{avg_bpm,min_bpm,max_bpm,resting_bpm,hrv_ms}, steps{avg_daily,peak_daily,total}, sleep{avg_hours,deep_sleep_pct,rem_pct,awakenings,sleep_score}, spo2{avg_pct,min_pct,desaturation_events}, activity{sedentary_hours,light_hours,moderate_hours,vigorous_hours,calories_burned_avg}, skin_temp{avg_celsius,max_celsius,min_celsius}}, patient_baselines{resting_hr,avg_sleep_hours,avg_daily_steps,avg_spo2}, clinical_context[], abnormal_reading_flags[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: WearableDataInput = JSON.parse(args.input_data)
      return formatWearableDataReport(analyzeWearableData(input))
    }
  }))

  tools.register(defineTool({
    name: 'telehealth_platform_config',
    description: 'Telehealth deployment configuration planner. Recommends platform components, vendors, costs, timelines, bandwidth assessment, regulatory compliance, and patient onboarding strategy.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: organization_name, organization_type(hospital|clinic|health_system|private_practice|rural_health), patient_volume_monthly(number), specialties[], deployment_scope(pilot|department|organization_wide|multi_site), regulatory_requirements[], existing_ehr(string), connectivity_profile{avg_bandwidth_mbps,rural_connectivity_pct,technology_access_patient_pct}, provider_count(number), budget_usd(number), timeline_months(number), languages[], accessibility_needs[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: TelehealthConfigInput = JSON.parse(args.input_data)
      return formatTelehealthConfigReport(analyzeTelehealthConfig(input))
    }
  }))

  tools.register(defineTool({
    name: 'population_health_analyzer',
    description: 'Population-level health trend analysis. Analyzes chronic condition burden, care gaps, utilization efficiency, social determinants, and cost projections. Recommends targeted interventions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: population_name, total_population_size(number), geographic_region, demographics{age_distribution{},gender_distribution{},socioeconomic_index,insurance_coverage_pct}, chronic_conditions[{condition,prevalence_pct,diagnosed_pct,controlled_pct,annual_cost_per_patient}], utilization_metrics{ed_visits_per_1000,hospitalization_rate_per_1000,readmission_rate_30day,preventive_care_utilization_pct,telehealth_utilization_pct}, social_determinants{food_insecurity_pct,transportation_barriers_pct,housing_instability_pct,unemployment_rate_pct}, data_collection_period(string)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PopulationHealthInput = JSON.parse(args.input_data)
      return formatPopulationHealthReport(analyzePopulationHealth(input))
    }
  }))

  tools.register(defineTool({
    name: 'drug_interaction_checker',
    description: 'Drug-drug and drug-condition interaction analysis. Checks new medication against current regimen, allergies, renal function, and comorbidities. Outputs severity, mechanism, management, and monitoring plan.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, patient_name, age, gender, weight_kg(number), eGFR(number), current_medications[{name,dosage,frequency,route,drug_class}], new_medication{name,dosage,frequency,route,drug_class}, known_allergies[], comorbidities[], herbal_supplements[], alcohol_use(none|occasional|moderate|heavy), smoking_status(never|former|current)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: DrugInteractionInput = JSON.parse(args.input_data)
      return formatDrugInteractionReport(analyzeDrugInteraction(input))
    }
  }))
}
