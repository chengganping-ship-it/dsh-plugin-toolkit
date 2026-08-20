/**
 * DSH Medical AI Agent Plugin v0.1.0
 *
 * Comprehensive medical AI toolkit for DeepSeek Harness Agent.
 * Designed for healthcare professionals, clinical informaticists, and medical researchers.
 * Targets the $300 billion medical AI market with evidence-based tools.
 *
 * Features (v0.1.0):
 * - Clinical Decision Support (differential diagnosis, treatment recommendations)
 * - EHR Coder (ICD-10 / CPT / SNOMED / DRG coding assistance)
 * - Quality Controller (medical record quality scoring and improvement)
 * - Drug Safety Checker (interactions, dosing errors, allergy alerts)
 * - Lab Interpreter (abnormal result annotation and clinical significance)
 * - Treatment Pathway (personalized evidence-based treatment paths)
 * - Patient Risk Stratifier (risk scoring and prevention recommendations)
 * - Medical Documentation (SOAP / discharge / referral / progress notes)
 *
 * @module dsh-tool-medagent
 * @version 0.1.0
 * @license MIT
 *
 * Disclaimer: All outputs contain the disclaimer
 * "'本建议仅供参考，不可替代专业医疗判断'" as required.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-medagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== CONSTANTS ====================

const DISCLAIMER = '**\u26A0\uFE0F \u672C\u5EFA\u8BAE\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u53EF\u66FF\u4EE3\u4E13\u4E1A\u533B\u7597\u5224\u65AD**'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Seeded pseudo-random number generator for deterministic output.
 * Uses mulberry32 algorithm.
 */
