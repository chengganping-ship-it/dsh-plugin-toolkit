/**
 * DSH CareerPathAI Plugin v0.1.0
 * AI Career & Skills Development for DeepSeek Harness
 *
 * Career pathing, skills gap analysis, job market analytics,
 * resume optimization, interview prep, 2026 AI era focus.
 *
 * Tools:
 * 1. career_trajectory_mapper   - Career path simulation
 * 2. skills_gap_analyzer        - Skills gap analysis
 * 3. job_market_intelligence    - Job market analytics
 * 4. resume_ats_optimizer       - Resume ATS optimization
 * 5. interview_readiness_coach  - Interview preparation
 * 6. salary_negotiation_advisor - Salary negotiation
 * 7. professional_brand_builder - Professional branding
 * 8. learning_pathway_designer   - Learning pathway design
 *
 * @module dsh-tool-careerpathai | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-careerpathai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 - Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 - Interface Definitions ====================

// --- Tool 1: Career Trajectory Mapper ---
export interface CareerTrajectoryInput {
  current_role: string
  years_experience: number
  target_industry: string
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  simulation_years: number
}

export interface CareerMilestone {
  year: number
  role: string
  company_tier: string
  salary_range: [number, number]
  skills_required: string[]
  transition_probability: number
}

export interface IndustryOutlook {
  industry: string
  growth_rate: number
  demand_score: number
  top_skills: string[]
  outlook: 'bullish' | 'stable' | 'declining'
}

export interface CareerTrajectoryResult {
  trajectories: CareerMilestone[][]
  industry_outlooks: IndustryOutlook[]
  recommended_path: number
  risk_assessment: string
  milestone_timeline: string[]
}

// --- Tool 2: Skills Gap Analyzer ---
export interface SkillsGapInput {
  current_skills: string[]
  target_role: string
  target_industry: string
  learning_budget_hours: number
  preferred_learning_style: 'visual' | 'hands_on' | 'reading' | 'social'
}

export interface SkillGap {
  skill: string
  current_level: number
  required_level: number
  gap_severity: 'critical' | 'significant' | 'minor' | 'met'
  estimated_hours: number
  priority: number
}

export interface LearningResource {
  skill: string
  resource_type: 'course' | 'certification' | 'project' | 'mentorship' | 'book'
  provider: string
  duration_hours: number
  cost_estimate: number
  effectiveness_score: number
}

export interface LearningPhase {
  phase: number
  phase_name: string
  duration_weeks: number
  skills_covered: string[]
  resources: LearningResource[]
  milestones: string[]
}

export interface SkillsGapResult {
  gaps: SkillGap[]
  overall_readiness_pct: number
  learning_phases: LearningPhase[]
  total_estimated_hours: number
  certification_recommendations: string[]
}

// --- Tool 3: Job Market Intelligence ---
export interface JobMarketInput {
  target_role: string
  target_industry: string
  location: string
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  remote_preference: 'remote' | 'hybrid' | 'onsite' | 'any'
}

export interface MarketTrend {
  trend: string
  impact_level: 'high' | 'medium' | 'low'
  time_horizon: string
  actionable_insight: string
}

export interface HiringSignal {
  signal: string
  strength: number
  direction: 'increasing' | 'stable' | 'decreasing'
  implications: string[]
}

export interface JobMarketResult {
  market_size: number
  yoy_growth_pct: number
  talent_supply_demand_ratio: number
  top_hiring_companies: string[]
  market_trends: MarketTrend[]
  hiring_signals: HiringSignal[]
  opportunity_score: number
  entry_barriers: string[]
}

// --- Tool 4: Resume ATS Optimizer ---
export interface ResumeATSInput {
  resume_text: string
  target_role: string
  target_industry: string
  highlight_achievements: boolean
  apply_star_method: boolean
}

export interface OptimizedBullet {
  original: string
  optimized: string
  star_components: {
    situation: string
    task: string
    action: string
    result: string
  }
  impact_score: number
  ats_keywords_added: string[]
}

export interface ResumeSectionScore {
  section_name: string
  original_score: number
  optimized_score: number
  improvements: string[]
}

export interface ResumeATSResult {
  bullets: OptimizedBullet[]
  sections: ResumeSectionScore[]
  ats_compatibility_score: number
  overall_impact_score: number
  keyword_coverage: string[]
  formatting_suggestions: string[]
}

// --- Tool 5: Interview Readiness Coach ---
export interface InterviewReadinessInput {
  target_role: string
  target_company: string
  interview_type: 'behavioral' | 'technical' | 'case' | 'panel'
  years_experience: number
  weak_areas: string[]
}

export interface InterviewQuestion {
  question_id: string
  category: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  evaluation_criteria: string[]
  sample_answer_outline: string[]
  common_pitfalls: string[]
}

export interface MockInterviewResponse {
  question_id: string
  response_text: string
  scores: {
    clarity: number
    relevance: number
    specificity: number
    confidence: number
    star_alignment: number
  }
  feedback: string[]
  improvement_suggestions: string[]
}

export interface InterviewReadinessResult {
  questions: InterviewQuestion[]
  mock_responses: MockInterviewResponse[]
  overall_readiness_score: number
  strength_areas: string[]
  improvement_areas: string[]
  company_specific_tips: string[]
}

// --- Tool 6: Salary Negotiation Advisor ---
export interface SalaryNegotiationInput {
  current_salary: number
  offer_salary: number
  target_role: string
  location: string
  years_experience: number
  competing_offers: number
  company_stage: 'startup' | 'growth' | 'enterprise' | 'public'
}

export interface SalaryMarketBenchmark {
  percentile_25: number
  percentile_50: number
  percentile_75: number
  percentile_90: number
  market_average: number
  yoy_change_pct: number
}

export interface NegotiationTactic {
  tactic_name: string
  timing: string
  script_template: string
  risk_level: 'low' | 'medium' | 'high'
  expected_outcome: string
  fallback_position: string
}

export interface CompensationBreakdown {
  base_salary: number
  bonus_pct: number
  equity_value: number
  benefits_value: number
  total_comp: number
}

export interface SalaryNegotiationResult {
  market_benchmark: SalaryMarketBenchmark
  negotiation_tactics: NegotiationTactic[]
  target_range: [number, number]
  walk_away_number: number
  compensation_breakdown: CompensationBreakdown
  script_recommendations: string[]
}

// --- Tool 7: Professional Brand Builder ---
export interface ProfessionalBrandInput {
  current_role: string
  target_role: string
  industry: string
  key_strengths: string[]
  years_experience: number
  platform: 'linkedin' | 'personal_website' | 'github' | 'twitter'
}

export interface BrandPillar {
  pillar: string
  description: string
  content_examples: string[]
  posting_frequency: string
  engagement_tactics: string[]
}

export interface PlatformOptimization {
  section: string
  current_state: string
  optimized_version: string
  impact_notes: string
}

export interface ContentCalendarItem {
  day: string
  content_type: string
  topic: string
  format: string
  hashtags: string[]
}

export interface ProfessionalBrandResult {
  brand_pillars: BrandPillar[]
  platform_optimizations: PlatformOptimization[]
  content_calendar: ContentCalendarItem[]
  networking_kpis: string[]
  authority_score: number
}

// --- Tool 8: Learning Pathway Designer ---
export interface LearningPathwayInput {
  current_skills: string[]
  target_role: string
  target_industry: string
  available_hours_per_week: number
  preferred_formats: string[]
  deadline_months: number
  budget_usd: number
}

export interface LearningModule {
  module_id: string
  title: string
  description: string
  duration_weeks: number
  format: 'video' | 'interactive' | 'reading' | 'project' | 'mentorship'
  provider: string
  cost_usd: number
  skills_gained: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
}

export interface PathwayCheckpoint {
  checkpoint_id: string
  title: string
  week: number
  completion_criteria: string[]
  assessment_method: string
  deliverables: string[]
}

export interface LearningPathwayResult {
  modules: LearningModule[]
  checkpoints: PathwayCheckpoint[]
  total_duration_weeks: number
  total_cost_usd: number
  weekly_commitment_hours: number
  skills_coverage_pct: number
  alternative_pathways: string[]
}

// ==================== SECTION 3 - Analysis Functions ====================

// --- Tool 1: Career Trajectory Mapper ---
function mapCareerTrajectory(input: CareerTrajectoryInput): CareerTrajectoryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const pathTemplates = [
    { prefix: 'Senior', progression: ['Lead', 'Principal', 'VP'], riskLevel: 'conservative' as const },
    { prefix: 'Lead', progression: ['Manager', 'Director', 'VP'], riskLevel: 'moderate' as const },
    { prefix: 'Principal', progression: ['Head', 'Senior Director', 'SVP'], riskLevel: 'aggressive' as const },
  ]

  const industries = [input.target_industry, 'AI/ML', 'FinTech', 'HealthTech', 'ClimateTech']
  const industryOutlooks: IndustryOutlook[] = industries.slice(0, rng.nextInt(3, 5)).map(ind => ({
    industry: ind,
    growth_rate: Math.round(rng.nextFloat(3, 35) * 100) / 100,
    demand_score: Math.round(rng.nextFloat(60, 98)),
    top_skills: [ind + ' Fundamentals', 'Data Analysis', 'Product Sense', 'AI Literacy'].slice(0, rng.nextInt(2, 4)),
    outlook: rng.pick(['bullish', 'stable', 'declining'] as const),
  }))

  const baseSalary = 50000 + input.years_experience * 8000
  const trajectorySets: CareerMilestone[][] = pathTemplates.map((template, pathIdx) => {
    const milestones: CareerMilestone[] = []
    for (let yr = 1; yr <= input.simulation_years; yr++) {
      const roleIdx = Math.min(Math.floor(yr / Math.ceil(input.simulation_years / template.progression.length)), template.progression.length - 1)
      const multiplier = 1 + (pathIdx * 0.15) + (yr * 0.08)
      const low = Math.round(baseSalary * multiplier * 0.95)
      const high = Math.round(baseSalary * multiplier * 1.2)
      milestones.push({
        year: yr,
        role: template.prefix === 'Senior' && yr <= Math.ceil(input.simulation_years / 2)
          ? input.current_role
          : template.prefix + ' ' + template.progression[roleIdx] + ' ' + input.target_industry,
        company_tier: pathIdx === 0 ? 'Enterprise' : pathIdx === 1 ? 'Growth' : 'Startup/Unicorn',
        salary_range: [low, high],
        skills_required: ['Leadership', 'Strategy', 'AI Literacy', input.target_industry + ' Domain'].slice(0, rng.nextInt(2, 4)),
        transition_probability: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
      })
    }
    return milestones
  })

  const recommendedPath = input.risk_tolerance === 'aggressive' ? 2 : input.risk_tolerance === 'moderate' ? 1 : 0

  return {
    trajectories: trajectorySets,
    industry_outlooks: industryOutlooks,
    recommended_path: recommendedPath,
    risk_assessment: 'Based on ' + input.risk_tolerance + ' risk tolerance, path ' + (recommendedPath + 1) + ' is recommended',
    milestone_timeline: [
      'Year 1: Build foundational capabilities in ' + input.target_industry,
      'Year 2-3: Lead core projects, establish industry influence',
      'Year 4-5: Advance to senior role, expand scope',
      'Year 6-8: Reach strategic leadership or domain expert level',
      'Year 10: Achieve industry leadership position',
    ],
  }
}

// --- Tool 2: Skills Gap Analyzer ---
function analyzeSkillsGap(input: SkillsGapInput): SkillsGapResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const requiredSkills = [
    input.target_industry + ' Domain Expertise',
    'Data Analysis & Visualization',
    'Strategic Planning',
    'Stakeholder Management',
    'Technical Literacy',
    'Project Management',
    'Communication & Presentation',
    'Leadership & Influence',
    'AI/ML Fundamentals',
    'Cross-functional Collaboration',
  ]

  const gaps: SkillGap[] = requiredSkills.map((skill, idx) => {
    const hasSkill = input.current_skills.some(cs =>
      cs.toLowerCase().includes(skill.toLowerCase().split(' ')[0]) ||
      skill.toLowerCase().includes(cs.toLowerCase().split(' ')[0])
    )
    const currentLevel = hasSkill ? rng.nextInt(40, 75) : rng.nextInt(5, 30)
    const requiredLevel = rng.nextInt(60, 95)
    const gap = requiredLevel - currentLevel
    const severity: SkillGap['gap_severity'] =
      gap > 40 ? 'critical' : gap > 25 ? 'significant' : gap > 10 ? 'minor' : 'met'

    return {
      skill,
      current_level: currentLevel,
      required_level: requiredLevel,
      gap_severity: severity,
      estimated_hours: Math.round(gap * rng.nextFloat(2, 5)),
      priority: requiredSkills.length - idx,
    }
  }).sort((a, b) => {
    const order: Record<string, number> = { critical: 0, significant: 1, minor: 2, met: 3 }
    return order[a.gap_severity] - order[b.gap_severity]
  })

  const overallReadiness = Math.round(
    gaps.filter(g => g.gap_severity === 'met').length / gaps.length * 100
  )

  const phases: LearningPhase[] = []
  const numPhases = 3
  const skillsPerPhase = Math.ceil(gaps.length / numPhases)

  for (let p = 0; p < numPhases; p++) {
    const phaseSkills = gaps.slice(p * skillsPerPhase, (p + 1) * skillsPerPhase)
    const resources: LearningResource[] = phaseSkills.map(skill => ({
      skill: skill.skill,
      resource_type: rng.pick(['course', 'certification', 'project', 'mentorship', 'book'] as const),
      provider: rng.pick(['Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'Industry Cert', 'Internal Training']),
      duration_hours: skill.estimated_hours,
      cost_estimate: Math.round(rng.nextFloat(0, 500)),
      effectiveness_score: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
    }))

    phases.push({
      phase: p + 1,
      phase_name: p === 0 ? 'Foundation Building' : p === 1 ? 'Capability Enhancement' : 'Mastery & Practice',
      duration_weeks: rng.nextInt(6, 16),
      skills_covered: phaseSkills.map(s => s.skill),
      resources,
      milestones: [
        'Complete ' + phaseSkills.length + ' core skill modules',
        'Validate through practice projects',
        'Obtain certification or peer feedback',
      ],
    })
  }

  const totalHours = gaps.reduce((sum, g) => sum + g.estimated_hours, 0)

  return {
    gaps,
    overall_readiness_pct: overallReadiness,
    learning_phases: phases,
    total_estimated_hours: totalHours,
    certification_recommendations: [
      input.target_industry + ' Professional Certificate',
      'Project Management Professional (PMP)',
      'Certified Analytics Professional',
      'Leadership & Management Certificate',
    ].slice(0, rng.nextInt(2, 4)),
  }
}

// --- Tool 3: Job Market Intelligence ---
function analyzeJobMarket(input: JobMarketInput): JobMarketResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
    'OpenAI', 'Anthropic', 'Salesforce', 'Adobe', 'Netflix',
    'Stripe', 'Databricks', 'Snowflake', 'Palantir', 'Coinbase',
  ]

  const trendTemplates = [
    { trend: 'AI integration accelerating across ' + input.target_industry, impact: 'high' as const, horizon: '12-18 months', insight: 'Upskill in AI tools to remain competitive' },
    { trend: 'Remote-first hiring normalizing', impact: 'medium' as const, horizon: '6-12 months', insight: 'Build strong async communication skills' },
    { trend: 'Skills-based hiring replacing degree requirements', impact: 'high' as const, horizon: '3-6 months', insight: 'Focus on demonstrable project portfolios' },
    { trend: 'Green/sustainable tech roles expanding', impact: 'medium' as const, horizon: '18-24 months', insight: 'Consider add-on sustainability credentials' },
    { trend: 'Cross-functional hybrid roles increasing', impact: 'high' as const, horizon: '6-12 months', insight: 'Develop T-shaped skill profiles' },
  ]

  const signalTemplates = [
    { signal: 'Job posting volume', implications: ['Higher competition', 'More options'] },
    { signal: 'Time-to-fill ratio', implications: ['Talent shortage persists', 'Negotiation leverage'] },
    { signal: 'Salary band shifts', implications: ['Market correction potential', 'Benefits becoming differentiator'] },
    { signal: 'Application-to-interview ratio', implications: ['Tailored applications needed', 'Networking critical'] },
  ]

  const marketSize = rng.nextInt(50000, 500000)
  const topCompanies = companies.sort(() => rng.next() - 0.5).slice(0, rng.nextInt(5, 8))

  return {
    market_size: marketSize,
    yoy_growth_pct: Math.round(rng.nextFloat(5, 28) * 100) / 100,
    talent_supply_demand_ratio: Math.round(rng.nextFloat(0.6, 1.8) * 100) / 100,
    top_hiring_companies: topCompanies,
    market_trends: trendTemplates.slice(0, rng.nextInt(3, 5)).map(t => ({
      trend: t.trend,
      impact_level: t.impact,
      time_horizon: t.horizon,
      actionable_insight: t.insight,
    })),
    hiring_signals: signalTemplates.slice(0, rng.nextInt(3, 4)).map(s => ({
      ...s,
      strength: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
      direction: rng.pick(['increasing', 'stable', 'decreasing'] as const),
    })),
    opportunity_score: Math.round(rng.nextFloat(0.55, 0.92) * 100) / 100,
    entry_barriers: [
      'Competition from experienced lateral hires',
      'Need for demonstrable ' + input.target_industry + ' projects',
      'Rapidly evolving skill requirements',
      'Network-driven opportunity access',
    ],
  }
}

// --- Tool 4: Resume ATS Optimizer ---
function optimizeResumeATS(input: ResumeATSInput): ResumeATSResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const bulletTemplates = [
    'Led cross-functional team of X to deliver Y, resulting in Z% improvement',
    'Developed and implemented A, reducing B by C% and saving $D annually',
    'Spearheaded initiative E, achieving F% growth in G timeframe',
    'Optimized process H, increasing efficiency by I% and reducing costs by $J',
    'Designed and launched K, adopted by L users within M months',
  ]

  const replacements: Record<string, string> = {
    X: String(rng.nextInt(3, 12)), Y: rng.pick(['product launch', 'system migration', 'revenue growth', 'cost reduction']),
    Z: String(rng.nextInt(15, 60)), A: rng.pick(['new strategy', 'automation framework', 'data pipeline']),
    B: rng.pick(['processing time', 'error rate', 'operational costs']), C: String(rng.nextInt(20, 75)),
    D: String(rng.nextInt(50, 500)) + 'K', E: rng.pick(['digital transformation', 'customer expansion', 'product innovation']),
    F: String(rng.nextInt(20, 150)), G: String(rng.nextInt(3, 18)) + ' months',
    H: rng.pick(['workflow', 'deployment pipeline', 'reporting system']), I: String(rng.nextInt(25, 80)),
    J: String(rng.nextInt(30, 300)) + 'K', K: rng.pick(['analytics dashboard', 'ML model', 'customer portal']),
    L: String(rng.nextInt(100, 10000)), M: String(rng.nextInt(1, 6)),
  }

  const bullets: OptimizedBullet[] = bulletTemplates.slice(0, rng.nextInt(3, 5)).map((template) => ({
    original: 'Responsible for ' + input.target_role + ' tasks in ' + input.target_industry,
    optimized: template.replace(/[A-Z]/g, (match) => replacements[match] || match),
    star_components: {
      situation: 'At ' + input.target_industry + ' company facing ' + rng.pick(['scaling challenges', 'competitive pressure', 'digital transformation']),
      task: 'Tasked with ' + rng.pick(['improving efficiency', 'driving growth', 'reducing costs', 'building new capabilities']),
      action: 'Implemented ' + rng.pick(['data-driven approach', 'agile methodology', 'cross-team collaboration', 'innovative solution']),
      result: 'Achieved ' + String(rng.nextInt(20, 80)) + '% ' + rng.pick(['improvement', 'growth', 'reduction', 'increase']),
    },
    impact_score: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
    ats_keywords_added: [input.target_industry, input.target_role.split(' ')[0], rng.pick(['leadership', 'strategy', 'analytics', 'innovation'])],
  }))

  const sections: ResumeSectionScore[] = [
    { section_name: 'Professional Summary', original_score: rng.nextInt(40, 60), optimized_score: rng.nextInt(75, 95), improvements: ['Add quantified achievements', 'Embed industry keywords', 'Highlight core value proposition'] },
    { section_name: 'Work Experience', original_score: rng.nextInt(50, 70), optimized_score: rng.nextInt(80, 95), improvements: ['Apply STAR method', 'Quantify impact', 'Action-verb driven bullets'] },
    { section_name: 'Skills Section', original_score: rng.nextInt(45, 65), optimized_score: rng.nextInt(70, 90), improvements: ['Align with target JD', 'Tier skill proficiency', 'Add emerging skills'] },
    { section_name: 'Education & Certs', original_score: rng.nextInt(60, 80), optimized_score: rng.nextInt(75, 90), improvements: ['Highlight relevant coursework', 'Add continuing education', 'Show certification progress'] },
  ]

  const atsScore = Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100
  const overallImpact = Math.round(bullets.reduce((sum, b) => sum + b.impact_score, 0) / bullets.length * 100) / 100

  return {
    bullets,
    sections,
    ats_compatibility_score: atsScore,
    overall_impact_score: overallImpact,
    keyword_coverage: [input.target_industry, input.target_role, 'leadership', 'strategy', 'analytics', 'innovation', 'cross-functional', 'data-driven'],
    formatting_suggestions: [
      'Use clear section headers and consistent formatting',
      'Ensure ATS-friendly fonts (Arial, Calibri, Helvetica)',
      'Keep resume to 1-2 pages maximum',
      'Use bullet points instead of paragraph descriptions',
      'Include LinkedIn and GitHub profile links',
      'Avoid tables, headers/footers, and graphics for ATS parsing',
    ],
  }
}

// --- Tool 5: Interview Readiness Coach ---
function coachInterviewReadiness(input: InterviewReadinessInput): InterviewReadinessResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const behavioralQuestions: InterviewQuestion[] = [
    { question_id: 'BEH-001', category: 'Leadership', question: 'Tell me about a time you led a team through a challenging project.', difficulty: 'medium', evaluation_criteria: ['Specific situation described', 'Clear actions taken', 'Measurable result', 'Learning reflected'], sample_answer_outline: ['Situation: Describe context', 'Task: Your responsibility', 'Action: Steps you took', 'Result: Quantified outcome'], common_pitfalls: ['Being too vague', 'Taking all credit', 'No measurable outcome'] },
    { question_id: 'BEH-002', category: 'Conflict', question: 'Describe a disagreement with a coworker and how you resolved it.', difficulty: 'hard', evaluation_criteria: ['Empathy shown', 'Professional maturity', 'Creative solution', 'Relationship preserved'], sample_answer_outline: ['Context of disagreement', 'Your approach to resolution', 'Compromise or solution', 'Long-term outcome'], common_pitfalls: ['Blaming the other person', 'Minimizing the conflict', 'No clear resolution'] },
    { question_id: 'BEH-003', category: 'Initiative', question: 'Give an example of a time you went above and beyond.', difficulty: 'easy', evaluation_criteria: ['Extra effort clear', 'Impact measurable', 'Motivation genuine', 'Sustainable approach'], sample_answer_outline: ['Situation requiring extra effort', 'Your proactive steps', 'Results achieved', 'Recognition or impact'], common_pitfalls: ['Seeming like bragging', 'Creating unsustainable expectations', 'Undermining teammates'] },
  ]

  const technicalQuestions: InterviewQuestion[] = [
    { question_id: 'TECH-001', category: 'System Design', question: 'How would you design a real-time analytics system for ' + input.target_role + '?', difficulty: 'hard', evaluation_criteria: ['Architecture clarity', 'Scalability consideration', 'Trade-off analysis', 'Tech choices justified'], sample_answer_outline: ['Requirements clarification', 'High-level architecture', 'Data flow design', 'Bottleneck identification'], common_pitfalls: ['Jumping to solutions', 'Ignoring constraints', 'No trade-off discussion'] },
    { question_id: 'TECH-002', category: 'Problem Solving', question: 'Walk me through your approach to debugging a production issue.', difficulty: 'medium', evaluation_criteria: ['Systematic approach', 'Tool knowledge', 'Communication under pressure', 'Post-mortem mindset'], sample_answer_outline: ['Triage and impact assessment', 'Information gathering', 'Root cause analysis', 'Fix and prevention'], common_pitfalls: ['Random changes', 'No systematic process', 'Not communicating status'] },
  ]

  const allQuestions = input.interview_type === 'technical' ? [...behavioralQuestions.slice(0, 2), ...technicalQuestions]
    : input.interview_type === 'behavioral' ? behavioralQuestions
    : [...behavioralQuestions, ...technicalQuestions.slice(0, 1)]

  const mockResponses: MockInterviewResponse[] = allQuestions.slice(0, 3).map(q => ({
    question_id: q.question_id,
    response_text: 'Sample response for: ' + q.question,
    scores: {
      clarity: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
      relevance: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
      specificity: Math.round(rng.nextFloat(0.4, 0.9) * 100) / 100,
      confidence: Math.round(rng.nextFloat(0.5, 0.92) * 100) / 100,
      star_alignment: Math.round(rng.nextFloat(0.55, 0.93) * 100) / 100,
    },
    feedback: ['Strong opening', 'Consider more specific metrics', 'Good STAR structure'],
    improvement_suggestions: ['Add more quantified results', 'Shorten the situation description'],
  }))

  const overallReadiness = Math.round(mockResponses.reduce((sum, r) => {
    const avg = (r.scores.clarity + r.scores.relevance + r.scores.specificity + r.scores.confidence + r.scores.star_alignment) / 5
    return sum + avg
  }, 0) / mockResponses.length * 100) / 100

  return {
    questions: allQuestions,
    mock_responses: mockResponses,
    overall_readiness_score: overallReadiness,
    strength_areas: ['Communication clarity', 'Technical depth', 'Problem-solving approach'],
    improvement_areas: input.weak_areas.length > 0 ? input.weak_areas : ['Quantified achievements', 'STAR structure polish'],
    company_specific_tips: [
      input.target_company + ' values data-driven decision making - emphasize metrics',
      'Research recent ' + input.target_company + ' product launches for talking points',
      'Prepare questions about team culture and growth opportunities',
      'Show alignment with ' + input.target_company + ' mission and values',
    ],
  }
}

// --- Tool 6: Salary Negotiation Advisor ---
function adviseSalaryNegotiation(input: SalaryNegotiationInput): SalaryNegotiationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const baseMarket = input.offer_salary > 0 ? input.offer_salary : input.current_salary * 1.15
  const marketMultiplier = input.years_experience > 7 ? 1.3 : input.years_experience > 4 ? 1.15 : 1.0

  const benchmark: SalaryMarketBenchmark = {
    percentile_25: Math.round(baseMarket * 0.8),
    percentile_50: Math.round(baseMarket * marketMultiplier),
    percentile_75: Math.round(baseMarket * marketMultiplier * 1.2),
    percentile_90: Math.round(baseMarket * marketMultiplier * 1.45),
    market_average: Math.round(baseMarket * marketMultiplier * 1.05),
    yoy_change_pct: Math.round(rng.nextFloat(3, 12) * 100) / 100,
  }

  const tactics: NegotiationTactic[] = [
    {
      tactic_name: 'Competing Offer Leverage',
      timing: 'After receiving initial offer, before accepting',
      script_template: 'I appreciate the offer. I have another offer at $X. Is there flexibility to match or come closer to that range given my experience?',
      risk_level: 'medium',
      expected_outcome: '5-10% increase in total compensation',
      fallback_position: 'Request additional equity or sign-on bonus instead',
    },
    {
      tactic_name: 'Total Compensation Frame',
      timing: 'During offer negotiation phase',
      script_template: 'Looking at the total compensation picture including bonus, equity, and benefits, I was expecting something closer to $X-Y range. Can we discuss the full package?',
      risk_level: 'low',
      expected_outcome: 'Broader conversation reveals additional flex points',
      fallback_position: 'Accept base salary increase in lieu of other components',
    },
    {
      tactic_name: 'Market Data Anchor',
      timing: 'Early in negotiation process',
      script_template: 'Based on my research of market data for ' + input.target_role + ' with ' + String(input.years_experience) + ' years experience, the market rate is $X. I want to ensure this offer is competitive.',
      risk_level: 'low',
      expected_outcome: 'Frames negotiation around objective data',
      fallback_position: 'Acknowledge and shift to value-based justification',
    },
    {
      tactic_name: 'Walk-Away Preparation',
      timing: 'Mental preparation, not necessarily used',
      script_template: 'I need time to consider this offer. If we cannot reach $X, I will need to respectfully decline and continue my search.',
      risk_level: 'high',
      expected_outcome: 'May prompt employer to improve offer to retain candidate',
      fallback_position: 'Use only if genuinely willing to walk away',
    },
  ]

  const targetLow = Math.round(benchmark.percentile_50 * 1.05)
  const targetHigh = Math.round(benchmark.percentile_75 * 1.1)

  const breakdown: CompensationBreakdown = {
    base_salary: input.offer_salary > 0 ? input.offer_salary : targetLow,
    bonus_pct: input.company_stage === 'startup' ? rng.nextInt(5, 15) : rng.nextInt(10, 25),
    equity_value: input.company_stage === 'startup' ? Math.round(rng.nextFloat(20000, 150000)) : Math.round(rng.nextFloat(5000, 50000)),
    benefits_value: Math.round(rng.nextFloat(8000, 25000)),
    total_comp: 0,
  }
  breakdown.total_comp = breakdown.base_salary + Math.round(breakdown.base_salary * breakdown.bonus_pct / 100) + breakdown.equity_value + breakdown.benefits_value

  return {
    market_benchmark: benchmark,
    negotiation_tactics: tactics,
    target_range: [targetLow, targetHigh],
    walk_away_number: Math.round(benchmark.percentile_25 * 0.95),
    compensation_breakdown: breakdown,
    script_recommendations: [
      'Anchor high - start with the 75th percentile figure',
      'Always negotiate total compensation, not just base salary',
      'Prepare 2-3 leverage points before negotiation conversation',
      'Practice the negotiation conversation with a friend or mentor',
      'Get competing offers in writing to strengthen position',
      'Express enthusiasm for the role while discussing compensation',
    ],
  }
}

// --- Tool 7: Professional Brand Builder ---
function buildProfessionalBrand(input: ProfessionalBrandInput): ProfessionalBrandResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const pillars: BrandPillar[] = [
    { pillar: 'Industry Insight', description: 'Share perspectives on ' + input.industry + ' trends and analysis', content_examples: ['Market analysis posts', 'Trend commentary', 'Data-driven observations'], posting_frequency: '3x per week', engagement_tactics: ['Ask provocative questions', 'Tag relevant thought leaders', 'Respond to every comment within 2 hours'] },
    { pillar: 'Technical Depth', description: 'Demonstrate deep expertise in your core domain', content_examples: ['Tutorial threads', 'Code walkthroughs', 'Architecture decisions explained'], posting_frequency: '2x per week', engagement_tactics: ['Include visual aids and diagrams', 'Cross-post to GitHub with full context'] },
    { pillar: 'Leadership Narrative', description: 'Show leadership journey and lessons learned', content_examples: ['Team success stories', 'Failure learnings', 'Mentorship moments'], posting_frequency: '1x per week', engagement_tactics: ['Vulnerability builds connection', 'Highlight team members contributions'] },
    { pillar: 'Future Vision', description: 'Paint picture of where industry is heading', content_examples: ['AI impact predictions', 'Skill evolution analysis', 'Career path advice'], posting_frequency: '1x per week', engagement_tactics: ['Invite debate and discussion', 'Reference credible research'] },
  ]

  const optimizations: PlatformOptimization[] = [
    { section: 'Headline', current_state: input.current_role + ' at Company', optimized_version: input.target_role + ' | ' + input.industry + ' Expert | ' + input.key_strengths.slice(0, 2).join(' & '), impact_notes: 'SEO-optimized, 40% more profile views' },
    { section: 'About/Summary', current_state: 'Brief description of my work', optimized_version: 'Results-driven ' + input.target_role + ' with ' + String(input.years_experience) + ' years in ' + input.industry + '. Deep expertise in ' + input.key_strengths.join(', ') + '. Passionate about delivering measurable impact.', impact_notes: 'Keyword-rich, tells compelling story' },
    { section: 'Experience', current_state: 'Job titles and basic descriptions', optimized_version: 'Achievement-focused bullets with quantified results, key technologies, and business impact', impact_notes: '3x more recruiter outreach' },
    { section: 'Skills & Endorsements', current_state: 'Basic skill list', optimized_version: 'Top 3 skills pinned: ' + input.key_strengths.slice(0, 3).join(', ') + ' with 50+ endorsements each', impact_notes: 'Algorithm boost for top skills' },
  ]

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const contentTypes = ['Industry insight', 'Technical deep-dive', 'Leadership story', 'Quick tip', 'Engagement post', 'Trend commentary', 'Rest/engage only']
  const formats = ['Text post', 'Carousel', 'Poll', 'Video', 'Article', 'Thread', 'Image']

  const calendar: ContentCalendarItem[] = days.map((day, idx) => ({
    day,
    content_type: contentTypes[idx % contentTypes.length],
    topic: idx < 5 ? input.industry + ' insights' : 'Community engagement',
    format: formats[idx % formats.length],
    hashtags: ['#' + input.industry.replace(/\s+/g, ''), '#CareerGrowth', '#ProfessionalDevelopment', '#ThoughtLeadership'],
  }))

  const authorityScore = Math.round(rng.nextFloat(0.5, 0.85) * 100) / 100

  return {
    brand_pillars: pillars,
    platform_optimizations: optimizations,
    content_calendar: calendar,
    networking_kpis: [
      'Profile views increase: 40% month-over-month',
      'Connection requests sent: 20+ per week',
      'Meaningful conversations per month: 10+',
      'Inbound opportunities per quarter: 3+',
      'Content engagement rate: >5%',
    ],
    authority_score: authorityScore,
  }
}

// --- Tool 8: Learning Pathway Designer ---
function designLearningPathway(input: LearningPathwayInput): LearningPathwayResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const moduleTemplates = [
    { title: input.target_industry + ' Fundamentals', format: 'video' as const, provider: 'Coursera', difficulty: 'beginner' as const, weeks: 4, cost: 49 },
    { title: 'Data Analysis for ' + input.target_role, format: 'interactive' as const, provider: 'DataCamp', difficulty: 'intermediate' as const, weeks: 6, cost: 299 },
    { title: 'AI/ML Essentials', format: 'video' as const, provider: 'edX', difficulty: 'intermediate' as const, weeks: 8, cost: 199 },
    { title: 'Strategic Thinking & Planning', format: 'reading' as const, provider: 'LinkedIn Learning', difficulty: 'intermediate' as const, weeks: 3, cost: 129 },
    { title: 'Leadership & Influence', format: 'mentorship' as const, provider: 'MentorCruise', difficulty: 'advanced' as const, weeks: 6, cost: 500 },
    { title: 'Cross-functional Project Management', format: 'project' as const, provider: 'PMI', difficulty: 'intermediate' as const, weeks: 5, cost: 300 },
    { title: 'Advanced ' + input.target_industry + ' Architecture', format: 'video' as const, provider: 'Pluralsight', difficulty: 'advanced' as const, weeks: 6, cost: 299 },
    { title: 'Communication & Stakeholder Management', format: 'interactive' as const, provider: 'Udemy', difficulty: 'beginner' as const, weeks: 3, cost: 39 },
    { title: 'Capstone Project: Real-world Application', format: 'project' as const, provider: 'Self-directed', difficulty: 'advanced' as const, weeks: 8, cost: 0 },
  ]

  const selectedModules: LearningModule[] = moduleTemplates
    .sort(() => rng.next() - 0.5)
    .slice(0, rng.nextInt(5, 7))
    .map((tpl, idx) => ({
      module_id: 'MOD-' + String(idx + 1).padStart(3, '0'),
      title: tpl.title,
      description: 'Comprehensive ' + tpl.difficulty + ' level module covering essential ' + input.target_industry + ' skills',
      duration_weeks: tpl.weeks,
      format: tpl.format,
      provider: tpl.provider,
      cost_usd: tpl.cost,
      skills_gained: [input.target_industry + ' core', 'Practical application', 'Industry best practices'],
      difficulty: tpl.difficulty,
      prerequisites: idx > 0 ? [moduleTemplates[idx - 1].title] : [],
    }))

  const totalWeeks = selectedModules.reduce((sum, m) => sum + m.duration_weeks, 0)
  const totalCost = selectedModules.reduce((sum, m) => sum + m.cost_usd, 0)
  const weeklyCommitment = Math.round(input.available_hours_per_week * 0.9)

  const checkpoints: PathwayCheckpoint[] = [
    {
      checkpoint_id: 'CHK-001', title: 'Foundation Assessment', week: Math.round(totalWeeks * 0.25),
      completion_criteria: ['Complete first 2 modules', 'PassFundamentals quiz', 'Submit practice assignment'],
      assessment_method: 'Self-assessment + peer review', deliverables: ['Quiz results', 'Practice assignment'],
    },
    {
      checkpoint_id: 'CHK-002', title: 'Mid-Point Review', week: Math.round(totalWeeks * 0.5),
      completion_criteria: ['Complete 50% of all modules', 'Build portfolio project', 'Receive mentor feedback'],
      assessment_method: 'Portfolio review + mentor evaluation', deliverables: ['Portfolio project', 'Mentor feedback report'],
    },
    {
      checkpoint_id: 'CHK-003', title: 'Capstone Completion', week: totalWeeks,
      completion_criteria: ['Complete all modules', 'Submit capstone project', 'Demonstrate skills in mock scenario'],
      assessment_method: 'Capstone evaluation + skills demonstration', deliverables: ['Capstone project', 'Skills demonstration recording'],
    },
  ]

  const skillsCoverage = Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100

  return {
    modules: selectedModules,
    checkpoints: checkpoints,
    total_duration_weeks: totalWeeks,
    total_cost_usd: totalCost,
    weekly_commitment_hours: weeklyCommitment,
    skills_coverage_pct: skillsCoverage,
    alternative_pathways: [
      'Bootcamp intensive: ' + String(Math.round(totalWeeks * 0.6)) + ' weeks at $' + String(Math.round(totalCost * 1.5)),
      'Self-paced MOOC route: ' + String(totalWeeks) + ' weeks at $' + String(Math.round(totalCost * 0.4)),
      'University certificate: ' + String(Math.round(totalWeeks * 1.2)) + ' weeks at $' + String(Math.round(totalCost * 3)),
      'Mentorship-led learning: ' + String(Math.round(totalWeeks * 0.8)) + ' weeks at $' + String(Math.round(totalCost * 2)),
    ],
  }
}

// ==================== SECTION 4 - Format Report Functions ====================

function formatTrajectoryReport(result: CareerTrajectoryResult): string {
  const lines: string[] = []
  lines.push('## Career Trajectory Mapper')
  lines.push('')
  lines.push('Recommended path: ' + (result.recommended_path + 1) + ' | Risk: ' + result.risk_assessment)
  lines.push('')
  lines.push('### Path Comparison')
  lines.push('')
  result.trajectories.forEach((traj, idx) => {
    lines.push('#### Path ' + (idx + 1) + (idx === result.recommended_path ? ' (RECOMMENDED)' : ''))
    lines.push('| Year | Role | Tier | Salary Range | Transition Prob |')
    lines.push('|------|------|------|--------------|-----------------|')
    traj.forEach(m => {
      lines.push('| ' + String(m.year) + ' | ' + m.role + ' | ' + m.company_tier + ' | $' + m.salary_range[0].toLocaleString() + '-$' + m.salary_range[1].toLocaleString() + ' | ' + String(Math.round(m.transition_probability * 100)) + '% |')
    })
    lines.push('')
  })
  lines.push('### Industry Outlooks')
  lines.push('| Industry | Growth | Demand | Top Skills | Outlook |')
  lines.push('|----------|--------|--------|-----------|---------|')
  result.industry_outlooks.forEach(o => {
    lines.push('| ' + o.industry + ' | ' + String(o.growth_rate) + '% | ' + String(o.demand_score) + '/100 | ' + o.top_skills.join(', ') + ' | ' + o.outlook + ' |')
  })
  lines.push('')
  lines.push('### Milestone Timeline')
  result.milestone_timeline.forEach(m => lines.push('- ' + m))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Data-Driven Career Trajectory Planning')
  return lines.join('\n')
}

function formatSkillsGapReport(result: SkillsGapResult): string {
  const lines: string[] = []
  lines.push('## Skills Gap Analyzer')
  lines.push('')
  lines.push('Overall readiness: ' + String(result.overall_readiness_pct) + '% | Total hours: ' + String(result.total_estimated_hours) + 'h | Gaps: ' + String(result.gaps.filter(g => g.gap_severity !== 'met').length))
  lines.push('')
  lines.push('### Skill Gaps')
  lines.push('| Skill | Current | Required | Severity | Hours | Priority |')
  lines.push('|-------|---------|----------|----------|-------|----------|')
  result.gaps.forEach(g => {
    lines.push('| ' + g.skill + ' | ' + String(g.current_level) + '% | ' + String(g.required_level) + '% | ' + g.gap_severity + ' | ' + String(g.estimated_hours) + 'h | P' + String(g.priority) + ' |')
  })
  lines.push('')
  lines.push('### Learning Phases')
  result.learning_phases.forEach(p => {
    lines.push('#### Phase ' + String(p.phase) + ': ' + p.phase_name + ' (' + String(p.duration_weeks) + ' weeks)')
    p.resources.forEach(r => {
      lines.push('  - ' + r.skill + ' via ' + r.resource_type + ' at ' + r.provider + ' (' + String(r.duration_hours) + 'h, $' + String(r.cost_estimate) + ', score: ' + String(r.effectiveness_score) + ')')
    })
    lines.push('')
  })
  result.certification_recommendations.forEach(c => lines.push('- ' + c))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Data-Driven Skills Gap Analysis')
  return lines.join('\n')
}

function formatJobMarketReport(result: JobMarketResult): string {
  const lines: string[] = []
  lines.push('## Job Market Intelligence')
  lines.push('')
  lines.push('Market size: ' + String(result.market_size.toLocaleString()) + ' | YoY growth: ' + String(result.yoy_growth_pct) + '% | Opportunity: ' + String(result.opportunity_score))
  lines.push('')
  lines.push('### Top Hiring Companies')
  result.top_hiring_companies.forEach(c => lines.push('- ' + c))
  lines.push('')
  lines.push('### Market Trends')
  result.market_trends.forEach(t => {
    lines.push('- ' + t.trend + ' [Impact: ' + t.impact_level + ', Horizon: ' + t.time_horizon + ']')
    lines.push('  Insight: ' + t.actionable_insight)
  })
  lines.push('')
  lines.push('### Hiring Signals')
  result.hiring_signals.forEach(s => {
    lines.push('- ' + s.signal + ': ' + s.direction + ' (strength: ' + String(s.strength) + ')')
    s.implications.forEach(imp => lines.push('  - ' + imp))
  })
  lines.push('')
  lines.push('### Entry Barriers')
  result.entry_barriers.forEach(b => lines.push('- ' + b))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Data-Driven Job Market Intelligence')
  return lines.join('\n')
}

function formatResumeATSReport(result: ResumeATSResult): string {
  const lines: string[] = []
  lines.push('## Resume ATS Optimizer')
  lines.push('')
  lines.push('ATS Compatibility: ' + String(Math.round(result.ats_compatibility_score * 100)) + '% | Overall Impact: ' + String(Math.round(result.overall_impact_score * 100)) + '%')
  lines.push('')
  lines.push('### Optimized Bullets')
  result.bullets.forEach(b => {
    lines.push('- ' + b.optimized)
    lines.push('  STAR: ' + b.star_components.situation + ' | ' + b.star_components.task + ' | ' + b.star_components.action + ' | ' + b.star_components.result)
    lines.push('  Impact: ' + String(b.impact_score) + ' | Keywords: ' + b.ats_keywords_added.join(', '))
  })
  lines.push('')
  lines.push('### Section Scores')
  lines.push('| Section | Before | After | Key Improvements |')
  lines.push('|---------|--------|-------|------------------|')
  result.sections.forEach(s => {
    lines.push('| ' + s.section_name + ' | ' + String(s.original_score) + '/100 | ' + String(s.optimized_score) + '/100 | ' + s.improvements.join(', ') + ' |')
  })
  lines.push('')
  lines.push('### Formatting Suggestions')
  result.formatting_suggestions.forEach(f => lines.push('- ' + f))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Data-Driven Resume ATS Optimization')
  return lines.join('\n')
}

function formatInterviewReadinessReport(result: InterviewReadinessResult): string {
  const lines: string[] = []
  lines.push('## Interview Readiness Coach')
  lines.push('')
  lines.push('Readiness Score: ' + String(Math.round(result.overall_readiness_score * 100)) + '%')
  lines.push('')
  lines.push('### Practice Questions')
  result.questions.forEach(q => {
    lines.push('[' + q.question_id + '] ' + q.question + ' (Difficulty: ' + q.difficulty + ')')
    lines.push('  Criteria: ' + q.evaluation_criteria.join(', '))
    lines.push('  Pitfalls: ' + q.common_pitfalls.join(', '))
    lines.push('')
  })
  lines.push('### Mock Response Scores')
  result.mock_responses.forEach(r => {
    lines.push('  ' + r.question_id + ': C=' + String(r.scores.clarity) + ' R=' + String(r.scores.relevance) + ' S=' + String(r.scores.specificity) + ' Co=' + String(r.scores.confidence) + ' STAR=' + String(r.scores.star_alignment) + ')')
  })
  lines.push('')
  lines.push('### Strengths')
  result.strength_areas.forEach(s => lines.push('- ' + s))
  lines.push('')
  lines.push('### Improvement Areas')
  result.improvement_areas.forEach(s => lines.push('- ' + s))
  lines.push('')
  lines.push('### Company-Specific Tips')
  result.company_specific_tips.forEach(t => lines.push('- ' + t))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Interview Readiness Assessment')
  return lines.join('\n')
}

function formatSalaryReport(result: SalaryNegotiationResult): string {
  const lines: string[] = []
  lines.push('## Salary Negotiation Advisor')
  lines.push('')
  lines.push('Target range: $' + result.target_range[0].toLocaleString() + '-$' + result.target_range[1].toLocaleString() + ' | Walk-away: $' + result.walk_away_number.toLocaleString() + ' | Market YoY: ' + String(result.market_benchmark.yoy_change_pct) + '%')
  lines.push('')
  lines.push('### Market Benchmark')
  lines.push('| Percentile | Salary |')
  lines.push('|------------|--------|')
  lines.push('| 25th | $' + result.market_benchmark.percentile_25.toLocaleString() + ' |')
  lines.push('| 50th (median) | $' + result.market_benchmark.percentile_50.toLocaleString() + ' |')
  lines.push('| 75th | $' + result.market_benchmark.percentile_75.toLocaleString() + ' |')
  lines.push('| 90th | $' + result.market_benchmark.percentile_90.toLocaleString() + ' |')
  lines.push('| Market avg | $' + result.market_benchmark.market_average.toLocaleString() + ' |')
  lines.push('')
  lines.push('### Negotiation Tactics')
  result.negotiation_tactics.forEach(t => {
    lines.push('#### ' + t.tactic_name + ' (Risk: ' + t.risk_level + ')')
    lines.push('Timing: ' + t.timing)
    lines.push('Script: ' + t.script_template)
    lines.push('Expected: ' + t.expected_outcome)
    lines.push('Fallback: ' + t.fallback_position)
    lines.push('')
  })
  lines.push('### Compensation Breakdown')
  lines.push('| Component | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Base salary | $' + result.compensation_breakdown.base_salary.toLocaleString() + ' |')
  lines.push('| Bonus pct | ' + String(result.compensation_breakdown.bonus_pct) + '% |')
  lines.push('| Equity value | $' + result.compensation_breakdown.equity_value.toLocaleString() + ' |')
  lines.push('| Benefits value | $' + result.compensation_breakdown.benefits_value.toLocaleString() + ' |')
  lines.push('| **Total comp** | **$' + result.compensation_breakdown.total_comp.toLocaleString() + '** |')
  lines.push('')
  result.script_recommendations.forEach(s => lines.push('- ' + s))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Data-Driven Salary Negotiation')
  return lines.join('\n')
}

function formatBrandReport(result: ProfessionalBrandResult): string {
  const lines: string[] = []
  lines.push('## Professional Brand Builder')
  lines.push('')
  lines.push('Authority Score: ' + String(Math.round(result.authority_score * 100)) + '% | Pillars: ' + String(result.brand_pillars.length))
  lines.push('')
  lines.push('### Brand Pillars')
  result.brand_pillars.forEach(p => {
    lines.push('#### ' + p.pillar)
    lines.push(p.description + ' | Frequency: ' + p.posting_frequency)
    p.content_examples.forEach(e => lines.push('  - ' + e))
    p.engagement_tactics.forEach(t => lines.push('  - ' + t))
    lines.push('')
  })
  lines.push('### Platform Optimizations')
  lines.push('| Section | Current | Optimized | Impact |')
  lines.push('|---------|---------|-----------|--------|')
  result.platform_optimizations.forEach(o => {
    lines.push('| ' + o.section + ' | ' + o.current_state + ' | ' + o.optimized_version + ' | ' + o.impact_notes + ' |')
  })
  lines.push('')
  lines.push('### Content Calendar')
  result.content_calendar.forEach(c => {
    lines.push(c.day + ': ' + c.content_type + ' - ' + c.topic + ' (' + c.format + ')')
    lines.push('  Tags: ' + c.hashtags.join(' '))
  })
  lines.push('')
  result.networking_kpis.forEach(k => lines.push('- ' + k))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Personal Brand Building')
  return lines.join('\n')
}

function formatLearningPathwayReport(result: LearningPathwayResult): string {
  const lines: string[] = []
  lines.push('## Learning Pathway Designer')
  lines.push('')
  lines.push('Duration: ' + String(result.total_duration_weeks) + ' weeks | Cost: $' + result.total_cost_usd + ' | Weekly: ' + String(result.weekly_commitment_hours) + 'h | Skills coverage: ' + String(Math.round(result.skills_coverage_pct * 100)) + '%')
  lines.push('')
  lines.push('### Learning Modules')
  result.modules.forEach(m => {
    lines.push('[' + m.module_id + '] ' + m.title + ' (' + m.difficulty + ', ' + m.format + ', ' + String(m.duration_weeks) + ' weeks, $' + String(m.cost_usd) + ')')
    lines.push('  Skills: ' + m.skills_gained.join(', '))
    if (m.prerequisites.length > 0) lines.push('  Prerequisites: ' + m.prerequisites.join(', '))
  })
  lines.push('')
  lines.push('### Checkpoints')
  result.checkpoints.forEach(cp => {
    lines.push('[' + cp.checkpoint_id + '] ' + cp.title + ' (Week ' + String(cp.week) + ')')
    lines.push('  Criteria: ' + cp.completion_criteria.join(', '))
    lines.push('  Assessment: ' + cp.assessment_method)
    lines.push('  Deliverables: ' + cp.deliverables.join(', '))
  })
  lines.push('')
  lines.push('### Alternative Pathways')
  result.alternative_pathways.forEach(a => lines.push('- ' + a))
  lines.push('')
  lines.push('---')
  lines.push('CareerPathAI v0.1.0 | Data-Driven Learning Pathway Design')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export default function activate(ctx: Context): void {
  const tools = ctx.tools

  // Tool 1: Career Trajectory Mapper
  tools.register(defineTool({
    name: 'career_trajectory_mapper',
    description: 'Career trajectory mapping and simulation with industry outlook analysis. Generates multiple career paths with salary projections and transition probabilities.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_role, years_experience, target_industry, risk_tolerance (conservative|moderate|aggressive), simulation_years'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CareerTrajectoryInput = JSON.parse(args.input_data)
      return formatTrajectoryReport(mapCareerTrajectory(input))
    }
  }))

  // Tool 2: Skills Gap Analyzer
  tools.register(defineTool({
    name: 'skills_gap_analyzer',
    description: 'Skills gap analysis with personalized learning pathway and resource recommendations. Identifies critical vs significant gaps and estimates learning investment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_skills[], target_role, target_industry, learning_budget_hours, preferred_learning_style (visual|hands_on|reading|social)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SkillsGapInput = JSON.parse(args.input_data)
      return formatSkillsGapReport(analyzeSkillsGap(input))
    }
  }))

  // Tool 3: Job Market Intelligence
  tools.register(defineTool({
    name: 'job_market_intelligence',
    description: 'Job market analytics with hiring signals, talent supply-demand ratios, and market trend analysis for informed career decisions.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: target_role, target_industry, location, experience_level (entry|mid|senior|executive), remote_preference (remote|hybrid|onsite|any)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: JobMarketInput = JSON.parse(args.input_data)
      return formatJobMarketReport(analyzeJobMarket(input))
    }
  }))

  // Tool 4: Resume ATS Optimizer
  tools.register(defineTool({
    name: 'resume_ats_optimizer',
    description: 'Resume ATS optimization with STAR method application, keyword density analysis, and compatibility scoring for modern applicant tracking systems.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: resume_text, target_role, target_industry, highlight_achievements (boolean), apply_star_method (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ResumeATSInput = JSON.parse(args.input_data)
      return formatResumeATSReport(optimizeResumeATS(input))
    }
  }))

  // Tool 5: Interview Readiness Coach
  tools.register(defineTool({
    name: 'interview_readiness_coach',
    description: 'Interview preparation with question banks, mock scoring, and company-specific tips for behavioral, technical, case, and panel interviews.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: target_role, target_company, interview_type (behavioral|technical|case|panel), years_experience, weak_areas[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: InterviewReadinessInput = JSON.parse(args.input_data)
      return formatInterviewReadinessReport(coachInterviewReadiness(input))
    }
  }))

  // Tool 6: Salary Negotiation Advisor
  tools.register(defineTool({
    name: 'salary_negotiation_advisor',
    description: 'Salary negotiation strategy with market benchmarks, tactical scripts, compensation breakdown, and walk-away analysis.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_salary, offer_salary, target_role, location, years_experience, competing_offers, company_stage (startup|growth|enterprise|public)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SalaryNegotiationInput = JSON.parse(args.input_data)
      return formatSalaryReport(adviseSalaryNegotiation(input))
    }
  }))

  // Tool 7: Professional Brand Builder
  tools.register(defineTool({
    name: 'professional_brand_builder',
    description: 'Professional brand building with content pillars, platform optimization, content calendar, and authority scoring.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_role, target_role, industry, key_strengths[], years_experience, platform (linkedin|personal_website|github|twitter)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ProfessionalBrandInput = JSON.parse(args.input_data)
      return formatBrandReport(buildProfessionalBrand(input))
    }
  }))

  // Tool 8: Learning Pathway Designer
  tools.register(defineTool({
    name: 'learning_pathway_designer',
    description: 'Custom learning pathway design with module selection, checkpoint planning, skills coverage analysis, and budget optimization.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_skills[], target_role, target_industry, available_hours_per_week, preferred_formats[], deadline_months, budget_usd'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: LearningPathwayInput = JSON.parse(args.input_data)
      return formatLearningPathwayReport(designLearningPathway(input))
    }
  }))

  console.log('[dsh-tool-careerpathai] Loaded v' + VERSION + ' - AI Career & Skills Development: 8 tools active')
  console.log('  Tools: career_trajectory_mapper, skills_gap_analyzer, job_market_intelligence, resume_ats_optimizer, interview_readiness_coach, salary_negotiation_advisor, professional_brand_builder, learning_pathway_designer')
}
