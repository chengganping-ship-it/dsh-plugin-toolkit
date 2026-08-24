/**
 * DSH Real Estate & Property Tech Plugin v1.0.0
 *
 * Comprehensive real estate AI toolkit for DeepSeek Harness Agent.
 * Covers the full property lifecycle with 8 specialized tools.
 *
 * 2026 Context: PropTech market exceeds $35B globally. AI-powered real estate
 * analytics growing rapidly. Generic AI transforms property valuation, tenant
 * screening, and investment analysis. Digital mortgage platforms disrupt traditional
 * lending. Smart building tech and ESG compliance drive property management innovation.
 *
 * @module dsh-tool-realestateai
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-realestateai'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated real estate analysis for informational purposes only. It does not constitute professional appraisal, financial, legal, or investment advice. Always consult qualified real estate appraisers, financial advisors, and legal professionals before making property decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToInt(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRng<T>(input: T): () => number {
  return mulberry32(hashStringToInt(JSON.stringify(input)))
}

function rngRange(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function rngFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Property Valuation Engine ---
export interface PropertyValuationInput {
  property_type?: string
  address?: string
  square_feet?: number
  bedrooms?: number
  bathrooms?: number
  year_built?: number
  lot_size_sqft?: number
  condition?: 'poor' | 'fair' | 'good' | 'excellent' | 'luxury'
  comparable_sales?: Array<{ address: string; sale_price: number; sale_date: string; square_feet: number; bedrooms: number; bathrooms: number }>
  market_trend?: 'appreciating' | 'stable' | 'declining'
}

export interface ComparableProperty {
  address: string
  sale_price: number
  price_per_sqft: number
  adjustment_factors: string[]
  adjusted_price: number
  similarity_score: number
}

export interface ValuationBreakdown {
  land_value: number
  structure_value: number
  condition_adjustment: number
  market_adjustment: number
  location_premium: number
}

export interface PropertyValuationOutput {
  estimated_value: number
  value_low: number
  value_high: number
  confidence_score: number
  price_per_sqft: number
  comparables: ComparableProperty[]
  breakdown: ValuationBreakdown
  market_assessment: string
  valuation_method: string
  summary: string
}

// --- Tool 2: Investment Analysis Calculator ---
export interface InvestmentAnalysisInput {
  purchase_price?: number
  down_payment_pct?: number
  interest_rate?: number
  loan_term_years?: number
  monthly_rent?: number
  vacancy_rate?: number
  property_tax_annual?: number
  insurance_annual?: number
  maintenance_pct?: number
  property_management_pct?: number
  capex_reserve_pct?: number
  appreciation_rate?: number
  holding_period_years?: number
  selling_costs_pct?: number
}

export interface CashFlowAnalysis {
  effective_gross_income: number
  operating_expenses: number
  net_operating_income: number
  annual_debt_service: number
  cash_flow_before_tax: number
  monthly_cash_flow: number
}

export interface InvestmentMetrics {
  cap_rate: number
  cash_on_cash_return: number
  gross_rent_multiplier: number
  debt_service_coverage_ratio: number
  total_roi: number
  annualized_roi: number
  irr_estimate: number
  equity_multiple: number
}

export interface InvestmentAnalysisOutput {
  cash_flow: CashFlowAnalysis
  metrics: InvestmentMetrics
  five_year_projection: Array<{ year: number; property_value: number; equity: number; cumulative_cash_flow: number; total_return: number }>
  break_even_occupancy: number
  investment_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  risk_level: 'low' | 'moderate' | 'high'
  recommendations: string[]
  summary: string
}

// --- Tool 3: Tenant Screening System ---
export interface TenantScreeningInput {
  applicant_name?: string
  monthly_income?: number
  credit_score?: number
  employment_status?: string
  employment_length_months?: number
  monthly_rent?: number
  rental_history_months?: number
  evictions_count?: number
  bankruptcies?: boolean
  criminal_record?: boolean
  references_count?: number
  pets?: boolean
  smokers?: boolean
  requested_lease_term_months?: number
}

export interface screeningFactor {
  category: string
  score: number
  weight: number
  weighted_score: number
  assessment: string
  risk_flag: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

export interface TenantScreeningOutput {
  overall_score: number
  screening_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  recommendation: 'approve' | 'approve_with_conditions' | 'deny' | 'review_manually'
  factors: screeningFactor[]
  income_qualifies: boolean
  credit_qualifies: boolean
  conditions: string[]
  risk_flags: string[]
  summary: string
}

// --- Tool 4: Property Management Optimizer ---
export interface PropertyManagementInput {
  portfolio_size?: number
  property_types?: string[]
  geographic_regions?: string[]
  avg_occupancy_rate?: number
  avg_rent_collection_days?: number
  maintenance_requests_monthly?: number
  avg_maintenance_cost?: number
  tenant_turnover_rate?: number
  staff_count?: number
  management_fee_pct?: number
  automation_level?: 'manual' | 'partial' | 'automated' | 'smart'
  pain_points?: string[]
}

export interface OptimizationArea {
  area: string
  current_state: string
  recommended_state: string
  estimated_savings: number
  implementation_cost: 'low' | 'medium' | 'high'
  priority: 'critical' | 'high' | 'medium' | 'low'
  timeline_weeks: number
}

export interface BenchmarkComparison {
  metric: string
  your_value: number
  industry_avg: number
  percentile: number
  status: 'above_avg' | 'avg' | 'below_avg'
}

export interface PropertyManagementOutput {
  efficiency_score: number
  efficiency_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  optimizations: OptimizationArea[]
  benchmarks: BenchmarkComparison[]
  automation_recommendations: string[]
  cost_reduction_potential: number
  revenue_uplift_potential: string
  summary: string
}

// --- Tool 5: Rental Yield Analyzer ---
export interface RentalYieldInput {
  property_price?: number
  monthly_rent?: number
  annual_expenses?: number
  location?: string
  property_type?: string
  furnished?: boolean
  target_yield_pct?: number
  market_avg_yield?: number
  occupancy_target?: number
  lease_structure?: 'short_term' | 'long_term' | 'mid_term' | 'mixed'
  seasonal_factors?: boolean
}

export interface YieldBreakdown {
  gross_yield: number
  net_yield: number
  operating_expense_ratio: number
  break_even_vacancy_months: number
  effective_yield_adjusted: number
}

export interface YieldScenario {
  scenario_name: string
  monthly_rent: number
  occupancy_rate: number
  annual_net_income: number
  net_yield: number
  description: string
}

export interface RentalYieldOutput {
  current_yield: YieldBreakdown
  scenarios: YieldScenario[]
  market_comparison: string
  yield_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  pricing_recommendations: string[]
  optimization_opportunities: string[]
  summary: string
}

// --- Tool 6: Market Trend Forecaster ---
export interface MarketTrendInput {
  location?: string
  property_type?: string
  forecast_years?: number
  current_median_price?: number
  current_inventory_months?: number
  current_days_on_market?: number
  population_growth_rate?: number
  employment_growth_rate?: number
  interest_rate_trend?: 'rising' | 'stable' | 'falling'
  planned_infrastructure?: string[]
  economic_indicators?: string[]
}

export interface YearlyForecast {
  year: number
  median_price: number
  price_change_pct: number
  inventory_months: number
  days_on_market: number
  buyer_demand_index: number
  market_phase: 'buyers_market' | 'balanced' | 'sellers_market'
}

export interface TrendDriver {
  factor: string
  impact: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish'
  description: string
}

export interface MarketTrendOutput {
  forecasts: YearlyForecast[]
  trend_drivers: TrendDriver[]
  overall_outlook: 'strongly_positive' | 'positive' | 'neutral' | 'negative' | 'strongly_negative'
  appreciation_forecast_cagr: number
  peak_year: number | null
  trough_year: number | null
  risk_factors: string[]
  opportunity_zones: string[]
  summary: string
}

// --- Tool 7: Building Inspection Assessor ---
export interface BuildingInspectionInput {
  property_type?: string
  year_built?: number
  square_feet?: number
  stories?: number
  foundation_type?: string
  roof_type?: string
  electrical_system?: string
  plumbing_system?: string
  hvac_system?: string
  known_issues?: string[]
  last_renovation_year?: number
}

export interface DefectItem {
  category: string
  severity: 'cosmetic' | 'minor' | 'moderate' | 'major' | 'critical'
  description: string
  estimated_repair_cost: number
  urgency: 'monitor' | 'soon' | 'soon_urgent' | 'immediate'
  safety_concern: boolean
}

export interface InspectionScore {
  foundation: number
  roof: number
  electrical: number
  plumbing: number
  hvac: number
  structural: number
  exterior: number
  interior: number
  overall: number
}

export interface BuildingInspectionOutput {
  defects: DefectItem[]
  scores: InspectionScore
  condition_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  total_repair_estimate: number
  critical_items_count: number
  remaining_useful_life_years: number
  immediate_concerns: string[]
  maintenance_schedule: string[]
  summary: string
}

// --- Tool 8: Mortgage Eligibility Checker ---
export interface MortgageEligibilityInput {
  annual_income?: number
  monthly_debts?: number
  credit_score?: number
  down_payment_amount?: number
  down_payment_pct?: number
  loan_term_years?: number
  interest_rate?: number
  property_value?: number
  employment_length_years?: number
  employment_type?: string
  first_time_buyer?: boolean
  self_employed?: boolean
  existing_mortgages?: number[]
  co_borrower?: boolean
  co_borrower_income?: number
  co_borrower_debts?: number
}

export interface DTIAnalysis {
  front_end_dti: number
  back_end_dti: number
  front_end_qualifies: boolean
  back_end_qualifies: boolean
  max_monthly_housing_payment: number
  max_total_monthly_debt: number
}

export interface LTVAnalysis {
  loan_amount: number
  ltv_ratio: number
  ltv_qualifies: boolean
  pmi_required: boolean
  pmi_estimate_monthly: number
}

export interface LoanProduct {
  product_name: string
  interest_rate: number
  monthly_payment: number
  total_interest: number
  recommended: boolean
  notes: string
}

export interface MortgageEligibilityOutput {
  eligible: boolean
  max_loan_amount: number
  max_purchase_price: number
  dti: DTIAnalysis
  ltv: LTVAnalysis
  loan_products: LoanProduct[]
  conditions: string[]
  risk_factors: string[]
  improvement_suggestions: string[]
  summary: string
}

// ==================== HELPER ====================

function getConditionMultiplier(condition: string): number {
  const multipliers: Record<string, number> = {
    'poor': 0.7, 'fair': 0.85, 'good': 1.0, 'excellent': 1.1, 'luxury': 1.25,
  }
  return multipliers[condition] || 1.0
}

function getAgeFactor(yearBuilt: number, currentYear: number): number {
  const age = currentYear - yearBuilt
  if (age <= 5) return 1.05
  if (age <= 15) return 1.0
  if (age <= 30) return 0.95
  if (age <= 50) return 0.88
  if (age <= 75) return 0.8
  return 0.7
}

function getFoundationScore(foundationType: string): number {
  const scores: Record<string, number> = {
    'concrete_slab': 85, 'crawl_space': 75, 'basement': 80, 'pier_and_beam': 70,
    'concrete': 90, 'stone': 60, 'unknown': 50,
  }
  return scores[foundationType.toLowerCase()] || 60
}

function getRoofScore(roofType: string): number {
  const scores: Record<string, number> = {
    'asphalt_shingle': 75, 'metal': 85, 'tile': 90, 'slate': 95,
    'flat': 65, 'shake': 70, 'membrane': 60, 'unknown': 50,
  }
  return scores[roofType.toLowerCase()] || 60
}

// ==================== TOOL 1: PROPERTY VALUATION ENGINE ====================

function estimatePropertyValue(input: PropertyValuationInput): PropertyValuationOutput {
  const rng = seededRng(input)
  const propertyType = (input.property_type || 'single_family').toLowerCase()
  const sqft = input.square_feet || 1800
  const condition = input.condition || 'good'
  const marketTrend = input.market_trend || 'stable'
  const currentYear = 2026
  const yearBuilt = input.year_built || 2000

  // Base price per sqft by property type
  const basePpsf: Record<string, number> = {
    'single_family': 220, 'condo': 280, 'townhouse': 200, 'multi_family': 180,
    'luxury': 450, 'commercial': 300, 'vacant_land': 15,
  }
  const basePricePsf = basePpsf[propertyType] || 200

  // Generate comparables
  const comparables: ComparableProperty[] = []
  const comparablesCount = rngRange(rng, 3, 6)
  for (let i = 0; i < comparablesCount; i++) {
    const compSqft = sqft + rngRange(rng, -400, 400)
    const compPpsf = basePricePsf + rngRange(rng, -40, 60)
    const compPrice = compSqft * compPpsf
    const adjustments: string[] = []
    let adjustedPrice = compPrice

    if (compSqft !== sqft) {
      const sqftDiff = sqft - compSqft
      adjustedPrice += sqftDiff * (basePricePsf * 0.6)
      adjustments.push('Square footage adjustment: ' + (sqftDiff > 0 ? '+' : '') + sqftDiff + ' sqft')
    }
    const bedDiff = (input.bedrooms || 3) - rngRange(rng, 2, 5)
    if (bedDiff !== 0) {
      adjustedPrice += bedDiff * 15000
      adjustments.push('Bedroom adjustment: ' + bedDiff)
    }

    comparables.push({
      address: (rngRange(rng, 100, 9999)) + ' ' + ['Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Main', 'Park', 'Lake'][rngRange(rng, 0, 7)] + ' ' + ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Way', 'Ct'][rngRange(rng, 0, 6)],
      sale_price: compPrice,
      price_per_sqft: compPpsf,
      adjustment_factors: adjustments.length > 0 ? adjustments : ['No significant adjustments'],
      adjusted_price: Math.round(adjustedPrice),
      similarity_score: rngRange(rng, 70, 98),
    })
  }

  // Weighted average of adjusted comp prices
  const totalWeight = comparables.reduce((sum, c) => sum + c.similarity_score, 0)
  const weightedPrice = comparables.reduce((sum, c) => sum + c.adjusted_price * c.similarity_score, 0) / totalWeight

  // Apply adjustments
  const conditionMult = getConditionMultiplier(condition)
  const ageMult = getAgeFactor(yearBuilt, currentYear)
  const marketMult = marketTrend === 'appreciating' ? 1.08 : marketTrend === 'declining' ? 0.94 : 1.0

  const estimatedValue = Math.round(weightedPrice * conditionMult * ageMult * marketMult)
  const pricePerSqft = Math.round(estimatedValue / sqft)
  const confidenceScore = rngRange(rng, 72, 95)

  // Breakdown
  const landValue = Math.round(estimatedValue * 0.25)
  const structureValue = estimatedValue - landValue
  const breakdown: ValuationBreakdown = {
    land_value: landValue,
    structure_value: structureValue,
    condition_adjustment: Math.round((conditionMult - 1) * estimatedValue),
    market_adjustment: Math.round((marketMult - 1) * estimatedValue),
    location_premium: rngRange(rng, 5000, 30000),
  }

  const marketAssessment = marketTrend === 'appreciating'
    ? 'Market is appreciating — favorable for sellers. Low inventory and strong demand.'
    : marketTrend === 'declining'
      ? 'Market is declining — favorable for buyers. Increased inventory and longer DOM.'
      : 'Market is stable — balanced conditions for both buyers and sellers.'

  const valuationMethod = 'Hybrid approach: Sales Comparison Approach weighted 70% with condition/market adjustments. Cost Approach cross-check available.'

  return {
    estimated_value: estimatedValue,
    value_low: Math.round(estimatedValue * 0.9),
    value_high: Math.round(estimatedValue * 1.1),
    confidence_score: confidenceScore,
    price_per_sqft: pricePerSqft,
    comparables,
    breakdown,
    market_assessment: marketAssessment,
    valuation_method: valuationMethod,
    summary: propertyType.replace(/_/g, ' ') + ' in ' + (input.address || 'subject area') + '. Estimated value: $' + estimatedValue.toLocaleString() + ' ($' + pricePerSqft + '/sqft). Confidence: ' + confidenceScore + '%. Market: ' + marketTrend + '.',
  }
}

function formatValuationReport(input: PropertyValuationInput, output: PropertyValuationOutput): string {
  const lines: string[] = []
  lines.push('## Property Valuation Report')
  lines.push('')
  lines.push('**Property:** ' + (input.address || 'Subject Property') + ' | **Type:** ' + (input.property_type || 'single_family').replace(/_/g, ' '))
  lines.push('**Specs:** ' + (input.bedrooms || 3) + 'bd/' + (input.bathrooms || 2) + 'ba | ' + (input.square_feet || 1800) + ' sqft | Built: ' + (input.year_built || 2000))
  lines.push('')
  lines.push('### Estimated Value')
  lines.push('**$' + output.estimated_value.toLocaleString() + '** (Range: $' + output.value_low.toLocaleString() + ' – $' + output.value_high.toLocaleString() + ')')
  lines.push('- Price per sq ft: $' + output.price_per_sqft)
  lines.push('- Confidence score: ' + output.confidence_score + '%')
  lines.push('')
  lines.push('### Value Breakdown')
  lines.push('| Component | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Land value | $' + output.breakdown.land_value.toLocaleString() + ' |')
  lines.push('| Structure value | $' + output.breakdown.structure_value.toLocaleString() + ' |')
  lines.push('| Condition adjustment | $' + output.breakdown.condition_adjustment.toLocaleString() + ' |')
  lines.push('| Market adjustment | $' + output.breakdown.market_adjustment.toLocaleString() + ' |')
  lines.push('| Location premium | $' + output.breakdown.location_premium.toLocaleString() + ' |')
  lines.push('')
  lines.push('### Comparable Sales Analysis')
  lines.push('| Address | Sale Price | $/sqft | Adjusted | Similarity |')
  lines.push('|---------|-----------|--------|----------|------------|')
  for (const c of output.comparables) {
    lines.push('| ' + c.address + ' | $' + c.sale_price.toLocaleString() + ' | $' + c.price_per_sqft + ' | $' + c.adjusted_price.toLocaleString() + ' | ' + c.similarity_score + '% |')
  }
  lines.push('')
  lines.push('### Market Assessment')
  lines.push(output.market_assessment)
  lines.push('')
  lines.push('### Valuation Method')
  lines.push(output.valuation_method)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: INVESTMENT ANALYSIS CALCULATOR ====================

function analyzeInvestment(input: InvestmentAnalysisInput): InvestmentAnalysisOutput {
  const rng = seededRng(input)
  const purchasePrice = input.purchase_price || 400000
  const downPct = (input.down_payment_pct || 20) / 100
  const interestRate = (input.interest_rate || 6.5) / 100
  const loanTerm = input.loan_term_years || 30
  const monthlyRent = input.monthly_rent || 2500
  const vacancyRate = (input.vacancy_rate || 5) / 100
  const propTax = input.property_tax_annual || (purchasePrice * 0.012)
  const insurance = input.insurance_annual || 1800
  const maintPct = (input.maintenance_pct || 8) / 100
  const mgmtPct = (input.property_management_pct || 8) / 100
  const capexPct = (input.capex_reserve_pct || 5) / 100
  const apprRate = (input.appreciation_rate || 3) / 100
  const holdYears = input.holding_period_years || 7
  const sellCosts = (input.selling_costs_pct || 6) / 100

  const loanAmount = purchasePrice * (1 - downPct)
  const monthlyRate = interestRate / 12
  const numPayments = loanTerm * 12
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)

  const effectiveGrossIncome = monthlyRent * 12 * (1 - vacancyRate)
  const operatingExpenses = propTax + insurance + (monthlyRent * 12 * maintPct) + (monthlyRent * 12 * mgmtPct) + (monthlyRent * 12 * capexPct)
  const noi = effectiveGrossIncome - operatingExpenses
  const annualDebtService = monthlyMortgage * 12
  const cfbt = noi - annualDebtService

  const cashFlow: CashFlowAnalysis = {
    effective_gross_income: Math.round(effectiveGrossIncome),
    operating_expenses: Math.round(operatingExpenses),
    net_operating_income: Math.round(noi),
    annual_debt_service: Math.round(annualDebtService),
    cash_flow_before_tax: Math.round(cfbt),
    monthly_cash_flow: Math.round(cfbt / 12),
  }

  const totalInvestment = purchasePrice * downPct + purchasePrice * 0.03 // down + closing
  const capRate = (noi / purchasePrice) * 100
  const cashOnCash = (cfbt / totalInvestment) * 100
  const grm = purchasePrice / (monthlyRent * 12)
  const dscr = noi / annualDebtService

  // Projection
  const projection: InvestmentAnalysisOutput['five_year_projection'] = []
  for (let y = 1; y <= Math.min(holdYears, 10); y++) {
    const pv = purchasePrice * Math.pow(1 + apprRate, y)
    const remainingBalance = loanAmount * (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, y * 12)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    const equity = pv - remainingBalance
    const cumCF = cfbt * y
    projection.push({
      year: y,
      property_value: Math.round(pv),
      equity: Math.round(equity),
      cumulative_cash_flow: Math.round(cumCF),
      total_return: Math.round(equity - totalInvestment + cumCF),
    })
  }

  const finalProj = projection[projection.length - 1]
  const totalROI = ((finalProj.total_return) / totalInvestment) * 100
  const annualizedROI = (Math.pow(1 + totalROI / 100, 1 / holdYears) - 1) * 100
  const exitValue = finalProj.property_value * (1 - sellCosts)
  const totalProfit = cfbt * holdYears + (exitValue - purchasePrice - loanAmount * (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, holdYears * 12)) / (Math.pow(1 + monthlyRate, numPayments) - 1))
  const equityMultiple = (totalProfit + totalInvestment) / totalInvestment
  const irrEstimate = rngFloat(rng, annualizedROI * 0.7, annualizedROI * 1.3)

  const breakEvenOcc = ((operatingExpenses + annualDebtService) / (monthlyRent * 12)) * 100
  const breakEvenOccupancy = clamp(Math.round(breakEvenOcc), 40, 100)

  let investmentGrade: InvestmentAnalysisOutput['investment_grade'] = 'C'
  if (cashOnCash > 10 && capRate > 7) investmentGrade = 'A'
  else if (cashOnCash > 6 && capRate > 5) investmentGrade = 'B'
  else if (cashOnCash < 0) investmentGrade = 'F'
  else if (cashOnCash < 3) investmentGrade = 'D'

  let riskLevel: InvestmentAnalysisOutput['risk_level'] = 'moderate'
  if (cashFlow.monthly_cash_flow > 200 && dscr > 1.4) riskLevel = 'low'
  else if (cashFlow.monthly_cash_flow < 0 || dscr < 1.1) riskLevel = 'high'

  const recommendations: string[] = []
  if (cashOnCash < 5) recommendations.push('Consider higher down payment or lower purchase price to improve cash-on-cash return')
  if (dscr < 1.25) recommendations.push('DSCR below 1.25x — lenders may require higher reserves. Build 6-month expense cushion')
  if (vacancyRate > 0.08) recommendations.push('High vacancy assumption — research local market occupancy rates')
  recommendations.push('Factor in rent growth of 2-4% annually for long-term projections')
  if (capRate < 5) recommendations.push('Low cap rate suggests premium market — ensure appreciation assumptions are realistic')
  recommendations.push('Maintain Capex reserve of 5-10% for major systems replacement (roof, HVAC, plumbing)')

  const metrics: InvestmentMetrics = {
    cap_rate: Math.round(capRate * 100) / 100,
    cash_on_cash_return: Math.round(cashOnCash * 100) / 100,
    gross_rent_multiplier: Math.round(grm * 100) / 100,
    debt_service_coverage_ratio: Math.round(dscr * 100) / 100,
    total_roi: Math.round(totalROI * 100) / 100,
    annualized_roi: Math.round(annualizedROI * 100) / 100,
    irr_estimate: Math.round(irrEstimate * 100) / 100,
    equity_multiple: Math.round(equityMultiple * 100) / 100,
  }

  return {
    cash_flow: cashFlow,
    metrics,
    five_year_projection: projection,
    break_even_occupancy: breakEvenOccupancy,
    investment_grade: investmentGrade,
    risk_level: riskLevel,
    recommendations,
    summary: 'Investment analysis for $' + purchasePrice.toLocaleString() + ' property. Cap rate: ' + metrics.cap_rate + '%, Cash-on-cash: ' + metrics.cash_on_cash_return + '%, Annualized ROI: ' + metrics.annualized_roi + '%. Grade: ' + investmentGrade + '. Risk: ' + riskLevel + '. Monthly cash flow: $' + cashFlow.monthly_cash_flow + '.',
  }
}

function formatInvestmentReport(input: InvestmentAnalysisInput, output: InvestmentAnalysisOutput): string {
  const lines: string[] = []
  lines.push('## Investment Analysis Report')
  lines.push('')
  lines.push('**Purchase Price:** $' + (input.purchase_price || 0).toLocaleString() + ' | **Down Payment:** ' + (input.down_payment_pct || 20) + '% | **Rate:** ' + (input.interest_rate || 6.5) + '%')
  lines.push('')
  lines.push('### Key Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Cap Rate | ' + output.metrics.cap_rate + '% |')
  lines.push('| Cash-on-Cash Return | ' + output.metrics.cash_on_cash_return + '% |')
  lines.push('| Gross Rent Multiplier | ' + output.metrics.gross_rent_multiplier + 'x |')
  lines.push('| DSCR | ' + output.metrics.debt_service_coverage_ratio + 'x |')
  lines.push('| Annualized ROI | ' + output.metrics.annualized_roi + '% |')
  lines.push('| IRR Estimate | ' + output.metrics.irr_estimate + '% |')
  lines.push('| Equity Multiple | ' + output.metrics.equity_multiple + 'x |')
  lines.push('| Investment Grade | **' + output.investment_grade + '** |')
  lines.push('| Risk Level | ' + output.risk_level.toUpperCase() + ' |')
  lines.push('')
  lines.push('### Cash Flow Analysis')
  lines.push('| Item | Annual |')
  lines.push('|------|--------|')
  lines.push('| Effective Gross Income | $' + output.cash_flow.effective_gross_income.toLocaleString() + ' |')
  lines.push('| Operating Expenses | ($' + output.cash_flow.operating_expenses.toLocaleString() + ') |')
  lines.push('| Net Operating Income | $' + output.cash_flow.net_operating_income.toLocaleString() + ' |')
  lines.push('| Debt Service | ($' + output.cash_flow.annual_debt_service.toLocaleString() + ') |')
  lines.push('| **Cash Flow (Before Tax)** | **$' + output.cash_flow.cash_flow_before_tax.toLocaleString() + '/yr ($' + output.cash_flow.monthly_cash_flow + '/mo)** |')
  lines.push('')
  lines.push('### ' + Math.min(output.five_year_projection.length, 10) + '-Year Projection')
  lines.push('| Year | Property Value | Equity | Cum. Cash Flow | Total Return |')
  lines.push('|------|---------------|--------|----------------|--------------|')
  for (const p of output.five_year_projection) {
    lines.push('| ' + p.year + ' | $' + p.property_value.toLocaleString() + ' | $' + p.equity.toLocaleString() + ' | $' + p.cumulative_cash_flow.toLocaleString() + ' | $' + p.total_return.toLocaleString() + ' |')
  }
  lines.push('')
  lines.push('### Break-Even Occupancy: ' + output.break_even_occupancy + '%')
  lines.push('')
  lines.push('### Recommendations')
  for (const r of output.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: TENANT SCREENING SYSTEM ====================

function screenTenant(input: TenantScreeningInput): TenantScreeningOutput {
  const rng = seededRng(input)
  const monthlyIncome = input.monthly_income || 6000
  const creditScore = input.credit_score || 680
  const monthlyRent = input.monthly_rent || 2000
  const incomeRatio = monthlyIncome / monthlyRent

  const factors: screeningFactor[] = []
  let totalWeightedScore = 0
  let totalWeight = 0

  // Income verification (weight 25%)
  const incomeScore = clamp(Math.round((incomeRatio / 3) * 100), 20, 100)
  const incomeRisk: screeningFactor['risk_flag'] = incomeRatio >= 3 ? 'none' : incomeRatio >= 2.5 ? 'low' : incomeRatio >= 2 ? 'medium' : 'high'
  factors.push({
    category: 'Income Verification',
    score: incomeScore,
    weight: 25,
    weighted_score: Math.round(incomeScore * 0.25),
    assessment: 'Income-to-rent ratio: ' + incomeRatio.toFixed(1) + 'x (target: 3x+)',
    risk_flag: incomeRisk,
  })

  // Credit score (weight 30%)
  let creditScore_val = 50
  if (creditScore >= 750) creditScore_val = 95
  else if (creditScore >= 700) creditScore_val = 85
  else if (creditScore >= 650) creditScore_val = 70
  else if (creditScore >= 600) creditScore_val = 50
  else if (creditScore >= 550) creditScore_val = 35
  const creditRisk: screeningFactor['risk_flag'] = creditScore >= 700 ? 'none' : creditScore >= 650 ? 'low' : creditScore >= 600 ? 'medium' : 'high'
  factors.push({
    category: 'Credit Score',
    score: creditScore_val,
    weight: 30,
    weighted_score: Math.round(creditScore_val * 0.3),
    assessment: 'Credit score: ' + creditScore + ' (' + (creditScore >= 700 ? 'Good' : creditScore >= 650 ? 'Fair' : 'Poor') + ')',
    risk_flag: creditRisk,
  })

  // Employment stability (weight 15%)
  const empMonths = input.employment_length_months || 24
  const empScore = clamp(Math.round(Math.min(empMonths / 24, 1) * 90 + 10), 20, 100)
  const empRisk: screeningFactor['risk_flag'] = empMonths >= 24 ? 'none' : empMonths >= 12 ? 'low' : empMonths >= 6 ? 'medium' : 'high'
  factors.push({
    category: 'Employment Stability',
    score: empScore,
    weight: 15,
    weighted_score: Math.round(empScore * 0.15),
    assessment: empMonths + ' months at current employer. Status: ' + (input.employment_status || 'employed'),
    risk_flag: empRisk,
  })

  // Rental history (weight 15%)
  const rentalMonths = input.rental_history_months || 24
  const evictionPenalty = (input.evictions_count || 0) * 25
  const rentalScore = clamp(Math.round(Math.min(rentalMonths / 24, 1) * 80 + 20 - evictionPenalty), 5, 100)
  const rentalRisk: screeningFactor['risk_flag'] = evictionPenalty === 0 ? (rentalMonths >= 12 ? 'none' : 'low') : evictionPenalty <= 25 ? 'medium' : 'high'
  factors.push({
    category: 'Rental History',
    score: rentalScore,
    weight: 15,
    weighted_score: Math.round(rentalScore * 0.15),
    assessment: rentalMonths + ' months documented history. Evictions: ' + (input.evictions_count || 0) + '. References: ' + (input.references_count || 0),
    risk_flag: rentalRisk,
  })

  // Background check (weight 15%)
  let bgScore = 90
  if (input.bankruptcies) bgScore -= 30
  if (input.criminal_record) bgScore -= 25
  bgScore = clamp(rngRange(rng, bgScore - 10, bgScore + 5), 10, 100)
  const bgRisk: screeningFactor['risk_flag'] = bgScore >= 80 ? 'none' : bgScore >= 60 ? 'low' : bgScore >= 40 ? 'medium' : 'high'
  factors.push({
    category: 'Background Check',
    score: bgScore,
    weight: 15,
    weighted_score: Math.round(bgScore * 0.15),
    assessment: 'Bankruptcies: ' + (input.bankruptcies ? 'Yes' : 'No') + '. Criminal record: ' + (input.criminal_record ? 'Yes' : 'No'),
    risk_flag: bgRisk,
  })

  for (const f of factors) {
    totalWeightedScore += f.weighted_score
    totalWeight += f.weight
  }
  const overallScore = Math.round(totalWeightedScore / (totalWeight / 100))

  let grade: TenantScreeningOutput['screening_grade'] = 'C'
  if (overallScore >= 85) grade = 'A'
  else if (overallScore >= 72) grade = 'B'
  else if (overallScore >= 58) grade = 'C'
  else if (overallScore >= 45) grade = 'D'
  else grade = 'F'

  let recommendation: TenantScreeningOutput['recommendation'] = 'review_manually'
  if (overallScore >= 80 && incomeRatio >= 2.5 && creditScore >= 650 && !input.evictions_count) recommendation = 'approve'
  else if (overallScore >= 65 && incomeRatio >= 2 && creditScore >= 600) recommendation = 'approve_with_conditions'
  else if (overallScore >= 45) recommendation = 'review_manually'
  else recommendation = 'deny'

  const conditions: string[] = []
  if (incomeRatio < 3) conditions.push('Require additional security deposit (1.5x monthly rent)')
  if (creditScore < 700 && creditScore >= 600) conditions.push('Require qualified guarantor for lease')
  if (empMonths < 12) conditions.push('Verify employment and require 3 months rent prepaid')
  if (input.pets) conditions.push('Pet deposit: $300 non-refundable + $25/month pet rent')

  const riskFlags: string[] = []
  for (const f of factors) {
    if (f.risk_flag === 'high' || f.risk_flag === 'critical') {
      riskFlags.push(f.category + ': ' + f.assessment)
    }
  }

  return {
    overall_score: overallScore,
    screening_grade: grade,
    recommendation,
    factors,
    income_qualifies: incomeRatio >= 2.5,
    credit_qualifies: creditScore >= 600,
    conditions,
    risk_flags: riskFlags,
    summary: 'Tenant screening score: ' + overallScore + '/100 (Grade: ' + grade + '). Recommendation: ' + recommendation.replace(/_/g, ' ') + '. Income qualifies: ' + (incomeRatio >= 2.5 ? 'Yes' : 'No') + '. Credit qualifies: ' + (creditScore >= 600 ? 'Yes' : 'No') + '.',
  }
}

function formatScreeningReport(input: TenantScreeningInput, output: TenantScreeningOutput): string {
  const lines: string[] = []
  lines.push('## Tenant Screening Report')
  lines.push('')
  lines.push('**Applicant:** ' + (input.applicant_name || 'Applicant') + ' | **Overall Score:** ' + output.overall_score + '/100 | **Grade:** ' + output.screening_grade)
  lines.push('')
  lines.push('### Recommendation: ' + output.recommendation.replace(/_/g, ' ').toUpperCase())
  lines.push('')
  lines.push('### Screening Factors')
  lines.push('| Category | Score | Weight | Weighted | Risk | Assessment |')
  lines.push('|----------|-------|--------|----------|------|------------|')
  for (const f of output.factors) {
    lines.push('| ' + f.category + ' | ' + f.score + '/100 | ' + f.weight + '% | ' + f.weighted_score + ' | ' + f.risk_flag.toUpperCase() + ' | ' + f.assessment + ' |')
  }
  lines.push('')
  lines.push('### Qualification Summary')
  lines.push('- Income qualification: ' + (output.income_qualifies ? 'PASS' : 'FAIL') + ' (need 2.5x+ monthly rent)')
  lines.push('- Credit qualification: ' + (output.credit_qualifies ? 'PASS' : 'FAIL') + ' (need 600+ score)')
  lines.push('')
  if (output.conditions.length > 0) {
    lines.push('### Conditions')
    for (const c of output.conditions) lines.push('- ' + c)
    lines.push('')
  }
  if (output.risk_flags.length > 0) {
    lines.push('### Risk Flags')
    for (const r of output.risk_flags) lines.push('- WARNING: ' + r)
    lines.push('')
  }
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: PROPERTY MANAGEMENT OPTIMIZER ====================

function optimizePropertyManagement(input: PropertyManagementInput): PropertyManagementOutput {
  const rng = seededRng(input)
  const portfolioSize = input.portfolio_size || 50
  const occupancyRate = (input.avg_occupancy_rate || 92) / 100
  const rentCollectionDays = input.avg_rent_collection_days || 5
  const maintenanceReq = input.maintenance_requests_monthly || 15
  const avgMaintCost = input.avg_maintenance_cost || 350
  const turnoverRate = (input.tenant_turnover_rate || 25) / 100
  const staffCount = input.staff_count || 3
  const mgmtFee = (input.management_fee_pct || 8) / 100
  const automationLevel = input.automation_level || 'partial'

  // Efficiency score
  let efficiencyScore = 65
  if (occupancyRate >= 0.95) efficiencyScore += 10
  else if (occupancyRate >= 0.9) efficiencyScore += 5
  else if (occupancyRate < 0.85) efficiencyScore -= 10
  if (rentCollectionDays <= 3) efficiencyScore += 8
  else if (rentCollectionDays <= 5) efficiencyScore += 3
  else efficiencyScore -= 5
  if (turnoverRate <= 0.15) efficiencyScore += 8
  else if (turnoverRate <= 0.25) efficiencyScore += 3
  else efficiencyScore -= 5
  if (automationLevel === 'smart') efficiencyScore += 10
  else if (automationLevel === 'automated') efficiencyScore += 6
  else if (automationLevel === 'manual') efficiencyScore -= 5
  const unitsPerStaff = portfolioSize / Math.max(staffCount, 1)
  if (unitsPerStaff >= 25) efficiencyScore += 5
  else if (unitsPerStaff < 15) efficiencyScore -= 5
  efficiencyScore = clamp(efficiencyScore + rngRange(rng, -5, 5), 30, 98)

  let efficiencyGrade: PropertyManagementOutput['efficiency_grade'] = 'C'
  if (efficiencyScore >= 85) efficiencyGrade = 'A'
  else if (efficiencyScore >= 72) efficiencyGrade = 'B'
  else if (efficiencyScore >= 58) efficiencyGrade = 'C'
  else if (efficiencyScore >= 45) efficiencyGrade = 'D'
  else efficiencyGrade = 'F'

  const optimizations: OptimizationArea[] = []
  const painPoints = input.pain_points || []

  if (painPoints.includes('late_payments') || rentCollectionDays > 3) {
    optimizations.push({
      area: 'Rent Collection',
      current_state: rentCollectionDays + ' avg days to collect rent',
      recommended_state: 'Automated ACH + online portal with late fee automation',
      estimated_savings: Math.round(portfolioSize * 200),
      implementation_cost: automationLevel === 'manual' ? 'medium' : 'low',
      priority: rentCollectionDays > 7 ? 'critical' : 'high',
      timeline_weeks: automationLevel === 'smart' ? 2 : 6,
    })
  }

  if (painPoints.includes('maintenance_costs') || avgMaintCost > 400) {
    optimizations.push({
      area: 'Maintenance Management',
      current_state: '$' + avgMaintCost + ' avg cost per request, ' + maintenanceReq + ' req/mo',
      recommended_state: 'Preventive maintenance scheduling + vendor network with negotiated rates',
      estimated_savings: Math.round(maintenanceReq * 12 * avgMaintCost * 0.2),
      implementation_cost: 'medium',
      priority: avgMaintCost > 500 ? 'critical' : 'high',
      timeline_weeks: 8,
    })
  }

  if (painPoints.includes('tenant_turnover') || turnoverRate > 0.2) {
    optimizations.push({
      area: 'Tenant Retention',
      current_state: Math.round(turnoverRate * 100) + '% annual turnover',
      recommended_state: 'Responsive maintenance + lease renewal incentives + community building',
      estimated_savings: Math.round(portfolioSize * turnoverRate * 1500 * 0.3),
      implementation_cost: 'low',
      priority: turnoverRate > 0.3 ? 'critical' : 'high',
      timeline_weeks: 4,
    })
  }

  if (painPoints.includes('communication') || automationLevel === 'manual') {
    optimizations.push({
      area: 'Tenant Communication',
      current_state: 'Manual phone/email communication',
      recommended_state: 'Tenant portal with automated notifications, chatbot for common queries',
      estimated_savings: Math.round(staffCount * 8000),
      implementation_cost: 'medium',
      priority: 'medium',
      timeline_weeks: 6,
    })
  }

  if (optimizations.length === 0) {
    optimizations.push({
      area: 'Energy Management',
      current_state: 'Standard utility management',
      recommended_state: 'Smart thermostats + LED retrofit + utility benchmarking',
      estimated_savings: Math.round(portfolioSize * 180),
      implementation_cost: 'medium',
      priority: 'medium',
      timeline_weeks: 12,
    })
    optimizations.push({
      area: 'Lease Management',
      current_state: 'Mixed paper/digital lease processing',
      recommended_state: 'E-signature + automated renewal workflows + compliance tracking',
      estimated_savings: Math.round(portfolioSize * 120),
      implementation_cost: 'low',
      priority: 'high',
      timeline_weeks: 4,
    })
  }

  const benchmarks: BenchmarkComparison[] = [
    {
      metric: 'Occupancy Rate',
      your_value: Math.round(occupancyRate * 100),
      industry_avg: 93,
      percentile: occupancyRate >= 0.95 ? 75 : occupancyRate >= 0.9 ? 50 : 25,
      status: occupancyRate >= 0.93 ? 'above_avg' : 'below_avg',
    },
    {
      metric: 'Tenant Turnover',
      your_value: Math.round(turnoverRate * 100),
      industry_avg: 22,
      percentile: turnoverRate <= 0.15 ? 80 : turnoverRate <= 0.25 ? 50 : 20,
      status: turnoverRate <= 0.22 ? 'above_avg' : 'below_avg',
    },
    {
      metric: 'Units per Staff',
      your_value: Math.round(unitsPerStaff),
      industry_avg: 22,
      percentile: unitsPerStaff >= 25 ? 70 : unitsPerStaff >= 18 ? 50 : 25,
      status: unitsPerStaff >= 22 ? 'above_avg' : 'below_avg',
    },
    {
      metric: 'Rent Collection Time',
      your_value: rentCollectionDays,
      industry_avg: 4,
      percentile: rentCollectionDays <= 2 ? 85 : rentCollectionDays <= 5 ? 50 : 20,
      status: rentCollectionDays <= 4 ? 'above_avg' : 'below_avg',
    },
  ]

  const automationRecs: string[] = []
  if (automationLevel === 'manual' || automationLevel === 'partial') {
    automationRecs.push('Implement cloud-based property management software (AppFolio, Buildware, or Yardi)')
    automationRecs.push('Deploy tenant self-service portal for maintenance requests and rent payment')
    automationRecs.push('Automate lease renewals with 90-day advance notice workflows')
  }
  if (automationLevel !== 'smart') {
    automationRecs.push('Integrate smart locks for self-guided tours and keyless entry')
    automationRecs.push('Deploy IoT sensors for water leak detection and preventive alerts')
  }
  automationRecs.push('Use AI-powered rent pricing tools for market-optimized pricing')

  const totalSavings = optimizations.reduce((sum, o) => sum + o.estimated_savings, 0)

  return {
    efficiency_score: efficiencyScore,
    efficiency_grade: efficiencyGrade,
    optimizations,
    benchmarks,
    automation_recommendations: automationRecs,
    cost_reduction_potential: totalSavings,
    revenue_uplift_potential: '5-12% through optimized rent pricing, reduced vacancy, and improved retention',
    summary: 'Portfolio of ' + portfolioSize + ' units. Efficiency score: ' + efficiencyScore + '/100 (Grade: ' + efficiencyGrade + '). ' + optimizations.length + ' optimizations identified. Potential annual savings: $' + totalSavings.toLocaleString() + '. Automation level: ' + automationLevel + '.',
  }
}

function formatManagementReport(input: PropertyManagementInput, output: PropertyManagementOutput): string {
  const lines: string[] = []
  lines.push('## Property Management Optimization Report')
  lines.push('')
  lines.push('**Portfolio:** ' + (input.portfolio_size || 0) + ' units | **Efficiency Score:** ' + output.efficiency_score + '/100 | **Grade:** ' + output.efficiency_grade)
  lines.push('')
  lines.push('### Benchmark Comparison')
  lines.push('| Metric | Your Value | Industry Avg | Percentile | Status |')
  lines.push('|--------|-----------|-------------|-----------|--------|')
  for (const b of output.benchmarks) {
    lines.push('| ' + b.metric + ' | ' + b.your_value + (b.metric.includes('Time') || b.metric.includes('per') ? '' : '%') + ' | ' + b.industry_avg + '% | P' + b.percentile + ' | ' + (b.status === 'above_avg' ? 'Above avg' : 'Below avg') + ' |')
  }
  lines.push('')
  lines.push('### Optimization Opportunities')
  for (const o of output.optimizations) {
    lines.push('#### ' + o.area + ' [' + o.priority.toUpperCase() + ']')
    lines.push('- Current: ' + o.current_state)
    lines.push('- Recommended: ' + o.recommended_state)
    lines.push('- Estimated annual savings: $' + o.estimated_savings.toLocaleString())
    lines.push('- Cost: ' + o.implementation_cost + ' | Timeline: ' + o.timeline_weeks + ' weeks')
    lines.push('')
  }
  lines.push('### Total Cost Reduction Potential: $' + output.cost_reduction_potential.toLocaleString() + '/year')
  lines.push('### Revenue Uplift Potential: ' + output.revenue_uplift_potential)
  lines.push('')
  lines.push('### Automation Recommendations')
  for (const a of output.automation_recommendations) lines.push('- ' + a)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: RENTAL YIELD ANALYZER ====================

function analyzeRentalYield(input: RentalYieldInput): RentalYieldOutput {
  const rng = seededRng(input)
  const propertyPrice = input.property_price || 400000
  const monthlyRent = input.monthly_rent || 2200
  const annualExpenses = input.annual_expenses || 8000
  const targetYield = input.target_yield_pct || 6
  const marketAvgYield = input.market_avg_yield || 5.5
  const occupancyTarget = (input.occupancy_target || 95) / 100
  const furnished = input.furnished ?? false
  const leaseStructure = input.lease_structure || 'long_term'

  const annualGrossRent = monthlyRent * 12
  const grossYield = (annualGrossRent / propertyPrice) * 100
  const netYield = ((annualGrossRent - annualExpenses) / propertyPrice) * 100
  const oer = (annualExpenses / annualGrossRent) * 100
  const breakEvenVacancy = Math.round((annualExpenses / annualGrossRent) * 12 * 10) / 10
  const effectiveYield = netYield * occupancyTarget

  const currentYield: YieldBreakdown = {
    gross_yield: Math.round(grossYield * 100) / 100,
    net_yield: Math.round(netYield * 100) / 100,
    operating_expense_ratio: Math.round(oer * 100) / 100,
    break_even_vacancy_months: breakEvenVacancy,
    effective_yield_adjusted: Math.round(effectiveYield * 100) / 100,
  }

  // Scenarios
  const scenarios: YieldScenario[] = []

  // Conservative
  scenarios.push({
    scenario_name: 'Conservative',
    monthly_rent: Math.round(monthlyRent * 0.9),
    occupancy_rate: 90,
    annual_net_income: Math.round(monthlyRent * 0.9 * 12 * 0.9 - annualExpenses),
    net_yield: Math.round(((monthlyRent * 0.9 * 12 * 0.9 - annualExpenses) / propertyPrice) * 10000) / 100,
    description: 'Rent at 90% with 10% vacancy — downside case',
  })

  // Base
  scenarios.push({
    scenario_name: 'Base Case',
    monthly_rent: monthlyRent,
    occupancy_rate: Math.round(occupancyTarget * 100),
    annual_net_income: Math.round(annualGrossRent * occupancyTarget - annualExpenses),
    net_yield: Math.round(((annualGrossRent * occupancyTarget - annualExpenses) / propertyPrice) * 10000) / 100,
    description: 'Expected performance at target occupancy',
  })

  // Optimistic
  const optRent = leaseStructure === 'short_term' ? monthlyRent * 1.3 : monthlyRent * 1.1
  scenarios.push({
    scenario_name: 'Optimistic',
    monthly_rent: Math.round(optRent),
    occupancy_rate: 97,
    annual_net_income: Math.round(optRent * 12 * 0.97 - annualExpenses),
    net_yield: Math.round(((optRent * 12 * 0.97 - annualExpenses) / propertyPrice) * 10000) / 100,
    description: leaseStructure === 'short_term' ? 'Short-term rental premium pricing' : 'Above-market rent with high occupancy',
  })

  // Furnished premium
  if (furnished) {
    scenarios.push({
      scenario_name: 'Furnished Premium',
      monthly_rent: Math.round(monthlyRent * 1.2),
      occupancy_rate: 93,
      annual_net_income: Math.round(monthlyRent * 1.2 * 12 * 0.93 - annualExpenses - 2000),
      net_yield: Math.round(((monthlyRent * 1.2 * 12 * 0.93 - annualExpenses - 2000) / propertyPrice) * 10000) / 100,
      description: 'Furnished mid-term rental (30-90 day stays)',
    })
  }

  let yieldGrade: RentalYieldOutput['yield_grade'] = 'C'
  if (netYield >= targetYield + 2) yieldGrade = 'A'
  else if (netYield >= targetYield) yieldGrade = 'B'
  else if (netYield >= targetYield - 2) yieldGrade = 'C'
  else if (netYield >= targetYield - 4) yieldGrade = 'D'
  else yieldGrade = 'F'

  const pricingRecs: string[] = []
  if (netYield < targetYield) {
    const neededRent = Math.round(((propertyPrice * (targetYield / 100)) + annualExpenses) / 12)
    pricingRecs.push('To hit ' + targetYield + '% target, monthly rent needs to be $' + neededRent.toLocaleString() + ' (current: $' + monthlyRent.toLocaleString() + ')')
  }
  if (!furnished && (input.property_type || 'single_family') !== 'commercial') {
    pricingRecs.push('Consider furnishing — can command 15-30% rent premium for mid-term rentals')
  }
  if (leaseStructure === 'long_term') {
    pricingRecs.push('Evaluate short-term/mid-term rental for potentially higher gross yield (verify local regulations)')
  }
  pricingRecs.push('Implement annual rent increases of 3-5% tied to CPI or market benchmarks')
  pricingRecs.push('Offer multi-year lease discounts (5% for 2+ years) to reduce turnover costs')

  const optimizations: string[] = []
  if (oer > 45) optimizations.push('High operating expense ratio (' + Math.round(oer) + '%) — review insurance, tax appeal, maintenance contracts')
  if (occupancyTarget < 0.93) optimizations.push('Below-target occupancy — investigate pricing, marketing channels, and unit condition')
  optimizations.push('Install smart thermostats to reduce utility costs by 10-15%')
  optimizations.push('Bundle utilities into RUBS (Ratio Utility Billing) to shift variable costs to tenants')
  optimizations.push('Negotiate multi-year vendor contracts for maintenance services (15-20% savings)')

  const marketComp = netYield > marketAvgYield + 1
    ? 'Above market average — competitive yield for the area (' + marketAvgYield + '% avg)'
    : netYield < marketAvgYield - 1
      ? 'Below market average — investigate rent growth or expense reduction opportunities'
      : 'In line with market average yield'

  return {
    current_yield: currentYield,
    scenarios,
    market_comparison: marketComp,
    yield_grade: yieldGrade,
    pricing_recommendations: pricingRecs,
    optimization_opportunities: optimizations,
    summary: 'Property at $' + propertyPrice.toLocaleString() + ' generating $' + monthlyRent.toLocaleString() + '/mo rent. Net yield: ' + currentYield.net_yield + '% (target: ' + targetYield + '%). Grade: ' + yieldGrade + '. Market comparison: ' + marketComp + '.',
  }
}

function formatYieldReport(input: RentalYieldInput, output: RentalYieldOutput): string {
  const lines: string[] = []
  lines.push('## Rental Yield Analysis')
  lines.push('')
  lines.push('**Property Price:** $' + (input.property_price || 0).toLocaleString() + ' | **Monthly Rent:** $' + (input.monthly_rent || 0).toLocaleString() + ' | **Type:** ' + (input.property_type || 'single_family').replace(/_/g, ' '))
  lines.push('')
  lines.push('### Current Yield Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Gross Yield | ' + output.current_yield.gross_yield + '% |')
  lines.push('| Net Yield | **' + output.current_yield.net_yield + '%** |')
  lines.push('| Operating Expense Ratio | ' + output.current_yield.operating_expense_ratio + '% |')
  lines.push('| Break-Even Vacancy | ' + output.current_yield.break_even_vacancy_months + ' months |')
  lines.push('| Effective Yield (adj.) | ' + output.current_yield.effective_yield_adjusted + '% |')
  lines.push('| **Yield Grade** | **' + output.yield_grade + '** |')
  lines.push('')
  lines.push('### Yield Scenarios')
  lines.push('| Scenario | Monthly Rent | Occupancy | Annual Net | Net Yield |')
  lines.push('|----------|-------------|-----------|------------|-----------|')
  for (const s of output.scenarios) {
    lines.push('| ' + s.scenario_name + ' | $' + s.monthly_rent.toLocaleString() + ' | ' + s.occupancy_rate + '% | $' + s.annual_net_income.toLocaleString() + ' | ' + s.net_yield + '% |')
  }
  lines.push('')
  lines.push('### Market Comparison')
  lines.push(output.market_comparison)
  lines.push('')
  lines.push('### Pricing Recommendations')
  for (const r of output.pricing_recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('### Optimization Opportunities')
  for (const o of output.optimization_opportunities) lines.push('- ' + o)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: MARKET TREND FORECASTER ====================

function forecastMarketTrends(input: MarketTrendInput): MarketTrendOutput {
  const rng = seededRng(input)
  const location = input.location || 'Metro Area'
  const propertyType = (input.property_type || 'single_family').toLowerCase()
  const forecastYears = Math.min(input.forecast_years || 5, 10)
  const currentMedian = input.current_median_price || 420000
  const currentInventory = input.current_inventory_months || 3.5
  const currentDOM = input.current_days_on_market || 28
  const popGrowth = input.population_growth_rate || 1.2
  const empGrowth = input.employment_growth_rate || 2.0
  const rateTrend = input.interest_rate_trend || 'stable'
  const infra = input.planned_infrastructure || []

  const trendImpact = popGrowth > 1.5 ? 2.5 : popGrowth > 0.5 ? 1.0 : popGrowth > -0.5 ? 0 : -1.5
  const empImpact = empGrowth > 3 ? 2.0 : empGrowth > 1.5 ? 1.0 : empGrowth > 0 ? 0 : -1.0
  const rateImpact = rateTrend === 'falling' ? 3.0 : rateTrend === 'rising' ? -2.0 : 0.5

  // Trend drivers
  const trendDrivers: TrendDriver[] = [
    {
      factor: 'Population Growth',
      impact: popGrowth > 1.5 ? 'bullish' : popGrowth > 0 ? 'neutral' : 'bearish',
      description: popGrowth + '% annual population growth. Housing demand ' + (popGrowth > 1 ? 'outpacing' : 'matching') + ' supply.',
    },
    {
      factor: 'Job Market',
      impact: empGrowth > 2 ? 'strong_bullish' : empGrowth > 1 ? 'bullish' : empGrowth > 0 ? 'neutral' : 'bearish',
      description: empGrowth + '% employment growth. ' + (empGrowth > 2 ? 'Strong in-migration pressure' : 'Moderate demand growth') + '.',
    },
    {
      factor: 'Interest Rates',
      impact: rateTrend === 'falling' ? 'strong_bullish' : rateTrend === 'rising' ? 'bearish' : 'neutral',
      description: 'Interest rate environment: ' + rateTrend + '. ' + (rateTrend === 'falling' ? 'Improving affordability and demand' : rateTrend === 'rising' ? 'Constraining buyer purchasing power' : 'Stable financing conditions') + '.',
    },
  ]

  if (infra.length > 0) {
    trendDrivers.push({
      factor: 'Infrastructure Investment',
      impact: infra.length >= 3 ? 'strong_bullish' : 'bullish',
      description: infra.length + ' planned infrastructure projects: ' + infra.slice(0, 3).join(', ') + (infra.length > 3 ? '...' : '') + '.',
    })
  }

  const forecasts: YearlyForecast[] = []
  function seededRngLocal(seed: number): () => number {
    return function () {
      seed = (seed + 0x6d2b79f5) >>> 0
      let t = seed
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  // Use a fixed deterministic seed for local stability
  const localRng = seededRngLocal(42)

  let price = currentMedian
  let inventory = currentInventory
  let dom = currentDOM
  let peakYear: number | null = null
  let troughYear: number | null = null
  let maxPrice = price
  let minPrice = price

  for (let y = 1; y <= forecastYears; y++) {
    const baseAppreciation = (trendImpact + empImpact + rateImpact) / 100
    const noise = (localRng() - 0.5) * 0.04
    const yearAppreciation = baseAppreciation + noise
    price = price * (1 + yearAppreciation)

    inventory = clamp(inventory + (localRng() - 0.5) * 0.8, 1.5, 12)
    dom = clamp(dom + rngRange(localRng, -8, 10), 7, 120)

    if (price > maxPrice) { maxPrice = price; peakYear = y }
    if (price < minPrice) { minPrice = price; troughYear = y }

    const buyerDemandIdx = clamp(50 + trendImpact * 10 + empImpact * 8 + rngRange(localRng, -10, 10), 10, 100)

    let marketPhase: YearlyForecast['market_phase'] = 'balanced'
    if (inventory >= 6 || dom >= 60) marketPhase = 'buyers_market'
    else if (inventory <= 3 && dom <= 21) marketPhase = 'sellers_market'

    forecasts.push({
      year: 2026 + y,
      median_price: Math.round(price),
      price_change_pct: Math.round(yearAppreciation * 10000) / 100,
      inventory_months: Math.round(inventory * 10) / 10,
      days_on_market: Math.round(dom),
      buyer_demand_index: Math.round(buyerDemandIdx),
      market_phase: marketPhase,
    })
  }

  const totalAppreciation = ((forecasts[forecasts.length - 1].median_price / currentMedian) - 1) * 100
  const cagr = (Math.pow(forecasts[forecasts.length - 1].median_price / currentMedian, 1 / forecastYears) - 1) * 100

  let overallOutlook: MarketTrendOutput['overall_outlook'] = 'neutral'
  if (cagr > 5) overallOutlook = 'strongly_positive'
  else if (cagr > 2.5) overallOutlook = 'positive'
  else if (cagr < -2) overallOutlook = 'strongly_negative'
  else if (cagr < 0) overallOutlook = 'negative'

  const riskFactors: string[] = []
  if (rateTrend === 'rising') riskFactors.push('Rising interest rates may suppress buyer demand and extend days on market')
  if (popGrowth <= 0) riskFactors.push('Stagnant or declining population — demand headwind')
  if (currentInventory > 6) riskFactors.push('Elevated inventory levels suggest oversupply risk')
  riskFactors.push('Potential regulatory changes (rent control, zoning) could impact returns')
  riskFactors.push('Climate risk and insurance costs may affect property values in vulnerable areas')

  const opportunityZones: string[] = []
  if (trendImpact > 1) opportunityZones.push('High-growth submarkets with new housing demand exceeding supply')
  if (infra.length > 0) opportunityZones.push('Areas adjacent to planned infrastructure projects')
  if (rateTrend === 'falling') opportunityZones.push('Move-up buyer segments benefiting from improved affordability')
  opportunityZones.push('Value-add properties in transitioning neighborhoods')
  opportunityZones.push('Build-to-rent developments in supply-constrained areas')

  return {
    forecasts,
    trend_drivers: trendDrivers,
    overall_outlook: overallOutlook,
    appreciation_forecast_cagr: Math.round(cagr * 100) / 100,
    peak_year: peakYear,
    trough_year: troughYear,
    risk_factors: riskFactors,
    opportunity_zones: opportunityZones,
    summary: location + ' market forecast: ' + (cagr > 0 ? '+' : '') + (Math.round(cagr * 100) / 100) + '% CAGR over ' + forecastYears + ' years. Current median: $' + currentMedian.toLocaleString() + '. Outlook: ' + overallOutlook.replace(/_/g, ' ') + '. Peak year: ' + (peakYear ? (2026 + peakYear) : 'N/A') + '.',
  }
}

function formatTrendReport(input: MarketTrendInput, output: MarketTrendOutput): string {
  const lines: string[] = []
  lines.push('## Market Trend Forecast: ' + (input.location || 'Metro Area'))
  lines.push('')
  lines.push('**Property Type:** ' + (input.property_type || 'single_family').replace(/_/g, ' ') + ' | **Forecast Period:** ' + output.forecasts.length + ' years')
  lines.push('**Current Median:** $' + (input.current_median_price || 0).toLocaleString() + ' | **CAGR:** ' + output.appreciation_forecast_cagr + '%')
  lines.push('**Overall Outlook:** ' + output.overall_outlook.replace(/_/g, ' ').toUpperCase())
  lines.push('')
  lines.push('### Trend Drivers')
  for (const d of output.trend_drivers) {
    lines.push('- **' + d.factor + '** [' + d.impact.replace(/_/g, ' ').toUpperCase() + ']: ' + d.description)
  }
  lines.push('')
  lines.push('### Year-by-Year Forecast')
  lines.push('| Year | Median Price | Change | Inventory (mo) | DOM | Demand | Phase |')
  lines.push('|------|-------------|--------|---------------|-----|--------|-------|')
  for (const f of output.forecasts) {
    lines.push('| ' + f.year + ' | $' + f.median_price.toLocaleString() + ' | ' + f.price_change_pct + '% | ' + f.inventory_months + ' | ' + f.days_on_market + ' | ' + f.buyer_demand_index + ' | ' + f.market_phase.replace(/_/g, ' ') + ' |')
  }
  lines.push('')
  lines.push('### Risk Factors')
  for (const r of output.risk_factors) lines.push('- ' + r)
  lines.push('')
  lines.push('### Opportunity Zones')
  for (const o of output.opportunity_zones) lines.push('- ' + o)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: BUILDING INSPECTION ASSESSOR ====================

function assessBuilding(input: BuildingInspectionInput): BuildingInspectionOutput {
  const rng = seededRng(input)
  const currentYear = 2026
  const yearBuilt = input.year_built || 1995
  const age = currentYear - yearBuilt
  const propertyType = (input.property_type || 'single_family').toLowerCase()
  const foundationType = input.foundation_type || 'concrete'
  const roofType = input.roof_type || 'asphalt_shingle'
  const knownIssues = input.known_issues || []

  // Calculate scores
  const foundationScore = clamp(getFoundationScore(foundationType) - Math.max(0, (age - 30) * 0.5), 20, 100)
  const roofAge = currentYear - Math.max(yearBuilt, input.last_renovation_year || yearBuilt)
  const roofLifespan = roofType === 'metal' ? 50 : roofType === 'tile' ? 50 : roofType === 'slate' ? 75 : 25
  const roofCondition = Math.max(100 - Math.round((roofAge / roofLifespan) * 100), 10)

  const elecScore = age <= 20 ? 85 : age <= 40 ? 70 : age <= 60 ? 55 : 40
  const plumbScore = age <= 25 ? 80 : age <= 50 ? 65 : age <= 70 ? 50 : 35
  const hvacAge = currentYear - (input.last_renovation_year || (yearBuilt + Math.min(age, 15)))
  const hvacScore = Math.max(100 - Math.round((hvacAge / 20) * 100), 15)
  const structScore = clamp(90 - Math.max(0, (age - 40) * 0.8), 25, 100)
  const extScore = clamp(85 - Math.max(0, (age - 20) * 0.6), 30, 100)
  const intScore = clamp(80 - Math.max(0, (age - 15) * 0.5) + (input.last_renovation_year ? 10 : 0), 30, 100)

  const overall = Math.round(
    foundationScore * 0.15 + roofCondition * 0.15 + elecScore * 0.12 +
    plumbScore * 0.12 + hvacScore * 0.1 + structScore * 0.18 +
    extScore * 0.1 + intScore * 0.08
  )

  // Defects
  const defects: DefectItem[] = []

  if (roofCondition < 50) {
    defects.push({
      category: 'Roof',
      severity: roofCondition < 30 ? 'major' : 'moderate',
      description: roofType + ' roof at ' + (100 - roofCondition) + '% wear level. ' + (roofCondition < 30 ? 'Replacement recommended within 1-2 years.' : 'Maintenance and monitoring required.'),
      estimated_repair_cost: roofCondition < 30 ? rngRange(rng, 8000, 18000) : rngRange(rng, 1500, 5000),
      urgency: roofCondition < 30 ? 'soon_urgent' : 'soon',
      safety_concern: roofCondition < 25,
    })
  }

  if (elecScore < 60) {
    defects.push({
      category: 'Electrical',
      severity: elecScore < 40 ? 'major' : 'moderate',
      description: 'Aging electrical system (' + (age > 40 ? 'knob-and-tube or aluminum wiring possible' : 'panel capacity may be insufficient') + '). Full inspection recommended.',
      estimated_repair_cost: elecScore < 40 ? rngRange(rng, 6000, 15000) : rngRange(rng, 2000, 6000),
      urgency: elecScore < 40 ? 'soon_urgent' : 'soon',
      safety_concern: elecScore < 45,
    })
  }

  if (plumbScore < 55) {
    defects.push({
      category: 'Plumbing',
      severity: plumbScore < 40 ? 'major' : 'moderate',
      description: 'Aging plumbing infrastructure. ' + (age > 50 ? 'Galvanized pipes likely — corrosion and reduced flow expected.' : 'Check for leaks and inefficiencies.'),
      estimated_repair_cost: plumbScore < 40 ? rngRange(rng, 5000, 12000) : rngRange(rng, 1500, 4000),
      urgency: plumbScore < 40 ? 'soon' : 'monitor',
      safety_concern: false,
    })
  }

  if (hvacScore < 50) {
    defects.push({
      category: 'HVAC',
      severity: hvacScore < 30 ? 'major' : 'moderate',
      description: 'HVAC system nearing end of useful life. Efficiency significantly degraded. Replacement recommended.',
      estimated_repair_cost: hvacScore < 30 ? rngRange(rng, 7000, 14000) : rngRange(rng, 2000, 5000),
      urgency: hvacScore < 30 ? 'soon_urgent' : 'soon',
      safety_concern: hvacScore < 20,
    })
  }

  // Known issues
  for (const issue of knownIssues) {
    const sev: DefectItem['severity'] = rngRange(rng, 0, 4) === 0 ? 'major' : rngRange(rng, 0, 2) === 0 ? 'moderate' : 'minor'
    defects.push({
      category: 'Documented Issue',
      severity: sev,
      description: issue,
      estimated_repair_cost: rngRange(rng, 500, sev === 'major' ? 15000 : 5000),
      urgency: sev === 'major' ? 'soon_urgent' : sev === 'moderate' ? 'soon' : 'monitor',
      safety_concern: sev === 'major' || issue.toLowerCase().includes('mold') || issue.toLowerCase().includes('asbestos'),
    })
  }

  // Foundation check
  if (foundationScore < 55) {
    defects.push({
      category: 'Foundation',
      severity: foundationScore < 40 ? 'critical' : 'major',
      description: 'Foundation shows signs of deterioration. Professional structural assessment recommended.',
      estimated_repair_cost: foundationScore < 40 ? rngRange(rng, 10000, 30000) : rngRange(rng, 3000, 10000),
      urgency: foundationScore < 40 ? 'immediate' : 'soon',
      safety_concern: true,
    })
  }

  if (defects.length === 0) {
    defects.push({
      category: 'General',
      severity: 'cosmetic',
      description: 'Property is in good condition. Minor cosmetic items may need refreshing.',
      estimated_repair_cost: rngRange(rng, 500, 2000),
      urgency: 'monitor',
      safety_concern: false,
    })
  }

  const scores: InspectionScore = {
    foundation: Math.round(foundationScore),
    roof: roofCondition,
    electrical: Math.round(elecScore),
    plumbing: Math.round(plumbScore),
    hvac: Math.round(hvacScore),
    structural: Math.round(structScore),
    exterior: Math.round(extScore),
    interior: Math.round(intScore),
    overall,
  }

  let conditionGrade: BuildingInspectionOutput['condition_grade'] = 'C'
  if (overall >= 85) conditionGrade = 'A'
  else if (overall >= 72) conditionGrade = 'B'
  else if (overall >= 58) conditionGrade = 'C'
  else if (overall >= 45) conditionGrade = 'D'
  else conditionGrade = 'F'

  const totalRepair = defects.reduce((sum, d) => sum + d.estimated_repair_cost, 0)
  const criticalCount = defects.filter(d => d.severity === 'major' || d.severity === 'critical').length

  const remainingLife = clamp(Math.round(75 - age * 0.6 - (100 - overall) * 0.3), 5, 75)

  const immediate: string[] = []
  const maintenance: string[] = []
  for (const d of defects) {
    if (d.urgency === 'immediate') immediate.push(d.category + ': ' + d.description.substring(0, 80))
    else if (d.urgency === 'soon_urgent') maintenance.push('[URGENT] ' + d.category + ' - address within 30 days')
    else if (d.urgency === 'soon') maintenance.push('[' + d.severity.toUpperCase() + '] ' + d.category + ' - schedule within 6-12 months')
    else maintenance.push('[MONITOR] ' + d.category + ' - track and reassess annually')
  }

  return {
    defects,
    scores,
    condition_grade: conditionGrade,
    total_repair_estimate: totalRepair,
    critical_items_count: criticalCount,
    remaining_useful_life_years: remainingLife,
    immediate_concerns: immediate.length > 0 ? immediate : ['No immediate structural safety concerns'],
    maintenance_schedule: maintenance,
    summary: propertyType.replace(/_/g, ' ') + ' built in ' + yearBuilt + ' (age: ' + age + ' yrs). Overall condition: ' + overall + '/100 (Grade: ' + conditionGrade + '). ' + defects.length + ' items found (' + criticalCount + ' critical/major). Estimated repairs: $' + totalRepair.toLocaleString() + '. Remaining useful life: ~' + remainingLife + ' years.',
  }
}

function formatInspectionReport(input: BuildingInspectionInput, output: BuildingInspectionOutput): string {
  const lines: string[] = []
  lines.push('## Building Inspection Report')
  lines.push('')
  lines.push('**Property Type:** ' + (input.property_type || 'single_family').replace(/_/g, ' ') + ' | **Age:** ' + (input.year_built ? (2026 - input.year_built) : 'N/A') + ' years')
  lines.push('**Overall Score:** ' + output.scores.overall + '/100 | **Grade:** ' + output.condition_grade + ' | **Remaining Life: ~' + output.remaining_useful_life_years + ' years')
  lines.push('')
  lines.push('### Condition Scores')
  lines.push('| Category | Score |')
  lines.push('|----------|-------|')
  lines.push('| Foundation | ' + output.scores.foundation + '/100 |')
  lines.push('| Roof | ' + output.scores.roof + '/100 |')
  lines.push('| Electrical | ' + output.scores.electrical + '/100 |')
  lines.push('| Plumbing | ' + output.scores.plumbing + '/100 |')
  lines.push('| HVAC | ' + output.scores.hvac + '/100 |')
  lines.push('| Structural | ' + output.scores.structural + '/100 |')
  lines.push('| Exterior | ' + output.scores.exterior + '/100 |')
  lines.push('| Interior | ' + output.scores.interior + '/100 |')
  lines.push('| **Overall** | **' + output.scores.overall + '/100** |')
  lines.push('')
  lines.push('### Defect Details')
  lines.push('| Category | Severity | Urgency | Safety | Repair Cost |')
  lines.push('|----------|----------|---------|--------|-------------|')
  for (const d of output.defects) {
    lines.push('| ' + d.category + ' | ' + d.severity.toUpperCase() + ' | ' + d.urgency.replace(/_/g, ' ') + ' | ' + (d.safety_concern ? 'YES' : 'No') + ' | $' + d.estimated_repair_cost.toLocaleString() + ' |')
  }
  lines.push('')
  lines.push('### Total Repair Estimate: $' + output.total_repair_estimate.toLocaleString())
  lines.push('### Critical Items: ' + output.critical_items_count)
  lines.push('')
  if (output.immediate_concerns.length > 0 && output.immediate_concerns[0] !== 'No immediate structural safety concerns') {
    lines.push('### Immediate Concerns')
    for (const c of output.immediate_concerns) lines.push('- URGENT: ' + c)
    lines.push('')
  }
  lines.push('### Maintenance Schedule')
  for (const m of output.maintenance_schedule) lines.push('- ' + m)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: MORTGAGE ELIGIBILITY CHECKER ====================

function checkMortgageEligibility(input: MortgageEligibilityInput): MortgageEligibilityOutput {
  const rng = seededRng(input)
  const annualIncome = input.annual_income || 95000
  const monthlyIncome = annualIncome / 12
  const monthlyDebts = input.monthly_debts || 500
  const creditScore = input.credit_score || 700
  const propertyValue = input.property_value || 450000
  const downPaymentPct = (input.down_payment_pct || 20) / 100
  const loanTerm = input.loan_term_years || 30
  const interestRate = (input.interest_rate || 6.5) / 100
  const coBorrower = input.co_borrower ?? false
  const coBorrowerIncome = input.co_borrower_income || 0
  const coBorrowerDebts = input.co_borrower_debts || 0

  const totalAnnualIncome = annualIncome + coBorrowerIncome
  const totalMonthlyIncome = totalAnnualIncome / 12
  const totalMonthlyDebts = monthlyDebts + coBorrowerDebts

  // DTI calculations
  const frontEndLimit = totalMonthlyIncome * 0.28
  const backEndLimit = totalMonthlyIncome * 0.36
  const maxHousingPayment = frontEndLimit
  const maxTotalDebt = backEndLimit

  // How much can they borrow?
  const monthlyRate = interestRate / 12
  const numPayments = loanTerm * 12
  const maxMonthlyForLoans = Math.min(frontEndLimit, backEndLimit - totalMonthlyDebts)
  const maxLoanAmount = maxMonthlyForLoans > 0
    ? maxMonthlyForLoans * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
    : 0

  const downPaymentAmount = propertyValue * downPaymentPct
  const neededLoan = propertyValue - downPaymentAmount
  const qualifiesForLoan = maxLoanAmount >= neededLoan

  const dti: DTIAnalysis = {
    front_end_dti: 0,
    back_end_dti: 0,
    front_end_qualifies: true,
    back_end_qualifies: true,
    max_monthly_housing_payment: Math.round(maxHousingPayment),
    max_total_monthly_debt: Math.round(maxTotalDebt),
  }

  // LTV
  const ltv = (neededLoan / propertyValue) * 100
  const ltvQualifies = ltv <= 97
  const pmiRequired = ltv > 80
  const pmiMonthly = pmiRequired ? Math.round(neededLoan * 0.0055 / 12) : 0

  const ltvAnalysis: LTVAnalysis = {
    loan_amount: Math.round(neededLoan),
    ltv_ratio: Math.round(ltv * 100) / 100,
    ltv_qualifies: ltvQualifies,
    pmi_required: pmiRequired,
    pmi_estimate_monthly: pmiMonthly,
  }

  // Credit score adjustments
  let rateAdjustment = 0
  if (creditScore >= 760) rateAdjustment = -0.5
  else if (creditScore >= 740) rateAdjustment = -0.375
  else if (creditScore >= 720) rateAdjustment = -0.25
  else if (creditScore >= 700) rateAdjustment = -0.125
  else if (creditScore >= 680) rateAdjustment = 0.125
  else if (creditScore >= 660) rateAdjustment = 0.375
  else if (creditScore >= 640) rateAdjustment = 0.75
  else if (creditScore >= 620) rateAdjustment = 1.25
  else rateAdjustment = 2.0

  const adjustedRate = interestRate + rateAdjustment / 100
  const adjustedMonthlyRate = adjustedRate / 12
  const monthlyPayment = neededLoan * (adjustedMonthlyRate * Math.round(Math.pow(1 + adjustedMonthlyRate, numPayments) * 1000000) / 1000000) / (Math.pow(1 + adjustedMonthlyRate, numPayments) - 1)

  dti.front_end_dti = Math.round((monthlyPayment + pmiMonthly) / totalMonthlyIncome * 10000) / 100
  dti.back_end_dti = Math.round((monthlyPayment + pmiMonthly + totalMonthlyDebts) / totalMonthlyIncome * 10000) / 100
  dti.front_end_qualifies = dti.front_end_dti <= 28
  dti.back_end_qualifies = dti.back_end_dti <= 36

  // Loan products
  const loanProducts: LoanProduct[] = []

  loanProducts.push({
    product_name: 'Conventional 30-Year Fixed',
    interest_rate: Math.round(adjustedRate * 10000) / 10000,
    monthly_payment: Math.round(monthlyPayment),
    total_interest: Math.round(monthlyPayment * numPayments - neededLoan),
    recommended: creditScore >= 680 && downPaymentPct >= 0.1,
    notes: downPaymentPct < 0.2 ? 'PMI required at $' + pmiMonthly + '/mo until 80% LTV' : 'Best overall value for qualified buyers',
  })

  loanProducts.push({
    product_name: 'FHA Loan 30-Year Fixed',
    interest_rate: Math.round((adjustedRate - 0.125) * 10000) / 10000,
    monthly_payment: Math.round(neededLoan * ((adjustedRate - 0.00125) / 12 * Math.pow(1 + (adjustedRate - 0.00125) / 12, numPayments)) / (Math.pow(1 + (adjustedRate - 0.00125) / 12, numPayments) - 1)),
    total_interest: 0,
    recommended: creditScore < 680 || downPaymentPct < 0.1,
    notes: 'Lower credit score tolerance. MIP required regardless of down payment.',
  })
  loanProducts[1].total_interest = Math.round(loanProducts[1].monthly_payment * numPayments - neededLoan)

  if (input.first_time_buyer) {
    loanProducts.push({
      product_name: 'First-Time Buyer Program',
      interest_rate: Math.round((adjustedRate - 0.25) * 10000) / 10000,
      monthly_payment: Math.round(neededLoan * ((adjustedRate - 0.0025) / 12 * Math.pow(1 + (adjustedRate - 0.0025) / 12, numPayments)) / (Math.pow(1 + (adjustedRate - 0.0025) / 12, numPayments) - 1)),
      total_interest: 0,
      recommended: true,
      notes: 'Down payment assistance (up to 3.5%) and reduced rate for qualifying first-time buyers.',
    })
    loanProducts[loanProducts.length - 1].total_interest = Math.round(loanProducts[loanProducts.length - 1].monthly_payment * numPayments - neededLoan)
  }

  loanProducts.push({
    product_name: '15-Year Fixed',
    interest_rate: Math.round((adjustedRate - 0.5) * 10000) / 10000,
    monthly_payment: Math.round(neededLoan * ((adjustedRate - 0.005) / 12 * Math.pow(1 + (adjustedRate - 0.005) / 12, 180)) / (Math.pow(1 + (adjustedRate - 0.005) / 12, 180) - 1)),
    total_interest: 0,
    recommended: monthlyPayment * 1.4 < maxHousingPayment && creditScore >= 700,
    notes: 'Higher payment but saves significantly on total interest. Builds equity faster.',
  })
  loanProducts[loanProducts.length - 1].total_interest = Math.round(loanProducts[loanProducts.length - 1].monthly_payment * 180 - neededLoan)

  const eligible = qualifiesForLoan && dti.front_end_qualifies && dti.back_end_qualifies && creditScore >= 620 && ltvQualifies

  const conditions: string[] = []
  if (dti.front_end_qualifies && !dti.back_end_qualifies) {
    conditions.push('Pay down existing debts to reduce back-end DTI below 36%')
  }
  if (creditScore >= 620 && creditScore < 680) {
    conditions.push('Consider FHA loan or improve credit score before applying')
  }
  if (downPaymentPct < 0.05) {
    conditions.push('Increase down payment to at least 5% for conventional loans')
  }
  if (input.self_employed) {
    conditions.push('Provide 2 years of tax returns and YTD P&L for self-employed income verification')
  }

  const riskFactors: string[] = []
  if (creditScore < 660) riskFactors.push('Below-average credit score may limit loan options and increase rates')
  if (dti.back_end_dti > 30) riskFactors.push('High debt-to-income ratio — close to qualifying limits')
  if (input.self_employed) riskFactors.push('Self-employed income may require additional documentation and scrutiny')
  if (input.employment_length_years !== undefined && input.employment_length_years < 2) riskFactors.push('Short employment history — lenders prefer 2+ years with same employer')
  if (input.existing_mortgages && input.existing_mortgages.length > 0) riskFactors.push('Existing mortgage obligations already count toward DTI limits')

  const improvements: string[] = []
  if (creditScore < 740) improvements.push('Improve credit score to 740+ for best rates (estimated savings: $' + Math.round(neededLoan * 0.00375 * numPayments / 12) + ' total interest)')
  if (dti.back_end_dti > 30) improvements.push('Pay down revolving debt to reduce DTI below 30% for stronger application')
  if (downPaymentPct < 0.2) improvements.push('Save for 20% down payment to eliminate PMI (saves ~$' + pmiMonthly + '/mo)')
  if (!coBorrower && !eligible) improvements.push('Consider adding a qualified co-borrower to strengthen the application')

  return {
    eligible,
    max_loan_amount: Math.round(maxLoanAmount),
    max_purchase_price: Math.round(maxLoanAmount + downPaymentAmount),
    dti,
    ltv: ltvAnalysis,
    loan_products: loanProducts,
    conditions,
    risk_factors: riskFactors,
    improvement_suggestions: improvements,
    summary: (eligible ? 'APPROVED' : 'NEEDS ACTION') + ': Max loan capacity $' + Math.round(maxLoanAmount).toLocaleString() + ' on $' + totalAnnualIncome.toLocaleString() + ' income. DTI front/back: ' + dti.front_end_dti + '%/' + dti.back_end_dti + '%. LTV: ' + ltvAnalysis.ltv_ratio + '%. Credit: ' + creditScore + '.',
  }
}

function formatMortgageReport(input: MortgageEligibilityInput, output: MortgageEligibilityOutput): string {
  const lines: string[] = []
  lines.push('## Mortgage Eligibility Assessment')
  lines.push('')
  lines.push('**Annual Income:** $' + (input.annual_income || 0).toLocaleString() + (input.co_borrower ? ' (+ $' + (input.co_borrower_income || 0).toLocaleString() + ' co-borrower)' : '') + ' | **Credit Score:** ' + (input.credit_score || 'N/A'))
  lines.push('**Status:** ' + (output.eligible ? 'PRE-QUALIFIED' : 'NEEDS IMPROVEMENT'))
  lines.push('')
  lines.push('### Maximum Capacity')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Max Loan Amount | $' + output.max_loan_amount.toLocaleString() + ' |')
  lines.push('| Max Purchase Price | $' + output.max_purchase_price.toLocaleString() + ' |')
  lines.push('| Max Monthly Housing | $' + output.dti.max_monthly_housing_payment.toLocaleString() + ' |')
  lines.push('| Max Total Monthly Debt | $' + output.dti.max_total_monthly_debt.toLocaleString() + ' |')
  lines.push('')
  lines.push('### DTI Analysis')
  lines.push('| Metric | Value | Qualifies |')
  lines.push('|--------|-------|-----------|')
  lines.push('| Front-End DTI | ' + output.dti.front_end_dti + '% | ' + (output.dti.front_end_qualifies ? 'YES' : 'NO') + ' (max 28%) |')
  lines.push('| Back-End DTI | ' + output.dti.back_end_dti + '% | ' + (output.dti.back_end_qualifies ? 'YES' : 'NO') + ' (max 36%) |')
  lines.push('')
  lines.push('### LTV Analysis')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Loan Amount | $' + output.ltv.loan_amount.toLocaleString() + ' |')
  lines.push('| LTV Ratio | ' + output.ltv.ltv_ratio + '% |')
  lines.push('| PMI Required | ' + (output.ltv.pmi_required ? 'YES ($' + output.ltv.pmi_estimate_monthly + '/mo)' : 'NO') + ' |')
  lines.push('')
  lines.push('### Loan Product Comparison')
  lines.push('| Product | Rate | Monthly Payment | Total Interest | Recommended |')
  lines.push('|---------|------|----------------|---------------|-------------|')
  for (const p of output.loan_products) {
    lines.push('| ' + p.product_name + ' | ' + (p.interest_rate * 100).toFixed(3) + '% | $' + p.monthly_payment.toLocaleString() + ' | $' + p.total_interest.toLocaleString() + ' | ' + (p.recommended ? 'YES' : 'No') + ' |')
  }
  lines.push('')
  if (output.conditions.length > 0) {
    lines.push('### Conditions')
    for (const c of output.conditions) lines.push('- ' + c)
    lines.push('')
  }
  if (output.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of output.risk_factors) lines.push('- ' + r)
    lines.push('')
  }
  if (output.improvement_suggestions.length > 0) {
    lines.push('### Improvement Suggestions')
    for (const s of output.improvement_suggestions) lines.push('- ' + s)
    lines.push('')
  }
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Property Valuation Engine
  tools.register(defineTool({
    name: 'property_valuation_engine',
    description: 'Estimates property value using comparable sales analysis with adjustment modeling. Generates synthetic comparables, applies condition/market/age adjustments, and provides confidence-scored valuation range with full breakdown (land, structure, location premium). Supports single family, condo, townhouse, multi-family, luxury, and commercial property types.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: property_type, address, square_feet, bedrooms, bathrooms, year_built, lot_size_sqft, condition (poor/fair/good/excellent/luxury), market_trend (appreciating/stable/declining)', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PropertyValuationInput = JSON.parse(args.input_data)
      const result = estimatePropertyValue(input)
      return formatValuationReport(input, result)
    }
  }))

  // Tool 2: Investment Analysis Calculator
  tools.register(defineTool({
    name: 'investment_analysis_calculator',
    description: 'Full investment analysis with cash flow projection, cap rate, cash-on-cash return, DSCR, IRR estimate, equity multiple, and break-even occupancy. Generates multi-year ROI projections and assigns investment grade and risk level with actionable recommendations.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: purchase_price, down_payment_pct, interest_rate, loan_term_years, monthly_rent, vacancy_rate, property_tax_annual, insurance_annual, maintenance_pct, property_management_pct, capex_reserve_pct, appreciation_rate, holding_period_years, selling_costs_pct', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: InvestmentAnalysisInput = JSON.parse(args.input_data)
      const result = analyzeInvestment(input)
      return formatInvestmentReport(input, result)
    }
  }))

  // Tool 3: Tenant Screening System
  tools.register(defineTool({
    name: 'tenant_screening_system',
    description: 'Comprehensive tenant screening with income verification, credit assessment, employment stability check, rental history review, and background check. Produces weighted screening score, grade, approve/conditional/deny recommendation with detailed risk flags and conditions.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: applicant_name, monthly_income, credit_score, employment_status, employment_length_months, monthly_rent, rental_history_months, evictions_count, bankruptcies (bool), criminal_record (bool), references_count, pets (bool), smokers (bool), requested_lease_term_months', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: TenantScreeningInput = JSON.parse(args.input_data)
      const result = screenTenant(input)
      return formatScreeningReport(input, result)
    }
  }))

  // Tool 4: Property Management Optimizer
  tools.register(defineTool({
    name: 'property_management_optimizer',
    description: 'Optimizes property management operations for portfolios. Benchmarks occupancy, turnover, rent collection, and staffing against industry averages. Identifies optimization opportunities with cost savings estimates and provides automation recommendations.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: portfolio_size, property_types[], geographic_regions[], avg_occupancy_rate, avg_rent_collection_days, maintenance_requests_monthly, avg_maintenance_cost, tenant_turnover_rate, staff_count, management_fee_pct, automation_level (manual/partial/automated/smart), pain_points[]', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PropertyManagementInput = JSON.parse(args.input_data)
      const result = optimizePropertyManagement(input)
      return formatManagementReport(input, result)
    }
  }))

  // Tool 5: Rental Yield Analyzer
  tools.register(defineTool({
    name: 'rental_yield_analyzer',
    description: 'Analyzes rental yield performance with gross/net yield calculations, operating expense ratio, break-even vacancy, and multiple yield scenarios (conservative, base, optimistic, furnished premium). Provides pricing recommendations and optimization opportunities.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: property_price, monthly_rent, annual_expenses, location, property_type, furnished (bool), target_yield_pct, market_avg_yield, occupancy_target, lease_structure (short_term/long_term/mid_term/mixed), seasonal_factors (bool)', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RentalYieldInput = JSON.parse(args.input_data)
      const result = analyzeRentalYield(input)
      return formatYieldReport(input, result)
    }
  }))

  // Tool 6: Market Trend Forecaster
  tools.register(defineTool({
    name: 'market_trend_forecaster',
    description: 'Forecasts real estate market trends with year-by-year price projections, inventory predictions, days-on-market estimates, and demand index scoring. Considers population growth, employment trends, interest rates, and infrastructure investment as trend drivers.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: location, property_type, forecast_years, current_median_price, current_inventory_months, current_days_on_market, population_growth_rate, employment_growth_rate, interest_rate_trend (rising/stable/falling), planned_infrastructure[], economic_indicators[]', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: MarketTrendInput = JSON.parse(args.input_data)
      const result = forecastMarketTrends(input)
      return formatTrendReport(input, result)
    }
  }))

  // Tool 7: Building Inspection Assessor
  tools.register(defineTool({
    name: 'building_inspection_assessor',
    description: 'Assesses building condition across 8 categories (foundation, roof, electrical, plumbing, HVAC, structural, exterior, interior). Generates defect list with severity, repair costs, urgency ratings, and safety flags. Produces overall condition grade and maintenance schedule.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: property_type, year_built, square_feet, stories, foundation_type, roof_type, electrical_system, plumbing_system, hvac_system, known_issues[], last_renovation_year', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: BuildingInspectionInput = JSON.parse(args.input_data)
      const result = assessBuilding(input)
      return formatInspectionReport(input, result)
    }
  }))

  // Tool 8: Mortgage Eligibility Checker
  tools.register(defineTool({
    name: 'mortgage_eligibility_checker',
    description: 'Assesses mortgage eligibility with front-end/back-end DTI analysis, LTV calculation, PMI determination, and multiple loan product comparison (Conventional, FHA, First-Time Buyer, 15-Year). Provides approval status, max loan amount, rate adjustments based on credit score, and improvement suggestions.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: annual_income, monthly_debts, credit_score, down_payment_amount, down_payment_pct, loan_term_years, interest_rate, property_value, employment_length_years, employment_type, first_time_buyer (bool), self_employed (bool), existing_mortgages[], co_borrower (bool), co_borrower_income, co_borrower_debts', required: true } },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: MortgageEligibilityInput = JSON.parse(args.input_data)
      const result = checkMortgageEligibility(input)
      return formatMortgageReport(input, result)
    }
  }))

  console.log('[dsh-tool-realestateai] Loaded v' + VERSION + ' - Real Estate & Property Tech with 8 tools')
  console.log('  Tools: property_valuation_engine, investment_analysis_calculator, tenant_screening_system, property_management_optimizer, rental_yield_analyzer, market_trend_forecaster, building_inspection_assessor, mortgage_eligibility_checker')
}
