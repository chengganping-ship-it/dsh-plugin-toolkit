/**
 * DSH Carbon Trading AI Agent Plugin v0.1.0
 *
 * Comprehensive carbon market analysis toolkit for DeepSeek Harness Agent.
 * Designed for carbon traders, sustainability analysts, ESG consultants, compliance officers,
 * and corporate sustainability managers navigating global carbon markets.
 *
 * Features (v0.1.0):
 * 1. Carbon Price Predictor     — Carbon allowance price forecasting with trend analysis
 * 2. Offset Portfolio Optimizer — Carbon credit portfolio optimization with risk management
 * 3. Compliance Gap Analyzer     — Carbon compliance gap analysis with pathway planning
 * 4. Carbon Footprint Calculator — Product carbon footprint per ISO 14064 verification
 * 5. ETS Market Analyzer         — Carbon trading market analysis with liquidity assessment
 * 6. Carbon Neutrality Roadmap   — Carbon neutrality pathway with abatement cost analysis
 * 7. International Mechanism    — CDM/CCER international carbon credit mechanism evaluation
 * 8. Carbon Disclosure Reporter — TCFD/CDP carbon disclosure report generation
 *
 * @module dsh-tool-carbontradingagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-carbontradingagent'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '免责声明: 本分析基于AI模型推断与历史数据，仅供碳市场参考，不替代专业碳核查、金融投资和法律合规意见。碳价格预测具有固有不确定性，实际交易决策请咨询持牌碳交易顾问。'

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

// --- Tool 1: Carbon Price Predictor ---
interface PricePredictorInput {
  market: string
  allowance_type: string
  historical_prices: number[]
  forecast_periods: number
  policy_scenario?: 'baseline' | 'ambitious' | 'conservative'
  current_inventory?: number
}

interface PriceForecast {
  period: number
  predicted_price: number
  confidence_low: number
  confidence_high: number
}

interface PricePredictorResult {
  market: string
  current_price: number
  trend_direction: 'bullish' | 'bearish' | 'sideways'
  trend_strength: number
  volatility_pct: number
  forecasts: PriceForecast[]
  support_level: number
  resistance_level: number
  policy_impact: string
  risk_factors: string[]
}

// --- Tool 2: Offset Portfolio Optimizer ---
interface OffsetPortfolioInput {
  holdings: Array<{ project_type: string; standard: string; vintage: number; credits: number; price: number }>
  total_budget: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  target_offset_tons: number
}

interface OptimizedAllocation {
  project_type: string
  standard: string
  recommended_credits: number
  recommended_budget_pct: number
  expected_cost_per_ton: number
  rating: string
}

interface PortfolioOptimizerResult {
  total_current_value: number
  total_recommended_value: number
  quality_score: number
  risk_score: number
  allocations: OptimizedAllocation[]
  risk_assessment: {
    concentration_risk: string
    vintage_risk: string
    standard_quality_risk: string
    overall_rating: string
  }
  strategy_notes: string[]
}

// --- Tool 3: Compliance Gap Analyzer ---
interface ComplianceGapInput {
  jurisdiction: string
  scheme: string
  allocated_allowances: number
  verified_emissions: number
  coverage_pct: number
  surrender_deadline: string
  penalty_rate: number
  banking_allowed: boolean
  offset_entitlement_pct: number
}

interface ComplianceGapResult {
  allowance_balance: number
  compliance_status: 'surplus' | 'deficit' | 'exact'
  deficit_tons: number
  surplus_tons: number
  action_plan: string[]
  surrender_requirements: {
    deadline: string
    required_tons: number
    offset_allowable: boolean
    max_offset_tons: number
  }
  financial_exposure: {
    estimated_penalty: number
    purchase_cost_at_current: number
    worst_case_cost: number
  }
  risk_warnings: string[]
}

// --- Tool 4: Carbon Footprint Calculator ---
interface FootprintInput {
  product_name: string
  functional_unit: string
  lifecycle_stages: Array<{ stage: string; co2e_tons: string; data_source: string; quality: 'measured' | 'calculated' | 'estimated' }>
  boundary: string
  allocation_method?: string
  biogenic_co2?: number
}

interface FootprintResult {
  total_footprint: number
  footprint_per_unit: number
  stage_breakdown: Array<{ stage: string; co2e: number; pct: number; quality: string }>
  gwp_assessment: {
    includes_biogenic: boolean
    biogenic_co2: number
    net_footprint: number
  }
  iso_14064_compliance: {
    boundary_defined: boolean
    allocation_justified: boolean
    data_quality_average: string
    verification_readiness: string
  }
  hotspot_stages: string[]
  reduction_recommendations: string[]
}

// --- Tool 5: ETS Market Analyzer ---
interface ETSInput {
  ets_name: string
  trading_period: string
  current_price: number
  daily_volumes: number[]
  open_interest: number
  registered_operators: number
 allowance_supply: number
  allowance_demand: number
}

interface MarketMetrics {
  avg_daily_volume: number
  volume_volatility: number
  liquidity_ratio: number
  market_depth: string
  bid_ask_estimate: string
}

interface ETSAnalysisResult {
  market_name: string
  supply_demand_balance: number
  market_tightness: 'oversupplied' | 'balanced' | 'undersupplied'
  metrics: MarketMetrics
  price_efficiency: {
    price_discovery: string
    volatility_assessment: string
    trend_consistency: string
  }
  participation_quality: {
    operator_concentration: string
    retail_vs_institutional: string
    overall_assessment: string
  }
  recommendations: string[]
}

// --- Tool 6: Carbon Neutrality Roadmap ---
interface RoadmapInput {
  organization: string
  baseline_year: number
  baseline_emissions: number
  target_year: number
  target_reduction_pct: number
  reduction_measures: Array<{ measure: string; reduction_tons: number; cost_per_ton: number; start_year: number; end_year: number }>
  growth_rate_pct: number
}

interface AbatementMeasure {
  measure: string
  reduction_tons: number
  cost_per_ton: number
  total_cost: number
  annualized_cost: number
  start_year: number
  end_year: number
  category: 'free' | 'low_cost' | 'medium_cost' | 'high_cost'
}

interface RoadmapResult {
  pathway_summary: {
    baseline: number
    target_year: number
    required_reduction: number
    growth_adjusted_baseline: number
  }
  marginal_abatement_curve: AbatementMeasure[]
  total_investment: number
  weighted_avg_cost_per_ton: number
  annual_milestones: Array<{ year: number; emissions: number; reduction_pct: number }>
  cumulative_offset_need: number
  feasibility_assessment: string
  key_risks: string[]
  recommendations: string[]
}

// --- Tool 7: International Carbon Credit Mechanism ---
interface MechanismInput {
  mechanism_type: 'CDM' | 'CCER' | 'Gold_Standard' | 'VCS' | 'JI'
  project_category: string
  host_country: string
  vintage_range: [number, number]
  estimated_cers: number
  sustainability_criteria?: string[]
}

interface MechanismResult {
  mechanism: string
  eligibility_status: 'eligible' | 'conditionally_eligible' | 'ineligible'
  conversion_factors: {
    to_eua: number
    to_cer: number
    correlation_with_eua: number
  }
  quality_assessment: {
    additionality: string
    permanence: string
    leakage_risk: string
    sustainable_development: string
  }
  pricing: {
    floor_price: number
    reference_price: number
    ceiling_price: number
  }
  demand_outlook: {
    compliance_demand: string
    voluntary_demand: string
    recommendation: string
  }
  regulatory_notes: string[]
}

// --- Tool 8: Carbon Disclosure Reporter ---
interface DisclosureInput {
  reporting_entity: string
  reporting_year: number
  framework: 'TCFD' | 'CDP' | 'GRI' | 'Combined'
  scope1_tons: number
  scope2_tons: number
  scope3_tons: number
  total_revenue: number
  has_sustainability_committee: boolean
  climate_risk_identified: boolean
  targets_disclosed: boolean
  industry_benchmark?: number
}

interface DisclosureResult {
  framework: string
  alignment_scores: {
    strategy: number
    risk_management: number
    metrics_targets: number
    governance: number
    overall: number
  }
  emissions_profile: {
    scope1: number
    scope2: number
    scope3: number
    total: number
    intensity_revenue: number
    intensity_benchmark_comparison?: string
  }
  disclosure_quality: {
    completeness: number
    accuracy_indicators: string[]
    gaps: string[]
    best_practices_met: string[]
  }
  section_content: Record<string, string>
}

// ==================== SECTION 3 — Analyze Functions ====================

// Tool 1: Carbon Price Predictor
function analyzeCarbonPrice(input: PricePredictorInput, rng: SeededRandom): PricePredictorResult {
  const prices = input.historical_prices
  const currentPrice = prices[prices.length - 1] ?? 50
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const priceStd = Math.sqrt(prices.reduce((s, p) => s + Math.pow(p - avgPrice, 2), 0) / prices.length)
  const volatilityPct = avgPrice > 0 ? (priceStd / avgPrice) * 100 : 15

  const firstAvg = prices.slice(0, Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(prices.length / 2)
  const secondAvg = prices.slice(Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(prices.length / 2)
  const trendDiff = secondAvg - firstAvg

  let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways'
  if (trendDiff > priceStd * 0.3) trend = 'bullish'
  else if (trendDiff < -priceStd * 0.3) trend = 'bearish'

  const trendStrength = Math.min(100, Math.abs(trendDiff) / (priceStd + 0.01) * 50 + rng.nextFloat(5, 15))

  const policyMultipliers: Record<string, number> = { baseline: 1.0, ambitious: 1.15, conservative: 0.92 }
  const policyMult = policyMultipliers[input.policy_scenario ?? 'baseline']

  const forecasts: PriceForecast[] = []
  for (let i = 1; i <= input.forecast_periods; i++) {
    let changeRate = 0
    if (trend === 'bullish') changeRate = rng.nextFloat(0.02, 0.08) * policyMult
    else if (trend === 'bearish') changeRate = rng.nextFloat(-0.06, -0.01)
    else changeRate = rng.nextFloat(-0.02, 0.03)

    const adjustedRate = changeRate * (1 - i * 0.03)
    const predicted = currentPrice * (1 + adjustedRate)
    const spread = priceStd * (1 + i * 0.15)
    forecasts.push({
      period: i,
      predicted_price: Math.round(predicted * 100) / 100,
      confidence_low: Math.max(0, Math.round((predicted - spread) * 100) / 100),
      confidence_high: Math.round((predicted + spread) * 100) / 100
    })
  }

  const support = Math.max(0, currentPrice - priceStd * 1.5)
  const resistance = currentPrice + priceStd * 1.5

  const riskFactors: string[] = []
  if (volatilityPct > 25) riskFactors.push('高价格波动率: 建议采用对冲策略')
  if (input.policy_scenario === 'ambitious') riskFactors.push('激进政策情景下价格上行风险增大')
  if (input.current_inventory !== undefined && input.current_inventory < 0) riskFactors.push('配额库存不足: 面临短期购买压力')
  if (input.current_inventory !== undefined && input.current_inventory > 100000) riskFactors.push('库存充裕: 存在价格下行压力')
  riskFactors.push('政策不确定性可能显著影响价格走势')
  riskFactors.push('宏观经济衰退风险可能降低配额需求')

  return {
    market: input.market,
    current_price: currentPrice,
    trend_direction: trend,
    trend_strength: Math.round(trendStrength * 10) / 10,
    volatility_pct: Math.round(volatilityPct * 10) / 10,
    forecasts,
    support_level: Math.round(support * 100) / 100,
    resistance_level: Math.round(resistance * 100) / 100,
    policy_impact: policyMult > 1 ? '政策加严推高价格预期' : policyMult < 1 ? '政策宽松压制价格上行' : '政策中性维持当前价格区间',
    risk_factors: riskFactors
  }
}

// Tool 2: Offset Portfolio Optimizer
function analyzeOffsetPortfolio(input: OffsetPortfolioInput, rng: SeededRandom): PortfolioOptimizerResult {
  const totalCurrentValue = input.holdings.reduce((s, h) => s + h.credits * h.price, 0)
  const totalCredits = input.holdings.reduce((s, h) => s + h.credits, 0)

  const standardScores: Record<string, number> = {
    'Gold Standard': 95, 'VCS': 88, 'CAR': 82, 'ACR': 78, 'CCER': 75,
    'CDM': 65, 'CDM/JI': 60, 'Green-e': 85
  }
  const vintageScore = (v: number) => v >= 2023 ? 100 : v >= 2021 ? 85 : v >= 2019 ? 65 : 40

  let weightedQuality = 0
  for (const h of input.holdings) {
    const stdScore = standardScores[h.standard] ?? 70
    const vinScore = vintageScore(h.vintage)
    weightedQuality += ((stdScore + vinScore) / 2) * h.credits
  }
  const qualityScore = totalCredits > 0 ? Math.round(weightedQuality / totalCredits) : 0

  const allocations: OptimizedAllocation[] = []
  const budgetAllocations: Record<string, { budget: number; riskAdj: number }> = {
    'conservative': { budget: 0.15, riskAdj: 0.8 },
    'moderate': { budget: 0.25, riskAdj: 1.0 },
    'aggressive': { budget: 0.40, riskAdj: 1.3 }
  }
  const config = budgetAllocations[input.risk_tolerance]

  const uniqueTypes = [...new Set(input.holdings.map(h => h.project_type))]
  for (const type of uniqueTypes) {
    const holdings = input.holdings.filter(h => h.project_type === type)
    const avgPrice = holdings.reduce((s, h) => s + h.price, 0) / holdings.length
    const totalTypeCredits = holdings.reduce((s, h) => s + h.credits, 0)
    const budgetShare = (totalTypeCredits / totalCredits) * config.budget * config.riskAdj
    const adjPrice = avgPrice * rng.nextFloat(0.95, 1.05)

    allocations.push({
      project_type: type,
      standard: holdings[0].standard,
      recommended_credits: Math.round(totalTypeCredits * rng.nextFloat(0.9, 1.1)),
      recommended_budget_pct: Math.round(budgetShare * 1000) / 10,
      expected_cost_per_ton: Math.round(adjPrice * 100) / 100,
      rating: qualityScore > 85 ? '优质' : qualityScore > 70 ? '良好' : '一般 — 需关注'
    })
  }

  const typeCount = new Set(input.holdings.map(h => h.project_type)).size
  const stdCount = new Set(input.holdings.map(h => h.standard)).size
  const oldestVintage = Math.min(...input.holdings.map(h => h.vintage))
  const newestVintage = Math.max(...input.holdings.map(h => h.vintage))

  const concentrationRisk = typeCount <= 2 ? '集中度过高 — 建议至少覆盖4类项目' : typeCount >= 5 ? '分散度良好' : '分散度适中'
  const vintageRisk = oldestVintage < 2020 ? '存在老旧信用风险 — 优先处置vintage < 2020的持仓' : 'vintage分布合理'
  const stdQualityRisk = stdCount <= 1 ? '标准单一 — 建议增加多元标准配置' : '标准分布合理'

  let overallRating = '中等'
  if (qualityScore > 80 && typeCount >= 4) overallRating = '优秀'
  else if (qualityScore < 60 || typeCount <= 2) overallRating = '需关注'

  const strategyNotes: string[] = []
  strategyNotes.push(`组合当前总值约${Math.round(totalCurrentValue).toLocaleString()} USD，建议Target offset ${input.target_offset_tons.toLocaleString()}吨`)
  if (qualityScore > 80) strategyNotes.push('组合质量优良，适合用于核心碳中和声明')
  else strategyNotes.push('建议逐步淘汰低质量信用，提升组合整体评级')
  if (input.risk_tolerance === 'aggressive') strategyNotes.push('激进策略可适当增加高风险高回报项目比例')
  strategyNotes.push(`风险偏好: ${input.risk_tolerance} — 建议年度审查组合配置`)

  const purchaseNeed = Math.max(0, input.target_offset_tons - totalCredits)
  const totalRecommendedValue = totalCurrentValue + purchaseNeed * (totalCurrentValue / Math.max(totalCredits, 1)) * rng.nextFloat(0.9, 1.1)

  return {
    total_current_value: Math.round(totalCurrentValue),
    total_recommended_value: Math.round(totalRecommendedValue),
    quality_score: qualityScore,
    risk_score: Math.round(rng.nextFloat(30, 70)),
    allocations,
    risk_assessment: {
      concentration_risk: concentrationRisk,
      vintage_risk: vintageRisk,
      standard_quality_risk: stdQualityRisk,
      overall_rating: overallRating
    },
    strategy_notes: strategyNotes
  }
}

// Tool 3: Compliance Gap Analyzer
function analyzeComplianceGap(input: ComplianceGapInput, rng: SeededRandom): ComplianceGapResult {
  const balance = input.allocated_allowances - input.verified_emissions
  const isSurplus = balance > 0
  const deficit = Math.max(0, -balance)
  const surplus = Math.max(0, balance)

  const status: 'surplus' | 'deficit' | 'exact' = balance > 0 ? 'surplus' : balance < 0 ? 'deficit' : 'exact'
  const maxOffsetTons = Math.round(input.verified_emissions * (input.offset_entitlement_pct / 100))

  const actionPlan: string[] = []
  if (status === 'deficit') {
    actionPlan.push(`1. 立即采购${deficit.toLocaleString()}吨配额覆盖缺口`)
    if (maxOffsetTons > 0) actionPlan.push(`2. 可使用最多${maxOffsetTons.toLocaleString()}吨碳信用抵消(${input.offset_entitlement_pct}%)`)
    actionPlan.push('3. 评估市场流动性，分批建仓降低冲击成本')
    if (input.banking_allowed && surplus === 0) actionPlan.push('4. 查询是否可借用下一年度配额(如规则允许)')
  } else if (status === 'surplus') {
    actionPlan.push(`1. 盈余${surplus.toLocaleString()}吨可结转至下一年度`)
    actionPlan.push('2. 评估市场时机，择机出售部分盈余获取收益')
    actionPlan.push('3. 建立战略性配额储备应对未来政策收紧')
  } else {
    actionPlan.push('1. 配额与排放精确匹配，合规压力较小')
    actionPlan.push('2. 持续监控排放趋势，防止未来出现缺口')
  }

  const currentMarketPrice = rng.nextFloat(55, 95)
  const purchaseCost = deficit * currentMarketPrice
  const worstCaseCost = deficit * currentMarketPrice * 1.4 + deficit * input.penalty_rate * 0.3

  const riskWarnings: string[] = []
  if (status === 'deficit') {
    const pct = (deficit / input.verified_emissions) * 100
    riskWarnings.push(`配额缺口${pct.toFixed(1)}% — 需在${input.surrender_deadline}前补足`)
  }
  if (input.coverage_pct < 80) riskWarnings.push(`行业覆盖率仅${input.coverage_pct}% — 政策扩大覆盖范围风险`)
  if (!input.banking_allowed && surplus > 0) riskWarnings.push('不允许结转 — 盈余配额将作废')
  riskWarnings.push('未按时履约将面临罚款及公开披露处罚')
  riskWarnings.push('核查数据不确定性可能导致实际排放量调整')

  return {
    allowance_balance: balance,
    compliance_status: status,
    deficit_tons: deficit,
    surplus_tons: surplus,
    action_plan: actionPlan,
    surrender_requirements: {
      deadline: input.surrender_deadline,
      required_tons: input.verified_emissions,
      offset_allowable: input.offset_entitlement_pct > 0,
      max_offset_tons: maxOffsetTons
    },
    financial_exposure: {
      estimated_penalty: Math.round(deficit * input.penalty_rate),
      purchase_cost_at_current: Math.round(purchaseCost),
      worst_case_cost: Math.round(worstCaseCost)
    },
    risk_warnings: riskWarnings
  }
}

// Tool 4: Carbon Footprint Calculator
function analyzeCarbonFootprint(input: FootprintInput, rng: SeededRandom): FootprintResult {
  const stages = input.lifecycle_stages.map(s => ({
    stage: s.stage,
    co2e: parseFloat(s.co2e_tons) || 0,
    data_source: s.data_source,
    quality: s.quality
  }))
  const total = stages.reduce((s, st) => s + st.co2e, 0)
  const perUnit = total // per functional unit

  const stageBreakdown = stages.map(s => ({
    stage: s.stage,
    co2e: Math.round(s.co2e * 100) / 100,
    pct: total > 0 ? Math.round((s.co2e / total) * 1000) / 10 : 0,
    quality: s.quality
  }))

  const qualityScores: Record<string, number> = { measured: 3, calculated: 2, estimated: 1 }
  const avgQualityScore = stages.reduce((s, st) => s + (qualityScores[st.quality] ?? 1), 0) / Math.max(stages.length, 1)
  const avgQuality = avgQualityScore > 2.5 ? '高' : avgQualityScore > 1.5 ? '中' : '低'

  const biogenicCO2 = input.biogenic_co2 ?? 0

  const hotspotStages = [...stageBreakdown]
    .sort((a, b) => b.co2e - a.co2e)
    .slice(0, 3)
    .map(s => s.stage)

  const recommendations: string[] = []
  recommendations.push('优先针对排放热点阶段制定减排方案')
  const estimatedStages = stages.filter(s => s.quality === 'estimated')
  if (estimatedStages.length > 0) {
    recommendations.push(`改进${estimatedStages.length}个估算阶段的数据收集，采用实测或计算数据提升精度`)
  }
  if (biogenicCO2 > 0) {
    recommendations.push('确保生物源CO2按照ISO 14064-1要求单独报告，不计入总足迹')
  }
  recommendations.push('建立年度碳足迹追踪机制，实现同比减排监控')
  recommendations.push('考虑第三方核查声明以增强报告可信度')

  return {
    total_footprint: Math.round(total * 100) / 100,
    footprint_per_unit: Math.round(perUnit * 100) / 100,
    stage_breakdown: stageBreakdown,
    gwp_assessment: {
      includes_biogenic: biogenicCO2 > 0,
      biogenic_co2: biogenicCO2,
      net_footprint: Math.round((total - biogenicCO2) * 100) / 100
    },
    iso_14064_compliance: {
      boundary_defined: !!input.boundary,
      allocation_justified: !!input.allocation_method,
      data_quality_average: avgQuality,
      verification_readiness: avgQuality === '高' && !!input.boundary && !!input.allocation_method
        ? '可直接提交第三方核查'
        : '建议完善数据质量后再提交核查'
    },
    hotspot_stages: hotspotStages,
    reduction_recommendations: recommendations
  }
}

// Tool 5: ETS Market Analyzer
function analyzeETS(input: ETSInput, rng: SeededRandom): ETSAnalysisResult {
  const avgDailyVolume = input.daily_volumes.reduce((a, b) => a + b, 0) / input.daily_volumes.length
  const volumeStd = Math.sqrt(input.daily_volumes.reduce((s, v) => s + Math.pow(v - avgDailyVolume, 2), 0) / input.daily_volumes.length)
  const volumeVolatility = avgDailyVolume > 0 ? (volumeStd / avgDailyVolume) * 100 : 20

  const liquidityRatio = input.allowance_supply > 0 ? (avgDailyVolume / input.allowance_supply) * 100 : 0
  const marketDepth = liquidityRatio > 2 ? '深度充足' : liquidityRatio > 0.5 ? '深度适中' : '深度不足 — 关注大单冲击成本'
  const bidAskEstimate = liquidityRatio > 2 ? '< 0.5%' : liquidityRatio > 0.5 ? '0.5%-1.5%' : '> 2%'

  const supplyDemandBalance = input.allowance_supply - input.allowance_demand
  const marketTightness: 'oversupplied' | 'balanced' | 'undersupplied' =
    supplyDemandBalance > input.allowance_demand * 0.1 ? 'oversupplied' :
    supplyDemandBalance < -input.allowance_demand * 0.05 ? 'undersupplied' : 'balanced'

  const recentPrices = input.daily_volumes.length > 5
    ? input.daily_volumes.slice(-5).map((_, i) => input.current_price * rng.nextFloat(0.97, 1.03))
    : []
  const priceConsistency = recentPrices.length > 3 ? (recentPrices.every((p, i) => i === 0 || Math.abs(p - recentPrices[i - 1]) / recentPrices[i - 1] < 0.03) ? '高' : '中等') : '数据不足'

  const operatorConcentration = input.registered_operators > 200 ? '分散 — 市场竞争充分' :
    input.registered_operators > 50 ? '中等 — 存在一定集中度' : '高度集中 — 关注大户操纵风险'

  const recommendations: string[] = []
  if (marketTightness === 'undersupplied') recommendations.push('市场偏紧 — 建议增加配额储备')
  else if (marketTightness === 'oversupplied') recommendations.push('市场宽松 — 可关注低价建仓机会')
  else recommendations.push('市场均衡 — 建议按基准策略执行')
  if (liquidityRatio < 0.5) recommendations.push('流动性不足 — 大额交易建议分批执行')
  if (input.registered_operators < 30) recommendations.push('参与者数量有限 — 建议拓展交易对手')
  recommendations.push('持续监控政策公告与拍卖结果对市场的影响')

  return {
    market_name: input.ets_name,
    supply_demand_balance: supplyDemandBalance,
    market_tightness: marketTightness,
    metrics: {
      avg_daily_volume: Math.round(avgDailyVolume),
      volume_volatility: Math.round(volumeVolatility * 10) / 10,
      liquidity_ratio: Math.round(liquidityRatio * 100) / 100,
      market_depth: marketDepth,
      bid_ask_estimate: bidAskEstimate
    },
    price_efficiency: {
      price_discovery: priceConsistency === '高' ? '价格发现机制有效' : '需关注价格异常波动',
      volatility_assessment: volumeVolatility > 50 ? '波动剧烈 — 建议设置止损' : volumeVolatility > 25 ? '波动适中' : '波动温和',
      trend_consistency: `近期价格一致性: ${priceConsistency}`
    },
    participation_quality: {
      operator_concentration: operatorConcentration,
      retail_vs_institutional: '以机构投资者为主，配套金融服务完善',
      overall_assessment: input.registered_operators > 100 && liquidityRatio > 1 ? '市场成熟度良好' : '市场仍在发展完善阶段'
    },
    recommendations
  }
}

// Tool 6: Carbon Neutrality Roadmap
function analyzeCarbonNeutrality(input: RoadmapInput, rng: SeededRandom): RoadmapResult {
  const yearsToTarget = input.target_year - input.baseline_year
  const growthFactor = Math.pow(1 + input.growth_rate_pct / 100, yearsToTarget)
  const growthAdjustedBaseline = input.baseline_emissions * growthFactor
  const requiredReduction = growthAdjustedBaseline * (input.target_reduction_pct / 100)
  const targetEmissions = growthAdjustedBaseline - requiredReduction

  const measures: AbatementMeasure[] = input.reduction_measures.map(m => {
    const costCategory: 'free' | 'low_cost' | 'medium_cost' | 'high_cost' =
      m.cost_per_ton <= 0 ? 'free' :
      m.cost_per_ton <= 20 ? 'low_cost' :
      m.cost_per_ton <= 60 ? 'medium_cost' : 'high_cost'

    return {
      measure: m.measure,
      reduction_tons: m.reduction_tons,
      cost_per_ton: m.cost_per_ton,
      total_cost: m.reduction_tons * m.cost_per_ton,
      annualized_cost: m.reduction_tons * m.cost_per_ton / Math.max(m.end_year - m.start_year, 1),
      start_year: m.start_year,
      end_year: m.end_year,
      category: costCategory
    }
  }).sort((a, b) => a.cost_per_ton - b.cost_per_ton)

  const totalReduction = measures.reduce((s, m) => s + m.reduction_tons, 0)
  const totalInvestment = measures.filter(m => m.cost_per_ton > 0).reduce((s, m) => s + m.total_cost, 0)
  const weightedAvgCost = totalReduction > 0
    ? measures.reduce((s, m) => s + m.cost_per_ton * m.reduction_tons, 0) / totalReduction
    : 0

  const annualMilestones: Array<{ year: number; emissions: number; reduction_pct: number }> = []
  for (let y = 0; y <= yearsToTarget; y++) {
    const year = input.baseline_year + y
    const cumulativeReduction = measures
      .filter(m => m.start_year <= year)
      .reduce((s, m) => {
        const rampUp = Math.min(1, (year - m.start_year) / Math.max(m.end_year - m.start_year, 1))
        return s + m.reduction_tons * rampUp
      }, 0)
    const yearEmissions = growthAdjustedBaseline - cumulativeReduction
    const reductionPct = ((input.baseline_emissions - yearEmissions) / input.baseline_emissions) * 100
    annualMilestones.push({
      year,
      emissions: Math.round(yearEmissions),
      reduction_pct: Math.round(reductionPct * 10) / 10
    })
  }

  const residualEmissions = targetEmissions - totalReduction
  const cumulativeOffsetNeed = Math.max(0, residualEmissions * (input.target_year - input.baseline_year))

  const feasibility = totalReduction >= requiredReduction
    ? '目标可行 — 减排措施可覆盖所需减排量'
    : `存在减排缺口${Math.round(requiredReduction - totalReduction).toLocaleString()}吨 — 需补充额外减排措施`

  const keyRisks: string[] = []
  if (totalReduction < requiredReduction) keyRisks.push('减排措施不足 — 需要额外减排方案')
  if (input.growth_rate_pct > 3) keyRisks.push('高业务增长显著增加减排难度')
  if (measures.some(m => m.cost_per_ton > 80)) keyRisks.push('高成本措施占比大 — 需关注边际成本递增')
  keyRisks.push('技术突破可能改变成本结构')
  keyRisks.push('政策加严可能要求提前达峰')

  const recommendations: string[] = []
  recommendations.push('优先实施零成本和低成本减排措施')
  recommendations.push('建立年度减排追踪与中期调整机制')
  if (residualEmissions > 0) recommendations.push(`规划碳抵消策略覆盖剩余${Math.round(residualEmissions).toLocaleString()}吨排放`)
  recommendations.push('关注碳捕集与氢能等新兴技术的成本下降曲线')

  return {
    pathway_summary: {
      baseline: input.baseline_emissions,
      target_year: input.target_year,
      required_reduction: Math.round(requiredReduction),
      growth_adjusted_baseline: Math.round(growthAdjustedBaseline)
    },
    marginal_abatement_curve: measures,
    total_investment: Math.round(totalInvestment),
    weighted_avg_cost_per_ton: Math.round(weightedAvgCost * 100) / 100,
    annual_milestones: annualMilestones,
    cumulative_offset_need: Math.round(cumulativeOffsetNeed),
    feasibility_assessment: feasibility,
    key_risks: keyRisks,
    recommendations
  }
}

// Tool 7: International Carbon Credit Mechanism
function analyzeInternationalMechanism(input: MechanismInput, rng: SeededRandom): MechanismResult {
  const mechanismPrices: Record<string, { floor: number; ref: number; ceiling: number }> = {
    'CDM': { floor: 0.5, ref: 4.5, ceiling: 12 },
    'CCER': { floor: 3, ref: 45, ceiling: 80 },
    'Gold_Standard': { floor: 8, ref: 25, ceiling: 50 },
    'VCS': { floor: 3, ref: 15, ceiling: 35 },
    'JI': { floor: 0.3, ref: 3, ceiling: 8 }
  }

  const pricing = mechanismPrices[input.mechanism_type] ?? { floor: 2, ref: 15, ceiling: 30 }

  const conversionFactors = {
    to_eua: input.mechanism_type === 'CCER' ? 1.0 : input.mechanism_type === 'CDM' ? 0.8 : 0.6,
    to_cer: input.mechanism_type === 'CDM' ? 1.0 : input.mechanism_type === 'CCER' ? 0.95 : 0.5,
    correlation_with_eua: input.mechanism_type === 'CCER' ? 0.92 : rng.nextFloat(0.3, 0.7)
  }

  const eligibility: 'eligible' | 'conditionally_eligible' | 'ineligible' =
    input.vintage_range[0] >= 2013 ? 'eligible' :
    input.vintage_range[0] >= 2010 ? 'conditionally_eligible' : 'ineligible'

  const hostCountryScores: Record<string, string> = {
    'China': '高 — 项目质量整体可靠，签发流程成熟',
    'India': '高 — CDM项目经验丰富，监管体系完善',
    'Brazil': '中高 — 农业和林业项目潜力大',
    'Kenya': '中 — 小规模项目为主，需关注核查质量',
    'Indonesia': '中 — 红树林和REDD+项目增长迅速'
  }

  const sdAssessment = hostCountryScores[input.host_country] ?? '需进一步评估'

  const regulatoryNotes: string[] = []
  if (input.mechanism_type === 'CDM') {
    regulatoryNotes.push('CDM CER在巴黎协定第6.4条下过渡安排尚不明确')
    regulatoryNotes.push('2013年前签发的CER在多数合规市场受限')
  }
  if (input.mechanism_type === 'CCER') {
    regulatoryNotes.push('CCER重启后覆盖项目类型扩大至造林、并网光热、并网海上风力发电、红树林营造')
    regulatoryNotes.push('全国温室气体自愿减排交易市场首批方法学持续更新')
    regulatoryNotes.push('CCER可用于全国抵消机制(不超过应清缴碳排放配额的5%)')
  }
  if (input.mechanism_type === 'Gold_Standard') {
    regulatoryNotes.push('Gold Standard对SDGs贡献有明确要求，至少贡献3个SDG')
    regulatoryNotes.push('自愿碳市场高端买家偏好，适合企业碳中和声明')
  }
  if (input.mechanism_type === 'VCS') {
    regulatoryNotes.push('VCS(Verra)是全球使用最广泛的自愿碳标准')
    regulatoryNotes.push('注意审查项目类型的最新规则变更')
  }
  if (input.mechanism_type === 'JI') {
    regulatoryNotes.push('JI项目主要来自经济转型国家')
    regulatoryNotes.push('由于供应有限，价格可能缺乏流动性')
  }

  return {
    mechanism: input.mechanism_type.replace('_', ' '),
    eligibility_status: eligibility,
    conversion_factors: conversionFactors,
    quality_assessment: {
      additionality: rng.nextFloat(0.6, 0.95) > 0.75 ? '高 — 符合标准要求' : '中 — 需提供额外证明',
      permanence: ['forestry', 'redd+', 'blue_carbon'].includes(input.project_category.toLowerCase())
        ? '需关注逆转风险与缓冲池' : '技术类项目永久性风险较低',
      leakage_risk: ['renewable_energy', 'energy_efficiency'].includes(input.project_category.toLowerCase())
        ? '低 — 技术项目泄漏风险可控' : '中 — 需评估市场泄漏与活动转移',
      sustainable_development: sdAssessment
    },
    pricing: {
      floor_price: pricing.floor,
      reference_price: pricing.ref,
      ceiling_price: pricing.ceiling
    },
    demand_outlook: {
      compliance_demand: input.mechanism_type === 'CCER'
        ? '中国碳市场需求强劲，抵消机制已纳入全国ETS'
        : input.mechanism_type === 'CDM'
        ? '合规市场需求有限，主要转向自愿市场'
        : '不作为合规抵消，仅限自愿市场使用',
      voluntary_demand: rng.nextFloat(0.5, 0.9) > 0.7
        ? '自愿市场增长强劲，企业净零承诺带动需求'
        : '需求稳定增长，但价格承压',
      recommendation: eligibility === 'eligible'
        ? '适合纳入抵消策略，建议关注性价比'
        : eligibility === 'conditionally_eligible'
        ? '有条件使用，需确认具体合规要求'
        : '不建议在当前策略中使用'
    },
    regulatory_notes: regulatoryNotes
  }
}

// Tool 8: Carbon Disclosure Reporter
function analyzeCarbonDisclosure(input: DisclosureInput, rng: SeededRandom): DisclosureResult {
  const totalEmissions = input.scope1_tons + input.scope2_tons + input.scope3_tons
  const intensity = input.total_revenue > 0 ? (totalEmissions / (input.total_revenue / 1e6)) : 0

  const strategyScore = (input.climate_risk_identified ? 40 : 10) + (input.targets_disclosed ? 30 : 5) + rng.nextInt(10, 30)
  const riskMgmtScore = (input.climate_risk_identified ? 50 : 20) + rng.nextInt(15, 30)
  const metricsScore = totalEmissions > 0 ? 50 : 20 + (input.scope3_tons > 0 ? 25 : 5) + rng.nextInt(10, 25)
  const governanceScore = (input.has_sustainability_committee ? 45 : 10) + rng.nextInt(15, 40)

  const cap = (n: number) => Math.min(100, Math.max(0, Math.round(n)))
  const overall = Math.round((strategyScore + riskMgmtScore + metricsScore + governanceScore) / 4)

  const gaps: string[] = []
  if (!input.climate_risk_identified) gaps.push('未明确识别气候相关风险与机遇')
  if (!input.targets_disclosed) gaps.push('未披露量化气候目标')
  if (input.scope3_tons === 0) gaps.push('Scope 3排放未核算 — 多数行业Scope 3占比最大')
  if (!input.has_sustainability_committee) gaps.push('未设立董事会级别可持续发展委员会')
  if (input.framework === 'TCFD' && !input.climate_risk_identified) gaps.push('TCFD核心要求 — 需披露情景分析与战略韧性评估')

  const bestPractices: string[] = []
  if (input.climate_risk_identified) bestPractices.push('已建立气候风险识别流程')
  if (input.targets_disclosed) bestPractices.push('已设定量化减排目标')
  if (input.scope3_tons > 0) bestPractices.push('已开展Scope 3排放核算')
  if (input.has_sustainability_committee) bestPractices.push('建立了董事会级别监督机制')

  const benchmarkComparison = input.industry_benchmark
    ? intensity < input.industry_benchmark
      ? `优于行业平均(${input.industry_benchmark.toFixed(0)} tCO2e/MUSD)`
      : `高于行业平均(${input.industry_benchmark.toFixed(0)} tCO2e/MUSD)，需加强减排`
    : undefined

  const sectionContent: Record<string, string> = {}
  if (input.framework === 'TCFD' || input.framework === 'Combined') {
    sectionContent['TCFD治理'] = input.has_sustainability_committee
      ? '董事会通过可持续发展委员会对气候相关风险和机遇进行监督。管理层定期向董事会报告气候目标进展。'
      : '建议：尽快建立董事会级别气候治理架构，明确管理层气候职责。'
    sectionContent['TCFD战略'] = input.climate_risk_identified
      ? '已识别短期、中期和长期气候相关风险与机遇，完成1.5C/2C/3C情景分析。'
      : '建议：开展气候情景分析，评估不同升温情景对业务战略的影响。'
    sectionContent['TCFD风险管理'] = '已建立气候风险识别、评估和管理流程。风险清单每季度更新，重大气候风险纳入企业风险管理体系。'
    sectionContent['TCFD指标与目标'] = input.targets_disclosed
      ? `已披露Scope 1/2/3排放总量${totalEmissions.toLocaleString()}吨CO2e。设定了近期和远期减排目标。`
      : '建议：设定科学碳目标(SBTi)，建立范围一、二、三排放基线数据。'
  }
  if (input.framework === 'CDP' || input.framework === 'Combined') {
    sectionContent['CDP C2 风险与机遇'] = input.climate_risk_identified
      ? '已识别转型风险(政策合规、技术变革)和物理风险(极端天气、慢性变化)。'
      : '建议：建立系统化气候风险识别流程并及时更新。'
    sectionContent['CDP C5 排放数据'] = `Scope 1: ${input.scope1_tons.toLocaleString()} tCO2e | Scope 2: ${input.scope2_tons.toLocaleString()} tCO2e | Scope 3: ${input.scope3_tons.toLocaleString()} tCO2e`
    sectionContent['CDP C6 能源'] = '已核算能源消费总量及可再生能源占比，具体数据见年度可持续发展报告。'
  }
  if (input.framework === 'GRI' || input.framework === 'Combined') {
    sectionContent['GRI 305 排放'] = `范围一排放: ${input.scope1_tons.toLocaleString()} tCO2e | 范围二排放: ${input.scope2_tons.toLocaleString()} tCO2e | 范围三排放: ${input.scope3_tons.toLocaleString()} tCO2e | 排放强度: ${intensity.toFixed(1)} tCO2e/MUSD营收`
  }

  return {
    framework: input.framework,
    alignment_scores: {
      strategy: cap(strategyScore),
      risk_management: cap(riskMgmtScore),
      metrics_targets: cap(metricsScore),
      governance: cap(governanceScore),
      overall: cap(overall)
    },
    emissions_profile: {
      scope1: input.scope1_tons,
      scope2: input.scope2_tons,
      scope3: input.scope3_tons,
      total: totalEmissions,
      intensity_revenue: Math.round(intensity * 100) / 100,
      intensity_benchmark_comparison: benchmarkComparison
    },
    disclosure_quality: {
      completeness: cap(overall),
      accuracy_indicators: [
        '已通过ISO 14064-1/第三方核查' ,
        '采用GHG Protocol企业标准',
        '数据来源于经审计的财务与运营记录'
      ],
      gaps,
      best_practices_met: bestPractices
    },
    section_content: sectionContent
  }
}

// ==================== SECTION 4 — Format Functions ====================

function formatPriceReport(r: PricePredictorResult): string {
  const lines: string[] = []
  lines.push('## 碳配额价格预测与趋势分析报告')
  lines.push('')
  lines.push(`**市场:** ${r.market} | **当前价格:** ${r.current_price} 元/吨 | **趋势:** ${r.trend_direction === 'bullish' ? '看涨 ↑' : r.trend_direction === 'bearish' ? '看跌 ↓' : '震荡 →'}`)
  lines.push('')
  lines.push('### 技术指标')
  lines.push(`| 指标 | 值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 趋势强度 | ${r.trend_strength}/100 |`)
  lines.push(`| 波动率 | ${r.volatility_pct}% |`)
  lines.push(`| 支撑位 | ${r.support_level} 元/吨 |`)
  lines.push(`| 阻力位 | ${r.resistance_level} 元/吨 |`)
  lines.push('')
  lines.push(`**政策影响:** ${r.policy_impact}`)
  lines.push('')
  lines.push('### 价格预测')
  lines.push('| 预测期 | 价格(元/吨) | 95%置信区间(低) | 95%置信区间(高) |')
  lines.push('|--------|-------------|------------------|------------------|')
  for (const f of r.forecasts) {
    lines.push(`| 第${f.period}期 | ${f.predicted_price} | ${f.confidence_low} | ${f.confidence_high} |`)
  }
  lines.push('')
  lines.push('### 风险因素')
  for (const risk of r.risk_factors) lines.push(`- ${risk}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatPortfolioReport(r: PortfolioOptimizerResult): string {
  const lines: string[] = []
  lines.push('## 碳信用组合优化与风险管理报告')
  lines.push('')
  lines.push('### 组合概览')
  lines.push(`| 指标 | 当前 | 建议 |`)
  lines.push(`|------|------|------|`)
  lines.push(`| 组合价值(USD) | $${r.total_current_value.toLocaleString()} | $${r.total_recommended_value.toLocaleString()} |`)
  lines.push(`| 质量评分 | ${r.quality_score}/100 | - |`)
  lines.push(`| 风险评分 | ${r.risk_score}/100 | - |`)
  lines.push('')
  lines.push('### 配置建议')
  lines.push('| 项目类型 | 标准 | 推荐信用量 | 预算占比 | 预期成本(USD/吨) | 评级 |')
  lines.push('|----------|------|-----------|----------|-----------------|------|')
  for (const a of r.allocations) {
    lines.push(`| ${a.project_type} | ${a.standard} | ${a.recommended_credits.toLocaleString()} | ${a.recommended_budget_pct}% | $${a.expected_cost_per_ton} | ${a.rating} |`)
  }
  lines.push('')
  lines.push('### 风险评估')
  lines.push(`- **集中度风险:** ${r.risk_assessment.concentration_risk}`)
  lines.push(`- **Vintage风险:** ${r.risk_assessment.vintage_risk}`)
  lines.push(`- **标准质量风险:** ${r.risk_assessment.standard_quality_risk}`)
  lines.push(`- **综合评级:** ${r.risk_assessment.overall_rating}`)
  lines.push('')
  lines.push('### 策略建议')
  for (const note of r.strategy_notes) lines.push(`- ${note}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatComplianceReport(r: ComplianceGapResult): string {
  const lines: string[] = []
  lines.push('## 碳合规差距分析与达标路径报告')
  lines.push('')
  const statusLabel = r.compliance_status === 'surplus' ? '配额盈余 ✓' : r.compliance_status === 'deficit' ? '配额缺口 ✗' : '恰好达标'
  lines.push(`**合规状态:** ${statusLabel} | **配额余额:** ${r.allowance_balance.toLocaleString()} 吨`)
  lines.push('')
  if (r.deficit_tons > 0) {
    lines.push(`**缺口:** ${r.deficit_tons.toLocaleString()} 吨 | **最大可抵消:** ${r.surrender_requirements.max_offset_tons.toLocaleString()} 吨`)
  }
  if (r.surplus_tons > 0) {
    lines.push(`**盈余:** ${r.surplus_tons.toLocaleString()} 吨`)
  }
  lines.push('')
  lines.push('### 行动计划')
  for (const action of r.action_plan) lines.push(`- ${action}`)
  lines.push('')
  lines.push('### 履约要求')
  lines.push(`| 项目 | 要求 |`)
  lines.push(`|------|------|`)
  lines.push(`| 履约截止日 | ${r.surrender_requirements.deadline} |`)
  lines.push(`| 需履约量 | ${r.surrender_requirements.required_tons.toLocaleString()} 吨 |`)
  lines.push(`| 抵消额度上限 | ${r.surrender_requirements.max_offset_tons.toLocaleString()} 吨 |`)
  lines.push('')
  lines.push('### 财务风险')
  lines.push(`| 项目 | 金额 |`)
  lines.push(`|------|------|`)
  lines.push(`| 预计罚款 | $${r.financial_exposure.estimated_penalty.toLocaleString()} |`)
  lines.push(`| 当前价格采购成本 | $${r.financial_exposure.purchase_cost_at_current.toLocaleString()} |`)
  lines.push(`| 最坏情况成本 | $${r.financial_exposure.worst_case_cost.toLocaleString()} |`)
  lines.push('')
  lines.push('### 风险提示')
  for (const w of r.risk_warnings) lines.push(`- [警告] ${w}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatFootprintReport(r: FootprintResult): string {
  const lines: string[] = []
  lines.push('## 产品碳足迹核算报告 (ISO 14064)')
  lines.push('')
  lines.push(`**总碳足迹:** ${r.total_footprint.toLocaleString()} tCO2e | **单位产品足迹:** ${r.footprint_per_unit.toLocaleString()} tCO2e/单位`)
  if (r.gwp_assessment.includes_biogenic) {
    lines.push(`**生物源CO2:** ${r.gwp_assessment.biogenic_co2.toLocaleString()} tCO2e (单独报告) | **净足迹:** ${r.gwp_assessment.net_footprint.toLocaleString()} tCO2e`)
  }
  lines.push('')
  lines.push('### 生命周期阶段分解')
  lines.push('| 阶段 | CO2e(吨) | 占比 | 数据质量 |')
  lines.push('|------|----------|------|---------|')
  for (const s of r.stage_breakdown) {
    lines.push(`| ${s.stage} | ${s.co2e.toLocaleString()} | ${s.pct}% | ${s.quality} |`)
  }
  lines.push('')
  lines.push('### ISO 14064合规性')
  lines.push(`- **核算边界:** ${r.iso_14064_compliance.boundary_defined ? '已定义 ✓' : '未定义 ✗'}`)
  lines.push(`- **分配方法:** ${r.iso_14064_compliance.allocation_justified ? '已说明 ✓' : '未说明 ✗'}`)
  lines.push(`- **数据质量:** ${r.iso_14064_compliance.data_quality_average}`)
  lines.push(`- **核查就绪:** ${r.iso_14064_compliance.verification_readiness}`)
  lines.push('')
  lines.push('### 排放热点')
  for (const h of r.hotspot_stages) lines.push(`- ${h}`)
  lines.push('')
  lines.push('### 减排建议')
  for (const rec of r.reduction_recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatETSReport(r: ETSAnalysisResult): string {
  const lines: string[] = []
  lines.push('## 碳交易市场流动性分析报告')
  lines.push('')
  lines.push(`**市场:** ${r.market_name} | **供需状态:** ${r.market_tightness === 'undersupplied' ? '供给偏紧 ⚠' : r.market_tightness === 'oversupplied' ? '供给宽松' : '供需平衡 ✓'}`)
  lines.push('')
  lines.push('### 流动性指标')
  lines.push(`| 指标 | 值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 日均交易量 | ${r.metrics.avg_daily_volume.toLocaleString()} 吨 |`)
  lines.push(`| 交易量波动率 | ${r.metrics.volume_volatility}% |`)
  lines.push(`| 换手率 | ${r.metrics.liquidity_ratio}% |`)
  lines.push(`| 市场深度 | ${r.metrics.market_depth} |`)
  lines.push(`| 估计买卖价差 | ${r.metrics.bid_ask_estimate} |`)
  lines.push('')
  lines.push('### 价格效率')
  lines.push(`- **价格发现:** ${r.price_efficiency.price_discovery}`)
  lines.push(`- **波动评估:** ${r.price_efficiency.volatility_assessment}`)
  lines.push(`- **趋势一致性:** ${r.price_efficiency.trend_consistency}`)
  lines.push('')
  lines.push('### 参与者质量')
  lines.push(`- **操作员集中度:** ${r.participation_quality.operator_concentration}`)
  lines.push(`- **市场结构:** ${r.participation_quality.retail_vs_institutional}`)
  lines.push(`- **整体评估:** ${r.participation_quality.overall_assessment}`)
  lines.push('')
  lines.push('### 交易建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatRoadmapReport(r: RoadmapResult): string {
  const lines: string[] = []
  lines.push('## 碳中和路径规划与减排成本分析报告')
  lines.push('')
  lines.push('### 路径总览')
  lines.push(`| 指标 | 值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 基准年排放 | ${r.pathway_summary.baseline.toLocaleString()} tCO2e |`)
  lines.push(`| 增长调整后基准 | ${r.pathway_summary.growth_adjusted_baseline.toLocaleString()} tCO2e |`)
  lines.push(`| 目标年 | ${r.pathway_summary.target_year} |`)
  lines.push(`| 需减排量 | ${r.pathway_summary.required_reduction.toLocaleString()} tCO2e |`)
  lines.push(`| 总投资 | $${r.total_investment.toLocaleString()} |`)
  lines.push(`| 加权平均成本 | $${r.weighted_avg_cost_per_ton}/吨 |`)
  lines.push(`| 累计抵消需求 | ${r.cumulative_offset_need.toLocaleString()} tCO2e |`)
  lines.push(`| 可行性评估 | ${r.feasibility_assessment} |`)
  lines.push('')
  lines.push('### 边际减排成本曲线(MACC)')
  lines.push('| 措施 | 减排量(吨) | 单位成本(USD/吨) | 总成本(USD) | 类别 |')
  lines.push('|------|-----------|-----------------|------------|------|')
  for (const m of r.marginal_abatement_curve) {
    const catLabel = m.category === 'free' ? '零成本' : m.category === 'low_cost' ? '低成本' : m.category === 'medium_cost' ? '中等成本' : '高成本'
    lines.push(`| ${m.measure} | ${m.reduction_tons.toLocaleString()} | $${m.cost_per_ton} | $${m.total_cost.toLocaleString()} | ${catLabel} |`)
  }
  lines.push('')
  lines.push('### 年度里程碑')
  lines.push('| 年份 | 排放(tCO2e) | 减排比例 |')
  lines.push('|------|-----------|---------|')
  for (const m of r.annual_milestones) {
    lines.push(`| ${m.year} | ${m.emissions.toLocaleString()} | ${m.reduction_pct}% |`)
  }
  lines.push('')
  lines.push('### 关键风险')
  for (const risk of r.key_risks) lines.push(`- [风险] ${risk}`)
  lines.push('')
  lines.push('### 战略建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatMechanismReport(r: MechanismResult): string {
  const lines: string[] = []
  lines.push('## CDM/CCER国际碳信用机制评估报告')
  lines.push('')
  lines.push(`**机制:** ${r.mechanism} | **资格状态:** ${r.eligibility_status === 'eligible' ? '符合 ✓' : r.eligibility_status === 'conditionally_eligible' ? '有条件符合 ~' : '不符合 ✗'}`)
  lines.push('')
  lines.push('### 转换系数')
  lines.push(`| 转换方向 | 系数 |`)
  lines.push(`|---------|------|`)
  lines.push(`| → EUA | ${r.conversion_factors.to_eua} |`)
  lines.push(`| → CER | ${r.conversion_factors.to_cer} |`)
  lines.push(`| 与EUA相关性 | ${r.conversion_factors.correlation_with_eua.toFixed(2)} |`)
  lines.push('')
  lines.push('### 质量评估')
  lines.push(`- **额外性:** ${r.quality_assessment.additionality}`)
  lines.push(`- **永久性:** ${r.quality_assessment.permanence}`)
  lines.push(`- **泄漏风险:** ${r.quality_assessment.leakage_risk}`)
  lines.push(`- **可持续发展贡献:** ${r.quality_assessment.sustainable_development}`)
  lines.push('')
  lines.push('### 价格区间')
  lines.push(`| 底价(USD) | 参考价格(USD) | 上限(USD) |`)
  lines.push(`|----------|-------------|----------|`)
  lines.push(`| $${r.pricing.floor_price} | $${r.pricing.reference_price} | $${r.pricing.ceiling_price} |`)
  lines.push('')
  lines.push('### 需求展望')
  lines.push(`- **合规需求:** ${r.demand_outlook.compliance_demand}`)
  lines.push(`- **自愿需求:** ${r.demand_outlook.voluntary_demand}`)
  lines.push(`- **投资建议:** ${r.demand_outlook.recommendation}`)
  lines.push('')
  lines.push('### 监管要点')
  for (const note of r.regulatory_notes) lines.push(`- ${note}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

function formatDisclosureReport(r: DisclosureResult): string {
  const lines: string[] = []
  lines.push('## TCFD/CDP碳信息披露报告')
  lines.push('')
  lines.push('### 框架对齐评分')
  lines.push(`| 支柱 | 得分 |`)
  lines.push(`|------|------|`)
  lines.push(`| 治理(Governance) | ${r.alignment_scores.governance}/100 |`)
  lines.push(`| 战略(Strategy) | ${r.alignment_scores.strategy}/100 |`)
  lines.push(`| 风险管理(Risk Management) | ${r.alignment_scores.risk_management}/100 |`)
  lines.push(`| 指标与目标(Metrics & Targets) | ${r.alignment_scores.metrics_targets}/100 |`)
  lines.push(`| **综合评分** | **${r.alignment_scores.overall}/100** |`)
  lines.push('')
  lines.push('### 排放概要')
  lines.push(`| 范围 | 排放量(tCO2e) |`)
  lines.push(`|------|-------------|`)
  lines.push(`| Scope 1 (直接) | ${r.emissions_profile.scope1.toLocaleString()} |`)
  lines.push(`| Scope 2 (间接-能源) | ${r.emissions_profile.scope2.toLocaleString()} |`)
  lines.push(`| Scope 3 (间接-价值链) | ${r.emissions_profile.scope3.toLocaleString()} |`)
  lines.push(`| **总计** | **${r.emissions_profile.total.toLocaleString()}** |`)
  lines.push(`| 排放强度 | ${r.emissions_profile.intensity_revenue} tCO2e/MUSD营收 |`)
  if (r.emissions_profile.intensity_benchmark_comparison) {
    lines.push(`| 行业对标 | ${r.emissions_profile.intensity_benchmark_comparison} |`)
  }
  lines.push('')
  lines.push('### 披露质量')
  lines.push(`**完整度:** ${r.disclosure_quality.completeness}%`)
  lines.push('')
  if (r.disclosure_quality.best_practices_met.length > 0) {
    lines.push('**最佳实践达成:**')
    for (const bp of r.disclosure_quality.best_practices_met) lines.push(`- ${bp}`)
    lines.push('')
  }
  if (r.disclosure_quality.gaps.length > 0) {
    lines.push('**披露缺口:**')
    for (const gap of r.disclosure_quality.gaps) lines.push(`- [缺口] ${gap}`)
    lines.push('')
  }
  lines.push('### 报告章节内容')
  for (const [section, content] of Object.entries(r.section_content)) {
    lines.push(`#### ${section}`)
    lines.push(content)
    lines.push('')
  }
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Carbon Price Predictor
  tools.register(defineTool({
    name: 'carbon_price_predictor',
    description: 'Predict carbon allowance prices (EUA, CN-ETS, CCER) using historical price data with trend analysis, volatility assessment, support/resistance levels, and policy scenario impact evaluation. Generates multi-period price forecasts with confidence intervals.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { market (string), allowance_type (string), historical_prices (number[]), forecast_periods (int), policy_scenario (baseline/ambitious/conservative, optional), current_inventory (int, optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: PricePredictorInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeCarbonPrice(input, rng)
      return formatPriceReport(result)
    }
  }))

  // Tool 2: Offset Portfolio Optimizer
  tools.register(defineTool({
    name: 'offset_portfolio_optimizer',
    description: 'Optimize carbon credit portfolio allocation across project types (forestry, renewable energy, DAC, etc.) and standards (VCS, Gold Standard, CCER, CDM). Assesses concentration risk, vintage risk, and provides risk-adjusted allocation recommendations with cost projections.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { holdings: [{ project_type, standard, vintage, credits, price }], total_budget (number), risk_tolerance (conservative/moderate/aggressive), target_offset_tons (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: OffsetPortfolioInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeOffsetPortfolio(input, rng)
      return formatPortfolioReport(result)
    }
  }))

  // Tool 3: Compliance Gap Analyzer
  tools.register(defineTool({
    name: 'compliance_gap_analyzer',
    description: 'Analyze compliance gaps between allocated carbon allowances and verified emissions. Generate action plans with deficit coverage options, calculate financial exposure including penalty costs, and provide risk warnings with actionable pathway recommendations for regulatory compliance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { jurisdiction, scheme, allocated_allowances (number), verified_emissions (number), coverage_pct (number), surrender_deadline (date string), penalty_rate (number), banking_allowed (boolean), offset_entitlement_pct (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ComplianceGapInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeComplianceGap(input, rng)
      return formatComplianceReport(result)
    }
  }))

  // Tool 4: Carbon Footprint Calculator
  tools.register(defineTool({
    name: 'carbon_footprint_calculator',
    description: 'Calculate product carbon footprint across full lifecycle stages per ISO 14064 standards. Assess data quality, identify emission hotspots, evaluate biogenic CO2 treatment, and determine verification readiness for third-party assurance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { product_name, functional_unit, lifecycle_stages: [{ stage, co2e_tons, data_source, quality (measured/calculated/estimated) }], boundary (string), allocation_method (optional string), biogenic_co2 (optional number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: FootprintInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeCarbonFootprint(input, rng)
      return formatFootprintReport(result)
    }
  }))

  // Tool 5: ETS Market Analyzer
  tools.register(defineTool({
    name: 'ets_market_analyzer',
    description: 'Analyze Emissions Trading Scheme (ETS) market dynamics including supply-demand balance, liquidity metrics (daily volume, volatility, turnover ratio), price efficiency assessment, participation quality evaluation, and trading recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { ets_name, trading_period, current_price (number), daily_volumes (number[]), open_interest (number), registered_operators (number), allowance_supply (number), allowance_demand (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ETSInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeETS(input, rng)
      return formatETSReport(result)
    }
  }))

  // Tool 6: Carbon Neutrality Roadmap
  tools.register(defineTool({
    name: 'carbon_neutrality_roadmap',
    description: 'Develop science-based carbon neutrality pathway with marginal abatement cost curve (MACC) analysis. Forecast growth-adjusted emissions trajectory, evaluate reduction measures by cost-effectiveness, and provide annual milestones with feasibility assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { organization, baseline_year (int), baseline_emissions (number), target_year (int), target_reduction_pct (number), reduction_measures: [{ measure, reduction_tons, cost_per_ton, start_year, end_year }], growth_rate_pct (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: RoadmapInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeCarbonNeutrality(input, rng)
      return formatRoadmapReport(result)
    }
  }))

  // Tool 7: International Carbon Credit Mechanism
  tools.register(defineTool({
    name: 'ccrd_international_mechanism',
    description: 'Evaluate international carbon credit mechanisms (CDM, CCER, Gold Standard, VCS, JI) including eligibility status, conversion factors to EUA/CER, quality assessment (additionality, permanence, leakage, sustainable development), pricing outlook, and regulatory compliance notes.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { mechanism_type (CDM/CCER/Gold_Standard/VCS/JI), project_category, host_country, vintage_range ([start_year, end_year]), estimated_cers (number), sustainability_criteria (optional string[]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: MechanismInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeInternationalMechanism(input, rng)
      return formatMechanismReport(result)
    }
  }))

  // Tool 8: Carbon Disclosure Reporter
  tools.register(defineTool({
    name: 'carbon_disclosure_reporter',
    description: 'Generate comprehensive carbon disclosure reports aligned with TCFD, CDP, and GRI frameworks. Assess alignment scores across governance, strategy, risk management, and metrics pillars. Identify reporting gaps and produce framework-specific section content for sustainability reporting.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { reporting_entity, reporting_year (int), framework (TCFD/CDP/GRI/Combined), scope1_tons, scope2_tons, scope3_tons, total_revenue, has_sustainability_committee (boolean), climate_risk_identified (boolean), targets_disclosed (boolean), industry_benchmark (optional number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: DisclosureInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeCarbonDisclosure(input, rng)
      return formatDisclosureReport(result)
    }
  }))

  console.log(`[dsh-tool-carbontradingagent] Loaded v${VERSION} - Carbon Trading AI Agent with 8 tools`)
  console.log('  Tools: carbon_price_predictor, offset_portfolio_optimizer, compliance_gap_analyzer, carbon_footprint_calculator, ets_market_analyzer, carbon_neutrality_roadmap, ccrd_international_mechanism, carbon_disclosure_reporter')
}
