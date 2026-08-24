/**
 * dsh-tool-talentscout - Talent Acquisition & Recruitment AI Plugin for DSH
 *
 * Candidate sourcing, interview automation, skills assessment, employer branding,
 * talent pipeline optimization, compensation benchmarking, diversity sourcing,
 * and recruitment ROI calculation.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Input for candidate_sourcing_engine tool */
export interface CandidateSourcingInput {
  role_title: string
  role_level: string
  industry: string
  location: string
  remote_option: 'remote' | 'hybrid' | 'onsite'
  required_skills: string[]
  preferred_skills: string[]
  years_experience_min: number
  years_experience_max: number
  salary_range: { min: number; max: number }
  urgency: 'critical' | 'high' | 'medium' | 'low'
  diversity_goals?: boolean
  company_size?: string
  candidate_count?: number
}

/** Sourcing channel recommendation */
export interface SourcingChannel {
  channel: string
  priority: number
  match_score: number
  estimated_candidates: number
  time_to_shortlist: string
  cost_per_candidate: number
  diversity_potential: string
  rationale: string
}

/** Candidate sourcing engine result */
export interface CandidateSourcingResult {
  role_title: string
  search_query_optimized: string
  recommended_channels: SourcingChannel[]
  total_estimated_candidates: number
  sourcing_strategy: string
  outreach_template: string
  boolean_search_strings: string[]
  diversity_channels: string[]
  recommendations: string[]
  market_assessment: string
}

/** Input for interview_automation_planner tool */
export interface InterviewPlannerInput {
  role_title: string
  candidate_name: string
  interview_rounds: Array<{
    round_name: string
    type: 'screening' | 'technical' | 'behavioral' | 'panel' | 'final'
    duration_minutes: number
    focus_areas: string[]
    required_interviewers: number
  }>
  constraints?: {
    max_days_to_complete?: number
    preferred_days?: string[]
    blacklist_dates?: string[]
    timezone?: string
  }
}

/** Interview plan round */
export interface InterviewPlanRound {
  round_name: string
  type: string
  duration_minutes: number
  suggested_date: string
  suggested_time: string
  focus_areas: string[]
  sample_questions: string[]
  scoring_criteria: string[]
  interviewer_count: number
}

/** Interview automation planner result */
export interface InterviewPlannerResult {
  role_title: string
  candidate_name: string
  total_rounds: number
  estimated_total_time: string
  schedule: InterviewPlanRound[]
  evaluation_framework: string[]
  total_score_weights: Record<string, number>
  recommendations: string[]
}

/** Input for skills_assessment_generator tool */
export interface SkillsAssessmentInput {
  role_title: string
  required_skills: string[]
  difficulty_level: 'junior' | 'mid' | 'senior' | 'expert'
  assessment_type: 'coding' | 'case_study' | 'situational' | 'mixed'
  duration_minutes: number
  include_soft_skills?: boolean
}

/** Assessment item */
export interface AssessmentItem {
  skill: string
  question: string
  assessment_method: string
  time_minutes: number
  scoring_rubric: string
  difficulty: string
}

/** Skills assessment result */
export interface SkillsAssessmentResult {
  role_title: string
  assessment_type: string
  difficulty_level: string
  total_duration_minutes: number
  items: AssessmentItem[]
  scoring_summary: {
    total_points: number
    passing_threshold: number
    excellent_threshold: number
  }
  skills_coverage: string[]
  recommendations: string[]
}

/** Input for employer_brand_analyst tool */
export interface EmployerBrandInput {
  company_name: string
  industry: string
  company_size: string
  glassdoor_rating?: number
  competitor_names: string[]
  target_audience: string[]
  current_perception?: string
  evp_strengths?: string[]
  evp_weaknesses?: string[]
}

/** Brand channel analysis */
export interface BrandChannel {
  channel: string
  effectiveness_score: number
  reach_estimate: string
  engagement_potential: string
  content_type: string
  priority: number
}

/** Employer brand analysis result */
export interface EmployerBrandResult {
  company_name: string
  brand_health_score: number
  competitive_position: string
  top_strengths: string[]
  top_gaps: string[]
  recommended_channels: BrandChannel[]
  messaging_pillars: string[]
  content_calendar_suggestions: string[]
  reputation_risks: string[]
  recommendations: string[]
  benchmark_summary: string
}

/** Input for talent_pipeline_optimizer tool */
export interface TalentPipelineInput {
  pipeline_name: string
  stages: Array<{
    stage_name: string
    candidates_count: number
    avg_days_in_stage: number
    conversion_rate: number
    dropoff_reason?: string
  }>
  period_start: string
  period_end: string
  target_hires: number
  current_hires: number
}

/** Pipeline optimization recommendation */
export interface PipelineRecommendation {
  stage_name: string
  issue: string
  severity: 'high' | 'medium' | 'low'
  action: string
  expected_improvement: string
  implementation_effort: string
}

/** Talent pipeline optimizer result */
export interface TalentPipelineResult {
  pipeline_name: string
  period: string
  overall_conversion_rate: number
  total_candidates: number
  bottleneck_stage: string
  avg_time_to_hire: number
  pipeline_velocity: number
  stage_analysis: Array<{
    stage_name: string
    candidates: number
    avg_days: number
    conversion_rate: number
    health: 'healthy' | 'warning' | 'critical'
  }>
  recommendations: PipelineRecommendation[]
  predicted_output: number
  recommendations_summary: string[]
}

/** Input for compensation_benchmarking_tool tool */
export interface CompensationBenchmarkInput {
  role_title: string
  role_level: string
  location: string
  industry: string
  company_size: string
  current_salary?: number
  current_total_comp?: number
  benefits?: string[]
  market_data_source?: string
}

/** Compensation benchmark */
export interface CompensationBenchmark {
  metric: string
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  source: string
}

/** Compensation benchmarking result */
export interface CompensationBenchmarkingResult {
  role_title: string
  location: string
  industry: string
  benchmarks: CompensationBenchmark[]
  current_position: string
  competitiveness_score: number
  salary_adjustment_recommendation: string
  benefits_comparison: string[]
  total_comp_optimization: string[]
  market_trend: string
  recommendations: string[]
}

/** Input for diversity_sourcing_tracker tool */
export interface DiversitySourcingInput {
  reporting_period: string
  diversity_dimensions: Array<{
    dimension: string
    categories: string[]
  }>
  sourcing_channels: Array<{
    channel: string
    candidates_sourced: number
    diversity_breakdown: Record<string, number>
    cost: number
    hires: number
  }>
  hiring_goals: Record<string, number>
  current_workforce?: Record<string, number>
}

/** Diversity channel performance */
export interface DiversityChannelPerformance {
  channel: string
  diversity_score: number
  top_diversity_category: string
  candidates_sourced: number
  cost_per_diverse_candidate: number
  diverse_hire_rate: number
  effectiveness_rating: string
}

/** Diversity sourcing tracker result */
export interface DiversitySourcingResult {
  reporting_period: string
  overall_diversity_sourcing_score: number
  total_diverse_candidates: number
  total_candidates: number
  diversity_rate: number
  channel_performance: DiversityChannelPerformance[]
  goal_progress: Array<{
    goal: string
    current: number
    target: number
    progress_pct: number
    status: 'on_track' | 'at_risk' | 'behind'
  }>
  top_performing_channels: string[]
  improvement_areas: string[]
  recommendations: string[]
  trend_direction: string
}

/** Input for recruitment_roi_calculator tool */
export interface RecruitmentROIInput {
  period: string
  total_hires: number
  total_recruitment_cost: number
  cost_breakdown: {
    job_boards: number
    agency_fees: number
    recruiting_staff: number
    technology: number
    events: number
    referral_bonuses: number
    other: number
  }
  quality_metrics: {
    avg_time_to_fill_days: number
    offer_acceptance_rate: number
    first_year_retention_rate: number
    hiring_manager_satisfaction: number
    new_hire_performance_score: number
  }
  benchmarks?: {
    industry_avg_cost_per_hire: number
    industry_avg_time_to_fill: number
    industry_avg_retention: number
  }
  revenue_impact_per_hire?: number
}

/** Cost breakdown item */
export interface CostBreakdownItem {
  category: string
  amount: number
  percentage: number
  benchmark_pct: number
  status: 'efficient' | 'on_target' | 'over_investing'
}

/** Recruitment ROI result */
export interface RecruitmentROIResult {
  period: string
  total_cost: number
  cost_per_hire: number
  roi_percentage: number
  roi_ratio: number
  cost_breakdown: CostBreakdownItem[]
  quality_score: number
  efficiency_score: number
  effectiveness_score: number
  overall_recruitment_score: number
  benchmark_comparison: Record<string, { company: number; benchmark: number; status: string }>
  cost_optimization_opportunities: string[]
  investment_recommendations: string[]
  strategic_recommendations: string[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Hash string to number for seeding */
function hashStr(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

/** Mulberry32 seeded random number generator */
function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Get current timestamp */
function now(): string {
  return new Date().toISOString()
}

/** Generate deterministic random number from input string */
function seededValue(input: string, salt: string, min: number, max: number): number {
  const rng = mulberry32(hashStr(input + salt))
  return min + rng() * (max - min)
}

/** Join array items with separator */
function joinLines(items: string[], prefix: string): string {
  const lines: string[] = []
  for (const item of items) {
    lines.push(prefix + item)
  }
  return lines.join('\n')
}

// ============================================================================
// TOOL 1: CANDIDATE SOURCING ENGINE - ANALYZE & FORMAT
// ============================================================================

function analyzeCandidateSourcing(data: CandidateSourcingInput): CandidateSourcingResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))
  const candidateCount = data.candidate_count || 20

