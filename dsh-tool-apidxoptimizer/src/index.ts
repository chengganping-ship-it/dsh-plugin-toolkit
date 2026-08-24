/**
 * dsh-tool-apidxoptimizer - API Developer Experience Optimizer Plugin
 *
 * A DeepSeek Harness (DSH) plugin for API developer experience scoring, SDK
 * usability analysis, developer onboarding optimization, documentation quality
 * assessment, and API adoption prediction.
 *
 * Tools:
 *   1. dx_score_calculator          — DX scoring across 6 dimensions
 *   2. sdk_usability_analyst         — SDK usability heuristics evaluation
 *   3. developer_onboarding_optimizer — Onboarding flow gap analysis
 *   4. documentation_quality_grader  — Docs quality scoring (0-100)
 *   5. api_adoption_predictor        — API adoption rate prediction
 *   6. integration_time_finder       — Integration time estimation
 *   7. error_handling_assessor       — Error handling maturity scoring
 *   8. churn_prediction_signals      — Developer churn risk signals
 *
 * @author chengganping-ship-it
 * @version 0.1.0
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 – Seeded Random (mulberry32 PRNG)
// ─────────────────────────────────────────────────────────────────────────────

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 – Interface Definitions
// ─────────────────────────────────────────────────────────────────────────────

/** Input for Tool 1: DX Score Calculator */
export interface DxScoreInput {
  api_name: string
  response_time_ms?: number
  availability_pct?: number
  documentation_completeness?: number
  sdk_language_count?: number
  auth_complexity?: 'low' | 'medium' | 'high'
  developer_satisfaction?: number
}

/** DX score breakdown by category */
export interface DxScoreBreakdown {
  performance: number
  reliability: number
  documentation: number
  sdk_quality: number
  auth_simplicity: number
  satisfaction: number
}

/** Output for Tool 1: DX Score Calculator */
export interface DxScoreResult {
  api_name: string
  overall_score: number
  grade: string
  breakdown: DxScoreBreakdown
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

/** Input for Tool 2: SDK Usability Analyst */
export interface SdkUsabilityInput {
  sdk_name: string
  languages: string[]
  installation_steps?: number
  has_type_definitions?: boolean
  has_async_support?: boolean
  retry_mechanism?: boolean
  pagination_style?: 'offset' | 'cursor' | 'token' | 'none'
  sample_count?: number
}

/** Usability score by heuristic category */
export interface SdkHeuristicScore {
  installability: number
  api_discoverability: number
  consistency: number
  error_recovery: number
  type_safety: number
  extensibility: number
}

/** Output for Tool 2: SDK Usability Analyst */
export interface SdkUsabilityResult {
  sdk_name: string
  overall_usability: number
  grade: string
  heuristics: SdkHeuristicScore
  issues: string[]
  best_practices: string[]
  improvement_priority: string[]
}

/** Input for Tool 3: Developer Onboarding Optimizer */
export interface OnboardingInput {
  api_product: string
  time_to_first_call_min?: number
  quickstart_available?: boolean
  interactive_tutorial?: boolean
  sandbox_environment?: boolean
  sample_apps_count?: number
  support_channels?: string[]
}

/** Onboarding touchpoint gap */
export interface OnboardingGap {
  touchpoint: string
  status: 'present' | 'missing' | 'weak'
  impact: 'high' | 'medium' | 'low'
  recommendation: string
}

/** Output for Tool 3: Developer Onboarding Optimizer */
export interface OnboardingResult {
  api_product: string
  onboarding_score: number
  estimated_completion_hours: number
  completion_rate_prediction: number
  gaps: OnboardingGap[]
  funnel_stages: Array<{ stage: string; dropoff_pct: number; status: string }>
  optimization_actions: string[]
}

/** Input for Tool 4: Documentation Quality Grader */
export interface DocumentationInput {
  api_product: string
  total_endpoints?: number
  documented_endpoints?: number
  has_examples?: boolean
  has_error_catalog?: boolean
  has_changelog?: boolean
  has_guides?: boolean
  search_functionality?: boolean
  last_updated_days?: number
}

/** Documentation score by section */
export interface DocSectionScore {
  reference_completeness: number
  examples_quality: number
  error_documentation: number
  guides_and_tutorials: number
  freshness: number
  searchability: number
}

/** Output for Tool 4: Documentation Quality Grader */
export interface DocumentationResult {
  api_product: string
  overall_score: number
  grade: string
  sections: DocSectionScore
  missing_items: string[]
  quality_flags: string[]
  improvement_roadmap: string[]
}

/** Input for Tool 5: API Adoption Predictor */
export interface AdoptionInput {
  api_product: string
  current_developers?: number
  monthly_growth_rate?: number
  industry_benchmark_growth?: number
  pricing_tier?: 'free' | 'freemium' | 'paid' | 'enterprise'
  market_segment?: string
  competitor_count?: number
  documentation_score?: number
  sdk_language_count?: number
}

/** Adoption prediction by phase */
export interface AdoptionPhase {
  phase: string
  months: number
  predicted_developers: number
  cumulative_conversion_rate: number
  key_driver: string
}

/** Output for Tool 5: API Adoption Predictor */
export interface AdoptionResult {
  api_product: string
  current_developers: number
  six_month_prediction: number
  twelve_month_prediction: number
  growth_trajectory: 'accelerating' | 'steady' | 'decelerating' | 'declining'
  phases: AdoptionPhase[]
  key_growth_factors: string[]
  risk_factors: string[]
  monetization_readiness: string
}

/** Input for Tool 6: Integration Time Finder */
export interface IntegrationTimeInput {
  api_product: string
  api_type?: 'rest' | 'graphql' | 'grpc' | 'websocket'
  developer_experience_level?: 'junior' | 'mid' | 'senior'
  team_size?: number
  endpoints_to_integrate?: number
  has_sdk?: boolean
  has_sandbox?: boolean
  auth_type?: 'api_key' | 'oauth2' | 'jwt' | 'm_TLS'
}

/** Integration phase breakdown */
export interface IntegrationPhase {
  phase: string
  estimated_hours: number
  risk: 'low' | 'medium' | 'high'
  dependencies: string[]
}

/** Output for Tool 6: Integration Time Finder */
export interface IntegrationTimeResult {
  api_product: string
  total_estimated_hours: number
  total_estimated_days: number
  phases: IntegrationPhase[]
  confidence_level: string
  risk_factors: string[]
  acceleration_tips: string[]
}

/** Input for Tool 7: Error Handling Assessor */
export interface ErrorHandlingInput {
  api_product: string
  has_standard_error_format?: boolean
  error_codes_documented?: boolean
  has_retry_headers?: boolean
  has_rate_limit_headers?: boolean
  has_error_recovery_guides?: boolean
  consistent_error_response?: boolean
  http_status_usage?: 'correct' | 'partial' | 'incorrect'
}

/** Error handling maturity level */
export type ErrorMaturityLevel = 'excellent' | 'good' | 'fair' | 'poor'

/** Output for Tool 7: Error Handling Assessor */
export interface ErrorHandlingResult {
  api_product: string
  maturity_level: ErrorMaturityLevel
  maturity_score: number
  covered_dimensions: number
  total_dimensions: number
  gaps: string[]
  best_practices_followed: string[]
  remediation_plan: string[]
}

/** Input for Tool 8: Churn Prediction Signals */
export interface ChurnPredictionInput {
  api_product: string
  active_developers?: number
  monthly_active_trend?: number[]
  avg_integration_time_days?: number
  support_ticket_volume?: number
  sdk_download_trend?: number[]
  documentation_feedback_score?: number
  competitor_migration_signals?: number
}

/** Individual churn signal */
export interface ChurnSignal {
  signal: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  current_value: number
  threshold: number
  trend: 'improving' | 'stable' | 'worsening'
  recommendation: string
}

/** Output for Tool 8: Churn Prediction Signals */
export interface ChurnPredictionResult {
  api_product: string
  overall_churn_risk: 'critical' | 'high' | 'moderate' | 'low'
  churn_probability_30d: number
  churn_probability_90d: number
  signals: ChurnSignal[]
  at_risk_developer_count: number
  retention_actions: string[]
  health_score: number
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 – Tool 1: DX Score Calculator
// ─────────────────────────────────────────────────────────────────────────────

/** Calculate overall DX score across 6 dimensions */
function calculateDxScore(input: DxScoreInput): DxScoreResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Performance score (based on response time)
  const responseTime = input.response_time_ms ?? rng.nextInt(50, 800)
  let performance: number
  if (responseTime < 100) performance = 95
  else if (responseTime < 200) performance = 85
  else if (responseTime < 500) performance = 70
  else if (responseTime < 1000) performance = 50
  else performance = 30
  performance = Math.min(100, Math.max(0, performance + rng.nextInt(-5, 5)))

