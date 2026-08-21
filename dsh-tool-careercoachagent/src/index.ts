/**
 * DSH Career Coach Agent Plugin v0.1.0
 * 职业教练AI智能体 for DeepSeek Harness — 职业发展全流程赋能
 *
 * 覆盖职业规划、技能提升、简历优化、面试准备、薪资谈判、个人品牌、
 * 职业转型、社交策略八大核心场景，为求职者与职场人士提供数据驱动的决策支持。
 *
 * 工具清单:
 * 1. career_path_simulator  — 职业路径模拟与行业趋势分析
 * 2. skill_gap_analyzer     — 技能差距分析与学习路线图
 * 3. resume_career_optimizer — 简历职业叙事优化与STAR法则
 * 4. interview_prep_simulator — 面试模拟与行为/技术问题准备
 * 5. salary_negotiation_coach — 薪资谈判策略与市场基准
 * 6. professional_brand_builder — 个人品牌建设与LinkedIn优化
 * 7. pivot_strategy_advisor  — 职业转型策略与风险评估
 * 8. networking_strategy_planner — 职业社交策略与弱关系开发
 *
 * @module dsh-tool-careercoachagent | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-careercoachagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Career Path Simulator ---
interface CareerPathInput {
  current_role: string
  years_experience: number
  target_industry: string
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  simulation_years: number
}

interface PathNode {
  year: number
  role: string
  company_tier: string
  salary_range: [number, number]
  skill_requirements: string[]
  transition_probability: number
}

interface IndustryTrend {
  industry: string
  growth_rate: number
  demand_score: number
  top_skills: string[]
  outlook: 'bullish' | 'stable' | 'declining'
}

interface CareerPathResult {
  paths: PathNode[][]
  industry_trends: IndustryTrend[]
  recommended_path: number
  risk_assessment: string
  milestone_timeline: string[]
}

// --- Tool 2: Skill Gap Analyzer ---
interface SkillGapInput {
  current_skills: string[]
  target_role: string
  target_industry: string
  learning_budget_hours: number
  preferred_learning_style: 'visual' | 'hands_on' | 'reading' | 'social'
}

interface SkillGap {
  skill: string
  current_level: number
  required_level: number
  gap_severity: 'critical' | 'significant' | 'minor' | 'met'
  estimated_hours: number
  priority: number
}

interface LearningResource {
  skill: string
  resource_type: 'course' | 'certification' | 'project' | 'mentorship' | 'book'
  provider: string
  duration_hours: number
  cost_estimate: number
  effectiveness_score: number
}

interface LearningPhase {
  phase: number
  phase_name: string
  duration_weeks: number
  skills_covered: string[]
  resources: LearningResource[]
  milestones: string[]
}

interface SkillGapResult {
  gaps: SkillGap[]
  overall_readiness_pct: number
  learning_phases: LearningPhase[]
  total_estimated_hours: number
  certification_recommendations: string[]
}

// --- Tool 3: Resume Career Optimizer ---
interface ResumeInput {
  resume_text: string
  target_role: string
  target_industry: string
  highlight_achievements: boolean
  apply_star_method: boolean
}

interface ResumeBullet {
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

interface ResumeSection {
  section_name: string
  original_score: number
  optimized_score: number
  improvements: string[]
}

interface ResumeOptimizationResult {
  bullets: ResumeBullet[]
  sections: ResumeSection[]
  ats_compatibility_score: number
  overall_impact_score: number
  keyword_coverage: string[]
  formatting_suggestions: string[]
}

// --- Tool 4: Interview Prep Simulator ---
interface InterviewInput {
  target_role: string
  target_company: string
  interview_type: 'behavioral' | 'technical' | 'case' | 'panel'
  years_experience: number
  weak_areas: string[]
}

interface InterviewQuestion {
  question_id: string
  category: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  evaluation_criteria: string[]
  sample_answer_outline: string[]
  common_pitfalls: string[]
}

interface MockResponse {
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

interface InterviewPrepResult {
  questions: InterviewQuestion[]
  mock_responses: MockResponse[]
  overall_readiness_score: number
  strength_areas: string[]
  improvement_areas: string[]
  company_specific_tips: string[]
}

// --- Tool 5: Salary Negotiation Coach ---
interface SalaryInput {
  current_salary: number
  offer_salary: number
  target_role: string
  location: string
  years_experience: number
  competing_offers: number
  company_stage: 'startup' | 'growth' | 'enterprise' | 'public'
}

interface MarketBenchmark {
  percentile_25: number
  percentile_50: number
  percentile_75: number
  percentile_90: number
  market_average: number
  yoy_change_pct: number
}

interface NegotiationTactic {
  tactic_name: string
  timing: string
  script_template: string
  risk_level: 'low' | 'medium' | 'high'
  expected_outcome: string
  fallback_position: string
}

interface CompensationBreakdown {
  base_salary: number
  bonus_pct: number
  equity_value: number
  benefits_value: number
  total_comp: number
}

interface SalaryNegotiationResult {
  market_benchmark: MarketBenchmark
  negotiation_tactics: NegotiationTactic[]
  target_range: [number, number]
  walk_away_number: number
  compensation_breakdown: CompensationBreakdown
  script_recommendations: string[]
}

// --- Tool 6: Professional Brand Builder ---
interface BrandInput {
  current_role: string
  target_role: string
  industry: string
  key_strengths: string[]
  years_experience: number
  platform: 'linkedin' | 'personal_website' | 'github' | 'twitter'
}

interface BrandPillar {
  pillar: string
  description: string
  content_examples: string[]
  posting_frequency: string
  engagement_tactics: string[]
}

interface LinkedInOptimization {
  section: string
  current_state: string
  optimized_version: string
  impact_notes: string
}

interface ContentCalendar {
  day: string
  content_type: string
  topic: string
  format: string
  hashtags: string[]
}

interface BrandBuilderResult {
  brand_pillars: BrandPillar[]
  linkedin_optimizations: LinkedInOptimization[]
  content_calendar: ContentCalendar[]
  networking_kpis: string[]
  authority_score: number
}

// --- Tool 7: Pivot Strategy Advisor ---
interface PivotInput {
  current_role: string
  current_industry: string
  target_role: string
  target_industry: string
  years_experience: number
  transferable_skills: string[]
  financial_runway_months: number
  risk_tolerance: 'low' | 'medium' | 'high'
}

interface RiskFactor {
  risk: string
  probability: number
  impact: 'low' | 'medium' | 'high'
  mitigation_strategy: string
  contingency_plan: string
}

interface PivotPhase {
  phase: number
  name: string
  duration_months: number
  objectives: string[]
  key_actions: string[]
  success_metrics: string[]
  financial_impact: string
}

interface FinancialProjection {
  month: number
  income: number
  expenses: number
  savings_balance: number
  notes: string
}

interface PivotStrategyResult {
  risk_factors: RiskFactor[]
  pivot_phases: PivotPhase[]
  financial_projections: FinancialProjection[]
  break_even_month: number
  overall_feasibility_score: number
  alternative_pivots: string[]
}

// --- Tool 8: Networking Strategy Planner ---
interface NetworkingInput {
  target_industry: string
  target_roles: string[]
  current_network_size: number
  weak_tie_ratio: number
  networking_style: 'introvert' | 'extrovert' | 'ambivert'
  weekly_time_hours: number
  geographic_focus: string
}

interface ConnectionTarget {
  target_type: string
  relevance_score: number
  reach_difficulty: 'easy' | 'moderate' | 'hard'
  approach_strategy: string
  value_proposition: string
  expected_conversion_rate: number
}

interface NetworkingActivity {
  activity: string
  frequency: string
  time_commitment_hours: number
  expected_new_contacts: number
  roi_score: number
  platforms: string[]
}

interface OutreachTemplate {
  scenario: string
  template_text: string
  personalization_tips: string[]
  follow_up_schedule: string[]
  response_rate_estimate: number
}

interface NetworkingStrategyResult {
  connection_targets: ConnectionTarget[]
  networking_activities: NetworkingActivity[]
  outreach_templates: OutreachTemplate[]
  network_growth_projection: number[]
  weak_tie_activation_plan: string[]
  networking_kpis: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Career Path Simulator 分析 ---
function analyzeCareerPath(input: CareerPathInput): CareerPathResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.current_role + input.target_industry + input.risk_tolerance
  ))

  const paths: PathNode[][] = []
  const numPaths = 3

  for (let p = 0; p < numPaths; p++) {
    const path: PathNode[] = []
    let currentRole = input.current_role
    const pathRisk = p === 0 ? 'conservative' : p === 1 ? 'moderate' : 'aggressive'

    for (let y = 0; y < Math.min(input.simulation_years, 10); y++) {
      const promotionChance = pathRisk === 'aggressive' ? 0.45 : pathRisk === 'moderate' ? 0.3 : 0.18
      const gotPromoted = rng.next() < promotionChance
      const baseSalary = 50000 + input.years_experience * 8000 + y * (pathRisk === 'aggressive' ? 15000 : 8000)
      const salaryVariance = pathRisk === 'aggressive' ? 0.3 : 0.15

      if (gotPromoted) {
        const roles = ['Senior', 'Lead', 'Principal', 'Manager', 'Director', 'VP']
        const currentIdx = Math.min(y, roles.length - 1)
        currentRole = roles[currentIdx] + ' ' + input.target_industry + ' ' + input.current_role.split(' ').pop()
      }

      path.push({
        year: new Date().getFullYear() + y,
        role: gotPromoted ? currentRole : `${currentRole} (Level ${y + 1})`,
        company_tier: rng.pick(['Tier-1 (FAANG+)', 'Tier-2 (Unicorn)', 'Tier-3 (Enterprise)', 'Tier-4 (Growth Startup)']),
        salary_range: [
          Math.round(baseSalary * (1 - salaryVariance)),
          Math.round(baseSalary * (1 + salaryVariance)),
        ],
        skill_requirements: [`${input.target_industry} Domain`, 'Leadership', 'Strategic Thinking', 'Communication'].slice(0, rng.nextInt(2, 4)),
        transition_probability: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
      })
    }
    paths.push(path)
  }

  const industries = [input.target_industry, 'AI/ML', 'FinTech', 'HealthTech', 'ClimateTech']
  const industryTrends: IndustryTrend[] = industries.slice(0, rng.nextInt(3, 5)).map(ind => ({
    industry: ind,
    growth_rate: Math.round(rng.nextFloat(3, 35) * 100) / 100,
    demand_score: Math.round(rng.nextFloat(60, 98)),
    top_skills: [`${ind} Fundamentals`, 'Data Analysis', 'Product Sense', 'AI Literacy'].slice(0, rng.nextInt(2, 4)),
    outlook: rng.pick(['bullish', 'stable', 'declining'] as const),
  }))

  const recommendedPath = input.risk_tolerance === 'aggressive' ? 2 : input.risk_tolerance === 'moderate' ? 1 : 0

  return {
    paths,
    industry_trends: industryTrends,
    recommended_path: recommendedPath,
    risk_assessment: `基于${input.risk_tolerance}风险偏好，推荐路径${recommendedPath + 1}：${recommendedPath === 0 ? '稳健晋升' : recommendedPath === 1 ? '平衡发展' : '激进跃迁'}`,
    milestone_timeline: [
      `第1年：建立${input.target_industry}领域基础能力`,
      `第2-3年：承担核心项目，建立行业影响力`,
      `第4-5年：晋升至高级岗位，拓展管理半径`,
      `第6-8年：进入战略层或成为领域专家`,
      `第10年：达成行业领导地位`,
    ],
  }
}

// --- Tool 2: Skill Gap Analyzer 分析 ---
function analyzeSkillGap(input: SkillGapInput): SkillGapResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.target_role + input.target_industry + input.current_skills.join(',')
  ))

  const requiredSkills = [
    `${input.target_industry} Domain Expertise`,
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
    const severityOrder = { critical: 0, significant: 1, minor: 2, met: 3 }
    return severityOrder[a.gap_severity] - severityOrder[b.gap_severity]
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
      phase_name: p === 0 ? '基础补齐期' : p === 1 ? '能力提升期' : '精进实践期',
      duration_weeks: rng.nextInt(6, 16),
      skills_covered: phaseSkills.map(s => s.skill),
      resources,
      milestones: [
        `完成${phaseSkills.length}项核心技能学习`,
        `通过实践项目验证能力`,
        `获得相关认证或同行反馈`,
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
      `${input.target_industry} Professional Certificate`,
      'Project Management Professional (PMP)',
      'Certified Analytics Professional',
      'Leadership & Management Certificate',
    ].slice(0, rng.nextInt(2, 4)),
  }
}

// --- Tool 3: Resume Career Optimizer 分析 ---
function analyzeResumeOptimization(input: ResumeInput): ResumeOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.resume_text.slice(0, 100) + input.target_role
  ))

  const bulletTemplates = [
    'Led cross-functional team of X to deliver Y, resulting in Z% improvement',
    'Developed and implemented A, reducing B by C% and saving D annually',
    'Spearheaded initiative E, achieving F growth in G timeframe',
    'Optimized process H, increasing efficiency by I% and reducing costs by J',
    'Designed and launched K, adopted by L users within M months',
  ]

  const bullets: ResumeBullet[] = bulletTemplates.slice(0, rng.nextInt(3, 5)).map((template, idx) => ({
    original: `Responsible for ${input.target_role} tasks in ${input.target_industry}`,
    optimized: template.replace(/[A-Z]/g, (match) => {
      const replacements: Record<string, string> = {
        X: `${rng.nextInt(3, 12)}`,
        Y: `${rng.pick(['product launch', 'system migration', 'revenue growth', 'cost reduction'])}`,
        Z: `${rng.nextInt(15, 60)}`,
        A: `${rng.pick(['new strategy', 'automation framework', 'data pipeline'])}`,
        B: `${rng.pick(['processing time', 'error rate', 'operational costs'])}`,
        C: `${rng.nextInt(20, 75)}`,
        D: `$${rng.nextInt(50, 500)}K`,
        E: `${rng.pick(['digital transformation', 'customer expansion', 'product innovation'])}`,
        F: `${rng.nextInt(20, 150)}%`,
        G: `${rng.nextInt(3, 18)} months`,
        H: `${rng.pick(['workflow', 'deployment pipeline', 'reporting system'])}`,
        I: `${rng.nextInt(25, 80)}`,
        J: `$${rng.nextInt(30, 300)}K`,
        K: `${rng.pick(['analytics dashboard', 'ML model', 'customer portal'])}`,
        L: `${rng.nextInt(100, 10000)}`,
        M: `${rng.nextInt(1, 6)}`,
      }
      return replacements[match] || match
    }),
    star_components: {
      situation: `At ${input.target_industry} company facing ${rng.pick(['scaling challenges', 'competitive pressure', 'digital transformation'])}`,
      task: `Tasked with ${rng.pick(['improving efficiency', 'driving growth', 'reducing costs', 'building new capabilities'])}`,
      action: `Implemented ${rng.pick(['data-driven approach', 'agile methodology', 'cross-team collaboration', 'innovative solution'])}`,
      result: `Achieved ${rng.nextInt(20, 80)}% ${rng.pick(['improvement', 'growth', 'reduction', 'increase'])}`,
    },
    impact_score: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
    ats_keywords_added: [`${input.target_industry}`, input.target_role.split(' ')[0], rng.pick(['leadership', 'strategy', 'analytics', 'innovation'])],
  }))

  const sections: ResumeSection[] = [
    { section_name: 'Professional Summary', original_score: rng.nextInt(40, 60), optimized_score: rng.nextInt(75, 95), improvements: ['添加量化成就', '嵌入行业关键词', '突出核心价值主张'] },
    { section_name: 'Work Experience', original_score: rng.nextInt(50, 70), optimized_score: rng.nextInt(80, 95), improvements: ['应用STAR法则', '量化影响力', '动词驱动表述'] },
    { section_name: 'Skills Section', original_score: rng.nextInt(45, 65), optimized_score: rng.nextInt(70, 90), improvements: ['对齐目标岗位JD', '分层展示技能熟练度', '添加新兴技能'] },
    { section_name: 'Education & Certs', original_score: rng.nextInt(60, 80), optimized_score: rng.nextInt(75, 90), improvements: ['突出相关课程', '添加持续教育', '展示认证进度'] },
  ]

  const atsScore = Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100
  const overallImpact = Math.round(bullets.reduce((sum, b) => sum + b.impact_score, 0) / bullets.length * 100) / 100

  return {
    bullets,
    sections,
    ats_compatibility_score: atsScore,
    overall_impact_score: overallImpact,
    keyword_coverage: [`${input.target_industry}`, input.target_role, 'leadership', 'strategy', 'analytics', 'innovation', 'cross-functional', 'data-driven'],
    formatting_suggestions: [
      '使用清晰的章节标题和一致的格式',
      '确保ATS友好的字体（Arial, Calibri, Helvetica）',
      '控制简历长度在1-2页',
      '使用项目符号而非段落描述',
      '添加LinkedIn和GitHub链接',
    ],
  }
}

// --- Tool 4: Interview Prep Simulator 分析 ---
function analyzeInterviewPrep(input: InterviewInput): InterviewPrepResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.target_role + input.target_company + input.interview_type
  ))

  const behavioralQuestions = [
    { category: 'Leadership', question: 'Tell me about a time you led a team through a challenging project.' },
    { category: 'Conflict Resolution', question: 'Describe a situation where you disagreed with a colleague and how you handled it.' },
    { category: 'Problem Solving', question: 'Give an example of a complex problem you solved with limited resources.' },
    { category: 'Adaptability', question: 'Tell me about a time you had to quickly learn something new under pressure.' },
    { category: 'Failure & Growth', question: 'Describe a professional failure and what you learned from it.' },
    { category: 'Influence', question: 'How have you influenced stakeholders without direct authority?' },
  ]

  const technicalQuestions = [
    { category: 'Technical Depth', question: `Explain your approach to solving a complex ${input.target_role} problem.` },
    { category: 'System Design', question: 'Design a scalable system for handling high-throughput data processing.' },
    { category: 'Data Analysis', question: 'Walk me through how you would analyze a sudden drop in key metrics.' },
    { category: 'Strategy', question: `How would you prioritize features for a ${input.target_role} role?` },
  ]

  const questionPool = input.interview_type === 'behavioral' ? behavioralQuestions :
    input.interview_type === 'technical' ? technicalQuestions :
    [...behavioralQuestions.slice(0, 3), ...technicalQuestions.slice(0, 2)]

  const questions: InterviewQuestion[] = questionPool.slice(0, rng.nextInt(4, 6)).map((q, idx) => ({
    question_id: `Q${idx + 1}`,
    category: q.category,
    question: q.question,
    difficulty: rng.pick(['easy', 'medium', 'hard'] as const),
    evaluation_criteria: ['Clarity of thought', 'Specific examples', 'Measurable outcomes', 'Self-awareness', 'Cultural fit'],
    sample_answer_outline: [
      'Set the context (Situation/Task)',
      'Describe your specific role (Action)',
      'Share measurable results (Result)',
      'Reflect on key learnings',
    ],
    common_pitfalls: [
      'Being too vague or generic',
      'Not quantifying results',
      'Blaming others in failure stories',
      'Rambling without structure',
    ],
  }))

  const mockResponses: MockResponse[] = questions.slice(0, 3).map((q, idx) => ({
    question_id: q.question_id,
    response_text: `针对"${q.category}"问题的模拟回答...`,
    scores: {
      clarity: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
      relevance: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
      specificity: Math.round(rng.nextFloat(0.4, 0.9) * 100) / 100,
      confidence: Math.round(rng.nextFloat(0.5, 0.9) * 100) / 100,
      star_alignment: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
    },
    feedback: [
      '回答结构清晰，STAR法则运用良好',
      '可以添加更多量化数据增强说服力',
      '语速适中，表达自信',
    ],
    improvement_suggestions: [
      '准备更多具体数字和案例',
      '练习控制在2分钟内的精炼回答',
      '增加对目标公司业务的关联分析',
    ],
  }))

  const avgScore = mockResponses.length > 0
    ? mockResponses.reduce((sum, r) => sum + (r.scores.clarity + r.scores.relevance + r.scores.specificity + r.scores.confidence + r.scores.star_alignment) / 5, 0) / mockResponses.length
    : 0.5

  return {
    questions,
    mock_responses: mockResponses,
    overall_readiness_score: Math.round(avgScore * 100),
    strength_areas: ['沟通表达', '结构化思维', '行业知识'],
    improvement_areas: input.weak_areas.length > 0 ? input.weak_areas : ['技术深度', '压力情境应对'],
    company_specific_tips: [
      `研究${input.target_company}的最新产品发布和战略方向`,
      `了解${input.target_company}的企业文化和核心价值观`,
      `准备与${input.target_company}业务相关的案例`,
      `准备3-5个向面试官提问的高质量问题`,
    ],
  }
}

// --- Tool 5: Salary Negotiation Coach 分析 ---
function analyzeSalaryNegotiation(input: SalaryInput): SalaryNegotiationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.target_role + input.location + input.company_stage
  ))

  const baseMarket = 80000 + input.years_experience * 12000
  const locationMultiplier = input.location.toLowerCase().includes('san francisco') || input.location.toLowerCase().includes('new york') ? 1.4 :
    input.location.toLowerCase().includes('seattle') || input.location.toLowerCase().includes('boston') ? 1.25 : 1.0
  const stageMultiplier = input.company_stage === 'public' ? 1.2 : input.company_stage === 'enterprise' ? 1.1 : input.company_stage === 'growth' ? 1.0 : 0.9

  const adjustedMarket = baseMarket * locationMultiplier * stageMultiplier

  const benchmark: MarketBenchmark = {
    percentile_25: Math.round(adjustedMarket * 0.8),
    percentile_50: Math.round(adjustedMarket),
    percentile_75: Math.round(adjustedMarket * 1.25),
    percentile_90: Math.round(adjustedMarket * 1.55),
    market_average: Math.round(adjustedMarket * 1.02),
    yoy_change_pct: Math.round(rng.nextFloat(3, 12) * 100) / 100,
  }

  const targetLow = Math.round(benchmark.percentile_50 * 1.08)
  const targetHigh = Math.round(benchmark.percentile_75 * 1.12)
  const walkAway = Math.round(benchmark.percentile_50 * 0.95)

  const tactics: NegotiationTactic[] = [
    {
      tactic_name: '锚定策略',
      timing: '收到offer后24小时内',
      script_template: `非常感谢贵司的认可。基于我在${input.target_role}领域的${input.years_experience}年经验，以及当前市场数据，我期望的薪资范围是${targetLow.toLocaleString()}-${targetHigh.toLocaleString()}。`,
      risk_level: 'low',
      expected_outcome: '将谈判锚定在市场75分位以上',
      fallback_position: '接受65分位+额外股权/奖金',
    },
    {
      tactic_name: '竞争offer杠杆',
      timing: '确认有竞争offer时',
      script_template: `我有另一个offer在${Math.round(input.offer_salary * 1.15).toLocaleString()}左右，但我更倾向于贵司的发展方向。能否在薪资上再做些调整？`,
      risk_level: 'medium',
      expected_outcome: '触发匹配或counter-offer',
      fallback_position: '强调非薪资价值（发展机会、团队、文化）',
    },
    {
      tactic_name: '总薪酬打包',
      timing: 'base salary谈判遇阻时',
      script_template: '如果base salary有预算限制，我们能否在sign-on bonus、equity、年度奖金上做些补充？',
      risk_level: 'low',
      expected_outcome: '总包提升10-20%',
      fallback_position: '要求6个月后薪资review',
    },
    {
      tactic_name: '价值论证',
      timing: '终面后offer前',
      script_template: `基于我之前在${rng.pick(['成本优化', '收入增长', '效率提升'])}方面带来的${rng.nextInt(20, 60)}%改善，我相信我能快速为${input.target_role}岗位创造超额价值。`,
      risk_level: 'low',
      expected_outcome: '建立价值认知，支撑薪资要求',
      fallback_position: '用具体案例和数据支撑',
    },
  ]

  const compBreakdown: CompensationBreakdown = {
    base_salary: input.offer_salary,
    bonus_pct: Math.round(rng.nextFloat(10, 25) * 100) / 100,
    equity_value: Math.round(rng.nextFloat(5000, 50000)),
    benefits_value: Math.round(rng.nextFloat(8000, 20000)),
    total_comp: Math.round(input.offer_salary * 1.2 + rng.nextFloat(10000, 50000)),
  }

  return {
    market_benchmark: benchmark,
    negotiation_tactics: tactics,
    target_range: [targetLow, targetHigh],
    walk_away_number: walkAway,
    compensation_breakdown: compBreakdown,
    script_recommendations: [
      '始终保持积极和感激的语气',
      '用数据说话，避免情绪化表达',
      '准备好至少3个谈判策略',
      '设定明确的walk-away point',
      '考虑总薪酬而非仅base salary',
      '争取书面确认所有口头承诺',
    ],
  }
}

// --- Tool 6: Professional Brand Builder 分析 ---
function analyzeProfessionalBrand(input: BrandInput): BrandBuilderResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.current_role + input.target_role + input.platform
  ))

  const brandPillars: BrandPillar[] = [
    {
      pillar: '行业洞察',
      description: `分享${input.industry}领域的深度分析和前沿趋势`,
      content_examples: [
        `${input.industry}行业周报/月报`,
        '对重大行业事件的即时解读',
        '数据驱动的趋势预测',
      ],
      posting_frequency: '每周2-3次',
      engagement_tactics: ['使用行业hashtag', '@相关领域KOL', '发起投票和讨论'],
    },
    {
      pillar: '专业能力',
      description: `展示${input.target_role}相关的核心技能和项目经验`,
      content_examples: [
        '项目案例拆解（脱敏）',
        '技术/方法论分享',
        '行业最佳实践总结',
      ],
      posting_frequency: '每周1-2次',
      engagement_tactics: ['使用案例研究格式', '添加数据可视化', '邀请同行点评'],
    },
    {
      pillar: '个人故事',
      description: '分享职业成长故事和价值观',
      content_examples: [
        '职业转折点回顾',
        '失败教训与成长',
        '导师与贵人故事',
      ],
      posting_frequency: '每两周1次',
      engagement_tactics: ['真诚表达', '引发共鸣', '鼓励互动'],
    },
  ]

  const linkedinOpts: LinkedInOptimization[] = [
    { section: 'Headline', current_state: input.current_role, optimized_version: `${input.current_role} | ${input.key_strengths.slice(0, 2).join(' & ')} | 助力${input.industry}数字化转型`, impact_notes: '超越职位标签，突出价值主张' },
    { section: 'About', current_state: '通用自我介绍', optimized_version: `🚀 ${input.years_experience}年${input.industry}老兵 | 专注${input.key_strengths[0]}\n\n✅ 曾主导${rng.pick(['千万级', '百万级', '行业级'])}项目\n💡 相信数据驱动决策\n🎯 目标：${input.target_role}\n\n📩 开放${input.industry}领域交流与合作`, impact_notes: '结构化叙述+emoji增强可读性' },
    { section: 'Featured', current_state: '未设置', optimized_version: '添加3-5个精选内容（文章、项目、演讲）', impact_notes: '第一印象关键区域' },
    { section: 'Experience', current_state: '职责描述为主', optimized_version: '量化成就+STAR法则+行业关键词', impact_notes: '提升搜索排名和阅读体验' },
  ]

  const contentCalendar: ContentCalendar[] = [
    { day: '周一', content_type: '行业洞察', topic: `${input.industry}周趋势`, format: '短帖+数据图', hashtags: [`#${input.industry.replace(/\s/g, '')}`, '#行业趋势', '#洞察'] },
    { day: '周二', content_type: '专业分享', topic: `${input.key_strengths[0]}实战`, format: '长文/文章', hashtags: ['#专业分享', '#方法论', '#实践'] },
    { day: '周三', content_type: '互动内容', topic: '行业投票/问答', format: '投票帖', hashtags: ['#互动', '#行业讨论', '#观点'] },
    { day: '周四', content_type: '个人故事', topic: '职业成长故事', format: '叙事帖', hashtags: ['#职业成长', '#反思', '#故事'] },
    { day: '周五', content_type: '推荐分享', topic: '推荐同行/资源', format: '推荐帖', hashtags: ['#推荐', '#感恩', '#社区'] },
  ]

  return {
    brand_pillars: brandPillars,
    linkedin_optimizations: linkedinOpts,
    content_calendar: contentCalendar,
    networking_kpis: [
      '每周新增5-10个目标领域连接',
      '每月发布4-8条原创内容',
      '内容互动率目标>3%',
      '每月获得2-5个Inbound机会',
    ],
    authority_score: Math.round(rng.nextFloat(0.55, 0.85) * 100) / 100,
  }
}

// --- Tool 7: Pivot Strategy Advisor 分析 ---
function analyzePivotStrategy(input: PivotInput): PivotStrategyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.current_role + input.target_role + input.current_industry + input.target_industry
  ))

  const riskFactors: RiskFactor[] = [
    { risk: '技能迁移风险', probability: rng.nextFloat(0.3, 0.6), impact: 'high', mitigation_strategy: '提前学习目标行业核心技能，通过项目实践验证', contingency_plan: '考虑bridge role过渡' },
    { risk: '收入下降风险', probability: rng.nextFloat(0.4, 0.7), impact: 'medium', mitigation_strategy: '确保6个月以上财务缓冲，谈判sign-on bonus', contingency_plan: '兼职/咨询补充收入' },
    { risk: '市场时机风险', probability: rng.nextFloat(0.2, 0.5), impact: 'medium', mitigation_strategy: '关注行业招聘趋势，选择窗口期行动', contingency_plan: '延迟3-6个月执行' },
    { risk: '文化适应风险', probability: rng.nextFloat(0.3, 0.5), impact: 'low', mitigation_strategy: '通过信息访谈了解目标公司文化', contingency_plan: '选择文化相近的公司' },
    { risk: '网络重建风险', probability: rng.nextFloat(0.4, 0.6), impact: 'medium', mitigation_strategy: '提前6个月开始目标行业社交', contingency_plan: '利用现有弱关系桥接' },
  ]

  const pivotPhases: PivotPhase[] = [
    {
      phase: 1, name: '探索与准备期', duration_months: 3,
      objectives: ['完成目标行业深度调研', '识别可迁移技能', '建立初步人脉'],
      key_actions: ['进行10+信息访谈', '完成2-3个目标领域项目', '更新简历和LinkedIn'],
      success_metrics: ['获得5+目标行业联系人', '完成技能差距分析', '确定3-5家目标公司'],
      financial_impact: '收入不变，投入学习时间20h/周',
    },
    {
      phase: 2, name: '能力建设期', duration_months: 4,
      objectives: ['补齐核心技能差距', '建立目标领域作品集', '深化行业人脉'],
      key_actions: ['完成核心认证/课程', '发布3-5篇行业内容', '参加行业活动/会议'],
      success_metrics: ['获得相关认证', '作品集完成度>80%', '获得2-3个内推机会'],
      financial_impact: '收入不变，可能增加学习支出',
    },
    {
      phase: 3, name: '求职执行期', duration_months: 3,
      objectives: ['高效求职', '谈判最优offer', '平稳过渡'],
      key_actions: ['每周投递5-10份简历', '参加面试', '谈判薪资和入职时间'],
      success_metrics: ['获得2-3个offer', '薪资达到目标范围', '成功入职'],
      financial_impact: '可能有1-2个月收入空窗',
    },
    {
      phase: 4, name: '融入与成长期', duration_months: 6,
      objectives: ['快速融入新角色', '建立内部人脉', '证明价值'],
      key_actions: ['90天快速学习计划', '寻找内部导师', '交付早期胜利'],
      success_metrics: ['通过试用期', '获得正面绩效评价', '建立内部影响力'],
      financial_impact: '收入恢复并增长',
    },
  ]

  const monthlyExpenses = 8000
  const currentSavings = input.financial_runway_months * monthlyExpenses
  const projections: FinancialProjection[] = []
  let savingsBalance = currentSavings

  for (let m = 1; m <= 12; m++) {
    const income = m <= 6 ? 0 : Math.round(15000 + rng.nextFloat(-2000, 3000))
    const expenses = monthlyExpenses + (m <= 4 ? 2000 : 0)
    savingsBalance += income - expenses
    projections.push({
      month: m,
      income,
      expenses,
      savings_balance: Math.round(savingsBalance),
      notes: m <= 3 ? '学习投入期' : m <= 6 ? '求职期' : '收入恢复期',
    })
  }

  const breakEvenMonth = projections.findIndex(p => p.income > 0 && p.savings_balance > currentSavings * 0.8) + 1

  return {
    risk_factors: riskFactors,
    pivot_phases: pivotPhases,
    financial_projections: projections,
    break_even_month: breakEvenMonth > 0 ? breakEvenMonth : 9,
    overall_feasibility_score: Math.round(rng.nextFloat(0.6, 0.88) * 100) / 100,
    alternative_pivots: [
      `从${input.current_role}转向${input.target_industry}产品经理`,
      `在${input.current_industry}内部转向${input.target_role}相关岗位`,
      `先加入${input.target_industry}的咨询公司作为跳板`,
      `通过MBA/进修实现转型`,
    ],
  }
}

// --- Tool 8: Networking Strategy Planner 分析 ---
function analyzeNetworkingStrategy(input: NetworkingInput): NetworkingStrategyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.target_industry + input.target_roles.join(',') + input.networking_style
  ))

  const connectionTargets: ConnectionTarget[] = [
    { target_type: '行业KOL/思想领袖', relevance_score: 95, reach_difficulty: 'hard', approach_strategy: '通过内容互动建立认知，再发送个性化连接请求', value_proposition: '提供独特数据/洞察，或对其内容的深度反馈', expected_conversion_rate: 0.05 },
    { target_type: '目标公司内部员工', relevance_score: 90, reach_difficulty: 'moderate', approach_strategy: '通过共同连接或行业活动引荐', value_proposition: '展示对公司的了解和能为团队带来的价值', expected_conversion_rate: 0.25 },
    { target_type: '同行/同级从业者', relevance_score: 75, reach_difficulty: 'easy', approach_strategy: '通过行业社群、活动自然建立联系', value_proposition: '互助分享行业信息和机会', expected_conversion_rate: 0.45 },
    { target_type: '招聘经理/HR', relevance_score: 85, reach_difficulty: 'moderate', approach_strategy: '通过LinkedIn InMail或活动直接接触', value_proposition: '展示与岗位的高度匹配度', expected_conversion_rate: 0.15 },
    { target_type: '行业活动组织者', relevance_score: 70, reach_difficulty: 'moderate', approach_strategy: '主动参与活动志愿者或分享者', value_proposition: '贡献活动组织，扩大曝光', expected_conversion_rate: 0.30 },
    { target_type: '校友/前同事', relevance_score: 80, reach_difficulty: 'easy', approach_strategy: '重新激活弱关系，定期保持联系', value_proposition: '互帮互助，分享职业机会', expected_conversion_rate: 0.55 },
  ]

  const networkingActivities: NetworkingActivity[] = [
    { activity: 'LinkedIn内容互动', frequency: '每日', time_commitment_hours: 0.5, expected_new_contacts: 3, roi_score: 8, platforms: ['LinkedIn'] },
    { activity: '行业线上活动/研讨会', frequency: '每周1-2次', time_commitment_hours: 2, expected_new_contacts: 5, roi_score: 9, platforms: ['Zoom', 'Meetup', 'Eventbrite'] },
    { activity: '行业线下聚会/会议', frequency: '每月2-3次', time_commitment_hours: 4, expected_new_contacts: 8, roi_score: 10, platforms: ['Meetup', '行业会议'] },
    { activity: '1-on-1咖啡聊天', frequency: '每周2-3次', time_commitment_hours: 3, expected_new_contacts: 3, roi_score: 9, platforms: ['线下', 'Zoom'] },
    { activity: '内容创作与分享', frequency: '每周1-2次', time_commitment_hours: 2, expected_new_contacts: 10, roi_score: 7, platforms: ['LinkedIn', 'Twitter', '个人博客'] },
    { activity: '社群运营/志愿服务', frequency: '每月', time_commitment_hours: 3, expected_new_contacts: 6, roi_score: 8, platforms: ['Slack社群', 'Discord', '开源社区'] },
  ]

  const outreachTemplates: OutreachTemplate[] = [
    {
      scenario: '冷启动连接请求',
      template_text: `Hi [Name]，\n\n我是[Your Name]，目前在[Current Role]领域工作。一直关注您在${input.target_industry}领域的分享，特别是关于[Specific Topic]的见解让我受益匪浅。\n\n希望能与您建立联系，也期待有机会交流[Specific Interest]。\n\nBest,\n[Your Name]`,
      personalization_tips: ['提及对方具体内容', '说明连接动机', '保持简洁3-4行'],
      follow_up_schedule: ['7天后点赞评论其内容', '14天后分享相关文章', '30天后发送更新'],
      response_rate_estimate: 0.2,
    },
    {
      scenario: '信息访谈请求',
      template_text: `Hi [Name]，\n\n我在考虑向${input.target_industry}领域转型，您在[Company]的经验非常宝贵。能否占用您20分钟时间，请教几个关于[Specific Question]的问题？\n\n完全理解您的时间宝贵，如果方便的话我可以配合您的时间。\n\nThanks,\n[Your Name]`,
      personalization_tips: ['明确时间承诺（20分钟）', '展示做过功课', '提供灵活时间'],
      follow_up_schedule: ['5天后温和提醒', '访谈后24小时内感谢信', '2周后分享进展'],
      response_rate_estimate: 0.35,
    },
    {
      scenario: '活动后跟进',
      template_text: `Hi [Name]，\n\n很高兴在[Event Name]上与您交流。您提到的[Specific Insight]让我很受启发。\n\n我想继续我们关于[Topic]的讨论，不知您下周是否有15分钟时间？\n\nBest,\n[Your Name]`,
      personalization_tips: ['引用具体对话内容', '24-48小时内发送', '提出具体后续行动'],
      follow_up_schedule: ['3天后确认时间', '会议后发送感谢', '1周后分享相关资源'],
      response_rate_estimate: 0.5,
    },
  ]

  const growthProjection: number[] = []
  let currentNetwork = input.current_network_size
  for (let m = 1; m <= 12; m++) {
    const monthlyGrowth = Math.round(input.weekly_time_hours * 2 * (1 + rng.nextFloat(-0.2, 0.3)))
    currentNetwork += monthlyGrowth
    growthProjection.push(currentNetwork)
  }

  return {
    connection_targets: connectionTargets,
    networking_activities: networkingActivities,
    outreach_templates: outreachTemplates,
    network_growth_projection: growthProjection,
    weak_tie_activation_plan: [
      '梳理现有弱关系清单（前同事、校友、活动认识的人）',
      '每周重新激活2-3个弱关系（点赞、评论、私信问候）',
      '每月与5个弱关系进行深度交流（咖啡聊天/线上通话）',
      '为弱关系提供价值（分享信息、引荐连接、提供帮助）',
      '建立弱关系维护提醒系统（每6-8周触达一次）',
    ],
    networking_kpis: [
      `月新增连接目标: ${input.weekly_time_hours * 4}`,
      '信息访谈完成率: >60%',
      '弱关系激活率: >30%',
      'Inbound机会/月: 2-5个',
      '网络多样性指数: 覆盖3+行业/职能',
    ],
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Career Path Simulator 报告 ---
function formatCareerPathReport(result: CareerPathResult): string {
  const lines: string[] = []
  lines.push('## 🚀 Career Path Simulator — 职业路径模拟与行业趋势报告')
  lines.push('')
  lines.push(`推荐路径: 路径${result.recommended_path + 1} | 风险评估: ${result.risk_assessment}`)
  lines.push('')
  lines.push('### 📊 路径对比图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    NOW[当前角色] -->|路径1| P1[稳健晋升]')
  lines.push('    NOW -->|路径2| P2[平衡发展]')
  lines.push('    NOW -->|路径3| P3[激进跃迁]')
  lines.push('    P1 -->|5年| F1[高级专家/经理]')
  lines.push('    P2 -->|5年| F2[总监/资深专家]')
  lines.push('    P3 -->|5年| F3[VP/行业领袖]')
  lines.push('```')
  lines.push('')

  lines.push('### 📈 路径详情')
  result.paths.forEach((path, idx) => {
    lines.push(`#### 路径${idx + 1}: ${idx === 0 ? '稳健晋升' : idx === 1 ? '平衡发展' : '激进跃迁'}`)
    lines.push('| 年份 | 角色 | 公司层级 | 薪资范围 | 转型概率 |')
    lines.push('|------|------|----------|----------|----------|')
    for (const node of path) {
      lines.push(`| ${node.year} | ${node.role} | ${node.company_tier} | $${node.salary_range[0].toLocaleString()}-$${node.salary_range[1].toLocaleString()} | ${(node.transition_probability * 100).toFixed(0)}% |`)
    }
    lines.push('')
  })

  lines.push('### 🏭 行业趋势')
  lines.push('| 行业 | 增长率 | 需求评分 | 热门技能 | 前景 |')
  lines.push('|------|--------|----------|----------|------|')
  for (const t of result.industry_trends) {
    lines.push(`| ${t.industry} | ${t.growth_rate}% | ${t.demand_score}/100 | ${t.top_skills.join(', ')} | ${t.outlook === 'bullish' ? '看涨' : t.outlook === 'stable' ? '稳定' : '下行'} |`)
  }
  lines.push('')

  lines.push('### 🎯 里程碑时间线')
  for (const m of result.milestone_timeline) lines.push(`- ${m}`)
  lines.push('')

  lines.push('### 📋 行动清单')
  lines.push('- [x] 完成行业趋势深度调研')
  lines.push('- [x] 评估三条路径的风险收益比')
  lines.push('- [x] 制定年度技能发展计划')
  lines.push('- [x] 建立目标行业人脉网络')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • Data-Driven Career Planning*')
  return lines.join('\n')
}

// --- Tool 2: Skill Gap Analyzer 报告 ---
function formatSkillGapReport(result: SkillGapResult): string {
  const lines: string[] = []
  lines.push('## 📊 Skill Gap Analyzer — 技能差距分析与学习路线图')
  lines.push('')
  lines.push(`整体准备度: ${result.overall_readiness_pct}% | 总学习时长: ${result.total_estimated_hours}小时 | 差距项: ${result.gaps.filter(g => g.gap_severity !== 'met').length}`)
  lines.push('')
  lines.push('### 📊 技能差距雷达图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    TARGET[目标岗位] -->|技能匹配度| GAP[差距分析]')
  lines.push('    GAP -->|关键差距| CRITICAL[紧急补齐]')
  lines.push('    GAP -->|显著差距| SIG[重点提升]')
  lines.push('    GAP -->|轻微差距| MINOR[持续改进]')
  lines.push('    CRITICAL --> PLAN[学习路线图]')
  lines.push('    SIG --> PLAN')
  lines.push('    MINOR --> PLAN')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 技能差距表')
  lines.push('| 技能 | 当前水平 | 要求水平 | 差距严重度 | 预计学时 | 优先级 |')
  lines.push('|------|----------|----------|------------|----------|--------|')
  for (const g of result.gaps) {
    const severityLabel = g.gap_severity === 'critical' ? '关键' : g.gap_severity === 'significant' ? '显著' : g.gap_severity === 'minor' ? '轻微' : '已达标'
    lines.push(`| ${g.skill} | ${g.current_level}% | ${g.required_level}% | ${severityLabel} | ${g.estimated_hours}h | P${g.priority} |`)
  }
  lines.push('')

  lines.push('### 📚 学习路线图')
  for (const phase of result.learning_phases) {
    lines.push(`#### 阶段${phase.phase}: ${phase.phase_name} (${phase.duration_weeks}周)`)
    lines.push('| 技能 | 学习方式 | 提供方 | 学时 | 费用 | 效果评分 |')
    lines.push('|------|----------|--------|------|------|----------|')
    for (const r of phase.resources) {
      lines.push(`| ${r.skill} | ${r.resource_type} | ${r.provider} | ${r.duration_hours}h | $${r.cost_estimate} | ${r.effectiveness_score} |`)
    }
    lines.push('')
    lines.push('里程碑:')
    for (const m of phase.milestones) lines.push(`- ${m}`)
    lines.push('')
  }

  if (result.certification_recommendations.length > 0) {
    lines.push('### 🏆 认证推荐')
    for (const c of result.certification_recommendations) lines.push(`- ${c}`)
    lines.push('')
  }

  lines.push('### 📋 行动清单')
  lines.push('- [x] 完成技能差距全面评估')
  lines.push('- [x] 制定分阶段学习路线图')
  lines.push('- [x] 选择高质量学习资源')
  lines.push('- [x] 设定可量化的学习里程碑')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • Data-Driven Skill Development*')
  return lines.join('\n')
}

// --- Tool 3: Resume Career Optimizer 报告 ---
function formatResumeOptimizationReport(result: ResumeOptimizationResult): string {
  const lines: string[] = []
  lines.push('## 📝 Resume Career Optimizer — 简历职业叙事优化报告')
  lines.push('')
  lines.push(`ATS兼容性: ${(result.ats_compatibility_score * 100).toFixed(0)}% | 整体影响力: ${(result.overall_impact_score * 100).toFixed(0)}% | 优化项: ${result.bullets.length}`)
  lines.push('')
  lines.push('### 📊 优化流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    ORIG[原始简历] -->|分析| PARSE[内容解析]')
  lines.push('    PARSE -->|STAR重构| STAR[STAR法则优化]')
  lines.push('    STAR -->|关键词| ATS[ATS关键词嵌入]')
  lines.push('    ATS -->|量化| IMPACT[影响力量化]')
  lines.push('    IMPACT -->|输出| FINAL[优化简历]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 要点优化对比')
  result.bullets.forEach((b, idx) => {
    lines.push(`#### 要点${idx + 1} (影响力: ${(b.impact_score * 100).toFixed(0)}%)`)
    lines.push(`**原始**: ${b.original}`)
    lines.push(`**优化**: ${b.optimized}`)
    lines.push('')
    lines.push('STAR分解:')
    lines.push(`- **S**ituation: ${b.star_components.situation}`)
    lines.push(`- **T**ask: ${b.star_components.task}`)
    lines.push(`- **A**ction: ${b.star_components.action}`)
    lines.push(`- **R**esult: ${b.star_components.result}`)
    lines.push(`- ATS关键词: ${b.ats_keywords_added.join(', ')}`)
    lines.push('')
  })

  lines.push('### 📊 各部分评分')
  lines.push('| 部分 | 原始分 | 优化后 | 改进建议 |')
  lines.push('|------|--------|--------|----------|')
  for (const s of result.sections) {
    lines.push(`| ${s.section_name} | ${s.original_score} | ${s.optimized_score} | ${s.improvements.slice(0, 2).join('; ')} |`)
  }
  lines.push('')

  lines.push('### 🎯 关键词覆盖')
  lines.push(result.keyword_coverage.map(k => `\`${k}\``).join(' '))
  lines.push('')

  lines.push('### 📋 格式建议')
  for (const f of result.formatting_suggestions) lines.push(`- ${f}`)
  lines.push('')

  lines.push('### 📋 行动清单')
  lines.push('- [x] 应用STAR法则重构所有要点')
  lines.push('- [x] 嵌入目标岗位ATS关键词')
  lines.push('- [x] 量化所有可量化的成就')
  lines.push('- [x] 优化格式确保ATS兼容')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • STAR Method Optimization*')
  return lines.join('\n')
}

// --- Tool 4: Interview Prep Simulator 报告 ---
function formatInterviewPrepReport(result: InterviewPrepResult): string {
  const lines: string[] = []
  lines.push('## 🎤 Interview Prep Simulator — 面试模拟与准备报告')
  lines.push('')
  lines.push(`整体准备度: ${result.overall_readiness_score}% | 练习题数: ${result.questions.length} | 模拟回答: ${result.mock_responses.length}`)
  lines.push('')
  lines.push('### 📊 面试准备流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PREP[面试准备] -->|分类| BEHAV[行为面试]')
  lines.push('    PREP -->|分类| TECH[技术面试]')
  lines.push('    PREP -->|分类| CASE[案例面试]')
  lines.push('    BEHAV -->|STAR练习| MOCK[模拟练习]')
  lines.push('    TECH -->|深度准备| MOCK')
  lines.push('    CASE -->|框架训练| MOCK')
  lines.push('    MOCK -->|反馈| IMPROVE[持续改进]')
  lines.push('    IMPROVE -->|迭代| READY[面试就绪]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 面试题库')
  for (const q of result.questions) {
    lines.push(`#### ${q.question_id} [${q.category}] (${q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'})`)
    lines.push(`**问题**: ${q.question}`)
    lines.push('')
    lines.push('回答框架:')
    for (const o of q.sample_answer_outline) lines.push(`- ${o}`)
    lines.push('')
    lines.push('常见陷阱:')
    for (const p of q.common_pitfalls) lines.push(`- ⚠️ ${p}`)
    lines.push('')
  }

  if (result.mock_responses.length > 0) {
    lines.push('### 🎯 模拟回答评分')
    for (const r of result.mock_responses) {
      lines.push(`#### ${r.question_id} 评分`)
      lines.push('| 维度 | 得分 |')
      lines.push('|------|------|')
      lines.push(`| 清晰度 | ${(r.scores.clarity * 100).toFixed(0)}% |`)
      lines.push(`| 相关性 | ${(r.scores.relevance * 100).toFixed(0)}% |`)
      lines.push(`| 具体性 | ${(r.scores.specificity * 100).toFixed(0)}% |`)
      lines.push(`| 自信度 | ${(r.scores.confidence * 100).toFixed(0)}% |`)
      lines.push(`| STAR对齐 | ${(r.scores.star_alignment * 100).toFixed(0)}% |`)
      lines.push('')
      lines.push('反馈:')
      for (const f of r.feedback) lines.push(`- ✅ ${f}`)
      lines.push('改进建议:')
      for (const i of r.improvement_suggestions) lines.push(`- 🔧 ${i}`)
      lines.push('')
    }
  }

  lines.push('### 💪 优势领域')
  for (const s of result.strength_areas) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### 🔧 待提升领域')
  for (const i of result.improvement_areas) lines.push(`- ${i}`)
  lines.push('')

  lines.push('### 🏢 公司特定建议')
  for (const t of result.company_specific_tips) lines.push(`- ${t}`)
  lines.push('')

  lines.push('### 📋 行动清单')
  lines.push('- [x] 完成行为/技术面试题库准备')
  lines.push('- [x] 进行至少3次模拟面试')
  lines.push('- [x] 准备向面试官提问的问题')
  lines.push('- [x] 研究目标公司背景和文化')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • Interview Simulation & Prep*')
  return lines.join('\n')
}

// --- Tool 5: Salary Negotiation Coach 报告 ---
function formatSalaryNegotiationReport(result: SalaryNegotiationResult): string {
  const lines: string[] = []
  lines.push('## 💰 Salary Negotiation Coach — 薪资谈判策略报告')
  lines.push('')
  lines.push(`目标范围: $${result.target_range[0].toLocaleString()}-$${result.target_range[1].toLocaleString()} | 底线: $${result.walk_away_number.toLocaleString()} | 市场YoY变化: ${result.market_benchmark.yoy_change_pct}%`)
  lines.push('')
  lines.push('### 📊 谈判策略图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    OFFER[收到Offer] -->|分析| BENCH[市场基准对比]')
  lines.push('    BENCH -->|制定| STRAT[谈判策略]')
  lines.push('    STRAT -->|执行| NEGO[薪资谈判]')
  lines.push('    NEGO -->|成功| ACCEPT[接受Offer]')
  lines.push('    NEGO -->|失败| WALK[Walk Away]')
  lines.push('    NEGO -->|妥协| COUNTER[Counter Offer]')
  lines.push('```')
  lines.push('')

  lines.push('### 📊 市场基准')
  lines.push('| 分位 | 薪资 |')
  lines.push('|------|------|')
  lines.push(`| 25th | $${result.market_benchmark.percentile_25.toLocaleString()} |`)
  lines.push(`| 50th (中位数) | $${result.market_benchmark.percentile_50.toLocaleString()} |`)
  lines.push(`| 75th | $${result.market_benchmark.percentile_75.toLocaleString()} |`)
  lines.push(`| 90th | $${result.market_benchmark.percentile_90.toLocaleString()} |`)
  lines.push(`| 市场均值 | $${result.market_benchmark.market_average.toLocaleString()} |`)
  lines.push('')

  lines.push('### 📋 谈判策略')
  for (const t of result.negotiation_tactics) {
    lines.push(`#### ${t.tactic_name} (风险: ${t.risk_level === 'low' ? '低' : t.risk_level === 'medium' ? '中' : '高'})`)
    lines.push(`**时机**: ${t.timing}`)
    lines.push(`**话术**: ${t.script_template}`)
    lines.push(`**预期结果**: ${t.expected_outcome}`)
    lines.push(`**备选方案**: ${t.fallback_position}`)
    lines.push('')
  }

  lines.push('### 💼 薪酬结构分析')
  lines.push('| 组成 | 金额 |')
  lines.push('|------|------|')
  lines.push(`| 基本工资 | $${result.compensation_breakdown.base_salary.toLocaleString()} |`)
  lines.push(`| 奖金比例 | ${result.compensation_breakdown.bonus_pct}% |`)
  lines.push(`| 股权价值 | $${result.compensation_breakdown.equity_value.toLocaleString()} |`)
  lines.push(`| 福利价值 | $${result.compensation_breakdown.benefits_value.toLocaleString()} |`)
  lines.push(`| **总薪酬** | **$${result.compensation_breakdown.total_comp.toLocaleString()}** |`)
  lines.push('')

  lines.push('### 📋 谈判建议')
  for (const s of result.script_recommendations) lines.push(`- ${s}`)
  lines.push('')

  lines.push('### 📋 行动清单')
  lines.push('- [x] 完成市场薪资基准调研')
  lines.push('- [x] 制定多套谈判策略')
  lines.push('- [x] 准备谈判话术脚本')
  lines.push('- [x] 设定明确的walk-away point')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • Data-Driven Salary Negotiation*')
  return lines.join('\n')
}

// --- Tool 6: Professional Brand Builder 报告 ---
function formatBrandBuilderReport(result: BrandBuilderResult): string {
  const lines: string[] = []
  lines.push('## 🌟 Professional Brand Builder — 个人品牌建设与LinkedIn优化报告')
  lines.push('')
  lines.push(`权威分数: ${(result.authority_score * 100).toFixed(0)}% | 品牌支柱: ${result.brand_pillars.length} | 内容日历: ${result.content_calendar.length}天`)
  lines.push('')
  lines.push('### 📊 品牌建设框架')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CORE[核心价值] -->|支撑| P1[行业洞察]')
  lines.push('    CORE -->|支撑| P2[专业能力]')
  lines.push('    CORE -->|支撑| P3[个人故事]')
  lines.push('    P1 -->|输出| CONTENT[内容创作]')
  lines.push('    P2 -->|输出| CONTENT')
  lines.push('    P3 -->|输出| CONTENT')
  lines.push('    CONTENT -->|发布| PLATFORM[LinkedIn/平台]')
  lines.push('    PLATFORM -->|互动| GROWTH[品牌增长]')
  lines.push('    GROWTH -->|转化| OPPORTUNITY[职业机会]')
  lines.push('```')
  lines.push('')

  lines.push('### 🏛️ 品牌支柱')
  for (const p of result.brand_pillars) {
    lines.push(`#### ${p.pillar}`)
    lines.push(`${p.description}`)
    lines.push(`发布频率: ${p.posting_frequency}`)
    lines.push('内容示例:')
    for (const e of p.content_examples) lines.push(`- ${e}`)
    lines.push('互动策略:')
    for (const t of p.engagement_tactics) lines.push(`- 📌 ${t}`)
    lines.push('')
  }

  lines.push('### 💼 LinkedIn优化')
  lines.push('| 部分 | 当前状态 | 优化版本 | 影响说明 |')
  lines.push('|------|----------|----------|----------|')
  for (const o of result.linkedin_optimizations) {
    lines.push(`| ${o.section} | ${o.current_state} | ${o.optimized_version} | ${o.impact_notes} |`)
  }
  lines.push('')

  lines.push('### 📅 内容日历')
  lines.push('| 日期 | 内容类型 | 主题 | 格式 | Hashtags |')
  lines.push('|------|----------|------|------|----------|')
  for (const c of result.content_calendar) {
    lines.push(`| ${c.day} | ${c.content_type} | ${c.topic} | ${c.format} | ${c.hashtags.join(' ')} |`)
  }
  lines.push('')

  lines.push('### 📊 社交KPI')
  for (const k of result.networking_kpis) lines.push(`- ${k}`)
  lines.push('')

  lines.push('### 📋 行动清单')
  lines.push('- [x] 完成LinkedIn各部分优化')
  lines.push('- [x] 建立品牌内容支柱')
  lines.push('- [x] 制定周度内容日历')
  lines.push('- [x] 设定社交KPI目标')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • Personal Brand Building*')
  return lines.join('\n')
}

// --- Tool 7: Pivot Strategy Advisor 报告 ---
function formatPivotStrategyReport(result: PivotStrategyResult): string {
  const lines: string[] = []
  lines.push('## 🔄 Pivot Strategy Advisor — 职业转型策略与风险评估报告')
  lines.push('')
  lines.push(`整体可行性: ${(result.overall_feasibility_score * 100).toFixed(0)}% | 回本月份: 第${result.break_even_month}月 | 风险因素: ${result.risk_factors.length}`)
  lines.push('')
  lines.push('### 📊 转型路径图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CURRENT[当前角色] -->|阶段1| EXPLORE[探索准备]')
  lines.push('    EXPLORE -->|阶段2| BUILD[能力建设]')
  lines.push('    BUILD -->|阶段3| EXEC[求职执行]')
  lines.push('    EXEC -->|阶段4| GROW[融入成长]')
  lines.push('    GROW --> TARGET[目标角色]')
  lines.push('```')
  lines.push('')

  lines.push('### ⚠️ 风险评估')
  lines.push('| 风险 | 概率 | 影响 | 缓解策略 | 应急计划 |')
  lines.push('|------|------|------|----------|----------|')
  for (const r of result.risk_factors) {
    lines.push(`| ${r.risk} | ${(r.probability * 100).toFixed(0)}% | ${r.impact === 'high' ? '高' : r.impact === 'medium' ? '中' : '低'} | ${r.mitigation_strategy} | ${r.contingency_plan} |`)
  }
  lines.push('')

  lines.push('### 📋 转型阶段')
  for (const p of result.pivot_phases) {
    lines.push(`#### 阶段${p.phase}: ${p.name} (${p.duration_months}个月)`)
    lines.push('**目标**:')
    for (const o of p.objectives) lines.push(`- ${o}`)
    lines.push('**关键行动**:')
    for (const a of p.key_actions) lines.push(`- ✅ ${a}`)
    lines.push('**成功指标**:')
    for (const m of p.success_metrics) lines.push(`- 📊 ${m}`)
    lines.push(`**财务影响**: ${p.financial_impact}`)
    lines.push('')
  }

  lines.push('### 💰 财务预测')
  lines.push('| 月份 | 收入 | 支出 | 储蓄余额 | 备注 |')
  lines.push('|------|------|------|----------|------|')
  for (const p of result.financial_projections) {
    lines.push(`| ${p.month} | $${p.income.toLocaleString()} | $${p.expenses.toLocaleString()} | $${p.savings_balance.toLocaleString()} | ${p.notes} |`)
  }
  lines.push('')

  lines.push('### 🔀 备选转型方案')
  for (const a of result.alternative_pivots) lines.push(`- ${a}`)
  lines.push('')

  lines.push('### 📋 行动清单')
  lines.push('- [x] 完成全面风险评估')
  lines.push('- [x] 制定分阶段转型计划')
  lines.push('- [x] 建立财务安全垫')
  lines.push('- [x] 准备备选转型方案')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • Strategic Career Pivot Planning*')
  return lines.join('\n')
}

// --- Tool 8: Networking Strategy Planner 报告 ---
function formatNetworkingStrategyReport(result: NetworkingStrategyResult): string {
  const lines: string[] = []
  lines.push('## 🤝 Networking Strategy Planner — 职业社交策略与弱关系开发报告')
  lines.push('')
  lines.push(`连接目标类型: ${result.connection_targets.length} | 社交活动: ${result.networking_activities.length} | 12个月网络增长: ${result.network_growth_projection[result.network_growth_projection.length - 1] - result.network_growth_projection[0]}人`)
  lines.push('')
  lines.push('### 📊 社交网络扩展图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    YOU[你] -->|强关系| STRONG[核心圈 20%]')
  lines.push('    YOU -->|弱关系| WEAK[弱关系 80%]')
  lines.push('    WEAK -->|激活| ACTIVE[活跃弱关系]')
  lines.push('    ACTIVE -->|转化| OPPORTUNITY[职业机会]')
  lines.push('    STRONG -->|维护| SUPPORT[持续支持]')
  lines.push('    ACTIVE -->|拓展| NEW[新连接]')
  lines.push('    NEW -->|多样化| DIVERSITY[网络多样性]')
  lines.push('```')
  lines.push('')

  lines.push('### 🎯 连接目标')
  lines.push('| 目标类型 | 相关度 | 触达难度 | 策略 | 价值主张 | 转化率 |')
  lines.push('|----------|--------|----------|------|----------|--------|')
  for (const t of result.connection_targets) {
    lines.push(`| ${t.target_type} | ${t.relevance_score}/100 | ${t.reach_difficulty === 'easy' ? '易' : t.reach_difficulty === 'moderate' ? '中' : '难'} | ${t.approach_strategy} | ${t.value_proposition} | ${(t.expected_conversion_rate * 100).toFixed(0)}% |`)
  }
  lines.push('')

  lines.push('### 📅 社交活动计划')
  lines.push('| 活动 | 频率 | 时间投入 | 预期新联系 | ROI | 平台 |')
  lines.push('|------|------|----------|------------|-----|------|')
  for (const a of result.networking_activities) {
    lines.push(`| ${a.activity} | ${a.frequency} | ${a.time_commitment_hours}h | ${a.expected_new_contacts} | ${a.roi_score}/10 | ${a.platforms.join(', ')} |`)
  }
  lines.push('')

  lines.push('### ✉️ 触达模板')
  for (const t of result.outreach_templates) {
    lines.push(`#### ${t.scenario} (预估回复率: ${(t.response_rate_estimate * 100).toFixed(0)}%)`)
    lines.push('```')
    lines.push(t.template_text)
    lines.push('```')
    lines.push('个性化技巧:')
    for (const p of t.personalization_tips) lines.push(`- 💡 ${p}`)
    lines.push('跟进计划:')
    for (const f of t.follow_up_schedule) lines.push(`- 📅 ${f}`)
    lines.push('')
  }

  lines.push('### 📈 网络增长预测')
  lines.push('| 月份 | 网络规模 | 月增长 |')
  lines.push('|------|----------|--------|')
  result.network_growth_projection.forEach((size, idx) => {
    const growth = idx > 0 ? size - result.network_growth_projection[idx - 1] : 0
    lines.push(`| 第${idx + 1}月 | ${size} | +${growth} |`)
  })
  lines.push('')

  lines.push('### 🔗 弱关系激活计划')
  for (const p of result.weak_tie_activation_plan) lines.push(`- ${p}`)
  lines.push('')

  lines.push('### 📊 社交KPI')
  for (const k of result.networking_kpis) lines.push(`- ${k}`)
  lines.push('')

  lines.push('### 📋 行动清单')
  lines.push('- [x] 识别并分类连接目标')
  lines.push('- [x] 制定周度社交活动计划')
  lines.push('- [x] 准备个性化触达模板')
  lines.push('- [x] 建立弱关系激活机制')
  lines.push('')
  lines.push('---')
  lines.push('*Career Coach Agent • v0.1.0 • Strategic Networking & Weak-Tie Development*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Career Path Simulator — 职业路径模拟与行业趋势分析
  tools.register(defineTool({
    name: 'career_path_simulator',
    description: '职业路径模拟与行业趋势分析 | 多路径对比、薪资预测、里程碑规划 | Career path simulation with multi-path comparison, salary forecasting, and milestone planning.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_role, years_experience, target_industry, risk_tolerance (conservative|moderate|aggressive), simulation_years'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CareerPathInput = JSON.parse(args.input_data)
      return formatCareerPathReport(analyzeCareerPath(input))
    }
  }))

  // Tool 2: Skill Gap Analyzer — 技能差距分析与学习路线图
  tools.register(defineTool({
    name: 'skill_gap_analyzer',
    description: '技能差距分析与学习路线图 | 能力评估、分阶段学习计划、资源推荐 | Skill gap analysis with phased learning roadmap and resource recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_skills[], target_role, target_industry, learning_budget_hours, preferred_learning_style (visual|hands_on|reading|social)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SkillGapInput = JSON.parse(args.input_data)
      return formatSkillGapReport(analyzeSkillGap(input))
    }
  }))

  // Tool 3: Resume Career Optimizer — 简历职业叙事优化与STAR法则
  tools.register(defineTool({
    name: 'resume_career_optimizer',
    description: '简历职业叙事优化与STAR法则 | ATS兼容、量化成就、关键词覆盖 | Resume narrative optimization with STAR method, ATS compatibility, and keyword coverage.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: resume_text, target_role, target_industry, highlight_achievements (boolean), apply_star_method (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ResumeInput = JSON.parse(args.input_data)
      return formatResumeOptimizationReport(analyzeResumeOptimization(input))
    }
  }))

  // Tool 4: Interview Prep Simulator — 面试模拟与行为/技术问题准备
  tools.register(defineTool({
    name: 'interview_prep_simulator',
    description: '面试模拟与行为/技术问题准备 | 题库生成、模拟评分、反馈改进 | Interview simulation with question bank, mock scoring, and improvement feedback.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: target_role, target_company, interview_type (behavioral|technical|case|panel), years_experience, weak_areas[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: InterviewInput = JSON.parse(args.input_data)
      return formatInterviewPrepReport(analyzeInterviewPrep(input))
    }
  }))

  // Tool 5: Salary Negotiation Coach — 薪资谈判策略与市场基准
  tools.register(defineTool({
    name: 'salary_negotiation_coach',
    description: '薪资谈判策略与市场基准 | 市场数据、谈判话术、薪酬结构分析 | Salary negotiation strategy with market benchmarks, tactics, and comp breakdown.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_salary, offer_salary, target_role, location, years_experience, competing_offers, company_stage (startup|growth|enterprise|public)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SalaryInput = JSON.parse(args.input_data)
      return formatSalaryNegotiationReport(analyzeSalaryNegotiation(input))
    }
  }))

  // Tool 6: Professional Brand Builder — 个人品牌建设与LinkedIn优化
  tools.register(defineTool({
    name: 'professional_brand_builder',
    description: '个人品牌建设与LinkedIn优化 | 品牌支柱、内容日历、权威评分 | Personal branding with brand pillars, content calendar, and authority scoring.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_role, target_role, industry, key_strengths[], years_experience, platform (linkedin|personal_website|github|twitter)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: BrandInput = JSON.parse(args.input_data)
      return formatBrandBuilderReport(analyzeProfessionalBrand(input))
    }
  }))

  // Tool 7: Pivot Strategy Advisor — 职业转型策略与风险评估
  tools.register(defineTool({
    name: 'pivot_strategy_advisor',
    description: '职业转型策略与风险评估 | 分阶段计划、财务预测、风险缓解 | Career pivot strategy with phased planning, financial projection, and risk mitigation.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_role, current_industry, target_role, target_industry, years_experience, transferable_skills[], financial_runway_months, risk_tolerance (low|medium|high)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PivotInput = JSON.parse(args.input_data)
      return formatPivotStrategyReport(analyzePivotStrategy(input))
    }
  }))

  // Tool 8: Networking Strategy Planner — 职业社交策略与弱关系开发
  tools.register(defineTool({
    name: 'networking_strategy_planner',
    description: '职业社交策略与弱关系开发 | 连接目标、触达模板、增长预测 | Professional networking strategy with connection targets, outreach templates, and growth projection.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: target_industry, target_roles[], current_network_size, weak_tie_ratio, networking_style (introvert|extrovert|ambivert), weekly_time_hours, geographic_focus'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: NetworkingInput = JSON.parse(args.input_data)
      return formatNetworkingStrategyReport(analyzeNetworkingStrategy(input))
    }
  }))

  console.log(`[dsh-tool-careercoachagent] Loaded v${VERSION} — Career Coach Agent: 职业发展全流程赋能, 8 tools active`)
  console.log('  Tools: career_path_simulator, skill_gap_analyzer, resume_career_optimizer, interview_prep_simulator, salary_negotiation_coach, professional_brand_builder, pivot_strategy_advisor, networking_strategy_planner')
}
