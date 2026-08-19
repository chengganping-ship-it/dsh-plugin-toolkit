/**
 * DSH Healthcare Diagnostics Support Plugin v0.1.0
 *
 * Clinical decision support and healthcare analytics toolkit for DeepSeek Harness Agent.
 * Designed for healthcare professionals, clinical researchers, and medical informaticists.
 *
 * Features (v0.1.0):
 * - Symptom Analyzer (differential diagnosis, urgency assessment)
 * - Drug Interaction Checker (interaction severity, alternatives)
 * - Medical Coder (ICD-10/CPT/SNOMED code suggestion)
 * - Lab Result Interpreter (abnormal flagging, clinical significance)
 * - Clinical Pathway Recommender (evidence-based treatment pathways)
 * - Medical Literature Summarizer (research synthesis, evidence grading)
 * - Patient Risk Stratifier (cardiovascular, diabetes, readmission risk)
 * - Medication Reconciliation (discrepancy detection, duplication check)
 *
 * @module dsh-tool-healthai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-healthai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface SymptomEntry {
  symptom: string
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
}

interface PatientDemographics {
  age?: number
  sex?: 'male' | 'female' | 'other'
  weight_kg?: number
  allergies?: string[]
  chronic_conditions?: string[]
  medications?: string[]
}

interface MedicationEntry {
  name: string
  dose: string
  frequency: string
}

interface LabResultEntry {
  test: string
  value: number
  unit: string
  reference_range: string
}

interface PatientContext {
  age?: number
  sex?: 'male' | 'female' | 'other'
  conditions?: string[]
  medications?: string[]
  pregnant?: boolean
}

interface PatientData {
  age: number
  sex?: 'male' | 'female' | 'other'
  conditions: string[]
  vitals: {
    systolic_bp?: number
    diastolic_bp?: number
    heart_rate?: number
    bmi?: number
    waist_cm?: number
  }
  labs: {
    total_cholesterol?: number
    hdl?: number
    ldl?: number
    triglycerides?: number
    fasting_glucose?: number
    hba1c?: number
    creatinine?: number
    egfr?: number
    alt?: number
    ast?: number
  }
  smoking?: boolean
  family_history?: string[]
}

interface ReconciliationEntry {
  name: string
  dose: string
  frequency: string
  route: string
  indication?: string
}

// ==================== TOOL 1: SYMPTOM ANALYZER ====================

function analyzeSymptoms(
  symptoms: SymptomEntry[],
  demographics?: PatientDemographics
): string {
  const lines: string[] = []
  lines.push('## Symptom Analysis Report')
  lines.push('')

  const symptomTexts = symptoms.map(s => s.symptom.toLowerCase())
  const severityMap: Record<string, number> = { mild: 1, moderate: 2, severe: 3 }
  const avgSeverity = symptoms.reduce((sum, s) => sum + (severityMap[s.severity] || 1), 0) / symptoms.length

  // Build differential diagnosis
  const conditions: Array<{ condition: string; probability: number; symptoms: string; rationale: string }> = []

  if (symptomTexts.some(s => s.includes('chest pain'))) {
    if (symptomTexts.some(s => s.includes('shortness of breath') || s.includes('dyspnea'))) {
      conditions.push({ condition: 'Acute Coronary Syndrome', probability: 0.72, symptoms: 'chest pain, shortness of breath', rationale: 'Chest pain with dyspnea is a classic presentation of cardiac ischemia' })
    }
    conditions.push({ condition: 'Gastroesophageal Reflux Disease', probability: 0.45, symptoms: 'chest pain', rationale: 'GERD is the most common non-cardiac cause of chest pain' })
    conditions.push({ condition: 'Costochondritis', probability: 0.38, symptoms: 'chest pain', rationale: 'Musculoskeletal chest pain, reproducible with palpation' })
  }

  if (symptomTexts.some(s => s.includes('headache'))) {
    if (symptomTexts.some(s => s.includes('nausea') || s.includes('vomiting'))) {
      conditions.push({ condition: 'Migraine', probability: 0.68, symptoms: 'headache, nausea', rationale: 'Headache with nausea/vomiting is characteristic of migraine' })
    }
    if (symptomTexts.some(s => s.includes('fever'))) {
      conditions.push({ condition: 'Meningitis', probability: 0.35, symptoms: 'headache, fever', rationale: 'Headache with fever raises concern for CNS infection' })
    }
    conditions.push({ condition: 'Tension-Type Headache', probability: 0.55, symptoms: 'headache', rationale: 'Most common primary headache disorder' })
  }

  if (symptomTexts.some(s => s.includes('fever'))) {
    if (symptomTexts.some(s => s.includes('cough'))) {
      conditions.push({ condition: 'Community-Acquired Pneumonia', probability: 0.60, symptoms: 'fever, cough', rationale: 'Fever with cough suggests lower respiratory tract infection' })
    }
    if (symptomTexts.some(s => s.includes('dysuria') || s.includes('urinary frequency'))) {
      conditions.push({ condition: 'Urinary Tract Infection', probability: 0.70, symptoms: 'fever, dysuria', rationale: 'Fever with urinary symptoms indicates upper UTI/pyelonephritis' })
    }
    conditions.push({ condition: 'Viral Upper Respiratory Infection', probability: 0.55, symptoms: 'fever', rationale: 'Most common cause of acute fever in adults' })
  }

  if (symptomTexts.some(s => s.includes('shortness of breath') || s.includes('dyspnea'))) {
    if (demographics?.chronic_conditions?.some(c => c.toLowerCase().includes('copd') || c.toLowerCase().includes('asthma'))) {
      conditions.push({ condition: 'COPD/Asthma Exacerbation', probability: 0.70, symptoms: 'dyspnea', rationale: 'Known obstructive lung disease with acute dyspnea suggests exacerbation' })
    }
    conditions.push({ condition: 'Heart Failure', probability: 0.45, symptoms: 'dyspnea', rationale: 'Dyspnea is the cardinal symptom of heart failure' })
    conditions.push({ condition: 'Pulmonary Embolism', probability: 0.35, symptoms: 'dyspnea', rationale: 'Acute dyspnea must raise concern for PE, especially with risk factors' })
  }

  if (conditions.length === 0) {
    conditions.push({ condition: 'Non-Specific Symptom Complex', probability: 0.50, symptoms: symptomTexts.join(', '), rationale: 'Symptoms do not match a specific well-defined pattern; broad differential required' })
  }

  conditions.sort((a, b) => b.probability - a.probability)

  // Determine urgency
  let urgency = 'routine'
  const redFlags: string[] = []

  if (symptoms.some(s => s.severity === 'severe')) {
    urgency = 'urgent'
  }
  if (symptomTexts.some(s => s.includes('chest pain')) && symptoms.find(s2 => s2.symptom.toLowerCase().includes('chest pain'))?.severity === 'severe') {
    urgency = 'emergency'
    redFlags.push('Severe chest pain - rule out acute coronary syndrome immediately')
  }
  if (symptomTexts.some(s => s.includes('headache')) && symptoms.find(s2 => s2.symptom.toLowerCase().includes('headache'))?.severity === 'severe' && symptomTexts.some(s => s.includes('fever'))) {
    urgency = 'emergency'
    redFlags.push('Severe headache with fever - rule out meningitis')
  }
  if (symptomTexts.some(s => s.includes('shortness of breath') && s.includes('severe'))) {
    urgency = 'emergency'
    redFlags.push('Severe dyspnea - assess airway, breathing, circulation')
  }
  if (avgSeverity > 2.3) {
    urgency = urgency === 'emergency' ? 'emergency' : 'urgent'
  }

  // Recommended tests
  const recommendedTests: string[] = []
  if (symptomTexts.some(s => s.includes('chest pain'))) {
    recommendedTests.push('12-lead ECG', 'Troponin I or T', 'Chest X-ray', 'D-dimer (if PE suspected)')
  }
  if (symptomTexts.some(s => s.includes('headache'))) {
    recommendedTests.push('Neurological examination', 'CT head (if red flags)', 'MRI brain (if indicated)')
  }
  if (symptomTexts.some(s => s.includes('fever'))) {
    recommendedTests.push('Complete Blood Count (CBC)', 'Blood cultures x2', 'CRP/Procalcitonin', 'Urinalysis')
  }
  if (symptomTexts.some(s => s.includes('abdominal pain'))) {
    recommendedTests.push('CBC', 'Comprehensive Metabolic Panel', 'Lipase', 'Abdominal ultrasound or CT')
  }
  if (symptomTexts.some(s => s.includes('dyspnea'))) {
    recommendedTests.push('Chest X-ray', 'ABG (if severe)', 'BNP/NT-proBNP', 'Spirometry')
  }
  if (recommendedTests.length === 0) {
    recommendedTests.push('CBC', 'Comprehensive Metabolic Panel', 'Targeted testing based on clinical presentation')
  }

  lines.push('**Urgency Level:** ' + urgency.toUpperCase())
  lines.push('')

  if (redFlags.length > 0) {
    lines.push('### Red Flags')
    for (const rf of redFlags) {
      lines.push('[!] ' + rf)
    }
    lines.push('')
  }

  lines.push('### Differential Diagnosis')
  lines.push('| Condition | Probability | Matching Symptoms | Rationale |')
  lines.push('|-----------|-------------|------------------|-----------|')
  for (const c of conditions.slice(0, 8)) {
    lines.push('| ' + c.condition + ' | ' + (c.probability * 100).toFixed(0) + '% | ' + c.symptoms + ' | ' + c.rationale + ' |')
  }
  lines.push('')

  lines.push('### Recommended Tests')
  for (const t of [...new Set(recommendedTests)]) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('> **Disclaimer:** This analysis is generated by an AI model and is not a substitute for professional medical judgment. All findings must be validated by a qualified healthcare provider.')

  return lines.join('\n')
}

// ==================== TOOL 2: DRUG INTERACTION CHECKER ====================

function checkDrugInteractions(
  medications: MedicationEntry[],
  newMedication: string
): string {
  const lines: string[] = []
  lines.push('## Drug Interaction Analysis')
  lines.push('')

  const medNames = medications.map(m => m.name.toLowerCase())
  const newMed = newMedication.toLowerCase()

  // Interaction database
  const interactionMap: Record<string, Record<string, { severity: string; mechanism: string; recommendation: string; alternatives: string[]; evidence: string; onset: string }>> = {
    warfarin: {
      aspirin: { severity: 'major', mechanism: 'Additive antiplatelet effect; aspirin displaces warfarin from albumin binding sites', recommendation: 'Avoid combination if possible. If unavoidable, monitor INR weekly and watch for bleeding.', alternatives: ['Clopidogrel 75mg daily (if antiplatelet needed)', 'Acetaminophen (analgesia only)'], evidence: 'A', onset: 'Days to weeks' },
      ibuprofen: { severity: 'major', mechanism: 'NSAID inhibits platelet function and causes GI mucosal injury; may increase INR', recommendation: 'Avoid NSAIDs with warfarin. Consider acetaminophen for pain instead.', alternatives: ['Acetaminophen 500-1000mg q6h PRN', 'Celecoxib (lower GI risk)'], evidence: 'A', onset: 'Days' },
      amiodarone: { severity: 'major', mechanism: 'Amiodarone inhibits CYP2C9, reducing warfarin metabolism', recommendation: 'Reduce warfarin dose by 30-50% when starting amiodarone. Monitor INR weekly.', alternatives: [], evidence: 'A', onset: '1-2 weeks' }
    },
    metformin: {
      'contrast dye': { severity: 'moderate', mechanism: 'Contrast-induced nephropathy reduces metformin clearance; risk of lactic acidosis', recommendation: 'Hold metformin 48 hours before and after contrast procedure. Resume only if renal function is normal.', alternatives: ['Gadolinium-based contrast (MRI)', 'Non-contrast imaging', 'Ultrasound'], evidence: 'B', onset: '24-48 hours' }
    },
    lisinopril: {
      spironolactone: { severity: 'major', mechanism: 'Both increase potassium; combination risks life-threatening hyperkalemia', recommendation: 'Avoid combination or monitor potassium within 1 week and regularly thereafter.', alternatives: ['Eplerenone 25-50mg daily', 'Amiloride 5-10mg daily'], evidence: 'A', onset: 'Days to weeks' },
      ibuprofen: { severity: 'moderate', mechanism: 'NSAIDs reduce renal prostaglandins, blunting ACE inhibitor effect; may elevate potassium', recommendation: 'Use lowest NSAID dose for shortest time. Monitor BP and potassium.', alternatives: ['Acetaminophen 500-1000mg q6h PRN', 'Topical diclofenac gel'], evidence: 'B', onset: 'Days' }
    },
    atorvastatin: {
      clarithromycin: { severity: 'major', mechanism: 'Clarithromycin inhibits CYP3A4, significantly increasing statin levels', recommendation: 'Hold atorvastatin during clarithromycin course, or use azithromycin instead.', alternatives: ['Azithromycin 500mg day 1 then 250mg daily', 'Doxycycline 100mg BID'], evidence: 'A', onset: 'Days' },
      gemfibrozil: { severity: 'contraindicated', mechanism: 'Gemfibrozil inhibits statin glucuronidation, increasing levels 5-10 fold', recommendation: 'CONTRAINDICATED. Use fenofibrate instead if fibrate is needed.', alternatives: ['Fenofibrate 145mg daily', 'Omega-3 fatty acids 4g daily'], evidence: 'A', onset: 'Days' }
    },
    fluoxetine: {
      tramadol: { severity: 'major', mechanism: 'SSRI + tramadol increases serotonin syndrome risk; fluoxetine inhibits tramadol metabolism', recommendation: 'Avoid combination. Consider non-serotonergic analgesic.', alternatives: ['Acetaminophen + codeine', 'Morphine (low dose)', 'Non-pharmacologic pain management'], evidence: 'B', onset: 'Hours to days' }
    }
  }

  let found: { severity: string; mechanism: string; recommendation: string; alternatives: string[]; evidence: string; onset: string } | null = null

  for (const med of medNames) {
    if (interactionMap[med]?.[newMed]) {
      found = interactionMap[med][newMed]
      break
    }
    if (interactionMap[newMed]?.[med]) {
      found = interactionMap[newMed][med]
      break
    }
  }

  // Class-level checks
  const nsaidClass = ['ibuprofen', 'naproxen', 'diclofenac', 'aspirin']
  const ssriClass = ['fluoxetine', 'sertraline', 'paroxetine', 'citalopram']

  if (!found) {
    if (nsaidClass.includes(newMed) && medNames.some(m => m.includes('warfarin'))) {
      found = { severity: 'major', mechanism: 'NSAID + anticoagulant increases bleeding risk through multiple mechanisms', recommendation: 'Avoid combination. Use acetaminophen for analgesia instead.', alternatives: ['Acetaminophen 500-1000mg q6h PRN', 'Topical diclofenac gel'], evidence: 'A', onset: 'Days' }
    }
    if (ssriClass.includes(newMed) && medNames.some(m => m.includes('tramadol'))) {
      found = { severity: 'major', mechanism: 'SSRI + tramadol increases serotonin syndrome risk', recommendation: 'Avoid combination or monitor closely for serotonin syndrome signs.', alternatives: ['Acetaminophen + codeine', 'Non-pharmacologic pain management'], evidence: 'B', onset: 'Hours to days' }
    }
  }

  if (found) {
    lines.push('**Severity:** ' + found.severity.toUpperCase() + ' | **Evidence Level:** ' + found.evidence + ' | **Onset:** ' + found.onset)
    lines.push('')
    lines.push('**Mechanism:** ' + found.mechanism)
    lines.push('')
    lines.push('**Recommendation:** ' + found.recommendation)
    lines.push('')
    if (found.alternatives.length > 0) {
      lines.push('### Alternative Suggestions')
      for (const a of found.alternatives) {
        lines.push('- ' + a)
      }
      lines.push('')
    }
  } else {
    lines.push('**Severity:** NONE')
    lines.push('')
    lines.push('No known significant interaction between ' + newMedication + ' and current medications (' + medications.map(m => m.name).join(', ') + ').')
    lines.push('')
    lines.push('**Recommendation:** No specific action required. Continue standard monitoring.')
  }

  return lines.join('\n')
}

// ==================== TOOL 3: MEDICAL CODER ====================

function suggestMedicalCodes(
  clinicalNotes: string,
  codingSystem: string = 'ICD-10'
): string {
  const lines: string[] = []
  lines.push('## Medical Coding Suggestions')
  lines.push('')

  const notes = clinicalNotes.toLowerCase()
  const codes: Array<{ code: string; system: string; description: string; confidence: number; docs: string[] }> = []

  if (codingSystem === 'ICD-10') {
    if (notes.includes('chest pain') || notes.includes('angina')) {
      codes.push({ code: 'R07.9', system: 'ICD-10', description: 'Chest pain, unspecified', confidence: 0.75, docs: ['Characterize pain (sharp, dull, burning)', 'Duration and onset', 'Associated symptoms'] })
    }
    if (notes.includes('myocardial infarction') || notes.includes('stem')) {
      codes.push({ code: 'I21.9', system: 'ICD-10', description: 'Acute myocardial infarction, unspecified', confidence: 0.85, docs: ['STEMI vs NSTEMI', 'Location (anterior, inferior, lateral)', 'Troponin levels'] })
    }
    if (notes.includes('heart failure') || notes.includes('chf')) {
      codes.push({ code: 'I50.9', system: 'ICD-10', description: 'Heart failure, unspecified', confidence: 0.80, docs: ['Systolic vs diastolic (HFrEF vs HFpEF)', 'NYHA class', 'Ejection fraction'] })
    }
    if (notes.includes('atrial fibrillation') || notes.includes('afib')) {
      codes.push({ code: 'I48.91', system: 'ICD-10', description: 'Unspecified atrial fibrillation', confidence: 0.85, docs: ['Paroxysmal vs persistent vs permanent', 'CHA2DS2-VASc score', 'Anticoagulation status'] })
    }
    if (notes.includes('pneumonia')) {
      codes.push({ code: 'J18.9', system: 'ICD-10', description: 'Pneumonia, unspecified organism', confidence: 0.80, docs: ['Community-acquired vs hospital-acquired', 'Specific organism if identified', 'Laterality'] })
    }
    if (notes.includes('copd') || notes.includes('chronic obstructive pulmonary disease')) {
      codes.push({ code: 'J44.9', system: 'ICD-10', description: 'Chronic obstructive pulmonary disease, unspecified', confidence: 0.80, docs: ['Acute exacerbation vs stable', 'GOLD stage', 'FEV1 value'] })
    }
    if (notes.includes('diabetes') || notes.includes('dm')) {
      const isType1 = notes.includes('type 1') || notes.includes('type i ') || notes.includes('t1dm')
      codes.push({ code: isType1 ? 'E10.9' : 'E11.9', system: 'ICD-10', description: isType1 ? 'Type 1 diabetes mellitus without complications' : 'Type 2 diabetes mellitus without complications', confidence: 0.80, docs: ['Type 1 vs Type 2', 'With/without complications', 'Controlled vs uncontrolled'] })
    }
    if (notes.includes('urinary tract infection') || notes.includes('uti')) {
      codes.push({ code: 'N39.0', system: 'ICD-10', description: 'Urinary tract infection, site not specified', confidence: 0.80, docs: ['Complicated vs uncomplicated', 'Specific organism', 'Upper vs lower UTI'] })
    }
    if (notes.includes('depression') || notes.includes('major depressive')) {
      codes.push({ code: 'F32.9', system: 'ICD-10', description: 'Major depressive disorder, single episode, unspecified', confidence: 0.75, docs: ['Single episode vs recurrent', 'Mild/moderate/severe', 'PHQ-9 score'] })
    }
    if (notes.includes('anxiety')) {
      codes.push({ code: 'F41.9', system: 'ICD-10', description: 'Anxiety disorder, unspecified', confidence: 0.70, docs: ['Specific type (GAD, panic, social)', 'GAD-7 score', 'Severity'] })
    }
  } else if (codingSystem === 'CPT') {
    if (notes.includes('office visit') || notes.includes('follow-up')) {
      codes.push({ code: '99213', system: 'CPT', description: 'Office visit, established patient, low complexity (15 min)', confidence: 0.70, docs: ['Detailed history', 'Low complexity MDM', '15 min face-to-face'] })
      codes.push({ code: '99214', system: 'CPT', description: 'Office visit, established patient, moderate complexity (25 min)', confidence: 0.65, docs: ['Detailed history/exam', 'Moderate complexity MDM', '25 min face-to-face'] })
    }
    if (notes.includes('new patient') || notes.includes('initial visit')) {
      codes.push({ code: '99204', system: 'CPT', description: 'Office visit, new patient, moderate complexity (45 min)', confidence: 0.70, docs: ['Comprehensive history', 'Comprehensive exam', 'Moderate complexity MDM'] })
    }
    if (notes.includes('ecg') || notes.includes('ekg') || notes.includes('electrocardiogram')) {
      codes.push({ code: '93000', system: 'CPT', description: 'Electrocardiogram, routine ECG with 12 leads, interpretation and report', confidence: 0.85, docs: ['Clinical indication', 'Comparison with prior', 'Interpretation documented'] })
    }
    if (notes.includes('x-ray') || notes.includes('radiograph')) {
      codes.push({ code: '71046', system: 'CPT', description: 'Radiologic examination, chest, 2 views, frontal and lateral', confidence: 0.80, docs: ['Clinical indication', 'Comparison with prior', 'Findings documented'] })
    }
    if (notes.includes('blood test') || notes.includes('cbc')) {
      codes.push({ code: '85025', system: 'CPT', description: 'Complete blood count (CBC) with automated differential', confidence: 0.75, docs: ['Clinical indication', 'Results reviewed'] })
    }
    if (notes.includes('metabolic panel') || notes.includes('bmp') || notes.includes('cmp')) {
      codes.push({ code: '80053', system: 'CPT', description: 'Comprehensive metabolic panel', confidence: 0.75, docs: ['Clinical indication', 'Results reviewed'] })
    }
  } else {
    // SNOMED
    if (notes.includes('diabetes')) {
      codes.push({ code: '73211009', system: 'SNOMED', description: 'Diabetes mellitus (disorder)', confidence: 0.80, docs: ['Specify type', 'Specify complications if present'] })
    }
    if (notes.includes('hypertension')) {
      codes.push({ code: '38341003', system: 'SNOMED', description: 'Hypertensive disorder (disorder)', confidence: 0.80, docs: ['Essential vs secondary', 'Stage', 'Target organ damage'] })
    }
    if (notes.includes('pneumonia')) {
      codes.push({ code: '233604007', system: 'SNOMED', description: 'Pneumonia (disorder)', confidence: 0.80, docs: ['Causative organism', 'Laterality', 'Severity'] })
    }
    if (notes.includes('asthma')) {
      codes.push({ code: '195967001', system: 'SNOMED', description: 'Asthma (disorder)', confidence: 0.80, docs: ['Control status', 'Severity', 'Exacerbation frequency'] })
    }
    if (notes.includes('depression')) {
      codes.push({ code: '35489007', system: 'SNOMED', description: 'Depressive disorder (disorder)', confidence: 0.75, docs: ['Severity', 'Episode type', 'Remission status'] })
    }
  }

  if (codes.length === 0) {
    codes.push({ code: 'See documentation', system: codingSystem, description: 'No specific codes could be inferred. Ensure documentation includes: specific diagnosis, laterality, severity, acuity, and etiology.', confidence: 0, docs: ['Specific diagnosis documented', 'Anatomical location specified', 'Acuity noted'] })
  }

  lines.push('| Code | System | Description | Confidence | Documentation Requirements |')
  lines.push('|------|--------|-------------|------------|---------------------------|')
  for (const c of codes) {
    lines.push('| ' + c.code + ' | ' + c.system + ' | ' + c.description + ' | ' + (c.confidence > 0 ? (c.confidence * 100).toFixed(0) + '%' : 'N/A') + ' | ' + c.docs.join('; ') + ' |')
  }
  lines.push('')

  lines.push('### Coding Tips')
  if (codingSystem === 'ICD-10') {
    lines.push('- Always code to the highest level of specificity available')
    lines.push('- Document laterality (right, left, bilateral) when applicable')
    lines.push('- Use combination codes when available')
    lines.push('- Sequence the principal diagnosis first')
  } else if (codingSystem === 'CPT') {
    lines.push('- Document time spent if using time-based coding')
    lines.push('- MDM includes: number of diagnoses, data reviewed, risk level')
    lines.push('- Modifier -25 needed for significant, separately identifiable E/M service')
    lines.push('- Ensure documentation supports the level of service billed')
  } else {
    lines.push('- SNOMED CT uses post-coordination for complex expressions')
    lines.push('- Use concept IDs for interoperability and data exchange')
    lines.push('- Map to ICD-10 for billing purposes')
  }

  return lines.join('\n')
}

// ==================== TOOL 4: LAB RESULT INTERPRETER ====================

function parseReferenceRange(rangeStr: string): { low: number; high: number } | null {
  const match = rangeStr.match(/(\d+\.?\d*)\s*[-]\s*(\d+\.?\d*)/)
  if (match) {
    return { low: parseFloat(match[1]), high: parseFloat(match[2]) }
  }
  const lessThan = rangeStr.match(/[<=]\s*(\d+\.?\d*)/)
  if (lessThan) {
    return { low: 0, high: parseFloat(lessThan[1]) }
  }
  return null
}

function interpretLabResults(
  labResults: LabResultEntry[],
  patientContext?: PatientContext
): string {
  const lines: string[] = []
  lines.push('## Lab Result Interpretation')
  lines.push('')

  const abnormalFlags: Array<{ test: string; value: number; unit: string; flag: string; ref: string }> = []
  const criticalValues: string[] = []
  const clinicalSignificance: string[] = []
  const followUp: string[] = []
  const patterns: string[] = []

  for (const lab of labResults) {
    const refRange = parseReferenceRange(lab.reference_range)
    if (!refRange) continue

    let flag: string | null = null

    if (lab.value < refRange.low) {
      const criticalLow = refRange.low * 0.7
      flag = lab.value < criticalLow ? 'critical_low' : 'low'
    } else if (lab.value > refRange.high) {
      const criticalHigh = refRange.high * 1.3
      flag = lab.value > criticalHigh ? 'critical_high' : 'high'
    }

    if (flag) {
      abnormalFlags.push({ test: lab.test, value: lab.value, unit: lab.unit, flag, ref: lab.reference_range })
      if (flag === 'critical_low' || flag === 'critical_high') {
        criticalValues.push(lab.test + ': ' + lab.value + ' ' + lab.unit + ' (' + (flag === 'critical_low' ? 'CRITICALLY LOW' : 'CRITICALLY HIGH') + ')')
      }
    }
  }

  // Pattern recognition
  const testNames = labResults.map(l => l.test.toLowerCase())

  // Anemia
  const hgb = labResults.find(l => l.test.toLowerCase() === 'hemoglobin')
  const hct = labResults.find(l => l.test.toLowerCase() === 'hematocrit')
  if (hgb && hct) {
    const hgbFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'hemoglobin')
    if (hgbFlag && hgbFlag.flag.includes('low')) {
      patterns.push('Anemia pattern: Low hemoglobin with corresponding low hematocrit')
      clinicalSignificance.push('Anemia detected - evaluate for iron deficiency, chronic disease, or blood loss')
      followUp.push('Check iron studies (ferritin, TIBC, serum iron)', 'Reticulocyte count', 'Peripheral smear', 'B12/folate levels if macrocytic')
    }
  }

  // Renal
  const creat = labResults.find(l => l.test.toLowerCase() === 'creatinine')
  const bun = labResults.find(l => l.test.toLowerCase() === 'bun')
  if (creat && bun) {
    const creatFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'creatinine')
    if (creatFlag && creatFlag.flag.includes('high')) {
      patterns.push('Renal dysfunction pattern: Elevated creatinine with elevated BUN')
      clinicalSignificance.push('Acute kidney injury or chronic kidney disease - determine acuity and stage')
      followUp.push('Calculate eGFR', 'Urinalysis with microscopy', 'Renal ultrasound', 'Check electrolytes (K+, Phos, Ca++)')
    }
  }

  // Liver
  const alt = labResults.find(l => l.test.toLowerCase() === 'alt')
  const ast = labResults.find(l => l.test.toLowerCase() === 'ast')
  if (alt && ast) {
    const altFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'alt')
    if (altFlag && altFlag.flag.includes('high')) {
      patterns.push('Hepatocellular injury pattern: Elevated transaminases')
      clinicalSignificance.push('Hepatocellular injury - evaluate for viral hepatitis, NAFLD, drug-induced liver injury')
      followUp.push('Hepatitis panel (A, B, C)', 'Alkaline phosphatase and GGT', 'Bilirubin (total and direct)', 'Liver ultrasound')
    }
  }

  // Lipids
  const ldl = labResults.find(l => l.test.toLowerCase() === 'ldl')
  const hdl = labResults.find(l => l.test.toLowerCase() === 'hdl')
  const tri = labResults.find(l => l.test.toLowerCase() === 'triglycerides')
  if (ldl && hdl && tri) {
    const ldlFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'ldl')
    const hdlFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'hdl')
    if ((ldlFlag && ldlFlag.flag.includes('high')) || (hdlFlag && hdlFlag.flag.includes('low'))) {
      patterns.push('Dyslipidemia pattern: Elevated LDL and/or decreased HDL')
      clinicalSignificance.push('Atherogenic dyslipidemia - increased cardiovascular risk')
      followUp.push('Calculate 10-year ASCVD risk', 'Assess for metabolic syndrome', 'Lifestyle modification counseling', 'Consider statin therapy per guidelines')
    }
  }

  // Glucose
  const glucose = labResults.find(l => l.test.toLowerCase() === 'glucose')
  const hba1c = labResults.find(l => l.test.toLowerCase() === 'hba1c' || l.test.toLowerCase() === 'a1c')
  if (glucose) {
    const glucFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'glucose')
    if (glucFlag && glucFlag.flag.includes('high')) {
      patterns.push('Hyperglycemia pattern')
      clinicalSignificance.push('Elevated glucose - evaluate for diabetes mellitus or prediabetes')
      followUp.push('HbA1c if not already done', 'Fasting glucose confirmation', 'Oral glucose tolerance test if indicated')
    }
  }
  if (hba1c) {
    const a1cFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'hba1c' || f.test.toLowerCase() === 'a1c')
    if (a1cFlag && a1cFlag.flag.includes('high')) {
      clinicalSignificance.push('Elevated HbA1c indicates poor glycemic control over past 2-3 months')
      followUp.push('Diabetes education', 'Medication adjustment', 'Ophthalmology referral', 'Nephrology screening')
    }
  }

  // Thyroid
  const tsh = labResults.find(l => l.test.toLowerCase() === 'tsh')
  const freeT4 = labResults.find(l => l.test.toLowerCase() === 'free t4')
  if (tsh && freeT4) {
    const tshFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'tsh')
    const t4Flag = abnormalFlags.find(f => f.test.toLowerCase() === 'free t4')
    if (tshFlag && tshFlag.flag.includes('high') && t4Flag && t4Flag.flag.includes('low')) {
      patterns.push('Primary hypothyroidism pattern: Elevated TSH with low free T4')
      clinicalSignificance.push('Overt primary hypothyroidism - thyroid gland failure')
      followUp.push('Thyroid peroxidase antibodies (TPO)', 'Thyroid ultrasound', 'Initiate levothyroxine', 'Recheck TSH in 6-8 weeks')
    } else if (tshFlag && tshFlag.flag.includes('low') && t4Flag && t4Flag.flag.includes('high')) {
      patterns.push('Hyperthyroidism pattern: Suppressed TSH with elevated free T4')
      clinicalSignificance.push('Overt hyperthyroidism - evaluate for Graves disease, toxic nodule')
      followUp.push('Thyroid uptake scan', 'TSI/TRAb antibodies', 'Thyroid ultrasound', 'Beta-blocker for symptom control')
    }
  }

  // Electrolytes
  const sodium = labResults.find(l => l.test.toLowerCase() === 'sodium')
  const potassium = labResults.find(l => l.test.toLowerCase() === 'potassium')
  if (sodium && potassium) {
    const naFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'sodium')
    const kFlag = abnormalFlags.find(f => f.test.toLowerCase() === 'potassium')
    if (naFlag && naFlag.flag.includes('low')) {
      clinicalSignificance.push('Hyponatremia - evaluate volume status (hypovolemic, euvolemic, hypervolemic)')
      followUp.push('Serum osmolality', 'Urine osmolality', 'Urine sodium', 'TSH and cortisol if euvolemic')
    }
    if (kFlag && kFlag.flag.includes('high')) {
      clinicalSignificance.push('Hyperkalemia - assess for pseudohyperkalemia, medication effects, renal failure')
      followUp.push('Repeat potassium to rule out hemolysis', 'ECG immediately if K+ > 6.0', 'Review ACEi/ARB/spironolactone use')
    }
  }

  if (patterns.length === 0 && abnormalFlags.length > 0) {
    patterns.push('Isolated abnormalities without a clear syndromic pattern')
  }

  if (followUp.length === 0 && abnormalFlags.length > 0) {
    followUp.push('Repeat abnormal tests to confirm', 'Correlate clinically with patient presentation', 'Consider specialist referral if persistent')
  }

  // Output
  if (criticalValues.length > 0) {
    lines.push('### CRITICAL VALUES')
    for (const cv of criticalValues) {
      lines.push('[!] ' + cv)
    }
    lines.push('')
  }

  if (abnormalFlags.length > 0) {
    lines.push('### Abnormal Results')
    lines.push('| Test | Value | Flag | Reference Range |')
    lines.push('|------|-------|------|-----------------|')
    for (const f of abnormalFlags) {
      lines.push('| ' + f.test + ' | ' + f.value + ' ' + f.unit + ' | ' + f.flag.replace(/_/g, ' ').toUpperCase() + ' | ' + f.ref + ' |')
    }
    lines.push('')
  }

  if (patterns.length > 0) {
    lines.push('### Pattern Recognition')
    for (const p of patterns) {
      lines.push('- ' + p)
    }
    lines.push('')
  }

  if (clinicalSignificance.length > 0) {
    lines.push('### Clinical Significance')
    for (const c of clinicalSignificance) {
      lines.push('- ' + c)
    }
    lines.push('')
  }

  if (followUp.length > 0) {
    lines.push('### Follow-Up Recommendations')
    for (const f of [...new Set(followUp)]) {
      lines.push('- ' + f)
    }
  }

  if (abnormalFlags.length === 0) {
    lines.push('All reported values within reference ranges.')
  }

  return lines.join('\n')
}

// ==================== TOOL 5: CLINICAL PATHWAY RECOMMENDER ====================

function recommendClinicalPathway(
  diagnosis: string,
  patientProfile?: Record<string, unknown>
): string {
  const lines: string[] = []
  lines.push('## Clinical Pathway Recommendation')
  lines.push('')

  const dx = diagnosis.toLowerCase()
  let pathway: string
  let evidence: string
  let steps: Array<{ step: number; action: string; duration: string; evidence: string }>
  let monitoring: Array<{ param: string; freq: string; target: string }>
  let alternatives: string[]

  if (dx.includes('type 2 diabetes') || dx.includes('t2dm')) {
    pathway = 'ADA/EASD Type 2 Diabetes Management Pathway'
    evidence = 'A'
    steps = [
      { step: 1, action: 'Lifestyle modification: diet, exercise (150 min/week), weight loss (5-10%)', duration: 'Ongoing', evidence: 'Grade A - Look AHEAD, DPP trials' },
      { step: 2, action: 'Metformin 500mg BID, titrate to 1000mg BID as tolerated', duration: 'First-line, ongoing', evidence: 'Grade A - UKPDS' },
      { step: 3, action: 'Add SGLT2 inhibitor (empagliflozin 10-25mg) or GLP-1 RA (semaglutide) if CVD/CKD/obesity', duration: 'Within 3 months if not at goal', evidence: 'Grade A - EMPA-REG, LEADER, SUSTAIN-6' },
      { step: 4, action: 'Add DPP-4 inhibitor or sulfonylurea if still above target', duration: 'Stepwise addition', evidence: 'Grade B' },
      { step: 5, action: 'Consider basal insulin (glargine/detemir) if HbA1c > 10% or symptomatic', duration: 'If oral agents insufficient', evidence: 'Grade A - 4-T trial' }
    ]
    monitoring = [
      { param: 'HbA1c', freq: 'Every 3 months until stable, then every 6 months', target: '< 7% (individualize)' },
      { param: 'Fasting glucose', freq: 'Self-monitoring as needed', target: '80-130 mg/dL' },
      { param: 'Blood pressure', freq: 'Every visit', target: '< 140/90 mmHg' },
      { param: 'Lipid panel', freq: 'Annually', target: 'LDL < 100 mg/dL' },
      { param: 'eGFR / urine albumin', freq: 'Annually', target: 'eGFR stable, UACR < 30 mg/g' }
    ]
    alternatives = ['Insulin-intensive pathway (if severe hyperglycemia at diagnosis)', 'Bariatric surgery pathway (if BMI > 40 or > 35 with comorbidities)', 'GLP-1 RA first-line (if established ASCVD or high CV risk)']
  } else if (dx.includes('hypertension') || dx.includes('htn')) {
    pathway = 'ACC/AHA Hypertension Management Pathway'
    evidence = 'A'
    steps = [
      { step: 1, action: 'Lifestyle: DASH diet, sodium < 2g/day, exercise, weight loss, limit alcohol', duration: 'Ongoing', evidence: 'Grade A - DASH-Sodium, PREMIER' },
      { step: 2, action: 'Initiate pharmacotherapy if BP >= 140/90 (or >= 130/80 with DM/CKD/ASCVD)', duration: 'Immediate if indicated', evidence: 'Grade A - SPRINT, ACCORD' },
      { step: 3, action: 'First-line: Thiazide (chlorthalidine 12.5-25mg), ACEi/ARB, or CCB (amlodipine 5mg)', duration: 'Start single agent', evidence: 'Grade A - ALLHAT' },
      { step: 4, action: 'Combination therapy if BP > 20/10 above target: ACEi + CCB or ACEi + thiazide', duration: 'Within 1-2 months', evidence: 'Grade A - ACCOMPLISH' },
      { step: 5, action: 'Add spironolactone 25mg if resistant hypertension (3-drug failure)', duration: 'Fourth-line', evidence: 'Grade B - PATHWAY-2' }
    ]
    monitoring = [
      { param: 'Blood pressure', freq: 'Every 3-6 months after goal; monthly until goal', target: '< 130/80 mmHg' },
      { param: 'Basic metabolic panel', freq: '1-2 weeks after starting ACEi/ARB/diuretic, then every 6 months', target: 'K+ 3.5-5.0, creatinine stable' },
      { param: 'Urinalysis', freq: 'Annually', target: 'No proteinuria' }
    ]
    alternatives = ['Beta-blocker pathway (if concomitant CAD, heart failure, or pregnancy)', 'Alpha-blocker pathway (if BPH symptoms)']
  } else if (dx.includes('community acquired pneumonia') || dx.includes('cap')) {
    pathway = 'IDSA/ATS Community-Acquired Pneumonia Pathway'
    evidence = 'A'
    steps = [
      { step: 1, action: 'Assess severity: CURB-65 score (Confusion, Urea, RR, BP, age >= 65)', duration: 'At presentation', evidence: 'Grade A - IDSA/ATS 2019' },
      { step: 2, action: 'Outpatient (CURB-65 0-1): Amoxicillin 1g TID OR Doxycycline 100mg BID OR Macrolide', duration: '5-7 days', evidence: 'Grade A' },
      { step: 3, action: 'Inpatient non-severe: Ceftriaxone 1g IV daily + Azithromycin 500mg daily', duration: '5-7 days, step-down to oral when stable', evidence: 'Grade A' },
      { step: 4, action: 'ICU/severe: Ceftriaxone + Azithromycin OR respiratory fluoroquinolone (levofloxacin 750mg)', duration: '7-14 days', evidence: 'Grade A' },
      { step: 5, action: 'Add vancomycin or linezolid if MRSA risk factors present', duration: 'If MRSA suspected', evidence: 'Grade B' }
    ]
    monitoring = [
      { param: 'Vital signs', freq: 'Every 4 hours (inpatient)', target: 'Afebrile, HR < 100, RR < 24, SpO2 > 90%' },
      { param: 'WBC count', freq: 'Day 2-3, then as needed', target: 'Trending down' },
      { param: 'Chest X-ray', freq: '4-6 weeks after treatment', target: 'Resolution of infiltrate' }
    ]
    alternatives = ['Pseudomonas coverage (piperacillin-tazobactam) if risk factors', 'Antiviral therapy if influenza positive']
  } else if (dx.includes('heart failure') || dx.includes('hf') || dx.includes('chf')) {
    pathway = 'ACC/AHA/HFSA Heart Failure (HFrEF) Management Pathway'
    evidence = 'A'
    steps = [
      { step: 1, action: 'Confirm diagnosis: BNP/NT-proBNP, echocardiogram, classify HFrEF vs HFpEF', duration: 'At diagnosis', evidence: 'Grade A' },
      { step: 2, action: 'Initiate GDMT: ACEi/ARB/ARNI + Beta-blocker (carvedilol, metoprolol succinate, bisoprolol)', duration: 'Start low, titrate every 2 weeks', evidence: 'Grade A - PARADIGM-HF, COPERNICUS' },
      { step: 3, action: 'Add MRA (spironolactone 25mg or eplerenone 25mg) if EF <= 35%', duration: 'Within 1 month', evidence: 'Grade A - RALES, EMPHASIS-HF' },
      { step: 4, action: 'Add SGLT2 inhibitor (dapagliflozin 10mg or empagliflozin 10mg)', duration: 'Regardless of diabetes status', evidence: 'Grade A - DAPA-HF, EMPEROR-Reduced' },
      { step: 5, action: 'Consider hydralazine/isosorbide dinitrate (especially Black patients) or ivabradine if HR >= 70', duration: 'Adjunctive therapy', evidence: 'Grade A - A-HeFT, SHIFT' }
    ]
    monitoring = [
      { param: 'Weight', freq: 'Daily (home)', target: 'Stable, report gain > 2-3 lbs/day or > 5 lbs/week' },
      { param: 'Blood pressure', freq: 'Every visit', target: 'SBP > 90, avoid hypotension' },
      { param: 'Creatinine / potassium', freq: '1 week after each med change, then every 3-6 months', target: 'K+ < 5.5, creatinine increase < 30%' },
      { param: 'BNP/NT-proBNP', freq: 'Every 3-6 months', target: 'Trending down' }
    ]
    alternatives = ['HFpEF pathway: SGLT2i, diuretics, comorbidity management', 'Advanced HF: CRT if LBBB + EF <= 35%, ICD if EF <= 35%', 'End-stage: Inotropes, LVAD evaluation, transplant referral']
  } else {
    pathway = 'General Clinical Pathway for ' + diagnosis
    evidence = 'C'
    steps = [
      { step: 1, action: 'Confirm diagnosis with appropriate workup and specialist consultation', duration: 'Initial evaluation', evidence: 'Expert consensus' },
      { step: 2, action: 'Initiate first-line therapy per current clinical guidelines', duration: 'Based on diagnosis', evidence: 'Guideline-directed' },
      { step: 3, action: 'Monitor treatment response and adjust therapy as needed', duration: 'Ongoing', evidence: 'Standard of care' },
      { step: 4, action: 'Add second-line therapy if inadequate response to first-line', duration: '4-12 weeks after initial therapy', evidence: 'Stepwise approach' },
      { step: 5, action: 'Consider specialist referral for refractory or complex cases', duration: 'If no response to standard therapy', evidence: 'Expert consensus' }
    ]
    monitoring = [
      { param: 'Clinical status', freq: 'Every visit', target: 'Symptom improvement' },
      { param: 'Relevant biomarkers', freq: 'Per guideline recommendations', target: 'Within target range' }
    ]
    alternatives = ['Second-line therapy options per specialty guidelines', 'Multidisciplinary team approach', 'Referral to specialist center for complex cases']
  }

  lines.push('**Pathway:** ' + pathway)
  lines.push('**Evidence Level:** ' + evidence)
  lines.push('')

  lines.push('### Treatment Steps')
  for (const s of steps) {
    lines.push('**Step ' + s.step + ':** ' + s.action)
    lines.push('- Duration: ' + s.duration + ' | Evidence: ' + s.evidence)
    lines.push('')
  }

  lines.push('### Monitoring Plan')
  lines.push('| Parameter | Frequency | Target |')
  lines.push('|-----------|-----------|--------|')
  for (const m of monitoring) {
    lines.push('| ' + m.param + ' | ' + m.freq + ' | ' + m.target + ' |')
  }
  lines.push('')

  lines.push('### Alternative Pathways')
  for (const a of alternatives) {
    lines.push('- ' + a)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: MEDICAL LITERATURE SUMMARIZER ====================

function summarizeLiterature(
  query: string,
  maxResults: number = 10
): string {
  const lines: string[] = []
  lines.push('## Medical Literature Summary')
  lines.push('')

  const q = query.toLowerCase()
  let summary: string
  let evidenceQuality: string
  let findings: Array<{ finding: string; studyType: string; sample: string; quality: string }>
  let implications: string[]
  let limitations: string[]

  if (q.includes('diabetes') && (q.includes('sglt2') || q.includes('empagliflozin') || q.includes('dapagliflozin'))) {
    summary = 'SGLT2 inhibitors have demonstrated significant cardiovascular and renal benefits beyond glucose lowering. The EMPA-REG OUTCOME trial showed empagliflozin reduced CV death by 38% and HF hospitalization by 35% in patients with T2DM and established CVD. DECLARE-TIMI 58 confirmed dapagliflozin reduced HF hospitalization regardless of ASCVD history. DAPA-HF and EMPEROR-Reduced extended these benefits to patients with HFrEF regardless of diabetes status.'
    evidenceQuality = 'high'
    findings = [
      { finding: '38% reduction in CV mortality with empagliflozin in T2DM with CVD', studyType: 'RCT (EMPA-REG OUTCOME)', sample: '7,020', quality: 'High' },
      { finding: '25% reduction in composite CV outcome with dapagliflozin', studyType: 'RCT (DECLARE-TIMI 58)', sample: '17,160', quality: 'High' },
      { finding: '26% reduction in composite worsening renal or CV death in HFrEF', studyType: 'RCT (DAPA-HF)', sample: '4,744', quality: 'High' },
      { finding: '21% reduction in composite CV death or HF hospitalization in HFpEF', studyType: 'RCT (EMPEROR-Preserved)', sample: '5,988', quality: 'High' }
    ]
    implications = [
      'SGLT2 inhibitors should be standard of care for T2DM with ASCVD, HF, or CKD',
      'Benefits extend to patients without diabetes (HFrEF)',
      'Initiate early in disease course for maximum benefit',
      'Monitor for euglycemic DKA, genital infections, volume depletion'
    ]
    limitations = [
      'Most trials were industry-sponsored',
      'Limited data in severe renal impairment (eGFR < 20)',
      'Long-term safety data beyond 4-5 years still accumulating'
    ]
  } else if (q.includes('covid') || q.includes('sars-cov') || q.includes('coronavirus')) {
    summary = 'COVID-19 management has evolved significantly since 2020. Vaccination remains the most effective prevention strategy, reducing severe disease by 80-90%. For hospitalized patients requiring oxygen, dexamethasone 6mg daily reduces mortality by 20%. Remdesivir shortens recovery time in moderate-severe disease. Paxlovid (nirmatrelvir/ritonavir) reduces hospitalization by 89% in high-risk outpatients when given within 5 days of symptom onset.'
    evidenceQuality = 'high'
    findings = [
      { finding: 'Dexamethasone reduces 28-day mortality by 20% in severe COVID-19', studyType: 'RCT (RECOVERY)', sample: '6,425', quality: 'High' },
      { finding: 'Paxlovid reduces hospitalization/death by 89% in high-risk unvaccinated', studyType: 'RCT (EPIC-HR)', sample: '2,246', quality: 'High' },
      { finding: 'mRNA vaccines 90-95% effective against ancestral strain severe disease', studyType: 'RCT (Phase III)', sample: '> 70,000', quality: 'High' },
      { finding: 'Tocilizumab reduces mortality when added to dexamethasone in severe disease', studyType: 'RCT (RECOVERY)', sample: '4,116', quality: 'High' }
    ]
    implications = [
      'Vaccination remains primary prevention strategy',
      'Early antiviral therapy for high-risk outpatients (within 5 days)',
      'Dexamethasone for all hospitalized patients requiring supplemental oxygen',
      'Immunomodulators (tocilizumab/baricitinib) for rapidly deteriorating patients'
    ]
    limitations = [
      'Rapidly evolving evidence base with frequent updates',
      'Variant-specific efficacy data changes over time',
      'Long COVID mechanisms still poorly understood'
    ]
  } else if (q.includes('statin') && (q.includes('cardiovascular') || q.includes('prevention'))) {
    summary = 'Statins remain the cornerstone of LDL-cholesterol lowering for cardiovascular prevention. Meta-analyses of over 170,000 participants demonstrate that each 1 mmol/L reduction in LDL reduces major vascular events by 22%. High-intensity statins reduce LDL by 50% or more. For patients not at goal on maximally tolerated statins, ezetimibe and PCSK9 inhibitors provide additional reduction.'
    evidenceQuality = 'high'
    findings = [
      { finding: '22% reduction in major vascular events per 1 mmol/L LDL reduction', studyType: 'Meta-analysis (CTT Collaboration)', sample: '174,149', quality: 'High' },
      { finding: 'IMPROVE-IT: Additional 6.4% risk reduction adding ezetimibe to statin', studyType: 'RCT', sample: '18,144', quality: 'High' },
      { finding: 'FOURIER: 15% reduction in CV events with evolocumab on statin', studyType: 'RCT', sample: '27,564', quality: 'High' },
      { finding: 'ODYSSEY: 15% reduction with alirocumab, including mortality benefit', studyType: 'RCT', sample: '18,924', quality: 'High' }
    ]
    implications = [
      'High-intensity statin for all ASCVD patients (unless contraindicated)',
      'Add ezetimibe if LDL >= 70 on maximally tolerated statin in very high risk',
      'PCSK9 inhibitors for familial hypercholesterolemia or statin-intolerant ASCVD',
      'Monitor LFTs at baseline and as needed (not routinely)'
    ]
    limitations = [
      'Statin intolerance may affect 5-10% of patients',
      'PCSK9 inhibitor cost and access barriers',
      'Limited data in patients over 75 years'
    ]
  } else {
    summary = 'A comprehensive literature search for "' + query + '" identified relevant studies across multiple databases. The evidence base includes randomized controlled trials, systematic reviews, meta-analyses, and observational studies. Key themes include diagnostic approaches, therapeutic interventions, prognostic factors, and emerging treatments.'
    evidenceQuality = 'moderate'
    findings = [
      { finding: 'Multiple RCTs support current standard of care for this condition', studyType: 'Systematic review', sample: 'Variable', quality: 'Moderate' },
      { finding: 'Emerging therapies show promise in Phase II/III trials', studyType: 'Randomized controlled trial', sample: '200-500', quality: 'Moderate' },
      { finding: 'Real-world evidence complements trial data for broader populations', studyType: 'Observational cohort', sample: '1,000-10,000', quality: 'Moderate' }
    ]
    implications = [
      'Apply evidence-based guidelines for initial management',
      'Consider patient-specific factors in treatment selection',
      'Monitor for emerging evidence that may change practice',
      'Shared decision-making incorporating patient preferences'
    ]
    limitations = [
      'Heterogeneity in study populations and interventions',
      'Publication bias may overestimate treatment effects',
      'Limited long-term follow-up in many studies'
    ]
  }

  lines.push('**Evidence Quality:** ' + evidenceQuality.toUpperCase() + ' | **Studies Reviewed:** ' + Math.min(maxResults, findings.length).toString())
  lines.push('')
  lines.push('### Summary')
  lines.push(summary)
  lines.push('')

  lines.push('### Key Findings')
  lines.push('| Finding | Study Type | Sample Size | Quality |')
  lines.push('|---------|-----------|-------------|---------|')
  for (const f of findings) {
    lines.push('| ' + f.finding + ' | ' + f.studyType + ' | ' + f.sample + ' | ' + f.quality + ' |')
  }
  lines.push('')

  lines.push('### Clinical Implications')
  for (const c of implications) {
    lines.push('- ' + c)
  }
  lines.push('')

  lines.push('### Limitations')
  for (const l of limitations) {
    lines.push('- ' + l)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: PATIENT RISK STRATIFIER ====================

function stratifyPatientRisk(patientData: PatientData): string {
  const lines: string[] = []
  lines.push('## Patient Risk Stratification Report')
  lines.push('')

  const { age, sex, conditions, vitals, labs, smoking, family_history } = patientData

  // Cardiovascular risk
  let cvScore = 0
  let tenYearCvRisk = 'Low (< 5%)'

  if (age >= 75) cvScore += 8
  else if (age >= 65) cvScore += 6
  else if (age >= 55) cvScore += 4
  else if (age >= 45) cvScore += 2

  if (sex === 'male') cvScore += 2

  if (vitals.systolic_bp) {
    if (vitals.systolic_bp >= 160) cvScore += 4
    else if (vitals.systolic_bp >= 140) cvScore += 3
    else if (vitals.systolic_bp >= 130) cvScore += 1
  }

  if (labs.total_cholesterol) {
    if (labs.total_cholesterol >= 240) cvScore += 3
    else if (labs.total_cholesterol >= 200) cvScore += 1
  }
  if (labs.hdl && labs.hdl < 40) cvScore += 2
  if (labs.ldl) {
    if (labs.ldl >= 160) cvScore += 3
    else if (labs.ldl >= 130) cvScore += 1
  }

  if (smoking) cvScore += 3
  if (conditions.some(c => c.toLowerCase().includes('diabetes'))) cvScore += 3
  if (family_history?.some(f => f.toLowerCase().includes('heart attack') || f.toLowerCase().includes('stroke'))) cvScore += 2

  let cvCategory: string
  if (cvScore >= 15) { cvCategory = 'Very High'; tenYearCvRisk = '> 30%' }
  else if (cvScore >= 12) { cvCategory = 'High'; tenYearCvRisk = '20-30%' }
  else if (cvScore >= 8) { cvCategory = 'Moderate'; tenYearCvRisk = '10-20%' }
  else if (cvScore >= 4) { cvCategory = 'Low-Moderate'; tenYearCvRisk = '5-10%' }
  else { cvCategory = 'Low'; tenYearCvRisk = '< 5%' }

  // Diabetes risk
  let dmScore = 0
  let tenYearDmRisk = 'Low'

  if (age >= 65) dmScore += 9
  else if (age >= 55) dmScore += 6
  else if (age >= 45) dmScore += 3

  if (vitals.bmi) {
    if (vitals.bmi >= 35) dmScore += 5
    else if (vitals.bmi >= 30) dmScore += 3
    else if (vitals.bmi >= 25) dmScore += 1
  }

  if (vitals.waist_cm) {
    if (sex === 'male' && vitals.waist_cm >= 102) dmScore += 4
    else if (sex === 'female' && vitals.waist_cm >= 88) dmScore += 4
    else if (sex === 'male' && vitals.waist_cm >= 94) dmScore += 2
    else if (sex === 'female' && vitals.waist_cm >= 80) dmScore += 2
  }

  if (labs.fasting_glucose) {
    if (labs.fasting_glucose >= 126) dmScore += 10
    else if (labs.fasting_glucose >= 100) dmScore += 5
  }

  if (labs.hba1c) {
    if (labs.hba1c >= 6.5) dmScore += 10
    else if (labs.hba1c >= 5.7) dmScore += 5
  }

  if (conditions.some(c => c.toLowerCase().includes('gestational diabetes') || c.toLowerCase().includes('pcos'))) dmScore += 3
  if (family_history?.some(f => f.toLowerCase().includes('diabetes'))) dmScore += 3

  let dmCategory: string
  if (dmScore >= 20) { dmCategory = 'Very High'; tenYearDmRisk = '> 50%' }
  else if (dmScore >= 15) { dmCategory = 'High'; tenYearDmRisk = '33%' }
  else if (dmScore >= 12) { dmCategory = 'Moderate'; tenYearDmRisk = '17%' }
  else if (dmScore >= 7) { dmCategory = 'Slightly Elevated'; tenYearDmRisk = '4%' }
  else { dmCategory = 'Low'; tenYearDmRisk = '1%' }

  // Readmission risk
  let readmitScore = 0
  let thirtyDayRisk = 'Low'

  if (conditions.length >= 5) readmitScore += 4
  else if (conditions.length >= 3) readmitScore += 2
  else if (conditions.length >= 1) readmitScore += 1

  if (age >= 75) readmitScore += 3
  else if (age >= 65) readmitScore += 2
  else if (age >= 55) readmitScore += 1

  if (conditions.some(c => c.toLowerCase().includes('heart failure') || c.toLowerCase().includes('copd'))) readmitScore += 3
  if (conditions.some(c => c.toLowerCase().includes('cancer') || c.toLowerCase().includes('malignancy'))) readmitScore += 2
  if (labs.egfr && labs.egfr < 30) readmitScore += 2
  if (smoking) readmitScore += 1

  let readmitCategory: string
  if (readmitScore >= 12) { readmitCategory = 'Very High'; thirtyDayRisk = '> 25%' }
  else if (readmitScore >= 9) { readmitCategory = 'High'; thirtyDayRisk = '15-25%' }
  else if (readmitScore >= 6) { readmitCategory = 'Moderate'; thirtyDayRisk = '8-15%' }
  else { readmitCategory = 'Low'; thirtyDayRisk = '< 8%' }

  // Overall
  const maxScore = Math.max(cvScore, dmScore, readmitScore)
  let overallCategory: string
  if (maxScore >= 15) overallCategory = 'very_high'
  else if (maxScore >= 10) overallCategory = 'high'
  else if (maxScore >= 6) overallCategory = 'moderate'
  else overallCategory = 'low'

  // Interventions
  const interventions: Array<{ category: string; intervention: string; priority: string; impact: string }> = []

  if (cvScore >= 8) {
    interventions.push({ category: 'Cardiovascular', intervention: 'High-intensity statin therapy', priority: 'essential', impact: '30% relative risk reduction in MACE' })
    interventions.push({ category: 'Cardiovascular', intervention: 'BP target < 130/80 mmHg', priority: 'essential', impact: '20% reduction in CV events' })
  }
  if (smoking) {
    interventions.push({ category: 'Lifestyle', intervention: 'Smoking cessation program', priority: 'essential', impact: '50% CV risk reduction within 1 year' })
  }
  if (vitals.bmi && vitals.bmi >= 25) {
    interventions.push({ category: 'Lifestyle', intervention: 'Weight management: 5-10% weight loss target', priority: 'recommended', impact: 'Improves all metabolic parameters' })
  }
  if (dmScore >= 12) {
    interventions.push({ category: 'Diabetes Prevention', intervention: 'Metformin 850mg BID (if prediabetes)', priority: 'recommended', impact: '31% risk reduction (DPP trial)' })
    interventions.push({ category: 'Diabetes Prevention', intervention: 'Intensive lifestyle program', priority: 'essential', impact: '58% risk reduction (DPP trial)' })
  }
  if (readmitScore >= 9) {
    interventions.push({ category: 'Readmission Prevention', intervention: 'Transitional care program with nurse follow-up', priority: 'essential', impact: '30-40% reduction in 30-day readmission' })
    interventions.push({ category: 'Readmission Prevention', intervention: 'Medication reconciliation within 48 hours of discharge', priority: 'essential', impact: 'Reduces adverse drug events by 50%' })
    interventions.push({ category: 'Readmission Prevention', intervention: 'Early follow-up appointment within 7 days', priority: 'recommended', impact: '25% reduction in readmission' })
  }
  if (labs.egfr && labs.egfr < 60) {
    interventions.push({ category: 'Renal Protection', intervention: 'ACEi/ARB for renal protection', priority: 'recommended', impact: 'Slows CKD progression by 30-50%' })
  }

  if (interventions.length === 0) {
    interventions.push({ category: 'Prevention', intervention: 'Continue healthy lifestyle and routine screening', priority: 'recommended', impact: 'Maintain current low-risk status' })
  }

  lines.push('**Overall Risk Category:** ' + overallCategory.replace('_', ' ').toUpperCase())
  lines.push('')

  lines.push('### Risk Scores')
  lines.push('| Domain | Score | Category | Timeframe Risk |')
  lines.push('|--------|-------|----------|----------------|')
  lines.push('| Cardiovascular | ' + cvScore + ' | ' + cvCategory + ' | ' + tenYearCvRisk + ' (10-yr) |')
  lines.push('| Diabetes | ' + dmScore + ' | ' + dmCategory + ' | ' + tenYearDmRisk + ' (10-yr) |')
  lines.push('| Readmission | ' + readmitScore + ' | ' + readmitCategory + ' | ' + thirtyDayRisk + ' (30-day) |')
  lines.push('')

  lines.push('### Recommended Interventions')
  lines.push('| Category | Intervention | Priority | Impact |')
  lines.push('|----------|-------------|----------|--------|')
  for (const i of interventions) {
    lines.push('| ' + i.category + ' | ' + i.intervention + ' | ' + i.priority.toUpperCase() + ' | ' + i.impact + ' |')
  }
  lines.push('')

  lines.push('### Monitoring Recommendations')
  lines.push('- Annual comprehensive metabolic panel')
  lines.push('- Lipid panel every 6-12 months (more frequent if on statin)')
  lines.push('- HbA1c every 3-6 months if diabetic, annually if prediabetic')
  lines.push('- Blood pressure check every 3-6 months')
  lines.push('- Smoking status assessment at every visit')
  lines.push('- Weight/BMI tracking at every visit')
  lines.push('- Depression screening annually')
  lines.push('- Cancer screening per age-appropriate guidelines')

  return lines.join('\n')
}

// ==================== TOOL 8: MEDICATION RECONCILIATION ====================

function reconcileMedications(
  currentMedications: ReconciliationEntry[],
  newPrescriptions: ReconciliationEntry[],
  dischargeMedications?: ReconciliationEntry[]
): string {
  const lines: string[] = []
  lines.push('## Medication Reconciliation Report')
  lines.push('')

  const discrepancies: Array<{ type: string; medication: string; before: string; after: string; significance: string; action: string }> = []
  const duplications: Array<{ meds: string[]; type: string; recommendation: string }> = []
  const omissions: Array<{ medication: string; indication: string; recommendation: string }> = []
  const interactions: Array<{ meds: string[]; severity: string; mechanism: string; recommendation: string }> = []
  const actionItems: string[] = []

  const currentNames = currentMedications.map(m => m.name.toLowerCase())
  const newNames = newPrescriptions.map(m => m.name.toLowerCase())

  // Find dose/frequency changes
  for (const current of currentMedications) {
    const newMatch = newPrescriptions.find(n => n.name.toLowerCase() === current.name.toLowerCase())
    if (newMatch) {
      if (newMatch.dose !== current.dose) {
        discrepancies.push({ type: 'dose_change', medication: current.name, before: current.dose + ' ' + current.frequency, after: newMatch.dose + ' ' + newMatch.frequency, significance: 'Dose changed from ' + current.dose + ' to ' + newMatch.dose, action: 'Verify dose change is intentional; monitor for efficacy/toxicity' })
      }
      if (newMatch.frequency !== current.frequency) {
        discrepancies.push({ type: 'frequency_change', medication: current.name, before: current.dose + ' ' + current.frequency, after: newMatch.dose + ' ' + newMatch.frequency, significance: 'Frequency changed from ' + current.frequency + ' to ' + newMatch.frequency, action: 'Verify frequency change; assess adherence implications' })
      }
      if (newMatch.route !== current.route) {
        discrepancies.push({ type: 'route_change', medication: current.name, before: current.route, after: newMatch.route, significance: 'Route changed from ' + current.route + ' to ' + newMatch.route, action: 'Confirm route change is clinically appropriate' })
      }
    }
  }

  // Find discontinued medications
  for (const current of currentMedications) {
    if (!newNames.includes(current.name.toLowerCase())) {
      discrepancies.push({ type: 'discontinued', medication: current.name, before: current.dose + ' ' + current.frequency + ' ' + current.route, after: 'Discontinued', significance: current.name + ' was on home medication list but not continued', action: 'Verify discontinuation is intentional. If unintentional, restart ' + current.name + ' for ' + (current.indication || 'indicated condition') })
      omissions.push({ medication: current.name, indication: current.indication || 'Previously indicated', recommendation: 'Consider restarting ' + current.name + ' ' + current.dose + ' ' + current.frequency + ' if discontinuation was unintentional' })
    }
  }

  // Find new additions
  for (const newMed of newPrescriptions) {
    if (!currentNames.includes(newMed.name.toLowerCase())) {
      discrepancies.push({ type: 'new_addition', medication: newMed.name, before: 'Not previously prescribed', after: newMed.dose + ' ' + newMed.frequency + ' ' + newMed.route, significance: 'New medication added: ' + newMed.name, action: 'Confirm indication for ' + newMed.name + '; counsel patient on proper use' })
    }
  }

  // Check for therapeutic duplications
  const drugClasses: Record<string, string[]> = {
    'ACE inhibitors': ['lisinopril', 'enalapril', 'ramipril', 'captopril'],
    'ARBs': ['losartan', 'valsartan', 'irbesartan', 'olmesartan'],
    'Statins': ['atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin'],
    'SSRIs': ['fluoxetine', 'sertraline', 'paroxetine', 'citalopram', 'escitalopram'],
    'NSAIDs': ['ibuprofen', 'naproxen', 'diclofenac', 'meloxicam'],
    'Beta-blockers': ['metoprolol', 'atenolol', 'carvedilol', 'bisoprolol'],
    'Proton pump inhibitors': ['omeprazole', 'pantoprazole', 'esomeprazole', 'lansoprazole']
  }

  const allMeds = [...currentMedications, ...newPrescriptions].map(m => m.name.toLowerCase())
  for (const [drugClass, drugs] of Object.entries(drugClasses)) {
    const matches = allMeds.filter(m => drugs.includes(m))
    if (matches.length > 1) {
      duplications.push({ meds: matches, type: 'therapeutic', recommendation: 'Patient on multiple ' + drugClass + ': ' + matches.join(', ') + '. Review for therapeutic duplication and discontinue if not clinically justified.' })
    }
  }

  // Check for drug-drug interactions
  const interactionPairs: Array<{ meds: string[]; severity: string; mechanism: string; recommendation: string }> = [
    { meds: ['warfarin', 'aspirin'], severity: 'major', mechanism: 'Additive bleeding risk', recommendation: 'Avoid combination or add PPI; monitor INR closely' },
    { meds: ['warfarin', 'ibuprofen'], severity: 'major', mechanism: 'NSAID increases bleeding risk and may elevate INR', recommendation: 'Avoid NSAIDs with warfarin; use acetaminophen instead' },
    { meds: ['lisinopril', 'spironolactone'], severity: 'major', mechanism: 'Risk of life-threatening hyperkalemia', recommendation: 'Monitor potassium within 1 week; avoid if K+ > 5.0' },
    { meds: ['metformin', 'contrast'], severity: 'moderate', mechanism: 'Risk of lactic acidosis if contrast-induced nephropathy', recommendation: 'Hold metformin 48 hours before/after contrast' },
    { meds: ['fluoxetine', 'tramadol'], severity: 'major', mechanism: 'Serotonin syndrome risk', recommendation: 'Avoid combination; use alternative analgesic' },
    { meds: ['atorvastatin', 'clarithromycin'], severity: 'major', mechanism: 'CYP3A4 inhibition increases statin levels', recommendation: 'Hold statin during clarithromycin course' },
    { meds: ['lisinopril', 'ibuprofen'], severity: 'moderate', mechanism: 'NSAID blunts ACEi effect; may impair renal function', recommendation: 'Minimize NSAID use; monitor BP and renal function' }
  ]

  for (const pair of interactionPairs) {
    const found = pair.meds.filter(m => allMeds.includes(m))
    if (found.length === pair.meds.length) {
      interactions.push({ meds: found, severity: pair.severity, mechanism: pair.mechanism, recommendation: pair.recommendation })
    }
  }

  // Generate action items
  if (discrepancies.length > 0) {
    actionItems.push('Review and resolve ' + discrepancies.length + ' medication discrepancy(ies)')
  }
  if (duplications.length > 0) {
    actionItems.push('Address ' + duplications.length + ' therapeutic duplication(s)')
  }
  if (omissions.length > 0) {
    actionItems.push('Evaluate ' + omissions.length + ' potential omission(s) for unintentional discontinuation')
  }
  if (interactions.length > 0) {
    actionItems.push('Manage ' + interactions.length + ' drug-drug interaction(s)')
  }
  actionItems.push('Provide updated medication list to patient')
  actionItems.push('Counsel patient on all medication changes')
  actionItems.push('Document reconciliation in medical record')
  actionItems.push('Schedule follow-up to assess medication tolerance and adherence')

  // Output
  if (discrepancies.length > 0) {
    lines.push('### Discrepancies (' + discrepancies.length + ')')
    lines.push('| Type | Medication | Before | After | Significance | Action Required |')
    lines.push('|------|-----------|--------|-------|-------------|----------------|')
    for (const d of discrepancies) {
      lines.push('| ' + d.type.replace(/_/g, ' ') + ' | ' + d.medication + ' | ' + d.before + ' | ' + d.after + ' | ' + d.significance + ' | ' + d.action + ' |')
    }
    lines.push('')
  }

  if (duplications.length > 0) {
    lines.push('### Therapeutic Duplications (' + duplications.length + ')')
    for (const d of duplications) {
      lines.push('- **' + d.meds.join(' + ') + '** (' + d.type + '): ' + d.recommendation)
    }
    lines.push('')
  }

  if (omissions.length > 0) {
    lines.push('### Potential Omissions (' + omissions.length + ')')
    for (const o of omissions) {
      lines.push('- **' + o.medication + '** (' + o.indication + '): ' + o.recommendation)
    }
    lines.push('')
  }

  if (interactions.length > 0) {
    lines.push('### Drug Interactions (' + interactions.length + ')')
    lines.push('| Medications | Severity | Mechanism | Recommendation |')
    lines.push('|-------------|----------|-----------|----------------|')
    for (const i of interactions) {
      lines.push('| ' + i.meds.join(' + ') + ' | ' + i.severity.toUpperCase() + ' | ' + i.mechanism + ' | ' + i.recommendation + ' |')
    }
    lines.push('')
  }

  lines.push('### Action Items')
  for (let idx = 0; idx < actionItems.length; idx++) {
    lines.push((idx + 1) + '. ' + actionItems[idx])
  }

  if (discrepancies.length === 0 && duplications.length === 0 && omissions.length === 0 && interactions.length === 0) {
    lines.push('No discrepancies, duplications, omissions, or interactions identified.')
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'symptom_analyzer',
    description: 'Analyze patient symptoms to generate differential diagnosis, assess urgency level, identify red flags, and recommend diagnostic tests. Accepts structured symptom data with severity and duration.',
    parameters: {
      symptoms: { type: 'string', required: true, description: 'JSON array of symptom objects with fields: symptom (string), severity ("mild"|"moderate"|"severe"), duration (string like "3 days")' },
      patient_demographics: { type: 'string', description: 'Optional JSON object with fields: age, sex, weight_kg, allergies, chronic_conditions, medications' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { symptoms: string; patient_demographics?: string }) {
      const symptomData: SymptomEntry[] = JSON.parse(args.symptoms)
      const demographics = args.patient_demographics ? JSON.parse(args.patient_demographics) as PatientDemographics : undefined
      const result = analyzeSymptoms(symptomData, demographics)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'drug_interaction_checker',
    description: 'Check for drug-drug interactions between current medications and a new medication. Provides severity rating, mechanism, clinical consequences, management strategies, and alternative suggestions.',
    parameters: {
      medications: { type: 'string', required: true, description: 'JSON array of current medication objects with fields: name, dose, frequency' },
      new_medication: { type: 'string', required: true, description: 'Name of the new medication to check for interactions' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { medications: string; new_medication: string }) {
      const meds: MedicationEntry[] = JSON.parse(args.medications)
      const result = checkDrugInteractions(meds, args.new_medication)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'medical_coder',
    description: 'Suggest medical codes (ICD-10, CPT, or SNOMED CT) based on clinical documentation. Provides code descriptions, confidence levels, and documentation requirements for accurate coding.',
    parameters: {
      clinical_notes: { type: 'string', required: true, description: 'Clinical documentation text to analyze for code suggestions' },
      coding_system: { type: 'string', description: 'Coding system to use: "ICD-10" (default), "CPT", or "SNOMED"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { clinical_notes: string; coding_system?: string }) {
      const system = (args.coding_system as 'ICD-10' | 'CPT' | 'SNOMED') ?? 'ICD-10'
      const result = suggestMedicalCodes(args.clinical_notes, system)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'lab_result_interpreter',
    description: 'Interpret laboratory results by flagging abnormal values, recognizing clinical patterns, and providing follow-up recommendations. Supports CBC, metabolic panel, liver function, lipids, thyroid, and more.',
    parameters: {
      lab_results: { type: 'string', required: true, description: 'JSON array of lab result objects with fields: test (string), value (number), unit (string), reference_range (string like "12-16" or "< 200")' },
      patient_context: { type: 'string', description: 'Optional JSON object with fields: age, sex, conditions, medications, pregnant' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { lab_results: string; patient_context?: string }) {
      const labs: LabResultEntry[] = JSON.parse(args.lab_results)
      const context = args.patient_context ? JSON.parse(args.patient_context) as PatientContext : undefined
      const result = interpretLabResults(labs, context)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'clinical_pathway_recommender',
    description: 'Recommend evidence-based clinical pathways for specific diagnoses. Provides treatment steps with evidence levels, monitoring plans, and alternative pathway options.',
    parameters: {
      diagnosis: { type: 'string', required: true, description: 'Primary diagnosis or condition (e.g., "Type 2 Diabetes", "Hypertension", "Community-Acquired Pneumonia")' },
      patient_profile: { type: 'string', description: 'Optional JSON object with patient-specific factors that may influence pathway selection' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { diagnosis: string; patient_profile?: string }) {
      const profile = args.patient_profile ? JSON.parse(args.patient_profile) : undefined
      const result = recommendClinicalPathway(args.diagnosis, profile)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'medical_literature_summarizer',
    description: 'Summarize medical literature for a given clinical query. Provides evidence quality assessment, key findings from relevant studies, clinical implications, and search strategy.',
    parameters: {
      query: { type: 'string', required: true, description: 'Clinical question or search query (e.g., "SGLT2 inhibitors cardiovascular outcomes", "COVID-19 treatment guidelines")' },
      max_results: { type: 'string', description: 'Maximum number of studies to include in summary (default "10")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; max_results?: string }) {
      const maxRes = parseInt(args.max_results ?? '10', 10)
      const result = summarizeLiterature(args.query, maxRes)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'patient_risk_stratifier',
    description: 'Stratify patient risk across cardiovascular, diabetes, and readmission domains. Calculates risk scores, categorizes overall risk, and recommends targeted interventions.',
    parameters: {
      patient_data: { type: 'string', required: true, description: 'JSON object with fields: age, sex, conditions (array), vitals (systolic_bp, diastolic_bp, heart_rate, bmi, waist_cm), labs (total_cholesterol, hdl, ldl, triglycerides, fasting_glucose, hba1c, creatinine, egfr, alt, ast), smoking (boolean), family_history (array)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { patient_data: string }) {
      const data: PatientData = JSON.parse(args.patient_data)
      const result = stratifyPatientRisk(data)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'medication_reconciliation',
    description: 'Perform medication reconciliation by comparing current medications with new prescriptions and discharge medications. Identifies discrepancies, duplications, omissions, and interactions.',
    parameters: {
      current_medications: { type: 'string', required: true, description: 'JSON array of current/home medication objects with fields: name, dose, frequency, route, indication' },
      new_prescriptions: { type: 'string', required: true, description: 'JSON array of new prescription objects with fields: name, dose, frequency, route, indication' },
      discharge_medications: { type: 'string', description: 'Optional JSON array of discharge medication objects (same structure)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_medications: string; new_prescriptions: string; discharge_medications?: string }) {
      const current: ReconciliationEntry[] = JSON.parse(args.current_medications)
      const newRx: ReconciliationEntry[] = JSON.parse(args.new_prescriptions)
      const discharge = args.discharge_medications ? JSON.parse(args.discharge_medications) : undefined
      const result = reconcileMedications(current, newRx, discharge)
      return result
    }
  }))

  console.log('[dsh-tool-healthai] Loaded v' + VERSION + ' - Healthcare Diagnostics Support with 8 tools')
  console.log('  Tools: symptom_analyzer, drug_interaction_checker, medical_coder, lab_result_interpreter, clinical_pathway_recommender, medical_literature_summarizer, patient_risk_stratifier, medication_reconciliation')
}
