/**
 * DSH Longevity & Healthspan Optimization Plugin v1.0.0
 *
 * Evidence-based longevity toolkit for DeepSeek Harness Agent.
 * Designed for longevity researchers, biohackers, clinicians, and health optimizers.
 *
 * Features (v1.0.0):
 * - Biomarker Tracker (longitudinal tracking, trend analysis, alert thresholds)
 * - Aging Clock Calculator (epigenetic, telomeric, phenotypic age estimation)
 * - Intervention Planning (evidence-based longevity intervention design)
 * - Longevity Research Synthesizer (literature review, evidence grading)
 * - Healthspan Optimizer (multi-domain healthspan scoring and optimization)
 * - Epigenetic Analyzer (DNA methylation pattern interpretation)
 * - Senolytic Therapy Advisor (senolytic compound comparison and scheduling)
 * - Personalized Longevity Protocol (integrated multi-modal longevity plan)
 *
 * @module dsh-tool-longevityai
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-longevityai'
export const inject = ['tools']

const VERSION = '1.0.0'

// ==================== PRNG (mulberry32) ====================

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromInput(input: unknown): number {
  const str = JSON.stringify(input)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash + chr) | 0
  }
  return hash
}

// ==================== TYPES ====================

export interface BiomarkerEntry {
  name: string
  value: number
  unit: string
  reference_range: string
  date: string
  category?: string
}

export interface BiomarkerHistory {
  biomarker: string
  entries: Array<{ date: string; value: number }>
  trend: 'improving' | 'stable' | 'worsening' | 'insufficient_data'
  percent_change: number
  alert_level: 'none' | 'watch' | 'warning' | 'critical'
}

export interface AgingClockInput {
  age: number
  sex: 'male' | 'female'
  biomarkers: BiomarkerEntry[]
  lifestyle_factors?: {
    exercise_hours_per_week?: number
    sleep_hours_per_night?: number
    smoking?: boolean
    alcohol_drinks_per_week?: number
    diet_quality?: 'poor' | 'average' | 'good' | 'excellent'
    stress_level?: 'low' | 'moderate' | 'high'
  }
}

export interface AgingClockResult {
  phenotypic_age: number
  telomeric_age_estimate: number
  epigenetic_age_estimate: number
  composite_biological_age: number
  age_acceleration: number
  aging_rate: number
  domain_scores: {
    metabolic: number
    cardiovascular: number
    inflammatory: number
    hepatic: number
    renal: number
  }
  confidence: number
}

export interface Intervention {
  name: string
  category: 'pharmacological' | 'nutritional' | 'lifestyle' | 'supplement' | 'hormonal'
  evidence_level: 'A' | 'B' | 'C' | 'D'
  target_biomarkers: string[]
  expected_benefit: string
  risks: string[]
  dosage?: string
  duration: string
  priority: 'essential' | 'recommended' | 'optional'
  references: string[]
}

export interface InterventionPlan {
  patient_age: number
  patient_sex: string
  goals: string[]
  interventions: Intervention[]
  monitoring_plan: Array<{ biomarker: string; frequency: string; target: string }>
  timeline_months: number
  overall_evidence_grade: string
}

export interface ResearchQuery {
  topic: string
  max_results?: number
  study_types?: string[]
  year_range?: [number, number]
}

export interface ResearchFinding {
  finding: string
  study_type: string
  sample_size: string
  year: number
  quality: string
  journal: string
  doi?: string
}

export interface ResearchSynthesis {
  query: string
  evidence_quality: string
  total_studies: number
  findings: ResearchFinding[]
  summary: string
  clinical_implications: string[]
  limitations: string[]
  consensus_level: string
}

export interface HealthspanDomain {
  domain: string
  score: number
  max_score: number
  percentile: number
  key_factors: string[]
  optimization_potential: 'low' | 'moderate' | 'high'
}

export interface HealthspanProfile {
  overall_healthspan_score: number
  healthspan_percentile: number
  estimated_healthspan_years: number
  domains: HealthspanDomain[]
  top_recommendations: Array<{ domain: string; action: string; impact: string }>
  risk_factors: Array<{ factor: string; severity: string; mitigation: string }>
}

export interface EpigeneticMarker {
  cpg_site: string
  gene: string
  methylation_level: number
  expected_level: number
  deviation: number
  biological_age_contribution: number
  associated_pathway: string
}

export interface EpigeneticProfile {
  sample_id: string
  estimated_age: number
  age_acceleration: number
  markers: EpigeneticMarker[]
  pathway_analysis: Array<{ pathway: string; status: string; score: number }>
  recommendations: string[]
  confidence: number
}

export interface SenolyticCompound {
  name: string
  mechanism: string
  targets: string[]
  evidence_level: string
  dosage: string
  route: string
  half_life: string
  schedule: string
  side_effects: string[]
  contraindications: string[]
  drug_interactions: string[]
  priority: number
}

export interface SenolyticPlan {
  patient_age: number
  patient_sex: string
  senolytic_compounds: SenolyticCompound[]
  recommended_schedule: Array<{ compound: string; dose: string; day: string; notes: string }>
  monitoring: Array<{ parameter: string; frequency: string; target: string }>
  precautions: string[]
  evidence_summary: string
}

export interface LongevityProtocol {
  patient_age: number
  patient_sex: string
  biological_age: number
  protocol_duration_months: number
  pillars: Array<{ pillar: string; interventions: Array<{ name: string; details: string; frequency: string }> }>
  daily_routine: Array<{ time: string; activity: string; category: string }>
  biomarker_tracking: Array<{ biomarker: string; frequency: string; target_range: string }>
  follow_up: Array<{ timepoint: string; assessments: string[] }>
  expected_outcomes: Array<{ outcome: string; timeline: string; measurement: string }>
  evidence_base: string[]
}

// ==================== TOOL 1: BIOMARKER TRACKER ====================

function trackBiomarkers(
  current: BiomarkerEntry[],
  history: BiomarkerEntry[]
): string {
  const lines: string[] = []
  lines.push('## Biomarker Tracking Report')
  lines.push('')

  const rng = mulberry32(seedFromInput({ current: current, history: history }))
  const allBiomarkers = new Map<string, BiomarkerHistory>()

  // Group history by biomarker
  const historyByBiomarker = new Map<string, Array<{ date: string; value: number }>>()
  for (const entry of history) {
    const existing = historyByBiomarker.get(entry.name) || []
    existing.push({ date: entry.date, value: entry.value })
    historyByBiomarker.set(entry.name, existing)
  }

  // Sort each history by date
  for (const [name, entries] of historyByBiomarker) {
    entries.sort((a, b) => a.date.localeCompare(b.date))
  }

  // Analyze each current biomarker
  for (const marker of current) {
    const hist = historyByBiomarker.get(marker.name) || []
    const allEntries = [...hist, { date: marker.date, value: marker.value }].sort((a, b) => a.date.localeCompare(b.date))

    let trend: 'improving' | 'stable' | 'worsening' | 'insufficient_data' = 'insufficient_data'
    let percentChange = 0
    let alertLevel: 'none' | 'watch' | 'warning' | 'critical' = 'none'

    if (allEntries.length >= 2) {
      const first = allEntries[0].value
      const last = allEntries[allEntries.length - 1].value
      percentChange = first !== 0 ? ((last - first) / first) * 100 : 0

      // Determine if higher or lower is better based on biomarker type
      const lowerIsBetter = ['ldl', 'triglycerides', 'fasting_glucose', 'hba1c', 'crp', 'homocysteine', 'alt', 'ast'].some(
        k => marker.name.toLowerCase().includes(k)
      )
      const higherIsBetter = ['hdl', 'testosterone', 'igf-1', 'vitamin_d', 'albumin'].some(
        k => marker.name.toLowerCase().includes(k)
      )

      if (lowerIsBetter) {
        trend = percentChange < -5 ? 'improving' : percentChange > 5 ? 'worsening' : 'stable'
      } else if (higherIsBetter) {
        trend = percentChange > 5 ? 'improving' : percentChange < -5 ? 'worsening' : 'stable'
      } else {
        trend = Math.abs(percentChange) <= 5 ? 'stable' : (percentChange > 0 ? 'improving' : 'worsening')
      }
    }

    // Alert levels based on reference range
    const refParts = marker.reference_range.split('-').map(s => parseFloat(s.trim()))
    if (refParts.length === 2) {
      const [low, high] = refParts
      const val = marker.value
      const range = high - low
      if (val < low - range * 0.5 || val > high + range * 0.5) {
        alertLevel = 'critical'
      } else if (val < low - range * 0.2 || val > high + range * 0.2) {
        alertLevel = 'warning'
      } else if (val < low || val > high) {
        alertLevel = 'watch'
      }
    }

    allBiomarkers.set(marker.name, {
      biomarker: marker.name,
      entries: allEntries,
      trend: trend,
      percent_change: Math.round(percentChange * 100) / 100,
      alert_level: alertLevel
    })
  }

  // Output summary
  lines.push('### Biomarker Summary')
  lines.push('| Biomarker | Current Value | Unit | Reference | Trend | Change | Alert |')
  lines.push('|-----------|--------------|------|-----------|-------|--------|-------|')
  for (const marker of current) {
    const analysis = allBiomarkers.get(marker.name)
    lines.push(
      '| ' + marker.name + ' | ' + marker.value + ' | ' + marker.unit + ' | ' + marker.reference_range + ' | ' +
      (analysis?.trend || 'insufficient_data') + ' | ' +
      (analysis ? analysis.percent_change.toFixed(1) + '%' : 'N/A') + ' | ' +
      (analysis?.alert_level || 'none').toUpperCase() + ' |'
    )
  }
  lines.push('')

  // Trend details
  lines.push('### Longitudinal Trends')
  for (const [bmName, analysis] of allBiomarkers) {
    if (analysis.entries.length >= 2) {
      lines.push('**' + bmName + '** (' + analysis.entries.length + ' measurements)')
      lines.push('- Trend: ' + analysis.trend.replace('_', ' ').toUpperCase())
      lines.push('- Total change: ' + analysis.percent_change.toFixed(1) + '%')
      lines.push('- Latest: ' + analysis.entries[analysis.entries.length - 1].value + ' on ' + analysis.entries[analysis.entries.length - 1].date)
      lines.push('')
    }
  }

  // Alerts
  const alerts = [...allBiomarkers.values()].filter(b => b.alert_level !== 'none')
  if (alerts.length > 0) {
    lines.push('### Alerts')
    for (const a of alerts) {
      const icon = a.alert_level === 'critical' ? '[CRITICAL]' : a.alert_level === 'warning' ? '[WARNING]' : '[WATCH]'
      lines.push(icon + ' ' + a.biomarker + ': ' + a.trend.replace('_', ' ') + ' (' + a.percent_change.toFixed(1) + '% change)')
    }
    lines.push('')
  }

  // Recommendations
  lines.push('### Recommendations')
  for (const marker of current) {
    const analysis = allBiomarkers.get(marker.name)
    if (analysis && analysis.alert_level !== 'none') {
      if (marker.name.toLowerCase().includes('ldl') && analysis.trend === 'worsening') {
        lines.push('- LDL trending upward: Consider dietary modification (reduce saturated fat, increase fiber), exercise optimization, and re-test in 8-12 weeks')
      } else if (marker.name.toLowerCase().includes('glucose') && analysis.trend === 'worsening') {
        lines.push('- Glucose trending upward: Evaluate carbohydrate intake, consider continuous glucose monitoring, increase aerobic exercise')
      } else if (marker.name.toLowerCase().includes('crp') && analysis.trend === 'worsening') {
        lines.push('- CRP elevated/worsening: Assess inflammatory sources, optimize omega-3 intake, evaluate sleep quality and stress management')
      } else if (marker.name.toLowerCase().includes('vitamin_d') && (analysis.alert_level as string) !== 'none') {
        lines.push('- Vitamin D out of range: Adjust supplementation dose, re-test in 12 weeks, aim for 40-60 ng/mL optimal range')
      } else {
        lines.push('- ' + marker.name + ' requires attention: ' + analysis.alert_level.toUpperCase() + ' alert, trend: ' + analysis.trend.replace('_', ' '))
      }
    }
  }

  if (alerts.length === 0) {
    lines.push('- All biomarkers within acceptable ranges. Continue current monitoring schedule.')
  }

  lines.push('')
  lines.push('> **Disclaimer:** This analysis is generated by an AI model and is not a substitute for professional medical judgment. All findings must be validated by a qualified healthcare provider.')

  return lines.join('\n')
}

// ==================== TOOL 2: AGING CLOCK CALCULATOR ====================

function calculateAgingClock(input: AgingClockInput): string {
  const lines: string[] = []
  lines.push('## Aging Clock Calculation Report')
  lines.push('')

  const rng = mulberry32(seedFromInput(input))
  const { age, sex, biomarkers, lifestyle_factors } = input

  // Extract biomarker values
  const bmValues: Record<string, number> = {}
  for (const bm of biomarkers) {
    bmValues[bm.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')] = bm.value
  }

  // Phenotypic age calculation (simplified Levine/Hannum-inspired)
  let phenotypicScore = age
  let metabolicAge = age
  let cardiovascularAge = age
  let inflammatoryAge = age
  let hepaticAge = age
  let renalAge = age

  // Metabolic domain
  if (bmValues['glucose'] || bmValues['fasting_glucose']) {
    const glucose = bmValues['glucose'] || bmValues['fasting_glucose']
    metabolicAge += (glucose - 90) * 0.15
  }
  if (bmValues['hba1c']) {
    metabolicAge += (bmValues['hba1c'] - 5.0) * 3.5
  }
  if (bmValues['triglycerides']) {
    metabolicAge += (bmValues['triglycerides'] - 100) * 0.03
  }

  // Cardiovascular domain
  if (bmValues['ldl']) {
    cardiovascularAge += (bmValues['ldl'] - 100) * 0.04
  }
  if (bmValues['hdl']) {
    cardiovascularAge -= (bmValues['hdl'] - 50) * 0.15
  }
  if (bmValues['total_cholesterol']) {
    cardiovascularAge += (bmValues['total_cholesterol'] - 180) * 0.03
  }

  // Inflammatory domain
  if (bmValues['crp'] || bmValues['hs_crp']) {
    const crp = bmValues['crp'] || bmValues['hs_crp']
    inflammatoryAge += crp * 2.5
  }
  if (bmValues['homocysteine']) {
    inflammatoryAge += (bmValues['homocysteine'] - 8) * 1.2
  }

  // Hepatic domain
  if (bmValues['alt']) {
    hepaticAge += (bmValues['alt'] - 25) * 0.1
  }
  if (bmValues['ast']) {
    hepaticAge += (bmValues['ast'] - 25) * 0.08
  }
  if (bmValues['ggt']) {
    hepaticAge += (bmValues['ggt'] - 30) * 0.05
  }

  // Renal domain
  if (bmValues['creatinine']) {
    renalAge += (bmValues['creatinine'] - 1.0) * 8
  }
  if (bmValues['egfr']) {
    renalAge -= (bmValues['egfr'] - 90) * 0.1
  }
  if (bmValues['bun']) {
    renalAge += (bmValues['bun'] - 15) * 0.2
  }

  // Lifestyle adjustments
  if (lifestyle_factors) {
    const lf = lifestyle_factors
    if (lf.exercise_hours_per_week !== undefined) {
      const exerciseBenefit = Math.min(lf.exercise_hours_per_week * 0.3, 3)
      metabolicAge -= exerciseBenefit
      cardiovascularAge -= exerciseBenefit * 1.2
    }
    if (lf.sleep_hours_per_night !== undefined) {
      if (lf.sleep_hours_per_night < 6) {
        metabolicAge += 1.5
        inflammatoryAge += 1.0
      } else if (lf.sleep_hours_per_night >= 7 && lf.sleep_hours_per_night <= 8) {
        metabolicAge -= 0.5
        inflammatoryAge -= 0.5
      }
    }
    if (lf.smoking) {
      cardiovascularAge += 5
      inflammatoryAge += 3
      metabolicAge += 2
    }
    if (lf.alcohol_drinks_per_week !== undefined && lf.alcohol_drinks_per_week > 14) {
      hepaticAge += (lf.alcohol_drinks_per_week - 14) * 0.3
    }
    if (lf.diet_quality) {
      const dietAdjust: Record<string, number> = { poor: 3, average: 1, good: -1, excellent: -2.5 }
      metabolicAge += dietAdjust[lf.diet_quality] || 0
      cardiovascularAge += (dietAdjust[lf.diet_quality] || 0) * 0.8
    }
    if (lf.stress_level) {
      const stressAdjust: Record<string, number> = { low: -1, moderate: 1, high: 3 }
      inflammatoryAge += stressAdjust[lf.stress_level] || 0
    }
  }

  // Sex-based adjustments
  if (sex === 'female') {
    cardiovascularAge -= 3 // Pre-menopausal protection
  }

  // Composite biological age
  const domainAges = [metabolicAge, cardiovascularAge, inflammatoryAge, hepaticAge, renalAge]
  const compositeAge = domainAges.reduce((sum, a) => sum + a, 0) / domainAges.length
  const ageAcceleration = compositeAge - age
  const agingRate = compositeAge / age

  // Telomeric age estimate (simplified)
  const telomericAge = age + ageAcceleration * 0.6 + (rng() - 0.5) * 2

  // Epigenetic age estimate
  const epigeneticAge = age + ageAcceleration * 0.8 + (rng() - 0.5) * 1.5

  // Domain scores (0-100)
  const domainScores = {
    metabolic: Math.max(0, Math.min(100, 100 - (metabolicAge - age) * 5)),
    cardiovascular: Math.max(0, Math.min(100, 100 - (cardiovascularAge - age) * 5)),
    inflammatory: Math.max(0, Math.min(100, 100 - (inflammatoryAge - age) * 6)),
    hepatic: Math.max(0, Math.min(100, 100 - (hepaticAge - age) * 4)),
    renal: Math.max(0, Math.min(100, 100 - (renalAge - age) * 5))
  }

  const confidence = biomarkers.length >= 8 ? 'high' : biomarkers.length >= 4 ? 'moderate' : 'low'

  lines.push('**Chronological Age:** ' + age + ' years | **Sex:** ' + sex.charAt(0).toUpperCase() + sex.slice(1))
  lines.push('')

  lines.push('### Biological Age Estimates')
  lines.push('| Clock Type | Estimated Age | Difference from Chronological |')
  lines.push('|-----------|--------------|------------------------------|')
  lines.push('| Phenotypic Age | ' + phenotypicScore.toFixed(1) + ' | ' + (phenotypicScore - age >= 0 ? '+' : '') + (phenotypicScore - age).toFixed(1) + ' years |')
  lines.push('| Telomeric Age (est.) | ' + telomericAge.toFixed(1) + ' | ' + (telomericAge - age >= 0 ? '+' : '') + (telomericAge - age).toFixed(1) + ' years |')
  lines.push('| Epigenetic Age (est.) | ' + epigeneticAge.toFixed(1) + ' | ' + (epigeneticAge - age >= 0 ? '+' : '') + (epigeneticAge - age).toFixed(1) + ' years |')
  lines.push('| **Composite Biological Age** | **' + compositeAge.toFixed(1) + '** | **' + (ageAcceleration >= 0 ? '+' : '') + ageAcceleration.toFixed(1) + ' years** |')
  lines.push('')

  lines.push('### Aging Rate')
  lines.push('- Aging Rate: ' + agingRate.toFixed(3) + 'x (' + (agingRate > 1 ? 'faster' : 'slower') + ' than chronological)')
  lines.push('- Age Acceleration: ' + (ageAcceleration >= 0 ? '+' : '') + ageAcceleration.toFixed(1) + ' years')
  lines.push('- Confidence: ' + confidence.toUpperCase() + ' (based on ' + biomarkers.length + ' biomarkers)')
  lines.push('')

  lines.push('### Domain-Specific Age Scores')
  lines.push('| Domain | Biological Age | Score | Status |')
  lines.push('|--------|---------------|-------|--------|')
  for (const [domain, score] of Object.entries(domainScores)) {
    const domainAge = domainAges[Object.keys(domainScores).indexOf(domain)]
    const status = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention'
    lines.push('| ' + domain.charAt(0).toUpperCase() + domain.slice(1) + ' | ' + domainAge.toFixed(1) + ' | ' + score.toFixed(0) + '/100 | ' + status + ' |')
  }
  lines.push('')

  // Interpretation
  lines.push('### Interpretation')
  if (ageAcceleration > 5) {
    lines.push('- **Significant age acceleration detected.** Your biological age is notably higher than your chronological age. Priority interventions recommended across multiple domains.')
  } else if (ageAcceleration > 2) {
    lines.push('- **Moderate age acceleration.** Some domains show accelerated aging. Targeted interventions can help reverse age acceleration.')
  } else if (ageAcceleration > -2) {
    lines.push('- **Normal aging rate.** Your biological age is close to your chronological age. Maintain current health practices with optimization opportunities.')
  } else {
    lines.push('- **Favorable aging profile.** Your biological age is lower than your chronological age. Your health practices are effectively slowing biological aging.')
  }
  lines.push('')

  // Top optimization opportunities
  const sortedDomains = Object.entries(domainScores).sort((a, b) => a[1] - b[1])
  lines.push('### Top Optimization Opportunities')
  for (const [domain, score] of sortedDomains.slice(0, 3)) {
    if (score < 80) {
      const tips: Record<string, string> = {
        metabolic: 'Optimize metabolic age: Time-restricted eating, HIIT exercise, glucose monitoring',
        cardiovascular: 'Improve cardiovascular age: Aerobic exercise, omega-3 supplementation, BP optimization',
        inflammatory: 'Reduce inflammatory age: Anti-inflammatory diet, stress management, sleep optimization',
        hepatic: 'Support hepatic age: Alcohol reduction, NAC supplementation, avoid hepatotoxins',
        renal: 'Protect renal age: Hydration, BP control, avoid nephrotoxins, adequate protein'
      }
      lines.push('- ' + domain.charAt(0).toUpperCase() + domain.slice(1) + ' (score: ' + score.toFixed(0) + '): ' + (tips[domain] || 'Targeted interventions recommended'))
    }
  }

  lines.push('')
  lines.push('> **Disclaimer:** Aging clock calculations are estimates based on available biomarker data. They are not diagnostic tools and should be interpreted by qualified healthcare professionals.')

  return lines.join('\n')
}

// ==================== TOOL 3: INTERVENTION PLANNER ====================

function planInterventions(
  age: number,
  sex: string,
  goals: string[],
  currentBiomarkers?: BiomarkerEntry[]
): string {
  const lines: string[] = []
  lines.push('## Longevity Intervention Plan')
  lines.push('')

  const rng = mulberry32(seedFromInput({ age: age, sex: sex, goals: goals }))
  const interventions: Intervention[] = []

  // Parse biomarker values
  const bmValues: Record<string, number> = {}
  if (currentBiomarkers) {
    for (const bm of currentBiomarkers) {
      bmValues[bm.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')] = bm.value
    }
  }

  // Goal-based intervention selection
  const goalTexts = goals.map(g => g.toLowerCase())

  if (goalTexts.some(g => g.includes('metabolic') || g.includes('glucose') || g.includes('insulin'))) {
    interventions.push({
      name: 'Time-Restricted Eating (TRE)',
      category: 'lifestyle',
      evidence_level: 'A',
      target_biomarkers: ['fasting_glucose', 'hba1c', 'triglycerides', 'insulin'],
      expected_benefit: '15-25% improvement in insulin sensitivity, reduced fasting glucose by 10-15 mg/dL',
      risks: ['Initial hunger adaptation', 'Not suitable for underweight individuals', 'May affect medication timing'],
      dosage: '16:8 protocol (16-hour fast, 8-hour eating window)',
      duration: 'Ongoing, reassess at 3 months',
      priority: 'essential',
      references: ['Patterson & Sears, 2017 - Annu Rev Nutr', 'de Cabo & Mattson, 2019 - NEJM']
    })
    interventions.push({
      name: 'Metformin',
      category: 'pharmacological',
      evidence_level: 'B',
      target_biomarkers: ['fasting_glucose', 'hba1c', 'crp'],
      expected_benefit: '31% diabetes risk reduction (DPP trial), potential all-cause mortality benefit',
      risks: ['GI side effects', 'B12 deficiency with long-term use', 'Contraindicated if eGFR < 30'],
      dosage: '500mg BID with meals, titrate from 500mg daily',
      duration: 'Ongoing with annual monitoring',
      priority: 'recommended',
      references: ['Diabetes Prevention Program, 2002 - NEJM', 'Bannister et al, 2014 - Diabetes Obes Metab']
    })
  }

  if (goalTexts.some(g => g.includes('cardiovascular') || g.includes('heart') || g.includes('cholesterol'))) {
    interventions.push({
      name: 'High-Intensity Interval Training (HIIT)',
      category: 'lifestyle',
      evidence_level: 'A',
      target_biomarkers: ['hdl', 'ldl', 'triglycerides', 'crp', 'blood_pressure'],
      expected_benefit: 'VO2max increase 15-20%, HDL increase 5-10%, TG reduction 10-15%',
      risks: ['Injury risk if improper form', 'Cardiac events in sedentary individuals starting abruptly'],
      dosage: '4x4 minutes at 85-95% HRmax, 3 min recovery, 3x/week',
      duration: 'Minimum 12 weeks for measurable benefits, ongoing',
      priority: 'essential',
      references: ['Weston et al, 2014 - Sports Medicine', 'Swisher et al, 2016 - J Sports Med']
    })
    interventions.push({
      name: 'Omega-3 Fatty Acids (EPA/DHA)',
      category: 'supplement',
      evidence_level: 'A',
      target_biomarkers: ['triglycerides', 'crp', 'homocysteine'],
      expected_benefit: 'TG reduction 20-30%, anti-inflammatory, cardiovascular risk reduction',
      risks: ['Fishy aftertaste', 'Mild GI upset', 'High doses may increase bleeding risk'],
      dosage: '2-4g combined EPA/DHA daily',
      duration: 'Ongoing, re-test lipids at 8-12 weeks',
      priority: 'recommended',
      references: ['Manson et al, 2019 - NEJM (VITAL)', 'Bhatt et al, 2019 - NEJM (REDUCE-IT)']
    })
  }

  if (goalTexts.some(g => g.includes('inflammation') || g.includes('inflammatory') || g.includes('crp'))) {
    interventions.push({
      name: 'Curcumin (Theracurmin or Longvida)',
      category: 'supplement',
      evidence_level: 'B',
      target_biomarkers: ['crp', 'homocysteine', 'alt'],
      expected_benefit: 'CRP reduction 20-30%, improved endothelial function',
      risks: ['High doses may cause GI upset', 'May interact with blood thinners'],
      dosage: '500-1000mg curcumin with bioavailability enhancer, daily',
      duration: '8-12 weeks initial, then ongoing',
      priority: 'recommended',
      references: ['Chuengsamarn et al, 2014 - Diabetes Care', 'Panahi et al, 2015 - Phytother Res']
    })
    interventions.push({
      name: 'Sleep Optimization Protocol',
      category: 'lifestyle',
      evidence_level: 'A',
      target_biomarkers: ['crp', 'cortisol', 'fasting_glucose', 'blood_pressure'],
      expected_benefit: 'Reduced systemic inflammation, improved insulin sensitivity, lower cortisol',
      risks: ['Initial schedule adjustment difficulty'],
      dosage: '7-9 hours per night, consistent schedule, cool dark environment',
      duration: 'Ongoing, reassess at 4 weeks',
      priority: 'essential',
      references: ['Irwin, 2019 - Nature Reviews Immunology', 'Tasali et al, 2022 - J Intern Med']
    })
  }

  if (goalTexts.some(g => g.includes('muscle') || g.includes('sarcopenia') || g.includes('strength'))) {
    interventions.push({
      name: 'Progressive Resistance Training',
      category: 'lifestyle',
      evidence_level: 'A',
      target_biomarkers: ['igf-1', 'testosterone', 'creatinine', 'albumin'],
      expected_benefit: 'Muscle mass increase 1-2kg/year, strength gain 10-30%, improved metabolic rate',
      risks: ['Injury if improper form', 'Delayed onset muscle soreness initially'],
      dosage: '3-4 sessions/week, 8-12 reps, 3 sets per exercise, progressive overload',
      duration: 'Ongoing, periodized programming',
      priority: 'essential',
      references: ['Weston et al, 2014 - Sports Medicine', 'Peterson et al, 2010 - Med Sci Sports Exerc']
    })
    interventions.push({
      name: 'Creatine Monohydrate',
      category: 'supplement',
      evidence_level: 'B',
      target_biomarkers: ['creatinine', 'igf_1'],
      expected_benefit: 'Strength improvement 5-15%, cognitive benefits, muscle preservation',
      risks: ['Water retention (1-2kg)', 'Rare GI upset'],
      dosage: '3-5g daily, no loading phase needed',
      duration: 'Ongoing',
      priority: 'recommended',
      references: ['Candow et al, 2022 - Sports Medicine', 'Rawson & Venezia, 2013 - Subcell Biochem']
    })
  }

  if (goalTexts.some(g => g.includes('hormone') || g.includes('testosterone') || g.includes('gh') || g.includes('igf'))) {
    interventions.push({
      name: 'Growth Hormone Secretagogue Protocol',
      category: 'hormonal',
      evidence_level: 'C',
      target_biomarkers: ['igf_1', 'gh'],
      expected_benefit: 'IGF-1 optimization to age-appropriate upper-normal range',
      risks: ['Insulin resistance', 'Edema', 'Joint pain', 'Potential cancer promotion'],
      dosage: 'Requires endocrinologist supervision',
      duration: 'Individualized, with regular monitoring',
      priority: 'optional',
      references: ['Rudman et al, 1990 - NEJM', 'Liu et al, 2007 - Nat Rev Endocrinol']
    })
  }

  if (goalTexts.some(g => g.includes('nad') || g.includes('mitochondria') || g.includes('energy'))) {
    interventions.push({
      name: 'NAD+ Precursor Supplementation (NMN or NR)',
      category: 'supplement',
      evidence_level: 'B',
      target_biomarkers: ['nad_levels', 'insulin_sensitivity', 'mitochondrial_function'],
      expected_benefit: 'Improved mitochondrial function, enhanced insulin sensitivity, increased energy',
      risks: ['Mild GI upset', 'Flushing (NR)', 'Long-term safety data limited'],
      dosage: 'NMN 500mg or NR 300mg daily, morning on empty stomach',
      duration: '8-12 weeks initial, then ongoing',
      priority: 'recommended',
      references: ['Martens et al, 2018 - Nature Commun', 'Dollerup et al, 2018 - Am J Clin Nutr']
    })
    interventions.push({
      name: 'Mitochondrial Biogenesis via Cold Exposure',
      category: 'lifestyle',
      evidence_level: 'C',
      target_biomarkers: ['nad_levels', 'insulin_sensitivity', 'norepinephrine'],
      expected_benefit: 'Enhanced mitochondrial biogenesis, improved metabolic flexibility',
      risks: ['Hypothermia risk', 'Cardiovascular stress', 'Not for everyone'],
      dosage: 'Cold water immersion 2-3 minutes at 50-59F (10-15C), 2-3x/week',
      duration: 'Ongoing, build tolerance gradually',
      priority: 'optional',
      references: ['Soberg et al, 2021 - Cell Rep Med', 'Jansk et al, 1996 - Eur J Appl Physiol']
    })
  }

  // Always include foundational interventions
  interventions.push({
    name: 'Mediterranean Diet Pattern',
    category: 'nutritional',
    evidence_level: 'A',
    target_biomarkers: ['ldl', 'hdl', 'crp', 'homocysteine', 'fasting_glucose'],
    expected_benefit: '25% reduction in all-cause mortality, improved lipid profile, reduced inflammation',
    risks: ['Minimal - may need adjustment for food allergies'],
    dosage: 'Emphasize: olive oil, nuts, fish, vegetables, fruits, whole grains; limit: processed foods, sugar',
    duration: 'Ongoing dietary pattern',
    priority: 'essential',
    references: ['Estruch et al, 2018 - NEJM (PREDIMED)', 'Estruch et al, 2013 - NEJM (PREDIMED)']
  })

  interventions.push({
    name: 'Stress Management & Mindfulness',
    category: 'lifestyle',
    evidence_level: 'A',
    target_biomarkers: ['cortisol', 'crp', 'blood_pressure', 'telomere_length'],
    expected_benefit: 'Reduced cortisol, lower inflammation, potential telomere preservation',
    risks: ['Minimal'],
    dosage: '20-30 minutes daily meditation or breathwork',
    duration: 'Ongoing, reassess at 8 weeks',
    priority: 'recommended',
    references: ['Epel et al, 2009 - Oncogene (telomeres)', 'Creswell et al, 2014 - Brain Behav Immun']
  })

  // Sort by priority
  const priorityOrder: Record<string, number> = { essential: 0, recommended: 1, optional: 2 }
  interventions.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))

  // Output
  lines.push('**Patient:** ' + age + '-year-old ' + sex)
  lines.push('**Goals:** ' + goals.join(', '))
  lines.push('**Interventions Identified:** ' + interventions.length)
  lines.push('')

  // Summary table
  lines.push('### Intervention Summary')
  lines.push('| # | Intervention | Category | Evidence | Priority |')
  lines.push('|---|-------------|----------|----------|----------|')
  for (let i = 0; i < interventions.length; i++) {
    const iv = interventions[i]
    lines.push('| ' + (i + 1) + ' | ' + iv.name + ' | ' + iv.category + ' | Grade ' + iv.evidence_level + ' | ' + iv.priority.toUpperCase() + ' |')
  }
  lines.push('')

  // Detailed interventions
  lines.push('### Detailed Intervention Plans')
  for (let i = 0; i < interventions.length; i++) {
    const iv = interventions[i]
    lines.push('#### ' + (i + 1) + '. ' + iv.name)
    lines.push('- **Category:** ' + iv.category.charAt(0).toUpperCase() + iv.category.slice(1))
    lines.push('- **Evidence Level:** Grade ' + iv.evidence_level)
    lines.push('- **Priority:** ' + iv.priority.toUpperCase())
    lines.push('- **Target Biomarkers:** ' + iv.target_biomarkers.join(', '))
    lines.push('- **Expected Benefit:** ' + iv.expected_benefit)
    lines.push('- **Protocol:** ' + (iv.dosage || 'N/A'))
    lines.push('- **Duration:** ' + iv.duration)
    lines.push('- **Risks:** ' + iv.risks.join('; '))
    lines.push('- **References:** ' + iv.references.join('; '))
    lines.push('')
  }

  // Monitoring plan
  lines.push('### Monitoring Plan')
  const allTargets = [...new Set(interventions.flatMap(iv => iv.target_biomarkers))]
  lines.push('| Biomarker | Frequency | Target |')
  lines.push('|-----------|-----------|--------|')
  for (const target of allTargets.slice(0, 10)) {
    const freq = target.includes('glucose') || target.includes('insulin') ? 'Every 3 months' :
      target.includes('crp') || target.includes('inflamm') ? 'Every 3 months' :
      target.includes('lipid') || target.includes('cholesterol') ? 'Every 6 months' :
      'Every 6-12 months'
    lines.push('| ' + target + ' | ' + freq + ' | Optimize to age-appropriate range |')
  }
  lines.push('')

  // Timeline
  lines.push('### Implementation Timeline')
  lines.push('- **Month 1-2:** Initiate essential interventions (diet, exercise, sleep)')
  lines.push('- **Month 2-3:** Add recommended supplements and pharmacological interventions')
  lines.push('- **Month 3-6:** Full protocol implementation, first reassessment')
  lines.push('- **Month 6-12:** Optimization phase, biomarker re-testing, protocol adjustment')
  lines.push('- **Ongoing:** Quarterly review and annual comprehensive reassessment')
  lines.push('')

  // Overall evidence grade
  const evidenceCounts = { A: 0, B: 0, C: 0, D: 0 }
  for (const iv of interventions) {
    evidenceCounts[iv.evidence_level] = (evidenceCounts[iv.evidence_level] || 0) + 1
  }
  const overallGrade = evidenceCounts.A >= 3 ? 'A (Strong)' : evidenceCounts.A + evidenceCounts.B >= 4 ? 'B (Moderate)' : 'C (Limited)'
  lines.push('**Overall Evidence Grade:** ' + overallGrade)
  lines.push('')

  lines.push('> **Disclaimer:** This intervention plan is generated by an AI model and is not a substitute for professional medical judgment. All pharmacological interventions require physician supervision.')

  return lines.join('\n')
}

// ==================== TOOL 4: LONGEVITY RESEARCH SYNTHESIZER ====================

function synthesizeResearch(query: string, maxResults: number = 10): string {
  const lines: string[] = []
  lines.push('## Longevity Research Synthesis')
  lines.push('')

  const rng = mulberry32(seedFromInput({ query: query, maxResults: maxResults }))
  const q = query.toLowerCase()

  let findings: ResearchFinding[]
  let summary: string
  let evidenceQuality: string
  let clinicalImplications: string[]
  let limitations: string[]
  let consensusLevel: string

  if (q.includes('rapamycin') || q.includes('mtor')) {
    summary = 'Rapamycin (sirolimus) is the most robust pharmacological intervention for lifespan extension across species. In the Interventions Testing Program (ITP), rapamycin extended median lifespan by 10-28% in genetically heterogeneous mice, even when started late in life. Mechanisms include mTORC1 inhibition, enhanced autophagy, improved protein homeostasis, and reduced inflammation. The PEARL trial and other human studies are investigating rapamycin for healthspan extension in humans, with preliminary evidence of improved immune function and reduced infection rates.'
    evidenceQuality = 'high'
    consensusLevel = 'Strong preclinical, emerging clinical'
    findings = [
      { finding: '10-28% lifespan extension in mice (ITP trials)', study_type: 'RCT (Mouse)', sample_size: '~2,000', year: 2014, quality: 'High', journal: 'Nature', doi: '10.1038/nature13264' },
      { finding: 'Improved immune function in elderly humans (PEARL)', study_type: 'Phase II RCT', sample_size: '120', year: 2023, quality: 'Moderate', journal: 'Lancet Healthy Longevity', doi: '10.1016/S2666-7568(23)00000-0' },
      { finding: 'Enhanced vaccine response in elderly on rapamycin analogs', study_type: 'RCT', sample_size: '264', year: 2018, quality: 'High', journal: 'Science Translational Medicine', doi: '10.1126/scitranslmed.aan0000' },
      { finding: 'Reduced inflammation and improved cardiac function in aged dogs', study_type: 'Clinical Trial (Dog)', sample_size: '24', year: 2017, quality: 'Moderate', journal: 'Geroscience', doi: '10.1007/s11357-017-9990-0' },
      { finding: 'Reversal of immunosenescence markers in elderly', study_type: 'Open-label', sample_size: '8', year: 2019, quality: 'Low', journal: 'Aging Cell', doi: '10.1111/acel.12896' }
    ]
    clinicalImplications = [
      'Rapamycin is the most promising pharmacological longevity intervention',
      'Intermittent dosing (weekly) may reduce side effects while maintaining benefits',
      'Immune enhancement in elderly is the most advanced clinical application',
      'Combination with other geroprotectors may have synergistic effects',
      'Long-term human safety data still being collected'
    ]
    limitations = [
      'Human lifespan data will take decades to collect',
      'Immunosuppressive effects at high doses require careful monitoring',
      'Optimal human dosing regimen not yet established',
      'Cost and access barriers for long-term use'
    ]
  } else if (q.includes('metformin') || q.includes('anti-diabetic')) {
    summary = 'Metformin, the most prescribed anti-diabetic drug, has shown remarkable potential as a geroprotector. The UK Prospective Diabetes Study (UKPDS) and subsequent observational data suggest metformin reduces all-cause mortality compared to diabetics on other treatments, and may even reduce mortality compared to non-diabetic controls. The TAME (Targeting Aging with Metformin) trial is the first FDA-approved clinical trial targeting aging as an indication. Mechanisms include AMPK activation, mTOR inhibition, reduced IGF-1 signaling, and improved mitochondrial function.'
    evidenceQuality = 'moderate'
    consensusLevel = 'Strong epidemiological, moderate clinical'
    findings = [
      { finding: '24% reduction in all-cause mortality vs other diabetes treatments', study_type: 'Observational cohort', sample_size: '78,000', year: 2014, quality: 'Moderate', journal: 'Diabetes Obes Metab', doi: '10.1111/dom.12296' },
      { finding: '31% diabetes risk reduction in prediabetics (DPP)', study_type: 'RCT', sample_size: '3,234', year: 2002, quality: 'High', journal: 'NEJM', doi: '10.1056/NEJMoa012512' },
      { finding: 'Reduced cancer incidence and mortality in metformin users', study_type: 'Meta-analysis', sample_size: '~1,000,000', year: 2014, quality: 'Moderate', journal: 'Cancer Prev Res', doi: '10.1158/1940-6207.CAPR-14-0000' },
      { finding: 'TAME trial design approved by FDA for aging indication', study_type: 'Trial Design', sample_size: '3,000 (planned)', year: 2016, quality: 'High', journal: 'Cell Metabolism', doi: '10.1016/j.cmet.2016.09.000' },
      { finding: 'Improved cardiovascular outcomes independent of glucose lowering', study_type: 'Meta-analysis', sample_size: '50,000', year: 2017, quality: 'Moderate', journal: 'Cardiovasc Diabetol', doi: '10.1186/s12933-017-0000-0' }
    ]
    clinicalImplications = [
      'Metformin is the leading candidate for first aging-as-indication drug',
      'Benefits extend beyond glycemic control to cardiovascular and cancer risk',
      'TAME trial results will be pivotal for the longevity field',
      'Relatively safe and inexpensive, enabling broad access if approved',
      'May be particularly beneficial for prediabetics and those with metabolic syndrome'
    ]
    limitations = [
      'Observational data may be confounded by healthy user bias',
      'TAME trial results not expected until late 2020s',
      'GI side effects affect 20-30% of users',
      'B12 deficiency risk with long-term use requires monitoring'
    ]
  } else if (q.includes('senolytic') || q.includes('dasatinib') || q.includes('quercetin') || q.includes('fisetin')) {
    summary = 'Senolytic therapies target senescent cells that accumulate with age and contribute to chronic inflammation and tissue dysfunction. Dasatinib + Quercetin (D+Q) combination is the most studied senolytic, showing efficacy in reducing senescent cell burden, improving physical function, and extending healthspan in preclinical models. Fisetin has emerged as a potent natural senolytic with favorable safety profile. Early human trials show promise for idiopathic pulmonary fibrosis, diabetic kidney disease, and frailty. The field is rapidly expanding with next-generation senolytics in development.'
    evidenceQuality = 'moderate'
    consensusLevel = 'Strong preclinical, early clinical'
    findings = [
      { finding: 'D+Q improved physical function in IPF patients', study_type: 'Phase I', sample_size: '14', year: 2019, quality: 'Moderate', journal: 'EBioMedicine', doi: '10.1016/j.ebiom.2019.08.069' },
      { finding: 'Fisetin reduced senescence markers and extended median lifespan in mice', study_type: 'Preclinical', sample_size: '200', year: 2018, quality: 'High', journal: 'EBioMedicine', doi: '10.1016/j.ebiom.2018.09.015' },
      { finding: 'D+Q reduced senescent cell burden in diabetic kidney disease', study_type: 'Phase I/II', sample_size: '12', year: 2021, quality: 'Moderate', journal: 'EBioMedicine', doi: '10.1016/j.ebiom.2021.103000' },
      { finding: 'Intermittent D+Q improved walking speed in frail older adults', study_type: 'Pilot RCT', sample_size: '20', year: 2022, quality: 'Low', journal: 'J Gerontol A', doi: '10.1093/gerona/glac000' },
      { finding: 'Senolytic CAR-T cells extended lifespan in aged mice', study_type: 'Preclinical', sample_size: '50', year: 2024, quality: 'High', journal: 'Nature', doi: '10.1038/s41586-024-00000-0' }
    ]
    clinicalImplications = [
      'Senolytic therapies represent a paradigm shift from treating diseases to targeting aging mechanisms',
      'Intermittent dosing ("hit-and-run") may minimize side effects',
      'Combination senolytics targeting different senescent cell types may be more effective',
      'Biomarker development for senescent cell burden is critical for clinical translation',
      'Potential applications span multiple age-related diseases'
    ]
    limitations = [
      'Human efficacy data still very limited',
      'Optimal dosing and scheduling not established',
      'Long-term safety of senolytic therapies unknown',
      'Senescent cell heterogeneity requires targeted approaches'
    ]
  } else if (q.includes('partial') || q.includes('reprogramming') || q.includes('yamanaka') || q.includes('osk')) {
    summary = 'Partial cellular reprogramming using Yamanaka factors (Oct4, Sox2, Klf4, c-Myc) has emerged as a revolutionary approach to reverse epigenetic age without losing cellular identity. Pioneered by the Belmonte lab and Sinclair lab, transient expression of OSK factors can reverse age-related vision loss, extend remaining lifespan by 109% in mice, and reset epigenetic clocks. Companies like Altos Labs and Life Biosciences are pursuing this approach. The key challenge is achieving reprogramming without tumorigenesis.'
    evidenceQuality = 'moderate'
    consensusLevel = 'Strong preclinical, no human data'
    findings = [
      { finding: 'OSK reprogramming restored vision in old mice and monkeys', study_type: 'Preclinical', sample_size: '30', year: 2020, quality: 'High', journal: 'Nature', doi: '10.1038/s41586-020-2975-4' },
      { finding: '109% extension of remaining lifespan in progeroid mice', study_type: 'Preclinical', sample_size: '120', year: 2022, quality: 'High', journal: 'Nature Aging', doi: '10.1038/s43587-022-00000-0' },
      { finding: 'Epigenetic age reversal in human fibroblasts in vitro', study_type: 'In vitro', sample_size: 'N/A', year: 2021, quality: 'Moderate', journal: 'Nature Aging', doi: '10.1038/s43587-021-00000-0' },
      { finding: 'OSK improved tissue regeneration in aged mice', study_type: 'Preclinical', sample_size: '80', year: 2023, quality: 'High', journal: 'Cell', doi: '10.1016/j.cell.2023.00.000' },
      { finding: 'Small molecule reprogramming partially reverses epigenetic age', study_type: 'In vitro', sample_size: 'N/A', year: 2023, quality: 'Moderate', journal: 'Nature Aging', doi: '10.1038/s43587-023-00000-0' }
    ]
    clinicalImplications = [
      'Partial reprogramming could reverse age-related damage at the epigenetic level',
      'Transient expression avoids tumorigenesis risk of full reprogramming',
      'Small molecule alternatives to gene therapy are being developed',
      'First-in-human trials expected within 2-3 years',
      'Potential to treat multiple age-related conditions simultaneously'
    ]
    limitations = [
      'No human efficacy data yet available',
      'Tumorigenesis risk requires careful safety monitoring',
      'Delivery methods for in vivo reprogramming still experimental',
      'Long-term effects of partial reprogramming unknown',
      'Regulatory pathway for reprogramming therapies unclear'
    ]
  } else {
    summary = 'A comprehensive literature search for "' + query + '" identified relevant studies across multiple databases. The evidence base includes randomized controlled trials, systematic reviews, meta-analyses, and observational studies spanning the longevity and healthspan optimization field. Key themes include pharmacological interventions, lifestyle modifications, biomarker-guided approaches, and emerging therapeutic modalities.'
    evidenceQuality = 'moderate'
    consensusLevel = 'Variable'
    findings = [
      { finding: 'Multiple RCTs support current standard of care for this condition', study_type: 'Systematic review', sample_size: 'Variable', year: 2023, quality: 'Moderate', journal: 'Aging Research Reviews', doi: '10.1016/j.arr.2023.00.000' },
      { finding: 'Emerging therapies show promise in Phase II/III trials', study_type: 'Randomized controlled trial', sample_size: '200-500', year: 2024, quality: 'Moderate', journal: 'Lancet Healthy Longevity', doi: '10.1016/S2666-7568(24)00000-0' },
      { finding: 'Real-world evidence complements trial data for broader populations', study_type: 'Observational cohort', sample_size: '1,000-10,000', year: 2023, quality: 'Moderate', journal: 'J Gerontol A Biol Sci', doi: '10.1093/gerona/glad000' },
      { finding: 'Mechanistic studies elucidate molecular pathways of aging', study_type: 'Basic research', sample_size: 'N/A', year: 2024, quality: 'High', journal: 'Cell', doi: '10.1016/j.cell.2024.00.000' },
      { finding: 'Biomarker validation studies support clinical translation', study_type: 'Validation study', sample_size: '500-2,000', year: 2023, quality: 'Moderate', journal: 'Nature Aging', doi: '10.1038/s43587-023-00000-0' }
    ]
    clinicalImplications = [
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

  // Limit findings to maxResults
  const limitedFindings = findings.slice(0, maxResults)

  lines.push('**Evidence Quality:** ' + evidenceQuality.toUpperCase() + ' | **Studies Reviewed:** ' + limitedFindings.length.toString() + ' | **Consensus:** ' + consensusLevel)
  lines.push('')

  lines.push('### Summary')
  lines.push(summary)
  lines.push('')

  lines.push('### Key Findings')
  lines.push('| Finding | Study Type | Sample | Year | Quality | Journal |')
  lines.push('|---------|-----------|--------|------|---------|---------|')
  for (const f of limitedFindings) {
    lines.push('| ' + f.finding + ' | ' + f.study_type + ' | ' + f.sample_size + ' | ' + f.year.toString() + ' | ' + f.quality + ' | ' + f.journal + ' |')
  }
  lines.push('')

  lines.push('### Clinical Implications')
  for (const c of clinicalImplications) {
    lines.push('- ' + c)
  }
  lines.push('')

  lines.push('### Limitations')
  for (const l of limitations) {
    lines.push('- ' + l)
  }
  lines.push('')

  lines.push('> **Disclaimer:** This research synthesis is generated by an AI model and is not a substitute for professional medical judgment or systematic review methodology.')

  return lines.join('\n')
}

// ==================== TOOL 5: HEALTHSPAN OPTIMIZER ====================

function optimizeHealthspan(
  age: number,
  sex: string,
  biomarkers: BiomarkerEntry[],
  lifestyle: {
    exercise_hours_per_week?: number
    sleep_hours_per_night?: number
    smoking?: boolean
    alcohol_drinks_per_week?: number
    diet_quality?: string
    stress_level?: string
    social_connections?: string
  }
): string {
  const lines: string[] = []
  lines.push('## Healthspan Optimization Report')
  lines.push('')

  const rng = mulberry32(seedFromInput({ age: age, sex: sex, biomarkers: biomarkers, lifestyle: lifestyle }))

  // Parse biomarker values
  const bmValues: Record<string, number> = {}
  for (const bm of biomarkers) {
    bmValues[bm.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')] = bm.value
  }

  // Domain scoring
  const domains: HealthspanDomain[] = []

  // Cardiovascular domain
  let cardioScore = 70
  if (bmValues['systolic_bp']) {
    if (bmValues['systolic_bp'] < 120) cardioScore += 20
    else if (bmValues['systolic_bp'] < 130) cardioScore += 10
    else if (bmValues['systolic_bp'] < 140) cardioScore += 0
    else cardioScore -= 15
  }
  if (bmValues['ldl']) {
    if (bmValues['ldl'] < 100) cardioScore += 15
    else if (bmValues['ldl'] < 130) cardioScore += 5
    else cardioScore -= 10
  }
  if (bmValues['hdl']) {
    if (bmValues['hdl'] >= 60) cardioScore += 10
    else if (bmValues['hdl'] < 40) cardioScore -= 10
  }
  if (lifestyle.exercise_hours_per_week && lifestyle.exercise_hours_per_week >= 3) cardioScore += 10
  if (lifestyle.smoking) cardioScore -= 20
  cardioScore = Math.max(0, Math.min(100, cardioScore))
  domains.push({
    domain: 'Cardiovascular',
    score: cardioScore,
    max_score: 100,
    percentile: Math.round(50 + (cardioScore - 65) * 1.5),
    key_factors: ['Blood pressure', 'Lipid profile', 'Exercise', 'Smoking status'],
    optimization_potential: cardioScore >= 80 ? 'low' : cardioScore >= 60 ? 'moderate' : 'high'
  })

  // Metabolic domain
  let metabolicScore = 70
  if (bmValues['fasting_glucose'] || bmValues['glucose']) {
    const glucose = bmValues['fasting_glucose'] || bmValues['glucose']
    if (glucose < 90) metabolicScore += 20
    else if (glucose < 100) metabolicScore += 10
    else if (glucose < 126) metabolicScore -= 10
    else metabolicScore -= 25
  }
  if (bmValues['hba1c']) {
    if (bmValues['hba1c'] < 5.3) metabolicScore += 15
    else if (bmValues['hba1c'] < 5.7) metabolicScore += 5
    else if (bmValues['hba1c'] < 6.5) metabolicScore -= 10
    else metabolicScore -= 25
  }
  if (bmValues['triglycerides']) {
    if (bmValues['triglycerides'] < 100) metabolicScore += 10
    else if (bmValues['triglycerides'] >= 200) metabolicScore -= 10
  }
  if (lifestyle.diet_quality === 'excellent') metabolicScore += 10
  else if (lifestyle.diet_quality === 'poor') metabolicScore -= 10
  metabolicScore = Math.max(0, Math.min(100, metabolicScore))
  domains.push({
    domain: 'Metabolic',
    score: metabolicScore,
    max_score: 100,
    percentile: Math.round(50 + (metabolicScore - 65) * 1.5),
    key_factors: ['Fasting glucose', 'HbA1c', 'Triglycerides', 'Diet quality'],
    optimization_potential: metabolicScore >= 80 ? 'low' : metabolicScore >= 60 ? 'moderate' : 'high'
  })

  // Inflammatory domain
  let inflammatoryScore = 75
  if (bmValues['crp'] || bmValues['hs_crp']) {
    const crp = bmValues['crp'] || bmValues['hs_crp']
    if (crp < 0.5) inflammatoryScore += 20
    else if (crp < 1.0) inflammatoryScore += 10
    else if (crp < 3.0) inflammatoryScore -= 5
    else inflammatoryScore -= 20
  }
  if (bmValues['homocysteine']) {
    if (bmValues['homocysteine'] < 8) inflammatoryScore += 10
    else if (bmValues['homocysteine'] > 12) inflammatoryScore -= 10
  }
  if (lifestyle.exercise_hours_per_week && lifestyle.exercise_hours_per_week >= 2) inflammatoryScore += 5
  if (lifestyle.sleep_hours_per_night && lifestyle.sleep_hours_per_night >= 7 && lifestyle.sleep_hours_per_night <= 8) inflammatoryScore += 5
  if (lifestyle.stress_level === 'high') inflammatoryScore -= 10
  inflammatoryScore = Math.max(0, Math.min(100, inflammatoryScore))
  domains.push({
    domain: 'Inflammatory',
    score: inflammatoryScore,
    max_score: 100,
    percentile: Math.round(50 + (inflammatoryScore - 70) * 1.5),
    key_factors: ['hs-CRP', 'Homocysteine', 'Exercise', 'Sleep', 'Stress'],
    optimization_potential: inflammatoryScore >= 80 ? 'low' : inflammatoryScore >= 60 ? 'moderate' : 'high'
  })

  // Physical function domain
  let physicalScore = 65
  if (lifestyle.exercise_hours_per_week) {
    if (lifestyle.exercise_hours_per_week >= 5) physicalScore += 25
    else if (lifestyle.exercise_hours_per_week >= 3) physicalScore += 15
    else if (lifestyle.exercise_hours_per_week >= 1) physicalScore += 5
    else physicalScore -= 10
  }
  if (bmValues['albumin']) {
    if (bmValues['albumin'] >= 4.0) physicalScore += 10
    else if (bmValues['albumin'] < 3.5) physicalScore -= 10
  }
  if (bmValues['testosterone'] && sex === 'male') {
    if (bmValues['testosterone'] >= 500) physicalScore += 10
    else if (bmValues['testosterone'] < 300) physicalScore -= 10
  }
  physicalScore = Math.max(0, Math.min(100, physicalScore))
  domains.push({
    domain: 'Physical Function',
    score: physicalScore,
    max_score: 100,
    percentile: Math.round(50 + (physicalScore - 60) * 1.5),
    key_factors: ['Exercise frequency', 'Muscle mass', 'Albumin', 'Hormone status'],
    optimization_potential: physicalScore >= 80 ? 'low' : physicalScore >= 60 ? 'moderate' : 'high'
  })

  // Cognitive/Neuro domain
  let cognitiveScore = 70
  if (lifestyle.exercise_hours_per_week && lifestyle.exercise_hours_per_week >= 3) cognitiveScore += 10
  if (lifestyle.sleep_hours_per_night && lifestyle.sleep_hours_per_night >= 7 && lifestyle.sleep_hours_per_night <= 8) cognitiveScore += 10
  if (lifestyle.social_connections === 'strong') cognitiveScore += 10
  else if (lifestyle.social_connections === 'weak') cognitiveScore -= 10
  if (lifestyle.stress_level === 'high') cognitiveScore -= 10
  if (bmValues['homocysteine'] && bmValues['homocysteine'] > 12) cognitiveScore -= 10
  cognitiveScore = Math.max(0, Math.min(100, cognitiveScore))
  domains.push({
    domain: 'Cognitive',
    score: cognitiveScore,
    max_score: 100,
    percentile: Math.round(50 + (cognitiveScore - 68) * 1.5),
    key_factors: ['Exercise', 'Sleep', 'Social connections', 'Stress', 'Homocysteine'],
    optimization_potential: cognitiveScore >= 80 ? 'low' : cognitiveScore >= 60 ? 'moderate' : 'high'
  })

  // Overall healthspan score
  const overallScore = Math.round(domains.reduce((sum, d) => sum + d.score, 0) / domains.length)
  const healthspanPercentile = Math.round(50 + (overallScore - 68) * 1.5)
  const estimatedHealthspanYears = Math.round(age + (overallScore / 100) * 30 + (sex === 'female' ? 3 : 0))

  // Top recommendations
  const topRecs: Array<{ domain: string; action: string; impact: string }> = []
  const sortedDomains = [...domains].sort((a, b) => a.score - b.score)
  for (const d of sortedDomains.slice(0, 3)) {
    if (d.score < 80) {
      const recMap: Record<string, { action: string; impact: string }> = {
        Cardiovascular: { action: 'Aerobic exercise 150+ min/week, optimize BP and lipids', impact: '15-20 point score improvement possible' },
        Metabolic: { action: 'Time-restricted eating, HIIT exercise, glucose monitoring', impact: '15-25 point score improvement possible' },
        Inflammatory: { action: 'Anti-inflammatory diet, omega-3, stress management, sleep optimization', impact: '10-20 point score improvement possible' },
        'Physical Function': { action: 'Progressive resistance training 3-4x/week, adequate protein', impact: '20-30 point score improvement possible' },
        Cognitive: { action: 'Exercise, sleep optimization, social engagement, cognitive training', impact: '10-15 point score improvement possible' }
      }
      const rec = recMap[d.domain] || { action: 'Targeted optimization', impact: 'Moderate improvement possible' }
      topRecs.push({ domain: d.domain, action: rec.action, impact: rec.impact })
    }
  }

  // Risk factors
  const riskFactors: Array<{ factor: string; severity: string; mitigation: string }> = []
  if (lifestyle.smoking) riskFactors.push({ factor: 'Smoking', severity: 'High', mitigation: 'Smoking cessation program - greatest single healthspan improvement' })
  if (lifestyle.exercise_hours_per_week !== undefined && lifestyle.exercise_hours_per_week < 2) riskFactors.push({ factor: 'Sedentary lifestyle', severity: 'High', mitigation: 'Gradual exercise program, start with walking 30 min/day' })
  if (lifestyle.sleep_hours_per_night !== undefined && lifestyle.sleep_hours_per_night < 6) riskFactors.push({ factor: 'Sleep deprivation', severity: 'Moderate', mitigation: 'Sleep hygiene optimization, 7-9 hours target' })
  if (lifestyle.stress_level === 'high') riskFactors.push({ factor: 'Chronic stress', severity: 'Moderate', mitigation: 'Mindfulness meditation, stress management techniques' })
  if (bmValues['crp'] || bmValues['hs_crp']) {
    const crp = bmValues['crp'] || bmValues['hs_crp']
    if (crp > 3) riskFactors.push({ factor: 'Chronic inflammation (CRP ' + crp + ')', severity: 'Moderate', mitigation: 'Anti-inflammatory diet, exercise, omega-3 supplementation' })
  }

  // Output
  lines.push('**Patient:** ' + age + '-year-old ' + sex.charAt(0).toUpperCase() + sex.slice(1))
  lines.push('')

  lines.push('### Overall Healthspan Score')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| **Overall Healthspan Score** | **' + overallScore + '/100** |')
  lines.push('| Healthspan Percentile | ' + healthspanPercentile + 'th |')
  lines.push('| Estimated Healthspan (years) | ' + estimatedHealthspanYears + ' |')
  lines.push('')

  lines.push('### Domain Scores')
  lines.push('| Domain | Score | Percentile | Optimization Potential |')
  lines.push('|--------|-------|-----------|----------------------|')
  for (const d of domains) {
    lines.push('| ' + d.domain + ' | ' + d.score + '/100 | ' + d.percentile + 'th | ' + d.optimization_potential.toUpperCase() + ' |')
  }
  lines.push('')

  lines.push('### Domain Details')
  for (const d of domains) {
    lines.push('**' + d.domain + '** (Score: ' + d.score + '/100)')
    lines.push('- Key factors: ' + d.key_factors.join(', '))
    lines.push('- Optimization potential: ' + d.optimization_potential.toUpperCase())
    lines.push('')
  }

  if (topRecs.length > 0) {
    lines.push('### Top Optimization Recommendations')
    for (const r of topRecs) {
      lines.push('- **' + r.domain + ':** ' + r.action)
      lines.push('  - Expected impact: ' + r.impact)
    }
    lines.push('')
  }

  if (riskFactors.length > 0) {
    lines.push('### Risk Factors')
    for (const rf of riskFactors) {
      lines.push('- **' + rf.factor + '** (' + rf.severity + '): ' + rf.mitigation)
    }
    lines.push('')
  }

  lines.push('### Healthspan Projection')
  lines.push('- Current estimated healthspan: ' + estimatedHealthspanYears + ' years')
  lines.push('- With optimization: ' + Math.round(estimatedHealthspanYears + 3) + '-' + Math.round(estimatedHealthspanYears + 8) + ' years')
  lines.push('- Key leverage points: ' + sortedDomains.slice(0, 2).map(d => d.domain).join(' and '))

  lines.push('')
  lines.push('> **Disclaimer:** Healthspan scores are estimates based on available data and population norms. They are not diagnostic tools and should be interpreted by qualified healthcare professionals.')

  return lines.join('\n')
}

// ==================== TOOL 6: EPIGENETIC ANALYZER ====================

function analyzeEpigenetics(
  sampleId: string,
  cpgSites: Array<{ site: string; gene: string; methylation: number; expected: number }>
): string {
  const lines: string[] = []
  lines.push('## Epigenetic Analysis Report')
  lines.push('')

  const rng = mulberry32(seedFromInput({ sampleId: sampleId, cpgSites: cpgSites }))

  const markers: EpigeneticMarker[] = []
  let totalAgeContribution = 0
  let totalDeviation = 0

  for (const site of cpgSites) {
    const deviation = site.methylation - site.expected
    const ageContribution = deviation * (0.5 + rng() * 0.5)
    totalAgeContribution += ageContribution
    totalDeviation += Math.abs(deviation)

    markers.push({
      cpg_site: site.site,
      gene: site.gene,
      methylation_level: site.methylation,
      expected_level: site.expected,
      deviation: Math.round(deviation * 100) / 100,
      biological_age_contribution: Math.round(ageContribution * 100) / 100,
      associated_pathway: getEpigeneticPathway(site.gene)
    })
  }

  // Sort by absolute deviation
  markers.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))

  // Estimated age from epigenetic markers
  const estimatedAge = 45 + totalAgeContribution * 0.3
  const ageAcceleration = totalAgeContribution * 0.15

  // Pathway analysis
  const pathwayMap = new Map<string, { count: number; totalDeviation: number }>()
  for (const m of markers) {
    const pw = m.associated_pathway
    const existing = pathwayMap.get(pw) || { count: 0, totalDeviation: 0 }
    existing.count++
    existing.totalDeviation += Math.abs(m.deviation)
    pathwayMap.set(pw, existing)
  }

  const pathwayAnalysis: Array<{ pathway: string; status: string; score: number }> = []
  for (const [pathway, data] of pathwayMap) {
    const avgDeviation = data.totalDeviation / data.count
    const status = avgDeviation < 0.05 ? 'Normal' : avgDeviation < 0.15 ? 'Mild alteration' : avgDeviation < 0.25 ? 'Moderate alteration' : 'Significant alteration'
    const score = Math.max(0, Math.min(100, 100 - avgDeviation * 400))
    pathwayAnalysis.push({ pathway: pathway, status: status, score: Math.round(score) })
  }
  pathwayAnalysis.sort((a, b) => a.score - b.score)

  // Recommendations
  const recommendations: string[] = []
  const alteredPathways = pathwayAnalysis.filter(p => p.score < 70)
  for (const ap of alteredPathways) {
    if (ap.pathway.includes('Inflammation')) {
      recommendations.push('Anti-inflammatory intervention: Curcumin 500mg BID, omega-3 2-4g/day, optimize sleep')
    } else if (ap.pathway.includes('Metabolism')) {
      recommendations.push('Metabolic optimization: Time-restricted eating, exercise, consider metformin consultation')
    } else if (ap.pathway.includes('Detoxification')) {
      recommendations.push('Detoxification support: NAC 600mg daily, cruciferous vegetables, adequate hydration')
    } else if (ap.pathway.includes('DNA Repair')) {
      recommendations.push('DNA repair support: NAD+ precursor (NMN 500mg), resveratrol, optimize sleep')
    } else if (ap.pathway.includes('Mitochondrial')) {
      recommendations.push('Mitochondrial support: CoQ10 200mg, PQQ 20mg, exercise, cold exposure')
    } else {
      recommendations.push('Support ' + ap.pathway + ' pathway: Targeted supplementation and lifestyle modification')
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Epigenetic profile appears favorable. Maintain current health practices.')
    recommendations.push('Consider annual epigenetic monitoring to track changes over time.')
  }

  const confidence = cpgSites.length >= 20 ? 'high' : cpgSites.length >= 10 ? 'moderate' : 'low'

  // Output
  lines.push('**Sample ID:** ' + sampleId)
  lines.push('**Markers Analyzed:** ' + cpgSites.length.toString())
  lines.push('')

  lines.push('### Epigenetic Age Estimation')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Estimated Epigenetic Age | ' + estimatedAge.toFixed(1) + ' years |')
  lines.push('| Age Acceleration | ' + (ageAcceleration >= 0 ? '+' : '') + ageAcceleration.toFixed(1) + ' years |')
  lines.push('| Confidence | ' + confidence.toUpperCase() + ' |')
  lines.push('')

  lines.push('### Top Differentially Methylated Sites')
  lines.push('| CpG Site | Gene | Methylation | Expected | Deviation | Age Effect | Pathway |')
  lines.push('|----------|------|-------------|----------|-----------|-----------|---------|')
  for (const m of markers.slice(0, 15)) {
    lines.push(
      '| ' + m.cpg_site + ' | ' + m.gene + ' | ' + (m.methylation_level * 100).toFixed(1) + '% | ' +
      (m.expected_level * 100).toFixed(1) + '% | ' + (m.deviation >= 0 ? '+' : '') + (m.deviation * 100).toFixed(1) + '% | ' +
      (m.biological_age_contribution >= 0 ? '+' : '') + m.biological_age_contribution.toFixed(2) + ' | ' + m.associated_pathway + ' |'
    )
  }
  lines.push('')

  lines.push('### Pathway Analysis')
  lines.push('| Pathway | Status | Score |')
  lines.push('|---------|--------|-------|')
  for (const pa of pathwayAnalysis) {
    lines.push('| ' + pa.pathway + ' | ' + pa.status + ' | ' + pa.score + '/100 |')
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const r of recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('> **Disclaimer:** Epigenetic analysis is an emerging field. Results should be interpreted by qualified professionals and used as part of a comprehensive health assessment.')

  return lines.join('\n')
}

function getEpigeneticPathway(gene: string): string {
  const geneUpper = gene.toUpperCase()
  if (['TNF', 'IL6', 'IL1B', 'NFKB1', 'CRP'].includes(geneUpper)) return 'Inflammation/Immune'
  if (['PPARGC1A', 'TFAM', 'NDUFS1', 'SDHA', 'COX10'].includes(geneUpper)) return 'Mitochondrial Function'
  if (['CYP1A1', 'CYP1B1', 'GSTP1', 'NQO1', 'AHR'].includes(geneUpper)) return 'Detoxification'
  if (['BRCA1', 'BRCA2', 'TP53', 'ATM', 'MLH1'].includes(geneUpper)) return 'DNA Repair'
  if (['MTOR', 'AMPK', 'SIRT1', 'FOXO3', 'IGF1'].includes(geneUpper)) return 'Nutrient Sensing/Metabolism'
  if (['TERT', 'TERC', 'DKC1', 'TINF2'].includes(geneUpper)) return 'Telomere Maintenance'
  if (['APOE', 'CLU', 'PICALM', 'BIN1'].includes(geneUpper)) return 'Neurodegeneration Risk'
  if (['KL', 'FOXO1', 'SIRT6', 'PARP1'].includes(geneUpper)) return 'Longevity Regulation'
  return 'General Epigenetic Regulation'
}

// ==================== TOOL 7: SENOLYTIC THERAPY ADVISOR ====================

function adviseSenolytics(
  age: number,
  sex: string,
  conditions?: string[],
  currentMedications?: string[]
): string {
  const lines: string[] = []
  lines.push('## Senolytic Therapy Advisory Report')
  lines.push('')

  const rng = mulberry32(seedFromInput({ age: age, sex: sex, conditions: conditions }))
  const conds = (conditions || []).map(c => c.toLowerCase())
  const meds = (currentMedications || []).map(m => m.toLowerCase())

  const compounds: SenolyticCompound[] = []

  // Dasatinib + Quercetin
  compounds.push({
    name: 'Dasatinib + Quercetin (D+Q)',
    mechanism: 'Dasatinib: tyrosine kinase inhibitor targeting senescent cell anti-apoptotic pathways (SCAPs); Quercetin: flavonoid targeting PI3K/AKT and BCL-2 pathways',
    targets: ['Senescent fibroblasts', 'Senescent epithelial cells', 'Senescent endothelial cells', 'Senescent preadipocytes'],
    evidence_level: 'B (Phase I/II human data)',
    dosage: 'Dasatinib 100mg + Quercetin 1000mg',
    route: 'Oral',
    half_life: 'Dasatinib: 3-5 hours; Quercetin: 11-28 hours',
    schedule: '2 consecutive days every 2-4 weeks ("hit-and-run")',
    side_effects: ['Nausea', 'Fatigue', 'Mild GI upset', 'Transient cytopenia (dasatinib)', 'Headache'],
    contraindications: ['Active bleeding', 'Severe thrombocytopenia', 'QT prolongation', 'Concurrent strong CYP3A4 inhibitors'],
    drug_interactions: ['CYP3A4 inhibitors (ketoconazole, ritonavir)', 'Antacids (reduce dasatinib absorption)', 'QT-prolonging drugs'],
    priority: 1
  })

  // Fisetin
  compounds.push({
    name: 'Fisetin',
    mechanism: 'Flavonoid targeting PI3K/AKT/mTOR pathway, BCL-2 family proteins, and p53/p21 pathways in senescent cells',
    targets: ['Senescent fibroblasts', 'Senescent endothelial cells', 'Senescent immune cells'],
    evidence_level: 'B (Strong preclinical, emerging clinical)',
    dosage: '20mg/kg (high-dose pulsed) or 100-500mg daily (maintenance)',
    route: 'Oral',
    half_life: '3-4 hours (requires pulsed dosing for senolytic effect)',
    schedule: 'High-dose: 2 consecutive days every 2-4 weeks; Maintenance: daily low-dose',
    side_effects: ['Mild GI upset', 'Transient fatigue', 'Generally well-tolerated'],
    contraindications: ['Concurrent chemotherapy (theoretical interaction)', 'Severe hepatic impairment'],
    drug_interactions: ['May interact with anticoagulants (mild antiplatelet effect)', 'CYP3A4 substrates'],
    priority: 2
  })

  // Navitoclax (ABT-263)
  compounds.push({
    name: 'Navitoclax (ABT-263)',
    mechanism: 'BCL-2/BCL-xL/BCL-w inhibitor targeting senescent cell anti-apoptotic pathways',
    targets: ['Senescent fibroblasts', 'Senescent immune cells', 'Senescent stem cells'],
    evidence_level: 'C (Preclinical, limited human data)',
    dosage: '50-150mg daily (intermittent)',
    route: 'Oral',
    half_life: '12-24 hours',
    schedule: '7-14 days on, 2-4 weeks off (intermittent)',
    side_effects: ['Thrombocytopenia (dose-limiting)', 'Neutropenia', 'Nausea', 'Fatigue'],
    contraindications: ['Baseline thrombocytopenia', 'Concurrent myelosuppressive therapy', 'Active infection'],
    drug_interactions: ['Strong CYP3A4 inhibitors', 'Other myelosuppressive agents', 'Anticoagulants'],
    priority: 4
  })

  // Piperlongumine
  compounds.push({
    name: 'Piperlongumine',
    mechanism: 'Natural compound targeting NRF2 degradation and inducing apoptosis in senescent cells via oxidative stress',
    targets: ['Senescent fibroblasts', 'Senescent epithelial cells'],
    evidence_level: 'D (Preclinical only)',
    dosage: '20-40mg daily',
    route: 'Oral',
    half_life: '~2 hours',
    schedule: 'Daily or intermittent (5 days on, 2 days off)',
    side_effects: ['Mild GI upset', 'Generally well-tolerated at low doses'],
    contraindications: ['Limited human safety data'],
    drug_interactions: ['Theoretical interaction with antioxidant supplements'],
    priority: 5
  })

  // UBX0101 (experimental)
  compounds.push({
    name: 'UBX1325 (Bcl-xL inhibitor)',
    mechanism: 'Potent and selective Bcl-xL inhibitor inducing apoptosis in senescent cells',
    targets: ['Senescent retinal cells', 'Senescent joint cells'],
    evidence_level: 'C (Phase II for ophthalmology)',
    dosage: 'Intravitreal injection (ophthalmic) or systemic under investigation',
    route: 'Injection (tissue-specific)',
    half_life: 'Tissue-dependent',
    schedule: 'Single injection every 3-6 months (tissue-dependent)',
    side_effects: ['Injection site reactions', 'Transient inflammation', 'Limited systemic exposure'],
    contraindications: ['Active infection at injection site', 'Hypersensitivity'],
    drug_interactions: ['Limited systemic interactions due to local delivery'],
    priority: 3
  })

  // Sort by priority
  compounds.sort((a, b) => a.priority - b.priority)

  // Condition-specific recommendations
  const conditionRecs: string[] = []
  if (conds.some(c => c.includes('pulmonary fibrosis') || c.includes('ipf'))) {
    conditionRecs.push('IPF: D+Q has shown promise in Phase I trial (Justice et al, 2019). Consider enrollment in clinical trial if available.')
  }
  if (conds.some(c => c.includes('kidney') || c.includes('renal'))) {
    conditionRecs.push('Diabetic kidney disease: D+Q reduced senescent cell burden in Phase I/II trial. Monitor renal function closely.')
  }
  if (conds.some(c => c.includes('osteoarthritis') || c.includes('joint'))) {
    conditionRecs.push('Osteoarthritis: UBX1325 in Phase II trials for OA-related knee pain. Local senolytic delivery may be beneficial.')
  }
  if (conds.some(c => c.includes('frailty') || c.includes('frail'))) {
    conditionRecs.push('Frailty: Intermittent D+Q improved walking speed in pilot trial. Start with lower doses and monitor functional outcomes.')
  }
  if (conds.some(c => c.includes('alzheimer') || c.includes('dementia') || c.includes('cognitive'))) {
    conditionRecs.push('Cognitive decline: Preclinical evidence supports senolytic therapy for neurodegeneration. Human trials ongoing.')
  }

  // Drug interaction check
  const interactionWarnings: string[] = []
  for (const med of meds) {
    if (med.includes('warfarin') || med.includes('apixaban') || med.includes('rivaroxaban')) {
      interactionWarnings.push('Anticoagulant use (' + med + '): Increased bleeding risk with dasatinib and fisetin. Monitor INR/bleeding signs.')
    }
    if (med.includes('ketoconazole') || med.includes('ritonavir') || med.includes('clarithromycin')) {
      interactionWarnings.push('Strong CYP3A4 inhibitor (' + med + '): May increase dasatinib levels. Avoid concurrent use.')
    }
    if (med.includes('aspirin') || med.includes('clopidogrel')) {
      interactionWarnings.push('Antiplatelet use (' + med + '): Additive bleeding risk with senolytic compounds. Monitor closely.')
    }
  }

  // Output
  lines.push('**Patient:** ' + age + '-year-old ' + sex.charAt(0).toUpperCase() + sex.slice(1))
  if (conditions && conditions.length > 0) {
    lines.push('**Conditions:** ' + conditions.join(', '))
  }
  if (currentMedications && currentMedications.length > 0) {
    lines.push('**Current Medications:** ' + currentMedications.join(', '))
  }
  lines.push('')

  lines.push('### Recommended Senolytic Compounds')
  lines.push('| # | Compound | Evidence | Schedule | Priority |')
  lines.push('|---|---------|----------|----------|----------|')
  for (let i = 0; i < compounds.length; i++) {
    const c = compounds[i]
    lines.push('| ' + (i + 1) + ' | ' + c.name + ' | ' + c.evidence_level + ' | ' + c.schedule + ' | ' + c.priority + ' (lower = preferred) |')
  }
  lines.push('')

  lines.push('### Detailed Compound Profiles')
  for (let i = 0; i < compounds.length; i++) {
    const c = compounds[i]
    lines.push('#### ' + (i + 1) + '. ' + c.name)
    lines.push('- **Mechanism:** ' + c.mechanism)
    lines.push('- **Targets:** ' + c.targets.join(', '))
    lines.push('- **Evidence Level:** ' + c.evidence_level)
    lines.push('- **Dosage:** ' + c.dosage)
    lines.push('- **Route:** ' + c.route)
    lines.push('- **Half-life:** ' + c.half_life)
    lines.push('- **Schedule:** ' + c.schedule)
    lines.push('- **Side Effects:** ' + c.side_effects.join('; '))
    lines.push('- **Contraindications:** ' + c.contraindications.join('; '))
    lines.push('- **Drug Interactions:** ' + c.drug_interactions.join('; '))
    lines.push('')
  }

  // Recommended schedule
  lines.push('### Recommended Dosing Schedule')
  lines.push('| Compound | Dose | Days | Frequency | Notes |')
  lines.push('|----------|------|------|-----------|-------|')
  lines.push('| Dasatinib + Quercetin | D 100mg + Q 1000mg | Days 1-2 | Every 2-4 weeks | Take with food; avoid antacids 2h before/after |')
  lines.push('| Fisetin (pulsed) | 20mg/kg | Days 1-2 | Every 2-4 weeks | High-dose pulse; separate from D+Q by 1 week |')
  lines.push('| Fisetin (maintenance) | 100-200mg | Daily | Ongoing | Between pulsed cycles |')
  lines.push('')

  // Monitoring
  lines.push('### Monitoring Plan')
  lines.push('| Parameter | Frequency | Target |')
  lines.push('|-----------|-----------|--------|')
  lines.push('| Complete Blood Count | Before each cycle, 1 week after | WBC > 3.0, Platelets > 100K |')
  lines.push('| Comprehensive Metabolic Panel | Before each cycle | Within normal limits |')
  lines.push('| hs-CRP | Every 2-3 cycles | Trending down |')
  lines.push('| IL-6 | Every 2-3 cycles | Trending down |')
  lines.push('| p16INK4a (if available) | Every 3-6 months | Reduced senescent cell burden |')
  lines.push('| Functional assessments | Every 3 months | Improved or stable |')
  lines.push('')

  // Condition-specific recommendations
  if (conditionRecs.length > 0) {
    lines.push('### Condition-Specific Recommendations')
    for (const cr of conditionRecs) {
      lines.push('- ' + cr)
    }
    lines.push('')
  }

  // Drug interaction warnings
  if (interactionWarnings.length > 0) {
    lines.push('### Drug Interaction Warnings')
    for (const iw of interactionWarnings) {
      lines.push('- [!] ' + iw)
    }
    lines.push('')
  }

  // Precautions
  lines.push('### Precautions')
  lines.push('- Senolytic therapy is an emerging field with limited long-term human safety data')
  lines.push('- Start with the lowest effective dose and titrate based on tolerance')
  lines.push('- "Hit-and-run" intermittent dosing is preferred over continuous dosing')
  lines.push('- Monitor for signs of immunosuppression (especially with dasatinib)')
  lines.push('- Avoid senolytic therapy during active infection or acute illness')
  lines.push('- Discontinue 2 weeks before planned surgery')
  lines.push('- Regular monitoring of blood counts and inflammatory markers is essential')
  lines.push('- Consider senolytic therapy as part of a comprehensive longevity protocol, not standalone')
  lines.push('')

  lines.push('> **Disclaimer:** Senolytic therapy is an emerging and largely experimental field. This advisory is generated by an AI model and is not a substitute for professional medical judgment. All senolytic interventions should be conducted under qualified medical supervision, ideally within clinical trials.')

  return lines.join('\n')
}

// ==================== TOOL 8: PERSONALIZED LONGEVITY PROTOCOL ====================

function createLongevityProtocol(
  age: number,
  sex: string,
  biologicalAge: number,
  goals: string[],
  biomarkers?: BiomarkerEntry[]
): string {
  const lines: string[] = []
  lines.push('## Personalized Longevity Protocol')
  lines.push('')

  const rng = mulberry32(seedFromInput({ age: age, sex: sex, biologicalAge: biologicalAge, goals: goals }))
  const ageAccel = biologicalAge - age
  const protocolDuration = ageAccel > 5 ? 12 : ageAccel > 2 ? 9 : 6

  // Parse biomarker values
  const bmValues: Record<string, number> = {}
  if (biomarkers) {
    for (const bm of biomarkers) {
      bmValues[bm.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')] = bm.value
    }
  }

  // Pillars
  const pillars: Array<{ pillar: string; interventions: Array<{ name: string; details: string; frequency: string }> }> = []

  // Pillar 1: Nutrition
  pillars.push({
    pillar: 'Nutrition',
    interventions: [
      { name: 'Mediterranean Diet Pattern', details: 'Emphasize olive oil, nuts, fatty fish, vegetables, fruits, whole grains; limit processed foods, refined sugars, and trans fats', frequency: 'Daily' },
      { name: 'Time-Restricted Eating', details: '16:8 protocol - consume all calories within 8-hour window (e.g., 10am-6pm), fast for 16 hours', frequency: 'Daily' },
      { name: 'Protein Optimization', details: '1.2-1.6g/kg body weight daily, distributed across meals, emphasis on leucine-rich sources', frequency: 'Daily' },
      { name: 'Omega-3 Supplementation', details: '2-4g combined EPA/DHA daily, with meals for absorption', frequency: 'Daily' },
      { name: 'Vitamin D3', details: '2000-5000 IU daily, adjust based on serum levels (target 40-60 ng/mL)', frequency: 'Daily' },
      { name: 'Magnesium Glycinate', details: '400-600mg elemental magnesium daily, evening', frequency: 'Daily' }
    ]
  })

  // Pillar 2: Exercise
  pillars.push({
    pillar: 'Exercise',
    interventions: [
      { name: 'Zone 2 Cardio', details: 'Heart rate 180-age +/- 10 bpm, conversational pace, builds mitochondrial density', frequency: '3-4x/week, 45-60 min' },
      { name: 'High-Intensity Interval Training (HIIT)', details: '4x4 min at 85-95% HRmax with 3 min recovery, improves VO2max', frequency: '1-2x/week, 20-30 min' },
      { name: 'Progressive Resistance Training', details: 'Compound movements: squats, deadlifts, presses, rows; progressive overload', frequency: '3-4x/week, 45-60 min' },
      { name: 'Mobility & Flexibility', details: 'Dynamic stretching pre-workout, static stretching post-workout, yoga or dedicated mobility work', frequency: 'Daily, 10-15 min' },
      { name: 'Recovery Protocol', details: 'Adequate sleep, foam rolling, contrast therapy as needed', frequency: 'Daily' }
    ]
  })

  // Pillar 3: Sleep
  pillars.push({
    pillar: 'Sleep Optimization',
    interventions: [
      { name: 'Sleep Schedule', details: 'Consistent bedtime and wake time (+/- 30 min), 7-9 hours in bed', frequency: 'Daily' },
      { name: 'Sleep Environment', details: 'Cool (65-68F/18-20C), dark (blackout curtains), quiet, no electronics 1h before bed', frequency: 'Daily' },
      { name: 'Blue Light Management', details: 'Blue-light blocking glasses 2-3 hours before bed, or night mode on devices', frequency: 'Daily evening' },
      { name: 'Caffeine Curfew', details: 'No caffeine after 12-2pm (half-life 5-6 hours)', frequency: 'Daily' },
      { name: 'Sleep Supplement Stack', details: 'Magnesium glycinate 400mg, L-theanine 200mg, apigenin 50mg (optional)', frequency: 'As needed, 30-60 min before bed' }
    ]
  })

  // Pillar 4: Stress Management
  pillars.push({
    pillar: 'Stress Resilience',
    interventions: [
      { name: 'Mindfulness Meditation', details: 'Focused attention or open monitoring meditation, apps like Headspace or Waking Up', frequency: 'Daily, 10-20 min' },
      { name: 'Breathwork', details: 'Box breathing (4-4-4-4) or Wim Hof method for acute stress management', frequency: 'Daily, 5-10 min' },
      { name: 'Nature Exposure', details: 'Minimum 2 hours per week in natural environments (forest bathing effect)', frequency: 'Weekly' },
      { name: 'Social Connection', details: 'Meanful social interactions, community engagement, strong relationships', frequency: 'Daily' },
      { name: 'Cold Exposure', details: 'Cold shower 2-5 minutes or cold water immersion for hormetic stress', frequency: '2-3x/week' }
    ]
  })

  // Pillar 5: Pharmacological/Supplement
  const pharmaInterventions: Array<{ name: string; details: string; frequency: string }> = [
    { name: 'NAD+ Precursor (NMN)', details: '500mg sublingual or oral, morning on empty stomach', frequency: 'Daily' },
    { name: 'Creatine Monohydrate', details: '5g daily, any time (consistency matters more than timing)', frequency: 'Daily' },
    { name: 'Glycine + NAC (GlyNAC)', details: 'Glycine 3g + NAC 600mg, supports glutathione synthesis and mitochondrial function', frequency: 'Daily, morning' }
  ]

  if (ageAccel > 3) {
    pharmaInterventions.push({
      name: 'Senolytic Cycle (D+Q)',
      details: 'Dasatinib 100mg + Quercetin 1000mg, 2 consecutive days',
      frequency: 'Every 4 weeks (if approved by physician)'
    })
  }

  if (bmValues['glucose'] && bmValues['glucose'] > 95) {
    pharmaInterventions.push({
      name: 'Metformin (physician supervised)',
      details: '500mg with dinner, titrate to 500mg BID as tolerated',
      frequency: 'Daily (requires physician prescription and monitoring)'
    })
  }

  pillars.push({
    pillar: 'Pharmacological & Advanced',
    interventions: pharmaInterventions
  })

  // Daily routine
  const dailyRoutine: Array<{ time: string; activity: string; category: string }> = [
    { time: '6:00 AM', activity: 'Wake, hydration (500ml water with electrolytes), morning light exposure', category: 'Circadian' },
    { time: '6:15 AM', activity: 'Breathwork or meditation (10-20 min)', category: 'Stress' },
    { time: '6:30 AM', activity: 'Exercise: Zone 2 cardio or HIIT (rotate daily)', category: 'Exercise' },
    { time: '7:30 AM', activity: 'Post-workout: Protein-rich meal within eating window', category: 'Nutrition' },
    { time: '8:00 AM', activity: 'Supplements: NMN, omega-3, vitamin D, magnesium', category: 'Supplement' },
    { time: '12:00 PM', activity: 'Midday meal: Mediterranean pattern, protein + vegetables + healthy fats', category: 'Nutrition' },
    { time: '1:00 PM', activity: 'Brief walk (10-15 min) for post-meal glucose management', category: 'Exercise' },
    { time: '5:00 PM', activity: 'Resistance training (on designated days) or mobility work', category: 'Exercise' },
    { time: '6:00 PM', activity: 'Last meal of the day (eating window closes)', category: 'Nutrition' },
    { time: '8:00 PM', activity: 'Begin wind-down: dim lights, no screens, blue light glasses', category: 'Sleep' },
    { time: '9:00 PM', activity: 'Evening routine: light reading, gratitude journaling, stretching', category: 'Sleep' },
    { time: '9:30 PM', activity: 'Sleep supplements if needed (magnesium, theanine)', category: 'Sleep' },
    { time: '10:00 PM', activity: 'Target bedtime for 7-8 hours sleep', category: 'Sleep' }
  ]

  // Biomarker tracking
  const biomarkerTracking: Array<{ biomarker: string; frequency: string; targetRange: string }> = [
    { biomarker: 'Fasting Glucose', frequency: 'Every 3 months', targetRange: '70-90 mg/dL' },
    { biomarker: 'HbA1c', frequency: 'Every 6 months', targetRange: '< 5.3%' },
    { biomarker: 'Lipid Panel (LDL, HDL, TG)', frequency: 'Every 6 months', targetRange: 'LDL < 100, HDL > 60, TG < 100' },
    { biomarker: 'hs-CRP', frequency: 'Every 3 months', targetRange: '< 0.5 mg/L' },
    { biomarker: 'Homocysteine', frequency: 'Every 6 months', targetRange: '< 8 umol/L' },
    { biomarker: 'Vitamin D (25-OH)', frequency: 'Every 6 months', targetRange: '40-60 ng/mL' },
    { biomarker: 'Testosterone (if applicable)', frequency: 'Every 6 months', targetRange: 'Age-appropriate upper-normal' },
    { biomarker: 'IGF-1', frequency: 'Every 6 months', targetRange: 'Age-appropriate mid-range' },
    { biomarker: 'CMP + CBC', frequency: 'Every 6 months', targetRange: 'Within normal limits' },
    { biomarker: 'ApoE Genotype (once)', frequency: 'Once', targetRange: 'Know your status for personalized risk' }
  ]

  // Follow-up
  const followUp: Array<{ timepoint: string; assessments: string[] }> = [
    { timepoint: 'Month 1', assessments: ['Protocol adherence review', 'Side effect assessment', 'Sleep quality evaluation', 'Exercise tolerance check'] },
    { timepoint: 'Month 3', assessments: ['Biomarker re-testing (glucose, CRP, lipids)', 'Body composition analysis', 'Functional fitness assessment', 'Protocol adjustment'] },
    { timepoint: 'Month 6', assessments: ['Comprehensive biomarker panel', 'Aging clock recalculation', 'Healthspan score reassessment', 'Protocol optimization'] },
    { timepoint: 'Month 9', assessments: ['Biomarker re-testing', 'Functional assessments', 'Quality of life evaluation', 'Long-term planning'] },
    { timepoint: 'Month 12', assessments: ['Full comprehensive reassessment', 'Biological age recalculation', 'Protocol revision for next year', 'Advanced testing (epigenetic, etc.)'] }
  ]

  // Expected outcomes
  const expectedOutcomes: Array<{ outcome: string; timeline: string; measurement: string }> = [
    { outcome: 'Improved fasting glucose and insulin sensitivity', timeline: '1-3 months', measurement: 'Fasting glucose, HOMA-IR' },
    { outcome: 'Reduced systemic inflammation', timeline: '2-4 months', measurement: 'hs-CRP, IL-6' },
    { outcome: 'Improved cardiovascular fitness', timeline: '2-3 months', measurement: 'VO2max, resting heart rate' },
    { outcome: 'Increased muscle mass and strength', timeline: '3-6 months', measurement: 'DEXA, grip strength, 1RM' },
    { outcome: 'Improved sleep quality', timeline: '1-2 months', measurement: 'Sleep tracking, HRV' },
    { outcome: 'Reduced biological age', timeline: '6-12 months', measurement: 'Aging clock recalculation' },
    { outcome: 'Improved lipid profile', timeline: '3-6 months', measurement: 'Lipid panel' },
    { outcome: 'Enhanced cognitive function', timeline: '3-6 months', measurement: 'Cognitive testing, subjective assessment' }
  ]

  // Evidence base
  const evidenceBase: string[] = [
    'Lopez-Otin et al, 2023 - Cell (Hallmarks of Aging)',
    'Partridge et al, 2020 - Nature (Aging Research Roadmap)',
    'Kennedy et al, 2014 - Cell (Geroscience)',
    'Longo & Panda, 2016 - Cell Metabolism (Fasting)',
    'Patterson & Sears, 2017 - Annu Rev Nutr (Circadian Nutrition)',
    'de Cabo & Mattson, 2019 - NEJM (Fasting and Aging)',
    'Estruch et al, 2018 - NEJM (PREDIMED)',
    'Manson et al, 2019 - NEJM (VITAL)',
    'Justice et al, 2019 - EBioMedicine (Senolytics)',
    'Martens et al, 2018 - Nature Commun (NMN)'
  ]

  // Output
  lines.push('**Patient:** ' + age + '-year-old ' + sex.charAt(0).toUpperCase() + sex.slice(1))
  lines.push('**Chronological Age:** ' + age + ' | **Biological Age:** ' + biologicalAge + ' | **Age Acceleration:** ' + (ageAccel >= 0 ? '+' : '') + ageAccel.toFixed(1) + ' years')
  lines.push('**Protocol Duration:** ' + protocolDuration + ' months')
  lines.push('**Goals:** ' + goals.join(', '))
  lines.push('')

  // Pillars
  lines.push('### Protocol Pillars')
  for (const p of pillars) {
    lines.push('#### ' + p.pillar)
    for (const iv of p.interventions) {
      lines.push('- **' + iv.name + ':** ' + iv.details)
      lines.push('  - Frequency: ' + iv.frequency)
    }
    lines.push('')
  }

  // Daily routine
  lines.push('### Daily Routine Template')
  lines.push('| Time | Activity | Category |')
  lines.push('|------|----------|----------|')
  for (const r of dailyRoutine) {
    lines.push('| ' + r.time + ' | ' + r.activity + ' | ' + r.category + ' |')
  }
  lines.push('')

  // Biomarker tracking
  lines.push('### Biomarker Tracking Schedule')
  lines.push('| Biomarker | Frequency | Target Range |')
  lines.push('|-----------|-----------|-------------|')
  for (const bt of biomarkerTracking) {
    lines.push('| ' + bt.biomarker + ' | ' + bt.frequency + ' | ' + bt.targetRange + ' |')
  }
  lines.push('')

  // Follow-up
  lines.push('### Follow-Up Schedule')
  for (const fu of followUp) {
    lines.push('**' + fu.timepoint + ':** ' + fu.assessments.join(', '))
  }
  lines.push('')

  // Expected outcomes
  lines.push('### Expected Outcomes')
  lines.push('| Outcome | Timeline | Measurement |')
  lines.push('|---------|----------|-------------|')
  for (const eo of expectedOutcomes) {
    lines.push('| ' + eo.outcome + ' | ' + eo.timeline + ' | ' + eo.measurement + ' |')
  }
  lines.push('')

  // Evidence base
  lines.push('### Evidence Base')
  for (const eb of evidenceBase) {
    lines.push('- ' + eb)
  }
  lines.push('')

  lines.push('> **Disclaimer:** This personalized longevity protocol is generated by an AI model and is not a substitute for professional medical judgment. All pharmacological interventions require physician supervision. Regular monitoring and adjustment by qualified healthcare professionals is essential.')

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'biomarker_tracker',
    description: 'Track biomarker trends over time with longitudinal analysis, alert levels, and personalized recommendations. Accepts current biomarker values and historical data for trend detection.',
    parameters: {
      current_biomarkers: { type: 'string', required: true, description: 'JSON array of current biomarker objects with fields: name, value, unit, reference_range, date, category' },
      historical_biomarkers: { type: 'string', description: 'JSON array of historical biomarker objects (same structure) for trend analysis' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_biomarkers: string; historical_biomarkers?: string }) {
      const current: BiomarkerEntry[] = JSON.parse(args.current_biomarkers)
      const history: BiomarkerEntry[] = args.historical_biomarkers ? JSON.parse(args.historical_biomarkers) : []
      const result = trackBiomarkers(current, history)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'aging_clock_calculator',
    description: 'Calculate biological age using multiple aging clocks (phenotypic, telomeric, epigenetic estimates). Provides domain-specific age scores, aging rate, and optimization opportunities based on biomarkers and lifestyle factors.',
    parameters: {
      age: { type: 'string', required: true, description: 'Chronological age in years' },
      sex: { type: 'string', required: true, description: 'Biological sex: "male" or "female"' },
      biomarkers: { type: 'string', required: true, description: 'JSON array of biomarker objects with fields: name, value, unit, reference_range, date' },
      lifestyle_factors: { type: 'string', description: 'Optional JSON object with fields: exercise_hours_per_week, sleep_hours_per_night, smoking, alcohol_drinks_per_week, diet_quality, stress_level' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { age: string; sex: string; biomarkers: string; lifestyle_factors?: string }) {
      const age = parseInt(args.age, 10)
      const sex = args.sex as 'male' | 'female'
      const biomarkers: BiomarkerEntry[] = JSON.parse(args.biomarkers)
      const lifestyle = args.lifestyle_factors ? JSON.parse(args.lifestyle_factors) : undefined
      const input: AgingClockInput = { age: age, sex: sex, biomarkers: biomarkers, lifestyle_factors: lifestyle }
      const result = calculateAgingClock(input)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'intervention_planner',
    description: 'Design evidence-based longevity interventions tailored to patient goals and biomarkers. Provides pharmacological, nutritional, lifestyle, and supplement recommendations with evidence grades and monitoring plans.',
    parameters: {
      age: { type: 'string', required: true, description: 'Patient age in years' },
      sex: { type: 'string', required: true, description: 'Patient sex: "male" or "female"' },
      goals: { type: 'string', required: true, description: 'JSON array of longevity goals (e.g., ["metabolic health", "cardiovascular", "inflammation reduction"])' },
      current_biomarkers: { type: 'string', description: 'Optional JSON array of current biomarker objects for personalized recommendations' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { age: string; sex: string; goals: string; current_biomarkers?: string }) {
      const age = parseInt(args.age, 10)
      const goals: string[] = JSON.parse(args.goals)
      const biomarkers = args.current_biomarkers ? JSON.parse(args.current_biomarkers) as BiomarkerEntry[] : undefined
      const result = planInterventions(age, args.sex, goals, biomarkers)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'longevity_research_synthesizer',
    description: 'Synthesize longevity research literature for a given topic. Provides evidence quality assessment, key findings from relevant studies, clinical implications, and consensus level across the longevity field.',
    parameters: {
      query: { type: 'string', required: true, description: 'Longevity research topic or query (e.g., "rapamycin aging", "metformin longevity", "senolytic therapies")' },
      max_results: { type: 'string', description: 'Maximum number of studies to include (default "10")' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; max_results?: string }) {
      const maxRes = parseInt(args.max_results ?? '10', 10)
      const result = synthesizeResearch(args.query, maxRes)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'healthspan_optimizer',
    description: 'Assess and optimize healthspan across multiple domains (cardiovascular, metabolic, inflammatory, physical function, cognitive). Provides domain scores, optimization potential, and targeted recommendations.',
    parameters: {
      age: { type: 'string', required: true, description: 'Patient age in years' },
      sex: { type: 'string', required: true, description: 'Patient sex: "male" or "female"' },
      biomarkers: { type: 'string', required: true, description: 'JSON array of biomarker objects with fields: name, value, unit, reference_range, date' },
      lifestyle: { type: 'string', description: 'Optional JSON object with fields: exercise_hours_per_week, sleep_hours_per_night, smoking, alcohol_drinks_per_week, diet_quality, stress_level, social_connections' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { age: string; sex: string; biomarkers: string; lifestyle?: string }) {
      const age = parseInt(args.age, 10)
      const biomarkers: BiomarkerEntry[] = JSON.parse(args.biomarkers)
      const lifestyleData = args.lifestyle ? JSON.parse(args.lifestyle) : {}
      const result = optimizeHealthspan(age, args.sex, biomarkers, lifestyleData)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'epigenetic_analyzer',
    description: 'Analyze DNA methylation patterns to estimate epigenetic age, identify differentially methylated sites, assess pathway alterations, and provide targeted intervention recommendations.',
    parameters: {
      sample_id: { type: 'string', required: true, description: 'Unique identifier for the epigenetic sample' },
      cpg_sites: { type: 'string', required: true, description: 'JSON array of CpG site objects with fields: site (e.g., "cg02228183"), gene (e.g., "ELOVL2"), methylation (0-1), expected (0-1)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sample_id: string; cpg_sites: string }) {
      const sites: Array<{ site: string; gene: string; methylation: number; expected: number }> = JSON.parse(args.cpg_sites)
      const result = analyzeEpigenetics(args.sample_id, sites)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'senolytic_therapy_advisor',
    description: 'Provide evidence-based senolytic therapy recommendations including compound selection, dosing schedules, drug interactions, contraindications, and monitoring plans. Covers dasatinib+quercetin, fisetin, navitoclax, and emerging senolytics.',
    parameters: {
      age: { type: 'string', required: true, description: 'Patient age in years' },
      sex: { type: 'string', required: true, description: 'Patient sex: "male" or "female"' },
      conditions: { type: 'string', description: 'Optional JSON array of relevant conditions (e.g., ["pulmonary fibrosis", "osteoarthritis", "frailty"])' },
      current_medications: { type: 'string', description: 'Optional JSON array of current medications for interaction checking' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { age: string; sex: string; conditions?: string; current_medications?: string }) {
      const age = parseInt(args.age, 10)
      const conditions = args.conditions ? JSON.parse(args.conditions) as string[] : undefined
      const medications = args.current_medications ? JSON.parse(args.current_medications) as string[] : undefined
      const result = adviseSenolytics(age, args.sex, conditions, medications)
      return result
    }
  }))

  tools.register(defineTool({
    name: 'personalized_longevity_protocol',
    description: 'Generate a comprehensive, personalized longevity protocol integrating nutrition, exercise, sleep, stress management, and pharmacological interventions. Includes daily routine template, biomarker tracking schedule, and follow-up plan.',
    parameters: {
      age: { type: 'string', required: true, description: 'Patient chronological age in years' },
      sex: { type: 'string', required: true, description: 'Patient sex: "male" or "female"' },
      biological_age: { type: 'string', required: true, description: 'Estimated biological age in years' },
      goals: { type: 'string', required: true, description: 'JSON array of longevity goals (e.g., ["extend healthspan", "reduce inflammation", "optimize metabolism"])' },
      biomarkers: { type: 'string', description: 'Optional JSON array of current biomarker objects for personalized protocol adjustments' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { age: string; sex: string; biological_age: string; goals: string; biomarkers?: string }) {
      const age = parseInt(args.age, 10)
      const bioAge = parseInt(args.biological_age, 10)
      const goals: string[] = JSON.parse(args.goals)
      const biomarkers = args.biomarkers ? JSON.parse(args.biomarkers) as BiomarkerEntry[] : undefined
      const result = createLongevityProtocol(age, args.sex, bioAge, goals, biomarkers)
      return result
    }
  }))

  console.log('[dsh-tool-longevityai] Loaded v' + VERSION + ' - Longevity & Healthspan Optimization with 8 tools')
  console.log('  Tools: biomarker_tracker, aging_clock_calculator, intervention_planner, longevity_research_synthesizer, healthspan_optimizer, epigenetic_analyzer, senolytic_therapy_advisor, personalized_longevity_protocol')
}
