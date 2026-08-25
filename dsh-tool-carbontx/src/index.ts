/**
 * DSH Carbon Credit Trading & Emissions Accounting Plugin v0.1.0
 *
 * Comprehensive carbon market trading, emissions accounting, and climate policy
 * toolkit for DeepSeek Harness Agent. Designed for carbon traders, sustainability
 * officers, ESG analysts, compliance managers, and climate policy advisors navigating
 * the global carbon markets and regulatory landscape.
 *
 * Market Context (2026):
 * - Global carbon markets exceed $1 trillion in combined value
 * - EU CBAM enters full implementation phase (2026-2034 phase-out of free allocation)
 * - SBTi-aligned net-zero pathways become standard corporate practice
 *
 * Features (v0.1.0):
 * 1. Emissions Inventory Builder    — Full GHG Protocol inventory with scope breakdown
 * 2. Credit Retirement Tracker      — Carbon credit retirement accounting and reconciliation
 * 3. Offset Portfolio Analyzer      — Multi-dimensional offset portfolio risk-return analysis
 * 4. Cap-and-Trade Optimizer        — Emissions trading strategy and allowance optimization
 * 5. Carbon Tax Scenario Modeler    — Multi-scenario carbon tax impact assessment
 * 6. Net-Zero Pathway Planner       — SBTi-aligned decarbonization trajectory planning
 * 7. ESG Carbon Reporter            — GRI/TCFD-aligned carbon disclosure generation
 * 8. CBAM Border Adjustment Assessor— EU Carbon Border Adjustment Mechanism exposure analysis
 *
 * @module dsh-tool-carbontx
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-carbontx'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '免责声明: 本分析基于AI模型推断与公开数据，仅供碳市场与气候政策参考，不替代专业碳核查、金融投资、税务和法律合规意见。碳价格预测、政策情景和合规策略具有固有不确定性，实际决策请咨询持牌专业顾问。'

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

// --- Tool 1: Emissions Inventory Builder ---
export interface EmissionsInventoryInput {
  entity_name: string
  reporting_year: number
  organizational_boundary: string
  operational_scope: string
  facilities: Array<{
    name: string
    location: string
    activity_data: number
    activity_unit: string
    emission_factor: number
    emission_factor_source: string
    scope: 'scope1' | 'scope2_location' | 'scope2_market' | 'scope3'
    gas_type: string
    data_quality: 'measured' | 'calculated' | 'estimated'
    gwp_factor: number
  }>
  revenue_usd: number
  production_output?: number
  production_unit?: string
  historical_inventory?: Array<{ year: number; total_tco2e: number; scope1: number; scope2: number; scope3: number }>
}

export interface ScopeBreakdown {
  scope1_direct: number
  scope2_location_based: number
  scope2_market_based: number
  scope3_value_chain: number
  total_location_based: number
  total_market_based: number
}

export interface GasBreakdown {
  co2_tons: number
  ch4_tons_co2e: number
  n2o_tons_co2e: number
  fgas_tons_co2e: number
  other_tons_co2e: number
}

export interface IntensityMetric {
  per_revenue: number
  per_production: number
  unit_revenue: string
  unit_production: string
}

export interface DataQualityScore {
  measured_pct: number
  calculated_pct: number
  estimated_pct: number
  overall_rating: string
  confidence_level: string
}

export interface EmissionsInventoryResult {
  entity_name: string
  reporting_year: number
  total_emissions_tco2e: number
  scope_breakdown: ScopeBreakdown
  gas_breakdown: GasBreakdown
  intensity_metrics: IntensityMetric
  data_quality: DataQualityScore
  top_emission_sources: Array<{ facility: string; scope: string; tco2e: number; pct: number }>
  trend_analysis: string
  ghg_protocol_compliance: string
  recommendations: string[]
}

// --- Tool 2: Credit Retirement Tracker ---
export interface CreditRetirementInput {
  account_holder: string
  reporting_period: string
  credit_holdings: Array<{
    credit_id: string
    standard: string
    project_type: string
    vintage_year: number
    quantity_tons: number
    acquisition_price_usd: number
    registry: string
    serial_number: string
    status: 'active' | 'retired' | 'transferred'
  }>
  retirement_records: Array<{
    retirement_id: string
    credit_id: string
    quantity_tons: number
    retirement_date: string
    beneficiary: string
    purpose: string
    verification_status: string
  }>
  compliance_obligation_tons?: number
  target_retirement_year?: number
}

export interface RetirementSummary {
  total_credits_held: number
  total_credits_retired: number
  total_credits_remaining: number
  retirement_rate_pct: number
  avg_retirement_price: number
  total_retirement_value: number
}

export interface VintageDistribution {
  vintage_summary: Array<{ year: number; credits: number; pct: number }>
  avg_vintage: number
  vintage_risk: string
}

export interface CreditRetirementResult {
  account_holder: string
  reporting_period: string
  retirement_summary: RetirementSummary
  vintage_distribution: VintageDistribution
  standard_breakdown: Array<{ standard: string; credits: number; pct: number; avg_price: number }>
  compliance_status: string
  remaining_obligation: number
  retirement_schedule: Array<{ year: number; retired_tons: number; cumulative_tons: number }>
  cost_analysis: { total_acquisition_cost: number; avg_cost_per_ton: number; unrealized_value: number }
  recommendations: string[]
}

// --- Tool 3: Offset Portfolio Analyzer ---
export interface OffsetPortfolioInput {
  portfolio_name: string
  analysis_date: string
  holdings: Array<{
    standard: string
    project_type: string
    project_name: string
    vintage_year: number
    quantity_tons: number
    book_price_usd: number
    current_market_price_usd: number
    quality_score: number
    permanence_rating: 'high' | 'medium' | 'low'
    host_country: string
    sdgs: string[]
  }>
  market_benchmark_price: number
  risk_free_rate?: number
  target_offset_tons?: number
}

export interface PortfolioValuation {
  total_credits: number
  book_value_usd: number
  market_value_usd: number
  unrealized_gain_loss: number
  avg_book_price: number
  avg_market_price: number
}

export interface PortfolioRiskMetrics {
  quality_weighted_score: number
  permanence_risk_pct: number
  vintage_concentration_risk: string
  geographic_concentration_index: number
  standard_diversification_index: number
  overall_risk_rating: string
}

export interface OffsetPortfolioResult {
  portfolio_name: string
  analysis_date: string
  valuation: PortfolioValuation
  risk_metrics: PortfolioRiskMetrics
  project_type_allocation: Array<{ type: string; credits: number; pct: number; value_usd: number }>
  geographic_allocation: Array<{ country: string; credits: number; pct: number }>
  offset_achievement_pct: number
  market_premium_discount: number
  sdgs_covered: string[]
  recommendations: string[]
}

// --- Tool 4: Cap-and-Trade Optimizer ---
export interface CapTradeInput {
  entity_name: string
  compliance_period: string
  scheme: string
  allowance_allocation: number
  current_emissions_tco2e: number
  projected_emissions_tco2e: number
  allowance_price_usd: number
  offset_credit_limit_pct: number
  offset_credit_price_usd: number
  banking_allowed: boolean
  borrowing_allowed: boolean
  historical_prices: number[]
  forward_curve?: Array<{ period: number; price: number }>
}

export interface AllowancePosition {
  allocated: number
  required: number
  surplus_deficit: number
  offset_eligible: number
  net_position: number
}

export interface TradingStrategy {
  action: string
  quantity_tons: number
  estimated_cost_usd: number
  timing: string
  rationale: string
}

export interface CapTradeResult {
  entity_name: string
  compliance_period: string
  scheme: string
  allowance_position: AllowancePosition
  trading_strategy: TradingStrategy
  compliance_cost_usd: number
  cost_per_tco2e: number
  market_risk_exposure: string
  offset_utilization_pct: number
  price_forecast: { direction: string; expected_price: number; volatility: string }
  recommendations: string[]
}

// --- Tool 5: Carbon Tax Scenario Modeler ---
export interface CarbonTaxInput {
  entity_name: string
  base_year: number
  base_year_emissions_tco2e: number
  projection_years: number
  annual_revenue_usd: number
  wacc: string
  tax_scenarios: Array<{
    name: string
    initial_rate_usd: number
    escalation_pct: number
    coverage_scope: string
    free_allocation_pct: number
    border_adjustment: boolean
  }>
  abatement_options?: Array<{ name: string; cost_per_ton: number; max_reduction_tons: number; implementation_year: number }>
}

export interface TaxScenarioResult {
  scenario_name: string
  total_tax_cost: number
  npv_tax_cost: number
  avg_effective_rate: number
  peak_annual_cost: number
  cost_as_pct_revenue: number
}

export interface AbatementAnalysis {
  option_name: string
  investment_cost: number
  annual_savings: number
  payback_years: number
  npv_benefit: number
  roi_pct: number
}

export interface CarbonTaxResult {
  entity_name: string
  base_year: number
  projection_horizon: string
  scenario_results: TaxScenarioResult[]
  optimal_scenario: string
  abatement_analysis: AbatementAnalysis[]
  total_abatement_investment: number
  net_benefit_vs_baseline: number
  marginal_abatement_cost: string
  recommendations: string[]
}

// --- Tool 6: Net-Zero Pathway Planner ---
export interface NetZeroPathwayInput {
  organization: string
  baseline_year: number
  baseline_emissions_tco2e: number
  target_year: number
  target_type: 'net_zero' | 'carbon_neutral' | 'science_based_1.5' | 'science_based_well_below_2'
  interim_target_year?: number
  interim_target_pct?: number
  annual_revenue_usd: number
  wacc: string
  industry_sector: string
  scope3_included: boolean
  offset_strategy: 'minimal' | 'moderate' | 'heavy'
  carbon_price_assumption: number
}

export interface PathwayTrajectory {
  year: number
  absolute_emissions: number
  reduction_from_baseline: number
  reduction_pct: number
  offset_needed: number
  cumulative_abatement: number
}

export interface MilestoneCheckpoint {
  year: number
  target_reduction_pct: number
  actual_reduction_pct: number
  status: 'on_track' | 'at_risk' | 'off_track'
  gap_tco2e: number
}

export interface NetZeroPathwayResult {
  organization: string
  pathway_summary: {
    baseline_year: number
    baseline_emissions_tco2e: number
    target_year: number
    target_type: string
    total_reduction_required: number
    annual_reduction_rate: number
  }
  trajectory: PathwayTrajectory[]
  milestones: MilestoneCheckpoint[]
  total_investment_usd: number
  annual_offset_costs: Array<{ year: number; offset_tons: number; cost_usd: number }>
  sbti_alignment_status: string
  key_risks: string[]
  recommendations: string[]
}

// --- Tool 7: ESG Carbon Reporter ---
export interface ESGCarbonInput {
  entity_name: string
  reporting_period: string
  framework: 'GRI' | 'TCFD' | 'CDP' | 'ISSB' | 'Combined'
  emissions_data: {
    scope1_tco2e: number
    scope2_location_tco2e: number
    scope2_market_tco2e: number
    scope3_total_tco2e: number
    scope3_categories: Array<{ category: string; tco2e: number }>
  }
  energy_consumption_mwh: number
  renewable_energy_pct: number
  carbon_credits_purchased: number
  carbon_credits_retired: number
  climate_targets: Array<{ target: string; deadline: string; progress_pct: number }>
  governance_structure: string
  industry_sector: string
  revenue_usd: number
  employee_count: number
}

export interface ESGDisclosureScore {
  gri_alignment_pct: number
  tcfd_alignment_pct: number
  cdp_readiness_pct: number
  overall_score: number
  rating: string
}

export interface BenchmarkComparison {
  sector_avg_intensity: number
  entity_intensity: number
  percentile_rank: number
  comparison_result: string
}

export interface ESGCarbonResult {
  entity_name: string
  reporting_period: string
  framework: string
  disclosure_score: ESGDisclosureScore
  emissions_summary: { scope1: number; scope2: number; scope3: number; total: number }
  intensity_metrics: { per_revenue: number; per_employee: number; unit: string }
  benchmark_comparison: BenchmarkComparison
  target_progress: Array<{ target: string; deadline: string; progress_pct: number; status: string }>
  material_topics: string[]
  gaps_identified: string[]
  recommendations: string[]
}

// --- Tool 8: Carbon Border Adjustment Assessor ---
export interface CBAMInput {
  importer_name: string
  reporting_period: string
  scheme: 'EU_CBAM' | 'UK_CBAM' | 'Proposed_Import_Tariff'
  imported_goods: Array<{
    product_category: string
    hs_code: string
    origin_country: string
    quantity_tons: number
    embedded_emissions_tco2e_per_ton: number
    embedded_emissions_total: number
    cbam_relevant: boolean
  }>
  eu_carbon_price_eur: number
  domestic_carbon_price_eur: number
  free_allocation_factor: number
  exchange_rate_eur_usd: number
  compliance_costs?: Array<{ cost_type: string; amount_eur: number }>
}

export interface CBAMExposure {
  total_imports_tons: number
  cbam_relevant_tons: number
  total_embedded_emissions: number
  cbam_relevant_emissions: number
  exposure_pct: number
}

export interface CBAMLiability {
  gross_cbam_cost_eur: number
  free_allocation_deduction: number
  domestic_carbon_credit: number
  net_cbam_liability_eur: number
  net_cbam_liability_usd: number
  effective_rate_per_ton: number
}

export interface CBAMResult {
  importer_name: string
  reporting_period: string
  scheme: string
  exposure: CBAMExposure
  liability: CBAMLiability
  product_breakdown: Array<{ product: string; origin: string; emissions: number; cbam_cost_eur: number; share_pct: number }>
  origin_breakdown: Array<{ country: string; emissions: number; cbam_cost_eur: number; share_pct: number }>
  phase_in_impact: string
  trade_risk_assessment: string
  recommendations: string[]
}

// ==================== SECTION 3 — Analyze Functions ====================

// Tool 1: Emissions Inventory Builder
function analyzeEmissionsInventory(input: EmissionsInventoryInput, rng: SeededRandom): EmissionsInventoryResult {
  const facilities = input.facilities
  let scope1 = 0, scope2Loc = 0, scope2Mkt = 0, scope3 = 0
  let co2 = 0, ch4 = 0, n2o = 0, fgas = 0, other = 0
  let measuredCount = 0, calcCount = 0, estCount = 0

  const facilityEmissions: Array<{ facility: string; scope: string; tco2e: number }> = []

  for (const f of facilities) {
    const emissions = f.activity_data * f.emission_factor * f.gwp_factor
    const scopeKey = f.scope

    if (scopeKey === 'scope1') scope1 += emissions
    else if (scopeKey === 'scope2_location') scope2Loc += emissions
    else if (scopeKey === 'scope2_market') scope2Mkt += emissions
    else if (scopeKey === 'scope3') scope3 += emissions

    if (f.gas_type === 'CO2') co2 += emissions
    else if (f.gas_type === 'CH4') ch4 += emissions
    else if (f.gas_type === 'N2O') n2o += emissions
    else if (['HFCs', 'PFCs', 'SF6', 'NF3'].includes(f.gas_type)) fgas += emissions
    else other += emissions

    if (f.data_quality === 'measured') measuredCount++
    else if (f.data_quality === 'calculated') calcCount++
    else estCount++

    facilityEmissions.push({ facility: f.name, scope: scopeKey, tco2e: Math.round(emissions * 100) / 100 })
  }

  const totalLoc = scope1 + scope2Loc + scope3
  const totalMkt = scope1 + scope2Mkt + scope3
  const total = totalMkt

  const totalFacilities = facilities.length
  const measuredPct = totalFacilities > 0 ? Math.round((measuredCount / totalFacilities) * 100) : 0
  const calcPct = totalFacilities > 0 ? Math.round((calcCount / totalFacilities) * 100) : 0
  const estPct = totalFacilities > 0 ? Math.round((estCount / totalFacilities) * 100) : 0

  const overallRating = measuredPct >= 60 ? '良好' : measuredPct + calcPct >= 75 ? '中等' : '需改进'
  const confidence = measuredPct >= 70 ? '高置信度(>70%实测数据)' : measuredPct >= 40 ? '中等置信度(40-70%实测数据)' : '低置信度(<40%实测数据)'

  const perRevenue = input.revenue_usd > 0 ? total / (input.revenue_usd / 1e6) : 0
  const perProduction = input.production_output && input.production_output > 0 ? total / input.production_output : 0

  const sortedFacilities = [...facilityEmissions].sort((a, b) => b.tco2e - a.tco2e)
  const topSources = sortedFacilities.slice(0, Math.min(5, sortedFacilities.length)).map(f => ({
    facility: f.facility,
    scope: f.scope,
    tco2e: f.tco2e,
    pct: total > 0 ? Math.round((f.tco2e / total) * 1000) / 10 : 0
  }))

  let trendAnalysis = '当前年度数据已记录，无历史对比数据'
  if (input.historical_inventory && input.historical_inventory.length >= 2) {
    const sorted = [...input.historical_inventory].sort((a, b) => a.year - b.year)
    const latest = sorted[sorted.length - 1]
    const prev = sorted[sorted.length - 2]
    const change = prev.total_tco2e > 0 ? ((latest.total_tco2e - prev.total_tco2e) / prev.total_tco2e) * 100 : 0
    if (change > 5) trendAnalysis = '排放呈上升趋势(+' + change.toFixed(1) + '%): 需加强减排措施，识别增长驱动因素'
    else if (change < -5) trendAnalysis = '排放呈下降趋势(' + change.toFixed(1) + '%): 减排措施见效，建议持续优化'
    else trendAnalysis = '排放基本持平(' + (change >= 0 ? '+' : '') + change.toFixed(1) + '%): 需进一步推动减排行动'
  }

  const recommendations: string[] = []
  if (estPct > 30) recommendations.push('提升数据质量: ' + estPct + '%的排放源使用估算数据，建议部署连续监测系统(CEMS)或采用更精确的排放因子')
  recommendations.push('优先针对Top 3排放源(' + topSources.slice(0, 3).map(s => s.facility).join('、') + ')制定减排方案')
  if (scope3 > total * 0.6) recommendations.push('Scope 3占比超过60%: 建议开展供应链碳足迹评估，与关键供应商建立减排合作机制')
  recommendations.push('建立年度排放清单编制流程，确保符合GHG Protocol企业标准要求')
  recommendations.push('考虑获取ISO 14064-1第三方核查以增强数据可信度和市场认可度')
  if (input.historical_inventory && input.historical_inventory.length < 3) recommendations.push('积累历史数据(建议至少3年)以建立可靠的排放趋势基线')

  return {
    entity_name: input.entity_name,
    reporting_year: input.reporting_year,
    total_emissions_tco2e: Math.round(total * 100) / 100,
    scope_breakdown: {
      scope1_direct: Math.round(scope1 * 100) / 100,
      scope2_location_based: Math.round(scope2Loc * 100) / 100,
      scope2_market_based: Math.round(scope2Mkt * 100) / 100,
      scope3_value_chain: Math.round(scope3 * 100) / 100,
      total_location_based: Math.round(totalLoc * 100) / 100,
      total_market_based: Math.round(totalMkt * 100) / 100
    },
    gas_breakdown: {
      co2_tons: Math.round(co2 * 100) / 100,
      ch4_tons_co2e: Math.round(ch4 * 100) / 100,
      n2o_tons_co2e: Math.round(n2o * 100) / 100,
      fgas_tons_co2e: Math.round(fgas * 100) / 100,
      other_tons_co2e: Math.round(other * 100) / 100
    },
    intensity_metrics: {
      per_revenue: Math.round(perRevenue * 100) / 100,
      per_production: Math.round(perProduction * 100) / 100,
      unit_revenue: 'tCO2e/MUSD',
      unit_production: 'tCO2e/' + (input.production_unit || 'unit')
    },
    data_quality: {
      measured_pct: measuredPct,
      calculated_pct: calcPct,
      estimated_pct: estPct,
      overall_rating: overallRating,
      confidence_level: confidence
    },
    top_emission_sources: topSources,
    trend_analysis: trendAnalysis,
    ghg_protocol_compliance: '核算方法符合GHG Protocol企业标准(Scope 1/2/3全覆盖)，组织边界采用' + input.organizational_boundary + '法',
    recommendations
  }
}

// Tool 2: Credit Retirement Tracker
function analyzeCreditRetirement(input: CreditRetirementInput, rng: SeededRandom): CreditRetirementResult {
  const holdings = input.credit_holdings
  const retirements = input.retirement_records

  const totalHeld = holdings.reduce((s, h) => s + h.quantity_tons, 0)
  const totalRetired = retirements.reduce((s, r) => s + r.quantity_tons, 0)
  const totalRemaining = totalHeld - totalRetired
  const retirementRate = totalHeld > 0 ? Math.round((totalRetired / totalHeld) * 1000) / 10 : 0

  const totalRetirementValue = retirements.reduce((s, r) => {
    const holding = holdings.find(h => h.credit_id === r.credit_id)
    return s + r.quantity_tons * (holding?.acquisition_price_usd || 0)
  }, 0)
  const avgRetirementPrice = totalRetired > 0 ? Math.round((totalRetirementValue / totalRetired) * 100) / 100 : 0

  const totalAcquisitionCost = holdings.reduce((s, h) => s + h.quantity_tons * h.acquisition_price_usd, 0)
  const avgCostPerTon = totalHeld > 0 ? Math.round((totalAcquisitionCost / totalHeld) * 100) / 100 : 0

  // Vintage distribution
  const vintageMap = new Map<number, number>()
  for (const h of holdings) {
    vintageMap.set(h.vintage_year, (vintageMap.get(h.vintage_year) || 0) + h.quantity_tons)
  }
  const vintageSummary = Array.from(vintageMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, credits]) => ({
      year,
      credits,
      pct: totalHeld > 0 ? Math.round((credits / totalHeld) * 1000) / 10 : 0
    }))
  const avgVintage = holdings.length > 0
    ? Math.round(holdings.reduce((s, h) => s + h.vintage_year * h.quantity_tons, 0) / totalHeld)
    : 0
  const vintageRisk = avgVintage < 2020 ? '老旧Vintage风险: 平均vintage ' + avgVintage + '，部分市场接受度受限' :
    avgVintage < 2023 ? '中等Vintage: 平均vintage ' + avgVintage + '，建议逐步置换为近期信用' :
    '良好Vintage: 平均vintage ' + avgVintage + '，市场流动性强'

  // Standard breakdown
  const standardMap = new Map<string, { credits: number; totalPrice: number }>()
  for (const h of holdings) {
    const existing = standardMap.get(h.standard) || { credits: 0, totalPrice: 0 }
    existing.credits += h.quantity_tons
    existing.totalPrice += h.quantity_tons * h.acquisition_price_usd
    standardMap.set(h.standard, existing)
  }
  const standardBreakdown = Array.from(standardMap.entries()).map(([standard, data]) => ({
    standard,
    credits: data.credits,
    pct: totalHeld > 0 ? Math.round((data.credits / totalHeld) * 1000) / 10 : 0,
    avg_price: data.credits > 0 ? Math.round((data.totalPrice / data.credits) * 100) / 100 : 0
  }))

  // Compliance status
  const obligation = input.compliance_obligation_tons || 0
  const remaining = Math.max(0, obligation - totalRetired)
  const complianceStatus = obligation > 0
    ? (totalRetired >= obligation ? '合规: 已退役信用满足义务要求' :
       remaining < obligation * 0.1 ? '接近合规: 剩余义务' + remaining + '吨(<10%)' :
       '未合规: 仍需退役' + remaining + '吨以满足义务')
    : '无明确合规义务设定'

  // Retirement schedule
  const scheduleMap = new Map<number, number>()
  for (const r of retirements) {
    const year = new Date(r.retirement_date).getFullYear()
    scheduleMap.set(year, (scheduleMap.get(year) || 0) + r.quantity_tons)
  }
  const retirementSchedule = Array.from(scheduleMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, tons]) => ({ year, retired_tons: tons, cumulative_tons: 0 }))
  let cumulative = 0
  for (const entry of retirementSchedule) {
    cumulative += entry.retired_tons
    entry.cumulative_tons = cumulative
  }

  const recommendations: string[] = []
  if (obligation > 0 && remaining > 0) {
    recommendations.push('合规优先: 仍需退役' + remaining + '吨信用以满足义务，建议优先使用低成本信用')
  }
  if (avgVintage < 2022) {
    recommendations.push('Vintage优化: 考虑将老旧信用置换为vintage >= 2022的近期信用，提升市场接受度')
  }
  if (retirementRate < 30 && totalHeld > 0) {
    recommendations.push('退役进度: 当前退役率仅' + retirementRate + '%，建议制定明确的退役时间表')
  }
  recommendations.push('建立信用退役台账，确保每笔退役可追溯、可验证、可审计')
  recommendations.push('关注注册系统退役规则变化，确保退役操作符合最新合规要求')
  if (standardBreakdown.length < 3) {
    recommendations.push('标准多元化: 当前仅' + standardBreakdown.length + '个标准，建议增加配置以降低集中风险')
  }

  return {
    account_holder: input.account_holder,
    reporting_period: input.reporting_period,
    retirement_summary: {
      total_credits_held: totalHeld,
      total_credits_retired: totalRetired,
      total_credits_remaining: totalRemaining,
      retirement_rate_pct: retirementRate,
      avg_retirement_price: avgRetirementPrice,
      total_retirement_value: Math.round(totalRetirementValue)
    },
    vintage_distribution: {
      vintage_summary: vintageSummary,
      avg_vintage: avgVintage,
      vintage_risk: vintageRisk
    },
    standard_breakdown: standardBreakdown,
    compliance_status: complianceStatus,
    remaining_obligation: remaining,
    retirement_schedule: retirementSchedule,
    cost_analysis: {
      total_acquisition_cost: Math.round(totalAcquisitionCost),
      avg_cost_per_ton: avgCostPerTon,
      unrealized_value: Math.round(totalRemaining * avgCostPerTon)
    },
    recommendations
  }
}

// Tool 3: Offset Portfolio Analyzer
function analyzeOffsetPortfolio(input: OffsetPortfolioInput, rng: SeededRandom): OffsetPortfolioResult {
  const holdings = input.holdings

  const totalCredits = holdings.reduce((s, h) => s + h.quantity_tons, 0)
  const bookValue = holdings.reduce((s, h) => s + h.quantity_tons * h.book_price_usd, 0)
  const marketValue = holdings.reduce((s, h) => s + h.quantity_tons * h.current_market_price_usd, 0)
  const unrealizedGL = marketValue - bookValue
  const avgBookPrice = totalCredits > 0 ? Math.round((bookValue / totalCredits) * 100) / 100 : 0
  const avgMarketPrice = totalCredits > 0 ? Math.round((marketValue / totalCredits) * 100) / 100 : 0

  // Quality weighted score
  const qualityWeighted = totalCredits > 0
    ? Math.round(holdings.reduce((s, h) => s + h.quality_score * h.quantity_tons, 0) / totalCredits)
    : 0

  // Permanence risk
  const lowPermanence = holdings.filter(h => h.permanence_rating === 'low').reduce((s, h) => s + h.quantity_tons, 0)
  const permanenceRiskPct = totalCredits > 0 ? Math.round((lowPermanence / totalCredits) * 100) : 0

  // Vintage concentration
  const vintageMap = new Map<number, number>()
  for (const h of holdings) vintageMap.set(h.vintage_year, (vintageMap.get(h.vintage_year) || 0) + h.quantity_tons)
  const maxVintageConcentration = Math.max(...Array.from(vintageMap.values()), 0)
  const vintageConcRisk = totalCredits > 0 && (maxVintageConcentration / totalCredits) > 0.5
    ? '高集中度: 单一vintage占比超过50%，建议分散配置'
    : 'Vintage分布合理'

  // Geographic concentration (HHI)
  const geoMap = new Map<string, number>()
  for (const h of holdings) geoMap.set(h.host_country, (geoMap.get(h.host_country) || 0) + h.quantity_tons)
  const geoHHI = totalCredits > 0
    ? Math.round(Array.from(geoMap.values()).reduce((s, v) => s + Math.pow(v / totalCredits, 2), 0) * 10000) / 10000
    : 0

  // Standard diversification
  const stdMap = new Map<string, number>()
  for (const h of holdings) stdMap.set(h.standard, (stdMap.get(h.standard) || 0) + h.quantity_tons)
  const stdDivIndex = Math.max(0, Math.round((1 - Array.from(stdMap.values()).reduce((s, v) => s + Math.pow(v / totalCredits, 2), 0)) * 100) / 100)

  const overallRisk = permanenceRiskPct > 30 ? '高风险' : qualityWeighted < 60 ? '中高风险' : geoHHI > 0.5 ? '中等风险' : '中低风险'

  // Project type allocation
  const typeMap = new Map<string, { credits: number; value: number }>()
  for (const h of holdings) {
    const existing = typeMap.get(h.project_type) || { credits: 0, value: 0 }
    existing.credits += h.quantity_tons
    existing.value += h.quantity_tons * h.current_market_price_usd
    typeMap.set(h.project_type, existing)
  }
  const typeAllocation = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    credits: data.credits,
    pct: totalCredits > 0 ? Math.round((data.credits / totalCredits) * 1000) / 10 : 0,
    value_usd: Math.round(data.value)
  }))

  // Geographic allocation
  const geoAllocation = Array.from(geoMap.entries()).map(([country, credits]) => ({
    country,
    credits,
    pct: totalCredits > 0 ? Math.round((credits / totalCredits) * 1000) / 10 : 0
  }))

  const targetOffset = input.target_offset_tons || totalCredits
  const achievementPct = targetOffset > 0 ? Math.round((totalCredits / targetOffset) * 1000) / 10 : 0
  const marketPremium = input.market_benchmark_price > 0 ? Math.round(((avgMarketPrice - input.market_benchmark_price) / input.market_benchmark_price) * 1000) / 10 : 0

  const allSdgs = new Set<string>()
  for (const h of holdings) h.sdgs.forEach(s => allSdgs.add(s))

  const recommendations: string[] = []
  if (permanenceRiskPct > 20) recommendations.push('永久性风险: ' + permanenceRiskPct + '%持仓为低永久性评级，建议增加技术类抵消(DAC/BECCS)配置')
  if (geoHHI > 0.5) recommendations.push('地理集中度过高: 建议分散投资于多个司法管辖区以降低监管风险')
  if (stdDivIndex < 0.5) recommendations.push('标准多元化不足: 建议增加不同标准的配置(VCS/Gold Standard/ACR/CAR)')
  if (achievementPct < 80) recommendations.push('抵消目标缺口: 当前仅完成' + achievementPct + '%，建议增加采购以满足目标')
  recommendations.push('建议每季度审查组合估值，根据市场变化动态调整配置')
  recommendations.push('关注新兴标准和方法学，适时纳入高质量新型信用')

  return {
    portfolio_name: input.portfolio_name,
    analysis_date: input.analysis_date,
    valuation: {
      total_credits: totalCredits,
      book_value_usd: Math.round(bookValue),
      market_value_usd: Math.round(marketValue),
      unrealized_gain_loss: Math.round(unrealizedGL),
      avg_book_price: avgBookPrice,
      avg_market_price: avgMarketPrice
    },
    risk_metrics: {
      quality_weighted_score: qualityWeighted,
      permanence_risk_pct: permanenceRiskPct,
      vintage_concentration_risk: vintageConcRisk,
      geographic_concentration_index: geoHHI,
      standard_diversification_index: stdDivIndex,
      overall_risk_rating: overallRisk
    },
    project_type_allocation: typeAllocation,
    geographic_allocation: geoAllocation,
    offset_achievement_pct: achievementPct,
    market_premium_discount: marketPremium,
    sdgs_covered: Array.from(allSdgs),
    recommendations
  }
}

// Tool 4: Cap-and-Trade Optimizer
function analyzeCapTrade(input: CapTradeInput, rng: SeededRandom): CapTradeResult {
  const allocated = input.allowance_allocation
  const required = input.projected_emissions_tco2e
  const surplusDeficit = allocated - required
  const offsetLimit = required * (input.offset_credit_limit_pct / 100)
  const netPosition = surplusDeficit + offsetLimit

  // Trading strategy
  let action: string, quantity: number, timing: string, rationale: string
  let complianceCost: number

  if (surplusDeficit >= 0) {
    action = '持有/出售盈余配额'
    quantity = surplusDeficit
    timing = '当前履约期结束时评估市场价格决定出售时机'
    rationale = '配额盈余' + Math.round(surplusDeficit) + '吨，可选择持有至下一期或出售获利'
    complianceCost = 0
  } else {
    const deficit = Math.abs(surplusDeficit)
    const offsetUsed = Math.min(deficit, offsetLimit)
    const marketPurchase = deficit - offsetUsed
    action = marketPurchase > 0 ? '购买配额+使用抵消信用' : '使用抵消信用履约'
    quantity = deficit
    timing = marketPurchase > 0 ? '建议在价格低位时分批建仓，避免履约期末集中采购' : '立即执行抵消信用履约'
    rationale = marketPurchase > 0
      ? '配额缺口' + Math.round(deficit) + '吨: 使用' + Math.round(offsetUsed) + '吨抵消+' + Math.round(marketPurchase) + '吨市场采购'
      : '配额缺口' + Math.round(deficit) + '吨完全通过抵消信用履约'
    complianceCost = Math.round(marketPurchase * input.allowance_price_usd + offsetUsed * input.offset_credit_price_usd)
  }

  const costPerTon = required > 0 ? Math.round((complianceCost / required) * 100) / 100 : 0
  const offsetUtil = required > 0 ? Math.round((Math.min(Math.max(0, -surplusDeficit), offsetLimit) / required) * 1000) / 10 : 0

  // Price forecast
  const avgHistPrice = input.historical_prices.length > 0
    ? input.historical_prices.reduce((a, b) => a + b, 0) / input.historical_prices.length
    : input.allowance_price_usd
  const priceStd = input.historical_prices.length > 1
    ? Math.sqrt(input.historical_prices.reduce((s, p) => s + Math.pow(p - avgHistPrice, 2), 0) / input.historical_prices.length)
    : input.allowance_price_usd * 0.15
  const expectedPrice = Math.round(input.allowance_price_usd * rng.nextFloat(0.95, 1.15) * 100) / 100
  const direction = expectedPrice > input.allowance_price_usd * 1.05 ? '上行' : expectedPrice < input.allowance_price_usd * 0.95 ? '下行' : '稳定'
  const volatility = avgHistPrice > 0 && (priceStd / avgHistPrice) > 0.25 ? '高波动' : '中等波动'

  const marketRisk = offsetUtil > input.offset_credit_limit_pct * 0.8
    ? '高风险: 抵消使用接近上限，市场采购压力大'
    : surplusDeficit < 0 && Math.abs(surplusDeficit) > allocated * 0.2
    ? '中等风险: 配额缺口较大，需关注市场价格'
    : '低风险: 配额充足或可通过抵消履约'

  const recommendations: string[] = []
  if (surplusDeficit < 0) {
    recommendations.push('配额缺口管理: 当前缺口' + Math.round(Math.abs(surplusDeficit)) + '吨，建议制定分阶段采购计划')
  }
  if (input.banking_allowed && surplusDeficit > 0) {
    recommendations.push('配额存储: 盈余配额可存储至未来履约期使用，建议评估未来价格走势决定存储量')
  }
  recommendations.push('价格风险管理: 建议设置价格预警(' + Math.round(input.allowance_price_usd * 0.9) + '-' + Math.round(input.allowance_price_usd * 1.15) + ' USD/吨)')
  recommendations.push('抵消策略: 当前抵消使用比例' + offsetUtil + '%，上限' + input.offset_credit_limit_pct + '%，' + (offsetUtil < input.offset_credit_limit_pct ? '仍有抵消空间' : '已接近上限'))
  recommendations.push('关注拍卖公告和政策变化对配额价格的短期冲击')
  if (input.borrowing_allowed && surplusDeficit < 0) {
    recommendations.push('借贷选项: 可考虑从未来期借贷配额，但需评估未来履约成本')
  }

  return {
    entity_name: input.entity_name,
    compliance_period: input.compliance_period,
    scheme: input.scheme,
    allowance_position: {
      allocated,
      required: Math.round(required),
      surplus_deficit: Math.round(surplusDeficit),
      offset_eligible: Math.round(offsetLimit),
      net_position: Math.round(netPosition)
    },
    trading_strategy: { action, quantity_tons: Math.round(Math.abs(quantity)), estimated_cost_usd: complianceCost, timing, rationale },
    compliance_cost_usd: complianceCost,
    cost_per_tco2e: costPerTon,
    market_risk_exposure: marketRisk,
    offset_utilization_pct: offsetUtil,
    price_forecast: { direction, expected_price: expectedPrice, volatility },
    recommendations
  }
}

// Tool 5: Carbon Tax Scenario Modeler
function analyzeCarbonTax(input: CarbonTaxInput, rng: SeededRandom): CarbonTaxResult {
  const waccNum = parseFloat(input.wacc) / 100
  const scenarioResults: TaxScenarioResult[] = []
  const abatementAnalysis: AbatementAnalysis[] = []

  for (const scenario of input.tax_scenarios) {
    let totalTax = 0
    let npvTax = 0
    let peakCost = 0
    const annualEmissions = input.base_year_emissions_tco2e

    for (let y = 0; y < input.projection_years; y++) {
      const year = input.base_year + y + 1
      const rate = scenario.initial_rate_usd * Math.pow(1 + scenario.escalation_pct / 100, y)
      const freeAllocation = annualEmissions * (scenario.free_allocation_pct / 100)
      const taxableEmissions = Math.max(0, annualEmissions - freeAllocation)
      const annualTax = taxableEmissions * rate
      totalTax += annualTax
      npvTax += annualTax / Math.pow(1 + waccNum, y + 1)
      if (annualTax > peakCost) peakCost = annualTax
    }

    const avgRate = totalTax / (input.projection_years * Math.max(1, input.base_year_emissions_tco2e * (1 - scenario.free_allocation_pct / 100)))
    const costPctRevenue = input.annual_revenue_usd > 0 ? (peakCost / input.annual_revenue_usd) * 100 : 0

    scenarioResults.push({
      scenario_name: scenario.name,
      total_tax_cost: Math.round(totalTax),
      npv_tax_cost: Math.round(npvTax),
      avg_effective_rate: Math.round(avgRate * 100) / 100,
      peak_annual_cost: Math.round(peakCost),
      cost_as_pct_revenue: Math.round(costPctRevenue * 10) / 10
    })
  }

  // Find optimal (lowest NPV cost) scenario
  const optimal = scenarioResults.length > 0
    ? scenarioResults.reduce((best, s) => s.npv_tax_cost < best.npv_tax_cost ? s : best)
    : { scenario_name: 'N/A', npv_tax_cost: 0 }

  // Abatement analysis
  if (input.abatement_options) {
    for (const option of input.abatement_options) {
      const investment = option.cost_per_ton * option.max_reduction_tons
      const annualSavings = option.max_reduction_tons * (input.tax_scenarios[0]?.initial_rate_usd || 50)
      const payback = annualSavings > 0 ? Math.round((investment / annualSavings) * 10) / 10 : 99
      const npvBenefit = annualSavings * ((1 - Math.pow(1 + waccNum, -input.projection_years)) / waccNum) - investment
      const roi = investment > 0 ? Math.round((npvBenefit / investment) * 1000) / 10 : 0

      abatementAnalysis.push({
        option_name: option.name,
        investment_cost: Math.round(investment),
        annual_savings: Math.round(annualSavings),
        payback_years: payback,
        npv_benefit: Math.round(npvBenefit),
        roi_pct: roi
      })
    }
  }

  const totalAbatementInv = abatementAnalysis.reduce((s, a) => s + a.investment_cost, 0)
  const netBenefit = abatementAnalysis.reduce((s, a) => s + a.npv_benefit, 0)
  const mac = abatementAnalysis.length > 0
    ? Math.round(abatementAnalysis.reduce((s, a) => s + a.investment_cost, 0) / abatementAnalysis.reduce((s, a) => s + a.annual_savings, 0) * 100) / 100
    : 0

  const recommendations: string[] = []
  recommendations.push('最优情景: ' + optimal.scenario_name + '(NPV成本最低: $' + Math.round(optimal.npv_tax_cost).toLocaleString() + ')')
  if (abatementAnalysis.length > 0) {
    const bestAbatement = abatementAnalysis.reduce((best, a) => a.npv_benefit > best.npv_benefit ? a : best)
    recommendations.push('优先减排措施: ' + bestAbatement.option_name + '(NPV收益: $' + bestAbatement.npv_benefit.toLocaleString() + ', 投资回收期: ' + bestAbatement.payback_years + '年)')
  }
  recommendations.push('建议建立内部碳定价机制(初始$' + (input.tax_scenarios[0]?.initial_rate_usd || 50) + '/吨)引导投资决策')
  recommendations.push('关注政策动态: 碳税税率每年递增可能导致后期成本急剧上升')
  if (input.tax_scenarios.some(s => s.border_adjustment)) {
    recommendations.push('边境调整: 含边境调整的情景可降低碳泄漏风险，但可能引发贸易争端')
  }

  return {
    entity_name: input.entity_name,
    base_year: input.base_year,
    projection_horizon: input.base_year + 1 + '-' + (input.base_year + input.projection_years),
    scenario_results: scenarioResults,
    optimal_scenario: optimal.scenario_name,
    abatement_analysis: abatementAnalysis,
    total_abatement_investment: totalAbatementInv,
    net_benefit_vs_baseline: netBenefit,
    marginal_abatement_cost: '$' + mac + '/tCO2e',
    recommendations
  }
}

// Tool 6: Net-Zero Pathway Planner
function analyzeNetZeroPathway(input: NetZeroPathwayInput, rng: SeededRandom): NetZeroPathwayResult {
  const yearsToTarget = input.target_year - input.baseline_year
  const totalReduction = input.baseline_emissions_tco2e * (input.target_type === 'net_zero' ? 0.95 : input.target_type === 'science_based_1.5' ? 0.9 : 0.8)
  const annualRate = yearsToTarget > 0 ? Math.pow(1 - totalReduction / input.baseline_emissions_tco2e, 1 / yearsToTarget) : 0

  // Trajectory
  const trajectory: PathwayTrajectory[] = []
  for (let y = 0; y <= yearsToTarget; y++) {
    const year = input.baseline_year + y
    const progress = y / yearsToTarget
    const reductionSoFar = totalReduction * Math.pow(progress, 0.8)
    const absolute = input.baseline_emissions_tco2e - reductionSoFar
    const offsetNeeded = input.target_type === 'net_zero' ? absolute * 0.1 * (1 - progress * 0.5) : 0
    trajectory.push({
      year,
      absolute_emissions: Math.round(absolute),
      reduction_from_baseline: Math.round(reductionSoFar),
      reduction_pct: Math.round((reductionSoFar / input.baseline_emissions_tco2e) * 1000) / 10,
      offset_needed: Math.round(offsetNeeded),
      cumulative_abatement: Math.round(reductionSoFar)
    })
  }

  // Milestones
  const milestoneYears = input.interim_target_year ? [input.interim_target_year, input.target_year] : [input.target_year]
  const milestones: MilestoneCheckpoint[] = milestoneYears.map(my => {
    const idx = my - input.baseline_year
    const targetPct = my === input.target_year
      ? Math.round((totalReduction / input.baseline_emissions_tco2e) * 100)
      : (input.interim_target_pct || 30)
    const actualPct = idx <= yearsToTarget ? Math.round((trajectory[idx]?.reduction_pct || 0)) : 0
    const gap = idx <= yearsToTarget ? Math.round((targetPct - actualPct) / 100 * input.baseline_emissions_tco2e) : 0
    const status: 'on_track' | 'at_risk' | 'off_track' = gap <= 0 ? 'on_track' : gap < totalReduction * 0.1 ? 'at_risk' : 'off_track'
    return { year: my, target_reduction_pct: targetPct, actual_reduction_pct: actualPct, status, gap_tco2e: gap }
  })

  // Investment
  const totalInvestment = Math.round(totalReduction * rng.nextFloat(30, 75))

  // Annual offset costs
  const annualOffsets: Array<{ year: number; offset_tons: number; cost_usd: number }> = []
  for (let y = 0; y <= yearsToTarget; y++) {
    const year = input.baseline_year + y
    const progress = y / yearsToTarget
    const offsetTons = input.target_type === 'net_zero' ? Math.round(totalReduction * progress * rng.nextFloat(0.05, 0.15)) : 0
    const cost = Math.round(offsetTons * input.carbon_price_assumption * rng.nextFloat(0.9, 1.1))
    annualOffsets.push({ year, offset_tons: offsetTons, cost_usd: cost })
  }

  const sbtiStatus = input.target_type === 'science_based_1.5'
    ? '符合SBTi 1.5°C路径要求(年减排率≥4.2%)'
    : input.target_type === 'net_zero'
    ? '符合SBTi净零标准(深度减排≥90%+残余排放抵消)'
    : '部分符合SBTi标准: 建议提升至1.5°C或净零目标'

  const keyRisks: string[] = []
  keyRisks.push('政策加严可能要求提前达峰或提高减排目标')
  keyRisks.push('碳抵消价格波动可能增加净零达标成本')
  keyRisks.push('技术突破时间不确定性影响高成本措施实施')
  if (input.target_type === 'net_zero' || input.target_type === 'science_based_1.5') {
    keyRisks.push('深度减排依赖未成熟技术(CCUS/氢能/DAC)，存在技术风险')
  }
  if (input.scope3_included) keyRisks.push('Scope 3减排需要上下游协同，控制力有限')
  keyRisks.push('宏观经济波动可能影响减排投资能力和时间表')

  const recommendations: string[] = []
  recommendations.push('优先实施零成本和低成本减排措施(能效提升、行为改变、燃料替代)')
  recommendations.push('建立内部碳定价($' + input.carbon_price_assumption + '/吨)引导资本配置和投资决策')
  recommendations.push('制定分阶段抵消策略: 短期采购成熟信用，长期投资高质量碳移除项目')
  recommendations.push('每年审查路径进展，根据技术发展和市场变化动态调整')
  recommendations.push('考虑加入科学碳目标倡议(SBTi)以增强公信力和市场认可度')
  if (input.offset_strategy === 'heavy') {
    recommendations.push('抵消依赖度较高: 建议逐步降低抵消比例，增加绝对减排投入')
  }

  return {
    organization: input.organization,
    pathway_summary: {
      baseline_year: input.baseline_year,
      baseline_emissions_tco2e: input.baseline_emissions_tco2e,
      target_year: input.target_year,
      target_type: input.target_type,
      total_reduction_required: Math.round(totalReduction),
      annual_reduction_rate: Math.round(annualRate * 10000) / 100
    },
    trajectory,
    milestones,
    total_investment_usd: totalInvestment,
    annual_offset_costs: annualOffsets,
    sbti_alignment_status: sbtiStatus,
    key_risks: keyRisks,
    recommendations
  }
}

// Tool 7: ESG Carbon Reporter
function analyzeESGCarbon(input: ESGCarbonInput, rng: SeededRandom): ESGCarbonResult {
  const totalEmissions = input.emissions_data.scope1_tco2e + input.emissions_data.scope2_market_tco2e + input.emissions_data.scope3_total_tco2e
  const perRevenue = input.revenue_usd > 0 ? totalEmissions / (input.revenue_usd / 1e6) : 0
  const perEmployee = input.employee_count > 0 ? totalEmissions / input.employee_count : 0

  // Disclosure scores
  const griScore = Math.min(100, Math.round(
    (input.emissions_data.scope3_total_tco2e > 0 ? 25 : 10) +
    (input.climate_targets.length > 0 ? 25 : 5) +
    (input.energy_consumption_mwh > 0 ? 20 : 5) +
    (input.governance_structure ? 15 : 0) +
    rng.nextInt(5, 15)
  ))
  const tcfdScore = Math.min(100, Math.round(
    (input.climate_targets.length > 0 ? 30 : 10) +
    (input.governance_structure ? 25 : 5) +
    (input.emissions_data.scope3_total_tco2e > 0 ? 20 : 5) +
    rng.nextInt(5, 20)
  ))
  const cdpScore = Math.min(100, Math.round(
    (totalEmissions > 0 ? 20 : 0) +
    (input.emissions_data.scope3_total_tco2e > 0 ? 20 : 5) +
    (input.carbon_credits_retired > 0 ? 15 : 0) +
    (input.renewable_energy_pct > 0 ? 15 : 0) +
    rng.nextInt(5, 25)
  ))
  const overallScore = Math.round((griScore + tcfdScore + cdpScore) / 3)
  const rating = overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : overallScore >= 40 ? '中等' : '需改进'

  // Benchmark
  const sectorAvgIntensity = perRevenue * rng.nextFloat(0.8, 1.3)
  const percentileRank = Math.round(rng.nextFloat(20, 80))
  const comparisonResult = perRevenue < sectorAvgIntensity * 0.8
    ? '优于行业平均(' + Math.round(sectorAvgIntensity) + ' tCO2e/MUSD): 处于行业前' + (100 - percentileRank) + '百分位'
    : perRevenue > sectorAvgIntensity * 1.2
    ? '高于行业平均(' + Math.round(sectorAvgIntensity) + ' tCO2e/MUSD): 有较大改进空间'
    : '与行业平均(' + Math.round(sectorAvgIntensity) + ' tCO2e/MUSD)基本持平'

  // Target progress
  const targetProgress = input.climate_targets.map(t => ({
    target: t.target,
    deadline: t.deadline,
    progress_pct: t.progress_pct,
    status: t.progress_pct >= 80 ? '进展良好' : t.progress_pct >= 50 ? '需加速' : '进展滞后'
  }))

  // Material topics
  const materialTopics: string[] = []
  materialTopics.push('温室气体排放(Scope 1/2/3)')
  if (input.energy_consumption_mwh > 0) materialTopics.push('能源消耗与可再生能源使用')
  if (input.emissions_data.scope3_total_tco2e > totalEmissions * 0.5) materialTopics.push('价值链碳排放管理')
  materialTopics.push('气候目标与减排进展')
  if (input.carbon_credits_purchased > 0) materialTopics.push('碳信用采购与退役')
  materialTopics.push('气候治理与风险管理')

  // Gaps
  const gaps: string[] = []
  if (input.emissions_data.scope3_total_tco2e === 0) gaps.push('Scope 3排放数据缺失: 建议开展价值链碳足迹评估')
  if (input.renewable_energy_pct === 0) gaps.push('可再生能源使用数据缺失: 建议披露清洁能源采购比例')
  if (input.climate_targets.length === 0) gaps.push('未设定气候目标: 建议制定科学碳目标(SBTi)')
  if (!input.governance_structure) gaps.push('气候治理结构未披露: 建议说明董事会和管理层在气候问题上的职责')
  if (input.emissions_data.scope3_categories.length < 5) gaps.push('Scope 3类别覆盖不足: 建议覆盖至少15个GHG Protocol类别')

  const recommendations: string[] = []
  if (griScore < 80) recommendations.push('提升GRI披露: 当前对齐度' + griScore + '%，建议完善GRI 302(能源)和305(排放)系列披露')
  if (tcfdScore < 80) recommendations.push('提升TCFD披露: 当前对齐度' + tcfdScore + '%，建议加强治理、战略、风险管理和目标指标四个维度的披露')
  if (cdpScore < 70) recommendations.push('提升CDP准备度: 当前' + cdpScore + '%，建议完善C2(风险与机遇)和C6(排放数据)模块')
  recommendations.push('建议获取第三方有限保证以增强ESG数据可信度')
  recommendations.push('关注ISSB S1/S2准则要求，提前准备强制性气候相关披露')

  return {
    entity_name: input.entity_name,
    reporting_period: input.reporting_period,
    framework: input.framework,
    disclosure_score: {
      gri_alignment_pct: griScore,
      tcfd_alignment_pct: tcfdScore,
      cdp_readiness_pct: cdpScore,
      overall_score: overallScore,
      rating
    },
    emissions_summary: {
      scope1: input.emissions_data.scope1_tco2e,
      scope2: input.emissions_data.scope2_market_tco2e,
      scope3: input.emissions_data.scope3_total_tco2e,
      total: Math.round(totalEmissions)
    },
    intensity_metrics: {
      per_revenue: Math.round(perRevenue * 100) / 100,
      per_employee: Math.round(perEmployee * 100) / 100,
      unit: 'tCO2e'
    },
    benchmark_comparison: {
      sector_avg_intensity: Math.round(sectorAvgIntensity),
      entity_intensity: Math.round(perRevenue * 100) / 100,
      percentile_rank: percentileRank,
      comparison_result: comparisonResult
    },
    target_progress: targetProgress,
    material_topics: materialTopics,
    gaps_identified: gaps,
    recommendations
  }
}

// Tool 8: Carbon Border Adjustment Assessor
function analyzeCBAM(input: CBAMInput, rng: SeededRandom): CBAMResult {
  const goods = input.imported_goods
  const totalImports = goods.reduce((s, g) => s + g.quantity_tons, 0)
  const cbamRelevant = goods.filter(g => g.cbam_relevant)
  const cbamRelevantTons = cbamRelevant.reduce((s, g) => s + g.quantity_tons, 0)
  const totalEmissions = goods.reduce((s, g) => s + g.embedded_emissions_total, 0)
  const cbamEmissions = cbamRelevant.reduce((s, g) => s + g.embedded_emissions_total, 0)
  const exposurePct = totalImports > 0 ? Math.round((cbamRelevantTons / totalImports) * 1000) / 10 : 0

  // Liability calculation
  const grossCost = cbamEmissions * input.eu_carbon_price_eur
  const freeAllocationDeduction = grossCost * input.free_allocation_factor
  const domesticCredit = cbamEmissions * input.domestic_carbon_price_eur
  const netLiabilityEur = Math.max(0, grossCost - freeAllocationDeduction - domesticCredit)
  const netLiabilityUsd = netLiabilityEur * input.exchange_rate_eur_usd
  const effectiveRate = cbamEmissions > 0 ? Math.round((netLiabilityEur / cbamEmissions) * 100) / 100 : 0

  // Product breakdown
  const productBreakdown = cbamRelevant.map(g => {
    const cost = g.embedded_emissions_total * input.eu_carbon_price_eur * (1 - input.free_allocation_factor)
    return {
      product: g.product_category,
      origin: g.origin_country,
      emissions: Math.round(g.embedded_emissions_total),
      cbam_cost_eur: Math.round(cost),
      share_pct: cbamEmissions > 0 ? Math.round((g.embedded_emissions_total / cbamEmissions) * 1000) / 10 : 0
    }
  }).sort((a, b) => b.cbam_cost_eur - a.cbam_cost_eur)

  // Origin breakdown
  const originMap = new Map<string, number>()
  for (const g of cbamRelevant) {
    originMap.set(g.origin_country, (originMap.get(g.origin_country) || 0) + g.embedded_emissions_total)
  }
  const originBreakdown = Array.from(originMap.entries()).map(([country, emissions]) => {
    const cost = emissions * input.eu_carbon_price_eur * (1 - input.free_allocation_factor)
    return {
      country,
      emissions: Math.round(emissions),
      cbam_cost_eur: Math.round(cost),
      share_pct: cbamEmissions > 0 ? Math.round((emissions / cbamEmissions) * 1000) / 10 : 0
    }
  }).sort((a, b) => b.cbam_cost_eur - a.cbam_cost_eur)

  // Phase-in impact
  const phaseInImpact = input.scheme === 'EU_CBAM'
    ? 'EU CBAM 2026-2034逐步实施: 免费分配比例从' + (input.free_allocation_factor * 100) + '%逐步降至0%，CBAM成本将逐年增加'
    : input.scheme === 'UK_CBAM'
    ? 'UK CBAM预计2027年实施: 请密切关注英国政府关于覆盖范围和税率的具体规定'
    : '拟议进口关税: 政策细节尚未确定，建议持续关注立法进展'

  // Trade risk
  const tradeRisk = exposurePct > 50
    ? '高风险: 超过50%的进口受CBAM影响，建议评估供应链重构和本地化生产选项'
    : exposurePct > 20
    ? '中等风险: 20-50%的进口受CBAM影响，建议与供应商协商减排和成本分担'
    : '低风险: 低于20%的进口受CBAM影响，但仍需监控政策扩展风险'

  const recommendations: string[] = []
  recommendations.push('供应链碳数据: 建立进口产品嵌入式排放数据收集系统，确保CBAM申报准确性')
  if (freeAllocationDeduction < grossCost * 0.3) {
    recommendations.push('免费分配优化: 当前免费分配抵扣比例较低，建议核查是否符合免费分配申请条件')
  }
  recommendations.push('供应商减排合作: 与关键供应商合作降低产品碳强度，直接减少CBAM成本')
  if (originBreakdown.length > 0 && originBreakdown[0].share_pct > 50) {
    recommendations.push('来源多元化: ' + originBreakdown[0].country + '占比超过50%，建议分散进口来源以降低集中风险')
  }
  recommendations.push('价格传导机制: 评估CBAM成本向下游客户传导的可能性，更新商业合同条款')
  recommendations.push('关注CBAM扩展: 欧盟可能将CBAM覆盖范围扩展至更多产品和间接排放，建议提前准备')

  return {
    importer_name: input.importer_name,
    reporting_period: input.reporting_period,
    scheme: input.scheme,
    exposure: {
      total_imports_tons: Math.round(totalImports),
      cbam_relevant_tons: Math.round(cbamRelevantTons),
      total_embedded_emissions: Math.round(totalEmissions),
      cbam_relevant_emissions: Math.round(cbamEmissions),
      exposure_pct: exposurePct
    },
    liability: {
      gross_cbam_cost_eur: Math.round(grossCost),
      free_allocation_deduction: Math.round(freeAllocationDeduction),
      domestic_carbon_credit: Math.round(domesticCredit),
      net_cbam_liability_eur: Math.round(netLiabilityEur),
      net_cbam_liability_usd: Math.round(netLiabilityUsd),
      effective_rate_per_ton: effectiveRate
    },
    product_breakdown: productBreakdown,
    origin_breakdown: originBreakdown,
    phase_in_impact: phaseInImpact,
    trade_risk_assessment: tradeRisk,
    recommendations
  }
}

// ==================== SECTION 4 — Format Functions ====================

function formatEmissionsInventoryReport(r: EmissionsInventoryResult): string {
  const lines: string[] = []
  lines.push('## 排放清单报告 (GHG Protocol / ISO 14064)')
  lines.push('')
  lines.push('**实体:** ' + r.entity_name + ' | **报告年度:** ' + r.reporting_year)
  lines.push('')
  lines.push('### 排放总量')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 总排放(市场法) | ' + r.total_emissions_tco2e.toLocaleString() + ' tCO2e |')
  lines.push('| Scope 1 (直接) | ' + r.scope_breakdown.scope1_direct.toLocaleString() + ' tCO2e |')
  lines.push('| Scope 2 (间接-能源，位置法) | ' + r.scope_breakdown.scope2_location_based.toLocaleString() + ' tCO2e |')
  lines.push('| Scope 2 (间接-能源，市场法) | ' + r.scope_breakdown.scope2_market_based.toLocaleString() + ' tCO2e |')
  lines.push('| Scope 3 (价值链) | ' + r.scope_breakdown.scope3_value_chain.toLocaleString() + ' tCO2e |')
  lines.push('')
  lines.push('### 气体类型分解')
  lines.push('| 气体 | CO2e(吨) |')
  lines.push('|------|---------|')
  lines.push('| CO2 | ' + r.gas_breakdown.co2_tons.toLocaleString() + ' |')
  lines.push('| CH4 | ' + r.gas_breakdown.ch4_tons_co2e.toLocaleString() + ' |')
  lines.push('| N2O | ' + r.gas_breakdown.n2o_tons_co2e.toLocaleString() + ' |')
  lines.push('| 含氟气体 | ' + r.gas_breakdown.fgas_tons_co2e.toLocaleString() + ' |')
  lines.push('| 其他 | ' + r.gas_breakdown.other_tons_co2e.toLocaleString() + ' |')
  lines.push('')
  lines.push('### 排放强度')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 营收强度 | ' + r.intensity_metrics.per_revenue + ' ' + r.intensity_metrics.unit_revenue + ' |')
  lines.push('| 产量强度 | ' + r.intensity_metrics.per_production + ' ' + r.intensity_metrics.unit_production + ' |')
  lines.push('')
  lines.push('### 数据质量')
  lines.push('| 等级 | 占比 |')
  lines.push('|------|------|')
  lines.push('| 实测 | ' + r.data_quality.measured_pct + '% |')
  lines.push('| 计算 | ' + r.data_quality.calculated_pct + '% |')
  lines.push('| 估算 | ' + r.data_quality.estimated_pct + '% |')
  lines.push('| **综合评级** | **' + r.data_quality.overall_rating + '** |')
  lines.push('| **置信水平** | **' + r.data_quality.confidence_level + '** |')
  lines.push('')
  lines.push('### Top排放源')
  for (const s of r.top_emission_sources) {
    lines.push('- ' + s.facility + ' (' + s.scope + '): ' + s.tco2e.toLocaleString() + ' tCO2e (' + s.pct + '%)')
  }
  lines.push('')
  lines.push('### 趋势分析')
  lines.push(r.trend_analysis)
  lines.push('')
  lines.push('### GHG Protocol合规')
  lines.push(r.ghg_protocol_compliance)
  lines.push('')
  lines.push('### 改进建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatCreditRetirementReport(r: CreditRetirementResult): string {
  const lines: string[] = []
  lines.push('## 碳信用退役追踪报告')
  lines.push('')
  lines.push('**账户持有人:** ' + r.account_holder + ' | **报告期:** ' + r.reporting_period)
  lines.push('')
  lines.push('### 退役概要')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 持有信用总量 | ' + r.retirement_summary.total_credits_held.toLocaleString() + ' tCO2e |')
  lines.push('| 已退役信用 | ' + r.retirement_summary.total_credits_retired.toLocaleString() + ' tCO2e |')
  lines.push('| 剩余信用 | ' + r.retirement_summary.total_credits_remaining.toLocaleString() + ' tCO2e |')
  lines.push('| 退役率 | ' + r.retirement_summary.retirement_rate_pct + '% |')
  lines.push('| 平均退役价格 | $' + r.retirement_summary.avg_retirement_price + '/吨 |')
  lines.push('| 退役总价值 | $' + r.retirement_summary.total_retirement_value.toLocaleString() + ' |')
  lines.push('')
  lines.push('### 合规状态')
  lines.push(r.compliance_status)
  lines.push('| 剩余义务 | ' + r.remaining_obligation.toLocaleString() + ' tCO2e |')
  lines.push('')
  lines.push('### Vintage分布')
  lines.push('| 年份 | 信用量 | 占比 |')
  lines.push('|------|--------|------|')
  for (const v of r.vintage_distribution.vintage_summary) {
    lines.push('| ' + v.year + ' | ' + v.credits.toLocaleString() + ' | ' + v.pct + '% |')
  }
  lines.push('| **平均Vintage** | **' + r.vintage_distribution.avg_vintage + '** | |')
  lines.push('| **Vintage风险** | **' + r.vintage_distribution.vintage_risk + '** | |')
  lines.push('')
  lines.push('### 标准分解')
  lines.push('| 标准 | 信用量 | 占比 | 平均价格 |')
  lines.push('|------|--------|------|---------|')
  for (const s of r.standard_breakdown) {
    lines.push('| ' + s.standard + ' | ' + s.credits.toLocaleString() + ' | ' + s.pct + '% | $' + s.avg_price + ' |')
  }
  lines.push('')
  lines.push('### 成本分析')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 总获取成本 | $' + r.cost_analysis.total_acquisition_cost.toLocaleString() + ' |')
  lines.push('| 平均成本 | $' + r.cost_analysis.avg_cost_per_ton + '/吨 |')
  lines.push('| 未实现价值 | $' + r.cost_analysis.unrealized_value.toLocaleString() + ' |')
  lines.push('')
  lines.push('### 战略建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatOffsetPortfolioReport(r: OffsetPortfolioResult): string {
  const lines: string[] = []
  lines.push('## 碳抵消组合分析报告')
  lines.push('')
  lines.push('**组合:** ' + r.portfolio_name + ' | **分析日期:** ' + r.analysis_date)
  lines.push('')
  lines.push('### 估值概要')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 总信用量 | ' + r.valuation.total_credits.toLocaleString() + ' tCO2e |')
  lines.push('| 账面价值 | $' + r.valuation.book_value_usd.toLocaleString() + ' |')
  lines.push('| 市场价值 | $' + r.valuation.market_value_usd.toLocaleString() + ' |')
  lines.push('| 未实现损益 | $' + r.valuation.unrealized_gain_loss.toLocaleString() + ' |')
  lines.push('| 平均账面价格 | $' + r.valuation.avg_book_price + '/吨 |')
  lines.push('| 平均市场价格 | $' + r.valuation.avg_market_price + '/吨 |')
  lines.push('')
  lines.push('### 风险指标')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 质量加权评分 | ' + r.risk_metrics.quality_weighted_score + '/100 |')
  lines.push('| 永久性风险比例 | ' + r.risk_metrics.permanence_risk_pct + '% |')
  lines.push('| 地理集中度(HHI) | ' + r.risk_metrics.geographic_concentration_index + ' |')
  lines.push('| 标准多元化指数 | ' + r.risk_metrics.standard_diversification_index + ' |')
  lines.push('| **综合风险评级** | **' + r.risk_metrics.overall_risk_rating + '** |')
  lines.push('')
  lines.push('### 项目类型配置')
  lines.push('| 项目类型 | 信用量 | 占比 | 价值(USD) |')
  lines.push('|---------|--------|------|----------|')
  for (const a of r.project_type_allocation) {
    lines.push('| ' + a.type + ' | ' + a.credits.toLocaleString() + ' | ' + a.pct + '% | $' + a.value_usd.toLocaleString() + ' |')
  }
  lines.push('')
  lines.push('### 地理配置')
  for (const g of r.geographic_allocation) {
    lines.push('- ' + g.country + ': ' + g.credits.toLocaleString() + ' tCO2e (' + g.pct + '%)')
  }
  lines.push('')
  lines.push('### 抵消目标')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 目标完成率 | ' + r.offset_achievement_pct + '% |')
  lines.push('| 市场溢价/折价 | ' + r.market_premium_discount + '% |')
  lines.push('| SDGs覆盖 | ' + r.sdgs_covered.length + '个目标 |')
  lines.push('')
  lines.push('### 配置建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatCapTradeReport(r: CapTradeResult): string {
  const lines: string[] = []
  lines.push('## 碳交易优化报告 (Cap-and-Trade)')
  lines.push('')
  lines.push('**实体:** ' + r.entity_name + ' | **履约期:** ' + r.compliance_period + ' | **碳市场:** ' + r.scheme)
  lines.push('')
  lines.push('### 配额头寸')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 分配配额 | ' + r.allowance_position.allocated.toLocaleString() + ' tCO2e |')
  lines.push('| 所需配额 | ' + r.allowance_position.required.toLocaleString() + ' tCO2e |')
  lines.push('| 盈余/缺口 | ' + r.allowance_position.surplus_deficit.toLocaleString() + ' tCO2e |')
  lines.push('| 抵消可用 | ' + r.allowance_position.offset_eligible.toLocaleString() + ' tCO2e |')
  lines.push('| 净头寸 | ' + r.allowance_position.net_position.toLocaleString() + ' tCO2e |')
  lines.push('')
  lines.push('### 交易策略')
  lines.push('| 项目 | 内容 |')
  lines.push('|------|------|')
  lines.push('| 操作 | ' + r.trading_strategy.action + ' |')
  lines.push('| 数量 | ' + r.trading_strategy.quantity_tons.toLocaleString() + ' tCO2e |')
  lines.push('| 预计成本 | $' + r.trading_strategy.estimated_cost_usd.toLocaleString() + ' |')
  lines.push('| 时机 | ' + r.trading_strategy.timing + ' |')
  lines.push('| 策略依据 | ' + r.trading_strategy.rationale + ' |')
  lines.push('')
  lines.push('### 合规成本')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 合规总成本 | $' + r.compliance_cost_usd.toLocaleString() + ' |')
  lines.push('| 单位成本 | $' + r.cost_per_tco2e + '/tCO2e |')
  lines.push('| 抵消使用比例 | ' + r.offset_utilization_pct + '% |')
  lines.push('| 市场风险暴露 | ' + r.market_risk_exposure + ' |')
  lines.push('')
  lines.push('### 价格预测')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 方向 | ' + r.price_forecast.direction + ' |')
  lines.push('| 预期价格 | $' + r.price_forecast.expected_price + '/吨 |')
  lines.push('| 波动率 | ' + r.price_forecast.volatility + ' |')
  lines.push('')
  lines.push('### 策略建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatCarbonTaxReport(r: CarbonTaxResult): string {
  const lines: string[] = []
  lines.push('## 碳税情景模型报告')
  lines.push('')
  lines.push('**实体:** ' + r.entity_name + ' | **基准年:** ' + r.base_year + ' | **预测期:** ' + r.projection_horizon)
  lines.push('')
  lines.push('### 情景对比')
  lines.push('| 情景 | 总税负 | NPV税负 | 平均有效税率 | 峰值年成本 | 占营收比 |')
  lines.push('|------|--------|---------|------------|-----------|---------|')
  for (const s of r.scenario_results) {
    lines.push('| ' + s.scenario_name + ' | $' + s.total_tax_cost.toLocaleString() + ' | $' + s.npv_tax_cost.toLocaleString() + ' | $' + s.avg_effective_rate + '/吨 | $' + s.peak_annual_cost.toLocaleString() + ' | ' + s.cost_as_pct_revenue + '% |')
  }
  lines.push('| **最优情景** | **' + r.optimal_scenario + '** | | | | |')
  lines.push('')
  lines.push('### 减排措施分析')
  lines.push('| 措施 | 投资成本 | 年节省 | 回收期(年) | NPV收益 | ROI |')
  lines.push('|------|---------|--------|----------|---------|-----|')
  for (const a of r.abatement_analysis) {
    lines.push('| ' + a.option_name + ' | $' + a.investment_cost.toLocaleString() + ' | $' + a.annual_savings.toLocaleString() + ' | ' + a.payback_years + ' | $' + a.npv_benefit.toLocaleString() + ' | ' + a.roi_pct + '% |')
  }
  lines.push('')
  lines.push('### 综合评估')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 总减排投资 | $' + r.total_abatement_investment.toLocaleString() + ' |')
  lines.push('| 净收益(vs基准) | $' + r.net_benefit_vs_baseline.toLocaleString() + ' |')
  lines.push('| 边际减排成本 | ' + r.marginal_abatement_cost + ' |')
  lines.push('')
  lines.push('### 策略建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatNetZeroPathwayReport(r: NetZeroPathwayResult): string {
  const lines: string[] = []
  lines.push('## 净零路径规划报告 (SBTi-Aligned)')
  lines.push('')
  lines.push('### 路径概要')
  lines.push('| 项目 | 值 |')
  lines.push('|------|------|')
  lines.push('| 组织 | ' + r.organization + ' |')
  lines.push('| 基准年 | ' + r.pathway_summary.baseline_year + ' |')
  lines.push('| 基准排放 | ' + r.pathway_summary.baseline_emissions_tco2e.toLocaleString() + ' tCO2e |')
  lines.push('| 目标年 | ' + r.pathway_summary.target_year + ' |')
  lines.push('| 目标类型 | ' + r.pathway_summary.target_type + ' |')
  lines.push('| 总减排需求 | ' + r.pathway_summary.total_reduction_required.toLocaleString() + ' tCO2e |')
  lines.push('| 年均减排率 | ' + r.pathway_summary.annual_reduction_rate + '% |')
  lines.push('| 总投资 | $' + r.total_investment_usd.toLocaleString() + ' |')
  lines.push('| SBTi对齐 | ' + r.sbti_alignment_status + ' |')
  lines.push('')
  lines.push('### 排放轨迹')
  lines.push('| 年份 | 绝对排放 | 减排量 | 减排比例 | 抵消需求 |')
  lines.push('|------|---------|--------|---------|---------|')
  for (const t of r.trajectory) {
    lines.push('| ' + t.year + ' | ' + t.absolute_emissions.toLocaleString() + ' | ' + t.reduction_from_baseline.toLocaleString() + ' | ' + t.reduction_pct + '% | ' + t.offset_needed.toLocaleString() + ' |')
  }
  lines.push('')
  lines.push('### 里程碑检查点')
  for (const m of r.milestones) {
    const statusIcon = m.status === 'on_track' ? '正常' : m.status === 'at_risk' ? '有风险' : '偏离'
    lines.push('- **' + m.year + '**: 目标' + m.target_reduction_pct + '% | 实际' + m.actual_reduction_pct + '% | ' + statusIcon + ' | 缺口' + m.gap_tco2e.toLocaleString() + ' tCO2e')
  }
  lines.push('')
  lines.push('### 关键风险')
  for (const risk of r.key_risks) lines.push('- [风险] ' + risk)
  lines.push('')
  lines.push('### 战略建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatESGCarbonReport(r: ESGCarbonResult): string {
  const lines: string[] = []
  lines.push('## ESG碳披露报告 (' + r.framework + ' Framework)')
  lines.push('')
  lines.push('**实体:** ' + r.entity_name + ' | **报告期:** ' + r.reporting_period)
  lines.push('')
  lines.push('### 披露评分')
  lines.push('| 维度 | 得分 |')
  lines.push('|------|------|')
  lines.push('| GRI对齐度 | ' + r.disclosure_score.gri_alignment_pct + '% |')
  lines.push('| TCFD对齐度 | ' + r.disclosure_score.tcfd_alignment_pct + '% |')
  lines.push('| CDP准备度 | ' + r.disclosure_score.cdp_readiness_pct + '% |')
  lines.push('| **综合评分** | **' + r.disclosure_score.overall_score + '/100 (' + r.disclosure_score.rating + ')** |')
  lines.push('')
  lines.push('### 排放概要')
  lines.push('| 范围 | 排放量(tCO2e) |')
  lines.push('|------|-------------|')
  lines.push('| Scope 1 | ' + r.emissions_summary.scope1.toLocaleString() + ' |')
  lines.push('| Scope 2 | ' + r.emissions_summary.scope2.toLocaleString() + ' |')
  lines.push('| Scope 3 | ' + r.emissions_summary.scope3.toLocaleString() + ' |')
  lines.push('| **总计** | **' + r.emissions_summary.total.toLocaleString() + '** |')
  lines.push('')
  lines.push('### 排放强度')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 营收强度 | ' + r.intensity_metrics.per_revenue + ' tCO2e/MUSD |')
  lines.push('| 人均强度 | ' + r.intensity_metrics.per_employee + ' tCO2e/人 |')
  lines.push('')
  lines.push('### 行业对标')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 行业平均强度 | ' + r.benchmark_comparison.sector_avg_intensity + ' tCO2e/MUSD |')
  lines.push('| 企业强度 | ' + r.benchmark_comparison.entity_intensity + ' tCO2e/MUSD |')
  lines.push('| 百分位排名 | 第' + r.benchmark_comparison.percentile_rank + '百分位 |')
  lines.push('| 对标结果 | ' + r.benchmark_comparison.comparison_result + ' |')
  lines.push('')
  lines.push('### 气候目标进展')
  for (const t of r.target_progress) {
    lines.push('- ' + t.target + ' (截止' + t.deadline + '): ' + t.progress_pct + '% - ' + t.status)
  }
  lines.push('')
  lines.push('### 实质性议题')
  for (const topic of r.material_topics) lines.push('- ' + topic)
  lines.push('')
  lines.push('### 披露差距')
  for (const gap of r.gaps_identified) lines.push('- [差距] ' + gap)
  lines.push('')
  lines.push('### 改进建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatCBAMReport(r: CBAMResult): string {
  const lines: string[] = []
  lines.push('## 碳边境调整机制(CBAM)评估报告')
  lines.push('')
  lines.push('**进口商:** ' + r.importer_name + ' | **报告期:** ' + r.reporting_period + ' | **机制:** ' + r.scheme)
  lines.push('')
  lines.push('### CBAM暴露')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 总进口量 | ' + r.exposure.total_imports_tons.toLocaleString() + ' 吨 |')
  lines.push('| CBAM相关进口 | ' + r.exposure.cbam_relevant_tons.toLocaleString() + ' 吨 |')
  lines.push('| 总嵌入式排放 | ' + r.exposure.total_embedded_emissions.toLocaleString() + ' tCO2e |')
  lines.push('| CBAM相关排放 | ' + r.exposure.cbam_relevant_emissions.toLocaleString() + ' tCO2e |')
  lines.push('| 暴露比例 | ' + r.exposure.exposure_pct + '% |')
  lines.push('')
  lines.push('### CBAM成本')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 毛CBAM成本 | €' + r.liability.gross_cbam_cost_eur.toLocaleString() + ' |')
  lines.push('| 免费分配抵扣 | -€' + r.liability.free_allocation_deduction.toLocaleString() + ' |')
  lines.push('| 国内碳信用抵扣 | -€' + r.liability.domestic_carbon_credit.toLocaleString() + ' |')
  lines.push('| **净CBAM负债(EUR)** | **€' + r.liability.net_cbam_liability_eur.toLocaleString() + '** |')
  lines.push('| **净CBAM负债(USD)** | **$' + r.liability.net_cbam_liability_usd.toLocaleString() + '** |')
  lines.push('| 有效税率 | €' + r.liability.effective_rate_per_ton + '/tCO2e |')
  lines.push('')
  lines.push('### 产品分解')
  lines.push('| 产品 | 来源 | 排放(tCO2e) | CBAM成本(EUR) | 占比 |')
  lines.push('|------|------|------------|-------------|------|')
  for (const p of r.product_breakdown) {
    lines.push('| ' + p.product + ' | ' + p.origin + ' | ' + p.emissions.toLocaleString() + ' | €' + p.cbam_cost_eur.toLocaleString() + ' | ' + p.share_pct + '% |')
  }
  lines.push('')
  lines.push('### 来源国分解')
  lines.push('| 国家 | 排放(tCO2e) | CBAM成本(EUR) | 占比 |')
  lines.push('|------|------------|-------------|------|')
  for (const o of r.origin_breakdown) {
    lines.push('| ' + o.country + ' | ' + o.emissions.toLocaleString() + ' | €' + o.cbam_cost_eur.toLocaleString() + ' | ' + o.share_pct + '% |')
  }
  lines.push('')
  lines.push('### 分阶段实施影响')
  lines.push(r.phase_in_impact)
  lines.push('')
  lines.push('### 贸易风险评估')
  lines.push(r.trade_risk_assessment)
  lines.push('')
  lines.push('### 应对建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Emissions Inventory Builder
  tools.register(defineTool({
    name: 'emissions_inventory_builder',
    description: 'Build comprehensive GHG emissions inventory per GHG Protocol and ISO 14064 standards. Calculate Scope 1/2/3 emissions by facility, analyze gas-type breakdown, compute emission intensities, assess data quality, identify top sources, and evaluate year-over-year trends.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { entity_name, reporting_year, organizational_boundary, operational_scope, facilities: [{ name, location, activity_data, activity_unit, emission_factor, emission_factor_source, scope (scope1/scope2_location/scope2_market/scope3), gas_type, data_quality (measured/calculated/estimated), gwp_factor }], revenue_usd, production_output (optional), production_unit (optional), historical_inventory (optional [{ year, total_tco2e, scope1, scope2, scope3 }]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: EmissionsInventoryInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeEmissionsInventory(input, rng)
      return formatEmissionsInventoryReport(result)
    }
  }))

  // Tool 2: Credit Retirement Tracker
  tools.register(defineTool({
    name: 'credit_retirement_tracker',
    description: 'Track and reconcile carbon credit retirements against compliance obligations. Analyze vintage distribution, standard breakdown, cost basis, retirement schedule, and remaining obligations. Provide strategic recommendations for portfolio optimization.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { account_holder, reporting_period, credit_holdings: [{ credit_id, standard, project_type, vintage_year, quantity_tons, acquisition_price_usd, registry, serial_number, status (active/retired/transferred) }], retirement_records: [{ retirement_id, credit_id, quantity_tons, retirement_date, beneficiary, purpose, verification_status }], compliance_obligation_tons (optional), target_retirement_year (optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CreditRetirementInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeCreditRetirement(input, rng)
      return formatCreditRetirementReport(result)
    }
  }))

  // Tool 3: Offset Portfolio Analyzer
  tools.register(defineTool({
    name: 'offset_portfolio_analyzer',
    description: 'Analyze carbon offset portfolio across valuation, risk metrics, quality scoring, and diversification dimensions. Assess unrealized gains/losses, permanence risk, vintage concentration, geographic allocation, and SDG coverage. Provide rebalancing recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { portfolio_name, analysis_date, holdings: [{ standard, project_type, project_name, vintage_year, quantity_tons, book_price_usd, current_market_price_usd, quality_score, permanence_rating (high/medium/low), host_country, sdgs (string[]) }], market_benchmark_price, risk_free_rate (optional), target_offset_tons (optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: OffsetPortfolioInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeOffsetPortfolio(input, rng)
      return formatOffsetPortfolioReport(result)
    }
  }))

  // Tool 4: Cap-and-Trade Optimizer
  tools.register(defineTool({
    name: 'cap_trade_optimizer',
    description: 'Optimize cap-and-trade compliance strategy by analyzing allowance positions, calculating compliance costs, determining optimal trading actions (buy/sell/bank/borrow), assessing offset utilization, and forecasting allowance prices. Minimize total compliance cost.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { entity_name, compliance_period, scheme, allowance_allocation, current_emissions_tco2e, projected_emissions_tco2e, allowance_price_usd, offset_credit_limit_pct, offset_credit_price_usd, banking_allowed, borrowing_allowed, historical_prices (number[]), forward_curve (optional [{ period, price }]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CapTradeInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeCapTrade(input, rng)
      return formatCapTradeReport(result)
    }
  }))

  // Tool 5: Carbon Tax Scenario Modeler
  tools.register(defineTool({
    name: 'carbon_tax_modeler',
    description: 'Model multiple carbon tax scenarios with different rates, escalation paths, and coverage scopes. Calculate NPV of tax costs, evaluate abatement investment options with ROI/payback analysis, and identify optimal compliance strategy under each scenario.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { entity_name, base_year, base_year_emissions_tco2e, projection_years, annual_revenue_usd, wacc (string, e.g. "8.5"), tax_scenarios: [{ name, initial_rate_usd, escalation_pct, coverage_scope, free_allocation_pct, border_adjustment }], abatement_options (optional [{ name, cost_per_ton, max_reduction_tons, implementation_year }]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CarbonTaxInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeCarbonTax(input, rng)
      return formatCarbonTaxReport(result)
    }
  }))

  // Tool 6: Net-Zero Pathway Planner
  tools.register(defineTool({
    name: 'net_zero_pathway_planner',
    description: 'Plan SBTi-aligned net-zero decarbonization pathway with absolute emission trajectory, milestone checkpoints, investment estimation, and offset strategy. Assess alignment with 1.5°C and well-below-2°C targets, identify gaps, and provide risk-aware recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { organization, baseline_year, baseline_emissions_tco2e, target_year, target_type (net_zero/carbon_neutral/science_based_1.5/science_based_well_below_2), interim_target_year (optional), interim_target_pct (optional), annual_revenue_usd, wacc (string), industry_sector, scope3_included, offset_strategy (minimal/moderate/heavy), carbon_price_assumption }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: NetZeroPathwayInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeNetZeroPathway(input, rng)
      return formatNetZeroPathwayReport(result)
    }
  }))

  // Tool 7: ESG Carbon Reporter
  tools.register(defineTool({
    name: 'esg_carbon_reporter',
    description: 'Generate GRI/TCFD/CDP/ISSB-aligned carbon disclosure report with framework alignment scoring, emission intensity benchmarking against sector peers, climate target progress tracking, material topic identification, and gap analysis with improvement recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { entity_name, reporting_period, framework (GRI/TCFD/CDP/ISSB/Combined), emissions_data: { scope1_tco2e, scope2_location_tco2e, scope2_market_tco2e, scope3_total_tco2e, scope3_categories: [{ category, tco2e }] } }, energy_consumption_mwh, renewable_energy_pct, carbon_credits_purchased, carbon_credits_retired, climate_targets: [{ target, deadline, progress_pct }], governance_structure, industry_sector, revenue_usd, employee_count }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ESGCarbonInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeESGCarbon(input, rng)
      return formatESGCarbonReport(result)
    }
  }))

  // Tool 8: Carbon Border Adjustment Assessor
  tools.register(defineTool({
    name: 'carbon_border_adjustment_assessor',
    description: 'Assess EU CBAM/UK CBAM exposure and liability for imported goods. Calculate embedded emissions, gross and net CBAM costs after free allocation and domestic carbon credits, analyze product and origin breakdowns, evaluate phase-in impacts, and provide trade risk mitigation strategies.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { importer_name, reporting_period, scheme (EU_CBAM/UK_CBAM/Proposed_Import_Tariff), imported_goods: [{ product_category, hs_code, origin_country, quantity_tons, embedded_emissions_tco2e_per_ton, embedded_emissions_total, cbam_relevant }], eu_carbon_price_eur, domestic_carbon_price_eur, free_allocation_factor, exchange_rate_eur_usd, compliance_costs (optional [{ cost_type, amount_eur }]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CBAMInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeCBAM(input, rng)
      return formatCBAMReport(result)
    }
  }))

  console.log('[dsh-tool-carbontx] Loaded v' + VERSION + ' - Carbon Credit Trading & Emissions Accounting with 8 tools')
  console.log('  Tools: emissions_inventory_builder, credit_retirement_tracker, offset_portfolio_analyzer, cap_trade_optimizer, carbon_tax_modeler, net_zero_pathway_planner, esg_carbon_reporter, carbon_border_adjustment_assessor')
}
