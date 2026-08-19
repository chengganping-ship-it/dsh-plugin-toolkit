/**
 * DSH Climate & Carbon Credit Analyzer Plugin v0.1.0
 *
 * Carbon footprint calculation, credit valuation, climate risk scoring, and ESG reporting toolkit for DeepSeek Harness Agent.
 * Designed for sustainability analysts, carbon traders, ESG consultants, and compliance officers.
 *
 * Features (v0.1.0):
 * - Carbon Footprint Calculator (Scope 1/2/3 emissions analysis)
 * - Carbon Credit Valuator (project assessment and pricing)
 * - Climate Risk Scorer (physical and transition risk evaluation)
 * - Renewable EnergyOptimizer (optimal energy mix generation)
 * - ESG Reporting Engine (GRI/SASB/TCFD framework alignment)
 * - Supply Chain Emissions Tracker (supplier-level carbon mapping)
 * - Carbon Offset Portfolio Analyzer (quality and diversification scoring)
 * - Regulatory Compliance_checker (global climate regulation tracker)
 *
 * @module dsh-tool-climate
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-climate'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface EmissionsSource {
  source: string
  co2e_tons: number
  unit: string
  quantity: number
  emission_factor: number
}

interface EmissionsData {
  scope1: EmissionsSource[]
  scope2: EmissionsSource[]
  scope3: EmissionsSource[]
  reporting_year?: number
  revenue_usd?: number
  employees?: number
}

interface ProjectData {
  type: string
  location: string
  vintage: number
  standard: string
  co2_reduction: number
  verification_body?: string
  permanence_years?: number
  additionality_score?: number
}

interface ExposureData {
  locations: string[]
  sectors: string[]
  physical_risks: string[]
  transition_risks: string[]
  annual_revenue?: number
  asset_value?: number
}

interface EnergyData {
  current_usage: {
    grid_kwh: number
    renewable_kwh: number
    fossil_kwh: number
    total_cost_usd: number
  }
  solar_potential: {
    capacity_kw: number
    generation_kwh: number
    cost_per_kw: number
  }
  wind_potential: {
    capacity_kw: number
    generation_kwh: number
    cost_per_kw: number
  }
  storage_options: {
    type: string
    capacity_kwh: number
    cost_per_kwh: number
    efficiency: number
  }[]
}

interface CompanyData {
  industry: string
  emissions: {
    total_co2e: number
    reduction_target_pct: number
    target_year: number
  }
  diversity: {
    board_pct_women: number
    workforce_pct_women: number
    pay_gap_pct: number
  }
  governance: {
    has_sustainability_committee: boolean
    executive_esg_linked_pay: boolean
    science_based_targets: boolean
    net_zero_commitment: boolean
  }
}

interface SupplierEntry {
  supplier: string
  country: string
  spend: number
  category: string
  emissions_data_available?: boolean
  reported_co2e?: number
}

interface OffsetEntry {
  project_type: string
  credits: number
  vintage: number
  standard: string
  price: number
}

interface OperationsData {
  locations: string[]
  sectors: string[]
  emissions: {
    total_co2e: number
    scope1_co2e: number
    scope2_co2e: number
  }
  employees?: number
  revenue_usd?: number
}

// ==================== TOOL 1: CARBON FOOTPRINT CALCULATOR ====================

interface CarbonFootprintResult {
  total_co2e: number
  breakdown_by_scope: {
    scope1: { total: number; percentage: number; sources: Array<{ source: string; co2e: number; percentage: number }> }
    scope2: { total: number; percentage: number; sources: Array<{ source: string; co2e: number; percentage: number }> }
    scope3: { total: number; percentage: number; sources: Array<{ source: string; co2e: number; percentage: number }> }
  }
  intensity_metrics: {
    per_revenue?: number
    per_employee?: number
    per_revenue_unit?: string
  }
  reduction_targets: {
    recommended_near_term: number
    recommended_long_term: number
    paris_aligned_pathway: number
  }
}

function calculateCarbonFootprint(data: EmissionsData): CarbonFootprintResult {
  const scope1Total = data.scope1.reduce((s, e) => s + e.co2e_tons, 0)
  const scope2Total = data.scope2.reduce((s, e) => s + e.co2e_tons, 0)
  const scope3Total = data.scope3.reduce((s, e) => s + e.co2e_tons, 0)
  const total = scope1Total + scope2Total + scope3Total

  const breakdown = (sources: EmissionsSource[], scopeTotal: number) => ({
    total: scopeTotal,
    percentage: total > 0 ? (scopeTotal / total) * 100 : 0,
    sources: sources.map(s => ({
      source: s.source,
      co2e: s.co2e_tons,
      percentage: scopeTotal > 0 ? (s.co2e_tons / scopeTotal) * 100 : 0
    })).sort((a, b) => b.co2e - a.co2e)
  })

  const intensityMetrics: CarbonFootprintResult['intensity_metrics'] = {}
  if (data.revenue_usd && data.revenue_usd > 0) {
    intensityMetrics.per_revenue = total / (data.revenue_usd / 1e6)
    intensityMetrics.per_revenue_unit = 'tCO2e per $1M revenue'
  }
  if (data.employees && data.employees > 0) {
    intensityMetrics.per_employee = total / data.employees
  }

  return {
    total_co2e: total,
    breakdown_by_scope: {
      scope1: breakdown(data.scope1, scope1Total),
      scope2: breakdown(data.scope2, scope2Total),
      scope3: breakdown(data.scope3, scope3Total)
    },
    intensity_metrics: intensityMetrics,
    reduction_targets: {
      recommended_near_term: total * 0.3,
      recommended_long_term: total * 0.5,
      paris_aligned_pathway: total * 0.45
    }
  }
}

function formatCarbonFootprintReport(result: CarbonFootprintResult): string {
  const lines: string[] = []
  lines.push('## Carbon Footprint Analysis Report')
  lines.push('')
  lines.push(`**Total Emissions:** ${result.total_co2e.toLocaleString()} tCO2e`)
  lines.push('')

  lines.push('### Breakdown by Scope')
  lines.push('| Scope | Emissions (tCO2e) | Share |')
  lines.push('|-------|-------------------|-------|')
  lines.push(`| Scope 1 (Direct) | ${result.breakdown_by_scope.scope1.total.toLocaleString()} | ${result.breakdown_by_scope.scope1.percentage.toFixed(1)}% |`)
  lines.push(`| Scope 2 (Indirect Energy) | ${result.breakdown_by_scope.scope2.total.toLocaleString()} | ${result.breakdown_by_scope.scope2.percentage.toFixed(1)}% |`)
  lines.push(`| Scope 3 (Value Chain) | ${result.breakdown_by_scope.scope3.total.toLocaleString()} | ${result.breakdown_by_scope.scope3.percentage.toFixed(1)}% |`)
  lines.push('')

  const s1Sources = result.breakdown_by_scope.scope1.sources.slice(0, 5)
  if (s1Sources.length > 0) {
    lines.push('### Top Scope 1 Sources')
    for (const s of s1Sources) {
      lines.push(`- ${s.source}: ${s.co2e.toLocaleString()} tCO2e (${s.percentage.toFixed(1)}%)`)
    }
    lines.push('')
  }

  const s3Sources = result.breakdown_by_scope.scope3.sources.slice(0, 5)
  if (s3Sources.length > 0) {
    lines.push('### Top Scope 3 Sources')
    for (const s of s3Sources) {
      lines.push(`- ${s.source}: ${s.co2e.toLocaleString()} tCO2e (${s.percentage.toFixed(1)}%)`)
    }
    lines.push('')
  }

  lines.push('### Intensity Metrics')
  if (result.intensity_metrics.per_revenue) {
    lines.push(`- Revenue intensity: ${result.intensity_metrics.per_revenue.toFixed(1)} ${result.intensity_metrics.per_revenue_unit}`)
  }
  if (result.intensity_metrics.per_employee) {
    lines.push(`- Employee intensity: ${result.intensity_metrics.per_employee.toFixed(1)} tCO2e/employee`)
  }
  lines.push('')

  lines.push('### Reduction Targets')
  lines.push(`- Near-term (2030): ${result.reduction_targets.recommended_near_term.toLocaleString()} tCO2e (30% reduction)`)
  lines.push(`- Long-term (2050): ${result.reduction_targets.recommended_long_term.toLocaleString()} tCO2e (50% reduction)`)
  lines.push(`- Paris-aligned pathway: ${result.reduction_targets.paris_aligned_pathway.toLocaleString()} tCO2e (45% by 2030)`)

  return lines.join('\n')
}

// ==================== TOOL 2: CREDIT VALUATOR ====================

interface CreditValuatorResult {
  credit_value: number
  market_price_range: { low: number; high: number; median: number }
  buyer_demand: 'low' | 'moderate' | 'high' | 'very_high'
  retirement_risk: 'low' | 'medium' | 'high'
  quality_factors: {
    standard_tier: string
    vintage_quality: string
    additionality_rating: string
    permanence_rating: string
  }
  recommendations: string[]
}

function evaluateCarbonCredit(project: ProjectData): CreditValuatorResult {
  const standardPrices: Record<string, { low: number; high: number }> = {
    'VCS': { low: 5, high: 25 },
    'Gold Standard': { low: 8, high: 35 },
    'CAR': { low: 10, high: 30 },
    'ACR': { low: 6, high: 20 },
    'CDM': { low: 3, high: 15 },
    'CDM/JI': { low: 3, high: 12 },
    'CDM JI': { low: 3, high: 12 }
  }

  const typeMultipliers: Record<string, number> = {
    'reforestation': 1.4,
    'afforestation': 1.3,
    'reforestation/afforestation': 1.35,
    'forest': 1.3,
    'REDD+': 1.5,
    'redd+': 1.5,
    'renewable_energy': 1.0,
    'wind': 1.0,
    'solar': 0.95,
    'hydro': 0.9,
    'energy_efficiency': 0.85,
    'methane_capture': 1.1,
    'direct_air_capture': 2.0,
    'biochar': 1.6,
    'soil_carbon': 1.2,
    'blue_carbon': 1.7
  }

  const std = standardPrices[project.standard] ?? { low: 5, high: 20 }
  const mult = typeMultipliers[project.type.toLowerCase()] ?? 1.0

  const basePrice = (std.low + std.high) / 2 * mult
  const vintageFactor = project.vintage >= 2022 ? 1.1 : project.vintage >= 2020 ? 1.0 : 0.8
  const creditValue = basePrice * vintageFactor * (project.additionality_score ?? 0.8)

  const low = std.low * mult * vintageFactor * 0.9
  const high = std.high * mult * vintageFactor * 1.1
  const median = (low + high) / 2

  let buyerDemand: CreditValuatorResult['buyer_demand'] = 'moderate'
  if (['reforestation', 'afforestation', 'direct_air_capture', 'blue_carbon', 'redd+'].includes(project.type.toLowerCase())) {
    buyerDemand = project.vintage >= 2022 ? 'very_high' : 'high'
  } else if (['renewable_energy', 'wind', 'solar'].includes(project.type.toLowerCase())) {
    buyerDemand = 'high'
  }

  let retirementRisk: CreditValuatorResult['retirement_risk'] = 'medium'
  if (project.vintage < 2020) retirementRisk = 'high'
  else if (project.vintage >= 2022 && ['VCS', 'Gold Standard'].includes(project.standard)) retirementRisk = 'low'

  const qualityFactors = {
    standard_tier: ['Gold Standard', 'VCS'].includes(project.standard) ? 'Tier 1 (Premium)' : ['CAR', 'ACR'].includes(project.standard) ? 'Tier 2 (Standard)' : 'Tier 3 (Basic)',
    vintage_quality: project.vintage >= 2023 ? 'Excellent' : project.vintage >= 2021 ? 'Good' : 'Aged — verify issuance',
    additionality_rating: (project.additionality_score ?? 0.8) > 0.8 ? 'High' : (project.additionality_score ?? 0.8) > 0.5 ? 'Moderate' : 'Low — concern',
    permanence_rating: (project.permanence_years ?? 30) >= 50 ? 'Long-term' : (project.permanence_years ?? 30) >= 20 ? 'Medium-term' : 'Short-term — verify buffer pool'
  }

  const recommendations: string[] = []
  if (creditValue > 20) recommendations.push('Premium credit — suitable for corporate net-zero claims')
  if (retirementRisk === 'high') recommendations.push('High retirement risk — consider vintage > 2022 or exchange early')
  if (buyerDemand === 'very_high') recommendations.push('Strong buyer demand — favorable trading conditions')
  if ((project.additionality_score ?? 0.8) < 0.6) recommendations.push('Low additionality — some buyers may discount')

  return {
    credit_value: Math.round(creditValue * 100) / 100,
    market_price_range: { low: Math.round(low * 100) / 100, high: Math.round(high * 100) / 100, median: Math.round(median * 100) / 100 },
    buyer_demand: buyerDemand,
    retirement_risk: retirementRisk,
    quality_factors: qualityFactors,
    recommendations
  }
}

function formatCreditValuatorReport(result: CreditValuatorResult): string {
  const lines: string[] = []
  lines.push('## Carbon Credit Valuation Report')
  lines.push('')
  lines.push(`**Estimated Credit Value:** $${result.credit_value.toFixed(2)}/tCO2e`)
  lines.push('')
  lines.push('### Market Price Range')
  lines.push(`- Low: $${result.market_price_range.low.toFixed(2)} | Median: $${result.market_price_range.median.toFixed(2)} | High: $${result.market_price_range.high.toFixed(2)}`)
  lines.push('')
  lines.push('### Market Assessment')
  lines.push(`- **Buyer Demand:** ${result.buyer_demand.replace('_', ' ').toUpperCase()}`)
  lines.push(`- **Retirement Risk:** ${result.retirement_risk.toUpperCase()}`)
  lines.push('')
  lines.push('### Quality Factors')
  lines.push(`- Standard Tier: ${result.quality_factors.standard_tier}`)
  lines.push(`- Vintage Quality: ${result.quality_factors.vintage_quality}`)
  lines.push(`- Additionality: ${result.quality_factors.additionality_rating}`)
  lines.push(`- Permanence: ${result.quality_factors.permanence_rating}`)
  lines.push('')
  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: CLIMATE RISK SCORER ====================

interface ClimateRiskResult {
  risk_score: number
  scenario_analysis: {
    scenario: string
    warming_c: number
    financial_impact_pct: number
    timeframe: string
    key_risks: string[]
  }[]
  adaptation_costs: {
    estimated_annual_cost_pct_revenue: number
    priority_investments: string[]
    timeline: string
  }
  insurance_implications: {
    premium_impact: string
    coverage_gaps: string[]
    recommended_actions: string[]
  }
}

function scoreClimateRisk(exposure: ExposureData): ClimateRiskResult {
  let baseScore = 0

  const highRiskLocations = ['Bangladesh', 'Philippines', 'Indonesia', 'Vietnam', 'Thailand', 'Miami', 'New Orleans', 'Mumbai', 'Lagos', 'Jakarta']
  const matchingLocations = exposure.locations.filter(l =>
    highRiskLocations.some(hrl => l.toLowerCase().includes(hrl.toLowerCase()))
  )
  baseScore += matchingLocations.length * 8

  const highRiskSectors = ['agriculture', 'insurance', 'real estate', 'tourism', 'fisheries', 'energy', 'manufacturing']
  const matchingSectors = exposure.sectors.filter(s =>
    highRiskSectors.some(hrs => s.toLowerCase().includes(hrs.toLowerCase()))
  )
  baseScore += matchingSectors.length * 6

  baseScore += exposure.physical_risks.length * 5
  baseScore += exposure.transition_risks.length * 4

  const riskScore = Math.min(Math.max(baseScore, 5), 100)

  const scenario_analysis = [
    {
      scenario: 'RCP 2.6 (Strong Mitigation)',
      warming_c: 1.5,
      financial_impact_pct: riskScore * 0.15,
      timeframe: '2050',
      key_risks: ['Policy changes', 'Carbon pricing exposure', 'Market shifts to low-carbon']
    },
    {
      scenario: 'RCP 4.5 (Moderate Action)',
      warming_c: 2.5,
      financial_impact_pct: riskScore * 0.35,
      timeframe: '2050',
      key_risks: ['Increased extreme weather', 'Supply chain disruptions', 'Regulatory tightening', 'Stranded assets']
    },
    {
      scenario: 'RCP 8.5 (High Emissions)',
      warming_c: 4.0,
      financial_impact_pct: riskScore * 0.65,
      timeframe: '2100',
      key_risks: ['Severe physical damage', 'Systemic infrastructure failure', 'Mass migration impacts', 'Agricultural collapse', 'Insurance market failure']
    }
  ]

  const annualCost = Math.max(0.5, riskScore * 0.03)
  const priorityInvestments: string[] = []
  if (exposure.physical_risks.some(r => r.toLowerCase().includes('flood'))) {
    priorityInvestments.push('Flood defense infrastructure and elevation')
  }
  if (exposure.physical_risks.some(r => r.toLowerCase().includes('heat'))) {
    priorityInvestments.push('Cooling systems and heat-resilient design')
  }
  if (exposure.physical_risks.some(r => r.toLowerCase().includes('storm'))) {
    priorityInvestments.push('Storm-proofing and structural reinforcement')
  }
  if (exposure.transition_risks.some(r => r.toLowerCase().includes('carbon'))) {
    priorityInvestments.push('Carbon neutrality pathway investment')
  }
  if (priorityInvestments.length === 0) {
    priorityInvestments.push('Climate risk assessment and monitoring systems')
    priorityInvestments.push('Diversification of supply chain geography')
  }

  const insurance_gaps: string[] = []
  if (riskScore > 60) insurance_gaps.push('Direct physical damage may exceed coverage limits')
  if (exposure.physical_risks.some(r => r.toLowerCase().includes('flood'))) insurance_gaps.push('Flood coverage often requires separate policies')
  if (exposure.transition_risks.some(r => r.toLowerCase().includes('stranded'))) insurance_gaps.push('Stranded asset risk typically uninsurable')

  return {
    risk_score: Math.round(riskScore),
    scenario_analysis,
    adaptation_costs: {
      estimated_annual_cost_pct_revenue: Math.round(annualCost * 100) / 100,
      priority_investments: priorityInvestments,
      timeline: 'Phased over 5-10 years'
    },
    insurance_implications: {
      premium_impact: riskScore > 70 ? 'Significant increase (30-100%)' : riskScore > 40 ? 'Moderate increase (10-30%)' : 'Stable with targeted adjustments',
      coverage_gaps: insurance_gaps,
      recommended_actions: [
        'Review all policies for climate exclusions',
        'Consider parametric insurance for specific perils',
        'Implement risk reduction to lower premiums',
        'Engage with insurers on climate resilience credits'
      ]
    }
  }
}

function formatClimateRiskReport(result: ClimateRiskResult): string {
  const lines: string[] = []
  const riskLevel = result.risk_score > 70 ? 'CRITICAL' : result.risk_score > 50 ? 'HIGH' : result.risk_score > 30 ? 'MODERATE' : 'LOW'

  lines.push('## Climate Risk Assessment Report')
  lines.push('')
  lines.push(`**Overall Risk Score:** ${result.risk_score}/100 (${riskLevel})`)
  lines.push('')

  lines.push('### Scenario Analysis')
  for (const sc of result.scenario_analysis) {
    lines.push(`**${sc.scenario}** (+${sc.warming_c}C by ${sc.timeframe})`)
    lines.push(`- Financial impact: ${sc.financial_impact_pct.toFixed(1)}% of exposed assets`)
    lines.push(`- Key risks: ${sc.key_risks.join(', ')}`)
    lines.push('')
  }

  lines.push('### Adaptation Costs')
  lines.push(`- Estimated annual cost: ${result.adaptation_costs.estimated_annual_cost_pct_revenue.toFixed(2)}% of revenue`)
  lines.push(`- Timeline: ${result.adaptation_costs.timeline}`)
  lines.push('- Priority investments:')
  for (const inv of result.adaptation_costs.priority_investments) {
    lines.push(`  - ${inv}`)
  }
  lines.push('')

  lines.push('### Insurance Implications')
  lines.push(`- Premium impact: ${result.insurance_implications.premium_impact}`)
  if (result.insurance_implications.coverage_gaps.length > 0) {
    lines.push('- Coverage gaps:')
    for (const gap of result.insurance_implications.coverage_gaps) {
      lines.push(`  - ${gap}`)
    }
  }
  lines.push('- Recommended actions:')
  for (const action of result.insurance_implications.recommended_actions) {
    lines.push(`  - ${action}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: RENEWABLE ENERGY OPTIMIZER ====================

interface RenewableOptimizerResult {
  optimal_mix: {
    solar_pct: number
    wind_pct: number
    storage_pct: number
    grid_pct: number
    fossil_pct: number
  }
  cost_savings: {
    annual_savings_usd: number
    savings_pct: number
    five_year_savings: number
  }
  payback_period: {
    solar_payback_years: number
    wind_payback_years: number
    storage_payback_years: number
    blended_payback_years: number
  }
  carbon_reduction: {
    annual_reduction_tons: number
    reduction_pct: number
    offset_equivalent_usd: number
  }
}

function optimizeRenewableEnergy(data: EnergyData): RenewableOptimizerResult {
  const totalUsage = data.current_usage.grid_kwh + data.current_usage.renewable_kwh + data.current_usage.fossil_kwh
  const currentRenewableShare = totalUsage > 0 ? data.current_usage.renewable_kwh / totalUsage : 0

  const solarGen = data.solar_potential.generation_kwh
  const windGen = data.wind_potential.generation_kwh
  const totalRenewableGen = solarGen + windGen
  const renewablePotential = Math.min(totalRenewableGen, totalUsage * 0.85)

  const solarRatio = totalRenewableGen > 0 ? solarGen / totalRenewableGen : 0.5
  const windRatio = totalRenewableGen > 0 ? windGen / totalRenewableGen : 0.5

  const solarContrib = renewablePotential * solarRatio
  const windContrib = renewablePotential * windRatio
  const storageNeeded = renewablePotential * 0.15
  const remainingGrid = totalUsage - renewablePotential
  const fossilRemaining = Math.max(0, remainingGrid * 0.2)

  const optimal_mix = {
    solar_pct: Math.round((solarContrib / totalUsage) * 1000) / 10,
    wind_pct: Math.round((windContrib / totalUsage) * 1000) / 10,
    storage_pct: Math.round((storageNeeded / totalUsage) * 1000) / 10,
    grid_pct: Math.round((Math.max(0, remainingGrid - fossilRemaining) / totalUsage) * 1000) / 10,
    fossil_pct: Math.round((fossilRemaining / totalUsage) * 1000) / 10
  }

  const solarCost = data.solar_potential.capacity_kw * data.solar_potential.cost_per_kw
  const windCost = data.wind_potential.capacity_kw * data.wind_potential.cost_per_kw
  const storageCost = data.storage_options.reduce((s, o) => s + o.capacity_kwh * o.cost_per_kwh, 0)
  const totalInvestment = solarCost + windCost + storageCost

  const gridCostPerKwh = data.current_usage.total_cost_usd / Math.max(totalUsage, 1)
  const blendedRenewableCost = 0.04
  const annualSavings = (gridCostPerKwh - blendedRenewableCost) * renewablePotential
  const savingsPct = data.current_usage.total_cost_usd > 0 ? (annualSavings / data.current_usage.total_cost_usd) * 100 : 0

  const solarPayback = solarCost / Math.max(solarContrib * gridCostPerKwh * 0.6, 1)
  const windPayback = windCost / Math.max(windContrib * gridCostPerKwh * 0.55, 1)
  const storagePayback = storageCost / Math.max(storageNeeded * gridCostPerKwh * 0.3, 1)
  const blendedPayback = totalInvestment / Math.max(annualSavings, 1)

  const carbonIntensityGrid = 0.45
  const annualReduction = renewablePotential * carbonIntensityGrid

  return {
    optimal_mix,
    cost_savings: {
      annual_savings_usd: Math.round(annualSavings),
      savings_pct: Math.round(savingsPct * 10) / 10,
      five_year_savings: Math.round(annualSavings * 5 * 0.9)
    },
    payback_period: {
      solar_payback_years: Math.round(solarPayback * 10) / 10,
      wind_payback_years: Math.round(windPayback * 10) / 10,
      storage_payback_years: Math.round(storagePayback * 10) / 10,
      blended_payback_years: Math.round(blendedPayback * 10) / 10
    },
    carbon_reduction: {
      annual_reduction_tons: Math.round(annualReduction),
      reduction_pct: Math.round((1 - currentRenewableShare) * 85 * 10) / 10,
      offset_equivalent_usd: Math.round(annualReduction * 15)
    }
  }
}

function formatRenewableOptimizerReport(result: RenewableOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Renewable Energy Optimization Report')
  lines.push('')

  lines.push('### Optimal Energy Mix')
  lines.push('| Source | Share |')
  lines.push('|--------|-------|')
  lines.push(`| Solar | ${result.optimal_mix.solar_pct.toFixed(1)}% |`)
  lines.push(`| Wind | ${result.optimal_mix.wind_pct.toFixed(1)}% |`)
  lines.push(`| Storage | ${result.optimal_mix.storage_pct.toFixed(1)}% |`)
  lines.push(`| Grid (backup) | ${result.optimal_mix.grid_pct.toFixed(1)}% |`)
  lines.push(`| Fossil (residual) | ${result.optimal_mix.fossil_pct.toFixed(1)}% |`)
  lines.push('')

  lines.push('### Cost Savings')
  lines.push(`- Annual savings: $${result.cost_savings.annual_savings_usd.toLocaleString()} (${result.cost_savings.savings_pct}% reduction)`)
  lines.push(`- 5-year cumulative savings: $${result.cost_savings.five_year_savings.toLocaleString()}`)
  lines.push('')

  lines.push('### Payback Period')
  lines.push(`- Solar: ${result.payback_period.solar_payback_years} years`)
  lines.push(`- Wind: ${result.payback_period.wind_payback_years} years`)
  lines.push(`- Storage: ${result.payback_period.storage_payback_years} years`)
  lines.push(`- Blended: ${result.payback_period.blended_payback_years} years`)
  lines.push('')

  lines.push('### Carbon Reduction')
  lines.push(`- Annual CO2 reduction: ${result.carbon_reduction.annual_reduction_tons.toLocaleString()} tons`)
  lines.push(`- Emissions reduction: ${result.carbon_reduction.reduction_pct}%`)
  lines.push(`- Offset equivalent value: $${result.carbon_reduction.offset_equivalent_usd.toLocaleString()}/year`)

  return lines.join('\n')
}

// ==================== TOOL 5: ESG REPORTING ENGINE ====================

interface ESGReportingResult {
  gri_content: {
    disclosures: Array<{ code: string; title: string; status: 'complete' | 'partial' | 'missing'; notes: string }>
    coverage_pct: number
  }
  sasb_content: {
    metrics: Array<{ topic: string; value: string; unit: string; industry_benchmark: string }>
    industry_classification: string
  }
  tcfd_content: {
    governance: string
    strategy: string
    risk_management: string
    metrics_targets: string
    alignment_level: 'full' | 'partial' | 'beginner'
  }
  gaps_and_recommendations: {
    critical_gaps: string[]
    improvement_priority: string[]
    timeline: string
  }
}

function generateESGReport(company: CompanyData): ESGReportingResult {
  const griDisclosures: ESGReportingResult['gri_content']['disclosures'] = [
    { code: 'GRI 302', title: 'Energy', status: 'complete', notes: 'Total energy consumption and intensity reported' },
    { code: 'GRI 305', title: 'Emissions', status: 'complete', notes: 'Scope 1, 2, and 3 emissions disclosed with methodology' },
    { code: 'GRI 401', title: 'Employment', status: 'partial', notes: 'Headcount reported; turnover data incomplete' },
    { code: 'GRI 405', title: 'Diversity & Equal Opportunity', status: company.diversity.board_pct_women > 0 ? 'complete' : 'partial', notes: `Board diversity: ${company.diversity.board_pct_women}% women` },
    { code: 'GRI 413', title: 'Local Communities', status: 'missing', notes: 'Community impact assessments not yet conducted' }
  ]

  const completeCount = griDisclosures.filter(d => d.status === 'complete').length
  const coveragePct = Math.round((completeCount / griDisclosures.length) * 100)

  const industryMap: Record<string, string> = {
    'technology': 'Technology & Communications',
    'energy': 'Oil & Gas - Exploration & Production',
    'financial': 'Financial Services - Commercial Banks',
    'healthcare': 'Health Care - Biotechnology',
    'manufacturing': 'Industrial Machinery & Goods',
    'retail': 'Consumer Goods - Retail',
    'utilities': 'Electric Utilities & IPPs'
  }
  const industryKey = Object.keys(industryMap).find(k => company.industry.toLowerCase().includes(k)) ?? 'technology'
  const industryClassification = industryMap[industryKey]

  const sasbMetrics: ESGReportingResult['sasb_content']['metrics'] = [
    { topic: 'GHG Emissions', value: company.emissions.total_co2e.toLocaleString(), unit: 'tCO2e', industry_benchmark: 'Industry avg: 50,000 tCO2e' },
    { topic: 'Emissions Reduction Target', value: `${company.emissions.reduction_target_pct}%`, unit: 'by ' + company.emissions.target_year, industry_benchmark: 'Avg target: 30% by 2030' },
    { topic: 'Board Gender Diversity', value: `${company.diversity.board_pct_women}%`, unit: 'women', industry_benchmark: 'Avg: 25-30%' },
    { topic: 'Gender Pay Gap', value: `${company.diversity.pay_gap_pct}%`, unit: 'gap', industry_benchmark: 'Avg: 12-18%' }
  ]

  const tcfdAlignment: ESGReportingResult['tcfd_content']['alignment_level'] =
    company.governance.science_based_targets && company.governance.net_zero_commitment ? 'full' :
    company.governance.science_based_targets || company.governance.net_zero_commitment ? 'partial' : 'beginner'

  const criticalGaps: string[] = []
  if (!company.governance.science_based_targets) criticalGaps.push('No science-based emissions target (SBTi commitment needed)')
  if (!company.governance.net_zero_commitment) criticalGaps.push('No net-zero commitment declared')
  if (company.diversity.board_pct_women < 20) criticalGaps.push('Board diversity below 20% — governance risk')
  if (company.diversity.pay_gap_pct > 15) criticalGaps.push('Gender pay gap exceeds 15% — social risk')
  if (!company.governance.executive_esg_linked_pay) criticalGaps.push('No ESG-linked executive compensation')

  const improvementPriority: string[] = []
  if (!company.governance.science_based_targets) improvementPriority.push('Submit SBTi commitment within 12 months')
  if (!company.governance.net_zero_commitment) improvementPriority.push('Develop and announce net-zero roadmap')
  if (company.diversity.board_pct_women < 30) improvementPriority.push('Increase board diversity to 30%+ within 2 years')
  if (!company.governance.executive_esg_linked_pay) improvementPriority.push('Link 10-20% of executive pay to ESG metrics')
  improvementPriority.push('Conduct full Scope 3 materiality assessment')
  improvementPriority.push('Publish first standalone ESG report')

  return {
    gri_content: {
      disclosures: griDisclosures,
      coverage_pct: coveragePct
    },
    sasb_content: {
      metrics: sasbMetrics,
      industry_classification: industryClassification
    },
    tcfd_content: {
      governance: company.governance.has_sustainability_committee
        ? 'Board-level sustainability committee established with clear oversight mandate'
        : 'No dedicated sustainability committee — recommend establishing board-level oversight',
      strategy: company.governance.net_zero_commitment
        ? `Net-zero commitment declared with ${company.emissions.reduction_target_pct}% reduction target by ${company.emissions.target_year}`
        : 'Climate strategy not yet formalized — develop scenario-based strategy',
      risk_management: company.governance.science_based_targets
        ? 'Climate risk integrated into enterprise risk management with science-based targets'
        : 'Climate risk management framework needed — start with TCFD gap analysis',
      metrics_targets: `Current: ${company.emissions.total_co2e.toLocaleString()} tCO2e | Target: ${company.emissions.reduction_target_pct}% reduction by ${company.emissions.target_year}`,
      alignment_level: tcfdAlignment
    },
    gaps_and_recommendations: {
      critical_gaps: criticalGaps,
      improvement_priority: improvementPriority,
      timeline: '12-24 months for full alignment with leading frameworks'
    }
  }
}

function formatESGReport(result: ESGReportingResult): string {
  const lines: string[] = []
  lines.push('## ESG Reporting Framework Analysis')
  lines.push('')

  lines.push('### GRI Content Index')
  lines.push(`**Coverage:** ${result.gri_content.coverage_pct}%`)
  lines.push('| Code | Title | Status |')
  lines.push('|------|-------|--------|')
  for (const d of result.gri_content.disclosures) {
    const statusIcon = d.status === 'complete' ? '[COMPLETE]' : d.status === 'partial' ? '[PARTIAL]' : '[MISSING]'
    lines.push(`| ${d.code} | ${d.title} | ${statusIcon} |`)
  }
  lines.push('')

  lines.push('### SASB Metrics')
  lines.push(`**Industry:** ${result.sasb_content.industry_classification}`)
  lines.push('| Topic | Value | Benchmark |')
  lines.push('|-------|-------|-----------|')
  for (const m of result.sasb_content.metrics) {
    lines.push(`| ${m.topic} | ${m.value} ${m.unit} | ${m.industry_benchmark} |`)
  }
  lines.push('')

  lines.push('### TCFD Alignment')
  lines.push(`**Alignment Level:** ${result.tcfd_content.alignment_level.toUpperCase()}`)
  lines.push(`- **Governance:** ${result.tcfd_content.governance}`)
  lines.push(`- **Strategy:** ${result.tcfd_content.strategy}`)
  lines.push(`- **Risk Management:** ${result.tcfd_content.risk_management}`)
  lines.push(`- **Metrics & Targets:** ${result.tcfd_content.metrics_targets}`)
  lines.push('')

  lines.push('### Gaps & Recommendations')
  if (result.gaps_and_recommendations.critical_gaps.length > 0) {
    lines.push('**Critical Gaps:**')
    for (const g of result.gaps_and_recommendations.critical_gaps) {
      lines.push(`- [GAP] ${g}`)
    }
  }
  lines.push('')
  lines.push('**Improvement Priority:**')
  for (const i of result.gaps_and_recommendations.improvement_priority) {
    lines.push(`- ${i}`)
  }
  lines.push(`- Timeline: ${result.gaps_and_recommendations.timeline}`)

  return lines.join('\n')
}

// ==================== TOOL 6: SUPPLY CHAIN EMISSIONS TRACKER ====================

interface SupplyChainResult {
  emissions_by_supplier: Array<{ supplier: string; country: string; estimated_co2e: number; data_quality: string; pct_of_total: number }>
  hotspots: Array<{ category: string; emissions: number; pct: number; risk_level: string }>
  reduction_opportunities: Array<{ action: string; potential_reduction_pct: string; investment_level: string; timeline: string }>
  data_quality_score: number
}

function trackSupplyChainEmissions(supplyChain: SupplierEntry[]): SupplyChainResult {
  const emissionFactors: Record<string, number> = {
    'electronics': 0.45,
    'raw_materials': 0.85,
    'logistics': 0.62,
    'packaging': 0.35,
    'textiles': 0.55,
    'food': 0.40,
    'chemicals': 0.70,
    'metals': 0.90,
    'services': 0.15,
    'manufacturing': 0.50
  }

  const countryFactors: Record<string, number> = {
    'china': 0.58,
    'india': 0.65,
    'united states': 0.35,
    'germany': 0.30,
    'japan': 0.40,
    'brazil': 0.25,
    'vietnam': 0.55,
    'bangladesh': 0.50,
    'default': 0.45
  }

  const supplierEmissions = supplyChain.map(s => {
    const hasReported = s.emissions_data_available && s.reported_co2e !== undefined
    const categoryFactor = emissionFactors[s.category.toLowerCase()] ?? 0.45
    const countryFactor = countryFactors[s.country.toLowerCase()] ?? countryFactors['default']
    const estimatedCO2e = hasReported ? s.reported_co2e! : (s.spend / 1e6) * categoryFactor * countryFactor * 1000
    const dataQuality = hasReported ? 'High (reported)' : 'Medium (estimated)'

    return {
      supplier: s.supplier,
      country: s.country,
      estimated_co2e: Math.round(estimatedCO2e),
      data_quality: dataQuality,
      pct_of_total: 0
    }
  })

  const totalEmissions = supplierEmissions.reduce((s, e) => s + e.estimated_co2e, 0)
  for (const se of supplierEmissions) {
    se.pct_of_total = totalEmissions > 0 ? Math.round((se.estimated_co2e / totalEmissions) * 1000) / 10 : 0
  }

  supplierEmissions.sort((a, b) => b.estimated_co2e - a.estimated_co2e)

  const categoryMap = new Map<string, number>()
  for (let i = 0; i < supplyChain.length; i++) {
    const cat = supplyChain[i].category
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + supplierEmissions[i].estimated_co2e)
  }

  const hotspots = Array.from(categoryMap.entries())
    .map(([cat, emissions]) => ({
      category: cat,
      emissions,
      pct: totalEmissions > 0 ? Math.round((emissions / totalEmissions) * 1000) / 10 : 0,
      risk_level: emissions > totalEmissions * 0.3 ? 'Critical' : emissions > totalEmissions * 0.15 ? 'High' : 'Moderate'
    }))
    .sort((a, b) => b.emissions - a.emissions)

  const reductionOpportunities: SupplyChainResult['reduction_opportunities'] = [
    { action: 'Engage top 3 suppliers on science-based targets', potential_reduction_pct: '15-25%', investment_level: 'Low', timeline: '6-12 months' },
    { action: 'Switch to suppliers with renewable energy', potential_reduction_pct: '10-20%', investment_level: 'Medium', timeline: '12-24 months' },
    { action: 'Optimize logistics routes and modal shift', potential_reduction_pct: '5-15%', investment_level: 'Medium', timeline: '6-18 months' },
    { action: 'Implement supplier code of conduct with emissions clauses', potential_reduction_pct: '10-30%', investment_level: 'Low', timeline: '3-6 months' },
    { action: 'Localize supply chain for high-emission categories', potential_reduction_pct: '8-18%', investment_level: 'High', timeline: '18-36 months' }
  ]

  const reportedCount = supplyChain.filter(s => s.emissions_data_available).length
  const dataQualityScore = supplyChain.length > 0 ? Math.round((reportedCount / supplyChain.length) * 100) : 0

  return {
    emissions_by_supplier: supplierEmissions,
    hotspots,
    reduction_opportunities: reductionOpportunities,
    data_quality_score: dataQualityScore
  }
}

function formatSupplyChainReport(result: SupplyChainResult): string {
  const lines: string[] = []
  lines.push('## Supply Chain Emissions Tracker')
  lines.push('')
  lines.push(`**Data Quality Score:** ${result.data_quality_score}% of suppliers with reported data`)
  lines.push('')

  lines.push('### Emissions by Supplier (Top 10)')
  lines.push('| Supplier | Country | Est. CO2e (tons) | Data Quality | % of Total |')
  lines.push('|----------|---------|------------------|--------------|------------|')
  for (const s of result.emissions_by_supplier.slice(0, 10)) {
    lines.push(`| ${s.supplier} | ${s.country} | ${s.estimated_co2e.toLocaleString()} | ${s.data_quality} | ${s.pct_of_total}% |`)
  }
  lines.push('')

  lines.push('### Emissions Hotspots by Category')
  lines.push('| Category | Emissions (tons) | Share | Risk Level |')
  lines.push('|----------|-----------------|-------|------------|')
  for (const h of result.hotspots) {
    lines.push(`| ${h.category} | ${h.emissions.toLocaleString()} | ${h.pct}% | ${h.risk_level} |`)
  }
  lines.push('')

  lines.push('### Reduction Opportunities')
  for (const r of result.reduction_opportunities) {
    lines.push(`- **${r.action}**`)
    lines.push(`  - Potential: ${r.potential_reduction_pct} | Investment: ${r.investment_level} | Timeline: ${r.timeline}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CARBON OFFSET PORTFOLIO ====================

interface OffsetPortfolioResult {
  portfolio_value: number
  quality_score: number
  diversification: {
    by_type: Array<{ type: string; credits: number; pct: number }>
    by_standard: Array<{ standard: string; credits: number; pct: number }>
    by_vintage: Array<{ vintage: string; credits: number; pct: number }>
    diversification_score: number
  }
  retirement_schedule: Array<{ year: string; credits: number; purpose: string }>
  market_outlook: {
    price_trend: string
    demand_forecast: string
    supply_constraints: string
    recommendation: string
  }
}

function analyzeOffsetPortfolio(offsets: OffsetEntry[]): OffsetPortfolioResult {
  const totalCredits = offsets.reduce((s, o) => s + o.credits, 0)
  const portfolioValue = offsets.reduce((s, o) => s + o.credits * o.price, 0)

  const standardQuality: Record<string, number> = {
    'Gold Standard': 95,
    'VCS': 85,
    'CAR': 80,
    'ACR': 75,
    'CDM': 60
  }

  let weightedQuality = 0
  for (const o of offsets) {
    const q = standardQuality[o.standard] ?? 70
    const vintageBonus = o.vintage >= 2022 ? 5 : o.vintage >= 2020 ? 0 : -10
    weightedQuality += (q + vintageBonus) * o.credits
  }
  const qualityScore = totalCredits > 0 ? Math.round(weightedQuality / totalCredits) : 0

  const typeMap = new Map<string, number>()
  const standardMap = new Map<string, number>()
  const vintageMap = new Map<string, number>()

  for (const o of offsets) {
    typeMap.set(o.project_type, (typeMap.get(o.project_type) ?? 0) + o.credits)
    standardMap.set(o.standard, (standardMap.get(o.standard) ?? 0) + o.credits)
    const vintageBucket = o.vintage >= 2023 ? '2023+' : o.vintage >= 2021 ? '2021-2022' : 'Pre-2021'
    vintageMap.set(vintageBucket, (vintageMap.get(vintageBucket) ?? 0) + o.credits)
  }

  const byType = Array.from(typeMap.entries()).map(([t, c]) => ({
    type: t, credits: c, pct: totalCredits > 0 ? Math.round((c / totalCredits) * 1000) / 10 : 0
  })).sort((a, b) => b.credits - a.credits)

  const byStandard = Array.from(standardMap.entries()).map(([s, c]) => ({
    standard: s, credits: c, pct: totalCredits > 0 ? Math.round((c / totalCredits) * 1000) / 10 : 0
  })).sort((a, b) => b.credits - a.credits)

  const byVintage = Array.from(vintageMap.entries()).map(([v, c]) => ({
    vintage: v, credits: c, pct: totalCredits > 0 ? Math.round((c / totalCredits) * 1000) / 10 : 0
  }))

  const typeCount = typeMap.size
  const standardCount = standardMap.size
  const diversificationScore = Math.min(100, (typeCount * 15) + (standardCount * 10) + (qualityScore > 80 ? 20 : qualityScore > 60 ? 10 : 0))

  const retirementSchedule: OffsetPortfolioResult['retirement_schedule'] = [
    { year: '2025', credits: Math.round(totalCredits * 0.25), purpose: 'Offset current year unavoidable emissions' },
    { year: '2026', credits: Math.round(totalCredits * 0.30), purpose: 'Offset + buffer for growth emissions' },
    { year: '2027', credits: Math.round(totalCredits * 0.25), purpose: 'Progress toward net-zero pathway' },
    { year: '2028+', credits: Math.round(totalCredits * 0.20), purpose: 'Long-term residual emissions offset' }
  ]

  const avgPrice = portfolioValue / Math.max(totalCredits, 1)
  const priceTrend = avgPrice > 20 ? 'Premium pricing — expect continued upward pressure' : avgPrice > 10 ? 'Mid-market — moderate growth expected' : 'Value segment — potential price appreciation as demand grows'

  return {
    portfolio_value: Math.round(portfolioValue),
    quality_score: qualityScore,
    diversification: {
      by_type: byType,
      by_standard: byStandard,
      by_vintage: byVintage,
      diversification_score: diversificationScore
    },
    retirement_schedule: retirementSchedule,
    market_outlook: {
      price_trend: priceTrend,
      demand_forecast: 'Strong growth driven by corporate net-zero commitments and compliance markets',
      supply_constraints: 'High-quality credits (nature-based, 2023+ vintage) increasingly scarce',
      recommendation: diversificationScore < 60 ? 'Diversify across more project types and standards' : 'Portfolio well-diversified — focus on vintage quality'
    }
  }
}

function formatOffsetPortfolioReport(result: OffsetPortfolioResult): string {
  const lines: string[] = []
  lines.push('## Carbon Offset Portfolio Analysis')
  lines.push('')
  lines.push(`**Portfolio Value:** $${result.portfolio_value.toLocaleString()}`)
  lines.push(`**Quality Score:** ${result.quality_score}/100`)
  lines.push(`**Diversification Score:** ${result.diversification.diversification_score}/100`)
  lines.push('')

  lines.push('### Diversification by Type')
  lines.push('| Type | Credits | Share |')
  lines.push('|------|---------|-------|')
  for (const t of result.diversification.by_type) {
    lines.push(`| ${t.type} | ${t.credits.toLocaleString()} | ${t.pct}% |`)
  }
  lines.push('')

  lines.push('### Diversification by Standard')
  lines.push('| Standard | Credits | Share |')
  lines.push('|----------|---------|-------|')
  for (const s of result.diversification.by_standard) {
    lines.push(`| ${s.standard} | ${s.credits.toLocaleString()} | ${s.pct}% |`)
  }
  lines.push('')

  lines.push('### Retirement Schedule')
  lines.push('| Year | Credits | Purpose |')
  lines.push('|------|---------|---------|')
  for (const r of result.retirement_schedule) {
    lines.push(`| ${r.year} | ${r.credits.toLocaleString()} | ${r.purpose} |`)
  }
  lines.push('')

  lines.push('### Market Outlook')
  lines.push(`- **Price Trend:** ${result.market_outlook.price_trend}`)
  lines.push(`- **Demand Forecast:** ${result.market_outlook.demand_forecast}`)
  lines.push(`- **Supply Constraints:** ${result.market_outlook.supply_constraints}`)
  lines.push(`- **Recommendation:** ${result.market_outlook.recommendation}`)

  return lines.join('\n')
}

// ==================== TOOL 8: REGULATORY COMPLIANCE CHECKER ====================

interface ComplianceResult {
  applicable_regulations: Array<{ name: string; jurisdiction: string; scope: string; status: 'applicable' | 'monitoring' | 'not_applicable' }>
  compliance_status: Array<{ regulation: string; status: 'compliant' | 'partial' | 'non_compliant' | 'at_risk'; notes: string }>
  reporting_obligations: Array<{ requirement: string; frequency: string; deadline: string; status: string }>
  deadlines: Array<{ item: string; date: string; urgency: 'imminent' | 'upcoming' | 'future' }>
  penalties: Array<{ regulation: string; potential_penalty: string; risk_level: string }>
}

function checkRegulatoryCompliance(operations: OperationsData): ComplianceResult {
  const regulations: ComplianceResult['applicable_regulations'] = []
  const complianceStatus: ComplianceResult['compliance_status'] = []
  const reportingObligations: ComplianceResult['reporting_obligations'] = []
  const deadlines: ComplianceResult['deadlines'] = []
  const penalties: ComplianceResult['penalties'] = []

  const hasEU = operations.locations.some(l => {
    const eu = ['germany', 'france', 'italy', 'spain', 'netherlands', 'belgium', 'poland', 'sweden', 'austria', 'ireland', 'denmark', 'finland', 'portugal', 'greece', 'czech', 'romania', 'hungary']
    return eu.some(c => l.toLowerCase().includes(c))
  })

  const hasUK = operations.locations.some(l => l.toLowerCase().includes('united kingdom') || l.toLowerCase().includes('uk'))
  const hasUS = operations.locations.some(l => l.toLowerCase().includes('united states') || l.toLowerCase().includes('usa') || l.toLowerCase().includes('california'))
  const hasChina = operations.locations.some(l => l.toLowerCase().includes('china'))

  if (hasEU) {
    regulations.push({ name: 'EU CSRD', jurisdiction: 'European Union', scope: 'ESG disclosure and reporting', status: 'applicable' })
    regulations.push({ name: 'EU ETS', jurisdiction: 'European Union', scope: 'Emissions trading for covered sectors', status: operations.sectors.some(s => ['energy', 'manufacturing', 'steel', 'cement', 'aviation'].includes(s.toLowerCase())) ? 'applicable' : 'monitoring' })
    regulations.push({ name: 'EU Taxonomy', jurisdiction: 'European Union', scope: 'Sustainable activity classification', status: 'applicable' })
    complianceStatus.push({ regulation: 'EU CSRD', status: 'partial', notes: 'Double materiality assessment required; full reporting phased from 2024-2026' })
    complianceStatus.push({ regulation: 'EU ETS', status: operations.emissions.scope1_co2e > 25000 ? 'at_risk' : 'compliant', notes: operations.emissions.scope1_co2e > 25000 ? 'Exceeds 25,000 tCO2e threshold — full ETS compliance required' : 'Below ETS threshold — monitoring only' })
    reportingObligations.push({ requirement: 'CSRD Sustainability Report', frequency: 'Annual', deadline: 'July 2025 (first wave)', status: 'Pending' })
    reportingObligations.push({ requirement: 'EU ETS Emissions Report', frequency: 'Annual', deadline: 'March 31, 2025', status: 'Pending' })
    deadlines.push({ item: 'CSRD first reporting period', date: '2025-07-01', urgency: 'upcoming' })
    deadlines.push({ item: 'EU ETS allowance surrender', date: '2025-04-30', urgency: 'upcoming' })
    penalties.push({ regulation: 'EU CSRD', potential_penalty: 'Up to EUR 10M or 5% of turnover', risk_level: 'High' })
    penalties.push({ regulation: 'EU ETS', potential_penalty: 'EUR 100 per ton excess emissions + make-up requirement', risk_level: 'Critical' })
  }

  if (hasUK) {
    regulations.push({ name: 'UK SECR', jurisdiction: 'United Kingdom', scope: 'Streamlined Energy and Carbon Reporting', status: 'applicable' })
    regulations.push({ name: 'UK ETS', jurisdiction: 'United Kingdom', scope: 'UK Emissions Trading Scheme', status: operations.sectors.some(s => ['energy', 'manufacturing', 'aviation'].includes(s.toLowerCase())) ? 'applicable' : 'monitoring' })
    complianceStatus.push({ regulation: 'UK SECR', status: 'partial', notes: 'Quoted companies and large unquoted companies must report energy and carbon emissions' })
    reportingObligations.push({ requirement: 'SECR Report (in annual report)', frequency: 'Annual', deadline: 'With annual accounts', status: 'Pending' })
    deadlines.push({ item: 'UK ETS emissions return', date: '2025-04-11', urgency: 'upcoming' })
    penalties.push({ regulation: 'UK SECR', potential_penalty: 'Fines for non-disclosure in annual report', risk_level: 'Medium' })
  }

  if (hasUS) {
    regulations.push({ name: 'SEC Climate Disclosure Rule', jurisdiction: 'United States', scope: 'Public company climate risk disclosure', status: 'monitoring' })
    regulations.push({ name: 'California SB 253/261', jurisdiction: 'California, USA', scope: 'Climate corporate data accountability', status: operations.revenue_usd && operations.revenue_usd > 1000000000 ? 'applicable' : 'monitoring' })
    complianceStatus.push({ regulation: 'SEC Climate Rule', status: 'at_risk', notes: 'Rule finalized but facing legal challenges — monitor closely' })
    complianceStatus.push({ regulation: 'California SB 253', status: operations.revenue_usd && operations.revenue_usd > 1000000000 ? 'non_compliant' : 'compliant', notes: operations.revenue_usd && operations.revenue_usd > 1000000000 ? 'Revenue >$1B — Scope 1/2/3 disclosure required from 2026' : 'Below revenue threshold' })
    reportingObligations.push({ requirement: 'SEC Climate Disclosure (if applicable)', frequency: 'Annual', deadline: 'TBD pending litigation', status: 'Monitoring' })
    deadlines.push({ item: 'CA SB 253 first report', date: '2026-01-01', urgency: 'future' })
    penalties.push({ regulation: 'SEC Climate Rule', potential_penalty: 'SEC enforcement action for material misstatements', risk_level: 'Medium' })
  }

  if (hasChina) {
    regulations.push({ name: 'China National ETS', jurisdiction: 'China', scope: 'Power sector emissions trading', status: operations.sectors.some(s => s.toLowerCase().includes('power') || s.toLowerCase().includes('energy')) ? 'applicable' : 'monitoring' })
    complianceStatus.push({ regulation: 'China National ETS', status: 'partial', notes: 'Currently covers power sector; expansion to other sectors expected' })
    reportingObligations.push({ requirement: 'MRV (Monitoring, Reporting, Verification)', frequency: 'Annual', deadline: 'Per provincial schedule', status: 'Pending' })
    penalties.push({ regulation: 'China National ETS', potential_penalty: 'Fine of CNY 20,000-50,000 for non-compliance', risk_level: 'Medium' })
  }

  if (operations.emissions.total_co2e > 50000) {
    regulations.push({ name: 'ISO 14064-1', jurisdiction: 'International', scope: 'GHG quantification and reporting', status: 'applicable' })
    complianceStatus.push({ regulation: 'ISO 14064-1', status: 'partial', notes: 'Voluntary standard — recommended for credibility of emissions data' })
  }

  if (regulations.length === 0) {
    regulations.push({ name: 'GHG Protocol Corporate Standard', jurisdiction: 'International', scope: 'Voluntary emissions accounting', status: 'applicable' })
    complianceStatus.push({ regulation: 'GHG Protocol', status: 'partial', notes: 'Ensure Scope 1, 2, and material Scope 3 categories are reported' })
    reportingObligations.push({ requirement: 'Annual GHG Inventory', frequency: 'Annual', deadline: 'Self-determined', status: 'Recommended' })
  }

  return {
    applicable_regulations: regulations,
    compliance_status: complianceStatus,
    reporting_obligations: reportingObligations,
    deadlines: deadlines.sort((a, b) => {
      const urgencyOrder = { imminent: 0, upcoming: 1, future: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    }),
    penalties: penalties
  }
}

function formatComplianceReport(result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Compliance Assessment')
  lines.push('')

  lines.push('### Applicable Regulations')
  lines.push('| Regulation | Jurisdiction | Scope | Status |')
  lines.push('|------------|--------------|-------|--------|')
  for (const r of result.applicable_regulations) {
    lines.push(`| ${r.name} | ${r.jurisdiction} | ${r.scope} | ${r.status.toUpperCase()} |`)
  }
  lines.push('')

  lines.push('### Compliance Status')
  for (const c of result.compliance_status) {
    const statusIcon = c.status === 'compliant' ? '[COMPLIANT]' : c.status === 'partial' ? '[PARTIAL]' : c.status === 'at_risk' ? '[AT RISK]' : '[NON-COMPLIANT]'
    lines.push(`- **${c.regulation}** ${statusIcon}: ${c.notes}`)
  }
  lines.push('')

  lines.push('### Reporting Obligations')
  lines.push('| Requirement | Frequency | Deadline | Status |')
  lines.push('|-------------|-----------|----------|--------|')
  for (const r of result.reporting_obligations) {
    lines.push(`| ${r.requirement} | ${r.frequency} | ${r.deadline} | ${r.status} |`)
  }
  lines.push('')

  lines.push('### Upcoming Deadlines')
  for (const d of result.deadlines) {
    const urgencyIcon = d.urgency === 'imminent' ? '[IMMINENT]' : d.urgency === 'upcoming' ? '[UPCOMING]' : '[FUTURE]'
    lines.push(`- ${urgencyIcon} ${d.item}: ${d.date}`)
  }
  lines.push('')

  lines.push('### Penalty Risks')
  for (const p of result.penalties) {
    lines.push(`- **${p.regulation}** (${p.risk_level} risk): ${p.potential_penalty}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'carbon_footprint_calculator',
    description: 'Calculate total carbon footprint from Scope 1, 2, and 3 emissions data. Provides breakdown by scope, intensity metrics (per revenue/employee), and science-based reduction targets aligned with Paris Agreement pathways.',
    parameters: {
      emissions_data: { type: 'string', required: true, description: 'JSON object with scope1, scope2, scope3 arrays of emission sources (each with source, co2e_tons, unit, quantity, emission_factor), plus optional reporting_year, revenue_usd, employees' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { emissions_data: string }) {
      const data: EmissionsData = JSON.parse(args.emissions_data)
      const result = calculateCarbonFootprint(data)
      return formatCarbonFootprintReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'carbon_credit_valuator',
    description: 'Evaluate carbon credit value based on project type, standard, vintage, location, and quality factors. Provides market price range, buyer demand assessment, retirement risk, and quality ratings.',
    parameters: {
      project_data: { type: 'string', required: true, description: 'JSON object with fields: type (e.g. reforestation, renewable_energy, direct_air_capture), location, vintage (year), standard (VCS/Gold Standard/CAR/ACR/CDM), co2_reduction (tons), optional verification_body, permanence_years, additionality_score (0-1)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { project_data: string }) {
      const data: ProjectData = JSON.parse(args.project_data)
      const result = evaluateCarbonCredit(data)
      return formatCreditValuatorReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'climate_risk_scorer',
    description: 'Assess climate risk exposure across physical and transition risk dimensions. Generates risk score, scenario analysis (RCP 2.6/4.5/8.5), adaptation cost estimates, and insurance implications.',
    parameters: {
      exposure_data: { type: 'string', required: true, description: 'JSON object with fields: locations (array of strings), sectors (array of strings), physical_risks (array of strings), transition_risks (array of strings), optional annual_revenue, asset_value' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { exposure_data: string }) {
      const data: ExposureData = JSON.parse(args.exposure_data)
      const result = scoreClimateRisk(data)
      return formatClimateRiskReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'renewable_energy_optimizer',
    description: 'Optimize renewable energy mix based on solar/wind potential, storage options, and current energy usage. Returns optimal generation mix, cost savings, payback periods, and carbon reduction estimates.',
    parameters: {
      energy_data: { type: 'string', required: true, description: 'JSON object with fields: current_usage (grid_kwh, renewable_kwh, fossil_kwh, total_cost_usd), solar_potential (capacity_kw, generation_kwh, cost_per_kw), wind_potential (capacity_kw, generation_kwh, cost_per_kw), storage_options (array of type, capacity_kwh, cost_per_kwh, efficiency)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { energy_data: string }) {
      const data: EnergyData = JSON.parse(args.energy_data)
      const result = optimizeRenewableEnergy(data)
      return formatRenewableOptimizerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'esg_reporting_engine',
    description: 'Generate ESG reporting framework content aligned with GRI, SASB, and TCFD standards. Provides disclosure status, industry-specific metrics, gap analysis, and improvement recommendations.',
    parameters: {
      company_data: { type: 'string', required: true, description: 'JSON object with fields: industry, emissions (total_co2e, reduction_target_pct, target_year), diversity (board_pct_women, workforce_pct_women, pay_gap_pct), governance (has_sustainability_committee, executive_esg_linked_pay, science_based_targets, net_zero_commitment)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { company_data: string }) {
      const data: CompanyData = JSON.parse(args.company_data)
      const result = generateESGReport(data)
      return formatESGReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'supply_chain_emissions_tracker',
    description: 'Track and estimate supply chain emissions by supplier and category. Identifies emissions hotspots, calculates data quality scores, and provides reduction opportunities with investment levels.',
    parameters: {
      supply_chain_data: { type: 'string', required: true, description: 'JSON array of supplier objects with fields: supplier (name), country, spend (USD), category, optional emissions_data_available (boolean), reported_co2e (tons)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { supply_chain_data: string }) {
      const data: SupplierEntry[] = JSON.parse(args.supply_chain_data)
      const result = trackSupplyChainEmissions(data)
      return formatSupplyChainReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'carbon_offset_portfolio',
    description: 'Analyze carbon offset portfolio for value, quality, diversification, and retirement scheduling. Provides market outlook, diversification scoring, and strategic recommendations.',
    parameters: {
      offsets: { type: 'string', required: true, description: 'JSON array of offset entries with fields: project_type, credits (number), vintage (year), standard (VCS/Gold Standard/CAR/ACR/CDM), price (USD per credit)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { offsets: string }) {
      const data: OffsetEntry[] = JSON.parse(args.offsets)
      const result = analyzeOffsetPortfolio(data)
      return formatOffsetPortfolioReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'regulatory_compliance_checker',
    description: 'Check regulatory compliance across jurisdictions (EU, UK, US, China). Identifies applicable regulations, compliance status, reporting obligations, deadlines, and penalty risks.',
    parameters: {
      operations_data: { type: 'string', required: true, description: 'JSON object with fields: locations (array of strings), sectors (array of strings), emissions (total_co2e, scope1_co2e, scope2_co2e), optional employees, revenue_usd' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { operations_data: string }) {
      const data: OperationsData = JSON.parse(args.operations_data)
      const result = checkRegulatoryCompliance(data)
      return formatComplianceReport(result)
    }
  }))

  console.log(`[dsh-tool-climate] Loaded v${VERSION} — Climate & Carbon Credit Analyzer with 8 tools`)
  console.log('  Tools: carbon_footprint_calculator, carbon_credit_valuator, climate_risk_scorer, renewable_energy_optimizer, esg_reporting_engine, supply_chain_emissions_tracker, carbon_offset_portfolio, regulatory_compliance_checker')
}
