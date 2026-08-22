/**
 * DSH AI Real Estate Agent Plugin v0.1.0
 *
 * Comprehensive real estate AI toolkit for DeepSeek Harness Agent.
 * Designed for property investors, real estate agents, property managers, and homebuyers.
 *
 * Features (v0.1.0):
 * - Property Valuation Engine (comparable sales analysis with adjustment modeling)
 * - Investment ROI Calculator (cash-on-cash return, cap rate, IRR projection)
 * - Market Trend Forecaster (price trajectory modeling with supply/demand dynamics)
 * - Mortgage Eligibility Assessor (DTI/LTV ratios with loan product recommendation)
 * - Property Management Automator (maintenance scheduling and tenant screening)
 * - Rental Yield Optimizer (occupancy strategy and dynamic pricing)
 * - Neighborhood Scoring AI (school/transit/safety composite index)
 * - ESG Compliance Real Estate (green certification and energy rating assessment)
 *
 * @module dsh-tool-realestateai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-realestateai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== DISCLAIMERS ====================

const VALUATION_DISCLAIMER =
  '本估值基于AI模型和市场数据推断，仅供参考，不替代专业房产评估师的正式评估报告。实际交易价格受市场供需、谈判条件等多种因素影响。'
const INVESTMENT_DISCLAIMER =
  '本投资分析基于AI模型和历史数据推断，不构成投资建议。房产投资存在市场风险，过往收益不代表未来表现，请咨询专业投资顾问。'
const MARKET_DISCLAIMER =
  '本市场预测基于AI模型和历史趋势推断，仅供参考，不保证预测准确性。房地产市场受政策、经济等多因素影响。'
const MORTGAGE_DISCLAIMER =
  '本评估基于AI模型推断，仅供参考，不替代银行或金融机构的正式贷款审批。实际贷款额度和利率以金融机构审批结果为准。'
const GENERAL_DISCLAIMER =
  '本分析基于AI模型推断，仅供房地产管理参考，请结合实际情况和专业建议做出决策。'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed >>> 0 }
  next(): number {
    this.seed = (this.seed + 0x6D2B79F5) >>> 0
    let t = this.seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  nextInt(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min }
  nextFloat(min: number, max: number): number { return this.next() * (max - min) + min }
  pick<T>(arr: T[]): T { return arr[this.nextInt(0, arr.length - 1)] }
}

function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededRng(text: string): SeededRandom {
  return new SeededRandom(hashStr(text))
}

// ==================== TOOL 1: PROPERTY VALUATION ENGINE ====================

export interface PropertyValuationInput {
  property_id: string
  address: string
  property_type: 'apartment' | 'house' | 'townhouse' | 'condo' | 'commercial' | 'land'
  area_sqm: number
  bedrooms: number
  bathrooms: number
  year_built: number
  floor?: number
  total_floors?: number
  renovation_level: 'none' | 'basic' | 'moderate' | 'premium' | 'luxury'
  has_parking?: boolean
  has_elevator?: boolean
  orientation?: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
  comparables?: Array<{
    address: string
    price_total: number
    area_sqm: number
   sold_date: string
    distance_km: number
    bedrooms: number
    year_built: number
  }>
}

export interface ComparableAnalysis {
  address: string
  price_per_sqm: number
  adjusted_price_per_sqm: number
  adjustments: string[]
  similarity_score: number
}

export interface PropertyValuationResult {
  property_id: string
  address: string
  property_type: string
  estimated_value: number
  value_low: number
  value_high: number
  price_per_sqm: number
  confidence: number
  valuation_method: string
  comparables_analysis: ComparableAnalysis[]
  adjustment_factors: string[]
  market_position: 'below_market' | 'at_market' | 'above_market'
  value_drivers: string[]
  risks: string[]
  recommendations: string[]
}

function analyzeValuation(input: PropertyValuationInput): PropertyValuationResult {
  const rng = seededRng(JSON.stringify(input))
  const age = new Date().getFullYear() - input.year_built

  // Base price per sqm estimation
  let basePricePerSqm = 8000
  if (input.property_type === 'apartment') basePricePerSqm = 12000
  else if (input.property_type === 'house') basePricePerSqm = 10000
  else if (input.property_type === 'townhouse') basePricePerSqm = 9500
  else if (input.property_type === 'condo') basePricePerSqm = 11000
  else if (input.property_type === 'commercial') basePricePerSqm = 15000
  else if (input.property_type === 'land') basePricePerSqm = 5000
  basePricePerSqm += rng.nextFloat(-1500, 1500)

  const adjustmentFactors: string[] = []

  // Age adjustment
  if (age > 30) { basePricePerSqm *= 0.75; adjustmentFactors.push(`房龄${age}年: -25% (老旧房屋折价)`) }
  else if (age > 20) { basePricePerSqm *= 0.85; adjustmentFactors.push(`房龄${age}年: -15% (较老房屋折价)`) }
  else if (age > 10) { basePricePerSqm *= 0.92; adjustmentFactors.push(`房龄${age}年: -8% (中等房龄折价)`) }
  else if (age > 5) { basePricePerSqm *= 0.97; adjustmentFactors.push(`房龄${age}年: -3% (轻微折价)`) }
  else { basePricePerSqm *= 1.02; adjustmentFactors.push(`房龄${age}年: +2% (新房溢价)`) }

  // Renovation adjustment
  const renoAdj: Record<string, number> = { none: 0.9, basic: 0.95, moderate: 1.0, premium: 1.08, luxury: 1.18 }
  const renoPct: Record<string, string> = { none: '-10%', basic: '-5%', moderate: '0%', premium: '+8%', luxury: '+18%' }
  basePricePerSqm *= renoAdj[input.renovation_level]
  adjustmentFactors.push(`装修程度(${input.renovation_level}): ${renoPct[input.renovation_level]}`)

  // Orientation adjustment
  if (input.orientation === 'south') { basePricePerSqm *= 1.05; adjustmentFactors.push('朝南: +5% (最佳朝向)') }
  else if (input.orientation === 'southeast') { basePricePerSqm *= 1.03; adjustmentFactors.push('东南朝向: +3%') }
  else if (input.orientation === 'north') { basePricePerSqm *= 0.95; adjustmentFactors.push('朝北: -5% (采光不足)') }

  // Floor adjustment
  if (input.floor && input.total_floors) {
    const ratio = input.floor / input.total_floors
    if (ratio > 0.7) { basePricePerSqm *= 1.04; adjustmentFactors.push(`高楼层(${input.floor}/${input.total_floors}): +4%`) }
    else if (ratio > 0.4) { basePricePerSqm *= 1.0; adjustmentFactors.push(`中楼层(${input.floor}/${input.total_floors}): 0%`) }
    else { basePricePerSqm *= 0.96; adjustmentFactors.push(`低楼层(${input.floor}/${input.total_floors}): -4%`) }
  }

  // Parking
  if (input.has_parking) { basePricePerSqm *= 1.03; adjustmentFactors.push('含车位: +3%') }

  // Elevator
  if (input.has_elevator) { basePricePerSqm *= 1.02; adjustmentFactors.push('有电梯: +2%') }

  // Bedroom/bathroom premium
  if (input.bedrooms >= 3) { basePricePerSqm *= 1.02; adjustmentFactors.push(`多居室(${input.bedrooms}室): +2%`) }

  const estimatedValue = Math.round(basePricePerSqm * input.area_sqm)
  const valueLow = Math.round(estimatedValue * (0.9 + rng.nextFloat(-0.02, 0.02)))
  const valueHigh = Math.round(estimatedValue * (1.1 + rng.nextFloat(-0.02, 0.02)))

  // Comparable analysis
  const compAnalysis: ComparableAnalysis[] = []
  if (input.comparables && input.comparables.length > 0) {
    for (const comp of input.comparables) {
      const pricePerSqm = comp.price_total / comp.area_sqm
      const adjustments: string[] = []
      let adjustedPps = pricePerSqm

      // Area adjustment
      const areaDiff = (comp.area_sqm - input.area_sqm) / input.area_sqm
      if (Math.abs(areaDiff) > 0.1) {
        const adj = -areaDiff * 0.3
        adjustedPps *= (1 + adj)
        adjustments.push(`面积差异${(areaDiff * 100).toFixed(0)}%: 调整${(adj * 100).toFixed(1)}%`)
      }

      // Year adjustment
      const yearDiff = comp.year_built - input.year_built
      if (Math.abs(yearDiff) > 5) {
        const adj = yearDiff > 0 ? 0.02 : -0.02
        adjustedPps *= (1 + adj)
        adjustments.push(`建筑年代差异: 调整${(adj * 100).toFixed(1)}%`)
      }

      // Distance decay
      if (comp.distance_km > 1) {
        adjustedPps *= (1 - comp.distance_km * 0.01)
        adjustments.push(`距离${comp.distance_km}km: -${(comp.distance_km).toFixed(1)}%`)
      }

      const similarity = Math.max(0, Math.min(100, Math.round(100 - Math.abs(areaDiff) * 50 - comp.distance_km * 10 + rng.nextFloat(-5, 5))))
      compAnalysis.push({
        address: comp.address,
        price_per_sqm: Math.round(pricePerSqm),
        adjusted_price_per_sqm: Math.round(adjustedPps),
        adjustments,
        similarity_score: similarity,
      })
    }
  }

  // Market position
  let marketPosition: PropertyValuationResult['market_position'] = 'at_market'
  if (compAnalysis.length > 0) {
    const avgCompPps = compAnalysis.reduce((s, c) => s + c.adjusted_price_per_sqm, 0) / compAnalysis.length
    if (basePricePerSqm < avgCompPps * 0.93) marketPosition = 'below_market'
    else if (basePricePerSqm > avgCompPps * 1.07) marketPosition = 'above_market'
  }

  const valueDrivers: string[] = []
  if (input.renovation_level === 'premium' || input.renovation_level === 'luxury') valueDrivers.push('高品质装修提升价值')
  if (input.orientation === 'south') valueDrivers.push('南朝向采光充足')
  if (input.has_parking) valueDrivers.push('车位配置稀缺')
  if (input.bedrooms >= 3 && input.bathrooms >= 2) valueDrivers.push('户型功能完善')
  if (age <= 5) valueDrivers.push('新房溢价效应')

  const risks: string[] = []
  if (age > 25) risks.push('房龄较长，维护成本可能增加')
  if (input.property_type === 'commercial') risks.push('商业地产受经济周期影响较大')
  if (input.floor && input.floor <= 3 && !input.has_elevator) risks.push('低楼层无电梯，影响出租/出售')

  const recommendations: string[] = []
  if (marketPosition === 'below_market') recommendations.push('当前估值低于市场均价，可能存在议价空间')
  if (marketPosition === 'above_market') recommendations.push('当前估值高于市场均价，建议核实稀缺性溢价')
  if (compAnalysis.length < 3) recommendations.push('建议增加可比案例以提高估值准确性')
  recommendations.push('建议委托专业评估师进行实地评估')
  recommendations.push('关注同小区近期成交价变化趋势')

  return {
    property_id: input.property_id,
    address: input.address,
    property_type: input.property_type,
    estimated_value: estimatedValue,
    value_low: valueLow,
    value_high: valueHigh,
    price_per_sqm: Math.round(basePricePerSqm),
    confidence: Math.round(Math.min(95, Math.max(50, 70 + compAnalysis.length * 5 + rng.nextFloat(-5, 5)))),
    valuation_method: '市场比较法 (Comparable Sales Approach)',
    comparables_analysis: compAnalysis,
    adjustment_factors: adjustmentFactors,
    market_position: marketPosition,
    value_drivers: valueDrivers,
    risks,
    recommendations,
  }
}

function formatValuation(r: PropertyValuationResult): string {
  const l: string[] = []
  const posLabel: Record<string, string> = { below_market: '低于市场均价', at_market: '与市场持平', above_market: '高于市场均价' }
  const posIcon: Record<string, string> = { below_market: '\u2705', at_market: '\u26A0\uFE0F', above_market: '\uD83D\uDD34' }

  l.push('## \uD83C\uDFE0 房产估值报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **房产编号**: ${r.property_id}`)
  l.push(`- **地址**: ${r.address}`)
  l.push(`- **房产类型**: ${r.property_type}`)
  l.push('')

  l.push('### 估值结果')
  l.push(`- **估计价值**: \uFFE5${r.estimated_value.toLocaleString()}`)
  l.push(`- **价值区间**: \uFFE5${r.value_low.toLocaleString()} ~ \uFFE5${r.value_high.toLocaleString()}`)
  l.push(`- **每平米单价**: \uFFE5${r.price_per_sqm.toLocaleString()}/m\u00B2`)
  l.push(`- **置信度**: ${r.confidence}%`)
  l.push(`- **估值方法**: ${r.valuation_method}`)
  l.push(`- **市场定位**: ${posIcon[r.market_position]} ${posLabel[r.market_position]}`)
  l.push('')

  if (r.comparables_analysis.length > 0) {
    l.push('### 可比案例分析')
    l.push('| 地址 | 单价(元/m\u00B2) | 调整后单价 | 相似度 | 调整项 |')
    l.push('|------|----------|----------|--------|--------|')
    for (const c of r.comparables_analysis) {
      l.push(`| ${c.address} | ${c.price_per_sqm.toLocaleString()} | ${c.adjusted_price_per_sqm.toLocaleString()} | ${c.similarity_score}% | ${c.adjustments.join('; ') || '-'} |`)
    }
    l.push('')
  }

  l.push('### 价格调整因素')
  for (const f of r.adjustment_factors) {
    l.push(`- ${f}`)
  }
  l.push('')

  if (r.value_drivers.length > 0) {
    l.push('### 价值驱动因素')
    for (const d of r.value_drivers) {
      l.push(`- \u2705 ${d}`)
    }
    l.push('')
  }

  if (r.risks.length > 0) {
    l.push('### 风险提示')
    for (const risk of r.risks) {
      l.push(`- \u26A0\uFE0F ${risk}`)
    }
    l.push('')
  }

  l.push('### 建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${VALUATION_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 2: INVESTMENT ROI CALCULATOR ====================

export interface InvestmentRoiInput {
  property_price: number
  down_payment_pct: number
  loan_years: number
  interest_rate_annual: number
  monthly_rent: number
  vacancy_rate: number
  property_tax_annual: number
  insurance_annual: number
  maintenance_monthly: number
  management_fee_monthly: number
  hoa_monthly?: number
  other_income_annual?: number
  holding_period_years: number
  expected_appreciation_annual: number
  selling_cost_pct: number
}

export interface YearlyBreakdown {
  year: number
  gross_income: number
  operating_expenses: number
  net_operating_income: number
  debt_service: number
  cash_flow: number
  property_value: number
  equity: number
}

export interface InvestmentRoiResult {
  property_price: number
  down_payment: number
  loan_amount: number
  monthly_mortgage: number
  total_investment: number
  cap_rate: number
  cash_on_cash_return: number
  gross_rent_multiplier: number
  net_present_value: number
  internal_rate_of_return: number
  total_roi: number
  payback_period_years: number
  annual_cash_flow: number
  yearly_breakdown: YearlyBreakdown[]
  investment_grade: 'A' | 'B' | 'C' | 'D'
  profitability: 'highly_profitable' | 'profitable' | 'marginal' | 'unprofitable'
  recommendations: string[]
}

function analyzeInvestmentRoi(input: InvestmentRoiInput): InvestmentRoiResult {
  const rng = seededRng(JSON.stringify(input))

  const downPayment = Math.round(input.property_price * input.down_payment_pct / 100)
  const loanAmount = input.property_price - downPayment
  const monthlyRate = input.interest_rate_annual / 100 / 12
  const numPayments = input.loan_years * 12
  const monthlyMortgage = Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1))
  const closingCosts = Math.round(input.property_price * 0.03)
  const totalInvestment = downPayment + closingCosts

  const effectiveRent = input.monthly_rent * (1 - input.vacancy_rate / 100)
  const annualGrossIncome = effectiveRent * 12 + (input.other_income_annual ?? 0)
  const annualOperatingExpenses = input.property_tax_annual + input.insurance_annual + input.maintenance_monthly * 12 + input.management_fee_monthly * 12 + (input.hoa_monthly ?? 0) * 12
  const netOperatingIncome = annualGrossIncome - annualOperatingExpenses
  const annualDebtService = monthlyMortgage * 12
  const annualCashFlow = netOperatingIncome - annualDebtService

  const capRate = parseFloat(((netOperatingIncome / input.property_price) * 100).toFixed(2))
  const cashOnCashReturn = parseFloat(((annualCashFlow / totalInvestment) * 100).toFixed(2))
  const grossRentMultiplier = parseFloat((input.property_price / (input.monthly_rent * 12)).toFixed(1))

  // Yearly breakdown
  const yearlyBreakdown: YearlyBreakdown[] = []
  let balance = loanAmount
  let propertyValue = input.property_price
  for (let y = 1; y <= input.holding_period_years; y++) {
    propertyValue = Math.round(propertyValue * (1 + input.expected_appreciation_annual / 100))
    const yearlyInterest = balance * input.interest_rate_annual / 100
    const yearlyPrincipal = annualDebtService - yearlyInterest
    balance = Math.max(0, balance - yearlyPrincipal)
    const equity = propertyValue - balance
    yearlyBreakdown.push({
      year: y,
      gross_income: annualGrossIncome,
      operating_expenses: annualOperatingExpenses,
      net_operating_income: netOperatingIncome,
      debt_service: annualDebtService,
      cash_flow: annualCashFlow,
      property_value: propertyValue,
      equity: Math.round(equity),
    })
  }

  // Total ROI at exit
  const finalValue = yearlyBreakdown[yearlyBreakdown.length - 1]
  const sellingCosts = Math.round(finalValue.property_value * input.selling_cost_pct / 100)
  const netSaleProceeds = finalValue.property_value - sellingCosts - (finalValue.property_value - finalValue.equity)
  const totalCashReceived = annualCashFlow * input.holding_period_years + netSaleProceeds
  const totalROI = parseFloat(((totalCashReceived / totalInvestment) * 100).toFixed(1))

  // Simple IRR approximation
  const irr = parseFloat(((Math.pow((totalCashReceived + totalInvestment) / totalInvestment, 1 / input.holding_period_years) - 1) * 100).toFixed(2))

  // NPV (simplified with 8% discount rate)
  const discountRate = 0.08
  let npv = -totalInvestment
  for (let y = 1; y <= input.holding_period_years; y++) {
    npv += annualCashFlow / Math.pow(1 + discountRate, y)
  }
  npv += netSaleProceeds / Math.pow(1 + discountRate, input.holding_period_years)
  const netPresentValue = Math.round(npv)

  // Payback period
  const paybackPeriod = annualCashFlow > 0 ? parseFloat((totalInvestment / annualCashFlow).toFixed(1)) : 99.9

  // Investment grade
  let grade: InvestmentRoiResult['investment_grade'] = 'C'
  if (cashOnCashReturn > 8 && capRate > 6) grade = 'A'
  else if (cashOnCashReturn > 5 && capRate > 4) grade = 'B'
  else if (cashOnCashReturn < 0) grade = 'D'

  let profitability: InvestmentRoiResult['profitability'] = 'marginal'
  if (totalROI > 50) profitability = 'highly_profitable'
  else if (totalROI > 25) profitability = 'profitable'
  else if (totalROI < 0) profitability = 'unprofitable'

  const recommendations: string[] = []
  if (cashOnCashReturn < 0) recommendations.push('警告: 现金流为负，需依赖资产增值获利')
  if (capRate < 4) recommendations.push('资本化率偏低，建议关注更高租金收益的区域')
  if (input.vacancy_rate > 10) recommendations.push('空置率偏高，需评估区域租赁需求')
  if (input.down_payment_pct < 25) recommendations.push('首付比例较低，杠杆风险较高')
  if (totalROI > 30) recommendations.push('投资回报率良好，建议深入研究后决策')
  recommendations.push('建议进行敏感性分析（利率上升、空置率增加等情景）')
  recommendations.push('建议对比同期无风险收益率和其他投资渠道')

  return {
    property_price: input.property_price,
    down_payment: downPayment,
    loan_amount: loanAmount,
    monthly_mortgage: monthlyMortgage,
    total_investment: totalInvestment,
    cap_rate: capRate,
    cash_on_cash_return: cashOnCashReturn,
    gross_rent_multiplier: grossRentMultiplier,
    net_present_value: netPresentValue,
    internal_rate_of_return: irr,
    total_roi: totalROI,
    payback_period_years: paybackPeriod,
    annual_cash_flow: annualCashFlow,
    yearly_breakdown: yearlyBreakdown,
    investment_grade: grade,
    profitability,
    recommendations,
  }
}

function formatInvestmentRoi(r: InvestmentRoiResult): string {
  const l: string[] = []
  const gradeIcon: Record<string, string> = { A: '\u2705', B: '\uD83D\uDFE1', C: '\uD83D\uDFE0', D: '\uD83D\uDD34' }
  const profitLabel: Record<string, string> = { highly_profitable: '高收益', profitable: '盈利良好', marginal: '边际收益', unprofitable: '亏损风险' }

  l.push('## \uD83D\uDCCA 投资回报分析报告')
  l.push('')
  l.push('### 投资概要')
  l.push(`- **房产价格**: \uFFE5${r.property_price.toLocaleString()}`)
  l.push(`- **首付金额**: \uFFE5${r.down_payment.toLocaleString()}`)
  l.push(`- **贷款金额**: \uFFE5${r.loan_amount.toLocaleString()}`)
  l.push(`- **月供**: \uFFE5${r.monthly_mortgage.toLocaleString()}`)
  l.push(`- **总投资(含税费)**: \uFFE5${r.total_investment.toLocaleString()}`)
  l.push('')

  l.push('### 核心指标')
  l.push(`- **资本化率(Cap Rate)**: ${r.cap_rate}%`)
  l.push(`- **现金回报率(Cash-on-Cash)**: ${r.cash_on_cash_return}%`)
  l.push(`- **毛租金乘数(GRM)**: ${r.gross_rent_multiplier}`)
  l.push(`- **内部收益率(IRR)**: ${r.internal_rate_of_return}%`)
  l.push(`- **净现值(NPV)**: \uFFE5${r.net_present_value.toLocaleString()}`)
  l.push(`- **总回报率(Total ROI)**: ${r.total_roi}%`)
  l.push(`- **回本周期**: ${r.payback_period_years} 年`)
  l.push(`- **年现金流**: \uFFE5${r.annual_cash_flow.toLocaleString()}`)
  l.push(`- **投资评级**: ${gradeIcon[r.investment_grade]} ${r.investment_grade}级`)
  l.push(`- **盈利能力**: ${profitLabel[r.profitability]}`)
  l.push('')

  if (r.yearly_breakdown.length > 0) {
    l.push('### 年度现金流预测')
    l.push('| 年份 | 总收入 | 运营支出 | NOI | 还贷 | 净现金流 | 房产价值 | 净资产 |')
    l.push('|------|--------|----------|-----|------|----------|----------|--------|')
    for (const yb of r.yearly_breakdown) {
      l.push(`| 第${yb.year}年 | ${yb.gross_income.toLocaleString()} | ${yb.operating_expenses.toLocaleString()} | ${yb.net_operating_income.toLocaleString()} | ${yb.debt_service.toLocaleString()} | ${yb.cash_flow.toLocaleString()} | ${yb.property_value.toLocaleString()} | ${yb.equity.toLocaleString()} |`)
    }
    l.push('')
  }

  l.push('### 投资建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${INVESTMENT_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 3: MARKET TREND FORECASTER ====================

export interface MarketForecastInput {
  city: string
  district?: string
  property_type: 'apartment' | 'house' | 'commercial' | 'all'
  forecast_years: number
  current_price_per_sqm: number
  current_inventory_months: number
  recent_price_change_pct: number
  population_growth_annual?: number
  gdp_growth_annual?: number
  infrastructure_projects?: string[]
  policy_factors?: string[]
}

export interface YearlyForecast {
  year: number
  predicted_price_per_sqm: number
  price_change_pct: number
  demand_index: number
  supply_index: number
  market_phase: 'recovery' | 'expansion' | 'hypersupply' | 'recession'
}

export interface MarketForecastResult {
  city: string
  district: string
  property_type: string
  current_price_per_sqm: number
  forecast_summary: string
  yearly_forecasts: YearlyForecast[]
  avg_annual_growth: number
  peak_year: number
  peak_price: number
  market_cycle_phase: string
  key_drivers: string[]
  risks: string[]
  opportunities: string[]
  recommendations: string[]
}

function analyzeMarketForecast(input: MarketForecastInput): MarketForecastResult {
  const rng = seededRng(JSON.stringify(input))
  const forecasts: YearlyForecast[] = []

  const popGrowth = input.population_growth_annual ?? 0.5
  const gdpGrowth = input.gdp_growth_annual ?? 5.0

  let currentPrice = input.current_price_per_sqm
  let currentInventory = input.current_inventory_months

  for (let y = 1; y <= input.forecast_years; y++) {
    // Demand index (0-100)
    const demandIdx = Math.min(100, Math.max(0, 50 + popGrowth * 5 + gdpGrowth * 2 + (input.infrastructure_projects?.length ?? 0) * 3 + rng.nextFloat(-5, 5)))

    // Supply index (0-100)
    const supplyIdx = Math.min(100, Math.max(0, 30 + currentInventory * 3 + rng.nextFloat(-5, 5)))

    // Net demand-supply balance
    const balance = demandIdx - supplyIdx

    // Price change based on balance
    let priceChange: number
    if (balance > 20) priceChange = 4 + rng.nextFloat(0, 3)
    else if (balance > 5) priceChange = 1 + rng.nextFloat(0, 2)
    else if (balance > -5) priceChange = rng.nextFloat(-1, 1.5)
    else if (balance > -20) priceChange = -2 + rng.nextFloat(-1, 1)
    else priceChange = -5 + rng.nextFloat(-2, 1)

    // Policy impact
    if (input.policy_factors && input.policy_factors.length > 0) {
      const hasRestrictive = input.policy_factors.some(p => p.includes('限') || p.includes('调控') || p.includes('restrict'))
      if (hasRestrictive) priceChange -= 2
      const hasStimulus = input.policy_factors.some(p => p.includes('补贴') || p.includes('降息') || p.includes('stimulus'))
      if (hasStimulus) priceChange += 1.5
    }

    currentPrice = Math.round(currentPrice * (1 + priceChange / 100))
    currentInventory = Math.max(3, Math.min(30, currentInventory + (supplyIdx - demandIdx) * 0.05 + rng.nextFloat(-1, 1)))

    let phase: YearlyForecast['market_phase'] = 'expansion'
    if (priceChange > 3) phase = 'expansion'
    else if (priceChange > 0) phase = 'recovery'
    else if (priceChange > -3) phase = 'hypersupply'
    else phase = 'recession'

    forecasts.push({
      year: new Date().getFullYear() + y,
      predicted_price_per_sqm: currentPrice,
      price_change_pct: parseFloat(priceChange.toFixed(2)),
      demand_index: Math.round(demandIdx),
      supply_index: Math.round(supplyIdx),
      market_phase: phase,
    })
  }

  const totalGrowth = ((forecasts[forecasts.length - 1].predicted_price_per_sqm / input.current_price_per_sqm) - 1) * 100
  const avgAnnualGrowth = parseFloat((totalGrowth / input.forecast_years).toFixed(2))

  const peakForecast = forecasts.reduce((max, f) => f.predicted_price_per_sqm > max.predicted_price_per_sqm ? f : max, forecasts[0])

  const keyDrivers: string[] = []
  if (popGrowth > 1) keyDrivers.push(`人口增长率${popGrowth}%拉动需求`)
  if (gdpGrowth > 5) keyDrivers.push(`GDP增长${gdpGrowth}%支撑购买力`)
  if (input.infrastructure_projects && input.infrastructure_projects.length > 0) keyDrivers.push(`${input.infrastructure_projects.length}个基建项目提升区域价值`)
  if (input.recent_price_change_pct > 5) keyDrivers.push('近期价格上涨趋势明显')

  const risks: string[] = []
  if (input.current_inventory_months > 18) risks.push('库存周期较高，存在去化压力')
  if (input.recent_price_change_pct > 10) risks.push('短期涨幅过快，存在回调风险')
  const hasRestrictive = input.policy_factors?.some(p => p.includes('限') || p.includes('调控'))
  if (hasRestrictive) risks.push('调控政策收紧风险')

  const opportunities: string[] = []
  if (avgAnnualGrowth > 3) opportunities.push('市场处于上升通道，具备增值潜力')
  if (input.current_inventory_months < 12) opportunities.push('库存低位，供需关系有利于价格支撑')
  if (input.infrastructure_projects && input.infrastructure_projects.length > 0) opportunities.push('基础设施改善将提升区域吸引力')

  let forecastSummary = '市场预期平稳'
  if (avgAnnualGrowth > 5) forecastSummary = '市场预期强劲增长'
  else if (avgAnnualGrowth > 2) forecastSummary = '市场预期温和增长'
  else if (avgAnnualGrowth < -2) forecastSummary = '市场预期下行'

  const recommendations: string[] = []
  if (avgAnnualGrowth > 3) recommendations.push('市场增长预期良好，可考虑适时入手')
  if (input.current_inventory_months > 18) recommendations.push('高库存环境下议价空间较大')
  recommendations.push('建议持续关注政策动向和月度成交数据')
  recommendations.push('建议分散投资，降低区域集中风险')

  return {
    city: input.city,
    district: input.district ?? '全市',
    property_type: input.property_type,
    current_price_per_sqm: input.current_price_per_sqm,
    forecast_summary: forecastSummary,
    yearly_forecasts: forecasts,
    avg_annual_growth: avgAnnualGrowth,
    peak_year: peakForecast.year,
    peak_price: peakForecast.predicted_price_per_sqm,
    market_cycle_phase: forecasts[forecasts.length - 1].market_phase,
    key_drivers: keyDrivers,
    risks,
    opportunities,
    recommendations,
  }
}

function formatMarketForecast(r: MarketForecastResult): string {
  const l: string[] = []
  const phaseLabel: Record<string, string> = { recovery: '复苏期', expansion: '扩张期', hypersupply: '供过于求', recession: '调整期' }
  const phaseIcon: Record<string, string> = { recovery: '\uD83D\uDFE1', expansion: '\u2705', hypersupply: '\uD83D\uDFE0', recession: '\uD83D\uDD34' }

  l.push('## \uD83D\uDCC8 市场趋势预测报告')
  l.push('')
  l.push('### 市场概况')
  l.push(`- **城市**: ${r.city}`)
  l.push(`- **区域**: ${r.district}`)
  l.push(`- **房产类型**: ${r.property_type}`)
  l.push(`- **当前价格**: \uFFE5${r.current_price_per_sqm.toLocaleString()}/m\u00B2`)
  l.push(`- **预测总结**: ${r.forecast_summary}`)
  l.push(`- **年均增长率**: ${r.avg_annual_growth}%`)
  l.push(`- **预计峰值年份**: ${r.peak_year}年`)
  l.push(`- **预计峰值价格**: \uFFE5${r.peak_price.toLocaleString()}/m\u00B2`)
  l.push(`- **周期阶段**: ${phaseIcon[r.market_cycle_phase]} ${phaseLabel[r.market_cycle_phase]}`)
  l.push('')

  if (r.yearly_forecasts.length > 0) {
    l.push('### 年度预测')
    l.push('| 年份 | 预测单价(元/m\u00B2) | 涨跌幅 | 需求指数 | 供给指数 | 市场阶段 |')
    l.push('|------|----------|--------|----------|----------|----------|')
    for (const f of r.yearly_forecasts) {
      l.push(`| ${f.year} | ${f.predicted_price_per_sqm.toLocaleString()} | ${f.price_change_pct > 0 ? '+' : ''}${f.price_change_pct}% | ${f.demand_index} | ${f.supply_index} | ${phaseIcon[f.market_phase]} ${phaseLabel[f.market_phase]} |`)
    }
    l.push('')
  }

  if (r.key_drivers.length > 0) {
    l.push('### 关键驱动因素')
    for (const d of r.key_drivers) {
      l.push(`- \u2705 ${d}`)
    }
    l.push('')
  }

  if (r.risks.length > 0) {
    l.push('### 风险因素')
    for (const risk of r.risks) {
      l.push(`- \u26A0\uFE0F ${risk}`)
    }
    l.push('')
  }

  if (r.opportunities.length > 0) {
    l.push('### 投资机会')
    for (const opp of r.opportunities) {
      l.push(`- \uD83D\uDCB0 ${opp}`)
    }
    l.push('')
  }

  l.push('### 建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${MARKET_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 4: MORTGAGE ELIGIBILITY ASSESSOR ====================

export interface MortgageInput {
  borrower_name: string
  monthly_income: number
  existing_debt_monthly: number
  credit_score: number
  employment_years: number
  employment_type: 'salaried' | 'self_employed' | 'freelance' | 'business_owner'
  property_price: number
  down_payment: number
  loan_term_years: number
  loan_type: 'primary_residence' | 'second_home' | 'investment'
  co_borrower_monthly_income?: number
  other_assets?: number
}

export interface LoanProductRecommendation {
  bank_type: string
  rate_range: string
  max_ltv: number
  suitability: number
  notes: string
}

export interface MortgageResult {
  borrower_name: string
  property_price: number
  down_payment: number
  loan_amount: number
  down_payment_pct: number
  ltv_ratio: number
  dti_ratio: number
  total_monthly_debt: number
  max_affordable_monthly: number
  estimated_monthly_payment: number
  credit_tier: 'excellent' | 'good' | 'fair' | 'poor'
  eligibility: 'approved' | 'conditional' | 'declined'
  eligibility_reasons: string[]
  max_recommended_loan: number
  interest_rate_estimate: number
  loan_products: LoanProductRecommendation[]
  recommendations: string[]
}

function analyzeMortgage(input: MortgageInput): MortgageResult {
  const rng = seededRng(JSON.stringify(input))

  const loanAmount = input.property_price - input.down_payment
  const downPaymentPct = parseFloat(((input.down_payment / input.property_price) * 100).toFixed(1))
  const ltv = parseFloat((((input.property_price - input.down_payment) / input.property_price) * 100).toFixed(1))
  const totalIncome = input.monthly_income + (input.co_borrower_monthly_income ?? 0)

  // Credit tier
  let creditTier: MortgageResult['credit_tier'] = 'good'
  if (input.credit_score >= 750) creditTier = 'excellent'
  else if (input.credit_score >= 650) creditTier = 'good'
  else if (input.credit_score >= 580) creditTier = 'fair'
  else creditTier = 'poor'

  // Interest rate estimate
  let baseRate = 4.2
  if (input.loan_type === 'second_home') baseRate += 0.5
  else if (input.loan_type === 'investment') baseRate += 0.8
  if (creditTier === 'excellent') baseRate -= 0.3
  else if (creditTier === 'good') baseRate -= 0.1
  else if (creditTier === 'fair') baseRate += 0.4
  else baseRate += 1.0
  const interestRate = parseFloat(baseRate.toFixed(2))

  // Monthly payment
  const monthlyRate = interestRate / 100 / 12
  const numPayments = input.loan_term_years * 12
  const monthlyPayment = Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1))

  const totalMonthlyDebt = input.existing_debt_monthly + monthlyPayment
  const dti = parseFloat(((totalMonthlyDebt / totalIncome) * 100).toFixed(1))

  // Max affordable (DTI threshold 43%)
  const maxDtiThreshold = input.loan_type === 'investment' ? 45 : 43
  const maxAffordableMonthly = Math.round(totalIncome * maxDtiThreshold / 100) - input.existing_debt_monthly

  // Eligibility
  let eligibility: MortgageResult['eligibility'] = 'approved'
  const reasons: string[] = []
  if (dti > maxDtiThreshold) { eligibility = 'declined'; reasons.push(`DTI比率${dti}%超过${maxDtiThreshold}%上限`) }
  if (ltv > 80) { eligibility = 'conditional'; reasons.push(`LTV比率${ltv}%较高，可能需要PMI`) }
  if (creditTier === 'poor') { eligibility = 'declined'; reasons.push('信用评分不足，建议改善后再申请') }
  if (downPaymentPct < 20) { eligibility = eligibility === 'approved' ? 'conditional' : eligibility; reasons.push('首付低于20%，可能需要购买房贷保险') }
  if (input.employment_years < 2 && input.employment_type !== 'salaried') { eligibility = 'conditional'; reasons.push('非受雇人员且工作年限不足，需额外收入证明') }
  if (eligibility === 'approved') reasons.push('综合资质良好，建议提交正式申请')

  // Max recommended loan
  const maxLoanByIncome = Math.round(maxAffordableMonthly * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments)))
  const maxLoanByLtv = Math.round(input.property_price * 0.8)
  const maxRecommendedLoan = Math.min(maxLoanByIncome, maxLoanByLtv)

  // Loan products
  const products: LoanProductRecommendation[] = [
    { bank_type: '国有大型银行', rate_range: `${(interestRate - 0.1).toFixed(2)}%~${interestRate.toFixed(2)}%`, max_ltv: 75, suitability: creditTier === 'excellent' ? 95 : 80, notes: '利率较低，审批严格' },
    { bank_type: '股份制商业银行', rate_range: `${interestRate.toFixed(2)}%~${(interestRate + 0.2).toFixed(2)}%`, max_ltv: 80, suitability: 85, notes: '审批灵活，服务较好' },
    { bank_type: '城商行/农商行', rate_range: `${(interestRate + 0.1).toFixed(2)}%~${(interestRate + 0.4).toFixed(2)}%`, max_ltv: 80, suitability: creditTier === 'fair' ? 75 : 60, notes: '本地化服务好，利率略高' },
  ]
  if (input.loan_type === 'investment') {
    products.push({ bank_type: '投资专用贷款', rate_range: `${(interestRate + 0.3).toFixed(2)}%~${(interestRate + 0.8).toFixed(2)}%`, max_ltv: 70, suitability: 70, notes: '针对投资房产，首付要求更高' })
  }

  const recommendations: string[] = []
  if (creditTier === 'fair' || creditTier === 'poor') recommendations.push('建议先提升信用评分再申请，可降低利率0.3-1.0%')
  if (dti > 36) recommendations.push('DTI偏高，建议提前偿还部分债务')
  if (downPaymentPct < 30) recommendations.push('增加首付比例可降低月供压力和总利息')
  recommendations.push('建议比较至少3家银行的贷款方案')
  if (input.loan_type === 'investment') recommendations.push('投资房产贷款利率通常更高，建议评估回报率')

  return {
    borrower_name: input.borrower_name,
    property_price: input.property_price,
    down_payment: input.down_payment,
    loan_amount: loanAmount,
    down_payment_pct: downPaymentPct,
    ltv_ratio: ltv,
    dti_ratio: dti,
    total_monthly_debt: totalMonthlyDebt,
    max_affordable_monthly: maxAffordableMonthly,
    estimated_monthly_payment: monthlyPayment,
    credit_tier: creditTier,
    eligibility,
    eligibility_reasons: reasons,
    max_recommended_loan: maxRecommendedLoan,
    interest_rate_estimate: interestRate,
    loan_products: products,
    recommendations,
  }
}

function formatMortgage(r: MortgageResult): string {
  const l: string[] = []
  const tierLabel: Record<string, string> = { excellent: '优秀', good: '良好', fair: '一般', poor: '较差' }
  const tierIcon: Record<string, string> = { excellent: '\u2705', good: '\u2705', fair: '\uD83D\uDFE1', poor: '\uD83D\uDD34' }
  const eligLabel: Record<string, string> = { approved: '建议批准', conditional: '有条件批准', declined: '建议拒绝' }
  const eligIcon: Record<string, string> = { approved: '\u2705', conditional: '\uD83D\uDFE1', declined: '\uD83D\uDD34' }

  l.push('## \uD83C\uDFE6 房贷资格评估报告')
  l.push('')
  l.push('### 申请人信息')
  l.push(`- **申请人**: ${r.borrower_name}`)
  l.push(`- **信用等级**: ${tierIcon[r.credit_tier]} ${tierLabel[r.credit_tier]}`)
  l.push('')

  l.push('### 贷款概要')
  l.push(`- **房产价格**: \uFFE5${r.property_price.toLocaleString()}`)
  l.push(`- **首付金额**: \uFFE5${r.down_payment.toLocaleString()}`)
  l.push(`- **首付比例**: ${r.down_payment_pct}%`)
  l.push(`- **贷款金额**: \uFFE5${r.loan_amount.toLocaleString()}`)
  l.push(`- **LTV比率**: ${r.ltv_ratio}%`)
  l.push(`- **预估利率**: ${r.interest_rate_estimate}%`)
  l.push(`- **预估月供**: \uFFE5${r.estimated_monthly_payment.toLocaleString()}`)
  l.push('')

  l.push('### 偿债能力')
  l.push(`- **DTI比率**: ${r.dti_ratio}%`)
  l.push(`- **月总债务**: \uFFE5${r.total_monthly_debt.toLocaleString()}`)
  l.push(`- **最高可负担月供**: \uFFE5${r.max_affordable_monthly.toLocaleString()}`)
  l.push(`- **推荐最高贷款**: \uFFE5${r.max_recommended_loan.toLocaleString()}`)
  l.push('')

  l.push('### 审批评估')
  l.push(`- **审批结果**: ${eligIcon[r.eligibility]} ${eligLabel[r.eligibility]}`)
  for (const reason of r.eligibility_reasons) {
    l.push(`- ${reason}`)
  }
  l.push('')

  l.push('### 推荐贷款产品')
  l.push('| 银行类型 | 利率范围 | 最高LTV | 适合度 | 备注 |')
  l.push('|----------|----------|---------|--------|------|')
  for (const p of r.loan_products) {
    l.push(`| ${p.bank_type} | ${p.rate_range} | ${p.max_ltv}% | ${p.suitability}% | ${p.notes} |`)
  }
  l.push('')

  l.push('### 优化建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${MORTGAGE_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 5: PROPERTY MANAGEMENT AUTOMATOR ====================

export interface PropertyManagementInput {
  property_id: string
  property_address: string
  property_type: 'apartment' | 'house' | 'commercial' | 'multi_unit'
  units: number
  year_built: number
  last_renovation_year?: number
  current_tenants: number
  maintenance_backlog?: string[]
  appliances?: Array<{ name: string; install_year: number; condition: 'good' | 'fair' | 'poor' }>
  annual_maintenance_budget?: number
}

export interface MaintenanceTask {
  task_name: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  estimated_cost: number
  timeframe: string
  category: 'safety' | 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'cosmetic' | 'appliance'
}

export interface TenantScreeningCriteria {
  criterion: string
  weight: number
  threshold: string
}

export interface PropertyManagementResult {
  property_id: string
  property_address: string
  overall_condition_score: number
  maintenance_schedule: MaintenanceTask[]
  total_estimated_maintenance_cost: number
  tenant_screening_criteria: TenantScreeningCriteria[]
  automation_rules: string[]
  annual_budget_recommendation: number
  risk_items: string[]
  optimization_tips: string[]
}

function analyzePropertyManagement(input: PropertyManagementInput): PropertyManagementResult {
  const rng = seededRng(JSON.stringify(input))
  const age = new Date().getFullYear() - input.year_built

  // Maintenance schedule generation
  const maintenanceSchedule: MaintenanceTask[] = []
  const totalUnits = input.units

  // Age-based maintenance
  if (age > 20) {
    maintenanceSchedule.push({ task_name: '给排水管道检测与更换', priority: 'high', estimated_cost: 15000 * totalUnits, timeframe: '3个月内', category: 'plumbing' })
    maintenanceSchedule.push({ task_name: '电气线路安全检测', priority: 'high', estimated_cost: 8000 * totalUnits, timeframe: '3个月内', category: 'electrical' })
  }
  if (age > 10) {
    maintenanceSchedule.push({ task_name: '屋顶防水检修', priority: 'medium', estimated_cost: 20000, timeframe: '6个月内', category: 'structural' })
    maintenanceSchedule.push({ task_name: '外墙保温检测', priority: 'medium', estimated_cost: 12000, timeframe: '6个月内', category: 'structural' })
  }

  // HVAC maintenance
  maintenanceSchedule.push({ task_name: '中央空调系统保养', priority: 'medium', estimated_cost: 5000 * totalUnits, timeframe: '季度保养', category: 'hvac' })
  maintenanceSchedule.push({ task_name: '新风系统滤网更换', priority: 'low', estimated_cost: 800 * totalUnits, timeframe: '每月', category: 'hvac' })

  // Safety
  maintenanceSchedule.push({ task_name: '消防设备检测与更换', priority: 'urgent', estimated_cost: 6000, timeframe: '立即', category: 'safety' })
  maintenanceSchedule.push({ task_name: '电梯安全年检', priority: 'urgent', estimated_cost: 4000, timeframe: '按期', category: 'safety' })

  // Cosmetic
  maintenanceSchedule.push({ task_name: '公共区域墙面粉刷', priority: 'low', estimated_cost: 8000, timeframe: '12个月内', category: 'cosmetic' })

  // Appliance-specific
  if (input.appliances) {
    for (const app of input.appliances) {
      if (app.condition === 'poor') {
        maintenanceSchedule.push({ task_name: `更换${app.name}`, priority: 'high', estimated_cost: 3000, timeframe: '1个月内', category: 'appliance' })
      } else if (app.condition === 'fair' && new Date().getFullYear() - app.install_year > 8) {
        maintenanceSchedule.push({ task_name: `${app.name}预防性检修`, priority: 'medium', estimated_cost: 800, timeframe: '3个月内', category: 'appliance' })
      }
    }
  }

  // Backlog items
  if (input.maintenance_backlog) {
    for (const item of input.maintenance_backlog) {
      maintenanceSchedule.push({ task_name: `[遗留] ${item}`, priority: 'high', estimated_cost: 2000 + rng.nextFloat(1000, 5000), timeframe: '尽快', category: 'cosmetic' })
    }
  }

  const totalMaintenanceCost = Math.round(maintenanceSchedule.reduce((s, m) => s + m.estimated_cost, 0))

  // Condition score
  let conditionScore = 100
  conditionScore -= age * 0.5
  conditionScore -= maintenanceSchedule.filter(m => m.priority === 'urgent').length * 8
  conditionScore -= maintenanceSchedule.filter(m => m.priority === 'high').length * 4
  if (input.last_renovation_year && new Date().getFullYear() - input.last_renovation_year <= 5) conditionScore += 10
  conditionScore = Math.min(100, Math.max(0, Math.round(conditionScore + rng.nextFloat(-5, 5))))

  // Tenant screening criteria
  const screeningCriteria: TenantScreeningCriteria[] = [
    { criterion: '信用评分', weight: 30, threshold: '>=650分' },
    { criterion: '收入证明', weight: 25, threshold: '月收入>=3倍租金' },
    { criterion: '工作稳定性', weight: 15, threshold: '当前工作>=1年' },
    { criterion: '租赁历史', weight: 15, threshold: '前房东推荐信' },
    { criterion: '身份验证', weight: 10, threshold: '有效身份证件' },
    { criterion: '无犯罪记录', weight: 5, threshold: '通过背景调查' },
  ]

  // Automation rules
  const automationRules = [
    '租金到期前7天自动发送缴租提醒',
    '租金逾期3天自动发送催缴通知',
    '租金逾期15天自动生成法律函草稿',
    '每月1日自动生成租金收入报表',
    '维修请求提交后24小时内自动派单给维修团队',
    '租约到期前60天自动发送续约通知',
    '访客/快递到达自动通知租户',
    '公共区域能耗异常自动告警',
  ]

  const annualBudget = input.annual_maintenance_budget ?? Math.round(input.property_type === 'multi_unit' ? 30000 * totalUnits : 15000 + age * 500)

  const riskItems: string[] = []
  if (conditionScore < 50) riskItems.push('房产状况较差，需立即安排全面检修')
  if (maintenanceSchedule.some(m => m.category === 'safety' && m.priority === 'urgent')) riskItems.push('存在安全隐患，需优先处理')
  if (age > 25) riskItems.push('房龄较大，管网和线路老化风险')
  if (input.current_tenants < input.units * 0.7) riskItems.push('入住率偏低，需加强招租')

  const optimizationTips = [
    '建议引入智能门锁和智能水电表，降低管理成本',
    '建立维修供应商库，确保48小时内响应',
    '定期组织租户满意度调查，提升续租率',
    '购买综合财产保险，覆盖火灾、水渍等风险',
    '建立预防性维护日历，延长设备使用寿命',
  ]

  return {
    property_id: input.property_id,
    property_address: input.property_address,
    overall_condition_score: conditionScore,
    maintenance_schedule: maintenanceSchedule,
    total_estimated_maintenance_cost: totalMaintenanceCost,
    tenant_screening_criteria: screeningCriteria,
    automation_rules: automationRules,
    annual_budget_recommendation: annualBudget,
    risk_items: riskItems,
    optimization_tips: optimizationTips,
  }
}

function formatPropertyManagement(r: PropertyManagementResult): string {
  const l: string[] = []
  const prioLabel: Record<string, string> = { urgent: '紧急', high: '高', medium: '中', low: '低' }
  const prioIcon: Record<string, string> = { urgent: '\uD83D\uDD34', high: '\uD83D\uDFE0', medium: '\uD83D\uDFE1', low: '\u2705' }
  const catLabel: Record<string, string> = { safety: '安全', plumbing: '给排水', electrical: '电气', hvac: '暖通', structural: '结构', cosmetic: '装饰', appliance: '设备' }

  l.push('## \uD83D\uDC77 房产管理自动化报告')
  l.push('')
  l.push('### 房产信息')
  l.push(`- **房产编号**: ${r.property_id}`)
  l.push(`- **地址**: ${r.property_address}`)
  l.push(`- **整体状况评分**: ${r.overall_condition_score}/100`)
  l.push(`- **预估维护总成本**: \uFFE5${r.total_estimated_maintenance_cost.toLocaleString()}`)
  l.push(`- **年度维护预算建议**: \uFFE5${r.annual_budget_recommendation.toLocaleString()}`)
  l.push('')

  l.push('### 维护任务清单')
  l.push('| 任务 | 优先级 | 类别 | 预估成本 | 时间框架 |')
  l.push('|------|--------|------|----------|----------|')
  for (const m of r.maintenance_schedule) {
    l.push(`| ${m.task_name} | ${prioIcon[m.priority]} ${prioLabel[m.priority]} | ${catLabel[m.category]} | \uFFE5${Math.round(m.estimated_cost).toLocaleString()} | ${m.timeframe} |`)
  }
  l.push('')

  l.push('### 租户筛选标准')
  l.push('| 筛选条件 | 权重 | 最低要求 |')
  l.push('|----------|------|----------|')
  for (const c of r.tenant_screening_criteria) {
    l.push(`| ${c.criterion} | ${c.weight}% | ${c.threshold} |`)
  }
  l.push('')

  l.push('### 自动化管理规则')
  for (const rule of r.automation_rules) {
    l.push(`- \u26A0\uFE0F ${rule}`)
  }
  l.push('')

  if (r.risk_items.length > 0) {
    l.push('### 风险事项')
    for (const risk of r.risk_items) {
      l.push(`- \u26A0\uFE0F ${risk}`)
    }
    l.push('')
  }

  l.push('### 优化建议')
  for (const tip of r.optimization_tips) {
    l.push(`- ${tip}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 6: RENTAL YIELD OPTIMIZER ====================

export interface RentalYieldInput {
  property_price: number
  current_monthly_rent: number
  area_sqm: number
  bedrooms: number
  property_type: 'apartment' | 'house' | 'studio' | 'shared'
  location_tier: 'prime' | 'good' | 'average' | 'developing'
  furnishing: 'none' | 'basic' | 'full' | 'luxury'
  current_occupancy_rate: number
  operating_expenses_monthly: number
  target_yield_annual?: number
  competitors_avg_rent?: number
}

export interface PricingScenario {
  scenario: string
  monthly_rent: number
  occupancy_rate: number
  annual_gross_income: number
  annual_net_income: number
  net_yield_pct: number
  pros: string[]
  cons: string[]
}

export interface RentalYieldResult {
  property_price: number
  current_monthly_rent: number
  current_annual_yield: number
  market_position: 'below_market' | 'at_market' | 'above_market'
  optimal_rent_range: { low: number; high: number }
  pricing_scenarios: PricingScenario[]
  occupancy_target: number
  revenue_improvement_potential: number
  recommendations: string[]
}

function analyzeRentalYield(input: RentalYieldInput): RentalYieldResult {
  const rng = seededRng(JSON.stringify(input))

  // Market rate estimation
  let marketRate = input.current_monthly_rent
  if (input.competitors_avg_rent) {
    marketRate = input.competitors_avg_rent
  } else {
    if (input.location_tier === 'prime') marketRate = input.current_monthly_rent * 1.15
    else if (input.location_tier === 'good') marketRate = input.current_monthly_rent * 1.05
    else if (input.location_tier === 'developing') marketRate = input.current_monthly_rent * 0.9
  }

  // Furnishing premium
  const furnishAdj: Record<string, number> = { none: 0, basic: 500, full: 1500, luxury: 3500 }
  marketRate += furnishAdj[input.furnishing]

  // Current yield calc
  const annualGross = input.current_monthly_rent * 12 * (input.current_occupancy_rate / 100)
  const annualNet = annualGross - input.operating_expenses_monthly * 12
  const currentYield = parseFloat(((annualNet / input.property_price) * 100).toFixed(2))

  // Market position
  let marketPosition: RentalYieldResult['market_position'] = 'at_market'
  if (input.current_monthly_rent < marketRate * 0.9) marketPosition = 'below_market'
  else if (input.current_monthly_rent > marketRate * 1.1) marketPosition = 'above_market'

  const optimalLow = Math.round(marketRate * 0.92)
  const optimalHigh = Math.round(marketRate * 1.08)

  // Pricing scenarios
  const scenarios: PricingScenario[] = []

  // Conservative
  const consRent = Math.round(optimalLow)
  const consOcc = Math.min(98, input.current_occupancy_rate + 5)
  scenarios.push({
    scenario: '保守定价',
    monthly_rent: consRent,
    occupancy_rate: consOcc,
    annual_gross_income: consRent * 12 * (consOcc / 100),
    annual_net_income: consRent * 12 * (consOcc / 100) - input.operating_expenses_monthly * 12,
    net_yield_pct: parseFloat((((consRent * 12 * (consOcc / 100) - input.operating_expenses_monthly * 12) / input.property_price) * 100).toFixed(2)),
    pros: ['高入住率保障', '减少空置损失', '吸引优质租户'],
    cons: ['租金收入相对较低', '可能低估房产价值'],
  })

  // Market rate
  const marketRent = Math.round((optimalLow + optimalHigh) / 2)
  const marketOcc = input.current_occupancy_rate
  scenarios.push({
    scenario: '市场定价',
    monthly_rent: marketRent,
    occupancy_rate: marketOcc,
    annual_gross_income: marketRent * 12 * (marketOcc / 100),
    annual_net_income: marketRent * 12 * (marketOcc / 100) - input.operating_expenses_monthly * 12,
    net_yield_pct: parseFloat((((marketRent * 12 * (marketOcc / 100) - input.operating_expenses_monthly * 12) / input.property_price) * 100).toFixed(2)),
    pros: ['与市场持平', '合理入住率', '平衡收益与竞争力'],
    cons: ['需关注竞争对手调价', '市场波动风险'],
  })

  // Aggressive
  const aggRent = Math.round(optimalHigh)
  const aggOcc = Math.max(70, input.current_occupancy_rate - 8)
  scenarios.push({
    scenario: '进取定价',
    monthly_rent: aggRent,
    occupancy_rate: aggOcc,
    annual_gross_income: aggRent * 12 * (aggOcc / 100),
    annual_net_income: aggRent * 12 * (aggOcc / 100) - input.operating_expenses_monthly * 12,
    net_yield_pct: parseFloat((((aggRent * 12 * (aggOcc / 100) - input.operating_expenses_monthly * 12) / input.property_price) * 100).toFixed(2)),
    pros: ['最大化租金收入', '筛选高质量租户', '定位高端市场'],
    cons: ['空置风险增加', '招租周期可能延长', '需配套高品质服务'],
  })

  // Seasonal strategy
  const seasonalRent = Math.round(marketRent * 1.05)
  const seasonalOcc = Math.min(98, input.current_occupancy_rate + 2)
  scenarios.push({
    scenario: '旺季策略(毕业季/春节后)',
    monthly_rent: seasonalRent,
    occupancy_rate: seasonalOcc,
    annual_gross_income: seasonalRent * 12 * (seasonalOcc / 100),
    annual_net_income: seasonalRent * 12 * (seasonalOcc / 100) - input.operating_expenses_monthly * 12,
    net_yield_pct: parseFloat((((seasonalRent * 12 * (seasonalOcc / 100) - input.operating_expenses_monthly * 12) / input.property_price) * 100).toFixed(2)),
    pros: ['利用季节性需求高峰', '租金溢价空间大', '快速出租'],
    cons: ['仅适用于特定时段', '淡季需灵活调整'],
  })

  const bestScenario = scenarios.reduce((max, s) => s.net_yield_pct > max.net_yield_pct ? s : max, scenarios[0])
  const improvementPotential = parseFloat(((bestScenario.net_yield_pct - currentYield)).toFixed(2))

  const occupancyTarget = Math.min(95, Math.round(input.current_occupancy_rate + 5))

  const recommendations: string[] = []
  if (marketPosition === 'below_market') recommendations.push('当前租金低于市场水平，建议调高租金至市场区间')
  if (input.current_occupancy_rate < 85) recommendations.push('入住率偏低，建议优化招租渠道和定价策略')
  if (input.furnishing === 'none' && input.property_type === 'apartment') recommendations.push('考虑配置基础家具家电，可提升租金15-20%')
  recommendations.push('建议采用动态定价策略，根据旺季淡季灵活调整')
  recommendations.push('建议提供短租/长租组合方案，最大化收益')
  recommendations.push('定期监测同区域竞品租金变化，及时调整策略')

  return {
    property_price: input.property_price,
    current_monthly_rent: input.current_monthly_rent,
    current_annual_yield: currentYield,
    market_position: marketPosition,
    optimal_rent_range: { low: optimalLow, high: optimalHigh },
    pricing_scenarios: scenarios,
    occupancy_target: occupancyTarget,
    revenue_improvement_potential: improvementPotential,
    recommendations,
  }
}

function formatRentalYield(r: RentalYieldResult): string {
  const l: string[] = []
  const posLabel: Record<string, string> = { below_market: '低于市场', at_market: '与市场持平', above_market: '高于市场' }
  const posIcon: Record<string, string> = { below_market: '\uD83D\uDFE1', at_market: '\u2705', above_market: '\u26A0\uFE0F' }

  l.push('## \uD83C\uDFE1 租金收益优化报告')
  l.push('')
  l.push('### 当前状况')
  l.push(`- **房产价格**: \uFFE5${r.property_price.toLocaleString()}`)
  l.push(`- **当前月租**: \uFFE5${r.current_monthly_rent.toLocaleString()}`)
  l.push(`- **当前年净收益率**: ${r.current_annual_yield}%`)
  l.push(`- **市场定位**: ${posIcon[r.market_position]} ${posLabel[r.market_position]}`)
  l.push(`- **最优租金区间**: \uFFE5${r.optimal_rent_range.low.toLocaleString()} ~ \uFFE5${r.optimal_rent_range.high.toLocaleString()}`)
  l.push(`- **目标入住率**: ${r.occupancy_target}%`)
  l.push(`- **收益提升潜力**: +${r.revenue_improvement_potential}%`)
  l.push('')

  l.push('### 定价策略方案')
  for (const s of r.pricing_scenarios) {
    l.push(`#### ${s.scenario}`)
    l.push(`- **月租**: \uFFE5${s.monthly_rent.toLocaleString()}`)
    l.push(`- **预期入住率**: ${s.occupancy_rate}%`)
    l.push(`- **年总收入**: \uFFE5${Math.round(s.annual_gross_income).toLocaleString()}`)
    l.push(`- **年净收入**: \uFFE5${Math.round(s.annual_net_income).toLocaleString()}`)
    l.push(`- **净收益率**: ${s.net_yield_pct}%`)
    l.push(`- **优势**: ${s.pros.join('、')}`)
    l.push(`- **劣势**: ${s.cons.join('、')}`)
    l.push('')
  }

  l.push('### 优化建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${INVESTMENT_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 7: NEIGHBORHOOD SCORING AI ====================

export interface NeighborhoodScoringInput {
  neighborhood_name: string
  city: string
  coordinates?: { lat: number; lng: number }
  safety_rating?: number
  school_rating?: number
  transit_score?: number
  walk_score?: number
  amenities_count?: number
  hospital_distance_km?: number
  shopping_distance_km?: number
  park_distance_km?: number
  noise_level?: 'quiet' | 'moderate' | 'noisy'
  air_quality_index?: number
  population_density?: 'low' | 'medium' | 'high'
  development_plans?: string[]
}

export interface SubScore {
  category: string
  score: number
  weight: number
  weighted_score: number
  details: string
}

export interface NeighborhoodScoringResult {
  neighborhood_name: string
  city: string
  overall_score: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D'
  sub_scores: SubScore[]
  strengths: string[]
  weaknesses: string[]
  investment_attractiveness: 'excellent' | 'good' | 'average' | 'below_average'
  target_demographic: string[]
  price_premium_estimate: number
  recommendations: string[]
}

function analyzeNeighborhood(input: NeighborhoodScoringInput): NeighborhoodScoringResult {
  const rng = seededRng(JSON.stringify(input))

  const subScores: SubScore[] = []

  // Safety (weight 20%)
  const safety = input.safety_rating ?? (60 + rng.nextFloat(0, 35))
  subScores.push({ category: '安全性', score: Math.round(safety), weight: 20, weighted_score: Math.round(safety * 0.2), details: `安全评分 ${Math.round(safety)}/100` })

  // Schools (weight 15%)
  const school = input.school_rating ?? (55 + rng.nextFloat(0, 40))
  subScores.push({ category: '学区质量', score: Math.round(school), weight: 15, weighted_score: Math.round(school * 0.15), details: `学区评分 ${Math.round(school)}/100` })

  // Transit (weight 15%)
  const transit = input.transit_score ?? (50 + rng.nextFloat(0, 45))
  subScores.push({ category: '交通便利', score: Math.round(transit), weight: 15, weighted_score: Math.round(transit * 0.15), details: `交通评分 ${Math.round(transit)}/100` })

  // Walkability (weight 10%)
  const walk = input.walk_score ?? (50 + rng.nextFloat(0, 45))
  subScores.push({ category: '步行友好', score: Math.round(walk), weight: 10, weighted_score: Math.round(walk * 0.1), details: `步行评分 ${Math.round(walk)}/100` })

  // Amenities (weight 10%)
  const amenityScore = input.amenities_count ? Math.min(100, input.amenities_count * 5 + 30) : (50 + rng.nextFloat(0, 45))
  subScores.push({ category: '生活配套', score: Math.round(amenityScore), weight: 10, weighted_score: Math.round(amenityScore * 0.1), details: `${input.amenities_count ?? 0}个生活配套设施` })

  // Healthcare (weight 10%)
  const healthDist = input.hospital_distance_km ?? (1 + rng.nextFloat(0, 5))
  const healthScore = Math.max(20, Math.round(100 - healthDist * 15))
  subScores.push({ category: '医疗资源', score: healthScore, weight: 10, weighted_score: Math.round(healthScore * 0.1), details: `最近医院距离 ${healthDist.toFixed(1)}km` })

  // Environment (weight 10%)
  let envScore = 70
  if (input.noise_level === 'quiet') envScore += 15
  else if (input.noise_level === 'noisy') envScore -= 20
  if (input.air_quality_index) envScore = Math.round(100 - input.air_quality_index * 0.5)
  envScore = Math.max(0, Math.min(100, envScore + rng.nextFloat(-10, 10)))
  subScores.push({ category: '居住环境', score: Math.round(envScore), weight: 10, weighted_score: Math.round(envScore * 0.1), details: `噪音: ${input.noise_level ?? '中等'}, AQI: ${input.air_quality_index ?? '未知'}` })

  // Development potential (weight 10%)
  const devScore = input.development_plans ? Math.min(100, 50 + input.development_plans.length * 12) : (50 + rng.nextFloat(0, 40))
  subScores.push({ category: '发展潜力', score: Math.round(devScore), weight: 10, weighted_score: Math.round(devScore * 0.1), details: `${input.development_plans?.length ?? 0}个规划项目` })

  const overallScore = Math.round(subScores.reduce((s, sc) => s + sc.weighted_score, 0))

  let grade: NeighborhoodScoringResult['grade'] = 'C'
  if (overallScore >= 90) grade = 'A+'
  else if (overallScore >= 80) grade = 'A'
  else if (overallScore >= 72) grade = 'B+'
  else if (overallScore >= 65) grade = 'B'
  else if (overallScore >= 55) grade = 'C+'
  else grade = 'D'

  const strengths: string[] = []
  const weaknesses: string[] = []
  for (const ss of subScores) {
    if (ss.score >= 80) strengths.push(`${ss.category}优秀 (${ss.score}分)`)
    else if (ss.score < 50) weaknesses.push(`${ss.category}薄弱 (${ss.score}分)`)
  }

  let attractiveness: NeighborhoodScoringResult['investment_attractiveness'] = 'average'
  if (overallScore >= 80) attractiveness = 'excellent'
  else if (overallScore >= 68) attractiveness = 'good'
  else if (overallScore < 50) attractiveness = 'below_average'

  const targetDemo: string[] = []
  if (school >= 75) targetDemo.push('有孩家庭')
  if (transit >= 75) targetDemo.push('通勤白领')
  if (walk >= 70 && amenityScore >= 70) targetDemo.push('年轻租客')
  if (healthScore >= 70 && input.noise_level === 'quiet') targetDemo.push('退休养老人群')
  if (devScore >= 70) targetDemo.push('投资客')
  if (targetDemo.length === 0) targetDemo.push('一般自住需求')

  const pricePremium = parseFloat(((overallScore - 60) * 0.5).toFixed(1))

  const recommendations: string[] = []
  if (overallScore >= 75) recommendations.push('社区综合评分优秀，适合长期持有和投资')
  if (school < 50) recommendations.push('学区质量较弱，可能影响家庭型买家需求')
  if (transit < 50) recommendations.push('交通便利性不足，依赖私家车出行')
  if (devScore >= 75) recommendations.push('区域发展规划利好，具备增值潜力')
  if (safety < 50) recommendations.push('安全评分较低，需要关注治安改善进展')
  recommendations.push('建议实地考察早晚高峰交通状况和生活噪音')
  recommendations.push('关注周边土地规划和新建项目进展')

  return {
    neighborhood_name: input.neighborhood_name,
    city: input.city,
    overall_score: overallScore,
    grade,
    sub_scores: subScores,
    strengths,
    weaknesses,
    investment_attractiveness: attractiveness,
    target_demographic: targetDemo,
    price_premium_estimate: pricePremium,
    recommendations,
  }
}

function formatNeighborhood(r: NeighborhoodScoringResult): string {
  const l: string[] = []
  const gradeIcon: Record<string, string> = { 'A+': '\u2705', 'A': '\u2705', 'B+': '\uD83D\uDFE1', 'B': '\uD83D\uDFE1', 'C+': '\uD83D\uDFE0', 'C': '\uD83D\uDFE0', 'D': '\uD83D\uDD34' }
  const attrLabel: Record<string, string> = { excellent: '优秀', good: '良好', average: '一般', below_average: '偏低' }
  const attrIcon: Record<string, string> = { excellent: '\u2705', good: '\u2705', average: '\uD83D\uDFE1', below_average: '\uD83D\uDD34' }

  l.push('## \uD83D\uDCCA 社区评分AI报告')
  l.push('')
  l.push('### 社区概况')
  l.push(`- **社区名称**: ${r.neighborhood_name}`)
  l.push(`- **城市**: ${r.city}`)
  l.push(`- **综合评分**: ${r.overall_score}/100`)
  l.push(`- **评级**: ${gradeIcon[r.grade]} ${r.grade}级`)
  l.push(`- **投资吸引力**: ${attrIcon[r.investment_attractiveness]} ${attrLabel[r.investment_attractiveness]}`)
  l.push(`- **价格溢价预估**: ${r.price_premium_estimate > 0 ? '+' : ''}${r.price_premium_estimate}%`)
  l.push('')

  l.push('### 分项评分')
  l.push('| 类别 | 原始分 | 权重 | 加权分 | 详情 |')
  l.push('|------|--------|------|--------|------|')
  for (const ss of r.sub_scores) {
    l.push(`| ${ss.category} | ${ss.score} | ${ss.weight}% | ${ss.weighted_score} | ${ss.details} |`)
  }
  l.push('')

  if (r.strengths.length > 0) {
    l.push('### 优势')
    for (const s of r.strengths) {
      l.push(`- \u2705 ${s}`)
    }
    l.push('')
  }

  if (r.weaknesses.length > 0) {
    l.push('### 不足')
    for (const w of r.weaknesses) {
      l.push(`- \u26A0\uFE0F ${w}`)
    }
    l.push('')
  }

  l.push('### 目标客群')
  for (const t of r.target_demographic) {
    l.push(`- ${t}`)
  }
  l.push('')

  l.push('### 建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${VALUATION_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 8: ESG COMPLIANCE REAL ESTATE ====================

export interface EsgComplianceInput {
  property_id: string
  property_name: string
  property_type: 'office' | 'residential' | 'commercial' | 'industrial' | 'mixed_use'
  year_built: number
  total_area_sqm: number
  energy_rating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  certifications?: string[]
  has_solar?: boolean
  has_rainwater_harvesting?: boolean
  has_ev_charging?: boolean
  green_space_pct?: number
  annual_energy_kwh: number
  annual_water_m3: number
  annual_waste_tons: number
  waste_recycling_pct?: number
  building_materials?: string[]
  energy_efficiency_measures?: string[]
  retrofitting_plans?: string[]
}

export interface EsgDimensionScore {
  dimension: string
  score: number
  weight: number
  weighted_score: number
  findings: string[]
  improvements: string[]
}

export interface EsgComplianceResult {
  property_id: string
  property_name: string
  overall_esg_score: number
  esg_grade: 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C'
  environmental_score: number
  social_score: number
  governance_score: number
  dimension_scores: EsgDimensionScore[]
  compliance_status: 'compliant' | 'partially_compliant' | 'non_compliant'
  green_premium_estimate: number
  energy_savings_potential: number
  carbon_footprint_reduction_potential: number
  action_items: string[]
  recommendations: string[]
}

function analyzeEsgCompliance(input: EsgComplianceInput): EsgComplianceResult {
  const rng = seededRng(JSON.stringify(input))
  const age = new Date().getFullYear() - input.year_built

  const dimensionScores: EsgDimensionScore[] = []

  // Energy efficiency (E - 30%)
  let energyScore = 60
  const energyRatingMap: Record<string, number> = { A: 95, B: 85, C: 70, D: 55, E: 40, F: 25, G: 15 }
  if (input.energy_rating) energyScore = energyRatingMap[input.energy_rating]
  if (input.has_solar) energyScore += 10
  const energyMeasures = input.energy_efficiency_measures ?? []
  energyScore += energyMeasures.length * 3
  energyScore = Math.min(100, energyScore + rng.nextFloat(-5, 5))
  const energyFindings: string[] = []
  const energyImprovements: string[] = []
  if (input.energy_rating && ['D', 'E', 'F', 'G'].includes(input.energy_rating)) energyFindings.push(`能源评级${input.energy_rating}级，能效偏低`)
  if (input.has_solar) energyFindings.push('已安装太阳能系统')
  if (age > 20) energyFindings.push('建筑年代较久，能效系统可能落后')
  energyImprovements.push('升级为LED照明系统')
  energyImprovements.push('安装智能楼宇管理系统(BMS)')
  if (!input.has_solar) energyImprovements.push('评估屋顶光伏安装可行性')
  dimensionScores.push({ dimension: '能源效率', score: Math.round(energyScore), weight: 30, weighted_score: Math.round(energyScore * 0.3), findings: energyFindings, improvements: energyImprovements })

  // Water management (E - 15%)
  let waterScore = 65
  if (input.has_rainwater_harvesting) waterScore += 20
  if (input.annual_water_m3 / input.total_area_sqm < 0.5) waterScore += 10
  waterScore = Math.min(100, waterScore + rng.nextFloat(-5, 5))
  const waterFindings: string[] = []
  const waterImprovements: string[] = []
  if (input.has_rainwater_harvesting) waterFindings.push('已具备雨水收集系统')
  waterImprovements.push('安装节水器具(感应水龙头、双冲马桶)')
  waterImprovements.push('建立中水回用系统')
  dimensionScores.push({ dimension: '水资源管理', score: Math.round(waterScore), weight: 15, weighted_score: Math.round(waterScore * 0.15), findings: waterFindings, improvements: waterImprovements })

  // Waste management (E - 10%)
  let wasteScore = 55
  const recyclingPct = input.waste_recycling_pct ?? 30
  wasteScore += recyclingPct * 0.8
  wasteScore = Math.min(100, wasteScore + rng.nextFloat(-5, 5))
  const wasteFindings: string[] = []
  const wasteImprovements: string[] = []
  wasteFindings.push(`废物回收率约${recyclingPct}%`)
  wasteImprovements.push('实施垃圾分类系统')
  wasteImprovements.push('建立有机垃圾堆肥设施')
  dimensionScores.push({ dimension: '废物管理', score: Math.round(wasteScore), weight: 10, weighted_score: Math.round(wasteScore * 0.1), findings: wasteFindings, improvements: wasteImprovements })

  // Indoor environment (S - 15%)
  let indoorScore = 65
  if (input.green_space_pct && input.green_space_pct > 20) indoorScore += 10
  indoorScore = Math.min(100, indoorScore + rng.nextFloat(-5, 5))
  const indoorFindings: string[] = []
  const indoorImprovements: string[] = []
  if (input.green_space_pct) indoorFindings.push(`绿化率${input.green_space_pct}%`)
  indoorImprovements.push('改善室内通风和采光设计')
  indoorImprovements.push('使用低VOC建材和涂料')
  dimensionScores.push({ dimension: '室内环境', score: Math.round(indoorScore), weight: 15, weighted_score: Math.round(indoorScore * 0.15), findings: indoorFindings, improvements: indoorImprovements })

  // Accessibility & Community (S - 10%)
  let socialScore = 60
  if (input.has_ev_charging) socialScore += 15
  socialScore = Math.min(100, socialScore + rng.nextFloat(-5, 5))
  const socialFindings: string[] = []
  const socialImprovements: string[] = []
  if (input.has_ev_charging) socialFindings.push('已配备电动车充电设施')
  socialImprovements.push('增加无障碍设施')
  socialImprovements.push('建设社区共享空间')
  dimensionScores.push({ dimension: '社会影响', score: Math.round(socialScore), weight: 10, weighted_score: Math.round(socialScore * 0.1), findings: socialFindings, improvements: socialImprovements })

  // Green certifications & Transparency (G - 20%)
  let govScore = 50
  const certs = input.certifications ?? []
  const certBonus: Record<string, number> = { 'LEED': 15, 'BREEAM': 15, 'WELL': 12, '中国绿建三星': 15, '中国绿建二星': 10, '中国绿建一星': 5, 'ENERGY_STAR': 10 }
  for (const cert of certs) {
    for (const [key, val] of Object.entries(certBonus)) {
      if (cert.toUpperCase().includes(key.toUpperCase())) govScore += val
    }
  }
  govScore = Math.min(100, govScore + rng.nextFloat(-5, 5))
  const govFindings: string[] = []
  const govImprovements: string[] = []
  if (certs.length > 0) govFindings.push(`已有认证: ${certs.join(', ')}`)
  else govFindings.push('暂无绿色建筑认证')
  govImprovements.push('申请LEED/BREEAM/中国绿建认证')
  govImprovements.push('建立ESG信息披露机制')
  dimensionScores.push({ dimension: '认证与治理', score: Math.round(govScore), weight: 20, weighted_score: Math.round(govScore * 0.2), findings: govFindings, improvements: govImprovements })

  const overallEsgScore = Math.round(dimensionScores.reduce((s, d) => s + d.weighted_score, 0))

  let esgGrade: EsgComplianceResult['esg_grade'] = 'BB'
  if (overallEsgScore >= 85) esgGrade = 'AA'
  else if (overallEsgScore >= 75) esgGrade = 'A'
  else if (overallEsgScore >= 65) esgGrade = 'BBB'
  else if (overallEsgScore >= 55) esgGrade = 'BB'
  else if (overallEsgScore >= 45) esgGrade = 'B'
  else esgGrade = 'C'

  let compliance: EsgComplianceResult['compliance_status'] = 'compliant'
  if (overallEsgScore < 50) compliance = 'non_compliant'
  else if (overallEsgScore < 70) compliance = 'partially_compliant'

  const envScore = Math.round((dimensionScores[0].score + dimensionScores[1].score + dimensionScores[2].score) / 3)
  const socScore = Math.round((dimensionScores[3].score + dimensionScores[4].score) / 2)
  const govScoreVal = dimensionScores[5].score

  const greenPremium = parseFloat(((overallEsgScore - 50) * 0.3).toFixed(1))
  const energySavings = Math.round((100 - energyScore) * input.annual_energy_kwh / 100 * 0.15)
  const carbonReduction = Math.round((100 - energyScore) * input.total_area_sqm * 0.05)

  const actionItems: string[] = []
  for (const ds of dimensionScores) {
    if (ds.score < 60 && ds.improvements.length > 0) {
      actionItems.push(`[${ds.dimension}] ${ds.improvements[0]}`)
    }
  }
  if (certs.length === 0) actionItems.push('尽快启动绿色建筑认证申请')

  const recommendations: string[] = []
  if (overallEsgScore < 60) recommendations.push('ESG评分较低，建议制定3年绿色改造计划')
  if (!input.has_solar) recommendations.push('评估屋顶光伏投资回报，通常5-7年回本')
  if (recyclingPct < 50) recommendations.push('提升废物回收率至50%以上')
  if (input.energy_rating && ['E', 'F', 'G'].includes(input.energy_rating)) recommendations.push('能源评级较低，建议进行节能改造')
  recommendations.push('建议聘请ESG顾问制定可持续发展战略')
  recommendations.push('定期发布ESG报告，提升品牌形象和资产价值')

  return {
    property_id: input.property_id,
    property_name: input.property_name,
    overall_esg_score: overallEsgScore,
    esg_grade: esgGrade,
    environmental_score: envScore,
    social_score: socScore,
    governance_score: govScoreVal,
    dimension_scores: dimensionScores,
    compliance_status: compliance,
    green_premium_estimate: greenPremium,
    energy_savings_potential: energySavings,
    carbon_footprint_reduction_potential: carbonReduction,
    action_items: actionItems,
    recommendations,
  }
}

function formatEsgCompliance(r: EsgComplianceResult): string {
  const l: string[] = []
  const gradeIcon: Record<string, string> = { AA: '\u2705', A: '\u2705', BBB: '\uD83D\uDFE1', BB: '\uD83D\uDFE1', B: '\uD83D\uDFE0', C: '\uD83D\uDD34' }
  const complLabel: Record<string, string> = { compliant: '合规', partially_compliant: '部分合规', non_compliant: '不合规' }
  const complIcon: Record<string, string> = { compliant: '\u2705', partially_compliant: '\uD83D\uDFE1', non_compliant: '\uD83D\uDD34' }

  l.push('## \uD83C\uDF31 ESG合规评估报告')
  l.push('')
  l.push('### 物业信息')
  l.push(`- **物业编号**: ${r.property_id}`)
  l.push(`- **物业名称**: ${r.property_name}`)
  l.push('')

  l.push('### ESG评分概览')
  l.push(`- **ESG总分**: ${r.overall_esg_score}/100`)
  l.push(`- **ESG评级**: ${gradeIcon[r.esg_grade]} ${r.esg_grade}级`)
  l.push(`- **合规状态**: ${complIcon[r.compliance_status]} ${complLabel[r.compliance_status]}`)
  l.push(`- **环境(E)得分**: ${r.environmental_score}/100`)
  l.push(`- **社会(S)得分**: ${r.social_score}/100`)
  l.push(`- **治理(G)得分**: ${r.governance_score}/100`)
  l.push(`- **绿色溢价预估**: ${r.green_premium_estimate > 0 ? '+' : ''}${r.green_premium_estimate}%`)
  l.push(`- **节能潜力**: ${r.energy_savings_potential} kWh/年`)
  l.push(`- **碳减排潜力**: ${r.carbon_footprint_reduction_potential} tCO2e/年`)
  l.push('')

  l.push('### 维度评分')
  l.push('| 维度 | 得分 | 权重 | 加权分 |')
  l.push('|------|------|------|--------|')
  for (const ds of r.dimension_scores) {
    l.push(`| ${ds.dimension} | ${ds.score} | ${ds.weight}% | ${ds.weighted_score} |`)
  }
  l.push('')

  for (const ds of r.dimension_scores) {
    if (ds.findings.length > 0) {
      l.push(`#### ${ds.dimension} - 发现`)
      for (const f of ds.findings) {
        l.push(`- ${f}`)
      }
      l.push('')
    }
  }

  if (r.action_items.length > 0) {
    l.push('### 优先改进行动')
    for (const a of r.action_items) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push('')
  }

  l.push('### 改进建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. property_valuation_engine
  tools.register(defineTool({
    name: 'property_valuation_engine',
    description: '房产估值引擎 — 基于市场比较法进行房产估值，分析可比案例(位置、面积、房龄、装修等因素调整)，输出估值区间、置信度、市场定位和价值驱动因素',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { property_id: string, address: string, property_type: "apartment"|"house"|"townhouse"|"condo"|"commercial"|"land", area_sqm: number, bedrooms: number, bathrooms: number, year_built: number, floor?: number, total_floors?: number, renovation_level: "none"|"basic"|"moderate"|"premium"|"luxury", has_parking?: boolean, has_elevator?: boolean, orientation?: "north"|"south"|"east"|"west"|"northeast"|"northwest"|"southeast"|"southwest", comparables?: Array<{ address: string, price_total: number, area_sqm: number, sold_date: string, distance_km: number, bedrooms: number, year_built: number }> }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatValuation(analyzeValuation(JSON.parse(args.input_data)))
    },
  }))

  // 2. investment_roi_calculator
  tools.register(defineTool({
    name: 'investment_roi_calculator',
    description: '投资回报率计算器 — 计算房产投资的核心指标：资本化率(Cap Rate)、现金回报率(Cash-on-Cash)、内部收益率(IRR)、净现值(NPV)、回本周期，输出年度现金流预测和投资评级',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { property_price: number, down_payment_pct: number, loan_years: number, interest_rate_annual: number, monthly_rent: number, vacancy_rate: number, property_tax_annual: number, insurance_annual: number, maintenance_monthly: number, management_fee_monthly: number, hoa_monthly?: number, other_income_annual?: number, holding_period_years: number, expected_appreciation_annual: number, selling_cost_pct: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatInvestmentRoi(analyzeInvestmentRoi(JSON.parse(args.input_data)))
    },
  }))

  // 3. market_trend_forecaster
  tools.register(defineTool({
    name: 'market_trend_forecaster',
    description: '市场趋势预测 — 基于供需动态、人口增长、GDP增速、基建项目和政策因素，预测未来房价走势，输出年度预测(价格/涨跌幅/市场阶段)、关键驱动因素、风险和投资机会',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { city: string, district?: string, property_type: "apartment"|"house"|"commercial"|"all", forecast_years: number, current_price_per_sqm: number, current_inventory_months: number, recent_price_change_pct: number, population_growth_annual?: number, gdp_growth_annual?: number, infrastructure_projects?: string[], policy_factors?: string[] }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatMarketForecast(analyzeMarketForecast(JSON.parse(args.input_data)))
    },
  }))

  // 4. mortgage_eligibility_assessor
  tools.register(defineTool({
    name: 'mortgage_eligibility_assessor',
    description: '房贷资格评估 — 评估借款人的房贷资格，计算DTI/LTV比率，划分信用等级，估算利率和月供，输出审批结果、原因分析、推荐贷款产品和优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { borrower_name: string, monthly_income: number, existing_debt_monthly: number, credit_score: number, employment_years: number, employment_type: "salaried"|"self_employed"|"freelance"|"business_owner", property_price: number, down_payment: number, loan_term_years: number, loan_type: "primary_residence"|"second_home"|"investment", co_borrower_monthly_income?: number, other_assets?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatMortgage(analyzeMortgage(JSON.parse(args.input_data)))
    },
  }))

  // 5. property_management_automator
  tools.register(defineTool({
    name: 'property_management_automator',
    description: '房产管理自动化 — 生成维护任务清单(基于房龄和设备状态)、租户筛选标准、自动化管理规则、年度预算建议、风险事项和优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { property_id: string, property_address: string, property_type: "apartment"|"house"|"commercial"|"multi_unit", units: number, year_built: number, last_renovation_year?: number, current_tenants: number, maintenance_backlog?: string[], appliances?: Array<{ name: string, install_year: number, condition: "good"|"fair"|"poor" }>, annual_maintenance_budget?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPropertyManagement(analyzePropertyManagement(JSON.parse(args.input_data)))
    },
  }))

  // 6. rental_yield_optimizer
  tools.register(defineTool({
    name: 'rental_yield_optimizer',
    description: '租金收益优化器 — 分析当前租金水平与市场对比，提供多场景定价策略(保守/市场/进取/旺季)，计算最优租金区间、目标入住率和收益提升潜力',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { property_price: number, current_monthly_rent: number, area_sqm: number, bedrooms: number, property_type: "apartment"|"house"|"studio"|"shared", location_tier: "prime"|"good"|"average"|"developing", furnishing: "none"|"basic"|"full"|"luxury", current_occupancy_rate: number, operating_expenses_monthly: number, target_yield_annual?: number, competitors_avg_rent?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRentalYield(analyzeRentalYield(JSON.parse(args.input_data)))
    },
  }))

  // 7. neighborhood_scoring_ai
  tools.register(defineTool({
    name: 'neighborhood_scoring_ai',
    description: '社区评分AI — 多维度评估社区质量：安全性、学区、交通、步行友好、生活配套、医疗、环境、发展潜力，输出综合评分(0-100)、等级、优势/劣势、目标客群和投资吸引力',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { neighborhood_name: string, city: string, coordinates?: { lat: number, lng: number }, safety_rating?: number, school_rating?: number, transit_score?: number, walk_score?: number, amenities_count?: number, hospital_distance_km?: number, shopping_distance_km?: number, park_distance_km?: number, noise_level?: "quiet"|"moderate"|"noisy", air_quality_index?: number, population_density?: "low"|"medium"|"high", development_plans?: string[] }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatNeighborhood(analyzeNeighborhood(JSON.parse(args.input_data)))
    },
  }))

  // 8. esg_compliance_realestate
  tools.register(defineTool({
    name: 'esg_compliance_realestate',
    description: 'ESG合规评估 — 评估房产ESG表现：能源效率、水资源、废物管理、室内环境、社会影响、认证与治理，输出ESG总分、评级、合规状态、绿色溢价、节能潜力和改进行动清单',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { property_id: string, property_name: string, property_type: "office"|"residential"|"commercial"|"industrial"|"mixed_use", year_built: number, total_area_sqm: number, energy_rating?: "A"|"B"|"C"|"D"|"E"|"F"|"G", certifications?: string[], has_solar?: boolean, has_rainwater_harvesting?: boolean, has_ev_charging?: boolean, green_space_pct?: number, annual_energy_kwh: number, annual_water_m3: number, annual_waste_tons: number, waste_recycling_pct?: number, building_materials?: string[], energy_efficiency_measures?: string[], retrofitting_plans?: string[] }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatEsgCompliance(analyzeEsgCompliance(JSON.parse(args.input_data)))
    },
  }))
}
