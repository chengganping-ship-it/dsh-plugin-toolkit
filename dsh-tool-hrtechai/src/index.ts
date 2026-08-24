/**
 * dsh-tool-hrtechai - HR Technology & People Analytics AI Agent Plugin for DSH
 *
 * Employee engagement analysis with sentiment scoring, performance management
 * optimization with calibration modeling, workforce planning forecasting with
 * scenario analysis, compensation & benefits analysis with market positioning,
 * talent acquisition scoring with multi-factor ranking, retention risk prediction
 * with flight-risk modeling, learning & development planning with skill gap analysis,
 * and DEI metrics tracking with representation analytics.
 *
 * @module dsh-tool-hrtechai | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 *
 * DISCLAIMER: This plugin provides algorithmic estimates for HR technology and
 * people analytics. All outputs are advisory only and do not constitute legal,
 * tax, or professional HR advice. Users should consult qualified HR professionals,
 * legal counsel, and compensated advisors before making employment decisions.
 * Market data and projections are simulated and should be validated against
 * actual organizational data and authoritative sources.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-hrtechai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ============================================================================
// SECTION 1 — Seeded Random (mulberry32 PRNG)
// ============================================================================

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

// ============================================================================
// SECTION 2 — TYPE DEFINITIONS
// ============================================================================

// --- Tool 1: Employee Engagement Analyst ---
export interface EngagementSurveyInput {
  department: string
  team: string
  respondents: Array<{
    employee_id: string
    engagement_score: number
    satisfaction_score: number
    recommend_score: number
    growth_score: number
    wellbeing_score: number
    tenure_months: number
    role_level: string
  }>
  period: string
  industry_benchmark?: number
}

export interface DimensionAvg {
  dimension: string
  average: number
  rating: string
}

export interface EngagementAnalysisResult {
  department: string
  team: string
  period: string
  overall_engagement_index: number
  response_count: number
  dimension_averages: DimensionAvg[]
  engagement_distribution: Record<string, number>
  risk_segments: Record<string, number>
  benchmark_comparison: string
  key_findings: string[]
  action_items: string[]
  disclaimer: string
}

// --- Tool 2: Performance Management Optimizer ---
export interface PerformanceReviewInput {
  review_cycle: string
  participants: Array<{
    employee_id: string
    department: string
    role_level: string
    goal_achievement_pct: number
    competency_rating: number
    peer_feedback_score: number
    manager_rating: number
    development_rating: number
  }>
  calibration_enabled: boolean
  target_distribution: Record<string, string>
}

export interface CalibrationGroup {
  role_level: string
  count: number
  avg_score: number
  recommended_distribution: Record<string, string>
}

export interface PerformanceReviewResult {
  review_cycle: string
  total_participants: number
  overall_avg_score: number
  rating_distribution: Record<string, number>
  calibration_groups: CalibrationGroup[]
  forced_rank_alignment: string
  high_performer_identification: string
  low_performer_flag_count: number
  recommendations: string[]
  disclaimer: string
}

// --- Tool 3: Workforce Planning Forecaster ---
export interface WorkforcePlanInput {
  organization: string
  current_headcount: number
  planning_horizon_years: number
  departments: Array<{
    name: string
    current_count: number
    growth_rate_pct: number
    attrition_rate_pct: number
    critical_roles: string[]
  }>
  scenarios: string[]
}

export interface DepartmentForecast {
  name: string
  current_count: number
  year_1_headcount: number
  year_2_headcount: number
  year_3_headcount: number
  hiring_need: number
  key_gaps: string[]
}

export interface WorkforcePlanResult {
  organization: string
  planning_horizon_years: number
  current_total_headcount: number
  forecasts: DepartmentForecast[]
  scenario_analysis: Record<string, number>
  strategic_recommendations: string[]
  risk_factors: string[]
  disclaimer: string
}

// --- Tool 4: Compensation & Benefits Analyst ---
export interface CompBenefitsInput {
  employee_id: string
  employee_name: string
  department: string
  role_title: string
  location: string
  years_experience: number
  base_salary: number
  bonus_target: number
  equity_value: number
  benefits_value: number
  currency: string
  company_size: 'startup' | 'mid' | 'large' | 'enterprise'
  market_percentile_reference?: number
}

export interface CompComponent {
  component: string
  employee_value: number
  market_median: number
  vs_market_pct: number
  status: string
}

export interface CompBenefitsResult {
  employee_id: string
  employee_name: string
  role_title: string
  location: string
  total_compensation: number
  comp_components: CompComponent[]
  market_positioning: string
  compa_ratio: number
  pay_equity_indicator: string
  recommendations: string[]
  disclaimer: string
}

// --- Tool 5: Talent Acquisition Scorer ---
export interface TalentAcquisitionInput {
  requisition_id: string
  role_title: string
  department: string
  seniority: string
  candidates: Array<{
    candidate_id: string
    name: string
    years_experience: number
    education_level: string
    technical_score: number
    cultural_fit_score: number
    leadership_score: number
    communication_score: number
    references_score: number
    salary_expectation: number
    availability_days: number
  }>
  salary_budget: number
  weights?: Record<string, number>
}

export interface CandidateScore {
  candidate_id: string
  name: string
  overall_score: number
  weighted_breakdown: Record<string, number>
  hire_recommendation: string
  salary_fit: string
  risk_flags: string[]
}

export interface TalentAcquisitionResult {
  requisition_id: string
  role_title: string
  department: string
  total_candidates: number
  scored_candidates: CandidateScore[]
  top_candidate: string
  budget_alignment: string
  diversity_recommendations: string[]
  process_optimizations: string[]
  disclaimer: string
}

// --- Tool 6: Retention Risk Predictor ---
export interface RetentionRiskInput {
  department: string
  period: string
  employees: Array<{
    employee_id: string
    name: string
    role_level: string
    tenure_months: number
    last_promotion_months: number
    engagement_trend: string
    salary_percentile: number
    commute_distance_km: number
    overtime_hours_monthly: number
    learning_hours_ytd: number
    manager_changes_ytd: number
    peer_turnover_pct: number
  }>
  industry_avg_turnover_pct?: number
}

export interface RiskProfile {
  employee_id: string
  name: string
  risk_score: number
  risk_category: string
  key_risk_factors: string[]
  protective_factors: string[]
  recommended_actions: string[]
}

export interface RetentionRiskResult {
  department: string
  period: string
  total_employees: number
  avg_risk_score: number
  risk_distribution: Record<string, number>
  high_risk_count: number
  risk_profiles: RiskProfile[]
  cost_of_turnover_estimate: string
  org_wide_recommendations: string[]
  disclaimer: string
}

// --- Tool 7: Learning & Development Planner ---
export interface LDPlannerInput {
  department: string
  target_role: string
  start_date: string
  duration_weeks: number
  participants: Array<{
    employee_id: string
    name: string
    current_skills: string[]
    target_skills: string[]
    skill_gap_severity: Record<string, number>
    learning_style: string
    availability_hours_weekly: number
  }>
  budget: number
  delivery_mode: string
}

export interface LearningModule {
  module_name: string
  skills_addressed: string[]
  duration_hours: number
  delivery_method: string
  priority: string
}

export interface LDPlannerResult {
  department: string
  target_role: string
  duration_weeks: number
  participant_count: number
  skill_gaps_addressed: string[]
  learning_modules: LearningModule[]
  total_learning_hours: number
  cost_per_participant: number
  roe_estimate: string
  timeline: string
  recommendations: string[]
  disclaimer: string
}

// --- Tool 8: DEI Metrics Tracker ---
export interface DEIMetricsInput {
  organization: string
  period: string
  total_workforce: number
  demographics: {
    gender: Record<string, number>
    ethnicity: Record<string, number>
    age_groups: Record<string, number>
    disability: Record<string, number>
    veteran: Record<string, number>
  }
  leadership_demographics: Record<string, Record<string, number>>
  hiring_data: Array<{
    department: string
    applicants: Record<string, number>
    hires: Record<string, number>
  }>
  equity_metrics: {
    pay_gap_gender_pct: number
    pay_gap_ethnicity_pct: number
    promotion_rate_ratio: number
    turnover_rate_ratio: number
  }
  engagement_by_group: Record<string, number>
}

export interface DEIGapMetric {
  metric: string
  current_value: number
  target_value: number
  gap: number
  trend: string
  priority: string
}

export interface DEIMetricsResult {
  organization: string
  period: string
  total_workforce: number
  diversity_index: number
  representation_summary: Record<string, string>
  inclusion_index: number
  equity_gap_analysis: DEIGapMetric[]
  hiring_funnel_analysis: Record<string, string>
  leadership_representation_gap: string
  recommendations: string[]
  action_plan: string[]
  disclaimer: string
}

// ============================================================================
// SECTION 3 — ANALYSIS FUNCTIONS
// ============================================================================

// ----- Tool 1: Employee Engagement Analyst -----
function analyzeEngagement(input: EngagementSurveyInput): EngagementAnalysisResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)
  const respondents = input.respondents
  const n = respondents.length

  if (n === 0) {
    return {
      department: input.department,
      team: input.team,
      period: input.period,
      overall_engagement_index: 0,
      response_count: 0,
      dimension_averages: [],
      engagement_distribution: {},
      risk_segments: {},
      benchmark_comparison: 'No data available',
      key_findings: ['No respondents — cannot perform engagement analysis'],
      action_items: ['Ensure survey is distributed and completed'],
      disclaimer: 'No survey data provided. Analysis cannot be performed on empty respondent sets.'
    }
  }

  // Compute dimension averages
  const dimensions = [
    { key: 'engagement_score', label: 'Engagement' },
    { key: 'satisfaction_score', label: 'Satisfaction' },
    { key: 'recommend_score', label: 'eNPS / Recommend' },
    { key: 'growth_score', label: 'Growth & Development' },
    { key: 'wellbeing_score', label: 'Wellbeing' }
  ]

  const dimAvgs: DimensionAvg[] = dimensions.map(d => {
    const avg = respondents.reduce((s, r) => s + (r as any)[d.key], 0) / n
    const rounded = Math.round(avg * 100) / 100
    let rating = 'Needs Attention'
    if (rounded >= 4.0) rating = 'Excellent'
    else if (rounded >= 3.5) rating = 'Good'
    else if (rounded >= 3.0) rating = 'Fair'
    else if (rounded >= 2.5) rating = 'Below Average'
    return { dimension: d.label, average: rounded, rating }
  })

  // Overall engagement index (weighted composite)
  const overall = Math.round(dimAvgs.reduce((s, d) => s + d.average, 0) / dimAvgs.length * 100) / 100

  // Engagement distribution
  const distribution: Record<string, number> = { highly_engaged: 0, engaged: 0, neutral: 0, disengaged: 0, highly_disengaged: 0 }
  respondents.forEach(r => {
    const avg = (r.engagement_score + r.satisfaction_score + r.recommend_score + r.growth_score + r.wellbeing_score) / 5
    if (avg >= 4.2) distribution.highly_engaged++
    else if (avg >= 3.5) distribution.engaged++
    else if (avg >= 2.8) distribution.neutral++
    else if (avg >= 2.0) distribution.disengaged++
    else distribution.highly_disengaged++
  })

  // Risk segments (tenure-based)
  const riskSegments: Record<string, number> = { new_hire_risk: 0, mid_tenure_risk: 0, long_tenure_risk: 0 }
  respondents.forEach(r => {
    const avg = (r.engagement_score + r.satisfaction_score) / 2
    if (avg < 3.0) {
      if (r.tenure_months <= 6) riskSegments.new_hire_risk++
      else if (r.tenure_months <= 24) riskSegments.mid_tenure_risk++
      else riskSegments.long_tenure_risk++
    }
  })

  // Benchmark comparison
  const benchmark = input.industry_benchmark || 3.4
  const diff = overall - benchmark
  let benchmarkComp = ''
  if (diff > 0.3) benchmarkComp = 'Significantly above industry benchmark (+' + diff.toFixed(2) + ')'
  else if (diff > 0.1) benchmarkComp = 'Above industry benchmark (+' + diff.toFixed(2) + ')'
  else if (diff > -0.1) benchmarkComp = 'At industry benchmark (' + diff.toFixed(2) + ')'
  else benchmarkComp = 'Below industry benchmark (' + diff.toFixed(2) + ') — ACTION REQUIRED'

  // Key findings
  const findings: string[] = []
  const weakestDim = dimAvgs.sort((a, b) => a.average - b.average)[0]
  findings.push('Lowest scoring dimension: ' + weakestDim.dimension + ' (' + weakestDim.average + '/5.0)')
  const pctDisengaged = ((distribution.disengaged + distribution.highly_disengaged) / n * 100).toFixed(1)
  findings.push(pctDisengaged + '% of respondents are disengaged or highly disengaged')
  if (riskSegments.new_hire_risk > 0) findings.push(riskSegments.new_hire_risk + ' new hires at risk — review onboarding program')
  if (riskSegments.long_tenure_risk > 0) findings.push(riskSegments.long_tenure_risk + ' long-tenure employees at risk — review career development')

  // Action items
  const actions: string[] = []
  actions.push('Address ' + weakestDim.dimension.toLowerCase() + ' through targeted interventions')
  if (distribution.highly_disengaged > 0) actions.push('Conduct stay interviews for highly disengaged employees')
  if (riskSegments.new_hire_risk > 0) actions.push('Strengthen onboarding and first-90-day experience')
  actions.push('Schedule quarterly pulse surveys to track progress')
  actions.push('Create engagement action plans for teams below 3.0 average')
  actions.push('Recognize and celebrate teams with engagement scores above 4.0')

  return {
    department: input.department,
    team: input.team,
    period: input.period,
    overall_engagement_index: overall,
    response_count: n,
    dimension_averages: dimAvgs,
    engagement_distribution: distribution,
    risk_segments: riskSegments,
    benchmark_comparison: benchmarkComp,
    key_findings: findings,
    action_items: actions,
    disclaimer: 'Engagement analysis is based on survey responses and modeled scoring. Results should be supplemented with qualitative feedback and one-on-one discussions for comprehensive understanding.'
  }
}

function formatEngagementReport(r: EngagementAnalysisResult): string {
  const lines: string[] = []
  lines.push('# Employee Engagement Analysis Report')
  lines.push('')
  lines.push('**Department:** ' + r.department + ' | **Team:** ' + r.team + ' | **Period:** ' + r.period)
  lines.push('**Overall Engagement Index:** ' + r.overall_engagement_index.toFixed(2) + '/5.0')
  lines.push('**Respondents:** ' + r.response_count)
  lines.push('**Benchmark Comparison:** ' + r.benchmark_comparison)
  lines.push('')

  lines.push('## Dimension Averages')
  lines.push('')
  for (const d of r.dimension_averages) {
    const barLen = Math.max(1, Math.round(d.average * 8))
    const bar = '\u2588'.repeat(barLen) + '\u2591'.repeat(40 - barLen)
    lines.push('- **' + d.dimension + '**: ' + d.average.toFixed(2) + '/5.0 [' + d.rating + ']')
    lines.push('  ' + bar)
  }
  lines.push('')

  lines.push('## Engagement Distribution')
  lines.push('')
  const total = r.response_count || 1
  const distLabels: Record<string, string> = {
    highly_engaged: 'Highly Engaged',
    engaged: 'Engaged',
    neutral: 'Neutral',
    disengaged: 'Disengaged',
    highly_disengaged: 'Highly Disengaged'
  }
  for (const key of Object.keys(distLabels)) {
    const count = (r.engagement_distribution as any)[key] || 0
    const pct = (count / total * 100).toFixed(1)
    lines.push('- ' + distLabels[key] + ': ' + count + ' (' + pct + '%)')
  }
  lines.push('')

  lines.push('## Key Findings')
  lines.push('')
  for (const f of r.key_findings) lines.push('- ' + f)
  lines.push('')

  lines.push('## Action Items')
  lines.push('')
  for (const a of r.action_items) lines.push('- ' + a)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ----- Tool 2: Performance Management Optimizer -----
function analyzePerformanceManagement(input: PerformanceReviewInput): PerformanceReviewResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)
  const participants = input.participants
  const n = participants.length

  if (n === 0) {
    return {
      review_cycle: input.review_cycle,
      total_participants: 0,
      overall_avg_score: 0,
      rating_distribution: {},
      calibration_groups: [],
      forced_rank_alignment: 'No data for alignment',
      high_performer_identification: 'No data available',
      low_performer_flag_count: 0,
      recommendations: ['Ensure all performance reviews are submitted'],
      disclaimer: 'No performance data provided. Analysis requires participant review data.'
    }
  }

  // Compute composite score for each participant
  participants.forEach(p => {
    ;(p as any)._composite = Math.round((
      p.goal_achievement_pct * 0.30 +
      p.competency_rating * 20 * 0.25 +
      p.peer_feedback_score * 20 * 0.15 +
      p.manager_rating * 20 * 0.20 +
      p.development_rating * 20 * 0.10
    ) * 100) / 100
  })

  const avgScore = Math.round(participants.reduce((s, p) => s + (p as any)._composite, 0) / n * 100) / 100

  // Rating distribution (standard 5-tier)
  const ratingDist: Record<string, number> = { exceptional: 0, exceeds: 0, meets: 0, partially_meets: 0, needs_improvement: 0 }
  participants.forEach(p => {
    const score = (p as any)._composite
    if (score >= 90) ratingDist.exceptional++
    else if (score >= 75) ratingDist.exceeds++
    else if (score >= 60) ratingDist.meets++
    else if (score >= 45) ratingDist.partially_meets++
    else ratingDist.needs_improvement++
  })

  // Calibration groups by role level
  const levels = [...new Set(participants.map(p => p.role_level))]
  const calGroups: CalibrationGroup[] = levels.map(level => {
    const members = participants.filter(p => p.role_level === level)
    const avgForLevel = Math.round(members.reduce((s, p) => s + (p as any)._composite, 0) / members.length * 100) / 100

    // Recommended distribution based on target_distribution or default
    const dist = input.calibration_enabled ? (input.target_distribution || {}) : {}
    const defaultDist = { exceptional: '5-10%', exceeds: '20-25%', meets: '40-50%', partially_meets: '15-20%', needs_improvement: '5-10%' }
    const merged = Object.assign({}, defaultDist, dist)

    return {
      role_level: level,
      count: members.length,
      avg_score: avgForLevel,
      recommended_distribution: merged
    }
  })

  // Forced rank alignment analysis
  let forcedRankAlign = 'Calibration '
  if (input.calibration_enabled) {
    const topTier = ((ratingDist.exceptional + ratingDist.exceeds) / n * 100).toFixed(1)
    forcedRankAlign = 'Calibration enabled. Top two tiers: ' + topTier + '% of participants. Review for normal distribution compliance.'
  } else {
    forcedRankAlign = 'Calibration not enabled. Recommend implementing forced distribution to ensure consistent rating standards across managers.'
    forcedRankAlign += ' Without calibration, ratings tend to inflate by 10-15%.'
  }

  // High performer identification
  const highPerfs = participants.filter(p => (p as any)._composite >= 90).map(p => p.employee_id)
  const highPerfIdent = highPerfs.length > 0
    ? highPerfs.length + ' exceptional performers identified (' + (highPerfs.length / n * 100).toFixed(1) + '%). Consider accelerated development planning.'
    : 'No exceptional performers identified. Review rating standards and goal difficulty.'

  // Low performer flag
  const lowPerfCount = ratingDist.needs_improvement

  const recommendations: string[] = []
  if (!input.calibration_enabled) recommendations.push('Implement calibration sessions to reduce rating inflation and ensure cross-manager consistency')
  recommendations.push('Increase weight of objective metrics (goal_achievement) in composite scoring')
  recommendations.push('Provide rater bias training for all managers conducting reviews')
  recommendations.push('Establish quarterly check-in cadence between formal reviews')
  if (ratingDist.needs_improvement > n * 0.15) recommendations.push('WARNING: >15% bottom-tier ratings suggest systemic issues — investigate management effectiveness')
  recommendations.push('Create individual development plans for all employees scoring below 60')
  recommendations.push('Link compensation decisions directly to calibrated performance ratings')

  return {
    review_cycle: input.review_cycle,
    total_participants: n,
    overall_avg_score: avgScore,
    rating_distribution: ratingDist,
    calibration_groups: calGroups,
    forced_rank_alignment: forcedRankAlign,
    high_performer_identification: highPerfIdent,
    low_performer_flag_count: lowPerfCount,
    recommendations,
    disclaimer: 'Performance review analysis is based on modeled scoring and statistical distributions. Calibration effectiveness depends on manager training and organizational culture. Results should be reviewed by HRBP before making talent decisions.'
  }
}

function formatPerformanceReport(r: PerformanceReviewResult): string {
  const lines: string[] = []
  lines.push('# Performance Management Optimization Report')
  lines.push('')
  lines.push('**Cycle:** ' + r.review_cycle)
  lines.push('**Participants:** ' + r.total_participants)
  lines.push('**Overall Average Score:** ' + r.overall_avg_score.toFixed(2))
  lines.push('')

  lines.push('## Rating Distribution')
  lines.push('')
  const labels: Record<string, string> = {
    exceptional: 'Exceptional (90-100)',
    exceeds: 'Exceeds Expectations (75-89)',
    meets: 'Meets Expectations (60-74)',
    partially_meets: 'Partially Meets (45-59)',
    needs_improvement: 'Needs Improvement (<45)'
  }
  for (const key of Object.keys(labels)) {
    const count = (r.rating_distribution as any)[key] || 0
    const pct = r.total_participants > 0 ? (count / r.total_participants * 100).toFixed(1) : '0.0'
    const barLen = r.total_participants > 0 ? Math.round(count / r.total_participants * 40) : 0
    const bar = '\u2588'.repeat(barLen) + '\u2591'.repeat(40 - barLen)
    lines.push('- ' + labels[key] + ': ' + count + ' (' + pct + '%)')
    lines.push('  ' + bar)
  }
  lines.push('')

  lines.push('## Calibration Analysis')
  lines.push('')
  lines.push('**Forced Rank Alignment:** ' + r.forced_rank_alignment)
  lines.push('')
  for (const g of r.calibration_groups) {
    lines.push('**' + g.role_level + '** (n=' + g.count + ', avg=' + g.avg_score.toFixed(2) + ')')
    for (const [tier, pct] of Object.entries(g.recommended_distribution)) {
      lines.push('  - ' + tier + ': ' + pct)
    }
  }
  lines.push('')

  lines.push('## High Performer Identification')
  lines.push('')
  lines.push(r.high_performer_identification)
  lines.push('')
  lines.push('**Low Performers Flagged:** ' + r.low_performer_flag_count)
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ----- Tool 3: Workforce Planning Forecaster -----
function analyzeWorkforcePlan(input: WorkforcePlanInput): WorkforcePlanResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)
  const depts = input.departments

  const forecasts: DepartmentForecast[] = depts.map(d => {
    const growthFactor = d.growth_rate_pct / 100
    const attritionFactor = d.attrition_rate_pct / 100

    // Year 1: apply growth and attrition
    let y1 = Math.round(d.current_count * (1 + growthFactor - attritionFactor))
    // Year 2: compound
    let y2 = Math.round(y1 * (1 + growthFactor * 0.9 - attritionFactor * 0.95))
    let y3 = 0
    if (input.planning_horizon_years >= 3) {
      y3 = Math.round(y2 * (1 + growthFactor * 0.8 - attritionFactor * 0.90))
    }

    // Hiring need = net change + backfill for attrition
    const totalNeed = Math.max(0, y1 - d.current_count + Math.round(d.current_count * attritionFactor))

    const gaps: string[] = []
    if (growthFactor > 0.15) gaps.push('High growth rate (' + d.growth_rate_pct + '%) requires significant talent acquisition investment')
    if (attritionFactor > 0.12) gaps.push('Elevated attrition (' + d.attrition_rate_pct + '%) threatens operational continuity')
    if (d.critical_roles.length > 3) gaps.push('Large number of critical roles (' + d.critical_roles.length + ') increases succession risk')
    if (y1 < d.current_count) gaps.push('Projected headcount decline may create capability gaps')
    gaps.push('Monitor market availability for: ' + d.critical_roles.slice(0, 3).join(', '))

    return {
      name: d.name,
      current_count: d.current_count,
      year_1_headcount: y1,
      year_2_headcount: y2,
      year_3_headcount: y3,
      hiring_need: totalNeed,
      key_gaps: gaps
    }
  })

  // Scenario analysis
  const scenarios = input.scenarios.length > 0 ? input.scenarios : ['base', 'optimistic', 'pessimistic']
  const scenarioResults: Record<string, number> = {}
  const baseTotal = forecasts.reduce((s, f) => s + f.year_1_headcount, 0)

  scenarios.forEach(s => {
    if (s === 'optimistic') {
      scenarioResults[s] = Math.round(baseTotal * (1 + rng.nextFloat(0.05, 0.12)))
    } else if (s === 'pessimistic') {
      scenarioResults[s] = Math.round(baseTotal * (1 - rng.nextFloat(0.05, 0.10)))
    } else {
      scenarioResults[s] = baseTotal
    }
  })

  const strategicRecs: string[] = []
  const totalNeed = forecasts.reduce((s, f) => s + f.hiring_need, 0)
  if (totalNeed > input.current_headcount * 0.2) {
    strategicRecs.push('High hiring need (' + totalNeed + ') — initiate early recruitment pipeline and employer branding')
  }
  strategicRecs.push('Build internal mobility program to reduce external hiring dependency')
  strategicRecs.push('Develop contingent workforce strategy for flexible capacity')
  strategicRecs.push('Implement workforce analytics dashboard for real-time headcount monitoring')
  strategicRecs.push('Conduct annual talent review with succession planning for all critical roles')
  strategicRecs.push('Model skill-based workforce architecture alongside traditional headcount planning')

  const riskFactors: string[] = []
  riskFactors.push('Economic downturn may reduce growth rates and alter hiring plans')
  riskFactors.push('Competitive talent market could increase time-to-fill and salary pressure')
  riskFactors.push('Regulatory changes may impact workforce composition requirements')
  if (forecasts.some(f => f.key_gaps.some(g => g.includes('High growth')))) {
    riskFactors.push('Rapid growth in select departments may strain onboarding capability')
  }

  return {
    organization: input.organization,
    planning_horizon_years: input.planning_horizon_years,
    current_total_headcount: input.current_headcount,
    forecasts,
    scenario_analysis: scenarioResults,
    strategic_recommendations: strategicRecs,
    risk_factors: riskFactors,
    disclaimer: 'Workforce projections are algorithmic forecasts based on growth rate and attrition assumptions. Actual headcount needs will vary based on business performance, market conditions, and strategic decisions. Update projections quarterly with actual data.'
  }
}

function formatWorkforcePlanReport(r: WorkforcePlanResult): string {
  const lines: string[] = []
  lines.push('# Workforce Planning Forecast')
  lines.push('')
  lines.push('**Organization:** ' + r.organization)
  lines.push('**Planning Horizon:** ' + r.planning_horizon_years + ' years')
  lines.push('**Current Total Headcount:** ' + r.current_total_headcount)
  lines.push('')

  lines.push('## Department Forecasts')
  lines.push('')
  lines.push('| Department | Current | Year 1 | Year 2 | Year 3 | Hiring Need |')
  lines.push('|------------|---------|--------|--------|--------|-------------|')
  for (const f of r.forecasts) {
    lines.push('| ' + f.name + ' | ' + f.current_count + ' | ' + f.year_1_headcount + ' | ' + f.year_2_headcount + ' | ' + (r.planning_horizon_years >= 3 ? f.year_3_headcount : 'N/A') + ' | ' + f.hiring_need + ' |')
  }
  lines.push('')

  lines.push('## Key Gaps by Department')
  lines.push('')
  for (const f of r.forecasts) {
    lines.push('**' + f.name + '**')
    for (const g of f.key_gaps) lines.push('- ' + g)
    lines.push('')
  }

  lines.push('## Scenario Analysis (Year 1 Headcount)')
  lines.push('')
  for (const [scenario, headcount] of Object.entries(r.scenario_analysis)) {
    const diff = headcount - r.current_total_headcount
    const sign = diff >= 0 ? '+' : ''
    lines.push('- **' + scenario.charAt(0).toUpperCase() + scenario.slice(1) + '**: ' + headcount + ' (' + sign + diff + ')')
  }
  lines.push('')

  lines.push('## Strategic Recommendations')
  lines.push('')
  for (const rec of r.strategic_recommendations) lines.push('- ' + rec)
  lines.push('')

  lines.push('## Risk Factors')
  lines.push('')
  for (const rf of r.risk_factors) lines.push('- ' + rf)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ----- Tool 4: Compensation & Benefits Analyst -----
function analyzeCompBenefits(input: CompBenefitsInput): CompBenefitsResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)

  const totalComp = input.base_salary + input.bonus_target + input.equity_value + input.benefits_value

  // Simulated market rates based on role, experience, location
  const locMultipliers: Record<string, number> = {
    'san francisco': 1.35, 'new york': 1.30, 'london': 1.20, 'singapore': 1.15,
    'tokyo': 1.12, 'shanghai': 1.10, 'beijing': 1.08, 'seattle': 1.18,
    'boston': 1.15, 'berlin': 1.05, 'paris': 1.06, 'default': 1.0
  }
  const sizeMultipliers: Record<string, number> = {
    startup: 0.90, mid: 0.97, large: 1.05, enterprise: 1.12
  }

  const locKey = input.location.toLowerCase()
  const locMult = locMultipliers[locKey] || locMultipliers['default']
  const sizeMult = sizeMultipliers[input.company_size]
  const expFactor = 0.75 + Math.min(input.years_experience, 25) / 10 * 0.5

  const marketBase = Math.round(85000 * expFactor * locMult * sizeMult * rng.nextFloat(0.92, 1.08))
  const marketBonus = Math.round(marketBase * 0.20 * rng.nextFloat(0.85, 1.15))
  const marketEquity = Math.round(marketBase * 0.15 * rng.nextFloat(0.70, 1.40))
  const marketBenefits = Math.round(marketBase * 0.12 * rng.nextFloat(0.90, 1.10))

  const mkPct = (employee: number, median: number): number => Math.round((employee / median - 1) * 1000) / 10
  const statusLabel = (pct: number): string => {
    if (pct > 10) return 'Above Market'
    if (pct > -10) return 'At Market'
    return 'Below Market'
  }

  const components: CompComponent[] = [
    { component: 'Base Salary', employee_value: input.base_salary, market_median: marketBase, vs_market_pct: mkPct(input.base_salary, marketBase), status: statusLabel(mkPct(input.base_salary, marketBase)) },
    { component: 'Bonus Target', employee_value: input.bonus_target, market_median: marketBonus, vs_market_pct: mkPct(input.bonus_target, marketBonus), status: statusLabel(mkPct(input.bonus_target, marketBonus)) },
    { component: 'Equity / LTI', employee_value: input.equity_value, market_median: marketEquity, vs_market_pct: mkPct(input.equity_value, marketEquity), status: statusLabel(mkPct(input.equity_value, marketEquity)) },
    { component: 'Benefits Value', employee_value: input.benefits_value, market_median: marketBenefits, vs_market_pct: mkPct(input.benefits_value, marketBenefits), status: statusLabel(mkPct(input.benefits_value, marketBenefits)) }
  ]

  const totalMarket = marketBase + marketBonus + marketEquity + marketBenefits
  const compaRatio = Math.round(input.base_salary / marketBase * 100) / 100

  let positioning = 'Competitiveness: '
  if (compaRatio > 1.10) positioning += 'Strongly above market (>110% compa-ratio)'
  else if (compaRatio > 0.95) positioning += 'Competitive (95-110% compa-ratio)'
  else if (compaRatio > 0.85) positioning += 'Moderately below market (85-95% compa-ratio)'
  else positioning += 'Significantly below market (<85% compa-ratio) — RETENTION RISK'

  // Pay equity indicator
  const refPct = input.market_percentile_reference || 50
  const equityInd = 'Positioned near ' + refPct + 'th percentile for ' + input.role_title + ' in ' + input.location

  const recommendations: string[] = []
  if (mkPct(input.base_salary, marketBase) < -10) {
    recommendations.push('Base salary is below market — consider market adjustment to reduce retention risk')
  }
  if (mkPct(input.equity_value, marketEquity) < -15) {
    recommendations.push('Equity component is below market — review LTI plan competitiveness')
  }
  if (compaRatio > 1.15) {
    recommendations.push('Above-market compensation — verify internal equity and performance differentiation')
  }
  recommendations.push('Conduct annual total compensation review against market benchmarks')
  recommendations.push('Develop communicate total rewards statement to enhance perceived value')

  return {
    employee_id: input.employee_id,
    employee_name: input.employee_name,
    role_title: input.role_title,
    location: input.location,
    total_compensation: totalComp,
    comp_components: components,
    market_positioning: positioning,
    compa_ratio: compaRatio,
    pay_equity_indicator: equityInd,
    recommendations,
    disclaimer: 'Compensation analysis uses simulated market data derived from role, location, experience, and company size parameters. Actual market rates vary by company, industry, and timing. Always validate with published salary surveys (e.g., Radford, Mercer, WTW) before making compensation decisions.'
  }
}

function formatCompBenefitsReport(r: CompBenefitsResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US')
  const lines: string[] = []
  lines.push('# Compensation & Benefits Analysis')
  lines.push('')
  lines.push('**Employee:** ' + r.employee_name + ' (ID: ' + r.employee_id + ')')
  lines.push('**Role:** ' + r.role_title + ' | **Location:** ' + r.location)
  lines.push('**Total Compensation:** ' + fmt(r.total_compensation))
  lines.push('**Compa-Ratio:** ' + r.compa_ratio.toFixed(2) + '/1.00')
  lines.push('**Market Positioning:** ' + r.market_positioning)
  lines.push('**Pay Equity:** ' + r.pay_equity_indicator)
  lines.push('')

  lines.push('## Compensation Components')
  lines.push('')
  lines.push('| Component | Employee | Market Median | vs Market | Status |')
  lines.push('|-----------|----------|---------------|-----------|--------|')
  for (const c of r.comp_components) {
    const sign = c.vs_market_pct >= 0 ? '+' : ''
    lines.push('| ' + c.component + ' | ' + fmt(c.employee_value) + ' | ' + fmt(c.market_median) + ' | ' + sign + c.vs_market_pct + '% | ' + c.status + ' |')
  }
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ----- Tool 5: Talent Acquisition Scorer -----
function analyzeTalentAcquisition(input: TalentAcquisitionInput): TalentAcquisitionResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)
  const candidates = input.candidates
  const n = candidates.length

  const weights = input.weights || {
    technical: 0.30,
    cultural_fit: 0.20,
    leadership: 0.20,
    communication: 0.15,
    references: 0.15
  }

  const scored: CandidateScore[] = candidates.map(c => {
    const breakdown: Record<string, number> = {
      technical: Math.round(c.technical_score * (weights.technical || 0.30) * 100) / 100,
      cultural_fit: Math.round(c.cultural_fit_score * (weights.cultural_fit || 0.20) * 100) / 100,
      leadership: Math.round(c.leadership_score * (weights.leadership || 0.20) * 100) / 100,
      communication: Math.round(c.communication_score * (weights.communication || 0.15) * 100) / 100,
      references: Math.round(c.references_score * (weights.references || 0.15) * 100) / 100
    }

    const overall = Math.round(
      c.technical_score * (weights.technical || 0.30) +
      c.cultural_fit_score * (weights.cultural_fit || 0.20) +
      c.leadership_score * (weights.leadership || 0.20) +
      c.communication_score * (weights.communication || 0.15) +
      c.references_score * (weights.references || 0.15) +
      (c.years_experience / 20) * 2 // small experience bonus
    * 100) / 100

    let hireRec = 'Reject'
    if (overall >= 4.0) hireRec = 'Strong Hire'
    else if (overall >= 3.5) hireRec = 'Hire'
    else if (overall >= 3.0) hireRec = 'Consider'

    const salaryFit = c.salary_expectation <= input.salary_budget
      ? 'Within budget'
      : (c.salary_expectation <= input.salary_budget * 1.10 ? 'Slightly above (+' + Math.round((c.salary_expectation / input.salary_budget - 1) * 100) + '%)' : 'Over budget')

    const risks: string[] = []
    if (c.technical_score < 3.0) risks.push('Technical skills gap')
    if (c.cultural_fit_score < 3.0) risks.push('Cultural fit concern')
    if (c.availability_days > 60) risks.push('Long notice period (' + c.availability_days + ' days)')
    if (c.references_score < 3.0) risks.push('Weak references')
    if (risks.length === 0) risks.push('No significant flags')

    return {
      candidate_id: c.candidate_id,
      name: c.name,
      overall_score: Math.min(5.0, overall),
      weighted_breakdown: breakdown,
      hire_recommendation: hireRec,
      salary_fit: salaryFit,
      risk_flags: risks
    }
  })

  // Sort by overall score descending
  scored.sort((a, b) => b.overall_score - a.overall_score)

  const topC = scored.length > 0 ? scored[0] : null

  const budgetAlignment = scored.filter(s => s.salary_fit === 'Within budget').length + ' of ' + n + ' candidates within salary budget'

  const diversityRecs: string[] = []
  diversityRecs.push('Ensure diverse interview panels to reduce unconscious bias')
  diversityRecs.push('Use structured interviews with standardized scoring for all candidates')
  diversityRecs.push('Review candidate pipeline diversity at top-of-funnel and at offer stage')
  diversityRecs.push('Partner with diverse professional organizations for broader sourcing')
  diversityRecs.push('Audit job descriptions for inclusive language using tools like Textio')

  const processOpts: string[] = []
  processOpts.push('Implement skills-based assessments early in the funnel to reduce time-to-screen')
  processOpts.push('Set SLA of 48 hours for initial candidate feedback after application')
  processOpts.push('Use take-home exercises instead of whiteboard interviews for technical roles')
  processOpts.push('Create candidate experience survey and track NPS throughout funnel')
  processOpts.push('Build talent pipeline through nurture campaigns for silver-medal candidates')

  return {
    requisition_id: input.requisition_id,
    role_title: input.role_title,
    department: input.department,
    total_candidates: n,
    scored_candidates: scored,
    top_candidate: topC ? topC.name + ' (Score: ' + topC.overall_score.toFixed(3) + ')' : 'No candidates',
    budget_alignment: budgetAlignment,
    diversity_recommendations: diversityRecs,
    process_optimizations: processOpts,
    disclaimer: 'Talent acquisition scoring is algorithmic and should supplement, not replace, human judgment in hiring decisions. Scoring weights and thresholds should be calibrated per role. All candidates deserve fair and equitable evaluation. Past performance predictions are not guarantees of future results.'
  }
}

function formatTalentAcquisitionReport(r: TalentAcquisitionResult): string {
  const lines: string[] = []
  lines.push('# Talent Acquisition Scoring Report')
  lines.push('')
  lines.push('**Requisition:** ' + r.requisition_id + ' | **Role:** ' + r.role_title + ' | **Department:** ' + r.department)
  lines.push('**Total Candidates:** ' + r.total_candidates)
  lines.push('**Budget Alignment:** ' + r.budget_alignment)
  lines.push('**Top Candidate:** ' + r.top_candidate)
  lines.push('')

  lines.push('## Ranked Candidate Scores')
  lines.push('')
  lines.push('| Rank | Candidate | Overall Score | Recommendation | Salary Fit |')
  lines.push('|------|-----------|---------------|----------------|------------|')
  r.scored_candidates.forEach((c, i) => {
    lines.push('| ' + (i + 1) + ' | ' + c.name + ' | ' + c.overall_score.toFixed(3) + '/5.0 | ' + c.hire_recommendation + ' | ' + c.salary_fit + ' |')
  })
  lines.push('')

  lines.push('## Top Candidate Details')
  lines.push('')
  if (r.scored_candidates.length > 0) {
    const top = r.scored_candidates[0]
    lines.push('**Name:** ' + top.name)
    lines.push('**Overall Score:** ' + top.overall_score.toFixed(3) + '/5.0')
    lines.push('**Recommendation:** ' + top.hire_recommendation)
    lines.push('**Score Breakdown:**')
    for (const [key, val] of Object.entries(top.weighted_breakdown)) {
      lines.push('  - ' + key + ': ' + val.toFixed(2))
    }
    lines.push('**Risk Flags:** ' + top.risk_flags.join('; '))
  }
  lines.push('')

  lines.push('## Diversity Recommendations')
  lines.push('')
  for (const d of r.diversity_recommendations) lines.push('- ' + d)
  lines.push('')

  lines.push('## Process Optimizations')
  lines.push('')
  for (const p of r.process_optimizations) lines.push('- ' + p)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ----- Tool 6: Retention Risk Predictor -----
function analyzeRetentionRisk(input: RetentionRiskInput): RetentionRiskResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)
  const employees = input.employees
  const n = employees.length

  const profiles: RiskProfile[] = employees.map(e => {
    // Base risk score calculation
    let riskScore = 0

    // Tenure-based risk
    if (e.tenure_months > 6 && e.tenure_months < 18) riskScore += 15 // early risk window
    if (e.tenure_months > 48 && e.tenure_months < 72) riskScore += 10 // mid-career restlessness

    // Promotion stagnation
    if (e.last_promotion_months > 24) riskScore += 20
    else if (e.last_promotion_months > 18) riskScore += 10

    // Engagement trend
    if (e.engagement_trend === 'declining') riskScore += 25
    else if (e.engagement_trend === 'flat') riskScore += 10

    // Salary percentile (lower = higher risk)
    if (e.salary_percentile < 25) riskScore += 20
    else if (e.salary_percentile < 50) riskScore += 10

    // Commute distance
    if (e.commute_distance_km > 40) riskScore += 8

    // Overwork
    if (e.overtime_hours_monthly > 20) riskScore += 15
    else if (e.overtime_hours_monthly > 10) riskScore += 5

    // Low L&D investment
    if (e.learning_hours_ytd < 20) riskScore += 10

    // Manager instability
    if (e.manager_changes_ytd > 1) riskScore += 12

    // Peer turnover
    if (e.peer_turnover_pct > 20) riskScore += 10

    // Add some randomness
    riskScore += Math.round(rng.nextFloat(-5, 5))
    riskScore = Math.max(0, Math.min(100, riskScore))

    let category = 'Low Risk'
    if (riskScore >= 70) category = 'Critical Risk'
    else if (riskScore >= 55) category = 'High Risk'
    else if (riskScore >= 40) category = 'Moderate Risk'

    const riskFactors: string[] = []
    if (e.last_promotion_months > 24) riskFactors.push('No promotion in ' + e.last_promotion_months + ' months')
    if (e.engagement_trend === 'declining') riskFactors.push('Declining engagement trend')
    if (e.salary_percentile < 30) riskFactors.push('Salary below 30th percentile')
    if (e.overtime_hours_monthly > 15) riskFactors.push('High overtime (' + e.overtime_hours_monthly + ' hrs/month)')
    if (e.manager_changes_ytd > 1) riskFactors.push('Multiple manager changes')
    if (e.learning_hours_ytd < 20) riskFactors.push('Low L&D investment (' + e.learning_hours_ytd + ' hrs YTD)')
    if (riskFactors.length === 0) riskFactors.push('No critical factors identified')

    const protective: string[] = []
    if (e.salary_percentile >= 50) protective.push('Market-competitive salary')
    if (e.engagement_trend === 'improving') protective.push('Improving engagement trend')
    if (e.learning_hours_ytd >= 40) protective.push('Strong L&D engagement')
    if (e.tenure_months > 36) protective.push('Established tenure')
    if (protective.length === 0) protective.push('Limited protective factors')

    const actions: string[] = []
    if (riskScore >= 55) actions.push('Schedule stay interview within 2 weeks')
    if (e.salary_percentile < 30) actions.push('Review and adjust compensation to market rate')
    if (e.last_promotion_months > 24) actions.push('Discuss career progression and lateral move opportunities')
    if (e.overtime_hours_monthly > 15) actions.push('Redistribute workload and assess resourcing')
    if (e.engagement_trend === 'declining') actions.push('Enable manager to conduct deeper engagement conversation')
    actions.push('Assign mentor or coach for continued development')

    return {
      employee_id: e.employee_id,
      name: e.name,
      risk_score: riskScore,
      risk_category: category,
      key_risk_factors: riskFactors,
      protective_factors: protective,
      recommended_actions: actions
    }
  })

  const avgRisk = Math.round(profiles.reduce((s, p) => s + p.risk_score, 0) / (profiles.length || 1))

  const riskDist: Record<string, number> = { critical: 0, high: 0, moderate: 0, low: 0 }
  profiles.forEach(p => {
    if (p.risk_category === 'Critical Risk') riskDist.critical++
    else if (p.risk_category === 'High Risk') riskDist.high++
    else if (p.risk_category === 'Moderate Risk') riskDist.moderate++
    else riskDist.low++
  })

  const highRiskCount = riskDist.critical + riskDist.high

  // Cost estimate
  const avgReplacementCost = 75000 // average per employee
  const highRiskEmployees = profiles.filter(p => p.risk_score >= 55).length
  const costEstimate = '$' + (highRiskEmployees * avgReplacementCost).toLocaleString('en-US')

  const orgRecs: string[] = []
  orgRecs.push('Implement organization-wide stay interview program')
  orgRecs.push('Create transparent career pathways and promotion criteria')
  orgRecs.push('Conduct pay equity audit to address below-market compensation')
  orgRecs.push('Deploy manager training on recognizing early warning signs of disengagement')
  orgRecs.push('Build predictive retention dashboard updated monthly')
  orgRecs.push('Establish "flight risk" intervention protocol with HRBP support')

  return {
    department: input.department,
    period: input.period,
    total_employees: n,
    avg_risk_score: avgRisk,
    risk_distribution: riskDist,
    high_risk_count: highRiskCount,
    risk_profiles: profiles,
    cost_of_turnover_estimate: costEstimate,
    org_wide_recommendations: orgRecs,
    disclaimer: 'Retention risk predictions are algorithmic models based on observable patterns and should not be used as the sole basis for employment decisions. Many factors influencing turnover are qualitative and interpersonal. Managers should use these insights to inform, not replace, genuine conversations with employees about their career satisfaction and development.'
  }
}

function formatRetentionRiskReport(r: RetentionRiskResult): string {
  const lines: string[] = []
  lines.push('# Retention Risk Analysis')
  lines.push('')
  lines.push('**Department:** ' + r.department + ' | **Period:** ' + r.period)
  lines.push('**Total Employees:** ' + r.total_employees)
  lines.push('**Average Risk Score:** ' + r.avg_risk_score + '/100')
  lines.push('**High Risk Count:** ' + r.high_risk_count + '/' + r.total_employees)
  lines.push('**Estimated Turnover Cost:** ' + r.cost_of_turnover_estimate)
  lines.push('')

  lines.push('## Risk Distribution')
  lines.push('')
  for (const [cat, count] of Object.entries(r.risk_distribution)) {
    const pct = r.total_employees > 0 ? (count / r.total_employees * 100).toFixed(1) : '0.0'
    lines.push('- **' + cat.charAt(0).toUpperCase() + cat.slice(1) + '**: ' + count + ' (' + pct + '%)')
  }
  lines.push('')

  lines.push('## High Risk Profiles')
  lines.push('')
  const highRisk = r.risk_profiles.filter(p => p.risk_score >= 55).sort((a, b) => b.risk_score - a.risk_score)
  for (const p of highRisk.slice(0, 10)) {
    lines.push('### ' + p.name + ' (Score: ' + p.risk_score + ' — ' + p.risk_category + ')')
    lines.push('Risk Factors: ' + p.key_risk_factors.join('; '))
    lines.push('Protective Factors: ' + p.protective_factors.join('; '))
    lines.push('Actions:')
    for (const a of p.recommended_actions) lines.push('  - ' + a)
    lines.push('')
  }

  lines.push('## Organizational Recommendations')
  lines.push('')
  for (const rec of r.org_wide_recommendations) lines.push('- ' + rec)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ----- Tool 7: Learning & Development Planner -----
function analyzeLDPlanning(input: LDPlannerInput): LDPlannerResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)
  const participants = input.participants
  const n = participants.length

  // Identify all unique skill gaps
  const allGaps = new Set<string>()
  participants.forEach(p => {
    p.target_skills.forEach(s => {
      if (!p.current_skills.includes(s)) allGaps.add(s)
    })
  })
  const gapsList = Array.from(allGaps)

  // Create learning modules based on skill gaps
  const modules: LearningModule[] = gapsList.slice(0, 8).map(skill => {
    const severityVals = participants
      .filter(p => !p.current_skills.includes(skill))
      .map(p => (p.skill_gap_severity as any)[skill] || 3)
    const avgSeverity = severityVals.length > 0 ? severityVals.reduce((s, v) => s + v, 0) / severityVals.length : 3

    let priority = 'Medium'
    if (avgSeverity >= 4) priority = 'Critical'
    else if (avgSeverity >= 3) priority = 'High'
    else if (avgSeverity <= 2) priority = 'Low'

    let method = 'Self-paced e-learning'
    if (input.delivery_mode === 'instructor_led') method = 'Instructor-led workshop'
    else if (input.delivery_mode === 'blended') {
      method = avgSeverity >= 4 ? 'Instructor-led workshop' : 'Blended: e-learning + mentoring'
    } else if (input.delivery_mode === 'mentoring') method = 'Peer mentoring circle'

    const duration = Math.max(4, Math.round(avgSeverity * 4 + rng.nextFloat(-2, 4)))

    return {
      module_name: 'Mastering ' + skill,
      skills_addressed: [skill],
      duration_hours: duration,
      delivery_method: method,
      priority
    }
  })

  const totalHours = modules.reduce((s, m) => s + m.duration_hours, 0)
  const costPerParticipant = Math.round(input.budget / (n || 1))

  const roeEst = input.budget > 0
    ? 'Estimated 3.5-5x ROI based on improved productivity and reduced turnover (estimated value: $' + Math.round(input.budget * 4).toLocaleString('en-US') + ')'
    : 'No budget provided — ROI cannot be calculated'

  const timeline = 'Program: ' + input.start_date + ' | Duration: ' + input.duration_weeks + ' weeks | ' + modules.length + ' modules'

  const recommendations: string[] = []
  recommendations.push('Begin with critical priority modules in first 2 weeks')
  recommendations.push('Implement pre-assessment to calibrate learning paths per participant')
  recommendations.push('Schedule mid-program review at week ' + Math.round(input.duration_weeks / 2))
  recommendations.push('Assign learning buddies for peer accountability')
  recommendations.push('Track skill application on-the-job within 30 days post-training')
  recommendations.push('Measure program effectiveness with Level 3 (behavior) and Level 4 (results) Kirkpatrick evaluation')

  return {
    department: input.department,
    target_role: input.target_role,
    duration_weeks: input.duration_weeks,
    participant_count: n,
    skill_gaps_addressed: gapsList,
    learning_modules: modules,
    total_learning_hours: totalHours,
    cost_per_participant: costPerParticipant,
    roe_estimate: roeEst,
    timeline,
    recommendations,
    disclaimer: 'Learning & development planning is estimated based on skill gap analysis and delivery mode parameters. Actual program design should incorporate participant feedback, manager input, and organizational priorities. ROI projections are modeled estimates and actual returns will vary based on program quality and post-training support.'
  }
}

function formatLDPlannerReport(r: LDPlannerResult): string {
  const lines: string[] = []
  lines.push('# Learning & Development Plan')
  lines.push('')
  lines.push('**Department:** ' + r.department + ' | **Target Role:** ' + r.target_role)
  lines.push('**Participants:** ' + r.participant_count + ' | **Duration:** ' + r.duration_weeks + ' weeks')
  lines.push('**Total Learning Hours:** ' + r.total_learning_hours)
  lines.push('**Cost Per Participant:** $' + r.cost_per_participant.toLocaleString('en-US'))
  lines.push('**Timeline:** ' + r.timeline)
  lines.push('**Estimated ROE:** ' + r.roe_estimate)
  lines.push('')

  lines.push('## Skill Gaps Addressed')
  lines.push('')
  for (const gap of r.skill_gaps_addressed) lines.push('- ' + gap)
  lines.push('')

  lines.push('## Learning Modules')
  lines.push('')
  lines.push('| Module | Skills | Hours | Method | Priority |')
  lines.push('|--------|--------|-------|--------|----------|')
  for (const m of r.learning_modules) {
    lines.push('| ' + m.module_name + ' | ' + m.skills_addressed.join(', ') + ' | ' + m.duration_hours + 'h | ' + m.delivery_method + ' | ' + m.priority + ' |')
  }
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ----- Tool 8: DEI Metrics Tracker -----
function analyzeDEIMetrics(input: DEIMetricsInput): DEIMetricsResult {
  const seed = SeededRandom.seedFromString(JSON.stringify(input))
  const rng = new SeededRandom(seed)

  // Diversity index (Simpson's Diversity Index adapted)
  const genderTotal = Object.values(input.demographics.gender).reduce((s, v) => s + v, 0)
  const genderProps = Object.values(input.demographics.gender).map(v => v / (genderTotal || 1))
  let genderDI = 1 - genderProps.reduce((s, p) => s + p * p, 0)
  genderDI = Math.round(genderDI * 100) / 100

  const ethnicityTotal = Object.values(input.demographics.ethnicity).reduce((s, v) => s + v, 0)
  const ethnicityProps = Object.values(input.demographics.ethnicity).map(v => v / (ethnicityTotal || 1))
  const ethnicityDI = Math.round((1 - ethnicityProps.reduce((s, p) => s + p * p, 0)) * 100) / 100

  const diversityIndex = Math.round((genderDI + ethnicityDI) / 2 * 100) / 100

  // Representation summary
  const repSummary: Record<string, string> = {}
  const total = input.total_workforce || 1

  for (const [group, count] of Object.entries(input.demographics.gender)) {
    repSummary['Gender: ' + group] = count + ' (' + (count / total * 100).toFixed(1) + '%)'
  }
  for (const [group, count] of Object.entries(input.demographics.ethnicity)) {
    repSummary['Ethnicity: ' + group] = count + ' (' + (count / total * 100).toFixed(1) + '%)'
  }

  // Inclusion index (from engagement by group variance)
  const engagementVals = Object.values(input.engagement_by_group)
  const engMean = engagementVals.reduce((s, v) => s + v, 0) / (engagementVals.length || 1)
  const engVariance = engagementVals.reduce((s, v) => s + Math.pow(v - engMean, 2), 0) / (engagementVals.length || 1)
  const inclusionIndex = Math.round(Math.max(0, 100 - engVariance * 10) * 100) / 100

  // Equity gap analysis
  const gapMetrics: DEIGapMetric[] = [
    {
      metric: 'Gender Pay Gap',
      current_value: input.equity_metrics.pay_gap_gender_pct,
      target_value: 0,
      gap: input.equity_metrics.pay_gap_gender_pct,
      trend: input.equity_metrics.pay_gap_gender_pct > 5 ? 'Needs Improvement' : input.equity_metrics.pay_gap_gender_pct > 2 ? 'Progressing' : 'On Track',
      priority: input.equity_metrics.pay_gap_gender_pct > 8 ? 'Critical' : input.equity_metrics.pay_gap_gender_pct > 4 ? 'High' : 'Medium'
    },
    {
      metric: 'Ethnicity Pay Gap',
      current_value: input.equity_metrics.pay_gap_ethnicity_pct,
      target_value: 0,
      gap: input.equity_metrics.pay_gap_ethnicity_pct,
      trend: input.equity_metrics.pay_gap_ethnicity_pct > 7 ? 'Needs Improvement' : input.equity_metrics.pay_gap_ethnicity_pct > 3 ? 'Progressing' : 'On Track',
      priority: input.equity_metrics.pay_gap_ethnicity_pct > 10 ? 'Critical' : input.equity_metrics.pay_gap_ethnicity_pct > 5 ? 'High' : 'Medium'
    },
    {
      metric: 'Promotion Rate Ratio (Underrepresented / Majority)',
      current_value: input.equity_metrics.promotion_rate_ratio,
      target_value: 1.0,
      gap: Math.abs(input.equity_metrics.promotion_rate_ratio - 1.0),
      trend: input.equity_metrics.promotion_rate_ratio < 0.8 ? 'Needs Improvement' : input.equity_metrics.promotion_rate_ratio < 0.95 ? 'Progressing' : 'On Track',
      priority: input.equity_metrics.promotion_rate_ratio < 0.7 ? 'Critical' : input.equity_metrics.promotion_rate_ratio < 0.9 ? 'High' : 'Low'
    },
    {
      metric: 'Turnover Rate Ratio (Underrepresented / Majority)',
      current_value: input.equity_metrics.turnover_rate_ratio,
      target_value: 1.0,
      gap: Math.abs(input.equity_metrics.turnover_rate_ratio - 1.0),
      trend: input.equity_metrics.turnover_rate_ratio > 1.2 ? 'Needs Improvement' : input.equity_metrics.turnover_rate_ratio > 1.05 ? 'Progressing' : 'On Track',
      priority: input.equity_metrics.turnover_rate_ratio > 1.5 ? 'Critical' : input.equity_metrics.turnover_rate_ratio > 1.2 ? 'High' : 'Medium'
    }
  ]

  // Hiring funnel analysis
  const funnel: Record<string, string> = {}
  input.hiring_data.forEach(h => {
    const totalApps = Object.values(h.applicants).reduce((s, v) => s + v, 0)
    const totalHires = Object.values(h.hires).reduce((s, v) => s + v, 0)
    const conversionRate = totalApps > 0 ? (totalHires / totalApps * 100).toFixed(1) : 'N/A'
    funnel[h.department] = totalApps + ' applicants -> ' + totalHires + ' hires (' + conversionRate + '% conversion)'
  })

  // Leadership representation gap
  const leadGaps: string[] = []
  for (const [level, demo] of Object.entries(input.leadership_demographics)) {
    const levelTotal = Object.values(demo).reduce((s, v) => s + v, 0)
    for (const [group, count] of Object.entries(demo)) {
      const repPct = count / (levelTotal || 1) * 100
      const overallPct = (input.demographics.ethnicity[group] || 0) / total * 100
      if (repPct < overallPct - 10) {
        leadGaps.push(group + ' underrepresented in ' + level + ' (' + repPct.toFixed(1) + '% vs ' + overallPct.toFixed(1) + '% overall)')
      }
    }
  }
  const leadGapSummary = leadGaps.length > 0
    ? leadGaps.slice(0, 5).join('; ')
    : 'No significant leadership representation gaps detected'

  const recommendations: string[] = []
  if (input.equity_metrics.pay_gap_gender_pct > 5) recommendations.push('Conduct comprehensive pay equity audit with regression analysis and remediation plan')
  if (input.equity_metrics.pay_gap_ethnicity_pct > 5) recommendations.push('Establish ethnicity pay gap monitoring and corrective action framework')
  recommendations.push('Implement diverse slate policy requiring at least 2 qualified underrepresented candidates for all roles')
  recommendations.push('Create sponsorship program for high-potential employees from underrepresented groups')
  recommendations.push('Set representation targets aligned with available labor market and track quarterly')
  recommendations.push('Integrate DEI metrics into manager performance scorecards')

  const actionPlan: string[] = []
  actionPlan.push('Quarterly pay equity audit with statistical analysis and reporting to CHRO')
  actionPlan.push('Annual diversity hiring summit with talent acquisition and hiring managers')
  actionPlan.push('Establish DEI dashboard with real-time metrics accessible to all senior leaders')
  actionPlan.push('Launch mentoring circles pairing senior leaders with emerging diverse talent')
  actionPlan.push('Review all job postings for inclusive language and barrier-free requirements')
  actionPlan.push('Publish annual transparency report on DEI progress and areas for improvement')

  return {
    organization: input.organization,
    period: input.period,
    total_workforce: input.total_workforce,
    diversity_index: diversityIndex,
    representation_summary: repSummary,
    inclusion_index: inclusionIndex,
    equity_gap_analysis: gapMetrics,
    hiring_funnel_analysis: funnel,
    leadership_representation_gap: leadGapSummary,
    recommendations,
    action_plan: actionPlan,
    disclaimer: 'DEI metrics tracking uses modeled calculations and simulated data where indicated. Real-world measurement requires comprehensive data infrastructure, validated surveys, and careful interpretation within local legal and cultural contexts. DEI is both a business imperative and a moral commitment — metrics should inform action, not replace genuine inclusion efforts.'
  }
}

function formatDEIMetricsReport(r: DEIMetricsResult): string {
  const lines: string[] = []
  lines.push('# DEI Metrics Tracking Report')
  lines.push('')
  lines.push('**Organization:** ' + r.organization + ' | **Period:** ' + r.period)
  lines.push('**Total Workforce:** ' + r.total_workforce)
  lines.push('**Diversity Index:** ' + r.diversity_index.toFixed(2) + ' (0=homogeneous, 1=highly diverse)')
  lines.push('**Inclusion Index:** ' + r.inclusion_index.toFixed(2) + '/100')
  lines.push('')

  lines.push('## Representation Summary')
  lines.push('')
  for (const [group, detail] of Object.entries(r.representation_summary)) {
    lines.push('- **' + group + '**: ' + detail)
  }
  lines.push('')

  lines.push('## Equity Gap Analysis')
  lines.push('')
  lines.push('| Metric | Current | Target | Gap | Trend | Priority |')
  lines.push('|---------|---------|--------|-----|-------|----------|')
  for (const g of r.equity_gap_analysis) {
    const current = g.current_value % 1 === 0 ? g.current_value.toString() : g.current_value.toFixed(2)
    const target = g.target_value % 1 === 0 ? g.target_value.toString() : g.target_value.toFixed(2)
    const gap = g.gap % 1 === 0 ? g.gap.toFixed(1) : g.gap.toFixed(2)
    lines.push('| ' + g.metric + ' | ' + current + ' | ' + target + ' | ' + gap + ' | ' + g.trend + ' | ' + g.priority + ' |')
  }
  lines.push('')

  lines.push('## Hiring Funnel Analysis')
  lines.push('')
  for (const [dept, funnel] of Object.entries(r.hiring_funnel_analysis)) {
    lines.push('- **' + dept + '**: ' + funnel)
  }
  lines.push('')

  lines.push('## Leadership Representation Gap')
  lines.push('')
  lines.push(r.leadership_representation_gap)
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')

  lines.push('## Action Plan')
  lines.push('')
  for (const a of r.action_plan) lines.push('- ' + a)
  lines.push('')

  lines.push('---')
  lines.push('*Disclaimer: ' + r.disclaimer + '*')
  return lines.join('\n')
}

// ============================================================================
// SECTION 4 — PLUGIN DEFINITION
// ============================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: employee_engagement_analyst
  tools.register(defineTool({
    name: 'employee_engagement_analyst',
    description: 'Analyze employee engagement survey data with dimension scoring, engagement distribution, benchmark comparison, risk segmentation, and actionable recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: department (string), team (string), respondents (array of employee_id, engagement_score, satisfaction_score, recommend_score, growth_score, wellbeing_score, tenure_months, role_level), period (string), industry_benchmark (optional number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: EngagementSurveyInput = JSON.parse(args.input_data)
      const result = analyzeEngagement(data)
      return formatEngagementReport(result)
    }
  }))

  // Tool 2: performance_management_optimizer
  tools.register(defineTool({
    name: 'performance_management_optimizer',
    description: 'Optimize performance review cycles with multi-source scoring, calibration modeling, forced distribution analysis, high performer identification, and rater bias detection.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: review_cycle (string), participants (array of employee_id, department, role_level, goal_achievement_pct, competency_rating, peer_feedback_score, manager_rating, development_rating), calibration_enabled (boolean), target_distribution (optional Record<string, string>)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: PerformanceReviewInput = JSON.parse(args.input_data)
      const result = analyzePerformanceManagement(data)
      return formatPerformanceReport(result)
    }
  }))

  // Tool 3: workforce_planning_forecaster
  tools.register(defineTool({
    name: 'workforce_planning_forecaster',
    description: 'Forecast workforce headcount needs with multi-year projections, department-level analysis, scenario modeling (optimistic/pessimistic), hiring gap identification, and strategic workforce recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: organization (string), current_headcount (number), planning_horizon_years (number), departments (array of name, current_count, growth_rate_pct, attrition_rate_pct, critical_roles), scenarios (string[])'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: WorkforcePlanInput = JSON.parse(args.input_data)
      const result = analyzeWorkforcePlan(data)
      return formatWorkforcePlanReport(result)
    }
  }))

  // Tool 4: compensation_benefits_analyst
  tools.register(defineTool({
    name: 'compensation_benefits_analyst',
    description: 'Analyze total compensation competitiveness with market benchmarking by component (base, bonus, equity, benefits), compa-ratio calculation, pay equity indicators, and compensation recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: employee_id, employee_name, department, role_title, location, years_experience, base_salary, bonus_target, equity_value, benefits_value, currency, company_size (startup|mid|large|enterprise), market_percentile_reference (optional number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: CompBenefitsInput = JSON.parse(args.input_data)
      const result = analyzeCompBenefits(data)
      return formatCompBenefitsReport(result)
    }
  }))

  // Tool 5: talent_acquisition_scorer
  tools.register(defineTool({
    name: 'talent_acquisition_scorer',
    description: 'Score and rank job candidates using multi-factor weighted scoring (technical, cultural fit, leadership, communication, references), salary fit analysis, and bias-aware hiring recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: requisition_id, role_title, department, seniority, candidates (array of candidate_id, name, years_experience, education_level, technical_score, cultural_fit_score, leadership_score, communication_score, references_score, salary_expectation, availability_days), salary_budget, weights (optional Record<string, number>)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: TalentAcquisitionInput = JSON.parse(args.input_data)
      const result = analyzeTalentAcquisition(data)
      return formatTalentAcquisitionReport(result)
    }
  }))

  // Tool 6: retention_risk_predictor
  tools.register(defineTool({
    name: 'retention_risk_predictor',
    description: 'Predict employee flight risk using tenure, promotion stagnation, engagement trends, salary competitiveness, overtime, L&D investment, manager stability, and peer turnover analysis with actionable intervention strategies.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: department, period, employees (array of employee_id, name, role_level, tenure_months, last_promotion_months, engagement_trend, salary_percentile, commute_distance_km, overtime_hours_monthly, learning_hours_ytd, manager_changes_ytd, peer_turnover_pct), industry_avg_turnover_pct (optional number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: RetentionRiskInput = JSON.parse(args.input_data)
      const result = analyzeRetentionRisk(data)
      return formatRetentionRiskReport(result)
    }
  }))

  // Tool 7: learning_development_planner
  tools.register(defineTool({
    name: 'learning_development_planner',
    description: 'Plan learning & development programs with skill gap analysis, module design, delivery method optimization, scheduling, budget allocation, and return-on-education estimation.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: department, target_role, start_date, duration_weeks, participants (array of employee_id, name, current_skills, target_skills, skill_gap_severity, learning_style, availability_hours_weekly), budget, delivery_mode'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: LDPlannerInput = JSON.parse(args.input_data)
      const result = analyzeLDPlanning(data)
      return formatLDPlannerReport(result)
    }
  }))

  // Tool 8: dei_metrics_tracker
  tools.register(defineTool({
    name: 'dei_metrics_tracker',
    description: 'Track diversity, equity, and inclusion metrics with diversity index (Simpson), inclusion scoring, pay equity gap analysis, hiring funnel diversity, leadership representation, and comprehensive DEI action planning.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: organization, period, total_workforce, demographics (gender, ethnicity, age_groups, disability, veteran), leadership_demographics, hiring_data (array of department, applicants by group, hires by group), equity_metrics (pay_gap_gender_pct, pay_gap_ethnicity_pct, promotion_rate_ratio, turnover_rate_ratio), engagement_by_group'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: DEIMetricsInput = JSON.parse(args.input_data)
      const result = analyzeDEIMetrics(data)
      return formatDEIMetricsReport(result)
    }
  }))

  console.log('[dsh-tool-hrtechai] Loaded v' + VERSION + ' - HR Tech & People Analytics AI Agent Plugin with 8 tools')
}