  // Reliability score
  const availability = input.availability_pct ?? rng.nextFloat(95, 99.99)
  let reliability: number
  if (availability >= 99.9) reliability = 98
  else if (availability >= 99.5) reliability = 88
  else if (availability >= 99) reliability = 78
  else if (availability >= 98) reliability = 60
  else reliability = 40
  reliability = Math.min(100, Math.max(0, reliability + rng.nextInt(-3, 3)))

  // Documentation score
  const docCompleteness = input.documentation_completeness ?? rng.nextFloat(40, 95)
  const documentation = Math.round(Math.min(100, Math.max(0, docCompleteness + rng.nextInt(-5, 5))))

  // SDK quality score
  const sdkCount = input.sdk_language_count ?? rng.nextInt(1, 12)
  let sdkQuality: number
  if (sdkCount >= 8) sdkQuality = 95
  else if (sdkCount >= 5) sdkQuality = 85
  else if (sdkCount >= 3) sdkQuality = 72
  else if (sdkCount >= 2) sdkQuality = 58
  else sdkQuality = 40
  sdkQuality = Math.min(100, Math.max(0, sdkQuality + rng.nextInt(-5, 5)))

  // Auth simplicity score
  const authComplexity = input.auth_complexity ?? rng.pick(['low', 'medium', 'high'] as const)
  let authSimplicity: number
  if (authComplexity === 'low') authSimplicity = 92
  else if (authComplexity === 'medium') authSimplicity = 70
  else authSimplicity = 45
  authSimplicity = Math.min(100, Math.max(0, authSimplicity + rng.nextInt(-4, 4)))

  // Satisfaction score
  const satisfaction = input.developer_satisfaction ?? rng.nextFloat(50, 95)
  const satisfactionScore = Math.round(Math.min(100, Math.max(0, satisfaction + rng.nextInt(-3, 3))))

  // Overall weighted score
  const overall = Math.round(
    performance * 0.2 +
    reliability * 0.2 +
    documentation * 0.2 +
    sdkQuality * 0.15 +
    authSimplicity * 0.15 +
    satisfactionScore * 0.1
  )

  const grade = overall >= 90 ? 'A+' : overall >= 80 ? 'A' : overall >= 70 ? 'B' : overall >= 60 ? 'C' : overall >= 50 ? 'D' : 'F'

  const breakdown: DxScoreBreakdown = {
    performance,
    reliability,
    documentation,
    sdk_quality: sdkQuality,
    auth_simplicity: authSimplicity,
    satisfaction: satisfactionScore,
  }

  // Identify strengths and weaknesses
  const strengths: string[] = []
  const weaknesses: string[] = []
  const entries = Object.entries(breakdown) as [keyof DxScoreBreakdown, number][]
  for (const [key, value] of entries) {
    if (value >= 80) strengths.push(key)
    else if (value < 60) weaknesses.push(key)
  }

  const recommendations: string[] = []
  if (breakdown.performance < 70) recommendations.push('Optimize API response time — currently ' + responseTime + 'ms')
  if (breakdown.reliability < 80) recommendations.push('Improve availability to at least 99.5% SLA')
  if (breakdown.documentation < 75) recommendations.push('Expand API reference documentation coverage')
  if (breakdown.sdk_quality < 70) recommendations.push('Add SDK support for more programming languages')
  if (breakdown.auth_simplicity < 70) recommendations.push('Simplify authentication flow — consider API key option')
  if (breakdown.satisfaction < 75) recommendations.push('Run developer satisfaction survey for targeted improvements')
  if (recommendations.length === 0) recommendations.push('Maintain current quality — focus on incremental improvements')

