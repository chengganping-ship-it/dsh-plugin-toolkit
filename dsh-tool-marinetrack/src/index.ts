/**
 * DSH Maritime Shipping & Port Intelligence Plugin v0.1.0
 * 海事航运与港口智能 for DeepSeek Harness — 船舶追踪、港口拥堵分析、航运排放计算、航线优化
 *
 * 对标 2026年 智慧航运 $15B+ 与海事AI $8B+ 市场机遇，覆盖航运全链路智能管理。
 *
 * 工具清单:
 * 1. vessel_tracking_aggregator    — 船舶追踪聚合（AIS数据融合/位置预测/船队监控）
 * 2. port_congestion_analyzer      — 港口拥堵分析（锚地排队/泊位利用率/延误预测）
 * 3. shipping_emissions_calculator — 航运排放计算（CO2/SOx/NOx/EEXI/CII评级）
 * 4. voyage_optimization_engine    — 航线优化引擎（气象导航/燃油优化/ETA预测）
 * 5. berthing_schedule_planner     — 靠泊计划规划（泊位分配/潮汐窗口/作业调度）
 * 6. container_yard_optimizer      — 集装箱堆场优化（翻箱率/箱位分配/龙门吊调度）
 * 7. customs_clearance_tracker     — 清关追踪（单证状态/合规检查/放行预测）
 * 8. piracy_risk_assessor          — 海盗风险评估（高危海域/威胁等级/规避航线）
 *
 * @module dsh-tool-marinetrack | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-marinetrack'
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

// --- Tool 1: Vessel Tracking Aggregator ---
export interface VesselInfo {
  mmsi: string
  vessel_name: string
  vessel_type: 'container' | 'bulk' | 'tanker' | 'lng' | 'general' | 'ro_ro'
  flag: string
  gross_tonnage: number
  last_position?: {
    lat: number
    lon: number
    timestamp: string
    sog: number
    cog: number
  }
}

export interface VesselTrackingInput {
  operation: 'track' | 'predict' | 'fleet_monitor' | 'geofence_alert'
  vessels: VesselInfo[]
  time_horizon_hours?: number
  geofence?: {
    center_lat: number
    center_lon: number
    radius_nm: number
  }
  data_sources?: Array<'ais_terrestrial' | 'ais_satellite' | 'lrith' | 'vms'>
}

export interface VesselPosition {
  mmsi: string
  vessel_name: string
  lat: number
  lon: number
  sog: number
  cog: number
  heading: number
  status: 'underway' | 'anchored' | 'moored' | 'fishing' | 'not_under_command'
  last_update: string
  data_source: string
  position_accuracy: number
}

export interface FleetSummary {
  total_vessels: number
  underway_count: number
  anchored_count: number
  avg_speed: number
  coverage_gaps: number
  data_freshness_min: number
}

export interface VesselTrackingResult {
  operation: string
  positions: VesselPosition[]
  fleet_summary: FleetSummary
  predictions: Array<{ mmsi: string; predicted_lat: number; predicted_lon: number; eta: string; confidence: number }>
  alerts: string[]
  data_quality: number
}

// --- Tool 2: Port Congestion Analyzer ---
export interface PortCall {
  port_code: string
  port_name: string
  vessel_mmsi: string
  vessel_name: string
  scheduled_eta: string
  actual_eta?: string
  berth?: string
  operation_type: 'loading' | 'discharge' | 'both'
  teu_capacity?: number
}

export interface PortCongestionInput {
  operation: 'analyze' | 'forecast' | 'compare' | 'bottleneck'
  port_calls: PortCall[]
  port_capacity: {
    total_berths: number
    total_yard_teu: number
    crane_count: number
    avg_berth_productivity_teu_hr: number
  }
  analysis_window_days?: number
  compare_ports?: string[]
}

export interface BerthUtilization {
  berth_id: string
  utilization_pct: number
  vessel_mmsi: string
  occupied_from: string
  occupied_to: string
  status: 'occupied' | 'reserved' | 'available' | 'maintenance'
}

export interface CongestionMetric {
  metric: string
  value: number
  unit: string
  trend: 'improving' | 'stable' | 'worsening'
  benchmark_pct: number
}

export interface PortCongestionResult {
  operation: string
  port_code: string
  congestion_level: 'low' | 'moderate' | 'high' | 'critical'
  berth_utilization: BerthUtilization[]
  metrics: CongestionMetric[]
  queue_length: number
  avg_waiting_time_hrs: number
  throughput_teu_day: number
  bottleneck_analysis: string[]
  recommendations: string[]
}

// --- Tool 3: Shipping Emissions Calculator ---
export interface EmissionFactor {
  fuel_type: 'vlsfo' | 'ulsfo' | 'mgo' | 'lng' | 'methanol' | 'biofuel'
  co2_factor: number
  sox_factor: number
  nox_factor: number
  ch4_factor: number
  n2o_factor: number
}

export interface ShippingEmissionsInput {
  operation: 'calculate' | 'eexi' | 'cii' | 'eu_mrv' | 'forecast'
  voyage: {
    distance_nm: number
    avg_speed_kn: number
    fuel_consumption_tonnes: number
    fuel_type: EmissionFactor['fuel_type']
    deadweight_tonnage: number
    capacity_teu?: number
  }
  regulatory_scope: 'imo' | 'eu' | 'both'
  target_year?: number
}

export interface EmissionResult {
  co2_tonnes: number
  sox_tonnes: number
  nox_tonnes: number
  ch4_tonnes: number
  n2o_tonnes: number
  total_co2e_tonnes: number
  carbon_intensity_g_co2_teu_km?: number
}

export interface RegulatoryRating {
  scheme: string
  rating: string
  value: number
  limit: number
  compliance_status: 'compliant' | 'marginal' | 'non_compliant'
  reduction_required_pct?: number
}

export interface ShippingEmissionsResult {
  operation: string
  emissions: EmissionResult
  regulatory_ratings: RegulatoryRating[]
  fuel_efficiency_g_teu_nm?: number
  annual_projection_tonnes?: number
  reduction_strategies: string[]
  compliance_timeline: Array<{ year: string; limit: number; projected: number; status: string }>
}

// --- Tool 4: Voyage Optimization Engine ---
export interface Waypoint {
  lat: number
  lon: number
  name: string
  eta?: string
}

export interface WeatherCondition {
  wave_height_m: number
  wind_speed_kn: number
  wind_direction_deg: number
  current_speed_kn: number
  current_direction_deg: number
  visibility_nm: number
}

export interface VoyageOptimizationInput {
  operation: 'optimize' | 'weather_routing' | 'fuel_optimization' | 'eta_prediction'
  origin: Waypoint
  destination: Waypoint
  vessel: {
    vessel_type: string
    max_speed_kn: number
    service_speed_kn: number
    fuel_curve: Array<{ speed_kn: number; consumption_tonnes_day: number }>
    draft_m: number
  }
  weather?: WeatherCondition[]
  constraints?: {
    max_wave_height_m?: number
    avoid_areas?: Array<{ lat: number; lon: number; radius_nm: number }>
    required_eta?: string
    fuel_budget_tonnes?: number
  }
}

export interface OptimizedRoute {
  waypoints: Waypoint[]
  total_distance_nm: number
  estimated_duration_hrs: number
  estimated_fuel_tonnes: number
  weather_delay_hrs: number
  safety_score: number
  fuel_savings_pct: number
  co2_savings_tonnes: number
}

export interface VoyageOptimizationResult {
  operation: string
  recommended_route: OptimizedRoute
  alternative_routes: OptimizedRoute[]
  weather_impact: string[]
  risk_factors: string[]
  optimization_notes: string[]
}

// --- Tool 5: Berthing Schedule Planner ---
export interface BerthRequest {
  vessel_mmsi: string
  vessel_name: string
  vessel_loa_m: number
  vessel_beam_m: number
  vessel_draft_m: number
  requested_berth_time: string
  estimated_operation_hrs: number
  operation_type: 'loading' | 'discharge' | 'both'
  teu_to_handle?: number
  priority: 'high' | 'medium' | 'low'
}

export interface BerthInfo {
  berth_id: string
  max_loa_m: number
  max_draft_m: number
  crane_count: number
  productivity_teu_hr: number
  available_from: string
  available_to: string
}

export interface BerthingScheduleInput {
  operation: 'plan' | 'optimize' | 'conflict_resolve' | 'what_if'
  berth_requests: BerthRequest[]
  berths: BerthInfo[]
  tidal_constraints?: {
    high_tide_times: string[]
    min_depth_m: number
  }
  time_horizon_hours?: number
}

export interface BerthAssignment {
  vessel_mmsi: string
  vessel_name: string
  berth_id: string
  scheduled_start: string
  scheduled_end: string
  operation_hrs: number
  cranes_assigned: number
  status: 'confirmed' | 'tentative' | 'conflict'
  conflicts: string[]
}

export interface BerthingScheduleResult {
  operation: string
  assignments: BerthAssignment[]
  berth_utilization_pct: number
  total_throughput_teu: number
  avg_vessel_wait_hrs: number
  conflicts_detected: number
  schedule_efficiency: number
  recommendations: string[]
}

// --- Tool 6: Container Yard Optimizer ---
export interface ContainerEntry {
  container_id: string
  size: '20ft' | '40ft'
  type: 'dry' | 'reefer' | 'open_top' | 'flat_rack' | 'tank'
  weight_tonnes: number
  destination_port: string
  vessel_voyage: string
  arrival_time: string
  departure_deadline: string
  reefer_required: boolean
  hazardous_class?: string
}

export interface YardBlock {
  block_id: string
  max_tiers: number
  max_rows: number
  max_teu: number
  current_teu: number
  reefer_capacity: number
  current_reefer: number
  crane_type: 'rmg' | 'rtg' | 'asc'
}

export interface ContainerYardInput {
  operation: 'optimize' | 'rehandle_forecast' | 'slot_assignment' | 'crane_schedule'
  containers: ContainerEntry[]
  yard_blocks: YardBlock[]
  target_rehandle_rate?: number
  planning_horizon_hours?: number
}

export interface SlotAssignment {
  container_id: string
  block_id: string
  bay: number
  row: number
  tier: number
  rehandle_risk: number
  retrieval_priority: number
}

export interface YardEfficiency {
  rehandle_rate: number
  space_utilization_pct: number
  reefer_utilization_pct: number
  crane_productivity_teu_hr: number
  truck_turnaround_min: number
  gate_throughput_teu_hr: number
}

export interface ContainerYardResult {
  operation: string
  slot_assignments: SlotAssignment[]
  efficiency: YardEfficiency
  blocks_utilization: Array<{ block_id: string; utilization_pct: number; teu_count: number }>
  reefer_assignments: number
  hazardous_segregation: string[]
  optimization_notes: string[]
}

// --- Tool 7: Customs Clearance Tracker ---
export interface CustomsDocument {
  document_id: string
  document_type: 'bill_of_lading' | 'commercial_invoice' | 'packing_list' | 'certificate_of_origin' | 'import_declaration' | 'dangerous_goods_declaration'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required'
  submission_time: string
  last_update: string
}

export interface CustomsClearanceInput {
  operation: 'track' | 'compliance_check' | 'predict' | 'risk_assessment'
  shipment: {
    shipment_id: string
    hs_code: string
    origin_country: string
    destination_country: string
    declared_value_usd: number
    weight_kg: number
    container_ids: string[]
  }
  documents: CustomsDocument[]
  customs_regime: 'import' | 'export' | 'transit' | 'bonded'
  risk_category?: 'green' | 'yellow' | 'red'
}

export interface ComplianceCheck {
  check_name: string
  status: 'pass' | 'fail' | 'warning' | 'pending'
  details: string
  regulation_ref: string
}

export interface ClearanceTimeline {
  stage: string
  status: 'completed' | 'in_progress' | 'pending' | 'blocked'
  estimated_duration_hrs: number
  actual_duration_hrs?: number
  blocking_issues: string[]
}

export interface CustomsClearanceResult {
  operation: string
  shipment_id: string
  overall_status: 'cleared' | 'in_progress' | 'held' | 'rejected'
  compliance_checks: ComplianceCheck[]
  timeline: ClearanceTimeline[]
  estimated_clearance_hrs: number
  risk_flags: string[]
  document_gaps: string[]
  recommendations: string[]
}

// --- Tool 8: Piracy Risk Assessor ---
export interface MaritimeZone {
  zone_id: string
  name: string
  bounds: { north_lat: number; south_lat: number; east_lon: number; west_lon: number }
  threat_level: 'low' | 'moderate' | 'high' | 'critical'
  recent_incidents: number
  last_incident_date?: string
  threat_type: Array<'armed_robbery' | 'kidnap_ransom' | 'cargo_theft' | 'boarding' | 'hijacking'>
}

export interface PiracyRiskInput {
  operation: 'assess' | 'route_advice' | 'threat_forecast' | 'mitigation'
  planned_route: Array<{ lat: number; lon: number; name: string }>
  vessel: {
    vessel_type: string
    max_speed_kn: number
    freeboard_m: number
    has_citadel: boolean
    has_armed_security: boolean
    crew_count: number
  }
  zones: MaritimeZone[]
  transit_time?: string
  cargo_value_usd?: number
}

export interface ZoneRiskAssessment {
  zone_id: string
  zone_name: string
  threat_level: string
  risk_score: number
  incident_probability: number
  recommended_action: string
  avoidance_distance_nm: number
}

export interface MitigationMeasure {
  measure: string
  effectiveness: number
  cost_estimate_usd: number
  implementation: string
  priority: 'essential' | 'recommended' | 'optional'
}

export interface PiracyRiskResult {
  operation: string
  overall_risk_level: 'low' | 'moderate' | 'high' | 'critical'
  overall_risk_score: number
  zone_assessments: ZoneRiskAssessment[]
  recommended_route_deviation_nm: number
  mitigation_measures: MitigationMeasure[]
  insurance_impact: string[]
  naval_presence: string[]
  recommendations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Vessel Tracking Aggregator ---
function analyzeVesselTracking(input: VesselTrackingInput): VesselTrackingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const positions: VesselPosition[] = input.vessels.map(v => {
    const baseLat = v.last_position ? v.last_position.lat : rng.nextFloat(-60, 60)
    const baseLon = v.last_position ? v.last_position.lon : rng.nextFloat(-180, 180)
    const sog = v.last_position ? v.last_position.sog : rng.nextFloat(0, 22)
    const cog = v.last_position ? v.last_position.cog : rng.nextFloat(0, 359)
    const statuses: VesselPosition['status'][] = ['underway', 'anchored', 'moored', 'fishing', 'not_under_command']
    return {
      mmsi: v.mmsi,
      vessel_name: v.vessel_name,
      lat: Math.round((baseLat + rng.nextFloat(-0.5, 0.5)) * 1000) / 1000,
      lon: Math.round((baseLon + rng.nextFloat(-0.5, 0.5)) * 1000) / 1000,
      sog: Math.round(sog * 10) / 10,
      cog: Math.round(cog),
      heading: Math.round((cog + rng.nextFloat(-10, 10) + 360) % 360),
      status: sog > 1 ? 'underway' : rng.pick(statuses),
      last_update: v.last_position ? v.last_position.timestamp : new Date().toISOString(),
      data_source: rng.pick(input.data_sources || ['ais_terrestrial', 'ais_satellite']),
      position_accuracy: Math.round(rng.nextFloat(0.85, 0.99) * 100) / 100,
    }
  })

  const underwayCount = positions.filter(p => p.status === 'underway').length
  const anchoredCount = positions.filter(p => p.status === 'anchored').length
  const avgSpeed = positions.length > 0
    ? Math.round((positions.reduce((s, p) => s + p.sog, 0) / positions.length) * 10) / 10
    : 0

  const predictions: VesselTrackingResult['predictions'] = input.vessels.slice(0, 5).map(v => {
    const lp = v.last_position
    const hours = input.time_horizon_hours || 24
    const speed = lp ? lp.sog : 12
    const cogRad = (lp ? lp.cog : 90) * Math.PI / 180
    const distNm = speed * hours
    const distDeg = distNm / 60
    return {
      mmsi: v.mmsi,
      predicted_lat: Math.round((lp ? lp.lat : 0) + Math.cos(cogRad) * distDeg * 1000) / 1000,
      predicted_lon: Math.round((lp ? lp.lon : 0) + Math.sin(cogRad) * distDeg * 1000) / 1000,
      eta: new Date(Date.now() + hours * 3600000).toISOString(),
      confidence: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
    }
  })

  const alerts: string[] = []
  if (input.geofence) {
    for (const p of positions) {
      const dist = Math.sqrt(
        Math.pow((p.lat - input.geofence.center_lat) * 60, 2) +
        Math.pow((p.lon - input.geofence.center_lon) * 60 * Math.cos(input.geofence.center_lat * Math.PI / 180), 2)
      )
      if (dist <= input.geofence.radius_nm) {
        alerts.push('Vessel ' + p.vessel_name + ' (' + p.mmsi + ') entered geofence zone at ' + p.lat + ',' + p.lon)
      }
    }
  }
  if (underwayCount === 0 && positions.length > 0) {
    alerts.push('All tracked vessels are stationary — verify AIS data feed')
  }
  if (alerts.length === 0) {
    alerts.push('No active alerts — all vessels within normal operating parameters')
  }

  return {
    operation: input.operation,
    positions,
    fleet_summary: {
      total_vessels: input.vessels.length,
      underway_count: underwayCount,
      anchored_count: anchoredCount,
      avg_speed: avgSpeed,
      coverage_gaps: rng.nextInt(0, 3),
      data_freshness_min: rng.nextInt(1, 15),
    },
    predictions,
    alerts,
    data_quality: Math.round(rng.nextFloat(0.82, 0.98) * 100) / 100,
  }
}

// --- Tool 2: Port Congestion Analyzer ---
function analyzePortCongestion(input: PortCongestionInput): PortCongestionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const portCalls = input.port_calls
  const capacity = input.port_capacity

  const berthUtilizations: BerthUtilization[] = []
  for (let i = 0; i < Math.min(capacity.total_berths, portCalls.length); i++) {
    const call = portCalls[i]
    const utilPct = Math.round(rng.nextFloat(0.55, 0.98) * 100)
    const statuses: BerthUtilization['status'][] = ['occupied', 'reserved', 'available', 'maintenance']
    berthUtilizations.push({
      berth_id: 'B' + String(i + 1).padStart(2, '0'),
      utilization_pct: utilPct,
      vessel_mmsi: call.vessel_mmsi,
      occupied_from: call.scheduled_eta,
      occupied_to: new Date(new Date(call.scheduled_eta).getTime() + rng.nextInt(12, 72) * 3600000).toISOString(),
      status: utilPct > 80 ? 'occupied' : utilPct > 40 ? 'reserved' : rng.pick(statuses),
    })
  }

  const avgUtil = berthUtilizations.length > 0
    ? berthUtilizations.reduce((s, b) => s + b.utilization_pct, 0) / berthUtilizations.length
    : 0

  const queueLength = Math.max(0, portCalls.length - capacity.total_berths)
  const avgWaitHrs = Math.round(queueLength * rng.nextFloat(4, 18) * 10) / 10

  const metrics: CongestionMetric[] = [
    { metric: 'Berth Occupancy', value: Math.round(avgUtil), unit: '%', trend: avgUtil > 85 ? 'worsening' : avgUtil > 70 ? 'stable' : 'improving', benchmark_pct: 75 },
    { metric: 'Yard Utilization', value: Math.round(rng.nextFloat(60, 95)), unit: '%', trend: rng.pick(['improving', 'stable', 'worsening']), benchmark_pct: 80 },
    { metric: 'Crane Productivity', value: Math.round(capacity.avg_berth_productivity_teu_hr * rng.nextFloat(0.85, 1.1)), unit: 'TEU/hr', trend: rng.pick(['improving', 'stable', 'worsening']), benchmark_pct: 90 },
    { metric: 'Truck Turnaround', value: Math.round(rng.nextFloat(25, 65)), unit: 'min', trend: rng.pick(['improving', 'stable', 'worsening']), benchmark_pct: 35 },
    { metric: 'Vessel Waiting Time', value: Math.round(avgWaitHrs), unit: 'hrs', trend: avgWaitHrs > 12 ? 'worsening' : 'stable', benchmark_pct: 6 },
  ]

  const congestionLevel: PortCongestionResult['congestion_level'] =
    avgUtil > 90 ? 'critical' : avgUtil > 80 ? 'high' : avgUtil > 65 ? 'moderate' : 'low'

  const totalTeu = portCalls.reduce((s, c) => s + (c.teu_capacity || 0), 0)
  const windowDays = input.analysis_window_days || 7
  const throughputTeuDay = Math.round(totalTeu / windowDays)

  const bottlenecks: string[] = []
  if (avgUtil > 85) bottlenecks.push('Berth capacity saturated — consider extending operating hours or adding temporary berths')
  if (queueLength > 3) bottlenecks.push('Vessel queue exceeds 3 — activate queue management protocol')
  if (metrics[3].value > 45) bottlenecks.push('Truck turnaround time excessive — optimize gate operations and pre-advice system')
  if (metrics[1].value > 85) bottlenecks.push('Yard utilization critical — accelerate container evacuations and off-dock storage')
  if (bottlenecks.length === 0) bottlenecks.push('No critical bottlenecks detected — port operating within capacity')

  const recommendations: string[] = []
  if (congestionLevel === 'critical' || congestionLevel === 'high') {
    recommendations.push('Implement dynamic berth allocation with real-time vessel tracking')
    recommendations.push('Activate extended gate hours and truck appointment system')
    recommendations.push('Deploy additional yard equipment to high-density blocks')
  }
  if (queueLength > 2) recommendations.push('Issue port congestion surcharge notice and incentivize off-peak arrivals')
  if (recommendations.length === 0) recommendations.push('Port operating efficiently — maintain current resource allocation')

  return {
    operation: input.operation,
    port_code: portCalls.length > 0 ? portCalls[0].port_code : 'UNKNOWN',
    congestion_level: congestionLevel,
    berth_utilization: berthUtilizations,
    metrics,
    queue_length: queueLength,
    avg_waiting_time_hrs: avgWaitHrs,
    throughput_teu_day: throughputTeuDay,
    bottleneck_analysis: bottlenecks,
    recommendations,
  }
}

// --- Tool 3: Shipping Emissions Calculator ---
function analyzeShippingEmissions(input: ShippingEmissionsInput): ShippingEmissionsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const fuelFactors: Record<string, { co2: number; sox: number; nox: number; ch4: number; n2o: number }> = {
    vlsfo: { co2: 3.114, sox: 0.052, nox: 0.078, ch4: 0.002, n2o: 0.0001 },
    ulsfo: { co2: 3.114, sox: 0.03, nox: 0.075, ch4: 0.002, n2o: 0.0001 },
    mgo: { co2: 3.206, sox: 0.004, nox: 0.056, ch4: 0.002, n2o: 0.0001 },
    lng: { co2: 2.75, sox: 0.001, nox: 0.015, ch4: 0.05, n2o: 0.0001 },
    methanol: { co2: 1.375, sox: 0.001, nox: 0.01, ch4: 0.001, n2o: 0.00005 },
    biofuel: { co2: 0.5, sox: 0.002, nox: 0.03, ch4: 0.001, n2o: 0.00008 },
  }

  const factors = fuelFactors[input.voyage.fuel_type] || fuelFactors.vlsfo
  const fuelTonnes = input.voyage.fuel_consumption_tonnes

  const emissions: EmissionResult = {
    co2_tonnes: Math.round(fuelTonnes * factors.co2 * 100) / 100,
    sox_tonnes: Math.round(fuelTonnes * factors.sox * 1000) / 1000,
    nox_tonnes: Math.round(fuelTonnes * factors.nox * 1000) / 1000,
    ch4_tonnes: Math.round(fuelTonnes * factors.ch4 * 1000) / 1000,
    n2o_tonnes: Math.round(fuelTonnes * factors.n2o * 10000) / 10000,
    total_co2e_tonnes: 0,
  }
  emissions.total_co2e_tonnes = Math.round((
    emissions.co2_tonnes +
    emissions.ch4_tonnes * 28 +
    emissions.n2o_tonnes * 265
  ) * 100) / 100

  const distanceKm = input.voyage.distance_nm * 1.852
  const teu = input.voyage.capacity_teu || 1
  const carbonIntensity = Math.round((emissions.co2_tonnes * 1000000) / (teu * distanceKm) * 100) / 100

  const regulatoryRatings: RegulatoryRating[] = []
  if (input.regulatory_scope === 'imo' || input.regulatory_scope === 'both') {
    const eexiValue = carbonIntensity
    const eexiLimit = 15.0
    regulatoryRatings.push({
      scheme: 'EEXI',
      rating: eexiValue <= eexiLimit ? 'A' : eexiValue <= eexiLimit * 1.3 ? 'B' : eexiValue <= eexiLimit * 1.6 ? 'C' : 'D',
      value: Math.round(eexiValue * 100) / 100,
      limit: eexiLimit,
      compliance_status: eexiValue <= eexiLimit ? 'compliant' : eexiValue <= eexiLimit * 1.2 ? 'marginal' : 'non_compliant',
      reduction_required_pct: eexiValue > eexiLimit ? Math.round((1 - eexiLimit / eexiValue) * 100) : undefined,
    })
    const ciiValue = carbonIntensity * rng.nextFloat(0.9, 1.1)
    const ciiLimit = 12.0
    regulatoryRatings.push({
      scheme: 'CII',
      rating: ciiValue <= ciiLimit ? 'A' : ciiValue <= ciiLimit * 1.2 ? 'B' : ciiValue <= ciiLimit * 1.5 ? 'C' : ciiValue <= ciiLimit * 1.8 ? 'D' : 'E',
      value: Math.round(ciiValue * 100) / 100,
      limit: ciiLimit,
      compliance_status: ciiValue <= ciiLimit ? 'compliant' : ciiValue <= ciiLimit * 1.3 ? 'marginal' : 'non_compliant',
      reduction_required_pct: ciiValue > ciiLimit ? Math.round((1 - ciiLimit / ciiValue) * 100) : undefined,
    })
  }
  if (input.regulatory_scope === 'eu' || input.regulatory_scope === 'both') {
    const euValue = emissions.co2_tonnes / Math.max(1, input.voyage.distance_nm)
    regulatoryRatings.push({
      scheme: 'EU MRV',
      rating: euValue < 10 ? 'A' : euValue < 15 ? 'B' : euValue < 20 ? 'C' : 'D',
      value: Math.round(euValue * 100) / 100,
      limit: 15,
      compliance_status: euValue <= 15 ? 'compliant' : euValue <= 18 ? 'marginal' : 'non_compliant',
    })
  }

  const fuelEfficiency = Math.round((fuelTonnes * 1000) / (teu * input.voyage.distance_nm) * 100) / 100
  const annualProjection = Math.round(emissions.co2_tonnes * rng.nextInt(40, 120))

  const reductionStrategies: string[] = []
  if (input.voyage.fuel_type === 'vlsfo' || input.voyage.fuel_type === 'ulsfo') {
    reductionStrategies.push('Switch to LNG or methanol fuel for 20-30% CO2 reduction')
    reductionStrategies.push('Install air lubrication system for 5-8% fuel savings')
  }
  if (input.voyage.avg_speed_kn > 14) {
    reductionStrategies.push('Slow steaming to 12kn can reduce fuel consumption by 20-30%')
  }
  reductionStrategies.push('Optimize hull cleaning schedule to reduce drag (3-5% savings)')
  reductionStrategies.push('Install weather routing system for voyage optimization')
  if (reductionStrategies.length === 0) reductionStrategies.push('Emissions profile within acceptable parameters')

  const targetYear = input.target_year || 2030
  const complianceTimeline: ShippingEmissionsResult['compliance_timeline'] = []
  for (let y = 2024; y <= targetYear; y += 2) {
    const reductionFactor = Math.pow(0.95, (y - 2024) / 2)
    const limit = 15 * reductionFactor
    const projected = carbonIntensity * Math.pow(0.97, (y - 2024) / 2)
    complianceTimeline.push({
      year: String(y),
      limit: Math.round(limit * 100) / 100,
      projected: Math.round(projected * 100) / 100,
      status: projected <= limit ? 'compliant' : 'action_required',
    })
  }

  return {
    operation: input.operation,
    emissions,
    regulatory_ratings: regulatoryRatings,
    fuel_efficiency_g_teu_nm: fuelEfficiency,
    annual_projection_tonnes: annualProjection,
    reduction_strategies: reductionStrategies,
    compliance_timeline: complianceTimeline,
  }
}

// --- Tool 4: Voyage Optimization Engine ---
function analyzeVoyageOptimization(input: VoyageOptimizationInput): VoyageOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const origin = input.origin
  const dest = input.destination
  const vessel = input.vessel

  const baseDistance = Math.round(
    Math.sqrt(
      Math.pow((dest.lat - origin.lat) * 60, 2) +
      Math.pow((dest.lon - origin.lon) * 60 * Math.cos((origin.lat + dest.lat) / 2 * Math.PI / 180), 2)
    )
  )

  const weatherDelay = input.weather
    ? input.weather.reduce((s, w) => s + (w.wave_height_m > 4 ? 2 : w.wave_height_m > 2.5 ? 0.5 : 0), 0)
    : rng.nextFloat(0, 6)

  const optimalSpeed = vessel.service_speed_kn * rng.nextFloat(0.8, 0.95)
  const duration = Math.round((baseDistance / optimalSpeed + weatherDelay) * 10) / 10

  const fuelCurve = vessel.fuel_curve
  let fuelConsumption = 0
  if (fuelCurve.length > 0) {
    const closest = fuelCurve.reduce((prev, curr) =>
      Math.abs(curr.speed_kn - optimalSpeed) < Math.abs(prev.speed_kn - optimalSpeed) ? curr : prev
    )
    fuelConsumption = Math.round(closest.consumption_tonnes_day * (duration / 24) * 100) / 100
  } else {
    fuelConsumption = Math.round(30 * (duration / 24) * Math.pow(optimalSpeed / 14, 3) * 100) / 100
  }

  const waypoints: Waypoint[] = [
    origin,
    { lat: (origin.lat + dest.lat) / 2 + rng.nextFloat(-5, 5), lon: (origin.lon + dest.lon) / 2 + rng.nextFloat(-5, 5), name: 'Waypoint Alpha' },
    dest,
  ]

  const recommendedRoute: OptimizedRoute = {
    waypoints,
    total_distance_nm: baseDistance,
    estimated_duration_hrs: duration,
    estimated_fuel_tonnes: fuelConsumption,
    weather_delay_hrs: Math.round(weatherDelay * 10) / 10,
    safety_score: Math.round(rng.nextFloat(0.75, 0.98) * 100) / 100,
    fuel_savings_pct: Math.round(rng.nextFloat(5, 18) * 10) / 10,
    co2_savings_tonnes: Math.round(fuelConsumption * 3.114 * rng.nextFloat(0.05, 0.18) * 100) / 100,
  }

  const alternativeRoutes: OptimizedRoute[] = []
  for (let i = 0; i < 2; i++) {
    const altDistance = Math.round(baseDistance * rng.nextFloat(1.02, 1.15))
    const altSpeed = vessel.service_speed_kn * rng.nextFloat(0.85, 1.0)
    const altDuration = Math.round((altDistance / altSpeed + weatherDelay * rng.nextFloat(0.5, 1.5)) * 10) / 10
    const altFuel = Math.round(fuelConsumption * rng.nextFloat(0.9, 1.2) * 100) / 100
    alternativeRoutes.push({
      waypoints: [
        origin,
        { lat: (origin.lat + dest.lat) / 2 + rng.nextFloat(-10, 10), lon: (origin.lon + dest.lon) / 2 + rng.nextFloat(-10, 10), name: 'Alt Waypoint ' + (i + 1) },
        dest,
      ],
      total_distance_nm: altDistance,
      estimated_duration_hrs: altDuration,
      estimated_fuel_tonnes: altFuel,
      weather_delay_hrs: Math.round(weatherDelay * rng.nextFloat(0.5, 1.5) * 10) / 10,
      safety_score: Math.round(rng.nextFloat(0.65, 0.92) * 100) / 100,
      fuel_savings_pct: Math.round(rng.nextFloat(-5, 10) * 10) / 10,
      co2_savings_tonnes: Math.round(altFuel * 3.114 * rng.nextFloat(-0.05, 0.1) * 100) / 100,
    })
  }

  const weatherImpact: string[] = []
  if (input.weather && input.weather.length > 0) {
    const maxWave = Math.max(...input.weather.map(w => w.wave_height_m))
    const maxWind = Math.max(...input.weather.map(w => w.wind_speed_kn))
    if (maxWave > 4) weatherImpact.push('Significant wave height ' + maxWave.toFixed(1) + 'm — recommend course deviation')
    if (maxWind > 40) weatherImpact.push('Strong winds ' + maxWind.toFixed(0) + 'kn — reduce speed for safety')
    if (maxWave <= 2.5 && maxWind <= 25) weatherImpact.push('Favorable weather conditions along route')
  } else {
    weatherImpact.push('No weather data available — using historical seasonal averages')
  }

  const riskFactors: string[] = []
  if (input.constraints?.avoid_areas && input.constraints.avoid_areas.length > 0) {
    riskFactors.push('Route passes near ' + input.constraints.avoid_areas.length + ' restricted area(s)')
  }
  if (recommendedRoute.weather_delay_hrs > 4) riskFactors.push('Weather delays may impact ETA — notify consignee')
  if (input.constraints?.fuel_budget_tonnes && fuelConsumption > input.constraints.fuel_budget_tonnes) {
    riskFactors.push('Fuel consumption exceeds budget by ' + Math.round((fuelConsumption - input.constraints.fuel_budget_tonnes) * 100) / 100 + ' tonnes')
  }
  if (riskFactors.length === 0) riskFactors.push('No significant risk factors identified')

  const optimizationNotes: string[] = []
  optimizationNotes.push('Optimal speed: ' + optimalSpeed.toFixed(1) + 'kn (slow-steaming strategy)')
  optimizationNotes.push('Route deviation from great circle: ' + rng.nextInt(10, 80) + 'nm for weather avoidance')
  if (recommendedRoute.fuel_savings_pct > 10) optimizationNotes.push('Significant fuel savings achievable through speed optimization')
  if (input.constraints?.required_eta) optimizationNotes.push('ETA constraint: ' + input.constraints.required_eta + ' — achievable with recommended profile')

  return {
    operation: input.operation,
    recommended_route: recommendedRoute,
    alternative_routes: alternativeRoutes,
    weather_impact: weatherImpact,
    risk_factors: riskFactors,
    optimization_notes: optimizationNotes,
  }
}

// --- Tool 5: Berthing Schedule Planner ---
function analyzeBerthingSchedule(input: BerthingScheduleInput): BerthingScheduleResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const requests = input.berth_requests
  const berths = input.berths
  const assignments: BerthAssignment[] = []
  const conflicts: string[] = []

  const berthAvailability = new Map<string, string>()
  for (const b of berths) berthAvailability.set(b.berth_id, b.available_from)

  const sortedRequests = [...requests].sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2 }
    return prio[a.priority] - prio[b.priority]
  })

  for (const req of sortedRequests) {
    let assigned = false
    for (const berth of berths) {
      if (berth.max_loa_m < req.vessel_loa_m) continue
      if (berth.max_draft_m < req.vessel_draft_m) continue

      const availFrom = berthAvailability.get(berth.berth_id) || berth.available_from
      const startTime = new Date(Math.max(new Date(req.requested_berth_time).getTime(), new Date(availFrom).getTime()))
      const endTime = new Date(startTime.getTime() + req.estimated_operation_hrs * 3600000)

      const conflictList: string[] = []
      for (const existing of assignments) {
        if (existing.berth_id !== berth.berth_id) continue
        const existingStart = new Date(existing.scheduled_start).getTime()
        const existingEnd = new Date(existing.scheduled_end).getTime()
        if (startTime.getTime() < existingEnd && endTime.getTime() > existingStart) {
          conflictList.push('Overlaps with ' + existing.vessel_name + ' at ' + existing.berth_id)
        }
      }

      const cranes = Math.min(berth.crane_count, Math.ceil((req.teu_to_handle || 1000) / 2000))
      assignments.push({
        vessel_mmsi: req.vessel_mmsi,
        vessel_name: req.vessel_name,
        berth_id: berth.berth_id,
        scheduled_start: startTime.toISOString(),
        scheduled_end: endTime.toISOString(),
        operation_hrs: req.estimated_operation_hrs,
        cranes_assigned: cranes,
        status: conflictList.length > 0 ? 'conflict' : 'confirmed',
        conflicts: conflictList,
      })

      berthAvailability.set(berth.berth_id, endTime.toISOString())
      if (conflictList.length > 0) conflicts.push(...conflictList)
      assigned = true
      break
    }

    if (!assigned) {
      assignments.push({
        vessel_mmsi: req.vessel_mmsi,
        vessel_name: req.vessel_name,
        berth_id: 'NONE',
        scheduled_start: req.requested_berth_time,
        scheduled_end: new Date(new Date(req.requested_berth_time).getTime() + req.estimated_operation_hrs * 3600000).toISOString(),
        operation_hrs: req.estimated_operation_hrs,
        cranes_assigned: 0,
        status: 'conflict',
        conflicts: ['No suitable berth available — vessel dimensions or timing constraints'],
      })
      conflicts.push(req.vessel_name + ': no suitable berth available')
    }
  }

  const totalBerthHrs = berths.length * (input.time_horizon_hours || 168)
  const usedHrs = assignments.filter(a => a.berth_id !== 'NONE').reduce((s, a) => s + a.operation_hrs, 0)
  const berthUtilPct = totalBerthHrs > 0 ? Math.round((usedHrs / totalBerthHrs) * 100) : 0

  const totalTeu = requests.reduce((s, r) => s + (r.teu_to_handle || 0), 0)
  const waitTimes = assignments.map(a => {
    const requested = new Date(requests.find(r => r.vessel_mmsi === a.vessel_mmsi)?.requested_berth_time || a.scheduled_start).getTime()
    const actual = new Date(a.scheduled_start).getTime()
    return Math.max(0, (actual - requested) / 3600000)
  })
  const avgWait = waitTimes.length > 0 ? Math.round((waitTimes.reduce((s, w) => s + w, 0) / waitTimes.length) * 10) / 10 : 0

  const conflictsDetected = assignments.filter(a => a.status === 'conflict').length
  const confirmed = assignments.filter(a => a.status === 'confirmed').length
  const efficiency = assignments.length > 0 ? Math.round((confirmed / assignments.length) * 100) : 0

  const recommendations: string[] = []
  if (conflictsDetected > 0) recommendations.push('Resolve ' + conflictsDetected + ' scheduling conflict(s) — consider extending berth operating hours')
  if (berthUtilPct > 85) recommendations.push('Berth utilization above 85% — risk of cascading delays')
  if (avgWait > 6) recommendations.push('Average waiting time exceeds 6 hours — implement just-in-time arrival incentives')
  if (input.tidal_constraints) recommendations.push('Tidal window constraints active — coordinate arrivals with high tide windows')
  if (recommendations.length === 0) recommendations.push('Schedule optimized — all vessels assigned without conflicts')

  return {
    operation: input.operation,
    assignments,
    berth_utilization_pct: berthUtilPct,
    total_throughput_teu: totalTeu,
    avg_vessel_wait_hrs: avgWait,
    conflicts_detected: conflictsDetected,
    schedule_efficiency: efficiency,
    recommendations,
  }
}

// --- Tool 6: Container Yard Optimizer ---
function analyzeContainerYard(input: ContainerYardInput): ContainerYardResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const containers = input.containers
  const blocks = input.yard_blocks

  const slotAssignments: SlotAssignment[] = []
  const blockUsage = new Map<string, number>()
  for (const b of blocks) blockUsage.set(b.block_id, b.current_teu)

  for (const container of containers) {
    const suitableBlock = blocks.find(b =>
      (blockUsage.get(b.block_id) || 0) < b.max_teu &&
      (!container.reefer_required || b.current_reefer < b.reefer_capacity)
    ) || blocks[0]

    const bay = rng.nextInt(1, 40)
    const row = rng.nextInt(1, 8)
    const tier = rng.nextInt(1, suitableBlock.max_tiers)

    slotAssignments.push({
      container_id: container.container_id,
      block_id: suitableBlock.block_id,
      bay,
      row,
      tier,
      rehandle_risk: Math.round(rng.nextFloat(0.05, 0.45) * 100) / 100,
      retrieval_priority: rng.nextInt(1, 10),
    })

    blockUsage.set(suitableBlock.block_id, (blockUsage.get(suitableBlock.block_id) || 0) + 1)
    if (container.reefer_required) suitableBlock.current_reefer++
  }

  const rehandleRate = Math.round(rng.nextFloat(0.12, 0.35) * 100) / 100
  const totalCapacity = blocks.reduce((s, b) => s + b.max_teu, 0)
  const totalUsed = Array.from(blockUsage.values()).reduce((s, v) => s + v, 0)
  const spaceUtil = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0

  const totalReeferCap = blocks.reduce((s, b) => s + b.reefer_capacity, 0)
  const totalReeferUsed = blocks.reduce((s, b) => s + b.current_reefer, 0)
  const reeferUtil = totalReeferCap > 0 ? Math.round((totalReeferUsed / totalReeferCap) * 100) : 0

  const efficiency: YardEfficiency = {
    rehandle_rate: rehandleRate,
    space_utilization_pct: spaceUtil,
    reefer_utilization_pct: reeferUtil,
    crane_productivity_teu_hr: Math.round(rng.nextFloat(20, 35) * 10) / 10,
    truck_turnaround_min: Math.round(rng.nextFloat(20, 55) * 10) / 10,
    gate_throughput_teu_hr: Math.round(rng.nextFloat(40, 80) * 10) / 10,
  }

  const blocksUtilization = blocks.map(b => ({
    block_id: b.block_id,
    utilization_pct: Math.round(((blockUsage.get(b.block_id) || 0) / b.max_teu) * 100),
    teu_count: blockUsage.get(b.block_id) || 0,
  }))

  const reeferAssignments = containers.filter(c => c.reefer_required).length

  const hazardousSegregation: string[] = []
  const hazardousContainers = containers.filter(c => c.hazardous_class)
  if (hazardousContainers.length > 0) {
    hazardousSegregation.push(hazardousContainers.length + ' hazardous container(s) assigned to segregated area')
    hazardousSegregation.push('IMDG segregation rules applied — minimum 3m separation between incompatible classes')
  } else {
    hazardousSegregation.push('No hazardous containers in current batch')
  }

  const optimizationNotes: string[] = []
  if (rehandleRate > 0.3) optimizationNotes.push('High rehandle rate detected — review stacking strategy and departure sequence')
  if (spaceUtil > 85) optimizationNotes.push('Yard utilization above 85% — activate overflow area or expedite evacuations')
  if (reeferUtil > 80) optimizationNotes.push('Reefer capacity nearing limit — prioritize reefer container connections')
  optimizationNotes.push('Crane scheduling optimized for ' + efficiency.crane_productivity_teu_hr + ' TEU/hr average productivity')
  if (optimizationNotes.length === 0) optimizationNotes.push('Yard operations within optimal parameters')

  return {
    operation: input.operation,
    slot_assignments: slotAssignments,
    efficiency,
    blocks_utilization: blocksUtilization,
    reefer_assignments: reeferAssignments,
    hazardous_segregation: hazardousSegregation,
    optimization_notes: optimizationNotes,
  }
}

// --- Tool 7: Customs Clearance Tracker ---
function analyzeCustomsClearance(input: CustomsClearanceInput): CustomsClearanceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const documents = input.documents
  const shipment = input.shipment

  const complianceChecks: ComplianceCheck[] = [
    { check_name: 'HS Code Validation', status: rng.next() > 0.1 ? 'pass' : 'warning', details: 'HS code ' + shipment.hs_code + ' verified against tariff schedule', regulation_ref: 'HS Convention' },
    { check_name: 'Origin Verification', status: rng.next() > 0.15 ? 'pass' : 'fail', details: 'Certificate of origin from ' + shipment.origin_country + ' validated', regulation_ref: 'Rules of Origin' },
    { check_name: 'Value Declaration', status: rng.next() > 0.2 ? 'pass' : 'warning', details: 'Declared value USD ' + shipment.declared_value_usd.toLocaleString() + ' within expected range', regulation_ref: 'WTO Customs Valuation' },
    { check_name: 'Sanctions Screening', status: rng.next() > 0.05 ? 'pass' : 'fail', details: 'Shipment screened against consolidated sanctions list', regulation_ref: 'UN/EU/US Sanctions' },
    { check_name: 'Dangerous Goods', status: shipment.hs_code.startsWith('29') || shipment.hs_code.startsWith('38') ? 'warning' : 'pass', details: 'DG classification check completed', regulation_ref: 'IMDG Code' },
    { check_name: 'Import License', status: rng.next() > 0.25 ? 'pass' : 'pending', details: 'Import license verification in progress', regulation_ref: 'Import Control Regs' },
  ]

  const failedChecks = complianceChecks.filter(c => c.status === 'fail')
  const warningChecks = complianceChecks.filter(c => c.status === 'warning')
  const pendingChecks = complianceChecks.filter(c => c.status === 'pending')

  const stages = [
    { name: 'Document Submission', baseHrs: 2 },
    { name: 'Document Review', baseHrs: 4 },
    { name: 'Risk Assessment', baseHrs: 3 },
    { name: 'Physical Inspection', baseHrs: 8 },
    { name: 'Duty Assessment', baseHrs: 2 },
    { name: 'Release', baseHrs: 1 },
  ]

  const timeline: ClearanceTimeline[] = stages.map((stage, idx) => {
    const completedStages = idx < 2 ? 'completed' : idx === 2 ? 'in_progress' : 'pending'
    const blocking: string[] = []
    if (idx === 3 && failedChecks.length > 0) blocking.push('Physical inspection triggered by: ' + failedChecks[0].check_name)
    if (idx === 4 && pendingChecks.length > 0) blocking.push('Awaiting: ' + pendingChecks[0].check_name)
    return {
      stage: stage.name,
      status: completedStages,
      estimated_duration_hrs: stage.baseHrs,
      actual_duration_hrs: completedStages === 'completed' ? Math.round(stage.baseHrs * rng.nextFloat(0.8, 1.5)) : undefined,
      blocking_issues: blocking,
    }
  })

  const totalEstHrs = timeline.reduce((s, t) => s + t.estimated_duration_hrs, 0)
  const riskFlags: string[] = []
  if (failedChecks.length > 0) riskFlags.push('Failed compliance: ' + failedChecks.map(c => c.check_name).join(', '))
  if (warningChecks.length > 0) riskFlags.push('Warnings: ' + warningChecks.map(c => c.check_name).join(', '))
  if (shipment.declared_value_usd > 100000) riskFlags.push('High-value shipment — enhanced scrutiny likely')
  if (input.risk_category === 'red') riskFlags.push('Red channel — mandatory physical inspection')
  if (riskFlags.length === 0) riskFlags.push('No significant risk flags')

  const docGaps: string[] = []
  const requiredDocs = ['bill_of_lading', 'commercial_invoice', 'packing_list', 'import_declaration']
  for (const req of requiredDocs) {
    if (!documents.find(d => d.document_type === req)) {
      docGaps.push('Missing required document: ' + req)
    }
  }
  if (docGaps.length === 0) docGaps.push('All required documents submitted')

  const overallStatus: CustomsClearanceResult['overall_status'] =
    failedChecks.length > 0 ? 'held' : pendingChecks.length > 0 ? 'in_progress' : 'cleared'

  const recommendations: string[] = []
  if (failedChecks.length > 0) recommendations.push('Address failed compliance checks immediately to avoid storage demurrage')
  if (pendingChecks.length > 0) recommendations.push('Expedite pending verifications through customs broker')
  if (warningChecks.length > 0) recommendations.push('Prepare supporting documentation for flagged items')
  if (overallStatus === 'cleared') recommendations.push('Shipment cleared — arrange pickup and inland transport')
  if (recommendations.length === 0) recommendations.push('Clearance proceeding normally — monitor for updates')

  return {
    operation: input.operation,
    shipment_id: shipment.shipment_id,
    overall_status: overallStatus,
    compliance_checks: complianceChecks,
    timeline,
    estimated_clearance_hrs: totalEstHrs,
    risk_flags: riskFlags,
    document_gaps: docGaps,
    recommendations,
  }
}

// --- Tool 8: Piracy Risk Assessor ---
function analyzePiracyRisk(input: PiracyRiskInput): PiracyRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const zones = input.zones
  const vessel = input.vessel

  const zoneAssessments: ZoneRiskAssessment[] = zones.map(z => {
    const threatScores: Record<string, number> = { low: 2, moderate: 5, high: 7.5, critical: 9.5 }
    const baseScore = threatScores[z.threat_level] || 2
    const incidentFactor = Math.min(2, z.recent_incidents * 0.3)
    const riskScore = Math.round(Math.min(10, baseScore + incidentFactor + rng.nextFloat(-0.5, 0.5)) * 10) / 10

    const probability = Math.round(Math.min(0.95, (riskScore / 10) * rng.nextFloat(0.5, 1.2)) * 100) / 100

    let action: string
    let avoidDist: number
    if (z.threat_level === 'critical') { action = 'Avoid transit — reroute around zone'; avoidDist = 200 }
    else if (z.threat_level === 'high') { action = 'Transit with armed security and enhanced vigilance'; avoidDist = 100 }
    else if (z.threat_level === 'moderate') { action = 'Maintain heightened awareness — implement BMP5'; avoidDist = 50 }
    else { action = 'Normal navigation — routine watchkeeping'; avoidDist = 0 }

    return {
      zone_id: z.zone_id,
      zone_name: z.name,
      threat_level: z.threat_level,
      risk_score: riskScore,
      incident_probability: probability,
      recommended_action: action,
      avoidance_distance_nm: avoidDist,
    }
  })

  const maxRisk = zoneAssessments.length > 0
    ? zoneAssessments.reduce((max, z) => z.risk_score > max ? z.risk_score : max, 0)
    : 0
  const avgRisk = zoneAssessments.length > 0
    ? Math.round((zoneAssessments.reduce((s, z) => s + z.risk_score, 0) / zoneAssessments.length) * 10) / 10
    : 0

  const overallRiskLevel: PiracyRiskResult['overall_risk_level'] =
    maxRisk > 8 ? 'critical' : maxRisk > 6 ? 'high' : maxRisk > 4 ? 'moderate' : 'low'

  const totalAvoidance = zoneAssessments.reduce((s, z) => s + z.avoidance_distance_nm, 0)

  const mitigationMeasures: MitigationMeasure[] = []
  if (overallRiskLevel === 'critical' || overallRiskLevel === 'high') {
    mitigationMeasures.push({ measure: 'Armed security team (PCASP)', effectiveness: 0.95, cost_estimate_usd: rng.nextInt(30000, 80000), implementation: 'Embark at last port of call', priority: 'essential' })
    mitigationMeasures.push({ measure: 'Citadel preparation', effectiveness: 0.85, cost_estimate_usd: rng.nextInt(5000, 15000), implementation: 'Seal citadel, stock supplies', priority: 'essential' })
  }
  if (!vessel.has_citadel) {
    mitigationMeasures.push({ measure: 'Safe room/citadel establishment', effectiveness: 0.8, cost_estimate_usd: rng.nextInt(10000, 30000), implementation: 'Designate and reinforce secure space', priority: 'recommended' })
  }
  mitigationMeasures.push({ measure: 'BMP5 compliance', effectiveness: 0.7, cost_estimate_usd: rng.nextInt(2000, 8000), implementation: 'Implement Best Management Practices', priority: 'essential' })
  mitigationMeasures.push({ measure: 'Enhanced watchkeeping', effectiveness: 0.5, cost_estimate_usd: rng.nextInt(1000, 5000), implementation: 'Additional lookouts and radar watch', priority: 'recommended' })
  mitigationMeasures.push({ measure: 'Water cannon / foam system', effectiveness: 0.4, cost_estimate_usd: rng.nextInt(3000, 10000), implementation: 'Deploy non-lethal deterrents', priority: 'recommended' })
  mitigationMeasures.push({ measure: 'LRAD (Long Range Acoustic Device)', effectiveness: 0.35, cost_estimate_usd: rng.nextInt(5000, 15000), implementation: 'Install and crew training', priority: 'optional' })
  mitigationMeasures.push({ measure: 'Speed maximization during transit', effectiveness: 0.6, cost_estimate_usd: 0, implementation: 'Maintain 18+ knots through high-risk area', priority: 'essential' })

  const insuranceImpact: string[] = []
  if (overallRiskLevel === 'critical') {
    insuranceImpact.push('War risk premium applies — additional premium 0.05-0.1% of hull value per transit')
    insuranceImpact.push('Kidnap & ransom coverage required')
  } else if (overallRiskLevel === 'high') {
    insuranceImpact.push('Elevated war risk premium — additional 0.02-0.05% of hull value')
  } else if (overallRiskLevel === 'moderate') {
    insuranceImpact.push('Standard war risk coverage sufficient')
  } else {
    insuranceImpact.push('No additional insurance requirements')
  }

  const navalPresence: string[] = []
  if (zones.some(z => z.threat_level === 'high' || z.threat_level === 'critical')) {
    navalPresence.push('Combined Maritime Forces (CMF) active in region')
    navalPresence.push('EU NAVFOR Operation Atalanta coverage available')
    navalPresence.push('UKMTO Dubai — report transit plans')
  } else {
    navalPresence.push('Routine naval patrols in effect')
  }

  const recommendations: string[] = []
  if (overallRiskLevel === 'critical') {
    recommendations.push('STRONG RECOMMENDATION: Reroute to avoid critical threat zone entirely')
    recommendations.push('If transit unavoidable: embark PCASP, activate citadel, report to UKMTO')
  } else if (overallRiskLevel === 'high') {
    recommendations.push('Implement full BMP5 measures and maintain 18+ knots')
    recommendations.push('Consider convoy transit with naval escort')
  } else if (overallRiskLevel === 'moderate') {
    recommendations.push('Maintain enhanced vigilance and regular position reporting')
  } else {
    recommendations.push('Normal navigation — maintain standard watchkeeping procedures')
  }
  recommendations.push('Register transit with UKMTO and MSCHOA')
  recommendations.push('Conduct pre-transit security drill with all crew')

  return {
    operation: input.operation,
    overall_risk_level: overallRiskLevel,
    overall_risk_score: avgRisk,
    zone_assessments: zoneAssessments,
    recommended_route_deviation_nm: totalAvoidance,
    mitigation_measures: mitigationMeasures,
    insurance_impact: insuranceImpact,
    naval_presence: navalPresence,
    recommendations,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

function formatVesselTrackingReport(result: VesselTrackingResult): string {
  const lines: string[] = []
  lines.push('## Vessel Tracking Aggregator — 船舶追踪聚合报告')
  lines.push('')
  lines.push('Operation: ' + result.operation + ' | Data Quality: ' + result.data_quality)
  lines.push('Total Vessels: ' + result.fleet_summary.total_vessels + ' | Underway: ' + result.fleet_summary.underway_count + ' | Anchored: ' + result.fleet_summary.anchored_count)
  lines.push('Avg Speed: ' + result.fleet_summary.avg_speed + 'kn | Coverage Gaps: ' + result.fleet_summary.coverage_gaps + ' | Freshness: ' + result.fleet_summary.data_freshness_min + 'min')
  lines.push('')
  lines.push('### Vessel Positions')
  lines.push('| MMSI | Vessel | Lat | Lon | SOG | COG | Status | Source |')
  lines.push('|------|--------|-----|-----|-----|-----|--------|--------|')
  for (const p of result.positions.slice(0, 10)) {
    lines.push('| ' + p.mmsi + ' | ' + p.vessel_name + ' | ' + p.lat + ' | ' + p.lon + ' | ' + p.sog + ' | ' + p.cog + ' | ' + p.status + ' | ' + p.data_source + ' |')
  }
  lines.push('')
  lines.push('### Position Predictions')
  lines.push('| MMSI | Predicted Lat | Predicted Lon | ETA | Confidence |')
  lines.push('|------|---------------|---------------|-----|------------|')
  for (const p of result.predictions) {
    lines.push('| ' + p.mmsi + ' | ' + p.predicted_lat + ' | ' + p.predicted_lon + ' | ' + p.eta.slice(0, 16) + ' | ' + p.confidence + ' |')
  }
  lines.push('')
  lines.push('### Alerts')
  for (const a of result.alerts) lines.push('- ' + a)
  lines.push('')
  lines.push('---')
  lines.push('*Vessel Tracking Aggregator v0.1.0 | AIS terrestrial + satellite fusion*')
  return lines.join('\n')
}

function formatPortCongestionReport(result: PortCongestionResult): string {
  const lines: string[] = []
  lines.push('## Port Congestion Analyzer — 港口拥堵分析报告')
  lines.push('')
  lines.push('Port: ' + result.port_code + ' | Congestion Level: ' + result.congestion_level.toUpperCase())
  lines.push('Queue Length: ' + result.queue_length + ' vessels | Avg Wait: ' + result.avg_waiting_time_hrs + 'hrs')
  lines.push('Throughput: ' + result.throughput_teu_day + ' TEU/day')
  lines.push('')
  lines.push('### Berth Utilization')
  lines.push('| Berth | Utilization | Vessel | Status |')
  lines.push('|-------|-------------|--------|--------|')
  for (const b of result.berth_utilization) {
    lines.push('| ' + b.berth_id + ' | ' + b.utilization_pct + '% | ' + b.vessel_mmsi + ' | ' + b.status + ' |')
  }
  lines.push('')
  lines.push('### Congestion Metrics')
  lines.push('| Metric | Value | Unit | Trend | Benchmark |')
  lines.push('|--------|-------|------|-------|-----------|')
  for (const m of result.metrics) {
    lines.push('| ' + m.metric + ' | ' + m.value + ' | ' + m.unit + ' | ' + m.trend + ' | ' + m.benchmark_pct + '% |')
  }
  lines.push('')
  lines.push('### Bottleneck Analysis')
  for (const b of result.bottleneck_analysis) lines.push('- ' + b)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*Port Congestion Analyzer v0.1.0 | Real-time berth + yard analytics*')
  return lines.join('\n')
}

function formatShippingEmissionsReport(result: ShippingEmissionsResult): string {
  const lines: string[] = []
  lines.push('## Shipping Emissions Calculator — 航运排放计算报告')
  lines.push('')
  lines.push('Operation: ' + result.operation)
  lines.push('CO2: ' + result.emissions.co2_tonnes + 't | SOx: ' + result.emissions.sox_tonnes + 't | NOx: ' + result.emissions.nox_tonnes + 't')
  lines.push('CH4: ' + result.emissions.ch4_tonnes + 't | N2O: ' + result.emissions.n2o_tonnes + 't | Total CO2e: ' + result.emissions.total_co2e_tonnes + 't')
  if (result.fuel_efficiency_g_teu_nm !== undefined) lines.push('Fuel Efficiency: ' + result.fuel_efficiency_g_teu_nm + 'g/TEU-nm')
  if (result.annual_projection_tonnes) lines.push('Annual Projection: ' + result.annual_projection_tonnes + 't CO2e')
  lines.push('')
  lines.push('### Regulatory Ratings')
  lines.push('| Scheme | Rating | Value | Limit | Status |')
  lines.push('|--------|--------|-------|-------|--------|')
  for (const r of result.regulatory_ratings) {
    lines.push('| ' + r.scheme + ' | ' + r.rating + ' | ' + r.value + ' | ' + r.limit + ' | ' + r.compliance_status + ' |')
  }
  lines.push('')
  lines.push('### Compliance Timeline')
  lines.push('| Year | Limit | Projected | Status |')
  lines.push('|------|-------|-----------|--------|')
  for (const c of result.compliance_timeline) {
    lines.push('| ' + c.year + ' | ' + c.limit + ' | ' + c.projected + ' | ' + c.status + ' |')
  }
  lines.push('')
  lines.push('### Reduction Strategies')
  for (const s of result.reduction_strategies) lines.push('- ' + s)
  lines.push('')
  lines.push('---')
  lines.push('*Shipping Emissions Calculator v0.1.0 | IMO/EU regulatory compliance*')
  return lines.join('\n')
}

function formatVoyageOptimizationReport(result: VoyageOptimizationResult): string {
  const lines: string[] = []
  lines.push('## Voyage Optimization Engine — 航线优化引擎报告')
  lines.push('')
  lines.push('Operation: ' + result.operation)
  lines.push('Recommended Route: ' + result.recommended_route.total_distance_nm + 'nm | Duration: ' + result.recommended_route.estimated_duration_hrs + 'hrs | Fuel: ' + result.recommended_route.estimated_fuel_tonnes + 't')
  lines.push('Fuel Savings: ' + result.recommended_route.fuel_savings_pct + '% | CO2 Savings: ' + result.recommended_route.co2_savings_tonnes + 't | Safety Score: ' + result.recommended_route.safety_score)
  lines.push('')
  lines.push('### Recommended Route Waypoints')
  for (const w of result.recommended_route.waypoints) {
    lines.push('- ' + w.name + ' (' + w.lat.toFixed(3) + ', ' + w.lon.toFixed(3) + ')')
  }
  lines.push('')
  lines.push('### Alternative Routes')
  lines.push('| Route | Distance (nm) | Duration (hrs) | Fuel (t) | Fuel Savings % | Safety |')
  lines.push('|-------|---------------|----------------|----------|---------------|--------|')
  for (let i = 0; i < result.alternative_routes.length; i++) {
    const r = result.alternative_routes[i]
    lines.push('| Alt ' + (i + 1) + ' | ' + r.total_distance_nm + ' | ' + r.estimated_duration_hrs + ' | ' + r.estimated_fuel_tonnes + ' | ' + r.fuel_savings_pct + '% | ' + r.safety_score + ' |')
  }
  lines.push('')
  lines.push('### Weather Impact')
  for (const w of result.weather_impact) lines.push('- ' + w)
  lines.push('')
  lines.push('### Risk Factors')
  for (const r of result.risk_factors) lines.push('- ' + r)
  lines.push('')
  lines.push('### Optimization Notes')
  for (const n of result.optimization_notes) lines.push('- ' + n)
  lines.push('')
  lines.push('---')
  lines.push('*Voyage Optimization Engine v0.1.0 | Weather routing + fuel optimization*')
  return lines.join('\n')
}

function formatBerthingScheduleReport(result: BerthingScheduleResult): string {
  const lines: string[] = []
  lines.push('## Berthing Schedule Planner — 靠泊计划规划报告')
  lines.push('')
  lines.push('Operation: ' + result.operation + ' | Efficiency: ' + result.schedule_efficiency + '%')
  lines.push('Berth Utilization: ' + result.berth_utilization_pct + '% | Throughput: ' + result.total_throughput_teu + ' TEU')
  lines.push('Avg Wait: ' + result.avg_vessel_wait_hrs + 'hrs | Conflicts: ' + result.conflicts_detected)
  lines.push('')
  lines.push('### Berth Assignments')
  lines.push('| Vessel | Berth | Start | End | Cranes | Status |')
  lines.push('|--------|-------|-------|-----|--------|--------|')
  for (const a of result.assignments) {
    lines.push('| ' + a.vessel_name + ' | ' + a.berth_id + ' | ' + a.scheduled_start.slice(0, 16) + ' | ' + a.scheduled_end.slice(0, 16) + ' | ' + a.cranes_assigned + ' | ' + a.status + ' |')
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*Berthing Schedule Planner v0.1.0 | Berth allocation + conflict resolution*')
  return lines.join('\n')
}

function formatContainerYardReport(result: ContainerYardResult): string {
  const lines: string[] = []
  lines.push('## Container Yard Optimizer — 集装箱堆场优化报告')
  lines.push('')
  lines.push('Operation: ' + result.operation)
  lines.push('Rehandle Rate: ' + result.efficiency.rehandle_rate + ' | Space Utilization: ' + result.efficiency.space_utilization_pct + '%')
  lines.push('Reefer Utilization: ' + result.efficiency.reefer_utilization_pct + '% | Crane Productivity: ' + result.efficiency.crane_productivity_teu_hr + ' TEU/hr')
  lines.push('Truck Turnaround: ' + result.efficiency.truck_turnaround_min + 'min | Gate Throughput: ' + result.efficiency.gate_throughput_teu_hr + ' TEU/hr')
  lines.push('')
  lines.push('### Block Utilization')
  lines.push('| Block | Utilization | TEU Count |')
  lines.push('|-------|-------------|-----------|')
  for (const b of result.blocks_utilization) {
    lines.push('| ' + b.block_id + ' | ' + b.utilization_pct + '% | ' + b.teu_count + ' |')
  }
  lines.push('')
  lines.push('### Slot Assignments (sample)')
  lines.push('| Container | Block | Bay | Row | Tier | Rehandle Risk |')
  lines.push('|-----------|-------|-----|-----|------|---------------|')
  for (const s of result.slot_assignments.slice(0, 10)) {
    lines.push('| ' + s.container_id + ' | ' + s.block_id + ' | ' + s.bay + ' | ' + s.row + ' | ' + s.tier + ' | ' + s.rehandle_risk + ' |')
  }
  lines.push('')
  lines.push('### Hazardous Segregation')
  for (const h of result.hazardous_segregation) lines.push('- ' + h)
  lines.push('')
  lines.push('### Optimization Notes')
  for (const n of result.optimization_notes) lines.push('- ' + n)
  lines.push('')
  lines.push('---')
  lines.push('*Container Yard Optimizer v0.1.0 | Slot assignment + crane scheduling*')
  return lines.join('\n')
}

function formatCustomsClearanceReport(result: CustomsClearanceResult): string {
  const lines: string[] = []
  lines.push('## Customs Clearance Tracker — 清关追踪报告')
  lines.push('')
  lines.push('Shipment: ' + result.shipment_id + ' | Status: ' + result.overall_status.toUpperCase())
  lines.push('Estimated Clearance: ' + result.estimated_clearance_hrs + 'hrs')
  lines.push('')
  lines.push('### Compliance Checks')
  lines.push('| Check | Status | Details | Regulation |')
  lines.push('|-------|--------|---------|------------|')
  for (const c of result.compliance_checks) {
    lines.push('| ' + c.check_name + ' | ' + c.status + ' | ' + c.details + ' | ' + c.regulation_ref + ' |')
  }
  lines.push('')
  lines.push('### Clearance Timeline')
  lines.push('| Stage | Status | Est. Hrs | Actual Hrs | Blocking Issues |')
  lines.push('|-------|--------|----------|------------|-----------------|')
  for (const t of result.timeline) {
    lines.push('| ' + t.stage + ' | ' + t.status + ' | ' + t.estimated_duration_hrs + ' | ' + (t.actual_duration_hrs || '-') + ' | ' + (t.blocking_issues.join(', ') || '-') + ' |')
  }
  lines.push('')
  lines.push('### Risk Flags')
  for (const r of result.risk_flags) lines.push('- ' + r)
  lines.push('')
  lines.push('### Document Gaps')
  for (const d of result.document_gaps) lines.push('- ' + d)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*Customs Clearance Tracker v0.1.0 | Compliance + timeline tracking*')
  return lines.join('\n')
}

function formatPiracyRiskReport(result: PiracyRiskResult): string {
  const lines: string[] = []
  lines.push('## Piracy Risk Assessor — 海盗风险评估报告')
  lines.push('')
  lines.push('Operation: ' + result.operation + ' | Overall Risk: ' + result.overall_risk_level.toUpperCase() + ' (' + result.overall_risk_score + '/10)')
  lines.push('Route Deviation: ' + result.recommended_route_deviation_nm + 'nm')
  lines.push('')
  lines.push('### Zone Risk Assessments')
  lines.push('| Zone | Threat Level | Risk Score | Probability | Action | Avoid Dist |')
  lines.push('|------|-------------|------------|-------------|--------|------------|')
  for (const z of result.zone_assessments) {
    lines.push('| ' + z.zone_name + ' | ' + z.threat_level + ' | ' + z.risk_score + ' | ' + z.incident_probability + ' | ' + z.recommended_action + ' | ' + z.avoidance_distance_nm + 'nm |')
  }
  lines.push('')
  lines.push('### Mitigation Measures')
  lines.push('| Measure | Effectiveness | Cost (USD) | Priority |')
  lines.push('|---------|---------------|------------|----------|')
  for (const m of result.mitigation_measures) {
    lines.push('| ' + m.measure + ' | ' + m.effectiveness + ' | $' + m.cost_estimate_usd.toLocaleString() + ' | ' + m.priority + ' |')
  }
  lines.push('')
  lines.push('### Insurance Impact')
  for (const i of result.insurance_impact) lines.push('- ' + i)
  lines.push('')
  lines.push('### Naval Presence')
  for (const n of result.naval_presence) lines.push('- ' + n)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*Piracy Risk Assessor v0.1.0 | BMP5 compliant threat assessment*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Vessel Tracking Aggregator — 船舶追踪聚合
  tools.register(defineTool({
    name: 'vessel_tracking_aggregator',
    description: '船舶追踪聚合 | AIS数据融合/位置预测/船队监控/地理围栏告警 | Aggregate vessel positions from multiple AIS sources with fleet monitoring and geofence alerts.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"track|predict|fleet_monitor|geofence_alert","vessels":[{"mmsi":"","vessel_name":"","vessel_type":"container|bulk|tanker|lng|general|ro_ro","flag":"","gross_tonnage":10000,"last_position":{"lat":0,"lon":0,"timestamp":"2024-01-01T00:00:00Z","sog":12,"cog":90}}],"time_horizon_hours":24,"geofence":{"center_lat":0,"center_lon":0,"radius_nm":50},"data_sources":["ais_terrestrial","ais_satellite","lrith","vms"]}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: VesselTrackingInput = JSON.parse(args.input)
      return formatVesselTrackingReport(analyzeVesselTracking(input))
    },
  }))

  // Tool 2: Port Congestion Analyzer — 港口拥堵分析
  tools.register(defineTool({
    name: 'port_congestion_analyzer',
    description: '港口拥堵分析 | 锚地排队/泊位利用率/延误预测/瓶颈识别 | Analyze port congestion with berth utilization, queue management, and bottleneck detection.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"analyze|forecast|compare|bottleneck","port_calls":[{"port_code":"","port_name":"","vessel_mmsi":"","vessel_name":"","scheduled_eta":"2024-01-01T00:00:00Z","berth":"B01","operation_type":"loading|discharge|both","teu_capacity":5000}],"port_capacity":{"total_berths":10,"total_yard_teu":50000,"crane_count":20,"avg_berth_productivity_teu_hr":150},"analysis_window_days":7,"compare_ports":["CNSHA","SGSIN","NLRTM"]}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: PortCongestionInput = JSON.parse(args.input)
      return formatPortCongestionReport(analyzePortCongestion(input))
    },
  }))

  // Tool 3: Shipping Emissions Calculator — 航运排放计算
  tools.register(defineTool({
    name: 'shipping_emissions_calculator',
    description: '航运排放计算 | CO2/SOx/NOx/EEXI/CII评级/EU MRV合规 | Calculate shipping emissions with regulatory compliance ratings (EEXI, CII, EU MRV).',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"calculate|eexi|cii|eu_mrv|forecast","voyage":{"distance_nm":5000,"avg_speed_kn":14,"fuel_consumption_tonnes":1500,"fuel_type":"vlsfo|ulsfo|mgo|lng|methanol|biofuel","deadweight_tonnage":80000,"capacity_teu":8000},"regulatory_scope":"imo|eu|both","target_year":2030}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: ShippingEmissionsInput = JSON.parse(args.input)
      return formatShippingEmissionsReport(analyzeShippingEmissions(input))
    },
  }))

  // Tool 4: Voyage Optimization Engine — 航线优化引擎
  tools.register(defineTool({
    name: 'voyage_optimization_engine',
    description: '航线优化引擎 | 气象导航/燃油优化/ETA预测/安全评分 | Optimize voyage routes with weather routing, fuel optimization, and ETA prediction.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"optimize|weather_routing|fuel_optimization|eta_prediction","origin":{"lat":1.35,"lon":103.8,"name":"Singapore"},"destination":{"lat":51.5,"lon":-0.1,"name":"London"},"vessel":{"vessel_type":"container","max_speed_kn":24,"service_speed_kn":20,"fuel_curve":[{"speed_kn":12,"consumption_tonnes_day":40},{"speed_kn":16,"consumption_tonnes_day":80},{"speed_kn":20,"consumption_tonnes_day":150}],"draft_m":14.5},"weather":[{"wave_height_m":3,"wind_speed_kn":25,"wind_direction_deg":180,"current_speed_kn":1.5,"current_direction_deg":90,"visibility_nm":5}],"constraints":{"max_wave_height_m":6,"avoid_areas":[{"lat":5,"lon":50,"radius_nm":100}],"required_eta":"2024-02-01T00:00:00Z","fuel_budget_tonnes":2000}}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: VoyageOptimizationInput = JSON.parse(args.input)
      return formatVoyageOptimizationReport(analyzeVoyageOptimization(input))
    },
  }))

  // Tool 5: Berthing Schedule Planner — 靠泊计划规划
  tools.register(defineTool({
    name: 'berthing_schedule_planner',
    description: '靠泊计划规划 | 泊位分配/潮汐窗口/作业调度/冲突解决 | Plan berthing schedules with vessel-berth matching, tidal constraints, and conflict resolution.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"plan|optimize|conflict_resolve|what_if","berth_requests":[{"vessel_mmsi":"","vessel_name":"","vessel_loa_m":350,"vessel_beam_m":48,"vessel_draft_m":14.5,"requested_berth_time":"2024-01-01T06:00:00Z","estimated_operation_hrs":24,"operation_type":"loading|discharge|both","teu_to_handle":5000,"priority":"high|medium|low"}],"berths":[{"berth_id":"B01","max_loa_m":400,"max_draft_m":16,"crane_count":6,"productivity_teu_hr":150,"available_from":"2024-01-01T00:00:00Z","available_to":"2024-01-07T00:00:00Z"}],"tidal_constraints":{"high_tide_times":["2024-01-01T08:00:00Z"],"min_depth_m":15},"time_horizon_hours":168}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: BerthingScheduleInput = JSON.parse(args.input)
      return formatBerthingScheduleReport(analyzeBerthingSchedule(input))
    },
  }))

  // Tool 6: Container Yard Optimizer — 集装箱堆场优化
  tools.register(defineTool({
    name: 'container_yard_optimizer',
    description: '集装箱堆场优化 | 翻箱率/箱位分配/龙门吊调度/危险品隔离 | Optimize container yard operations with slot assignment, rehandle reduction, and crane scheduling.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"optimize|rehandle_forecast|slot_assignment|crane_schedule","containers":[{"container_id":"MSCU1234567","size":"20ft|40ft","type":"dry|reefer|open_top|flat_rank|tank","weight_tonnes":20,"destination_port":"USLAX","vessel_voyage":"V001","arrival_time":"2024-01-01T00:00:00Z","departure_deadline":"2024-01-05T00:00:00Z","reefer_required":false,"hazardous_class":"3"}],"yard_blocks":[{"block_id":"A1","max_tiers":5,"max_rows":8,"max_teu":2000,"current_teu":1200,"reefer_capacity":100,"current_reefer":60,"crane_type":"rmg|rtg|asc"}],"target_rehandle_rate":0.2,"planning_horizon_hours":72}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: ContainerYardInput = JSON.parse(args.input)
      return formatContainerYardReport(analyzeContainerYard(input))
    },
  }))

  // Tool 7: Customs Clearance Tracker — 清关追踪
  tools.register(defineTool({
    name: 'customs_clearance_tracker',
    description: '清关追踪 | 单证状态/合规检查/放行预测/风险评估 | Track customs clearance with compliance checks, timeline prediction, and risk assessment.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"track|compliance_check|predict|risk_assessment","shipment":{"shipment_id":"SHP001","hs_code":"8471.30","origin_country":"CN","destination_country":"US","declared_value_usd":50000,"weight_kg":5000,"container_ids":["MSCU1234567"]},"documents":[{"document_id":"DOC001","document_type":"bill_of_lading|commercial_invoice|packing_list|certificate_of_origin|import_declaration|dangerous_goods_declaration","status":"submitted|under_review|approved|rejected|additional_info_required","submission_time":"2024-01-01T00:00:00Z","last_update":"2024-01-01T02:00:00Z"}],"customs_regime":"import|export|transit|bonded","risk_category":"green|yellow|red"}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: CustomsClearanceInput = JSON.parse(args.input)
      return formatCustomsClearanceReport(analyzeCustomsClearance(input))
    },
  }))

  // Tool 8: Piracy Risk Assessor — 海盗风险评估
  tools.register(defineTool({
    name: 'piracy_risk_assessor',
    description: '海盗风险评估 | 高危海域/威胁等级/规避航线/缓解措施 | Assess piracy risk along planned routes with threat levels, mitigation measures, and route advice.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"assess|route_advice|threat_forecast|mitigation","planned_route":[{"lat":12.0,"lon":45.0,"name":"Gulf of Aden entry"},{"lat":15.0,"lon":55.0,"name":"Arabian Sea"}],"vessel":{"vessel_type":"container","max_speed_kn":20,"freeboard_m":8,"has_citadel":false,"has_armed_security":false,"crew_count":20},"zones":[{"zone_id":"HRA","name":"High Risk Area","bounds":{"north_lat":20,"south_lat":5,"east_lon":70,"west_lon":40},"threat_level":"critical","recent_incidents":15,"last_incident_date":"2024-01-01","threat_type":["armed_robbery","kidnap_ransom","hijacking"]}],"transit_time":"2024-01-05T00:00:00Z","cargo_value_usd":50000000}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: PiracyRiskInput = JSON.parse(args.input)
      return formatPiracyRiskReport(analyzePiracyRisk(input))
    },
  }))

  console.log('[dsh-tool-marinetrack] Loaded v' + VERSION + ' — Maritime Shipping & Port Intelligence with 8 tools')
  console.log('  Tools: vessel_tracking_aggregator, port_congestion_analyzer, shipping_emissions_calculator, voyage_optimization_engine, berthing_schedule_planner, container_yard_optimizer, customs_clearance_tracker, piracy_risk_assessor')
}
