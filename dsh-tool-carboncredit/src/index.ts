/**
 * DSH Carbon Credit & Offset Marketplace Plugin v0.1.0
 *
 * Comprehensive carbon credit verification, offset project evaluation, carbon footprint
 * calculation, and registry management toolkit for DeepSeek Harness Agent.
 * Designed for carbon market participants, sustainability teams, ESG auditors,
 * project developers, and compliance officers navigating the global carbon markets.
 *
 * Market Context (2026):
 * - Voluntary carbon market projected to reach $50B by 2030
 * - Compliance markets exceed $900B globally
 *
 * Features (v0.1.0):
 * 1. Carbon Footprint Calculator     — Full lifecycle carbon footprint per ISO 14064/GHG Protocol
 * 2. Offset Project Evaluator        — Carbon offset project quality and viability scoring
 * 3. Credit Verification Engine      — Carbon credit authenticity and additionality verification
 * 4. Registry Transaction Manager    — Carbon credit registry issuance, transfer, and retirement
 * 5. Carbon Neutrality Roadmap       — Science-based carbon neutrality pathway planning
 * 6. Scope Emissions Tracker         — Scope 1/2/3 emissions tracking and intensity analysis
 * 7. Offset Portfolio Optimizer      — Multi-standard offset portfolio risk-return optimization
 * 8. Carbon Price Forecaster         — Carbon credit price forecasting with market signals
 *
 * @module dsh-tool-carboncredit
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-carboncredit'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '免责声明: 本分析基于AI模型推断与公开数据，仅供碳市场参考，不替代专业碳核查、金融投资和法律合规意见。碳价格预测和项目开发具有固有不确定性，实际交易决策请咨询持牌专业顾问。'

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

// --- Tool 1: Carbon Footprint Calculator ---
export interface FootprintInput {
  entity_name: string
  reporting_period: string
  boundary: string
  lifecycle_stages: Array<{ stage: string; co2e_tons: number; data_source: string; quality: 'measured' | 'calculated' | 'estimated' }>
  gwp_version?: string
  biogenic_co2?: number
  allocation_method?: string
}

export interface FootprintStageBreakdown {
  stage: string
  co2e_tons: number
  percentage: number
  data_quality: string
}

export interface FootprintGWP {
  includes_biogenic: boolean
  biogenic_co2_tons: number
  net_footprint: number
}

export interface FootprintVerificationReadiness {
  boundary_defined: boolean
  allocation_justified: boolean
  data_quality_score: number
  is_ready: boolean
  recommendation: string
}

export interface FootprintResult {
  total_footprint_tons: number
  net_footprint_tons: number
  stage_breakdown: FootprintStageBreakdown[]
  gwp_assessment: FootprintGWP
  verification_readiness: FootprintVerificationReadiness
  hotspot_stages: string[]
  reduction_recommendations: string[]
  benchmark_comparison: string
}

// --- Tool 2: Offset Project Evaluator ---
export interface OffsetProjectInput {
  project_name: string
  project_type: string
  standard: string
  host_country: string
  vintage_year: number
  estimated_annual_reduction_tons: number
  methodology: string
  developer_experience_years: number
  has_third_party_validation: boolean
  sdgs_contributed?: string[]
  permanence_risk?: 'low' | 'medium' | 'high'
  leakage_assessment?: 'low' | 'medium' | 'high'
}

export interface ProjectQualityAssessment {
  additionality_score: number
  permanence_score: number
  leakage_score: number
  transparency_score: number
  sustainable_dev_score: number
  overall_quality_score: number
}

export interface OffsetProjectResult {
  project_name: string
  eligibility_status: 'eligible' | 'conditionally_eligible' | 'ineligible'
  quality_assessment: ProjectQualityAssessment
  risk_factors: string[]
  sdgs_alignment: string[]
  validation_status: string
  recommendation: string
  confidence_level: string
}

// --- Tool 3: Credit Verification Engine ---
export interface CreditVerificationInput {
  credit_id: string
  registry: string
  standard: string
  vintage_year: number
  project_type: string
  serial_number: string
  quantity_tons: number
  retirement_status: string
  verification_body?: string
  issuance_date?: string
}

export interface VerificationCheck {
  check_name: string
  status: 'passed' | 'failed' | 'warning'
  detail: string
}

export interface CreditVerificationResult {
  credit_id: string
  is_authentic: boolean
  overall_status: 'verified' | 'conditionally_verified' | 'failed'
  verification_checks: VerificationCheck[]
  registry_record_match: string
  additionality_verified: boolean
  double_counting_risk: string
  permanence_confirmed: boolean
  recommendation: string
}

// --- Tool 4: Registry Transaction Manager ---
export interface RegistryTransactionInput {
  transaction_type: 'issuance' | 'transfer' | 'retirement' | 'cancellation'
  registry: string
  credit_standard: string
  project_id: string
  quantity_tons: number
  from_account?: string
  to_account?: string
  beneficiary?: string
  retirement_purpose?: string
  vintage_year: number
}

export interface TransactionFee {
  fee_type: string
  amount_usd: number
  description: string
}

export interface RegistryTransactionResult {
  transaction_id: string
  transaction_type: string
  status: 'pending' | 'confirmed' | 'rejected'
  registry: string
  credit_details: {
    standard: string
    project_id: string
    vintage_year: number
    quantity_tons: number
    serial_range: string
  }
  fees: TransactionFee[]
  total_fee_usd: number
  estimated_processing_time: string
  compliance_notes: string[]
  receipt: string
}

// --- Tool 5: Carbon Neutrality Roadmap ---
export interface NeutralityRoadmapInput {
  organization: string
  baseline_year: number
  baseline_emissions_tons: number
  target_year: number
  target_type: ' carbon_neutral' | 'net_zero' | 'science_based'
  target_reduction_pct: number
  annual_revenue_usd: number
  industry_sector: string
  existing_initiatives?: string[]
}

export interface EmissionTrajectory {
  year: number
  projected_emissions: number
  reduction_pct: number
  cumulative_reduction: number
  offset_requirement: number
}

export interface RoadmapMilestone {
  year: number
  target_reduction_pct: string
  key_actions: string[]
  estimated_cost_usd: number
}

export interface NeutralityRoadmapResult {
  target_summary: {
    organization: string
    baseline_year: number
    baseline_emissions_tons: number
    target_year: number
    target_type: string
    target_reduction_pct: number
  }
  emission_trajectory: EmissionTrajectory[]
  milestones: RoadmapMilestone[]
  total_investment_usd: number
  annual_offset_costs: Array<{ year: number; offset_tons: number; cost_usd: number }>
  feasibility_assessment: string
  key_risks: string[]
  recommendations: string[]
}

// --- Tool 6: Scope Emissions Tracker ---
export interface ScopeEmissionsInput {
  entity_name: string
  reporting_year: number
  scope1_direct_tons: number
  scope2_location_tons: number
  scope2_market_tons: number
  scope3_categories: Array<{ category: string; tons: number; data_quality: 'high' | 'medium' | 'low' }>
  total_revenue_usd: number
  employee_count: number
  industry_sector: string
  historical_data?: Array<{ year: number; scope1: number; scope2: number; scope3: number }>
}

export interface ScopeBreakdown {
  scope1_direct: number
  scope2_location_based: number
  scope2_market_based: number
  scope3_total: number
  scope3_categories: Array<{ category: string; tons: number; pct_of_scope3: number; data_quality: string }>
  total_location_based: number
  total_market_based: number
}

export interface EmissionsIntensity {
  per_revenue: number
  per_employee: number
  unit: string
}

export interface ScopeEmissionsResult {
  entity_name: string
  reporting_year: number
  scope_breakdown: ScopeBreakdown
  intensity_metrics: EmissionsIntensity
  trend_analysis: string
  ghg_protocol_alignment: string
  materiality_assessment: string
  data_quality_overview: {
    high_quality_pct: number
    medium_quality_pct: number
    low_quality_pct: number
    overall_rating: string
  }
  recommendations: string[]
}

// --- Tool 7: Offset Portfolio Optimizer ---
export interface PortfolioOptimizerInput {
  portfolio_name: string
  total_budget_usd: number
  target_offset_tons: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  current_holdings?: Array<{ standard: string; project_type: string; vintage: number; credits: number; avg_price_usd: number }>
  preferred_regions?: string[]
  excluded_project_types?: string[]
}

export interface PortfolioAllocation {
  standard: string
  project_type: string
  allocation_pct: number
  recommended_credits: number
  price_per_ton: number
  total_cost: number
  quality_rating: string
  rationale: string
}

export interface PortfolioRiskMetrics {
  concentration_index: number
  vintage_diversification: string
  geographic_diversification: string
  standard_diversification: string
  overall_risk_score: number
}

export interface PortfolioOptimizerResult {
  portfolio_name: string
  strategy_summary: string
  allocations: PortfolioAllocation[]
  total_investment: number
  cost_per_ton: number
  remaining_budget: number
  risk_metrics: PortfolioRiskMetrics
  projected_impact: {
    total_offset_tons: number
    additional_benefits: string[]
  }
  rebalancing_recommendations: string[]
}

// --- Tool 8: Carbon Price Forecaster ---
export interface PriceForecasterInput {
  market: string
  credit_type: string
  current_price_usd: number
  historical_prices: number[]
  forecast_months: number
  market_sentiment?: 'bullish' | 'neutral' | 'bearish'
  policy_developments?: string[]
}

export interface PriceForecastPoint {
  month: number
  predicted_price: number
  confidence_low: number
  confidence_high: number
}

export interface MarketSignalIndicator {
  signal: string
  direction: 'positive' | 'negative' | 'neutral'
  weight: number
  description: string
}

export interface PriceForecasterResult {
  market: string
  credit_type: string
  current_price_usd: number
  forecast_summary: {
    direction: 'upward' | 'downward' | 'stable'
    predicted_change_pct: number
    avg_forecast_price: number
    max_price: number
    min_price: number
  }
  monthly_forecasts: PriceForecastPoint[]
  market_signals: MarketSignalIndicator[]
  volatility_assessment: string
  trading_implications: string[]
  disclaimer_applied: boolean
}

// ==================== SECTION 3 — Analyze Functions ====================

// Tool 1: Carbon Footprint Calculator
function analyzeFootprint(input: FootprintInput, rng: SeededRandom): FootprintResult {
  const qualityScores: Record<string, number> = { measured: 3, calculated: 2, estimated: 1 }
  let qualitySum = 0
  const stages = input.lifecycle_stages.map(s => {
    const qScore = qualityScores[s.quality] ?? 1
    qualitySum += qScore
    return { stage: s.stage, co2e: s.co2e_tons, data_source: s.data_source, quality: s.quality, qScore }
  })

  const totalGross = stages.reduce((s, st) => s + st.co2e, 0)
  const totalQuality = stages.length > 0 ? qualitySum / stages.length : 1
  const qualityPct = Math.round((totalQuality / 3) * 100)

  const breakdown: FootprintStageBreakdown[] = stages.map(s => ({
    stage: s.stage,
    co2e_tons: Math.round(s.co2e * 100) / 100,
    percentage: totalGross > 0 ? Math.round((s.co2e / totalGross) * 1000) / 10 : 0,
    data_quality: s.quality
  }))

  const biogenicCO2 = input.biogenic_co2 ?? 0
  const netFootprint = totalGross - biogenicCO2

  const isReady = totalQuality >= 2 && !!input.boundary && (!!input.allocation_method || stages.length <= 1)
  const readinessRec = isReady
    ? '数据来源和质量满足核查要求，可直接提交第三方核查'
    : '建议提升数据质量: 将估算数据替换为实测或计算数据，完善核算边界说明'

  const sortedStages = [...stages].sort((a, b) => b.co2e - a.co2e)
  const hotspots = sortedStages.slice(0, Math.min(3, sortedStages.length)).map(s => s.stage)

  const recommendations: string[] = []
  const estimatedStages = stages.filter(s => s.quality === 'estimated')
  if (estimatedStages.length > 0) {
    recommendations.push('改进' + estimatedStages.length + '个估算阶段的数据收集: 采用实测排放因子或计算模型替换')
  }
  recommendations.push('优先针对排放热点(' + hotspots.slice(0, 2).join('、') + ')制定减排方案')
  if (biogenicCO2 > 0) {
    recommendations.push('确保生物源CO2按照ISO 14064-1要求单独报告，不计入总足迹')
  }
  recommendations.push('建立年度碳足迹追踪机制，实现同比减排监控')
  recommendations.push('考虑获取ISO 14064-3第三方核查声明以增强报告可信度')

  const benchmarkComparison = totalGross > 50000
    ? '排放规模较大(>' + Math.round(totalGross).toLocaleString() + ' tCO2e)，建议对标行业领先企业进行减排规划'
    : '处于中等排放水平，具有良好的减排潜力和成本优势'

  return {
    total_footprint_tons: Math.round(totalGross * 100) / 100,
    net_footprint_tons: Math.round(netFootprint * 100) / 100,
    stage_breakdown: breakdown,
    gwp_assessment: {
      includes_biogenic: biogenicCO2 > 0,
      biogenic_co2_tons: biogenicCO2,
      net_footprint: Math.round(netFootprint * 100) / 100
    },
    verification_readiness: {
      boundary_defined: !!input.boundary,
      allocation_justified: !!input.allocation_method,
      data_quality_score: qualityPct,
      is_ready: isReady,
      recommendation: readinessRec
    },
    hotspot_stages: hotspots,
    reduction_recommendations: recommendations,
    benchmark_comparison: benchmarkComparison
  }
}

// Tool 2: Offset Project Evaluator
function analyzeOffsetProject(input: OffsetProjectInput, rng: SeededRandom): OffsetProjectResult {
  const standardScores: Record<string, number> = {
    'Gold Standard': 95, 'VCS': 88, 'CAR': 82, 'ACR': 78,
    'CCER': 75, 'CDM': 70, 'Plan Vivo': 85, 'Social Carbon': 72
  }
  const stdScore = standardScores[input.standard] ?? 70

  const additionality = Math.min(100, Math.round(
    stdScore * 0.4 +
    (input.methodology ? 25 : 5) +
    (input.has_third_party_validation ? 20 : 0) +
    rng.nextInt(5, 15)
  ))

  const permanenceScores: Record<string, number> = { low: 90, medium: 65, high: 35 }
  const permanence = permanenceScores[input.permanence_risk ?? 'medium'] ?? 60

  const leakageScores: Record<string, number> = { low: 85, medium: 60, high: 30 }
  const leakage = leakageScores[input.leakage_assessment ?? 'medium'] ?? 55

  const transparency = Math.min(100, Math.round(
    (input.has_third_party_validation ? 40 : 10) +
    (input.methodology ? 30 : 5) +
    (input.sdgs_contributed && input.sdgs_contributed.length > 0 ? 15 : 0) +
    rng.nextInt(5, 20)
  ))

  const sdgs = input.sdgs_contributed ?? ['SDG 13: Climate Action']
  const sdgScore = Math.min(100, 50 + sdgs.length * 8 + rng.nextInt(5, 15))

  const overall = Math.round((additionality + permanence + leakage + transparency + sdgScore) / 5)

  const eligibility: 'eligible' | 'conditionally_eligible' | 'ineligible' =
    overall >= 75 ? 'eligible' : overall >= 50 ? 'conditionally_eligible' : 'ineligible'

  const riskFactors: string[] = []
  if (permanence < 50) riskFactors.push('高永久性风险: 项目存在碳逆转可能性，建议核查缓冲池机制')
  if (leakage < 50) riskFactors.push('泄漏风险较高: 需评估项目边界以外的排放转移')
  if (input.developer_experience_years < 3) riskFactors.push('开发商经验不足(< 3年): 关注项目执行能力')
  if (input.vintage_year < 2020) riskFactors.push('老旧vintage信用: 市场接受度可能受限')
  if (!input.has_third_party_validation) riskFactors.push('未经第三方验证: 建议获取验证以增强可信度')
  riskFactors.push('碳市场价格波动可能影响项目经济性')

  const validationStatus = input.has_third_party_validation
    ? '已通过第三方验证，验证机构信誉良好'
    : '未获取第三方验证 — 建议安排独立审定与核查'

  const recommendation = eligibility === 'eligible'
    ? '项目质量良好，建议纳入抵消策略，优先采购'
    : eligibility === 'conditionally_eligible'
    ? '有条件符合，建议关注验证进展和风险缓解措施后再决策'
    : '项目质量不足，建议改善后再评估或选择替代项目'

  const confidence = overall >= 80 ? '高置信度' : overall >= 60 ? '中等置信度' : '低置信度 — 需补充信息'

  return {
    project_name: input.project_name,
    eligibility_status: eligibility,
    quality_assessment: {
      additionality_score: additionality,
      permanence_score: permanence,
      leakage_score: leakage,
      transparency_score: transparency,
      sustainable_dev_score: sdgScore,
      overall_quality_score: overall
    },
    risk_factors: riskFactors,
    sdgs_alignment: sdgs,
    validation_status: validationStatus,
    recommendation,
    confidence_level: confidence
  }
}

// Tool 3: Credit Verification Engine
function analyzeCreditVerification(input: CreditVerificationInput, rng: SeededRandom): CreditVerificationResult {
  const checks: VerificationCheck[] = []

  // Registry record check
  const registryValid = ['Gold Standard Registry', 'Verra VCS', 'ACR', 'CAR', 'CDM Registry', 'CCER Registry', 'APX', 'Biocarbon Registry'].includes(input.registry) || input.registry.length > 3
  checks.push({
    check_name: '注册系统记录核查',
    status: registryValid ? 'passed' : 'failed',
    detail: registryValid
      ? '注册系统(' + input.registry + ')识别成功，可进行记录匹配核查'
      : '注册系统无法识别: 请确认注册系统名称是否正确'
  })

  // Serial number format check
  const serialValid = input.serial_number.length >= 6
  checks.push({
    check_name: '序列号格式验证',
    status: serialValid ? 'passed' : 'failed',
    detail: serialValid
      ? '序列号(' + input.serial_number.substring(0, 8) + '...)格式有效'
      : '序列号格式异常: 长度不足，可能为伪造'
  })

  // Vintage year check
  const currentYear = 2026
  const vintageValid = input.vintage_year >= 2005 && input.vintage_year <= currentYear
  checks.push({
    check_name: 'Vintage年份合理性',
    status: vintageValid ? 'passed' : 'failed',
    detail: vintageValid
      ? 'Vintage年份' + input.vintage_year + '在合理范围内'
      : 'Vintage年份' + input.vintage_year + '异常: 超出有效范围(2005-' + currentYear + ')'
  })

  // Standard check
  const validStandards = ['Gold Standard', 'VCS', 'CAR', 'ACR', 'CCER', 'CDM', 'Plan Vivo', 'Social Carbon']
  const standardValid = validStandards.includes(input.standard)
  checks.push({
    check_name: '碳标准认证',
    status: standardValid ? 'passed' : 'warning',
    detail: standardValid
      ? '碳标准(' + input.standard + ')为国际认可标准'
      : '碳标准(' + input.standard + ')不在常见标准列表中，需进一步核实'
  })

  // Retirement status check
  const retirementValid = ['active', 'retired', 'cancelled', 'pending'].includes(input.retirement_status.toLowerCase())
  checks.push({
    check_name: '状态一致性检查',
    status: retirementValid ? 'passed' : 'warning',
    detail: retirementValid
      ? '信用状态(' + input.retirement_status + ')有效'
      : '信用状态异常: 请确认状态值'
  })

  // Quantity check
  const quantityValid = input.quantity_tons > 0 && input.quantity_tons <= 10000000
  checks.push({
    check_name: '数量合理性',
    status: quantityValid ? 'passed' : 'failed',
    detail: quantityValid
      ? '信用数量' + input.quantity_tons.toLocaleString() + '吨在合理范围内'
      : '信用数量异常: 超出合理范围'
  })

  // Verification body check
  if (input.verification_body) {
    checks.push({
      check_name: '核查机构验证',
      status: 'passed',
      detail: '核查机构(' + input.verification_body + ')已记录'
    })
  } else {
    checks.push({
      check_name: '核查机构验证',
      status: 'warning',
      detail: '未提供核查机构信息: 建议补充以增强可信度'
    })
  }

  const passedCount = checks.filter(c => c.status === 'passed').length
  const failedCount = checks.filter(c => c.status === 'failed').length
  const warningCount = checks.filter(c => c.status === 'warning').length

  const isAuthentic = failedCount === 0 && passedCount >= 4
  const overallStatus: 'verified' | 'conditionally_verified' | 'failed' =
    failedCount === 0 && passedCount >= 5 ? 'verified' :
    failedCount <= 1 ? 'conditionally_verified' : 'failed'

  const registryMatch = isAuthentic
    ? '注册系统记录与信用信息匹配，未发现异常'
    : '注册系统记录匹配存在异常，建议人工复核'

  const additionality = standardValid && input.vintage_year >= 2013
  const doubleCountingRisk = input.retirement_status.toLowerCase() === 'retired'
    ? '信用已退役，不存在重复计算风险'
    : '信用处于活跃状态，需确认未在多个注册系统同时申报'

  const permanenceConfirmed = ['forestry', 'redd+', 'blue carbon', 'soil carbon'].includes(input.project_type.toLowerCase())
    ? rng.nextFloat(0, 1) > 0.3
    : true

  const recommendation = overallStatus === 'verified'
    ? '信用验证通过，可安全纳入抵消策略'
    : overallStatus === 'conditionally_verified'
    ? '有条件通过: 建议补充缺失信息后重新验证'
    : '验证失败: 不建议使用该信用，请核查来源'

  return {
    credit_id: input.credit_id,
    is_authentic: isAuthentic,
    overall_status: overallStatus,
    verification_checks: checks,
    registry_record_match: registryMatch,
    additionality_verified: additionality,
    double_counting_risk: doubleCountingRisk,
    permanence_confirmed: permanenceConfirmed,
    recommendation
  }
}

// Tool 4: Registry Transaction Manager
function analyzeRegistryTransaction(input: RegistryTransactionInput, rng: SeededRandom): RegistryTransactionResult {
  const txTypes: Record<string, { feeRate: number; processingTime: string }> = {
    'issuance': { feeRate: 0.015, processingTime: '5-10个工作日' },
    'transfer': { feeRate: 0.005, processingTime: '1-3个工作日' },
    'retirement': { feeRate: 0.002, processingTime: '1-2个工作日' },
    'cancellation': { feeRate: 0.003, processingTime: '2-5个工作日' }
  }

  const config = txTypes[input.transaction_type] ?? txTypes['transfer']
  const baseFee = input.quantity_tons * config.feeRate * rng.nextFloat(8, 15)
  const processingFee = rng.nextFloat(50, 200)
  const totalFee = Math.round((baseFee + processingFee) * 100) / 100

  const fees: TransactionFee[] = [
    { fee_type: '交易手续费', amount_usd: Math.round(baseFee * 100) / 100, description: '基于信用数量(' + input.quantity_tons + '吨)和交易类型(' + input.transaction_type + ')计算' },
    { fee_type: '处理费', amount_usd: Math.round(processingFee * 100) / 100, description: '注册系统处理与记录更新费用' }
  ]

  const serialStart = rng.nextInt(1000000, 9999999)
  const serialEnd = serialStart + input.quantity_tons

  const complianceNotes: string[] = []
  complianceNotes.push('交易符合' + input.registry + '注册系统规则')
  if (input.transaction_type === 'retirement') {
    complianceNotes.push('退役操作不可逆，信用将从活跃账户永久移除')
    if (input.retirement_purpose) {
      complianceNotes.push('退役目的: ' + input.retirement_purpose)
    }
  }
  if (input.transaction_type === 'transfer') {
    complianceNotes.push('转让需双方账户均通过KYC认证')
  }
  if (input.vintage_year < 2020) {
    complianceNotes.push('注意: Vintage ' + input.vintage_year + '信用在部分合规市场可能受限')
  }
  complianceNotes.push('所有交易记录将在注册系统上永久保存，可供审计')

  const txId = 'TX-' + input.registry.substring(0, 3).toUpperCase() + '-' + serialStart + '-' + Date.now().toString(36).substring(0, 6)

  const receipt = '交易凭证: ' + txId + ' | 类型: ' + input.transaction_type + ' | 数量: ' + input.quantity_tons + '吨 | 注册系统: ' + input.registry + ' | 时间: ' + new Date().toISOString()

  return {
    transaction_id: txId,
    transaction_type: input.transaction_type,
    status: 'confirmed',
    registry: input.registry,
    credit_details: {
      standard: input.credit_standard,
      project_id: input.project_id,
      vintage_year: input.vintage_year,
      quantity_tons: input.quantity_tons,
      serial_range: serialStart.toString() + ' - ' + serialEnd.toString()
    },
    fees,
    total_fee_usd: totalFee,
    estimated_processing_time: config.processingTime,
    compliance_notes: complianceNotes,
    receipt
  }
}

// Tool 5: Carbon Neutrality Roadmap
function analyzeNeutralityRoadmap(input: NeutralityRoadmapInput, rng: SeededRandom): NeutralityRoadmapResult {
  const yearsToTarget = input.target_year - input.baseline_year
  const targetEmissions = input.baseline_emissions_tons * (1 - input.target_reduction_pct / 100)
  const totalReduction = input.baseline_emissions_tons - targetEmissions

  const trajectory: EmissionTrajectory[] = []
  for (let y = 0; y <= yearsToTarget; y++) {
    const year = input.baseline_year + y
    const progress = y / yearsToTarget
    const reductionSoFar = totalReduction * Math.pow(progress, 0.85)
    const projected = input.baseline_emissions_tons - reductionSoFar
    const offsetReq = Math.max(0, projected - targetEmissions) * (1 - progress * 0.5)
    trajectory.push({
      year,
      projected_emissions: Math.round(projected),
      reduction_pct: Math.round((reductionSoFar / input.baseline_emissions_tons) * 1000) / 10,
      cumulative_reduction: Math.round(reductionSoFar),
      offset_requirement: Math.round(offsetReq)
    })
  }

  const milestoneYears = [0.25, 0.5, 0.75, 1.0]
  const milestones: RoadmapMilestone[] = milestoneYears.map(frac => {
    const idx = Math.min(Math.round(frac * yearsToTarget), yearsToTarget)
    const year = input.baseline_year + idx
    const targetPct = Math.round(frac * input.target_reduction_pct)
    const actions: string[] = []
    if (frac <= 0.25) {
      actions.push('完成排放基线核查与数据体系建设')
      actions.push('启动低成本能效提升项目')
      actions.push('制定内部碳定价机制')
    } else if (frac <= 0.5) {
      actions.push('扩大可再生能源采购比例')
      actions.push('实施工艺优化与燃料替代')
      actions.push('建立供应链碳管理体系')
    } else if (frac <= 0.75) {
      actions.push('部署碳捕集与利用技术')
      actions.push('深化价值链减排合作')
      actions.push('增加高质量碳抵消采购')
    } else {
      actions.push('实现剩余排放的100%抵消')
      actions.push('完成碳中和认证与声明')
      actions.push('制定下一阶段净零目标')
    }
    const cost = Math.round(totalReduction * frac * rng.nextFloat(25, 65))
    return { year, target_reduction_pct: targetPct + '%', key_actions: actions, estimated_cost_usd: cost }
  })

  const totalInvestment = milestones.reduce((s, m) => s + m.estimated_cost_usd, 0)

  const annualOffsets: Array<{ year: number; offset_tons: number; cost_usd: number }> = []
  for (let y = 0; y <= yearsToTarget; y++) {
    const year = input.baseline_year + y
    const progress = y / yearsToTarget
    const offsetTons = Math.round(totalReduction * progress * rng.nextFloat(0.15, 0.35))
    const cost = Math.round(offsetTons * rng.nextFloat(12, 35))
    annualOffsets.push({ year, offset_tons: offsetTons, cost_usd: cost })
  }

  const feasibility = input.target_reduction_pct >= 80
    ? '净零目标雄心勃勃: 需要技术创新和大量抵消投入，建议分阶段实施'
    : input.target_reduction_pct >= 50
    ? '目标可行: 通过现有技术和合理投资可实现，需持续监控进展'
    : '目标保守: 实现难度较低，建议考虑提升目标以增强领导力'

  const keyRisks: string[] = []
  keyRisks.push('政策加严可能要求提前达峰或提高减排目标')
  keyRisks.push('碳抵消价格波动可能增加达标成本')
  keyRisks.push('技术突破时间不确定性影响高成本措施实施')
  if (input.target_reduction_pct >= 80) keyRisks.push('深度减排依赖未成熟技术(CCUS/氢能)，存在技术风险')
  keyRisks.push('供应链Scope 3减排需要上下游协同，控制力有限')

  const recommendations: string[] = []
  recommendations.push('优先实施零成本和低成本减排措施(能效、行为改变)')
  recommendations.push('建立内部碳定价(建议初始价格$30-50/吨)引导投资决策')
  recommendations.push('制定分阶段抵消策略: 短期采购成熟信用，长期投资高质量项目')
  recommendations.push('每年审查路线图进展，根据技术和市场变化动态调整')
  recommendations.push('考虑加入科学碳目标倡议(SBTi)以增强公信力')

  return {
    target_summary: {
      organization: input.organization,
      baseline_year: input.baseline_year,
      baseline_emissions_tons: input.baseline_emissions_tons,
      target_year: input.target_year,
      target_type: input.target_type,
      target_reduction_pct: input.target_reduction_pct
    },
    emission_trajectory: trajectory,
    milestones,
    total_investment_usd: totalInvestment,
    annual_offset_costs: annualOffsets,
    feasibility_assessment: feasibility,
    key_risks: keyRisks,
    recommendations
  }
}

// Tool 6: Scope Emissions Tracker
function analyzeScopeEmissions(input: ScopeEmissionsInput, rng: SeededRandom): ScopeEmissionsResult {
  const scope3Total = input.scope3_categories.reduce((s, c) => s + c.tons, 0)
  const totalLocation = input.scope1_direct_tons + input.scope2_location_tons + scope3Total
  const totalMarket = input.scope1_direct_tons + input.scope2_market_tons + scope3Total

  const scope3Breakdown = input.scope3_categories.map(c => ({
    category: c.category,
    tons: c.tons,
    pct_of_scope3: scope3Total > 0 ? Math.round((c.tons / scope3Total) * 1000) / 10 : 0,
    data_quality: c.data_quality
  }))

  const perRevenue = input.total_revenue_usd > 0 ? totalMarket / (input.total_revenue_usd / 1e6) : 0
  const perEmployee = input.employee_count > 0 ? totalMarket / input.employee_count : 0

  // Trend analysis
  let trendAnalysis = '当前年度数据已记录'
  if (input.historical_data && input.historical_data.length >= 2) {
    const sorted = [...input.historical_data].sort((a, b) => a.year - b.year)
    const latest = sorted[sorted.length - 1]
    const previous = sorted[sorted.length - 2]
    const latestTotal = latest.scope1 + latest.scope2 + latest.scope3
    const prevTotal = previous.scope1 + previous.scope2 + previous.scope3
    const change = prevTotal > 0 ? ((latestTotal - prevTotal) / prevTotal) * 100 : 0
    if (change > 5) trendAnalysis = '排放呈上升趋势(+' + change.toFixed(1) + '%): 需加强减排措施'
    else if (change < -5) trendAnalysis = '排放呈下降趋势(' + change.toFixed(1) + '%): 减排措施见效'
    else trendAnalysis = '排放基本持平(' + (change >= 0 ? '+' : '') + change.toFixed(1) + '%): 需进一步推动减排'
  }

  // Data quality overview
  const totalCategories = input.scope3_categories.length
  const highCount = input.scope3_categories.filter(c => c.data_quality === 'high').length
  const medCount = input.scope3_categories.filter(c => c.data_quality === 'medium').length
  const lowCount = input.scope3_categories.filter(c => c.data_quality === 'low').length
  const highPct = totalCategories > 0 ? Math.round((highCount / totalCategories) * 100) : 0
  const medPct = totalCategories > 0 ? Math.round((medCount / totalCategories) * 100) : 0
  const lowPct = totalCategories > 0 ? Math.round((lowCount / totalCategories) * 100) : 0
  const overallRating = highPct >= 60 ? '良好' : highPct + medPct >= 70 ? '中等' : '需改进'

  const recommendations: string[] = []
  if (lowPct > 30) recommendations.push('提升数据质量: ' + lowPct + '%的Scope 3类别数据质量为低，建议改进数据收集方法')
  if (scope3Total > totalMarket * 0.7) recommendations.push('Scope 3占比超过70%: 重点关注价值链减排，优先与关键供应商合作')
  recommendations.push('建立自动化排放数据采集系统，减少人工估算')
  recommendations.push('每年更新排放因子数据库，确保计算准确性')
  recommendations.push('对关键排放源实施连续监测(CEMS)，提升数据可靠性')

  return {
    entity_name: input.entity_name,
    reporting_year: input.reporting_year,
    scope_breakdown: {
      scope1_direct: input.scope1_direct_tons,
      scope2_location_based: input.scope2_location_tons,
      scope2_market_based: input.scope2_market_tons,
      scope3_total: scope3Total,
      scope3_categories: scope3Breakdown,
      total_location_based: totalLocation,
      total_market_based: totalMarket
    },
    intensity_metrics: {
      per_revenue: Math.round(perRevenue * 100) / 100,
      per_employee: Math.round(perEmployee * 100) / 100,
      unit: 'tCO2e'
    },
    trend_analysis: trendAnalysis,
    ghg_protocol_alignment: '核算方法符合GHG Protocol企业标准(Scope 1/2/3全覆盖)',
    materiality_assessment: scope3Total > (input.scope1_direct_tons + input.scope2_market_tons) * 2
      ? 'Scope 3为实质性排放源，应作为减排重点'
      : '直接排放(Scope 1+2)占比较高，优先实施运营减排',
    data_quality_overview: {
      high_quality_pct: highPct,
      medium_quality_pct: medPct,
      low_quality_pct: lowPct,
      overall_rating: overallRating
    },
    recommendations
  }
}

// Tool 7: Offset Portfolio Optimizer
function analyzePortfolioOptimizer(input: PortfolioOptimizerInput, rng: SeededRandom): PortfolioOptimizerResult {
  const riskMultipliers: Record<string, { budgetPct: number; riskAdj: number }> = {
    'conservative': { budgetPct: 0.12, riskAdj: 0.7 },
    'moderate': { budgetPct: 0.20, riskAdj: 1.0 },
    'aggressive': { budgetPct: 0.35, riskAdj: 1.4 }
  }
  const config = riskMultipliers[input.risk_tolerance]

  const standardPrices: Record<string, { price: number; quality: string }> = {
    'Gold Standard': { price: 22, quality: '优质' },
    'VCS': { price: 14, quality: '良好' },
    'CAR': { price: 16, quality: '良好' },
    'ACR': { price: 12, quality: '良好' },
    'CCER': { price: 8, quality: '中等' },
    'CDM': { price: 5, quality: '一般' },
    'Plan Vivo': { price: 18, quality: '优质' }
  }

  const projectTypes = ['Reforestation', 'Renewable Energy', 'Methane Capture', 'Clean Cookstoves', 'Direct Air Capture', 'Blue Carbon']
  const filteredTypes = input.excluded_project_types
    ? projectTypes.filter(t => !input.excluded_project_types!.includes(t))
    : projectTypes

  const allocations: PortfolioAllocation[] = []
  const numAllocations = Math.min(filteredTypes.length, 4)
  const selectedTypes = filteredTypes.slice(0, numAllocations)

  let totalCost = 0
  let totalCredits = 0

  for (let i = 0; i < selectedTypes.length; i++) {
    const pType = selectedTypes[i]
    const stdKeys = Object.keys(standardPrices)
    const std = stdKeys[i % stdKeys.length]
    const stdInfo = standardPrices[std]
    const allocPct = Math.round((100 / numAllocations + rng.nextInt(-5, 5)) * 10) / 10
    const credits = Math.round(input.target_offset_tons * (allocPct / 100))
    const price = Math.round(stdInfo.price * rng.nextFloat(0.9, 1.15) * 100) / 100
    const cost = Math.round(credits * price)
    totalCost += cost
    totalCredits += credits

    const rationale = pType === 'Direct Air Capture'
      ? '前沿技术: 高成本但永久性最强，适合长期配置'
      : pType === 'Reforestation'
      ? '基于自然的解决方案: 成本适中，协同生物多样性效益'
      : pType === 'Renewable Energy'
      ? '成熟技术: 市场流动性高，适合核心配置'
      : '多元化配置: 降低组合风险，提升综合效益'

    allocations.push({
      standard: std,
      project_type: pType,
      allocation_pct: allocPct,
      recommended_credits: credits,
      price_per_ton: price,
      total_cost: cost,
      quality_rating: stdInfo.quality,
      rationale
    })
  }

  const costPerTon = totalCredits > 0 ? Math.round((totalCost / totalCredits) * 100) / 100 : 0
  const remainingBudget = input.total_budget_usd - totalCost

  const concentrationIndex = Math.max(0, Math.round((1 - numAllocations * 0.15) * 100) / 100)
  const vintageDiv = input.risk_tolerance === 'conservative' ? '保守策略: 优先选择vintage >= 2022的近期信用' : '多元化配置: 混合vintage以平衡成本与质量'
  const geoDiv = input.preferred_regions && input.preferred_regions.length > 0
    ? '区域偏好: ' + input.preferred_regions.join('、')
    : '全球配置: 分散投资于多个地理区域'
  const stdDiv = '多标准配置: ' + allocations.map(a => a.standard).filter((v, i, a) => a.indexOf(v) === i).length + '个标准'

  const overallRisk = input.risk_tolerance === 'conservative' ? rng.nextInt(15, 35) :
    input.risk_tolerance === 'moderate' ? rng.nextInt(35, 60) : rng.nextInt(55, 80)

  const additionalBenefits: string[] = []
  additionalBenefits.push('贡献联合国可持续发展目标(SDGs)')
  if (allocations.some(a => a.project_type === 'Reforestation' || a.project_type === 'Blue Carbon')) {
    additionalBenefits.push('生物多样性保护与生态系统恢复')
  }
  if (allocations.some(a => a.project_type === 'Clean Cookstoves')) {
    additionalBenefits.push('社区健康改善与性别平等促进')
  }
  additionalBenefits.push('企业ESG评级提升与品牌价值增强')

  const rebalancing: string[] = []
  rebalancing.push('每季度审查组合配置，根据市场变化动态调整')
  rebalancing.push('vintage超过5年的信用建议逐步置换为近期信用')
  rebalancing.push('关注新标准和方法学的出现，适时纳入高质量新型信用')
  if (input.risk_tolerance === 'aggressive') rebalancing.push('激进策略建议设置15%的止损线')

  const strategySummary = input.risk_tolerance === 'conservative'
    ? '保守策略: 优先高质量、低风险信用，确保合规可靠性'
    : input.risk_tolerance === 'moderate'
    ? '稳健策略: 平衡质量与成本，多元化配置降低风险'
    : '积极策略: 追求高回报，配置前沿技术项目，承担较高风险'

  return {
    portfolio_name: input.portfolio_name,
    strategy_summary: strategySummary,
    allocations,
    total_investment: totalCost,
    cost_per_ton: costPerTon,
    remaining_budget: remainingBudget,
    risk_metrics: {
      concentration_index: concentrationIndex,
      vintage_diversification: vintageDiv,
      geographic_diversification: geoDiv,
      standard_diversification: stdDiv,
      overall_risk_score: overallRisk
    },
    projected_impact: {
      total_offset_tons: totalCredits,
      additional_benefits: additionalBenefits
    },
    rebalancing_recommendations: rebalancing
  }
}

// Tool 8: Carbon Price Forecaster
function analyzePriceForecaster(input: PriceForecasterInput, rng: SeededRandom): PriceForecasterResult {
  const prices = input.historical_prices
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : input.current_price_usd
  const priceStd = prices.length > 1
    ? Math.sqrt(prices.reduce((s, p) => s + Math.pow(p - avgPrice, 2), 0) / prices.length)
    : input.current_price_usd * 0.15

  const sentimentBias: Record<string, number> = { bullish: 0.03, neutral: 0.0, bearish: -0.025 }
  const bias = sentimentBias[input.market_sentiment ?? 'neutral']

  const forecasts: PriceForecastPoint[] = []
  let cumulativePrice = input.current_price_usd
  for (let m = 1; m <= input.forecast_months; m++) {
    const trendComponent = bias * (1 - m * 0.02)
    const noiseComponent = rng.nextFloat(-0.02, 0.02)
    const monthlyChange = trendComponent + noiseComponent
    cumulativePrice = cumulativePrice * (1 + monthlyChange)
    const spread = priceStd * (1 + m * 0.08)
    forecasts.push({
      month: m,
      predicted_price: Math.round(cumulativePrice * 100) / 100,
      confidence_low: Math.max(0, Math.round((cumulativePrice - spread) * 100) / 100),
      confidence_high: Math.round((cumulativePrice + spread) * 100) / 100
    })
  }

  const lastForecast = forecasts.length > 0 ? forecasts[forecasts.length - 1].predicted_price : input.current_price_usd
  const changePct = input.current_price_usd > 0 ? ((lastForecast - input.current_price_usd) / input.current_price_usd) * 100 : 0
  const direction: 'upward' | 'downward' | 'stable' = changePct > 5 ? 'upward' : changePct < -5 ? 'downward' : 'stable'

  const forecastPrices = forecasts.map(f => f.predicted_price)
  const maxPrice = forecastPrices.length > 0 ? Math.max(...forecastPrices) : input.current_price_usd
  const minPrice = forecastPrices.length > 0 ? Math.min(...forecastPrices) : input.current_price_usd
  const avgForecast = forecastPrices.length > 0 ? forecastPrices.reduce((a, b) => a + b, 0) / forecastPrices.length : input.current_price_usd

  const signals: MarketSignalIndicator[] = []
  signals.push({
    signal: '市场情绪',
    direction: bias > 0 ? 'positive' : bias < 0 ? 'negative' : 'neutral',
    weight: 0.25,
    description: input.market_sentiment === 'bullish' ? '市场情绪看涨，需求增长预期强劲' :
      input.market_sentiment === 'bearish' ? '市场情绪看跌，供应过剩担忧' : '市场情绪中性，供需基本平衡'
  })
  signals.push({
    signal: '政策环境',
    direction: 'positive',
    weight: 0.30,
    description: '全球碳市场政策持续收紧，配额供给减少支撑价格'
  })
  signals.push({
    signal: '技术成本',
    direction: 'negative',
    weight: 0.15,
    description: '减排技术成本下降可能降低配额需求'
  })
  signals.push({
    signal: '宏观经济',
    direction: rng.nextFloat(0, 1) > 0.5 ? 'positive' : 'negative',
    weight: 0.20,
    description: '经济增长预期影响工业活动水平和排放需求'
  })
  signals.push({
    signal: '季节性因素',
    direction: 'neutral',
    weight: 0.10,
    description: '履约期前需求通常上升，价格存在季节性波动'
  })

  if (input.policy_developments) {
    for (const policy of input.policy_developments) {
      signals.push({
        signal: '政策动态',
        direction: 'positive',
        weight: 0.15,
        description: policy
      })
    }
  }

  const volatilityPct = avgPrice > 0 ? (priceStd / avgPrice) * 100 : 15
  const volatilityAssessment = volatilityPct > 30
    ? '高波动率(' + volatilityPct.toFixed(1) + '%): 价格波动剧烈，建议采用分批建仓策略'
    : volatilityPct > 15
    ? '中等波动率(' + volatilityPct.toFixed(1) + '%): 价格波动适中，可择机操作'
    : '低波动率(' + volatilityPct.toFixed(1) + '%): 价格相对稳定，适合长期配置'

  const tradingImplications: string[] = []
  if (direction === 'upward') {
    tradingImplications.push('价格上行趋势: 建议提前锁定信用，避免未来成本上升')
    tradingImplications.push('可考虑增加高质量信用储备，等待价格进一步上涨')
  } else if (direction === 'downward') {
    tradingImplications.push('价格下行趋势: 建议延迟采购，等待更低价格')
    tradingImplications.push('持有信用可考虑部分获利了结')
  } else {
    tradingImplications.push('价格稳定: 可按计划执行采购，无需急于操作')
  }
  tradingImplications.push('建议设置价格预警: 低于' + Math.round(input.current_price_usd * 0.9) + '时积极买入，高于' + Math.round(input.current_price_usd * 1.15) + '时谨慎追高')
  tradingImplications.push('关注拍卖结果和政策公告对价格的短期冲击')

  return {
    market: input.market,
    credit_type: input.credit_type,
    current_price_usd: input.current_price_usd,
    forecast_summary: {
      direction,
      predicted_change_pct: Math.round(changePct * 10) / 10,
      avg_forecast_price: Math.round(avgForecast * 100) / 100,
      max_price: Math.round(maxPrice * 100) / 100,
      min_price: Math.round(minPrice * 100) / 100
    },
    monthly_forecasts: forecasts,
    market_signals: signals,
    volatility_assessment: volatilityAssessment,
    trading_implications: tradingImplications,
    disclaimer_applied: true
  }
}

// ==================== SECTION 4 — Format Functions ====================

function formatFootprintReport(r: FootprintResult): string {
  const lines: string[] = []
  lines.push('## 碳足迹核算报告 (ISO 14064 / GHG Protocol)')
  lines.push('')
  lines.push('**总碳足迹:** ' + r.total_footprint_tons.toLocaleString() + ' tCO2e | **净足迹:** ' + r.net_footprint_tons.toLocaleString() + ' tCO2e')
  if (r.gwp_assessment.includes_biogenic) {
    lines.push('**生物源CO2:** ' + r.gwp_assessment.biogenic_co2_tons.toLocaleString() + ' tCO2e (单独报告，不计入总足迹)')
  }
  lines.push('')
  lines.push('### 生命周期阶段分解')
  lines.push('| 阶段 | CO2e(吨) | 占比 | 数据质量 |')
  lines.push('|------|----------|------|---------|')
  for (const s of r.stage_breakdown) {
    lines.push('| ' + s.stage + ' | ' + s.co2e_tons.toLocaleString() + ' | ' + s.percentage + '% | ' + s.data_quality + ' |')
  }
  lines.push('')
  lines.push('### 核查就绪评估')
  lines.push('- **核算边界:** ' + (r.verification_readiness.boundary_defined ? '已定义' : '未定义'))
  lines.push('- **分配方法:** ' + (r.verification_readiness.allocation_justified ? '已说明' : '未说明'))
  lines.push('- **数据质量评分:** ' + r.verification_readiness.data_quality_score + '/100')
  lines.push('- **核查就绪:** ' + (r.verification_readiness.is_ready ? '可直接提交核查' : '需完善后提交'))
  lines.push('- **建议:** ' + r.verification_readiness.recommendation)
  lines.push('')
  lines.push('### 排放热点')
  for (const h of r.hotspot_stages) lines.push('- ' + h)
  lines.push('')
  lines.push('### 对标分析')
  lines.push(r.benchmark_comparison)
  lines.push('')
  lines.push('### 减排建议')
  for (const rec of r.reduction_recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatOffsetProjectReport(r: OffsetProjectResult): string {
  const lines: string[] = []
  lines.push('## 碳抵消项目评估报告')
  lines.push('')
  const statusLabel = r.eligibility_status === 'eligible' ? '符合' : r.eligibility_status === 'conditionally_eligible' ? '有条件符合' : '不符合'
  lines.push('**项目:** ' + r.project_name + ' | **资格状态:** ' + statusLabel + ' | **置信度:** ' + r.confidence_level)
  lines.push('')
  lines.push('### 质量评估')
  lines.push('| 维度 | 得分 |')
  lines.push('|------|------|')
  lines.push('| 额外性(Additionality) | ' + r.quality_assessment.additionality_score + '/100 |')
  lines.push('| 永久性(Permanence) | ' + r.quality_assessment.permanence_score + '/100 |')
  lines.push('| 泄漏风险(Leakage) | ' + r.quality_assessment.leakage_score + '/100 |')
  lines.push('| 透明度(Transparency) | ' + r.quality_assessment.transparency_score + '/100 |')
  lines.push('| 可持续发展(SDGs) | ' + r.quality_assessment.sustainable_dev_score + '/100 |')
  lines.push('| **综合评分** | **' + r.quality_assessment.overall_quality_score + '/100** |')
  lines.push('')
  lines.push('### 验证状态')
  lines.push(r.validation_status)
  lines.push('')
  lines.push('### SDGs贡献')
  for (const sdg of r.sdgs_alignment) lines.push('- ' + sdg)
  lines.push('')
  lines.push('### 风险因素')
  for (const risk of r.risk_factors) lines.push('- [风险] ' + risk)
  lines.push('')
  lines.push('### 建议')
  lines.push(r.recommendation)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatCreditVerificationReport(r: CreditVerificationResult): string {
  const lines: string[] = []
  lines.push('## 碳信用验证报告')
  lines.push('')
  const statusLabel = r.overall_status === 'verified' ? '验证通过' : r.overall_status === 'conditionally_verified' ? '有条件通过' : '验证失败'
  lines.push('**信用ID:** ' + r.credit_id + ' | **真实性:** ' + (r.is_authentic ? '真实' : '存疑') + ' | **状态:** ' + statusLabel)
  lines.push('')
  lines.push('### 验证检查项')
  lines.push('| 检查项 | 状态 | 详情 |')
  lines.push('|--------|------|------|')
  for (const c of r.verification_checks) {
    const statusIcon = c.status === 'passed' ? '通过' : c.status === 'failed' ? '失败' : '警告'
    lines.push('| ' + c.check_name + ' | ' + statusIcon + ' | ' + c.detail + ' |')
  }
  lines.push('')
  lines.push('### 关键结论')
  lines.push('- **注册系统匹配:** ' + r.registry_record_match)
  lines.push('- **额外性验证:** ' + (r.additionality_verified ? '已确认' : '未确认'))
  lines.push('- **重复计算风险:** ' + r.double_counting_risk)
  lines.push('- **永久性确认:** ' + (r.permanence_confirmed ? '已确认' : '需关注'))
  lines.push('')
  lines.push('### 建议')
  lines.push(r.recommendation)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatRegistryTransactionReport(r: RegistryTransactionResult): string {
  const lines: string[] = []
  lines.push('## 注册系统交易报告')
  lines.push('')
  lines.push('**交易ID:** ' + r.transaction_id + ' | **类型:** ' + r.transaction_type + ' | **状态:** ' + r.status)
  lines.push('')
  lines.push('### 信用详情')
  lines.push('| 项目 | 详情 |')
  lines.push('|------|------|')
  lines.push('| 标准 | ' + r.credit_details.standard + ' |')
  lines.push('| 项目ID | ' + r.credit_details.project_id + ' |')
  lines.push('| Vintage | ' + r.credit_details.vintage_year + ' |')
  lines.push('| 数量 | ' + r.credit_details.quantity_tons.toLocaleString() + ' 吨 |')
  lines.push('| 序列号范围 | ' + r.credit_details.serial_range + ' |')
  lines.push('')
  lines.push('### 费用明细')
  lines.push('| 费用类型 | 金额(USD) | 说明 |')
  lines.push('|----------|----------|------|')
  for (const f of r.fees) {
    lines.push('| ' + f.fee_type + ' | $' + f.amount_usd.toFixed(2) + ' | ' + f.description + ' |')
  }
  lines.push('| **总计** | **$' + r.total_fee_usd.toFixed(2) + '** | |')
  lines.push('')
  lines.push('### 处理信息')
  lines.push('- **注册系统:** ' + r.registry)
  lines.push('- **预计处理时间:** ' + r.estimated_processing_time)
  lines.push('')
  lines.push('### 合规说明')
  for (const note of r.compliance_notes) lines.push('- ' + note)
  lines.push('')
  lines.push('### 交易凭证')
  lines.push(r.receipt)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatNeutralityRoadmapReport(r: NeutralityRoadmapResult): string {
  const lines: string[] = []
  lines.push('## 碳中和路径规划报告')
  lines.push('')
  lines.push('### 目标概要')
  lines.push('| 项目 | 值 |')
  lines.push('|------|------|')
  lines.push('| 组织 | ' + r.target_summary.organization + ' |')
  lines.push('| 基准年 | ' + r.target_summary.baseline_year + ' |')
  lines.push('| 基准排放 | ' + r.target_summary.baseline_emissions_tons.toLocaleString() + ' tCO2e |')
  lines.push('| 目标年 | ' + r.target_summary.target_year + ' |')
  lines.push('| 目标类型 | ' + r.target_summary.target_type + ' |')
  lines.push('| 减排比例 | ' + r.target_summary.target_reduction_pct + '% |')
  lines.push('| 总投资 | $' + r.total_investment_usd.toLocaleString() + ' |')
  lines.push('| 可行性 | ' + r.feasibility_assessment + ' |')
  lines.push('')
  lines.push('### 排放轨迹')
  lines.push('| 年份 | 预测排放(tCO2e) | 减排比例 | 累计减排 | 抵消需求 |')
  lines.push('|------|----------------|---------|---------|---------|')
  for (const t of r.emission_trajectory) {
    lines.push('| ' + t.year + ' | ' + t.projected_emissions.toLocaleString() + ' | ' + t.reduction_pct + '% | ' + t.cumulative_reduction.toLocaleString() + ' | ' + t.offset_requirement.toLocaleString() + ' |')
  }
  lines.push('')
  lines.push('### 关键里程碑')
  for (const m of r.milestones) {
    lines.push('#### ' + m.year + ' (目标减排: ' + m.target_reduction_pct + ')')
    for (const action of m.key_actions) lines.push('- ' + action)
    lines.push('**预计投资:** $' + m.estimated_cost_usd.toLocaleString())
    lines.push('')
  }
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

function formatScopeEmissionsReport(r: ScopeEmissionsResult): string {
  const lines: string[] = []
  lines.push('## 范围排放追踪报告 (GHG Protocol)')
  lines.push('')
  lines.push('**实体:** ' + r.entity_name + ' | **报告年度:** ' + r.reporting_year)
  lines.push('')
  lines.push('### 排放分解')
  lines.push('| 范围 | 排放量(tCO2e) |')
  lines.push('|------|-------------|')
  lines.push('| Scope 1 (直接排放) | ' + r.scope_breakdown.scope1_direct.toLocaleString() + ' |')
  lines.push('| Scope 2 (间接-能源，位置法) | ' + r.scope_breakdown.scope2_location_based.toLocaleString() + ' |')
  lines.push('| Scope 2 (间接-能源，市场法) | ' + r.scope_breakdown.scope2_market_based.toLocaleString() + ' |')
  lines.push('| Scope 3 (价值链间接) | ' + r.scope_breakdown.scope3_total.toLocaleString() + ' |')
  lines.push('| **总计(位置法)** | **' + r.scope_breakdown.total_location_based.toLocaleString() + '** |')
  lines.push('| **总计(市场法)** | **' + r.scope_breakdown.total_market_based.toLocaleString() + '** |')
  lines.push('')
  lines.push('### Scope 3类别分解')
  lines.push('| 类别 | 排放量(tCO2e) | 占比 | 数据质量 |')
  lines.push('|------|-------------|------|---------|')
  for (const c of r.scope_breakdown.scope3_categories) {
    lines.push('| ' + c.category + ' | ' + c.tons.toLocaleString() + ' | ' + c.pct_of_scope3 + '% | ' + c.data_quality + ' |')
  }
  lines.push('')
  lines.push('### 排放强度')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 营收强度 | ' + r.intensity_metrics.per_revenue + ' tCO2e/MUSD |')
  lines.push('| 人均强度 | ' + r.intensity_metrics.per_employee + ' tCO2e/人 |')
  lines.push('')
  lines.push('### 趋势分析')
  lines.push(r.trend_analysis)
  lines.push('')
  lines.push('### 数据质量概览')
  lines.push('| 质量等级 | 占比 |')
  lines.push('|---------|------|')
  lines.push('| 高 | ' + r.data_quality_overview.high_quality_pct + '% |')
  lines.push('| 中 | ' + r.data_quality_overview.medium_quality_pct + '% |')
  lines.push('| 低 | ' + r.data_quality_overview.low_quality_pct + '% |')
  lines.push('| **综合评级** | **' + r.data_quality_overview.overall_rating + '** |')
  lines.push('')
  lines.push('### GHG Protocol对齐')
  lines.push(r.ghg_protocol_alignment)
  lines.push('')
  lines.push('### 实质性评估')
  lines.push(r.materiality_assessment)
  lines.push('')
  lines.push('### 改进建议')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatPortfolioReport(r: PortfolioOptimizerResult): string {
  const lines: string[] = []
  lines.push('## 碳抵消组合优化报告')
  lines.push('')
  lines.push('**组合:** ' + r.portfolio_name + ' | **策略:** ' + r.strategy_summary)
  lines.push('')
  lines.push('### 配置方案')
  lines.push('| 标准 | 项目类型 | 配置比例 | 推荐信用量 | 单价(USD/吨) | 总成本 | 质量评级 |')
  lines.push('|------|---------|---------|-----------|------------|--------|---------|')
  for (const a of r.allocations) {
    lines.push('| ' + a.standard + ' | ' + a.project_type + ' | ' + a.allocation_pct + '% | ' + a.recommended_credits.toLocaleString() + ' | $' + a.price_per_ton + ' | $' + a.total_cost.toLocaleString() + ' | ' + a.quality_rating + ' |')
  }
  lines.push('')
  lines.push('### 成本分析')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 总投资 | $' + r.total_investment.toLocaleString() + ' |')
  lines.push('| 单位成本 | $' + r.cost_per_ton + '/吨 |')
  lines.push('| 剩余预算 | $' + r.remaining_budget.toLocaleString() + ' |')
  lines.push('')
  lines.push('### 风险指标')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 集中度指数 | ' + r.risk_metrics.concentration_index + ' |')
  lines.push('| 综合风险评分 | ' + r.risk_metrics.overall_risk_score + '/100 |')
  lines.push('| Vintage多元化 | ' + r.risk_metrics.vintage_diversification + ' |')
  lines.push('| 地理多元化 | ' + r.risk_metrics.geographic_diversification + ' |')
  lines.push('| 标准多元化 | ' + r.risk_metrics.standard_diversification + ' |')
  lines.push('')
  lines.push('### 预期影响')
  lines.push('**总抵消量:** ' + r.projected_impact.total_offset_tons.toLocaleString() + ' tCO2e')
  lines.push('')
  lines.push('**协同效益:**')
  for (const b of r.projected_impact.additional_benefits) lines.push('- ' + b)
  lines.push('')
  lines.push('### 配置建议')
  for (const rec of r.rebalancing_recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatPriceForecasterReport(r: PriceForecasterResult): string {
  const lines: string[] = []
  lines.push('## 碳价格预测报告')
  lines.push('')
  const dirLabel = r.forecast_summary.direction === 'upward' ? '上行' : r.forecast_summary.direction === 'downward' ? '下行' : '稳定'
  lines.push('**市场:** ' + r.market + ' | **信用类型:** ' + r.credit_type + ' | **当前价格:** $' + r.current_price_usd + '/吨')
  lines.push('**预测方向:** ' + dirLabel + ' | **预测变化:** ' + (r.forecast_summary.predicted_change_pct >= 0 ? '+' : '') + r.forecast_summary.predicted_change_pct + '%')
  lines.push('')
  lines.push('### 预测概要')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push('| 平均预测价格 | $' + r.forecast_summary.avg_forecast_price + ' |')
  lines.push('| 最高预测价格 | $' + r.forecast_summary.max_price + ' |')
  lines.push('| 最低预测价格 | $' + r.forecast_summary.min_price + ' |')
  lines.push('')
  lines.push('### 月度预测')
  lines.push('| 月份 | 预测价格(USD) | 置信区间(低) | 置信区间(高) |')
  lines.push('|------|-------------|------------|------------|')
  for (const f of r.monthly_forecasts) {
    lines.push('| 第' + f.month + '月 | $' + f.predicted_price + ' | $' + f.confidence_low + ' | $' + f.confidence_high + ' |')
  }
  lines.push('')
  lines.push('### 市场信号')
  lines.push('| 信号 | 方向 | 权重 | 说明 |')
  lines.push('|------|------|------|------|')
  for (const s of r.market_signals) {
    const dirIcon = s.direction === 'positive' ? '正向' : s.direction === 'negative' ? '负向' : '中性'
    lines.push('| ' + s.signal + ' | ' + dirIcon + ' | ' + (s.weight * 100).toFixed(0) + '% | ' + s.description + ' |')
  }
  lines.push('')
  lines.push('### 波动率评估')
  lines.push(r.volatility_assessment)
  lines.push('')
  lines.push('### 交易建议')
  for (const imp of r.trading_implications) lines.push('- ' + imp)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Carbon Footprint Calculator
  tools.register(defineTool({
    name: 'carbon_footprint_calculator',
    description: 'Calculate product or entity carbon footprint across full lifecycle stages per ISO 14064 and GHG Protocol standards. Assess data quality, identify emission hotspots, evaluate biogenic CO2 treatment, and determine verification readiness for third-party assurance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { entity_name, reporting_period, boundary, lifecycle_stages: [{ stage, co2e_tons, data_source, quality (measured/calculated/estimated) }], gwp_version (optional), biogenic_co2 (optional number), allocation_method (optional string) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: FootprintInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeFootprint(input, rng)
      return formatFootprintReport(result)
    }
  }))

  // Tool 2: Offset Project Evaluator
  tools.register(defineTool({
    name: 'offset_project_evaluator',
    description: 'Evaluate carbon offset project quality and viability across additionality, permanence, leakage, transparency, and sustainable development dimensions. Score projects by standard (Gold Standard, VCS, CCER, CDM, etc.) and provide eligibility assessment with risk factors.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { project_name, project_type, standard, host_country, vintage_year, estimated_annual_reduction_tons, methodology, developer_experience_years, has_third_party_validation, sdgs_contributed (optional string[]), permanence_risk (low/medium/high, optional), leakage_assessment (low/medium/high, optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: OffsetProjectInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeOffsetProject(input, rng)
      return formatOffsetProjectReport(result)
    }
  }))

  // Tool 3: Credit Verification Engine
  tools.register(defineTool({
    name: 'credit_verification_engine',
    description: 'Verify carbon credit authenticity through multi-dimensional checks including registry record matching, serial number validation, vintage year verification, standard certification, retirement status confirmation, and additionality assessment. Detect double-counting risks and permanence concerns.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { credit_id, registry, standard, vintage_year, project_type, serial_number, quantity_tons, retirement_status, verification_body (optional string), issuance_date (optional string) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CreditVerificationInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeCreditVerification(input, rng)
      return formatCreditVerificationReport(result)
    }
  }))

  // Tool 4: Registry Transaction Manager
  tools.register(defineTool({
    name: 'registry_transaction_manager',
    description: 'Manage carbon credit registry transactions including issuance, transfer, retirement, and cancellation operations. Calculate transaction fees, generate serial ranges, provide compliance notes, and produce verifiable transaction receipts for audit trails.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { transaction_type (issuance/transfer/retirement/cancellation), registry, credit_standard, project_id, quantity_tons, from_account (optional), to_account (optional), beneficiary (optional), retirement_purpose (optional), vintage_year }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: RegistryTransactionInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeRegistryTransaction(input, rng)
      return formatRegistryTransactionReport(result)
    }
  }))

  // Tool 5: Carbon Neutrality Roadmap
  tools.register(defineTool({
    name: 'carbon_neutrality_roadmap',
    description: 'Develop science-based carbon neutrality or net-zero pathway with emission trajectory forecasting, milestone planning, investment estimation, and offset strategy. Assess feasibility and provide risk-aware recommendations aligned with SBTi criteria.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { organization, baseline_year, baseline_emissions_tons, target_year, target_type (carbon_neutral/net_zero/science_based), target_reduction_pct, annual_revenue_usd, industry_sector, existing_initiatives (optional string[]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: NeutralityRoadmapInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeNeutralityRoadmap(input, rng)
      return formatNeutralityRoadmapReport(result)
    }
  }))

  // Tool 6: Scope Emissions Tracker
  tools.register(defineTool({
    name: 'scope_emissions_tracker',
    description: 'Track and analyze Scope 1 (direct), Scope 2 (energy indirect), and Scope 3 (value chain) emissions per GHG Protocol. Calculate emission intensities, analyze historical trends, assess data quality, and provide materiality assessment with improvement recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { entity_name, reporting_year, scope1_direct_tons, scope2_location_tons, scope2_market_tons, scope3_categories: [{ category, tons, data_quality (high/medium/low) }], total_revenue_usd, employee_count, industry_sector, historical_data (optional [{ year, scope1, scope2, scope3 }]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ScopeEmissionsInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzeScopeEmissions(input, rng)
      return formatScopeEmissionsReport(result)
    }
  }))

  // Tool 7: Offset Portfolio Optimizer
  tools.register(defineTool({
    name: 'offset_portfolio_optimizer',
    description: 'Optimize carbon offset portfolio allocation across multiple standards (Gold Standard, VCS, CCER, etc.) and project types. Balance risk-return profile based on tolerance level, calculate cost per ton, assess concentration risk, and provide rebalancing recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { portfolio_name, total_budget_usd, target_offset_tons, risk_tolerance (conservative/moderate/aggressive), current_holdings (optional [{ standard, project_type, vintage, credits, avg_price_usd }]), preferred_regions (optional string[]), excluded_project_types (optional string[]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: PortfolioOptimizerInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzePortfolioOptimizer(input, rng)
      return formatPortfolioReport(result)
    }
  }))

  // Tool 8: Carbon Price Forecaster
  tools.register(defineTool({
    name: 'carbon_price_forecaster',
    description: 'Forecast carbon credit prices using historical data, market sentiment analysis, and policy signal integration. Generate monthly price predictions with confidence intervals, assess volatility, and provide actionable trading implications for carbon market participants.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { market, credit_type, current_price_usd, historical_prices (number[]), forecast_months, market_sentiment (bullish/neutral/bearish, optional), policy_developments (optional string[]) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: PriceForecasterInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(JSON.stringify(input)))
      const result = analyzePriceForecaster(input, rng)
      return formatPriceForecasterReport(result)
    }
  }))

  console.log('[dsh-tool-carboncredit] Loaded v' + VERSION + ' - Carbon Credit & Offset Marketplace with 8 tools')
  console.log('  Tools: carbon_footprint_calculator, offset_project_evaluator, credit_verification_engine, registry_transaction_manager, carbon_neutrality_roadmap, scope_emissions_tracker, offset_portfolio_optimizer, carbon_price_forecaster')
}
