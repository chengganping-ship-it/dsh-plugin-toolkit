/**
 * DSH ESG Supply Chain Scorer Plugin v0.1.0
 *
 * Environmental, Social, Governance risk assessment toolkit for DeepSeek Harness Agent.
 * Designed for supply chain analysts, sustainability officers, and ESG auditors.
 *
 * Features (v0.1.0):
 * - Carbon Footprint Calculator (Scope 1/2/3 CO2e breakdown)
 * - Labor Practice Scorer (supplier audit and certification assessment)
 * - Governance Compliance_checker (board structure and policy evaluation)
 * - Supply Chain Transparency Index (tier-N visibility scoring)
 * - ESG Risk Heatmap (multi-dimensional risk visualization)
 * - Sustainability Report Generator (GRI/SASB-aligned report sections)
 * - Stakeholder Impact Assessment (stakeholder mapping and materiality)
 * - ESG Benchmarking (percentile rankings against industry peers)
 *
 * @module dsh-tool-esgscore
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-esgscore'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface Activity {
  activity_type: string
  quantity: number
  emission_factor: number
  unit?: string
  scope?: 1 | 2 | 3
}

interface CarbonFootprintResult {
  totalCO2e: number
  scope1: { total: number; activities: Array<{ type: string; co2e: number }> }
  scope2: { total: number; activities: Array<{ type: string; co2e: number }> }
  scope3: { total: number; activities: Array<{ type: string; co2e: number }> }
  breakdown: Array<{ activity: string; scope: 1 | 2 | 3; co2e: number; percentage: number }>
  intensity: number
}

interface Supplier {
  country: string
  audit_score: number
  certifications: string[]
  incidents: number
  name?: string
  tier?: number
  sector?: string
}

interface LaborPracticeResult {
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  suppliers: Array<{
    country: string
    score: number
    riskFlag: 'none' | 'low' | 'medium' | 'high' | 'critical'
    notes: string[]
  }>
  countryRiskMap: Record<string, { avgScore: number; supplierCount: number }>
  certificationCoverage: number
  totalIncidents: number
  recommendations: string[]
}

interface GovernanceData {
  board_structure: {
    independent_ratio: number
    diversity_ratio: number
    has_esg_committee: boolean
    separation_ceo_chair: boolean
    board_size: number
  }
  policies: {
    has_code_of_conduct: boolean
    has_anti_corruption: boolean
    has_human_rights: boolean
    has_environmental: boolean
    has_data_privacy: boolean
    has_whistleblower: boolean
  }
  transparency: {
    annual_reporting_quality: number
    esg_disclosure_score: number
    third_party_audited: boolean
    executive_compensation_transparent: boolean
  }
}

interface GovernanceResult {
  overallScore: number
  category: 'excellent' | 'good' | 'adequate' | 'poor' | 'critical'
  boardScore: number
  policyScore: number
  transparencyScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

interface VisibilityData {
  tier1_visibility: number
  tier2_visibility: number
  tier3_visibility: number
  traceability: {
    raw_material_traceability: number
    process_traceability: number
    product_traceability: number
  }
  disclosure: {
    supplier_list_public: boolean
    audit_results_public: boolean
    carbon_data_public: boolean
    labor_data_public: boolean
  }
}

interface TransparencyResult {
  overallScore: number
  tierVisibility: { tier1: number; tier2: number; tier3: number; average: number }
  traceabilityScore: number
  disclosureScore: number
  transparencyLevel: 'high' | 'moderate' | 'low' | 'opaque'
  gaps: string[]
  recommendations: string[]
}

interface RiskItem {
  category: 'environmental' | 'social' | 'governance'
  risk_name: string
  likelihood: number
  impact: number
  trend?: 'increasing' | 'stable' | 'decreasing'
}

interface RiskHeatmapResult {
  environmental: Array<{ risk: string; likelihood: number; impact: number; score: number; trend: string }>
  social: Array<{ risk: string; likelihood: number; impact: number; score: number; trend: string }>
  governance: Array<{ risk: string; likelihood: number; impact: number; score: number; trend: string }>
  topRisks: Array<{ rank: number; risk: string; category: string; score: number; priority: string }>
  summary: {
    environmentalAvg: number
    socialAvg: number
    governanceAvg: number
    highestRiskCategory: string
    totalRiskCount: number
  }
}

interface CompanyData {
  name: string
  industry: string
  metrics: {
    revenue_usd?: number
    employees?: number
    co2e_tonnes?: number
    water_usage_m3?: number
    waste_tonnes?: number
    diversity_ratio?: number
    training_hours_per_employee?: number
  }
  goals: Array<{ area: string; target: string; deadline: string; status: string }>
}

interface SustainabilityResult {
  reportSections: Array<{ title: string; content: string; standard: string }>
  griAlignment: string[]
  sasbAlignment: string[]
  materialityTopics: string[]
  disclosureGaps: string[]
}

interface Stakeholder {
  type: string
  concerns: string[]
  influence: 'low' | 'medium' | 'high'
  engagement_level?: 'none' | 'inform' | 'consult' | 'involve' | 'collaborate'
}

interface StakeholderResult {
  stakeholderMap: Array<{
    type: string
    level: string
    concerns: string[]
    influence: string
    engagementPriority: number
    materialityScore: number
  }>
  materialityMatrix: {
    highPriority: string[]
    mediumPriority: string[]
    lowPriority: string[]
  }
  engagementRecommendations: string[]
}

interface CompanyMetrics {
  co2e_intensity?: number
  energy_efficiency?: number
  water_intensity?: number
  waste_recycling_rate?: number
  diversity_ratio?: number
  board_independence?: number
  ethics_training_coverage?: number
  supplier_audit_rate?: number
  employee_satisfaction?: number
  community_investment_pct?: number
}

interface PeerData extends CompanyMetrics {
  name: string
}

interface BenchmarkingResult {
  overallPercentile: number
  categoryPercentiles: Record<string, number>
  peerComparison: Array<{ metric: string; companyValue: number; peerAvg: number; peerBest: number; percentile: number }>
  industry: string
  peerCount: number
  strengths: string[]
  weaknesses: string[]
  trendIndicators: { leaders: string[]; average: string[]; laggards: string[] }
}

// ==================== TOOL 1: CARBON FOOTPRINT CALCULATOR ====================

function calculateCarbonFootprint(activities: Activity[]): CarbonFootprintResult {
  const scope1Activities: CarbonFootprintResult['scope1']['activities'] = []
  const scope2Activities: CarbonFootprintResult['scope2']['activities'] = []
  const scope3Activities: CarbonFootprintResult['scope3']['activities'] = []

  let scope1Total = 0
  let scope2Total = 0
  let scope3Total = 0

  for (const act of activities) {
    const co2e = act.quantity * act.emission_factor
    const scope = act.scope ?? inferScope(act.activity_type)

    if (scope === 1) {
      scope1Total += co2e
      scope1Activities.push({ type: act.activity_type, co2e })
    } else if (scope === 2) {
      scope2Total += co2e
      scope2Activities.push({ type: act.activity_type, co2e })
    } else {
      scope3Total += co2e
      scope3Activities.push({ type: act.activity_type, co2e })
    }
  }

  const totalCO2e = scope1Total + scope2Total + scope3Total

  const breakdown = [
    ...scope1Activities.map(a => ({ activity: a.type, scope: 1 as const, co2e: a.co2e, percentage: totalCO2e > 0 ? (a.co2e / totalCO2e) * 100 : 0 })),
    ...scope2Activities.map(a => ({ activity: a.type, scope: 2 as const, co2e: a.co2e, percentage: totalCO2e > 0 ? (a.co2e / totalCO2e) * 100 : 0 })),
    ...scope3Activities.map(a => ({ activity: a.type, scope: 3 as const, co2e: a.co2e, percentage: totalCO2e > 0 ? (a.co2e / totalCO2e) * 100 : 0 }))
  ]

  return {
    totalCO2e,
    scope1: { total: scope1Total, activities: scope1Activities },
    scope2: { total: scope2Total, activities: scope2Activities },
    scope3: { total: scope3Total, activities: scope3Activities },
    breakdown: breakdown.sort((a, b) => b.co2e - a.co2e),
    intensity: totalCO2e
  }
}

function inferScope(activityType: string): 1 | 2 | 3 {
  const scope1Keywords = ['combustion', 'fleet', 'refrigerant', 'process', 'onsite', 'generator', 'boiler']
  const scope2Keywords = ['electricity', 'steam', 'heating', 'cooling', 'purchased_energy']
  const lower = activityType.toLowerCase()
  if (scope1Keywords.some(k => lower.includes(k))) return 1
  if (scope2Keywords.some(k => lower.includes(k))) return 2
  return 3
}

function formatCarbonReport(result: CarbonFootprintResult): string {
  const lines: string[] = []
  lines.push('## Carbon Footprint Report')
  lines.push('')
  lines.push(`**Total CO2e:** ${result.totalCO2e.toFixed(2)} tonnes`)
  lines.push('')
  lines.push('### Scope Breakdown')
  lines.push(`| Scope | CO2e (t) | Share |`)
  lines.push(`|-------|----------|-------|`)
  lines.push(`| Scope 1 (Direct) | ${result.scope1.total.toFixed(2)} | ${result.totalCO2e > 0 ? ((result.scope1.total / result.totalCO2e) * 100).toFixed(1) : 0}% |`)
  lines.push(`| Scope 2 (Indirect Energy) | ${result.scope2.total.toFixed(2)} | ${result.totalCO2e > 0 ? ((result.scope2.total / result.totalCO2e) * 100).toFixed(1) : 0}% |`)
  lines.push(`| Scope 3 (Value Chain) | ${result.scope3.total.toFixed(2)} | ${result.totalCO2e > 0 ? ((result.scope3.total / result.totalCO2e) * 100).toFixed(1) : 0}% |`)
  lines.push('')

  if (result.breakdown.length > 0) {
    lines.push('### Top Emissions Sources')
    lines.push('| Activity | Scope | CO2e (t) | % of Total |')
    lines.push('|----------|-------|----------|------------|')
    for (const b of result.breakdown.slice(0, 10)) {
      lines.push(`| ${b.activity} | ${b.scope} | ${b.co2e.toFixed(2)} | ${b.percentage.toFixed(1)}% |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: LABOR PRACTICE SCORER ====================

const COUNTRY_RISK: Record<string, number> = {
  'bgd': 0.3, 'mmr': 0.25, 'pak': 0.35,
  'vnm': 0.5, 'chn': 0.55, 'ind': 0.45,
  'deu': 0.85, 'usa': 0.8, 'gbr': 0.82,
  'fra': 0.8, 'jpn': 0.85, 'sgp': 0.75,
  'mys': 0.5, 'tha': 0.5, 'idn': 0.45,
  'phl': 0.45, 'eth': 0.35, 'khm': 0.3
}

const CERT_WEIGHTS: Record<string, number> = {
  'sa8000': 20, 'bsci': 15, 'sedex': 15, 'wrap': 12, 'fairtrade': 18,
  'iso14001': 8, 'oekotex': 10, 'gots': 12, 'bluesign': 10, 'csi': 15
}

function scoreLaborPractices(suppliers: Supplier[]): LaborPracticeResult {
  const results: LaborPracticeResult['suppliers'] = []
  const countryMap: Record<string, { totalScore: number; count: number }> = {}
  let totalCerts = 0
  let totalPossibleCerts = 0
  let totalIncidents = 0

  for (const sup of suppliers) {
    const notes: string[] = []
    const countryRisk = COUNTRY_RISK[sup.country.toLowerCase()] ?? 0.5
    let score = sup.audit_score * 0.5 + countryRisk * 50 * 0.3

    let certScore = 0
    for (const cert of sup.certifications) {
      certScore += CERT_WEIGHTS[cert.toLowerCase()] ?? 5
    }
    const certComponent = Math.min(certScore, 25)
    score += certComponent

    if (sup.incidents > 0) {
      const penalty = Math.min(sup.incidents * 5, 25)
      score -= penalty
      notes.push(`${sup.incidents} reported incident(s), -${penalty} pts`)
      totalIncidents += sup.incidents
    }

    score = Math.max(0, Math.min(score, 100))

    let riskFlag: LaborPracticeResult['suppliers'][0]['riskFlag'] = 'none'
    if (score >= 80) riskFlag = 'none'
    else if (score >= 60) riskFlag = 'low'
    else if (score >= 40) riskFlag = 'medium'
    else if (score >= 20) riskFlag = 'high'
    else riskFlag = 'critical'

    if (countryRisk < 0.4) notes.push(`High-risk country: ${sup.country}`)
    if (sup.audit_score < 50) notes.push('Low audit score')
    if (sup.certifications.length === 0) notes.push('No recognized certifications')

    results.push({ country: sup.country, score: Math.round(score), riskFlag, notes })

    const key = sup.country.toUpperCase()
    if (!countryMap[key]) countryMap[key] = { totalScore: 0, count: 0 }
    countryMap[key].totalScore += score
    countryMap[key].count++

    totalCerts += sup.certifications.length
    totalPossibleCerts += 10
  }

  const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length

  let riskLevel: LaborPracticeResult['riskLevel'] = 'low'
  if (avgScore >= 70) riskLevel = 'low'
  else if (avgScore >= 50) riskLevel = 'medium'
  else if (avgScore >= 30) riskLevel = 'high'
  else riskLevel = 'critical'

  const countryRiskMap: LaborPracticeResult['countryRiskMap'] = {}
  for (const [country, data] of Object.entries(countryMap)) {
    countryRiskMap[country] = { avgScore: Math.round(data.totalScore / data.count), supplierCount: data.count }
  }

  const recommendations: string[] = []
  const criticalSuppliers = results.filter(r => r.riskFlag === 'critical' || r.riskFlag === 'high')
  if (criticalSuppliers.length > 0) {
    recommendations.push(`Conduct immediate audits for ${criticalSuppliers.length} high/critical-risk supplier(s)`)
  }
  if (totalIncidents > 0) {
    recommendations.push(`Address ${totalIncidents} total reported incident(s) across the supply base`)
  }
  const noCertSuppliers = suppliers.filter(s => s.certifications.length === 0).length
  if (noCertSuppliers > 0) {
    recommendations.push(`Encourage SA8000/BSCI certification for ${noCertSuppliers} uncertified supplier(s)`)
  }
  const highRiskCountries = Object.entries(countryRiskMap).filter(([, v]) => v.avgScore < 40)
  if (highRiskCountries.length > 0) {
    recommendations.push(`Monitor high-risk country operations: ${highRiskCountries.map(([c]) => c).join(', ')}`)
  }

  return {
    overallScore: Math.round(avgScore),
    riskLevel,
    suppliers: results,
    countryRiskMap,
    certificationCoverage: totalPossibleCerts > 0 ? (totalCerts / totalPossibleCerts) * 100 : 0,
    totalIncidents,
    recommendations
  }
}

function formatLaborReport(result: LaborPracticeResult): string {
  const lines: string[] = []
  lines.push('## Labor Practice Scorecard')
  lines.push('')
  lines.push(`**Overall Score:** ${result.overallScore}/100 | **Risk Level:** ${result.riskLevel.toUpperCase()}`)
  lines.push(`**Certification Coverage:** ${result.certificationCoverage.toFixed(0)}% | **Total Incidents:** ${result.totalIncidents}`)
  lines.push('')

  if (result.suppliers.length > 0) {
    lines.push('### Supplier Scores')
    lines.push('| Country | Score | Risk Flag | Notes |')
    lines.push('|---------|-------|-----------|-------|')
    for (const s of result.suppliers.slice(0, 15)) {
      lines.push(`| ${s.country} | ${s.score} | ${s.riskFlag.toUpperCase()} | ${s.notes.join('; ') || 'None'} |`)
    }
  }

  if (Object.keys(result.countryRiskMap).length > 0) {
    lines.push('')
    lines.push('### Country Risk Map')
    lines.push('| Country | Avg Score | Supplier Count |')
    lines.push('|---------|-----------|----------------|')
    for (const [country, data] of Object.entries(result.countryRiskMap)) {
      lines.push(`| ${country} | ${data.avgScore} | ${data.supplierCount} |`)
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`→ ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: GOVERNANCE COMPLIANCE CHECKER ====================

function checkGovernanceCompliance(data: GovernanceData): GovernanceResult {
  let boardScore = 0
  let policyScore = 0
  let transparencyScore = 0
  const strengths: string[] = []
  const weaknesses: string[] = []

  // Board structure scoring (max 100)
  const indRatio = data.board_structure.independent_ratio
  if (indRatio >= 0.5) { boardScore += 25; strengths.push('Board independence >= 50%') }
  else if (indRatio >= 0.3) { boardScore += 15; weaknesses.push('Board independence below 50%') }
  else { boardScore += 5; weaknesses.push('Low board independence') }

  if (data.board_structure.has_esg_committee) { boardScore += 20; strengths.push('Dedicated ESG committee') }
  else { weaknesses.push('No ESG committee at board level') }

  if (data.board_structure.separation_ceo_chair) { boardScore += 20; strengths.push('CEO/Chair separation') }
  else { weaknesses.push('CEO and Chair roles combined') }

  if (data.board_structure.diversity_ratio >= 0.3) { boardScore += 20; strengths.push('Good board diversity (>=30%)') }
  else if (data.board_structure.diversity_ratio >= 0.15) { boardScore += 10; weaknesses.push('Board diversity could improve') }
  else { boardScore += 5; weaknesses.push('Low board diversity') }

  if (data.board_structure.board_size >= 5 && data.board_structure.board_size <= 12) { boardScore += 15; strengths.push('Appropriate board size') }
  else if (data.board_structure.board_size < 5) { boardScore += 5; weaknesses.push('Board may be too small') }
  else { boardScore += 5; weaknesses.push('Board may be too large') }

  // Policy scoring (max 100)
  const policyChecks = [
    { key: 'has_code_of_conduct', label: 'Code of Conduct', weight: 15 },
    { key: 'has_anti_corruption', label: 'Anti-Corruption Policy', weight: 20 },
    { key: 'has_human_rights', label: 'Human Rights Policy', weight: 15 },
    { key: 'has_environmental', label: 'Environmental Policy', weight: 15 },
    { key: 'has_data_privacy', label: 'Data Privacy Policy', weight: 15 },
    { key: 'has_whistleblower', label: 'Whistleblower Mechanism', weight: 20 },
  ]

  for (const p of policyChecks) {
    if (data.policies[p.key as keyof typeof data.policies]) {
      policyScore += p.weight
      strengths.push(`Has ${p.label}`)
    } else {
      weaknesses.push(`Missing ${p.label}`)
    }
  }

  // Transparency scoring (max 100)
  const reportQuality = data.transparency.annual_reporting_quality
  if (reportQuality >= 80) { transparencyScore += 35; strengths.push('High-quality annual reporting') }
  else if (reportQuality >= 60) { transparencyScore += 20; weaknesses.push('Annual report quality needs improvement') }
  else { transparencyScore += 10; weaknesses.push('Poor annual reporting quality') }

  const esgDisclosure = data.transparency.esg_disclosure_score
  if (esgDisclosure >= 70) { transparencyScore += 35; strengths.push('Strong ESG disclosure') }
  else if (esgDisclosure >= 40) { transparencyScore += 20; weaknesses.push('ESG disclosure below best practice') }
  else { transparencyScore += 5; weaknesses.push('Weak ESG disclosure') }

  if (data.transparency.third_party_audited) { transparencyScore += 15; strengths.push('Third-party audited data') }
  else { weaknesses.push('No third-party audit of ESG data') }

  if (data.transparency.executive_compensation_transparent) { transparencyScore += 15; strengths.push('Executive compensation transparent') }
  else { weaknesses.push('Executive compensation not transparent') }

  const overallScore = Math.round((boardScore + policyScore + transparencyScore) / 3)

  let category: GovernanceResult['category']
  if (overallScore >= 80) category = 'excellent'
  else if (overallScore >= 60) category = 'good'
  else if (overallScore >= 40) category = 'adequate'
  else if (overallScore >= 20) category = 'poor'
  else category = 'critical'

  const recommendations: string[] = []
  if (indRatio < 0.5) recommendations.push('Increase independent director ratio to at least 50%')
  if (!data.board_structure.has_esg_committee) recommendations.push('Establish a dedicated ESG/sustainability committee at board level')
  if (!data.board_structure.separation_ceo_chair) recommendations.push('Separate CEO and Board Chair roles')
  if (!data.policies.has_anti_corruption) recommendations.push('Adopt and implement a formal anti-corruption policy')
  if (!data.policies.has_whistleblower) recommendations.push('Implement a whistleblower protection mechanism')
  if (esgDisclosure < 70) recommendations.push('Improve ESG disclosure quality and completeness')
  if (!data.transparency.third_party_audited) recommendations.push('Seek third-party assurance for ESG data')

  return { overallScore, category, boardScore, policyScore, transparencyScore, strengths, weaknesses, recommendations }
}

function formatGovernanceReport(result: GovernanceResult): string {
  const lines: string[] = []
  lines.push('## Governance Compliance Report')
  lines.push('')
  lines.push(`**Overall Score:** ${result.overallScore}/100 | **Category:** ${result.category.toUpperCase()}`)
  lines.push('')
  lines.push('### Dimension Scores')
  lines.push(`| Dimension | Score |`)
  lines.push(`|-----------|-------|`)
  lines.push(`| Board Structure | ${result.boardScore}/100 |`)
  lines.push(`| Policy Framework | ${result.policyScore}/100 |`)
  lines.push(`| Transparency | ${result.transparencyScore}/100 |`)
  lines.push('')

  if (result.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of result.strengths) lines.push(`+ ${s}`)
    lines.push('')
  }

  if (result.weaknesses.length > 0) {
    lines.push('### Weaknesses')
    for (const w of result.weaknesses) lines.push(`− ${w}`)
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push(`→ ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: SUPPLY CHAIN TRANSPARENCY INDEX ====================

function calculateTransparencyIndex(data: VisibilityData): TransparencyResult {
  const tierAvg = (data.tier1_visibility + data.tier2_visibility + data.tier3_visibility) / 3

  const traceScore = (
    data.traceability.raw_material_traceability +
    data.traceability.process_traceability +
    data.traceability.product_traceability
  ) / 3

  let discScore = 0
  const gaps: string[] = []
  if (data.disclosure.supplier_list_public) discScore += 25
  else gaps.push('Supplier list not publicly disclosed')
  if (data.disclosure.audit_results_public) discScore += 25
  else gaps.push('Audit results not publicly disclosed')
  if (data.disclosure.carbon_data_public) discScore += 25
  else gaps.push('Carbon data not publicly disclosed')
  if (data.disclosure.labor_data_public) discScore += 25
  else gaps.push('Labor data not publicly disclosed')

  const overallScore = Math.round((tierAvg * 0.35 + traceScore * 0.35 + discScore * 0.30))

  let transparencyLevel: TransparencyResult['transparencyLevel']
  if (overallScore >= 75) transparencyLevel = 'high'
  else if (overallScore >= 50) transparencyLevel = 'moderate'
  else if (overallScore >= 25) transparencyLevel = 'low'
  else transparencyLevel = 'opaque'

  const recommendations: string[] = []
  if (data.tier1_visibility < 80) recommendations.push('Improve Tier-1 supplier mapping completeness')
  if (data.tier2_visibility < 30) recommendations.push('Extend visibility to Tier-2 suppliers')
  if (data.tier3_visibility < 10) recommendations.push('Develop raw material traceability programs (Tier-3)')
  if (!data.disclosure.supplier_list_public) recommendations.push('Publish supplier list for public accountability')
  if (!data.disclosure.audit_results_public) recommendations.push('Disclose audit results to demonstrate accountability')
  if (data.traceability.raw_material_traceability < 50) recommendations.push('Implement blockchain or DNA-based raw material tracing')
  if (traceScore < 50) recommendations.push('Strengthen end-to-end process traceability systems')

  return {
    overallScore,
    tierVisibility: { tier1: data.tier1_visibility, tier2: data.tier2_visibility, tier3: data.tier3_visibility, average: Math.round(tierAvg) },
    traceabilityScore: Math.round(traceScore),
    disclosureScore: discScore,
    transparencyLevel,
    gaps,
    recommendations
  }
}

function formatTransparencyReport(result: TransparencyResult): string {
  const lines: string[] = []
  lines.push('## Supply Chain Transparency Index')
  lines.push('')
  lines.push(`**Overall Score:** ${result.overallScore}/100 | **Level:** ${result.transparencyLevel.toUpperCase()}`)
  lines.push('')
  lines.push('### Tier Visibility')
  lines.push(`| Tier | Visibility Score |`)
  lines.push(`|------|-----------------|`)
  lines.push(`| Tier 1 (Direct) | ${result.tierVisibility.tier1}% |`)
  lines.push(`| Tier 2 (Sub-suppliers) | ${result.tierVisibility.tier2}% |`)
  lines.push(`| Tier 3 (Raw Materials) | ${result.tierVisibility.tier3}% |`)
  lines.push(`| Average | ${result.tierVisibility.average}% |`)
  lines.push('')
  lines.push(`**Traceability:** ${result.traceabilityScore}/100 | **Disclosure:** ${result.disclosureScore}/100`)

  if (result.gaps.length > 0) {
    lines.push('')
    lines.push('### Transparency Gaps')
    for (const g of result.gaps) lines.push(`− ${g}`)
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push(`→ ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: ESG RISK HEATMAP ====================

function analyzeEsgRiskHeatmap(riskData: RiskItem[]): RiskHeatmapResult {
  const environmental = riskData
    .filter(r => r.category === 'environmental')
    .map(r => ({
      risk: r.risk_name,
      likelihood: r.likelihood,
      impact: r.impact,
      score: Math.round(r.likelihood * r.impact),
      trend: r.trend ?? 'stable'
    }))
    .sort((a, b) => b.score - a.score)

  const social = riskData
    .filter(r => r.category === 'social')
    .map(r => ({
      risk: r.risk_name,
      likelihood: r.likelihood,
      impact: r.impact,
      score: Math.round(r.likelihood * r.impact),
      trend: r.trend ?? 'stable'
    }))
    .sort((a, b) => b.score - a.score)

  const governance = riskData
    .filter(r => r.category === 'governance')
    .map(r => ({
      risk: r.risk_name,
      likelihood: r.likelihood,
      impact: r.impact,
      score: Math.round(r.likelihood * r.impact),
      trend: r.trend ?? 'stable'
    }))
    .sort((a, b) => b.score - a.score)

  const allRisks = [...environmental, ...social, ...governance].sort((a, b) => b.score - a.score)

  const topRisks = allRisks.slice(0, 10).map((r, i) => ({
    rank: i + 1,
    risk: r.risk,
    category: environmental.includes(r) ? 'Environmental' : social.includes(r) ? 'Social' : 'Governance',
    score: r.score,
    priority: r.score >= 70 ? 'Critical' : r.score >= 40 ? 'High' : r.score >= 20 ? 'Medium' : 'Low'
  }))

  const envAvg = environmental.length > 0 ? environmental.reduce((s, r) => s + r.score, 0) / environmental.length : 0
  const socAvg = social.length > 0 ? social.reduce((s, r) => s + r.score, 0) / social.length : 0
  const govAvg = governance.length > 0 ? governance.reduce((s, r) => s + r.score, 0) / governance.length : 0

  let highest = 'Environmental'
  const maxAvg = Math.max(envAvg, socAvg, govAvg)
  if (maxAvg === socAvg) highest = 'Social'
  if (maxAvg === govAvg) highest = 'Governance'

  return {
    environmental,
    social,
    governance,
    topRisks,
    summary: {
      environmentalAvg: Math.round(envAvg),
      socialAvg: Math.round(socAvg),
      governanceAvg: Math.round(govAvg),
      highestRiskCategory: highest,
      totalRiskCount: riskData.length
    }
  }
}

function formatHeatmapReport(result: RiskHeatmapResult): string {
  const lines: string[] = []
  lines.push('## ESG Risk Heatmap')
  lines.push('')
  lines.push(`**Highest Risk Category:** ${result.summary.highestRiskCategory} | **Total Risks:** ${result.summary.totalRiskCount}`)
  lines.push(`- Environmental Avg: ${result.summary.environmentalAvg} | Social Avg: ${result.summary.socialAvg} | Governance Avg: ${result.summary.governanceAvg}`)
  lines.push('')

  if (result.topRisks.length > 0) {
    lines.push('### Top Risks')
    lines.push('| # | Risk | Category | Score | Priority |')
    lines.push('|---|------|----------|-------|----------|')
    for (const r of result.topRisks) {
      lines.push(`| ${r.rank} | ${r.risk} | ${r.category} | ${r.score} | ${r.priority} |`)
    }
  }

  const renderCategory = (title: string, items: RiskHeatmapResult['environmental']) => {
    if (items.length === 0) return
    lines.push('')
    lines.push(`### ${title} Risks`)
    lines.push('| Risk | Likelihood | Impact | Score | Trend |')
    lines.push('|------|------------|--------|-------|-------|')
    for (const r of items) {
      lines.push(`| ${r.risk} | ${r.likelihood} | ${r.impact} | ${r.score} | ${r.trend} |`)
    }
  }

  renderCategory('Environmental', result.environmental)
  renderCategory('Social', result.social)
  renderCategory('Governance', result.governance)

  return lines.join('\n')
}

// ==================== TOOL 6: SUSTAINABILITY REPORT GENERATOR ====================

function generateSustainabilityReport(data: CompanyData): SustainabilityResult {
  const sections: SustainabilityResult['reportSections'] = []
  const griAlignment: string[] = []
  const sasbAlignment: string[] = []
  const materialityTopics: string[] = []
  const disclosureGaps: string[] = []

  // Executive Summary
  sections.push({
    title: 'Executive Summary',
    content: `${data.name} (${data.industry}) — ESG Performance Overview. ` +
      `Employees: ${data.metrics.employees ?? 'N/A'}. ` +
      `Revenue: $${(data.metrics.revenue_usd ?? 0 / 1e6).toFixed(0)}M. ` +
      `CO2e: ${(data.metrics.co2e_tonnes ?? 0).toLocaleString()} tonnes.`,
    standard: 'GRI 1'
  })

  // Environmental Section
  const envContent: string[] = []
  if (data.metrics.co2e_tonnes !== undefined) {
    envContent.push(`GHG Emissions: ${data.metrics.co2e_tonnes.toLocaleString()} tCO2e`)
    griAlignment.push('GRI 305: Emissions')
  } else {
    disclosureGaps.push('GHG emissions data (Scope 1+2) not reported')
  }
  if (data.metrics.water_usage_m3 !== undefined) {
    envContent.push(`Water Usage: ${data.metrics.water_usage_m3.toLocaleString()} m³`)
    griAlignment.push('GRI 303: Water and Effluents')
  } else {
    disclosureGaps.push('Water usage data not reported')
  }
  if (data.metrics.waste_tonnes !== undefined) {
    envContent.push(`Waste Generated: ${data.metrics.waste_tonnes.toLocaleString()} tonnes`)
    griAlignment.push('GRI 306: Waste')
  } else {
    disclosureGaps.push('Waste management data not reported')
  }
  materialityTopics.push('Climate & Emissions', 'Resource Efficiency')
  sasbAlignment.push('GHG Emissions', 'Energy Management')
  sections.push({ title: 'Environmental Performance', content: envContent.join('. ') || 'No environmental data disclosed.', standard: 'GRI 300 Series' })

  // Social Section
  const socContent: string[] = []
  if (data.metrics.diversity_ratio !== undefined) {
    socContent.push(`Diversity Ratio: ${(data.metrics.diversity_ratio * 100).toFixed(0)}%`)
    griAlignment.push('GRI 405: Diversity and Equal Opportunity')
  } else {
    disclosureGaps.push('Workforce diversity data not reported')
  }
  if (data.metrics.training_hours_per_employee !== undefined) {
    socContent.push(`Training Hours: ${data.metrics.training_hours_per_employee} hrs/employee`)
    griAlignment.push('GRI 404: Training and Education')
  } else {
    disclosureGaps.push('Employee training data not reported')
  }
  materialityTopics.push('Diversity & Inclusion', 'Talent Development')
  sasbAlignment.push('Labor Practices', 'Employee Health & Safety')
  sections.push({ title: 'Social Performance', content: socContent.join('. ') || 'No social data disclosed.', standard: 'GRI 400 Series' })

  // Governance Section
  const govContent: string[] = []
  govContent.push(`Industry: ${data.industry}`)
  materialityTopics.push('Business Ethics', 'Supply Chain Governance')
  sasbAlignment.push('Business Model & Innovation', 'Supply Chain Management')
  sections.push({ title: 'Governance & Ethics', content: govContent.join('. '), standard: 'GRI 102' })

  // Goals & Targets
  if (data.goals.length > 0) {
    const goalLines = data.goals.map(g => `• ${g.area}: ${g.target} (by ${g.deadline}, status: ${g.status})`)
    sections.push({ title: 'Sustainability Goals & Targets', content: goalLines.join('\n'), standard: 'GRI 103: Management Approach' })
    griAlignment.push('GRI 103: Management Approach')
  } else {
    disclosureGaps.push('No disclosed sustainability goals or targets')
  }

  return { reportSections: sections, griAlignment, sasbAlignment, materialityTopics, disclosureGaps }
}

function formatSustainabilityReport(result: SustainabilityResult): string {
  const lines: string[] = []
  lines.push('## Sustainability Report (GRI/SASB Aligned)')
  lines.push('')

  for (const section of result.reportSections) {
    lines.push(`### ${section.title}`)
    lines.push(`*Standard: ${section.standard}*`)
    lines.push('')
    lines.push(section.content)
    lines.push('')
  }

  if (result.griAlignment.length > 0) {
    lines.push('### GRI Standards Alignment')
    lines.push(result.griAlignment.map(g => `• ${g}`).join('\n'))
    lines.push('')
  }

  if (result.sasbAlignment.length > 0) {
    lines.push('### SASB Standards Alignment')
    lines.push(result.sasbAlignment.map(s => `• ${s}`).join('\n'))
    lines.push('')
  }

  if (result.materialityTopics.length > 0) {
    lines.push('### Materiality Topics')
    lines.push(result.materialityTopics.map(t => `• ${t}`).join('\n'))
    lines.push('')
  }

  if (result.disclosureGaps.length > 0) {
    lines.push('### Disclosure Gaps')
    for (const g of result.disclosureGaps) lines.push(`− ${g}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: STAKEHOLDER IMPACT ASSESSMENT ====================

function assessStakeholderImpact(stakeholders: Stakeholder[]): StakeholderResult {
  const influenceMap: Record<string, number> = { low: 1, medium: 2, high: 3 }
  const engagementMap: Record<string, number> = { none: 0, inform: 1, consult: 2, involve: 3, collaborate: 4 }

  const stakeholderMap = stakeholders.map(s => {
    const influence = influenceMap[s.influence] ?? 2
    const engagement = engagementMap[s.engagement_level ?? 'none'] ?? 0
    const materialityScore = Math.round((influence * 0.6 + (s.concerns.length / 5) * 0.4) * 50)
    const engagementPriority = Math.round(influence * 20 + (5 - engagement) * 10)

    return {
      type: s.type,
      level: s.engagement_level ?? 'none',
      concerns: s.concerns,
      influence: s.influence,
      materialityScore: Math.min(materialityScore, 100),
      engagementPriority: Math.min(engagementPriority, 100)
    }
  }).sort((a, b) => b.materialityScore - a.materialityScore)

  const highPriority = stakeholderMap.filter(s => s.materialityScore >= 60).map(s => s.type)
  const mediumPriority = stakeholderMap.filter(s => s.materialityScore >= 30 && s.materialityScore < 60).map(s => s.type)
  const lowPriority = stakeholderMap.filter(s => s.materialityScore < 30).map(s => s.type)

  const recommendations: string[] = []
  const highInfLowEng = stakeholderMap.filter(s => s.influence === 'high' && (s.level === 'none' || s.level === 'inform'))
  if (highInfLowEng.length > 0) {
    recommendations.push(`Urgently engage high-influence stakeholders: ${highInfLowEng.map(s => s.type).join(', ')}`)
  }
  if (highPriority.length > 0) {
    recommendations.push(`Prioritize dialogue with: ${highPriority.join(', ')}`)
  }
  for (const s of stakeholderMap) {
    if (s.concerns.length === 0) {
      recommendations.push(`Map concerns for ${s.type} to understand expectations`)
    }
  }
  const collaborate = stakeholderMap.filter(s => s.level === 'collaborate')
  if (collaborate.length === 0) {
    recommendations.push('Identify opportunities for collaborative partnership with key stakeholders')
  }

  return {
    stakeholderMap,
    materialityMatrix: { highPriority, mediumPriority, lowPriority },
    engagementRecommendations: recommendations
  }
}

function formatStakeholderReport(result: StakeholderResult): string {
  const lines: string[] = []
  lines.push('## Stakeholder Impact Assessment')
  lines.push('')

  lines.push('### Stakeholder Map')
  lines.push('| Type | Influence | Engagement | Materiality | Priority | Concerns |')
  lines.push('|------|-----------|------------|-------------|----------|----------|')
  for (const s of result.stakeholderMap) {
    const concerns = s.concerns.length > 0 ? s.concerns.join(', ') : 'Not mapped'
    lines.push(`| ${s.type} | ${s.influence.toUpperCase()} | ${s.level} | ${s.materialityScore} | ${s.engagementPriority} | ${concerns} |`)
  }

  lines.push('')
  lines.push('### Materiality Matrix')
  lines.push(`**High Priority:** ${result.materialityMatrix.highPriority.join(', ') || 'None'}`)
  lines.push(`**Medium Priority:** ${result.materialityMatrix.mediumPriority.join(', ') || 'None'}`)
  lines.push(`**Low Priority:** ${result.materialityMatrix.lowPriority.join(', ') || 'None'}`)

  if (result.engagementRecommendations.length > 0) {
    lines.push('')
    lines.push('### Engagement Recommendations')
    for (const r of result.engagementRecommendations) lines.push(`→ ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: ESG BENCHMARKING ====================

function benchmarkEsg(companyMetrics: CompanyMetrics, peerData: PeerData[], industry: string): BenchmarkingResult {
  const metrics: Array<{ key: string; label: string; lowerIsBetter?: boolean }> = [
    { key: 'co2e_intensity', label: 'CO2e Intensity' },
    { key: 'energy_efficiency', label: 'Energy Efficiency' },
    { key: 'water_intensity', label: 'Water Intensity', lowerIsBetter: true },
    { key: 'waste_recycling_rate', label: 'Waste Recycling Rate' },
    { key: 'diversity_ratio', label: 'Diversity Ratio' },
    { key: 'board_independence', label: 'Board Independence' },
    { key: 'ethics_training_coverage', label: 'Ethics Training Coverage' },
    { key: 'supplier_audit_rate', label: 'Supplier Audit Rate' },
    { key: 'employee_satisfaction', label: 'Employee Satisfaction' },
    { key: 'community_investment_pct', label: 'Community Investment %' },
  ]

  const comparison: BenchmarkingResult['peerComparison'] = []
  const categoryScores: Record<string, number[]> = { Environmental: [], Social: [], Governance: [] }

  for (const m of metrics) {
    const companyVal = companyMetrics[m.key as keyof CompanyMetrics]
    if (companyVal === undefined) continue

    const peerValues = peerData
      .map(p => p[m.key as keyof PeerData])
      .filter((v): v is number => v !== undefined)

    if (peerValues.length === 0) continue

    const peerAvg = peerValues.reduce((s, v) => s + v, 0) / peerValues.length
    const peerBest = m.lowerIsBetter ? Math.min(...peerValues) : Math.max(...peerValues)

    let betterCount = 0
    for (const pv of peerValues) {
      if (m.lowerIsBetter) {
        if (companyVal <= pv) betterCount++
      } else {
        if (companyVal >= pv) betterCount++
      }
    }
    const percentile = Math.round((betterCount / peerValues.length) * 100)

    comparison.push({
      metric: m.label,
      companyValue: companyVal,
      peerAvg: Math.round(peerAvg * 100) / 100,
      peerBest,
      percentile
    })

    // Categorize
    if (['CO2e Intensity', 'Energy Efficiency', 'Water Intensity', 'Waste Recycling Rate'].includes(m.label)) {
      categoryScores['Environmental'].push(percentile)
    } else if (['Diversity Ratio', 'Ethics Training Coverage', 'Supplier Audit Rate', 'Employee Satisfaction', 'Community Investment %'].includes(m.label)) {
      categoryScores['Social'].push(percentile)
    } else {
      categoryScores['Governance'].push(percentile)
    }
  }

  const categoryPercentiles: Record<string, number> = {}
  for (const [cat, scores] of Object.entries(categoryScores)) {
    if (scores.length > 0) {
      categoryPercentiles[cat] = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    }
  }

  const overallPercentile = comparison.length > 0
    ? Math.round(comparison.reduce((s, c) => s + c.percentile, 0) / comparison.length)
    : 0

  const strengths: string[] = []
  const weaknesses: string[] = []
  const leaders: string[] = []
  const average: string[] = []
  const laggards: string[] = []

  for (const c of comparison) {
    if (c.percentile >= 75) { leaders.push(c.metric); strengths.push(`${c.metric} (${c.percentile}th percentile)`) }
    else if (c.percentile >= 40) { average.push(c.metric) }
    else { laggards.push(c.metric); weaknesses.push(`${c.metric} (${c.percentile}th percentile)`) }
  }

  return {
    overallPercentile,
    categoryPercentiles,
    peerComparison: comparison,
    industry,
    peerCount: peerData.length,
    strengths,
    weaknesses,
    trendIndicators: { leaders, average, laggards }
  }
}

function formatBenchmarkingReport(result: BenchmarkingResult): string {
  const lines: string[] = []
  lines.push(`## ESG Benchmarking vs ${result.industry}`)
  lines.push('')
  lines.push(`**Overall Percentile:** ${result.overallPercentile}th | **Peers Analyzed:** ${result.peerCount}`)
  lines.push('')

  if (Object.keys(result.categoryPercentiles).length > 0) {
    lines.push('### Category Percentiles')
    lines.push(`| Category | Percentile |`)
    lines.push(`|----------|------------|`)
    for (const [cat, pct] of Object.entries(result.categoryPercentiles)) {
      lines.push(`| ${cat} | ${pct}th |`)
    }
    lines.push('')
  }

  if (result.peerComparison.length > 0) {
    lines.push('### Peer Comparison')
    lines.push('| Metric | Company | Peer Avg | Peer Best | Percentile |')
    lines.push('|--------|---------|----------|-----------|------------|')
    for (const c of result.peerComparison) {
      lines.push(`| ${c.metric} | ${c.companyValue} | ${c.peerAvg} | ${c.peerBest} | ${c.percentile}th |`)
    }
    lines.push('')
  }

  if (result.strengths.length > 0) {
    lines.push('### Strengths (Top Quartile)')
    for (const s of result.strengths) lines.push(`+ ${s}`)
    lines.push('')
  }

  if (result.weaknesses.length > 0) {
    lines.push('### Weaknesses (Bottom Quartile)')
    for (const w of result.weaknesses) lines.push(`− ${w}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Carbon Footprint Calculator
  tools.register(defineTool({
    name: 'carbon_footprint_calculator',
    description: 'Calculate total carbon footprint (CO2e) across Scope 1, 2, and 3 emissions. Takes activity data with emission factors and returns a detailed breakdown with percentages.',
    parameters: {
      activities: { type: 'string', required: true, description: 'JSON array of activity objects with fields: activity_type (string), quantity (number), emission_factor (number), scope (optional: 1|2|3), unit (optional: string)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { activities: string }) {
      const data: Activity[] = JSON.parse(args.activities)
      const result = calculateCarbonFootprint(data)
      return formatCarbonReport(result)
    }
  }))

  // Tool 2: Labor Practice Scorer
  tools.register(defineTool({
    name: 'labor_practice_scorer',
    description: 'Score labor practices across suppliers based on audit scores, country risk, certifications, and incidents. Returns risk flags and recommendations.',
    parameters: {
      suppliers: { type: 'string', required: true, description: 'JSON array of supplier objects with fields: country (ISO code), audit_score (0-100), certifications (string[]), incidents (count), name (optional), tier (optional), sector (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { suppliers: string }) {
      const data: Supplier[] = JSON.parse(args.suppliers)
      const result = scoreLaborPractices(data)
      return formatLaborReport(result)
    }
  }))

  // Tool 3: Governance Compliance Checker
  tools.register(defineTool({
    name: 'governance_compliance_checker',
    description: 'Evaluate corporate governance quality across board structure, policy framework, and transparency. Returns dimension scores and actionable recommendations.',
    parameters: {
      governance_data: { type: 'string', required: true, description: 'JSON object with fields: board_structure (independent_ratio, diversity_ratio, has_esg_committee, separation_ceo_chair, board_size), policies (has_code_of_conduct, has_anti_corruption, has_human_rights, has_environmental, has_data_privacy, has_whistleblower), transparency (annual_reporting_quality, esg_disclosure_score, third_party_audited, executive_compensation_transparent)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { governance_data: string }) {
      const data: GovernanceData = JSON.parse(args.governance_data)
      const result = checkGovernanceCompliance(data)
      return formatGovernanceReport(result)
    }
  }))

  // Tool 4: Supply Chain Transparency Index
  tools.register(defineTool({
    name: 'supply_chain_transparency_index',
    description: 'Calculate supply chain transparency score based on tier-N visibility, traceability systems, and disclosure practices. Identifies transparency gaps.',
    parameters: {
      visibility_data: { type: 'string', required: true, description: 'JSON object with fields: tier1_visibility (0-100), tier2_visibility (0-100), tier3_visibility (0-100), traceability (raw_material_traceability, process_traceability, product_traceability), disclosure (supplier_list_public, audit_results_public, carbon_data_public, labor_data_public)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { visibility_data: string }) {
      const data: VisibilityData = JSON.parse(args.visibility_data)
      const result = calculateTransparencyIndex(data)
      return formatTransparencyReport(result)
    }
  }))

  // Tool 5: ESG Risk Heatmap
  tools.register(defineTool({
    name: 'esg_risk_heatmap',
    description: 'Generate ESG risk heatmap from environmental, social, and governance risk items. Returns scored and ranked risks with priority levels.',
    parameters: {
      risk_data: { type: 'string', required: true, description: 'JSON array of risk objects with fields: category (environmental|social|governance), risk_name (string), likelihood (1-10), impact (1-10), trend (optional: increasing|stable|decreasing)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_data: string }) {
      const data: RiskItem[] = JSON.parse(args.risk_data)
      const result = analyzeEsgRiskHeatmap(data)
      return formatHeatmapReport(result)
    }
  }))

  // Tool 6: Sustainability Report Generator
  tools.register(defineTool({
    name: 'sustainability_report_generator',
    description: 'Generate GRI and SASB-aligned sustainability report sections from company data. Includes materiality topics and identifies disclosure gaps.',
    parameters: {
      company_data: { type: 'string', required: true, description: 'JSON object with fields: name (string), industry (string), metrics (co2e_tonnes, water_usage_m3, waste_tonnes, diversity_ratio, training_hours_per_employee, revenue_usd, employees), goals (array of area, target, deadline, status)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { company_data: string }) {
      const data: CompanyData = JSON.parse(args.company_data)
      const result = generateSustainabilityReport(data)
      return formatSustainabilityReport(result)
    }
  }))

  // Tool 7: Stakeholder Impact Assessment
  tools.register(defineTool({
    name: 'stakeholder_impact_assessment',
    description: 'Assess stakeholder impacts by mapping types, concerns, influence levels, and engagement. Returns materiality matrix and engagement recommendations.',
    parameters: {
      stakeholders: { type: 'string', required: true, description: 'JSON array of stakeholder objects with fields: type (string), concerns (string[]), influence (low|medium|high), engagement_level (optional: none|inform|consult|involve|collaborate)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { stakeholders: string }) {
      const data: Stakeholder[] = JSON.parse(args.stakeholders)
      const result = assessStakeholderImpact(data)
      return formatStakeholderReport(result)
    }
  }))

  // Tool 8: ESG Benchmarking
  tools.register(defineTool({
    name: 'esg_benchmarking',
    description: 'Compare company ESG metrics against industry peers and return percentile rankings. Identifies strengths, weaknesses, and competitive positioning.',
    parameters: {
      company_metrics: { type: 'string', required: true, description: 'JSON object with ESG metrics: co2e_intensity, energy_efficiency, water_intensity, waste_recycling_rate, diversity_ratio, board_independence, ethics_training_coverage, supplier_audit_rate, employee_satisfaction, community_investment_pct' },
      peer_data: { type: 'string', required: true, description: 'JSON array of peer company objects with same metric fields as company_metrics, plus name (string)' },
      industry: { type: 'string', required: true, description: 'Industry name for context (e.g., "Apparel", "Technology", "Manufacturing")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { company_metrics: string; peer_data: string; industry: string }) {
      const company: CompanyMetrics = JSON.parse(args.company_metrics)
      const peers: PeerData[] = JSON.parse(args.peer_data)
      const result = benchmarkEsg(company, peers, args.industry)
      return formatBenchmarkingReport(result)
    }
  }))

  console.log(`[dsh-tool-esgscore] Loaded v${VERSION} — ESG Supply Chain Scorer with 8 tools`)
  console.log('  Tools: carbon_footprint_calculator, labor_practice_scorer, governance_compliance_checker, supply_chain_transparency_index, esg_risk_heatmap, sustainability_report_generator, stakeholder_impact_assessment, esg_benchmarking')
}
