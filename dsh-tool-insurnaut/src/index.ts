/**
 * DSH Insurance Navigator Plugin v0.1.0
 *
 * Claims analysis, underwriting advisor, coverage optimizer, and regulatory
 * compliance toolkit for DeepSeek Harness Agent. Designed for insurance
 * agents, brokers, underwriters, claims adjusters, and compliance officers.
 *
 * Features (v0.1.0):
 * - Claims Analyst (coverage validation and payout estimation)
 * - Underwriting Advisor (risk-based underwriting decisions)
 * - Coverage Optimizer (gap analysis and optimization)
 * - Risk Assessor (composite risk scoring)
 * - Policy Comparator (side-by-side product comparison)
 * - Premium Calculator (rate breakdown and savings)
 * - Fraud Detector (anomaly and network analysis)
 * - Regulatory Compliance (multi-framework gap analysis)
 *
 * @module dsh-tool-insurnaut
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-insurnaut'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM ====================

function createSeededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) & 0x7fffffff
    return (hash & 0x7fffffff) / 0x7fffffff
  }
}

function seededRandom(seed: string, index: number): number {
  return createSeededRandom(`${seed}-${index}`)()
}

// ==================== TYPES ====================

interface ClaimDetail {
  claim_id: string
  policy_number: string
  claim_type: string
  incident_date: string
  reported_date: string
  description: string
  claimed_amount: number
  supporting_documents: string[]
}

interface PolicyTerm {
  policy_number: string
  coverage_type: string
  coverage_limit: number
  deductible: number
  exclusions: string[]
  conditions: string[]
  premium: number
  effective_date: string
  expiration_date: string
}

interface ClaimHistoryRecord {
  claim_id: string
  claim_type: string
  amount: number
  status: string
  date: string
}

interface RiskProfile {
  age: number
  occupation: string
  health_status: string
  lifestyle_factors: string[]
  financial_stability: string
  claims_history_count: number
}

interface UnderwritingGuideline {
  risk_class: string
  max_coverage: number
  base_rate: number
  age_factor: number
  occupation_factor: number
  health_factor: number
}

interface ExistingPolicy {
  policy_id: string
  type: string
  carrier: string
  coverage_amount: number
  premium: number
  deductible: number
  benefits: string[]
  exclusions: string[]
  renewal_date: string
}

interface LifeChange {
  event: string
  date: string
  impact_level: 'low' | 'medium' | 'high'
  description: string
}

interface InsuredObject {
  type: string
  value: number
  age: number
  condition: string
  safety_features: string[]
  usage: string
}

interface PolicyToCompare {
  policy_name: string
  carrier: string
  type: string
  premium: number
  coverage_amount: number
  deductible: number
  benefits: string[]
  exclusions: string[]
  waiting_period_days: number
  renewal_terms: string
  rating: number
}

interface RiskFactor {
  factor: string
  weight: number
  value: string
}

interface Discount {
  name: string
  percentage: number
  description: string
}

interface BehavioralIndicator {
  indicator: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

interface NetworkNode {
  entity_id: string
  entity_type: string
  connection_type: string
  risk_flag: boolean
}

interface RegulatoryFramework {
  name: string
  jurisdiction: string
  requirements: string[]
  penalties: string[]
}

// ==================== HELPER FUNCTIONS ====================

function calculateDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

function getStatusEmoji(status: string): string {
  const map: Record<string, string> = {
    approved: 'APPROVED',
    pending: 'PENDING',
    denied: 'DENIED',
    investigating: 'INVESTIGATING',
    closed: 'CLOSED'
  }
  return map[status.toLowerCase()] ?? status.toUpperCase()
}

function getRiskEmoji(level: string): string {
  const map: Record<string, string> = {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
    critical: 'CRITICAL'
  }
  return map[level.toLowerCase()] ?? level.toUpperCase()
}

// ==================== TOOL 1: CLAIMS ANALYST ====================

interface ClaimsAnalysisResult {
  claim_validity: string
  coverage_assessment: string
  estimated_payout: number
  deductible_applicable: number
  exclusions_triggered: string[]
  conditions_met: string[]
  conditions_failed: string[]
  processing_recommendation: string
  fraud_flags: string[]
  timeline_analysis: string
  document_completeness: number
  next_steps: string[]
  confidence_score: number
}

function analyzeClaim(
  claim: ClaimDetail,
  policy: PolicyTerm,
  history: ClaimHistoryRecord[],
  seed: string
): ClaimsAnalysisResult {
  const exclusionsTriggered: string[] = []
  const conditionsMet: string[] = []
  const conditionsFailed: string[] = []
  const fraudFlags: string[] = []
  const nextSteps: string[] = []

  for (const exclusion of policy.exclusions) {
    if (claim.description.toLowerCase().includes(exclusion.toLowerCase())) {
      exclusionsTriggered.push(exclusion)
    }
  }

  const noticeDays = calculateDaysBetween(claim.incident_date, claim.reported_date)
  if (noticeDays <= 30) {
    conditionsMet.push('Timely notice of claim')
  } else {
    conditionsFailed.push(`Late notice: ${noticeDays} days`)
  }

  if (claim.supporting_documents.length >= 3) {
    conditionsMet.push('Adequate documentation')
  } else {
    conditionsFailed.push(`Insufficient documents: ${claim.supporting_documents.length} provided`)
    nextSteps.push('Request additional supporting documentation')
  }

  const policyAge = calculateDaysBetween(policy.effective_date, claim.incident_date)
  if (policyAge < 30) {
    fraudFlags.push('Claim filed within 30 days of policy inception')
  }

  if (claim.claimed_amount > policy.coverage_limit * 0.9) {
    fraudFlags.push('Claim amount near coverage limit — potential inflation')
  }

  const recentClaims = history.filter(h => {
    const daysDiff = calculateDaysBetween(h.date, claim.incident_date)
    return daysDiff <= 365
  })
  if (recentClaims.length >= 3) {
    fraudFlags.push(`${recentClaims.length} claims in past 12 miles — frequency pattern`)
  }

  let claimValidity = 'VALID'
  let coverageAssessment = 'Coverage confirmed'
  let estimatedPayout = 0

  if (exclusionsTriggered.length > 0) {
    claimValidity = 'QUESTIONABLE'
    coverageAssessment = `Potential exclusion apply: ${exclusionsTriggered.join(', ')}`
    nextSteps.push('Review exclusion applicability with legal')
  }

  if (conditionsFailed.length > exclusionsTriggered.length) {
    claimValidity = 'AT RISK'
    coverageAssessment = 'Coverage may be denied based on unmet conditions'
  }

  const basePayout = Math.min(claim.claimed_amount, policy.coverage_limit)
  const deductibleApplicable = policy.deductible
  estimatedPayout = Math.max(0, basePayout - deductibleApplicable)

  if (exclusionsTriggered.length > 0) {
    estimatedPayout *= 0.5
  }
  if (conditionsFailed.length > 1) {
    estimatedPayout *= 0.7
  }

  const randFactor = 0.85 + seededRandom(seed, 1) * 0.15
  estimatedPayout = Math.round(estimatedPayout * randFactor * 100) / 100

  let processingRecommendation = 'Process claim as filed'
  if (fraudFlags.length >= 2) {
    processingRecommendation = 'Refer to SIU (Special Investigations Unit) for fraud review'
    nextSteps.push('Initiate fraud investigation protocol')
    nextSteps.push('Preserve all evidence and documentation')
  } else if (claim.claimed_amount > 50000) {
    processingRecommendation = 'Senior adjuster review required for high-value claim'
    nextSteps.push('Assign to senior claims adjuster')
  } else if (claimValidity === 'VALID' && fraudFlags.length === 0) {
    processingRecommendation = 'Fast-track processing — low risk claim'
    nextSteps.push('Process for expedited payment')
  }

  const docCompleteness = Math.min(100, Math.round(
    (claim.supporting_documents.length / 5) * 100
  ))

  const confidenceScore = Math.round(
    (conditionsMet.length / Math.max(1, conditionsMet.length + conditionsFailed.length)) * 100
  )

  const timelineAnalysis = noticeDays <= 7
    ? 'Immediate reporting — strong claim credibility'
    : noticeDays <= 30
      ? 'Timely reporting within standard window'
      : noticeDays <= 90
        ? 'Delayed reporting — possible prejudice to insurer'
        : 'Significantly delayed — coverage may be compromised'

  if (nextSteps.length === 0) {
    nextSteps.push('Proceed with standard claims processing')
    nextSteps.push('Issue coverage determination letter')
  }

  return {
    claim_validity: claimValidity,
    coverage_assessment: coverageAssessment,
    estimated_payout: estimatedPayout,
    deductible_applicable: deductibleApplicable,
    exclusions_triggered: exclusionsTriggered,
    conditions_met: conditionsMet,
    conditions_failed: conditionsFailed,
    processing_recommendation: processingRecommendation,
    fraud_flags: fraudFlags,
    timeline_analysis: timelineAnalysis,
    document_completeness: docCompleteness,
    next_steps: nextSteps,
    confidence_score: confidenceScore
  }
}

function formatClaimsReport(claim: ClaimDetail, result: ClaimsAnalysisResult): string {
  const lines: string[] = []
  lines.push('## Claims Analysis Report')
  lines.push('')
  lines.push(`**Claim ID:** ${claim.claim_id}`)
  lines.push(`**Policy:** ${claim.policy_number}`)
  lines.push(`**Type:** ${claim.claim_type}`)
  lines.push(`**Claimed Amount:** $${claim.claimed_amount.toLocaleString()}`)
  lines.push('')
  lines.push('### Validity Assessment')
  lines.push(`**Status:** ${result.claim_validity === 'VALID' ? 'VALID — Claim appears valid' : result.claim_validity === 'QUESTIONABLE' ? 'QUESTIONABLE — Review needed' : 'AT RISK — Potential denial'}`)
  lines.push(`**Confidence Score:** ${result.confidence_score}%`)
  lines.push(`**Coverage Assessment:** ${result.coverage_assessment}`)
  lines.push(`**Timeline Analysis:** ${result.timeline_analysis}`)
  lines.push('')
  lines.push('### Financial Summary')
  lines.push('| Item | Amount |')
  lines.push('|------|--------|')
  lines.push(`| Claimed Amount | $${claim.claimed_amount.toLocaleString()} |`)
  lines.push(`| Deductible | -$${result.deductible_applicable.toLocaleString()} |`)
  lines.push(`| Estimated Payout | $${result.estimated_payout.toLocaleString()} |`)
  lines.push('')

  if (result.exclusions_triggered.length > 0) {
    lines.push('### Exclusions Triggered')
    for (const ex of result.exclusions_triggered) {
      lines.push(`- ${ex}`)
    }
    lines.push('')
  }

  lines.push('### Conditions Assessment')
  lines.push('| Condition | Status |')
  lines.push('|-----------|--------|')
  for (const c of result.conditions_met) {
    lines.push(`| ${c} | MET |`)
  }
  for (const c of result.conditions_failed) {
    lines.push(`| ${c} | NOT MET |`)
  }
  lines.push('')

  if (result.fraud_flags.length > 0) {
    lines.push('### Fraud Indicators')
    for (const f of result.fraud_flags) {
      lines.push(`- ${f}`)
    }
    lines.push('')
  }

  lines.push(`**Document Completeness:** ${result.document_completeness}%`)
  lines.push('')
  lines.push('### Processing Recommendation')
  lines.push(result.processing_recommendation)
  lines.push('')
  lines.push('### Next Steps')
  for (const step of result.next_steps) {
    lines.push(`- ${step}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 2: UNDERWRITING ADVISOR ====================

interface UnderwritingResult {
  decision: string
  risk_score: number
  risk_class: string
  recommended_coverage: number
  suggested_premium: number
  rate_factors: Array<{ factor: string; impact: string; adjustment: number }>
  conditions: string[]
  exclusions_recommended: string[]
  special_endorsements: string[]
  justification: string
  alternative_options: string[]
}

function adviseUnderwriting(
  profile: RiskProfile,
  coverageRequested: { type: string; amount: number; term_years: number },
  guidelines: UnderwritingGuideline,
  seed: string
): UnderwritingResult {
  const rateFactors: UnderwritingResult['rate_factors'] = []
  const conditions: string[] = []
  const exclusionsRecommended: string[] = []
  const specialEndorsements: string[] = []

  let riskScore = 0

  if (profile.age < 25) {
    riskScore += 20
    rateFactors.push({ factor: 'Age < 25', impact: 'Increase', adjustment: 1.25 })
  } else if (profile.age > 65) {
    riskScore += 25
    rateFactors.push({ factor: 'Age > 65', impact: 'Increase', adjustment: 1.30 })
  } else if (profile.age >= 25 && profile.age <= 45) {
    riskScore += 5
    rateFactors.push({ factor: 'Age 25-45', impact: 'Decrease', adjustment: 0.90 })
  } else {
    riskScore += 10
    rateFactors.push({ factor: 'Age 46-65', impact: 'Neutral', adjustment: 1.0 })
  }

  const highRiskOccupations = ['construction', 'mining', 'offshore', 'pilot']
  const lowRiskOccupations = ['office', 'teacher', 'accountant', 'software']
  const occLower = profile.occupation.toLowerCase()

  if (highRiskOccupations.some(o => occLower.includes(o))) {
    riskScore += 30
    rateFactors.push({ factor: `Occupation: ${profile.occupation}`, impact: 'Increase', adjustment: 1.40 })
    conditions.push('Safety training certification required')
  } else if (lowRiskOccupations.some(o => occLower.includes(o))) {
    riskScore += 5
    rateFactors.push({ factor: `Occupation: ${profile.occupation}`, impact: 'Decrease', adjustment: 0.85 })
  } else {
    riskScore += 15
    rateFactors.push({ factor: `Occupation: ${profile.occupation}`, impact: 'Neutral', adjustment: 1.0 })
  }

  if (profile.health_status === 'excellent') {
    riskScore += 0
    rateFactors.push({ factor: 'Health: Excellent', impact: 'Decrease', adjustment: 0.80 })
  } else if (profile.health_status === 'good') {
    riskScore += 10
    rateFactors.push({ factor: 'Health: Good', impact: 'Neutral', adjustment: 1.0 })
  } else if (profile.health_status === 'fair') {
    riskScore += 25
    rateFactors.push({ factor: 'Health: Fair', impact: 'Increase', adjustment: 1.30 })
    conditions.push('Medical examination required')
  } else {
    riskScore += 40
    rateFactors.push({ factor: 'Health: Poor', impact: 'Increase', adjustment: 1.60 })
    exclusionsRecommended.push('Pre-existing conditions exclusion')
    conditions.push('Full medical underwriting required')
  }

  for (const lf of profile.lifestyle_factors) {
    const lfLower = lf.toLowerCase()
    if (lfLower.includes('smok') || lfLower.includes('tobacco')) {
      riskScore += 30
      rateFactors.push({ factor: 'Tobacco use', impact: 'Increase', adjustment: 1.50 })
    }
    if (lfLower.includes('hazard') || lfLower.includes('extreme')) {
      riskScore += 20
      rateFactors.push({ factor: `Hazardous activity: ${lf}`, impact: 'Increase', adjustment: 1.25 })
    }
    if (lfLower.includes('exercise') || lfLower.includes('active')) {
      riskScore -= 5
      rateFactors.push({ factor: 'Active lifestyle', impact: 'Decrease', adjustment: 0.90 })
    }
  }

  if (profile.claims_history_count > 2) {
    riskScore += profile.claims_history_count * 10
    rateFactors.push({ factor: `Claims history: ${profile.claims_history_count} prior claims`, impact: 'Increase', adjustment: 1.0 + profile.claims_history_count * 0.1 })
    conditions.push('Claims history review required')
  } else if (profile.claims_history_count === 0) {
    riskScore -= 5
    rateFactors.push({ factor: 'No prior claims', impact: 'Decrease', adjustment: 0.88 })
  }

  const randFactor = 0.95 + seededRandom(seed, 2) * 0.10
  riskScore = Math.round(riskScore * randFactor)

  let riskClass: string
  let decision: string

  if (riskScore <= 25) {
    riskClass = 'Preferred'
    decision = 'APPROVE — Preferred risk'
  } else if (riskScore <= 50) {
    riskClass = 'Standard'
    decision = 'APPROVE — Standard risk'
  } else if (riskScore <= 75) {
    riskClass = 'Substandard'
    decision = 'APPROVE WITH CONDITIONS — Substandard risk'
  } else if (riskScore <= 100) {
    riskClass = 'High Risk'
    decision = 'DECLINE or REFER — High risk'
  } else {
    riskClass = 'Declined'
    decision = 'DECLINE — Excessive risk'
  }

  const baseRate = guidelines.base_rate || 0.02
  const compositeAdjustment = rateFactors.reduce((prod, rf) => prod * rf.adjustment, 1.0)
  const suggestedPremium = Math.round(coverageRequested.amount * baseRate * compositeAdjustment * 100) / 100

  const recommendedCoverage = coverageRequested.amount > guidelines.max_coverage
    ? guidelines.max_coverage
    : coverageRequested.amount

  if (recommendedCoverage < coverageRequested.amount) {
    specialEndorsements.push(`Coverage limited to $${recommendedCoverage.toLocaleString()} — within max capacity`)
  }

  const justification = `Risk score ${riskScore}/100 places applicant in "${riskClass}" class. ` +
    `Composite rate adjustment: ${compositeAdjustment.toFixed(2)}. ` +
    `Base rate ${(baseRate * 100).toFixed(1)}% applied to recommended coverage amount.`

  const alternativeOptions: string[] = []
  if (decision.includes('DECLINE')) {
    alternativeOptions.push('Consider reduced coverage amount with higher deductible')
    alternativeOptions.push('Explore surplus lines market for high-risk profiles')
    alternativeOptions.push('Re-qualify after risk improvement measures')
  } else if (decision.includes('CONDITIONS')) {
    alternativeOptions.push('Accept conditions at modified premium')
    alternativeOptions.push('Reduce coverage amount for standard approval')
    alternativeOptions.push('Provide additional medical/financial documentation')
  } else {
    alternativeOptions.push('Lock in preferred rates with multi-policy discount')
    alternativeOptions.push('Consider higher deductible for premium savings')
  }

  return {
    decision,
    risk_score: riskScore,
    risk_class: riskClass,
    recommended_coverage: recommendedCoverage,
    suggested_premium: suggestedPremium,
    rate_factors: rateFactors,
    conditions,
    exclusions_recommended: exclusionsRecommended,
    special_endorsements: specialEndorsements,
    justification,
    alternative_options: alternativeOptions
  }
}

function formatUnderwritingReport(result: UnderwritingResult): string {
  const lines: string[] = []
  lines.push('## Underwriting Decision Report')
  lines.push('')
  lines.push(`**Decision:** ${result.decision}`)
  lines.push(`**Risk Score:** ${result.risk_score}/100`)
  lines.push(`**Risk Class:** ${result.risk_class}`)
  lines.push('')
  lines.push('### Recommended Terms')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push(`| Recommended Coverage | $${result.recommended_coverage.toLocaleString()} |`)
  lines.push(`| Suggested Premium | $${result.suggested_premium.toLocaleString()} |`)
  lines.push('')

  lines.push('### Rate Factors')
  lines.push('| Factor | Impact | Adjustment |')
  lines.push('|--------|--------|------------|')
  for (const rf of result.rate_factors) {
    lines.push(`| ${rf.factor} | ${rf.impact} | x${rf.adjustment.toFixed(2)} |`)
  }
  lines.push('')

  if (result.conditions.length > 0) {
    lines.push('### Conditions')
    for (const c of result.conditions) {
      lines.push(`- ${c}`)
    }
    lines.push('')
  }

  if (result.exclusions_recommended.length > 0) {
    lines.push('### Recommended Exclusions')
    for (const e of result.exclusions_recommended) {
      lines.push(`- ${e}`)
    }
    lines.push('')
  }

  if (result.special_endorsements.length > 0) {
    lines.push('### Special Endorsements')
    for (const se of result.special_endorsements) {
      lines.push(`- ${se}`)
    }
    lines.push('')
  }

  lines.push('### Justification')
  lines.push(result.justification)
  lines.push('')

  if (result.alternative_options.length > 0) {
    lines.push('### Alternative Options')
    for (const alt of result.alternative_options) {
      lines.push(`- ${alt}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: COVERAGE OPTIMIZER ====================

interface CoverageGap {
  area: string
  current_coverage: number
  recommended_coverage: number
  gap_amount: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  annual_cost_estimate: number
}

interface OptimizationResult {
  gaps: CoverageGap[]
  overlaps: Array<{ policies: string[]; overlap_area: string; duplicate_amount: number }>
  total_current_premium: number
  total_recommended_premium: number
  potential_savings: number
  total_additional_cost: number
  net_impact: number
  optimization_actions: string[]
  risk_exposure_score: number
  coverage_completeness: number
}

function optimizeCoverage(
  policies: ExistingPolicy[],
  lifeChanges: LifeChange[],
  budget: { current_monthly: number; max_monthly: number; flexibility: string },
  seed: string
): OptimizationResult {
  const gaps: CoverageGap[] = []
  const overlaps: OptimizationResult['overlaps'] = []
  const optimizationActions: string[] = []

  const totalCurrentPremium = policies.reduce((s, p) => s + p.premium, 0)

  const policyTypes = new Map<string, ExistingPolicy[]>()
  for (const p of policies) {
    if (!policyTypes.has(p.type)) policyTypes.set(p.type, [])
    policyTypes.get(p.type)!.push(p)
  }

  for (const [type, group] of policyTypes) {
    if (group.length > 1) {
      const totalCoverage = group.reduce((s, p) => s + p.coverage_amount, 0)
      const maxCoverage = Math.max(...group.map(p => p.coverage_amount))
      overlaps.push({
        policies: group.map(p => p.policy_id),
        overlap_area: type,
        duplicate_amount: totalCoverage - maxCoverage
      })
      optimizationActions.push(`Consolidate ${group.length} ${type} policies to eliminate duplicate coverage`)
    }
  }

  const hasLife = policies.some(p => p.type.toLowerCase().includes('life'))
  const hasHealth = policies.some(p => p.type.toLowerCase().includes('health') || p.type.toLowerCase().includes('medical'))
  const hasDisability = policies.some(p => p.type.toLowerCase().includes('disability'))
  const hasAuto = policies.some(p => p.type.toLowerCase().includes('auto') || p.type.toLowerCase().includes('vehicle'))
  const hasHome = policies.some(p => p.type.toLowerCase().includes('home') || p.type.toLowerCase().includes('property'))
  const hasUmbrella = policies.some(p => p.type.toLowerCase().includes('umbrella') || p.type.toLowerCase().includes('liability'))

  for (const change of lifeChanges) {
    const clLower = change.event.toLowerCase()
    if (clLower.includes('baby') || clLower.includes('child') || clLower.includes('newborn')) {
      if (!hasLife) {
        gaps.push({
          area: 'Life Insurance',
          current_coverage: 0,
          recommended_coverage: 500000,
          gap_amount: 500000,
          priority: 'critical',
          annual_cost_estimate: 1200
        })
        optimizationActions.push('Add term life insurance — new dependent requires protection')
      }
      if (!hasDisability) {
        gaps.push({
          area: 'Disability Insurance',
          current_coverage: 0,
          recommended_coverage: 300000,
          gap_amount: 300000,
          priority: 'high',
          annual_cost_estimate: 1800
        })
        optimizationActions.push('Add disability income insurance for income protection')
      }
    }
    if (clLower.includes('marriage') || clLower.includes('married') || clLower.includes('spouse')) {
      gaps.push({
        area: 'Spousal Coverage',
        current_coverage: 0,
        recommended_coverage: 250000,
        gap_amount: 250000,
        priority: 'high',
        annual_cost_estimate: 800
      })
      optimizationActions.push('Add spousal life coverage and review beneficiary designations')
    }
    if (clLower.includes('home') || clLower.includes('house') || clLower.includes('mortgage')) {
      if (!hasHome) {
        gaps.push({
          area: 'Homeowners Insurance',
          current_coverage: 0,
          recommended_coverage: 400000,
          gap_amount: 400000,
          priority: 'critical',
          annual_cost_estimate: 2400
        })
        optimizationActions.push('Secure homeowners insurance before closing')
      }
      gaps.push({
        area: 'Umbrella Liability',
        current_coverage: hasUmbrella ? 1000000 : 0,
        recommended_coverage: 2000000,
        gap_amount: hasUmbrella ? 1000000 : 2000000,
        priority: 'medium',
        annual_cost_estimate: 600
      })
    }
    if (clLower.includes('business') || clLower.includes('self-employ') || clLower.includes('startup')) {
      gaps.push({
        area: 'Business Liability',
        current_coverage: 0,
        recommended_coverage: 1000000,
        gap_amount: 1000000,
        priority: 'high',
        annual_cost_estimate: 3000
      })
      optimizationActions.push('Add professional liability / business insurance')
    }
  }

  if (!hasHealth) {
    gaps.push({
      area: 'Health Insurance',
      current_coverage: 0,
      recommended_coverage: 1000000,
      gap_amount: 1000000,
      priority: 'critical',
      annual_cost_estimate: 6000
    })
    optimizationActions.push('Obtain health insurance — unprotected medical exposure')
  }

  if (!hasAuto) {
    gaps.push({
      area: 'Auto Insurance',
      current_coverage: 0,
      recommended_coverage: 300000,
      gap_amount: 300000,
      priority: 'high',
      annual_cost_estimate: 2400
    })
    optimizationActions.push('Secure auto insurance — legal requirement in most states')
  }

  if (!hasUmbrella && policies.length >= 2) {
    gaps.push({
      area: 'Umbrella Liability',
      current_coverage: 0,
      recommended_coverage: 1000000,
      gap_amount: 1000000,
      priority: 'medium',
      annual_cost_estimate: 400
    })
    optimizationActions.push('Consider umbrella policy — growing asset base needs excess protection')
  }

  if (budget.flexibility === 'low' && gaps.length > 2) {
    const criticalGaps = gaps.filter(g => g.priority === 'critical')
    const otherGaps = gaps.filter(g => g.priority !== 'critical')
    optimizationActions.push(`Budget constraint: Prioritize ${criticalGaps.length} critical gap(s), defer ${otherGaps.length} non-critical gap(s)`)
  }

  const totalAdditionalCost = gaps.reduce((s, g) => s + g.annual_cost_estimate, 0)
  const overlapSavings = overlaps.reduce((s, o) => s + o.duplicate_amount * 0.005, 0)
  const potentialSavings = Math.round(overlapSavings * 100) / 100
  const totalRecommendedPremium = Math.round((totalCurrentPremium + totalAdditionalCost - potentialSavings) * 100) / 100

  const maxMonthly = budget.max_monthly
  const maxAnnual = maxMonthly * 12
  const netImpact = Math.round((totalRecommendedPremium - totalCurrentPremium) * 100) / 100

  if (totalRecommendedPremium > maxAnnual) {
    optimizationActions.push(`WARNING: Recommended premium exceeds budget by $${(totalRecommendedPremium - maxAnnual).toLocaleString()}/year`)
    optimizationActions.push('Consider increasing deductibles or reducing optional coverages to fit budget')
  }

  const totalRecommendedCoverage = policies.reduce((s, p) => s + p.coverage_amount, 0) +
    gaps.reduce((s, g) => s + g.recommended_coverage, 0)
  const totalGap = gaps.reduce((s, g) => s + g.gap_amount, 0)
  const coverageCompleteness = totalRecommendedCoverage > 0
    ? Math.round(((totalRecommendedCoverage - totalGap) / totalRecommendedCoverage) * 100)
    : 0

  const criticalGaps = gaps.filter(g => g.priority === 'critical').length
  const highGaps = gaps.filter(g => g.priority === 'high').length
  const riskExposureScore = Math.min(100, criticalGaps * 25 + highGaps * 15 + (hasLife ? 0 : 10) + (hasHealth ? 0 : 15))

  return {
    gaps,
    overlaps,
    total_current_premium: Math.round(totalCurrentPremium * 100) / 100,
    total_recommended_premium: totalRecommendedPremium,
    potential_savings: potentialSavings,
    total_additional_cost: totalAdditionalCost,
    net_impact: netImpact,
    optimization_actions: optimizationActions,
    risk_exposure_score: riskExposureScore,
    coverage_completeness: Math.min(100, coverageCompleteness)
  }
}

function formatCoverageReport(result: OptimizationResult): string {
  const lines: string[] = []
  lines.push('## Coverage Optimization Report')
  lines.push('')
  lines.push('### Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Current Premium | $${result.total_current_premium.toLocaleString()}/yr |`)
  lines.push(`| Recommended Premium | $${result.total_recommended_premium.toLocaleString()}/yr |`)
  lines.push(`| Net Impact | $${result.net_impact >= 0 ? '+' : ''}${result.net_impact.toLocaleString()}/yr |`)
  lines.push(`| Potential Savings | $${result.potential_savings.toLocaleString()}/yr |`)
  lines.push(`| Risk Exposure Score | ${result.risk_exposure_score}/100 |`)
  lines.push(`| Coverage Completeness | ${result.coverage_completeness}% |`)
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Coverage Gaps')
    lines.push('| Area | Current | Recommended | Gap | Priority | Est. Annual Cost |')
    lines.push('|------|---------|-------------|-----|----------|------------------|')
    for (const g of result.gaps) {
      lines.push(`| ${g.area} | $${g.current_coverage.toLocaleString()} | $${g.recommended_coverage.toLocaleString()} | $${g.gap_amount.toLocaleString()} | ${getRiskEmoji(g.priority)} | $${g.annual_cost_estimate.toLocaleString()} |`)
    }
    lines.push('')
  }

  if (result.overlaps.length > 0) {
    lines.push('### Coverage Overlaps')
    for (const o of result.overlaps) {
      lines.push(`- **${o.overlap_area}**: Policies ${o.policies.join(', ')} — duplicate coverage $${o.duplicate_amount.toLocaleString()}`)
    }
    lines.push('')
  }

  lines.push('### Optimization Actions')
  for (const action of result.optimization_actions) {
    lines.push(`- ${action}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: RISK ASSESSOR ====================

interface RiskAssessorResult {
  overall_risk_score: number
  risk_grade: string
  risk_factors: Array<{ factor: string; score: number; weight: number; weighted_score: number }>
  rate_multiplier: number
  key_risk_drivers: string[]
  mitigating_factors: string[]
  recommendations: string[]
  premium_impact: string
  loss_probability: number
}

function assessRisk(
  insuredObject: InsuredObject,
  location: string,
  coverageType: string,
  seed: string
): RiskAssessorResult {
  const riskFactors: RiskAssessorResult['risk_factors'] = []
  const keyRiskDrivers: string[] = []
  const mitigatingFactors: string[] = []
  const recommendations: string[] = []

  let ageScore = 0
  if (insuredObject.age <= 2) ageScore = 10
  else if (insuredObject.age <= 5) ageScore = 20
  else if (insuredObject.age <= 10) ageScore = 35
  else if (insuredObject.age <= 20) ageScore = 50
  else ageScore = 70
  riskFactors.push({ factor: 'Age/Condition', score: ageScore, weight: 1.2, weighted_score: ageScore * 1.2 })

  if (ageScore > 40) keyRiskDrivers.push(`Older age (${insuredObject.age} years) increases failure probability`)
  else mitigatingFactors.push('Relatively new — lower baseline risk')

  let conditionScore = 0
  switch (insuredObject.condition.toLowerCase()) {
    case 'excellent': conditionScore = 5; break
    case 'good': conditionScore = 20; break
    case 'fair': conditionScore = 50; break
    case 'poor': conditionScore = 80; break
    default: conditionScore = 35
  }
  riskFactors.push({ factor: 'Physical Condition', score: conditionScore, weight: 1.5, weighted_score: conditionScore * 1.5 })

  if (conditionScore > 50) keyRiskDrivers.push('Poor physical condition elevates claim likelihood')
  else if (conditionScore < 15) mitigatingFactors.push('Excellent physical condition reduces risk')

  let safetyScore = Math.max(0, 50 - insuredObject.safety_features.length * 10)
  riskFactors.push({ factor: 'Safety Features', score: safetyScore, weight: 0.8, weighted_score: safetyScore * 0.8 })

  if (insuredObject.safety_features.length === 0) {
    keyRiskDrivers.push('No protective safety features identified')
    recommendations.push('Install recommended safety features for risk reduction')
  } else {
    mitigatingFactors.push(`${insuredObject.safety_features.length} safety features present`)
  }

  let usageScore = 0
  const usageLower = insuredObject.usage.toLowerCase()
  if (usageLower.includes('low') || usageLower.includes('minimal')) usageScore = 10
  else if (usageLower.includes('moderate') || usageLower.includes('normal')) usageScore = 30
  else if (usageLower.includes('high') || usageLower.includes('heavy')) usageScore = 60
  else if (usageLower.includes('commercial') || usageLower.includes('industrial')) usageScore = 75
  else usageScore = 35
  riskFactors.push({ factor: 'Usage Intensity', score: usageScore, weight: 1.0, weighted_score: usageScore * 1.0 })

  if (usageScore > 50) keyRiskDrivers.push('High-usage intensity accelerates wear and failure risk')

  let locationScore = 30
  const locLower = location.toLowerCase()
  if (locLower.includes('flood') || locLower.includes('coast') || locLower.includes('hurricane')) {
    locationScore = 70
    keyRiskDrivers.push('Location in natural disaster-prone area')
    recommendations.push('Review flood/natural disaster coverage adequacy')
  } else if (locLower.includes('urban') || locLower.includes('city')) {
    locationScore = 45
    keyRiskDrivers.push('Urban location — higher theft/vandalism exposure')
  } else if (locLower.includes('rural') || locLower.includes('country')) {
    locationScore = 25
    mitigatingFactors.push('Rural location — lower crime exposure')
  }
  riskFactors.push({ factor: 'Location Risk', score: locationScore, weight: 1.3, weighted_score: locationScore * 1.3 })

  let coverageScore = 20
  const covLower = coverageType.toLowerCase()
  if (covLower.includes('comprehensive') || covLower.includes('all-risk')) coverageScore = 40
  else if (covLower.includes('named') || covLower.includes('specified')) coverageScore = 25
  else if (covLower.includes('liability') || covLower.includes('third-party')) coverageScore = 30
  riskFactors.push({ factor: 'Coverage Scope', score: coverageScore, weight: 0.7, weighted_score: coverageScore * 0.7 })

  let valueScore = 0
  if (insuredObject.value < 10000) valueScore = 10
  else if (insuredObject.value < 50000) valueScore = 25
  else if (insuredObject.value < 200000) valueScore = 40
  else if (insuredObject.value < 1000000) valueScore = 55
  else valueScore = 70
  riskFactors.push({ factor: 'Asset Value', score: valueScore, weight: 0.9, weighted_score: valueScore * 0.9 })

  if (valueScore > 50) keyRiskDrivers.push('High-value asset — significant exposure per claim')

  const totalWeighted = riskFactors.reduce((s, rf) => s + rf.weighted_score, 0)
  const totalWeight = riskFactors.reduce((s, rf) => s + rf.weight, 0)
  const randFactor = 0.92 + seededRandom(seed, 3) * 0.16
  const overallRiskScore = Math.round((totalWeighted / totalWeight) * randFactor)

  let riskGrade: string
  if (overallRiskScore <= 20) riskGrade = 'A+'
  else if (overallRiskScore <= 30) riskGrade = 'A'
  else if (overallRiskScore <= 40) riskGrade = 'B+'
  else if (overallRiskScore <= 50) riskGrade = 'B'
  else if (overallRiskScore <= 60) riskGrade = 'C'
  else if (overallRiskScore <= 75) riskGrade = 'D'
  else riskGrade = 'F'

  const rateMultiplier = Math.round((1.0 + (overallRiskScore / 100) * 2) * 100) / 100
  const lossProbability = Math.round((overallRiskScore / 100) * 15 * 100) / 100

  let premiumImpact: string
  if (rateMultiplier <= 1.3) premiumImpact = 'Favorable — below-average rates apply'
  else if (rateMultiplier <= 1.8) premiumImpact = 'Standard — market-rate pricing'
  else if (rateMultiplier <= 2.2) premiumImpact = 'Elevated — above-average rates apply'
  else premiumImpact = 'High — surcharged rates, consider risk mitigation first'

  if (recommendations.length === 0) {
    recommendations.push('Maintain current risk management practices')
    if (insuredObject.safety_features.length < 3) {
      recommendations.push('Consider additional safety improvements for premium reduction')
    }
  }

  return {
    overall_risk_score: overallRiskScore,
    risk_grade: riskGrade,
    rate_multiplier: rateMultiplier,
    key_risk_drivers: keyRiskDrivers,
    mitigating_factors: mitigatingFactors,
    recommendations,
    premium_impact: premiumImpact,
    loss_probability: lossProbability,
    risk_factors: riskFactors
  }
}

function formatRiskReport(insuredObject: InsuredObject, location: string, result: RiskAssessorResult): string {
  const lines: string[] = []
  lines.push('## Risk Assessment Report')
  lines.push('')
  lines.push(`**Asset Type:** ${insuredObject.type}`)
  lines.push(`**Location:** ${location}`)
  lines.push(`**Asset Value:** $${insuredObject.value.toLocaleString()}`)
  lines.push('')
  lines.push('### Overall Risk')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Risk Score | ${result.overall_risk_score}/100 |`)
  lines.push(`| Risk Grade | ${result.risk_grade} |`)
  lines.push(`| Rate Multiplier | x${result.rate_multiplier} |`)
  lines.push(`| Loss Probability | ${result.loss_probability}%/yr |`)
  lines.push(`| Premium Impact | ${result.premium_impact} |`)
  lines.push('')

  lines.push('### Risk Factor Breakdown')
  lines.push('| Factor | Score | Weight | Weighted Score |')
  lines.push('|--------|-------|--------|----------------|')
  for (const rf of result.risk_factors) {
    lines.push(`| ${rf.factor} | ${rf.score} | x${rf.weight} | ${rf.weighted_score.toFixed(1)} |`)
  }
  lines.push('')

  if (result.key_risk_drivers.length > 0) {
    lines.push('### Key Risk Drivers')
    for (const d of result.key_risk_drivers) {
      lines.push(`- ${d}`)
    }
    lines.push('')
  }

  if (result.mitigating_factors.length > 0) {
    lines.push('### Mitigating Factors')
    for (const m of result.mitigating_factors) {
      lines.push(`- ${m}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: POLICY COMPARATOR ====================

interface ComparisonMatrix {
  criteria: string[]
  policies: Array<{ name: string; scores: Record<string, number>; total_score: number }>
  winner: string
  summary: string
}

interface ComparatorResult {
  matrix: ComparisonMatrix
  cost_benefit: Array<{ policy: string; premium: number; benefit_score: number; value_ratio: number }>
  coverage_comparison: Array<{ benefit: string; availability: Record<string, boolean> }>
  recommendation: string
  detailed_notes: string[]
}

function comparePolicies(
  policies: PolicyToCompare[],
  comparisonCriteria: string[],
  seed: string
): ComparatorResult {
  if (policies.length === 0) {
    return {
      matrix: { criteria: [], policies: [], winner: 'N/A', summary: 'No policies to compare' },
      cost_benefit: [],
      coverage_comparison: [],
      recommendation: 'No policies provided for comparison',
      detailed_notes: []
    }
  }

  const defaultCriteria = ['premium', 'coverage', 'deductible', 'benefits', 'flexibility', 'carrier_rating']
  const criteria = comparisonCriteria.length > 0 ? comparisonCriteria : defaultCriteria

  const scored = policies.map(p => {
    const scores: Record<string, number> = {}

    scores['premium'] = Math.max(0, 100 - (p.premium / 100))

    scores['coverage'] = Math.min(100, (p.coverage_amount / 100000) * 10)

    scores['deductible'] = Math.max(0, 100 - (p.deductible / 50))

    scores['benefits'] = Math.min(100, p.benefits.length * 15)

    scores['flexibility'] = p.waiting_period_days <= 30 ? 80 : p.waiting_period_days <= 90 ? 60 : 40
    if (p.renewal_terms.toLowerCase().includes('guaranteed')) scores['flexibility'] += 15

    scores['carrier_rating'] = p.rating * 20

    const totalScore = criteria.reduce((s, c) => s + (scores[c.toLowerCase()] ?? 0), 0) / criteria.length

    return { name: p.policy_name, scores, total_score: Math.round(totalScore * 10) / 10 }
  })

  const winner = scored.reduce((best, current) =>
    current.total_score > best.total_score ? current : best
  )

  const costBenefit = policies.map((p, i) => ({
    policy: p.policy_name,
    premium: p.premium,
    benefit_score: scored[i].total_score,
    value_ratio: Math.round((scored[i].total_score / Math.max(1, p.premium)) * 1000 * 100) / 100
  }))

  const allBenefits = [...new Set(policies.flatMap(p => p.benefits))]
  const coverageComparison = allBenefits.map(benefit => {
    const availability: Record<string, boolean> = {}
    for (const p of policies) {
      availability[p.policy_name] = p.benefits.some(b => b.toLowerCase() === benefit.toLowerCase())
    }
    return { benefit, availability }
  })

  const bestValue = costBenefit.reduce((best, current) =>
    current.value_ratio > best.value_ratio ? current : best
  )
  const bestCoverage = scored.reduce((best, current) =>
    (current.scores['coverage'] ?? 0) > (best.scores['coverage'] ?? 0) ? current : best
  )

  const recommendation = `Best Overall: "${winner.name}" (Score: ${winner.total_score}). ` +
    `Best Value: "${bestValue.policy}" (Value Ratio: ${bestValue.value_ratio}). ` +
    `Best Coverage: "${bestCoverage.name}" (Coverage Score: ${bestCoverage.scores['coverage']?.toFixed(0)}).`

  const detailedNotes: string[] = []
  detailedNotes.push(`Compared ${policies.length} policies across ${criteria.length} criteria`)
  for (const p of policies) {
    const uniqueBenefits = p.benefits.filter(b =>
      policies.filter(op => op.policy_name !== p.policy_name)
        .every(op => !op.benefits.some(ob => ob.toLowerCase() === b.toLowerCase()))
    )
    if (uniqueBenefits.length > 0) {
      detailedNotes.push(`"${p.policy_name}" unique benefits: ${uniqueBenefits.join(', ')}`)
    }
  }

  const lowestPremium = policies.reduce((min, p) => p.premium < min.premium ? p : min)
  detailedNotes.push(`Lowest premium: "${lowestPremium.policy_name}" at $${lowestPremium.premium.toLocaleString()}/yr`)

  return {
    matrix: { criteria, policies: scored, winner: winner.name, summary: recommendation },
    cost_benefit: costBenefit,
    coverage_comparison: coverageComparison,
    recommendation,
    detailed_notes: detailedNotes
  }
}

function formatComparatorReport(result: ComparatorResult): string {
  const lines: string[] = []
  lines.push('## Policy Comparison Report')
  lines.push('')
  lines.push('### Comparison Matrix')
  lines.push('| Policy | ' + result.matrix.criteria.join(' | ') + ' | Total |')
  lines.push('|--------|' + result.matrix.criteria.map(() => '---').join('|') + '|-------|')
  for (const p of result.matrix.policies) {
    const criteriaScores = result.matrix.criteria.map(c => (p.scores[c.toLowerCase()] ?? 0).toFixed(0))
    lines.push(`| ${p.name} | ${criteriaScores.join(' | ')} | **${p.total_score.toFixed(1)}** |`)
  }
  lines.push('')

  lines.push('### Cost vs. Benefit')
  lines.push('| Policy | Premium | Benefit Score | Value Ratio |')
  lines.push('|--------|---------|---------------|-------------|')
  for (const cb of result.cost_benefit) {
    lines.push(`| ${cb.policy} | $${cb.premium.toLocaleString()} | ${cb.benefit_score.toFixed(1)} | ${cb.value_ratio} |`)
  }
  lines.push('')

  if (result.coverage_comparison.length > 0) {
    lines.push('### Coverage Comparison')
    const policyNames = result.matrix.policies.map(p => p.name)
    lines.push('| Benefit | ' + policyNames.join(' | ') + ' |')
    lines.push('|---------|' + policyNames.map(() => '---').join('|') + '|')
    for (const cc of result.coverage_comparison) {
      const marks = policyNames.map(p => cc.availability[p] ? 'YES' : 'NO')
      lines.push(`| ${cc.benefit} | ${marks.join(' | ')} |`)
    }
    lines.push('')
  }

  lines.push('### Recommendation')
  lines.push(result.recommendation)
  lines.push('')

  if (result.detailed_notes.length > 0) {
    lines.push('### Notes')
    for (const n of result.detailed_notes) {
      lines.push(`- ${n}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: PREMIUM CALCULATOR ====================

interface PremiumBreakdown {
  base_premium: number
  risk_adjustments: Array<{ factor: string; amount: number; percentage: number }>
  discount_breakdown: Array<{ name: string; amount: number; percentage: number }>
  total_discounts: number
  total_risk_adjustments: number
  final_premium: number
  monthly_premium: number
  annual_savings: number
  savings_opportunities: string[]
}

function calculatePremium(
  coverageAmount: number,
  deductible: number,
  riskFactors: RiskFactor[],
  discounts: Discount[],
  seed: string
): PremiumBreakdown {
  const baseRate = 0.015
  const basePremium = Math.round(coverageAmount * baseRate * 100) / 100

  const riskAdjustments: PremiumBreakdown['risk_adjustments'] = []
  let totalRiskAdjustments = 0

  for (const rf of riskFactors) {
    const adjustment = Math.round(basePremium * rf.weight * 0.1 * 100) / 100
    riskAdjustments.push({
      factor: rf.factor,
      amount: adjustment,
      percentage: Math.round(rf.weight * 10 * 100) / 100
    })
    totalRiskAdjustments += adjustment
  }

  let deductibleSavings = 0
  if (deductible >= 5000) deductibleSavings = basePremium * 0.25
  else if (deductible >= 2500) deductibleSavings = basePremium * 0.15
  else if (deductible >= 1000) deductibleSavings = basePremium * 0.08
  else deductibleSavings = 0

  const deductibleAdjustment = -Math.round(deductibleSavings * 100) / 100
  riskAdjustments.push({
    factor: `Deductible: $${deductible.toLocaleString()}`,
    amount: deductibleAdjustment,
    percentage: Math.round((deductibleAdjustment / basePremium) * 100 * 100) / 100
  })
  totalRiskAdjustments += deductibleAdjustment

  const discountBreakdown: PremiumBreakdown['discount_breakdown'] = []
  let totalDiscounts = 0

  for (const d of discounts) {
    const premiumAfterRisk = basePremium + totalRiskAdjustments
    const discountAmount = Math.round(premiumAfterRisk * (d.percentage / 100) * 100) / 100
    discountBreakdown.push({
      name: d.name,
      amount: discountAmount,
      percentage: d.percentage
    })
    totalDiscounts += discountAmount
  }

  const randFactor = 0.97 + seededRandom(seed, 4) * 0.06
  const finalPremium = Math.round((basePremium + totalRiskAdjustments - totalDiscounts) * randFactor * 100) / 100
  const monthlyPremium = Math.round((finalPremium / 12) * 100) / 100

  const noDiscountPremium = Math.round((basePremium + totalRiskAdjustments) * randFactor * 100) / 100
  const annualSavings = Math.round((noDiscountPremium - finalPremium) * 100) / 100

  const savingsOpportunities: string[] = []
  if (deductible < 2500) {
    const additionalSavings = Math.round(basePremium * 0.10 * 100) / 100
    savingsOpportunities.push(`Increase deductible to $2,500 — save ~$${additionalSavings.toLocaleString()}/yr`)
  }
  if (discounts.length < 3) {
    savingsOpportunities.push('Bundle policies for additional multi-line discounts (typically 10-15%)')
  }
  if (!discounts.some(d => d.name.toLowerCase().includes('loyalty') || d.name.toLowerCase().includes('tenure'))) {
    savingsOpportunities.push('Loyalty/tenure discount may be available — inquire with carrier')
  }
  savingsOpportunities.push('Annual payment avoids monthly processing fees (save 2-3%)')
  if (coverageAmount > 500000) {
    savingsOpportunities.push('High-value coverage may qualify for tiered pricing — request negotiation')
  }

  return {
    base_premium: basePremium,
    risk_adjustments: riskAdjustments,
    discount_breakdown: discountBreakdown,
    total_discounts: Math.round(totalDiscounts * 100) / 100,
    total_risk_adjustments: Math.round(totalRiskAdjustments * 100) / 100,
    final_premium: finalPremium,
    monthly_premium: monthlyPremium,
    annual_savings: annualSavings,
    savings_opportunities: savingsOpportunities
  }
}

function formatPremiumReport(
  coverageAmount: number,
  deductible: number,
  result: PremiumBreakdown
): string {
  const lines: string[] = []
  lines.push('## Premium Calculation Report')
  lines.push('')
  lines.push(`**Coverage Amount:** $${coverageAmount.toLocaleString()}`)
  lines.push(`**Deductible:** $${deductible.toLocaleString()}`)
  lines.push('')
  lines.push('### Premium Breakdown')
  lines.push('| Component | Amount |')
  lines.push('|-----------|--------|')
  lines.push(`| Base Premium | $${result.base_premium.toLocaleString()} |`)
  lines.push(`| Risk Adjustments | +$${result.total_risk_adjustments.toLocaleString()} |`)
  lines.push(`| Discounts | -$${result.total_discounts.toLocaleString()} |`)
  lines.push(`| **Final Premium** | **$${result.final_premium.toLocaleString()}** |`)
  lines.push(`| Monthly Payment | $${result.monthly_premium.toLocaleString()} |`)
  lines.push('')

  if (result.risk_adjustments.length > 0) {
    lines.push('### Risk Adjustments')
    lines.push('| Factor | Impact | % Change |')
    lines.push('|--------|--------|----------|')
    for (const ra of result.risk_adjustments) {
      lines.push(`| ${ra.factor} | $${ra.amount.toLocaleString()} | ${ra.percentage >= 0 ? '+' : ''}${ra.percentage}% |`)
    }
    lines.push('')
  }

  if (result.discount_breakdown.length > 0) {
    lines.push('### Discounts Applied')
    lines.push('| Discount | Savings | % Off |')
    lines.push('|----------|---------|-------|')
    for (const d of result.discount_breakdown) {
      lines.push(`| ${d.name} | $${d.amount.toLocaleString()} | -${d.percentage}% |`)
    }
    lines.push('')
  }

  lines.push('### Savings Summary')
  lines.push(`**Annual Savings from Discounts:** $${result.annual_savings.toLocaleString()}`)
  lines.push('')
  lines.push('### Savings Opportunities')
  for (const s of result.savings_opportunities) {
    lines.push(`- ${s}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: FRAUD DETECTOR ====================

interface FraudAnalysisResult {
  fraud_score: number
  risk_level: string
  red_flags: Array<{ flag: string; severity: string; weight: number }>
  behavioral_concerns: string[]
  network_risks: string[]
  claim_consistency: string
  investigation_priority: string
  recommended_actions: string[]
  automated_decision: string
  similar_pattern_match: boolean
}

function detectFraud(
  claimData: { claim_id: string; amount: number; type: string; frequency: number; timing_pattern: string },
  behavioralIndicators: BehavioralIndicator[],
  networkData: NetworkNode[],
  seed: string
): FraudAnalysisResult {
  const redFlags: FraudAnalysisResult['red_flags'] = []
  const behavioralConcerns: string[] = []
  const networkRisks: string[] = []
  const recommendedActions: string[] = []

  let fraudScore = 0

  if (claimData.amount > 100000) {
    fraudScore += 20
    redFlags.push({ flag: 'High-value claim (>$100K)', severity: 'high', weight: 20 })
  } else if (claimData.amount > 50000) {
    fraudScore += 10
    redFlags.push({ flag: 'Elevated claim value (>$50K)', severity: 'medium', weight: 10 })
  }

  if (claimData.frequency >= 5) {
    fraudScore += 25
    redFlags.push({ flag: `Excessive frequency: ${claimData.frequency} claims`, severity: 'critical', weight: 25 })
  } else if (claimData.frequency >= 3) {
    fraudScore += 15
    redFlags.push({ flag: `Elevated frequency: ${claimData.frequency} claims`, severity: 'high', weight: 15 })
  }

  const timingLower = claimData.timing_pattern.toLowerCase()
  if (timingLower.includes('near') && timingLower.includes('expir')) {
    fraudScore += 20
    redFlags.push({ flag: 'Claim near policy expiration', severity: 'high', weight: 20 })
  }
  if (timingLower.includes('immediate') || timingLower.includes('day after')) {
    fraudScore += 18
    redFlags.push({ flag: 'Claim filed immediately after inception', severity: 'high', weight: 18 })
  }

  for (const bi of behavioralIndicators) {
    const biLower = bi.indicator.toLowerCase()
    if (biLower.includes('inconsistent') || biLower.includes('contradict')) {
      fraudScore += 15
      behavioralConcerns.push(`Inconsistent statements: ${bi.description}`)
    }
    if (biLower.includes('unwilling') || biLower.includes('refuse') || biLower.includes('evasive')) {
      fraudScore += 12
      behavioralConcerns.push(`Cooperation issue: ${bi.description}`)
    }
    if (biLower.includes('financial') && biLower.includes('stress')) {
      fraudScore += 10
      behavioralConcerns.push(`Financial motivation: ${bi.description}`)
    }
    if (bi.severity === 'critical') fraudScore += 15
    else if (bi.severity === 'high') fraudScore += 10
    else if (bi.severity === 'medium') fraudScore += 5
  }

  const flaggedNodes = networkData.filter(n => n.risk_flag)
  if (flaggedNodes.length > 0) {
    fraudScore += flaggedNodes.length * 8
    for (const node of flaggedNodes) {
      networkRisks.push(`Connected ${node.entity_type} "${node.entity_id}" — ${node.connection_type} — FLAGGED`)
    }
  }

  const providerConnections = networkData.filter(n =>
    n.entity_type === 'provider' && n.connection_type === 'repeated'
  )
  if (providerConnections.length >= 3) {
    fraudScore += 10
    networkRisks.push('Multiple repeated provider connections — potential provider fraud ring')
  }

  const randFactor = 0.90 + seededRandom(seed, 5) * 0.20
  fraudScore = Math.round(fraudScore * randFactor)
  fraudScore = Math.min(100, Math.max(0, fraudScore))

  let riskLevel: string
  let automatedDecision: string
  let investigationPriority: string

  if (fraudScore >= 70) {
    riskLevel = 'CRITICAL'
    automatedDecision = 'DENY — Refer to law enforcement'
    investigationPriority = 'IMMEDIATE'
    recommendedActions.push('Refer to SIU immediately')
    recommendedActions.push('Preserve all evidence and documentation')
    recommendedActions.push('Notify fraud investigation unit')
    recommendedActions.push('Consider law enforcement referral')
  } else if (fraudScore >= 50) {
    riskLevel = 'HIGH'
    automatedDecision = 'HOLD — Enhanced investigation required'
    investigationPriority = 'URGENT'
    recommendedActions.push('Assign to Special Investigations Unit')
    recommendedActions.push('Conduct detailed statement analysis')
    recommendedActions.push('Verify all documentation authenticity')
    recommendedActions.push('Social media and public records investigation')
  } else if (fraudScore >= 30) {
    riskLevel = 'MODERATE'
    automatedDecision = 'PROCEED WITH CAUTION — Additional verification'
    investigationPriority = 'STANDARD+'
    recommendedActions.push('Enhanced documentation review')
    recommendedActions.push('Verify claimant identity and history')
    recommendedActions.push('Cross-reference with industry fraud databases')
  } else if (fraudScore >= 15) {
    riskLevel = 'LOW'
    automatedDecision = 'PROCESS — Standard monitoring'
    investigationPriority = 'ROUTINE'
    recommendedActions.push('Standard claims processing')
    recommendedActions.push('Flag for routine audit sampling')
  } else {
    riskLevel = 'MINIMAL'
    automatedDecision = 'FAST-TRACK — Low fraud risk'
    investigationPriority = 'LOW'
    recommendedActions.push('Fast-track processing')
  }

  const claimConsistency = fraudScore > 40
    ? 'Significant inconsistencies detected — claim narrative requires verification'
    : fraudScore > 20
      ? 'Minor inconsistencies — recommend standard verification'
      : 'Claim details appear consistent and credible'

  const similarPatternMatch = fraudScore >= 35 && (claimData.frequency >= 3 || flaggedNodes.length >= 2)

  return {
    fraud_score: fraudScore,
    risk_level: riskLevel,
    red_flags: redFlags,
    behavioral_concerns: behavioralConcerns,
    network_risks: networkRisks,
    claim_consistency: claimConsistency,
    investigation_priority: investigationPriority,
    recommended_actions: recommendedActions,
    automated_decision: automatedDecision,
    similar_pattern_match: similarPatternMatch
  }
}

function formatFraudReport(claimData: { claim_id: string; amount: number }, result: FraudAnalysisResult): string {
  const lines: string[] = []
  lines.push('## Fraud Detection Report')
  lines.push('')
  lines.push(`**Claim ID:** ${claimData.claim_id}`)
  lines.push(`**Claim Amount:** $${claimData.amount.toLocaleString()}`)
  lines.push('')
  lines.push('### Risk Assessment')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Fraud Score | ${result.fraud_score}/100 |`)
  lines.push(`| Risk Level | ${result.risk_level} |`)
  lines.push(`| Investigation Priority | ${result.investigation_priority} |`)
  lines.push(`| Similar Pattern Match | ${result.similar_pattern_match ? 'YES — FLAG' : 'No match'} |`)
  lines.push('')

  if (result.red_flags.length > 0) {
    lines.push('### Red_flags')
    lines.push('| Flag | Severity | Weight |')
    lines.push('|------|----------|--------|')
    for (const rf of result.red_flags) {
      lines.push(`| ${rf.flag} | ${rf.severity.toUpperCase()} | +${rf.weight} |`)
    }
    lines.push('')
  }

  if (result.behavioral_concerns.length > 0) {
    lines.push('### Behavioral Concerns')
    for (const bc of result.behavioral_concerns) {
      lines.push(`- ${bc}`)
    }
    lines.push('')
  }

  if (result.network_risks.length > 0) {
    lines.push('### Network Risks')
    for (const nr of result.network_risks) {
      lines.push(`- ${nr}`)
    }
    lines.push('')
  }

  lines.push('### Claim Consistency')
  lines.push(result.claim_consistency)
  lines.push('')

  lines.push('### Automated Decision')
  lines.push(`**${result.automated_decision}**`)
  lines.push('')

  lines.push('### Recommended Actions')
  for (const a of result.recommended_actions) {
    lines.push(`- ${a}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: REGULATORY COMPLIANCE ====================

interface ComplianceGap {
  requirement: string
  framework: string
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable'
  evidence: string
  remediation: string
  deadline: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ComplianceResult {
  overall_compliance_score: number
  compliance_grade: string
  status_by_framework: Array<{ framework: string; score: number; status: string }>
  gaps: ComplianceGap[]
  remediation_plan: Array<{ action: string; priority: string; owner: string; timeline: string; cost_estimate: string }>
  penalties_avoided: number
  next_review_date: string
  immediate_actions: string[]
}

function checkCompliance(
  operations: { areas: string[]; current_practices: string[]; staff_count: number; annual_premium_volume: number },
  frameworks: RegulatoryFramework[],
  seed: string
): ComplianceResult {
  const gaps: ComplianceGap[] = []
  const remediationPlan: ComplianceResult['remediation_plan'] = []
  const immediateActions: string[] = []

  for (const fw of frameworks) {
    for (const req of fw.requirements) {
      const reqLower = req.toLowerCase()
      const isCovered = operations.current_practices.some(p =>
        p.toLowerCase().includes(reqLower.split(' ')[0].toLowerCase()) ||
        reqLower.includes(p.toLowerCase().split(' ')[0])
      )

      let status: ComplianceGap['status']
      let severity: ComplianceGap['severity']
      let remediation: string
      let deadline: string

      if (isCovered) {
        status = 'compliant'
        severity = 'low'
        remediation = 'No action required'
        deadline = 'N/A'
        gaps.push({
          requirement: req,
          framework: fw.name,
          status,
          evidence: 'Current practice documented',
          remediation,
          deadline,
          severity
        })
        continue
      }

      if (reqLower.includes('reporting') || reqLower.includes('disclosure') || reqLower.includes('notification')) {
        status = 'non_compliant'
        severity = 'high'
        remediation = `Implement ${req.toLowerCase()} workflow with documented procedures`
        deadline = '30 days'
        immediateActions.push(`URGENT: ${req} under ${fw.name} — ${fw.penalties?.[0] ?? 'Potential penalties apply'}`)
      } else if (reqLower.includes('capital') || reqLower.includes('reserve') || reqLower.includes('solvency')) {
        status = 'non_compliant'
        severity = 'critical'
        remediation = `Conduct ${req.toLowerCase()} assessment and establish monitoring`
        deadline = '14 days'
        immediateActions.push(`CRITICAL: ${req} under ${fw.name} — regulatory capital at risk`)
      } else if (reqLower.includes('training') || reqLower.includes('certification') || reqLower.includes('continuing')) {
        status = 'partial'
        severity = 'medium'
        remediation = `Schedule ${req.toLowerCase()} for all relevant staff`
        deadline = '90 days'
      } else if (reqLower.includes('audit') || reqLower.includes('review') || reqLower.includes('assessment')) {
        status = 'partial'
        severity = 'medium'
        remediation = `Establish ${req.toLowerCase()} schedule and assign responsibility`
        deadline = '60 days'
      } else if (reqLower.includes('privacy') || reqLower.includes('data') || reqLower.includes('consent')) {
        status = 'partial'
        severity = 'high'
        remediation = `Review and update ${req.toLowerCase()} procedures`
        deadline = '45 days'
      } else {
        status = 'non_compliant'
        severity = 'medium'
        remediation = `Develop and implement ${req.toLowerCase()} procedures`
        deadline = '90 days'
      }

      gaps.push({
        requirement: req,
        framework: fw.name,
        status,
        evidence: 'No documented practice found',
        remediation,
        deadline,
        severity
      })

      if (severity === 'critical' || severity === 'high') {
        remediationPlan.push({
          action: remediation,
          priority: severity.toUpperCase(),
          owner: 'Compliance Officer',
          timeline: deadline,
          cost_estimate: severity === 'critical' ? '$10,000-$50,000' : '$2,000-$10,000'
        })
      }
    }
  }

  const compliantCount = gaps.filter(g => g.status === 'compliant').length
  const totalApplicable = gaps.filter(g => g.status !== 'not_applicable').length
  const randFactor = 0.95 + seededRandom(seed, 6) * 0.10
  const overallScore = totalApplicable > 0
    ? Math.round((compliantCount / totalApplicable) * 100 * randFactor)
    : 100

  let complianceGrade: string
  if (overallScore >= 95) complianceGrade = 'A'
  else if (overallScore >= 85) complianceGrade = 'B'
  else if (overallScore >= 70) complianceGrade = 'C'
  else if (overallScore >= 55) complianceGrade = 'D'
  else complianceGrade = 'F'

  const statusByFramework = frameworks.map(fw => {
    const fwGaps = gaps.filter(g => g.framework === fw.name)
    const fwCompliant = fwGaps.filter(g => g.status === 'compliant').length
    const fwScore = fwGaps.length > 0 ? Math.round((fwCompliant / fwGaps.length) * 100) : 100
    return {
      framework: fw.name,
      score: fwScore,
      status: fwScore >= 90 ? 'Compliant' : fwScore >= 70 ? 'Partially Compliant' : 'Non-Compliant'
    }
  })

  const criticalGaps = gaps.filter(g => g.severity === 'critical').length
  const highGaps = gaps.filter(g => g.severity === 'high').length
  const penaltiesAvoided = criticalGaps * 50000 + highGaps * 15000

  for (const gap of gaps.filter(g => g.severity === 'critical' || g.severity === 'high').slice(0, 5)) {
    if (!remediationPlan.some(r => r.action === gap.remediation)) {
      remediationPlan.push({
        action: gap.remediation,
        priority: gap.severity.toUpperCase(),
        owner: 'Compliance Officer',
        timeline: gap.deadline,
        cost_estimate: gap.severity === 'critical' ? '$10,000-$50,000' : '$2,000-$10,000'
      })
    }
  }

  const today = new Date()
  const nextReview = new Date(today.setMonth(today.getMonth() + 3))
  const nextReviewDate = nextReview.toISOString().split('T')[0]

  return {
    overall_compliance_score: Math.min(100, overallScore),
    compliance_grade: complianceGrade,
    status_by_framework: statusByFramework,
    gaps,
    remediation_plan: remediationPlan,
    penalties_avoided: penaltiesAvoided,
    next_review_date: nextReviewDate,
    immediate_actions: immediateActions
  }
}

function formatComplianceReport(result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Compliance Report')
  lines.push('')
  lines.push('### Compliance Overview')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Overall Score | ${result.overall_compliance_score}% |`)
  lines.push(`| Grade | ${result.compliance_grade} |`)
  lines.push(`| Next Review | ${result.next_review_date} |`)
  lines.push(`| Penalties Avoided | $${result.penalties_avoided.toLocaleString()} |`)
  lines.push('')

  lines.push('### Status by Framework')
  lines.push('| Framework | Score | Status |')
  lines.push('|-----------|-------|--------|')
  for (const sf of result.status_by_framework) {
    lines.push(`| ${sf.framework} | ${sf.score}% | ${sf.status} |`)
  }
  lines.push('')

  const nonCompliantGaps = result.gaps.filter(g => g.status === 'non_compliant' || g.status === 'partial')
  if (nonCompliantGaps.length > 0) {
    lines.push('### Compliance Gaps')
    lines.push('| Requirement | Framework | Status | Severity | Deadline |')
    lines.push('|-------------|-----------|--------|----------|----------|')
    for (const g of nonCompliantGaps) {
      lines.push(`| ${g.requirement} | ${g.framework} | ${g.status === 'non_compliant' ? 'NON-COMPLIANT' : 'PARTIAL'} | ${getRiskEmoji(g.severity)} | ${g.deadline} |`)
    }
    lines.push('')
  }

  if (result.immediate_actions.length > 0) {
    lines.push('### Immediate Actions Required')
    for (const a of result.immediate_actions) {
      lines.push(`- ${a}`)
    }
    lines.push('')
  }

  if (result.remediation_plan.length > 0) {
    lines.push('### Remediation Plan')
    lines.push('| Action | Priority | Owner | Timeline | Cost Estimate |')
    lines.push('|--------|----------|-------|----------|---------------|')
    for (const r of result.remediation_plan) {
      lines.push(`| ${r.action} | ${r.priority} | ${r.owner} | ${r.timeline} | ${r.cost_estimate} |`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Claims Analyst
  tools.register(defineTool({
    name: 'claims_analyst',
    description: 'Analyze insurance claims for coverage validity, estimated payout, and fraud indicators. Validates claim against policy terms, checks exclusions, and provides processing recommendations.',
    parameters: {
      claim_details: { type: 'string', required: true, description: 'JSON object with fields: claim_id, policy_number, claim_type, incident_date (YYYY-MM-DD), reported_date (YYYY-MM-DD), description, claimed_amount (number), supporting_documents (string[])' },
      policy_terms: { type: 'string', required: true, description: 'JSON object with fields: policy_number, coverage_type, coverage_limit, deductible, exclusions (string[]), conditions (string[]), premium, effective_date (YYYY-MM-DD), expiration_date (YYYY-MM-DD)' },
      claim_history: { type: 'string', required: true, description: 'JSON array of claim history records with fields: claim_id, claim_type, amount, status, date (YYYY-MM-DD)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { claim_details: string; policy_terms: string; claim_history: string }) {
      const claim: ClaimDetail = JSON.parse(args.claim_details)
      const policy: PolicyTerm = JSON.parse(args.policy_terms)
      const history: ClaimHistoryRecord[] = JSON.parse(args.claim_history)
      const result = analyzeClaim(claim, policy, history, claim.claim_id)
      return formatClaimsReport(claim, result)
    }
  }))

  // Tool 2: Underwriting Advisor
  tools.register(defineTool({
    name: 'underwriting_advisor',
    description: 'Provide underwriting decisions and rate recommendations based on risk profiles. Evaluates applicant risk factors, applies underwriting guidelines, and suggests policy terms.',
    parameters: {
      risk_profile: { type: 'string', required: true, description: 'JSON object with fields: age, occupation, health_status (excellent/good/fair/poor), lifestyle_factors (string[]), financial_stability, claims_history_count (number)' },
      coverage_requested: { type: 'string', required: true, description: 'JSON object with fields: type, amount (number), term_years (number)' },
      underwriting_guidelines: { type: 'string', required: true, description: 'JSON object with fields: risk_class, max_coverage (number), base_rate (decimal), age_factor, occupation_factor, health_factor' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_profile: string; coverage_requested: string; underwriting_guidelines: string }) {
      const profile: RiskProfile = JSON.parse(args.risk_profile)
      const coverage = JSON.parse(args.coverage_requested)
      const guidelines: UnderwritingGuideline = JSON.parse(args.underwriting_guidelines)
      const result = adviseUnderwriting(profile, coverage, guidelines, profile.occupation)
      return formatUnderwritingReport(result)
    }
  }))

  // Tool 3: Coverage Optimizer
  tools.register(defineTool({
    name: 'coverage_optimizer',
    description: 'Analyze existing insurance coverage and identify gaps based on life changes and预算. Recommends optimization actions, identifies overlaps, and calculates financial impact.',
    parameters: {
      existing_policies: { type: 'string', required: true, description: 'JSON array of existing policies with fields: policy_id, type, carrier, coverage_amount, premium, deductible, benefits (string[]), exclusions (string[]), renewal_date (YYYY-MM-DD)' },
      life_changes: { type: 'string', required: true, description: 'JSON array of life events with fields: event, date (YYYY-MM-DD), impact_level (low/medium/high), description' },
      budget: { type: 'string', required: true, description: 'JSON object with fields: current_monthly (number), max_monthly (number), flexibility (low/medium/high)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { existing_policies: string; life_changes: string; budget: string }) {
      const policies: ExistingPolicy[] = JSON.parse(args.existing_policies)
      const changes: LifeChange[] = JSON.parse(args.life_changes)
      const budget = JSON.parse(args.budget)
      const result = optimizeCoverage(policies, changes, budget, policies.map(p => p.policy_id).join('-'))
      return formatCoverageReport(result)
    }
  }))

  // Tool 4: Risk Assessor
  tools.register(defineTool({
    name: 'risk_assessor',
    description: 'Assess composite risk for insured objects. Produces risk scores, grades, rate multipliers, and loss probability based on asset characteristics, location, and usage.',
    parameters: {
      insured_object: { type: 'string', required: true, description: 'JSON object with fields: type, value (number), age (number), condition (excellent/good/fair/poor), safety_features (string[]), usage' },
      location: { type: 'string', required: true, description: 'Location description of the insured object' },
      coverage_type: { type: 'string', required: true, description: 'Type of coverage being applied for (e.g., "comprehensive", "named perils", "liability only")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { insured_object: string; location: string; coverage_type: string }) {
      const obj: InsuredObject = JSON.parse(args.insured_object)
      const location = args.location
      const coverageType = args.coverage_type
      const result = assessRisk(obj, location, coverageType, obj.type)
      return formatRiskReport(obj, location, result)
    }
  }))

  // Tool 5: Policy Comparator
  tools.register(defineTool({
    name: 'policy_comparator',
    description: 'Compare multiple insurance policies side-by-side. Generates comparison matrix, cost-benefit analysis, and identifies the best overall, best value, and best coverage options.',
    parameters: {
      policies_to_compare: { type: 'string', required: true, description: 'JSON array of policies with fields: policy_name, carrier, type, premium, coverage_amount, deductible, benefits (string[]), exclusions (string[]), waiting_period_days (number), renewal_terms, rating (1-5)' },
      comparison_criteria: { type: 'string', description: 'JSON array of criteria strings to compare on (e.g., ["premium", "coverage", "benefits"]). Defaults to standard criteria if not provided.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { policies_to_compare: string; comparison_criteria: string }) {
      const policies: PolicyToCompare[] = JSON.parse(args.policies_to_compare)
      const criteria: string[] = args.comparison_criteria ? JSON.parse(args.comparison_criteria) : []
      const result = comparePolicies(policies, criteria, policies.map(p => p.policy_name).join('-'))
      return formatComparatorReport(result)
    }
  }))

  // Tool 6: Premium Calculator
  tools.register(defineTool({
    name: 'premium_calculator',
    description: 'Calculate insurance premium with detailed breakdown. Applies base rates, risk factor adjustments, and discounts. Provides savings opportunities and monthly payment estimates.',
    parameters: {
      coverage_amount: { type: 'string', required: true, description: 'Total coverage amount as a string number (e.g., "500000")' },
      deductible: { type: 'string', required: true, description: 'Deductible amount as a string number (e.g., "2500")' },
      risk_factors: { type: 'string', required: true, description: 'JSON array of risk factors with fields: factor (string), weight (0-1), value (string)' },
      discounts: { type: 'string', required: true, description: 'JSON array of discounts with fields: name, percentage (number), description' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { coverage_amount: string; deductible: string; risk_factors: string; discounts: string }) {
      const coverageAmount = parseFloat(args.coverage_amount)
      const deductible = parseFloat(args.deductible)
      const factors: RiskFactor[] = JSON.parse(args.risk_factors)
      const discs: Discount[] = JSON.parse(args.discounts)
      const result = calculatePremium(coverageAmount, deductible, factors, discs, `${coverageAmount}-${deductible}`)
      return formatPremiumReport(coverageAmount, deductible, result)
    }
  }))

  // Tool 7: Fraud Detector
  tools.register(defineTool({
    name: 'fraud_detector',
    description: 'Detect potential insurance fraud through behavioral analysis, network analysis, and pattern matching. Generates fraud scores, red flags, and investigation recommendations.',
    parameters: {
      claim_data: { type: 'string', required: true, description: 'JSON object with fields: claim_id, amount (number), type, frequency (number), timing_pattern (string)' },
      behavioral_indicators: { type: 'string', required: true, description: 'JSON array of behavioral indicators with fields: indicator, severity (low/medium/high/critical), description' },
      network_data: { type: 'string', description: 'JSON array of network nodes with fields: entity_id, entity_type, connection_type, risk_flag (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { claim_data: string; behavioral_indicators: string; network_data: string }) {
      const claimData = JSON.parse(args.claim_data)
      const indicators: BehavioralIndicator[] = JSON.parse(args.behavioral_indicators)
      const network: NetworkNode[] = args.network_data ? JSON.parse(args.network_data) : []
      const result = detectFraud(claimData, indicators, network, claimData.claim_id)
      return formatFraudReport(claimData, result)
    }
  }))

  // Tool 8: Regulatory Compliance
  tools.register(defineTool({
    name: 'regulatory_compliance',
    description: 'Check insurance operations against regulatory frameworks. Identifies compliance gaps, generates remediation plans, and calculates potential penalties avoided.',
    parameters: {
      insurance_operations: { type: 'string', required: true, description: 'JSON object with fields: areas (string[]), current_practices (string[]), staff_count (number), annual_premium_volume (number)' },
      regulatory_frameworks: { type: 'string', required: true, description: 'JSON array of regulatory frameworks with fields: name, jurisdiction, requirements (string[]), penalties (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { insurance_operations: string; regulatory_frameworks: string }) {
      const operations = JSON.parse(args.insurance_operations)
      const frameworks: RegulatoryFramework[] = JSON.parse(args.regulatory_frameworks)
      const result = checkCompliance(operations, frameworks, operations.areas.join('-'))
      return formatComplianceReport(result)
    }
  }))

  console.log(`[dsh-tool-insurnaut] Loaded v${VERSION} — Insurance Navigator with 8 tools`)
  console.log('  Tools: claims_analyst, underwriting_advisor, coverage_optimizer, risk_assessor, policy_comparator, premium_calculator, fraud_detector, regulatory_compliance')
}
