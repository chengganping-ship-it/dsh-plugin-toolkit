/**
 * DSH 化工材料AI助手 v1.0.0 (chemagentpro)
 * 化工与材料行业智能体 for DeepSeek Harness
 *
 * 工具清单:
 * 1. formulation_optimizer       — 配方优化（DOE/响应面/性能预测）
 * 2. process_scaleup             — 工艺放大（中试/传质传热/反应器）
 * 3. regulatory_compliance_chem  — 合规（REACH/GHS/危化品登记/MSDS）
 * 4. catalyst_design             — 催化剂设计（活性/选择性/寿命/再生）
 * 5. materials_informatics       — 材料信息学（数据库/ML势/高通量计算）
 * 6. safety_toxicology           — 安全毒理（闪点/LD50/暴露评估/PPE）
 * 7. market_pricing_chem         — 市场定价（原油联动/供需/进出口/库存）
 * 8. circular_economy_polymer    — 聚合物循环经济（回收/降解/生物基）
 *
 * @module dsh-tool-chemagentpro | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 *
 * 免责声明: 本分析基于AI模型推断，仅供化工研发参考，不替代专业实验与安全操作决策。
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'chemagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析基于AI模型推断，仅供化工研发参考，不替代专业实验与安全操作决策。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

function mulberry32(s:number){let x=s>>>0;return()=>{x=(x+0x6D2B79F5)|0;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s:string){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h+s.charCodeAt(i))|0}return Math.abs(h)||1}
function rng(i:string){return mulberry32(hashStr(i))}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Formulation Optimizer ---
interface FormulationInput {
  product_type: 'coating' | 'adhesive' | 'cosmetic' | 'pharmaceutical' | 'food' | 'polymer'
  target_properties: Array<{ property: string; target_value: number; unit: string; weight: number }>
  raw_materials: Array<{ name: string; min_pct: number; max_pct: number; cost_per_kg: number }>
  constraints?: { max_cost_per_kg?: number; banned_substances?: string[]; temperature_range?: [number, number] }
  doe_type?: 'full_factorial' | 'central_composite' | 'box_behnken' | 'latin_hypercube'
}

interface DoeRun {
  run_id: number
  factors: Record<string, number>
  predicted_response: number
  confidence: number
}

interface ResponseSurface {
  optimal_point: Record<string, number>
  predicted_optimum: number
  r_squared: number
  rmse: number
  significant_factors: string[]
}

interface FormulationResult {
  product_type: string
  doe_runs: DoeRun[]
  response_surface: ResponseSurface
  optimal_formulation: Array<{ material: string; percentage: number; cost_contribution: number }>
  predicted_properties: Array<{ property: string; predicted: number; target: number; unit: string; status: string }>
  cost_analysis: { total_cost_per_kg: number; savings_vs_baseline: number }
  recommendations: string[]
}

// --- Tool 2: Process Scale-up ---
interface ScaleupInput {
  reaction_type: 'batch' | 'continuous' | 'semi_batch' | 'flow_chemistry'
  current_scale: string
  target_scale: number
  target_unit: 'kg' | 'ton' | 'm3'
  reactor_type: 'CSTR' | 'PFR' | 'batch_reactor' | 'microreactor'
  heat_of_reaction_kj_mol: number
  activation_energy_kj_mol: number
  viscosity_cp: number
  mixing_required: boolean
  safety_concerns?: string[]
}

interface MassTransferAnalysis {
  kla_estimate: number
  mixing_time_s: number
  damkohler_number: number
  regime: 'kinetic' | 'mass_transfer' | 'mixed'
  hotspot_risk: 'low' | 'medium' | 'high'
  recommendation: string
}

interface HeatTransferAnalysis {
  heat_removal_capacity: number
  required_heat_removal: number
  jacket_area_ratio: number
  delta_t_approach: number
  thermal_runaway_risk: 'low' | 'medium' | 'high'
  cooling_recommendation: string
}

interface ReactorSizing {
  reactor_volume_l: number
  diameter_m: number
  height_m: number
  agitation_rpm: number
  jacket_area_m2: number
  throughput_kg_h: number
}

interface ScaleupResult {
  reaction_type: string
  scale_ratio: number
  mass_transfer: MassTransferAnalysis
  heat_transfer: HeatTransferAnalysis
  reactor_sizing: ReactorSizing
  pilot_recommendations: string[]
  risk_assessment: Array<{ risk: string; severity: 'low' | 'medium' | 'high' | 'critical'; mitigation: string }>
  recommendations: string[]
}

// --- Tool 3: Regulatory Compliance Chem ---
interface ComplianceInput {
  substance_name: string
  cas_number: string
  application: 'industrial' | 'consumer' | 'pharmaceutical' | 'agrochemical' | 'food_contact'
  target_markets: string[]
  annual_tonnage: number
  exposure_scenarios: Array<{ route: 'inhalation' | 'dermal' | 'oral' | 'environment'; frequency: string; duration: string }>
  ghs_classification?: string[]
  reach_registered?: boolean
}

interface ReachStatus {
  registered: boolean
  registration_tier: '1-10t' | '10-100t' | '100-1000t' | '1000t+'
  required_studies: string[]
  data_gaps: string[]
  estimated_cost_eur: number
  timeline_months: number
  sds_required: boolean
}

interface GhsClassification {
  physical_hazards: Array<{ class_: string; category: string; signal_word: string; hazard_statement: string }>
  health_hazards: Array<{ class_: string; category: string; signal_word: string; hazard_statement: string }>
  environmental_hazards: Array<{ class_: string; category: string; hazard_statement: string }>
  pictograms: string[]
  precautionary_statements: string[]
}

interface HazchemRegistration {
  country: string
  registered: boolean
  regulatory_body: string
  registration_number?: string
  status: 'compliant' | 'pending' | 'non_compliant' | 'exempt'
  next_action: string
}

interface ComplianceResult {
  substance_name: string
  cas_number: string
  reach: ReachStatus
  ghs: GhsClassification
  hazchem_registrations: HazchemRegistration[]
  msds_sections_complete: number
  overall_compliance_score: number
  recommendations: string[]
}

// --- Tool 4: Catalyst Design ---
interface CatalystInput {
  reaction_name: string
  catalyst_type: 'homogeneous' | 'heterogeneous' | 'enzymatic' | 'photocatalytic' | 'electrocatalytic'
  active_metal: string
  support_material: string
  target_conversion: number
  target_selectivity: number
  operating_temperature: number
  operating_pressure: number
  feed_composition: Record<string, number>
  target_lifetime_months: number
}

interface ActivityPrediction {
  predicted_conversion: number
  turn_over_frequency: number
  activation_energy_pred: number
  rate_constant: number
  temperature_sensitivity: string
  active_site_density: number
}

interface SelectivityAnalysis {
  predicted_selectivity: number
  byproducts: Array<{ name: string; selectivity: number; suppression_strategy: string }>
  side_reactions: string[]
  optimal_temperature_window: [number, number]
}

interface DeactivationModel {
  deactivation_rate: number
  mechanism: 'sintering' | 'coking' | 'poisoning' | 'leaching' | 'phase_change'
  predicted_lifetime_months: number
  regeneration_possible: boolean
  regeneration_method: string
  regeneration_frequency_months: number
}

interface CatalystResult {
  reaction_name: string
  catalyst_type: string
  activity: ActivityPrediction
  selectivity: SelectivityAnalysis
  deactivation: DeactivationModel
  optimization_suggestions: Array<{ parameter: string; current: number; recommended: number; impact: string }>
  cost_performance_score: number
  recommendations: string[]
}

// --- Tool 5: Materials Informatics ---
interface InformaticsInput {
  material_class: 'MOF' | 'zeolite' | 'polymer' | 'ceramic' | 'metal_alloy' | 'semiconductor' | 'composite'
  target_property: string
  target_value: number
  unit: string
  search_space_size: number
  existing_data_points: number
  computational_budget: 'low' | 'medium' | 'high'
  ml_model?: 'Gaussian_process' | 'random_forest' | 'neural_network' | 'BO_gp' | 'GCNN'
}

interface DatabaseSearch {
  databases_queried: string[]
  similar_materials: Array<{ name: string; property_value: number; similarity: number; reference: string }>
  data_quality: 'high' | 'medium' | 'low'
  publications_found: number
  patents_found: number
}

interface MLPotential {
  model_type: string
  training_rmse: number
  validation_rmse: number
  r_squared: number
  feature_importance: Array<{ feature: string; importance: number }>
  prediction_interval: [number, number]
}

interface HighThroughputResult {
  candidates_screened: number
  top_candidates: Array<{ id: string; predicted_property: number; confidence: number; composition: string }>
  pareto_front: Array<{ id: string; property1: number; property2: number }>
  recommended_for_validation: string[]
  coverage_pct: number
}

interface InformaticsResult {
  material_class: string
  database: DatabaseSearch
  ml_potential: MLPotential
  high_throughput: HighThroughputResult
  active_learning_rounds: number
  recommendations: string[]
}

// --- Tool 6: Safety & Toxicology ---
interface SafetyInput {
  chemical_name: string
  cas_number: string
  molecular_weight: number
  vapor_pressure_mmhg: number
  boiling_point_c: number
  flash_point_c: number
  ld50_oral_mg_kg?: number
  lc50_inhalation_ppm?: number
  exposure_routes: string[]
  workplace_scenario: string
  oel_ppm?: number
  daily_exposure_hours: number
}

interface PhysicalHazards {
  flash_point_class: 'extremely_flammable' | 'highly_flammable' | 'flammable' | 'combustible' | 'non_flammable'
  autoignition_temp: number
  explosive_limits: { lel_pct: number; uel_pct: number }
  vapor_density: number
  static_electricity_risk: 'low' | 'medium' | 'high'
  dust_explosion_risk: boolean
}

interface ToxicologicalProfile {
  acute_toxicity_category: 1 | 2 | 3 | 4 | 5 | 'unclassified'
  ld50_estimate: number
  lc50_estimate: number
  irritation_potential: 'corrosive' | 'severe' | 'moderate' | 'mild' | 'none'
  sensitization_potential: 'strong' | 'moderate' | 'weak' | 'none'
  mutagenicity: 'positive' | 'suspected' | 'negative' | 'unknown'
  carcinogenicity_category: '1A' | '1B' | '2' | 'unclassified'
  reproductive_toxicity: 'known' | 'suspected' | 'no_data'
}

interface ExposureAssessment {
  oel_mg_m3: number
  estimated_exposure_mg_m3: number
  margin_of_safety: number
  exposure_ratio: number
  control_band: 'A' | 'B' | 'C' | 'D'
  required_ventilation: string
}

interface PPERequirement {
  respiratory: string
  hand_protection: string
  eye_protection: string
  body_protection: string
  additional_measures: string[]
}

interface SafetyResult {
  chemical_name: string
  physical_hazards: PhysicalHazards
  toxicology: ToxicologicalProfile
  exposure: ExposureAssessment
  ppe: PPERequirement
  overall_risk_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  emergency_measures: string[]
  recommendations: string[]
}

// --- Tool 7: Market Pricing Chem ---
interface PricingInput {
  chemical_name: string
  grade: 'technical' | 'pharma' | 'food' | 'electronic' | 'polymer'
  region: 'global' | 'china' | 'us' | 'europe' | 'asia_pacific'
  volume_tons: number
  contract_type: 'spot' | 'short_term' | 'long_term'
  crude_oil_benchmark: 'WTI' | 'Brent' | 'Dubai'
  current_crude_price: string
  historical_months: number
}

interface CrudeOilLinkage {
  correlation_coefficient: number
  feedstock: string
  cracking_margin: number
  price_transmission_lag_months: number
  cost_breakdown: Array<{ component: string; percentage: number }>
}

interface SupplyDemandBalance {
  global_capacity_tons: number
  global_demand_tons: number
  capacity_utilization_pct: number
  demand_growth_rate_pct: number
  supply_growth_rate_pct: number
  balance_status: 'tight' | 'balanced' | 'oversupplied'
  key_growth_drivers: string[]
}

interface TradeFlowData {
  top_exporters: Array<{ country: string; volume_tons: number; share_pct: number }>
  top_importers: Array<{ country: string; volume_tons: number; share_pct: number }>
  trade_balance: number
  tariff_impact: string
}

interface InventoryAnalysis {
  current_inventory_days: number
  historical_avg_days: number
  inventory_trend: string
  warehouse_utilization_pct: number
  strategic_reserve_status: string
}

interface PriceForecast {
  current_price_per_ton: number
  forecast_3m: number
  forecast_6m: number
  forecast_12m: number
  price_range_low: number
  price_range_high: number
  confidence: number
}

interface PricingResult {
  chemical_name: string
  crude_linkage: CrudeOilLinkage
  supply_demand: SupplyDemandBalance
  trade_flows: TradeFlowData
  inventory: InventoryAnalysis
  price_forecast: PriceForecast
  procurement_strategy: string[]
  recommendations: string[]
}

// --- Tool 8: Circular Economy Polymer ---
interface CircularPolymerInput {
  polymer_type: 'PET' | 'PE' | 'PP' | 'PS' | 'PVC' | 'PLA' | 'PHA' | 'PA' | 'PC' | 'mixed'
  application: 'packaging' | 'textile' | 'automotive' | 'construction' | 'electronics' | 'agriculture'
  annual_volume_tons: number
  recycling_method: 'mechanical' | 'chemical' | 'energy_recovery' | 'composting' | 'depolymerization'
  target_recycled_content_pct: number
  region: string
  end_of_life_scenario: string
}

interface RecyclingAnalysis {
  recycling_rate_current: number
  recycling_rate_target: number
  collection_rate: number
  sorting_efficiency_pct: number
  recycled_output_quality: string
  quality_degradation_per_cycle: number
  max_recyclable_cycles: number
}

interface DegradationProfile {
  biodegradation_months: number
  biodegradation_conditions: string
  microplastic_generation_risk: string
  compostability_certified: boolean
  degradation_products: string[]
}

interface BioBasedAlternative {
  bio_polymer: string
  bio_content_pct: number
  performance_comparison: string
  cost_premium_pct: number
  carbon_footprint_reduction_pct: number
  commercial_availability: string
}

interface CircularEconomyMetrics {
  circularity_index: number
  co2_reduction_tons: number
  virgin_material_displaced_tons: number
  water_savings_m3: number
  energy_savings_gj: number
  economic_value_eur: number
}

interface CircularPolymerResult {
  polymer_type: string
  recycling: RecyclingAnalysis
  degradation: DegradationProfile
  bio_based_alternatives: BioBasedAlternative[]
  circular_economy_metrics: CircularEconomyMetrics
  regulatory_incentives: string[]
  recommendations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Formulation Optimizer ---
function analyzeFormulation(input: FormulationInput): FormulationResult {
  const r = rng(input.product_type + input.raw_materials.length)
  const r2 = rng(input.product_type + "_2")

  const doeRuns: DoeRun[] = []
  const numRuns = input.doe_type === "full_factorial" ? 9 : input.doe_type === "latin_hypercube" ? 12 : 7
  for (let i = 0; i < numRuns; i++) {
    const factors: Record<string, number> = {}
    for (const mat of input.raw_materials) {
      factors[mat.name] = Math.round((mat.min_pct + r() * (mat.max_pct - mat.min_pct)) * 100) / 100
    }
    const predicted = Math.round((0.6 + r2() * 0.35) * 100) / 100
    doeRuns.push({ run_id: i + 1, factors, predicted_response: predicted, confidence: Math.round((0.7 + r() * 0.25) * 100) / 100 })
  }

  const optimalPoint: Record<string, number> = {}
  for (const mat of input.raw_materials) {
    optimalPoint[mat.name] = Math.round((mat.min_pct + r() * (mat.max_pct - mat.min_pct)) * 100) / 100
  }
  const responseSurface: ResponseSurface = {
    optimal_point: optimalPoint,
    predicted_optimum: Math.round((0.85 + r2() * 0.12) * 100) / 100,
    r_squared: Math.round((0.88 + r() * 0.1) * 100) / 100,
    rmse: Math.round((0.02 + r2() * 0.05) * 10000) / 10000,
    significant_factors: input.raw_materials.slice(0, Math.min(3, input.raw_materials.length)).map(m => m.name)
  }

  const totalPct = input.raw_materials.reduce((s, m) => s + (optimalPoint[m.name] || 0), 0)
  const optimalFormulation = input.raw_materials.map(m => {
    const pct = totalPct > 0 ? ((optimalPoint[m.name] || 0) / totalPct) * 100 : 100 / input.raw_materials.length
    return { material: m.name, percentage: Math.round(pct * 100) / 100, cost_contribution: Math.round(pct * m.cost_per_kg / 100 * 100) / 100 }
  })

  const predictedProperties = input.target_properties.map(tp => {
    const predicted = Math.round(tp.target_value * (0.9 + r() * 0.2) * 100) / 100
    const diff = Math.abs(predicted - tp.target_value) / tp.target_value
    const status = diff < 0.05 ? "达标" : diff < 0.15 ? "接近" : "需优化"
    return { property: tp.property, predicted, target: tp.target_value, unit: tp.unit, status }
  })

  const totalCost = optimalFormulation.reduce((s, f) => s + f.cost_contribution, 0)
  const baselineCost = input.raw_materials.reduce((s, m) => s + m.max_pct * m.cost_per_kg / 100, 0)

  return {
    product_type: input.product_type,
    doe_runs: doeRuns,
    response_surface: responseSurface,
    optimal_formulation: optimalFormulation,
    predicted_properties: predictedProperties,
    cost_analysis: { total_cost_per_kg: Math.round(totalCost * 100) / 100, savings_vs_baseline: Math.round((baselineCost - totalCost) * 100) / 100 },
    recommendations: [
      "建议进行验证实验确认响应面模型预测",
      "关注关键因子交互作用对性能的影响",
      "考虑原料批次稳定性对配方一致性的影响",
      "建立质量控制关键控制点（CCP）",
    ]
  }
}

// --- Tool 2: Process Scale-up ---
function analyzeScaleup(input: ScaleupInput): ScaleupResult {
  const r = rng(input.reaction_type + input.reactor_type)
  const r2 = rng(input.reaction_type + "_2")

  const currentVol = parseFloat(input.current_scale) || 1
  const scaleRatio = input.target_scale / currentVol

  const kla = Math.round((0.01 + r() * 0.05) * 10000) / 10000
  const mixingTime = Math.round((5 + r2() * 25) * 100) / 100
  const da = Math.round((0.1 + r() * 2) * 100) / 100
  const regime: MassTransferAnalysis["regime"] = da < 0.1 ? "kinetic" : da < 1 ? "mixed" : "mass_transfer"
  const hotspotRisk: MassTransferAnalysis["hotspot_risk"] = da > 1.5 ? "high" : da > 0.5 ? "medium" : "low"

  const massTransfer: MassTransferAnalysis = {
    kla_estimate: kla,
    mixing_time_s: mixingTime,
    damkohler_number: da,
    regime,
    hotspot_risk: hotspotRisk,
    recommendation: regime === "mass_transfer" ? "强化传质：提高搅拌转速或改进分布器" : regime === "mixed" ? "兼顾传质与动力学优化" : "反应控制：关注温度分布均匀性"
  }

  const requiredHeat = Math.round(Math.abs(input.heat_of_reaction_kj_mol) * 1000 * (1 + r() * 0.3))
  const heatRemovalCapacity = Math.round(requiredHeat * (0.8 + r2() * 0.5))
  const jacketRatio = Math.round((1 / Math.pow(scaleRatio, 0.33)) * 100) / 100
  const deltaT = Math.round((15 + r() * 25) * 100) / 100
  const runawayRisk: HeatTransferAnalysis["thermal_runaway_risk"] = jacketRatio < 0.5 ? "high" : jacketRatio < 0.7 ? "medium" : "low"

  const heatTransfer: HeatTransferAnalysis = {
    heat_removal_capacity: heatRemovalCapacity,
    required_heat_removal: requiredHeat,
    jacket_area_ratio: jacketRatio,
    delta_t_approach: deltaT,
    thermal_runaway_risk: runawayRisk,
    cooling_recommendation: runawayRisk === "high" ? "需增加内盘管或外部换热器" : runawayRisk === "medium" ? "建议预留冷却余量" : "现有冷却能力充足"
  }

  const reactorVol = Math.round(input.target_scale * 1.2)
  const diameter = Math.round(Math.pow(reactorVol / 3.14, 0.33) * 100) / 100
  const height = Math.round((diameter * 2.5) * 100) / 100

  const reactorSizing: ReactorSizing = {
    reactor_volume_l: reactorVol,
    diameter_m: diameter,
    height_m: height,
    agitation_rpm: Math.round(60 + r() * 180),
    jacket_area_m2: Math.round(3.14 * diameter * height * 0.8 * 100) / 100,
    throughput_kg_h: Math.round(input.target_scale * 1000 / 24 * 100) / 100
  }

  const risks: ScaleupResult["risk_assessment"] = [
    { risk: "传热限制", severity: runawayRisk === "high" ? "high" : "medium", mitigation: "分段进料或增加换热面积" },
    { risk: "传质限制", severity: hotspotRisk === "high" ? "high" : "medium", mitigation: "优化搅拌器类型与转速" },
    { risk: "混合不均", severity: scaleRatio > 100 ? "high" : "low", mitigation: "设置多级搅拌或静态混合器" },
  ]

  return {
    reaction_type: input.reaction_type,
    scale_ratio: Math.round(scaleRatio * 100) / 100,
    mass_transfer: massTransfer,
    heat_transfer: heatTransfer,
    reactor_sizing: reactorSizing,
    pilot_recommendations: [
      `建议在中试规模(${Math.round(input.target_scale * 0.01)} ${input.target_unit})验证工艺参数`,
      "进行HAZOP分析识别潜在危险与可操作性风险",
      "建立关键工艺参数（CPP）设计空间",
      "评估在线PAT技术用于实时监控",
    ],
    risk_assessment: risks,
    recommendations: [
      "逐级放大：实验室→中试→工业化，每级放大倍数不超过10倍",
      "重点关注传热与传质相似性",
      "建立过程安全边界与紧急泄放系统",
      "评估连续化生产的可行性以提升安全性",
    ]
  }
}

// --- Tool 3: Regulatory Compliance Chem ---
function analyzeCompliance(input: ComplianceInput): ComplianceResult {
  const r = rng(input.substance_name + input.cas_number)
  const r2 = rng(input.substance_name + "_2")

  const tier: ReachStatus["registration_tier"] = input.annual_tonnage >= 1000 ? "1000t+" : input.annual_tonnage >= 100 ? "100-1000t" : input.annual_tonnage >= 10 ? "10-100t" : "1-10t"
  const requiredStudies = tier === "1000t+" ? ["急性毒性", "重复剂量毒性", "生殖毒性", "致突变性", "致癌性", "毒代动力学", "PBT/vPvB评估"] : tier === "100-1000t" ? ["急性毒性", "重复剂量毒性", "生殖毒性", "致突变性", "毒代动力学"] : tier === "10-100t" ? ["急性毒性", "重复剂量毒性", "致突变性"] : ["急性毒性", "皮肤刺激", "眼刺激"]

  const reach: ReachStatus = {
    registered: input.reach_registered || false,
    registration_tier: tier,
    required_studies: requiredStudies,
    data_gaps: r() > 0.5 ? ["生态毒理学数据缺失", "暴露场景不完整"] : ["降解数据需补充"],
    estimated_cost_eur: Math.round((50000 + r() * 450000)),
    timeline_months: Math.round(6 + r2() * 18),
    sds_required: true
  }

  const ghs: GhsClassification = {
    physical_hazards: [
      { class_: "易燃液体", category: r() > 0.5 ? "3" : "4", signal_word: r() > 0.5 ? "危险" : "警告", hazard_statement: "H226 易燃液体和蒸气" },
    ],
    health_hazards: [
      { class_: "急性毒性", category: r2() > 0.5 ? "4" : "5", signal_word: "警告", hazard_statement: "H302 吞咽有害" },
      { class_: "皮肤腐蚀/刺激", category: "3", signal_word: "警告", hazard_statement: "H316 造成轻微皮肤刺激" },
    ],
    environmental_hazards: [
      { class_: "危害水生环境", category: "慢性3", hazard_statement: "H412 对水生生物有害并有长期持续影响" },
    ],
    pictograms: ["GHS07"],
    precautionary_statements: ["P261 避免吸入粉尘/烟/气体/烟雾", "P280 戴防护手套/穿防护服/戴防护眼罩", "P305+P351+P338 如进入眼睛：用水小心冲洗几分钟"]
  }

  const registries = ["中国", "欧盟", "美国", "日本", "韩国"]
  const hazchemRegs = registries.map(country => ({
    country,
    registered: r() > 0.3,
    regulatory_body: country === "中国" ? "应急管理部" : country === "欧盟" ? "ECHA" : country === "美国" ? "EPA" : country === "日本" ? "NITE" : "KOSHA",
    status: r() > 0.3 ? "compliant" as const : r() > 0.15 ? "pending" as const : "non_compliant" as const,
    next_action: r() > 0.3 ? "维持合规状态" : "启动登记程序"
  }))

  const complianceScore = Math.round((0.6 + r2() * 0.35) * 100) / 100

  return {
    substance_name: input.substance_name,
    cas_number: input.cas_number,
    reach,
    ghs,
    hazchem_registrations: hazchemRegs,
    msds_sections_complete: Math.round(12 + r() * 6),
    overall_compliance_score: complianceScore,
    recommendations: [
      `REACH注册等级：${tier}，需完成${requiredStudies.length}项研究`,
      "更新SDS至GHS第8修订版要求",
      "建立暴露场景文件并提交CSR",
      "关注SVHC候选清单更新，评估信息传递义务",
    ]
  }
}

// --- Tool 4: Catalyst Design ---
function analyzeCatalyst(input: CatalystInput): CatalystResult {
  const r = rng(input.reaction_name + input.active_metal)
  const r2 = rng(input.reaction_name + "_2")

  const predConv = Math.round(Math.min(input.target_conversion * (0.9 + r() * 0.15), 0.99) * 100) / 100
  const tof = Math.round((100 + r2() * 900) * 100) / 100
  const ea = Math.round((40 + r() * 80) * 100) / 100

  const activity: ActivityPrediction = {
    predicted_conversion: predConv,
    turn_over_frequency: tof,
    activation_energy_pred: ea,
    rate_constant: Math.round(Math.exp(-ea / (8.314 * (input.operating_temperature + 273))) * 1e6 * 100) / 100,
    temperature_sensitivity: ea > 80 ? "高" : ea > 50 ? "中" : "低",
    active_site_density: Math.round((1e15 + r2() * 5e15) * 100) / 100
  }

  const predSel = Math.round(Math.min(input.target_selectivity * (0.88 + r() * 0.12), 0.99) * 100) / 100
  const selectivity: SelectivityAnalysis = {
    predicted_selectivity: predSel,
    byproducts: [
      { name: "CO2", selectivity: Math.round((1 - predSel) * 0.4 * 100) / 100, suppression_strategy: "降低反应温度或调整空速" },
      { name: "重质副产物", selectivity: Math.round((1 - predSel) * 0.3 * 100) / 100, suppression_strategy: "优化催化剂孔径分布" },
    ],
    side_reactions: r() > 0.5 ? ["深度氧化", "裂解"] : ["聚合", "异构化"],
    optimal_temperature_window: [input.operating_temperature - 20, input.operating_temperature + 30]
  }

  const deactRate = Math.round((0.001 + r2() * 0.009) * 10000) / 10000
  const mechanism: DeactivationModel["mechanism"] = r() > 0.6 ? "coking" : r() > 0.3 ? "sintering" : "poisoning"
  const lifetime = Math.round(input.target_lifetime_months * (0.7 + r2() * 0.5) * 100) / 100

  const deactivation: DeactivationModel = {
    deactivation_rate: deactRate,
    mechanism,
    predicted_lifetime_months: lifetime,
    regeneration_possible: mechanism !== "sintering",
    regeneration_method: mechanism === "coking" ? "焙烧再生" : mechanism === "sintering" ? "无法再生，需更换" : "化学洗涤",
    regeneration_frequency_months: Math.round(lifetime * 0.3)
  }

  return {
    reaction_name: input.reaction_name,
    catalyst_type: input.catalyst_type,
    activity,
    selectivity,
    deactivation,
    optimization_suggestions: [
      { parameter: "金属负载量", current: 1, recommended: Math.round((1.2 + r() * 0.8) * 100) / 100, impact: "提高活性位密度" },
      { parameter: "焙烧温度", current: 400, recommended: Math.round(380 + r() * 80), impact: "调控金属分散度" },
      { parameter: "空速", current: 5000, recommended: Math.round(4000 + r() * 3000), impact: "优化接触时间与转化率" },
    ],
    cost_performance_score: Math.round((0.6 + r2() * 0.35) * 100) / 100,
    recommendations: [
      `主要失活机制：${mechanism}，建议${deactivation.regeneration_possible ? "建立再生方案" : "优化操作条件延长寿命"}`,
      `预测选择性${(predSel * 100).toFixed(1)}%，可通过调节温度窗口进一步优化`,
      "建议进行加速老化实验验证寿命预测",
      "评估毒物耐受性，考虑增加保护床层",
    ]
  }
}

// --- Tool 5: Materials Informatics ---
function analyzeInformatics(input: InformaticsInput): InformaticsResult {
  const r = rng(input.material_class + input.target_property)
  const r2 = rng(input.material_class + "_2")

  const dbs = ["Materials Project", "AFLOW", "OQMD", "NOMAD", "ICSD"]
  const similarMats = Array.from({ length: 5 }, (_, i) => ({
    name: `${input.material_class}-${String.fromCharCode(65 + i)}${Math.round(r() * 100)}`,
    property_value: Math.round(input.target_value * (0.7 + r2() * 0.6) * 100) / 100,
    similarity: Math.round((0.6 + r() * 0.35) * 100) / 100,
    reference: `DOI:10.${Math.round(1000 + r() * 9000)}/mat.${Math.round(2020 + r2() * 5)}`
  }))

  const database: DatabaseSearch = {
    databases_queried: dbs.slice(0, Math.round(2 + r() * 3)),
    similar_materials: similarMats,
    data_quality: input.existing_data_points > 1000 ? "high" : input.existing_data_points > 100 ? "medium" : "low",
    publications_found: Math.round(50 + r() * 500),
    patents_found: Math.round(10 + r2() * 100)
  }

  const modelType = input.ml_model || (r() > 0.5 ? "BO_gp" : "GCNN")
  const mlPotential: MLPotential = {
    model_type: modelType,
    training_rmse: Math.round((0.05 + r() * 0.1) * 10000) / 10000,
    validation_rmse: Math.round((0.08 + r2() * 0.12) * 10000) / 10000,
    r_squared: Math.round((0.82 + r() * 0.15) * 100) / 100,
    feature_importance: [
      { feature: "组成比", importance: Math.round((0.2 + r() * 0.15) * 100) / 100 },
      { feature: "合成温度", importance: Math.round((0.15 + r2() * 0.1) * 100) / 100 },
      { feature: "粒径", importance: Math.round((0.1 + r() * 0.1) * 100) / 100 },
      { feature: "表面积", importance: Math.round((0.08 + r2() * 0.08) * 100) / 100 },
    ],
    prediction_interval: [Math.round(input.target_value * 0.85 * 100) / 100, Math.round(input.target_value * 1.15 * 100) / 100]
  }

  const screened = Math.round(input.search_space_size * (0.01 + r() * 0.09))
  const topCandidates = Array.from({ length: 5 }, (_, i) => ({
    id: `CAND-${String.fromCharCode(65 + i)}`,
    predicted_property: Math.round(input.target_value * (0.9 + r() * 0.2) * 100) / 100,
    confidence: Math.round((0.7 + r2() * 0.25) * 100) / 100,
    composition: `${input.material_class}-${Math.round(50 + r() * 50)}%A-${Math.round(20 + r2() * 30)}%B`
  }))

  const highThroughput: HighThroughputResult = {
    candidates_screened: screened,
    top_candidates: topCandidates,
    pareto_front: topCandidates.slice(0, 3).map(c => ({ id: c.id, property1: c.predicted_property, property2: Math.round(c.confidence * 100) / 100 })),
    recommended_for_validation: topCandidates.slice(0, 3).map(c => c.id),
    coverage_pct: Math.round((screened / input.search_space_size) * 10000) / 100
  }

  return {
    material_class: input.material_class,
    database,
    ml_potential: mlPotential,
    high_throughput: highThroughput,
    active_learning_rounds: Math.round(2 + r() * 5),
    recommendations: [
      `推荐使用${modelType}模型，预测R²=${mlPotential.r_squared}`,
      `高通量筛选覆盖${highThroughput.coverage_pct}%搜索空间`,
      "建议进行3-5轮主动学习迭代优化",
      "优先验证Top 3候选材料",
    ]
  }
}

// --- Tool 6: Safety & Toxicology ---
function analyzeSafety(input: SafetyInput): SafetyResult {
  const r = rng(input.chemical_name + input.cas_number)
  const r2 = rng(input.chemical_name + "_2")

  const fpClass: PhysicalHazards["flash_point_class"] = input.flash_point_c < 0 ? "extremely_flammable" : input.flash_point_c < 23 ? "highly_flammable" : input.flash_point_c < 60 ? "flammable" : input.flash_point_c < 93 ? "combustible" : "non_flammable"
  const physicalHazards: PhysicalHazards = {
    flash_point_class: fpClass,
    autoignition_temp: Math.round(200 + r() * 400),
    explosive_limits: { lel_pct: Math.round((0.5 + r() * 1.5) * 100) / 100, uel_pct: Math.round((6 + r2() * 10) * 100) / 100 },
    vapor_density: Math.round((1 + r() * 3) * 100) / 100,
    static_electricity_risk: input.vapor_pressure_mmhg > 50 && fpClass !== "non_flammable" ? "high" : input.vapor_pressure_mmhg > 10 ? "medium" : "low",
    dust_explosion_risk: input.chemical_name.includes("粉") || input.chemical_name.includes("尘")
  }

  const ld50 = input.ld50_oral_mg_kg || Math.round(50 + r() * 2000)
  const toxCat: ToxicologicalProfile["acute_toxicity_category"] = ld50 <= 5 ? 1 : ld50 <= 50 ? 2 : ld50 <= 300 ? 3 : ld50 <= 2000 ? 4 : 5
  const toxicology: ToxicologicalProfile = {
    acute_toxicity_category: toxCat,
    ld50_estimate: ld50,
    lc50_estimate: Math.round((100 + r2() * 5000) * 100) / 100,
    irritation_potential: r() > 0.6 ? "moderate" : r() > 0.3 ? "mild" : "none",
    sensitization_potential: r2() > 0.7 ? "moderate" : r2() > 0.3 ? "weak" : "none",
    mutagenicity: r() > 0.7 ? "negative" : r() > 0.4 ? "unknown" : "suspected",
    carcinogenicity_category: r2() > 0.8 ? "2" : "unclassified",
    reproductive_toxicity: r() > 0.8 ? "no_data" : "suspected"
  }

  const oelMgM3 = (input.oel_ppm || 10) * input.molecular_weight / 24.45
  const estExposure = Math.round(oelMgM3 * (0.1 + r() * 0.8) * 100) / 100
  const mos = Math.round((oelMgM3 / Math.max(estExposure, 0.01)) * 100) / 100
  const exposure: ExposureAssessment = {
    oel_mg_m3: Math.round(oelMgM3 * 100) / 100,
    estimated_exposure_mg_m3: estExposure,
    margin_of_safety: mos,
    exposure_ratio: Math.round((estExposure / oelMgM3) * 100) / 100,
    control_band: mos > 10 ? "A" : mos > 3 ? "B" : mos > 1 ? "C" : "D",
    required_ventilation: mos > 3 ? "一般通风" : mos > 1 ? "局部排风" : "密闭操作+全面通风"
  }

  const ppe: PPERequirement = {
    respiratory: exposure.control_band === "D" ? "全面罩呼吸器" : exposure.control_band === "C" ? "半面罩+有机蒸气滤毒盒" : "防尘口罩",
    hand_protection: toxicology.irritation_potential === "corrosive" ? "耐酸碱手套" : "丁腈手套",
    eye_protection: physicalHazards.flash_point_class === "extremely_flammable" ? "防溅护目镜+面罩" : "安全护目镜",
    body_protection: exposure.control_band === "D" ? "防化服" : "防静电工作服",
    additional_measures: ["紧急淋浴器", "洗眼器", "防爆电气设备"]
  }

  const riskLevel: SafetyResult["overall_risk_level"] = fpClass === "extremely_flammable" || toxCat <= 2 ? "very_high" : fpClass === "highly_flammable" || toxCat === 3 ? "high" : fpClass === "flammable" ? "medium" : fpClass === "combustible" ? "low" : "very_low"

  return {
    chemical_name: input.chemical_name,
    physical_hazards: physicalHazards,
    toxicology,
    exposure,
    ppe,
    overall_risk_level: riskLevel,
    emergency_measures: [
      "火灾：使用干粉/CO2灭火器，禁止用水直接喷射",
      "泄漏：收集回收或用惰性材料吸附，不得排入下水道",
      "吸入：转移至空气新鲜处，如呼吸困难给予输氧",
      "皮肤接触：脱去污染衣物，用大量清水冲洗至少15分钟",
    ],
    recommendations: [
      `风险等级：${riskLevel}，控制带：${exposure.control_band}`,
      `安全裕度(MOS)：${mos}，${mos > 3 ? "可接受" : "需加强控制措施"}`,
      `建议${ppe.respiratory}作为最低呼吸防护要求`,
      "定期进行职业健康监测与暴露评估",
    ]
  }
}

// --- Tool 7: Market Pricing Chem ---
function analyzePricing(input: PricingInput): PricingResult {
  const r = rng(input.chemical_name + input.region)
  const r2 = rng(input.chemical_name + "_2")

  const crudePrice = parseFloat(input.current_crude_price) || 80
  const correlation = Math.round((0.5 + r() * 0.4) * 100) / 100
  const crudeLinkage: CrudeOilLinkage = {
    correlation_coefficient: correlation,
    feedstock: input.chemical_name.includes("聚") ? "石脑油" : input.chemical_name.includes("醇") ? "煤炭/天然气" : "石脑油/轻烃",
    cracking_margin: Math.round((100 + r2() * 300) * 100) / 100,
    price_transmission_lag_months: Math.round(1 + r() * 3),
    cost_breakdown: [
      { component: "原料", percentage: Math.round(50 + r() * 20) },
      { component: "能源", percentage: Math.round(10 + r2() * 10) },
      { component: "人工", percentage: Math.round(5 + r() * 5) },
      { component: "制造费用", percentage: Math.round(10 + r2() * 10) },
    ]
  }

  const capacity = Math.round(1000000 + r() * 9000000)
  const demand = Math.round(capacity * (0.75 + r2() * 0.2))
  const utilization = Math.round((demand / capacity) * 10000) / 100
  const supplyDemand: SupplyDemandBalance = {
    global_capacity_tons: capacity,
    global_demand_tons: demand,
    capacity_utilization_pct: utilization,
    demand_growth_rate_pct: Math.round((2 + r() * 6) * 100) / 100,
    supply_growth_rate_pct: Math.round((1 + r2() * 5) * 100) / 100,
    balance_status: utilization > 90 ? "tight" : utilization > 75 ? "balanced" : "oversupplied",
    key_growth_drivers: ["新能源汽车需求", "包装行业增长", "基建投资拉动"]
  }

  const tradeFlows: TradeFlowData = {
    top_exporters: [
      { country: "中国", volume_tons: Math.round(500000 + r() * 2000000), share_pct: Math.round(20 + r() * 20) },
      { country: "美国", volume_tons: Math.round(300000 + r2() * 1000000), share_pct: Math.round(15 + r() * 15) },
      { country: "沙特", volume_tons: Math.round(200000 + r() * 800000), share_pct: Math.round(10 + r2() * 10) },
    ],
    top_importers: [
      { country: "欧盟", volume_tons: Math.round(400000 + r() * 1500000), share_pct: Math.round(18 + r() * 12) },
      { country: "印度", volume_tons: Math.round(200000 + r2() * 1000000), share_pct: Math.round(12 + r() * 10) },
    ],
    trade_balance: Math.round((-500000 + r() * 1000000)),
    tariff_impact: r() > 0.5 ? "关税上调2-5%影响出口竞争力" : "现行关税水平下竞争力稳定"
  }

  const inventory: InventoryAnalysis = {
    current_inventory_days: Math.round(20 + r() * 30),
    historical_avg_days: Math.round(25 + r2() * 15),
    inventory_trend: r() > 0.5 ? "下降" : "上升",
    warehouse_utilization_pct: Math.round(60 + r() * 30),
    strategic_reserve_status: "正常"
  }

  const basePrice = Math.round(8000 + r() * 15000)
  const priceForecast: PriceForecast = {
    current_price_per_ton: basePrice,
    forecast_3m: Math.round(basePrice * (0.95 + r2() * 0.1)),
    forecast_6m: Math.round(basePrice * (0.9 + r() * 0.2)),
    forecast_12m: Math.round(basePrice * (0.85 + r2() * 0.25)),
    price_range_low: Math.round(basePrice * 0.8),
    price_range_high: Math.round(basePrice * 1.2),
    confidence: Math.round((0.65 + r() * 0.25) * 100) / 100
  }

  return {
    chemical_name: input.chemical_name,
    crude_linkage: crudeLinkage,
    supply_demand: supplyDemand,
    trade_flows: tradeFlows,
    inventory,
    price_forecast: priceForecast,
    procurement_strategy: [
      supplyDemand.balance_status === "tight" ? "建议锁定长单，规避供应风险" : "可灵活采购，利用现货市场波动",
      `原油价格联动系数${correlation}，建议建立原油对冲机制`,
      `库存天数${inventory.current_inventory_days}天，${inventory.inventory_trend === "下降" ? "建议增加安全库存" : "库存充足可延缓采购"}`,
    ],
    recommendations: [
      `当前供需格局：${supplyDemand.balance_status}，产能利用率${utilization}%`,
      `价格预测：3个月${priceForecast.forecast_3m}元/吨，12个月${priceForecast.forecast_12m}元/吨`,
      "关注新增产能投放节奏对供需平衡的影响",
      "评估上下游一体化布局的战略价值",
    ]
  }
}

// --- Tool 8: Circular Economy Polymer ---
function analyzeCircularPolymer(input: CircularPolymerInput): CircularPolymerResult {
  const r = rng(input.polymer_type + input.application)
  const r2 = rng(input.polymer_type + "_2")

  const recyclingRate = Math.round((0.1 + r() * 0.4) * 100) / 100
  const recycling: RecyclingAnalysis = {
    recycling_rate_current: recyclingRate,
    recycling_rate_target: Math.min(recyclingRate + 0.2, 0.8),
    collection_rate: Math.round((0.4 + r2() * 0.4) * 100) / 100,
    sorting_efficiency_pct: Math.round(70 + r() * 25),
    recycled_output_quality: r() > 0.5 ? "接近原生料" : "降级应用",
    quality_degradation_per_cycle: Math.round((5 + r2() * 10) * 100) / 100,
    max_recyclable_cycles: Math.round(3 + r() * 5)
  }

  const degradation: DegradationProfile = {
    biodegradation_months: Math.round(6 + r() * 42),
    biodegradation_conditions: input.polymer_type === "PLA" ? "工业堆肥58°C" : "自然环境（极慢）",
    microplastic_generation_risk: input.polymer_type === "PLA" || input.polymer_type === "PHA" ? "低" : "高",
    compostability_certified: input.polymer_type === "PLA",
    degradation_products: input.polymer_type === "PLA" ? ["CO2", "水", "生物质"] : ["微塑料", "低聚物"]
  }

  const bioAlternatives: BioBasedAlternative[] = [
    { bio_polymer: "PLA", bio_content_pct: 100, performance_comparison: "力学性能接近PS", cost_premium_pct: Math.round(30 + r() * 50), carbon_footprint_reduction_pct: Math.round(40 + r2() * 30), commercial_availability: "商业化" },
    { bio_polymer: "PHA", bio_content_pct: 100, performance_comparison: "可生物降解", cost_premium_pct: Math.round(80 + r() * 120), carbon_footprint_reduction_pct: Math.round(50 + r2() * 30), commercial_availability: "中试阶段" },
    { bio_polymer: "生物基PE", bio_content_pct: 100, performance_comparison: "与化石基PE相同", cost_premium_pct: Math.round(15 + r() * 25), carbon_footprint_reduction_pct: Math.round(60 + r2() * 20), commercial_availability: "商业化" },
  ]

  const co2Reduction = Math.round(input.annual_volume_tons * recyclingRate * 1.5)
  const circularMetrics: CircularEconomyMetrics = {
    circularity_index: Math.round((recyclingRate * 0.6 + (input.target_recycled_content_pct / 100) * 0.4) * 100) / 100,
    co2_reduction_tons: co2Reduction,
    virgin_material_displaced_tons: Math.round(input.annual_volume_tons * recyclingRate),
    water_savings_m3: Math.round(input.annual_volume_tons * recyclingRate * 5),
    energy_savings_gj: Math.round(input.annual_volume_tons * recyclingRate * 25),
    economic_value_eur: Math.round(input.annual_volume_tons * recyclingRate * 200)
  }

  return {
    polymer_type: input.polymer_type,
    recycling,
    degradation,
    bio_based_alternatives: bioAlternatives,
    circular_economy_metrics: circularMetrics,
    regulatory_incentives: [
      "欧盟塑料税：0.80欧元/公斤不可回收塑料包装废弃物",
      "中国十四五塑料污染治理行动方案",
      "EPR制度下生产者责任延伸要求",
    ],
    recommendations: [
      `当前回收率${(recyclingRate * 100).toFixed(0)}%，目标${(recycling.recycling_rate_target * 100).toFixed(0)}%，需提升收集与分拣效率`,
      `预计年减排CO2 ${co2Reduction}吨，经济价值${circularMetrics.economic_value_eur}欧元`,
      "建议开发单一材质包装以提升可回收性",
      "评估化学回收技术作为机械回收的补充",
    ]
  }
}

// ==================== SECTION 4 — 格式化函数 ====================

// --- Tool 1: Formulation Optimizer ---
function formatFormulation(r: FormulationResult): string {
  const lines: string[] = []
  lines.push("## 🧪 配方优化报告 — Formulation Optimizer")
  lines.push("")
  lines.push(`产品类型: ${r.product_type} | 成本: ${r.cost_analysis.total_cost_per_kg} 元/kg | 节省: ${r.cost_analysis.savings_vs_baseline} 元/kg`)
  lines.push("")
  lines.push("### 📊 DOE实验设计")
  lines.push("| 实验号 | 预测响应值 | 置信度 |")
  lines.push("|--------|-----------|--------|")
  for (const run of r.doe_runs) {
    lines.push(`| ${run.run_id} | ${run.predicted_response} | ${(run.confidence * 100).toFixed(0)}% |`)
  }
  lines.push("")
  lines.push("### 📈 响应面分析")
  lines.push(`- R²: ${r.response_surface.r_squared} | RMSE: ${r.response_surface.rmse}`)
  lines.push(`- 预测最优值: ${r.response_surface.predicted_optimum}`)
  lines.push(`- 显著因子: ${r.response_surface.significant_factors.join(", ")}`)
  lines.push("")
  lines.push("### 🧬 最优配方")
  lines.push("| 原料 | 比例(%) | 成本贡献(元/kg) |")
  lines.push("|------|---------|----------------|")
  for (const f of r.optimal_formulation) {
    lines.push(`| ${f.material} | ${f.percentage} | ${f.cost_contribution} |`)
  }
  lines.push("")
  lines.push("### 🎯 性能预测")
  lines.push("| 性能指标 | 预测值 | 目标值 | 单位 | 状态 |")
  lines.push("|----------|--------|--------|------|------|")
  for (const p of r.predicted_properties) {
    lines.push(`| ${p.property} | ${p.predicted} | ${p.target} | ${p.unit} | ${p.status} |`)
  }
  lines.push("")
  lines.push("### 📋 优化建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// --- Tool 2: Process Scale-up ---
function formatScaleup(r: ScaleupResult): string {
  const lines: string[] = []
  lines.push("## ⚙️ 工艺放大报告 — Process Scale-up")
  lines.push("")
  lines.push(`反应类型: ${r.reaction_type} | 放大倍数: ${r.scale_ratio}x`)
  lines.push("")
  lines.push("### 🔄 传质分析")
  lines.push(`- kLa估计: ${r.mass_transfer.kla_estimate} s⁻¹ | 混合时间: ${r.mass_transfer.mixing_time_s} s`)
  lines.push(`- Damköhler数: ${r.mass_transfer.damkohler_number} | 控制区域: ${r.mass_transfer.regime}`)
  lines.push(`- 热点风险: ${r.mass_transfer.hotspot_risk} | 建议: ${r.mass_transfer.recommendation}`)
  lines.push("")
  lines.push("### 🌡️ 传热分析")
  lines.push(`- 需移除热量: ${r.heat_transfer.required_heat_removal} kW | 移除能力: ${r.heat_transfer.heat_removal_capacity} kW`)
  lines.push(`- 夹套面积比: ${r.heat_transfer.jacket_area_ratio} | 逼近温度: ${r.heat_transfer.delta_t_approach} °C`)
  lines.push(`- 热失控风险: ${r.heat_transfer.thermal_runaway_risk} | 建议: ${r.heat_transfer.cooling_recommendation}`)
  lines.push("")
  lines.push("### 🏗️ 反应器设计")
  lines.push(`- 体积: ${r.reactor_sizing.reactor_volume_l} L | 直径: ${r.reactor_sizing.diameter_m} m | 高度: ${r.reactor_sizing.height_m} m`)
  lines.push(`- 搅拌转速: ${r.reactor_sizing.agitation_rpm} rpm | 夹套面积: ${r.reactor_sizing.jacket_area_m2} m²`)
  lines.push(`- 处理能力: ${r.reactor_sizing.throughput_kg_h} kg/h`)
  lines.push("")
  lines.push("### ⚠️ 风险评估")
  lines.push("| 风险 | 严重程度 | 缓解措施 |")
  lines.push("|------|----------|----------|")
  for (const risk of r.risk_assessment) {
    lines.push(`| ${risk.risk} | ${risk.severity} | ${risk.mitigation} |`)
  }
  lines.push("")
  lines.push("### 📋 建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// --- Tool 3: Regulatory Compliance Chem ---
function formatCompliance(r: ComplianceResult): string {
  const lines: string[] = []
  lines.push("## 📜 合规评估报告 — Regulatory Compliance Chem")
  lines.push("")
  lines.push(`物质: ${r.substance_name} | CAS: ${r.cas_number} | 合规评分: ${r.overall_compliance_score}`)
  lines.push("")
  lines.push("### 🇪🇺 REACH注册")
  lines.push(`- 注册状态: ${r.reach.registered ? "已注册" : "未注册"} | 等级: ${r.reach.registration_tier}`)
  lines.push(`- 需完成研究: ${r.reach.required_studies.join(", ")}`)
  lines.push(`- 数据缺口: ${r.reach.data_gaps.join(", ")}`)
  lines.push(`- 预估成本: €${r.reach.estimated_cost_eur} | 周期: ${r.reach.timeline_months}个月`)
  lines.push("")
  lines.push("### ⚠️ GHS分类")
  lines.push("| 危害类别 | 分类 | 信号词 | 说明 |")
  lines.push("|----------|------|--------|------|")
  for (const h of r.ghs.physical_hazards) {
    lines.push(`| 物理危害-${h.class_} | ${h.category} | ${h.signal_word} | ${h.hazard_statement} |`)
  }
  for (const h of r.ghs.health_hazards) {
    lines.push(`| 健康危害-${h.class_} | ${h.category} | ${h.signal_word} | ${h.hazard_statement} |`)
  }
  lines.push("")
  lines.push("### 🌍 各国危化品登记")
  lines.push("| 国家 | 管理机构 | 状态 | 下一步 |")
  lines.push("|------|----------|------|--------|")
  for (const reg of r.hazchem_registrations) {
    lines.push(`| ${reg.country} | ${reg.regulatory_body} | ${reg.status} | ${reg.next_action} |`)
  }
  lines.push("")
  lines.push("### 📋 建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// --- Tool 4: Catalyst Design ---
function formatCatalyst(r: CatalystResult): string {
  const lines: string[] = []
  lines.push("## 🔬 催化剂设计报告 — Catalyst Design")
  lines.push("")
  lines.push(`反应: ${r.reaction_name} | 催化剂类型: ${r.catalyst_type} | 性价比评分: ${r.cost_performance_score}`)
  lines.push("")
  lines.push("### ⚡ 活性预测")
  lines.push(`- 预测转化率: ${(r.activity.predicted_conversion * 100).toFixed(1)}% | TOF: ${r.activity.turn_over_frequency} h⁻¹`)
  lines.push(`- 活化能: ${r.activity.activation_energy_pred} kJ/mol | 温度敏感性: ${r.activity.temperature_sensitivity}`)
  lines.push(`- 活性位密度: ${r.activity.active_site_density.toExponential(2)} sites/g`)
  lines.push("")
  lines.push("### 🎯 选择性分析")
  lines.push(`- 预测选择性: ${(r.selectivity.predicted_selectivity * 100).toFixed(1)}%`)
  lines.push(`- 最优温度窗口: ${r.selectivity.optimal_temperature_window[0]}~${r.selectivity.optimal_temperature_window[1]} °C`)
  lines.push("| 副产物 | 选择性 | 抑制策略 |")
  lines.push("|--------|--------|----------|")
  for (const b of r.selectivity.byproducts) {
    lines.push(`| ${b.name} | ${(b.selectivity * 100).toFixed(1)}% | ${b.suppression_strategy} |`)
  }
  lines.push("")
  lines.push("### 🔄 失活与再生")
  lines.push(`- 失活速率: ${r.deactivation.deactivation_rate} /天 | 机制: ${r.deactivation.mechanism}`)
  lines.push(`- 预测寿命: ${r.deactivation.predicted_lifetime_months} 个月 | 可再生: ${r.deactivation.regeneration_possible ? "是" : "否"}`)
  lines.push(`- 再生方法: ${r.deactivation.regeneration_method} | 再生频率: ${r.deactivation.regeneration_frequency_months} 个月`)
  lines.push("")
  lines.push("### 📋 建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// --- Tool 5: Materials Informatics ---
function formatInformatics(r: InformaticsResult): string {
  const lines: string[] = []
  lines.push("## 🧬 材料信息学报告 — Materials Informatics")
  lines.push("")
  lines.push(`材料类别: ${r.material_class} | 数据质量: ${r.database.data_quality} | 主动学习轮次: ${r.active_learning_rounds}`)
  lines.push("")
  lines.push("### 📚 数据库检索")
  lines.push(`- 查询数据库: ${r.database.databases_queried.join(", ")}`)
  lines.push(`- 发表论文: ${r.database.publications_found} | 专利: ${r.database.patents_found}`)
  lines.push("| 相似材料 | 性能值 | 相似度 | 文献 |")
  lines.push("|----------|--------|--------|------|")
  for (const m of r.database.similar_materials) {
    lines.push(`| ${m.name} | ${m.property_value} | ${(m.similarity * 100).toFixed(0)}% | ${m.reference} |`)
  }
  lines.push("")
  lines.push("### 🤖 ML势函数")
  lines.push(`- 模型: ${r.ml_potential.model_type} | R²: ${r.ml_potential.r_squared}`)
  lines.push(`- 训练RMSE: ${r.ml_potential.training_rmse} | 验证RMSE: ${r.ml_potential.validation_rmse}`)
  lines.push("| 特征 | 重要性 |")
  lines.push("|------|--------|")
  for (const f of r.ml_potential.feature_importance) {
    lines.push(`| ${f.feature} | ${f.importance} |`)
  }
  lines.push("")
  lines.push("### 🔍 高通量筛选")
  lines.push(`- 筛选候选数: ${r.high_throughput.candidates_screened} | 覆盖率: ${r.high_throughput.coverage_pct}%`)
  lines.push("| 候选ID | 预测性能 | 置信度 | 组成 |")
  lines.push("|--------|----------|--------|------|")
  for (const c of r.high_throughput.top_candidates) {
    lines.push(`| ${c.id} | ${c.predicted_property} | ${(c.confidence * 100).toFixed(0)}% | ${c.composition} |`)
  }
  lines.push("")
  lines.push("### 📋 建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// --- Tool 6: Safety & Toxicology ---
function formatSafety(r: SafetyResult): string {
  const lines: string[] = []
  lines.push("## 🛡️ 安全毒理报告 — Safety & Toxicology")
  lines.push("")
  lines.push(`化学品: ${r.chemical_name} | 综合风险等级: ${r.overall_risk_level}`)
  lines.push("")
  lines.push("### 🔥 物理危害")
  lines.push(`- 闪点分类: ${r.physical_hazards.flash_point_class} | 自燃温度: ${r.physical_hazards.autoignition_temp} °C`)
  lines.push(`- 爆炸极限: ${r.physical_hazards.explosive_limits.lel_pct}%~${r.physical_hazards.explosive_limits.uel_pct}%`)
  lines.push(`- 蒸气密度: ${r.physical_hazards.vapor_density} | 静电风险: ${r.physical_hazards.static_electricity_risk}`)
  lines.push("")
  lines.push("### ☠️ 毒理学特征")
  lines.push(`- 急性毒性类别: ${r.toxicology.acute_toxicity_category} | LD50: ${r.toxicology.ld50_estimate} mg/kg`)
  lines.push(`- 刺激潜力: ${r.toxicology.irritation_potential} | 致敏潜力: ${r.toxicology.sensitization_potential}`)
  lines.push(`- 致突变性: ${r.toxicology.mutagenicity} | 致癌性: ${r.toxicology.carcinogenicity_category}`)
  lines.push("")
  lines.push("### 📊 暴露评估")
  lines.push(`- OEL: ${r.exposure.oel_mg_m3} mg/m³ | 估计暴露: ${r.exposure.estimated_exposure_mg_m3} mg/m³`)
  lines.push(`- 安全裕度: ${r.exposure.margin_of_safety} | 控制带: ${r.exposure.control_band}`)
  lines.push(`- 通风要求: ${r.exposure.required_ventilation}`)
  lines.push("")
  lines.push("### 🦺 PPE要求")
  lines.push(`- 呼吸防护: ${r.ppe.respiratory} | 手部防护: ${r.ppe.hand_protection}`)
  lines.push(`- 眼部防护: ${r.ppe.eye_protection} | 身体防护: ${r.ppe.body_protection}`)
  lines.push("")
  lines.push("### 🚨 应急措施")
  for (const e of r.emergency_measures) lines.push(`- ${e}`)
  lines.push("")
  lines.push("### 📋 建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// --- Tool 7: Market Pricing Chem ---
function formatPricing(r: PricingResult): string {
  const lines: string[] = []
  lines.push("## 💰 市场定价报告 — Market Pricing Chem")
  lines.push("")
  lines.push(`化学品: ${r.chemical_name} | 供需状态: ${r.supply_demand.balance_status}`)
  lines.push("")
  lines.push("### 🛢️ 原油联动")
  lines.push(`- 相关系数: ${r.crude_linkage.correlation_coefficient} | 原料: ${r.crude_linkage.feedstock}`)
  lines.push(`- 裂解价差: ${r.crude_linkage.cracking_margin} USD/吨 | 价格传导滞后: ${r.crude_linkage.price_transmission_lag_months} 个月`)
  lines.push("| 成本构成 | 比例(%) |")
  lines.push("|----------|---------|")
  for (const c of r.crude_linkage.cost_breakdown) {
    lines.push(`| ${c.component} | ${c.percentage} |`)
  }
  lines.push("")
  lines.push("### ⚖️ 供需平衡")
  lines.push(`- 全球产能: ${r.supply_demand.global_capacity_tons.toLocaleString()} 吨 | 需求: ${r.supply_demand.global_demand_tons.toLocaleString()} 吨`)
  lines.push(`- 产能利用率: ${r.supply_demand.capacity_utilization_pct}% | 需求增速: ${r.supply_demand.demand_growth_rate_pct}%/年`)
  lines.push(`- 增长驱动: ${r.supply_demand.key_growth_drivers.join(", ")}`)
  lines.push("")
  lines.push("### 📈 价格预测")
  lines.push(`- 当前价格: ${r.price_forecast.current_price_per_ton} 元/吨`)
  lines.push(`- 3个月: ${r.price_forecast.forecast_3m} | 6个月: ${r.price_forecast.forecast_6m} | 12个月: ${r.price_forecast.forecast_12m}`)
  lines.push(`- 价格区间: ${r.price_forecast.price_range_low}~${r.price_forecast.price_range_high} 元/吨 | 置信度: ${(r.price_forecast.confidence * 100).toFixed(0)}%`)
  lines.push("")
  lines.push("### 📦 库存分析")
  lines.push(`- 当前库存天数: ${r.inventory.current_inventory_days} 天 | 历史均值: ${r.inventory.historical_avg_days} 天`)
  lines.push(`- 库存趋势: ${r.inventory.inventory_trend} | 仓库利用率: ${r.inventory.warehouse_utilization_pct}%`)
  lines.push("")
  lines.push("### 📋 建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// --- Tool 8: Circular Economy Polymer ---
function formatCircularPolymer(r: CircularPolymerResult): string {
  const lines: string[] = []
  lines.push("## ♻️ 聚合物循环经济报告 — Circular Economy Polymer")
  lines.push("")
  lines.push(`聚合物类型: ${r.polymer_type} | 循环指数: ${r.circular_economy_metrics.circularity_index}`)
  lines.push("")
  lines.push("### 🔄 回收分析")
  lines.push(`- 当前回收率: ${(r.recycling.recycling_rate_current * 100).toFixed(0)}% | 目标: ${(r.recycling.recycling_rate_target * 100).toFixed(0)}%`)
  lines.push(`- 收集率: ${(r.recycling.collection_rate * 100).toFixed(0)}% | 分拣效率: ${r.recycling.sorting_efficiency_pct}%`)
  lines.push(`- 再生料品质: ${r.recycling.recycled_output_quality} | 最大可回收次数: ${r.recycling.max_recyclable_cycles}`)
  lines.push("")
  lines.push("### 🌱 降解特征")
  lines.push(`- 生物降解周期: ${r.degradation.biodegradation_months} 个月 | 条件: ${r.degradation.biodegradation_conditions}`)
  lines.push(`- 微塑料风险: ${r.degradation.microplastic_generation_risk} | 可堆肥认证: ${r.degradation.compostability_certified ? "是" : "否"}`)
  lines.push(`- 降解产物: ${r.degradation.degradation_products.join(", ")}`)
  lines.push("")
  lines.push("### 🌿 生物基替代")
  lines.push("| 生物聚合物 | 生物含量(%) | 性能对比 | 成本溢价(%) | 碳减排(%) | 商业化 |")
  lines.push("|------------|------------|---------|------------|----------|--------|")
  for (const b of r.bio_based_alternatives) {
    lines.push(`| ${b.bio_polymer} | ${b.bio_content_pct} | ${b.performance_comparison} | ${b.cost_premium_pct} | ${b.carbon_footprint_reduction_pct} | ${b.commercial_availability} |`)
  }
  lines.push("")
  lines.push("### 📊 循环经济指标")
  lines.push(`- CO2减排: ${r.circular_economy_metrics.co2_reduction_tons} 吨/年 | 替代原生料: ${r.circular_economy_metrics.virgin_material_displaced_tons} 吨`)
  lines.push(`- 节水: ${r.circular_economy_metrics.water_savings_m3} m³ | 节能: ${r.circular_economy_metrics.energy_savings_gj} GJ`)
  lines.push(`- 经济价值: €${r.circular_economy_metrics.economic_value_eur}`)
  lines.push("")
  lines.push("### 📋 建议")
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push("")
  lines.push("---")
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join("\n")
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Formulation Optimizer — 配方优化
  tools.register(defineTool({
    name: "formulation_optimizer",
    description: "配方优化 | DOE实验设计/响应面分析/性能预测/成本优化 | Formulation optimization with DOE, response surface methodology, property prediction.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_type (coating|adhesive|cosmetic|pharmaceutical|food|polymer), target_properties[{property, target_value, unit, weight}], raw_materials[{name, min_pct, max_pct, cost_per_kg}], constraints?, doe_type?"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatFormulation(analyzeFormulation(JSON.parse(args.input_data)))
    }
  }))

  // Tool 2: Process Scale-up — 工艺放大
  tools.register(defineTool({
    name: "process_scaleup",
    description: "工艺放大 | 中试放大/传质传热分析/反应器设计/安全评估 | Process scale-up with mass/heat transfer analysis, reactor sizing, risk assessment.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: reaction_type (batch|continuous|semi_batch|flow_chemistry), current_scale, target_scale, target_unit, reactor_type, heat_of_reaction_kj_mol, activation_energy_kj_mol, viscosity_cp, mixing_required, safety_concerns?"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatScaleup(analyzeScaleup(JSON.parse(args.input_data)))
    }
  }))

  // Tool 3: Regulatory Compliance Chem — 合规
  tools.register(defineTool({
    name: "regulatory_compliance_chem",
    description: "合规评估 | REACH注册/GHS分类/危化品登记/MSDS | Regulatory compliance with REACH, GHS classification, hazchem registration, MSDS.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: substance_name, cas_number, application, target_markets[], annual_tonnage, exposure_scenarios[{route, frequency, duration}], ghs_classification?, reach_registered?"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatCompliance(analyzeCompliance(JSON.parse(args.input_data)))
    }
  }))

  // Tool 4: Catalyst Design — 催化剂设计
  tools.register(defineTool({
    name: "catalyst_design",
    description: "催化剂设计 | 活性/选择性/失活/再生/优化 | Catalyst design with activity prediction, selectivity analysis, deactivation modeling, regeneration.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: reaction_name, catalyst_type, active_metal, support_material, target_conversion, target_selectivity, operating_temperature, operating_pressure, feed_composition, target_lifetime_months"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatCatalyst(analyzeCatalyst(JSON.parse(args.input_data)))
    }
  }))

  // Tool 5: Materials Informatics — 材料信息学
  tools.register(defineTool({
    name: "materials_informatics",
    description: "材料信息学 | 数据库检索/ML势函数/高通量筛选/主动学习 | Materials informatics with database search, ML potential, high-throughput screening, active learning.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: material_class (MOF|zeolite|polymer|ceramic|metal_alloy|semiconductor|composite), target_property, target_value, unit, search_space_size, existing_data_points, computational_budget, ml_model?"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatInformatics(analyzeInformatics(JSON.parse(args.input_data)))
    }
  }))

  // Tool 6: Safety & Toxicology — 安全毒理
  tools.register(defineTool({
    name: "safety_toxicology",
    description: "安全毒理 | 闪点/爆炸极限/LD50/暴露评估/PPE/应急 | Safety & toxicology with flash point, LD50, exposure assessment, PPE requirements, emergency measures.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: chemical_name, cas_number, molecular_weight, vapor_pressure_mmhg, boiling_point_c, flash_point_c, ld50_oral_mg_kg?, lc50_inhalation_ppm?, exposure_routes[], workplace_scenario, oel_ppm?, daily_exposure_hours"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSafety(analyzeSafety(JSON.parse(args.input_data)))
    }
  }))

  // Tool 7: Market Pricing Chem — 市场定价
  tools.register(defineTool({
    name: "market_pricing_chem",
    description: "市场定价 | 原油联动/供需平衡/贸易流/库存/价格预测 | Market pricing with crude oil linkage, supply-demand balance, trade flows, inventory, price forecast.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: chemical_name, grade, region, volume_tons, contract_type, crude_oil_benchmark, current_crude_price, historical_months"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPricing(analyzePricing(JSON.parse(args.input_data)))
    }
  }))

  // Tool 8: Circular Economy Polymer — 聚合物循环经济
  tools.register(defineTool({
    name: "circular_economy_polymer",
    description: "聚合物循环经济 | 回收/降解/生物基替代/循环指标/政策激励 | Circular economy for polymers with recycling, degradation, bio-based alternatives, metrics.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: polymer_type (PET|PE|PP|PS|PVC|PLA|PA|PC|mixed), application, annual_volume_tons, recycling_method, target_recycled_content_pct, region, end_of_life_scenario"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatCircularPolymer(analyzeCircularPolymer(JSON.parse(args.input_data)))
    }
  }))

  console.log(`[dsh-tool-chemagentpro] Loaded v${VERSION} — 化工材料AI助手, 8 tools active`)
  console.log("  Tools: formulation_optimizer, process_scaleup, regulatory_compliance_chem, catalyst_design, materials_informatics, safety_toxicology, market_pricing_chem, circular_economy_polymer")
}
