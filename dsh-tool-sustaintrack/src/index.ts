/**
 * DSH SustainTrack Plugin v0.1.0
 *
 * Sustainability & ESG Reporting toolkit for DeepSeek Harness Agent.
 * Designed for sustainability officers, ESG analysts, and impact investors.
 *
 * Features (v0.1.0):
 * - ESG Score Calculator (composite ESG scoring with weighted dimensions)
 * - Sustainability Report Generator (GRI/SASB/TCFD-aligned report sections)
 * - Greenwashing Detector (identifies misleading sustainability claims)
 * - Impact Measurement Engine (quantifies social and environmental impact)
 * - Stakeholder Engagement Tracker (monitors engagement activities and sentiment)
 * - Climate Risk Assessor (evaluates physical and transition climate risks)
 * - Circular Economy Optimizer (identifies circularity improvement opportunities)
 * - ESG Benchmark Analyzer (compares ESG performance against industry peers)
 *
 * @module dsh-tool-sustaintrack
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-sustaintrack'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== PRNG (mulberry32) ====================

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromInput(input: unknown): number {
  const str = JSON.stringify(input)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// ==================== TYPES ====================

export interface EsgDimension {
  category: 'environmental' | 'social' | 'governance'
  metric_name: string
  value: number
  weight: number
  benchmark?: number
}

export interface EsgScoreInput {
  company_name: string
  industry: string
  dimensions: EsgDimension[]
  reporting_period: string
  currency?: string
}

export interface DimensionScore {
  category: string
  score: number
  weighted_score: number
  metric_count: number
  metrics: Array<{ name: string; value: number; weight: number; contribution: number }>
}

export interface EsgScoreResult {
  overall_score: number
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC'
  confidence: number
  dimensions: DimensionScore[]
  industry: string
  reporting_period: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface ReportSection {
  title: string
  content: string
  standard: string
  disclosures: string[]
}

export interface SustainabilityReportInput {
  company_name: string
  industry: string
  reporting_period: string
  framework: 'GRI' | 'SASB' | 'TCFD' | 'CDP' | 'Integrated'
  metrics: Record<string, number | string>
  goals: Array<{ area: string; target: string; deadline: string; status: string }>
  material_topics: string[]
}

export interface SustainabilityReportResult {
  report_sections: ReportSection[]
  framework: string
  alignment_score: number
  materiality_coverage: number
  disclosure_gaps: string[]
  compliance_notes: string[]
}

export interface ClaimInput {
  claim_text: string
  claim_type: 'environmental' | 'social' | 'governance' | 'general'
  evidence_provided: boolean
  third_party_verified: boolean
  specificity_score: number
  data_references: string[]
}

export interface GreenwashingInput {
  company_name: string
  claims: ClaimInput[]
  esg_report_url?: string
  industry: string
}

export interface ClaimAssessment {
  claim_text: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_score: number
  red_flags: string[]
  suggestions: string[]
}

export interface GreenwashingResult {
  overall_risk_score: number
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical'
  claims_assessed: ClaimAssessment[]
  total_red_flags: number
  summary: string
  recommendations: string[]
}

export interface ImpactMetric {
  metric_name: string
  value: number
  unit: string
  category: 'environmental' | 'social' | 'governance'
  sdg_alignment: number[]
  baseline_value?: number
  target_value?: number
}

export interface ImpactInput {
  organization_name: string
  project_name: string
  metrics: ImpactMetric[]
  beneficiaries: number
  geographic_scope: string
  time_period: string
}

export interface ImpactMetricResult {
  metric_name: string
  value: number
  unit: string
  category: string
  sdg_alignment: number[]
  change_from_baseline: number
  progress_to_target: number
  impact_rating: 'transformative' | 'significant' | 'moderate' | 'minimal'
}

export interface ImpactResult {
  total_impact_score: number
  impact_category: 'transformative' | 'significant' | 'moderate' | 'minimal'
  metrics: ImpactMetricResult[]
  sdg_coverage: number[]
  beneficiaries: number
  impact_per_beneficiary: number
  recommendations: string[]
}

export interface StakeholderGroup {
  group_type: string
  influence_level: 'low' | 'medium' | 'high'
  interest_level: 'low' | 'medium' | 'high'
  engagement_frequency: number
  last_engagement_date: string
  sentiment_score: number
  key_concerns: string[]
}

export interface StakeholderInput {
  organization_name: string
  stakeholders: StakeholderGroup[]
  reporting_period: string
}

export interface StakeholderStatus {
  group_type: string
  influence_level: string
  interest_level: string
  engagement_status: 'active' | 'adequate' | 'insufficient' | 'neglected'
  sentiment_trend: 'improving' | 'stable' | 'declining'
  priority_score: number
  concerns: string[]
  action_needed: string[]
}

export interface StakeholderResult {
  stakeholders: StakeholderStatus[]
  engagement_coverage: number
  avg_sentiment: number
  high_priority_count: number
  neglected_count: number
  recommendations: string[]
}

export interface ClimateRiskItem {
  risk_type: 'physical' | 'transition'
  hazard: string
  time_horizon: 'short' | 'medium' | 'long'
  likelihood: number
  financial_impact: number
  adaptation_cost?: number
}

export interface ClimateInput {
  organization_name: string
  sector: string
  geographic_exposure: string[]
  risks: ClimateRiskItem[]
  scenario: '1.5C' | '2C' | '3C' | '4C'
}

export interface RiskAssessment {
  risk_type: string
  hazard: string
  time_horizon: string
  likelihood: number
  financial_impact: number
  risk_score: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  adaptation_strategies: string[]
}

export interface ClimateResult {
  total_risk_exposure: number
  physical_risk_score: number
  transition_risk_score: number
  risk_level: 'low' | 'moderate' | 'high' | 'severe'
  scenario: string
  top_risks: RiskAssessment[]
  adaptation_recommendations: string[]
  financial_exposure_estimate: number
}

export interface CircularityMetric {
  metric_name: string
  current_value: number
  unit: string
  category: 'input' | 'process' | 'output' | 'recovery'
  benchmark_value?: number
}

export interface CircularEconomyInput {
  organization_name: string
  industry: string
  metrics: CircularityMetric[]
  products: Array<{ name: string; recyclability: number; recycled_content: number; lifespan_years: number }>
  waste_streams: Array<{ type: string; volume_tonnes: number; recovery_rate: number }>
}

export interface CircularityImprovement {
  area: string
  current_performance: number
  potential_improvement: number
  priority: 'high' | 'medium' | 'low'
  estimated_cost_savings: number
  co2_reduction_potential: number
  actions: string[]
}

export interface CircularEconomyResult {
  circularity_score: number
  circularity_level: 'advanced' | 'developing' | 'basic' | 'linear'
  improvements: CircularityImprovement[]
  total_potential_savings: number
  total_co2_reduction: number
  recommendations: string[]
}

export interface BenchmarkMetric {
  metric_name: string
  company_value: number
  unit: string
  higher_is_better: boolean
}

export interface PeerMetric {
  peer_name: string
  metrics: Array<{ metric_name: string; value: number }>
}

export interface BenchmarkInput {
  company_name: string
  industry: string
  metrics: BenchmarkMetric[]
  peers: PeerMetric[]
  reporting_year: number
}

export interface MetricComparison {
  metric_name: string
  company_value: number
  peer_average: number
  peer_best: number
  peer_worst: number
  percentile: number
  status: 'leader' | 'above_average' | 'average' | 'below_average' | 'laggard'
}

export interface BenchmarkResult {
  overall_percentile: number
  category: 'leader' | 'above_average' | 'average' | 'below_average' | 'laggard'
  metric_comparisons: MetricComparison[]
  industry: string
  peer_count: number
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

// ==================== TOOL 1: ESG SCORE CALCULATOR ====================

function calculateEsgScore(input: EsgScoreInput): EsgScoreResult {
  const rng = mulberry32(seedFromInput(input))
  const dimMap: Record<string, EsgDimension[]> = { environmental: [], social: [], governance: [] }

  for (const d of input.dimensions) {
    dimMap[d.category].push(d)
  }

  const dimensions: DimensionScore[] = []
  const strengths: string[] = []
  const weaknesses: string[] = []

  for (const [category, items] of Object.entries(dimMap)) {
    if (items.length === 0) continue

    let totalWeight = 0
    let weightedSum = 0
    const metricResults: DimensionScore['metrics'] = []

    for (const item of items) {
      const benchmark = item.benchmark ?? 50
      const normalizedValue = benchmark > 0 ? (item.value / benchmark) * 50 : 50
      const clampedValue = Math.max(0, Math.min(normalizedValue, 100))
      const contribution = clampedValue * item.weight
      weightedSum += contribution
      totalWeight += item.weight

      metricResults.push({
        name: item.metric_name,
        value: item.value,
        weight: item.weight,
        contribution: Math.round(contribution * 100) / 100
      })
    }

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0
    const roundedScore = Math.round(score)

    dimensions.push({
      category,
      score: roundedScore,
      weighted_score: Math.round((score / 100) * items.length * 100) / 100,
      metric_count: items.length,
      metrics: metricResults
    })

    if (roundedScore >= 70) {
      strengths.push(category + ' performance is strong (' + roundedScore + '/100)')
    } else if (roundedScore < 40) {
      weaknesses.push(category + ' performance needs significant improvement (' + roundedScore + '/100)')
    }
  }

  const overallScore = dimensions.length > 0
    ? Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length)
    : 0

  const jitter = (rng() - 0.5) * 4
  const confidence = Math.max(60, Math.min(95, Math.round(75 + jitter)))

  let rating: EsgScoreResult['rating']
  if (overallScore >= 90) rating = 'AAA'
  else if (overallScore >= 80) rating = 'AA'
  else if (overallScore >= 70) rating = 'A'
  else if (overallScore >= 60) rating = 'BBB'
  else if (overallScore >= 50) rating = 'BB'
  else if (overallScore >= 40) rating = 'B'
  else rating = 'CCC'

  const recommendations: string[] = []
  for (const d of dimensions) {
    if (d.score < 50) {
      recommendations.push('Prioritize improvement in ' + d.category + ' dimension (current: ' + d.score + '/100)')
    }
  }
  if (dimensions.length < 3) {
    recommendations.push('Expand ESG data coverage across all three dimensions (E, S, G)')
  }
  if (confidence < 80) {
    recommendations.push('Improve data quality and verification to increase scoring confidence')
  }
  const lowMetrics = dimensions.flatMap(d => d.metrics.filter(m => m.contribution < 20))
  if (lowMetrics.length > 0) {
    recommendations.push('Address underperforming metrics: ' + lowMetrics.slice(0, 3).map(m => m.name).join(', '))
  }

  return {
    overall_score: overallScore,
    rating,
    confidence,
    dimensions,
    industry: input.industry,
    reporting_period: input.reporting_period,
    strengths,
    weaknesses,
    recommendations
  }
}

function formatEsgScoreReport(result: EsgScoreResult): string {
  const lines: string[] = []
  lines.push('## ESG Score Report')
  lines.push('')
  lines.push('**Overall Score:** ' + result.overall_score + '/100 | **Rating:** ' + result.rating + ' | **Confidence:** ' + result.confidence + '%')
  lines.push('**Industry:** ' + result.industry + ' | **Period:** ' + result.reporting_period)
  lines.push('')

  if (result.dimensions.length > 0) {
    lines.push('### Dimension Scores')
    lines.push('| Category | Score | Metrics |')
    lines.push('|----------|-------|---------|')
    for (const d of result.dimensions) {
      lines.push('| ' + d.category.charAt(0).toUpperCase() + d.category.slice(1) + ' | ' + d.score + '/100 | ' + d.metric_count + ' |')
    }
    lines.push('')
  }

  if (result.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of result.strengths) lines.push('+ ' + s)
    lines.push('')
  }

  if (result.weaknesses.length > 0) {
    lines.push('### Weaknesses')
    for (const w of result.weaknesses) lines.push('- ' + w)
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push('> ' + r)
  }

  return lines.join('\n')
}

// ==================== TOOL 2: SUSTAINABILITY REPORT GENERATOR ====================

function generateSustainabilityReport(input: SustainabilityReportInput): SustainabilityReportResult {
  const sections: ReportSection[] = []
  const disclosureGaps: string[] = []
  const complianceNotes: string[] = []

  // CEO Statement
  sections.push({
    title: 'CEO Statement on Sustainability',
    content: 'Sustainability report for ' + input.company_name + ' (' + input.industry + ') covering ' + input.reporting_period + '. Prepared in accordance with ' + input.framework + ' framework.',
    standard: input.framework + ' General Requirements',
    disclosures: ['Organizational profile', 'Reporting period', 'Framework applied']
  })

  // Materiality Assessment
  if (input.material_topics.length > 0) {
    sections.push({
      title: 'Materiality Assessment',
      content: 'Material topics identified: ' + input.material_topics.join(', ') + '. These topics were prioritized based on stakeholder input and business impact analysis.',
      standard: 'GRI 102-46 / GRI 102-47',
      disclosures: input.material_topics
    })
    complianceNotes.push('Materiality assessment covers ' + input.material_topics.length + ' topics')
  } else {
    disclosureGaps.push('No material topics disclosed')
  }

  // Environmental Metrics
  const envMetrics = Object.entries(input.metrics).filter(([k]) =>
    k.toLowerCase().includes('carbon') || k.toLowerCase().includes('energy') ||
    k.toLowerCase().includes('water') || k.toLowerCase().includes('waste') ||
    k.toLowerCase().includes('emission')
  )
  if (envMetrics.length > 0) {
    const envContent = envMetrics.map(([k, v]) => k + ': ' + v).join('. ')
    sections.push({
      title: 'Environmental Performance',
      content: envContent,
      standard: 'GRI 300 Series',
      disclosures: envMetrics.map(([k]) => k)
    })
  } else {
    disclosureGaps.push('Environmental metrics not reported')
  }

  // Social Metrics
  const socMetrics = Object.entries(input.metrics).filter(([k]) =>
    k.toLowerCase().includes('employee') || k.toLowerCase().includes('diversity') ||
    k.toLowerCase().includes('safety') || k.toLowerCase().includes('training') ||
    k.toLowerCase().includes('community')
  )
  if (socMetrics.length > 0) {
    const socContent = socMetrics.map(([k, v]) => k + ': ' + v).join('. ')
    sections.push({
      title: 'Social Performance',
      content: socContent,
      standard: 'GRI 400 Series',
      disclosures: socMetrics.map(([k]) => k)
    })
  } else {
    disclosureGaps.push('Social metrics not reported')
  }

  // Governance Metrics
  const govMetrics = Object.entries(input.metrics).filter(([k]) =>
    k.toLowerCase().includes('board') || k.toLowerCase().includes('ethics') ||
    k.toLowerCase().includes('compliance') || k.toLowerCase().includes('transparency') ||
    k.toLowerCase().includes('corruption')
  )
  if (govMetrics.length > 0) {
    const govContent = govMetrics.map(([k, v]) => k + ': ' + v).join('. ')
    sections.push({
      title: 'Governance & Ethics',
      content: govContent,
      standard: 'GRI 102 Series',
      disclosures: govMetrics.map(([k]) => k)
    })
  } else {
    disclosureGaps.push('Governance metrics not reported')
  }

  // Goals & Targets
  if (input.goals.length > 0) {
    const goalLines = input.goals.map(g => '- ' + g.area + ': ' + g.target + ' (by ' + g.deadline + ', status: ' + g.status + ')')
    sections.push({
      title: 'Sustainability Goals & Targets',
      content: goalLines.join('\n'),
      standard: 'GRI 103: Management Approach',
      disclosures: input.goals.map(g => g.area)
    })
  } else {
    disclosureGaps.push('No sustainability goals or targets disclosed')
  }

  // Framework-specific sections
  if (input.framework === 'TCFD') {
    sections.push({
      title: 'Climate Risk & Opportunities (TCFD)',
      content: 'Analysis of climate-related risks and opportunities following TCFD recommendations across Governance, Strategy, Risk Management, and Metrics & Targets.',
      standard: 'TCFD Recommendations',
      disclosures: ['Climate governance', 'Scenario analysis', 'Risk management', 'Metrics and targets']
    })
    complianceNotes.push('TCFD-aligned climate disclosure included')
  }

  if (input.framework === 'CDP') {
    sections.push({
      title: 'CDP Climate Change Questionnaire Response',
      content: 'Response to CDP climate change questionnaire covering governance, risks, opportunities, business strategy, targets, and emissions data.',
      standard: 'CDP Climate Change',
      disclosures: ['C1: Governance', 'C2: Risks & Opportunities', 'C3: Business Strategy', 'C6: Emissions']
    })
    complianceNotes.push('CDP questionnaire structure applied')
  }

  const totalMetrics = Object.keys(input.metrics).length
  const alignmentScore = Math.min(100, Math.round(
    (envMetrics.length > 0 ? 25 : 0) +
    (socMetrics.length > 0 ? 25 : 0) +
    (govMetrics.length > 0 ? 25 : 0) +
    (input.goals.length > 0 ? 15 : 0) +
    (input.material_topics.length > 0 ? 10 : 0)
  ))

  const materialityCoverage = input.material_topics.length > 0
    ? Math.min(100, input.material_topics.length * 15)
    : 0

  return {
    report_sections: sections,
    framework: input.framework,
    alignment_score: alignmentScore,
    materiality_coverage: materialityCoverage,
    disclosure_gaps: disclosureGaps,
    compliance_notes: complianceNotes
  }
}

function formatSustainabilityReport(result: SustainabilityReportResult): string {
  const lines: string[] = []
  lines.push('## Sustainability Report (' + result.framework + ' Framework)')
  lines.push('')
  lines.push('**Alignment Score:** ' + result.alignment_score + '% | **Materiality Coverage:** ' + result.materiality_coverage + '%')
  lines.push('')

  for (const section of result.report_sections) {
    lines.push('### ' + section.title)
    lines.push('*' + section.standard + '*')
    lines.push('')
    lines.push(section.content)
    if (section.disclosures.length > 0) {
      lines.push('')
      lines.push('**Disclosures:** ' + section.disclosures.join(', '))
    }
    lines.push('')
  }

  if (result.compliance_notes.length > 0) {
    lines.push('### Compliance Notes')
    for (const note of result.compliance_notes) lines.push('+ ' + note)
    lines.push('')
  }

  if (result.disclosure_gaps.length > 0) {
    lines.push('### Disclosure Gaps')
    for (const gap of result.disclosure_gaps) lines.push('- ' + gap)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: GREENWASHING DETECTOR ====================

function detectGreenwashing(input: GreenwashingInput): GreenwashingResult {
  const rng = mulberry32(seedFromInput(input))
  const assessments: ClaimAssessment[] = []
  let totalRedFlags = 0

  for (const claim of input.claims) {
    const redFlags: string[] = []
    const suggestions: string[] = []
    let riskScore = 0

    // Check specificity
    if (claim.specificity_score < 30) {
      riskScore += 25
      redFlags.push('Vague or non-specific claim language')
      suggestions.push('Include quantifiable metrics and specific timeframes')
    } else if (claim.specificity_score < 60) {
      riskScore += 10
      redFlags.push('Moderate specificity; could be more precise')
      suggestions.push('Add baseline data and measurable targets')
    }

    // Check evidence
    if (!claim.evidence_provided) {
      riskScore += 20
      redFlags.push('No supporting evidence provided for claim')
      suggestions.push('Provide data sources, methodology, or third-party verification')
    }

    // Check third-party verification
    if (!claim.third_party_verified) {
      riskScore += 15
      redFlags.push('Claim lacks third-party verification')
      suggestions.push('Seek independent assurance or certification (e.g., B Corp, ISO 14001)')
    }

    // Check data references
    if (claim.data_references.length === 0) {
      riskScore += 15
      redFlags.push('No data references or sources cited')
      suggestions.push('Cite specific data sources, reports, or standards')
    }

    // Check for common greenwashing keywords
    const vagueTerms = ['eco-friendly', 'green', 'sustainable', 'natural', 'clean', 'pure', 'responsible']
    const claimLower = claim.claim_text.toLowerCase()
    const foundVague = vagueTerms.filter(t => claimLower.includes(t))
    if (foundVague.length > 2) {
      riskScore += 15
      redFlags.push('Excessive use of vague environmental terms: ' + foundVague.join(', '))
      suggestions.push('Replace vague terms with specific, measurable descriptors')
    }

    // Check claim length (very short claims are suspicious)
    if (claim.claim_text.length < 30) {
      riskScore += 10
      redFlags.push('Claim is unusually brief for a substantive assertion')
      suggestions.push('Expand claim with context, scope, and supporting details')
    }

    // Add small deterministic noise
    riskScore += Math.round(rng() * 5)
    riskScore = Math.min(100, Math.max(0, riskScore))

    let riskLevel: ClaimAssessment['risk_level']
    if (riskScore >= 70) riskLevel = 'critical'
    else if (riskScore >= 50) riskLevel = 'high'
    else if (riskScore >= 30) riskLevel = 'medium'
    else riskLevel = 'low'

    totalRedFlags += redFlags.length

    assessments.push({
      claim_text: claim.claim_text.length > 80 ? claim.claim_text.substring(0, 80) + '...' : claim.claim_text,
      risk_level: riskLevel,
      risk_score: riskScore,
      red_flags: redFlags,
      suggestions
    })
  }

  const overallRiskScore = assessments.length > 0
    ? Math.round(assessments.reduce((s, a) => s + a.risk_score, 0) / assessments.length)
    : 0

  let overallRiskLevel: GreenwashingResult['overall_risk_level']
  if (overallRiskScore >= 60) overallRiskLevel = 'critical'
  else if (overallRiskScore >= 40) overallRiskLevel = 'high'
  else if (overallRiskScore >= 20) overallRiskLevel = 'medium'
  else overallRiskLevel = 'low'

  const recommendations: string[] = []
  const criticalClaims = assessments.filter(a => a.risk_level === 'critical' || a.risk_level === 'high')
  if (criticalClaims.length > 0) {
    recommendations.push('Review and substantiate ' + criticalClaims.length + ' high/critical-risk claim(s) immediately')
  }
  if (totalRedFlags > input.claims.length * 2) {
    recommendations.push('High density of red flags suggests systematic greenwashing risk')
  }
  recommendations.push('Implement a claims review process with legal and sustainability teams')
  recommendations.push('Seek third-party assurance for all public-facing sustainability claims')
  if (!input.esg_report_url) {
    recommendations.push('Publish a comprehensive ESG report to provide context for claims')
  }

  const summary = input.company_name + ' greenwashing risk assessment: ' +
    assessments.length + ' claim(s) evaluated, ' + totalRedFlags + ' red flag(s) identified. ' +
    'Overall risk level: ' + overallRiskLevel.toUpperCase() + ' (' + overallRiskScore + '/100).'

  return {
    overall_risk_score: overallRiskScore,
    overall_risk_level: overallRiskLevel,
    claims_assessed: assessments,
    total_red_flags: totalRedFlags,
    summary,
    recommendations
  }
}

function formatGreenwashingReport(result: GreenwashingResult): string {
  const lines: string[] = []
  lines.push('## Greenwashing Risk Assessment')
  lines.push('')
  lines.push('**Overall Risk Score:** ' + result.overall_risk_score + '/100 | **Risk Level:** ' + result.overall_risk_level.toUpperCase())
  lines.push('**Total Red Flags:** ' + result.total_red_flags)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  if (result.claims_assessed.length > 0) {
    lines.push('### Claim Assessments')
    for (let i = 0; i < result.claims_assessed.length; i++) {
      const a = result.claims_assessed[i]
      lines.push('#### Claim ' + (i + 1) + ' [' + a.risk_level.toUpperCase() + ' RISK - ' + a.risk_score + '/100]')
      lines.push('"' + a.claim_text + '"')
      if (a.red_flags.length > 0) {
        lines.push('**Red Flags:**')
        for (const f of a.red_flags) lines.push('- ' + f)
      }
      if (a.suggestions.length > 0) {
        lines.push('**Suggestions:**')
        for (const s of a.suggestions) lines.push('> ' + s)
      }
      lines.push('')
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push('> ' + r)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: IMPACT MEASUREMENT ENGINE ====================

function measureImpact(input: ImpactInput): ImpactResult {
  const rng = mulberry32(seedFromInput(input))
  const metricResults: ImpactMetricResult[] = []
  const sdgSet = new Set<number>()

  for (const m of input.metrics) {
    let changeFromBaseline = 0
    if (m.baseline_value !== undefined && m.baseline_value !== 0) {
      changeFromBaseline = Math.round(((m.value - m.baseline_value) / Math.abs(m.baseline_value)) * 10000) / 100
    }

    let progressToTarget = 0
    if (m.target_value !== undefined && m.target_value !== 0) {
      progressToTarget = Math.round((m.value / m.target_value) * 10000) / 100
      progressToTarget = Math.min(progressToTarget, 150)
    }

    // Impact rating based on progress and absolute value
    const absValue = Math.abs(m.value)
    let impactRating: ImpactMetricResult['impact_rating']
    if (progressToTarget >= 80 || absValue >= 10000) impactRating = 'transformative'
    else if (progressToTarget >= 50 || absValue >= 1000) impactRating = 'significant'
    else if (progressToTarget >= 20 || absValue >= 100) impactRating = 'moderate'
    else impactRating = 'minimal'

    for (const sdg of m.sdg_alignment) {
      sdgSet.add(sdg)
    }

    metricResults.push({
      metric_name: m.metric_name,
      value: m.value,
      unit: m.unit,
      category: m.category,
      sdg_alignment: m.sdg_alignment,
      change_from_baseline: changeFromBaseline,
      progress_to_target: progressToTarget,
      impact_rating: impactRating
    })
  }

  // Calculate total impact score
  const ratingScores: Record<string, number> = { transformative: 4, significant: 3, moderate: 2, minimal: 1 }
  const totalScore = metricResults.reduce((s, m) => s + (ratingScores[m.impact_rating] ?? 0) * 25, 0)
  const avgScore = metricResults.length > 0 ? totalScore / metricResults.length : 0
  const jitteredScore = Math.min(100, Math.max(0, Math.round(avgScore + (rng() - 0.5) * 5)))

  let impactCategory: ImpactResult['impact_category']
  if (jitteredScore >= 75) impactCategory = 'transformative'
  else if (jitteredScore >= 50) impactCategory = 'significant'
  else if (jitteredScore >= 25) impactCategory = 'moderate'
  else impactCategory = 'minimal'

  const sdgCoverage = Array.from(sdgSet).sort((a, b) => a - b)
  const impactPerBeneficiary = input.beneficiaries > 0
    ? Math.round((jitteredScore / input.beneficiaries) * 100000) / 100000
    : 0

  const recommendations: string[] = []
  const minimalMetrics = metricResults.filter(m => m.impact_rating === 'minimal')
  if (minimalMetrics.length > 0) {
    recommendations.push('Strengthen underperforming metrics: ' + minimalMetrics.map(m => m.metric_name).join(', '))
  }
  if (sdgCoverage.length < 3) {
    recommendations.push('Expand SDG alignment to cover more Sustainable Development Goals')
  }
  if (input.beneficiaries < 100) {
    recommendations.push('Consider scaling to increase beneficiary reach and overall impact')
  }
  const noBaseline = input.metrics.filter(m => m.baseline_value === undefined)
  if (noBaseline.length > 0) {
    recommendations.push('Establish baseline measurements for: ' + noBaseline.map(m => m.metric_name).join(', '))
  }
  recommendations.push('Implement longitudinal tracking to measure impact trends over time')

  return {
    total_impact_score: jitteredScore,
    impact_category: impactCategory,
    metrics: metricResults,
    sdg_coverage: sdgCoverage,
    beneficiaries: input.beneficiaries,
    impact_per_beneficiary: impactPerBeneficiary,
    recommendations
  }
}

function formatImpactReport(result: ImpactResult): string {
  const lines: string[] = []
  lines.push('## Impact Measurement Report')
  lines.push('')
  lines.push('**Total Impact Score:** ' + result.total_impact_score + '/100 | **Category:** ' + result.impact_category.toUpperCase())
  lines.push('**Beneficiaries:** ' + result.beneficiaries.toLocaleString() + ' | **Impact per Beneficiary:** ' + result.impact_per_beneficiary)
  lines.push('**SDG Coverage:** ' + (result.sdg_coverage.length > 0 ? result.sdg_coverage.map(s => 'SDG ' + s).join(', ') : 'None'))
  lines.push('')

  if (result.metrics.length > 0) {
    lines.push('### Metric Details')
    lines.push('| Metric | Value | Change from Baseline | Progress to Target | Rating |')
    lines.push('|--------|-------|---------------------|-------------------|--------|')
    for (const m of result.metrics) {
      const change = m.change_from_baseline !== 0 ? m.change_from_baseline + '%' : 'N/A'
      const progress = m.progress_to_target > 0 ? m.progress_to_target + '%' : 'N/A'
      lines.push('| ' + m.metric_name + ' | ' + m.value + ' ' + m.unit + ' | ' + change + ' | ' + progress + ' | ' + m.impact_rating.toUpperCase() + ' |')
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push('> ' + r)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: STAKEHOLDER ENGAGEMENT TRACKER ====================

function trackStakeholderEngagement(input: StakeholderInput): StakeholderResult {
  const rng = mulberry32(seedFromInput(input))
  const statuses: StakeholderStatus[] = []
  let totalSentiment = 0
  let highPriorityCount = 0
  let neglectedCount = 0

  for (const s of input.stakeholders) {
    // Determine engagement status based on frequency and influence
    const influenceScore = s.influence_level === 'high' ? 3 : s.influence_level === 'medium' ? 2 : 1
    const interestScore = s.interest_level === 'high' ? 3 : s.interest_level === 'medium' ? 2 : 1
    const minFrequency = influenceScore * interestScore

    let engagementStatus: StakeholderStatus['engagement_status']
    if (s.engagement_frequency >= minFrequency * 2) engagementStatus = 'active'
    else if (s.engagement_frequency >= minFrequency) engagementStatus = 'adequate'
    else if (s.engagement_frequency >= minFrequency * 0.5) engagementStatus = 'insufficient'
    else { engagementStatus = 'neglected'; neglectedCount++ }

    // Sentiment trend
    let sentimentTrend: StakeholderStatus['sentiment_trend']
    if (s.sentiment_score >= 70) sentimentTrend = 'improving'
    else if (s.sentiment_score >= 40) sentimentTrend = 'stable'
    else sentimentTrend = 'declining'

    // Priority score
    const priorityScore = Math.min(100, Math.round(
      influenceScore * 25 + interestScore * 20 + (100 - s.sentiment_score) * 0.3 + (engagementStatus === 'neglected' ? 20 : 0)
    ))

    if (priorityScore >= 70) highPriorityCount++

    const actionNeeded: string[] = []
    if (engagementStatus === 'neglected' || engagementStatus === 'insufficient') {
      actionNeeded.push('Increase engagement frequency to at least ' + minFrequency + ' per period')
    }
    if (s.sentiment_score < 40) {
      actionNeeded.push('Address declining sentiment through direct dialogue')
    }
    if (s.key_concerns.length > 3) {
      actionNeeded.push('Prioritize resolving top concerns: ' + s.key_concerns.slice(0, 3).join(', '))
    }
    if (s.engagement_frequency === 0) {
      actionNeeded.push('Establish initial engagement with this stakeholder group')
    }

    totalSentiment += s.sentiment_score

    statuses.push({
      group_type: s.group_type,
      influence_level: s.influence_level,
      interest_level: s.interest_level,
      engagement_status: engagementStatus,
      sentiment_trend: sentimentTrend,
      priority_score: priorityScore,
      concerns: s.key_concerns,
      action_needed: actionNeeded
    })
  }

  const engagementCoverage = input.stakeholders.length > 0
    ? Math.round((input.stakeholders.filter(s => s.engagement_frequency > 0).length / input.stakeholders.length) * 100)
    : 0

  const avgSentiment = input.stakeholders.length > 0
    ? Math.round(totalSentiment / input.stakeholders.length)
    : 0

  const jitter = Math.round((rng() - 0.5) * 3)
  const adjustedAvg = Math.max(0, Math.min(100, avgSentiment + jitter))

  const recommendations: string[] = []
  if (neglectedCount > 0) {
    recommendations.push('Urgently address ' + neglectedCount + ' neglected stakeholder group(s)')
  }
  if (adjustedAvg < 50) {
    recommendations.push('Overall stakeholder sentiment is low; implement systematic feedback mechanisms')
  }
  if (highPriorityCount > 0) {
    recommendations.push('Allocate dedicated resources to ' + highPriorityCount + ' high-priority stakeholder group(s)')
  }
  if (engagementCoverage < 80) {
    recommendations.push('Expand engagement coverage beyond current ' + engagementCoverage + '% of identified stakeholders')
  }
  recommendations.push('Establish regular stakeholder satisfaction surveys with standardized metrics')
  recommendations.push('Create a stakeholder engagement calendar aligned with reporting cycles')

  return {
    stakeholders: statuses.sort((a, b) => b.priority_score - a.priority_score),
    engagement_coverage: engagementCoverage,
    avg_sentiment: adjustedAvg,
    high_priority_count: highPriorityCount,
    neglected_count: neglectedCount,
    recommendations
  }
}

function formatStakeholderReport(result: StakeholderResult): string {
  const lines: string[] = []
  lines.push('## Stakeholder Engagement Tracker')
  lines.push('')
  lines.push('**Engagement Coverage:** ' + result.engagement_coverage + '% | **Avg Sentiment:** ' + result.avg_sentiment + '/100')
  lines.push('**High Priority Groups:** ' + result.high_priority_count + ' | **Neglected Groups:** ' + result.neglected_count)
  lines.push('')

  if (result.stakeholders.length > 0) {
    lines.push('### Stakeholder Status')
    lines.push('| Group | Influence | Interest | Status | Sentiment | Priority |')
    lines.push('|-------|-----------|---------|--------|-----------|----------|')
    for (const s of result.stakeholders) {
      lines.push('| ' + s.group_type + ' | ' + s.influence_level.toUpperCase() + ' | ' + s.interest_level.toUpperCase() + ' | ' + s.engagement_status.toUpperCase() + ' | ' + s.sentiment_trend + ' | ' + s.priority_score + ' |')
    }
    lines.push('')

    // Detail actions needed
    const withActions = result.stakeholders.filter(s => s.action_needed.length > 0)
    if (withActions.length > 0) {
      lines.push('### Action Items')
      for (const s of withActions) {
        lines.push('**' + s.group_type + '** (Priority: ' + s.priority_score + ')')
        for (const a of s.action_needed) lines.push('- ' + a)
        lines.push('')
      }
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push('> ' + r)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: CLIMATE RISK ASSESSOR ====================

function assessClimateRisk(input: ClimateInput): ClimateResult {
  const rng = mulberry32(seedFromInput(input))
  const assessments: RiskAssessment[] = []
  let physicalTotal = 0
  let transitionTotal = 0

  for (const risk of input.risks) {
    const riskScore = Math.round(risk.likelihood * risk.financial_impact)

    let priority: RiskAssessment['priority']
    if (riskScore >= 70) priority = 'critical'
    else if (riskScore >= 40) priority = 'high'
    else if (riskScore >= 20) priority = 'medium'
    else priority = 'low'

    const adaptationStrategies: string[] = []
    if (risk.risk_type === 'physical') {
      adaptationStrategies.push('Implement physical resilience measures for ' + risk.hazard)
      adaptationStrategies.push('Develop business continuity plans for ' + risk.hazard + ' events')
      if (risk.adaptation_cost) {
        adaptationStrategies.push('Budget allocation: $' + risk.adaptation_cost.toLocaleString() + ' for adaptation measures')
      }
      physicalTotal += riskScore
    } else {
      adaptationStrategies.push('Develop transition strategy addressing ' + risk.hazard)
      adaptationStrategies.push('Align business model with ' + input.scenario + ' scenario pathway')
      adaptationStrategies.push('Engage with policy developments on ' + risk.hazard)
      transitionTotal += riskScore
    }

    assessments.push({
      risk_type: risk.risk_type,
      hazard: risk.hazard,
      time_horizon: risk.time_horizon,
      likelihood: risk.likelihood,
      financial_impact: risk.financial_impact,
      risk_score: riskScore,
      priority,
      adaptation_strategies: adaptationStrategies
    })
  }

  const totalRiskExposure = physicalTotal + transitionTotal
  const maxPossible = input.risks.length * 100
  const normalizedExposure = maxPossible > 0 ? Math.round((totalRiskExposure / maxPossible) * 100) : 0

  const jitter = Math.round((rng() - 0.5) * 4)
  const adjustedExposure = Math.max(0, Math.min(100, normalizedExposure + jitter))

  let riskLevel: ClimateResult['risk_level']
  if (adjustedExposure >= 70) riskLevel = 'severe'
  else if (adjustedExposure >= 50) riskLevel = 'high'
  else if (adjustedExposure >= 25) riskLevel = 'moderate'
  else riskLevel = 'low'

  const topRisks = assessments.sort((a, b) => b.risk_score - a.risk_score).slice(0, 5)

  const adaptationRecommendations: string[] = []
  const criticalRisks = assessments.filter(r => r.priority === 'critical')
  if (criticalRisks.length > 0) {
    adaptationRecommendations.push('Immediate action required for ' + criticalRisks.length + ' critical climate risk(s)')
  }
  if (physicalTotal > transitionTotal) {
    adaptationRecommendations.push('Physical risks dominate; prioritize infrastructure resilience investments')
  } else if (transitionTotal > physicalTotal) {
    adaptationRecommendations.push('Transition risks dominate; accelerate decarbonization strategy')
  }
  adaptationRecommendations.push('Conduct scenario analysis for ' + input.scenario + ' pathway regularly')
  adaptationRecommendations.push('Integrate climate risks into enterprise risk management framework')
  if (input.geographic_exposure.length > 3) {
    adaptationRecommendations.push('High geographic diversification of risk; develop region-specific adaptation plans')
  }

  const financialExposure = assessments.reduce((s, r) => s + r.financial_impact * r.likelihood, 0)

  return {
    total_risk_exposure: adjustedExposure,
    physical_risk_score: Math.min(100, physicalTotal),
    transition_risk_score: Math.min(100, transitionTotal),
    risk_level: riskLevel,
    scenario: input.scenario,
    top_risks: topRisks,
    adaptation_recommendations: adaptationRecommendations,
    financial_exposure_estimate: Math.round(financialExposure)
  }
}

function formatClimateReport(result: ClimateResult): string {
  const lines: string[] = []
  lines.push('## Climate Risk Assessment')
  lines.push('')
  lines.push('**Scenario:** ' + result.scenario + ' | **Risk Level:** ' + result.risk_level.toUpperCase())
  lines.push('**Total Risk Exposure:** ' + result.total_risk_exposure + '/100')
  lines.push('**Physical Risk Score:** ' + result.physical_risk_score + ' | **Transition Risk Score:** ' + result.transition_risk_score)
  lines.push('**Estimated Financial Exposure:** $' + result.financial_exposure_estimate.toLocaleString())
  lines.push('')

  if (result.top_risks.length > 0) {
    lines.push('### Top Climate Risks')
    lines.push('| # | Type | Hazard | Horizon | Likelihood | Impact | Score | Priority |')
    lines.push('|---|------|--------|---------|------------|--------|-------|----------|')
    for (let i = 0; i < result.top_risks.length; i++) {
      const r = result.top_risks[i]
      lines.push('| ' + (i + 1) + ' | ' + r.risk_type + ' | ' + r.hazard + ' | ' + r.time_horizon + ' | ' + r.likelihood + ' | ' + r.financial_impact + ' | ' + r.risk_score + ' | ' + r.priority.toUpperCase() + ' |')
    }
    lines.push('')
  }

  if (result.adaptation_recommendations.length > 0) {
    lines.push('### Adaptation Recommendations')
    for (const r of result.adaptation_recommendations) lines.push('> ' + r)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CIRCULAR ECONOMY OPTIMIZER ====================

function optimizeCircularEconomy(input: CircularEconomyInput): CircularEconomyResult {
  const rng = mulberry32(seedFromInput(input))
  const improvements: CircularityImprovement[] = []
  let totalSavings = 0
  let totalCo2Reduction = 0

  // Analyze metrics for improvement opportunities
  for (const metric of input.metrics) {
    const benchmark = metric.benchmark_value
    if (benchmark === undefined) continue

    const gap = benchmark - metric.current_value
    if (gap <= 0) continue

    const potentialImprovement = Math.round((gap / benchmark) * 100)
    const priority: CircularityImprovement['priority'] = potentialImprovement >= 30 ? 'high' : potentialImprovement >= 15 ? 'medium' : 'low'

    const actions: string[] = []
    if (metric.category === 'input') {
      actions.push('Switch to recycled or renewable input materials')
      actions.push('Negotiate take-back agreements with suppliers')
    } else if (metric.category === 'process') {
      actions.push('Optimize production processes to reduce material waste')
      actions.push('Implement lean manufacturing principles')
    } else if (metric.category === 'output') {
      actions.push('Redesign products for durability and repairability')
      actions.push('Establish product-as-a-service models')
    } else {
      actions.push('Improve sorting and recovery infrastructure')
      actions.push('Partner with recycling facilities for closed-loop systems')
    }

    const costSavings = Math.round(gap * 1000 * (1 + rng() * 0.5))
    const co2Reduction = Math.round(gap * 50 * (1 + rng() * 0.3))

    totalSavings += costSavings
    totalCo2Reduction += co2Reduction

    improvements.push({
      area: metric.metric_name,
      current_performance: metric.current_value,
      potential_improvement: potentialImprovement,
      priority,
      estimated_cost_savings: costSavings,
      co2_reduction_potential: co2Reduction,
      actions
    })
  }

  // Analyze products
  for (const product of input.products) {
    if (product.recyclability < 80) {
      const gap = 80 - product.recyclability
      improvements.push({
        area: 'Product recyclability: ' + product.name,
        current_performance: product.recyclability,
        potential_improvement: Math.round((gap / 80) * 100),
        priority: gap >= 30 ? 'high' : gap >= 15 ? 'medium' : 'low',
        estimated_cost_savings: Math.round(gap * 500),
        co2_reduction_potential: Math.round(gap * 20),
        actions: [
          'Redesign ' + product.name + ' for easier disassembly and material recovery',
          'Use mono-materials to improve recyclability',
          'Label materials clearly for consumer sorting'
        ]
      })
    }
    if (product.recycled_content < 50) {
      const gap = 50 - product.recycled_content
      improvements.push({
        area: 'Recycled content: ' + product.name,
        current_performance: product.recycled_content,
        potential_improvement: Math.round((gap / 50) * 100),
        priority: gap >= 25 ? 'high' : gap >= 10 ? 'medium' : 'low',
        estimated_cost_savings: Math.round(gap * 300),
        co2_reduction_potential: Math.round(gap * 30),
        actions: [
          'Source post-consumer recycled materials for ' + product.name,
          'Develop supplier partnerships for recycled feedstock',
          'Set minimum recycled content targets'
        ]
      })
    }
  }

  // Analyze waste streams
  for (const waste of input.waste_streams) {
    if (waste.recovery_rate < 70) {
      const gap = 70 - waste.recovery_rate
      improvements.push({
        area: 'Waste recovery: ' + waste.type,
        current_performance: waste.recovery_rate,
        potential_improvement: Math.round((gap / 70) * 100),
        priority: gap >= 40 ? 'high' : gap >= 20 ? 'medium' : 'low',
        estimated_cost_savings: Math.round(waste.volume_tonnes * gap * 10),
        co2_reduction_potential: Math.round(waste.volume_tonnes * gap * 2),
        actions: [
          'Implement source separation for ' + waste.type + ' waste',
          'Partner with specialized recycling facilities',
          'Explore industrial symbiosis opportunities for ' + waste.type
        ]
      })
    }
  }

  // Calculate overall circularity score
  const metricScores = input.metrics.filter(m => m.benchmark_value !== undefined && m.benchmark_value > 0)
  const avgMetricScore = metricScores.length > 0
    ? metricScores.reduce((s, m) => s + (m.current_value / (m.benchmark_value as number)) * 100, 0) / metricScores.length
    : 50

  const productScores = input.products.length > 0
    ? input.products.reduce((s, p) => s + (p.recyclability + p.recycled_content) / 2, 0) / input.products.length
    : 50

  const wasteScores = input.waste_streams.length > 0
    ? input.waste_streams.reduce((s, w) => s + w.recovery_rate, 0) / input.waste_streams.length
    : 50

  const circularityScore = Math.round((avgMetricScore * 0.4 + productScores * 0.3 + wasteScores * 0.3))
  const jittered = Math.max(0, Math.min(100, circularityScore + Math.round((rng() - 0.5) * 3)))

  let circularityLevel: CircularEconomyResult['circularity_level']
  if (jittered >= 75) circularityLevel = 'advanced'
  else if (jittered >= 50) circularityLevel = 'developing'
  else if (jittered >= 25) circularityLevel = 'basic'
  else circularityLevel = 'linear'

  const recommendations: string[] = []
  const highPriority = improvements.filter(i => i.priority === 'high')
  if (highPriority.length > 0) {
    recommendations.push('Prioritize ' + highPriority.length + ' high-impact circularity improvement(s)')
  }
  recommendations.push('Conduct material flow analysis to identify hidden leakage points')
  recommendations.push('Set science-based targets for circularity metrics')
  recommendations.push('Engage value chain partners in circular economy initiatives')
  if (input.products.some(p => p.lifespan_years < 3)) {
    recommendations.push('Extend product lifespans through modular design and repair services')
  }

  return {
    circularity_score: jittered,
    circularity_level: circularityLevel,
    improvements: improvements.sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 }
      return pOrder[a.priority] - pOrder[b.priority]
    }),
    total_potential_savings: totalSavings,
    total_co2_reduction: totalCo2Reduction,
    recommendations
  }
}

function formatCircularEconomyReport(result: CircularEconomyResult): string {
  const lines: string[] = []
  lines.push('## Circular Economy Optimization Report')
  lines.push('')
  lines.push('**Circularity Score:** ' + result.circularity_score + '/100 | **Level:** ' + result.circularity_level.toUpperCase())
  lines.push('**Total Potential Savings: $' + result.total_potential_savings.toLocaleString() + ' | Total CO2 Reduction Potential: ' + result.total_co2_reduction.toLocaleString() + ' tonnes')
  lines.push('')

  if (result.improvements.length > 0) {
    lines.push('### Improvement Opportunities')
    for (let i = 0; i < result.improvements.length; i++) {
      const imp = result.improvements[i]
      lines.push('#### ' + (i + 1) + '. ' + imp.area + ' [' + imp.priority.toUpperCase() + ']')
      lines.push('Current: ' + imp.current_performance + ' | Potential improvement: ' + imp.potential_improvement + '%')
      lines.push('Est. savings: $' + imp.estimated_cost_savings.toLocaleString() + ' | CO2 reduction: ' + imp.co2_reduction_potential + ' tonnes')
      for (const a of imp.actions) lines.push('- ' + a)
      lines.push('')
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('### Strategic Recommendations')
    for (const r of result.recommendations) lines.push('> ' + r)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: ESG BENCHMARK ANALYZER ====================

function analyzeEsgBenchmark(input: BenchmarkInput): BenchmarkResult {
  const rng = mulberry32(seedFromInput(input))
  const comparisons: MetricComparison[] = []
  const strengths: string[] = []
  const gaps: string[] = []

  for (const metric of input.metrics) {
    const peerValues = input.peers
      .map(p => p.metrics.find(m => m.metric_name === metric.metric_name)?.value)
      .filter((v): v is number => v !== undefined)

    if (peerValues.length === 0) continue

    const peerAvg = peerValues.reduce((s, v) => s + v, 0) / peerValues.length
    const peerBest = metric.higher_is_better ? Math.max(...peerValues) : Math.min(...peerValues)
    const peerWorst = metric.higher_is_better ? Math.min(...peerValues) : Math.max(...peerValues)

    let betterCount = 0
    for (const pv of peerValues) {
      if (metric.higher_is_better) {
        if (metric.company_value >= pv) betterCount++
      } else {
        if (metric.company_value <= pv) betterCount++
      }
    }
    const percentile = Math.round((betterCount / peerValues.length) * 100)

    let status: MetricComparison['status']
    if (percentile >= 80) status = 'leader'
    else if (percentile >= 60) status = 'above_average'
    else if (percentile >= 40) status = 'average'
    else if (percentile >= 20) status = 'below_average'
    else status = 'laggard'

    comparisons.push({
      metric_name: metric.metric_name,
      company_value: metric.company_value,
      peer_average: Math.round(peerAvg * 100) / 100,
      peer_best: peerBest,
      peer_worst: peerWorst,
      percentile,
      status
    })

    if (status === 'leader' || status === 'above_average') {
      strengths.push(metric.metric_name + ' (' + percentile + 'th percentile)')
    } else if (status === 'laggard' || status === 'below_average') {
      gaps.push(metric.metric_name + ' (' + percentile + 'th percentile)')
    }
  }

  const overallPercentile = comparisons.length > 0
    ? Math.round(comparisons.reduce((s, c) => s + c.percentile, 0) / comparisons.length)
    : 0

  const jittered = Math.max(0, Math.min(100, overallPercentile + Math.round((rng() - 0.5) * 3)))

  let category: BenchmarkResult['category']
  if (jittered >= 80) category = 'leader'
  else if (jittered >= 60) category = 'above_average'
  else if (jittered >= 40) category = 'average'
  else if (jittered >= 20) category = 'below_average'
  else category = 'laggard'

  const recommendations: string[] = []
  if (gaps.length > 0) {
    recommendations.push('Address underperforming metrics: ' + gaps.slice(0, 3).map(g => g.split(' (')[0]).join(', '))
  }
  if (jittered < 50) {
    recommendations.push('Overall ESG performance below median; develop comprehensive improvement roadmap')
  }
  const leaders = comparisons.filter(c => c.status === 'leader')
  if (leaders.length > 0) {
    recommendations.push('Leverage leadership in: ' + leaders.map(l => l.metric_name).join(', '))
  }
  recommendations.push('Set targets to reach 75th percentile within 2-3 reporting cycles')
  recommendations.push('Engage with industry working groups to stay ahead of evolving best practices')

  return {
    overall_percentile: jittered,
    category,
    metric_comparisons: comparisons.sort((a, b) => a.percentile - b.percentile),
    industry: input.industry,
    peer_count: input.peers.length,
    strengths,
    gaps,
    recommendations
  }
}

function formatBenchmarkReport(result: BenchmarkResult): string {
  const lines: string[] = []
  lines.push('## ESG Benchmark Analysis vs ' + result.industry)
  lines.push('')
  lines.push('**Overall Percentile:** ' + result.overall_percentile + 'th | **Category:** ' + result.category.replace('_', ' ').toUpperCase())
  lines.push('**Peers Analyzed:** ' + result.peer_count)
  lines.push('')

  if (result.metric_comparisons.length > 0) {
    lines.push('### Metric Comparisons')
    lines.push('| Metric | Company | Peer Avg | Peer Best | Peer Worst | Percentile | Status |')
    lines.push('|--------|---------|----------|-----------|------------|------------|--------|')
    for (const c of result.metric_comparisons) {
      lines.push('| ' + c.metric_name + ' | ' + c.company_value + ' | ' + c.peer_average + ' | ' + c.peer_best + ' | ' + c.peer_worst + ' | ' + c.percentile + 'th | ' + c.status.replace('_', ' ').toUpperCase() + ' |')
    }
    lines.push('')
  }

  if (result.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of result.strengths) lines.push('+ ' + s)
    lines.push('')
  }

  if (result.gaps.length > 0) {
    lines.push('### Gaps')
    for (const g of result.gaps) lines.push('- ' + g)
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push('> ' + r)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: ESG Score Calculator
  tools.register(defineTool({
    name: 'esg_score_calculator',
    description: 'Calculate composite ESG score from weighted environmental, social, and governance dimensions. Returns overall score, rating (AAA-CCC), confidence level, and actionable recommendations.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: company_name (string), industry (string), reporting_period (string), dimensions (array of {category: environmental|social|governance, metric_name: string, value: number, weight: number, benchmark?: number})' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: EsgScoreInput = JSON.parse(args.input)
      const result = calculateEsgScore(data)
      return formatEsgScoreReport(result)
    }
  }))

  // Tool 2: Sustainability Report Generator
  tools.register(defineTool({
    name: 'sustainability_report_generator',
    description: 'Generate GRI, SASB, TCFD, or CDP-aligned sustainability report sections from company data. Includes materiality assessment, disclosure gap analysis, and compliance notes.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: company_name (string), industry (string), reporting_period (string), framework: GRI|SASB|TCFD|CDP|Integrated, metrics (Record<string, number|string>), goals (array of {area, target, deadline, status}), material_topics (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: SustainabilityReportInput = JSON.parse(args.input)
      const result = generateSustainabilityReport(data)
      return formatSustainabilityReport(result)
    }
  }))

  // Tool 3: Greenwashing Detector
  tools.register(defineTool({
    name: 'greenwashing_detector',
    description: 'Analyze sustainability claims for greenwashing risk. Evaluates specificity, evidence, verification, and language patterns. Returns risk scores, red flags, and improvement suggestions per claim.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: company_name (string), industry (string), claims (array of {claim_text: string, claim_type: environmental|social|governance|general, evidence_provided: boolean, third_party_verified: boolean, specificity_score: 0-100, data_references: string[]}), esg_report_url (optional: string)' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: GreenwashingInput = JSON.parse(args.input)
      const result = detectGreenwashing(data)
      return formatGreenwashingReport(result)
    }
  }))

  // Tool 4: Impact Measurement Engine
  tools.register(defineTool({
    name: 'impact_measurement_engine',
    description: 'Quantify social and environmental impact from metrics with SDG alignment. Calculates impact scores, progress to targets, baseline changes, and impact ratings per metric.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: organization_name (string), project_name (string), beneficiaries (number), geographic_scope (string), time_period (string), metrics (array of {metric_name: string, value: number, unit: string, category: environmental|social|governance, sdg_alignment: number[], baseline_value?: number, target_value?: number})' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: ImpactInput = JSON.parse(args.input)
      const result = measureImpact(data)
      return formatImpactReport(result)
    }
  }))

  // Tool 5: Stakeholder Engagement Tracker
  tools.register(defineTool({
    name: 'stakeholder_engagement_tracker',
    description: 'Track and assess stakeholder engagement activities, sentiment, and priority levels. Returns engagement status, sentiment trends, action items, and coverage metrics.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: organization_name (string), reporting_period (string), stakeholders (array of {group_type: string, influence_level: low|medium|high, interest_level: low|medium|high, engagement_frequency: number, last_engagement_date: string, sentiment_score: 0-100, key_concerns: string[]})' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: StakeholderInput = JSON.parse(args.input)
      const result = trackStakeholderEngagement(data)
      return formatStakeholderReport(result)
    }
  }))

  // Tool 6: Climate Risk Assessor
  tools.register(defineTool({
    name: 'climate_risk_assessor',
    description: 'Assess physical and transition climate risks under different warming scenarios. Returns risk scores, priority levels, financial exposure estimates, and adaptation strategies.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: organization_name (string), sector (string), geographic_exposure (string[]), scenario: 1.5C|2C|3C|4C, risks (array of {risk_type: physical|transition, hazard: string, time_horizon: short|medium|long, likelihood: 1-10, financial_impact: 1-10, adaptation_cost?: number})' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: ClimateInput = JSON.parse(args.input)
      const result = assessClimateRisk(data)
      return formatClimateReport(result)
    }
  }))

  // Tool 7: Circular Economy Optimizer
  tools.register(defineTool({
    name: 'circular_economy_optimizer',
    description: 'Identify circular economy improvement opportunities across products, processes, and waste streams. Returns circularity score, improvement priorities, cost savings potential, and CO2 reduction estimates.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: organization_name (string), industry (string), metrics (array of {metric_name: string, current_value: number, unit: string, category: input|process|output|recovery, benchmark_value?: number}), products (array of {name: string, recyclability: 0-100, recycled_content: 0-100, lifespan_years: number}), waste_streams (array of {type: string, volume_tonnes: number, recovery_rate: 0-100})' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: CircularEconomyInput = JSON.parse(args.input)
      const result = optimizeCircularEconomy(data)
      return formatCircularEconomyReport(result)
    }
  }))

  // Tool 8: ESG Benchmark Analyzer
  tools.register(defineTool({
    name: 'esg_benchmark_analyzer',
    description: 'Compare company ESG metrics against industry peers. Returns percentile rankings, competitive positioning, strengths, gaps, and improvement recommendations.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: company_name (string), industry (string), reporting_year (number), metrics (array of {metric_name: string, company_value: number, unit: string, higher_is_better: boolean}), peers (array of {peer_name: string, metrics: array of {metric_name: string, value: number}})' }
    },
    output: { schema: { type: 'string' }, render: (_args: string, value: string) => [{ type: 'text', text: value }] },
    async execute(args: { input: string }) {
      const data: BenchmarkInput = JSON.parse(args.input)
      const result = analyzeEsgBenchmark(data)
      return formatBenchmarkReport(result)
    }
  }))

  console.log('[dsh-tool-sustaintrack] Loaded v' + VERSION + ' - SustainTrack with 8 tools')
  console.log('  Tools: esg_score_calculator, sustainability_report_generator, greenwashing_detector, impact_measurement_engine, stakeholder_engagement_tracker, climate_risk_assessor, circular_economy_optimizer, esg_benchmark_analyzer')
}
