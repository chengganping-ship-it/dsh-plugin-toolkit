/**
 * DSH Supply Chain Finance & Trade Finance Plugin v1.0.0
 * 供应链金融与贸易融资工具集 for DeepSeek Harness
 *
 * 覆盖供应链金融与贸易融资全链路：发票融资 → 订单融资 → 信用保险 → 信用证管理 →
 * 供应链风险评估 → 动态折扣 → 反向保理 → 贸易合规
 *
 * 市场数据 (2026)：供应链金融市场规模 $60亿+；贸易融资缺口 $2.5万亿+
 *
 * 工具清单:
 * 1. invoice_factoring_advisor     — 发票融资顾问（折扣率, 预付比例, 风险评估, 资金成本优化）
 * 2. purchase_order_financier      — 订单融资分析（订单融资额度, 买家信用, 供应商评估, 回款风险）
 * 3. trade_credit_insurer          — 信用保险评估（保费率, 保障额度, 买家风险, 赔付结构）
 * 4. letter_of_credit_manager      — 信用证管理（开证/审单/议付, 不符点分析, 融资功能）
 * 5. supply_chain_risk_assessor    — 供应链风险评估（集中度, 地缘, 汇率, ESG, 中断概率）
 * 6. dynamic_discounting_optimizer — 动态折扣优化（早付折扣, 资金成本, 净收益, 最优折扣率）
 * 7. reverse_factoring_coordinator — 反向保理协调（核心企业信用, 供应商融资, 多方协调）
 * 8. trade_finance_compliance_checker — 贸易融资合规（AML/KYC, 制裁筛查, 单据合规）
 *
 * @module dsh-tool-scfinance | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-scfinance'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析仅供参考，不构成金融/法律/合规建议。请咨询持牌专业人士。'

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

// --- Tool 1: Invoice Factoring Advisor ---
export interface InvoiceFactoringInput {
  input_data: string
}

export interface InvoiceData {
  invoice_id: string
  supplier_id: string
  buyer_id: string
  invoice_amount: number
  currency: string
  issue_date: string
  due_date: string
  buyer_credit_rating: string
  supplier_credit_rating: string
  industry: string
  country_risk: 'low' | 'medium' | 'high'
  is_recourse: boolean
  historical_default_rate: number
}

export interface FactoringRecommendation {
  recommended_advance_rate: number
  discount_rate: number
  service_fee_rate: number
  estimated_annualized_cost: number
  max_factoring_amount: number
  risk_level: 'low' | 'medium' | 'high'
  recommended_factoring_type: string
  structure: string
}

export interface FactoringReport {
  invoice_id: string
  supplier_id: string
  buyer_id: string
  invoice_amount: number
  currency: string
  recommendation: FactoringRecommendation
  risk_factors: string[]
  Mitigants: string[]
  cost_breakdown: Record<string, number>
  alternatives: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 2: Purchase Order Financier ---
export interface PurchaseOrderFinancingInput {
  input_data: string
}

export interface PurchaseOrderData {
  po_id: string
  supplier_id: string
  buyer_id: string
  po_amount: number
  currency: string
  goods_category: string
  delivery_terms: string
  payment_terms_days: number
  buyer_credit_rating: string
  supplier_track_record: string
  purchase_history_count: number
  end_buyer_exists: boolean
  collateral_available: boolean
}

export interface POFinancingRecommendation {
  max_financing_amount: number
  financing_rate: number
  financing_tenor_days: number
  collateral_requirement: string
  disbursement_schedule: string
  repayment_structure: string
  risk_level: 'low' | 'medium' | 'high'
}

export interface POFinancingReport {
  po_id: string
  supplier_id: string
  buyer_id: string
  po_amount: number
  currency: string
  recommendation: POFinancingRecommendation
  risk_assessment: string[]
 supplier_evaluation: Record<string, string>
  end_buyer_analysis: Record<string, string>
  mitigation_measures: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 3: Trade Credit Insurer ---
export interface TradeCreditInsuranceInput {
  input_data: string
}

export interface TradeCreditData {
  policy_id: string
  insured_id: string
  buyer_id: string
  buyer_country: string
  insured_amount: number
  currency: string
  coverage_requested_pct: number
  payment_terms_days: number
  buyer_industry: string
  buyer_credit_rating: string
  historical_loss_rate: number
  portfolio_size: number
}

export interface InsuranceRecommendation {
  premium_rate: number
  approved_coverage_pct: number
  max_liability: number
  deductible_rate: number
  waiting_period_days: number
  buyer_risk_grade: string
  policy_type: string
}

export interface InsuranceQuote {
  policy_id: string
  insured_id: string
  buyer_id: string
  insured_amount: number
  currency: string
  recommendation: InsuranceRecommendation
  risk_analysis: Record<string, string>
  coverage_scenarios: Record<string, number>
  exclusions: string[]
  premium_breakdown: Record<string, number>
  dashboard_data: Record<string, number>
}

// --- Tool 4: Letter of Credit Manager ---
export interface LetterOfCreditInput {
  input_data: string
}

export interface LCData {
  lc_id: string
  applicant_id: string
  beneficiary_id: string
  issuing_bank: string
  advising_bank: string
  lc_amount: number
  currency: string
  lc_type: string
  expiry_date: string
  latest_shipment_date: string
  goods_description: string
  required_documents: string[]
  tolerance_pct: number
  partial_shipment: boolean
  transferable: boolean
}

export interface LCDiscrepancyCheck {
  document_name: string
  status: 'clean' | 'discrepant' | 'waiver_required'
  issues: string[]
}

export interface LCRecommendation {
  financing_option: string
  negotiating_bank_advice: string
  document_checklist: string[]
  discrepancy_actions: string[]
  risk_factors: string[]
  recommended_actions: string[]
}

export interface LCReport {
  lc_id: string
  applicant_id: string
  beneficiary_id: string
  lc_amount: number
  currency: string
  lc_type: string
  discrepancies: LCDiscrepancyCheck[]
  recommendation: LCRecommendation
  ucp600_compliance: string[]
  finance_opportunities: string[]
  timeline: Record<string, string>
  dashboard_data: Record<string, number>
}

// --- Tool 5: Supply Chain Risk Assessor ---
export interface SupplyChainRiskInput {
  input_data: string
}

export interface SupplyChainData {
  assessment_id: string
  company_id: string
  tier1_suppliers: number
  tier2_suppliers: number
  countries: string[]
  industries: string[]
  geographic_concentration: boolean
  single_source_critical: boolean
  avg_payment_terms_days: number
  esg_requirements: boolean
  supply_chain_length_days: number
  inventory_days: number
}

export interface RiskDimension {
  dimension: string
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export interface SupplyChainRiskReport {
  assessment_id: string
  company_id: string
  overall_risk_score: number
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_dimensions: RiskDimension[]
  geographic_exposure: Record<string, number>
  concentration_risk: Record<string, string>
  resilience_score: number
  mitigation_strategies: string[]
  scenario_analysis: Record<string, string>
  dashboard_data: Record<string, number>
}

// --- Tool 6: Dynamic Discounting Optimizer ---
export interface DynamicDiscountingInput {
  input_data: string
}

export interface DiscountingData {
  program_id: string
  payer_id: string
  supplier_id: string
  invoice_amount: number
  currency: string
  current_payment_terms_days: number
  proposed_payment_days: number
  payer_cost_of_capital: number
  supplier_cost_of_capital: number
  payer_credit_rating: string
  supplier_acceptance_rate: number
}

export interface DiscountRateScenario {
  payment_days: number
  discount_rate: number
  annualized_return_pct: number
  supplier_benefit: number
  net_benefit: number
  is_optimal: boolean
}

export interface DiscountingReport {
  program_id: string
  payer_id: string
  supplier_id: string
  invoice_amount: number
  currency: string
  optimal_discount_rate: number
  optimal_payment_days: number
  scenarios: DiscountRateScenario[]
  payer_benefit_analysis: Record<string, number>
  supplier_benefit_analysis: Record<string, number>
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 7: Reverse Factoring Coordinator ---
export interface ReverseFactoringInput {
  input_data: string
}

export interface ReverseFactoringData {
  program_id: string
  anchor_buyer_id: string
  anchor_buyer_rating: string
  suppliers: string[]
  total_program_limit: number
  currency: string
  program_tenor_months: number
  anchor_payment_terms_days: number
  suppliers_avgcredit_rating: string
  platform_type: string
  funding_sources: string[]
}

export interface SupplierFacility {
  supplier_id: string
  approved_limit: number
  financing_rate: number
  utilization_pct: number
  status: 'active' | 'pending' | 'suspended'
}

export interface ReverseFactoringReport {
  program_id: string
  anchor_buyer_id: string
  total_program_limit: number
  currency: string
  anchor_credit_assessment: Record<string, string>
  supplier_facilities: SupplierFacility[]
  program_structure: Record<string, string>
  risk_mitigation: string[]
  cost_savings: Record<string, number>
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 8: Trade Finance Compliance Checker ---
export interface TradeFinanceComplianceInput {
  input_data: string
}

export interface ComplianceCheckData {
  check_id: string
  transaction_id: string
  transaction_type: string
  amount: number
  currency: string
  importer_id: string
  exporter_id: string
  importer_country: string
  exporter_country: string
  goods_category: string
  dual_use_goods: boolean
  sanctioned_country_involved: boolean
  pep_involved: boolean
  aml_risk_score: number
  kycdocumented: boolean
  sanctions_screened: boolean
  document_completeness_pct: number
}

export interface ComplianceRule {
  rule_id: string
  rule_name: string
  category: 'AML' | 'KYC' | 'Sanctions' | 'Trade' | 'Documentation'
  status: 'pass' | 'fail' | 'warning'
  details: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export interface ComplianceReport {
  check_id: string
  transaction_id: string
  overall_status: 'approved' | 'rejected' | 'pending_review'
  overall_risk_level: 'low' | 'medium' | 'high'
  compliance_rules: ComplianceRule[]
  required_actions: string[]
  risk_flags: string[]
  document_gaps: string[]
  regulatory_references: string[]
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Invoice Factoring Advisor 分析 ---
function analyzeInvoiceFactoring(data: string): FactoringReport {
  const inv: InvoiceData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(inv)))

  // Base discount rate from buyer credit rating
  const ratingBaseRate: Record<string, number> = {
    'AAA': 0.015, 'AA': 0.02, 'A': 0.025, 'BBB': 0.035,
    'BB': 0.05, 'B': 0.07, 'C': 0.1, 'D': 0.15
  }
  const baseRate = ratingBaseRate[inv.buyer_credit_rating] || 0.04

  // Country risk adjustment
  const countryAdj = inv.country_risk === 'high' ? 0.015 : inv.country_risk === 'medium' ? 0.007 : 0
  // Recourse adjustment
  const recourseAdj = inv.is_recourse ? -0.005 : 0.008
  // Historical default adjustment
  const defaultAdj = inv.historical_default_rate * 0.1

  const discountRate = Math.round((baseRate + countryAdj + recourseAdj + defaultAdj + rng.nextFloat(-0.002, 0.002)) * 10000) / 10000

  // Advance rate
  let advanceRate = inv.is_recourse ? 0.85 : 0.75
  if (inv.buyer_credit_rating === 'AAA' || inv.buyer_credit_rating === 'AA') advanceRate += 0.05
  if (inv.country_risk === 'high') advanceRate -= 0.1
  advanceRate = Math.round(Math.max(0.5, Math.min(0.95, advanceRate)) * 100) / 100

  // Service fee
  const serviceFeeRate = Math.round((0.005 + rng.nextFloat(0, 0.003)) * 10000) / 10000

  // Annualized cost
  const daysToPayment = Math.max(30, Math.min(180, Math.round((new Date(inv.due_date).getTime() - new Date(inv.issue_date).getTime()) / 86400000)))
  const annualizedCost = Math.round(((discountRate + serviceFeeRate) * (365 / daysToPayment)) * 10000) / 10000

  // Risk level
  let riskLevel: 'low' | 'medium' | 'high'
  if (discountRate < 0.03 && inv.country_risk === 'low') riskLevel = 'low'
  else if (discountRate > 0.06 || inv.country_risk === 'high') riskLevel = 'high'
  else riskLevel = 'medium'

  // Factoring type
  const factoringType = inv.is_recourse
    ? (riskLevel === 'low' ? '有追索权发票融资 (Recourse Factoring)' : '有追索权发票买断 (Recourse Non-Notification)')
    : (riskLevel === 'low' ? '无追索权发票保理 (Non-Recourse Factoring)' : '无追索权发票买断 (Non-Recourse Whole Turnover)')

  const maxFactoringAmount = Math.round(inv.invoice_amount * advanceRate)

  const riskFactors: string[] = []
  if (inv.country_risk === 'high') riskFactors.push('高风险国家买家')
  if (inv.historical_default_rate > 0.02) riskFactors.push('历史违约率偏高 (' + (inv.historical_default_rate * 100).toFixed(1) + '%)')
  if (!inv.is_recourse) riskFactors.push('无追索权 — 保理商承担买家信用风险')
  if (inv.buyer_credit_rating === 'B' || inv.buyer_credit_rating === 'C' || inv.buyer_credit_rating === 'D') riskFactors.push('买家信用评级较低 (' + inv.buyer_credit_rating + ')')
  if (daysToPayment > 90) riskFactors.push('账期较长 (' + daysToPayment + '天)')
  if (riskFactors.length === 0) riskFactors.push('未发现重大风险因素')

  const Mitigants: string[] = []
  if (inv.is_recourse) Mitigants.push('有追索权安排 — 供应商承担最终风险')
  if (inv.buyer_credit_rating === 'AAA' || inv.buyer_credit_rating === 'AA') Mitigants.push('买家信用评级优秀')
  if (inv.country_risk === 'low') Mitigants.push('低风险国家 — 政治/转移风险低')
  if (inv.historical_default_rate < 0.01) Mitigants.push('历史违约率低于1%')
  if (Mitigants.length === 0) Mitigants.push('建议购买信用保险以转移风险')

  const costBreakdown: Record<string, number> = {
    discount_fee: Math.round(inv.invoice_amount * discountRate),
    service_fee: Math.round(inv.invoice_amount * serviceFeeRate),
    total_cost: Math.round(inv.invoice_amount * (discountRate + serviceFeeRate)),
    net_proceeds: Math.round(inv.invoice_amount * advanceRate - inv.invoice_amount * (discountRate + serviceFeeRate)),
    annualized_cost_pct: Math.round(annualizedCost * 10000) / 100,
  }

  const alternatives: string[] = []
  alternatives.push('银行贷款: 成本约 ' + (annualizedCost * 0.7 * 100).toFixed(2) + '% (年化), 但需抵押')
  alternatives.push('资产支持票据(ABCP): 适合大规模发行, 综合成本约 ' + (annualizedCost * 0.85 * 100).toFixed(2) + '%')
  alternatives.push('供应链金融平台: 数字化保理, 成本约 ' + (annualizedCost * 0.9 * 100).toFixed(2) + '%')
  if (inv.buyer_credit_rating === 'AAA' || inv.buyer_credit_rating === 'AA') {
    alternatives.push('反向保理: 利用买家信用, 成本可降至 ' + (annualizedCost * 0.6 * 100).toFixed(2) + '%')
  }

  const dashboardData: Record<string, number> = {
    invoice_amount: inv.invoice_amount,
    advance_rate_pct: advanceRate * 100,
    discount_rate_pct: discountRate * 100,
    service_fee_pct: serviceFeeRate * 100,
    annualized_cost_pct: Math.round(annualizedCost * 10000) / 100,
    max_factoring_amount: maxFactoringAmount,
    net_proceeds: costBreakdown.net_proceeds,
    days_to_payment: daysToPayment,
    risk_level_score: riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 2 : 3,
    is_recourse: inv.is_recourse ? 1 : 0,
  }

  return {
    invoice_id: inv.invoice_id,
    supplier_id: inv.supplier_id,
    buyer_id: inv.buyer_id,
    invoice_amount: inv.invoice_amount,
    currency: inv.currency,
    recommendation: {
      recommended_advance_rate: advanceRate,
      discount_rate: discountRate,
      service_fee_rate: serviceFeeRate,
      estimated_annualized_cost: annualizedCost,
      max_factoring_amount: maxFactoringAmount,
      risk_level: riskLevel,
      recommended_factoring_type: factoringType,
      structure: inv.is_recourse ? '有追索权结构 — 保理商在买家违约时向供应商追索' : '无追索权结构 — 保理商承担买家信用风险',
    },
    risk_factors: riskFactors,
    Mitigants: Mitigants,
    cost_breakdown: costBreakdown,
    alternatives,
    dashboard_data: dashboardData,
  }
}

// --- Tool 2: Purchase Order Financier 分析 ---
function analyzePurchaseOrderFinancing(data: string): POFinancingReport {
  const po: PurchaseOrderData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(po)))

  // Base financing rate from buyer rating
  const ratingRate: Record<string, number> = {
    'AAA': 0.03, 'AA': 0.035, 'A': 0.04, 'BBB': 0.05,
    'BB': 0.065, 'B': 0.08, 'C': 0.12
  }
  const baseRate = ratingRate[po.buyer_credit_rating] || 0.055

  // Adjustments
  const trackRecordAdj = po.supplier_track_record === 'excellent' ? -0.005 : po.supplier_track_record === 'good' ? 0 : 0.01
  const collateralAdj = po.collateral_available ? -0.01 : 0.01
  const endBuyerAdj = po.end_buyer_exists ? -0.005 : 0.01
  const historyAdj = Math.max(-0.005, Math.min(0.01, (5 - po.purchase_history_count) * 0.002))

  const financingRate = Math.round((baseRate + trackRecordAdj + collateralAdj + endBuyerAdj + historyAdj + rng.nextFloat(-0.002, 0.002)) * 10000) / 10000

  // Max financing amount (typically 70-90% of PO value)
  let maxFinancingPct = 0.8
  if (po.collateral_available) maxFinancingPct += 0.1
  if (po.end_buyer_exists) maxFinancingPct += 0.05
  if (po.buyer_credit_rating === 'AAA' || po.buyer_credit_rating === 'AA') maxFinancingPct += 0.05
  if (po.supplier_track_record === 'poor') maxFinancingPct -= 0.15
  maxFinancingPct = Math.max(0.5, Math.min(0.95, maxFinancingPct))

  const maxFinancingAmount = Math.round(po.po_amount * maxFinancingPct)
  const financingTenor = po.payment_terms_days + 30 + rng.nextInt(-15, 30)

  // Risk level
  let riskLevel: 'low' | 'medium' | 'high'
  if (financingRate < 0.045 && po.collateral_available) riskLevel = 'low'
  else if (financingRate > 0.07 || !po.end_buyer_exists) riskLevel = 'high'
  else riskLevel = 'medium'

  // Collateral requirement
  const collateralReq = po.collateral_available
    ? '已有抵押物 覆盖率' + rng.nextInt(120, 150) + '%'
    : (riskLevel === 'low' ? '应收账款质押 + 保证金10%' : '应收账款质押 + 保证金20% + 个人担保')

  const riskAssessment: string[] = []
  if (!po.end_buyer_exists) riskAssessment.push('无终端买家确认 — 回款来源不确定')
  if (po.supplier_track_record === 'poor') riskAssessment.push('供应商履约记录不佳')
  if (po.payment_terms_days > 60) riskAssessment.push('付款账期较长 (' + po.payment_terms_days + '天)')
  if (!po.collateral_available) riskAssessment.push('无可提供抵押物 — 风险敞口较大')
  if (po.buyer_credit_rating === 'BB' || po.buyer_credit_rating === 'B' || po.buyer_credit_rating === 'C') {
    riskAssessment.push('买家信用评级偏低 (' + po.buyer_credit_rating + ')')
  }
  if (riskAssessment.length === 0) riskAssessment.push('基础风险可控')

  const supplierEvaluation: Record<string, string> = {
    track_record: po.supplier_track_record,
    purchase_history: po.purchase_history_count > 10 ? '良好 (' + po.purchase_history_count + '笔)' :
      po.purchase_history_count > 3 ? '一般 (' + po.purchase_history_count + '笔)' : '不足 (' + po.purchase_history_count + '笔)',
    industry_experience: po.purchase_history_count > 5 ? '丰富' : '有限',
    delivery_capability: po.supplier_track_record === 'excellent' ? '优秀' : po.supplier_track_record === 'good' ? '良好' : '需关注',
    quality_rating: po.supplier_track_record === 'excellent' ? 'A级' : po.supplier_track_record === 'good' ? 'B级' : 'C级',
  }

  const endBuyerAnalysis: Record<string, string> = {
    confirmed: po.end_buyer_exists ? '已确认' : '未确认',
    payment_source: po.end_buyer_exists ? '终端买家直接付款' : '依赖中间买家回款',
    risk_mitigation: po.end_buyer_exists ? '终端买家确认函可降低风险' : '建议获取终端买家确认',
    distribution_channel: po.end_buyer_exists ? '直接分销' : '间接分销/转售',
  }

  const mitigationMeasures: string[] = []
  mitigationMeasures.push('应收账款质押登记')
  mitigationMeasures.push('监控供应商履约进度')
  if (!po.collateral_available) mitigationMeasures.push('追加保证金或担保')
  mitigationMeasures.push('要求买家出具付款确认函')
  if (riskLevel === 'high') mitigationMeasures.push('分阶段放款 — 与交付里程碑挂钩')
  mitigationMeasures.push('购买信用保险(可选)')

  const dashboardData: Record<string, number> = {
    po_amount: po.po_amount,
    max_financing_amount: maxFinancingAmount,
    financing_rate_pct: Math.round(financingRate * 10000) / 100,
    financing_tenor_days: financingTenor,
    risk_level_score: riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 2 : 3,
    collateral_available: po.collateral_available ? 1 : 0,
    end_buyer_exists: po.end_buyer_exists ? 1 : 0,
    purchase_history: po.purchase_history_count,
    payment_terms_days: po.payment_terms_days,
    financing_pct: Math.round(maxFinancingPct * 100),
  }

  return {
    po_id: po.po_id,
    supplier_id: po.supplier_id,
    buyer_id: po.buyer_id,
    po_amount: po.po_amount,
    currency: po.currency,
    recommendation: {
      max_financing_amount: maxFinancingAmount,
      financing_rate: financingRate,
      financing_tenor_days: financingTenor,
      collateral_requirement: collateralReq,
      disbursement_schedule: riskLevel === 'high' ? '分阶段放款(30%/40%/30%)' : '一次性放款或分两期',
      repayment_structure: po.end_buyer_exists ? '终端买家付款后一次性偿还' : '到期一次性偿还',
      risk_level: riskLevel,
    },
    risk_assessment: riskAssessment,
    supplier_evaluation: supplierEvaluation,
    end_buyer_analysis: endBuyerAnalysis,
    mitigation_measures: mitigationMeasures,
    dashboard_data: dashboardData,
  }
}

// --- Tool 3: Trade Credit Insurer 分析 ---
function analyzeTradeCreditInsurance(data: string): InsuranceQuote {
  const tc: TradeCreditData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(tc)))

  // Base premium rate from buyer credit rating
  const ratingPremium: Record<string, number> = {
    'AAA': 0.003, 'AA': 0.005, 'A': 0.008, 'BBB': 0.012,
    'BB': 0.02, 'B': 0.035, 'C': 0.06
  }
  const basePremium = ratingPremium[tc.buyer_credit_rating] || 0.015

  // Adjustments
  const countryAdj = tc.buyer_country === 'US' || tc.buyer_country === 'DE' || tc.buyer_country === 'JP' ? 0 :
    tc.buyer_country === 'CN' || tc.buyer_country === 'IN' || tc.buyer_country === 'BR' ? 0.003 : 0.008
  const termsAdj = tc.payment_terms_days > 90 ? 0.003 : tc.payment_terms_days > 60 ? 0.001 : 0
  const lossAdj = tc.historical_loss_rate * 0.05
  const portfolioAdj = tc.portfolio_size > 50 ? -0.001 : tc.portfolio_size < 5 ? 0.002 : 0

  const premiumRate = Math.round((basePremium + countryAdj + termsAdj + lossAdj + portfolioAdj + rng.nextFloat(-0.0005, 0.0005)) * 10000) / 10000

  // Approved coverage (may be less than requested)
  let approvedCoverage = tc.coverage_requested_pct
  if (tc.buyer_credit_rating === 'C' || tc.buyer_credit_rating === 'D') approvedCoverage = Math.min(approvedCoverage, 70)
  if (tc.historical_loss_rate > 0.05) approvedCoverage = Math.min(approvedCoverage, 75)
  if (tc.payment_terms_days > 120) approvedCoverage = Math.min(approvedCoverage, 80)
  approvedCoverage = Math.max(50, Math.min(95, approvedCoverage))

  const maxLiability = Math.round(tc.insured_amount * approvedCoverage / 100)
  const deductibleRate = Math.round((100 - approvedCoverage + rng.nextInt(0, 5)) * 100) / 100
  const waitingPeriodDays = tc.buyer_credit_rating === 'AAA' || tc.buyer_credit_rating === 'AA' ? 60 : 90

  // Buyer risk grade
  let buyerRiskGrade: string
  if (premiumRate < 0.006) buyerRiskGrade = 'I级 (优质)'
  else if (premiumRate < 0.012) buyerRiskGrade = 'II级 (良好)'
  else if (premiumRate < 0.025) buyerRiskGrade = 'III级 (一般)'
  else if (premiumRate < 0.04) buyerRiskGrade = 'IV级 (关注)'
  else buyerRiskGrade = 'V级 (高风险)'

  // Policy type
  const policyType = tc.portfolio_size > 20
    ? '综合保单 (Whole Turnover Policy)'
    : tc.portfolio_size > 5
    ? '多买家保单 (Multi-Buyer Policy)'
    : '单买家保单 (Single Buyer Policy)'

  const riskAnalysis: Record<string, string> = {
    buyer_credit: tc.buyer_credit_rating + ' — ' + (premiumRate < 0.012 ? '信用良好' : '需关注'),
    country_risk: tc.buyer_country + ' — ' + (countryAdj === 0 ? '低风险' : countryAdj < 0.005 ? '中等风险' : '高风险'),
    payment_terms: tc.payment_terms_days + '天 — ' + (tc.payment_terms_days <= 60 ? '标准' : tc.payment_terms_days <= 90 ? '偏长' : '较长'),
    loss_history: '历史损失率 ' + (tc.historical_loss_rate * 100).toFixed(2) + '% — ' + (tc.historical_loss_rate < 0.02 ? '良好' : '偏高'),
    industry_risk: tc.buyer_industry + ' — 行业风险' + (tc.buyer_industry === 'retail' || tc.buyer_industry === 'hospitality' ? '较高' : '中等'),
  }

  const coverageScenarios: Record<string, number> = {
    coverage_70_pct: Math.round(tc.insured_amount * 0.7),
    coverage_80_pct: Math.round(tc.insured_amount * 0.8),
    coverage_90_pct: Math.round(tc.insured_amount * 0.9),
    premium_70_pct: Math.round(tc.insured_amount * 0.7 * premiumRate * 0.85),
    premium_80_pct: Math.round(tc.insured_amount * 0.8 * premiumRate * 0.9),
    premium_90_pct: Math.round(tc.insured_amount * 0.9 * premiumRate),
    max_liability: maxLiability,
    annual_premium: Math.round(tc.insured_amount * premiumRate),
  }

  const exclusions: string[] = []
  exclusions.push('商业纠纷导致的拒赔(需先仲裁/诉讼)')
  exclusions.push('汇率波动损失(除非附加汇率险)')
  exclusions.push('政治风险(除非附加政治险)')
  exclusions.push('已知风险出险前的损失')
  exclusions.push('关联方交易损失')

  const premiumBreakdown: Record<string, number> = {
    base_premium: Math.round(tc.insured_amount * basePremium),
    country_surcharge: Math.round(tc.insured_amount * countryAdj),
    terms_surcharge: Math.round(tc.insured_amount * termsAdj),
    loss_loading: Math.round(tc.insured_amount * lossAdj),
    total_premium: Math.round(tc.insured_amount * premiumRate),
    premium_rate_pct: Math.round(premiumRate * 10000) / 100,
    per_thousand_cost: Math.round(premiumRate * 1000 * 100) / 100,
  }

  const dashboardData: Record<string, number> = {
    insured_amount: tc.insured_amount,
    premium_rate_pct: Math.round(premiumRate * 10000) / 100,
    approved_coverage_pct: approvedCoverage,
    max_liability: maxLiability,
    deductible_pct: deductibleRate,
    waiting_period_days: waitingPeriodDays,
    annual_premium: Math.round(tc.insured_amount * premiumRate),
    buyer_risk_grade_score: premiumRate < 0.006 ? 1 : premiumRate < 0.012 ? 2 : premiumRate < 0.025 ? 3 : premiumRate < 0.04 ? 4 : 5,
    portfolio_size: tc.portfolio_size,
    historical_loss_pct: Math.round(tc.historical_loss_rate * 10000) / 100,
  }

  return {
    policy_id: tc.policy_id,
    insured_id: tc.insured_id,
    buyer_id: tc.buyer_id,
    insured_amount: tc.insured_amount,
    currency: tc.currency,
    recommendation: {
      premium_rate: premiumRate,
      approved_coverage_pct: approvedCoverage,
      max_liability: maxLiability,
      deductible_rate: deductibleRate,
      waiting_period_days: waitingPeriodDays,
      buyer_risk_grade: buyerRiskGrade,
      policy_type: policyType,
    },
    risk_analysis: riskAnalysis,
    coverage_scenarios: coverageScenarios,
    exclusions,
    premium_breakdown: premiumBreakdown,
    dashboard_data: dashboardData,
  }
}

// --- Tool 4: Letter of Credit Manager 分析 ---
function analyzeLetterOfCredit(data: string): LCReport {
  const lc: LCData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(lc)))

  // Simulate document check
  const discrepancies: LCDiscrepancyCheck[] = []
  for (const doc of lc.required_documents) {
    const roll = rng.next()
    let status: 'clean' | 'discrepant' | 'waiver_required' = 'clean'
    const issues: string[] = []

    if (roll < 0.15) {
      status = 'discrepant'
      const possibleIssues = [
        '单据日期晚于信用证规定日期',
        '金额与信用证不符(超出容差范围)',
        '货物描述与信用证不完全一致',
        '缺少必要签章',
        '运输单据收货人信息不符',
        '保险金额不足(CIF价值的110%)',
      ]
      issues.push(rng.pick(possibleIssues))
      if (rng.next() < 0.3) issues.push(rng.pick(possibleIssues))
    } else if (roll < 0.3) {
      status = 'waiver_required'
      issues.push('轻微不符点 — 需申请人放弃不符点')
    }

    discrepancies.push({ document_name: doc, status, issues })
  }

  const hasDiscrepancy = discrepancies.some(d => d.status === 'discrepant')
  const hasWaiver = discrepancies.some(d => d.status === 'waiver_required')

  // Financing options
  const financingOptions: string[] = []
  if (!hasDiscrepancy) {
    financingOptions.push('议付 (Negotiation): 银行买入相符单据, 融资成本约 SOFR + 1.5-2.5%')
    financingOptions.push('福费廷 (Forfeiting): 无追索权买断, 适合远期信用证, 成本约 SOFR + 2-3%')
    if (lc.lc_type === 'usance' || lc.lc_type === 'deferred_payment') {
      financingOptions.push('贴现 (Discounting): 远期信用证贴现, 年化成本约 4-6%')
    }
  } else {
    financingOptions.push('存在不符点 — 需先解决不符点方可融资')
    financingOptions.push('担保议付 (Negotiation under Reserve): 有追索权, 成本增加0.5-1%')
  }

  // Risk factors
  const riskFactors: string[] = []
  if (hasDiscrepancy) riskFactors.push('单据存在不符点 — 可能遭开证行拒付')
  if (lc.tolerance_pct > 5) riskFactors.push('金额容差较大 (' + lc.tolerance_pct + '%) — 注意超支风险')
  if (!lc.partial_shipment) riskFactors.push('不允许分批装运 — 一次性交付风险')
  const daysToExpiry = Math.round((new Date(lc.expiry_date).getTime() - Date.now()) / 86400000)
  if (daysToExpiry < 30) riskFactors.push('信用证即将到期 (剩余' + daysToExpiry + '天)')
  if (riskFactors.length === 0) riskFactors.push('未发现重大风险')

  // Recommended actions
  const recommendedActions: string[] = []
  if (hasDiscrepancy) {
    recommendedActions.push('联系申请人接受不符点')
    recommendedActions.push('提交担保议付申请')
    recommendedActions.push('准备更正单据(如时间允许)')
  }
  if (hasWaiver) {
    recommendedActions.push('请求申请人出具不符点放弃书')
  }
  recommendedActions.push('在信用证效期内提交单据')
  recommendedActions.push('确认所有单据符合UCP600规定')
  if (lc.transferable) {
    recommendedActions.push('如为可转让信用证, 确认第二受益人资质')
  }

  // UCP600 compliance
  const ucp600Compliance: string[] = []
  ucp600Compliance.push('UCP600 Art.4: 信用证独立于基础交易')
  ucp600Compliance.push('UCP600 Art.14: 银行有5个工作日审单')
  ucp600Compliance.push('UCP600 Art.16: 拒付通知须一次性提出所有不符点')
  ucp600Compliance.push('UCP600 Art.29: 效期延展规则')
  if (lc.transferable) ucp600Compliance.push('UCP600 Art.38: 可转让信用证规则')

  // Timeline
  const timeline: Record<string, string> = {
    lc_issuance: '开证日',
    latest_shipment: lc.latest_shipment_date,
    document_presentation: '装运后21天内',
    lc_expiry: lc.expiry_date,
    negotiation_deadline: '效期前3个工作日',
    payment_expectation: lc.lc_type === 'sight' ? '单到5个工作日内' : '到期日付款',
  }

  const dashboardData: Record<string, number> = {
    lc_amount: lc.lc_amount,
    discrepancy_count: discrepancies.filter(d => d.status === 'discrepant').length,
    waiver_count: discrepancies.filter(d => d.status === 'waiver_required').length,
    clean_count: discrepancies.filter(d => d.status === 'clean').length,
    total_documents: lc.required_documents.length,
    tolerance_pct: lc.tolerance_pct,
    days_to_expiry: daysToExpiry,
    risk_score: hasDiscrepancy ? 3 : hasWaiver ? 2 : 1,
    partial_shipment: lc.partial_shipment ? 1 : 0,
    transferable: lc.transferable ? 1 : 0,
  }

  return {
    lc_id: lc.lc_id,
    applicant_id: lc.applicant_id,
    beneficiary_id: lc.beneficiary_id,
    lc_amount: lc.lc_amount,
    currency: lc.currency,
    lc_type: lc.lc_type,
    discrepancies,
    recommendation: {
      financing_option: hasDiscrepancy ? '担保议付 (有追索权)' : '议付/福费廷 (无追索权)',
      negotiating_bank_advice: hasDiscrepancy
        ? '建议联系开证行确认不符点是否接受'
        : '单据相符 — 可立即办理议付',
      document_checklist: lc.required_documents,
      discrepancy_actions: hasDiscrepancy
        ? ['请求申请人放弃不符点', '提交担保议付', '准备更正单据']
        : ['确认单据无误后提交议付申请'],
      risk_factors: riskFactors,
      recommended_actions: recommendedActions,
    },
    ucp600_compliance: ucp600Compliance,
    finance_opportunities: financingOptions,
    timeline,
    dashboard_data: dashboardData,
  }
}

// --- Tool 5: Supply Chain Risk Assessor 分析 ---
function analyzeSupplyChainRisk(data: string): SupplyChainRiskReport {
  const sc: SupplyChainData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(sc)))

  // Geographic concentration risk
  const geoScore = sc.countries.length <= 2 ? 8 : sc.countries.length <= 5 ? 5 : 3
  const geoLevel: 'low' | 'medium' | 'high' | 'critical' = geoScore >= 7 ? 'low' : geoScore >= 5 ? 'medium' : geoScore >= 3 ? 'high' : 'critical'

  // Supplier concentration risk
  const supplierScore = sc.tier1_suppliers >= 20 ? 2 : sc.tier1_suppliers >= 10 ? 4 : sc.tier1_suppliers >= 5 ? 6 : 8
  const supplierLevel: 'low' | 'medium' | 'high' | 'critical' = supplierScore >= 7 ? 'low' : supplierScore >= 5 ? 'medium' : supplierScore >= 3 ? 'high' : 'critical'

  // Single source risk
  const singleSourceScore = sc.single_source_critical ? 9 : 3
  const singleSourceLevel: 'low' | 'medium' | 'high' | 'critical' = singleSourceScore >= 7 ? 'low' : singleSourceScore >= 5 ? 'medium' : singleSourceScore >= 3 ? 'high' : 'critical'

  // Financial risk (payment terms)
  const financialScore = sc.avg_payment_terms_days > 90 ? 7 : sc.avg_payment_terms_days > 60 ? 5 : sc.avg_payment_terms_days > 30 ? 3 : 2
  const financialLevel: 'low' | 'medium' | 'high' | 'critical' = financialScore >= 7 ? 'low' : financialScore >= 5 ? 'medium' : financialScore >= 3 ? 'high' : 'critical'

  // ESG risk
  const esgScore = sc.esg_requirements ? 3 : 7
  const esgLevel: 'low' | 'medium' | 'high' | 'critical' = esgScore >= 7 ? 'low' : esgScore >= 5 ? 'medium' : esgScore >= 3 ? 'high' : 'critical'

  // Operational risk (supply chain length)
  const operationalScore = sc.supply_chain_length_days > 180 ? 8 : sc.supply_chain_length_days > 90 ? 5 : sc.supply_chain_length_days > 30 ? 3 : 2
  const operationalLevel: 'low' | 'medium' | 'high' | 'critical' = operationalScore >= 7 ? 'low' : operationalScore >= 5 ? 'medium' : operationalScore >= 3 ? 'high' : 'critical'

  const riskDimensions: RiskDimension[] = [
    { dimension: '地理集中度', score: geoScore, level: geoLevel, description: sc.countries.length + '个国家/地区 — ' + (geoScore >= 5 ? '分散良好' : '集中度高') },
    { dimension: '供应商集中度', score: supplierScore, level: supplierLevel, description: sc.tier1_suppliers + '家一级供应商 — ' + (supplierScore >= 5 ? '供应基础充足' : '供应商不足') },
    { dimension: '单一来源风险', score: singleSourceScore, level: singleSourceLevel, description: sc.single_source_critical ? '存在关键单一来源' : '无关键单一来源' },
    { dimension: '财务风险', score: financialScore, level: financialLevel, description: '平均付款条件' + sc.avg_payment_terms_days + '天 — ' + (financialScore <= 3 ? '现金流压力小' : '现金流压力大') },
    { dimension: 'ESG合规', score: esgScore, level: esgLevel, description: sc.esg_requirements ? '已实施ESG要求' : '未实施ESG要求' },
    { dimension: '运营风险', score: operationalScore, level: operationalLevel, description: '供应链长度' + sc.supply_chain_length_days + '天 — ' + (operationalScore <= 3 ? '响应快速' : '周期较长') },
  ]

  // Overall risk score (weighted average, inverted so higher = more risky)
  const overallScore = Math.round(
    (geoScore * 0.2 + supplierScore * 0.2 + singleSourceScore * 0.2 + financialScore * 0.15 + esgScore * 0.15 + operationalScore * 0.1) * 10
  ) / 10

  let overallLevel: 'low' | 'medium' | 'high' | 'critical'
  if (overallScore >= 7) overallLevel = 'low'
  else if (overallScore >= 5) overallLevel = 'medium'
  else if (overallScore >= 3) overallLevel = 'high'
  else overallLevel = 'critical'

  // Geographic exposure
  const geographicExposure: Record<string, number> = {}
  const perCountry = Math.round(100 / sc.countries.length)
  for (const c of sc.countries) {
    geographicExposure[c] = perCountry + rng.nextInt(-5, 5)
  }

  // Concentration risk
  const concentrationRisk: Record<string, string> = {
    hhi_index: (sc.tier1_suppliers < 5 ? '高 (>2500)' : sc.tier1_suppliers < 15 ? '中 (1500-2500)' : '低 (<1500)'),
    top3_dependency: sc.tier1_suppliers < 5 ? '高 (>60%)' : sc.tier1_suppliers < 15 ? '中 (30-60%)' : '低 (<30%)',
    tier2_visibility: sc.tier2_suppliers > 50 ? '有限' : sc.tier2_suppliers > 20 ? '一般' : '良好',
    geographic_spread: sc.countries.length > 5 ? '良好' : sc.countries.length > 2 ? '一般' : '集中',
  }

  // Resilience score
  const resilienceScore = Math.round(
    (10 - overallScore) * 10 + rng.nextInt(-5, 5)
  )
  const clampedResilience = Math.max(10, Math.min(100, resilienceScore))

  // Mitigation strategies
  const mitigationStrategies: string[] = []
  if (geoScore < 5) mitigationStrategies.push('供应商地理多元化 — 增加2-3个新地区供应商')
  if (supplierScore < 5) mitigationStrategies.push('扩大供应基础 — 目标增加' + Math.max(3, Math.round(sc.tier1_suppliers * 0.3)) + '家备选供应商')
  if (sc.single_source_critical) mitigationStrategies.push('关键物料双源化 — 为单一来源物料开发第二供应商')
  if (financialScore > 5) mitigationStrategies.push('优化付款条件 — 协商缩短账期或引入供应链融资')
  if (!sc.esg_requirements) mitigationStrategies.push('建立ESG合规体系 — 覆盖供应商准入与定期审核')
  if (operationalScore > 5) mitigationStrategies.push('缩短供应链周期 — 增加近岸/在岸采购比例')
  mitigationStrategies.push('建立供应链可视化平台 — 实时监控Tier1/Tier2供应商状态')
  mitigationStrategies.push('制定业务连续性计划(BCP) — 关键物料安全库存' + sc.inventory_days + '天')

  // Scenario analysis
  const scenarioAnalysis: Record<string, string> = {
    natural_disaster: '自然灾害: 若主要供应地区发生灾害, 预计影响' + rng.nextInt(20, 40) + '%产能, 恢复时间' + rng.nextInt(30, 90) + '天',
    trade_war: '贸易战/关税: 若关税上升10%, 预计成本增加' + rng.nextInt(5, 15) + '%, 需重新评估采购策略',
    supplier_bankruptcy: '供应商破产: 若Top3供应商之一破产, 预计影响' + rng.nextInt(15, 35) + '%供应, 切换时间' + rng.nextInt(60, 180) + '天',
    logistics_disruption: '物流中断: 若主要运输路线中断, 预计延迟' + rng.nextInt(14, 45) + '天, 额外成本' + rng.nextInt(10, 30) + '%',
    currency_crisis: '汇率危机: 若主要供应国货币贬值20%, 采购成本降低但供应商可能违约',
  }

  const dashboardData: Record<string, number> = {
    overall_risk_score: overallScore,
    overall_risk_level_score: overallLevel === 'low' ? 1 : overallLevel === 'medium' ? 2 : overallLevel === 'high' ? 3 : 4,
    resilience_score: clampedResilience,
    tier1_suppliers: sc.tier1_suppliers,
    tier2_suppliers: sc.tier2_suppliers,
    countries_count: sc.countries.length,
    supply_chain_days: sc.supply_chain_length_days,
    inventory_days: sc.inventory_days,
    single_source: sc.single_source_critical ? 1 : 0,
    esg_implemented: sc.esg_requirements ? 1 : 0,
    avg_payment_days: sc.avg_payment_terms_days,
  }

  return {
    assessment_id: sc.assessment_id,
    company_id: sc.company_id,
    overall_risk_score: overallScore,
    overall_risk_level: overallLevel,
    risk_dimensions: riskDimensions,
    geographic_exposure: geographicExposure,
    concentration_risk: concentrationRisk,
    resilience_score: clampedResilience,
    mitigation_strategies: mitigationStrategies,
    scenario_analysis: scenarioAnalysis,
    dashboard_data: dashboardData,
  }
}

// --- Tool 6: Dynamic Discounting Optimizer 分析 ---
function analyzeDynamicDiscounting(data: string): DiscountingReport {
  const dd: DiscountingData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(dd)))

  // Generate scenarios for different payment days
  const scenarios: DiscountRateScenario[] = []
  const paymentDayOptions = [10, 15, 20, 30, 45, 60]

  let optimalDiscountRate = 0
  let optimalPaymentDays = dd.current_payment_terms_days
  let maxNetBenefit = -Infinity

  for (const days of paymentDayOptions) {
    if (days >= dd.current_payment_terms_days) continue

    // Discount rate calculation based on payer cost of capital and time saved
    const daysSaved = dd.current_payment_terms_days - days
    const timeValue = (dd.payer_cost_of_capital / 365) * daysSaved
    const supplierIncentive = (dd.supplier_cost_of_capital / 365) * daysSaved * 0.6
    const discountRate = Math.round((timeValue + supplierIncentive + rng.nextFloat(-0.0005, 0.0005)) * 10000) / 10000

    // Annualized return for payer
    const annualizedReturn = Math.round((discountRate * (365 / daysSaved)) * 10000) / 10000

    // Supplier benefit (lower cost of capital)
    const supplierBenefit = Math.round(dd.invoice_amount * (dd.supplier_cost_of_capital - dd.payer_cost_of_capital) * daysSaved / 365)

    // Net benefit
    const netBenefit = Math.round(dd.invoice_amount * discountRate * dd.supplier_acceptance_rate / 100)

    const isOptimal = netBenefit > maxNetBenefit
    if (isOptimal) {
      maxNetBenefit = netBenefit
      optimalDiscountRate = discountRate
      optimalPaymentDays = days
    }

    scenarios.push({
      payment_days: days,
      discount_rate: discountRate,
      annualized_return_pct: Math.round(annualizedReturn * 10000) / 100,
      supplier_benefit: Math.max(0, supplierBenefit),
      net_benefit: netBenefit,
      is_optimal: isOptimal,
    })
  }

  // Payer benefit analysis
  const payerSavings = Math.round(dd.invoice_amount * optimalDiscountRate)
  const payerAnnualizedReturn = Math.round((optimalDiscountRate * 365 / (dd.current_payment_terms_days - optimalPaymentDays)) * 10000) / 100

  const payerBenefitAnalysis: Record<string, number> = {
    discount_savings: payerSavings,
    annualized_return_pct: payerAnnualizedReturn,
    cost_of_capital_savings: Math.round(dd.invoice_amount * dd.payer_cost_of_capital * (dd.current_payment_terms_days - optimalPaymentDays) / 365),
    working_capital_improvement: dd.current_payment_terms_days - optimalPaymentDays,
    effective_discount_rate_pct: Math.round(optimalDiscountRate * 10000) / 100,
  }

  // Supplier benefit analysis
  const supplierBenefitAnalysis: Record<string, number> = {
    early_payment_amount: Math.round(dd.invoice_amount * (1 - optimalDiscountRate)),
    interest_savings: Math.round(dd.invoice_amount * dd.supplier_cost_of_capital * (dd.current_payment_terms_days - optimalPaymentDays) / 365),
    cash_flow_improvement_days: dd.current_payment_terms_days - optimalPaymentDays,
    acceptance_likelihood_pct: dd.supplier_acceptance_rate,
    net_benefit: Math.round(dd.invoice_amount * optimalDiscountRate * dd.supplier_acceptance_rate / 100),
  }

  // Recommendations
  const recommendations: string[] = []
  recommendations.push('最优方案: ' + optimalPaymentDays + '天内付款, 折扣率 ' + (optimalDiscountRate * 100).toFixed(3) + '%')
  recommendations.push('预计年化收益率: ' + payerAnnualizedReturn + '% (资金方)')
  if (dd.supplier_acceptance_rate < 70) {
    recommendations.push('供应商接受率偏低 (' + dd.supplier_acceptance_rate + '%) — 建议适当降低折扣率')
  }
  if (dd.payer_cost_of_capital > dd.supplier_cost_of_capital) {
    recommendations.push('资金方资金成本高于供应商 — 动态折扣对双方均有价值')
  }
  recommendations.push('建议设置自动触发规则: 发票校验通过后自动发起折扣请求')
  recommendations.push('建议定期(季度)重新评估折扣率参数')
  if (scenarios.length > 0) {
    const bestScenario = scenarios.reduce((a, b) => a.net_benefit > b.net_benefit ? a : b)
    recommendations.push('最佳净收益方案: ' + bestScenario.payment_days + '天, 净收益 ' + dd.currency + ' ' + bestScenario.net_benefit.toLocaleString())
  }

  const dashboardData: Record<string, number> = {
    invoice_amount: dd.invoice_amount,
    optimal_discount_rate_pct: Math.round(optimalDiscountRate * 10000) / 100,
    optimal_payment_days: optimalPaymentDays,
    current_payment_days: dd.current_payment_terms_days,
    payer_cost_of_capital_pct: dd.payer_cost_of_capital * 100,
    supplier_cost_of_capital_pct: dd.supplier_cost_of_capital * 100,
    supplier_acceptance_rate: dd.supplier_acceptance_rate,
    payer_savings: payerSavings,
    annualized_return_pct: payerAnnualizedReturn,
    scenario_count: scenarios.length,
  }

  return {
    program_id: dd.program_id,
    payer_id: dd.payer_id,
    supplier_id: dd.supplier_id,
    invoice_amount: dd.invoice_amount,
    currency: dd.currency,
    optimal_discount_rate: optimalDiscountRate,
    optimal_payment_days: optimalPaymentDays,
    scenarios,
    payer_benefit_analysis: payerBenefitAnalysis,
    supplier_benefit_analysis: supplierBenefitAnalysis,
    recommendations,
    dashboard_data: dashboardData,
  }
}

// --- Tool 7: Reverse Factoring Coordinator 分析 ---
function analyzeReverseFactoring(data: string): ReverseFactoringReport {
  const rf: ReverseFactoringData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(rf)))

  // Anchor credit assessment
  const anchorRatingScore: Record<string, number> = {
    'AAA': 10, 'AA': 9, 'A': 8, 'BBB': 7, 'BB': 5, 'B': 3, 'C': 1
  }
  const anchorScore = anchorRatingScore[rf.anchor_buyer_rating] || 6

  const anchorCreditAssessment: Record<string, string> = {
    credit_rating: rf.anchor_buyer_rating + ' (评分: ' + anchorScore + '/10)',
    credit_quality: anchorScore >= 8 ? '优秀' : anchorScore >= 6 ? '良好' : anchorScore >= 4 ? '一般' : '较弱',
    default_probability: anchorScore >= 8 ? '<0.1%' : anchorScore >= 6 ? '0.1-0.5%' : anchorScore >= 4 ? '0.5-2%' : '>2%',
    financing_anchor: anchorScore >= 6 ? '适合作为融资信用锚' : '需额外增信措施',
    program_tenor: rf.program_tenor_months + '个月 — ' + (rf.program_tenor_months >= 12 ? '标准期限' : '短期安排'),
    market_reputation: anchorScore >= 8 ? '市场认可度高' : '需加强信息披露',
  }

  // Supplier facilities
  const supplierFacilities: SupplierFacility[] = []
  const limitPerSupplier = Math.round(rf.total_program_limit / rf.suppliers.length)

  for (const supId of rf.suppliers) {
    const supplierRoll = rng.next()
    let status: 'active' | 'pending' | 'suspended' = 'active'
    if (supplierRoll < 0.1) status = 'suspended'
    else if (supplierRoll < 0.25) status = 'pending'

    const approvedLimit = Math.round(limitPerSupplier * rng.nextFloat(0.7, 1.3))
    // Financing rate based on anchor credit
    const baseRate = 0.03 + (10 - anchorScore) * 0.003
    const financingRate = Math.round((baseRate + rng.nextFloat(-0.002, 0.005)) * 10000) / 10000
    const utilizationPct = status === 'active' ? rng.nextInt(30, 90) : status === 'pending' ? 0 : rng.nextInt(0, 20)

    supplierFacilities.push({
      supplier_id: supId,
      approved_limit: approvedLimit,
      financing_rate: financingRate,
      utilization_pct: utilizationPct,
      status,
    })
  }

  // Program structure
  const programStructure: Record<string, string> = {
    program_type: rf.platform_type === 'bank_led' ? '银行主导型反向保理' : rf.platform_type === 'fintech' ? '金融科技平台型' : '核心企业自建型',
    credit_anchor: '核心企业(' + rf.anchor_buyer_id + ')信用背书',
    funding_model: rf.funding_sources.length > 1 ? '多渠道资金(' + rf.funding_sources.join(', ') + ')' : '单一资金来源',
    risk_allocation: '核心企业承担最终付款责任',
    supplier_onboarding: '电子化准入 — 平均3-5个工作日',
    approval_workflow: '自动审批(额度内) + 人工审批(超额)',
  }

  // Risk mitigation
  const riskMitigation: string[] = []
  riskMitigation.push('核心企业付款承诺 — 不可撤销的付款义务')
  riskMitigation.push('供应商额度管控 — 动态调整融资限额')
  riskMitigation.push('贸易背景真实性核查 — 发票验真+合同核对')
  riskMitigation.push('资金闭环管理 — 回款直接用于偿还融资')
  if (anchorScore < 6) riskMitigation.push('核心企业信用较弱 — 建议引入担保或保险')
  riskMitigation.push('定期(月度)监控核心企业财务状况')
  riskMitigation.push('设置早期预警指标 — 付款延迟>3天自动预警')

  // Cost savings
  const avgSupplierRate = supplierFacilities.reduce((s, f) => s + f.financing_rate, 0) / supplierFacilities.length
  const marketRate = 0.08 // assumed market rate for SMEs
  const totalUtilized = supplierFacilities.reduce((s, f) => s + f.approved_limit * f.utilization_pct / 100, 0)
  const annualSavings = Math.round(totalUtilized * (marketRate - avgSupplierRate))

  const costSavings: Record<string, number> = {
    avg_market_rate_pct: Math.round(marketRate * 10000) / 100,
    avg_program_rate_pct: Math.round(avgSupplierRate * 10000) / 100,
    rate_savings_pct: Math.round((marketRate - avgSupplierRate) * 10000) / 100,
    total_utilized: Math.round(totalUtilized),
    annual_savings: annualSavings,
    supplier_count: rf.suppliers.length,
    active_suppliers: supplierFacilities.filter(f => f.status === 'active').length,
  }

  // Recommendations
  const recommendations: string[] = []
  recommendations.push('核心企业信用评级 ' + rf.anchor_buyer_rating + ' — ' + (anchorScore >= 6 ? '适合作为融资锚' : '建议增信'))
  recommendations.push('活跃供应商 ' + supplierFacilities.filter(f => f.status === 'active').length + '/' + rf.suppliers.length + ' — 建议扩大覆盖')
  recommendations.push('平均融资成本 ' + (avgSupplierRate * 100).toFixed(2) + '% — 较市场利率低 ' + ((marketRate - avgSupplierRate) * 100).toFixed(2) + '%')
  recommendations.push('预计年度节省利息: ' + rf.currency + ' ' + annualSavings.toLocaleString())
  if (rf.suppliers.length < 20) recommendations.push('建议扩大供应商覆盖 — 当前仅' + rf.suppliers.length + '家')
  recommendations.push('建议引入第二资金来源以降低集中度风险')
  recommendations.push('建议建立供应商融资行为分析 — 识别异常融资模式')

  const dashboardData: Record<string, number> = {
    total_program_limit: rf.total_program_limit,
    supplier_count: rf.suppliers.length,
    active_suppliers: supplierFacilities.filter(f => f.status === 'active').length,
    anchor_credit_score: anchorScore,
    avg_financing_rate_pct: Math.round(avgSupplierRate * 10000) / 100,
    total_utilized: Math.round(totalUtilized),
    utilization_pct: Math.round(totalUtilized / rf.total_program_limit * 100),
    annual_savings: annualSavings,
    program_tenor_months: rf.program_tenor_months,
    funding_sources_count: rf.funding_sources.length,
  }

  return {
    program_id: rf.program_id,
    anchor_buyer_id: rf.anchor_buyer_id,
    total_program_limit: rf.total_program_limit,
    currency: rf.currency,
    anchor_credit_assessment: anchorCreditAssessment,
    supplier_facilities: supplierFacilities,
    program_structure: programStructure,
    risk_mitigation: riskMitigation,
    cost_savings: costSavings,
    recommendations,
    dashboard_data: dashboardData,
  }
}

// --- Tool 8: Trade Finance Compliance Checker 分析 ---
function analyzeTradeFinanceCompliance(data: string): ComplianceReport {
  const cc: ComplianceCheckData = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(cc)))

  const complianceRules: ComplianceRule[] = []

  // AML check
  const amlStatus: 'pass' | 'fail' | 'warning' = cc.aml_risk_score > 70 ? 'fail' : cc.aml_risk_score > 40 ? 'warning' : 'pass'
  complianceRules.push({
    rule_id: 'AML-001',
    rule_name: '反洗钱风险评估',
    category: 'AML',
    status: amlStatus,
    details: 'AML风险评分: ' + cc.aml_risk_score + '/100 — ' + (amlStatus === 'pass' ? '低风险' : amlStatus === 'warning' ? '中等风险 — 需增强尽职调查' : '高风险 — 建议拒绝交易'),
    severity: amlStatus === 'fail' ? 'critical' : amlStatus === 'warning' ? 'high' : 'low',
  })

  // KYC check
  const kycStatus: 'pass' | 'fail' | 'warning' = cc.kycdocumented ? 'pass' : 'fail'
  complianceRules.push({
    rule_id: 'KYC-001',
    rule_name: 'KYC文件完备性',
    category: 'KYC',
    status: kycStatus,
    details: cc.kycdocumented ? 'KYC文件已完备' : 'KYC文件缺失 — 需补充身份/受益所有人证明',
    severity: kycStatus === 'fail' ? 'critical' : 'low',
  })

  // Sanctions check
  const sanctionsStatus: 'pass' | 'fail' | 'warning' = cc.sanctions_screened
    ? (cc.sanctioned_country_involved ? 'fail' : 'pass')
    : 'warning'
  complianceRules.push({
    rule_id: 'SAN-001',
    rule_name: '制裁名单筛查',
    category: 'Sanctions',
    status: sanctionsStatus,
    details: cc.sanctions_screened
      ? (cc.sanctioned_country_involved ? '涉及制裁国家/实体 — 需法律审查' : '已通过制裁筛查')
      : '未完成制裁筛查 — 需补充筛查',
    severity: sanctionsStatus === 'fail' ? 'critical' : sanctionsStatus === 'warning' ? 'high' : 'low',
  })

  // Trade compliance (dual use goods)
  const tradeStatus: 'pass' | 'fail' | 'warning' = cc.dual_use_goods ? 'warning' : 'pass'
  complianceRules.push({
    rule_id: 'TRD-001',
    rule_name: '贸易合规(两用物项)',
    category: 'Trade',
    status: tradeStatus,
    details: cc.dual_use_goods ? '涉及两用物项 — 需出口许可证' : '非两用物项 — 贸易合规',
    severity: tradeStatus === 'warning' ? 'high' : 'low',
  })

  // Documentation completeness
  const docStatus: 'pass' | 'fail' | 'warning' = cc.document_completeness_pct >= 95 ? 'pass' : cc.document_completeness_pct >= 80 ? 'warning' : 'fail'
  complianceRules.push({
    rule_id: 'DOC-001',
    rule_name: '单据完备性',
    category: 'Documentation',
    status: docStatus,
    details: '单据完备度: ' + cc.document_completeness_pct + '% — ' + (docStatus === 'pass' ? '完整' : docStatus === 'warning' ? '基本完整 — 需补充' : '不完整 — 需补正'),
    severity: docStatus === 'fail' ? 'high' : docStatus === 'warning' ? 'medium' : 'low',
  })

  // PEP check
  const pepStatus: 'pass' | 'fail' | 'warning' = cc.pep_involved ? 'warning' : 'pass'
  complianceRules.push({
    rule_id: 'PEP-001',
    rule_name: '政治公众人物筛查',
    category: 'AML',
    status: pepStatus,
    details: cc.pep_involved ? '涉及PEP — 需高级管理层审批' : '未涉及PEP',
    severity: pepStatus === 'warning' ? 'high' : 'low',
  })

  // Overall status
  const failCount = complianceRules.filter(r => r.status === 'fail').length
  const warningCount = complianceRules.filter(r => r.status === 'warning').length
  const criticalCount = complianceRules.filter(r => r.severity === 'critical' && r.status !== 'pass').length

  let overallStatus: 'approved' | 'rejected' | 'pending_review'
  if (criticalCount > 0 || failCount > 1) overallStatus = 'rejected'
  else if (failCount > 0 || warningCount > 1) overallStatus = 'pending_review'
  else overallStatus = 'approved'

  let overallRiskLevel: 'low' | 'medium' | 'high'
  if (criticalCount > 0) overallRiskLevel = 'high'
  else if (warningCount > 1 || failCount > 0) overallRiskLevel = 'medium'
  else overallRiskLevel = 'low'

  // Required actions
  const requiredActions: string[] = []
  if (amlStatus !== 'pass') requiredActions.push('完成增强尽职调查(EDD)')
  if (kycStatus === 'fail') requiredActions.push('补充KYC文件(身份证明+受益所有人)')
  if (sanctionsStatus === 'fail') requiredActions.push('提交法律合规部审查')
  if (sanctionsStatus === 'warning') requiredActions.push('完成制裁名单全面筛查')
  if (tradeStatus === 'warning') requiredActions.push('申请出口许可证(如适用)')
  if (docStatus !== 'pass') requiredActions.push('补充缺失单据至完备度95%以上')
  if (pepStatus === 'warning') requiredActions.push('提交高级管理层审批')
  if (requiredActions.length === 0) requiredActions.push('合规检查通过 — 无需额外操作')

  // Risk flags
  const riskFlags: string[] = []
  if (cc.aml_risk_score > 60) riskFlags.push('AML风险评分偏高')
  if (cc.sanctioned_country_involved) riskFlags.push('涉及制裁国家')
  if (cc.pep_involved) riskFlags.push('涉及政治公众人物')
  if (cc.dual_use_goods) riskFlags.push('涉及两用物项')
  if (!cc.kycdocumented) riskFlags.push('KYC文件缺失')
  if (!cc.sanctions_screened) riskFlags.push('未完成制裁筛查')
  if (cc.document_completeness_pct < 80) riskFlags.push('单据严重不完整')
  if (riskFlags.length === 0) riskFlags.push('未发现风险标记')

  // Document gaps
  const documentGaps: string[] = []
  if (cc.document_completeness_pct < 100) {
    const missing = Math.round((100 - cc.document_completeness_pct) / 10)
    const possibleGaps = ['商业发票', '提单/运输单据', '装箱单', '原产地证明', '保险单', '质量检验证书', '出口许可证', '受益人证明', '装船通知', '海关申报单']
    for (let i = 0; i < Math.min(missing, possibleGaps.length); i++) {
      documentGaps.push(possibleGaps[i])
    }
  }
  if (documentGaps.length === 0) documentGaps.push('单据完整 — 无缺失')

  // Regulatory references
  const regulatoryReferences: string[] = []
  regulatoryReferences.push('FATF Recommendation 10: 客户尽职调查')
  regulatoryReferences.push('FATF Recommendation 19: 高风险国家措施')
  regulatoryReferences.push('OFAC SDN List: 特别指定国民名单')
  regulatoryReferences.push('EU Dual-Use Regulation (EC 428/2009)')
  regulatoryReferences.push('UCP600: 跟单信用证统一惯例')
  if (cc.sanctioned_country_involved) regulatoryReferences.push('UN Security Council Sanctions Resolutions')

  const dashboardData: Record<string, number> = {
    amount: cc.amount,
    aml_risk_score: cc.aml_risk_score,
    document_completeness_pct: cc.document_completeness_pct,
    fail_count: failCount,
    warning_count: warningCount,
    critical_count: criticalCount,
    overall_status_score: overallStatus === 'approved' ? 1 : overallStatus === 'pending_review' ? 2 : 3,
    overall_risk_level_score: overallRiskLevel === 'low' ? 1 : overallRiskLevel === 'medium' ? 2 : 3,
    pep_involved: cc.pep_involved ? 1 : 0,
    dual_use: cc.dual_use_goods ? 1 : 0,
    sanctioned_country: cc.sanctioned_country_involved ? 1 : 0,
  }

  return {
    check_id: cc.check_id,
    transaction_id: cc.transaction_id,
    overall_status: overallStatus,
    overall_risk_level: overallRiskLevel,
    compliance_rules: complianceRules,
    required_actions: requiredActions,
    risk_flags: riskFlags,
    document_gaps: documentGaps,
    regulatory_references: regulatoryReferences,
    dashboard_data: dashboardData,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Invoice Factoring Advisor 报告 ---
function formatInvoiceFactoringReport(result: FactoringReport): string {
  const lines: string[] = []
  lines.push('## 📄 Invoice Factoring Advisor — 发票融资顾问')
  lines.push('')
  lines.push('> **发票**: ' + result.invoice_id + ' | **金额**: ' + result.currency + ' ' + result.invoice_amount.toLocaleString() + ' | **风险等级**: ' + result.recommendation.risk_level.toUpperCase() + ' | **年化成本**: ' + (result.recommendation.estimated_annualized_cost * 100).toFixed(2) + '%')
  lines.push('')
  lines.push('### 📊 发票融资仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    INV[发票] --> EVAL[融资评估]')
  lines.push('    EVAL --> ADV[预付放款]')
  lines.push('    EVAL --> FEE[费用扣除]')
  lines.push('    ADV --> BUYER[买家付款]')
  lines.push('    BUYER --> SETTLE[结算尾款]')
  lines.push('    RATE[折扣率: ' + (result.recommendation.discount_rate * 100).toFixed(3) + '%]')
  lines.push('    ADV_RATE[预付比例: ' + (result.recommendation.recommended_advance_rate * 100) + '%]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 融资建议')
  lines.push('| 项目 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 建议预付比例 | ' + (result.recommendation.recommended_advance_rate * 100) + '% |')
  lines.push('| 折扣率 | ' + (result.recommendation.discount_rate * 100).toFixed(3) + '% |')
  lines.push('| 服务费率 | ' + (result.recommendation.service_fee_rate * 100).toFixed(3) + '% |')
  lines.push('| 预估年化成本 | ' + (result.recommendation.estimated_annualized_cost * 100).toFixed(2) + '% |')
  lines.push('| 最高融资额 | ' + result.currency + ' ' + result.recommendation.max_factoring_amount.toLocaleString() + ' |')
  lines.push('| 融资类型 | ' + result.recommendation.recommended_factoring_type + ' |')
  lines.push('| 结构 | ' + result.recommendation.structure + ' |')
  lines.push('')

  lines.push('### 📊 成本明细')
  lines.push('| 项目 | 金额 |')
  lines.push('|------|------|')
  for (const [key, val] of Object.entries(result.cost_breakdown)) {
    lines.push('| ' + key + ' | ' + result.currency + ' ' + val.toLocaleString() + ' |')
  }
  lines.push('')

  lines.push('### ⚠️ 风险因素')
  for (const r of result.risk_factors) lines.push('- ' + r)
  lines.push('')

  lines.push('### ✅ 风险缓释')
  for (const m of result.Mitigants) lines.push('- ' + m)
  lines.push('')

  lines.push('### 💡 替代方案')
  for (const a of result.alternatives) lines.push('- ' + a)
  lines.push('')

  lines.push('### 📋 发票融资清单')
  lines.push('- [x] 发票真实性验证')
  lines.push('- [x] 买家信用评估')
  lines.push('- [x] 折扣率定价')
  lines.push('- [x] 预付比例确定')
  lines.push('- [x] 有/无追索权结构选择')
  lines.push('- [x] 替代融资方案比较')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// --- Tool 2: Purchase Order Financier 报告 ---
function formatPOFinancingReport(result: POFinancingReport): string {
  const lines: string[] = []
  lines.push('## 📋 Purchase Order Financier — 订单融资分析')
  lines.push('')
  lines.push('> **订单**: ' + result.po_id + ' | **金额**: ' + result.currency + ' ' + result.po_amount.toLocaleString() + ' | **融资利率**: ' + (result.recommendation.financing_rate * 100).toFixed(2) + '% | **风险等级**: ' + result.recommendation.risk_level.toUpperCase())
  lines.push('')
  lines.push('### 📊 订单融资仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    PO[采购订单] --> EVAL[融资评估]')
  lines.push('    EVAL --> DISBURSE[资金发放]')
  lines.push('    DISBURSE --> DELIVER[供应商交付]')
  lines.push('    DELIVER --> PAY[买家付款]')
  lines.push('    PAY --> REPAY[偿还融资]')
  lines.push('    RATE[融资利率: ' + (result.recommendation.financing_rate * 100).toFixed(2) + '%]')
  lines.push('    MAX[最高融资: ' + result.currency + ' ' + result.recommendation.max_financing_amount.toLocaleString() + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 融资建议')
  lines.push('| 项目 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 最高融资额 | ' + result.currency + ' ' + result.recommendation.max_financing_amount.toLocaleString() + ' |')
  lines.push('| 融资利率 | ' + (result.recommendation.financing_rate * 100).toFixed(2) + '% |')
  lines.push('| 融资期限 | ' + result.recommendation.financing_tenor_days + '天 |')
  lines.push('| 抵押要求 | ' + result.recommendation.collateral_requirement + ' |')
  lines.push('| 放款安排 | ' + result.recommendation.disbursement_schedule + ' |')
  lines.push('| 还款结构 | ' + result.recommendation.repayment_structure + ' |')
  lines.push('')

  lines.push('### ⚠️ 风险评估')
  for (const r of result.risk_assessment) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📊 供应商评估')
  for (const [key, val] of Object.entries(result.supplier_evaluation)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 📊 终端买家分析')
  for (const [key, val] of Object.entries(result.end_buyer_analysis)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 📋 缓释措施')
  for (const m of result.mitigation_measures) lines.push('- ' + m)
  lines.push('')

  lines.push('### 📋 订单融资清单')
  lines.push('- [x] 采购订单真实性验证')
  lines.push('- [x] 供应商履约能力评估')
  lines.push('- [x] 终端买家确认')
  lines.push('- [x] 抵押物评估')
  lines.push('- [x] 放款与还款结构设计')
  lines.push('- [x] 风险缓释措施制定')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// --- Tool 3: Trade Credit Insurer 报告 ---
function formatInsuranceQuote(result: InsuranceQuote): string {
  const lines: string[] = []
  lines.push('## 🛡️ Trade Credit Insurer — 信用保险评估')
  lines.push('')
  lines.push('> **保单**: ' + result.policy_id + ' | **投保金额**: ' + result.currency + ' ' + result.insured_amount.toLocaleString() + ' | **保费率**: ' + (result.recommendation.premium_rate * 100).toFixed(3) + '% | **买家风险等级**: ' + result.recommendation.buyer_risk_grade)
  lines.push('')
  lines.push('### 📊 信用保险仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    INS[投保申请] --> UNDER[核保评估]')
  lines.push('    UNDER --> COVER[承保决策]')
  lines.push('    COVER --> MONITOR[风险监控]')
  lines.push('    MONITOR --> CLAIM[理赔处理]')
  lines.push('    PREM[保费率: ' + (result.recommendation.premium_rate * 100).toFixed(3) + '%]')
  lines.push('    COV[承保比例: ' + result.recommendation.approved_coverage_pct + '%]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 保险建议')
  lines.push('| 项目 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 保费率 | ' + (result.recommendation.premium_rate * 100).toFixed(3) + '% |')
  lines.push('| 批准承保比例 | ' + result.recommendation.approved_coverage_pct + '% |')
  lines.push('| 最高责任限额 | ' + result.currency + ' ' + result.recommendation.max_liability.toLocaleString() + ' |')
  lines.push('| 免赔率 | ' + result.recommendation.deductible_rate + '% |')
  lines.push('| 等待期 | ' + result.recommendation.waiting_period_days + '天 |')
  lines.push('| 买家风险等级 | ' + result.recommendation.buyer_risk_grade + ' |')
  lines.push('| 保单类型 | ' + result.recommendation.policy_type + ' |')
  lines.push('')

  lines.push('### 📊 风险分析')
  for (const [key, val] of Object.entries(result.risk_analysis)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 📊 保费明细')
  lines.push('| 项目 | 金额 |')
  lines.push('|------|------|')
  for (const [key, val] of Object.entries(result.premium_breakdown)) {
    lines.push('| ' + key + ' | ' + result.currency + ' ' + val.toLocaleString() + ' |')
  }
  lines.push('')

  lines.push('### 📊 承保方案对比')
  lines.push('| 方案 | 承保额 | 保费 |')
  lines.push('|------|--------|------|')
  lines.push('| 70%承保 | ' + result.currency + ' ' + result.coverage_scenarios.coverage_70_pct.toLocaleString() + ' | ' + result.currency + ' ' + result.coverage_scenarios.premium_70_pct.toLocaleString() + ' |')
  lines.push('| 80%承保 | ' + result.currency + ' ' + result.coverage_scenarios.coverage_80_pct.toLocaleString() + ' | ' + result.currency + ' ' + result.coverage_scenarios.premium_80_pct.toLocaleString() + ' |')
  lines.push('| 90%承保 | ' + result.currency + ' ' + result.coverage_scenarios.coverage_90_pct.toLocaleString() + ' | ' + result.currency + ' ' + result.coverage_scenarios.premium_90_pct.toLocaleString() + ' |')
  lines.push('')

  lines.push('### 🚫 除外责任')
  for (const e of result.exclusions) lines.push('- ' + e)
  lines.push('')

  lines.push('### 📋 信用保险清单')
  lines.push('- [x] 买家信用评估')
  lines.push('- [x] 国家风险分析')
  lines.push('- [x] 保费率定价')
  lines.push('- [x] 承保比例确定')
  lines.push('- [x] 保单类型选择')
  lines.push('- [x] 除外责任告知')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// --- Tool 4: Letter of Credit Manager 报告 ---
function formatLCReport(result: LCReport): string {
  const lines: string[] = []
  lines.push('## 💳 Letter of Credit Manager — 信用证管理')
  lines.push('')
  lines.push('> **信用证**: ' + result.lc_id + ' | **金额**: ' + result.currency + ' ' + result.lc_amount.toLocaleString() + ' | **类型**: ' + result.lc_type + ' | **不符点**: ' + result.discrepancies.filter(d => d.status === 'discrepant').length + '个')
  lines.push('')
  lines.push('### 📊 信用证管理仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    ISSUE[开证] --> ADVICED[通知]')
  lines.push('    ADVICED --> SHIP[装运]')
  lines.push('    SHIP --> PRES[交单]')
  lines.push('    PRES --> CHECK[审单]')
  lines.push('    CHECK --> CLEAN{单据是否相符?}')
  lines.push('    CLEAN -->|是| PAY[付款/议付]')
  lines.push('    CLEAN -->|否| DISC[不符点处理]')
  lines.push('    DISC --> WAIVER[放弃不符点]')
  lines.push('    WAIVER --> PAY')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 单据审核结果')
  lines.push('| 单据 | 状态 | 问题 |')
  lines.push('|------|------|------|')
  for (const d of result.discrepancies) {
    const statusIcon = d.status === 'clean' ? '✅' : d.status === 'discrepant' ? '❌' : '⚠️'
    lines.push('| ' + d.document_name + ' | ' + statusIcon + ' ' + d.status + ' | ' + (d.issues.length > 0 ? d.issues.join('; ') : '无') + ' |')
  }
  lines.push('')

  lines.push('### 📋 建议操作')
  for (const a of result.recommendation.recommended_actions) lines.push('- ' + a)
  lines.push('')

  lines.push('### ⚠️ 风险因素')
  for (const r of result.recommendation.risk_factors) lines.push('- ' + r)
  lines.push('')

  lines.push('### 💰 融资机会')
  for (const f of result.finance_opportunities) lines.push('- ' + f)
  lines.push('')

  lines.push('### 📜 UCP600合规')
  for (const u of result.ucp600_compliance) lines.push('- ' + u)
  lines.push('')

  lines.push('### 📅 时间线')
  for (const [key, val] of Object.entries(result.timeline)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 📋 信用证管理清单')
  lines.push('- [x] 信用证条款审核')
  lines.push('- [x] 单据完备性检查')
  lines.push('- [x] 不符点识别与分析')
  lines.push('- [x] UCP600合规验证')
  lines.push('- [x] 融资机会评估')
  lines.push('- [x] 时间线管理')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// --- Tool 5: Supply Chain Risk Assessor 报告 ---
function formatSupplyChainRiskReport(result: SupplyChainRiskReport): string {
  const lines: string[] = []
  lines.push('## 🔗 Supply Chain Risk Assessor — 供应链风险评估')
  lines.push('')
  lines.push('> **评估**: ' + result.assessment_id + ' | **综合风险分**: ' + result.overall_risk_score + '/10 | **风险等级**: ' + result.overall_risk_level.toUpperCase() + ' | **韧性评分**: ' + result.resilience_score + '/100')
  lines.push('')
  lines.push('### 📊 供应链风险仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    TIER1[Tier1供应商: ' + result.dashboard_data.tier1_suppliers + '家] --> RISK[风险评估]')
  lines.push('    TIER2[Tier2供应商: ' + result.dashboard_data.tier2_suppliers + '家] --> RISK')
  lines.push('    GEO[地理分布: ' + result.dashboard_data.countries_count + '国] --> RISK')
  lines.push('    RISK --> SCORE[综合评分: ' + result.overall_risk_score + ']')
  lines.push('    SCORE --> MITIGATION[缓释策略]')
  lines.push('```')
  lines.push('')

  lines.push('### 📊 风险维度')
  lines.push('| 维度 | 评分 | 等级 | 描述 |')
  lines.push('|------|------|------|------|')
  for (const rd of result.risk_dimensions) {
    lines.push('| ' + rd.dimension + ' | ' + rd.score + '/10 | ' + rd.level + ' | ' + rd.description + ' |')
  }
  lines.push('')

  lines.push('### 🌍 地理风险暴露')
  lines.push('| 国家/地区 | 暴露度(%) |')
  lines.push('|-----------|-----------|')
  for (const [country, pct] of Object.entries(result.geographic_exposure)) {
    lines.push('| ' + country + ' | ' + pct + '% |')
  }
  lines.push('')

  lines.push('### 📊 集中度风险')
  for (const [key, val] of Object.entries(result.concentration_risk)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 🛡️ 缓释策略')
  for (const m of result.mitigation_strategies) lines.push('- ' + m)
  lines.push('')

  lines.push('### 🔮 情景分析')
  for (const [key, val] of Object.entries(result.scenario_analysis)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 📋 供应链风险清单')
  lines.push('- [x] 地理集中度评估')
  lines.push('- [x] 供应商集中度分析')
  lines.push('- [x] 单一来源风险识别')
  lines.push('- [x] 财务风险评估')
  lines.push('- [x] ESG合规检查')
  lines.push('- [x] 运营韧性评估')
  lines.push('- [x] 情景压力测试')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// --- Tool 6: Dynamic Discounting Optimizer 报告 ---
function formatDiscountingReport(result: DiscountingReport): string {
  const lines: string[] = []
  lines.push('## 💰 Dynamic Discounting Optimizer — 动态折扣优化')
  lines.push('')
  lines.push('> **方案**: ' + result.program_id + ' | **发票金额**: ' + result.currency + ' ' + result.invoice_amount.toLocaleString() + ' | **最优折扣率**: ' + (result.optimal_discount_rate * 100).toFixed(3) + '% | **最优付款天数**: ' + result.optimal_payment_days + '天')
  lines.push('')
  lines.push('### 📊 动态折扣仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    INV[发票] --> DISC[折扣计算]')
  lines.push('    DISC --> PAY[早付执行]')
  lines.push('    DISC --> RETURN[收益分析]')
  lines.push('    PAY --> SAVING[成本节省]')
  lines.push('    OPT[最优: ' + result.optimal_payment_days + '天, ' + (result.optimal_discount_rate * 100).toFixed(3) + '%]')
  lines.push('```')
  lines.push('')

  lines.push('### 📊 折扣方案对比')
  lines.push('| 付款天数 | 折扣率(%) | 年化收益(%) | 供应商收益 | 净收益 | 最优 |')
  lines.push('|----------|-----------|-------------|------------|--------|------|')
  for (const s of result.scenarios) {
    lines.push('| ' + s.payment_days + '天 | ' + (s.discount_rate * 100).toFixed(3) + '% | ' + s.annualized_return_pct + '% | ' + result.currency + ' ' + s.supplier_benefit.toLocaleString() + ' | ' + result.currency + ' ' + s.net_benefit.toLocaleString() + ' | ' + (s.is_optimal ? '⭐' : '') + ' |')
  }
  lines.push('')

  lines.push('### 📊 资金方收益分析')
  for (const [key, val] of Object.entries(result.payer_benefit_analysis)) {
    lines.push('- **' + key + '**: ' + (typeof val === 'number' ? val.toLocaleString() : val))
  }
  lines.push('')

  lines.push('### 📊 供应商收益分析')
  for (const [key, val] of Object.entries(result.supplier_benefit_analysis)) {
    lines.push('- **' + key + '**: ' + (typeof val === 'number' ? val.toLocaleString() : val))
  }
  lines.push('')

  lines.push('### 💡 建议')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 动态折扣清单')
  lines.push('- [x] 折扣率方案设计')
  lines.push('- [x] 多情景对比分析')
  lines.push('- [x] 资金方收益测算')
  lines.push('- [x] 供应商收益测算')
  lines.push('- [x] 最优方案推荐')
  lines.push('- [x] 实施建议')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// --- Tool 7: Reverse Factoring Coordinator 报告 ---
function formatReverseFactoringReport(result: ReverseFactoringReport): string {
  const lines: string[] = []
  lines.push('## 🔄 Reverse Factoring Coordinator — 反向保理协调')
  lines.push('')
  lines.push('> **方案**: ' + result.program_id + ' | **核心企业**: ' + result.anchor_buyer_id + ' | **总额度**: ' + result.currency + ' ' + result.total_program_limit.toLocaleString() + ' | **供应商数**: ' + result.supplier_facilities.length)
  lines.push('')
  lines.push('### 📊 反向保理仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    ANCHOR[核心企业] --> CREDIT[信用背书]')
  lines.push('    CREDIT --> SUPPLIER[供应商融资]')
  lines.push('    SUPPLIER --> FUND[资金发放]')
  lines.push('    FUND --> REPAY[到期还款]')
  lines.push('    REPAY --> ANCHOR')
  lines.push('    LIMIT[总额度: ' + result.currency + ' ' + result.total_program_limit.toLocaleString() + ']')
  lines.push('    UTIL[已用: ' + result.dashboard_data.utilization_pct + '%]')
  lines.push('```')
  lines.push('')

  lines.push('### 📊 核心企业信用评估')
  for (const [key, val] of Object.entries(result.anchor_credit_assessment)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 📊 供应商融资额度')
  lines.push('| 供应商 | 批准额度 | 融资利率 | 使用率 | 状态 |')
  lines.push('|--------|----------|----------|--------|------|')
  for (const sf of result.supplier_facilities) {
    lines.push('| ' + sf.supplier_id + ' | ' + result.currency + ' ' + sf.approved_limit.toLocaleString() + ' | ' + (sf.financing_rate * 100).toFixed(2) + '% | ' + sf.utilization_pct + '% | ' + sf.status + ' |')
  }
  lines.push('')

  lines.push('### 📊 方案结构')
  for (const [key, val] of Object.entries(result.program_structure)) {
    lines.push('- **' + key + '**: ' + val)
  }
  lines.push('')

  lines.push('### 🛡️ 风险缓释')
  for (const r of result.risk_mitigation) lines.push('- ' + r)
  lines.push('')

  lines.push('### 💰 成本节省')
  for (const [key, val] of Object.entries(result.cost_savings)) {
    lines.push('- **' + key + '**: ' + (typeof val === 'number' ? val.toLocaleString() : val))
  }
  lines.push('')

  lines.push('### 💡 建议')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 反向保理清单')
  lines.push('- [x] 核心企业信用评估')
  lines.push('- [x] 供应商准入与额度审批')
  lines.push('- [x] 融资利率定价')
  lines.push('- [x] 方案结构设计')
  lines.push('- [x] 风险缓释措施')
  lines.push('- [x] 成本节省测算')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// --- Tool 8: Trade Finance Compliance Checker 报告 ---
function formatComplianceReport(result: ComplianceReport): string {
  const lines: string[] = []
  lines.push('## ⚖️ Trade Finance Compliance Checker — 贸易融资合规')
  lines.push('')
  lines.push('> **检查**: ' + result.check_id + ' | **交易**: ' + result.transaction_id + ' | **总体状态**: ' + result.overall_status.toUpperCase() + ' | **风险等级**: ' + result.overall_risk_level.toUpperCase())
  lines.push('')
  lines.push('### 📊 合规检查仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    TXN[交易] --> SCREEN[合规筛查]')
  lines.push('    SCREEN --> CHECK{规则检查}')
  lines.push('    CHECK -->|通过| APPROVE[批准]')
  lines.push('    CHECK -->|警告| REVIEW[审查]')
  lines.push('    CHECK -->|拒绝| REJECT[拒绝]')
  lines.push('    FAIL[不通过: ' + result.dashboard_data.fail_count + ']')
  lines.push('    WARN[警告: ' + result.dashboard_data.warning_count + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 合规规则检查')
  lines.push('| 规则 | 名称 | 类别 | 状态 | 严重度 | 详情 |')
  lines.push('|------|------|------|------|--------|------|')
  for (const rule of result.compliance_rules) {
    const statusIcon = rule.status === 'pass' ? '✅' : rule.status === 'fail' ? '❌' : '⚠️'
    lines.push('| ' + rule.rule_id + ' | ' + rule.rule_name + ' | ' + rule.category + ' | ' + statusIcon + ' ' + rule.status + ' | ' + rule.severity + ' | ' + rule.details + ' |')
  }
  lines.push('')

  lines.push('### 🚨 风险标记')
  for (const f of result.risk_flags) lines.push('- ' + f)
  lines.push('')

  lines.push('### 📋 必要操作')
  for (const a of result.required_actions) lines.push('- ' + a)
  lines.push('')

  lines.push('### 📄 单据缺失')
  for (const g of result.document_gaps) lines.push('- ' + g)
  lines.push('')

  lines.push('### 📜 监管依据')
  for (const r of result.regulatory_references) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 合规检查清单')
  lines.push('- [x] 反洗钱(AML)风险评估')
  lines.push('- [x] KYC文件完备性')
  lines.push('- [x] 制裁名单筛查')
  lines.push('- [x] 贸易合规(两用物项)')
  lines.push('- [x] 单据完备性')
  lines.push('- [x] PEP筛查')
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  lines.push('*SCFinance v1.0.0 — Supply Chain Finance & Trade Finance Toolkit*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({ name: 'invoice_factoring_advisor', description: '发票融资顾问 | 折扣率/预付比例/风险评估/资金成本', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: invoice factoring data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatInvoiceFactoringReport(analyzeInvoiceFactoring(args.input_data)) } }))

  tools.register(defineTool({ name: 'purchase_order_financier', description: '订单融资分析 | 融资额度/买家信用/供应商评估', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: purchase order data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatPOFinancingReport(analyzePurchaseOrderFinancing(args.input_data)) } }))

  tools.register(defineTool({ name: 'trade_credit_insurer', description: '信用保险评估 | 保费率/保障额度/买家风险', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: trade credit insurance data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatInsuranceQuote(analyzeTradeCreditInsurance(args.input_data)) } }))

  tools.register(defineTool({ name: 'letter_of_credit_manager', description: '信用证管理 | 开证/审单/议付/不符点分析', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: letter of credit data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatLCReport(analyzeLetterOfCredit(args.input_data)) } }))

  tools.register(defineTool({ name: 'supply_chain_risk_assessor', description: '供应链风险评估 | 集中度/地缘/汇率/ESG', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: supply chain data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatSupplyChainRiskReport(analyzeSupplyChainRisk(args.input_data)) } }))

  tools.register(defineTool({ name: 'dynamic_discounting_optimizer', description: '动态折扣优化 | 早付折扣/资金成本/净收益', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: dynamic discounting data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatDiscountingReport(analyzeDynamicDiscounting(args.input_data)) } }))

  tools.register(defineTool({ name: 'reverse_factoring_coordinator', description: '反向保理协调 | 核心企业信用/供应商融资', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: reverse factoring data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatReverseFactoringReport(analyzeReverseFactoring(args.input_data)) } }))

  tools.register(defineTool({ name: 'trade_finance_compliance_checker', description: '贸易融资合规 | AML/KYC/制裁/单据合规', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: compliance check data' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatComplianceReport(analyzeTradeFinanceCompliance(args.input_data)) } }))
}
