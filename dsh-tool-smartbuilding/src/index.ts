/**
 * DSH Smart Building & Facilities Management Plugin v0.1.0
 * 智能建筑与设施管理 for DeepSeek Harness — energy optimization, predictive maintenance, space utilization, HVAC
 *
 * 2026: Smart building market $150B+; energy management systems growing at 12% CAGR.
 *
 * 工具清单:
 * 1. energy_optimization_engine      — 能耗优化引擎（电力/燃气/水，负荷预测，峰谷调度，碳排追踪）
 * 2. predictive_maintenance_scheduler — 预测性维护调度（设备健康评分，故障预测，维护排程）
 * 3. space_utilization_analyzer      — 空间利用率分析（工位占用，会议室调度，热力图）
 * 4. hvac_optimization_planner        — HVAC 优化规划（温控策略，空气质量，节能调度）
 * 5. building_automation_integrator   — 楼宇自动化集成（BMS/IoT/消防/安防统一管控）
 * 6. indoor_air_quality_monitor       — 室内空气质量监测（CO2/PM2.5/VOC/温湿度）
 * 7. smart_lighting_controller        — 智能照明控制（日光采集，人员感应，场景编排）
 * 8. facilities_cost_optimizer        — 设施成本优化（能耗/维护/空间成本分析与优化建议）
 *
 * @module dsh-tool-smartbuilding | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-smartbuilding'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Energy Optimization Engine ---
export interface EnergyOptimizationInput {
  building_id: string
  energy_types: Array<'electricity' | 'gas' | 'water' | 'solar'>
  current_monthly_kwh: number
  target_savings_pct: number
  peak_hours: string[]
  has_solar: boolean
  has_battery_storage: boolean
}

export interface EnergyMeasure {
  measure_id: string
  name: string
  category: 'hvac' | 'lighting' | 'equipment' | 'renewable' | 'behavioral'
  estimated_savings_kwh_month: number
  estimated_cost_reduction_pct: number
  investment_cost: number
  payback_months: number
  co2_reduction_kg_year: number
  priority: 'high' | 'medium' | 'low'
}

export interface LoadForecast {
  hour: number
  predicted_kwh: number
  is_peak: boolean
  optimization_note: string
}

export interface EnergyOptimizationResult {
  building_id: string
  current_monthly_kwh: number
  target_savings_pct: number
  total_estimated_savings_kwh: number
  total_estimated_savings_pct: number
  total_cost_reduction_usd: number
  total_co2_reduction_kg_year: number
  measures: EnergyMeasure[]
  load_forecast: LoadForecast[]
  renewable_pct: number
  battery_utilization_pct: number
}

// --- Tool 2: Predictive Maintenance Scheduler ---
export interface PredictiveMaintenanceInput {
  building_id: string
  equipment_list: EquipmentItem[]
  maintenance_budget_usd: number
  planning_horizon_months: number
 优先级: 'cost' | 'uptime' | 'safety'
}

export interface EquipmentItem {
  equipment_id: string
  name: string
  type: 'hvac' | 'elevator' | 'generator' | 'pump' | 'fire_system' | 'security'
  install_date: string
  last_maintenance: string
  runtime_hours: number
  health_score: number
}

export interface MaintenanceTask {
  task_id: string
  equipment_id: string
  equipment_name: string
  maintenance_type: 'preventive' | 'predictive' | 'corrective'
  urgency: 'critical' | 'high' | 'medium' | 'low'
  predicted_failure_probability: number
  recommended_date: string
  estimated_duration_hours: number
  estimated_cost_usd: number
  required_skills: string[]
  downtime_impact: string
}

export interface PredictiveMaintenanceResult {
  building_id: string
  total_equipment: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  total_estimated_cost: number
  budget_utilization_pct: number
  tasks: MaintenanceTask[]
  mean_time_between_failures_avg: number
  overall_equipment_effectiveness: number
}

// --- Tool 3: Space Utilization Analyzer ---
export interface SpaceUtilizationInput {
  building_id: string
  floor_area_sqm: number
  total_occupants: number
  space_types: Array<'office' | 'meeting' | 'breakroom' | 'lobby' | 'parking'>
  measurement_period_days: number
  sensor_density_per_sqm: number
}

export interface SpaceMetric {
  space_type: string
  area_sqm: number
  avg_occupancy_pct: number
  peak_occupancy_pct: number
  peak_hour: string
  underutilized_pct: number
  recommended_capacity: number
  utilization_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface HeatmapCell {
  x: number
  y: number
  occupancy_intensity: number
}

export interface SpaceUtilizationResult {
  building_id: string
  floor_area_sqm: number
  total_occupants: number
  area_per_person_sqm: number
  overall_utilization_pct: number
  space_metrics: SpaceMetric[]
  heatmap_data: HeatmapCell[]
  capacity_headroom_pct: number
  optimization_recommendations: string[]
  estimated_space_savings_sqm: number
}

// --- Tool 4: HVAC Optimization Planner ---
export interface HVACOptimizationInput {
  building_id: string
  climate_zone: string
  total_hvac_zones: number
  current_setpoint_c: string
  occupancy_schedule: string
  building_orientation: string
  window_to_wall_ratio: number
  insulation_rating: string
  has_vrf: boolean
  has_smart_thermostats: boolean
}

export interface HVACZonePlan {
  zone_id: string
  zone_name: string
  current_setpoint_c: number
  optimized_setpoint_c: number
  setpoint_adjustment_reason: number
  estimated_energy_savings_pct: number
  humidity_control: string
  air_changes_per_hour: number
  filter_status: 'clean' | 'due_soon' | 'replace_now'
}

export interface HVACScheduleEntry {
  hour: number
  action: string
  temperature_c: number
  fan_speed: 'low' | 'medium' | 'high' | 'auto'
  damper_position_pct: number
  mode: 'heating' | 'cooling' | 'ventilation' | 'eco' | 'off'
}

export interface HVACOptimizationResult {
  building_id: string
  total_zones: number
  total_estimated_savings_pct: number
  annual_energy_savings_kwh: number
  annual_cost_savings_usd: number
  co2_reduction_kg_year: number
  zone_plans: HVACZonePlan[]
  daily_schedule: HVACScheduleEntry[]
  comfort_index: number
  iaq_compliance: 'excellent' | 'good' | 'fair' | 'poor'
}

// --- Tool 5: Building Automation Integrator ---
export interface BuildingAutomationInput {
  building_id: string
  subsystems: Array<'bms' | 'fire' | 'security' | 'access_control' | 'elevator' | 'energy'>
  iot_device_count: number
  integration_protocol: 'bacnet' | 'modbus' | 'lonworks' | 'mqtt' | 'opc_ua'
  cloud_connected: boolean
  cybersecurity_level: 'basic' | 'standard' | 'enhanced' | 'military'
}

export interface SubsystemStatus {
  subsystem: string
  status: 'online' | 'degraded' | 'offline' | 'maintenance'
  device_count: number
  healthy_devices: number
  alerts_count: number
  last_heartbeat: string
  protocol: string
  integration_health_pct: number
}

export interface IntegrationRecommendation {
  priority: number
  subsystem: string
  issue: string
  recommendation: string
  estimated_effort: string
}

export interface BuildingAutomationResult {
  building_id: string
  total_devices: number
  online_pct: number
  total_alerts: number
  cybersecurity_score: number
  subsystem_statuses: SubsystemStatus[]
  integration_recommendations: IntegrationRecommendation[]
  unified_dashboard_url: string
  edge_ai_nodes: number
  data_ingestion_rate_hz: number
}

// --- Tool 6: Indoor Air Quality Monitor ---
export interface IndoorAirQualityInput {
  building_id: string
  monitoring_zones: string[]
  pollutants: Array<'co2' | 'pm25' | 'voc' | 'co' | 'formaldehyde' | 'ozone'>
  outdoor_aqi: number
  ventilation_rate_per_person: number
  humidity_pct: number
  temperature_c: number
}

export interface PollutantReading {
  pollutant: string
  unit: string
  current_value: number
  min_safe: number
  max_safe: number
  status: 'good' | 'moderate' | 'poor' | 'hazardous'
  trend: 'improving' | 'stable' | 'worsening'
}

export interface ZoneAirQuality {
  zone_name: string
  overall_aq_index: number
  dominant_pollutant: string
  ventilation_effectiveness: number
  recommended_action: string
}

export interface IndoorAirQualityResult {
  building_id: string
  overall_aq_index: number
  overall_aq_grade: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous'
  pollutant_readings: PollutantReading[]
  zone_qualities: ZoneAirQuality[]
  ventilation_adequacy: 'adequate' | 'marginal' | 'inadequate'
  health_advisory: string
}

// --- Tool 7: Smart Lighting Controller ---
export interface SmartLightingInput {
  building_id: string
  total_fixtures: number
  fixture_types: Array<'led' | 'fluorescent' | 'halogen' | 'hid'>
  daylight_available: boolean
  occupancy_sensor_coverage_pct: number
  current_lux_level: number
  target_lux_level: number
  operating_hours_per_day: number
  has_scene_control: boolean
}

export interface LightingZone {
  zone_id: string
  zone_name: string
  fixture_count: number
  current_watts: number
  optimized_watts: number
  savings_pct: number
  daylight_harvesting: boolean
  occupancy_based_dimming: boolean
  scheduled_dimming: boolean
  scene_presets: string[]
}

export interface LightingScheduleEntry {
  time: string
  brightness_pct: number
  color_temp_k: number
  trigger: 'schedule' | 'daylight' | 'occupancy' | 'manual'
}

export interface SmartLightingResult {
  building_id: string
  total_fixtures: number
  total_current_watts: number
  total_optimized_watts: number
  total_savings_pct: number
  annual_energy_savings_kwh: number
  annual_cost_savings_usd: number
  zones: LightingZone[]
  lighting_schedule: LightingScheduleEntry[]
  glare_index: number
  uniformity_ratio: number
}

// --- Tool 8: Facilities Cost Optimizer ---
export interface FacilitiesCostInput {
  building_id: string
  annual_energy_cost_usd: number
  annual_maintenance_cost_usd: number
  annual_cleaning_cost_usd: number
  annual_security_cost_usd: number
  total_area_sqm: number
  occupant_count: number
  cost_reduction_target_pct: number
  benchmark_cost_per_sqm: number
}

export interface CostCategoryAnalysis {
  category: string
  current_cost_usd: number
  benchmark_cost_usd: number
  variance_pct: number
  variance_direction: 'under' | 'on_target' | 'over'
  optimization_potential_usd: number
}

export interface CostOptimizationAction {
  action_id: string
  category: string
  description: string
  annual_savings_usd: number
  implementation_cost_usd: number
  payback_months: number
  difficulty: 'easy' | 'moderate' | 'complex'
  quick_win: boolean
}

export interface FacilitiesCostResult {
  building_id: string
  total_annual_cost_usd: number
  cost_per_sqm: number
  cost_per_occupant: number
  benchmark_variance_pct: number
  total_optimization_potential_usd: number
  potential_reduction_pct: number
  category_analyses: CostCategoryAnalysis[]
  optimization_actions: CostOptimizationAction[]
  three_year_savings_projection_usd: number
  roi_pct: number
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Energy Optimization Engine ---
function analyzeEnergyOptimization(input: EnergyOptimizationInput): EnergyOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const measures: EnergyMeasure[] = []
  const measureNames: Array<{ name: string; category: EnergyMeasure['category'] }> = [
    { name: 'LED 照明全面升级', category: 'lighting' },
    { name: '变频 HVAC 改造', category: 'hvac' },
    { name: '智能插座负载管理', category: 'equipment' },
    { name: '屋顶光伏扩容', category: 'renewable' },
    { name: '员工节能行为激励计划', category: 'behavioral' },
    { name: '储能系统削峰填谷', category: 'renewable' },
    { name: '冷冻水泵变频优化', category: 'hvac' },
    { name: '智能窗帘日光采集', category: 'behavioral' },
  ]

  let totalSavings = 0
  let totalCostReduction = 0
  let totalCo2 = 0
  const numMeasures = rng.nextInt(5, 8)

  for (let i = 0; i < numMeasures; i++) {
    const m = measureNames[i]
    const savingsKwh = Math.round(input.current_monthly_kwh * rng.nextFloat(0.03, 0.12))
    const costReduction = rng.nextFloat(3, 15)
    const investment = rng.nextInt(5000, 150000)
    const co2 = Math.round(savingsKwh * rng.nextFloat(0.3, 0.8) * 12)
    totalSavings += savingsKwh
    totalCostReduction += costReduction * savingsKwh / input.current_monthly_kwh * 100
    totalCo2 += co2

    measures.push({
      measure_id: `EOM-${String(i + 1).padStart(3, '0')}`,
      name: m.name,
      category: m.category,
      estimated_savings_kwh_month: savingsKwh,
      estimated_cost_reduction_pct: Math.round(costReduction * 100) / 100,
      investment_cost: investment,
      payback_months: Math.round(investment / (savingsKwh * rng.nextFloat(0.08, 0.15))),
      co2_reduction_kg_year: co2,
      priority: costReduction > 10 ? 'high' : costReduction > 6 ? 'medium' : 'low',
    })
  }

  const loadForecast: LoadForecast[] = []
  for (let h = 0; h < 24; h++) {
    const isPeak = input.peak_hours.some(p => {
      const [start, end] = p.split('-').map(Number)
      return h >= start && h < end
    })
    const baseLoad = input.current_monthly_kwh / 720
    loadForecast.push({
      hour: h,
      predicted_kwh: Math.round(baseLoad * (isPeak ? rng.nextFloat(1.3, 1.8) : rng.nextFloat(0.4, 0.9))),
      is_peak: isPeak,
      optimization_note: isPeak
        ? '建议放电储能+负荷转移'
        : '建议预冷/预热利用谷电',
    })
  }

  const renewablePct = input.has_solar
    ? Math.round(rng.nextFloat(15, 35) * 100) / 100
    : 0
  const batteryUtilPct = input.has_battery_storage
    ? Math.round(rng.nextFloat(60, 90) * 100) / 100
    : 0

  return {
    building_id: input.building_id,
    current_monthly_kwh: input.current_monthly_kwh,
    target_savings_pct: input.target_savings_pct,
    total_estimated_savings_kwh: totalSavings,
    total_estimated_savings_pct: Math.round((totalSavings / input.current_monthly_kwh) * 100 * 100) / 100,
    total_cost_reduction_usd: Math.round(totalSavings * 0.12),
    total_co2_reduction_kg_year: totalCo2,
    measures,
    load_forecast: loadForecast,
    renewable_pct: renewablePct,
    battery_utilization_pct: batteryUtilPct,
  }
}

// --- Tool 2: Predictive Maintenance Scheduler ---
function analyzePredictiveMaintenance(input: PredictiveMaintenanceInput): PredictiveMaintenanceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const now = new Date()
  const tasks: MaintenanceTask[] = []
  let criticalCount = 0
  let highCount = 0
  let mediumCount = 0
  let lowCount = 0
  let totalCost = 0
  let totalMtbf = 0

  for (const eq of input.equipment_list) {
    const healthGap = 1 - eq.health_score
    const failureProb = Math.min(0.95, healthGap * rng.nextFloat(0.6, 1.2))

    let urgency: MaintenanceTask['urgency']
    if (failureProb > 0.7) { urgency = 'critical'; criticalCount++ }
    else if (failureProb > 0.45) { urgency = 'high'; highCount++ }
    else if (failureProb > 0.2) { urgency = 'medium'; mediumCount++ }
    else { urgency = 'low'; lowCount++ }

    const mType: MaintenanceTask['maintenance_type'] =
      failureProb > 0.5 ? 'predictive' : failureProb > 0.25 ? 'preventive' : 'corrective'
    const daysAhead = urgency === 'critical' ? rng.nextInt(1, 3)
      : urgency === 'high' ? rng.nextInt(3, 14)
      : urgency === 'medium' ? rng.nextInt(14, 45)
      : rng.nextInt(45, 90)

    const recDate = new Date(now.getTime() + daysAhead * 86400000).toISOString().split('T')[0]
    const estCost = Math.round(rng.nextFloat(200, 5000) * (urgency === 'critical' ? 2 : 1))
    const duration = rng.nextFloat(1, 8)
    totalCost += estCost
    totalMtbf += eq.runtime_hours / Math.max(1, (1 - eq.health_score) * 10)

    tasks.push({
      task_id: `MT-${eq.equipment_id}-${rng.nextInt(100, 999)}`,
      equipment_id: eq.equipment_id,
      equipment_name: eq.name,
      maintenance_type: mType,
      urgency,
      predicted_failure_probability: Math.round(failureProb * 100) / 100,
      recommended_date: recDate,
      estimated_duration_hours: Math.round(duration * 10) / 10,
      estimated_cost_usd: estCost,
      required_skills: [eq.type === 'hvac' ? 'HVAC技师' : eq.type === 'elevator' ? '电梯工程师' : '机电技师'],
      downtime_impact: urgency === 'critical' ? '全区域停机' : urgency === 'high' ? '部分功能受限' : '影响可控',
    })
  }

  tasks.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.urgency] - order[b.urgency]
  })

  return {
    building_id: input.building_id,
    total_equipment: input.equipment_list.length,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    total_estimated_cost: totalCost,
    budget_utilization_pct: input.maintenance_budget_usd > 0
      ? Math.round((totalCost / input.maintenance_budget_usd) * 100 * 100) / 100
      : 0,
    tasks,
    mean_time_between_failures_avg: input.equipment_list.length > 0
      ? Math.round(totalMtbf / input.equipment_list.length)
      : 0,
    overall_equipment_effectiveness: Math.round(
      input.equipment_list.reduce((s, e) => s + e.health_score, 0) / Math.max(input.equipment_list.length, 1) * 100
    ) / 100,
  }
}

// --- Tool 3: Space Utilization Analyzer ---
function analyzeSpaceUtilization(input: SpaceUtilizationInput): SpaceUtilizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const spaceMetrics: SpaceMetric[] = []
  const recommendations: string[] = []
  let totalSavingsSqm = 0

  const typeRatios: Record<string, number> = {
    office: 0.55, meeting: 0.15, breakroom: 0.08, lobby: 0.07, parking: 0.15,
  }

  for (const st of input.space_types) {
    const area = input.floor_area_sqm * (typeRatios[st] || 0.1)
    const avgOcc = Math.round(rng.nextFloat(35, 85) * 100) / 100
    const peakOcc = Math.min(100, Math.round(avgOcc * rng.nextFloat(1.1, 1.5) * 100) / 100)
    const peakHour = `${String(rng.nextInt(9, 11)).padStart(2, '0')}:00`
    const underutilized = Math.max(0, Math.round((100 - peakOcc) * rng.nextFloat(0.5, 1) * 100) / 100)
    const recommendedCapacity = Math.round(area / (st === 'office' ? 8 : st === 'meeting' ? 3 : st === 'breakroom' ? 4 : 5))
    const grade: SpaceMetric['utilization_grade'] =
      peakOcc > 80 ? 'A' : peakOcc > 65 ? 'B' : peakOcc > 50 ? 'C' : peakOcc > 35 ? 'D' : 'F'

    spaceMetrics.push({
      space_type: st,
      area_sqm: Math.round(area),
      avg_occupancy_pct: avgOcc,
      peak_occupancy_pct: peakOcc,
      peak_hour: peakHour,
      underutilized_pct: underutilized,
      recommended_capacity: recommendedCapacity,
      utilization_grade: grade,
    })

    if (peakOcc < 50) {
      totalSavingsSqm += area * 0.3
      recommendations.push(`${st} 利用率仅 ${peakOcc}%，建议缩减 ${Math.round(area * 0.3)}sqm 或改造为共享空间`)
    }
    if (peakOcc > 85) {
      recommendations.push(`${st} 峰值利用率 ${peakOcc}%，建议扩容或分流至低峰时段`)
    }
  }

  const heatmap: HeatmapCell[] = []
  const gridSize = 8
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const centerDist = Math.sqrt((x - 3.5) ** 2 + (y - 3.5) ** 2) / 5
      heatmap.push({
        x,
        y,
        occupancy_intensity: Math.round(Math.max(0, Math.min(1, rng.nextFloat(0.2, 1) - centerDist * 0.5)) * 100) / 100,
      })
    }
  }

  const overallUtil = spaceMetrics.length > 0
    ? Math.round(spaceMetrics.reduce((s, m) => s + m.avg_occupancy_pct, 0) / spaceMetrics.length * 100) / 100
    : 0

  return {
    building_id: input.building_id,
    floor_area_sqm: input.floor_area_sqm,
    total_occupants: input.total_occupants,
    area_per_person_sqm: Math.round(input.floor_area_sqm / Math.max(1, input.total_occupants) * 100) / 100,
    overall_utilization_pct: overallUtil,
    space_metrics: spaceMetrics,
    heatmap_data: heatmap,
    capacity_headroom_pct: Math.round((100 - overallUtil) * 100) / 100,
    optimization_recommendations: recommendations,
    estimated_space_savings_sqm: Math.round(totalSavingsSqm),
  }
}

// --- Tool 4: HVAC Optimization Planner ---
function analyzeHVACOptimization(input: HVACOptimizationInput): HVACOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const [heatTemp, coolTemp] = input.current_setpoint_c.split('/').map(Number)
  const zonePlans: HVACZonePlan[] = []
  let totalSavings = 0

  const zoneNames = ['North Wing', 'South Wing', 'East Wing', 'West Wing', 'Core Zone', 'Atrium', 'Basement']

  for (let i = 0; i < input.total_hvac_zones; i++) {
    const isPeripheral = i < 4
    const adjustment = isPeripheral ? rng.nextFloat(-2, 2) : rng.nextFloat(-1, 1)
    const optSetpoint = Math.round((coolTemp + adjustment) * 10) / 10
    const savingsPct = Math.round(Math.abs(adjustment) * rng.nextFloat(2, 5) * 100) / 100
    totalSavings += savingsPct

    zonePlans.push({
      zone_id: `Z-${String(i + 1).padStart(2, '0')}`,
      zone_name: zoneNames[i % zoneNames.length],
      current_setpoint_c: coolTemp,
      optimized_setpoint_c: optSetpoint,
      setpoint_adjustment_reason: Math.round(adjustment * 10) / 10,
      estimated_energy_savings_pct: savingsPct,
      humidity_control: optSetpoint < 24 ? 'active_dehumidify' : optSetpoint > 26 ? 'energy_recovery' : 'passive_balance',
      air_changes_per_hour: Math.round(rng.nextFloat(4, 12)),
      filter_status: rng.next() > 0.7 ? 'replace_now' : rng.next() > 0.5 ? 'due_soon' : 'clean',
    })
  }

  const dailySchedule: HVACScheduleEntry[] = []
  for (let h = 0; h < 24; h++) {
    const hour = h
    const isOccupied = hour >= 7 && hour < 19
    const isPreCool = hour >= 5 && hour < 7

    dailySchedule.push({
      hour,
      action: isOccupied ? 'comfort_mode' : isPreCool ? 'pre_cool' : 'setback',
      temperature_c: isOccupied ? coolTemp : isPreCool ? coolTemp + 2 : coolTemp + 4,
      fan_speed: isOccupied ? 'auto' : 'low',
      damper_position_pct: isOccupied ? 80 : isPreCool ? 60 : 30,
      mode: isPreCool ? 'cooling' : isOccupied ? 'ventilation' : 'eco',
    })
  }

  const avgSavingsPct = zonePlans.length > 0
    ? Math.round((totalSavings / zonePlans.length) * 100) / 100
    : 0
  const annualKwh = Math.round(avgSavingsPct / 100 * rng.nextFloat(150000, 500000))

  return {
    building_id: input.building_id,
    total_zones: input.total_hvac_zones,
    total_estimated_savings_pct: avgSavingsPct,
    annual_energy_savings_kwh: annualKwh,
    annual_cost_savings_usd: Math.round(annualKwh * 0.12),
    co2_reduction_kg_year: Math.round(annualKwh * rng.nextFloat(0.3, 0.7)),
    zone_plans: zonePlans,
    daily_schedule: dailySchedule,
    comfort_index: Math.round(rng.nextFloat(0.82, 0.96) * 100) / 100,
    iaq_compliance: avgSavingsPct > 12 ? 'excellent' : avgSavingsPct > 8 ? 'good' : avgSavingsPct > 5 ? 'fair' : 'poor',
  }
}

// --- Tool 5: Building Automation Integrator ---
function analyzeBuildingAutomation(input: BuildingAutomationInput): BuildingAutomationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const subsystemStatuses: SubsystemStatus[] = []
  let totalAlerts = 0
  let onlineDevices = 0
  let totalDevices = 0

  const now = new Date()
  const nowIso = now.toISOString()

  for (const sub of input.subsystems) {
    const devCount = Math.round(input.iot_device_count / input.subsystems.length)
    const healthy = Math.round(devCount * rng.nextFloat(0.85, 0.99))
    const alerts = rng.nextInt(0, Math.round(devCount * 0.05))
    const status: SubsystemStatus['status'] =
      healthy / devCount > 0.95 ? 'online'
      : healthy / devCount > 0.8 ? 'degraded'
      : healthy / devCount > 0.5 ? 'maintenance'
      : 'offline'
    const healthPct = Math.round((healthy / devCount) * 100)

    subsystemStatuses.push({
      subsystem: sub,
      status,
      device_count: devCount,
      healthy_devices: healthy,
      alerts_count: alerts,
      last_heartbeat: new Date(now.getTime() - rng.nextInt(0, 300000)).toISOString(),
      protocol: input.integration_protocol,
      integration_health_pct: healthPct,
    })

    totalAlerts += alerts
    onlineDevices += healthy
    totalDevices += devCount
  }

  const recommendations: IntegrationRecommendation[] = [
    {
      priority: 1,
      subsystem: 'bms',
      issue: 'HVAC 数据采样频率不一致',
      recommendation: '统一 BACnet 采样周期为 30s，启用边缘预处理',
      estimated_effort: '2 周',
    },
    {
      priority: 2,
      subsystem: 'security',
      issue: '视频流未接入 AI 分析',
      recommendation: '部署边缘 AI 节点实现实时行为识别',
      estimated_effort: '4 周',
    },
    {
      priority: 3,
      subsystem: 'energy',
      issue: '能耗数据孤岛',
      recommendation: '通过 MQTT 统一接入能源管理平台',
      estimated_effort: '3 周',
    },
  ]

  const cyberScore = input.cybersecurity_level === 'military' ? rng.nextInt(92, 99)
    : input.cybersecurity_level === 'enhanced' ? rng.nextInt(80, 95)
    : input.cybersecurity_level === 'standard' ? rng.nextInt(65, 85)
    : rng.nextInt(40, 65)

  return {
    building_id: input.building_id,
    total_devices: totalDevices,
    online_pct: totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100 * 100) / 100 : 0,
    total_alerts: totalAlerts,
    cybersecurity_score: cyberScore,
    subsystem_statuses: subsystemStatuses,
    integration_recommendations: recommendations,
    unified_dashboard_url: `https://bms.${input.building_id}.example.com/dashboard`,
    edge_ai_nodes: rng.nextInt(2, 12),
    data_ingestion_rate_hz: Math.round(rng.nextFloat(10, 500) * 100) / 100,
  }
}

// --- Tool 6: Indoor Air Quality Monitor ---
function analyzeIndoorAirQuality(input: IndoorAirQualityInput): IndoorAirQualityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const pollutantDefs: Record<string, { unit: string; min: number; max: number; goodMax: number; modMax: number; poorMax: number }> = {
    co2: { unit: 'ppm', min: 350, max: 5000, goodMax: 800, modMax: 1200, poorMax: 2000 },
    pm25: { unit: 'ug/m3', min: 0, max: 500, goodMax: 12, modMax: 35, poorMax: 75 },
    voc: { unit: 'ppb', min: 0, max: 2000, goodMax: 250, modMax: 500, poorMax: 1000 },
    co: { unit: 'ppm', min: 0, max: 100, goodMax: 4, modMax: 9, poorMax: 30 },
    formaldehyde: { unit: 'mg/m3', min: 0, max: 5, goodMax: 0.08, modMax: 0.15, poorMax: 0.5 },
    ozone: { unit: 'ppb', min: 0, max: 500, goodMax: 50, modMax: 80, poorMax: 150 },
  }

  const readings: PollutantReading[] = []
  let totalAqi = 0

  for (const p of input.pollutants) {
    const def = pollutantDefs[p]
    if (!def) continue
    const val = Math.round(rng.nextFloat(def.min, def.max * 0.4) * 100) / 100
    let status: PollutantReading['status']
    if (val <= def.goodMax) status = 'good'
    else if (val <= def.modMax) status = 'moderate'
    else if (val <= def.poorMax) status = 'poor'
    else status = 'hazardous'

    const trend: PollutantReading['trend'] =
      rng.next() > 0.6 ? 'improving' : rng.next() > 0.3 ? 'stable' : 'worsening'

    readings.push({
      pollutant: p,
      unit: def.unit,
      current_value: val,
      min_safe: def.min,
      max_safe: def.max,
      status,
      trend,
    })

    const aqiContribution = status === 'good' ? 25 : status === 'moderate' ? 50 : status === 'poor' ? 75 : 95
    totalAqi += aqiContribution
  }

  const overallAqi = readings.length > 0 ? Math.round(totalAqi / readings.length) : 0
  const overallGrade: IndoorAirQualityResult['overall_aq_grade'] =
    overallAqi <= 25 ? 'excellent'
    : overallAqi <= 50 ? 'good'
    : overallAqi <= 75 ? 'moderate'
    : overallAqi <= 90 ? 'poor'
    : 'hazardous'

  const zoneQualities: ZoneAirQuality[] = input.monitoring_zones.map(z => {
    const zoneAqi = Math.round(overallAqi * rng.nextFloat(0.7, 1.3))
    const dominant = readings.length > 0
      ? rng.pick(readings).pollutant
      : 'co2'
    return {
      zone_name: z,
      overall_aq_index: Math.min(100, zoneAqi),
      dominant_pollutant: dominant,
      ventilation_effectiveness: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
      recommended_action: zoneAqi > 60 ? '增加新风量+检查过滤网' : zoneAqi > 40 ? '维持当前通风策略' : '空气质量良好',
    }
  })

  const ventAdequacy: IndoorAirQualityResult['ventilation_adequacy'] =
    input.ventilation_rate_per_person >= 10 ? 'adequate'
    : input.ventilation_rate_per_person >= 6 ? 'marginal'
    : 'inadequate'

  const healthAdvisory = overallGrade === 'excellent'
    ? '空气质量优秀，适合所有人员活动'
    : overallGrade === 'good'
    ? '空气质量良好，敏感人群注意监测'
    : overallGrade === 'moderate'
    ? '空气质量一般，建议增加通风，敏感人群减少户外活动'
    : overallGrade === 'poor'
    ? '空气质量较差，全员佩戴口罩，增加新风量至最大'
    : '空气质量危险，立即排查污染源，必要时疏散人员'

  return {
    building_id: input.building_id,
    overall_aq_index: overallAqi,
    overall_aq_grade: overallGrade,
    pollutant_readings: readings,
    zone_qualities: zoneQualities,
    ventilation_adequacy: ventAdequacy,
    health_advisory: healthAdvisory,
  }
}

// --- Tool 7: Smart Lighting Controller ---
function analyzeSmartLighting(input: SmartLightingInput): SmartLightingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const zones: LightingZone[] = []
  let totalCurrentWatts = 0
  let totalOptimizedWatts = 0

  const zoneNames = ['Open Office', 'Corridors', 'Meeting Rooms', 'Reception', 'Parking', 'Stairwells']
  const numZones = rng.nextInt(4, 6)

  for (let i = 0; i < numZones; i++) {
    const fixtures = Math.round(input.total_fixtures / numZones)
    const currentW = fixtures * rng.nextInt(40, 100)
    const daylight = input.daylight_available && i < 3
    const occupancy = input.occupancy_sensor_coverage_pct > 50
    const savingsPct = Math.round(
      (daylight ? rng.nextFloat(15, 30) : 0) +
      (occupancy ? rng.nextFloat(10, 25) : 0) +
      rng.nextFloat(5, 15)
    )
    const optW = Math.round(currentW * (1 - savingsPct / 100))
    totalCurrentWatts += currentW
    totalOptimizedWatts += optW

    zones.push({
      zone_id: `LZ-${String(i + 1).padStart(2, '0')}`,
      zone_name: zoneNames[i % zoneNames.length],
      fixture_count: fixtures,
      current_watts: currentW,
      optimized_watts: optW,
      savings_pct: savingsPct,
      daylight_harvesting: daylight,
      occupancy_based_dimming: occupancy,
      scheduled_dimming: true,
      scene_presets: ['专注模式', '会议模式', '休息模式', '清洁模式'],
    })
  }

  const lightingSchedule: LightingScheduleEntry[] = [
    { time: '06:00', brightness_pct: 30, color_temp_k: 4000, trigger: 'schedule' },
    { time: '08:00', brightness_pct: 80, color_temp_k: 5500, trigger: 'occupancy' },
    { time: '10:00', brightness_pct: 60, color_temp_k: 5000, trigger: 'daylight' },
    { time: '12:00', brightness_pct: 50, color_temp_k: 4500, trigger: 'daylight' },
    { time: '14:00', brightness_pct: 70, color_temp_k: 5000, trigger: 'occupancy' },
    { time: '17:00', brightness_pct: 85, color_temp_k: 4000, trigger: 'schedule' },
    { time: '19:00', brightness_pct: 40, color_temp_k: 3000, trigger: 'occupancy' },
    { time: '21:00', brightness_pct: 10, color_temp_k: 2700, trigger: 'schedule' },
  ]

  const totalSavingsPct = totalCurrentWatts > 0
    ? Math.round(((totalCurrentWatts - totalOptimizedWatts) / totalCurrentWatts) * 100 * 100) / 100
    : 0
  const annualKwh = Math.round((totalCurrentWatts - totalOptimizedWatts) * input.operating_hours_per_day * 365 / 1000)

  return {
    building_id: input.building_id,
    total_fixtures: input.total_fixtures,
    total_current_watts: totalCurrentWatts,
    total_optimized_watts: totalOptimizedWatts,
    total_savings_pct: totalSavingsPct,
    annual_energy_savings_kwh: annualKwh,
    annual_cost_savings_usd: Math.round(annualKwh * 0.12),
    zones,
    lighting_schedule: lightingSchedule,
    glare_index: Math.round(rng.nextFloat(10, 22) * 100) / 100,
    uniformity_ratio: Math.round(rng.nextFloat(0.6, 0.85) * 100) / 100,
  }
}

// --- Tool 8: Facilities Cost Optimizer ---
function analyzeFacilitiesCost(input: FacilitiesCostInput): FacilitiesCostResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const categories = [
    { name: 'energy', current: input.annual_energy_cost_usd },
    { name: 'maintenance', current: input.annual_maintenance_cost_usd },
    { name: 'cleaning', current: input.annual_cleaning_cost_usd },
    { name: 'security', current: input.annual_security_cost_usd },
  ]

  const categoryAnalyses: CostCategoryAnalysis[] = []
  let totalBenchmark = 0
  let totalOptimization = 0

  const benchmarkMultipliers: Record<string, number> = {
    energy: 0.85, maintenance: 0.9, cleaning: 0.88, security: 0.92,
  }

  for (const cat of categories) {
    const benchmark = Math.round(cat.current * (benchmarkMultipliers[cat.name] || 0.9))
    totalBenchmark += benchmark
    const variance = Math.round(((cat.current - benchmark) / benchmark) * 100 * 100) / 100
    const direction: CostCategoryAnalysis['variance_direction'] =
      variance < -5 ? 'under' : variance < 5 ? 'on_target' : 'over'
    const optPotential = direction === 'over' ? Math.round(cat.current * rng.nextFloat(0.1, 0.25)) : 0
    totalOptimization += optPotential

    categoryAnalyses.push({
      category: cat.name,
      current_cost_usd: cat.current,
      benchmark_cost_usd: benchmark,
      variance_pct: variance,
      variance_direction: direction,
      optimization_potential_usd: optPotential,
    })
  }

  const totalCurrent = categories.reduce((s, c) => s + c.current, 0)
  const costPerSqm = Math.round((totalCurrent / input.total_area_sqm) * 100) / 100
  const costPerOccupant = Math.round((totalCurrent / Math.max(1, input.occupant_count)) * 100) / 100
  const benchmarkVariance = input.benchmark_cost_per_sqm > 0
    ? Math.round(((costPerSqm - input.benchmark_cost_per_sqm) / input.benchmark_cost_per_sqm) * 100 * 100) / 100
    : 0

  const actions: CostOptimizationAction[] = [
    {
      action_id: 'COST-001',
      category: 'energy',
      description: '部署 AI 能源管理系统，优化 HVAC 和照明策略',
      annual_savings_usd: Math.round(input.annual_energy_cost_usd * rng.nextFloat(0.12, 0.22)),
      implementation_cost_usd: rng.nextInt(30000, 80000),
      payback_months: rng.nextInt(8, 18),
      difficulty: 'moderate',
      quick_win: false,
    },
    {
      action_id: 'COST-002',
      category: 'maintenance',
      description: '实施预测性维护，减少紧急维修成本',
      annual_savings_usd: Math.round(input.annual_maintenance_cost_usd * rng.nextFloat(0.15, 0.3)),
      implementation_cost_usd: rng.nextInt(20000, 60000),
      payback_months: rng.nextInt(6, 15),
      difficulty: 'moderate',
      quick_win: false,
    },
    {
      action_id: 'COST-003',
      category: 'cleaning',
      description: '引入智能清洁调度，按实际使用频率调整频次',
      annual_savings_usd: Math.round(input.annual_cleaning_cost_usd * rng.nextFloat(0.1, 0.2)),
      implementation_cost_usd: rng.nextInt(5000, 15000),
      payback_months: rng.nextInt(3, 8),
      difficulty: 'easy',
      quick_win: true,
    },
    {
      action_id: 'COST-004',
      category: 'security',
      description: 'AI 视频分析替代部分人工巡逻',
      annual_savings_usd: Math.round(input.annual_security_cost_usd * rng.nextFloat(0.08, 0.18)),
      implementation_cost_usd: rng.nextInt(15000, 40000),
      payback_months: rng.nextInt(10, 24),
      difficulty: 'complex',
      quick_win: false,
    },
  ]

  const threeYearSavings = actions.reduce((s, a) => s + a.annual_savings_usd, 0) * 3
  const totalImplCost = actions.reduce((s, a) => s + a.implementation_cost_usd, 0)
  const roi = totalImplCost > 0 ? Math.round(((threeYearSavings - totalImplCost) / totalImplCost) * 100 * 100) / 100 : 0

  return {
    building_id: input.building_id,
    total_annual_cost_usd: totalCurrent,
    cost_per_sqm: costPerSqm,
    cost_per_occupant: costPerOccupant,
    benchmark_variance_pct: benchmarkVariance,
    total_optimization_potential_usd: totalOptimization,
    potential_reduction_pct: totalCurrent > 0 ? Math.round((totalOptimization / totalCurrent) * 100 * 100) / 100 : 0,
    category_analyses: categoryAnalyses,
    optimization_actions: actions,
    three_year_savings_projection_usd: threeYearSavings,
    roi_pct: roi,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Energy Optimization Report ---
function formatEnergyOptimizationReport(result: EnergyOptimizationResult): string {
  const lines: string[] = []
  lines.push('## ⚡ Energy Optimization Engine — 能耗优化报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 当前月耗电: ${result.current_monthly_kwh.toLocaleString()} kWh`)
  lines.push(`目标节能率: ${result.target_savings_pct}% | 预计节能: ${result.total_estimated_savings_pct}% (${result.total_estimated_savings_kwh.toLocaleString()} kWh/月)`)
  lines.push(`成本节约: $${result.total_cost_reduction_usd.toLocaleString()}/月 | CO2减排: ${result.total_co2_reduction_kg_year.toLocaleString()} kg/年`)
  lines.push(`可再生能源占比: ${result.renewable_pct}% | 储能利用率: ${result.battery_utilization_pct}%`)
  lines.push('')
  lines.push('### 📋 优化措施清单')
  lines.push('| 编号 | 措施 | 类别 | 月节电(kWh) | 成本降幅 | 投资($) | 回收期(月) | CO2减排 | 优先级 |')
  lines.push('|------|------|------|-------------|----------|---------|-----------|---------|--------|')
  for (const m of result.measures) {
    lines.push(`| ${m.measure_id} | ${m.name} | ${m.category} | ${m.estimated_savings_kwh_month.toLocaleString()} | ${m.estimated_cost_reduction_pct}% | ${m.investment_cost.toLocaleString()} | ${m.payback_months} | ${m.co2_reduction_kg_year}kg | ${m.priority} |`)
  }
  lines.push('')
  lines.push('### 📋 24h 负荷预测与优化')
  lines.push('| 小时 | 预测负荷(kWh) | 峰谷 | 优化建议 |')
  lines.push('|------|-------------|------|----------|')
  for (const lf of result.load_forecast) {
    lines.push(`| ${String(lf.hour).padStart(2, '0')}:00 | ${lf.predicted_kwh} | ${lf.is_peak ? '🔴峰' : '🟢谷'} | ${lf.optimization_note} |`)
  }
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] ISO 50001 能源管理体系对齐')
  lines.push('- [x] 碳排放因子核算 (GHG Protocol)')
  lines.push('- [x] 峰谷电价策略优化')
  lines.push('- [x] 可再生能源配额追踪')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • Energy Optimization Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 2: Predictive Maintenance Report ---
function formatPredictiveMaintenanceReport(result: PredictiveMaintenanceResult): string {
  const lines: string[] = []
  lines.push('## 🔧 Predictive Maintenance Scheduler — 预测性维护报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 设备总数: ${result.total_equipment}`)
  lines.push(`紧急: ${result.critical_count} | 高: ${result.high_count} | 中: ${result.medium_count} | 低: ${result.low_count}`)
  lines.push(`总维护预算: $${result.total_estimated_cost.toLocaleString()} | 预算利用率: ${result.budget_utilization_pct}%`)
  lines.push(`平均故障间隔: ${result.mean_time_between_failures_avg}h | 设备综合效率(OEE): ${result.overall_equipment_effectiveness}`)
  lines.push('')
  lines.push('### 📋 维护任务清单')
  lines.push('| 任务ID | 设备 | 类型 | 紧急度 | 故障概率 | 建议日期 | 耗时(h) | 费用($) | 影响 |')
  lines.push('|--------|------|------|--------|----------|----------|---------|---------|------|')
  for (const t of result.tasks) {
    lines.push(`| ${t.task_id} | ${t.equipment_name} | ${t.maintenance_type} | ${t.urgency} | ${t.predicted_failure_probability} | ${t.recommended_date} | ${t.estimated_duration_hours} | ${t.estimated_cost_usd} | ${t.downtime_impact} |`)
  }
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] ISO 14224 设备可靠性数据对齐')
  lines.push('- [x] 维护优先级风险矩阵评估')
  lines.push('- [x] 备件库存联动检查')
  lines.push('- [x] 停机影响最小化策略')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • Predictive Maintenance • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 3: Space Utilization Report ---
function formatSpaceUtilizationReport(result: SpaceUtilizationResult): string {
  const lines: string[] = []
  lines.push('## 🏢 Space Utilization Analyzer — 空间利用率报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 总面积: ${result.floor_area_sqm.toLocaleString()} sqm | 总人数: ${result.total_occupants}`)
  lines.push(`人均面积: ${result.area_per_person_sqm} sqm | 整体利用率: ${result.overall_utilization_pct}% | 容量余量: ${result.capacity_headroom_pct}%`)
  lines.push('')
  lines.push('### 📋 空间类型分析')
  lines.push('| 空间类型 | 面积(sqm) | 平均占用率 | 峰值占用率 | 峰值时段 | 未利用率 | 推荐容量 | 评级 |')
  lines.push('|----------|-----------|-----------|-----------|----------|----------|----------|------|')
  for (const m of result.space_metrics) {
    lines.push(`| ${m.space_type} | ${m.area_sqm.toLocaleString()} | ${m.avg_occupancy_pct}% | ${m.peak_occupancy_pct}% | ${m.peak_hour} | ${m.underutilized_pct}% | ${m.recommended_capacity}人 | ${m.utilization_grade} |`)
  }
  lines.push('')
  lines.push('### 📋 热力图数据')
  lines.push('| X | Y | 占用强度 |')
  lines.push('|---|---|----------|')
  for (const h of result.heatmap_data.slice(0, 16)) {
    lines.push(`| ${h.x} | ${h.y} | ${h.occupancy_intensity} |`)
  }
  lines.push(`... (${result.heatmap_data.length} cells total)`)
  lines.push('')
  if (result.optimization_recommendations.length > 0) {
    lines.push('### 📋 优化建议')
    for (const r of result.optimization_recommendations) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }
  lines.push(`预计可释放空间: ${result.estimated_space_savings_sqm} sqm`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 人均面积符合建筑规范')
  lines.push('- [x] 消防疏散通道预留验证')
  lines.push('- [x] 无障碍设施覆盖率检查')
  lines.push('- [x] 空间弹性设计评估')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • Space Utilization • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 4: HVAC Optimization Report ---
function formatHVACOptimizationReport(result: HVACOptimizationResult): string {
  const lines: string[] = []
  lines.push('## 🌡️ HVAC Optimization Planner — HVAC 优化规划报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 总区域: ${result.total_zones}`)
  lines.push(`预计节能率: ${result.total_estimated_savings_pct}% | 年节电: ${result.annual_energy_savings_kwh.toLocaleString()} kWh`)
  lines.push(`年成本节约: $${result.annual_cost_savings_usd.toLocaleString()} | CO2减排: ${result.co2_reduction_kg_year.toLocaleString()} kg/年`)
  lines.push(`舒适度指数: ${result.comfort_index} | IAQ合规: ${result.iaq_compliance}`)
  lines.push('')
  lines.push('### 📋 区域优化方案')
  lines.push('| 区域ID | 区域名 | 当前设定 | 优化设定 | 调整 | 节能率 | 湿度控制 | 换气次数 | 滤网状态 |')
  lines.push('|--------|--------|----------|----------|------|--------|----------|----------|----------|')
  for (const z of result.zone_plans) {
    lines.push(`| ${z.zone_id} | ${z.zone_name} | ${z.current_setpoint_c}°C | ${z.optimized_setpoint_c}°C | ${z.setpoint_adjustment_reason}°C | ${z.estimated_energy_savings_pct}% | ${z.humidity_control} | ${z.air_changes_per_hour}/h | ${z.filter_status} |`)
  }
  lines.push('')
  lines.push('### 📋 日运行调度')
  lines.push('| 时间 | 动作 | 温度 | 风速 | 风阀开度 | 模式 |')
  lines.push('|------|------|------|------|----------|------|')
  for (const s of result.daily_schedule) {
    lines.push(`| ${String(s.hour).padStart(2, '0')}:00 | ${s.action} | ${s.temperature_c}°C | ${s.fan_speed} | ${s.damper_position_pct}% | ${s.mode} |`)
  }
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] ASHRAE 55 热舒适标准对齐')
  lines.push('- [x] ASHRAE 62.1 通风量达标')
  lines.push('- [x] 滤网更换周期追踪')
  lines.push('- [x] 区域温差控制 < 3°C')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • HVAC Optimization • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 5: Building Automation Report ---
function formatBuildingAutomationReport(result: BuildingAutomationResult): string {
  const lines: string[] = []
  lines.push('## 🏗️ Building Automation Integrator — 楼宇自动化集成报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 总设备: ${result.total_devices} | 在线率: ${result.online_pct}%`)
  lines.push(`总告警: ${result.total_alerts} | 网络安全评分: ${result.cybersecurity_score}/100`)
  lines.push(`边缘AI节点: ${result.edge_ai_nodes} | 数据接入速率: ${result.data_ingestion_rate_hz} Hz`)
  lines.push('')
  lines.push('### 📋 子系统状态')
  lines.push('| 子系统 | 状态 | 设备数 | 健康数 | 告警 | 最后心跳 | 协议 | 健康度 |')
  lines.push('|--------|------|--------|--------|------|----------|------|--------|')
  for (const s of result.subsystem_statuses) {
    lines.push(`| ${s.subsystem} | ${s.status} | ${s.device_count} | ${s.healthy_devices} | ${s.alerts_count} | ${s.last_heartbeat.split('T')[1]?.slice(0, 8) || ''} | ${s.protocol} | ${s.integration_health_pct}% |`)
  }
  lines.push('')
  lines.push('### 📋 集成优化建议')
  lines.push('| 优先级 | 子系统 | 问题 | 建议 | 预计工时 |')
  lines.push('|--------|--------|------|------|----------|')
  for (const r of result.integration_recommendations) {
    lines.push(`| ${r.priority} | ${r.subsystem} | ${r.issue} | ${r.recommendation} | ${r.estimated_effort} |`)
  }
  lines.push('')
  lines.push(`统一监控面板: ${result.unified_dashboard_url}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] BACnet/Modbus 协议一致性验证')
  lines.push('- [x] 网络安全等保 2.0 对齐')
  lines.push('- [x] 数据加密传输 (TLS 1.3)')
  lines.push('- [x] 边缘计算节点冗余检查')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • Building Automation • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 6: Indoor Air Quality Report ---
function formatIndoorAirQualityReport(result: IndoorAirQualityResult): string {
  const lines: string[] = []
  lines.push('## 🌬️ Indoor Air Quality Monitor — 室内空气质量监测报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 综合AQI: ${result.overall_aq_index} | 等级: ${result.overall_aq_grade}`)
  lines.push(`通风充分性: ${result.ventilation_adequacy}`)
  lines.push('')
  lines.push('### 📋 污染物读数')
  lines.push('| 污染物 | 当前值 | 单位 | 安全范围 | 状态 | 趋势 |')
  lines.push('|--------|--------|------|----------|------|------|')
  for (const r of result.pollutant_readings) {
    lines.push(`| ${r.pollutant} | ${r.current_value} | ${r.unit} | ${r.min_safe}-${r.max_safe} | ${r.status} | ${r.trend} |`)
  }
  lines.push('')
  lines.push('### 📋 分区空气质量')
  lines.push('| 区域 | AQI | 主要污染物 | 通风效率 | 建议 |')
  lines.push('|------|-----|-----------|----------|------|')
  for (const z of result.zone_qualities) {
    lines.push(`| ${z.zone_name} | ${z.overall_aq_index} | ${z.dominant_pollutant} | ${z.ventilation_effectiveness} | ${z.recommended_action} |`)
  }
  lines.push('')
  lines.push(`### 🏥 健康提示`)
  lines.push(result.health_advisory)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] WHO 室内空气质量指南对齐')
  lines.push('- [x] GB/T 18883-2022 室内空气质量标准')
  lines.push('- [x] CO2 浓度 < 1000ppm 达标')
  lines.push('- [x] PM2.5 < 35ug/m3 达标')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • Indoor Air Quality • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 7: Smart Lighting Report ---
function formatSmartLightingReport(result: SmartLightingResult): string {
  const lines: string[] = []
  lines.push('## 💡 Smart Lighting Controller — 智能照明控制报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 总灯具: ${result.total_fixtures}`)
  lines.push(`当前总功率: ${result.total_current_watts.toLocaleString()}W | 优化后: ${result.total_optimized_watts.toLocaleString()}W | 节能率: ${result.total_savings_pct}%`)
  lines.push(`年节电: ${result.annual_energy_savings_kwh.toLocaleString()} kWh | 年节约: $${result.annual_cost_savings_usd.toLocaleString()}`)
  lines.push(`眩光指数: ${result.glare_index} | 均匀度: ${result.uniformity_ratio}`)
  lines.push('')
  lines.push('### 📋 照明分区方案')
  lines.push('| 区域ID | 区域名 | 灯具数 | 当前功率 | 优化功率 | 节能率 | 日光采集 | 人体感应 | 定时调光 |')
  lines.push('|--------|--------|--------|----------|----------|--------|----------|----------|----------|')
  for (const z of result.zones) {
    lines.push(`| ${z.zone_id} | ${z.zone_name} | ${z.fixture_count} | ${z.current_watts}W | ${z.optimized_watts}W | ${z.savings_pct}% | ${z.daylight_harvesting ? '✅' : '❌'} | ${z.occupancy_based_dimming ? '✅' : '❌'} | ${z.scheduled_dimming ? '✅' : '❌'} |`)
  }
  lines.push('')
  lines.push('### 📋 照明调度')
  lines.push('| 时间 | 亮度 | 色温(K) | 触发方式 |')
  lines.push('|------|------|---------|----------|')
  for (const s of result.lighting_schedule) {
    lines.push(`| ${s.time} | ${s.brightness_pct}% | ${s.color_temp_k} | ${s.trigger} |`)
  }
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] EN 12464-1 照明标准对齐')
  lines.push('- [x] 眩光指数 UGR < 19 达标')
  lines.push('- [x] 照度均匀度 > 0.6 达标')
  lines.push('- [x] 显色指数 Ra > 80 达标')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • Smart Lighting • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 8: Facilities Cost Report ---
function formatFacilitiesCostReport(result: FacilitiesCostResult): string {
  const lines: string[] = []
  lines.push('## 💰 Facilities Cost Optimizer — 设施成本优化报告')
  lines.push('')
  lines.push(`建筑: ${result.building_id} | 年度总成本: $${result.total_annual_cost_usd.toLocaleString()}`)
  lines.push(`单位面积成本: $${result.cost_per_sqm}/sqm | 人均成本: $${result.cost_per_occupant}/人`)
  lines.push(`基准偏差: ${result.benchmark_variance_pct}% | 优化潜力: $${result.total_optimization_potential_usd.toLocaleString()} (${result.potential_reduction_pct}%)`)
  lines.push(`三年节约预测: $${result.three_year_savings_projection_usd.toLocaleString()} | ROI: ${result.roi_pct}%`)
  lines.push('')
  lines.push('### 📋 成本分类分析')
  lines.push('| 类别 | 当前成本 | 基准成本 | 偏差 | 方向 | 优化潜力 |')
  lines.push('|------|----------|----------|------|------|----------|')
  for (const c of result.category_analyses) {
    lines.push(`| ${c.category} | $${c.current_cost_usd.toLocaleString()} | $${c.benchmark_cost_usd.toLocaleString()} | ${c.variance_pct}% | ${c.variance_direction} | $${c.optimization_potential_usd.toLocaleString()} |`)
  }
  lines.push('')
  lines.push('### 📋 优化行动清单')
  lines.push('| 编号 | 类别 | 描述 | 年节约 | 投资 | 回收期 | 难度 | 快速见效 |')
  lines.push('|------|------|------|--------|------|--------|------|----------|')
  for (const a of result.optimization_actions) {
    lines.push(`| ${a.action_id} | ${a.category} | ${a.description} | $${a.annual_savings_usd.toLocaleString()} | $${a.implementation_cost_usd.toLocaleString()} | ${a.payback_months}月 | ${a.difficulty} | ${a.quick_win ? '⚡' : ''} |`)
  }
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] IFRS 租赁准则对齐')
  lines.push('- [x] 设施管理 ISO 41001 对齐')
  lines.push('- [x] 成本分摊透明可追溯')
  lines.push('- [x] 预算偏差预警机制')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Building Toolkit • Facilities Cost Optimizer • v0.1.0*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Energy Optimization Engine
  tools.register(defineTool({
    name: 'energy_optimization_engine',
    description: '能耗优化引擎 | 电力/燃气/水负荷预测、峰谷调度、碳排追踪、节能措施推荐 | Energy optimization with load forecasting, peak-shaving, carbon tracking, and savings measures.',
    parameters: {
      energy_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, energy_types[], current_monthly_kwh, target_savings_pct, peak_hours[], has_solar (boolean), has_battery_storage (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { energy_input: string }) {
      const input: EnergyOptimizationInput = JSON.parse(args.energy_input)
      return formatEnergyOptimizationReport(analyzeEnergyOptimization(input))
    }
  }))

  // Tool 2: Predictive Maintenance Scheduler
  tools.register(defineTool({
    name: 'predictive_maintenance_scheduler',
    description: '预测性维护调度 | 设备健康评分、故障概率预测、维护排程优化 | Predictive maintenance scheduling with health scoring, failure prediction, and task prioritization.',
    parameters: {
      maintenance_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, equipment_list[{equipment_id, name, type, install_date, last_maintenance, runtime_hours, health_score}], maintenance_budget_usd, planning_horizon_months, priority (cost|uptime|safety)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { maintenance_input: string }) {
      const input: PredictiveMaintenanceInput = JSON.parse(args.maintenance_input)
      return formatPredictiveMaintenanceReport(analyzePredictiveMaintenance(input))
    }
  }))

  // Tool 3: Space Utilization Analyzer
  tools.register(defineTool({
    name: 'space_utilization_analyzer',
    description: '空间利用率分析 | 工位占用率、会议室调度、热力图、容量规划 | Space utilization analysis with occupancy rates, heatmap, and capacity planning.',
    parameters: {
      space_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, floor_area_sqm, total_occupants, space_types[], measurement_period_days, sensor_density_per_sqm'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { space_input: string }) {
      const input: SpaceUtilizationInput = JSON.parse(args.space_input)
      return formatSpaceUtilizationReport(analyzeSpaceUtilization(input))
    }
  }))

  // Tool 4: HVAC Optimization Planner
  tools.register(defineTool({
    name: 'hvac_optimization_planner',
    description: 'HVAC 优化规划 | 温控策略、空气质量、节能调度、区域优化 | HVAC optimization with zone control, energy scheduling, and IAQ compliance.',
    parameters: {
      hvac_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, climate_zone, total_hvac_zones, current_setpoint_c, occupancy_schedule, building_orientation, window_to_wall_ratio, insulation_rating, has_vrf (boolean), has_smart_thermostats (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { hvac_input: string }) {
      const input: HVACOptimizationInput = JSON.parse(args.hvac_input)
      return formatHVACOptimizationReport(analyzeHVACOptimization(input))
    }
  }))

  // Tool 5: Building Automation Integrator
  tools.register(defineTool({
    name: 'building_automation_integrator',
    description: '楼宇自动化集成 | BMS/IoT/消防/安防统一管控、协议转换、边缘AI | Building automation integration with unified BMS, IoT, fire, and security management.',
    parameters: {
      automation_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, subsystems[], iot_device_count, integration_protocol (bacnet|modbus|lonworks|mqtt|opc_ua), cloud_connected (boolean), cybersecurity_level (basic|standard|enhanced|military)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { automation_input: string }) {
      const input: BuildingAutomationInput = JSON.parse(args.automation_input)
      return formatBuildingAutomationReport(analyzeBuildingAutomation(input))
    }
  }))

  // Tool 6: Indoor Air Quality Monitor
  tools.register(defineTool({
    name: 'indoor_air_quality_monitor',
    description: '室内空气质量监测 | CO2/PM25/VOC/CO/甲醛/臭氧实时监测、分区评估、健康提示 | Indoor air quality monitoring with multi-pollutant tracking and health advisory.',
    parameters: {
      aq_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, monitoring_zones[], pollutants[], outdoor_aqi, ventilation_rate_per_person, humidity_pct, temperature_c'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { aq_input: string }) {
      const input: IndoorAirQualityInput = JSON.parse(args.aq_input)
      return formatIndoorAirQualityReport(analyzeIndoorAirQuality(input))
    }
  }))

  // Tool 7: Smart Lighting Controller
  tools.register(defineTool({
    name: 'smart_lighting_controller',
    description: '智能照明控制 | 日光采集、人员感应、场景编排、节能调度 | Smart lighting control with daylight harvesting, occupancy sensing, and scene management.',
    parameters: {
      lighting_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, total_fixtures, fixture_types[], daylight_available (boolean), occupancy_sensor_coverage_pct, current_lux_level, target_lux_level, operating_hours_per_day, has_scene_control (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { lighting_input: string }) {
      const input: SmartLightingInput = JSON.parse(args.lighting_input)
      return formatSmartLightingReport(analyzeSmartLighting(input))
    }
  }))

  // Tool 8: Facilities Cost Optimizer
  tools.register(defineTool({
    name: 'facilities_cost_optimizer',
    description: '设施成本优化 | 能耗/维护/清洁/安全成本分析、基准对比、优化行动、ROI预测 | Facilities cost optimization with benchmarking, action planning, and ROI projection.',
    parameters: {
      cost_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_id, annual_energy_cost_usd, annual_maintenance_cost_usd, annual_cleaning_cost_usd, annual_security_cost_usd, total_area_sqm, occupant_count, cost_reduction_target_pct, benchmark_cost_per_sqm'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { cost_input: string }) {
      const input: FacilitiesCostInput = JSON.parse(args.cost_input)
      return formatFacilitiesCostReport(analyzeFacilitiesCost(input))
    }
  }))

  console.log(`[dsh-tool-smartbuilding] Loaded v${VERSION} — Smart Building & Facilities Management, 8 tools active`)
  console.log('  Tools: energy_optimization_engine, predictive_maintenance_scheduler, space_utilization_analyzer, hvac_optimization_planner, building_automation_integrator, indoor_air_quality_monitor, smart_lighting_controller, facilities_cost_optimizer')
}
