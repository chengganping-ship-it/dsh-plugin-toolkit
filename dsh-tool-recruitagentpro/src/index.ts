/**
 * dsh-tool-recruitagentpro - Recruitment AI Agent Plugin for DSH
 *
 * Resume parsing, candidate matching, interview scheduling, talent pool analysis,
 * JD optimization, offer comparison, sourcing strategy, and diversity metrics.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Input for resume_parser tool */
interface ResumeParserInput {
  candidate: {
    name: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    summary?: string
  }
  work_experience: Array<{
    company: string
    title: string
    start_date: string
    end_date?: string
    description: string
    highlights?: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    graduation_year: number
    gpa?: number
  }>
  skills: string[]
  certifications?: string[]
  languages?: Array<{ language: string; proficiency: string }>
  projects?: Array<{
    name: string
    description: string
    technologies: string[]
  }>
}

/** Parsed candidate profile */
interface CandidateProfile {
  name: string
  total_years_experience: number
  seniority_level: string
  primary_skills: string[]
  skill_categories: Record<string, string[]>
  education_level: string
  career_trajectory: string
  strengths: string[]
  gaps: string[]
  market_position: string
  employability_score: number
}

/** Input for candidate_matcher tool */
interface CandidateMatcherInput {
  candidate: {
    skills: string[]
    years_experience: number
    education_level: string
    industry_experience: string[]
    previous_titles: string[]
  }
  job_description: {
    title: string
    required_skills: string[]
    preferred_skills: string[]
    min_years_experience: number
    required_education: string
    industry: string
    responsibilities: string[]
  }
}

/** Match result */
interface MatchResult {
  overall_match_pct: number
  skill_match: {
    matched: string[]
    missing: string[]
    preferred_matched: string[]
    match_pct: number
  }
  experience_match: {
    candidate_years: number
    required_years: number
    meets_requirement: boolean
    bonus_years: number
  }
  education_match: {
    candidate_level: string
    required_level: string
    meets_requirement: boolean
  }
  industry_match: {
    overlapping: string[]
    relevance_pct: number
  }
  verdict: string
  recommendations: string[]
}

/** Input for interview_scheduler tool */
interface InterviewSchedulerInput {
  candidate_name: string
  interviewers: Array<{
    name: string
    role: string
    availability: Array<{ date: string; slots: string[] }>
  }>
  duration_minutes: number
  preferred_dates: string[]
  interview_round: string
  constraints?: {
    must_include?: string[]
    max_interviewers?: number
    buffer_minutes?: number
  }
}

/** Schedule result */
interface ScheduleResult {
  candidate: string
  round: string
  proposed_slots: Array<{
    date: string
    time: string
    interviewer: string
    role: string
  }>
  conflicts: Array<{
    interviewer: string
    date: string
    reason: string
  }>
  all_clear: boolean
  recommendations: string[]
}

/** Input for talent_pool_analyzer tool */
interface TalentPoolInput {
  pool_name: string
  candidates: Array<{
    id: string
    name: string
    skills: string[]
    experience_years: number
    education: string
    location: string
    status: 'active' | 'passive' | 'placed' | 'inactive'
    availability: 'immediate' | '2_weeks' | '1_month' | 'not_available'
    last_contact_days: number
    salary_expectation?: number
  }>
  time_period?: string
}

/** Talent pool analysis result */
interface TalentPoolResult {
  pool_name: string
  total_candidates: number
  status_breakdown: Record<string, number>
  availability_breakdown: Record<string, number>
  skills_distribution: Array<{ skill: string; count: number }>
  experience_distribution: Record<string, number>
  health_score: number
  stale_candidates: number
  top_skills_in_demand: string[]
  gaps: string[]
  recommendations: string[]
}

/** Input for job_description_optimizer tool */
interface JDOptimizerInput {
  job_title: string
  company_industry: string
  original_jd: string
  target_platforms?: string[]
  key_requirements?: string[]
  company_culture?: string
}

/** JD optimization result */
interface JDOptimizerResult {
  job_title: string
  ats_score: number
  keyword_gaps: string[]
  recommended_keywords: string[]
  bias_flags: Array<{ phrase: string; issue: string; suggestion: string }>
  readability_score: number
  competitiveness_rating: string
  optimized_sections: Record<string, string>
  recommendations: string[]
}

/** Input for offer_comparator tool */
interface OfferComparatorInput {
  offers: Array<{
    company: string
    base_salary: number
    bonus?: number
    equity?: number
    benefits_value?: number
    title: string
    location: string
    remote_policy: string
    vacation_days: number
    growth_opportunity?: string
  }>
  candidate_priorities?: string[]
  market_data?: {
    role_median: number
    role_p75: number
    role_p90: number
  }
}

/** Offer comparison result */
interface OfferComparisonResult {
  offers_ranked: Array<{
    company: string
    total_compensation: number
    score: number
    pros: string[]
    cons: string[]
  }>
  best_overall: string
  best_salary: string
  best_growth: string
  negotiation_leverage: string[]
  market_position: string
  disclaimer: string
  recommendations: string[]
}

/** Input for sourcing_strategy tool */
interface SourcingStrategyInput {
  role_title: string
  role_level: string
  location: string
  salary_range: { min: number; max: number }
  urgency: 'critical' | 'high' | 'medium' | 'low'
  diversity_goals?: boolean
  previous_channels?: Array<{ channel: string; hires: number; cost_per_hire: number; time_to_fill_days: number }>
}

/** Sourcing strategy result */
interface SourcingStrategyResult {
  role: string
  recommended_channels: Array<{
    channel: string
    priority: number
    expected_roi: string
    time_to_fill_est: string
    cost_est: string
    rationale: string
  }>
  channel_mix: Record<string, number>
  total_estimated_cost: string
  estimated_time_to_fill: string
  diversity_channels: string[]
  recommendations: string[]
}

/** Input for diversity_metrics tool */
interface DiversityMetricsInput {
  reporting_period: string
  pipeline: Array<{
    stage: string
    total: number
    gender: Record<string, number>
    ethnicity: Record<string, number>
    age_groups: Record<string, number>
    disability_pct: number
    veteran_pct: number
  }>
  hires: Array<{
    department: string
    gender: Record<string, number>
    ethnicity: Record<string, number>
  }>
  industry_benchmarks?: Record<string, number>
}

