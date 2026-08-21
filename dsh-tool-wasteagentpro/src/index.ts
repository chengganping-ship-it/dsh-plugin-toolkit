/**
 * DSH Solid Waste Management AI Agent Plugin v0.1.0
 *
 * Comprehensive solid waste management toolkit for DeepSeek Harness Agent.
 * Designed for waste management engineers, environmental consultants, municipal planners,
 * recycling facility operators, landfill managers, and sustainability professionals.
 *
 * Features (v0.1.0):
 * 1. Waste Composition Analyzer    — Municipal solid waste composition analysis with reduction pathways
 * 2. Recycling Route Optimizer     — Recycling sorting routes with logistics optimization
 * 3. Landfill Operation Manager    — Landfill operations with leachate/biogas management
 * 4. Waste-to-Energy Planner      — Incineration power generation with emission control
 * 5. Hazardous Waste Tracker      — Hazardous waste lifecycle tracking with manifest management
 * 6. Circular Economy Mapper       — Circular economy industrial chain matching with resource recovery
 * 7. Smart Bin Monitor            — Smart bin overflow monitoring with collection scheduling
 * 8. Carbon Credit from Waste     — Waste carbon reduction accounting per CCER methodology
 *
 * @module dsh-tool-wasteagentpro
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-wasteagentpro'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '免责声明: 本分析基于AI模型推断与行业经验数据，仅供固废管理参考，不替代专业环境工程评估、环境影响评价和危废经营许可证相关法规咨询。实际运营决策请咨询持证环境工程师。'

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

  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — Types & Interfaces ====================

// --- Tool 1: Waste Composition Analyzer ---
interface WasteCompositionInput {
  region: string
  population: number
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  waste_samples: Array<{ category: string; weight_kg: number; moisture_pct: number }>
  gdp_per_capita?: number
  collection_days_per_week?: number
}

interface CompositionBreakdown {
  category: string
  weight_kg: number
  percentage: number
  moisture_pct: number
  density_kg_m3: number
}

interface ReductionPathway {
  category: string
  current_pct: number
  target_pct: number
  reduction: number
  reduction_tons_year: number
  method: string
  priority: 'high' | 'medium' | 'low'
}

interface WasteCompositionResult {
  region: string
  population: number
  total_weight_kg: number
  per_capita_kg_day: number
  breakdown: CompositionBreakdown[]
  recyclable_pct: number
  organic_pct: number
  hazardous_pct: number
  diversion_rate_current: number
  diversion_rate_potential: number
  reduction_pathways: ReductionPathway[]
  recommendations: string[]
}

// --- Tool 2: Recycling Route Optimizer ---
interface RecyclingRouteInput {
  depot_location: { lat: number; lng: number }
  collection_points: Array<{ id: string; lat: number; lng: number; volume_m3: number; material_types: string[] }>
  vehicle_capacity_m3: number
  num_vehicles: number
  material_prices?: Record<string, number>
  fuel_cost_per_km?: number
}

interface RouteStop {
  point_id: string
  lat: number
  lng: number
  volume_m3: number
  material_types: string[]
  cumulative_distance_km: number
}

interface OptimizedRoute {
  vehicle_id: number
  stops: RouteStop[]
  total_distance_km: number
  total_volume_m3: number
  estimated_time_min: number
  fuel_cost: number
  revenue_estimate: number
}

interface RecyclingRouteResult {
  routes: OptimizedRoute[]
  total_distance_km: number
  total_fuel_cost: number
  total_revenue: number
  total_profit: number
  co2_saved_kg: number
  unassigned_points: string[]
  efficiency_metrics: {
    avg_vehicle_utilization: number
    avg_stops_per_route: number
    revenue_per_km: number
  }
}

// --- Tool 3: Landfill Operation Manager ---
interface LandfillInput {
  landfill_name: string
  daily_tonnage: number
  total_capacity_m3: number
  remaining_capacity_m3: number
  waste_density_kg_m3: number
  leachate_level_m: number
  leachate_treatment_capacity_m3_day: number
  biogas_flow_rate_m3_h: number
  methane_content_pct: number
  cover_soil_ratio: number
  compaction_equipment: string
  liner_type: string
  groundwater_monitoring_wells: number
}

interface LandfillStatus {
  operational_status: 'normal' | 'warning' | 'critical'
  remaining_life_years: number
  remaining_life_days: number
  fill_rate_pct: number
  daily_volume_consumed_m3: number
}

interface LeachateManagement {
  current_level_status: 'safe' | 'elevated' | 'critical'
  daily_generation_m3: number
  treatment_utilization_pct: number
  treatment_capacity_sufficient: boolean
  recommended_actions: string[]
}

interface BiogasManagement {
  methane_flow_m3_h: number
  energy_potential_kwh_day: number
  flare_efficiency_pct: number
  power_generation_potential_kwh: number
  co2_reduction_tons_year: number
  utilization_recommendation: string
}

interface LandfillOperationResult {
  landfill_name: string
  status: LandfillStatus
  leachate: LeachateManagement
  biogas: BiogasManagement
  compaction_assessment: string
  environmental_compliance: {
    liner_integrity: string
    groundwater_status: string
    cover_soil_adequate: boolean
    monitoring_wells_sufficient: boolean
  }
  operational_recommendations: string[]
}

// --- Tool 4: Waste-to-Energy Planner ---
interface WtEInput {
  plant_name: string
  feedstock_tons_per_day: number
  calorific_value_mj_kg: number
  boiler_efficiency_pct: number
  generator_efficiency_pct: number
  plant_availability_pct: number
  emission_limits: { nox_mg_m3: number; so2_mg_m3: number; dioxin_ng_m3: number; co_mg_m3: number; particulate_mg_m3: number }
  flue_gas_treatment: string[]
  ash_content_pct: number
  bottom_ash_pct: number
  fly_ash_pct: number
}

interface PowerGeneration {
  thermal_power_mw: number
  gross_power_mw: number
  net_power_mw: number
  auxiliary_consumption_pct: number
  annual_generation_gwh: number
  households_served: number
}

interface EmissionResult {
  pollutant: string
  limit_mg_m3: number
  estimated_mg_m3: number
  compliance_status: 'compliant' | 'marginal' | 'exceedance'
  treatment_method: string
}

interface WtEResult {
  plant_name: string
  power_generation: PowerGeneration
  emission_results: EmissionResult[]
  ash_management: {
    bottom_ash_tons_day: number
    fly_ash_tons_day: number
    bottom_ash_utilization: string
    fly_ash_treatment: string
  }
  mass_balance: {
    feedstock_tons: number
    steam_energy_gj: number
    power_output_mwh: number
    flue_gas_nm3: number
    residue_tons: number
  }
  environmental_performance: {
    overall_compliance: string
    carbon_displacement_tons_co2_year: number
    renewable_energy_certificates: number
  }
  optimization_recommendations: string[]
}

// --- Tool 5: Hazardous Waste Tracker ---
interface HazardousWasteInput {
  manifest_id: string
  waste_entries: Array<{
    waste_code: string
    waste_name: string
    hazard_class: string
    weight_kg: number
    physical_state: 'solid' | 'liquid' | 'sludge' | 'gas'
    un_number?: string
    packing_group?: string
  }>
  generator: { name: string; license_no: string; address: string; contact: string }
  transporter: { name: string; license_no: string; vehicle_id: string; driver: string }
  disposal_facility: { name: string; license_no: string; method: string; capacity_remaining_tons: number }
  transfer_date: string
  expected_arrival_date: string
}

interface WasteEntryStatus {
  waste_code: string
  waste_name: string
  hazard_class: string
  weight_kg: number
  physical_state: string
  manifest_match: boolean
  disposal_compatibility: 'compatible' | 'conditional' | 'incompatible'
  special_requirements: string[]
}

interface HazardousWasteResult {
  manifest_id: string
  tracking_status: 'in_transit' | 'delivered' | 'processing' | 'completed' | 'exception'
  chain_of_custody: {
    generator: string
    transporter: string
    disposal_facility: string
    transfer_date: string
    expected_arrival: string
  }
  total_weight_kg: number
  total_entries: number
  entry_statuses: WasteEntryStatus[]
  compliance_check: {
    generator_license_valid: boolean
    transporter_license_valid: boolean
    facility_license_valid: boolean
    manifest_complete: boolean
    multi_copy_system: boolean
    overall_compliant: boolean
  }
  risk_alerts: string[]
  regulatory_notes: string[]
}

// --- Tool 6: Circular Economy Mapper ---
interface CircularEconomyInput {
  waste_streams: Array<{
    material: string
    quantity_tons_year: number
    quality_grade: 'A' | 'B' | 'C' | 'D'
    location: string
    current_fate: string
    contamination_pct: number
  }>
  industry_demands: Array<{
    sector: string
    material_needed: string
    quantity_tons_year: number
    quality_requirement: 'A' | 'B' | 'C' | 'D'
    location: string
    willingness_to_pay_per_ton: number
  }>
  transport_cost_per_ton_km?: number
  symbiosis_radius_km?: number
}

interface MatchResult {
  waste_material: string
  supplier_location: string
  buyer_sector: string
  buyer_location: string
  matched_quantity_tons: number
  quality_match: 'direct' | 'with_processing' | 'downcycled'
  transport_distance_km: number
  transport_cost_total: number
  revenue_total: number
  value_created_per_ton: number
  co2_avoided_tons: number
}

interface CircularEconomyResult {
  matches: MatchResult[]
  summary: {
    total_waste_tons: number
    total_matched_tons: number
    utilization_rate_pct: number
    total_revenue: number
    total_co2_avoided: number
    avg_transport_distance_km: number
  }
  unmatched_waste: Array<{ material: string; quantity_tons: number; reason: string }>
  industrial_symbiosis_score: number
  recommendations: string[]
}

// --- Tool 7: Smart Bin Monitor ---
interface SmartBinInput {
  bins: Array<{
    id: string
    location: string
    lat: number
    lng: number
    fill_level_pct: number
    capacity_liters: number
    last_collected: string
    temperature_c: number
    tilt_detected: boolean
    battery_pct: number
    material_type: string
  }>
  collection_vehicles: number
  vehicle_capacity_liters: number
  collection_depot: { lat: number; lng: number }
  max_collection_time_hours: number
  priority_zones?: string[]
}

interface BinAlert {
  bin_id: string
  location: string
  alert_type: 'overflow' | 'fire_risk' | 'tilt' | 'low_battery' | 'overdue'
  severity: 'critical' | 'warning' | 'info'
  fill_level_pct: number
  action_required: string
}

interface CollectionSchedule {
  vehicle_id: number
  bins: string[]
  estimated_volume_liters: number
  route_distance_km: number
  estimated_time_min: number
  priority: 'urgent' | 'scheduled' | 'routine'
}

interface SmartBinResult {
  total_bins: number
  avg_fill_level: number
  bins_above_80pct: number
  bins_above_95pct: number
  alerts: BinAlert[]
  collection_schedules: CollectionSchedule[]
  collection_summary: {
    total_volume_to_collect: number
    total_distance_km: number
    total_time_min: number
    vehicles_needed: number
    fuel_cost_estimate: number
  }
  maintenance_bins: string[]
  optimization_recommendations: string[]
}

// --- Tool 8: Carbon Credit from Waste ---
interface WasteCarbonInput {
  project_type: 'landfill_gas_recovery' | 'composting' | 'recycling' | 'wte' | 'anaerobic_digestion' | 'avoided_landfill'
  project_name: string
  location: string
  baseline_scenario: string
  waste_diverted_tons_year: number
  landfill_diversion_pct: number
  methane_capture_efficiency?: number
  compost_output_tons_year?: number
  recycled_output_tons_year?: number
  energy_generated_mwh_year?: number
  grid_emission_factor_tco2_mwh: number
  methodology: string
  crediting_period_years: number
  monitoring_data_years: number
}

interface EmissionReduction {
  source: string
  baseline_tco2e: number
  project_tco2e: number
  reduction_tco2e: number
  methodology_reference: string
}

interface CCERAssessment {
  methodology_eligible: boolean
  methodology_name: string
  additionality_demonstrated: boolean
  baseline_established: boolean
  monitoring_plan_adequate: boolean
  estimated_annual_credits: number
  total_crediting_period_credits: number
  credit_value_estimate_cny: number
}

interface WasteCarbonResult {
  project_name: string
  project_type: string
  emission_reductions: EmissionReduction[]
  total_annual_reduction_tco2e: number
  total_crediting_period_reduction_tco2e: number
  ccer_assessment: CCERAssessment
  monitoring_requirements: string[]
  key_risks: string[]
  recommendations: string[]
}

// ==================== SECTION 3 — Analyze Functions ====================

// Tool 1: Waste Composition Analyzer
function analyzeWasteComposition(input: WasteCompositionInput, rng: SeededRandom): WasteCompositionResult {
  const totalWeight = input.waste_samples.reduce((s, w) => s + w.weight_kg, 0)
  const perCapita = input.population > 0 ? (totalWeight / input.population) * 1000 : 0

  const densityMap: Record<string, number> = {
    '厨余垃圾': 280, '餐厨垃圾': 350, '果蔬垃圾': 300, '其他有机物': 250,
    '纸类': 80, '塑料': 60, 'PET瓶': 35, 'HDPE': 55, '薄膜塑料': 40,
    '玻璃': 200, '金属': 300, '铝罐': 150, '铁罐': 250,
    '织物': 100, '木材': 200, '橡胶': 120,
    '有害垃圾': 150, '电池': 300, '荧光灯管': 250, '化学品': 180,
    '建筑垃圾': 800, '渣土': 1200, '砖瓦': 900,
    '其他垃圾': 150, '混合垃圾': 180, '不可回收物': 200
  }

  const breakdown: CompositionBreakdown[] = input.waste_samples.map(s => ({
    category: s.category,
    weight_kg: s.weight_kg,
    percentage: totalWeight > 0 ? Math.round((s.weight_kg / totalWeight) * 1000) / 10 : 0,
    moisture_pct: s.moisture_pct,
    density_kg_m3: densityMap[s.category] ?? 150
  })).sort((a, b) => b.weight_kg - a.weight_kg)

  const recyclableCategories = ['纸类', '塑料', 'PET瓶', 'HDPE', '薄膜塑料', '玻璃', '金属', '铝罐', '铁罐', '织物', '木材']
  const organicCategories = ['厨余垃圾', '餐厨垃圾', '果蔬垃圾', '其他有机物']
  const hazardousCategories = ['有害垃圾', '电池', '荧光灯管', '化学品']

  const recyclablePct = breakdown.filter(b => recyclableCategories.includes(b.category)).reduce((s, b) => s + b.percentage, 0)
  const organicPct = breakdown.filter(b => organicCategories.includes(b.category)).reduce((s, b) => s + b.percentage, 0)
  const hazardousPct = breakdown.filter(b => hazardousCategories.includes(b.category)).reduce((s, b) => s + b.percentage, 0)

  const annualTons = perCapita * input.population * 365 / 1000

  const pathways: ReductionPathway[] = []
  if (organicPct > 30) {
    pathways.push({
      category: '厨余/有机垃圾',
      current_pct: organicPct,
      target_pct: Math.round(organicPct * 0.5 * 10) / 10,
      reduction: Math.round(organicPct * 0.3),
      reduction_tons_year: Math.round(annualTons * organicPct / 100 * 0.3),
      method: '源头分类+厌氧消化/堆肥处理',
      priority: 'high'
    })
  }
  if (recyclablePct > 20) {
    pathways.push({
      category: '可回收物',
      current_pct: recyclablePct,
      target_pct: Math.round(recyclablePct * 0.6 * 10) / 10,
      reduction: Math.round(recyclablePct * 0.25),
      reduction_tons_year: Math.round(annualTons * recyclablePct / 100 * 0.25),
      method: '智能回收站+分类运输+资源化利用',
      priority: 'high'
    })
  }
  pathways.push({
    category: '其他垃圾',
    current_pct: Math.round((100 - recyclablePct - organicPct - hazardousPct) * 10) / 10,
    target_pct: Math.round((100 - recyclablePct - organicPct - hazardousPct) * 0.7 * 10) / 10,
    reduction: Math.round((100 - recyclablePct - organicPct - hazardousPct) * 0.15),
    reduction_tons_year: Math.round(annualTons * (100 - recyclablePct - organicPct - hazardousPct) / 100 * 0.15),
    method: '焚烧发电+残渣建材利用',
    priority: 'medium'
  })

  const currentDiversion = recyclablePct * 0.6 + organicPct * 0.2
  const potentialDiversion = recyclablePct * 0.85 + organicPct * 0.7 + (100 - recyclablePct - organicPct - hazardousPct) * 0.4

  const recommendations: string[] = []
  recommendations.push(`当前人均日产生量${perCapita.toFixed(2)}kg，年产生量约${Math.round(annualTons).toLocaleString()}吨`)
  if (organicPct > 40) recommendations.push('有机垃圾占比高(>40%)，建议优先建设厨余垃圾就地处理设施')
  if (recyclablePct > 25) recommendations.push('可回收物占比高，建议完善低值可回收物补贴机制')
  if (hazardousPct > 3) recommendations.push('有害垃圾占比偏高，需加强分类宣传和专门收运')
  recommendations.push(`当前分流率约${currentDiversion.toFixed(1)}%，通过综合措施可提升至${Math.min(potentialDiversion, 75).toFixed(1)}%`)
  recommendations.push('建议建立垃圾分类信息化平台，实现产生-收集-运输-处理全链条追溯')
  if (input.season === 'summer') recommendations.push('夏季果蔬垃圾增量明显，建议增加厨余垃圾收运频次')

  return {
    region: input.region,
    population: input.population,
    total_weight_kg: Math.round(totalWeight),
    per_capita_kg_day: Math.round(perCapita * 100) / 100,
    breakdown,
    recyclable_pct: Math.round(recyclablePct * 10) / 10,
    organic_pct: Math.round(organicPct * 10) / 10,
    hazardous_pct: Math.round(hazardousPct * 10) / 10,
    diversion_rate_current: Math.round(currentDiversion * 10) / 10,
    diversion_rate_potential: Math.round(Math.min(potentialDiversion, 80) * 10) / 10,
    reduction_pathways: pathways,
    recommendations
  }
}

// Tool 2: Recycling Route Optimizer
function optimizeRecyclingRoutes(input: RecyclingRouteInput, rng: SeededRandom): RecyclingRouteResult {
  const fuelCostPerKm = input.fuel_cost_per_km ?? 1.2
  const materialPrices = input.material_prices ?? {
    '纸类': 1200, 'PET瓶': 3500, 'HDPE': 2800, '铝罐': 8000, '铁罐': 1500,
    '玻璃': 300, '塑料薄膜': 1800, '织物': 800, '电子废弃物': 5000
  }

  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // Sort by angle from depot for sweep algorithm
  const sorted = [...input.collection_points].sort((a, b) => {
    const angleA = Math.atan2(a.lat - input.depot_location.lat, a.lng - input.depot_location.lng)
    const angleB = Math.atan2(b.lat - input.depot_location.lat, b.lng - input.depot_location.lng)
    return angleA - angleB
  })

  const routes: OptimizedRoute[] = []
  let pointIdx = 0

  for (let v = 0; v < input.num_vehicles && pointIdx < sorted.length; v++) {
    const stops: RouteStop[] = []
    let currentVolume = 0
    let currentLat = input.depot_location.lat
    let currentLng = input.depot_location.lng
    let totalDist = 0

    while (pointIdx < sorted.length && currentVolume < input.vehicle_capacity_m3) {
      const point = sorted[pointIdx]
      if (currentVolume + point.volume_m3 > input.vehicle_capacity_m3 && stops.length > 0) break

      const dist = haversine(currentLat, currentLng, point.lat, point.lng)
      totalDist += dist
      currentVolume += point.volume_m3
      stops.push({
        point_id: point.id,
        lat: point.lat,
        lng: point.lng,
        volume_m3: point.volume_m3,
        material_types: point.material_types,
        cumulative_distance_km: Math.round(totalDist * 100) / 100
      })
      currentLat = point.lat
      currentLng = point.lng
      pointIdx++
    }

    if (stops.length > 0) {
      const returnDist = haversine(currentLat, currentLng, input.depot_location.lat, input.depot_location.lng)
      totalDist += returnDist

      let revenue = 0
      for (const stop of stops) {
        for (const mat of stop.material_types) {
          revenue += (materialPrices[mat] ?? 500) * stop.volume_m3 * 0.15 * rng.nextFloat(0.8, 1.2)
        }
      }

      routes.push({
        vehicle_id: v + 1,
        stops,
        total_distance_km: Math.round(totalDist * 100) / 100,
        total_volume_m3: Math.round(currentVolume * 100) / 100,
        estimated_time_min: Math.round(totalDist / 0.5 + stops.length * 8),
        fuel_cost: Math.round(totalDist * fuelCostPerKm * 100) / 100,
        revenue_estimate: Math.round(revenue)
      })
    }
  }

  const unassigned = sorted.slice(pointIdx).map(p => p.id)
  const totalDist = routes.reduce((s, r) => s + r.total_distance_km, 0)
  const totalFuel = routes.reduce((s, r) => s + r.fuel_cost, 0)
  const totalRevenue = routes.reduce((s, r) => s + r.revenue_estimate, 0)
  const totalVolume = routes.reduce((s, r) => s + r.total_volume_m3, 0)

  return {
    routes,
    total_distance_km: Math.round(totalDist * 100) / 100,
    total_fuel_cost: Math.round(totalFuel * 100) / 100,
    total_revenue: totalRevenue,
    total_profit: totalRevenue - Math.round(totalFuel),
    co2_saved_kg: Math.round(totalVolume * 85 * rng.nextFloat(0.9, 1.1)),
    unassigned_points: unassigned,
    efficiency_metrics: {
      avg_vehicle_utilization: routes.length > 0 ? Math.round((totalVolume / (routes.length * input.vehicle_capacity_m3)) * 1000) / 10 : 0,
      avg_stops_per_route: routes.length > 0 ? Math.round(routes.reduce((s, r) => s + r.stops.length, 0) / routes.length * 10) / 10 : 0,
      revenue_per_km: totalDist > 0 ? Math.round(totalRevenue / totalDist * 100) / 100 : 0
    }
  }
}

// Tool 3: Landfill Operation Manager
function manageLandfill(input: LandfillInput, rng: SeededRandom): LandfillOperationResult {
  const dailyVolumeConsumed = input.daily_tonnage / input.waste_density_kg_m3 * 1000
  const remainingDays = dailyVolumeConsumed > 0 ? input.remaining_capacity_m3 / dailyVolumeConsumed : 0
  const remainingYears = remainingDays / 365
  const fillRate = input.total_capacity_m3 > 0 ? ((input.total_capacity_m3 - input.remaining_capacity_m3) / input.total_capacity_m3) * 100 : 0

  let operationalStatus: 'normal' | 'warning' | 'critical' = 'normal'
  if (remainingYears < 2) operationalStatus = 'warning'
  if (remainingYears < 0.5) operationalStatus = 'critical'

  const leachateGeneration = input.daily_tonnage * rng.nextFloat(0.08, 0.15)
  const treatmentUtilization = input.leachate_treatment_capacity_m3_day > 0 ? (leachateGeneration / input.leachate_treatment_capacity_m3_day) * 100 : 0
  const leachateLevelStatus: 'safe' | 'elevated' | 'critical' = input.leachate_level_m > 1.5 ? 'critical' : input.leachate_level_m > 0.8 ? 'elevated' : 'safe'

  const leachateActions: string[] = []
  if (leachateLevelStatus === 'critical') leachateActions.push('紧急: 渗滤液水位超标，立即启动应急处理设施')
  if (treatmentUtilization > 85) leachateActions.push('处理设施接近满负荷，建议扩容或引入第三方处理')
  leachateActions.push(`当前日产生量约${leachateGeneration.toFixed(1)}m³，处理能力利用率${treatmentUtilization.toFixed(1)}%`)
  leachateActions.push('建议安装渗滤液液位在线监测，实现自动预警')

  const methaneFlow = input.biogas_flow_rate_m3_h * (input.methane_content_pct / 100)
  const energyPotential = methaneFlow * 24 * 10.5 // kWh per m3 methane ~10.5 kWh
  const powerGenPotential = energyPotential * 0.35 // 35% gen efficiency
  const co2Reduction = methaneFlow * 24 * 365 * 0.002 * rng.nextFloat(0.9, 1.1)

  let biogasRecommendation = '建议建设沼气发电设施'
  if (input.biogas_flow_rate_m3_h > 500) biogasRecommendation = '沼气产量充足，建议建设装机1MW以上发电设施或提纯天然气'
  else if (input.biogas_flow_rate_m3_h > 200) biogasRecommendation = '沼气产量中等，建议建设小型发电或锅炉供热'
  else biogasRecommendation = '沼气产量较低，建议维持火炬燃烧，待产量提升后再利用'

  const compactionAssessment = input.waste_density_kg_m3 > 700
    ? '压实密度良好，达到卫生填埋标准'
    : input.waste_density_kg_m3 > 500
    ? '压实密度适中，建议增加压实遍数'
    : '压实密度偏低，需优化压实工艺'

  const coverAdequate = input.cover_soil_ratio >= 0.1
  const wellsSufficient = input.groundwater_monitoring_wells >= 4

  const operationalRecommendations: string[] = []
  if (remainingYears < 3) operationalRecommendations.push(`剩余库容仅${remainingYears.toFixed(1)}年，建议尽快启动扩建或新建填埋场选址`)
  if (fillRate > 80) operationalRecommendations.push(`填埋场已使用${fillRate.toFixed(1)}%，进入中后期管理阶段`)
  if (!coverAdequate) operationalRecommendations.push('日覆盖土比例不足10%，建议增加覆盖频次减少异味和飞散')
  if (!wellsSufficient) operationalRecommendations.push('地下水监测井数量不足，建议至少设置4口监测井')
  operationalRecommendations.push('建议建立填埋场信息化管理系统，实时监控气体、渗滤液和沉降数据')
  if (input.biogas_flow_rate_m3_h > 300) operationalRecommendations.push('沼气收集系统需定期检测，防止甲烷泄漏')

  return {
    landfill_name: input.landfill_name,
    status: {
      operational_status: operationalStatus,
      remaining_life_years: Math.round(remainingYears * 10) / 10,
      remaining_life_days: Math.round(remainingDays),
      fill_rate_pct: Math.round(fillRate * 10) / 10,
      daily_volume_consumed_m3: Math.round(dailyVolumeConsumed * 10) / 10
    },
    leachate: {
      current_level_status: leachateLevelStatus,
      daily_generation_m3: Math.round(leachateGeneration * 100) / 100,
      treatment_utilization_pct: Math.round(treatmentUtilization * 10) / 10,
      treatment_capacity_sufficient: treatmentUtilization < 85,
      recommended_actions: leachateActions
    },
    biogas: {
      methane_flow_m3_h: Math.round(methaneFlow * 10) / 10,
      energy_potential_kwh_day: Math.round(energyPotential),
      flare_efficiency_pct: Math.round(rng.nextFloat(85, 98)),
      power_generation_potential_kwh: Math.round(powerGenPotential),
      co2_reduction_tons_year: Math.round(co2Reduction),
      utilization_recommendation: biogasRecommendation
    },
    compaction_assessment: compactionAssessment,
    environmental_compliance: {
      liner_integrity: input.liner_type.includes('复合') || input.liner_type.includes('HDPE') ? '双层防渗系统完整' : '建议评估防渗层完整性',
      groundwater_status: wellsSufficient ? '监测网络完善' : '监测井不足，需补充',
      cover_soil_adequate: coverAdequate,
      monitoring_wells_sufficient: wellsSufficient
    },
    operational_recommendations: operationalRecommendations
  }
}

// Tool 4: Waste-to-Energy Planner
function planWasteToEnergy(input: WtEInput, rng: SeededRandom): WtEResult {
  const thermalPower = input.feedstock_tons_per_day * 1000 * input.calorific_value_mj_kg / 3600
  const grossPower = thermalPower * (input.boiler_efficiency_pct / 100) * (input.generator_efficiency_pct / 100)
  const auxiliaryConsumption = rng.nextFloat(12, 18)
  const netPower = grossPower * (1 - auxiliaryConsumption / 100)
  const annualGen = netPower * 1000 * (input.plant_availability_pct / 100) * 8760 / 1000
  const households = Math.round(annualGen * 10000 / 1200)

  const emissionResults: EmissionResult[] = [
    {
      pollutant: 'NOx',
      limit_mg_m3: input.emission_limits.nox_mg_m3,
      estimated_mg_m3: Math.round(input.emission_limits.nox_mg_m3 * rng.nextFloat(0.4, 0.85)),
      compliance_status: 'compliant',
      treatment_method: 'SNCR脱硝+低氮燃烧器'
    },
    {
      pollutant: 'SO2',
      limit_mg_m3: input.emission_limits.so2_mg_m3,
      estimated_mg_m3: Math.round(input.emission_limits.so2_mg_m3 * rng.nextFloat(0.3, 0.7)),
      compliance_status: 'compliant',
      treatment_method: '半干法脱酸+消石灰喷射'
    },
    {
      pollutant: '二噁英',
      limit_mg_m3: input.emission_limits.dioxin_ng_m3,
      estimated_mg_m3: Math.round(input.emission_limits.dioxin_ng_m3 * rng.nextFloat(0.2, 0.6) * 100) / 100,
      compliance_status: 'compliant',
      treatment_method: '活性炭喷射+布袋除尘+850°C以上燃烧控制'
    },
    {
      pollutant: 'CO',
      limit_mg_m3: input.emission_limits.co_mg_m3,
      estimated_mg_m3: Math.round(input.emission_limits.co_mg_m3 * rng.nextFloat(0.3, 0.8)),
      compliance_status: 'compliant',
      treatment_method: '优化燃烧控制+二次风调节'
    },
    {
      pollutant: '颗粒物',
      limit_mg_m3: input.emission_limits.particulate_mg_m3,
      estimated_mg_m3: Math.round(input.emission_limits.particulate_mg_m3 * rng.nextFloat(0.2, 0.6)),
      compliance_status: 'compliant',
      treatment_method: '布袋除尘器(效率>99.5%)'
    }
  ]

  for (const e of emissionResults) {
    if (e.pollutant === '二噁英') {
      if (e.estimated_mg_m3 > e.limit_mg_m3) e.compliance_status = 'exceedance'
      else if (e.estimated_mg_m3 > e.limit_mg_m3 * 0.8) e.compliance_status = 'marginal'
    } else {
      if (e.estimated_mg_m3 > e.limit_mg_m3) e.compliance_status = 'exceedance'
      else if (e.estimated_mg_m3 > e.limit_mg_m3 * 0.8) e.compliance_status = 'marginal'
    }
  }

  const bottomAsh = input.feedstock_tons_per_day * (input.bottom_ash_pct / 100)
  const flyAsh = input.feedstock_tons_per_day * (input.fly_ash_pct / 100)

  const steamEnergy = input.feedstock_tons_per_day * 1000 * input.calorific_value_mj_kg * (input.boiler_efficiency_pct / 100) / 1000
  const flueGas = input.feedstock_tons_per_day * 4500

  const carbonDisplacement = annualGen * 1000 * 0.00085
  const recs = Math.round(annualGen * 1000)

  const overallCompliance = emissionResults.every(e => e.compliance_status === 'compliant')
    ? '全部达标 ✓'
    : emissionResults.some(e => e.compliance_status === 'exceedance')
    ? '存在超标项 ✗'
    : '部分指标接近限值 ~'

  const optimizationRecs: string[] = []
  if (input.calorific_value_mj_kg < 7) optimizationRecs.push('入炉垃圾热值偏低，建议增加垃圾堆酵时间降低含水率')
  if (input.boiler_efficiency_pct < 80) optimizationRecs.push('锅炉效率有提升空间，建议检查过热器积灰和给水温度')
  optimizationRecs.push(`年发电量约${annualGen.toFixed(1)}GWh，可满足${households.toLocaleString()}户家庭用电`)
  if (bottomAsh > 20) optimizationRecs.push('底渣产量大，建议开展制砖或路基材料资源化利用')
  if (flyAsh > 10) optimizationRecs.push('飞灰需按危废管理，建议建设稳定化/固化处理设施')
  optimizationRecs.push('建议安装烟气在线监测系统(CEMS)并与环保部门联网')

  return {
    plant_name: input.plant_name,
    power_generation: {
      thermal_power_mw: Math.round(thermalPower * 100) / 100,
      gross_power_mw: Math.round(grossPower * 100) / 100,
      net_power_mw: Math.round(netPower * 100) / 100,
      auxiliary_consumption_pct: Math.round(auxiliaryConsumption * 10) / 10,
      annual_generation_gwh: Math.round(annualGen * 100) / 100,
      households_served: households
    },
    emission_results: emissionResults,
    ash_management: {
      bottom_ash_tons_day: Math.round(bottomAsh * 100) / 100,
      fly_ash_tons_day: Math.round(flyAsh * 100) / 100,
      bottom_ash_utilization: '可制砖、铺路等建材化利用',
      fly_ash_treatment: '螯合稳定化后安全填埋或水泥窑协同处置'
    },
    mass_balance: {
      feedstock_tons: input.feedstock_tons_per_day,
      steam_energy_gj: Math.round(steamEnergy * 100) / 100,
      power_output_mwh: Math.round(netPower * 24 * 100) / 100,
      flue_gas_nm3: Math.round(flueGas),
      residue_tons: Math.round((bottomAsh + flyAsh) * 100) / 100
    },
    environmental_performance: {
      overall_compliance: overallCompliance,
      carbon_displacement_tons_co2_year: Math.round(carbonDisplacement),
      renewable_energy_certificates: recs
    },
    optimization_recommendations: optimizationRecs
  }
}

// Tool 5: Hazardous Waste Tracker
function trackHazardousWaste(input: HazardousWasteInput, rng: SeededRandom): HazardousWasteResult {
  const totalWeight = input.waste_entries.reduce((s, e) => s + e.weight_kg, 0)

  const disposalMethods: Record<string, string[]> = {
    '焚烧': ['HW01', 'HW02', 'HW03', 'HW04', 'HW05', 'HW06', 'HW08', 'HW09', 'HW11', 'HW12', 'HW13', 'HW17', 'HW39', 'HW49'],
    '安全填埋': ['HW18', 'HW21', 'HW22', 'HW23', 'HW31', 'HW34', 'HW35', 'HW46', 'HW49'],
    '物理化学处理': ['HW09', 'HW17', 'HW22', 'HW29', 'HW34', 'HW35'],
    '资源化利用': ['HW06', 'HW08', 'HW12', 'HW17', 'HW22', 'HW46', 'HW49']
  }

  const entryStatuses: WasteEntryStatus[] = input.waste_entries.map(entry => {
    const compatibleMethods = disposalMethods[input.disposal_facility.method] ?? []
    let compatibility: 'compatible' | 'conditional' | 'incompatible' = 'incompatible'
    if (compatibleMethods.includes(entry.waste_code)) compatibility = 'compatible'
    else if (entry.waste_code.startsWith('HW')) compatibility = 'conditional'

    const specialReqs: string[] = []
    if (entry.hazard_class.includes('易燃')) specialReqs.push('需防爆运输车辆')
    if (entry.hazard_class.includes('腐蚀')) specialReqs.push('需耐腐蚀容器')
    if (entry.hazard_class.includes('毒性')) specialReqs.push('需密闭运输+应急物资')
    if (entry.hazard_class.includes('感染')) specialReqs.push('需冷链运输+专用包装')
    if (entry.physical_state === 'liquid') specialReqs.push('需防泄漏二次容器')
    if (entry.un_number) specialReqs.push(`UN编号: ${entry.un_number}`)

    return {
      waste_code: entry.waste_code,
      waste_name: entry.waste_name,
      hazard_class: entry.hazard_class,
      weight_kg: entry.weight_kg,
      physical_state: entry.physical_state,
      manifest_match: true,
      disposal_compatibility: compatibility,
      special_requirements: specialReqs
    }
  })

  const incompatibleCount = entryStatuses.filter(e => e.disposal_compatibility === 'incompatible').length
  const trackingStatus: 'in_transit' | 'delivered' | 'processing' | 'completed' | 'exception' =
    incompatibleCount > 0 ? 'exception' : 'in_transit'

  const riskAlerts: string[] = []
  if (incompatibleCount > 0) riskAlerts.push(`[严重] ${incompatibleCount}项危废与处置方式不兼容，需更换处置单位`)
  if (totalWeight > input.disposal_facility.capacity_remaining_tons * 1000) riskAlerts.push('[警告] 危废总量超出处置设施剩余容量')
  const flammable = input.waste_entries.filter(e => e.hazard_class.includes('易燃'))
  if (flammable.length > 0) riskAlerts.push(`[注意] ${flammable.length}项易燃废物，运输需符合JT/T 617标准`)
  riskAlerts.push('运输路线应避开人口密集区和水源保护区')
  riskAlerts.push('建议安装GPS定位和温湿度传感器实时监控')

  const regulatoryNotes: string[] = []
  regulatoryNotes.push('依据《国家危险废物名录(2021年版)》和《危险废物转移联单管理办法》管理')
  regulatoryNotes.push('危废转移需提前向移出地和接受地生态环境部门报备')
  regulatoryNotes.push('联单保存期限至少5年，电子联单与纸质联单具有同等效力')
  regulatoryNotes.push('运输车辆需持有道路危险货物运输许可证')
  if (input.waste_entries.some(e => e.waste_code === 'HW01')) {
    regulatoryNotes.push('医疗废物(HW01)需按照《医疗废物管理条例》单独管理，不得与其他危废混装')
  }

  return {
    manifest_id: input.manifest_id,
    tracking_status: trackingStatus,
    chain_of_custody: {
      generator: input.generator.name,
      transporter: input.transporter.name,
      disposal_facility: input.disposal_facility.name,
      transfer_date: input.transfer_date,
      expected_arrival: input.expected_arrival_date
    },
    total_weight_kg: Math.round(totalWeight),
    total_entries: input.waste_entries.length,
    entry_statuses: entryStatuses,
    compliance_check: {
      generator_license_valid: input.generator.license_no.length > 5,
      transporter_license_valid: input.transporter.license_no.length > 5,
      facility_license_valid: input.disposal_facility.license_no.length > 5,
      manifest_complete: input.waste_entries.every(e => e.waste_code && e.weight_kg > 0),
      multi_copy_system: true,
      overall_compliant: incompatibleCount === 0 && input.generator.license_no.length > 5
    },
    risk_alerts: riskAlerts,
    regulatory_notes: regulatoryNotes
  }
}

// Tool 6: Circular Economy Mapper
function mapCircularEconomy(input: CircularEconomyInput, rng: SeededRandom): CircularEconomyResult {
  const transportCostPerTonKm = input.transport_cost_per_ton_km ?? 0.35
  const symbiosisRadius = input.symbiosis_radius_km ?? 50

  const gradeScore: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }

  const matches: MatchResult[] = []
  const usedWaste = new Map<string, number>()

  for (const demand of input.industry_demands) {
    const candidates = input.waste_streams.filter(ws =>
      ws.material === demand.material_needed &&
      gradeScore[ws.quality_grade] >= gradeScore[demand.quality_requirement] - 1 &&
      ws.quantity_tons_year > 0
    ).sort((a, b) => {
      const distA = Math.sqrt((a.location.length - demand.location.length) ** 2) * 50
      const distB = Math.sqrt((b.location.length - demand.location.length) ** 2) * 50
      return distA - distB
    })

    let remainingNeed = demand.quantity_tons_year

    for (const candidate of candidates) {
      if (remainingNeed <= 0) break
      const used = usedWaste.get(candidate.material) ?? 0
      const available = candidate.quantity_tons_year - used
      if (available <= 0) continue

      const transportDist = rng.nextFloat(10, symbiosisRadius)
      const matchedQty = Math.min(available, remainingNeed)
      const transportCost = matchedQty * transportCostPerTonKm * transportDist
      const revenue = matchedQty * demand.willingness_to_pay_per_ton

      let qualityMatch: 'direct' | 'with_processing' | 'downcycled' = 'direct'
      if (gradeScore[candidate.quality_grade] < gradeScore[demand.quality_requirement]) {
        qualityMatch = 'with_processing'
      } else if (gradeScore[candidate.quality_grade] > gradeScore[demand.quality_requirement] + 1) {
        qualityMatch = 'downcycled'
      }

      const co2Factors: Record<string, number> = {
        '废塑料': 1.5, '废纸': 0.8, '废钢': 1.8, '废铝': 8.0, '废铜': 2.5,
        '废玻璃': 0.3, '餐厨垃圾': 0.5, '建筑垃圾': 0.1, '电子废弃物': 3.0,
        '废橡胶': 1.2, '废纺织品': 1.0, '秸秆': 0.2
      }
      const co2Avoided = matchedQty * (co2Factors[candidate.material] ?? 0.5)

      matches.push({
        waste_material: candidate.material,
        supplier_location: candidate.location,
        buyer_sector: demand.sector,
        buyer_location: demand.location,
        matched_quantity_tons: Math.round(matchedQty),
        quality_match: qualityMatch,
        transport_distance_km: Math.round(transportDist * 10) / 10,
        transport_cost_total: Math.round(transportCost),
        revenue_total: Math.round(revenue),
        value_created_per_ton: Math.round((revenue - transportCost) / matchedQty),
        co2_avoided_tons: Math.round(co2Avoided * 10) / 10
      })

      usedWaste.set(candidate.material, used + matchedQty)
      remainingNeed -= matchedQty
    }
  }

  const totalWaste = input.waste_streams.reduce((s, w) => s + w.quantity_tons_year, 0)
  const totalMatched = matches.reduce((s, m) => s + m.matched_quantity_tons, 0)

  const unmatchedWaste: Array<{ material: string; quantity_tons: number; reason: string }> = []
  for (const ws of input.waste_streams) {
    const used = usedWaste.get(ws.material) ?? 0
    if (used < ws.quantity_tons_year) {
      unmatchedWaste.push({
        material: ws.material,
        quantity_tons: Math.round(ws.quantity_tons_year - used),
        reason: input.industry_demands.some(d => d.material_needed === ws.material)
          ? '需求方采购量已满足'
          : '无匹配产业需求'
      })
    }
  }

  const symbiosisScore = Math.min(100, Math.round((totalMatched / Math.max(totalWaste, 1)) * 100 * 1.2))

  const recommendations: string[] = []
  recommendations.push(`产业共生匹配率${(totalMatched / Math.max(totalWaste, 1) * 100).toFixed(1)}%，共匹配${totalMatched.toLocaleString()}吨/年`)
  if (unmatchedWaste.length > 0) {
    recommendations.push(`仍有${unmatchedWaste.length}种废物未匹配，建议拓展下游利用渠道`)
  }
  recommendations.push('建议建设工业共生信息平台，实现废物-需求实时匹配')
  recommendations.push('对低品质废物(B/C级)建议开展预处理提升资源化价值')
  if (matches.some(m => m.quality_match === 'with_processing')) {
    recommendations.push('部分匹配需预处理加工，建议引入专业分拣中心')
  }
  recommendations.push('建议制定园区循环经济激励政策，降低物流和税收成本')

  return {
    matches,
    summary: {
      total_waste_tons: Math.round(totalWaste),
      total_matched_tons: totalMatched,
      utilization_rate_pct: Math.round((totalMatched / Math.max(totalWaste, 1)) * 1000) / 10,
      total_revenue: matches.reduce((s, m) => s + m.revenue_total, 0),
      total_co2_avoided: Math.round(matches.reduce((s, m) => s + m.co2_avoided_tons, 0) * 10) / 10,
      avg_transport_distance_km: matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.transport_distance_km, 0) / matches.length * 10) / 10 : 0
    },
    unmatched_waste: unmatchedWaste,
    industrial_symbiosis_score: symbiosisScore,
    recommendations
  }
}

// Tool 7: Smart Bin Monitor
function monitorSmartBins(input: SmartBinInput, rng: SeededRandom): SmartBinResult {
  const avgFill = input.bins.reduce((s, b) => s + b.fill_level_pct, 0) / Math.max(input.bins.length, 1)
  const binsAbove80 = input.bins.filter(b => b.fill_level_pct >= 80).length
  const binsAbove95 = input.bins.filter(b => b.fill_level_pct >= 95).length

  const alerts: BinAlert[] = []
  for (const bin of input.bins) {
    if (bin.fill_level_pct >= 95) {
      alerts.push({
        bin_id: bin.id,
        location: bin.location,
        alert_type: 'overflow',
        severity: 'critical',
        fill_level_pct: bin.fill_level_pct,
        action_required: '立即安排收运，满溢风险极高'
      })
    } else if (bin.fill_level_pct >= 80) {
      alerts.push({
        bin_id: bin.id,
        location: bin.location,
        alert_type: 'overflow',
        severity: 'warning',
        fill_level_pct: bin.fill_level_pct,
        action_required: '24小时内安排收运'
      })
    }
    if (bin.temperature_c > 60) {
      alerts.push({
        bin_id: bin.id,
        location: bin.location,
        alert_type: 'fire_risk',
        severity: 'critical',
        fill_level_pct: bin.fill_level_pct,
        action_required: '温度异常，存在自燃风险，立即检查'
      })
    }
    if (bin.tilt_detected) {
      alerts.push({
        bin_id: bin.id,
        location: bin.location,
        alert_type: 'tilt',
        severity: 'warning',
        fill_level_pct: bin.fill_level_pct,
        action_required: '设备倾倒，需现场确认'
      })
    }
    if (bin.battery_pct < 15) {
      alerts.push({
        bin_id: bin.id,
        location: bin.location,
        alert_type: 'low_battery',
        severity: 'info',
        fill_level_pct: bin.fill_level_pct,
        action_required: '电池电量低，安排更换'
      })
    }
  }

  // Sort bins by fill level descending for collection scheduling
  const urgentBins = input.bins.filter(b => b.fill_level_pct >= 80).sort((a, b) => b.fill_level_pct - a.fill_level_pct)
  const scheduledBins = input.bins.filter(b => b.fill_level_pct >= 50 && b.fill_level_pct < 80).sort((a, b) => b.fill_level_pct - a.fill_level_pct)
  const routineBins = input.bins.filter(b => b.fill_level_pct < 50).sort((a, b) => b.fill_level_pct - a.fill_level_pct)

  const allToCollect = [...urgentBins, ...scheduledBins, ...routineBins]
  const schedules: CollectionSchedule[] = []
  let binIdx = 0

  for (let v = 0; v < input.collection_vehicles && binIdx < allToCollect.length; v++) {
    const bins: string[] = []
    let volume = 0
    let distance = 0
    let currentLat = input.collection_depot.lat
    let currentLng = input.collection_depot.lng

    while (binIdx < allToCollect.length) {
      const bin = allToCollect[binIdx]
      if (volume + bin.capacity_liters > input.vehicle_capacity_liters && bins.length > 0) break

      const dist = Math.sqrt((bin.lat - currentLat) ** 2 + (bin.lng - currentLng) ** 2) * 111
      distance += dist
      volume += bin.capacity_liters * (bin.fill_level_pct / 100)
      bins.push(bin.id)
      currentLat = bin.lat
      currentLng = bin.lng
      binIdx++
    }

    if (bins.length > 0) {
      distance += Math.sqrt((currentLat - input.collection_depot.lat) ** 2 + (currentLng - input.collection_depot.lng) ** 2) * 111
      const priority: 'urgent' | 'scheduled' | 'routine' =
        urgentBins.some(b => bins.includes(b.id)) ? 'urgent' :
        scheduledBins.some(b => bins.includes(b.id)) ? 'scheduled' : 'routine'

      schedules.push({
        vehicle_id: v + 1,
        bins,
        estimated_volume_liters: Math.round(volume),
        route_distance_km: Math.round(distance * 100) / 100,
        estimated_time_min: Math.round(distance / 0.4 + bins.length * 5),
        priority
      })
    }
  }

  const totalVolume = urgentBins.reduce((s, b) => s + b.capacity_liters * (b.fill_level_pct / 100), 0) +
    scheduledBins.reduce((s, b) => s + b.capacity_liters * (b.fill_level_pct / 100), 0)
  const totalDist = schedules.reduce((s, sc) => s + sc.route_distance_km, 0)
  const totalTime = schedules.reduce((s, sc) => s + sc.estimated_time_min, 0)

  const maintenanceBins = input.bins.filter(b => b.battery_pct < 15 || b.tilt_detected).map(b => b.id)

  const optimizationRecs: string[] = []
  optimizationRecs.push(`平均填充率${avgFill.toFixed(1)}%，${binsAbove80}个桶超过80%需优先收运`)
  if (binsAbove95 > 0) optimizationRecs.push(`[紧急] ${binsAbove95}个桶即将满溢，需立即调度`)
  optimizationRecs.push(`预计总收运量${Math.round(totalVolume).toLocaleString()}升，总里程${totalDist.toFixed(1)}km`)
  if (schedules.length > input.collection_vehicles) {
    optimizationRecs.push(`当前${input.collection_vehicles}辆车不足，建议增加至${schedules.length}辆`)
  }
  optimizationRecs.push('建议基于历史数据预测填充趋势，实现动态调度')
  optimizationRecs.push('高填充率区域建议增设桶位或增加收运频次')
  if (maintenanceBins.length > 0) optimizationRecs.push(`${maintenanceBins.length}个设备需维护（低电量或倾倒）`)

  return {
    total_bins: input.bins.length,
    avg_fill_level: Math.round(avgFill * 10) / 10,
    bins_above_80pct: binsAbove80,
    bins_above_95pct: binsAbove95,
    alerts,
    collection_schedules: schedules,
    collection_summary: {
      total_volume_to_collect: Math.round(totalVolume),
      total_distance_km: Math.round(totalDist * 100) / 100,
      total_time_min: totalTime,
      vehicles_needed: schedules.length,
      fuel_cost_estimate: Math.round(totalDist * 1.2)
    },
    maintenance_bins: maintenanceBins,
    optimization_recommendations: optimizationRecs
  }
}

// Tool 8: Carbon Credit from Waste
function calculateWasteCarbonCredits(input: WasteCarbonInput, rng: SeededRandom): WasteCarbonResult {
  const emissionReductions: EmissionReduction[] = []

  // Baseline: waste to landfill generates methane
  const landfillEmissionFactor = 0.05 // tCO2e per ton waste
  const baselineEmissions = input.waste_diverted_tons_year * landfillEmissionFactor

  if (input.project_type === 'landfill_gas_recovery' || input.project_type === 'avoided_landfill') {
    const captureEff = input.methane_capture_efficiency ?? 0.65
    const methaneReduction = baselineEmissions * captureEff * 25 // CH4 GWP = 25
    emissionReductions.push({
      source: '避免填埋场甲烷排放',
      baseline_tco2e: Math.round(baselineEmissions * 25 * 100) / 100,
      project_tco2e: Math.round(baselineEmissions * 25 * (1 - captureEff) * 100) / 100,
      reduction_tco2e: Math.round(methaneReduction * 100) / 100,
      methodology_reference: 'CM-072-V01 或 CMS-022-V01'
    })
  }

  if (input.project_type === 'composting' && input.compost_output_tons_year) {
    const compostReduction = input.compost_output_tons_year * 0.55
    emissionReductions.push({
      source: '好氧堆肥替代填埋',
      baseline_tco2e: Math.round(input.compost_output_tons_year * landfillEmissionFactor * 25 * 100) / 100,
      project_tco2e: Math.round(input.compost_output_tons_year * 0.05 * 100) / 100,
      reduction_tco2e: Math.round(compostReduction * 100) / 100,
      methodology_reference: 'CMS-022-V01 堆肥避免甲烷排放'
    })
  }

  if (input.project_type === 'recycling' && input.recycled_output_tons_year) {
    const recyclingFactors: Record<string, number> = {
      '废塑料': 1.5, '废纸': 0.8, '废钢': 1.8, '废铝': 8.0, '废玻璃': 0.3
    }
    const factor = recyclingFactors['废塑料'] ?? 1.0
    const recyclingReduction = input.recycled_output_tons_year * factor
    emissionReductions.push({
      source: '再生利用替代原生材料',
      baseline_tco2e: Math.round(input.recycled_output_tons_year * factor * 100) / 100,
      project_tco2e: Math.round(input.recycled_output_tons_year * factor * 0.2 * 100) / 100,
      reduction_tco2e: Math.round(recyclingReduction * 0.8 * 100) / 100,
      methodology_reference: 'CMS-036-V01 废物回收利用减排'
    })
  }

  if (input.project_type === 'wte' && input.energy_generated_mwh_year) {
    const gridDisplacement = input.energy_generated_mwh_year * input.grid_emission_factor_tco2_mwh
    const avoidedLandfill = input.waste_diverted_tons_year * landfillEmissionFactor * 25
    emissionReductions.push({
      source: '焚烧发电替代电网+避免填埋',
      baseline_tco2e: Math.round((gridDisplacement + avoidedLandfill) * 100) / 100,
      project_tco2e: Math.round(input.energy_generated_mwh_year * 0.3 * 100) / 100,
      reduction_tco2e: Math.round((gridDisplacement + avoidedLandfill - input.energy_generated_mwh_year * 0.3) * 100) / 100,
      methodology_reference: 'CM-072-V01 垃圾焚烧发电'
    })
  }

  if (input.project_type === 'anaerobic_digestion') {
    const adReduction = input.waste_diverted_tons_year * 0.4
    const energyReduction = (input.energy_generated_mwh_year ?? 0) * input.grid_emission_factor_tco2_mwh
    emissionReductions.push({
      source: '厌氧消化产沼发电+沼渣利用',
      baseline_tco2e: Math.round((adReduction + energyReduction) * 1.2 * 100) / 100,
      project_tco2e: Math.round((adReduction + energyReduction) * 0.15 * 100) / 100,
      reduction_tco2e: Math.round((adReduction + energyReduction) * 1.05 * 100) / 100,
      methodology_reference: 'CMS-022-V01 厌氧消化替代填埋'
    })
  }

  const totalAnnual = emissionReductions.reduce((s, e) => s + e.reduction_tco2e, 0)
  const totalCrediting = totalAnnual * input.crediting_period_years

  const methodologyEligible = ['CM-072-V01', 'CMS-022-V01', 'CMS-036-V01'].some(m =>
    emissionReductions.some(e => e.methodology_reference.includes(m.split('-')[0] + '-' + m.split('-')[1]))
  )

  const creditValue = Math.round(totalAnnual * rng.nextFloat(40, 80))

  const monitoringReqs: string[] = []
  monitoringReqs.push('废物处理量在线计量，数据每日记录并上传')
  monitoringReqs.push('甲烷浓度/沼气流量连续监测(适用于沼气回收项目)')
  monitoringReqs.push('电网排放因子采用国家生态环境部公布值')
  monitoringReqs.push('每季度第三方核查，年度提交监测报告')
  if (input.project_type === 'composting') monitoringReqs.push('堆肥产品质量检测(重金属、有机质含量)')
  if (input.project_type === 'recycling') monitoringReqs.push('再生产品产量和销售去向追踪')

  const keyRisks: string[] = []
  keyRisks.push('废物产生量波动可能影响减排量稳定性')
  keyRisks.push('碳市场价格波动风险(当前CCER约40-80元/吨)')
  if (input.monitoring_data_years < 2) keyRisks.push('监测数据不足2年，可能影响基准线建立')
  keyRisks.push('政策风险: CCER方法学可能更新，需持续跟踪')
  keyRisks.push('额外性论证需证明项目在无碳收益情况下不可行')

  const recommendations: string[] = []
  recommendations.push(`预计年减排量${Math.round(totalAnnual).toLocaleString()} tCO2e，${input.crediting_period_years}年累计约${Math.round(totalCrediting).toLocaleString()} tCO2e`)
  recommendations.push(`按当前CCER价格估算，年收益约${Math.round(totalAnnual * 60).toLocaleString()} CNY`)
  if (totalAnnual > 50000) recommendations.push('年减排量超过5万吨，建议申请CCER国家核证自愿减排量')
  else if (totalAnnual > 10000) recommendations.push('年减排量超过1万吨，具备CCER开发潜力')
  else recommendations.push('年减排量较小，建议与同类项目打包开发或申请地方碳普惠')
  recommendations.push('建议聘请专业碳资产开发公司进行PDD文件编制和第三方核查')
  recommendations.push('关注全国温室气体自愿减排交易市场重启后的方法学更新')

  return {
    project_name: input.project_name,
    project_type: input.project_type,
    emission_reductions: emissionReductions,
    total_annual_reduction_tco2e: Math.round(totalAnnual * 100) / 100,
    total_crediting_period_reduction_tco2e: Math.round(totalCrediting * 100) / 100,
    ccer_assessment: {
      methodology_eligible: methodologyEligible,
      methodology_name: emissionReductions[0]?.methodology_reference ?? '待确认',
      additionality_demonstrated: input.monitoring_data_years >= 2,
      baseline_established: input.monitoring_data_years >= 1,
      monitoring_plan_adequate: input.monitoring_data_years >= 2,
      estimated_annual_credits: Math.round(totalAnnual),
      total_crediting_period_credits: Math.round(totalCrediting),
      credit_value_estimate_cny: creditValue
    },
    monitoring_requirements: monitoringReqs,
    key_risks: keyRisks,
    recommendations
  }
}

// ==================== SECTION 4 — Format Functions ====================

function formatCompositionReport(r: WasteCompositionResult): string {
  const lines: string[] = []
  lines.push('## 生活垃圾组分分析与减量化路径报告')
  lines.push('')
  lines.push(`**区域:** ${r.region} | **总人口:** ${r.population.toLocaleString()} | **人均日产生量:** ${r.per_capita_kg_day} kg/人/天`)
  lines.push('')
  lines.push('### 垃圾组分分析')
  lines.push('| 类别 | 重量(kg) | 占比(%) | 含水率(%) | 密度(kg/m³) |')
  lines.push('|------|----------|---------|-----------|-------------|')
  for (const b of r.breakdown) {
    lines.push(`| ${b.category} | ${b.weight_kg.toLocaleString()} | ${b.percentage}% | ${b.moisture_pct}% | ${b.density_kg_m3} |`)
  }
  lines.push('')
  lines.push('### 分类统计')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 可回收物占比 | ${r.recyclable_pct}% |`)
  lines.push(`| 有机垃圾占比 | ${r.organic_pct}% |`)
  lines.push(`| 有害垃圾占比 | ${r.hazardous_pct}% |`)
  lines.push(`| 当前分流率 | ${r.diversion_rate_current}% |`)
  lines.push(`| 潜在分流率 | ${r.diversion_rate_potential}% |`)
  lines.push('')
  lines.push('### 减量化路径')
  lines.push('| 类别 | 当前占比 | 目标占比 | 减量比例 | 年减量(吨) | 方法 | 优先级 |')
  lines.push('|------|----------|----------|----------|-----------|------|--------|')
  for (const p of r.reduction_pathways) {
    lines.push(`| ${p.category} | ${p.current_pct}% | ${p.target_pct}% | ${p.reduction}% | ${p.reduction_tons_year.toLocaleString()} | ${p.method} | ${p.priority === 'high' ? '高' : p.priority === 'medium' ? '中' : '低'} |`)
  }
  lines.push('')
  lines.push('### 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatRouteReport(r: RecyclingRouteResult): string {
  const lines: string[] = []
  lines.push('## 可回收物分拣路径与物流优化报告')
  lines.push('')
  lines.push('### 优化路径')
  for (const route of r.routes) {
    lines.push(`#### 车辆 ${route.vehicle_id}`)
    lines.push(`| 停靠点 | 纬度 | 经度 | 体积(m³) | 物料类型 | 累计距离(km) |`)
    lines.push(`|--------|------|------|----------|----------|-------------|`)
    for (const stop of route.stops) {
      lines.push(`| ${stop.point_id} | ${stop.lat} | ${stop.lng} | ${stop.volume_m3} | ${stop.material_types.join(',')} | ${stop.cumulative_distance_km} |`)
    }
    lines.push(`**总距离:** ${route.total_distance_km}km | **总体积:** ${route.total_volume_m3}m³ | **预计时间:** ${route.estimated_time_min}分钟 | **燃油成本:** ¥${route.fuel_cost} | **预计收入:** ¥${route.revenue_estimate.toLocaleString()}`)
    lines.push('')
  }
  lines.push('### 效率指标')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 总距离 | ${r.total_distance_km} km |`)
  lines.push(`| 总燃油成本 | ¥${r.total_fuel_cost} |`)
  lines.push(`| 总收入 | ¥${r.total_revenue.toLocaleString()} |`)
  lines.push(`| 总利润 | ¥${r.total_profit.toLocaleString()} |`)
  lines.push(`| CO₂减排 | ${r.co2_saved_kg.toLocaleString()} kg |`)
  lines.push(`| 车辆利用率 | ${r.efficiency_metrics.avg_vehicle_utilization}% |`)
  lines.push(`| 平均停靠数 | ${r.efficiency_metrics.avg_stops_per_route} |`)
  lines.push(`| 每公里收入 | ¥${r.efficiency_metrics.revenue_per_km} |`)
  if (r.unassigned_points.length > 0) {
    lines.push('')
    lines.push(`**未分配点位:** ${r.unassigned_points.join(', ')} (需增加车辆或次日安排)`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatLandfillReport(r: LandfillOperationResult): string {
  const lines: string[] = []
  lines.push('## 填埋场运营与渗滤液/沼气管理报告')
  lines.push('')
  lines.push(`**填埋场:** ${r.landfill_name} | **运营状态:** ${r.status.operational_status === 'normal' ? '正常 ✓' : r.status.operational_status === 'warning' ? '警告 ⚠' : '紧急 ✗'}`)
  lines.push('')
  lines.push('### 库容状态')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 剩余使用年限 | ${r.status.remaining_life_years} 年 (${r.status.remaining_life_days} 天) |`)
  lines.push(`| 已填比例 | ${r.status.fill_rate_pct}% |`)
  lines.push(`| 日消耗容积 | ${r.status.daily_volume_consumed_m3} m³ |`)
  lines.push('')
  lines.push('### 渗滤液管理')
  lines.push(`**水位状态:** ${r.leachate.current_level_status === 'safe' ? '安全 ✓' : r.leachate.current_level_status === 'elevated' ? '偏高 ⚠' : '超标 ✗'}`)
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 日产生量 | ${r.leachate.daily_generation_m3} m³ |`)
  lines.push(`| 处理设施利用率 | ${r.leachate.treatment_utilization_pct}% |`)
  lines.push(`| 处理能力充足 | ${r.leachate.treatment_capacity_sufficient ? '是 ✓' : '否 ✗'} |`)
  lines.push('')
  lines.push('**建议措施:**')
  for (const a of r.leachate.recommended_actions) lines.push(`- ${a}`)
  lines.push('')
  lines.push('### 沼气管理')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 甲烷流量 | ${r.biogas.methane_flow_m3_h} m³/h |`)
  lines.push(`| 日发电潜力 | ${r.biogas.energy_potential_kwh_day.toLocaleString()} kWh |`)
  lines.push(`| 火炬燃烧效率 | ${r.biogas.flare_efficiency_pct}% |`)
  lines.push(`| 发电潜力 | ${r.biogas.power_generation_potential_kwh.toLocaleString()} kWh/日 |`)
  lines.push(`| 年CO₂减排 | ${r.biogas.co2_reduction_tons_year} 吨 |`)
  lines.push('')
  lines.push(`**利用建议:** ${r.biogas.utilization_recommendation}`)
  lines.push('')
  lines.push('### 环境合规')
  lines.push(`- **防渗层:** ${r.environmental_compliance.liner_integrity}`)
  lines.push(`- **地下水:** ${r.environmental_compliance.groundwater_status}`)
  lines.push(`- **覆盖土:** ${r.environmental_compliance.cover_soil_adequate ? '充足 ✓' : '不足 ✗'}`)
  lines.push(`- **监测井:** ${r.environmental_compliance.monitoring_wells_sufficient ? '充足 ✓' : '不足 ✗'}`)
  lines.push('')
  lines.push('### 运营建议')
  for (const rec of r.operational_recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatWtEReport(r: WtEResult): string {
  const lines: string[] = []
  lines.push('## 垃圾焚烧发电效率与排放控制报告')
  lines.push('')
  lines.push(`**电厂:** ${r.plant_name}`)
  lines.push('')
  lines.push('### 发电效率')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 热功率 | ${r.power_generation.thermal_power_mw} MW |`)
  lines.push(`| 毛发电功率 | ${r.power_generation.gross_power_mw} MW |`)
  lines.push(`| 净发电功率 | ${r.power_generation.net_power_mw} MW |`)
  lines.push(`| 厂用电率 | ${r.power_generation.auxiliary_consumption_pct}% |`)
  lines.push(`| 年发电量 | ${r.power_generation.annual_generation_gwh} GWh |`)
  lines.push(`| 服务家庭 | ${r.power_generation.households_served.toLocaleString()} 户 |`)
  lines.push('')
  lines.push('### 排放控制')
  lines.push('| 污染物 | 限值(mg/m³) | 预测排放(mg/m³) | 达标状态 | 治理技术 |')
  lines.push('|--------|-------------|-----------------|----------|---------|')
  for (const e of r.emission_results) {
    const statusLabel = e.compliance_status === 'compliant' ? '达标 ✓' : e.compliance_status === 'marginal' ? '接近限值 ~' : '超标 ✗'
    lines.push(`| ${e.pollutant} | ${e.limit_mg_m3} | ${e.estimated_mg_m3} | ${statusLabel} | ${e.treatment_method} |`)
  }
  lines.push('')
  lines.push('### 灰渣管理')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 底渣产量 | ${r.ash_management.bottom_ash_tons_day} 吨/日 |`)
  lines.push(`| 飞灰产量 | ${r.ash_management.fly_ash_tons_day} 吨/日 |`)
  lines.push(`| 底渣利用 | ${r.ash_management.bottom_ash_utilization} |`)
  lines.push(`| 飞灰处理 | ${r.ash_management.fly_ash_treatment} |`)
  lines.push('')
  lines.push('### 物质平衡')
  lines.push(`| 输入 | 数值 | 输出 | 数值 |`)
  lines.push(`|------|------|------|------|`)
  lines.push(`| 入炉垃圾 | ${r.mass_balance.feedstock_tons} 吨/日 | 蒸汽能量 | ${r.mass_balance.steam_energy_gj} GJ |`)
  lines.push(`| | | 上网电量 | ${r.mass_balance.power_output_mwh} MWh/日 |`)
  lines.push(`| | | 烟气量 | ${r.mass_balance.flue_gas_nm3.toLocaleString()} Nm³ |`)
  lines.push(`| | | 残渣 | ${r.mass_balance.residue_tons} 吨/日 |`)
  lines.push('')
  lines.push('### 环境绩效')
  lines.push(`- **总体达标:** ${r.environmental_performance.overall_compliance}`)
  lines.push(`- **碳替代减排:** ${r.environmental_performance.carbon_displacement_tons_co2_year.toLocaleString()} tCO₂/年`)
  lines.push(`- **绿证:** ${r.environmental_performance.renewable_energy_certificates.toLocaleString()} 张`)
  lines.push('')
  lines.push('### 优化建议')
  for (const rec of r.optimization_recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatHazardousWasteReport(r: HazardousWasteResult): string {
  const lines: string[] = []
  lines.push('## 危废全生命周期追踪与联单管理报告')
  lines.push('')
  lines.push(`**联单编号:** ${r.manifest_id} | **追踪状态:** ${r.tracking_status === 'in_transit' ? '运输中' : r.tracking_status === 'delivered' ? '已送达' : r.tracking_status === 'exception' ? '异常 ✗' : r.tracking_status}`)
  lines.push('')
  lines.push('### 转移链')
  lines.push(`| 环节 | 单位 |`)
  lines.push(`|------|------|`)
  lines.push(`| 产生单位 | ${r.chain_of_custody.generator} |`)
  lines.push(`| 运输单位 | ${r.chain_of_custody.transporter} |`)
  lines.push(`| 处置单位 | ${r.chain_of_custody.disposal_facility} |`)
  lines.push(`| 转移日期 | ${r.chain_of_custody.transfer_date} |`)
  lines.push(`| 预计到达 | ${r.chain_of_custody.expected_arrival} |`)
  lines.push('')
  lines.push('### 危废清单')
  lines.push('| 代码 | 名称 | 危害类别 | 重量(kg) | 物理形态 | 处置兼容性 | 特殊要求 |')
  lines.push('|------|------|----------|----------|----------|-----------|---------|')
  for (const e of r.entry_statuses) {
    const compatLabel = e.disposal_compatibility === 'compatible' ? '兼容 ✓' : e.disposal_compatibility === 'conditional' ? '有条件 ~' : '不兼容 ✗'
    lines.push(`| ${e.waste_code} | ${e.waste_name} | ${e.hazard_class} | ${e.weight_kg.toLocaleString()} | ${e.physical_state} | ${compatLabel} | ${e.special_requirements.join('; ')} |`)
  }
  lines.push('')
  lines.push(`**总重量:** ${r.total_weight_kg.toLocaleString()} kg | **总条目:** ${r.total_entries}`)
  lines.push('')
  lines.push('### 合规检查')
  lines.push(`| 检查项 | 状态 |`)
  lines.push(`|--------|------|`)
  lines.push(`| 产生单位许可证 | ${r.compliance_check.generator_license_valid ? '有效 ✓' : '无效 ✗'} |`)
  lines.push(`| 运输单位许可证 | ${r.compliance_check.transporter_license_valid ? '有效 ✓' : '无效 ✗'} |`)
  lines.push(`| 处置单位许可证 | ${r.compliance_check.facility_license_valid ? '有效 ✓' : '无效 ✗'} |`)
  lines.push(`| 联单完整性 | ${r.compliance_check.manifest_complete ? '完整 ✓' : '不完整 ✗'} |`)
  lines.push(`| 多联单制度 | ${r.compliance_check.multi_copy_system ? '已执行 ✓' : '未执行 ✗'} |`)
  lines.push(`| **总体合规** | **${r.compliance_check.overall_compliant ? '合规 ✓' : '不合规 ✗'}** |`)
  lines.push('')
  if (r.risk_alerts.length > 0) {
    lines.push('### 风险预警')
    for (const alert of r.risk_alerts) lines.push(`- ${alert}`)
    lines.push('')
  }
  lines.push('### 法规要点')
  for (const note of r.regulatory_notes) lines.push(`- ${note}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatCircularEconomyReport(r: CircularEconomyResult): string {
  const lines: string[] = []
  lines.push('## 循环经济产业链匹配与资源化报告')
  lines.push('')
  lines.push('### 匹配结果')
  lines.push('| 废物 | 供应地 | 利用产业 | 需求地 | 匹配量(吨) | 质量匹配 | 运距(km) | 运输成本(元) | 收入(元) | 吨产值(元) | CO₂避免(吨) |')
  lines.push('|------|--------|----------|--------|-----------|----------|----------|-------------|---------|-----------|------------|')
  for (const m of r.matches) {
    const qualityLabel = m.quality_match === 'direct' ? '直接利用' : m.quality_match === 'with_processing' ? '需加工' : '降级利用'
    lines.push(`| ${m.waste_material} | ${m.supplier_location} | ${m.buyer_sector} | ${m.buyer_location} | ${m.matched_quantity_tons.toLocaleString()} | ${qualityLabel} | ${m.transport_distance_km} | ${m.transport_cost_total.toLocaleString()} | ${m.revenue_total.toLocaleString()} | ${m.value_created_per_ton} | ${m.co2_avoided_tons} |`)
  }
  lines.push('')
  lines.push('### 匹配总览')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 废物总量 | ${r.summary.total_waste_tons.toLocaleString()} 吨/年 |`)
  lines.push(`| 已匹配量 | ${r.summary.total_matched_tons.toLocaleString()} 吨/年 |`)
  lines.push(`| 利用率 | ${r.summary.utilization_rate_pct}% |`)
  lines.push(`| 总收入 | ¥${r.summary.total_revenue.toLocaleString()} |`)
  lines.push(`| CO₂避免 | ${r.summary.total_co2_avoided.toLocaleString()} 吨 |`)
  lines.push(`| 平均运距 | ${r.summary.avg_transport_distance_km} km |`)
  lines.push(`| 产业共生评分 | ${r.industrial_symbiosis_score}/100 |`)
  if (r.unmatched_waste.length > 0) {
    lines.push('')
    lines.push('### 未匹配废物')
    for (const u of r.unmatched_waste) lines.push(`- ${u.material}: ${u.quantity_tons.toLocaleString()}吨/年 — ${u.reason}`)
  }
  lines.push('')
  lines.push('### 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatSmartBinReport(r: SmartBinResult): string {
  const lines: string[] = []
  lines.push('## 智能垃圾桶满溢监测与收运调度报告')
  lines.push('')
  lines.push('### 总体状态')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 总桶数 | ${r.total_bins} |`)
  lines.push(`| 平均填充率 | ${r.avg_fill_level}% |`)
  lines.push(`| 超80%桶数 | ${r.bins_above_80pct} |`)
  lines.push(`| 超95%桶数 | ${r.bins_above_95pct} |`)
  lines.push('')
  if (r.alerts.length > 0) {
    lines.push('### 告警信息')
    lines.push('| 桶编号 | 位置 | 告警类型 | 严重程度 | 填充率 | 处置建议 |')
    lines.push('|--------|------|----------|----------|--------|---------|')
    for (const a of r.alerts) {
      const typeLabel = a.alert_type === 'overflow' ? '满溢' : a.alert_type === 'fire_risk' ? '高温' : a.alert_type === 'tilt' ? '倾倒' : a.alert_type === 'low_battery' ? '低电量' : '超期'
      const severityLabel = a.severity === 'critical' ? '紧急' : a.severity === 'warning' ? '警告' : '提示'
      lines.push(`| ${a.bin_id} | ${a.location} | ${typeLabel} | ${severityLabel} | ${a.fill_level_pct}% | ${a.action_required} |`)
    }
    lines.push('')
  }
  lines.push('### 收运调度')
  for (const s of r.collection_schedules) {
    const priorityLabel = s.priority === 'urgent' ? '紧急' : s.priority === 'scheduled' ? '计划' : '常规'
    lines.push(`**车辆${s.vehicle_id}** [${priorityLabel}]: ${s.bins.join(' → ')} | 体积: ${s.estimated_volume_liters}L | 里程: ${s.route_distance_km}km | 时间: ${s.estimated_time_min}分钟`)
  }
  lines.push('')
  lines.push('### 收运汇总')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 总收运量 | ${r.collection_summary.total_volume_to_collect.toLocaleString()} 升 |`)
  lines.push(`| 总里程 | ${r.collection_summary.total_distance_km} km |`)
  lines.push(`| 总时间 | ${r.collection_summary.total_time_min} 分钟 |`)
  lines.push(`| 需车辆数 | ${r.collection_summary.vehicles_needed} |`)
  lines.push(`| 燃油成本 | ¥${r.collection_summary.fuel_cost_estimate} |`)
  if (r.maintenance_bins.length > 0) {
    lines.push('')
    lines.push(`**需维护设备:** ${r.maintenance_bins.join(', ')}`)
  }
  lines.push('')
  lines.push('### 优化建议')
  for (const rec of r.optimization_recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatCarbonCreditReport(r: WasteCarbonResult): string {
  const lines: string[] = []
  lines.push('## 垃圾管理碳减排核算与CCER报告')
  lines.push('')
  lines.push(`**项目:** ${r.project_name} | **类型:** ${r.project_type}`)
  lines.push('')
  lines.push('### 减排量核算')
  lines.push('| 减排来源 | 基准线(tCO₂e) | 项目排放(tCO₂e) | 减排量(tCO₂e) | 方法学依据 |')
  lines.push('|----------|--------------|----------------|--------------|-----------|')
  for (const e of r.emission_reductions) {
    lines.push(`| ${e.source} | ${e.baseline_tco2e.toLocaleString()} | ${e.project_tco2e.toLocaleString()} | ${e.reduction_tco2e.toLocaleString()} | ${e.methodology_reference} |`)
  }
  lines.push('')
  lines.push('### 减排汇总')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 年减排量 | ${r.total_annual_reduction_tco2e.toLocaleString()} tCO₂e |`)
  lines.push(`| 计入期总减排 | ${r.total_crediting_period_reduction_tco2e.toLocaleString()} tCO₂e |`)
  lines.push('')
  lines.push('### CCER评估')
  lines.push(`| 评估项 | 状态 |`)
  lines.push(`|--------|------|`)
  lines.push(`| 方法学适用 | ${r.ccer_assessment.methodology_eligible ? '符合 ✓' : '不符合 ✗'} |`)
  lines.push(`| 方法学名称 | ${r.ccer_assessment.methodology_name} |`)
  lines.push(`| 额外性论证 | ${r.ccer_assessment.additionality_demonstrated ? '已论证 ✓' : '待论证 ✗'} |`)
  lines.push(`| 基准线建立 | ${r.ccer_assessment.baseline_established ? '已建立 ✓' : '待建立 ✗'} |`)
  lines.push(`| 监测计划 | ${r.ccer_assessment.monitoring_plan_adequate ? '充分 ✓' : '待完善 ✗'} |`)
  lines.push(`| 预计年减排信用 | ${r.ccer_assessment.estimated_annual_credits.toLocaleString()} |`)
  lines.push(`| 计入期总信用 | ${r.ccer_assessment.total_crediting_period_credits.toLocaleString()} |`)
  lines.push(`| 预估碳收益 | ¥${r.ccer_assessment.credit_value_estimate_cny.toLocaleString()}/年 |`)
  lines.push('')
  lines.push('### 监测要求')
  for (const req of r.monitoring_requirements) lines.push(`- ${req}`)
  lines.push('')
  lines.push('### 关键风险')
  for (const risk of r.key_risks) lines.push(`- [风险] ${risk}`)
  lines.push('')
  lines.push('### 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Waste Composition Analyzer
  tools.register(defineTool({
    name: 'waste_composition_analyzer',
    description: 'Analyze municipal solid waste composition with detailed category breakdown (organics, recyclables, hazardous, other), calculate per-capita generation rates, assess current diversion potential, and generate prioritized reduction pathways with annual tonnage targets.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { region (string), population (int), season (spring/summer/autumn/winter), waste_samples: [{ category, weight_kg, moisture_pct }], gdp_per_capita (optional number), collection_days_per_week (optional int) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: WasteCompositionInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeWasteComposition(input, rng)
      return formatCompositionReport(result)
    }
  }))

  // Tool 2: Recycling Route Optimizer
  tools.register(defineTool({
    name: 'recycling_route_optimizer',
    description: 'Optimize recycling collection routes using sweep algorithm with haversine distance calculation. Assign collection points to vehicles by capacity constraints, calculate fuel costs and revenue from material sales, and estimate CO2 savings from recycling activities.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { depot_location: { lat, lng }, collection_points: [{ id, lat, lng, volume_m3, material_types }], vehicle_capacity_m3 (number), num_vehicles (int), material_prices (optional Record<string, number>), fuel_cost_per_km (optional number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: RecyclingRouteInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = optimizeRecyclingRoutes(input, rng)
      return formatRouteReport(result)
    }
  }))

  // Tool 3: Landfill Operation Manager
  tools.register(defineTool({
    name: 'landfill_operation_manager',
    description: 'Manage landfill operations including remaining life assessment, leachate level monitoring with treatment capacity analysis, biogas/methane flow evaluation for energy recovery potential, compaction quality assessment, and environmental compliance checking (liner integrity, groundwater monitoring, cover soil).',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { landfill_name, daily_tonnage, total_capacity_m3, remaining_capacity_m3, waste_density_kg_m3, leachate_level_m, leachate_treatment_capacity_m3_day, biogas_flow_rate_m3_h, methane_content_pct, cover_soil_ratio, compaction_equipment, liner_type, groundwater_monitoring_wells }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: LandfillInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = manageLandfill(input, rng)
      return formatLandfillReport(result)
    }
  }))

  // Tool 4: Waste-to-Energy Planner
  tools.register(defineTool({
    name: 'waste_to_energy_planner',
    description: 'Plan waste-to-energy incineration plant operations including power generation efficiency (thermal, gross, net), emission compliance assessment for NOx/SO2/dioxin/CO/particulate per GB 18485, ash management (bottom ash utilization and fly ash treatment), mass balance calculation, and carbon displacement estimation.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { plant_name, feedstock_tons_per_day, calorific_value_mj_kg, boiler_efficiency_pct, generator_efficiency_pct, plant_availability_pct, emission_limits: { nox_mg_m3, so2_mg_m3, dioxin_ng_m3, co_mg_m3, particulate_mg_m3 }, flue_gas_treatment (string[]), ash_content_pct, bottom_ash_pct, fly_ash_pct }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: WtEInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = planWasteToEnergy(input, rng)
      return formatWtEReport(result)
    }
  }))

  // Tool 5: Hazardous Waste Tracker
  tools.register(defineTool({
    name: 'hazardous_waste_tracker',
    description: 'Track hazardous waste lifecycle from generation through transport to disposal with manifest management. Verify disposal compatibility by waste code, check chain of custody compliance (generator/transporter/facility licenses), identify risk alerts, and provide regulatory notes per national hazardous waste regulations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { manifest_id, waste_entries: [{ waste_code, waste_name, hazard_class, weight_kg, physical_state, un_number (optional), packing_group (optional) }], generator: { name, license_no, address, contact }, transporter: { name, license_no, vehicle_id, driver }, disposal_facility: { name, license_no, method, capacity_remaining_tons }, transfer_date, expected_arrival_date }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: HazardousWasteInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = trackHazardousWaste(input, rng)
      return formatHazardousWasteReport(result)
    }
  }))

  // Tool 6: Circular Economy Mapper
  tools.register(defineTool({
    name: 'circular_economy_mapper',
    description: 'Map circular economy industrial symbiosis by matching waste streams with industry demands based on material type, quality grade, and transport distance. Calculate economic value creation, CO2 avoidance, utilization rate, and industrial symbiosis score with actionable recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { waste_streams: [{ material, quantity_tons_year, quality_grade (A/B/C/D), location, current_fate, contamination_pct }], industry_demands: [{ sector, material_needed, quantity_tons_year, quality_requirement (A/B/C/D), location, willingness_to_pay_per_ton }], transport_cost_per_ton_km (optional number), symbiosis_radius_km (optional number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CircularEconomyInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = mapCircularEconomy(input, rng)
      return formatCircularEconomyReport(result)
    }
  }))

  // Tool 7: Smart Bin Monitor
  tools.register(defineTool({
    name: 'smart_bin_monitor',
    description: 'Monitor smart bin fill levels with overflow detection, fire risk alerts (temperature), tilt detection, and low battery warnings. Generate prioritized collection schedules by vehicle capacity constraints, calculate route distances and fuel costs, and provide optimization recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { bins: [{ id, location, lat, lng, fill_level_pct, capacity_liters, last_collected, temperature_c, tilt_detected, battery_pct, material_type }], collection_vehicles (int), vehicle_capacity_liters (int), collection_depot: { lat, lng }, max_collection_time_hours (number), priority_zones (optional string[]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: SmartBinInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = monitorSmartBins(input, rng)
      return formatSmartBinReport(result)
    }
  }))

  // Tool 8: Carbon Credit from Waste
  tools.register(defineTool({
    name: 'carbon_credit_from_waste',
    description: 'Calculate carbon emission reductions from waste management projects per CCER methodology. Assess landfill gas recovery, composting, recycling, waste-to-energy, and anaerobic digestion projects. Evaluate methodology eligibility, additionality, baseline establishment, and estimate CCER credit value.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { project_type (landfill_gas_recovery/composting/recycling/wte/anaerobic_digestion/avoided_landfill), project_name, location, baseline_scenario, waste_diverted_tons_year, landfill_diversion_pct, methane_capture_efficiency (optional), compost_output_tons_year (optional), recycled_output_tons_year (optional), energy_generated_mwh_year (optional), grid_emission_factor_tco2_mwh, methodology, crediting_period_years, monitoring_data_years }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: WasteCarbonInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = calculateWasteCarbonCredits(input, rng)
      return formatCarbonCreditReport(result)
    }
  }))

  console.log(`[dsh-tool-wasteagentpro] Loaded v${VERSION} - Solid Waste Management AI Agent with 8 tools`)
  console.log('  Tools: waste_composition_analyzer, recycling_route_optimizer, landfill_operation_manager, waste_to_energy_planner, hazardous_waste_tracker, circular_economy_mapper, smart_bin_monitor, carbon_credit_from_waste')
}
