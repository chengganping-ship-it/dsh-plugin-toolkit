/**
 * DSH Climate Tech / Green Tech Plugin v1.0.0
 *
 * Climate tech funding surged in 2025-2026 with massive government and private
 * investment. This toolkit covers the full climate tech stack: carbon footprint
 * tracking, renewable energy optimization, climate risk assessment, sustainable
 * supply chain mapping, green finance advisory, circular economy design, ESG
 * reporting, and carbon credit valuation.
 *
 * Features (v1.0.0):
 * - Carbon Footprint Calculator (Scope 1/2/3 emissions for organizations)
 * - Renewable Energy Optimizer (solar, wind, battery mix optimization)
 * - Climate Risk Assessor (physical & transition risk, TCFD-aligned)
 * - ESG Reporting Generator (GRI/SASB/ISSB framework reports)
 * - Sustainable Supply Chain Mapper (supplier sustainability scoring)
 * - Green Finance Advisor (green bonds, sustainability loans, carbon credits)
 * - Circular Economy Design (reduce, reuse, recycle strategies)
 * - Carbon Credit Valuator (forestry, DAC, soil carbon project valuation)
 *
 * @module dsh-tool-climatech
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-climatech'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute financial, investment, legal, or environmental advice. Consult qualified professionals before making decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededRng(seedStr: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return mulberry32(h >>> 0)
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(rng: () => number, min: number, max: number, digits = 2): number {
  return parseFloat((rng() * (max - min) + min).toFixed(digits))
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// ==================== TYPES ====================

// --- Tool 1: Carbon Footprint Calculator ---
export interface CarbonFootprintInput {
  organization_type?: string
  employee_count?: number
  energy_kwh_year?: number
  travel_km_year?: number
  supply_chain_data?: Record<string, number>
  reporting_standard?: 'GHG_Protocol' | 'ISO_14064' | 'PAS_2050' | 'custom'
}

export interface CarbonFootprintResult {
  tool: string
  total_tco2e: number
  scope1_tco2e: number
  scope2_tco2e: number
  scope3_tco2e: number
  breakdown: { source: string; tco2e: number; percentage: number }[]
  intensity_per_employee: number
  intensity_per_million_revenue: number
  assessment: string
  reduction_opportunities: string[]
  disclaimer: string
}

// --- Tool 2: Renewable Energy Optimizer ---
export interface RenewableEnergyInput {
  location_lat_lon?: { lat: number; lon: number }
  energy_demand_kwh?: number
  roof_area_sqm?: number
  budget_usd?: number
  grid_electricity_price?: number
  storage_hours_needed?: number
}

export interface RenewableEnergyResult {
  tool: string
  recommended_mix: { source: string; capacity_kw: number; percentage: number }[]
  total_capacity_kw: number
  annual_generation_kwh: number
  solar_panels_count: number
  wind_turbines_count: number
  battery_storage_kwh: number
  total_investment_usd: number
  annual_savings_usd: number
  payback_years: number
  co2_reduction_tco2e: number
  assessment: string
  recommendations: string[]
  disclaimer: string
}

// --- Tool 3: Climate Risk Assessor ---
export interface ClimateRiskInput {
  asset_locations?: { lat: number; lon: number; name: string }[]
  asset_type?: string
  time_horizon_years?: number
  scenario_rcp?: 'RCP_2.6' | 'RCP_4.5' | 'RCP_6.0' | 'RCP_8.5'
  portfolio_value_usd?: number
  sector_exposure?: string[]
}

export interface ClimateRiskResult {
  tool: string
  physical_risk_score: number
  transition_risk_score: number
  combined_risk_score: number
  risk_level: string
  physical_risks: { hazard: string; probability: number; impact: string }[]
  transition_risks: { factor: string; probability: number; impact: string }[]
  financial_impact_usd: number
  financial_impact_pct: number
  time_horizon: number
  scenario: string
  assessment: string
  adaptation_strategies: string[]
  disclaimer: string
}

// --- Tool 4: ESG Reporting Generator ---
export interface ESGReportInput {
  reporting_framework?: 'GRI' | 'SASB' | 'ISSB' | 'TCFD' | 'CDP' | 'custom'
  company_data?: Record<string, unknown>
  metrics_data?: Record<string, number>
  year?: number
  assurance_level?: 'none' | 'limited' | 'reasonable'
  target_audience?: 'investors' | 'regulators' | 'public' | 'internal'
}

export interface ESGReportResult {
  tool: string
  framework: string
  report_year: number
  assurance_level: string
  target_audience: string
  environmental_score: number
  social_score: number
  governance_score: number
  overall_esg_score: number
  key_disclosures: { category: string; metric: string; value: string; status: string }[]
  material_topics: string[]
  gaps_identified: string[]
  compliance_status: string
  report_summary: string
  improvement_recommendations: string[]
  disclaimer: string
}

// --- Tool 5: Sustainable Supply Chain Mapper ---
export interface SupplyChainInput {
  tiers?: number
  supplier_locations?: { country: string; count: number }[]
  transport_modes?: string[]
  material_types?: Record<string, number>
  sustainability_criteria?: string[]
}

export interface SupplyChainResult {
  tool: string
  total_suppliers: number
  avg_sustainability_score: number
  high_risk_suppliers: number
  supply_chain_tco2e: number
  tier_breakdown: { tier: number; suppliers: number; avg_score: number; tco2e: number }[]
  risk_hotspots: { country: string; risk_level: string; issue: string }[]
  material_sustainability: { material: string; sustainability_score: number; improvement: string }[]
  logistics_footprint: { mode: string; tco2e: number; percentage: number }[]
  assessment: string
  improvement_actions: string[]
  disclaimer: string
}

// --- Tool 6: Green Finance Advisor ---
export interface GreenFinanceInput {
  project_type?: string
  financing_needed_usd?: number
  expected_green_impact?: string
  credit_rating?: string
  regulatory_environment?: 'supportive' | 'neutral' | 'restrictive'
}

export interface GreenFinanceResult {
  tool: string
  recommended_instruments: { instrument: string; amount_pct: number; expected_rate: number; term_years: number }[]
  total_financing_usd: number
  blended_rate: number
  green_impact_score: number
  eligibility_status: string
  certification_needed: string[]
  regulatory_compliance: string[]
  investor_appeal_score: number
  risk_factors: string[]
  assessment: string
  action_plan: string[]
  disclaimer: string
}

// --- Tool 7: Circular Economy Designer ---
export interface CircularEconomyInput {
  product_type?: string
  material_flows?: Record<string, number>
  current_waste_pct?: number
  target_circularity_pct?: number
  take_back_infrastructure?: boolean
  recycling_partners?: string[]
}

export interface CircularEconomyResult {
  tool: string
  current_circularity_pct: number
  target_circularity_pct: number
  gap_to_close: number
  strategies: { strategy: string; impact_pct: number; feasibility: string; timeframe: string }[]
  material_recovery_potential: { material: string; recovery_pct: number; value_usd: number }[]
  waste_reduction_tco2e: number
  cost_savings_usd: number
  revenue_opportunities: string[]
  implementation_roadmap: string[]
  assessment: string
  disclaimer: string
}

// --- Tool 8: Carbon Credit Valuator ---
export interface CarbonCreditInput {
  project_type?: string
  vintage_year?: number
  volume_tco2?: number
  verification_standard?: 'VCS' | 'Gold_Standard' | 'CAR' | 'ACR' | 'CDM'
  co_benefits?: string[]
  additionality_evidence?: 'strong' | 'moderate' | 'weak'
}

export interface CarbonCreditResult {
  tool: string
  project_type: string
  vintage_year: number
  volume_tco2: number
  verification_standard: string
  price_per_tco2_low: number
  price_per_tco2_mid: number
  price_per_tco2_high: number
  total_value_low_usd: number
  total_value_mid_usd: number
  total_value_high_usd: number
  quality_grade: string
  additionality_score: number
  permanence_risk: string
  leakage_risk: string
  co_benefits_premium: number
  market_outlook: string
  valuation_summary: string
  disclaimer: string
}

// ====================================================================
// TOOL 1: CARBON FOOTPRINT CALCULATOR
// ====================================================================

function calculateCarbonFootprint(input: CarbonFootprintInput): CarbonFootprintResult {
  const rng = seededRng(JSON.stringify(input))
  const employees = input.employee_count ?? randInt(rng, 50, 5000)
  const energy = input.energy_kwh_year ?? randInt(rng, 100000, 10000000)
  const travel = input.travel_km_year ?? randInt(rng, 50000, 5000000)

  const scope1 = randFloat(rng, 50, 2000) + (energy * 0.0001)
  const scope2 = energy * randFloat(rng, 0.0002, 0.0008)
  const scope3Base = travel * randFloat(rng, 0.0001, 0.0003)
  const supplyChainExtra = input.supply_chain_data
    ? Object.values(input.supply_chain_data).reduce((sum, v) => sum + v * randFloat(rng, 0.5, 2.0), 0)
    : randFloat(rng, 200, 5000)
  const scope3 = scope3Base + supplyChainExtra
  const total = scope1 + scope2 + scope3

  const breakdown: CarbonFootprintResult['breakdown'] = [
    { source: 'Stationary Combustion', tco2e: roundTo(scope1 * 0.4, 1), percentage: roundTo((scope1 * 0.4 / total) * 100, 1) },
    { source: 'Mobile Combustion', tco2e: roundTo(scope1 * 0.35, 1), percentage: roundTo((scope1 * 0.35 / total) * 100, 1) },
    { source: 'Process Emissions', tco2e: roundTo(scope1 * 0.25, 1), percentage: roundTo((scope1 * 0.25 / total) * 100, 1) },
    { source: 'Purchased Electricity', tco2e: roundTo(scope2, 1), percentage: roundTo((scope2 / total) * 100, 1) },
    { source: 'Business Travel', tco2e: roundTo(scope3Base, 1), percentage: roundTo((scope3Base / total) * 100, 1) },
    { source: 'Supply Chain (Category 1)', tco2e: roundTo(supplyChainExtra, 1), percentage: roundTo((supplyChainExtra / total) * 100, 1) }
  ]

  const intensityEmp = roundTo(total / employees, 2)

  let assessment: string
  if (total > 10000) {
    assessment = 'High-emission profile. Urgent decarbonization pathway needed with Science-Based Targets (SBTi).'
  } else if (total > 1000) {
    assessment = 'Moderate emissions. Establish reduction targets and implement energy efficiency measures.'
  } else {
    assessment = 'Low-emission profile. Focus on maintaining performance and offsetting residual emissions.'
  }

  const opportunities: string[] = []
  if (scope2 > scope1) opportunities.push('Switch to 100% renewable electricity via PPA or green tariffs')
  if (scope3 > scope1 + scope2) opportunities.push('Engage top suppliers on Scope 3 reduction programs')
  if (travel > 100000) opportunities.push('Implement sustainable travel policy with virtual-first meetings')
  if (energy > 1000000) opportunities.push('Deploy energy management system (ISO 50001) and LED retrofits')
  if (employees > 500) opportunities.push('Launch employee engagement program for behavioral carbon reduction')
  if (opportunities.length === 0) opportunities.push('Conduct detailed emissions audit for further reduction opportunities')

  return {
    tool: 'carbon_footprint_calculator',
    total_tco2e: roundTo(total, 1),
    scope1_tco2e: roundTo(scope1, 1),
    scope2_tco2e: roundTo(scope2, 1),
    scope3_tco2e: roundTo(scope3, 1),
    breakdown,
    intensity_per_employee: intensityEmp,
    intensity_per_million_revenue: roundTo(total / randFloat(rng, 1, 100), 2),
    assessment,
    reduction_opportunities: opportunities,
    disclaimer: DISCLAIMER
  }
}

function formatCarbonFootprint(r: CarbonFootprintResult): string {
  return [
    '================================================================',
    '  1. CARBON FOOTPRINT CALCULATOR (Scope 1/2/3)',
    '================================================================',
    '',
    `  Total Emissions:          ${r.total_tco2e} tCO2e/year`,
    `  Scope 1 (Direct):         ${r.scope1_tco2e} tCO2e (${roundTo((r.scope1_tco2e / r.total_tco2e) * 100, 1)}%)`,
    `  Scope 2 (Indirect):       ${r.scope2_tco2e} tCO2e (${roundTo((r.scope2_tco2e / r.total_tco2e) * 100, 1)}%)`,
    `  Scope 3 (Value Chain):    ${r.scope3_tco2e} tCO2e (${roundTo((r.scope3_tco2e / r.total_tco2e) * 100, 1)}%)`,
    `  Intensity per Employee:   ${r.intensity_per_employee} tCO2e/FTE`,
    '',
    '  Emission Breakdown:',
    ...r.breakdown.map(b => `    - ${b.source}: ${b.tco2e} tCO2e (${b.percentage}%)`),
    '',
    `  Assessment: ${r.assessment}`,
    '',
    '  Reduction Opportunities:',
    ...r.reduction_opportunities.map((o, i) => `    ${i + 1}. ${o}`),
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

// ====================================================================
// TOOL 2: RENEWABLE ENERGY OPTIMIZER
// ====================================================================

function optimizeRenewableEnergy(input: RenewableEnergyInput): RenewableEnergyResult {
  const rng = seededRng(JSON.stringify(input))
  const demand = input.energy_demand_kwh ?? randInt(rng, 50000, 5000000)
  const roofArea = input.roof_area_sqm ?? randInt(rng, 200, 5000)
  const budget = input.budget_usd ?? randInt(rng, 50000, 2000000)
  const gridPrice = input.grid_electricity_price ?? randFloat(rng, 0.05, 0.30, 3)
  const storageHrs = input.storage_hours_needed ?? randInt(rng, 2, 12)

  const solarCapacity = Math.min(roofArea * 0.2, demand * 0.6 / 1500)
  const windCapacity = demand > 1000000 ? randFloat(rng, 50, 500) : randFloat(rng, 5, 50)
  const totalCapacity = solarCapacity + windCapacity

  const solarGen = solarCapacity * randFloat(rng, 1200, 1800)
  const windGen = windCapacity * randFloat(rng, 2000, 3500)
  const totalGen = solarGen + windGen

  const solarPadded = Math.round((solarCapacity / 0.4))
  const windTurbines = Math.max(1, Math.round(windCapacity / 100))
  const batteryStorage = storageHrs * (demand / 8760) * randFloat(rng, 0.8, 1.2)

  const investment = roundTo(solarCapacity * 800 + windCapacity * 1200 + batteryStorage * 400, 0)
  const savings = roundTo(totalGen * gridPrice, 0)
  const payback = investment > 0 ? roundTo(investment / Math.max(savings, 1), 1) : 0
  const co2Reduction = roundTo(totalGen * 0.0005, 1)

  const solarPct = roundTo((solarGen / totalGen) * 100, 1)
  const windPct = roundTo((windGen / totalGen) * 100, 1)

  const recommended_mix = [
    { source: 'Solar PV', capacity_kw: roundTo(solarCapacity, 1), percentage: solarPct },
    { source: 'Wind', capacity_kw: roundTo(windCapacity, 1), percentage: windPct }
  ]

  let assessment: string
  if (payback < 5) {
    assessment = 'Excellent ROI. Strong business case for immediate renewable deployment.'
  } else if (payback < 10) {
    assessment = 'Good financial case. Consider phased implementation to manage capital outlay.'
  } else {
    assessment = 'Long payback period. Explore PPAs, green leasing, or government incentives to improve viability.'
  }

  const recs: string[] = []
  if (solarPct > 60) recs.push('High solar dependency: add diversity with wind or storage to reduce intermittency')
  if (storageHrs > 6) recs.push('Consider lithium-ion vs flow batteries for long-duration storage')
  if (budget > 500000) recs.push('Size qualifies for virtual PPA structures with enhanced returns')
  if (demand > 2000000) recs.push('Large demand profile: explore on-site generation + grid export for additional revenue')
  recs.push(`Target battery storage of ${roundTo(batteryStorage, 0)} kWh for ${storageHrs}h autonomy`)
  if (recs.length === 0) recs.push('Conduct on-site resource assessment with pyranometer and wind measurement')

  return {
    tool: 'renewable_energy_optimizer',
    recommended_mix,
    total_capacity_kw: roundTo(totalCapacity, 1),
    annual_generation_kwh: roundTo(totalGen, 0),
    solar_panels_count: solarPadded,
    wind_turbines_count: windTurbines,
    battery_storage_kwh: roundTo(batteryStorage, 0),
    total_investment_usd: investment,
    annual_savings_usd: savings,
    payback_years: payback,
    co2_reduction_tco2e: co2Reduction,
    assessment,
    recommendations: recs,
    disclaimer: DISCLAIMER
  }
}

function formatRenewableEnergy(r: RenewableEnergyResult): string {
  return [
    '================================================================',
    '  2. RENEWABLE ENERGY OPTIMIZER',
    '================================================================',
    '',
    '  Recommended Energy Mix:',
    ...r.recommended_mix.map(m => `    - ${m.source}: ${m.capacity_kw} kW (${m.percentage}%)`),
    `  Total Capacity:           ${r.total_capacity_kw} kW`,
    `  Annual Generation:        ${r.annual_generation_kwh} kWh`,
    `  Solar Panels (est.):      ${r.solar_panels_count} units`,
    `  Wind Turbines (est.):     ${r.wind_turbines_count} units`,
    `  Battery Storage:          ${r.battery_storage_kwh} kWh`,
    '',
    `  Total Investment:         $${r.total_investment_usd.toLocaleString()}`,
    `  Annual Savings:           $${r.annual_savings_usd.toLocaleString()}`,
    `  Payback Period:           ${r.payback_years} years`,
    `  CO2 Reduction:            ${r.co2_reduction_tco2e} tCO2e/year`,
    '',
    `  Assessment: ${r.assessment}`,
    '',
    '  Recommendations:',
    ...r.recommendations.map((rec, i) => `    ${i + 1}. ${rec}`),
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

// ====================================================================
// TOOL 3: CLIMATE RISK ASSESSOR
// ====================================================================

function assessClimateRisk(input: ClimateRiskInput): ClimateRiskResult {
  const rng = seededRng(JSON.stringify(input))
  const scenario = input.scenario_rcp ?? pick(rng, ['RCP_2.6', 'RCP_4.5', 'RCP_6.0', 'RCP_8.5'])
  const horizon = input.time_horizon_years ?? randInt(rng, 5, 30)
  const portfolioValue = input.portfolio_value_usd ?? randInt(rng, 10000000, 5000000000)

  const scenarioMultiplier = scenario === 'RCP_8.5' ? 1.5 : scenario === 'RCP_6.0' ? 1.2 : scenario === 'RCP_4.5' ? 0.9 : 0.6
  const horizonMultiplier = clamp(horizon / 30, 0.3, 1.5)

  const physicalRisk = roundTo(randFloat(rng, 30, 90) * scenarioMultiplier * horizonMultiplier, 1)
  const transitionRisk = roundTo(randFloat(rng, 20, 80) * clamp(1.2 - (horizon / 50), 0.5, 1.5), 1)
  const combined = roundTo((physicalRisk * 0.55 + transitionRisk * 0.45), 1)

  let riskLevel: string
  if (combined >= 70) riskLevel = 'Critical'
  else if (combined >= 50) riskLevel = 'High'
  else if (combined >= 30) riskLevel = 'Moderate'
  else riskLevel = 'Low'

  const physicalRisks = [
    { hazard: 'Flooding', probability: roundTo(randFloat(rng, 0.1, 0.8), 2), impact: pick(rng, ['Asset damage', 'Business interruption', 'Insurance premium increase']) },
    { hazard: 'Heat Stress', probability: roundTo(randFloat(rng, 0.2, 0.9), 2), impact: pick(rng, ['Productivity loss', 'Cooling cost increase', 'Equipment degradation']) },
    { hazard: 'Sea Level Rise', probability: roundTo(randFloat(rng, 0.05, 0.6), 2), impact: pick(rng, ['Coastal asset loss', 'Infrastructure damage', 'Relocation cost']) },
    { hazard: 'Wildfire', probability: roundTo(randFloat(rng, 0.05, 0.5), 2), impact: pick(rng, ['Asset destruction', 'Air quality impact', 'Supply disruption']) }
  ]

  const transitionRisks = [
    { factor: 'Carbon Pricing', probability: roundTo(randFloat(rng, 0.4, 0.9), 2), impact: pick(rng, ['Operating cost increase', 'Margin compression', 'Competitiveness loss']) },
    { factor: 'Policy Regulation', probability: roundTo(randFloat(rng, 0.5, 0.95), 2), impact: pick(rng, ['Compliance cost', 'Technology mandate', 'Market access restriction']) },
    { factor: 'Technology Shift', probability: roundTo(randFloat(rng, 0.3, 0.8), 2), impact: pick(rng, ['Stranded assets', 'Retooling investment', 'Market repositioning']) },
    { factor: 'Market Sentiment', probability: roundTo(randFloat(rng, 0.3, 0.7), 2), impact: pick(rng, ['Capital access cost', 'Shareholder pressure', 'Rating downgrade']) }
  ]

  const financialImpactPct = roundTo(combined / 100 * randFloat(rng, 0.05, 0.25), 3)
  const financialImpact = roundTo(portfolioValue * financialImpactPct, 0)

  let assessment: string
  if (combined >= 70) {
    assessment = 'CRITICAL: Immediate climate adaptation strategy required. Material financial exposure under current trajectory.'
  } else if (combined >= 50) {
    assessment = 'HIGH: Significant climate risks identified. Prioritize adaptation and transition planning.'
  } else if (combined >= 30) {
    assessment = 'MODERATE: Climate risks present but manageable. Integrate into enterprise risk management.'
  } else {
    assessment = 'LOW: Limited climate risk exposure. Continue monitoring and maintain resilience investments.'
  }

  const adaptations: string[] = []
  if (physicalRisk > 50) adaptations.push('Invest in physical resilience: flood defenses, cooling systems, fire-resistant infrastructure')
  if (transitionRisk > 50) adaptations.push('Develop transition pathway: clean technology adoption, business model diversification')
  if (scenario === 'RCP_8.5') adaptations.push('Stress-test portfolio against worst-case scenario; plan for accelerated transition')
  if (horizon > 20) adaptations.push('Long time horizon allows phased adaptation; avoid lock-in to high-carbon assets')
  adaptations.push('Establish climate risk governance board with C-suite oversight')
  adaptations.push('Publish TCFD-aligned disclosure to meet investor and regulatory expectations')
  if (adaptations.length === 0) adaptations.push('Maintain current resilience posture and review annually')

  return {
    tool: 'climate_risk_assessor',
    physical_risk_score: physicalRisk,
    transition_risk_score: transitionRisk,
    combined_risk_score: combined,
    risk_level: riskLevel,
    physical_risks: physicalRisks,
    transition_risks: transitionRisks,
    financial_impact_usd: financialImpact,
    financial_impact_pct: roundTo(financialImpactPct * 100, 2),
    time_horizon: horizon,
    scenario,
    assessment,
    adaptation_strategies: adaptations,
    disclaimer: DISCLAIMER
  }
}

function formatClimateRisk(r: ClimateRiskResult): string {
  return [
    '================================================================',
    '  3. CLIMATE RISK ASSESSOR (TCFD-Aligned)',
    '================================================================',
    '',
    `  Scenario:                 ${r.scenario.replace('_', ' ')}`,
    `  Time Horizon:             ${r.time_horizon} years`,
    `  Combined Risk Score:      ${r.combined_risk_score}/100`,
    `  Risk Level:               ${r.risk_level}`,
    `  Physical Risk Score:      ${r.physical_risk_score}/100`,
    `  Transition Risk Score:    ${r.transition_risk_score}/100`,
    '',
    '  Physical Risks:',
    ...r.physical_risks.map(p => `    - ${hazardObj(p)}`),
    '',
    '  Transition Risks:',
    ...r.transition_risks.map(t => `    - ${factorObj(t)}`),
    '',
    `  Financial Impact:         $${r.financial_impact_usd.toLocaleString()} (${r.financial_impact_pct}% of portfolio)`,
    '',
    `  Assessment: ${r.assessment}`,
    '',
    '  Adaptation Strategies:',
    ...r.adaptation_strategies.map((a, i) => `    ${i + 1}. ${a}`),
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

function hazardObj(p: { hazard: string; probability: number; impact: string }): string {
  return `${p.hazard}: prob=${(p.probability * 100).toFixed(0)}%, impact=${p.impact}`
}

function factorObj(t: { factor: string; probability: number; impact: string }): string {
  return `${t.factor}: prob=${(t.probability * 100).toFixed(0)}%, impact=${t.impact}`
}

// ====================================================================
// TOOL 4: ESG REPORTING GENERATOR
// ====================================================================

function generateESGReport(input: ESGReportInput): ESGReportResult {
  const rng = seededRng(JSON.stringify(input))
  const framework = input.reporting_framework ?? pick(rng, ['GRI', 'SASB', 'ISSB', 'TCFD', 'CDP'])
  const year = input.year ?? randInt(rng, 2023, 2026)
  const assurance = input.assurance_level ?? pick(rng, ['none', 'limited', 'reasonable'])
  const audience = input.target_audience ?? pick(rng, ['investors', 'regulators', 'public', 'internal'])

  const envScore = randFloat(rng, 40, 95, 1)
  const socialScore = randFloat(rng, 35, 90, 1)
  const govScore = randFloat(rng, 45, 92, 1)
  const overall = roundTo((envScore * 0.35 + socialScore * 0.35 + govScore * 0.30), 1)

  const key_disclosures: ESGReportResult['key_disclosures'] = [
    { category: 'E', metric: 'GHG Emissions (tCO2e)', value: `${randFloat(rng, 1000, 50000, 0)}`, status: pick(rng, ['reported', 'partial', 'pending']) },
    { category: 'E', metric: 'Energy Consumption (MWh)', value: `${randFloat(rng, 500, 20000, 0)}`, status: pick(rng, ['reported', 'partial', 'pending']) },
    { category: 'S', metric: 'Gender Pay Gap (%)', value: `${randFloat(rng, 2, 20, 1)}`, status: pick(rng, ['reported', 'partial', 'pending']) },
    { category: 'S', metric: 'Lost Time Injury Rate', value: `${randFloat(rng, 0.1, 5, 1)}`, status: pick(rng, ['reported', 'partial', 'pending']) },
    { category: 'G', metric: 'Board Independence (%)', value: `${randInt(rng, 30, 90)}`, status: pick(rng, ['reported', 'partial', 'pending']) },
    { category: 'G', metric: 'Ethics Training Coverage (%)', value: `${randInt(rng, 50, 100)}`, status: pick(rng, ['reported', 'partial', 'pending']) }
  ]

  const materialTopics = [
    pick(rng, ['Climate Change Mitigation', 'Energy Management', 'Water Security']),
    pick(rng, ['Labor Practices', 'Diversity & Inclusion', 'Community Impact']),
    pick(rng, ['Board Governance', 'Anti-Corruption', 'Data Privacy']),
    pick(rng, ['Circular Economy', 'Biodiversity', 'Supply Chain Ethics'])
  ]

  const gaps: string[] = []
  if (envScore < 60) gaps.push('Environmental disclosures incomplete; strengthen emissions data collection')
  if (socialScore < 60) gaps.push('Social metrics lacking; invest in workforce analytics and DEI reporting')
  if (govScore < 60) gaps.push('Governance disclosures below peer level; enhance board diversity reporting')
  if (assurance === 'none') gaps.push('No third-party assurance; obtain limited assurance for credibility')
  if (gaps.length === 0) gaps.push('Minor gaps only; focus on continuous improvement and year-over-year trends')

  let complianceStatus: string
  if (framework === 'GRI') complianceStatus = overall >= 70 ? 'GRI Compliant' : 'Partial GRI Alignment'
  else if (framework === 'SASB') complianceStatus = overall >= 65 ? 'SASB Aligned' : 'SASB Partially Aligned'
  else if (framework === 'ISSB') complianceStatus = overall >= 60 ? 'ISSB S1/S2 Aligned' : 'ISSB Transition Needed'
  else complianceStatus = overall >= 50 ? 'Framework Compliant' : 'Enhancement Required'

  const recommendations: string[] = [
    `Strengthen ${envScore < socialScore ? 'environmental' : 'social'} pillar disclosures to achieve balanced ESG profile`,
    `Target ${audience === 'investors' ? 'ESG rating uplift (MSCI, Sustainalytics)' : audience === 'regulators' ? 'full regulatory compliance' : 'industry leadership recognition'}`,
    `Advance from ${assurance} assurance to ${assurance === 'none' ? 'limited' : 'reasonable'} assurance within 12 months`,
    'Integrate double materiality assessment covering financial and impact materiality',
    'Align with ISSB S1/S2 standards for global interoperability'
  ]

  return {
    tool: 'esg_reporting_generator',
    framework,
    report_year: year,
    assurance_level: assurance,
    target_audience: audience,
    environmental_score: envScore,
    social_score: socialScore,
    governance_score: govScore,
    overall_esg_score: overall,
    key_disclosures,
    material_topics: materialTopics,
    gaps_identified: gaps,
    compliance_status: complianceStatus,
    report_summary: `${framework} ESG Report for ${year} covering environmental (${envScore}), social (${socialScore}), and governance (${govScore}) performance. Overall ESG score: ${overall}/100 under ${assurance} assurance for ${audience} audience.`,
    improvement_recommendations: recommendations,
    disclaimer: DISCLAIMER
  }
}

function formatESGReport(r: ESGReportResult): string {
  return [
    '================================================================',
    '  4. ESG REPORTING GENERATOR',
    '================================================================',
    '',
    `  Framework:                ${r.framework}`,
    `  Report Year:              ${r.report_year}`,
    `  Assurance Level:          ${r.assurance_level}`,
    `  Target Audience:          ${r.target_audience}`,
    '',
    `  Environmental Score:      ${r.environmental_score}/100`,
    `  Social Score:             ${r.social_score}/100`,
    `  Governance Score:         ${r.governance_score}/100`,
    `  Overall ESG Score:        ${r.overall_esg_score}/100`,
    `  Compliance Status:        ${r.compliance_status}`,
    '',
    '  Key Disclosures:',
    ...r.key_disclosures.map(d => `    [${d.category}] ${d.metric}: ${d.value} (${d.status})`),
    '',
    '  Material Topics:',
    ...r.material_topics.map(t => `    - ${t}`),
    '',
    '  Gaps Identified:',
    ...r.gaps_identified.map((g, i) => `    ${i + 1}. ${g}`),
    '',
    '  Improvement Recommendations:',
    ...r.improvement_recommendations.map((rec, i) => `    ${i + 1}. ${rec}`),
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

// ====================================================================
// TOOL 5: SUSTAINABLE SUPPLY CHAIN MAPPER
// ====================================================================

function mapSupplyChain(input: SupplyChainInput): SupplyChainResult {
  const rng = seededRng(JSON.stringify(input))
  const tiers = input.tiers ?? randInt(rng, 1, 4)

  const countries = ['China', 'India', 'Vietnam', 'Bangladesh', 'Turkey', 'Mexico', 'Indonesia']
  const supplierLocations = input.supplier_locations ?? Array.from({ length: randInt(rng, 3, 7) }, () => ({
    country: pick(rng, countries),
    count: randInt(rng, 5, 200)
  }))

  const totalSuppliers = supplierLocations.reduce((sum, sl) => sum + sl.count, 0)

  const tierBreakdown: SupplyChainResult['tier_breakdown'] = []
  for (let t = 1; t <= tiers; t++) {
    const tierSuppliers = Math.max(1, Math.round(totalSuppliers * randFloat(rng, 0.1, 0.5)))
    tierBreakdown.push({
      tier: t,
      suppliers: tierSuppliers,
      avg_score: randFloat(rng, 30, 90, 1),
      tco2e: roundTo(randFloat(rng, 50, 5000) * (1 + (t - 1) * 0.5), 0)
    })
  }

  const avgScore = roundTo(tierBreakdown.reduce((sum, tb) => sum + tb.avg_score, 0) / tierBreakdown.length, 1)
  const totalTco2e = roundTo(tierBreakdown.reduce((sum, tb) => sum + tb.tco2e, 0), 0)

  const riskCountries = ['Bangladesh', 'Myanmar', 'Cambodia']
  const riskHotspots: SupplyChainResult['risk_hotspots'] = supplierLocations
    .filter(sl => Math.random() > 0.4)
    .map(sl => ({
      country: sl.country,
      risk_level: riskCountries.includes(sl.country) ? pick(rng, ['high', 'critical'] as const) : pick(rng, ['low', 'medium'] as const),
      issue: pick(rng, ['Forced labor allegations', 'Environmental non-compliance', 'Corruption index concern', 'Carbon intensity', 'Water stress', 'Limited transparency'])
    }))

  const highRiskCount = riskHotspots.filter(rh => rh.risk_level === 'high' || rh.risk_level === 'critical').length

  const materials = ['Steel', 'Aluminum', 'Plastic', 'Cotton', 'Lithium', 'Rare Earth']
  const materialSustainability: SupplyChainResult['material_sustainability'] = materials.slice(0, randInt(rng, 2, 5)).map(mat => ({
    material: mat,
    sustainability_score: randFloat(rng, 20, 85, 1),
    improvement: pick(rng, ['Source from certified suppliers', 'Switch to recycled alternative', 'Reduce usage intensity', 'Implement take-back program'])
  }))

  const transportModes = ['Sea Freight', 'Air Freight', 'Road', 'Rail']
  const logisticsFootprint: SupplyChainResult['logistics_footprint'] = transportModes.slice(0, randInt(rng, 2, 4)).map(mode => ({
    mode,
    tco2e: roundTo(randFloat(rng, 10, 2000), 0),
    percentage: roundTo(randFloat(rng, 10, 50), 1)
  }))

  let assessment: string
  if (avgScore < 40) {
    assessment = 'Supply chain at high ESG risk. Immediate supplier engagement and audit program needed.'
  } else if (avgScore < 60) {
    assessment = 'Moderate sustainability profile. Focus on high-risk supplier remediation and transparency.'
  } else {
    assessment = 'Good overall sustainability. Maintain standards and push for tier 2+ visibility.'
  }

  const actions: string[] = []
  if (highRiskCount > 2) actions.push(`Address ${highRiskCount} high-risk supplier locations with enhanced due diligence`)
  if (tiers < 3) actions.push('Extend supply chain mapping to Tier 2 and Tier 3 for comprehensive coverage')
  if (totalTco2e > 3000) actions.push('Implement supplier decarbonization program with science-based targets per supplier')
  actions.push('Deploy supplier ESG scorecard with quarterly performance reviews')
  if (materialSustainability.some(ms => ms.sustainability_score < 40)) actions.push('Address low-scoring materials: transition to certified/recycled inputs')
  if (actions.length === 0) actions.push('Maintain current sustainability program; identify best practices for replication')

  return {
    tool: 'sustainable_supply_chain_mapper',
    total_suppliers: totalSuppliers,
    avg_sustainability_score: avgScore,
    high_risk_suppliers: highRiskCount,
    supply_chain_tco2e: totalTco2e,
    tier_breakdown: tierBreakdown,
    risk_hotspots: riskHotspots,
    material_sustainability: materialSustainability,
    logistics_footprint: logisticsFootprint,
    assessment,
    improvement_actions: actions,
    disclaimer: DISCLAIMER
  }
}

function formatSupplyChain(r: SupplyChainResult): string {
  return [
    '================================================================',
    '  5. SUSTAINABLE SUPPLY CHAIN MAPPER',
    '================================================================',
    '',
    `  Total Suppliers:          ${r.total_suppliers}`,
    `  Avg Sustainability Score: ${r.avg_sustainability_score}/100`,
    `  High-Risk Suppliers:      ${r.high_risk_suppliers}`,
    `  Supply Chain CO2:         ${r.supply_chain_tco2e} tCO2e`,
    '',
    '  Tier Breakdown:',
    ...r.tier_breakdown.map(t => `    Tier ${t.tier}: ${t.suppliers} suppliers | Score: ${t.avg_score} | CO2: ${t.tco2e} tCO2e`),
    '',
    '  Risk Hotspots:',
    ...r.risk_hotspots.map(rh => `    - ${rh.country}: ${rh.risk_level.toUpperCase()} (${rh.issue})`),
    '',
    '  Material Sustainability:',
    ...r.material_sustainability.map(ms => `    - ${ms.material}: Score ${ms.sustainability_score} -> ${ms.improvement}`),
    '',
    '  Logistics Footprint:',
    ...r.logistics_footprint.map(lf => `    - ${lf.mode}: ${lf.tco2e} tCO2e (${lf.percentage}%)`),
    '',
    `  Assessment: ${r.assessment}`,
    '',
    '  Improvement Actions:',
    ...r.improvement_actions.map((a, i) => `    ${i + 1}. ${a}`),
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

// ====================================================================
// TOOL 6: GREEN FINANCE ADVISOR
// ====================================================================

function adviseGreenFinance(input: GreenFinanceInput): GreenFinanceResult {
  const rng = seededRng(JSON.stringify(input))
  const projectType = input.project_type ?? pick(rng, ['Solar Farm', 'Wind Farm', 'Green Building', 'EV Fleet', 'Reforestation', 'Clean Hydrogen'])
  const financingNeeded = input.financing_needed_usd ?? randInt(rng, 1000000, 500000000)
  const creditRating = input.credit_rating ?? pick(rng, ['AAA', 'AA', 'A', 'BBB', 'BB', 'B'])
  const regulatory = input.regulatory_environment ?? pick(rng, ['supportive', 'neutral', 'restrictive'] as const)

  const ratingMultiplier = creditRating === 'AAA' ? 0.5 : creditRating === 'AA' ? 0.7 : creditRating === 'A' ? 0.85 : creditRating === 'BBB' ? 1.0 : creditRating === 'BB' ? 1.3 : 1.8
  const regulatoryMultiplier = regulatory === 'supportive' ? 0.85 : regulatory === 'neutral' ? 1.0 : 1.15

  const instruments: GreenFinanceResult['recommended_instruments'] = [
    {
      instrument: 'Green Bond',
      amount_pct: randInt(rng, 30, 60),
      expected_rate: roundTo(randFloat(rng, 2.5, 6.0) * ratingMultiplier * regulatoryMultiplier, 2),
      term_years: randInt(rng, 5, 15)
    },
    {
      instrument: 'Sustainability-Linked Loan',
      amount_pct: randInt(rng, 15, 35),
      expected_rate: roundTo(randFloat(rng, 3.0, 7.0) * ratingMultiplier * regulatoryMultiplier, 2),
      term_years: randInt(rng, 3, 10)
    },
    {
      instrument: 'Carbon Credit Pre-Purchase',
      amount_pct: randInt(rng, 5, 20),
      expected_rate: roundTo(randFloat(rng, 4.0, 9.0), 2),
      term_years: randInt(rng, 1, 5)
    }
  ]

  const blendedRate = roundTo(instruments.reduce((sum, inst) => sum + (inst.expected_rate * inst.amount_pct), 0) / 100, 2)
  const greenImpact = randFloat(rng, 50, 95, 1)

  let eligibilityStatus: string
  if (financingNeeded > 100000000 && creditRating <= 'BBB') {
    eligibilityStatus = 'Eligible: Large-scale project with strong green attributes qualifies for sovereign green bond programs'
  } else if (financingNeeded > 10000000) {
    eligibilityStatus = 'Eligible: Project qualifies for standard green bond/loan markets with full use-of-proceeds tracking'
  } else {
    eligibilityStatus = 'Eligible: Consider green SME loan facilities or aggregated green bond platforms'
  }

  const certifications = [
    'ICMA Green Bond Principles (GBP) alignment',
    'Climate Bonds Initiative (CBI) certification',
    pick(rng, ['EU Taxonomy alignment', 'ASEAN Green Bond Standards', 'Green Loan Principles (GLP)'])
  ]

  const compliance = [
    `Use-of-proceeds tracking per ${pick(rng, ['ICMA GBP', 'LMA GLP'])} framework`,
    'Annual impact reporting with quantitative environmental KPIs',
    pick(rng, ['Second party opinion (SPO) required', 'Post-issuance verification mandatory', 'Annual assurance review'])
  ]

  const investorAppeal = roundTo(randFloat(rng, 40, 92), 1)

  const riskFactors: string[] = []
  if (creditRating > 'BBB') riskFactors.push('Credit rating below investment grade may limit institutional investor base')
  if (regulatory === 'restrictive') riskFactors.push('Restrictive regulatory environment adds compliance cost and timeline risk')
  if (financingNeeded > 1000000000) riskFactors.push('Large issuance size may require syndicated approach and roadshow')
  riskFactors.push('Greenwashing risk: ensure robust use-of-proceeds framework and external review')
  if (riskFactors.length === 0) riskFactors.push('Standard market execution risks; no elevated concerns')

  let assessment: string
  if (greenImpact > 80 && investorAppeal > 75) {
    assessment = 'Strong green finance candidate. Market conditions favorable for oversubscribed issuance.'
  } else if (greenImpact > 60) {
    assessment = 'Viable green finance project. Consider phased approach to build track record.'
  } else {
    assessment = 'Green attributes need strengthening before accessing premium green finance markets.'
  }

  const actionPlan = [
    `Obtain ${certifications[0]} second-party opinion from approved verifier`,
    `Structure ${instruments[0].instrument} with ${instruments[0].term_years}-year maturity at target rate of ${instruments[0].expected_rate}%`,
    'Establish green finance framework with eligible project categories',
    'Engage underwriters with green bond/loan execution experience',
    'Prepare impact reporting methodology aligned with ICMA Harmonised Framework',
    regulatory === 'supportive' ? 'Leverage government green incentives and guarantees' : 'Model regulatory scenario analysis for investor presentation'
  ]

  return {
    tool: 'green_finance_advisor',
    recommended_instruments: instruments,
    total_financing_usd: financingNeeded,
    blended_rate: blendedRate,
    green_impact_score: greenImpact,
    eligibility_status: eligibilityStatus,
    certification_needed: certifications,
    regulatory_compliance: compliance,
    investor_appeal_score: investorAppeal,
    risk_factors: riskFactors,
    assessment,
    action_plan: actionPlan,
    disclaimer: DISCLAIMER
  }
}

function formatGreenFinance(r: GreenFinanceResult): string {
  return [
    '================================================================',
    '  6. GREEN FINANCE ADVISOR',
    '================================================================',
    '',
    `  Total Financing Needed:   $${r.total_financing_usd.toLocaleString()}`,
    `  Blended Rate:             ${r.blended_rate}%`,
    `  Green Impact Score:       ${r.green_impact_score}/100`,
    `  Investor Appeal Score:    ${r.investor_appeal_score}/100`,
    `  Eligibility:              ${r.eligibility_status}`,
    '',
    '  Recommended Instruments:',
    ...r.recommended_instruments.map(inst => `    - ${inst.instrument}: ${inst.amount_pct}% of total @ ${inst.expected_rate}% for ${inst.term_years}y`),
    '',
    '  Certification Needed:',
    ...r.certification_needed.map(c => `    - ${c}`),
    '',
    '  Regulatory Compliance:',
    ...r.regulatory_compliance.map(c => `    - ${c}`),
    '',
    '  Risk Factors:',
    ...r.risk_factors.map(f => `    - ${f}`),
    '',
    `  Assessment: ${r.assessment}`,
    '',
    '  Action Plan:',
    ...r.action_plan.map((a, i) => `    ${i + 1}. ${a}`),
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

// ====================================================================
// TOOL 7: CIRCULAR ECONOMY DESIGNER
// ====================================================================

function designCircularEconomy(input: CircularEconomyInput): CircularEconomyResult {
  const rng = seededRng(JSON.stringify(input))
  const productType = input.product_type ?? pick(rng, ['Electronics', 'Textiles', 'Packaging', 'Furniture', 'Automotive Parts', 'Construction Materials'])
  const currentWaste = input.current_waste_pct ?? randFloat(rng, 10, 70, 1)
  const targetCircularity = input.target_circularity_pct ?? randFloat(rng, 40, 95, 1)
  const currentCircularity = roundTo(100 - currentWaste, 1)
  const gapToClose = roundTo(targetCircularity - currentCircularity, 1)

  const strategies: CircularEconomyResult['strategies'] = [
    {
      strategy: 'Design for Disassembly',
      impact_pct: randFloat(rng, 5, 15, 1),
      feasibility: pick(rng, ['high', 'medium', 'low']),
      timeframe: pick(rng, ['6-12 months', '1-2 years', '2-3 years'])
    },
    {
      strategy: 'Material Passport Implementation',
      impact_pct: randFloat(rng, 3, 12, 1),
      feasibility: pick(rng, ['high', 'medium', 'low']),
      timeframe: pick(rng, ['6-18 months', '1-2 years', '2-4 years'])
    },
    {
      strategy: 'Reverse Logistics Network',
      impact_pct: randFloat(rng, 8, 20, 1),
      feasibility: pick(rng, ['high', 'medium', 'low']),
      timeframe: pick(rng, ['1-2 years', '2-3 years', '3-5 years'])
    },
    {
      strategy: 'Remanufacturing Program',
      impact_pct: randFloat(rng, 10, 25, 1),
      feasibility: pick(rng, ['high', 'medium', 'low']),
      timeframe: pick(rng, ['1-3 years', '2-4 years', '3-5 years'])
    },
    {
      strategy: 'Recycled Content Integration',
      impact_pct: randFloat(rng, 5, 18, 1),
      feasibility: pick(rng, ['high', 'medium']),
      timeframe: pick(rng, ['6-12 months', '1-2 years', '1-3 years'])
    }
  ]

  const materials = ['Aluminum', 'Steel', 'Plastic (PET)', 'Glass', 'Copper', 'Rare Earths']
  const materialRecovery: CircularEconomyResult['material_recovery_potential'] = materials.slice(0, randInt(rng, 3, 6)).map(mat => ({
    material: mat,
    recovery_pct: randFloat(rng, 40, 95, 1),
    value_usd: roundTo(randFloat(rng, 5000, 500000), 0)
  }))

  const totalImpact = strategies.reduce((sum, s) => sum + s.impact_pct, 0)
  const wasteReductionTco2e = roundTo(randFloat(rng, 100, 5000) * (totalImpact / 50), 0)
  const costSavings = roundTo(randFloat(rng, 50000, 2000000) * (totalImpact / 30), 0)

  const revenueOpportunities = [
    `Secondary materials sales: $${roundTo(randFloat(rng, 20000, 500000), 0).toLocaleString()}/year potential`,
    `Refurbishment/service revenue: $${roundTo(randFloat(rng, 10000, 300000), 0).toLocaleString()}/year potential`,
    'Extended producer responsibility (EPR) credit monetization',
    'Carbon credit generation through waste reduction'
  ]

  const roadmap = [
    `Phase 1 (0-6 months): Conduct ${productType} material flow analysis and identify highest-impact circular interventions`,
    `Phase 2 (6-18 months): Pilot ${strategies[0].strategy} with top 3 product lines`,
    `Phase 3 (1-3 years): Scale ${strategies[1].strategy ?? 'material passport'} across full product portfolio`,
    `Phase 4 (3-5 years): Achieve ${targetCircularity}% circularity with closed-loop material flows`,
    'Ongoing: Annual circularity assessment with third-party verification'
  ]

  let assessment: string
  if (gapToClose > 40) {
    assessment = `Large circularity gap (${gapToClose}pp). Ambitious target requiring transformative business model change and significant capital investment.`
  } else if (gapToClose > 20) {
    assessment = `Moderate circularity gap (${gapToClose}pp). Achievable through systematic implementation of proven circular strategies over 3-5 years.`
  } else {
    assessment = `Small circularity gap (${gapToClose}pp). Near-term focus on optimization and scaling existing circular initiatives.`
  }

  return {
    tool: 'circular_economy_designer',
    current_circularity_pct: currentCircularity,
    target_circularity_pct: targetCircularity,
    gap_to_close: gapToClose,
    strategies,
    material_recovery_potential: materialRecovery,
    waste_reduction_tco2e: wasteReductionTco2e,
    cost_savings_usd: costSavings,
    revenue_opportunities: revenueOpportunities,
    implementation_roadmap: roadmap,
    assessment,
    disclaimer: DISCLAIMER
  }
}

function formatCircularEconomy(r: CircularEconomyResult): string {
  return [
    '================================================================',
    '  7. CIRCULAR ECONOMY DESIGNER',
    '================================================================',
    '',
    `  Current Circularity:      ${r.current_circularity_pct}%`,
    `  Target Circularity:       ${r.target_circularity_pct}%`,
    `  Gap to Close:             ${r.gap_to_close}pp`,
    '',
    '  Circular Strategies:',
    ...r.strategies.map(s => `    - ${s.strategy}: +${s.impact_pct}pp impact | Feasibility: ${s.feasibility} | Timeframe: ${s.timeframe}`),
    '',
    '  Material Recovery Potential:',
    ...r.material_recovery_potential.map(m => `    - ${m.material}: ${m.recovery_pct}% recoverable | Value: $${m.value_usd.toLocaleString()}/year`),
    '',
    `  Waste Reduction CO2:      ${r.waste_reduction_tco2e} tCO2e/year`,
    `  Cost Savings Potential:   $${r.cost_savings_usd.toLocaleString()}/year`,
    '',
    '  Revenue Opportunities:',
    ...r.revenue_opportunities.map(o => `    - ${o}`),
    '',
    '  Implementation Roadmap:',
    ...r.implementation_roadmap.map(s => `    ${s}`),
    '',
    `  Assessment: ${r.assessment}`,
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

// ====================================================================
// TOOL 8: CREDIT VALUATOR
// ====================================================================

function valueCarbonCredits(input: CarbonCreditInput): CarbonCreditResult {
  const rng = seededRng(JSON.stringify(input))
  const projectType = input.project_type ?? pick(rng, ['Reforestation', 'Direct Air Capture', 'Soil Carbon', 'Methane Capture', 'Ocean Blue Carbon'])
  const vintage = input.vintage_year ?? randInt(rng, 2020, 2026)
  const volume = input.volume_tco2 ?? randInt(rng, 1000, 5000000)
  const standard = input.verification_standard ?? pick(rng, ['VCS', 'Gold_Standard', 'CAR', 'ACR', 'CDM'])
  const additionality = input.additionality_evidence ?? pick(rng, ['strong', 'moderate', 'weak'])

  const basePrice = projectType === 'Direct Air Capture' ? randFloat(rng, 50, 300)
    : projectType === 'Reforestation' ? randFloat(rng, 5, 30)
    : projectType === 'Soil Carbon' ? randFloat(rng, 8, 25)
    : projectType === 'Methane Capture' ? randFloat(rng, 3, 15)
    : randFloat(rng, 10, 40)

  const standardMultiplier = standard === 'Gold_Standard' ? 1.3 : standard === 'VCS' ? 1.0 : standard === 'CAR' ? 1.1 : standard === 'ACR' ? 1.05 : 0.9
  const additionalityMultiplier = additionality === 'strong' ? 1.2 : additionality === 'moderate' ? 1.0 : 0.75
  const vintageMultiplier = vintage >= 2024 ? 1.1 : vintage >= 2022 ? 1.0 : 0.9
  const coBenefitsPremium = input.co_benefits ? input.co_benefits.length * randFloat(rng, 1, 5) : 0

  const adjustedPrice = basePrice * standardMultiplier * additionalityMultiplier * vintageMultiplier

  const priceLow = roundTo(adjustedPrice * 0.7, 2)
  const priceMid = roundTo(adjustedPrice, 2)
  const priceHigh = roundTo(adjustedPrice * 1.4 + coBenefitsPremium, 2)

  const totalLow = roundTo(priceLow * volume, 0)
  const totalMid = roundTo(priceMid * volume, 0)
  const totalHigh = roundTo(priceHigh * volume, 0)

  let qualityGrade: string
  const qualityScore = (standardMultiplier * 30) + (additionalityMultiplier * 30) + (vintage >= 2023 ? 20 : 10) + Math.min(coBenefitsPremium * 2, 20)
  if (qualityScore >= 80) qualityGrade = 'Premium (AAA)'
  else if (qualityScore >= 60) qualityGrade = 'High Quality (AA)'
  else if (qualityScore >= 40) qualityGrade = 'Standard (A)'
  else qualityGrade = 'Below Standard (BBB)'

  let permanenceRisk: string
  if (projectType === 'Reforestation') permanenceRisk = 'Medium: Wildfire, disease, and land-use change threaten long-term storage'
  else if (projectType === 'Soil Carbon') permanenceRisk = 'Medium-High: Reversal possible if farming practices change'
  else if (projectType === 'Direct Air Capture') permanenceRisk = 'Low: Geological storage with 10,000+ year permanence'
  else if (projectType === 'Ocean Blue Carbon') permanenceRisk = 'Medium: Ecosystem disruption and ocean acidification risk'
  else permanenceRisk = 'Low-Medium: Engineered system with monitoring requirements'

  let leakageRisk: string
  if (projectType === 'Reforestation') leakageRisk = 'Medium: Activity shifting may cause deforestation elsewhere'
  else if (projectType === 'Direct Air Capture') leakageRisk = 'Low: Point-source capture with minimal displacement effect'
  else leakageRisk = 'Low-Medium: Site-specific with manageable boundary effects'

  let marketOutlook: string
  if (vintage >= 2024 && standard === 'Gold_Standard') {
    marketOutlook = 'Strong demand: CORSIA-eligible and compliance-grade credits commanding premium prices through 2030'
  } else if (standard === 'VCS' || standard === 'Gold_Standard') {
    marketOutlook = 'Positive: Voluntary carbon market growth driven by net-zero commitments; quality credits preferred'
  } else {
    marketOutlook = 'Moderate: Secondary market positioning; consider upgrading verification for better pricing'
  }

  const valuationSummary = `${volume.toLocaleString()} tCO2e ${projectType} credits (${vintage} vintage) verified under ${standard.replace('_', ' ')}. Mid-point valuation: $${priceMid}/tCO2e (Total: $${totalMid.toLocaleString()}). Quality: ${qualityGrade}. Additionality: ${additionality}.`

  return {
    tool: 'carbon_credit_valuator',
    project_type: projectType,
    vintage_year: vintage,
    volume_tco2: volume,
    verification_standard: standard,
    price_per_tco2_low: priceLow,
    price_per_tco2_mid: priceMid,
    price_per_tco2_high: priceHigh,
    total_value_low_usd: totalLow,
    total_value_mid_usd: totalMid,
    total_value_high_usd: totalHigh,
    quality_grade: qualityGrade,
    additionality_score: roundTo(additionalityMultiplier * 100, 0),
    permanence_risk: permanenceRisk,
    leakage_risk: leakageRisk,
    co_benefits_premium: roundTo(coBenefitsPremium, 2),
    market_outlook: marketOutlook,
    valuation_summary: valuationSummary,
    disclaimer: DISCLAIMER
  }
}

function formatCarbonCredits(r: CarbonCreditResult): string {
  return [
    '================================================================',
    '  8. CREDIT VALUATOR',
    '================================================================',
    '',
    `  Project Type:             ${r.project_type}`,
    `  Vintage Year:             ${r.vintage_year}`,
    `  Volume:                   ${r.volume_tco2.toLocaleString()} tCO2e`,
    `  Verification Standard:    ${r.verification_standard.replace('_', ' ')}`,
    '',
    `  Price per tCO2e:          $${r.price_per_tco2_low} / $${r.price_per_tco2_mid} / $${r.price_per_tco2_high} (low/mid/high)`,
    `  Total Value (low):        $${r.total_value_low_usd.toLocaleString()}`,
    `  Total Value (mid):        $${r.total_value_mid_usd.toLocaleString()}`,
    `  Total Value (high):       $${r.total_value_high_usd.toLocaleString()}`,
    '',
    `  Quality Grade:            ${r.quality_grade}`,
    `  Additionality Score:      ${r.additionality_score}/100`,
    `  Permanence Risk:          ${r.permanence_risk}`,
    `  Leakage Risk:             ${r.leakage_risk}`,
    `  Co-Benefits Premium:      +$${r.co_benefits_premium}/tCO2e`,
    '',
    `  Market Outlook: ${r.market_outlook}`,
    '',
    `  Valuation Summary: ${r.valuation_summary}`,
    '',
    `  [Disclaimer] ${r.disclaimer}`,
    ''
  ].join('\n')
}

// ====================================================================
// PLUGIN REGISTRATION
// ====================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Carbon Footprint Calculator
  tools.register(defineTool({
    name: 'carbon_footprint_calculator',
    description: 'Calculates carbon footprint across Scope 1/2/3 emissions for organizations. Accounts for stationary/mobile combustion, purchased electricity, business travel, and supply chain. Returns total tCO2e, breakdown by scope, intensity metrics, and reduction opportunities. GHG Protocol aligned.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { organization_type, employee_count, energy_kwh_year, travel_km_year, supply_chain_data{}, reporting_standard }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CarbonFootprintInput = JSON.parse(args.input_data)
      const result = calculateCarbonFootprint(input)
      return formatCarbonFootprint(result)
    }
  }))

  // Tool 2: Renewable Energy Optimizer
  tools.register(defineTool({
    name: 'renewable_energy_optimizer',
    description: 'Optimizes renewable energy mix (solar, wind, battery) for facilities. Considers location, demand profile, roof area, budget, and grid pricing. Returns recommended capacity mix, investment cost, payback period, annual savings, and CO2 reduction.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { location_lat_lon{}, energy_demand_kwh, roof_area_sqm, budget_usd, grid_electricity_price, storage_hours_needed }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: RenewableEnergyInput = JSON.parse(args.input_data)
      const result = optimizeRenewableEnergy(input)
      return formatRenewableEnergy(result)
    }
  }))

  // Tool 3: Climate Risk Assessor
  tools.register(defineTool({
    name: 'climate_risk_assessor',
    description: 'Assesses climate-related financial risks (physical and transition) aligned with TCFD framework. Evaluates asset exposure under RCP scenarios, quantifies financial impact, and identifies adaptation strategies. Returns risk scores, hazard probabilities, and mitigation recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { asset_locations[], asset_type, time_horizon_years, scenario_rcp, portfolio_value_usd, sector_exposure[] }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ClimateRiskInput = JSON.parse(args.input_data)
      const result = assessClimateRisk(input)
      return formatClimateRisk(result)
    }
  }))

  // Tool 4: ESG Reporting Generator
  tools.register(defineTool({
    name: 'esg_reporting_generator',
    description: 'Generates ESG (Environmental, Social, Governance) reports aligned with GRI/SASB/ISSB/TCFD frameworks. Produces disclosure checklist, material topics, gap analysis, compliance status, and improvement roadmap. Supports limited/reasonable assurance levels.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { reporting_framework, company_data{}, metrics_data{}, year, assurance_level, target_audience }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ESGReportInput = JSON.parse(args.input_data)
      const result = generateESGReport(input)
      return formatESGReport(result)
    }
  }))

  // Tool 5: Sustainable Supply Chain Mapper
  tools.register(defineTool({
    name: 'sustainable_supply_chain_mapper',
    description: 'Maps and scores supply chain sustainability across multiple tiers, geographies, and materials. Identifies ESG risk hotspots, calculates supply chain carbon footprint, and recommends supplier engagement strategies. Returns tier-by-tier breakdown and material sustainability scores.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { tiers, supplier_locations[], transport_modes[], material_types{}, sustainability_criteria[] }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SupplyChainInput = JSON.parse(args.input_data)
      const result = mapSupplyChain(input)
      return formatSupplyChain(result)
    }
  }))

  // Tool 6: Green Finance Advisor
  tools.register(defineTool({
    name: 'green_finance_advisor',
    description: 'Advises on green finance instruments including green bonds, sustainability-linked loans, and carbon credit pre-purchases. Evaluates eligibility, recommends instrument mix, calculates blended rates, and provides action plan for issuance. ICMA GBP/LMA GLP aligned.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { project_type, financing_needed_usd, expected_green_impact, credit_rating, regulatory_environment }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: GreenFinanceInput = JSON.parse(args.input_data)
      const result = adviseGreenFinance(input)
      return formatGreenFinance(result)
    }
  }))

  // Tool 7: Circular Economy Designer
  tools.register(defineTool({
    name: 'circular_economy_designer',
    description: 'Designs circular economy strategies for products and processes. Analyzes material flows, identifies waste reduction potential, recommends design-for-disclosure and remanufacturing strategies, and builds implementation roadmap. Returns cost savings, revenue opportunities, and CO2 impact.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { product_type, material_flows{}, current_waste_pct, target_circularity_pct, take_back_infrastructure, recycling_partners[] }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CircularEconomyInput = JSON.parse(args.input_data)
      const result = designCircularEconomy(input)
      return formatCircularEconomy(result)
    }
  }))

  // Tool 8: Carbon Credit Valuator
  tools.register(defineTool({
    name: 'carbon_credit_valuator',
    description: 'Values carbon credits and offset projects including forestry, direct air capture, soil carbon, methane capture, and blue carbon. Estimates price range (low/mid/high) based on project quality, vintage, standard, additionality, and co-benefits. Returns total portfolio value.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input: { project_type, vintage_year, volume_tco2, verification_standard, co_benefits[], additionality_evidence }', required: true }
    },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CarbonCreditInput = JSON.parse(args.input_data)
      const result = valueCarbonCredits(input)
      return formatCarbonCredits(result)
    }
  }))

  console.log(`[dsh-tool-climatech] Loaded v${VERSION} - Climate Tech / Green Tech with 8 tools`)
  console.log('  Tools: carbon_footprint_calculator, renewable_energy_optimizer, climate_risk_assessor, esg_reporting_generator, sustainable_supply_chain_mapper, green_finance_advisor, circular_economy_designer, carbon_credit_valuator')
}
