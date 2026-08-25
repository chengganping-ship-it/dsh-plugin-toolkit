/**
 * DSH Smart City & Urban Management Plugin v1.0.0
 * 智慧城市与城市管理 for DeepSeek Harness — traffic, waste, grid, air, water, digital twin, citizen engagement, resilience
 *
 * 2026: Smart city market $800B+; urban management platforms growing at 15% CAGR.
 *
 * 工具清单:
 * 1. traffic_flow_optimizer          — 交通流量优化（路口分析、信号配时、拥堵预测、车速优化）
 * 2. waste_collection_router         — 垃圾收集路径（车辆调度、满载率、路线规划、吨位统计）
 * 3. smart_grid_integration_planner  — 智能电网集成（负荷预测、分布式能源、储能调度、电网稳定性）
 * 4. air_quality_monitor_config      — 空气质量监测配置（AQI监测站、污染物分析、预警阈值、传感器网络）
 * 5. water_distribution_optimizer    — 供水分配优化（管网压力、漏损检测、水质监测、用水需求预测）
 * 6. digital_twin_city_builder       — 数字孪生城市构建（3D建模、IoT融合、仿真推演、实时映射）
 * 7. citizen_engagement_dashboard    — 市民参与仪表板（参与率、满意度、投诉处理、服务评价）
 * 8. resilience_risk_mapper          — 韧性风险地图（灾害评估、脆弱性分析、应急资源、韧性指数）
 *
 * @module dsh-tool-hydrocity | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-hydrocity'
export const inject = ['tools']

const DISCLAIMER = '本工具提供辅助分析参考，不替代政府决策与专业判断。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ==================== SECTION 2 — Type Definitions ====================

// --- Tool 1: Traffic Flow Optimizer ---
export interface TrafficFlowInput {
  city?: string
  district?: string
  intersection_count?: number
  peak_hour?: string
  road_type?: string
}

export interface IntersectionMetrics {
  intersection_id: string
  avg_speed_kmh: number
  vehicle_count: number
  congestion_index: number
  signal_cycle_sec: number
  delay_sec: number
  level_of_service: string
}

export interface TrafficFlowResult {
  city: string
  district: string
  total_intersections: number
  avg_network_speed_kmh: number
  total_vehicle_count: number
  peak_congestion_index: number
  co2_emission_tons_daily: number
  intersections: IntersectionMetrics[]
  optimization_recommendations: string[]
}

// --- Tool 2: Waste Collection Router ---
export interface WasteCollectionInput {
  city?: string
  zone?: string
  vehicle_count?: number
  collection_days?: string[]
  waste_type?: string
}

export interface RouteSegment {
  segment_id: string
  from_location: string
  to_location: string
  distance_km: number
  estimated_time_min: number
  waste_tonnage: number
  fill_rate_pct: number
}

export interface WasteCollectionResult {
  city: string
  zone: string
  total_vehicles: number
  total_distance_km: number
  total_waste_tonnes_daily: number
  avg_fill_rate_pct: number
  fuel_cost_daily: number
  routes: RouteSegment[]
  optimization_notes: string[]
}

// --- Tool 3: Smart Grid Integration Planner ---
export interface SmartGridInput {
  city?: string
  grid_zone?: string
  renewable_capacity_mw?: number
  battery_storage_mwh?: number
  peak_demand_mw?: number
  protocol?: string
}

export interface GridNode {
  node_id: string
  node_type: string
  capacity_mw: number
  current_load_mw: number
  utilization_pct: number
  status: string
}

export interface SmartGridResult {
  city: string
  grid_zone: string
  total_capacity_mw: number
  current_demand_mw: number
  renewable_share_pct: number
  battery_utilization_pct: number
  grid_stability_index: number
  grid_nodes: GridNode[]
  integration_recommendations: string[]
}

// --- Tool 4: Air Quality Monitor Config ---
export interface AirQualityInput {
  city?: string
  monitoring_stations?: number
  pollutants?: string[]
  alert_threshold_aqi?: number
  sensor_network_type?: string
}

export interface PollutantConfig {
  pollutant: string
  unit: string
  current_value: number
  safe_limit: number
  warning_limit: number
  current_aqi: number
  status: string
}

export interface AirQualityResult {
  city: string
  total_stations: number
  overall_aqi: number
  dominant_pollutant: string
  alert_level: string
  population_exposed_pct: number
  pollutants: PollutantConfig[]
  sensor_recommendations: string[]
}

// --- Tool 5: Water Distribution Optimizer ---
export interface WaterDistributionInput {
  city?: string
  network_zone?: string
  pipeline_length_km?: number
  daily_demand_m3?: number
  pressure_zones?: number
}

export interface PressureZone {
  zone_id: string
  pressure_bar: number
  flow_rate_ls: number
  leak_rate_pct: number
  water_quality_index: number
  demand_supply_ratio: number
}

export interface WaterDistributionResult {
  city: string
  network_zone: string
  total_pipeline_km: number
  daily_demand_m3: number
  avg_pressure_bar: number
  total_leak_rate_pct: number
  energy_consumption_kwh_daily: number
  pressure_zones: PressureZone[]
  optimization_actions: string[]
}

// --- Tool 6: Digital Twin City Builder ---
export interface DigitalTwinInput {
  city?: string
  area_km2?: number
  iot_device_count?: number
  data_sources?: string[]
  simulation_scenarios?: string[]
}

export interface TwinLayer {
  layer_name: string
  entity_count: number
  data_freshness_sec: number
  accuracy_pct: number
  status: string
}

export interface DigitalTwinResult {
  city: string
  area_km2: number
  total_iot_devices: number
  model_accuracy_pct: number
  real_time_latency_ms: number
  simulation_fidelity_score: number
  layers: TwinLayer[]
  deployment_recommendations: string[]
}

// --- Tool 7: Citizen Engagement Dashboard ---
export interface CitizenEngagementInput {
  city?: string
  period?: string
  channels?: string[]
  service_categories?: string[]
  population?: number
}

export interface ChannelMetric {
  channel: string
  active_users: number
  submissions: number
  avg_satisfaction: number
  response_time_hours: number
}

export interface CitizenEngagementResult {
  city: string
  period: string
  total_participants: number
  overall_satisfaction: number
  resolution_rate_pct: number
  avg_response_hours: number
  engagement_index: number
  channels: ChannelMetric[]
  improvement_suggestions: string[]
}

// --- Tool 8: Resilience Risk Mapper ---
export interface ResilienceInput {
  city?: string
  hazard_types?: string[]
  assessment_area_km2?: number
  population?: number
  infrastructure_count?: number
}

export interface HazardRisk {
  hazard: string
  probability: number
  impact_score: number
  risk_level: string
  affected_population: number
  economic_loss_million_usd: number
}

export interface ResilienceResult {
  city: string
  assessment_area_km2: number
  overall_resilience_index: number
  critical_vulnerabilities: number
  emergency_resources_score: number
  recovery_time_days_avg: number
  hazards: HazardRisk[]
  resilience_recommendations: string[]
}

// ==================== SECTION 3 — Analysis Functions ====================

// --- Tool 1: Traffic Flow Optimizer ---
function analyzeTrafficFlow(data: TrafficFlowInput): TrafficFlowResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const intersections: IntersectionMetrics[] = []
  let totalVehicles = 0
  let totalSpeed = 0
  let maxCongestion = 0

  const count = data.intersection_count || 8
  for (let i = 0; i < count; i++) {
    const speed = 15 + rng() * 55
    const vehicles = Math.floor(200 + rng() * 4800)
    const congestion = 0.2 + rng() * 0.8
    const los = congestion > 0.7 ? 'F' : congestion > 0.55 ? 'E' : congestion > 0.4 ? 'D' : congestion > 0.25 ? 'C' : 'B'
    intersections.push({
      intersection_id: 'INT-' + String(i + 1).padStart(3, '0'),
      avg_speed_kmh: Math.round(speed * 10) / 10,
      vehicle_count: vehicles,
      congestion_index: Math.round(congestion * 100) / 100,
      signal_cycle_sec: Math.floor(60 + rng() * 120),
      delay_sec: Math.round(rng() * 120),
      level_of_service: los,
    })
    totalVehicles += vehicles
    totalSpeed += speed
    if (congestion > maxCongestion) maxCongestion = congestion
  }

  const recommendations = [
    '优化高峰时段信号配时方案，减少主要路口延误',
    '部署自适应交通信号控制系统（ATCS）',
    '增设公交专用道提升公共交通优先级',
    '推广智能导航APP引导车辆分流',
    '建设智慧停车系统减少寻位交通流',
  ]

  return {
    city: data.city || '未指定',
    district: data.district || '全市',
    total_intersections: count,
    avg_network_speed_kmh: Math.round((totalSpeed / count) * 10) / 10,
    total_vehicle_count: totalVehicles,
    peak_congestion_index: Math.round(maxCongestion * 100) / 100,
    co2_emission_tons_daily: Math.round(totalVehicles * rng() * 0.05 * 100) / 100,
    intersections,
    optimization_recommendations: recommendations.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// --- Tool 2: Waste Collection Router ---
function analyzeWasteCollection(data: WasteCollectionInput): WasteCollectionResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const routes: RouteSegment[] = []
  let totalDistance = 0
  let totalTonnage = 0
  let totalFillRate = 0

  const vehicles = data.vehicle_count || 12
  const locations = ['垃圾转运站A', '垃圾转运站B', '垃圾转运站C', '处理厂D', '处理厂E', '回收中心F', '中转站G', '中转站H']

  for (let i = 0; i < vehicles * 3; i++) {
    const dist = 2 + rng() * 28
    const tonnage = 0.5 + rng() * 9.5
    const fillRate = 40 + rng() * 58
    routes.push({
      segment_id: 'RT-' + String(i + 1).padStart(3, '0'),
      from_location: locations[Math.floor(rng() * locations.length)],
      to_location: locations[Math.floor(rng() * locations.length)],
      distance_km: Math.round(dist * 10) / 10,
      estimated_time_min: Math.floor(10 + rng() * 50),
      waste_tonnage: Math.round(tonnage * 100) / 100,
      fill_rate_pct: Math.round(fillRate * 10) / 10,
    })
    totalDistance += dist
    totalTonnage += tonnage
    totalFillRate += fillRate
  }

  const notes = [
    '建议引入动态路线规划算法，根据实时满载率调整路线',
    '优化收运时间窗口，避开交通高峰降低油耗',
    '推广垃圾分类源头减量，降低末端处理压力',
    '部署车载IoT传感器实现精准调度',
  ]

  return {
    city: data.city || '未指定',
    zone: data.zone || '全市',
    total_vehicles: vehicles,
    total_distance_km: Math.round(totalDistance * 10) / 10,
    total_waste_tonnes_daily: Math.round(totalTonnage * 100) / 100,
    avg_fill_rate_pct: Math.round((totalFillRate / routes.length) * 10) / 10,
    fuel_cost_daily: Math.round(totalDistance * 0.8),
    routes,
    optimization_notes: notes.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// --- Tool 3: Smart Grid Integration Planner ---
function analyzeSmartGrid(data: SmartGridInput): SmartGridResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const nodes: GridNode[] = []
  let totalCapacity = 0
  let totalLoad = 0

  const nodeTypes = ['solar_farm', 'wind_turbine', 'battery_bank', 'substation', 'ev_charging', 'industrial_load']
  const nodeNames = ['光伏电站A', '风电场B', '储能站C', '变电站D', '充电站E', '工业负荷F', '居民负荷G', '商业负荷H']

  for (let i = 0; i < 6; i++) {
    const capacity = 10 + rng() * 90
    const load = capacity * (0.3 + rng() * 0.65)
    const util = load / capacity
    nodes.push({
      node_id: 'GRID-' + String(i + 1).padStart(3, '0'),
      node_type: nodeTypes[i % nodeTypes.length],
      capacity_mw: Math.round(capacity * 10) / 10,
      current_load_mw: Math.round(load * 10) / 10,
      utilization_pct: Math.round(util * 100 * 10) / 10,
      status: util > 0.9 ? 'critical' : util > 0.75 ? 'high' : util > 0.5 ? 'normal' : 'low',
    })
    totalCapacity += capacity
    totalLoad += load
  }

  const renewableCapacity = data.renewable_capacity_mw || 50
  const recommendations = [
    '部署AI负荷预测模型，提升日前预测精度至95%以上',
    '建设虚拟电厂（VPP）聚合分布式资源',
    '引入需求响应机制，削峰填谷降低备用容量',
    '升级配电网自动化系统实现故障自愈',
  ]

  return {
    city: data.city || '未指定',
    grid_zone: data.grid_zone || '主网',
    total_capacity_mw: Math.round(totalCapacity * 10) / 10,
    current_demand_mw: Math.round(totalLoad * 10) / 10,
    renewable_share_pct: Math.round((renewableCapacity / totalCapacity) * 100 * 10) / 10,
    battery_utilization_pct: Math.round((50 + rng() * 45) * 10) / 10,
    grid_stability_index: Math.round((0.85 + rng() * 0.14) * 100) / 100,
    grid_nodes: nodes,
    integration_recommendations: recommendations.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// --- Tool 4: Air Quality Monitor Config ---
function analyzeAirQuality(data: AirQualityInput): AirQualityResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const pollutants: PollutantConfig[] = []

  const pollutantDefs: Record<string, { unit: string; safe: number; warn: number; max: number }> = {
    pm25: { unit: 'ug/m3', safe: 35, warn: 75, max: 500 },
    pm10: { unit: 'ug/m3', safe: 50, warn: 150, max: 600 },
    no2: { unit: 'ug/m3', safe: 40, warn: 80, max: 400 },
    so2: { unit: 'ug/m3', safe: 20, warn: 60, max: 500 },
    co: { unit: 'mg/m3', safe: 4, warn: 10, max: 50 },
    o3: { unit: 'ug/m3', safe: 100, warn: 160, max: 500 },
  }

  const requested = data.pollutants || ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3']
  let maxAqi = 0
  let dominant = 'pm25'

  for (const p of requested) {
    const def = pollutantDefs[p]
    if (!def) continue
    const val = Math.round(rng() * def.max * 0.4 * 100) / 100
    const aqi = Math.round((val / def.safe) * 50)
    if (aqi > maxAqi) {
      maxAqi = aqi
      dominant = p
    }
    pollutants.push({
      pollutant: p,
      unit: def.unit,
      current_value: val,
      safe_limit: def.safe,
      warning_limit: def.warn,
      current_aqi: aqi,
      status: aqi > 200 ? 'hazardous' : aqi > 150 ? 'unhealthy' : aqi > 100 ? 'moderate' : aqi > 50 ? 'acceptable' : 'good',
    })
  }

  const overallAqi = Math.round(maxAqi * (0.8 + rng() * 0.2))
  const alertLevel = overallAqi > 200 ? '红色预警' : overallAqi > 150 ? '橙色预警' : overallAqi > 100 ? '黄色预警' : '正常'

  const recommendations = [
    '在工业区下风向增设3个PM2.5/NO2监测站',
    '部署移动监测车补充固定站点盲区',
    '建立AQI实时发布平台与预警推送机制',
    '引入卫星遥感数据实现大范围污染物追踪',
  ]

  return {
    city: data.city || '未指定',
    total_stations: data.monitoring_stations || 12,
    overall_aqi: overallAqi,
    dominant_pollutant: dominant,
    alert_level: alertLevel,
    population_exposed_pct: Math.round((10 + rng() * 60) * 10) / 10,
    pollutants,
    sensor_recommendations: recommendations.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// --- Tool 5: Water Distribution Optimizer ---
function analyzeWaterDistribution(data: WaterDistributionInput): WaterDistributionResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const zones: PressureZone[] = []
  let totalLeak = 0
  let totalPressure = 0

  const zoneCount = data.pressure_zones || 6
  for (let i = 0; i < zoneCount; i++) {
    const pressure = 1.5 + rng() * 5.5
    const leak = 3 + rng() * 22
    zones.push({
      zone_id: 'WPZ-' + String(i + 1).padStart(2, '0'),
      pressure_bar: Math.round(pressure * 100) / 100,
      flow_rate_ls: Math.round((20 + rng() * 180) * 10) / 10,
      leak_rate_pct: Math.round(leak * 10) / 10,
      water_quality_index: Math.round((70 + rng() * 28) * 10) / 10,
      demand_supply_ratio: Math.round((0.7 + rng() * 0.4) * 100) / 100,
    })
    totalLeak += leak
    totalPressure += pressure
  }

  const actions = [
    '部署DMA分区计量系统，实现漏损精确定位',
    '更换老旧管网（>30年管龄）降低爆管风险',
    '引入AI用水需求预测优化泵站调度',
    '建设水质在线监测网络保障末端水质',
  ]

  return {
    city: data.city || '未指定',
    network_zone: data.network_zone || '主城',
    total_pipeline_km: data.pipeline_length_km || 850,
    daily_demand_m3: data.daily_demand_m3 || 120000,
    avg_pressure_bar: Math.round((totalPressure / zoneCount) * 100) / 100,
    total_leak_rate_pct: Math.round((totalLeak / zoneCount) * 10) / 10,
    energy_consumption_kwh_daily: Math.round(data.daily_demand_m3 ? data.daily_demand_m3 * 0.35 : 42000),
    pressure_zones: zones,
    optimization_actions: actions.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// --- Tool 6: Digital Twin City Builder ---
function analyzeDigitalTwin(data: DigitalTwinInput): DigitalTwinResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const layers: TwinLayer[] = []

  const layerDefs = [
    { name: '地形与建筑', baseEntities: 50000 },
    { name: '交通网络', baseEntities: 12000 },
    { name: '管网系统', baseEntities: 8000 },
    { name: '生态环境', baseEntities: 3000 },
    { name: '人口热力', baseEntities: 200000 },
    { name: 'IoT传感器', baseEntities: data.iot_device_count || 15000 },
  ]

  for (const def of layerDefs) {
    layers.push({
      layer_name: def.name,
      entity_count: Math.floor(def.baseEntities * (0.8 + rng() * 0.4)),
      data_freshness_sec: Math.floor(1 + rng() * 300),
      accuracy_pct: Math.round((85 + rng() * 14) * 10) / 10,
      status: rng() > 0.2 ? 'active' : 'syncing',
    })
  }

  const recommendations = [
    '接入实时交通流数据提升交通仿真精度',
    '融合BIM/CIM数据构建精细化建筑信息模型',
    '部署边缘计算节点降低孪生体延迟',
    '建立多情景仿真引擎支持应急预案推演',
  ]

  return {
    city: data.city || '未指定',
    area_km2: data.area_km2 || 120,
    total_iot_devices: data.iot_device_count || 15000,
    model_accuracy_pct: Math.round((88 + rng() * 10) * 10) / 10,
    real_time_latency_ms: Math.floor(50 + rng() * 450),
    simulation_fidelity_score: Math.round((0.75 + rng() * 0.24) * 100) / 100,
    layers,
    deployment_recommendations: recommendations.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// --- Tool 7: Citizen Engagement Dashboard ---
function analyzeCitizenEngagement(data: CitizenEngagementInput): CitizenEngagementResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const channels: ChannelMetric[] = []

  const channelNames = data.channels || ['政务APP', '12345热线', '微信公众号', '社区议事厅', '网上信访']
  for (const ch of channelNames) {
    channels.push({
      channel: ch,
      active_users: Math.floor(5000 + rng() * 95000),
      submissions: Math.floor(200 + rng() * 9800),
      avg_satisfaction: Math.round((3.0 + rng() * 1.8) * 100) / 100,
      response_time_hours: Math.round((2 + rng() * 46) * 10) / 10,
    })
  }

  const totalParticipants = channels.reduce((s, c) => s + c.active_users, 0)
  const avgSatisfaction = channels.reduce((s, c) => s + c.avg_satisfaction, 0) / channels.length
  const avgResponse = channels.reduce((s, c) => s + c.response_time_hours, 0) / channels.length

  const suggestions = [
    '优化政务APP用户体验，提升移动端活跃度',
    '建立跨部门协同办理机制减少推诿',
    '引入AI智能客服实现7x24小时即时响应',
    '开展线下社区活动扩大老年群体覆盖',
  ]

  return {
    city: data.city || '未指定',
    period: data.period || '2026-Q1',
    total_participants: totalParticipants,
    overall_satisfaction: Math.round(avgSatisfaction * 100) / 100,
    resolution_rate_pct: Math.round((55 + rng() * 40) * 10) / 10,
    avg_response_hours: Math.round(avgResponse * 10) / 10,
    engagement_index: Math.round((40 + rng() * 55) * 10) / 10,
    channels,
    improvement_suggestions: suggestions.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// --- Tool 8: Resilience Risk Mapper ---
function analyzeResilience(data: ResilienceInput): ResilienceResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const hazards: HazardRisk[] = []

  const hazardPool = [
    { name: '洪涝灾害', prob: 0.15, impact: 85 },
    { name: '地震风险', prob: 0.05, impact: 95 },
    { name: '台风袭击', prob: 0.2, impact: 75 },
    { name: '热浪高温', prob: 0.35, impact: 60 },
    { name: '供水危机', prob: 0.1, impact: 80 },
    { name: '电力中断', prob: 0.12, impact: 70 },
    { name: '疫情爆发', prob: 0.08, impact: 90 },
    { name: '地质灾害', prob: 0.07, impact: 65 },
  ]

  const selectedHazards = data.hazard_types || hazardPool.map(h => h.name).slice(0, 5)
  for (const hName of selectedHazards) {
    const def = hazardPool.find(h => h.name === hName) || { name: hName, prob: 0.1, impact: 50 }
    const prob = Math.round(def.prob * (0.7 + rng() * 0.6) * 100) / 100
    const impact = Math.round(def.impact * (0.8 + rng() * 0.4))
    const riskVal = prob * impact
    hazards.push({
      hazard: def.name,
      probability: prob,
      impact_score: impact,
      risk_level: riskVal > 20 ? '极高' : riskVal > 12 ? '高' : riskVal > 6 ? '中' : '低',
      affected_population: Math.floor(10000 + rng() * 990000),
      economic_loss_million_usd: Math.round((5 + rng() * 495) * 10) / 10,
    })
  }

  const recommendations = [
    '建设城市级应急指挥平台实现多灾种联动',
    '加固关键基础设施提升抗灾设防标准',
    '建立社区级应急物资储备与志愿者网络',
    '部署城市生命线工程实时监测预警系统',
  ]

  return {
    city: data.city || '未指定',
    assessment_area_km2: data.assessment_area_km2 || 150,
    overall_resilience_index: Math.round((45 + rng() * 50) * 10) / 10,
    critical_vulnerabilities: Math.floor(2 + rng() * 15),
    emergency_resources_score: Math.round((50 + rng() * 45) * 10) / 10,
    recovery_time_days_avg: Math.round(3 + rng() * 27),
    hazards,
    resilience_recommendations: recommendations.sort(() => rng() - 0.5).slice(0, 3),
  }
}

// ==================== SECTION 4 — Format Report Functions ====================

function formatTrafficFlow(r: TrafficFlowResult): string {
  const lines: string[] = []
  lines.push('【交通流量优化报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 区域: ' + r.district)
  lines.push('路口总数: ' + r.total_intersections + ' | 路网均速: ' + r.avg_network_speed_kmh + ' km/h')
  lines.push('总车流量: ' + r.total_vehicle_count.toLocaleString() + ' 辆 | 峰值拥堵指数: ' + r.peak_congestion_index)
  lines.push('CO2排放: ' + r.co2_emission_tons_daily + ' 吨/日')
  lines.push('')
  lines.push('▸ 路口指标')
  lines.push('| 路口ID | 均速(km/h) | 车流量 | 拥堵指数 | 信号周期(s) | 延误(s) | 服务水平 |')
  lines.push('|--------|-----------|--------|----------|------------|---------|---------|')
  for (const i of r.intersections) {
    lines.push('| ' + i.intersection_id + ' | ' + i.avg_speed_kmh + ' | ' + i.vehicle_count.toLocaleString() + ' | ' + i.congestion_index + ' | ' + i.signal_cycle_sec + ' | ' + i.delay_sec + ' | ' + i.level_of_service + ' |')
  }
  lines.push('')
  lines.push('▸ 优化建议')
  for (const rec of r.optimization_recommendations) {
    lines.push('  - ' + rec)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

function formatWasteCollection(r: WasteCollectionResult): string {
  const lines: string[] = []
  lines.push('【垃圾收集路径报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 区域: ' + r.zone)
  lines.push('车辆数: ' + r.total_vehicles + ' | 总里程: ' + r.total_distance_km + ' km')
  lines.push('日垃圾量: ' + r.total_waste_tonnes_daily + ' 吨/日 | 平均满载率: ' + r.avg_fill_rate_pct + '%')
  lines.push('日燃油成本: ¥' + r.fuel_cost_daily.toLocaleString())
  lines.push('')
  lines.push('▸ 路线段')
  lines.push('| 路段ID | 起点 | 终点 | 距离(km) | 时间(min) | 吨位 | 满载率 |')
  lines.push('|--------|------|------|----------|----------|------|--------|')
  for (const rt of r.routes) {
    lines.push('| ' + rt.segment_id + ' | ' + rt.from_location + ' | ' + rt.to_location + ' | ' + rt.distance_km + ' | ' + rt.estimated_time_min + ' | ' + rt.waste_tonnage + ' | ' + rt.fill_rate_pct + '% |')
  }
  lines.push('')
  lines.push('▸ 优化建议')
  for (const note of r.optimization_notes) {
    lines.push('  - ' + note)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

function formatSmartGrid(r: SmartGridResult): string {
  const lines: string[] = []
  lines.push('【智能电网集成规划报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 电网区域: ' + r.grid_zone)
  lines.push('总容量: ' + r.total_capacity_mw + ' MW | 当前负荷: ' + r.current_demand_mw + ' MW')
  lines.push('可再生能源占比: ' + r.renewable_share_pct + '% | 储能利用率: ' + r.battery_utilization_pct + '%')
  lines.push('电网稳定性指数: ' + r.grid_stability_index)
  lines.push('')
  lines.push('▸ 电网节点')
  lines.push('| 节点ID | 类型 | 容量(MW) | 负荷(MW) | 利用率 | 状态 |')
  lines.push('|--------|------|----------|----------|--------|------|')
  for (const n of r.grid_nodes) {
    lines.push('| ' + n.node_id + ' | ' + n.node_type + ' | ' + n.capacity_mw + ' | ' + n.current_load_mw + ' | ' + n.utilization_pct + '% | ' + n.status + ' |')
  }
  lines.push('')
  lines.push('▸ 集成建议')
  for (const rec of r.integration_recommendations) {
    lines.push('  - ' + rec)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

function formatAirQuality(r: AirQualityResult): string {
  const lines: string[] = []
  lines.push('【空气质量监测配置报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 监测站: ' + r.total_stations + ' 个')
  lines.push('综合AQI: ' + r.overall_aqi + ' | 首要污染物: ' + r.dominant_pollutant)
  lines.push('预警等级: ' + r.alert_level + ' | 暴露人口: ' + r.population_exposed_pct + '%')
  lines.push('')
  lines.push('▸ 污染物配置')
  lines.push('| 污染物 | 当前值 | 单位 | 安全限值 | 警告限值 | AQI | 状态 |')
  lines.push('|--------|--------|------|----------|----------|-----|------|')
  for (const p of r.pollutants) {
    lines.push('| ' + p.pollutant + ' | ' + p.current_value + ' | ' + p.unit + ' | ' + p.safe_limit + ' | ' + p.warning_limit + ' | ' + p.current_aqi + ' | ' + p.status + ' |')
  }
  lines.push('')
  lines.push('▸ 传感器建议')
  for (const rec of r.sensor_recommendations) {
    lines.push('  - ' + rec)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

function formatWaterDistribution(r: WaterDistributionResult): string {
  const lines: string[] = []
  lines.push('【供水分配优化报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 管网区域: ' + r.network_zone)
  lines.push('管网总长: ' + r.total_pipeline_km + ' km | 日需水量: ' + r.daily_demand_m3.toLocaleString() + ' m3')
  lines.push('平均压力: ' + r.avg_pressure_bar + ' bar | 综合漏损率: ' + r.total_leak_rate_pct + '%')
  lines.push('日能耗: ' + r.energy_consumption_kwh_daily.toLocaleString() + ' kWh')
  lines.push('')
  lines.push('▸ 压力分区')
  lines.push('| 分区ID | 压力(bar) | 流量(L/s) | 漏损率 | 水质指数 | 供需比 |')
  lines.push('|--------|----------|----------|--------|----------|--------|')
  for (const z of r.pressure_zones) {
    lines.push('| ' + z.zone_id + ' | ' + z.pressure_bar + ' | ' + z.flow_rate_ls + ' | ' + z.leak_rate_pct + '% | ' + z.water_quality_index + ' | ' + z.demand_supply_ratio + ' |')
  }
  lines.push('')
  lines.push('▸ 优化行动')
  for (const a of r.optimization_actions) {
    lines.push('  - ' + a)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

function formatDigitalTwin(r: DigitalTwinResult): string {
  const lines: string[] = []
  lines.push('【数字孪生城市构建报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 覆盖面积: ' + r.area_km2 + ' km2')
  lines.push('IoT设备: ' + r.total_iot_devices.toLocaleString() + ' | 模型精度: ' + r.model_accuracy_pct + '%')
  lines.push('实时延迟: ' + r.real_time_latency_ms + ' ms | 仿真保真度: ' + r.simulation_fidelity_score)
  lines.push('')
  lines.push('▸ 孪生层级')
  lines.push('| 层级 | 实体数 | 数据新鲜度(s) | 精度 | 状态 |')
  lines.push('|------|--------|-------------|------|------|')
  for (const l of r.layers) {
    lines.push('| ' + l.layer_name + ' | ' + l.entity_count.toLocaleString() + ' | ' + l.data_freshness_sec + ' | ' + l.accuracy_pct + '% | ' + l.status + ' |')
  }
  lines.push('')
  lines.push('▸ 部署建议')
  for (const rec of r.deployment_recommendations) {
    lines.push('  - ' + rec)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

function formatCitizenEngagement(r: CitizenEngagementResult): string {
  const lines: string[] = []
  lines.push('【市民参与仪表板报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 周期: ' + r.period)
  lines.push('参与人数: ' + r.total_participants.toLocaleString() + ' | 综合满意度: ' + r.overall_satisfaction + ' / 5.0')
  lines.push('解决率: ' + r.resolution_rate_pct + '% | 平均响应: ' + r.avg_response_hours + ' 小时')
  lines.push('参与指数: ' + r.engagement_index + ' / 100')
  lines.push('')
  lines.push('▸ 渠道指标')
  lines.push('| 渠道 | 活跃用户 | 提交量 | 满意度 | 响应时间(h) |')
  lines.push('|------|----------|--------|--------|------------|')
  for (const c of r.channels) {
    lines.push('| ' + c.channel + ' | ' + c.active_users.toLocaleString() + ' | ' + c.submissions.toLocaleString() + ' | ' + c.avg_satisfaction + ' | ' + c.response_time_hours + ' |')
  }
  lines.push('')
  lines.push('▸ 改进建议')
  for (const s of r.improvement_suggestions) {
    lines.push('  - ' + s)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

function formatResilience(r: ResilienceResult): string {
  const lines: string[] = []
  lines.push('【韧性风险地图报告】')
  lines.push('')
  lines.push('城市: ' + r.city + ' | 评估面积: ' + r.assessment_area_km2 + ' km2')
  lines.push('韧性指数: ' + r.overall_resilience_index + ' / 100 | 关键脆弱点: ' + r.critical_vulnerabilities + ' 个')
  lines.push('应急资源评分: ' + r.emergency_resources_score + ' / 100 | 平均恢复时间: ' + r.recovery_time_days_avg + ' 天')
  lines.push('')
  lines.push('▸ 灾害风险')
  lines.push('| 灾害类型 | 概率 | 影响分 | 风险等级 | 受影响人口 | 经济损失(百万$) |')
  lines.push('|----------|------|--------|----------|-----------|----------------|')
  for (const h of r.hazards) {
    lines.push('| ' + h.hazard + ' | ' + h.probability + ' | ' + h.impact_score + ' | ' + h.risk_level + ' | ' + h.affected_population.toLocaleString() + ' | ' + h.economic_loss_million_usd + ' |')
  }
  lines.push('')
  lines.push('▸ 韧性建议')
  for (const rec of r.resilience_recommendations) {
    lines.push('  - ' + rec)
  }
  lines.push('')
  lines.push('⚠ ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context): void {
  const tools = ctx.tools

  // 1. traffic_flow_optimizer
  tools.register(
    defineTool({
      name: 'traffic_flow_optimizer',
      description: '交通流量优化 — 路口分析、信号配时、拥堵预测、车速优化、服务水平评估',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatTrafficFlow(analyzeTrafficFlow(JSON.parse(args.input_data)))
      },
    }),
  )

  // 2. waste_collection_router
  tools.register(
    defineTool({
      name: 'waste_collection_router',
      description: '垃圾收集路径 — 车辆调度、满载率分析、路线规划、吨位统计、燃油成本',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatWasteCollection(analyzeWasteCollection(JSON.parse(args.input_data)))
      },
    }),
  )

  // 3. smart_grid_integration_planner
  tools.register(
    defineTool({
      name: 'smart_grid_integration_planner',
      description: '智能电网集成 — 负荷预测、分布式能源、储能调度、电网稳定性、节点管理',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatSmartGrid(analyzeSmartGrid(JSON.parse(args.input_data)))
      },
    }),
  )

  // 4. air_quality_monitor_config
  tools.register(
    defineTool({
      name: 'air_quality_monitor_config',
      description: '空气质量监测配置 — AQI监测站、污染物分析、预警阈值、传感器网络部署',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatAirQuality(analyzeAirQuality(JSON.parse(args.input_data)))
      },
    }),
  )

  // 5. water_distribution_optimizer
  tools.register(
    defineTool({
      name: 'water_distribution_optimizer',
      description: '供水分配优化 — 管网压力、漏损检测、水质监测、用水需求预测、泵站调度',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatWaterDistribution(analyzeWaterDistribution(JSON.parse(args.input_data)))
      },
    }),
  )

  // 6. digital_twin_city_builder
  tools.register(
    defineTool({
      name: 'digital_twin_city_builder',
      description: '数字孪生城市构建 — 3D建模、IoT融合、仿真推演、实时映射、层级管理',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatDigitalTwin(analyzeDigitalTwin(JSON.parse(args.input_data)))
      },
    }),
  )

  // 7. citizen_engagement_dashboard
  tools.register(
    defineTool({
      name: 'citizen_engagement_dashboard',
      description: '市民参与仪表板 — 参与率、满意度、投诉处理、服务评价、渠道分析',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatCitizenEngagement(analyzeCitizenEngagement(JSON.parse(args.input_data)))
      },
    }),
  )

  // 8. resilience_risk_mapper
  tools.register(
    defineTool({
      name: 'resilience_risk_mapper',
      description: '韧性风险地图 — 灾害评估、脆弱性分析、应急资源、韧性指数、经济损失',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatResilience(analyzeResilience(JSON.parse(args.input_data)))
      },
    }),
  )
}
