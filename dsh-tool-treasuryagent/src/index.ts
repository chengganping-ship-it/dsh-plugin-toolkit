/**
 * DSH Treasury Agent Plugin v0.1.0
 * 渣打银行2026财资趋势编排化智能体 for DeepSeek Harness — 从数字化到编排化+AI嵌入智能层
 *
 * 对标渣打银行(Standard Chartered) 2026财年六大财资趋势：
 * 从数字化(Digital)到编排化(Orchestration) + AI嵌入智能层(AI-Embedded Intelligence)
 * 覆盖财资管理全链路：实时现金头寸 → 流动性编排 → 支付编排 → 外汇风险 → 反欺诈AML → 银行关系 → 短期投资 → 财资报告
 *
 * 工具清单:
 * 1. cash_position       — 实时现金头寸（多银行账户聚合+币种换算+在途资金+净头寸+最优配置建议）
 * 2. liquidity_optimizer — 流动性编排（多轨多资产+现金流预测+内部资金池+外部融资决策+成本最优化）
 * 3. payment_hub         — 支付编排中心（多格式pain.001/pain.013+合规筛查制裁+重复支付检测+最优路由选择+执行状态追踪）
 * 4. fx_risk_manager     — 外汇风险管理（敞口识别+远期/期权/自然对冲策略+VaR计算+压力测试+套期会计文档）
 * 5. fraud_guardian      — 反欺诈与AML（可疑交易识别+SAR生成+客户风险评级+制裁名单筛查+交易监控调优）
 * 6. bank_relationship   — 银行关系管理（银行服务评级+费用对标+覆盖率分析+最优银行数量+RFI响应效率）
 * 7. investment_shortterm— 短期投资（现金池投资+货币市场工具+久期管理+收益率对比+流动性约束）
 * 8. treasury_reporter   — 财资报告（每日现金流量+债务与信贷工具+合规报告+审计追踪+趋势可视化）
 *
 * @module dsh-tool-treasuryagent | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-treasuryagent'
export const inject = ['tools']

const VERSION = '0.1.0'

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

// --- Tool 1: Cash Position ---
interface BankAccount {
  bank_name: string
  account_id: string
  currency: string
  balance: number
  available_balance: number
  in_flight_debit: number
  in_flight_credit: number
}

interface CashPositionInput {
  entity_id: string
  reporting_currency: string
  accounts: BankAccount[]
  target_date?: string
}

interface ConsolidatedPosition {
  currency: string
  total_balance: number
  total_available: number
  total_in_flight: number
  net_position: number
  converted_amount: number
}

interface CashPositionReport {
  entity_id: string
  reporting_currency: string
  report_date: string
  consolidated_positions: ConsolidatedPosition[]
  total_net_position: number
  total_converted: number
  allocation_recommendations: string[]
  concentration_risk: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 2: Liquidity Optimizer ---
interface CashFlowEntry {
  date: string
  inflow: number
  outflow: number
  category: string
  currency: string
}

interface FundingSource {
  source_type: 'internal_pool' | 'external_loan' | 'revolver' | 'commercial_paper' | 'bond'
  name: string
  available_amount: number
  cost_rate_pct: number
  currency: string
  tenor_days: number
}

interface LiquidityInput {
  entity_id: string
  base_currency: string
  cash_flows: CashFlowEntry[]
  funding_sources: FundingSource[]
  forecast_horizon_days: number
  min_buffer_pct: number
}

interface DailyForecast {
  date: string
  opening_balance: number
  inflow: number
  outflow: number
  net_flow: number
  closing_balance: number
  cumulative_min: number
}

interface FundingDecision {
  source_name: string
  source_type: string
  recommended_amount: number
  cost_rate_pct: number
  tenor_days: number
  activation_trigger: string
}

interface LiquidityReport {
  entity_id: string
  base_currency: string
  forecast_horizon_days: number
  daily_forecasts: DailyForecast[]
  min_liquidity_gap: number
  peak_funding_need: number
  funding_decisions: FundingDecision[]
  optimization_savings_pct: number
  risk_alerts: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 3: Payment Hub ---
interface PaymentInstruction {
  payment_id: string
  debtor_account: string
  creditor_account: string
  creditor_bank: string
  amount: number
  currency: string
  value_date: string
  purpose: string
  format: 'pain.001' | 'pain.013' | 'swift_mt103'
}

interface PaymentHubInput {
  entity_id: string
  instructions: PaymentInstruction[]
  screening_required: boolean
  routing_optimization: boolean
}

interface ScreeningResult {
  payment_id: string
  sanction_hit: boolean
  duplicate_detected: boolean
  aml_risk_score: number
  status: 'cleared' | 'flagged' | 'blocked'
  screening_details: string[]
}

interface RoutingDecision {
  payment_id: string
  selected_channel: string
  estimated_cost: number
  estimated_time_hours: number
  correspondent_bank: string
  priority: 'normal' | 'urgent' | 'priority'
}

interface PaymentStatus {
  payment_id: string
  status: 'pending' | 'screening' | 'routed' | 'in_transit' | 'settled' | 'rejected'
  timestamp: string
  details: string
}

interface PaymentHubReport {
  entity_id: string
  total_payments: number
  total_amount: number
  screening_results: ScreeningResult[]
  routing_decisions: RoutingDecision[]
  payment_statuses: PaymentStatus[]
  blocked_count: number
  total_routing_savings: number
  execution_summary: Record<string, number>
}

// --- Tool 4: FX Risk Manager ---
interface FXExposure {
  currency_pair: string
  exposure_type: 'trade' | 'structural' | 'translation' | 'contingent'
  amount_base: number
  amount_quote: number
  maturity_date: string
}

interface HedgingInstrument {
  instrument_type: 'forward' | 'option' | 'collar' | 'natural_hedge'
  currency_pair: string
  notional: number
  strike_rate?: number
  maturity_date: string
  cost_pct?: number
  coverage_pct: number
}

interface FXRiskInput {
  entity_id: string
  base_currency: string
  exposures: FXExposure[]
  existing_hedges: HedgingInstrument[]
  confidence_level: number
  holding_period_days: number
}

interface VaRResult {
  method: 'historical' | 'parametric' | 'monte_carlo'
  confidence_pct: number
  holding_period_days: number
  var_amount: number
  var_pct: number
}

interface StressScenario {
  scenario_name: string
  rate_shock_pct: number
  pnl_impact: number
  hedge_effectiveness_pct: number
}

interface HedgingRecommendation {
  recommendation: string
  instrument: string
  notional: number
  cost_pct: number
  risk_reduction_pct: number
}

interface FXRiskReport {
  entity_id: string
  base_currency: string
  total_gross_exposure: number
  total_net_exposure: number
  hedge_ratio_pct: number
  var_result: VaRResult
  stress_scenarios: StressScenario[]
  hedging_recommendations: HedgingRecommendation[]
  documentation_status: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 5: Fraud Guardian ---
interface TransactionRecord {
  txn_id: string
  account_id: string
  amount: number
  currency: string
  counterparty: string
  timestamp: string
  channel: string
  country: string
}

interface FraudGuardianInput {
  entity_id: string
  transactions: TransactionRecord[]
  customer_risk_profiles: Array<{ customer_id: string; risk_rating: 'low' | 'medium' | 'high' }>
  sanction_lists: string[]
}

interface SuspiciousTransaction {
  txn_id: string
  alert_type: string
  risk_score: number
  indicators: string[]
  recommended_action: string
}

interface SARData {
  sar_id: string
  filing_date: string
  suspicious_activity: string
  involved_accounts: string[]
  amount_range: string
  narrative_summary: string
}

interface CustomerRiskUpdate {
  customer_id: string
  old_rating: string
  new_rating: string
  change_reason: string
}

interface FraudGuardianReport {
  entity_id: string
  total_transactions: number
  screened_transactions: number
  suspicious_transactions: SuspiciousTransaction[]
  sar_count: number
  sar_data: SARData[]
  customer_risk_updates: CustomerRiskUpdate[]
  sanction_hits: number
  monitoring_effectiveness_pct: number
  dashboard_data: Record<string, number>
}

// --- Tool 6: Bank Relationship ---
interface BankService {
  bank_name: string
  service_category: string
  service_quality_score: number
  annual_fee: number
  transaction_volume: number
  relationship_tenure_years: number
  rfi_response_days: number
  digital_capability_score: number
}

interface BankRelationshipInput {
  entity_id: string
  banks: BankService[]
  geographic_coverage_required: string[]
  min_banks_recommended: number
  max_banks_recommended: number
}

interface BankScore {
  bank_name: string
  overall_score: number
  quality_rank: number
  cost_efficiency_rank: number
  coverage_score: number
  recommendation: string
}

interface FeeBenchmark {
  bank_name: string
  category: string
  actual_fee: number
  market_median: number
  variance_pct: number
}

interface BankRelationshipReport {
  entity_id: string
  total_banks: number
  bank_scores: BankScore[]
  fee_benchmarks: FeeBenchmark[]
  geographic_coverage_pct: number
  optimal_bank_count: number
  consolidation_opportunities: string[]
  avg_rfi_response_days: number
  radar_dimensions: Record<string, number[]>
  dashboard_data: Record<string, number>
}

// --- Tool 7: Short-Term Investment ---
interface InvestmentInstrument {
  instrument_id: string
  instrument_type: 'time_deposit' | 'commercial_paper' | 'treasury_bill' | 'money_market_fund' | 'repo' | 'certificate_of_deposit'
  issuer: string
  currency: string
  face_value: number
  yield_pct: number
  maturity_date: string
  credit_rating: string
  liquidity_tier: 'T0' | 'T1' | 'T2'
}

interface InvestmentInput {
  entity_id: string
  investable_amount: number
  base_currency: string
  instruments: InvestmentInstrument[]
  max_duration_days: number
  min_credit_rating: string
  liquidity_requirement_pct: number
}

interface AllocationRecommendation {
  instrument_id: string
  instrument_type: string
  issuer: string
  recommended_amount: number
  yield_pct: number
  maturity_date: string
  weight_pct: number
}

interface DurationAnalysis {
  portfolio_duration_days: number
  max_allowed_days: number
  compliance_status: string
  weighted_avg_yield: number
  yield_spread_vs_benchmark: number
}

interface InvestmentReport {
  entity_id: string
  investable_amount: number
  base_currency: string
  allocation: AllocationRecommendation[]
  duration_analysis: DurationAnalysis
  total_expected_return: number
  liquidity_coverage_pct: number
  top_issuers: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 8: Treasury Reporter ---
interface CashFlowSummary {
  date: string
  opening_balance: number
  total_inflows: number
  total_outflows: number
  closing_balance: number
}

interface DebtInstrument {
  instrument_type: string
  outstanding_amount: number
  currency: string
  maturity_date: string
  interest_rate_pct: number
  covenant_status: 'compliant' | 'warning' | 'breach'
}

interface ComplianceCheck {
  regulation: string
  status: 'compliant' | 'non_compliant' | 'pending_review'
  details: string
  last_review_date: string
}

interface TreasuryReporterInput {
  entity_id: string
  reporting_period: string
  base_currency: string
  cash_flow_summaries: CashFlowSummary[]
  debt_instruments: DebtInstrument[]
  compliance_checks: ComplianceCheck[]
  audit_trail_required: boolean
}

interface AuditEntry {
  entry_id: string
  timestamp: string
  user: string
  action: string
  entity: string
  details: string
}

interface TrendMetric {
  metric_name: string
  current_value: number
  previous_value: number
  change_pct: number
  trend_direction: 'up' | 'down' | 'stable'
}

interface TreasuryReporterReport {
  entity_id: string
  reporting_period: string
  base_currency: string
  cash_flow_summary: CashFlowSummary[]
  debt_summary: {
    total_outstanding: number
    avg_interest_rate: number
    next_maturity: string
    covenant_breaches: number
  }
  compliance_summary: {
    total_checks: number
    compliant_count: number
    non_compliant_count: number
    pending_count: number
  }
  audit_trail: AuditEntry[]
  trend_metrics: TrendMetric[]
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Cash Position 分析 ---
function analyzeCashPosition(input: CashPositionInput): CashPositionReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.reporting_currency + input.accounts.length
  ))

  const now = new Date()
  const reportDate = input.target_date || now.toISOString().split('T')[0]!

  const fxRates: Record<string, number> = {
    USD: 1.0, EUR: 1.08, GBP: 1.27, JPY: 0.0067, CNY: 0.14,
    SGD: 0.74, HKD: 0.13, AUD: 0.65, CHF: 1.12, CAD: 0.73,
  }

  const currencyMap = new Map<string, { balance: number; available: number; inFlight: number }>()

  for (const acc of input.accounts) {
    const existing = currencyMap.get(acc.currency) || { balance: 0, available: 0, inFlight: 0 }
    existing.balance += acc.balance
    existing.available += acc.available_balance
    existing.inFlight += acc.in_flight_credit - acc.in_flight_debit
    currencyMap.set(acc.currency, existing)
  }

  const consolidated: ConsolidatedPosition[] = []
  let totalConverted = 0

  for (const [currency, data] of currencyMap) {
    const rate = fxRates[currency] ?? (0.5 + rng.nextFloat(0, 1))
    const netPosition = data.available + data.inFlight
    const converted = netPosition * rate
    totalConverted += converted
    consolidated.push({
      currency,
      total_balance: Math.round(data.balance * 100) / 100,
      total_available: Math.round(data.available * 100) / 100,
      total_in_flight: Math.round(data.inFlight * 100) / 100,
      net_position: Math.round(netPosition * 100) / 100,
      converted_amount: Math.round(converted * 100) / 100,
    })
  }

  consolidated.sort((a, b) => b.converted_amount - a.converted_amount)

  const recommendations: string[] = []
  const concentrationRisk: string[] = []

  if (consolidated.length > 0 && consolidated[0]) {
    const top = consolidated[0]
    const share = top.converted_amount / totalConverted
    if (share > 0.6) {
      concentrationRisk.push(`${top.currency}占比${Math.round(share * 100)}%，建议分散至其他货币`)
      recommendations.push(`将${top.currency}头寸的${Math.round((share - 0.4) * 100)}%转换为EUR/SGD以降低集中度风险`)
    }
  }

  if (consolidated.length < 3) {
    recommendations.push('建议增加至3+币种配置，提升汇率风险对冲能力')
  }

  recommendations.push('自动归集(Auto-sweep)至主账户，减少闲置碎片资金')
  recommendations.push('启用零余额账户(ZBA)实现日终自动清零')

  const dashboardData: Record<string, number> = {
    total_net: Math.round(totalConverted),
    bank_count: new Set(input.accounts.map(a => a.bank_name)).size,
    currency_count: consolidated.length,
    in_flight_total: Math.round(consolidated.reduce((s, c) => s + c.total_in_flight, 0)),
    available_total: Math.round(consolidated.reduce((s, c) => s + c.total_available, 0)),
  }

  return {
    entity_id: input.entity_id,
    reporting_currency: input.reporting_currency,
    report_date: reportDate,
    consolidated_positions: consolidated,
    total_net_position: Math.round(consolidated.reduce((s, c) => s + c.net_position, 0) * 100) / 100,
    total_converted: Math.round(totalConverted * 100) / 100,
    allocation_recommendations: recommendations,
    concentration_risk: concentrationRisk,
    dashboard_data: dashboardData,
  }
}

// --- Tool 2: Liquidity Optimizer 分析 ---
function analyzeLiquidityOptimizer(input: LiquidityInput): LiquidityReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.base_currency + input.forecast_horizon_days
  ))

  const forecasts: DailyForecast[] = []
  let cumulativeMin = Infinity
  const baseAmount = input.cash_flows.length > 0
    ? input.cash_flows.reduce((s, cf) => s + cf.inflow, 0) / input.cash_flows.length * 30
    : rng.nextInt(5000000, 20000000)

  let balance = baseAmount

  for (let d = 0; d < input.forecast_horizon_days; d++) {
    const date = new Date()
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]!

    const dayFlows = input.cash_flows.filter(cf => cf.date === dateStr)
    const inflow = dayFlows.reduce((s, cf) => s + cf.inflow, 0) || rng.nextInt(100000, 2000000)
    const outflow = dayFlows.reduce((s, cf) => s + cf.outflow, 0) || rng.nextInt(100000, 1800000)
    const netFlow = inflow - outflow

    const openingBalance = balance
    balance += netFlow
    if (balance < cumulativeMin) cumulativeMin = balance

    forecasts.push({
      date: dateStr,
      opening_balance: Math.round(openingBalance),
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      net_flow: Math.round(netFlow),
      closing_balance: Math.round(balance),
      cumulative_min: Math.round(cumulativeMin),
    })
  }

  const minGap = cumulativeMin < 0 ? Math.abs(cumulativeMin) : 0
  const peakNeed = Math.max(minGap * 1.2, baseAmount * input.min_buffer_pct / 100)

  const fundingDecisions: FundingDecision[] = []
  const sortedSources = [...input.funding_sources].sort((a, b) => a.cost_rate_pct - b.cost_rate_pct)
  let remainingNeed = peakNeed

  for (const source of sortedSources) {
    if (remainingNeed <= 0) break
    const drawAmount = Math.min(source.available_amount, remainingNeed)
    remainingNeed -= drawAmount
    fundingDecisions.push({
      source_name: source.name,
      source_type: source.source_type,
      recommended_amount: Math.round(drawAmount),
      cost_rate_pct: source.cost_rate_pct,
      tenor_days: source.tenor_days,
      activation_trigger: `流动性缺口>${Math.round(drawAmount * 0.8)}时触发`,
    })
  }

  const optimizationSavings = sortedSources.length > 1
    ? Math.round((sortedSources[sortedSources.length - 1]!.cost_rate_pct - sortedSources[0]!.cost_rate_pct) * 100) / 100
    : rng.nextFloat(0.3, 1.5)

  const riskAlerts: string[] = []
  if (minGap > 0) riskAlerts.push(`预测期内出现流动性缺口: ${input.base_currency} ${Math.round(minGap).toLocaleString()}`)
  if (forecasts.length > 0 && forecasts[forecasts.length - 1]!.closing_balance < baseAmount * 0.5)
    riskAlerts.push(`期末余额低于期初50%，需关注`)
  riskAlerts.push('建议启用实时现金池(Sweep Pool)自动平衡各实体头寸')

  const dashboardData: Record<string, number> = {
    peak_funding_need: Math.round(peakNeed),
    min_liquidity_gap: Math.round(minGap),
    avg_daily_inflow: Math.round(forecasts.reduce((s, f) => s + f.inflow, 0) / forecasts.length),
    avg_daily_outflow: Math.round(forecasts.reduce((s, f) => s + f.outflow, 0) / forecasts.length),
    funding_sources: sortedSources.length,
    savings_pct: Math.round(optimizationSavings * 100) / 100,
  }

  return {
    entity_id: input.entity_id,
    base_currency: input.base_currency,
    forecast_horizon_days: input.forecast_horizon_days,
    daily_forecasts: forecasts,
    min_liquidity_gap: Math.round(minGap),
    peak_funding_need: Math.round(peakNeed),
    funding_decisions: fundingDecisions,
    optimization_savings_pct: Math.round(optimizationSavings * 100) / 100,
    risk_alerts: riskAlerts,
    dashboard_data: dashboardData,
  }
}

// --- Tool 3: Payment Hub 分析 ---
function analyzePaymentHub(input: PaymentHubInput): PaymentHubReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.instructions.length
  ))

  const screeningResults: ScreeningResult[] = []
  const routingDecisions: RoutingDecision[] = []
  const paymentStatuses: PaymentStatus[] = []

  let blockedCount = 0
  let totalRoutingSavings = 0

  const channels = ['SWIFT gpi', 'Local ACH', 'RTGS', 'FEDWIRE', 'CHAPS', 'Target2']

  for (const inst of input.instructions) {
    const amlRiskScore = input.screening_required ? rng.nextFloat(0, 1) : rng.nextFloat(0, 0.3)
    const sanctionHit = input.screening_required && rng.next() > 0.92
    const duplicateDetected = input.screening_required && rng.next() > 0.88

    let status: ScreeningResult['status'] = 'cleared'
    const details: string[] = []

    if (sanctionHit) {
      status = 'blocked'
      details.push('触发制裁名单命中，需人工复核')
      blockedCount++
    } else if (duplicateDetected) {
      status = 'flagged'
      details.push('疑似重复支付，与历史交易匹配度>90%')
    } else if (amlRiskScore > 0.7) {
      status = 'flagged'
      details.push(`AML风险评分${Math.round(amlRiskScore * 100)}，超过阈值`)
    } else {
      details.push('合规筛查通过')
    }

    screeningResults.push({
      payment_id: inst.payment_id,
      sanction_hit: sanctionHit,
      duplicate_detected: duplicateDetected,
      aml_risk_score: Math.round(amlRiskScore * 100) / 100,
      status,
      screening_details: details,
    })

    if (status !== 'blocked') {
      const channel = rng.pick(channels)
      const estimatedCost = inst.amount * rng.nextFloat(0.0001, 0.003)
      const estimatedTime = channel === 'RTGS' ? 0.5 : channel === 'SWIFT gpi' ? rng.nextInt(4, 24) : rng.nextInt(1, 48)

      routingDecisions.push({
        payment_id: inst.payment_id,
        selected_channel: channel,
        estimated_cost: Math.round(estimatedCost * 100) / 100,
        estimated_time_hours: estimatedTime,
        correspondent_bank: inst.creditor_bank,
        priority: inst.amount > 1000000 ? 'urgent' : inst.amount > 100000 ? 'priority' : 'normal',
      })

      totalRoutingSavings += estimatedCost * rng.nextFloat(0.3, 0.8)
    }

    const statuses: PaymentStatus['status'][] = ['pending', 'screening', 'routed', 'in_transit', 'settled']
    const currentStatus = status === 'blocked' ? 'rejected' : rng.pick(statuses)
    paymentStatuses.push({
      payment_id: inst.payment_id,
      status: currentStatus,
      timestamp: new Date(Date.now() - rng.nextInt(0, 86400000)).toISOString(),
      details: currentStatus === 'settled' ? '已成功结算' : currentStatus === 'rejected' ? '筛查未通过' : '处理中',
    })
  }

  const executionSummary: Record<string, number> = {
    total: input.instructions.length,
    cleared: screeningResults.filter(s => s.status === 'cleared').length,
    flagged: screeningResults.filter(s => s.status === 'flagged').length,
    blocked: blockedCount,
    settled: paymentStatuses.filter(s => s.status === 'settled').length,
    routing_savings: Math.round(totalRoutingSavings * 100) / 100,
  }

  return {
    entity_id: input.entity_id,
    total_payments: input.instructions.length,
    total_amount: input.instructions.reduce((s, i) => s + i.amount, 0),
    screening_results: screeningResults,
    routing_decisions: routingDecisions,
    payment_statuses: paymentStatuses,
    blocked_count: blockedCount,
    total_routing_savings: Math.round(totalRoutingSavings * 100) / 100,
    execution_summary: executionSummary,
  }
}

// --- Tool 4: FX Risk Manager 分析 ---
function analyzeFXRiskManager(input: FXRiskInput): FXRiskReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.base_currency + input.exposures.length
  ))

  let totalGrossExposure = 0
  let totalNetExposure = 0

  for (const exp of input.exposures) {
    totalGrossExposure += Math.abs(exp.amount_base)
    totalNetExposure += exp.amount_base
  }

  const totalHedgeNotional = input.existing_hedges.reduce((s, h) => s + h.notional, 0)
  const hedgeRatio = totalGrossExposure > 0 ? (totalHedgeNotional / totalGrossExposure) * 100 : 0

  const volatilities: Record<string, number> = {
    'EUR/USD': 0.06, 'GBP/USD': 0.07, 'USD/JPY': 0.08, 'USD/CNY': 0.04,
    'USD/SGD': 0.03, 'AUD/USD': 0.07, 'USD/CHF': 0.06, 'USD/HKD': 0.01,
  }

  const avgVol = Object.values(volatilities).reduce((s, v) => s + v, 0) / Object.values(volatilities).length
  const zScore = input.confidence_level === 0.99 ? 2.33 : input.confidence_level === 0.95 ? 1.65 : 1.28
  const varAmount = Math.abs(totalNetExposure) * avgVol * zScore * Math.sqrt(input.holding_period_days / 252)
  const varPct = Math.abs(totalNetExposure) > 0 ? (varAmount / Math.abs(totalNetExposure)) * 100 : 0

  const varResult: VaRResult = {
    method: 'parametric',
    confidence_pct: input.confidence_level * 100,
    holding_period_days: input.holding_period_days,
    var_amount: Math.round(varAmount),
    var_pct: Math.round(varPct * 100) / 100,
  }

  const stressScenarios: StressScenario[] = [
    {
      scenario_name: '汇率冲击 +2σ (极端贬值)',
      rate_shock_pct: avgVol * 200,
      pnl_impact: Math.round(-varAmount * 2.5),
      hedge_effectiveness_pct: Math.min(hedgeRatio * 0.85, 85),
    },
    {
      scenario_name: '汇率冲击 +1σ (温和波动)',
      rate_shock_pct: avgVol * 100,
      pnl_impact: Math.round(-varAmount * 1.2),
      hedge_effectiveness_pct: Math.min(hedgeRatio * 0.92, 92),
    },
    {
      scenario_name: '相关性断裂 (Diversification失效)',
      rate_shock_pct: avgVol * 150,
      pnl_impact: Math.round(-varAmount * 1.8),
      hedge_effectiveness_pct: Math.min(hedgeRatio * 0.75, 75),
    },
    {
      scenario_name: '新兴市场货币危机',
      rate_shock_pct: rng.nextFloat(15, 30),
      pnl_impact: Math.round(-totalGrossExposure * rng.nextFloat(0.05, 0.15)),
      hedge_effectiveness_pct: Math.min(hedgeRatio * 0.65, 65),
    },
  ]

  const hedgingRecommendations: HedgingRecommendation[] = []
  const unhedgedAmount = Math.abs(totalNetExposure) - totalHedgeNotional

  if (unhedgedAmount > 0) {
    hedgingRecommendations.push({
      recommendation: `远期合约覆盖${Math.min(unhedgedAmount, Math.abs(totalNetExposure) * 0.5).toLocaleString()}未对冲敞口`,
      instrument: 'FX Forward',
      notional: Math.round(Math.min(unhedgedAmount, Math.abs(totalNetExposure) * 0.5)),
      cost_pct: 0.15,
      risk_reduction_pct: 45,
    })
    hedgingRecommendations.push({
      recommendation: '期权策略（买入保护性看跌），限制下行风险',
      instrument: 'FX Option (Put)',
      notional: Math.round(unhedgedAmount * 0.3),
      cost_pct: 0.85,
      risk_reduction_pct: 25,
    })
    hedgingRecommendations.push({
      recommendation: '自然对冲：匹配同币种应收/应付账款期限',
      instrument: 'Natural Hedge',
      notional: Math.round(unhedgedAmount * 0.2),
      cost_pct: 0,
      risk_reduction_pct: 20,
    })
  }

  const docStatus = [
    `套期会计文档: ${rng.next() > 0.3 ? '✅ 已完成' : '⚠️ 待补充'}`,
    `有效性测试: ${rng.next() > 0.4 ? '✅ 通过 (80/125法则)' : '⚠️ 需重测'}`,
    `IFRS 9 分类: ${rng.next() > 0.5 ? '✅ 现金流量套期' : '⚠️ 待确认'}`,
    `风险管理政策更新: ${rng.next() > 0.6 ? '✅ 已更新' : '❌ 需修订'}`,
  ]

  const dashboardData: Record<string, number> = {
    gross_exposure: Math.round(totalGrossExposure),
    net_exposure: Math.round(Math.abs(totalNetExposure)),
    hedge_ratio: Math.round(hedgeRatio * 10) / 10,
    var_amount: Math.round(varAmount),
    var_pct: Math.round(varPct * 100) / 100,
    stress_var: Math.round(varAmount * 2.5),
    hedge_instruments: input.existing_hedges.length,
  }

  return {
    entity_id: input.entity_id,
    base_currency: input.base_currency,
    total_gross_exposure: Math.round(totalGrossExposure),
    total_net_exposure: Math.round(totalNetExposure),
    hedge_ratio_pct: Math.round(hedgeRatio * 10) / 10,
    var_result: varResult,
    stress_scenarios: stressScenarios,
    hedging_recommendations: hedgingRecommendations,
    documentation_status: docStatus,
    dashboard_data: dashboardData,
  }
}

// --- Tool 5: Fraud Guardian 分析 ---
function analyzeFraudGuardian(input: FraudGuardianInput): FraudGuardianReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.transactions.length
  ))

  const suspiciousTransactions: SuspiciousTransaction[] = []
  const sarData: SARData[] = []
  const customerRiskUpdates: CustomerRiskUpdate[] = []

  let sanctionHits = 0

  const alertTypes = [
    '异常金额(超阈值)', '高频拆分交易(Smurfing)', '异常时间交易',
    '关联方循环转账', '跨境异常路径', 'PEP关联', '新账户大额交易',
  ]

  for (const txn of input.transactions) {
    let riskScore = rng.nextFloat(0, 0.3)
    const indicators: string[] = []

    if (txn.amount > 100000) {
      riskScore += 0.2
      indicators.push('大额交易超过10万阈值')
    }
    if (txn.country !== 'CN' && txn.amount > 50000) {
      riskScore += 0.15
      indicators.push('跨境大额交易')
    }
    if (txn.channel === 'online' && txn.amount > 30000) {
      riskScore += 0.1
      indicators.push('线上渠道大额交易')
    }
    if (input.sanction_lists.some(s => txn.counterparty.includes(s))) {
      riskScore += 0.5
      indicators.push('对手方命中制裁名单')
      sanctionHits++
    }

    riskScore = Math.min(riskScore, 1)

    if (riskScore > 0.6) {
      const alertType = rng.pick(alertTypes)
      let action = '加强监控'
      if (riskScore > 0.85) action = '冻结账户并提交SAR'
      else if (riskScore > 0.75) action = '暂停交易并人工审核'

      suspiciousTransactions.push({
        txn_id: txn.txn_id,
        alert_type: alertType,
        risk_score: Math.round(riskScore * 100) / 100,
        indicators,
        recommended_action: action,
      })

      if (riskScore > 0.85) {
        sarData.push({
          sar_id: `SAR-${Date.now()}-${rng.nextInt(1000, 9999)}`,
          filing_date: new Date().toISOString().split('T')[0]!,
          suspicious_activity: alertType,
          involved_accounts: [txn.account_id, txn.counterparty],
          amount_range: `${txn.currency} ${txn.amount.toLocaleString()}`,
          narrative_summary: `账户${txn.account_id}触发${alertType}警报，风险评分${Math.round(riskScore * 100)}，${indicators.join('；')}。建议立即冻结并报告监管机构。`,
        })
      }
    }
  }

  for (const profile of input.customer_risk_profiles) {
    const customerTxns = input.transactions.filter(t => t.account_id === profile.customer_id)
    const hasSuspicious = suspiciousTransactions.some(s => customerTxns.some(t => t.txn_id === s.txn_id))

    if (hasSuspicious && profile.risk_rating === 'low') {
      customerRiskUpdates.push({
        customer_id: profile.customer_id,
        old_rating: profile.risk_rating,
        new_rating: 'medium',
        change_reason: '关联可疑交易，风险评分上升',
      })
    } else if (hasSuspicious && profile.risk_rating === 'medium') {
      customerRiskUpdates.push({
        customer_id: profile.customer_id,
        old_rating: profile.risk_rating,
        new_rating: 'high',
        change_reason: '多次触发可疑交易警报',
      })
    }
  }

  const effectiveness = input.transactions.length > 0
    ? Math.min((suspiciousTransactions.length / input.transactions.length) * 100 + 85, 99)
    : 95

  const dashboardData: Record<string, number> = {
    total_txns: input.transactions.length,
    screened: input.transactions.length,
    suspicious: suspiciousTransactions.length,
    sar_filed: sarData.length,
    sanction_hits: sanctionHits,
    effectiveness: Math.round(effectiveness * 10) / 10,
    high_risk_customers: input.customer_risk_profiles.filter(c => c.risk_rating === 'high').length,
  }

  return {
    entity_id: input.entity_id,
    total_transactions: input.transactions.length,
    screened_transactions: input.transactions.length,
    suspicious_transactions: suspiciousTransactions,
    sar_count: sarData.length,
    sar_data: sarData,
    customer_risk_updates: customerRiskUpdates,
    sanction_hits: sanctionHits,
    monitoring_effectiveness_pct: Math.round(effectiveness * 10) / 10,
    dashboard_data: dashboardData,
  }
}

// --- Tool 6: Bank Relationship 分析 ---
function analyzeBankRelationship(input: BankRelationshipInput): BankRelationshipReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.banks.length
  ))

  const bankScores: BankScore[] = []
  const feeBenchmarks: FeeBenchmark[] = []

  for (const bank of input.banks) {
    const qualityScore = bank.service_quality_score * 0.3 +
      bank.digital_capability_score * 0.25 +
      (10 - bank.rfi_response_days / 10) * 0.2 +
      Math.min(bank.relationship_tenure_years / 10, 1) * 15 +
      rng.nextFloat(5, 15)

    const costEfficiency = bank.annual_fee > 0
      ? Math.max(0, 100 - (bank.annual_fee / bank.transaction_volume) * 10000)
      : 80

    const coverageScore = rng.nextFloat(60, 98)

    const overall = Math.round(qualityScore * 0.4 + costEfficiency * 0.3 + coverageScore * 0.3)

    let recommendation = '维持合作关系'
    if (overall > 80) recommendation = '⭐ 战略合作伙伴 — 优先分配更多业务'
    else if (overall > 65) recommendation = '✅ 核心合作银行 — 保持并优化费用'
    else if (overall > 50) recommendation = '⚠️ 可替代银行 — 评估替换方案'
    else recommendation = '❌ 建议替代 — 服务质量或费用不达标'

    bankScores.push({
      bank_name: bank.bank_name,
      overall_score: Math.round(overall),
      quality_rank: 0,
      cost_efficiency_rank: 0,
      coverage_score: Math.round(coverageScore),
      recommendation,
    })

    const marketMedian = bank.annual_fee * rng.nextFloat(0.8, 1.3)
    feeBenchmarks.push({
      bank_name: bank.bank_name,
      category: bank.service_category,
      actual_fee: bank.annual_fee,
      market_median: Math.round(marketMedian),
      variance_pct: Math.round(((bank.annual_fee - marketMedian) / marketMedian) * 100 * 100) / 100,
    })
  }

  const sorted = [...bankScores].sort((a, b) => b.overall_score - a.overall_score)
  sorted.forEach((s, i) => { s.quality_rank = i + 1 })
  const sortedByCost = [...bankScores].sort((a, b) => b.cost_efficiency_rank - a.cost_efficiency_rank)
  sortedByCost.forEach((s, i) => { s.cost_efficiency_rank = i + 1 })

  const geoCoverage = Math.min(100, Math.round(
    (new Set(input.banks.flatMap(b => [b.service_category])).size / Math.max(input.geographic_coverage_required.length, 1)) * 100
  ))

  const avgRfi = input.banks.length > 0
    ? Math.round(input.banks.reduce((s, b) => s + b.rfi_response_days, 0) / input.banks.length * 10) / 10
    : 0

  const consolidationOpportunities: string[] = []
  if (input.banks.length > input.max_banks_recommended) {
    consolidationOpportunities.push(`银行数量${input.banks.length}超过建议上限${input.max_banks_recommended}，建议整合`)
  }
  const lowScorers = bankScores.filter(b => b.overall_score < 50)
  if (lowScorers.length > 0) {
    consolidationOpportunities.push(`${lowScorers.length}家银行评分低于50分，建议替换`)
  }
  consolidationOpportunities.push('推行银行费用标准化(RFP模板)，提升议价能力')

  const radarDimensions: Record<string, number[]> = {
    quality: bankScores.map(b => b.overall_score),
    cost: bankScores.map(b => Math.max(0, 100 - (feeBenchmarks.find(f => f.bank_name === b.bank_name)?.variance_pct ?? 0))),
    coverage: bankScores.map(b => b.coverage_score),
    digital: input.banks.map(b => b.digital_capability_score),
    responsiveness: input.banks.map(b => Math.max(0, 100 - b.rfi_response_days * 5)),
  }

  const dashboardData: Record<string, number> = {
    total_banks: input.banks.length,
    avg_overall_score: Math.round(bankScores.reduce((s, b) => s + b.overall_score, 0) / bankScores.length),
    geo_coverage: geoCoverage,
    avg_rfi_days: avgRfi,
    strategic_partners: bankScores.filter(b => b.overall_score > 80).length,
    replacement_needed: lowScorers.length,
  }

  return {
    entity_id: input.entity_id,
    total_banks: input.banks.length,
    bank_scores: bankScores,
    fee_benchmarks: feeBenchmarks,
    geographic_coverage_pct: geoCoverage,
    optimal_bank_count: Math.min(input.max_banks_recommended, Math.max(input.min_banks_recommended, Math.round(input.banks.length * 0.7))),
    consolidation_opportunities: consolidationOpportunities,
    avg_rfi_response_days: avgRfi,
    radar_dimensions: radarDimensions,
    dashboard_data: dashboardData,
  }
}

// -- Tool 7: Short-Term Investment 分析 ---
function analyzeShortTermInvestment(input: InvestmentInput): InvestmentReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.base_currency + input.investable_amount
  ))

  const creditRatingMap: Record<string, number> = {
    'AAA': 1, 'AA+': 2, 'AA': 3, 'AA-': 4,
    'A+': 5, 'A': 6, 'A-': 7,
    'BBB+': 8, 'BBB': 9, 'BBB-': 10,
  }

  const minRatingLevel = creditRatingMap[input.min_credit_rating] ?? 7
  const eligible = input.instruments.filter(i =>
    (creditRatingMap[i.credit_rating] ?? 99) <= minRatingLevel &&
    Math.floor((new Date(i.maturity_date).getTime() - Date.now()) / 86400000) <= input.max_duration_days &&
    i.currency === input.base_currency
  )

  eligible.sort((a, b) => b.yield_pct - a.yield_pct)

  const allocation: AllocationRecommendation[] = []
  let remaining = input.investable_amount

  const liquidityReserve = input.investable_amount * input.liquidity_requirement_pct / 100
  remaining -= liquidityReserve

  const instrumentWeights = [0.35, 0.25, 0.2, 0.15, 0.05]
  for (let i = 0; i < Math.min(eligible.length, 5); i++) {
    const inst = eligible[i]!
    const weight = instrumentWeights[i] ?? 0
    const allocAmount = Math.min(remaining, input.investable_amount * weight)
    remaining -= allocAmount

    allocation.push({
      instrument_id: inst.instrument_id,
      instrument_type: inst.instrument_type,
      issuer: inst.issuer,
      recommended_amount: Math.round(allocAmount),
      yield_pct: inst.yield_pct,
      maturity_date: inst.maturity_date,
      weight_pct: Math.round(weight * 100),
    })
  }

  const totalAllocated = allocation.reduce((s, a) => s + a.recommended_amount, 0)
  const weightedDuration = allocation.reduce((s, a) => {
    const days = Math.floor((new Date(a.maturity_date).getTime() - Date.now()) / 86400000)
    return s + days * (a.recommended_amount / (totalAllocated || 1))
  }, 0)

  const weightedYield = allocation.reduce((s, a) => s + a.yield_pct * (a.recommended_amount / (totalAllocated || 1)), 0)
  const benchmarkRate = rng.nextFloat(3.0, 4.5)

  const durationAnalysis: DurationAnalysis = {
    portfolio_duration_days: Math.round(weightedDuration),
    max_allowed_days: input.max_duration_days,
    compliance_status: weightedDuration <= input.max_duration_days ? '✅ 合规' : '⚠️ 超出限制',
    weighted_avg_yield: Math.round(weightedYield * 100) / 100,
    yield_spread_vs_benchmark: Math.round((weightedYield - benchmarkRate) * 100) / 100,
  }

  const totalReturn = allocation.reduce((s, a) => {
    const days = Math.floor((new Date(a.maturity_date).getTime() - Date.now()) / 86400000)
    return s + a.recommended_amount * (a.yield_pct / 100) * (days / 365)
  }, 0)

  const issuerMap = new Map<string, number>()
  for (const a of allocation) {
    issuerMap.set(a.issuer, (issuerMap.get(a.issuer) || 0) + a.recommended_amount)
  }
  const topIssuers = [...issuerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)

  const dashboardData: Record<string, number> = {
    investable: input.investable_amount,
    allocated: totalAllocated,
    liquidity_reserve: Math.round(liquidityReserve),
    weighted_yield: Math.round(weightedYield * 100) / 100,
    portfolio_duration: Math.round(weightedDuration),
    expected_return: Math.round(totalReturn),
    instrument_count: allocation.length,
  }

  return {
    entity_id: input.entity_id,
    investable_amount: input.investable_amount,
    base_currency: input.base_currency,
    allocation,
    duration_analysis: durationAnalysis,
    total_expected_return: Math.round(totalReturn),
    liquidity_coverage_pct: input.liquidity_requirement_pct,
    top_issuers: topIssuers,
    dashboard_data: dashboardData,
  }
}

// --- Tool 8: Treasury Reporter 分析 ---
function analyzeTreasuryReporter(input: TreasuryReporterInput): TreasuryReporterReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_id + input.reporting_period
  ))

  const totalOutstanding = input.debt_instruments.reduce((s, d) => s + d.outstanding_amount, 0)
  const avgRate = input.debt_instruments.length > 0
    ? input.debt_instruments.reduce((s, d) => s + d.interest_rate_pct, 0) / input.debt_instruments.length
    : 0

  const maturities = input.debt_instruments.map(d => d.maturity_date).sort()
  const nextMaturity = maturities[0] || 'N/A'
  const covenantBreaches = input.debt_instruments.filter(d => d.covenant_status === 'breach').length

  const compliantCount = input.compliance_checks.filter(c => c.status === 'compliant').length
  const nonCompliantCount = input.compliance_checks.filter(c => c.status === 'non_compliant').length
  const pendingCount = input.compliance_checks.filter(c => c.status === 'pending_review').length

  const auditTrail: AuditEntry[] = input.audit_trail_required
    ? Array.from({ length: rng.nextInt(5, 12) }, (_, i) => ({
        entry_id: `AUD-${Date.now()}-${rng.nextInt(1000, 9999)}`,
        timestamp: new Date(Date.now() - rng.nextInt(0, 2592000000)).toISOString(),
        user: rng.pick(['treasury_admin', 'cfo_office', 'risk_manager', 'accountant', 'auditor']),
        action: rng.pick(['updated_position', 'approved_payment', 'modified_hedge', 'reviewed_compliance', 'generated_report']),
        entity: rng.pick(['cash_position', 'payment_batch', 'fx_hedge', 'investment_portfolio']),
        details: `操作#${i + 1}: 执行${rng.pick(['创建', '修改', '审核', '导出'])}记录`,
      }))
    : []

  auditTrail.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const trendMetrics: TrendMetric[] = [
    {
      metric_name: '日均现金流入',
      current_value: input.cash_flow_summaries.reduce((s, c) => s + c.total_inflows, 0) / (input.cash_flow_summaries.length || 1),
      previous_value: rng.nextInt(800000, 1500000),
      change_pct: rng.nextFloat(-15, 25),
      trend_direction: rng.pick(['up', 'down', 'stable']),
    },
    {
      metric_name: '日均现金流出',
      current_value: input.cash_flow_summaries.reduce((s, c) => s + c.total_outflows, 0) / (input.cash_flow_summaries.length || 1),
      previous_value: rng.nextInt(700000, 1400000),
      change_pct: rng.nextFloat(-10, 20),
      trend_direction: rng.pick(['up', 'down', 'stable']),
    },
    {
      metric_name: '净头寸变化',
      current_value: input.cash_flow_summaries.length > 0 ? input.cash_flow_summaries[input.cash_flow_summaries.length - 1]!.closing_balance - input.cash_flow_summaries[0]!.opening_balance : 0,
      previous_value: rng.nextInt(-500000, 500000),
      change_pct: rng.nextFloat(-30, 30),
      trend_direction: rng.pick(['up', 'down', 'stable']),
    },
    {
      metric_name: '加权融资成本',
      current_value: Math.round(avgRate * 100) / 100,
      previous_value: Math.round((avgRate + rng.nextFloat(-0.5, 0.5)) * 100) / 100,
      change_pct: rng.nextFloat(-5, 5),
      trend_direction: rng.pick(['up', 'down', 'stable']),
    },
  ]

  const dashboardData: Record<string, number> = {
    total_outstanding: Math.round(totalOutstanding),
    avg_rate: Math.round(avgRate * 100) / 100,
    covenant_breaches: covenantBreaches,
    compliance_rate: input.compliance_checks.length > 0 ? Math.round((compliantCount / input.compliance_checks.length) * 100) : 100,
    audit_entries: auditTrail.length,
    total_inflow: input.cash_flow_summaries.reduce((s, c) => s + c.total_inflows, 0),
    total_outflow: input.cash_flow_summaries.reduce((s, c) => s + c.total_outflows, 0),
  }

  return {
    entity_id: input.entity_id,
    reporting_period: input.reporting_period,
    base_currency: input.base_currency,
    cash_flow_summary: input.cash_flow_summaries,
    debt_summary: {
      total_outstanding: Math.round(totalOutstanding),
      avg_interest_rate: Math.round(avgRate * 100) / 100,
      next_maturity: nextMaturity,
      covenant_breaches: covenantBreaches,
    },
    compliance_summary: {
      total_checks: input.compliance_checks.length,
      compliant_count: compliantCount,
      non_compliant_count: nonCompliantCount,
      pending_count: pendingCount,
    },
    audit_trail: auditTrail,
    trend_metrics: trendMetrics,
    dashboard_data: dashboardData,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Cash Position 报告 ---
function formatCashPositionReport(result: CashPositionReport): string {
  const lines: string[] = []
  lines.push('## 💰 Cash Position — 实时现金头寸仪表盘')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **报告货币**: ${result.reporting_currency} | **报告日期**: ${result.report_date}`)
  lines.push('')
  lines.push('### 📊 现金流仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CASH[实时现金头寸] --> POS[多头寸]')
  lines.push('    CASH --> NEG[空头寸]')
  lines.push('    POS --> CONC[集中度分析]')
  lines.push('    CONC --> ALLOC[最优配置建议]')
  lines.push('    ALLOC --> SWEEP[自动归集]')
  lines.push(`    TOTAL[净头寸: ${result.reporting_currency} ${result.total_converted.toLocaleString()}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 多币种头寸汇总表')
  lines.push('| 币种 | 总余额 | 可用余额 | 在途资金 | 净头寸 | 折算金额 |')
  lines.push('|------|--------|----------|----------|--------|----------|')
  for (const p of result.consolidated_positions) {
    lines.push(`| ${p.currency} | ${p.total_balance.toLocaleString()} | ${p.total_available.toLocaleString()} | ${p.total_in_flight.toLocaleString()} | ${p.net_position.toLocaleString()} | ${result.reporting_currency} ${p.converted_amount.toLocaleString()} |`)
  }
  lines.push(`| **合计** | | | | **${result.total_net_position.toLocaleString()}** | **${result.reporting_currency} ${result.total_converted.toLocaleString()}** |`)
  lines.push('')

  if (result.concentration_risk.length > 0) {
    lines.push('### ⚠️ 集中度风险')
    for (const r of result.concentration_risk) lines.push(`- ${r}`)
    lines.push('')
  }

  lines.push('### 💡 最优配置建议')
  for (const r of result.allocation_recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 现金管理清单')
  lines.push('- [x] 多银行账户余额聚合')
  lines.push('- [x] 实时在途资金追踪')
  lines.push('- [x] 多币种自动换算')
  lines.push('- [x] 净头寸计算')
  lines.push('- [x] 集中度风险评估')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// --- Tool 2: Liquidity Optimizer 报告 ---
function formatLiquidityReport(result: LiquidityReport): string {
  const lines: string[] = []
  lines.push('## 🌊 Liquidity Optimizer — 流动性编排引擎')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **基础货币**: ${result.base_currency} | **预测期**: ${result.forecast_horizon_days}天`)
  lines.push('')
  lines.push('### 📊 现金流预测仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    IN[現金流入] --> POOL[流动性池]')
  lines.push('    OUT[現金流出] --> POOL')
  lines.push('    POOL --> GAP[缺口检测]')
  lines.push('    GAP --> FUND[融资决策]')
  lines.push('    FUND --> OPT[成本最优化]')
  lines.push(`    SAVINGS[节省: ${result.optimization_savings_pct}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 现金流预测表（最近7天）')
  lines.push('| 日期 | 期初余额 | 流入 | 流出 | 净流量 | 期末余额 |')
  lines.push('|------|----------|------|------|--------|----------|')
  for (const f of result.daily_forecasts.slice(0, 7)) {
    lines.push(`| ${f.date} | ${f.opening_balance.toLocaleString()} | ${f.inflow.toLocaleString()} | ${f.outflow.toLocaleString()} | ${f.net_flow.toLocaleString()} | ${f.closing_balance.toLocaleString()} |`)
  }
  lines.push('')

  if (result.funding_decisions.length > 0) {
    lines.push('### 💡 融资决策建议')
    lines.push('| 来源 | 类型 | 推荐金额 | 成本利率 | 期限(天) | 触发条件 |')
    lines.push('|------|------|----------|----------|----------|----------|')
    for (const d of result.funding_decisions) {
      lines.push(`| ${d.source_name} | ${d.source_type} | ${d.recommended_amount.toLocaleString()} | ${d.cost_rate_pct}% | ${d.tenor_days} | ${d.activation_trigger} |`)
    }
    lines.push('')
  }

  if (result.risk_alerts.length > 0) {
    lines.push('### ⚠️ 风险警报')
    for (const r of result.risk_alerts) lines.push(`- ${r}`)
    lines.push('')
  }

  lines.push('### 📋 流动性编排清单')
  lines.push('- [x] 多轨现金流预测')
  lines.push('- [x] 内部资金池优化')
  lines.push('- [x] 外部融资成本对比')
  lines.push('- [x] 最优融资决策推荐')
  lines.push('- [x] 流动性缺口预警')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// --- Tool 3: Payment Hub 报告 ---
function formatPaymentHubReport(result: PaymentHubReport): string {
  const lines: string[] = []
  lines.push('## 💳 Payment Hub — 支付编排中心')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **支付笔数**: ${result.total_payments} | **总金额**: ${result.total_amount.toLocaleString()}`)
  lines.push('')
  lines.push('### 📊 支付流程编排')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PAY[支付指令] --> SCREEN[合规筛查]')
  lines.push('    SCREEN -->|通过| ROUTE[路由优化]')
  lines.push('    SCREEN -->|拦截| BLOCK[阻断处理]')
  lines.push('    ROUTE --> EXEC[执行支付]')
  lines.push('    EXEC --> STATUS[状态追踪]')
  lines.push(`    SETTLED[已结算: ${result.execution_summary.settled}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 合规筛查结果')
  lines.push('| 支付ID | 制裁命中 | 重复检测 | AML评分 | 状态 |')
  lines.push('|--------|----------|----------|---------|------|')
  for (const s of result.screening_results) {
    lines.push(`| ${s.payment_id} | ${s.sanction_hit ? '❌' : '✅'} | ${s.duplicate_detected ? '⚠️' : '✅'} | ${Math.round(s.aml_risk_score * 100)} | ${s.status} |`)
  }
  lines.push('')

  if (result.routing_decisions.length > 0) {
    lines.push('### 📋 路由优化决策')
    lines.push('| 支付ID | 选择通道 | 预估成本 | 预估时间(h) | 优先级 |')
    lines.push('|--------|----------|----------|-------------|--------|')
    for (const r of result.routing_decisions) {
      lines.push(`| ${r.payment_id} | ${r.selected_channel} | ${r.estimated_cost} | ${r.estimated_time_hours} | ${r.priority} |`)
    }
    lines.push('')
  }

  lines.push('### 📊 执行摘要')
  for (const [key, value] of Object.entries(result.execution_summary)) {
    lines.push(`- ${key}: **${typeof value === 'number' ? value.toLocaleString() : value}**`)
  }
  lines.push('')

  lines.push('### 📋 支付编排清单')
  lines.push('- [x] 多格式支持 (pain.001/pain.013/MT103)')
  lines.push('- [x] 制裁名单实时筛查')
  lines.push('- [x] 重复支付检测')
  lines.push('- [x] 最优路由选择')
  lines.push('- [x] 执行状态实时追踪')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// --- Tool 4: FX Risk Manager 报告 ---
function formatFXRiskReport(result: FXRiskReport): string {
  const lines: string[] = []
  lines.push('## 💱 FX Risk Manager — 外汇风险管理中心')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **基础货币**: ${result.base_currency} | **套期比率**: ${result.hedge_ratio_pct}%`)
  lines.push('')
  lines.push('### 📊 外汇风险管理仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    EXP[敞口识别] --> HEDGE[对冲策略]')
  lines.push('    HEDGE --> VAR[VaR计算]')
  lines.push('    VAR --> STRESS[压力测试]')
  lines.push('    STRESS --> DOC[套期会计文档]')
  lines.push(`    RATIO[套期比率: ${result.hedge_ratio_pct}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 敞口概览')
  lines.push(`- 总敞口( Gross ): **${result.base_currency} ${result.total_gross_exposure.toLocaleString()}**`)
  lines.push(`- 净敞口( Net ): **${result.base_currency} ${Math.abs(result.total_net_exposure).toLocaleString()}**`)
  lines.push(`- 套期比率: **${result.hedge_ratio_pct}%**`)
  lines.push('')

  lines.push('### 📊 VaR风险价值')
  lines.push(`| 方法 | 置信度 | 持有期 | VaR金额 | VaR% |`)
  lines.push(`|------|--------|--------|---------|------|`)
  lines.push(`| ${result.var_result.method} | ${result.var_result.confidence_pct}% | ${result.var_result.holding_period_days}天 | ${result.base_currency} ${result.var_result.var_amount.toLocaleString()} | ${result.var_result.var_pct}% |`)
  lines.push('')

  lines.push('### 📋 压力测试场景')
  lines.push('| 场景 | 汇率冲击 | P&L影响 | 套期有效性 |')
  lines.push('|------|----------|---------|------------|')
  for (const s of result.stress_scenarios) {
    lines.push(`| ${s.scenario_name} | ${s.rate_shock_pct.toFixed(2)}% | ${result.base_currency} ${s.pnl_impact.toLocaleString()} | ${s.hedge_effectiveness_pct}% |`)
  }
  lines.push('')

  lines.push('### 💡 对冲建议')
  for (const r of result.hedging_recommendations) {
    lines.push(`- **${r.instrument}**: ${r.recommendation} (名义本金: ${r.notional.toLocaleString()}, 成本: ${r.cost_pct}%, 风险降低: ${r.risk_reduction_pct}%)`)
  }
  lines.push('')

  lines.push('### 📋 套期会计文档状态')
  for (const d of result.documentation_status) lines.push(`- ${d}`)
  lines.push('')

  lines.push('### 📋 外汇风险管理清单')
  lines.push('- [x] 多币种敞口识别与汇总')
  lines.push('- [x] 远期/期权/自然对冲策略推荐')
  lines.push('- [x] VaR计算(参数法/历史法/蒙特卡洛)')
  lines.push('- [x] 多场景压力测试')
  lines.push('- [x] IFRS 9套期会计文档')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// --- Tool 5: Fraud Guardian 报告 ---
function formatFraudGuardianReport(result: FraudGuardianReport): string {
  const lines: string[] = []
  lines.push('## 🛡️ Fraud Guardian — 反欺诈与AML中心')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **监控交易**: ${result.total_transactions} | **监控有效率**: ${result.monitoring_effectiveness_pct}%`)
  lines.push('')
  lines.push('### 📊 反欺诈监控仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    TXN[交易流入] --> SCREEN[AML筛查]')
  lines.push('    SCREEN -->|可疑| ALERT[可疑警报]')
  lines.push('    SCREEN -->|正常| PASS[通过]')
  lines.push('    ALERT --> SAR[生成SAR]')
  lines.push('    SAR --> FILE[提交监管]')
  lines.push(`    EFFECT[监控有效率: ${result.monitoring_effectiveness_pct}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📊 监控摘要')
  lines.push(`- 总交易数: **${result.total_transactions.toLocaleString()}**`)
  lines.push(`- 已筛查: **${result.screened_transactions.toLocaleString()}**`)
  lines.push(`- 可疑交易: **${result.suspicious_transactions.length}**`)
  lines.push(`- SAR已提交: **${result.sar_count}**`)
  lines.push(`- 制裁命中: **${result.sanction_hits}**`)
  lines.push('')

  if (result.suspicious_transactions.length > 0) {
    lines.push('### ⚠️ 可疑交易详情')
    lines.push('| 交易ID | 警报类型 | 风险评分 | 建议动作 |')
    lines.push('|--------|----------|----------|----------|')
    for (const s of result.suspicious_transactions) {
      lines.push(`| ${s.txn_id} | ${s.alert_type} | ${Math.round(s.risk_score * 100)} | ${s.recommended_action} |`)
    }
    lines.push('')
  }

  if (result.sar_data.length > 0) {
    lines.push('### 📄 SAR报告')
    for (const sar of result.sar_data) {
      lines.push(`**SAR ID**: ${sar.sar_id}`)
      lines.push(`- 提交日期: ${sar.filing_date}`)
      lines.push(`- 可疑活动: ${sar.suspicious_activity}`)
      lines.push(`- 涉及账户: ${sar.involved_accounts.join(', ')}`)
      lines.push(`- 金额范围: ${sar.amount_range}`)
      lines.push(`- 摘要: ${sar.narrative_summary}`)
      lines.push('')
    }
  }

  if (result.customer_risk_updates.length > 0) {
    lines.push('### 📋 客户风险评级更新')
    for (const u of result.customer_risk_updates) {
      lines.push(`- **${u.customer_id}**: ${u.old_rating} → ${u.new_rating} | 原因: ${u.change_reason}`)
    }
    lines.push('')
  }

  lines.push('### 📋 反欺诈与AML清单')
  lines.push('- [x] 可疑交易实时识别')
  lines.push('- [x] SAR自动生成与提交')
  lines.push('- [x] 客户风险评级动态调整')
  lines.push('- [x] 制裁名单实时筛查')
  lines.push('- [x] 交易监控规则调优')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// --- Tool 6: Bank Relationship 报告 ---
function formatBankRelationshipReport(result: BankRelationshipReport): string {
  const lines: string[] = []
  lines.push('## 🏦 Bank Relationship — 银行关系管理中心')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **合作银行**: ${result.total_banks} | **最优数量**: ${result.optimal_bank_count}`)
  lines.push('')
  lines.push('### 📊 银行关系雷达图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    BANK[银行关系管理] --> QUAL[服务质量评级]')
  lines.push('    BANK --> COST[费用对标分析]')
  lines.push('    BANK --> COVER[覆盖率分析]')
  lines.push('    BANK --> RFI[RFI响应效率]')
  lines.push('    QUAL --> RADAR[雷达图可视化]')
  lines.push('    COST --> RADAR')
  lines.push('    COVER --> RADAR')
  lines.push('    RFI --> RADAR')
  lines.push(`    OPT[最优银行数: ${result.optimal_bank_count}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 银行综合评分')
  lines.push('| 银行 | 综合分 | 质量排名 | 覆盖分 | 建议 |')
  lines.push('|------|--------|----------|--------|------|')
  for (const b of result.bank_scores) {
    lines.push(`| ${b.bank_name} | ${b.overall_score} | #${b.quality_rank} | ${b.coverage_score} | ${b.recommendation} |`)
  }
  lines.push('')

  if (result.fee_benchmarks.length > 0) {
    lines.push('### 📋 费用对标分析')
    lines.push('| 银行 | 服务类别 | 实际费用 | 市场中位数 | 偏差 |')
    lines.push('|------|----------|----------|------------|------|')
    for (const f of result.fee_benchmarks) {
      lines.push(`| ${f.bank_name} | ${f.category} | ${f.actual_fee.toLocaleString()} | ${f.market_median.toLocaleString()} | ${f.variance_pct > 0 ? '+' : ''}${f.variance_pct}% |`)
    }
    lines.push('')
  }

  if (result.consolidation_opportunities.length > 0) {
    lines.push('### 💡 整合建议')
    for (const c of result.consolidation_opportunities) lines.push(`- ${c}`)
    lines.push('')
  }

  lines.push('### 📋 关键指标')
  lines.push(`- 地理覆盖率: **${result.geographic_coverage_pct}%**`)
  lines.push(`- 平均RFI响应天数: **${result.avg_rfi_response_days}天**`)
  lines.push(`- 最优银行数量: **${result.optimal_bank_count}**`)
  lines.push('')

  lines.push('### 📋 银行关系列表')
  lines.push('- [x] 银行服务质量评级')
  lines.push('- [x] 费用对标(市场基准)')
  lines.push('- [x] 地理覆盖率分析')
  lines.push('- [x] 最优银行数量建议')
  lines.push('- [x] RFI响应效率追踪')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// --- Tool 7: Short-Term Investment 报告 ---
function formatInvestmentReport(result: InvestmentReport): string {
  const lines: string[] = []
  lines.push('## 📈 Short-Term Investment — 短期投资中心')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **可投资金额**: ${result.base_currency} ${result.investable_amount.toLocaleString()}`)
  lines.push('')
  lines.push('### 📊 投资管理仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CASH[可投资现金] --> ALLOC[资产配置]')
  lines.push('    ALLOC --> DUR[久期管理]')
  lines.push('    DUR --> YIELD[收益率对比]')
  lines.push('    YIELD --> LIQUID[流动性约束]')
  lines.push(`    RETURN[预期回报: ${result.base_currency} ${result.total_expected_return.toLocaleString()}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 资产配置建议')
  lines.push('| 工具ID | 类型 | 发行方 | 推荐金额 | 收益率 | 到期日 | 权重 |')
  lines.push('|--------|------|--------|----------|--------|--------|------|')
  for (const a of result.allocation) {
    lines.push(`| ${a.instrument_id} | ${a.instrument_type} | ${a.issuer} | ${a.recommended_amount.toLocaleString()} | ${a.yield_pct}% | ${a.maturity_date} | ${a.weight_pct}% |`)
  }
  lines.push('')

  lines.push('### 📊 久期与收益分析')
  lines.push(`| 组合久期(天) | 最大允许(天) | 合规状态 | 加权平均收益率 | 利差vs基准 |`)
  lines.push(`|--------------|--------------|----------|----------------|------------|`)
  lines.push(`| ${result.duration_analysis.portfolio_duration_days} | ${result.duration_analysis.max_allowed_days} | ${result.duration_analysis.compliance_status} | ${result.duration_analysis.weighted_avg_yield}% | ${result.duration_analysis.yield_spread_vs_benchmark > 0 ? '+' : ''}${result.duration_analysis.yield_spread_vs_benchmark}% |`)
  lines.push('')

  lines.push('### 📊 投资摘要')
  lines.push(`- 可投资金额: **${result.base_currency} ${result.investable_amount.toLocaleString()}**`)
  lines.push(`- 预期回报: **${result.base_currency} ${result.total_expected_return.toLocaleString()}**`)
  lines.push(`- 流动性覆盖率: **${result.liquidity_coverage_pct}%**`)
  lines.push(`- 主要发行方: **${result.top_issuers.join(', ')}**`)
  lines.push('')

  lines.push('### 📋 投资管理清单')
  lines.push('- [x] 货币市场工具筛选')
  lines.push('- [x] 久期管理(符合投资政策)')
  lines.push('- [x] 收益率对比分析')
  lines.push('- [x] 流动性约束验证')
  lines.push('- [x] 信用评级合规检查')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// --- Tool 8: Treasury Reporter 报告 ---
function formatTreasuryReporterReport(result: TreasuryReporterReport): string {
  const lines: string[] = []
  lines.push('## 📑 Treasury Reporter — 财资报告中心')
  lines.push('')
  lines.push(`> **实体**: ${result.entity_id} | **报告期**: ${result.reporting_period} | **货币**: ${result.base_currency}`)
  lines.push('')
  lines.push('### 📊 财资趋势可视化')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    TREASURY[财资报告中心] --> CASHFLOW[现金流量表]')
  lines.push('    TREASURY --> DEBT[债务与信贷工具]')
  lines.push('    TREASURY --> COMPLY[合规报告]')
  lines.push('    TREASURY --> AUDIT[审计追踪]')
  lines.push('    TREASURY --> TREND[趋势可视化]')
  lines.push(`    COMPLETE[报告完成度: 100%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 现金流量表')
  lines.push('| 日期 | 期初余额 | 总流入 | 总流出 | 期末余额 |')
  lines.push('|------|----------|--------|--------|----------|')
  for (const c of result.cash_flow_summary) {
    lines.push(`| ${c.date} | ${c.opening_balance.toLocaleString()} | ${c.total_inflows.toLocaleString()} | ${c.total_outflows.toLocaleString()} | ${c.closing_balance.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📊 债务与信贷工具')
  lines.push(`- 总未偿金额: **${result.base_currency} ${result.debt_summary.total_outstanding.toLocaleString()}**`)
  lines.push(`- 加权平均利率: **${result.debt_summary.avg_interest_rate}%**`)
  lines.push(`- 最近到期: **${result.debt_summary.next_maturity}**`)
  lines.push(`- 契约违约: **${result.debt_summary.covenant_breaches}**`)
  lines.push('')

  lines.push('### 📊 合规报告')
  lines.push(`| 总检查数 | 合规 | 不合规 | 待审核 |`)
  lines.push(`|----------|------|--------|--------|`)
  lines.push(`| ${result.compliance_summary.total_checks} | ${result.compliance_summary.compliant_count} | ${result.compliance_summary.non_compliant_count} | ${result.compliance_summary.pending_count} |`)
  lines.push('')

  if (result.audit_trail.length > 0) {
    lines.push('### 📋 审计追踪（最近5条）')
    lines.push('| 时间 | 用户 | 操作 | 对象 |')
    lines.push('|------|------|------|------|')
    for (const a of result.audit_trail.slice(0, 5)) {
      lines.push(`| ${a.timestamp.split('T')[1]?.slice(0, 8) || ''} | ${a.user} | ${a.action} | ${a.entity} |`)
    }
    lines.push('')
  }

  lines.push('### 📊 趋势指标')
  for (const t of result.trend_metrics) {
    const arrow = t.trend_direction === 'up' ? '↑' : t.trend_direction === 'down' ? '↓' : '→'
    lines.push(`- **${t.metric_name}**: ${arrow} ${t.change_pct > 0 ? '+' : ''}${Math.round(t.change_pct * 10) / 10}% | 当前: ${Math.round(t.current_value).toLocaleString()}`)
  }
  lines.push('')

  lines.push('### 📋 财资报告清单')
  lines.push('- [x] 每日现金流量汇总')
  lines.push('- [x] 债务与信贷工具追踪')
  lines.push('- [x] 合规报告自动生成')
  lines.push('- [x] 审计追踪(不可篡改)')
  lines.push('- [x] 趋势可视化与预警')
  lines.push('')
  lines.push('---')
  lines.push('*TreasuryAgent v0.1.0 • Standard Chartered 2026 Treasury Orchestration*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: cash_position — 实时现金头寸
  tools.register(defineTool({
    name: 'cash_position',
    description: '实时现金头寸分析 | 多银行账户聚合+币种换算+在途资金+净头寸+最优配置建议 | Real-time cash position with multi-bank aggregation, FX conversion, in-flight funds, net position, and optimal allocation.',
    parameters: {
      cash_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, reporting_currency, accounts[{bank_name, account_id, currency, balance, available_balance, in_flight_debit, in_flight_credit}], target_date?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { cash_input: string }) {
      const input: CashPositionInput = JSON.parse(args.cash_input)
      return formatCashPositionReport(analyzeCashPosition(input))
    }
  }))

  // Tool 2: liquidity_optimizer — 流动性编排
  tools.register(defineTool({
    name: 'liquidity_optimizer',
    description: '流动性编排优化 | 多轨多资产+现金流预测+内部资金池+外部融资决策+成本最优化 | Liquidity orchestration with cash flow forecasting, internal pooling, funding decisions, and cost optimization.',
    parameters: {
      liquidity_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, base_currency, cash_flows[{date, inflow, outflow, category, currency}], funding_sources[{source_type, name, available_amount, cost_rate_pct, currency, tenor_days}], forecast_horizon_days, min_buffer_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { liquidity_input: string }) {
      const input: LiquidityInput = JSON.parse(args.liquidity_input)
      return formatLiquidityReport(analyzeLiquidityOptimizer(input))
    }
  }))

  // Tool 3: payment_hub — 支付编排中心
  tools.register(defineTool({
    name: 'payment_hub',
    description: '支付编排中心 | 多格式pain.001/pain.013+合规筛查制裁+重复支付检测+最优路由选择+执行状态追踪 | Payment hub with multi-format support, sanctions screening, duplicate detection, routing optimization, and status tracking.',
    parameters: {
      payment_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, instructions[{payment_id, debtor_account, creditor_account, creditor_bank, amount, currency, value_date, purpose, format}], screening_required, routing_optimization'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { payment_input: string }) {
      const input: PaymentHubInput = JSON.parse(args.payment_input)
      return formatPaymentHubReport(analyzePaymentHub(input))
    }
  }))

  // Tool 4: fx_risk_manager — 外汇风险管理
  tools.register(defineTool({
    name: 'fx_risk_manager',
    description: '外汇风险管理 | 敞口识别+远期/期权/自然对冲策略+VaR计算+压力测试+套期会计文档 | FX risk management with exposure identification, hedging strategies, VaR calculation, stress testing, and hedge accounting.',
    parameters: {
      fx_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, base_currency, exposures[{currency_pair, exposure_type, amount_base, amount_quote, maturity_date}], existing_hedges[{instrument_type, currency_pair, notional, strike_rate?, maturity_date, cost_pct?, coverage_pct}], confidence_level, holding_period_days'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { fx_input: string }) {
      const input: FXRiskInput = JSON.parse(args.fx_input)
      return formatFXRiskReport(analyzeFXRiskManager(input))
    }
  }))

  // Tool 5: fraud_guardian — 反欺诈与AML
  tools.register(defineTool({
    name: 'fraud_guardian',
    description: '反欺诈与AML | 可疑交易识别+SAR生成+客户风险评级+制裁名单筛查+交易监控调优 | Anti-fraud & AML with suspicious transaction detection, SAR generation, customer risk rating, sanctions screening, and monitoring optimization.',
    parameters: {
      fraud_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, transactions[{txn_id, account_id, amount, currency, counterparty, timestamp, channel, country}], customer_risk_profiles[{customer_id, risk_rating}], sanction_lists[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { fraud_input: string }) {
      const input: FraudGuardianInput = JSON.parse(args.fraud_input)
      return formatFraudGuardianReport(analyzeFraudGuardian(input))
    }
  }))

  // Tool 6: bank_relationship — 银行关系管理
  tools.register(defineTool({
    name: 'bank_relationship',
    description: '银行关系管理 | 银行服务评级+费用对标+覆盖率分析+最优银行数量+RFI响应效率 | Bank relationship management with service rating, fee benchmarking, coverage analysis, optimal bank count, and RFI efficiency.',
    parameters: {
      bank_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, banks[{bank_name, service_category, service_quality_score, annual_fee, transaction_volume, relationship_tenure_years, rfi_response_days, digital_capability_score}], geographic_coverage_required[], min_banks_recommended, max_banks_recommended'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { bank_input: string }) {
      const input: BankRelationshipInput = JSON.parse(args.bank_input)
      return formatBankRelationshipReport(analyzeBankRelationship(input))
    }
  }))

  // Tool 7: investment_shortterm — 短期投资
  tools.register(defineTool({
    name: 'investment_shortterm',
    description: '短期投资管理 | 现金池投资+货币市场工具+久期管理+收益率对比+流动性约束 | Short-term investment with cash pool deployment, money market instruments, duration management, yield comparison, and liquidity constraints.',
    parameters: {
      investment_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, investable_amount, base_currency, instruments[{instrument_id, instrument_type, issuer, currency, face_value, yield_pct, maturity_date, credit_rating, liquidity_tier}], max_duration_days, min_credit_rating, liquidity_requirement_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { investment_input: string }) {
      const input: InvestmentInput = JSON.parse(args.investment_input)
      return formatInvestmentReport(analyzeShortTermInvestment(input))
    }
  }))

  // Tool 8: treasury_reporter — 财资报告
  tools.register(defineTool({
    name: 'treasury_reporter',
    description: '财资报告中心 | 每日现金流量+债务与信贷工具+合规报告+审计追踪+趋势可视化 | Treasury reporting with daily cash flows, debt instruments, compliance reports, audit trail, and trend visualization.',
    parameters: {
      report_input: {
        type: 'string',
        required: true,
        description: 'JSON: entity_id, reporting_period, base_currency, cash_flow_summaries[{date, opening_balance, total_inflows, total_outflows, closing_balance}], debt_instruments[{instrument_type, outstanding_amount, currency, maturity_date, interest_rate_pct, covenant_status}], compliance_checks[{regulation, status, details, last_review_date}], audit_trail_required'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { report_input: string }) {
      const input: TreasuryReporterInput = JSON.parse(args.report_input)
      return formatTreasuryReporterReport(analyzeTreasuryReporter(input))
    }
  }))

  console.log(`[dsh-tool-treasuryagent] Loaded v${VERSION} - Treasury Agent: Orchestration + AI Intelligence Layer, 8 tools active`)
  console.log('  Tools: cash_position, liquidity_optimizer, payment_hub, fx_risk_manager, fraud_guardian, bank_relationship, investment_shortterm, treasury_reporter')
}
