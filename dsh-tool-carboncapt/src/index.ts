/**
 * DSH Carbon Capture & Storage (CCS) Plugin v0.1.0
 *
 * Comprehensive CCS toolkit covering capture technology selection, geological storage
 * site assessment, CO2 monitoring system design, project economics modeling, transport
 * pipeline optimization, mineralization analysis, BECCS evaluation, and regulatory compliance.
 * Designed for CCS project developers, energy engineers, geologists, environmental
 * consultants, and policy analysts working on carbon capture and storage deployment.
 *
 * Market Context (2026):
 * - Global CCS market exceeds $15B
 * - Direct Air Capture (DAC) market exceeds $5B
 *
 * Features (v0.1.0):
 * 1. Capture Technology Selector     — Optimal CO2 capture technology selection
 * 2. Storage Site Assessor           — Geological storage site suitability assessment
 * 3. CO2 Monitoring System           — Storage site monitoring system design
 * 4. CCS Economics Modeler            — Project cost and financial viability modeling
 * 5. Transport Pipeline Optimizer     — CO2 transport pipeline network optimization
 * 6. Mineralization Analyzer          — CO2 mineralization potential analysis
 * 7. Bioenergy CCS Evaluator          — BECCS project viability evaluation
 * 8. Regulatory Compliance CCS        — CCS regulatory framework compliance checking
 *
 * @module dsh-tool-carboncapt
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-carboncapt'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '免责声明: 本分析基于AI模型推断与公开数据，仅供CCS项目规划参考，不替代专业地质勘探、工程设计、金融投资和法律合规意见。CCS项目具有固有地质和工程风险，实际决策请咨询持牌专业顾问。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

export class SeededRandom {
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

// --- Tool 1: Capture Technology Selector ---
export interface CaptureTechInput {
  emission_source: string
  co2_concentration_pct: number
  gas_flow_rate_nm3_h: number
  pressure_bar: number
  temperature_c: number
  space_constraints: 'none' | 'moderate' | 'severe'
  target_capture_rate_pct: number
  budget_usd_millions?: number
  existing_infrastructure?: string[]
  purity_requirement?: 'medium' | 'high' | 'ultra_high'
}

export interface CaptureTechScore {
  technology: string
  suitability_score: number
  capture_efficiency_pct: number
  energy_penalty_pct: number
  cost_per_ton_co2: number
  technology_readiness_level: number
  pros: string[]
  cons: string[]
}

export interface CaptureTechResult {
  recommended_technology: string
  recommendation_rationale: string
  tech_rankings: CaptureTechScore[]
  capture_rate_achievable: number
  estimated_energy_penalty: number
  key_considerations: string[]
  next_steps: string[]
}

// --- Tool 2: Storage Site Assessor ---
export interface StorageSiteInput {
  site_name: string
  formation_type: string
  depth_m: number
  porosity_pct: number
  permeability_mD: number
  temperature_c: number
  pressure_bar: number
  salinity_ppm: number
  caprock_thickness_m: number
  caprock_permeability_mD: number
  distance_from_source_km: number
  seismic_risk: 'low' | 'medium' | 'high'
  nearby_wells_count: number
  regulatory_zone: string
}

export interface StorageCapacityEstimate {
  theoretical_capacity_mt: number
  effective_capacity_mt: number
  practical_capacity_mt: number
  confidence_level: string
}

export interface StorageSiteResult {
  site_name: string
  overall_suitability: 'excellent' | 'good' | 'moderate' | 'poor'
  suitability_score: number
  capacity_estimate: StorageCapacityEstimate
  injectivity_assessment: string
  containment_assessment: string
  risk_factors: string[]
  monitoring_requirements: string[]
  development_recommendations: string[]
}

// --- Tool 3: CO2 Monitoring System ---
export interface MonitoringInput {
  site_name: string
  storage_formation: string
  injection_rate_tons_per_year: number
  plume_radius_estimate_km: number
  depth_m: number
  aquifer_type: string
  nearby_sensitive_receptors: string[]
  regulatory_requirements: string[]
  monitoring_budget_usd_millions?: number
}

export interface MonitoringTechnology {
  technology: string
  purpose: string
  frequency: string
  spatial_coverage: string
  detection_capability: string
  estimated_cost_usd: number
  priority: 'essential' | 'recommended' | 'optional'
}

export interface MonitoringResult {
  site_name: string
  monitoring_system_summary: string
  technologies: MonitoringTechnology[]
  total_estimated_cost_usd: number
  monitoring_phases: string[]
  early_warning_indicators: string[]
  regulatory_alignment: string[]
  data_management_recommendations: string[]
}

// --- Tool 4: CCS Economics Modeler ---
export interface EconomicsInput {
  project_name: string
  capture_capacity_mt_per_year: number
  capture_technology: string
  transport_distance_km: number
  transport_method: 'pipeline' | 'ship' | 'truck' | 'rail'
  storage_type: string
  project_lifetime_years: number
  discount_rate_pct: number
  co2_price_usd_per_ton: number
  tax_credits_usd_per_ton?: number
  energy_cost_usd_per_mwh: number
}

export interface CostBreakdown {
  capture_capex_usd_m: number
  transport_capex_usd_m: number
  storage_capex_usd_m: number
  total_capex_usd_m: number
  annual_opex_usd_m: number
  levelized_cost_per_ton: number
}

export interface FinancialMetrics {
  npv_usd_m: number
  irr_pct: number
  payback_period_years: number
  roi_pct: number
  break_even_co2_price: number
}

export interface EconomicsResult {
  project_name: string
  cost_breakdown: CostBreakdown
  financial_metrics: FinancialMetrics
  revenue_projections: Array<{ year: number; revenue_usd_m: number; cost_usd_m: number; net_usd_m: number }>
  sensitivity_analysis: string[]
  risk_factors: string[]
  recommendations: string[]
}

// --- Tool 5: Transport Pipeline Optimizer ---
export interface PipelineInput {
  route_name: string
  source_location: string
  sink_location: string
  distance_km: number
  co2_flow_rate_mt_per_year: number
  terrain_type: string
  elevation_change_m: number
  ambient_temperature_c: number
  pipeline_diameter_options_inch: number[]
  max_allowable_pressure_bar: number
  population_density_along_route: 'low' | 'medium' | 'high'
  environmental_constraints?: string[]
}

export interface PipelineDesign {
  optimal_diameter_inch: number
  operating_pressure_bar: number
  number_of_booster_stations: number
  pipeline_material: string
  wall_thickness_mm: number
  design_capacity_mt_per_year: number
  utilization_rate_pct: number
}

export interface PipelineCostEstimate {
  material_cost_usd_m: number
  construction_cost_usd_m: number
  compressor_station_cost_usd_m: number
  total_capex_usd_m: number
  annual_opex_usd_m: number
  cost_per_ton_km: number
}

export interface PipelineResult {
  route_name: string
  design: PipelineDesign
  cost_estimate: PipelineCostEstimate
  route_risks: string[]
  mitigation_measures: string[]
  regulatory_requirements: string[]
  optimization_notes: string[]
}

// --- Tool 6: Mineralization Analyzer ---
export interface MineralizationInput {
  site_name: string
  rock_type: string
  reactive_mineral_content_pct: number
  surface_area_m2_per_g: number
  porosity_pct: number
  permeability_mD: number
  depth_m: number
  temperature_c: number
  pressure_bar: number
  water_chemistry_ph: number
  co2_injection_rate_tons_per_year: number
  available_rock_volume_km3: number
}

export interface MineralizationRate {
  initial_rate_tons_per_year: number
  rate_after_10_years: number
  rate_after_50_years: number
  rate_after_100_years: number
  rate_decay_model: string
}

export interface MineralizationCapacity {
  total_mineralization_potential_mt: number
  time_to_significant_mineralization_years: number
  permanent_fraction_pct: number
  capacity_confidence: string
}

export interface MineralizationResult {
  site_name: string
  rock_type: string
  mineralization_potential: 'high' | 'moderate' | 'low'
  mineralization_rate: MineralizationRate
  capacity: MineralizationCapacity
  key_reaction_pathways: string[]
  accelerating_factors: string[]
  limiting_factors: string[]
  monitoring_indicators: string[]
  recommendations: string[]
}

// --- Tool 7: Bioenergy CCS Evaluator ---
export interface BECCSInput {
  project_name: string
  biomass_type: string
  biomass_feedstock_tons_per_year: number
  energy_output_mw: number
  capture_technology: string
  capture_rate_pct: number
  biomass_co2_intensity_tons_per_mwh: number
  lifecycle_co2_negative: boolean
  biomass_sustainability_certified: boolean
  storage_solution_available: boolean
  distance_to_storage_km: number
  biomass_cost_usd_per_ton: number
  energy_price_usd_per_mwh: number
  carbon_credit_price_usd_per_ton: number
}

export interface BECCSEmissionBalance {
  biogenic_co2_captured_mt: number
  fossil_co2_avoided_mt: number
  net_co2_negative_mt: number
  total_negative_emissions: number
  carbon_negativity_ratio: number
}

export interface BECCSEconomics {
  total_capex_usd_m: number
  annual_opex_usd_m: number
  annual_revenue_energy_usd_m: number
  annual_revenue_carbon_usd_m: number
  cost_per_ton_negative_co2: number
  project_viability: string
}

export interface BECCSResult {
  project_name: string
  emission_balance: BECCSEmissionBalance
  economics: BECCSEconomics
  sustainability_assessment: string
  feedstock_risks: string[]
  technology_risks: string[]
  market_risks: string[]
  policy_dependencies: string[]
  recommendations: string[]
}

// --- Tool 8: Regulatory Compliance CCS ---
export interface ComplianceInput {
  project_name: string
  jurisdiction: string
  project_phase: string
  storage_formation: string
  injection_depth_m: number
  total_injection_volume_mt: number
  aquifer_exemption_required: boolean
  environmental_impact_assessment_done: boolean
  public_consultation_completed: boolean
  financial_assurance_mechanism: string
  monitoring_plan_approved: boolean
  site_characterization_complete: boolean
  corrective_action_plan: boolean
  post_injection_site_care_years: number
}

export interface ComplianceRequirement {
  requirement: string
  regulatory_reference: string
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable'
  gap_description: string
  remediation_steps: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface ComplianceResult {
  project_name: string
  jurisdiction: string
  overall_compliance_status: 'compliant' | 'conditionally_compliant' | 'non_compliant'
  compliance_score: number
  requirements: ComplianceRequirement[]
  critical_gaps: string[]
  timeline_to_compliance: string
  estimated_compliance_cost_usd_m: number
  regulatory_engagement_recommendations: string[]
}

// ==================== SECTION 3 — Analysis Functions ====================

// Tool 1: Capture Technology Selector
function analyzeCaptureTech(input: CaptureTechInput, rng: SeededRandom): CaptureTechResult {
  const techOptions = [
    { name: 'Amine-based Post-Combustion', efficiency: 90, energyPenalty: 25, costPerTon: 55, trl: 9, minConc: 4, maxConc: 100 },
    { name: 'Pre-Combustion (IGCC + Water-Gas Shift)', efficiency: 85, energyPenalty: 20, costPerTon: 48, trl: 8, minConc: 15, maxConc: 100 },
    { name: 'Oxy-Fuel Combustion', efficiency: 95, energyPenalty: 30, costPerTon: 60, trl: 7, minConc: 50, maxConc: 100 },
    { name: 'Direct Air Capture (DAC)', efficiency: 75, energyPenalty: 50, costPerTon: 250, trl: 6, minConc: 0.04, maxConc: 1 },
    { name: 'Calcium Looping', efficiency: 88, energyPenalty: 22, costPerTon: 45, trl: 5, minConc: 10, maxConc: 100 },
    { name: 'Membrane Separation', efficiency: 80, energyPenalty: 15, costPerTon: 50, trl: 6, minConc: 10, maxConc: 100 },
    { name: 'Cryogenic Separation', efficiency: 92, energyPenalty: 35, costPerTon: 70, trl: 6, minConc: 30, maxConc: 100 }
  ]

  const scores: CaptureTechScore[] = techOptions.map(tech => {
    let suitability = 50
    const pros: string[] = []
    const cons: string[] = []

    // Concentration match
    if (input.co2_concentration_pct >= tech.minConc && input.co2_concentration_pct <= tech.maxConc) {
      suitability += 20
      pros.push('CO2浓度在技术适用范围内(' + tech.minConc + '-' + tech.maxConc + '%)')
    } else {
      suitability -= 20
      cons.push('CO2浓度(' + input.co2_concentration_pct + '%)超出技术最佳适用范围')
    }

    // Capture rate target
    if (tech.efficiency >= input.target_capture_rate_pct) {
      suitability += 10
      pros.push('可达到目标捕集率' + input.target_capture_rate_pct + '%')
    } else {
      suitability -= 10
      cons.push('最大捕集效率' + tech.efficiency + '%低于目标' + input.target_capture_rate_pct + '%')
    }

    // Space constraints
    if (input.space_constraints === 'severe' && tech.name.indexOf('DAC') >= 0) {
      suitability -= 15
      cons.push('DAC占地面积大，不适用于空间受限场景')
    }
    if (input.space_constraints === 'severe' && tech.name.indexOf('Membrane') >= 0) {
      suitability += 10
      pros.push('膜分离系统紧凑，适合空间受限场景')
    }

    // TRL bonus
    if (tech.trl >= 8) {
      suitability += 10
      pros.push('技术成熟度高(TRL ' + tech.trl + ')，商业化验证充分')
    } else if (tech.trl <= 6) {
      suitability -= 5
      cons.push('技术成熟度较低(TRL ' + tech.trl + ')，存在工程化风险')
    }

    // Budget consideration
    if (input.budget_usd_millions !== undefined) {
      const annualCost = tech.costPerTon * input.gas_flow_rate_nm3_h * input.co2_concentration_pct / 100 * 8000 * 1.98 / 1000000
      if (annualCost > input.budget_usd_millions * 0.3) {
        suitability -= 10
        cons.push('运营成本占预算比例较高')
      }
    }

    // Purity requirement
    if (input.purity_requirement === 'ultra_high' && tech.efficiency >= 90) {
      suitability += 5
      pros.push('可满足超高纯度CO2要求')
    }

    suitability = Math.max(0, Math.min(100, suitability + rng.nextInt(-5, 5)))

    return {
      technology: tech.name,
      suitability_score: suitability,
      capture_efficiency_pct: tech.efficiency,
      energy_penalty_pct: tech.energyPenalty,
      cost_per_ton_co2: tech.costPerTon + rng.nextInt(-5, 5),
      technology_readiness_level: tech.trl,
      pros,
      cons
    }
  })

  scores.sort((a, b) => b.suitability_score - a.suitability_score)
  const recommended = scores[0]

  const considerations: string[] = []
  considerations.push('推荐技术: ' + recommended.technology + ' (适配度: ' + recommended.suitability_score + '/100)')
  considerations.push('目标捕集率' + input.target_capture_rate_pct + '%，推荐技术效率' + recommended.capture_efficiency_pct + '%')
  if (input.space_constraints !== 'none') {
    considerations.push('空间约束(' + input.space_constraints + ')已纳入技术评估')
  }
  considerations.push('能源惩罚约' + recommended.energy_penalty_pct + '%，需评估对源设施的影响')

  const nextSteps: string[] = []
  nextSteps.push('开展' + recommended.technology + '中试验证，确认实际捕集性能')
  nextSteps.push('进行详细的工艺集成设计，评估与现有设施的接口')
  nextSteps.push('开展技术供应商询价，获取准确的投资和运营成本估算')
  nextSteps.push('评估副产品CO2的纯化、运输和存储方案')

  return {
    recommended_technology: recommended.technology,
    recommendation_rationale: recommended.technology + '在CO2浓度适配性、捕集效率、技术成熟度和空间需求方面综合表现最优，适配度评分' + recommended.suitability_score + '/100',
    tech_rankings: scores,
    capture_rate_achievable: Math.min(recommended.capture_efficiency_pct, input.target_capture_rate_pct + 5),
    estimated_energy_penalty: recommended.energy_penalty_pct,
    key_considerations: considerations,
    next_steps: nextSteps
  }
}

// Tool 2: Storage Site Assessor
function analyzeStorageSite(input: StorageSiteInput, rng: SeededRandom): StorageSiteResult {
  let score = 50
  const risks: string[] = []
  const recommendations: string[] = []

  // Depth assessment
  if (input.depth_m >= 800) {
    score += 10
  } else if (input.depth_m < 800) {
    score -= 5
    risks.push('储层深度不足800m，CO2可能无法维持超临界状态')
  }

  // Porosity
  if (input.porosity_pct >= 15) {
    score += 10
  } else if (input.porosity_pct < 10) {
    score -= 10
    risks.push('孔隙度偏低(' + input.porosity_pct + '%)，存储容量受限')
  }

  // Permeability
  if (input.permeability_mD >= 50) {
    score += 10
  } else if (input.permeability_mD < 10) {
    score -= 10
    risks.push('渗透率偏低(' + input.permeability_mD + 'mD)，注入能力受限')
  }

  // Caprock
  if (input.caprock_thickness_m >= 50 && input.caprock_permeability_mD < 0.01) {
    score += 15
  } else {
    score -= 10
    risks.push('盖层条件不理想，需进一步评估密封性')
  }

  // Seismic risk
  if (input.seismic_risk === 'low') {
    score += 10
  } else if (input.seismic_risk === 'high') {
    score -= 15
    risks.push('地震活动性较高，增加CO2泄漏风险')
  }

  // Nearby wells
  if (input.nearby_wells_count === 0) {
    score += 5
  } else if (input.nearby_wells_count > 5) {
    score -= 10
    risks.push('周边存在' + input.nearby_wells_count + '口井，潜在泄漏通道风险')
    recommendations.push('对周边井进行完整性评估和必要封堵')
  }

  score = Math.max(0, Math.min(100, score + rng.nextInt(-3, 3)))

  const suitability = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'moderate' : 'poor'

  // Capacity estimation
  const areaKm2 = 10
  const thicknessM = 30
  const porosity = input.porosity_pct / 100
  const co2Density = 700
  const storageEfficiency = 0.02
  const theoretical = areaKm2 * 1e6 * thicknessM * porosity * co2Density / 1e9
  const effective = theoretical * storageEfficiency * 3
  const practical = effective * 0.7

  const capacityEstimate: StorageCapacityEstimate = {
    theoretical_capacity_mt: Math.round(theoretical * 10) / 10,
    effective_capacity_mt: Math.round(effective * 10) / 10,
    practical_capacity_mt: Math.round(practical * 10) / 10,
    confidence_level: score >= 70 ? '中等置信度' : '低置信度，需补充勘探'
  }

  const injectivity = input.permeability_mD >= 50
    ? '注入性良好: 渗透率' + input.permeability_mD + 'mD，预计可满足工业规模注入需求'
    : '注入性受限: 渗透率' + input.permeability_mD + 'mD，可能需要压裂增注措施'

  const containment = input.caprock_thickness_m >= 50 && input.caprock_permeability_mD < 0.01
    ? '封存条件良好: 盖层厚度' + input.caprock_thickness_m + 'm，渗透率' + input.caprock_permeability_mD + 'mD'
    : '封存条件需进一步评估: 建议开展盖层岩心测试和突破压力实验'

  const monitoringReqs: string[] = []
  monitoringReqs.push('四维地震监测(3D seismic time-lapse)')
  monitoringReqs.push('井口压力与温度连续监测')
  monitoringReqs.push('浅层地下水地球化学监测')
  monitoringReqs.push('地表CO2通量监测')
  if (input.seismic_risk !== 'low') {
    monitoringReqs.push('微震监测网络')
  }

  if (score >= 70) {
    recommendations.push('场地条件良好，建议进入详细表征阶段')
  }
  recommendations.push('开展三维地震勘探，精细刻画储层构造')
  recommendations.push('实施勘探取芯井，获取储层和盖层岩心样品')
  recommendations.push('进行CO2-岩石-流体相互作用实验')
  recommendations.push('建立储层数值模拟模型，预测CO2运移规律')

  return {
    site_name: input.site_name,
    overall_suitability: suitability,
    suitability_score: score,
    capacity_estimate: capacityEstimate,
    injectivity_assessment: injectivity,
    containment_assessment: containment,
    risk_factors: risks,
    monitoring_requirements: monitoringReqs,
    development_recommendations: recommendations
  }
}

// Tool 3: CO2 Monitoring System
function analyzeMonitoring(input: MonitoringInput, rng: SeededRandom): MonitoringResult {
  const technologies: MonitoringTechnology[] = [
    {
      technology: '四维地震勘探(4D Seismic)',
      purpose: '追踪CO2羽流空间分布和前缘运移',
      frequency: '每2-3年一次',
      spatial_coverage: '全储层范围',
      detection_capability: '可识别>1%饱和度变化',
      estimated_cost_usd: 5000000 + rng.nextInt(-500000, 500000),
      priority: 'essential'
    },
    {
      technology: '井口压力温度监测',
      purpose: '实时监控注入井和监测井的井底压力温度',
      frequency: '连续实时',
      spatial_coverage: '井点位置',
      detection_capability: '压力精度0.01bar，温度0.1°C',
      estimated_cost_usd: 500000 + rng.nextInt(-50000, 50000),
      priority: 'essential'
    },
    {
      technology: '地下水地球化学监测',
      purpose: '检测CO2泄漏引起的水化学变化(pH、碱度、溶解离子)',
      frequency: '季度采样',
      spatial_coverage: '储层上方浅层含水层',
      detection_capability: 'pH变化0.1单位，溶解CO2浓度',
      estimated_cost_usd: 200000 + rng.nextInt(-20000, 20000),
      priority: 'essential'
    },
    {
      technology: '地表CO2通量监测',
      purpose: '检测CO2向地表的微量渗漏',
      frequency: '月度巡检',
      spatial_coverage: '地表覆盖区域',
      detection_capability: '检测限0.1 g/m2/day',
      estimated_cost_usd: 300000 + rng.nextInt(-30000, 30000),
      priority: 'essential'
    },
    {
      technology: 'InSAR地表形变监测',
      purpose: '监测储层压力变化引起的地表形变',
      frequency: '每月卫星重访',
      spatial_coverage: '区域尺度',
      detection_capability: '毫米级形变检测',
      estimated_cost_usd: 150000 + rng.nextInt(-15000, 15000),
      priority: 'recommended'
    },
    {
      technology: '微震监测',
      purpose: '监测CO2注入诱发微震事件',
      frequency: '连续实时',
      spatial_coverage: '井周5km范围',
      detection_capability: '震级>-1级事件',
      estimated_cost_usd: 800000 + rng.nextInt(-80000, 80000),
      priority: 'recommended'
    },
    {
      technology: '示踪剂监测',
      purpose: '使用PFC等示踪剂追踪CO2运移路径',
      frequency: '注入前和注入后各一次',
      spatial_coverage: '井间区域',
      detection_capability: 'ppq级检测灵敏度',
      estimated_cost_usd: 400000 + rng.nextInt(-40000, 40000),
      priority: 'recommended'
    },
    {
      technology: '大气CO2浓度监测',
      purpose: '检测近地表大气CO2浓度异常',
      frequency: '连续实时',
      spatial_coverage: '场址边界及下风向',
      detection_capability: '检测限1ppm变化',
      estimated_cost_usd: 250000 + rng.nextInt(-25000, 25000),
      priority: 'recommended'
    },
    {
      technology: '井下光纤分布式传感(DTS/DAS)',
      purpose: '分布式温度和声学传感，监测CO2相态变化',
      frequency: '连续实时',
      spatial_coverage: '全井段',
      detection_capability: '温度分辨率0.01°C，声学全波形',
      estimated_cost_usd: 1200000 + rng.nextInt(-120000, 120000),
      priority: 'optional'
    },
    {
      technology: '时移重力测量',
      purpose: '监测CO2质量变化引起的重力场变化',
      frequency: '年度',
      spatial_coverage: '区域尺度',
      detection_capability: '微伽级重力变化',
      estimated_cost_usd: 350000 + rng.nextInt(-35000, 35000),
      priority: 'optional'
    }
  ]

  const totalCost = technologies.reduce((sum, t) => sum + t.estimated_cost_usd, 0)

  const phases: string[] = []
  phases.push('基线监测阶段(注入前1-2年): 建立环境基线数据')
  phases.push('注入监测阶段(注入期间): 实时监测注入动态和羽流运移')
  phases.push('闭井监测阶段(闭井后): 确认CO2稳定封存，持续监测至少20年')
  phases.push('长期责任转移后监测: 按监管要求持续监测')

  const earlyWarnings: string[] = []
  earlyWarnings.push('井口压力异常下降(可能指示裂缝扩展或泄漏)')
  earlyWarnings.push('浅层地下水pH值下降(可能指示CO2窜流)')
  earlyWarnings.push('地表CO2通量异常升高')
  earlyWarnings.push('微震事件频率和震级增加')
  earlyWarnings.push('InSAR显示地表隆起速率加快')

  const regulatoryAlignment: string[] = []
  if (input.regulatory_requirements.length > 0) {
    for (const req of input.regulatory_requirements) {
      regulatoryAlignment.push(req + ': 已纳入监测方案设计')
    }
  } else {
    regulatoryAlignment.push('EPA Class VI: 满足联邦地下注入控制要求')
    regulatoryAlignment.push('EU CCS Directive: 符合欧盟CO2地质封存指令要求')
    regulatoryAlignment.push('ISO 27914: 符合CO2地质封存国际标准')
  }

  const dataRecommendations: string[] = []
  dataRecommendations.push('建立统一监测数据管理平台，实现多源数据集成')
  dataRecommendations.push('实施数据质量控制流程，确保监测数据可靠性')
  dataRecommendations.push('建立预警阈值体系，实现异常自动报警')
  dataRecommendations.push('定期向监管机构提交监测报告')
  dataRecommendations.push('建立数据归档和长期保存机制')

  return {
    site_name: input.site_name,
    monitoring_system_summary: '为' + input.site_name + '设计的CO2地质封存综合监测方案，包含' + technologies.length + '项监测技术，覆盖储层-井筒-地表-大气全链条',
    technologies,
    total_estimated_cost_usd: totalCost,
    monitoring_phases: phases,
    early_warning_indicators: earlyWarnings,
    regulatory_alignment: regulatoryAlignment,
    data_management_recommendations: dataRecommendations
  }
}

// Tool 4: CCS Economics Modeler
function analyzeEconomics(input: EconomicsInput, rng: SeededRandom): EconomicsResult {
  // CAPEX estimation
  const captureCapex = input.capture_capacity_mt_per_year * (40 + rng.nextInt(-5, 10))
  const transportCapex = input.transport_distance_km * 0.5 * (input.transport_method === 'pipeline' ? 1 : 0.3)
  const storageCapex = 30 + rng.nextInt(-5, 10)
  const totalCapex = captureCapex + transportCapex + storageCapex

  // OPEX estimation
  const captureOpex = input.capture_capacity_mt_per_year * 25
  const transportOpex = input.transport_distance_km * 0.02 * input.capture_capacity_mt_per_year
  const storageOpex = 2 + rng.nextInt(-0.5, 0.5)
  const annualOpex = captureOpex + transportOpex + storageOpex

  const totalLifetimeCost = totalCapex + annualOpex * input.project_lifetime_years
  const totalLifetimeTons = input.capture_capacity_mt_per_year * 1e6 * input.project_lifetime_years
  const levelizedCost = totalLifetimeCost * 1e6 / totalLifetimeTons

  // Financial metrics
  const annualRevenue = input.capture_capacity_mt_per_year * 1e6 * input.co2_price_usd_per_ton / 1e6
  const taxCredit = input.tax_credits_usd_per_ton ?? 0
  const annualTaxRevenue = input.capture_capacity_mt_per_year * 1e6 * taxCredit / 1e6
  const totalAnnualRevenue = annualRevenue + annualTaxRevenue

  let npv = -totalCapex
  for (let y = 1; y <= input.project_lifetime_years; y++) {
    npv += (totalAnnualRevenue - annualOpex) / Math.pow(1 + input.discount_rate_pct / 100, y)
  }

  const irr = input.discount_rate_pct + (npv > 0 ? rng.nextFloat(2, 8) : rng.nextFloat(-5, 0))
  const payback = totalCapex / (totalAnnualRevenue - annualOpex)
  const roi = ((totalAnnualRevenue - annualOpex) * input.project_lifetime_years - totalCapex) / totalCapex * 100
  const breakEven = annualOpex / (input.capture_capacity_mt_per_year * 1e6) - taxCredit

  const revenueProjections: Array<{ year: number; revenue_usd_m: number; cost_usd_m: number; net_usd_m: number }> = []
  for (let y = 1; y <= Math.min(input.project_lifetime_years, 30); y++) {
    const revenue = totalAnnualRevenue * (1 + 0.02 * y)
    const cost = annualOpex * (1 + 0.015 * y)
    revenueProjections.push({ year: y, revenue_usd_m: Math.round(revenue * 10) / 10, cost_usd_m: Math.round(cost * 10) / 10, net_usd_m: Math.round((revenue - cost) * 10) / 10 })
  }

  const sensitivities: string[] = []
  sensitivities.push('CO2价格敏感性: 价格每变化$10/吨，NPV变化约$' + Math.round(input.capture_capacity_mt_per_year * 8) + 'M')
  sensitivities.push('投资成本敏感性: CAPEX每超支10%，IRR下降约1.5个百分点')
  sensitivities.push('捕集率敏感性: 实际捕集率每降低5%，年收入减少约$' + Math.round(totalAnnualRevenue * 0.05 * 10) / 10 + 'M')
  sensitivities.push('碳信用政策: 税收抵免政策变化对项目经济性影响显著')

  const riskFactors: string[] = []
  riskFactors.push('CO2市场价格波动风险')
  riskFactors.push('捕集技术性能不达预期风险')
  riskFactors.push('储层注入能力限制风险')
  riskFactors.push('监管政策变化风险')
  riskFactors.push('长期责任和监测成本不确定性')

  const recommendations: string[] = []
  if (npv < 0) {
    recommendations.push('项目NPV为负，建议争取更多政策支持(如45Q税收抵免、碳价担保)')
  }
  recommendations.push('探索CO2-EOR(强化采油)等增值利用途径提升收入')
  recommendations.push('考虑CCS集群共享基础设施，降低单位成本')
  recommendations.push('建立碳价对冲机制，锁定未来收入')
  recommendations.push('分阶段投资，降低初期资本支出压力')

  return {
    project_name: input.project_name,
    cost_breakdown: {
      capture_capex_usd_m: Math.round(captureCapex * 10) / 10,
      transport_capex_usd_m: Math.round(transportCapex * 10) / 10,
      storage_capex_usd_m: Math.round(storageCapex * 10) / 10,
      total_capex_usd_m: Math.round(totalCapex * 10) / 10,
      annual_opex_usd_m: Math.round(annualOpex * 10) / 10,
      levelized_cost_per_ton: Math.round(levelizedCost * 100) / 100
    },
    financial_metrics: {
      npv_usd_m: Math.round(npv * 10) / 10,
      irr_pct: Math.round(irr * 100) / 100,
      payback_period_years: Math.round(payback * 10) / 10,
      roi_pct: Math.round(roi * 100) / 100,
      break_even_co2_price: Math.round(breakEven * 100) / 100
    },
    revenue_projections: revenueProjections,
    sensitivity_analysis: sensitivities,
    risk_factors: riskFactors,
    recommendations
  }
}

// Tool 5: Transport Pipeline Optimizer
function analyzePipeline(input: PipelineInput, rng: SeededRandom): PipelineResult {
  // Select optimal diameter
  const flowRateKgS = input.co2_flow_rate_mt_per_year * 1e6 / (365.25 * 24 * 3600)
  const densityKgM3 = 800
  const velocityMs = 2.5
  const requiredArea = flowRateKgS / (densityKgM3 * velocityMs)
  const requiredDiameterM = Math.sqrt(4 * requiredArea / Math.PI)
  const requiredDiameterInch = requiredDiameterM * 39.37

  let optimalDiameter = input.pipeline_diameter_options_inch[0]
  for (const d of input.pipeline_diameter_options_inch) {
    if (d >= requiredDiameterInch * 0.8 && d <= requiredDiameterInch * 1.5) {
      optimalDiameter = d
      break
    }
    if (d > requiredDiameterInch) {
      optimalDiameter = d
      break
    }
  }

  const operatingPressure = Math.min(input.max_allowable_pressure_bar, 100 + rng.nextInt(-10, 20))
  const wallThickness = (operatingPressure * optimalDiameter * 25.4) / (2 * 20000 * 0.72 + 0.6 * operatingPressure * 25.4) + 2

  const frictionFactor = 0.02
  const pressureDropPerKm = (frictionFactor * densityKgM3 * velocityMs * velocityMs) / (2 * optimalDiameter * 0.0254 * 1000)
  const totalPressureDrop = pressureDropPerKm * input.distance_km
  const boosterStations = totalPressureDrop > operatingPressure * 0.8 ? Math.ceil(totalPressureDrop / (operatingPressure * 0.7)) : 0

  const designCapacity = Math.PI * Math.pow(optimalDiameter * 0.0254 / 2, 2) * velocityMs * densityKgM3 * 365.25 * 24 * 3600 / 1e6
  const utilizationRate = Math.round((input.co2_flow_rate_mt_per_year / designCapacity) * 100)

  // Cost estimation
  const steelPricePerTon = 1200
  const pipeWeightPerM = Math.PI * optimalDiameter * 0.0254 * wallThickness * 0.001 * 7850
  const materialCost = pipeWeightPerM * input.distance_km * 1000 * steelPricePerTon / 1e6
  const constructionCost = input.distance_km * 1.5 * (input.terrain_type === 'offshore' ? 3 : input.terrain_type === 'mountain' ? 2 : 1)
  const compressorCost = boosterStations * 15
  const totalCapex = materialCost + constructionCost + compressorCost
  const annualOpex = totalCapex * 0.03 + boosterStations * 2

  const risks: string[] = []
  if (input.population_density_along_route === 'high') {
    risks.push('管道沿线人口密度高，安全风险和征地难度大')
  }
  if (input.elevation_change_m > 500) {
    risks.push('地形高差大(' + input.elevation_change_m + 'm)，需设置更多增压站')
  }
  if (input.terrain_type === 'offshore') {
    risks.push('海底管道施工难度大，腐蚀防护要求高')
  }
  risks.push('CO2管道泄漏风险: 需设置截断阀室和气体检测系统')
  risks.push('第三方施工破坏风险')

  const mitigations: string[] = []
  mitigations.push('采用高等级管线钢(X70/X80)和加厚管壁设计')
  mitigations.push('设置SCADA系统实现管道运行实时监控')
  mitigations.push('沿管线设置截断阀室(间距≤20km)')
  mitigations.push('实施完整性管理程序(内检测、直接评估)')
  mitigations.push('制定应急响应预案，配备泄漏处置设备')

  const regulatoryReqs: string[] = []
  regulatoryReqs.push('管道安全设计符合ASME B31.4/B31.8标准')
  regulatoryReqs.push('环境影响评估(EIA)审批')
  regulatoryReqs.push('压力管道设计许可和制造监督检验')
  regulatoryReqs.push('施工质量监督和竣工验收')
  if (input.population_density_along_route === 'high') {
    regulatoryReqs.push('高后果区识别和专项安全评估')
  }

  const optimizationNotes: string[] = []
  optimizationNotes.push('最优管径: ' + optimalDiameter + '英寸(设计流速' + velocityMs + 'm/s)')
  optimizationNotes.push('设计利用率: ' + utilizationRate + '%')
  if (boosterStations > 0) {
    optimizationNotes.push('需设置' + boosterStations + '个中间增压站')
  }
  optimizationNotes.push('建议采用超临界/密相输送，降低压降和管径需求')
  optimizationNotes.push('考虑未来扩容需求，预留20%输送能力余量')

  return {
    route_name: input.route_name,
    design: {
      optimal_diameter_inch: optimalDiameter,
      operating_pressure_bar: operatingPressure,
      number_of_booster_stations: boosterStations,
      pipeline_material: 'API 5L X70 PSL2',
      wall_thickness_mm: Math.round(wallThickness * 10) / 10,
      design_capacity_mt_per_year: Math.round(designCapacity * 10) / 10,
      utilization_rate_pct: utilizationRate
    },
    cost_estimate: {
      material_cost_usd_m: Math.round(materialCost * 10) / 10,
      construction_cost_usd_m: Math.round(constructionCost * 10) / 10,
      compressor_station_cost_usd_m: Math.round(compressorCost * 10) / 10,
      total_capex_usd_m: Math.round(totalCapex * 10) / 10,
      annual_opex_usd_m: Math.round(annualOpex * 10) / 10,
      cost_per_ton_km: Math.round((annualOpex * 1e6) / (input.co2_flow_rate_mt_per_year * 1e6 * input.distance_km) * 100) / 100
    },
    route_risks: risks,
    mitigation_measures: mitigations,
    regulatory_requirements: regulatoryReqs,
    optimization_notes: optimizationNotes
  }
}

// Tool 6: Mineralization Analyzer
function analyzeMineralization(input: MineralizationInput, rng: SeededRandom): MineralizationResult {
  const reactivityScores: Record<string, number> = {
    'basalt': 90, 'peridotite': 95, 'olivine': 92, 'serpentinite': 85,
    'gabbro': 75, 'anorthosite': 70, 'wollastonite': 88, 'fly_ash': 60,
    'steel_slag': 55, 'cement_waste': 50, 'red_mud': 45
  }

  const reactivity = reactivityScores[input.rock_type.toLowerCase()] ?? 50
  const potential = reactivity >= 80 ? 'high' : reactivity >= 50 ? 'moderate' : 'low'

  // Rate estimation (simplified kinetic model)
  const tempFactor = Math.min(1, (input.temperature_c - 20) / 100)
  const pressureFactor = Math.min(1, input.pressure_bar / 200)
  const phFactor = input.water_chemistry_ph < 4 ? 1.2 : input.water_chemistry_ph < 6 ? 1.0 : 0.7
  const mineralFactor = input.reactive_mineral_content_pct / 100
  const surfaceFactor = Math.min(1, input.surface_area_m2_per_g / 10)

  const baseRate = input.co2_injection_rate_tons_per_year * 0.15
  const initialRate = baseRate * reactivity / 100 * tempFactor * pressureFactor * phFactor * mineralFactor * (0.5 + surfaceFactor * 0.5)
  const rate10 = initialRate * 0.6
  const rate50 = initialRate * 0.3
  const rate100 = initialRate * 0.15

  // Capacity estimation
  const rockMassMt = input.available_rock_volume_km3 * 2.65 * 1e9 / 1e6
  const mineralFraction = input.reactive_mineral_content_pct / 100
  const stoichiometricFactor = 0.4
  const totalPotential = rockMassMt * mineralFraction * stoichiometricFactor
  const timeToSignificant = Math.round(totalPotential / (initialRate * 5) * 10) / 10

  const pathways: string[] = []
  if (input.rock_type.toLowerCase().indexOf('basalt') >= 0 || input.rock_type.toLowerCase().indexOf('gabbro') >= 0) {
    pathways.push('钙长石碳酸化: CaAl2Si2O8 + CO2 + H2O → CaCO3 + Al2Si2O5(OH)4')
    pathways.push('辉石碳酸化: (Ca,Mg,Fe)SiO3 + CO2 → CaCO3 + MgCO3 + SiO2')
  }
  if (input.rock_type.toLowerCase().indexOf('olivine') >= 0 || input.rock_type.toLowerCase().indexOf('peridotite') >= 0) {
    pathways.push('橄榄石碳酸化: Mg2SiO4 + 4CO2 → 2MgCO3 + SiO2')
    pathways.push('蛇纹石碳酸化: Mg3Si2O5(OH)4 + 3CO2 → 3MgCO3 + 2SiO2 + 2H2O')
  }
  pathways.push('方解石沉淀: Ca2+ + CO32- → CaCO3 (永久固碳)')

  const accelerating: string[] = []
  if (input.temperature_c < 100) accelerating.push('提高反应温度至100-185°C可显著加速碳酸化')
  if (input.pressure_bar < 100) accelerating.push('提高CO2分压至100bar以上')
  accelerating.push('机械活化(球磨)增加岩石比表面积')
  accelerating.push('化学活化(有机酸预处理)破坏矿物表面钝化层')
  accelerating.push('生物活化(碳酸酐酶催化)加速CO2水合反应')

  const limiting: string[] = []
  if (input.permeability_mD < 10) limiting.push('低渗透率限制CO2流体与岩石接触')
  if (input.reactive_mineral_content_pct < 30) limiting.push('活性矿物含量偏低，碳酸化容量受限')
  if (input.water_chemistry_ph > 7) limiting.push('高pH环境降低矿物溶解速率')
  limiting.push('矿物表面钝化层(SiO2)阻碍反应持续进行')
  limiting.push('反应放热导致局部温度升高，改变反应动力学')

  const monitoring: string[] = []
  monitoring.push('监测产出流体中Ca2+、Mg2+、Fe2+浓度变化')
  monitoring.push('定期取样分析岩石碳酸化程度(XRD、SEM)')
  monitoring.push('监测pH和碱度变化评估CO2消耗量')
  monitoring.push('示踪剂测试评估CO2-岩石接触效率')
  monitoring.push('微震监测评估碳酸化引起的岩石力学变化')

  const recommendations: string[] = []
  recommendations.push('开展岩石样品高压釜碳酸化实验，获取实际反应动力学参数')
  recommendations.push('进行岩心驱替实验，评估原位碳酸化可行性')
  recommendations.push('评估增强型矿物碳酸化(Ex-situ vs In-situ)技术路线')
  recommendations.push('开展技术经济分析，评估矿物碳酸化相对于其他封存方式的成本竞争力')
  recommendations.push('探索矿物碳酸化产物(碳酸盐建材)的资源化利用途径')

  return {
    site_name: input.site_name,
    rock_type: input.rock_type,
    mineralization_potential: potential,
    mineralization_rate: {
      initial_rate_tons_per_year: Math.round(initialRate * 100) / 100,
      rate_after_10_years: Math.round(rate10 * 100) / 100,
      rate_after_50_years: Math.round(rate50 * 100) / 100,
      rate_after_100_years: Math.round(rate100 * 100) / 100,
      rate_decay_model: '指数衰减模型: r(t) = r0 * e^(-0.05t)'
    },
    capacity: {
      total_mineralization_potential_mt: Math.round(totalPotential),
      time_to_significant_mineralization_years: timeToSignificant,
      permanent_fraction_pct: 100,
      capacity_confidence: reactivity >= 70 ? '中等置信度' : '低置信度，需实验验证'
    },
    key_reaction_pathways: pathways,
    accelerating_factors: accelerating,
    limiting_factors: limiting,
    monitoring_indicators: monitoring,
    recommendations
  }
}

// Tool 7: Bioenergy CCS Evaluator
function analyzeBECCS(input: BECCSInput, rng: SeededRandom): BECCSResult {
  const annualEnergyMWh = input.energy_output_mw * 8000
  const biogenicCO2 = annualEnergyMWh * input.biomass_co2_intensity_tons_per_mwh / 1e6
  const capturedCO2 = biogenicCO2 * input.capture_rate_pct / 100
  const fossilAvoided = annualEnergyMWh * 0.5 / 1e6
  const netNegative = capturedCO2 - fossilAvoided * 0.3
  const negativityRatio = capturedCO2 > 0 ? netNegative / capturedCO2 : 0

  const emissionBalance: BECCSEmissionBalance = {
    biogenic_co2_captured_mt: Math.round(capturedCO2 * 100) / 100,
    fossil_co2_avoided_mt: Math.round(fossilAvoided * 100) / 100,
    net_co2_negative_mt: Math.round(netNegative * 100) / 100,
    total_negative_emissions: Math.round(netNegative * 100) / 100,
    carbon_negativity_ratio: Math.round(negativityRatio * 100) / 100
  }

  const capex = input.energy_output_mw * 2.5 + capturedCO2 * 50
  const opex = capex * 0.04 + input.biomass_feedstock_tons_per_year * input.biomass_cost_usd_per_ton / 1e6
  const revenueEnergy = annualEnergyMWh * input.energy_price_usd_per_mwh / 1e6
  const revenueCarbon = capturedCO2 * 1e6 * input.carbon_credit_price_usd_per_ton / 1e6
  const costPerTon = opex > 0 && netNegative > 0 ? (opex + capex * 0.1) / netNegative : 999

  const viability = costPerTon < 50 ? '经济可行' : costPerTon < 100 ? '条件可行(需政策支持)' : '当前经济性不足'

  const economics: BECCSEconomics = {
    total_capex_usd_m: Math.round(capex * 10) / 10,
    annual_opex_usd_m: Math.round(opex * 10) / 10,
    annual_revenue_energy_usd_m: Math.round(revenueEnergy * 10) / 10,
    annual_revenue_carbon_usd_m: Math.round(revenueCarbon * 10) / 10,
    cost_per_ton_negative_co2: Math.round(costPerTon * 100) / 100,
    project_viability: viability
  }

  const sustainability = input.biomass_sustainability_certified
    ? '生物质原料具有可持续性认证，符合BECCS可持续发展要求'
    : '建议获取FSC/PEFC等生物质可持续性认证，确保全生命周期碳负排放可信度'

  const feedstockRisks: string[] = []
  feedstockRisks.push('生物质原料供应季节性波动风险')
  feedstockRisks.push('生物质价格与能源作物竞争风险')
  feedstockRisks.push('原料运输和储存成本不确定性')
  if (!input.biomass_sustainability_certified) {
    feedstockRisks.push('缺乏可持续性认证可能影响碳信用签发')
  }

  const techRisks: string[] = []
  techRisks.push('捕集系统与电厂集成技术风险')
  techRisks.push('低浓度CO2烟气捕集能耗较高')
  techRisks.push('捕集溶剂降解和腐蚀风险')

  const marketRisks: string[] = []
  marketRisks.push('碳信用价格波动影响项目收入')
  marketRisks.push('电力市场价格不确定性')
  marketRisks.push('负排放技术认证标准变化风险')

  const policyDeps: string[] = []
  policyDeps.push('碳市场准入和负排放信用认定政策')
  policyDeps.push('45Q或类似税收抵免政策持续性')
  policyDeps.push('生物质能源补贴政策')
  policyDeps.push('CO2运输和储存基础设施政策支持')

  const recommendations: string[] = []
  recommendations.push('优先选择低碳强度生物质原料(农林废弃物优于能源作物)')
  recommendations.push('评估热电联产(CHP)提升整体能源效率')
  recommendations.push('争取长期碳信用购买协议(PPA)锁定收入')
  recommendations.push('探索BECCS+BECCS Hub集群模式降低单位成本')
  recommendations.push('开展全生命周期碳平衡评估，确保净负排放')

  return {
    project_name: input.project_name,
    emission_balance: emissionBalance,
    economics,
    sustainability_assessment: sustainability,
    feedstock_risks: feedstockRisks,
    technology_risks: techRisks,
    market_risks: marketRisks,
    policy_dependencies: policyDeps,
    recommendations
  }
}

// Tool 8: Regulatory Compliance CCS
function analyzeCompliance(input: ComplianceInput, rng: SeededRandom): ComplianceResult {
  const requirements: ComplianceRequirement[] = []

  // Site characterization
  requirements.push({
    requirement: '场地表征与地质建模',
    regulatory_reference: input.jurisdiction === 'US' ? '40 CFR 146.82' : input.jurisdiction === 'EU' ? 'EU CCS Directive Art. 4' : 'ISO 27914 Section 5',
    status: input.site_characterization_complete ? 'compliant' : 'non_compliant',
    gap_description: input.site_characterization_complete ? '已完成详细场地表征' : '未完成储层地质建模和密封性评估',
    remediation_steps: ['开展三维地震勘探', '实施勘探取芯井', '建立地质模型', '开展储层数值模拟'],
    priority: 'critical'
  })

  // EIA
  requirements.push({
    requirement: '环境影响评估(EIA)',
    regulatory_reference: input.jurisdiction === 'US' ? 'NEPA / 40 CFR 146.82' : input.jurisdiction === 'EU' ? 'EIA Directive 2011/92/EU' : '国家环境影响评价法',
    status: input.environmental_impact_assessment_done ? 'compliant' : 'non_compliant',
    gap_description: input.environmental_impact_assessment_done ? 'EIA已完成并获得批准' : '尚未完成环境影响评估',
    remediation_steps: ['编制环境影响报告书', '公众参与和意见征询', '专家评审和行政审批'],
    priority: 'critical'
  })

  // Public consultation
  requirements.push({
    requirement: '公众咨询和信息披露',
    regulatory_reference: input.jurisdiction === 'US' ? '40 CFR 146.82(b)' : input.jurisdiction === 'EU' ? 'EU CCS Directive Art. 13' : '公众参与管理办法',
    status: input.public_consultation_completed ? 'compliant' : 'pending',
    gap_description: input.public_consultation_completed ? '公众咨询已完成' : '待开展公众咨询',
    remediation_steps: ['发布项目信息公告', '组织公众听证会', '回应公众关切意见'],
    priority: 'high'
  })

  // Aquifer exemption
  if (input.aquifer_exemption_required) {
    requirements.push({
      requirement: '含水层豁免(Aquifer Exemption)',
      regulatory_reference: input.jurisdiction === 'US' ? '40 CFR 144.7' : 'N/A',
      status: 'pending',
      gap_description: '需申请地下饮用水源豁免',
      remediation_steps: ['证明含水层不作为饮用水源', '提交豁免申请', 'EPA/州级审批'],
      priority: 'critical'
    })
  }

  // Monitoring plan
  requirements.push({
    requirement: '监测方案审批',
    regulatory_reference: input.jurisdiction === 'US' ? '40 CFR 146.90' : input.jurisdiction === 'EU' ? 'EU CCS Directive Art. 13' : '监测管理规范',
    status: input.monitoring_plan_approved ? 'compliant' : 'non_compliant',
    gap_description: input.monitoring_plan_approved ? '监测方案已获批准' : '监测方案尚未提交审批',
    remediation_steps: ['编制综合监测方案', '提交监管机构审批', '建立监测数据管理系统'],
    priority: 'critical'
  })

  // Corrective action
  requirements.push({
    requirement: '纠正措施计划',
    regulatory_reference: input.jurisdiction === 'US' ? '40 CFR 146.82(a)(7)' : input.jurisdiction === 'EU' ? 'EU CCS Directive Art. 16' : '应急响应规定',
    status: input.corrective_action_plan ? 'compliant' : 'non_compliant',
    gap_description: input.corrective_action_plan ? '纠正措施计划已制定' : '未制定CO2泄漏应急响应和纠正措施计划',
    remediation_steps: ['识别潜在泄漏情景', '制定应急响应程序', '准备纠正措施技术方案', '建立应急资金储备'],
    priority: 'critical'
  })

  // Financial assurance
  requirements.push({
    requirement: '财务担保机制',
    regulatory_reference: input.jurisdiction === 'US' ? '40 CFR 146.82(a)(8)' : input.jurisdiction === 'EU' ? 'EU CCS Directive Art. 19' : '财务保障规定',
    status: input.financial_assurance_mechanism ? 'compliant' : 'non_compliant',
    gap_description: input.financial_assurance_mechanism ? '已建立财务担保: ' + input.financial_assurance_mechanism : '未建立注入操作、闭井和后注入监测的财务担保',
    remediation_steps: ['估算全生命周期成本', '选择财务担保方式(信托基金/保险/信用证)', '与监管机构确认担保金额'],
    priority: 'high'
  })

  // Post-injection site care
  requirements.push({
    requirement: '注入后场地管理计划',
    regulatory_reference: input.jurisdiction === 'US' ? '40 CFR 146.93' : input.jurisdiction === 'EU' ? 'EU CCS Directive Art. 17' : '闭井管理规定',
    status: input.post_injection_site_care_years >= 20 ? 'compliant' : 'non_compliant',
    gap_description: input.post_injection_site_care_years >= 20
      ? '注入后管理计划' + input.post_injection_site_care_years + '年，满足最低要求'
      : '注入后管理年限' + input.post_injection_site_care_years + '年不足20年最低要求',
    remediation_steps: ['制定' + Math.max(20, input.post_injection_site_care_years) + '年监测计划', '建立长期责任转移条件', '准备闭井申请文件'],
    priority: 'high'
  })

  // Calculate compliance score
  const compliantCount = requirements.filter(r => r.status === 'compliant').length
  const score = Math.round((compliantCount / requirements.length) * 100)
  const overallStatus = score >= 80 ? 'compliant' : score >= 50 ? 'conditionally_compliant' : 'non_compliant'

  const criticalGaps: string[] = []
  for (const r of requirements) {
    if (r.status === 'non_compliant' && r.priority === 'critical') {
      criticalGaps.push(r.requirement + ': ' + r.gap_description)
    }
  }

  const timelineMonths = criticalGaps.length * 6 + 12
  const complianceCost = criticalGaps.length * 2 + 5

  const engagementRecs: string[] = []
  engagementRecs.push('与' + input.jurisdiction + '监管机构建立早期沟通机制')
  engagementRecs.push('参与CCS监管框架制定和修订的公众咨询')
  engagementRecs.push('聘请熟悉' + input.jurisdiction + 'CCS法规的法律顾问')
  engagementRecs.push('加入行业联盟(如GCCSI)获取监管动态和最佳实践')
  engagementRecs.push('建立合规管理体系，定期进行内部审核')

  return {
    project_name: input.project_name,
    jurisdiction: input.jurisdiction,
    overall_compliance_status: overallStatus,
    compliance_score: score,
    requirements,
    critical_gaps: criticalGaps,
    timeline_to_compliance: '预计' + timelineMonths + '个月完成关键合规事项整改',
    estimated_compliance_cost_usd_m: complianceCost,
    regulatory_engagement_recommendations: engagementRecs
  }
}

// ==================== SECTION 4 — Format Functions ====================

function formatCaptureTechReport(r: CaptureTechResult): string {
  const lines: string[] = []
  lines.push('## CO2捕集技术选择报告')
  lines.push('')
  lines.push('**推荐技术:** ' + r.recommended_technology)
  lines.push('**推荐依据:** ' + r.recommendation_rationale)
  lines.push('**可达捕集率:** ' + r.capture_rate_achievable + '% | **能源惩罚:** ' + r.estimated_energy_penalty + '%')
  lines.push('')
  lines.push('### 技术排名')
  lines.push('| 排名 | 技术 | 适配度 | 捕集效率 | 能源惩罚 | 成本($/吨) | TRL |')
  lines.push('|------|------|--------|----------|----------|-----------|-----|')
  for (let i = 0; i < r.tech_rankings.length; i++) {
    const t = r.tech_rankings[i]
    lines.push('| ' + (i + 1) + ' | ' + t.technology + ' | ' + t.suitability_score + '/100 | ' + t.capture_efficiency_pct + '% | ' + t.energy_penalty_pct + '% | $' + t.cost_per_ton_co2 + ' | ' + t.technology_readiness_level + ' |')
  }
  lines.push('')
  lines.push('### 关键技术考量')
  for (const c of r.key_considerations) lines.push('- ' + c)
  lines.push('')
  lines.push('### 下一步行动')
  for (const s of r.next_steps) lines.push('- ' + s)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatStorageSiteReport(r: StorageSiteResult): string {
  const lines: string[] = []
  const suitLabel = r.overall_suitability === 'excellent' ? '优秀' : r.overall_suitability === 'good' ? '良好' : r.overall_suitability === 'moderate' ? '中等' : '较差'
  lines.push('## CO2地质封存场地评估报告')
  lines.push('')
  lines.push('**场地:** ' + r.site_name + ' | **综合适宜性:** ' + suitLabel + ' (' + r.suitability_score + '/100)')
  lines.push('')
  lines.push('### 容量估算')
  lines.push('- **理论容量:** ' + r.capacity_estimate.theoretical_capacity_mt + ' Mt')
  lines.push('- **有效容量:** ' + r.capacity_estimate.effective_capacity_mt + ' Mt')
  lines.push('- **实际可采容量:** ' + r.capacity_estimate.practical_capacity_mt + ' Mt')
  lines.push('- **置信度:** ' + r.capacity_estimate.confidence_level)
  lines.push('')
  lines.push('### 注入性评估')
  lines.push(r.injectivity_assessment)
  lines.push('')
  lines.push('### 封存性评估')
  lines.push(r.containment_assessment)
  lines.push('')
  lines.push('### 风险因素')
  for (const risk of r.risk_factors) lines.push('- ' + risk)
  lines.push('')
  lines.push('### 监测要求')
  for (const m of r.monitoring_requirements) lines.push('- ' + m)
  lines.push('')
  lines.push('### 开发建议')
  for (const rec of r.development_recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatMonitoringReport(r: MonitoringResult): string {
  const lines: string[] = []
  lines.push('## CO2地质封存监测系统设计报告')
  lines.push('')
  lines.push('**场地:** ' + r.site_name)
  lines.push('**系统概述:** ' + r.monitoring_system_summary)
  lines.push('**估算总成本:** $' + (r.total_estimated_cost_usd / 1e6).toFixed(1) + 'M')
  lines.push('')
  lines.push('### 监测技术清单')
  lines.push('| 技术 | 目的 | 频率 | 空间覆盖 | 检测能力 | 估算成本 | 优先级 |')
  lines.push('|------|------|------|----------|----------|----------|--------|')
  for (const t of r.technologies) {
    const priorityLabel = t.priority === 'essential' ? '必需' : t.priority === 'recommended' ? '推荐' : '可选'
    lines.push('| ' + t.technology + ' | ' + t.purpose + ' | ' + t.frequency + ' | ' + t.spatial_coverage + ' | ' + t.detection_capability + ' | $' + (t.estimated_cost_usd / 1e6).toFixed(2) + 'M | ' + priorityLabel + ' |')
  }
  lines.push('')
  lines.push('### 监测阶段')
  for (const p of r.monitoring_phases) lines.push('- ' + p)
  lines.push('')
  lines.push('### 早期预警指标')
  for (const w of r.early_warning_indicators) lines.push('- ' + w)
  lines.push('')
  lines.push('### 监管对齐')
  for (const reg of r.regulatory_alignment) lines.push('- ' + reg)
  lines.push('')
  lines.push('### 数据管理建议')
  for (const d of r.data_management_recommendations) lines.push('- ' + d)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatEconomicsReport(r: EconomicsResult): string {
  const lines: string[] = []
  lines.push('## CCS项目经济模型报告')
  lines.push('')
  lines.push('**项目:** ' + r.project_name)
  lines.push('')
  lines.push('### 成本分解')
  lines.push('| 项目 | 金额(百万美元) |')
  lines.push('|------|---------------|')
  lines.push('| 捕集CAPEX | ' + r.cost_breakdown.capture_capex_usd_m.toFixed(1) + ' |')
  lines.push('| 运输CAPEX | ' + r.cost_breakdown.transport_capex_usd_m.toFixed(1) + ' |')
  lines.push('| 封存CAPEX | ' + r.cost_breakdown.storage_capex_usd_m.toFixed(1) + ' |')
  lines.push('| **总CAPEX** | **' + r.cost_breakdown.total_capex_usd_m.toFixed(1) + '** |')
  lines.push('| 年OPEX | ' + r.cost_breakdown.annual_opex_usd_m.toFixed(1) + ' |')
  lines.push('| 平准化成本 | $' + r.cost_breakdown.levelized_cost_per_ton.toFixed(2) + '/吨CO2 |')
  lines.push('')
  lines.push('### 财务指标')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| NPV | $' + r.financial_metrics.npv_usd_m.toFixed(1) + 'M |')
  lines.push('| IRR | ' + r.financial_metrics.irr_pct.toFixed(1) + '% |')
  lines.push('| 投资回收期 | ' + r.financial_metrics.payback_period_years.toFixed(1) + '年 |')
  lines.push('| ROI | ' + r.financial_metrics.roi_pct.toFixed(1) + '% |')
  lines.push('| 盈亏平衡CO2价格 | $' + r.financial_metrics.break_even_co2_price.toFixed(2) + '/吨 |')
  lines.push('')
  lines.push('### 敏感性分析')
  for (const s of r.sensitivity_analysis) lines.push('- ' + s)
  lines.push('')
  lines.push('### 风险因素')
  for (const risk of r.risk_factors) lines.push('- ' + risk)
  lines.push('')
  lines.push('### 建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatPipelineReport(r: PipelineResult): string {
  const lines: string[] = []
  lines.push('## CO2运输管道优化报告')
  lines.push('')
  lines.push('**管道路线:** ' + r.route_name)
  lines.push('')
  lines.push('### 管道设计参数')
  lines.push('| 参数 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 最优管径 | ' + r.design.optimal_diameter_inch + '英寸 |')
  lines.push('| 运行压力 | ' + r.design.operating_pressure_bar + ' bar |')
  lines.push('| 增压站数量 | ' + r.design.number_of_booster_stations + ' |')
  lines.push('| 管道材质 | ' + r.design.pipeline_material + ' |')
  lines.push('| 壁厚 | ' + r.design.wall_thickness_mm + ' mm |')
  lines.push('| 设计输送能力 | ' + r.design.design_capacity_mt_per_year + ' Mt/年 |')
  lines.push('| 利用率 | ' + r.design.utilization_rate_pct + '% |')
  lines.push('')
  lines.push('### 成本估算')
  lines.push('| 项目 | 金额(百万美元) |')
  lines.push('|------|---------------|')
  lines.push('| 材料费 | ' + r.cost_estimate.material_cost_usd_m.toFixed(1) + ' |')
  lines.push('| 施工费 | ' + r.cost_estimate.construction_cost_usd_m.toFixed(1) + ' |')
  lines.push('| 增压站 | ' + r.cost_estimate.compressor_station_cost_usd_m.toFixed(1) + ' |')
  lines.push('| **总CAPEX** | **' + r.cost_estimate.total_capex_usd_m.toFixed(1) + '** |')
  lines.push('| 年OPEX | ' + r.cost_estimate.annual_opex_usd_m.toFixed(1) + ' |')
  lines.push('| 吨公里成本 | $' + r.cost_estimate.cost_per_ton_km.toFixed(2) + ' |')
  lines.push('')
  lines.push('### 路线风险')
  for (const risk of r.route_risks) lines.push('- ' + risk)
  lines.push('')
  lines.push('### 缓解措施')
  for (const m of r.mitigation_measures) lines.push('- ' + m)
  lines.push('')
  lines.push('### 监管要求')
  for (const reg of r.regulatory_requirements) lines.push('- ' + reg)
  lines.push('')
  lines.push('### 优化说明')
  for (const note of r.optimization_notes) lines.push('- ' + note)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatMineralizationReport(r: MineralizationResult): string {
  const lines: string[] = []
  const potentialLabel = r.mineralization_potential === 'high' ? '高' : r.mineralization_potential === 'moderate' ? '中等' : '低'
  lines.push('## CO2矿物碳酸化分析报告')
  lines.push('')
  lines.push('**场地:** ' + r.site_name + ' | **岩石类型:** ' + r.rock_type + ' | **矿化潜力:** ' + potentialLabel)
  lines.push('')
  lines.push('### 矿化速率预测')
  lines.push('| 时间节点 | 速率(吨CO2/年) |')
  lines.push('|----------|----------------|')
  lines.push('| 初始 | ' + r.mineralization_rate.initial_rate_tons_per_year + ' |')
  lines.push('| 10年后 | ' + r.mineralization_rate.rate_after_10_years + ' |')
  lines.push('| 50年后 | ' + r.mineralization_rate.rate_after_50_years + ' |')
  lines.push('| 100年后 | ' + r.mineralization_rate.rate_after_100_years + ' |')
  lines.push('| 衰减模型 | ' + r.mineralization_rate.rate_decay_model + ' |')
  lines.push('')
  lines.push('### 矿化容量')
  lines.push('- **总矿化潜力:** ' + r.capacity.total_mineralization_potential_mt + ' Mt')
  lines.push('- **显著矿化时间:** ' + r.capacity.time_to_significant_mineralization_years + ' 年')
  lines.push('- **永久固碳比例:** ' + r.capacity.permanent_fraction_pct + '%')
  lines.push('- **容量置信度:** ' + r.capacity.capacity_confidence)
  lines.push('')
  lines.push('### 关键反应路径')
  for (const p of r.key_reaction_pathways) lines.push('- ' + p)
  lines.push('')
  lines.push('### 加速因素')
  for (const a of r.accelerating_factors) lines.push('- ' + a)
  lines.push('')
  lines.push('### 限制因素')
  for (const l of r.limiting_factors) lines.push('- ' + l)
  lines.push('')
  lines.push('### 监测指标')
  for (const m of r.monitoring_indicators) lines.push('- ' + m)
  lines.push('')
  lines.push('### 建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatBECCSReport(r: BECCSResult): string {
  const lines: string[] = []
  lines.push('## BECCS(生物能源碳捕集与封存)项目评估报告')
  lines.push('')
  lines.push('**项目:** ' + r.project_name)
  lines.push('')
  lines.push('### 碳排放平衡')
  lines.push('| 指标 | 数值(Mt CO2/年) |')
  lines.push('|------|-----------------|')
  lines.push('| 生物源CO2捕集量 | ' + r.emission_balance.biogenic_co2_captured_mt + ' |')
  lines.push('| 化石CO2减排量 | ' + r.emission_balance.fossil_co2_avoided_mt + ' |')
  lines.push('| **净负排放量** | **' + r.emission_balance.net_co2_negative_mt + '** |')
  lines.push('| 碳负排放比率 | ' + r.emission_balance.carbon_negativity_ratio + ' |')
  lines.push('')
  lines.push('### 经济分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 总CAPEX | $' + r.economics.total_capex_usd_m.toFixed(1) + 'M |')
  lines.push('| 年OPEX | $' + r.economics.annual_opex_usd_m.toFixed(1) + 'M |')
  lines.push('| 年能源收入 | $' + r.economics.annual_revenue_energy_usd_m.toFixed(1) + 'M |')
  lines.push('| 年碳信用收入 | $' + r.economics.annual_revenue_carbon_usd_m.toFixed(1) + 'M |')
  lines.push('| 负CO2成本 | $' + r.economics.cost_per_ton_negative_co2.toFixed(2) + '/吨 |')
  lines.push('| 项目可行性 | ' + r.economics.project_viability + ' |')
  lines.push('')
  lines.push('### 可持续性评估')
  lines.push(r.sustainability_assessment)
  lines.push('')
  lines.push('### 原料风险')
  for (const risk of r.feedstock_risks) lines.push('- ' + risk)
  lines.push('')
  lines.push('### 技术风险')
  for (const risk of r.technology_risks) lines.push('- ' + risk)
  lines.push('')
  lines.push('### 市场风险')
  for (const risk of r.market_risks) lines.push('- ' + risk)
  lines.push('')
  lines.push('### 政策依赖')
  for (const p of r.policy_dependencies) lines.push('- ' + p)
  lines.push('')
  lines.push('### 建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatComplianceReport(r: ComplianceResult): string {
  const lines: string[] = []
  const statusLabel = r.overall_compliance_status === 'compliant' ? '合规' : r.overall_compliance_status === 'conditionally_compliant' ? '有条件合规' : '不合规'
  lines.push('## CCS项目监管合规评估报告')
  lines.push('')
  lines.push('**项目:** ' + r.project_name + ' | **司法管辖区:** ' + r.jurisdiction + ' | **合规状态:** ' + statusLabel + ' (' + r.compliance_score + '/100)')
  lines.push('')
  lines.push('### 合规要求清单')
  lines.push('| 要求 | 监管依据 | 状态 | 优先级 |')
  lines.push('|------|----------|------|--------|')
  for (const req of r.requirements) {
    const statusText = req.status === 'compliant' ? '合规' : req.status === 'non_compliant' ? '不合规' : req.status === 'pending' ? '待定' : '不适用'
    const priorityText = req.priority === 'critical' ? '关键' : req.priority === 'high' ? '高' : req.priority === 'medium' ? '中' : '低'
    lines.push('| ' + req.requirement + ' | ' + req.regulatory_reference + ' | ' + statusText + ' | ' + priorityText + ' |')
  }
  lines.push('')
  lines.push('### 关键差距')
  for (const gap of r.critical_gaps) lines.push('- ' + gap)
  lines.push('')
  lines.push('### 合规时间线')
  lines.push(r.timeline_to_compliance)
  lines.push('')
  lines.push('### 合规成本估算')
  lines.push('预计合规整改成本: $' + r.estimated_compliance_cost_usd_m + 'M')
  lines.push('')
  lines.push('### 监管沟通建议')
  for (const rec of r.regulatory_engagement_recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Capture Technology Selector
  tools.register(defineTool({
    name: 'capture_technology_selector',
    description: 'Select optimal CO2 capture technology (amine post-combustion, pre-combustion, oxy-fuel, DAC, calcium looping, membrane, cryogenic) based on emission source characteristics including CO2 concentration, flow rate, space constraints, target capture rate, and budget. Provides ranked technology comparison with TRL, costs, and pros/cons.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { emission_source, co2_concentration_pct, gas_flow_rate_nm3_h, pressure_bar, temperature_c, space_constraints (none/moderate/severe), target_capture_rate_pct, budget_usd_millions (optional), existing_infrastructure (optional string[]), purity_requirement (medium/high/ultra_high, optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CaptureTechInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeCaptureTech(input, rng)
      return formatCaptureTechReport(result)
    }
  }))

  // Tool 2: Storage Site Assessor
  tools.register(defineTool({
    name: 'storage_site_assessor',
    description: 'Assess geological CO2 storage site suitability based on formation properties (depth, porosity, permeability, temperature, pressure, salinity), caprock integrity, seismic risk, and nearby well count. Estimate storage capacity (theoretical/effective/practical) and provide injectivity and containment assessments.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { site_name, formation_type, depth_m, porosity_pct, permeability_mD, temperature_c, pressure_bar, salinity_ppm, caprock_thickness_m, caprock_permeability_mD, distance_from_source_km, seismic_risk (low/medium/high), nearby_wells_count, regulatory_zone }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: StorageSiteInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeStorageSite(input, rng)
      return formatStorageSiteReport(result)
    }
  }))

  // Tool 3: CO2 Monitoring System
  tools.register(defineTool({
    name: 'co2_monitoring_system',
    description: 'Design comprehensive CO2 storage monitoring system including 4D seismic, wellhead pressure/temperature, groundwater geochemistry, surface CO2 flux, InSAR deformation, microseismic, tracers, atmospheric monitoring, and fiber optic sensing. Provide cost estimates, monitoring phases, early warning indicators, and regulatory alignment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { site_name, storage_formation, injection_rate_tons_per_year, plume_radius_estimate_km, depth_m, aquifer_type, nearby_sensitive_receptors (string[]), regulatory_requirements (string[]), monitoring_budget_usd_millions (optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: MonitoringInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeMonitoring(input, rng)
      return formatMonitoringReport(result)
    }
  }))

  // Tool 4: CCS Economics Modeler
  tools.register(defineTool({
    name: 'ccs_economics_modeler',
    description: 'Model CCS project economics including CAPEX (capture, transport, storage), OPEX, levelized cost of capture, NPV, IRR, payback period, ROI, and break-even CO2 price. Generate revenue projections, sensitivity analysis, and financial viability assessment with risk factors and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { project_name, capture_capacity_mt_per_year, capture_technology, transport_distance_km, transport_method (pipeline/ship/truck/rail), storage_type, project_lifetime_years, discount_rate_pct, co2_price_usd_per_ton, tax_credits_usd_per_ton (optional), energy_cost_usd_per_mwh }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: EconomicsInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeEconomics(input, rng)
      return formatEconomicsReport(result)
    }
  }))

  // Tool 5: Transport Pipeline Optimizer
  tools.register(defineTool({
    name: 'transport_pipeline_optimizer',
    description: 'Optimize CO2 transport pipeline design including diameter selection, operating pressure, booster station count, wall thickness, and material selection. Estimate costs (material, construction, compressor), assess route risks, and provide mitigation measures and regulatory requirements.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { route_name, source_location, sink_location, distance_km, co2_flow_rate_mt_per_year, terrain_type, elevation_change_m, ambient_temperature_c, pipeline_diameter_options_inch (number[]), max_allowable_pressure_bar, population_density_along_route (low/medium/high), environmental_constraints (optional string[]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: PipelineInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzePipeline(input, rng)
      return formatPipelineReport(result)
    }
  }))

  // Tool 6: Mineralization Analyzer
  tools.register(defineTool({
    name: 'mineralization_analyzer',
    description: 'Analyze CO2 mineralization potential for basalt, peridotite, olivine, serpentinite, and other reactive rock types. Estimate mineralization rates over time, total capacity, reaction pathways, accelerating and limiting factors. Provide monitoring indicators and development recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { site_name, rock_type, reactive_mineral_content_pct, surface_area_m2_per_g, porosity_pct, permeability_mD, depth_m, temperature_c, pressure_bar, water_chemistry_ph, co2_injection_rate_tons_per_year, available_rock_volume_km3 }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: MineralizationInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeMineralization(input, rng)
      return formatMineralizationReport(result)
    }
  }))

  // Tool 7: Bioenergy CCS Evaluator
  tools.register(defineTool({
    name: 'bioenergy_ccs_evaluator',
    description: 'Evaluate Bioenergy with Carbon Capture and Storage (BECCS) project viability. Assess carbon negativity (biogenic CO2 captured, net negative emissions), project economics (CAPEX, OPEX, cost per ton negative CO2), sustainability, and identify feedstock, technology, market risks and policy dependencies.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { project_name, biomass_type, biomass_feedstock_tons_per_year, energy_output_mw, capture_technology, capture_rate_pct, biomass_co2_intensity_tons_per_mwh, lifecycle_co2_negative, biomass_sustainability_certified, storage_solution_available, distance_to_storage_km, biomass_cost_usd_per_ton, energy_price_usd_per_mwh, carbon_credit_price_usd_per_ton }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: BECCSInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeBECCS(input, rng)
      return formatBECCSReport(result)
    }
  }))

  // Tool 8: Regulatory Compliance CCS
  tools.register(defineTool({
    name: 'regulatory_compliance_ccs',
    description: 'Check CCS project regulatory compliance across jurisdictions (US EPA Class VI, EU CCS Directive, ISO 27914). Assess site characterization, EIA, public consultation, aquifer exemption, monitoring plan, corrective action, financial assurance, and post-injection site care requirements.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { project_name, jurisdiction, project_phase, storage_formation, injection_depth_m, total_injection_volume_mt, aquifer_exemption_required, environmental_impact_assessment_done, public_consultation_completed, financial_assurance_mechanism, monitoring_plan_approved, site_characterization_complete, corrective_action_plan, post_injection_site_care_years }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ComplianceInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeCompliance(input, rng)
      return formatComplianceReport(result)
    }
  }))

  console.log('[dsh-tool-carboncapt] Loaded v' + VERSION + ' - Carbon Capture & Storage (CCS) with 8 tools')
  console.log('  Tools: capture_technology_selector, storage_site_assessor, co2_monitoring_system, ccs_economics_modeler, transport_pipeline_optimizer, mineralization_analyzer, bioenergy_ccs_evaluator, regulatory_compliance_ccs')
}
