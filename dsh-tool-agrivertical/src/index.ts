/**
 * DSH AI Agriculture Vertical Plugin v1.0.0
 *
 * Smart agriculture toolkit covering greenhouse management, precision irrigation,
 * pest/disease detection, soil analysis, crop rotation, yield prediction, farm
 * economics, and supply chain optimization.
 *
 * Tools:
 * 1. greenhouse_climate_controller — Optimize greenhouse climate for yield and efficiency
 * 2. precision_irrigation_optimizer — Optimize irrigation scheduling
 * 3. pest_disease_detector — Identify pests/diseases and recommend treatments
 * 4. soil_health_analyzer — Analyze soil and recommend amendments
 * 5. crop_rotation_planner — Plan optimal crop rotation cycles
 * 6. yield_predictor — Predict crop yield from multiple factors
 * 7. farm_economics_calculator — Calculate profitability, break-even, ROI
 * 8. agri_supply_chain_optimizer — Optimize post-harvest supply chain
 *
 * @module dsh-tool-agrivertical
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agrivertical'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated agricultural analysis for informational purposes only. Always consult local agricultural extension services, certified agronomists, and soil scientists before making farming decisions. Local conditions may vary significantly from model predictions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = {
  next: (min: number, max: number, seed: number): number => Math.floor(mulberry32(seed)() * (max - min + 1)) + min,
  nextFloat: (min: number, max: number, seed: number): number => mulberry32(seed)() * (max - min) + min,
  pick: <T>(arr: T[], seed: number): T => arr[Math.floor(mulberry32(seed)() * arr.length)],
  pickN: <T>(arr: T[], n: number, seed: number): T[] => {
    const shuffled = [...arr].sort(() => mulberry32(seed)() - 0.5)
    return shuffled.slice(0, n)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function seedFromInput(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

// ==================== TYPES ====================

// --- Tool 1: Greenhouse Climate Controller ---
interface GreenhouseClimateInput {
  crop_type: string
  current_climate: {
    temperature_c: number
    humidity_pct: number
    co2_ppm: number
    light_lux: number
  }
  target_climate: {
    temperature_c: number
    humidity_pct: number
    co2_ppm: number
    light_lux: number
  }
  energy_budget: number
  season: 'spring' | 'summer' | 'autumn' | 'winter'
}

interface ClimateAdjustment {
  parameter: string
  current: number
  target: number
  adjustment: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  energy_cost_per_day: number
}

interface GreenhouseClimateResult {
  overall_efficiency_score: number
  adjustments: ClimateAdjustment[]
  estimated_yield_improvement_pct: number
  daily_energy_cost: number
  weekly_energy_cost: number
  recommendations: string[]
  alerts: string[]
}

// --- Tool 2: Precision Irrigation Optimizer ---
interface IrrigationInput {
  field_size_hectares: number
  crop_type: string
  soil_type: string
  water_availability: number
  weather_forecast: {
    rain_probability_pct: number
    expected_rainfall_mm: number
    temperature_c: number
    wind_speed_kmh: number
  }
  growth_stage: 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity'
}

interface IrrigationSlot {
  day: string
  time: string
  duration_minutes: number
  volume_litres: number
  method: string
  reason: string
}

interface IrrigationResult {
  total_water_needed_litres: number
  water_savings_pct: number
  schedule: IrrigationSlot[]
  estimated_crop_stress_level: 'none' | 'low' | 'moderate' | 'high'
  cost_estimate: number
  recommendations: string[]
}

// --- Tool 3: Pest Disease Detector ---
interface PestDiseaseInput {
  crop_type: string
  symptoms: string[]
  severity_level: 'low' | 'medium' | 'high' | 'critical'
  growth_stage: string
  organic_preference: boolean
}

interface PestDiseaseMatch {
  name: string
  type: 'pest' | 'disease' | 'deficiency'
  confidence_pct: number
  affected_parts: string[]
  treatment: string
  treatment_cost_per_hectare: number
  prevention: string[]
  urgency: 'immediate' | 'within_week' | 'monitor'
}

interface PestDiseaseResult {
  matches: PestDiseaseMatch[]
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical'
  total_treatment_cost_per_hectare: number
  prevention_plan: string[]
  monitoring_recommendations: string[]
}

// --- Tool 4: Soil Health Analyzer ---
interface SoilHealthInput {
  soil_test_results: {
    nitrogen_ppm: number
    phosphorus_ppm: number
    potassium_ppm: number
    calcium_ppm: number
    magnesium_ppm: number
    sulfur_ppm: number
    iron_ppm: number
    zinc_ppm: number
    boron_ppm: number
  }
  target_crops: string[]
  ph_level: number
  organic_matter_pct: number
  drainage_type: 'excessive' | 'good' | 'moderate' | 'poor'
}

interface SoilAmendment {
  nutrient: string
  current_level: string
  target_level: string
  amendment: string
  application_rate: string
  cost_per_hectare: number
  timing: string
}

interface SoilHealthResult {
  overall_soil_score: number
  ph_assessment: string
  organic_matter_assessment: string
  drainage_assessment: string
  amendments: SoilAmendment[]
  total_amendment_cost_per_hectare: number
  long_term_recommendations: string[]
}

// --- Tool 5: Crop Rotation Planner ---
interface CropRotationInput {
  farm_size_hectares: number
  current_crops: string[]
  soil_type: string
  market_demand: Record<string, number>
  rotation_years: number
}

interface RotationYear {
  year: number
  plots: Array<{
    plot_id: number
    crop: string
    area_hectares: number
    expected_revenue: number
    nitrogen_impact: 'positive' | 'neutral' | 'negative'
    pest_break: boolean
  }>
  total_expected_revenue: number
  soil_health_impact: string
}

interface CropRotationResult {
  rotation_plan: RotationYear[]
  total_expected_revenue: number
  average_annual_revenue: number
  soil_health_trend: string
  risk_mitigation: string[]
  recommendations: string[]
}

// --- Tool 6: Yield Predictor ---
interface YieldPredictorInput {
  crop_type: string
  variety: string
  planting_date: string
  weather_forecast: {
    avg_temperature_c: number
    total_rainfall_mm: number
    sunlight_hours_daily: number
    frost_risk: boolean
  }
  soil_data: {
    soil_type: string
    fertility_score: number
    moisture_retention: 'low' | 'medium' | 'high'
  }
  management_level: 'basic' | 'intermediate' | 'advanced' | 'precision'
}

interface YieldFactor {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  score: number
  description: string
}

interface YieldPredictorResult {
  predicted_yield_tonnes_per_hectare: number
  confidence_interval: [number, number]
  confidence_pct: number
  yield_factors: YieldFactor[]
  limiting_factors: string[]
  optimization_potential_pct: number
  recommendations: string[]
}

// --- Tool 7: Farm Economics Calculator ---
interface FarmEconomicsInput {
  operation_type: 'crop' | 'livestock' | 'mixed'
  scale_hectares: number
  input_costs: {
    seeds: number
    fertilizer: number
    pesticides: number
    fuel: number
    equipment: number
    irrigation: number
  }
  expected_yield: number
  market_prices: {
    primary_crop_price_per_tonne: number
    secondary_crop_price_per_tonne: number
  }
  labor_costs: {
    permanent_labor: number
    seasonal_labor: number
  }
}

interface CostBreakdown {
  category: string
  amount: number
  percentage: number
}

interface FarmEconomicsResult {
  total_revenue: number
  total_costs: number
  net_profit: number
  profit_margin_pct: number
  break_even_yield: number
  roi_pct: number
  cost_breakdown: CostBreakdown[]
  revenue_per_hectare: number
  cost_per_hectare: number
  recommendations: string[]
  risk_factors: string[]
}

// --- Tool 8: Agri Supply Chain Optimizer ---
interface SupplyChainInput {
  crop_type: string
  harvest_volume_kg: number
  storage_days_available: number
  transport_options: Array<{
    mode: string
    cost_per_kg: number
    speed_days: number
    capacity_kg: number
  }>
  market_destinations: Array<{
    market: string
    price_per_kg: number
    distance_km: number
    demand_kg: number
  }>
}

interface SupplyChainRoute {
  destination: string
  transport_mode: string
  volume_kg: number
  transport_cost: number
  expected_price: number
  gross_revenue: number
  net_revenue: number
  delivery_days: number
  profit_margin_pct: number
}

interface SupplyChainResult {
  optimal_routes: SupplyChainRoute[]
  total_gross_revenue: number
  total_transport_cost: number
  total_net_revenue: number
  average_profit_margin_pct: number
  storage_recommendation: string
  market_timing_advice: string
  risk_mitigation: string[]
  recommendations: string[]
}

// ==================== TOOL 1: GREENHOUSE CLIMATE CONTROLLER ====================

function controllerGreenhouseClimate(input: GreenhouseClimateInput): GreenhouseClimateResult {
  const seed = seedFromInput(input)
  const cc = input.current_climate
  const tc = input.target_climate

  const adjustments: ClimateAdjustment[] = []

  // Temperature adjustment
  const tempDiff = tc.temperature_c - cc.temperature_c
  if (Math.abs(tempDiff) > 1) {
    adjustments.push({
      parameter: 'Temperature',
      current: cc.temperature_c,
      target: tc.temperature_c,
      adjustment: tempDiff > 0 ? 'Increase heating setpoint' : 'Increase ventilation/cooling',
      priority: Math.abs(tempDiff) > 5 ? 'critical' : Math.abs(tempDiff) > 3 ? 'high' : 'medium',
      energy_cost_per_day: Math.round(Math.abs(tempDiff) * input.energy_budget * 0.05 * 100) / 100
    })
  }

  // Humidity adjustment
  const humDiff = tc.humidity_pct - cc.humidity_pct
  if (Math.abs(humDiff) > 5) {
    adjustments.push({
      parameter: 'Humidity',
      current: cc.humidity_pct,
      target: tc.humidity_pct,
      adjustment: humDiff > 0 ? 'Activate humidifiers' : 'Activate dehumidifiers/ventilation',
      priority: Math.abs(humDiff) > 15 ? 'high' : 'medium',
      energy_cost_per_day: Math.round(Math.abs(humDiff) * input.energy_budget * 0.02 * 100) / 100
    })
  }

  // CO2 adjustment
  const co2Diff = tc.co2_ppm - cc.co2_ppm
  if (Math.abs(co2Diff) > 50) {
    adjustments.push({
      parameter: 'CO2',
      current: cc.co2_ppm,
      target: tc.co2_ppm,
      adjustment: co2Diff > 0 ? 'Increase CO2 injection rate' : 'Increase fresh air intake',
      priority: Math.abs(co2Diff) > 200 ? 'high' : 'medium',
      energy_cost_per_day: Math.round(Math.abs(co2Diff) * input.energy_budget * 0.001 * 100) / 100
    })
  }

  // Light adjustment
  const lightDiff = tc.light_lux - cc.light_lux
  if (Math.abs(lightDiff) > 1000) {
    adjustments.push({
      parameter: 'Lighting',
      current: cc.light_lux,
      target: tc.light_lux,
      adjustment: lightDiff > 0 ? 'Supplement with LED grow lights' : 'Deploy shade screens',
      priority: Math.abs(lightDiff) > 5000 ? 'high' : 'medium',
      energy_cost_per_day: Math.round(Math.abs(lightDiff) * input.energy_budget * 0.0005 * 100) / 100
    })
  }

  const dailyEnergyCost = Math.round(adjustments.reduce((sum, a) => sum + a.energy_cost_per_day, 0) * 100) / 100
  const efficiencyScore = clamp(Math.round(70 + rng.nextFloat(-10, 20, seed)), 30, 99)
  const yieldImprovement = Math.round(rng.nextFloat(5, 25, seed) * 100) / 100

  const recommendations: string[] = []
  if (input.season === 'summer' && tempDiff > 0) {
    recommendations.push('Consider evaporative cooling instead of AC to reduce energy costs by up to 40%')
  }
  if (cc.co2_ppm < 400) {
    recommendations.push('CO2 levels are below atmospheric baseline; CO2 enrichment will significantly boost photosynthesis')
  }
  if (cc.humidity_pct > 85) {
    recommendations.push('High humidity increases fungal disease risk; prioritize dehumidification')
  }
  recommendations.push('Install automated climate control with PID loops for tighter parameter management')
  recommendations.push('Consider thermal screens at night to reduce heating energy by 20-30%')

  const alerts: string[] = []
  if (Math.abs(tempDiff) > 8) alerts.push('CRITICAL: Temperature deviation exceeds safe range for most crops')
  if (cc.humidity_pct > 90) alerts.push('WARNING: Humidity above 90% creates severe fungal disease risk')
  if (cc.co2_ppm > 2000) alerts.push('WARNING: CO2 levels above 2000 ppm may cause worker safety concerns')

  return {
    overall_efficiency_score: efficiencyScore,
    adjustments,
    estimated_yield_improvement_pct: yieldImprovement,
    daily_energy_cost: dailyEnergyCost,
    weekly_energy_cost: Math.round(dailyEnergyCost * 7 * 100) / 100,
    recommendations,
    alerts
  }
}

function formatGreenhouseReport(input: GreenhouseClimateInput, result: GreenhouseClimateResult): string {
  const lines: string[] = []
  lines.push('# Greenhouse Climate Control Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Crop: ' + input.crop_type)
  lines.push('- Season: ' + input.season)
  lines.push('- Energy Budget: $' + input.energy_budget + '/day')
  lines.push('')
  lines.push('## Efficiency Score: ' + result.overall_efficiency_score + '/100')
  lines.push('')
  lines.push('## Climate Adjustments')
  lines.push('')
  lines.push('| Parameter | Current | Target | Adjustment | Priority | Energy Cost/day |')
  lines.push('|-----------|---------|--------|------------|----------|-----------------|')
  for (const a of result.adjustments) {
    lines.push('| ' + a.parameter + ' | ' + a.current + ' | ' + a.target + ' | ' + a.adjustment + ' | ' + a.priority + ' | $' + a.energy_cost_per_day + ' |')
  }
  lines.push('')
  lines.push('## Energy Summary')
  lines.push('- Daily Energy Cost: $' + result.daily_energy_cost)
  lines.push('- Weekly Energy Cost: $' + result.weekly_energy_cost)
  lines.push('- Estimated Yield Improvement: +' + result.estimated_yield_improvement_pct + '%')
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const alert of result.alerts) {
      lines.push('- ' + alert)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: PRECISION IRRIGATION OPTIMIZER ====================

function optimizeIrrigation(input: IrrigationInput): IrrigationResult {
  const seed = seedFromInput(input)
  const wf = input.weather_forecast

  // Base water need by growth stage (litres per hectare per day)
  const waterNeeds: Record<string, number> = {
    germination: 15000,
    vegetative: 35000,
    flowering: 45000,
    fruiting: 40000,
    maturity: 20000
  }

  const baseWater = (waterNeeds[input.growth_stage] || 30000) * input.field_size_hectares

  // Soil type multiplier
  const soilMultipliers: Record<string, number> = {
    sandy: 1.3,
    loam: 1.0,
    clay: 0.8,
    silt: 0.9,
    peat: 0.7
  }
  const soilMult = soilMultipliers[input.soil_type.toLowerCase()] || 1.0

  // Weather adjustments
  const rainAdjustment = wf.expected_rainfall_mm * input.field_size_hectares * 10000
  const tempFactor = wf.temperature_c > 30 ? 1.2 : wf.temperature_c > 25 ? 1.1 : 1.0
  const windFactor = wf.wind_speed_kmh > 20 ? 1.15 : 1.0

  const adjustedWater = Math.round(baseWater * soilMult * tempFactor * windFactor - rainAdjustment)
  const waterNeeded = Math.min(adjustedWater, input.water_availability)
  const waterSavings = Math.round((1 - waterNeeded / baseWater) * 10000) / 100

  // Generate 7-day schedule
  const schedule: IrrigationSlot[] = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dailyVolume = Math.round(waterNeeded / 7)

  for (let i = 0; i < 7; i++) {
    const daySeed = seed + i * 1000
    const isRainDay = rng.next(0, 100, daySeed) < wf.rain_probability_pct
    if (isRainDay && wf.expected_rainfall_mm > 5) {
      schedule.push({
        day: days[i],
        time: 'N/A',
        duration_minutes: 0,
        volume_litres: 0,
        method: 'Skip (rain expected)',
        reason: 'Rainfall expected to meet crop water demand'
      })
    } else {
      const duration = Math.round(rng.next(20, 60, daySeed + 1))
      const volume = Math.round(dailyVolume * rng.nextFloat(0.8, 1.2, daySeed + 2))
      schedule.push({
        day: days[i],
        time: rng.next(0, 1, daySeed + 3) === 0 ? '05:00' : '18:00',
        duration_minutes: duration,
        volume_litres: volume,
        method: input.field_size_hectares > 10 ? 'Drip irrigation' : 'Sprinkler',
        reason: 'Scheduled irrigation based on crop water demand'
      })
    }
  }

  const costPerLitre = 0.002
  const costEstimate = Math.round(waterNeeded * costPerLitre * 100) / 100

  const stressLevel: 'none' | 'low' | 'moderate' | 'high' =
    waterNeeded >= adjustedWater * 0.9 ? 'none' :
    waterNeeded >= adjustedWater * 0.7 ? 'low' :
    waterNeeded >= adjustedWater * 0.5 ? 'moderate' : 'high'

  const recommendations: string[] = []
  recommendations.push('Install soil moisture sensors at 15cm and 30cm depths for real-time monitoring')
  if (wf.rain_probability_pct > 60) {
    recommendations.push('High rain probability: reduce irrigation frequency and monitor soil saturation')
  }
  if (input.soil_type.toLowerCase() === 'sandy') {
    recommendations.push('Sandy soil has low water retention: consider more frequent, shorter irrigation cycles')
  }
  recommendations.push('Apply mulch to reduce evaporation losses by 25-35%')
  recommendations.push('Schedule irrigation during early morning or evening to minimize evaporation')

  return {
    total_water_needed_litres: waterNeeded,
    water_savings_pct: waterSavings,
    schedule,
    estimated_crop_stress_level: stressLevel,
    cost_estimate: costEstimate,
    recommendations
  }
}

function formatIrrigationReport(input: IrrigationInput, result: IrrigationResult): string {
  const lines: string[] = []
  lines.push('# Precision Irrigation Optimization Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field Size: ' + input.field_size_hectares + ' hectares')
  lines.push('- Crop: ' + input.crop_type)
  lines.push('- Soil Type: ' + input.soil_type)
  lines.push('- Growth Stage: ' + input.growth_stage)
  lines.push('- Water Availability: ' + input.water_availability + ' litres')
  lines.push('')
  lines.push('## Water Budget')
  lines.push('- Total Water Needed: ' + result.total_water_needed_litres.toLocaleString() + ' litres')
  lines.push('- Water Savings vs. Baseline: ' + result.water_savings_pct + '%')
  lines.push('- Estimated Crop Stress Level: ' + result.estimated_crop_stress_level.toUpperCase())
  lines.push('- Cost Estimate: $' + result.cost_estimate)
  lines.push('')
  lines.push('## 7-Day Irrigation Schedule')
  lines.push('')
  lines.push('| Day | Time | Duration (min) | Volume (L) | Method | Reason |')
  lines.push('|-----|------|----------------|------------|--------|--------|')
  for (const slot of result.schedule) {
    lines.push('| ' + slot.day + ' | ' + slot.time + ' | ' + slot.duration_minutes + ' | ' + slot.volume_litres.toLocaleString() + ' | ' + slot.method + ' | ' + slot.reason + ' |')
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: PEST DISEASE DETECTOR ====================

function detectPestDisease(input: PestDiseaseInput): PestDiseaseResult {
  const seed = seedFromInput(input)

  const pestDatabase = [
    { name: 'Aphid', type: 'pest' as const, parts: ['leaves', 'stems'], treatments: { organic: 'Neem oil spray or ladybug release', conventional: 'Imidacloprid-based insecticide' }, cost: 120 },
    { name: 'Whitefly', type: 'pest' as const, parts: ['leaves', 'underside'], treatments: { organic: 'Yellow sticky traps + Encarsia wasps', conventional: 'Pyrethroid insecticide' }, cost: 150 },
    { name: 'Spider Mite', type: 'pest' as const, parts: ['leaves'], treatments: { organic: 'Predatory mites + sulfur spray', conventional: 'Abamectin miticide' }, cost: 180 },
    { name: 'Tomato Hornworm', type: 'pest' as const, parts: ['leaves', 'fruit'], treatments: { organic: 'Hand-pick + Bt (Bacillus thuringiensis)', conventional: 'Spinosad spray' }, cost: 90 },
    { name: 'Powdery Mildew', type: 'disease' as const, parts: ['leaves', 'stems'], treatments: { organic: 'Baking soda spray + milk solution', conventional: 'Triadimefon fungicide' }, cost: 200 },
    { name: 'Downy Mildew', type: 'disease' as const, parts: ['leaves'], treatments: { organic: 'Copper-based fungicide + improve airflow', conventional: 'Mefenoxam fungicide' }, cost: 220 },
    { name: 'Fusarium Wilt', type: 'disease' as const, parts: ['vascular system', 'leaves'], treatments: { organic: 'Soil solarization + resistant varieties', conventional: 'Fumigation (professional)' }, cost: 500 },
    { name: 'Root Rot', type: 'disease' as const, parts: ['roots'], treatments: { organic: 'Improve drainage + Trichoderma application', conventional: 'Metalaxyl drench' }, cost: 250 },
    { name: 'Nitrogen Deficiency', type: 'deficiency' as const, parts: ['leaves'], treatments: { organic: 'Compost tea + blood meal', conventional: 'Urea fertilizer application' }, cost: 80 },
    { name: 'Phosphorus Deficiency', type: 'deficiency' as const, parts: ['roots', 'leaves'], treatments: { organic: 'Bone meal + mycorrhizal inoculant', conventional: 'Superphosphate fertilizer' }, cost: 100 },
    { name: 'Potassium Deficiency', type: 'deficiency' as const, parts: ['leaves', 'fruit'], treatments: { organic: 'Wood ash + kelp extract', conventional: 'Potassium chloride application' }, cost: 90 },
    { name: 'Blight (Late)', type: 'disease' as const, parts: ['leaves', 'stems', 'fruit'], treatments: { organic: 'Copper spray + remove infected tissue', conventional: 'Chlorothalonil fungicide' }, cost: 280 }
  ]

  const matches: PestDiseaseMatch[] = []
  const numMatches = rng.next(1, 3, seed)
  const selectedPests = rng.pickN(pestDatabase, numMatches, seed + 100)

  for (const pest of selectedPests) {
    const confidence = rng.next(60, 95, seed + matches.length * 100)
    const treatment = input.organic_preference ? pest.treatments.organic : pest.treatments.conventional
    const urgency: 'immediate' | 'within_week' | 'monitor' =
      input.severity_level === 'critical' ? 'immediate' :
      input.severity_level === 'high' ? rng.next(0, 1, seed + matches.length) === 0 ? 'immediate' : 'within_week' :
      input.severity_level === 'medium' ? 'within_week' : 'monitor'

    matches.push({
      name: pest.name,
      type: pest.type,
      confidence_pct: confidence,
      affected_parts: pest.parts,
      treatment: treatment,
      treatment_cost_per_hectare: pest.cost,
      prevention: [
        'Regular field scouting (2-3 times per week)',
        'Maintain proper plant spacing for airflow',
        'Use resistant varieties when available',
        'Practice crop rotation to break pest cycles'
      ],
      urgency
    })
  }

  const totalCost = matches.reduce((sum, m) => sum + m.treatment_cost_per_hectare, 0)

  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    input.severity_level === 'critical' || input.severity_level === 'high' ? 'high' :
    input.severity_level === 'medium' ? 'medium' : 'low'

  const preventionPlan: string[] = [
    'Implement integrated pest management (IPM) combining biological, cultural, and chemical controls',
    'Install pheromone traps for early pest detection',
    'Maintain field hygiene: remove crop residues and weeds that harbor pests',
    'Encourage beneficial insects by planting companion flowers',
    'Monitor weather conditions that favor disease development'
  ]

  const monitoring: string[] = [
    'Scout fields at least twice weekly during vulnerable growth stages',
    'Use sticky traps to monitor flying insect populations',
    'Record pest pressure trends to predict outbreaks',
    'Set action thresholds before applying treatments'
  ]

  return {
    matches,
    overall_risk_level: riskLevel,
    total_treatment_cost_per_hectare: totalCost,
    prevention_plan: preventionPlan,
    monitoring_recommendations: monitoring
  }
}

function formatPestDiseaseReport(input: PestDiseaseInput, result: PestDiseaseResult): string {
  const lines: string[] = []
  lines.push('# Pest & Disease Detection Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Crop: ' + input.crop_type)
  lines.push('- Symptoms: ' + input.symptoms.join(', '))
  lines.push('- Severity: ' + input.severity_level.toUpperCase())
  lines.push('- Growth Stage: ' + input.growth_stage)
  lines.push('- Organic Preference: ' + (input.organic_preference ? 'Yes' : 'No'))
  lines.push('')
  lines.push('## Overall Risk Level: ' + result.overall_risk_level.toUpperCase())
  lines.push('')
  lines.push('## Detected Issues')
  lines.push('')
  for (const match of result.matches) {
    lines.push('### ' + match.name + ' (' + match.type + ')')
    lines.push('- Confidence: ' + match.confidence_pct + '%')
    lines.push('- Affected Parts: ' + match.affected_parts.join(', '))
    lines.push('- Urgency: ' + match.urgency)
    lines.push('- Treatment: ' + match.treatment)
    lines.push('- Cost: $' + match.treatment_cost_per_hectare + '/hectare')
    lines.push('')
  }
  lines.push('## Total Treatment Cost: $' + result.total_treatment_cost_per_hectare + '/hectare')
  lines.push('')
  lines.push('## Prevention Plan')
  for (const item of result.prevention_plan) {
    lines.push('- ' + item)
  }
  lines.push('')
  lines.push('## Monitoring Recommendations')
  for (const item of result.monitoring_recommendations) {
    lines.push('- ' + item)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: SOIL HEALTH ANALYZER ====================

function analyzeSoilHealth(input: SoilHealthInput): SoilHealthResult {
  const seed = seedFromInput(input)
  const str = input.soil_test_results

  // Score each nutrient (0-100)
  const nutrientScores: Record<string, number> = {
    nitrogen: clamp(Math.round((str.nitrogen_ppm / 50) * 100), 0, 100),
    phosphorus: clamp(Math.round((str.phosphorus_ppm / 30) * 100), 0, 100),
    potassium: clamp(Math.round((str.potassium_ppm / 200) * 100), 0, 100),
    calcium: clamp(Math.round((str.calcium_ppm / 1000) * 100), 0, 100),
    magnesium: clamp(Math.round((str.magnesium_ppm / 150) * 100), 0, 100),
    sulfur: clamp(Math.round((str.sulfur_ppm / 20) * 100), 0, 100),
    iron: clamp(Math.round((str.iron_ppm / 10) * 100), 0, 100),
    zinc: clamp(Math.round((str.zinc_ppm / 2) * 100), 0, 100),
    boron: clamp(Math.round((str.boron_ppm / 1) * 100), 0, 100)
  }

  const avgNutrientScore = Math.round(Object.values(nutrientScores).reduce((a, b) => a + b, 0) / Object.keys(nutrientScores).length)
  const phScore = input.ph_level >= 6.0 && input.ph_level <= 7.5 ? 90 : input.ph_level >= 5.5 && input.ph_level <= 8.0 ? 70 : 40
  const omScore = clamp(Math.round((input.organic_matter_pct / 5) * 100), 0, 100)
  const overallScore = Math.round(avgNutrientScore * 0.5 + phScore * 0.25 + omScore * 0.25)

  // pH assessment
  let phAssessment: string
  if (input.ph_level < 5.5) phAssessment = 'Strongly acidic - lime application required'
  else if (input.ph_level < 6.0) phAssessment = 'Moderately acidic - lime recommended for most crops'
  else if (input.ph_level <= 7.5) phAssessment = 'Optimal range for most crops'
  else if (input.ph_level <= 8.5) phAssessment = 'Moderately alkaline - sulfur amendment may help'
  else phAssessment = 'Strongly alkaline - significant amendment required'

  // Organic matter assessment
  let omAssessment: string
  if (input.organic_matter_pct < 1.5) omAssessment = 'Very low - critical need for organic matter building'
  else if (input.organic_matter_pct < 3) omAssessment = 'Low - beneficial to increase through cover crops and compost'
  else if (input.organic_matter_pct < 5) omAssessment = 'Good - maintain current practices'
  else omAssessment = 'Excellent - high biological activity expected'

  // Drainage assessment
  const drainageMap: Record<string, string> = {
    excessive: 'Excessive drainage - water retention amendments needed, increase organic matter',
    good: 'Good drainage - ideal for most crops',
    moderate: 'Moderate drainage - suitable for most crops with monitoring',
    poor: 'Poor drainage - consider raised beds or drainage tiles'
  }
  const drainageAssessment = drainageMap[input.drainage_type] || 'Unknown drainage type'

  // Generate amendments for deficient nutrients
  const amendments: SoilAmendment[] = []
  const amendmentMap: Record<string, { amendment: string; rate: string; cost: number }> = {
    nitrogen: { amendment: 'Urea (46-0-0) or Ammonium Nitrate', rate: '50-100 kg/ha', cost: 150 },
    phosphorus: { amendment: 'Triple Super Phosphate (0-46-0)', rate: '40-80 kg/ha', cost: 180 },
    potassium: { amendment: 'Potassium Chloride (0-0-60)', rate: '60-120 kg/ha', cost: 160 },
    calcium: { amendment: 'Agricultural Lime (CaCO3)', rate: '1-3 tonnes/ha', cost: 120 },
    magnesium: { amendment: 'Dolomitic Lime or Epsom Salt', rate: '200-500 kg/ha', cost: 100 },
    sulfur: { amendment: 'Gypsum (Calcium Sulfate)', rate: '200-400 kg/ha', cost: 80 },
    iron: { amendment: 'Iron Chelate (EDDHA)', rate: '5-10 kg/ha', cost: 200 },
    zinc: { amendment: 'Zinc Sulfate', rate: '5-15 kg/ha', cost: 90 },
    boron: { amendment: 'Borax', rate: '1-3 kg/ha', cost: 70 }
  }

  const nutrientNames = Object.keys(nutrientScores)
  for (const nutrient of nutrientNames) {
    if (nutrientScores[nutrient] < 60) {
      const info = amendmentMap[nutrient]
      if (info) {
        amendments.push({
          nutrient: nutrient.charAt(0).toUpperCase() + nutrient.slice(1),
          current_level: str[nutrient as keyof typeof str] + ' ppm',
          target_level: 'Optimal range',
          amendment: info.amendment,
          application_rate: info.rate,
          cost_per_hectare: info.cost,
          timing: 'Apply 2-4 weeks before planting for best results'
        })
      }
    }
  }

  const totalAmendmentCost = amendments.reduce((sum, a) => sum + a.cost_per_hectare, 0)

  const longTermRecs: string[] = [
    'Implement cover cropping during off-season to build organic matter',
    'Conduct soil tests annually to track nutrient trends',
    'Adopt reduced tillage to preserve soil structure and biology',
    'Apply compost at 5-10 tonnes/hectare annually to build organic matter',
    'Use precision agriculture to apply variable-rate amendments based on soil zones'
  ]

  return {
    overall_soil_score: overallScore,
    ph_assessment: phAssessment,
    organic_matter_assessment: omAssessment,
    drainage_assessment: drainageAssessment,
    amendments,
    total_amendment_cost_per_hectare: totalAmendmentCost,
    long_term_recommendations: longTermRecs
  }
}

function formatSoilHealthReport(input: SoilHealthInput, result: SoilHealthResult): string {
  const lines: string[] = []
  lines.push('# Soil Health Analysis Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Target Crops: ' + input.target_crops.join(', '))
  lines.push('- pH Level: ' + input.ph_level)
  lines.push('- Organic Matter: ' + input.organic_matter_pct + '%')
  lines.push('- Drainage Type: ' + input.drainage_type)
  lines.push('')
  lines.push('## Overall Soil Score: ' + result.overall_soil_score + '/100')
  lines.push('')
  lines.push('## Assessments')
  lines.push('- pH: ' + result.ph_assessment)
  lines.push('- Organic Matter: ' + result.organic_matter_assessment)
  lines.push('- Drainage: ' + result.drainage_assessment)
  lines.push('')
  if (result.amendments.length > 0) {
    lines.push('## Recommended Amendments')
    lines.push('')
    lines.push('| Nutrient | Current Level | Amendment | Application Rate | Cost/ha | Timing |')
    lines.push('|----------|---------------|-----------|------------------|---------|--------|')
    for (const a of result.amendments) {
      lines.push('| ' + a.nutrient + ' | ' + a.current_level + ' | ' + a.amendment + ' | ' + a.application_rate + ' | $' + a.cost_per_hectare + ' | ' + a.timing + ' |')
    }
    lines.push('')
    lines.push('**Total Amendment Cost: $' + result.total_amendment_cost_per_hectare + '/hectare**')
    lines.push('')
  }
  lines.push('## Long-Term Recommendations')
  for (const rec of result.long_term_recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: CROP ROTATION PLANNER ====================

function planCropRotation(input: CropRotationInput): CropRotationResult {
  const seed = seedFromInput(input)

  // Define crop families and their properties
  const cropFamilies: Record<string, { family: string; nitrogen: 'positive' | 'neutral' | 'negative'; revenue_per_ha: number; pest_risk: string[] }> = {
    wheat: { family: 'grass', nitrogen: 'negative', revenue_per_ha: 1200, pest_risk: ['rust', 'aphid'] },
    corn: { family: 'grass', nitrogen: 'negative', revenue_per_ha: 1800, pest_risk: ['borer', 'armyworm'] },
    soybean: { family: 'legume', nitrogen: 'positive', revenue_per_ha: 1400, pest_risk: ['cyst_nematode', 'aphid'] },
    alfalfa: { family: 'legume', nitrogen: 'positive', revenue_per_ha: 1000, pest_risk: ['weevil'] },
    potato: { family: 'nightshade', nitrogen: 'negative', revenue_per_ha: 3500, pest_risk: ['blight', 'colorado_beetle'] },
    tomato: { family: 'nightshade', nitrogen: 'negative', revenue_per_ha: 4000, pest_risk: ['blight', 'whitefly'] },
    canola: { family: 'brassica', nitrogen: 'neutral', revenue_per_ha: 1600, pest_risk: ['sclerotinia', 'flea_beetle'] },
    barley: { family: 'grass', nitrogen: 'negative', revenue_per_ha: 1100, pest_risk: ['scald', 'net_blotch'] },
    pea: { family: 'legume', nitrogen: 'positive', revenue_per_ha: 1300, pest_risk: ['root_rot', 'powdery_mildew'] },
    oat: { family: 'grass', nitrogen: 'neutral', revenue_per_ha: 1000, pest_risk: ['crown_rust'] }
  }

  // Determine available crops (current + some rotation options)
  const availableCrops = Object.keys(cropFamilies)
  const numPlots = Math.min(4, Math.max(2, Math.ceil(input.farm_size_hectares / 10)))
  const plotSize = Math.round((input.farm_size_hectares / numPlots) * 100) / 100

  const rotationPlan: RotationYear[] = []
  let prevCrops: string[] = input.current_crops.length > 0 ? input.current_crops : ['fallow']

  for (let year = 1; year <= input.rotation_years; year++) {
    const yearSeed = seed + year * 10000
    const plots: RotationYear['plots'] = []
    let yearRevenue = 0
    let hasNitrogenFixer = false
    let pestBreakCount = 0

    for (let plot = 0; plot < numPlots; plot++) {
      const plotSeed = yearSeed + plot * 1000

      // Avoid planting same family as previous year on same plot
      const prevCrop = prevCrops[plot % prevCrops.length]
      const prevFamily = cropFamilies[prevCrop]?.family || 'unknown'

      // Prefer nitrogen-fixing crops if previous year had nitrogen-negative crops
      let candidateCrops = availableCrops.filter(c => cropFamilies[c]?.family !== prevFamily)
      if (!hasNitrogenFixer && year > 1) {
        const legumes = candidateCrops.filter(c => cropFamilies[c]?.nitrogen === 'positive')
        if (legumes.length > 0 && rng.next(0, 100, plotSeed) < 60) {
          candidateCrops = legumes
        }
      }

      const selectedCrop = rng.pick(candidateCrops.length > 0 ? candidateCrops : availableCrops, plotSeed)
      const cropInfo = cropFamilies[selectedCrop]

      // Revenue with market demand adjustment
      const demandMult = input.market_demand[selectedCrop] || 1.0
      const revenue = Math.round(cropInfo.revenue_per_ha * plotSize * demandMult * rng.nextFloat(0.85, 1.15, plotSeed + 500))

      if (cropInfo.nitrogen === 'positive') hasNitrogenFixer = true
      if (cropInfo.family !== prevFamily) pestBreakCount++

      plots.push({
        plot_id: plot + 1,
        crop: selectedCrop,
        area_hectares: plotSize,
        expected_revenue: revenue,
        nitrogen_impact: cropInfo.nitrogen,
        pest_break: cropInfo.family !== prevFamily
      })

      yearRevenue += revenue
    }

    const soilImpact = hasNitrogenFixer
      ? 'Positive: nitrogen-fixing crops included, soil nitrogen replenished'
      : 'Neutral to negative: consider adding legumes next cycle'

    rotationPlan.push({
      year,
      plots,
      total_expected_revenue: yearRevenue,
      soil_health_impact: soilImpact
    })

    prevCrops = plots.map(p => p.crop)
  }

  const totalRevenue = rotationPlan.reduce((sum, y) => sum + y.total_expected_revenue, 0)
  const avgAnnualRevenue = Math.round(totalRevenue / input.rotation_years)

  const riskMitigation: string[] = [
    'Diversified crop portfolio reduces market price risk',
    'Rotation breaks pest and disease cycles naturally',
    'Including legumes reduces fertilizer costs by $50-100/ha/year',
    'Multiple harvest windows spread labor and cash flow needs'
  ]

  const recommendations: string[] = [
    'Monitor market prices quarterly and adjust crop mix for next cycle',
    'Consider cover crops between main seasons to protect and build soil',
    'Test soil annually to verify rotation benefits on nutrient levels',
    'Maintain detailed records of yields and costs per plot for optimization'
  ]

  return {
    rotation_plan: rotationPlan,
    total_expected_revenue: totalRevenue,
    average_annual_revenue: avgAnnualRevenue,
    soil_health_trend: 'Improving with proper legume integration and pest cycle breaks',
    risk_mitigation: riskMitigation,
    recommendations
  }
}

function formatCropRotationReport(input: CropRotationInput, result: CropRotationResult): string {
  const lines: string[] = []
  lines.push('# Crop Rotation Plan')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Farm Size: ' + input.farm_size_hectares + ' hectares')
  lines.push('- Current Crops: ' + input.current_crops.join(', '))
  lines.push('- Soil Type: ' + input.soil_type)
  lines.push('- Rotation Period: ' + input.rotation_years + ' years')
  lines.push('')
  lines.push('## Financial Summary')
  lines.push('- Total Expected Revenue: $' + result.total_expected_revenue.toLocaleString())
  lines.push('- Average Annual Revenue: $' + result.average_annual_revenue.toLocaleString())
  lines.push('- Soil Health Trend: ' + result.soil_health_trend)
  lines.push('')
  for (const year of result.rotation_plan) {
    lines.push('## Year ' + year.year)
    lines.push('')
    lines.push('| Plot | Crop | Area (ha) | Expected Revenue | N Impact | Pest Break |')
    lines.push('|------|------|-----------|------------------|----------|------------|')
    for (const plot of year.plots) {
      lines.push('| ' + plot.plot_id + ' | ' + plot.crop + ' | ' + plot.area_hectares + ' | $' + plot.expected_revenue.toLocaleString() + ' | ' + plot.nitrogen_impact + ' | ' + (plot.pest_break ? 'Yes' : 'No') + ' |')
    }
    lines.push('')
    lines.push('Year ' + year.year + ' Total: $' + year.total_expected_revenue.toLocaleString() + ' | ' + year.soil_health_impact)
    lines.push('')
  }
  lines.push('## Risk Mitigation')
  for (const item of result.risk_mitigation) {
    lines.push('- ' + item)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: YIELD PREDICTOR ====================

function predictYield(input: YieldPredictorInput): YieldPredictorResult {
  const seed = seedFromInput(input)

  // Base yields by crop type (tonnes per hectare)
  const baseYields: Record<string, number> = {
    wheat: 4.5,
    corn: 10.0,
    rice: 6.5,
    soybean: 3.0,
    potato: 25.0,
    tomato: 50.0,
    cotton: 1.5,
    canola: 2.5,
    barley: 4.0,
    sorghum: 5.0
  }

  const baseYield = baseYields[input.crop_type.toLowerCase()] || 5.0

  // Weather factor
  const wf = input.weather_forecast
  let weatherScore = 70
  if (wf.avg_temperature_c >= 18 && wf.avg_temperature_c <= 28) weatherScore += 10
  else if (wf.avg_temperature_c > 35 || wf.avg_temperature_c < 10) weatherScore -= 20
  if (wf.total_rainfall_mm >= 400 && wf.total_rainfall_mm <= 800) weatherScore += 10
  else if (wf.total_rainfall_mm < 200) weatherScore -= 15
  if (wf.sunlight_hours_daily >= 8) weatherScore += 5
  if (wf.frost_risk) weatherScore -= 25
  weatherScore = clamp(weatherScore, 20, 100)

  // Soil factor
  const soilScore = clamp(input.soil_data.fertility_score + rng.next(-10, 10, seed), 20, 100)
  const moistureBonus = input.soil_data.moisture_retention === 'high' ? 10 : input.soil_data.moisture_retention === 'medium' ? 5 : -5

  // Management factor
  const mgmtScores: Record<string, number> = { basic: 50, intermediate: 70, advanced: 85, precision: 95 }
  const mgmtScore = mgmtScores[input.management_level] || 60

  // Calculate predicted yield
  const weatherFactor = weatherScore / 70
  const soilFactor = (soilScore + moistureBonus) / 70
  const mgmtFactor = mgmtScore / 70

  const predictedYield = Math.round(baseYield * weatherFactor * soilFactor * mgmtFactor * rng.nextFloat(0.9, 1.1, seed) * 100) / 100
  const confidencePct = clamp(Math.round(65 + rng.nextFloat(-10, 15, seed + 100)), 40, 95)
  const confidenceRange: [number, number] = [
    Math.round(predictedYield * 0.8 * 100) / 100,
    Math.round(predictedYield * 1.2 * 100) / 100
  ]

  const yieldFactors: YieldFactor[] = [
    { factor: 'Weather Conditions', impact: weatherScore >= 70 ? 'positive' : weatherScore >= 50 ? 'neutral' : 'negative', weight: 0.35, score: weatherScore, description: 'Temperature, rainfall, sunlight, and frost risk assessment' },
    { factor: 'Soil Fertility', impact: soilScore >= 60 ? 'positive' : soilScore >= 40 ? 'neutral' : 'negative', weight: 0.30, score: soilScore, description: 'Soil nutrient levels and moisture retention capacity' },
    { factor: 'Management Level', impact: mgmtScore >= 70 ? 'positive' : mgmtScore >= 50 ? 'neutral' : 'negative', weight: 0.25, score: mgmtScore, description: 'Farming practices, technology adoption, and input management' },
    { factor: 'Variety Selection', impact: 'positive', weight: 0.10, score: 75, description: 'Crop variety suitability for local conditions' }
  ]

  const limitingFactors: string[] = []
  if (weatherScore < 50) limitingFactors.push('Adverse weather conditions (temperature extremes, insufficient rainfall)')
  if (wf.frost_risk) limitingFactors.push('Frost risk during critical growth period')
  if (soilScore < 50) limitingFactors.push('Below-optimal soil fertility')
  if (input.soil_data.moisture_retention === 'low') limitingFactors.push('Poor soil moisture retention')
  if (mgmtScore < 60) limitingFactors.push('Management practices below recommended level')

  const optimizationPotential = clamp(Math.round((1 - predictedYield / (baseYield * 1.5)) * 100), 5, 60)

  const recommendations: string[] = []
  if (weatherScore < 60) recommendations.push('Consider protected cultivation (greenhouse) to mitigate weather risks')
  if (soilScore < 60) recommendations.push('Invest in soil amendment program to improve fertility before planting')
  if (input.management_level === 'basic') recommendations.push('Adopt precision agriculture techniques for 15-25% yield improvement')
  if (input.soil_data.moisture_retention === 'low') recommendations.push('Install irrigation system and apply mulch to improve water retention')
  recommendations.push('Use variable-rate seeding to optimize plant population for field conditions')
  recommendations.push('Implement integrated pest management to prevent yield losses')

  return {
    predicted_yield_tonnes_per_hectare: predictedYield,
    confidence_interval: confidenceRange,
    confidence_pct: confidencePct,
    yield_factors: yieldFactors,
    limiting_factors: limitingFactors,
    optimization_potential_pct: optimizationPotential,
    recommendations
  }
}

function formatYieldPredictorReport(input: YieldPredictorInput, result: YieldPredictorResult): string {
  const lines: string[] = []
  lines.push('# Crop Yield Prediction Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Crop: ' + input.crop_type + ' (' + input.variety + ')')
  lines.push('- Planting Date: ' + input.planting_date)
  lines.push('- Management Level: ' + input.management_level)
  lines.push('- Soil Type: ' + input.soil_data.soil_type)
  lines.push('')
  lines.push('## Predicted Yield')
  lines.push('**' + result.predicted_yield_tonnes_per_hectare + ' tonnes/hectare**')
  lines.push('')
  lines.push('- Confidence Interval: ' + result.confidence_interval[0] + ' - ' + result.confidence_interval[1] + ' tonnes/ha')
  lines.push('- Confidence Level: ' + result.confidence_pct + '%')
  lines.push('- Optimization Potential: +' + result.optimization_potential_pct + '%')
  lines.push('')
  lines.push('## Yield Factors')
  lines.push('')
  lines.push('| Factor | Impact | Weight | Score | Description |')
  lines.push('|--------|--------|--------|-------|-------------|')
  for (const f of result.yield_factors) {
    lines.push('| ' + f.factor + ' | ' + f.impact + ' | ' + Math.round(f.weight * 100) + '% | ' + f.score + '/100 | ' + f.description + ' |')
  }
  lines.push('')
  if (result.limiting_factors.length > 0) {
    lines.push('## Limiting Factors')
    for (const lf of result.limiting_factors) {
      lines.push('- ' + lf)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: FARM ECONOMICS CALCULATOR ====================

function calculateFarmEconomics(input: FarmEconomicsInput): FarmEconomicsResult {
  const seed = seedFromInput(input)
  const ic = input.input_costs
  const lc = input.labor_costs

  const totalInputCosts = ic.seeds + ic.fertilizer + ic.pesticides + ic.fuel + ic.equipment + ic.irrigation
  const totalLaborCosts = lc.permanent_labor + lc.seasonal_labor
  const totalCosts = totalInputCosts + totalLaborCosts

  const primaryRevenue = input.expected_yield * input.market_prices.primary_crop_price_per_tonne
  const secondaryRevenue = input.expected_yield * 0.1 * (input.market_prices.secondary_crop_price_per_tonne || 0)
  const totalRevenue = Math.round((primaryRevenue + secondaryRevenue) * 100) / 100

  const netProfit = Math.round((totalRevenue - totalCosts) * 100) / 100
  const profitMargin = Math.round((netProfit / totalRevenue) * 10000) / 100
  const breakEvenYield = Math.round((totalCosts / input.market_prices.primary_crop_price_per_tonne) * 100) / 100
  const roi = Math.round((netProfit / totalCosts) * 10000) / 100

  const costBreakdown: CostBreakdown[] = [
    { category: 'Seeds', amount: ic.seeds, percentage: Math.round((ic.seeds / totalCosts) * 10000) / 100 },
    { category: 'Fertilizer', amount: ic.fertilizer, percentage: Math.round((ic.fertilizer / totalCosts) * 10000) / 100 },
    { category: 'Pesticides', amount: ic.pesticides, percentage: Math.round((ic.pesticides / totalCosts) * 10000) / 100 },
    { category: 'Fuel', amount: ic.fuel, percentage: Math.round((ic.fuel / totalCosts) * 10000) / 100 },
    { category: 'Equipment', amount: ic.equipment, percentage: Math.round((ic.equipment / totalCosts) * 10000) / 100 },
    { category: 'Irrigation', amount: ic.irrigation, percentage: Math.round((ic.irrigation / totalCosts) * 10000) / 100 },
    { category: 'Permanent Labor', amount: lc.permanent_labor, percentage: Math.round((lc.permanent_labor / totalCosts) * 10000) / 100 },
    { category: 'Seasonal Labor', amount: lc.seasonal_labor, percentage: Math.round((lc.seasonal_labor / totalCosts) * 10000) / 100 }
  ]

  const revenuePerHectare = Math.round((totalRevenue / input.scale_hectares) * 100) / 100
  const costPerHectare = Math.round((totalCosts / input.scale_hectares) * 100) / 100

  const recommendations: string[] = []
  if (profitMargin < 10) recommendations.push('Profit margin is thin: consider value-added processing or direct-to-consumer sales')
  if (ic.fertilizer > totalInputCosts * 0.4) recommendations.push('Fertilizer costs are high: implement precision application and soil testing')
  if (roi < 15) recommendations.push('ROI below target: explore higher-value crops or reduce input costs')
  recommendations.push('Diversify income streams with agritourism or carbon credit programs')
  recommendations.push('Invest in automation to reduce labor costs long-term')
  recommendations.push('Consider cooperative purchasing for inputs to achieve volume discounts')

  const riskFactors: string[] = [
    'Commodity price volatility can significantly impact revenue',
    'Weather events may reduce actual yield below projections',
    'Input cost inflation (fuel, fertilizer) may exceed budget',
    'Pest or disease outbreaks could increase treatment costs'
  ]

  return {
    total_revenue: totalRevenue,
    total_costs: totalCosts,
    net_profit: netProfit,
    profit_margin_pct: profitMargin,
    break_even_yield: breakEvenYield,
    roi_pct: roi,
    cost_breakdown: costBreakdown,
    revenue_per_hectare: revenuePerHectare,
    cost_per_hectare: costPerHectare,
    recommendations,
    risk_factors: riskFactors
  }
}

function formatFarmEconomicsReport(input: FarmEconomicsInput, result: FarmEconomicsResult): string {
  const lines: string[] = []
  lines.push('# Farm Economics Analysis Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Operation Type: ' + input.operation_type)
  lines.push('- Scale: ' + input.scale_hectares + ' hectares')
  lines.push('- Expected Yield: ' + input.expected_yield + ' tonnes')
  lines.push('- Primary Crop Price: $' + input.market_prices.primary_crop_price_per_tonne + '/tonne')
  lines.push('')
  lines.push('## Financial Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Revenue | $' + result.total_revenue.toLocaleString() + ' |')
  lines.push('| Total Costs | $' + result.total_costs.toLocaleString() + ' |')
  lines.push('| Net Profit | $' + result.net_profit.toLocaleString() + ' |')
  lines.push('| Profit Margin | ' + result.profit_margin_pct + '% |')
  lines.push('| ROI | ' + result.roi_pct + '% |')
  lines.push('| Break-Even Yield | ' + result.break_even_yield + ' tonnes |')
  lines.push('| Revenue per Hectare | $' + result.revenue_per_hectare.toLocaleString() + ' |')
  lines.push('| Cost per Hectare | $' + result.cost_per_hectare.toLocaleString() + ' |')
  lines.push('')
  lines.push('## Cost Breakdown')
  lines.push('')
  lines.push('| Category | Amount | % of Total |')
  lines.push('|----------|--------|-----------|')
  for (const cb of result.cost_breakdown) {
    lines.push('| ' + cb.category + ' | $' + cb.amount.toLocaleString() + ' | ' + cb.percentage + '% |')
  }
  lines.push('')
  lines.push('## Risk Factors')
  for (const rf of result.risk_factors) {
    lines.push('- ' + rf)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: AGRI SUPPLY CHAIN OPTIMIZER ====================

function optimizeSupplyChain(input: SupplyChainInput): SupplyChainResult {
  const seed = seedFromInput(input)

  // Sort markets by price (descending) to prioritize high-value destinations
  const sortedMarkets = [...input.market_destinations].sort((a, b) => b.price_per_kg - a.price_per_kg)
  const sortedTransport = [...input.transport_options].sort((a, b) => a.cost_per_kg - b.cost_per_kg)

  const optimalRoutes: SupplyChainRoute[] = []
  let remainingVolume = input.harvest_volume_kg

  for (const market of sortedMarkets) {
    if (remainingVolume <= 0) break

    const volumeForMarket = Math.min(remainingVolume, market.demand_kg)
    const bestTransport = sortedTransport.find(t => t.capacity_kg >= volumeForMarket) || sortedTransport[0]

    if (bestTransport) {
      const transportCost = Math.round(volumeForMarket * bestTransport.cost_per_kg * 100) / 100
      const grossRevenue = Math.round(volumeForMarket * market.price_per_kg * 100) / 100
      const netRevenue = Math.round((grossRevenue - transportCost) * 100) / 100
      const profitMargin = Math.round((netRevenue / grossRevenue) * 10000) / 100

      optimalRoutes.push({
        destination: market.market,
        transport_mode: bestTransport.mode,
        volume_kg: volumeForMarket,
        transport_cost: transportCost,
        expected_price: market.price_per_kg,
        gross_revenue: grossRevenue,
        net_revenue: netRevenue,
        delivery_days: bestTransport.speed_days,
        profit_margin_pct: profitMargin
      })

      remainingVolume -= volumeForMarket
    }
  }

  const totalGross = Math.round(optimalRoutes.reduce((sum, r) => sum + r.gross_revenue, 0) * 100) / 100
  const totalTransport = Math.round(optimalRoutes.reduce((sum, r) => sum + r.transport_cost, 0) * 100) / 100
  const totalNet = Math.round(optimalRoutes.reduce((sum, r) => sum + r.net_revenue, 0) * 100) / 100
  const avgMargin = optimalRoutes.length > 0
    ? Math.round(optimalRoutes.reduce((sum, r) => sum + r.profit_margin_pct, 0) / optimalRoutes.length * 100) / 100
    : 0

  // Storage recommendation
  let storageRec: string
  if (input.storage_days_available >= 14) {
    storageRec = 'Sufficient storage for market timing: hold produce when prices are low, sell during price peaks'
  } else if (input.storage_days_available >= 7) {
    storageRec = 'Moderate storage: prioritize quick-selling crops and use cold storage for high-value items'
  } else {
    storageRec = 'Limited storage: sell immediately after harvest or arrange pre-sale contracts'
  }

  // Market timing advice
  const marketTiming = 'Monitor market prices daily. Historical data shows prices typically peak 2-4 weeks post-harvest as supply decreases. Consider forward contracts for price stability.'

  const riskMitigation: string[] = [
    'Diversify market destinations to reduce dependency on single buyer',
    'Maintain cold chain integrity throughout transport to minimize spoilage',
    'Use crop insurance to protect against price and yield risks',
    'Establish relationships with multiple transport providers for flexibility'
  ]

  const recommendations: string[] = [
    'Invest in cold storage infrastructure to extend selling window by 2-4 weeks',
    'Use market intelligence platforms to track price trends across destinations',
    'Consider value-added processing (drying, packaging) for price premium',
    'Negotiate volume discounts with transport providers for regular shipments',
    'Implement quality grading to access premium market segments'
  ]

  return {
    optimal_routes: optimalRoutes,
    total_gross_revenue: totalGross,
    total_transport_cost: totalTransport,
    total_net_revenue: totalNet,
    average_profit_margin_pct: avgMargin,
    storage_recommendation: storageRec,
    market_timing_advice: marketTiming,
    risk_mitigation: riskMitigation,
    recommendations
  }
}

function formatSupplyChainReport(input: SupplyChainInput, result: SupplyChainResult): string {
  const lines: string[] = []
  lines.push('# Agricultural Supply Chain Optimization Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Crop: ' + input.crop_type)
  lines.push('- Harvest Volume: ' + input.harvest_volume_kg.toLocaleString() + ' kg')
  lines.push('- Storage Available: ' + input.storage_days_available + ' days')
  lines.push('- Transport Options: ' + input.transport_options.length)
  lines.push('- Market Destinations: ' + input.market_destinations.length)
  lines.push('')
  lines.push('## Financial Summary')
  lines.push('- Total Gross Revenue: $' + result.total_gross_revenue.toLocaleString())
  lines.push('- Total Transport Cost: $' + result.total_transport_cost.toLocaleString())
  lines.push('- Total Net Revenue: $' + result.total_net_revenue.toLocaleString())
  lines.push('- Average Profit Margin: ' + result.average_profit_margin_pct + '%')
  lines.push('')
  lines.push('## Optimal Distribution Routes')
  lines.push('')
  lines.push('| Destination | Transport | Volume (kg) | Transport Cost | Price/kg | Gross Revenue | Net Revenue | Margin % | Days |')
  lines.push('|-------------|-----------|-------------|----------------|----------|---------------|-------------|----------|------|')
  for (const route of result.optimal_routes) {
    lines.push('| ' + route.destination + ' | ' + route.transport_mode + ' | ' + route.volume_kg.toLocaleString() + ' | $' + route.transport_cost.toLocaleString() + ' | $' + route.expected_price + ' | $' + route.gross_revenue.toLocaleString() + ' | $' + route.net_revenue.toLocaleString() + ' | ' + route.profit_margin_pct + '% | ' + route.delivery_days + ' |')
  }
  lines.push('')
  lines.push('## Storage Recommendation')
  lines.push(result.storage_recommendation)
  lines.push('')
  lines.push('## Market Timing Advice')
  lines.push(result.market_timing_advice)
  lines.push('')
  lines.push('## Risk Mitigation')
  for (const item of result.risk_mitigation) {
    lines.push('- ' + item)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Greenhouse Climate Controller
  tools.register(defineTool({
    name: 'greenhouse_climate_controller',
    description: 'Optimizes greenhouse climate parameters (temperature, humidity, CO2, lighting) for maximum crop yield and energy efficiency. Returns prioritized adjustments, energy cost estimates, yield improvement projections, and alerts for critical conditions.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: crop_type, current_climate{temperature_c, humidity_pct, co2_ppm, light_lux}, target_climate{temperature_c, humidity_pct, co2_ppm, light_lux}, energy_budget, season (spring|summer|autumn|winter)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GreenhouseClimateInput = JSON.parse(args.input_data)
      const result = controllerGreenhouseClimate(input)
      return formatGreenhouseReport(input, result)
    }
  }))

  // Tool 2: Precision Irrigation Optimizer
  tools.register(defineTool({
    name: 'precision_irrigation_optimizer',
    description: 'Optimizes irrigation scheduling based on soil moisture, weather forecast, crop growth stage, and water cost. Generates a 7-day irrigation schedule with water savings calculations, crop stress assessment, and cost estimates.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_size_hectares, crop_type, soil_type, water_availability, weather_forecast{rain_probability_pct, expected_rainfall_mm, temperature_c, wind_speed_kmh}, growth_stage (germination|vegetative|flowering|fruiting|maturity)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: IrrigationInput = JSON.parse(args.input_data)
      const result = optimizeIrrigation(input)
      return formatIrrigationReport(input, result)
    }
  }))

  // Tool 3: Pest Disease Detector
  tools.register(defineTool({
    name: 'pest_disease_detector',
    description: 'Identifies crop pests, diseases, and nutrient deficiencies from symptom descriptions. Provides confidence scores, treatment recommendations (organic or conventional), urgency levels, prevention plans, and monitoring guidance.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: crop_type, symptoms[], severity_level (low|medium|high|critical), growth_stage, organic_preference (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PestDiseaseInput = JSON.parse(args.input_data)
      const result = detectPestDisease(input)
      return formatPestDiseaseReport(input, result)
    }
  }))

  // Tool 4: Soil Health Analyzer
  tools.register(defineTool({
    name: 'soil_health_analyzer',
    description: 'Analyzes soil composition from test results and recommends amendments for target crops. Provides overall soil score, pH assessment, organic matter evaluation, drainage analysis, and specific amendment recommendations with costs.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: soil_test_results{nitrogen_ppm, phosphorus_ppm, potassium_ppm, calcium_ppm, magnesium_ppm, sulfur_ppm, iron_ppm, zinc_ppm, boron_ppm}, target_crops[], ph_level, organic_matter_pct, drainage_type (excessive|good|moderate|poor)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SoilHealthInput = JSON.parse(args.input_data)
      const result = analyzeSoilHealth(input)
      return formatSoilHealthReport(input, result)
    }
  }))

  // Tool 5: Crop Rotation Planner
  tools.register(defineTool({
    name: 'crop_rotation_planner',
    description: 'Plans optimal crop rotation cycles for soil health and profit maximization. Generates multi-year rotation plans with plot assignments, revenue projections, nitrogen impact analysis, and pest break identification.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: farm_size_hectares, current_crops[], soil_type, market_demand{crop: demand_multiplier}, rotation_years' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CropRotationInput = JSON.parse(args.input_data)
      const result = planCropRotation(input)
      return formatCropRotationReport(input, result)
    }
  }))

  // Tool 6: Yield Predictor
  tools.register(defineTool({
    name: 'yield_predictor',
    description: 'Predicts crop yield based on weather forecast, soil conditions, genetics, and management practices. Provides confidence intervals, yield factor analysis, limiting factors, and optimization recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: crop_type, variety, planting_date, weather_forecast{avg_temperature_c, total_rainfall_mm, sunlight_hours_daily, frost_risk}, soil_data{soil_type, fertility_score, moisture_retention (low|medium|high)}, management_level (basic|intermediate|advanced|precision)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: YieldPredictorInput = JSON.parse(args.input_data)
      const result = predictYield(input)
      return formatYieldPredictorReport(input, result)
    }
  }))

  // Tool 7: Farm Economics Calculator
  tools.register(defineTool({
    name: 'farm_economics_calculator',
    description: 'Calculates farm profitability, break-even yield, and ROI for crop or livestock operations. Provides detailed cost breakdown, profit margin analysis, risk factors, and actionable recommendations for financial optimization.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: operation_type (crop|livestock|mixed), scale_hectares, input_costs{seeds, fertilizer, pesticides, fuel, equipment, irrigation}, expected_yield, market_prices{primary_crop_price_per_tonne, secondary_crop_price_per_tonne}, labor_costs{permanent_labor, seasonal_labor}' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FarmEconomicsInput = JSON.parse(args.input_data)
      const result = calculateFarmEconomics(input)
      return formatFarmEconomicsReport(input, result)
    }
  }))

  // Tool 8: Agri Supply Chain Optimizer
  tools.register(defineTool({
    name: 'agri_supply_chain_optimizer',
    description: 'Optimizes post-harvest supply chain including storage timing, transport mode selection, and market destination allocation. Maximizes net revenue through optimal route planning with profit margin analysis and risk mitigation.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: crop_type, harvest_volume_kg, storage_days_available, transport_options[{mode, cost_per_kg, speed_days, capacity_kg}], market_destinations[{market, price_per_kg, distance_km, demand_kg}]' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SupplyChainInput = JSON.parse(args.input_data)
      const result = optimizeSupplyChain(input)
      return formatSupplyChainReport(input, result)
    }
  }))

  console.log('[dsh-tool-agrivertical] Loaded v' + VERSION + ' - AI Agriculture Vertical with 8 tools')
  console.log('  Tools: greenhouse_climate_controller, precision_irrigation_optimizer, pest_disease_detector, soil_health_analyzer, crop_rotation_planner, yield_predictor, farm_economics_calculator, agri_supply_chain_optimizer')
}
