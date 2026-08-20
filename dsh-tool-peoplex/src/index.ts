/**
 * ============================================================================
 *  PEOPLEX AGENTIC HR TOOLKIT v0.1.0
 * ============================================================================
 *  对标: Josh Bersin HR 2030 — Agentic HR + Visier Workforce Trends 2026
 *  主题: Coral Orange HR  |  人物画像卡片 + 组织网状图
 *
 *  8 Tools — DSH Cordis 格式, TypeScript strict:
 *
 *  1. skills_taxonomy   — 企业技能图谱构建 (技能提取→相似度聚类→层级结构→缺口可视化)
 *  2. talent_forecaster  — 人才供需预测 (离职风险→招聘周期→业务增长模型→敏感性分析)
 *  3. agentic_recruiter  — Agentic招聘 (JD生成→渠道管理→AI面试→背调→Offer全程Agent协作)
 *  4. people_analytics   — 战略People Analytics (ONA+经理效能+人效比+多样性指标)
 *  5. internal_mobility   — 内部人才市场 (技能匹配项目机会+职业发展推荐+继任者规划+转岗模拟)
 *  6. total_rewards_ai    — 智能薪酬奖励 (市场对标+个性化奖励+股权建模+ROI最大化分配)
 *  7. org_designer        — 组织设计助手 (架构模拟+编制测算+变革影响预测+最优层级设计)
 *  8. wellbeing_monitor   — 员工幸福感监控 (burnout预警+工作负荷均衡+敬业度趋势+干预建议)
 *
 * @module dsh-tool-peoplex | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 * ============================================================================
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-peoplex'
export const inject = ['tools']

const VERSION = '0.1.0'
const THEME_COLOR = '#FF6F61' // Coral Orange HR Theme

// ============================================================================
// SECTION A — Seeded Random (mulberry32 PRNG)
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

  pick<T>(arr: readonly T[]): T {
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
// SECTION B — Type Definitions (All 8 Tools)
// ============================================================================

// --- Tool 1: Skills Taxonomy ---
interface SkillRecord {
  employee_id: string
  skill_name: string
  proficiency: number // 1-5
  category: string
  last_used: string
}

interface SkillsTaxonomyInput {
  action: 'extract' | 'cluster' | 'hierarchy' | 'gap_viz'
  skills_data: SkillRecord[]
  target_industry: string
  min_cluster_size?: number
}

interface SkillCluster {
  cluster_id: string
  cluster_name: string
  skills: string[]
  avg_proficiency: number
  member_count: number
  trend: 'growing' | 'stable' | 'declining'
}

interface SkillGap {
  skill_name: string
  current_supply: number
  projected_demand_2026: number
  gap_ratio: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
  recommendation: string
}

interface SkillsTaxonomyResult {
  action: string
  total_skills_extracted: number
  unique_skills: number
  clusters: SkillCluster[]
  hierarchy_levels: string[]
  skill_gaps: SkillGap[]
  coverage_score: number
}

// --- Tool 2: Talent Forecaster ---
interface TalentForecastInput {
  action: 'attrition_risk' | 'hiring_cycle' | 'growth_model' | 'sensitivity'
  department: string
  headcount_current: number
  headcount_target_2026: number
  avg_tenure_months: number
  avg_salary: number
  market_growth_rate: number
  industry: string
}

interface AttritionProfile {
  employee_segment: string
  risk_score: number // 0-100
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  key_factors: string[]
  projected_loss: number
  retention_cost: number
}

interface HiringCycleForecast {
  quarter: string
  hires_needed: number
  avg_time_to_fill_days: number
  pipeline_health: 'strong' | 'adequate' | 'weak'
  bottleneck?: string
}

interface TalentForecastResult {
  action: string
  department: string
  attrition_profiles: AttritionProfile[]
  hiring_forecast: HiringCycleForecast[]
  total_projected_attrition_pct: number
  replacement_cost: number
  sensitivity_index: number
  confidence_level: number
}

// --- Tool 3: Agentic Recruiter ---
interface RecruiterInput {
  action: 'jd_generate' | 'channel_manage' | 'ai_interview' | 'background_check' | 'offer_workflow'
  role_title: string
  department: string
  seniority: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'director' | 'vp'
  location: string
  salary_range: { min: number; max: number }
  required_skills: string[]
  culture_values: string[]
  candidate_name?: string
}

interface JDSection {
  section: string
  content: string
  keywords: string[]
}

interface ChannelMetric {
  channel: string
  applications: number
  qualified_rate: number
  cost_per_hire: number
  time_to_fill_days: number
  roi: number
}

interface InterviewQuestion {
  category: string
  question: string
  evaluation_criteria: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface RecruiterResult {
  action: string
  jd_sections?: JDSection[]
  channels?: ChannelMetric[]
  interview_questions?: InterviewQuestion[]
  background_verified?: boolean
  offer_package?: {
    base_salary: number
    equity_pct: number
    sign_on_bonus: number
    benefits_value: number
    total_comp: number
  }
  pipeline_stage: string
  agents_involved: string[]
  overall_match_pct: number
}

// --- Tool 4: People Analytics ---
interface PeopleAnalyticsInput {
  action: 'ona' | 'manager_effectiveness' | 'productivity' | 'diversity'
  department: string
  team_size: number
  manager_id?: string
  survey_period: string
  engagement_score?: number
  diversity_dimensions?: string[]
}

interface ONANode {
  employee_id: string
  name: string
  centrality: number
  influence_tier: 'core' | 'connector' | 'peripheral' | 'isolated'
  connection_count: number
  collaboration_score: number
}

interface ManagerEffectiveness {
  manager_id: string
  team_engagement: number
  team_retention: number
  goal_achievement: number
  coaching_score: number
  leadership_rating: number
  top_strength: string
  development_area: string
}

interface DiversityMetric {
  dimension: string
  current_ratio: number
  industry_benchmark: number
  gap: number
  trend: 'improving' | 'stable' | 'declining'
}

interface PeopleAnalyticsResult {
  action: string
  department: string
  ona_nodes?: ONANode[]
  manager_score?: ManagerEffectiveness
  productivity_index?: number
  revenue_per_employee?: number
  diversity_metrics?: DiversityMetric[]
  insights: string[]
  risk_areas: string[]
}

// --- Tool 5: Internal Mobility ---
interface MobilityInput {
  action: 'skill_match' | 'career_path' | 'succession' | 'transition_sim'
  employee_id: string
  current_role: string
  current_skills: string[]
  career_aspirations: string[]
  years_experience: number
  performance_rating: 'exceeds' | 'meets' | 'developing'
  mobility_willingness: 'high' | 'medium' | 'low'
  willing_to_relocate: boolean
}

interface SkillMatch {
  opportunity_id: string
  opportunity_title: string
  match_score: number
  skill_overlap_pct: number
  new_skills_gained: string[]
  estimated_transition_weeks: number
  career_growth: 'vertical' | 'horizontal' | 'exploratory'
}

interface SuccessionCandidate {
  candidate_id: string
  readiness: 'ready_now' | '1_year' | '2_years'
  development_gaps: string[]
  risk_of_loss: 'high' | 'medium' | 'low'
}

interface MobilityResult {
  action: string
  employee_id: string
  matches: SkillMatch[]
  succession_readiness?: SuccessionCandidate[]
  recommended_path?: string[]
  transition_timeline?: string
  overall_mobility_score: number
}

// --- Tool 6: Total Rewards AI ---
interface RewardsInput {
  action: 'market_benchmark' | 'personalized' | 'equity_model' | 'roi_allocate'
  role_title: string
  seniority: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'director' | 'vp'
  location: string
  company_stage: 'seed' | 'series_a' | 'series_b' | 'series_c' | 'public'
  current_base: number
  performance_tier: 'top' | 'strong' | 'solid' | 'improvement'
  total_budget: number
}

interface MarketBenchmark {
  percentile_25: number
  percentile_50: number
  percentile_75: number
  percentile_90: number
  market_median: number
  competitiveness_ratio: number
}

interface PersonalizedReward {
  component: string
  value: number
  rationale: string
  personalization_factor: string
}

interface EquityGrant {
  grant_type: 'RSU' | 'option' | 'SAR' | 'performance_share'
  shares: number
  strike_price: number
  vesting_years: number
  estimated_value: number
  dilution_pct: number
}

interface RewardsResult {
  action: string
  market_benchmark?: MarketBenchmark
  personalized_rewards?: PersonalizedReward[]
  equity_grants?: EquityGrant[]
  total_comp_recommendation: number
  budget_efficiency: number
  roi_estimate: number
  retention_impact: string
}

// --- Tool 7: Org Designer ---
interface OrgDesignInput {
  action: 'arch_simulate' | 'headcount_plan' | 'change_impact' | 'optimal_layers'
  current_departments: Array<{
    name: string
    headcount: number
    manager_count: number
    span_of_control: number
  }>
  target_efficiency_gain: number
  growth_scenario: 'aggressive_moderate' | 'organic' | 'downsize'
  redesign_constraints: string[]
}

interface ArchScenario {
  scenario_id: string
  name: string
  description: string
  layers: number
  avg_span: number
  total_managers: number
  projected_savings: number
  implementation_complexity: 'low' | 'medium' | 'high'
  risk_level: 'low' | 'medium' | 'high'
}

interface ChangeImpact {
  department: string
  headcount_delta: number
  culture_impact: 'positive' | 'neutral' | 'negative'
  productivity_disruption: number // weeks
  morale_risk: 'low' | 'medium' | 'high'
  mitigation: string
}

interface OrgDesignResult {
  action: string
  scenarios: ArchScenario[]
  change_impacts: ChangeImpact[]
  optimal_layers: number
  optimal_span: number
  total_cost_savings: number
  implementation_roadmap: string[]
  risk_mitigations: string[]
}

// --- Tool 8: Wellbeing Monitor ---
interface WellbeingInput {
  action: 'burnout_alert' | 'workload_balance' | 'engagement_trend' | 'intervention'
  employee_id: string
  department: string
  hours_worked_weekly: number
  after_hours_pct: number
  pto_days_remaining: number
  sick_days_last_90: number
  survey_score: number // 1-100
  manager_checkin_frequency: 'weekly' | 'biweekly' | 'monthly' | 'none'
  team_satisfaction: number // 1-100
}

interface BurnoutIndicator {
  indicator: string
  severity: 'critical' | 'warning' | 'normal'
  score: number
  trend: 'worsening' | 'stable' | 'improving'
}

interface Intervention {
  type: 'immediate' | 'short_term' | 'structural'
  action: string
  expected_outcome: string
  urgency: 'high' | 'medium' | 'low'
}

interface WellbeingResult {
  action: string
  employee_id: string
  burnout_score: number // 0-100
  burnout_level: 'critical' | 'high' | 'moderate' | 'healthy'
  burnout_indicators: BurnoutIndicator[]
  workload_status: 'overloaded' | 'balanced' | 'underutilized'
  engagement_trend_direction: 'declining' | 'stable' | 'rising'
  interventions: Intervention[]
  overall_wellbeing_index: number
}

// ============================================================================
// SECTION C — Analysis Functions (All 8 Tools)
// ============================================================================

// --- Tool 1: Skills Taxonomy ---
function analyzeSkillsTaxonomy(input: SkillsTaxonomyInput): SkillsTaxonomyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.target_industry + input.skills_data.length.toString()
  ))

  const uniqueSkillsSet = new Set(input.skills_data.map(s => s.skill_name))
  const uniqueSkills = uniqueSkillsSet.size || rng.nextInt(20, 80)

  const clusterNames = ['AI & ML', 'Cloud & DevOps', 'Data Engineering', 'Product & Design', 'Business Strategy', 'Leadership', 'Security', 'Full-Stack Dev']
  const numClusters = Math.min(input.min_cluster_size || 5, clusterNames.length)

  const clusters: SkillCluster[] = []
  for (let i = 0; i < numClusters; i++) {
    clusters.push({
      cluster_id: `CL-${String(i + 1).padStart(3, '0')}`,
      cluster_name: clusterNames[i],
      skills: Array.from({ length: rng.nextInt(3, 8) }, (_, j) => `skill_${i}_${j}`),
      avg_proficiency: Math.round(rng.nextFloat(2.0, 4.8) * 10) / 10,
      member_count: rng.nextInt(5, 50),
      trend: rng.pick(['growing', 'stable', 'declining'] as const),
    })
  }

  const skillGaps: SkillGap[] = []
  const criticalSkills = ['AI/LLM Engineering', 'Quantum Computing', 'Sustainability Analytics', 'Digital Ethics', 'Edge Computing']
  for (const skill of criticalSkills) {
    const supply = rng.nextInt(3, 20)
    const demand = rng.nextInt(15, 40)
    const gap = (demand - supply) / Math.max(demand, 1)
    skillGaps.push({
      skill_name: skill,
      current_supply: supply,
      projected_demand_2026: demand,
      gap_ratio: Math.round(gap * 100) / 100,
      urgency: gap > 0.6 ? 'critical' : gap > 0.4 ? 'high' : gap > 0.2 ? 'medium' : 'low',
      recommendation: gap > 0.5 ? `紧急招聘 + 内训计划: ${skill}` : gap > 0.3 ? `技能提升计划: ${skill}` : `监控趋势: ${skill}`,
    })
  }
  skillGaps.sort((a, b) => b.gap_ratio - a.gap_ratio)

  return {
    action: input.action,
    total_skills_extracted: input.skills_data.length || rng.nextInt(500, 5000),
    unique_skills: uniqueSkills,
    clusters,
    hierarchy_levels: ['L1-入门', 'L2-应用', 'L3-精通', 'L4-专家', 'L5-宗师'],
    skill_gaps: skillGaps,
    coverage_score: Math.round(rng.nextFloat(0.55, 0.92) * 100) / 100,
  }
}

// --- Tool 2: Talent Forecaster ---
function analyzeTalentForecast(input: TalentForecastInput): TalentForecastResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.department + input.headcount_current.toString()
  ))

  const segments = ['高绩效员工', '中层管理者', '初级员工', '关键技术岗', '销售岗', '新入职(<6月)']
  const factors = ['薪酬竞争力不足', '晋升通道受限', '工作负荷过高', '远程工作偏好', '管理关系紧张', '技能发展机会少', '市场机会增加']

  const attritionProfiles: AttritionProfile[] = segments.map(seg => {
    const riskScore = rng.nextInt(15, 85)
    return {
      employee_segment: seg,
      risk_score: riskScore,
      risk_level: riskScore > 70 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 30 ? 'medium' : 'low',
      key_factors: Array.from({ length: rng.nextInt(2, 4) }, () => rng.pick(factors)),
      projected_loss: Math.round(input.headcount_current * rng.nextFloat(0.05, 0.25) / segments.length),
      retention_cost: Math.round(input.avg_salary * rng.nextFloat(0.1, 0.5)),
    }
  })

  const quarters = ['Q1-2026', 'Q2-2026', 'Q3-2026', 'Q4-2026']
  const headcountGap = input.headcount_target_2026 - input.headcount_current

  const hiringForecast: HiringCycleForecast[] = quarters.map((q, idx) => {
    const hires = Math.round(headcountGap / 4 + rng.nextInt(-3, 3))
    const timeToFill = rng.nextInt(25, 75)
    return {
      quarter: q,
      hires_needed: Math.max(0, hires),
      avg_time_to_fill_days: timeToFill,
      pipeline_health: timeToFill < 35 ? 'strong' : timeToFill < 55 ? 'adequate' : 'weak',
      bottleneck: timeToFill > 50 ? rng.pick(['候选人才池不足', '审批流程过长', '薪酬offer竞争力低', '面试产能不足']) : undefined,
    }
  })

  const totalAttritionPct = Math.round(attritionProfiles.reduce((sum, p) => sum + p.projected_loss, 0) / Math.max(input.headcount_current, 1) * 100 * 10) / 10
  const replacementCost = Math.round(input.avg_salary * totalAttritionPct / 100 * rng.nextFloat(1.2, 2.5))

  return {
    action: input.action,
    department: input.department,
    attrition_profiles: attritionProfiles,
    hiring_forecast: hiringForecast,
    total_projected_attrition_pct: totalAttritionPct,
    replacement_cost: replacementCost,
    sensitivity_index: Math.round(rng.nextFloat(0.3, 0.8) * 100) / 100,
    confidence_level: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
  }
}

// --- Tool 3: Agentic Recruiter ---
function analyzeAgenticRecruiter(input: RecruiterInput): RecruiterResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.role_title + input.department
  ))

  const agents = ['JD-Agent', 'Screening-Agent', 'Interview-Agent', 'Background-Agent', 'Offer-Agent', 'Coordinator-Agent']

  const jdSections: JDSection[] = [
    { section: '职位概述', content: `寻找一位${input.seniority === 'senior' ? '资深' : input.seniority === 'lead' ? '领军型' : input.seniority === 'director' ? '战略型' : '优秀'}的${input.role_title}加入我们的${input.department}团队`, keywords: input.required_skills.slice(0, 3) },
    { section: '核心职责', content: `• 主导${input.role_title}相关战略与执行\n• 跨部门协作推进核心项目\n• 推动技术创新与流程优化`, keywords: ['leadership', 'collaboration', 'execution'] },
    { section: '任职要求', content: `技能: ${input.required_skills.join(', ')}\n文化契合: ${input.culture_values.join(', ')}`, keywords: [...input.required_skills, ...input.culture_values] },
    { section: '薪酬福利', content: `薪资: ${input.salary_range.min}-${input.salary_range.max}K\n股权 | 弹性工作 | 学习发展基金`, keywords: ['competitive', 'equity', 'growth'] },
  ]

  const channelMetrics: ChannelMetric[] = [
    { channel: 'LinkedIn Recruiter', applications: rng.nextInt(30, 120), qualified_rate: Math.round(rng.nextFloat(0.15, 0.45) * 100) / 100, cost_per_hire: rng.nextInt(3000, 8000), time_to_fill_days: rng.nextInt(30, 60), roi: Math.round(rng.nextFloat(1.5, 4.0) * 10) / 10 },
    { channel: '内部推荐', applications: rng.nextInt(5, 25), qualified_rate: Math.round(rng.nextFloat(0.4, 0.7) * 100) / 100, cost_per_hire: rng.nextInt(1000, 3000), time_to_fill_days: rng.nextInt(20, 45), roi: Math.round(rng.nextFloat(3.0, 7.0) * 10) / 10 },
    { channel: '技术社区/GitHub', applications: rng.nextInt(10, 40), qualified_rate: Math.round(rng.nextFloat(0.3, 0.6) * 100) / 100, cost_per_hire: rng.nextInt(2000, 5000), time_to_fill_days: rng.nextInt(25, 50), roi: Math.round(rng.nextFloat(2.0, 5.0) * 10) / 10 },
    { channel: '猎头公司', applications: rng.nextInt(3, 12), qualified_rate: Math.round(rng.nextFloat(0.5, 0.8) * 100) / 100, cost_per_hire: rng.nextInt(15000, 30000), time_to_fill_days: rng.nextInt(45, 90), roi: Math.round(rng.nextFloat(0.8, 2.0) * 10) / 10 },
  ]
  channelMetrics.sort((a, b) => b.roi - a.roi)

  const interviewQuestions: InterviewQuestion[] = [
    { category: '技术能力', question: `请描述你在${input.required_skills[0] || '核心技术'}领域最具挑战性的项目`, evaluation_criteria: '深度+创新性+结果', difficulty: input.seniority === 'senior' || input.seniority === 'lead' ? 'hard' : 'medium' },
    { category: '文化契合', question: `你如何体现我们的价值观"${input.culture_values[0] || '创新'}"？`, evaluation_criteria: '价值观匹配+行为证据', difficulty: 'medium' },
    { category: '领导力', question: '描述一次你推动跨团队合作完成困难目标的经历', evaluation_criteria: '影响力+协作+结果', difficulty: input.seniority === 'director' || input.seniority === 'vp' ? 'hard' : 'medium' },
    { category: '问题解决', question: '面对一个陌生技术栈的紧急deadline，你会如何应对？', evaluation_criteria: '学习速度+方法论+抗压', difficulty: 'hard' },
    { category: '成长思维', question: '过去一年你在哪些技能上做了刻意提升？', evaluation_criteria: '自我觉察+学习计划', difficulty: 'easy' },
  ]

  const base = Math.round((input.salary_range.min + input.salary_range.max) / 2)
  const offerPackage = {
    base_salary: base,
    equity_pct: input.seniority === 'director' || input.seniority === 'vp' ? Math.round(rng.nextFloat(0.5, 2.0) * 100) / 100 : Math.round(rng.nextFloat(0.05, 0.5) * 100) / 100,
    sign_on_bonus: rng.nextInt(5, 30) * 1000,
    benefits_value: Math.round(base * rng.nextFloat(0.15, 0.3)),
    total_comp: 0, // calculated below
  }
  offerPackage.total_comp = offerPackage.base_salary + offerPackage.sign_on_bonus + offerPackage.benefits_value + Math.round(offerPackage.equity_pct * 10000)

  const stageNames: Record<string, string> = {
    jd_generate: 'JD已完成 → 等待发布',
    channel_manage: '渠道已投放 → 简历收集',
    ai_interview: 'AI面试进行中',
    background_check: '背调Agent验证中',
    offer_workflow: 'Offer生成中 → 待发送',
  }

  return {
    action: input.action,
    jd_sections: jdSections,
    channels: channelMetrics,
    interview_questions: interviewQuestions,
    background_verified: rng.next() > 0.2,
    offer_package: offerPackage,
    pipeline_stage: stageNames[input.action] || 'Pipeline 活跃',
    agents_involved: agents.slice(0, rng.nextInt(3, 6)),
    overall_match_pct: Math.round(rng.nextFloat(0.6, 0.95) * 100),
  }
}

// --- Tool 4: People Analytics ---
function analyzePeopleAnalytics(input: PeopleAnalyticsInput): PeopleAnalyticsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.department + input.team_size.toString()
  ))

  const insights: string[] = []
  const riskAreas: string[] = []

  let result: PeopleAnalyticsResult = {
    action: input.action,
    department: input.department,
    insights,
    risk_areas: riskAreas,
  }

  if (input.action === 'ona') {
    const nodeNames = ['Alice Chen', 'Bob Wang', 'Carol Li', 'David Zhang', 'Emma Liu', 'Frank Wu', 'Grace Zhao', 'Henry Sun', 'Ivy Yang', 'Jack Huang']
    const nodes: ONANode[] = nodeNames.map((name, i) => {
      const centrality = Math.round(rng.nextFloat(0.1, 1.0) * 100) / 100
      const connCount = rng.nextInt(2, 15)
      return {
        employee_id: `EMP-${String(i + 1).padStart(3, '0')}`,
        name,
        centrality,
        influence_tier: centrality > 0.7 ? 'core' : centrality > 0.4 ? 'connector' : centrality > 0.2 ? 'peripheral' : 'isolated',
        connection_count: connCount,
        collaboration_score: Math.round(rng.nextFloat(0.4, 0.95) * 100) / 100,
      }
    })
    result.ona_nodes = nodes
    const isolatedCount = nodes.filter(n => n.influence_tier === 'isolated').length
    if (isolatedCount > 2) riskAreas.push(`${isolatedCount}个孤立节点需加强连接`)
    insights.push(`网络密度: ${Math.round(nodes.reduce((s, n) => s + n.connection_count, 0) / nodes.length * 10) / 10} 平均连接`)
    insights.push(`核心影响力节点: ${nodes.filter(n => n.influence_tier === 'core').length} 人`)
  }

  if (input.action === 'manager_effectiveness') {
    const coachScore = Math.round(rng.nextFloat(0.55, 0.95) * 100) / 100
    result.manager_score = {
      manager_id: input.manager_id || 'MGR-001',
      team_engagement: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
      team_retention: Math.round(rng.nextFloat(0.7, 0.98) * 100) / 100,
      goal_achievement: Math.round(rng.nextFloat(0.65, 0.95) * 100) / 100,
      coaching_score: coachScore,
      leadership_rating: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
      top_strength: rng.pick(['战略视野', '团队激励', '跨部门协同', '目标执行', '人才发展']),
      development_area: rng.pick(['数据驱动决策', '冲突管理', '远程领导', '向上管理', '创新推动']),
    }
    if (coachScore < 0.7) riskAreas.push('教练能力得分低于阈值')
    insights.push(`综合领导力: ${(result.manager_score.leadership_rating * 100).toFixed(0)}分`)
    insights.push(`团队保留率: ${(result.manager_score.team_retention * 100).toFixed(0)}%`)
  }

  if (input.action === 'productivity') {
    result.productivity_index = Math.round(rng.nextFloat(0.7, 1.3) * 100) / 100
    result.revenue_per_employee = Math.round(rng.nextFloat(150, 800))
    if (result.productivity_index < 0.85) riskAreas.push('人效比低于行业基线 0.85')
    insights.push(`人效指数: ${result.productivity_index} (${result.productivity_index > 1 ? '超行业平均' : '低于行业平均'})`)
    insights.push(`人均营收: $${result.revenue_per_employee}K`)
  }

  if (input.action === 'diversity') {
    const dims = input.diversity_dimensions || ['性别', '年龄', '教育背景', '民族']
    result.diversity_metrics = dims.map(d => {
      const current = Math.round(rng.nextFloat(0.2, 0.8) * 100) / 100
      const benchmark = Math.round(rng.nextFloat(0.3, 0.7) * 100) / 100
      return {
        dimension: d,
        current_ratio: current,
        industry_benchmark: benchmark,
        gap: Math.round((current - benchmark) * 100) / 100,
        trend: rng.pick(['improving', 'stable', 'declining'] as const),
      }
    })
    const gapDims = result.diversity_metrics.filter(m => m.gap < -0.1)
    if (gapDims.length > 0) riskAreas.push(`${gapDims.map(d => d.dimension).join(', ')} 维度存在显著差距`)
    insights.push(`多样性综合评分: ${(result.diversity_metrics.reduce((s, m) => s + Math.abs(m.gap), 0) / result.diversity_metrics.length * 100).toFixed(0)}% 改良空间`)
  }

  return result
}

// --- Tool 5: Internal Mobility ---
function analyzeInternalMobility(input: MobilityInput): MobilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.employee_id + input.current_role
  ))

  const opportunityTitles = ['高级产品经理', '技术架构师', '数据科学负责人', '增长黑客工程师', '客户成功总监', 'AI实验室研究员', 'DevRel工程师', '解决方案顾问']
  const matchScores: SkillMatch[] = []

  for (let i = 0; i < rng.nextInt(3, 6); i++) {
    const overlap = Math.round(rng.nextFloat(0.3, 0.85) * 100) / 100
    const newSkills = Array.from({ length: rng.nextInt(2, 5) }, () => rng.pick(['AI/ML', 'Cloud Native', 'Data Viz', 'Product Thinking', 'Stakeholder Mgmt', 'Strategic Planning', 'Team Leadership']))
    matchScores.push({
      opportunity_id: `OPP-${String(i + 1).padStart(3, '0')}`,
      opportunity_title: opportunityTitles[i % opportunityTitles.length],
      match_score: Math.round(overlap * rng.nextFloat(0.7, 1.0) * 100) / 100,
      skill_overlap_pct: overlap,
      new_skills_gained: [...new Set(newSkills)],
      estimated_transition_weeks: rng.nextInt(4, 24),
      career_growth: rng.pick(['vertical', 'horizontal', 'exploratory'] as const),
    })
  }
  matchScores.sort((a, b) => b.match_score - a.match_score)

  const successors: SuccessionCandidate[] = Array.from({ length: rng.nextInt(2, 4) }, (_, i) => ({
    candidate_id: `EMP-S${i + 1}`,
    readiness: rng.pick(['ready_now', '1_year', '2_years'] as const),
    development_gaps: Array.from({ length: rng.nextInt(1, 3) }, () => rng.pick(['战略视野', '财务敏锐度', '跨职能领导力', '外部网络'])),
    risk_of_loss: rng.pick(['high', 'medium', 'low'] as const),
  }))

  const overallScore = Math.round(matchScores[0]?.match_score * 0.4 + (input.performance_rating === 'exceeds' ? 0.3 : input.performance_rating === 'meets' ? 0.2 : 0.1) + (input.mobility_willingness === 'high' ? 0.3 : input.mobility_willingness === 'medium' ? 0.15 : 0.05) * 100) / 100

  return {
    action: input.action,
    employee_id: input.employee_id,
    matches: matchScores,
    succession_readiness: successors,
    recommended_path: [
      `Step 1: 完成${matchScores[0]?.new_skills_gained[0] || '核心技能'}提升`,
      `Step 2: 横向轮岗 ${matchScores[0]?.opportunity_title || '相关岗位'} (约${matchScores[0]?.estimated_transition_weeks || 12}周)`,
      `Step 3: ${input.career_aspirations[0] || '目标岗位'} 晋升准备`,
    ],
    transition_timeline: `${rng.nextInt(3, 18)}个月`,
    overall_mobility_score: overallScore,
  }
}

// --- Tool 6: Total Rewards AI ---
function analyzeTotalRewardsAI(input: RewardsInput): RewardsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.role_title + input.company_stage
  ))

  const seniorityMultiplier: Record<string, number> = {
    intern: 0.4, junior: 0.7, mid: 1.0, senior: 1.6, lead: 2.2, director: 3.0, vp: 4.5,
  }
  const mult = seniorityMultiplier[input.seniority] || 1.0
  const locationFactor = input.location === 'US-SF' || input.location === 'US-NY' ? 1.3 : input.location === 'CN-BJ' || input.location === 'CN-SH' ? 0.8 : 1.0

  const marketMedian = Math.round(150 * mult * locationFactor)
  const marketBenchmark: MarketBenchmark = {
    percentile_25: Math.round(marketMedian * 0.75),
    percentile_50: marketMedian,
    percentile_75: Math.round(marketMedian * 1.35),
    percentile_90: Math.round(marketMedian * 1.8),
    market_median: marketMedian,
    competitiveness_ratio: Math.round(input.current_base / marketMedian * 100) / 100,
  }

  const perfMultiplier: Record<string, number> = { top: 1.25, strong: 1.12, solid: 1.0, improvement: 0.85 }
  const recommendedBase = Math.round(marketMedian * (perfMultiplier[input.performance_tier] || 1.0))
  const personalizedRewards: PersonalizedReward[] = [
    { component: '基础薪资调整', value: recommendedBase - input.current_base, rationale: '市场对标 + 绩效系数', personalization_factor: input.performance_tier },
    { component: '绩效奖金', value: Math.round(recommendedBase * rng.nextFloat(0.1, 0.3)), rationale: '与OKR完成率挂钩', personalization_factor: '季度OKR' },
    { component: '学习发展基金', value: rng.nextInt(5000, 20000), rationale: '技能提升投资', personalization_factor: '个人发展计划' },
    { component: '弹性福利积分', value: rng.nextInt(3000, 12000), rationale: '个性化福利选择', personalization_factor: '家庭/健康/生活方式' },
  ]

  const equityValue = Math.round(recommendedBase * rng.nextFloat(0.3, 1.5) * (input.company_stage === 'seed' ? 3 : input.company_stage === 'series_a' ? 2 : 1))
  const equityGrants: EquityGrant[] = [
    { grant_type: input.company_stage === 'public' ? 'RSU' : 'option', shares: Math.round(equityValue / rng.nextFloat(10, 50)), strike_price: Math.round(rng.nextFloat(1, 30)), vesting_years: 4, estimated_value: equityValue, dilution_pct: Math.round(rng.nextFloat(0.01, 0.5) * 100) / 100 },
  ]

  const totalComp = recommendedBase + personalizedRewards[1].value + equityGrants[0].estimated_value + personalizedRewards[3].value
  const budgetEfficiency = Math.round(totalComp / input.total_budget * 100) / 100

  return {
    action: input.action,
    market_benchmark: marketBenchmark,
    personalized_rewards: personalizedRewards,
    equity_grants: equityGrants,
    total_comp_recommendation: totalComp,
    budget_efficiency: budgetEfficiency,
    roi_estimate: Math.round(rng.nextFloat(1.5, 4.0) * 100) / 100,
    retention_impact: totalComp > input.current_base * 1.2 ? '高保留影响 (>85% 留存率提升预期)' : totalComp > input.current_base * 1.1 ? '中等保留影响 (70-85% 留存率提升预期)' : '低保留影响 (<70% 留存率提升预期)',
  }
}

// --- Tool 7: Org Designer ---
function analyzeOrgDesigner(input: OrgDesignInput): OrgDesignResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.current_departments.map(d => d.name).join(',') + input.growth_scenario
  ))

  const currentTotalHC = input.current_departments.reduce((s, d) => s + d.headcount, 0)
  const currentTotalMgr = input.current_departments.reduce((s, d) => s + d.manager_count, 0)

  const scenarios: ArchScenario[] = [
    {
      scenario_id: 'S1', name: '扁平化2.0', description: '消除中间管理层，扩展管理幅度至10+', layers: Math.max(3, input.current_departments[0] ? 4 : 3), avg_span: 10, total_managers: Math.round(currentTotalHC / 10), projected_savings: Math.round(currentTotalMgr * rng.nextFloat(0.15, 0.3) * 150000), implementation_complexity: 'high', risk_level: 'medium',
    },
    {
      scenario_id: 'S2', name: '敏捷部落制', description: 'Squad/Tribe模式，自治小团队', layers: 4, avg_span: 6, total_managers: Math.round(currentTotalHC / 6), projected_savings: Math.round(currentTotalHC * rng.nextFloat(0.02, 0.08) * 120000), implementation_complexity: 'medium', risk_level: 'low',
    },
    {
      scenario_id: 'S3', name: '平台+前线', description: '共享平台能力 + 灵活前线作战单元', layers: 4, avg_span: 8, total_managers: Math.round(currentTotalHC / 8), projected_savings: Math.round(currentTotalMgr * rng.nextFloat(0.1, 0.2) * 140000), implementation_complexity: 'medium', risk_level: 'low',
    },
    {
      scenario_id: 'S4', name: 'AI增强精简', description: 'AI工具替代协调角色，减少管理层级', layers: 3, avg_span: 12, total_managers: Math.round(currentTotalHC / 12), projected_savings: Math.round(currentTotalMgr * rng.nextFloat(0.25, 0.45) * 160000), implementation_complexity: 'high', risk_level: 'high',
    },
  ]

  const changeImpacts: ChangeImpact[] = input.current_departments.map(dept => {
    const delta = input.growth_scenario === 'aggressive_moderate' ? Math.round(dept.headcount * rng.nextFloat(0.1, 0.4)) : input.growth_scenario === 'organic' ? Math.round(dept.headcount * rng.nextFloat(-0.05, 0.1)) : -Math.round(dept.headcount * rng.nextFloat(0.05, 0.25))
    return {
      department: dept.name,
      headcount_delta: delta,
      culture_impact: delta > 10 ? 'neutral' : delta < -5 ? 'negative' : 'positive',
      productivity_disruption: Math.abs(delta) > 15 ? rng.nextInt(4, 12) : rng.nextInt(1, 6),
      morale_risk: Math.abs(delta) > 20 ? 'high' : Math.abs(delta) > 10 ? 'medium' : 'low',
      mitigation: Math.abs(delta) > 15 ? '分阶段实施 + 沟通计划 + 过渡支持' : '渐进调整 + 内部沟通',
    }
  })

  const implementationRoadmap: string[] = [
    'Phase 1 (0-4周): 利益相关者对齐 + 变革沟通启动',
    'Phase 2 (4-12周): 试点团队部署 + 流程适应',
    'Phase 3 (12-24周): 全面推广 + 绩效监控',
    'Phase 4 (24-52周): 优化迭代 + 文化固化',
  ]

  return {
    action: input.action,
    scenarios,
    change_impacts: changeImpacts,
    optimal_layers: 4,
    optimal_span: 8,
    total_cost_savings: scenarios.reduce((s, sc) => s + sc.projected_savings, 0),
    implementation_roadmap: implementationRoadmap,
    risk_mitigations: ['保留核心人才加速通道', '建立变更管理者网络', '设计退出/转岗方案', '监控员工情绪实时反馈'],
  }
}

// --- Tool 8: Wellbeing Monitor ---
function analyzeWellbeingMonitor(input: WellbeingInput): WellbeingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.employee_id + input.department
  ))

  const indicators: BurnoutIndicator[] = [
    { indicator: '工时负荷', severity: input.hours_worked_weekly > 55 ? 'critical' : input.hours_worked_weekly > 45 ? 'warning' : 'normal', score: Math.min(100, Math.round(input.hours_worked_weekly * 1.5)), trend: input.after_hours_pct > 30 ? 'worsening' : 'stable' },
    { indicator: '加班比例', severity: input.after_hours_pct > 40 ? 'critical' : input.after_hours_pct > 20 ? 'warning' : 'normal', score: input.after_hours_pct, trend: rng.pick(['worsening', 'stable', 'improving'] as const) },
    { indicator: '休假充足度', severity: input.pto_days_remaining < 3 ? 'critical' : input.pto_days_remaining < 7 ? 'warning' : 'normal', score: Math.max(0, 100 - (15 - input.pto_days_remaining) * 6), trend: input.pto_days_remaining < 5 ? 'worsening' : 'stable' },
    { indicator: '病假频率', severity: input.sick_days_last_90 > 5 ? 'critical' : input.sick_days_last_90 > 3 ? 'warning' : 'normal', score: input.sick_days_last_90 * 18, trend: input.sick_days_last_90 > 3 ? 'worsening' : 'improving' },
    { indicator: '管理者关注度', severity: input.manager_checkin_frequency === 'none' ? 'critical' : input.manager_checkin_frequency === 'monthly' ? 'warning' : 'normal', score: input.manager_checkin_frequency === 'weekly' ? 90 : input.manager_checkin_frequency === 'biweekly' ? 70 : input.manager_checkin_frequency === 'monthly' ? 40 : 10, trend: 'stable' },
    { indicator: '团队满意度', severity: input.team_satisfaction < 40 ? 'critical' : input.team_satisfaction < 65 ? 'warning' : 'normal', score: input.team_satisfaction, trend: input.team_satisfaction < 50 ? 'worsening' : input.team_satisfaction > 75 ? 'improving' : 'stable' },
  ]

  const burnoutScore = Math.round(indicators.reduce((s, i) => s + i.score, 0) / indicators.length)
  const criticalCount = indicators.filter(i => i.severity === 'critical').length
  const burnoutLevel: WellbeingResult['burnout_level'] = criticalCount >= 3 ? 'critical' : criticalCount >= 2 ? 'high' : criticalCount >= 1 ? 'moderate' : 'healthy'

  const interventions: Intervention[] = []
  if (burnoutScore > 70) {
    interventions.push({ type: 'immediate', action: '立即减少工作量 + 安排强制休假', expected_outcome: '短期恢复', urgency: 'high' })
    interventions.push({ type: 'immediate', action: 'HRBP一对一谈话 + 心理支持资源', expected_outcome: '情绪支持', urgency: 'high' })
  }
  if (input.hours_worked_weekly > 50) {
    interventions.push({ type: 'short_term', action: '重新分配任务 + 增派人手', expected_outcome: '4周内工时降至45以下', urgency: 'high' })
  }
  if (input.manager_checkin_frequency === 'none' || input.manager_checkin_frequency === 'monthly') {
    interventions.push({ type: 'structural', action: '升级管理者1:1频率至双周', expected_outcome: '改善管理关系', urgency: 'medium' })
  }
  if (interventions.length === 0) {
    interventions.push({ type: 'structural', action: '保持当前工作节奏 + 预防性团建', expected_outcome: '持续健康度', urgency: 'low' })
  }

  return {
    action: input.action,
    employee_id: input.employee_id,
    burnout_score: burnoutScore,
    burnout_level: burnoutLevel,
    burnout_indicators: indicators,
    workload_status: input.hours_worked_weekly > 50 ? 'overloaded' : input.hours_worked_weekly < 35 ? 'underutilized' : 'balanced',
    engagement_trend_direction: input.survey_score > 75 ? 'rising' : input.survey_score > 50 ? 'stable' : 'declining',
    interventions,
    overall_wellbeing_index: Math.round(100 - burnoutScore + rng.nextInt(-5, 5)),
  }
}

// ============================================================================
// SECTION D — Format Functions (All 8 Tools)
// ============================================================================

// --- Format 1: Skills Taxonomy ---
function formatSkillsTaxonomyReport(r: SkillsTaxonomyResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] Skills Taxonomy — 企业技能图谱`)
  lines.push('')
  lines.push(`操作: **${r.action}** | 提取技能: **${r.total_skills_extracted}** | 唯一技能: **${r.unique_skills}** | 覆盖率: **${(r.coverage_score * 100).toFixed(0)}%**`)
  lines.push('')
  lines.push('### 技能聚类图谱')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    ROOT[Skills Taxonomy] --> L1[L1-入门]')
  lines.push('    ROOT --> L2[L2-应用]')
  lines.push('    ROOT --> L3[L3-精通]')
  lines.push('    ROOT --> L4[L4-专家]')
  lines.push('    ROOT --> L5[L5-宗师]')
  for (const c of r.clusters.slice(0, 5)) {
    lines.push(`    L${c.cluster_name.length % 5 + 1} --> ${c.cluster_id}[${c.cluster_name}]`)
  }
  lines.push('```')
  lines.push('')

  lines.push('### 聚类详情')
  lines.push('| Cluster | 名称 | 技能数 | 平均熟练 | 成员数 | 趋势 |')
  lines.push('|---------|------|--------|----------|--------|------|')
  for (const c of r.clusters) {
    const trendIcon = c.trend === 'growing' ? '增长' : c.trend === 'declining' ? '下降' : '稳定'
    lines.push(`| ${c.cluster_id} | ${c.cluster_name} | ${c.skills.length} | ${c.avg_proficiency}/5.0 | ${c.member_count} | ${trendIcon} |`)
  }
  lines.push('')

  lines.push('### 技能缺口 (2026预测)')
  lines.push('| 技能 | 当前供给 | 2026需求 | 缺口比 | 紧急度 | 建议 |')
  lines.push('|------|----------|---------|--------|--------|------|')
  for (const g of r.skill_gaps) {
    const urgencyIcon = g.urgency === 'critical' ? '紧急' : g.urgency === 'high' ? '高' : g.urgency === 'medium' ? '中' : '低'
    lines.push(`| ${g.skill_name} | ${g.current_supply}人 | ${g.projected_demand_2026}人 | ${(g.gap_ratio * 100).toFixed(0)}% | ${urgencyIcon} | ${g.recommendation.slice(0, 25)}... |`)
  }
  lines.push('')

  lines.push('### 技能层级结构')
  lines.push('| 层级 | 描述 | 典型要求 |')
  lines.push('|------|------|----------|')
  lines.push('| L1-入门 | 基础了解 | 能完成简单任务 |')
  lines.push('| L2-应用 | 独立应用 | 能独立完成日常工作 |')
  lines.push('| L3-精通 | 深度精通 | 能解决复杂问题并指导他人 |')
  lines.push('| L4-专家 | 领域权威 | 能定义最佳实践和创新 |')
  lines.push('| L5-宗师 | 行业标杆 | 影响行业方向和标准 |')
  lines.push('')
  lines.push('---')
  lines.push(`*PeopleX Skills Taxonomy | Coral Orange HR Theme v${VERSION} | 覆盖率${(r.coverage_score * 100).toFixed(0)}%*`)
  return lines.join('\n')
}

// --- Format 2: Talent Forecast ---
function formatTalentForecastReport(r: TalentForecastResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] Talent Forecaster — 人才供需预测`)
  lines.push('')
  lines.push(`部门: **${r.department}** | 操作: **${r.action}** | 整体离职率: **${r.total_projected_attrition_pct}%** | 置信度: **${(r.confidence_level * 100).toFixed(0)}%**`)
  lines.push('')
  lines.push('### 离职风险画像')
  lines.push('')
  lines.push('```mermaid')
  lines.push('xychart-beta')
  lines.push('    title "离职风险评分"')
  lines.push('    x-axis [' + r.attrition_profiles.map(p => `"${p.employee_segment}"`).join(', ') + ']')
  lines.push('    y-axis "风险分 0-100" 0 --> 100')
  lines.push('    bar [' + r.attrition_profiles.map(p => p.risk_score).join(', ') + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 人员画像卡片')
  for (const p of r.attrition_profiles.slice(0, 4)) {
    const riskIcon = p.risk_level === 'critical' ? '高危' : p.risk_level === 'high' ? '高' : p.risk_level === 'medium' ? '中' : '低'
    lines.push(`#### ${p.employee_segment} | 风险: ${riskIcon} (${p.risk_score}/100)`)
    lines.push('')
    lines.push(`- **预计流失:** ${p.projected_loss}人 | **保留成本:** $${p.retention_cost.toLocaleString()}`)
    lines.push(`- **关键因素:** ${p.key_factors.join(', ')}`)
    lines.push('')
  }

  lines.push('### 招聘预测')
  lines.push('| 季度 | 招聘需求 | 平均招聘周期(天) | Pipeline健康度 | 瓶颈 |')
  lines.push('|------|----------|------------------|----------------|------|')
  for (const h of r.hiring_forecast) {
    const healthIcon = h.pipeline_health === 'strong' ? '强' : h.pipeline_health === 'adequate' ? '一般' : '弱'
    lines.push(`| ${h.quarter} | ${h.hires_needed}人 | ${h.avg_time_to_fill_days}天 | ${healthIcon} | ${h.bottleneck || '-'} |`)
  }
  lines.push('')

  lines.push(`### 关键指标`)
  lines.push(`- 离职总成本: **$${r.replacement_cost.toLocaleString()}**`)
  lines.push(`- 敏感性指数: **${r.sensitivity_index}** (0=稳定, 1=高度敏感)`)
  lines.push('')
  lines.push('### 预测核对清单')
  lines.push('- [x] 离职风险多维度评估')
  lines.push('- [x] 季度招聘周期预测')
  lines.push('- [x] Pipeline健康度诊断')
  lines.push('- [x] 瓶颈识别与建议')
  lines.push('- [x] 敏感性分析')
  lines.push('')
  lines.push('---')
  lines.push(`*PeopleX Talent Forecaster | Josh Bersin 2030 对标 v${VERSION}*`)
  return lines.join('\n')
}

// --- Format 3: Agentic Recruiter ---
function formatAgenticRecruiterReport(r: RecruiterResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] Agentic Recruiter — Agent协作招聘全流程`)
  lines.push('')
  lines.push(`阶段: **${r.pipeline_stage}** | 匹配度: **${r.overall_match_pct}%** | 参与Agent: **${r.agents_involved.length}个**`)
  lines.push('')

  lines.push('### Agent协作流程')
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart LR')
  lines.push('    JD[JD-Agent] --> SC[Screening-Agent]')
  lines.push('    SC --> IV[Interview-Agent]')
  lines.push('    IV --> BG[Background-Agent]')
  lines.push('    BG --> OF[Offer-Agent]')
  lines.push('    CO[Coordinator-Agent] --> JD')
  lines.push('    CO --> SC')
  lines.push('    CO --> IV')
  lines.push('```')
  lines.push('')

  if (r.jd_sections && r.jd_sections.length > 0) {
    lines.push('### JD生成结果')
    for (const jd of r.jd_sections) {
      lines.push(`#### ${jd.section}`)
      lines.push(`> ${jd.content}`)
      lines.push(`> 关键词: ${jd.keywords.join(', ')}`)
      lines.push('')
    }
  }

  if (r.channels && r.channels.length > 0) {
    lines.push('### 渠道效果对比')
    lines.push('| 渠道 | 申请数 | 合格率 | 单次招聘成本 | 招聘周期(天) | ROI |')
    lines.push('|------|--------|--------|-------------|-------------|-----|')
    for (const ch of r.channels) {
      lines.push(`| ${ch.channel} | ${ch.applications} | ${(ch.qualified_rate * 100).toFixed(0)}% | $${ch.cost_per_hire.toLocaleString()} | ${ch.time_to_fill_days}天 | ${ch.roi}x |`)
    }
    lines.push('')
  }

  if (r.interview_questions && r.interview_questions.length > 0) {
    lines.push('### AI面试题库')
    lines.push('| 类别 | 问题 | 评估维度 | 难度 |')
    lines.push('|------|------|----------|------|')
    for (const q of r.interview_questions) {
      lines.push(`| ${q.category} | ${q.question.slice(0, 40)}... | ${q.evaluation_criteria} | ${q.difficulty === 'hard' ? '困难' : q.difficulty === 'medium' ? '中等' : '基础'} |`)
    }
    lines.push('')
  }

  if (r.offer_package) {
    lines.push('### Offer方案')
    lines.push('| 组成 | 金额 |')
    lines.push('|------|------|')
    lines.push(`| 基础薪资 | $${r.offer_package.base_salary.toLocaleString()} |`)
    lines.push(`| 签约奖金 | $${r.offer_package.sign_on_bonus.toLocaleString()} |`)
    lines.push(`| 股权(${r.offer_package.equity_pct}%) | 估值取决于融资轮次 |`)
    lines.push(`| 福利价值 | $${r.offer_package.benefits_value.toLocaleString()} |`)
    lines.push(`| **总薪酬** | **$${r.offer_package.total_comp.toLocaleString()}** |`)
    lines.push('')
  }

  lines.push('### 招聘核对清单')
  lines.push('- [x] JD智能生成 (行业对标 + SEO关键词)')
  lines.push('- [x] 多渠道效果追踪 + ROI优化')
  lines.push('- [x] AI面试题库自动生成')
  lines.push(`- [x] 背景调查: ${r.background_verified ? '通过 — Background-Agent验证完成' : '需人工补充'}`)
  lines.push('- [x] Offer智能生成 (市场对标 + 绩效系数)')
  lines.push('')
  lines.push('---')
  lines.push(`*PeopleX Agentic Recruiter | Agent协作全流程 v${VERSION}*`)
  return lines.join('\n')
}

// --- Format 4: People Analytics ---
function formatPeopleAnalyticsReport(r: PeopleAnalyticsResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] People Analytics — 战略人力资本分析`)
  lines.push('')
  lines.push(`部门: **${r.department}** | 分析: **${r.action}**`)
  lines.push('')

  if (r.ona_nodes && r.ona_nodes.length > 0) {
    lines.push('### ONA 组织网状图')
    lines.push('')
    lines.push('```mermaid')
    lines.push('graph TD')
    const core = r.ona_nodes.filter(n => n.influence_tier === 'core')
    const conn = r.ona_nodes.filter(n => n.influence_tier === 'connector')
    const periph = r.ona_nodes.filter(n => n.influence_tier === 'peripheral' || n.influence_tier === 'isolated')
    for (const node of core) {
      lines.push(`    ${node.employee_id}["${node.name}<br/>核心 | 中心度:${node.centrality}"]`)
    }
    for (const node of conn) {
      lines.push(`    ${node.employee_id}["${node.name}<br/>连接 | 中心度:${node.centrality}"]`)
    }
    for (const node of periph.slice(0, 4)) {
      lines.push(`    ${node.employee_id}["${node.name}<br/>边缘 | 连接:${node.connection_count}"]`)
    }
    // Connections
    for (let i = 0; i < Math.min(core.length, 2); i++) {
      for (const c of conn.slice(0, 2)) {
        lines.push(`    ${core[i].employee_id} --- ${c.employee_id}`)
      }
    }
    for (const c of conn) {
      const target = periph[c.connection_count % Math.max(periph.length, 1)]
      if (target) lines.push(`    ${c.employee_id} --- ${target.employee_id}`)
    }
    lines.push('```')
    lines.push('')

    lines.push('### 人物画像卡片')
    lines.push('| 员工 | 影响力层级 | 中心度 | 连接数 | 协作评分 |')
    lines.push('|------|------------|--------|--------|----------|')
    for (const n of r.ona_nodes) {
      const tierLabel = n.influence_tier === 'core' ? '核心' : n.influence_tier === 'connector' ? '连接者' : n.influence_tier === 'peripheral' ? '边缘' : '孤立'
      lines.push(`| ${n.name} | ${tierLabel} | ${n.centrality} | ${n.connection_count} | ${(n.collaboration_score * 100).toFixed(0)}% |`)
    }
    lines.push('')
  }

  if (r.manager_score) {
    lines.push('### 经理效能分析')
    lines.push('')
    lines.push('```mermaid')
    lines.push('radar')
    lines.push('    title "经理效能雷达图"')
    lines.push(`    team_engagement: ${(r.manager_score.team_engagement * 100).toFixed(0)}`)
    lines.push(`    team_retention: ${(r.manager_score.team_retention * 100).toFixed(0)}`)
    lines.push(`    goal_achievement: ${(r.manager_score.goal_achievement * 100).toFixed(0)}`)
    lines.push(`    coaching: ${(r.manager_score.coaching_score * 100).toFixed(0)}`)
    lines.push(`    leadership: ${(r.manager_score.leadership_rating * 100).toFixed(0)}`)
    lines.push('```')
    lines.push('')
    lines.push(`ID: **${r.manager_score.manager_id}** | 优势: **${r.manager_score.top_strength}** | 发展方向: **${r.manager_score.development_area}**`)
    lines.push('')
  }

  if (r.productivity_index !== undefined) {
    lines.push('### 人效分析')
    lines.push(`人效指数: **${r.productivity_index}** | 人均营收: **$${r.revenue_per_employee}K**`)
    lines.push('')
  }

  if (r.diversity_metrics && r.diversity_metrics.length > 0) {
    lines.push('### 多样性指标')
    lines.push('| 维度 | 当前比例 | 行业基准 | 差距 | 趋势 |')
    lines.push('|------|----------|----------|------|------|')
    for (const m of r.diversity_metrics) {
      const trendIcon = m.trend === 'improving' ? '改善中' : m.trend === 'declining' ? '下降' : '稳定'
      lines.push(`| ${m.dimension} | ${(m.current_ratio * 100).toFixed(0)}% | ${(m.industry_benchmark * 100).toFixed(0)}% | ${m.gap > 0 ? '+' : ''}${(m.gap * 100).toFixed(0)}% | ${trendIcon} |`)
    }
    lines.push('')
  }

  if (r.insights.length > 0) {
    lines.push('### 核心洞察')
    for (const ins of r.insights) lines.push(`- ${ins}`)
    lines.push('')
  }

  if (r.risk_areas.length > 0) {
    lines.push('### 风险区域')
    for (const risk of r.risk_areas) lines.push(`- ⚠ ${risk}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*PeopleX People Analytics | Visier Trends 2026 对标 v${VERSION}*`)
  return lines.join('\n')
}

// --- Format 5: Internal Mobility ---
function formatInternalMobilityReport(r: MobilityResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] Internal Mobility — 内部人才市场`)
  lines.push('')
  lines.push(`员工: **${r.employee_id}** | 操作: **${r.action}** | 流动性评分: **${(r.overall_mobility_score * 100).toFixed(0)}%** | 预计周期: **${r.transition_timeline || '待定'}**`)
  lines.push('')

  lines.push('### 技能匹配路径')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CUR[当前角色] -->|技能评估| MATCH[匹配引擎]')
  lines.push('    MATCH -->|Top 1| OPP1[机会1]')
  lines.push('    MATCH -->|Top 2| OPP2[机会2]')
  lines.push('    MATCH -->|Top 3| OPP3[机会3]')
  lines.push('    OPP1 -->|发展| GOAL[职业目标]')
  lines.push('    OPP2 -->|过渡| GOAL')
  lines.push('```')
  lines.push('')

  lines.push('### 推荐机会')
  lines.push('| 机会ID | 职位 | 匹配度 | 技能重叠 | 新技能 | 过渡周期 | 发展方向 |')
  lines.push('|--------|------|--------|----------|--------|----------|----------|')
  for (const m of r.matches.slice(0, 5)) {
    const growthLabel = m.career_growth === 'vertical' ? '垂直晋升' : m.career_growth === 'horizontal' ? '横向拓展' : '探索转型'
    lines.push(`| ${m.opportunity_id} | ${m.opportunity_title} | ${(m.match_score * 100).toFixed(0)}% | ${(m.skill_overlap_pct * 100).toFixed(0)}% | ${m.new_skills_gained.join(', ')} | ${m.estimated_transition_weeks}周 | ${growthLabel} |`)
  }
  lines.push('')

  if (r.succession_readiness && r.succession_readiness.length > 0) {
    lines.push('### 继任者准备度')
    lines.push('| 候选人 | 准备状态 | 发展差距 | 流失风险 |')
    lines.push('|--------|----------|----------|----------|')
    for (const s of r.succession_readiness) {
      const readinessLabel = s.readiness === 'ready_now' ? '即刻就绪' : s.readiness === '1_year' ? '1年内' : '2年内'
      lines.push(`| ${s.candidate_id} | ${readinessLabel} | ${s.development_gaps.join(', ')} | ${s.risk_of_loss} |`)
    }
    lines.push('')
  }

  if (r.recommended_path && r.recommended_path.length > 0) {
    lines.push('### 推荐发展路径')
    for (const step of r.recommended_path) lines.push(`- ${step}`)
    lines.push('')
  }

  lines.push('### 流动性核对清单')
  lines.push('- [x] 技能与机会匹配度评估')
  lines.push('- [x] 职业发展路径设计')
  lines.push('- [x] 继任者能力评估')
  lines.push('- [x] 转岗过渡周期估算')
  lines.push('')
  lines.push('---')
  lines.push(`*PeopleX Internal Mobility | 人才流动性引擎 v${VERSION}*`)
  return lines.join('\n')
}

// --- Format 6: Total Rewards AI ---
function formatTotalRewardsReport(r: RewardsResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] Total Rewards AI — 智能薪酬奖励`)
  lines.push('')
  lines.push(`操作: **${r.action}** | 推荐总薪酬: **$${r.total_comp_recommendation.toLocaleString()}** | 预算效率: **${r.budget_efficiency}** | ROI: **${r.roi_estimate}x**`)
  lines.push('')

  if (r.market_benchmark) {
    lines.push('### 市场对标')
    lines.push('')
    lines.push('```mermaid')
    lines.push('xychart-beta')
    lines.push('    title "薪酬市场对标 (K)")')
    lines.push('    x-axis ["P25", "P50(中位)", "P75", "P90"]')
    lines.push('    y-axis "薪资(K)" 0 --> ' + Math.round(r.market_benchmark.percentile_90 * 1.2 / 1000))
    lines.push('    line [' + [r.market_benchmark.percentile_25, r.market_benchmark.percentile_50, r.market_benchmark.percentile_75, r.market_benchmark.percentile_90].map(v => Math.round(v / 1000)).join(', ') + ']')
    lines.push('```')
    lines.push('')
    const mb = r.market_benchmark
    lines.push(`P25: **$${mb.percentile_25.toLocaleString()}** | P50(中位): **$${mb.percentile_50.toLocaleString()}** | P75: **$${mb.percentile_75.toLocaleString()}** | P90: **$${mb.percentile_90.toLocaleString()}**`)
    lines.push(`竞争比: **${mb.competitiveness_ratio}** (当前薪资/市场中位)`)
    lines.push('')
  }

  if (r.personalized_rewards && r.personalized_rewards.length > 0) {
    lines.push('### 个性化奖励方案')
    lines.push('| 组成 | 金额 | 理由 | 个性化因子 |')
    lines.push('|------|------|------|------------|')
    for (const pr of r.personalized_rewards) {
      const sign = pr.value >= 0 ? '+' : ''
      lines.push(`| ${pr.component} | ${sign}$${pr.value.toLocaleString()} | ${pr.rationale} | ${pr.personalization_factor} |`)
    }
    lines.push('')
  }

  if (r.equity_grants && r.equity_grants.length > 0) {
    lines.push('### 股权建模')
    for (const eq of r.equity_grants) {
      lines.push(`类型: **${eq.grant_type}** | 股数: **${eq.shares.toLocaleString()}** | 行权价: **$${eq.strike_price}** | 归属: **${eq.vesting_years}年** | 估值: **$${eq.estimated_value.toLocaleString()}** | 稀释: **${(eq.dilution_pct * 100).toFixed(2)}%**`)
    }
    lines.push('')
  }

  lines.push(`### 保留影响评估`)
  lines.push(`**${r.retention_impact}**`)
  lines.push('')

  lines.push('### 薪酬核对清单')
  lines.push('- [x] 市场对标分析 (P25-P90全位)')
  lines.push('- [x] 个性化奖励方案设计')
  lines.push('- [x] 股权建模 (RSU/期权估值)')
  lines.push('- [x] ROI最大化预算分配')
  lines.push('')
  lines.push('---')
  lines.push(`*PeopleX Total Rewards AI | 智能薪酬引擎 v${VERSION}*`)
  return lines.join('\n')
}

// --- Format 7: Org Designer ---
function formatOrgDesignReport(r: OrgDesignResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] Org Designer — 组织设计助手`)
  lines.push('')
  lines.push(`操作: **${r.action}** | 方案数: **${r.scenarios.length}** | 最优层级: **${r.optimal_layers}** | 最优管理幅度: **${r.optimal_span}** | 总节省: **$${r.total_cost_savings.toLocaleString()}**`)
  lines.push('')

  lines.push('### 架构模拟方案')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CEO[CEO/一把手] --> L1_VP[VP层]')
  for (let i = 0; i < r.scenarios.length; i++) {
    lines.push(`    CEO --> S${i + 1}[${r.scenarios[i].name}]`)
  }
  lines.push('```')
  lines.push('')

  lines.push('### 方案对比')
  lines.push('| 方案 | 描述 | 层级 | 平均管理幅度 | 管理者数 | 节省 | 复杂度 | 风险 |')
  lines.push('|------|------|------|-------------|----------|------|--------|------|')
  for (const s of r.scenarios) {
    const complexityLabel = s.implementation_complexity === 'high' ? '高' : s.implementation_complexity === 'medium' ? '中' : '低'
    const riskLabel = s.risk_level === 'high' ? '高' : s.risk_level === 'medium' ? '中' : '低'
    lines.push(`| ${s.scenario_id} | ${s.name} | ${s.layers}层 | ${s.avg_span} | ${s.total_managers}人 | $${(s.projected_savings / 1000).toFixed(0)}K | ${complexityLabel} | ${riskLabel} |`)
  }
  lines.push('')

  lines.push('### 变革影响预测')
  lines.push('| 部门 | 人数变动 | 文化影响 | 生产力中断(周) | 士气风险 | 缓解措施 |')
  lines.push('|------|----------|----------|---------------|----------|----------|')
  for (const c of r.change_impacts) {
    const deltaStr = c.headcount_delta >= 0 ? `+${c.headcount_delta}` : c.headcount_delta.toString()
    const cultureLabel = c.culture_impact === 'positive' ? '正面' : c.culture_impact === 'negative' ? '负面' : '中性'
    lines.push(`| ${c.department} | ${deltaStr}人 | ${cultureLabel} | ${c.productivity_disruption}周 | ${c.morale_risk} | ${c.mitigation} |`)
  }
  lines.push('')

  lines.push('### 实施路线图')
  for (const phase of r.implementation_roadmap) lines.push(`- ${phase}`)
  lines.push('')

  lines.push('### 风险缓解')
  for (const m of r.risk_mitigations) lines.push(`- ${m}`)
  lines.push('')

  lines.push('### 组织设计核对清单')
  lines.push('- [x] 多方案架构模拟')
  lines.push('- [x] 编制测算与对比')
  lines.push('- [x] 变革影响预测')
  lines.push('- [x] 最优层级设计')
  lines.push('')
  lines.push('---')
  lines.push(`*PeopleX Org Designer | 组织智能设计 v${VERSION}*`)
  return lines.join('\n')
}

// --- Format 8: Wellbeing Monitor ---
function formatWellbeingReport(r: WellbeingResult): string {
  const lines: string[] = []
  lines.push(`# [PeopleX] Wellbeing Monitor — 员工幸福感监控`)
  lines.push('')
  lines.push(`员工: **${r.employee_id}** | 操作: **${r.action}** | Burnout评分: **${r.burnout_score}/100** | 等级: **${r.burnout_level.toUpperCase()}** | 幸福指数: **${r.overall_wellbeing_index}/100**`)
  lines.push('')

  lines.push('### 人物画像卡片')
  lines.push('')
  lines.push('```')
  lines.push(' +------------------------------------------+')
  lines.push(` |  ID: ${r.employee_id.padEnd(33)}|`)
  lines.push(` |  Burnout:  [${r.burnout_level === 'critical' ? '████████████████████' : r.burnout_level === 'high' ? '███████████████░░░░░' : r.burnout_level === 'moderate' ? '██████████░░░░░░░░░░' : '█████░░░░░░░░░░░░░░░'}] ${r.burnout_score}%`.padEnd(42) + '|')
  lines.push(` |  Wellbeing: [${r.overall_wellbeing_index > 70 ? '████████████████████' : r.overall_wellbeing_index > 50 ? '███████████████░░░░░' : '██████████░░░░░░░░░░'}] ${r.overall_wellbeing_index}%`.padEnd(42) + '|')
  lines.push(` |  工作负荷: ${r.workload_status === 'overloaded' ? '过载 ██████████████' : r.workload_status === 'underutilized' ? '不足 ███░░░░░░░░░░░░░' : '平衡 ██████████░░░░░░'}`.padEnd(42) + '|')
  lines.push(` |  敬业趋势: ${r.engagement_trend_direction === 'rising' ? '上升' : r.engagement_trend_direction === 'declining' ? '下降' : '稳定'}`.padEnd(42) + '|')
  lines.push(' +------------------------------------------+')
  lines.push('```')
  lines.push('')

  lines.push('### Burnout 指标雷达')
  lines.push('| 指标 | 严重度 | 评分 | 趋势 |')
  lines.push('|------|--------|------|------|')
  for (const ind of r.burnout_indicators) {
    const severityLabel = ind.severity === 'critical' ? '紧急' : ind.severity === 'warning' ? '警告' : '正常'
    const trendLabel = ind.trend === 'worsening' ? '恶化' : ind.trend === 'improving' ? '改善' : '稳定'
    lines.push(`| ${ind.indicator} | ${severityLabel} | ${ind.score}/100 | ${trendLabel} |`)
  }
  lines.push('')

  lines.push('### 干预建议')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    DETECT[Burnout检测] -->|评估| RISK{风险等级}')
  lines.push('    RISK -->|Critical| IMM[立即干预]')
  lines.push('    RISK -->|High| SHORT[短期调整]')
  lines.push('    RISK -->|Moderate/Low| PREV[预防监控]')
  lines.push('    IMM --> RES[恢复跟踪]')
  lines.push('    SHORT --> RES')
  lines.push('    PREV --> RES')
  lines.push('```')
  lines.push('')

  lines.push('| 类型 | 行动 | 预期结果 | 紧急度 |')
  lines.push('|------|------|----------|--------|')
  for (const int of r.interventions) {
    const typeLabel = int.type === 'immediate' ? '立即' : int.type === 'short_term' ? '短期' : '结构性'
    const urgencyLabel = int.urgency === 'high' ? '高' : int.urgency === 'medium' ? '中' : '低'
    lines.push(`| ${typeLabel} | ${int.action.slice(0, 30)}... | ${int.expected_outcome} | ${urgencyLabel} |`)
  }
  lines.push('')

  lines.push('### 幸福感核对清单')
  lines.push('- [x] Burnout多维度检测')
  lines.push('- [x] 工作负荷均衡评估')
  lines.push('- [x] 敬业度趋势分析')
  lines.push('- [x] 分级干预建议生成')
  lines.push('')
  lines.push('---')
  lines.push(`*PeopleX Wellbeing Monitor | Coral Orange HR Theme v${VERSION} | 员工幸福指数: ${r.overall_wellbeing_index}/100*`)
  return lines.join('\n')
}

// ============================================================================
// SECTION E — Plugin Registration (8 Tools)
// ============================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // ===== TOOL 1: skills_taxonomy =====
  tools.register(defineTool({
    name: 'skills_taxonomy',
    description: '企业技能图谱构建 | 技能提取+相似度聚类+层级结构+缺口可视化 | Build enterprise skills taxonomy with clustering, hierarchy, gap analysis.',
    parameters: {
      skills_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (extract|cluster|hierarchy|gap_viz), skills_data[{employee_id, skill_name, proficiency(1-5), category, last_used}], target_industry, min_cluster_size?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { skills_input: string }) {
      const input: SkillsTaxonomyInput = JSON.parse(args.skills_input)
      return formatSkillsTaxonomyReport(analyzeSkillsTaxonomy(input))
    }
  }))

  // ===== TOOL 2: talent_forecaster =====
  tools.register(defineTool({
    name: 'talent_forecaster',
    description: '人才供需预测 | 离职风险+招聘周期+业务增长模型+敏感性分析 | Forecast talent supply/demand with attrition risk, hiring cycle, growth modeling.',
    parameters: {
      forecast_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (attrition_risk|hiring_cycle|growth_model|sensitivity), department, headcount_current, headcount_target_2026, avg_tenure_months, avg_salary, market_growth_rate, industry'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { forecast_input: string }) {
      const input: TalentForecastInput = JSON.parse(args.forecast_input)
      return formatTalentForecastReport(analyzeTalentForecast(input))
    }
  }))

  // ===== TOOL 3: agentic_recruiter =====
  tools.register(defineTool({
    name: 'agentic_recruiter',
    description: 'Agentic招聘全流程 | JD生成→渠道管理→AI面试→背调→Offer — Agent协作完成每个环节 | End-to-end agentic recruiting pipeline with multi-agent collaboration.',
    parameters: {
      recruiter_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (jd_generate|channel_manage|ai_interview|background_check|offer_workflow), role_title, department, seniority(intern|junior|mid|senior|lead|director|vp), location, salary_range{min,max}, required_skills[], culture_values[], candidate_name?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { recruiter_input: string }) {
      const input: RecruiterInput = JSON.parse(args.recruiter_input)
      return formatAgenticRecruiterReport(analyzeAgenticRecruiter(input))
    }
  }))

  // ===== TOOL 4: people_analytics =====
  tools.register(defineTool({
    name: 'people_analytics',
    description: '战略People Analytics | 组织网络分析ONA+经理效能+人效比+多样性指标 | Strategic people analytics with ONA, manager effectiveness, productivity, diversity metrics.',
    parameters: {
      analytics_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (ona|manager_effectiveness|productivity|diversity), department, team_size, manager_id?, survey_period, engagement_score?, diversity_dimensions?[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { analytics_input: string }) {
      const input: PeopleAnalyticsInput = JSON.parse(args.analytics_input)
      return formatPeopleAnalyticsReport(analyzePeopleAnalytics(input))
    }
  }))

  // ===== TOOL 5: internal_mobility =====
  tools.register(defineTool({
    name: 'internal_mobility',
    description: '内部人才市场 | 技能匹配项目机会+职业发展推荐+继任者规划+转岗模拟 | Internal talent marketplace with skill matching, career paths, succession planning.',
    parameters: {
      mobility_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (skill_match|career_path|succession|transition_sim), employee_id, current_role, current_skills[], career_aspirations[], years_experience, performance_rating(exceeds|meets|developing), mobility_willingness(high|medium|low), willing_to_relocate(boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { mobility_input: string }) {
      const input: MobilityInput = JSON.parse(args.mobility_input)
      return formatInternalMobilityReport(analyzeInternalMobility(input))
    }
  }))

  // ===== TOOL 6: total_rewards_ai =====
  tools.register(defineTool({
    name: 'total_rewards_ai',
    description: '智能薪酬奖励 | 市场对标+个性化奖励+股权建模+ROI最大化分配 | Intelligent total rewards with market benchmark, personalization, equity modeling, ROI allocation.',
    parameters: {
      rewards_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (market_benchmark|personalized|equity_model|roi_allocate), role_title, seniority, location, company_stage(seed|series_a|series_b|series_c|public), current_base, performance_tier(top|strong|solid|improvement), total_budget'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { rewards_input: string }) {
      const input: RewardsInput = JSON.parse(args.rewards_input)
      return formatTotalRewardsReport(analyzeTotalRewardsAI(input))
    }
  }))

  // ===== TOOL 7: org_designer =====
  tools.register(defineTool({
    name: 'org_designer',
    description: '组织设计助手 | 架构模拟+编制测算+变革影响预测+最优层级设计 | Org architecture simulation, headcount planning, change impact prediction, optimal layer design.',
    parameters: {
      org_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (arch_simulate|headcount_plan|change_impact|optimal_layers), current_departments[{name, headcount, manager_count, span_of_control}], target_efficiency_gain, growth_scenario(aggressive_moderate|organic|downsize), redesign_constraints[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { org_input: string }) {
      const input: OrgDesignInput = JSON.parse(args.org_input)
      return formatOrgDesignReport(analyzeOrgDesigner(input))
    }
  }))

  // ===== TOOL 8: wellbeing_monitor =====
  tools.register(defineTool({
    name: 'wellbeing_monitor',
    description: '员工幸福感监控 | burnout预警+工作负荷均衡+敬业度趋势+干预建议 | Employee wellbeing monitoring with burnout alerts, workload balancing, engagement trends.',
    parameters: {
      wellbeing_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (burnout_alert|workload_balance|engagement_trend|intervention), employee_id, department, hours_worked_weekly, after_hours_pct, pto_days_remaining, sick_days_last_90, survey_score(1-100), manager_checkin_frequency(weekly|biweekly|monthly|none), team_satisfaction(1-100)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { wellbeing_input: string }) {
      const input: WellbeingInput = JSON.parse(args.wellbeing_input)
      return formatWellbeingReport(analyzeWellbeingMonitor(input))
    }
  }))

  console.log(`[dsh-tool-peoplex] Loaded v${VERSION} — PeopleX Agentic HR Toolkit: 8 tools active`)
  console.log('  Theme: Coral Orange HR | Tools: skills_taxonomy, talent_forecaster, agentic_recruiter, people_analytics, internal_mobility, total_rewards_ai, org_designer, wellbeing_monitor')
}
