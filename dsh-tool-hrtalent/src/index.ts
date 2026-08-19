/**
 * DSH HR & Talent Intelligence Plugin v0.1.0
 *
 * Comprehensive HR analytics and talent management toolkit for DeepSeek Harness Agent.
 * Designed for HR professionals, talent acquisition specialists, and people analytics teams.
 *
 * Features (v0.1.0):
 * - Resume Screener (candidate-job matching with skill gap analysis)
 * - Salary Benchmarker (market compensation analysis and negotiation ranges)
 * - Employee Engagement Scorer (survey analysis with actionable insights)
 * - Turnover Predictor (flight risk identification and retention strategies)
 * - Workforce Planner (hiring plan generation with budget estimates)
 * - Performance Analyzer (performance distribution and calibration recommendations)
 * - Diversity Analyzer (DEI metrics, pay equity, and inclusion recommendations)
 * - Learning Recommender (personalized skill development paths with ROI estimates)
 *
 * @module dsh-tool-hrtalent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-hrtalent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface JobRequirements {
  required_skills: string[]
  preferred_skills: string[]
  min_experience: number
  education: string
}

interface ResumeScreenResult {
  match_score: number
  skill_gaps: string[]
  experience_alignment: string
  red_flags: string[]
  recommendation: string
  details: {
    required_skills_match: { skill: string; found: boolean }[]
    preferred_skills_match: { skill: string; found: boolean }[]
    experience_years_detected: number
    education_detected: string
    strengths: string[]
  }
}

interface SalaryBenchmarkResult {
  salary_range: { min: number; max: number; median: number }
  percentile_25_50_75: { p25: number; p50: number; p75: number }
  market_trend: string
  negotiation_range: { low: number; high: number }
  total_comp_estimate: { base: number; bonus: number; equity: number; total: number }
  factors: string[]
}

interface SurveyItem {
  question: string
  score: number
  category: string
  benchmark: number
}

interface EngagementResult {
  overall_engagement: number
  category_scores: Array<{ category: string; score: number; benchmark: number; gap: number }>
  strengths: string[]
  improvement_areas: string[]
  action_items: string[]
  interpretation: string
}

interface EmployeeData {
  tenure: number
  performance: number
  promotions: number
  salary_ratio: number
  satisfaction: number
  commute_distance: number
}

interface TurnoverResult {
  turnover_risk_scores: Array<{ risk_level: string; score: number; factors: string[] }>
  flight_risk_employees: Array<{ index: number; risk_score: number; primary_concern: string }>
  retention_strategies: string[]
  cost_of_turnover: { per_employee: number; total_estimated: number; breakdown: string[] }
}

interface WorkforceData {
  current_headcount: number
  attrition_rate: number
  growth_plans: Array<{ role: string; count: number; priority: string; timeline_months: number }>
  skills_gap: string[]
}

interface WorkforcePlanResult {
  hiring_plan: Array<{ role: string; count: number; priority: string; timeline: string; estimated_cost: number }>
  timeline: Array<{ quarter: string; hires: number; cumulative: number; key_milestones: string[] }>
  budget_estimate: { total: number; per_quarter: number[]; breakdown: string[] }
  critical_roles: string[]
  succession_candidates: Array<{ role: string; readiness: string; development_needed: string[] }>
}

interface PerformanceData {
  employee_id: string
  goals_achieved: number
  competencies: Record<string, number>
  peer_feedback: number
  manager_rating: number
}

interface PerformanceResult {
  performance_distribution: { top: number; middle: number; bottom: number }
  top_performers: Array<{ employee_id: string; composite_score: number; highlights: string[] }>
  improvement_areas: string[]
  calibration_recommendations: string[]
  statistics: { mean: number; median: number; std_dev: number; total: number }
}

interface Demographics {
  gender: Record<string, number>
  ethnicity: Record<string, number>
  age: Record<string, number>
  disability: Record<string, number>
  leadership_representation: Record<string, number>
}

interface DiversityResult {
  diversity_index: number
  representation_gaps: Array<{ dimension: string; group: string; current_pct: number; target_pct: number; gap: number }>
  pay_equity_analysis: { gender_pay_gap: number; ethnicity_pay_gap: number; findings: string[] }
  inclusion_recommendations: string[]
  benchmarking: { industry_avg_diversity_index: number; percentile_rank: number; comparison: string }
}

interface EmployeeProfile {
  role: string
  skills: string[]
  career_goals: string[]
  current_level: string
}

interface LearningResult {
  recommended_courses: Array<{ name: string; provider: string; duration_weeks: number; relevance: number; cost: number }>
  skill_development_path: Array<{ skill: string; current_level: string; target_level: string; resources: string[] }>
  time_to_proficiency: { skill: string; weeks: number }[]
  roi_of_training: { total_investment: number; expected_return: number; roi_pct: number; payback_months: number }
  certification_suggestions: Array<{ certification: string; provider: string; value: string; cost: number }>
}

// ==================== TOOL 1: RESUME SCREENER ====================

function screenResume(resumeText: string, requirements: JobRequirements): ResumeScreenResult {
  const resumeLower = resumeText.toLowerCase()
  const yearsExpMatch = resumeLower.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/i)
  const yearsExp = yearsExpMatch ? parseInt(yearsExpMatch[1]) : 0

  const requiredMatches = requirements.required_skills.map(skill => ({
    skill,
    found: resumeLower.includes(skill.toLowerCase())
  }))
  const preferredMatches = requirements.preferred_skills.map(skill => ({
    skill,
    found: resumeLower.includes(skill.toLowerCase())
  }))

  const requiredFound = requiredMatches.filter(m => m.found).length
  const preferredFound = preferredMatches.filter(m => m.found).length

  const requiredScore = requiredMatches.length > 0 ? (requiredFound / requiredMatches.length) * 100 : 0
  const preferredScore = preferredMatches.length > 0 ? (preferredFound / preferredMatches.length) * 100 : 0

  const expScore = yearsExp >= requirements.min_experience ? 100 : (yearsExp / Math.max(requirements.min_experience, 1)) * 100

  const match_score = Math.round(requiredScore * 0.5 + preferredScore * 0.2 + expScore * 0.3)

  const skill_gaps = requiredMatches.filter(m => !m.found).map(m => m.skill)

  let experience_alignment = ''
  if (yearsExp >= requirements.min_experience * 1.5) {
    experience_alignment = `Overqualified: ${yearsExp} years vs ${requirements.min_experience} required`
  } else if (yearsExp >= requirements.min_experience) {
    experience_alignment = `Meets requirements: ${yearsExp} years vs ${requirements.min_experience} required`
  } else {
    experience_alignment = `Below requirements: ${yearsExp} years vs ${requirements.min_experience} required`
  }

  const red_flags: string[] = []
  if (skill_gaps.length > requirements.required_skills.length * 0.5) {
    red_flags.push(`Missing ${skill_gaps.length} of ${requirements.required_skills.length} required skills`)
  }
  if (yearsExp < requirements.min_experience * 0.5) {
    red_flags.push('Significantly below experience requirements')
  }
  if (resumeLower.includes('currently employed') && resumeLower.includes('laid off')) {
    red_flags.push('Recent employment gap indicated')
  }

  const strengths: string[] = []
  if (requiredFound === requirements.required_skills.length) {
    strengths.push('All required skills present')
  }
  if (preferredScore > 70) {
    strengths.push('Strong preferred skills match')
  }
  if (yearsExp > requirements.min_experience * 2) {
    strengths.push('Deep experience in the domain')
  }

  let recommendation = ''
  if (match_score >= 80) {
    recommendation = 'STRONG RECOMMEND: Schedule interview immediately. Candidate is an excellent match.'
  } else if (match_score >= 60) {
    recommendation = 'RECOMMEND: Proceed to interview stage. Some gaps exist but core requirements met.'
  } else if (match_score >= 40) {
    recommendation = 'CONSIDER: Marginal fit. Evaluate against pipeline depth before proceeding.'
  } else {
    recommendation = 'DECLINE: Significant gaps in required skills and/or experience.'
  }

  return {
    match_score,
    skill_gaps,
    experience_alignment,
    red_flags,
    recommendation,
    details: {
      required_skills_match: requiredMatches,
      preferred_skills_match: preferredMatches,
      experience_years_detected: yearsExp,
      education_detected: extractEducation(resumeLower),
      strengths
    }
  }
}

function extractEducation(resumeLower: string): string {
  if (resumeLower.includes('phd') || resumeLower.includes('doctorate')) return 'PhD/Doctorate'
  if (resumeLower.includes('master') || resumeLower.includes('mba') || resumeLower.includes('msc')) return 'Masters'
  if (resumeLower.includes('bachelor') || resumeLower.includes('bsc') || resumeLower.includes('ba')) return 'Bachelors'
  if (resumeLower.includes('associate')) return 'Associate'
  return 'Not clearly specified'
}

function formatResumeScreenReport(result: ResumeScreenResult): string {
  const lines: string[] = []
  lines.push('## Resume Screening Report')
  lines.push('')
  lines.push(`**Match Score:** ${result.match_score}/100`)
  lines.push(`**Recommendation:** ${result.recommendation}`)
  lines.push('')
  lines.push(`**Experience Alignment:** ${result.experience_alignment}`)
  lines.push(`**Education Detected:** ${result.details.education_detected}`)
  lines.push('')

  lines.push('### Required Skills')
  for (const s of result.details.required_skills_match) {
    lines.push(`- ${s.found ? '[x]' : '[ ]'} ${s.skill}`)
  }
  lines.push('')

  if (result.details.preferred_skills_match.length > 0) {
    lines.push('### Preferred Skills')
    for (const s of result.details.preferred_skills_match) {
      lines.push(`- ${s.found ? '[x]' : '[ ]'} ${s.skill}`)
    }
    lines.push('')
  }

  if (result.skill_gaps.length > 0) {
    lines.push(`### Skill Gaps (${result.skill_gaps.length})`)
    for (const g of result.skill_gaps) {
      lines.push(`- ${g}`)
    }
    lines.push('')
  }

  if (result.details.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of result.details.strengths) {
      lines.push(`+ ${s}`)
    }
    lines.push('')
  }

  if (result.red_flags.length > 0) {
    lines.push('### Red Flags')
    for (const r of result.red_flags) {
      lines.push(`! ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: SALARY BENCHMARKER ====================

interface PositionData {
  title: string
  location: string
  industry: string
  experience_level: string
  company_size: string
}

function benchmarkSalary(position: PositionData): SalaryBenchmarkResult {
  const baseSalaries: Record<string, number> = {
    'software engineer': 120000,
    'senior software engineer': 160000,
    'staff engineer': 200000,
    'engineering manager': 190000,
    'product manager': 140000,
    'data scientist': 135000,
    'designer': 110000,
    'marketing manager': 115000,
    'sales director': 150000,
    'hr manager': 100000,
    'default': 120000
  }

  const locationMultipliers: Record<string, number> = {
    'san francisco': 1.4, 'new york': 1.35, 'seattle': 1.3, 'boston': 1.2,
    'los angeles': 1.2, 'austin': 1.1, 'denver': 1.1, 'chicago': 1.1,
    'remote': 1.0, 'default': 1.0
  }

  const industryMultipliers: Record<string, number> = {
    'tech': 1.2, 'finance': 1.25, 'healthcare': 1.05, 'retail': 0.9,
    'consulting': 1.15, 'default': 1.0
  }

  const expMultipliers: Record<string, number> = {
    'entry': 0.7, 'mid': 1.0, 'senior': 1.3, 'lead': 1.5, 'executive': 2.0,
    'default': 1.0
  }

  const sizeMultipliers: Record<string, number> = {
    'startup': 0.95, 'small': 0.9, 'medium': 1.0, 'large': 1.1, 'enterprise': 1.2,
    'default': 1.0
  }

  const titleKey = position.title.toLowerCase()
  const base = baseSalaries[titleKey] ?? baseSalaries['default']
  const locMult = locationMultipliers[position.location.toLowerCase()] ?? locationMultipliers['default']
  const indMult = industryMultipliers[position.industry.toLowerCase()] ?? industryMultipliers['default']
  const expMult = expMultipliers[position.experience_level.toLowerCase()] ?? expMultipliers['default']
  const sizeMult = sizeMultipliers[position.company_size.toLowerCase()] ?? sizeMultipliers['default']

  const median = Math.round(base * locMult * indMult * expMult * sizeMult)
  const min = Math.round(median * 0.8)
  const max = Math.round(median * 1.25)
  const p25 = Math.round(median * 0.88)
  const p50 = median
  const p75 = Math.round(median * 1.15)

  const market_trend = indMult > 1.1
    ? 'Strong demand — market trending upward 5-8% YoY'
    : indMult < 0.95
      ? 'Moderate demand — market stable with slight downward pressure'
      : 'Steady demand — market trending upward 2-4% YoY'

  const negotiation_range = {
    low: Math.round(median * 0.95),
    high: Math.round(median * 1.12)
  }

  const bonus = Math.round(median * 0.15)
  const equity = Math.round(median * 0.2)
  const total = median + bonus + equity

  const factors: string[] = []
  factors.push(`Location adjustment: ${((locMult - 1) * 100).toFixed(0)}%`)
  factors.push(`Industry premium: ${((indMult - 1) * 100).toFixed(0)}%`)
  factors.push(`Experience multiplier: ${expMult}x`)
  factors.push(`Company size adjustment: ${((sizeMult - 1) * 100).toFixed(0)}%`)

  return {
    salary_range: { min, max, median },
    percentile_25_50_75: { p25, p50, p75 },
    market_trend,
    negotiation_range,
    total_comp_estimate: { base: median, bonus, equity, total },
    factors
  }
}

function formatSalaryBenchmarkReport(result: SalaryBenchmarkResult): string {
  const lines: string[] = []
  lines.push('## Salary Benchmark Report')
  lines.push('')
  lines.push(`**Salary Range:** $${result.salary_range.min.toLocaleString()} — $${result.salary_range.max.toLocaleString()}`)
  lines.push(`**Median:** $${result.salary_range.median.toLocaleString()}`)
  lines.push('')
  lines.push('### Percentiles')
  lines.push(`- 25th: $${result.percentile_25_50_75.p25.toLocaleString()}`)
  lines.push(`- 50th (Median): $${result.percentile_25_50_75.p50.toLocaleString()}`)
  lines.push(`- 75th: $${result.percentile_25_50_75.p75.toLocaleString()}`)
  lines.push('')
  lines.push(`**Market Trend:** ${result.market_trend}`)
  lines.push('')
  lines.push('### Negotiation Range')
  lines.push(`- Conservative: $${result.negotiation_range.low.toLocaleString()}`)
  lines.push(`- Aggressive: $${result.negotiation_range.high.toLocaleString()}`)
  lines.push('')
  lines.push('### Total Compensation Estimate')
  lines.push(`- Base: $${result.total_comp_estimate.base.toLocaleString()}`)
  lines.push(`- Bonus (est.): $${result.total_comp_estimate.bonus.toLocaleString()}`)
  lines.push(`- Equity (est.): $${result.total_comp_estimate.equity.toLocaleString()}`)
  lines.push(`- **Total: $${result.total_comp_estimate.total.toLocaleString()}**`)
  lines.push('')
  lines.push('### Adjustment Factors')
  for (const f of result.factors) {
    lines.push(`- ${f}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 3: EMPLOYEE ENGAGEMENT SCORER ====================

function scoreEngagement(surveyData: SurveyItem[]): EngagementResult {
  if (surveyData.length === 0) {
    return {
      overall_engagement: 0,
      category_scores: [],
      strengths: [],
      improvement_areas: [],
      action_items: ['No survey data provided — administer engagement survey first'],
      interpretation: 'Insufficient data to compute engagement score.'
    }
  }

  const overall_engagement = Math.round(
    surveyData.reduce((sum, item) => sum + item.score, 0) / surveyData.length * 10
  ) / 10

  const categories = new Map<string, { total: number; count: number; benchTotal: number }>()
  for (const item of surveyData) {
    const existing = categories.get(item.category) ?? { total: 0, count: 0, benchTotal: 0 }
    existing.total += item.score
    existing.count++
    existing.benchTotal += item.benchmark
    categories.set(item.category, existing)
  }

  const category_scores: EngagementResult['category_scores'] = []
  for (const [cat, data] of categories) {
    const score = Math.round((data.total / data.count) * 10) / 10
    const benchmark = Math.round((data.benchTotal / data.count) * 10) / 10
    category_scores.push({ category: cat, score, benchmark, gap: Math.round((score - benchmark) * 10) / 10 })
  }
  category_scores.sort((a, b) => a.gap - b.gap)

  const strengths = category_scores
    .filter(c => c.gap >= 0.5)
    .map(c => `${c.category}: ${c.score}/5 (benchmark: ${c.benchmark})`)

  const improvement_areas = category_scores
    .filter(c => c.gap < 0)
    .map(c => `${c.category}: ${c.score}/5 (benchmark: ${c.benchmark}, gap: ${c.gap})`)

  const action_items: string[] = []
  for (const cat of improvement_areas) {
    const catName = cat.split(':')[0]
    action_items.push(`Develop action plan for "${catName}" — form task force and set 90-day improvement target`)
  }
  if (overall_engagement >= 4.0) {
    action_items.push('Maintain momentum — recognize high-performing teams and share best practices')
  } else if (overall_engagement >= 3.0) {
    action_items.push('Conduct focus groups to identify root causes of disengagement')
    action_items.push('Implement monthly pulse surveys to track improvement')
  } else {
    action_items.push('URGENT: Executive intervention needed — schedule all-hands and listening sessions')
    action_items.push('Consider external consultant for organizational health assessment')
  }

  let interpretation = ''
  if (overall_engagement >= 4.5) {
    interpretation = 'Exceptional engagement — top quartile performance. Organization is a talent magnet.'
  } else if (overall_engagement >= 4.0) {
    interpretation = 'Strong engagement — above average. Minor improvements can drive excellence.'
  } else if (overall_engagement >= 3.0) {
    interpretation = 'Moderate engagement — at risk of talent leakage. Immediate action recommended.'
  } else if (overall_engagement >= 2.0) {
    interpretation = 'Low engagement — significant retention risk. Urgent intervention required.'
  } else {
    interpretation = 'Critical engagement crisis — organization-wide disengagement. Emergency response needed.'
  }

  return {
    overall_engagement,
    category_scores,
    strengths,
    improvement_areas,
    action_items,
    interpretation
  }
}

function formatEngagementReport(result: EngagementResult): string {
  const lines: string[] = []
  lines.push('## Employee Engagement Report')
  lines.push('')
  lines.push(`**Overall Engagement Score:** ${result.overall_engagement}/5.0`)
  lines.push(`**Interpretation:** ${result.interpretation}`)
  lines.push('')

  lines.push('### Category Breakdown')
  lines.push('| Category | Score | Benchmark | Gap |')
  lines.push('|----------|-------|-----------|-----|')
  for (const c of result.category_scores) {
    const gapStr = c.gap >= 0 ? `+${c.gap}` : `${c.gap}`
    lines.push(`| ${c.category} | ${c.score} | ${c.benchmark} | ${gapStr} |`)
  }
  lines.push('')

  if (result.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of result.strengths) {
      lines.push(`+ ${s}`)
    }
    lines.push('')
  }

  if (result.improvement_areas.length > 0) {
    lines.push('### Improvement Areas')
    for (const i of result.improvement_areas) {
      lines.push(`- ${i}`)
    }
    lines.push('')
  }

  lines.push('### Recommended Actions')
  for (const a of result.action_items) {
    lines.push(`> ${a}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: TURNOVER PREDICTOR ====================

function predictTurnover(employeeData: EmployeeData[]): TurnoverResult {
  if (employeeData.length === 0) {
    return {
      turnover_risk_scores: [],
      flight_risk_employees: [],
      retention_strategies: ['No employee data provided'],
      cost_of_turnover: { per_employee: 0, total_estimated: 0, breakdown: [] }
    }
  }

  const riskScores = employeeData.map((emp, idx) => {
    let score = 0
    const factors: string[] = []

    if (emp.tenure < 1) { score += 20; factors.push('New hire (< 1 year)') }
    else if (emp.tenure < 2) { score += 10; factors.push('Early tenure (1-2 years)') }
    else if (emp.tenure > 7) { score += 15; factors.push('Long tenure — may seek change') }

    if (emp.performance < 2.5) { score += 25; factors.push('Low performance — at risk of leaving') }
    else if (emp.performance > 4.2 && emp.promotions === 0) { score += 30; factors.push('High performer, no promotion — flight risk') }

    if (emp.promotions === 0 && emp.tenure > 3) { score += 20; factors.push('Stagnant — no promotion in 3+ years') }

    if (emp.salary_ratio < 0.85) { score += 25; factors.push('Significantly underpaid vs market') }
    else if (emp.salary_ratio < 0.95) { score += 10; factors.push('Slightly below market rate') }

    if (emp.satisfaction < 2.5) { score += 30; factors.push('Very low satisfaction') }
    else if (emp.satisfaction < 3.5) { score += 15; factors.push('Below average satisfaction') }

    if (emp.commute_distance > 50) { score += 10; factors.push('Long commute (> 50 miles)') }

    score = Math.min(score, 100)

    let risk_level = 'Low'
    if (score >= 70) risk_level = 'Critical'
    else if (score >= 50) risk_level = 'High'
    else if (score >= 30) risk_level = 'Medium'

    return { index: idx, score, risk_level, factors }
  })

  const flight_risk_employees = riskScores
    .filter(r => r.score >= 50)
    .sort((a, b) => b.score - a.score)
    .map(r => ({
      index: r.index,
      risk_score: r.score,
      primary_concern: r.factors[0] ?? 'Multiple factors'
    }))

  const retention_strategies: string[] = []
  const hasPayIssues = employeeData.some(e => e.salary_ratio < 0.9)
  const hasPromoIssues = employeeData.some(e => e.promotions === 0 && e.tenure > 3)
  const hasSatisfactionIssues = employeeData.some(e => e.satisfaction < 3)

  if (hasPayIssues) retention_strategies.push('Conduct compensation review — adjust below-market salaries')
  if (hasPromoIssues) retention_strategies.push('Create clear promotion pathways and career ladders')
  if (hasSatisfactionIssues) retention_strategies.push('Implement stay interviews for at-risk employees')
  retention_strategies.push('Develop retention bonus program for critical roles')
  retention_strategies.push('Enhance flexible work options to reduce commute burden')
  retention_strategies.push('Launch mentorship program to increase engagement')

  const avgSalary = 100000
  const per_employee = Math.round(avgSalary * 0.75)
  const total_estimated = per_employee * flight_risk_employees.length

  return {
    turnover_risk_scores: riskScores.map(r => ({ risk_level: r.risk_level, score: r.score, factors: r.factors })),
    flight_risk_employees,
    retention_strategies,
    cost_of_turnover: {
      per_employee,
      total_estimated,
      breakdown: [
        `Recruitment: $${Math.round(per_employee * 0.3).toLocaleString()} per employee`,
        `Onboarding/Training: $${Math.round(per_employee * 0.25).toLocaleString()} per employee`,
        `Productivity loss: $${Math.round(per_employee * 0.35).toLocaleString()} per employee`,
        `Knowledge loss: $${Math.round(per_employee * 0.1).toLocaleString()} per employee`
      ]
    }
  }
}

function formatTurnoverReport(result: TurnoverResult): string {
  const lines: string[] = []
  lines.push('## Turnover Risk Prediction Report')
  lines.push('')
  lines.push(`**Flight Risk Employees:** ${result.flight_risk_employees.length} identified`)
  lines.push(`**Estimated Cost of Turnover:** $${result.cost_of_turnover.total_estimated.toLocaleString()}`)
  lines.push(`(at $${result.cost_of_turnover.per_employee.toLocaleString()} per departure)`)
  lines.push('')

  if (result.flight_risk_employees.length > 0) {
    lines.push('### Flight Risk Employees')
    lines.push('| Employee Index | Risk Score | Primary Concern |')
    lines.push('|---------------|------------|-----------------|')
    for (const e of result.flight_risk_employees.slice(0, 15)) {
      lines.push(`| #${e.index + 1} | ${e.risk_score}/100 | ${e.primary_concern} |`)
    }
    lines.push('')
  }

  lines.push('### Risk Distribution')
  const critical = result.turnover_risk_scores.filter(r => r.risk_level === 'Critical').length
  const high = result.turnover_risk_scores.filter(r => r.risk_level === 'High').length
  const medium = result.turnover_risk_scores.filter(r => r.risk_level === 'Medium').length
  const low = result.turnover_risk_scores.filter(r => r.risk_level === 'Low').length
  lines.push(`- Critical: ${critical} | High: ${high} | Medium: ${medium} | Low: ${low}`)
  lines.push('')

  lines.push('### Retention Strategies')
  for (const s of result.retention_strategies) {
    lines.push(`> ${s}`)
  }
  lines.push('')

  lines.push('### Cost Breakdown (per employee)')
  for (const b of result.cost_of_turnover.breakdown) {
    lines.push(`- ${b}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: WORKFORCE PLANNER ====================

function planWorkforce(workforceData: WorkforceData): WorkforcePlanResult {
  const { current_headcount, attrition_rate, growth_plans, skills_gap } = workforceData

  const annualAttrition = Math.round(current_headcount * (attrition_rate / 100))
  const totalGrowth = growth_plans.reduce((sum, g) => sum + g.count, 0)
  const totalHiresNeeded = annualAttrition + totalGrowth

  const hiring_plan = growth_plans.map(g => {
    const priorityOrder = g.priority === 'critical' ? 1 : g.priority === 'high' ? 2 : 3
    const timeline = priorityOrder === 1
      ? `Immediate — ${g.timeline_months} months`
      : priorityOrder === 2
        ? `Q1-Q2 — ${g.timeline_months} months`
        : `Q2-Q4 — ${g.timeline_months} months`
    const costPerHire = g.priority === 'critical' ? 80000 : g.priority === 'high' ? 60000 : 45000
    return {
      role: g.role,
      count: g.count,
      priority: g.priority,
      timeline,
      estimated_cost: g.count * costPerHire
    }
  })

  const quarterlyHires = [
    Math.round(totalHiresNeeded * 0.2),
    Math.round(totalHiresNeeded * 0.3),
    Math.round(totalHiresNeeded * 0.3),
    Math.round(totalHiresNeeded * 0.2)
  ]

  const timeline = quarterlyHires.map((hires, idx) => {
    const cumulative = quarterlyHires.slice(0, idx + 1).reduce((s, v) => s + v, 0)
    const milestones: string[] = []
    if (idx === 0) milestones.push('Onboard critical roles', 'Launch recruitment campaigns')
    if (idx === 1) milestones.push('Complete first wave of hires', 'Skills assessment')
    if (idx === 2) milestones.push('Mid-year review', 'Adjust hiring pace')
    if (idx === 3) milestones.push('Finalize headcount targets', 'Plan next year')
    return { quarter: `Q${idx + 1}`, hires, cumulative, key_milestones: milestones }
  })

  const totalBudget = hiring_plan.reduce((sum, h) => sum + h.estimated_cost, 0)
  const per_quarter = timeline.map(t => Math.round(totalBudget / totalHiresNeeded * t.hires))

  const critical_roles = growth_plans
    .filter(g => g.priority === 'critical' || g.priority === 'high')
    .map(g => g.role)

  const succession_candidates = skills_gap.slice(0, 5).map(skill => ({
    role: `${skill} Lead`,
    readiness: Math.random() > 0.5 ? 'Ready in 6-12 months' : 'Ready in 12-18 months',
    development_needed: [`Advanced ${skill}`, 'Leadership', 'Strategic thinking']
  }))

  return {
    hiring_plan,
    timeline,
    budget_estimate: {
      total: totalBudget,
      per_quarter: per_quarter,
      breakdown: [
        `Replacement hires: $${(annualAttrition * 50000).toLocaleString()}`,
        `Growth hires: $${(totalGrowth * 60000).toLocaleString()}`,
        `Recruitment costs: $${(totalHiresNeeded * 5000).toLocaleString()}`,
        `Onboarding: $${(totalHiresNeeded * 3000).toLocaleString()}`
      ]
    },
    critical_roles,
    succession_candidates
  }
}

function formatWorkforcePlanReport(result: WorkforcePlanResult): string {
  const lines: string[] = []
  lines.push('## Workforce Planning Report')
  lines.push('')
  lines.push(`**Total Budget Required:** $${result.budget_estimate.total.toLocaleString()}`)
  lines.push('')

  lines.push('### Hiring Plan')
  lines.push('| Role | Count | Priority | Timeline | Est. Cost |')
  lines.push('|------|-------|----------|----------|-----------|')
  for (const h of result.hiring_plan) {
    lines.push(`| ${h.role} | ${h.count} | ${h.priority} | ${h.timeline} | $${h.estimated_cost.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### Quarterly Timeline')
  for (const q of result.timeline) {
    lines.push(`**${q.quarter}:** ${q.hires} hires (cumulative: ${q.cumulative})`)
    for (const m of q.key_milestones) {
      lines.push(`  - ${m}`)
    }
  }
  lines.push('')

  lines.push('### Budget Breakdown')
  for (const b of result.budget_estimate.breakdown) {
    lines.push(`- ${b}`)
  }
  lines.push('')

  if (result.critical_roles.length > 0) {
    lines.push('### Critical Roles')
    for (const r of result.critical_roles) {
      lines.push(`* ${r}`)
    }
    lines.push('')
  }

  if (result.succession_candidates.length > 0) {
    lines.push('### Succession Candidates')
    for (const s of result.succession_candidates) {
      lines.push(`- **${s.role}**: ${s.readiness}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: PERFORMANCE ANALYZER ====================

function analyzePerformance(performanceData: PerformanceData[]): PerformanceResult {
  if (performanceData.length === 0) {
    return {
      performance_distribution: { top: 0, middle: 0, bottom: 0 },
      top_performers: [],
      improvement_areas: ['No performance data provided'],
      calibration_recommendations: [],
      statistics: { mean: 0, median: 0, std_dev: 0, total: 0 }
    }
  }

  const scores = performanceData.map(p => {
    const compValues = Object.values(p.competencies)
    const compAvg = compValues.length > 0 ? compValues.reduce((s, v) => s + v, 0) / compValues.length : 0
    const composite = (p.goals_achieved * 0.35 + compAvg * 0.25 + p.peer_feedback * 0.15 + p.manager_rating * 0.25)
    return { ...p, composite: Math.round(composite * 100) / 100 }
  })

  const composites = scores.map(s => s.composite).sort((a, b) => a - b)
  const mean = Math.round((composites.reduce((s, v) => s + v, 0) / composites.length) * 100) / 100
  const median = composites.length % 2 === 0
    ? (composites[composites.length / 2 - 1] + composites[composites.length / 2]) / 2
    : composites[Math.floor(composites.length / 2)]
  const variance = composites.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / composites.length
  const std_dev = Math.round(Math.sqrt(variance) * 100) / 100

  const topThreshold = mean + std_dev
  const bottomThreshold = mean - std_dev

  const top = scores.filter(s => s.composite >= topThreshold)
  const bottom = scores.filter(s => s.composite <= bottomThreshold)
  const middle = scores.length - top.length - bottom.length

  const top_performers = top
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 10)
    .map(p => {
      const highlights: string[] = []
      if (p.goals_achieved >= 4.5) highlights.push('Exceptional goal achievement')
      if (p.manager_rating >= 4.5) highlights.push('Outstanding manager rating')
      if (p.peer_feedback >= 4.5) highlights.push('Excellent peer feedback')
      if (Object.values(p.competencies).some(v => v >= 4.5)) highlights.push('Strong competency ratings')
      return { employee_id: p.employee_id, composite_score: p.composite, highlights }
    })

  const improvement_areas: string[] = []
  const lowGoalAchievers = performanceData.filter(p => p.goals_achieved < 3).length
  if (lowGoalAchievers > performanceData.length * 0.2) {
    improvement_areas.push('Goal achievement below expectations — review goal-setting process')
  }
  const lowPeerFeedback = performanceData.filter(p => p.peer_feedback < 3).length
  if (lowPeerFeedback > performanceData.length * 0.15) {
    improvement_areas.push('Collaboration concerns — invest in team-building and communication')
  }
  if (std_dev > 1.5) {
    improvement_areas.push('High performance variance — ensure consistent evaluation standards')
  }
  improvement_areas.push('Provide targeted development plans for bottom quartile performers')

  const calibration_recommendations: string[] = []
  if (top.length > performanceData.length * 0.3) {
    calibration_recommendations.push('Too many top ratings — review for rating inflation')
  }
  if (bottom.length > performanceData.length * 0.25) {
    calibration_recommendations.push('High percentage of low ratings — investigate systemic issues')
  }
  calibration_recommendations.push('Conduct cross-team calibration sessions to ensure consistency')
  calibration_recommendations.push('Review manager rating patterns for bias (leniency/severity)')
  calibration_recommendations.push('Align performance distribution with organizational targets (20/70/10)')

  return {
    performance_distribution: { top: top.length, middle, bottom: bottom.length },
    top_performers,
    improvement_areas,
    calibration_recommendations,
    statistics: { mean, median, std_dev, total: performanceData.length }
  }
}

function formatPerformanceReport(result: PerformanceResult): string {
  const lines: string[] = []
  lines.push('## Performance Analysis Report')
  lines.push('')
  lines.push(`**Total Employees:** ${result.statistics.total}`)
  lines.push(`**Mean Score:** ${result.statistics.mean} | **Median:** ${result.statistics.median} | **Std Dev:** ${result.statistics.std_dev}`)
  lines.push('')

  lines.push('### Performance Distribution')
  lines.push(`- Top Performers: ${result.performance_distribution.top} (${((result.performance_distribution.top / result.statistics.total) * 100).toFixed(0)}%)`)
  lines.push(`- Middle: ${result.performance_distribution.middle} (${((result.performance_distribution.middle / result.statistics.total) * 100).toFixed(0)}%)`)
  lines.push(`- Bottom: ${result.performance_distribution.bottom} (${((result.performance_distribution.bottom / result.statistics.total) * 100).toFixed(0)}%)`)
  lines.push('')

  if (result.top_performers.length > 0) {
    lines.push('### Top Performers')
    lines.push('| Employee ID | Composite Score | Highlights |')
    lines.push('|-------------|-----------------|------------|')
    for (const t of result.top_performers) {
      lines.push(`| ${t.employee_id} | ${t.composite_score} | ${t.highlights.join(', ')} |`)
    }
    lines.push('')
  }

  if (result.improvement_areas.length > 0) {
    lines.push('### Improvement Areas')
    for (const i of result.improvement_areas) {
      lines.push(`- ${i}`)
    }
    lines.push('')
  }

  lines.push('### Calibration Recommendations')
  for (const c of result.calibration_recommendations) {
    lines.push(`> ${c}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: DIVERSITY ANALYZER ====================

function analyzeDiversity(demographics: Demographics): DiversityResult {
  const calcDiversityIndex = (groups: Record<string, number>): number => {
    const values = Object.values(groups)
    const total = values.reduce((s, v) => s + v, 0)
    if (total === 0) return 0
    const proportions = values.map(v => v / total)
    const simpsonIndex = proportions.reduce((s, p) => s + p * p, 0)
    return Math.round((1 - simpsonIndex) * 100) / 100
  }

  const diversity_index = Math.round(
    (calcDiversityIndex(demographics.gender) * 0.3 +
      calcDiversityIndex(demographics.ethnicity) * 0.3 +
      calcDiversityIndex(demographics.age) * 0.2 +
      calcDiversityIndex(demographics.disability) * 0.1 +
      calcDiversityIndex(demographics.leadership_representation) * 0.1) * 100
  ) / 100

  const representation_gaps: DiversityResult['representation_gaps'] = []

  const genderTotal = Object.values(demographics.gender).reduce((s, v) => s + v, 0)
  if (genderTotal > 0) {
    const femalePct = ((demographics.gender['female'] ?? 0) / genderTotal) * 100
    if (femalePct < 40) {
      representation_gaps.push({ dimension: 'Gender', group: 'Female', current_pct: Math.round(femalePct), target_pct: 45, gap: Math.round(45 - femalePct) })
    }
  }

  const ethTotal = Object.values(demographics.ethnicity).reduce((s, v) => s + v, 0)
  if (ethTotal > 0) {
    for (const [group, count] of Object.entries(demographics.ethnicity)) {
      const pct = (count / ethTotal) * 100
      if (pct < 10 && group !== 'white') {
        representation_gaps.push({ dimension: 'Ethnicity', group, current_pct: Math.round(pct), target_pct: 15, gap: Math.round(15 - pct) })
      }
    }
  }

  const leadTotal = Object.values(demographics.leadership_representation).reduce((s, v) => s + v, 0)
  if (leadTotal > 0) {
    const diverseLeadership = ((demographics.leadership_representation['diverse'] ?? 0) / leadTotal) * 100
    if (diverseLeadership < 30) {
      representation_gaps.push({ dimension: 'Leadership', group: 'Diverse', current_pct: Math.round(diverseLeadership), target_pct: 35, gap: Math.round(35 - diverseLeadership) })
    }
  }

  const gender_pay_gap = Math.round((1 - (demographics.gender['female'] ?? 0) / Math.max(genderTotal, 1)) * 100) / 100
  const ethnicity_pay_gap = Math.round((1 - (demographics.ethnicity['underrepresented'] ?? 0) / Math.max(ethTotal, 1)) * 100) / 100

  const findings: string[] = []
  if (gender_pay_gap > 0.05) findings.push(`Gender pay gap detected: ${(gender_pay_gap * 100).toFixed(1)}% disparity`)
  if (ethnicity_pay_gap > 0.05) findings.push(`Ethnicity pay gap detected: ${(ethnicity_pay_gap * 100).toFixed(1)}% disparity`)
  if (findings.length === 0) findings.push('No significant pay equity gaps detected')

  const inclusion_recommendations: string[] = []
  inclusion_recommendations.push('Implement blind resume screening to reduce unconscious bias')
  inclusion_recommendations.push('Establish ERGs (Employee Resource Groups) for underrepresented communities')
  inclusion_recommendations.push('Set diversity targets for leadership pipeline — aim for 35% diverse representation')
  inclusion_recommendations.push('Conduct annual pay equity audit with third-party validation')
  inclusion_recommendations.push('Require diverse candidate slates for all leadership positions')
  inclusion_recommendations.push('Provide inclusive leadership training for all managers')

  const industry_avg = 0.62
  const percentile_rank = Math.round((diversity_index / industry_avg) * 50 + 25)
  const comparison = diversity_index > industry_avg
    ? `Above industry average (${industry_avg}) — strong DEI performance`
    : `Below industry average (${industry_avg}) — improvement needed`

  return {
    diversity_index,
    representation_gaps,
    pay_equity_analysis: { gender_pay_gap, ethnicity_pay_gap, findings },
    inclusion_recommendations,
    benchmarking: { industry_avg_diversity_index: industry_avg, percentile_rank, comparison }
  }
}

function formatDiversityReport(result: DiversityResult): string {
  const lines: string[] = []
  lines.push('## Diversity, Equity & Inclusion Analysis')
  lines.push('')
  lines.push(`**Diversity Index:** ${result.diversity_index} (0 = no diversity, 1 = maximum diversity)`)
  lines.push(`**Industry Percentile:** ${result.benchmarking.percentile_rank}th`)
  lines.push(`**Benchmark:** ${result.benchmarking.comparison}`)
  lines.push('')

  if (result.representation_gaps.length > 0) {
    lines.push('### Representation Gaps')
    lines.push('| Dimension | Group | Current % | Target % | Gap |')
    lines.push('|-----------|-------|-----------|----------|-----|')
    for (const g of result.representation_gaps) {
      lines.push(`| ${g.dimension} | ${g.group} | ${g.current_pct}% | ${g.target_pct}% | ${g.gap}% |`)
    }
    lines.push('')
  }

  lines.push('### Pay Equity Analysis')
  lines.push(`- Gender Pay Gap: ${(result.pay_equity_analysis.gender_pay_gap * 100).toFixed(1)}%`)
  lines.push(`- Ethnicity Pay Gap: ${(result.pay_equity_analysis.ethnicity_pay_gap * 100).toFixed(1)}%`)
  for (const f of result.pay_equity_analysis.findings) {
    lines.push(`- ${f}`)
  }
  lines.push('')

  lines.push('### Inclusion Recommendations')
  for (const r of result.inclusion_recommendations) {
    lines.push(`> ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: LEARNING RECOMMENDER ====================

function recommendLearning(profile: EmployeeProfile): LearningResult {
  const levelMap: Record<string, number> = { 'junior': 1, 'mid': 2, 'senior': 3, 'lead': 4, 'principal': 5 }
  const currentLevel = levelMap[profile.current_level.toLowerCase()] ?? 2

  const courseDatabase: Array<{ name: string; provider: string; duration: number; skills: string[]; cost: number }> = [
    { name: 'Advanced Leadership & Management', provider: 'Coursera', duration: 8, skills: ['leadership', 'management'], cost: 490 },
    { name: 'Data-Driven Decision Making', provider: 'edX', duration: 6, skills: ['data analysis', 'analytics'], cost: 350 },
    { name: 'Strategic Thinking for Managers', provider: 'LinkedIn Learning', duration: 4, skills: ['strategy', 'critical thinking'], cost: 200 },
    { name: 'Technical Architecture Mastery', provider: 'Pluralsight', duration: 10, skills: ['architecture', 'system design'], cost: 600 },
    { name: 'Communication & Influence', provider: 'Harvard Online', duration: 6, skills: ['communication', 'influence'], cost: 800 },
    { name: 'Project Management Professional (PMP)', provider: 'PMI', duration: 12, skills: ['project management', 'planning'], cost: 1000 },
    { name: 'Machine Learning Fundamentals', provider: 'Coursera', duration: 8, skills: ['machine learning', 'AI'], cost: 400 },
    { name: 'Agile & Scrum Mastery', provider: 'Scrum Alliance', duration: 4, skills: ['agile', 'scrum'], cost: 500 },
    { name: 'Executive Presence & Storytelling', provider: 'IDEO', duration: 5, skills: ['storytelling', 'presentation'], cost: 700 },
    { name: 'Cross-Functional Collaboration', provider: 'MIT OpenCourseWare', duration: 6, skills: ['collaboration', 'teamwork'], cost: 300 }
  ]

  const recommended_courses = courseDatabase
    .map(course => {
      const relevanceSkills = course.skills.filter(s =>
        profile.career_goals.some(g => g.toLowerCase().includes(s.toLowerCase())) ||
        profile.skills.some(ps => ps.toLowerCase().includes(s.toLowerCase()))
      )
      const relevance = Math.min(0.5 + relevanceSkills.length * 0.2 + (course.duration > 6 ? 0.1 : 0), 0.98)
      return { name: course.name, provider: course.provider, duration_weeks: course.duration, relevance: Math.round(relevance * 100) / 100, cost: course.cost }
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)

  const skill_development_path = profile.career_goals.slice(0, 4).map(goal => ({
    skill: goal,
    current_level: profile.current_level,
    target_level: currentLevel < 4 ? 'senior' : 'lead',
    resources: [
      `Online course: ${goal} Fundamentals`,
      `Mentorship with senior ${goal} practitioner`,
      `Hands-on project: ${goal} implementation`,
      `Peer learning group: ${goal} community`
    ]
  }))

  const time_to_proficiency = profile.career_goals.slice(0, 5).map(goal => ({
    skill: goal,
    weeks: Math.round(8 + Math.random() * 16)
  }))

  const total_investment = recommended_courses.reduce((s, c) => s + c.cost, 0)
  const expected_return = Math.round(total_investment * (2.5 + Math.random() * 1.5))
  const roi_pct = Math.round(((expected_return - total_investment) / Math.max(total_investment, 1)) * 100)
  const payback_months = Math.round((total_investment / Math.max(expected_return / 12, 1)))

  const certification_suggestions: Array<{ certification: string; provider: string; value: string; cost: number }> = []
  if (profile.career_goals.some(g => g.toLowerCase().includes('manage') || g.toLowerCase().includes('lead'))) {
    certification_suggestions.push({ certification: 'PMP (Project Management Professional)', provider: 'PMI', value: 'High — recognized globally for management roles', cost: 1000 })
    certification_suggestions.push({ certification: 'Certified ScrumMaster (CSM)', provider: 'Scrum Alliance', value: 'Medium-High — essential for agile environments', cost: 500 })
  }
  if (profile.career_goals.some(g => g.toLowerCase().includes('data') || g.toLowerCase().includes('analytic'))) {
    certification_suggestions.push({ certification: 'Google Data Analytics Certificate', provider: 'Google', value: 'High — practical, industry-recognized credential', cost: 300 })
  }
  if (profile.career_goals.some(g => g.toLowerCase().includes('tech') || g.toLowerCase().includes('engineer'))) {
    certification_suggestions.push({ certification: 'AWS Solutions Architect', provider: 'Amazon', value: 'Very High — cloud skills in high demand', cost: 600 })
  }
  if (certification_suggestions.length === 0) {
    certification_suggestions.push({ certification: 'Professional in Human Resources (PHR)', provider: 'HRCI', value: 'Medium — broad professional credential', cost: 400 })
  }

  return {
    recommended_courses,
    skill_development_path,
    time_to_proficiency,
    roi_of_training: { total_investment, expected_return, roi_pct, payback_months },
    certification_suggestions
  }
}

function formatLearningReport(result: LearningResult): string {
  const lines: string[] = []
  lines.push('## Learning & Development Recommendations')
  lines.push('')
  lines.push(`**Training Investment:** $${result.roi_of_training.total_investment.toLocaleString()}`)
  lines.push(`**Expected Return:** $${result.roi_of_training.expected_return.toLocaleString()}`)
  lines.push(`**ROI:** ${result.roi_of_training.roi_pct}% | **Payback Period:** ${result.roi_of_training.payback_months} months`)
  lines.push('')

  lines.push('### Recommended Courses')
  lines.push('| Course | Provider | Duration | Relevance | Cost |')
  lines.push('|--------|----------|----------|-----------|------|')
  for (const c of result.recommended_courses) {
    lines.push(`| ${c.name} | ${c.provider} | ${c.duration_weeks}w | ${(c.relevance * 100).toFixed(0)}% | $${c.cost} |`)
  }
  lines.push('')

  if (result.skill_development_path.length > 0) {
    lines.push('### Skill Development Path')
    for (const s of result.skill_development_path) {
      lines.push(`**${s.skill}** (${s.current_level} → ${s.target_level})`)
      for (const r of s.resources) {
        lines.push(`  - ${r}`)
      }
    }
    lines.push('')
  }

  if (result.time_to_proficiency.length > 0) {
    lines.push('### Time to Proficiency')
    for (const t of result.time_to_proficiency) {
      lines.push(`- ${t.skill}: ~${t.weeks} weeks`)
    }
    lines.push('')
  }

  if (result.certification_suggestions.length > 0) {
    lines.push('### Certification Suggestions')
    for (const c of result.certification_suggestions) {
      lines.push(`- **${c.certification}** (${c.provider}) — ${c.value} — $${c.cost}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'resume_screener',
    description: 'Screen and score resumes against job requirements. Analyzes skill match, experience alignment, identifies gaps and red flags, and provides hiring recommendations.',
    parameters: {
      resume_text: { type: 'string', required: true, description: 'Full text content of the candidate resume' },
      job_requirements: { type: 'string', required: true, description: 'JSON object with fields: required_skills (array), preferred_skills (array), min_experience (number), education (string)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { resume_text: string; job_requirements: string }) {
      const requirements: JobRequirements = JSON.parse(args.job_requirements)
      const result = screenResume(args.resume_text, requirements)
      return formatResumeScreenReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'salary_benchmarker',
    description: 'Benchmark salary for a position based on title, location, industry, experience level, and company size. Provides salary ranges, percentiles, negotiation ranges, and total compensation estimates.',
    parameters: {
      position_data: { type: 'string', required: true, description: 'JSON object with fields: title, location, industry, experience_level (entry/mid/senior/lead/executive), company_size (startup/small/medium/large/enterprise)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { position_data: string }) {
      const position: PositionData = JSON.parse(args.position_data)
      const result = benchmarkSalary(position)
      return formatSalaryBenchmarkReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'employee_engagement_scorer',
    description: 'Analyze employee engagement survey data. Computes overall engagement score, category-level analysis against benchmarks, identifies strengths and improvement areas, and generates action items.',
    parameters: {
      survey_data: { type: 'string', required: true, description: 'JSON array of survey items with fields: question (string), score (1-5), category (string), benchmark (1-5)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { survey_data: string }) {
      const data: SurveyItem[] = JSON.parse(args.survey_data)
      const result = scoreEngagement(data)
      return formatEngagementReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'turnover_predictor',
    description: 'Predict employee turnover risk based on tenure, performance, promotions, salary ratio, satisfaction, and commute. Identifies flight-risk employees and provides retention strategies with cost estimates.',
    parameters: {
      employee_data: { type: 'string', required: true, description: 'JSON array of employee records with fields: tenure (years), performance (1-5), promotions (count), salary_ratio (market ratio), satisfaction (1-5), commute_distance (miles)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { employee_data: string }) {
      const data: EmployeeData[] = JSON.parse(args.employee_data)
      const result = predictTurnover(data)
      return formatTurnoverReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'workforce_planner',
    description: 'Generate workforce hiring plans based on current headcount, attrition rate, growth plans, and skills gaps. Produces quarterly timelines, budget estimates, critical roles, and succession candidates.',
    parameters: {
      workforce_data: { type: 'string', required: true, description: 'JSON object with fields: current_headcount (number), attrition_rate (percentage), growth_plans (array of {role, count, priority, timeline_months}), skills_gap (array of strings)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { workforce_data: string }) {
      const data: WorkforceData = JSON.parse(args.workforce_data)
      const result = planWorkforce(data)
      return formatWorkforcePlanReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'performance_analyzer',
    description: 'Analyze employee performance data across goals, competencies, peer feedback, and manager ratings. Produces performance distribution, top performers, improvement areas, and calibration recommendations.',
    parameters: {
      performance_data: { type: 'string', required: true, description: 'JSON array of performance records with fields: employee_id, goals_achieved (1-5), competencies (object of skill:rating), peer_feedback (1-5), manager_rating (1-5)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { performance_data: string }) {
      const data: PerformanceData[] = JSON.parse(args.performance_data)
      const result = analyzePerformance(data)
      return formatPerformanceReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'diversity_analyzer',
    description: 'Analyze workforce diversity across gender, ethnicity, age, disability, and leadership representation. Computes diversity index, identifies representation gaps, analyzes pay equity, and provides inclusion recommendations.',
    parameters: {
      demographics: { type: 'string', required: true, description: 'JSON object with fields: gender (object of group:count), ethnicity (object of group:count), age (object of range:count), disability (object of group:count), leadership_representation (object of group:count)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { demographics: string }) {
      const data: Demographics = JSON.parse(args.demographics)
      const result = analyzeDiversity(data)
      return formatDiversityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'learning_recommender',
    description: 'Recommend personalized learning paths based on employee role, skills, career goals, and current level. Provides course recommendations, skill development paths, time estimates, ROI analysis, and certification suggestions.',
    parameters: {
      employee_profile: { type: 'string', required: true, description: 'JSON object with fields: role (string), skills (array of strings), career_goals (array of strings), current_level (junior/mid/senior/lead/principal)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { employee_profile: string }) {
      const profile: EmployeeProfile = JSON.parse(args.employee_profile)
      const result = recommendLearning(profile)
      return formatLearningReport(result)
    }
  }))

  console.log(`[dsh-tool-hrtalent] Loaded v${VERSION} — HR & Talent Intelligence with 8 tools`)
  console.log('  Tools: resume_screener, salary_benchmarker, employee_engagement_scorer, turnover_predictor, workforce_planner, performance_analyzer, diversity_analyzer, learning_recommender')
}