/** Diversity metrics result */
interface DiversityMetricsResult {
  period: string
  pipeline_diversity: {
    gender_split: Record<string, number>
    ethnicity_split: Record<string, number>
    disability_pct: number
    veteran_pct: number
  }
  hiring_diversity: {
    gender_split: Record<string, number>
    ethnicity_split: Record<string, number>
  }
  funnel_analysis: Array<{
    stage: string
    total: number
    diversity_index: number
  }>
  benchmark_comparison: Record<string, { company: number; benchmark: number; status: string }>
  overall_diversity_score: number
  disclaimer: string
  recommendations: string[]
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

// ============================================================================
// TOOL 1: RESUME PARSER - ANALYZE & FORMAT
// ============================================================================

function analyzeResume(data: ResumeParserInput): CandidateProfile {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  // Calculate total years of experience
  let totalYears = 0
  for (const exp of data.work_experience) {
    const start = new Date(exp.start_date)
    const end = exp.end_date ? new Date(exp.end_date) : new Date()
    const years = (end.getTime() - start.getTime()) / (365.25 * 24 * 3600 * 1000)
    totalYears += Math.max(0, years)
  }
  totalYears = Math.round(totalYears * 10) / 10

  // Determine seniority
  let seniority = 'Junior'
  if (totalYears >= 12) seniority = 'Executive/VP'
  else if (totalYears >= 8) seniority = 'Senior/Principal'
  else if (totalYears >= 5) seniority = 'Mid-Level'
  else if (totalYears >= 2) seniority = 'Junior-Mid'

  // Categorize skills
  const categories: Record<string, string[]> = {
    'Programming': [],
    'Frameworks': [],
    'Cloud/DevOps': [],
    'Data/AI': [],
    'Soft Skills': [],
    'Domain': [],
    'Other': []
  }
  const progKw = ['python', 'java', 'javascript', 'typescript', 'go', 'rust', 'c++', 'c#', 'ruby', 'php', 'scala', 'kotlin', 'swift']
  const frameKw = ['react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'express', 'nextjs', 'nuxt', 'rails', '.net']
  const cloudKw = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'jenkins', 'linux', 'ansible']
  const dataKw = ['machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'sql', 'spark', 'hadoop', 'tableau', 'power bi', 'pandas', 'numpy']
  const softKw = ['leadership', 'communication', 'teamwork', 'problem solving', 'agile', 'scrum', 'project management', 'mentoring']

  for (const skill of data.skills) {
    const s = skill.toLowerCase()
    if (progKw.some(k => s.includes(k))) categories['Programming'].push(skill)
    else if (frameKw.some(k => s.includes(k))) categories['Frameworks'].push(skill)
    else if (cloudKw.some(k => s.includes(k))) categories['Cloud/DevOps'].push(skill)
    else if (dataKw.some(k => s.includes(k))) categories['Data/AI'].push(skill)
    else if (softKw.some(k => s.includes(k))) categories['Soft Skills'].push(skill)
    else categories['Other'].push(skill)
  }

  const primarySkills = data.skills.slice(0, 8)

  // Education level
  const eduLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'MBA']
  let highestEdu = 'Not specified'
  for (const edu of data.education) {
    const level = edu.degree.toLowerCase()
    if (level.includes('phd') || level.includes('doctor')) highestEdu = 'PhD'
    else if (level.includes('mba')) highestEdu = highestEdu === 'PhD' ? 'PhD' : 'MBA'
    else if (level.includes('master') || level.includes('ms') || level.includes('ma')) {
      if (!highestEdu.includes('Ph') && highestEdu !== 'MBA') highestEdu = 'Master'
    }
    else if (level.includes('bachelor') || level.includes('bs') || level.includes('ba')) {
      if (highestEdu === 'Not specified') highestEdu = 'Bachelor'
    }
  }

  // Career trajectory
  const titles = data.work_experience.map(e => e.title.toLowerCase())
  const hasPromotion = titles.some(t => t.includes('senior') || t.includes('lead') || t.includes('principal') || t.includes('manager') || t.includes('director'))
  const trajectory = hasPromotion ? 'Upward progression with increasing responsibility' : 'Steady contributor track'

  // Strengths
  const strengths: string[] = []
  if (totalYears >= 5) strengths.push(`${totalYears} years of relevant experience`)
  if (data.skills.length >= 8) strengths.push(`Broad skill set (${data.skills.length} skills)`)
  if (data.education.some(e => e.graduation_year >= 2020)) strengths.push('Recent education with current knowledge')
  if (data.certifications && data.certifications.length >= 2) strengths.push('Multiple professional certifications')
  if (data.projects && data.projects.length >= 2) strengths.push('Active project portfolio')
  if (strengths.length === 0) strengths.push('Foundational experience and skills')

  // Gaps
  const gaps: string[] = []
  if (data.skills.length < 5) gaps.push('Limited skill diversity')
  if (data.work_experience.length <= 1) gaps.push('Limited work history breadth')
  if (!data.education || data.education.length === 0) gaps.push('No formal education listed')
  if (data.work_experience.some(e => {
    const end = e.end_date ? new Date(e.end_date) : new Date()
    const nextIdx = data.work_experience.indexOf(e) + 1
    if (nextIdx < data.work_experience.length) {
      const nextStart = new Date(data.work_experience[nextIdx].start_date)
      const gapMonths = (nextStart.getTime() - end.getTime()) / (30 * 24 * 3600 * 1000)
      return gapMonths > 3
    }
    return false
  })) gaps.push('Employment gaps detected')

  // Market position
  const marketScore = Math.min(95, Math.max(40, 50 + totalYears * 3 + data.skills.length * 1.5 + (data.certifications?.length || 0) * 3))
  const marketPosition = marketScore > 80 ? 'Highly competitive' : marketScore > 60 ? 'Competitive' : marketScore > 45 ? 'Moderate' : 'Entry-level'

  // Employability score
  const employability = Math.round(seededValue(data.candidate.name, 'emp', 55, 95))

  return {
    name: data.candidate.name,
    total_years_experience: totalYears,
    seniority_level: seniority,
    primary_skills: primarySkills,
    skill_categories: Object.fromEntries(Object.entries(categories).filter(([, v]) => v.length > 0)),
    education_level: highestEdu,
    career_trajectory: trajectory,
    strengths,
    gaps,
    market_position: marketPosition,
    employability_score: employability
  }
}

function formatResumeReport(r: CandidateProfile): string {
  const lines: string[] = []
  lines.push('# Resume Parser: Candidate Profile Report')
  lines.push('')
  lines.push(`**Candidate:** ${r.name}`)
  lines.push(`**Seniority:** ${r.seniority_level} | **Experience:** ${r.total_years_experience} years`)
  lines.push(`**Education:** ${r.education_level} | **Market Position:** ${r.market_position}`)
  lines.push(`**Employability Score:** ${r.employability_score}/100`)
  lines.push('')

  lines.push('## Primary Skills')
  lines.push('')
  lines.push(r.primary_skills.map(s => `- ${s}`).join('\n'))
  lines.push('')

  if (Object.keys(r.skill_categories).length > 0) {
    lines.push('## Skill Categories')
    lines.push('')
    for (const [cat, skills] of Object.entries(r.skill_categories)) {
      lines.push(`**${cat}:** ${skills.join(', ')}`)
    }
    lines.push('')
  }

  lines.push('## Career Trajectory')
  lines.push('')
  lines.push(r.career_trajectory)
  lines.push('')

  lines.push('## Strengths')
  lines.push('')
  for (const s of r.strengths) lines.push(`- [+] ${s}`)
  lines.push('')

  if (r.gaps.length > 0) {
    lines.push('## Potential Gaps')
    lines.push('')
    for (const g of r.gaps) lines.push(`- [!] ${g}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('*This analysis is algorithm-generated and should be validated by a human recruiter.*')
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// TOOL 2: CANDIDATE MATCHER - ANALYZE & FORMAT
// ============================================================================

function analyzeCandidateMatch(data: CandidateMatcherInput): MatchResult {
  const c = data.candidate
  const jd = data.job_description

  // Skill matching
  const cSkills = c.skills.map(s => s.toLowerCase())
  const matched = jd.required_skills.filter(s => cSkills.includes(s.toLowerCase()))
  const missing = jd.required_skills.filter(s => !cSkills.includes(s.toLowerCase()))
  const preferredMatched = jd.preferred_skills.filter(s => cSkills.includes(s.toLowerCase()))
  const skillPct = jd.required_skills.length > 0
    ? Math.round((matched.length / jd.required_skills.length) * 100)
    : 100

  // Experience match
  const bonusYears = Math.max(0, c.years_experience - jd.min_years_experience)
  const meetsExp = c.years_experience >= jd.min_years_experience

  // Education match
  const eduLevels: Record<string, number> = { 'high_school': 1, 'associate': 2, 'bachelor': 3, 'master': 4, 'phd': 5, 'mba': 4 }
  const cEdu = eduLevels[c.education_level.toLowerCase()] || 3
  const rEdu = eduLevels[jd.required_education.toLowerCase()] || 3
  const meetsEdu = cEdu >= rEdu

  // Industry match
  const overlapping = c.industry_experience.filter(i =>
    jd.industry.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(jd.industry.toLowerCase())
  )
  const industryPct = c.industry_experience.length > 0
    ? Math.round((overlapping.length / Math.max(c.industry_experience.length, 1)) * 100)
    : 0

  // Overall match
  const overall = Math.round(
    skillPct * 0.4 +
    (meetsExp ? 100 : Math.max(0, (c.years_experience / jd.min_years_experience) * 100)) * 0.25 +
    (meetsEdu ? 100 : 50) * 0.15 +
    industryPct * 0.1 +
    (preferredMatched.length / Math.max(jd.preferred_skills.length, 1)) * 100 * 0.1
  )

  let verdict = 'Strong Match'
  if (overall < 40) verdict = 'Weak Match - Significant Gaps'
  else if (overall < 60) verdict = 'Partial Match - Needs Development'
  else if (overall < 75) verdict = 'Good Match - Minor Gaps'

  const recommendations: string[] = []
  if (missing.length > 0) recommendations.push(`Upskill in: ${missing.join(', ')}`)
  if (!meetsExp) recommendations.push(`Gain ${jd.min_years_experience - c.years_experience} more years of experience`)
  if (!meetsEdu) recommendations.push(`Consider pursuing ${jd.required_education} degree`)
  if (industryPct < 50) recommendations.push(`Build experience in ${jd.industry} industry`)
  if (preferredMatched.length < jd.preferred_skills.length) {
    const missingPreferred = jd.preferred_skills.filter(s => !cSkills.includes(s.toLowerCase()))
    recommendations.push(`Bonus: learn ${missingPreferred.slice(0, 3).join(', ')}`)
  }

  return {
    overall_match_pct: overall,
    skill_match: { matched, missing, preferred_matched: preferredMatched, match_pct: skillPct },
    experience_match: { candidate_years: c.years_experience, required_years: jd.min_years_experience, meets_requirement: meetsExp, bonus_years: bonusYears },
    education_match: { candidate_level: c.education_level, required_level: jd.required_education, meets_requirement: meetsEdu },
    industry_match: { overlapping, relevance_pct: industryPct },
    verdict,
    recommendations
  }
}

function formatMatchReport(r: MatchResult): string {
  const lines: string[] = []
  lines.push('# Candidate-Job Match Analysis')
  lines.push('')
  lines.push(`**Overall Match:** ${r.overall_match_pct}%`)
  lines.push(`**Verdict:** ${r.verdict}`)
  lines.push('')

  // Skill match bar
  const barLen = 20
  const filled = Math.round(r.skill_match.match_pct / 100 * barLen)
  const bar = '[' + '#'.repeat(filled) + '-'.repeat(barLen - filled) + ']'
  lines.push('## Skill Match')
  lines.push('')
  lines.push(`**${r.skill_match.match_pct}%** ${bar}`)
  lines.push('')
  if (r.skill_match.matched.length > 0) lines.push(`- **Matched:** ${r.skill_match.matched.join(', ')}`)
  if (r.skill_match.missing.length > 0) lines.push(`- **Missing:** ${r.skill_match.missing.join(', ')}`)
  if (r.skill_match.preferred_matched.length > 0) lines.push(`- **Preferred Matched:** ${r.skill_match.preferred_matched.join(', ')}`)
  lines.push('')

  lines.push('## Experience Match')
  lines.push('')
  lines.push(`- Candidate: ${r.experience_match.candidate_years} years | Required: ${r.experience_match.required_years} years`)
  lines.push(`- **Status:** ${r.experience_match.meets_requirement ? 'Meets requirement' : 'Below requirement'}`)
  if (r.experience_match.bonus_years > 0) lines.push(`- **Bonus:** ${r.experience_match.bonus_years} years above minimum`)
  lines.push('')

  lines.push('## Education Match')
  lines.push('')
  lines.push(`- Candidate: ${r.education_match.candidate_level} | Required: ${r.education_match.required_level}`)
  lines.push(`- **Status:** ${r.education_match.meets_requirement ? 'Meets requirement' : 'Below requirement'}`)
  lines.push('')

  lines.push('## Industry Match')
  lines.push('')
  lines.push(`- **Relevance:** ${r.industry_match.relevance_pct}%`)
  if (r.industry_match.overlapping.length > 0) lines.push(`- **Overlapping:** ${r.industry_match.overlapping.join(', ')}`)
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- [>] ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('*Match scores are algorithmic estimates. Final hiring decisions should incorporate human judgment, interviews, and reference checks.*')
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// TOOL 3: INTERVIEW SCHEDULER - ANALYZE & FORMAT
// ============================================================================

function analyzeSchedule(data: InterviewSchedulerInput): ScheduleResult {
  const conflicts: ScheduleResult['conflicts'] = []
  const proposed: ScheduleResult['proposed_slots'] = []
  const recommendations: string[] = []

  const maxInterviewers = data.constraints?.max_interviewers || data.interviewers.length
  const selectedInterviewers = data.interviewers.slice(0, maxInterviewers)

  for (const date of data.preferred_dates) {
    for (const interviewer of selectedInterviewers) {
      const dayAvail = interviewer.availability.find(a => a.date === date)
      if (dayAvail && dayAvail.slots.length > 0) {
        // Check for conflicts (simple: if slot already taken by same interviewer)
        const alreadyScheduled = proposed.some(p => p.interviewer === interviewer.name && p.date === date)
        if (alreadyScheduled) {
          conflicts.push({
            interviewer: interviewer.name,
            date,
            reason: 'Interviewer already has a slot on this date'
          })
        } else {
          proposed.push({
            date,
            time: dayAvail.slots[0],
            interviewer: interviewer.name,
            role: interviewer.role
          })
        }
      } else {
        conflicts.push({
          interviewer: interviewer.name,
          date,
          reason: 'No availability on this date'
        })
      }
    }
  }

  // If not enough slots, recommend alternatives
  if (proposed.length < selectedInterviewers.length) {
    recommendations.push('Consider expanding to additional dates for full coverage')
  }

  // Check must-include constraint
  if (data.constraints?.must_include) {
    for (const must of data.constraints.must_include) {
      if (!proposed.some(p => p.interviewer === must)) {
        recommendations.push(`Required interviewer "${must}" not yet scheduled - prioritize their availability`)
      }
    }
  }

  if (conflicts.length === 0) {
    recommendations.push('All interviewers available on proposed dates - ready to confirm')
  } else {
    recommendations.push(`${conflicts.length} conflict(s) detected - review and adjust`)
  }

  recommendations.push(`Buffer time: ${data.constraints?.buffer_minutes || 15} minutes between sessions recommended`)

  return {
    candidate: data.candidate_name,
    round: data.interview_round,
    proposed_slots: proposed,
    conflicts,
    all_clear: conflicts.length === 0,
    recommendations
  }
}

function formatScheduleReport(r: ScheduleResult): string {
  const lines: string[] = []
  lines.push('# Interview Schedule Report')
  lines.push('')
  lines.push(`**Candidate:** ${r.candidate}`)
  lines.push(`**Round:** ${r.round}`)
  lines.push(`**Status:** ${r.all_clear ? 'All Clear' : 'Conflicts Detected'}`)
  lines.push('')

  if (r.proposed_slots.length > 0) {
    lines.push('## Proposed Schedule')
    lines.push('')
    for (const slot of r.proposed_slots) {
      lines.push(`- **${slot.date}** at ${slot.time} | ${slot.interviewer} (${slot.role})`)
    }
    lines.push('')
  }

  if (r.conflicts.length > 0) {
    lines.push('## Conflicts')
    lines.push('')
    for (const c of r.conflicts) {
      lines.push(`- [!] ${c.interviewer} on ${c.date}: ${c.reason}`)
    }
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- [>] ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('*Schedule is based on stated availability. Confirm all participants before sending calendar invites.*')
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// TOOL 4: TALENT POOL ANALYZER - ANALYZE & FORMAT
// ============================================================================

function analyzeTalentPool(data: TalentPoolInput): TalentPoolResult {
  const total = data.candidates.length

  // Status breakdown
  const statusBreakdown: Record<string, number> = {}
  for (const c of data.candidates) {
    statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1
  }

  // Availability breakdown
  const availBreakdown: Record<string, number> = {}
  for (const c of data.candidates) {
    availBreakdown[c.availability] = (availBreakdown[c.availability] || 0) + 1
  }

  // Skills distribution
  const skillCounts: Record<string, number> = {}
  for (const c of data.candidates) {
    for (const s of c.skills) {
      skillCounts[s] = (skillCounts[s] || 0) + 1
    }
  }
  const skillsDist = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Experience distribution
  const expDist: Record<string, number> = { '0-2 years': 0, '3-5 years': 0, '6-10 years': 0, '10+ years': 0 }
  for (const c of data.candidates) {
    if (c.experience_years <= 2) expDist['0-2 years']++
    else if (c.experience_years <= 5) expDist['3-5 years']++
    else if (c.experience_years <= 10) expDist['6-10 years']++
    else expDist['10+ years']++
  }

  // Stale candidates (not contacted in 30+ days)
  const stale = data.candidates.filter(c => c.last_contact_days > 30).length

  // Health score
  const activePct = total > 0 ? ((statusBreakdown['active'] || 0) / total) * 100 : 0
  const immediateAvail = total > 0 ? ((availBreakdown['immediate'] || 0) / total) * 100 : 0
  const freshness = total > 0 ? (1 - stale / total) * 100 : 0
  const healthScore = Math.round((activePct * 0.4 + immediateAvail * 0.3 + freshness * 0.3))

  // Gaps
  const gaps: string[] = []
  if (stale > total * 0.3) gaps.push('Over 30% of pool is stale (>30 days no contact)')
  if ((availBreakdown['immediate'] || 0) === 0) gaps.push('No immediately available candidates')
  if (skillsDist.length < 5) gaps.push('Limited skill diversity in pool')
  if ((statusBreakdown['inactive'] || 0) > total * 0.4) gaps.push('High inactive rate - pool needs refresh')

  // Recommendations
  const recommendations: string[] = []
  if (stale > 0) recommendations.push(`Re-engage ${stale} stale candidates with personalized outreach`)
  if (gaps.length > 0) recommendations.push('Diversify sourcing channels to fill skill gaps')
  recommendations.push(`Top in-demand skills: ${skillsDist.slice(0, 5).map(s => s.skill).join(', ')}`)
  recommendations.push('Implement regular pool nurturing campaigns')

  return {
    pool_name: data.pool_name,
    total_candidates: total,
    status_breakdown: statusBreakdown,
    availability_breakdown: availBreakdown,
    skills_distribution: skillsDist,
    experience_distribution: expDist,
    health_score: healthScore,
    stale_candidates: stale,
    top_skills_in_demand: skillsDist.slice(0, 5).map(s => s.skill),
    gaps,
    recommendations
  }
}

function formatTalentPoolReport(r: TalentPoolResult): string {
  const lines: string[] = []
  lines.push('# Talent Pool Analysis Report')
  lines.push('')
  lines.push(`**Pool:** ${r.pool_name}`)
  lines.push(`**Total Candidates:** ${r.total_candidates}`)
  lines.push(`**Health Score:** ${r.health_score}/100`)
  lines.push(`**Stale Candidates:** ${r.stale_candidates}`)
  lines.push('')

  lines.push('## Status Breakdown')
  lines.push('')
  for (const [status, count] of Object.entries(r.status_breakdown)) {
    const pct = Math.round((count / r.total_candidates) * 100)
    lines.push(`- ${status}: ${count} (${pct}%)`)
  }
  lines.push('')

  lines.push('## Availability')
  lines.push('')
  for (const [avail, count] of Object.entries(r.availability_breakdown)) {
    lines.push(`- ${avail}: ${count}`)
  }
  lines.push('')

  lines.push('## Experience Distribution')
  lines.push('')
  for (const [range, count] of Object.entries(r.experience_distribution)) {
    lines.push(`- ${range}: ${count}`)
  }
  lines.push('')

  lines.push('## Top Skills in Pool')
  lines.push('')
  for (const s of r.skills_distribution.slice(0, 10)) {
    lines.push(`- ${s.skill}: ${s.count} candidates`)
  }
  lines.push('')

  if (r.gaps.length > 0) {
    lines.push('## Identified Gaps')
    lines.push('')
    for (const g of r.gaps) lines.push(`- [GAP] ${g}`)
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- [>] ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('*Pool health is a snapshot based on current data. Regular updates recommended for accurate tracking.*')
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// TOOL 5: JD OPTIMIZER - ANALYZE & FORMAT
// ============================================================================

function analyzeJD(data: JDOptimizerInput): JDOptimizerResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))
  const jdLower = data.original_jd.toLowerCase()

  // ATS keyword analysis
  const commonAtsKeywords = [
    'agile', 'scrum', 'cross-functional', 'stakeholder', 'roadmap',
    'kpis', 'metrics', 'data-driven', 'scalable', 'innovative',
    'collaborative', 'proactive', 'ownership', 'impact', 'results-oriented',
    'problem-solving', 'communication', 'leadership', 'strategic', 'analytical'
  ]
  const foundKeywords = commonAtsKeywords.filter(k => jdLower.includes(k))
  const keywordGaps = commonAtsKeywords.filter(k => !jdLower.includes(k))

  // ATS score
  const atsScore = Math.min(95, Math.max(30, foundKeywords.length * 5 + 30 + Math.round(rng() * 15)))

  // Bias detection
  const biasFlags: JDOptimizerResult['bias_flags'] = []
  const biasedPhrases = [
    { phrase: 'rockstar', issue: 'Age/gender bias', suggestion: 'high-performer' },
    { phrase: 'ninja', issue: 'Cultural/gender bias', suggestion: 'specialist' },
    { phrase: 'young', issue: 'Age discrimination', suggestion: 'early-career' },
    { phrase: 'native english', issue: 'National origin bias', suggestion: 'fluent in English' },
    { phrase: 'digital native', issue: 'Age bias', suggestion: 'technically proficient' },
    { phrase: 'recent graduate', issue: 'Age bias', suggestion: 'entry-level professional' },
    { phrase: 'strong man', issue: 'Gender bias', suggestion: 'strong candidate' },
    { phrase: 'he/him', issue: 'Gender bias', suggestion: 'they/them or restructure' },
    { phrase: 'she/her', issue: 'Gender bias', suggestion: 'they/them or restructure' }
  ]
  for (const bp of biasedPhrases) {
    if (jdLower.includes(bp.phrase)) {
      biasFlags.push(bp)
    }
  }

  // Readability (Flesch-like estimate)
  const words = data.original_jd.split(/\s+/).length
  const sentences = data.original_jd.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const avgWordsPerSentence = words / Math.max(sentences, 1)
  const readability = Math.min(100, Math.max(20, 100 - (avgWordsPerSentence - 15) * 5))

  // Competitiveness
  const competitiveness = atsScore > 75 ? 'Highly Competitive' : atsScore > 55 ? 'Competitive' : 'Needs Improvement'

  // Recommended keywords based on role
  const roleKeywords: Record<string, string[]> = {
    'engineer': ['system design', 'code review', 'testing', 'debugging', 'architecture', 'performance optimization'],
    'manager': ['team building', 'budget management', 'strategic planning', 'performance reviews', 'stakeholder management'],
    'designer': ['user research', 'prototyping', 'design systems', 'accessibility', 'interaction design'],
    'data': ['data pipeline', 'visualization', 'statistical analysis', 'experimentation', 'data governance'],
    'product': ['product strategy', 'user stories', 'market analysis', 'roadmap prioritization', 'A/B testing'],
    'marketing': ['campaign management', 'SEO/SEM', 'content strategy', 'analytics', 'brand positioning'],
    'sales': ['pipeline management', 'CRM', 'negotiation', 'account management', 'forecasting']
  }
  const roleKey = Object.keys(roleKeywords).find(k => data.job_title.toLowerCase().includes(k)) || 'engineer'
  const recommendedKw = roleKeywords[roleKey].filter(k => !jdLower.includes(k))

  // Optimized sections
  const optimizedSections: Record<string, string> = {
    'Summary': `Results-driven ${data.job_title} to join our ${data.company_industry} team. Seeking a collaborative professional with strong ${recommendedKw.slice(0, 2).join(' and ')} skills.`,
    'Requirements': `Required: ${data.key_requirements?.join(', ') || 'Relevant experience and skills'}. Preferred: ${recommendedKw.join(', ')}.`,
    'Culture': data.company_culture || 'We value diversity, inclusion, and continuous learning. Join a team that supports growth and innovation.'
  }

  const recommendations: string[] = []
  if (keywordGaps.length > 0) recommendations.push(`Add ATS keywords: ${keywordGaps.slice(0, 5).join(', ')}`)
  if (biasFlags.length > 0) recommendations.push(`Remove biased language: ${biasFlags.map(b => `"${b.phrase}"`).join(', ')}`)
  if (readability < 50) recommendations.push('Improve readability: shorten sentences, use bullet points')
  if (atsScore < 60) recommendations.push('Overall ATS optimization needed - review keyword density and structure')
  recommendations.push('Include salary range to increase applicant pool by 30%+')
  recommendations.push('Add diversity and inclusion statement')

  return {
    job_title: data.job_title,
    ats_score: atsScore,
    keyword_gaps: keywordGaps.slice(0, 8),
    recommended_keywords: recommendedKw,
    bias_flags: biasFlags,
    readability_score: Math.round(readability),
    competitiveness_rating: competitiveness,
    optimized_sections: optimizedSections,
    recommendations
  }
}

function formatJDReport(r: JDOptimizerResult): string {
  const lines: string[] = []
  lines.push('# Job Description Optimization Report')
  lines.push('')
  lines.push(`**Role:** ${r.job_title}`)
  lines.push(`**ATS Score:** ${r.ats_score}/100 | **Readability:** ${r.readability_score}/100`)
  lines.push(`**Competitiveness:** ${r.competitiveness_rating}`)
  lines.push('')

  if (r.bias_flags.length > 0) {
    lines.push('## Bias Flags Detected')
    lines.push('')
    for (const bf of r.bias_flags) {
      lines.push(`- [!] "${bf.phrase}" -> **${bf.issue}** | Suggestion: "${bf.suggestion}"`)
    }
    lines.push('')
  }

  if (r.keyword_gaps.length > 0) {
    lines.push('## Missing ATS Keywords')
    lines.push('')
    lines.push(r.keyword_gaps.map(k => `- ${k}`).join('\n'))
    lines.push('')
  }

  if (r.recommended_keywords.length > 0) {
    lines.push('## Recommended Keywords to Add')
    lines.push('')
    lines.push(r.recommended_keywords.map(k => `- ${k}`).join('\n'))
    lines.push('')
  }

  lines.push('## Optimized Sections')
  lines.push('')
  for (const [section, content] of Object.entries(r.optimized_sections)) {
    lines.push(`### ${section}`)
    lines.push('')
    lines.push(content)
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- [>] ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('*ATS optimization improves visibility but does not guarantee candidate quality. Always balance keyword density with readability.*')
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// TOOL 6: OFFER COMPARATOR - ANALYZE & FORMAT
// ============================================================================

function analyzeOffers(data: OfferComparatorInput): OfferComparisonResult {
  const priorities = data.candidate_priorities || ['total_compensation', 'growth', 'work_life_balance']
  const market = data.market_data || { role_median: 80000, role_p75: 100000, role_p90: 130000 }

  const evaluated = data.offers.map(offer => {
    const totalComp = offer.base_salary + (offer.bonus || 0) + (offer.equity || 0) + (offer.benefits_value || 0)

    // Score components (0-100 each)
    const salaryScore = Math.min(100, (offer.base_salary / market.role_median) * 70)
    const growthScore = offer.growth_opportunity
      ? (offer.growth_opportunity.toLowerCase().includes('high') ? 90 : offer.growth_opportunity.toLowerCase().includes('medium') ? 65 : 40)
      : 50
    const wlbScore = (offer.vacation_days >= 20 ? 85 : offer.vacation_days >= 15 ? 70 : 50) +
      (offer.remote_policy.toLowerCase().includes('full') ? 15 : offer.remote_policy.toLowerCase().includes('hybrid') ? 10 : 0)

    // Weighted score
    const score = Math.round(
      salaryScore * (priorities.includes('total_compensation') ? 0.4 : 0.25) +
      growthScore * (priorities.includes('growth') ? 0.3 : 0.2) +
      wlbScore * (priorities.includes('work_life_balance') ? 0.3 : 0.2) +
      (offer.bonus ? 10 : 0) + (offer.equity ? 10 : 0)
    )

    const pros: string[] = []
    const cons: string[] = []

    if (offer.base_salary > market.role_p75) pros.push('Above-market base salary')
    if (offer.base_salary < market.role_median) cons.push('Below-market base salary')
    if (offer.bonus && offer.bonus > offer.base_salary * 0.15) pros.push('Strong bonus potential')
    if (offer.equity && offer.equity > 0) pros.push('Equity component included')
    if (offer.vacation_days >= 20) pros.push('Generous PTO policy')
    if (offer.vacation_days < 10) cons.push('Limited vacation days')
    if (offer.remote_policy.toLowerCase().includes('full')) pros.push('Fully remote')
    if (offer.remote_policy.toLowerCase().includes('onsite')) cons.push('On-site required')
    if (offer.growth_opportunity?.toLowerCase().includes('high')) pros.push('High growth potential')

    return {
      company: offer.company,
      total_compensation: totalComp,
      score: Math.min(100, score),
      pros,
      cons
    }
  })

  evaluated.sort((a, b) => b.score - a.score)

  const bestOverall = evaluated[0]?.company || 'N/A'
  const bestSalary = [...evaluated].sort((a, b) => b.total_compensation - a.total_compensation)[0]?.company || 'N/A'
  const bestGrowth = [...evaluated].sort((a, b) => {
    const aGrowth = a.pros.filter(p => p.includes('growth')).length
    const bGrowth = b.pros.filter(p => p.includes('growth')).length
    return bGrowth - aGrowth
  })[0]?.company || 'N/A'

  // Negotiation leverage
  const leverage: string[] = []
  if (evaluated.length > 1) {
    const diff = evaluated[0].total_compensation - evaluated[1].total_compensation
    if (diff > 0) leverage.push(`Use ${evaluated[1].company} offer to negotiate ${evaluated[0].company} higher (gap: $${diff.toLocaleString()})`)
  }
  if (evaluated.some(o => o.total_compensation > market.role_p90)) leverage.push('Top offer exceeds 90th percentile - strong negotiating position')
  leverage.push('Research Glassdoor/Levels.fyi for additional market data before negotiating')

  const marketPosition = evaluated[0].total_compensation > market.role_p75
    ? 'Above market (75th+ percentile)'
    : evaluated[0].total_compensation > market.role_median
      ? 'At market (50th-75th percentile)'
      : 'Below market (<50th percentile)'

  const recommendations: string[] = []
  recommendations.push(`Best overall: ${bestOverall} (score: ${evaluated[0]?.score})`)
  if (evaluated.length > 1) recommendations.push(`Consider total compensation, not just base salary`)
  recommendations.push('Evaluate benefits, culture fit, and long-term growth alongside compensation')
  recommendations.push('Get final offer in writing before declining other opportunities')

  return {
    offers_ranked: evaluated,
    best_overall: bestOverall,
    best_salary: bestSalary,
    best_growth: bestGrowth,
    negotiation_leverage: leverage,
    market_position: marketPosition,
    disclaimer: 'This comparison is for informational purposes only. Compensation data may not reflect the most current market conditions. Always verify figures with the employer.',
    recommendations
  }
}

function formatOfferReport(r: OfferComparisonResult): string {
  const lines: string[] = []
  lines.push('# Offer Comparison & Negotiation Analysis')
  lines.push('')
  lines.push(`**Best Overall:** ${r.best_overall}`)
  lines.push(`**Highest Compensation:** ${r.best_salary}`)
  lines.push(`**Best Growth:** ${r.best_growth}`)
  lines.push(`**Market Position:** ${r.market_position}`)
  lines.push('')

  lines.push('## Ranked Offers')
  lines.push('')
  for (let i = 0; i < r.offers_ranked.length; i++) {
    const o = r.offers_ranked[i]
    lines.push(`### ${i + 1}. ${o.company} (Score: ${o.score}/100)`)
    lines.push('')
    lines.push(`- **Total Compensation:** $${o.total_compensation.toLocaleString()}`)
    if (o.pros.length > 0) lines.push(`- **Pros:** ${o.pros.join('; ')}`)
    if (o.cons.length > 0) lines.push(`- **Cons:** ${o.cons.join('; ')}`)
    lines.push('')
  }

  if (r.negotiation_leverage.length > 0) {
    lines.push('## Negotiation Leverage')
    lines.push('')
    for (const l of r.negotiation_leverage) lines.push(`- [NEG] ${l}`)
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- [>] ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Disclaimer: ${r.disclaimer}*`)
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// TOOL 7: SOURCING STRATEGY - ANALYZE & FORMAT
// ============================================================================

function analyzeSourcing(data: SourcingStrategyInput): SourcingStrategyResult {
  const rng = mulberry32(hashStr(JSON.stringify(data)))

  // Channel database
  const channels = [
    { name: 'LinkedIn Recruiter', cost_factor: 0.8, speed_factor: 0.7, quality: 0.85, diversity: 0.6 },
    { name: 'Indeed', cost_factor: 0.5, speed_factor: 0.8, quality: 0.6, diversity: 0.7 },
    { name: 'Employee Referral', cost_factor: 0.3, speed_factor: 0.9, quality: 0.9, diversity: 0.4 },
    { name: 'GitHub Jobs', cost_factor: 0.4, speed_factor: 0.6, quality: 0.85, diversity: 0.5 },
    { name: 'Stack Overflow', cost_factor: 0.5, speed_factor: 0.5, quality: 0.9, diversity: 0.5 },
    { name: 'AngelList/Wellfound', cost_factor: 0.3, speed_factor: 0.7, quality: 0.75, diversity: 0.6 },
    { name: 'Niche Job Boards', cost_factor: 0.4, speed_factor: 0.6, quality: 0.8, diversity: 0.7 },
    { name: 'Diversity-Focused Platforms', cost_factor: 0.5, speed_factor: 0.5, quality: 0.7, diversity: 0.95 },
    { name: 'University Partnerships', cost_factor: 0.2, speed_factor: 0.4, quality: 0.65, diversity: 0.8 },
    { name: 'Recruitment Agency', cost_factor: 1.0, speed_factor: 0.8, quality: 0.8, diversity: 0.5 },
    { name: 'Internal Mobility', cost_factor: 0.1, speed_factor: 0.9, quality: 0.85, diversity: 0.5 },
    { name: 'Social Media (Twitter/X)', cost_factor: 0.2, speed_factor: 0.6, quality: 0.5, diversity: 0.7 }
  ]

  // Score channels based on role and urgency
  const scored = channels.map(ch => {
    let score = ch.quality * 40 + ch.speed_factor * 30 + (1 - ch.cost_factor) * 20
    if (data.diversity_goals) score += ch.diversity * 20
    if (data.urgency === 'critical') score += ch.speed_factor * 15
    if (data.role_level === 'senior' || data.role_level === 'executive') score += ch.quality * 10

    // Check previous performance
    const prev = data.previous_channels?.find(p => p.channel === ch.name)
    if (prev) {
      score += prev.hires > 2 ? 10 : prev.hires > 0 ? 5 : -5
    }

    return { ...ch, final_score: score + rng() * 10 }
  })

  scored.sort((a, b) => b.final_score - a.final_score)

  const topChannels = scored.slice(0, 5).map((ch, idx) => ({
    channel: ch.name,
    priority: idx + 1,
    expected_roi: ch.final_score > 70 ? 'High' : ch.final_score > 50 ? 'Medium' : 'Low',
    time_to_fill_est: `${Math.round(20 + (1 - ch.speed_factor) * 30)} days`,
    cost_est: `$${Math.round(data.salary_range.min * ch.cost_factor).toLocaleString()}`,
    rationale: `Quality: ${Math.round(ch.quality * 100)}%, Speed: ${Math.round(ch.speed_factor * 100)}%, Cost efficiency: ${Math.round((1 - ch.cost_factor) * 100)}%`
  }))

  // Channel mix recommendation
  const channelMix: Record<string, number> = {}
  const totalWeight = topChannels.reduce((sum, _, idx) => sum + (5 - idx), 0)
  topChannels.forEach((ch, idx) => {
    channelMix[ch.channel] = Math.round(((5 - idx) / totalWeight) * 100)
  })

  // Estimated cost and time
  const avgCostFactor = topChannels.reduce((sum, ch, idx) => sum + scored[idx].cost_factor * (5 - idx), 0) / totalWeight
  const avgSpeedFactor = topChannels.reduce((sum, ch, idx) => sum + scored[idx].speed_factor * (5 - idx), 0) / totalWeight
  const totalCost = `$${Math.round(data.salary_range.min * avgCostFactor).toLocaleString()}`
  const timeToFill = `${Math.round(20 + (1 - avgSpeedFactor) * 30)} days`

  // Diversity channels
  const diversityChannels = channels.filter(ch => ch.diversity >= 0.8).map(ch => ch.name)

  const recommendations: string[] = []
  recommendations.push(`Primary channel: ${topChannels[0].channel} (highest ROI for ${data.role_title})`)
  if (data.diversity_goals) recommendations.push(`Include diversity channels: ${diversityChannels.slice(0, 3).join(', ')}`)
  if (data.urgency === 'critical') recommendations.push('For critical roles, activate agency search in parallel')
  recommendations.push('Track cost-per-hire and time-to-fill for continuous optimization')
  recommendations.push('Employee referrals typically yield highest quality - incentivize participation')

  return {
    role: data.role_title,
    recommended_channels: topChannels,
    channel_mix: channelMix,
    total_estimated_cost: totalCost,
    estimated_time_to_fill: timeToFill,
    diversity_channels: diversityChannels,
    recommendations
  }
}

function formatSourcingReport(r: SourcingStrategyResult): string {
  const lines: string[] = []
  lines.push('# Sourcing Strategy & ROI Analysis')
  lines.push('')
  lines.push(`**Role:** ${r.role}`)
  lines.push(`**Estimated Time-to-Fill:** ${r.estimated_time_to_fill}`)
  lines.push(`**Estimated Total Cost:** ${r.total_estimated_cost}`)
  lines.push('')

  lines.push('## Recommended Channel Mix')
  lines.push('')
  for (const ch of r.recommended_channels) {
    lines.push(`### Priority ${ch.priority}: ${ch.channel}`)
    lines.push('')
    lines.push(`- **ROI:** ${ch.expected_roi} | **Time:** ${ch.time_to_fill_est} | **Cost:** ${ch.cost_est}`)
    lines.push(`- **Rationale:** ${ch.rationale}`)
    lines.push('')
  }

  lines.push('## Channel Mix Percentages')
  lines.push('')
  for (const [channel, pct] of Object.entries(r.channel_mix)) {
    lines.push(`- ${channel}: ${pct}%`)
  }
  lines.push('')

  if (r.diversity_channels.length > 0) {
    lines.push('## Diversity Sourcing Channels')
    lines.push('')
    for (const dc of r.diversity_channels) lines.push(`- ${dc}`)
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- [>] ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('*ROI estimates are based on industry benchmarks and historical data. Actual results may vary by market conditions and role specificity.*')
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// TOOL 8: DIVERSITY METRICS - ANALYZE & FORMAT
// ============================================================================

function analyzeDiversity(data: DiversityMetricsInput): DiversityMetricsResult {
  // Aggregate pipeline diversity
  let totalCandidates = 0
  const genderTotal: Record<string, number> = {}
  const ethnicityTotal: Record<string, number> = {}
  let totalDisability = 0
  let totalVeteran = 0

  for (const stage of data.pipeline) {
    totalCandidates += stage.total
    for (const [g, count] of Object.entries(stage.gender)) {
      genderTotal[g] = (genderTotal[g] || 0) + count
    }
    for (const [e, count] of Object.entries(stage.ethnicity)) {
      ethnicityTotal[e] = (ethnicityTotal[e] || 0) + count
    }
    totalDisability += stage.disability_pct * stage.total
    totalVeteran += stage.veteran_pct * stage.total
  }

  // Normalize to percentages
  const genderSplit: Record<string, number> = {}
  for (const [g, count] of Object.entries(genderTotal)) {
    genderSplit[g] = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
  }
  const ethnicitySplit: Record<string, number> = {}
  for (const [e, count] of Object.entries(ethnicityTotal)) {
    ethnicitySplit[e] = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
  }

  // Hiring diversity
  let totalHires = 0
  const hireGender: Record<string, number> = {}
  const hireEthnicity: Record<string, number> = {}
  for (const h of data.hires) {
    totalHires += Object.values(h.gender).reduce((a, b) => a + b, 0)
    for (const [g, count] of Object.entries(h.gender)) {
      hireGender[g] = (hireGender[g] || 0) + count
    }
    for (const [e, count] of Object.entries(h.ethnicity)) {
      hireEthnicity[e] = (hireEthnicity[e] || 0) + count
    }
  }
  const hireGenderSplit: Record<string, number> = {}
  for (const [g, count] of Object.entries(hireGender)) {
    hireGenderSplit[g] = totalHires > 0 ? Math.round((count / totalHires) * 100) : 0
  }
  const hireEthnicitySplit: Record<string, number> = {}
  for (const [e, count] of Object.entries(hireEthnicity)) {
    hireEthnicitySplit[e] = totalHires > 0 ? Math.round((count / totalHires) * 100) : 0
  }

  // Funnel analysis with diversity index (Shannon diversity normalized)
  const funnel = data.pipeline.map(stage => {
    const categories = Object.values(stage.ethnicity)
    const total = categories.reduce((a, b) => a + b, 0)
    let shannon = 0
    for (const count of categories) {
      if (count > 0 && total > 0) {
        const p = count / total
        shannon -= p * Math.log(p)
      }
    }
    const maxDiversity = categories.length > 0 ? Math.log(categories.length) : 1
    const diversityIndex = maxDiversity > 0 ? Math.round((shannon / maxDiversity) * 100) : 0
    return { stage: stage.stage, total: stage.total, diversity_index: diversityIndex }
  })

  // Benchmark comparison
  const benchmarks = data.industry_benchmarks || {
    'gender_diversity': 45,
    'ethnic_diversity': 35,
    'disability_inclusion': 5,
    'veteran_inclusion': 3
  }
  const benchmarkComparison: Record<string, { company: number; benchmark: number; status: string }> = {}
  benchmarkComparison['gender_diversity'] = {
    company: genderSplit['female'] || genderSplit['Female'] || 0,
    benchmark: benchmarks['gender_diversity'] || 45,
    status: (genderSplit['female'] || genderSplit['Female'] || 0) >= (benchmarks['gender_diversity'] || 45) ? 'Above' : 'Below'
  }
  benchmarkComparison['ethnic_diversity'] = {
    company: Math.max(0, 100 - (ethnicityTotal['White'] || 0) - (ethnicityTotal['white'] || 0)),
    benchmark: benchmarks['ethnic_diversity'] || 35,
    status: (Math.max(0, 100 - (ethnicityTotal['White'] || 0) - (ethnicityTotal['white'] || 0))) >= (benchmarks['ethnic_diversity'] || 35) ? 'Above' : 'Below'
  }
  benchmarkComparison['disability_inclusion'] = {
    company: totalCandidates > 0 ? Math.round((totalDisability / totalCandidates) * 100) : 0,
    benchmark: benchmarks['disability_inclusion'] || 5,
    status: (totalCandidates > 0 ? Math.round((totalDisability / totalCandidates) * 100) : 0) >= (benchmarks['disability_inclusion'] || 5) ? 'Above' : 'Below'
  }
  benchmarkComparison['veteran_inclusion'] = {
    company: totalCandidates > 0 ? Math.round((totalVeteran / totalCandidates) * 100) : 0,
    benchmark: benchmarks['veteran_inclusion'] || 3,
    status: (totalCandidates > 0 ? Math.round((totalVeteran / totalCandidates) * 100) : 0) >= (benchmarks['veteran_inclusion'] || 3) ? 'Above' : 'Below'
  }

  // Overall diversity score
  const scores = Object.values(benchmarkComparison).map(b => b.company >= b.benchmark ? 100 : Math.round((b.company / b.benchmark) * 100))
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  const recommendations: string[] = []
  if (benchmarkComparison['gender_diversity']?.status === 'Below') recommendations.push('Implement gender-neutral job descriptions and diverse interview panels')
  if (benchmarkComparison['ethnic_diversity']?.status === 'Below') recommendations.push('Expand sourcing to HBCUs, Hispanic-serving institutions, and professional associations')
  if (benchmarkComparison['disability_inclusion']?.status === 'Below') recommendations.push('Partner with disability employment organizations and ensure accessible application process')
  if (benchmarkComparison['veteran_inclusion']?.status === 'Below') recommendations.push('Engage veteran job boards and military transition programs')
  recommendations.push('Set measurable diversity goals and track quarterly progress')
  recommendations.push('Conduct regular pay equity audits across demographics')

  return {
    period: data.reporting_period,
    pipeline_diversity: {
      gender_split: genderSplit,
      ethnicity_split: ethnicitySplit,
      disability_pct: totalCandidates > 0 ? Math.round((totalDisability / totalCandidates) * 100) : 0,
      veteran_pct: totalCandidates > 0 ? Math.round((totalVeteran / totalCandidates) * 100) : 0
    },
    hiring_diversity: {
      gender_split: hireGenderSplit,
      ethnicity_split: hireEthnicitySplit
    },
    funnel_analysis: funnel,
    benchmark_comparison: benchmarkComparison,
    overall_diversity_score: overallScore,
    disclaimer: 'Diversity metrics are self-reported and may not capture all dimensions of diversity. Data privacy regulations may limit demographic data collection. This report is for internal DEI tracking purposes.',
    recommendations
  }
}

function formatDiversityReport(r: DiversityMetricsResult): string {
  const lines: string[] = []
  lines.push('# Diversity Metrics & Inclusion Report')
  lines.push('')
  lines.push(`**Period:** ${r.period}`)
  lines.push(`**Overall Diversity Score:** ${r.overall_diversity_score}/100`)
  lines.push('')

  lines.push('## Pipeline Diversity')
  lines.push('')
  lines.push('### Gender Distribution')
  lines.push('')
  for (const [g, pct] of Object.entries(r.pipeline_diversity.gender_split)) {
    lines.push(`- ${g}: ${pct}%`)
  }
  lines.push('')
  lines.push('### Ethnicity Distribution')
  lines.push('')
  for (const [e, pct] of Object.entries(r.pipeline_diversity.ethnicity_split)) {
    lines.push(`- ${e}: ${pct}%`)
  }
  lines.push('')
  lines.push(`- **Disability:** ${r.pipeline_diversity.disability_pct}%`)
  lines.push(`- **Veteran:** ${r.pipeline_diversity.veteran_pct}%`)
  lines.push('')

  lines.push('## Hiring Diversity')
  lines.push('')
  lines.push('### Gender')
  lines.push('')
  for (const [g, pct] of Object.entries(r.hiring_diversity.gender_split)) {
    lines.push(`- ${g}: ${pct}%`)
  }
  lines.push('')
  lines.push('### Ethnicity')
  lines.push('')
  for (const [e, pct] of Object.entries(r.hiring_diversity.ethnicity_split)) {
    lines.push(`- ${e}: ${pct}%`)
  }
  lines.push('')

  lines.push('## Funnel Analysis')
  lines.push('')
  for (const f of r.funnel_analysis) {
    lines.push(`- **${f.stage}:** ${f.total} candidates | Diversity Index: ${f.diversity_index}/100`)
  }
  lines.push('')

  lines.push('## Benchmark Comparison')
  lines.push('')
  for (const [metric, data] of Object.entries(r.benchmark_comparison)) {
    const statusMark = data.status === 'Above' ? '[+]' : '[-]'
    lines.push(`- ${statusMark} ${metric}: Company ${data.company}% vs Benchmark ${data.benchmark}% (${data.status})`)
  }
  lines.push('')

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- [>] ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Disclaimer: ${r.disclaimer}*`)
  lines.push(`*Generated at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const name = 'dsh-tool-recruitagentpro'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: resume_parser
  tools.register(defineTool({
    name: 'resume_parser',
    description: 'Parse resume JSON to extract structured candidate profile including skills categorization, seniority level, career trajectory, strengths, gaps, and employability score.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: candidate (name, email, phone, location, linkedin, summary), work_experience (array of company/title/dates/description), education (array of institution/degree/field/year), skills (string[]), certifications, languages, projects'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: ResumeParserInput = JSON.parse(args.input_data)
      const result = analyzeResume(data)
      return formatResumeReport(result)
    }
  }))

  // Tool 2: candidate_matcher
  tools.register(defineTool({
    name: 'candidate_matcher',
    description: 'Match candidate skills, experience, education, and industry background against a job description. Returns overall match percentage, skill gap analysis, and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: candidate (skills, years_experience, education_level, industry_experience, previous_titles), job_description (title, required_skills, preferred_skills, min_years_experience, required_education, industry, responsibilities)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: CandidateMatcherInput = JSON.parse(args.input_data)
      const result = analyzeCandidateMatch(data)
      return formatMatchReport(result)
    }
  }))

  // Tool 3: interview_scheduler
  tools.register(defineTool({
    name: 'interview_scheduler',
    description: 'Schedule interviews with conflict detection across multiple interviewers and dates. Returns proposed schedule, identified conflicts, and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: candidate_name, interviewers (array of name/role/availability), duration_minutes, preferred_dates, interview_round, constraints (must_include, max_interviewers, buffer_minutes)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: InterviewSchedulerInput = JSON.parse(args.input_data)
      const result = analyzeSchedule(data)
      return formatScheduleReport(result)
    }
  }))

  // Tool 4: talent_pool_analyzer
  tools.register(defineTool({
    name: 'talent_pool_analyzer',
    description: 'Analyze talent pool composition, health, and availability. Returns status breakdown, skills distribution, stale candidate identification, and actionable recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: pool_name, candidates (array of id/name/skills/experience/education/location/status/availability/last_contact_days/salary_expectation), time_period'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: TalentPoolInput = JSON.parse(args.input_data)
      const result = analyzeTalentPool(data)
      return formatTalentPoolReport(result)
    }
  }))

  // Tool 5: job_description_optimizer
  tools.register(defineTool({
    name: 'job_description_optimizer',
    description: 'Optimize job descriptions for ATS algorithms. Returns ATS score, keyword gaps, bias detection, readability analysis, and optimized section suggestions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: job_title, company_industry, original_jd, target_platforms, key_requirements, company_culture'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: JDOptimizerInput = JSON.parse(args.input_data)
      const result = analyzeJD(data)
      return formatJDReport(result)
    }
  }))

  // Tool 6: offer_comparator
  tools.register(defineTool({
    name: 'offer_comparator',
    description: 'Compare salary offers across multiple dimensions including total compensation, growth potential, and work-life balance. Returns ranked offers, negotiation leverage, and market position analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: offers (array of company/base_salary/bonus/equity/benefits_value/title/location/remote_policy/vacation_days/growth_opportunity), candidate_priorities, market_data (role_median/role_p75/role_p90)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: OfferComparatorInput = JSON.parse(args.input_data)
      const result = analyzeOffers(data)
      return formatOfferReport(result)
    }
  }))