  return {
    api_name: input.api_name,
    overall_score: overall,
    grade,
    breakdown,
    strengths,
    weaknesses,
    recommendations,
  }
}

/** Format DX score result into readable report */
function formatDxScoreReport(result: DxScoreResult): string {
  const lines: string[] = []
  lines.push('# DX Score Report: ' + result.api_name)
  lines.push('')
  lines.push('## Overall Score')
  lines.push('')
  lines.push('**' + result.overall_score + '/100** — Grade: **' + result.grade + '**')
  lines.push('')
  lines.push('## Dimension Breakdown')
  lines.push('')
  lines.push('| Dimension | Score | Rating |')
  lines.push('|-----------|-------|--------|')
  const b = result.breakdown
  const rating = (s: number) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor'
  lines.push('| Performance | ' + b.performance + ' | ' + rating(b.performance) + ' |')
  lines.push('| Reliability | ' + b.reliability + ' | ' + rating(b.reliability) + ' |')
  lines.push('| Documentation | ' + b.documentation + ' | ' + rating(b.documentation) + ' |')
  lines.push('| SDK Quality | ' + b.sdk_quality + ' | ' + rating(b.sdk_quality) + ' |')
  lines.push('| Auth Simplicity | ' + b.auth_simplicity + ' | ' + rating(b.auth_simplicity) + ' |')
  lines.push('| Satisfaction | ' + b.satisfaction + ' | ' + rating(b.satisfaction) + ' |')
  lines.push('')

  if (result.strengths.length > 0) {
    lines.push('## Strengths')
    lines.push('')
    for (const s of result.strengths) {
      lines.push('- ' + s + ' (score >= 80)')
    }
    lines.push('')
  }

  if (result.weaknesses.length > 0) {
    lines.push('## Weaknesses')
    lines.push('')
    for (const w of result.weaknesses) {
      lines.push('- ' + w + ' (score < 60)')
    }
    lines.push('')
  }

  lines.push('## Recommendations')
  lines.push('')
  for (let i = 0; i < result.recommendations.length; i++) {
    lines.push((i + 1) + '. ' + result.recommendations[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | DX Score Calculator')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 – Tool 2: SDK Usability Analyst
// ─────────────────────────────────────────────────────────────────────────────

/** Analyze SDK usability across 6 heuristic dimensions */
function analyzeSdkUsability(input: SdkUsabilityInput): SdkUsabilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Installability
  const installSteps = input.installation_steps ?? rng.nextInt(2, 12)
  let installability: number
  if (installSteps <= 2) installability = 95
  else if (installSteps <= 4) installability = 80
  else if (installSteps <= 7) installability = 65
  else installability = 45
  installability = Math.min(100, Math.max(0, installability + rng.nextInt(-5, 5)))

  // API Discoverability
  const samples = input.sample_count ?? rng.nextInt(1, 20)
  let discoverability: number
  if (samples >= 10) discoverability = 90
  else if (samples >= 5) discoverability = 75
  else if (samples >= 3) discoverability = 60
  else discoverability = 40
  discoverability = Math.min(100, Math.max(0, discoverability + rng.nextInt(-5, 5)))

  // Consistency
  const hasAsync = input.has_async_support ?? rng.next() > 0.3
  const pagination = input.pagination_style ?? rng.pick(['offset', 'cursor', 'token', 'none'] as const)
  let consistency = 70
  if (hasAsync) consistency += 10
  if (pagination === 'cursor') consistency += 15
  else if (pagination === 'token') consistency += 10
  else if (pagination === 'offset') consistency += 5
  consistency = Math.min(100, Math.max(0, consistency + rng.nextInt(-5, 5)))

  // Error Recovery
  const hasRetry = input.retry_mechanism ?? rng.next() > 0.3
  let errorRecovery = 55
  if (hasRetry) errorRecovery += 25
  errorRecovery = Math.min(100, Math.max(0, errorRecovery + rng.nextInt(-5, 5)))

  // Type Safety
  const hasTypes = input.has_type_definitions ?? rng.next() > 0.4
  let typeSafety = 50
  if (hasTypes) typeSafety += 35
  typeSafety = Math.min(100, Math.max(0, typeSafety + rng.nextInt(-5, 5)))

  // Extensibility
  const langCount = input.languages?.length ?? rng.nextInt(1, 12)
  let extensibility: number
  if (langCount >= 6) extensibility = 90
  else if (langCount >= 3) extensibility = 75
  else if (langCount >= 2) extensibility = 60
  else extensibility = 40
  extensibility = Math.min(100, Math.max(0, extensibility + rng.nextInt(-5, 5)))

  const heuristics: SdkHeuristicScore = {
    installability,
    api_discoverability: discoverability,
    consistency,
    error_recovery: errorRecovery,
    type_safety: typeSafety,
    extensibility,
  }

  const overall = Math.round(
    installability * 0.2 +
    discoverability * 0.2 +
    consistency * 0.15 +
    errorRecovery * 0.15 +
    typeSafety * 0.15 +
    extensibility * 0.15
  )

  const grade = overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'F'

  // Identify issues and best practices
  const issues: string[] = []
  const bestPractices: string[] = []
  if (installability < 70) issues.push('Installation requires ' + installSteps + ' steps — should be <= 3')
  else bestPractices.push('Installation is straightforward (' + installSteps + ' steps)')
  if (discoverability < 70) issues.push('Only ' + samples + ' code samples provided — aim for 10+')
  else bestPractices.push('Good API discoverability with ' + samples + ' samples')
  if (!hasAsync) issues.push('Missing async/await support')
  else bestPractices.push('Async support available')
  if (!hasRetry) issues.push('No built-in retry mechanism')
  else bestPractices.push('Built-in retry mechanism present')
  if (!hasTypes) issues.push('Missing TypeScript/type definitions')
  else bestPractices.push('Type definitions available')

  const improvementPriority: string[] = []
  const sorted = Object.entries(heuristics).sort((a, b) => a[1] - b[1])
  for (const [key, value] of sorted.slice(0, 3)) {
    improvementPriority.push(key + ' (current: ' + value + ')')
  }

  return {
    sdk_name: input.sdk_name,
    overall_usability: overall,
    grade,
    heuristics,
    issues,
    best_practices: bestPractices,
    improvement_priority: improvementPriority,
  }
}

/** Format SDK usability report */
function formatSdkUsabilityReport(result: SdkUsabilityResult): string {
  const lines: string[] = []
  lines.push('# SDK Usability Report: ' + result.sdk_name)
  lines.push('')
  lines.push('## Overall Usability Score')
  lines.push('')
  lines.push('**' + result.overall_usability + '/100** — Grade: **' + result.grade + '**')
  lines.push('')
  lines.push('## Heuristic Evaluation')
  lines.push('')
  lines.push('| Heuristic | Score | Status |')
  lines.push('|-----------|-------|--------|')
  const h = result.heuristics
  const status = (s: number) => s >= 75 ? 'Pass' : s >= 50 ? 'Needs Work' : 'Fail'
  lines.push('| Installability | ' + h.installability + ' | ' + status(h.installability) + ' |')
  lines.push('| API Discoverability | ' + h.api_discoverability + ' | ' + status(h.api_discoverability) + ' |')
  lines.push('| Consistency | ' + h.consistency + ' | ' + status(h.consistency) + ' |')
  lines.push('| Error Recovery | ' + h.error_recovery + ' | ' + status(h.error_recovery) + ' |')
  lines.push('| Type Safety | ' + h.type_safety + ' | ' + status(h.type_safety) + ' |')
  lines.push('| Extensibility | ' + h.extensibility + ' | ' + status(h.extensibility) + ' |')
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('## Issues Identified')
    lines.push('')
    for (const issue of result.issues) {
      lines.push('- [] ' + issue)
    }
    lines.push('')
  }

  if (result.best_practices.length > 0) {
    lines.push('## Best Practices Followed')
    lines.push('')
    for (const bp of result.best_practices) {
      lines.push('- [x] ' + bp)
    }
    lines.push('')
  }

  lines.push('## Top Improvement Priorities')
  lines.push('')
  for (let i = 0; i < result.improvement_priority.length; i++) {
    lines.push((i + 1) + '. ' + result.improvement_priority[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | SDK Usability Analyst')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 – Tool 3: Developer Onboarding Optimizer
// ─────────────────────────────────────────────────────────────────────────────

/** Analyze developer onboarding flow and identify gaps */
function analyzeOnboarding(input: OnboardingInput): OnboardingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Score each onboarding touchpoint
  const hasQuickstart = input.quickstart_available ?? rng.next() > 0.3
  const hasTutorial = input.interactive_tutorial ?? rng.next() > 0.5
  const hasSandbox = input.sandbox_environment ?? rng.next() > 0.4
  const sampleCount = input.sample_apps_count ?? rng.nextInt(0, 8)
  const supportChannels = input.support_channels ?? ['email']
  const timeToFirstCall = input.time_to_first_call_min ?? rng.nextInt(5, 120)

  const gaps: OnboardingGap[] = []

  if (!hasQuickstart) {
    gaps.push({
      touchpoint: 'Quickstart Guide',
      status: 'missing',
      impact: 'high',
      recommendation: 'Create a 5-minute quickstart guide with a working example',
    })
  } else {
    gaps.push({
      touchpoint: 'Quickstart Guide',
      status: 'present',
      impact: 'low',
      recommendation: 'Ensure quickstart covers authentication and first API call',
    })
  }

  if (!hasTutorial) {
    gaps.push({
      touchpoint: 'Interactive Tutorial',
      status: 'missing',
      impact: 'high',
      recommendation: 'Build browser-based interactive tutorial with live API calls',
    })
  } else {
    gaps.push({
      touchpoint: 'Interactive Tutorial',
      status: 'present',
      impact: 'low',
      recommendation: 'Add progress tracking to tutorial',
    })
  }

  if (!hasSandbox) {
    gaps.push({
      touchpoint: 'Sandbox Environment',
      status: 'missing',
      impact: 'high',
      recommendation: 'Provide sandbox environment with test data and mock responses',
    })
  } else {
    gaps.push({
      touchpoint: 'Sandbox Environment',
      status: 'present',
      impact: 'low',
      recommendation: 'Add sample datasets to sandbox',
    })
  }

  if (sampleCount < 3) {
    gaps.push({
      touchpoint: 'Sample Applications',
      status: sampleCount === 0 ? 'missing' : 'weak',
      impact: 'medium',
      recommendation: 'Add at least 3 production-quality sample applications',
    })
  } else {
    gaps.push({
      touchpoint: 'Sample Applications',
      status: 'present',
      impact: 'low',
      recommendation: 'Maintain and regularly update sample applications',
    })
  }

  if (supportChannels.length < 2) {
    gaps.push({
      touchpoint: 'Support Channels',
      status: 'weak',
      impact: 'medium',
      recommendation: 'Add community forum or chat (Slack/Discord) beyond ' + supportChannels[0],
    })
  } else {
    gaps.push({
      touchpoint: 'Support Channels',
      status: 'present',
      impact: 'low',
      recommendation: 'Ensure support channels are monitored with < 4hr response time',
    })
  }

  // Onboarding score
  let score = 50
  if (hasQuickstart) score += 12
  if (hasTutorial) score += 12
  if (hasSandbox) score += 12
  if (sampleCount >= 3) score += 8
  if (supportChannels.length >= 2) score += 6
  score = Math.min(100, Math.max(0, score + rng.nextInt(-3, 3)))

  // Estimated completion time
  let baseHours = 4
  if (!hasQuickstart) baseHours += 3
  if (!hasTutorial) baseHours += 2
  if (!hasSandbox) baseHours += 2
  if (sampleCount < 2) baseHours += 1
  const estimatedHours = baseHours + rng.nextFloat(-0.5, 1.5)

  // Completion rate prediction
  let completionRate = 85
  if (!hasQuickstart) completionRate -= 15
  if (!hasTutorial) completionRate -= 10
  if (!hasSandbox) completionRate -= 10
  if (sampleCount < 2) completionRate -= 5
  if (timeToFirstCall > 30) completionRate -= 10
  completionRate = Math.min(95, Math.max(30, completionRate + rng.nextInt(-5, 5)))

  // Funnel stages
  const funnelStages = [
    { stage: 'Land on Docs', dropoff_pct: 10, status: 'healthy' },
    { stage: 'Create Account', dropoff_pct: hasQuickstart ? 15 : 28, status: hasQuickstart ? 'healthy' : 'attention' },
    { stage: 'First API Call', dropoff_pct: hasSandbox ? 12 : 30, status: hasSandbox ? 'healthy' : 'critical' },
    { stage: 'Build Sample App', dropoff_pct: sampleCount >= 3 ? 20 : 40, status: sampleCount >= 3 ? 'healthy' : 'attention' },
    { stage: 'Production Integration', dropoff_pct: 8, status: 'healthy' },
  ]

  // Optimization actions
  const optimizationActions: string[] = []
  if (!hasQuickstart) optimizationActions.push('P0: Create quickstart guide (estimated +15% completion)')
  if (!hasSandbox) optimizationActions.push('P0: Launch sandbox environment (estimated +12% completion)')
  if (!hasTutorial) optimizationActions.push('P1: Build interactive tutorial')
  if (sampleCount < 3) optimizationActions.push('P1: Add ' + (3 - sampleCount) + ' more sample applications')
  if (supportChannels.length < 2) optimizationActions.push('P2: Add community forum or chat support')
  if (timeToFirstCall > 30) optimizationActions.push('P2: Reduce time-to-first-call from ' + timeToFirstCall + 'min to < 15min')
  if (optimizationActions.length === 0) optimizationActions.push('Maintain current onboarding — monitor analytics for degradation')

  return {
    api_product: input.api_product,
    onboarding_score: score,
    estimated_completion_hours: Math.round(estimatedHours * 10) / 10,
    completion_rate_prediction: completionRate,
    gaps,
    funnel_stages: funnelStages,
    optimization_actions: optimizationActions,
  }
}

/** Format onboarding optimization report */
function formatOnboardingReport(result: OnboardingResult): string {
  const lines: string[] = []
  lines.push('# Developer Onboarding Report: ' + result.api_product)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('- **Onboarding Score:** ' + result.onboarding_score + '/100')
  lines.push('- **Estimated Completion Time:** ' + result.estimated_completion_hours + ' hours')
  lines.push('- **Predicted Completion Rate:** ' + result.completion_rate_prediction + '%')
  lines.push('')
  lines.push('## Touchpoint Gaps')
  lines.push('')
  lines.push('| Touchpoint | Status | Impact | Recommendation |')
  lines.push('|------------|--------|--------|----------------|')
  for (const gap of result.gaps) {
    const statusIcon = gap.status === 'present' ? '[OK]' : gap.status === 'weak' ? '[WARN]' : '[MISSING]'
    lines.push('| ' + gap.touchpoint + ' | ' + statusIcon + ' ' + gap.status + ' | ' + gap.impact + ' | ' + gap.recommendation + ' |')
  }
  lines.push('')

  lines.push('## Onboarding Funnel')
  lines.push('')
  lines.push('| Stage | Dropoff % | Status |')
  lines.push('|-------|-----------|--------|')
  for (const stage of result.funnel_stages) {
    lines.push('| ' + stage.stage + ' | ' + stage.dropoff_pct + '% | ' + stage.status + ' |')
  }
  lines.push('')

  lines.push('## Optimization Actions')
  lines.push('')
  for (let i = 0; i < result.optimization_actions.length; i++) {
    lines.push((i + 1) + '. ' + result.optimization_actions[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | Developer Onboarding Optimizer')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 – Tool 4: Documentation Quality Grader
// ─────────────────────────────────────────────────────────────────────────────

/** Grade API documentation quality across 6 dimensions */
function gradeDocumentation(input: DocumentationInput): DocumentationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Reference completeness
  const totalEndpoints = input.total_endpoints ?? rng.nextInt(20, 200)
  const documentedEndpoints = input.documented_endpoints ?? rng.nextInt(Math.floor(totalEndpoints * 0.4), totalEndpoints)
  const referenceCompleteness = Math.round(Math.min(100, (documentedEndpoints / totalEndpoints) * 100 + rng.nextInt(-3, 3)))

  // Examples quality
  const hasExamples = input.has_examples ?? rng.next() > 0.2
  let examplesQuality = hasExamples ? 75 : 25
  examplesQuality = Math.min(100, Math.max(0, examplesQuality + rng.nextInt(-10, 15)))

  // Error documentation
  const hasErrorCatalog = input.has_error_catalog ?? rng.next() > 0.4
  let errorDoc = hasErrorCatalog ? 70 : 20
  errorDoc = Math.min(100, Math.max(0, errorDoc + rng.nextInt(-5, 15)))

  // Guides and tutorials
  const hasGuides = input.has_guides ?? rng.next() > 0.3
  let guidesScore = hasGuides ? 80 : 30
  guidesScore = Math.min(100, Math.max(0, guidesScore + rng.nextInt(-5, 10)))

  // Freshness
  const lastUpdated = input.last_updated_days ?? rng.nextInt(1, 365)
  let freshness: number
  if (lastUpdated <= 7) freshness = 95
  else if (lastUpdated <= 30) freshness = 85
  else if (lastUpdated <= 90) freshness = 70
  else if (lastUpdated <= 180) freshness = 50
  else freshness = 30
  freshness = Math.min(100, Math.max(0, freshness + rng.nextInt(-5, 5)))

  // Searchability
  const hasSearch = input.search_functionality ?? rng.next() > 0.3
  let searchability = hasSearch ? 85 : 35
  searchability = Math.min(100, Math.max(0, searchability + rng.nextInt(-5, 5)))

  const sections: DocSectionScore = {
    reference_completeness: referenceCompleteness,
    examples_quality: examplesQuality,
    error_documentation: errorDoc,
    guides_and_tutorials: guidesScore,
    freshness,
    searchability,
  }

  const overall = Math.round(
    referenceCompleteness * 0.25 +
    examplesQuality * 0.2 +
    errorDoc * 0.15 +
    guidesScore * 0.15 +
    freshness * 0.15 +
    searchability * 0.1
  )

  const grade = overall >= 90 ? 'A+' : overall >= 80 ? 'A' : overall >= 70 ? 'B' : overall >= 60 ? 'C' : overall >= 50 ? 'D' : 'F'

  // Missing items
  const missingItems: string[] = []
  if (referenceCompleteness < 80) missingItems.push('(' + (totalEndpoints - documentedEndpoints) + ' undocumented endpoints)')
  if (!hasExamples) missingItems.push('Code examples missing')
  if (!hasErrorCatalog) missingItems.push('Error catalog missing')
  if (!hasGuides) missingItems.push('Guides and tutorials missing')
  if (lastUpdated > 90) missingItems.push('Documentation stale (' + lastUpdated + ' days since update)')
  if (!hasSearch) missingItems.push('Search functionality missing')

  // Quality flags
  const qualityFlags: string[] = []
  if (referenceCompleteness < 50) qualityFlags.push('CRITICAL: Less than 50% of endpoints documented')
  if (!hasErrorCatalog && totalEndpoints > 50) qualityFlags.push('HIGH: No error catalog for API with ' + totalEndpoints + ' endpoints')
  if (lastUpdated > 180) qualityFlags.push('HIGH: Documentation outdated (> 180 days)')
  if (!hasExamples && !hasGuides) qualityFlags.push('MEDIUM: No learning materials (examples or guides)')
  if (qualityFlags.length === 0) qualityFlags.push('No critical quality flags')

  // Improvement roadmap
  const improvementRoadmap: string[] = []
  if (referenceCompleteness < 90) improvementRoadmap.push('Phase 1: Document remaining ' + (totalEndpoints - documentedEndpoints) + ' endpoints')
  if (!hasExamples) improvementRoadmap.push('Phase 1: Add code examples for top 10 endpoints')
  if (!hasErrorCatalog) improvementRoadmap.push('Phase 2: Build comprehensive error code catalog')
  if (!hasGuides) improvementRoadmap.push('Phase 2: Create getting-started and advanced guides')
  if (lastUpdated > 60) improvementRoadmap.push('Phase 3: Schedule monthly doc review cycle')
  if (!hasSearch) improvementRoadmap.push('Phase 3: Implement full-text search')
  if (improvementRoadmap.length === 0) improvementRoadmap.push('Documentation quality is excellent — maintain review cadence')

  return {
    api_product: input.api_product,
    overall_score: overall,
    grade,
    sections,
    missing_items: missingItems,
    quality_flags: qualityFlags,
    improvement_roadmap: improvementRoadmap,
  }
}

/** Format documentation quality report */
function formatDocumentationReport(result: DocumentationResult): string {
  const lines: string[] = []
  lines.push('# Documentation Quality Report: ' + result.api_product)
  lines.push('')
  lines.push('## Overall Score')
  lines.push('')
  lines.push('**' + result.overall_score + '/100** — Grade: **' + result.grade + '**')
  lines.push('')
  lines.push('## Section Scores')
  lines.push('')
  lines.push('| Section | Score | Rating |')
  lines.push('|---------|-------|--------|')
  const s = result.sections
  const rating = (v: number) => v >= 80 ? 'Excellent' : v >= 60 ? 'Good' : v >= 40 ? 'Fair' : 'Poor'
  lines.push('| Reference Completeness | ' + s.reference_completeness + ' | ' + rating(s.reference_completeness) + ' |')
  lines.push('| Examples Quality | ' + s.examples_quality + ' | ' + rating(s.examples_quality) + ' |')
  lines.push('| Error Documentation | ' + s.error_documentation + ' | ' + rating(s.error_documentation) + ' |')
  lines.push('| Guides & Tutorials | ' + s.guides_and_tutorials + ' | ' + rating(s.guides_and_tutorials) + ' |')
  lines.push('| Freshness | ' + s.freshness + ' | ' + rating(s.freshness) + ' |')
  lines.push('| Searchability | ' + s.searchability + ' | ' + rating(s.searchability) + ' |')
  lines.push('')

  if (result.missing_items.length > 0) {
    lines.push('## Missing Items')
    lines.push('')
    for (const item of result.missing_items) {
      lines.push('- ' + item)
    }
    lines.push('')
  }

  lines.push('## Quality Flags')
  lines.push('')
  for (const flag of result.quality_flags) {
    lines.push('- ' + flag)
  }
  lines.push('')

  lines.push('## Improvement Roadmap')
  lines.push('')
  for (let i = 0; i < result.improvement_roadmap.length; i++) {
    lines.push((i + 1) + '. ' + result.improvement_roadmap[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | Documentation Quality Grader')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 – Tool 5: API Adoption Predictor
// ─────────────────────────────────────────────────────────────────────────────

/** Predict API developer adoption over time */
function predictAdoption(input: AdoptionInput): AdoptionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const currentDevs = input.current_developers ?? rng.nextInt(100, 10000)
  const growthRate = input.monthly_growth_rate ?? rng.nextFloat(2, 25)
  const benchmark = input.industry_benchmark_growth ?? rng.nextFloat(8, 15)
  const pricing = input.pricing_tier ?? rng.pick(['free', 'freemium', 'paid', 'enterprise'] as const)
  const competitorCount = input.competitor_count ?? rng.nextInt(1, 20)
  const docScore = input.documentation_score ?? rng.nextInt(40, 95)
  const sdkLangs = input.sdk_language_count ?? rng.nextInt(1, 12)

  // Adjust growth rate by pricing
  let adjustedGrowth = growthRate
  if (pricing === 'free') adjustedGrowth *= 1.4
  else if (pricing === 'freemium') adjustedGrowth *= 1.2
  else if (pricing === 'paid') adjustedGrowth *= 0.8
  else adjustedGrowth *= 0.6

  // Document and SDK quality boost
  if (docScore >= 80) adjustedGrowth *= 1.15
  if (sdkLangs >= 5) adjustedGrowth *= 1.1

  // Competition penalty
  if (competitorCount > 10) adjustedGrowth *= 0.85
  else if (competitorCount > 5) adjustedGrowth *= 0.95

  // Monthly predictions
  const phases: AdoptionPhase[] = []
  let devs = currentDevs

  // Month 1-3: Activation phase
  const m3Growth = adjustedGrowth * 0.7
  const m3Devs = Math.round(devs * (1 + m3Growth / 100))
  phases.push({
    phase: 'Activation',
    months: 3,
    predicted_developers: m3Devs,
    cumulative_conversion_rate: Math.round((m3Devs / Math.max(devs, 1)) * 100),
    key_driver: pricing === 'free' || pricing === 'freemium' ? 'Low barrier to entry' : 'Initial marketing push',
  })
  devs = m3Devs

  // Month 4-6: Growth phase
  const m6Growth = adjustedGrowth * 1.0
  const m6Devs = Math.round(devs * (1 + m6Growth / 100))
  phases.push({
    phase: 'Growth',
    months: 6,
    predicted_developers: m6Devs,
    cumulative_conversion_rate: Math.round((m6Devs / Math.max(currentDevs, 1)) * 100),
    key_driver: 'Word-of-mouth and community growth',
  })
  devs = m6Devs

  // Month 7-9: Scaling phase
  const m9Growth = adjustedGrowth * 0.9
  const m9Devs = Math.round(devs * (1 + m9Growth / 100))
  phases.push({
    phase: 'Scaling',
    months: 9,
    predicted_developers: m9Devs,
    cumulative_conversion_rate: Math.round((m9Devs / Math.max(currentDevs, 1)) * 100),
    key_driver: 'Enterprise partnerships and integrations',
  })
  devs = m9Devs

  // Month 10-12: Maturity phase
  const m12Growth = adjustedGrowth * 0.8
  const m12Devs = Math.round(devs * (1 + m12Growth / 100))
  phases.push({
    phase: 'Maturity',
    months: 12,
    predicted_developers: m12Devs,
    cumulative_conversion_rate: Math.round((m12Devs / Math.max(currentDevs, 1)) * 100),
    key_driver: 'Platform ecosystem and stickiness',
  })

  const sixMonthPrediction = m6Devs
  const twelveMonthPrediction = m12Devs

  // Trajectory
  let trajectory: 'accelerating' | 'steady' | 'decelerating' | 'declining'
  if (adjustedGrowth > benchmark * 1.2) trajectory = 'accelerating'
  else if (adjustedGrowth >= benchmark * 0.8) trajectory = 'steady'
  else if (adjustedGrowth >= benchmark * 0.5) trajectory = 'decelerating'
  else trajectory = 'declining'

  // Key growth factors
  const growthFactors: string[] = []
  if (pricing === 'free' || pricing === 'freemium') growthFactors.push('Free tier drives top-of-funnel')
  if (docScore >= 80) growthFactors.push('High-quality documentation reduces friction')
  if (sdkLangs >= 5) growthFactors.push('Multi-language SDK support broadens reach')
  if (competitorCount <= 5) growthFactors.push('Limited competition in market segment')
  if (growthFactors.length === 0) growthFactors.push('Standard organic growth pattern')

  // Risk factors
  const riskFactors: string[] = []
  if (competitorCount > 10) riskFactors.push('High competition (' + competitorCount + ' competitors)')
  if (pricing === 'paid' || pricing === 'enterprise') riskFactors.push('Pricing barrier slows adoption')
  if (docScore < 60) riskFactors.push('Poor documentation deters developers')
  if (sdkLangs < 3) riskFactors.push('Limited SDK language support')
  if (riskFactors.length === 0) riskFactors.push('No major risk factors identified')

  // Monetization readiness
  let monetizationReadiness: string
  if (m12Devs >= 5000 && docScore >= 70 && sdkLangs >= 3) monetizationReadiness = 'Ready for monetization tier'
  else if (m12Devs >= 2000) monetizationReadiness = 'Approaching monetization readiness (6-12 months)'
  else monetizationReadiness = 'Premature for monetization — focus on growth first'

  return {
    api_product: input.api_product,
    current_developers: currentDevs,
    six_month_prediction: sixMonthPrediction,
    twelve_month_prediction: twelveMonthPrediction,
    growth_trajectory: trajectory,
    phases,
    key_growth_factors: growthFactors,
    risk_factors: riskFactors,
    monetization_readiness: monetizationReadiness,
  }
}

/** Format adoption prediction report */
function formatAdoptionReport(result: AdoptionResult): string {
  const lines: string[] = []
  lines.push('# API Adoption Prediction: ' + result.api_product)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('- **Current Developers:** ' + result.current_developers.toLocaleString())
  lines.push('- **6-Month Prediction:** ' + result.six_month_prediction.toLocaleString() + ' developers')
  lines.push('- **12-Month Prediction:** ' + result.twelve_month_prediction.toLocaleString() + ' developers')
  lines.push('- **Growth Trajectory:** ' + result.growth_trajectory.toUpperCase())
  lines.push('- **Monetization Readiness:** ' + result.monetization_readiness)
  lines.push('')
  lines.push('## Adoption Phases')
  lines.push('')
  lines.push('| Phase | Months | Predicted Devs | Conversion Rate | Key Driver |')
  lines.push('|-------|--------|----------------|-----------------|------------|')
  for (const phase of result.phases) {
    lines.push('| ' + phase.phase + ' | ' + phase.months + ' | ' + phase.predicted_developers.toLocaleString() + ' | ' + phase.cumulative_conversion_rate + '% | ' + phase.key_driver + ' |')
  }
  lines.push('')

  lines.push('## Key Growth Factors')
  lines.push('')
  for (const factor of result.key_growth_factors) {
    lines.push('- ' + factor)
  }
  lines.push('')

  lines.push('## Risk Factors')
  lines.push('')
  for (const risk of result.risk_factors) {
    lines.push('- ' + risk)
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | API Adoption Predictor')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 – Tool 6: Integration Time Finder
// ─────────────────────────────────────────────────────────────────────────────

/** Estimate total integration time with phase breakdown */
function findIntegrationTime(input: IntegrationTimeInput): IntegrationTimeResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const apiType = input.api_type ?? rng.pick(['rest', 'graphql', 'grpc', 'websocket'] as const)
  const experience = input.developer_experience_level ?? rng.pick(['junior', 'mid', 'senior'] as const)
  const endpointsCount = input.endpoints_to_integrate ?? rng.nextInt(3, 30)
  const hasSdk = input.has_sdk ?? rng.next() > 0.3
  const hasSandbox = input.has_sandbox ?? rng.next() > 0.4
  const authType = input.auth_type ?? rng.pick(['api_key', 'oauth2', 'jwt', 'm_TLS'] as const)

  // Experience multiplier
  const expMultiplier = experience === 'senior' ? 0.6 : experience === 'mid' ? 1.0 : 1.5

  // API type complexity
  const apiComplexity = apiType === 'rest' ? 1.0 : apiType === 'graphql' ? 1.2 : apiType === 'grpc' ? 1.4 : 1.1

  // Auth complexity factor
  const authHours: Record<string, number> = { api_key: 1, oauth2: 4, jwt: 3, 'm_TLS': 8 }
  const authTime = authHours[authType] ?? 2

  // Phase 1: Setup & Discovery
  let setupHours = 2 * expMultiplier
  if (!hasSandbox) setupHours += 2
  setupHours += rng.nextFloat(-0.5, 1)

  // Phase 2: Authentication
  let authPhaseHours = authTime * expMultiplier
  if (!hasSdk) authPhaseHours += 2
  authPhaseHours += rng.nextFloat(-0.5, 1)

  // Phase 3: Endpoint Integration
  const perEndpointHours = 1.5 * apiComplexity * expMultiplier
  const integrationHours = endpointsCount * perEndpointHours + rng.nextFloat(-2, 4)

  // Phase 4: Error Handling
  let errorHours = 3 * expMultiplier
  if (!hasSdk) errorHours += 2
  errorHours += rng.nextFloat(-0.5, 1.5)

  // Phase 5: Testing
  const testingHours = 4 * expMultiplier + endpointsCount * 0.3 + rng.nextFloat(-1, 2)

  // Phase 6: Documentation & Handoff
  const docHours = 2 * expMultiplier + rng.nextFloat(-0.5, 1)

  const phases: IntegrationPhase[] = [
    { phase: 'Setup & Discovery', estimated_hours: Math.round(setupHours * 10) / 10, risk: hasSandbox ? 'low' : 'medium', dependencies: [] },
    { phase: 'Authentication', estimated_hours: Math.round(authPhaseHours * 10) / 10, risk: authType === 'oauth2' || authType === 'm_TLS' ? 'medium' : 'low', dependencies: ['Setup & Discovery'] },
    { phase: 'Endpoint Integration', estimated_hours: Math.round(integrationHours * 10) / 10, risk: endpointsCount > 15 ? 'high' : endpointsCount > 8 ? 'medium' : 'low', dependencies: ['Authentication'] },
    { phase: 'Error Handling', estimated_hours: Math.round(errorHours * 10) / 10, risk: hasSdk ? 'low' : 'medium', dependencies: ['Endpoint Integration'] },
    { phase: 'Testing', estimated_hours: Math.round(testingHours * 10) / 10, risk: 'medium', dependencies: ['Endpoint Integration', 'Error Handling'] },
    { phase: 'Documentation & Handoff', estimated_hours: Math.round(docHours * 10) / 10, risk: 'low', dependencies: ['Testing'] },
  ]

  const totalHours = phases.reduce((sum, p) => sum + p.estimated_hours, 0)
  const totalDays = Math.round((totalHours / 6) * 10) / 10 // 6 productive hours per day

  // Confidence level
  const knownFactors = [input.api_type, input.developer_experience_level, input.endpoints_to_integrate, input.has_sdk, input.has_sandbox, input.auth_type].filter(Boolean).length
  const confidenceLevel = knownFactors >= 5 ? 'High' : knownFactors >= 3 ? 'Medium' : 'Low'

  // Risk factors
  const riskFactors: string[] = []
  if (endpointsCount > 15) riskFactors.push('High endpoint count (' + endpointsCount + ') increases complexity')
  if (authType === 'm_TLS') riskFactors.push('mTLS setup requires certificate management')
  if (!hasSdk) riskFactors.push('No SDK available — raw HTTP integration required')
  if (!hasSandbox) riskFactors.push('No sandbox — testing against production risk')
  if (experience === 'junior') riskFactors.push('Junior developer — mentor review recommended')
  if (riskFactors.length === 0) riskFactors.push('No major risk factors')

  // Acceleration tips
  const accelerationTips: string[] = []
  if (!hasSdk) accelerationTips.push('Use community SDK if available to save 20-30% time')
  if (!hasSandbox) accelerationTips.push('Request sandbox access from API provider')
  if (endpointsCount > 10) accelerationTips.push('Prioritize top 5 endpoints for MVP integration')
  if (authType === 'oauth2') accelerationTips.push('Use OAuth2 client library — avoid building flow from scratch')
  if (experience === 'senior') accelerationTips.push('Senior dev can parallelize endpoint integration')
  if (accelerationTips.length === 0) accelerationTips.push('Integration path is already optimized')

  return {
    api_product: input.api_product,
    total_estimated_hours: Math.round(totalHours * 10) / 10,
    total_estimated_days: totalDays,
    phases,
    confidence_level: confidenceLevel,
    risk_factors: riskFactors,
    acceleration_tips: accelerationTips,
  }
}

/** Format integration time report */
function formatIntegrationTimeReport(result: IntegrationTimeResult): string {
  const lines: string[] = []
  lines.push('# Integration Time Estimate: ' + result.api_product)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('- **Total Estimated Hours:** ' + result.total_estimated_hours + ' hours')
  lines.push('- **Total Estimated Days:** ' + result.total_estimated_days + ' days')
  lines.push('- **Confidence Level:** ' + result.confidence_level)
  lines.push('')
  lines.push('## Phase Breakdown')
  lines.push('')
  lines.push('| Phase | Hours | Risk | Dependencies |')
  lines.push('|-------|-------|------|--------------|')
  for (const phase of result.phases) {
    const deps = phase.dependencies.length > 0 ? phase.dependencies.join(', ') : 'None'
    lines.push('| ' + phase.phase + ' | ' + phase.estimated_hours + 'h | ' + phase.risk + ' | ' + deps + ' |')
  }
  lines.push('')

  lines.push('## Risk Factors')
  lines.push('')
  for (const risk of result.risk_factors) {
    lines.push('- ' + risk)
  }
  lines.push('')

  lines.push('## Acceleration Tips')
  lines.push('')
  for (const tip of result.acceleration_tips) {
    lines.push('- ' + tip)
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | Integration Time Finder')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 – Tool 7: Error Handling Assessor
// ─────────────────────────────────────────────────────────────────────────────

/** Assess error handling maturity of an API */
function assessErrorHandling(input: ErrorHandlingInput): ErrorHandlingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const hasStandardFormat = input.has_standard_error_format ?? rng.next() > 0.3
  const errorCodesDoc = input.error_codes_documented ?? rng.next() > 0.4
  const hasRetryHeaders = input.has_retry_headers ?? rng.next() > 0.4
  const hasRateLimitHeaders = input.has_rate_limit_headers ?? rng.next() > 0.3
  const hasRecoveryGuides = input.has_error_recovery_guides ?? rng.next() > 0.5
  const consistentResponse = input.consistent_error_response ?? rng.next() > 0.3
  const httpStatusUsage = input.http_status_usage ?? rng.pick(['correct', 'partial', 'incorrect'] as const)

  // Calculate score
  let score = 0
  const totalDimensions = 7
  if (hasStandardFormat) score += 15
  if (errorCodesDoc) score += 15
  if (hasRetryHeaders) score += 12
  if (hasRateLimitHeaders) score += 12
  if (hasRecoveryGuides) score += 15
  if (consistentResponse) score += 15
  if (httpStatusUsage === 'correct') score += 16
  else if (httpStatusUsage === 'partial') score += 8
  score += rng.nextInt(-3, 3)

  const coveredDimensions = [hasStandardFormat, errorCodesDoc, hasRetryHeaders, hasRateLimitHeaders, hasRecoveryGuides, consistentResponse, httpStatusUsage === 'correct'].filter(Boolean).length
  const maturityScore = Math.min(100, Math.max(0, score))

  let maturityLevel: ErrorMaturityLevel
  if (maturityScore >= 80) maturityLevel = 'excellent'
  else if (maturityScore >= 60) maturityLevel = 'good'
  else if (maturityScore >= 40) maturityLevel = 'fair'
  else maturityLevel = 'poor'

  // Gaps
  const gaps: string[] = []
  if (!hasStandardFormat) gaps.push('No standardized error response format (RFC 7807 Problem Details recommended)')
  if (!errorCodesDoc) gaps.push('Error codes not documented with descriptions and resolution steps')
  if (!hasRetryHeaders) gaps.push('Missing Retry-After header on 429/503 responses')
  if (!hasRateLimitHeaders) gaps.push('Missing X-RateLimit-* headers for rate limit awareness')
  if (!hasRecoveryGuides) gaps.push('No error recovery guides for common failure scenarios')
  if (!consistentResponse) gaps.push('Inconsistent error response structure across endpoints')
  if (httpStatusUsage !== 'correct') gaps.push('HTTP status code usage is ' + httpStatusUsage + ' — should follow RFC standards')

  // Best practices followed
  const bestPracticesFollowed: string[] = []
  if (hasStandardFormat) bestPracticesFollowed.push('Standardized error format')
  if (errorCodesDoc) bestPracticesFollowed.push('Documented error codes')
  if (hasRetryHeaders) bestPracticesFollowed.push('Retry-After headers present')
  if (hasRateLimitHeaders) bestPracticesFollowed.push('Rate limit headers present')
  if (hasRecoveryGuides) bestPracticesFollowed.push('Error recovery guides available')
  if (consistentResponse) bestPracticesFollowed.push('Consistent error responses')
  if (httpStatusUsage === 'correct') bestPracticesFollowed.push('Correct HTTP status usage')

  // Remediation plan
  const remediationPlan: string[] = []
  if (!hasStandardFormat) remediationPlan.push('P0: Adopt RFC 7807 Problem Details for all error responses')
  if (!consistentResponse) remediationPlan.push('P0: Unify error response schema across all endpoints')
  if (httpStatusUsage !== 'correct') remediationPlan.push('P1: Fix HTTP status code usage per RFC 7231')
  if (!hasRetryHeaders) remediationPlan.push('P1: Add Retry-After header to 429 and 503 responses')
  if (!hasRateLimitHeaders) remediationPlan.push('P1: Implement X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset headers')
  if (!errorCodesDoc) remediationPlan.push('P2: Document all error codes with descriptions and fixes')
  if (!hasRecoveryGuides) remediationPlan.push('P2: Create error recovery playbook for developers')
  if (remediationPlan.length === 0) remediationPlan.push('Error handling maturity is excellent — maintain and audit quarterly')

  return {
    api_product: input.api_product,
    maturity_level: maturityLevel,
    maturity_score: maturityScore,
    covered_dimensions: coveredDimensions,
    total_dimensions: totalDimensions,
    gaps,
    best_practices_followed: bestPracticesFollowed,
    remediation_plan: remediationPlan,
  }
}

/** Format error handling assessment report */
function formatErrorHandlingReport(result: ErrorHandlingResult): string {
  const lines: string[] = []
  lines.push('# Error Handling Assessment: ' + result.api_product)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('- **Maturity Level:** ' + result.maturity_level.toUpperCase())
  lines.push('- **Maturity Score:** ' + result.maturity_score + '/100')
  lines.push('- **Dimensions Covered:** ' + result.covered_dimensions + '/' + result.total_dimensions)
  lines.push('')

  if (result.best_practices_followed.length > 0) {
    lines.push('## Best Practices Followed')
    lines.push('')
    for (const bp of result.best_practices_followed) {
      lines.push('- [x] ' + bp)
    }
    lines.push('')
  }

  if (result.gaps.length > 0) {
    lines.push('## Gaps Identified')
    lines.push('')
    for (const gap of result.gaps) {
      lines.push('- [] ' + gap)
    }
    lines.push('')
  }

  lines.push('## Remediation Plan')
  lines.push('')
  for (let i = 0; i < result.remediation_plan.length; i++) {
    lines.push((i + 1) + '. ' + result.remediation_plan[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | Error Handling Assessor')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 – Tool 8: Churn Prediction Signals
// ─────────────────────────────────────────────────────────────────────────────

/** Predict developer churn risk signals */
function predictChurn(input: ChurnPredictionInput): ChurnPredictionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const activeDevs = input.active_developers ?? rng.nextInt(500, 50000)
  const integrationDays = input.avg_integration_time_days ?? rng.nextInt(1, 30)
  const ticketVolume = input.support_ticket_volume ?? rng.nextInt(10, 500)
  const docFeedback = input.documentation_feedback_score ?? rng.nextInt(30, 90)
  const competitorMigration = input.competitor_migration_signals ?? rng.nextInt(0, 50)

  // Analyze monthly active trend
  const trend = input.monthly_active_trend ?? Array.from({ length: 6 }, () => rng.nextInt(-5, 10))
  const avgTrend = trend.reduce((s, v) => s + v, 0) / trend.length

  // Analyze SDK download trend
  const sdkTrend = input.sdk_download_trend ?? Array.from({ length: 6 }, () => rng.nextInt(-8, 12))
  const avgSdkTrend = sdkTrend.reduce((s, v) => s + v, 0) / sdkTrend.length

  // Build churn signals
  const signals: ChurnSignal[] = []

  // Integration time signal
  const integrationRisk = integrationDays > 14
  signals.push({
    signal: 'Integration Time',
    severity: integrationDays > 21 ? 'critical' : integrationDays > 14 ? 'high' : integrationDays > 7 ? 'medium' : 'low',
    current_value: integrationDays,
    threshold: 14,
    trend: integrationDays > 14 ? 'worsening' : 'stable',
    recommendation: integrationDays > 14 ? 'Reduce integration guided flow and add quickstart templates' : 'Integration time is healthy',
  })

  // Support ticket volume signal
  const ticketRisk = ticketVolume > 200
  signals.push({
    signal: 'Support Ticket Volume',
    severity: ticketVolume > 400 ? 'critical' : ticketVolume > 200 ? 'high' : ticketVolume > 100 ? 'medium' : 'low',
    current_value: ticketVolume,
    threshold: 200,
    trend: ticketVolume > 200 ? 'worsening' : 'stable',
    recommendation: ticketVolume > 200 ? 'Investigate top ticket categories — likely docs or API issues' : 'Ticket volume is manageable',
  })

  // Documentation feedback signal
  signals.push({
    signal: 'Documentation Feedback',
    severity: docFeedback < 40 ? 'high' : docFeedback < 60 ? 'medium' : docFeedback < 75 ? 'low' : 'low',
    current_value: docFeedback,
    threshold: 60,
    trend: docFeedback < 50 ? 'worsening' : 'improving',
    recommendation: docFeedback < 60 ? 'Prioritize documentation overhaul — developers struggling' : 'Documentation quality is satisfactory',
  })

  // Competitor migration signal
  signals.push({
    signal: 'Competitor Migration',
    severity: competitorMigration > 30 ? 'critical' : competitorMigration > 15 ? 'high' : competitorMigration > 5 ? 'medium' : 'low',
    current_value: competitorMigration,
    threshold: 15,
    trend: competitorMigration > 10 ? 'worsening' : 'stable',
    recommendation: competitorMigration > 15 ? 'Analyze competitor switching patterns — identify key differentiators' : 'No significant migration detected',
  })

  // Developer activity trend signal
  signals.push({
    signal: 'Developer Activity Trend',
    severity: avgTrend < -2 ? 'high' : avgTrend < 0 ? 'medium' : avgTrend < 3 ? 'low' : 'low',
    current_value: Math.round(avgTrend * 10) / 10,
    threshold: 0,
    trend: avgTrend < 0 ? 'worsening' : 'improving',
    recommendation: avgTrend < 0 ? 'Monthly active developers declining — investigate retention drivers' : 'Developer activity trending positively',
  })

  // SDK download trend signal
  signals.push({
    signal: 'SDK Download Trend',
    severity: avgSdkTrend < -3 ? 'high' : avgSdkTrend < 0 ? 'medium' : 'low',
    current_value: Math.round(avgSdkTrend * 10) / 10,
    threshold: 0,
    trend: avgSdkTrend < 0 ? 'worsening' : 'improving',
    recommendation: avgSdkTrend < 0 ? 'SDK downloads declining — review SDK quality and discoverability' : 'SDK adoption healthy',
  })

  // Calculate overall churn risk
  const criticalCount = signals.filter(s => s.severity === 'critical').length
  const highCount = signals.filter(s => s.severity === 'high').length
  const mediumCount = signals.filter(s => s.severity === 'medium').length

  let overallRisk: 'critical' | 'high' | 'moderate' | 'low'
  if (criticalCount > 0 || highCount >= 2) overallRisk = 'critical'
  else if (highCount === 1 || mediumCount >= 3) overallRisk = 'high'
  else if (mediumCount >= 1) overallRisk = 'moderate'
  else overallRisk = 'low'

  // Churn probability
  let churn30 = 5
  if (overallRisk === 'critical') churn30 = rng.nextInt(15, 30)
  else if (overallRisk === 'high') churn30 = rng.nextInt(8, 15)
  else if (overallRisk === 'moderate') churn30 = rng.nextInt(3, 8)
  else churn30 = rng.nextInt(1, 4)

  const churn90 = Math.min(80, Math.round(churn30 * 2.5 + rng.nextInt(-2, 5)))

  // At-risk developers
  const atRiskPct = overallRisk === 'critical' ? rng.nextFloat(15, 30) : overallRisk === 'high' ? rng.nextFloat(8, 15) : overallRisk === 'moderate' ? rng.nextFloat(3, 8) : rng.nextFloat(1, 3)
  const atRiskCount = Math.round(activeDevs * atRiskPct / 100)

  // Retention actions
  const retentionActions: string[] = []
  if (overallRisk === 'critical' || overallRisk === 'high') {
    retentionActions.push('P0: Launch developer satisfaction survey to identify top pain points')
    retentionActions.push('P0: Assign dedicated developer relations engineer to at-risk segment')
    retentionActions.push('P1: Create targeted win-back email campaign for inactive developers')
    retentionActions.push('P1: Prioritize fixes for issues raised in support tickets')
    retentionActions.push('P2: Offer office hours or 1:1 onboarding for struggling developers')
  } else if (overallRisk === 'moderate') {
    retentionActions.push('P1: Proactive outreach to developers with declining activity')
    retentionActions.push('P2: Update documentation based on common support themes')
    retentionActions.push('P2: Add more code examples for complex integration scenarios')
  } else {
    retentionActions.push('Continue monitoring — maintain current DX quality')
    retentionActions.push('Proactively gather NPS feedback quarterly')
  }

  // Health score (inverse of risk)
  const healthScore = Math.max(0, Math.min(100, 100 - churn90 * 1.5 - atRiskPct * 2))

  return {
    api_product: input.api_product,
    overall_churn_risk: overallRisk,
    churn_probability_30d: churn30,
    churn_probability_90d: churn90,
    signals,
    at_risk_developer_count: atRiskCount,
    retention_actions: retentionActions,
    health_score: Math.round(healthScore),
  }
}

/** Format churn prediction report */
function formatChurnPredictionReport(result: ChurnPredictionResult): string {
  const lines: string[] = []
  lines.push('# Churn Prediction Report: ' + result.api_product)
  lines.push('')
  lines.push('## Risk Summary')
  lines.push('')
  lines.push('- **Overall Churn Risk:** ' + result.overall_churn_risk.toUpperCase())
  lines.push('- **30-Day Churn Probability:** ' + result.churn_probability_30d + '%')
  lines.push('- **90-Day Churn Probability:** ' + result.churn_probability_90d + '%')
  lines.push('- **At-Risk Developers:** ' + result.at_risk_developer_count.toLocaleString())
  lines.push('- **Platform Health Score:** ' + result.health_score + '/100')
  lines.push('')
  lines.push('## Churn Signals')
  lines.push('')
  lines.push('| Signal | Severity | Current | Threshold | Trend | Recommendation |')
  lines.push('|--------|----------|---------|-----------|-------|----------------|')
  for (const signal of result.signals) {
    lines.push('| ' + signal.signal + ' | ' + signal.severity + ' | ' + signal.current_value + ' | ' + signal.threshold + ' | ' + signal.trend + ' | ' + signal.recommendation + ' |')
  }
  lines.push('')

  lines.push('## Retention Actions')
  lines.push('')
  for (let i = 0; i < result.retention_actions.length; i++) {
    lines.push((i + 1) + '. ' + result.retention_actions[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apidxoptimizer | Churn Prediction Signals')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 – Plugin Entry Point & Tool Registrations
// ─────────────────────────────────────────────────────────────────────────────

export const name = 'dsh-tool-apidxoptimizer'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // ── Tool 1: dx_score_calculator ─────────────────────────────────────────
  tools.register(defineTool({
    name: 'dx_score_calculator',
    description: 'Calculate Developer Experience (DX) score across 6 dimensions: performance, reliability, documentation, SDK quality, auth simplicity, and satisfaction. Returns overall score (0-100), letter grade, and actionable recommendations.',
    parameters: {
      dx_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: api_name (string), response_time_ms? (number), availability_pct? (number), documentation_completeness? (number), sdk_language_count? (number), auth_complexity? (\'low\'|\'medium\'|\'high\'), developer_satisfaction? (number)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { dx_input: string }) {
      const input: DxScoreInput = JSON.parse(args.dx_input)
      return formatDxScoreReport(calculateDxScore(input))
    },
  }))

  // ── Tool 2: sdk_usability_analyst ───────────────────────────────────────
  tools.register(defineTool({
    name: 'sdk_usability_analyst',
    description: 'Analyze SDK usability across 6 heuristic dimensions: installability, API discoverability, consistency, error recovery, type safety, and extensibility. Identifies issues and improvement priorities.',
    parameters: {
      sdk_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: sdk_name (string), languages (string[]), installation_steps? (number), has_type_definitions? (boolean), has_async_support? (boolean), retry_mechanism? (boolean), pagination_style? (\'offset\'|\'cursor\'|\'token\'|\'none\'), sample_count? (number)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sdk_input: string }) {
      const input: SdkUsabilityInput = JSON.parse(args.sdk_input)
      return formatSdkUsabilityReport(analyzeSdkUsability(input))
    },
  }))

  // ── Tool 3: developer_onboarding_optimizer ──────────────────────────────
  tools.register(defineTool({
    name: 'developer_onboarding_optimizer',
    description: 'Analyze and optimize the developer onboarding flow. Identifies gaps in quickstart, tutorials, sandbox, samples, and support. Predicts completion rate and estimates time-to-completion.',
    parameters: {
      onboarding_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: api_product (string), time_to_first_call_min? (number), quickstart_available? (boolean), interactive_tutorial? (boolean), sandbox_environment? (boolean), sample_apps_count? (number), support_channels? (string[])',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { onboarding_input: string }) {
      const input: OnboardingInput = JSON.parse(args.onboarding_input)
      return formatOnboardingReport(analyzeOnboarding(input))
    },
  }))

  // ── Tool 4: documentation_quality_grader ────────────────────────────────
  tools.register(defineTool({
    name: 'documentation_quality_grader',
    description: 'Grade API documentation quality across 6 dimensions: reference completeness, examples quality, error documentation, guides & tutorials, freshness, and searchability. Score 0-100 with improvement roadmap.',
    parameters: {
      doc_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: api_product (string), total_endpoints? (number), documented_endpoints? (number), has_examples? (boolean), has_error_catalog? (boolean), has_changelog? (boolean), has_guides? (boolean), search_functionality? (boolean), last_updated_days? (number)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { doc_input: string }) {
      const input: DocumentationInput = JSON.parse(args.doc_input)
      return formatDocumentationReport(gradeDocumentation(input))
    },
  }))

  // ── Tool 5: api_adoption_predictor ──────────────────────────────────────
  tools.register(defineTool({
    name: 'api_adoption_predictor',
    description: 'Predict API developer adoption over 12 months across 4 phases (Activation, Growth, Scaling, Maturity). Accounts for pricing, competition, documentation, and SDK factors.',
    parameters: {
      adoption_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: api_product (string), current_developers? (number), monthly_growth_rate? (number), industry_benchmark_growth? (number), pricing_tier? (\'free\'|\'freemium\'|\'paid\'|\'enterprise\'), market_segment? (string), competitor_count? (number), documentation_score? (number), sdk_language_count? (number)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { adoption_input: string }) {
      const input: AdoptionInput = JSON.parse(args.adoption_input)
      return formatAdoptionReport(predictAdoption(input))
    },
  }))

  // ── Tool 6: integration_time_finder ─────────────────────────────────────
  tools.register(defineTool({
    name: 'integration_time_finder',
    description: 'Estimate total developer integration time with 6-phase breakdown: setup, auth, endpoint integration, error handling, testing, and handoff. Accounts for experience level, API type, and tooling.',
    parameters: {
      integration_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: api_product (string), api_type? (\'rest\'|\'graphql\'|\'grpc\'|\'websocket\'), developer_experience_level? (\'junior\'|\'mid\'|\'senior\'), team_size? (number), endpoints_to_integrate? (number), has_sdk? (boolean), has_sandbox? (boolean), auth_type? (\'api_key\'|\'oauth2\'|\'jwt\'|\'m_TLS\')',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { integration_input: string }) {
      const input: IntegrationTimeInput = JSON.parse(args.integration_input)
      return formatIntegrationTimeReport(findIntegrationTime(input))
    },
  }))

  // ── Tool 7: error_handling_assessor ─────────────────────────────────────
  tools.register(defineTool({
    name: 'error_handling_assessor',
    description: 'Assess API error handling maturity across 7 dimensions: standard format, error codes, retry headers, rate limit headers, recovery guides, consistency, and HTTP status usage. Returns maturity level and remediation plan.',
    parameters: {
      error_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: api_product (string), has_standard_error_format? (boolean), error_codes_documented? (boolean), has_retry_headers? (boolean), has_rate_limit_headers? (boolean), has_error_recovery_guides? (boolean), consistent_error_response? (boolean), http_status_usage? (\'correct\'|\'partial\'|\'incorrect\')',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { error_input: string }) {
      const input: ErrorHandlingInput = JSON.parse(args.error_input)
      return formatErrorHandlingReport(assessErrorHandling(input))
    },
  }))

  // ── Tool 8: churn_prediction_signals ────────────────────────────────────
  tools.register(defineTool({
    name: 'churn_prediction_signals',
    description: 'Predict developer churn risk signals including integration time, ticket volume, documentation feedback, competitor migration, activity trends, and SDK downloads. Returns risk level and retention actions.',
    parameters: {
      churn_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: api_product (string), active_developers? (number), monthly_active_trend? (number[]), avg_integration_time_days? (number), support_ticket_volume? (number), sdk_download_trend? (number[]), documentation_feedback_score? (number), competitor_migration_signals? (number)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { churn_input: string }) {
      const input: ChurnPredictionInput = JSON.parse(args.churn_input)
      return formatChurnPredictionReport(predictChurn(input))
    },
  }))
}