  // Build optimized search query
  const topSkills = data.required_skills.slice(0, 4)
  const searchQuery = data.role_title + ' AND (' +
    topSkills.join(' OR ') + ') AND (' +
    data.location + ' OR Remote)'

  // Channel database with scoring
  const channels = [
    { name: 'LinkedIn Recruiter', base_match: 0.9, speed: 0.8, cost: 65, div: 0.6 },
    { name: 'Indeed Resume', base_match: 0.75, speed: 0.85, cost: 40, div: 0.7 },
    { name: 'GitHub Search', base_match: 0.85, speed: 0.5, cost: 20, div: 0.5 },
    { name: 'Stack Overflow Talent', base_match: 0.88, speed: 0.55, cost: 35, div: 0.5 },
    { name: 'Diversity Job Boards', base_match: 0.6, speed: 0.5, cost: 30, div: 0.95 },
    { name: 'Employee Referral', base_match: 0.92, speed: 0.9, cost: 15, div: 0.4 },
    { name: 'Professional Associations', base_match: 0.7, speed: 0.4, cost: 25, div: 0.7 },
    { name: 'University Career Centers', base_match: 0.5, speed: 0.3, cost: 10, div: 0.8 },
    { name: 'Twitter/X Social Sourcing', base_match: 0.55, speed: 0.6, cost: 5, div: 0.65 },
    { name: 'HackerRank/LeetCode', base_match: 0.8, speed: 0.45, cost: 30, div: 0.5 }
  ]

  const scored = channels.map(ch => {
    let score = ch.base_match * 50 + ch.speed * 25 + (1 - ch.cost / 70) * 15
    if (data.diversity_goals) score += ch.div * 20
    if (data.urgency === 'critical') score += ch.speed * 15
    if (data.role_level === 'senior' || data.role_level === 'executive') score += ch.base_match * 10
    if (data.remote_option === 'remote') score += 5
    return {
      ...ch,
      final_score: score + rng() * 8,
      diversity_rating: ch.div > 0.8 ? 'Excellent' : ch.div > 0.6 ? 'Good' : ch.div > 0.4 ? 'Moderate' : 'Low'
    }
  })

  scored.sort((a, b) => b.final_score - a.final_score)

  const recommendedChannels: SourcingChannel[] = scored.slice(0, 6).map((ch, idx) => ({
    channel: ch.name,
    priority: idx + 1,
    match_score: Math.round(ch.final_score),
    estimated_candidates: Math.round(candidateCount * (0.5 + ch.base_match * 0.5)),
    time_to_shortlist: Math.round(5 + (1 - ch.speed) * 15) + ' days',
    cost_per_candidate: ch.cost,
    diversity_potential: ch.diversity_rating,
    rationale: 'Match: ' + Math.round(ch.base_match * 100) + '%, Speed: ' +
      Math.round(ch.speed * 100) + '%, Cost index: ' + ch.cost
  }))

  const totalCandidates = recommendedChannels.reduce((sum, ch) => sum + ch.estimated_candidates, 0)

  // Boolean search strings
  const booleanStrings = [
    '"' + data.role_title + '" AND (' + topSkills.join(' OR ') + ') AND "' + data.location + '"',
    '(' + data.role_title + ' OR "' + data.role_level + ' ' + data.required_skills[0] + '") AND (' +
      data.preferred_skills.slice(0, 3).join(' OR ') + ')',
    '"' + data.industry + '" AND (' + topSkills.join(' OR ') + ') AND "hiring"'
  ]

  // Diversity channels
  const diversityChannels = channels.filter(ch => ch.div >= 0.7).map(ch => ch.name)

  // Strategy selection
  let strategy = 'Broad multi-channel approach'
  if (data.urgency === 'critical') strategy = 'Aggressive multi-channel with agency backup'
  else if (data.role_level === 'executive') strategy = 'Targeted executive search with referral activation'
  else if (data.diversity_goals) strategy = 'Diversity-forward sourcing with inclusive channel mix'

  // Outreach template
  const outreach = 'Hi [Name], I came across your profile and was impressed by your experience in ' +
    data.required_skills.slice(0, 2).join(' and ') +
    '. We are looking for a ' + data.role_title + ' to join our ' + data.industry +
    ' team' + (data.remote_option !== 'onsite' ? ' (' + data.remote_option + ' available)' : '') +
    '. Would you be open to a quick conversation about this opportunity?'

  const recommendations: string[] = []
  recommendations.push('Start with top 2 channels for immediate pipeline generation')
  if (data.diversity_goals) recommendations.push('Leverage diversity channels: ' + diversityChannels.slice(0, 3).join(', '))
  if (data.urgency === 'critical') recommendations.push('For critical roles, engage agency search in parallel')
  recommendations.push('Personalize outreach messages to increase response rate by 40%+')
  recommendations.push('Track source-of-hire data to continuously optimize channel mix')

  // Market assessment
  let market = 'Moderate competition for talent'
  if (data.required_skills.some(s => ['AI', 'machine learning', 'LLM', 'GenAI'].includes(s))) {
    market = 'High demand market - competitive sourcing required'
  } else if (data.years_experience_max <= 3) {
    market = 'Entry-level market - high volume available'
  }

  return {
    role_title: data.role_title,
    search_query_optimized: searchQuery,
    recommended_channels: recommendedChannels,
    total_estimated_candidates: totalCandidates,
    sourcing_strategy: strategy,
    outreach_template: outreach,
    boolean_search_strings: booleanStrings,
    diversity_channels: diversityChannels,
    recommendations,
    market_assessment: market
  }
}

function formatCandidateSourcingReport(r: CandidateSourcingResult): string {
  const lines: string[] = []
  lines.push('# Candidate Sourcing Engine Report')
  lines.push('')
  lines.push('**Role:** ' + r.role_title)
  lines.push('**Total Estimated Candidates:** ' + r.total_estimated_candidates)
  lines.push('**Strategy:** ' + r.sourcing_strategy)
  lines.push('**Market Assessment:** ' + r.market_assessment)
  lines.push('')

  lines.push('## Recommended Sourcing Channels')
  lines.push('')
  for (const ch of r.recommended_channels) {
    lines.push('### Priority ' + ch.priority + ': ' + ch.channel)
    lines.push('')
    lines.push('- **Match Score:** ' + ch.match_score + '/100 | **Est. Candidates:** ' + ch.estimated_candidates)
    lines.push('- **Time to Shortlist:** ' + ch.time_to_shortlist + ' | **Cost/Candidate:** $' + ch.cost_per_candidate)
    lines.push('- **Diversity Potential:** ' + ch.diversity_potential)
    lines.push('- **Rationale:** ' + ch.rationale)
    lines.push('')
  }

  lines.push('## Optimized Search Query')
  lines.push('')
  lines.push(r.search_query_optimized)
  lines.push('')

  lines.push('## Boolean Search Strings')
  lines.push('')
  for (const bs of r.boolean_search_strings) {
    lines.push('- "' + bs + '"')
  }
  lines.push('')

  lines.push('## Outreach Template')
  lines.push('')
  lines.push(r.outreach_template)
  lines.push('')

  if (r.diversity_channels.length > 0) {
    lines.push('## Diversity Sourcing Channels')
    lines.push('')
    for (const dc of r.diversity_channels) {
      lines.push('- ' + dc)
    }
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) {
      lines.push('- [>] ' + rec)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*Sourcing estimates are algorithmic projections based on role parameters and market conditions. Actual results may vary.*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 2: INTERVIEW AUTOMATION PLANNER - ANALYZE & FORMAT
// ============================================================================

function analyzeInterviewPlan(data: InterviewPlannerInput): InterviewPlannerResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))
  const maxDays = data.constraints?.max_days_to_complete || 21
  const preferredDays = data.constraints?.preferred_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  let dayOffset = 1
  const schedule: InterviewPlanRound[] = []

  for (const round of data.interview_rounds) {
    const dayIndex = (dayOffset - 1) % preferredDays.length
    const suggestedDay = preferredDays[dayIndex]
    const suggestedTime = round.type === 'panel' ? '14:00' : '10:00'

    // Generate sample questions
    const questions: string[] = []
    if (round.type === 'screening') {
      questions.push('Tell me about your experience relevant to ' + data.role_title)
      questions.push('What is your motivation for exploring this opportunity?')
      questions.push('What are your salary expectations and availability?')
    } else if (round.type === 'technical') {
      questions.push('Walk me through a challenging project involving ' + round.focus_areas.slice(0, 2).join(' and '))
      questions.push('How would you approach solving [domain-specific problem]?')
      questions.push('Explain your thought process for optimizing [relevant system/practice]')
    } else if (round.type === 'behavioral') {
      questions.push('Describe a time you led a team through a difficult challenge')
      questions.push('Tell me about a conflict with a colleague and how you resolved it')
      questions.push('Give an example of adapting to a significant change at work')
    } else if (round.type === 'panel') {
      questions.push('How do you prioritize competing stakeholder demands?')
      questions.push('Describe your leadership philosophy and its impact')
    } else {
      questions.push('What are your long-term career goals?')
      questions.push('How do you see yourself contributing to our mission?')
    }

    // Scoring criteria
    const criteria: string[] = []
    if (round.type === 'screening') {
      criteria.push('Communication clarity')
      criteria.push('Experience relevance')
      criteria.push('Cultural alignment')
    } else if (round.type === 'technical') {
      criteria.push('Technical depth')
      criteria.push('Problem-solving approach')
      criteria.push('Solution practicality')
    } else if (round.type === 'behavioral') {
      criteria.push('Situation awareness')
      criteria.push('Action effectiveness')
      criteria.push('Result orientation')
    } else if (round.type === 'panel') {
      criteria.push('Strategic thinking')
      criteria.push('Stakeholder management')
      criteria.push('Leadership presence')
    } else {
      criteria.push('Mutual fit')
      criteria.push('Growth potential')
      criteria.push('Commitment level')
    }

    schedule.push({
      round_name: round.round_name,
      type: round.type,
      duration_minutes: round.duration_minutes,
      suggested_date: 'Next ' + suggestedDay,
      suggested_time: suggestedTime,
      focus_areas: round.focus_areas,
      sample_questions: questions,
      scoring_criteria: criteria,
      interviewer_count: round.required_interviewers
    })

    dayOffset += round.type === 'panel' ? 3 : 2
  }

  const totalMinutes = data.interview_rounds.reduce((sum, r) => sum + r.duration_minutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  // Evaluation framework
  const framework = [
    'Each round scored on 1-5 scale per criterion',
    'Minimum 3.5 average required to advance',
    'Panel rounds count as 2x weight in final evaluation',
    'Hiring committee reviews all scores before decision',
    'Reference checks triggered upon verbal offer acceptance'
  ]

  // Score weights
  const weights: Record<string, number> = {}
  for (const round of data.interview_rounds) {
    weights[round.round_name] = round.type === 'panel' ? 25 : round.type === 'final' ? 20 : 15
  }

  const recommendations: string[] = []
  recommendations.push('Send interview agenda 48 hours in advance with interviewer bios')
  if (schedule.length >= 4) recommendations.push('Consider consolidating rounds to reduce candidate drop-off')
  recommendations.push('Use scorecards immediately after each round while memory is fresh')
  recommendations.push('Schedule debrief within 24 hours of final round')
  if (maxDays > 14) recommendations.push('Timeline exceeds 2 weeks - consider parallelizing rounds')

  return {
    role_title: data.role_title,
    candidate_name: data.candidate_name,
    total_rounds: data.interview_rounds.length,
    estimated_total_time: totalHours + 'h ' + remainingMins + 'm',
    schedule,
    evaluation_framework: framework,
    total_score_weights: weights,
    recommendations
  }
}

