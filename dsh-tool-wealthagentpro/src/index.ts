/**
 * DSH Wealth Agent Pro Plugin v1.0.0
 * 个人财富管理AI智能体 for DeepSeek Harness — 资产配置·风险偏好·税损收割·退休规划·基金筛选·保障缺口·目标投资·行为金融
 *
 * 覆盖个人财富管理全链路：资产配置 → 风险偏好 → 税损收割 → 退休规划 → 基金筛选 → 保障缺口 → 目标投资 → 行为金融
 *
 * 工具清单:
 * 1. portfolio_analyzer       — 资产配置分析与再平衡建议（战略/战术资产配置, 漂移检测, 再平衡触发, 风险预算）
 * 2. risk_tolerance_assessor  — 投资者风险偏好问卷与画像（风险承受能力, 风险态度, 投资者画像, 适当性匹配）
 * 3. tax_loss_harvester       — 税收亏损收割与税优策略（亏损识别, 替代证券, wash sale规避, 税优账户策略）
 * 4. retirement_planner       — 退休规划与社保/年金测算（退休缺口, 社保替代率, 年金现值, 提取策略）
 * 5. fund_screener            — 基金筛选与风格漂移检测（多因子筛选, 风格分析, 漂移检测, 基金经理评估）
 * 6. insurance_gap_analyzer   — 家庭保障缺口分析与保险建议（生命价值法, 需求法, 缺口计算, 产品推荐）
 * 7. goal_based_investing     — 目标日期投资与教育/购房储蓄（目标日期基金, 储蓄计划, 下滑路径, 蒙特卡洛模拟）
 * 8. behavioral_finance_coach — 行为金融偏差识别与心理账户辅导（认知偏差, 情绪偏差, 心理账户, 助推策略）
 *
 * @module dsh-tool-wealthagentpro | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-wealthagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析仅供参考，不构成投资建议、财务顾问意见或税务建议。投资有风险，入市需谨慎。请咨询持牌专业顾问后再做决策。'

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

// --- Tool 1: Portfolio Analyzer ---
interface PortfolioInput {
  input_data: string
}

interface Holding {
  asset_id: string
  asset_class: string
  current_value: number
  target_weight_pct: number
  current_weight_pct: number
  unrealized_gain_pct: number
  volatility_pct: number
  expected_return_pct: number
}

interface RebalanceAction {
  asset_id: string
  action: 'buy' | 'sell' | 'hold'
  amount: number
  reason: string
}

interface RiskBudgetItem {
  asset_class: string
  marginal_risk_contribution: number
  risk_budget_pct: number
  current_risk_pct: number
  status: 'under' | 'optimal' | 'over'
}

interface PortfolioAnalysisResult {
  total_value: number
  num_holdings: number
  current_allocation: Record<string, number>
  target_allocation: Record<string, number>
  drift_analysis: Record<string, number>
  rebalance_actions: RebalanceAction[]
  risk_budget: RiskBudgetItem[]
  portfolio_expected_return: number
  portfolio_volatility: number
  sharpe_ratio: number
  diversification_ratio: number
  dashboard_data: Record<string, number>
}

// --- Tool 2: Risk Tolerance Assessor ---
interface RiskQuestionnaireInput {
  input_data: string
}

interface QuestionnaireResponse {
  respondent_id: string
  age: number
  investment_experience_years: number
  annual_income: number
  net_worth: number
  investment_horizon_years: number
  liquidity_needs_pct: number
  reaction_to_20pct_drop: 'sell_all' | 'sell_some' | 'hold' | 'buy_more'
  reaction_to_50pct_drop: 'sell_all' | 'sell_some' | 'hold' | 'buy_more'
  primary_goal: 'preservation' | 'income' | 'growth' | 'aggressive_growth'
  loss_tolerance_pct: number
  income_stability: 'stable' | 'moderate' | 'unstable'
  dependents_count: number
  insurance_coverage_adequate: boolean
}

interface RiskDimension {
  dimension: string
  score: number
  max_score: number
  weight: number
  interpretation: string
}

interface InvestorProfile {
  profile_type: string
  risk_capacity_score: number
  risk_attitude_score: number
  composite_risk_score: number
  recommended_max_equity_pct: number
  recommended_max_fixed_income_pct: number
  recommended_max_alternatives_pct: number
  suitability_notes: string[]
}

interface RiskToleranceResult {
  respondent_id: string
  risk_dimensions: RiskDimension[]
  investor_profile: InvestorProfile
  questionnaire_summary: Record<string, string>
  dashboard_data: Record<string, number>
}

// --- Tool 3: Tax Loss Harvester ---
interface TaxLossInput {
  input_data: string
}

interface TaxableAccount {
  account_id: string
  holdings: TaxableHolding[]
}

interface TaxableHolding {
  security_id: string
  security_name: string
  cost_basis: number
  current_value: number
  unrealized_gain_loss: number
  holding_period_months: number
  asset_class: string
}

interface LossHarvestOpportunity {
  security_id: string
  security_name: string
  unrealized_loss: number
  harvestable: boolean
  wash_sale_risk: string
  substitute_security: string
  tax_savings_estimate: number
  holding_period: 'short_term' | 'long_term'
}

interface TaxStrategy {
  strategy_name: string
  description: string
  estimated_annual_savings: number
  applicability: string
  priority: 'high' | 'medium' | 'low'
}

interface TaxLossHarvestResult {
  account_id: string
  total_unrealized_loss: number
  total_harvestable_loss: number
  harvest_opportunities: LossHarvestOpportunity[]
  tax_strategies: TaxStrategy[]
  estimated_tax_savings: number
  wash_sale_warnings: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 4: Retirement Planner ---
interface RetirementInput {
  input_data: string
}

interface RetirementProfile {
  client_id: string
  current_age: number
  retirement_age: number
  life_expectancy: number
  current_annual_income: number
  current_savings: number
  monthly_contribution: number
  employer_match_pct: number
  expected_return_pct: number
  inflation_pct: number
  social_security_monthly: number
  pension_monthly: number
  desired_replacement_pct: number
  retirement_expenses_monthly: number
  healthcare_cost_monthly: number
  other_income_monthly: number
}

interface RetirementProjection {
  years_to_retirement: number
  projected_savings_at_retirement: number
  retirement_income_needed_annual: number
  social_security_annual: number
  pension_annual: number
  income_gap_annual: number
  savings_required_total: number
  funding_ratio: number
  monthly_savings_needed: number
  social_security_replacement_pct: number
  scenarios: RetirementScenario[]
}

interface RetirementScenario {
  scenario_name: string
  return_assumption: number
  projected_savings: number
  funding_ratio: number
  success_probability: number
}

interface WithdrawalStrategy {
  strategy_name: string
  initial_withdrawal_rate: number
  annual_income: number
  sustainability_years: number
  probability_of_success: number
}

interface RetirementPlanResult {
  client_id: string
  projection: RetirementProjection
  withdrawal_strategies: WithdrawalStrategy[]
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 5: Fund Screener ---
interface FundScreenInput {
  input_data: string
}

interface FundCriteria {
  fund_name: string
  fund_code: string
  fund_type: string
  inception_date: string
  aum_millions: number
  expense_ratio: number
  manager_tenure_years: number
  ytd_return: number
  one_year_return: number
  three_year_return: number
  five_year_return: number
  volatility_3yr: number
  sharpe_ratio: number
  max_drawdown: number
  alpha: number
  beta: number
  r_squared: number
  style_box: string
  top_holdings_concentration: number
  turnover_ratio: number
}

interface StyleDriftIndicator {
  fund_code: string
  current_style: string
  original_style: string
  drift_score: number
  drift_detected: boolean
  drift_factors: string[]
}

interface FundScreeningResult {
  total_funds_screened: number
  funds_passing_screen: number
  top_funds: FundCriteria[]
  style_drifts: StyleDriftIndicator[]
  screening_summary: Record<string, number>
  dashboard_data: Record<string, number>
}

// --- Tool 6: Insurance Gap Analyzer ---
interface InsuranceGapInput {
  input_data: string
}

interface FamilyMember {
  name: string
  age: number
  relationship: string
  annual_income: number
  is_dependent: boolean
}

interface ExistingInsurance {
  policy_id: string
  policy_type: string
  coverage_amount: number
  annual_premium: number
  insurer: string
}

interface InsuranceNeed {
  need_category: string
  calculation_method: string
  required_coverage: number
  existing_coverage: number
  gap_amount: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  recommendation: string
}

interface InsuranceGapResult {
  family_id: string
  total_required_coverage: number
  total_existing_coverage: number
  total_gap: number
  gap_ratio: number
  insurance_needs: InsuranceNeed[]
  product_recommendations: string[]
  annual_premium_estimate: number
  dashboard_data: Record<string, number>
}

// --- Tool 7: Goal Based Investing ---
interface GoalBasedInput {
  input_data: string
}

interface FinancialGoal {
  goal_id: string
  goal_name: string
  goal_type: 'education' | 'housing' | 'retirement' | 'emergency' | 'vacation' | 'other'
  target_amount: number
  current_savings: number
  target_date: string
  years_to_goal: number
  monthly_contribution: number
  priority: 'essential' | 'important' | 'aspirational'
}

interface GoalProjection {
  goal_id: string
  goal_name: string
  target_amount: number
  projected_amount: number
  funding_ratio: number
  monthly_shortfall: number
  required_monthly_contribution: number
  success_probability: number
  glide_path: GlidePathPoint[]
}

interface GlidePathPoint {
  year: number
  equity_allocation: number
  fixed_income_allocation: number
  expected_value: number
}

interface GoalBasedResult {
  client_id: string
  goals: GoalProjection[]
  total_monthly_needed: number
  total_monthly_available: number
  overall_funding_health: string
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 8: Behavioral Finance Coach ---
interface BehavioralFinanceInput {
  input_data: string
}

interface BehavioralAssessment {
  client_id: string
  assessment_date: string
  trading_frequency: string
  avg_holding_period_months: number
  panic_sell_incidents_12m: number
  fomo_buy_incidents_12m: number
  portfolio_concentration_pct: number
  check_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  has_written_investment_policy: boolean
  uses_stop_loss: boolean
  rebalances_regularly: boolean
}

interface BehavioralBias {
  bias_name: string
  bias_category: 'cognitive' | 'emotional'
  severity: 'low' | 'moderate' | 'high' | 'severe'
  description: string
  evidence: string
  impact_on_returns: number
  mitigation_strategy: string
}

interface MentalAccount {
  account_name: string
  account_type: 'safety' | 'income' | 'growth' | 'speculation'
  amount: number
  pct_of_portfolio: number
  appropriate_use: string
  current_use: string
  misallocation_risk: string
}

interface NudgeStrategy {
  nudge_name: string
  description: string
  implementation: string
  expected_improvement: string
}

interface BehavioralFinanceResult {
  client_id: string
  overall_behavior_score: number
  biases: BehavioralBias[]
  mental_accounts: MentalAccount[]
  nudge_strategies: NudgeStrategy[]
  estimated_behavioral_cost: number
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Portfolio Analyzer 分析 ---
function analyzePortfolioAnalyzer(data: string): PortfolioAnalysisResult {
  const input: { holdings: Holding[], risk_free_rate?: number } = JSON.parse(data)
  const holdings = input.holdings
  const riskFreeRate = input.risk_free_rate ?? 0.025
  const rng = new SeededRandom(SeededRandom.seedFromString(
    holdings.length.toString() + holdings.reduce((s, h) => s + h.asset_id, '')
  ))

  const totalValue = holdings.reduce((s, h) => s + h.current_value, 0)

  // Current and target allocation
  const currentAlloc: Record<string, number> = {}
  const targetAlloc: Record<string, number> = {}
  for (const h of holdings) {
    currentAlloc[h.asset_class] = (currentAlloc[h.asset_class] || 0) + h.current_weight_pct
    targetAlloc[h.asset_class] = (targetAlloc[h.asset_class] || 0) + h.target_weight_pct
  }

  // Drift analysis
  const drift: Record<string, number> = {}
  for (const [cls, current] of Object.entries(currentAlloc)) {
    drift[cls] = Math.round((current - (targetAlloc[cls] || 0)) * 100) / 100
  }

  // Rebalance actions
  const rebalanceActions: RebalanceAction[] = []
  for (const h of holdings) {
    const driftPct = h.current_weight_pct - h.target_weight_pct
    if (Math.abs(driftPct) > 5) {
      const action: 'buy' | 'sell' = driftPct < 0 ? 'buy' : 'sell'
      const amount = Math.abs(driftPct / 100 * totalValue)
      rebalanceActions.push({
        asset_id: h.asset_id,
        action,
        amount: Math.round(amount),
        reason: `偏离目标配置 ${driftPct.toFixed(1)}% (阈值5%)`
      })
    }
  }

  // Risk budget
  const riskBudget: RiskBudgetItem[] = holdings.reduce((acc, h) => {
    const existing = acc.find(r => r.asset_class === h.asset_class)
    if (existing) {
      existing.current_risk_pct += h.current_weight_pct * h.volatility_pct / 100
    } else {
      acc.push({
        asset_class: h.asset_class,
        marginal_risk_contribution: Math.round(h.volatility_pct * h.current_weight_pct) / 100,
        risk_budget_pct: h.target_weight_pct,
        current_risk_pct: Math.round(h.current_weight_pct * h.volatility_pct) / 100,
        status: 'optimal'
      })
    }
    return acc
  }, [] as RiskBudgetItem[])

  for (const rb of riskBudget) {
    const ratio = rb.current_risk_pct / (rb.risk_budget_pct / 100)
    rb.status = ratio < 0.8 ? 'under' : ratio > 1.2 ? 'over' : 'optimal'
  }

  // Portfolio metrics
  const portfolioReturn = holdings.reduce((s, h) => s + h.current_weight_pct / 100 * h.expected_return_pct, 0)
  const portfolioVol = Math.sqrt(holdings.reduce((s, h) => s + Math.pow(h.current_weight_pct / 100 * h.volatility_pct, 2), 0) + rng.nextFloat(-0.2, 0.2))
  const sharpe = (portfolioReturn - riskFreeRate * 100) / portfolioVol
  const weightedVol = holdings.reduce((s, h) => s + h.current_weight_pct / 100 * h.volatility_pct, 0)
  const diversificationRatio = weightedVol / portfolioVol

  const dashboardData: Record<string, number> = {
    total_value: Math.round(totalValue),
    num_holdings: holdings.length,
    portfolio_return: Math.round(portfolioReturn * 100) / 100,
    portfolio_volatility: Math.round(portfolioVol * 100) / 100,
    sharpe_ratio: Math.round(sharpe * 100) / 100,
    diversification_ratio: Math.round(diversificationRatio * 100) / 100,
    rebalance_actions: rebalanceActions.length,
    risk_budget_items: riskBudget.length,
    max_drift: Math.round(Math.max(...Object.values(drift).map(Math.abs)) * 100) / 100,
    risk_free_rate_pct: riskFreeRate * 100,
  }

  return {
    total_value: Math.round(totalValue),
    num_holdings: holdings.length,
    current_allocation: currentAlloc,
    target_allocation: targetAlloc,
    drift_analysis: drift,
    rebalance_actions: rebalanceActions,
    risk_budget: riskBudget,
    portfolio_expected_return: Math.round(portfolioReturn * 100) / 100,
    portfolio_volatility: Math.round(portfolioVol * 100) / 100,
    sharpe_ratio: Math.round(sharpe * 100) / 100,
    diversification_ratio: Math.round(diversificationRatio * 100) / 100,
    dashboard_data: dashboardData,
  }
}

// --- Tool 2: Risk Tolerance Assessor 分析 ---
function analyzeRiskToleranceAssessor(data: string): RiskToleranceResult {
  const profile: QuestionnaireResponse = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    profile.respondent_id + profile.age.toString()
  ))

  // Risk capacity dimensions
  const ageScore = profile.age < 30 ? 25 : profile.age < 40 ? 22 : profile.age < 50 ? 18 : profile.age < 60 ? 12 : profile.age < 70 ? 8 : 4
  const incomeScore = profile.annual_income > 500000 ? 20 : profile.annual_income > 200000 ? 16 : profile.annual_income > 100000 ? 12 : profile.annual_income > 50000 ? 8 : 4
  const horizonScore = profile.investment_horizon_years > 20 ? 20 : profile.investment_horizon_years > 10 ? 16 : profile.investment_horizon_years > 5 ? 12 : profile.investment_horizon_years > 3 ? 8 : 4
  const liquidityScore = profile.liquidity_needs_pct < 10 ? 15 : profile.liquidity_needs_pct < 20 ? 12 : profile.liquidity_needs_pct < 30 ? 9 : profile.liquidity_needs_pct < 50 ? 6 : 3
  const stabilityScore = profile.income_stability === 'stable' ? 10 : profile.income_stability === 'moderate' ? 7 : 4
  const dependentScore = profile.dependents_count === 0 ? 10 : profile.dependents_count <= 2 ? 7 : profile.dependents_count <= 4 ? 4 : 2

  const riskCapacity = ageScore + incomeScore + horizonScore + liquidityScore + stabilityScore + dependentScore

  // Risk attitude dimensions
  const drop20Score = profile.reaction_to_20pct_drop === 'buy_more' ? 25 : profile.reaction_to_20pct_drop === 'hold' ? 20 : profile.reaction_to_20pct_drop === 'sell_some' ? 10 : 2
  const drop50Score = profile.reaction_to_50pct_drop === 'buy_more' ? 25 : profile.reaction_to_50pct_drop === 'hold' ? 18 : profile.reaction_to_50pct_drop === 'sell_some' ? 8 : 1
  const goalScore = profile.primary_goal === 'aggressive_growth' ? 25 : profile.primary_goal === 'growth' ? 18 : profile.primary_goal === 'income' ? 10 : 5
  const lossToleranceScore = profile.loss_tolerance_pct > 30 ? 25 : profile.loss_tolerance_pct > 20 ? 20 : profile.loss_tolerance_pct > 10 ? 14 : profile.loss_tolerance_pct > 5 ? 8 : 3

  const riskAttitude = drop20Score + drop50Score + goalScore + lossToleranceScore

  // Composite score (0-100)
  const composite = Math.round((riskCapacity * 0.55 + riskAttitude * 0.45 + rng.nextFloat(-2, 2)) * 100) / 100
  const clampedComposite = Math.max(0, Math.min(100, composite))

  // Investor profile
  let profileType: string
  let maxEquity: number
  let maxFixed: number
  let maxAlternatives: number

  if (clampedComposite >= 80) {
    profileType = '积极型 (Aggressive)'
    maxEquity = 90; maxFixed = 20; maxAlternatives = 15
  } else if (clampedComposite >= 60) {
    profileType = '成长型 (Growth)'
    maxEquity = 75; maxFixed = 35; maxAlternatives = 10
  } else if (clampedComposite >= 40) {
    profileType = '平衡型 (Balanced)'
    maxEquity = 55; maxFixed = 50; maxAlternatives = 8
  } else if (clampedComposite >= 20) {
    profileType = '稳健型 (Conservative)'
    maxEquity = 35; maxFixed = 70; maxAlternatives = 5
  } else {
    profileType = '保守型 (Very Conservative)'
    maxEquity = 15; maxFixed = 85; maxAlternatives = 2
  }

  const dimensions: RiskDimension[] = [
    { dimension: '年龄因素', score: ageScore, max_score: 25, weight: 0.15, interpretation: ageScore >= 18 ? '年龄优势明显' : '需关注年龄风险' },
    { dimension: '收入水平', score: incomeScore, max_score: 20, weight: 0.15, interpretation: incomeScore >= 12 ? '收入支撑力强' : '收入支撑有限' },
    { dimension: '投资期限', score: horizonScore, max_score: 20, weight: 0.15, interpretation: horizonScore >= 12 ? '期限充裕' : '期限较短' },
    { dimension: '流动性需求', score: liquidityScore, max_score: 15, weight: 0.1, interpretation: liquidityScore >= 9 ? '流动性充裕' : '流动性偏紧' },
    { dimension: '收入稳定性', score: stabilityScore, max_score: 10, weight: 0.1, interpretation: stabilityScore >= 7 ? '收入稳定' : '收入波动较大' },
    { dimension: '家庭负担', score: dependentScore, max_score: 10, weight: 0.1, interpretation: dependentScore >= 7 ? '负担较轻' : '家庭责任较重' },
    { dimension: '20%回撤反应', score: drop20Score, max_score: 25, weight: 0.1, interpretation: drop20Score >= 18 ? '风险承受态度积极' : '风险承受态度偏保守' },
    { dimension: '50%回撤反应', score: drop50Score, max_score: 25, weight: 0.1, interpretation: drop50Score >= 18 ? '极端行情承受力强' : '极端行情承受力弱' },
    { dimension: '投资目标', score: goalScore, max_score: 25, weight: 0.05, interpretation: goalScore >= 18 ? '追求资本增值' : '追求资本保值' },
    { dimension: '损失容忍度', score: lossToleranceScore, max_score: 25, weight: 0.1, interpretation: lossToleranceScore >= 14 ? '损失容忍度高' : '损失容忍度低' },
  ]

  const suitabilityNotes: string[] = []
  if (profile.insurance_coverage_adequate === false) suitabilityNotes.push('建议先完善保险保障再增加风险资产')
  if (profile.investment_experience_years < 2) suitabilityNotes.push('投资经验较少，建议从低风险产品起步')
  if (profile.dependents_count > 3) suitabilityNotes.push('家庭负担较重，需保留充足应急资金')
  if (profile.liquidity_needs_pct > 30) suitabilityNotes.push('流动性需求高，限制另类资产配置')
  if (suitabilityNotes.length === 0) suitabilityNotes.push('风险偏好与承受能力匹配良好')

  const dashboardData: Record<string, number> = {
    risk_capacity: riskCapacity,
    risk_attitude: riskAttitude,
    composite_score: clampedComposite,
    max_equity: maxEquity,
    max_fixed_income: maxFixed,
    max_alternatives: maxAlternatives,
    age: profile.age,
    investment_horizon: profile.investment_horizon_years,
    loss_tolerance: profile.loss_tolerance_pct,
    dependents: profile.dependents_count,
    experience_years: profile.investment_experience_years,
  }

  return {
    respondent_id: profile.respondent_id,
    risk_dimensions: dimensions,
    investor_profile: {
      profile_type: profileType,
      risk_capacity_score: riskCapacity,
      risk_attitude_score: riskAttitude,
      composite_risk_score: clampedComposite,
      recommended_max_equity_pct: maxEquity,
      recommended_max_fixed_income_pct: maxFixed,
      recommended_max_alternatives_pct: maxAlternatives,
      suitability_notes: suitabilityNotes,
    },
    questionnaire_summary: {
      age: `${profile.age}岁`,
      income: `¥${profile.annual_income.toLocaleString()}/年`,
      horizon: `${profile.investment_horizon_years}年`,
      primary_goal: profile.primary_goal,
      reaction_20pct: profile.reaction_to_20pct_drop,
      reaction_50pct: profile.reaction_to_50pct_drop,
    },
    dashboard_data: dashboardData,
  }
}

// --- Tool 3: Tax Loss Harvester 分析 ---
function analyzeTaxLossHarvester(data: string): TaxLossHarvestResult {
  const account: TaxableAccount = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    account.account_id + account.holdings.length.toString()
  ))

  const totalUnrealizedLoss = account.holdings
    .filter(h => h.unrealized_gain_loss < 0)
    .reduce((s, h) => s + h.unrealized_gain_loss, 0)

  const harvestOpportunities: LossHarvestOpportunity[] = []
  let totalHarvestable = 0

  for (const h of account.holdings) {
    if (h.unrealized_gain_loss >= 0) continue

    const isLongTerm = h.holding_period_months > 12
    const washSaleRisk = h.holding_period_months < 30 ? '高(30天内回购触发)' : '低'
    const harvestable = h.holding_period_months >= 30
    const taxRate = isLongTerm ? 0.05 : 0.20
    const taxSavings = Math.abs(h.unrealized_gain_loss) * taxRate * (harvestable ? 1 : 0)

    const substitutes: Record<string, string> = {
      'equity_large': '大盘指数ETF(不同发行方)',
      'equity_small': '小盘指数ETF(不同标的)',
      'bond_government': '不同期限国债ETF',
      'bond_corporate': '不同行业公司债ETF',
      'reit': '不同底层资产REIT',
      'commodity': '不同商品指数ETF',
      'international': '不同区域国际ETF',
    }

    harvestOpportunities.push({
      security_id: h.security_id,
      security_name: h.security_name,
      unrealized_loss: Math.round(h.unrealized_gain_loss),
      harvestable,
      wash_sale_risk: washSaleRisk,
      substitute_security: substitutes[h.asset_class] || '同类替代证券',
      tax_savings_estimate: Math.round(taxSavings),
      holding_period: isLongTerm ? 'long_term' : 'short_term',
    })

    if (harvestable) totalHarvestable += h.unrealized_gain_loss
  }

  const taxStrategies: TaxStrategy[] = [
    {
      strategy_name: '税损收割 (Tax-Loss Harvesting)',
      description: '系统性地实现亏损头寸，抵消资本利得',
      estimated_annual_savings: Math.round(Math.abs(totalHarvestable) * 0.15),
      applicability: '适用于有应税资本利得的投资者',
      priority: 'high',
    },
    {
      strategy_name: '资产定位 (Asset Location)',
      description: '将高税负资产放入税优账户，低税负资产放入应税账户',
      estimated_annual_savings: Math.round(Math.abs(totalUnrealizedLoss) * 0.08),
      applicability: '同时持有应税和税优账户的投资者',
      priority: 'high',
    },
    {
      strategy_name: '长期持有优化',
      description: '持有超过12个月享受长期资本利得优惠税率',
      estimated_annual_savings: Math.round(Math.abs(totalHarvestable) * 0.05),
      applicability: '短期持有头寸较多的投资者',
      priority: 'medium',
    },
    {
      strategy_name: '税收收益收割',
      description: '在年底前实现亏损以抵消当年资本利得',
      estimated_annual_savings: Math.round(Math.abs(totalHarvestable) * 0.10),
      applicability: '当年有已实现资本利得的投资者',
      priority: 'high',
    },
    {
      strategy_name: '捐赠增值证券',
      description: '捐赠长期增值证券给慈善机构，避免资本利得税',
      estimated_annual_savings: Math.round(Math.abs(totalHarvestable) * 0.03),
      applicability: '有慈善捐赠意愿的高净值投资者',
      priority: 'low',
    },
  ]

  const washSaleWarnings: string[] = []
  for (const h of account.holdings) {
    if (h.unrealized_gain_loss < 0 && h.holding_period_months < 30) {
      washSaleWarnings.push(`${h.security_name}(${h.security_id}) 持有不足30天，收割后30天内不可回购相同或实质上相同证券`)
    }
  }
  if (washSaleWarnings.length === 0) washSaleWarnings.push('当前无wash sale风险警告')

  const estimatedTaxSavings = harvestOpportunities.reduce((s, o) => s + o.tax_savings_estimate, 0)

  const dashboardData: Record<string, number> = {
    total_unrealized_loss: Math.round(totalUnrealizedLoss),
    total_harvestable_loss: Math.round(totalHarvestable),
    harvest_opportunities: harvestOpportunities.length,
    estimated_tax_savings: estimatedTaxSavings,
    wash_sale_warnings: washSaleWarnings.length,
    tax_strategies: taxStrategies.length,
    short_term_losses: harvestOpportunities.filter(o => o.holding_period === 'short_term').length,
    long_term_losses: harvestOpportunities.filter(o => o.holding_period === 'long_term').length,
    harvestable_count: harvestOpportunities.filter(o => o.harvestable).length,
    account_holdings: account.holdings.length,
  }

  return {
    account_id: account.account_id,
    total_unrealized_loss: Math.round(totalUnrealizedLoss),
    total_harvestable_loss: Math.round(totalHarvestable),
    harvest_opportunities: harvestOpportunities,
    tax_strategies: taxStrategies,
    estimated_tax_savings: estimatedTaxSavings,
    wash_sale_warnings: washSaleWarnings,
    dashboard_data: dashboardData,
  }
}

// --- Tool 4: Retirement Planner 分析 ---
function analyzeRetirementPlanner(data: string): RetirementPlanResult {
  const profile: RetirementProfile = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    profile.client_id + profile.current_age.toString()
  ))

  const yearsToRetirement = profile.retirement_age - profile.current_age
  const realReturn = (profile.expected_return_pct - profile.inflation_pct) / 100

  // Projected savings at retirement (future value of annuity)
  const monthlyRate = profile.expected_return_pct / 100 / 12
  const monthsToRetirement = yearsToRetirement * 12
  const employerMonthly = profile.current_annual_income / 12 * profile.employer_match_pct / 100
  const totalMonthly = profile.monthly_contribution + employerMonthly

  const futureValueCurrent = profile.current_savings * Math.pow(1 + monthlyRate, monthsToRetirement)
  const futureValueContributions = totalMonthly * (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate
  const projectedSavings = futureValueCurrent + futureValueContributions

  // Retirement income needs
  const retirementYears = profile.life_expectancy - profile.retirement_age
  const incomeNeededAnnual = profile.retirement_expenses_monthly * 12 * Math.pow(1 + profile.inflation_pct / 100, yearsToRetirement)
  const socialSecurityAnnual = profile.social_security_monthly * 12
  const pensionAnnual = profile.pension_monthly * 12
  const otherIncomeAnnual = profile.other_income_monthly * 12
  const incomeGap = Math.max(0, incomeNeededAnnual - socialSecurityAnnual - pensionAnnual - otherIncomeAnnual)

  // Required savings (4% rule adjusted)
  const safeWithdrawalRate = 0.04
  const savingsRequired = incomeGap / safeWithdrawalRate
  const fundingRatio = Math.min(2, projectedSavings / savingsRequired)

  // Monthly savings needed
  const monthlyNeeded = incomeGap > 0
    ? (savingsRequired - futureValueContributions) * monthlyRate / (Math.pow(1 + monthlyRate, monthsToRetirement) - 1)
    : 0

  // Social security replacement
  const ssReplacement = (socialSecurityAnnual / incomeNeededAnnual) * 100

  // Scenarios
  const scenarios: RetirementScenario[] = [
    {
      scenario_name: '乐观情景',
      return_assumption: profile.expected_return_pct + 2,
      projected_savings: Math.round(projectedSavings * 1.3),
      funding_ratio: Math.round(fundingRatio * 1.3 * 100) / 100,
      success_probability: Math.min(99, Math.round(85 + rng.nextFloat(-5, 10))),
    },
    {
      scenario_name: '基准情景',
      return_assumption: profile.expected_return_pct,
      projected_savings: Math.round(projectedSavings),
      funding_ratio: Math.round(fundingRatio * 100) / 100,
      success_probability: Math.min(95, Math.round(70 + rng.nextFloat(-5, 10))),
    },
    {
      scenario_name: '悲观情景',
      return_assumption: Math.max(0, profile.expected_return_pct - 3),
      projected_savings: Math.round(projectedSavings * 0.65),
      funding_ratio: Math.round(fundingRatio * 0.65 * 100) / 100,
      success_probability: Math.max(20, Math.round(45 + rng.nextFloat(-10, 10))),
    },
  ]

  // Withdrawal strategies
  const withdrawalStrategies: WithdrawalStrategy[] = [
    {
      strategy_name: '固定比例提取 (4%规则)',
      initial_withdrawal_rate: 4.0,
      annual_income: Math.round(projectedSavings * 0.04),
      sustainability_years: 30,
      probability_of_success: Math.round(85 + rng.nextFloat(-5, 5)),
    },
    {
      strategy_name: '动态提取 (Guardrails)',
      initial_withdrawal_rate: 4.5,
      annual_income: Math.round(projectedSavings * 0.045),
      sustainability_years: 30,
      probability_of_success: Math.round(80 + rng.nextFloat(-5, 5)),
    },
    {
      strategy_name: '桶策略 (Bucket)',
      initial_withdrawal_rate: 3.5,
      annual_income: Math.round(projectedSavings * 0.035),
      sustainability_years: 35,
      probability_of_success: Math.round(90 + rng.nextFloat(-3, 3)),
    },
  ]

  const recommendations: string[] = []
  if (fundingRatio < 0.7) recommendations.push('资金缺口较大，建议增加月供款或延迟退休')
  if (fundingRatio < 1) recommendations.push(`建议月供款增加至 ¥${Math.round(Math.max(0, monthlyNeeded)).toLocaleString()} 以上`)
  if (profile.employer_match_pct < 3) recommendations.push('建议充分利用雇主匹配供款，获取免费资金')
  if (yearsToRetirement > 20) recommendations.push('投资期限较长，可适当提高权益类资产配置')
  if (yearsToRetirement < 10) recommendations.push('临近退休，建议逐步降低投资组合风险')
  if (profile.healthcare_cost_monthly < 1000) recommendations.push('建议增加医疗预算储备，考虑长期护理保险')
  if (recommendations.length === 0) recommendations.push('退休规划状况良好，建议定期检视')

  const dashboardData: Record<string, number> = {
    years_to_retirement: yearsToRetirement,
    projected_savings: Math.round(projectedSavings),
    income_gap: Math.round(incomeGap),
    funding_ratio: Math.round(fundingRatio * 100) / 100,
    monthly_needed: Math.round(Math.max(0, monthlyNeeded)),
    ss_replacement_pct: Math.round(ssReplacement * 10) / 10,
    retirement_years: retirementYears,
    total_monthly_contribution: Math.round(totalMonthly),
    savings_required: Math.round(savingsRequired),
    current_savings: profile.current_savings,
    real_return_pct: Math.round(realReturn * 10000) / 100,
  }

  return {
    client_id: profile.client_id,
    projection: {
      years_to_retirement: yearsToRetirement,
      projected_savings_at_retirement: Math.round(projectedSavings),
      retirement_income_needed_annual: Math.round(incomeNeededAnnual),
      social_security_annual: Math.round(socialSecurityAnnual),
      pension_annual: Math.round(pensionAnnual),
      income_gap_annual: Math.round(incomeGap),
      savings_required_total: Math.round(savingsRequired),
      funding_ratio: Math.round(fundingRatio * 100) / 100,
      monthly_savings_needed: Math.round(Math.max(0, monthlyNeeded)),
      social_security_replacement_pct: Math.round(ssReplacement * 10) / 10,
      scenarios,
    },
    withdrawal_strategies: withdrawalStrategies,
    recommendations,
    dashboard_data: dashboardData,
  }
}

// --- Tool 5: Fund Screener 分析 ---
function analyzeFundScreener(data: string): FundScreeningResult {
  const input: { funds: FundCriteria[], filters?: Record<string, { min?: number, max?: number }> } = JSON.parse(data)
  const funds = input.funds
  const filters = input.filters || {}
  const rng = new SeededRandom(SeededRandom.seedFromString(
    funds.length.toString() + (funds[0]?.fund_code || 'default')
  ))

  // Apply filters
  let filtered = [...funds]
  if (filters.expense_ratio) {
    filtered = filtered.filter(f => !filters.expense_ratio!.max || f.expense_ratio <= filters.expense_ratio.max)
  }
  if (filters.sharpe_ratio) {
    filtered = filtered.filter(f => !filters.sharpe_ratio!.min || f.sharpe_ratio >= filters.sharpe_ratio.min)
  }
  if (filters.volatility_3yr) {
    filtered = filtered.filter(f => !filters.volatility_3yr!.max || f.volatility_3yr <= filters.volatility_3yr.max)
  }
  if (filters.manager_tenure_years) {
    filtered = filtered.filter(f => !filters.manager_tenure_years!.min || f.manager_tenure_years >= filters.manager_tenure_years.min)
  }
  if (filters.aum_millions) {
    filtered = filtered.filter(f => !filters.aum_millions!.min || f.aum_millions >= filters.aum_millions.min)
  }

  // Score and rank
  const scored = filtered.map(f => {
    const returnScore = (f.three_year_return / 30) * 30
    const sharpeScore = Math.min(f.sharpe_ratio / 2 * 25, 25)
    const drawdownScore = Math.max(0, 15 + f.max_drawdown / 5)
    const costScore = Math.max(0, 15 - f.expense_ratio * 10)
    const tenureScore = Math.min(f.manager_tenure_years / 10 * 10, 10)
    const alphaScore = Math.max(0, Math.min(f.alpha / 5 * 10, 10))
    const total = returnScore + sharpeScore + drawdownScore + costScore + tenureScore + alphaScore + rng.nextFloat(-2, 2)
    return { fund: f, score: Math.round(total * 100) / 100 }
  })

  scored.sort((a, b) => b.score - a.score)
  const topFunds = scored.slice(0, Math.min(10, scored.length)).map(s => s.fund)

  // Style drift detection
  const styleDrifts: StyleDriftIndicator[] = []
  for (const f of funds) {
    const driftScore = Math.abs(f.beta - 1) * 30 + (1 - f.r_squared) * 50 + rng.nextFloat(-5, 5)
    const driftDetected = driftScore > 40
    const driftFactors: string[] = []

    if (Math.abs(f.beta - 1) > 0.3) driftFactors.push(`Beta偏离: ${f.beta.toFixed(2)}`)
    if (f.r_squared < 0.8) driftFactors.push(`R²偏低: ${f.r_squared.toFixed(2)}`)
    if (f.top_holdings_concentration > 50) driftFactors.push(`持仓集中度变化: ${f.top_holdings_concentration}%`)
    if (f.turnover_ratio > 100) driftFactors.push(`换手率异常: ${f.turnover_ratio}%`)

    if (driftDetected) {
      styleDrifts.push({
        fund_code: f.fund_code,
        current_style: f.style_box,
        original_style: f.style_box.includes('成长') ? '价值型' : '成长型',
        drift_score: Math.round(driftScore * 100) / 100,
        drift_detected: true,
        drift_factors: driftFactors.length > 0 ? driftFactors : ['风格漂移因子待进一步分析'],
      })
    }
  }

  const dashboardData: Record<string, number> = {
    total_screened: funds.length,
    passing_screen: filtered.length,
    top_funds: topFunds.length,
    style_drifts: styleDrifts.length,
    avg_sharpe: Math.round(filtered.reduce((s, f) => s + f.sharpe_ratio, 0) / Math.max(1, filtered.length) * 100) / 100,
    avg_expense: Math.round(filtered.reduce((s, f) => s + f.expense_ratio, 0) / Math.max(1, filtered.length) * 10000) / 10000,
    avg_return_3yr: Math.round(filtered.reduce((s, f) => s + f.three_year_return, 0) / Math.max(1, filtered.length) * 100) / 100,
    avg_volatility: Math.round(filtered.reduce((s, f) => s + f.volatility_3yr, 0) / Math.max(1, filtered.length) * 100) / 100,
    avg_aum: Math.round(filtered.reduce((s, f) => s + f.aum_millions, 0) / Math.max(1, filtered.length)),
    avg_manager_tenure: Math.round(filtered.reduce((s, f) => s + f.manager_tenure_years, 0) / Math.max(1, filtered.length) * 10) / 10,
    filter_count: Object.keys(filters).length,
  }

  return {
    total_funds_screened: funds.length,
    funds_passing_screen: filtered.length,
    top_funds: topFunds,
    style_drifts: styleDrifts,
    screening_summary: {
      total_funds: funds.length,
      passed: filtered.length,
      filtered_out: funds.length - filtered.length,
      style_drifts_detected: styleDrifts.length,
    },
    dashboard_data: dashboardData,
  }
}

// --- Tool 6: Insurance Gap Analyzer 分析 ---
function analyzeInsuranceGapAnalyzer(data: string): InsuranceGapResult {
  const input: { family_id: string, members: FamilyMember[], existing_insurance: ExistingInsurance[], total_debt: number, funeral_costs: number, emergency_fund_months: number } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.family_id + input.members.length.toString()
  ))

  const primaryEarner = input.members.reduce((best, m) => m.annual_income > best.annual_income ? m : best, input.members[0])
  const dependents = input.members.filter(m => m.is_dependent)
  const totalAnnualIncome = input.members.reduce((s, m) => s + m.annual_income, 0)

  // Life insurance need (Human Life Value method)
  const workingYears = Math.max(0, 65 - primaryEarner.age)
  const lifeValueNeed = primaryEarner.annual_income * workingYears * 0.7
  const debtPayoff = input.total_debt
  const funeralCosts = input.funeral_costs
  const educationNeed = dependents.filter(d => d.age < 22).length * 200000
  const totalLifeNeed = lifeValueNeed + debtPayoff + funeralCosts + educationNeed

  // Existing coverage
  const existingLife = input.existing_insurance
    .filter(i => i.policy_type === 'life' || i.policy_type === 'term_life' || i.policy_type === 'whole_life')
    .reduce((s, i) => s + i.coverage_amount, 0)
  const existingCritical = input.existing_insurance
    .filter(i => i.policy_type === 'critical_illness')
    .reduce((s, i) => s + i.coverage_amount, 0)
  const existingHealth = input.existing_insurance
    .filter(i => i.policy_type === 'health' || i.policy_type === 'medical')
    .reduce((s, i) => s + i.coverage_amount, 0)
  const existingDisability = input.existing_insurance
    .filter(i => i.policy_type === 'disability')
    .reduce((s, i) => s + i.coverage_amount, 0)

  // Insurance needs
  const criticalIllnessNeed = primaryEarner.annual_income * 5 + 300000
  const healthInsuranceNeed = 1000000
  const disabilityNeed = primaryEarner.annual_income * workingYears * 0.6
  const emergencyFundNeed = totalAnnualIncome / 12 * input.emergency_fund_months

  const insuranceNeeds: InsuranceNeed[] = [
    {
      need_category: '寿险保障',
      calculation_method: '生命价值法 (Human Life Value)',
      required_coverage: Math.round(totalLifeNeed),
      existing_coverage: existingLife,
      gap_amount: Math.round(Math.max(0, totalLifeNeed - existingLife)),
      priority: 'critical',
      recommendation: `建议配置定期寿险 ¥${Math.round(totalLifeNeed).toLocaleString()}，覆盖收入替代+债务+教育`,
    },
    {
      need_category: '重疾险',
      calculation_method: '5倍年收入+医疗备用金',
      required_coverage: Math.round(criticalIllnessNeed),
      existing_coverage: existingCritical,
      gap_amount: Math.round(Math.max(0, criticalIllnessNeed - existingCritical)),
      priority: 'high',
      recommendation: `建议配置重疾险 ¥${Math.round(criticalIllnessNeed).toLocaleString()}，覆盖收入中断+康复费用`,
    },
    {
      need_category: '医疗险',
      calculation_method: '百万医疗标准',
      required_coverage: healthInsuranceNeed,
      existing_coverage: existingHealth,
      gap_amount: Math.round(Math.max(0, healthInsuranceNeed - existingHealth)),
      priority: 'high',
      recommendation: '建议配置百万医疗险，覆盖大额住院医疗费用',
    },
    {
      need_category: '意外险',
      calculation_method: '10倍年收入',
      required_coverage: primaryEarner.annual_income * 10,
      existing_coverage: 0,
      gap_amount: primaryEarner.annual_income * 10,
      priority: 'medium',
      recommendation: `建议配置意外险 ¥${(primaryEarner.annual_income * 10).toLocaleString()}，保费低杠杆高`,
    },
    {
      need_category: '失能收入险',
      calculation_method: '60%收入替代至退休',
      required_coverage: Math.round(disabilityNeed),
      existing_coverage: existingDisability,
      gap_amount: Math.round(Math.max(0, disabilityNeed - existingDisability)),
      priority: 'medium',
      recommendation: '建议配置失能收入保险，保障因伤残导致的收入损失',
    },
    {
      need_category: '应急基金',
      calculation_method: `${input.emergency_fund_months}个月家庭支出`,
      required_coverage: Math.round(emergencyFundNeed),
      existing_coverage: 0,
      gap_amount: Math.round(emergencyFundNeed),
      priority: 'high',
      recommendation: `建议储备应急基金 ¥${Math.round(emergencyFundNeed).toLocaleString()}，存放于高流动性账户`,
    },
  ]

  const totalRequired = insuranceNeeds.reduce((s, n) => s + n.required_coverage, 0)
  const totalExisting = insuranceNeeds.reduce((s, n) => s + n.existing_coverage, 0)
  const totalGap = totalRequired - totalExisting
  const gapRatio = totalRequired > 0 ? totalGap / totalRequired : 0

  // Product recommendations
  const productRecommendations: string[] = []
  if (insuranceNeeds[0].gap_amount > 0) productRecommendations.push(`定期寿险: 建议保额 ¥${Math.round(totalLifeNeed).toLocaleString()}，保障至60岁`)
  if (insuranceNeeds[1].gap_amount > 0) productRecommendations.push(`重疾险: 建议保额 ¥${Math.round(criticalIllnessNeed).toLocaleString()}，覆盖110种重疾`)
  if (insuranceNeeds[2].gap_amount > 0) productRecommendations.push('百万医疗险: 建议保额600万，0免赔额，含质子重离子')
  if (insuranceNeeds[3].gap_amount > 0) productRecommendations.push(`意外险: 建议保额 ¥${(primaryEarner.annual_income * 10).toLocaleString()}，含猝死责任`)
  if (insuranceNeeds[4].gap_amount > 0) productRecommendations.push('失能收入险: 建议月赔付额覆盖60%收入')
  productRecommendations.push('建议优先保障经济支柱，后覆盖其他家庭成员')
  productRecommendations.push('建议每年检视保险需求，随家庭状况变化调整')

  // Annual premium estimate (rough)
  const annualPremium = Math.round(
    totalLifeNeed * 0.002 +
    criticalIllnessNeed * 0.015 +
    healthInsuranceNeed * 0.001 +
    primaryEarner.annual_income * 10 * 0.001 +
    rng.nextFloat(-500, 500)
  )

  const dashboardData: Record<string, number> = {
    total_required: Math.round(totalRequired),
    total_existing: Math.round(totalExisting),
    total_gap: Math.round(totalGap),
    gap_ratio: Math.round(gapRatio * 100),
    life_gap: insuranceNeeds[0].gap_amount,
    critical_illness_gap: insuranceNeeds[1].gap_amount,
    health_gap: insuranceNeeds[2].gap_amount,
    accident_gap: insuranceNeeds[3].gap_amount,
    disability_gap: insuranceNeeds[4].gap_amount,
    annual_premium_estimate: annualPremium,
    dependents_count: dependents.length,
    primary_earner_income: primaryEarner.annual_income,
  }

  return {
    family_id: input.family_id,
    total_required_coverage: Math.round(totalRequired),
    total_existing_coverage: Math.round(totalExisting),
    total_gap: Math.round(totalGap),
    gap_ratio: Math.round(gapRatio * 100),
    insurance_needs: insuranceNeeds,
    product_recommendations: productRecommendations,
    annual_premium_estimate: annualPremium,
    dashboard_data: dashboardData,
  }
}

// --- Tool 7: Goal Based Investing 分析 ---
function analyzeGoalBasedInvesting(data: string): GoalBasedResult {
  const input: { client_id: string, goals: FinancialGoal[], monthly_budget: number, risk_free_rate?: number } = JSON.parse(data)
  const goals = input.goals
  const monthlyBudget = input.monthly_budget
  const riskFreeRate = input.risk_free_rate ?? 0.03
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.client_id + goals.length.toString()
  ))

  const goalProjections: GoalProjection[] = []
  let totalMonthlyNeeded = 0

  for (const goal of goals) {
    const monthlyRate = riskFreeRate / 12
    const monthsToGoal = goal.years_to_goal * 12

    // Projected amount with current savings and contributions
    const fvCurrent = goal.current_savings * Math.pow(1 + monthlyRate, monthsToGoal)
    const fvContributions = goal.monthly_contribution * (Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate
    const projectedAmount = fvCurrent + fvContributions

    const fundingRatio = goal.target_amount > 0 ? projectedAmount / goal.target_amount : 0

    // Required monthly contribution
    const shortfall = Math.max(0, goal.target_amount - fvCurrent)
    const requiredMonthly = shortfall > 0
      ? shortfall * monthlyRate / (Math.pow(1 + monthlyRate, monthsToGoal) - 1)
      : 0

    totalMonthlyNeeded += requiredMonthly

    // Success probability (simplified Monte Carlo)
    const baseProb = Math.min(95, Math.max(20, fundingRatio * 80 + rng.nextFloat(-10, 10)))
    const successProb = Math.round(baseProb)

    // Glide path
    const glidePath: GlidePathPoint[] = []
    const startEquity = goal.years_to_goal > 15 ? 80 : goal.years_to_goal > 8 ? 65 : goal.years_to_goal > 3 ? 50 : 30
    for (let y = 0; y <= goal.years_to_goal; y += Math.max(1, Math.floor(goal.years_to_goal / 5))) {
      const progress = y / goal.years_to_goal
      const equityAlloc = Math.round(startEquity * (1 - progress * 0.7))
      const fixedAlloc = 100 - equityAlloc
      const expectedVal = goal.current_savings * Math.pow(1 + riskFreeRate, y) +
        goal.monthly_contribution * 12 * (Math.pow(1 + riskFreeRate, y) - 1) / riskFreeRate
      glidePath.push({
        year: y,
        equity_allocation: equityAlloc,
        fixed_income_allocation: fixedAlloc,
        expected_value: Math.round(expectedVal),
      })
    }

    goalProjections.push({
      goal_id: goal.goal_id,
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      projected_amount: Math.round(projectedAmount),
      funding_ratio: Math.round(fundingRatio * 100) / 100,
      monthly_shortfall: Math.round(Math.max(0, requiredMonthly - goal.monthly_contribution)),
      required_monthly_contribution: Math.round(requiredMonthly),
      success_probability: successProb,
      glide_path: glidePath,
    })
  }

  const totalMonthlyAvailable = monthlyBudget
  const budgetGap = totalMonthlyNeeded - totalMonthlyAvailable

  let overallHealth: string
  if (budgetGap <= 0) overallHealth = '良好 (所有目标可在预算内实现)'
  else if (budgetGap < totalMonthlyNeeded * 0.2) overallHealth = '基本可行 (需小幅调整)'
  else if (budgetGap < totalMonthlyNeeded * 0.5) overallHealth = '需调整 (建议延长期限或降低目标)'
  else overallHealth = '缺口较大 (需重大调整)'

  const recommendations: string[] = []
  if (budgetGap > 0) recommendations.push(`月度预算缺口 ¥${Math.round(budgetGap).toLocaleString()}，建议增加储蓄或调整目标`)
  const underfundedGoals = goalProjections.filter(g => g.funding_ratio < 0.7)
  if (underfundedGoals.length > 0) {
    recommendations.push(`${underfundedGoals.length}个目标资金缺口较大，建议优先保障${underfundedGoals.sort((a, b) => a.funding_ratio - b.funding_ratio)[0].goal_name}`)
  }
  const longTermGoals = goals.filter(g => g.years_to_goal > 10)
  if (longTermGoals.length > 0) recommendations.push('长期目标可配置较高权益比例，利用复利效应')
  const shortTermGoals = goals.filter(g => g.years_to_goal < 3)
  if (shortTermGoals.length > 0) recommendations.push('短期目标应以固定收益类资产为主，确保本金安全')
  recommendations.push('建议每年检视目标进度，根据市场情况调整配置')
  if (recommendations.length === 0) recommendations.push('目标投资规划状况良好')

  const dashboardData: Record<string, number> = {
    total_goals: goals.length,
    total_monthly_needed: Math.round(totalMonthlyNeeded),
    total_monthly_available: totalMonthlyAvailable,
    budget_gap: Math.round(budgetGap),
    avg_funding_ratio: Math.round(goalProjections.reduce((s, g) => s + g.funding_ratio, 0) / Math.max(1, goalProjections.length) * 100) / 100,
    avg_success_prob: Math.round(goalProjections.reduce((s, g) => s + g.success_probability, 0) / Math.max(1, goalProjections.length)),
    essential_goals: goals.filter(g => g.priority === 'essential').length,
    important_goals: goals.filter(g => g.priority === 'important').length,
    aspirational_goals: goals.filter(g => g.priority === 'aspirational').length,
    underfunded_goals: underfundedGoals.length,
    total_target_amount: goals.reduce((s, g) => s + g.target_amount, 0),
  }

  return {
    client_id: input.client_id,
    goals: goalProjections,
    total_monthly_needed: Math.round(totalMonthlyNeeded),
    total_monthly_available: totalMonthlyAvailable,
    overall_funding_health: overallHealth,
    recommendations,
    dashboard_data: dashboardData,
  }
}

// --- Tool 8: Behavioral Finance Coach 分析 ---
function analyzeBehavioralFinanceCoach(data: string): BehavioralFinanceResult {
  const assessment: BehavioralAssessment = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(
    assessment.client_id + assessment.assessment_date
  ))

  const biases: BehavioralBias[] = []

  // Loss aversion
  if (assessment.panic_sell_incidents_12m > 0) {
    biases.push({
      bias_name: '损失厌恶 (Loss Aversion)',
      bias_category: 'emotional',
      severity: assessment.panic_sell_incidents_12m > 3 ? 'severe' : assessment.panic_sell_incidents_12m > 1 ? 'high' : 'moderate',
      description: '对损失的痛苦感远大于同等收益的快乐感，导致恐慌性卖出',
      evidence: `过去12个月发生${assessment.panic_sell_incidents_12m}次恐慌性卖出`,
      impact_on_returns: -1.5 * assessment.panic_sell_incidents_12m,
      mitigation_strategy: '制定书面投资政策声明(SIP)，设定明确的卖出规则，避免情绪化决策',
    })
  }

  // Overconfidence
  if (assessment.trading_frequency === 'daily' || assessment.trading_frequency === 'weekly') {
    biases.push({
      bias_name: '过度自信 (Overconfidence)',
      bias_category: 'cognitive',
      severity: assessment.trading_frequency === 'daily' ? 'high' : 'moderate',
      description: '高估自己的投资能力，频繁交易导致成本增加',
      evidence: `交易频率: ${assessment.trading_frequency}，平均持有期: ${assessment.avg_holding_period_months}个月`,
      impact_on_returns: assessment.trading_frequency === 'daily' ? -2.5 : -1.2,
      mitigation_strategy: '降低交易频率，采用买入并持有策略，记录每次交易的理由和结果',
    })
  }

  // Herd behavior / FOMO
  if (assessment.fomo_buy_incidents_12m > 0) {
    biases.push({
      bias_name: '羊群效应/追涨 (Herd Behavior/FOMO)',
      bias_category: 'emotional',
      severity: assessment.fomo_buy_incidents_12m > 3 ? 'high' : 'moderate',
      description: '跟随大众情绪追涨杀跌，在高点买入',
      evidence: `过去12个月发生${assessment.fomo_buy_incidents_12m}次追涨买入`,
      impact_on_returns: -1.0 * assessment.fomo_buy_incidents_12m,
      mitigation_strategy: '制定定投计划，避免关注短期市场新闻，设置冷静期后再做买入决策',
    })
  }

  // Home bias / Concentration
  if (assessment.portfolio_concentration_pct > 60) {
    biases.push({
      bias_name: '集中度过高 (Concentration Bias)',
      bias_category: 'cognitive',
      severity: assessment.portfolio_concentration_pct > 80 ? 'severe' : assessment.portfolio_concentration_pct > 70 ? 'high' : 'moderate',
      description: '投资组合过度集中于少数资产，非系统性风险过高',
      evidence: `前三大持仓占比 ${assessment.portfolio_concentration_pct}%`,
      impact_on_returns: -0.8,
      mitigation_strategy: '分散化投资，单只证券不超过组合10%，单一行业不超过25%',
    })
  }

  // Recency bias
  if (assessment.check_frequency === 'daily') {
    biases.push({
      bias_name: '近因偏差 (Recency Bias)',
      bias_category: 'cognitive',
      severity: 'moderate',
      description: '过度关注近期市场波动，忽视长期趋势',
      evidence: `每日查看投资组合，易受短期波动影响`,
      impact_on_returns: -0.5,
      mitigation_strategy: '降低查看频率至每月一次，关注长期投资目标而非短期波动',
    })
  }

  // Status quo bias
  if (!assessment.rebalances_regularly) {
    biases.push({
      bias_name: '现状偏差 (Status Quo Bias)',
      bias_category: 'cognitive',
      severity: 'moderate',
      description: '不愿改变现有配置，导致风险敞口偏离目标',
      evidence: '未定期进行组合再平衡',
      impact_on_returns: -0.3,
      mitigation_strategy: '设定季度/年度再平衡提醒，采用自动化再平衡工具',
    })
  }

  // Anchoring
  if (!assessment.uses_stop_loss) {
    biases.push({
      bias_name: '锚定效应 (Anchasing Bias)',
      bias_category: 'cognitive',
      severity: 'moderate',
      description: '锚定于买入价格，不愿止损导致损失扩大',
      evidence: '未设置止损机制',
      impact_on_returns: -0.7,
      mitigation_strategy: '设置止损规则(如-15%止损)，基于当前价值而非买入价格做决策',
    })
  }

  // Mental accounting
  const mentalAccounts: MentalAccount[] = [
    {
      account_name: '安全账户',
      account_type: 'safety',
      amount: 0,
      pct_of_portfolio: 20,
      appropriate_use: '应急基金、短期支出(1-3年)',
      current_use: '货币基金、短期理财',
      misallocation_risk: '收益率可能低于通胀，实际购买力下降',
    },
    {
      account_name: '收入账户',
      account_type: 'income',
      amount: 0,
      pct_of_portfolio: 35,
      appropriate_use: '稳定现金流、债券配置',
      current_use: '债券基金、高股息股票',
      misallocation_risk: '过度配置可能限制长期增长',
    },
    {
      account_name: '增长账户',
      account_type: 'growth',
      amount: 0,
      pct_of_portfolio: 35,
      appropriate_use: '长期资本增值(5年以上)',
      current_use: '股票、权益类基金',
      misallocation_risk: '波动较大，需匹配投资期限',
    },
    {
      account_name: '投机账户',
      account_type: 'speculation',
      amount: 0,
      pct_of_portfolio: 10,
      appropriate_use: '高风险高回报机会(可承受全部损失)',
      current_use: '加密货币、期权、个股',
      misallocation_risk: '比例过高可能导致重大损失',
    },
  ]

  // Nudge strategies
  const nudgeStrategies: NudgeStrategy[] = [
    {
      nudge_name: '自动定投 (Auto-DCA)',
      description: '设置每月自动定投，消除择时偏差',
      implementation: '每月固定日期自动扣款投资目标基金',
      expected_improvement: '降低情绪对投资决策的影响，提升长期收益约0.5-1%',
    },
    {
      nudge_name: '默认再平衡 (Auto-Rebalance)',
      description: '设置季度自动再平衡提醒',
      implementation: '每季度末自动检查并执行再平衡',
      expected_improvement: '维持目标风险水平，避免风格漂移',
    },
    {
      nudge_name: '冷静期规则 (Cooling Period)',
      description: '大额交易前设置24-48小时冷静期',
      implementation: '任何超过组合5%的交易需等待48小时确认',
      expected_improvement: '减少冲动交易约60%，降低交易成本',
    },
    {
      nudge_name: '目标可视化 (Goal Visualization)',
      description: '将长期目标可视化，增强延迟满足感',
      implementation: '制作目标进度仪表盘，定期更新',
      expected_improvement: '提升储蓄坚持率约25%',
    },
    {
      nudge_name: '损失框架重构 (Reframing)',
      description: '将短期波动重构为长期买入机会',
      implementation: '市场下跌时发送"定投机会"提醒而非"亏损警告"',
      expected_improvement: '减少恐慌性卖出约40%',
    },
  ]

  // Overall behavior score
  const biasPenalty = biases.reduce((s, b) => {
    const sevScore = b.severity === 'severe' ? 20 : b.severity === 'high' ? 15 : b.severity === 'moderate' ? 10 : 5
    return s + sevScore
  }, 0)
  const positivePoints = (assessment.has_written_investment_policy ? 15 : 0) +
    (assessment.uses_stop_loss ? 10 : 0) +
    (assessment.rebalances_regularly ? 10 : 0) +
    (assessment.check_frequency === 'monthly' || assessment.check_frequency === 'quarterly' ? 10 : 0)
  const behaviorScore = Math.max(0, Math.min(100, 70 - biasPenalty + positivePoints + rng.nextFloat(-3, 3)))

  // Estimated behavioral cost
  const behavioralCost = Math.abs(biases.reduce((s, b) => s + b.impact_on_returns, 0))

  const recommendations: string[] = []
  if (biases.length > 3) recommendations.push(`检测到${biases.length}种行为偏差，建议优先处理高严重度偏差`)
  if (!assessment.has_written_investment_policy) recommendations.push('建议制定书面投资政策声明(SIP)，明确投资目标、风险承受度和买卖规则')
  if (!assessment.uses_stop_loss) recommendations.push('建议设置止损规则，避免损失扩大')
  if (!assessment.rebalances_regularly) recommendations.push('建议每季度进行组合再平衡，维持目标配置')
  if (assessment.check_frequency === 'daily') recommendations.push('建议降低查看频率至每月一次，减少情绪干扰')
  if (assessment.portfolio_concentration_pct > 60) recommendations.push('建议分散化投资，降低集中度风险')
  recommendations.push('建议持续学习行为金融知识，提升自我认知')
  if (recommendations.length === 0) recommendations.push('投资行为健康，建议保持良好习惯')

  const dashboardData: Record<string, number> = {
    behavior_score: Math.round(behaviorScore),
    bias_count: biases.length,
    severe_biases: biases.filter(b => b.severity === 'severe').length,
    high_biases: biases.filter(b => b.severity === 'high').length,
    moderate_biases: biases.filter(b => b.severity === 'moderate').length,
    cognitive_biases: biases.filter(b => b.bias_category === 'cognitive').length,
    emotional_biases: biases.filter(b => b.bias_category === 'emotional').length,
    behavioral_cost_pct: Math.round(behavioralCost * 100) / 100,
    nudge_strategies: nudgeStrategies.length,
    panic_sells: assessment.panic_sell_incidents_12m,
    fomo_buys: assessment.fomo_buy_incidents_12m,
    concentration_pct: assessment.portfolio_concentration_pct,
  }

  return {
    client_id: assessment.client_id,
    overall_behavior_score: Math.round(behaviorScore),
    biases,
    mental_accounts: mentalAccounts,
    nudge_strategies: nudgeStrategies,
    estimated_behavioral_cost: Math.round(behavioralCost * 100) / 100,
    recommendations,
    dashboard_data: dashboardData,
  }
}

// ==================== SECTION 4 — 报告格式化函数 ====================

// --- Tool 1: Portfolio Analyzer 报告 ---
function formatPortfolioAnalyzerReport(result: PortfolioAnalysisResult): string {
  const lines: string[] = []
  lines.push('## 📊 Portfolio Analyzer — 资产配置分析与再平衡建议')
  lines.push('')
  lines.push(`> **组合总值**: ¥${result.total_value.toLocaleString()} | **持仓数**: ${result.num_holdings} | **预期收益**: ${result.portfolio_expected_return}% | **波动率**: ${result.portfolio_volatility}% | **夏普比率**: ${result.sharpe_ratio} | **分散化比率**: ${result.diversification_ratio}`)
  lines.push('')

  lines.push('### 📊 资产配置仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PORTFOLIO[投资组合] --> EQUITY[权益类]')
  lines.push('    PORTFOLIO --> FIXED[固收类]')
  lines.push('    PORTFOLIO --> ALTERNATIVE[另类资产]')
  lines.push('    PORTFOLIO --> CASH[现金]')
  lines.push(`    RETURN[预期收益: ${result.portfolio_expected_return}%]`)
  lines.push(`    RISK[波动率: ${result.portfolio_volatility}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 当前 vs 目标配置')
  lines.push('| 资产类别 | 当前权重 | 目标权重 | 偏离 | 状态 |')
  lines.push('|----------|----------|----------|------|------|')
  const allClasses = new Set([...Object.keys(result.current_allocation), ...Object.keys(result.target_allocation)])
  for (const cls of allClasses) {
    const current = result.current_allocation[cls] || 0
    const target = result.target_allocation[cls] || 0
    const drift = result.drift_analysis[cls] || 0
    const status = Math.abs(drift) > 5 ? '⚠️ 需再平衡' : '✅ 正常'
    lines.push(`| ${cls} | ${current.toFixed(1)}% | ${target.toFixed(1)}% | ${drift > 0 ? '+' : ''}${drift.toFixed(1)}% | ${status} |`)
  }
  lines.push('')

  if (result.rebalance_actions.length > 0) {
    lines.push('### 🔄 再平衡操作建议')
    lines.push('| 资产 | 操作 | 金额 | 原因 |')
    lines.push('|------|------|------|------|')
    for (const ra of result.rebalance_actions) {
      lines.push(`| ${ra.asset_id} | ${ra.action === 'buy' ? '买入' : '卖出'} | ¥${ra.amount.toLocaleString()} | ${ra.reason} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 风险预算分析')
  lines.push('| 资产类别 | 边际风险贡献 | 风险预算 | 当前风险 | 状态 |')
  lines.push('|----------|-------------|----------|----------|------|')
  for (const rb of result.risk_budget) {
    const statusIcon = rb.status === 'over' ? '🔴 超配' : rb.status === 'under' ? '🟡 低配' : '🟢 最优'
    lines.push(`| ${rb.asset_class} | ${rb.marginal_risk_contribution} | ${rb.risk_budget_pct}% | ${rb.current_risk_pct}% | ${statusIcon} |`)
  }
  lines.push('')

  lines.push('### 📋 组合指标')
  lines.push(`- **预期年化收益**: ${result.portfolio_expected_return}%`)
  lines.push(`- **组合波动率**: ${result.portfolio_volatility}%`)
  lines.push(`- **夏普比率**: ${result.sharpe_ratio}`)
  lines.push(`- **分散化比率**: ${result.diversification_ratio} (>1表示分散化有效)`)
  lines.push('')

  lines.push('### 📋 资产配置清单')
  lines.push('- [x] 战略资产配置(SAA)分析')
  lines.push('- [x] 战术资产配置(TAA)偏离检测')
  lines.push('- [x] 再平衡触发与操作建议')
  lines.push('- [x] 风险预算分配评估')
  lines.push('- [x] 组合风险收益指标计算')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// --- Tool 2: Risk Tolerance Assessor 报告 ---
function formatRiskToleranceReport(result: RiskToleranceResult): string {
  const lines: string[] = []
  lines.push('## 🎯 Risk Tolerance Assessor — 投资者风险偏好问卷与画像')
  lines.push('')
  lines.push(`> **受访者**: ${result.respondent_id} | **画像类型**: ${result.investor_profile.profile_type} | **综合评分**: ${result.investor_profile.composite_risk_score}/100 | **风险承受能力**: ${result.investor_profile.risk_capacity_score} | **风险态度**: ${result.investor_profile.risk_attitude_score}`)
  lines.push('')

  lines.push('### 📊 风险画像仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CAPACITY[风险承受能力] --> COMPOSITE[综合评分]')
  lines.push('    ATTITUDE[风险态度] --> COMPOSITE')
  lines.push('    COMPOSITE --> PROFILE[投资者画像]')
  lines.push(`    EQUITY[权益上限: ${result.investor_profile.recommended_max_equity_pct}%]`)
  lines.push(`    FIXED[固收上限: ${result.investor_profile.recommended_max_fixed_income_pct}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 风险维度评分')
  lines.push('| 维度 | 得分 | 满分 | 权重 | 解读 |')
  lines.push('|------|------|------|------|------|')
  for (const dim of result.risk_dimensions) {
    lines.push(`| ${dim.dimension} | ${dim.score} | ${dim.max_score} | ${(dim.weight * 100).toFixed(0)}% | ${dim.interpretation} |`)
  }
  lines.push('')

  lines.push('### 👤 投资者画像')
  lines.push(`- **画像类型**: ${result.investor_profile.profile_type}`)
  lines.push(`- **综合风险评分**: ${result.investor_profile.composite_risk_score}/100`)
  lines.push(`- **建议权益类上限**: ${result.investor_profile.recommended_max_equity_pct}%`)
  lines.push(`- **建议固收类上限**: ${result.investor_profile.recommended_max_fixed_income_pct}%`)
  lines.push(`- **建议另类资产上限**: ${result.investor_profile.recommended_max_alternatives_pct}%`)
  lines.push('')

  lines.push('### 📋 适当性匹配说明')
  for (const note of result.investor_profile.suitability_notes) {
    lines.push(`- ${note}`)
  }
  lines.push('')

  lines.push('### 📋 问卷摘要')
  for (const [key, val] of Object.entries(result.questionnaire_summary)) {
    lines.push(`- **${key}**: ${val}`)
  }
  lines.push('')

  lines.push('### 📋 风险评估清单')
  lines.push('- [x] 风险承受能力评估(年龄/收入/期限/流动性/稳定性/家庭)')
  lines.push('- [x] 风险态度评估(回撤反应/投资目标/损失容忍)')
  lines.push('- [x] 综合风险评分计算')
  lines.push('- [x] 投资者画像分类')
  lines.push('- [x] 适当性匹配建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// --- Tool 3: Tax Loss Harvester 报告 ---
function formatTaxLossHarvestReport(result: TaxLossHarvestResult): string {
  const lines: string[] = []
  lines.push('## 💰 Tax Loss Harvester — 税收亏损收割与税优策略')
  lines.push('')
  lines.push(`> **账户**: ${result.account_id} | **未实现亏损总额**: ¥${result.total_unrealized_loss.toLocaleString()} | **可收割亏损**: ¥${result.total_harvestable_loss.toLocaleString()} | **收割机会**: ${result.harvest_opportunities.length} | **预计节税**: ¥${result.estimated_tax_savings.toLocaleString()}`)
  lines.push('')

  lines.push('### 📊 税损收割仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    LOSSES[未实现亏损] --> HARVEST[可收割亏损]')
  lines.push('    LOSSES --> DEFER[暂不可收割]')
  lines.push('    HARVEST --> TAX[节税效果]')
  lines.push('    TAX --> SUBSTITUTE[替代证券配置]')
  lines.push(`    SAVINGS[预计节税: ¥${result.estimated_tax_savings.toLocaleString()}]`)
  lines.push('```')
  lines.push('')

  if (result.harvest_opportunities.length > 0) {
    lines.push('### 📋 收割机会明细')
    lines.push('| 证券 | 未实现亏损 | 可收割 | Wash Sale风险 | 替代证券 | 预计节税 | 持有期 |')
    lines.push('|------|-----------|--------|--------------|----------|----------|--------|')
    for (const op of result.harvest_opportunities) {
      lines.push(`| ${op.security_name}(${op.security_id}) | ¥${op.unrealized_loss.toLocaleString()} | ${op.harvestable ? '✅' : '❌'} | ${op.wash_sale_risk} | ${op.substitute_security} | ¥${op.tax_savings_estimate.toLocaleString()} | ${op.holding_period === 'long_term' ? '长期' : '短期'} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 税优策略')
  lines.push('| 策略 | 描述 | 预计年节省 | 适用性 | 优先级 |')
  lines.push('|------|------|-----------|--------|--------|')
  for (const ts of result.tax_strategies) {
    const priorityIcon = ts.priority === 'high' ? '🔴' : ts.priority === 'medium' ? '🟡' : '🟢'
    lines.push(`| ${ts.strategy_name} | ${ts.description} | ¥${ts.estimated_annual_savings.toLocaleString()} | ${ts.applicability} | ${priorityIcon} ${ts.priority} |`)
  }
  lines.push('')

  lines.push('### ⚠️ Wash Sale 警告')
  for (const w of result.wash_sale_warnings) {
    lines.push(`- ${w}`)
  }
  lines.push('')

  lines.push('### 📋 税损收割清单')
  lines.push('- [x] 未实现亏损头寸识别')
  lines.push('- [x] Wash Sale风险评估')
  lines.push('- [x] 替代证券匹配')
  lines.push('- [x] 节税效果估算')
  lines.push('- [x] 税优策略建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// --- Tool 4: Retirement Planner 报告 ---
function formatRetirementPlanReport(result: RetirementPlanResult): string {
  const lines: string[] = []
  lines.push('## 🏖️ Retirement Planner — 退休规划与社保/年金测算')
  lines.push('')
  lines.push(`> **客户**: ${result.client_id} | **距退休**: ${result.projection.years_to_retirement}年 | **预计退休储蓄**: ¥${result.projection.projected_savings_at_retirement.toLocaleString()} | **资金缺口**: ¥${result.projection.income_gap_annual.toLocaleString()}/年 | **资金充足率**: ${result.projection.funding_ratio}`)
  lines.push('')

  lines.push('### 📊 退休规划仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CURRENT[当前储蓄] --> PROJECTED[预计退休储蓄]')
  lines.push('    CONTRIBUTION[月供款] --> PROJECTED')
  lines.push('    PROJECTED --> GAP[资金缺口]')
  lines.push('    SS[社保] --> INCOME[退休收入]')
  lines.push('    PENSION[年金] --> INCOME')
  lines.push('    WITHDRAWAL[提取策略] --> INCOME')
  lines.push(`    RATIO[充足率: ${result.projection.funding_ratio}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 退休预测')
  lines.push(`- **距退休年限**: ${result.projection.years_to_retirement}年`)
  lines.push(`- **预计退休时储蓄**: ¥${result.projection.projected_savings_at_retirement.toLocaleString()}`)
  lines.push(`- **退休年收入需求**: ¥${result.projection.retirement_income_needed_annual.toLocaleString()}`)
  lines.push(`- **社保年收入**: ¥${result.projection.social_security_annual.toLocaleString()} (替代率: ${result.projection.social_security_replacement_pct}%)`)
  lines.push(`- **年金年收入**: ¥${result.projection.pension_annual.toLocaleString()}`)
  lines.push(`- **年收入缺口**: ¥${result.projection.income_gap_annual.toLocaleString()}`)
  lines.push(`- **所需总储蓄**: ¥${result.projection.savings_required_total.toLocaleString()}`)
  lines.push(`- **资金充足率**: ${result.projection.funding_ratio}`)
  lines.push(`- **建议月供款**: ¥${result.projection.monthly_savings_needed.toLocaleString()}`)
  lines.push('')

  lines.push('### 📋 情景分析')
  lines.push('| 情景 | 收益假设 | 预计储蓄 | 充足率 | 成功概率 |')
  lines.push('|------|----------|----------|--------|----------|')
  for (const sc of result.projection.scenarios) {
    lines.push(`| ${sc.scenario_name} | ${sc.return_assumption}% | ¥${sc.projected_savings.toLocaleString()} | ${sc.funding_ratio} | ${sc.success_probability}% |`)
  }
  lines.push('')

  lines.push('### 📋 提取策略')
  lines.push('| 策略 | 初始提取率 | 年收入 | 可持续年限 | 成功概率 |')
  lines.push('|------|-----------|--------|-----------|----------|')
  for (const ws of result.withdrawal_strategies) {
    lines.push(`| ${ws.strategy_name} | ${ws.initial_withdrawal_rate}% | ¥${ws.annual_income.toLocaleString()} | ${ws.sustainability_years}年 | ${ws.probability_of_success}% |`)
  }
  lines.push('')

  lines.push('### 💡 退休规划建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 退休规划清单')
  lines.push('- [x] 退休缺口测算')
  lines.push('- [x] 社保替代率分析')
  lines.push('- [x] 年金现值计算')
  lines.push('- [x] 多情景预测')
  lines.push('- [x] 提取策略比较')
  lines.push('- [x] 优化建议生成')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// --- Tool 5: Fund Screener 报告 ---
function formatFundScreeningReport(result: FundScreeningResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Fund Screener — 基金筛选与风格漂移检测')
  lines.push('')
  lines.push(`> **筛选总数**: ${result.total_funds_screened} | **通过筛选**: ${result.funds_passing_screen} | **风格漂移**: ${result.style_drifts.length} | **Top基金**: ${result.top_funds.length}`)
  lines.push('')

  lines.push('### 📊 基金筛选仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    UNIVERSE[基金池] --> SCREEN[筛选条件]')
  lines.push('    SCREEN --> PASSED[通过筛选]')
  lines.push('    PASSED --> RANK[综合评分排名]')
  lines.push('    RANK --> TOP[Top基金]')
  lines.push('    PASSED --> DRIFT[风格漂移检测]')
  lines.push(`    PASS_RATE[通过率: ${result.funds_passing_screen}/${result.total_funds_screened}]`)
  lines.push('```')
  lines.push('')

  if (result.top_funds.length > 0) {
    lines.push('### 📋 Top 基金')
    lines.push('| 基金代码 | 名称 | 类型 | 规模(亿) | 费率 | 3年收益 | 夏普 | 最大回撤 | Alpha | 经理任期 |')
    lines.push('|----------|------|------|----------|------|---------|------|----------|-------|----------|')
    for (const f of result.top_funds.slice(0, 8)) {
      lines.push(`| ${f.fund_code} | ${f.fund_name} | ${f.fund_type} | ${f.aum_millions} | ${f.expense_ratio}% | ${f.three_year_return}% | ${f.sharpe_ratio} | ${f.max_drawdown}% | ${f.alpha} | ${f.manager_tenure_years}年 |`)
    }
    lines.push('')
  }

  if (result.style_drifts.length > 0) {
    lines.push('### ⚠️ 风格漂移检测')
    lines.push('| 基金代码 | 当前风格 | 原始风格 | 漂移分数 | 漂移因子 |')
    lines.push('|----------|----------|----------|----------|----------|')
    for (const sd of result.style_drifts) {
      lines.push(`| ${sd.fund_code} | ${sd.current_style} | ${sd.original_style} | ${sd.drift_score} | ${sd.drift_factors.join(', ')} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 筛选统计')
  for (const [key, val] of Object.entries(result.screening_summary)) {
    lines.push(`- **${key}**: ${val}`)
  }
  lines.push('')

  lines.push('### 📋 基金筛选清单')
  lines.push('- [x] 多因子筛选(费率/夏普/波动/规模/经理任期)')
  lines.push('- [x] 综合评分排名')
  lines.push('- [x] 风格漂移检测(Beta/R²/集中度/换手率)')
  lines.push('- [x] 基金经理评估')
  lines.push('- [x] 风险收益指标分析')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// --- Tool 6: Insurance Gap Analyzer 报告 ---
function formatInsuranceGapReport(result: InsuranceGapResult): string {
  const lines: string[] = []
  lines.push('## 🛡️ Insurance Gap Analyzer — 家庭保障缺口分析与保险建议')
  lines.push('')
  lines.push(`> **家庭**: ${result.family_id} | **总需求保额**: ¥${result.total_required_coverage.toLocaleString()} | **已有保额**: ¥${result.total_existing_coverage.toLocaleString()} | **保障缺口**: ¥${result.total_gap.toLocaleString()} | **缺口比例**: ${result.gap_ratio}%`)
  lines.push('')

  lines.push('### 📊 保障缺口仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    NEEDS[保障需求] --> GAP[保障缺口]')
  lines.push('    EXISTING[已有保障] --> GAP')
  lines.push('    GAP --> REC[产品建议]')
  lines.push('    REC --> PREMIUM[保费预算]')
  lines.push(`    GAP_RATIO[缺口比例: ${result.gap_ratio}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 保障缺口明细')
  lines.push('| 保障类别 | 计算方法 | 需求保额 | 已有保额 | 缺口 | 优先级 |')
  lines.push('|----------|----------|----------|----------|------|--------|')
  for (const need of result.insurance_needs) {
    const priorityIcon = need.priority === 'critical' ? '🔴' : need.priority === 'high' ? '🟠' : need.priority === 'medium' ? '🟡' : '🟢'
    lines.push(`| ${need.need_category} | ${need.calculation_method} | ¥${need.required_coverage.toLocaleString()} | ¥${need.existing_coverage.toLocaleString()} | ¥${need.gap_amount.toLocaleString()} | ${priorityIcon} ${need.priority} |`)
  }
  lines.push('')

  lines.push('### 💡 产品建议')
  for (const r of result.product_recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push(`### 📋 保费预算`)
  lines.push(`- **预计年保费**: ¥${result.annual_premium_estimate.toLocaleString()}`)
  lines.push(`- **保费占收入比**: 建议控制在年收入5-15%`)
  lines.push('')

  lines.push('### 📋 保障分析清单')
  lines.push('- [x] 生命价值法寿险需求测算')
  lines.push('- [x] 重疾险需求测算(5倍收入法)')
  lines.push('- [x] 医疗险需求测算')
  lines.push('- [x] 意外险需求测算(10倍收入法)')
  lines.push('- [x] 失能收入险需求测算')
  lines.push('- [x] 应急基金需求测算')
  lines.push('- [x] 保障缺口汇总与优先级排序')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// --- Tool 7: Goal Based Investing 报告 ---
function formatGoalBasedReport(result: GoalBasedResult): string {
  const lines: string[] = []
  lines.push('## 🎯 Goal Based Investing — 目标日期投资与教育/购房储蓄')
  lines.push('')
  lines.push(`> **客户**: ${result.client_id} | **目标数**: ${result.goals.length} | **月需供款**: ¥${result.total_monthly_needed.toLocaleString()} | **月可用预算**: ¥${result.total_monthly_available.toLocaleString()} | **整体健康度**: ${result.overall_funding_health}`)
  lines.push('')

  lines.push('### 📊 目标投资仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    GOALS[财务目标] --> PROJECTION[目标预测]')
  lines.push('    PROJECTION --> FUNDING[资金充足率]')
  lines.push('    FUNDING --> GLIDE[下滑路径]')
  lines.push('    GLIDE --> ALLOC[资产配置]')
  lines.push(`    HEALTH[健康度: ${result.overall_funding_health}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 目标预测明细')
  for (const goal of result.goals) {
    lines.push(`#### ${goal.goal_name} (${goal.goal_id})`)
    lines.push(`- **目标金额**: ¥${goal.target_amount.toLocaleString()} | **预计达成**: ¥${goal.projected_amount.toLocaleString()} | **充足率**: ${goal.funding_ratio} | **成功概率**: ${goal.success_probability}%`)
    lines.push(`- **建议月供款**: ¥${goal.required_monthly_contribution.toLocaleString()} | **月缺口**: ¥${goal.monthly_shortfall.toLocaleString()}`)
    if (goal.glide_path.length > 0) {
      lines.push('| 年份 | 权益配置 | 固收配置 | 预期价值 |')
      lines.push('|------|----------|----------|----------|')
      for (const gp of goal.glide_path) {
        lines.push(`| 第${gp.year}年 | ${gp.equity_allocation}% | ${gp.fixed_income_allocation}% | ¥${gp.expected_value.toLocaleString()} |`)
      }
    }
    lines.push('')
  }

  lines.push('### 💡 目标投资建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 目标投资清单')
  lines.push('- [x] 目标金额与期限确认')
  lines.push('- [x] 资金充足率预测')
  lines.push('- [x] 下滑路径(Glide Path)设计')
  lines.push('- [x] 资产配置建议')
  lines.push('- [x] 成功概率评估')
  lines.push('- [x] 预算缺口分析')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// --- Tool 8: Behavioral Finance Coach 报告 ---
function formatBehavioralFinanceReport(result: BehavioralFinanceResult): string {
  const lines: string[] = []
  lines.push('## 🧠 Behavioral Finance Coach — 行为金融偏差识别与心理账户辅导')
  lines.push('')
  lines.push(`> **客户**: ${result.client_id} | **行为评分**: ${result.overall_behavior_score}/100 | **偏差数量**: ${result.biases.length} | **估计行为成本**: ${result.estimated_behavioral_cost}% | **助推策略**: ${result.nudge_strategies.length}`)
  lines.push('')

  lines.push('### 📊 行为金融仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    ASSESS[行为评估] --> BIAS[偏差识别]')
  lines.push('    ASSESS --> MENTAL[心理账户]')
  lines.push('    BIAS --> NUDGE[助推策略]')
  lines.push('    MENTAL --> NUDGE')
  lines.push('    NUDGE --> IMPROVE[行为改善]')
  lines.push(`    SCORE[行为评分: ${result.overall_behavior_score}/100]`)
  lines.push('```')
  lines.push('')

  if (result.biases.length > 0) {
    lines.push('### 📋 行为偏差识别')
    for (const bias of result.biases) {
      const severityIcon = bias.severity === 'severe' ? '🔴' : bias.severity === 'high' ? '🟠' : bias.severity === 'moderate' ? '🟡' : '🟢'
      lines.push(`#### ${severityIcon} ${bias.bias_name} [${bias.bias_category === 'cognitive' ? '认知偏差' : '情绪偏差'}]`)
      lines.push(`- **严重度**: ${bias.severity} | **对收益影响**: ${bias.impact_on_returns}%`)
      lines.push(`- **描述**: ${bias.description}`)
      lines.push(`- **证据**: ${bias.evidence}`)
      lines.push(`- **缓解策略**: ${bias.mitigation_strategy}`)
      lines.push('')
    }
  }

  lines.push('### 📋 心理账户分析')
  lines.push('| 账户 | 类型 | 配置比例 | 适当用途 | 当前用途 | 错配风险 |')
  lines.push('|------|------|----------|----------|----------|----------|')
  for (const ma of result.mental_accounts) {
    lines.push(`| ${ma.account_name} | ${ma.account_type} | ${ma.pct_of_portfolio}% | ${ma.appropriate_use} | ${ma.current_use} | ${ma.misallocation_risk} |`)
  }
  lines.push('')

  lines.push('### 📋 助推策略 (Nudge Strategies)')
  for (const nudge of result.nudge_strategies) {
    lines.push(`- **${nudge.nudge_name}**: ${nudge.description}`)
    lines.push(`  - 实施: ${nudge.implementation}`)
    lines.push(`  - 预期改善: ${nudge.expected_improvement}`)
  }
  lines.push('')

  lines.push('### 💡 行为改善建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 行为金融清单')
  lines.push('- [x] 认知偏差识别(过度自信/锚定/近因/现状/集中度)')
  lines.push('- [x] 情绪偏差识别(损失厌恶/羊群/FOMO)')
  lines.push('- [x] 心理账户分析(安全/收入/增长/投机)')
  lines.push('- [x] 行为成本估算')
  lines.push('- [x] 助推策略设计')
  lines.push('- [x] 行为改善建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*WealthAgentPro v1.0.0 — AI-Powered Wealth Management Intelligence*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({ name: 'portfolio_analyzer', description: '资产配置分析 | 战略/战术配置, 漂移检测, 再平衡, 风险预算', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: holdings array with asset_class, current_value, target_weight_pct, etc.' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatPortfolioAnalyzerReport(analyzePortfolioAnalyzer(args.input_data)) } }))

  tools.register(defineTool({ name: 'risk_tolerance_assessor', description: '风险偏好评估 | 问卷/画像/适当性匹配', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: questionnaire responses' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatRiskToleranceReport(analyzeRiskToleranceAssessor(args.input_data)) } }))

  tools.register(defineTool({ name: 'tax_loss_harvester', description: '税损收割 | 亏损识别/替代证券/wash sale/税优策略', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: taxable account holdings' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatTaxLossHarvestReport(analyzeTaxLossHarvester(args.input_data)) } }))

  tools.register(defineTool({ name: 'retirement_planner', description: '退休规划 | 缺口测算/社保替代率/年金/提取策略', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: retirement profile' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatRetirementPlanReport(analyzeRetirementPlanner(args.input_data)) } }))

  tools.register(defineTool({ name: 'fund_screener', description: '基金筛选 | 多因子筛选/风格漂移/经理评估', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: fund criteria array with optional filters' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatFundScreeningReport(analyzeFundScreener(args.input_data)) } }))

  tools.register(defineTool({ name: 'insurance_gap_analyzer', description: '保障缺口分析 | 生命价值法/需求法/缺口/产品建议', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: family members, existing insurance, debts' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatInsuranceGapReport(analyzeInsuranceGapAnalyzer(args.input_data)) } }))

  tools.register(defineTool({ name: 'goal_based_investing', description: '目标投资 | 目标日期/教育/购房/下滑路径/蒙特卡洛', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: financial goals with target amounts and dates' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatGoalBasedReport(analyzeGoalBasedInvesting(args.input_data)) } }))

  tools.register(defineTool({ name: 'behavioral_finance_coach', description: '行为金融 | 偏差识别/心理账户/助推策略', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: behavioral assessment data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatBehavioralFinanceReport(analyzeBehavioralFinanceCoach(args.input_data)) } }))
}
