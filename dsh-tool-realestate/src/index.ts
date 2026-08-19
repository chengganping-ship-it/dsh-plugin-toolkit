/**
 * DSH Real Estate Investment Analyzer Plugin v0.1.0
 *
 * Comprehensive real estate investment analysis toolkit for DeepSeek Harness Agent.
 * Designed for property investors, real estate analysts, and portfolio managers.
 *
 * Features (v0.1.0):
 * - Property Valuator (comparative market analysis with adjustments)
 * - Rental Yield Calculator (gross/net yield, cash-on-cash, cap rate)
 * - Market Timing Analyzer (buy/hold/sell signals, price forecasting)
 * - Flip Analyzer (profit margin, ROI, risk assessment)
 * - Portfolio Optimizer (diversification, rebalancing, concentration risk)
 * - Mortgage Analyzer (amortization, break-even vs renting)
 * - Location Scorer (investment appeal, growth potential)
 * - Tax Benefit Calculator (depreciation, deductions, 1031 exchange)
 *
 * @module dsh-tool-realestate
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-realestate'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface PropertyData {
  type: string
  location: string
  sqft: number
  bedrooms: number
  age: number
  condition: 'poor' | 'fair' | 'good' | 'excellent'
}

interface ComparableData {
  price: number
  sqft: number
  bedrooms: number
  age: number
  condition: string
  distance_miles: number
  sold_date: string
}

interface ValuationResult {
  estimated_value: number
  confidence_range: { low: number; high: number }
  valuation_method: string
  adjustment_factors: Record<string, number>
  price_per_sqft: number
  confidence_score: number
}

interface ExpenseData {
  property_tax: number
  insurance: number
  maintenance: number
  vacancy_rate: number
  management_fee: number
}

interface RentalYieldResult {
  gross_yield: number
  net_yield: number
  cash_on_cash_return: number
  cap_rate: number
  annual_net_income: number
  monthly_net_income: number
  expense_breakdown: Record<string, number>
  yield_grade: string
}

interface MarketData {
  price_history: number[]
  inventory_levels: number[]
  days_on_market: number[]
  mortgage_rates: number[]
  employment_growth: number
}

interface MarketTimingResult {
  market_phase: string
  buy_hold_sell_signal: string
  price_forecast_12m: number
  risk_level: string
  momentum_score: number
  supply_demand_ratio: number
  affordability_index: number
  key_indicators: Record<string, string>
}

interface HoldingCosts {
  property_tax_monthly?: number
  insurance_monthly?: number
  utilities_monthly?: number
  hoa_monthly?: number
  financing_monthly?: number
  selling_costs_pct?: number
}

interface FlipResult {
  profit_margin: number
  roi: number
  break_even_point: number
  risk_factors: string[]
  recommended_offer: number
  max_allowable_offer: number
  total_project_cost: number
  holding_period_months: number
  risk_grade: string
}

interface PortfolioProperty {
  value: number
  income: number
  location: string
  type: string
}

interface PortfolioConstraints {
  max_single_property_pct?: number
  max_single_location_pct?: number
  min_target_yield?: number
  max_target_yield?: number
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
}

interface PortfolioResult {
  diversification_score: number
  rebalancing_recommendations: string[]
  risk_adjusted_return: number
  concentration_risks: string[]
  portfolio_yield: number
  total_value: number
  total_annual_income: number
  location_breakdown: Record<string, number>
  type_breakdown: Record<string, number>
  optimization_grade: string
}

interface MortgageResult {
  monthly_payment: number
  total_interest: number
  total_cost: number
  amortization_schedule_summary: {
    year_1_interest: number
    year_1_principal: number
    year_5_interest: number
    year_5_principal: number
    max_single_month: number
  }
  break_even_vs_renting: {
    monthly_rent_equivalent: number
    break_even_months: number
    recommendation: string
    equity_after_5y: number
    equity_after_10y: number
  }
  loan_summary: {
    loan_amount: number
    ltv_ratio: number
    dti_estimate: number
  }
}

interface LocationData {
  school_rating: number
  crime_rate: number
  walk_score: number
  transit_score: number
  amenities_count: number
  employment_growth: number
  population_growth: number
}

interface LocationResult {
  location_score: number
  investment_appeal: string
  growth_potential: string
  risk_factors: string[]
  score_breakdown: Record<string, number>
  comparable_markets: string[]
  recommendation: string
}

interface TaxPropertyData {
  purchase_price: number
  rental_income: number
  expenses: number
  holding_period: number
  tax_bracket: number
}

interface TaxBenefitResult {
  depreciation_benefit: number
  deduction_summary: {
    total_annual_deductions: number
    mortgage_interest_deduction: number
    depreciation_deduction: number
    operating_expense_deduction: number
    tax_savings: number
  }
  capital_gains_estimate: {
    estimated_gain: number
    federal_tax: number
    state_tax_estimate: number
    net_proceeds: number
    depreciation_recapture: number
  }
  exchange_1031_benefit: {
    deferred_tax: number
    net_benefit_vs_sale: number
    replacement_property_requirement: string
    timeline_requirements: string[]
  }
  effective_tax_rate: number
  after_tax_return: number
}

// ==================== TOOL 1: PROPERTY VALUATOR ====================

function evaluateProperty(
  property: PropertyData,
  comparables?: ComparableData[]
): ValuationResult {
  const basePricePerSqft = getBasePricePerSqft(property.type, property.location)
  let estimatedValue = basePricePerSqft * property.sqft
  const adjustments: Record<string, number> = {}

  // Age adjustment
  const ageFactor = property.age <= 2 ? 1.05 : property.age <= 10 ? 1.0 : property.age <= 25 ? 0.95 : property.age <= 50 ? 0.88 : 0.80
  adjustments.age = (ageFactor - 1) * 100
  estimatedValue *= ageFactor

  // Condition adjustment
  const conditionMap: Record<string, number> = { poor: 0.85, fair: 0.93, good: 1.0, excellent: 1.08 }
  const conditionFactor = conditionMap[property.condition] ?? 1.0
  adjustments.condition = (conditionFactor - 1) * 100
  estimatedValue *= conditionFactor

  // Bedroom adjustment
  const bedroomFactor = property.bedrooms <= 1 ? 0.92 : property.bedrooms <= 3 ? 1.0 : property.bedrooms <= 5 ? 1.06 : 1.10
  adjustments.bedrooms = (bedroomFactor - 1) * 100
  estimatedValue *= bedroomFactor

  // Comparables adjustment
  let confidenceScore = 0.65
  if (comparables && comparables.length > 0) {
    const compPrices = comparables.map(c => c.price / c.sqft)
    const avgCompPrice = compPrices.reduce((s, p) => s + p, 0) / compPrices.length
    const compValue = avgCompPrice * property.sqft * 0.7 + estimatedValue * 0.3
    estimatedValue = compValue
    adjustments.comparables = ((compValue - estimatedValue) / estimatedValue) * 100
    confidenceScore = Math.min(0.65 + comparables.length * 0.07, 0.92)
  }

  const pricePerSqft = estimatedValue / property.sqft
  const rangeWidth = (1 - confidenceScore) * estimatedValue

  return {
    estimated_value: Math.round(estimatedValue),
    confidence_range: {
      low: Math.round(estimatedValue - rangeWidth),
      high: Math.round(estimatedValue + rangeWidth)
    },
    valuation_method: comparables && comparables.length > 0 ? 'Hybrid (CMA + Comparable Sales)' : 'Comparative Market Analysis (CMA)',
    adjustment_factors: adjustments,
    price_per_sqft: Math.round(pricePerSqft),
    confidence_score: confidenceScore
  }
}

function getBasePricePerSqft(type: string, location: string): number {
  const typeMultipliers: Record<string, number> = {
    single_family: 1.0, condo: 0.85, townhouse: 0.92, multi_family: 0.78, commercial: 1.15, land: 0.3
  }
  const locationMultipliers: Record<string, number> = {
    urban: 1.4, suburban: 1.0, rural: 0.55, resort: 1.8, downtown: 1.6
  }
  const base = 200
  return base * (typeMultipliers[type] ?? 1.0) * (locationMultipliers[location] ?? 1.0)
}

function formatValuationReport(result: ValuationResult): string {
  const lines: string[] = []
  lines.push('## Property Valuation Report')
  lines.push('')
  lines.push(`**Estimated Value:** $${result.estimated_value.toLocaleString()}`)
  lines.push(`**Confidence Range:** $${result.confidence_range.low.toLocaleString()} — $${result.confidence_range.high.toLocaleString()}`)
  lines.push(`**Price per Sq Ft:** $${result.price_per_sqft}`)
  lines.push(`**Method:** ${result.valuation_method}`)
  lines.push(`**Confidence Score:** ${(result.confidence_score * 100).toFixed(0)}%`)
  lines.push('')
  lines.push('### Adjustment Factors')
  lines.push('| Factor | Adjustment |')
  lines.push('|--------|-----------|')
  for (const [key, value] of Object.entries(result.adjustment_factors)) {
    const sign = value >= 0 ? '+' : ''
    lines.push(`| ${key} | ${sign}${value.toFixed(1)}% |`)
  }
  return lines.join('\n')
}

// ==================== TOOL 2: RENTAL YIELD CALCULATOR ====================

function calculateRentalYield(
  purchasePrice: number,
  monthlyRent: number,
  expenses: ExpenseData
): RentalYieldResult {
  const annualRent = monthlyRent * 12
  const effectiveGrossIncome = annualRent * (1 - expenses.vacancy_rate / 100)

  const annualExpenses: Record<string, number> = {
    property_tax: expenses.property_tax,
    insurance: expenses.insurance,
    maintenance: expenses.maintenance,
    management_fee: (expenses.management_fee / 100) * effectiveGrossIncome
  }

  const totalAnnualExpenses = Object.values(annualExpenses).reduce((s, v) => s + v, 0)
  const netOperatingIncome = effectiveGrossIncome - totalAnnualExpenses

  const grossYield = (annualRent / purchasePrice) * 100
  const netYield = (netOperatingIncome / purchasePrice) * 100
  const capRate = (netOperatingIncome / purchasePrice) * 100
  const cashOnCash = netOperatingIncome > 0 && purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0

  let yield_grade = 'C'
  if (netYield >= 10) yield_grade = 'A+'
  else if (netYield >= 8) yield_grade = 'A'
  else if (netYield >= 6) yield_grade = 'B+'
  else if (netYield >= 4) yield_grade = 'B'
  else if (netYield >= 2) yield_grade = 'C+'

  return {
    gross_yield: Math.round(grossYield * 100) / 100,
    net_yield: Math.round(netYield * 100) / 100,
    cash_on_cash_return: Math.round(cashOnCash * 100) / 100,
    cap_rate: Math.round(capRate * 100) / 100,
    annual_net_income: Math.round(netOperatingIncome),
    monthly_net_income: Math.round(netOperatingIncome / 12),
    expense_breakdown: annualExpenses,
    yield_grade
  }
}

function formatRentalYieldReport(result: RentalYieldResult): string {
  const lines: string[] = []
  lines.push('## Rental Yield Analysis')
  lines.push('')
  lines.push(`**Yield Grade:** ${result.yield_grade}`)
  lines.push('')
  lines.push('### Yield Metrics')
  lines.push(`- Gross Yield: ${result.gross_yield}%`)
  lines.push(`- Net Yield: ${result.net_yield}%`)
  lines.push(`- Cash-on-Cash Return: ${result.cash_on_cash_return}%`)
  lines.push(`- Cap Rate: ${result.cap_rate}%`)
  lines.push('')
  lines.push('### Income Summary')
  lines.push(`- Annual Net Income: $${result.annual_net_income.toLocaleString()}`)
  lines.push(`- Monthly Net Income: $${result.monthly_net_income.toLocaleString()}`)
  lines.push('')
  lines.push('### Annual Expense Breakdown')
  lines.push('| Expense | Amount |')
  lines.push('|---------|--------|')
  for (const [key, value] of Object.entries(result.expense_breakdown)) {
    lines.push(`| ${key.replace(/_/g, ' ')} | $${value.toLocaleString()} |`)
  }
  return lines.join('\n')
}

// ==================== TOOL 3: MARKET TIMING ANALYZER ====================

function analyzeMarketTiming(marketData: MarketData): MarketTimingResult {
  const priceHistory = marketData.price_history
  const inventory = marketData.inventory_levels
  const dom = marketData.days_on_market
  const rates = marketData.mortgage_rates

  // Price momentum
  const recentPrices = priceHistory.slice(-6)
  const olderPrices = priceHistory.slice(0, Math.min(6, priceHistory.length))
  const recentAvg = recentPrices.reduce((s, p) => s + p, 0) / recentPrices.length
  const olderAvg = olderPrices.reduce((s, p) => s + p, 0) / olderPrices.length
  const priceMomentum = ((recentAvg - olderAvg) / olderAvg) * 100

  // Inventory trend
  const recentInventory = inventory.slice(-3)
  const avgInventory = recentInventory.reduce((s, v) => s + v, 0) / recentInventory.length
  const inventoryTrend = inventory.length >= 6 ? ((inventory[inventory.length - 1] - inventory[0]) / inventory[0]) * 100 : 0

  // Days on market trend
  const avgDom = dom.reduce((s, v) => s + v, 0) / dom.length
  const domTrend = dom.length >= 3 ? dom[dom.length - 1] - dom[0] : 0

  // Mortgage rate trend
  const currentRate = rates[rates.length - 1]
  const rateTrend = rates.length >= 3 ? rates[rates.length - 1] - rates[0] : 0

  // Supply-demand ratio (months of supply)
  const supplyDemandRatio = avgInventory > 0 ? avgInventory / Math.max(1, (100 - avgDom) / 10) : 6

  // Determine market phase
  let market_phase = 'balanced'
  if (priceMomentum > 8 && inventoryTrend < -15) market_phase = 'hot_sellers'
  else if (priceMomentum > 3 && inventoryTrend < -5) market_phase = 'warming'
  else if (priceMomentum < -3 && inventoryTrend > 15) market_phase = 'cooling_buyers'
  else if (priceMomentum < -8 && inventoryTrend > 25) market_phase = 'cold_buyers'
  else if (Math.abs(priceMomentum) <= 3) market_phase = 'stable'

  // Signal
  let signal = 'HOLD'
  if (market_phase === 'cold_buyers' || market_phase === 'cooling_buyers') signal = 'BUY'
  else if (market_phase === 'hot_sellers') signal = 'SELL'
  else if (market_phase === 'warming') signal = 'HOLD/BUY'
  else signal = 'HOLD'

  // Price forecast
  const forecastedChange = priceMomentum * 0.6 + (marketData.employment_growth * 2) - (rateTrend * 3)
  const price_forecast_12m = Math.round(forecastedChange * 100) / 100

  // Risk level
  let risk_level = 'moderate'
  if (Math.abs(priceMomentum) > 15 || Math.abs(inventoryTrend) > 40) risk_level = 'high'
  else if (Math.abs(priceMomentum) < 5 && Math.abs(inventoryTrend) < 15) risk_level = 'low'

  // Affordability index (lower is less affordable)
  const affordabilityIndex = Math.max(0, Math.min(100, 100 - (currentRate - 3) * 10 - priceMomentum))

  // Momentum score
  const momentumScore = Math.max(-100, Math.min(100, priceMomentum * 5 + marketData.employment_growth * 10 - rateTrend * 15))

  return {
    market_phase,
    buy_hold_sell_signal: signal,
    price_forecast_12m,
    risk_level,
    momentum_score: Math.round(momentumScore),
    supply_demand_ratio: Math.round(supplyDemandRatio * 100) / 100,
    affordability_index: Math.round(affordabilityIndex),
    key_indicators: {
      price_momentum: `${priceMomentum > 0 ? '+' : ''}${priceMomentum.toFixed(1)}%`,
      inventory_trend: `${inventoryTrend > 0 ? '+' : ''}${inventoryTrend.toFixed(1)}%`,
      avg_days_on_market: `${avgDom.toFixed(0)} days`,
      mortgage_rate_trend: `${rateTrend > 0 ? '+' : ''}${rateTrend.toFixed(2)}%`,
      employment_growth: `${marketData.employment_growth > 0 ? '+' : ''}${marketData.employment_growth}%`
    }
  }
}

function formatMarketTimingReport(result: MarketTimingResult): string {
  const lines: string[] = []
  lines.push('## Market Timing Analysis')
  lines.push('')
  lines.push(`**Market Phase:** ${result.market_phase.replace(/_/g, ' ').toUpperCase()}`)
  lines.push(`**Signal:** ${result.buy_hold_sell_signal}`)
  lines.push(`**Price Forecast (12m):** ${result.price_forecast_12m > 0 ? '+' : ''}${result.price_forecast_12m}%`)
  lines.push(`**Risk Level:** ${result.risk_level.toUpperCase()}`)
  lines.push(`**Momentum Score:** ${result.momentum_score}`)
  lines.push(`**Supply/Demand Ratio:** ${result.supply_demand_ratio} months`)
  lines.push(`**Affordability Index:** ${result.affordability_index}/100`)
  lines.push('')
  lines.push('### Key Indicators')
  lines.push('| Indicator | Value |')
  lines.push('|-----------|-------|')
  for (const [key, value] of Object.entries(result.key_indicators)) {
    lines.push(`| ${key.replace(/_/g, ' ')} | ${value} |`)
  }
  return lines.join('\n')
}

// ==================== TOOL 4: FLIP ANALYZER ====================

function analyzeFlip(
  purchasePrice: number,
  rehabCost: number,
  afterRepairValue: number,
  holdingCosts?: HoldingCosts
): FlipResult {
  const hc = {
    property_tax_monthly: holdingCosts?.property_tax_monthly ?? purchasePrice * 0.012 / 12,
    insurance_monthly: holdingCosts?.insurance_monthly ?? 150,
    utilities_monthly: holdingCosts?.utilities_monthly ?? 200,
    hoa_monthly: holdingCosts?.hoa_monthly ?? 0,
    financing_monthly: holdingCosts?.financing_monthly ?? (purchasePrice + rehabCost) * 0.0075,
    selling_costs_pct: holdingCosts?.selling_costs_pct ?? 8
  }

  const holdingPeriodMonths = Math.max(3, Math.ceil(rehabCost / 10000) + 2)
  const totalHoldingCosts = (hc.property_tax_monthly + hc.insurance_monthly + hc.utilities_monthly + hc.hoa_monthly + hc.financing_monthly) * holdingPeriodMonths
  const sellingCosts = afterRepairValue * (hc.selling_costs_pct / 100)
  const totalProjectCost = purchasePrice + rehabCost + totalHoldingCosts + sellingCosts
  const netProfit = afterRepairValue - totalProjectCost
  const profitMargin = (netProfit / afterRepairValue) * 100
  const roi = (netProfit / (purchasePrice + rehabCost + totalHoldingCosts)) * 100
  const breakEvenPoint = totalProjectCost
  const maxAllowableOffer = afterRepairValue * 0.7 - rehabCost - totalHoldingCosts * 0.5
  const recommendedOffer = Math.min(purchasePrice, maxAllowableOffer * 0.92)

  // Risk factors
  const riskFactors: string[] = []
  if (profitMargin < 10) riskFactors.push('Low profit margin (<10%)')
  if (profitMargin < 5) riskFactors.push('Very thin margin — high risk of loss')
  if (holdingPeriodMonths > 6) riskFactors.push('Extended holding period increases risk')
  if (rehabCost > purchasePrice * 0.4) riskFactors.push('Rehab cost exceeds 40% of purchase price')
  if (roi < 15) riskFactors.push('ROI below 15% threshold for flipping')
  if (sellingCosts > afterRepairValue * 0.08) riskFactors.push('High selling costs')
  if (riskFactors.length === 0) riskFactors.push('Standard flip risk profile')

  let risk_grade = 'B'
  if (profitMargin >= 20 && roi >= 25) risk_grade = 'A'
  else if (profitMargin >= 15 && roi >= 20) risk_grade = 'A-'
  else if (profitMargin >= 10 && roi >= 15) risk_grade = 'B+'
  else if (profitMargin >= 5) risk_grade = 'C'
  else risk_grade = 'D'

  return {
    profit_margin: Math.round(profitMargin * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    break_even_point: Math.round(breakEvenPoint),
    risk_factors: riskFactors,
    recommended_offer: Math.round(recommendedOffer),
    max_allowable_offer: Math.round(maxAllowableOffer),
    total_project_cost: Math.round(totalProjectCost),
    holding_period_months: holdingPeriodMonths,
    risk_grade
  }
}

function formatFlipReport(result: FlipResult): string {
  const lines: string[] = []
  lines.push('## Fix & Flip Analysis')
  lines.push('')
  lines.push(`**Risk Grade:** ${result.risk_grade}`)
  lines.push('')
  lines.push('### Profitability')
  lines.push(`- Profit Margin: ${result.profit_margin}%`)
  lines.push(`- ROI: ${result.roi}%`)
  lines.push(`- Break-even Point: $${result.break_even_point.toLocaleString()}`)
  lines.push(`- Total Project Cost: $${result.total_project_cost.toLocaleString()}`)
  lines.push('')
  lines.push('### Offer Strategy')
  lines.push(`- Recommended Offer: $${result.recommended_offer.toLocaleString()}`)
  lines.push(`- Max Allowable Offer: $${result.max_allowable_offer.toLocaleString()}`)
  lines.push(`- Est. Holding Period: ${result.holding_period_months} months`)
  lines.push('')
  lines.push('### Risk Factors')
  for (const rf of result.risk_factors) {
    lines.push(`- ${rf}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 5: PORTFOLIO OPTIMIZER ====================

function optimizePortfolio(
  properties: PortfolioProperty[],
  constraints?: PortfolioConstraints
): PortfolioResult {
  const totalValue = properties.reduce((s, p) => s + p.value, 0)
  const totalIncome = properties.reduce((s, p) => s + p.income, 0)
  const portfolioYield = totalValue > 0 ? (totalIncome / totalValue) * 100 : 0

  // Location breakdown
  const locationMap = new Map<string, number>()
  for (const p of properties) {
    locationMap.set(p.location, (locationMap.get(p.location) ?? 0) + p.value)
  }
  const locationBreakdown: Record<string, number> = {}
  for (const [loc, val] of locationMap) {
    locationBreakdown[loc] = Math.round((val / totalValue) * 10000) / 100
  }

  // Type breakdown
  const typeMap = new Map<string, number>()
  for (const p of properties) {
    typeMap.set(p.type, (typeMap.get(p.type) ?? 0) + p.value)
  }
  const typeBreakdown: Record<string, number> = {}
  for (const [type, val] of typeMap) {
    typeBreakdown[type] = Math.round((val / totalValue) * 10000) / 100
  }

  // Diversification score (0-100)
  const locationDiversity = Math.min(locationMap.size * 15, 40)
  const typeDiversity = Math.min(typeMap.size * 12, 30)
  const valueSpread = calculateValueSpread(properties, totalValue)
  const diversificationScore = Math.round(locationDiversity + typeDiversity + valueSpread)

  // Concentration risks
  const concentrationRisks: string[] = []
  const maxLocPct = constraints?.max_single_property_pct ?? 30
  const maxLocationPct = constraints?.max_single_location_pct ?? 40

  for (const [loc, pct] of Object.entries(locationBreakdown)) {
    if (pct > maxLocationPct) concentrationRisks.push(`Over-concentrated in ${loc}: ${pct}% (max ${maxLocationPct}%)`)
  }
  for (const [type, pct] of Object.entries(typeBreakdown)) {
    if (pct > 50) concentrationRisks.push(`Heavy ${type} exposure: ${pct}% of portfolio`)
  }
  for (const p of properties) {
    const pct = (p.value / totalValue) * 100
    if (pct > maxLocPct) concentrationRisks.push(`Single property represents ${pct.toFixed(1)}% of portfolio`)
  }
  if (properties.length < 3) concentrationRisks.push('Portfolio has fewer than 3 properties — limited diversification')
  if (concentrationRisks.length === 0) concentrationRisks.push('No significant concentration risks detected')

  // Rebalancing recommendations
  const recommendations: string[] = []
  if (diversificationScore < 50) recommendations.push('Increase diversification across locations and property types')
  if (locationMap.size < 3) recommendations.push('Add properties in different geographic markets')
  if (typeMap.size < 2) recommendations.push('Diversify into different property types (e.g., residential + commercial)')
  if (portfolioYield < (constraints?.min_target_yield ?? 5)) recommendations.push('Target higher-yield properties to meet minimum yield threshold')
  if (portfolioYield > (constraints?.max_target_yield ?? 12)) recommendations.push('Consider rebalancing from high-yield to stable appreciation assets')
  const riskTolerance = constraints?.risk_tolerance ?? 'moderate'
  if (riskTolerance === 'conservative' && portfolioYield < 4) recommendations.push('Conservative portfolio: prioritize stable, lower-yield assets in prime locations')
  if (riskTolerance === 'aggressive' && portfolioYield < 8) recommendations.push('Aggressive portfolio: seek higher-yield opportunities in growth markets')
  if (recommendations.length === 0) recommendations.push('Portfolio is well-balanced — maintain current allocation')

  // Risk-adjusted return
  const riskPenalty = concentrationRisks.length * 0.5 + (100 - diversificationScore) * 0.02
  const riskAdjustedReturn = Math.round((portfolioYield - riskPenalty) * 100) / 100

  let optimization_grade = 'B'
  if (diversificationScore >= 75 && riskAdjustedReturn >= 7) optimization_grade = 'A'
  else if (diversificationScore >= 60 && riskAdjustedReturn >= 5) optimization_grade = 'A-'
  else if (diversificationScore >= 50 && riskAdjustedReturn >= 4) optimization_grade = 'B+'
  else if (diversificationScore >= 35) optimization_grade = 'C'
  else optimization_grade = 'D'

  return {
    diversification_score: diversificationScore,
    rebalancing_recommendations: recommendations,
    risk_adjusted_return: riskAdjustedReturn,
    concentration_risks: concentrationRisks,
    portfolio_yield: Math.round(portfolioYield * 100) / 100,
    total_value: totalValue,
    total_annual_income: totalIncome,
    location_breakdown: locationBreakdown,
    type_breakdown: typeBreakdown,
    optimization_grade
  }
}

function calculateValueSpread(properties: PortfolioProperty[], totalValue: number): number {
  if (properties.length <= 1) return 0
  const avg = totalValue / properties.length
  const variance = properties.reduce((s, p) => s + Math.pow(p.value - avg, 2), 0) / properties.length
  const cv = Math.sqrt(variance) / avg
  return Math.max(0, 30 - cv * 20)
}

function formatPortfolioReport(result: PortfolioResult): string {
  const lines: string[] = []
  lines.push('## Portfolio Optimization Report')
  lines.push('')
  lines.push(`**Optimization Grade:** ${result.optimization_grade}`)
  lines.push(`**Diversification Score:** ${result.diversification_score}/100`)
  lines.push(`**Risk-Adjusted Return:** ${result.risk_adjusted_return}%`)
  lines.push(`**Portfolio Yield:** ${result.portfolio_yield}%`)
  lines.push(`**Total Value:** $${result.total_value.toLocaleString()}`)
  lines.push(`**Total Annual Income:** $${result.total_annual_income.toLocaleString()}`)
  lines.push('')
  lines.push('### Location Breakdown')
  lines.push('| Location | Allocation |')
  lines.push('|----------|-----------|')
  for (const [loc, pct] of Object.entries(result.location_breakdown)) {
    lines.push(`| ${loc} | ${pct}% |`)
  }
  lines.push('')
  lines.push('### Type Breakdown')
  lines.push('| Type | Allocation |')
  lines.push('|------|-----------|')
  for (const [type, pct] of Object.entries(result.type_breakdown)) {
    lines.push(`| ${type} | ${pct}% |`)
  }
  lines.push('')
  lines.push('### Concentration Risks')
  for (const risk of result.concentration_risks) {
    lines.push(`- ${risk}`)
  }
  lines.push('')
  lines.push('### Rebalancing Recommendations')
  for (const rec of result.rebalancing_recommendations) {
    lines.push(`- ${rec}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 6: MORTGAGE ANALYZER ====================

function analyzeMortgage(
  loanAmount: number,
  interestRate: number,
  termYears: number,
  downPayment: number
): MortgageResult {
  const monthlyRate = interestRate / 100 / 12
  const numPayments = termYears * 12

  // Monthly payment (P&I)
  const monthlyPayment = monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments

  const totalCost = monthlyPayment * numPayments
  const totalInterest = totalCost - loanAmount

  // Amortization summary
  let balance = loanAmount
  let year1Interest = 0
  let year1Principal = 0
  let year5Interest = 0
  let year5Principal = 0
  let maxSingleMonth = 0

  for (let m = 1; m <= numPayments; m++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    balance -= principalPayment

    if (m <= 12) {
      year1Interest += interestPayment
      year1Principal += principalPayment
    }
    if (m <= 60) {
      year5Interest += interestPayment
      year5Principal += principalPayment
    }
    if (m === 1) maxSingleMonth = monthlyPayment
  }

  // Equity projections
  let balance5y = loanAmount
  for (let m = 1; m <= 60; m++) {
    balance5y = balance5y * (1 + monthlyRate) - monthlyPayment
  }
  let balance10y = loanAmount
  for (let m = 1; m <= 120; m++) {
    balance10y = balance10y * (1 + monthlyRate) - monthlyPayment
  }

  const propertyValue = loanAmount + downPayment
  const equity5y = propertyValue - balance5y
  const equity10y = propertyValue - balance10y

  // Break-even vs renting
  const monthlyRentEquivalent = monthlyPayment * 0.7
  const annualAppreciation = propertyValue * 0.03
  const annualEquityBuild = year1Principal
  const annualOwnershipBenefit = annualAppreciation + annualEquityBuild
  const upfrontCosts = downPayment + propertyValue * 0.03
  const breakEvenMonths = annualOwnershipBenefit > 0 ? Math.ceil((upfrontCosts / annualOwnershipBenefit) * 12) : 999

  let recommendation = 'Buying is favorable'
  if (breakEvenMonths > 60) recommendation = 'Renting may be more cost-effective in the short term'
  else if (breakEvenMonths > 36) recommendation = 'Moderate break-even — consider longer holding period'
  else recommendation = 'Strong buy signal — quick break-even vs renting'

  const ltv = (loanAmount / propertyValue) * 100
  const dtiEstimate = ((monthlyPayment * 12) / (propertyValue * 0.25)) * 100

  return {
    monthly_payment: Math.round(monthlyPayment * 100) / 100,
    total_interest: Math.round(totalInterest),
    total_cost: Math.round(totalCost),
    amortization_schedule_summary: {
      year_1_interest: Math.round(year1Interest),
      year_1_principal: Math.round(year1Principal),
      year_5_interest: Math.round(year5Interest),
      year_5_principal: Math.round(year5Principal),
      max_single_month: Math.round(maxSingleMonth)
    },
    break_even_vs_renting: {
      monthly_rent_equivalent: Math.round(monthlyRentEquivalent),
      break_even_months: breakEvenMonths,
      recommendation,
      equity_after_5y: Math.round(equity5y),
      equity_after_10y: Math.round(equity10y)
    },
    loan_summary: {
      loan_amount: loanAmount,
      ltv_ratio: Math.round(ltv * 100) / 100,
      dti_estimate: Math.round(dtiEstimate * 100) / 100
    }
  }
}

function formatMortgageReport(result: MortgageResult): string {
  const lines: string[] = []
  lines.push('## Mortgage Analysis')
  lines.push('')
  lines.push('### Loan Summary')
  lines.push(`- Loan Amount: $${result.loan_summary.loan_amount.toLocaleString()}`)
  lines.push(`- LTV Ratio: ${result.loan_summary.ltv_ratio}%`)
  lines.push(`- Estimated DTI: ${result.loan_summary.dti_estimate}%`)
  lines.push('')
  lines.push('### Payment Details')
  lines.push(`- Monthly Payment (P&I): $${result.monthly_payment.toLocaleString()}`)
  lines.push(`- Total Interest: $${result.total_interest.toLocaleString()}`)
  lines.push(`- Total Cost: $${result.total_cost.toLocaleString()}`)
  lines.push('')
  lines.push('### Amortization Summary')
  lines.push(`- Year 1 Interest: $${result.amortization_schedule_summary.year_1_interest.toLocaleString()}`)
  lines.push(`- Year 1 Principal: $${result.amortization_schedule_summary.year_1_principal.toLocaleString()}`)
  lines.push(`- Year 5 Interest: $${result.amortization_schedule_summary.year_5_interest.toLocaleString()}`)
  lines.push(`- Year 5 Principal: $${result.amortization_schedule_summary.year_5_principal.toLocaleString()}`)
  lines.push('')
  lines.push('### Break-even vs Renting')
  lines.push(`- Monthly Rent Equivalent: $${result.break_even_vs_renting.monthly_rent_equivalent.toLocaleString()}`)
  lines.push(`- Break-even: ${result.break_even_vs_renting.break_even_months} months`)
  lines.push(`- Equity after 5y: $${result.break_even_vs_renting.equity_after_5y.toLocaleString()}`)
  lines.push(`- Equity after 10y: $${result.break_even_vs_renting.equity_after_10y.toLocaleString()}`)
  lines.push(`- Recommendation: ${result.break_even_vs_renting.recommendation}`)
  return lines.join('\n')
}

// ==================== TOOL 7: LOCATION SCORER ====================

function scoreLocation(locationData: LocationData): LocationResult {
  // Individual scores (0-100 each)
  const schoolScore = Math.min(locationData.school_rating * 10, 100)
  const crimeScore = Math.max(0, 100 - locationData.crime_rate * 5)
  const walkScore = locationData.walk_score
  const transitScore = locationData.transit_score
  const amenitiesScore = Math.min(locationData.amenities_count * 4, 100)
  const employmentScore = Math.max(0, Math.min(50 + locationData.employment_growth * 10, 100))
  const populationScore = Math.max(0, Math.min(50 + locationData.population_growth * 15, 100))

  const scoreBreakdown: Record<string, number> = {
    schools: Math.round(schoolScore),
    safety: Math.round(crimeScore),
    walkability: Math.round(walkScore),
    transit: Math.round(transitScore),
    amenities: Math.round(amenitiesScore),
    employment: Math.round(employmentScore),
    population_growth: Math.round(populationScore)
  }

  // Weighted composite score
  const locationScore = Math.round(
    schoolScore * 0.15 +
    crimeScore * 0.20 +
    walkScore * 0.10 +
    transitScore * 0.10 +
    amenitiesScore * 0.10 +
    employmentScore * 0.20 +
    populationScore * 0.15
  )

  // Investment appeal
  let investment_appeal = 'Moderate'
  if (locationScore >= 80) investment_appeal = 'Excellent — Prime investment location'
  else if (locationScore >= 65) investment_appeal = 'Good — Strong fundamentals'
  else if (locationScore >= 50) investment_appeal = 'Moderate — Selective investment'
  else if (locationScore >= 35) investment_appeal = 'Below Average — High risk/reward'
  else investment_appeal = 'Poor — Not recommended'

  // Growth potential
  let growth_potential = 'Stable'
  if (employmentScore >= 75 && populationScore >= 70) growth_potential = 'High Growth — Strong job and population inflow'
  else if (employmentScore >= 60 || populationScore >= 60) growth_potential = 'Moderate Growth — Positive trends'
  else if (employmentScore >= 40 && populationScore >= 40) growth_potential = 'Stable — Steady but not exceptional'
  else growth_potential = 'Declining — Negative or flat growth indicators'

  // Risk factors
  const riskFactors: string[] = []
  if (crimeScore < 40) riskFactors.push('High crime area — may impact tenant quality and appreciation')
  if (schoolScore < 40) riskFactors.push('Poor school ratings — limits family tenant pool')
  if (employmentScore < 40) riskFactors.push('Weak employment growth — economic vulnerability')
  if (populationScore < 35) riskFactors.push('Population decline — long-term demand risk')
  if (walkScore < 30 && transitScore < 30) riskFactors.push('Car-dependent location — limits renter pool')
  if (riskFactors.length === 0) riskFactors.push('No significant location-specific risks identified')

  // Comparable markets
  const comparableMarkets: string[] = []
  if (locationScore >= 70) comparableMarkets.push('Similar to established growth corridors')
  if (employmentScore >= 70) comparableMarkets.push('Comparable to tech/employment hub suburbs')
  if (walkScore >= 70 && transitScore >= 60) comparableMarkets.push('Walkable urban core comparable')
  if (comparableMarkets.length === 0) comparableMarkets.push('No direct comparable markets identified')

  // Recommendation
  let recommendation = 'Proceed with caution'
  if (locationScore >= 75) recommendation = 'Strong buy — excellent location fundamentals'
  else if (locationScore >= 60) recommendation = 'Favorable — good location for investment'
  else if (locationScore >= 45) recommendation = 'Neutral — consider specific property merits'
  else recommendation = 'Avoid — weak location fundamentals'

  return {
    location_score: locationScore,
    investment_appeal,
    growth_potential,
    risk_factors: riskFactors,
    score_breakdown: scoreBreakdown,
    comparable_markets: comparableMarkets,
    recommendation
  }
}

function formatLocationReport(result: LocationResult): string {
  const lines: string[] = []
  lines.push('## Location Score Analysis')
  lines.push('')
  lines.push(`**Location Score:** ${result.location_score}/100`)
  lines.push(`**Investment Appeal:** ${result.investment_appeal}`)
  lines.push(`**Growth Potential:** ${result.growth_potential}`)
  lines.push(`**Recommendation:** ${result.recommendation}`)
  lines.push('')
  lines.push('### Score Breakdown')
  lines.push('| Category | Score |')
  lines.push('|----------|-------|')
  for (const [cat, score] of Object.entries(result.score_breakdown)) {
    lines.push(`| ${cat.replace(/_/g, ' ')} | ${score}/100 |`)
  }
  lines.push('')
  lines.push('### Risk Factors')
  for (const rf of result.risk_factors) {
    lines.push(`- ${rf}`)
  }
  lines.push('')
  lines.push('### Comparable Markets')
  for (const cm of result.comparable_markets) {
    lines.push(`- ${cm}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 8: TAX BENEFIT CALCULATOR ====================

function calculateTaxBenefits(propertyData: TaxPropertyData): TaxBenefitResult {
  const { purchase_price, rental_income, expenses, holding_period, tax_bracket } = propertyData

  // Depreciation (residential: 27.5 years, assume 80% of value is building)
  const depreciableBasis = purchase_price * 0.80
  const annualDepreciation = depreciableBasis / 27.5
  const totalDepreciationBenefit = annualDepreciation * holding_period * (tax_bracket / 100)

  // Deductions
  const mortgageInterestDeduction = purchase_price * 0.75 * 0.05 * holding_period * (tax_bracket / 100)
  const operatingExpenseDeduction = expenses * holding_period * (tax_bracket / 100)
  const totalAnnualDeductions = annualDepreciation + (purchase_price * 0.75 * 0.05) + expenses
  const taxSavings = totalAnnualDeductions * (tax_bracket / 100)

  // Capital gains estimate (assume 3% annual appreciation)
  const estimatedFutureValue = purchase_price * Math.pow(1.03, holding_period)
  const estimatedGain = estimatedFutureValue - purchase_price
  const federalTaxRate = holding_period > 1 ? 0.15 : 0.25
  const federalTax = estimatedGain * federalTaxRate
  const stateTaxEstimate = estimatedGain * 0.05
  const depreciationRecapture = annualDepreciation * holding_period * 0.25
  const totalTaxes = federalTax + stateTaxEstimate + depreciationRecapture
  const netProceeds = estimatedFutureValue - totalTaxes

  // 1031 exchange benefit
  const deferredTax = federalTax + stateTaxEstimate + depreciationRecapture
  const netBenefitVsSale = deferredTax * 0.7 // Time value of deferred tax

  const effectiveTaxRate = totalTaxes / estimatedGain * 100
  const totalAfterTaxProfit = estimatedGain - totalTaxes
  const afterTaxReturn = (totalAfterTaxProfit / purchase_price) * 100

  return {
    depreciation_benefit: Math.round(totalDepreciationBenefit),
    deduction_summary: {
      total_annual_deductions: Math.round(totalAnnualDeductions),
      mortgage_interest_deduction: Math.round(mortgageInterestDeduction),
      depreciation_deduction: Math.round(annualDepreciation),
      operating_expense_deduction: Math.round(operatingExpenseDeduction),
      tax_savings: Math.round(taxSavings)
    },
    capital_gains_estimate: {
      estimated_gain: Math.round(estimatedGain),
      federal_tax: Math.round(federalTax),
      state_tax_estimate: Math.round(stateTaxEstimate),
      net_proceeds: Math.round(netProceeds),
      depreciation_recapture: Math.round(depreciationRecapture)
    },
    exchange_1031_benefit: {
      deferred_tax: Math.round(deferredTax),
      net_benefit_vs_sale: Math.round(netBenefitVsSale),
      replacement_property_requirement: 'Must identify within 45 days, close within 180 days. Replacement property must be of equal or greater value.',
      timeline_requirements: [
        'Day 0: Close on relinquished property',
        'Day 45: Identify replacement property (max 3 properties)',
        'Day 180: Close on replacement property',
        'Must use Qualified Intermediary for funds',
        'Reinvest all equity and acquire equal/greater debt'
      ]
    },
    effective_tax_rate: Math.round(effectiveTaxRate * 100) / 100,
    after_tax_return: Math.round(afterTaxReturn * 100) / 100
  }
}

function formatTaxBenefitReport(result: TaxBenefitResult): string {
  const lines: string[] = []
  lines.push('## Tax Benefit Analysis')
  lines.push('')
  lines.push(`**Effective Tax Rate:** ${result.effective_tax_rate}%`)
  lines.push(`**After-Tax Return:** ${result.after_tax_return}%`)
  lines.push(`**Total Depreciation Benefit:** $${result.depreciation_benefit.toLocaleString()}`)
  lines.push('')
  lines.push('### Deduction Summary')
  lines.push(`- Total Annual Deductions: $${result.deduction_summary.total_annual_deductions.toLocaleString()}`)
  lines.push(`- Depreciation Deduction: $${result.deduction_summary.depreciation_deduction.toLocaleString()}`)
  lines.push(`- Mortgage Interest Deduction: $${result.deduction_summary.mortgage_interest_deduction.toLocaleString()}`)
  lines.push(`- Operating Expense Deduction: $${result.deduction_summary.operating_expense_deduction.toLocaleString()}`)
  lines.push(`- Annual Tax Savings: $${result.deduction_summary.tax_savings.toLocaleString()}`)
  lines.push('')
  lines.push('### Capital Gains Estimate')
  lines.push(`- Estimated Gain: $${result.capital_gains_estimate.estimated_gain.toLocaleString()}`)
  lines.push(`- Federal Tax: $${result.capital_gains_estimate.federal_tax.toLocaleString()}`)
  lines.push(`- State Tax (est.): $${result.capital_gains_estimate.state_tax_estimate.toLocaleString()}`)
  lines.push(`- Depreciation Recapture: $${result.capital_gains_estimate.depreciation_recapture.toLocaleString()}`)
  lines.push(`- Net Proceeds: $${result.capital_gains_estimate.net_proceeds.toLocaleString()}`)
  lines.push('')
  lines.push('### 1031 Exchange Benefit')
  lines.push(`- Deferred Tax: $${result.exchange_1031_benefit.deferred_tax.toLocaleString()}`)
  lines.push(`- Net Benefit vs Sale: $${result.exchange_1031_benefit.net_benefit_vs_sale.toLocaleString()}`)
  lines.push(`- Requirement: ${result.exchange_1031_benefit.replacement_property_requirement}`)
  lines.push('')
  lines.push('### 1031 Exchange Timeline')
  for (const step of result.exchange_1031_benefit.timeline_requirements) {
    lines.push(`- ${step}`)
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Property Valuator
  tools.register(defineTool({
    name: 'property_valuator',
    description: 'Estimate property value using comparative market analysis (CMA). Applies adjustments for age, condition, bedrooms, and comparable sales. Returns estimated value with confidence range.',
    parameters: {
      property_data: { type: 'string', required: true, description: 'JSON object with fields: type (single_family/condo/townhouse/multi_family/commercial/land), location (urban/suburban/rural/resort/downtown), sqft (number), bedrooms (number), age (years), condition (poor/fair/good/excellent)' },
      comparables: { type: 'string', description: 'Optional JSON array of comparable sales with fields: price, sqft, bedrooms, age, condition, distance_miles, sold_date' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { property_data: string; comparables?: string }) {
      const property: PropertyData = JSON.parse(args.property_data)
      const comps: ComparableData[] | undefined = args.comparables ? JSON.parse(args.comparables) : undefined
      const result = evaluateProperty(property, comps)
      return formatValuationReport(result)
    }
  }))

  // Tool 2: Rental Yield Calculator
  tools.register(defineTool({
    name: 'rental_yield_calculator',
    description: 'Calculate rental yield metrics including gross yield, net yield, cash-on-cash return, and cap rate. Provides expense breakdown and yield grading.',
    parameters: {
      purchase_price: { type: 'string', required: true, description: 'Property purchase price as a number string' },
      monthly_rent: { type: 'string', required: true, description: 'Expected monthly rent as a number string' },
      expenses: { type: 'string', required: true, description: 'JSON object with fields: property_tax (annual), insurance (annual), maintenance (annual), vacancy_rate (%), management_fee (%)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { purchase_price: string; monthly_rent: string; expenses: string }) {
      const price = parseFloat(args.purchase_price)
      const rent = parseFloat(args.monthly_rent)
      const expenses: ExpenseData = JSON.parse(args.expenses)
      const result = calculateRentalYield(price, rent, expenses)
      return formatRentalYieldReport(result)
    }
  }))

  // Tool 3: Market Timing Analyzer
  tools.register(defineTool({
    name: 'market_timing_analyzer',
    description: 'Analyze real estate market conditions to determine optimal buy/hold/sell timing. Evaluates price momentum, inventory trends, days on market, mortgage rates, and employment data.',
    parameters: {
      market_data: { type: 'string', required: true, description: 'JSON object with fields: price_history (array of prices), inventory_levels (array), days_on_market (array), mortgage_rates (array), employment_growth (%)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { market_data: string }) {
      const data: MarketData = JSON.parse(args.market_data)
      const result = analyzeMarketTiming(data)
      return formatMarketTimingReport(result)
    }
  }))

  // Tool 4: Flip Analyzer
  tools.register(defineTool({
    name: 'flip_analyzer',
    description: 'Analyze fix-and-flip investment opportunities. Calculates profit margin, ROI, break-even point, risk factors, and recommends maximum offer price using the 70% rule.',
    parameters: {
      purchase_price: { type: 'string', required: true, description: 'Current asking or target purchase price as a number string' },
      rehab_cost: { type: 'string', required: true, description: 'Estimated total rehabilitation cost as a number string' },
      after_repair_value: { type: 'string', required: true, description: 'Estimated after-repair value (ARV) as a number string' },
      holding_costs: { type: 'string', description: 'Optional JSON object with fields: property_tax_monthly, insurance_monthly, utilities_monthly, hoa_monthly, financing_monthly, selling_costs_pct' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { purchase_price: string; rehab_cost: string; after_repair_value: string; holding_costs?: string }) {
      const purchasePrice = parseFloat(args.purchase_price)
      const rehabCost = parseFloat(args.rehab_cost)
      const arv = parseFloat(args.after_repair_value)
      const holdingCosts: HoldingCosts | undefined = args.holding_costs ? JSON.parse(args.holding_costs) : undefined
      const result = analyzeFlip(purchasePrice, rehabCost, arv, holdingCosts)
      return formatFlipReport(result)
    }
  }))

  // Tool 5: Portfolio Optimizer
  tools.register(defineTool({
    name: 'portfolio_optimizer',
    description: 'Optimize real estate portfolio allocation. Analyzes diversification across locations and property types, identifies concentration risks, and provides rebalancing recommendations.',
    parameters: {
      properties: { type: 'string', required: true, description: 'JSON array of property objects with fields: value (number), income (annual), location (string), type (string)' },
      constraints: { type: 'string', description: 'Optional JSON object with fields: max_single_property_pct, max_single_location_pct, min_target_yield, max_target_yield, risk_tolerance (conservative/moderate/aggressive)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { properties: string; constraints?: string }) {
      const properties: PortfolioProperty[] = JSON.parse(args.properties)
      const constraints: PortfolioConstraints | undefined = args.constraints ? JSON.parse(args.constraints) : undefined
      const result = optimizePortfolio(properties, constraints)
      return formatPortfolioReport(result)
    }
  }))

  // Tool 6: Mortgage Analyzer
  tools.register(defineTool({
    name: 'mortgage_analyzer',
    description: 'Calculate mortgage payments, total interest, amortization schedule, and break-even analysis versus renting. Includes equity projections and loan-to-value metrics.',
    parameters: {
      loan_amount: { type: 'string', required: true, description: 'Loan principal amount as a number string' },
      interest_rate: { type: 'string', required: true, description: 'Annual interest rate as a percentage string (e.g., "6.5" for 6.5%)' },
      term_years: { type: 'string', required: true, description: 'Loan term in years as a number string' },
      down_payment: { type: 'string', required: true, description: 'Down payment amount as a number string' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { loan_amount: string; interest_rate: string; term_years: string; down_payment: string }) {
      const loanAmount = parseFloat(args.loan_amount)
      const interestRate = parseFloat(args.interest_rate)
      const termYears = parseFloat(args.term_years)
      const downPayment = parseFloat(args.down_payment)
      const result = analyzeMortgage(loanAmount, interestRate, termYears, downPayment)
      return formatMortgageReport(result)
    }
  }))

  // Tool 7: Location Scorer
  tools.register(defineTool({
    name: 'location_scorer',
    description: 'Score a location for real estate investment potential. Evaluates school ratings, crime rate, walkability, transit access, amenities, employment growth, and population trends.',
    parameters: {
      location_data: { type: 'string', required: true, description: 'JSON object with fields: school_rating (1-10), crime_rate (per 1000 residents), walk_score (0-100), transit_score (0-100), amenities_count (number), employment_growth (%), population_growth (%)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { location_data: string }) {
      const data: LocationData = JSON.parse(args.location_data)
      const result = scoreLocation(data)
      return formatLocationReport(result)
    }
  }))

  // Tool 8: Tax Benefit Calculator
  tools.register(defineTool({
    name: 'tax_benefit_calculator',
    description: 'Calculate real estate tax benefits including depreciation deductions, operating expense deductions, capital gains estimates, and 1031 exchange benefits.',
    parameters: {
      property_data: { type: 'string', required: true, description: 'JSON object with fields: purchase_price (number), rental_income (annual), expenses (annual), holding_period (years), tax_bracket (%)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { property_data: string }) {
      const data: TaxPropertyData = JSON.parse(args.property_data)
      const result = calculateTaxBenefits(data)
      return formatTaxBenefitReport(result)
    }
  }))

  console.log(`[dsh-tool-realestate] Loaded v${VERSION} — Real Estate Investment Analyzer with 8 tools`)
  console.log('  Tools: property_valuator, rental_yield_calculator, market_timing_analyzer, flip_analyzer, portfolio_optimizer, mortgage_analyzer, location_scorer, tax_benefit_calculator')
}
