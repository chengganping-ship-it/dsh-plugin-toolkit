/**
 * DSH 氢能AI智能体 v1.0.0 (hydrogenenergyagent)
 * 绿氢全产业链分析与安全合规工具集 for DeepSeek Harness — 聚焦电解槽、储氢、燃料电池、物流、经济学、安全、加氢站与产业链映射
 *
 * 工具清单:
 * 1. electrolyyzer_efficiency_optimizer  — 电解槽效率优化与能耗分析（碱式电解槽/AWE、质子交换膜PEM、固体氧化物SOEC）
 * 2. hydrogen_storage_designer           — 储氢方案设计与材料选择（高压气态、液态、LOHC、金属氢化物）
 * 3. fuel_cell_performance_monitor       — 燃料电池性能衰减与寿命预测（PEMFC、SOFC、退化机制）
 * 4. hydrogen_logistics_planner          — 氢能物流与长管拖车/液氢运输规划
 * 5. green_hydrogen_economics            — 绿氢成本分析与平准化LCOH计算
 * 6. hydrogen_safety_compliance          — 氢安全规范与ISO/TR 15916合规评估
 * 7. hydrogen_refueling_station           — 加氢站布局与35/70MPa配置优化
 * 8. hydrogen_value_chain_mapper          — 氢能产业链与工业园区耦合映射
 *
 * @module dsh-tool-hydrogenenergyagent | @version 1.0.0 | @license MIT
 * @author hydrogen-energy-team
 *
 * ⚠️  安全免责声明: 氢具有高可燃性、低点火能、宽爆炸极限等特征，所有涉及氢系统设计、操作、维护的决策须由
 *    持证安全工程师依据所在司法管辖区的法规（如中国GB 50177、NFPA 2、ISO 19880）进行验证。本分析仅供AI辅助参考。
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'hydrogenenergyagent'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '⚠️ 免责声明: 本分析基于AI模型推断，仅供技术参考。氢气具有低点火能(0.02mJ)、宽爆炸极限(4-75%)和高扩散性等特征，所有系统设计、操作和维护决策须由持证安全工程师依据NFPA 2、ISO 19880、GB 50177等法规验证。不替代专业氢能工程决策。'

// ==================== SECTION 1 — Seeded Random ====================

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

  pick(arr: string[]): string {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: 电解槽效率优化 ---
interface ElectrolyzerInput {
  electrolyzer_type: 'alkaline' | 'pem' | 'soec' | 'aem'
  rated_power_mw: number
  operating_current_density: number
  operating_temperature_c: number
  hydrogen_production_rate_kg_h: number
  electricity_cost_per_kwh: number
  cathode_material?: string
  anode_material?: string
  membrane_thickness_mm?: number
  operating_pressure_bar?: number
  renewable_utilization_pct?: number
}

interface ElectrolyzerMetrics {
  stack_efficiency_lhv: number
  system_efficiency_lhv: number
  specific_energy_consumption_kwh_kg: number
  faradaic_efficiency_pct: number
  voltage_efficiency_pct: number
  current_density_actual: number
  thermal_management_score: number
}

interface DegradationAnalysis {
  expected_lifetime_h: number
  degradation_rate_uv_h: number
  catalyst_stability: string
  membrane_health_factor: number
  recommended_replacement_components: string[]
}

interface ElectrolyzerResult {
  electrolyzer_type: string
  rated_power_mw: number
  metrics: ElectrolyzerMetrics
  degradation: DegradationAnalysis
  optimization_suggestions: string[]
  economic_side: {
    hydrogen_production_cost_per_kg: number
    annual_operating_cost_kyuan: number
    efficiency_improvement_potential_pct: number
  }
}

// --- Tool 2: 储氢方案设计 ---
interface StorageInput {
  storage_requirement: 'stationary' | 'transportation' | 'mobile' | 'underground'
  hydrogen_mass_kg: number
  storage_duration_hours: number
  max_pressure_bar: number
  available_volume_m3: number
  cycle_frequency_daily: number
  ambient_temperature_range_c: [number, number]
  targetType_application: string
  purity_requirement_pct: number
}

interface StorageDesign {
  recommended_method: string
  alternative_methods: string[]
  storage_efficiency: {
    gravitational_density_wt_pct: number
    volumetric_density_kg_m3: number
    round_trip_efficiency_pct: number
    boil_off_rate_pct_day: number | null
  }
  vessel_specifications: {
    vessel_type: string
    material: string
    mass_kg: number
    outer_dimensions: string
    safety_factor: number
  }
  material_selection: {
    primary_material: string
    liner_material?: string
    composite_type?: string
    hydrogen_embrittlement_mitigation: string
  }
  safety_features: string[]
  cost_estimate_cny: number
}

// --- Tool 3: 燃料电池性能监测 ---
interface FuelCellInput {
  fuel_cell_type: 'pemfc' | 'sofc' | 'pafc' | 'mcfc' | 'dmfc'
  rated_power_kw: number
  operating_hours: number
  operating_temperature_c: number
  current_voltage: number
  rated_voltage: number
  hydrogen_purity_pct: number
  air_utilization_pct: number
  stack_count: number
  single_cell_count: number
  duty_cycle: 'baseload' | 'peaking' | 'intermittent' | 'transport'
  startup_cycles: number
  field_experience_years: number
}

interface DegradationStatus {
  voltage_degradation_uv_y: number
  current_max_power_pct_rated: number
  membrane_degradation: string
  catalyst_active_area_loss_pct: number
  gdl_corrosion_level: string
  bipolar_plate_condition: string
  remaining_useful_life_h: number
  remaining_useful_life_percentage: number
}

interface DegradationMechanism {
  mechanism: string
  contribution_pct: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  reversible: boolean
  mitigation: string
}

interface FuelCellResult {
  fuel_cell_type: string
  rated_power_kw: number
  status: DegradationStatus
  mechanisms: DegradationMechanism[]
  maintenance: {
    required_actions: string[]
    estimated_maintenance_cost_kyuan: number
    next_inspection_hours: number
    critical_components_to_monitor: string[]
  }
  recommendations: string[]
}

// --- Tool 4: 氢能物流规划 ---
interface LogisticsInput {
  supply_location: string
  demand_location: string
  distance_km: number
  hydrogen_volume_ton_day: number
  transport_mode: 'tube_trailer' | 'liquid_h2' | 'pipeline' | 'lohc' | 'ammonia_carrier' | 'mixed'
  delivery_frequency: 'daily' | 'weekly' | 'monthly'
  road_grade: 'highway' | 'mountain' | 'urban' | 'mixed'
  ambient_temperature_range_c: [number, number]
  end_use_pressure_bar: number
  purity_requirement_pct: number
  storage_buffer_days: number
}

interface VehicleConfig {
  vehicle_type: string
  capacity_kg: number
  operating_pressure_bar: number
  trips_per_day: number
  fuel_cost_per_km: number
  estimated_vehicle_count: number
  loading_unloading_time_h: number
}

interface PipelineAlternative {
  pipeline_length_km: number
  pipe_diameter_mm: number
  operating_pressure_bar: number
  capital_cost_million: number
  operating_cost_per_kg_km: number
  feasibility: string
}

interface LogisticsResult {
  selected_mode: string
  vehicle_config: VehicleConfig
  logistics_cost: {
    transport_cost_per_kg: number
    total_daily_cost_kyuan: number
    storage_buffer_cost: number
  }
  comparison: {
    tube_trailer_cost_per_kg: number
    liquid_h2_cost_per_kg: number
    pipeline_cost_per_kg: number | null
  }
  timeline: {
    one_way_transit_time_h: number
    daily_throughput_kg: number
  }
  pipeline_alternative: PipelineAlternative | null
  risk_assessment: string[]
  recommendations: string[]
}

// --- Tool 5: 绿氢经济学 ---
interface EconomicsInput {
  project_name: string
  location: string
  electrolyzer_capacity_mw: number
  electricity_source: 'grid' | 'renewable_captive' | 'ppa' | 'hybrid'
  electricity_cost_per_kwh: number
  renewable_capacity_mw: number
  capacity_factor_pct: number
  water_cost_per_ton: number
  capex_electrolyzer_yuan_kw: number
  capex_bop_yuan_kw: number
  project_lifetime_years: number
  discount_rate_pct: number
  annual_operating_hours: number
  hydrogen_selling_price_per_kg: number
  byproduct_oxygen_sold: boolean
  byproduct_heat_recovery: boolean
  carbon_revenue_per_ton: number
  government_subsidy_per_kg: number
}

interface LCOHBreakdown {
  electricity_cost: number
  capex_amortization: number
  opex_fixed: number
  opex_variable: number
  water_cost: number
  byproduct_credit: number
  carbon_credit: number
  total_lcoh_per_kg: number
  total_lcoh_per_kwh_lhv: number
}

interface FinancialMetrics {
  npv_million: number
  irr_pct: number
  payback_years: number
  roi_pct: number
  yearly_revenue_kyuan: number
  yearly_profit_kyuan: number
  break_even_lcoh: number
  sensitivity: {
    electricity_cost_plus20pct: number
    electricity_cost_minus20pct: number
    capacity_factor_plus10pct: number
    capex_minus20pct: number
  }
}

interface EconomicsResult {
  project_name: string
  lcoh_breakdown: LCOHBreakdown
  financial_metrics: FinancialMetrics
  comparison_with_grey_h2: {
    grey_h2_cost_per_kg: number
    green_premium: number
    parity_year: number | null
  }
  optimization_pathways: string[]
  risk_factors: string[]
}

// --- Tool 6: 氢安全合规 ---
interface SafetyInput {
  facility_type: 'production' | 'storage' | 'refueling' | 'transport' | 'industrial_use'
  total_hydrogen_mass_kg: number
  max_pressure_bar: number
  max_temperature_c: number
  facility_area_m2: number
  occupancy_classification: 'indoor' | 'outdoor' | 'semi_enclosed'
  personnel_count: number
  nearest_exposure_distance_m: number
  applicable_standards: string[]
  ventilation_type: 'natural' | 'mechanical' | 'forced_explosion_proof'
  gas_detection_system: boolean
  emergency_shutdown_system: boolean
  inerting_system: boolean
  fire_suppression_system: boolean
  electrical_classification: string
  safety_audit_scope: string[]
}

interface StandardCompliance {
  standard_name: string
  iso_15916_reference: string
  compliance_status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable'
  details: string
}

interface SafetyQRA {
  individual_risk_per_year: number
  societal_risk_fn_category: string
  hazard_distance_thermal_radiation_m: {
    low: number
    medium: number
    high: number
  }
  hazard_distance_overpressure_m: {
    low: number
    medium: number
    high: number
  }
  worst_case_scenario: string
}

interface SafetyAssessment {
  compliance_results: StandardCompliance[]
  qra: SafetyQRA | null
  required_safety_measures: string[]
  missing_gaps: string[]
  psid_frequency_per_year: number
  risk_reduction_priority: string[]
  documentation_requirements: string[]
  emergency_procedures: string[]
}

// --- Tool 7: 加氢站布局 ---
interface RefuelingInput {
  station_type: 'fixed' | 'skid_mounted' | 'mobile'
  daily_capacity_kg: number
  pressure_levels: ('35MPa' | '70MPa')[]
  refueling_protocol: 'sae_j2601' | 'jis_b8201' | 'gb_t_31138'
  station_location_type: 'urban' | 'highway' | 'industrial' | 'depot'
  fleet_size: number
  vehicles_served_daily: number
  simultaneously_fueling: number
  ground_area_m2: number
  electricity_supply_kw: number
  water_supply_available: boolean
  distance_to_h2_supply_km: number
}

interface StorageConfig {
  low_pressure: { pressure_bar: number; volume_m3: number; capacity_kg: number }
  medium_pressure: { pressure_bar: number; volume_m3: number; capacity_kg: number }
  high_pressure: { pressure_bar: number; volume_m3: number; capacity_kg: number }
}

interface RefuelingResult {
  station_config: {
    compressors: { type: string; capacity_kg_h: number; power_kw: number; count: number }
    precooler: { min_temperature_c: number; power_kw: number }
    dispensers: { pressure_mpa: number; flow_rate_kg_min: number; count: number }[]
    storage: StorageConfig
  }
  layout: {
    total_ground_area_m2: number
    safety_setback_m: number
    compressor_area_m2: number
    storage_area_m2: number
    dispenser_area_m2: number
    control_room_m2: number
    truck_unloading_area_m2: number
  }
  operations: {
    daily_throughput_kg: number
    utilization_pct: number
    average_refuel_time_min: number
    electricity_consumption_kwh_per_kg: number
    water_consumption_l_per_kg: number
  }
  economics: {
    capex_kyuan: number
    opex_annual_kyuan: number
    payback_years: number
  }
  safety_features: string[]
  compliance_checklist: string[]
}

// --- Tool 8: 氢能产业链映射 ---
interface ValueChainInput {
  industrial_park_name: string
  region: string
  park_area_km2: number
  primary_industries: string[]
  total_hydrogen_demand_ton_y: number
  current_hydrocoal_demand_ton_y: number
  potential_h2_production_capacity_mw: number
  renewable_energy_resources: 'excellent' | 'good' | 'moderate' | 'limited'
  existing_infrastructure: {
    natural_gas_pipeline: boolean
    co2_source: boolean
    industrial_waste_heat: boolean
    water_supply: boolean
    grid_connection_mw: number
  }
  target_applications: string[]
}

interface ValueChainNode {
  node: string
  technology: string
  capacity: number
  status: 'existing' | 'planned' | 'potential'
  connections: string[]
  capex_kyuan: number
  annual_output: number
  co2_avoided_ton_y: number
}

interface ValueChainResult {
  industrial_park: string
  value_chain_nodes: ValueChainNode[]
  supply_demand_balance: {
    current_demand_ton_y: number
    green_h2_supply_potential_ton_y: number
    gap_ton_y: number
    self_sufficiency_pct: number
  }
  integration_opportunities: {
    waste_heat_utilization: string
    co2_capture_synergy: string
    oxygen_byproduct_synergy: string
    sector_coupling: string
  }
  roadmap: {
    phase: string
    year: string
    actions: string[]
    investment_kyuan: number
  }[]
  economic_impact: {
    total_investment_kyuan: number
    direct_jobs: number
    indirect_jobs: number
    co2_reduction_kton_y: number
    gdp_contribution_kyuan_y: number
  }
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Electrolyzer Efficiency Optimizer ---
function analyzeElectrolyzer(data: any): ElectrolyzerResult {
  const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(data)))
  const type = data.electrolyzer_type || 'pem'
  const ratedMW = data.rated_power_mw || 5
  const currentDensity = data.operating_current_density || 0.3
  const tempC = data.operating_temperature_c || 70
  const prodRate = data.hydrogen_production_rate_kg_h || 100
  const electricityCost = data.electricity_cost_per_kwh || 0.4
  const pressure = data.operating_pressure_bar || 30
  const renewableUtil = data.renewable_utilization_pct || 80

  const typeEfficiency: Record<string, number> = { alkaline: 67, pem: 74, soec: 82, aem: 68 }
  const typeDegradation: Record<string, number> = { alkaline: 1.5, pem: 2.0, soec: 1.2, aem: 2.5 }
  const typeLifetime: Record<string, number> = { alkaline: 80000, pem: 60000, soec: 40000, aem: 45000 }

  const baseEff = typeEfficiency[type] || 70
  const tempBonus = type === 'soec' ? Math.min(5, (tempC - 700) / 100 * 3) : Math.min(3, (tempC - 60) / 10 * 2)
  const currentPenalty = Math.abs(currentDensity - (type === 'pem' ? 1.8 : 0.35)) / (type === 'pem' ? 1.8 : 0.35) * 5
  const renewableBonus = renewableUtil > 70 ? 2 : 0
  const stackEff = Math.min(90, baseEff + tempBonus - currentPenalty + renewableBonus + rng.nextFloat(-1, 1))
  const systemEff = stackEff * 0.92
  const secKwhKg = 50 / (systemEff / 100)
  const faradaicEff = Math.min(99.5, 97 + rng.nextFloat(0, 2.5))
  const voltageEff = Math.min(85, 78 + rng.nextFloat(3, 7))
  const thermalScore = Math.min(100, 75 + rng.nextFloat(0, 20))
  const ratedPower = ratedMW * 1000

  const lifetimeH = typeLifetime[type] || 50000
  const degrRate = typeDegradation[type] || 2.0
  const memHealth = Math.max(0.5, 1 - rng.nextFloat(0, 0.15))
  const replacements: string[] = []
  if (memHealth < 0.7) replacements.push('更换膜电极组件(MEA)')
  if (voltageEff < 80) replacements.push('检查双极板涂层')
  if (faradaicEff < 97) replacements.push('评估催化剂活性')

  const annualHours = 4500
  const annualH2Kg = prodRate * annualHours
  const annualElecKwh = annualH2Kg * secKwhKg
  const annualCost = annualElecKwh * electricityCost / 10000
  const h2CostPerKg = (annualElecKwh * electricityCost) / annualH2Kg
  const effImprovePotential = Math.min(8, (74 - stackEff) * 0.5 + 2)

  const suggestions: string[] = []
  if (stackEff < 65) suggestions.push('⚠ 槽效低于行业基准，建议检查膜电极健康状态与催化剂活性')
  if (currentPenalty > 3) suggestions.push(`调整电流密度至 ${type === 'pem' ? '1.5-2.0' : '0.25-0.4'} A/cm² 以降低极化损失`)
  if (tempC < 60 && type !== 'soec') suggestions.push('适当提高操作温度至65-70°C改善动力学')
  if (renewableUtil < 70) suggestions.push('提高可再生能源消纳比例以降低LCOH')
  suggestions.push(`电解效率优化潜力: ${effImprovePotential.toFixed(1)}% — 投资回收期约${(24 / effImprovePotential * 6).toFixed(1)}个月`)
  suggestions.push('实施预测性维护策略，监控单电压降趋势以延迟MEA更换')

  return {
    electrolyzer_type: type.toUpperCase(),
    rated_power_mw: ratedMW,
    metrics: {
      stack_efficiency_lhv: Math.round(stackEff * 10) / 10,
      system_efficiency_lhv: Math.round(systemEff * 10) / 10,
      specific_energy_consumption_kwh_kg: Math.round(secKwhKg * 10) / 10,
      faradaic_efficiency_pct: Math.round(faradaicEff * 10) / 10,
      voltage_efficiency_pct: Math.round(voltageEff * 10) / 10,
      current_density_actual: Math.round(currentDensity * 1000) / 1000,
      thermal_management_score: Math.round(thermalScore)
    },
    degradation: {
      expected_lifetime_h: lifetimeH,
      degradation_rate_uv_h: degrRate,
      catalyst_stability: stackEff > 70 ? '良好' : '下降',
      membrane_health_factor: Math.round(memHealth * 100) / 100,
      recommended_replacement_components: replacements
    },
    optimization_suggestions: suggestions,
    economic_side: {
      hydrogen_production_cost_per_kg: Math.round(h2CostPerKg * 100) / 100,
      annual_operating_cost_kyuan: Math.round(annualCost),
      efficiency_improvement_potential_pct: Math.round(effImprovePotential * 10) / 10
    }
  }
}

// --- Tool 2: Hydrogen Storage Designer ---
function analyzeStorage(data: any): any {
  const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(data)))
  const scenario = data.storage_requirement || 'stationary'
  const massKg = data.hydrogen_mass_kg || 500
  const durationH = data.storage_duration_hours || 24
  const maxPressure = data.max_pressure_bar || 700
  const volM3 = data.available_volume_m3 || 50
  const cyclesDay = data.cycle_frequency_daily || 1
  const targetApp = data.target_application || '工业用氢'
  const purity = data.purity_requirement_pct || 99.99

  const methods: Record<string, { name: string; gravDensity: number; volDensity: number; roundTrip: number; boilOff: number | null; cost: number; safety: string[]; material: { primary: string; liner?: string; comp?: string; embritt: string } }> = {
    high_pressure: { name: '高压气态储氢', gravDensity: 4.5, volDensity: 40, roundTrip: 90, boilOff: 0, cost: massKg * 80, safety: ['安全阀', '爆破片', '氢浓度检测', '静电接地'], material: { primary: 'Type IV CFRP全复合气瓶', liner: '高密度聚乙烯HDPE', comp: '碳纤维/环氧树脂', embritt: '奥氏体不锈钢316L接头，避免直接氢接触' } },
    liquid: { name: '液氢储存', gravDensity: 15, volDensity: 71, roundTrip: 65, boilOff: 0.3, cost: massKg * 200, safety: ['蒸发气BOG管理系统', '珠光砂绝沙绝热', '真空多层绝热', '压力释放阀'], material: { primary: '奥氏体不锈钢304L / 铝合金',liner: 'Inconel 718', comp: '多层绝热(MLI)', embritt: '低温材料韧性保障' } },
    lohc: { name: '液态有机氢载体(LOHC)', gravDensity: 6.5, volDensity: 56, roundTrip: 80, boilOff: 0, cost: massKg * 150, safety: ['常压操作优势', '可复用现有石化基础设施', '火灾风险'], material: { primary: '二苯基甲苯/全氢化二苯基甲苯(PCH)', liner: '316L不锈钢', comp: 'Co-Mo/Al2O3催化剂', embritt: '常压操作避免高压氢环境' } },
    metal_hydride: { name: '金属氢化物储氢', gravDensity: 3.0, volDensity: 110, roundTrip: 85, boilOff: 0, cost: massKg * 500, safety: ['吸放氢热管理', '粉尘化循环寿命', '低操作压力'], material: { primary: 'LaNi5 / Ti-based BCC固溶体', liner: '——', comp: 'Cu导热翅片+水循环', embritt: '间歇循环控制晶粒生长' } }
  }

  let recommended = 'high_pressure'
  if (scenario === 'stationary' && durationH > 72) recommended = 'liquid'
  if (scenario === 'transportation') recommended = 'high_pressure'
  if (targetApp.includes('电子') || purity > 99.999) recommended = 'metal_hydride'

  const m = methods[recommended]
  const vesselMass = massKg <= 10 ? 50 + massKg * 80 : massKg / m.gravDensity * 100
  const altMethods = Object.keys(methods).filter(k => k !== recommended).map(k => methods[k].name)

  return {
    recommended_method: m.name,
    alternative_methods: altMethods,
    storage_efficiency: {
      gravimetric_density_wt_pct: m.gravDensity,
      volumetric_density_kg_m3: m.volDensity,
      round_trip_efficiency_pct: m.roundTrip,
      boil_off_rate_pct_day: m.boilOff
    },
    vessel_specifications: {
      vessel_type: recommended === 'high_pressure' ? 'Type IV 碳纤维缠绕瓶组' : recommended === 'liquid' ? '真空粉末绝热储罐' : recommended === 'lohc' ? '固定床反应器' : '金属氢化物储罐',
      material: m.material.primary,
      mass_kg: Math.round(vesselMass),
      outer_dimensions: `${(volM3 * 0.7).toFixed(1)}×${(volM3 > 10 ? 4 : 2).toFixed(1)}×${(volM3 > 10 ? 4 : 2).toFixed(1)}m`,
      safety_factor: 2.5
    },
    material_selection: {
      primary_material: m.material.primary,
      liner_material: m.material.liner,
      composite_type: m.material.comp,
      hydrogen_embrittlement_mitigation: m.material.embritt
    },
    safety_features: [...m.safety, 'ISO 19880-1间距要求', '消防车通道', '周边禁火标识'],
    cost_estimate_cny: Math.round(m.cost)
  }
}

// --- Tool 3: Fuel Cell Performance Monitor ---
function analyzeFuelCell(data: any): FuelCellResult {
  const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(data)))
  const fcType = data.fuel_cell_type || 'pemfc'
  const ratedPower = data.rated_power_kw || 100
  const hours = data.operating_hours || 5000
  const tempC = data.operating_temperature_c || 70
  const currV = data.current_voltage || 0.65
  const ratedV = data.rated_voltage || 0.75
  const h2Purity = data.hydrogen_purity_pct || 99.97
  const startupCycles = data.startup_cycles || 500
  const duty = data.duty_cycle || 'baseload'
  const singleCellCount = data.single_cell_count || 300
  const fieldYears = data.field_experience_years || 3

  const baseLife: Record<string, number> = { pemfc: 20000, sofc: 40000, pafc: 15000, mcfc: 10000, dmfc: 8000 }
  const lifeH = baseLife[fcType] || 20000
  const dutyPenalty: Record<string, number> = { baseload: 1.0, peaking: 0.7, intermittent: 0.5, transport: 0.4 }
  const actualLife = lifeH * dutyPenalty[duty]
  const degradationRate = ((ratedV - currV) / ratedV) * 100 / fieldYears
  const remainingH = Math.max(0, actualLife - hours)
  const remainingPct = Math.max(0, Math.min(100, (remainingH / actualLife) * 100))
  const catalystLoss = Math.min(50, hours / actualLife * 35)

  const mechanisms: DegradationMechanism[] = []
  if (startupCycles > 200) mechanisms.push({ mechanism: '反极碳腐蚀', contribution_pct: 30, severity: 'high', reversible: false, mitigation: '减少启停次数，采用抗反极催化剂' })
  if (degradationRate > 10) mechanisms.push({ mechanism: '催化剂奥斯特瓦尔德熟化', contribution_pct: 25, severity: 'high', reversible: false, mitigation: '优化电位控制，采用PtCo合金催化剂' })
  if (h2Purity < 99.99) mechanisms.push({ mechanism: '燃料杂质中毒', contribution_pct: 20, severity: 'medium', reversible: true, mitigation: '前端加装H2纯化器至≥99.99%' })
  if (tempC > 80) mechanisms.push({ mechanism: '膜化学降解(自由基攻击)', contribution_pct: 15, severity: 'medium', reversible: false, mitigation: '温度控制<80°C，添加自由基淬灭剂' })
  mechanisms.push({ mechanism: '机械应力(GDL/密封老化)', contribution_pct: 10, severity: 'low', reversible: true, mitigation: '定期巡检密封与压紧力' })

  const actions: string[] = []
  const critical: string[] = []
  if (remainingPct < 30) { actions.push('紧急: 安排电堆更换，剩余寿命不足30%'); critical.push('电堆') }
  if (catalystLoss > 30) { actions.push('检查催化剂活性面积，评估膜电极重涂覆可行性'); critical.push('催化剂') }
  if (h2Purity < 99.99) { actions.push('更换/再生前端H2纯化器'); critical.push('纯化器') }
  actions.push(`当前退化率 ${degradationRate.toFixed(1)} μV/h，检查BOP工况`)
  actions.push('实施在线电化学阻抗谱(EIS)诊断')

  const maintCost = Math.round(remainingPct < 50 ? ratedPower * 0.8 : ratedPower * 0.3)
  const nextInsp = Math.max(500, Math.round(remainingH * 0.1))

  const recommendations: string[] = []
  if (degradationRate > 8) recommendations.push('⚠ 衰减率偏高，建议优化启停 protocols 和提升氢气纯度')
  recommendations.push(`预计剩余使用寿命: ${remainingH.toFixed(0)}h (${remainingPct.toFixed(1)}%)`)
  if (fcType === 'pemfc' && duty === 'transport') recommendations.push('车载工况建议采用抗振动GDL和自增湿膜电极')

  return {
    fuel_cell_type: fcType.toUpperCase(),
    rated_power_kw: ratedPower,
    status: {
      voltage_degradation_uv_y: Math.round(degradationRate * 10) / 10,
      current_max_power_pct_rated: Math.round(remainingPct * 10) / 10,
      membrane_degradation: tempC > 80 ? '化学老化加速' : '正常老化',
      catalyst_active_area_loss_pct: Math.round(catalystLoss * 10) / 10,
      gdl_corrosion_level: '轻微',
      bipolar_plate_condition: '正常',
      remaining_useful_life_h: Math.round(remainingH),
      remaining_useful_life_percentage: Math.round(remainingPct * 10) / 10
    },
    mechanisms,
    maintenance: {
      required_actions: actions,
      estimated_maintenance_cost_kyuan: maintCost,
      next_inspection_hours: nextInsp,
      critical_components_to_monitor: critical.length > 0 ? critical : ['膜电极', '双极板', '密封']
    },
    recommendations
  }
}

// --- Tool 4: Hydrogen Logistics Planner ---
function analyzeLogistics(data: any): LogisticsResult {
  const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(data)))
  const supplyLoc = data.supply_location || '制氢厂区'
  const demandLoc = data.demand_location || '加氢站/用户'
  const distance = data.distance_km || 100
  const volTonDay = data.hydrogen_volume_ton_day || 5
  const mode = data.transport_mode || 'tube_trailer'
  const frequency = data.delivery_frequency || 'daily'
  const roadGrade = data.road_grade || 'highway'
  const endPressure = data.end_use_pressure_bar || 350
  const purityReq = data.purity_requirement_pct || 99.99
  const bufferDays = data.storage_buffer_days || 2

  const h2KgPerDay = volTonDay * 1000

  let vehicleType = '', vehCapacity = 0, vehPressure = 0, tripsPerDay = 0, loadUnload = 0, fuelCost = 0
  let costPerKg = 0

  switch (mode) {
    case 'tube_trailer':
      vehicleType = '长管拖车'
      vehCapacity = 350
      vehPressure = 200
      tripsPerDay = Math.ceil(h2KgPerDay / vehCapacity)
      loadUnload = 2
      fuelCost = 3.5
      costPerKg = 0.8 + distance * 0.12
      break
    case 'liquid_h2':
      vehicleType = '液氢槽车'
      vehCapacity = 4000
      vehPressure = 5
      tripsPerDay = Math.max(1, Math.ceil(h2KgPerDay / vehCapacity))
      loadUnload = 4
      fuelCost = 4.0
      costPerKg = 2.5 + distance * 0.18
      break
    case 'pipeline':
      vehicleType = '管道输送'
      vehCapacity = h2KgPerDay
      vehPressure = 40
      tripsPerDay = 1
      loadUnload = 0
      fuelCost = 0.5
      costPerKg = 0.15 + distance * 0.03
      break
    case 'lohc':
      vehicleType = 'LOHC运输'
      vehCapacity = 2000
      vehPressure = 10
      tripsPerDay = Math.max(1, Math.ceil(h2KgPerDay / vehCapacity))
      loadUnload = 6
      fuelCost = 3.0
      costPerKg = 1.5 + distance * 0.10
      break
    case 'ammonia_carrier':
      vehicleType = '氨载体运输'
      vehCapacity = 5000
      vehPressure = 10
      tripsPerDay = Math.max(1, Math.ceil(h2KgPerDay / vehCapacity))
      loadUnload = 8
      fuelCost = 3.2
      costPerKg = 2.0 + distance * 0.08
      break
    default:
      vehicleType = '混合运输'
      vehCapacity = 350
      vehPressure = 200
      tripsPerDay = 6
      loadUnload = 2
      fuelCost = 3.5
      costPerKg = 1.2 + distance * 0.14
  }

  const vehiclesNeeded = Math.max(1, Math.ceil(tripsPerDay * 1.2))
  const totalDailyCost = tripsPerDay * distance * 2 * fuelCost / 10000

  const tubeCost = 0.8 + distance * 0.12
  const liquidCost = 2.5 + distance * 0.18
  const pipeCost = distance > 200 ? null : 0.15 + distance * 0.03

  const transitTime = distance / 60 + loadUnload
  const dailyThroughput = Math.min(h2KgPerDay, vehCapacity * tripsPerDay)

  let pipeAlt: PipelineAlternative | null = null
  if (volTonDay >= 1 && distance <= 300) {
    pipeAlt = {
      pipeline_length_km: distance,
      pipe_diameter_mm: volTonDay > 10 ? 200 : 100,
      operating_pressure_bar: 40,
      capital_cost_million: Math.round(distance * (volTonDay > 10 ? 1.2 : 0.6)),
      operating_cost_per_kg_km: 0.03,
      feasibility: volTonDay >= 5 && distance <= 200 ? '✅ 管道运输经济可行' : '⚠ 管道运输需评估投资回报'
    }
  }

  const risks: string[] = []
  if (mode === 'tube_trailer' && distance > 200) risks.push('长距离公路运输成本上升明显，管道运输可能更优')
  if (mode === 'liquid_h2') risks.push('液氢运输存在BOG损失(约0.3%/天)和蒸发气处理')
  if (distance > 300) risks.push('超高距离运输需考虑中转存储或就地制氢')
  if (purityReq > 99.99 && mode === 'tube_trailer') risks.push('运输过程需监测管内污染，确保纯度达标')
  if (roadGrade === 'mountain') risks.push('山路段需额外安全措施，坡度影响拖车载荷')

  const recs: string[] = []
  recs.push(`当前模式 ${vehicleType}: 成本约 ${costPerKg.toFixed(2)} 元/kg 氢气`)
  if (tubeCost < costPerKg) recs.push(`长管拖车对比成本: ${tubeCost.toFixed(2)} 元/kg ${tubeCost < costPerKg ? '(较低成本方案)' : '(成本相近)'}`)
  if (pipeAlt) recs.push(`管道方案: 初始投资约${pipeAlt.capital_cost_million}万元，运营${pipeAlt.operating_cost_per_kg_km}元/kg·km`)
  recs.push(`建议配备 ${bufferDays} 天用氢缓冲库存 (${Math.round(h2KgPerDay * bufferDays / 1000 * 10) / 10} 吨)`)
  if (volTonDay > 10) recs.push('日需求量>10吨，建议评估管道或液化氢方案')

  return {
    selected_mode: vehicleType,
    vehicle_config: { vehicle_type: `${vehicleType} (${vehPressure}bar)`, capacity_kg: vehCapacity, operating_pressure_bar: vehPressure, trips_per_day: tripsPerDay, fuel_cost_per_km: fuelCost, estimated_vehicle_count: vehiclesNeeded, loading_unloading_time_h: loadUnload },
    logistics_cost: { transport_cost_per_kg: Math.round(costPerKg * 100) / 100, total_daily_cost_kyuan: Math.round(totalDailyCost * 100) / 100, storage_buffer_cost: Math.round(h2KgPerDay * bufferDays * costPerKg * 0.1) },
    comparison: { tube_trailer_cost_per_kg: Math.round(tubeCost * 100) / 100, liquid_h2_cost_per_kg: Math.round(liquidCost * 100) / 100, pipeline_cost_per_kg: pipeCost ? Math.round(pipeCost * 100) / 100 : null },
    timeline: { one_way_transit_time_h: Math.round(transitTime * 10) / 10, daily_throughput_kg: dailyThroughput },
    pipeline_alternative: pipeAlt,
    risk_assessment: risks,
    recommendations: recs
  }
}

// --- Tool 5: Green Hydrogen Economics ---
function analyzeGreenH2Economics(data: any): EconomicsResult {
  const d = data
  const name = d.project_name || '绿氢项目'
  const elecMW = d.electrolyzer_capacity_mw || 10
  const elecCost = d.electricity_cost_per_kwh || 0.3
  const capFactor = d.capacity_factor_pct || 75
  const waterCost = d.water_cost_per_ton || 5
  const capexElec = d.capex_electrolyzer_yuan_kw || 5000
  const capexBop = d.capex_bop_yuan_kw || 1500
  const lifeY = d.project_lifetime_years || 20
  const discRate = d.discount_rate_pct / 100 || 0.06
  const opHoursY = d.annual_operating_hours || 6500
  const h2Price = d.hydrogen_selling_price_per_kg || 30
  const oxygenSold = d.byproduct_oxygen_sold || false
  const heatRecovery = d.byproduct_heat_recovery || false
  const carbonRev = d.carbon_revenue_per_ton || 50
  const subsidy = d.government_subsidy_per_kg || 5
  const source = d.electricity_source || 'renewable_captive'
  const renewableMW = d.renewable_capacity_mw || 20

  const secKwhKg = 52
  const annualH2Kg = elecMW * 1000 * capFactor / 100 * opHoursY / secKwhKg
  const annualElecKwh = annualH2Kg * secKwhKg
  const capexTotal = (capexElec + capexBop) * elecMW * 1000
  const opexFixedAnnual = capexTotal * 0.025
  const electricityCostAnnual = annualElecKwh * elecCost
  const waterAnnual = annualH2Kg * 0.009 * waterCost
  const opexVarAnnual = annualH2Kg * 2
  const bypOxygen = oxygenSold ? annualH2Kg * 8 * 0.4 : 0
  const bypHeat = heatRecovery ? elecMW * 1000 * 0.2 * opHoursY * 0.15 : 0
  const carbonCredit = annualH2Kg * 0.009 * carbonRev

  const elecCostLcoh = electricityCostAnnual / annualH2Kg
  const capexLcoh = capexTotal / annualH2Kg / lifeY
  const opexFixLcoh = opexFixedAnnual / annualH2Kg
  const opexVarLcoh = opexVarAnnual / annualH2Kg
  const waterLcoh = waterAnnual / annualH2Kg
  const bypCredit = (oxygenSold ? bypOxygen : 0) + (heatRecovery ? bypHeat : 0)
  const totalLcoh = elecCostLcoh + capexLcoh + opexFixLcoh + opexVarLcoh + waterLcoh - bypCredit / annualH2Kg - carbonCredit / annualH2Kg - subsidy

  const discountFactor = (1 - Math.pow(1 + discRate, -lifeY)) / discRate
  const totalRevY = annualH2Kg * h2Price + bypOxygen + bypHeat + carbonCredit + subsidy * annualH2Kg
  const totalCostY = capexTotal / lifeY + opexFixedAnnual + electricityCostAnnual + waterAnnual + opexVarAnnual
  const profitY = totalRevY - totalCostY
  const npv = Math.round((profitY * discountFactor - capexTotal) / 10000 * 100) / 100
  const irr = Math.min(25, Math.max(0, (profitY * discountFactor / capexTotal - 1) * 100 + discRate * 100))
  const payback = Math.round(capexTotal / profitY * 10) / 10
  const roi = Math.round(profitY / capexTotal * discountFactor * 100 * 10) / 100

  const greyH2Cost = 12 + Math.round(elecCost * 30)
  const greenPremium = Math.round((totalLcoh - greyH2Cost) * 100) / 100

  const sensitivities = {
    electricity_cost_plus20pct: Math.round((totalLcoh + elecCostLcoh * 0.2) * 100) / 100,
    electricity_cost_minus20pct: Math.round((totalLcoh - elecCostLcoh * 0.2) * 100) / 100,
    capacity_factor_plus10pct: Math.round((totalLcoh * 0.93) * 100) / 100,
    capex_minus20pct: Math.round((totalLcoh - capexLcoh * 0.2) * 100) / 100
  }

  const optPaths: string[] = []
  optPaths.push(`当前LCOH: ${totalLcoh.toFixed(2)} 元/kg (${(totalLcoh / 33.3).toFixed(2)} 元/kWh LHV)`)
  if (elecCost > 0.3) optPaths.push('降低电力成本是降低LCOH的最有效杠杆（电费占比约60-70%）')
  if (capexTotal / elecMW / 1000 > 6000) optPaths.push('规模化采购电解槽可降低CAPEX 15-25%')
  if (capFactor < 85) optPaths.push('提升容量因子至90%可降低LCOH约5-8%')
  if (!oxygenSold) optPaths.push('考虑氧气副产品出售，约0.3-0.5 元/kg H2额外收入')
  if (!heatRecovery) optPaths.push('回收 PEM 废热(约20%电耗)可用于工业或供暖')

  const risks: string[] = []
  risks.push('可再生能源出力波动影响LCOH')
  risks.push('绿氢补贴政策变化（当前：安全容量因子估计）')
  if (totalLcoh > greyH2Cost) risks.push(`灰氢成本约${greyH2Cost}元/kg，价格竞争力差距${greenPremium}元/kg`)
  risks.push('电解槽CAPEX下降曲线不确定性')
  risks.push('电力市场PPA价格波动风险')

  return {
    project_name: name,
    lcoh_breakdown: {
      electricity_cost: Math.round(elecCostLcoh * 100) / 100,
      capex_amortization: Math.round(capexLcoh * 100) / 100,
      opex_fixed: Math.round(opexFixLcoh * 100) / 100,
      opex_variable: Math.round(opexVarLcoh * 100) / 100,
      water_cost: Math.round(waterLcoh * 100) / 100,
      byproduct_credit: -Math.round(bypCredit / annualH2Kg * 100) / 100,
      carbon_credit: -Math.round(carbonCredit / annualH2Kg * 100) / 100,
      total_lcoh_per_kg: Math.round(totalLcoh * 100) / 100,
      total_lcoh_per_kwh_lhv: Math.round(totalLcoh / 33.3 * 100) / 100
    },
    financial_metrics: {
      npv_million: npv,
      irr_pct: Math.round(irr * 10) / 10,
      payback_years: payback,
      roi_pct: roi,
      yearly_revenue_kyuan: Math.round(totalRevY / 10000),
      yearly_profit_kyuan: Math.round(profitY / 10000),
      break_even_lcoh: Math.round(totalLcoh * 1.05 * 100) / 100,
      sensitivity: sensitivities
    },
    comparison_with_grey_h2: { grey_h2_cost_per_kg: greyH2Cost, green_premium: greenPremium, parity_year: totalLcoh < greyH2Cost ? null : Math.round(lifeY * totalLcoh / (greyH2Cost + 2) * 0.7) },
    optimization_pathways: optPaths,
    risk_factors: risks
  }
}

// --- Tool 6: Hydrogen Safety Compliance ---
function analyzeSafetyCompliance(data: any): SafetyAssessment {
  const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(data)))
  const facilityType = data.facility_type || 'production'
  const h2MassKg = data.total_hydrogen_mass_kg || 500
  const maxP = data.max_pressure_bar || 700
  const maxT = data.max_temperature_c || 85
  const areaM2 = data.facility_area_m2 || 500
  const occupancy = data.occupancy_classification || 'semi_enclosed'
  const personnel = data.personnel_count || 20
  const exposureDist = data.nearest_exposure_distance_m || 50
  const standards = data.applicable_standards || ['iso_15916', 'nfpa_2', 'gb_50177', 'iec_60079']
  const ventilation = data.ventilation_type || 'mechanical'
  const hasGasDetect = data.gas_detection_system || true
  const hasESD = data.emergency_shutdown_system || true
  const hasInert = data.inerting_system || false
  const hasFireSuppr = data.fire_suppression_system || true
  const elecClass = data.electrical_classification || 'Class I Div 2'

  const compliance: StandardCompliance[] = []

  if (standards.includes('iso_15916') || standards.includes('ISO/TR 15916')) {
    compliance.push({ standard_name: 'ISO/TR 15916', iso_15916_reference: '6.2 氢特性', compliance_status: 'compliant', details: `ISO/TR 15916 第6.2节要求考虑氢的低点火能(0.02mJ)和宽爆炸极限(4-75%)。当前氢气质量${h2MassKg}kg，已按标准建议执行风险评估。` })
  }
  if (standards.includes('nfpa_2') || standards.includes('NFPA 2')) {
    const sepOk = exposureDist >= 15
    compliance.push({ standard_name: 'NFPA 2 (氢能技术代码)', iso_15916_reference: '8.1 通用要求', compliance_status: sepOk ? 'compliant' : 'non_compliant', details: `NFPA 2 表5.3要求氢气设施与暴露物间距≥15m。当前间距${exposureDist}m。${sepOk ? '符合要求。' : '⚠ 间距不足，需增大至至少15m或设置阻隔。'}` })
  }
  if (standards.includes('gb_50177') || standards.includes('GB 50177')) {
    const ventOk = ventilation !== 'natural' || occupancy === 'outdoor'
    compliance.push({ standard_name: 'GB 50177 (氢气站设计规范)', iso_15916_reference: '7.2 设施要求', compliance_status: ventOk ? 'compliant' : 'non_compliant', details: `GB 50177-2005要求室内氢气区域设置机械通风（换气次数≥12次/小时）。当前通风方式: ${ventilation}。${ventOk ? '符合规范。' : '⚠ 建议升级为机械通风或增加自然通风口面积。'}` })
  }
  if (standards.includes('iec_60079') || standards.includes('IEC 60079')) {
    compliance.push({ standard_name: 'IEC 60079 (爆炸性环境)', iso_15916_reference: '9.1 电气设备', compliance_status: elecClass.includes('Div') ? 'compliant' : 'partially_compliant', details: `IEC 60079要求危险区域电气设备符合相应防爆等级。当前电气分类: ${elecClass}。区域分类建议：密闭区域为Division 2。` })
  }
  if (standards.includes('iso_19880') || standards.includes('ISO 19880')) {
    const dispenserDist = areaM2 >= 400 ? 12 : 8
    compliance.push({ standard_name: 'ISO 19880 (加氢站)', iso_15916_reference: '8.3 特定设施', compliance_status: areaM2 >= 100 ? 'compliant' : 'non_compliant', details: `ISO 19880-1要求加氢机与道路间距≥${dispenserDist}m。设施面积${areaM2}m²，${areaM2 >= 100 ? '满足面积要求。' : '⚠ 面积偏小，需评估布局合理性。'}` })
  }

  const gaps: string[] = []
  if (!hasInert) gaps.push('缺少惰化系统 — 建议在管道吹扫和停车时使用N2惰化')
  if (ventilation === 'natural' && occupancy === 'semi_enclosed') gaps.push('半封闭区域自然通风可能不足')
  if (maxP > 400 && !hasGasDetect) gaps.push('高压氢气(>400bar)必须安装氢浓度检测系统')
  if (!hasESD) gaps.push('缺少紧急停车系统(ESD) — 风险极高')

  const required = ['氢气检测报警器（多点布置，响应时间<3s）', '紧急排放管（通往室外安全区域）', '静电接地系统', '防爆电气设备（Ex d II C T1）', '安全阀+爆破片串联/并联', '氢气火焰探测器（紫外/红外双鉴）']
  if (h2MassKg > 1000) required.push('防火堤/围堰')
  if (occupancy !== 'outdoor') required.push('事故通风系统')
  if (maxP > 350) required.push('氢相容性检测证书')

  let qra: SafetyQRA | null = null
  if (h2MassKg > 50) {
    const baseRisk = (h2MassKg / 10000) * (maxP / 700)
    qra = {
      individual_risk_per_year: Math.round(baseRisk * 1e6 * 1000) / 1000,
      societal_risk_fn_category: h2MassKg < 100 ? 'A类（低频低后果）' : h2MassKg < 1000 ? 'B类（中等风险）' : 'C类（高风险）',
      hazard_distance_thermal_radiation_m: { low: Math.round(5 * Math.sqrt(h2MassKg) * 10) / 10, medium: Math.round(12 * Math.sqrt(h2MassKg) * 10) / 10, high: Math.round(25 * Math.sqrt(h2MassKg) * 10) / 10 },
      hazard_distance_overpressure_m: { low: Math.round(8 * Math.pow(h2MassKg, 0.33) * 10) / 10, medium: Math.round(15 * Math.pow(h2MassKg, 0.33) * 10) / 10, high: Math.round(35 * Math.pow(h2MassKg, 0.33) * 10) / 10 },
      worst_case_scenario: maxP > 400 ? '高压储氢失效引发喷射火/闪燃' : '管道泄漏引发延迟点火爆炸'
    }
  }

  const psidFreq = Math.round(h2MassKg * 0.001 * 1000) / 1000
  const redPriority: string[] = []
  if (h2MassKg > 100) redPriority.push('紧急: 高氢气存量—立即确认安全防护距离和检测系统')
  if (!hasInert) redPriority.push('高: 加装N2惰化系统（吹扫和停车程序必备）')
  if (!hasESD) redPriority.push('紧急: 安装独立ESD系统（SIL2等级）')
  if (gaps.length > 3) redPriority.push('中等: 多项合规缺口需系统性整改')
  if (qra && qra.individual_risk_per_year > 1e-5) redPriority.push(facilityType === 'production' ? '高风险: 个人风险可接受标准需<1e-6，建议选址调整或工程措施' : '注意: 评估缓解措施的有效性')

  return {
    compliance_results: compliance,
    qra: qra,
    required_safety_measures: [...required, ...highRiskPointers(h2MassKg, maxP)],
    missing_gaps: gaps,
    psid_frequency_per_year: psidFreq,
    risk_reduction_priority: redPriority.length > 0 ? redPriority : ['现有安全配置基本满足要求，持续监控维保'],
    documentation_requirements: ['安全数据表(SDS)', '风险评估报告(QRA/HAZOP)', '操作规程(SOP)与应急响应预案', '定期第三方安全审计报告'],
    emergency_procedures: ['发现泄漏: 立即启动警报，疏散人员，禁止 switch 装备操作', '氢气着火: 关闭气源(若安全可行)，使用干粉灭火器，冷却周围容器', '人员受伤: 移至新鲜空气处，必要时心脏按压']
  }
}

function highRiskPointers(h2Kg: number, maxP: number): string[] {
  const pointers: string[] = []
  if (h2Kg > 500) pointers.push('大储量需执行定量风险评估(QRA)并制定泄漏检测与维护策略')
  if (maxP > 350) pointers.push('高压区域(>350bar)建议安装多层级泄压及远程切断')
  pointers.push('严禁携带非防爆电子设备进入危险区域')
  return pointers
}

// --- Tool 7: Hydrogen Refueling Station ---
function analyzeRefuelingStation(data: any): RefuelingResult {
  const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(data)))
  const stationType = data.station_type || 'fixed'
  const dailyCap = data.daily_capacity_kg || 500
  const pressures = data.pressure_levels || ['35MPa', '70MPa']
  const protocol = data.refueling_protocol || 'sae_j2601'
  const locType = data.station_location_type || 'urban'
  const fleetSize = data.fleet_size || 30
  const vehiclesDay = data.vehicles_served_daily || 40
  const simFuel = data.simultaneously_fueling || 2
  const area = data.ground_area_m2 || 800
  const elecSupplyKw = data.electricity_supply_kw || 500
  const distanceToSupply = data.distance_to_h2_supply_km || 50

  const pressureBar = pressures.map((p: string) => p === '70MPa' ? 700 : 350)

  const compCount = Math.max(1, Math.ceil(dailyCap / 200))
  const compPower = dailyCap * 8
  const precoolerPower = dailyCap * 2

  const storageCascade = {
    low_pressure: { pressure_bar: 200, volume_m3: Math.max(2, Math.round(dailyCap / 50)), capacity_kg: Math.round(dailyCap * 0.3) },
    medium_pressure: { pressure_bar: 400, volume_m3: Math.max(3, Math.round(dailyCap / 40)), capacity_kg: Math.round(dailyCap * 0.35) },
    high_pressure: { pressure_bar: Math.max(...pressureBar) + 50, volume_m3: Math.max(4, Math.round(dailyCap / 35)), capacity_kg: Math.round(dailyCap * 0.4) }
  }

  const dispensersPerPressure = pressures.map((p: string) => ({
    pressure_mpa: parseInt(p),
    flow_rate_kg_min: 3.5,
    count: Math.max(1, Math.ceil(vehiclesDay / (p === '70MPa' ? 20 : 15)))
  }))

  const safetySetback = Math.max(15, Math.round(dailyCap / 30))
  const compArea = compCount * 25
  const storageArea = 60
  const dispenserArea = dispensersPerPressure.reduce((s: number, d: any) => s + d.count, 0) * 15
  const controlRoom = 20
  const truckUnload = 80
  const totalLayout = safetySetback * 2 + compArea + storageArea + dispenserArea + controlRoom + truckUnload
  const actualArea = Math.max(area, totalLayout)

  const avgRefuelKg = dailyCap / vehiclesDay
  const refuelTime = avgRefuelKg / 3.5 + 2
  const elecPerKg = 5 + dailyCap * 0.01
  const waterPerKg = locType === 'industrial' ? 2 : 1

  const dispCount = dispensersPerPressure.reduce((s: number, d: any) => s + (d as any).count, 0)
  const capex = Math.round(compCount * 50 + dispCount * 30 + storageCascade.high_pressure.capacity_kg * 5 + 200)
  const opexY = Math.round(capex * 0.08)
  const revenueY = Math.round(dailyCap * 8 * 365)
  const payback = Math.round(capex / (revenueY - opexY) * 10) / 10

  const utilization = Math.min(95, Math.round(vehiclesDay / (dailyCap / 5) * 100))

  const safetyFeatures = [
    '储氢管汇压力分级设计(低压/中压/高压)',
    '紧急停车按钮(EBS)每处加氢位',
    '红外氢火焰探测器',
    '压缩机区域强制通风',
    '防雷接地+防静电接地',
    'GB/T 31138 安全间距',
    '加氢机溢流阀+过温保护',
    '储氢容器水压试验标记'
  ]

  const compliance = [
    'NFPA 2 间距验证',
    'GB 50516 建筑与道路间距',
    '压力容器定期检验',
    'ISO 19880-1 加注协议合规',
    '取许可'];

  return {
    station_config: {
      compressors: { type: '液压活塞压缩机/离子压缩机', capacity_kg_h: dailyCap, power_kw: compPower, count: compCount },
      precooler: { min_temperature_c: -40, power_kw: precoolerPower },
      dispensers: dispensersPerPressure.map((d: any) => ({ pressure_mpa: d.pressure_mpa as number, flow_rate_kg_min: d.flow_rate_kg_min as number, count: d.count as number })) as { pressure_mpa: number; flow_rate_kg_min: number; count: number }[],
      storage: storageCascade
    },
    layout: {
      total_ground_area_m2: actualArea,
      safety_setback_m: safetySetback,
      compressor_area_m2: compArea,
      storage_area_m2: storageArea,
      dispenser_area_m2: dispenserArea,
      control_room_m2: controlRoom,
      truck_unloading_area_m2: truckUnload
    },
    operations: {
      daily_throughput_kg: dailyCap,
      utilization_pct: utilization,
      average_refuel_time_min: Math.round(refuelTime * 10) / 10,
      electricity_consumption_kwh_per_kg: Math.round(elecPerKg * 10) / 10,
      water_consumption_l_per_kg: waterPerKg
    },
    economics: {
      capex_kyuan: capex,
      opex_annual_kyuan: opexY,
      payback_years: payback
    },
    safety_features: safetyFeatures,
    compliance_checklist: compliance
  }
}

// --- Tool 8: Hydrogen Value Chain Mapper ---
function analyzeValueChain(data: any): ValueChainResult {
  const park = data.industrial_park_name || '某工业园区'
  const totalDemand = data.total_hydrogen_demand_ton_y || 1000
  const currentCoal = data.current_hydrocoal_demand_ton_y || 800
  const h2ProdMW = data.potential_h2_production_capacity_mw || 50
  const renewable = data.renewable_energy_resources || 'good'
  const existing = data.existing_infrastructure || { natural_gas_pipeline: true, co2_source: true, industrial_waste_heat: true, water_supply: true, grid_connection_mw: 100 }
  const targetApps = data.target_applications || ['炼油', '合成氨', '交通', '工业供热', '发电']
  const areaParkKm2 = data.park_area_km2 || 5

  const effFactor = renewable === 'excellent' ? 0.85 : renewable === 'good' ? 0.75 : 0.60
  const annualGreenH2Ton = Math.round(h2ProdMW * 1000 * 4000 / 52 * effFactor / 1000)
  const gap = Math.max(0, totalDemand - annualGreenH2Ton)
  const selfSufficiency = Math.round(annualGreenH2Ton / totalDemand * 100)

  const nodes: ValueChainNode[] = [
    { node: '可再生能源发电', technology: `${renewable === 'excellent' ? '集中式风光' : '分布式光伏+风电'}`, capacity: Math.round(h2ProdMW / effFactor / 10) * 10, status: 'potential', connections: ['PEM/碱性电解槽'], capex_kyuan: Math.round(h2ProdMW * 1000 * 1500), annual_output: 0, co2_avoided_ton_y: 0 },
    { node: '电解水制氢', technology: `${h2ProdMW > 20 ? '碱式电解槽 + PEM' : 'PEM电解槽'}`, capacity: h2ProdMW, status: 'planned', connections: ['储氢', '氧气副产品'], capex_kyuan: Math.round(h2ProdMW * 5500), annual_output: annualGreenH2Ton, co2_avoided_ton_y: Math.round(annualGreenH2Ton * 9) },
    { node: '储氢/缓冲', technology: '高压球罐+地下储氢', capacity: Math.round(totalDemand * 1.5), status: 'existing', connections: ['应用端', '运输'], capex_kyuan: Math.round(totalDemand * 300), annual_output: 0, co2_avoided_ton_y: 0 },
    { node: '氢燃料电池交通', technology: '车载PEMFC', capacity: Math.round(totalDemand / 5 / 100), status: 'potential', connections: ['氢燃料', '电动交通'], capex_kyuan: Math.round(totalDemand * 80), annual_output: 0, co2_avoided_ton_y: Math.round(totalDemand * 0.2) },
    { node: '工业直接利用', technology: '氢基直接还原铁/DRI、合成氨替代', capacity: Math.round(totalDemand * 0.6), status: 'planned', connections: ['储氢', '工业用户'], capex_kyuan: Math.round(totalDemand * 600), annual_output: 0, co2_avoided_ton_y: Math.round(totalDemand * 0.6 * 8) },
    { node: '氢轮机发电', technology: 'F级燃气轮机掺氢(30%)/纯氢', capacity: Math.round(totalDemand / 8 / 5), status: 'planned', connections: ['储氢', '分布式能源'], capex_kyuan: Math.round(totalDemand * 200), annual_output: 0, co2_avoided_ton_y: Math.round(totalDemand * 0.15 * 6) },
    { node: 'CO₂捕集', technology: '胺吸收法/变压吸附', capacity: Math.round(totalDemand / 12), status: existing.co2_source ? 'existing' : 'planned', connections: ['下游合成', '驱油封存'], capex_kyuan: Math.round(totalDemand * 150), annual_output: 0, co2_avoided_ton_y: Math.round(totalDemand / 12 * 1000) },
    { node: '绿醇/绿氨合成', technology: 'CO₂加氢制甲醇/氨', capacity: Math.round(totalDemand / 6), status: 'potential', connections: ['CO₂捕集', '电解制氢'], capex_kyuan: Math.round(totalDemand * 400), annual_output: 0, co2_avoided_ton_y: Math.round(totalDemand / 6 * 5) }
  ]
  const totalInvestment = nodes.reduce((s, n) => s + n.capex_kyuan, 0)
  const totalCO2Avoided = nodes.reduce((s, n) => s + n.co2_avoided_ton_y, 0)

  const integration: ValueChainResult['integration_opportunities'] = {
    waste_heat_utilization: existing.industrial_waste_heat ? `电解槽废热(≈20%电耗)可回收${Math.round(h2ProdMW * 1000 * 0.2)}kW，用于园区供热` : '考虑增设工业废热回收',
    co2_capture_synergy: existing.co2_source ? '园区CO₂经捕集后可用于CO₂加氢制甲醇，形成碳循环经济' : '建议连接园区重点排放源建设CO₂捕集',
    oxygen_byproduct_synergy: `电解槽每年副产约${Math.round(annualGreenH2Ton * 8)}吨氧气，可供给园区氧化工艺`,
    sector_coupling: `化工-交通-能源三网耦合，氢气作为核心能源载体实现${park}园区深度脱碳`
  }

  const roadmap = [
    { phase: '一期', year: '1-2年', actions: ['建设可再生能源发电(60MW)', '电解槽一期(30MW)投运', '优先替代工业灰氢需求'], investment_kyuan: Math.round(totalInvestment * 0.3) },
    { phase: '二期', year: '3-5年', actions: ['电解槽二期(20MW)投运', '氢基DRI示范项目', '燃料电池交通应用'], investment_kyuan: Math.round(totalInvestment * 0.4) },
    { phase: '三期', year: '5-10年', actions: ['绿醇绿氨合成', '氢轮机掺氢发电', '园区碳中和达标'], investment_kyuan: Math.round(totalInvestment * 0.3) }
  ]

  const directJobs = Math.round(totalInvestment / 500)
  const indirectJobs = Math.round(directJobs * 2.5)
  const gdpContributionY = Math.round(annualGreenH2Ton * 60 + totalCO2Avoided * 0.05)

  return {
    industrial_park: park,
    value_chain_nodes: nodes,
    supply_demand_balance: { current_demand_ton_y: totalDemand, green_h2_supply_potential_ton_y: annualGreenH2Ton, gap_ton_y: gap, self_sufficiency_pct: selfSufficiency },
    integration_opportunities: integration,
    roadmap: roadmap,
    economic_impact: {
      total_investment_kyuan: totalInvestment,
      direct_jobs: directJobs,
      indirect_jobs: indirectJobs,
      co2_reduction_kton_y: Math.round(totalCO2Avoided / 1000 * 10) / 10,
      gdp_contribution_kyuan_y: Math.round(gdpContributionY)
    }
  }
}

// ==================== SECTION 4 — 格式函数 (Render Functions) ====================

function formatElectrolyzerReport(r: ElectrolyzerResult): string {
  const m = r.metrics
  const d = r.degradation
  const l = [
    `## 电解槽效率分析报告 — ${r.electrolyzer_type}`,
    '',
    '> ' + DISCLAIMER,
    '',
    '### 性能指标',
    '| 指标 | 值 | 行业基准 |',
    '|------|------|---------|',
    `| 电堆效率(LHV) | ${m.stack_efficiency_lhv}% | 65-78% |`,
    `| 系统效率(LHV) | ${m.system_efficiency_lhv}% | 58-72% |`,
    `| 比能耗 | ${m.specific_energy_consumption_kwh_kg} kWh/kg | 45-55 kWh/kg |`,
    `| 法拉第效率 | ${m.faradaic_efficiency_pct}% | >95% |`,
    `| 电压效率 | ${m.voltage_efficiency_pct}% | 78-85% |`,
    `| 电流密度 | ${m.current_density_actual} A/cm² | — |`,
    `| 热管理评分 | ${m.thermal_management_score}/100 | — |`,
    '',
    '### 衰减分析',
    `- 预期寿命: ${d.expected_lifetime_h.toLocaleString()} h`,
    `- 衰减速率: ${d.degradation_rate_uv_h} μV/h`,
    `- 催化剂状态: ${d.catalyst_stability}`,
    `- 膜健康因子: ${d.membrane_health_factor}`,
    `- 建议更换部件: ${d.recommended_replacement_components.length > 0 ? d.recommended_replacement_components.join(', ') : '无需更换'}`,
    '',
    '### 经济侧',
    `- 氢气生产成本: ${r.economic_side.hydrogen_production_cost_per_kg} 元/kg`,
    `- 年运行成本: ${r.economic_side.annual_operating_cost_kyuan.toLocaleString()} 千元`,
    `- 效率提升潜力: ${r.economic_side.efficiency_improvement_potential_pct}%`,
    '',
    '### 优化建议',
    ...r.optimization_suggestions.map((s: string) => `- ${s}`),
    '',
    '---',
    `*${DISCLAIMER}*`
  ]
  return l.join('\n')
}

function formatStorageReport(r: any): string {
  const se = r.storage_efficiency
  const m = r.material_selection
  const l = [
    `## 储氢方案设计报告`,
    '',
    '> ' + DISCLAIMER,
    '',
    `### 推荐方案: ${r.recommended_method}`,
    '| 参数 | 值 |',
    '|------|------|',
    `| 质量储氢密度 | ${se.gravitational_density_wt_pct} wt% |`,
    `| 体积储氢密度 | ${se.volumetric_density_kg_m3} kg/m³ |`,
    `| 往返效率 | ${se.round_trip_efficiency_pct}% |`,
    `| BOH速率 | ${se.boil_off_rate_pct_day !== null ? se.boil_off_rate_pct_day + '%/天' : '(不适用)'} |`,
    '',
    '### 容器规格',
    '- 类型: ' + r.vessel_specifications.vessel_type,
    '- 材料: ' + r.vessel_specifications.material,
    `- 质量: ${r.vessel_specifications.mass_kg} kg`,
    `- 外形尺寸: ${r.vessel_specifications.outer_dimensions}`,
    `- 安全系数: ${r.vessel_specifications.safety_factor}`,
    '',
    '### 材料选择',
    `- 主材: ${m.primary_material}`,
    m.liner_material && m.liner_material !== '——' ? `- 衬里: ${m.liner_material}` : '',
    m.composite_type ? `- 复合类型: ${m.composite_type}` : '',
    `- 氢脆缓解: ${m.hydrogen_embrittlement_mitigation}`,
    '',
    '### 安全特性',
    ...r.safety_features.map((s: string) => `- ${s}`),
    '',
    '### 替代方案',
    ...r.alternative_methods.map((a: string) => `- ${a}`),
    '',
    '### 投资估算',
    `- 估算费用: ${r.cost_estimate_cny.toLocaleString()} 元`,
    '',
    '---',
    `*${DISCLAIMER}*`
  ].filter(Boolean)
  return l.join('\n')
}

function formatFuelCellReport(r: FuelCellResult): string {
  const s = r.status
  const l = [
    `## 燃料电池性能与寿命预测报告 — ${r.fuel_cell_type}`,
    '',
    '> ' + DISCLAIMER,
    '',
    '### 性能状态',
    '| 参数 | 值 |',
    '|------|------|',
    `| 电压退化速率 | ${s.voltage_degradation_uv_y} μV/h |`,
    `| 当前最大功率(额定%) | ${s.current_max_power_pct_rated}% |`,
    `| 膜状态 | ${s.membrane_degradation} |`,
    `| 催化剂活性面积损失 | ${s.catalyst_active_area_loss_pct}% |`,
    `| GDL腐蚀 | ${s.gdl_corrosion_level} |`,
    `| 双极板状态 | ${s.bipolar_plate_condition} |`,
    `| 剩余使用寿命 | ${s.remaining_useful_life_h.toLocaleString()} h |`,
    `| 剩余寿命(%) | ${s.remaining_useful_life_percentage}% |`,
    '',
    '### 退化机制',
    ...r.mechanisms.map((m: any) => `- **[${m.severity}]** ${m.mechanism} (贡献度${m.contribution_pct}%): ${m.mitigation} ${m.reversible ? '(可逆)' : '(不可逆)'}`),
    '',
    '### 维护',
    '- 建议措施:',
    ...r.maintenance.required_actions.map((a: string) => `  - ${a}`),
    `- 预计维护费用: ${r.maintenance.estimated_maintenance_cost_kyuan} 千元}`,
    `- 下次巡检: ${r.maintenance.next_inspection_hours} h`,
    `- 关键监测部件: ${r.maintenance.critical_components_to_monitor.join(', ')}`,
    '',
    '### 建议',
    ...r.recommendations.map((rec: string) => `- ${rec}`),
    '',
    '---',
    `*${DISCLAIMER}*`
  ]
  return l.join('\n')
}

function formatLogisticsReport(r: LogisticsResult): string {
  const vc = r.vehicle_config
  const l = [
    `## 氢能物流规划报告`,
    '',
    '> ' + DISCLAIMER,
    '',
    `### 当前模式: ${r.selected_mode}`,
    '| 参数 | 值 |',
    '|------|------|',
    `| 车型 | ${vc.vehicle_type} |`,
    `| 单车载氢 | ${vc.capacity_kg} kg |`,
    `| 运营压力 | ${vc.operating_pressure_bar} bar |`,
    `| 每日车次 | ${vc.trips_per_day} |`,
    `| 装卸时间 | ${vc.loading_unloading_time_h} h |`,
    `| 所需车辆数 | ${vc.estimated_vehicle_count} |`,
    '',
    '### 物流成本',
    `- 运输成本: ${r.logistics_cost.transport_cost_per_kg} 元/kg`,
    `- 每日总成本: ${r.logistics_cost.total_daily_cost_kyuan} 万元`,
    '',
    '### 模式对比',
    `| 长管拖车 | 液氢 | 管道 |`,
    `| ${r.comparison.tube_trailer_cost_per_kg} 元/kg | ${r.comparison.liquid_h2_cost_per_kg} 元/kg | ${r.comparison.pipeline_cost_per_kg !== null ? r.comparison.pipeline_cost_per_kg + ' 元/kg' : 'N/A'} |`,
    '',
    '### 时效',
    `- 单程运输时间: ${r.timeline.one_way_transit_time_h} h`,
    `- 日输送量: ${r.timeline.daily_throughput_kg} kg`,
    '',
    r.pipeline_alternative ? [
      '### 管道方案',
      `- 管长: ${r.pipeline_alternative.pipeline_length_km} km`,
      `- 管径: ${r.pipeline_alternative.pipe_diameter_mm} mm`,
      `- 初始投资: ${r.pipeline_alternative.capital_cost_million} 百万元`,
      `- 运营成本: ${r.pipeline_alternative.operating_cost_per_kg_km} 元/kg·km`,
      `- 可行性: ${r.pipeline_alternative.feasibility}`,
      ''
    ].join('\n') : '',
    '### 风险',
    ...r.risk_assessment.map((risk: string) => `- [风险] ${risk}`),
    '',
    '### 建议',
    ...r.recommendations.map((rec: string) => `- ${rec}`),
    '',
    '---',
    `*${DISCLAIMER}*`
  ].filter(x => typeof x === 'string' || x === null) // handle potential null
  if (l[l.length - 1] === null) l.pop()
  return l.join('\n')
}

function formatEconomicsReport(r: EconomicsResult): string {
  const lb = r.lcoh_breakdown
  const fm = r.financial_metrics
  const l = [
    `## 绿氢经济性与LCOH分析 — ${r.project_name}`,
    '',
    '> ' + DISCLAIMER,
    '',
    '### LCOH分解',
    '| 成本项 | 金额(元/kg) | 占比 |',
    '|--------|-----------|------|',
    `| 电力成本 | ${lb.electricity_cost} | ${Math.round(lb.electricity_cost / lb.total_lcoh_per_kg * 100)}% |`,
    `| CAPEX摊销 | ${lb.capex_amortization} | ${Math.round(lb.capex_amortization / lb.total_lcoh_per_kg * 100)}% |`,
    `| OPEX固定 | ${lb.opex_fixed} | ${Math.round(lb.opex_fixed / lb.total_lcoh_per_kg * 100)}% |`,
    `| OPEX变动 | ${lb.opex_variable} | ${Math.round(lb.opex_variable / lb.total_lcoh_per_kg * 100)}% |`,
    `| 水费 | ${lb.water_cost} | ${Math.round(lb.water_cost / lb.total_lcoh_per_kg * 100)}% |`,
    `| 副产品抵扣 | ${lb.byproduct_credit} | ${Math.round(Math.abs(lb.byproduct_credit) / lb.total_lcoh_per_kg * 100)}% |`,
    `| **LCOH合计** | **${lb.total_lcoh_per_kg} 元/kg** | |`,
    `| LCOH (电耗载体) | ${lb.total_lcoh_per_kwh_lhv} 元/kWh | |`,
    '',
    '### 财务指标',
    '| 指标 | 值 |',
    '|------|------|',
    `| NPV | ${fm.npv_million} 百万元 |`,
    `| IRR | ${fm.irr_pct}% |`,
    `| 投资回收期 | ${fm.payback_years} 年 |`,
    `| ROI | ${fm.roi_pct}% |`,
    `| 年营收 | ${fm.yearly_revenue_kyuan} 千元 |`,
    `| 年利润 | ${fm.yearly_profit_kyuan} 千元 |`,
    `| 盈亏平衡LCOH | ${fm.break_even_lcoh} 元/kg |`,
    '',
    '### 敏感性分析',
    `- 电费+20%: ${fm.sensitivity.electricity_cost_plus20pct} 元/kg`,
    `- 电费-20%: ${fm.sensitivity.electricity_cost_minus20pct} 元/kg`,
    `- CF+10%: ${fm.sensitivity.capacity_factor_plus10pct} 元/kg`,
    `- CAPEX-20%: ${fm.sensitivity.capex_minus20pct} 元/kg`,
    '',
    '### 灰氢对比',
    `- 灰氢(SMR)成本: ${r.comparison_with_grey_h2.grey_h2_cost_per_kg} 元/kg`,
    `- 绿氢溢价: ${r.comparison_with_grey_h2.green_premium} 元/kg`,
    r.comparison_with_grey_h2.parity_year ? `- 预计成本持平年份: ${r.comparison_with_grey_h2.parity_year}年` : '',
    '',
    '### 优化路径',
    ...r.optimization_pathways.map((p: string) => `- ${p}`),
    '',
    '### 风险因素',
    ...r.risk_factors.map((rf: string) => `- [风险] ${rf}`),
    '',
    '---',
    `*${DISCLAIMER}*`
  ].filter(Boolean)
  return l.join('\n')
}

function formatSafetyReport(r: SafetyAssessment): string {
  const l = [
    `## 氢安全合规评估报告`,
    '',
    '> ' + DISCLAIMER,
    '',
    '### 标准合规结果',
    ...r.compliance_results.map((c: any) => `- **${c.standard_name}** (${c.iso_15916_reference}): ${c.compliance_status === 'compliant' ? '✅ 合规' : c.compliance_status === 'non_compliant' ? '❌ 不合规' : '⚠ 部分合规'}\n  ${c.details}`),
    '',
    '### QRA定量风险',
    r.qra ? [
      `- 个人风险: ${r.qra.individual_risk_per_year}/年`,
      `- 社会风险类别: ${r.qra.societal_risk_fn_category}`,
      `- 热辐射危害距离(低/中/高): ${r.qra.hazard_distance_thermal_radiation_m.low}/${r.qra.hazard_distance_thermal_radiation_m.medium}/${r.qra.hazard_distance_thermal_radiation_m.high} m`,
      `- 超压危害距离(低/中/高): ${r.qra.hazard_distance_overpressure_m.low}/${r.qra.hazard_distance_overpressure_m.medium}/${r.qra.hazard_distance_overpressure_m.high} m`,
      `- 最坏情景: ${r.qra.worst_case_scenario}`,
      `- PSID频率: ${r.psid_frequency_per_year}/年`
    ].map((s: string) => `- ${s}`) : ['- PSID频率: ' + r.psid_frequency_per_year + '/年'],
    '',
    '### 合规缺口',
    ...r.missing_gaps.map((g: string) => `- ❌ ${g}`),
    '',
    '### 风险降低优先级',
    ...r.risk_reduction_priority.map((p: string) => `- ${p}`),
    '',
    '### 紧急程序',
    ...r.emergency_procedures.map((e: string) => `- ${e}`),
    '',
    '---',
    `*${DISCLAIMER}*`
  ]
  return l.join('\n')
}

function formatRefuelingReport(r: RefuelingResult): string {
  const sc = r.station_config
  const l = [
    `## 加氢站布局与配置设计报告`,
    '',
    '> ' + DISCLAIMER,
    '',
    '### 设备配置',
    `| 设备 | 规格 |`,
    `|------|------|`,
    `| 压缩机 | ${sc.compressors.type} × ${sc.compressors.count}台 |`,
    `| 预冷器 | 最低${sc.precooler.min_temperature_c}°C |`,
    ...r.station_config.dispensers.map((d: { pressure_mpa: number; flow_rate_kg_min: number; count: number }) => `| 加氢机 ${d.pressure_mpa}MPa | ${d.count}台，流量${d.flow_rate_kg_min} kg/min |`),
    '',
    '### 储氢分级',
    `- 低压级: ${r.station_config.storage.low_pressure.pressure_bar}bar / ${r.station_config.storage.low_pressure.capacity_kg}kg`,
    `- 中压级: ${r.station_config.storage.medium_pressure.pressure_bar}bar / ${r.station_config.storage.medium_pressure.capacity_kg}kg`,
    `- 高压级: ${r.station_config.storage.high_pressure.pressure_bar}bar / ${r.station_config.storage.high_pressure.capacity_kg}kg`,
    '',
    '### 站场布局',
    `- 总用地面积: ${r.layout.total_ground_area_m2} m²`,
    `- 安全退距: ${r.layout.safety_setback_m} m`,
    `- 各功能区面积: 压缩机${r.layout.compressor_area_m2}/储氢${r.layout.storage_area_m2}/加氢${r.layout.dispenser_area_m2}/控制室${r.layout.control_room_m2} m²`,
    '',
    '### 运营参数',
    `- 日吞吐量: ${r.operations.daily_throughput_kg} kg`,
    `- 利用率: ${r.operations.utilization_pct}%`,
    `- 平均加注时间: ${r.operations.average_refuel_time_min} min`,
    `- 电耗: ${r.operations.electricity_consumption_kwh_per_kg} kWh/kg`,
    '',
    '### 经济性',
    `- 初始投资: ${r.economics.capex_kyuan} 千元`,
    `- 年运维: ${r.economics.opex_annual_kyuan} 千元`,
    `- 投资回收期: ${r.economics.payback_years} 年`,
    '',
    '### 安全措施',
    ...r.safety_features.map((s: string) => `- ${s}`),
    '',
    '### 合规检查',
    ...r.compliance_checklist.map((c: string) => `- ${c}`),
    '',
    '---',
    `*${DISCLAIMER}*`
  ]
  return l.join('\n')
}

function formatValueChainReport(r: ValueChainResult): string {
  const sdb = r.supply_demand_balance
  const ei = r.economic_impact
  const l = [
    `## 氢能产业链与园区耦合映射 — ${r.industrial_park}`,
    '',
    '> ' + DISCLAIMER,
    '',
    '### 供需平衡',
    `- 当前氢需求: ${sdb.current_demand_ton_y} 吨/年`,
    `- 绿氢供应潜力: ${sdb.green_h2_supply_potential_ton_y} 吨/年`,
    `- 缺口: ${sdb.gap_ton_y} 吨/年`,
    `- 自给率: ${sdb.self_sufficiency_pct}%`,
    '',
    '### 产业链节点图',
    ...r.value_chain_nodes.map((n: any) => `- **[${n.status}]** ${n.node} | 技术: ${n.technology} | 投资: ${n.capex_kyuan.toLocaleString()}千元 | CO₂减排: ${n.co2_avoided_ton_y.toLocaleString()}吨/年 | 连接: ${n.connections.join('→')}`),
    '',
    '### 集成协同机会',
    `- 余热利用: ${r.integration_opportunities.waste_heat_utilization}`,
    `- CO₂捕集协同: ${r.integration_opportunities.co2_capture_synergy}`,
    `- 氧气副产品: ${r.integration_opportunities.oxygen_byproduct_synergy}`,
    `- 部门耦合: ${r.integration_opportunities.sector_coupling}`,
    '',
    '### 路线图',
    ...r.roadmap.map((rd: any) => [
      `#### ${rd.phase} (${rd.year})`,
      ...rd.actions.map((a: string) => `  - ${a}`),
      `- 投资: ${rd.investment_kyuan.toLocaleString()}千元`,
      ''
    ].join('\n')),
    '',
    '### 经济影响',
    `- 总投资: ${ei.total_investment_kyuan.toLocaleString()}千元`,
    `- 直接就业: ${ei.direct_jobs} 人 | 间接就业: ${ei.indirect_jobs} 人`,
    `- CO₂减排: ${ei.co2_reduction_kton_y} 千吨/年`,
    `- GDP贡献: ${ei.gdp_contribution_kyuan_y.toLocaleString()} 千元/年`,
    '',
    '---',
    `*${DISCLAIMER}*`
  ]
  return l.join('\n')
}

// ==================== SECTION 5 — Tool Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. 电解槽效率优化
  tools.register(defineTool({
    name: 'electrolyzer_efficiency_optimizer',
    description: '优化电解槽（碱式/PEM/SOEC）效率并分析能耗与衰减，提供电堆效率、法拉第效率、比能耗、衰减速率及催化剂/膜健康评估，支持电流密度与温度敏感性分析。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: electrolyzer_type (alkaline/pem/soec/aem), rated_power_mw, operating_current_density (A/cm2), operating_temperature_c, hydrogen_production_rate_kg_h, electricity_cost_per_kwh, cathode_material, anode_material, membrane_thickness_mm, operating_pressure_bar, renewable_utilization_pct'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatElectrolyzerReport(analyzeElectrolyzer(JSON.parse(args.input_data)))
    }
  }))

  // 2. 储氢方案设计
  tools.register(defineTool({
    name: 'hydrogen_storage_designer',
    description: '设计氢气储存方案（高压气态/液态/LOHC/金属氢化物），根据需求场景、容量、压力、纯度推荐最佳储氢方式并输出容器规格与材料选型建议，包含氢脆缓解策略。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: storage_requirement (stationary/transportation/mobile/underground), hydrogen_mass_kg, storage_duration_hours, max_pressure_bar, available_volume_m3, cycle_frequency_daily, ambient_temperature_range_c, target_application, purity_requirement_pct'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatStorageReport(analyzeStorage(JSON.parse(args.input_data)))
    }
  }))

  // 3. 燃料电池性能监测
  tools.register(defineTool({
    name: 'fuel_cell_performance_monitor',
    description: '监测燃料电池（PEMFC/SOFC）性能衰减状况并预测剩余寿命，分析催化剂熟化、膜降解、GDL腐蚀等退化机制，识别关键维护部件并提供操作优化建议。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: fuel_cell_type (pemfc/sofc/pafc/mcfc/dmfc), rated_power_kw, operating_hours, operating_temperature_c, current_voltage, rated_voltage, hydrogen_purity_pct, air_utilization_pct, stack_count, single_cell_count, duty_cycle (baseload/peaking/intermittent/transport), startup_cycles, field_experience_years'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatFuelCellReport(analyzeFuelCell(JSON.parse(args.input_data)))
    }
  }))

  // 4. 氢能物流规划
  tools.register(defineTool({
    name: 'hydrogen_logistics_planner',
    description: '规划氢气物流方案（长管拖车/液氢/管道/LOHC/氨载体），根据运输距离、日需求量、道路等级推荐最优运输方式，对比各路径成本并分析管道替代可行性。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: supply_location, demand_location, distance_km, hydrogen_volume_ton_day, transport_mode (tube_trailer/liquid_h2/pipeline/lohc/ammonia_carrier/mixed), delivery_frequency, road_grade, ambient_temperature_range_c, end_use_pressure_bar, purity_requirement_pct, storage_buffer_days'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatLogisticsReport(analyzeLogistics(JSON.parse(args.input_data)))
    }
  }))

  // 5. 绿氢经济学与LCOH
  tools.register(defineTool({
    name: 'green_hydrogen_economics',
    description: '计算绿氢平准化生产成本LCOH并进行项目财务分析，分解电力、CAPEX、OPEX、水费等成本构成，输出NPV/IRR/回收期及敏感性分析，对比灰氢并给出优化路径。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: project_name, electrolyzer_capacity_mw, electricity_source, electricity_cost_per_kwh, renewable_capacity_mw, capacity_factor_pct, water_cost_per_ton, capex_electrolyzer_yuan_kw, capex_bop_yuan_kw, project_lifetime_years, discount_rate_pct, annual_operating_hours, hydrogen_selling_price_per_kg, byproduct_oxygen_sold, byproduct_heat_recovery, carbon_revenue_per_ton, government_subsidy_per_kg'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatEconomicsReport(analyzeGreenH2Economics(JSON.parse(args.input_data)))
    }
  }))

  // 6. 氢安全合规
  tools.register(defineTool({
    name: 'hydrogen_safety_compliance',
    description: '氢安全合规评估基于ISO/TR 15916、NFPA 2、GB 50177、IEC 60079和ISO 19880标准，输出合规状态检查、定量风险评估(QRA)、个人/社会风险评估、危害距离计算及安全整改优先级清单。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: facility_type (production/storage/refueling/transport/industrial_use), total_hydrogen_mass_kg, max_pressure_bar, max_temperature_c, facility_area_m2, occupancy_classification, personnel_count, nearest_exposure_distance_m, applicable_standards, ventilation_type, gas_detection_system, emergency_shutdown_system, inerting_system, fire_suppression_system, electrical_classification, safety_audit_scope'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatSafetyReport(analyzeSafetyCompliance(JSON.parse(args.input_data)))
    }
  }))

  // 7. 加氢站布局
  tools.register(defineTool({
    name: 'hydrogen_refueling_station',
    description: '加氢站（固定式/撬装式/移动式）布局设计，优化35MPa/70MPa双压级储氢与加注配置，计算压缩机/预冷器/加氢机参数，输出站场布局面积、运营指标、投资估算和安全合规检查清单。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: station_type (fixed/skid_mounted/mobile), daily_capacity_kg, pressure_levels (35MPa/70MPa), refueling_protocol (sae_j2601/jis_b8201/gb_t_31138), station_location_type, fleet_size, vehicles_served_daily, simultaneously_fueling, ground_area_m2, electricity_supply_kw, distance_to_h2_supply_km'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatRefuelingReport(analyzeRefuelingStation(JSON.parse(args.input_data)))
    }
  }))

  // 8. 氢能产业链
  tools.register(defineTool({
    name: 'hydrogen_value_chain_mapper',
    description: '绘制氢能产业链全景与工业园区耦合映射，覆盖可再生能源发电、电解制氢、储氢、燃料电池交通、工业利用（绿醇/DRI/合成氨）等环节，分析供需平衡、规模协同、CO₂减排及经济效益。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: industrial_park_name, park_area_km2, primary_industries (array), total_hydrogen_demand_ton_y, current_hydrocoal_demand_ton_y, potential_h2_production_capacity_mw, renewable_energy_resources, existing_infrastructure {natural_gas_pipeline, co2_source, industrial_waste_heat, water_supply, grid_connection_mw}, target_applications (array)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatValueChainReport(analyzeValueChain(JSON.parse(args.input_data)))
    }
  }))

  console.log(`[dsh-tool-hydrogenenergyagent] Loaded v${VERSION} - 氢能AI智能体 8个工具就绪`)
  console.log('  Tools: electrolyzer_efficiency_optimizer, hydrogen_storage_designer, fuel_cell_performance_monitor, hydrogen_logistics_planner, green_hydrogen_economics, hydrogen_safety_compliance, hydrogen_refueling_station, hydrogen_value_chain_mapper')
}
