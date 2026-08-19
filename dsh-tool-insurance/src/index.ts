/**
 * DSH Insurance Actuarial Engine Plugin v0.1.0
 *
 * Insurance premium calculation, claims prediction, risk scoring, and reserving analysis toolkit for DeepSeek Harness Agent.
 * Designed for actuaries, underwriters, claims analysts, and insurance risk managers.
 *
 * Features (v0.1.0):
 * - Premium Calculator (risk-based premium computation with loadings and discounts)
 * - Claims Predictor (portfolio-level claims forecasting and stress testing)
 * - Risk Scorer (applicant risk classification and decline probability)
 * - Reserve Analyzer (IBNR estimation and reserve adequacy assessment)
 * - Fraud Detection Scorer (claim-level fraud probability scoring)
 * - Catastrophe Modeler (peril-based loss modeling and reinsurance needs)
 * - Life Table Analyzer (mortality rates, life expectancy, annuity factors)
 * - Reinsurance Optimizer (optimal reinsurance structure and cost-benefit)
 *
 * @module dsh-tool-insurance
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-insurance'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface RiskProfile {
  age: number
  health_score: number
  occupation_risk: number
  coverage_amount: number
  deductible: number
}

interface PremiumResult {
  base_premium: number
  risk_loading: number
  discounts: string[]
  payment_options: { monthly: number; quarterly: number; annual: number }
  competitiveness_score: number
}

interface PortfolioData {
  historical_claims: number[]
  policy_types: string[]
  seasons: string[]
  regions: string[]
}

interface ClaimsPredictionResult {
  expected_claims: number
  loss_ratio: number
  frequency_severity: { frequency: number; severity: number }
  emerging_risks: string[]
  stress_test_scenarios: Array<{ scenario: string; impact: number }>
}

interface ApplicantData {
  age: number
  bmi: number
  smoking: boolean
  medical_history: string[]
  occupation: string
  hobbies: string[]
}

interface RiskScoreResult {
  risk_score: number
  risk_class: 'preferred' | 'standard' | 'substandard' | 'decline'
  exclusion_riders: string[]
  premium_loading: number
  decline_probability: number
}

interface ClaimItem {
  claim_id: string
  reported_amount: number
  paid_to_date: number
  incurred_not_reported: number
}

interface ReserveResult {
  reserve_adequacy: number
  ibnr_estimate: number
  development_patterns: Array<{ period: string; factor: number }>
  surplus_shortfall: number
}

interface ClaimData {
  claim_amount: number
  claimant_history: number
  provider_patterns: string[]
  timing: string
  documentation: string[]
}

interface FraudResult {
  fraud_probability: number
  red_flags: string[]
  investigation_priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_savings: number
}

interface ExposureData {
  locations: Array<{ lat: number; lng: number; value: number }>
  values: number[]
  construction_types: string[]
}

interface CatastropheResult {
  loss_exceedance_curve: Array<{ return_period: number; loss: number }>
  probable_maximum_loss: number
  average_annual_loss: number
  reinsurance_needs: { required: boolean; recommended_coverage: number; layer_suggestions: string[] }
}

interface MortalityData {
  age_range: [number, number]
  population: number
  deaths: number
  exposures: number
}

interface LifeTableResult {
  mortality_rates: Array<{ age: number; qx: number }>
  life_expectancy: number
  survival_probabilities: Array<{ age: number; px: number }>
  annuity_factors: Array<{ age: number; ax: number }>
}

interface ReinsuranceData {
  total_premium: number
  total_risk: number
  current_reinsurance: Array<{ type: string; share: number; cost: number }>
}

interface ReinsuranceResult {
  optimal_structure: string
  surplus_share: number
  cost_benefit: { net_savings: number; roi: number }
  counterparty_risk: number
  program_comparison: Array<{ structure: string; efficiency: number; total_cost: number }>
}

// ==================== TOOL 1: PREMIUM CALCULATOR ====================

function calculatePremium(profile: RiskProfile): PremiumResult {
  const baseRate = 0.02
  const basePremium = profile.coverage_amount * baseRate

  let riskLoading = 0
  if (profile.age > 60) riskLoading += 0.3
  else if (profile.age > 45) riskLoading += 0.15
  else if (profile.age < 25) riskLoading += 0.1

  if (profile.health_score < 50) riskLoading += 0.25
  else if (profile.health_score < 70) riskLoading += 0.1

  riskLoading += profile.occupation_risk * 0.2

  const deductibleDiscount = Math.min(profile.deductible / profile.coverage_amount, 0.15)

  const discounts: string[] = []
  if (profile.health_score >= 85) discounts.push('Preferred health discount: -5%')
  if (profile.deductible >= 5000) discounts.push('High deductible discount: -10%')
  if (profile.occupation_risk <= 2) discounts.push('Low-risk occupation: -3%')
  if (profile.age >= 25 && profile.age <= 40) discounts.push('Prime age discount: -2%')

  const discountFactor = discounts.length * 0.03
  const loadingAmount = basePremium * riskLoading
  const finalPremium = basePremium + loadingAmount - (basePremium * discountFactor) - (basePremium * deductibleDiscount)

  const competitivenessScore = Math.max(0, Math.min(100, 70 - riskLoading * 30 + discounts.length * 5))

  return {
    base_premium: Math.round(finalPremium * 100) / 100,
    risk_loading: Math.round(riskLoading * 10000) / 100,
    discounts,
    payment_options: {
      monthly: Math.round((finalPremium / 12) * 1.05 * 100) / 100,
      quarterly: Math.round((finalPremium / 4) * 1.02 * 100) / 100,
      annual: Math.round(finalPremium * 100) / 100
    },
    competitiveness_score: Math.round(competitivenessScore)
  }
}

function formatPremiumReport(result: PremiumResult): string {
  const lines: string[] = []
  lines.push('## Premium Calculation Report')
  lines.push('')
  lines.push(`**Base Premium:** $${result.base_premium.toLocaleString()}`)
  lines.push(`**Risk Loading:** ${result.risk_loading.toFixed(2)}%`)
  lines.push(`**Competitiveness Score:** ${result.competitiveness_score}/100`)
  lines.push('')

  if (result.discounts.length > 0) {
    lines.push('### Applied Discounts')
    for (const d of result.discounts) {
      lines.push(`- ${d}`)
    }
    lines.push('')
  }

  lines.push('### Payment Options')
  lines.push(`- Monthly: $${result.payment_options.monthly.toLocaleString()}`)
  lines.push(`- Quarterly: $${result.payment_options.quarterly.toLocaleString()}`)
  lines.push(`- Annual: $${result.payment_options.annual.toLocaleString()}`)

  return lines.join('\n')
}

// ==================== TOOL 2: CLAIMS PREDICTOR ====================

function predictClaims(portfolio: PortfolioData): ClaimsPredictionResult {
  const avgClaims = portfolio.historical_claims.reduce((s, c) => s + c, 0) / portfolio.historical_claims.length
  const trend = portfolio.historical_claims.length > 1
    ? (portfolio.historical_claims[portfolio.historical_claims.length - 1] - portfolio.historical_claims[0]) / portfolio.historical_claims[0]
    : 0

  const expectedClaims = avgClaims * (1 + trend * 0.5)
  const lossRatio = expectedClaims / Math.max(avgClaims, 1)

  const frequency = portfolio.historical_claims.length / Math.max(portfolio.policy_types.length, 1)
  const severity = expectedClaims / Math.max(frequency, 1)

  const emergingRisks: string[] = []
  if (trend > 0.2) emergingRisks.push('Upward claims trend detected - review pricing adequacy')
  if (portfolio.regions.includes('coastal')) emergingRisks.push('Climate exposure: coastal region concentration risk')
  if (portfolio.seasons.includes('winter')) emergingRisks.push('Seasonal spike: winter claims frequency elevated')
  if (lossRatio > 0.75) emergingRisks.push('High loss ratio zone: portfolio profitability at risk')

  const stressTestScenarios = [
    { scenario: '20% frequency increase', impact: expectedClaims * 1.2 },
    { scenario: '30% severity increase', impact: expectedClaims * 1.3 },
    { scenario: 'Catastrophic event (1% prob)', impact: expectedClaims * 3.5 },
    { scenario: 'Economic downturn', impact: expectedClaims * 1.15 },
    { scenario: 'Regulatory change impact', impact: expectedClaims * 1.1 }
  ]

  return {
    expected_claims: Math.round(expectedClaims),
    loss_ratio: Math.round(lossRatio * 10000) / 10000,
    frequency_severity: {
      frequency: Math.round(frequency * 100) / 100,
      severity: Math.round(severity)
    },
    emerging_risks: emergingRisks,
    stress_test_scenarios: stressTestScenarios.map(s => ({
      scenario: s.scenario,
      impact: Math.round(s.impact)
    }))
  }
}

function formatClaimsReport(result: ClaimsPredictionResult): string {
  const lines: string[] = []
  lines.push('## Claims Prediction Report')
  lines.push('')
  lines.push(`**Expected Claims:** $${result.expected_claims.toLocaleString()}`)
  lines.push(`**Loss Ratio:** ${(result.loss_ratio * 100).toFixed(2)}%`)
  lines.push(`**Frequency:** ${result.frequency_severity.frequency.toFixed(2)} claims per policy`)
  lines.push(`**Severity:** $${result.frequency_severity.severity.toLocaleString()} per claim`)
  lines.push('')

  if (result.emerging_risks.length > 0) {
    lines.push('### Emerging Risks')
    for (const r of result.emerging_risks) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('### Stress Test Scenarios')
  for (const s of result.stress_test_scenarios) {
    lines.push(`- **${s.scenario}:** $${s.impact.toLocaleString()}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: RISK SCORER ====================

function scoreRisk(applicant: ApplicantData): RiskScoreResult {
  let score = 50

  if (applicant.age > 65) score += 25
  else if (applicant.age > 50) score += 15
  else if (applicant.age > 35) score += 5
  else if (applicant.age < 21) score += 10

  if (applicant.bmi > 35) score += 20
  else if (applicant.bmi > 30) score += 12
  else if (applicant.bmi < 18.5) score += 8
  else if (applicant.bmi >= 18.5 && applicant.bmi <= 25) score -= 5

  if (applicant.smoking) score += 25

  const highRiskConditions = ['cancer', 'heart_disease', 'diabetes', 'stroke', 'kidney_disease']
  for (const condition of applicant.medical_history) {
    if (highRiskConditions.includes(condition.toLowerCase())) score += 15
    else score += 5
  }

  const occupationRisk: Record<string, number> = {
    'pilot': 10, 'miner': 15, 'construction_worker': 12, 'firefighter': 10,
    'office_worker': -5, 'teacher': -3, 'software_engineer': -5, 'nurse': 3
  }
  score += occupationRisk[applicant.occupation.toLowerCase()] ?? 0

  const riskyHobbies = ['skydiving', 'rock_climbing', 'motorcycle_racing', 'bungee_jumping', 'scuba_diving']
  for (const hobby of applicant.hobbies) {
    if (riskyHobbies.includes(hobby.toLowerCase())) score += 10
  }

  score = Math.max(0, Math.min(100, score))

  let riskClass: RiskScoreResult['risk_class'] = 'standard'
  if (score >= 80) riskClass = 'decline'
  else if (score >= 60) riskClass = 'substandard'
  else if (score <= 30) riskClass = 'preferred'

  const exclusionRiders: string[] = []
  if (applicant.medical_history.some(c => ['heart_disease', 'diabetes'].includes(c.toLowerCase()))) {
    exclusionRiders.push('Cardiovascular exclusion rider')
  }
  if (applicant.hobbies.some(h => riskyHobbies.includes(h.toLowerCase()))) {
    exclusionRiders.push('Hazardous activities exclusion rider')
  }
  if (applicant.occupation.toLowerCase() === 'construction_worker') {
    exclusionRiders.push('Occupational hazard exclusion rider')
  }

  const premiumLoading = riskClass === 'decline' ? 0
    : riskClass === 'substandard' ? (score - 40) * 1.5
    : riskClass === 'preferred' ? -10
    : Math.max(0, (score - 40) * 0.5)

  const declineProbability = Math.min(100, Math.max(0, (score - 60) * 2.5))

  return {
    risk_score: score,
    risk_class: riskClass,
    exclusion_riders: exclusionRiders,
    premium_loading: Math.round(premiumLoading * 100) / 100,
    decline_probability: Math.round(declineProbability * 100) / 100
  }
}

function formatRiskReport(result: RiskScoreResult): string {
  const lines: string[] = []
  lines.push('## Risk Scoring Report')
  lines.push('')
  lines.push(`**Risk Score:** ${result.risk_score}/100`)
  lines.push(`**Risk Class:** ${result.risk_class.toUpperCase()}`)
  lines.push(`**Premium Loading:** ${result.premium_loading >= 0 ? '+' : ''}${result.premium_loading.toFixed(1)}%`)
  lines.push(`**Decline Probability:** ${result.decline_probability.toFixed(1)}%`)
  lines.push('')

  if (result.exclusion_riders.length > 0) {
    lines.push('### Exclusion Riders Required')
    for (const r of result.exclusion_riders) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: RESERVE ANALYZER ====================

function analyzeReserves(claims: ClaimItem[]): ReserveResult {
  const totalReported = claims.reduce((s, c) => s + c.reported_amount, 0)
  const totalPaid = claims.reduce((s, c) => s + c.paid_to_date, 0)
  const totalIBNR = claims.reduce((s, c) => s + c.incurred_not_reported, 0)
  const totalIncurred = totalPaid + totalIBNR

  const reserveRatio = totalIncurred / Math.max(totalReported, 1)
  const reserveAdequacy = reserveRatio >= 1.0 ? 100 : reserveRatio * 100

  const ibnrEstimate = totalIBNR * 1.15

  const developmentPatterns = [
    { period: '12-24 months', factor: 1.15 },
    { period: '24-36 months', factor: 1.08 },
    { period: '36-48 months', factor: 1.03 },
    { period: '48-60 months', factor: 1.01 },
    { period: '60+ months', factor: 1.0 }
  ]

  const surplusShortfall = totalReported > 0
    ? totalIncurred - totalReported
    : 0

  return {
    reserve_adequacy: Math.round(reserveAdequacy * 100) / 100,
    ibnr_estimate: Math.round(ibnrEstimate),
    development_patterns: developmentPatterns,
    surplus_shortfall: Math.round(surplusShortfall)
  }
}

function formatReserveReport(result: ReserveResult): string {
  const lines: string[] = []
  lines.push('## Reserve Analysis Report')
  lines.push('')
  lines.push(`**Reserve Adequacy:** ${result.reserve_adequacy.toFixed(2)}%`)
  lines.push(`**IBNR Estimate:** $${result.ibnr_estimate.toLocaleString()}`)
  const status = result.surplus_shortfall >= 0 ? 'SHORTFALL' : 'SURPLUS'
  lines.push(`${status}: $${Math.abs(result.surplus_shortfall).toLocaleString()}`)
  lines.push('')

  lines.push('### Development Patterns')
  for (const d of result.development_patterns) {
    lines.push(`- ${d.period}: factor ${d.factor.toFixed(2)}`)
  }

  if (result.reserve_adequacy < 90) {
    lines.push('')
    lines.push('**WARNING:** Reserve adequacy below 90% - consider strengthening reserves')
  }

  return lines.join('\n')
}

// ==================== TOOL 5: FRAUD DETECTION SCORER ====================

function scoreFraud(claim: ClaimData): FraudResult {
  let fraudScore = 0
  const redFlags: string[] = []

  if (claim.claimant_history > 3) {
    fraudScore += 25
    redFlags.push('Frequent claimant (>3 claims)')
  } else if (claim.claimant_history > 1) {
    fraudScore += 10
    redFlags.push('Multiple prior claims')
  }

  if (claim.claim_amount > 50000) {
    fraudScore += 15
    redFlags.push('High claim amount (>$50K)')
  }

  for (const pattern of claim.provider_patterns) {
    if (pattern === 'upcoding' || pattern === 'unbundling' || pattern === 'phantom_billing') {
      fraudScore += 20
      redFlags.push(`Provider fraud indicator: ${pattern}`)
    }
  }

  if (claim.timing === 'just_after_inception' || claim.timing === 'just_before_expiry') {
    fraudScore += 20
    redFlags.push(`Suspicious timing: ${claim.timing}`)
  } else if (claim.timing === 'weekend' || claim.timing === 'holiday') {
    fraudScore += 8
    redFlags.push('Claims during off-hours')
  }

  if (claim.documentation.includes('missing_documents')) {
    fraudScore += 15
    redFlags.push('Missing documentation')
  }
  if (claim.documentation.includes('altered_documents')) {
    fraudScore += 30
    redFlags.push('Altered/forged documents detected')
  }
  if (claim.documentation.includes('inconsistent_dates')) {
    fraudScore += 20
    redFlags.push('Inconsistent dates in documentation')
  }

  fraudScore = Math.min(100, fraudScore)

  let priority: FraudResult['investigation_priority'] = 'low'
  if (fraudScore >= 70) priority = 'critical'
  else if (fraudScore >= 50) priority = 'high'
  else if (fraudScore >= 30) priority = 'medium'

  const estimatedSavings = fraudScore >= 30
    ? claim.claim_amount * (fraudScore / 100) * 0.7
    : 0

  return {
    fraud_probability: fraudScore,
    red_flags: redFlags,
    investigation_priority: priority,
    estimated_savings: Math.round(estimatedSavings)
  }
}

function formatFraudReport(result: FraudResult): string {
  const lines: string[] = []
  lines.push('## Fraud Detection Report')
  lines.push('')
  lines.push(`**Fraud Probability:** ${result.fraud_probability}%`)
  lines.push(`**Investigation Priority:** ${result.investigation_priority.toUpperCase()}`)
  lines.push(`**Estimated Savings if Investigated:** $${result.estimated_savings.toLocaleString()}`)
  lines.push('')

  if (result.red_flags.length > 0) {
    lines.push('### Red Flags Identified')
    for (const f of result.red_flags) {
      lines.push(`- ${f}`)
    }
  } else {
    lines.push('No significant red flags detected.')
  }

  return lines.join('\n')
}

// ==================== TOOL 6: CATASTROPHE MODELER ====================

function modelCatastrophe(exposure: ExposureData, peril: string): CatastropheResult {
  const totalValue = exposure.values.reduce((s, v) => s + v, 0)
  const avgValue = totalValue / Math.max(exposure.values.length, 1)

  const damageRatios: Record<string, number> = {
    earthquake: 0.15,
    hurricane: 0.12,
    flood: 0.08
  }
  const baseDamageRatio = damageRatios[peril.toLowerCase()] ?? 0.1

  const constructionFactors: Record<string, number> = {
    'wood_frame': 1.3, 'steel': 0.8, 'concrete': 0.7, 'masonry': 1.0,
    'prefab': 1.5, 'reinforced_concrete': 0.6
  }

  const avgConstructionFactor = exposure.construction_types.length > 0
    ? exposure.construction_types.reduce((s, c) => s + (constructionFactors[c.toLowerCase()] ?? 1.0), 0) / exposure.construction_types.length
    : 1.0

  const avgLocationValue = exposure.locations.length > 0
    ? exposure.locations.reduce((s, l) => s + l.value, 0) / exposure.locations.length
    : avgValue

  const lossExceedanceCurve = [
    { return_period: 10, loss: Math.round(totalValue * baseDamageRatio * 0.3 * avgConstructionFactor) },
    { return_period: 25, loss: Math.round(totalValue * baseDamageRatio * 0.5 * avgConstructionFactor) },
    { return_period: 50, loss: Math.round(totalValue * baseDamageRatio * 0.7 * avgConstructionFactor) },
    { return_period: 100, loss: Math.round(totalValue * baseDamageRatio * 0.9 * avgConstructionFactor) },
    { return_period: 250, loss: Math.round(totalValue * baseDamageRatio * 1.2 * avgConstructionFactor) },
    { return_period: 500, loss: Math.round(totalValue * baseDamageRatio * 1.5 * avgConstructionFactor) }
  ]

  const pml = Math.round(totalValue * baseDamageRatio * 1.3 * avgConstructionFactor)
  const aal = Math.round(totalValue * baseDamageRatio * 0.4 * avgConstructionFactor)

  const reinsuranceRequired = pml > totalValue * 0.05
  const recommendedCoverage = Math.round(pml * 0.8)
  const layerSuggestions: string[] = []

  if (reinsuranceRequired) {
    layerSuggestions.push(`Primary layer: $${Math.round(pml * 0.3).toLocaleString()} xs $${Math.round(pml * 0.1).toLocaleString()}`)
    layerSuggestions.push(`Secondary layer: $${Math.round(pml * 0.5).toLocaleString()} xs $${Math.round(pml * 0.4).toLocaleString()}`)
    layerSuggestions.push(`Tertiary layer: $${Math.round(pml * 0.2).toLocaleString()} xs $${Math.round(pml * 0.9).toLocaleString()}`)
  }

  return {
    loss_exceedance_curve: lossExceedanceCurve,
    probable_maximum_loss: pml,
    average_annual_loss: aal,
    reinsurance_needs: {
      required: reinsuranceRequired,
      recommended_coverage: recommendedCoverage,
      layer_suggestions: layerSuggestions
    }
  }
}

function formatCatastropheReport(result: CatastropheResult, peril: string): string {
  const lines: string[] = []
  lines.push(`## Catastrophe Model: ${peril.charAt(0).toUpperCase() + peril.slice(1).toLowerCase()}`)
  lines.push('')
  lines.push(`**Probable Maximum Loss (PML):** $${result.probable_maximum_loss.toLocaleString()}`)
  lines.push(`**Average Annual Loss (AAL):** $${result.average_annual_loss.toLocaleString()}`)
  lines.push(`**Reinsurance Required:** ${result.reinsurance_needs.required ? 'YES' : 'No'}`)
  if (result.reinsurance_needs.required) {
    lines.push(`**Recommended Coverage:** $${result.reinsurance_needs.recommended_coverage.toLocaleString()}`)
  }
  lines.push('')

  lines.push('### Loss Exceedance Curve')
  lines.push('| Return Period (years) | Estimated Loss |')
  lines.push('|-----------------------|----------------|')
  for (const point of result.loss_exceedance_curve) {
    lines.push(`| ${point.return_period} | $${point.loss.toLocaleString()} |`)
  }

  if (result.reinsurance_needs.layer_suggestions.length > 0) {
    lines.push('')
    lines.push('### Reinsurance Layer Suggestions')
    for (const layer of result.reinsurance_needs.layer_suggestions) {
      lines.push(`- ${layer}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: LIFE TABLE ANALYZER ====================

function analyzeLifeTable(data: MortalityData[]): LifeTableResult {
  const mortalityRates: LifeTableResult['mortality_rates'] = []
  const survivalProbs: LifeTableResult['survival_probabilities'] = []
  const annuityFactors: LifeTableResult['annuity_factors'] = []

  for (const entry of data) {
    const qx = entry.exposures > 0 ? entry.deaths / entry.exposures : 0
    const age = Math.round((entry.age_range[0] + entry.age_range[1]) / 2)
    mortalityRates.push({ age, qx: Math.round(qx * 100000) / 100000 })
  }

  let cumulativeSurvival = 1.0
  for (let i = 0; i < mortalityRates.length; i++) {
    cumulativeSurvival *= (1 - mortalityRates[i].qx)
    survivalProbs.push({ age: mortalityRates[i].age, px: Math.round(cumulativeSurvival * 10000) / 10000 })
  }

  const evalRate = 0.04
  for (const rate of mortalityRates) {
    let ax = 0
    let surv = 1.0
    for (let t = 1; t <= 100 - rate.age; t++) {
      surv *= (1 - rate.qx)
      ax += surv / Math.pow(1 + evalRate, t)
    }
    annuityFactors.push({ age: rate.age, ax: Math.round(ax * 100) / 100 })
  }

  let lifeExp = 0
  let surv = 1.0
  for (let i = 0; i < mortalityRates.length - 1; i++) {
    const intervalWidth = data[i].age_range[1] - data[i].age_range[0] + 1
    surv *= (1 - mortalityRates[i].qx)
    lifeExp += surv * intervalWidth
  }

  return {
    mortality_rates: mortalityRates,
    life_expectancy: Math.round(lifeExp * 100) / 100,
    survival_probabilities: survivalProbs,
    annuity_factors: annuityFactors
  }
}

function formatLifeTableReport(result: LifeTableResult): string {
  const lines: string[] = []
  lines.push('## Life Table Analysis Report')
  lines.push('')
  lines.push(`**Life Expectancy:** ${result.life_expectancy.toFixed(2)} years`)
  lines.push('')

  lines.push('### Mortality Rates')
  lines.push('| Age | qx (Mortality Rate) |')
  lines.push('|-----|---------------------|')
  for (const m of result.mortality_rates) {
    lines.push(`| ${m.age} | ${m.qx.toFixed(5)} |`)
  }
  lines.push('')

  lines.push('### Survival Probabilities')
  lines.push('| Age | Probability |')
  lines.push('|-----|-------------|')
  for (const s of result.survival_probabilities) {
    lines.push(`| ${s.age} | ${(s.px * 100).toFixed(2)}% |`)
  }
  lines.push('')

  lines.push('### Annuity Factors (4% discount)')
  lines.push('| Age | Annuity Factor |')
  lines.push('|-----|---------------|')
  for (const a of result.annuity_factors) {
    lines.push(`| ${a.age} | ${a.ax.toFixed(2)} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: REINSURANCE OPTIMIZER ====================

function optimizeReinsurance(portfolio: ReinsuranceData): ReinsuranceResult {
  const currentCost = portfolio.current_reinsurance.reduce((s, r) => s + r.cost, 0)
  const currentCoverage = portfolio.current_reinsurance.reduce((s, r) => s + r.share, 0)

  const targetRetention = portfolio.total_risk * 0.1
  const optimalCession = Math.min(0.6, (portfolio.total_risk - targetRetention) / portfolio.total_risk)

  const optimalStructure = optimalCession > 0.4
    ? 'Quota Share + Excess of Loss (layered)'
    : optimalCession > 0.2
    ? 'Surplus Share + Cat XL'
    : 'Excess of Loss only'

  const surplusShare = Math.round(optimalCession * 100)
  const expectedRecovery = portfolio.total_risk * optimalCession * 0.55
  const programCost = portfolio.total_premium * optimalCession * 0.75
  const netSavings = expectedRecovery - programCost
  const roi = netSavings / Math.max(programCost, 1)

  const counterpartyRisk = Math.min(100, optimalCession * 80 * 0.7)

  const programComparison = [
    {
      structure: 'Current Program',
      efficiency: currentCost > 0 ? (currentCoverage * portfolio.total_risk * 0.55 - currentCost) / currentCost : 0,
      total_cost: currentCost
    },
    {
      structure: 'Proposed Optimal',
      efficiency: roi,
      total_cost: Math.round(programCost)
    },
    {
      structure: 'Full Quota Share (50%)',
      efficiency: (portfolio.total_risk * 0.5 * 0.55 - portfolio.total_premium * 0.5 * 0.75) / (portfolio.total_premium * 0.5 * 0.75),
      total_cost: Math.round(portfolio.total_premium * 0.5 * 0.75)
    },
    {
      structure: 'Catastrophe XL Only',
      efficiency: (portfolio.total_risk * 0.15 * 0.55 - portfolio.total_premium * 0.1) / (portfolio.total_premium * 0.1),
      total_cost: Math.round(portfolio.total_premium * 0.1)
    }
  ]

  return {
    optimal_structure: optimalStructure,
    surplus_share: surplusShare,
    cost_benefit: {
      net_savings: Math.round(netSavings),
      roi: Math.round(roi * 100) / 100
    },
    counterparty_risk: Math.round(counterpartyRisk),
    program_comparison: programComparison.map(p => ({
      structure: p.structure,
      efficiency: Math.round(p.efficiency * 100) / 100,
      total_cost: p.total_cost
    }))
  }
}

function formatReinsuranceReport(result: ReinsuranceResult): string {
  const lines: string[] = []
  lines.push('## Reinsurance Optimization Report')
  lines.push('')
  lines.push(`**Optimal Structure:** ${result.optimal_structure}`)
  lines.push(`**Surplus Share:** ${result.surplus_share}%`)
  lines.push(`**Net Savings:** $${result.cost_benefit.net_savings.toLocaleString()}`)
  lines.push(`**ROI:** ${(result.cost_benefit.roi * 100).toFixed(2)}%`)
  lines.push(`**Counterparty Risk Score:** ${result.counterparty_risk}/100`)
  lines.push('')

  lines.push('### Program Comparison')
  lines.push('| Structure | Efficiency | Total Cost |')
  lines.push('|-----------|-----------|------------|')
  for (const p of result.program_comparison) {
    lines.push(`| ${p.structure} | ${p.efficiency.toFixed(2)} | $${p.total_cost.toLocaleString()} |`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'premium_calculator',
    description: 'Calculate insurance premiums based on risk profile. Computes base premium, risk loading factors, applicable discounts, and payment options including monthly/quarterly/annual splits.',
    parameters: {
      risk_profile: { type: 'string', required: true, description: 'JSON object with fields: age (number), health_score (0-100), occupation_risk (1-10), coverage_amount (number), deductible (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_profile: string }) {
      const profile: RiskProfile = JSON.parse(args.risk_profile)
      const result = calculatePremium(profile)
      return formatPremiumReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'claims_predictor',
    description: 'Predict future claims at the portfolio level using historical data. Provides loss ratio, frequency/severity decomposition, emerging risk identification, and stress test scenarios.',
    parameters: {
      portfolio_data: { type: 'string', required: true, description: 'JSON object with fields: historical_claims (number[]), policy_types (string[]), seasons (string[]), regions (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { portfolio_data: string }) {
      const data: PortfolioData = JSON.parse(args.portfolio_data)
      const result = predictClaims(data)
      return formatClaimsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'risk_scorer',
    description: 'Score insurance applicants across multiple risk dimensions. Returns risk score, risk classification, exclusion riders, premium loading, and decline probability.',
    parameters: {
      applicant_data: { type: 'string', required: true, description: 'JSON object with fields: age (number), bmi (number), smoking (boolean), medical_history (string[]), occupation (string), hobbies (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { applicant_data: string }) {
      const data: ApplicantData = JSON.parse(args.applicant_data)
      const result = scoreRisk(data)
      return formatRiskReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'reserve_analyzer',
    description: 'Analyze claims reserves for adequacy. Estimates incurred but not reported (IBNR), calculates development patterns, and identifies surplus or shortfall positions.',
    parameters: {
      claims_inventory: { type: 'string', required: true, description: 'JSON array of claim objects with fields: claim_id (string), reported_amount (number), paid_to_date (number), incurred_not_reported (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { claims_inventory: string }) {
      const data: ClaimItem[] = JSON.parse(args.claims_inventory)
      const result = analyzeReserves(data)
      return formatReserveReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'fraud_detection_scorer',
    description: 'Score insurance claims for fraud probability. Identifies red flags, assigns investigation priority, and estimates potential savings from investigation.',
    parameters: {
      claim_data: { type: 'string', required: true, description: 'JSON object with fields: claim_amount (number), claimant_history (number), provider_patterns (string[]), timing (string), documentation (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { claim_data: string }) {
      const data: ClaimData = JSON.parse(args.claim_data)
      const result = scoreFraud(data)
      return formatFraudReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'catastrophe_modeler',
    description: 'Model catastrophe losses for a given peril. Generates loss exceedance curves, probable maximum loss, average annual loss, and reinsurance layer recommendations.',
    parameters: {
      exposure_data: { type: 'string', required: true, description: 'JSON object with fields: locations (array of {lat, lng, value}), values (number[]), construction_types (string[])' },
      peril: { type: 'string', required: true, description: 'Peril type: "earthquake", "hurricane", or "flood"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { exposure_data: string; peril: string }) {
      const data: ExposureData = JSON.parse(args.exposure_data)
      const result = modelCatastrophe(data, args.peril)
      return formatCatastropheReport(result, args.peril)
    }
  }))

  tools.register(defineTool({
    name: 'life_table_analyzer',
    description: 'Analyze mortality data to produce life tables. Computes mortality rates, life expectancy, survival probabilities, and annuity factors for actuarial valuation.',
    parameters: {
      mortality_data: { type: 'string', required: true, description: 'JSON array of mortality data objects with fields: age_range ([min, max]), population (number), deaths (number), exposures (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { mortality_data: string }) {
      const data: MortalityData[] = JSON.parse(args.mortality_data)
      const result = analyzeLifeTable(data)
      return formatLifeTableReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'reinsurance_optimizer',
    description: 'Optimize reinsurance program structure. Determines optimal retention, surplus share, cost-benefit analysis, counterparty risk, and compares alternative program structures.',
    parameters: {
      portfolio_summary: { type: 'string', required: true, description: 'JSON object with fields: total_premium (number), total_risk (number), current_reinsurance (array of {type, share, cost})' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { portfolio_summary: string }) {
      const data: ReinsuranceData = JSON.parse(args.portfolio_summary)
      const result = optimizeReinsurance(data)
      return formatReinsuranceReport(result)
    }
  }))

  console.log(`[dsh-tool-insurance] Loaded v${VERSION} — Insurance Actuarial Engine with 8 tools`)
  console.log('  Tools: premium_calculator, claims_predictor, risk_scorer, reserve_analyzer, fraud_detection_scorer, catastrophe_modeler, life_table_analyzer, reinsurance_optimizer')
}