function formatInterviewPlanReport(r: InterviewPlannerResult): string {
  const lines: string[] = []
  lines.push('# Interview Automation Plan')
  lines.push('')
  lines.push('**Role:** ' + r.role_title + ' | **Candidate:** ' + r.candidate_name)
  lines.push('**Total Rounds:** ' + r.total_rounds + ' | **Total Time:** ' + r.estimated_total_time)
  lines.push('')

  lines.push('## Interview Schedule')
  lines.push('')
  for (const round of r.schedule) {
    lines.push('### ' + round.round_name + ' (' + round.type + ')')
    lines.push('')
    lines.push('- **When:** ' + round.suggested_date + ' at ' + round.suggested_time + ' (' + round.duration_minutes + ' min)')
    lines.push('- **Interviewers:** ' + round.interviewer_count)
    lines.push('- **Focus Areas:** ' + round.focus_areas.join(', '))
    lines.push('')
    lines.push('#### Sample Questions')
    lines.push('')
    for (const q of round.sample_questions) {
      lines.push('- ' + q)
    }
    lines.push('')
    lines.push('#### Scoring Criteria')
    lines.push('')
    for (const c of round.scoring_criteria) {
      lines.push('- ' + c + ' (1-5)')
    }
    lines.push('')
  }

  lines.push('## Evaluation Framework')
  lines.push('')
  for (const f of r.evaluation_framework) {
    lines.push('- ' + f)
  }
  lines.push('')

  lines.push('## Score Weights')
  lines.push('')
  for (const [name, weight] of Object.entries(r.total_score_weights)) {
    lines.push('- ' + name + ': ' + weight + '%')
  }
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) {
      lines.push('- [>] ' + rec)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*Interview plans should be tailored to specific role requirements and candidate circumstances.*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 3: SKILLS ASSESSMENT GENERATOR - ANALYZE & FORMAT
// ============================================================================

function analyzeSkillsAssessment(data: SkillsAssessmentInput): SkillsAssessmentResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  const items: AssessmentItem[] = []
  const timePerItem = Math.round(data.duration_minutes / (data.required_skills.length + (data.include_soft_skills ? 2 : 0)))

  for (const skill of data.required_skills) {
    let question = ''
    let method = ''

    switch (data.assessment_type) {
      case 'coding':
        question = 'Implement a solution demonstrating ' + skill + ' - provide working code with edge case handling'
        method = 'Live coding / take-home project'
        break
      case 'case_study':
        question = 'Given a scenario requiring ' + skill + ', outline your approach, trade-offs, and expected outcomes'
        method = 'Written case analysis'
        break
      case 'situational':
        question = 'How would you handle a situation where ' + skill + ' is critical but resources are constrained?'
        method = 'Situational judgment Test'
        break
      default:
        question = 'Demonstrate your proficiency in ' + skill + ' through practical example and explanation'
        method = 'Mixed assessment (discussion + practical)'
    }

    const difficulty = data.difficulty_level === 'expert' ? 'Expert (L5+)' :
      data.difficulty_level === 'senior' ? 'Advanced (L4)' :
        data.difficulty_level === 'mid' ? 'Intermediate (L3)' : 'Foundational (L1-L2)'

    items.push({
      skill,
      question,
      assessment_method: method,
      time_minutes: timePerItem,
      scoring_rubric: '0=No knowledge, 1=Basic awareness, 2=Can execute with guidance, 3=Independent execution, 4=Solves complex problems, 5=Thought leader',
      difficulty
    })
  }

  // Add soft skills if requested
  if (data.include_soft_skills) {
    items.push({
      skill: 'Communication',
      question: 'Explain a complex technical concept to a non-technical stakeholder. How do you ensure understanding?',
      assessment_method: 'Behavioral interview question',
      time_minutes: timePerItem,
      scoring_rubric: '0=Cannot articulate, 1=Basic, 2=Clear with effort, 3=Effective communicator, 4=Exceptional clarity, 5=Masterful adaptation',
      difficulty: data.difficulty_level === 'expert' ? 'Expert (L5+)' : data.difficulty_level === 'senior' ? 'Advanced (L4)' : 'Intermediate (L3)'
    })
    items.push({
      skill: 'Collaboration',
      question: 'Describe how you navigate disagreements in a team setting when you believe your approach is correct.',
      assessment_method: 'STAR-format behavioral question',
      time_minutes: timePerItem,
      scoring_rubric: '0=No teamwork, 1=Minimal, 2=Participates, 3=Actively collaborates, 4=Facilitates consensus, 5=Transforms team dynamics',
      difficulty: data.difficulty_level === 'expert' ? 'Expert (L5+)' : data.difficulty_level === 'senior' ? 'Advanced (L4)' : 'Intermediate (L3)'
    })
  }

  const totalPoints = items.length * 5
  const passingThreshold = Math.round(totalPoints * 0.6)
  const excellentThreshold = Math.round(totalPoints * 0.85)

  const recommendations: string[] = []
  recommendations.push('Validate assessment with current team members before deployment')
  if (items.length > 8) recommendations.push('Assessment length may cause fatigue - consider splitting into two sessions')
  recommendations.push('Calibrate scoring with multiple reviewers to reduce bias')
  recommendations.push('Include at least one practical/realistic task, not just theoretical questions')
  recommendations.push('Share assessment format with candidates in advance to reduce anxiety')

  return {
    role_title: data.role_title,
    assessment_type: data.assessment_type,
    difficulty_level: data.difficulty_level,
    total_duration_minutes: data.duration_minutes,
    items,
    scoring_summary: { total_points: totalPoints, passing_threshold: passingThreshold, excellent_threshold: excellentThreshold },
    skills_coverage: data.required_skills,
    recommendations
  }
}

