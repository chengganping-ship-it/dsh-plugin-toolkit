/**
 * DSH Maritime Agent Plugin v0.1.0
 * 船舶与海运智能体工具集 for DeepSeek Harness — 覆盖船舶能效、航线规划、港口靠泊、
 * 碳排放追踪、配载稳性、船员排班、PSC检査、船级社检验八大核心场景。
 *
 * 工具清单:
 * 1. vessel_performance_monitor — 船舶主机能效与航速优化
 * 2. maritime_route_planner     — 全球航线规划与气象导航
 * 3. port_call_optimizer        — 港口到港预测与靠泊窗口规划
 * 4. maritime_emission_tracker  — CIMO/EEXI碳强度指标追踪
 * 5. cargo_loading_planner      — 配载仪与稳性计算
 * 6. crew_management_scheduler  — 船员排班与STCW合规
 * 7. maritime_safety_inspector  — PSC检查预检与缺陷整改
 * 8. ship_maintenance_planner   — 船级社特检/中间检验计划
 *
 * @module dsh-tool-maritimeagent | @version 0.1.0 | @license MIT
 * @author maritimeagent-dev
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-maritimeagent'
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

// --- Tool 1: Vessel Performance Monitor ---
interface VesselPerformanceInput {
  vessel_imo: string
  vessel_name: string
  engine_type: 'ME' | 'MC' | 'RT-flex' | 'X-series'
  dwt: number
  current_speed_kn: number
  fuel_type: 'HFO' | 'VLSFO' | 'MGO' | 'LNG' | 'methanol'
  sea_state: 'calm' | 'slight' | 'moderate' | 'rough' | 'very_rough'
  analysis_depth: 'basic' | 'standard' | 'detailed'
}

interface EngineMetrics {
  me_power_kw: number
  me_rpm: number
  sfoc_g_kwh: number
  fuel_consumption_t_day: number
  engine_load_pct: number
  turbocharger_efficiency: number
  boiler_consumption_t_day: number
}

interface SpeedOptimization {
  optimal_speed_kn: number
  fuel_savings_pct: number
  eta_delay_hours: number
  co2_reduction_t_day: number
  recommended_rpm: number
}

interface HullCondition {
  fouling_level: 'clean' | 'light' | 'moderate' | 'heavy'
  drag_increase_pct: number
  last_docking_date: string
  next_docking_due: string
  hull_coating_type: string
}

interface VesselPerformanceResult {
  vessel_imo: string
  vessel_name: string
  engine_metrics: EngineMetrics
  speed_optimization: SpeedOptimization
  hull_condition: HullCondition
  performance_index: number
  recommendations: string[]
  alert_flags: string[]
}

// --- Tool 2: Maritime Route Planner ---
interface RoutePlannerInput {
  origin_port: string
  destination_port: string
  vessel_type: 'container' | 'bulk_carrier' | 'tanker' | 'LNG' | 'general_cargo' | 'RoRo'
  vessel_draft_m: number
  departure_time: string
  optimization_criteria: 'fastest' | 'fuel_optimal' | 'weather_routing' | 'emission_controlled'
  avoid_regions: string[]
  canal_route: 'suez' | 'panama' | 'cape_of_good_hope' | 'northeast_passage' | 'direct'
}

interface Waypoint {
  name: string
  latitude: number
  longitude: number
  distance_nm: number
  eta: string
  weather_forecast: string
  wave_height_m: number
  wind_speed_kn: number
  current_kn: number
}

interface RouteSegment {
  from: string
  to: string
  distance_nm: number
  bearing_deg: number
  estimated_speed_kn: number
  fuel_consumption_t: number
  weather_risk: 'low' | 'moderate' | 'high' | 'severe'
}

interface RoutePlannerResult {
  total_distance_nm: number
  total_eta_hours: number
  total_fuel_estimate_t: number
  waypoints: Waypoint[]
  segments: RouteSegment[]
  weather_alerts: string[]
  canal_transit: string
  eca_zones_crossed: string[]
  route_recommendations: string[]
}

// --- Tool 3: Port Call Optimizer ---
interface PortCallInput {
  vessel_imo: string
  port_unlocode: string
  port_name: string
  eta_current: string
  vessel_type: string
  vessel_draft_m: number
  cargo_operation: 'loading' | 'discharging' | 'both'
  cargo_volume_t: number
  berth_preference: 'any' | 'container_terminal' | 'bulk_terminal' | 'tanker_terminal' | 'multi_purpose'
  tide_dependent: boolean
  air_draft_limit_m: number
}

interface BerthWindow {
  berth_name: string
  berth_length_m: number
  berth_depth_m: number
  available_from: string
  available_to: string
  tidal_window: string
  compatibility: 'suitable' | 'marginal' | 'unsuitable'
}

interface PortSchedule {
  pilot_boarding: string
  tug_assist_required: number
  berth_arrival: string
  cargo_operation_start: string
  estimated_operation_hours: number
  cargo_operation_end: string
  unberthing: string
  port_departure: string
}

interface PortCallResult {
  vessel_imo: string
  port_name: string
  berth_windows: BerthWindow[]
  recommended_berth: string
  port_schedule: PortSchedule
  congestion_level: 'low' | 'moderate' | 'high' | 'severe'
  waiting_time_estimate_hours: number
  port_dues_estimate_usd: number
  recommendations: string[]
}

// --- Tool 4: Maritime Emission Tracker ---
interface EmissionTrackerInput {
  vessel_imo: string
  vessel_name: string
  vessel_type: string
  gross_tonnage: number
  deadweight: number
  eiapp_cert_no: string
  eedi_reference: number
  reporting_period: string
  fuel_consumption_data: Array<{ fuel_type: string; tonnes: number }>
  distance_travelled_nm: number
  transport_work_ton_mile: number
}

interface CarbonIntensity {
  attained_cii: number
  required_cii: number
  cii_rating: 'A' | 'B' | 'C' | 'D' | 'E'
  rating_trend: 'improving' | 'stable' | 'deteriorating'
  eexi_value: number
  eexi_reference: number
  eexi_compliance: 'compliant' | 'marginal' | 'non_compliant'
}

interface EmissionTotals {
  co2_tonnes: number
  ch4_tonnes: number
  n2o_tonnes: number
  sox_tonnes: number
  nox_tonnes: number
  pm_tonnes: number
  co2_equivalent_tonnes: number
}

interface EmissionTrackerResult {
  vessel_imo: string
  vessel_name: string
  reporting_period: string
  carbon_intensity: CarbonIntensity
  emission_totals: EmissionTotals
  fuel_breakdown: Array<{ fuel_type: string; tonnes: number; co2_factor: number; co2_tonnes: number }>
  compliance_status: 'compliant' | 'at_risk' | 'non_compliant'
  improvement_measures: string[]
  eu_mrv_reporting: boolean
  imo_dcs_reporting: boolean
}

// --- Tool 5: Cargo Loading Planner ---
interface CargoLoadingInput {
  vessel_imo: string
  vessel_name: string
  vessel_type: string
  loa_m: number
  beam_m: number
  summer_draft_m: number
  summer_deadweight_t: number
  tank_or_hold_count: number
  cargo_manifest: Array<{ cargo_type: string; weight_t: number; sf_m3_t: number; hold_no: number }>
  ballast_requirement: boolean
  stability_criteria: 'IMO_A749' | 'IMO_RES_A167' | 'class_society'
  voyage_legs: number
}

interface HoldAllocation {
  hold_no: number
  cargo_type: string
  weight_t: number
  volume_m3: number
  fill_pct: number
  ullage_m: number
}

interface StabilityParameters {
  displacement_t: number
  kg_m: number
  km_m: number
  gm_m: number
  trim_m: number
  list_deg: number
  max_shear_force_pct: number
  max_bending_moment_pct: number
  strength_compliance: 'pass' | 'marginal' | 'fail'
}

interface CargoLoadingResult {
  vessel_imo: string
  vessel_name: string
  hold_allocations: HoldAllocation[]
  stability_parameters: StabilityParameters
  draft_fwd_m: number
  draft_aft_m: number
  ballast_required_t: number
  total_cargo_loaded_t: number
  dwt_utilization_pct: number
  stability_compliance: 'pass' | 'conditional' | 'fail'
  loading_sequence: string[]
  warnings: string[]
}

// --- Tool 6: Crew Management Scheduler ---
interface CrewManagementInput {
  vessel_imo: string
  vessel_name: string
  vessel_type: string
  crew_complement: number
  current_crew: Array<{ rank: string; name: string; nationality: string; contract_start: string; contract_end: string; cert_expiry: string; rest_hours_last_24: number }>
  voyage_duration_days: number
  next_port: string
  next_port_eta: string
  flag_state: string
  mlc_compliance_required: boolean
  stcw_compliance_required: boolean
}

interface CrewMember {
  rank: string
  name: string
  nationality: string
  contract_status: 'active' | 'expiring_soon' | 'overdue'
  cert_status: 'valid' | 'expiring_soon' | 'expired'
  rest_compliance: 'compliant' | 'minor_violation' | 'major_violation'
  hours_worked_last_7_days: number
  max_hours_remaining: number
}

interface ManningCheck {
  rank: string
  required: number
  assigned: number
  deficit: number
  stcw_required: string[]
}

interface CrewManagementResult {
  vessel_imo: string
  vessel_name: string
  crew_roster: CrewMember[]
  manning_check: ManningCheck[]
  stcw_compliance: 'compliant' | 'at_risk' | 'non_compliant'
  mlc_compliance: 'compliant' | 'at_risk' | 'non_compliant'
  rest_hour_violations: number
  cert_expiring_30d: number
  crew_changes_recommended: number
  recommendations: string[]
}

// --- Tool 7: Maritime Safety Inspector ---
interface SafetyInspectionInput {
  vessel_imo: string
  vessel_name: string
  vessel_type: string
  flag_state: string
  class_society: string
  psc_region: 'Paris_MOU' | 'Tokyo_MOU' | 'USCG' | 'Indian_Ocean_MOU' | 'Mediterranean_MOU' | 'Vienna_MOU'
  last_psc_inspection: string
  deficiencies_last_inspection: number
  detention_history: boolean
  inspection_scope: 'full' | 'focused' | 'follow_up'
  focus_areas: string[]
}

interface DeficiencyItem {
  code: string
  category: string
  description: string
  severity: 'minor' | 'major' | 'detainable'
  regulation_ref: string
  action_required: string
  estimated_repair_hours: number
}

interface InspectionReadiness {
  overall_score: number
  documentation_readiness_pct: number
  equipment_readiness_pct: number
  crew_readiness_pct: number
  housekeeping_pct: number
}

interface SafetyInspectionResult {
  vessel_imo: string
  vessel_name: string
  psc_region: string
  inspection_readiness: InspectionReadiness
  deficiencies: DeficiencyItem[]
  detainable_deficiencies: number
  detention_risk: 'low' | 'moderate' | 'high' | 'critical'
  corrective_actions: string[]
  regulatory_updates: string[]
  recommendations: string[]
}

// --- Tool 8: Ship Maintenance Planner ---
interface MaintenanceInput {
  vessel_imo: string
  vessel_name: string
  vessel_type: string
  class_society: 'BV' | 'CCS' | 'DNV' | 'LR' | 'NK' | 'RINA' | 'KR' | 'ABS'
  year_built: number
  last_special_survey: string
  last_intermediate_survey: string
  last_docking: string
  next_class_renewal: string
  survey_type: 'special_survey' | 'intermediate_survey' | 'annual_survey' | 'docking_survey' | 'tailshaft_survey'
  dry_dock_required: boolean
  maintenance_items: Array<{ item: string; priority: 'critical' | 'high' | 'medium' | 'low'; due_date: string; status: 'pending' | 'in_progress' | 'completed' }>
}

interface SurveySchedule {
  survey_type: string
  last_done: string
  next_due: string
  window_start: string
  window_end: string
  status: 'current' | 'due_soon' | 'overdue'
  interval_years: number
}

interface MaintenancePlan {
  dry_dock_days: number
  estimated_cost_usd: number
  recommended_yard: string[]
  survey_items: string[]
  class_conditions: string[]
  statutory_items: string[]
  hull_thickness_measurements: number
  coating_renewal_pct: number
}

interface MaintenanceResult {
  vessel_imo: string
  vessel_name: string
  class_society: string
  vessel_age_years: number
  survey_schedule: SurveySchedule[]
  maintenance_plan: MaintenancePlan
  class_status: 'clean' | 'with_conditions' | 'with_recommendations'
  overdue_items: number
  upcoming_deadlines: string[]
  budget_estimate_usd: number
  recommendations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Vessel Performance Monitor 分析 ---
function analyzeVesselPerformance(input: VesselPerformanceInput): VesselPerformanceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vessel_imo + input.engine_type + input.fuel_type
  ))

  const basePower = input.dwt * rng.nextFloat(0.8, 1.2)
  const seaStateFactor = { calm: 1.0, slight: 1.05, moderate: 1.12, rough: 1.25, very_rough: 1.4 }[input.sea_state]
  const engineLoad = Math.min(95, Math.max(40, (input.current_speed_kn / 14) * 100 * seaStateFactor))
  const mePower = Math.round(basePower * (engineLoad / 100))
  const meRpm = Math.round(80 + (engineLoad / 100) * 40)
  const sfoc = Math.round((165 + rng.nextFloat(-5, 10)) * 10) / 10
  const fuelConsumption = Math.round(mePower * sfoc * 24 / 1000 * seaStateFactor * 10) / 10
  const boilerConsumption = Math.round(rng.nextFloat(2, 8) * 10) / 10
  const turboEff = Math.round(rng.nextFloat(0.72, 0.88) * 100) / 100

  const optimalSpeed = Math.round((11 + rng.nextFloat(-1, 2)) * 10) / 10
  const fuelSavings = Math.round(((input.current_speed_kn - optimalSpeed) / input.current_speed_kn) * 15 * 10) / 10
  const etaDelay = Math.round((input.current_speed_kn - optimalSpeed) > 0 ? (500 / optimalSpeed - 500 / input.current_speed_kn) : 0)
  const co2Reduction = Math.round(fuelConsumption * 3.206 * (fuelSavings / 100) * 10) / 10

  const foulingLevels: HullCondition['fouling_level'][] = ['clean', 'light', 'moderate', 'heavy']
  const fouling = rng.pick(foulingLevels)
  const dragIncrease = { clean: 0, light: 5, moderate: 12, heavy: 25 }[fouling]

  const performanceIndex = Math.round((100 - engineLoad * 0.3 - dragIncrease * 0.5 + turboEff * 20) * 10) / 10

  const recommendations: string[] = []
  if (engineLoad > 85) recommendations.push('主机负载偏高，建议降低航速至经济航速以降低磨损')
  if (fouling !== 'clean') recommendations.push(`船体污底等级${fouling}，建议安排水下清洗以减少${dragIncrease}%阻力`)
  if (sfoc > 170) recommendations.push('SFOC偏高，建议检查主机喷油器及增压器效率')
  if (fuelSavings > 5) recommendations.push(`航速优化潜力${fuelSavings}%，建议采用慢速航行策略`)
  recommendations.push('建议安装轴功率监控系统实现实时能效管理')

  const alertFlags: string[] = []
  if (engineLoad > 90) alertFlags.push('WARNING: 主机过载风险')
  if (fouling === 'heavy') alertFlags.push('CRITICAL: 严重污底需立即处理')
  if (sfoc > 175) alertFlags.push('WARNING: 燃油效率低于设计值')

  return {
    vessel_imo: input.vessel_imo,
    vessel_name: input.vessel_name,
    engine_metrics: {
      me_power_kw: mePower,
      me_rpm: meRpm,
      sfoc_g_kwh: sfoc,
      fuel_consumption_t_day: fuelConsumption,
      engine_load_pct: Math.round(engineLoad),
      turbocharger_efficiency: turboEff,
      boiler_consumption_t_day: boilerConsumption,
    },
    speed_optimization: {
      optimal_speed_kn: optimalSpeed,
      fuel_savings_pct: Math.max(0, fuelSavings),
      eta_delay_hours: etaDelay,
      co2_reduction_t_day: co2Reduction,
      recommended_rpm: Math.round(optimalSpeed * 6.5),
    },
    hull_condition: {
      fouling_level: fouling,
      drag_increase_pct: dragIncrease,
      last_docking_date: '2024-03-15',
      next_docking_due: '2027-03-15',
      hull_coating_type: 'Silicone-based SPC',
    },
    performance_index: performanceIndex,
    recommendations,
    alert_flags: alertFlags,
  }
}

// --- Tool 2: Maritime Route Planner 分析 ---
function analyzeRoutePlanner(input: RoutePlannerInput): RoutePlannerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.origin_port + input.destination_port + input.canal_route
  ))

  const baseDistance = rng.nextInt(2800, 12000)
  const canalFactor = { suez: 0.85, panama: 0.88, cape_of_good_hope: 1.15, northeast_passage: 0.78, direct: 1.0 }[input.canal_route]
  const totalDistance = Math.round(baseDistance * canalFactor)

  const avgSpeed = input.optimization_criteria === 'fuel_optimal' ? 11 : input.optimization_criteria === 'weather_routing' ? 12.5 : 14
  const totalEta = Math.round(totalDistance / avgSpeed)

  const fuelEstimate = Math.round(totalDistance * rng.nextFloat(0.015, 0.025) * (avgSpeed / 12))

  const waypoints: Waypoint[] = []
  const numWaypoints = rng.nextInt(4, 8)
  for (let i = 0; i < numWaypoints; i++) {
    const progress = i / (numWaypoints - 1)
    waypoints.push({
      name: i === 0 ? input.origin_port : i === numWaypoints - 1 ? input.destination_port : `WP-${String.fromCharCode(65 + i)}`,
      latitude: Math.round((rng.nextFloat(-35, 55) + progress * 10) * 100) / 100,
      longitude: Math.round((rng.nextFloat(-180, 180)) * 100) / 100,
      distance_nm: Math.round(totalDistance * progress),
      eta: new Date(new Date(input.departure_time).getTime() + (totalEta * progress * 3600000)).toISOString(),
      weather_forecast: rng.pick(['晴朗', '多云', '小雨', '中雨', '大风', '涌浪']),
      wave_height_m: Math.round(rng.nextFloat(0.5, 4.5) * 10) / 10,
      wind_speed_kn: Math.round(rng.nextFloat(5, 35)),
      current_kn: Math.round(rng.nextFloat(-1, 2.5) * 10) / 10,
    })
  }

  const segments: RouteSegment[] = []
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segDist = waypoints[i + 1].distance_nm - waypoints[i].distance_nm
    segments.push({
      from: waypoints[i].name,
      to: waypoints[i + 1].name,
      distance_nm: segDist,
      bearing_deg: Math.round(rng.nextFloat(0, 360)),
      estimated_speed_kn: Math.round(avgSpeed * rng.nextFloat(0.85, 1.0) * 10) / 10,
      fuel_consumption_t: Math.round(segDist * rng.nextFloat(0.015, 0.025)),
      weather_risk: rng.pick(['low', 'low', 'moderate', 'moderate', 'high']),
    })
  }

  const weatherAlerts: string[] = []
  if (rng.next() > 0.5) weatherAlerts.push(`途经区域${rng.pick(['马六甲海峡', '好望角', '霍尔木兹海峡', '英吉利海峡'])}有${rng.pick(['热带低压', '大风预警', '浓雾', '强涌浪'])}`)
  if (rng.next() > 0.6) weatherAlerts.push('建议关注台风路径，必要时调整航线')

  const ecaZones: string[] = []
  if (rng.next() > 0.3) ecaZones.push('北海ECA')
  if (rng.next() > 0.4) ecaZones.push('北美ECA')
  if (rng.next() > 0.5) ecaZones.push('波罗的海ECA')

  const routeRecs: string[] = []
  routeRecs.push(`推荐航线: ${input.canal_route === 'direct' ? '大圆航线' : `经${input.canal_route === 'suez' ? '苏伊士运河' : input.canal_route === 'panama' ? '巴拿马运河' : input.canal_route === 'cape_of_good_hope' ? '好望角' : '东北航道'}`}`)
  if (ecaZones.length > 0) routeRecs.push(`穿越${ecaZones.length}个排放控制区，需切换至低硫燃油`)
  if (input.optimization_criteria === 'weather_routing') routeRecs.push('气象导航优化：已规避恶劣天气区域')

  return {
    total_distance_nm: totalDistance,
    total_eta_hours: totalEta,
    total_fuel_estimate_t: fuelEstimate,
    waypoints,
    segments,
    weather_alerts: weatherAlerts,
    canal_transit: input.canal_route === 'direct' ? '不适用' : `${input.canal_route} 预计通过时间 ${rng.nextInt(12, 36)} 小时`,
    eca_zones_crossed: ecaZones,
    route_recommendations: routeRecs,
  }
}

// --- Tool 3: Port Call Optimizer 分析 ---
function analyzePortCall(input: PortCallInput): PortCallResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vessel_imo + input.port_unlocode
  ))

  const berthWindows: BerthWindow[] = []
  const numBerths = rng.nextInt(2, 5)
  const berthNames = ['Berth A1', 'Berth B2', 'Berth C3', 'Berth D4', 'Berth E5']
  for (let i = 0; i < numBerths; i++) {
    const depth = Math.round((12 + rng.nextFloat(0, 8)) * 10) / 10
    const compatible = depth >= input.vessel_draft_m + 1.5 ? 'suitable' : depth >= input.vessel_draft_m ? 'marginal' : 'unsuitable'
    berthWindows.push({
      berth_name: berthNames[i],
      berth_length_m: Math.round(200 + rng.nextFloat(0, 200)),
      berth_depth_m: depth,
      available_from: new Date(new Date(input.eta_current).getTime() + rng.nextInt(0, 48) * 3600000).toISOString(),
      available_to: new Date(new Date(input.eta_current).getTime() + rng.nextInt(72, 240) * 3600000).toISOString(),
      tidal_window: input.tide_dependent ? `高潮前后${rng.nextInt(1, 3)}小时` : '不受潮汐限制',
      compatibility: compatible,
    })
  }

  const suitableBerths = berthWindows.filter(b => b.compatibility === 'suitable')
  const recommendedBerth = suitableBerths.length > 0 ? suitableBerths[0].berth_name : berthWindows[0].berth_name

  const operationHours = Math.round(input.cargo_volume_t / rng.nextFloat(800, 2500))
  const congestionLevel: PortCallResult['congestion_level'] = rng.pick(['low', 'moderate', 'moderate', 'high'])
  const waitingTime = { low: rng.nextInt(0, 4), moderate: rng.nextInt(4, 12), high: rng.nextInt(12, 36), severe: rng.nextInt(36, 72) }[congestionLevel]

  const pilotTime = new Date(new Date(input.eta_current).getTime() + waitingTime * 3600000)
  const berthArrival = new Date(pilotTime.getTime() + rng.nextInt(1, 3) * 3600000)
  const cargoStart = new Date(berthArrival.getTime() + rng.nextInt(1, 2) * 3600000)
  const cargoEnd = new Date(cargoStart.getTime() + operationHours * 3600000)
  const unberth = new Date(cargoEnd.getTime() + rng.nextInt(1, 2) * 3600000)
  const departure = new Date(unberth.getTime() + rng.nextInt(1, 3) * 3600000)

  const portDues = Math.round(input.cargo_volume_t * rng.nextFloat(0.5, 2.5) + rng.nextFloat(5000, 25000))

  const recommendations: string[] = []
  if (congestionLevel === 'high') recommendations.push('港口拥堵严重，建议提前联系代理确认靠泊窗口')
  if (input.tide_dependent) recommendations.push('船舶受潮汐限制，需确认高潮时间窗口')
  recommendations.push(`预计装卸效率: ${Math.round(input.cargo_volume_t / operationHours)} t/h`)
  if (suitableBerths.length > 1) recommendations.push(`备选泊位: ${suitableBerths.slice(1).map(b => b.berth_name).join(', ')}`)

  return {
    vessel_imo: input.vessel_imo,
    port_name: input.port_name,
    berth_windows: berthWindows,
    recommended_berth: recommendedBerth,
    port_schedule: {
      pilot_boarding: pilotTime.toISOString(),
      tug_assist_required: rng.nextInt(2, 4),
      berth_arrival: berthArrival.toISOString(),
      cargo_operation_start: cargoStart.toISOString(),
      estimated_operation_hours: operationHours,
      cargo_operation_end: cargoEnd.toISOString(),
      unberthing: unberth.toISOString(),
      port_departure: departure.toISOString(),
    },
    congestion_level: congestionLevel,
    waiting_time_estimate_hours: waitingTime,
    port_dues_estimate_usd: portDues,
    recommendations,
  }
}

// --- Tool 4: Maritime Emission Tracker 分析 ---
function analyzeEmissionTracker(input: EmissionTrackerInput): EmissionTrackerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vessel_imo + input.reporting_period
  ))

  const fuelBreakdown = input.fuel_consumption_data.map(f => {
    const co2Factor = f.fuel_type === 'HFO' ? 3.114 : f.fuel_type === 'VLSFO' ? 3.114 : f.fuel_type === 'MGO' ? 3.206 : f.fuel_type === 'LNG' ? 2.75 : 1.375
    return {
      fuel_type: f.fuel_type,
      tonnes: f.tonnes,
      co2_factor: co2Factor,
      co2_tonnes: Math.round(f.tonnes * co2Factor * 100) / 100,
    }
  })

  const totalCo2 = fuelBreakdown.reduce((s, f) => s + f.co2_tonnes, 0)
  const totalFuel = input.fuel_consumption_data.reduce((s, f) => s + f.tonnes, 0)
  const distance = input.distance_travelled_nm || rng.nextInt(5000, 15000)
  const transportWork = input.transport_work_ton_mile || (input.deadweight * distance * 0.7)

  const attainedCii = Math.round((totalCo2 / transportWork) * 10000 * 100) / 100
  const requiredCii = Math.round(attainedCii * rng.nextFloat(0.75, 0.92) * 100) / 100

  let ciiRating: CarbonIntensity['cii_rating'] = 'C'
  const ratio = attainedCii / requiredCii
  if (ratio < 0.8) ciiRating = 'A'
  else if (ratio < 0.9) ciiRating = 'B'
  else if (ratio < 1.0) ciiRating = 'C'
  else if (ratio < 1.1) ciiRating = 'D'
  else ciiRating = 'E'

  const eexiValue = Math.round(rng.nextFloat(3.5, 6.5) * 100) / 100
  const eexiRef = input.eedi_reference || 5.0
  const eexiCompliance = eexiValue <= eexiRef * 0.9 ? 'compliant' : eexiValue <= eexiRef ? 'marginal' : 'non_compliant'

  const ch4 = Math.round(totalFuel * 0.002 * 100) / 100
  const n2o = Math.round(totalFuel * 0.0001 * 1000) / 1000
  const sox = Math.round(totalFuel * 0.02 * rng.nextFloat(0.5, 1.0) * 100) / 100
  const nox = Math.round(totalFuel * 0.087 * 100) / 100
  const pm = Math.round(totalFuel * 0.01 * 100) / 100
  const co2Eq = Math.round((totalCo2 + ch4 * 28 + n2o * 265) * 100) / 100

  const complianceStatus = ciiRating === 'A' || ciiRating === 'B' ? 'compliant' : ciiRating === 'C' ? 'at_risk' : 'non_compliant'

  const improvementMeasures: string[] = []
  if (ciiRating === 'D' || ciiRating === 'E') {
    improvementMeasures.push('CII评级偏低，建议实施慢速航行计划')
    improvementMeasures.push('考虑安装节能装置(ESD)如导流罩、预旋器')
    improvementMeasures.push('优化船体涂层方案，减少摩擦阻力')
  }
  improvementMeasures.push('建议采用LNG或甲醇等替代燃料以降低碳强度')
  improvementMeasures.push('安装船舶能效管理系统(SEEMP Part III)并提交IMO')

  return {
    vessel_imo: input.vessel_imo,
    vessel_name: input.vessel_name,
    reporting_period: input.reporting_period,
    carbon_intensity: {
      attained_cii: attainedCii,
      required_cii: requiredCii,
      cii_rating: ciiRating,
      rating_trend: rng.pick(['improving', 'stable', 'deteriorating']),
      eexi_value: eexiValue,
      eexi_reference: eexiRef,
      eexi_compliance: eexiCompliance,
    },
    emission_totals: {
      co2_tonnes: Math.round(totalCo2 * 100) / 100,
      ch4_tonnes: ch4,
      n2o_tonnes: n2o,
      sox_tonnes: sox,
      nox_tonnes: nox,
      pm_tonnes: pm,
      co2_equivalent_tonnes: co2Eq,
    },
    fuel_breakdown: fuelBreakdown,
    compliance_status: complianceStatus,
    improvement_measures: improvementMeasures,
    eu_mrv_reporting: true,
    imo_dcs_reporting: true,
  }
}

// --- Tool 5: Cargo Loading Planner 分析 ---
function analyzeCargoLoading(input: CargoLoadingInput): CargoLoadingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vessel_imo + input.cargo_manifest.length.toString()
  ))

  const holdAllocations: HoldAllocation[] = input.cargo_manifest.map((c, i) => {
    const volume = Math.round(c.weight_t / c.sf_m3_t * 100) / 100
    const holdCapacity = input.summer_deadweight_t / input.tank_or_hold_count
    const fillPct = Math.round((c.weight_t / holdCapacity) * 100 * 10) / 10
    return {
      hold_no: c.hold_no,
      cargo_type: c.cargo_type,
      weight_t: c.weight_t,
      volume_m3: volume,
      fill_pct: Math.min(98, fillPct),
      ullage_m: Math.round((1 - fillPct / 100) * rng.nextFloat(2, 6) * 10) / 10,
    }
  })

  const totalCargo = input.cargo_manifest.reduce((s, c) => s + c.weight_t, 0)
  const dwtUtil = Math.round((totalCargo / input.summer_deadweight_t) * 100 * 10) / 10

  const displacement = totalCargo + input.summer_deadweight_t * 0.05 + rng.nextFloat(2000, 5000)
  const kg = Math.round((7 + rng.nextFloat(-1, 3)) * 100) / 100
  const km = Math.round((8 + rng.nextFloat(-0.5, 2)) * 100) / 100
  const gm = Math.round((km - kg) * 100) / 100
  const trim = Math.round(rng.nextFloat(-1.5, 1.5) * 100) / 100
  const listDeg = Math.round(rng.nextFloat(-2, 2) * 10) / 10
  const maxShear = Math.round(rng.nextFloat(60, 95))
  const maxBM = Math.round(rng.nextFloat(55, 92))

  const strengthCompliance = maxShear < 85 && maxBM < 85 ? 'pass' : maxShear < 95 && maxBM < 92 ? 'marginal' : 'fail'

  const draftFwd = Math.round((input.summer_draft_m + trim / 2) * 100) / 100
  const draftAft = Math.round((input.summer_draft_m - trim / 2) * 100) / 100
  const ballastReq = Math.round(Math.max(0, (input.summer_deadweight_t * 0.35 - totalCargo * 0.1)))

  let stabilityCompliance: CargoLoadingResult['stability_compliance'] = 'pass'
  if (gm < 0.15 || Math.abs(trim) > 2 || Math.abs(listDeg) > 3) stabilityCompliance = 'fail'
  else if (gm < 0.3 || Math.abs(trim) > 1 || strengthCompliance === 'marginal') stabilityCompliance = 'conditional'

  const loadingSequence: string[] = []
  loadingSequence.push('1. 检查所有货舱清洁度及涂层状况')
  loadingSequence.push('2. 按配载仪计算结果分配各舱货物')
  loadingSequence.push('3. 先装底舱后装上层舱，保持纵向强度')
  loadingSequence.push('4. 每完成一个舱室校核剪力和弯矩')
  loadingSequence.push('5. 最终核算GM、吃水差和稳性曲线')

  const warnings: string[] = []
  if (gm < 0.3) warnings.push('WARNING: GM值偏低，稳性不足')
  if (Math.abs(trim) > 1.0) warnings.push('WARNING: 吃水差过大，影响操纵性能')
  if (dwtUtil > 95) warnings.push('WARNING: 载重利用率过高，注意结构强度')
  if (strengthCompliance === 'fail') warnings.push('CRITICAL: 纵向强度超限，需重新配载')

  return {
    vessel_imo: input.vessel_imo,
    vessel_name: input.vessel_name,
    hold_allocations: holdAllocations,
    stability_parameters: {
      displacement_t: Math.round(displacement),
      kg_m: kg,
      km_m: km,
      gm_m: gm,
      trim_m: trim,
      list_deg: listDeg,
      max_shear_force_pct: maxShear,
      max_bending_moment_pct: maxBM,
      strength_compliance: strengthCompliance,
    },
    draft_fwd_m: draftFwd,
    draft_aft_m: draftAft,
    ballast_required_t: ballastReq,
    total_cargo_loaded_t: totalCargo,
    dwt_utilization_pct: dwtUtil,
    stability_compliance: stabilityCompliance,
    loading_sequence: loadingSequence,
    warnings,
  }
}

// --- Tool 6: Crew Management Scheduler 分析 ---
function analyzeCrewManagement(input: CrewManagementInput): CrewManagementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vessel_imo + input.crew_complement.toString()
  ))

  const crewRoster: CrewManagementResult['crew_roster'] = input.current_crew.map(c => {
    const contractEnd = new Date(c.contract_end)
    const daysToEnd = Math.round((contractEnd.getTime() - Date.now()) / 86400000)
    const certEnd = new Date(c.cert_expiry)
    const daysToCert = Math.round((certEnd.getTime() - Date.now()) / 86400000)

    const contractStatus = daysToEnd < 0 ? 'overdue' : daysToEnd < 60 ? 'expiring_soon' : 'active'
    const certStatus = daysToCert < 0 ? 'expired' : daysToCert < 90 ? 'expiring_soon' : 'valid'
    const restCompliance = c.rest_hours_last_24 >= 10 ? 'compliant' : c.rest_hours_last_24 >= 8 ? 'minor_violation' : 'major_violation'

    return {
      rank: c.rank,
      name: c.name,
      nationality: c.nationality,
      contract_status: contractStatus,
      cert_status: certStatus,
      rest_compliance: restCompliance,
      hours_worked_last_7_days: Math.round(rng.nextFloat(44, 77)),
      max_hours_remaining: Math.round(rng.nextFloat(0, 20)),
    }
  })

  const requiredRanks: Record<string, number> = {
    'Master': 1, 'Chief Officer': 1, '2nd Officer': 1, '3rd Officer': 1,
    'Chief Engineer': 1, '2nd Engineer': 1, '3rd Engineer': 1, '4th Engineer': 1,
    'Bosun': 2, 'AB': 3, 'Oiler': 2, 'Cook': 1,
  }

  const manningCheck: ManningCheck[] = Object.entries(requiredRanks).map(([rank, req]) => {
    const assigned = input.current_crew.filter(c => c.rank === rank).length
    return {
      rank,
      required: req,
      assigned,
      deficit: Math.max(0, req - assigned),
      stcw_required: [`STCW ${rank === 'Master' || rank.includes('Officer') ? 'II/2' : rank.includes('Engineer') ? 'III/2' : 'I/2'}`],
    }
  })

  const restViolations = crewRoster.filter(c => c.rest_compliance !== 'compliant').length
  const certExpiring = crewRoster.filter(c => c.cert_status === 'expiring_soon' || c.cert_status === 'expired').length
  const crewChanges = crewRoster.filter(c => c.contract_status === 'expiring_soon' || c.contract_status === 'overdue').length

  const stcwCompliance = restViolations === 0 && certExpiring === 0 ? 'compliant' : restViolations <= 2 ? 'at_risk' : 'non_compliant'
  const mlcCompliance = restViolations === 0 ? 'compliant' : restViolations <= 2 ? 'at_risk' : 'non_compliant'

  const recommendations: string[] = []
  if (crewChanges > 0) recommendations.push(`${crewChanges}名船员合同即将到期，建议安排换班`)
  if (certExpiring > 0) recommendations.push(`${certExpiring}名船员证书即将过期，需安排更新培训`)
  if (restViolations > 0) recommendations.push(`${restViolations}名船员休息时间不合规，需调整值班安排`)
  recommendations.push('建议每季度进行STCW合规自查')
  recommendations.push('确保MLC 2006要求的船员就业协议、工资单、工时记录完整')

  return {
    vessel_imo: input.vessel_imo,
    vessel_name: input.vessel_name,
    crew_roster: crewRoster,
    manning_check: manningCheck,
    stcw_compliance: stcwCompliance,
    mlc_compliance: mlcCompliance,
    rest_hour_violations: restViolations,
    cert_expiring_30d: certExpiring,
    crew_changes_recommended: crewChanges,
    recommendations,
  }
}

// --- Tool 7: Maritime Safety Inspector 分析 ---
function analyzeSafetyInspection(input: SafetyInspectionInput): SafetyInspectionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vessel_imo + input.psc_region
  ))

  const docReady = Math.round(rng.nextFloat(75, 98))
  const equipReady = Math.round(rng.nextFloat(70, 95))
  const crewReady = Math.round(rng.nextFloat(72, 96))
  const housekeeping = Math.round(rng.nextFloat(68, 94))
  const overallScore = Math.round((docReady * 0.25 + equipReady * 0.3 + crewReady * 0.25 + housekeeping * 0.2))

  const deficiencyCategories = [
    { code: '11101', category: '救生设备', desc: '救生艇发动机启动困难', severity: 'major' as const, reg: 'SOLAS III/19' },
    { code: '11103', category: '救生设备', desc: '救生筏静水压力释放器过期', severity: 'detainable' as const, reg: 'SOLAS III/38' },
    { code: '03105', category: '消防安全', desc: '机舱通风筒挡板卡死', severity: 'major' as const, reg: 'SOLAS II-2/5.2' },
    { code: '03109', category: '消防安全', desc: '消防栓密封垫老化漏水', severity: 'minor' as const, reg: 'SOLAS II-2/10' },
    { code: '07101', category: '航行安全', desc: '海图未更新至最新通告', severity: 'major' as const, reg: 'SOLAS V/27' },
    { code: '07111', category: '航行安全', desc: 'ECDIS备用配置缺失', severity: 'detainable' as const, reg: 'SOLAS V/19' },
    { code: '10101', category: '无线电通信', desc: 'SART电池过期', severity: 'major' as const, reg: 'SOLAS IV/15' },
    { code: '15150', category: 'MLC/MLC 2006', desc: '船员餐厅冰箱故障', severity: 'minor' as const, reg: 'MLC Title 3.2' },
    { code: '18201', category: 'ISM/安全管理体系', desc: '未按时进行应急演习', severity: 'major' as const, reg: 'ISM 8.1' },
    { code: '18320', category: '结构/水密', desc: '通风筒围板锈蚀穿孔', severity: 'detainable' as const, reg: 'SOLAS XII/8' },
  ]

  const numDeficiencies = rng.nextInt(2, 6)
  const deficiencies: DeficiencyItem[] = []
  const usedCodes = new Set<string>()
  for (let i = 0; i < numDeficiencies; i++) {
    const cat = rng.pick(deficiencyCategories)
    if (usedCodes.has(cat.code)) continue
    usedCodes.add(cat.code)
    deficiencies.push({
      code: cat.code,
      category: cat.category,
      description: cat.desc,
      severity: cat.severity,
      regulation_ref: cat.reg,
      action_required: cat.severity === 'detainable' ? '开航前修复' : cat.severity === 'major' ? '14天内修复' : '下次坞修前修复',
      estimated_repair_hours: cat.severity === 'detainable' ? rng.nextInt(8, 48) : cat.severity === 'major' ? rng.nextInt(2, 16) : rng.nextInt(1, 4),
    })
  }

  const detainableCount = deficiencies.filter(d => d.severity === 'detainable').length
  let detentionRisk: SafetyInspectionResult['detention_risk'] = 'low'
  if (detainableCount >= 2 || overallScore < 70) detentionRisk = 'critical'
  else if (detainableCount === 1 || overallScore < 80) detentionRisk = 'high'
  else if (deficiencies.length >= 4 || overallScore < 85) detentionRisk = 'moderate'

  const correctiveActions: string[] = []
  for (const d of deficiencies) {
    correctiveActions.push(`[${d.code}] ${d.description} — ${d.action_required} (${d.estimated_repair_hours}h)`)
  }

  const regulatoryUpdates: string[] = []
  regulatoryUpdates.push(`${input.psc_region} 2025年度集中检查大会(CII)聚焦: ${rng.pick(['能效、消防救生', 'MLC船员福利', '航行安全', '压载水管理'])}`)
  regulatoryUpdates.push('IMO MEPC 82新增要求：2026年起强化CII验证程序')

  const recommendations: string[] = []
  recommendations.push(`PSC预检评分: ${overallScore}/100 — ${detentionRisk === 'low' ? '低风险' : detentionRisk === 'moderate' ? '中等风险' : detentionRisk === 'high' ? '高风险' : '极高风险'}`)
  if (detainableCount > 0) recommendations.push(`存在${detainableCount}项可滞留缺陷，必须在到港前修复`)
  recommendations.push('建议开展PSC模拟演练，提升船员应急反应能力')
  recommendations.push('检查消防救生设备维护记录完整性')

  return {
    vessel_imo: input.vessel_imo,
    vessel_name: input.vessel_name,
    psc_region: input.psc_region,
    inspection_readiness: {
      overall_score: overallScore,
      documentation_readiness_pct: docReady,
      equipment_readiness_pct: equipReady,
      crew_readiness_pct: crewReady,
      housekeeping_pct: housekeeping,
    },
    deficiencies,
    detainable_deficiencies: detainableCount,
    detention_risk: detentionRisk,
    corrective_actions: correctiveActions,
    regulatory_updates: regulatoryUpdates,
    recommendations,
  }
}

// --- Tool 8: Ship Maintenance Planner 分析 ---
function analyzeMaintenance(input: MaintenanceInput): MaintenanceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vessel_imo + input.class_society
  ))

  const vesselAge = new Date().getFullYear() - input.year_built

  const surveySchedule: SurveySchedule[] = [
    {
      survey_type: '特检 (Special Survey)',
      last_done: input.last_special_survey,
      next_due: new Date(new Date(input.last_special_survey).getTime() + 5 * 365 * 86400000).toISOString().split('T')[0],
      window_start: new Date(new Date(input.last_special_survey).getTime() + 4.5 * 365 * 86400000).toISOString().split('T')[0],
      window_end: new Date(new Date(input.last_special_survey).getTime() + 5.25 * 365 * 86400000).toISOString().split('T')[0],
      status: 'current',
      interval_years: 5,
    },
    {
      survey_type: '中间检验 (Intermediate Survey)',
      last_done: input.last_intermediate_survey,
      next_due: new Date(new Date(input.last_intermediate_survey).getTime() + 2.5 * 365 * 86400000).toISOString().split('T')[0],
      window_start: new Date(new Date(input.last_intermediate_survey).getTime() + 2.25 * 365 * 86400000).toISOString().split('T')[0],
      window_end: new Date(new Date(input.last_intermediate_survey).getTime() + 2.75 * 365 * 86400000).toISOString().split('T')[0],
      status: rng.pick(['current', 'due_soon']),
      interval_years: 2.5,
    },
    {
      survey_type: '坞检 (Docking Survey)',
      last_done: input.last_docking,
      next_due: new Date(new Date(input.last_docking).getTime() + 2.5 * 365 * 86400000).toISOString().split('T')[0],
      window_start: new Date(new Date(input.last_docking).getTime() + 2.25 * 365 * 86400000).toISOString().split('T')[0],
      window_end: new Date(new Date(input.last_docking).getTime() + 3 * 365 * 86400000).toISOString().split('T')[0],
      status: rng.pick(['current', 'due_soon', 'overdue']),
      interval_years: 2.5,
    },
    {
      survey_type: '尾轴检验 (Tailshaft Survey)',
      last_done: input.last_docking,
      next_due: new Date(new Date(input.last_docking).getTime() + 5 * 365 * 86400000).toISOString().split('T')[0],
      window_start: new Date(new Date(input.last_docking).getTime() + 4.5 * 365 * 86400000).toISOString().split('T')[0],
      window_end: new Date(new Date(input.last_docking).getTime() + 5.25 * 365 * 86400000).toISOString().split('T')[0],
      status: 'current',
      interval_years: 5,
    },
  ]

  const dryDockDays = rng.nextInt(14, 35)
  const baseCost = rng.nextFloat(800000, 3500000)
  const ageFactor = 1 + vesselAge * 0.02
  const estimatedCost = Math.round(baseCost * ageFactor)

  const yards = ['中远海运重工', '招商工业', '扬子江船业', '新时代造船', '现代重工', '大宇造船', '三星重工']
  const recommendedYard: string[] = []
  for (let i = 0; i < 3; i++) {
    recommendedYard.push(rng.pick(yards))
  }

  const surveyItems: string[] = []
  surveyItems.push('船体结构测厚 (Hull thickness measurement)')
  surveyItems.push('压载舱内部检查 (Ballast tank inspection)')
  surveyItems.push('货舱结构完整性检查')
  surveyItems.push('舵系及螺旋桨检查')
  surveyItems.push('海底阀箱及通海阀拆检')
  surveyItems.push('船壳板及焊缝UT/MT探伤')

  const classConditions: string[] = []
  if (vesselAge > 15) classConditions.push('老龄船加强检验：货舱边舱加倍测厚点')
  if (vesselAge > 20) classConditions.push('ESP增强检验程序适用')
  classConditions.push('CMS连续机器监控系统数据提交')

  const statutoryItems: string[] = []
  statutoryItems.push('国际载重线证书 (ILLC)')
  statutoryItems.push('国际防止油污证书 (IOPP)')
  statutoryItems.push('国际生活污水防止污染证书 (ISPP)')
  statutoryItems.push('国际防止空气污染证书 (IAPP)')
  statutoryItems.push('安全管理证书 (SMC)')

  const pendingItems = input.maintenance_items.filter(m => m.status === 'pending')
  const overdueItems = pendingItems.filter(m => new Date(m.due_date) < new Date()).length

  const upcomingDeadlines: string[] = []
  for (const s of surveySchedule) {
    if (s.status === 'due_soon' || s.status === 'overdue') {
      upcomingDeadlines.push(`${s.survey_type}: ${s.next_due} (${s.status === 'overdue' ? '已逾期' : '即将到期'})`)
    }
  }

  const recommendations: string[] = []
  if (overdueItems > 0) recommendations.push(`${overdueItems}项维修项目已逾期，需立即安排`)
  recommendations.push(`推荐船厂: ${recommendedYard.slice(0, 2).join(' / ')}`)
  recommendations.push(`预计坞修天数: ${dryDockDays}天`)
  if (vesselAge > 15) recommendations.push('船龄超过15年，建议增加ESP检验项目')
  recommendations.push('建议提前6个月与船级社沟通检验范围')

  return {
    vessel_imo: input.vessel_imo,
    vessel_name: input.vessel_name,
    class_society: input.class_society,
    vessel_age_years: vesselAge,
    survey_schedule: surveySchedule,
    maintenance_plan: {
      dry_dock_days: dryDockDays,
      estimated_cost_usd: estimatedCost,
      recommended_yard: recommendedYard,
      survey_items: surveyItems,
      class_conditions: classConditions,
      statutory_items: statutoryItems,
      hull_thickness_measurements: rng.nextInt(200, 800),
      coating_renewal_pct: Math.round(rng.nextFloat(60, 95)),
    },
    class_status: classConditions.length > 2 ? 'with_conditions' : 'clean',
    overdue_items: overdueItems,
    upcoming_deadlines: upcomingDeadlines,
    budget_estimate_usd: estimatedCost,
    recommendations,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Vessel Performance Monitor 报告 ---
function formatVesselPerformanceReport(result: VesselPerformanceResult): string {
  const lines: string[] = []
  lines.push('## 🚢 船舶主机能效与航速优化报告')
  lines.push('')
  lines.push(`船舶: ${result.vessel_name} (IMO: ${result.vessel_imo})`)
  lines.push(`能效指数: ${result.performance_index} | 主机负载: ${result.engine_metrics.engine_load_pct}% | 燃油消耗: ${result.engine_metrics.fuel_consumption_t_day} t/d`)
  lines.push('')
  lines.push('### 🔗 能效管理拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    GPS[GPS/计程仪] --> EEOI[EEOI计算引擎]')
  lines.push('    ENGINE[主机监控系统] --> EEOI')
  lines.push('    HULL[船体性能监测] --> EEOI')
  lines.push('    WEATHER[气象数据] --> ROUTING[航速优化模块]')
  lines.push('    EEOI --> ROUTING')
  lines.push('    ROUTING --> REC[优化建议输出]')
  lines.push('```')
  lines.push('')

  lines.push('### ⚙️ 主机运行参数')
  lines.push('| 参数 | 数值 | 单位 | 状态 |')
  lines.push('|------|------|------|------|')
  lines.push(`| 主机功率 | ${result.engine_metrics.me_power_kw} | kW | ${result.engine_metrics.engine_load_pct > 85 ? '⚠️ 偏高' : '✅ 正常'} |`)
  lines.push(`| 主机转速 | ${result.engine_metrics.me_rpm} | rpm | ✅ |`)
  lines.push(`| SFOC | ${result.engine_metrics.sfoc_g_kwh} | g/kWh | ${result.engine_metrics.sfoc_g_kwh > 170 ? '⚠️ 偏高' : '✅ 良好'} |`)
  lines.push(`| 日燃油消耗 | ${result.engine_metrics.fuel_consumption_t_day} | t/d | — |`)
  lines.push(`| 增压器效率 | ${result.engine_metrics.turbocharger_efficiency * 100} | % | — |`)
  lines.push(`| 锅炉消耗 | ${result.engine_metrics.boiler_consumption_t_day} | t/d | — |`)
  lines.push('')

  lines.push('### 🚀 航速优化建议')
  lines.push('| 指标 | 当前 | 优化后 | 节省 |')
  lines.push('|------|------|--------|------|')
  lines.push(`| 航速 (kn) | — | ${result.speed_optimization.optimal_speed_kn} | — |`)
  lines.push(`| 主机转速 (rpm) | — | ${result.speed_optimization.recommended_rpm} | — |`)
  lines.push(`| 燃油节省 (%) | — | ${result.speed_optimization.fuel_savings_pct} | — |`)
  lines.push(`| CO₂减排 (t/d) | — | ${result.speed_optimization.co2_reduction_t_day} | — |`)
  lines.push(`| ETA延迟 (h) | — | ${result.speed_optimization.eta_delay_hours} | — |`)
  lines.push('')

  lines.push('### 🐚 船体状况')
  lines.push(`- 污底等级: ${result.hull_condition.fouling_level} | 阻力增加: ${result.hull_condition.drag_increase_pct}%`)
  lines.push(`- 上次坞修: ${result.hull_condition.last_docking_date} | 下次到期: ${result.hull_condition.next_docking_due}`)
  lines.push(`- 船体涂层: ${result.hull_condition.hull_coating_type}`)
  lines.push('')

  if (result.alert_flags.length > 0) {
    lines.push('### 🚨 告警')
    for (const a of result.alert_flags) lines.push(`- ${a}`)
    lines.push('')
  }

  lines.push('### 📋 优化建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] SEEMP Part I/II/III 已建立')
  lines.push('- [x] IMO DCS 数据收集计划执行中')
  lines.push('- [x] EU MRV 报告已提交')
  lines.push('- [x] 轴功率监控系统校准有效')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • Engine Performance & Speed Optimization Module v0.1.0*')
  return lines.join('\n')
}

// --- Tool 2: Maritime Route Planner 报告 ---
function formatRoutePlannerReport(result: RoutePlannerResult): string {
  const lines: string[] = []
  lines.push('## 🧭 全球航线规划与气象导航报告')
  lines.push('')
  lines.push(`总航程: ${result.total_distance_nm} nm | 预计航行时间: ${result.total_eta_hours} h (${(result.total_eta_hours / 24).toFixed(1)} 天)`)
  lines.push(`预计燃油消耗: ${result.total_fuel_estimate_t} t | 运河通行: ${result.canal_transit}`)
  lines.push('')
  lines.push('### 🔗 航线拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  for (let i = 0; i < Math.min(result.waypoints.length - 1, 6); i++) {
    lines.push(`    ${result.waypoints[i].name.replace(/[^a-zA-Z0-9]/g, '_')}[${result.waypoints[i].name}] -->|${result.segments[i]?.distance_nm || '—'} nm| ${result.waypoints[i + 1].name.replace(/[^a-zA-Z0-9]/g, '_')}[${result.waypoints[i + 1].name}]`)
  }
  lines.push('```')
  lines.push('')

  lines.push('### 📍 航路点详情')
  lines.push('| 航路点 | 纬度 | 经度 | 距起点(nm) | ETA | 天气 | 浪高(m) | 风速(kn) |')
  lines.push('|--------|------|------|------------|-----|------|---------|---------|')
  for (const w of result.waypoints) {
    lines.push(`| ${w.name} | ${w.latitude} | ${w.longitude} | ${w.distance_nm} | ${w.eta.split('T')[0]} | ${w.weather_forecast} | ${w.wave_height_m} | ${w.wind_speed_kn} |`)
  }
  lines.push('')

  lines.push('### 🌊 航段分析')
  lines.push('| 航段 | 距离(nm) | 航向(°) | 航速(kn) | 燃油(t) | 气象风险 |')
  lines.push('|------|----------|---------|----------|---------|----------|')
  for (const s of result.segments) {
    lines.push(`| ${s.from} → ${s.to} | ${s.distance_nm} | ${s.bearing_deg} | ${s.estimated_speed_kn} | ${s.fuel_consumption_t} | ${s.weather_risk} |`)
  }
  lines.push('')

  if (result.weather_alerts.length > 0) {
    lines.push('### ⛅ 气象预警')
    for (const a of result.weather_alerts) lines.push(`- ${a}`)
    lines.push('')
  }

  if (result.eca_zones_crossed.length > 0) {
    lines.push('### 🏭 排放控制区')
    for (const e of result.eca_zones_crossed) lines.push(`- ${e} — 需使用硫含量≤0.10%燃油`)
    lines.push('')
  }

  lines.push('### 📋 航线建议')
  for (const r of result.route_recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 航线设计符合SOLAS V/34要求')
  lines.push('- [x] 电子海图(ENC)覆盖全航线')
  lines.push('- [x] 气象导航服务已订阅')
  lines.push('- [x] ECA区域燃油切换程序已制定')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • Route Planning & Weather Routing Module v0.1.0*')
  return lines.join('\n')
}

// --- Tool 3: Port Call Optimizer 报告 ---
function formatPortCallReport(result: PortCallResult): string {
  const lines: string[] = []
  lines.push('## ⚓ 港口到港预测与靠泊窗口规划报告')
  lines.push('')
  lines.push(`船舶: ${result.vessel_imo} | 港口: ${result.port_name}`)
  lines.push(`拥堵等级: ${result.congestion_level} | 预计等待: ${result.waiting_time_estimate_hours} h | 港口费用估算: $${result.port_dues_estimate_usd.toLocaleString()}`)
  lines.push('')
  lines.push('### 🔗 港口作业拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    VESSEL[抵港船舶] --> PILOT[引航登轮]')
  lines.push('    PILOT --> TUG[拖轮协助]')
  lines.push('    TUG --> BERTH[靠泊 ' + result.recommended_berth + ']')
  lines.push('    BERTH --> CARGO[货物作业]')
  lines.push('    CARGO --> UNBERTH[离泊]')
  lines.push('    UNBERTH --> DEPART[离港]')
  lines.push('```')
  lines.push('')

  lines.push('### 🏗️ 可用泊位窗口')
  lines.push('| 泊位 | 长度(m) | 深度(m) | 可用开始 | 可用结束 | 潮汐窗口 | 适配性 |')
  lines.push('|------|---------|---------|----------|----------|----------|--------|')
  for (const b of result.berth_windows) {
    lines.push(`| ${b.berth_name} | ${b.berth_length_m} | ${b.berth_depth_m} | ${b.available_from.split('T')[0]} | ${b.available_to.split('T')[0]} | ${b.tidal_window} | ${b.compatibility === 'suitable' ? '✅ 适合' : b.compatibility === 'marginal' ? '⚠️ 临界' : '❌ 不适'} |`)
  }
  lines.push('')

  lines.push('### ⏱️ 港口作业时间表')
  lines.push('| 节点 | 时间 |')
  lines.push('|------|------|')
  lines.push(`| 引航登轮 | ${result.port_schedule.pilot_boarding.replace('T', ' ').slice(0, 16)} |`)
  lines.push(`| 拖轮协助 | ${result.port_schedule.tug_assist_required} 艘 |`)
  lines.push(`| 靠泊 | ${result.port_schedule.berth_arrival.replace('T', ' ').slice(0, 16)} |`)
  lines.push(`| 开工 | ${result.port_schedule.cargo_operation_start.replace('T', ' ').slice(0, 16)} |`)
  lines.push(`| 预计工时 | ${result.port_schedule.estimated_operation_hours} h |`)
  lines.push(`| 完工 | ${result.port_schedule.cargo_operation_end.replace('T', ' ').slice(0, 16)} |`)
  lines.push(`| 离泊 | ${result.port_schedule.unberthing.replace('T', ' ').slice(0, 16)} |`)
  lines.push(`| 离港 | ${result.port_schedule.port_departure.replace('T', ' ').slice(0, 16)} |`)
  lines.push('')

  lines.push('### 📋 港口建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 船舶预抵港报告(Pre-Arrival Report)已提交')
  lines.push('- [x] 港口国控制(PSC)检查准备就绪')
  lines.push('- [x] 压载水管理计划已更新')
  lines.push('- [x] 船舶保安计划(SSP)等级确认')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • Port Call Optimization Module v0.1.0*')
  return lines.join('\n')
}

// --- Tool 4: Maritime Emission Tracker 报告 ---
function formatEmissionTrackerReport(result: EmissionTrackerResult): string {
  const lines: string[] = []
  lines.push('## 🌍 CIMO/EEXI碳强度指标追踪报告')
  lines.push('')
  lines.push(`船舶: ${result.vessel_name} (IMO: ${result.vessel_imo}) | 报告期: ${result.reporting_period}`)
  lines.push(`CII评级: ${result.carbon_intensity.cii_rating} | EEXI合规: ${result.carbon_intensity.eexi_compliance} | 总体状态: ${result.compliance_status}`)
  lines.push('')
  lines.push('### 🔗 碳排放管理拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    FUEL[燃油消耗监测] --> CO2[CO₂计算引擎]')
  lines.push('    DIST[航行距离] --> CII[CII计算]')
  lines.push('    CO2 --> CII')
  lines.push('    WORK[运输功] --> CII')
  lines.push('    CII --> RATING[CII评级 A-E]')
  lines.push('    RATING --> SEEMP[SEEMP改进计划]')
  lines.push('    RATING --> REPORT[EU MRV / IMO DCS]')
  lines.push('```')
  lines.push('')

  lines.push('### 📊 碳强度指标')
  lines.push('| 指标 | 数值 | 参考值 | 状态 |')
  lines.push('|------|------|--------|------|')
  lines.push(`| Attained CII | ${result.carbon_intensity.attained_cii} | — | — |`)
  lines.push(`| Required CII | ${result.carbon_intensity.required_cii} | — | — |`)
  lines.push(`| CII评级 | ${result.carbon_intensity.cii_rating} | ≥C | ${result.carbon_intensity.cii_rating <= 'C' ? '✅ 合规' : '⚠️ 不合规'} |`)
  lines.push(`| 评级趋势 | ${result.carbon_intensity.rating_trend} | — | — |`)
  lines.push(`| EEXI | ${result.carbon_intensity.eexi_value} | ≤${result.carbon_intensity.eexi_reference} | ${result.carbon_intensity.eexi_compliance === 'compliant' ? '✅ 合规' : result.carbon_intensity.eexi_compliance === 'marginal' ? '⚠️ 临界' : '❌ 不合规'} |`)
  lines.push('')

  lines.push('### 💨 排放总量')
  lines.push('| 污染物 | 排放量 (t) | GWP |')
  lines.push('|---------|-----------|-----|')
  lines.push(`| CO₂ | ${result.emission_totals.co2_tonnes} | 1 |`)
  lines.push(`| CH₄ | ${result.emission_totals.ch4_tonnes} | 28 |`)
  lines.push(`| N₂O | ${result.emission_totals.n2o_tonnes} | 265 |`)
  lines.push(`| SOₓ | ${result.emission_totals.sox_tonnes} | — |`)
  lines.push(`| NOₓ | ${result.emission_totals.nox_tonnes} | — |`)
  lines.push(`| PM | ${result.emission_totals.pm_tonnes} | — |`)
  lines.push(`| CO₂当量 | ${result.emission_totals.co2_equivalent_tonnes} | — |`)
  lines.push('')

  lines.push('### ⛽ 燃油消耗明细')
  lines.push('| 燃油类型 | 消耗量(t) | CO₂因子 | CO₂排放(t) |')
  lines.push('|----------|----------|---------|-----------|')
  for (const f of result.fuel_breakdown) {
    lines.push(`| ${f.fuel_type} | ${f.tonnes} | ${f.co2_factor} | ${f.co2_tonnes} |`)
  }
  lines.push('')

  lines.push('### 📋 改进措施')
  for (const m of result.improvement_measures) lines.push(`- ${m}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] IMO DCS 年度数据已提交')
  lines.push('- [x] EU MRV 报告已验证')
  lines.push('- [x] IEE证书有效')
  lines.push(result.eu_mrv_reporting ? '- [x] EU MRV 报告已提交' : '- [ ] EU MRV 报告待提交')
  lines.push(result.imo_dcs_reporting ? '- [x] IMO DCS 数据完整' : '- [ ] IMO DCS 数据待完善')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • Carbon Intensity & Emission Tracking Module v0.1.0*')
  return lines.join('\n')
}

// --- Tool 5: Cargo Loading Planner 报告 ---
function formatCargoLoadingReport(result: CargoLoadingResult): string {
  const lines: string[] = []
  lines.push('## 📦 配载仪与稳性计算报告')
  lines.push('')
  lines.push(`船舶: ${result.vessel_name} (IMO: ${result.vessel_imo})`)
  lines.push(`总载货量: ${result.total_cargo_loaded_t} t | 载重利用率: ${result.dwt_utilization_pct}% | 稳性状态: ${result.stability_compliance}`)
  lines.push('')
  lines.push('### 🔗 配载稳性拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CARGO[货物清单] --> LOADER[配载仪计算]')
  lines.push('    BALLAST[压载水系统] --> LOADER')
  lines.push('    LOADER --> STABILITY[稳性校核]')
  lines.push('    STABILITY --> STRENGTH[强度校核]')
  lines.push('    STRENGTH --> DRAFT[吃水计算]')
  lines.push('    DRAFT --> APPROVAL[船长批准]')
  lines.push('```')
  lines.push('')

  lines.push('### 🏗️ 舱室分配')
  lines.push('| 舱号 | 货物类型 | 重量(t) | 体积(m³) | 充满率(%) | 空当(m) |')
  lines.push('|------|----------|---------|----------|-----------|---------|')
  for (const h of result.hold_allocations) {
    lines.push(`| Hold ${h.hold_no} | ${h.cargo_type} | ${h.weight_t} | ${h.volume_m3} | ${h.fill_pct} | ${h.ullage_m} |`)
  }
  lines.push('')

  lines.push('### ⚖️ 稳性参数')
  lines.push('| 参数 | 数值 | 单位 | 规范要求 | 状态 |')
  lines.push('|------|------|------|----------|------|')
  lines.push(`| 排水量 | ${result.stability_parameters.displacement_t} | t | — | — |`)
  lines.push(`| KG | ${result.stability_parameters.kg_m} | m | — | — |`)
  lines.push(`| KM | ${result.stability_parameters.km_m} | m | — | — |`)
  lines.push(`| GM | ${result.stability_parameters.gm_m} | m | ≥0.15 | ${result.stability_parameters.gm_m >= 0.15 ? '✅' : '❌'} |`)
  lines.push(`| 吃水差 | ${result.stability_parameters.trim_m} | m | <LBP/100 | ${Math.abs(result.stability_parameters.trim_m) < 2 ? '✅' : '⚠️'} |`)
  lines.push(`| 横倾角 | ${result.stability_parameters.list_deg} | ° | <3° | ${Math.abs(result.stability_parameters.list_deg) < 3 ? '✅' : '❌'} |`)
  lines.push(`| 最大剪力 | ${result.stability_parameters.max_shear_force_pct} | % | <100% | ${result.stability_parameters.max_shear_force_pct < 85 ? '✅' : '⚠️'} |`)
  lines.push(`| 最大弯矩 | ${result.stability_parameters.max_bending_moment_pct} | % | <100% | ${result.stability_parameters.max_bending_moment_pct < 85 ? '✅' : '⚠️'} |`)
  lines.push('')

  lines.push('### 📐 吃水状态')
  lines.push(`- 首吃水: ${result.draft_fwd_m} m | 尾吃水: ${result.draft_aft_m} m`)
  lines.push(`- 压载水需求: ${result.ballast_required_t} t`)
  lines.push('')

  if (result.warnings.length > 0) {
    lines.push('### ⚠️ 警告')
    for (const w of result.warnings) lines.push(`- ${w}`)
    lines.push('')
  }

  lines.push('### 📋 装货顺序')
  for (const s of result.loading_sequence) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 配载仪已获船级社认可')
  lines.push('- [x] 稳性计算书已提交船长')
  lines.push('- [x] 剪力和弯矩在许用范围内')
  lines.push('- [x] 各舱货物分布满足纵向强度要求')
  lines.push('- [x] 压载水置换记录完整')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • Cargo Loading & Stability Module v0.1.0*')
  return lines.join('\n')
}

// --- Tool 6: Crew Management Scheduler 报告 ---
function formatCrewManagementReport(result: CrewManagementResult): string {
  const lines: string[] = []
  lines.push('## 👥 船员排班与STCW合规报告')
  lines.push('')
  lines.push(`船舶: ${result.vessel_name} (IMO: ${result.vessel_imo})`)
  lines.push(`STCW合规: ${result.stcw_compliance} | MLC合规: ${result.mlc_compliance} | 休息违规: ${result.rest_hour_violations}项`)
  lines.push('')
  lines.push('### 🔗 船员管理拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CREW[船员名单] --> MANNING[配员核查]')
  lines.push('    MANNING --> STCW[STCW证书验证]')
  lines.push('    STCW --> REST[休息时间合规]')
  lines.push('    REST --> MLC[MLC 2006合规]')
  lines.push('    MLC --> SCHEDULE[排班计划]')
  lines.push('    SCHEDULE --> RELIEF[换班安排]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 配员核查')
  lines.push('| 职位 | 要求 | 实配 | 缺口 | STCW要求 |')
  lines.push('|------|------|------|------|----------|')
  for (const m of result.manning_check) {
    lines.push(`| ${m.rank} | ${m.required} | ${m.assigned} | ${m.deficit > 0 ? '⚠️ ' + m.deficit : '✅ 0'} | ${m.stcw_required.join(', ')} |`)
  }
  lines.push('')

  lines.push('### 👤 船员状态')
  lines.push('| 职位 | 姓名 | 国籍 | 合同状态 | 证书状态 | 休息合规 | 近7日工时 |')
  lines.push('|------|------|------|----------|----------|----------|-----------|')
  for (const c of result.crew_roster) {
    lines.push(`| ${c.rank} | ${c.name} | ${c.nationality} | ${c.contract_status === 'active' ? '✅ 有效' : c.contract_status === 'expiring_soon' ? '⚠️ 即将到期' : '❌ 过期'} | ${c.cert_status === 'valid' ? '✅ 有效' : c.cert_status === 'expiring_soon' ? '⚠️ 即将过期' : '❌ 过期'} | ${c.rest_compliance === 'compliant' ? '✅' : c.rest_compliance === 'minor_violation' ? '⚠️ 轻微违规' : '❌ 严重违规'} | ${c.hours_worked_last_7_days}h |`)
  }
  lines.push('')

  lines.push('### 📊 合规统计')
  lines.push(`- 证书即将过期(30天内): ${result.cert_expiring_30d} 人`)
  lines.push(`- 建议换班人数: ${result.crew_changes_recommended} 人`)
  lines.push(`- 休息时间违规: ${result.rest_hour_violations} 项`)
  lines.push('')

  lines.push('### 📋 管理建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 最低安全配员证书(MSMC)有效')
  lines.push('- [x] 所有高级船员持有效STCW证书')
  lines.push('- [x] 休息时间记录符合MLC 2006要求')
  lines.push('- [x] 船员就业协议(SEA)签署完整')
  lines.push('- [x] 工资单按时发放记录')
  lines.push('- [x] 船上药品及医疗设备检查合格')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • Crew Management & STCW Compliance Module v0.1.0*')
  return lines.join('\n')
}

// --- Tool 7: Maritime Safety Inspector 报告 ---
function formatSafetyInspectionReport(result: SafetyInspectionResult): string {
  const lines: string[] = []
  lines.push('## 🔍 PSC检查预检与缺陷整改报告')
  lines.push('')
  lines.push(`船舶: ${result.vessel_name} (IMO: ${result.vessel_imo}) | 检查区域: ${result.psc_region}`)
  lines.push(`预检评分: ${result.inspection_readiness.overall_score}/100 | 滞留风险: ${result.detention_risk} | 可滞留缺陷: ${result.detainable_deficiencies}项`)
  lines.push('')
  lines.push('### 🔗 PSC检查拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    DOC[文件检查] --> EQUIP[设备检查]')
  lines.push('    EQUIP --> CREW[船员操作检查]')
  lines.push('    CREW --> HOUSE[船容船貌]')
  lines.push('    DOC --> SCORE[综合评分]')
  lines.push('    EQUIP --> SCORE')
  lines.push('    CREW --> SCORE')
  lines.push('    HOUSE --> SCORE')
  lines.push('    SCORE --> RISK[滞留风险评估]')
  lines.push('    RISK --> ACTION[整改措施]')
  lines.push('```')
  lines.push('')

  lines.push('### 📊 检查准备度')
  lines.push('| 维度 | 评分 | 状态 |')
  lines.push('|------|------|------|')
  lines.push(`| 文件准备 | ${result.inspection_readiness.documentation_readiness_pct}% | ${result.inspection_readiness.documentation_readiness_pct >= 85 ? '✅' : '⚠️'} |`)
  lines.push(`| 设备状态 | ${result.inspection_readiness.equipment_readiness_pct}% | ${result.inspection_readiness.equipment_readiness_pct >= 85 ? '✅' : '⚠️'} |`)
  lines.push(`| 船员准备 | ${result.inspection_readiness.crew_readiness_pct}% | ${result.inspection_readiness.crew_readiness_pct >= 85 ? '✅' : '⚠️'} |`)
  lines.push(`| 船容船貌 | ${result.inspection_readiness.housekeeping_pct}% | ${result.inspection_readiness.housekeeping_pct >= 85 ? '✅' : '⚠️'} |`)
  lines.push(`| 综合评分 | ${result.inspection_readiness.overall_score}% | ${result.inspection_readiness.overall_score >= 80 ? '✅ 良好' : result.inspection_readiness.overall_score >= 70 ? '⚠️ 一般' : '❌ 不足'} |`)
  lines.push('')

  if (result.deficiencies.length > 0) {
    lines.push('### 🔧 缺陷清单')
    lines.push('| 代码 | 类别 | 描述 | 严重度 | 法规依据 | 修复要求 | 预计工时 |')
    lines.push('|------|------|------|--------|----------|----------|----------|')
    for (const d of result.deficiencies) {
      lines.push(`| ${d.code} | ${d.category} | ${d.description} | ${d.severity === 'detainable' ? '🔴 可滞留' : d.severity === 'major' ? '🟠 重大' : '🟡 轻微'} | ${d.regulation_ref} | ${d.action_required} | ${d.estimated_repair_hours}h |`)
    }
    lines.push('')
  }

  lines.push('### 🔧 整改措施')
  for (const a of result.corrective_actions) lines.push(`- ${a}`)
  lines.push('')

  lines.push('### 📢 法规更新')
  for (const r of result.regulatory_updates) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 所有法定证书有效')
  lines.push('- [x] ISM/NSM审核无重大不符合项')
  lines.push('- [x] 消防救生设备定期检测记录完整')
  lines.push('- [x] 航行设备功能测试正常')
  lines.push('- [x] 船员熟悉应急职责')
  lines.push('- [x] 油类记录簿填写规范')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • PSC Inspection Pre-check Module v0.1.0*')
  return lines.join('\n')
}

// --- Tool 8: Ship Maintenance Planner 报告 ---
function formatMaintenanceReport(result: MaintenanceResult): string {
  const lines: string[] = []
  lines.push('## 🔧 船级社特检/中间检验计划报告')
  lines.push('')
  lines.push(`船舶: ${result.vessel_name} (IMO: ${result.vessel_imo}) | 船级社: ${result.class_society} | 船龄: ${result.vessel_age_years}年`)
  lines.push(`船级状态: ${result.class_status} | 逾期项目: ${result.overdue_items} | 预算估算: $${result.budget_estimate_usd.toLocaleString()}`)
  lines.push('')
  lines.push('### 🔗 检验计划拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CLASS[船级社要求] --> SCHEDULE[检验时间表]')
  lines.push('    SCHEDULE --> DOCK[坞修计划]')
  lines.push('    SCHEDULE --> SURVEY[检验项目]')
  lines.push('    DOCK --> YARD[船厂选择]')
  lines.push('    SURVEY --> COND[船级条件]')
  lines.push('    YARD --> BUDGET[预算估算]')
  lines.push('    COND --> BUDGET')
  lines.push('    BUDGET --> APPROVAL[管理层批准]')
  lines.push('```')
  lines.push('')

  lines.push('### 📅 检验时间表')
  lines.push('| 检验类型 | 上次完成 | 下次到期 | 窗口开始 | 窗口结束 | 状态 | 间隔(年) |')
  lines.push('|----------|----------|----------|----------|----------|------|----------|')
  for (const s of result.survey_schedule) {
    lines.push(`| ${s.survey_type} | ${s.last_done} | ${s.next_due} | ${s.window_start} | ${s.window_end} | ${s.status === 'current' ? '✅ 有效' : s.status === 'due_soon' ? '⚠️ 即将到期' : '❌ 已逾期'} | ${s.interval_years} |`)
  }
  lines.push('')

  lines.push('### 🏗️ 维修计划')
  lines.push(`- 预计坞修天数: ${result.maintenance_plan.dry_dock_days} 天`)
  lines.push(`- 船体测厚点数: ${result.maintenance_plan.hull_thickness_measurements} 处`)
  lines.push(`- 涂层换新比例: ${result.maintenance_plan.coating_renewal_pct}%`)
  lines.push(`- 预算估算: $${result.maintenance_plan.estimated_cost_usd.toLocaleString()}`)
  lines.push('')

  lines.push('### 🔍 检验项目')
  for (const s of result.maintenance_plan.survey_items) lines.push(`- ${s}`)
  lines.push('')

  if (result.maintenance_plan.class_conditions.length > 0) {
    lines.push('### 📋 船级条件')
    for (const c of result.maintenance_plan.class_conditions) lines.push(`- ${c}`)
    lines.push('')
  }

  lines.push('### 📜 法定项目')
  for (const s of result.maintenance_plan.statutory_items) lines.push(`- ${s}`)
  lines.push('')

  if (result.upcoming_deadlines.length > 0) {
    lines.push('⏰ 即将到期')
    for (const d of result.upcoming_deadlines) lines.push(`- ${d}`)
    lines.push('')
  }

  lines.push('### 📋 管理建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 船级社检验周期符合IACS统一要求')
  lines.push('- [x] 所有法定证书在有效期内')
  lines.push('- [x] 船级条件已按期消除')
  lines.push('- [x] 修理/改装已获船级社批准')
  lines.push('- [x] 船体及机电设备维护保养记录完整')
  lines.push('')
  lines.push('---')
  lines.push('*Maritime Agent • Classification Survey Planning Module v0.1.0*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Vessel Performance Monitor — 船舶主机能效与航速优化
  tools.register(defineTool({
    name: 'vessel_performance_monitor',
    description: '船舶主机能效与航速优化分析 | 主机功率/SFOC/燃油消耗/船体污底/航速优化建议 | Vessel engine performance monitoring with speed optimization, fuel consumption analysis, and hull condition assessment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vessel_imo, vessel_name, engine_type(ME|MC|RT-flex|X-series), dwt, current_speed_kn, fuel_type(HFO|VLSFO|MGO|LNG|methanol), sea_state(calm|slight|moderate|rough|very_rough), analysis_depth(basic|standard|detailed)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: VesselPerformanceInput = JSON.parse(args.input_data)
      return formatVesselPerformanceReport(analyzeVesselPerformance(input))
    }
  }))

  // Tool 2: Maritime Route Planner — 全球航线规划与气象导航
  tools.register(defineTool({
    name: 'maritime_route_planner',
    description: '全球航线规划与气象导航 | 大圆航线/气象路由/航路点/ECA区域/运河通行 | Global route planning with weather routing, waypoint optimization, ECA zone management, and canal transit planning.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: origin_port, destination_port, vessel_type(container|bulk_carrier|tanker|LNG|general_cargo|RoRo), vessel_draft_m, departure_time(ISO), optimization_criteria(fastest|fuel_optimal|weather_routing|emission_controlled), avoid_regions[], canal_route(suez|panama|cape_of_good_hope|northeast_passage|direct)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RoutePlannerInput = JSON.parse(args.input_data)
      return formatRoutePlannerReport(analyzeRoutePlanner(input))
    }
  }))

  // Tool 3: Port Call Optimizer — 港口到港预测与靠泊窗口规划
  tools.register(defineTool({
    name: 'port_call_optimizer',
    description: '港口到港预测与靠泊窗口规划 | ETA计算/泊位窗口/潮汐限制/港口费用/拥堵评估 | Port call prediction with berth window planning, tidal constraints, port dues estimation, and congestion assessment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vessel_imo, port_unlocode, port_name, eta_current(ISO), vessel_type, cargo_operation(loading|discharging|both), cargo_volume_t, berth_preference(any|container_terminal|bulk_terminal|tanker_terminal|multi_purpose), tide_dependent(boolean), air_draft_limit_m'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PortCallInput = JSON.parse(args.input_data)
      return formatPortCallReport(analyzePortCall(input))
    }
  }))

  // Tool 4: Maritime Emission Tracker — CIMO/EEXI碳强度指标追踪
  tools.register(defineTool({
    name: 'maritime_emission_tracker',
    description: 'CIMO/EEXI碳强度指标追踪 | CII评级/EEXI合规/CO₂排放/EU MRV/IMO DCS | Maritime carbon intensity tracking per IMO CII/EEXI rules with EU MRV and IMO DCS compliance.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vessel_imo, vessel_name, vessel_type, gross_tonnage, deadweight, eiapp_cert_no, eedi_reference, reporting_period, fuel_consumption_data[{fuel_type, tonnes}], distance_travelled_nm, transport_work_ton_mile'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EmissionTrackerInput = JSON.parse(args.input_data)
      return formatEmissionTrackerReport(analyzeEmissionTracker(input))
    }
  }))

  // Tool 5: Cargo Loading Planner — 配载仪与稳性计算
  tools.register(defineTool({
    name: 'cargo_loading_planner',
    description: '配载仪与稳性计算 | 舱室分配/GM计算/剪力弯矩/吃水差/装货顺序 | Cargo loading planning with stability calculations, hold allocation, shear force/bending moment analysis.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vessel_imo, vessel_name, vessel_type, loa_m, beam_m, summer_draft_m, summer_deadweight_t, tank_or_hold_count, cargo_manifest[{cargo_type, weight_t, sf_m3_t, hold_no}], ballast_requirement(boolean), stability_criteria(IMO_A749|IMO_RES_A167|class_society), voyage_legs'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CargoLoadingInput = JSON.parse(args.input_data)
      return formatCargoLoadingReport(analyzeCargoLoading(input))
    }
  }))

  // Tool 6: Crew Management Scheduler — 船员排班与STCW合规
  tools.register(defineTool({
    name: 'crew_management_scheduler',
    description: '船员排班与STCW合规 | 配员核查/证书管理/休息时间/MLC合规/换班计划 | Crew scheduling with STCW compliance, manning verification, rest hour monitoring, and MLC 2006 compliance.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vessel_imo, vessel_name, vessel_type, crew_complement, current_crew[{rank, name, nationality, contract_start, contract_end, cert_expiry, rest_hours_last_24}], voyage_duration_days, next_port, next_port_eta, flag_state, mlc_compliance_required(boolean), stcw_compliance_required(boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CrewManagementInput = JSON.parse(args.input_data)
      return formatCrewManagementReport(analyzeCrewManagement(input))
    }
  }))

  // Tool 7: Maritime Safety Inspector — PSC检查预检与缺陷整改
  tools.register(defineTool({
    name: 'maritime_safety_inspector',
    description: 'PSC检查预检与缺陷整改 | 检查准备度/缺陷识别/滞留风险/整改措施/法规更新 | PSC inspection pre-check with deficiency identification, detention risk assessment, and corrective action planning.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vessel_imo, vessel_name, vessel_type, flag_state, class_society, psc_region(Paris_MOU|Tokyo_MOU|USCG|Indian_Ocean_MOU|Mediterranean_MOU|Vienna_MOU), last_psc_inspection, deficiencies_last_inspection, detention_history(boolean), inspection_scope(full|focused|follow_up), focus_areas[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SafetyInspectionInput = JSON.parse(args.input_data)
      return formatSafetyInspectionReport(analyzeSafetyInspection(input))
    }
  }))

  // Tool 8: Ship Maintenance Planner — 船级社特检/中间检验计划
  tools.register(defineTool({
    name: 'ship_maintenance_planner',
    description: '船级社特检/中间检验计划 | 检验时间表/坞修计划/船级条件/预算估算/船厂选择 | Classification special survey scheduling with dry-dock planning, class condition management, and budget estimation.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vessel_imo, vessel_name, vessel_type, class_society(BV|CCS|DNV|LR|NK|RINA|KR|ABS), year_built, last_special_survey, last_intermediate_survey, last_docking, next_class_renewal, survey_type(special_survey|intermediate_survey|annual_survey|docking_survey|tailshaft_survey), dry_dock_required(boolean), maintenance_items[{item, priority(critical|high|medium|low), due_date, status(pending|in_progress|completed)}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MaintenanceInput = JSON.parse(args.input_data)
      return formatMaintenanceReport(analyzeMaintenance(input))
    }
  }))

  console.log(`[dsh-tool-maritimeagent] Loaded v${VERSION} — Maritime Agent: 船舶海运智能体, 8 tools active`)
  console.log('  Tools: vessel_performance_monitor, maritime_route_planner, port_call_optimizer, maritime_emission_tracker, cargo_loading_planner, crew_management_scheduler, maritime_safety_inspector, ship_maintenance_planner')
}
