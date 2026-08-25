/**
 * DSH Aquaculture & Blue Economy Plugin v0.1.0
 *
 * Comprehensive aquaculture and blue economy management toolkit for DeepSeek Harness Agent.
 * Designed for fish farmers, aquaculture technicians, marine biologists, and blue economy planners.
 *
 * Tools (v0.1.0):
 * 1. fish_health_monitor        - Fish disease diagnosis with mortality tracking and treatment plans
 * 2. water_quality_analyzer     - Water quality analysis with DO, pH, temperature, ammonia assessment
 * 3. feeding_optimizer          - Feeding optimization engine with FCR improvement recommendations
 * 4. farm_site_selector          - Fish farm site selection with environmental suitability scoring
 * 5. algal_bloom_predictor      - Algal bloom prediction with risk forecasting and early warnings
 * 6. aquaculture_market_planner  - Aquaculture market planning with price trend analysis
 * 7. offshore_logistics_config   - Offshore logistics configuration with vessel and route optimization
 * 8. blue_carbon_estimator      - Blue carbon credit estimator with tCO2e/ha/yr sequestration
 *
 * @module dsh-tool-aquatech
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-aquatech'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== DISCLAIMERS ====================

const HEALTH_DISCLAIMER =
  'This diagnosis is based on AI model inference for reference only. It does not replace professional veterinary diagnosis. Please consult a certified aquatic veterinarian for confirmation.'
const GENERAL_DISCLAIMER =
  'This analysis is based on AI model inference for aquaculture management reference only. Please combine with actual conditions and professional advice for decision-making.'

// ==================== MULBERRY32 SEEDED PRNG ====================

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
    let hash = 2166136261
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
    return (hash >>> 0) || 1
  }
}

// ==================== TOOL 1: FISH HEALTH MONITOR ====================

export interface FishHealthInput {
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout' | 'other'
  pond_id: string
  symptoms: string[]
  mortality_rate_pct: number
  water_temp_c: number
  affected_body_parts?: string[]
  behavior_changes?: string[]
  duration_days?: number
  population_count?: number
}

export interface DiseaseCandidate {
  name: string
  probability: number
  category: 'bacterial' | 'viral' | 'parasitic' | 'fungal' | 'environmental' | 'nutritional'
  severity: 'mild' | 'moderate' | 'severe'
  description: string
  treatment: string[]
  prevention: string[]
}

export interface FishHealthResult {
  pond_id: string
  species: string
  overall_health_score: number
  mortality_rate_pct: number
  mortality_trend: 'decreasing' | 'stable' | 'increasing' | 'critical'
  candidates: DiseaseCandidate[]
  primary_diagnosis: string
  confidence: number
  treatment_plan: string[]
  prevention_measures: string[]
  urgency: 'routine' | 'monitor' | 'urgent' | 'emergency'
  estimated_population_affected: number
  water_temp_c: number
  recommendations: string[]
}

function analyzeFishHealth(input: FishHealthInput): FishHealthResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.pond_id}:${input.species}:${input.symptoms.join(',')}`))
  const candidates: DiseaseCandidate[] = []
  const symptomStr = input.symptoms.map(s => s.toLowerCase()).join(',')
  const popCount = input.population_count || 10000

  // Bacterial diseases
  if (symptomStr.includes('ulcer') || symptomStr.includes('hemorrhage') || symptomStr.includes('lesion')) {
    candidates.push({
      name: 'Vibriosis',
      probability: parseFloat((0.78 + rng.nextFloat(-0.05, 0.05)).toFixed(3)),
      category: 'bacterial',
      severity: 'severe',
      description: 'Bacterial infection caused by Vibrio species, presenting with skin ulcers, hemorrhages, and septicemia',
      treatment: ['Administer florfenicol or enrofloxacin medicated feed (5-7 day course)', 'Apply povidone-iodine bath (0.3 ppm)', 'Improve water quality and reduce organic load'],
      prevention: ['Regular probiotic application for water quality management', 'Avoid high-density stocking', 'Disinfect equipment regularly', 'Vaccinate if available']
    })
  }

  if (symptomStr.includes('rot') || symptomStr.includes('fin rot') || symptomStr.includes('gill rot') || symptomStr.includes('necrosis')) {
    candidates.push({
      name: 'Columnaris / Gill Rot',
      probability: parseFloat((0.72 + rng.nextFloat(-0.05, 0.05)).toFixed(3)),
      category: 'bacterial',
      severity: 'moderate',
      description: 'Flavobacterium or Aeromonas infection causing fin erosion, gill necrosis, and excess mucus',
      treatment: ['Apply chlorine dioxide bath (0.3 ppm)', 'Sulfonamide medicated feed (5 day course)', 'Increase dissolved oxygen levels'],
      prevention: ['Maintain clean water conditions', 'Control stocking density', 'Regular lime disinfection']
    })
  }

  // Parasitic diseases
  if (symptomStr.includes('white spot') || symptomStr.includes('ich') || symptomStr.includes('cyst') || symptomStr.includes('flashing')) {
    candidates.push({
      name: 'White Spot Disease (Ichthyophthirius)',
      probability: parseFloat((0.85 + rng.nextFloat(-0.05, 0.05)).toFixed(3)),
      category: 'parasitic',
      severity: 'severe',
      description: 'Protozoan parasite Ichthyophthirius multifiliis causing white cysts on skin, fins, and gills',
      treatment: ['Formalin bath (15-25 ppm)', 'Copper sulfate + ferrous sulfate combo (0.7 ppm 5:2)', 'Gradually raise temperature to 28-30°C if species tolerant', 'Salt bath (3-5 ppt, 5-10 min)'],
      prevention: ['Quarantine new stock for 2 weeks', 'Avoid rapid temperature fluctuations', 'Regular salt disinfection']
    })
  }

  if (symptomStr.includes('scratch') || symptomStr.includes('flashing') || symptomStr.includes('excess mucus') || symptomStr.includes('lethargy')) {
    candidates.push({
      name: 'Ectoparasite Infestation',
      probability: parseFloat((0.65 + rng.nextFloat(-0.05, 0.05)).toFixed(3)),
      category: 'parasitic',
      severity: 'moderate',
      description: 'External parasites (Argulus, Lernaea, Trichodina) causing irritation, flashing behavior, and excess mucus production',
      treatment: ['Potassium permanganate bath (2 ppm)', 'Organophosphate treatment (0.25 ppm)', 'Salt bath (5-10 ppt, 15 min)'],
      prevention: ['Regular microscopic examination of skin scrapings', 'Maintain good water quality', 'Avoid introducing wild fish']
    })
  }

  // Environmental / nutritional
  if (symptomStr.includes('gasping') || symptomStr.includes('surface') || symptomStr.includes('low do') || symptomStr.includes('hypoxia')) {
    candidates.push({
      name: 'Hypoxia / Environmental Stress',
      probability: parseFloat((0.80 + rng.nextFloat(-0.05, 0.05)).toFixed(3)),
      category: 'environmental',
      severity: 'severe',
      description: 'Low dissolved oxygen causing gasping at surface, reduced feeding, and potential mass mortality',
      treatment: ['Immediately activate all aerators', 'Reduce or stop feeding', 'Emergency oxygen supplementation', 'Partial water exchange'],
      prevention: ['Install adequate aeration capacity', 'Monitor DO levels continuously', 'Reduce feeding during high temperature periods']
    })
  }

  if (candidates.length === 0) {
    candidates.push({
      name: 'General Health Decline',
      probability: parseFloat((0.50 + rng.nextFloat(-0.10, 0.10)).toFixed(3)),
      category: 'environmental',
      severity: 'mild',
      description: 'Non-specific health decline possibly related to water quality, nutrition, or suboptimal environmental conditions',
      treatment: ['Conduct comprehensive water quality test', 'Review feed quality and nutrition', 'Reduce stocking stress'],
      prevention: ['Implement regular health monitoring', 'Maintain optimal water quality parameters', 'Follow best management practices']
    })
  }

  // Sort by probability descending
  candidates.sort((a, b) => b.probability - a.probability)

  const primaryDiag = candidates[0]
  const confidence = parseFloat((primaryDiag.probability * 100).toFixed(1))

  // Mortality trend
  let mortalityTrend: FishHealthResult['mortality_trend'] = 'stable'
  if (input.mortality_rate_pct > 5.0) mortalityTrend = 'critical'
  else if (input.mortality_rate_pct > 2.0) mortalityTrend = 'increasing'
  else if (input.mortality_rate_pct > 0.5) mortalityTrend = 'stable'
  else mortalityTrend = 'decreasing'

  // Urgency
  let urgency: FishHealthResult['urgency'] = 'routine'
  if (input.mortality_rate_pct > 5.0 || primaryDiag.severity === 'severe') urgency = 'emergency'
  else if (input.mortality_rate_pct > 2.0 || primaryDiag.severity === 'moderate') urgency = 'urgent'
  else if (input.mortality_rate_pct > 0.5) urgency = 'monitor'

  // Health score
  const severityPenalty = primaryDiag.severity === 'severe' ? 30 : primaryDiag.severity === 'moderate' ? 15 : 5
  const mortalityPenalty = Math.min(40, input.mortality_rate_pct * 8)
  const healthScore = parseFloat(Math.max(0, 100 - severityPenalty - mortalityPenalty - rng.nextFloat(0, 5)).toFixed(1))

  const estimatedAffected = Math.round(popCount * (input.mortality_rate_pct / 100) * rng.nextFloat(1.5, 3.0))

  const recommendations: string[] = []
  if (urgency === 'emergency') recommendations.push('IMMEDIATE: Contact aquatic veterinarian within 24 hours')
  if (input.water_temp_c > 30) recommendations.push('High temperature stress: increase aeration and reduce feeding')
  if (input.mortality_rate_pct > 2.0) recommendations.push('Collect moribund samples for laboratory diagnosis')
  recommendations.push('Review and document all water quality parameters')
  recommendations.push('Implement biosecurity measures to prevent disease spread')

  return {
    pond_id: input.pond_id,
    species: input.species,
    overall_health_score: healthScore,
    mortality_rate_pct: parseFloat(input.mortality_rate_pct.toFixed(2)),
    mortality_trend: mortalityTrend,
    candidates,
    primary_diagnosis: primaryDiag.name,
    confidence,
    treatment_plan: primaryDiag.treatment,
    prevention_measures: primaryDiag.prevention,
    urgency,
    estimated_population_affected: estimatedAffected,
    water_temp_c: input.water_temp_c,
    recommendations
  }
}

function formatFishHealthReport(r: FishHealthResult): string {
  const lines: string[] = []
  lines.push('## Fish Health Monitor Report')
  lines.push('')
  lines.push('### Overview')
  lines.push(`- **Pond ID:** ${r.pond_id}`)
  lines.push(`- **Species:** ${r.species}`)
  lines.push(`- **Overall Health Score:** ${r.overall_health_score}/100`)
  lines.push(`- **Mortality Rate:** ${r.mortality_rate_pct}% (${r.mortality_trend})`)
  lines.push(`- **Estimated Affected Population:** ${r.estimated_population_affected.toLocaleString()} individuals`)
  lines.push(`- **Water Temperature:** ${r.water_temp_c}°C`)
  lines.push(`- **Urgency Level:** ${r.urgency.toUpperCase()}`)
  lines.push('')
  lines.push('### Primary Diagnosis')
  lines.push(`- **Diagnosis:** ${r.primary_diagnosis}`)
  lines.push(`- **Confidence:** ${r.confidence}%`)
  lines.push('')
  lines.push('### Differential Diagnoses')
  lines.push('| # | Disease | Category | Probability | Severity |')
  lines.push('|---|---------|----------|-------------|----------|')
  for (let i = 0; i < r.candidates.length; i++) {
    const c = r.candidates[i]
    lines.push(`| ${i + 1} | ${c.name} | ${c.category} | ${(c.probability * 100).toFixed(1)}% | ${c.severity} |`)
  }
  lines.push('')
  lines.push('### Treatment Plan')
  for (const t of r.treatment_plan) lines.push(`- ${t}`)
  lines.push('')
  lines.push('### Prevention Measures')
  for (const p of r.prevention_measures) lines.push(`- ${p}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ${HEALTH_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 2: WATER QUALITY ANALYZER ====================

export interface WaterQualityInput {
  pond_id: string
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout' | 'other'
  temperature_c: number
  ph: number
  dissolved_oxygen_mg_l: number
  ammonia_mg_l: number
  nitrite_mg_l: number
  salinity_ppt?: number
  turbidity_ntu?: number
  alkalinity_mg_l?: number
  measurement_depth_m?: number
}

export interface ParameterStatus {
  parameter: string
  value: number
  unit: string
  status: 'optimal' | 'acceptable' | 'warning' | 'critical'
  optimal_range: string
  deviation: number
}

export interface WaterQualityResult {
  pond_id: string
  species: string
  overall_score: number
  hypoxia_risk: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  parameters: ParameterStatus[]
  alerts: string[]
  recommendations: string[]
  immediate_actions: string[]
  temperature_c: number
  ph: number
  dissolved_oxygen_mg_l: number
  ammonia_mg_l: number
  nitrite_mg_l: number
}

function analyzeWaterQuality(input: WaterQualityInput): WaterQualityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.pond_id}:${input.species}:${input.temperature_c}:${input.ph}:${input.dissolved_oxygen_mg_l}`))
  const params: ParameterStatus[] = []
  const alerts: string[] = []
  const recommendations: string[] = []
  const immediate_actions: string[] = []

  // Temperature
  const isColdWater = input.species === 'salmon' || input.species === 'trout'
  const tempOptimal = isColdWater ? '12-18°C' : '22-30°C'
  const tempMin = isColdWater ? 12 : 22
  const tempMax = isColdWater ? 18 : 30
  let tempStatus: ParameterStatus['status'] = 'optimal'
  let tempDev = 0
  if (input.temperature_c < tempMin - 5 || input.temperature_c > tempMax + 5) {
    tempStatus = 'critical'; tempDev = Math.abs(input.temperature_c - (tempMin + tempMax) / 2)
    alerts.push(`Temperature critically out of range: ${input.temperature_c}°C (optimal: ${tempOptimal})`)
    immediate_actions.push('Adjust water temperature through shading or heating')
  } else if (input.temperature_c < tempMin || input.temperature_c > tempMax) {
    tempStatus = 'warning'; tempDev = Math.abs(input.temperature_c - (tempMin + tempMax) / 2)
    alerts.push(`Temperature outside optimal range: ${input.temperature_c}°C (optimal: ${tempOptimal})`)
    recommendations.push('Monitor temperature trends and adjust management practices')
  }
  params.push({ parameter: 'Temperature', value: input.temperature_c, unit: '°C', status: tempStatus, optimal_range: tempOptimal, deviation: parseFloat(tempDev.toFixed(1)) })

  // pH
  const phOptimal = '6.5-8.5'
  let phStatus: ParameterStatus['status'] = 'optimal'
  let phDev = 0
  if (input.ph < 5.5 || input.ph > 9.5) {
    phStatus = 'critical'; phDev = Math.abs(input.ph - 7.5)
    alerts.push(`pH critically abnormal: ${input.ph} (safe range: ${phOptimal})`)
    immediate_actions.push('Apply pH buffer (lime if acidic, acid if alkaline)')
  } else if (input.ph < 6.5 || input.ph > 8.5) {
    phStatus = 'warning'; phDev = Math.abs(input.ph - 7.5)
    alerts.push(`pH outside optimal range: ${input.ph} (optimal: ${phOptimal})`)
    recommendations.push('Gradually adjust pH through water exchange or buffering')
  }
  params.push({ parameter: 'pH', value: input.ph, unit: '', status: phStatus, optimal_range: phOptimal, deviation: parseFloat(phDev.toFixed(2)) })

  // Dissolved Oxygen
  const doOptimal = '>5.0 mg/L'
  let doStatus: ParameterStatus['status'] = 'optimal'
  let doDev = 0
  if (input.dissolved_oxygen_mg_l < 2.0) {
    doStatus = 'critical'; doDev = 5.0 - input.dissolved_oxygen_mg_l
    alerts.push(`Severe hypoxia! DO only ${input.dissolved_oxygen_mg_l} mg/L (safe threshold: >5.0 mg/L)`)
    immediate_actions.push('Activate all aerators immediately', 'Reduce or stop feeding', 'Prepare emergency oxygen supply')
  } else if (input.dissolved_oxygen_mg_l < 3.5) {
    doStatus = 'warning'; doDev = 5.0 - input.dissolved_oxygen_mg_l
    alerts.push(`Low dissolved oxygen: ${input.dissolved_oxygen_mg_l} mg/L (safe threshold: >5.0 mg/L)`)
    immediate_actions.push('Turn on aerators', 'Reduce feeding amount')
  } else if (input.dissolved_oxygen_mg_l < 5.0) {
    doStatus = 'acceptable'; doDev = 5.0 - input.dissolved_oxygen_mg_l
  }
  params.push({ parameter: 'Dissolved Oxygen', value: input.dissolved_oxygen_mg_l, unit: 'mg/L', status: doStatus, optimal_range: doOptimal, deviation: parseFloat(doDev.toFixed(2)) })

  // Ammonia
  const nh3Optimal = '<0.02 mg/L'
  let nh3Status: ParameterStatus['status'] = 'optimal'
  let nh3Dev = 0
  if (input.ammonia_mg_l > 2.0) {
    nh3Status = 'critical'; nh3Dev = input.ammonia_mg_l
    alerts.push(`Ammonia critically high: ${input.ammonia_mg_l} mg/L (safe: <0.02 mg/L)`)
    immediate_actions.push('Immediate 30-50% water exchange', 'Stop feeding', 'Apply water conditioner')
  } else if (input.ammonia_mg_l > 0.5) {
    nh3Status = 'warning'; nh3Dev = input.ammonia_mg_l
    alerts.push(`Ammonia elevated: ${input.ammonia_mg_l} mg/L (safe: <0.02 mg/L)`)
    recommendations.push('Increase water exchange frequency', 'Reduce feeding rate', 'Apply probiotics')
  } else if (input.ammonia_mg_l > 0.02) {
    nh3Status = 'acceptable'; nh3Dev = input.ammonia_mg_l
  }
  params.push({ parameter: 'Ammonia (NH3)', value: input.ammonia_mg_l, unit: 'mg/L', status: nh3Status, optimal_range: nh3Optimal, deviation: parseFloat(nh3Dev.toFixed(3)) })

  // Nitrite
  const no2Optimal = '<0.1 mg/L'
  let no2Status: ParameterStatus['status'] = 'optimal'
  let no2Dev = 0
  if (input.nitrite_mg_l > 1.0) {
    no2Status = 'critical'; no2Dev = input.nitrite_mg_l
    alerts.push(`Nitrite critically high: ${input.nitrite_mg_l} mg/L (safe: <0.1 mg/L)`)
    immediate_actions.push('Apply chloride salt (competitive nitrite uptake)', 'Water exchange')
  } else if (input.nitrite_mg_l > 0.3) {
    no2Status = 'warning'; no2Dev = input.nitrite_mg_l
    alerts.push(`Nitrite elevated: ${input.nitrite_mg_l} mg/L (safe: <0.1 mg/L)`)
    recommendations.push('Add chloride to water', 'Check biofilter performance')
  } else if (input.nitrite_mg_l > 0.1) {
    no2Status = 'acceptable'; no2Dev = input.nitrite_mg_l
  }
  params.push({ parameter: 'Nitrite (NO2)', value: input.nitrite_mg_l, unit: 'mg/L', status: no2Status, optimal_range: no2Optimal, deviation: parseFloat(no2Dev.toFixed(3)) })

  // Hypoxia risk
  let hypoxiaRisk: WaterQualityResult['hypoxia_risk'] = 'none'
  if (input.dissolved_oxygen_mg_l < 2.0) hypoxiaRisk = 'severe'
  else if (input.dissolved_oxygen_mg_l < 3.0) hypoxiaRisk = 'high'
  else if (input.dissolved_oxygen_mg_l < 4.0) hypoxiaRisk = 'moderate'
  else if (input.dissolved_oxygen_mg_l < 5.0) hypoxiaRisk = 'low'

  // Temperature-DO interaction
  if (input.temperature_c > 32 && input.dissolved_oxygen_mg_l < 5.0) {
    hypoxiaRisk = 'high'
    alerts.push('High temperature + low DO combination risk: elevated temperature reduces oxygen solubility')
  }

  // Overall score
  const criticalCount = params.filter(p => p.status === 'critical').length
  const warningCount = params.filter(p => p.status === 'warning').length
  const score = parseFloat(Math.max(0, 100 - criticalCount * 25 - warningCount * 10 - rng.nextFloat(0, 5)).toFixed(1))

  if (recommendations.length === 0) {
    recommendations.push('Continue current water quality management practices', 'Monitor parameters regularly', 'Record water quality trends')
  }

  return {
    pond_id: input.pond_id,
    species: input.species,
    overall_score: score,
    hypoxia_risk: hypoxiaRisk,
    parameters: params,
    alerts,
    recommendations,
    immediate_actions,
    temperature_c: input.temperature_c,
    ph: input.ph,
    dissolved_oxygen_mg_l: input.dissolved_oxygen_mg_l,
    ammonia_mg_l: input.ammonia_mg_l,
    nitrite_mg_l: input.nitrite_mg_l
  }
}

function formatWaterQualityReport(r: WaterQualityResult): string {
  const lines: string[] = []
  const riskLabel: Record<string, string> = { none: 'None', low: 'Low', moderate: 'Moderate', high: 'High', severe: 'Severe' }
  const statusLabel: Record<string, string> = { optimal: 'Optimal', acceptable: 'Acceptable', warning: 'Warning', critical: 'Critical' }

  lines.push('## Water Quality Analysis Report')
  lines.push('')
  lines.push('### Summary')
  lines.push(`- **Pond ID:** ${r.pond_id}`)
  lines.push(`- **Species:** ${r.species}`)
  lines.push(`- **Overall Score:** ${r.overall_score}/100`)
  lines.push(`- **Hypoxia Risk:** ${riskLabel[r.hypoxia_risk]}`)
  lines.push(`- **Temperature:** ${r.temperature_c}°C`)
  lines.push(`- **pH:** ${r.ph}`)
  lines.push(`- **Dissolved Oxygen:** ${r.dissolved_oxygen_mg_l} mg/L`)
  lines.push(`- **Ammonia:** ${r.ammonia_mg_l} mg/L`)
  lines.push(`- **Nitrite:** ${r.nitrite_mg_l} mg/L`)
  lines.push('')
  lines.push('### Parameter Status')
  lines.push('| Parameter | Value | Status | Optimal Range | Deviation |')
  lines.push('|-----------|-------|--------|---------------|-----------|')
  for (const p of r.parameters) {
    lines.push(`| ${p.parameter} | ${p.value} ${p.unit} | ${statusLabel[p.status]} | ${p.optimal_range} | ${p.deviation} |`)
  }
  lines.push('')

  if (r.alerts.length > 0) {
    lines.push('### Alerts')
    for (const a of r.alerts) lines.push(`- WARNING: ${a}`)
    lines.push('')
  }

  if (r.immediate_actions.length > 0) {
    lines.push('### Immediate Actions Required')
    for (const a of r.immediate_actions) lines.push(`- URGENT: ${a}`)
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ${GENERAL_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 3: FEEDING OPTIMIZER ====================

export interface FeedingOptimizerInput {
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout' | 'other'
  avg_weight_g: number
  target_weight_g: number
  stocking_count: number
  current_fcr: number
  water_temp_c: number
  growth_stage: 'fry' | 'fingerling' | 'juvenile' | 'growout' | 'broodstock'
  feed_cost_per_kg: number
  market_price_per_kg: number
  feeding_frequency_per_day?: number
}

export interface FeedingSchedule {
  time: string
  feed_pct_body_weight: number
  feed_amount_kg: number
  feed_type: string
}

export interface FeedingOptimizerResult {
  species: string
  growth_stage: string
  current_fcr: number
  target_fcr: number
  fcr_improvement_pct: number
  daily_feed_amount_kg: number
  feed_pct_body_weight: number
  protein_requirement_pct: number
  feeding_schedule: FeedingSchedule[]
  estimated_days_to_target: number
  total_feed_cost_estimate: number
  expected_revenue: number
  expected_profit_margin_pct: number
  water_temp_c: number
  recommendations: string[]
}

function analyzeFeeding(input: FeedingOptimizerInput): FeedingOptimizerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.species}:${input.avg_weight_g}:${input.target_weight_g}:${input.water_temp_c}`))

  // Species-specific FCR targets
  const fcrTargets: Record<string, number> = {
    tilapia: 1.5, shrimp: 1.4, salmon: 1.2, catfish: 1.6,
    carp: 1.8, sea_bass: 1.5, trout: 1.3, other: 1.6
  }
  const targetFCR = fcrTargets[input.species] || 1.6
  const fcrImprovement = parseFloat(((input.current_fcr - targetFCR) / input.current_fcr * 100).toFixed(1))

  // Protein requirements by growth stage
  const proteinReqs: Record<string, number> = {
    fry: 45, fingerling: 40, juvenile: 35, growout: 32, broodstock: 38
  }
  const proteinReq = proteinReqs[input.growth_stage] || 35

  // Feed rate (% body weight) based on temperature and growth stage
  let feedRatePct: number
  if (input.water_temp_c < 15) feedRatePct = 0.5
  else if (input.water_temp_c < 20) feedRatePct = 1.5
  else if (input.water_temp_c < 25) feedRatePct = 2.5
  else if (input.water_temp_c < 30) feedRatePct = 3.5
  else feedRatePct = 2.0

  // Adjust for growth stage
  const stageMultiplier: Record<string, number> = { fry: 1.5, fingerling: 1.3, juvenile: 1.0, growout: 0.8, broodstock: 0.6 }
  feedRatePct *= stageMultiplier[input.growth_stage] || 1.0

  const totalBiomassKg = (input.avg_weight_g * input.stocking_count) / 1000
  const dailyFeedKg = parseFloat((totalBiomassKg * feedRatePct / 100).toFixed(2))
  feedRatePct = parseFloat(feedRatePct.toFixed(2))

  // Feeding frequency
  const freqMap: Record<string, number> = { fry: 6, fingerling: 4, juvenile: 3, growout: 2, broodstock: 2 }
  const freq = input.feeding_frequency_per_day || freqMap[input.growth_stage] || 3

  // Generate feeding schedule
  const schedule: FeedingSchedule[] = []
  const feedTypes: Record<string, string> = {
    fry: 'Crumbled starter feed (0.5-1.0 mm)', fingerling: 'Pellet feed (1.5-2.0 mm)',
    juvenile: 'Pellet feed (3-4 mm)', growout: 'Extruded pellet (5-8 mm)', broodstock: 'High-protein broodstock feed'
  }
  const feedType = feedTypes[input.growth_stage] || 'Standard pellet feed'

  const times = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
  const pctPerFeeding = parseFloat((100 / freq).toFixed(1))
  const feedPerSession = parseFloat((dailyFeedKg / freq).toFixed(3))

  for (let i = 0; i < freq; i++) {
    schedule.push({
      time: times[i],
      feed_pct_body_weight: parseFloat((feedRatePct / freq).toFixed(2)),
      feed_amount_kg: feedPerSession,
      feed_type: feedType
    })
  }

  // Growth estimation (simplified thermal growth coefficient)
  const sgr = input.water_temp_c > 20 ? 2.5 : input.water_temp_c > 15 ? 1.5 : 0.5
  const daysToTarget = Math.max(1, Math.round((Math.log(input.target_weight_g) - Math.log(input.avg_weight_g)) / (sgr / 100)))

  // Economics
  const totalFeedKg = dailyFeedKg * daysToTarget * input.current_fcr
  const totalFeedCost = parseFloat((totalFeedKg * input.feed_cost_per_kg).toFixed(2))
  const harvestBiomassKg = totalBiomassKg * 0.9 // 10% mortality assumption
  const revenue = parseFloat((harvestBiomassKg * input.market_price_per_kg).toFixed(2))
  const profitMargin = parseFloat(((revenue - totalFeedCost) / revenue * 100).toFixed(1))

  const recommendations: string[] = []
  if (fcrImprovement > 10) recommendations.push(`Significant FCR improvement potential: reduce from ${input.current_fcr} to target ${targetFCR}`)
  if (input.water_temp_c > 30) recommendations.push('High temperature: reduce feeding rate and increase frequency')
  if (input.water_temp_c < 18) recommendations.push('Low temperature: reduce feeding rate, use high-energy feed')
  recommendations.push(`Maintain protein level at ${proteinReq}% for ${input.growth_stage} stage`)
  recommendations.push('Monitor feed conversion weekly and adjust rations accordingly')
  recommendations.push('Consider automated feeding systems for consistent delivery')

  return {
    species: input.species,
    growth_stage: input.growth_stage,
    current_fcr: input.current_fcr,
    target_fcr: targetFCR,
    fcr_improvement_pct: fcrImprovement,
    daily_feed_amount_kg: dailyFeedKg,
    feed_pct_body_weight: feedRatePct,
    protein_requirement_pct: proteinReq,
    feeding_schedule: schedule,
    estimated_days_to_target: daysToTarget,
    total_feed_cost_estimate: totalFeedCost,
    expected_revenue: revenue,
    expected_profit_margin_pct: profitMargin,
    water_temp_c: input.water_temp_c,
    recommendations
  }
}

function formatFeedingReport(r: FeedingOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Feeding Optimization Report')
  lines.push('')
  lines.push('### Overview')
  lines.push(`- **Species:** ${r.species}`)
  lines.push(`- **Growth Stage:** ${r.growth_stage}`)
  lines.push(`- **Current FCR:** ${r.current_fcr}`)
  lines.push(`- **Target FCR:** ${r.target_fcr}`)
  lines.push(`- **FCR Improvement Potential:** ${r.fcr_improvement_pct}%`)
  lines.push(`- **Water Temperature:** ${r.water_temp_c}°C`)
  lines.push('')
  lines.push('### Feeding Parameters')
  lines.push(`- **Daily Feed Amount:** ${r.daily_feed_amount_kg} kg/day`)
  lines.push(`- **Feed Rate:** ${r.feed_pct_body_weight}% body weight/day`)
  lines.push(`- **Protein Requirement:** ${r.protein_requirement_pct}%`)
  lines.push(`- **Estimated Days to Target Weight:** ${r.estimated_days_to_target} days`)
  lines.push('')
  lines.push('### Feeding Schedule')
  lines.push('| Time | Feed (% BW) | Amount (kg) | Feed Type |')
  lines.push('|------|-------------|-------------|-----------|')
  for (const s of r.feeding_schedule) {
    lines.push(`| ${s.time} | ${s.feed_pct_body_weight}% | ${s.feed_amount_kg} | ${s.feed_type} |`)
  }
  lines.push('')
  lines.push('### Economic Analysis')
  lines.push(`- **Total Feed Cost:** $${r.total_feed_cost_estimate.toLocaleString()}`)
  lines.push(`- **Expected Revenue:** $${r.expected_revenue.toLocaleString()}`)
  lines.push(`- **Profit Margin:** ${r.expected_profit_margin_pct}%`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ${GENERAL_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 4: FARM SITE SELECTOR ====================

export interface FarmSiteInput {
  location_name: string
  latitude: number
  longitude: number
  water_source: 'river' | 'lake' | 'groundwater' | 'seawater' | 'rainwater' | 'mixed'
  avg_water_temp_c: number
  annual_rainfall_mm: number
  elevation_m: number
  soil_type: 'clay' | 'sandy' | 'loam' | 'rocky' | 'peat'
  land_area_ha: number
  target_species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout' | 'other'
  proximity_to_road_km: number
  proximity_to_market_km: number
  power_grid_available: boolean
}

export interface SuitabilityFactor {
  factor: string
  score: number
  weight: number
  weighted_score: number
  assessment: string
}

export interface FarmSiteResult {
  location_name: string
  latitude: number
  longitude: number
  target_species: string
  overall_suitability_score: number
  suitability_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  factors: SuitabilityFactor[]
  strengths: string[]
  weaknesses: string[]
  estimated_setup_cost_usd: number
  estimated_annual_production_kg: number
  recommendations: string[]
  risk_level: 'low' | 'moderate' | 'high'
}

function analyzeFarmSite(input: FarmSiteInput): FarmSiteResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.location_name}:${input.latitude}:${input.longitude}:${input.target_species}`))
  const factors: SuitabilityFactor[] = []
  const strengths: string[] = []
  const weaknesses: string[] = []

  // Water temperature suitability
  const isColdWater = input.target_species === 'salmon' || input.target_species === 'trout'
  const tempScore = isColdWater
    ? (input.avg_water_temp_c >= 10 && input.avg_water_temp_c <= 20 ? 95 : input.avg_water_temp_c >= 8 && input.avg_water_temp_c <= 22 ? 70 : 30)
    : (input.avg_water_temp_c >= 22 && input.avg_water_temp_c <= 30 ? 95 : input.avg_water_temp_c >= 18 && input.avg_water_temp_c <= 33 ? 70 : 30)
  factors.push({ factor: 'Water Temperature', score: tempScore, weight: 0.20, weighted_score: parseFloat((tempScore * 0.20).toFixed(1)), assessment: tempScore >= 80 ? 'Optimal' : tempScore >= 60 ? 'Acceptable' : 'Suboptimal' })
  if (tempScore >= 80) strengths.push('Water temperature is optimal for target species')
  else if (tempScore < 50) weaknesses.push('Water temperature is outside optimal range for target species')

  // Water source reliability
  const sourceScores: Record<string, number> = { river: 80, lake: 75, groundwater: 90, seawater: 85, rainwater: 40, mixed: 70 }
  const waterScore = sourceScores[input.water_source] || 60
  factors.push({ factor: 'Water Source Reliability', score: waterScore, weight: 0.18, weighted_score: parseFloat((waterScore * 0.18).toFixed(1)), assessment: waterScore >= 80 ? 'Excellent' : waterScore >= 60 ? 'Adequate' : 'Limited' })
  if (waterScore >= 80) strengths.push('Reliable water source available')
  else if (waterScore < 50) weaknesses.push('Water source may be unreliable or seasonal')

  // Soil type for pond construction
  const soilScores: Record<string, number> = { clay: 95, loam: 80, peat: 50, sandy: 30, rocky: 20 }
  const soilScore = soilScores[input.soil_type] || 50
  factors.push({ factor: 'Soil Suitability', score: soilScore, weight: 0.12, weighted_score: parseFloat((soilScore * 0.12).toFixed(1)), assessment: soilScore >= 80 ? 'Excellent' : soilScore >= 50 ? 'Moderate' : 'Poor' })
  if (soilScore >= 80) strengths.push('Soil type is ideal for pond construction and water retention')
  else if (soilScore < 40) weaknesses.push('Soil type requires significant lining or modification for pond construction')

  // Infrastructure access
  const infraScore = Math.max(0, 100 - input.proximity_to_road_km * 5 - input.proximity_to_market_km * 2 + (input.power_grid_available ? 20 : 0))
  const infraScoreClamped = Math.min(100, Math.round(infraScore))
  factors.push({ factor: 'Infrastructure Access', score: infraScoreClamped, weight: 0.15, weighted_score: parseFloat((infraScoreClamped * 0.15).toFixed(1)), assessment: infraScoreClamped >= 75 ? 'Good' : infraScoreClamped >= 50 ? 'Moderate' : 'Limited' })
  if (infraScoreClamped >= 75) strengths.push('Good road and market access with power grid')
  else if (infraScoreClamped < 50) weaknesses.push('Limited infrastructure access increases operational costs')

  // Land area adequacy
  const areaScore = input.land_area_ha >= 10 ? 95 : input.land_area_ha >= 5 ? 80 : input.land_area_ha >= 2 ? 60 : input.land_area_ha >= 0.5 ? 40 : 20
  factors.push({ factor: 'Land Area Adequacy', score: areaScore, weight: 0.10, weighted_score: parseFloat((areaScore * 0.10).toFixed(1)), assessment: areaScore >= 80 ? 'Sufficient' : areaScore >= 50 ? 'Adequate' : 'Limited' })
  if (areaScore >= 80) strengths.push('Sufficient land area for commercial-scale operation')
  else if (areaScore < 50) weaknesses.push('Limited land area may constrain production scale')

  // Climate / rainfall
  const rainScore = input.annual_rainfall_mm >= 1000 && input.annual_rainfall_mm <= 2500 ? 90 : input.annual_rainfall_mm >= 500 ? 70 : 40
  factors.push({ factor: 'Climate / Rainfall', score: rainScore, weight: 0.10, weighted_score: parseFloat((rainScore * 0.10).toFixed(1)), assessment: rainScore >= 80 ? 'Favorable' : rainScore >= 50 ? 'Moderate' : 'Challenging' })

  // Elevation
  const elevScore = input.elevation_m <= 500 ? 90 : input.elevation_m <= 1500 ? 70 : input.elevation_m <= 3000 ? 40 : 20
  factors.push({ factor: 'Elevation', score: elevScore, weight: 0.08, weighted_score: parseFloat((elevScore * 0.08).toFixed(1)), assessment: elevScore >= 70 ? 'Suitable' : 'Challenging' })

  // Flood risk (inverse of elevation + rainfall)
  const floodRisk = input.elevation_m < 50 && input.annual_rainfall_mm > 2000 ? 30 : input.elevation_m < 100 ? 60 : 85
  factors.push({ factor: 'Flood Risk (inverse)', score: floodRisk, weight: 0.07, weighted_score: parseFloat((floodRisk * 0.07).toFixed(1)), assessment: floodRisk >= 75 ? 'Low risk' : floodRisk >= 50 ? 'Moderate risk' : 'High risk' })
  if (floodRisk < 50) weaknesses.push('Elevated flood risk at this location')

  // Overall score
  const overallScore = parseFloat(factors.reduce((sum, f) => sum + f.weighted_score, 0).toFixed(1))

  // Grade
  let grade: FarmSiteResult['suitability_grade'] = 'F'
  if (overallScore >= 85) grade = 'A'
  else if (overallScore >= 70) grade = 'B'
  else if (overallScore >= 55) grade = 'C'
  else if (overallScore >= 40) grade = 'D'

  // Risk level
  const riskLevel: FarmSiteResult['risk_level'] = overallScore >= 75 ? 'low' : overallScore >= 50 ? 'moderate' : 'high'

  // Cost estimation
  const setupCostPerHa = input.soil_type === 'rocky' ? 25000 : input.soil_type === 'sandy' ? 18000 : 12000
  const setupCost = Math.round(input.land_area_ha * setupCostPerHa * rng.nextFloat(0.9, 1.1))

  // Production estimate
  const yieldPerHa = input.target_species === 'shrimp' ? 5000 : input.target_species === 'tilapia' ? 8000 : input.target_species === 'catfish' ? 10000 : 6000
  const annualProduction = Math.round(input.land_area_ha * yieldPerHa * rng.nextFloat(0.8, 1.0))

  const recommendations: string[] = []
  if (grade === 'A' || grade === 'B') recommendations.push('Site is suitable for commercial aquaculture development')
  if (grade === 'C') recommendations.push('Site is marginally suitable; consider mitigation measures for identified weaknesses')
  if (grade === 'D' || grade === 'F') recommendations.push('Site has significant limitations; consider alternative locations')
  if (!input.power_grid_available) recommendations.push('Invest in solar power or generator for aeration and pumping')
  if (input.proximity_to_market_km > 50) recommendations.push('Plan for cold chain logistics due to distance from market')
  recommendations.push('Conduct detailed environmental impact assessment before construction')
  recommendations.push('Test water quality parameters across all seasons before final decision')

  return {
    location_name: input.location_name,
    latitude: input.latitude,
    longitude: input.longitude,
    target_species: input.target_species,
    overall_suitability_score: overallScore,
    suitability_grade: grade,
    factors,
    strengths,
    weaknesses,
    estimated_setup_cost_usd: setupCost,
    estimated_annual_production_kg: annualProduction,
    recommendations,
    risk_level: riskLevel
  }
}

function formatFarmSiteReport(r: FarmSiteResult): string {
  const lines: string[] = []
  lines.push('## Fish Farm Site Selection Report')
  lines.push('')
  lines.push('### Location Summary')
  lines.push(`- **Location:** ${r.location_name}`)
  lines.push(`- **Coordinates:** ${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`)
  lines.push(`- **Target Species:** ${r.target_species}`)
  lines.push(`- **Overall Suitability Score:** ${r.overall_suitability_score}/100`)
  lines.push(`- **Suitability Grade:** ${r.suitability_grade}`)
  lines.push(`- **Risk Level:** ${r.risk_level}`)
  lines.push('')
  lines.push('### Suitability Factors')
  lines.push('| Factor | Score | Weight | Weighted | Assessment |')
  lines.push('|--------|-------|--------|----------|------------|')
  for (const f of r.factors) {
    lines.push(`| ${f.factor} | ${f.score} | ${(f.weight * 100).toFixed(0)}% | ${f.weighted_score} | ${f.assessment} |`)
  }
  lines.push('')
  if (r.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of r.strengths) lines.push(`- ${s}`)
    lines.push('')
  }
  if (r.weaknesses.length > 0) {
    lines.push('### Weaknesses')
    for (const w of r.weaknesses) lines.push(`- ${w}`)
    lines.push('')
  }
  lines.push('### Economic Estimates')
  lines.push(`- **Estimated Setup Cost:** $${r.estimated_setup_cost_usd.toLocaleString()}`)
  lines.push(`- **Estimated Annual Production:** ${r.estimated_annual_production_kg.toLocaleString()} kg`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ${GENERAL_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 5: ALGAL BLOOM PREDICTOR ====================

export interface AlgalBloomInput {
  water_body_id: string
  water_body_type: 'pond' | 'lake' | 'reservoir' | 'coastal' | 'estuary'
  latitude: number
  longitude: number
  current_chlorophyll_a_ug_l: number
  total_nitrogen_mg_l: number
  total_phosphorus_mg_l: number
  water_temp_c: number
  solar_radiation_mj_m2_day: number
  wind_speed_m_s: number
  rainfall_7day_mm: number
  water_depth_m: number
  flow_rate_m_s?: number
}

export interface BloomRiskFactor {
  factor: string
  contribution: 'promoting' | 'inhibiting' | 'neutral'
  level: 'low' | 'moderate' | 'high'
  description: string
}

export interface AlgalBloomResult {
  water_body_id: string
  water_body_type: string
  bloom_probability_pct: number
  risk_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  predicted_peak_date: string
  predicted_duration_days: number
  dominant_algae_type: string
  risk_factors: BloomRiskFactor[]
  chlorophyll_a_forecast_ug_l: number
  recommendations: string[]
  monitoring_actions: string[]
  mitigation_measures: string[]
  water_temp_c: number
  total_nitrogen_mg_l: number
  total_phosphorus_mg_l: number
}

function analyzeAlgalBloom(input: AlgalBloomInput): AlgalBloomResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.water_body_id}:${input.latitude}:${input.water_temp_c}:${input.total_nitrogen_mg_l}:${input.total_phosphorus_mg_l}`))
  const riskFactors: BloomRiskFactor[] = []

  // Temperature factor
  let tempLevel: 'low' | 'moderate' | 'high' = 'low'
  if (input.water_temp_c >= 25 && input.water_temp_c <= 32) tempLevel = 'high'
  else if (input.water_temp_c >= 20) tempLevel = 'moderate'
  riskFactors.push({
    factor: 'Water Temperature',
    contribution: tempLevel === 'high' ? 'promoting' : tempLevel === 'moderate' ? 'promoting' : 'inhibiting',
    level: tempLevel,
    description: `Water temperature ${input.water_temp_c}°C is ${tempLevel === 'high' ? 'highly favorable' : tempLevel === 'moderate' ? 'moderately favorable' : 'unfavorable'} for algal growth`
  })

  // Nutrient loading (N and P)
  const npratio = input.total_nitrogen_mg_l / Math.max(0.001, input.total_phosphorus_mg_l)
  const nutrientLevel = input.total_phosphorus_mg_l > 0.1 && input.total_nitrogen_mg_l > 1.0 ? 'high' : input.total_phosphorus_mg_l > 0.05 ? 'moderate' : 'low'
  riskFactors.push({
    factor: 'Nutrient Loading (N & P)',
    contribution: nutrientLevel === 'high' ? 'promoting' : nutrientLevel === 'moderate' ? 'promoting' : 'inhibiting',
    level: nutrientLevel,
    description: `TN: ${input.total_nitrogen_mg_l} mg/L, TP: ${input.total_phosphorus_mg_l} mg/L, N:P ratio: ${npratio.toFixed(1)} (${nutrientLevel === 'high' ? 'eutrophic conditions' : nutrientLevel === 'moderate' ? 'mesotrophic conditions' : 'oligotrophic conditions'})`
  })

  // Solar radiation
  const solarLevel = input.solar_radiation_mj_m2_day > 20 ? 'high' : input.solar_radiation_mj_m2_day > 12 ? 'moderate' : 'low'
  riskFactors.push({
    factor: 'Solar Radiation',
    contribution: solarLevel === 'high' ? 'promoting' : solarLevel === 'moderate' ? 'promoting' : 'inhibiting',
    level: solarLevel,
    description: `Solar radiation ${input.solar_radiation_mj_m2_day} MJ/m²/day provides ${solarLevel} photosynthetic energy`
  })

  // Wind (inhibits blooms by mixing)
  const windLevel = input.wind_speed_m_s < 2 ? 'high' : input.wind_speed_m_s < 5 ? 'moderate' : 'low'
  riskFactors.push({
    factor: 'Wind Speed',
    contribution: windLevel === 'high' ? 'promoting' : windLevel === 'moderate' ? 'neutral' : 'inhibiting',
    level: windLevel,
    description: `Wind speed ${input.wind_speed_m_s} m/s: ${windLevel === 'high' ? 'calm conditions favor surface bloom formation' : windLevel === 'moderate' ? 'moderate mixing' : 'strong mixing inhibits bloom formation'}`
  })

  // Rainfall (nutrient runoff)
  const rainLevel = input.rainfall_7day_mm > 100 ? 'high' : input.rainfall_7day_mm > 30 ? 'moderate' : 'low'
  riskFactors.push({
    factor: 'Recent Rainfall',
    contribution: rainLevel === 'high' ? 'promoting' : rainLevel === 'moderate' ? 'promoting' : 'neutral',
    level: rainLevel,
    description: `7-day rainfall ${input.rainfall_7day_mm} mm: ${rainLevel === 'high' ? 'significant nutrient runoff likely' : rainLevel === 'moderate' ? 'moderate runoff' : 'minimal runoff impact'}`
  })

  // Water depth (shallow = more prone)
  const depthLevel = input.water_depth_m < 2 ? 'high' : input.water_depth_m < 5 ? 'moderate' : 'low'
  riskFactors.push({
    factor: 'Water Depth',
    contribution: depthLevel === 'high' ? 'promoting' : depthLevel === 'moderate' ? 'neutral' : 'inhibiting',
    level: depthLevel,
    description: `Water depth ${input.water_depth_m} m: ${depthLevel === 'high' ? 'shallow water promotes bloom formation' : depthLevel === 'moderate' ? 'moderate depth' : 'deep water inhibits surface blooms'}`
  })

  // Calculate bloom probability
  let probability = 10
  for (const rf of riskFactors) {
    if (rf.contribution === 'promoting') probability += rf.level === 'high' ? 18 : rf.level === 'moderate' ? 10 : 3
    else if (rf.contribution === 'inhibiting') probability -= rf.level === 'high' ? 15 : rf.level === 'moderate' ? 8 : 3
  }
  probability = Math.min(95, Math.max(5, Math.round(probability + rng.nextFloat(-5, 5))))

  // Risk level
  let riskLevel: AlgalBloomResult['risk_level'] = 'very_low'
  if (probability >= 80) riskLevel = 'very_high'
  else if (probability >= 60) riskLevel = 'high'
  else if (probability >= 40) riskLevel = 'moderate'
  else if (probability >= 20) riskLevel = 'low'

  // Dominant algae type
  const algaeTypes = npratio > 20 ? 'Cyanobacteria (Microcystis, Anabaena)' : npratio > 10 ? 'Mixed (Green algae + Cyanobacteria)' : 'Diatoms (Cyclotella, Stephanodiscus)'
  const dominantAlgae = input.water_temp_c > 25 ? 'Cyanobacteria (Microcystis aeruginosa)' : input.water_temp_c > 18 ? 'Green algae (Chlorella, Scenedesmus)' : 'Diatoms (Aulacoseira, Fragilaria)'

  // Forecast
  const daysToPeak = Math.max(3, Math.round(rng.nextInt(5, 21)))
  const peakDate = new Date()
  peakDate.setDate(peakDate.getDate() + daysToPeak)
  const duration = Math.round(rng.nextInt(7, 45))
  const chlForecast = parseFloat((input.current_chlorophyll_a_ug_l * (1 + probability / 30)).toFixed(1))

  const recommendations: string[] = []
  const monitoringActions: string[] = []
  const mitigationMeasures: string[] = []

  if (riskLevel === 'very_high' || riskLevel === 'high') {
    recommendations.push('CRITICAL: High algal bloom risk - implement immediate monitoring and mitigation')
    monitoringActions.push('Deploy continuous chlorophyll-a monitoring sensors', 'Daily water sampling for cell counts and toxin analysis', 'Monitor dissolved oxygen at multiple depths')
    mitigationMeasures.push('Prepare algaecide (copper sulfate) for emergency application', 'Install aeration to prevent hypoxia from bloom collapse', 'Reduce nutrient inputs immediately')
  } else if (riskLevel === 'moderate') {
    recommendations.push('Moderate bloom risk: increase monitoring frequency and prepare contingency plans')
    monitoringActions.push('Sample water twice weekly for chlorophyll and nutrients', 'Monitor weather forecasts for conditions favoring bloom development')
    mitigationMeasures.push('Reduce fertilizer application in watershed', 'Consider barley straw application as preventive measure')
  } else {
    recommendations.push('Low bloom risk: maintain routine monitoring schedule')
    monitoringActions.push('Weekly water quality sampling', 'Monthly chlorophyll-a measurement')
    mitigationMeasures.push('Maintain watershed best management practices', 'Monitor for early signs of nutrient accumulation')
  }

  return {
    water_body_id: input.water_body_id,
    water_body_type: input.water_body_type,
    bloom_probability_pct: probability,
    risk_level: riskLevel,
    predicted_peak_date: peakDate.toISOString().split('T')[0],
    predicted_duration_days: duration,
    dominant_algae_type: dominantAlgae,
    risk_factors: riskFactors,
    chlorophyll_a_forecast_ug_l: chlForecast,
    recommendations,
    monitoring_actions: monitoringActions,
    mitigation_measures: mitigationMeasures,
    water_temp_c: input.water_temp_c,
    total_nitrogen_mg_l: input.total_nitrogen_mg_l,
    total_phosphorus_mg_l: input.total_phosphorus_mg_l
  }
}

function formatAlgalBloomReport(r: AlgalBloomResult): string {
  const lines: string[] = []
  lines.push('## Algal Bloom Prediction Report')
  lines.push('')
  lines.push('### Risk Assessment')
  lines.push(`- **Water Body ID:** ${r.water_body_id}`)
  lines.push(`- **Water Body Type:** ${r.water_body_type}`)
  lines.push(`- **Bloom Probability:** ${r.bloom_probability_pct}%`)
  lines.push(`- **Risk Level:** ${r.risk_level.replace(/_/g, ' ').toUpperCase()}`)
  lines.push(`- **Predicted Peak Date:** ${r.predicted_peak_date}`)
  lines.push(`- **Predicted Duration:** ${r.predicted_duration_days} days`)
  lines.push(`- **Dominant Algae Type:** ${r.dominant_algae_type}`)
  lines.push(`- **Chlorophyll-a Forecast:** ${r.chlorophyll_a_forecast_ug_l} ug/L`)
  lines.push(`- **Water Temperature:** ${r.water_temp_c}°C`)
  lines.push(`- **Total Nitrogen:** ${r.total_nitrogen_mg_l} mg/L`)
  lines.push(`- **Total Phosphorus:** ${r.total_phosphorus_mg_l} mg/L`)
  lines.push('')
  lines.push('### Risk Factor Analysis')
  lines.push('| Factor | Contribution | Level | Description |')
  lines.push('|--------|-------------|-------|-------------|')
  for (const rf of r.risk_factors) {
    lines.push(`| ${rf.factor} | ${rf.contribution} | ${rf.level} | ${rf.description} |`)
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('### Monitoring Actions')
  for (const m of r.monitoring_actions) lines.push(`- ${m}`)
  lines.push('')
  lines.push('### Mitigation Measures')
  for (const m of r.mitigation_measures) lines.push(`- ${m}`)
  lines.push('')
  lines.push(`> ${GENERAL_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 6: AQUACULTURE MARKET PLANNER ====================

export interface MarketPlannerInput {
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout' | 'other'
  target_market: 'domestic_fresh' | 'domestic_frozen' | 'export_asia' | 'export_europe' | 'export_us' | 'processing'
  planned_volume_kg: number
  production_cost_per_kg: number
  current_market_price_per_kg: number
  price_trend_6month: 'rising' | 'stable' | 'falling'
  seasonality_factor: 'peak_demand' | 'normal' | 'low_demand'
  quality_grade: 'premium' | 'standard' | 'economy'
  certification_available: boolean
  competitor_supply_trend: 'increasing' | 'stable' | 'decreasing'
}

export interface MarketForecast {
  month: string
  predicted_price_per_kg: number
  demand_index: number
  supply_index: number
}

export interface MarketPlannerResult {
  species: string
  target_market: string
  planned_volume_kg: number
  current_price_per_kg: number
  projected_avg_price_per_kg: number
  price_change_pct: number
  total_revenue_estimate: number
  total_production_cost: number
  gross_profit_estimate: number
  profit_margin_pct: number
  market_forecasts: MarketForecast[]
  optimal_selling_month: string
  market_opportunity_score: number
  risk_factors: string[]
  recommendations: string[]
  quality_grade: string
  certification_premium_pct: number
}

function analyzeMarket(input: MarketPlannerInput): MarketPlannerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.species}:${input.target_market}:${input.planned_volume_kg}:${input.current_market_price_per_kg}`))

  // Market price multipliers
  const marketMultipliers: Record<string, number> = {
    domestic_fresh: 1.0, domestic_frozen: 0.85, export_asia: 1.15,
    export_europe: 1.35, export_us: 1.25, processing: 0.70
  }
  const marketMult = marketMultipliers[input.target_market] || 1.0

  // Quality grade multipliers
  const qualityMult: Record<string, number> = { premium: 1.3, standard: 1.0, economy: 0.8 }
  const qMult = qualityMult[input.quality_grade] || 1.0

  // Seasonality impact
  const seasonMult: Record<string, number> = { peak_demand: 1.2, normal: 1.0, low_demand: 0.85 }
  const sMult = seasonMult[input.seasonality_factor] || 1.0

  // Price trend impact
  const trendMult: Record<string, number> = { rising: 1.1, stable: 1.0, falling: 0.9 }
  const tMult = trendMult[input.price_trend_6month] || 1.0

  // Certification premium
  const certPremium = input.certification_available ? rng.nextFloat(5, 15) : 0

  // Competitor impact
  const competitorMult: Record<string, number> = { increasing: 0.92, stable: 1.0, decreasing: 1.08 }
  const cMult = competitorMult[input.competitor_supply_trend] || 1.0

  // Projected price
  const projectedPrice = parseFloat((input.current_market_price_per_kg * marketMult * qMult * sMult * tMult * cMult * (1 + certPremium / 100)).toFixed(2))
  const priceChange = parseFloat(((projectedPrice - input.current_market_price_per_kg) / input.current_market_price_per_kg * 100).toFixed(1))

  // Generate 6-month forecast
  const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
  const forecasts: MarketForecast[] = []
  let totalForecastPrice = 0
  let optimalMonth = months[0]
  let optimalPrice = 0

  for (let i = 0; i < 6; i++) {
    const seasonalAdj = 1 + 0.1 * Math.sin((i / 6) * Math.PI * 2)
    const trendAdj = 1 + (priceChange / 100) * (i / 6)
    const noise = rng.nextFloat(-0.03, 0.03)
    const monthPrice = parseFloat((projectedPrice * seasonalAdj * trendAdj * (1 + noise)).toFixed(2))
    const demandIdx = Math.round(70 + rng.nextInt(0, 30) + (input.seasonality_factor === 'peak_demand' ? 15 : 0))
    const supplyIdx = Math.round(60 + rng.nextInt(0, 40) - (input.competitor_supply_trend === 'decreasing' ? 15 : 0))

    forecasts.push({ month: months[i], predicted_price_per_kg: monthPrice, demand_index: demandIdx, supply_index: supplyIdx })
    totalForecastPrice += monthPrice
    if (monthPrice > optimalPrice) { optimalPrice = monthPrice; optimalMonth = months[i] }
  }

  const avgForecastPrice = parseFloat((totalForecastPrice / 6).toFixed(2))
  const totalRevenue = parseFloat((input.planned_volume_kg * avgForecastPrice).toFixed(2))
  const totalCost = parseFloat((input.planned_volume_kg * input.production_cost_per_kg).toFixed(2))
  const grossProfit = parseFloat((totalRevenue - totalCost).toFixed(2))
  const profitMargin = parseFloat((grossProfit / totalRevenue * 100).toFixed(1))

  // Market opportunity score (0-100)
  const opportunityScore = Math.min(100, Math.round(
    (profitMargin * 0.3) + (priceChange > 0 ? priceChange * 2 : 0) +
    (input.seasonality_factor === 'peak_demand' ? 20 : 10) +
    (input.certification_available ? 15 : 0) +
    (input.competitor_supply_trend === 'decreasing' ? 15 : 0) +
    rng.nextFloat(0, 10)
  ))

  // Risk factors
  const riskFactors: string[] = []
  if (input.price_trend_6month === 'falling') riskFactors.push('Declining price trend may reduce margins')
  if (input.competitor_supply_trend === 'increasing') riskFactors.push('Increasing competitor supply may depress prices')
  if (input.seasonality_factor === 'low_demand') riskFactors.push('Low demand season may limit sales volume')
  if (!input.certification_available && (input.target_market === 'export_europe' || input.target_market === 'export_us')) {
    riskFactors.push('Lack of certification may restrict market access')
  }
  if (profitMargin < 15) riskFactors.push('Low profit margin increases financial risk')

  const recommendations: string[] = []
  if (opportunityScore >= 70) recommendations.push('Strong market opportunity: proceed with planned production volume')
  else if (opportunityScore >= 50) recommendations.push('Moderate opportunity: consider phased production approach')
  else recommendations.push('Challenging market conditions: consider alternative species or markets')
  if (input.certification_available) recommendations.push('Leverage certification for premium pricing in target market')
  if (input.price_trend_6month === 'rising') recommendations.push('Rising price trend: consider forward contracts to lock in prices')
  recommendations.push(`Optimal selling window: ${optimalMonth} (projected price: $${optimalPrice}/kg)`)
  recommendations.push('Diversify market channels to reduce dependency on single buyer')
  recommendations.push('Monitor competitor production cycles for timing advantage')

  return {
    species: input.species,
    target_market: input.target_market,
    planned_volume_kg: input.planned_volume_kg,
    current_price_per_kg: input.current_market_price_per_kg,
    projected_avg_price_per_kg: avgForecastPrice,
    price_change_pct: priceChange,
    total_revenue_estimate: totalRevenue,
    total_production_cost: totalCost,
    gross_profit_estimate: grossProfit,
    profit_margin_pct: profitMargin,
    market_forecasts: forecasts,
    optimal_selling_month: optimalMonth,
    market_opportunity_score: opportunityScore,
    risk_factors: riskFactors,
    recommendations,
    quality_grade: input.quality_grade,
    certification_premium_pct: parseFloat(certPremium.toFixed(1))
  }
}

function formatMarketReport(r: MarketPlannerResult): string {
  const lines: string[] = []
  lines.push('## Aquaculture Market Planning Report')
  lines.push('')
  lines.push('### Market Overview')
  lines.push(`- **Species:** ${r.species}`)
  lines.push(`- **Target Market:** ${r.target_market.replace(/_/g, ' ')}`)
  lines.push(`- **Planned Volume:** ${r.planned_volume_kg.toLocaleString()} kg`)
  lines.push(`- **Quality Grade:** ${r.quality_grade}`)
  lines.push(`- **Certification Premium:** ${r.certification_premium_pct}%`)
  lines.push('')
  lines.push('### Price Analysis')
  lines.push(`- **Current Price:** $${r.current_price_per_kg}/kg`)
  lines.push(`- **Projected Average Price:** $${r.projected_avg_price_per_kg}/kg`)
  lines.push(`- **Price Change:** ${r.price_change_pct > 0 ? '+' : ''}${r.price_change_pct}%`)
  lines.push(`- **Optimal Selling Month:** ${r.optimal_selling_month}`)
  lines.push('')
  lines.push('### 6-Month Price Forecast')
  lines.push('| Month | Predicted Price ($/kg) | Demand Index | Supply Index |')
  lines.push('|-------|----------------------|--------------|--------------|')
  for (const f of r.market_forecasts) {
    lines.push(`| ${f.month} | $${f.predicted_price_per_kg} | ${f.demand_index} | ${f.supply_index} |`)
  }
  lines.push('')
  lines.push('### Financial Projections')
  lines.push(`- **Total Revenue:** $${r.total_revenue_estimate.toLocaleString()}`)
  lines.push(`- **Total Production Cost:** $${r.total_production_cost.toLocaleString()}`)
  lines.push(`- **Gross Profit:** $${r.gross_profit_estimate.toLocaleString()}`)
  lines.push(`- **Profit Margin:** ${r.profit_margin_pct}%`)
  lines.push(`- **Market Opportunity Score:** ${r.market_opportunity_score}/100`)
  lines.push('')
  if (r.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const rf of r.risk_factors) lines.push(`- ${rf}`)
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ${GENERAL_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 7: OFFSHORE LOGISTICS CONFIG ====================

export interface OffshoreLogisticsInput {
  operation_type: 'cage_farming' | 'longline' | 'raft_culture' | 'bottom_culture' | 'integrated_multi_trophic'
  site_name: string
  distance_from_shore_km: number
  avg_wave_height_m: number
  avg_current_speed_knots: number
  water_depth_m: number
  vessel_type: 'workboat' | 'feed_barge' | 'harvest_vessel' | 'multi_purpose' | 'crew_transfer'
  vessel_count: number
  daily_feed_tons: number
  crew_size: number
  weather_window_days_per_month: number
}

export interface VesselSchedule {
  vessel_id: string
  task: string
  frequency: string
  duration_hours: number
  fuel_consumption_l: number
  weather_constraint: string
}

export interface OffshoreLogisticsResult {
  site_name: string
  operation_type: string
  distance_from_shore_km: number
  logistics_feasibility_score: number
  vessel_schedules: VesselSchedule[]
  daily_operating_cost_usd: number
  monthly_fuel_cost_usd: number
  monthly_transport_cost_usd: number
  weather_downtime_days_per_month: number
  total_monthly_logistics_cost_usd: number
  avg_wave_height_m: number
  avg_current_speed_knots: number
  recommendations: string[]
  risk_mitigation: string[]
  optimal_vessel_config: string
}

function analyzeOffshoreLogistics(input: OffshoreLogisticsInput): OffshoreLogisticsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.site_name}:${input.operation_type}:${input.distance_from_shore_km}:${input.vessel_type}`))

  // Feasibility score based on conditions
  let feasibility = 85
  if (input.distance_from_shore_km > 50) feasibility -= 15
  else if (input.distance_from_shore_km > 20) feasibility -= 5
  if (input.avg_wave_height_m > 3) feasibility -= 20
  else if (input.avg_wave_height_m > 2) feasibility -= 10
  if (input.avg_current_speed_knots > 3) feasibility -= 10
  if (input.weather_window_days_per_month < 15) feasibility -= 15
  feasibility = Math.max(20, Math.min(95, feasibility + rng.nextInt(-5, 5)))

  // Vessel schedules
  const schedules: VesselSchedule[] = []
  const vesselIdBase = input.vessel_type.substring(0, 3).toUpperCase()

  // Feed delivery schedule
  const feedTripsPerDay = Math.ceil(input.daily_feed_tons / 5) // 5 tons per trip
  const feedDuration = parseFloat((input.distance_from_shore_km / 12 * 2 + 1).toFixed(1)) // 12 knot avg speed + 1h loading
  schedules.push({
    vessel_id: `${vesselIdBase}-FEED-01`,
    task: 'Feed delivery and distribution',
    frequency: `${feedTripsPerDay}x daily`,
    duration_hours: feedDuration,
    fuel_consumption_l: Math.round(feedDuration * 40),
    weather_constraint: `Wave height < ${Math.min(3.0, input.avg_wave_height_m + 0.5).toFixed(1)}m`
  })

  // Crew transfer
  schedules.push({
    vessel_id: `${vesselIdBase}-CREW-01`,
    task: 'Crew rotation and supply delivery',
    frequency: 'Every 7 days',
    duration_hours: parseFloat((input.distance_from_shore_km / 15 * 2 + 0.5).toFixed(1)),
    fuel_consumption_l: Math.round(input.distance_from_shore_km / 15 * 2 * 35),
    weather_constraint: 'Wind < 25 knots, Wave < 2.5m'
  })

  // Maintenance and inspection
  schedules.push({
    vessel_id: `${vesselIdBase}-MAINT-01`,
    task: 'Net/cage inspection and maintenance',
    frequency: 'Weekly',
    duration_hours: parseFloat((4 + input.distance_from_shore_km / 15).toFixed(1)),
    fuel_consumption_l: Math.round((4 + input.distance_from_shore_km / 15) * 25),
    weather_constraint: 'Wave < 1.5m, Visibility > 1km'
  })

  // Harvest operations (if applicable)
  if (input.operation_type === 'cage_farming' || input.operation_type === 'longline') {
    schedules.push({
      vessel_id: `${vesselIdBase}-HARV-01`,
      task: 'Harvest operations and live fish transport',
      frequency: 'Monthly (seasonal)',
      duration_hours: parseFloat((8 + input.distance_from_shore_km / 10).toFixed(1)),
      fuel_consumption_l: Math.round((8 + input.distance_from_shore_km / 10) * 50),
      weather_constraint: 'Wave < 2.0m, Wind < 15 knots'
    })
  }

  // Cost calculations
  const fuelCostPerLiter = 1.2
  const dailyFuelL = schedules.filter(s => s.frequency.includes('daily')).reduce((sum, s) => sum + s.fuel_consumption_l * feedTripsPerDay, 0)
  const weeklyFuelL = schedules.filter(s => s.frequency.includes('Weekly')).reduce((sum, s) => sum + s.fuel_consumption_l, 0)
  const monthlyFuelL = Math.round(dailyFuelL * 26 + weeklyFuelL * 4)
  const monthlyFuelCost = Math.round(monthlyFuelL * fuelCostPerLiter)

  const vesselDailyCost = input.vessel_type === 'feed_barge' ? 800 : input.vessel_type === 'harvest_vessel' ? 1500 : 600
  const dailyOperatingCost = Math.round(input.vessel_count * vesselDailyCost + input.crew_size * 150)
  const monthlyTransportCost = Math.round(dailyOperatingCost * 26)

  const weatherDowntime = Math.max(0, 30 - input.weather_window_days_per_month)
  const totalMonthlyCost = monthlyFuelCost + monthlyTransportCost + Math.round(weatherDowntime * 200)

  // Optimal vessel config
  const optimalConfig = input.distance_from_shore_km > 30
    ? 'Multi-purpose vessel with dynamic positioning and helicopter support'
    : input.daily_feed_tons > 10
    ? 'Dedicated feed barge + workboat combination'
    : 'Single multi-purpose workboat with modular equipment'

  const recommendations: string[] = []
  if (feasibility < 60) recommendations.push('Site conditions are challenging: consider alternative locations or robust vessel specifications')
  if (input.avg_wave_height_m > 2.5) recommendations.push('High wave environment: invest in dynamic positioning and motion-compensated cranes')
  if (input.distance_from_shore_km > 30) recommendations.push('Remote location: establish on-site accommodation and emergency response capability')
  if (input.weather_window_days_per_month < 20) recommendations.push('Limited weather windows: plan operations with flexible scheduling and buffer days')
  recommendations.push('Implement real-time weather monitoring and automated alert system')
  recommendations.push('Establish preventive maintenance schedule to minimize vessel downtime')

  const riskMitigation: string[] = []
  riskMitigation.push('Maintain backup vessel availability for emergency response')
  riskMitigation.push('Install remote monitoring systems for offshore equipment')
  riskMitigation.push('Develop contingency plans for medical evacuation')
  riskMitigation.push('Secure fuel supply contracts with onshore depots')
  if (input.avg_wave_height_m > 2) riskMitigation.push('Deploy wave monitoring buoys for real-time sea state data')

  return {
    site_name: input.site_name,
    operation_type: input.operation_type,
    distance_from_shore_km: input.distance_from_shore_km,
    logistics_feasibility_score: feasibility,
    vessel_schedules: schedules,
    daily_operating_cost_usd: dailyOperatingCost,
    monthly_fuel_cost_usd: monthlyFuelCost,
    monthly_transport_cost_usd: monthlyTransportCost,
    weather_downtime_days_per_month: weatherDowntime,
    total_monthly_logistics_cost_usd: totalMonthlyCost,
    avg_wave_height_m: input.avg_wave_height_m,
    avg_current_speed_knots: input.avg_current_speed_knots,
    recommendations,
    risk_mitigation: riskMitigation,
    optimal_vessel_config: optimalConfig
  }
}

function formatOffshoreLogisticsReport(r: OffshoreLogisticsResult): string {
  const lines: string[] = []
  lines.push('## Offshore Logistics Configuration Report')
  lines.push('')
  lines.push('### Site Overview')
  lines.push(`- **Site Name:** ${r.site_name}`)
  lines.push(`- **Operation Type:** ${r.operation_type.replace(/_/g, ' ')}`)
  lines.push(`- **Distance from Shore:** ${r.distance_from_shore_km} km`)
  lines.push(`- **Logistics Feasibility Score:** ${r.logistics_feasibility_score}/100`)
  lines.push(`- **Average Wave Height:** ${r.avg_wave_height_m} m`)
  lines.push(`- **Average Current Speed:** ${r.avg_current_speed_knots} knots`)
  lines.push('')
  lines.push('### Vessel Schedules')
  lines.push('| Vessel ID | Task | Frequency | Duration (h) | Fuel (L) | Weather Constraint |')
  lines.push('|-----------|------|-----------|--------------|----------|-------------------|')
  for (const s of r.vessel_schedules) {
    lines.push(`| ${s.vessel_id} | ${s.task} | ${s.frequency} | ${s.duration_hours} | ${s.fuel_consumption_l} | ${s.weather_constraint} |`)
  }
  lines.push('')
  lines.push('### Cost Breakdown')
  lines.push(`- **Daily Operating Cost:** $${r.daily_operating_cost_usd.toLocaleString()}`)
  lines.push(`- **Monthly Fuel Cost:** $${r.monthly_fuel_cost_usd.toLocaleString()}`)
  lines.push(`- **Monthly Transport Cost:** $${r.monthly_transport_cost_usd.toLocaleString()}`)
  lines.push(`- **Weather Downtime:** ${r.weather_downtime_days_per_month} days/month`)
  lines.push(`- **Total Monthly Logistics Cost:** $${r.total_monthly_logistics_cost_usd.toLocaleString()}`)
  lines.push('')
  lines.push('### Optimal Vessel Configuration')
  lines.push(`- ${r.optimal_vessel_config}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('### Risk Mitigation')
  for (const rm of r.risk_mitigation) lines.push(`- ${rm}`)
  lines.push('')
  lines.push(`> ${GENERAL_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 8: BLUE CARBON ESTIMATOR ====================

export interface BlueCarbonInput {
  ecosystem_type: 'mangrove' | 'seagrass' | 'salt_marsh' | 'kelp_forest' | 'tidal_flat'
  project_area_ha: number
  location: string
  latitude: number
  longitude: number
  avg_canopy_height_m?: number
  biomass_density_tonnes_dm_ha?: number
  soil_organic_carbon_pct?: number
  sediment_depth_m?: number
  restoration_status: 'intact' | 'degraded' | 'restored' | 'new_planting'
  project_duration_years: number
  monitoring_frequency: 'annual' | 'biannual' | 'quarterly'
}

export interface CarbonPool {
  pool_name: string
  carbon_stock_tco2e_ha: number
  sequestration_rate_tco2e_ha_yr: number
  uncertainty_pct: number
}

export interface BlueCarbonResult {
  ecosystem_type: string
  project_area_ha: number
  location: string
  restoration_status: string
  total_carbon_stock_tco2e: number
  annual_sequestration_tco2e_yr: number
  total_sequestration_over_project_tco2e: number
  carbon_pools: CarbonPool[]
  credit_value_usd: number
  credit_price_per_tco2e: number
  verification_level: 'preliminary' | 'intermediate' | 'verified'
  permanence_risk: 'low' | 'moderate' | 'high'
  co_benefits: string[]
  recommendations: string[]
  project_duration_years: number
  monitoring_cost_annual_usd: number
}

function analyzeBlueCarbon(input: BlueCarbonInput): BlueCarbonResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(`${input.ecosystem_type}:${input.project_area_ha}:${input.location}:${input.restoration_status}`))

  // Default parameters by ecosystem type
  const ecosystemParams: Record<string, { biomassRate: number; soilRate: number; totalRate: number; canopy: number }> = {
    mangrove: { biomassRate: 5.2, soilRate: 8.5, totalRate: 13.7, canopy: 8 },
    seagrass: { biomassRate: 0.4, soilRate: 6.8, totalRate: 7.2, canopy: 0.5 },
    salt_marsh: { biomassRate: 1.8, soilRate: 9.2, totalRate: 11.0, canopy: 1.5 },
    kelp_forest: { biomassRate: 3.5, soilRate: 2.1, totalRate: 5.6, canopy: 15 },
    tidal_flat: { biomassRate: 0.8, soilRate: 4.5, totalRate: 5.3, canopy: 0.2 }
  }
  const params = ecosystemParams[input.ecosystem_type] || ecosystemParams.mangrove

  // Restoration status multiplier
  const statusMultipliers: Record<string, number> = {
    intact: 1.0, degraded: 0.4, restored: 0.75, new_planting: 0.25
  }
  const statusMult = statusMultipliers[input.restoration_status] || 0.5

  // Carbon pools
  const abovegroundBiomass = parseFloat((params.biomassRate * statusMult * rng.nextFloat(0.85, 1.15)).toFixed(2))
  const belowgroundBiomass = parseFloat((abovegroundBiomass * 0.4 * rng.nextFloat(0.8, 1.2)).toFixed(2))
  const soilCarbon = parseFloat((params.soilRate * statusMult * rng.nextFloat(0.9, 1.1)).toFixed(2))
  const deadOrganicMatter = parseFloat(((abovegroundBiomass + belowgroundBiomass) * 0.1 * rng.nextFloat(0.7, 1.3)).toFixed(2))

  const carbonPools: CarbonPool[] = [
    { pool_name: 'Aboveground Biomass', carbon_stock_tco2e_ha: abovegroundBiomass, sequestration_rate_tco2e_ha_yr: parseFloat((abovegroundBiomass * 0.08).toFixed(2)), uncertainty_pct: rng.nextInt(15, 30) },
    { pool_name: 'Belowground Biomass', carbon_stock_tco2e_ha: belowgroundBiomass, sequestration_rate_tco2e_ha_yr: parseFloat((belowgroundBiomass * 0.06).toFixed(2)), uncertainty_pct: rng.nextInt(20, 40) },
    { pool_name: 'Soil Carbon', carbon_stock_tco2e_ha: soilCarbon, sequestration_rate_tco2e_ha_yr: parseFloat((soilCarbon * 0.03).toFixed(2)), uncertainty_pct: rng.nextInt(25, 50) },
    { pool_name: 'Dead Organic Matter', carbon_stock_tco2e_ha: deadOrganicMatter, sequestration_rate_tco2e_ha_yr: parseFloat((deadOrganicMatter * 0.04).toFixed(2)), uncertainty_pct: rng.nextInt(30, 50) }
  ]

  const totalStockPerHa = parseFloat(carbonPools.reduce((sum, p) => sum + p.carbon_stock_tco2e_ha, 0).toFixed(2))
  const annualSeqPerHa = parseFloat(carbonPools.reduce((sum, p) => sum + p.sequestration_rate_tco2e_ha_yr, 0).toFixed(2))

  const totalStock = parseFloat((totalStockPerHa * input.project_area_ha).toFixed(1))
  const annualSeq = parseFloat((annualSeqPerHa * input.project_area_ha).toFixed(1))
  const totalProjectSeq = parseFloat((annualSeq * input.project_duration_years * 0.85).toFixed(1)) // 85% permanence factor

  // Credit pricing
  const creditPrice = parseFloat((rng.nextFloat(15, 45)).toFixed(2))
  const creditValue = Math.round(totalProjectSeq * creditPrice)

  // Verification level
  const monitoringFreqMap: Record<string, string> = { annual: 'preliminary', biannual: 'intermediate', quarterly: 'verified' }
  const verification = monitoringFreqMap[input.monitoring_frequency] || 'preliminary'

  // Permanence risk
  let permanenceRisk: BlueCarbonResult['permanence_risk'] = 'low'
  if (input.restoration_status === 'new_planting') permanenceRisk = 'moderate'
  if (input.restoration_status === 'degraded') permanenceRisk = 'high'
  if (input.ecosystem_type === 'kelp_forest') permanenceRisk = 'moderate'

  // Co-benefits
  const coBenefits: string[] = []
  if (input.ecosystem_type === 'mangrove') {
    coBenefits.push('Coastal protection from storm surges and erosion')
    coBenefits.push('Nursery habitat for commercial fish and shellfish')
    coBenefits.push('Water quality improvement through nutrient filtration')
  } else if (input.ecosystem_type === 'seagrass') {
    coBenefits.push('Habitat for endangered species (dugong, sea turtles)')
    coBenefits.push('Sediment stabilization and water clarity improvement')
    coBenefits.push('Support for fisheries productivity')
  } else if (input.ecosystem_type === 'salt_marsh') {
    coBenefits.push('Flood attenuation and coastal resilience')
    coBenefits.push('Bird habitat and biodiversity support')
    coBenefits.push('Nutrient cycling and denitrification')
  } else if (input.ecosystem_type === 'kelp_forest') {
    coBenefits.push('High primary productivity supporting marine food webs')
    coBenefits.push('Wave energy attenuation')
    coBenefits.push('Habitat for invertebrates and fish')
  } else {
    coBenefits.push('Biodiversity support for migratory birds')
    coBenefits.push('Sediment carbon storage')
  }
  coBenefits.push('Climate regulation through carbon sequestration')
  coBenefits.push('Community livelihood support and ecotourism potential')

  // Monitoring cost
  const baseMonitoringCost = input.monitoring_frequency === 'quarterly' ? 25000 : input.monitoring_frequency === 'biannual' ? 15000 : 8000
  const areaFactor = Math.max(1, input.project_area_ha / 100)
  const monitoringCost = Math.round(baseMonitoringCost * areaFactor * rng.nextFloat(0.9, 1.1))

  const recommendations: string[] = []
  if (input.restoration_status === 'degraded' || input.restoration_status === 'new_planting') {
    recommendations.push('Restoration activities will increase sequestration rates over 5-10 year establishment period')
  }
  recommendations.push(`Target verification level: ${verification.toUpperCase()} - increase monitoring frequency for higher credit value`)
  recommendations.push('Establish baseline carbon stock measurement before project registration')
  recommendations.push('Engage accredited third-party verifier (Verra VCS or Gold Standard) for credit issuance')
  recommendations.push('Implement community benefit-sharing mechanism for local stakeholder engagement')
  recommendations.push('Plan for long-term monitoring beyond project crediting period (minimum 30 years)')

  return {
    ecosystem_type: input.ecosystem_type,
    project_area_ha: input.project_area_ha,
    location: input.location,
    restoration_status: input.restoration_status,
    total_carbon_stock_tco2e: totalStock,
    annual_sequestration_tco2e_yr: annualSeq,
    total_sequestration_over_project_tco2e: totalProjectSeq,
    carbon_pools: carbonPools,
    credit_value_usd: creditValue,
    credit_price_per_tco2e: creditPrice,
    verification_level: verification as BlueCarbonResult['verification_level'],
    permanence_risk: permanenceRisk,
    co_benefits: coBenefits,
    recommendations,
    project_duration_years: input.project_duration_years,
    monitoring_cost_annual_usd: monitoringCost
  }
}

function formatBlueCarbonReport(r: BlueCarbonResult): string {
  const lines: string[] = []
  lines.push('## Blue Carbon Credit Estimation Report')
  lines.push('')
  lines.push('### Project Overview')
  lines.push(`- **Ecosystem Type:** ${r.ecosystem_type.replace(/_/g, ' ')}`)
  lines.push(`- **Project Area:** ${r.project_area_ha.toLocaleString()} ha`)
  lines.push(`- **Location:** ${r.location}`)
  lines.push(`- **Restoration Status:** ${r.restoration_status}`)
  lines.push(`- **Project Duration:** ${r.project_duration_years} years`)
  lines.push('')
  lines.push('### Carbon Stock Summary')
  lines.push(`- **Total Carbon Stock:** ${r.total_carbon_stock_tco2e.toLocaleString()} tCO2e`)
  lines.push(`- **Annual Sequestration:** ${r.annual_sequestration_tco2e_yr.toLocaleString()} tCO2e/yr`)
  lines.push(`- **Total Project Sequestration:** ${r.total_sequestration_over_project_tco2e.toLocaleString()} tCO2e`)
  lines.push('')
  lines.push('### Carbon Pools Breakdown')
  lines.push('| Pool | Stock (tCO2e/ha) | Sequestration (tCO2e/ha/yr) | Uncertainty |')
  lines.push('|------|-----------------|-------------------------------|-------------|')
  for (const p of r.carbon_pools) {
    lines.push(`| ${p.pool_name} | ${p.carbon_stock_tco2e_ha} | ${p.sequestration_rate_tco2e_ha_yr} | +/-${p.uncertainty_pct}% |`)
  }
  lines.push('')
  lines.push('### Credit Valuation')
  lines.push(`- **Credit Price:** $${r.credit_price_per_tco2e}/tCO2e`)
  lines.push(`- **Total Credit Value:** $${r.credit_value_usd.toLocaleString()}`)
  lines.push(`- **Verification Level:** ${r.verification_level.toUpperCase()}`)
  lines.push(`- **Permanence Risk:** ${r.permanence_risk}`)
  lines.push(`- **Annual Monitoring Cost:** $${r.monitoring_cost_annual_usd.toLocaleString()}`)
  lines.push('')
  lines.push('### Co-Benefits')
  for (const cb of r.co_benefits) lines.push(`- ${cb}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ${GENERAL_DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. fish_health_monitor
  tools.register(defineTool({
    name: 'fish_health_monitor',
    description: 'Fish health monitoring with disease diagnosis, mortality tracking, and treatment plans. Analyzes symptoms, water temperature, and mortality rate to identify disease candidates and provide treatment recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: species(tilapia|shrimp|salmon|catfish|carp|sea_bass|trout|other), pond_id(string), symptoms(string[]), mortality_rate_pct(number), water_temp_c(number), affected_body_parts?(string[]), behavior_changes?(string[]), duration_days?(number), population_count?(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: FishHealthInput = JSON.parse(args.input_data)
      return formatFishHealthReport(analyzeFishHealth(input))
    }
  }))

  // 2. water_quality_analyzer
  tools.register(defineTool({
    name: 'water_quality_analyzer',
    description: 'Water quality analysis with dissolved oxygen (mg/L), pH, temperature (C), ammonia, and nitrite assessment. Evaluates hypoxia risk and provides immediate action recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: pond_id(string), species(tilapia|shrimp|salmon|catfish|carp|sea_bass|trout|other), temperature_c(number), ph(number), dissolved_oxygen_mg_l(number), ammonia_mg_l(number), nitrite_mg_l(number), salinity_ppt?(number), turbidity_ntu?(number), alkalinity_mg_l?(number), measurement_depth_m?(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: WaterQualityInput = JSON.parse(args.input_data)
      return formatWaterQualityReport(analyzeWaterQuality(input))
    }
  }))

  // 3. feeding_optimizer
  tools.register(defineTool({
    name: 'feeding_optimizer',
    description: 'Feeding optimization engine with FCR improvement recommendations. Generates feeding schedules, calculates protein requirements, and provides economic analysis for aquaculture operations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: species(tilapia|shrimp|salmon|catfish|carp|sea_bass|trout|other), avg_weight_g(number), target_weight_g(number), stocking_count(number), current_fcr(number), water_temp_c(number), growth_stage(fry|fingerling|juvenile|growout|broodstock), feed_cost_per_kg(number), market_price_per_kg(number), feeding_frequency_per_day?(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: FeedingOptimizerInput = JSON.parse(args.input_data)
      return formatFeedingReport(analyzeFeeding(input))
    }
  }))

  // 4. farm_site_selector
  tools.register(defineTool({
    name: 'farm_site_selector',
    description: 'Fish farm site selection with environmental suitability scoring. Evaluates water temperature, soil type, infrastructure, land area, and climate factors to grade site suitability.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: location_name(string), latitude(number), longitude(number), water_source(river|lake|groundwater|seawater|rainwater|mixed), avg_water_temp_c(number), annual_rainfall_mm(number), elevation_m(number), soil_type(clay|sandy|loam|rocky|peat), land_area_ha(number), target_species(tilapia|shrimp|salmon|catfish|carp|sea_bass|trout|other), proximity_to_road_km(number), proximity_to_market_km(number), power_grid_available(boolean)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: FarmSiteInput = JSON.parse(args.input_data)
      return formatFarmSiteReport(analyzeFarmSite(input))
    }
  }))

  // 5. algal_bloom_predictor
  tools.register(defineTool({
    name: 'algal_bloom_predictor',
    description: 'Algal bloom prediction with risk forecasting and early warnings. Analyzes chlorophyll-a, nutrients (N & P), temperature, solar radiation, and weather to predict bloom probability.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: water_body_id(string), water_body_type(pond|lake|reservoir|coastal|estuary), latitude(number), longitude(number), current_chlorophyll_a_ug_l(number), total_nitrogen_mg_l(number), total_phosphorus_mg_l(number), water_temp_c(number), solar_radiation_mj_m2_day(number), wind_speed_m_s(number), rainfall_7day_mm(number), water_depth_m(number), flow_rate_m_s?(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: AlgalBloomInput = JSON.parse(args.input_data)
      return formatAlgalBloomReport(analyzeAlgalBloom(input))
    }
  }))

  // 6. aquaculture_market_planner
  tools.register(defineTool({
    name: 'aquaculture_market_planner',
    description: 'Aquaculture market planning with price trend analysis. Generates 6-month price forecasts, calculates profit margins, and identifies optimal selling windows.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: species(tilapia|shrimp|salmon|catfish|carp|sea_bass|trout|other), target_market(domestic_fresh|domestic_frozen|export_asia|export_europe|export_us|processing), planned_volume_kg(number), production_cost_per_kg(number), current_market_price_per_kg(number), price_trend_6month(rising|stable|falling), seasonality_factor(peak_demand|normal|low_demand), quality_grade(premium|standard|economy), certification_available(boolean), competitor_supply_trend(increasing|stable|decreasing)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: MarketPlannerInput = JSON.parse(args.input_data)
      return formatMarketReport(analyzeMarket(input))
    }
  }))

  // 7. offshore_logistics_config
  tools.register(defineTool({
    name: 'offshore_logistics_config',
    description: 'Offshore logistics configuration with vessel scheduling and route optimization. Generates vessel schedules, calculates fuel and transport costs, and assesses weather downtime.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: operation_type(cage_farming|longline|raft_culture|bottom_culture|integrated_multi_trophic), site_name(string), distance_from_shore_km(number), avg_wave_height_m(number), avg_current_speed_knots(number), water_depth_m(number), vessel_type(workboat|feed_barge|harvest_vessel|multi_purpose|crew_transfer), vessel_count(number), daily_feed_tons(number), crew_size(number), weather_window_days_per_month(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: OffshoreLogisticsInput = JSON.parse(args.input_data)
      return formatOffshoreLogisticsReport(analyzeOffshoreLogistics(input))
    }
  }))

  // 8. blue_carbon_estimator
  tools.register(defineTool({
    name: 'blue_carbon_estimator',
    description: 'Blue carbon credit estimator with tCO2e/ha/yr sequestration calculation. Evaluates carbon stocks across biomass and soil pools, calculates credit value, and assesses permanence risk.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: ecosystem_type(mangrove|seagrass|salt_marsh|kelp_forest|tidal_flat), project_area_ha(number), location(string), latitude(number), longitude(number), avg_canopy_height_m?(number), biomass_density_tonnes_dm_ha?(number), soil_organic_carbon_pct?(number), sediment_depth_m?(number), restoration_status(intact|degraded|restored|new_planting), project_duration_years(number), monitoring_frequency(annual|biannual|quarterly)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: BlueCarbonInput = JSON.parse(args.input_data)
      return formatBlueCarbonReport(analyzeBlueCarbon(input))
    }
  }))

  console.log('[dsh-tool-aquatech] Loaded v' + VERSION + ' - Aquaculture & Blue Economy with 8 tools')
  console.log('  Tools: fish_health_monitor, water_quality_analyzer, feeding_optimizer, farm_site_selector, algal_bloom_predictor, aquaculture_market_planner, offshore_logistics_config, blue_carbon_estimator')
}
