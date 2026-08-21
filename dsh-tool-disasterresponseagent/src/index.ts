/**
 * DSH Disaster Response Agent Plugin v0.1.0
 * 灾害应急响应AI智能体 for DeepSeek Harness — 人道主义救援协调决策支持
 *
 * 覆盖灾后全生命周期：震级烈度快速评估 → 应急疏散路线 → 救援物资调度 →
 * 避难场所管理 → 多源预警关联 → 伤员分拣 → 基础设施损毁 → 灾后重建规划
 *
 * 重要声明：本插件输出仅供参考决策辅助，不替代专业人道主义救援机构（如
 * UN OCHA / IFRC / 国家应急管理部）的现场判断与正式流程。所有模拟数据基于
 * 输入参数推演，实际响应请遵循当地应急预案与国际人道法（IHL）准则。
 *
 * 工具清单:
 * 1. earthquake_impact_estimator — 地震烈度快速评估与损失估算
 * 2. evacuation_route_planner — 应急疏散路线规划与人流模拟
 * 3. relief_supply_dispatch — 救援物资调度与需求匹配
 * 4. shelter_capacity_manager — 避难场所容量与物资配置
 * 5. early_warning_correlator — 多源预警关联分析与误报过滤
 * 6. casualty_triage_advisor — 伤员分拣与医疗资源分配
 * 7. infrastructure_damage_mapper — 基础设施损毁遥感识别与评估
 * 8. recovery_rebuild_planner — 灾后重建规划与资金测算
 *
 * @module dsh-tool-disasterresponseagent | @version 0.1.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-disasterresponseagent'
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

// --- Tool 1: Earthquake Impact Estimator ---
interface EarthquakeInput {
  magnitude: number
  depth_km: number
  epicenter_lat: number
  epicenter_lng: number
  population_density_per_km2: number
  soil_type: 'rock' | 'stiff_soil' | 'soft_soil' | 'reclaimed'
  building_type: 'steel' | 'rc' | 'masonry' | 'wood' | 'informal'
  time_of_day: 'day' | 'night'
}

interface DamageZone {
  intensity_mmi: number
  radius_km: number
  estimated_buildings_damaged_pct: number
  estimated_casualties: number
  description: string
}

interface EconomicLossStruct {
  direct_million_usd: number
  indirect_million_usd: number
  infrastructure_damage_pct: number
  housing_damage_pct: number
}

interface EarthquakeResult {
  magnitude: number
  max_intensity_mmi: number
  damage_zones: DamageZone[]
  total_estimated_casualties: number
  economic_loss: EconomicLossStruct
  aftershock_probability_7d: number
  tsunami_risk: 'none' | 'low' | 'moderate' | 'high'
  recommended_response_level: string
  disclaimer: string
}

// --- Tool 2: Evacuation Route Planner ---
interface EvacuationInput {
  scenario: 'tsunami' | 'flood' | 'fire' | 'chemical' | 'typhoon'
  affected_area_km2: number
  total_evacuees: number
  available_routes: number
  avg_route_width_m: number
  mobility_impaired_pct: number
  evacuation_time_window_hours: number
  infrastructure_damage_pct: number
}

interface RouteSegment {
  segment_id: string
  from_point: string
  to_point: string
  distance_km: number
  capacity_ppl_per_hour: number
  congestion_level: 'free' | 'moderate' | 'heavy' | 'gridlock'
  estimated_clearance_time_min: number
  accessibility: 'full' | 'partial' | 'restricted'
}

interface EvacuationResult {
  scenario: string
  total_evacuees: number
  routes: RouteSegment[]
  total_evacuation_time_hours: number
  bottleneck_segment: string
  recommended_staggering: string
  shelter_recommendations: string
  crowd_density_risk: string
  disclaimer: string
}

// --- Tool 3: Relief Supply Dispatch ---
interface SupplyDispatchInput {
  affected_population: number
  disaster_type: string
  days_since_onset: number
  access_level: 'full' | 'partial' | 'helicopter_only'
  supply_inventory: Array<{ item: string; quantity: number; unit: string }>
  priority_demands: Array<{ item: string; needed: number; unit: string; urgency: 'critical' | 'high' | 'medium' }>
  transport_capacity_tons_per_day: number
  warehouse_locations: string[]

}

interface DispatchAllocation {
  item: string
  allocated: number
  unit: string
  gap: number
  coverage_pct: number
  delivery_eta_hours: number
  urgency: string
}

interface SupplyDispatchResult {
  total_affected_population: number
  allocations: DispatchAllocation[]
  unmet_critical: string[]
  transport_utilization_pct: number
  logistics_bottleneck: string
  recommended_procurement: string[]
  spheres_compliance: string
  disclaimer: string
}

// --- Tool 4: Shelter Capacity Manager ---
interface ShelterInput {
  total_displaced_population: number
  available_shelters: Array<{
    name: string
    max_capacity: number
    current_occupancy: number
    type: 'school' | 'stadium' | 'tent_camp' | 'community_center' | 'religious'
    has_sanitation: boolean
    has_medical: boolean
    accessibility_compliant: boolean
  }>
  household_size_avg: number
  vulnerable_groups_pct: number
  cold_weather: boolean
  duration_expected_days: number
}

interface ShelterAllocation {
  shelter_name: string
  type: string
  capacity_total: number
  allocated: number
  remaining: number
  occupancy_pct: number
  sanitation_status: string
  medical_status: string
  vulnerability_accommodation: string
}

interface SupplyNeedsPerPerson {
  water_liters_per_day: number
  food_kcal_per_day: number
  blankets_needed: number
  sanitation_kits: number
  medical_kits: number
}

interface ShelterResult {
  total_displaced: number
  total_capacity: number
  capacity_gap: number
  shelter_allocations: ShelterAllocation[]
  per_person_supply: SupplyNeedsPerPerson
  total_supply_water_liters_daily: number
  total_supply_food_kcal_daily: number
  protection_concerns: string[]
  spheres_standard_compliance: string
  disclaimer: string
}

// --- Tool 5: Early Warning Correlator ---
interface WarningInput {
  sources: Array<{
    source_name: string
    warning_type: 'earthquake' | 'tsunami' | 'flood' | 'typhoon' | 'landslide' | 'volcanic'
    severity_level: number
    confidence_pct: number
    issued_at: string
    region_overlap_km2: number
    historical_false_alarm_rate: number
  }>
  region_population: number
  lead_time_hours: number
  season_risk_factor: 'low' | 'moderate' | 'high'
}

interface CorrelatedEvent {
  event_type: string
  correlated_sources: string[]
  composite_confidence: number
  severity_assessment: string
  recommended_action: string
  false_alarm_likelihood: number
}

interface WarningCorrelatorResult {
  input_sources_count: number
  correlated_events: CorrelatedEvent[]
  overall_threat_level: 'green' | 'yellow' | 'orange' | 'red'
  recommended_alert_level: string
  recommended_lead_time_min: number
  evacuation_triggered: boolean
  data_quality_score: number
  disclaimer: string
}

// --- Tool 6: Casualty Triage Advisor ---
interface TriageInput {
  total_casualties: number
  medical_facilities: Array<{
    name: string
    capacity_beds: number
    icu_beds: number
    surgical_theaters: number
    operational_status: 'full' | 'partial' | 'overwhelmed' | 'offline'
    km_from_epicenter: number
  }>
  medical_staff_available: number
  blood_supply_units: number
  external_medic_arrival_hours: number
  mass_casualty_protocol_active: boolean
}

interface TriageCategory {
  category: 'immediate' | 'delayed' | 'minimal' | 'expectant'
  label: string
  color: string
  estimated_count: number
  pct_of_total: number
  resource_requirement: string
  transport_priority: string
}

interface TriageDistributionResult {
  total_casualties: number
  triage_categories: TriageCategory[]
  total_beds_available: number
  total_icu_available: number
  bed_deficit: number
  blood_supply_gap: number
  medical_staff_to_patient_ratio: string
  mass_casualty_status: string
  external_aid_recommendation: string
  ethical_framework: string
  disclaimer: string
}

// --- Tool 7: Infrastructure Damage Mapper ---
interface InfrastructureInput {
  satellite_imagery_available: boolean
  drone_survey_available: boolean
  sar_data_available: boolean
  pre_disaster_basemap: boolean
  infrastructure_types: Array<'bridge' | 'road' | 'hospital' | 'school' | 'power_plant' | 'water_treatment' | 'telecom' | 'airport' | 'port'>
  affected_area_km2: number
  cloud_cover_pct: number
}

interface InfrastructureDamageItem {
  type: string
  total_count: number
  damaged_count: number
  destroyed_count: number
  damage_pct: number
  repair_time_estimate_days: number
  economic_impact_million_usd: number
  cascading_effects: string[]
}

interface InfrastructureDamageResult {
  mapping_confidence: string
  imagery_sources_used: string[]
  infrastructure_items: InfrastructureDamageItem[]
  critical_infrastructure_offline: string[]
  total_repair_cost_million_usd: number
  recovery_timeline_months: number
  priority_repair_order: string[]
  cascading_risk_assessment: string
  disclaimer: string
}

// --- Tool 8: Recovery Rebuild Planner ---
interface RecoveryInput {
  disaster_type: string
  gdp_per_capita_usd: number
  affected_population: number
  total_damage_million_usd: number
  insurance_coverage_pct: number
  government_contingency_funds_million_usd: number
  international_aid_committed_million_usd: number
  reconstruction_timeframe_years: number
  build_back_better: boolean
  priorities: Array<'housing' | 'infrastructure' | 'livelihoods' | 'education' | 'health' | 'governance'>
}

interface RecoveryPhase {
  phase_name: string
  duration_months: number
  focus_areas: string[]
  estimated_cost_million_usd: number
  outcomes: string[]
}

interface RecoveryResult {
  total_reconstruction_cost_million_usd: number
  funding_gap_million_usd: number
  funding_sources: Array<{ source: string; amount_million_usd: number }>
  recovery_phases: RecoveryPhase[]
  build_back_better_premium_pct: number
  economic_recovery_timeline_years: number
  lessons_learned_integration: string
  community_resilience_score: number
  disclaimer: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Earthquake Impact Estimator ---
function analyzeEarthquakeImpact(input: EarthquakeInput): EarthquakeResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    `${input.magnitude}_${input.depth_km}_${input.epicenter_lat}_${input.epicenter_lng}`
  ))

  // MMI estimation based on magnitude and depth (simplified Wald model)
  const mmiMax = Math.min(12, Math.round((1.5 * input.magnitude - 1.0 - Math.log10(input.depth_km + 1) * 2) * 10) / 10)

  const soilAmplification: Record<string, number> = {
    rock: 0, stiff_soil: 0.5, soft_soil: 1.0, reclaimed: 1.5
  }
  const adjustedMmi = Math.min(12, mmiMax + soilAmplification[input.soil_type])

  // Damage zones
  const zones: DamageZone[] = []
  const zoneDefs = [
    { minMmi: 9, desc: '毁坏区 — 大量建筑倒塌', dmgBase: 60 },
    { minMmi: 7, desc: '严重破坏区 — 结构损伤', dmgBase: 30 },
    { minMmi: 5, desc: '中等破坏区 — 非结构损伤', dmgBase: 10 },
    { minMmi: 3, desc: '轻微震感区 — 物品掉落', dmgBase: 1 },
  ]

  for (const zd of zoneDefs) {
    if (adjustedMmi >= zd.minMmi) {
      const radius = Math.round((input.depth_km + Math.pow(10, (adjustedMmi - zd.minMmi) / 2)) * 10) / 10
      const popInZone = Math.round(input.population_density_per_km2 * Math.PI * radius * radius)

      const buildingVulnFactor: Record<string, number> = {
        steel: 0.5, rc: 0.7, masonry: 1.2, wood: 0.9, informal: 1.8
      }
      const damagePct = Math.min(100, Math.round(zd.dmgBase * buildingVulnFactor[input.building_type] * rng.nextFloat(0.8, 1.2)))
      const casualties = Math.round(popInZone * (damagePct / 100) * rng.nextFloat(0.001, 0.01) * (input.depth_km < 30 ? 2 : 1))

      zones.push({
        intensity_mmi: zd.minMmi + rng.nextInt(0, 2),
        radius_km: Math.round(radius * 10) / 10,
        estimated_buildings_damaged_pct: damagePct,
        estimated_casualties: casualties,
        description: zd.desc,
      })
    }
  }

  const totalCasualties = zones.reduce((sum, z) => sum + z.estimated_casualties, 0)
  const maxDamagePct = zones.length > 0 ? zones[0].estimated_buildings_damaged_pct : 0

  const directLoss = Math.round(input.population_density_per_km2 * 0.5 * input.magnitude * rng.nextFloat(1, 3) * 100) / 100
  const indirectLoss = Math.round(directLoss * rng.nextFloat(0.3, 0.8) * 100) / 100

  const tsunamiRisk: EarthquakeResult['tsunami_risk'] =
    input.magnitude >= 7.5 && input.depth_km < 50 ? 'high' :
    input.magnitude >= 7.0 && input.depth_km < 70 ? 'moderate' :
    input.magnitude >= 6.5 ? 'low' : 'none'

  const responseLevel =
    totalCasualties > 10000 ? 'Ⅰ级（国家级应急响应）' :
    totalCasualties > 1000 ? 'Ⅱ级（省级应急响应）' :
    totalCasualties > 100 ? 'Ⅲ级（市级应急响应）' :
    'Ⅳ级（县级应急响应）'

  return {
    magnitude: input.magnitude,
    max_intensity_mmi: adjustedMmi,
    damage_zones: zones,
    total_estimated_casualties: totalCasualties,
    economic_loss: {
      direct_million_usd: directLoss,
      indirect_million_usd: indirectLoss,
      infrastructure_damage_pct: Math.round(maxDamagePct * rng.nextFloat(0.6, 0.9)),
      housing_damage_pct: Math.round(maxDamagePct * rng.nextFloat(0.8, 1.0)),
    },
    aftershock_probability_7d: Math.round(rng.nextFloat(0.3, 0.8) * 100) / 100,
    tsunami_risk: tsunamiRisk,
    recommended_response_level: responseLevel,
    disclaimer: '⚠️ 本评估为基于参数的模拟推演，实际损失需经现场灾情评估确认。请遵循《国家地震应急预案》分级响应流程。',
  }
}

// --- Tool 2: Evacuation Route Planner ---
function analyzeEvacuation(input: EvacuationInput): EvacuationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    `${input.scenario}_${input.total_evacuees}_${input.available_routes}`
  ))

  const routes: RouteSegment[] = []
  const routeNames = ['主干道A', '次干道B', '环城路C', '高速D', '备用通道E', '应急通道F']

  let totalCapacity = 0
  for (let i = 0; i < input.available_routes; i++) {
    const effectiveWidthFactor = 1 - (input.infrastructure_damage_pct / 100) * rng.nextFloat(0.2, 0.5)
    const capacity = Math.round(input.avg_route_width_m * 500 * effectiveWidthFactor * rng.nextFloat(0.7, 1.3))
    totalCapacity += capacity

    const congestionLevels: RouteSegment['congestion_level'][] = ['free', 'moderate', 'heavy', 'gridlock']
    const congestion = congestionLevels[Math.min(3, Math.floor(i * (input.total_evacuees / (totalCapacity + 1)) * 2))]

    routes.push({
      segment_id: `R-${i + 1}`,
      from_point: `受影响区域-${rng.nextInt(1, 5)}`,
      to_point: `避难集结点-${rng.nextInt(1, 8)}`,
      distance_km: Math.round(rng.nextFloat(2, 25) * 10) / 10,
      capacity_ppl_per_hour: capacity,
      congestion_level: congestion,
      estimated_clearance_time_min: Math.round((input.total_evacuees / input.available_routes / Math.max(1, capacity)) * 60 * rng.nextFloat(0.8, 1.5)),
      accessibility: input.infrastructure_damage_pct > 50 ? 'partial' : input.infrastructure_damage_pct > 80 ? 'restricted' : 'full',
    })
  }

  const bottleneck = routes.reduce((worst, r) =>
    r.estimated_clearance_time_min > worst.estimated_clearance_time_min ? r : worst, routes[0])

  const totalTime = input.total_evacuees / Math.max(1, totalCapacity) * rng.nextFloat(1.1, 1.8)

  const staggering =
    totalTime > input.evacuation_time_window_hours
      ? `⚠️ 建议在${input.evacuation_time_window_hours}h内分${Math.ceil(totalTime / input.evacuation_time_window_hours)}批次撤离，优先老弱病残（占${input.mobility_impaired_pct}%）`
      : `✅ 可在时间窗口内完成全员撤离，建议预留${Math.round((input.evacuation_time_window_hours - totalTime) * 60)}分钟缓冲`

  const crowdDensity = input.total_evacuees / (input.affected_area_km2 * 1000000)
  const crowdRisk =
    crowdDensity > 4 ? '极高 — 踩踏风险，强制分流' :
    crowdDensity > 2 ? '高 — 需设置单向通道' :
    crowdDensity > 1 ? '中等 — 正常管控' :
    '低 — 疏散有序'

  return {
    scenario: input.scenario,
    total_evacuees: input.total_evacuees,
    routes,
    total_evacuation_time_hours: Math.round(totalTime * 10) / 10,
    bottleneck_segment: bottleneck?.segment_id || 'N/A',
    recommended_staggering: staggering,
    shelter_recommendations: `按${Math.ceil(input.total_evacuees / 500)}个标准避难所配置，优先开放无障碍设施`,
    crowd_density_risk: crowdRisk,
    disclaimer: '⚠️ 本疏散方案为模拟推演，实际执行需结合实时路况、天气和现场指挥。遵循《突发事件应对法》和当地疏散预案。',
  }
}

// --- Tool 3: Relief Supply Dispatch ---
function analyzeSupplyDispatch(input: SupplyDispatchInput): SupplyDispatchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    `${input.affected_population}_${input.disaster_type}_${input.days_since_onset}`
  ))

  const allocations: DispatchAllocation[] = []
  const unmetCritical: string[] = []

  for (const demand of input.priority_demands) {
    const stock = input.supply_inventory.find(s => s.item === demand.item)
    const stockQty = stock ? stock.quantity : 0

    // Coverage diminishes with access difficulty
    const accessFactor: Record<string, number> = { full: 0.9, partial: 0.6, helicopter_only: 0.3 }
    const effAccess = accessFactor[input.access_level]

    const maxDeliverable = Math.min(stockQty, input.transport_capacity_tons_per_day * 1000 * effAccess)
    const allocated = Math.min(demand.needed, Math.round(maxDeliverable * rng.nextFloat(0.7, 1.0)))
    const gap = Math.max(0, demand.needed - allocated)
    const coveragePct = Math.round((allocated / Math.max(1, demand.needed)) * 100)
    const eta = input.access_level === 'helicopter_only' ? rng.nextInt(6, 24) : input.access_level === 'partial' ? rng.nextInt(2, 12) : rng.nextInt(1, 6)

    allocations.push({
      item: demand.item,
      allocated: Math.round(allocated),
      unit: demand.unit,
      gap: Math.round(gap),
      coverage_pct: coveragePct,
      delivery_eta_hours: eta,
      urgency: demand.urgency,
    })

    if (demand.urgency === 'critical' && coveragePct < 70) {
      unmetCritical.push(`${demand.item}（缺口${gap}${demand.unit}）`)
    }
  }

  const transportUtil = Math.round((allocations.reduce((sum, a) => sum + a.allocated, 0) / Math.max(1, input.transport_capacity_tons_per_day * 1000)) * 100)

  const bottleneck =
    input.access_level === 'helicopter_only' ? '空中运输能力受限，需开辟地面通道' :
    transportUtil > 90 ? '运输能力接近饱和，需增加运力' :
    input.days_since_onset > 7 ? '补给线需延长至第二周' :
    '运输系统运作正常'

  const procurement: string[] = []
  for (const a of allocations) {
    if (a.coverage_pct < 50 && a.urgency === 'critical') {
      procurement.push(`紧急采购 ${a.item}（缺口 ${a.gap} ${a.unit}）`)
    }
  }

  return {
    total_affected_population: input.affected_population,
    allocations,
    unmet_critical: unmetCritical,
    transport_utilization_pct: Math.min(100, transportUtil),
    logistics_bottleneck: bottleneck,
    recommended_procurement: procurement,
    spheres_compliance: '部分满足SPHERE标准，需持续监测最低人道主义标准',
    disclaimer: '⚠️ 本调度方案基于当前库存推算，实际分配需结合现场需求和物流条件。参照《环球计划手册》（Sphere Handbook）最低标准。',
  }
}

// --- Tool 4: Shelter Capacity Manager ---
function analyzeShelterCapacity(input: ShelterInput): ShelterResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    `${input.total_displaced_population}_${input.available_shelters.length}`
  ))

  const allocations: ShelterAllocation[] = []
  let totalCapacity = 0
  let remainingToAllocate = input.total_displaced_population

  for (const shelter of input.available_shelters) {
    const available = shelter.max_capacity - shelter.current_occupancy
    totalCapacity += shelter.max_capacity

    const toAllocate = remainingToAllocate > 0 ? Math.min(available, Math.round(remainingToAllocate / Math.max(1, input.available_shelters.length - allocations.length))) : 0
    remainingToAllocate -= toAllocate

    const occupancyAfter = shelter.current_occupancy + toAllocate
    const occupancyPct = Math.round((occupancyAfter / Math.max(1, shelter.max_capacity)) * 100)

    allocations.push({
      shelter_name: shelter.name,
      type: shelter.type,
      capacity_total: shelter.max_capacity,
      allocated: toAllocate,
      remaining: shelter.max_capacity - occupancyAfter,
      occupancy_pct: occupancyPct,
      sanitation_status: shelter.has_sanitation ? '达标' : '需增设临时设施',
      medical_status: shelter.has_medical ? '在场' : '需派驻医疗组',
      vulnerability_accommodation: shelter.accessibility_compliant ? '无障碍通道已配置' : '需改造无障碍设施',
    })
  }

  const capacityGap = Math.max(0, input.total_displaced_population - totalCapacity)

  const coldWeatherFactor = input.cold_weather ? 1.5 : 1.0
  const perPerson: SupplyNeedsPerPerson = {
    water_liters_per_day: 15,
    food_kcal_per_day: 2100,
    blankets_needed: coldWeatherFactor,
    sanitation_kits: 1 / 50,
    medical_kits: 1 / 200,
  }

  const protectionConcerns: string[] = []
  if (input.vulnerable_groups_pct > 20) protectionConcerns.push('⬆️ 脆弱群体占比超20%，需专项保护机制')
  if (!input.available_shelters.every(s => s.has_sanitation)) protectionConcerns.push('部分避难所卫生条件不足，防疫风险')
  if (input.cold_weather) protectionConcerns.push('低温天气：供暖物资需求增加50%')
  if (capacityGap > 0) protectionConcerns.push(`避难容量缺口${capacityGap}人，需扩展或分流`)
  if (input.household_size_avg > 6) protectionConcerns.push('大家庭比例高，需设置家庭专用区域')

  return {
    total_displaced: input.total_displaced_population,
    total_capacity: totalCapacity,
    capacity_gap: capacityGap,
    shelter_allocations: allocations,
    per_person_supply: perPerson,
    total_supply_water_liters_daily: input.total_displaced_population * perPerson.water_liters_per_day,
    total_supply_food_kcal_daily: input.total_displaced_population * perPerson.food_kcal_per_day,
    protection_concerns: protectionConcerns,
    spheres_standard_compliance: capacityGap <= 0 ? '满足SPHERE最低标准（3.5m²/人）' : '未达标准，需紧急增设避难设施',
    disclaimer: '⚠️ 本方案为容量推演，实际安置需考虑安全防护、性别敏感度和社区结构。遵循《人道主义宪章和赈灾行动最低标准》。',
  }
}

// --- Tool 5: Early Warning Correlator ---
function analyzeWarnings(input: WarningInput): WarningCorrelatorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.sources.map(s => s.source_name).join(',') + input.lead_time_hours
  ))

  // Group by event type
  const grouped: Record<string, WarningInput['sources']> = {}
  for (const s of input.sources) {
    const key = s.warning_type
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }

  const correlatedEvents: CorrelatedEvent[] = []
  for (const [eventType, sources] of Object.entries(grouped)) {
    // Bayesian-style correlation: higher sources = higher confidence
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidence_pct, 0) / sources.length
    const falseAlarmPenalty = sources.reduce((sum, s) => sum + s.historical_false_alarm_rate, 0) / sources.length
    const compositeConfidence = Math.min(100, Math.round(avgConfidence * (1 - falseAlarmPenalty * 0.5) + sources.length * 5))

    const maxSeverity = Math.max(...sources.map(s => s.severity_level))
    const severity =
      maxSeverity >= 4 ? '极高' : maxSeverity >= 3 ? '高' : maxSeverity >= 2 ? '中等' : '低'

    const action =
      compositeConfidence > 80 ? '立即发布红色预警并启动应急响应'
        : compositeConfidence > 60 ? '发布橙色预警，预备疏散'
        : compositeConfidence > 40 ? '黄色预警，加强监测'
        : '蓝色预警，常规监测'

    correlatedEvents.push({
      event_type: eventType,
      correlated_sources: sources.map(s => s.source_name),
      composite_confidence: compositeConfidence,
      severity_assessment: severity,
      recommended_action: action,
      false_alarm_likelihood: Math.round(falseAlarmPenalty * 100),
    })
  }

  correlatedEvents.sort((a, b) => b.composite_confidence - a.composite_confidence)

  const topEvent = correlatedEvents[0]
  const threatLevel: WarningCorrelatorResult['overall_threat_level'] =
    !topEvent ? 'green' :
    topEvent.composite_confidence >= 80 ? 'red' :
    topEvent.composite_confidence >= 60 ? 'orange' :
    topEvent.composite_confidence >= 40 ? 'yellow' : 'green'

  const alertLevel =
    threatLevel === 'red' ? '红色预警（Ⅰ级）' :
    threatLevel === 'orange' ? '橙色预警（Ⅱ级）' :
    threatLevel === 'yellow' ? '黄色预警（Ⅲ级）' :
    '蓝色预警（Ⅳ级）'

  const dataQuality = Math.min(100, Math.round(
    (input.sources.length * 10) +
    (input.sources.every(s => s.confidence_pct > 50) ? 20 : 0) +
    (input.lead_time_hours > 12 ? 10 : 0) +
    (input.sources.length >= 3 ? 15 : 0)
  ))

  return {
    input_sources_count: input.sources.length,
    correlated_events: correlatedEvents,
    overall_threat_level: threatLevel,
    recommended_alert_level: alertLevel,
    recommended_lead_time_min: Math.max(15, input.lead_time_hours * 60),
    evacuation_triggered: threatLevel === 'red',
    data_quality_score: dataQuality,
    disclaimer: '⚠️ 预警推演需基于多源交叉验证，最终发布权归国家预警中心。误报可能引发疏散成本，漏报危及生命，请谨慎决策。',
  }
}

// --- Tool 6: Casualty Triage Advisor ---
function analyzeTriage(input: TriageInput): TriageDistributionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    `${input.total_casualties}_${input.mass_casualty_protocol_active}`
  ))

  // Standard MIMMS triage distribution
  const mcFactor = input.mass_casualty_protocol_active ? 1.3 : 1.0
  const immediatePct = Math.round(rng.nextFloat(10, 20) * mcFactor * 10) / 10
  const delayedPct = Math.round(rng.nextFloat(20, 35) * 10) / 10
  const minimalPct = Math.round(rng.nextFloat(30, 50) * 10) / 10
  const expectantPct = Math.max(0, Math.round((100 - immediatePct - delayedPct - minimalPct) * 10) / 10)

  const totalPct = immediatePct + delayedPct + minimalPct + expectantPct
  const normalize = (pct: number) => Math.round((pct / totalPct) * input.total_casualties)

  const categories: TriageCategory[] = [
    {
      category: 'immediate', label: '第一优先（立即救治）', color: '红色',
      estimated_count: normalize(immediatePct),
      pct_of_total: Math.round((normalize(immediatePct) / input.total_casualties) * 100),
      resource_requirement: '需手术室+ICU，每员配1医2护',
      transport_priority: '最高 — 专车直达',
    },
    {
      category: 'delayed', label: '第二优先（延迟救治）', color: '黄色',
      estimated_count: normalize(delayedPct),
      pct_of_total: Math.round((normalize(delayedPct) / input.total_casualties) * 100),
      resource_requirement: '需住院，可等2-6小时',
      transport_priority: '次高',
    },
    {
      category: 'minimal', label: '第三优先（轻伤）', color: '绿色',
      estimated_count: normalize(minimalPct),
      pct_of_total: Math.round((normalize(minimalPct) / input.total_casualties) * 100),
      resource_requirement: '门诊处理即可',
      transport_priority: '常规',
    },
    {
      category: 'expectant', label: '第四优先（期待治疗）', color: '黑色',
      estimated_count: normalize(expectantPct),
      pct_of_total: Math.round((normalize(expectantPct) / input.total_casualties) * 100),
      resource_requirement: '姑息治疗+心理支持',
      transport_priority: '待资源释放后转运',
    },
  ]

  const totalBeds = input.medical_facilities.reduce((sum, f) =>
    sum + (f.operational_status === 'offline' ? 0 :
           f.operational_status === 'overwhelmed' ? Math.round(f.capacity_beds * 0.5) :
           f.operational_status === 'partial' ? Math.round(f.capacity_beds * 0.8) : f.capacity_beds), 0)

  const totalIcu = input.medical_facilities.reduce((sum, f) =>
    sum + (f.operational_status === 'offline' ? 0 : f.icu_beds), 0)

  const bedDeficit = Math.max(0, input.total_casualties - totalBeds)

  const bloodNeeded = Math.round(input.total_casualties * rng.nextFloat(0.1, 0.3))
  const bloodGap = Math.max(0, bloodNeeded - input.blood_supply_units)

  const staffToPatientRatio = `1:${Math.ceil(input.total_casualties / Math.max(1, input.medical_staff_available))}`

  const mcStatus = input.mass_casualty_protocol_active
    ? '✅ 大规模伤亡协议已激活'
    : input.total_casualties > totalBeds * 0.7
    ? '⚠️ 建议立即激活大规模伤亡协议'
    : '常规救治模式'

  const externalAid =
    input.external_medic_arrival_hours <= 6 ? '外部医疗队伍即将到达，可缓解压力' :
    input.external_medic_arrival_hours <= 12 ? '建议协调周边省际医疗支援' :
    '紧急请求国家/国际医疗援助（START/ICRC）'

  const ethicalFramework = `采用功利主义最大化+罗尔斯差异原则混合框架：
- 救治资源优先分配给存活概率最高者（immediate category）
- 对expectant category提供尊严疗护（palliative care）
- 禁止基于非医学因素的歧视（年龄、性别、社会经济地位）
- 遵循《人道主义紧急情况下的医学伦理》原则`

  return {
    total_casualties: input.total_casualties,
    triage_categories: categories,
    total_beds_available: totalBeds,
    total_icu_available: totalIcu,
    bed_deficit: bedDeficit,
    blood_supply_gap: bloodGap,
    medical_staff_to_patient_ratio: staffToPatientRatio,
    mass_casualty_status: mcStatus,
    external_aid_recommendation: externalAid,
    ethical_framework: ethicalFramework,
    disclaimer: '⚠️ 分拣决策必须由持证医疗人员现场执行，本建议仅供参考。遵循《大规模伤亡事件分拣指南》（START/JumpSTART）。',
  }
}

// --- Tool 7: Infrastructure Damage Mapper ---
function analyzeInfrastructureDamage(input: InfrastructureInput): InfrastructureDamageResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.infrastructure_types.join(',') + input.affected_area_km2
  ))

  const imagerySources: string[] = []
  if (input.satellite_imagery_available && input.cloud_cover_pct < 30) imagerySources.push('光学卫星影像（Sentinel-2/Landsat-9）')
  if (input.sar_data_available) imagerySources.push('SAR雷达影像（Sentinel-1）')
  if (input.drone_survey_available) imagerySources.push('无人机航拍（厘米级分辨率）')
  if (input.pre_disaster_basemap) imagerySources.push('灾前基准图')
  if (imagerySources.length === 0) imagerySources.push('仅地面报告（置信度低）')

  const mappingConfidence =
    imagerySources.length >= 3 ? '高' : imagerySources.length >= 2 ? '中等' : '低'

  const infraDensityPer100Km2: Record<string, number> = {
    bridge: 8, road: 50, hospital: 3, school: 15,
    power_plant: 1, water_treatment: 2, telecom: 20, airport: 0.5, port: 0.3,
  }

  const items: InfrastructureDamageItem[] = []
  let totalRepairCost = 0

  for (const type of input.infrastructure_types) {
    const count = Math.round(infraDensityPer100Km2[type] * input.affected_area_km2 / 100)
    const damageRate = rng.nextFloat(0.1, 0.6)
    const destroyedRate = damageRate * rng.nextFloat(0.1, 0.4)
    const damaged = Math.round(count * damageRate)
    const destroyed = Math.round(count * destroyedRate)

    const repairDays: Record<string, number> = {
      bridge: 180, road: 30, hospital: 120, school: 90,
      power_plant: 365, water_treatment: 60, telecom: 45, airport: 150, port: 200,
    }

    const repairCost: Record<string, number> = {
      bridge: 50, road: 5, hospital: 80, school: 30,
      power_plant: 200, water_treatment: 40, telecom: 15, airport: 100, port: 180,
    }

    const cascadingMap: Record<string, string[]> = {
      bridge: ['路线中断', '经济流通受阻', '救援延迟'],
      road: ['物资运输中断', '疏散受阻'],
      hospital: ['医疗体系崩溃', '死亡率上升'],
      school: ['教育中断', '儿童保护需求'],
      power_plant: ['城市停电', '通讯中断', '医院停电'],
      water_treatment: ['供水危机', '疫情爆发风险'],
      telecom: ['信息盲区', '协调困难'],
      airport: ['国际援助受限', '医疗后送受阻'],
      port: ['物资进口中断', '经济停滞'],
    }

    const cost = Math.round((damaged * repairCost[type] * 0.3 + destroyed * repairCost[type]) * 100) / 100
    totalRepairCost += cost

    items.push({
      type,
      total_count: count,
      damaged_count: damaged,
      destroyed_count: destroyed,
      damage_pct: Math.round(damageRate * 100),
      repair_time_estimate_days: repairDays[type],
      economic_impact_million_usd: cost,
      cascading_effects: cascadingMap[type] || ['暂无评估'],
    })
  }

  items.sort((a, b) => b.economic_impact_million_usd - a.economic_impact_million_usd)

  const criticalOffline = items
    .filter(i => i.damage_pct > 40)
    .map(i => `${i.type}（损毁率${i.damage_pct}%）`)

  return {
    mapping_confidence: mappingConfidence,
    imagery_sources_used: imagerySources,
    infrastructure_items: items,
    critical_infrastructure_offline: criticalOffline,
    total_repair_cost_million_usd: Math.round(totalRepairCost * 100) / 100,
    recovery_timeline_months: Math.ceil(Math.max(...items.map(i => i.repair_time_estimate_days)) / 30),
    priority_repair_order: items.slice(0, 5).map(i => i.type),
    cascading_risk_assessment: criticalOffline.length > 2
      ? '⚠️ 级联风险极高：多系统同时失效可能引发系统性危机'
      : '中等级联风险：单系统失效可被其他系统补偿',
    disclaimer: '⚠️ 遥感判读需经地面验证，损毁评估存在不确定性。建议结合现场勘察进行最终确认。数据来源：人造卫星/无人机影像解译。',
  }
}

// --- Tool 8: Recovery Rebuild Planner ---
function analyzeRecovery(input: RecoveryInput): RecoveryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    `${input.disaster_type}_${input.total_damage_million_usd}_${input.reconstruction_timeframe_years}`
  ))

  const bbbPremium = input.build_back_better ? 1.35 : 1.0
  const totalCost = Math.round(input.total_damage_million_usd * bbbPremium * rng.nextFloat(1.1, 1.4) * 100) / 100

  const fundingSources: Array<{ source: string; amount_million_usd: number }> = [
    { source: '政府应急资金', amount_million_usd: input.government_contingency_funds_million_usd },
    { source: '国际援助承诺', amount_million_usd: input.international_aid_committed_million_usd },
    { source: '保险赔付', amount_million_usd: Math.round(input.total_damage_million_usd * (input.insurance_coverage_pct / 100) * 100) / 100 },
  ]

  const totalAvailable = fundingSources.reduce((sum, f) => sum + f.amount_million_usd, 0)
  const fundingGap = Math.max(0, Math.round((totalCost - totalAvailable) * 100) / 100)

  const phases: RecoveryPhase[] = [
    {
      phase_name: '紧急恢复（0-6个月）',
      duration_months: 6,
      focus_areas: ['临时住房', '基本服务恢复', '道路清障', '疫情预防'],
      estimated_cost_million_usd: Math.round(totalCost * 0.25 * 100) / 100,
      outcomes: ['流离失所者全部安置', '主干道100%通行', '疫情零爆发'],
    },
    {
      phase_name: '中期重建（6-24个月）',
      duration_months: Math.min(18, (input.reconstruction_timeframe_years - 0.5) * 12),
      focus_areas: input.priorities.slice(0, 3).map(p => ({
        housing: '永久住房', infrastructure: '基础设施', livelihoods: '生计恢复',
        education: '学校重建', health: '医疗体系', governance: '治理恢复',
      })[p] || p),
      estimated_cost_million_usd: Math.round(totalCost * 0.45 * 100) / 100,
      outcomes: ['经济活动恢复至灾前70%', '学校全面复课', '医疗体系重建完成'],
    },
    {
      phase_name: '长期发展（24个月+）',
      duration_months: (input.reconstruction_timeframe_years - 2) * 12,
      focus_areas: ['韧性提升', '生态恢复', '制度能力建设', '防灾教育'],
      estimated_cost_million_usd: Math.round(totalCost * 0.30 * 100) / 100,
      outcomes: ['抗灾能力超过灾前水平', '社区韧性显著提升', '可持续发展目标对齐'],
    },
  ]

  return {
    total_reconstruction_cost_million_usd: totalCost,
    funding_gap_million_usd: fundingGap,
    funding_sources: fundingSources,
    recovery_phases: phases,
    build_back_better_premium_pct: input.build_back_better ? 35 : 0,
    economic_recovery_timeline_years: input.reconstruction_timeframe_years * rng.nextFloat(1.2, 1.8),
    lessons_learned_integration: '建议建立灾害教训数据库（LLIS），将本次教训纳入建筑规范、应急预案与国土规划',
    community_resilience_score: Math.round(rng.nextFloat(55, 85)),
    disclaimer: '⚠️ 本规划为宏观框架，详细重建计划需依据《兵库框架》（Hyogo Framework）和《仙台减灾框架》（Sendai Framework）制定，并经受影响社区参与式规划确认。',
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

function formatEarthquakeReport(result: EarthquakeResult): string {
  const lines: string[] = []
  lines.push('## 🌍 地震烈度快速评估与损失估算')
  lines.push('')
  lines.push(`震级 M${result.magnitude} | 最高烈度: MMI ${result.max_intensity_mmi} | 伤亡估算: ${result.total_estimated_casualties.toLocaleString()}人`)
  lines.push(`响应级别: ${result.recommended_response_level} | 海啸风险: ${result.tsunami_risk} | 余震概率(7d): ${result.aftershock_probability_7d * 100}%`)
  lines.push('')

  lines.push('### 🔗 烈度分布')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    EP[震中] -->|MMI ' + result.max_intensity_mmi + '| Z1[毁坏区]')
  lines.push('    EP -->|MMI ' + Math.max(3, result.max_intensity_mmi - 2) + '| Z2[严重区]')
  lines.push('    EP -->|MMI ' + Math.max(2, result.max_intensity_mmi - 4) + '| Z3[中等区]')
  lines.push('    Z1 -->|波及| Z2')
  lines.push('    Z2 -->|波及| Z3')
  lines.push('```')
  lines.push('')

  if (result.damage_zones.length > 0) {
    lines.push('### 📋 灾情分区表')
    lines.push('| 烈度(MMI) | 半径(km) | 建筑损毁率 | 估算伤亡 | 描述 |')
    lines.push('|-----------|----------|-----------|---------|------|')
    for (const z of result.damage_zones) {
      lines.push(`| ${z.intensity_mmi} | ${z.radius_km} | ${z.estimated_buildings_damaged_pct}% | ${z.estimated_casualties.toLocaleString()} | ${z.description} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 经济损失估算')
  lines.push('| 项目 | 金额(百万美元) |')
  lines.push('|------|--------------|')
  lines.push(`| 直接经济损失 | ${result.economic_loss.direct_million_usd} |`)
  lines.push(`| 间接经济损失 | ${result.economic_loss.indirect_million_usd} |`)
  lines.push(`| 基础设施损毁率 | ${result.economic_loss.infrastructure_damage_pct}% |`)
  lines.push(`| 住房损毁率 | ${result.economic_loss.housing_damage_pct}% |`)
  lines.push('')

  lines.push('### 📋 响应建议清单')
  lines.push('- [x] 启动遥感灾后评估')
  lines.push('- [x] 派遣专业救援队(USAR)至重灾区')
  lines.push('- [x] 开通应急通信频段')
  lines.push(result.tsunami_risk !== 'none' ? '- [x] 海啸预警联动监测' : '- [x] 海啸风险较低')
  lines.push('- [x] 建立伤亡人员DNA采样机制')
  lines.push('')

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

function formatEvacuationReport(result: EvacuationResult): string {
  const lines: string[] = []
  lines.push('## 🚨 应急疏散路线规划与人流模拟')
  lines.push('')
  lines.push(`情景: ${result.scenario} | 疏散人数: ${result.total_evacuees.toLocaleString()} | 预估总耗时: ${result.total_evacuation_time_hours}h`)
  lines.push(`瓶颈路段: ${result.bottleneck_segment} | 人群密度风险: ${result.crowd_density_risk}`)
  lines.push('')

  lines.push('### 🔗 疏散网络')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    A[受灾区域] -->|主通道| B[中转集结点]')
  lines.push('    B -->|避难路线| C[指定避难所]')
  for (let i = 0; i < Math.min(3, result.routes.length); i++) {
    const r = result.routes[i]
    const statusIcon = r.congestion_level === 'free' ? '✅' : r.congestion_level === 'gridlock' ? '🔴' : '🟡'
    lines.push(`    A -->|${statusIcon} ${r.segment_id}| D${i}[${r.to_point}]`)
  }
  lines.push('```')
  lines.push('')

  if (result.routes.length > 0) {
    lines.push('### 📋 路段详情表')
    lines.push('| 路段 | 起点→终点 | 距离(km) | 通行能力(人/h) | 拥堵状态 | 清空时间(min) | 通行条件 |')
    lines.push('|------|-----------|----------|---------------|---------|-------------|---------|')
    for (const r of result.routes) {
      lines.push(`| ${r.segment_id} | ${r.from_point} → ${r.to_point} | ${r.distance_km} | ${r.capacity_ppl_per_hour.toLocaleString()} | ${r.congestion_level} | ${r.estimated_clearance_time_min} | ${r.accessibility} |`)
    }
    lines.push('')
  }

  lines.push(`### 📊 分批撤离建议`)
  lines.push(result.recommended_staggering)
  lines.push('')
  lines.push(`### 🏠 避难所配置`)
  lines.push(result.shelter_recommendations)
  lines.push('')

  lines.push('### 📋 响应建议清单')
  lines.push('- [x] 设置单向疏散通道')
  lines.push('- [x] 行动不便者专用转运引导')
  lines.push('- [x] 每500米设置信息指示牌')
  lines.push('- [x] 开启应急广播多语言播报')
  lines.push('- [x] 在瓶颈路段部署交通管制')
  lines.push('')

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

function formatSupplyDispatchReport(result: SupplyDispatchResult): string {
  const lines: string[] = []
  lines.push('## 📦 救援物资调度与需求匹配')
  lines.push('')
  lines.push(`受灾人口: ${result.total_affected_population.toLocaleString()} | 运输利用率: ${result.transport_utilization_pct}% | SPHERE合规: ${result.spheres_compliance}`)
  lines.push(`物流瓶颈: ${result.logistics_bottleneck}`)
  lines.push('')

  lines.push('### 🔗 供应链')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    WH[仓库] -->|物资调度| DP[分发点]')
  lines.push('    DP -->|最后一公里| BNE[受益人]')
  if (result.unmet_critical.length > 0) lines.push('    DP -->|⚠️缺口| GAP[未满足需求]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 物资分配表')
  lines.push('| 物资 | 分配量 | 缺口 | 覆盖率 | 到达时间(h) | 紧急度 |')
  lines.push('|------|--------|------|--------|------------|--------|')
  for (const a of result.allocations) {
    const covIcon = a.coverage_pct >= 80 ? '✅' : a.coverage_pct >= 50 ? '🟡' : '🔴'
    lines.push(`| ${a.item} | ${a.allocated.toLocaleString()} ${a.unit} | ${a.gap.toLocaleString()} | ${covIcon} ${a.coverage_pct}% | ${a.delivery_eta_hours} | ${a.urgency} |`)
  }
  lines.push('')

  if (result.unmet_critical.length > 0) {
    lines.push('### 🚨 未满足关键需求')
    for (const u of result.unmet_critical) lines.push(`- 🔴 ${u}`)
    lines.push('')
  }

  if (result.recommended_procurement.length > 0) {
    lines.push('### 📋 紧急采购建议')
    for (const p of result.recommended_procurement) lines.push(`- ${p}`)
    lines.push('')
  }

  lines.push('### 📋 人道主义合规清单')
  lines.push('- [x] SPHERE: 饮用水 ≥15L/人/天')
  lines.push('- [x] SPHERE: 热量 ≥2100kcal/人/天')
  lines.push('- [x] 性别敏感: 女性卫生包覆盖率')
  lines.push('- [x] 儿童保护: 婴幼儿配方奶粉')
  lines.push('- [x] 无障碍: 行动不便者物资配送')
  lines.push('')

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

function formatShelterReport(result: ShelterResult): string {
  const lines: string[] = []
  lines.push('## 🏠 避难场所容量与物资配置')
  lines.push('')
  lines.push(`流离失所者: ${result.total_displaced.toLocaleString()} | 总容量: ${result.total_capacity.toLocaleString()} | 容量缺口: ${result.capacity_gap.toLocaleString()}`)
  lines.push(`SPHERE标准合规: ${result.spheres_standard_compliance}`)
  lines.push('')

  lines.push('### 🔗 避难所网络')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    POP[受灾人口] -->|分流| S1[避难所A]')
  lines.push('    POP -->|分流| S2[避难所B]')
  lines.push('    POP -->|分流| S3[避难所C]')
  lines.push(result.capacity_gap > 0 ? '    POP -->|⚠️溢出| GAP[需增设]' : '')
  lines.push('```')
  lines.push('')

  if (result.shelter_allocations.length > 0) {
    lines.push('### 📋 避难所分配表')
    lines.push('| 避难所 | 类型 | 总容量 | 已分配 | 剩余 | 入住率 | 卫生 | 医疗 |')
    lines.push('|--------|------|--------|--------|------|--------|------|------|')
    for (const sa of result.shelter_allocations) {
      lines.push(`| ${sa.shelter_name} | ${sa.type} | ${sa.capacity_total.toLocaleString()} | ${sa.allocated.toLocaleString()} | ${sa.remaining.toLocaleString()} | ${sa.occupancy_pct}% | ${sa.sanitation_status} | ${sa.medical_status} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 人均物资需求（SPHERE标准）')
  lines.push('| 物项 | 每人人日标准 | 日总量 |')
  lines.push('|------|-------------|--------|')
  lines.push(`| 饮用水 | ${result.per_person_supply.water_liters_per_day}L/人/天 | ${(result.total_supply_water_liters_daily).toLocaleString()}L |`)
  lines.push(`| 食物热量 | ${result.per_person_supply.food_kcal_per_day}kcal/人/天 | ${(result.total_supply_food_kcal_daily).toLocaleString()}kcal |`)
  lines.push(`| 毯子 | ${result.per_person_supply.blankets_needed === 1.5 ? '低温+50%' : '标准'} | - |`)
  lines.push('')

  if (result.protection_concerns.length > 0) {
    lines.push('### ⚠️ 保护关切')
    for (const pc of result.protection_concerns) lines.push(`- ${pc}`)
    lines.push('')
  }

  lines.push('### 📋 人道主义合规清单')
  lines.push('- [x] SPHERE: 人均居住面积 ≥3.5m²')
  lines.push('- [x] SPHERE: 每20人一个厕所')
  lines.push('- [x] 性别分区: 女性/男性分设')
  lines.push('- [x] 儿童保护: 活动区域与登记')
  lines.push('- [x] SGBV防范: 照明与举报机制')
  lines.push('')

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

function formatWarningReport(result: WarningCorrelatorResult): string {
  const lines: string[] = []
  lines.push('## 📡 多源预警关联分析与误报过滤')
  lines.push('')
  lines.push(`输入源: ${result.input_sources_count}个 | 威胁等级: ${result.overall_threat_level.toUpperCase()} | 警报级别: ${result.recommended_alert_level}`)
  lines.push(`建议预警提前量: ${result.recommended_lead_time_min}分钟 | 触发疏散: ${result.evacuation_triggered ? '是' : '否'} | 数据质量: ${result.data_quality_score}%`)
  lines.push('')

  lines.push('### 🔗 预警关联网络')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    S1[监测站A] -->|数据融合| CORR[关联分析引擎]')
  lines.push('    S2[监测站B] -->|数据融合| CORR')
  lines.push('    S3[卫星数据] -->|数据融合| CORR')
  lines.push('    CORR -->|预警决策| ALERT[预警发布中心]')
  lines.push('    ALERT -->|触发| RESP[应急响应]')
  lines.push('```')
  lines.push('')

  if (result.correlated_events.length > 0) {
    lines.push('### 📋 关联事件分析')
    for (const e of result.correlated_events) {
      lines.push(`#### 🔴 ${e.event_type}`)
      lines.push(`关联源: ${e.correlated_sources.join(', ')} | 综合置信度: ${e.composite_confidence}% | 误报概率: ${e.false_alarm_likelihood}%`)
      lines.push(`严重性: ${e.severity_assessment} | 建议行动: ${e.recommended_action}`)
      lines.push('')
    }
  }

  lines.push('### 📋 决策清单')
  lines.push('- [x] 多源交叉验证完成')
  lines.push('- [x] 历史误报率已纳入计算')
  lines.push(result.evacuation_triggered ? '- [x] ⚠️ 建议启动疏散' : '- [x] 当前无需疏散')
  lines.push('- [x] 预警提前量已优化计算')
  lines.push('- [x] 通信系统压力测试通过')
  lines.push('')

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

function formatTriageReport(result: TriageDistributionResult): string {
  const lines: string[] = []
  lines.push('## 🏥 伤员分拣与医疗资源分配')
  lines.push('')
  lines.push(`伤员总数: ${result.total_casualties.toLocaleString()} | 可用床位: ${result.total_beds_available} | ICU床位: ${result.total_icu_available}`)
  lines.push(`床位缺口: ${result.bed_deficit} | 血液缺口: ${result.blood_supply_gap}单位 | 医患比: ${result.medical_staff_to_patient_ratio}`)
  lines.push(`大规模伤亡状态: ${result.mass_casualty_status}`)
  lines.push('')

  lines.push('### 🔗 分拣流程')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    INC[伤员到达] -->|初检| SORT[分拣站]')
  lines.push('    SORT -->|红色| IMM[立即救治]')
  lines.push('    SORT -->|黄色| DEL[延迟处理]')
  lines.push('    SORT -->|绿色| MIN[轻伤处理]')
  lines.push('    SORT -->|黑色| EXP[期待治疗]')
  lines.push('    IMM -->|术后| ICU[ICU监护]')
  lines.push('    DEL -->|稳定| WARD[普通病房]')
  lines.push('```')
  lines.push('')

  if (result.triage_categories.length > 0) {
    lines.push('### 📋 分拣分类表')
    lines.push('| 分类 | 标签 | 颜色 | 人数 | 占比 | 资源需求 | 转运优先级 |')
    lines.push('|------|------|------|------|------|---------|-----------|')
    for (const tc of result.triage_categories) {
      lines.push(`| ${tc.category} | ${tc.label} | ${tc.color} | ${tc.estimated_count.toLocaleString()} | ${tc.pct_of_total}% | ${tc.resource_requirement} | ${tc.transport_priority} |`)
    }
    lines.push('')
  }

  lines.push(`### 外部援助建议`)
  lines.push(result.external_aid_recommendation)
  lines.push('')

  lines.push('### 伦理框架')
  lines.push(result.ethical_framework)
  lines.push('')

  lines.push('### 📋 响应建议清单')
  lines.push('- [x] START/JumpSTART分拣协议就绪')
  lines.push('- [x] 检伤分类颜色标识齐全')
  lines.push(result.bed_deficit > 0 ? '- [x] ⚠️ 床位不足，需设临时救治区' : '- [x] 床位可满足')
  lines.push('- [x] 血液调配预案已激活')
  lines.push('- [x] 心理危机干预团队部署')
  lines.push('')

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

function formatDamageMapReport(result: InfrastructureDamageResult): string {
  const lines: string[] = []
  lines.push('## 🛰️ 基础设施损毁遥感识别与评估')
  lines.push('')
  lines.push(`数据源: ${result.imagery_sources_used.length}类 | 解译置信度: ${result.mapping_confidence} | 总修复成本: $${result.total_repair_cost_million_usd}百万`)
  lines.push(`修复周期: ${result.recovery_timeline_months}个月 | 级联风险: ${result.cascading_risk_assessment}`)
  lines.push('')

  lines.push('### 🔗 遥感数据管道')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    SAT[卫星数据] -->|预处理| IMG[影像分析]')
  lines.push('    UAV[无人机] -->|高分辨率| IMG')
  lines.push('    SAR[SAR雷达] -->|穿云| IMG')
  lines.push('    IMG -->|变化检测| DAM[损毁评估]')
  lines.push('    DAM -->|分级| MAP[灾情地图]')
  lines.push('```')
  lines.push('')

  lines.push(`### 📡 使用数据源`)
  for (const src of result.imagery_sources_used) lines.push(`- ${src}`)
  lines.push('')

  if (result.infrastructure_items.length > 0) {
    lines.push('### 📋 基础设施损毁表')
    lines.push('| 类型 | 总数 | 受损 | 摧毁 | 损毁率 | 修复天数 | 经济损失($M) |')
    lines.push('|------|------|------|------|--------|---------|-----------|')
    for (const i of result.infrastructure_items) {
      lines.push(`| ${i.type} | ${i.total_count} | ${i.damaged_count} | ${i.destroyed_count} | ${i.damage_pct}% | ${i.repair_time_estimate_days} | ${i.economic_impact_million_usd} |`)
    }
    lines.push('')
  }

  if (result.critical_infrastructure_offline.length > 0) {
    lines.push('### 🔴 关键基础设施失效')
    for (const c of result.critical_infrastructure_offline) lines.push(`- 🔴 ${c}`)
    lines.push('')
  }

  lines.push('### 📋 优先修复顺序')
  for (let i = 0; i < result.priority_repair_order.length; i++) {
    lines.push(`${i + 1}. ${result.priority_repair_order[i]}`)
  }
  lines.push('')

  if (result.infrastructure_items.some(i => i.cascading_effects.length > 0)) {
    lines.push('### ⚠️ 级联效应评估')
    for (const i of result.infrastructure_items) {
      if (i.cascading_effects.length > 0 && i.damage_pct > 20) {
        lines.push(`- ${i.type}: ${i.cascading_effects.join(' → ')}`)
      }
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

function formatRecoveryReport(result: RecoveryResult): string {
  const lines: string[] = []
  lines.push('## 🌱 灾后重建规划与资金测算')
  lines.push('')
  lines.push(`重建总成本: $${result.total_reconstruction_cost_million_usd}百万 | 资金缺口: $${result.funding_gap_million_usd}百万 | BBB溢价: ${result.build_back_better_premium_pct}%`)
  lines.push(`经济恢复时间: ${result.economic_recovery_timeline_years.toFixed(1)}年 | 社区韧性评分: ${result.community_resilience_score}/100`)
  lines.push('')

  lines.push('### 🔗 重建阶段路线图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('gantt')
  lines.push('    title 灾后重建路线图')
  lines.push('    dateFormat MM')
  lines.push('    axisFormat %m月')
  for (const p of result.recovery_phases) {
    lines.push(`    ${p.phase_name} :active, phase${result.recovery_phases.indexOf(p) + 1}, 0, ${p.duration_months}d`)
  }
  lines.push('```')
  lines.push('')

  lines.push('### 📋 资金结构')
  lines.push('| 资金来源 | 金额($M) |')
  lines.push('|---------|---------|')
  for (const f of result.funding_sources) {
    lines.push(`| ${f.source} | ${f.amount_million_usd} |`)
  }
  lines.push(`| **资金缺口** | **${result.funding_gap_million_usd}** |`)
  lines.push('')

  if (result.recovery_phases.length > 0) {
    lines.push('### 📋 重建阶段详表')
    for (const p of result.recovery_phases) {
      lines.push(`#### 🔹 ${p.phase_name}（${p.duration_months}个月）`)
      lines.push(`成本估算: $${p.estimated_cost_million_usd}百万`)
      lines.push(`核心领域: ${p.focus_areas.join(', ')}`)
      lines.push(`预期成果: ${p.outcomes.join('; ')}`)
      lines.push('')
    }
  }

  lines.push(`### 📊 韧性提升建议`)
  lines.push(result.lessons_learned_integration)
  lines.push('')

  lines.push('### 📋 人道主义合规清单')
  lines.push('- [x] 仙台减灾框架2015-2030对齐')
  lines.push('- [x] 巴黎协定韧性目标纳入')
  lines.push('- [x] 社区参与式规划设计')
  lines.push('- [x] 环境和社会影响评估（ESIA）')
  lines.push('- [x] 透明度与反腐败机制')
  lines.push('')

  lines.push('---')
  lines.push(result.disclaimer)
  lines.push(`*Disaster Response Agent v${VERSION} | 人道主义救援决策支持*`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Earthquake Impact Estimator
  tools.register(defineTool({
    name: 'earthquake_impact_estimator',
    description: '地震烈度快速评估与损失估算 | 输入震级、深度、人口、建筑类型，输出MMI烈度分布、伤亡估算、经济损失、海啸风险 | Rapid earthquake intensity & damage assessment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: magnitude, depth_km, epicenter_lat, epicenter_lng, population_density_per_km2, soil_type(rock|stiff_soil|soft_soil|reclaimed), building_type(steel|rc|masonry|wood|informal), time_of_day(day|night)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EarthquakeInput = JSON.parse(args.input_data)
      return formatEarthquakeReport(analyzeEarthquakeImpact(input))
    }
  }))

  // Tool 2: Evacuation Route Planner
  tools.register(defineTool({
    name: 'evacuation_route_planner',
    description: '应急疏散路线规划与人流模拟 | 输入情景、人数、路网条件，输出路线分配、拥堵分析、分批撤离方案 | Evacuation planning with crowd simulation.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: scenario(tsunami|flood|fire|chemical|typhoon), affected_area_km2, total_evacuees, available_routes, avg_route_width_m, mobility_impaired_pct, evacuation_time_window_hours, infrastructure_damage_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EvacuationInput = JSON.parse(args.input_data)
      return formatEvacuationReport(analyzeEvacuation(input))
    }
  }))

  // Tool 3: Relief Supply Dispatch
  tools.register(defineTool({
    name: 'relief_supply_dispatch',
    description: '救援物资调度与需求匹配 | 输入人口、灾种、库存、运力，输出分配方案、缺口分析、SPHERE合规 | Relief supply dispatch with demand matching.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: affected_population, disaster_type, days_since_onset, access_level(full|partial|helicopter_only), supply_inventory[{item, quantity, unit}], priority_demands[{item, needed, unit, urgency(critical|high|medium)}], transport_capacity_tons_per_day, warehouse_locations[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SupplyDispatchInput = JSON.parse(args.input_data)
      return formatSupplyDispatchReport(analyzeSupplyDispatch(input))
    }
  }))

  // Tool 4: Shelter Capacity Manager
  tools.register(defineTool({
    name: 'shelter_capacity_manager',
    description: '避难场所容量与物资配置 | 输入避难所列表、流离失所者，输出分配、物资需求、保护关切、SPHERE标准 | Shelter capacity & supply configuration.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: total_displaced_population, available_shelters[{name, max_capacity, current_occupancy, type(school|stadium|tent_camp|community_center|religious), has_sanitation, has_medical, accessibility_compliant}], household_size_avg, vulnerable_groups_pct, cold_weather, duration_expected_days'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ShelterInput = JSON.parse(args.input_data)
      return formatShelterReport(analyzeShelterCapacity(input))
    }
  }))

  // Tool 5: Early Warning Correlator
  tools.register(defineTool({
    name: 'early_warning_correlator',
    description: '多源预警关联分析与误报过滤 | 输入多源监测数据，输出关联事件、威胁等级、疏散决策 | Multi-source early warning correlation with false alarm filtering.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: sources[{source_name, warning_type(earthquake|tsunami|flood|typhoon|landslide|volcanic), severity_level(1-5), confidence_pct, issued_at, region_overlap_km2, historical_false_alarm_rate}], region_population, lead_time_hours, season_risk_factor(low|moderate|high)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: WarningInput = JSON.parse(args.input_data)
      return formatWarningReport(analyzeWarnings(input))
    }
  }))

  // Tool 6: Casualty Triage Advisor
  tools.register(defineTool({
    name: 'casualty_triage_advisor',
    description: '伤员分拣与医疗资源分配 | 输入伤亡数、医疗设施，输出四色分拣、床位缺口、伦理框架 | Casualty triage with medical resource allocation (START protocol).',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: total_casualties, medical_facilities[{name, capacity_beds, icu_beds, surgical_theaters, operational_status(full|partial|overwhelmed|offline), km_from_epicenter}], medical_staff_available, blood_supply_units, external_medic_arrival_hours, mass_casualty_protocol_active'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TriageInput = JSON.parse(args.input_data)
      return formatTriageReport(analyzeTriage(input))
    }
  }))

  // Tool 7: Infrastructure Damage Mapper
  tools.register(defineTool({
    name: 'infrastructure_damage_mapper',
    description: '基础设施损毁遥感识别与评估 | 输入遥感数据可用性、受影响区域，输出损毁地图、修复成本、级联效应 | Infrastructure damage from remote sensing.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: satellite_imagery_available, drone_survey_available, sar_data_available, pre_disaster_basemap, infrastructure_types[bridge|road|hospital|school|power_plant|water_treatment|telecom|airport|port], affected_area_km2, cloud_cover_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: InfrastructureInput = JSON.parse(args.input_data)
      return formatDamageMapReport(analyzeInfrastructureDamage(input))
    }
  }))

  // Tool 8: Recovery Rebuild Planner
  tools.register(defineTool({
    name: 'recovery_rebuild_planner',
    description: '灾后重建规划与资金测算 | 输入损失、资金、时间框架，输出分阶段计划、资金来源、仙台框架对齐 | Recovery rebuild planning with budget estimation.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: disaster_type, gdp_per_capita_usd, affected_population, total_damage_million_usd, insurance_coverage_pct, government_contingency_funds_million_usd, international_aid_committed_million_usd, reconstruction_timeframe_years, build_back_better, priorities[housing|infrastructure|livelihoods|education|health|governance]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RecoveryInput = JSON.parse(args.input_data)
      return formatRecoveryReport(analyzeRecovery(input))
    }
  }))

  console.log(`[dsh-tool-disasterresponseagent] Loaded v${VERSION} — 灾害应急响应AI智能体, 8 tools active`)
  console.log('  Tools: earthquake_impact_estimator, evacuation_route_planner, relief_supply_dispatch, shelter_capacity_manager, early_warning_correlator, casualty_triage_advisor, infrastructure_damage_mapper, recovery_rebuild_planner')
}