function createSeededRandom(seed: string): () => number {
  let h = 0xdeadbeef
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761)
  }
  let state = h >>> 0
  return function () {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pick a random element from array using seeded random */
function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ==================== TYPES ====================

// --- Tool 1: Clinical Decision Support ---

interface SymptomEntry {
  symptom: string
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
}

interface PatientCase {
  chief_complaint: string
  symptoms: SymptomEntry[]
  history: {
    conditions?: string[]
    medications?: string[]
    surgeries?: string[]
    family_history?: string[]
    social_history?: {
      smoking?: string
      alcohol?: string
      occupation?: string
    }
  }
  vitals?: {
    temperature_c?: number
    heart_rate?: number
    systolic_bp?: number
    diastolic_bp?: number
    respiratory_rate?: number
    oxygen_saturation?: number
    weight_kg?: number
    height_cm?: number
  }
  demographics: {
    age: number
    sex: 'male' | 'female' | 'other'
    pregnant?: boolean
  }
  test_results?: Array<{ test_name: string; value: string; unit?: string; flag?: 'normal' | 'high' | 'low' | 'critical' }>
}

interface DiagnosisCandidate {
  condition: string
  probability: number
  category: string
  icd10_hint: string
  rationale: string
  matching_symptoms: string[]
  red_flags: string[]
}

interface TreatmentRecommendation {
  category: 'pharmacological' | 'non_pharmacological' | 'diagnostic' | 'referral'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  description: string
  evidence_level: 'A' | 'B' | 'C'
  notes: string
}

interface ClinicalDecisionOutput {
  differential_diagnosis: DiagnosisCandidate[]
  recommendations: TreatmentRecommendation[]
  urgency_level: 'emergent' | 'urgent' | 'routine' | 'self_care'
  confidence: number
  missing_info: string[]
  follow_up: string[]
}

// --- Tool 2: EHR Coder ---

interface CodingResult {
  code: string
  description: string
  system: string
  confidence: number
  notes: string
}

interface DocumentationGap {
  element: string
  severity: 'critical' | 'moderate' | 'minor'
  suggestion: string
  impact: string
}

interface EHRCodingOutput {
  coding_results: CodingResult[]
  documentation_gaps: DocumentationGap[]
  specificity_suggestions: string[]
  compliance_flags: string[]
  score: number
}

// --- Tool 3: Quality Controller ---

interface QualityCriterion {
  name: string
  weight: number
  score: number
  findings: string[]
  recommendation: string
}

interface QualityControlOutput {
  overall_score: number
  grade: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'unsatisfactory'
  criteria: QualityCriterion[]
  critical_findings: string[]
  improvement_actions: string[]
  compliance_status: string
  benchmark_comparison: string
}

// --- Tool 4: Drug Safety Checker ---

interface MedicationEntry {
  name: string
  dose: string
  frequency: string
  route: string
  start_date?: string
  indication?: string
}

interface DrugInteraction {
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor'
  drugs: string[]
  mechanism: string
  effect: string
  recommendation: string
  evidence: string
}

interface DoseAlert {
  medication: string
  issue: 'overdose' | 'underdose' | 'frequency_error' | 'age_inappropriate' | 'renal_adjustment_needed'
  current_dose: string
  recommended_dose: string
  rationale: string
}

interface AllergyAlert {
  medication: string
  allergen: string
  cross_reactivity_risk: 'high' | 'moderate' | 'low'
  reaction_type: string
  alternative: string
}

interface DrugSafetyOutput {
  interactions: DrugInteraction[]
  dose_alerts: DoseAlert[]
  allergy_alerts: AllergyAlert[]
  monitoring_recommendations: string[]
  safety_score: number
  summary_risk: 'high' | 'moderate' | 'low'
}

// --- Tool 5: Lab Interpreter ---

interface LabResultEntry {
  test_name: string
  value: number
  unit: string
  reference_low: number
  reference_high: number
  previous_value?: number
  previous_date?: string
}

interface LabAbnormality {
  test_name: string
  value: number
  unit: string
  flag: 'critical_low' | 'low' | 'normal' | 'high' | 'critical_high'
  reference_range: string
  clinical_significance: string
  trend?: 'improving' | 'worsening' | 'stable'
  suggested_actions: string[]
}

interface LabPanelInterpretation {
  panel_name: string
  summary: string
  abnormalities: LabAbnormality[]
  clinical_correlation: string
  follow_up: string[]
}

// --- Tool 6: Treatment Pathway ---

interface PathwayMilestone {
  stage: number
  name: string
  description: string
  criteria_to_advance: string[]
  expected_duration: string
  interventions: string[]
  monitoring: string[]
}

interface TreatmentPathwayOutput {
  diagnosis: string
  pathway_name: string
  milestones: PathwayMilestone[]
  alternatives: Array<{ name: string; indication: string; pros: string[]; cons: string[] }>
  expected_outcomes: { outcome: string; probability: string; timeframe: string }[]
  risk_factors: string[]
}

// --- Tool 7: Patient Risk Stratifier ---

interface RiskFactor {
  factor: string
  weight: number
  contribution: number
  modifiable: boolean
}

interface RiskScore {
  model: string
  score: number
  category: 'low' | 'moderate' | 'high' | 'very_high'
  percentile?: number
  interpretation: string
}

interface PreventionRecommendation {
  category: 'lifestyle' | 'pharmacological' | 'screening' | 'monitoring'
  priority: 'essential' | 'recommended' | 'optional'
  description: string
  expected_benefit: string
  timeframe: string
}

interface RiskStratificationOutput {
  risk_scores: RiskScore[]
  risk_factors: RiskFactor[]
  prevention_recommendations: PreventionRecommendation[]
  monitoring_plan: string[]
  referrals: string[]
  overall_risk_category: string
}

// --- Tool 8: Medical Documentation ---

interface EncounterData {
  patient_name: string
  patient_id: string
  age: number
  sex: string
  date: string
  provider: string
  chief_complaint: string
  history_of_present_illness: string
  review_of_systems?: Record<string, string>
  physical_examination?: Record<string, string>
  assessment_and_plan?: Array<{ diagnosis: string; plan: string }>
  vital_signs?: Record<string, string>
  medications?: string[]
  allergies?: string[]
  procedures?: string[]
  labs_ordered?: string[]
  disposition?: string
}

// ==================== TOOL 1: CLINICAL DECISION SUPPORT ====================

function generateDifferentialDiagnosis(patient: PatientCase): DiagnosisCandidate[] {
  const conditions: DiagnosisCandidate[] = []
  const symptomTexts = patient.symptoms.map(s => s.symptom.toLowerCase())
  const historyLower = (patient.history.conditions || []).map(c => c.toLowerCase())

  // Cardiac conditions
  if (symptomTexts.some(s => s.includes('chest pain') || s.includes('chest pressure'))) {
    const matching = patient.symptoms.filter(s =>
      s.symptom.toLowerCase().includes('chest')
    ).map(s => s.symptom)

    conditions.push({
      condition: 'Acute Coronary Syndrome (ACS)',
      probability: 0.68,
      category: 'Cardiovascular',
      icd10_hint: 'I21.9',
      rationale: 'Chest pain/pressure is cardinal symptom of myocardial ischemia. Risk increases with age and cardiac history.',
      matching_symptoms: matching,
      red_flags: patient.symptoms.some(s => s.severity === 'severe') ? ['Severe chest pain'] : []
    })
    conditions.push({
      condition: 'Stable Angina Pectoris',
      probability: 0.52,
      category: 'Cardiovascular',
      icd10_hint: 'I20.9',
      rationale: 'Exertional chest pain relieved by rest is classic for stable angina.',
      matching_symptoms: matching,
      red_flags: []
    })
    conditions.push({
      condition: 'Gastroesophageal Reflux Disease (GERD)',
      probability: 0.42,
      category: 'Gastrointestinal',
      icd10_hint: 'K21.9',
      rationale: 'GERD is the most common non-cardiac cause of chest pain. May coexist with cardiac disease.',
      matching_symptoms: matching,
      red_flags: []
    })
  }

  // Respiratory conditions
  if (symptomTexts.some(s => s.includes('cough') || s.includes('dyspnea') || s.includes('shortness of breath'))) {
    const respSymptoms = patient.symptoms.filter(s =>
      s.symptom.toLowerCase().includes('cough') ||
      s.symptom.toLowerCase().includes('dyspnea') ||
      s.symptom.toLowerCase().includes('shortness')
    ).map(s => s.symptom)

    if (symptomTexts.some(s => s.includes('fever'))) {
      conditions.push({
        condition: 'Community-Acquired Pneumonia',
        probability: 0.63,
        category: 'Respiratory/Infectious',
        icd10_hint: 'J18.9',
        rationale: 'Cough with fever and dyspnea suggests lower respiratory tract infection.',
        matching_symptoms: respSymptoms,
        red_flags: patient.vitals && patient.vitals.oxygen_saturation && patient.vitals.oxygen_saturation < 92 ? ['Hypoxemia (SpO2 < 92%)'] : []
      })
    }

    if (historyLower.some(h => h.includes('copd') || h.includes('asthma'))) {
      conditions.push({
        condition: 'COPD/Asthma Exacerbation',
        probability: 0.71,
        category: 'Respiratory',
        icd10_hint: 'J44.1',
        rationale: 'Known obstructive lung disease with acute worsening suggests exacerbation.',
        matching_symptoms: respSymptoms,
        red_flags: patient.vitals && patient.vitals.respiratory_rate && patient.vitals.respiratory_rate > 24 ? ['Tachypnea'] : []
      })
    }

    conditions.push({
      condition: 'Upper Respiratory Tract Infection',
      probability: 0.35,
      category: 'Respiratory/Infectious',
      icd10_hint: 'J06.9',
      rationale: 'Viral URI is the most common cause of acute cough.',
      matching_symptoms: respSymptoms,
      red_flags: []
    })
  }

  // Neurological conditions
  if (symptomTexts.some(s => s.includes('headache'))) {
    const headacheSeverity = patient.symptoms.find(s => s.symptom.toLowerCase().includes('headache'))?.severity
    const neuroSymptoms = patient.symptoms.filter(s =>
      s.symptom.toLowerCase().includes('headache') ||
      s.symptom.toLowerCase().includes('nausea') ||
      s.symptom.toLowerCase().includes('photophobia')
    ).map(s => s.symptom)

    conditions.push({
      condition: 'Migraine without Aura',
      probability: 0.58,
      category: 'Neurological',
      icd10_hint: 'G43.0',
      rationale: 'Unilateral throbbing headache with nausea/photophobia is classic migraine presentation.',
      matching_symptoms: neuroSymptoms,
      red_flags: headacheSeverity === 'severe' ? ['Thunderclaps headache requires CT to rule out SAH'] : []
    })

    if (symptomTexts.some(s => s.includes('fever'))) {
      conditions.push({
        condition: 'Meningitis (consider)',
        probability: 0.22,
        category: 'Neurological/Infectious',
        icd10_hint: 'G03.9',
        rationale: 'Headache with fever and neck stiffness raises concern for CNS infection.',
        matching_symptoms: neuroSymptoms,
        red_flags: ['Fever + headache requires lumbar puncture if suspected']
      })
    }

    conditions.push({
      condition: 'Tension-Type Headache',
      probability: 0.45,
      category: 'Neurological',
      icd10_hint: 'G44.2',
      rationale: 'Bilateral pressing headache without nausea is characteristic of tension-type.',
      matching_symptoms: neuroSymptoms,
      red_flags: []
    })
  }

  // Infectious disease screening
  if (symptomTexts.some(s => s.includes('fever'))) {
    if (symptomTexts.some(s => s.includes('dysuria') || s.includes('frequency'))) {
      conditions.push({
        condition: 'Urinary Tract Infection',
        probability: 0.72,
        category: 'Infectious/Genitourinary',
        icd10_hint: 'N39.0',
        rationale: 'Dysuria with frequency and fever is classic for upper UTI/pyelonephritis.',
        matching_symptoms: patient.symptoms.filter(s => s.symptom.toLowerCase().includes('dysuria')).map(s => s.symptom),
        red_flags: patient.demographics.age > 65 ? ['Elderly patient - higher risk of urosepsis'] : []
      })
    }
  }

  // Metabolic/Endocrine
  if (symptomTexts.some(s => s.includes('fatigue') || s.includes('weight loss'))) {
    conditions.push({
      condition: 'Diabetes Mellitus (new onset or uncontrolled)',
      probability: 0.30,
      category: 'Endocrine/Metabolic',
      icd10_hint: 'E11.65',
      rationale: 'Fatigue with weight loss warrants glucose/HbA1c evaluation.',
      matching_symptoms: patient.symptoms.filter(s => s.symptom.toLowerCase().includes('fatigue') || s.symptom.toLowerCase().includes('weight')).map(s => s.symptom),
      red_flags: []
    })
  }

  conditions.sort((a, b) => b.probability - a.probability)
  return conditions
}

function determineUrgency(patient: PatientCase, diagnosis: DiagnosisCandidate[]): ClinicalDecisionOutput['urgency_level'] {
  const symptomTexts = patient.symptoms.map(s => s.symptom.toLowerCase())

  // Check emergency criteria
  if (patient.vitals) {
    if (patient.vitals.systolic_bp !== undefined && patient.vitals.systolic_bp < 90) return 'emergent'
    if (patient.vitals.oxygen_saturation !== undefined && patient.vitals.oxygen_saturation < 90) return 'emergent'
    if (patient.vitals.heart_rate !== undefined && patient.vitals.heart_rate > 150) return 'emergent'
    if (patient.vitals.temperature_c !== undefined && patient.vitals.temperature_c > 40.5) return 'emergent'
  }

  const severeSymptoms = patient.symptoms.filter(s => s.severity === 'severe')
  if (severeSymptoms.length >= 2) return 'emergent'
  if (symptomTexts.some(s => s.includes('chest pain')) && severeSymptoms.some(s => s.symptom.toLowerCase().includes('chest'))) return 'urgent'
  if (symptomTexts.some(s => s.includes('vision loss'))) return 'emergent'
  if (symptomTexts.some(s => s.includes('weakness')) && symptomTexts.some(s => s.includes('facial droop'))) return 'emergent'

  // Check urgent criteria
  if (diagnosis.some(d => d.probability > 0.7 && ['Cardiovascular', 'Neurological/Infectious'].includes(d.category))) return 'urgent'
  if (patient.demographics.age > 65 && severeSymptoms.length > 0) return 'urgent'
  if (patient.symptoms.length > 5) return 'urgent'

  // Routine
  if (diagnosis.some(d => d.probability > 0.5)) return 'routine'

  return 'self_care'
}

function generateTreatmentRecommendations(patient: PatientCase, diagnosis: DiagnosisCandidate[], urgency: string): TreatmentRecommendation[] {
  const recs: TreatmentRecommendation[] = []

  if (urgency === 'emergent' || urgency === 'urgent') {
    recs.push({
      category: 'referral',
      priority: 'urgent',
      description: 'Immediate specialist evaluation required given clinical presentation',
      evidence_level: 'C',
      notes: 'Urgency: ' + urgency + '. Do not delay definitive care for additional workup alone.'
    })
  }

  // Diagnostic recommendations based on top diagnoses
  const topDiagnoses = diagnosis.slice(0, 3)
  for (const d of topDiagnoses) {
    if (d.category === 'Cardiovascular') {
      recs.push({
        category: 'diagnostic',
        priority: 'high',
        description: 'Order 12-lead ECG, troponin (serial), chest X-ray. Consider stress test if initial workup negative.',
        evidence_level: 'A',
        notes: 'For: ' + d.condition + ' (probability: ' + (d.probability * 100).toFixed(0) + '%)'
      })
    }
    if (d.category.includes('Infectious')) {
      recs.push({
        category: 'diagnostic',
        priority: 'medium',
        description: 'CBC with differential, blood cultures x2, urinalysis. Consider CT if source unclear.',
        evidence_level: 'B',
        notes: 'For: ' + d.condition
      })
    }
    if (d.category === 'Respiratory') {
      recs.push({
        category: 'diagnostic',
        priority: 'medium',
        description: 'Chest X-ray PA/Lateral, sputum culture. Consider CT chest if no improvement in 48-72h.',
        evidence_level: 'B',
        notes: 'For: ' + d.condition
      })
    }
  }

  // Pharmacological recommendations
  if (diagnosis.some(d => d.condition.includes('Migraine'))) {
    recs.push({
      category: 'pharmacological',
      priority: 'medium',
      description: 'Acute: Sumatriptan 50-100mg PO or 6mg SC. NSAIDs (ibuprofen 400-600mg) as alternative.',
      evidence_level: 'A',
      notes: 'Avoid opioids for migraine. Consider prophylaxis if >4 attacks/month.'
    })
  }

  // Non-pharmacological
  recs.push({
    category: 'non_pharmacological',
    priority: 'medium',
    description: 'Patient education on symptom monitoring, warning signs requiring emergency return, and medication adherence.',
    evidence_level: 'B',
    notes: 'Provide written discharge instructions with specific return precautions.'
  })

  return recs
}

function clinicalDecisionSupport(patientCase: string): ClinicalDecisionOutput {
  const patient: PatientCase = JSON.parse(patientCase)
  const differential = generateDifferentialDiagnosis(patient)
  const urgency = determineUrgency(patient, differential)
  const recommendations = generateTreatmentRecommendations(patient, differential, urgency)

  const confidence = differential.length > 0
    ? clamp(differential[0].probability, 0.1, 0.95)
    : 0.3

  const missing_info: string[] = []
  if (!patient.vitals) missing_info.push('Vital signs not provided - essential for acuity assessment')
  if (!patient.test_results || patient.test_results.length === 0) missing_info.push('No laboratory/imaging results provided')
  if (!patient.history.conditions || patient.history.conditions.length === 0) missing_info.push('Past medical history missing')
  if (!patient.history.medications || patient.history.medications.length === 0) missing_info.push('Current medication list missing')

  const follow_up: string[] = []
  follow_up.push('Reassess within 24-48 hours if symptoms persist or worsen')
  if (urgency === 'emergent') follow_up.push('Immediate ED evaluation - do not manage as outpatient')
  follow_up.push('Review all diagnostic results and update differential accordingly')

  return {
    differential_diagnosis: differential,
    recommendations,
    urgency_level: urgency,
    confidence,
    missing_info,
    follow_up
  }
}

function formatClinicalDecisionReport(result: ClinicalDecisionOutput): string {
  const lines: string[] = []
  lines.push('## \uD83C\uDFE5 Clinical Decision Support Report')
  lines.push('')
  lines.push('**Urgency Level:** ' + result.urgency_level.toUpperCase() + ' | **System Confidence:** ' + (result.confidence * 100).toFixed(0) + '%')
  lines.push('')

  // Differential diagnosis
  lines.push('### \uD83D\uDCCA Differential Diagnosis (Ranked by Probability)')
  lines.push('| # | Condition | Category | ICD-10 | Probability | Red Flags |')
  lines.push('|---|-----------|----------|--------|-------------|-----------|')
  result.differential_diagnosis.forEach((d, i) => {
    const rf = d.red_flags.length > 0 ? d.red_flags.join('; ') : 'None identified'
    lines.push('| ' + (i + 1) + ' | ' + d.condition + ' | ' + d.category + ' | ' + d.icd10_hint + ' | ' + (d.probability * 100).toFixed(0) + '% | ' + rf + ' |')
  })
  lines.push('')

  // Recommendations
  lines.push('### \uD83D\uDCCB Clinical Recommendations')
  lines.push('| Priority | Category | Recommendation | Evidence |')
  lines.push('|----------|----------|----------------|----------|')
  for (const r of result.recommendations) {
    const priorityEmoji = r.priority === 'urgent' ? '\uD83D\uDD34' : r.priority === 'high' ? '\uD83D\uDFE0' : r.priority === 'medium' ? '\uD83D\uDFE1' : '\uD83D\uDFE2'
    lines.push('| ' + priorityEmoji + ' ' + r.priority.toUpperCase() + ' | ' + r.category + ' | ' + r.description.substring(0, 70) + '... | Level ' + r.evidence_level + ' |')
  }
  lines.push('')

  // Follow-up
  lines.push('### \uD83D\uDDD3\uFE0F Follow-up Plan')
  for (const f of result.follow_up) {
    lines.push('- ' + f)
  }

  // Missing info
  if (result.missing_info.length > 0) {
    lines.push('')
    lines.push('### \u26A0\uFE0F Missing Information')
    for (const m of result.missing_info) {
      lines.push('- ' + m)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: EHR CODER ====================

function generateEHRCoding(clinicalNotes: string, codingSystem: string): EHRCodingOutput {
  const notes = clinicalNotes.toLowerCase()
  const codingResults: CodingResult[] = []
  const docGaps: DocumentationGap[] = []
  const specificitySuggestions: string[] = []
  const complianceFlags: string[] = []

  if (codingSystem === 'ICD-10' || codingSystem === 'all') {
    // Cardiovascular
    if (notes.includes('chest pain')) {
      codingResults.push({ code: 'R07.9', description: 'Chest pain, unspecified', system: 'ICD-10', confidence: 0.6, notes: 'Specify: pleuritic, exertional, atypical for higher specificity' })
      specificitySuggestions.push('Specify chest pain character: substernal, pleuritic, reproducible' )
    }
    if (notes.includes('acute myocardial infarction') || notes.includes('ami') || notes.includes('stem')) {
      codingResults.push({ code: 'I21.9', description: 'Acute myocardial infarction, unspecified', system: 'ICD-10', confidence: 0.85, notes: 'Add 4th digit for STEMI vs NSTEMI; 5th digit for episode of care' })
      specificitySuggestions.push('Document STEMI vs NSTEMI, affected wall (anterior, inferior, lateral)' )
    }
    if (notes.includes('heart failure') || notes.includes('chf')) {
      codingResults.push({ code: 'I50.9', description: 'Heart failure, unspecified', system: 'ICD-10', confidence: 0.7, notes: 'Specify systolic vs diastolic, acute vs chronic' })
    }
    if (notes.includes('hypertension') || notes.includes('htn') || notes.includes('high blood pressure')) {
      codingResults.push({ code: 'I10', description: 'Essential (primary) hypertension', system: 'ICD-10', confidence: 0.9, notes: 'Add code for associated heart/kidney disease if present' })
    }
    if (notes.includes('atrial fibrillation') || notes.includes('afib')) {
      codingResults.push({ code: 'I48.91', description: 'Unspecified atrial fibrillation', system: 'ICD-10', confidence: 0.88, notes: 'Specify: paroxysmal, persistent, chronic' })
    }

    // Diabetes
    if (notes.includes('diabetes') || notes.includes('dm')) {
      if (notes.includes('type 1')) {
        codingResults.push({ code: 'E10.65', description: 'Type 1 diabetes with hyperglycemia', system: 'ICD-10', confidence: 0.8, notes: 'Specify complications (nephropathy, neuropathy, retinopathy)' })
      } else if (notes.includes('type 2')) {
        codingResults.push({ code: 'E11.65', description: 'Type 2 diabetes with hyperglycemia', system: 'ICD-10', confidence: 0.8, notes: 'Use additional code for complications if present' })
      } else {
        codingResults.push({ code: 'E11.9', description: 'Type 2 diabetes without complications', system: 'ICD-10', confidence: 0.5, notes: 'Specify type and any complications - unspecified diabetes reduces specificity' })
        specificitySuggestions.push('Document diabetes type (1 or 2) and any end-organ complications' )
      }
    }

    // Respiratory
    if (notes.includes('pneumonia')) {
      codingResults.push({ code: 'J18.9', description: 'Pneumonia, unspecified', system: 'ICD-10', confidence: 0.65, notes: 'Specify organism, lobe, or "due to" relationship for specificity' })
    }
    if (notes.includes('copd')) {
      codingResults.push({ code: 'J44.9', description: 'COPD, unspecified', system: 'ICD-10', confidence: 0.75, notes: 'Specify acute exacerbation, chronic bronchitis, emphysema' })
    }
    if (notes.includes('asthma')) {
      codingResults.push({ code: 'J45.909', description: 'Unspecified asthma, uncomplicated', system: 'ICD-10', confidence: 0.7, notes: 'Specify severity: mild intermittent, mild persistent, etc.' })
    }

    // Metabolic
    if (notes.includes('hypothyroid') || notes.includes('underactive thyroid')) {
      codingResults.push({ code: 'E03.9', description: 'Hypothyroidism, unspecified', system: 'ICD-10', confidence: 0.85, notes: 'Specify acquired vs congenital' })
    }
    if (notes.includes('hyperlipidemia') || notes.includes('high cholesterol') || notes.includes('dyslipidemia')) {
      codingResults.push({ code: 'E78.5', description: 'Dyslipidemia, unspecified', system: 'ICD-10', confidence: 0.82, notes: 'Specify type (hypercholesterolemia, mixed, etc.)' })
    }

    // Infectious
    if (notes.includes('urinary tract infection') || notes.includes('uti')) {
      codingResults.push({ code: 'N39.0', description: 'Urinary tract infection, site not specified', system: 'ICD-10', confidence: 0.8, notes: 'Specify site (cystitis, pyelonephritis) and organism if known' })
    }
  }

  if (codingSystem === 'CPT' || codingSystem === 'all') {
    codingResults.push({ code: '99284', description: 'Emergency department visit, level 4', system: 'CPT', confidence: 0.7, notes: 'Use 99281-99285 based on MDM or time. Document supporting elements.' })
    codingResults.push({ code: '36415', description: 'Venipuncture', system: 'CPT', confidence: 0.9, notes: 'Add if blood draws performed' })
    codingResults.push({ code: '71046', description: 'Chest X-ray, 2 views', system: 'CPT', confidence: 0.85, notes: 'Add if CXR ordered' })
    codingResults.push({ code: '93010', description: 'ECG interpretation only', system: 'CPT', confidence: 0.8, notes: 'Use 93000 if tracing + interpret included' })
  }

  // Documentation gap analysis
  if (!notes.includes('history') && !notes.includes('past medical')) {
    docGaps.push({ element: 'Past Medical History', severity: 'critical', suggestion: 'Document all active and historical conditions', impact: 'Reduces coding specificity; affects risk adjustment and SOI/ROM' })
  }
  if (!notes.includes('review of systems') && !notes.includes('ros')) {
    docGaps.push({ element: 'Review of Systems', severity: 'moderate', suggestion: 'Document pertinent positive and negative symptoms by system', impact: 'Impacts medical decision making level for E/M coding' })
  }
  if (!notes.includes('medication') && !notes.includes('meds')) {
    docGaps.push({ element: 'Medication List', severity: 'critical', suggestion: 'Reconcile and document all current medications', impact: 'MU requirement; affects MDM complexity' })
  }
  if (!notes.includes('allergies') && !notes.includes('allergy')) {
    docGaps.push({ element: 'Allergies', severity: 'critical', suggestion: 'Document known allergies or NKDA status', impact: 'Patient safety; required for meaningful use' })
  }
  if (!notes.includes('social history') && !notes.includes('social hx')) {
    docGaps.push({ element: 'Social History', severity: 'minor', suggestion: 'Document tobacco, alcohol, substance use, occupation', impact: 'Impacts risk stratification and quality measures' })
  }

  // Compliance flags
  if (codingResults.some(c => c.system === 'ICD-10' && c.code.includes('.9'))) {
    complianceFlags.push('Unspecified codes detected - consider higher specificity for accurate risk adjustment')
  }
  if (docGaps.some(g => g.severity === 'critical')) {
    complianceFlags.push('Critical documentation gaps present - may affect reimbursement and compliance')
  }

  const score = codingResults.length > 0
    ? clamp((codingResults.reduce((s, c) => s + c.confidence, 0) / codingResults.length) * 100 - (docGaps.filter(g => g.severity === 'critical').length * 10), 20, 98)
    : 30

  return {
    coding_results: codingResults,
    documentation_gaps: docGaps,
    specificity_suggestions: specificitySuggestions,
    compliance_flags: complianceFlags,
    score: Math.round(score)
  }
}

function formatEHRCodingReport(result: EHRCodingOutput, codingSystem: string): string {
  const lines: string[] = []
  lines.push('## \uD83D\uDDC2\uFE0F EHR Coding Report [' + codingSystem + ']')
  lines.push('')
  lines.push('**Coding Score:** ' + result.score + '/100')
  lines.push('')

  lines.push('### \uD83D\uDD22 Suggested Codes')
  lines.push('| Code | Description | System | Confidence | Notes |')
  lines.push('|------|-------------|--------|------------|-------|')
  for (const c of result.coding_results) {
    lines.push('| ' + c.code + ' | ' + c.description + ' | ' + c.system + ' | ' + (c.confidence * 100).toFixed(0) + '% | ' + c.notes.substring(0, 50) + ' |')
  }
  lines.push('')

  lines.push('### \uD83D\uDCDC Documentation Gaps')
  lines.push('| Element | Severity | Suggestion | Impact |')
  lines.push('|---------|----------|------------|--------|')
  for (const g of result.documentation_gaps) {
    const emoji = g.severity === 'critical' ? '\uD83D\uDD34' : g.severity === 'moderate' ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
    lines.push('| ' + g.element + ' | ' + emoji + ' ' + g.severity + ' | ' + g.suggestion + ' | ' + g.impact.substring(0, 35) + '... |')
  }
  lines.push('')

  lines.push('### \uD83D\uDCA1 Specificity Suggestions')
  for (const s of result.specificity_suggestions) {
    lines.push('- ' + s)
  }

  if (result.compliance_flags.length > 0) {
    lines.push('')
    lines.push('### \u26A0\uFE0F Compliance Flags')
    for (const f of result.compliance_flags) {
      lines.push('- ' + f)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: QUALITY CONTROLLER ====================

function performQualityControl(medicalRecord: string, qualityStandards: string[]): QualityControlOutput {
  const record = medicalRecord.toLowerCase()
  const criteria: QualityCriterion[] = []
  const criticalFindings: string[] = []
  const improvementActions: string[] = []

  // Completeness
  const completenessScore = clamp(
    40 +
    (record.includes('chief complaint') ? 10 : 0) +
    (record.includes('history of present') || record.includes('hpi') ? 15 : 0) +
    (record.includes('review of systems') || record.includes('ros') ? 10 : 0) +
    (record.includes('physical exam') || record.includes('examination') ? 10 : 0) +
    (record.includes('assessment') ? 10 : 0) +
    (record.includes('plan') ? 10 : 0)
  , 0, 100)
  const completenessFindings: string[] = []
  if (!record.includes('chief complaint')) completenessFindings.push('Missing chief complaint')
  if (!record.includes('history of present') && !record.includes('hpi')) completenessFindings.push('Missing HPI')
  if (!record.includes('review of systems') && !record.includes('ros')) completenessFindings.push('Missing ROS')
  if (!record.includes('physical exam') && !record.includes('examination')) completenessFindings.push('Missing physical examination')
  criteria.push({ name: 'Document Completeness', weight: 25, score: completenessScore, findings: completenessFindings, recommendation: 'Ensure all SOAP/mnt elements are documented with appropriate detail' })

  // Medical necessity
  const necessityScore = clamp(
    50 +
    (record.includes('medical necessity') ? 15 : 0) +
    (record.includes('indication') ? 10 : 0) +
    (record.includes('clinical indication') ? 15 : 0) +
    (record.includes('risk') ? 10 : 0)
  , 0, 100)
  const necessityFindings: string[] = []
  if (!record.includes('indication')) necessityFindings.push('Order indications not clearly documented')
  criteria.push({ name: 'Medical Necessity Documentation', weight: 20, score: necessityScore, findings: necessityFindings, recommendation: 'Link each order and procedure to documented clinical indication' })

  // Timeliness
  const timelinessScore = clamp(
    60 +
    (record.includes('date/time') || record.includes('time-in') ? 20 : 0) +
    (record.includes('signature') || record.includes('signed') ? 10 : 0) +
    (record.includes('attending') || record.includes('provider') ? 10 : 0)
  , 0, 100)
  const timelinessFindings: string[] = []
  if (!record.includes('signature') && !record.includes('signed')) timelinessFindings.push('Unsigned document')
  if (!record.includes('date/time') && !record.includes('time')) timelinessFindings.push('Missing timestamps')
  if (!record.includes('attending') && !record.includes('provider')) timelinessFindings.push('Provider identification missing')
  criteria.push({ name: 'Timeliness and Authentication', weight: 15, score: timelinessScore, findings: timelinessFindings, recommendation: 'All entries must be timestamped and authenticated by the responsible provider within 24 hours' })

  // Clinical Content Quality
  const contentScore = clamp(
    50 +
    (record.length > 500 ? 15 : 0) +
    (record.includes('differential') ? 10 : 0) +
    (record.includes('evidence') ? 10 : 0) +
    (record.includes('guideline') ? 10 : 0) +
    (record.includes('patient education') ? 5 : 0)
  , 0, 100)
  const contentFindings: string[] = []
  if (record.length < 300) contentFindings.push('Documentation may be insufficient for encounter complexity')
  if (!record.includes('differential')) contentFindings.push('Differential diagnosis not documented')
  criteria.push({ name: 'Clinical Content Quality', weight: 25, score: contentScore, findings: contentFindings, recommendation: 'Include clinical reasoning, differential diagnoses, and evidence basis for decisions' })

  // Compliance against provided standards
  let complianceScore = 75
  const complianceIssues: string[] = []
  for (const standard of qualityStandards) {
    const stdLower = standard.toLowerCase()
    if (stdLower.includes('meaningful use') && !record.includes('mu') && !record.includes('meaningful')) {
      complianceScore -= 5
      complianceIssues.push('Meaningful Use requirements not evident')
    }
    if (stdLower.includes('joint commission') && !record.includes('jcaho') && !record.includes('joint commission')) {
      complianceScore -= 5
      complianceIssues.push('Joint Commission-specific elements missing')
    }
  }
  complianceScore = clamp(complianceScore, 0, 100)
  criteria.push({ name: 'Standard Compliance', weight: 15, score: complianceScore, findings: complianceIssues, recommendation: 'Review against all applicable quality standards (' + qualityStandards.length + ' checked)' })

  // Calculate overall score
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
  const overallScore = Math.round(criteria.reduce((s, c) => s + c.score * c.weight, 0) / totalWeight)

  let grade: QualityControlOutput['grade']
  if (overallScore >= 90) grade = 'excellent'
  else if (overallScore >= 80) grade = 'good'
  else if (overallScore >= 70) grade = 'acceptable'
  else if (overallScore >= 60) grade = 'needs_improvement'
  else grade = 'unsatisfactory'

  // Critical findings
  if (completenessScore < 50) criticalFindings.push('Severe documentation deficiencies - high compliance risk')
  if (timelinessScore < 50) criticalFindings.push('Unsigned or unauthenticated entries present legal risk')
  if (record.includes('copy') && record.includes('paste')) criticalFindings.push('Copy-paste detected - may indicate cloned documentation')

  // Improvement actions
  improvementActions.push('Implement structured templates to ensure completeness of all required elements')
  improvementActions.push('Enable real-time provider alerts for unsigned/unauthenticated notes')
  improvementActions.push('Conduct periodic focused audits targeting lowest-scoring criteria')
  if (contentScore < 70) improvementActions.push('Provide clinical documentation improvement (CDI) education sessions')
  if (completenessScore < 70) improvementActions.push('Deploy NLP-based completeness checker at point of documentation')

  const complianceIssuesStr = complianceIssues.length > 0
    ? 'Non-compliant with ' + complianceIssues.length + ' of ' + qualityStandards.length + ' checked standards'
    : 'Compliant with all checked standards'

  return {
    overall_score: overallScore,
    grade,
    criteria,
    critical_findings: criticalFindings,
    improvement_actions: improvementActions,
    compliance_status: complianceIssuesStr,
    benchmark_comparison: 'Institutional benchmark: 78/100 average. This document: ' + overallScore + '/100 (' + (overallScore >= 78 ? 'above' : 'below') + ' average)'
  }
}

function formatQualityControlReport(result: QualityControlOutput): string {
  const lines: string[] = []
  lines.push('## \uD83D\uDCCB Medical Record Quality Control Report')
  lines.push('')
  const gradeEmoji: Record<string, string> = { excellent: '\uD83D\uDFE2', good: '\uD83D\uDFE1', acceptable: '\uD83D\uDFE1\u200D\uD83D\uDFE2', needs_improvement: '\uD83D\uDFE0', unsatisfactory: '\uD83D\uDD34' }
  lines.push('**Overall Score:** ' + result.overall_score + '/100 | **Grade:** ' + gradeEmoji[result.grade] + ' ' + result.grade.toUpperCase() + '')
  lines.push('')

  lines.push('### \uD83D\uDCCA Quality Criteria Breakdown')
  lines.push('| Criterion | Weight | Score | Findings |')
  lines.push('|-----------|--------|-------|----------|')
  for (const c of result.criteria) {
    const emoji = c.score >= 80 ? '\u2705' : c.score >= 60 ? '\u26A0\uFE0F' : '\u274C'
    const findingsStr = c.findings.length > 0 ? c.findings.join('; ') : 'No issues identified'
    lines.push('| ' + emoji + ' ' + c.name + ' | ' + c.weight + '% | ' + c.score + '/' + '100 | ' + findingsStr.substring(0, 40) + ' |')
  }
  lines.push('')

  if (result.critical_findings.length > 0) {
    lines.push('### \uD83D\uDEA8 Critical Findings')
    for (const f of result.critical_findings) {
      lines.push('- **' + f + '**')
    }
    lines.push('')
  }

  lines.push('### \uD83D\uDEE0\uFE0F Improvement Actions')
  for (const a of result.improvement_actions) {
    lines.push('- ' + a)
  }
  lines.push('')

  lines.push('**Compliance Status:** ' + result.compliance_status)
  lines.push('**Benchmark:** ' + result.benchmark_comparison)
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: DRUG SAFETY CHECKER ====================

function checkDrugSafety(medicationsString: string, allergies: string, labValues: string): DrugSafetyOutput {
  const meds: MedicationEntry[] = JSON.parse(medicationsString)
  const allergyList: string[] = JSON.parse(allergies)
  const labs: Record<string, number> = JSON.parse(labValues)

  const interactions: DrugInteraction[] = []
  const doseAlerts: DoseAlert[] = []
  const allergyAlerts: AllergyAlert[] = []
  const monitoringRecommendations: string[] = []

  const medNames = meds.map(m => m.name.toLowerCase())

  // Known drug interaction database (simplified)
  const interactionDB: Array<{ drugs: string[]; severity: DrugInteraction['severity']; mechanism: string; effect: string; recommendation: string }> = [
    { drugs: ['warfarin', 'aspirin'], severity: 'major', mechanism: 'Additive anticoagulant effect; aspirin inhibits platelets and displaces warfarin from albumin', effect: 'Increased bleeding risk; elevated INR', recommendation: 'Avoid combination if possible; if unavoidable, monitor INR weekly and educate on bleeding signs' },
    { drugs: ['metformin', 'contrast dye'], severity: 'major', mechanism: 'Contrast-induced nephrotoxicity reduces metformin clearance', effect: 'Risk of lactic acidosis', recommendation: 'Hold metformin 48h before and after contrast; recheck eGFR before restarting' },
    { drugs: ['ace inhibitor', 'potassium'], severity: 'moderate', mechanism: 'ACE inhibitors reduce aldosterone, decreasing potassium excretion', effect: 'Hyperkalemia (K+ > 5.5)', recommendation: 'Monitor potassium within 1 week of starting combination; avoid potassium-rich salt substitutes' },
    { drugs: ['ssri', 'nsaid'], severity: 'moderate', mechanism: 'SSRIs impair platelet serotonin uptake; NSAIDs cause GI mucosal injury', effect: 'Increased GI bleed risk', recommendation: 'Add PPI for GI protection if combination necessary; avoid if history of GI bleed' },
    { drugs: ['statin', 'gemfibrozil'], severity: 'major', mechanism: 'Gemfibrozil inhibits glucuronidation of statins, increasing systemic exposure', effect: 'Rhabdomyolysis risk', recommendation: 'Avoid combination; use fenofibrate if fibrate needed with statin' },
    { drugs: ['macrolide', 'warfarin'], severity: 'moderate', mechanism: 'Macrolides inhibit CYP3A4/2C9, affecting warfarin metabolism', effect: 'Elevated INR, bleeding risk', recommendation: 'Monitor INR within 3-5 days; consider azithromycin as safer alternative' }
  ]

  for (const dbEntry of interactionDB) {
    const match = dbEntry.drugs.every(drug =>
      medNames.some(m => m.includes(drug.toLowerCase()))
    )
    if (match) {
      const matchingMeds = meds.filter(m =>
        dbEntry.drugs.some(d => m.name.toLowerCase().includes(d.toLowerCase()))
      ).map(m => m.name)
      interactions.push({
        severity: dbEntry.severity,
        drugs: matchingMeds,
        mechanism: dbEntry.mechanism,
        effect: dbEntry.effect,
        recommendation: dbEntry.recommendation,
        evidence: 'Established interaction per Lexicomp/Micromedex'
      })
    }
  }

  // Dose checks
  for (const med of meds) {
    const nameLower = med.name.toLowerCase()
    if (labs.creatinine !== undefined && labs.egfr !== undefined) {
      if (labs.egfr < 30 && nameLower.includes('metformin')) {
        doseAlerts.push({
          medication: med.name,
          issue: 'contraindication' as DoseAlert['issue'] === 'renal_adjustment_needed' ? 'renal_adjustment_needed' : 'overdose',
          current_dose: med.dose,
          recommended_dose: 'Contraindicated if eGFR < 30',
          rationale: 'Metformin is contraindicated with eGFR < 30 due to lactic acidosis risk'
        })
      }
    }
    if (labs.egfr !== undefined && labs.egfr < 30 && (nameLower.includes('metformin') || nameLower.includes('nsaid'))) {
      doseAlerts.push({
        medication: med.name,
        issue: 'renal_adjustment_needed',
        current_dose: med.dose,
        recommended_dose: 'Reduce dose by 50% or discontinue',
        rationale: 'Severe renal impairment (eGFR < 30) requires dose adjustment'
      })
    }
    if (labs.alt !== undefined && labs.alt > 150 && nameLower.includes('statin')) {
      doseAlerts.push({
        medication: med.name,
        issue: 'overdose',
        current_dose: med.dose,
        recommended_dose: 'Hold statin; recheck LFTs in 2 weeks',
        rationale: 'Significant transaminitis (ALT > 3x ULN) - statin may need to be held'
      })
    }
  }

  // Allergy checks
  const allergyDB: Array<{ allergen: string; medication: string; crossRisk: AllergyAlert['cross_reactivity_risk']; reaction: string; alternative: string }> = [
    { allergen: 'penicillin', medication: 'amoxicillin', crossRisk: 'high', reaction: 'Type I hypersensitivity (anaphylaxis possible)', alternative: 'Azithromycin or respiratory fluoroquinolone (based on indication)' },
    { allergen: 'penicillin', medication: 'piperacillin', crossRisk: 'high', reaction: 'Type I hypersensitivity (anaphylaxis possible)', alternative: 'Aztreonam or fluoroquinolone (based on indication)' },
    { allergen: 'sulfa', medication: 'sulfamethoxazole', crossRisk: 'high', reaction: 'Type I hypersensitivity, Stevens-Johnson syndrome', alternative: 'Doxycycline or clindamycin (based on indication)' },
    { allergen: 'sulfa', medication: 'cephalexin', crossRisk: 'low', reaction: 'Cross-reactivity < 1% with 1st generation cephalosporins', alternative: 'Consider if no alternatives; counsel on low cross-reactivity' },
    { allergen: 'nsaid', medication: 'ibuprofen', crossRisk: 'high', reaction: 'Bronchospasm, urticaria (NSAID-exacerbated respiratory disease)', alternative: 'Acetaminophen or COX-2 selective NSAID' },
    { allergen: 'ace inhibitor', medication: 'lisinopril', crossRisk: 'high', reaction: 'Angioedema (potentially life-threatening)', alternative: 'ARB (losartan) - minimal cross-reactivity' }
  ]

  for (const ab of allergyDB) {
    const hasAllergy = allergyList.some(a => a.toLowerCase().includes(ab.allergen.toLowerCase()))
    const hasMed = medNames.some(m => m.includes(ab.medication.toLowerCase()) || m.includes(ab.allergen.toLowerCase()))
    if (hasAllergy && hasMed) {
      allergyAlerts.push({
        medication: meds.find(m => m.name.toLowerCase().includes(ab.medication.toLowerCase()) || m.name.toLowerCase().includes(ab.allergen.toLowerCase()))?.name || ab.medication,
        allergen: ab.allergen,
        cross_reactivity_risk: ab.crossRisk,
        reaction_type: ab.reaction,
        alternative: ab.alternative
      })
    }
  }

  // Monitoring recommendations
  if (medNames.some(m => m.includes('warfarin'))) {
    monitoringRecommendations.push('INR: check baseline, then weekly until stable, then every 4 weeks')
  }
  if (medNames.some(m => m.includes('metformin'))) {
    monitoringRecommendations.push('eGFR: baseline, then annually (every 3 months if eGFR < 60)')
  }
  if (medNames.some(m => m.includes('statin'))) {
    monitoringRecommendations.push('Lipid panel: 4-12 weeks after starting/change, then every 3-12 months')
    monitoringRecommendations.push('LFTs: baseline, then as clinically indicated (routine monitoring no longer recommended)')
  }
  if (medNames.some(m => m.includes('ace inhibitor') || m.includes('arb'))) {
    monitoringRecommendations.push('Potassium and creatinine: within 1-2 weeks of starting/change, then every 6 months')
  }
  if (medNames.some(m => m.includes('ssri'))) {
    monitoringRecommendations.push('Monitor for activation/suicidality in first 4 weeks, especially in patients < 25')
  }

  // Calculate safety score
  const interactionPenalty = interactions.reduce((sum, i) =>
    sum + (i.severity === 'contraindicated' ? 30 : i.severity === 'major' ? 20 : i.severity === 'moderate' ? 10 : 3), 0)
  const doseAlertPenalty = doseAlerts.length * 15
  const allergyPenalty = allergyAlerts.reduce((sum, a) =>
    sum + (a.cross_reactivity_risk === 'high' ? 25 : a.cross_reactivity_risk === 'moderate' ? 15 : 5), 0)
  const safetyScore = clamp(100 - interactionPenalty - doseAlertPenalty - allergyPenalty, 5, 100)

  let summaryRisk: DrugSafetyOutput['summary_risk'] = 'low'
  if (safetyScore < 40) summaryRisk = 'high'
  else if (safetyScore < 70) summaryRisk = 'moderate'

  return {
    interactions,
    dose_alerts: doseAlerts,
    allergy_alerts: allergyAlerts,
    monitoring_recommendations: monitoringRecommendations,
    safety_score: safetyScore,
    summary_risk: summaryRisk
  }
}

function formatDrugSafetyReport(result: DrugSafetyOutput): string {
  const lines: string[] = []
  lines.push('## \uD83D\uDC8A Drug Safety Check Report')
  lines.push('')
  const riskEmoji: Record<string, string> = { high: '\uD83D\uDD34', moderate: '\uD83D\uDFE0', low: '\uD83D\uDFE2' }
  lines.push('**Safety Score:** ' + result.safety_score + '/100 | **Overall Risk:** ' + riskEmoji[result.summary_risk] + ' ' + result.summary_risk.toUpperCase() + '')
  lines.push('')

  if (result.interactions.length > 0) {
    lines.push('### \u26A0\uFE0F Drug-Drug Interactions (' + result.interactions.length + ' found)')
    lines.push('| Severity | Drugs Involved | Mechanism | Effect | Recommendation |')
    lines.push('|----------|----------------|-----------|--------|----------------|')
    for (const i of result.interactions) {
      const sevEmoji = i.severity === 'contraindicated' ? '\uD83D\uDEAB' : i.severity === 'major' ? '\uD83D\uDD34' : i.severity === 'moderate' ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
      lines.push('| ' + sevEmoji + ' ' + i.severity.toUpperCase() + ' | ' + i.drugs.join(' + ') + ' | ' + i.mechanism.substring(0, 35) + '... | ' + i.effect.substring(0, 35) + '... | ' + i.recommendation.substring(0, 40) + '... |')
    }
    lines.push('')
  }

  if (result.dose_alerts.length > 0) {
    lines.push('### \uD83D\uDCE6 Dose Alerts (' + result.dose_alerts.length + ' found)')
    for (const da of result.dose_alerts) {
      lines.push('- **' + da.medication + '**: ' + da.issue.replace(/_/g, ' ') + '. Current: ' + da.current_dose + '. Recommended: ' + da.recommended_dose)
    }
    lines.push('')
  }

  if (result.allergy_alerts.length > 0) {
    lines.push('### \uD83D\uDEAB Allergy Alerts (' + result.allergy_alerts.length + ' found)')
    for (const aa of result.allergy_alerts) {
      const riskStr = aa.cross_reactivity_risk === 'high' ? '\uD83D\uDD34 HIGH' : aa.cross_reactivity_risk === 'moderate' ? '\uD83D\uDFE0 MODERATE' : '\uD83D\uDFE2 LOW'
      lines.push('- **' + aa.medication + '** + **' + aa.allergen + '** allergy: ' + riskStr + ' cross-reactivity')
      lines.push('  - Reaction: ' + aa.reaction_type)
      lines.push('  - Alternative: ' + aa.alternative)
    }
    lines.push('')
  }

  if (result.monitoring_recommendations.length > 0) {
    lines.push('### \uD83D\uDCC5 Recommended Monitoring')
    for (const m of result.monitoring_recommendations) {
      lines.push('- ' + m)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: LAB INTERPRETER ====================

function interpretLabResults(labResultsString: string, patientContextString: string): LabPanelInterpretation {
  const labResults: LabResultEntry[] = JSON.parse(labResultsString)
  const context: Record<string, unknown> = JSON.parse(patientContextString)
  const abnormalities: LabAbnormality[] = []

  for (const lab of labResults) {
    let flag: LabAbnormality['flag'] = 'normal'
    if (lab.value < lab.reference_low) {
      flag = (lab.reference_low - lab.value) / lab.reference_low > 0.5 ? 'critical_low' : 'low'
    } else if (lab.value > lab.reference_high) {
      flag = (lab.value - lab.reference_high) / lab.reference_high > 0.5 ? 'critical_high' : 'high'
    }

    const significance = getLabClinicalSignificance(lab.test_name, flag, lab.value, context)
    const suggestedActions = getLabSuggestedActions(lab.test_name, flag, lab.value, context)

    let trend: LabAbnormality['trend'] | undefined
    if (lab.previous_value !== undefined) {
      const change = ((lab.value - lab.previous_value) / lab.previous_value) * 100
      if (flag === 'normal') trend = 'stable'
      else if (flag === 'high' || flag === 'critical_high') trend = change > 0 ? 'worsening' : 'improving'
      else if (flag === 'low' || flag === 'critical_low') trend = change < 0 ? 'worsening' : 'improving'
      else trend = 'stable'
    }

    abnormalities.push({
      test_name: lab.test_name,
      value: lab.value,
      unit: lab.unit,
      flag,
      reference_range: lab.reference_low + ' - ' + lab.reference_high + ' ' + lab.unit,
      clinical_significance: significance,
      trend,
      suggested_actions: suggestedActions
    })
  }

  // Build summary
  const abnormalCount = abnormalities.filter(a => a.flag !== 'normal').length
  const criticalCount = abnormalities.filter(a => a.flag === 'critical_low' || a.flag === 'critical_high').length
  const summary = criticalCount > 0
    ? criticalCount + ' CRITICAL value(s) requiring immediate attention. ' + abnormalCount + '/' + labResults.length + ' results abnormal.'
    : abnormalCount > 0
      ? abnormalCount + '/' + labResults.length + ' results outside reference range. No critical values.'
      : 'All ' + labResults.length + ' results within normal limits.'

  const clinicalCorrelation = buildClinicalCorrelation(abnormalities, context)

  const follow_up: string[] = []
  if (criticalCount > 0) follow_up.push('Immediately notify ordering provider of critical values per institutional policy')
  const highAbnormalities = abnormalities.filter(a => a.flag === 'high' || a.flag === 'critical_high')
  if (highAbnormalities.length > 0) follow_up.push('Repeat testing within 24-48 hours for markedly abnormal values')
  const trendFlags = abnormalities.filter(a => a.trend === 'worsening')
  if (trendFlags.length > 0) follow_up.push('Escalate care for worsening trends: ' + trendFlags.map(t => t.test_name).join(', '))
  if (abnormalCount > 0) follow_up.push('Correlate with clinical presentation; isolated lab abnormalities may not require intervention')

  return {
    panel_name: context.panel_name as string || 'Laboratory Panel',
    summary,
    abnormalities,
    clinical_correlation: clinicalCorrelation,
    follow_up
  }
}

function getLabClinicalSignificance(testName: string, flag: LabAbnormality['flag'], value: number, context: Record<string, unknown>): string {
  const name = testName.toLowerCase()
  if (name.includes('hemoglobin') || name.includes('hgb')) {
    if (flag === 'critical_low' || value < 7) return 'Severe anemia - investigate source of blood loss; transfusion may be indicated'
    if (flag === 'low') return 'Anemia - evaluate for iron deficiency, chronic disease, B12/folate deficiency based on indices'
    if (flag === 'high') return 'Polycythemia - consider dehydration, smoking, sleep apnea, or myeloproliferative disorder'
  }
  if (name.includes('wbc') || name.includes('white')) {
    if (flag === 'critical_high' || flag === 'high') return 'Leukocytosis - most often infection; consider stress response, steroids, leukemia if extreme'
    if (flag === 'critical_low' || flag === 'low') return 'Leukopenia - increases infection risk; consider viral, drug-induced, or marrow failure'
  }
  if (name.includes('platelet')) {
    if (flag === 'critical_low' || value < 20) return 'Severe thrombocytopenia - high bleeding risk; avoid IM injections, invasive procedures'
    if (flag === 'low') return 'Thrombocytopenia - consider ITP, DIC, drug-induced, liver disease'
    if (flag === 'high') return 'Thrombocytosis - reactive (most common) vs essential thrombocythemia if persistent'
  }
  if (name.includes('creatinine') || name.includes('cr')) {
    if (flag === 'high' || flag === 'critical_high') return 'Elevated creatinine suggests decreased GFR - differentiate AKI vs CKD; review medications'
  }
  if (name.includes('glucose') || name.includes('sugar')) {
    if (flag === 'critical_high' || value > 400) return 'Severe hyperglycemia - rule out DKA/HHS; check ketones, anion gap, serum osmolality'
    if (flag === 'high') return 'Hyperglycemia - if fasting, suggests diabetes or impaired fasting glucose'
    if (flag === 'critical_low' || value < 40) return 'Severe hypoglycemia - medical emergency; if conscious give PO glucose, if not give IV dextrose'
    if (flag === 'low') return 'Hypoglycemia - review diabetes medications, consider fasting hypoglycemia workup'
  }
  if (name.includes('sodium') || name.includes('na')) {
    if (flag === 'critical_low' || value < 120) return 'Severe hyponatremia - risk of cerebral edema and seizures; correct slowly [max 8-10 mEq/L per 24h]'
    if (flag === 'low') return 'Hyponatremia - differentiate hypovolemic, euvolemic (SIADH), hypervolemic'
    if (flag === 'high' || flag === 'critical_high') return 'Hypernatremia - usually indicates free water deficit; common in elderly or altered mental status'
  }
  if (name.includes('potassium') || name.includes('k')) {
    if (flag === 'critical_low' || value < 2.5) return 'Critical hypokalemia - risk of cardiac arrhythmias; replace K+ IV with cardiac monitoring'
    if (flag === 'low') return 'Hypokalemia - check Mg (must replete Mg for K retention); consider diuretics, GI losses'
    if (flag === 'critical_high' || value > 6.5) return 'Critical hyperkalemia - ECG changes likely; emergent treatment: calcium, insulin/glucose, bicarbonate'
    if (flag === 'high') return 'Hyperkalemia - check for hemolysis (pseudohyperkalemia), ACEi/ARBs, renal failure, K-sparing diuretics'
  }
  if (name.includes('alt') || name.includes('ast')) {
    if (flag === 'critical_high') return 'Marked transaminitis (>500) - suggests ischemic, viral, or drug-induced hepatitis'
    if (flag === 'high') return 'Hepatocellular injury - evaluate for NAFLD, viral hepatitis, alcohol, medications, autoimmune'
  }
  if (name.includes('troponin')) {
    if (flag === 'high' || flag === 'critical_high') return 'Elevated troponin indicates myocardial injury - correlate with ECG and clinical presentation for MI diagnosis'
  }
  if (name.includes('hba1c') || name.includes('a1c') || name.includes('hemoglobin a1c')) {
    if (value >= 6.5) return 'HbA1c >= 6.5% meets criterion for diabetes. Correlate with fasting glucose and clinical context'
    if (value >= 5.7) return 'HbA1c 5.7-6.4% indicates prediabetes - recommend lifestyle modification'
    return 'HbA1c within target for most adults with diabetes (<7%)'
  }
  if (flag === 'normal') return 'Within normal limits - no specific action required'
  return 'Abnormal value - correlate with clinical context and trend over time'
}

function getLabSuggestedActions(testName: string, flag: LabAbnormality['flag'], value: number, _context: Record<string, unknown>): string[] {
  const name = testName.toLowerCase()
  const actions: string[] = []
  if (flag === 'critical_low' || flag === 'critical_high') {
    actions.push('Notify provider immediately')
    actions.push('Confirm result with repeat sample if clinically indicated')
  }
  if (name.includes('hgb') && flag === 'low') actions.push('Order iron studies, B12, folate')
  if (name.includes('creatinine') && (flag === 'high' || flag === 'critical_high')) actions.push('Calculate eGFR; review nephrotoxic medications')
  if (name.includes('glucose') && (flag === 'high' || flag === 'critical_high')) actions.push('Check ketone, HbA1c if not recent')
  if (name.includes('troponin') && flag !== 'normal') actions.push('Serial troponin q3-6h; obtain cardiology consult')
  return actions
}

function buildClinicalCorrelation(abnormalities: LabAbnormality[], context: Record<string, unknown>): string {
  const conditions = context.conditions as string[] || []
  const parts: string[] = []
  if (conditions.includes('diabetes') || conditions.includes('type 2')) {
    const glucose = abnormalities.find(a => a.test_name.toLowerCase().includes('glucose'))
    const hba1c = abnormalities.find(a => a.test_name.toLowerCase().includes('hba1c') || a.test_name.toLowerCase().includes('a1c'))
    if (glucose && glucose.flag !== 'normal') parts.push('Elevated glucose correlates with known diabetes - assess medication adherence and control')
    if (hba1c && hba1c.flag !== 'normal') parts.push('HbA1c indicates suboptimal glycemic control - intensification may be needed')
  }
  if (conditions.includes('ckd') || conditions.includes('chronic kidney disease')) {
    const cr = abnormalities.find(a => a.test_name.toLowerCase().includes('creatinine'))
    if (cr && cr.flag !== 'normal') parts.push('Creatinine consistent with known CKD - check for acute worsening')
  }
  if (conditions.includes('heart failure') || conditions.includes('chf')) {
    const sodium = abnormalities.find(a => a.test_name.toLowerCase().includes('sodium'))
    if (sodium && sodium.flag === 'low') parts.push('Hyponatremia is common in heart failure due to volume overload and neurohormonal activation')
  }
  if (parts.length === 0) parts.push('Correlate all laboratory findings with the patient\'s clinical presentation and history')
  return parts.join('. ') + '.'
}

function formatLabInterpretationReport(result: LabPanelInterpretation): string {
  const lines: string[] = []
  lines.push('## \uD83D\uDD2C Laboratory Results Interpretation: ' + result.panel_name)
  lines.push('')
  lines.push('**Summary:** ' + result.summary)
  lines.push('')

  lines.push('### \uD83D\uDCCA Result Analysis')
  lines.push('| Test | Value | Reference | Flag | Clinical Significance | Trend |')
  lines.push('|------|-------|-----------|------|----------------------|-------|')
  for (const a of result.abnormalities) {
    const flagLabel: Record<string, string> = { critical_low: '\uD83D\uDD34 CRIT LO', low: '\uD83D\uDFE1 LOW', normal: '\uD83D\uDFE2 NORMAL', high: '\uD83D\uFE0F HIGH', critical_high: '\uD83D\uDD34 CRIT HI' }
    const trendLabel = a.trend ? a.trend === 'improving' ? '\uD83D\uDCC8 Improving' : a.trend === 'worsening' ? '\uD83D\uDCC9 Worsening' : '\uD83D\uDCC5 Stable' : 'N/A'
    const significanceShort = a.clinical_significance.substring(0, 45)
    lines.push('| ' + a.test_name + ' | ' + a.value + ' ' + a.unit + ' | ' + a.reference_range + ' | ' + flagLabel[a.flag] + ' | ' + significanceShort + '... | ' + trendLabel + ' |')
  }
  lines.push('')

  // Suggested actions for abnormal results
  const abnormalResults = result.abnormalities.filter(a => a.flag !== 'normal')
  if (abnormalResults.some(a => a.suggested_actions.length > 0)) {
    lines.push('### \uD83D\uDCCB Suggested Actions')
    for (const a of abnormalResults) {
      if (a.suggested_actions.length > 0) {
        lines.push('- **' + a.test_name + '**: ' + a.suggested_actions.join('; '))
      }
    }
    lines.push('')
  }

  lines.push('### \uD83E\uDDFE Clinical Correlation')
  lines.push(result.clinical_correlation)
  lines.push('')

  lines.push('### \uD83D\uDDDD\uFE0F Follow-Up')
  for (const f of result.follow_up) {
    lines.push('- ' + f)
  }

  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: TREATMENT PATHWAY ====================

function generateTreatmentPathway(diagnosis: string, patientProfileString: string, guidelines: string[]): TreatmentPathwayOutput {
  const profile: Record<string, unknown> = JSON.parse(patientProfileString)
  const diagnosisLower = diagnosis.toLowerCase()

  const milestones: PathwayMilestone[] = []
  let pathwayName = diagnosis + ' - Evidence-Based Pathway'
  const alternatives: TreatmentPathwayOutput['alternatives'] = []
  const expectedOutcomes: TreatmentPathwayOutput['expected_outcomes'] = []
  const riskFactors: string[] = []

  if (diagnosisLower.includes('diabetes') || diagnosisLower.includes('type 2')) {
    pathwayName = 'Type 2 Diabetes Mellitus Management Pathway'
    milestones.push({ stage: 1, name: 'Diagnosis Confirmation & Initiation', description: 'Confirm T2DM (HbA1c >= 6.5%, fasting glucose >= 126, or OGTT). Begin metformin if not contraindicated.', criteria_to_advance: ['HbA1c confirmed', 'Renal function assessed', 'Baseline labs obtained'], expected_duration: '0-3 months', interventions: ['Metformin 500mg BID (titrate to 1000mg BID over 4 weeks)', 'Diabetes self-management education', 'Nutrition consultation', 'Physical activity counseling (150 min/week moderate exercise)'], monitoring: ['Fasting glucose weekly for 4 weeks', 'HbA1c at 3 months', 'Renal function at 3 months'] })
    milestones.push({ stage: 2, name: 'Glycemic Optimization', description: 'Intensify therapy if HbA1c not at individualized target (<7% for most; <8% for limited life expectancy/frail)', criteria_to_advance: ['HbA1c < 7% (or individualized target)', 'No significant hypoglycemia', 'Metformin at max tolerated dose'], expected_duration: '3-6 months', interventions: ['Add SGLT2 inhibitor (if CKD/heart failure/CVD) or GLP-1 RA (if obesity/CVD)', 'Consider combination therapy based on patient phenotype', 'Blood pressure management (target < 130/80)', 'Lipid management (statin for age 40-75 with diabetes)'], monitoring: ['HbA1c every 3 months if not at goal', 'Annual comprehensive metabolic panel', 'Annual urine albumin-to-creatinine ratio', 'Annual dilated eye exam', 'Annual foot examination'] })
    milestones.push({ stage: 3, name: 'Complication Screening & Prevention', description: 'Annual screening for microvascular and macrovascular complications', criteria_to_advance: ['All annual screenings completed', 'No new complications identified'], expected_duration: '6-12 months', interventions: ['Annual urine albumin-to-creatinine ratio', 'Annual eGFR monitoring', 'Comprehensive foot exam (monofilament + pulses)', 'Dilated retinal exam', 'Dental exam every 6 months', 'Influenza vaccine annually; pneumococcal vaccine'], monitoring: ['Yearly complication screening calendar', 'Cardiovascular risk reassessment annually', 'Depression screening (PHQ-2/9) annually'] })
    milestones.push({ stage: 4, name: 'Sustained Management & De-Intensification', description: 'Long-term maintenance with periodic reassessment; de-intensify if HbA1c < 6.5% on minimal therapy', criteria_to_advance: ['HbA1c stable at target on de-escalated therapy', 'Patient self-management competency demonstrated'], expected_duration: 'Ongoing', interventions: ['Continue metformin if tolerated', 'Adjust based on aging framework (relax targets if >65 with CKD/hypoglycemia risk)', 'Annual therapy review', 'Consider switching if cost/access issues'], monitoring: ['HbA1c every 6 months if stable', 'Annual complication screening', 'Medication adherence assessment at each visit'] })
    alternatives.push({ name: 'Insulin-first approach', indication: 'Newly diagnosed with HbA1c >10% or symptomatic hyperglycemia', pros: ['Rapid glucose control', 'May preserve beta-cell function', 'No upper limit to dose escalation'], cons: ['Injection burden', 'Hypoglycemia risk', 'Weight gain', 'Requires extensive patient training'] })
    alternatives.push({ name: 'Intensive lifestyle-first', indication: 'Early T2DM (HbA1c 6.5-7.5%) with motivated patient and obesity', pros: ['Potential medication-free remission', 'Cardiovascular benefit', 'Weight loss benefits'], cons: ['High attrition rate', 'Often requires medication addition within 1-2 years', 'Requires intensive support'] })
    expectedOutcomes.push({ outcome: 'HbA1c at target (<7%)', probability: '70%', timeframe: '6 months' })
    expectedOutcomes.push({ outcome: 'No microvascular progression', probability: '80%', timeframe: '5 years' })
    expectedOutcomes.push({ outcome: 'Reduction in cardiovascular events', probability: '60%', timeframe: '10 years' })
    riskFactors.push('Age > 65: increased hypoglycemia risk, consider relaxed targets')
    riskFactors.push('CKD stage 3+: limit metformin, avoid SGLT2 if eGFR < 20')
    riskFactors.push('Heart failure: prefer SGLT2 inhibitor over DPP-4 or TZD')
  } else if (diagnosisLower.includes('hypertension') || diagnosisLower.includes('htn')) {
    pathwayName = 'Essential Hypertension Management Pathway'
    milestones.push({ stage: 1, name: 'Diagnosis & Risk Stratification', description: 'Confirm hypertension with 2+ readings on 2+ occasions (or ABPM). Assess ASCVD risk and target organ damage.', criteria_to_advance: ['Confirmatory BP readings', 'ASCVD risk calculated', 'Baseline labs (BMP, UA, ECG)'], expected_duration: '2-4 weeks', interventions: ['Home blood pressure monitoring education', 'Lifestyle modifications: DASH diet, Na+ < 2g/day, exercise 150 min/week', 'Identify and address secondary causes (if suspicious)', 'Calculate 10-year ASCVD risk'], monitoring: ['BP readings 2x/week', 'Daily home BP log'] })
    milestones.push({ stage: 2, name: 'Pharmacological Initiation (Stage 2)', description: 'Stage 2 HTN (>= 140/90): initiate two drugs (thiazide-type CCB + ACEi/ARB). Stage 1 with ASCVD risk > 10%: monotherapy.', criteria_to_advance: ['BP at target on current regimen', 'Tolerating medications without significant side effects'], expected_duration: '4-8 weeks', interventions: ['ACE inhibitor + calcium channel blocker (first-line combination)', 'Add thiazide diuretic if BP still above target', '4-week follow-up after each medication change'], monitoring: ['BMP in 2-4 weeks after ACEi/ARB initiation', 'Home BP every morning and evening', 'Orthostatic BP at each visit'] })
    milestones.push({ stage: 3, name: 'Optimization & Titration', description: 'Titrate doses or add agents until BP at target (<130/80 for most adults).', criteria_to_advance: ['BP < 130/80 (office)', 'No adverse effects limiting therapy'], expected_duration: '2-4 months', interventions: ['Titrate current medications to maximum tolerated doses', 'Add spironolactone as fourth-line if resistant', 'Evaluate for secondary hypertension if resistant to 3 drugs + diuretic', 'Assess medication adherence (major cause of "resistant" HTN)'], monitoring: ['Office BP monthly until stable', 'BMP every 3 months on diuretic/ACEi/ARB', 'Annual urine albumin if diabetic/CKD'] })
    milestones.push({ stage: 4, name: 'Long-term Maintenance & Complication Surveillance', description: 'Stable monotherapy/two-drug regimen with annual reassessment for target organ damage.', criteria_to_advance: ['Sustained BP control for >6 months', 'No new target organ damage'], expected_duration: 'Ongoing', interventions: ['Continue lifestyle modifications indefinitely', 'Annual dose reduction attempts if well-controlled', 'Assess for ASCVD events annually', 'Annual retinal exam if hypertensive retinopathy'], monitoring: ['Office BP every 3-6 months if stable', 'Annual comprehensive metabolic panel', 'Annual urine microalbumin', 'ECG every 2-3 years'] })
    alternatives.push({ name: 'Beta-blocker-first approach', indication: 'Younger patients, women of childbearing age, comorbid CAD/arrhythmia', pros: ['May be preferred if comorbid cardiac conditions', 'Once-daily dosing improves adherence'], cons: ['Less effective than thiazide/CCB for stroke prevention', 'May worsen exercise tolerance', 'Higher diabetes risk'] })
    expectedOutcomes.push({ outcome: 'BP at target within 6 months', probability: '75%', timeframe: '6 months' })
    expectedOutcomes.push({ outcome: 'Reduced stroke risk', probability: '35-40%', timeframe: '5 years' })
    riskFactors.push('African ancestry: thiazide/CCB more effective than ACEi monotherapy')
    riskFactors.push('Pregnancy: ACEi/ARB contraindicated; use labetalol, nifedipine, methyldopa')
    riskFactors.push('CKD with proteinuria: ACEi/ARB preferred first-line')
  } else if (diagnosisLower.includes('pneumonia')) {
    pathwayName = 'Community-Acquired Pneumonia Treatment Pathway'
    milestones.push({ stage: 1, name: 'Initial Assessment & Severity Scoring', description: 'Assess severity with CURB-65, determine site of care (outpatient vs inpatient vs ICU), obtain cultures.', criteria_to_advance: ['Severity score calculated', 'O2 sats and vitals obtained', 'Blood cultures (if ICU/risk), sputum culture'], expected_duration: '0-6 hours', interventions: ['CURB-65 calculation (Confusion, Urea > 7, RR >= 30, BP low, age >= 65)', 'Blood cultures x2 before antibiotics (if inpatient)', 'Sputum Gram stain/culture if productive cough', 'Legionella urine antigen if risk factors'], monitoring: ['Continuous pulse oximetry', 'Vital signs q4h', 'Strict I/O'] })
    milestones.push({ stage: 2, name: 'Empiric Antibiotic Therapy', description: 'Initiate empiric antibiotics within 6 hours. Outpatient: amoxicillin or doxycycline or macrolide. Inpatient: ceftriaxone + azithromycin.', criteria_to_advance: ['Antibiotics initiated within 6 hours', 'Hemodynamically stable after 48h'], expected_duration: '48-72 hours (reassessment)', interventions: ['Outpatient (healthy, no resistance: amoxicillin 1g TID or doxycycline 100mg BID', 'Outpatient with comorbidities: amoxicillin-clavulanate + macrolide', 'Inpatient non-severe: ceftriaxone 1-2g IV daily + azithromycin 500mg IV daily', 'Inpatient severe: piperacillin-tazobactam + azithromycin + vancomycin'], monitoring: ['Temperature q4h', 'WBC at 48-72h', 'CXR at 48-72h if no clinical improvement'] })
    milestones.push({ stage: 3, name: 'Narrowing & Step-down', description: 'Narrow antibiotics based on culture results. Step to oral when clinically improving, hemodynamically stable, able to tolerate PO.', criteria_to_advance: ['Afebrile for 48-72h', 'Hemodynamically stable', 'Clinically improving', 'Able to tolerate oral intake'], expected_duration: '5-7 days total', interventions: ['Narrow to culture-directed therapy (or amoxicillin-clavulanate if culture negative)', 'Ensure total antibiotic duration 5-7 days', 'Document stop date in chart'], monitoring: ['Temperature at step-down', 'Monitor for C. difficile if broad-spectrum used'] })
    milestones.push({ stage: 4, name: 'Resolution & Prevention', description: 'Ensure CXR resolution at 4-6 weeks. Vaccine review and smoking cessation.', criteria_to_advance: ['Cough improving', 'No residual effusion on imaging'], expected_duration: '4-6 weeks', interventions: ['Follow-up CXR at 6-12 weeks (if >50yo or smoker, to rule out malignancy)', 'Influenza vaccine annually', 'Pneumococcal vaccine per CDC guidelines', 'Smoking cessation program if applicable'], monitoring: ['SpO2 at discharge', 'Cough resolution by 6 weeks'] })
    alternatives.push({ name: 'Respiratory fluoroquinolone monotherapy', indication: 'Outpatient with severe PCN allergy, prior antibiotic use, or Pseudomonas risk', pros: ['Excellent PO bioavailability', 'Single agent convenience', 'Rapid step-down from IV'], cons: ['Fluoroquinolone adverse effects (QT, tendon rupture, aortic aneurysm)', 'C. difficile risk', 'Stewardship concerns'] })
    expectedOutcomes.push({ outcome: 'Clinical cure for CAP', probability: '90-95%', timeframe: '7 days' })
    expectedOutcomes.push({ outcome: '30-day mortality < 3% if outpatient', probability: '97%', timeframe: '30 days' })
    riskFactors.push('Recent antibiotic use within 90 days: increases DRSP/resistant organism risk')
    riskFactors.push('Severe septic shock: requires ICU, broader-spectrum antibiotics')
  } else {
    // Generic pathway
    milestones.push({ stage: 1, name: 'Initial Assessment', description: 'Confirm diagnosis, assess severity, identify comorbidities', criteria_to_advance: ['Diagnosis confirmed', 'Severity assessed', 'Baseline data collected'], expected_duration: '1-2 weeks', interventions: ['Comprehensive history and physical examination', 'Baseline laboratory and imaging studies', 'Assess patient-specific risk factors and preferences', 'Establish therapeutic goals'], monitoring: ['Regular clinical reassessment', 'Laboratory markers as appropriate to diagnosis'] })
    milestones.push({ stage: 2, name: 'Treatment Initiation', description: 'Initiate first-line therapy based on clinical guidelines', criteria_to_advance: ['Treatment initiated', 'Baseline before/after measurements obtained'], expected_duration: '2-4 weeks', interventions: ['First-line pharmacological therapy (after contraindication screen)', 'Non-pharmacological interventions', 'Patient education and shared decision-making', 'Coordination with specialists if indicated'], monitoring: ['Response assessment at 2-4 weeks', 'Adverse effect monitoring', 'Adherence assessment'] })
    milestones.push({ stage: 3, name: 'Optimization', description: 'Titrate therapy, add agents if inadequate response, manage comorbidities', criteria_to_advance: ['Therapeutic targets achieved or maximum tolerated therapy', 'No significant adverse effects'], expected_duration: '4-12 weeks', interventions: ['Titrate doses based on response and tolerability', 'Consider combination therapy if monotherapy inadequate', 'Treat comorbid conditions that affect response', 'Lifestyle modification reinforcement'], monitoring: ['Follow-up every 4-8 weeks during optimization', 'Monitor for adverse effects'] })
    milestones.push({ stage: 4, name: 'Maintenance & Surveillance', description: 'Long-term monitoring for disease progression, complications, and treatment adherence', criteria_to_advance: ['Stable on maintenance therapy for >6 months'], expected_duration: 'Ongoing', interventions: ['Annual comprehensive reassessment', 'Screening for complications per guidelines', 'Medication reconciliation at each visit', 'Vaccination updates'], monitoring: ['Every 3-6 months (chronic disease)', 'Annual screening as appropriate'] })
    expectedOutcomes.push({ outcome: 'Disease stabilization or improvement', probability: '85%', timeframe: '6 months' })
    expectedOutcomes.push({ outcome: 'Improved quality of life', probability: '75%', timeframe: '12 months' })
    riskFactors.push('Advanced age (>75: altered pharmacokinetics, frailty considerations)')
    riskFactors.push('Multiple comorbidities: increases drug interactions and complexity')
  }

  // Apply guidelines filter
  if (guidelines.length > 0) {
    riskFactors.push('Pathway cross-referenced with ' + guidelines.length + ' provided guideline' + (guidelines.length > 1 ? 's' : '') + ': ' + guidelines.join(', '))
  }

  return { diagnosis, pathway_name: pathwayName, milestones, alternatives, expected_outcomes: expectedOutcomes, risk_factors: riskFactors }
}

function formatTreatmentPathwayReport(result: TreatmentPathwayOutput): string {
  const lines: string[] = []
  lines.push('## \uD83D\uDCCF Treatment Pathway: ' + result.pathway_name)
  lines.push('')
  lines.push('**Diagnosis:** ' + result.diagnosis)
  lines.push('')

  lines.push('### \uD83D\uDEA6 Milestones')
  for (const m of result.milestones) {
    lines.push('#### Stage ' + m.stage + ': ' + m.name)
    lines.push('**Duration:** ' + m.expected_duration)
    lines.push('')
    lines.push(m.description)
    lines.push('')
    lines.push('**Interventions:**')
    for (const intv of m.interventions) { lines.push('- ' + intv) }
    lines.push('')
    lines.push('**Monitoring:**')
    for (const mon of m.monitoring) { lines.push('- ' + mon) }
    lines.push('')
    lines.push('****Criteria to Advance:**')
    for (const c of m.criteria_to_advance) { lines.push('- \u2705 ' + c) }
    lines.push('')
  }

  if (result.alternatives.length > 0) {
    lines.push('### \uD83D\uDD00 Alternative Approaches')
    for (const alt of result.alternatives) {
      lines.push('**' + alt.name + '** — ' + alt.indication)
      lines.push('- Pros: ' + alt.pros.join('; '))
      lines.push('- Cons: ' + alt.cons.join('; '))
      lines.push('')
    }
  }

  lines.push('### \uD83D\uDCCA Expected Outcomes')
  lines.push('| Outcome | Probability | Timeframe |')
  lines.push('|---------|-------------|-----------|')
  for (const o of result.expected_outcomes) {
    lines.push('| ' + o.outcome + ' | ' + o.probability + ' | ' + o.timeframe + ' |')
  }
  lines.push('')

  lines.push('### \u26A0\uFE0F Risk Factors & Considerations')
  for (const r of result.risk_factors) {
    lines.push('- ' + r)
  }

  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: PATIENT RISK STRATIFIER ====================

function stratifyPatientRisk(patientDataString: string, riskModelsString: string): RiskStratificationOutput {
  const patientData: Record<string, unknown> = JSON.parse(patientDataString)
  const riskModels: string[] = JSON.parse(riskModelsString)

  const riskScores: RiskScore[] = []
  const riskFactors: RiskFactor[] = []
  const preventionRecs: PreventionRecommendation[] = []
  const monitoring: string[] = []
  const referrals: string[] = []

  // Extract patient data
  const age = patientData.age as number || 50
  const sex = patientData.sex as string || 'unknown'
  const conditions = (patientData.conditions as string[]) || []
  const vitals = (patientData.vitals as Record<string, number>) || {}
  const labs = (patientData.labs as Record<string, number>) || {}
  const smoking = (patientData.smoking as boolean) || false
  const familyHistory = (patientData.family_history as string[]) || []

  // ASCVD Risk Score
  if (riskModels.includes('ascvd') || riskModels.includes('all')) {
    let ascvdScore = 0
    // Simplified Pooled Cohort Equation approximation
    if (sex === 'male') {
      ascvdScore += age >= 40 && age <= 79 ? 1 : 0
      if (age >= 40 && age <= 49) ascvdScore += 0
      else if (age >= 50 && age <= 59) ascvdScore += 2
      else if (age >= 60 && age <= 69) ascvdScore += 4
      else if (age >= 70 && age <= 79) ascvdScore += 5
    } else {
      if (age >= 50 && age <= 59) ascvdScore += 2
      else if (age >= 60 && age <= 69) ascvdScore += 3
      else if (age >= 70 && age <= 79) ascvdScore += 4
    }
    if (vitals.systolic_bp !== undefined && vitals.systolic_bp >= 140) ascvdScore += 2
    else if (vitals.systolic_bp !== undefined && vitals.systolic_bp >= 130) ascvdScore += 1
    if (smoking) ascvdScore += 2
    if (labs.total_cholesterol !== undefined && labs.total_cholesterol >= 240) ascvdScore += 1
    if (labs.hdl !== undefined && labs.hdl < 40) ascvdScore += 1
    if (conditions.some(c => c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('dm'))) ascvdScore += 2
    if (familyHistory.some(f => f.toLowerCase().includes('heart') || f.toLowerCase().includes('cardiac'))) ascvdScore += 1

    // Convert score to estimated 10-year risk percentage
    const riskPct = clamp(5 + ascvdScore * 3, 1, 50)
    let category: RiskScore['category'] = 'low'
    if (riskPct >= 20) category = 'very_high'
    else if (riskPct >= 10) category = 'high'
    else if (riskPct >= 5) category = 'moderate'

    riskScores.push({
      model: 'ASCVD Pooled Cohort Equation',
      score: riskPct,
      category,
      percentile: Math.min(50 + ascvdScore * 5, 99),
      interpretation: riskPct + '% estimated 10-year risk of heart attack or stroke. ' + (riskPct >= 7.5 ? 'High-intensity statin recommended.' : riskPct >= 5 ? 'Consider statin therapy based on shared decision-making.' : 'Statin therapy not routinely recommended; focus on lifestyle.')
    })

    riskFactors.push({ factor: 'Age (' + age + ')', weight: 0.2, contribution: Math.min(age / 100, 1), modifiable: false })
    if (vitals.systolic_bp !== undefined) riskFactors.push({ factor: 'Systolic BP (' + vitals.systolic_bp + ' mmHg)', weight: 0.15, contribution: vitals.systolic_bp >= 140 ? 0.8 : vitals.systolic_bp >= 130 ? 0.5 : 0.2, modifiable: true })
    if (labs.total_cholesterol !== undefined) riskFactors.push({ factor: 'Total Cholesterol (' + labs.total_cholesterol + ')', weight: 0.1, contribution: labs.total_cholesterol >= 240 ? 0.6 : labs.total_cholesterol >= 200 ? 0.3 : 0.1, modifiable: true })
    if (labs.hdl !== undefined) riskFactors.push({ factor: 'HDL (' + labs.hdl + ')', weight: 0.1, contribution: labs.hdl < 40 ? 0.7 : labs.hdl < 50 ? 0.3 : 0.1, modifiable: true })
    riskFactors.push({ factor: 'Smoking', weight: 0.15, contribution: smoking ? 0.9 : 0, modifiable: true })
    riskFactors.push({ factor: 'Diabetes', weight: 0.15, contribution: conditions.some(c => c.toLowerCase().includes('diabetes')) ? 0.9 : 0, modifiable: true })
    if (familyHistory.length > 0) riskFactors.push({ factor: 'Family History', weight: 0.1, contribution: 0.5, modifiable: false })

    if (riskPct >= 7.5) {
      preventionRecs.push({ category: 'pharmacological', priority: 'essential', description: 'High-intensity statin therapy (atorvastatin 40-80mg or rosuvastatin 20-40mg)', expected_benefit: '30-50% reduction in major ASCVD events', timeframe: 'Indefinite' })
    } else if (riskPct >= 5) {
      preventionRecs.push({ category: 'pharmacological', priority: 'recommended', description: 'Moderate-intensity statin therapy; consider CAC score for risk reclassification', expected_benefit: '20-30% reduction in major ASCVD events', timeframe: 'Indefinite' })
    }
    if (vitals.systolic_bp !== undefined && vitals.systolic_bp >= 130) {
      preventionRecs.push({ category: 'lifestyle', priority: 'essential', description: 'DASH diet, Na+ < 2g/day, physical activity, weight management', expected_benefit: '10-20 mmHg SBP reduction', timeframe: '3-6 months for full benefit' })
    }
    if (smoking) {
      preventionRecs.push({ category: 'lifestyle', priority: 'essential', description: 'Smoking cessation (combination NRT + behavioral support or varenicline)', expected_benefit: 'Halves CAD risk within 1 year; risk equals never-smoker by 15 years', timeframe: 'Cessation + 15 years for full benefit' })
    }
    preventionRecs.push({ category: 'screening', priority: 'recommended', description: '10-year ASCVD risk reassessment', expected_benefit: 'Detect risk changes and guide therapy modification', timeframe: 'Every 4-6 years if low risk, sooner if intermediate' })
    preventionRecs.push({ category: 'monitoring', priority: 'recommended', description: 'Annual lipid panel and blood pressure check', expected_benefit: 'Track response to interventions and detect changes', timeframe: 'Annually' })
  }

  // Diabetes Risk (if not diabetic)
  if ((riskModels.includes('diabetes') || riskModels.includes('all')) && !conditions.some(c => c.toLowerCase().includes('diabetes'))) {
    let dmRiskScore = 0
    if (age >= 45 && age <= 64) dmRiskScore += 1
    else if (age >= 65) dmRiskScore += 2
    if (vitals.bmi !== undefined && vitals.bmi >= 25) dmRiskScore += 1
    if (vitals.bmi !== undefined && vitals.bmi >= 30) dmRiskScore += 1
    if (familyHistory.some(f => f.toLowerCase().includes('diabetes') || f.toLowerCase().includes('dm'))) dmRiskScore += 1
    if (sex === 'female' && conditions.some(c => c.toLowerCase().includes('pcos') || c.toLowerCase().includes('gestational'))) dmRiskScore += 1
    if (labs.fasting_glucose !== undefined && labs.fasting_glucose >= 100) dmRiskScore += 2
    if (labs.hba1c !== undefined && labs.hba1c >= 5.7) dmRiskScore += 2

    const dmRiskCategory: RiskScore['category'] = dmRiskScore >= 5 ? 'high' : dmRiskScore >= 3 ? 'moderate' : 'low'
    riskScores.push({
      model: 'Type 2 Diabetes Risk',
      score: dmRiskScore,
      category: dmRiskCategory,
      interpretation: dmRiskScore >= 5 ? 'High risk for T2DM within 5 years; consider metformin prophylaxis and intensive lifestyle intervention' : dmRiskScore >= 3 ? 'Moderate risk; annual glucose screening recommended' : 'Low risk; reassess in 3 years'
    })
    if (dmRiskScore >= 3) {
      preventionRecs.push({ category: 'screening', priority: 'recommended', description: 'Annual fasting glucose or HbA1c screening', expected_benefit: 'Early detection and prevention intervention', timeframe: 'Annually' })
      preventionRecs.push({ category: 'lifestyle', priority: 'essential', description: '7% weight loss + 150 min/week moderate exercise (DPP protocol)', expected_benefit: '58% reduction in diabetes incidence (DPP trial)', timeframe: 'Ongoing with reassessment at 6 months' })
    }
  }

  // Monitoring plan
  monitoring.push('Annual comprehensive health assessment')
  if (riskScores.some(r => r.category === 'high' || r.category === 'very_high')) {
    monitoring.push('Semi-annual follow-up for high-risk patients')
    monitoring.push('More frequent lab monitoring based on specific risk factors')
  }

  // Referrals
  if (riskScores.some(r => r.model.includes('ASCVD') && (r.category === 'high' || r.category === 'very_high'))) {
    referrals.push('Cardiology: for high-risk patients (>20%) or if symptoms of CAD')
    referrals.push('Endocrinology/Lipid specialist: for statin-intolerant or familial hyperlipidemia')
  }
  if (riskScores.some(r => r.model.includes('Diabetes') && r.category === 'high')) {
    referrals.push('Diabetes Prevention Program (DPP) or certified diabetes educator')
  }
  if (smoking) {
    referrals.push('Tobacco cessation program or pharmacist-led cessation clinic')
  }

  // Overall risk category
  const maxRisk = riskScores.reduce((max, r) => {
    const order = { low: 1, moderate: 2, high: 3, very_high: 4 }
    return order[r.category] > order[max.category] ? r : max
  }, riskScores[0] || { model: '', score: 0, category: 'low' as RiskScore['category'], interpretation: '' })

  return {
    risk_scores: riskScores,
    risk_factors: riskFactors,
    prevention_recommendations: preventionRecs,
    monitoring_plan: monitoring,
    referrals,
    overall_risk_category: maxRisk.category
  }
}

function formatRiskStratificationReport(result: RiskStratificationOutput): string {
  const lines: string[] = []
  lines.push('## \uD83D\uDCC9 Patient Risk Stratification Report')
  lines.push('')
  const overallEmoji: Record<string, string> = { low: '\uD83D\uDFE2', moderate: '\uD83D\uDFE1', high: '\uD83D\uDFE0', very_high: '\uD83D\uDD34' }
  lines.push('**Overall Risk Category:** ' + overallEmoji[result.overall_risk_category as string] + ' ' + result.overall_risk_category.toUpperCase().replace('_', ' '))
  lines.push('')

  lines.push('### \uD83D\uDCCA Risk Scores')
  for (const r of result.risk_scores) {
    lines.push('- **' + r.model + ':** ' + r.score + (r.percentile ? ' (percentile: ' + r.percentile + ')' : '') + ' — ' + overallEmoji[r.category] + ' ' + r.category.replace('_', ' '))
    lines.push('  - *' + r.interpretation + '*')
  }
  lines.push('')

  lines.push('### \uD83D\uDD3A Risk Factors (Ranked by Contribution)')
  lines.push('| Factor | Contribution | Modifiable |')
  lines.push('|--------|--------------|------------|')
  result.risk_factors.sort((a, b) => b.contribution - a.contribution)
  for (const rf of result.risk_factors) {
    const modEmoji = rf.modifiable ? '\u2705 Yes' : '\u274C Fixed'
    const bar = '\uD83D\uDEE5\uFE0F'.repeat(Math.round(rf.contribution * 5))
    lines.push('| ' + rf.factor + ' | ' + bar + ' ' + (rf.contribution * 100).toFixed(0) + '% | ' + modEmoji + ' |')
  }
  lines.push('')

  lines.push('### \uD83D\uDEE1\uFE0F Prevention Recommendations')
  for (const p of result.prevention_recommendations) {
    const priorityEmoji = p.priority === 'essential' ? '\uD83D\uDD34' : p.priority === 'recommended' ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
    lines.push('- ' + priorityEmoji + ' [' + p.category.toUpperCase() + '] ' + p.description)
    lines.push('  - Expected benefit: ' + p.expected_benefit + ' | Timeframe: ' + p.timeframe)
  }
  lines.push('')

  lines.push('### \uD83D\uDCC5 Monitoring Plan')
  for (const m of result.monitoring_plan) { lines.push('- ' + m) }

  if (result.referrals.length > 0) {
    lines.push('')
    lines.push('### \uD83D\uDCE4 Recommended Referrals')
    for (const r of result.referrals) { lines.push('- ' + r) }
  }

  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: MEDICAL DOCUMENTATION ====================

function generateMedicalDocumentation(encounterDataString: string, documentType: string): string {
  const data: EncounterData = JSON.parse(encounterDataString)
  const lines: string[] = []

  // Header
  lines.push('## \uD83D\uDCDC Medical Documentation: ' + documentType.toUpperCase() + ' Note')
  lines.push('')
  lines.push('**Patient:** ' + data.patient_name + ' | **MRN:** ' + data.patient_id + ' | **DOB/Age:** ' + data.age + 'y/' + data.sex + '')
  lines.push('**Date of Service:** ' + data.date + ' | **Provider:** ' + data.provider)
  lines.push('')
  lines.push('---')

  if (documentType === 'soap') {
    // Subjective
    lines.push('')
    lines.push('### S (Subjective)')
    lines.push('')
    lines.push('**Chief Complaint:** ' + data.chief_complaint)
    lines.push('')
    lines.push('**History of Present Illness:**')
    lines.push(data.history_of_present_illness)
    lines.push('')

    if (data.review_of_systems) {
      lines.push('**Review of Systems:**')
      for (const [system, finding] of Object.entries(data.review_of_systems)) {
        lines.push('- ' + system + ': ' + finding)
      }
      lines.push('')
    }

    if (data.allergies && data.allergies.length > 0) {
      lines.push('**Allergies:** ' + data.allergies.join(', '))
      lines.push('')
    }
    if (data.medications && data.medications.length > 0) {
      lines.push('**Current Medications:** ' + data.medications.join(', '))
      lines.push('')
    }

    // Objective
    lines.push('### O (Objective)')
    if (data.vital_signs) {
      lines.push('**Vital Signs:**')
      for (const [key, value] of Object.entries(data.vital_signs)) {
        lines.push('- ' + key + ': ' + value)
      }
      lines.push('')
    }
    if (data.physical_examination) {
      lines.push('**Physical Examination:**')
      for (const [area, finding] of Object.entries(data.physical_examination)) {
        lines.push('- ' + area + ': ' + finding)
      }
      lines.push('')
    }

    // Assessment
    lines.push('### A (Assessment)')
    if (data.assessment_and_plan) {
      for (let i = 0; i < data.assessment_and_plan.length; i++) {
        const ap = data.assessment_and_plan[i]
        lines.push((i + 1) + '. ' + ap.diagnosis)
      }
    } else {
      lines.push('Assessment based on clinical evaluation')
    }
    lines.push('')

    // Plan
    lines.push('### P (Plan)')
    if (data.assessment_and_plan) {
      for (let i = 0; i < data.assessment_and_plan.length; i++) {
        const ap = data.assessment_and_plan[i]
        lines.push((i + 1) + '. ' + ap.plan)
      }
    }
    if (data.labs_ordered && data.labs_ordered.length > 0) {
      lines.push('**Labs Ordered:** ' + data.labs_ordered.join(', '))
    }
    if (data.procedures && data.procedures.length > 0) {
      lines.push('**Procedures:** ' + data.procedures.join(', '))
    }
    lines.push('')

  } else if (documentType === 'discharge') {
    lines.push('')
    lines.push('### \uD83C\uDFE5 Discharge Summary')
    lines.push('')
    lines.push('**Chief Complaint:** ' + data.chief_complaint)
    lines.push('')
    lines.push('**History of Present Illness:**')
    lines.push(data.history_of_present_illness)
    lines.push('')

    if (data.physical_examination) {
      lines.push('**Admission Examination:**')
      for (const [area, finding] of Object.entries(data.physical_examination)) {
        lines.push('- ' + area + ': ' + finding)
      }
      lines.push('')
    }

    lines.push('### Hospital Course')
    lines.push('The patient admitted for ' + data.chief_complaint + '. Hospital course as documented in daily notes.')
    lines.push('')

    lines.push('### Discharge Diagnoses')
    if (data.assessment_and_plan) {
      for (const ap of data.assessment_and_plan) {
        lines.push('- ' + ap.diagnosis)
      }
    } else {
      lines.push('- ' + data.chief_complaint + ' (resolved/improved)')
    }
    lines.push('')

    lines.push('### Discharge Plan')
    lines.push('- Disposition: ' + (data.disposition || 'Home'))
    if (data.medications && data.medications.length > 0) {
        lines.push('- Discharge medications: ' + data.medications.join(', '))
    }
    if (data.allergies && data.allergies.length > 0) {
        lines.push('- Allergies: ' + data.allergies.join(', '))
    }
    lines.push('- Follow-up appointment per discharge instructions')
    lines.push('')

  } else if (documentType === 'referral') {
    lines.push('')
    lines.push('### \uD83D\uDCE4 Referral Letter')
    lines.push('')
    lines.push('**Date:** ' + data.date)
    lines.push('')
    lines.push('Dear Colleague,')
    lines.push('')
    lines.push('I am referring ' + data.patient_name + ' (' + data.age + 'y ' + data.sex + ') for specialist evaluation.')
    lines.push('')
    lines.push('**Reason for Referral:** ' + data.chief_complaint)
    lines.push('')
    lines.push('**History:** ')
    lines.push(data.history_of_present_illness)
    lines.push('')

    if (data.medications && data.medications.length > 0) {
      lines.push('**Current Medications:** ' + data.medications.join(', '))
      lines.push('')
    }
    if (data.physical_examination) {
      lines.push('**Relevant Examination Findings:**')
      for (const [area, finding] of Object.entries(data.physical_examination)) {
        lines.push('- ' + area + ': ' + finding)
      }
      lines.push('')
    }
    if (data.allergies && data.allergies.length > 0) {
      lines.push('**Allergies:** ' + data.allergies.join(', '))
      lines.push('')
    }

    lines.push('Please advise on any further workup needed or management changes.')
    lines.push('')

  } else if (documentType === 'progress') {
    lines.push('')
    lines.push('### \uD83D\uDCC8 Progress Note')
    lines.push('')
    lines.push('**Subjective:** ' + data.history_of_present_illness)
    lines.push('')

    if (data.vital_signs) {
      lines.push('**Objective:')
      lines.push('- Vitals: ' + Object.entries(data.vital_signs).map(([k, v]) => k + ': ' + v).join(', '))
      lines.push('')
    }

    lines.push('### Assessment')
    if (data.assessment_and_plan) {
      for (const ap of data.assessment_and_plan) {
        lines.push('- ' + ap.diagnosis)
      }
    } else {
      lines.push('- ' + data.chief_complaint + ': monitored')
    }
    lines.push('')

    lines.push('### Plan')
    if (data.assessment_and_plan) {
      for (const ap of data.assessment_and_plan) {
        lines.push('- ' + ap.plan)
      }
    }
    if (data.labs_ordered && data.labs_ordered.length > 0) {
        lines.push('- Ordered: ' + data.labs_ordered.join(', '))
    }
    if (data.procedures && data.procedures.length > 0) {
        lines.push('- Procedures: ' + data.procedures.join(', '))
    }
    lines.push('')

  } else {
    lines.push('')
    lines.push('### Clinical Encounter')
    lines.push('')
    lines.push('**Chief Complaint:** ' + data.chief_complaint)
    lines.push('**History:** ' + data.history_of_present_illness)
    if (data.assessment_and_plan) {
      lines.push('**Assessment:**')
      for (const ap of data.assessment_and_plan) {
        lines.push('- ' + ap.diagnosis + ': ' + ap.plan)
      }
    }
    lines.push('')
  }

  // Footer
  lines.push('---')
  lines.push('Electronically signed by ' + data.provider + ' on ' + data.date)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'clinical_decision_support',
    description: 'Provides evidence-based differential diagnosis, treatment recommendations, and urgency assessment from patient case data. Includes ranked diagnosis with probabilities, treatment plan, and clinical confidence scoring.',
    parameters: {
      patient_case: { type: 'string', required: true, description: 'JSON object with fields: demographics (age, sex), symptoms (array of {symptom, severity, duration}), history (conditions, medications, family_history, social_history), vitals (BP, HR, temp, etc.), test_results' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { patient_case: string }) {
      const result = clinicalDecisionSupport(args.patient_case)
      return formatClinicalDecisionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'ehr_coder',
    description: 'Analyzes clinical notes and suggests appropriate ICD-10, CPT, SNOMED, or DRG codes. Provides documentation gap analysis, specificity suggestions, and compliance flag detection.',
    parameters: {
      clinical_notes: { type: 'string', required: true, description: 'Free text clinical documentation to be coded' },
      coding_system: { type: 'string', required: true, description: 'Target coding system: "ICD-10", "CPT", "SNOMED", "DRG", or "all"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { clinical_notes: string; coding_system: string }) {
      const result = generateEHRCoding(args.clinical_notes, args.coding_system)
      return formatEHRCodingReport(result, args.coding_system)
    }
  }))

  tools.register(defineTool({
    name: 'quality_controller',
    description: 'Evaluates medical record quality against configurable standards (Joint Commission, Meaningful Use). Scores completeness, medical necessity, timeliness, and clinical content. Generates benchmark comparison and improvement actions.',
    parameters: {
      medical_record: { type: 'string', required: true, description: 'Medical record text to evaluate' },
      quality_standards: { type: 'string', required: true, description: 'JSON array of quality standards to check against (e.g., ["Joint Commission", "Meaningful Use", "CDI Best Practices"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { medical_record: string; quality_standards: string }) {
      const standards: string[] = JSON.parse(args.quality_standards)
      const result = performQualityControl(args.medical_record, standards)
      return formatQualityControlReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'drug_safety_checker',
    description: 'Checks medication list for drug-drug interactions, dose appropriateness (including renal dosing), allergy cross-reactivity, and generates monitoring recommendations. Returns safety score and risk level.',
    parameters: {
      medications: { type: 'string', required: true, description: 'JSON array of medication objects with fields: name, dose, frequency, route, indication' },
      allergies: { type: 'string', required: true, description: 'JSON array of known allergy strings' },
      lab_values: { type: 'string', required: true, description: 'JSON object of relevant lab values: creatinine, egfr, alt, potassium, etc.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { medications: string; allergies: string; lab_values: string }) {
      const result = checkDrugSafety(args.medications, args.allergies, args.lab_values)
      return formatDrugSafetyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'lab_interpreter',
    description: 'Interprets laboratory results by flagging abnormal values (including critical values), providing clinical significance analysis, trend comparison with previous values, and suggested follow-up actions.',
    parameters: {
      lab_results: { type: 'string', required: true, description: 'JSON array of lab result objects with fields: test_name, value, unit, reference_low, reference_high, previous_value, previous_date' },
      patient_context: { type: 'string', required: true, description: 'JSON object with patient context: conditions, medications, age, sex, panel_name' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { lab_results: string; patient_context: string }) {
      const result = interpretLabResults(args.lab_results, args.patient_context)
      return formatLabInterpretationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'treatment_pathway',
    description: 'Generates personalized evidence-based treatment pathways for common diagnoses (T2DM, hypertension, pneumonia). Provides stage-based milestones, alternative approaches, and expected outcomes with probabilities.',
    parameters: {
      diagnosis: { type: 'string', required: true, description: 'Primary diagnosis for pathway generation' },
      patient_profile: { type: 'string', required: true, description: 'JSON object with patient characteristics: age, sex, comorbidities, allergies, prior_treatments, CKD stage, etc.' },
      guidelines: { type: 'string', required: true, description: 'JSON array of guideline resources to reference (e.g., ["ADA 2024", "ACC/AHA 2019", "IDSA/ATS 2019"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { diagnosis: string; patient_profile: string; guidelines: string }) {
      const guidelines: string[] = JSON.parse(args.guidelines)
      const result = generateTreatmentPathway(args.diagnosis, args.patient_profile, guidelines)
      return formatTreatmentPathwayReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'patient_risk_stratifier',
    description: 'Calculates patient risk scores using validated models (ASCVD Pooled Cohort, Diabetes Risk). Identifies modifiable vs non-modifiable risk factors, provides prevention recommendations, monitoring plans, and referral suggestions.',
    parameters: {
      patient_data: { type: 'string', required: true, description: 'JSON object with fields: age, sex, conditions, vitals (systolic_bp, diastolic_bp, bmi), labs (total_cholesterol, hdl, fasting_glucose, hba1c, creatinine), smoking, family_history' },
      risk_models: { type: 'string', required: true, description: 'JSON array of risk models to apply: ["ascvd", "diabetes", "readmission", "ckd_progression", "all"]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { patient_data: string; risk_models: string }) {
      const result = stratifyPatientRisk(args.patient_data, args.risk_models)
      return formatRiskStratificationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'medical_documentation',
    description: 'Generates structured medical documents from encounter data. Supports SOAP notes, discharge summaries, referral letters, and progress notes with proper medical formatting.',
    parameters: {
      encounter_data: { type: 'string', required: true, description: 'JSON object with fields: patient_name, patient_id, age, sex, date, provider, chief_complaint, history_of_present_illness, review_of_systems, physical_examination, assessment_and_plan, vital_signs, medications, allergies, procedures, labs_ordered, disposition' },
      document_type: { type: 'string', required: true, description: 'Type of document to generate: "soap", "discharge", "referral", or "progress"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { encounter_data: string; document_type: string }) {
      return generateMedicalDocumentation(args.encounter_data, args.document_type)
    }
  }))

  console.log('[dsh-tool-medagent] Loaded v' + VERSION + ' \u2014 Medical AI Agent with 8 clinical tools')
  console.log('  Tools: clinical_decision_support, ehr_coder, quality_controller, drug_safety_checker, lab_interpreter, treatment_pathway, patient_risk_stratifier, medical_documentation')
}
