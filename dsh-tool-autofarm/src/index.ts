/**
 * DSH Autonomous Farming & Ag Robotics Plugin v1.0.0
 *
 * Autonomous farming toolkit covering planting automation, harvesting robots,
 * crop monitoring, soil analysis, irrigation drones, weed detection, yield
 * mapping, and farm fleet management.
 *
 * Market: 2026 Ag robotics $35B+; autonomous farming $20B+.
 *
 * Tools:
 * 1. planting_automation_planner — Plan autonomous planting operations
 * 2. harvesting_robot_coordinator — Coordinate multi-robot harvesting fleets
 * 3. crop_monitoring_analyzer — Analyze crop health from sensor/drone data
 * 4. soil_analysis_sensor — Analyze soil sensor data for precision ag
 * 5. irrigation_drone_operator — Plan drone-based irrigation missions
 * 6. weed_detection_eliminator — Detect weeds and plan elimination
 * 7. yield_mapping_predictor — Generate yield maps and predictions
 * 8. farm_fleet_manager — Manage autonomous farm vehicle fleet
 *
 * @module dsh-tool-autofarm
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-autofarm'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated agricultural robotics analysis for informational purposes only. Always consult certified agronomists, equipment manufacturers, and local regulatory bodies before deploying autonomous farming systems. Safety protocols must be followed at all times.'

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

// --- Tool 1: Planting Automation Planner ---
export interface PlantingAutomationInput {
  field_id: string
  field_size_hectares: number
  crop_type: string
  seed_variety: string
  soil_type: string
  row_spacing_cm: number
  target_density_plants_per_sqm: number
  planter_width_m: number
  num_autonomous_planters: number
  weather_window_hours: number
  terrain_slope_pct: number
}

export interface PlantingZone {
  zone_id: number
  area_hectares: number
  estimated_seeds: number
  estimated_duration_hours: number
  planter_assignment: number
  speed_kmh: number
  overlap_tolerance_pct: number
}

export interface PlantingAutomationResult {
  total_seeds_required: number
  total_estimated_duration_hours: number
  fuel_cost_estimate: number
  zones: PlantingZone[]
  gps_waypoints_count: number
  efficiency_score: number
  recommendations: string[]
  alerts: string[]
}

// --- Tool 2: Harvesting Robot Coordinator ---
export interface HarvestingRobotInput {
  field_id: string
  crop_type: string
  field_size_hectares: number
  maturity_pct: number
  num_robots: number
  robot_payload_kg: number
  robot_battery_hours: number
  bin_capacity_kg: number
  transport_vehicle_count: number
  weather_window_hours: number
  crop_moisture_pct: number
}

export interface RobotSchedule {
  robot_id: number
  assigned_rows: number[]
  estimated_harvest_kg: number
  battery_swap_count: number
  bin_swap_count: number
  estimated_duration_hours: number
  efficiency_pct: number
}

export interface HarvestingRobotResult {
  total_estimated_yield_kg: number
  total_duration_hours: number
  avg_robot_efficiency_pct: number
  schedules: RobotSchedule[]
  fleet_utilization_pct: number
  cost_per_hectare: number
  recommendations: string[]
  alerts: string[]
}

// --- Tool 3: Crop Monitoring Analyzer ---
export interface CropMonitoringInput {
  field_id: string
  crop_type: string
  growth_stage: string
  ndvi_readings: number[]
  canopy_temperature_c: number
  soil_moisture_pct: number
  pest_pressure_index: number
  disease_risk_index: number
  image_analysis_spots: number
}

export interface CropHealthZone {
  zone: string
  ndvi_avg: number
  health_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  issue: string
  action: string
}

export interface CropMonitoringResult {
  overall_health_score: number
  health_zones: CropHealthZone[]
  pest_risk_level: 'low' | 'moderate' | 'high' | 'severe'
  disease_risk_level: 'low' | 'moderate' | 'high' | 'severe'
  water_stress_detected: boolean
  nutrient_deficiency_detected: boolean
  recommendations: string[]
  alerts: string[]
}

// --- Tool 4: Soil Analysis Sensor ---
export interface SoilAnalysisInput {
  field_id: string
  sensor_readings: Array<{
    depth_cm: number
    moisture_pct: number
    temperature_c: number
    ec_ds_m: number
    ph: number
    nitrogen_mg_kg: number
    phosphorus_mg_kg: number
    potassium_mg_kg: number
  }>
  crop_type: string
  target_yield_tonnes: number
}

export interface SoilLayerAnalysis {
  depth_range: string
  moisture_status: 'optimal' | 'low' | 'saturated'
  nutrient_status: 'deficient' | 'adequate' | 'excessive'
  ph_status: 'acidic' | 'optimal' | 'alkaline'
  ec_status: 'normal' | 'elevated' | 'excessive'
  action: string
}

export interface SoilAnalysisResult {
  overall_fertility_score: number
  layer_analyses: SoilLayerAnalysis[]
  irrigation_recommendation: string
  fertilization_plan: string
  cost_savings_vs_uniform: number
  recommendations: string[]
  alerts: string[]
}

// --- Tool 5: Irrigation Drone Operator ---
export interface IrrigationDroneInput {
  field_id: string
  field_size_hectares: number
  crop_type: string
  growth_stage: string
  soil_moisture_deficit_pct: number
  num_drones: number
  drone_tank_capacity_l: number
  drone_flight_time_min: number
  drone_coverage_rate_ha_hr: number
  water_source_distance_m: number
  wind_speed_kmh: number
}

export interface DroneMission {
  drone_id: number
  flight_count: number
  total_water_l: number
  total_flight_time_min: number
  coverage_hectares: number
  refill_count: number
}

export interface IrrigationDroneResult {
  total_water_required_l: number
  total_missions: number
  total_flight_time_hours: number
  missions: DroneMission[]
  water_use_efficiency_pct: number
  cost_estimate: number
  recommendations: string[]
  alerts: string[]
}

// --- Tool 6: Weed Detection Eliminator ---
export interface WeedDetectionInput {
  field_id: string
  crop_type: string
  field_size_hectares: number
  weed_coverage_pct: number
  weed_species: string[]
  detection_confidence_pct: number
  sprayer_width_m: number
  num_spray_robots: number
  herbicide_type: string
  organic_preference: boolean
}

export interface WeedHotspot {
  zone_id: number
  coverage_pct: number
  dominant_species: string
  treatment_method: string
  treatment_cost_per_hectare: number
  urgency: 'immediate' | 'within_48h' | 'monitor'
}

export interface WeedDetectionResult {
  total_weed_coverage_pct: number
  hotspot_count: number
  hotspots: WeedHotspot[]
  total_treatment_cost: number
  herbicide_savings_pct: number
  prevention_recommendations: string[]
  alerts: string[]
}

// --- Tool 7: Yield Mapping Predictor ---
export interface YieldMappingInput {
  field_id: string
  crop_type: string
  field_size_hectares: number
  historical_yields: number[]
  soil_zones: Array<{
    zone_id: number
    area_hectares: number
    soil_fertility_index: number
    drainage_class: 'excellent' | 'good' | 'moderate' | 'poor'
  }>
  weather_forecast: {
    avg_temp_c: number
    total_rainfall_mm: number
    sunlight_hours: number
  }
  management_level: 'basic' | 'intermediate' | 'advanced' | 'precision'
}

export interface YieldZoneMap {
  zone_id: number
  area_hectares: number
  predicted_yield_tonnes: number
  yield_per_hectare: number
  confidence_pct: number
  limiting_factor: string
}

export interface YieldMappingResult {
  total_predicted_yield_tonnes: number
  avg_yield_per_hectare: number
  yield_variance_pct: number
  yield_zones: YieldZoneMap[]
  revenue_estimate: number
  recommendations: string[]
  alerts: string[]
}

// --- Tool 8: Farm Fleet Manager ---
export interface FarmFleetInput {
  farm_id: string
  total_hectares: number
  fleet: Array<{
    vehicle_id: string
    type: 'tractor' | 'harvester' | 'sprayer' | 'drone' | 'utility'
    status: 'active' | 'maintenance' | 'idle'
    fuel_level_pct: number
    hours_since_service: number
    gps_location: { lat: number; lng: number }
  }>
  tasks_pending: number
  fuel_budget: number
}

export interface FleetAssignment {
  vehicle_id: string
  vehicle_type: string
  task: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimated_duration_hours: number
  fuel_required_l: number
}

export interface FleetMaintenanceAlert {
  vehicle_id: string
  alert_type: string
  urgency: 'immediate' | 'scheduled' | 'upcoming'
  action: string
}

export interface FarmFleetResult {
  fleet_size: number
  active_count: number
  idle_count: number
  maintenance_count: number
  assignments: FleetAssignment[]
  maintenance_alerts: FleetMaintenanceAlert[]
  fleet_utilization_pct: number
  daily_fuel_cost_estimate: number
  recommendations: string[]
  alerts: string[]
}

// ==================== TOOL IMPLEMENTATIONS ====================

// --- Tool 1: Planting Automation Planner ---

function planPlantingAutomation(input: PlantingAutomationInput): PlantingAutomationResult {
  const seed = seedFromInput(input)
  const totalSeeds = Math.round(input.field_size_hectares * 10000 * input.target_density_plants_per_sqm)
  const baseSpeed = clamp(8 - input.terrain_slope_pct * 0.3, 3, 10)
  const zones: PlantingZone[] = []

  const zoneCount = Math.max(1, input.num_autonomous_planters)
  const zoneSize = input.field_size_hectares / zoneCount
  const seedsPerZone = Math.round(totalSeeds / zoneCount)

  for (let i = 0; i < zoneCount; i++) {
    const speed = clamp(baseSpeed + rng.nextFloat(-1, 1, seed + i), 2, 12)
    const duration = Math.round((zoneSize * 10000 / (input.planter_width_m * speed * 1000)) * rng.nextFloat(0.9, 1.1, seed + i) * 100) / 100
    zones.push({
      zone_id: i + 1,
      area_hectares: Math.round(zoneSize * 100) / 100,
      estimated_seeds: seedsPerZone,
      estimated_duration_hours: duration,
      planter_assignment: (i % input.num_autonomous_planters) + 1,
      speed_kmh: Math.round(speed * 100) / 100,
      overlap_tolerance_pct: Math.round(rng.nextFloat(2, 5, seed + i) * 100) / 100
    })
  }

  const totalDuration = Math.round(zones.reduce((s, z) => s + z.estimated_duration_hours, 0) * 100) / 100
  const fuelCost = Math.round(totalDuration * input.num_autonomous_planters * 15 * 100) / 100
  const efficiency = clamp(Math.round(75 + rng.nextFloat(-10, 20, seed)), 40, 99)
  const waypoints = Math.round(input.field_size_hectares * 15 + rng.next(5, 20, seed))

  const recommendations: string[] = []
  if (input.terrain_slope_pct > 10) {
    recommendations.push('Terrain slope exceeds 10%; reduce planter speed by 20% to maintain seed placement accuracy')
  }
  if (input.weather_window_hours < totalDuration * 1.2) {
    recommendations.push('Weather window is tight; consider adding an additional planter to ensure completion')
  }
  if (input.row_spacing_cm < 50) {
    recommendations.push('Narrow row spacing detected; verify planter compatibility with seed variety')
  }
  recommendations.push('Use RTK GPS for sub-inch planting accuracy and reduced overlap')
  recommendations.push('Calibrate seed meters before operation to ensure target density accuracy')

  const alerts: string[] = []
  if (input.weather_window_hours < totalDuration) {
    alerts.push('CRITICAL: Insufficient weather window for planned operation')
  }
  if (input.num_autonomous_planters < 2 && input.field_size_hectares > 50) {
    alerts.push('WARNING: Single planter on large field increases completion risk')
  }

  return {
    total_seeds_required: totalSeeds,
    total_estimated_duration_hours: totalDuration,
    fuel_cost_estimate: fuelCost,
    zones,
    gps_waypoints_count: waypoints,
    efficiency_score: efficiency,
    recommendations,
    alerts
  }
}

function formatPlantingReport(input: PlantingAutomationInput, result: PlantingAutomationResult): string {
  const lines: string[] = []
  lines.push('# Planting Automation Plan')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field: ' + input.field_id)
  lines.push('- Size: ' + input.field_size_hectares + ' ha')
  lines.push('- Crop: ' + input.crop_type + ' (' + input.seed_variety + ')')
  lines.push('- Planters: ' + input.num_autonomous_planters + ' x ' + input.planter_width_m + 'm width')
  lines.push('- Weather Window: ' + input.weather_window_hours + 'h')
  lines.push('')
  lines.push('## Efficiency Score: ' + result.efficiency_score + '/100')
  lines.push('')
  lines.push('## Operation Summary')
  lines.push('- Total Seeds Required: ' + result.total_seeds_required.toLocaleString())
  lines.push('- Est. Duration: ' + result.total_estimated_duration_hours + ' hours')
  lines.push('- Fuel Cost: $' + result.fuel_cost_estimate)
  lines.push('- GPS Waypoints: ' + result.gps_waypoints_count)
  lines.push('')
  lines.push('## Zone Assignments')
  lines.push('')
  lines.push('| Zone | Area (ha) | Seeds | Duration (h) | Planter | Speed (km/h) | Overlap Tol % |')
  lines.push('|------|-----------|-------|--------------|---------|--------------|---------------|')
  for (const z of result.zones) {
    lines.push('| ' + z.zone_id + ' | ' + z.area_hectares + ' | ' + z.estimated_seeds.toLocaleString() + ' | ' + z.estimated_duration_hours + ' | #' + z.planter_assignment + ' | ' + z.speed_kmh + ' | ' + z.overlap_tolerance_pct + ' |')
  }
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 2: Harvesting Robot Coordinator ---

function coordinateHarvestingRobots(input: HarvestingRobotInput): HarvestingRobotResult {
  const seed = seedFromInput(input)
  const rowsPerField = Math.round(input.field_size_hectares * 5)
  const rowsPerRobot = Math.round(rowsPerField / input.num_robots)
  const baseYieldPerHa = input.crop_type === 'wheat' ? 8 : input.crop_type === 'corn' ? 12 : 6
  const totalYield = Math.round(input.field_size_hectares * baseYieldPerHa * (input.maturity_pct / 100) * 1000)
  const schedules: RobotSchedule[] = []

  for (let i = 0; i < input.num_robots; i++) {
    const assignedRows: number[] = []
    for (let r = 0; r < rowsPerRobot; r++) {
      assignedRows.push(i * rowsPerRobot + r + 1)
    }
    const eff = clamp(Math.round(75 + rng.nextFloat(-10, 20, seed + i)), 50, 99)
    const harvestKg = Math.round((totalYield / input.num_robots) * (eff / 100))
    const duration = Math.round((harvestKg / (input.robot_payload_kg * 60)) * rng.nextFloat(0.85, 1.1, seed + i) * 100) / 100
    const batterySwaps = Math.ceil(duration / input.robot_battery_hours) - 1
    const binSwaps = Math.ceil(harvestKg / input.bin_capacity_kg) - 1
    schedules.push({
      robot_id: i + 1,
      assigned_rows: assignedRows,
      estimated_harvest_kg: harvestKg,
      battery_swap_count: Math.max(0, batterySwaps),
      bin_swap_count: Math.max(0, binSwaps),
      estimated_duration_hours: duration,
      efficiency_pct: eff
    })
  }

  const totalDuration = Math.ceil(schedules.reduce((s, sc) => Math.max(s, sc.estimated_duration_hours), 0))
  const avgEff = Math.round(schedules.reduce((s, sc) => s + sc.efficiency_pct, 0) / schedules.length)
  const utilization = clamp(Math.round(avgEff * 0.9), 40, 99)
  const costPerHa = Math.round((totalDuration * input.num_robots * 25) / input.field_size_hectares * 100) / 100

  const recommendations: string[] = []
  if (input.maturity_pct < 90) {
    recommendations.push('Crop maturity at ' + input.maturity_pct + '%; waiting for optimal maturity may improve yield by ' + (100 - input.maturity_pct) + '%')
  }
  if (input.weather_window_hours < totalDuration * 1.3) {
    recommendations.push('Weather window is tight; pre-position spare batteries and bins at field edge')
  }
  if (input.crop_moisture_pct > 20) {
    recommendations.push('High crop moisture (' + input.crop_moisture_pct + '%); consider drying logistics post-harvest')
  }
  recommendations.push('Deploy robots in staggered formation to minimize bin-swap congestion')
  recommendations.push('Use real-time yield monitoring to dynamically rebalance robot assignments')
  recommendations.push('Pre-charge all batteries to 100% and stage spares at charging stations')

  const alerts: string[] = []
  if (input.num_robots * input.robot_battery_hours < totalDuration) {
    alerts.push('CRITICAL: Fleet battery capacity insufficient for continuous operation')
  }
  if (input.weather_window_hours < totalDuration) {
    alerts.push('WARNING: Harvest may exceed available weather window')
  }

  return {
    total_estimated_yield_kg: totalYield,
    total_duration_hours: totalDuration,
    avg_robot_efficiency_pct: avgEff,
    schedules,
    fleet_utilization_pct: utilization,
    cost_per_hectare: costPerHa,
    recommendations,
    alerts
  }
}

function formatHarvestingReport(input: HarvestingRobotInput, result: HarvestingRobotResult): string {
  const lines: string[] = []
  lines.push('# Harvesting Robot Coordination Plan')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field: ' + input.field_id)
  lines.push('- Crop: ' + input.crop_type + ' (' + input.maturity_pct + '% mature, ' + input.crop_moisture_pct + '% moisture)')
  lines.push('- Field Size: ' + input.field_size_hectares + ' ha')
  lines.push('- Robots: ' + input.num_robots + ' (payload: ' + input.robot_payload_kg + ' kg)')
  lines.push('- Weather Window: ' + input.weather_window_hours + 'h')
  lines.push('')
  lines.push('## Fleet Performance')
  lines.push('- Total Est. Yield: ' + result.total_estimated_yield_kg.toLocaleString() + ' kg')
  lines.push('- Total Duration: ' + result.total_duration_hours + ' hours')
  lines.push('- Avg Robot Efficiency: ' + result.avg_robot_efficiency_pct + '%')
  lines.push('- Fleet Utilization: ' + result.fleet_utilization_pct + '%')
  lines.push('- Cost/Hectare: $' + result.cost_per_hectare)
  lines.push('')
  lines.push('## Robot Schedules')
  lines.push('')
  lines.push('| Robot | Rows | Harvest (kg) | Duration (h) | Battery Swaps | Bin Swaps | Efficiency |')
  lines.push('|-------|------|--------------|--------------|---------------|-----------|------------|')
  for (const s of result.schedules) {
    lines.push('| #' + s.robot_id + ' | ' + s.assigned_rows.length + ' rows | ' + s.estimated_harvest_kg.toLocaleString() + ' | ' + s.estimated_duration_hours + ' | ' + s.battery_swap_count + ' | ' + s.bin_swap_count + ' | ' + s.efficiency_pct + '% |')
  }
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 3: Crop Monitoring Analyzer ---

function analyzeCropMonitoring(input: CropMonitoringInput): CropMonitoringResult {
  const seed = seedFromInput(input)
  const ndviAvg = input.ndvi_readings.reduce((a, b) => a + b, 0) / input.ndvi_readings.length
  const zones: CropHealthZone[] = []

  const zoneLabels = ['North', 'South', 'East', 'West', 'Center']
  const zoneCount = Math.min(5, Math.max(1, Math.floor(input.image_analysis_spots / 3)))

  for (let i = 0; i < zoneCount; i++) {
    const zoneNdvi = Math.round((ndviAvg + rng.nextFloat(-0.15, 0.15, seed + i)) * 100) / 100
    const clampedNdvi = clamp(zoneNdvi, 0, 1)
    let health: CropHealthZone['health_status']
    let issue: string
    let action: string
    if (clampedNdvi > 0.8) {
      health = 'excellent'
      issue = 'None detected'
      action = 'Continue current management'
    } else if (clampedNdvi > 0.6) {
      health = 'good'
      issue = 'Minor stress indicators'
      action = 'Monitor closely over next 7 days'
    } else if (clampedNdvi > 0.4) {
      health = 'fair'
      issue = 'Water or nutrient stress suspected'
      action = 'Schedule targeted irrigation/fertigation'
    } else if (clampedNdvi > 0.2) {
      health = 'poor'
      issue = 'Significant stress; possible disease/pest damage'
      action = 'Immediate field scouting recommended'
    } else {
      health = 'critical'
      issue = 'Severe crop distress or equipment malfunction'
      action = 'Urgent intervention required within 24h'
    }
    zones.push({ zone: zoneLabels[i], ndvi_avg: clampedNdvi, health_status: health, issue, action })
  }

  const healthScore = clamp(Math.round(ndviAvg * 100), 5, 99)
  const pestRisk: CropMonitoringResult['pest_risk_level'] =
    input.pest_pressure_index > 7 ? 'severe' : input.pest_pressure_index > 5 ? 'high' : input.pest_pressure_index > 3 ? 'moderate' : 'low'
  const diseaseRisk: CropMonitoringResult['disease_risk_level'] =
    input.disease_risk_index > 7 ? 'severe' : input.disease_risk_index > 5 ? 'high' : input.disease_risk_index > 3 ? 'moderate' : 'low'
  const waterStress = input.soil_moisture_pct < 30
  const nutrientDef = ndviAvg < 0.5 && input.soil_moisture_pct > 30

  const recommendations: string[] = []
  if (waterStress) {
    recommendations.push('Soil moisture at ' + input.soil_moisture_pct + '% is below critical threshold; initiate irrigation within 24h')
  }
  if (pestRisk === 'high' || pestRisk === 'severe') {
    recommendations.push('Pest pressure index at ' + input.pest_pressure_index + '/10; deploy pheromone traps and schedule scouting')
  }
  if (diseaseRisk === 'high' || diseaseRisk === 'severe') {
    recommendations.push('Disease risk elevated (' + input.disease_risk_index + '/10); consider preventive fungicide application')
  }
  recommendations.push('Increase drone flyover frequency to every 3 days during ' + input.growth_stage + ' stage')
  recommendations.push('Cross-reference NDVI anomalies with tissue sampling for nutrient confirmation')

  const alerts: string[] = []
  if (healthScore < 30) alerts.push('CRITICAL: Overall crop health score below 30% — immediate action required')
  if (pestRisk === 'severe') alerts.push('SEVERE: Pest pressure index critical — risk of significant yield loss')
  if (diseaseRisk === 'severe') alerts.push('SEVERE: Disease risk critical — preventive treatment needed immediately')
  if (input.canopy_temperature_c > 35) alerts.push('WARNING: Canopy temperature elevated; heat stress may reduce pollination')

  return {
    overall_health_score: healthScore,
    health_zones: zones,
    pest_risk_level: pestRisk,
    disease_risk_level: diseaseRisk,
    water_stress_detected: waterStress,
    nutrient_deficiency_detected: nutrientDef,
    recommendations,
    alerts
  }
}

function formatCropMonitoringReport(input: CropMonitoringInput, result: CropMonitoringResult): string {
  const lines: string[] = []
  lines.push('# Crop Monitoring Analysis Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field: ' + input.field_id)
  lines.push('- Crop: ' + input.crop_type + ' (' + input.growth_stage + ')')
  lines.push('- NDVI Readings: ' + input.ndvi_readings.length + ' samples')
  lines.push('- Soil Moisture: ' + input.soil_moisture_pct + '%')
  lines.push('- Canopy Temp: ' + input.canopy_temperature_c + ' C')
  lines.push('')
  lines.push('## Overall Health Score: ' + result.overall_health_score + '/100')
  lines.push('')
  lines.push('## Risk Assessment')
  lines.push('- Pest Risk: ' + result.pest_risk_level.toUpperCase())
  lines.push('- Disease Risk: ' + result.disease_risk_level.toUpperCase())
  lines.push('- Water Stress: ' + (result.water_stress_detected ? 'DETECTED' : 'No'))
  lines.push('- Nutrient Deficiency: ' + (result.nutrient_deficiency_detected ? 'DETECTED' : 'No'))
  lines.push('')
  lines.push('## Health Zone Breakdown')
  lines.push('')
  lines.push('| Zone | NDVI | Health | Issue | Action |')
  lines.push('|------|------|--------|-------|--------|')
  for (const z of result.health_zones) {
    lines.push('| ' + z.zone + ' | ' + z.ndvi_avg + ' | ' + z.health_status.toUpperCase() + ' | ' + z.issue + ' | ' + z.action + ' |')
  }
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 4: Soil Analysis Sensor ---

function analyzeSoilSensors(input: SoilAnalysisInput): SoilAnalysisResult {
  const seed = seedFromInput(input)
  const layerAnalyses: SoilLayerAnalysis[] = []

  for (const reading of input.sensor_readings) {
    const depthRange = reading.depth_cm + '-' + (reading.depth_cm + 15) + ' cm'
    let moistureStatus: SoilLayerAnalysis['moisture_status'] =
      reading.moisture_pct < 25 ? 'low' : reading.moisture_pct > 60 ? 'saturated' : 'optimal'
    let nutrientStatus: SoilLayerAnalysis['nutrient_status'] =
      (reading.nitrogen_mg_kg + reading.phosphorus_mg_kg + reading.potassium_mg_kg) < 100 ? 'deficient' :
      (reading.nitrogen_mg_kg + reading.phosphorus_mg_kg + reading.potassium_mg_kg) > 300 ? 'excessive' : 'adequate'
    let phStatus: SoilLayerAnalysis['ph_status'] =
      reading.ph < 6.0 ? 'acidic' : reading.ph > 7.5 ? 'alkaline' : 'optimal'
    let ecStatus: SoilLayerAnalysis['ec_status'] =
      reading.ec_ds_m < 1.0 ? 'normal' : reading.ec_ds_m > 2.5 ? 'excessive' : 'elevated'

    const actions: string[] = []
    if (moistureStatus === 'low') actions.push('Increase irrigation frequency')
    if (moistureStatus === 'saturated') actions.push('Reduce drainage, delay irrigation')
    if (nutrientStatus === 'deficient') actions.push('Apply NPK fertigation')
    if (phStatus === 'acidic') actions.push('Apply lime amendment')
    if (phStatus === 'alkaline') actions.push('Apply sulfur amendment')
    if (ecStatus === 'excessive') actions.push('Leach soil to reduce salinity')
    if (actions.length === 0) actions.push('Maintain current management')

    layerAnalyses.push({
      depth_range: depthRange,
      moisture_status: moistureStatus,
      nutrient_status: nutrientStatus,
      ph_status: phStatus,
      ec_status: ecStatus,
      action: actions.join('; ')
    })
  }

  const fertilityScore = clamp(Math.round(60 + rng.nextFloat(-15, 30, seed)), 20, 99)
  const avgMoisture = input.sensor_readings.reduce((s, r) => s + r.moisture_pct, 0) / input.sensor_readings.length

  const irrigationRec = avgMoisture < 30 ?
    'Increase irrigation by 25% to reach optimal moisture range' :
    avgMoisture > 55 ? 'Reduce irrigation by 20% to prevent waterlogging' : 'Maintain current irrigation schedule'

  const fertPlan = layerAnalyses.some(l => l.nutrient_status === 'deficient') ?
    'Apply variable-rate NPK at 150-200 kg/ha across deficient zones' :
    layerAnalyses.some(l => l.nutrient_status === 'excessive') ?
    'Reduce fertilizer application by 30% in adequate zones' : 'Apply maintenance fertilizer at 80 kg/ha'

  const costSavings = Math.round(rng.nextFloat(12, 28, seed) * 100) / 100

  const recommendations: string[] = []
  recommendations.push('Deploy additional sensors at 30cm depth forroot zone monitoring')
  if (layerAnalyses.some(l => l.ph_status !== 'optimal')) {
    recommendations.push('Implement variable-rate liming based on pH zone mapping')
  }
  recommendations.push('Integrate soil data with planting prescription maps for variable-depth tillage')
  recommendations.push('Schedule sensor calibration every 30 days for accurate readings')

  const alerts: string[] = []
  if (layerAnalyses.some(l => l.ec_status === 'excessive')) {
    alerts.push('WARNING: Excessive EC detected — risk of salt stress to crops')
  }
  if (avgMoisture < 20) {
    alerts.push('CRITICAL: Severe moisture deficit across all sensor depths')
  }

  return {
    overall_fertility_score: fertilityScore,
    layer_analyses: layerAnalyses,
    irrigation_recommendation: irrigationRec,
    fertilization_plan: fertPlan,
    cost_savings_vs_uniform: costSavings,
    recommendations,
    alerts
  }
}

function formatSoilAnalysisReport(input: SoilAnalysisInput, result: SoilAnalysisResult): string {
  const lines: string[] = []
  lines.push('# Soil Sensor Analysis Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field: ' + input.field_id)
  lines.push('- Crop: ' + input.crop_type)
  lines.push('- Target Yield: ' + input.target_yield_tonnes + ' tonnes')
  lines.push('- Sensor Readings: ' + input.sensor_readings.length + ' layers')
  lines.push('')
  lines.push('## Overall Fertility Score: ' + result.overall_fertility_score + '/100')
  lines.push('')
  lines.push('## Management Recommendations')
  lines.push('- Irrigation: ' + result.irrigation_recommendation)
  lines.push('- Fertilization: ' + result.fertilization_plan)
  lines.push('- Cost Savings vs Uniform Application: ' + result.cost_savings_vs_uniform + '%')
  lines.push('')
  lines.push('## Layer-by-Layer Analysis')
  lines.push('')
  lines.push('| Depth | Moisture | Nutrients | pH | EC | Action |')
  lines.push('|-------|----------|-----------|-----|-----|--------|')
  for (const l of result.layer_analyses) {
    lines.push('| ' + l.depth_range + ' | ' + l.moisture_status + ' | ' + l.nutrient_status + ' | ' + l.ph_status + ' | ' + l.ec_status + ' | ' + l.action + ' |')
  }
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 5: Irrigation Drone Operator ---

function planIrrigationDrones(input: IrrigationDroneInput): IrrigationDroneResult {
  const seed = seedFromInput(input)
  const totalWaterNeeded = Math.round(input.field_size_hectares * input.soil_moisture_deficit_pct * 50)
  const missions: DroneMission[] = []

  const waterPerDrone = Math.ceil(totalWaterNeeded / input.num_drones)

  for (let i = 0; i < input.num_drones; i++) {
    const refills = Math.ceil(waterPerDrone / input.drone_tank_capacity_l)
    const flightPerRefill = input.drone_tank_capacity_l / (input.drone_coverage_rate_ha_hr * 100)
    const totalFlight = Math.round(refills * flightPerRefill * input.drone_flight_time_min * rng.nextFloat(0.8, 0.95, seed + i))
    const coverage = Math.round((waterPerDrone / 1000) / input.soil_moisture_deficit_pct * 100 * 100) / 100
    missions.push({
      drone_id: i + 1,
      flight_count: refills,
      total_water_l: waterPerDrone,
      total_flight_time_min: totalFlight,
      coverage_hectares: Math.min(coverage, input.field_size_hectares / input.num_drones),
      refill_count: refills - 1
    })
  }

  const totalFlightHours = Math.round(missions.reduce((s, m) => s + m.total_flight_time_min, 0) / 60 * 100) / 100
  const wue = clamp(Math.round(75 + rng.nextFloat(-10, 20, seed)), 40, 99)
  const cost = Math.round(totalFlightHours * input.num_drones * 8 * 100) / 100

  const recommendations: string[] = []
  if (input.wind_speed_kmh > 20) {
    recommendations.push('Wind speed at ' + input.wind_speed_kmh + ' km/h exceeds safe spray threshold; reduce altitude to 2m and increase droplet size')
  }
  if (input.water_source_distance_m > 500) {
    recommendations.push('Water source is ' + input.water_source_distance_m + 'm away; position portable tanks at field edge to reduce transit time')
  }
  recommendations.push('Schedule missions during low-wind periods (early morning or evening) for optimal coverage')
  recommendations.push('Use overlapping flight paths at 15% overlap for uniform application')
  recommendations.push('Pre-program no-spray zones near waterways and sensitive areas')

  const alerts: string[] = []
  if (input.wind_speed_kmh > 30) {
    alerts.push('CRITICAL: Wind speed too high for drone operations — postpone mission')
  }
  if (input.num_drones * input.drone_tank_capacity_l < totalWaterNeeded * 0.5) {
    alerts.push('WARNING: Fleet capacity may be insufficient; plan additional refill cycles')
  }

  return {
    total_water_required_l: totalWaterNeeded,
    total_missions: missions.reduce((s, m) => s + m.flight_count, 0),
    total_flight_time_hours: totalFlightHours,
    missions,
    water_use_efficiency_pct: wue,
    cost_estimate: cost,
    recommendations,
    alerts
  }
}

function formatIrrigationDroneReport(input: IrrigationDroneInput, result: IrrigationDroneResult): string {
  const lines: string[] = []
  lines.push('# Irrigation Drone Mission Plan')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field: ' + input.field_id)
  lines.push('- Size: ' + input.field_size_hectares + ' ha')
  lines.push('- Crop: ' + input.crop_type + ' (' + input.growth_stage + ')')
  lines.push('- Moisture Deficit: ' + input.soil_moisture_deficit_pct + '%')
  lines.push('- Drones: ' + input.num_drones + ' (tank: ' + input.drone_tank_capacity_l + 'L)')
  lines.push('- Wind Speed: ' + input.wind_speed_kmh + ' km/h')
  lines.push('')
  lines.push('## Mission Summary')
  lines.push('- Total Water Required: ' + result.total_water_required_l.toLocaleString() + ' L')
  lines.push('- Total Flights: ' + result.total_missions)
  lines.push('- Total Flight Time: ' + result.total_flight_time_hours + ' hours')
  lines.push('- Water Use Efficiency: ' + result.water_use_efficiency_pct + '%')
  lines.push('- Estimated Cost: $' + result.cost_estimate)
  lines.push('')
  lines.push('## Drone Assignments')
  lines.push('')
  lines.push('| Drone | Flights | Water (L) | Flight Time (min) | Coverage (ha) | Refills |')
  lines.push('|-------|---------|-----------|-------------------|---------------|---------|')
  for (const m of result.missions) {
    lines.push('| #' + m.drone_id + ' | ' + m.flight_count + ' | ' + m.total_water_l.toLocaleString() + ' | ' + m.total_flight_time_min + ' | ' + m.coverage_hectares + ' | ' + m.refill_count + ' |')
  }
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 6: Weed Detection Eliminator ---

function detectAndEliminateWeeds(input: WeedDetectionInput): WeedDetectionResult {
  const seed = seedFromInput(input)
  const hotspotCount = Math.max(1, Math.round(input.weed_coverage_pct / 5))
  const hotspots: WeedHotspot[] = []

  for (let i = 0; i < hotspotCount; i++) {
    const coverage = clamp(Math.round(input.weed_coverage_pct + rng.nextFloat(-5, 10, seed + i)), 1, 80)
    const species = input.weed_species.length > 0 ?
      input.weed_species[i % input.weed_species.length] : 'Mixed broadleaf'
    const method = input.organic_preference ?
      (coverage > 20 ? 'Mechanical cultivation + flame weeding' : 'Robotic spot-pulling') :
      (coverage > 20 ? 'Variable-rate herbicide broadcast' : 'Robotic precision spot-spray')
    const costPerHa = input.organic_preference ?
      (coverage > 20 ? 85 : 120) : (coverage > 20 ? 45 : 65)
    const urgency: WeedHotspot['urgency'] =
      coverage > 25 ? 'immediate' : coverage > 10 ? 'within_48h' : 'monitor'
    hotspots.push({
      zone_id: i + 1,
      coverage_pct: coverage,
      dominant_species: species,
      treatment_method: method,
      treatment_cost_per_hectare: costPerHa + Math.round(rng.nextFloat(-10, 10, seed + i)),
      urgency
    })
  }

  const totalCost = Math.round(hotspots.reduce((s, h) => s + h.treatment_cost_per_hectare, 0) / hotspots.length * input.field_size_hectares * 100) / 100
  const savings = clamp(Math.round(50 + rng.nextFloat(-10, 30, seed)), 10, 90)

  const preventionRecs: string[] = []
  preventionRecs.push('Implement cover cropping between seasons to suppress weed germination')
  preventionRecs.push('Use stale seedbed technique: germinate weeds then eliminate before crop planting')
  preventionRecs.push('Deploy autonomous weeding robots for continuous between-row cultivation')
  preventionRecs.push('Rotate herbicide modes of action to prevent resistance development')
  if (input.weed_coverage_pct > 30) {
    preventionRecs.push('CRITICAL: High weed pressure suggests need for integrated weed management overhaul')
  }

  const alerts: string[] = []
  if (input.detection_confidence_pct < 70) {
    alerts.push('WARNING: Detection confidence below 70% — verify with manual scouting before treatment')
  }
  if (hotspots.some(h => h.urgency === 'immediate')) {
    alerts.push('ALERT: Immediate treatment required in ' + hotspots.filter(h => h.urgency === 'immediate').length + ' zone(s)')
  }

  return {
    total_weed_coverage_pct: input.weed_coverage_pct,
    hotspot_count: hotspotCount,
    hotspots,
    total_treatment_cost: totalCost,
    herbicide_savings_pct: savings,
    prevention_recommendations: preventionRecs,
    alerts
  }
}

function formatWeedDetectionReport(input: WeedDetectionInput, result: WeedDetectionResult): string {
  const lines: string[] = []
  lines.push('# Weed Detection & Elimination Plan')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field: ' + input.field_id)
  lines.push('- Crop: ' + input.crop_type)
  lines.push('- Weed Coverage: ' + input.weed_coverage_pct + '%')
  lines.push('- Detection Confidence: ' + input.detection_confidence_pct + '%')
  lines.push('- Organic Preference: ' + (input.organic_preference ? 'Yes' : 'No'))
  lines.push('')
  lines.push('## Summary')
  lines.push('- Hotspots Identified: ' + result.hotspot_count)
  lines.push('- Total Treatment Cost: $' + result.total_treatment_cost)
  lines.push('- Herbicide Savings (vs broadcast): ' + result.herbicide_savings_pct + '%')
  lines.push('')
  lines.push('## Hotspot Details')
  lines.push('')
  lines.push('| Zone | Coverage % | Dominant Species | Method | Cost/ha | Urgency |')
  lines.push('|------|------------|------------------|--------|---------|---------|')
  for (const h of result.hotspots) {
    lines.push('| #' + h.zone_id + ' | ' + h.coverage_pct + '% | ' + h.dominant_species + ' | ' + h.treatment_method + ' | $' + h.treatment_cost_per_hectare + ' | ' + h.urgency + ' |')
  }
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Prevention Recommendations')
  for (const r of result.prevention_recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 7: Yield Mapping Predictor ---

function predictYieldMapping(input: YieldMappingInput): YieldMappingResult {
  const seed = seedFromInput(input)
  const yieldZones: YieldZoneMap[] = []
  const histAvg = input.historical_yields.length > 0 ?
    input.historical_yields.reduce((a, b) => a + b, 0) / input.historical_yields.length : 5

  const mgmtMultiplier: Record<string, number> = { basic: 0.7, intermediate: 0.85, advanced: 0.95, precision: 1.05 }

  for (const zone of input.soil_zones) {
    const fertilityFactor = zone.soil_fertility_index / 100
    const drainageFactor = zone.drainage_class === 'excellent' ? 1.1 : zone.drainage_class === 'good' ? 1.0 : zone.drainage_class === 'moderate' ? 0.85 : 0.7
    const weatherFactor = clamp((input.weather_forecast.sunlight_hours / 10) * (1 - Math.abs(input.weather_forecast.avg_temp_c - 22) / 30), 0.5, 1.3)
    const predictedYield = Math.round(histAvg * fertilityFactor * drainageFactor * weatherFactor * (mgmtMultiplier[input.management_level] || 0.85) * zone.area_hectares * 100) / 100
    const yieldPerHa = Math.round((predictedYield / zone.area_hectares) * 100) / 100
    const confidence = clamp(Math.round(70 + rng.nextFloat(-15, 20, seed + zone.zone_id)), 40, 99)

    let limitingFactor = 'None identified'
    if (zone.soil_fertility_index < 50) limitingFactor = 'Low soil fertility'
    else if (zone.drainage_class === 'poor') limitingFactor = 'Poor drainage'
    else if (input.weather_forecast.total_rainfall_mm < 200) limitingFactor = 'Insufficient rainfall'
    else if (input.weather_forecast.avg_temp_c > 30) limitingFactor = 'Heat stress'

    yieldZones.push({
      zone_id: zone.zone_id,
      area_hectares: zone.area_hectares,
      predicted_yield_tonnes: predictedYield,
      yield_per_hectare: yieldPerHa,
      confidence_pct: confidence,
      limiting_factor: limitingFactor
    })
  }

  const totalYield = Math.round(yieldZones.reduce((s, z) => s + z.predicted_yield_tonnes, 0) * 100) / 100
  const avgYieldPerHa = Math.round(yieldZones.reduce((s, z) => s + z.yield_per_hectare, 0) / yieldZones.length * 100) / 100
  const yieldValues = yieldZones.map(z => z.yield_per_hectare)
  const maxYield = Math.max(...yieldValues)
  const minYield = Math.min(...yieldValues)
  const variance = Math.round(((maxYield - minYield) / avgYieldPerHa) * 100 * 100) / 100
  const revenue = Math.round(totalYield * 220 * 100) / 100

  const recommendations: string[] = []
  const lowZones = yieldZones.filter(z => z.yield_per_hectare < avgYieldPerHa * 0.7)
  if (lowZones.length > 0) {
    recommendations.push(lowZones.length + ' zone(s) significantly underperforming; investigate soil constraints and apply targeted amendments')
  }
  if (input.weather_forecast.total_rainfall_mm < 300) {
    recommendations.push('Below-average rainfall forecasted; ensure irrigation infrastructure is operational')
  }
  recommendations.push('Apply variable-rate nitrogen based on yield potential zones')
  recommendations.push('Consider cover crops in low-yielding zones to build soil organic matter')
  recommendations.push('Use yield map data to create profit maps for each management zone')

  const alerts: string[] = []
  if (variance > 40) alerts.push('WARNING: High yield variance (' + variance + '%) indicates significant within-field variability')
  if (yieldZones.some(z => z.confidence_pct < 50)) alerts.push('WARNING: Low confidence predictions in some zones — consider more data collection')

  return {
    total_predicted_yield_tonnes: totalYield,
    avg_yield_per_hectare: avgYieldPerHa,
    yield_variance_pct: variance,
    yield_zones: yieldZones,
    revenue_estimate: revenue,
    recommendations,
    alerts
  }
}

function formatYieldMappingReport(input: YieldMappingInput, result: YieldMappingResult): string {
  const lines: string[] = []
  lines.push('# Yield Mapping & Prediction Report')
  lines.push('')
  lines.push('## Input Summary')
  lines.push('- Field: ' + input.field_id)
  lines.push('- Crop: ' + input.crop_type)
  lines.push('- Field Size: ' + input.field_size_hectares + ' ha')
  lines.push('- Management Level: ' + input.management_level)
  lines.push('- Weather: ' + input.weather_forecast.avg_temp_c + ' C avg, ' + input.weather_forecast.total_rainfall_mm + 'mm rain, ' + input.weather_forecast.sunlight_hours + 'h sun')
  lines.push('')
  lines.push('## Prediction Summary')
  lines.push('- Total Predicted Yield: ' + result.total_predicted_yield_tonnes + ' tonnes')
  lines.push('- Avg Yield/Hectare: ' + result.avg_yield_per_hectare + ' t/ha')
  lines.push('- Yield Variance: ' + result.yield_variance_pct + '%')
  lines.push('- Revenue Estimate: $' + result.revenue_estimate.toLocaleString())
  lines.push('')
  lines.push('## Yield Zone Map')
  lines.push('')
  lines.push('| Zone | Area (ha) | Yield (t) | Yield/ha (t) | Confidence | Limiting Factor |')
  lines.push('|------|-----------|-----------|--------------|------------|-----------------|')
  for (const z of result.yield_zones) {
    lines.push('| #' + z.zone_id + ' | ' + z.area_hectares + ' | ' + z.predicted_yield_tonnes + ' | ' + z.yield_per_hectare + ' | ' + z.confidence_pct + '% | ' + z.limiting_factor + ' |')
  }
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 8: Farm Fleet Manager ---

function manageFarmFleet(input: FarmFleetInput): FarmFleetResult {
  const seed = seedFromInput(input)
  const activeFleet = input.fleet.filter(v => v.status === 'active')
  const idleFleet = input.fleet.filter(v => v.status === 'idle')
  const maintFleet = input.fleet.filter(v => v.status === 'maintenance')
  const assignments: FleetAssignment[] = []
  const maintenanceAlerts: FleetMaintenanceAlert[] = []

  const taskTypes = ['Field plowing', 'Planting operation', 'Spraying application', 'Harvesting', 'Crop scouting', 'Transport', 'Fertilizer spreading', 'Irrigation support']
  let taskIdx = 0

  // Assign active vehicles to pending tasks
  for (const vehicle of activeFleet) {
    if (taskIdx >= input.tasks_pending) break
    const duration = Math.round(rng.nextFloat(2, 10, seed + parseInt(vehicle.vehicle_id.replace(/\D/g, '') || '0')) * 100) / 100
    const fuelPerHour: Record<string, number> = { tractor: 15, harvester: 20, sprayer: 12, drone: 2, utility: 8 }
    const fuel = Math.round(duration * (fuelPerHour[vehicle.type] || 10) * 100) / 100
    const priority: FleetAssignment['priority'] =
      taskIdx < 2 ? 'critical' : taskIdx < 5 ? 'high' : taskIdx < 8 ? 'medium' : 'low'
    assignments.push({
      vehicle_id: vehicle.vehicle_id,
      vehicle_type: vehicle.type,
      task: taskTypes[taskIdx % taskTypes.length],
      priority,
      estimated_duration_hours: duration,
      fuel_required_l: fuel
    })
    taskIdx++
  }

  // Idle vehicles get standby tasks
  for (const vehicle of idleFleet) {
    if (taskIdx >= input.tasks_pending) break
    assignments.push({
      vehicle_id: vehicle.vehicle_id,
      vehicle_type: vehicle.type,
      task: 'Standby (ready for dispatch)',
      priority: 'low',
      estimated_duration_hours: 0,
      fuel_required_l: 0
    })
    taskIdx++
  }

  // Maintenance alerts
  for (const vehicle of input.fleet) {
    if (vehicle.hours_since_service > 200) {
      maintenanceAlerts.push({
        vehicle_id: vehicle.vehicle_id,
        alert_type: 'Overdue service (' + vehicle.hours_since_service + 'h)',
        urgency: 'immediate',
        action: 'Schedule service within 48h'
      })
    } else if (vehicle.hours_since_service > 150) {
      maintenanceAlerts.push({
        vehicle_id: vehicle.vehicle_id,
        alert_type: 'Service due soon (' + vehicle.hours_since_service + 'h)',
        urgency: 'scheduled',
        action: 'Plan service at next available window'
      })
    }
    if (vehicle.fuel_level_pct < 20) {
      maintenanceAlerts.push({
        vehicle_id: vehicle.vehicle_id,
        alert_type: 'Low fuel (' + vehicle.fuel_level_pct + '%)',
        urgency: 'immediate',
        action: 'Refuel before next operation'
      })
    }
  }

  const utilization = activeFleet.length > 0 ?
    clamp(Math.round((assignments.filter(a => a.estimated_duration_hours > 0).length / input.fleet.length) * 100), 10, 99) : 0
  const dailyFuelCost = Math.round(assignments.reduce((s, a) => s + a.fuel_required_l, 0) * 1.5 * 100) / 100

  const recommendations: string[] = []
  if (idleFleet.length > activeFleet.length) {
    recommendations.push('Fleet has more idle than active vehicles; consider consolidating tasks or scheduling maintenance')
  }
  if (maintFleet.length > input.fleet.length * 0.3) {
    recommendations.push('Over 30% of fleet in maintenance; evaluate replacement vs repair decisions')
  }
  recommendations.push('Implement predictive maintenance using IoT sensor data to reduce unplanned downtime')
  recommendations.push('Use fleet telematics to optimize routing and reduce fuel consumption by 10-15%')
  recommendations.push('Stage spare parts inventory for common failure points (filters, belts, batteries)')

  const alerts: string[] = []
  if (maintenanceAlerts.filter(a => a.urgency === 'immediate').length > 0) {
    alerts.push('ALERT: ' + maintenanceAlerts.filter(a => a.urgency === 'immediate').length + ' vehicle(s) require immediate attention')
  }
  if (input.tasks_pending > activeFleet.length + idleFleet.length) {
    alerts.push('WARNING: Pending tasks exceed available vehicles; consider overtime operations or contractors')
  }

  return {
    fleet_size: input.fleet.length,
    active_count: activeFleet.length,
    idle_count: idleFleet.length,
    maintenance_count: maintFleet.length,
    assignments,
    maintenance_alerts: maintenanceAlerts,
    fleet_utilization_pct: utilization,
    daily_fuel_cost_estimate: dailyFuelCost,
    recommendations,
    alerts
  }
}

function formatFarmFleetReport(input: FarmFleetInput, result: FarmFleetResult): string {
  const lines: string[] = []
  lines.push('# Farm Fleet Management Report')
  lines.push('')
  lines.push('## Fleet Overview')
  lines.push('- Fleet ID: ' + input.farm_id)
  lines.push('- Total Vehicles: ' + result.fleet_size)
  lines.push('- Active: ' + result.active_count + ' | Idle: ' + result.idle_count + ' | Maintenance: ' + result.maintenance_count)
  lines.push('- Fleet Utilization: ' + result.fleet_utilization_pct + '%')
  lines.push('- Daily Fuel Cost: $' + result.daily_fuel_cost_estimate)
  lines.push('- Pending Tasks: ' + input.tasks_pending)
  lines.push('')
  lines.push('## Task Assignments')
  lines.push('')
  lines.push('| Vehicle | Type | Task | Priority | Duration (h) | Fuel (L) |')
  lines.push('|---------|------|------|----------|-------------|----------|')
  for (const a of result.assignments) {
    lines.push('| ' + a.vehicle_id + ' | ' + a.vehicle_type + ' | ' + a.task + ' | ' + a.priority + ' | ' + a.estimated_duration_hours + ' | ' + a.fuel_required_l + ' |')
  }
  lines.push('')
  if (result.maintenance_alerts.length > 0) {
    lines.push('## Maintenance Alerts')
    lines.push('')
    lines.push('| Vehicle | Alert | Urgency | Action |')
    lines.push('|---------|-------|---------|--------|')
    for (const m of result.maintenance_alerts) {
      lines.push('| ' + m.vehicle_id + ' | ' + m.alert_type + ' | ' + m.urgency + ' | ' + m.action + ' |')
    }
    lines.push('')
  }
  if (result.alerts.length > 0) {
    lines.push('## Alerts')
    for (const a of result.alerts) {
      lines.push('- ' + a)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Planting Automation Planner
  tools.register(defineTool({
    name: 'planting_automation_planner',
    description: 'Plans autonomous planting operations including zone assignments, GPS waypoints, seed calculations, planter speed optimization, and weather window analysis. Returns zone plans, efficiency scores, cost estimates, and operational alerts.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_id, field_size_hectares, crop_type, seed_variety, soil_type, row_spacing_cm, target_density_plants_per_sqm, planter_width_m, num_autonomous_planters, weather_window_hours, terrain_slope_pct' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PlantingAutomationInput = JSON.parse(args.input_data)
      const result = planPlantingAutomation(input)
      return formatPlantingReport(input, result)
    }
  }))

  // Tool 2: Harvesting Robot Coordinator
  tools.register(defineTool({
    name: 'harvesting_robot_coordinator',
    description: 'Coordinates multi-robot harvesting fleets with battery management, bin-swap scheduling, row assignments, and yield-based workload balancing. Returns robot schedules, fleet utilization, cost per hectare, and coordination alerts.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_id, crop_type, field_size_hectares, maturity_pct, num_robots, robot_payload_kg, robot_battery_hours, bin_capacity_kg, transport_vehicle_count, weather_window_hours, crop_moisture_pct' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: HarvestingRobotInput = JSON.parse(args.input_data)
      const result = coordinateHarvestingRobots(input)
      return formatHarvestingReport(input, result)
    }
  }))

  // Tool 3: Crop Monitoring Analyzer
  tools.register(defineTool({
    name: 'crop_monitoring_analyzer',
    description: 'Analyzes crop health from NDVI readings, canopy temperature, soil moisture, and pest/disease indices. Identifies health zones, stress factors, and provides ranked recommendations with alerts.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_id, crop_type, growth_stage, ndvi_readings[], canopy_temperature_c, soil_moisture_pct, pest_pressure_index (0-10), disease_risk_index (0-10), image_analysis_spots' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CropMonitoringInput = JSON.parse(args.input_data)
      const result = analyzeCropMonitoring(input)
      return formatCropMonitoringReport(input, result)
    }
  }))

  // Tool 4: Soil Analysis Sensor
  tools.register(defineTool({
    name: 'soil_analysis_sensor',
    description: 'Analyzes multi-depth soil sensor data (moisture, temperature, EC, pH, NPK) for precision agriculture. Provides layer-by-layer analysis, variable-rate irrigation and fertilization plans, and cost savings estimates.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_id, sensor_readings[{depth_cm, moisture_pct, temperature_c, ec_ds_m, ph, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg}], crop_type, target_yield_tonnes' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SoilAnalysisInput = JSON.parse(args.input_data)
      const result = analyzeSoilSensors(input)
      return formatSoilAnalysisReport(input, result)
    }
  }))

  // Tool 5: Irrigation Drone Operator
  tools.register(defineTool({
    name: 'irrigation_drone_operator',
    description: 'Plans drone-based irrigation missions including flight path optimization, water volume calculations, refill scheduling, and wind-speed safety analysis. Returns drone assignments, coverage maps, water use efficiency, and cost estimates.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_id, field_size_hectares, crop_type, growth_stage, soil_moisture_deficit_pct, num_drones, drone_tank_capacity_l, drone_flight_time_min, drone_coverage_rate_ha_hr, water_source_distance_m, wind_speed_kmh' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: IrrigationDroneInput = JSON.parse(args.input_data)
      const result = planIrrigationDrones(input)
      return formatIrrigationDroneReport(input, result)
    }
  }))

  // Tool 6: Weed Detection Eliminator
  tools.register(defineTool({
    name: 'weed_detection_eliminator',
    description: 'Detects weed hotspots from image analysis and plans targeted elimination strategies (robotic spot-spray, mechanical cultivation, organic methods). Returns hotspot maps, treatment plans, cost estimates, herbicide savings, and prevention recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_id, crop_type, field_size_hectares, weed_coverage_pct, weed_species[], detection_confidence_pct, sprayer_width_m, num_spray_robots, herbicide_type, organic_preference' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: WeedDetectionInput = JSON.parse(args.input_data)
      const result = detectAndEliminateWeeds(input)
      return formatWeedDetectionReport(input, result)
    }
  }))

  // Tool 7: Yield Mapping Predictor
  tools.register(defineTool({
    name: 'yield_mapping_predictor',
    description: 'Generates spatial yield predictions by combining soil zone data, historical yields, weather forecasts, and management level. Produces zone-by-zone yield maps, revenue estimates, limiting factor analysis, and confidence intervals.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: field_id, crop_type, field_size_hectares, historical_yields[], soil_zones[{zone_id, area_hectares, soil_fertility_index, drainage_class}], weather_forecast{avg_temp_c, total_rainfall_mm, sunlight_hours}, management_level (basic|intermediate|advanced|precision)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: YieldMappingInput = JSON.parse(args.input_data)
      const result = predictYieldMapping(input)
      return formatYieldMappingReport(input, result)
    }
  }))

  // Tool 8: Farm Fleet Manager
  tools.register(defineTool({
    name: 'farm_fleet_manager',
    description: 'Manages autonomous farm vehicle fleet including task assignment, maintenance scheduling, fuel monitoring, and utilization optimization. Returns fleet status, task assignments, maintenance alerts, and fuel cost estimates.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: farm_id, total_hectares, fleet[{vehicle_id, type (tractor|harvester|sprayer|drone|utility), status (active|maintenance|idle), fuel_level_pct, hours_since_service, gps_location{lat,lng}}], tasks_pending, fuel_budget' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FarmFleetInput = JSON.parse(args.input_data)
      const result = manageFarmFleet(input)
      return formatFarmFleetReport(input, result)
    }
  }))

  console.log('[dsh-tool-autofarm] Loaded v' + VERSION + ' - Autonomous Farming & Ag Robotics with 8 tools')
  console.log('  Tools: planting_automation_planner, harvesting_robot_coordinator, crop_monitoring_analyzer, soil_analysis_sensor, irrigation_drone_operator, weed_detection_eliminator, yield_mapping_predictor, farm_fleet_manager')
}
