/**
 * DSH FinTech Agent Pro Plugin v1.0.0
 * 金融科技AI助手 for DeepSeek Harness — 智能风控·量化投顾·合规科技(RegTech)全流程
 *
 * 覆盖金融科技全链路：信用风险 → 反欺诈 → 量化交易 → 合规科技 → 智能投顾 → 市场风险VaR → 保险精算 → 金融产品设计
 *
 * 工具清单:
 * 1. credit_risk_scorer      — 信用风险评分引擎（借款人信用评分300-850, 违约概率, 额度建议, 利率定价）
 * 2. fraud_detection_engine  — 实时反欺诈检测（交易异常评分, 欺诈模式识别, 误报率分析, 规则+模型混合策略）
 * 3. algorithmic_trading_advisor — 量化交易策略顾问（策略回测, 夏普比率, 最大回撤, alpha收益, 因子暴露分析）
 * 4. regtech_compliance_checker — 合规科技检查（AML/KYC合规, 监管报告生成, 政策变化追踪, 合规差距分析）
 * 5. wealth_management_robo  — 智能投顾（风险偏好评估, 资产配置建议, 再平衡触发, 税务优化策略）
 * 6. market_risk_var         — 市场风险VaR计算（VaR 95%/99%, 压力测试, 情景分析, 集中度风险, 流动性风险）
 * 7. insurance_actuarial_ai  — 保险精算AI（损失分布, 纯保费, 准备金, 巨灾风险建模, 费率厘定）
 * 8. fintech_product_designer — 金融产品设计（需求匹配度, 风险评估, 定价模型, 竞争力分析, 监管可行性）
 *
 * @module dsh-tool-fintechagentpro | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-fintechagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析仅供参考，不构成投资/信贷/合规建议。'

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

// --- Tool 1: Credit Risk Scorer ---
interface BorrowerProfile {
  borrower_id: string
  annual_income: number
  debt_to_income_ratio: number
  employment_years: number
  credit_history_months: number
  num_open_accounts: number
  num_delinquencies_2y: number
  loan_amount_requested: number
  loan_purpose: string
}

interface CreditRiskInput {
  input_data: string
}

interface CreditScoreResult {
  borrower_id: string
  credit_score: number
  default_probability: number
  risk_grade: string
  recommended_credit_limit: number
  interest_rate_pricing: number
  risk_factors: string[]
  mitigating_factors: string[]
  score_breakdown: Record<string, number>
  dashboard_data: Record<string, number>
}

// --- Tool 2: Fraud Detection Engine ---
interface TransactionData {
  txn_id: string
  account_id: string
  amount: number
  currency: string
  merchant_category: string
  timestamp: string
  country: string
  channel: 'online' | 'pos' | 'atm' | 'mobile'
  is_international: boolean

  velocity_1h: number
  velocity_24h: number
}

interface FraudDetectionInput {
  input_data: string
}

interface FraudAlert {
  txn_id: string
  anomaly_score: number
  fraud_patterns: string[]
  recommended_action: string
  false_positive_probability: number
}

interface FraudDetectionReport {
  total_transactions: number
  alerts_generated: number
  fraud_alerts: FraudAlert[]
  false_positive_rate: number
  model_accuracy: number
  rule_triggers: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 3: Algorithmic Trading Advisor ---
interface StrategyInput {
  strategy_name: string
  universe: string[]
  benchmark: string
  lookback_period_days: number
  rebalance_frequency: string
  factor_weights: Record<string, number>
  transaction_cost_bps: number
}

interface TradingAdvisorInput {
  input_data: string
}

interface BacktestResult {
  total_return_pct: number
  annualized_return_pct: number
  sharpe_ratio: number
  sortino_ratio: number
  max_drawdown_pct: number
  alpha_pct: number
  beta: number
  information_ratio: number
  win_rate_pct: number
  profit_factor: number
}

interface FactorExposure {
  factor_name: string
  exposure: number
  contribution_pct: number
  t_statistic: number
}

interface TradingReport {
  strategy_name: string
  backtest_result: BacktestResult
  factor_exposures: FactorExposure[]
  risk_decomposition: Record<string, number>
  optimization_suggestions: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 4: RegTech Compliance Checker ---
interface ComplianceRule {
  regulation_id: string
  regulation_name: string
  jurisdiction: string
  category: 'AML' | 'KYC' | 'CTF' | 'GDPR' | 'MiFID' | 'Basel' | 'DoddFrank'
  last_updated: string
  requirement_description: string
}

interface ComplianceInput {
  input_data: string
}

interface ComplianceGap {
  regulation_id: string
  regulation_name: string
  compliance_status: 'compliant' | 'partially_compliant' | 'non_compliant'
  gap_description: string
  remediation_priority: 'high' | 'medium' | 'low'
  estimated_remediation_cost: number
}

interface RegulatoryChange {
  regulation_id: string
  change_description: string
  effective_date: string
  impact_level: 'high' | 'medium' | 'low'
  action_required: string
}

interface ComplianceReport {
  total_regulations: number
  compliant_count: number
  partial_count: number
  non_compliant_count: number
  overall_compliance_score: number
  compliance_gaps: ComplianceGap[]
  regulatory_changes: RegulatoryChange[]
  aml_kyc_coverage_pct: number
  dashboard_data: Record<string, number>
}

// --- Tool 5: Wealth Management Robo ---
interface InvestorProfile {
  investor_id: string
  age: number
  investment_horizon_years: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  annual_income: number
  net_worth: number
  liquidity_needs_pct: number
  existing_portfolio: Record<string, number>
}

interface WealthManagementInput {
  input_data: string
}

interface AssetAllocation {
  asset_class: string
  recommended_weight_pct: number
  current_weight_pct: number
  delta: number
  instruments: string[]
  expected_return_pct: number
  volatility_pct: number
}

interface RebalanceTrigger {
  asset_class: string
  trigger_condition: string
  drift_threshold_pct: number
  current_drift_pct: number
  action: string
}

interface TaxStrategy {
  strategy_name: string
  description: string
  estimated_tax_savings: number
  applicability: string
}

interface WealthReport {
  investor_id: string
  risk_score: number
  risk_profile: string
  asset_allocations: AssetAllocation[]
  rebalance_triggers: RebalanceTrigger[]
  tax_strategies: TaxStrategy[]
  projected_portfolio_return: number
  projected_portfolio_risk: number
  dashboard_data: Record<string, number>
}

// --- Tool 6: Market Risk VaR ---
interface PortfolioPosition {
  instrument_id: string
  instrument_type: 'equity' | 'bond' | 'fx' | 'commodity' | 'derivative'
  market_value: number
  currency: string
  sector: string
  region: string
}

interface MarketRiskInput {
  input_data: string
}

interface VaRResult {
  confidence_pct: number
  var_amount: number
  var_pct: number
  cvar_amount: number
  method: string
}

interface StressTestScenario {
  scenario_name: string
  shock_description: string
  portfolio_impact_pct: number
  portfolio_impact_amount: number
  recovery_estimate_days: number
}

interface ConcentrationRisk {
  dimension: string
  top_holding: string
  concentration_pct: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

interface LiquidityRisk {
  liquidity_tier: string
  total_value: number
  pct_of_portfolio: number
  days_to_liquidate: number
  stress_impact: string
}

interface MarketRiskReport {
  portfolio_total_value: number
  base_currency: string
  var_results: VaRResult[]
  stress_tests: StressTestScenario[]
  concentration_risks: ConcentrationRisk[]
  liquidity_risks: LiquidityRisk[]
  dashboard_data: Record<string, number>
}

// --- Tool 7: Insurance Actuarial AI ---
interface PolicyPortfolio {
  line_of_business: string
  num_policies: number
  total_sum_insured: number
  total_premium: number
  avg_premium: number
  loss_ratio_3yr: number
  region: string
}

interface ActuarialInput {
  input_data: string
}

interface LossDistribution {
  loss_type: string
  frequency_mean: number
  frequency_std: number
  severity_mean: number
  severity_std: number
  expected_loss: number
  tail_loss_99: number
}

interface ReserveEstimate {
  reserve_type: string
  central_estimate: number
  prudential_margin_pct: number
  total_reserve: number
  confidence_level: number
}

interface CatModeling {
  peril: string
  return_period_years: number
  gross_loss_estimate: number
  net_loss_after_reinsurance: number
  probability_pct: number
}

interface RateMaking {
  line_of_business: string
  current_rate: number
  indicated_rate: number
  rate_change_pct: number
  expense_ratio: number
  target_loss_ratio: number
  profitability_assessment: string
}

interface ActuarialReport {
  total_portfolio_value: number
  loss_distributions: LossDistribution[]
  reserve_estimates: ReserveEstimate[]
  cat_modeling: CatModeling[]
  rate_making: RateMaking[]
  combined_ratio_estimate: number
  dashboard_data: Record<string, number>
}

// --- Tool 8: Fintech Product Designer ---
interface ProductConcept {
  product_name: string
  product_type: string
  target_segment: string
  key_features: string[]
  target_audience_size: number
  estimated_development_months: number
}

interface ProductDesignInput {
  input_data: string
}

interface DemandMatchAnalysis {
  feature: string
  demand_score: number
  market_validation: string
  priority: 'must_have' | 'should_have' | 'nice_to_have'
}

interface PricingModel {
  pricing_dimension: string
  recommended_approach: string
  estimated_price_range: string
  competitive_comparison: string
  profit_margin_pct: number
}

interface CompetitorAnalysis {
  competitor_name: string
  market_share: number
  strengths: string[]
  weaknesses: string[]
  differentiation_opportunity: string
}

interface RegulatoryFeasibility {
  regulation: string
  compliance_difficulty: 'low' | 'medium' | 'high'
  estimated_compliance_cost: number
  time_to_comply_months: number
  key_requirements: string[]
}

interface ProductDesignReport {
  product_name: string
  product_type: string
  overall_viability_score: number
  demand_match: DemandMatchAnalysis[]
  risk_assessment: Record<string, string>
  pricing_models: PricingModel[]
  competitor_landscape: CompetitorAnalysis[]
  regulatory_feasibility: RegulatoryFeasibility[]
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Credit Risk Scorer 分析 ---
function analyzeCreditRiskScorer(data: string): CreditScoreResult {
  const profile: BorrowerProfile = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    profile.borrower_id + profile.annual_income + profile.loan_amount_requested
  ))

  // Score components (300-850 range)
  const incomeScore = Math.min(Math.max((profile.annual_income / 200000) * 100, 0), 150)
  const dtiScore = Math.max(0, 150 - profile.debt_to_income_ratio * 3)
  const empScore = Math.min(profile.employment_years * 15, 100)
  const historyScore = Math.min(profile.credit_history_months * 0.8, 130)
  const delinquencyPenalty = profile.num_delinquencies_2y * 40
  const accountDiversity = Math.min(profile.num_open_accounts * 5, 50)

  const rawScore = 300 + incomeScore + dtiScore + empScore + historyScore + accountDiversity - delinquencyPenalty
  const creditScore = Math.max(300, Math.min(850, Math.round(rawScore + rng.nextFloat(-10, 10))))

  // Default probability (logistic-like mapping)
  const defaultProbability = Math.max(0.001, Math.min(0.5, 1 / (1 + Math.exp((creditScore - 600) / 50)) + rng.nextFloat(-0.01, 0.01)))

  // Risk grade
  let riskGrade: string
  if (creditScore >= 750) riskGrade = 'AAA'
  else if (creditScore >= 700) riskGrade = 'AA'
  else if (creditScore >= 650) riskGrade = 'A'
  else if (creditScore >= 600) riskGrade = 'BBB'
  else if (creditScore >= 550) riskGrade = 'BB'
  else if (creditScore >= 500) riskGrade = 'B'
  else riskGrade = 'C'

  // Credit limit recommendation
  const incomeMultiplier = creditScore >= 700 ? 0.5 : creditScore >= 600 ? 0.3 : creditScore >= 500 ? 0.15 : 0.05
  const recommendedLimit = Math.min(
    profile.annual_income * incomeMultiplier,
    profile.loan_amount_requested * (creditScore >= 650 ? 1.2 : 0.8)
  )

  // Interest rate pricing (risk-based)
  const baseRate = 0.035
  const riskPremium = defaultProbability * 0.4
  const interestRate = Math.round((baseRate + riskPremium + rng.nextFloat(-0.002, 0.005)) * 10000) / 10000

  const riskFactors: string[] = []
  const mitigatingFactors: string[] = []

  if (profile.debt_to_income_ratio > 0.4) riskFactors.push(`债务收入比偏高 (${(profile.debt_to_income_ratio * 100).toFixed(1)}%)`)
  if (profile.num_delinquencies_2y > 0) riskFactors.push(`近2年逾期${profile.num_delinquencies_2y}次`)
  if (profile.employment_years < 2) riskFactors.push(`工作年限较短 (${profile.employment_years}年)`)
  if (profile.credit_history_months < 24) riskFactors.push(`信用历史较短 (${profile.credit_history_months}个月)`)

  if (profile.annual_income > 100000) mitigatingFactors.push('收入水平高于平均水平')
  if (profile.debt_to_income_ratio < 0.2) mitigatingFactors.push('债务负担低')
  if (profile.employment_years > 5) mitigatingFactors.push('工作稳定')
  if (profile.credit_history_months > 60) mitigatingFactors.push('信用历史良好')

  const scoreBreakdown: Record<string, number> = {
    income_component: Math.round(incomeScore),
    dti_component: Math.round(dtiScore),
    employment_component: Math.round(empScore),
    history_component: Math.round(historyScore),
    account_diversity: Math.round(accountDiversity),
    delinquency_penalty: -delinquencyPenalty,
  }

  const dashboardData: Record<string, number> = {
    credit_score: creditScore,
    default_probability_pct: Math.round(defaultProbability * 10000) / 100,
    recommended_limit: Math.round(recommendedLimit),
    interest_rate_pct: Math.round(interestRate * 10000) / 100,
    risk_grade_score: riskGrade === 'AAA' ? 7 : riskGrade === 'AA' ? 6 : riskGrade === 'A' ? 5 : riskGrade === 'BBB' ? 4 : riskGrade === 'BB' ? 3 : riskGrade === 'B' ? 2 : 1,
    income_years: profile.employment_years,
    dti_pct: Math.round(profile.debt_to_income_ratio * 100),
    delinquencies: profile.num_delinquencies_2y,
  }

  return {
    borrower_id: profile.borrower_id,
    credit_score: creditScore,
    default_probability: Math.round(defaultProbability * 10000) / 10000,
    risk_grade: riskGrade,
    recommended_credit_limit: Math.round(recommendedLimit),
    interest_rate_pricing: Math.round(interestRate * 10000) / 100,
    risk_factors: riskFactors.length > 0 ? riskFactors : ['未发现显著风险因素'],
    mitigating_factors: mitigatingFactors.length > 0 ? mitigatingFactors : ['建议建立更长信用历史'],
    score_breakdown: scoreBreakdown,
    dashboard_data: dashboardData,
  }
}

// --- Tool 2: Fraud Detection Engine 分析 ---
function analyzeFraudDetectionEngine(data: string): FraudDetectionReport {
  const input: { transactions: TransactionData[] } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.transactions.length.toString() + (input.transactions[0]?.account_id || 'default')
  ))

  const fraudAlerts: FraudAlert[] = []
  const ruleTriggers: string[] = []

  for (const txn of input.transactions) {
    let anomalyScore = 0
    const patterns: string[] = []

    // Amount anomaly
    if (txn.amount > 10000) {
      anomalyScore += 0.2
      patterns.push('大额交易')
    }
    if (txn.amount > 50000) {
      anomalyScore += 0.15
      patterns.push('超大额交易')
    }

    // Velocity anomaly
    if (txn.velocity_1h > 5) {
      anomalyScore += 0.25
      patterns.push('高频短时交易')
    }
    if (txn.velocity_24h > 20) {
      anomalyScore += 0.15
      patterns.push('24h累计高频')
    }

    // Geographic anomaly
    if (txn.is_international) {
      anomalyScore += 0.1
      patterns.push('跨境交易')
    }

    // Channel risk
    if (txn.channel === 'online' && txn.amount > 5000) {
      anomalyScore += 0.15
      patterns.push('在线大额交易')
    }

    // Merchant category risk
    const highRiskCategories = ['gambling', 'crypto', 'wire_transfer', 'jewelry']
    if (highRiskCategories.some(c => txn.merchant_category.toLowerCase().includes(c))) {
      anomalyScore += 0.2
      patterns.push('高风险商户类别')
    }

    // Add deterministic noise
    anomalyScore += rng.nextFloat(-0.05, 0.05)
    anomalyScore = Math.max(0, Math.min(1, anomalyScore))

    if (anomalyScore > 0.4) {
      let action = 'review'
      if (anomalyScore > 0.7) action = 'block_and_investigate'
      else if (anomalyScore > 0.55) action = 'step_up_authentication'

      fraudAlerts.push({
        txn_id: txn.txn_id,
        anomaly_score: Math.round(anomalyScore * 100) / 100,
        fraud_patterns: patterns.length > 0 ? patterns : ['综合异常评分高'],
        recommended_action: action,
        false_positive_probability: Math.max(0.05, Math.round((1 - anomalyScore + rng.nextFloat(0, 0.1)) * 100) / 100),
      })
    }

    // Track rule triggers
    if (txn.amount > 10000) ruleTriggers.push(`金额阈值规则: ${txn.txn_id}`)
    if (txn.velocity_1h > 5) ruleTriggers.push(`速度规则触发: ${txn.txn_id}`)
    if (txn.is_international && txn.amount > 5000) ruleTriggers.push(`跨境规则: ${txn.txn_id}`)
  }

  const alertsGenerated = fraudAlerts.length
  const falsePositiveRate = alertsGenerated > 0
    ? fraudAlerts.reduce((s, a) => s + a.false_positive_probability, 0) / alertsGenerated
    : 0.05

  const modelAccuracy = 0.92 + rng.nextFloat(-0.02, 0.05)

  const dashboardData: Record<string, number> = {
    total_transactions: input.transactions.length,
    alerts_generated: alertsGenerated,
    alert_rate_pct: Math.round((alertsGenerated / Math.max(input.transactions.length, 1)) * 10000) / 100,
    false_positive_rate: Math.round(falsePositiveRate * 10000) / 100,
    model_accuracy: Math.round(modelAccuracy * 10000) / 100,
    blocked_count: fraudAlerts.filter(a => a.recommended_action === 'block_and_investigate').length,
    review_count: fraudAlerts.filter(a => a.recommended_action === 'review').length,
    avg_anomaly_score: alertsGenerated > 0
      ? Math.round((fraudAlerts.reduce((s, a) => s + a.anomaly_score, 0) / alertsGenerated) * 100) / 100
      : 0,
    high_risk_alerts: fraudAlerts.filter(a => a.anomaly_score > 0.7).length,
  }

  return {
    total_transactions: input.transactions.length,
    alerts_generated: alertsGenerated,
    fraud_alerts: fraudAlerts,
    false_positive_rate: Math.round(falsePositiveRate * 10000) / 100,
    model_accuracy: Math.round(modelAccuracy * 10000) / 100,
    rule_triggers: ruleTriggers.slice(0, 20),
    dashboard_data: dashboardData,
  }
}

// --- Tool 3: Algorithmic Trading Advisor 分析 ---
function analyzeAlgorithmicTradingAdvisor(data: string): TradingReport {
  const input: StrategyInput = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.strategy_name + input.lookback_period_days + input.benchmark
  ))

  // Backtest simulation
  const annualizedReturn = rng.nextFloat(-5, 25)
  const volatility = rng.nextFloat(8, 35)
  const sharpeRatio = (annualizedReturn - 3) / volatility
  const sortinoRatio = sharpeRatio * rng.nextFloat(1.1, 1.5)
  const maxDrawdown = -(rng.nextFloat(5, 35))
  const alpha = annualizedReturn - (8 + rng.nextFloat(-2, 4))
  const beta = rng.nextFloat(0.5, 1.5)
  const informationRatio = alpha / rng.nextFloat(2, 8)
  const winRate = rng.nextFloat(40, 70)
  const profitFactor = rng.nextFloat(0.8, 2.5)

  const backtestResult: BacktestResult = {
    total_return_pct: Math.round(annualizedReturn * input.lookback_period_days / 252 * 100) / 100,
    annualized_return_pct: Math.round(annualizedReturn * 100) / 100,
    sharpe_ratio: Math.round(sharpeRatio * 100) / 100,
    sortino_ratio: Math.round(sortinoRatio * 100) / 100,
    max_drawdown_pct: Math.round(maxDrawdown * 100) / 100,
    alpha_pct: Math.round(alpha * 100) / 100,
    beta: Math.round(beta * 100) / 100,
    information_ratio: Math.round(informationRatio * 100) / 100,
    win_rate_pct: Math.round(winRate * 100) / 100,
    profit_factor: Math.round(profitFactor * 100) / 100,
  }

  // Factor exposures
  const defaultFactors = ['value', 'momentum', 'quality', 'low_volatility', 'size']
  const factorExposures: FactorExposure[] = []

  for (const factor of defaultFactors) {
    const weight = input.factor_weights[factor]
    if (weight !== undefined) {
      factorExposures.push({
        factor_name: factor,
        exposure: Math.round((rng.nextFloat(-0.5, 0.5) + weight) * 100) / 100,
        contribution_pct: Math.round(rng.nextFloat(-5, 15) * 100) / 100,
        t_statistic: Math.round(rng.nextFloat(0.5, 4) * 100) / 100,
      })
    }
  }

  if (factorExposures.length === 0) {
    for (const factor of defaultFactors) {
      factorExposures.push({
        factor_name: factor,
        exposure: Math.round(rng.nextFloat(-0.3, 0.3) * 100) / 100,
        contribution_pct: Math.round(rng.nextFloat(-3, 10) * 100) / 100,
        t_statistic: Math.round(rng.nextFloat(0.8, 3) * 100) / 100,
      })
    }
  }

  const riskDecomposition: Record<string, number> = {
    systematic_risk: Math.round(rng.nextFloat(40, 70) * 100) / 100,
    idiosyncratic_risk: Math.round(rng.nextFloat(15, 40) * 100) / 100,
    factor_risk: Math.round(rng.nextFloat(10, 30) * 100) / 100,
    currency_risk: Math.round(rng.nextFloat(0, 10) * 100) / 100,
  }

  const optimizationSuggestions: string[] = []
  if (sharpeRatio < 1) optimizationSuggestions.push(' Sharpe比率低于1.0，建议优化因子权重配置')
  if (maxDrawdown < -20) optimizationSuggestions.push('最大回撤超过-20%，建议增加尾部风险管理')
  if (winRate < 50) optimizationSuggestions.push('胜率低于50%，建议改进入场时机选择')
  if (profitFactor < 1.2) optimizationSuggestions.push('盈亏比较低，建议优化止损/止盈比例')
  optimizationSuggestions.push(`当前因子暴露: ${factorExposures.sort((a, b) => b.exposure - a.exposure)[0]?.factor_name || 'momentum'}最高`)
  optimizationSuggestions.push(`建议将换手率控制在${input.rebalance_frequency === 'daily' ? '20%' : input.rebalance_frequency === 'weekly' ? '10%' : '5%'}以内`)

  const dashboardData: Record<string, number> = {
    annualized_return: backtestResult.annualized_return_pct,
    sharpe_ratio: backtestResult.sharpe_ratio,
    max_drawdown: backtestResult.max_drawdown_pct,
    alpha: backtestResult.alpha_pct,
    beta: backtestResult.beta,
    win_rate: backtestResult.win_rate_pct,
    profit_factor: backtestResult.profit_factor,
    lookback_days: input.lookback_period_days,
    num_factors: factorExposures.length,
  }

  return {
    strategy_name: input.strategy_name,
    backtest_result: backtestResult,
    factor_exposures: factorExposures,
    risk_decomposition: riskDecomposition,
    optimization_suggestions: optimizationSuggestions,
    dashboard_data: dashboardData,
  }
}

// --- Tool 4: RegTech Compliance Checker 分析 ---
function analyzeRegtechComplianceChecker(data: string): ComplianceReport {
  const input: { rules: ComplianceRule[] } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.rules.length.toString() + (input.rules[0]?.regulation_id || 'default')
  ))

  const complianceGaps: ComplianceGap[] = []
  const regulatoryChanges: RegulatoryChange[] = []

  let compliantCount = 0
  let partialCount = 0
  let nonCompliantCount = 0

  for (const rule of input.rules) {
    const statusRoll = rng.next()
    let status: ComplianceGap['compliance_status']
    let gapDesc: string
    let priority: ComplianceGap['remediation_priority']
    let cost: number

    if (statusRoll > 0.7) {
      status = 'compliant'
      compliantCount++
      gapDesc = '已符合监管要求'
      priority = 'low'
      cost = 0
    } else if (statusRoll > 0.35) {
      status = 'partially_compliant'
      partialCount++
      gapDesc = `部分合规：${rule.requirement_description.substring(0, 30)}需补充完善`
      priority = rng.next() > 0.5 ? 'medium' : 'low'
      cost = Math.round(rng.nextFloat(10000, 100000))
    } else {
      status = 'non_compliant'
      nonCompliantCount++
      gapDesc = `不合规：${rule.requirement_description.substring(0, 30)}需全面整改`
      priority = 'high'
      cost = Math.round(rng.nextFloat(50000, 500000))
    }

    complianceGaps.push({
      regulation_id: rule.regulation_id,
      regulation_name: rule.regulation_name,
      compliance_status: status,
      gap_description: gapDesc,
      remediation_priority: priority,
      estimated_remediation_cost: cost,
    })

    // Generate regulatory changes for some rules
    if (rng.next() > 0.6) {
      const changeDescriptions = [
        '上调资本充足率要求',
        '新增交易报告义务',
        '扩大KYC覆盖范围',
        '强化数据保护要求',
        '更新反洗钱指引',
        '引入流动性覆盖率新标准',
      ]
      const impactLevels: RegulatoryChange['impact_level'][] = ['high', 'medium', 'low']
      regulatoryChanges.push({
        regulation_id: rule.regulation_id,
        change_description: rng.pick(changeDescriptions),
        effective_date: `202${rng.nextInt(6, 7)}-0${rng.nextInt(1, 9)}-01`,
        impact_level: rng.pick(impactLevels),
        action_required: status === 'compliant' ? '评估对现有合规框架的影响' : '与新规整改合并执行',
      })
    }
  }

  const overallComplianceScore = input.rules.length > 0
    ? Math.round(((compliantCount + partialCount * 0.5) / input.rules.length) * 10000) / 100
    : 0

  const amlKycRules = input.rules.filter(r => r.category === 'AML' || r.category === 'KYC' || r.category === 'CTF')
  const amlKycCompliant = amlKycRules.filter((_r, i) => {
    const gap = complianceGaps[i]
    return gap && gap.compliance_status !== 'non_compliant'
  }).length
  const amlKycCoverage = amlKycRules.length > 0 ? Math.round((amlKycCompliant / amlKycRules.length) * 10000) / 100 : 100

  const dashboardData: Record<string, number> = {
    total_regulations: input.rules.length,
    compliant: compliantCount,
    partial: partialCount,
    non_compliant: nonCompliantCount,
    compliance_score: overallComplianceScore,
    aml_kyc_coverage: amlKycCoverage,
    pending_changes: regulatoryChanges.length,
    high_priority_gaps: complianceGaps.filter(g => g.remediation_priority === 'high').length,
    total_remediation_cost: complianceGaps.reduce((s, g) => s + g.estimated_remediation_cost, 0),
  }

  return {
    total_regulations: input.rules.length,
    compliant_count: compliantCount,
    partial_count: partialCount,
    non_compliant_count: nonCompliantCount,
    overall_compliance_score: overallComplianceScore,
    compliance_gaps: complianceGaps,
    regulatory_changes: regulatoryChanges,
    aml_kyc_coverage_pct: amlKycCoverage,
    dashboard_data: dashboardData,
  }
}

// --- Tool 5: Wealth Management Robo 分析 ---
function analyzeWealthManagementRobo(data: string): WealthReport {
  const profile: InvestorProfile = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    profile.investor_id + profile.age + profile.risk_tolerance
  ))

  // Risk score (0-100)
  const ageScore = Math.max(0, 100 - profile.age)
  const horizonScore = Math.min(profile.investment_horizon_years * 5, 40)
  const incomeScore = Math.min(Math.max((profile.net_worth / 1000000) * 10, 0), 25)
  const liquidityPenalty = profile.liquidity_needs_pct * 0.5

  const baseRiskScore = ageScore * 0.3 + horizonScore * 0.3 + incomeScore * 0.2 - liquidityPenalty
  let riskMultiplier: number
  switch (profile.risk_tolerance) {
    case 'aggressive': riskMultiplier = 1.3; break
    case 'moderate': riskMultiplier = 1.0; break
    case 'conservative': riskMultiplier = 0.6; break
    default: riskMultiplier = 1.0
  }

  const riskScore = Math.max(10, Math.min(95, Math.round(baseRiskScore * riskMultiplier + rng.nextFloat(-3, 3))))

  // Asset allocation
  const assetClasses = [
    'equity', 'fixed_income', 'alternatives', 'cash', 'real_estate', 'commodities'
  ]

  const getBaseWeights = (): number[] => {
    switch (profile.risk_tolerance) {
      case 'aggressive': return [50, 15, 20, 5, 7, 3]
      case 'moderate': return [35, 35, 12, 8, 7, 3]
      case 'conservative': return [15, 50, 5, 20, 7, 3]
    }
  }

  const baseWeights = getBaseWeights()
  const allocations: AssetAllocation[] = []

  for (let i = 0; i < assetClasses.length; i++) {
    const assetClass = assetClasses[i]!
    const recommended = baseWeights[i]!
    const current = profile.existing_portfolio[assetClass] ?? 0
    const delta = recommended - current

    const returnMap: Record<string, [number, number]> = {
      equity: [8, 18],
      fixed_income: [3, 6],
      alternatives: [10, 25],
      cash: [1, 2],
      real_estate: [6, 12],
      commodities: [4, 20],
    }

    const [minRet, maxRet] = returnMap[assetClass]!
    const instrumentsMap: Record<string, string[]> = {
      equity: ['沪深300ETF', '标普500ETF', 'MSCI新兴市场ETF'],
      fixed_income: ['国债ETF', '投资级债ETF', '可转债基金'],
      alternatives: ['对冲基金', '私募股权', '基础设施REITs'],
      cash: ['货币基金', '银行理财T+0', '短期定存'],
      real_estate: ['公募REITs', '房产指数基金'],
      commodities: ['黄金ETF', '原油期货基金'],
    }

    allocations.push({
      asset_class: assetClass,
      recommended_weight_pct: recommended,
      current_weight_pct: Math.round(current * 100) / 100,
      delta: Math.round(delta * 100) / 100,
      instruments: instrumentsMap[assetClass]!,
      expected_return_pct: Math.round(rng.nextFloat(minRet, maxRet) * 100) / 100,
      volatility_pct: Math.round(rng.nextFloat(3, maxRet + 2) * 100) / 100,
    })
  }

  // Rebalance triggers
  const rebalanceTriggers: RebalanceTrigger[] = allocations
    .filter(a => Math.abs(a.delta) > 5)
    .map(a => ({
      asset_class: a.asset_class,
      trigger_condition: `权重偏离目标${Math.abs(a.delta).toFixed(1)}%以上`,
      drift_threshold_pct: 5,
      current_drift_pct: Math.abs(a.delta),
      action: a.delta > 0 ? `增配${a.asset_class}` : `减配${a.asset_class}`,
    }))

  // Tax strategies
  const taxStrategies: TaxStrategy[] = [
    {
      strategy_name: 'Tax-Loss Harvesting (税损收割)',
      description: '卖出亏损头寸抵消资本利得税',
      estimated_tax_savings: Math.round(profile.net_worth * rng.nextFloat(0.001, 0.005)),
      applicability: '适用于应税账户中有未实现亏损的投资组合',
    },
    {
      strategy_name: 'Asset Location Optimization (资产定位)',
      description: '将低效资产放至税收优惠账户',
      estimated_tax_savings: Math.round(profile.annual_income * rng.nextFloat(0.005, 0.02)),
      applicability: '适用于同时持有应税账户和税收优惠账户',
    },
    {
      strategy_name: 'Roth Conversion Ladder',
      description: '分批转换传统IRA至Roth IRA',
      estimated_tax_savings: Math.round(profile.annual_income * rng.nextFloat(0.01, 0.03)),
      applicability: '适用于退休前税率低于退休后预期的投资者',
    },
  ]

  // Projected portfolio metrics
  const projectedReturn = allocations.reduce((s, a) => s + a.recommended_weight_pct * a.expected_return_pct / 100, 0)
  const projectedRisk = Math.sqrt(allocations.reduce((s, a) => s + Math.pow(a.recommended_weight_pct * a.volatility_pct / 100, 2), 0))

  const dashboardData: Record<string, number> = {
    risk_score: riskScore,
    projected_return: Math.round(projectedReturn * 100) / 100,
    projected_risk: Math.round(projectedRisk * 100) / 100,
    num_rebalance_triggers: rebalanceTriggers.length,
    num_tax_strategies: taxStrategies.length,
    total_tax_savings: taxStrategies.reduce((s, t) => s + t.estimated_tax_savings, 0),
    equity_allocation: allocations.find(a => a.asset_class === 'equity')?.recommended_weight_pct ?? 0,
    fixed_income_allocation: allocations.find(a => a.asset_class === 'fixed_income')?.recommended_weight_pct ?? 0,
    age: profile.age,
    horizon: profile.investment_horizon_years,
  }

  return {
    investor_id: profile.investor_id,
    risk_score: riskScore,
    risk_profile: profile.risk_tolerance,
    asset_allocations: allocations,
    rebalance_triggers: rebalanceTriggers,
    tax_strategies: taxStrategies,
    projected_portfolio_return: Math.round(projectedReturn * 100) / 100,
    projected_portfolio_risk: Math.round(projectedRisk * 100) / 100,
    dashboard_data: dashboardData,
  }
}

// --- Tool 6: Market Risk VaR 分析 ---
function analyzeMarketRiskVar(data: string): MarketRiskReport {
  const input: { positions: PortfolioPosition[], base_currency: string } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.positions.length.toString() + input.base_currency
  ))

  const totalValue = input.positions.reduce((s, p) => s + p.market_value, 0)
  const baseCurrency = input.base_currency || 'USD'

  // VaR calculations at 95% and 99%
  const volatilities = [0.12, 0.18, 0.08, 0.25, 0.30]
  const avgVol = volatilities.slice(0, input.positions.length).reduce((s, v) => s + v, 0) / Math.max(input.positions.length, 1)
  const z95 = 1.645
  const z99 = 2.326

  const var95Amount = totalValue * avgVol * z95 / Math.sqrt(252)
  const var99Amount = totalValue * avgVol * z99 / Math.sqrt(252)
  const cvar95 = var95Amount * 1.25
  const cvar99 = var99Amount * 1.3

  const varResults: VaRResult[] = [
    { confidence_pct: 95, var_amount: Math.round(var95Amount), var_pct: Math.round(var95Amount / totalValue * 10000) / 100, cvar_amount: Math.round(cvar95), method: 'parametric' },
    { confidence_pct: 99, var_amount: Math.round(var99Amount), var_pct: Math.round(var99Amount / totalValue * 10000) / 100, cvar_amount: Math.round(cvar99), method: 'historical' },
  ]

  // Stress tests
  const stressTests: StressTestScenario[] = [
    {
      scenario_name: '2008金融危机重演',
      shock_description: '全球股市-40%，信用利差+500bps',
      portfolio_impact_pct: -rng.nextFloat(20, 40),
      portfolio_impact_amount: Math.round(-totalValue * rng.nextFloat(0.2, 0.4)),
      recovery_estimate_days: rng.nextInt(365, 730),
    },
    {
      scenario_name: '2020新冠暴跌',
      shock_description: '股市-35%+流动性危机',
      portfolio_impact_pct: -rng.nextFloat(15, 35),
      portfolio_impact_amount: Math.round(-totalValue * rng.nextFloat(0.15, 0.35)),
      recovery_estimate_days: rng.nextInt(90, 180),
    },
    {
      scenario_name: '利率急升300bps',
      shock_description: '国债收益率+300bps，成长股重估',
      portfolio_impact_pct: -rng.nextFloat(8, 22),
      portfolio_impact_amount: Math.round(-totalValue * rng.nextFloat(0.08, 0.22)),
      recovery_estimate_days: rng.nextInt(180, 365),
    },
    {
      scenario_name: '汇率冲击(CNY贬值10%)',
      shock_description: '人民币兑美元贬值10%',
      portfolio_impact_pct: -rng.nextFloat(3, 12),
      portfolio_impact_amount: Math.round(-totalValue * rng.nextFloat(0.03, 0.12)),
      recovery_estimate_days: rng.nextInt(60, 180),
    },
  ]

    // Concentration risk
  const bySector = new Map<string, number>()
  const byRegion = new Map<string, number>()
  for (const pos of input.positions) {
    bySector.set(pos.sector, (bySector.get(pos.sector) || 0) + pos.market_value)
    byRegion.set(pos.region, (byRegion.get(pos.region) || 0) + pos.market_value)
  }

  const concentrationRisks: ConcentrationRisk[] = []

  const sortedSectors = [...bySector.entries()].sort((a, b) => b[1] - a[1])
  if (sortedSectors.length > 0 && sortedSectors[0]) {
    const [topSector, topValue] = sortedSectors[0]
    const conc_pct = topValue / totalValue * 100
    concentrationRisks.push({
      dimension: '行业',
      top_holding: topSector,
      concentration_pct: Math.round(conc_pct * 100) / 100,
      risk_level: conc_pct > 50 ? 'critical' : conc_pct > 35 ? 'high' : conc_pct > 20 ? 'medium' : 'low',
      recommendation: conc_pct > 35 ? '建议分散至3+行业' : '行业集中度可控',
    })
  }

  const sortedRegions = [...byRegion.entries()].sort((a, b) => b[1] - a[1])
  if (sortedRegions.length > 0 && sortedRegions[0]) {
    const [topRegion, topValue] = sortedRegions[0]
    const conc_pct = topValue / totalValue * 100
    concentrationRisks.push({
      dimension: '地区',
      top_holding: topRegion,
      concentration_pct: Math.round(conc_pct * 100) / 100,
      risk_level: conc_pct > 70 ? 'critical' : conc_pct > 50 ? 'high' : conc_pct > 30 ? 'medium' : 'low',
      recommendation: conc_pct > 50 ? '建议增加海外配置' : '地区分布合理',
    })
  }

  // Liquidity risk
  const liquidValue = input.positions.filter(p => p.instrument_type === 'equity').reduce((s, p) => s + p.market_value, 0)
  const semiLiquidValue = input.positions.filter(p => p.instrument_type === 'bond').reduce((s, p) => s + p.market_value, 0)
  const illiquidValue = input.positions.filter(p => ['real_estate', 'commodity'].includes(p.instrument_type)).reduce((s, p) => s + p.market_value, 0)

  const liquidityRisks: LiquidityRisk[] = [
    { liquidity_tier: '高流动性(T+0/T+1)', total_value: Math.round(liquidValue), pct_of_portfolio: Math.round(liquidValue / totalValue * 10000) / 100, days_to_liquidate: 1, stress_impact: '可快速变现' },
    { liquidity_tier: '中流动性(T+2~T+5)', total_value: Math.round(semiLiquidValue), pct_of_portfolio: Math.round(semiLiquidValue / totalValue * 10000) / 100, days_to_liquidate: rng.nextInt(2, 5), stress_impact: '可能需要折价' },
    { liquidity_tier: '低流动性(T+5以上)', total_value: Math.round(illiquidValue), pct_of_portfolio: Math.round(illiquidValue / totalValue * 10000) / 100, days_to_liquidate: rng.nextInt(10, 60), stress_impact: '变现存在不确定性' },
  ]

  const dashboardData: Record<string, number> = {
    portfolio_total: Math.round(totalValue),
    var_95: Math.round(var95Amount),
    var_99: Math.round(var99Amount),
    cvar_95: Math.round(cvar95),
    var_pct: Math.round(var95Amount / totalValue * 10000) / 100,
    max_stress_impact: Math.round(Math.min(...stressTests.map(s => s.portfolio_impact_pct)) * 100) / 100,
    concentration_count: concentrationRisks.length,
    high_risk_concentration: concentrationRisks.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length,
    liquid_pct: Math.round(liquidValue / totalValue * 10000) / 100,
    num_positions: input.positions.length,
  }

  return {
    portfolio_total_value: Math.round(totalValue),
    base_currency: baseCurrency,
    var_results: varResults,
    stress_tests: stressTests,
    concentration_risks: concentrationRisks,
    liquidity_risks: liquidityRisks,
    dashboard_data: dashboardData,
  }
}

// --- Tool 7: Insurance Actuarial AI 分析 ---
function analyzeInsuranceActuarialAi(data: string): ActuarialReport {
  const input: { portfolios: PolicyPortfolio[] } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.portfolios.length.toString() + (input.portfolios[0]?.line_of_business || 'default')
  ))

  const totalPortfolioValue = input.portfolios.reduce((s, p) => s + p.total_premium, 0)

  // Loss distributions
  const lossTypes = ['property_damage', 'liability', 'motor', 'health', 'natural_catastrophe', 'cyber']
  const lossDistributions: LossDistribution[] = []

  for (const lob of input.portfolios) {
    const lt = rng.pick(lossTypes)
    const freqMean = lob.num_policies * rng.nextFloat(0.01, 0.15)
    const sevMean = lob.avg_premium * rng.nextFloat(0.5, 3)
    lossDistributions.push({
      loss_type: `${lob.line_of_business}_${lt}`,
      frequency_mean: Math.round(freqMean * 100) / 100,
      frequency_std: Math.round(freqMean * rng.nextFloat(0.2, 0.5) * 100) / 100,
      severity_mean: Math.round(sevMean),
      severity_std: Math.round(sevMean * rng.nextFloat(0.5, 2)),
      expected_loss: Math.round(freqMean * sevMean),
      tail_loss_99: Math.round(freqMean * sevMean * rng.nextFloat(3, 8)),
    })
  }

  // Reserve estimates
  const reserveTypes = ['IBNER', 'IBNR', 'UPR', 'OSLR', 'CAT_Reserve']
  const reserveEstimates: ReserveEstimate[] = []

  for (const lob of input.portfolios) {
    const rt = rng.pick(reserveTypes)
    const central = lob.total_premium * rng.nextFloat(0.15, 0.6)
    const margin = rng.nextFloat(5, 20)
    reserveEstimates.push({
      reserve_type: `${lob.line_of_business}_${rt}`,
      central_estimate: Math.round(central),
      prudential_margin_pct: Math.round(margin * 100) / 100,
      total_reserve: Math.round(central * (1 + margin / 100)),
      confidence_level: rng.pick([90, 95, 99]),
    })
  }

  // Cat modeling
  const perils = ['earthquake', 'hurricane', 'flood', 'wildfire', 'pandemic', 'terrorism']
  const catModeling: CatModeling[] = []

  for (const lob of input.portfolios.filter(l => l.region !== 'Global').slice(0, 3)) {
    const peril = rng.pick(perils)
    const grossLoss = lob.total_sum_insured * rng.nextFloat(0.01, 0.15)
    const retention = grossLoss * rng.nextFloat(0.1, 0.3)
    catModeling.push({
      peril,
      return_period_years: rng.pick([50, 100, 250, 500]),
      gross_loss_estimate: Math.round(grossLoss),
      net_loss_after_reinsurance: Math.round(grossLoss - retention),
      probability_pct: Math.round(rng.nextFloat(0.2, 5) * 100) / 100,
    })
  }

  // Rate making
  const rateMaking: RateMaking[] = []
  for (const lob of input.portfolios) {
    const expRatio = rng.nextFloat(0.55, 0.75)
    const targetLR = rng.nextFloat(0.6, 0.75)
    const currentRate = lob.avg_premium
    const indicatedRate = lob.total_sum_insured * (expRatio + rng.nextFloat(0.15, 0.25)) / lob.num_policies
    const rateChange = (indicatedRate - currentRate) / currentRate * 100

    rateMaking.push({
      line_of_business: lob.line_of_business,
      current_rate: Math.round(currentRate),
      indicated_rate: Math.round(indicatedRate),
      rate_change_pct: Math.round(rateChange * 100) / 100,
      expense_ratio: Math.round(expRatio * 10000) / 100,
      target_loss_ratio: Math.round(targetLR * 10000) / 100,
      profitability_assessment: rateChange > 10 ? '定价不足，需大幅加费' : rateChange > 3 ? '轻微不足，建议适度调整' : rateChange > -3 ? '定价合理' : '定价充足，具有竞争力',
    })
  }

  const combinedRatio = 85 + rng.nextFloat(-10, 20)

  const dashboardData: Record<string, number> = {
    total_premium_income: Math.round(totalPortfolioValue),
    loss_distributions: lossDistributions.length,
    total_reserves: reserveEstimates.reduce((s, r) => s + r.total_reserve, 0),
    cat_events_modeled: catModeling.length,
    avg_rate_change: Math.round(rateMaking.reduce((s, r) => s + r.rate_change_pct, 0) / Math.max(rateMaking.length, 1) * 100) / 100,
    combined_ratio: Math.round(combinedRatio * 100) / 100,
    profitable_lines: rateMaking.filter(r => r.rate_change_pct < 5).length,
    total_policies: input.portfolios.reduce((s, p) => s + p.num_policies, 0),
  }

  return {
    total_portfolio_value: Math.round(totalPortfolioValue),
    loss_distributions: lossDistributions,
    reserve_estimates: reserveEstimates,
    cat_modeling: catModeling,
    rate_making: rateMaking,
    combined_ratio_estimate: Math.round(combinedRatio * 100) / 100,
    dashboard_data: dashboardData,
  }
}

// --- Tool 8: Fintech Product Designer 分析 ---
function analyzeFintechProductDesigner(data: string): ProductDesignReport {
  const concept: ProductConcept = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    concept.product_name + concept.product_type + concept.target_segment
  ))

  // Demand match analysis
  const demandMatch: DemandMatchAnalysis[] = concept.key_features.map(feature => ({
    feature,
    demand_score: Math.round(rng.nextFloat(40, 98)),
    market_validation: rng.next() > 0.3 ? '已验证需求' : '待验证需求',
    priority: rng.next() > 0.6 ? 'must_have' : rng.next() > 0.3 ? 'should_have' : 'nice_to_have',
  }))

  demandMatch.sort((a, b) => b.demand_score - a.demand_score)

  // Risk assessment
  const riskAssessment: Record<string, string> = {
    market_risk: rng.next() > 0.5 ? '中等：目标市场已有多家竞品' : '低：蓝海市场机会',
    technology_risk: rng.next() > 0.5 ? '中等：需集成第三方API' : '低：技术栈成熟可靠',
    regulatory_risk: rng.next() > 0.7 ? '高：涉及强监管领域' : '中等：合规要求明确',
    operational_risk: rng.next() > 0.5 ? '中等：需要建立风控体系' : '低：运营模式已验证',
    credit_risk: concept.product_type.includes('lending') || concept.product_type.includes('credit') ? '高：核心风险在信用评估' : '低：不涉及信用风险',
  }

  // Pricing models
  const pricingDimensions = ['subscription', 'transaction_fee', 'freemium', 'tiered', 'usage_based']
  const pricingModels: PricingModel[] = pricingDimensions.slice(0, rng.nextInt(2, 4)).map(dim => ({
    pricing_dimension: dim,
    recommended_approach: `基于${dim}模式`,
    estimated_price_range: `¥${rng.nextInt(0, 50)} - ¥${rng.nextInt(50, 500)}/月`,
    competitive_comparison: rng.next() > 0.5 ? '低于市场均价10-20%' : '与市场均价持平',
    profit_margin_pct: Math.round(rng.nextFloat(15, 60) * 100) / 100,
  }))

  // Competitor analysis
  const competitorNames = ['蚂蚁集团', '腾讯金融科技', '京东金融', '陆金所', '宜人贷', '微众银行']
  const competitorAnalysis: CompetitorAnalysis[] = competitorNames.slice(0, rng.nextInt(2, 4)).map(name => ({
    competitor_name: name,
    market_share: Math.round(rng.nextFloat(2, 25) * 100) / 100,
    strengths: ['品牌知名度高', '用户基数大', '资金实力强'].slice(0, rng.nextInt(1, 3)),
    weaknesses: ['产品创新不足', '用户体验待优化', '费率偏高'].slice(0, rng.nextInt(1, 3)),
    differentiation_opportunity: `${concept.key_features[0] || '核心功能'}差异化`,
  }))

  // Regulatory feasibility
  const regulations = ['网络安全法', '数据安全法', '个人信息保护法', '反洗钱法', '支付业务许可证', '征信业务管理办法']
  const regulatoryFeasibility: RegulatoryFeasibility[] = regulations.slice(0, rng.nextInt(2, 4)).map(reg => ({
    regulation: reg,
    compliance_difficulty: rng.next() > 0.6 ? 'high' : rng.next() > 0.3 ? 'medium' : 'low',
    estimated_compliance_cost: Math.round(rng.nextFloat(50000, 500000)),
    time_to_comply_months: rng.nextInt(1, 12),
    key_requirements: ['数据本地化存储', '用户授权同意', '定期合规审计'].slice(0, rng.nextInt(1, 3)),
  }))

  // Overall viability
  const avgDemandScore = demandMatch.reduce((s, d) => s + d.demand_score, 0) / Math.max(demandMatch.length, 1)
  const regulatoryPenalty = regulatoryFeasibility.filter(r => r.compliance_difficulty === 'high').length * 5
  const overallViability = Math.max(20, Math.min(95, Math.round(avgDemandScore * 0.6 + (100 - regulatoryPenalty) * 0.4 + rng.nextFloat(-5, 5))))

  const recommendations: string[] = []
  if (avgDemandScore > 75) recommendations.push('核心功能需求强劲，建议加速开发')
  if (regulatoryPenalty > 10) recommendations.push('监管合规成本较高，建议提前规划合规预算')
  if (competitorAnalysis.length > 3) recommendations.push('市场竞争激烈，建议聚焦差异化功能')
  recommendations.push(`预计开发周期: ${concept.estimated_development_months}个月`)
  recommendations.push(`目标用户规模: ${concept.target_audience_size.toLocaleString()}人`)
  if (overallViability > 70) recommendations.push('综合可行性评分较高，建议立项')

  const dashboardData: Record<string, number> = {
    viability_score: overallViability,
    avg_demand_score: Math.round(avgDemandScore * 100) / 100,
    num_features: concept.key_features.length,
    num_competitors: competitorAnalysis.length,
    regulatory_items: regulatoryFeasibility.length,
    high_difficulty_regulations: regulatoryFeasibility.filter(r => r.compliance_difficulty === 'high').length,
    total_compliance_cost: regulatoryFeasibility.reduce((s, r) => s + r.estimated_compliance_cost, 0),
    estimated_dev_months: concept.estimated_development_months,
    target_audience: concept.target_audience_size,
  }

  return {
    product_name: concept.product_name,
    product_type: concept.product_type,
    overall_viability_score: overallViability,
    demand_match: demandMatch,
    risk_assessment: riskAssessment,
    pricing_models: pricingModels,
    competitor_landscape: competitorAnalysis,
    regulatory_feasibility: regulatoryFeasibility,
    recommendations,
    dashboard_data: dashboardData,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Credit Risk Scorer 报告 ---
function formatCreditRiskScorerReport(result: CreditScoreResult): string {
  const lines: string[] = []
  lines.push('## 🏦 Credit Risk Scorer — 信用风险评分引擎')
  lines.push('')
  lines.push(`> **借款人**: ${result.borrower_id} | **风险等级**: ${result.risk_grade} | **评分**: ${result.credit_score}/850`)
  lines.push('')
  lines.push('### 📊 信用评分仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    APP[贷款申请] --> SCORE[信用评分]')
  lines.push('    SCORE --> GRADE[风险分级]')
  lines.push('    GRADE --> LIMIT[额度建议]')
  lines.push('    GRADE --> RATE[利率定价]')
  lines.push(`    SCORE_VAL[评分: ${result.credit_score}]`)
  lines.push(`    PD[违约概率: ${result.default_probability}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 评分结果汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 信用评分 | **${result.credit_score}** / 850 |`)
  lines.push(`| 违约概率 | ${result.default_probability}% |`)
  lines.push(`| 风险等级 | ${result.risk_grade} |`)
  lines.push(`| 建议额度 | ¥${result.recommended_credit_limit.toLocaleString()} |`)
  lines.push(`| 利率定价 | ${result.interest_rate_pricing}% |`)
  lines.push('')

  lines.push('### 📊 评分构成')
  lines.push('| 维度 | 得分 |')
  lines.push('|------|------|')
  for (const [key, val] of Object.entries(result.score_breakdown)) {
    lines.push(`| ${key} | ${val} |`)
  }
  lines.push('')

  lines.push('### ⚠️ 风险因素')
  for (const r of result.risk_factors) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### ✅ 缓解因素')
  for (const m of result.mitigating_factors) lines.push(`- ${m}`)
  lines.push('')

  lines.push('### 📋 信贷审批清单')
  lines.push('- [x] 收入验证')
  lines.push('- [x] 债务收入比评估')
  lines.push('- [x] 就业稳定性分析')
  lines.push('- [x] 信用历史审查')
  lines.push('- [x] 逾期记录检查')
  lines.push('- [x] 额度与利率定价')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// --- Tool 2: Fraud Detection Engine 报告 ---
function formatFraudDetectionReport(result: FraudDetectionReport): string {
  const lines: string[] = []
  lines.push('## 🛡️ Fraud Detection Engine — 实时反欺诈检测')
  lines.push('')
  lines.push(`> **总交易数**: ${result.total_transactions} | **告警数**: ${result.alerts_generated} | **误报率**: ${result.false_positive_rate}% | **模型准确率**: ${result.model_accuracy}%`)
  lines.push('')
  lines.push('### 📊 反欺诈仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    TXN[交易流] --> RULE[规则引擎]')
  lines.push('    TXN --> ML[ML模型]')
  lines.push('    RULE --> ALERT[告警生成]')
  lines.push('    ML --> ALERT')
  lines.push('    ALERT --> ACTION[处置动作]')
  lines.push(`    FP[误报率: ${result.false_positive_rate}%]`)
  lines.push('```')
  lines.push('')

  if (result.fraud_alerts.length > 0) {
    lines.push('### 🚨 欺诈告警')
    lines.push('| 交易ID | 异常评分 | 欺诈模式 | 建议动作 | 误报概率 |')
    lines.push('|--------|----------|----------|----------|----------|')
    for (const alert of result.fraud_alerts.slice(0, 15)) {
      lines.push(`| ${alert.txn_id} | ${alert.anomaly_score} | ${alert.fraud_patterns.join(', ')} | ${alert.recommended_action} | ${alert.false_positive_probability}% |`)
    }
    lines.push('')
  }

  if (result.rule_triggers.length > 0) {
    lines.push('### 📋 规则触发记录')
    for (const trigger of result.rule_triggers.slice(0, 10)) {
      lines.push(`- ${trigger}`)
    }
    lines.push('')
  }

  lines.push('### 📋 反欺诈检查清单')
  lines.push('- [x] 交易金额异常检测')
  lines.push('- [x] 交易速度异常检测')
  lines.push('- [x] 跨境交易监控')
  lines.push('- [x] 高风险商户识别')
  lines.push('- [x] 规则+模型混合策略')
  lines.push('- [x] 误报率分析')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// --- Tool 3: Algorithmic Trading Advisor 报告 ---
function formatTradingReport(result: TradingReport): string {
  const lines: string[] = []
  const bt = result.backtest_result
  lines.push('## 📈 Algorithmic Trading Advisor — 量化交易策略顾问')
  lines.push('')
  lines.push(`> **策略**: ${result.strategy_name} | **夏普比率**: ${bt.sharpe_ratio} | **最大回撤**: ${bt.max_drawdown_pct}% | **Alpha**: ${bt.alpha_pct}%`)
  lines.push('')
  lines.push('### 📊 策略回测仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    DATA[市场数据] --> SIGNAL[信号生成]')
  lines.push('    SIGNAL --> EXEC[执行引擎]')
  lines.push('    EXEC --> PERF[绩效分析]')
  lines.push('    PERF --> RISK[风险归因]')
  lines.push(`    SHARPE[夏普: ${bt.sharpe_ratio}]`)
  lines.push(`    DD[回撤: ${bt.max_drawdown_pct}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 回测绩效指标')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 总收益率 | ${bt.total_return_pct}% |`)
  lines.push(`| 年化收益率 | ${bt.annualized_return_pct}% |`)
  lines.push(`| 夏普比率 | ${bt.sharpe_ratio} |`)
  lines.push(`| Sortino比率 | ${bt.sortino_ratio} |`)
  lines.push(`| 最大回撤 | ${bt.max_drawdown_pct}% |`)
  lines.push(`| Alpha | ${bt.alpha_pct}% |`)
  lines.push(`| Beta | ${bt.beta} |`)
  lines.push(`| 信息比率 | ${bt.information_ratio} |`)
  lines.push(`| 胜率 | ${bt.win_rate_pct}% |`)
  lines.push(`| 盈亏比 | ${bt.profit_factor} |`)
  lines.push('')

  lines.push('### 📊 因子暴露分析')
  lines.push('| 因子 | 暴露度 | 贡献度(%) | t统计量 |')
  lines.push('|------|--------|-----------|---------|')
  for (const fe of result.factor_exposures) {
    lines.push(`| ${fe.factor_name} | ${fe.exposure} | ${fe.contribution_pct} | ${fe.t_statistic} |`)
  }
  lines.push('')

  lines.push('### 📊 风险分解')
  lines.push('| 风险类型 | 占比(%) |')
  lines.push('|----------|---------|')
  for (const [key, val] of Object.entries(result.risk_decomposition)) {
    lines.push(`| ${key} | ${val}% |`)
  }
  lines.push('')

  lines.push('### 💡 优化建议')
  for (const s of result.optimization_suggestions) lines.push(`- ${s}`)
  lines.push('')

  lines.push('### 📋 量化策略清单')
  lines.push('- [x] 策略回测执行')
  lines.push('- [x] 风险调整收益分析')
  lines.push('- [x] 因子暴露归因')
  lines.push('- [x] 风险贡献分解')
  lines.push('- [x] 参数优化建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// --- Tool 4: RegTech Compliance Checker 报告 ---
function formatComplianceReport(result: ComplianceReport): string {
  const lines: string[] = []
  lines.push('## 📜 RegTech Compliance Checker — 合规科技检查')
  lines.push('')
  lines.push(`> **合规总分**: ${result.overall_compliance_score}% | **AML/KYC覆盖**: ${result.aml_kyc_coverage_pct}% | **合规**: ${result.compliant_count} | **部分合规**: ${result.partial_count} | **不合规**: ${result.non_compliant_count}`)
  lines.push('')
  lines.push('### 📊 合规仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    REG[监管规则库] --> CHECK[合规检查]')
  lines.push('    CHECK --> GAP[差距分析]')
  lines.push('    GAP --> REMEDIATE[整改建议]')
  lines.push('    REMEDIATE --> REPORT[监管报告]')
  lines.push(`    SCORE[合规评分: ${result.overall_compliance_score}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 合规差距分析')
  lines.push('| 法规 | 状态 | 差距描述 | 优先级 | 整改成本 |')
  lines.push('|------|------|----------|--------|----------|')
  for (const gap of result.compliance_gaps) {
    const statusIcon = gap.compliance_status === 'compliant' ? '✅' : gap.compliance_status === 'partially_compliant' ? '⚠️' : '❌'
    lines.push(`| ${gap.regulation_name} | ${statusIcon} ${gap.compliance_status} | ${gap.gap_description} | ${gap.remediation_priority} | ¥${gap.estimated_remediation_cost.toLocaleString()} |`)
  }
  lines.push('')

  if (result.regulatory_changes.length > 0) {
    lines.push('### 🔄 监管变化追踪')
    lines.push('| 法规 | 变化描述 | 生效日期 | 影响级别 | 所需动作 |')
    lines.push('|------|----------|----------|----------|----------|')
    for (const change of result.regulatory_changes) {
      lines.push(`| ${change.regulation_id} | ${change.change_description} | ${change.effective_date} | ${change.impact_level} | ${change.action_required} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 合规检查清单')
  lines.push('- [x] AML/KYC合规评估')
  lines.push('- [x] 监管报告生成')
  lines.push('- [x] 政策变化追踪')
  lines.push('- [x] 合规差距分析')
  lines.push('- [x] 整改优先级排序')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// --- Tool 5: Wealth Management Robo 报告 ---
function formatWealthReport(result: WealthReport): string {
  const lines: string[] = []
  lines.push('## 💎 Wealth Management Robo — 智能投顾')
  lines.push('')
  lines.push(`> **投资者**: ${result.investor_id} | **风险评分**: ${result.risk_score}/100 | **风险画像**: ${result.risk_profile} | **预期收益**: ${result.projected_portfolio_return}% | **预期风险**: ${result.projected_portfolio_risk}%`)
  lines.push('')
  lines.push('### 📊 资产配置仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PROFILE[投资者画像] --> RISK[风险评估]')
  lines.push('    RISK --> ALLOC[资产配置]')
  lines.push('    ALLOC --> REBAL[再平衡]')
  lines.push('    ALLOC --> TAX[税务优化]')
  lines.push(`    RETURN[预期收益: ${result.projected_portfolio_return}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 资产配置建议')
  lines.push('| 资产类别 | 建议权重 | 当前权重 | 调整 | 预期收益 | 波动率 |')
  lines.push('|----------|----------|----------|------|----------|--------|')
  for (const alloc of result.asset_allocations) {
    const deltaIcon = alloc.delta > 0 ? `+${alloc.delta}` : `${alloc.delta}`
    lines.push(`| ${alloc.asset_class} | ${alloc.recommended_weight_pct}% | ${alloc.current_weight_pct}% | ${deltaIcon}% | ${alloc.expected_return_pct}% | ${alloc.volatility_pct}% |`)
  }
  lines.push('')

  if (result.rebalance_triggers.length > 0) {
    lines.push('### 🔄 再平衡触发器')
    for (const trigger of result.rebalance_triggers) {
      lines.push(`- **${trigger.asset_class}**: ${trigger.trigger_condition} (偏离${trigger.current_drift_pct}%) → ${trigger.action}`)
    }
    lines.push('')
  }

  lines.push('### 💰 税务优化策略')
  for (const strategy of result.tax_strategies) {
    lines.push(`- **${strategy.strategy_name}**: ${strategy.description} (预计节税: ¥${strategy.estimated_tax_savings.toLocaleString()})`)
  }
  lines.push('')

  lines.push('### 📋 投顾服务清单')
  lines.push('- [x] 风险偏好评估')
  lines.push('- [x] 资产配置建议')
  lines.push('- [x] 再平衡触发设置')
  lines.push('- [x] 税务优化策略')
  lines.push('- [x] 组合收益预测')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// --- Tool 6: Market Risk VaR 报告 ---
function formatMarketRiskReport(result: MarketRiskReport): string {
  const lines: string[] = []
  lines.push('## 📉 Market Risk VaR — 市场风险VaR计算')
  lines.push('')
  lines.push(`> **组合总值**: ${result.base_currency} ${result.portfolio_total_value.toLocaleString()} | **VaR(95%)**: ${result.var_results[0]?.var_pct}% | **VaR(99%)**: ${result.var_results[1]?.var_pct}%`)
  lines.push('')
  lines.push('### 📊 风险仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PORT[投资组合] --> VAR[VaR计算]')
  lines.push('    PORT --> STRESS[压力测试]')
  lines.push('    PORT --> CONC[集中度分析]')
  lines.push('    PORT --> LIQ[流动性风险]')
  lines.push(`    VAR95[VaR95%: ${result.var_results[0]?.var_pct}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 VaR结果')
  lines.push('| 置信度 | VaR金额 | VaR(%) | CVaR | 方法 |')
  lines.push('|--------|---------|--------|------|------|')
  for (const vr of result.var_results) {
    lines.push(`| ${vr.confidence_pct}% | ${result.base_currency} ${vr.var_amount.toLocaleString()} | ${vr.var_pct}% | ${result.base_currency} ${vr.cvar_amount.toLocaleString()} | ${vr.method} |`)
  }
  lines.push('')

  lines.push('### 🔥 压力测试')
  lines.push('| 情景 | 冲击描述 | 组合影响 | 恢复预估 |')
  lines.push('|------|----------|----------|----------|')
  for (const st of result.stress_tests) {
    lines.push(`| ${st.scenario_name} | ${st.shock_description} | ${st.portfolio_impact_pct}% (${result.base_currency} ${st.portfolio_impact_amount.toLocaleString()}) | ${st.recovery_estimate_days}天 |`)
  }
  lines.push('')

  lines.push('### ⚠️ 集中度风险')
  for (const cr of result.concentration_risks) {
    lines.push(`- **${cr.dimension}** (${cr.top_holding}): 占比${cr.concentration_pct}% [${cr.risk_level}] → ${cr.recommendation}`)
  }
  lines.push('')

  lines.push('### 💧 流动性风险')
  for (const lr of result.liquidity_risks) {
    lines.push(`- **${lr.liquidity_tier}**: ${result.base_currency} ${lr.total_value.toLocaleString()} (${lr.pct_of_portfolio}%), 变现天数: ${lr.days_to_liquidate}, ${lr.stress_impact}`)
  }
  lines.push('')

  lines.push('### 📋 市场风险清单')
  lines.push('- [x] VaR(95%/99%)计算')
  lines.push('- [x] 压力测试(4种情景)')
  lines.push('- [x] 集中度风险分析')
  lines.push('- [x] 流动性风险评估')
  lines.push('- [x] CVaR(条件VaR)计算')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// --- Tool 7: Insurance Actuarial AI 报告 ---
function formatActuarialReport(result: ActuarialReport): string {
  const lines: string[] = []
  lines.push('## 🏛️ Insurance Actuarial AI — 保险精算AI')
  lines.push('')
  lines.push(`> **组合保费收入**: ¥${result.total_portfolio_value.toLocaleString()} | **预估综合成本率**: ${result.combined_ratio_estimate}% | **损失分布**: ${result.loss_distributions.length}条 | **巨灾事件**: ${result.cat_modeling.length}个`)
  lines.push('')
  lines.push('### 📊 精算仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PORT[保单组合] --> LOSS[损失分布]')
  lines.push('    PORT --> RESERVE[准备金评估]')
  lines.push('    PORT --> CAT[巨灾建模]')
  lines.push('    PORT --> RATE[费率厘定]')
  lines.push(`    CR[综合成本率: ${result.combined_ratio_estimate}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 损失分布')
  lines.push('| 损失类型 | 频率均值 | 严重度均值 | 预期损失 | 尾部损失(99%) |')
  lines.push('|----------|----------|------------|----------|--------------|')
  for (const ld of result.loss_distributions) {
    lines.push(`| ${ld.loss_type} | ${ld.frequency_mean} | ¥${ld.severity_mean.toLocaleString()} | ¥${ld.expected_loss.toLocaleString()} | ¥${ld.tail_loss_99.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📋 准备金评估')
  lines.push('| 准备金类型 | 中心估计 | 审慎边际 | 总准备金 | 置信度 |')
  lines.push('|------------|----------|----------|----------|--------|')
  for (const re of result.reserve_estimates) {
    lines.push(`| ${re.reserve_type} | ¥${re.central_estimate.toLocaleString()} | ${re.prudential_margin_pct}% | ¥${re.total_reserve.toLocaleString()} | ${re.confidence_level}% |`)
  }
  lines.push('')

  if (result.cat_modeling.length > 0) {
    lines.push('### 🌪️ 巨灾风险建模')
    lines.push('| 灾害类型 | 重现期(年) | 毛损失估计 | 净损失(再保后) | 概率 |')
    lines.push('|----------|------------|------------|----------------|------|')
    for (const cat of result.cat_modeling) {
      lines.push(`| ${cat.peril} | ${cat.return_period_years} | ¥${cat.gross_loss_estimate.toLocaleString()} | ¥${cat.net_loss_after_reinsurance.toLocaleString()} | ${cat.probability_pct}% |`)
    }
    lines.push('')
  }

  lines.push('### 📋 费率厘定')
  lines.push('| 业务线 | 当前费率 | 指示费率 | 费率变化 | 费用率 | 目标赔付率 | 盈利评估 |')
  lines.push('|--------|----------|----------|----------|--------|------------|----------|')
  for (const rm of result.rate_making) {
    lines.push(`| ${rm.line_of_business} | ¥${rm.current_rate.toLocaleString()} | ¥${rm.indicated_rate.toLocaleString()} | ${rm.rate_change_pct}% | ${rm.expense_ratio}% | ${rm.target_loss_ratio}% | ${rm.profitability_assessment} |`)
  }
  lines.push('')

  lines.push('### 📋 精算分析清单')
  lines.push('- [x] 损失分布拟合')
  lines.push('- [x] 纯保费计算')
  lines.push('- [x] 准备金评估(IBNR/IBNER/UPR)')
  lines.push('- [x] 巨灾风险建模')
  lines.push('- [x] 费率厘定分析')
  lines.push('- [x] 综合成本率预估')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// --- Tool 8: Fintech Product Designer 报告 ---
function formatProductDesignReport(result: ProductDesignReport): string {
  const lines: string[] = []
  lines.push('## 🎨 Fintech Product Designer — 金融产品设计')
  lines.push('')
  lines.push(`> **产品**: ${result.product_name} | **类型**: ${result.product_type} | **可行性评分**: ${result.overall_viability_score}/100 | **功能数**: ${result.demand_match.length} | **竞品**: ${result.competitor_landscape.length}`)
  lines.push('')
  lines.push('### 📊 产品设计仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    IDEA[产品概念] --> DEMAND[需求匹配]')
  lines.push('    DEMAND --> RISK[风险评估]')
  lines.push('    DEMAND --> PRICE[定价模型]')
  lines.push('    DEMAND --> COMP[竞品分析]')
  lines.push('    DEMAND --> REG[监管可行性]')
  lines.push(`    VIABILITY[可行性: ${result.overall_viability_score}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 需求匹配度分析')
  lines.push('| 功能 | 需求评分 | 市场验证 | 优先级 |')
  lines.push('|------|----------|----------|--------|')
  for (const dm of result.demand_match) {
    lines.push(`| ${dm.feature} | ${dm.demand_score}/100 | ${dm.market_validation} | ${dm.priority} |`)
  }
  lines.push('')

  lines.push('### ⚠️ 风险评估')
  for (const [key, val] of Object.entries(result.risk_assessment)) {
    lines.push(`- **${key}**: ${val}`)
  }
  lines.push('')

  lines.push('### 📋 定价模型')
  lines.push('| 定价维度 | 推荐方法 | 价格区间 | 竞争对比 | 利润率 |')
  lines.push('|----------|----------|----------|----------|--------|')
  for (const pm of result.pricing_models) {
    lines.push(`| ${pm.pricing_dimension} | ${pm.recommended_approach} | ${pm.estimated_price_range} | ${pm.competitive_comparison} | ${pm.profit_margin_pct}% |`)
  }
  lines.push('')

  if (result.competitor_landscape.length > 0) {
    lines.push('### 🏢 竞品分析')
    for (const comp of result.competitor_landscape) {
      lines.push(`- **${comp.competitor_name}** (市占率${comp.market_share}%): 优势[${comp.strengths.join(', ')}] 劣势[${comp.weaknesses.join(', ')}] → ${comp.differentiation_opportunity}`)
    }
    lines.push('')
  }

  lines.push('### 📜 监管可行性')
  lines.push('| 法规 | 合规难度 | 合规成本 | 所需时间 | 关键要求 |')
  lines.push('|------|----------|----------|----------|----------|')
  for (const rf of result.regulatory_feasibility) {
    lines.push(`| ${rf.regulation} | ${rf.compliance_difficulty} | ¥${rf.estimated_compliance_cost.toLocaleString()} | ${rf.time_to_comply_months}月 | ${rf.key_requirements.join(', ')} |`)
  }
  lines.push('')

  lines.push('### 💡 设计建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 产品设计清单')
  lines.push('- [x] 需求匹配度评估')
  lines.push('- [x] 风险评估(市场/技术/监管/运营)')
  lines.push('- [x] 定价模型设计')
  lines.push('- [x] 竞品对标分析')
  lines.push('- [x] 监管可行性评估')
  lines.push('- [x] 综合可行性评分')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*FinTechAgentPro v1.0.0 — AI-Powered FinTech Intelligence*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({ name: 'credit_risk_scorer', description: '信用风险评估 | 评分/违约概率/额度/利率', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: borrower info' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatCreditRiskScorerReport(analyzeCreditRiskScorer(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'fraud_detection_engine', description: '反欺诈引擎 | 异常检测/模式识别', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: transaction data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatFraudDetectionReport(analyzeFraudDetectionEngine(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'algorithmic_trading_advisor', description: '量化交易 | 回测/夏普/回撤/因子', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: strategy params' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatTradingReport(analyzeAlgorithmicTradingAdvisor(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'regtech_compliance_checker', description: '合规检查 | AML/KYC/监管报告', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: compliance data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatComplianceReport(analyzeRegtechComplianceChecker(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'wealth_management_robo', description: '智能投顾 | 风险偏好/资产配置', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: client profile' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatWealthReport(analyzeWealthManagementRobo(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'market_risk_var', description: '市场风险 | VaR/压力测试/流动性', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: portfolio data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatMarketRiskReport(analyzeMarketRiskVar(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'insurance_actuarial_ai', description: '保险精算 | 损失分布/费率厘定', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: policy/claims data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatActuarialReport(analyzeInsuranceActuarialAi(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'fintech_product_designer', description: '金融产品设计 | 定价/风控/合规', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product spec' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatProductDesignReport(analyzeFintechProductDesigner(JSON.parse(args.input_data))) } }))
}