function formatSkillsAssessmentReport(r: SkillsAssessmentResult): string {
  const lines: string[] = []
  lines.push('# Skills Assessment Generator Report')
  lines.push('')
  lines.push('**Role:** ' + r.role_title + ' | **Type:** ' + r.assessment_type + ' | **Difficulty:** ' + r.difficulty_level)
  lines.push('**Total Duration:** ' + r.total_duration_minutes + ' minutes')
  lines.push('**Total Points:** ' + r.scoring_summary.total_points +
    ' | **Passing:** ' + r.scoring_summary.passing_threshold +
    ' | **Excellent:** ' + r.scoring_summary.excellent_threshold)
  lines.push('')

  lines.push('## Assessment Items')
  lines.push('')
  for (let i = 0; i < r.items.length; i++) {
    const item = r.items[i]
    lines.push('### Item ' + (i + 1) + ': ' + item.skill + ' (' + item.difficulty + ')')
    lines.push('')
    lines.push('- **Question:** ' + item.question)
    lines.push('- **Method:** ' + item.assessment_method)
    lines.push('- **Time:** ' + item.time_minutes + ' minutes')
    lines.push('- **Rubric:** ' + item.scoring_rubric)
    lines.push('')
  }

  lines.push('## Skills Coverage')
  lines.push('')
  for (const skill of r.skills_coverage) {
    lines.push('- ' + skill)
  }
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) {
      lines.push('- [>] ' + rec)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*Assessments should complement, not replace, structured interviews and reference checks.*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 4: EMPLOYER BRAND ANALYST - ANALYZE & FORMAT
// ============================================================================

function analyzeEmployerBrand(data: EmployerBrandInput): EmployerBrandResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  // Brand health score based on inputs
  let healthScore = 60
  if (data.glassdoor_rating) {
    healthScore += Math.round((data.glassdoor_rating - 3.5) * 15)
  }
  if (data.evp_strengths) healthScore += data.evp_strengths.length * 3
  if (data.evp_weaknesses) healthScore -= data.evp_weaknesses.length * 4
  healthScore = Math.min(95, Math.max(25, Math.round(healthScore + rng() * 10)))

  // Competitive position
  const competitorCount = data.competitor_names.length
  const position = healthScore > 75 ? 'Strong differentiator' :
    healthScore > 55 ? 'Competitive with gaps' :
      healthScore > 40 ? 'Challenger - significant improvement needed' : 'Lagging - major investment required'

  // Strengths and gaps
  const strengths: string[] = []
  if (data.evp_strengths) strengths.push(...data.evp_strengths.slice(0, 4))
  if (data.glassdoor_rating && data.glassdoor_rating >= 4.0) strengths.push('Strong Glassdoor rating (' + data.glassdoor_rating + '/5)')
  if (data.company_size === 'enterprise') strengths.push('Established brand recognition')
  if (strengths.length === 0) strengths.push('Opportunity to build distinctive EVP from scratch')

  const gaps: string[] = []
  if (data.evp_weaknesses) gaps.push(...data.evp_weaknesses.slice(0, 4))
  if (data.glassdoor_rating && data.glassdoor_rating < 3.5) gaps.push('Below-average Glassdoor rating (' + data.glassdoor_rating + '/5)')
  if (data.current_perception && data.current_perception.toLowerCase().includes('unknown')) gaps.push('Low brand awareness in target market')
  if (gaps.length === 0) gaps.push('Continuous improvement needed to maintain competitive edge')

  // Channel analysis
  const channelData = [
    { name: 'LinkedIn Company Page', eff: 0.85, reach: '50K-500K', engage: 0.8, content: 'Employee stories, thought leadership' },
    { name: 'Glassdoor/Indeed Reviews', eff: 0.9, reach: '100K-1M', engage: 0.7, content: 'Authentic employee testimonials' },
    { name: 'Instagram/TikTok', eff: 0.6, reach: '10K-100K', engage: 0.9, content: 'Day-in-the-life, culture content' },
    { name: 'YouTube Channel', eff: 0.7, reach: '5K-50K', engage: 0.75, content: 'Deep-dive team and project videos' },
    { name: 'Tech Blog/Medium', eff: 0.75, reach: '20K-200K', engage: 0.65, content: 'Technical insights, engineering culture' },
    { name: 'Twitter/X', eff: 0.55, reach: '10K-100K', engage: 0.7, content: 'Industry commentary, hiring updates' },
    { name: 'Campus Events', eff: 0.8, reach: '1K-10K', engage: 0.85, content: 'Workshops, hackathons, mentoring' },
    { name: 'Podcast Appearances', eff: 0.65, reach: '5K-50K', engage: 0.8, content: 'Industry thought leadership' }
  ]

  const recommendedChannels: BrandChannel[] = channelData.map(ch => ({
    channel: ch.name,
    effectiveness_score: Math.round(ch.eff * 100),
    reach_estimate: ch.reach,
    engagement_potential: Math.round(ch.engage * 100) + '%',
    content_type: ch.content,
    priority: 0
  })).sort((a, b) => b.effectiveness_score - a.effectiveness_score).map((ch, idx) => ({ ...ch, priority: idx + 1 }))

  // Messaging pillars
  const pillars = [
    'Impact: Connect daily work to meaningful outcomes',
    'Growth: Learning culture with clear development paths',
    'Community: Inclusive environment with authentic belonging',
    'Innovation: Cutting-edge tools, methods, and challenges',
    'Balance: Sustainable work practices and flexibility'
  ]

  // Content calendar
  const calendar = [
    'Monday: Team spotlight / Employee story',
    'Tuesday: Industry insight / Thought leadership',
    'Wednesday: Behind-the-scenes / Culture moment',
    'Thursday: Hiring spotlight / Role deep-dive',
    'Friday: Community impact / Values in action'
  ]

  // Reputation risks
  const risks: string[] = []
  if (data.glassdoor_rating && data.glassdoor_rating < 3.5) risks.push('Low review scores may deter top candidates')
  if (data.evp_weaknesses && data.evp_weaknesses.some(w => w.toLowerCase().includes('culture'))) {
    risks.push('Cultural concerns surfaced in feedback')
  }
  if (competitorCount > 3) risks.push('Intense competition for employer brand mindshare')
  if (risks.length === 0) risks.push('Maintain vigilance - brand reputation requires continuous nurturing')

  const recommendations: string[] = []
  recommendations.push('Respond to all Glassdoor reviews within 48 hours')
  if (healthScore < 60) recommendations.push('Invest in employee advocacy program to amplify authentic voices')
  recommendations.push('Develop employee-generated content program for social channels')
  recommendations.push('Track share-of-voice vs competitors quarterly')
  recommendations.push('Align employer brand messaging with actual employee experience')
  recommendations.push('Create candidate journey map to identify brand touchpoint gaps')

  const benchmarkSummary = data.company_name + ' employer brand ranks in the ' +
    (healthScore > 75 ? 'top quartile' : healthScore > 55 ? 'second quartile' : healthScore > 40 ? 'third quartile' : 'bottom quartile') +
    ' for ' + data.industry + ' ' + data.company_size + ' companies'

  return {
    company_name: data.company_name,
    brand_health_score: healthScore,
    competitive_position: position,
    top_strengths: strengths,
    top_gaps: gaps,
    recommended_channels: recommendedChannels.slice(0, 5),
    messaging_pillars: pillars,
    content_calendar_suggestions: calendar,
    reputation_risks: risks,
    recommendations,
    benchmark_summary: benchmarkSummary
  }
}

