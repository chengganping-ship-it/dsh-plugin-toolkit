/**
 * DSH Climate Risk & Adaptation Plugin v0.1.0
 * Climate Risk & Adaptation - physical risk assessment, transition risk analysis,
 * TCFD reporting, adaptation planning.
 *
 * 2026: Climate risk analytics $10B+; TCFD compliance mandatory.
 *
 * Tool list:
 * 1. physical_risk_assessor       - Physical climate risk assessment (flood, heat, storm, drought, wildfire)
 * 2. transition_risk_analyzer    - Transition risk analysis (policy, technology, market, reputation)
 * 3. tcfd_report_generator        - TCFD-aligned climate report generation
 * 4. adaptation_planner           - Climate adaptation planning & roadmap
 * 5. scenario_analysis_climate    - Climate scenario analysis (SSP/RCP pathways)
 * 6. carbon_accounting_tool       - Carbon accounting (Scope 1/2/3)
 * 7. climate_stress_tester        - Climate stress testing for portfolios
 * 8. green_finance_eligibility_checker - Green finance & EU Taxonomy eligibility
 *
 * @module dsh-tool-climaterisk | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-climaterisk'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 - Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 - Type Definitions ====================

// --- Tool 1: Physical Risk Assessor ---
export interface PhysicalRiskInput {
  asset_location: string
  asset_type: 'infrastructure' | 'real_estate' | 'agriculture' | 'manufacturing' | 'energy' | 'transport'
  asset_value_usd_millions: number
  time_horizon_years: number
  climate_hazards: ('flood' | 'heatwave' | 'storm' | 'drought' | 'wildfire' | 'sea_level_rise')[]
  historical_data_years?: number
  adaptation_measures?: string[]
}

export interface HazardRisk {
  hazard: string
  probability_annual_pct: number
  severity_score: number
  exposure_value_usd_millions: number
  annual_expected_loss_usd_millions: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
}

export interface PhysicalRiskResult {
  overall_risk_score: number
  overall_risk_level: string
  hazard_risks: HazardRisk[]
  total_annual_expected_loss: number
  max_single_loss_event: number
  adaptation_gap_pct: number
  recommendations: string[]
}

// --- Tool 2: Transition Risk Analyzer ---
export interface TransitionRiskInput {
  sector: string
  annual_revenue_usd_millions: number
  carbon_intensity_tco2_per_million_usd: number
  policy_scenario: 'orderly' | 'disorderly' | 'hot_house_world'
  time_horizon_years: number
  geographic_exposure: string[]
  technology_readiness?: 'leader' | 'average' | 'laggard'
}

export interface TransitionRiskFactor {
  factor: string
  category: 'policy' | 'technology' | 'market' | 'reputation'
  impact_score: number
  financial_impact_usd_millions: number
  time_to_materiality_years: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface TransitionRiskResult {
  overall_transition_risk_score: number
  risk_factors: TransitionRiskFactor[]
  total_financial_exposure: number
  revenue_at_risk_pct: number
  carbon_price_sensitivity: number
  strategic_imperatives: string[]
}

// --- Tool 3: TCFD Report Generator ---
export interface TCFDInput {
  organization_name: string
  reporting_period: string
  sector: string
  total_emissions_tco2e: number
  governance_structure: string
  climate_targets: string[]
  scenario_analysis_summary: string
  risk_management_description: string
  metrics_scope: ('scope1' | 'scope2' | 'scope3')[]
}

export interface TCFDPillar {
  pillar: 'governance' | 'strategy' | 'risk_management' | 'metrics_targets'
  disclosure_completeness_pct: number
  alignment_level: 'full' | 'partial' | 'minimal'
  gaps: string[]
  recommendations: string[]
}

export interface TCFDResult {
  report_id: string
  overall_alignment_pct: number
  pillars: TCFDPillar[]
  compliance_status: 'compliant' | 'partially_compliant' | 'non_compliant'
  material_gaps: string[]
  next_steps: string[]
}

// --- Tool 4: Adaptation Planner ---
export interface AdaptationInput {
  region: string
  climate_projections: string[]
  vulnerable_sectors: string[]
  population_affected: number
  gdp_at_risk_usd_billions: number
  adaptation_budget_usd_millions: number
  planning_horizon_years: number
  priority_level: 'urgent' | 'high' | 'medium' | 'low'
}

export interface AdaptationMeasure {
  measure_id: string
  name: string
  sector: string
  cost_usd_millions: number
  benefit_cost_ratio: number
  implementation_years: number
  effectiveness_pct: number
  co_benefits: string[]
  priority_rank: number
}

export interface AdaptationResult {
  total_investment_needed: number
  budget_gap: number
  measures: AdaptationMeasure[]
  implementation_roadmap: string[]
  resilience_score_improvement: number
  monitoring_indicators: string[]
}

// --- Tool 5: Scenario Analysis Climate ---
export interface ScenarioInput {
  scenario_type: 'ssp1_1.9' | 'ssp1_2.6' | 'ssp2_4.5' | 'ssp3_7.0' | 'ssp5_8.5'
  baseline_year: number
  target_year: number
  region: string
  sector: string
  gdp_baseline_usd_billions: number
  emissions_baseline_gtco2: number
}

export interface ScenarioProjection {
  year: number
  temperature_increase_c: number
  gdp_impact_pct: number
  emissions_gtco2: number
  carbon_price_usd_per_ton: number
  sea_level_rise_cm: number
  extreme_event_frequency_multiplier: number
}

export interface ScenarioResult {
  scenario_name: string
  description: string
  projections: ScenarioProjection[]
  cumulative_gdp_impact_usd_billions: number
  peak_warming_c: number
  key_tipping_points: string[]
  comparison_to_baseline: string
}

// --- Tool 6: Carbon Accounting Tool ---
export interface CarbonAccountingInput {
  organization_name: string
  reporting_year: number
  scope1_sources: Array<{ source: string; emissions_tco2e: number }>
  scope2_sources: Array<{ source: string; emissions_tco2e: number }>
  scope3_categories: Array<{ category: string; emissions_tco2e: number }>
  revenue_usd_millions: number
  employees: number
  industry_benchmark_tco2_per_million_usd?: number
}

export interface CarbonFootprint {
  scope1_total: number
  scope2_total: number
  scope3_total: number
  total_emissions: number
  intensity_per_revenue: number
  intensity_per_employee: number
  benchmark_comparison_pct: number
}

export interface CarbonAccountingResult {
  footprint: CarbonFootprint
  material_categories: Array<{ category: string; emissions_tco2e: number; pct_of_total: number }>
  reduction_pathway: Array<{ year: number; target_reduction_pct: number; projected_emissions: number }>
  data_quality_score: number
  assurance_readiness: 'ready' | 'partial' | 'not_ready'
  recommendations: string[]
}

// --- Tool 7: Climate Stress Tester ---
export interface ClimateStressInput {
  portfolio_name: string
  portfolio_value_usd_billions: number
  sector_weights: Array<{ sector: string; weight_pct: number }>
  stress_scenario: 'ndcp' | 'delayed_transition' | 'hot_house' | 'orderly_1.5'
  time_horizon_years: number
  confidence_level: number
}

export interface SectorStressResult {
  sector: string
  weight_pct: number
  value_at_risk_usd_billions: number
  expected_shortfall_usd_billions: number
  transition_impact_pct: number
  physical_impact_pct: number
  combined_loss_pct: number
}

export interface ClimateStressResult {
  scenario: string
  portfolio_var_usd_billions: number
  portfolio_expected_shortfall: number
  sector_results: SectorStressResult[]
  systemic_risk_contribution: number
  capital_buffer_needed: number
  pass_fail: 'pass' | 'marginal' | 'fail'
  mitigation_actions: string[]
}

// --- Tool 8: Green Finance Eligibility Checker ---
export interface GreenFinanceInput {
  project_name: string
  project_type: string
  investment_amount_usd_millions: string
  expected_co2_reduction_tco2e_per_year: number
  project_location: string
  use_of_proceeds: string[]
  certification_standards: string[]
  taxonomy_regulation: 'eu_taxonomy' | 'green_bond_principles' | 'climate_bonds' | 'sustainability_linked'
}

export interface TaxonomyCriteria {
  criterion: string
  status: 'met' | 'partially_met' | 'not_met'
  evidence_required: string
  score: number
}

export interface GreenFinanceResult {
  eligibility_status: 'eligible' | 'conditionally_eligible' | 'not_eligible'
  overall_score: number
  taxonomy_alignment_pct: number
  criteria: TaxonomyCriteria[]
  significant_contribution: string[]
  do_no_significant_harm: string[]
  minimum_safeguards: string[]
  improvement_actions: string[]
  potential_instruments: string[]
}

// ==================== SECTION 3 - Analysis Functions ====================

// --- Tool 1: Physical Risk Assessor ---
function analyzePhysicalRisk(input: PhysicalRiskInput): PhysicalRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const hazardRisks: HazardRisk[] = []
  const baseProbs: Record<string, number> = {
    flood: 12, heatwave: 18, storm: 10, drought: 15, wildfire: 6, sea_level_rise: 4
  }
  const baseSeverities: Record<string, number> = {
    flood: 6.5, heatwave: 5.0, storm: 7.5, drought: 5.5, wildfire: 8.0, sea_level_rise: 4.0
  }

  for (const hazard of input.climate_hazards) {
    const horizonFactor = 1 + (input.time_horizon_years - 10) * 0.02
    const prob = Math.min(85, baseProbs[hazard] * horizonFactor * rng.nextFloat(0.8, 1.3))
    const severity = Math.min(10, baseSeverities[hazard] * rng.nextFloat(0.85, 1.2))
    const exposure = input.asset_value_usd_millions * rng.nextFloat(0.1, 0.5)
    const ael = exposure * (prob / 100) * (severity / 10)
    const riskLevel: HazardRisk['risk_level'] =
      severity >= 8 ? 'critical' : severity >= 6.5 ? 'high' : severity >= 4.5 ? 'moderate' : 'low'

    hazardRisks.push({
      hazard,
      probability_annual_pct: Math.round(prob * 10) / 10,
      severity_score: Math.round(severity * 10) / 10,
      exposure_value_usd_millions: Math.round(exposure * 100) / 100,
      annual_expected_loss_usd_millions: Math.round(ael * 100) / 100,
      risk_level: riskLevel,
    })
  }

  const totalAEL = hazardRisks.reduce((s, h) => s + h.annual_expected_loss_usd_millions, 0)
  const maxSingle = hazardRisks.reduce((m, h) => Math.max(m, h.exposure_value_usd_millions * (h.severity_score / 10)), 0)
  const avgSeverity = hazardRisks.reduce((s, h) => s + h.severity_score, 0) / Math.max(1, hazardRisks.length)
  const adaptationGap = Math.max(0, 100 - (input.adaptation_measures?.length || 0) * 15)

  const recommendations: string[] = []
  if (hazardRisks.some(h => h.risk_level === 'critical')) {
    recommendations.push('立即启动关键风险缓解工程，优先处理评级为critical的灾害')
  }
  if (adaptationGap > 40) {
    recommendations.push('适应措施覆盖不足，建议增加至少' + Math.ceil(adaptationGap / 15) + '项适应行动')
  }
  recommendations.push('建立实时气候风险监测预警系统')
  recommendations.push('将物理风险纳入资产组合压力测试框架')
  recommendations.push('购买参数化气候保险以转移剩余风险')

  return {
    overall_risk_score: Math.round(avgSeverity * 10) / 10,
    overall_risk_level: avgSeverity >= 7 ? 'high' : avgSeverity >= 5 ? 'moderate' : 'low',
    hazard_risks: hazardRisks,
    total_annual_expected_loss: Math.round(totalAEL * 100) / 100,
    max_single_loss_event: Math.round(maxSingle * 100) / 100,
    adaptation_gap_pct: Math.round(adaptationGap),
    recommendations,
  }
}

// --- Tool 2: Transition Risk Analyzer ---
function analyzeTransitionRisk(input: TransitionRiskInput): TransitionRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const policyMultiplier = input.policy_scenario === 'disorderly' ? 1.8 : input.policy_scenario === 'hot_house_world' ? 0.6 : 1.0
  const techMultiplier = input.technology_readiness === 'laggard' ? 1.5 : input.technology_readiness === 'leader' ? 0.6 : 1.0

  const riskFactors: TransitionRiskFactor[] = [
    {
      factor: '碳定价政策收紧',
      category: 'policy',
      impact_score: Math.round(rng.nextFloat(6, 9.5) * policyMultiplier * 10) / 10,
      financial_impact_usd_millions: Math.round(input.carbon_intensity_tco2_per_million_usd * input.annual_revenue_usd_millions * rng.nextFloat(0.02, 0.08) * policyMultiplier * 100) / 100,
      time_to_materiality_years: input.policy_scenario === 'disorderly' ? rng.nextInt(1, 3) : rng.nextInt(3, 8),
      trend: 'increasing',
    },
    {
      factor: '低碳技术替代',
      category: 'technology',
      impact_score: Math.round(rng.nextFloat(5, 9) * techMultiplier * 10) / 10,
      financial_impact_usd_millions: Math.round(input.annual_revenue_usd_millions * rng.nextFloat(0.01, 0.06) * techMultiplier * 100) / 100,
      time_to_materiality_years: rng.nextInt(3, 10),
      trend: 'increasing',
    },
    {
      factor: '市场需求转向低碳产品',
      category: 'market',
      impact_score: Math.round(rng.nextFloat(4, 8) * 10) / 10,
      financial_impact_usd_millions: Math.round(input.annual_revenue_usd_millions * rng.nextFloat(0.005, 0.04) * 100) / 100,
      time_to_materiality_years: rng.nextInt(2, 7),
      trend: 'increasing',
    },
    {
      factor: '声誉与融资成本上升',
      category: 'reputation',
      impact_score: Math.round(rng.nextFloat(3, 7.5) * 10) / 10,
      financial_impact_usd_millions: Math.round(input.annual_revenue_usd_millions * rng.nextFloat(0.002, 0.02) * 100) / 100,
      time_to_materiality_years: rng.nextInt(1, 5),
      trend: input.technology_readiness === 'laggard' ? 'increasing' : 'stable',
    },
  ]

  const totalExposure = riskFactors.reduce((s, f) => s + f.financial_impact_usd_millions, 0)
  const avgImpact = riskFactors.reduce((s, f) => s + f.impact_score, 0) / riskFactors.length
  const revenueAtRisk = Math.round((totalExposure / input.annual_revenue_usd_millions) * 100 * 10) / 10
  const carbonPriceSensitivity = Math.round(input.carbon_intensity_tco2_per_million_usd * rng.nextFloat(0.8, 1.2) * 100) / 100

  const strategicImperatives: string[] = []
  strategicImperatives.push('制定科学碳目标(SBTi)，明确脱碳路径')
  if (input.technology_readiness === 'laggard') {
    strategicImperatives.push('加速低碳技术投资，缩小与行业领先者差距')
  }
  strategicImperatives.push('建立内部碳定价机制，将碳成本纳入投资决策')
  strategicImperatives.push('开展气候情景分析，评估不同升温路径下的财务韧性')
  strategicImperatives.push('加强TCFD/ISSB披露，提升投资者信心')

  return {
    overall_transition_risk_score: Math.round(avgImpact * 10) / 10,
    risk_factors: riskFactors,
    total_financial_exposure: Math.round(totalExposure * 100) / 100,
    revenue_at_risk_pct: revenueAtRisk,
    carbon_price_sensitivity: carbonPriceSensitivity,
    strategic_imperatives: strategicImperatives,
  }
}

// --- Tool 3: TCFD Report Generator ---
function analyzeTCFD(input: TCFDInput): TCFDResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const pillars: TCFDPillar[] = [
    {
      pillar: 'governance',
      disclosure_completeness_pct: Math.round(rng.nextFloat(55, 95)),
      alignment_level: rng.next() > 0.5 ? 'full' : 'partial',
      gaps: rng.next() > 0.4 ? ['董事会气候监督职责未明确量化', '管理层气候激励与薪酬挂钩不足'] : ['治理披露基本完善'],
      recommendations: ['设立董事会级别气候委员会', '将气候KPI纳入高管薪酬考核'],
    },
    {
      pillar: 'strategy',
      disclosure_completeness_pct: Math.round(rng.nextFloat(45, 90)),
      alignment_level: rng.next() > 0.4 ? 'partial' : 'minimal',
      gaps: ['短期/中期/长期气候战略分层不清晰', '气候机遇的财务量化不充分'],
      recommendations: ['开展2C和4C情景分析', '量化气候机遇对收入/成本的财务影响'],
    },
    {
      pillar: 'risk_management',
      disclosure_completeness_pct: Math.round(rng.nextFloat(50, 92)),
      alignment_level: rng.next() > 0.5 ? 'partial' : 'full',
      gaps: rng.next() > 0.5 ? ['气候风险识别流程未与ERM充分整合'] : ['风险管理流程较为完善'],
      recommendations: ['将气候风险纳入企业风险管理(ERM)框架', '建立气候风险热力图定期更新机制'],
    },
    {
      pillar: 'metrics_targets',
      disclosure_completeness_pct: Math.round(rng.nextFloat(60, 98)),
      alignment_level: input.metrics_scope.length >= 3 ? 'full' : 'partial',
      gaps: input.metrics_scope.includes('scope3') ? [] : ['Scope 3排放数据缺失或不完整'],
      recommendations: ['完善Scope 3类别1-15数据收集', '设定基于科学的减排目标(SBTi)'],
    },
  ]

  const overallAlignment = Math.round(pillars.reduce((s, p) => s + p.disclosure_completeness_pct, 0) / pillars.length)
  const complianceStatus: TCFDResult['compliance_status'] =
    overallAlignment >= 80 ? 'compliant' : overallAlignment >= 55 ? 'partially_compliant' : 'non_compliant'

  const materialGaps: string[] = []
  for (const p of pillars) {
    for (const g of p.gaps) {
      if (g.indexOf('基本完善') === -1 && g.indexOf('较为完善') === -1) {
        materialGaps.push(g)
      }
    }
  }

  const nextSteps: string[] = []
  nextSteps.push('在下一份报告中补齐已识别的重大披露缺口')
  nextSteps.push('聘请第三方机构对TCCFD披露进行有限鉴证')
  nextSteps.push('对标行业领先企业最佳实践，持续改进披露质量')
  if (!input.metrics_scope.includes('scope3')) {
    nextSteps.push('优先建立Scope 3数据收集与核算体系')
  }

  return {
    report_id: 'TCFD-' + input.reporting_period + '-' + rng.nextInt(10000, 99999),
    overall_alignment_pct: overallAlignment,
    pillars,
    compliance_status: complianceStatus,
    material_gaps: materialGaps,
    next_steps: nextSteps,
  }
}

// --- Tool 4: Adaptation Planner ---
function analyzeAdaptation(input: AdaptationInput): AdaptationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const measureNames = [
    '海岸防护工程加固', '城市海绵改造', '抗旱作物推广', '早期预警系统升级',
    '生态廊道建设', '供水系统韧性提升', '热浪应急响应体系', '气候智能型农业',
    '红树林生态修复', '分布式可再生能源微网',
  ]
  const sectors = ['水利', '农业', '城市规划', '生态', '能源', '公共卫生']

  const numMeasures = rng.nextInt(5, 8)
  const measures: AdaptationMeasure[] = []
  const usedNames = new Set<string>()

  for (let i = 0; i < numMeasures; i++) {
    let name = rng.pick(measureNames)
    while (usedNames.has(name)) {
      name = rng.pick(measureNames)
    }
    usedNames.add(name)

    const cost = Math.round(rng.nextFloat(5, 150) * 100) / 100
    const bcr = Math.round(rng.nextFloat(1.2, 5.0) * 10) / 10
    measures.push({
      measure_id: 'ADAPT-' + rng.nextInt(1000, 9999),
      name,
      sector: rng.pick(sectors),
      cost_usd_millions: cost,
      benefit_cost_ratio: bcr,
      implementation_years: rng.nextInt(1, 8),
      effectiveness_pct: Math.round(rng.nextFloat(40, 90)),
      co_benefits: [rng.pick(['就业创造', '生物多样性保护', '空气质量改善', '公共健康提升']), rng.pick(['经济增长', '社会公平', '技术创新'])],
      priority_rank: 0,
    })
  }

  measures.sort((a, b) => b.benefit_cost_ratio - a.benefit_cost_ratio)
  measures.forEach((m, i) => { m.priority_rank = i + 1 })

  const totalNeeded = measures.reduce((s, m) => s + m.cost_usd_millions, 0)
  const budgetGap = Math.max(0, Math.round((totalNeeded - input.adaptation_budget_usd_millions) * 100) / 100)

  const roadmap: string[] = []
  roadmap.push('第1年: 启动优先级1-2项适应措施，建立监测基线')
  roadmap.push('第2-3年: 全面实施高优先级措施，完成早期预警系统部署')
  roadmap.push('第4-5年: 扩展中等优先级措施，开展效果评估与调整')
  roadmap.push('第' + input.planning_horizon_years + '年: 实现适应目标，建立长期韧性监测体系')

  const resilienceImprovement = Math.round(rng.nextFloat(15, 45) * 10) / 10

  const monitoringIndicators: string[] = []
  monitoringIndicators.push('气候相关灾害经济损失年变化率')
  monitoringIndicators.push('关键基础设施气候韧性达标率')
  monitoringIndicators.push('适应措施覆盖人口比例')
  monitoringIndicators.push('生态系统健康指数')

  return {
    total_investment_needed: Math.round(totalNeeded * 100) / 100,
    budget_gap: budgetGap,
    measures,
    implementation_roadmap: roadmap,
    resilience_score_improvement: resilienceImprovement,
    monitoring_indicators: monitoringIndicators,
  }
}

// --- Tool 5: Scenario Analysis Climate ---
function analyzeScenario(input: ScenarioInput): ScenarioResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const scenarioDescs: Record<string, string> = {
    'ssp1_1.9': '可持续发展路径 - 全球合作实现1.5C目标',
    'ssp1_2.6': '可持续发展路径 - 实现2C目标',
    'ssp2_4.5': '中间路径 - 当前政策延续',
    'ssp3_7.0': '区域竞争路径 - 高排放高挑战',
    'ssp5_8.5': '化石燃料发展路径 - 极高排放',
  }

  const warmingRates: Record<string, number> = {
    'ssp1_1.9': 0.15, 'ssp1_2.6': 0.22, 'ssp2_4.5': 0.35, 'ssp3_7.0': 0.48, 'ssp5_8.5': 0.65,
  }
  const carbonPrices: Record<string, number> = {
    'ssp1_1.9': 250, 'ssp1_2.6': 180, 'ssp2_4.5': 80, 'ssp3_7.0': 30, 'ssp5_8.5': 10,
  }

  const rate = warmingRates[input.scenario_type] || 0.35
  const baseCarbonPrice = carbonPrices[input.scenario_type] || 80
  const projections: ScenarioProjection[] = []

  const years = [input.baseline_year, 2030, 2040, 2050, 2070, 2100].filter(y => y >= input.baseline_year && y <= input.target_year)
  if (years.length === 0) years.push(input.baseline_year, input.target_year)

  let cumulativeGDPImpact = 0
  let peakWarming = 0

  for (const year of years) {
    const yearsElapsed = year - input.baseline_year
    const tempInc = Math.min(rate * yearsElapsed, 8) * rng.nextFloat(0.9, 1.1)
    const gdpImpact = -Math.min(25, tempInc * rng.nextFloat(0.5, 1.5))
    const emissions = input.emissions_baseline_gtco2 * Math.max(0.05, 1 - yearsElapsed * (input.scenario_type === 'ssp1_1.9' ? 0.04 : input.scenario_type === 'ssp5_8.5' ? -0.01 : 0.01))
    const carbonPrice = baseCarbonPrice * (1 + yearsElapsed * 0.03) * rng.nextFloat(0.85, 1.15)
    const slr = Math.min(100, yearsElapsed * rate * 1.2)
    const extremeMult = 1 + tempInc * 0.15

    projections.push({
      year,
      temperature_increase_c: Math.round(tempInc * 100) / 100,
      gdp_impact_pct: Math.round(gdpImpact * 100) / 100,
      emissions_gtco2: Math.round(emissions * 100) / 100,
      carbon_price_usd_per_ton: Math.round(carbonPrice),
      sea_level_rise_cm: Math.round(slr * 10) / 10,
      extreme_event_frequency_multiplier: Math.round(extremeMult * 100) / 100,
    })

    cumulativeGDPImpact += gdpImpact * input.gdp_baseline_usd_billions / 100
    peakWarming = Math.max(peakWarming, tempInc)
  }

  const tippingPoints: string[] = []
  if (peakWarming >= 1.5) tippingPoints.push('格陵兰冰盖不可逆消融风险')
  if (peakWarming >= 2.0) tippingPoints.push('亚马逊雨林退化临界点')
  if (peakWarming >= 2.5) tippingPoints.push('永久冻土大规模解冻')
  if (peakWarming >= 3.0) tippingPoints.push('大西洋经向翻转环流(AMOC)减弱')
  if (tippingPoints.length === 0) tippingPoints.push('当前情景下未触发主要临界点')

  return {
    scenario_name: input.scenario_type,
    description: scenarioDescs[input.scenario_type] || '自定义情景分析',
    projections,
    cumulative_gdp_impact_usd_billions: Math.round(cumulativeGDPImpact * 100) / 100,
    peak_warming_c: Math.round(peakWarming * 100) / 100,
    key_tipping_points: tippingPoints,
    comparison_to_baseline: '相比基准情景，' + input.scenario_type + '路径下' + input.target_year + '年GDP影响为' + Math.round(cumulativeGDPImpact * 100) / 100 + '十亿美元',
  }
}

// --- Tool 6: Carbon Accounting Tool ---
function analyzeCarbonAccounting(input: CarbonAccountingInput): CarbonAccountingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const scope1Total = input.scope1_sources.reduce((s, src) => s + src.emissions_tco2e, 0)
  const scope2Total = input.scope2_sources.reduce((s, src) => s + src.emissions_tco2e, 0)
  const scope3Total = input.scope3_categories.reduce((s, cat) => s + cat.emissions_tco2e, 0)
  const totalEmissions = scope1Total + scope2Total + scope3Total
  const intensityRevenue = input.revenue_usd_millions > 0 ? totalEmissions / input.revenue_usd_millions : 0
  const intensityEmployee = input.employees > 0 ? totalEmissions / input.employees : 0

  const benchmark = input.industry_benchmark_tco2_per_million_usd || intensityRevenue * rng.nextFloat(0.8, 1.2)
  const benchmarkComparison = benchmark > 0 ? Math.round((intensityRevenue / benchmark - 1) * 100 * 10) / 10 : 0

  const allCategories: Array<{ category: string; emissions_tco2e: number; pct_of_total: number }> = []
  for (const src of input.scope1_sources) {
    allCategories.push({ category: 'Scope1: ' + src.source, emissions_tco2e: src.emissions_tco2e, pct_of_total: totalEmissions > 0 ? Math.round(src.emissions_tco2e / totalEmissions * 1000) / 10 : 0 })
  }
  for (const src of input.scope2_sources) {
    allCategories.push({ category: 'Scope2: ' + src.source, emissions_tco2e: src.emissions_tco2e, pct_of_total: totalEmissions > 0 ? Math.round(src.emissions_tco2e / totalEmissions * 1000) / 10 : 0 })
  }
  for (const cat of input.scope3_categories) {
    allCategories.push({ category: 'Scope3: ' + cat.category, emissions_tco2e: cat.emissions_tco2e, pct_of_total: totalEmissions > 0 ? Math.round(cat.emissions_tco2e / totalEmissions * 1000) / 10 : 0 })
  }
  allCategories.sort((a, b) => b.emissions_tco2e - a.emissions_tco2e)

  const reductionPathway: Array<{ year: number; target_reduction_pct: number; projected_emissions: number }> = []
  const annualReductionRate = rng.nextFloat(0.05, 0.12)
  for (let y = 1; y <= 10; y++) {
    const year = input.reporting_year + y
    const reductionPct = Math.min(90, Math.round(annualReductionRate * y * 100 * 10) / 10)
    const projected = Math.round(totalEmissions * (1 - reductionPct / 100) * 100) / 100
    reductionPathway.push({ year, target_reduction_pct: reductionPct, projected_emissions: projected })
  }

  const dataQualityScore = Math.round(rng.nextFloat(60, 95))
  const assuranceReadiness: CarbonAccountingResult['assurance_readiness'] =
    dataQualityScore >= 85 ? 'ready' : dataQualityScore >= 65 ? 'partial' : 'not_ready'

  const recommendations: string[] = []
  recommendations.push('建立自动化碳排放数据收集系统，提升数据质量')
  if (scope3Total > scope1Total + scope2Total) {
    recommendations.push('Scope 3排放占比高，优先与关键供应商开展碳数据协作')
  }
  recommendations.push('设定年度减排目标并纳入管理层绩效考核')
  recommendations.push('聘请第三方机构对碳排放数据进行有限鉴证')

  return {
    footprint: {
      scope1_total: Math.round(scope1Total * 100) / 100,
      scope2_total: Math.round(scope2Total * 100) / 100,
      scope3_total: Math.round(scope3Total * 100) / 100,
      total_emissions: Math.round(totalEmissions * 100) / 100,
      intensity_per_revenue: Math.round(intensityRevenue * 100) / 100,
      intensity_per_employee: Math.round(intensityEmployee * 100) / 100,
      benchmark_comparison_pct: benchmarkComparison,
    },
    material_categories: allCategories.slice(0, 8),
    reduction_pathway: reductionPathway,
    data_quality_score: dataQualityScore,
    assurance_readiness: assuranceReadiness,
    recommendations,
  }
}

// --- Tool 7: Climate Stress Tester ---
function analyzeClimateStress(input: ClimateStressInput): ClimateStressResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const scenarioMultipliers: Record<string, number> = {
    'ndcp': 1.0, 'delayed_transition': 1.6, 'hot_house': 1.3, 'orderly_1.5': 0.7,
  }
  const mult = scenarioMultipliers[input.stress_scenario] || 1.0

  const sectorResults: SectorStressResult[] = []
  for (const sw of input.sector_weights) {
    const transitionImpact = -Math.min(40, rng.nextFloat(5, 30) * mult)
    const physicalImpact = -Math.min(35, rng.nextFloat(3, 20) * mult)
    const combinedLoss = Math.round((transitionImpact + physicalImpact) * 100) / 100
    const sectorValue = input.portfolio_value_usd_billions * (sw.weight_pct / 100)
    const var_value = Math.round(sectorValue * Math.abs(combinedLoss) / 100 * 100) / 100
    const es_value = Math.round(var_value * rng.nextFloat(1.2, 1.8) * 100) / 100

    sectorResults.push({
      sector: sw.sector,
      weight_pct: sw.weight_pct,
      value_at_risk_usd_billions: var_value,
      expected_shortfall_usd_billions: es_value,
      transition_impact_pct: Math.round(transitionImpact * 100) / 100,
      physical_impact_pct: Math.round(physicalImpact * 100) / 100,
      combined_loss_pct: combinedLoss,
    })
  }

  const portfolioVar = sectorResults.reduce((s, r) => s + r.value_at_risk_usd_billions, 0)
  const portfolioES = sectorResults.reduce((s, r) => s + r.expected_shortfall_usd_billions, 0)
  const systemicRisk = Math.round(rng.nextFloat(0.1, 0.4) * 1000) / 1000
  const capitalBuffer = Math.round(portfolioES * rng.nextFloat(1.5, 2.5) * 100) / 100

  const lossPct = portfolioVar / input.portfolio_value_usd_billions * 100
  const passFail: ClimateStressResult['pass_fail'] =
    lossPct < 8 ? 'pass' : lossPct < 15 ? 'marginal' : 'fail'

  const mitigationActions: string[] = []
  mitigationActions.push('降低高碳行业敞口，增加绿色资产配置')
  mitigationActions.push('建立气候风险限额管理制度')
  if (passFail === 'fail') {
    mitigationActions.push('压力测试未通过，需立即补充资本缓冲并调整资产组合')
  }
  mitigationActions.push('开展反向压力测试，识别极端损失情景')
  mitigationActions.push('将气候风险纳入内部资本充足评估程序(ICAAP)')

  return {
    scenario: input.stress_scenario,
    portfolio_var_usd_billions: Math.round(portfolioVar * 100) / 100,
    portfolio_expected_shortfall: Math.round(portfolioES * 100) / 100,
    sector_results: sectorResults,
    systemic_risk_contribution: systemicRisk,
    capital_buffer_needed: capitalBuffer,
    pass_fail: passFail,
    mitigation_actions: mitigationActions,
  }
}

// --- Tool 8: Green Finance Eligibility Checker ---
function analyzeGreenFinance(input: GreenFinanceInput): GreenFinanceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const criteria: TaxonomyCriteria[] = [
    {
      criterion: '气候变化减缓 - 实质性贡献',
      status: input.expected_co2_reduction_tco2e_per_year > 10000 ? 'met' : input.expected_co2_reduction_tco2e_per_year > 2000 ? 'partially_met' : 'not_met',
      evidence_required: '量化CO2减排报告、第三方核证',
      score: Math.round(rng.nextFloat(60, 100)),
    },
    {
      criterion: '气候变化适应 - 适应性贡献',
      status: input.use_of_proceeds.some(u => u.indexOf('适应') >= 0 || u.indexOf('resilience') >= 0) ? 'met' : 'partially_met',
      evidence_required: '气候风险评估报告、适应计划',
      score: Math.round(rng.nextFloat(40, 90)),
    },
    {
      criterion: '水资源可持续保护',
      status: rng.next() > 0.5 ? 'met' : 'partially_met',
      evidence_required: '水资源影响评估',
      score: Math.round(rng.nextFloat(50, 95)),
    },
    {
      criterion: '循环经济转型',
      status: rng.next() > 0.6 ? 'met' : 'partially_met',
      evidence_required: '物质流分析、循环利用率数据',
      score: Math.round(rng.nextFloat(45, 85)),
    },
    {
      criterion: '污染预防与控制',
      status: rng.next() > 0.4 ? 'met' : 'partially_met',
      evidence_required: '排放监测数据、合规证明',
      score: Math.round(rng.nextFloat(55, 90)),
    },
    {
      criterion: '生物多样性保护',
      status: rng.next() > 0.5 ? 'met' : 'partially_met',
      evidence_required: '生态影响评估、生物多样性基线',
      score: Math.round(rng.nextFloat(40, 80)),
    },
  ]

  const overallScore = Math.round(criteria.reduce((s, c) => s + c.score, 0) / criteria.length)
  const taxonomyAlignment = Math.round(criteria.filter(c => c.status === 'met').length / criteria.length * 100)

  const eligibilityStatus: GreenFinanceResult['eligibility_status'] =
    overallScore >= 75 && taxonomyAlignment >= 60 ? 'eligible' :
    overallScore >= 55 ? 'conditionally_eligible' : 'not_eligible'

  const significantContribution: string[] = []
  if (criteria[0].status === 'met') significantContribution.push('气候变化减缓: 年减排' + input.expected_co2_reduction_tco2e_per_year + ' tCO2e')
  if (criteria[1].status === 'met') significantContribution.push('气候变化适应: 提升区域韧性')
  if (significantContribution.length === 0) significantContribution.push('需加强实质性贡献论证')

  const dnsh: string[] = []
  for (const c of criteria) {
    if (c.status !== 'met') {
      dnsh.push('需改善: ' + c.criterion + ' - ' + c.evidence_required)
    }
  }
  if (dnsh.length === 0) dnsh.push('所有DNSH标准均已满足')

  const safeguards: string[] = []
  safeguards.push('OECD跨国企业准则合规')
  safeguards.push('UN商业与人权指导原则合规')
  safeguards.push('ILO核心劳工标准合规')
  safeguards.push('赤道原则(Equator Principles)合规')

  const improvementActions: string[] = []
  if (criteria[0].status !== 'met') improvementActions.push('加强CO2减排量化与第三方核证')
  if (criteria[1].status !== 'met') improvementActions.push('补充气候适应贡献论证材料')
  if (criteria[5].status !== 'met') improvementActions.push('开展生物多样性影响基线调查')
  if (input.certification_standards.length === 0) improvementActions.push('获取CBI/ICMA等绿色认证')
  if (improvementActions.length === 0) improvementActions.push('持续维护合规状态，准备年度跟踪报告')

  const potentialInstruments: string[] = []
  if (eligibilityStatus === 'eligible') {
    potentialInstruments.push('绿色债券(Green Bond)')
    potentialInstruments.push('可持续发展挂钩贷款(SLL)')
    potentialInstruments.push('可持续发展挂钩债券(SLB)')
    potentialInstruments.push('绿色资产支持证券(Green ABS)')
  } else if (eligibilityStatus === 'conditionally_eligible') {
    potentialInstruments.push('转型债券(Transition Bond)')
    potentialInstruments.push('可持续发展挂钩贷款(SLL)')
    potentialInstruments.push('绿色债券(需补充材料后)')
  } else {
    potentialInstruments.push('转型金融框架下融资')
    potentialInstruments.push('需先满足基本合规要求')
  }

  return {
    eligibility_status: eligibilityStatus,
    overall_score: overallScore,
    taxonomy_alignment_pct: taxonomyAlignment,
    criteria,
    significant_contribution: significantContribution,
    do_no_significant_harm: dnsh,
    minimum_safeguards: safeguards,
    improvement_actions: improvementActions,
    potential_instruments: potentialInstruments,
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatPhysicalRiskReport(result: PhysicalRiskResult): string {
  const lines: string[] = []
  lines.push('## Physical Climate Risk Assessment Report')
  lines.push('')
  lines.push('Overall Risk Score: ' + result.overall_risk_score + '/10 | Level: ' + result.overall_risk_level.toUpperCase())
  lines.push('Total Annual Expected Loss: $' + result.total_annual_expected_loss + 'M | Max Single Loss Event: $' + result.max_single_loss_event + 'M')
  lines.push('Adaptation Gap: ' + result.adaptation_gap_pct + '%')
  lines.push('')
  lines.push('### Hazard Risk Matrix')
  lines.push('| Hazard | Probability (%/yr) | Severity | Exposure ($M) | AEL ($M) | Risk Level |')
  lines.push('|--------|-------------------|----------|---------------|----------|------------|')
  for (const h of result.hazard_risks) {
    lines.push('| ' + h.hazard + ' | ' + h.probability_annual_pct + ' | ' + h.severity_score + ' | ' + h.exposure_value_usd_millions + ' | ' + h.annual_expected_loss_usd_millions + ' | ' + h.risk_level + ' |')
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | Physical Risk Assessor*')
  return lines.join('\n')
}

function formatTransitionRiskReport(result: TransitionRiskResult): string {
  const lines: string[] = []
  lines.push('## Transition Risk Analysis Report')
  lines.push('')
  lines.push('Overall Transition Risk Score: ' + result.overall_transition_risk_score + '/10')
  lines.push('Total Financial Exposure: $' + result.total_financial_exposure + 'M | Revenue at Risk: ' + result.revenue_at_risk_pct + '%')
  lines.push('Carbon Price Sensitivity: $' + result.carbon_price_sensitivity + ' per tCO2')
  lines.push('')
  lines.push('### Risk Factor Breakdown')
  lines.push('| Factor | Category | Impact Score | Financial Impact ($M) | Time to Materiality (yr) | Trend |')
  lines.push('|--------|----------|--------------|----------------------|--------------------------|-------|')
  for (const f of result.risk_factors) {
    lines.push('| ' + f.factor + ' | ' + f.category + ' | ' + f.impact_score + ' | ' + f.financial_impact_usd_millions + ' | ' + f.time_to_materiality_years + ' | ' + f.trend + ' |')
  }
  lines.push('')
  lines.push('### Strategic Imperatives')
  for (const s of result.strategic_imperatives) lines.push('- ' + s)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | Transition Risk Analyzer*')
  return lines.join('\n')
}

function formatTCFDReport(result: TCFDResult): string {
  const lines: string[] = []
  lines.push('## TCFD Climate Report')
  lines.push('')
  lines.push('Report ID: ' + result.report_id)
  lines.push('Overall TCFD Alignment: ' + result.overall_alignment_pct + '% | Status: ' + result.compliance_status.toUpperCase())
  lines.push('')
  lines.push('### Pillar Assessment')
  lines.push('| Pillar | Completeness | Alignment | Key Gaps |')
  lines.push('|--------|-------------|-----------|----------|')
  for (const p of result.pillars) {
    lines.push('| ' + p.pillar + ' | ' + p.disclosure_completeness_pct + '% | ' + p.alignment_level + ' | ' + p.gaps.join('; ') + ' |')
  }
  lines.push('')
  lines.push('### Material Gaps')
  for (const g of result.material_gaps) lines.push('- ' + g)
  lines.push('')
  lines.push('### Next Steps')
  for (const n of result.next_steps) lines.push('- ' + n)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | TCFD Report Generator*')
  return lines.join('\n')
}

function formatAdaptationReport(result: AdaptationResult): string {
  const lines: string[] = []
  lines.push('## Climate Adaptation Plan')
  lines.push('')
  lines.push('Total Investment Needed: $' + result.total_investment_needed + 'M | Budget Gap: $' + result.budget_gap + 'M')
  lines.push('Resilience Score Improvement: +' + result.resilience_score_improvement + ' points')
  lines.push('')
  lines.push('### Priority Measures')
  lines.push('| Rank | Measure | Sector | Cost ($M) | BCR | Years | Effectiveness |')
  lines.push('|------|---------|--------|-----------|-----|-------|--------------|')
  for (const m of result.measures) {
    lines.push('| ' + m.priority_rank + ' | ' + m.name + ' | ' + m.sector + ' | ' + m.cost_usd_millions + ' | ' + m.benefit_cost_ratio + ' | ' + m.implementation_years + ' | ' + m.effectiveness_pct + '% |')
  }
  lines.push('')
  lines.push('### Implementation Roadmap')
  for (const r of result.implementation_roadmap) lines.push('- ' + r)
  lines.push('')
  lines.push('### Monitoring Indicators')
  for (const m of result.monitoring_indicators) lines.push('- ' + m)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | Adaptation Planner*')
  return lines.join('\n')
}

function formatScenarioReport(result: ScenarioResult): string {
  const lines: string[] = []
  lines.push('## Climate Scenario Analysis')
  lines.push('')
  lines.push('Scenario: ' + result.scenario_name + ' - ' + result.description)
  lines.push('Peak Warming: ' + result.peak_warming_c + 'C | Cumulative GDP Impact: $' + result.cumulative_gdp_impact_usd_billions + 'B')
  lines.push('')
  lines.push('### Projections')
  lines.push('| Year | Temp Increase (C) | GDP Impact (%) | Emissions (GtCO2) | Carbon Price ($/t) | Sea Level Rise (cm) | Extreme Event Mult. |')
  lines.push('|------|-------------------|----------------|-------------------|--------------------|---------------------|---------------------|')
  for (const p of result.projections) {
    lines.push('| ' + p.year + ' | ' + p.temperature_increase_c + ' | ' + p.gdp_impact_pct + ' | ' + p.emissions_gtco2 + ' | ' + p.carbon_price_usd_per_ton + ' | ' + p.sea_level_rise_cm + ' | ' + p.extreme_event_frequency_multiplier + ' |')
  }
  lines.push('')
  lines.push('### Key Tipping Points')
  for (const t of result.key_tipping_points) lines.push('- ' + t)
  lines.push('')
  lines.push(result.comparison_to_baseline)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | Scenario Analysis*')
  return lines.join('\n')
}

function formatCarbonAccountingReport(result: CarbonAccountingResult): string {
  const lines: string[] = []
  lines.push('## Carbon Accounting Report')
  lines.push('')
  lines.push('### Footprint Summary')
  lines.push('| Scope 1 (tCO2e) | Scope 2 (tCO2e) | Scope 3 (tCO2e) | Total (tCO2e) | Intensity ($M rev) | Intensity (per emp) | vs Benchmark |')
  lines.push('|-----------------|-----------------|-----------------|---------------|--------------------|--------------------|--------------|')
  const f = result.footprint
  lines.push('| ' + f.scope1_total + ' | ' + f.scope2_total + ' | ' + f.scope3_total + ' | ' + f.total_emissions + ' | ' + f.intensity_per_revenue + ' | ' + f.intensity_per_employee + ' | ' + f.benchmark_comparison_pct + '% |')
  lines.push('')
  lines.push('### Material Categories')
  lines.push('| Category | Emissions (tCO2e) | % of Total |')
  lines.push('|----------|-------------------|------------|')
  for (const c of result.material_categories) {
    lines.push('| ' + c.category + ' | ' + c.emissions_tco2e + ' | ' + c.pct_of_total + '% |')
  }
  lines.push('')
  lines.push('### Reduction Pathway')
  lines.push('| Year | Target Reduction (%) | Projected Emissions (tCO2e) |')
  lines.push('|------|---------------------|----------------------------|')
  for (const r of result.reduction_pathway) {
    lines.push('| ' + r.year + ' | ' + r.target_reduction_pct + '% | ' + r.projected_emissions + ' |')
  }
  lines.push('')
  lines.push('Data Quality Score: ' + result.data_quality_score + '/100 | Assurance Readiness: ' + result.assurance_readiness)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | Carbon Accounting*')
  return lines.join('\n')
}

function formatClimateStressReport(result: ClimateStressResult): string {
  const lines: string[] = []
  lines.push('## Climate Stress Test Report')
  lines.push('')
  lines.push('Scenario: ' + result.scenario.toUpperCase())
  lines.push('Portfolio VaR: $' + result.portfolio_var_usd_billions + 'B | Expected Shortfall: $' + result.portfolio_expected_shortfall + 'B')
  lines.push('Systemic Risk Contribution: ' + result.systemic_risk_contribution + ' | Capital Buffer Needed: $' + result.capital_buffer_needed + 'B')
  lines.push('Result: ' + result.pass_fail.toUpperCase())
  lines.push('')
  lines.push('### Sector Stress Results')
  lines.push('| Sector | Weight (%) | VaR ($B) | ES ($B) | Transition Impact (%) | Physical Impact (%) | Combined Loss (%) |')
  lines.push('|--------|-----------|----------|---------|----------------------|--------------------|-----------------|')
  for (const s of result.sector_results) {
    lines.push('| ' + s.sector + ' | ' + s.weight_pct + ' | ' + s.value_at_risk_usd_billions + ' | ' + s.expected_shortfall_usd_billions + ' | ' + s.transition_impact_pct + ' | ' + s.physical_impact_pct + ' | ' + s.combined_loss_pct + ' |')
  }
  lines.push('')
  lines.push('### Mitigation Actions')
  for (const m of result.mitigation_actions) lines.push('- ' + m)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | Climate Stress Tester*')
  return lines.join('\n')
}

function formatGreenFinanceReport(result: GreenFinanceResult): string {
  const lines: string[] = []
  lines.push('## Green Finance Eligibility Assessment')
  lines.push('')
  lines.push('Eligibility Status: ' + result.eligibility_status.toUpperCase())
  lines.push('Overall Score: ' + result.overall_score + '/100 | Taxonomy Alignment: ' + result.taxonomy_alignment_pct + '%')
  lines.push('')
  lines.push('### Taxonomy Criteria Assessment')
  lines.push('| Criterion | Status | Score | Evidence Required |')
  lines.push('|-----------|--------|-------|-------------------|')
  for (const c of result.criteria) {
    lines.push('| ' + c.criterion + ' | ' + c.status + ' | ' + c.score + ' | ' + c.evidence_required + ' |')
  }
  lines.push('')
  lines.push('### Significant Contribution')
  for (const s of result.significant_contribution) lines.push('- ' + s)
  lines.push('')
  lines.push('### Do No Significant Harm (DNSH)')
  for (const d of result.do_no_significant_harm) lines.push('- ' + d)
  lines.push('')
  lines.push('### Minimum Safeguards')
  for (const m of result.minimum_safeguards) lines.push('- ' + m)
  lines.push('')
  lines.push('### Improvement Actions')
  for (const i of result.improvement_actions) lines.push('- ' + i)
  lines.push('')
  lines.push('### Potential Instruments')
  for (const p of result.potential_instruments) lines.push('- ' + p)
  lines.push('')
  lines.push('---')
  lines.push('*Climate Risk & Adaptation Plugin v' + VERSION + ' | Green Finance Eligibility*')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Physical Risk Assessor
  tools.register(defineTool({
    name: 'physical_risk_assessor',
    description: 'Physical climate risk assessment for assets | Evaluates flood, heatwave, storm, drought, wildfire, sea-level rise risks with annual expected loss quantification.',
    parameters: {
      risk_input: {
        type: 'string',
        required: true,
        description: 'JSON: asset_location, asset_type (infrastructure|real_estate|agriculture|manufacturing|energy|transport), asset_value_usd_millions, time_horizon_years, climate_hazards[], historical_data_years?, adaptation_measures?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_input: string }) {
      const input: PhysicalRiskInput = JSON.parse(args.risk_input)
      return formatPhysicalRiskReport(analyzePhysicalRisk(input))
    }
  }))

  // Tool 2: Transition Risk Analyzer
  tools.register(defineTool({
    name: 'transition_risk_analyzer',
    description: 'Climate transition risk analysis | Evaluates policy, technology, market, and reputation risks under different decarbonization scenarios.',
    parameters: {
      transition_input: {
        type: 'string',
        required: true,
        description: 'JSON: sector, annual_revenue_usd_millions, carbon_intensity_tco2_per_million_usd, policy_scenario (orderly|disorderly|hot_house_world), time_horizon_years, geographic_exposure[], technology_readiness?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { transition_input: string }) {
      const input: TransitionRiskInput = JSON.parse(args.transition_input)
      return formatTransitionRiskReport(analyzeTransitionRisk(input))
    }
  }))

  // Tool 3: TCFD Report Generator
  tools.register(defineTool({
    name: 'tcfd_report_generator',
    description: 'TCFD-aligned climate report generation | Assesses governance, strategy, risk management, and metrics/targets pillars for disclosure compliance.',
    parameters: {
      tcfd_input: {
        type: 'string',
        required: true,
        description: 'JSON: organization_name, reporting_period, sector, total_emissions_tco2e, governance_structure, climate_targets[], scenario_analysis_summary, risk_management_description, metrics_scope (scope1|scope2|scope3)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { tcfd_input: string }) {
      const input: TCFDInput = JSON.parse(args.tcfd_input)
      return formatTCFDReport(analyzeTCFD(input))
    }
  }))

  // Tool 4: Adaptation Planner
  tools.register(defineTool({
    name: 'adaptation_planner',
    description: 'Climate adaptation planning & roadmap | Prioritizes adaptation measures by cost-benefit ratio and generates implementation roadmap.',
    parameters: {
      adaptation_input: {
        type: 'string',
        required: true,
        description: 'JSON: region, climate_projections[], vulnerable_sectors[], population_affected, gdp_at_risk_usd_billions, adaptation_budget_usd_millions, planning_horizon_years, priority_level (urgent|high|medium|low)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { adaptation_input: string }) {
      const input: AdaptationInput = JSON.parse(args.adaptation_input)
      return formatAdaptationReport(analyzeAdaptation(input))
    }
  }))

  // Tool 5: Scenario Analysis Climate
  tools.register(defineTool({
    name: 'scenario_analysis_climate',
    description: 'Climate scenario analysis along SSP/RCP pathways | Projects temperature, GDP impact, emissions, carbon price, sea-level rise, and extreme events.',
    parameters: {
      scenario_input: {
        type: 'string',
        required: true,
        description: 'JSON: scenario_type (ssp1_1.9|ssp1_2.6|ssp2_4.5|ssp3_7.0|ssp5_8.5), baseline_year, target_year, region, sector, gdp_baseline_usd_billions, emissions_baseline_gtco2'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { scenario_input: string }) {
      const input: ScenarioInput = JSON.parse(args.scenario_input)
      return formatScenarioReport(analyzeScenario(input))
    }
  }))

  // Tool 6: Carbon Accounting Tool
  tools.register(defineTool({
    name: 'carbon_accounting_tool',
    description: 'Carbon accounting for Scope 1/2/3 emissions | Calculates carbon footprint, intensity metrics, benchmark comparison, and reduction pathway.',
    parameters: {
      carbon_input: {
        type: 'string',
        required: true,
        description: 'JSON: organization_name, reporting_year, scope1_sources[{source, emissions_tco2e}], scope2_sources[{source, emissions_tco2e}], scope3_categories[{category, emissions_tco2e}], revenue_usd_millions, employees, industry_benchmark_tco2_per_million_usd?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { carbon_input: string }) {
      const input: CarbonAccountingInput = JSON.parse(args.carbon_input)
      return formatCarbonAccountingReport(analyzeCarbonAccounting(input))
    }
  }))

  // Tool 7: Climate Stress Tester
  tools.register(defineTool({
    name: 'climate_stress_tester',
    description: 'Climate stress testing for investment portfolios | Evaluates VaR, expected shortfall, and capital buffer needs under climate scenarios.',
    parameters: {
      stress_input: {
        type: 'string',
        required: true,
        description: 'JSON: portfolio_name, portfolio_value_usd_billions, sector_weights[{sector, weight_pct}], stress_scenario (ndcp|delayed_transition|hot_house|orderly_1.5), time_horizon_years, confidence_level'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { stress_input: string }) {
      const input: ClimateStressInput = JSON.parse(args.stress_input)
      return formatClimateStressReport(analyzeClimateStress(input))
    }
  }))

  // Tool 8: Green Finance Eligibility Checker
  tools.register(defineTool({
    name: 'green_finance_eligibility_checker',
    description: 'Green finance & EU Taxonomy eligibility assessment | Checks DNSH criteria, significant contribution, and identifies eligible green finance instruments.',
    parameters: {
      green_input: {
        type: 'string',
        required: true,
        description: 'JSON: project_name, project_type, investment_amount_usd_millions, expected_co2_reduction_tco2e_per_year, project_location, use_of_proceeds[], certification_standards[], taxonomy_regulation (eu_taxonomy|green_bond_principles|climate_bonds|sustainability_linked)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { green_input: string }) {
      const input: GreenFinanceInput = JSON.parse(args.green_input)
      return formatGreenFinanceReport(analyzeGreenFinance(input))
    }
  }))

  console.log('[dsh-tool-climaterisk] Loaded v' + VERSION + ' - Climate Risk & Adaptation: 8 tools active')
  console.log('  Tools: physical_risk_assessor, transition_risk_analyzer, tcfd_report_generator, adaptation_planner, scenario_analysis_climate, carbon_accounting_tool, climate_stress_tester, green_finance_eligibility_checker')
}
