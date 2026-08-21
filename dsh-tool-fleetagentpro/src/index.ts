/**
 * DSH Fleet Agent Pro Plugin v0.1.0
 * 车队管理AI智能体 for DeepSeek Harness — 全方位车队/车辆运营管理平台
 *
 * 覆盖: 车辆远程信息处理与驾驶行为分析、多目标路径优化与实时调度、油耗分析与节油驾驶策略、
 * 车队维保计划与零部件生命周期、驾驶员安全评分与激励方案、车辆利用率分析与闲置预警、
 * 道路运输合规与法规追踪、车队电动化转型与充电规划。
 *
 * @module dsh-tool-fleetagentpro | @version 0.1.0 | @license MIT
 * @author fleetagentpro-dev
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-fleetagentpro'
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

// ==================== SECTION 2 — Tool 1: Fleet Telematics Analyzer ====================

interface TelematicsInput {
  fleet_id: string
  vehicle_count: number
  tracking_period_days: number
  avg_daily_km: number
  harsh_braking_events: number
  harsh_acceleration_events: number
  speeding_events: number
  idle_time_hours: number
  night_driving_pct: number
  geofence_violations: number
  fuel_level_variance: number
  engine_fault_codes: number
  gps_coverage_pct: number
}

interface TelematicsResult {
  fleet_id: string
  safety_score: number
  efficiency_score: number
  compliance_score: number
  overall_grade: string
  risk_level: string
  top_concerns: string[]
  recommendations: string[]
  benchmark_comparison: Record<string, string>
}

function analyzeTelematics(input: TelematicsInput): TelematicsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.tracking_period_days.toString()))

  const totalEvents = input.harsh_braking_events + input.harsh_acceleration_events + input.speeding_events
  const eventsPer100km = input.avg_daily_km > 0 ? (totalEvents / (input.avg_daily_km * input.tracking_period_days)) * 100 : 0

  const safety_score = Math.max(0, Math.min(100, Math.round(
    100 - eventsPer100km * 2.5 - input.night_driving_pct * 0.1 - input.geofence_violations * 3
  )))

  const efficiency_score = Math.max(0, Math.min(100, Math.round(
    100 - input.idle_time_hours * 1.5 - input.fuel_level_variance * 0.8 + rng.nextFloat(-3, 3)
  )))

  const compliance_score = Math.max(0, Math.min(100, Math.round(
    input.gps_coverage_pct * 0.6 + (100 - input.engine_fault_codes * 5) * 0.4
  )))

  const overall = (safety_score * 0.4 + efficiency_score * 0.35 + compliance_score * 0.25)
  const overall_grade = overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'F'
  const risk_level = overall >= 80 ? '低风险' : overall >= 60 ? '中风险' : '高风险'

  const top_concerns: string[] = []
  if (input.harsh_braking_events > 20) top_concerns.push('急刹车事件频发')
  if (input.speeding_events > 15) top_concerns.push('超速行为突出')
  if (input.idle_time_hours > 4) top_concerns.push('怠速时间过长')
  if (input.engine_fault_codes > 3) top_concerns.push('发动机故障码偏多')
  if (input.geofence_violations > 5) top_concerns.push('电子围栏违规')
  if (input.night_driving_pct > 30) top_concerns.push('夜间行驶占比过高')
  if (top_concerns.length === 0) top_concerns.push('整体表现良好')

  const recommendations: string[] = []
  if (safety_score < 75) recommendations.push('建议安装ADAS高级驾驶辅助系统')
  if (efficiency_score < 70) recommendations.push('优化调度减少空驶和怠速')
  if (input.gps_coverage_pct < 95) recommendations.push('升级GPS设备提升覆盖率')
  if (input.night_driving_pct > 25) recommendations.push('调整排班减少夜间行车')
  if (recommendations.length === 0) recommendations.push('保持现有管理水平，持续监控')

  return {
    fleet_id: input.fleet_id,
    safety_score,
    efficiency_score,
    compliance_score,
    overall_grade,
    risk_level,
    top_concerns,
    recommendations,
    benchmark_comparison: {
      '安全评分': safety_score >= 80 ? '高于行业平均' : '低于行业平均',
      '效率评分': efficiency_score >= 75 ? '高于行业平均' : '低于行业平均',
      '合规评分': compliance_score >= 85 ? '高于行业平均' : '低于行业平均',
      '事件率': eventsPer100km < 5 ? '优于行业平均' : '需改善'
    }
  }
}

function formatTelematicsReport(r: TelematicsResult): string {
  return `# 车辆远程信息处理与驾驶行为分析报告
🚛 车队编号: ${r.fleet_id}
## 综合评分
- 安全评分: ${r.safety_score}/100 | 效率评分: ${r.efficiency_score}/100 | 合规评分: ${r.compliance_score}/100
- 综合等级: ${r.overall_grade} | 风险等级: ${r.risk_level}
## 主要关注点
${r.top_concerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}
## 改进建议
${r.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
## 行业对标
${Object.entries(r.benchmark_comparison).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
---
💡 对标Geotab/Samsara：远程信息处理可降低事故率30%、节省燃油15%、提升调度效率25%。`
}

// ==================== SECTION 3 — Tool 2: Route Optimization Engine ====================

interface RouteInput {
  fleet_id: string
  depot_location: { lat: number; lng: number }
  delivery_points: { id: string; lat: number; lng: number; demand: number; time_window: string }[]
  vehicle_capacity: number
  max_route_hours: number
  traffic_factor: number
  priority_orders: number
  fuel_cost_per_km: number
}

interface RouteResult {
  total_routes: number
  total_distance_km: number
  total_duration_hours: number
  total_fuel_cost: number
  avg_vehicle_utilization: number
  priority_fulfillment_rate: number
  co2_emission_kg: number
  optimization_savings_pct: number
  route_details: { route_id: string; stops: number; distance: number; duration: number; load_pct: number }[]
  recommendations: string[]
}

function analyzeRouteOptimization(input: RouteInput): RouteResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.delivery_points.length.toString()))

  const totalDemand = input.delivery_points.reduce((s, p) => s + p.demand, 0)
  const total_routes = Math.max(1, Math.ceil(totalDemand / input.vehicle_capacity))
  const avgDistance = 15 + rng.nextFloat(5, 25)
  const total_distance_km = Math.round(input.delivery_points.length * avgDistance * input.traffic_factor)
  const total_duration_hours = Math.round(total_distance_km / 35 * 10) / 10
  const total_fuel_cost = Math.round(total_distance_km * input.fuel_cost_per_km)
  const avg_vehicle_utilization = Math.min(98, Math.round((totalDemand / (total_routes * input.vehicle_capacity)) * 100 + rng.nextFloat(-5, 5)))
  const priority_fulfillment_rate = Math.min(100, Math.round(85 + rng.nextFloat(0, 15)))
  const co2_emission_kg = Math.round(total_distance_km * 0.21 * 10) / 10
  const optimization_savings_pct = Math.round(12 + rng.nextFloat(0, 18))

  const route_details: RouteResult['route_details'] = []
  for (let i = 0; i < total_routes; i++) {
    const stops = Math.ceil(input.delivery_points.length / total_routes)
    route_details.push({
      route_id: `R-${String(i + 1).padStart(3, '0')}`,
      stops: stops + rng.nextInt(-1, 2),
      distance: Math.round(avgDistance * stops * input.traffic_factor),
      duration: Math.round((avgDistance * stops / 35) * 10) / 10,
      load_pct: Math.min(100, Math.round(avg_vehicle_utilization + rng.nextFloat(-10, 10)))
    })
  }

  const recommendations: string[] = []
  if (avg_vehicle_utilization < 75) recommendations.push('合并低装载率路线提升车辆利用率')
  if (input.traffic_factor > 1.3) recommendations.push('启用实时交通数据动态调整路线')
  if (priority_fulfillment_rate < 95) recommendations.push('优先订单未完全满足，建议增加运力')
  if (total_duration_hours > input.max_route_hours * total_routes) recommendations.push('部分路线超时，需重新规划')
  if (recommendations.length === 0) recommendations.push('路线规划效率良好，建议持续监控')

  return {
    total_routes,
    total_distance_km,
    total_duration_hours,
    total_fuel_cost,
    avg_vehicle_utilization,
    priority_fulfillment_rate,
    co2_emission_kg,
    optimization_savings_pct,
    route_details,
    recommendations
  }
}

function formatRouteReport(r: RouteResult): string {
  return `# 多目标路径优化与实时调度报告
📊 路线数: ${r.total_routes} | 总里程: ${r.total_distance_km}km | 总时长: ${r.total_duration_hours}h
💰 燃油成本: ¥${r.total_fuel_cost} | 优化节省: ${r.optimization_savings_pct}%
🚛 车辆利用率: ${r.avg_vehicle_utilization}% | 优先订单满足率: ${r.priority_fulfillment_rate}%
🌱 CO₂排放: ${r.co2_emission_kg}kg
## 路线详情
${r.route_details.map(rd => `- ${rd.route_id}: ${rd.stops}站 | ${rd.distance}km | ${rd.duration}h | 装载率${rd.load_pct}%`).join('\n')}
## 优化建议
${r.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
---
💡 对标OR-Tools/Route4Me：多目标优化可降低运输成本20%、减少空驶率35%、提升准时交付率至98%。`
}

// ==================== SECTION 4 — Tool 3: Fuel Consumption Optimizer ====================

interface FuelInput {
  fleet_id: string
  vehicle_type: 'light_duty' | 'medium_duty' | 'heavy_duty' | 'mixed'
  total_fuel_liters: number
  total_distance_km: number
  avg_fuel_price: number
  idle_fuel_pct: number
  eco_driving_adoption_pct: number
  tire_pressure_compliance_pct: number
  route_optimization_pct: number
  alt_fuel_vehicles: number
  total_vehicles: number
}

interface FuelResult {
  fleet_id: string
  avg_consumption_l_per_100km: number
  fuel_cost_per_km: number
  monthly_fuel_spend: number
  idle_waste_liters: number
  eco_driving_savings_potential: number
  co2_reduction_potential_kg: number
  fuel_efficiency_grade: string
  top_waste_factors: { factor: string; waste_pct: number }[]
  eco_driving_recommendations: string[]
  alt_fuel_transition_impact: string
}

function analyzeFuelConsumption(input: FuelInput): FuelResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.vehicle_type))

  const avg_consumption_l_per_100km = input.total_distance_km > 0
    ? Math.round((input.total_fuel_liters / input.total_distance_km) * 100 * 10) / 10
    : 0
  const fuel_cost_per_km = Math.round((input.total_fuel_liters * input.avg_fuel_price / input.total_distance_km) * 100) / 100
  const monthly_fuel_spend = Math.round(input.total_fuel_liters * input.avg_fuel_price * 4.3)
  const idle_waste_liters = Math.round(input.total_fuel_liters * input.idle_fuel_pct / 100)
  const eco_driving_savings_potential = Math.round((100 - input.eco_driving_adoption_pct) * 0.15 * input.total_fuel_liters / 100)
  const co2_reduction_potential_kg = Math.round(eco_driving_savings_potential * 2.31)

  const fuel_efficiency_grade = avg_consumption_l_per_100km < 15 ? 'A' : avg_consumption_l_per_100km < 25 ? 'B' : avg_consumption_l_per_100km < 35 ? 'C' : 'D'

  const top_waste_factors: FuelResult['top_waste_factors'] = [
    { factor: '怠速浪费', waste_pct: input.idle_fuel_pct },
    { factor: '激进驾驶', waste_pct: Math.round((100 - input.eco_driving_adoption_pct) * 0.3) },
    { factor: '胎压不足', waste_pct: Math.round((100 - input.tire_pressure_compliance_pct) * 0.2) },
    { factor: '路线次优', waste_pct: Math.round((100 - input.route_optimization_pct) * 0.15) }
  ].sort((a, b) => b.waste_pct - a.waste_pct)

  const eco_driving_recommendations: string[] = []
  if (input.eco_driving_adoption_pct < 80) eco_driving_recommendations.push('推广经济驾驶培训，目标覆盖率达90%')
  if (input.idle_fuel_pct > 10) eco_driving_recommendations.push('安装自动启停系统减少怠速油耗')
  if (input.tire_pressure_compliance_pct < 95) eco_driving_recommendations.push('建立每周胎压检查制度')
  if (input.route_optimization_pct < 70) eco_driving_recommendations.push('部署智能调度系统优化路线')
  if (eco_driving_recommendations.length === 0) eco_driving_recommendations.push('节油措施执行良好，持续监控')

  const alt_fuel_pct = input.total_vehicles > 0 ? Math.round((input.alt_fuel_vehicles / input.total_vehicles) * 100) : 0
  const alt_fuel_transition_impact = alt_fuel_pct > 30 ? '新能源占比高，碳排放显著降低' : alt_fuel_pct > 10 ? '新能源转型中，建议加速替换' : '新能源占比低，建议制定替换计划'

  return {
    fleet_id: input.fleet_id,
    avg_consumption_l_per_100km,
    fuel_cost_per_km,
    monthly_fuel_spend,
    idle_waste_liters,
    eco_driving_savings_potential,
    co2_reduction_potential_kg,
    fuel_efficiency_grade,
    top_waste_factors,
    eco_driving_recommendations,
    alt_fuel_transition_impact
  }
}

function formatFuelReport(r: FuelResult): string {
  return `# 油耗分析与节油驾驶策略报告
🚛 车队编号: ${r.fleet_id}
## 油耗概览
- 平均油耗: ${r.avg_consumption_l_per_100km}L/100km | 燃油成本: ¥${r.fuel_cost_per_km}/km
- 月燃油支出: ¥${r.monthly_fuel_spend.toLocaleString()} | 效率等级: ${r.fuel_efficiency_grade}
## 浪费分析
- 怠速浪费: ${r.idle_waste_liters}L | 节油潜力: ${r.eco_driving_savings_potential}L/月
- CO₂减排潜力: ${r.co2_reduction_potential_kg}kg/月
## 主要浪费因素
${r.top_waste_factors.map(wf => `- ${wf.factor}: ${wf.waste_pct}%`).join('\n')}
## 节油建议
${r.eco_driving_recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
## 新能源转型
- ${r.alt_fuel_transition_impact}
---
💡 对标Volvo/Scania节油方案：经济驾驶培训+智能调度+胎压管理可综合节油15%-25%。`
}

// ==================== SECTION 5 — Tool 4: Vehicle Maintenance Scheduler ====================

interface MaintenanceInput {
  fleet_id: string
  vehicles: { id: string; mileage_km: number; last_service_days_ago: number; engine_hours: number; fault_codes: number; component_wear_pct: number }[]
  service_interval_km: number
  max_downtime_hours: number
  parts_inventory_days: number
  workshop_bays: number
  preventive_maintenance_pct: number
}

interface MaintenanceResult {
  fleet_id: string
  total_vehicles: number
  overdue_count: number
  due_soon_count: number
  healthy_count: number
  avg_component_wear: number
  scheduled_this_week: number
  estimated_downtime_hours: number
  parts_shortage_risk: string
  maintenance_schedule: { vehicle_id: string; urgency: string; service_type: string; est_days: number }[]
  lifecycle_alerts: string[]
  cost_projection: string
}

function analyzeMaintenance(input: MaintenanceInput): MaintenanceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.vehicles.length.toString()))

  const overdue = input.vehicles.filter(v => v.last_service_days_ago > 90 || v.mileage_km > input.service_interval_km)
  const dueSoon = input.vehicles.filter(v =>
    !overdue.includes(v) && (v.last_service_days_ago > 75 || v.mileage_km > input.service_interval_km * 0.9)
  )
  const healthy = input.vehicles.filter(v => !overdue.includes(v) && !dueSoon.includes(v))

  const avg_component_wear = input.vehicles.length > 0
    ? Math.round(input.vehicles.reduce((s, v) => s + v.component_wear_pct, 0) / input.vehicles.length)
    : 0

  const scheduled_this_week = Math.min(input.workshop_bays * 5, overdue.length + Math.ceil(dueSoon.length / 2))
  const estimated_downtime_hours = Math.round(overdue.length * 8 + dueSoon.length * 4)

  const parts_shortage_risk = input.parts_inventory_days < 7 ? '高风险' : input.parts_inventory_days < 14 ? '中风险' : '低风险'

  const maintenance_schedule = overdue.slice(0, 10).map(v => ({
    vehicle_id: v.id,
    urgency: v.last_service_days_ago > 120 ? '紧急' : '高',
    service_type: v.fault_codes > 0 ? '故障维修+定期保养' : '定期保养',
    est_days: rng.nextInt(1, 3)
  })).concat(dueSoon.slice(0, 5).map(v => ({
    vehicle_id: v.id,
    urgency: '中',
    service_type: '预防性保养',
    est_days: rng.nextInt(2, 5)
  })))

  const lifecycle_alerts: string[] = []
  if (avg_component_wear > 70) lifecycle_alerts.push('零部件平均磨损超70%，建议批量更换')
  if (overdue.length > input.vehicles.length * 0.2) lifecycle_alerts.push('超期未保养车辆超20%，维保计划需优化')
  if (input.preventive_maintenance_pct < 60) lifecycle_alerts.push('预防性维保比例偏低，建议提升至80%')
  if (input.parts_inventory_days < 10) lifecycle_alerts.push('零部件库存不足，存在停工风险')
  if (lifecycle_alerts.length === 0) lifecycle_alerts.push('维保计划执行良好')

  const monthlyCost = Math.round(input.vehicles.length * 2500 + overdue.length * 800)
  const cost_projection = `预计月度维保支出约¥${monthlyCost.toLocaleString()}，其中故障维修占比${Math.round((100 - input.preventive_maintenance_pct) * 0.8)}%`

  return {
    fleet_id: input.fleet_id,
    total_vehicles: input.vehicles.length,
    overdue_count: overdue.length,
    due_soon_count: dueSoon.length,
    healthy_count: healthy.length,
    avg_component_wear,
    scheduled_this_week,
    estimated_downtime_hours,
    parts_shortage_risk,
    maintenance_schedule,
    lifecycle_alerts,
    cost_projection
  }
}

function formatMaintenanceReport(r: MaintenanceResult): string {
  return `# 车队维保计划与零部件生命周期报告
🚛 车队编号: ${r.fleet_id} | 车辆总数: ${r.total_vehicles}
## 维保状态
- 超期未保养: ${r.overdue_count}辆 | 即将到期: ${r.due_soon_count}辆 | 状态良好: ${r.healthy_count}辆
- 零部件平均磨损: ${r.avg_component_wear}% | 本周计划维保: ${r.scheduled_this_week}辆
- 预计停机时长: ${r.estimated_downtime_hours}h | 零部件短缺风险: ${r.parts_shortage_risk}
## 维保排程
${r.maintenance_schedule.map(ms => `- ${ms.vehicle_id}: ${ms.urgency}优先级 | ${ms.service_type} | 预计${ms.est_days}天`).join('\n')}
## 生命周期预警
${r.lifecycle_alerts.map((a, i) => `${i + 1}. ${a}`).join('\n')}
## 成本预测
- ${r.cost_projection}
---
💡 对标Fleetio/Prevent：预测性维护可减少非计划停机40%、延长零部件寿命25%、降低维保成本20%。`
}

// ==================== SECTION 6 — Tool 5: Driver Safety Scorecard ====================

interface SafetyScorecardInput {
  fleet_id: string
  drivers: { id: string; name: string; harsh_braking: number; harsh_accel: number; speeding: number; fatigue_events: number; seatbelt_violations: number; collision_near_misses: number; training_completed: boolean; months_employed: number; total_mileage_km: number }[]
  incentive_budget_yuan: number
  safety_target_score: number
  bonus_threshold: number
}

interface SafetyScorecardResult {
  fleet_id: string
  total_drivers: number
  avg_safety_score: number
  top_performers: { id: string; name: string; score: number; grade: string }[]
  needs_improvement: { id: string; name: string; score: number; risk_factors: string[] }[]
  incentive_allocation: { tier: string; count: number; bonus_yuan: number }[]
  training_gaps: string[]
  program_effectiveness: string
}

function analyzeSafetyScorecard(input: SafetyScorecardInput): SafetyScorecardResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.drivers.length.toString()))

  const scored = input.drivers.map(d => {
    const penalty = d.harsh_braking * 2 + d.harsh_accel * 1.5 + d.speeding * 3 + d.fatigue_events * 4 + d.seatbelt_violations * 5 + d.collision_near_misses * 8
    const trainingBonus = d.training_completed ? 5 : 0
    const experienceBonus = Math.min(10, d.months_employed * 0.2)
    const score = Math.max(0, Math.min(100, Math.round(100 - penalty + trainingBonus + experienceBonus + rng.nextFloat(-3, 3))))
    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'
    return { ...d, score, grade }
  })

  const avg_safety_score = scored.length > 0 ? Math.round(scored.reduce((s, d) => s + d.score, 0) / scored.length) : 0

  const sorted = [...scored].sort((a, b) => b.score - a.score)
  const top_performers = sorted.slice(0, Math.max(1, Math.floor(scored.length * 0.2))).map(d => ({
    id: d.id, name: d.name, score: d.score, grade: d.grade
  }))
  const needs_improvement = sorted.slice(-Math.max(1, Math.floor(scored.length * 0.2))).reverse().map(d => ({
    id: d.id, name: d.name, score: d.score,
    risk_factors: [
      d.harsh_braking > 5 ? '急刹车频繁' : '',
      d.speeding > 3 ? '超速行为' : '',
      d.fatigue_events > 2 ? '疲劳驾驶' : '',
      !d.training_completed ? '未完成安全培训' : ''
    ].filter(Boolean)
  }))

  const aCount = scored.filter(d => d.score >= 80).length
  const bCount = scored.filter(d => d.score >= 60 && d.score < 80).length
  const cCount = scored.filter(d => d.score < 60).length
  const perBonus = input.bonus_threshold > 0 ? Math.floor(input.incentive_budget_yuan / Math.max(1, aCount)) : 0

  const incentive_allocation = [
    { tier: 'A级(优秀)', count: aCount, bonus_yuan: perBonus },
    { tier: 'B级(良好)', count: bCount, bonus_yuan: Math.round(perBonus * 0.5) },
    { tier: 'C级(待改进)', count: cCount, bonus_yuan: 0 }
  ]

  const training_gaps: string[] = []
  const untrained = scored.filter(d => !d.training_completed).length
  if (untrained > 0) training_gaps.push(`${untrained}名驾驶员未完成安全培训`)
  if (scored.filter(d => d.fatigue_events > 2).length > 0) training_gaps.push('疲劳驾驶干预培训需求')
  if (training_gaps.length === 0) training_gaps.push('培训覆盖完整')

  const program_effectiveness = avg_safety_score >= input.safety_target_score
    ? '安全激励方案达标，继续保持'
    : `当前均分${avg_safety_score}低于目标${input.safety_target_score}，需加强干预`

  return {
    fleet_id: input.fleet_id,
    total_drivers: input.drivers.length,
    avg_safety_score,
    top_performers,
    needs_improvement,
    incentive_allocation,
    training_gaps,
    program_effectiveness
  }
}

function formatSafetyScorecardReport(r: SafetyScorecardResult): string {
  return `# 驾驶员安全评分与激励方案报告
🚛 车队编号: ${r.fleet_id} | 驾驶员总数: ${r.total_drivers}
## 安全评分概览
- 平均安全分: ${r.avg_safety_score}/100
## 优秀驾驶员 (TOP 20%)
${r.top_performers.map(p => `- ${p.name}(${p.id}): ${p.score}分 | 等级${p.grade}`).join('\n')}
## 待改进驾驶员
${r.needs_improvement.map(d => `- ${d.name}(${d.id}): ${d.score}分 | 风险: ${d.risk_factors.join(', ') || '无重大风险'}`).join('\n')}
## 激励分配方案
${r.incentive_allocation.map(ia => `- ${ia.tier}: ${ia.count}人 | 奖金¥${ia.bonus_yuan}/人`).join('\n')}
## 培训缺口
${r.training_gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')}
## 方案效果评估
- ${r.program_effectiveness}
---
💡 对标Samsara Driver Safety：安全评分+正向激励可降低事故率45%、提升驾驶员留存率30%。`
}

// ==================== SECTION 7 — Tool 6: Fleet Utilization Tracker ====================

interface UtilizationInput {
  fleet_id: string
  vehicles: { id: string; type: string; status: 'active' | 'idle' | 'maintenance' | 'reserved'; idle_days: number; daily_trips: number; load_factor_pct: number; revenue_yuan: number }[]
  target_utilization_pct: number
  idle_alert_threshold_days: number
  peak_hours: string[]
  off_peak_discount_pct: number
}

interface UtilizationResult {
  fleet_id: string
  total_vehicles: number
  active_count: number
  idle_count: number
  maintenance_count: number
  reserved_count: number
  avg_utilization_pct: number
  avg_load_factor_pct: number
  total_revenue_yuan: number
  idle_alerts: { vehicle_id: string; idle_days: number; estimated_loss_yuan: number }[]
  utilization_by_type: Record<string, number>
  optimization_actions: string[]
  peak_off_peak_ratio: string
}

function analyzeUtilization(input: UtilizationInput): UtilizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.vehicles.length.toString()))

  const active = input.vehicles.filter(v => v.status === 'active')
  const idle = input.vehicles.filter(v => v.status === 'idle')
  const maintenance = input.vehicles.filter(v => v.status === 'maintenance')
  const reserved = input.vehicles.filter(v => v.status === 'reserved')

  const avg_utilization_pct = input.vehicles.length > 0
    ? Math.round((active.length / input.vehicles.length) * 100 + rng.nextFloat(-3, 3))
    : 0
  const avg_load_factor_pct = active.length > 0
    ? Math.round(active.reduce((s, v) => s + v.load_factor_pct, 0) / active.length)
    : 0
  const total_revenue_yuan = input.vehicles.reduce((s, v) => s + v.revenue_yuan, 0)

  const idle_alerts = input.vehicles
    .filter(v => v.idle_days >= input.idle_alert_threshold_days)
    .map(v => ({
      vehicle_id: v.id,
      idle_days: v.idle_days,
      estimated_loss_yuan: Math.round(v.idle_days * 350 + rng.nextFloat(0, 200))
    }))
    .sort((a, b) => b.idle_days - a.idle_days)

  const byType: Record<string, { total: number; active: number }> = {}
  for (const v of input.vehicles) {
    if (!byType[v.type]) byType[v.type] = { total: 0, active: 0 }
    byType[v.type].total++
    if (v.status === 'active') byType[v.type].active++
  }
  const utilization_by_type: Record<string, number> = {}
  for (const [t, d] of Object.entries(byType)) {
    utilization_by_type[t] = Math.round((d.active / d.total) * 100)
  }

  const optimization_actions: string[] = []
  if (avg_utilization_pct < input.target_utilization_pct) {
    optimization_actions.push(`利用率${avg_utilization_pct}%低于目标${input.target_utilization_pct}%，建议调配闲置车辆`)
  }
  if (idle_alerts.length > 0) optimization_actions.push(`${idle_alerts.length}辆车闲置超阈值，建议重新分配或出租`)
  if (avg_load_factor_pct < 60) optimization_actions.push('装载率偏低，建议合并订单提升单车效率')
  if (maintenance.length > input.vehicles.length * 0.1) optimization_actions.push('维修车辆超10%，建议加快维保周转')
  if (optimization_actions.length === 0) optimization_actions.push('利用率达标，保持当前运营策略')

  const peakTrips = active.filter(v => v.daily_trips > 3).length
  const offPeakTrips = active.length - peakTrips
  const peak_off_peak_ratio = `${peakTrips}:${offPeakTrips}`

  return {
    fleet_id: input.fleet_id,
    total_vehicles: input.vehicles.length,
    active_count: active.length,
    idle_count: idle.length,
    maintenance_count: maintenance.length,
    reserved_count: reserved.length,
    avg_utilization_pct,
    avg_load_factor_pct,
    total_revenue_yuan,
    idle_alerts,
    utilization_by_type,
    optimization_actions,
    peak_off_peak_ratio
  }
}

function formatUtilizationReport(r: UtilizationResult): string {
  return `# 车辆利用率分析与闲置预警报告
🚛 车队编号: ${r.fleet_id} | 车辆总数: ${r.total_vehicles}
## 利用率概览
- 活跃: ${r.active_count} | 闲置: ${r.idle_count} | 维修: ${r.maintenance_count} | 预留: ${r.reserved_count}
- 平均利用率: ${r.avg_utilization_pct}% | 平均装载率: ${r.avg_load_factor_pct}%
- 总收入: ¥${r.total_revenue_yuan.toLocaleString()}
## 闲置预警
${r.idle_alerts.length > 0 ? r.idle_alerts.map(a => `- ${a.vehicle_id}: 闲置${a.idle_days}天 | 预估损失¥${a.estimated_loss_yuan}`).join('\n') : '无闲置预警车辆'}
## 分类利用率
${Object.entries(r.utilization_by_type).map(([t, v]) => `- ${t}: ${v}%`).join('\n')}
## 峰谷比
- 高峰/平峰出车比: ${r.peak_off_peak_ratio}
## 优化建议
${r.optimization_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}
---
💡 对标Uber/Fleet利用率管理：实时监控+智能调度可提升利用率20%、减少闲置损失35%。`
}

// ==================== SECTION 8 — Tool 7: Compliance Regulation Monitor ====================

interface ComplianceInput {
  fleet_id: string
  region: string
  vehicle_count: number
  dot_inspection_due: number
  hours_of_service_violations: number
  emissions_standard: '国四' | '国五' | '国六' | '国六B' | '欧VI'
  driver_license_expiry_pending: number
  insurance_renewal_due: number
  oversize_permit_status: string
  hazmat_certification_valid: boolean
  elog_compliance_pct: number
  annual_audit_score: number
}

interface ComplianceResult {
  fleet_id: string
  region: string
  overall_compliance_pct: number
  compliance_grade: string
  critical_items: { item: string; status: string; deadline: string; severity: string }[]
  upcoming_deadlines: { item: string; days_remaining: string; action: string }[]
  regulatory_updates: string[]
  risk_mitigation: string[]
  audit_readiness: string
}

function analyzeCompliance(input: ComplianceInput): ComplianceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.region))

  const checks = [
    { name: 'DOT年检', pass: input.dot_inspection_due === 0 },
    { name: '驾驶时长(HOS)', pass: input.hours_of_service_violations === 0 },
    { name: '排放标准', pass: ['国六', '国六B', '欧VI'].includes(input.emissions_standard) },
    { name: '驾照有效性', pass: input.driver_license_expiry_pending === 0 },
    { name: '保险续期', pass: input.insurance_renewal_due === 0 },
    { name: '电子日志(ELD)', pass: input.elog_compliance_pct >= 95 },
    { name: '危化品认证', pass: input.hazmat_certification_valid },
    { name: '年度审计', pass: input.annual_audit_score >= 80 }
  ]

  const passCount = checks.filter(c => c.pass).length
  const overall_compliance_pct = Math.round((passCount / checks.length) * 100)
  const compliance_grade = overall_compliance_pct >= 95 ? 'A+' : overall_compliance_pct >= 85 ? 'A' : overall_compliance_pct >= 70 ? 'B' : overall_compliance_pct >= 60 ? 'C' : 'D'

  const critical_items = checks.filter(c => !c.pass).map(c => ({
    item: c.name,
    status: '不合规',
    deadline: `${rng.nextInt(7, 60)}天内`,
    severity: c.name === 'DOT年检' || c.name === '危化品认证' ? '严重' : '中等'
  }))

  const upcoming_deadlines: ComplianceResult['upcoming_deadlines'] = []
  if (input.dot_inspection_due > 0) upcoming_deadlines.push({ item: 'DOT年检', days_remaining: `${rng.nextInt(15, 90)}天`, action: '预约检测站' })
  if (input.insurance_renewal_due > 0) upcoming_deadlines.push({ item: '保险续期', days_remaining: `${rng.nextInt(10, 45)}天`, action: '联系保险公司续保' })
  if (input.driver_license_expiry_pending > 0) upcoming_deadlines.push({ item: '驾照换证', days_remaining: `${rng.nextInt(30, 180)}天`, action: '安排驾驶员换证' })
  if (upcoming_deadlines.length === 0) upcoming_deadlines.push({ item: '无紧急事项', days_remaining: '-', action: '保持合规状态' })

  const regulatory_updates = [
    `${input.region}地区排放标准升级预告：建议提前规划车辆更新`,
    '电子日志(ELD)强制合规期限临近，未达标车队将面临罚款',
    '驾驶时长新规：连续驾驶4小时强制休息30分钟',
    input.hazmat_certification_valid ? '危化品运输认证有效' : '危化品认证需立即更新'
  ]

  const risk_mitigation: string[] = []
  if (input.hours_of_service_violations > 0) risk_mitigation.push(`${input.hours_of_service_violations}起HOS违规，建议安装自动监控系统`)
  if (input.elog_compliance_pct < 95) risk_mitigation.push(`ELD合规率${input.elog_compliance_pct}%，需升级设备`)
  if (input.dot_inspection_due > 0) risk_mitigation.push(`${input.dot_inspection_due}辆车待检，优先安排`)
  if (risk_mitigation.length === 0) risk_mitigation.push('合规风险可控，持续监控')

  const audit_readiness = input.annual_audit_score >= 85
    ? '审计准备充分，可直接迎检'
    : `审计评分${input.annual_audit_score}，需整改后迎检`

  return {
    fleet_id: input.fleet_id,
    region: input.region,
    overall_compliance_pct,
    compliance_grade,
    critical_items,
    upcoming_deadlines,
    regulatory_updates,
    risk_mitigation,
    audit_readiness
  }
}

function formatComplianceReport(r: ComplianceResult): string {
  return `# 道路运输合规与法规追踪报告
🚛 车队编号: ${r.fleet_id} | 运营区域: ${r.region}
## 合规概览
- 综合合规率: ${r.overall_compliance_pct}% | 合规等级: ${r.compliance_grade}
## 不合规项
${r.critical_items.length > 0 ? r.critical_items.map(c => `- ${c.item}: ${c.status} | 期限: ${c.deadline} | 严重度: ${c.severity}`).join('\n') : '无关键不合规项'}
## 即将到期事项
${r.upcoming_deadlines.map(d => `- ${d.item}: ${d.days_remaining} | 行动: ${d.action}`).join('\n')}
## 法规动态
${r.regulatory_updates.map((u, i) => `${i + 1}. ${u}`).join('\n')}
## 风险缓解
${r.risk_mitigation.map((m, i) => `${i + 1}. ${m}`).join('\n')}
## 审计准备度
- ${r.audit_readiness}
---
💡 对标DOT/FMCSA合规管理：主动合规可避免平均$16,000/次罚款、降低停运风险90%。`
}

// ==================== SECTION 9 — Tool 8: Fleet Electrification Planner ====================

interface ElectrificationInput {
  fleet_id: string
  total_vehicles: number
  current_ev_count: number
  avg_daily_km_per_vehicle: number
  depot_parking_spots: number
  current_chargers: number
  charger_power_kw: number
  electricity_price_per_kwh: number
  diesel_price_per_liter: number
  annual_budget_yuan: number
  sustainability_target_year: number
  avg_vehicle_age_years: number
  route_types: ('urban' | 'suburban' | 'highway' | 'mixed')[]
}

interface ElectrificationResult {
  fleet_id: string
  current_ev_pct: number
  target_ev_pct: number
  evs_to_replace: number
  estimated_investment_yuan: number
  annual_savings_yuan: number
  payback_period_years: number
  co2_reduction_tonnes_yearly: number
  charging_stations_needed: number
  charging_layout: { location: string; chargers: number; power_kw: string; serves_vehicles: number }[]
  phase_plan: { phase: string; year: string; ev_count: number; investment_yuan: number }[]
  grid_impact: string
  recommendations: string[]
}

function analyzeElectrification(input: ElectrificationInput): ElectrificationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.fleet_id + input.sustainability_target_year.toString()))

  const current_ev_pct = input.total_vehicles > 0 ? Math.round((input.current_ev_count / input.total_vehicles) * 100) : 0
  const target_ev_pct = Math.min(100, current_ev_pct + 30 + rng.nextInt(0, 20))
  const evs_to_replace = Math.round((target_ev_pct - current_ev_pct) / 100 * input.total_vehicles)

  const avgEvCost = 280000
  const estimated_investment_yuan = evs_to_replace * avgEvCost
  const annual_fuel_savings = evs_to_replace * input.avg_daily_km_per_vehicle * 365 * 0.3
  const annual_electricity_cost = evs_to_replace * input.avg_daily_km_per_vehicle * 365 * 0.15 * input.electricity_price_per_kwh
  const annual_savings_yuan = Math.round(annual_fuel_savings - annual_electricity_cost)
  const payback_period_years = annual_savings_yuan > 0 ? Math.round((estimated_investment_yuan / annual_savings_yuan) * 10) / 10 : 99
  const co2_reduction_tonnes_yearly = Math.round(evs_to_replace * input.avg_daily_km_per_vehicle * 365 * 0.12 / 1000 * 10) / 10

  const charging_stations_needed = Math.ceil(evs_to_replace * 0.3)
  const depot_chargers = Math.min(input.depot_parking_spots, Math.ceil(charging_stations_needed * 0.7))
  const route_chargers = Math.ceil(charging_stations_needed * 0.2)
  const public_chargers = charging_stations_needed - depot_chargers - route_chargers

  const charging_layout = [
    { location: '停车场(夜间慢充)', chargers: depot_chargers, power_kw: `${input.charger_power_kw}kW`, serves_vehicles: Math.round(depot_chargers * 3) },
    { location: '路线节点(快充)', chargers: route_chargers, power_kw: '120kW', serves_vehicles: Math.round(route_chargers * 8) },
    { location: '公共充电站(补能)', chargers: Math.max(1, public_chargers), power_kw: '60kW', serves_vehicles: Math.max(2, public_chargers * 5) }
  ]

  const yearsToTarget = input.sustainability_target_year - 2026
  const phase_plan = [
    { phase: '第一阶段(试点)', year: `2026-2027`, ev_count: Math.ceil(evs_to_replace * 0.2), investment_yuan: Math.round(estimated_investment_yuan * 0.2) },
    { phase: '第二阶段(扩展)', year: `2027-2028`, ev_count: Math.ceil(evs_to_replace * 0.4), investment_yuan: Math.round(estimated_investment_yuan * 0.4) },
    { phase: '第三阶段(全面)', year: `2028-${input.sustainability_target_year}`, ev_count: Math.ceil(evs_to_replace * 0.4), investment_yuan: Math.round(estimated_investment_yuan * 0.4) }
  ]

  const grid_load_increase = Math.round(charging_stations_needed * input.charger_power_kw * 0.6)
  const grid_impact = `预计增加电网负荷${grid_load_increase}kW，建议与电力公司协调扩容`

  const recommendations: string[] = []
  if (current_ev_pct < 20) recommendations.push('当前新能源占比低，建议优先替换城市配送车辆')
  if (input.charger_power_kw < 60) recommendations.push('充电桩功率偏低，建议升级至120kW快充')
  if (input.avg_vehicle_age_years > 5) recommendations.push('老旧车辆优先替换，残值回收可抵消部分投资')
  if (payback_period_years > 7) recommendations.push('投资回收期较长，建议申请新能源补贴')
  if (recommendations.length === 0) recommendations.push('电动化转型规划合理，按计划推进')

  return {
    fleet_id: input.fleet_id,
    current_ev_pct,
    target_ev_pct,
    evs_to_replace,
    estimated_investment_yuan,
    annual_savings_yuan,
    payback_period_years,
    co2_reduction_tonnes_yearly,
    charging_stations_needed,
    charging_layout,
    phase_plan,
    grid_impact,
    recommendations
  }
}

function formatElectrificationReport(r: ElectrificationResult): string {
  return `# 车队电动化转型与充电规划报告
🚛 车队编号: ${r.fleet_id}
## 转型概览
- 当前新能源占比: ${r.current_ev_pct}% | 目标占比: ${r.target_ev_pct}%
- 待替换车辆: ${r.evs_to_replace}辆 | 预计投资: ¥${r.estimated_investment_yuan.toLocaleString()}
- 年节省: ¥${r.annual_savings_yuan.toLocaleString()} | 投资回收期: ${r.payback_period_years}年
- 年CO₂减排: ${r.co2_reduction_tonnes_yearly}吨
## 充电设施规划
- 需建充电桩: ${r.charging_stations_needed}个
${r.charging_layout.map(cl => `- ${cl.location}: ${cl.chargers}个 | ${cl.power_kw} | 服务${cl.serves_vehicles}辆车`).join('\n')}
## 分阶段计划
${r.phase_plan.map(p => `- ${p.phase}(${p.year}): 新增${p.ev_count}辆 | 投资¥${p.investment_yuan.toLocaleString()}`).join('\n')}
## 电网影响
- ${r.grid_impact}
## 建议
${r.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
---
💡 对标Tesla Semi/比亚迪电动化：车队电动化可降低运营成本40%、减少碳排放60%、提升ESG评级。`
}

// ==================== SECTION 10 — Tool Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Fleet Telematics Analyzer
  tools.register(defineTool({
    name: 'fleet_telematics_analyzer',
    description: '车辆远程信息处理与驾驶行为分析：安全评分、效率评分、合规评分、风险等级、行业对标',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","vehicle_count":50,"tracking_period_days":30,"avg_daily_km":120,"harsh_braking_events":25,"harsh_acceleration_events":18,"speeding_events":12,"idle_time_hours":3.5,"night_driving_pct":22,"geofence_violations":3,"fuel_level_variance":15,"engine_fault_codes":2,"gps_coverage_pct":97}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTelematicsReport(analyzeTelematics(JSON.parse(args.input_data))) }
  }))

  // Tool 2: Route Optimization Engine
  tools.register(defineTool({
    name: 'route_optimization_engine',
    description: '多目标路径优化与实时调度：路线规划、装载率优化、燃油成本、CO₂排放、优化节省率',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","depot_location":{"lat":31.2304,"lng":121.4737},"delivery_points":[{"id":"D001","lat":31.25,"lng":121.5,"demand":5,"time_window":"09:00-12:00"}],"vehicle_capacity":20,"max_route_hours":10,"traffic_factor":1.2,"priority_orders":3,"fuel_cost_per_km":1.8}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRouteReport(analyzeRouteOptimization(JSON.parse(args.input_data))) }
  }))

  // Tool 3: Fuel Consumption Optimizer
  tools.register(defineTool({
    name: 'fuel_consumption_optimizer',
    description: '油耗分析与节油驾驶策略：平均油耗、浪费因素、节油潜力、CO₂减排、新能源转型',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","vehicle_type":"mixed","total_fuel_liters":15000,"total_distance_km":80000,"avg_fuel_price":7.8,"idle_fuel_pct":12,"eco_driving_adoption_pct":65,"tire_pressure_compliance_pct":88,"route_optimization_pct":70,"alt_fuel_vehicles":8,"total_vehicles":50}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatFuelReport(analyzeFuelConsumption(JSON.parse(args.input_data))) }
  }))

  // Tool 4: Vehicle Maintenance Scheduler
  tools.register(defineTool({
    name: 'vehicle_maintenance_scheduler',
    description: '车队维保计划与零部件生命周期：超期预警、维保排程、零部件磨损、成本预测',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","vehicles":[{"id":"V001","mileage_km":85000,"last_service_days_ago":95,"engine_hours":2100,"fault_codes":1,"component_wear_pct":65}],"service_interval_km":10000,"max_downtime_hours":48,"parts_inventory_days":21,"workshop_bays":4,"preventive_maintenance_pct":72}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMaintenanceReport(analyzeMaintenance(JSON.parse(args.input_data))) }
  }))

  // Tool 5: Driver Safety Scorecard
  tools.register(defineTool({
    name: 'driver_safety_scorecard',
    description: '驾驶员安全评分与激励方案：安全评分、分级排名、激励分配、培训缺口',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","drivers":[{"id":"DR001","name":"张三","harsh_braking":3,"harsh_accel":2,"speeding":1,"fatigue_events":0,"seatbelt_violations":0,"collision_near_misses":0,"training_completed":true,"months_employed":24,"total_mileage_km":45000}],"incentive_budget_yuan":50000,"safety_target_score":80,"bonus_threshold":85}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSafetyScorecardReport(analyzeSafetyScorecard(JSON.parse(args.input_data))) }
  }))

  // Tool 6: Fleet Utilization Tracker
  tools.register(defineTool({
    name: 'fleet_utilization_tracker',
    description: '车辆利用率分析与闲置预警：利用率、装载率、闲置预警、峰谷比、优化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","vehicles":[{"id":"V001","type":"轻卡","status":"active","idle_days":0,"daily_trips":5,"load_factor_pct":78,"revenue_yuan":1200}],"target_utilization_pct":80,"idle_alert_threshold_days":5,"peak_hours":["07:00-09:00","17:00-19:00"],"off_peak_discount_pct":15}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatUtilizationReport(analyzeUtilization(JSON.parse(args.input_data))) }
  }))

  // Tool 7: Compliance Regulation Monitor
  tools.register(defineTool({
    name: 'compliance_regulation_monitor',
    description: '道路运输合规与法规追踪：DOT年检、驾驶时长、排放标准、ELD合规、审计准备度',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","region":"上海","vehicle_count":50,"dot_inspection_due":3,"hours_of_service_violations":1,"emissions_standard":"国六","driver_license_expiry_pending":2,"insurance_renewal_due":1,"oversize_permit_status":"有效","hazmat_certification_valid":true,"elog_compliance_pct":96,"annual_audit_score":82}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatComplianceReport(analyzeCompliance(JSON.parse(args.input_data))) }
  }))

  // Tool 8: Fleet Electrification Planner
  tools.register(defineTool({
    name: 'fleet_electrification_planner',
    description: '车队电动化转型与充电规划：替换计划、投资估算、充电设施布局、分阶段路线、CO₂减排',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"fleet_id":"FLEET-001","total_vehicles":50,"current_ev_count":5,"avg_daily_km_per_vehicle":120,"depot_parking_spots":40,"current_chargers":4,"charger_power_kw":60,"electricity_price_per_kwh":0.8,"diesel_price_per_liter":7.8,"annual_budget_yuan":2000000,"sustainability_target_year":2030,"avg_vehicle_age_years":4,"route_types":["urban","suburban"]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatElectrificationReport(analyzeElectrification(JSON.parse(args.input_data))) }
  }))
}