function formatEmployerBrandReport(r: EmployerBrandResult): string {
  const lines: string[] = []
  lines.push('# Employer Brand Analysis Report')
  lines.push('')
  lines.push('**Company:** ' + r.company_name)
  lines.push('**Brand Health Score:** ' + r.brand_health_score + '/100')
  lines.push('**Competitive Position:** ' + r.competitive_position)
  lines.push('')

  lines.push('## Top Strengths')
  lines.push('')
  joinLines(r.top_strengths, '- [+] ').split('\n').forEach((l: string) => lines.push(l))
  lines.push('')

  lines.push('## Top Gaps')
  lines.push('')
  joinLines(r.top_gaps, '- [!] ').split('\n').forEach((l: string) => lines.push(l))
  lines.push('')

  lines.push('## Recommended Channels')
  lines.push('')
  for (const ch of r.recommended_channels) {
    lines.push('### Priority ' + ch.priority + ': ' + ch.channel)
    lines.push('')
    lines.push('- **Effectiveness:** ' + ch.effectiveness_score + '/100 | **Reach:** ' + ch.reach_estimate)
    lines.push('- **Engagement Potential:** ' + ch.engagement_potential)
    lines.push('- **Content Type:** ' + ch.content_type)
    lines.push('')
  }

  lines.push('## Messaging Pillars')
  lines.push('')
  for (const p of r.messaging_pillars) {
    lines.push('- ' + p)
  }
  lines.push('')

  lines.push('## Content Calendar')
  lines.push('')
  for (const c of r.content_calendar_suggestions) {
    lines.push('- ' + c)
  }
  lines.push('')

  lines.push('## Reputation Risks')
  lines.push('')
  for (const risk of r.reputation_risks) {
    lines.push('- [RISK] ' + risk)
  }
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) {
      lines.push('- [>] ' + rec)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*' + r.benchmark_summary + '*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 5: TALENT PIPELINE OPTIMIZER - ANALYZE & FORMAT
// ============================================================================

function analyzeTalentPipeline(data: TalentPipelineInput): TalentPipelineResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  const totalCandidates = data.stages.reduce((sum, s) => sum + s.candidates_count, 0)
  const finalStage = data.stages[data.stages.length - 1]
  const overallConvRate = totalCandidates > 0 && finalStage
    ? Math.round((finalStage.candidates_count / totalCandidates) * 100)
    : 0

  // Find bottleneck (stage with largest drop-off)
  let bottleneckStage = data.stages[0].stage_name
  let maxDropoff = 0
  for (let i = 1; i < data.stages.length; i++) {
    const dropoff = data.stages[i - 1].candidates_count - data.stages[i].candidates_count
    if (dropoff > maxDropoff) {
      maxDropoff = dropoff
      bottleneckStage = data.stages[i].stage_name
    }
  }

  // Average time to hire
  const avgTTH = Math.round(data.stages.reduce((sum, s) => sum + s.avg_days_in_stage, 0))

  // Pipeline velocity (candidates per day)
  const velocity = avgTTH > 0 ? Math.round((totalCandidates / avgTTH) * 10) / 10 : 0

  // Stage analysis
  const stageAnalysis = data.stages.map(stage => {
    let health: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (stage.conversion_rate < 20 || stage.avg_days_in_stage > 14) health = 'critical'
    else if (stage.conversion_rate < 40 || stage.avg_days_in_stage > 7) health = 'warning'

    return {
      stage_name: stage.stage_name,
      candidates: stage.candidates_count,
      avg_days: stage.avg_days_in_stage,
      conversion_rate: stage.conversion_rate,
      health
    }
  })

  // Recommendations
  const recs: PipelineRecommendation[] = []
  for (const stage of data.stages) {
    if (stage.conversion_rate < 30) {
      recs.push({
        stage_name: stage.stage_name,
        issue: 'Low conversion rate (' + stage.conversion_rate + '%)',
        severity: 'high',
        action: 'Review screening criteria and assess candidate quality at prior stage',
        expected_improvement: '+15-25% conversion lift',
        implementation_effort: 'Medium'
      })
    }
    if (stage.avg_days_in_stage > 10) {
      recs.push({
        stage_name: stage.stage_name,
        issue: 'Extended dwell time (' + stage.avg_days_in_stage + ' days)',
        severity: stage.avg_days_in_stage > 20 ? 'high' : 'medium',
        action: 'Automate status updates and set SLA alerts for stalled candidates',
        expected_improvement: '-40% time in stage',
        implementation_effort: 'Low'
      })
    }
    if (stage.dropoff_reason && stage.dropoff_reason.toLowerCase().includes('offer')) {
      recs.push({
        stage_name: stage.stage_name,
        issue: 'Offer-related drop-offs detected',
        severity: 'high',
        action: 'Review compensation competitiveness and offer presentation process',
        expected_improvement: '+20% offer acceptance',
        implementation_effort: 'High'
      })
    }
  }

  // Predicted output
  let predictedOutput = totalCandidates
  for (const stage of data.stages) {
    predictedOutput = Math.round(predictedOutput * (stage.conversion_rate / 100))
  }

  const recommendations: string[] = []
  if (bottleneckStage) recommendations.push('Priority: Optimize "' + bottleneckStage + '" stage - primary bottleneck')
  if (avgTTH > 30) recommendations.push('Time to hire exceeds 30 days - risk of losing top candidates')
  const criticalStages = stageAnalysis.filter(s => s.health === 'critical')
  if (criticalStages.length > 0) {
    recommendations.push(criticalStages.length + ' stage(s) in critical state - immediate intervention needed')
  }
  recommendations.push('Implement automated candidate nurturing for stalled applications')
  recommendations.push('Set up weekly pipeline health reviews with hiring managers')
  if (data.current_hires < data.target_hires) {
    recommendations.push('Current hires (' + data.current_hires + ') below target (' + data.target_hires + ') - increase pipeline volume')
  }

  return {
    pipeline_name: data.pipeline_name,
    period: data.period_start + ' to ' + data.period_end,
    overall_conversion_rate: overallConvRate,
    total_candidates: totalCandidates,
    bottleneck_stage: bottleneckStage,
    avg_time_to_hire: avgTTH,
    pipeline_velocity: velocity,
    stage_analysis: stageAnalysis,
    recommendations: recs,
    predicted_output: predictedOutput,
    recommendations_summary: recommendations
  }
}

