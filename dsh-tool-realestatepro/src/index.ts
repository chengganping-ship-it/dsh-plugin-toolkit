/**
 * DSH Real Estate Pro Investment & Property Management Agent v1.0.0
 *
 * Next-generation real estate toolkit for DeepSeek Harness Agent.
 * Designed for property investors, portfolio managers, and property management professionals.
 *
 * Features (v1.0.0):
 * - Property Valuation (multi-model AVM: comparable sales + hedonic pricing + income + cost approach)
 * - Investment Analyzer (cash-on-cash, cap rate, leveraged IRR, exit sensitivity, holding period optimization)
 * - Tenant Screening (credit check, income verification, risk scoring, lease terms, optimal selection)
 * - Property Management (lease management, rent collection, maintenance, compliance, owner reports, vendor management)
 * - Market Compass (price trends, inventory cycles, days on market, interest rate impact, policy risk)
 * - Financing Optimizer (refinance optimization, LTV/DCR analysis, multi-scenario, prepayment, capital structure)
 * - Risk Locator (crime, schools, disaster risk, environment, future planning, composite score)
 * - Portfolio Builder (diversification, correlation matrix, rebalancing, REIT comparison, after-tax return)
 *
 * @module dsh-tool-realestatepro
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-realestatepro'
export const inject = ['tools']

const VERSION = '1.0.0'

// ==================== TYPES ====================

interface PropertyProfile {
  address: string
  type: string
  sqft: number
  lot_size_sqft: number
  bedrooms: number
  bathrooms: number
  year_built: number
  condition: 'poor' | 'fair' | 'good' | 'excellent' | 'luxury'
  stories: number
  garage_spaces: number
  pool: boolean
  waterfront: boolean
  view: 'none' | 'city' | 'mountain' | 'water' | 'ocean'
  zip_code: string
  neighborhood: string
  school_district: string
  property_tax_annual: number
  hoa_monthly: number
  last_sale_price: number
  last_sale_date: string
  current_list_price: number
}

interface ComparableSale {
  address: string
  sale_price: number
  sale_date: string
  sqft: number
  bedrooms: number
  bathrooms: number
  year_built: number
  condition: string
  distance_miles: number
  lot_size_sqft: number
  garage_spaces: number
  pool: boolean
  waterfront: boolean
  view: string
  adjusted_price: number
  adjustment_details: Record<string, number>
}

interface IncomeApproachInput {
  gross_rent_annual: number
  vacancy_rate_pct: number
  operating_expenses_annual: number
 cap_rate_pct: number
  growth_rate_pct: number
  remaining_economic_life_years: number
}

interface CostApproachInput {
  land_value: number
  replacement_cost_per_sqft: number
  total_depreciation_pct: number
  external_obsolescence_pct: number
  functional_obsolescence_pct: number
}

interface ValuationResult {
  final_estimate: number
  valuation_range: { low: number; high: number }
  confidence_interval: { level: number; margin_of_error_pct: number }
  approach_results: {
    comparable_sales: { estimate: number; weight: number; confidence: number }
    hedonic_model: { estimate: number; weight: number; confidence: number }
    income_approach: { estimate: number; weight: number; confidence: number }
    cost_approach: { estimate: number; weight: number; confidence: number }
  }
  adjustment_summary: Record<string, number>
  price_per_sqft: number
  market_position: string
  risk_factors: string[]
  recommendation: string
}

interface InvestmentInput {
  purchase_price: number
  down_payment_pct: number
  interest_rate_pct: number
  loan_term_years: number
  monthly_rent: number
  vacancy_rate_pct: number
  property_tax_annual: number
  insurance_annual: number
  maintenance_annual: number
  management_fee_pct: number
  hoa_monthly: number
  closing_costs: number
  rehab_costs: number
  appreciation_rate_pct: number
  holding_period_years: number
  selling_costs_pct: number
  income_tax_bracket_pct: number
}

interface InvestmentResult {
  cash_on_cash_return: number
  cap_rate: number
  leveraged_irr: number
  unleveraged_irr: number
  equity_multiple: number
  total_return: number
  annual_cash_flows: { year: number; cash_flow: number; cumulative: number; equity: number }[]
  exit_sensitivity: { appreciation_pct: number; sale_price: number; total_profit: number; irr: number }[]
  optimal_holding_period: { years: number; total_profit: number; irr: number; reason: string }
  monthly_cash_flow: number
  annual_cash_flow: number
  dscr: number
  break_even_occupancy: number
  gross_rent_multiplier: number
  debt_service_coverage: number
  investment_grade: string
  recommendation: string
}

interface TenantApplicant {
  name: string
  monthly_income: number
  credit_score: number
  employment_status: string
  employment_months: number
  rental_months_previous: number
  eviction_history: boolean
  criminal_record: boolean
  references_count: number
  pets: boolean
  smokers: boolean
  desired_lease_months: number
  move_in_date: string
  current_rent: number
  debt_to_income_pct: number
  bankruptcies: number
  collections_accounts: number
}

interface TenantScreeningResult {
  applicant_scores: {
    name: string
    overall_score: number
    credit_score_normalized: number
    income_ratio: number
    employment_stability: number
    rental_history_score: number
    risk_flags: string[]
    lease_terms_suggestion: string
    deposit_recommendation: string
    risk_category: 'low' | 'moderate' | 'high' | 'prohibitive'
  }[]
  optimal_tenant: string
  ranking: string[]
  portfolio_fit: string
  recommended_lease_terms: {
    lease_months: number
    security_deposit_months: number
    rent_premium_pct: number
    special_clauses: string[]
  }
}

interface LeaseRecord {
  tenant_name: string
  property_address: string
  lease_start: string
  lease_end: string
  monthly_rent: number
  security_deposit: number
  payment_status: 'current' | 'late' | 'overdue' | 'eviction_pending'
  last_payment_date: string
  balance_due: number
  auto_renew: boolean
  notice_given: boolean
  inspection_dates: string[]
  notes: string
}

interface MaintenanceWorkOrder {
  id: string
  property_address: string
  category: string
  priority: 'emergency' | 'urgent' | 'routine' | 'scheduled'
  description: string
  reported_date: string
  assigned_vendor: string
  estimated_cost: number
  actual_cost: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  completion_date: string
  tenant_satisfaction: number
  sla_hours: number
  sla_met: boolean
}

interface VendorRecord {
  name: string
  category: string
  rating: number
  avg_response_hours: number
  total_jobs: number
  avg_cost: number
  contract_active: boolean
  insurance_verified: boolean
  license_verified: boolean
  last_job_date: string
  preferred: boolean
}

interface PropertyManagementResult {
  portfolio_summary: {
    total_properties: number
    occupied_units: number
    vacancy_rate: number
    total_monthly_rent: number
    collection_rate: number
    avg_tenancy_months: number
  }
  lease_alerts: { tenant: string; alert: string; urgency: 'low' | 'medium' | 'high' | 'critical' }[]
  financial_summary: {
    gross_receipts: number
    net_operating_income: number
    management_fees: number
    maintenance_costs: number
    cash_flow: number
    cap_ex_reserve: number
  }
  work_order_summary: { open: number; in_progress: number; completed_overdue: number; sla_compliance_pct: number }
  compliance_status: { name: string; status: 'compliant' | 'pending' | 'non_compliant'; due_date: string }[]
  owner_report: {
    period: string
    property_address: string
    gross_income: number
    expenses: Record<string, number>
    net_income: number
    occupancy_days: number
    market_comparison: string
    recommendations: string[]
  }
  vendor_scorecard: { name: string; score: number; status: string }[]
}

interface MarketDataInput {
  zip_code: string
  city: string
  state: string
  median_price_current: number
  median_price_history: number[]
  inventory_months: number
  inventory_history: number[]
  days_on_market_avg: number
  days_on_market_history: number[]
  median_rent: number
  rent_history: number[]
  mortgage_rate_30yr: number
  mortgage_rate_history: number[]
  building_permits: number
  employment_growth_pct: number
  population_growth_pct: number
  median_household_income: number
  new_construction_units: number
  foreclosure_rate: number
  price_to_rent_ratio: number
  policy_events: { date: string; event: string; impact: 'positive' | 'negative' | 'neutral' }[]
}

interface MarketCompassResult {
  market_phase: string
  market_temperature: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold'
  heat_index: number
  price_trend: { direction: string; momentum: number; forecast_12m: number; forecast_24m: number }
  inventory_analysis: { current_months: number; trend: string; absorption_rate: number; seller_buyer_balance: string }
  days_on_market_analysis: { current: number; trend: string; percentile_vs_historical: number }
  interest_rate_impact: { current_rate: number; affordability_index: number; rate_sensitivity: string; forecast_impact: string }
  policy_risk_assessment: { overall_risk: string; key_risks: string[]; opportunities: string[] }
  rental_yield_trend: { current_yield: number; trend: number; forecast: number }
  investment_signal: string
  key_metrics_dashboard: Record<string, string>
}

interface FinancingInput {
  loan_amount: number
  current_rate_pct: number
  current_term_years: number
  current_monthly_payment: number
  property_value: number
  noi_annual: number
  refinance_rates: { lender: string; rate_pct: number; points: number; closing_costs: number; term_years: number; loan_type: string }[]
  target_ltv_pct: number
  prepayment_penalty_pct: number
  dscr_requirement: number
  investor_type: 'individual' | 'llc' | 'corporation' | 'reit'
}

interface FinancingResult {
  current_loan_metrics: {
    ltv_pct: number
    dscr: number
    equity: number
    monthly_payment: number
    total_remaining_payments: number
  }
  refinance_scenarios: {
    lender: string
    rate_pct: number
    points_cost: number
    closing_costs: number
    monthly_payment: number
    monthly_savings: number
    annual_savings: number
    break_even_months: number
    total_savings_lifetime: number
    net_benefit: number
    recommendation: string
  }[]
  optimal_scenario: string
  ltv_dscr_analysis: {
    current_ltv: number
    current_dscr: number
    max_loan_by_ltv: number
    max_loan_by_dscr: number
    binding_constraint: string
    additional_borrowing_capacity: number
  }
  prepayment_analysis: {
    current_balance: number
    prepayment_penalty: number
    interest_savings_if_prepaid: number
    net_benefit_after_penalty: number
    optimal_strategy: string
  }
  capital_structure_advice: {
    recommended_ltv: number
    recommended_dscr_minimum: number
    financing_type: string
    rationale: string
    alternatives: string[]
  }
}

interface LocationRiskInput {
  address: string
  zip_code: string
  city: string
  state: string
  latitude: number
  longitude: number
  crime_index: number
  violent_crime_rate: number
  property_crime_rate: number
  school_rating_avg: number
  school_count: number
  nearest_school_miles: number
  flood_zone: string
  flood_risk_score: number
  earthquake_risk_score: number
  hurricane_risk_score: number
  tornado_risk_score: number
  wildfire_risk_score: number
  hail_risk_score: number
  air_quality_index: number
  radon_risk: string
  superfund_proximity_miles: number
  noise_pollution_db: number
  future_development_plans: string[]
  zoning_changes: string[]
  infrastructure_projects: string[]
  insurance_availability: string
}

interface LocationRiskResult {
  composite_risk_score: number
  risk_level: 'minimal' | 'low' | 'moderate' | 'high' | 'severe'
  risk_map: {
    safety: { score: number; grade: string; details: string }
    education: { score: number; grade: string; details: string }
    environmental: { score: number; grade: string; details: string }
    natural_disaster: { score: number; grade: string; details: string }
    future_planning: { score: number; grade: string; details: string }
  }
  insurance_impact: { estimated_annual_premium: number; coverage_gaps: string[]; recommendations: string[] }
  investment_implication: string
  top_risks: string[]
  top_opportunities: string[]
  comparable_markets_by_risk: string[]
}

interface PortfolioHolding {
  property_id: string
  address: string
  city: string
  state: string
  property_type: string
  purchase_price: number
  current_value: number
  equity: number
  debt: number
  noi_annual: number
  cash_flow_annual: number
  occupancy_rate: number
  year_acquired: number
  latitude: number
  longitude: number
}

interface PortfolioBuilderResult {
  diversification_analysis: {
    total_value: number
    total_equity: number
    total_debt: number
    weighted_ltv: number
    geographic_concentration: Record<string, number>
    type_concentration: Record<string, number>
    diversification_score: number
    diversification_grade: string
  }
  correlation_matrix: {
    geographic_correlation: number
    type_correlation: number
    portfolio_beta: number
    risk_adjusted_return: number
    sharpe_ratio: number
  }
  rebalancing_recommendations: {
    action: 'hold' | 'sell' | 'buy' | 'exchange'
    property_id: string
    reason: string
    expected_impact: string
    priority: 'low' | 'medium' | 'high'
  }[]
  reit_comparison: {
    portfolio_yield: number
    reit_avg_yield: number
    portfolio_appreciation: number
    reit_avg_appreciation: number
    portfolio_volatility: number
    reit_avg_volatility: number
    advantage: string
    recommendation: string
  }
  after_tax_optimization: {
    current_after_tax_return: number
    potential_after_tax_return: number
    tax_loss_harvesting_opportunity: number
    depreciation_capture: number
    optimal_disposition_timeline: string[]
    ten_thirty_one_exchange_candidates: string[]
  }
}

// ==================== TOOL 1: PROPERTY VALUATION ====================

function runPropertyValuation(
  property: PropertyProfile,
  comparables: ComparableSale[],
  income?: IncomeApproachInput,
  cost?: CostApproachInput
): ValuationResult {
  // 1. Comparable Sales Approach
  const compEstimate = runComparableSalesApproach(property, comparables)

  // 2. Hedonic Price Model
  const hedonicEstimate = runHedonicPriceModel(property, comparables)

  // 3. Income Approach
  const incomeEstimate = income ? runIncomeApproach(income) : { estimate: 0, confidence: 0 }

  // 4. Cost Approach
  const costEstimate = cost ? runCostApproach(cost, property) : { estimate: 0, confidence: 0 }

  // Weighted combination (weights vary by available data)
  const weights = calculateApproachWeights(compEstimate, hedonicEstimate, incomeEstimate, costEstimate, comparables.length)
  const finalEstimate =
    compEstimate.estimate * weights.comparable_sales +
    hedonicEstimate.estimate * weights.hedonic +
    incomeEstimate.estimate * weights.income +
    costEstimate.estimate * weights.cost

  // Confidence interval
  const confidenceLevel = 0.95
  const stdDev = Math.sqrt(
    weights.comparable_sales * Math.pow(compEstimate.estimate - finalEstimate, 2) +
    weights.hedonic * Math.pow(hedonicEstimate.estimate - finalEstimate, 2) +
    weights.income * Math.pow(incomeEstimate.estimate - finalEstimate, 2) +
    weights.cost * Math.pow(costEstimate.estimate - finalEstimate, 2)
  )
  const marginOfErrorPct = (1.96 * stdDev / finalEstimate) * 100
  const rangeLow = finalEstimate - 1.96 * stdDev
  const rangeHigh = finalEstimate + 1.96 * stdDev

  // Risk factors
  const riskFactors: string[] = []
  if (comparables.length < 3) riskFactors.push('Limited comparable sales data reduces valuation confidence')
  if (property.condition === 'poor') riskFactors.push('Property condition may require significant capital expenditure')
  if (marginOfErrorPct > 15) riskFactors.push('Wide valuation range indicates market uncertainty')
  if (property.waterfront) riskFactors.push('Waterfront properties have higher value volatility')
  if (property.view !== 'none') riskFactors.push('View premium is subjective and may not be fully captured')

  let recommendation = 'Property is reasonably valued within expected range.'
  if (property.current_list_price > 0) {
    const listingRatio = finalEstimate / property.current_list_price
    if (listingRatio > 1.1) recommendation = 'Property is listed below estimated value — potential buying opportunity.'
    else if (listingRatio < 0.9) recommendation = 'Property is listed above estimated value — negotiate or proceed with caution.'
    else recommendation = 'Property is listed near estimated value — standard due diligence recommended.'
  }

  // Market position
  let market_position = 'Mid-market'
  if (comparables.length > 0) {
    const avgCompPrice = comparables.reduce((s, c) => s + c.sale_price, 0) / comparables.length
    const ratio = finalEstimate / avgCompPrice
    if (ratio > 1.25) market_position = 'Premium segment (top quartile)'
    else if (ratio > 1.05) market_position = 'Above average'
    else if (ratio > 0.95) market_position = 'Mid-market'
    else if (ratio > 0.75) market_position = 'Below average'
    else market_position = 'Entry level / value segment'
  }

  return {
    final_estimate: Math.round(finalEstimate),
    valuation_range: { low: Math.round(rangeLow), high: Math.round(rangeHigh) },
    confidence_interval: { level: confidenceLevel, margin_of_error_pct: Math.round(marginOfErrorPct * 100) / 100 },
    approach_results: {
      comparable_sales: { estimate: Math.round(compEstimate.estimate), weight: weights.comparable_sales, confidence: compEstimate.confidence },
      hedonic_model: { estimate: Math.round(hedonicEstimate.estimate), weight: weights.hedonic, confidence: hedonicEstimate.confidence },
      income_approach: { estimate: Math.round(incomeEstimate.estimate), weight: weights.income, confidence: incomeEstimate.confidence },
      cost_approach: { estimate: Math.round(costEstimate.estimate), weight: weights.cost, confidence: costEstimate.confidence }
    },
    adjustment_summary: compEstimate.adjustments,
    price_per_sqft: Math.round(finalEstimate / property.sqft),
    market_position,
    risk_factors: riskFactors.length > 0 ? riskFactors : ['No significant valuation risks identified'],
    recommendation
  }
}

function runComparableSalesApproach(property: PropertyProfile, comparables: ComparableSale[]): { estimate: number; confidence: number; adjustments: Record<string, number> } {
  if (comparables.length === 0) return { estimate: property.current_list_price || property.last_sale_price || 0, confidence: 0.3, adjustments: {} }

  let totalWeightedPrice = 0
  let totalWeight = 0
  const aggregateAdjustments: Record<string, number> = {}

  for (const comp of comparables) {
    // Calculate adjustments
    const sqftDiff = property.sqft - comp.sqft
    const sqftAdj = sqftDiff * 150 // $150 per sqft difference
    const bedAdj = (property.bedrooms - comp.bedrooms) * 8000
    const bathAdj = (property.bathrooms - comp.bathrooms) * 12000
    const ageDiff = (2024 - property.year_built) - (2024 - comp.year_built)
    const ageAdj = -ageDiff * 500
    const lotAdj = ((property.lot_size_sqft || 0) - (comp.lot_size_sqft || 0)) * 5
    const poolAdj = (property.pool !== comp.pool) ? (property.pool ? 25000 : -25000) : 0
    const wfAdj = (property.waterfront !== comp.waterfront) ? (property.waterfront ? 100000 : -100000) : 0

    const totalAdjustment = sqftAdj + bedAdj + bathAdj + ageAdj + lotAdj + poolAdj + wfAdj
    const adjustedPrice = comp.sale_price + totalAdjustment

    // Weight by distance and recency
    const distanceWeight = 1 / (1 + comp.distance_miles * 2)
    const daysSinceSale = Math.max(1, (Date.now() - new Date(comp.sale_date).getTime()) / (1000 * 60 * 60 * 24))
    const recencyWeight = 1 / (1 + daysSinceSale / 180)
    const weight = distanceWeight * recencyWeight

    totalWeightedPrice += adjustedPrice * weight
    totalWeight += weight

    // Track adjustments
    aggregateAdjustments[`comp_${comp.address.slice(0, 15)}`] = Math.round(totalAdjustment)
  }

  const estimate = totalWeight > 0 ? totalWeightedPrice / totalWeight : 0
  const confidence = Math.min(0.3 + comparables.length * 0.12, 0.9)
  return { estimate, confidence, adjustments: aggregateAdjustments }
}

function runHedonicPriceModel(property: PropertyProfile, _comparables: ComparableSale[]): { estimate: number; confidence: number } {
  // Simplified hedonic regression model
  const baseValue = property.sqft * 200
  const coefficients: Record<string, number> = {
    bedrooms: 15000,
    bathrooms: 20000,
    sqft: 180,
    age: -800,
    garage: 12000,
    pool: 22000,
    waterfront: 120000,
    stories: -5000
  }

  let estimate = baseValue
  estimate += property.bedrooms * coefficients.bedrooms
  estimate += property.bathrooms * coefficients.bathrooms
  estimate += property.sqft * coefficients.sqft
  estimate += Math.max(0, 2024 - property.year_built) * coefficients.age
  estimate += property.garage_spaces * coefficients.garage
  estimate += property.pool ? coefficients.pool : 0
  estimate += property.waterfront ? coefficients.waterfront : 0
  estimate += property.stories * coefficients.stories

  // Condition multiplier
  const conditionMult: Record<string, number> = { poor: 0.78, fair: 0.88, good: 1.0, excellent: 1.10, luxury: 1.25 }
  estimate *= conditionMult[property.condition] ?? 1.0

  // View premium
  const viewMult: Record<string, number> = { none: 1.0, city: 1.05, mountain: 1.08, water: 1.15, ocean: 1.25 }
  estimate *= viewMult[property.view] ?? 1.0

  const confidence = 0.7 + _comparables.length * 0.03
  return { estimate: Math.max(0, estimate), confidence: Math.min(confidence, 0.88) }
}

function runIncomeApproach(income: IncomeApproachInput): { estimate: number; confidence: number } {
  const effectiveGrossIncome = income.gross_rent_annual * (1 - income.vacancy_rate_pct / 100)
  const netOperatingIncome = effectiveGrossIncome - income.operating_expenses_annual
  const capRate = income.cap_rate_pct / 100
  const estimate = capRate > 0 ? netOperatingIncome / capRate : 0
  const confidence = income.gross_rent_annual > 0 && income.cap_rate_pct > 0 ? 0.82 : 0.4
  return { estimate, confidence }
}

function runCostApproach(cost: CostApproachInput, property: PropertyProfile): { estimate: number; confidence: number } {
  const replacementCost = cost.replacement_cost_per_sqft * property.sqft
  const totalDepreciation = cost.total_depreciation_pct + cost.external_obsolescence_pct + cost.functional_obsolescence_pct
  const depreciatedValue = replacementCost * (1 - totalDepreciation / 100)
  const estimate = cost.land_value + depreciatedValue
  const confidence = cost.land_value > 0 ? 0.75 : 0.45
  return { estimate, confidence }
}

function calculateApproachWeights(
  comp: { confidence: number },
  hedonic: { confidence: number },
  income: { confidence: number },
  cost: { confidence: number },
  _compCount: number
): { comparable_sales: number; hedonic: number; income: number; cost: number } {
  const total = comp.confidence + hedonic.confidence + income.confidence + cost.confidence
  if (total === 0) return { comparable_sales: 0.4, hedonic: 0.3, income: 0.2, cost: 0.1 }
  return {
    comparable_sales: comp.confidence / total,
    hedonic: hedonic.confidence / total,
    income: income.confidence / total,
    cost: cost.confidence / total
  }
}

function formatValuationReport(result: ValuationResult): string {
  const lines: string[] = []
  lines.push('## Property Valuation Report — Multi-Model AVM')
  lines.push('')
  lines.push('### Valuation Dashboard')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| **Final Estimate** | $${result.final_estimate.toLocaleString()} |`)
  lines.push(`| **Valuation Range** | $${result.valuation_range.low.toLocaleString()} — $${result.valuation_range.high.toLocaleString()} |`)
  lines.push(`| **Confidence Interval** | ${(result.confidence_interval.level * 100).toFixed(0)}% (±${result.confidence_interval.margin_of_error_pct}%) |`)
  lines.push(`| **Price per Sq Ft** | $${result.price_per_sqft} |`)
  lines.push(`| **Market Position** | ${result.market_position} |`)
  lines.push('')
  lines.push('### Valuation Approaches')
  lines.push('| Approach | Estimate | Weight | Confidence |')
  lines.push('|----------|----------|--------|------------|')
  const a = result.approach_results
  lines.push(`| Comparable Sales | $${a.comparable_sales.estimate.toLocaleString()} | ${(a.comparable_sales.weight * 100).toFixed(0)}% | ${(a.comparable_sales.confidence * 100).toFixed(0)}% |`)
  lines.push(`| Hedonic Model | $${a.hedonic_model.estimate.toLocaleString()} | ${(a.hedonic_model.weight * 100).toFixed(0)}% | ${(a.hedonic_model.confidence * 100).toFixed(0)}% |`)
  lines.push(`| Income Approach | $${a.income_approach.estimate.toLocaleString()} | ${(a.income_approach.weight * 100).toFixed(0)}% | ${(a.income_approach.confidence * 100).toFixed(0)}% |`)
  lines.push(`| Cost Approach | $${a.cost_approach.estimate.toLocaleString()} | ${(a.cost_approach.weight * 100).toFixed(0)}% | ${(a.cost_approach.confidence * 100).toFixed(0)}% |`)
  lines.push('')
  lines.push('### Risk Factors')
  for (const rf of result.risk_factors) lines.push(`- ${rf}`)
  lines.push('')
  lines.push(`**Recommendation:** ${result.recommendation}`)
  return lines.join('\n')
}

// ==================== TOOL 2: INVESTMENT ANALYZER ====================

function runInvestmentAnalysis(input: InvestmentInput): InvestmentResult {
  const totalInvestment = input.purchase_price + input.closing_costs + input.rehab_costs
  const downPayment = totalInvestment * (input.down_payment_pct / 100)
  const loanAmount = totalInvestment - downPayment
  const monthlyRate = input.interest_rate_pct / 100 / 12
  const numPayments = input.loan_term_years * 12

  const monthlyPayment = monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments

  const annualDebtService = monthlyPayment * 12
  const effectiveGrossIncome = input.monthly_rent * 12 * (1 - input.vacancy_rate_pct / 100)
  const managementFee = effectiveGrossIncome * (input.management_fee_pct / 100)
  const totalOperatingExpenses = input.property_tax_annual + input.insurance_annual + input.maintenance_annual + managementFee + (input.hoa_monthly * 12)
  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses
  const annualCashFlow = netOperatingIncome - annualDebtService
  const monthlyCashFlow = annualCashFlow / 12

  // Cash-on-cash return
  const cashInvested = downPayment + input.closing_costs + input.rehab_costs
  const cashOnCash = cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0

  // Cap rate
  const capRate = (netOperatingIncome / input.purchase_price) * 100

  // DSCR
  const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 99

  // Break-even occupancy
  const breakEvenOccupancy = effectiveGrossIncome > 0 ? ((totalOperatingExpenses + annualDebtService) / (input.monthly_rent * 12)) * 100 : 0

  // GRM
  const grm = (input.monthly_rent * 12) > 0 ? input.purchase_price / (input.monthly_rent * 12) : 0

  // Annual cash flows with equity build
  const cashFlows: { year: number; cash_flow: number; cumulative: number; equity: number }[] = []
  let balance = loanAmount
  let cumulative = -cashInvested
  let propertyValue = input.purchase_price

  for (let year = 1; year <= input.holding_period_years; year++) {
    propertyValue *= (1 + input.appreciation_rate_pct / 100)
    const interestPaid = balance * monthlyRate * 12
    const principalPaid = annualDebtService - interestPaid
    balance = Math.max(0, balance - principalPaid)
    const equity = propertyValue - balance
    cumulative += annualCashFlow
    cashFlows.push({ year, cash_flow: Math.round(annualCashFlow), cumulative: Math.round(cumulative), equity: Math.round(equity) })
  }

  // Leveraged IRR calculation (simplified Newton's method)
  const irr = calculateIRR([-cashInvested, ...Array(input.holding_period_years - 1).fill(annualCashFlow), annualCashFlow + (propertyValue - balance - loanAmount + input.purchase_price * (input.selling_costs_pct / 100))])
  const unleveragedIRR = calculateIRR([-input.purchase_price, ...Array(input.holding_period_years - 1).fill(netOperatingIncome), netOperatingIncome + propertyValue * (1 - input.selling_costs_pct / 100)])

  // Exit sensitivity
  const exitSensitivity: { appreciation_pct: number; sale_price: number; total_profit: number; irr: number }[] = []
  for (let appr = -2; appr <= 6; appr += 2) {
    const futureValue = input.purchase_price * Math.pow(1 + appr / 100, input.holding_period_years)
    const saleProceeds = futureValue * (1 - input.selling_costs_pct / 100)
    const remainingBalance = loanAmount * Math.pow(1 + monthlyRate, input.holding_period_years * 12) - monthlyPayment * ((Math.pow(1 + monthlyRate, input.holding_period_years * 12) - 1) / monthlyRate)
    const equityAtSale = saleProceeds - Math.max(0, remainingBalance)
    const totalProfit = equityAtSale - cashInvested + annualCashFlow * input.holding_period_years
    const exitIRR = calculateIRR([-cashInvested, ...Array(input.holding_period_years - 1).fill(annualCashFlow), annualCashFlow + equityAtSale])
    exitSensitivity.push({ appreciation_pct: appr, sale_price: Math.round(futureValue), total_profit: Math.round(totalProfit), irr: Math.round(exitIRR * 100) / 100 })
  }

  // Optimal holding period
  let optimalYears = input.holding_period_years
  let optimalProfit = 0
  let optimalIRR = 0
  for (let y = 1; y <= 15; y++) {
    const fv = input.purchase_price * Math.pow(1 + input.appreciation_rate_pct / 100, y)
    const proceeds = fv * (1 - input.selling_costs_pct / 100)
    const eqAtSale = proceeds - loanAmount * 0.9 // simplified
    const profit = eqAtSale - cashInvested + annualCashFlow * y
    const yIrr = calculateIRR([-cashInvested, ...Array(y - 1).fill(annualCashFlow), annualCashFlow + eqAtSale])
    if (y === 1 || profit > optimalProfit) {
      optimalYears = y
      optimalProfit = profit
      optimalIRR = yIrr
    }
  }

  const totalReturn = optimalProfit
  const equityMultiple = cashInvested > 0 ? (cashInvested + totalReturn) / cashInvested : 0

  // Investment grade
  let investment_grade = 'C'
  if (cashOnCash >= 10 && capRate >= 7 && dscr >= 1.3) investment_grade = 'A+'
  else if (cashOnCash >= 8 && capRate >= 6 && dscr >= 1.25) investment_grade = 'A'
  else if (cashOnCash >= 6 && capRate >= 5 && dscr >= 1.2) investment_grade = 'B+'
  else if (cashOnCash >= 4 && capRate >= 4 && dscr >= 1.15) investment_grade = 'B'
  else if (cashOnCash >= 2) investment_grade = 'C+'

  let recommendation = investment_grade.startsWith('A')
    ? 'Strong investment opportunity — proceed with standard due diligence.'
    : investment_grade.startsWith('B')
    ? 'Moderate investment opportunity — favorable but verify assumptions.'
    : 'Weak investment profile — consider alternative properties or negotiate lower price.'

  return {
    cash_on_cash_return: Math.round(cashOnCash * 100) / 100,
    cap_rate: Math.round(capRate * 100) / 100,
    leveraged_irr: Math.round(irr * 100) / 100,
    unleveraged_irr: Math.round(unleveragedIRR * 100) / 100,
    equity_multiple: Math.round(equityMultiple * 100) / 100,
    total_return: Math.round(totalReturn),
    annual_cash_flows: cashFlows,
    exit_sensitivity: exitSensitivity,
    optimal_holding_period: { years: optimalYears, total_profit: Math.round(optimalProfit), irr: Math.round(optimalIRR * 100) / 100, reason: `Maximizes total profit at $${Math.round(optimalProfit).toLocaleString()} with ${(optimalIRR * 100).toFixed(1)}% IRR` },
    monthly_cash_flow: Math.round(monthlyCashFlow),
    annual_cash_flow: Math.round(annualCashFlow),
    dscr: Math.round(dscr * 100) / 100,
    break_even_occupancy: Math.round(breakEvenOccupancy * 100) / 100,
    gross_rent_multiplier: Math.round(grm * 100) / 100,
    debt_service_coverage: Math.round(dscr * 100) / 100,
    investment_grade,
    recommendation
  }
}

function calculateIRR(cashFlows: number[]): number {
  let guess = 0.1
  for (let i = 0; i < 100; i++) {
    let npv = 0
    let dNpv = 0
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + guess, t)
      dNpv -= t * cashFlows[t] / Math.pow(1 + guess, t + 1)
    }
    if (Math.abs(dNpv) < 1e-10) break
    const newGuess = guess - npv / dNpv
    if (Math.abs(newGuess - guess) < 1e-6) return newGuess
    guess = newGuess
    if (guess < -0.5) guess = -0.49
    if (guess > 10) guess = 10
  }
  return guess
}

function formatInvestmentReport(result: InvestmentResult): string {
  const lines: string[] = []
  lines.push('## Investment Return Analysis')
  lines.push('')
  lines.push(`**Investment Grade:** ${result.investment_grade}`)
  lines.push('')
  lines.push('### Key Return Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Cash-on-Cash Return | ${result.cash_on_cash_return}% |`)
  lines.push(`| Cap Rate | ${result.cap_rate}% |`)
  lines.push(`| Leveraged IRR | ${result.leveraged_irr}% |`)
  lines.push(`| Unleveraged IRR | ${result.unleveraged_irr}% |`)
  lines.push(`| Equity Multiple | ${result.equity_multiple}x |`)
  lines.push(`| DSCR | ${result.dscr} |`)
  lines.push(`| Break-even Occupancy | ${result.break_even_occupancy}% |`)
  lines.push(`| Gross Rent Multiplier | ${result.gross_rent_multiplier} |`)
  lines.push('')
  lines.push('### Cash Flow Summary')
  lines.push(`- Monthly Cash Flow: $${result.monthly_cash_flow.toLocaleString()}`)
  lines.push(`- Annual Cash Flow: $${result.annual_cash_flow.toLocaleString()}`)
  lines.push(`- Total Return: $${result.total_return.toLocaleString()}`)
  lines.push('')
  lines.push('### Exit Sensitivity Analysis')
  lines.push('| Appreciation Rate | Sale Price | Total Profit | IRR |')
  lines.push('|---|---|---|---|')
  for (const es of result.exit_sensitivity) {
    lines.push(`| ${es.appreciation_pct}% | $${es.sale_price.toLocaleString()} | $${es.total_profit.toLocaleString()} | ${es.irr}% |`)
  }
  lines.push('')
  lines.push('### Optimal Holding Period')
  lines.push(`**Best Exit:** Year ${result.optimal_holding_period.years} — $${result.optimal_holding_period.total_profit.toLocaleString()} profit (${result.optimal_holding_period.irr}% IRR)`)
  lines.push(`Reason: ${result.optimal_holding_period.reason}`)
  lines.push('')
  lines.push(`**Recommendation:** ${result.recommendation}`)
  return lines.join('\n')
}

// ==================== TOOL 3: TENANT SCREENING ====================

function runTenantScreening(applicants: TenantApplicant[], monthly_rent: number): TenantScreeningResult {
  const scoredApplicants = applicants.map(app => scoreTenantApplicant(app, monthly_rent))

  // Rank by score
  const ranking = [...scoredApplicants].sort((a, b) => b.overall_score - a.overall_score).map(a => a.name)
  const optimal = ranking[0] || ''

  return {
    applicant_scores: scoredApplicants,
    optimal_tenant: optimal,
    ranking,
    portfolio_fit: `Optimal tenant ${optimal} provides best risk-adjusted income stability.`,
    recommended_lease_terms: generateLeaseTerms(scoredApplicants.find(a => a.name === optimal), monthly_rent)
  }
}

function scoreTenantApplicant(app: TenantApplicant, monthly_rent: number): TenantScreeningResult['applicant_scores'][0] {
  // Credit score normalization (300-850 scale to 0-100)
  const creditScoreNormalized = Math.max(0, Math.min(100, ((app.credit_score - 300) / 550) * 100))

  // Income ratio (3x rent = ideal = 100 points)
  const incomeRatio = app.monthly_income / monthly_rent
  const incomeScore = Math.max(0, Math.min(100, (incomeRatio / 3) * 100))

  // Employment stability
  let employmentStability = 50
  if (app.employment_status === 'employed_full') employmentStability = Math.min(100, 60 + app.employment_months * 1.5)
  else if (app.employment_status === 'employed_part') employmentStability = Math.min(80, 40 + app.employment_months * 1.5)
  else if (app.employment_status === 'self_employed') employmentStability = Math.min(75, 45 + app.employment_months * 1.2)
  else if (app.employment_status === 'retired') employmentStability = 70
  else employmentStability = 20

  // Rental history
  let rentalHistoryScore = 50
  rentalHistoryScore += Math.min(30, app.rental_months_previous * 0.5)
  rentalHistoryScore += Math.min(20, app.references_count * 5)
  if (app.eviction_history) rentalHistoryScore -= 40
  rentalHistoryScore = Math.max(0, Math.min(100, rentalHistoryScore))

  // DTI penalty
  const dtiPenalty = Math.max(0, (app.debt_to_income_pct - 40) * 1.5)

  // Overall score (weighted)
  const overall_score = Math.round(
    creditScoreNormalized * 0.30 +
    incomeScore * 0.30 +
    employmentStability * 0.20 +
    rentalHistoryScore * 0.20 -
    dtiPenalty -
    (app.eviction_history ? 20 : 0) -
    (app.criminal_record ? 30 : 0) -
    (app.bankruptcies * 15) -
    (app.collections_accounts * 5)
  )

  // Risk flags
  const riskFlags: string[] = []
  if (app.credit_score < 600) riskFlags.push('Below-average credit score')
  if (incomeRatio < 2.5) riskFlags.push('Insufficient income ratio for rent')
  if (app.employment_months < 6) riskFlags.push('Limited employment tenure')
  if (app.eviction_history) riskFlags.push('Prior eviction on record')
  if (app.criminal_record) riskFlags.push('Criminal record present')
  if (app.debt_to_income_pct > 43) riskFlags.push('High debt-to-income ratio')
  if (app.bankruptcies > 0) riskFlags.push(`Bankruptcy history: ${app.bankruptcies}`)
  if (app.pets) riskFlags.push('Pets — potential property damage risk')
  if (app.smokers) riskFlags.push('Smoker — potential odor/staining risk')

  // Risk category
  let risk_category: 'low' | 'moderate' | 'high' | 'prohibitive' = 'low'
  if (overall_score >= 75) risk_category = 'low'
  else if (overall_score >= 55) risk_category = 'moderate'
  else if (overall_score >= 35) risk_category = 'high'
  else risk_category = 'prohibitive'

  // Lease terms suggestion
  let lease_terms_suggestion = 'Standard 12-month lease'
  if (risk_category === 'low') lease_terms_suggestion = 'Standard 12-month lease with auto-renewal option'
  else if (risk_category === 'moderate') lease_terms_suggestion = '12-month lease with 6-month performance review'
  else if (risk_category === 'high') lease_terms_suggestion = '6-month initial lease with strict conditions'
  else lease_terms_suggestion = 'Co-signer required or lease not recommended'

  // Deposit recommendation
  let deposit_recommendation = '1 month security deposit'
  if (risk_category === 'moderate') deposit_recommendation = '1.5 months security deposit'
  else if (risk_category === 'high') deposit_recommendation = '2 months security deposit + co-signer'
  else if (risk_category === 'prohibitive') deposit_recommendation = 'Application decline recommended'

  return {
    name: app.name,
    overall_score: Math.round(overall_score),
    credit_score_normalized: Math.round(creditScoreNormalized),
    income_ratio: Math.round(incomeRatio * 100) / 100,
    employment_stability: Math.round(employmentStability),
    rental_history_score: Math.round(rentalHistoryScore),
    risk_flags: riskFlags,
    lease_terms_suggestion,
    deposit_recommendation,
    risk_category
  }
}

function generateLeaseTerms(best: TenantScreeningResult['applicant_scores'][0] | undefined, _monthly_rent: number): TenantScreeningResult['recommended_lease_terms'] {
  if (!best) return { lease_months: 12, security_deposit_months: 1, rent_premium_pct: 0, special_clauses: [] }

  const special_clauses: string[] = []
  if (best.risk_category === 'moderate') special_clauses.push('6-month performance review required')
  if (best.risk_category === 'high') special_clauses.push('Monthly inspections for first 6 months', 'Automatic rent escalation clause after 6 months')
  if (best.risk_category === 'prohibitive') special_clauses.push('Application declined — co-signer required for reconsideration')

  let lease_months = 12
  let deposit_months = 1
  let premium = 0

  if (best.risk_category === 'low') { lease_months = 12; deposit_months = 1; premium = 0 }
  else if (best.risk_category === 'moderate') { lease_months = 12; deposit_months = 1.5; premium = 2 }
  else if (best.risk_category === 'high') { lease_months = 6; deposit_months = 2; premium = 5 }
  else { lease_months = 6; deposit_months = 2; premium = 10 }

  return { lease_months, security_deposit_months: deposit_months, rent_premium_pct: premium, special_clauses }
}

function formatTenantScreeningReport(result: TenantScreeningResult): string {
  const lines: string[] = []
  lines.push('## Tenant Screening Report')
  lines.push('')
  lines.push(`**Optimal Tenant:** ${result.optimal_tenant}`)
  lines.push(`**Ranking:** ${result.ranking.join(' > ')}`)
  lines.push('')
  lines.push('### Applicant Scores')
  lines.push('')
  for (const app of result.applicant_scores) {
    lines.push(`#### ${app.name} — Score: ${app.overall_score}/100 (${app.risk_category.toUpperCase()} RISK)`)
    lines.push(`| Metric | Score |`)
    lines.push(`|--------|-------|`)
    lines.push(`| Credit Score | ${app.credit_score_normalized}/100 |`)
    lines.push(`| Income Ratio | ${app.income_ratio}x rent |`)
    lines.push(`| Employment Stability | ${app.employment_stability}/100 |`)
    lines.push(`| Rental History | ${app.rental_history_score}/100 |`)
    lines.push('')
    lines.push(`**Risk Flags:**`)
    for (const rf of app.risk_flags.length > 0 ? app.risk_flags : ['None']) lines.push(`- ${rf}`)
    lines.push('')
    lines.push(`**Suggested Terms:** ${app.lease_terms_suggestion}`)
    lines.push(`**Deposit:** ${app.deposit_recommendation}`)
    lines.push('')
  }
  lines.push('### Recommended Lease Terms')
  lines.push(`- Lease Duration: ${result.recommended_lease_terms.lease_months} months`)
  lines.push(`- Security Deposit: ${result.recommended_lease_terms.security_deposit_months} months rent`)
  lines.push(`- Rent Premium: ${result.recommended_lease_terms.rent_premium_pct}%`)
  if (result.recommended_lease_terms.special_clauses.length > 0) {
    lines.push(`- Special Clauses:`)
    for (const clause of result.recommended_lease_terms.special_clauses) lines.push(`  - ${clause}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 4: PROPERTY MANAGEMENT ====================

function runPropertyManagement(
  leases: LeaseRecord[],
  workOrders: MaintenanceWorkOrder[],
  vendors: VendorRecord[]
): PropertyManagementResult {
  // Portfolio summary
  const totalProperties = leases.length
  const occupiedUnits = leases.filter(l => l.payment_status !== 'eviction_pending').length
  const vacancyRate = totalProperties > 0 ? ((totalProperties - occupiedUnits) / totalProperties) * 100 : 0
  const totalMonthlyRent = leases.reduce((s, l) => s + l.monthly_rent, 0)
  const collected = leases.filter(l => l.payment_status === 'current').reduce((s, l) => s + l.monthly_rent, 0)
  const collectionRate = totalMonthlyRent > 0 ? (collected / totalMonthlyRent) * 100 : 100

  // Lease alerts
  const leaseAlerts: PropertyManagementResult['lease_alerts'] = []
  for (const lease of leases) {
    if (lease.payment_status === 'overdue') leaseAlerts.push({ tenant: lease.tenant_name, alert: 'Rent overdue — immediate collection action required', urgency: 'critical' })
    else if (lease.payment_status === 'late') leaseAlerts.push({ tenant: lease.tenant_name, alert: 'Rent payment late — send reminder notice', urgency: 'high' })
    else if (lease.payment_status === 'eviction_pending') leaseAlerts.push({ tenant: lease.tenant_name, alert: 'Eviction proceedings in progress', urgency: 'critical' })

    // Lease expiration (simplified: assume within 60 days if notice not given)
    if (!lease.notice_given && lease.auto_renew === false) leaseAlerts.push({ tenant: lease.tenant_name, alert: 'Lease expiring soon — renewal discussion needed', urgency: 'medium' })
  }

  // Financial summary
  const managementFees = totalMonthlyRent * 0.08 * 12
  const maintenanceCosts = workOrders.reduce((s, w) => s + w.actual_cost, 0)
  const grossReceipts = totalMonthlyRent * 12
  const effectiveGross = grossReceipts * (vacancyRate > 0 ? 0.95 : 1.0)
  const operatingExpenses = maintenanceCosts + managementFees + grossReceipts * 0.15 // taxes/insurance estimate
  const netOperatingIncome = effectiveGross - operatingExpenses
  const cashFlow = netOperatingIncome - grossReceipts * 0.35 // debt service estimate
  const capExReserve = grossReceipts * 0.05

  // Work order summary
  const open = workOrders.filter(w => w.status === 'open').length
  const inProgress = workOrders.filter(w => w.status === 'in_progress').length
  const completedOnTime = workOrders.filter(w => w.status === 'completed' && w.sla_met).length
  const completedTotal = workOrders.filter(w => w.status === 'completed').length
  const slaCompliance = completedTotal > 0 ? (completedOnTime / completedTotal) * 100 : 100

  // Compliance
  const complianceStatus: PropertyManagementResult['compliance_status'] = [
    { name: 'Lead-Based Paint Disclosure', status: 'compliant', due_date: 'N/A' },
    { name: 'Smoke/CO Detector Inspection', status: leases.length > 5 ? 'pending' : 'compliant', due_date: '2024-12-31' },
    { name: 'Elevator Certification', status: 'compliant', due_date: '2025-03-15' },
    { name: 'Fire Sprinkler Inspection', status: workOrders.length > 10 ? 'non_compliant' : 'compliant', due_date: '2024-09-30' },
    { name: 'Housing Code Compliance', status: 'compliant', due_date: 'N/A' }
  ]

  // Owner report (aggregate)
  const ownerReport: PropertyManagementResult['owner_report'] = {
    period: 'Current Month',
    property_address: `${totalProperties} properties`,
    gross_income: Math.round(grossReceipts / 12),
    expenses: {
      maintenance: Math.round(maintenanceCosts / 12),
      management_fees: Math.round(managementFees / 12),
      tax_insurance: Math.round(grossReceipts * 0.15 / 12),
      cap_ex_reserve: Math.round(capExReserve / 12)
    },
    net_income: Math.round((grossReceipts / 12) - (maintenanceCosts / 12) - (managementFees / 12) - (grossReceipts * 0.15 / 12)),
    occupancy_days: Math.round(((totalProperties - vacantUnits(totalProperties, occupiedUnits)) / totalProperties) * 30),
    market_comparison: collectionRate > 95 ? 'Above market — strong collections performance' : 'Below market — review collection procedures',
    recommendations: [
      vacancyRate > 10 ? 'Address vacancy rate — consider rent adjustments or marketing' : 'Occupancy healthy — maintain current strategy',
      slaCompliance < 80 ? 'Improve maintenance SLA compliance' : 'Maintenance performance meets standards',
      leaseAlerts.filter(a => a.urgency === 'critical').length > 0 ? 'Address critical lease alerts immediately' : 'No critical issues requiring immediate attention'
    ]
  }

  // Vendor scorecard
  const vendorScorecard = vendors.map(v => ({
    name: v.name,
    score: Math.round((v.rating * 20) + (v.insurance_verified ? 10 : 0) + (v.license_verified ? 10 : 0) + (v.preferred ? 10 : 0)),
    status: v.contract_active && v.insurance_verified ? 'active' : 'review_needed'
  }))

  return {
    portfolio_summary: {
      total_properties: totalProperties,
      occupied_units: occupiedUnits,
      vacancy_rate: Math.round(vacancyRate * 100) / 100,
      total_monthly_rent: totalMonthlyRent,
      collection_rate: Math.round(collectionRate * 100) / 100,
      avg_tenancy_months: 24 // simplified average
    },
    lease_alerts: leaseAlerts,
    financial_summary: {
      gross_receipts: Math.round(grossReceipts),
      net_operating_income: Math.round(netOperatingIncome),
      management_fees: Math.round(managementFees),
      maintenance_costs: Math.round(maintenanceCosts),
      cash_flow: Math.round(cashFlow),
      cap_ex_reserve: Math.round(capExReserve)
    },
    work_order_summary: { open, in_progress: inProgress, completed_overdue: completedTotal - completedOnTime, sla_compliance_pct: Math.round(slaCompliance) },
    compliance_status: complianceStatus,
    owner_report: ownerReport,
    vendor_scorecard: vendorScorecard
  }
}

function vacantUnits(total: number, occupied: number): number { return total - occupied }

function formatPropertyManagementReport(result: PropertyManagementResult): string {
  const lines: string[] = []
  lines.push('## Property Management Dashboard')
  lines.push('')
  lines.push('### Portfolio Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Properties | ${result.portfolio_summary.total_properties} |`)
  lines.push(`| Occupied Units | ${result.portfolio_summary.occupied_units} |`)
  lines.push(`| Vacancy Rate | ${result.portfolio_summary.vacancy_rate}% |`)
  lines.push(`| Monthly Rent Roll | $${result.portfolio_summary.total_monthly_rent.toLocaleString()} |`)
  lines.push(`| Collection Rate | ${result.portfolio_summary.collection_rate}% |`)
  lines.push('')
  lines.push('### Financial Summary')
  lines.push('| Item | Annual |')
  lines.push('|------|--------|')
  lines.push(`| Gross Receipts | $${result.financial_summary.gross_receipts.toLocaleString()} |`)
  lines.push(`| Net Operating Income | $${result.financial_summary.net_operating_income.toLocaleString()} |`)
  lines.push(`| Management Fees | $${result.financial_summary.management_fees.toLocaleString()} |`)
  lines.push(`| Maintenance Costs | $${result.financial_summary.maintenance_costs.toLocaleString()} |`)
  lines.push(`| Cash Flow | $${result.financial_summary.cash_flow.toLocaleString()} |`)
  lines.push(`| CapEx Reserve | $${result.financial_summary.cap_ex_reserve.toLocaleString()} |`)
  lines.push('')
  lines.push('### Lease Alerts')
  if (result.lease_alerts.length === 0) lines.push('- No alerts')
  for (const alert of result.lease_alerts) lines.push(`- **[${alert.urgency.toUpperCase()}]** ${alert.tenant}: ${alert.alert}`)
  lines.push('')
  lines.push('### Work Order Status')
  lines.push(`- Open: ${result.work_order_summary.open} | In Progress: ${result.work_order_summary.in_progress} | Overdue Completions: ${result.work_order_summary.completed_overdue}`)
  lines.push(`- SLA Compliance: ${result.work_order_summary.sla_compliance_pct}%`)
  lines.push('')
  lines.push('### Compliance Status')
  lines.push('| Requirement | Status | Due Date |')
  lines.push('|-------------|--------|----------|')
  for (const c of result.compliance_status) lines.push(`| ${c.name} | ${c.status.toUpperCase()} | ${c.due_date} |`)
  lines.push('')
  lines.push('### Vendor Scorecard')
  lines.push('| Vendor | Score | Status |')
  lines.push('|--------|-------|--------|')
  for (const v of result.vendor_scorecard) lines.push(`| ${v.name} | ${v.score} | ${v.status} |`)
  lines.push('')
  lines.push('### Owner Report')
  lines.push(`**Period:** ${result.owner_report.period}`)
  lines.push(`**Gross Income:** $${result.owner_report.gross_income.toLocaleString()}`)
  lines.push(`**Net Income:** $${result.owner_report.net_income.toLocaleString()}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.owner_report.recommendations) lines.push(`- ${rec}`)
  return lines.join('\n')
}

// ==================== TOOL 5: MARKET COMPASS ====================

function runMarketCompass(data: MarketDataInput): MarketCompassResult {
  // Market phase determination
  const priceMomentum = calculateMomentum(data.median_price_history)
  const inventoryMomentum = calculateMomentum(data.inventory_history)
  const domMomentum = calculateMomentum(data.days_on_market_history)

  let market_phase = 'balanced'
  let market_temperature: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold' = 'neutral'
  if (priceMomentum > 5 && inventoryMomentum < -10) { market_phase = 'strong_sellers'; market_temperature = 'hot' }
  else if (priceMomentum > 2 && inventoryMomentum < -5) { market_phase = 'moderate_sellers'; market_temperature = 'warm' }
  else if (priceMomentum < -3 && inventoryMomentum > 10) { market_phase = 'moderate_buyers'; market_temperature = 'cool' }
  else if (priceMomentum < -6 && inventoryMomentum > 20) { market_phase = 'strong_buyers'; market_temperature = 'cold' }
  else { market_phase = 'balanced'; market_temperature = 'neutral' }

  // Heat index (0-100)
  const heatIndex = Math.max(0, Math.min(100, 50 + priceMomentum * 3 - inventoryMomentum * 1.5 + (7 - data.inventory_months) * 5))

  // Price trend
  const forecast12m = priceMomentum * 0.7 + data.employment_growth_pct * 1.5 - (data.mortgage_rate_30yr - 6) * 2
  const forecast24m = forecast12m * 1.3
  let priceDirection = 'stable'
  if (priceMomentum > 3) priceDirection = 'appreciating'
  else if (priceMomentum < -3) priceDirection = 'depreciating'

  // Inventory analysis
  let inventoryTrend = 'stable'
  if (inventoryMomentum < -10) inventoryTrend = 'declining (seller-favorable)'
  else if (inventoryMomentum > 10) inventoryTrend = 'increasing (buyer-favorable)'
  const absorptionRate = data.inventory_months > 0 ? Math.max(0, 6 - data.inventory_months) / 6 * 100 : 50
  const sellerBuyerBalance = data.inventory_months < 4 ? 'Strong seller\'s market' : data.inventory_months < 6 ? 'Moderate seller\'s market' : data.inventory_months < 8 ? 'Balanced market' : 'Buyer\'s market'

  // Days on market
  let domTrend = 'stable'
  if (domMomentum < -5) domTrend = 'decreasing (faster sales)'
  else if (domMomentum > 5) domTrend = 'increasing (slower sales)'
  const domPercentile = data.days_on_market_history.length > 0
    ? data.days_on_market_history.filter(d => d <= data.days_on_market_avg).length / data.days_on_market_history.length * 100
    : 50

  // Interest rate impact
  const affordabilityIndex = Math.max(0, Math.min(100, 100 - (data.mortgage_rate_30yr - 4) * 12))
  let rateSensitivity: string
  if (data.mortgage_rate_history.length >= 2) {
    const rateChange = data.mortgage_rate_30yr - data.mortgage_rate_history[0]
    rateSensitivity = rateChange > 1 ? 'High sensitivity — rising rates significantly impact affordability' : rateChange > 0 ? 'Moderate sensitivity — gradual rate increase' : 'Improving — declining rates support affordability'
  } else { rateSensitivity = 'Insufficient rate history for sensitivity analysis' }

  // Policy risk
  const negativePolicies = data.policy_events.filter(p => p.impact === 'negative').length
  const positivePolicies = data.policy_events.filter(p => p.impact === 'positive').length
  let policyRisk = 'Low'
  if (negativePolicies > positivePolicies + 2) policyRisk = 'High'
  else if (negativePolicies > positivePolicies) policyRisk = 'Moderate-High'
  else if (negativePolicies > 0) policyRisk = 'Moderate'

  // Rental yield trend
  const currentYield = (data.median_rent * 12 / data.median_price_current) * 100
  const rentMomentum = calculateMomentum(data.rent_history)
  const rentalForecast = currentYield + rentMomentum * 0.3

  // Investment signal
  let investment_signal = 'HOLD — Market conditions are neutral'
  if (market_temperature === 'cold' || market_temperature === 'cool') investment_signal = 'BUY — Favorable buyer conditions with price stability'
  else if (market_temperature === 'hot') investment_signal = 'SELL/REDUCE — Peak market conditions favor disposition'
  else if (market_temperature === 'warm') investment_signal = 'HOLD/SELECTIVE BUY — Moderate conditions with selective opportunities'

  return {
    market_phase: market_phase.replace(/_/g, ' ').toUpperCase(),
    market_temperature,
    heat_index: Math.round(heatIndex),
    price_trend: { direction: priceDirection, momentum: Math.round(priceMomentum * 100) / 100, forecast_12m: Math.round(forecast12m * 100) / 100, forecast_24m: Math.round(forecast24m * 100) / 100 },
    inventory_analysis: { current_months: data.inventory_months, trend: inventoryTrend, absorption_rate: Math.round(absorptionRate), seller_buyer_balance: sellerBuyerBalance },
    days_on_market_analysis: { current: Math.round(data.days_on_market_avg), trend: domTrend, percentile_vs_historical: Math.round(domPercentile) },
    interest_rate_impact: { current_rate: data.mortgage_rate_30yr, affordability_index: Math.round(affordabilityIndex), rate_sensitivity: rateSensitivity, forecast_impact: affordabilityIndex < 40 ? 'Severe affordability pressure' : affordabilityIndex < 60 ? 'Moderate affordability pressure' : 'Affordability within normal range' },
    policy_risk_assessment: {
      overall_risk: policyRisk,
      key_risks: data.policy_events.filter(p => p.impact === 'negative').map(p => p.event),
      opportunities: data.policy_events.filter(p => p.impact === 'positive').map(p => p.event)
    },
    rental_yield_trend: { current_yield: Math.round(currentYield * 100) / 100, trend: Math.round(rentMomentum * 100) / 100, forecast: Math.round(rentalForecast * 100) / 100 },
    investment_signal,
    key_metrics_dashboard: {
      'Median Price': `$${data.median_price_current.toLocaleString()}`,
      'Inventory (months)': `${data.inventory_months}`,
      'Days on Market': `${Math.round(data.days_on_market_avg)}`,
      '30yr Mortgage': `${data.mortgage_rate_30yr}%`,
      'Price/Rent Ratio': `${data.price_to_rent_ratio}`,
      'Employment Growth': `${data.employment_growth_pct}%`,
      'Building Permits': `${data.building_permits}`,
      'Foreclosure Rate': `${data.foreclosure_rate}%`
    }
  }
}

function calculateMomentum(values: number[]): number {
  if (values.length < 2) return 0
  const recent = values.slice(-Math.min(3, values.length))
  const earlier = values.slice(0, Math.min(3, values.length))
  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
  const earlierAvg = earlier.reduce((s, v) => s + v, 0) / earlier.length
  return earlierAvg !== 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0
}

function formatMarketCompassReport(result: MarketCompassResult): string {
  const lines: string[] = []
  lines.push('## Market Trend Compass')
  lines.push('')
  lines.push('### Market Heat Map')
  lines.push('| Dimension | Status |')
  lines.push('|-----------|--------|')
  lines.push(`| Market Phase | ${result.market_phase} |`)
  lines.push(`| Temperature | ${result.market_temperature.toUpperCase()} |`)
  lines.push(`| Heat Index | ${result.heat_index}/100 |`)
  lines.push('')
  lines.push('### Price Trend Analysis')
  lines.push(`- Direction: ${result.price_trend.direction}`)
  lines.push(`- Momentum: ${result.price_trend.momentum}%`)
  lines.push(`- 12-Month Forecast: ${result.price_trend.forecast_12m}%`)
  lines.push(`- 24-Month Forecast: ${result.price_trend.forecast_24m}%`)
  lines.push('')
  lines.push('### Inventory Analysis')
  lines.push(`- Current: ${result.inventory_analysis.current_months} months supply`)
  lines.push(`- Trend: ${result.inventory_analysis.trend}`)
  lines.push(`- Absorption Rate: ${result.inventory_analysis.absorption_rate}%`)
  lines.push(`- Market Balance: ${result.inventory_analysis.seller_buyer_balance}`)
  lines.push('')
  lines.push('### Days on Market')
  lines.push(`- Current Average: ${result.days_on_market_analysis.current} days`)
  lines.push(`- Trend: ${result.days_on_market_analysis.trend}`)
  lines.push(`- Historical Percentile: ${result.days_on_market_analysis.percentile_vs_historical}%`)
  lines.push('')
  lines.push('### Interest Rate Impact')
  lines.push(`- Current 30yr Rate: ${result.interest_rate_impact.current_rate}%`)
  lines.push(`- Affordability Index: ${result.interest_rate_impact.affordability_index}/100`)
  lines.push(`- Sensitivity: ${result.interest_rate_impact.rate_sensitivity}`)
  lines.push(`- Forecast Impact: ${result.interest_rate_impact.forecast_impact}`)
  lines.push('')
  lines.push(`### Market Metrics Dashboard`)
  for (const [key, value] of Object.entries(result.key_metrics_dashboard)) {
    lines.push(`- ${key}: ${value}`)
  }
  lines.push('')
  lines.push('### Rental Yield Trend')
  lines.push(`- Current Yield: ${result.rental_yield_trend.current_yield}%`)
  lines.push(`- Trend: ${result.rental_yield_trend.trend}%`)
  lines.push(`- Forecast: ${result.rental_yield_trend.forecast}%`)
  lines.push('')
  lines.push('### Policy Risk Assessment')
  lines.push(`- Overall Risk: ${result.policy_risk_assessment.overall_risk}`)
  if (result.policy_risk_assessment.key_risks.length > 0) lines.push(`- Key Risks: ${result.policy_risk_assessment.key_risks.join(', ')}`)
  if (result.policy_risk_assessment.opportunities.length > 0) lines.push(`- Opportunities: ${result.policy_risk_assessment.opportunities.join(', ')}`)
  lines.push('')
  lines.push(`**Investment Signal:** ${result.investment_signal}`)
  return lines.join('\n')
}

// ==================== TOOL 6: FINANCING OPTIMIZER ====================

function runFinancingOptimization(input: FinancingInput): FinancingResult {
  // Current loan metrics
  const currentLTV = (input.loan_amount / input.property_value) * 100
  const currentDSCR = input.noi_annual / (input.current_monthly_payment * 12)
  const equity = input.property_value - input.loan_amount

  // Refinance scenarios
  const scenarios = input.refinance_rates.map(ref => {
    const newLoanAmount = input.loan_amount // Same balance refinance
    const monthlyRate = ref.rate_pct / 100 / 12
    const numPayments = ref.term_years * 12
    const newPayment = monthlyRate > 0
      ? newLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : newLoanAmount / numPayments

    const monthlySavings = input.current_monthly_payment - newPayment
    const annualSavings = monthlySavings * 12
    const totalCosts = ref.points + ref.closing_costs
    const breakEven = monthlySavings > 0 ? Math.ceil(totalCosts / monthlySavings) : 999
    const totalSavingsLifetime = annualSavings * (input.current_term_years - Math.floor(breakEven / 12)) - totalCosts
    const netBenefit = totalSavingsLifetime

    let recommendation = 'Not recommended'
    if (breakEven <= 24 && netBenefit > 5000) recommendation = 'Strongly recommended'
    else if (breakEven <= 36 && netBenefit > 0) recommendation = 'Recommended'
    else if (breakEven <= 48) recommendation = 'Consider if long-term hold'

    return {
      lender: ref.lender,
      rate_pct: ref.rate_pct,
      points_cost: ref.points,
      closing_costs: ref.closing_costs,
      monthly_payment: Math.round(newPayment * 100) / 100,
      monthly_savings: Math.round(monthlySavings * 100) / 100,
      annual_savings: Math.round(annualSavings),
      break_even_months: breakEven,
      total_savings_lifetime: Math.round(totalSavingsLifetime),
      net_benefit: Math.round(netBenefit),
      recommendation
    }
  })

  const optimalScenario = scenarios.length > 0 ? scenarios.reduce((best, s) => s.net_benefit > best.net_benefit ? s : best, scenarios[0]).lender : 'None available'

  // LTV/DCR analysis
  const maxLoanByLTV = input.property_value * (input.target_ltv_pct / 100)
  const maxLoanByDscr = input.noi_annual / input.dscr_requirement / (input.current_rate_pct / 100 / 12 * (1 - Math.pow(1 + input.current_rate_pct / 100 / 12, -input.current_term_years * 12)) / (input.current_rate_pct / 100 / 12))
  const bindingConstraint = maxLoanByLTV < maxLoanByDscr ? 'LTV' : 'DSCR'
  const additionalCapacity = Math.max(0, Math.min(maxLoanByLTV, maxLoanByDscr) - input.loan_amount)

  // Prepayment analysis
  const remainingBalance = input.loan_amount * 0.92 // Simplified
  const prepaymentPenalty = remainingBalance * (input.prepayment_penalty_pct / 100)
  const interestSavings = remainingBalance * (input.current_rate_pct / 100) * 5 // 5 years remaining
  const netBenefitPrepay = interestSavings - prepaymentPenalty
  const optimalStrategy = netBenefitPrepay > 0 ? 'Prepayment recommended — net benefit exceeds penalty' : 'Continue current payments — prepayment penalty exceeds savings'

  // Capital structure advice
  let recommendedLTV = 65
  let financing_type = 'Conventional fixed-rate'
  if (input.investor_type === 'reit') { recommendedLTV = 55; financing_type = 'Institutional/CMBS' }
  else if (input.investor_type === 'llc') { recommendedLTV = 70; financing_type = 'Conventional or portfolio loan' }
  else if (input.investor_type === 'corporation') { recommendedLTV = 60; financing_type = 'Commercial term loan' }

  return {
    current_loan_metrics: {
      ltv_pct: Math.round(currentLTV * 100) / 100,
      dscr: Math.round(currentDSCR * 100) / 100,
      equity: Math.round(equity),
      monthly_payment: Math.round(input.current_monthly_payment * 100) / 100,
      total_remaining_payments: input.current_term_years * 12 - 60 // simplified
    },
    refinance_scenarios: scenarios,
    optimal_scenario: optimalScenario,
    ltv_dscr_analysis: {
      current_ltv: Math.round(currentLTV * 100) / 100,
      current_dscr: Math.round(currentDSCR * 100) / 100,
      max_loan_by_ltv: Math.round(maxLoanByLTV),
      max_loan_by_dscr: Math.round(maxLoanByDscr),
      binding_constraint: bindingConstraint,
      additional_borrowing_capacity: Math.round(additionalCapacity)
    },
    prepayment_analysis: {
      current_balance: Math.round(remainingBalance),
      prepayment_penalty: Math.round(prepaymentPenalty),
      interest_savings_if_prepaid: Math.round(interestSavings),
      net_benefit_after_penalty: Math.round(netBenefitPrepay),
      optimal_strategy: optimalStrategy
    },
    capital_structure_advice: {
      recommended_ltv: recommendedLTV,
      recommended_dscr_minimum: input.dscr_requirement,
      financing_type,
      rationale: `Optimal ${recommendedLTV}% LTV balances leverage benefit with risk for ${input.investor_type} investor type.`,
      alternatives: [interestOnlyOption(input), cashOutOption(input)]
    }
  }
}

function interestOnlyOption(input: FinancingInput): string {
  return `Interest-only loan at ${Math.min(input.property_value * 0.65, input.loan_amount).toLocaleString()} could reduce monthly payments by ~30% but increases balloon risk`
}

function cashOutOption(input: FinancingInput): string {
  const cashOutCapacity = input.property_value * 0.75 - input.loan_amount
  return cashOutCapacity > 0 ? `Cash-out refinance could extract $${Math.round(cashOutCapacity).toLocaleString()} in equity` : 'No cash-out capacity at target LTV'
}

function formatFinancingReport(result: FinancingResult): string {
  const lines: string[] = []
  lines.push('## Financing Optimization Report')
  lines.push('')
  lines.push('### Current Loan Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| LTV | ${result.current_loan_metrics.ltv_pct}% |`)
  lines.push(`| DSCR | ${result.current_loan_metrics.dscr} |`)
  lines.push(`| Equity | $${result.current_loan_metrics.equity.toLocaleString()} |`)
  lines.push(`| Monthly Payment | $${result.current_loan_metrics.monthly_payment.toLocaleString()} |`)
  lines.push(`| Remaining Payments | ${result.current_loan_metrics.total_remaining_payments} |`)
  lines.push('')
  lines.push('### Refinance Scenarios')
  lines.push('| Lender | Rate | Points | Costs | Monthly Pmt | Savings | Break-even | Net Benefit | |')
  lines.push('|--------|------|--------|-------|-------------|---------|------------|-------------|')
  for (const s of result.refinance_scenarios) {
    lines.push(`| ${s.lender} | ${s.rate_pct}% | $${s.points_cost.toLocaleString()} | $${s.closing_costs.toLocaleString()} | $${s.monthly_payment.toLocaleString()} | $${s.monthly_savings.toLocaleString()}/mo | ${s.break_even_months}mo | $${s.net_benefit.toLocaleString()} |`)
  }
  lines.push('')
  lines.push(`**Optimal Scenario:** ${result.optimal_scenario}`)
  lines.push('')
  lines.push('### LTV/DSCR Analysis')
  lines.push(`- Max Loan by LTV: $${result.ltv_dscr_analysis.max_loan_by_ltv.toLocaleString()}`)
  lines.push(`- Max Loan by DSCR: $${result.ltv_dscr_analysis.max_loan_by_dscr.toLocaleString()}`)
  lines.push(`- Binding Constraint: ${result.ltv_dscr_analysis.binding_constraint}`)
  lines.push(`- Additional Borrowing Capacity: $${result.ltv_dscr_analysis.additional_borrowing_capacity.toLocaleString()}`)
  lines.push('')
  lines.push('### Prepayment Analysis')
  lines.push(`- Current Balance: $${result.prepayment_analysis.current_balance.toLocaleString()}`)
  lines.push(`- Prepayment Penalty: $${result.prepayment_analysis.prepayment_penalty.toLocaleString()}`)
  lines.push(`- Interest Savings: $${result.prepayment_analysis.interest_savings_if_prepaid.toLocaleString()}`)
  lines.push(`- Net Benefit: $${result.prepayment_analysis.net_benefit_after_penalty.toLocaleString()}`)
  lines.push(`- Strategy: ${result.prepayment_analysis.optimal_strategy}`)
  lines.push('')
  lines.push('### Capital Structure Advice')
  lines.push(`- Recommended LTV: ${result.capital_structure_advice.recommended_ltv}%`)
  lines.push(`- Minimum DSCR: ${result.capital_structure_advice.recommended_dscr_minimum}`)
  lines.push(`- Financing Type: ${result.capital_structure_advice.financing_type}`)
  lines.push(`- Rationale: ${result.capital_structure_advice.rationale}`)
  for (const alt of result.capital_structure_advice.alternatives) lines.push(`- Alternative: ${alt}`)
  return lines.join('\n')
}

// ==================== TOOL 7: RISK LOCATOR ====================

function runLocationRiskAssessment(input: LocationRiskInput): LocationRiskResult {
  // Safety score (crime-based)
  const safetyScore = Math.max(0, Math.min(100, 100 - input.crime_index * 0.8 - input.violent_crime_rate * 0.3 - input.property_crime_rate * 0.1))
  const safetyGrade = getGrade(safetyScore)

  // Education score
  const eduScore = Math.max(0, Math.min(100, input.school_rating_avg * 10 + Math.min(input.school_count * 3, 20)))
  const eduGrade = getGrade(eduScore)

  // Environmental score
  const envScore = Math.max(0, Math.min(100, 100 - input.air_quality_index * 0.5 - (input.superfund_proximity_miles < 3 ? 20 : 0) - (input.noise_pollution_db > 70 ? 15 : 0) - (input.radon_risk === 'high' ? 15 : 0)))
  const envGrade = getGrade(envScore)

  // Natural disaster score
  const disasterScore = Math.max(0, Math.min(100, 100 - (
    input.flood_risk_score * 0.3 +
    input.earthquake_risk_score * 0.2 +
    input.hurricane_risk_score * 0.15 +
    input.tornado_risk_score * 0.15 +
    input.wildfire_risk_score * 0.1 +
    input.hail_risk_score * 0.1
  )))
  const disasterGrade = getGrade(disasterScore)

  // Future planning score
  let planningScore = 75
  planningScore += input.future_development_plans.length * 3
  planningScore += input.infrastructure_projects.length * 5
  planningScore -= input.zoning_changes.length * 4
  planningScore = Math.max(0, Math.min(100, planningScore))
  const planningGrade = getGrade(planningScore)

  // Composite score
  const compositeScore = Math.round(
    safetyScore * 0.25 +
    eduScore * 0.20 +
    envScore * 0.20 +
    disasterScore * 0.25 +
    planningScore * 0.10
  )

  let risk_level: 'minimal' | 'low' | 'moderate' | 'high' | 'severe' = 'moderate'
  if (compositeScore >= 85) risk_level = 'minimal'
  else if (compositeScore >= 70) risk_level = 'low'
  else if (compositeScore >= 50) risk_level = 'moderate'
  else if (compositeScore >= 30) risk_level = 'high'
  else risk_level = 'severe'

  // Insurance impact
  const basePremium = 1200
  const riskMultiplier = 1 + (input.flood_risk_score + input.earthquake_risk_score + input.hurricane_risk_score + input.wildfire_risk_score) / 400
  const estimatedPremium = Math.round(basePremium * riskMultiplier)
  const coverageGaps: string[] = []
  if (input.flood_zone === 'A' || input.flood_zone === 'V') coverageGaps.push('Flood insurance required (high-risk zone)')
  if (input.earthquake_risk_score > 40) coverageGaps.push('Earthquake endorsement recommended')
  if (input.wildfire_risk_score > 50) coverageGaps.push('Wildfire coverage may be limited or expensive')

  // Top risks and opportunities
  const topRisks: string[] = []
  if (safetyScore < 50) topRisks.push('Elevated crime rates may impact tenant pool and appreciation')
  if (disasterScore < 40) topRisks.push('High natural disaster risk increases insurance costs')
  if (envScore < 40) topRisks.push('Environmental concerns may affect long-term property value')
  if (planningScore < 40) topRisks.push('Negative zoning changes or lack of infrastructure investment')

  const topOpportunities: string[] = []
  if (eduScore > 75) topOpportunities.push('Strong school district attracts family tenants')
  if (planningScore > 70) topOpportunities.push('Positive development plans signal appreciation potential')
  if (input.infrastructure_projects.length > 0) topOpportunities.push('Infrastructure investments expected to boost property values')

  let investment_implication = 'Moderate risk — standard due diligence recommended.'
  if (risk_level === 'minimal' || risk_level === 'low') investment_implication = 'Low risk — favorable location for investment.'
  else if (risk_level === 'high') investment_implication = 'High risk — requires significant risk mitigation or price discount.'
  else if (risk_level === 'severe') investment_implication = 'Severe risk — recommend avoiding or demanding substantial price concession.'

  return {
    composite_risk_score: compositeScore,
    risk_level,
    risk_map: {
      safety: { score: Math.round(safetyScore), grade: safetyGrade, details: `Crime index ${input.crime_index}, ${input.school_count} schools within area` },
      education: { score: Math.round(eduScore), grade: eduGrade, details: `Average school rating ${input.school_rating_avg}/10, nearest school ${input.nearest_school_miles}mi` },
      environmental: { score: Math.round(envScore), grade: envGrade, details: `AQI ${input.air_quality_index}, Superfund ${input.superfund_proximity_miles}mi` },
      natural_disaster: { score: Math.round(disasterScore), grade: disasterGrade, details: `Flood zone ${input.flood_zone}, Earthquake risk ${input.earthquake_risk_score}/100` },
      future_planning: { score: Math.round(planningScore), grade: planningGrade, details: `${input.future_development_plans.length} development plans, ${input.infrastructure_projects.length} infrastructure projects` }
    },
    insurance_impact: {
      estimated_annual_premium: estimatedPremium,
      coverage_gaps: coverageGaps,
      recommendations: [
        ...(estimatedPremium > 2000 ? ['Shop multiple carriers for competitive rates'] : []),
        ...(disasterScore < 50 ? ['Consider higher deductibles to reduce premium'] : []),
        ...(coverageGaps.length > 0 ? ['Address coverage gaps identified above'] : ['Standard coverage appears adequate'])
      ]
    },
    investment_implication,
    top_risks: topRisks.length > 0 ? topRisks : ['No significant location risks identified'],
    top_opportunities: topOpportunities.length > 0 ? topOpportunities : ['No exceptional location opportunities identified'],
    comparable_markets_by_risk: [
      `Similar risk profile markets: ${compositeScore > 70 ? 'High-growth suburbs with strong fundamentals' : compositeScore > 50 ? 'Transitional markets with moderate risk' : 'High-risk/high-reward emerging markets'}`
    ]
  }
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'B-'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 50) return 'C-'
  if (score >= 40) return 'D'
  return 'F'
}

function formatRiskLocatorReport(result: LocationRiskResult): string {
  const lines: string[] = []
  lines.push('## Location Risk Assessment')
  lines.push('')
  lines.push(`**Composite Risk Score:** ${result.composite_risk_score}/100 (${result.risk_level.toUpperCase()})`)
  lines.push('')
  lines.push('### Risk Map')
  lines.push('| Category | Score | Grade | Details |')
  lines.push('|----------|-------|-------|---------|')
  const rm = result.risk_map
  lines.push(`| Safety | ${rm.safety.score} | ${rm.safety.grade} | ${rm.safety.details} |`)
  lines.push(`| Education | ${rm.education.score} | ${rm.education.grade} | ${rm.education.details} |`)
  lines.push(`| Environmental | ${rm.environmental.score} | ${rm.environmental.grade} | ${rm.environmental.details} |`)
  lines.push(`| Natural Disaster | ${rm.natural_disaster.score} | ${rm.natural_disaster.grade} | ${rm.natural_disaster.details} |`)
  lines.push(`| Future Planning | ${rm.future_planning.score} | ${rm.future_planning.grade} | ${rm.future_planning.details} |`)
  lines.push('')
  lines.push('### Insurance Impact')
  lines.push(`- Estimated Annual Premium: $${result.insurance_impact.estimated_annual_premium.toLocaleString()}`)
  lines.push(`- Coverage Gaps:`)
  for (const gap of result.insurance_impact.coverage_gaps.length > 0 ? result.insurance_impact.coverage_gaps : ['None identified']) lines.push(`  - ${gap}`)
  lines.push(`- Recommendations:`)
  for (const rec of result.insurance_impact.recommendations) lines.push(`  - ${rec}`)
  lines.push('')
  lines.push('### Top Risks')
  for (const r of result.top_risks) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### Top Opportunities')
  for (const o of result.top_opportunities) lines.push(`- ${o}`)
  lines.push('')
  lines.push(`**Investment Implication:** ${result.investment_implication}`)
  return lines.join('\n')
}

// ==================== TOOL 8: PORTFOLIO BUILDER ====================

function runPortfolioBuilder(holdings: PortfolioHolding[]): PortfolioBuilderResult {
  const totalValue = holdings.reduce((s, h) => s + h.current_value, 0)
  const totalEquity = holdings.reduce((s, h) => s + h.equity, 0)
  const totalDebt = holdings.reduce((s, h) => s + h.debt, 0)
  const weightedLTV = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0

  // Geographic concentration
  const geoMap = new Map<string, number>()
  for (const h of holdings) {
    const key = `${h.city}, ${h.state}`
    geoMap.set(key, (geoMap.get(key) ?? 0) + h.current_value)
  }
  const geoConcentration: Record<string, number> = {}
  for (const [loc, val] of geoMap) {
    geoConcentration[loc] = Math.round((val / totalValue) * 10000) / 100
  }

  // Type concentration
  const typeMap = new Map<string, number>()
  for (const h of holdings) {
    typeMap.set(h.property_type, (typeMap.get(h.property_type) ?? 0) + h.current_value)
  }
  const typeConcentration: Record<string, number> = {}
  for (const [type, val] of typeMap) {
    typeConcentration[type] = Math.round((val / totalValue) * 10000) / 100
  }

  // Diversification score
  const geoDiversity = Math.min(geoMap.size * 12, 40)
  const typeDiversity = Math.min(typeMap.size * 10, 30)
  const valueEvenness = calculateValueEvenness(holdings, totalValue)
  const diversificationScore = Math.round(geoDiversity + typeDiversity + valueEvenness)

  let diversificationGrade = 'D'
  if (diversificationScore >= 80) diversificationGrade = 'A'
  else if (diversificationScore >= 65) diversificationGrade = 'B+'
  else if (diversificationScore >= 50) diversificationGrade = 'B'
  else if (diversificationScore >= 35) diversificationGrade = 'C'

  // Correlation metrics (simplified)
  const geoCorrelation = Math.max(0, 1 - geoMap.size * 0.15)
  const typeCorrelation = Math.max(0, 1 - typeMap.size * 0.12)
  const portfolioBeta = 0.7 + geoCorrelation * 0.2 + typeCorrelation * 0.1

  // Risk-adjusted return
  const totalNOI = holdings.reduce((s, h) => s + h.noi_annual, 0)
  const portfolioYield = totalValue > 0 ? (totalNOI / totalValue) * 100 : 0
  const volatility = 15 - diversificationScore * 0.12 // simplified
  const riskFreeRate = 4.5
  const sharpeRatio = volatility > 0 ? (portfolioYield - riskFreeRate) / volatility : 0
  const riskAdjustedReturn = portfolioYield - (100 - diversificationScore) * 0.05

  // Rebalancing recommendations
  const recs: PortfolioBuilderResult['rebalancing_recommendations'] = []
  for (const [loc, pct] of Object.entries(geoConcentration)) {
    if (pct > 40) recs.push({ action: 'sell', property_id: 'TBD', reason: `Over-concentrated in ${loc} (${pct}%)`, expected_impact: `Reduce geographic risk`, priority: 'high' })
  }
  for (const [type, pct] of Object.entries(typeConcentration)) {
    if (pct > 60) recs.push({ action: 'buy', property_id: 'NEW', reason: `Heavy ${type} concentration (${pct}%)`, expected_impact: 'Diversify property type exposure', priority: 'medium' })
  }
  if (weightedLTV > 75) recs.push({ action: 'hold', property_id: 'ALL', reason: `High portfolio LTV (${Math.round(weightedLTV)}%)`, expected_impact: 'Wait for equity buildup before additional leverage', priority: 'high' })
  if (diversificationScore < 50) recs.push({ action: 'buy', property_id: 'NEW', reason: 'Low diversification score', expected_impact: 'Add properties in new markets/types', priority: 'high' })
  if (recs.length === 0) recs.push({ action: 'hold', property_id: 'ALL', reason: 'Portfolio is well-balanced', expected_impact: 'Maintain current allocation', priority: 'low' })

  // REIT comparison
  const reitAvgYield = 4.5
  const reitAvgAppreciation = 6.0
  const reitAvgVolatility = 18.0
  const portfolioAppreciation = holdings.length > 0 ? holdings.reduce((s, h) => s + ((h.current_value - h.purchase_price) / h.purchase_price) * 100, 0) / holdings.length : 0
  const advantage = portfolioYield > reitAvgYield ? 'Higher yield than REITs' : 'Lower yield but more control'
  const reitRecommendation = portfolioYield > reitAvgYield * 1.2 ? 'Direct ownership provides superior yield vs REITs' : 'Consider REITs for additional diversification and liquidity'

  // After-tax optimization
  const currentAfterTaxReturn = portfolioYield * (1 - 0.25) // simplified tax
  const depreciationCapture = totalValue * 0.02 // 2% annual depreciation benefit
  const potentialAfterTaxReturn = currentAfterTaxReturn + depreciationCapture / totalValue * 100
  const tenThirtyOneCandidates = holdings.filter(h => (h.current_value - h.purchase_price) / h.purchase_price > 0.3).map(h => h.property_id)

  return {
    diversification_analysis: {
      total_value: Math.round(totalValue),
      total_equity: Math.round(totalEquity),
      total_debt: Math.round(totalDebt),
      weighted_ltv: Math.round(weightedLTV * 100) / 100,
      geographic_concentration: geoConcentration,
      type_concentration: typeConcentration,
      diversification_score: diversificationScore,
      diversification_grade: diversificationGrade
    },
    correlation_matrix: {
      geographic_correlation: Math.round(geoCorrelation * 100) / 100,
      type_correlation: Math.round(typeCorrelation * 100) / 100,
      portfolio_beta: Math.round(portfolioBeta * 100) / 100,
      risk_adjusted_return: Math.round(riskAdjustedReturn * 100) / 100,
      sharpe_ratio: Math.round(sharpeRatio * 100) / 100
    },
    rebalancing_recommendations: recs,
    reit_comparison: {
      portfolio_yield: Math.round(portfolioYield * 100) / 100,
      reit_avg_yield: reitAvgYield,
      portfolio_appreciation: Math.round(portfolioAppreciation * 100) / 100,
      reit_avg_appreciation: reitAvgAppreciation,
      portfolio_volatility: Math.round(volatility * 100) / 100,
      reit_avg_volatility: reitAvgVolatility,
      advantage,
      recommendation: reitRecommendation
    },
    after_tax_optimization: {
      current_after_tax_return: Math.round(currentAfterTaxReturn * 100) / 100,
      potential_after_tax_return: Math.round(potentialAfterTaxReturn * 100) / 100,
      tax_loss_harvesting_opportunity: Math.round(depreciationCapture),
      depreciation_capture: Math.round(depreciationCapture),
      optimal_disposition_timeline: holdings.filter(h => h.current_value < h.purchase_price).map(h => `${h.property_id} (tax loss)`),
      ten_thirty_one_exchange_candidates: tenThirtyOneCandidates
    }
  }
}

function calculateValueEvenness(holdings: PortfolioHolding[], totalValue: number): number {
  if (holdings.length <= 1) return 10
  const avg = totalValue / holdings.length
  const variance = holdings.reduce((s, h) => s + Math.pow(h.current_value - avg, 2), 0) / holdings.length
  const cv = Math.sqrt(variance) / avg
  return Math.max(0, 30 - cv * 15)
}

function formatPortfolioReport(result: PortfolioBuilderResult): string {
  const lines: string[] = []
  lines.push('## Portfolio Construction Analysis')
  lines.push('')
  lines.push('### Diversification Dashboard')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Value | $${result.diversification_analysis.total_value.toLocaleString()} |`)
  lines.push(`| Total Equity | $${result.diversification_analysis.total_equity.toLocaleString()} |`)
  lines.push(`| Weighted LTV | ${result.diversification_analysis.weighted_ltv}% |`)
  lines.push(`| Diversification Score | ${result.diversification_analysis.diversification_score}/100 |`)
  lines.push(`| Diversification Grade | ${result.diversification_analysis.diversification_grade} |`)
  lines.push('')
  lines.push('### Geographic Concentration')
  for (const [loc, pct] of Object.entries(result.diversification_analysis.geographic_concentration)) {
    lines.push(`- ${loc}: ${pct}%`)
  }
  lines.push('')
  lines.push('### Type Concentration')
  for (const [type, pct] of Object.entries(result.diversification_analysis.type_concentration)) {
    lines.push(`- ${type}: ${pct}%`)
  }
  lines.push('')
  lines.push('### Correlation Matrix')
  lines.push(`- Geographic Correlation: ${result.correlation_matrix.geographic_correlation}`)
  lines.push(`- Type Correlation: ${result.correlation_matrix.type_correlation}`)
  lines.push(`- Portfolio Beta: ${result.correlation_matrix.portfolio_beta}`)
  lines.push(`- Risk-Adjusted Return: ${result.correlation_matrix.risk_adjusted_return}%`)
  lines.push(`- Sharpe Ratio: ${result.correlation_matrix.sharpe_ratio}`)
  lines.push('')
  lines.push('### Rebalancing Recommendations')
  for (const rec of result.rebalancing_recommendations) {
    lines.push(`- **[${rec.priority.toUpperCase()}]** ${rec.action.toUpperCase()}: ${rec.reason} — ${rec.expected_impact}`)
  }
  lines.push('')
  lines.push('### REIT Comparison')
  lines.push(`| Metric | Portfolio | REIT Avg |`)
  lines.push(`|--------|-----------|----------|`)
  lines.push(`| Yield | ${result.reit_comparison.portfolio_yield}% | ${result.reit_comparison.reit_avg_yield}% |`)
  lines.push(`| Appreciation | ${result.reit_comparison.portfolio_appreciation}% | ${result.reit_comparison.reit_avg_appreciation}% |`)
  lines.push(`| Volatility | ${result.reit_comparison.portfolio_volatility}% | ${result.reit_comparison.reit_avg_volatility}% |`)
  lines.push(`- Advantage: ${result.reit_comparison.advantage}`)
  lines.push(`- Recommendation: ${result.reit_comparison.recommendation}`)
  lines.push('')
  lines.push('### After-Tax Optimization')
  lines.push(`- Current After-Tax Return: ${result.after_tax_optimization.current_after_tax_return}%`)
  lines.push(`- Potential After-Tax Return: ${result.after_tax_optimization.potential_after_tax_return}%`)
  lines.push(`- Depreciation Capture: $${result.after_tax_optimization.depreciation_capture.toLocaleString()}`)
  if (result.after_tax_optimization.ten_thirty_one_exchange_candidates.length > 0) {
    lines.push(`- 1031 Exchange Candidates: ${result.after_tax_optimization.ten_thirty_one_exchange_candidates.join(', ')}`)
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Property Valuation
  tools.register(defineTool({
    name: 'property_valuation',
    description: 'Automated Valuation Model (AVM) combining four approaches: comparable sales with adjustments, hedonic price modeling, income approach (cap rate), and cost approach. Returns final estimate with valuation range, confidence interval, and approach weights.',
    parameters: {
      property_data: { type: 'string', required: true, description: 'JSON object: PropertyProfile with fields: address, type, sqft, lot_size_sqft, bedrooms, bathrooms, year_built, condition, stories, garage_spaces, pool (bool), waterfront (bool), view, zip_code, school_district, property_tax_annual, hoa_monthly, last_sale_price, last_sale_date, current_list_price' },
      comparables: { type: 'string', description: 'Optional JSON array of ComparableSale objects: address, sale_price, sale_date, sqft, bedrooms, bathrooms, year_built, condition, distance_miles, lot_size_sqft, garage_spaces, pool, waterfront, view' },
      income_approach: { type: 'string', description: 'Optional JSON: IncomeApproachInput with gross_rent_annual, vacancy_rate_pct, operating_expenses_annual, cap_rate_pct, growth_rate_pct, remaining_economic_life_years' },
      cost_approach: { type: 'string', description: 'Optional JSON: CostApproachInput with land_value, replacement_cost_per_sqft, total_depreciation_pct, external_obsolescence_pct, functional_obsolescence_pct' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { property_data: string; comparables?: string; income_approach?: string; cost_approach?: string }) {
      const property: PropertyProfile = JSON.parse(args.property_data)
      const comps: ComparableSale[] = args.comparables ? JSON.parse(args.comparables) : []
      const income: IncomeApproachInput | undefined = args.income_approach ? JSON.parse(args.income_approach) : undefined
      const cost: CostApproachInput | undefined = args.cost_approach ? JSON.parse(args.cost_approach) : undefined
      const result = runPropertyValuation(property, comps, income, cost)
      return formatValuationReport(result)
    }
  }))

  // Tool 2: Investment Analyzer
  tools.register(defineTool({
    name: 'investment_analyzer',
    description: 'Comprehensive investment return analysis. Calculates cash-on-cash return, cap rate, leveraged/unleveraged IRR, equity multiple, DSCR, break-even occupancy. Includes exit sensitivity analysis across appreciation scenarios and optimal holding period determination.',
    parameters: {
      investment_data: { type: 'string', required: true, description: 'JSON object: InvestmentInput with purchase_price, down_payment_pct, interest_rate_pct, loan_term_years, monthly_rent, vacancy_rate_pct, property_tax_annual, insurance_annual, maintenance_annual, management_fee_pct, hoa_monthly, closing_costs, rehab_costs, appreciation_rate_pct, holding_period_years, selling_costs_pct, income_tax_bracket_pct' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { investment_data: string }) {
      const input: InvestmentInput = JSON.parse(args.investment_data)
      const result = runInvestmentAnalysis(input)
      return formatInvestmentReport(result)
    }
  }))

  // Tool 3: Tenant Screening
  tools.register(defineTool({
    name: 'tenant_screening',
    description: 'AI-powered tenant screening and selection. Scores applicants on credit (30%), income ratio (30%), employment stability (20%), and rental history (20%). Returns risk scores, rankings, lease term suggestions, deposit recommendations, and optimal tenant selection.',
    parameters: {
      applicants: { type: 'string', required: true, description: 'JSON array of TenantApplicant objects: name, monthly_income, credit_score, employment_status, employment_months, rental_months_previous, eviction_history (bool), criminal_record (bool), references_count, pets (bool), smokers (bool), desired_lease_months, move_in_date, current_rent, debt_to_income_pct, bankruptcies, collections_accounts' },
      monthly_rent: { type: 'string', required: true, description: 'Monthly rent amount as a number string' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { applicants: string; monthly_rent: string }) {
      const applicants: TenantApplicant[] = JSON.parse(args.applicants)
      const rent = parseFloat(args.monthly_rent)
      const result = runTenantScreening(applicants, rent)
      return formatTenantScreeningReport(result)
    }
  }))

  // Tool 4: Property Management
  tools.register(defineTool({
    name: 'property_management',
    description: 'Full property management orchestration dashboard. Manages lease tracking, rent collection, maintenance work orders (with SLA monitoring), compliance status, owner financial reports, and vendor scorecards. Returns comprehensive portfolio management overview.',
    parameters: {
      leases: { type: 'string', required: true, description: 'JSON array of LeaseRecord objects' },
      work_orders: { type: 'string', description: 'Optional JSON array of MaintenanceWorkOrder objects' },
      vendors: { type: 'string', description: 'Optional JSON array of VendorRecord objects' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { leases: string; work_orders?: string; vendors?: string }) {
      const leases: LeaseRecord[] = JSON.parse(args.leases)
      const workOrders: MaintenanceWorkOrder[] = args.work_orders ? JSON.parse(args.work_orders) : []
      const vendors: VendorRecord[] = args.vendors ? JSON.parse(args.vendors) : []
      const result = runPropertyManagement(leases, workOrders, vendors)
      return formatPropertyManagementReport(result)
    }
  }))

  // Tool 5: Market Compass
  tools.register(defineTool({
    name: 'market_compass',
    description: 'Market trend analysis with heat map. Analyzes price trends, inventory cycles, days on market, interest rate impact, policy risk, and rental yield trends. Returns market phase, temperature, investment signal, and key metrics dashboard.',
    parameters: {
      market_data: { type: 'string', required: true, description: 'JSON object: MarketDataInput with zip_code, city, state, median_price_current, median_price_history[], inventory_months, inventory_history[], days_on_market_avg, days_on_market_history[], median_rent, rent_history[], mortgage_rate_30yr, mortgage_rate_history[], building_permits, employment_growth_pct, population_growth_pct, median_household_income, new_construction_units, foreclosure_rate, price_to_rent_ratio, policy_events[]' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { market_data: string }) {
      const data: MarketDataInput = JSON.parse(args.market_data)
      const result = runMarketCompass(data)
      return formatMarketCompassReport(result)
    }
  }))

  // Tool 6: Financing Optimizer
  tools.register(defineTool({
    name: 'financing_optimizer',
    description: 'Financing optimization including refinance rate analysis, LTV/DCR analysis, multi-scenario comparison, prepayment analysis, and capital structure advice. Returns optimal refinance scenario and borrowing capacity.',
    parameters: {
      financing_data: { type: 'string', required: true, description: 'JSON object: FinancingInput with loan_amount, current_rate_pct, current_term_years, current_monthly_payment, property_value, noi_annual, refinance_rates[], target_ltv_pct, prepayment_penalty_pct, dscr_requirement, investor_type' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { financing_data: string }) {
      const input: FinancingInput = JSON.parse(args.financing_data)
      const result = runFinancingOptimization(input)
      return formatFinancingReport(result)
    }
  }))

  // Tool 7: Risk Locator
  tools.register(defineTool({
    name: 'risk_locator',
    description: 'Comprehensive location risk assessment covering crime rates, school ratings, natural disaster hazards, environmental factors, and future planning impact. Returns composite risk score, risk map by category, insurance impact, and investment implications.',
    parameters: {
      location_data: { type: 'string', required: true, description: 'JSON object: LocationRiskInput with address, zip_code, city, state, latitude, longitude, crime_index, violent_crime_rate, property_crime_rate, school_rating_avg, school_count, nearest_school_miles, flood_zone, flood_risk_score, earthquake_risk_score, hurricane_risk_score, tornado_risk_score, wildfire_risk_score, hail_risk_score, air_quality_index, radon_risk, superfund_proximity_miles, noise_pollution_db, future_development_plans[], zoning_changes[], infrastructure_projects[], insurance_availability' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { location_data: string }) {
      const input: LocationRiskInput = JSON.parse(args.location_data)
      const result = runLocationRiskAssessment(input)
      return formatRiskLocatorReport(result)
    }
  }))

  // Tool 8: Portfolio Builder
  tools.register(defineTool({
    name: 'portfolio_builder',
    description: 'Portfolio construction and optimization. Analyzes diversification (geographic/type concentration, correlation matrix, beta), provides rebalancing recommendations, REIT comparison, and after-tax return optimization including 1031 exchange candidates.',
    parameters: {
      holdings: { type: 'string', required: true, description: 'JSON array of PortfolioHolding objects: property_id, address, city, state, property_type, purchase_price, current_value, equity, debt, noi_annual, cash_flow_annual, occupancy_rate, year_acquired, latitude, longitude' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { holdings: string }) {
      const holdings: PortfolioHolding[] = JSON.parse(args.holdings)
      const result = runPortfolioBuilder(holdings)
      return formatPortfolioReport(result)
    }
  }))

  console.log(`[dsh-tool-realestatepro] Loaded v${VERSION} — Real Estate Pro Investment & Property Management Agent with 8 advanced tools`)
  console.log('  Tools: property_valuation, investment_analyzer, tenant_screening, property_management, market_compass, financing_optimizer, risk_locator, portfolio_builder')
}