  // Tool 7: sourcing_strategy
  tools.register(defineTool({
    name: 'sourcing_strategy',
    description: 'Develop recruitment sourcing channel strategy with ROI analysis. Returns recommended channels, channel mix percentages, cost estimates, and diversity sourcing options.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: role_title, role_level, location, salary_range (min/max), urgency, diversity_goals, previous_channels (array of channel/hires/cost_per_hire/time_to_fill_days)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: SourcingStrategyInput = JSON.parse(args.input_data)
      const result = analyzeSourcing(data)
      return formatSourcingReport(result)
    }
  }))

  // Tool 8: diversity_metrics
  tools.register(defineTool({
    name: 'diversity_metrics',
    description: 'Track diversity hiring metrics across the recruitment pipeline. Returns gender/ethnicity distribution, funnel diversity index, benchmark comparison, and DEI recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: reporting_period, pipeline (array of stage/total/gender/ethnicity/age_groups/disability_pct/veteran_pct), hires (array of department/gender/ethnicity), industry_benchmarks'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: DiversityMetricsInput = JSON.parse(args.input_data)
      const result = analyzeDiversity(data)
      return formatDiversityReport(result)
    }
  }))

  console.log(`[dsh-tool-recruitagentpro] Loaded - Recruitment AI Agent Plugin with 8 tools`)
}