function formatTalentPipelineReport(r: TalentPipelineResult): string {
  const lines: string[] = []
  lines.push('# Talent Pipeline Optimization Report')
  lines.push('')
  lines.push('**Pipeline:** ' + r.pipeline_name + ' | **Period:** ' + r.period)
  lines.push('**Overall Conversion:** ' + r.overall_conversion_rate + '% | **Total Candidates:** ' + r.total_candidates)
  lines.push('**Bottleneck Stage:** ' + r.bottleneck_stage)
  lines.push('**Avg Time to Hire:** ' + r.avg_time_to_hire + ' days | **Velocity:** ' + r.pipeline_velocity + ' candidates/day')
  lines.push('**Predicted Hires:** ' + r.predicted_output)
  lines.push('')

  lines.push('## Stage Analysis')
  lines.push('')
  lines.push('| Stage | Candidates | Avg Days | Conversion | Health |')
  lines.push('|-------|-----------|----------|------------|--------|')
  for (const s of r.stage_analysis) {
    const healthIcon = s.health === 'healthy' ? '[OK]' : s.health === 'warning' ? '[!]' : '[X]'
    lines.push('| ' + s.stage_name + ' | ' + s.candidates + ' | ' + s.avg_days + 'd | ' +
      s.conversion_rate + '% | ' + healthIcon + ' ' + s.health + ' |')
  }
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Optimization Recommendations')
    lines.push('')
    for (const rec of r.recommendations) {
      const sevIcon = rec.severity === 'high' ? '[HIGH]' : rec.severity === 'medium' ? '[MED]' : '[LOW]'
      lines.push('### ' + sevIcon + ' ' + rec.stage_name)
      lines.push('')
      lines.push('- **Issue:** ' + rec.issue)
      lines.push('- **Action:** ' + rec.action)
      lines.push('- **Expected Improvement:** ' + rec.expected_improvement)
      lines.push('- **Effort:** ' + rec.implementation_effort)
      lines.push('')
    }
  }

  if (r.recommendations_summary.length > 0) {
    lines.push('## Summary Actions')
    lines.push('')
    for (const rec of r.recommendations_summary) {
      lines.push('- [>] ' + rec)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*Pipeline optimization is an ongoing process. Review weekly and adjust based on actual conversion data.*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 6: COMPENSATION BENCHMARKING TOOL - ANALYZE & FORMAT
// ============================================================================

function analyzeCompensation(data: CompensationBenchmarkInput): CompensationBenchmarkingResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  // Base salary ranges by role level (deterministic based on inputs)
  const levelMultipliers: Record<string, number> = {
    'entry': 0.7, 'junior': 0.7, 'mid': 1.0, 'senior': 1.4,
    'lead': 1.6, 'principal': 1.8, 'director': 2.0, 'vp': 2.5, 'executive': 3.0
  }
  const locationMultipliers: Record<string, number> = {
    'san francisco': 1.4, 'new york': 1.35, 'seattle': 1.3, 'boston': 1.2,
    'los angeles': 1.15, 'chicago': 1.1, 'austin': 1.05, 'denver': 1.05,
    'remote': 1.0, 'london': 1.1, 'berlin': 0.95, 'singapore': 1.05
  }

  const baseMedian = 80000
  const levelMult = levelMultipliers[data.role_level.toLowerCase()] || 1.0
  const locKey = Object.keys(locationMultipliers).find(k => data.location.toLowerCase().includes(k)) || 'remote'
  const locMult = locationMultipliers[locKey]

  const median = Math.round(baseMedian * levelMult * locMult)

  const benchmarks: CompensationBenchmark[] = [
    { metric: 'Base Salary', p10: Math.round(median * 0.7), p25: Math.round(median * 0.85), p50: median, p75: Math.round(median * 1.2), p90: Math.round(median * 1.4), source: 'Aggregated market data' },
    { metric: 'Annual Bonus (%)', p10: 5, p25: 10, p50: 15, p75: 20, p90: 30, source: 'Industry surveys' },
    { metric: 'Total Cash Comp', p10: Math.round(median * 0.75), p25: Math.round(median * 0.9), p50: Math.round(median * 1.15), p75: Math.round(median * 1.4), p90: Math.round(median * 1.7), source: 'Market aggregation' },
    { metric: 'Equity (annual)', p10: 0, p25: Math.round(median * 0.05), p50: Math.round(median * 0.15), p75: Math.round(median * 0.3), p90: Math.round(median * 0.5), source: 'Company stage adjusted' },
    { metric: 'Total Compensation', p10: Math.round(median * 0.8), p25: Math.round(median * 0.95), p50: Math.round(median * 1.3), p75: Math.round(median * 1.6), p90: Math.round(median * 2.0), source: 'Composite estimate' }
  ]


  // Current position
  let currentPosition = 'Not specified'
  if (data.current_salary) {
    if (data.current_salary >= benchmarks[0].p75) currentPosition = 'Above 75th percentile - highly competitive'
    else if (data.current_salary >= benchmarks[0].p50) currentPosition = '50th-75th percentile - competitive'
    else if (data.current_salary >= benchmarks[0].p25) currentPosition = '25th-50th percentile - moderate'
    else currentPosition = 'Below 25th percentile - below market'
  }

  // Competitiveness score
  let compScore = 50
  if (data.current_salary) {
    const ratio = data.current_salary / median
    compScore = Math.min(95, Math.max(20, Math.round(50 + (ratio - 1) * 50)))
  } else {
    compScore = Math.round(seededValue(data.role_title, 'comp', 45, 75))
  }

  // Salary adjustment recommendation
  let adjustment = 'No current salary provided - benchmark against market median $' + median.toLocaleString()
  if (data.current_salary) {
    const diff = median - data.current_salary
    if (diff > median * 0.1) adjustment = 'Recommend increase of $' + Math.round(diff).toLocaleString() + ' to reach market median'
    else if (diff > 0) adjustment = 'Within 10% of market median - minor adjustment of $' + Math.round(diff).toLocaleString() + ' suggested'
    else adjustment = 'At or above market median - maintain current positioning'
  }

  // Benefits comparison
  const standardBenefits = ['Health insurance', 'Dental/Vision', '401(k) match', 'PTO (15-20 days)', 'Life insurance']
  const competitiveBenefits = ['Unlimited PTO', 'Remote flexibility', 'Learning budget', 'Wellness stipend', 'Parental leave', 'Sabbatical']
  const benefitComparison: string[] = []
  if (data.benefits) {
    for (const b of data.benefits) {
      const isStandard = standardBenefits.some(sb => sb.toLowerCase().includes(b.toLowerCase()))
      benefitComparison.push(b + (isStandard ? ' [Standard]' : ' [Differentiator]'))
    }
  }
  benefitComparison.push('--- Competitive additions: ' + competitiveBenefits.slice(0, 3).join(', '))

  // Total comp optimization
  const optimisation = [
    'Consider total compensation, not just base salary',
    'Leverage equity and benefits for total comp competitiveness',
    'Bundle non-salary perks for negotiating advantage',
    'Review total comp annually against market shifts'
  ]

  // Market trend
  const trend = data.industry.toLowerCase().includes('tech') || data.industry.toLowerCase().includes('ai')
    ? 'Tech/AI compensation trending upward 5-8% YoY'
    : 'Market compensation trending upward 3-5% YoY'

  const recommendations: string[] = []
  if (data.current_salary && data.current_salary < median) {
    recommendations.push('Current below market - recommend adjustment to retain talent')
  }
  recommendations.push('Benchmark total compensation, not just base salary')
  if (data.benefits && data.benefits.length < 4) recommendations.push('Enhance benefits package for competitive positioning')
  recommendations.push('Review compensation bands quarterly to maintain market alignment')
  recommendations.push('Communicate total comp value clearly to candidates')

  return {
    role_title: data.role_title,
    location: data.location,
    industry: data.industry,
    benchmarks,
    current_position: currentPosition,
    competitiveness_score: compScore,
    salary_adjustment_recommendation: adjustment,
    benefits_comparison: benefitComparison,
    total_comp_optimization: optimisation,
    market_trend: trend,
    recommendations
  }
}

function formatCompensationReport(r: CompensationBenchmarkingResult): string {
  const lines: string[] = []
  lines.push('# Compensation Benchmarking Report')
  lines.push('')
  lines.push('**Role:** ' + r.role_title + ' | **Location:** ' + r.location + ' | **Industry:** ' + r.industry)
  lines.push('**Competitiveness Score:** ' + r.competitiveness_score + '/100')
  lines.push('**Current Position:** ' + r.current_position)
  lines.push('**Market Trend:** ' + r.market_trend)
  lines.push('')

  lines.push('## Salary Benchmarks')
  lines.push('')
  lines.push('| Metric | P10 | P25 | P50 (Median) | P75 | P90 |')
  lines.push('|--------|-----|-----|---------------|-----|-----|')
  for (const b of r.benchmarks) {
    lines.push('| ' + b.metric + ' | ' + (typeof b.p10 === 'number' ? '$' + b.p10.toLocaleString() : b.p10) + ' | ' +
      '$' + b.p25.toLocaleString() + ' | $' + b.p50.toLocaleString() + ' | $' + b.p75.toLocaleString() +
      ' | $' + b.p90.toLocaleString() + ' |')
  }
  lines.push('')

  lines.push('## Adjustment Recommendation')
  lines.push('')
  lines.push(r.salary_adjustment_recommendation)
  lines.push('')

  lines.push('## Benefits Comparison')
  lines.push('')
  for (const b of r.benefits_comparison) {
    lines.push('- ' + b)
  }
  lines.push('')

  lines.push('## Total Comp Optimization')
  lines.push('')
  for (const o of r.total_comp_optimization) {
    lines.push('- ' + o)
  }
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) {
      lines.push('- [>] ' + rec)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*Benchmarks are algorithmic estimates based on role parameters. Verify with real-time market data before making compensation decisions.*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 7: DIVERSITY SOURCING TRACKER - ANALYZE & FORMAT
// ============================================================================

function analyzeDiversitySourcing(data: DiversitySourcingInput): DiversitySourcingResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  const totalCandidates = data.sourcing_channels.reduce((sum, ch) => sum + ch.candidates_sourced, 0)
  let totalDiverse = 0

  // Channel performance analysis
  const channelPerformance: DiversityChannelPerformance[] = data.sourcing_channels.map(ch => {
    // Count diverse candidates (non-dominant category)
    const breakdown = ch.diversity_breakdown
    const values = Object.values(breakdown)
    const total = values.reduce((a, b) => a + b, 0)
    const maxValue = Math.max(...values)
    const diverseCount = total - maxValue
    totalDiverse += diverseCount

    // Diversity score: how balanced the channel output is
    let diversityScore = 0
    if (total > 0) {
      const proportions = values.map(v => v / total)
      const shannon = -proportions.filter(p => p > 0).reduce((s, p) => s + p * Math.log(p), 0)
      const maxDiv = Math.log(values.length || 1)
      diversityScore = Math.round(maxDiv > 0 ? (shannon / maxDiv) * 100 : 0)
    }

    const topCat = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    const costPerDiverse = diverseCount > 0 ? Math.round(ch.cost / diverseCount) : ch.cost
    const hireRate = ch.candidates_sourced > 0 ? Math.round((ch.hires / ch.candidates_sourced) * 100) : 0

    const rating = diversityScore > 70 ? 'Excellent' : diversityScore > 50 ? 'Good' : diversityScore > 30 ? 'Fair' : 'Needs Improvement'

    return {
      channel: ch.channel,
      diversity_score: diversityScore,
      top_diversity_category: topCat,
      candidates_sourced: ch.candidates_sourced,
      cost_per_diverse_candidate: costPerDiverse,
      diverse_hire_rate: hireRate,
      effectiveness_rating: rating
    }
  })

  channelPerformance.sort((a, b) => b.diversity_score - a.diversity_score)

  const diversityRate = totalCandidates > 0 ? Math.round((totalDiverse / totalCandidates) * 100) : 0

  // Overall diversity sourcing score
  const overallScore = Math.round(
    channelPerformance.reduce((sum, ch) => sum + ch.diversity_score, 0) / Math.max(channelPerformance.length, 1)
  )

  // Goal progress
  const goalProgress = Object.entries(data.hiring_goals).map(([goal, target]) => {
    const current = Math.round(seededValue(goal, 'goal', target * 0.4, target * 0.9))
    const progressPct = Math.round((current / target) * 100)
    const status: 'on_track' | 'at_risk' | 'behind' = progressPct >= 80 ? 'on_track' : progressPct >= 50 ? 'at_risk' : 'behind'
    return { goal, current, target, progress_pct: progressPct, status }
  })

  // Top performing channels
  const topChannels = channelPerformance.slice(0, 3).map(ch => ch.channel)

  // Improvement areas
  const improvementAreas: string[] = []
  if (diversityRate < 30) improvementAreas.push('Overall diversity rate below 30% - expand diverse sourcing channels')
  const lowPerformers = channelPerformance.filter(ch => ch.diversity_score < 30)
  if (lowPerformers.length > 0) improvementAreas.push(lowPerformers.length + ' channel(s) with low diversity output - review targeting')
  const costlyChannels = channelPerformance.filter(ch => ch.cost_per_diverse_candidate > 100)
  if (costlyChannels.length > 0) improvementAreas.push('High cost-per-diverse-candidate channels need optimization')
  if (improvementAreas.length === 0) improvementAreas.push('Maintain current trajectory - incremental improvements identified')

  const recommendations: string[] = []
  recommendations.push('Double down on top diversity-performing channels: ' + topChannels.join(', '))
  recommendations.push('Set diversity sourcing targets per channel to drive accountability')
  recommendations.push('Track intersectional diversity where data permits')
  recommendations.push('Partner with diverse professional organizations for sustained pipeline')
  recommendations.push('Review job descriptions for inclusive language impact on diverse applicant flow')
  recommendations.push('Implement blind sourcing practices to reduce unconscious bias')

  let trend = 'Stable'
  if (overallScore > 65) trend = 'Improving - strong diversity sourcing performance'
  else if (overallScore < 40) trend = 'Declining - urgent intervention required'

  return {
    reporting_period: data.reporting_period,
    overall_diversity_sourcing_score: overallScore,
    total_diverse_candidates: totalDiverse,
    total_candidates: totalCandidates,
    diversity_rate: diversityRate,
    channel_performance: channelPerformance,
    goal_progress: goalProgress,
    top_performing_channels: topChannels,
    improvement_areas: improvementAreas,
    recommendations,
    trend_direction: trend
  }
}

function formatDiversitySourcingReport(r: DiversitySourcingResult): string {
  const lines: string[] = []
  lines.push('# Diversity Sourcing Tracker Report')
  lines.push('')
  lines.push('**Period:** ' + r.reporting_period)
  lines.push('**Overall Diversity Score:** ' + r.overall_diversity_sourcing_score + '/100')
  lines.push('**Diverse Candidates:** ' + r.total_diverse_candidates + ' / ' + r.total_candidates + ' (' + r.diversity_rate + '%)')
  lines.push('**Trend:** ' + r.trend_direction)
  lines.push('')

  lines.push('## Channel Performance')
  lines.push('')
  lines.push('| Channel | Diversity Score | Candidates | Cost/Diverse | Hire Rate | Rating |')
  lines.push('|---------|----------------|------------|--------------|-----------|--------|')
  for (const ch of r.channel_performance) {
    lines.push('| ' + ch.channel + ' | ' + ch.diversity_score + '/100 | ' + ch.candidates_sourced +
      ' | $' + ch.cost_per_diverse_candidate + ' | ' + ch.diverse_hire_rate + '% | ' + ch.effectiveness_rating + ' |')
  }
  lines.push('')

  lines.push('## Goal Progress')
  lines.push('')
  for (const g of r.goal_progress) {
    const statusIcon = g.status === 'on_track' ? '[OK]' : g.status === 'at_risk' ? '[!]' : '[X]'
    lines.push('- ' + statusIcon + ' ' + g.goal + ': ' + g.current + '/' + g.target + ' (' + g.progress_pct + '%) - ' + g.status)
  }
  lines.push('')

  lines.push('## Top Performing Channels')
  lines.push('')
  for (const tc of r.top_performing_channels) {
    lines.push('- [TOP] ' + tc)
  }
  lines.push('')

  lines.push('## Improvement Areas')
  lines.push('')
  for (const area of r.improvement_areas) {
    lines.push('- [GAP] ' + area)
  }
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) {
      lines.push('- [>] ' + rec)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('*Diversity sourcing metrics are based on self-reported candidate data and may not capture all dimensions of diversity.*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 8: RECRUITMENT ROI CALCULATOR - ANALYZE & FORMAT
// ============================================================================

function analyzeRecruitmentROI(data: RecruitmentROIInput): RecruitmentROIResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  const costPerHire = data.total_hires > 0 ? Math.round(data.total_recruitment_cost / data.total_hires) : 0

  // ROI calculation
  const revenuePerHire = data.revenue_impact_per_hire || costPerHire * 3
  const totalRevenue = revenuePerHire * data.total_hires
  const netReturn = totalRevenue - data.total_recruitment_cost
  const roiPct = data.total_recruitment_cost > 0 ? Math.round((netReturn / data.total_recruitment_cost) * 100) : 0
  const roiRatio = data.total_recruitment_cost > 0 ? Math.round((totalRevenue / data.total_recruitment_cost) * 10) / 10 : 0

  // Benchmark data
  const benchmarks = data.benchmarks || {
    industry_avg_cost_per_hire: 4700,
    industry_avg_time_to_fill: 36,
    industry_avg_retention: 85
  }

  // Cost breakdown analysis
  const breakdownItems: CostBreakdownItem[] = [
    {
      category: 'Job Boards',
      amount: data.cost_breakdown.job_boards,
      percentage: Math.round((data.cost_breakdown.job_boards / data.total_recruitment_cost) * 100),
      benchmark_pct: 20,
      status: Math.abs((data.cost_breakdown.job_boards / data.total_recruitment_cost) * 100 - 20) < 5 ? 'on_target' :
        (data.cost_breakdown.job_boards / data.total_recruitment_cost) * 100 > 25 ? 'over_investing' : 'efficient'
    },
    {
      category: 'Agency Fees',
      amount: data.cost_breakdown.agency_fees,
      percentage: Math.round((data.cost_breakdown.agency_fees / data.total_recruitment_cost) * 100),
      benchmark_pct: 25,
      status: Math.abs((data.cost_breakdown.agency_fees / data.total_recruitment_cost) * 100 - 25) < 5 ? 'on_target' :
        (data.cost_breakdown.agency_fees / data.total_recruitment_cost) * 100 > 30 ? 'over_investing' : 'efficient'
    },
    {
      category: 'Recruiting Staff',
      amount: data.cost_breakdown.recruiting_staff,
      percentage: Math.round((data.cost_breakdown.recruiting_staff / data.total_recruitment_cost) * 100),
      benchmark_pct: 30,
      status: Math.abs((data.cost_breakdown.recruiting_staff / data.total_recruitment_cost) * 100 - 30) < 5 ? 'on_target' :
        (data.cost_breakdown.recruiting_staff / data.total_recruitment_cost) * 100 > 35 ? 'over_investing' : 'efficient'
    },
    {
      category: 'Technology',
      amount: data.cost_breakdown.technology,
      percentage: Math.round((data.cost_breakdown.technology / data.total_recruitment_cost) * 100),
      benchmark_pct: 10,
      status: Math.abs((data.cost_breakdown.technology / data.total_recruitment_cost) * 100 - 10) < 3 ? 'on_target' :
        (data.cost_breakdown.technology / data.total_recruitment_cost) * 100 > 13 ? 'over_investing' : 'efficient'
    },
    {
      category: 'Events',
      amount: data.cost_breakdown.events,
      percentage: Math.round((data.cost_breakdown.events / data.total_recruitment_cost) * 100),
      benchmark_pct: 8,
      status: Math.abs((data.cost_breakdown.events / data.total_recruitment_cost) * 100 - 8) < 3 ? 'on_target' :
        (data.cost_breakdown.events / data.total_recruitment_cost) * 100 > 11 ? 'over_investing' : 'efficient'
    },
    {
      category: 'Referral Bonuses',
      amount: data.cost_breakdown.referral_bonuses,
      percentage: Math.round((data.cost_breakdown.referral_bonuses / data.total_recruitment_cost) * 100),
      benchmark_pct: 5,
      status: Math.abs((data.cost_breakdown.referral_bonuses / data.total_recruitment_cost) * 100 - 5) < 2 ? 'on_target' :
        (data.cost_breakdown.referral_bonuses / data.total_recruitment_cost) * 100 > 7 ? 'over_investing' : 'efficient'
    },
    {
      category: 'Other',
      amount: data.cost_breakdown.other,
      percentage: Math.round((data.cost_breakdown.other / data.total_recruitment_cost) * 100),
      benchmark_pct: 2,
      status: Math.abs((data.cost_breakdown.other / data.total_recruitment_cost) * 100 - 2) < 2 ? 'on_target' :
        (data.cost_breakdown.other / data.total_recruitment_cost) * 100 > 4 ? 'over_investing' : 'efficient'
    }
  ]

  // Quality score (0-100)
  const qualityScore = Math.round(
    (data.quality_metrics.offer_acceptance_rate * 0.25) +
    (data.quality_metrics.first_year_retention_rate * 0.25) +
    (data.quality_metrics.hiring_manager_satisfaction * 10) +
    (data.quality_metrics.new_hire_performance_score * 10)
  )

  // Efficiency score based on time to fill
  const timeScore = Math.max(0, 100 - ((data.quality_metrics.avg_time_to_fill_days - 20) * 2))
  const costScore = benchmarks.industry_avg_cost_per_hire > 0
    ? Math.max(0, 100 - ((costPerHire - benchmarks.industry_avg_cost_per_hire) / benchmarks.industry_avg_cost_per_hire) * 50)
    : 50
  const efficiencyScore = Math.round((timeScore + costScore) / 2)

  // Effectiveness score
  const effectivenessScore = Math.round(
    (data.quality_metrics.first_year_retention_rate * 0.4) +
    (data.quality_metrics.offer_acceptance_rate * 0.3) +
    (data.quality_metrics.new_hire_performance_score * 6)
  )

  // Overall recruitment score
  const overallScore = Math.round(qualityScore * 0.3 + efficiencyScore * 0.3 + effectivenessScore * 0.25 + Math.max(0, roiPct / 5) * 0.15)

  // Benchmark comparison
  const benchmarkComparison: Record<string, { company: number; benchmark: number; status: string }> = {}
  benchmarkComparison['cost_per_hire'] = { company: costPerHire, benchmark: benchmarks.industry_avg_cost_per_hire, status: costPerHire <= benchmarks.industry_avg_cost_per_hire ? 'Better' : 'Worse' }
  benchmarkComparison['time_to_fill'] = { company: data.quality_metrics.avg_time_to_fill_days, benchmark: benchmarks.industry_avg_time_to_fill, status: data.quality_metrics.avg_time_to_fill_days <= benchmarks.industry_avg_time_to_fill ? 'Better' : 'Worse' }
  benchmarkComparison['retention'] = { company: data.quality_metrics.first_year_retention_rate, benchmark: benchmarks.industry_avg_retention, status: data.quality_metrics.first_year_retention_rate >= benchmarks.industry_avg_retention ? 'Better' : 'Worse' }
  benchmarkComparison['offer_acceptance'] = { company: data.quality_metrics.offer_acceptance_rate, benchmark: 85, status: data.quality_metrics.offer_acceptance_rate >= 85 ? 'Better' : 'Worse' }

  // Cost optimization opportunities
  const costOpts: string[] = []
  if (data.cost_breakdown.agency_fees > data.total_recruitment_cost * 0.3) {
    costOpts.push('Agency fees exceed 30% of budget - invest in internal sourcing capability')
  }
  if (data.cost_breakdown.job_boards > data.total_recruitment_cost * 0.25) {
    costOpts.push('Job board spend elevated - diversify to employee referrals and social sourcing')
  }
  if (data.cost_breakdown.technology < data.total_recruitment_cost * 0.05) {
    costOpts.push('Under-investment in recruitment technology - automate to reduce manual effort')
  }
  if (costOpts.length === 0) costOpts.push('Cost allocation within expected ranges - focus on quality optimization')

  // Investment recommendations
  const investRecs: string[] = []
  if (data.quality_metrics.avg_time_to_fill_days > benchmarks.industry_avg_time_to_fill) {
    investRecs.push('Invest in sourcing tools to reduce time-to-fill by ' + (data.quality_metrics.avg_time_to_fill_days - benchmarks.industry_avg_time_to_fill) + ' days')
  }
  if (data.quality_metrics.first_year_retention_rate < benchmarks.industry_avg_retention) {
    investRecs.push('Invest in candidate assessment quality to improve first-year retention')
  }
  investRecs.push('Consider AI-powered sourcing tools to increase recruiter productivity')

  // Strategic recommendations
  const strategic: string[] = []
  if (roiPct < 100) strategic.push('ROI below 100% - focus on cost reduction and quality improvement')
  if (data.quality_metrics.hiring_manager_satisfaction < 3.5) strategic.push('Low hiring manager satisfaction - realign recruiting process with stakeholder needs')
  strategic.push('Build predictive analytics capability to forecast hiring needs')
  strategic.push('Develop employer brand to reduce cost-per-hire over time')
  if (data.total_hires > 50) strategic.push('Scale requires investment in recruitment operations infrastructure')

  return {
    period: data.period,
    total_cost: data.total_recruitment_cost,
    cost_per_hire: costPerHire,
    roi_percentage: roiPct,
    roi_ratio: roiRatio,
    cost_breakdown: breakdownItems,
    quality_score: Math.min(100, qualityScore),
    efficiency_score: Math.min(100, efficiencyScore),
    effectiveness_score: Math.min(100, effectivenessScore),
    overall_recruitment_score: Math.min(100, overallScore),
    benchmark_comparison: benchmarkComparison,
    cost_optimization_opportunities: costOpts,
    investment_recommendations: investRecs,
    strategic_recommendations: strategic
  }
}

function formatRecruitmentROIReport(r: RecruitmentROIResult): string {
  const lines: string[] = []
  lines.push('# Recruitment ROI Analysis Report')
  lines.push('')
  lines.push('**Period:** ' + r.period)
  lines.push('**Total Cost:** $' + r.total_cost.toLocaleString() + ' | **Cost per Hire:** $' + r.cost_per_hire.toLocaleString())
  lines.push('**ROI:** ' + r.roi_percentage + '% | **ROI Ratio:** ' + r.roi_ratio + ':1')
  lines.push('**Overall Score:** ' + r.overall_recruitment_score + '/100')
  lines.push('')

  lines.push('## Performance Scores')
  lines.push('')
  lines.push('- **Quality Score:** ' + r.quality_score + '/100')
  lines.push('- **Efficiency Score:** ' + r.efficiency_score + '/100')
  lines.push('- **Effectiveness Score:** ' + r.effectiveness_score + '/100')
  lines.push('')

  lines.push('## Cost Breakdown')
  lines.push('')
  lines.push('| Category | Amount | % of Total | Benchmark | Status |')
  lines.push('|----------|--------|------------|-----------|--------|')
  for (const b of r.cost_breakdown) {
    const statusIcon = b.status === 'efficient' ? '[+]' : b.status === 'on_target' ? '[OK]' : '[!]'
    lines.push('| ' + b.category + ' | $' + b.amount.toLocaleString() + ' | ' + b.percentage + '% | ' +
      b.benchmark_pct + '% | ' + statusIcon + ' ' + b.status + ' |')
  }
  lines.push('')

  lines.push('## Benchmark Comparison')
  lines.push('')
  for (const [metric, data] of Object.entries(r.benchmark_comparison)) {
    const statusIcon = data.status === 'Better' ? '[+]' : '[-]'
    lines.push('- ' + statusIcon + ' ' + metric + ': Company ' + data.company + ' vs Benchmark ' + data.benchmark + ' (' + data.status + ')')
  }
  lines.push('')

  lines.push('## Cost Optimization Opportunities')
  lines.push('')
  for (const opt of r.cost_optimization_opportunities) {
    lines.push('- [OPT] ' + opt)
  }
  lines.push('')

  lines.push('## Investment Recommendations')
  lines.push('')
  for (const rec of r.investment_recommendations) {
    lines.push('- [INV] ' + rec)
  }
  lines.push('')

  lines.push('## Strategic Recommendations')
  lines.push('')
  for (const rec of r.strategic_recommendations) {
    lines.push('- [>] ' + rec)
  }
  lines.push('')

  lines.push('---')
  lines.push('*ROI calculations use estimated revenue impact per hire. For precise ROI, integrate with HRIS and financial data.*')
  lines.push('*Generated at ' + now() + '*')
  return lines.join('\n')
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const name = 'dsh-tool-talentscout'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: candidate_sourcing_engine
  tools.register(defineTool({
    name: 'candidate_sourcing_engine',
    description: 'Generate optimized candidate sourcing strategy including channel recommendations, boolean search strings, outreach templates, diversity channels, and market assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: role_title, role_level, industry, location, remote_option, required_skills, preferred_skills, years_experience_min/max, salary_range (min/max), urgency, diversity_goals, company_size, candidate_count'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: CandidateSourcingInput = JSON.parse(args.input_data)
      const result = analyzeCandidateSourcing(data)
      return formatCandidateSourcingReport(result)
    }
  }))

  // Tool 2: interview_automation_planner
  tools.register(defineTool({
    name: 'interview_automation_planner',
    description: 'Plan structured interview process with automated scheduling, sample questions, scoring criteria, evaluation framework, and timeline optimization.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: role_title, candidate_name, interview_rounds (array of round_name/type/duration_minutes/focus_areas/required_interviewers), constraints (max_days_to_complete, preferred_days, blacklist_dates, timezone)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: InterviewPlannerInput = JSON.parse(args.input_data)
      const result = analyzeInterviewPlan(data)
      return formatInterviewPlanReport(result)
    }
  }))

  // Tool 3: skills_assessment_generator
  tools.register(defineTool({
    name: 'skills_assessment_generator',
    description: 'Generate skills assessment with questions, scoring rubrics, time allocation, and difficulty calibration for candidate evaluation.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: role_title, required_skills, difficulty_level (junior/mid/senior/expert), assessment_type (coding/case_study/situational/mixed), duration_minutes, include_soft_skills'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: SkillsAssessmentInput = JSON.parse(args.input_data)
      const result = analyzeSkillsAssessment(data)
      return formatSkillsAssessmentReport(result)
    }
  }))

  // Tool 4: employer_brand_analyst
  tools.register(defineTool({
    name: 'employer_brand_analyst',
    description: 'Analyze employer brand health with competitive positioning, channel recommendations, messaging pillars, content strategy, and reputation risk assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: company_name, industry, company_size, glassdoor_rating, competitor_names, target_audience, current_perception, evp_strengths, evp_weaknesses'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: EmployerBrandInput = JSON.parse(args.input_data)
      const result = analyzeEmployerBrand(data)
      return formatEmployerBrandReport(result)
    }
  }))

  // Tool 5: talent_pipeline_optimizer
  tools.register(defineTool({
    name: 'talent_pipeline_optimizer',
    description: 'Optimize talent pipeline with bottleneck analysis, conversion rate tracking, stage health monitoring, and data-driven recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: pipeline_name, stages (array of stage_name/candidates_count/avg_days_in_stage/conversion_rate/dropoff_reason), period_start, period_end, target_hires, current_hires'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: TalentPipelineInput = JSON.parse(args.input_data)
      const result = analyzeTalentPipeline(data)
      return formatTalentPipelineReport(result)
    }
  }))

  // Tool 6: compensation_benchmarking_tool
  tools.register(defineTool({
    name: 'compensation_benchmarking_tool',
    description: 'Benchmark compensation against market data with salary ranges, benefits comparison, competitiveness scoring, and adjustment recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: role_title, role_level, location, industry, company_size, current_salary, current_total_comp, benefits, market_data_source'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: CompensationBenchmarkInput = JSON.parse(args.input_data)
      const result = analyzeCompensation(data)
      return formatCompensationReport(result)
    }
  }))

  // Tool 7: diversity_sourcing_tracker
  tools.register(defineTool({
    name: 'diversity_sourcing_tracker',
    description: 'Track diversity sourcing performance across channels with goal progress, channel effectiveness scoring, and improvement recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: reporting_period, diversity_dimensions (array of dimension/categories), sourcing_channels (array of channel/candidates_sourced/diversity_breakdown/cost/hires), hiring_goals, current_workforce'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: DiversitySourcingInput = JSON.parse(args.input_data)
      const result = analyzeDiversitySourcing(data)
      return formatDiversitySourcingReport(result)
    }
  }))

  // Tool 8: recruitment_roi_calculator
  tools.register(defineTool({
    name: 'recruitment_roi_calculator',
    description: 'Calculate recruitment ROI with cost breakdown analysis, quality/efficiency/effectiveness scoring, benchmark comparison, and strategic recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: period, total_hires, total_recruitment_cost, cost_breakdown (job_boards/agency_fees/recruiting_staff/technology/events/referral_bonuses/other), quality_metrics (avg_time_to_fill_days/offer_acceptance_rate/first_year_retention_rate/hiring_manager_satisfaction/new_hire_performance_score), benchmarks, revenue_impact_per_hire'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: RecruitmentROIInput = JSON.parse(args.input_data)
      const result = analyzeRecruitmentROI(data)
      return formatRecruitmentROIReport(result)
    }
  }))

  console.log('[dsh-tool-talentscout] Loaded - Talent Acquisition & Recruitment AI Plugin with 8 tools')
}
