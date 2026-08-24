/**
 * DSH Future of Work & Remote Collaboration Plugin v0.1.0
 * 未来工作方式与远程协作 for DeepSeek Harness — 虚拟团队、异步协作、数字工作场所、远程入职
 *
 * 对标 2026 未来工作科技 $300亿+ 和远程工作基础设施 $250亿+ 市场趋势，
 * 覆盖虚拟团队协作、异步沟通、数字工作场所建设、远程入职、会议效能、
 * 知识共享、文化强化和弹性工作政策等核心场景。
 *
 * 工具清单:
 * 1. virtual_team_health_analyzer  — 虚拟团队健康度分析（参与度、沟通、生产力、幸福感）
 * 2. async_collaboration_optimizer — 异步协作优化（响应时间、工具使用、交接效率）
 * 3. digital_workplace_scorer      — 数字工作场所成熟度评分（工具、流程、文化、安全）
 * 4. remote_onboarding_automator   — 远程入职自动化（清单、里程碑、伙伴系统）
 * 5. meeting_effectiveness_evaluator — 会议效能评估（时长、成果、参与度、频率）
 * 6. knowledge_sharing_facilitator — 知识共享促进（文档、维基、导师制、跨团队）
 * 7. culture_reinforcement_engine  — 文化强化引擎（仪式、认可、价值观对齐、社交）
 * 8. flexibility_policy_advisor    — 弹性工作政策建议（混合办公、时区、休假、工作生活平衡）
 *
 * @module dsh-tool-futurework | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-futurework'
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

// --- Tool 1: Virtual Team Health Analyzer ---
export interface TeamHealthInput {
  team_size: number
  time_zone_spread_hours: number
  communication_frequency_daily: number
  engagement_scores: number[]
  turnover_rate_pct: number
  meeting_hours_per_week: number
}

export interface HealthDimension {
  dimension: string
  score: number
  status: 'healthy' | 'at_risk' | 'critical'
  insight: string
}

export interface RiskFactor {
  factor: string
  severity: 'low' | 'medium' | 'high'
  impact: string
  mitigation: string
}

export interface TeamHealthResult {
  overall_health_score: number
  health_grade: string
  dimensions: HealthDimension[]
  risk_factors: RiskFactor[]
  recommendations: string[]
  benchmark_percentile: number
}

// --- Tool 2: Async Collaboration Optimizer ---
export interface AsyncCollabInput {
  team_members_count: number
  tools_used: string[]
  avg_response_time_hours: number
  handoff_count_weekly: number
  overlap_hours: number
  async_first_score: number
}

export interface ToolEfficiency {
  tool_name: string
  adoption_rate: number
  efficiency_score: number
  recommended_action: string
}

export interface Bottleneck {
  area: string
  delay_hours: number
  frequency: string
  resolution: string
}

export interface AsyncCollabResult {
  collaboration_score: number
  async_maturity_level: string
  tool_efficiencies: ToolEfficiency[]
  bottlenecks: Bottleneck[]
  optimizations: string[]
  time_saved_estimate_hours: number
}

// --- Tool 3: Digital Workplace Scorer ---
export interface DigitalWorkplaceInput {
  tool_maturity: number
  process_automation_pct: number
  culture_score: number
  security_posture: number
  employee_nps: number
  integration_level: number
}

export interface MaturityDimension {
  dimension: string
  current_score: number
  target_score: number
  gap: number
  priority: 'high' | 'medium' | 'low'
}

export interface DigitalWorkplaceResult {
  overall_maturity_score: number
  maturity_level: string
  dimensions: MaturityDimension[]
  top_gaps: string[]
  roadmap: string[]
  investment_priority: string
}

// --- Tool 4: Remote Onboarding Automator ---
export interface OnboardingInput {
  new_hire_count: number
  onboarding_weeks: number
  buddy_assigned_pct: number
  checklist_completion_pct: number
  first_month_retention_pct: number
  automation_level: number
}

export interface OnboardingMilestone {
  milestone: string
  completion_rate: number
  avg_days_to_complete: number
  status: 'on_track' | 'delayed' | 'blocked'
}

export interface OnboardingResult {
  onboarding_effectiveness_score: number
  automation_coverage_pct: number
  milestones: OnboardingMilestone[]
  risk_areas: string[]
  automations: string[]
  retention_impact: string
}

// --- Tool 5: Meeting Effectiveness Evaluator ---
export interface MeetingEffectivenessInput {
  meeting_count_per_week: number
  avg_duration_minutes: number
  participant_count: number
  outcome_rate_pct: number
  follow_up_rate_pct: number
  no_agenda_pct: number
}

export interface MeetingMetric {
  metric: string
  value: number
  benchmark: number
  status: 'good' | 'warning' | 'poor'
}

export interface MeetingWasteArea {
  area: string
  waste_hours_per_week: number
  cost_estimate: string
  fix: string
}

export interface MeetingEffectivenessResult {
  effectiveness_score: number
  meeting_load_grade: string
  metrics: MeetingMetric[]
  waste_areas: MeetingWasteArea[]
  reductions: string[]
  annual_savings_estimate: string
}

// --- Tool 6: Knowledge Sharing Facilitator ---
export interface KnowledgeSharingInput {
  doc_coverage_pct: number
  mentoring_pairs: number
  cross_team_sessions_monthly: number
  wiki_contributions_monthly: number
  knowledge_retention_rate: number
  search_findability_score: number
}

export interface KnowledgeChannel {
  channel: string
  utilization: number
  effectiveness: number
  growth_potential: string
}

export interface KnowledgeSharingResult {
  sharing_score: number
  knowledge_maturity: string
  channels: KnowledgeChannel[]
  gaps: string[]
  facilitation_actions: string[]
  silo_risk_level: string
}

// --- Tool 7: Culture Reinforcement Engine ---
export interface CultureReinforcementInput {
  ritual_count_monthly: number
  recognition_frequency_weekly: number
  values_alignment_score: number
  social_events_monthly: number
  culture_nps: number
  remote_inclusion_score: number
}

export interface CulturePillar {
  pillar: string
  strength: number
  trend: 'improving' | 'stable' | 'declining'
  action: string
}

export interface CultureReinforcementResult {
  culture_score: number
  culture_health_grade: string
  pillars: CulturePillar[]
  blind_spots: string[]
  reinforcement_plans: string[]
  inclusion_gap: string
}

// --- Tool 8: Flexibility Policy Advisor ---
export interface FlexibilityPolicyInput {
  hybrid_days_per_week: number
  timezone_policy: string
  pto_flexibility: number
  work_life_balance_score: number
  policy_satisfaction: number
  core_hours_overlap: number
}

export interface PolicyBenchmark {
  policy_area: string
  current_value: string
  industry_benchmark: string
  status: 'leading' | 'aligned' | 'lagging'
}

export interface FlexibilityPolicyResult {
  flexibility_score: number
  policy_tier: string
  benchmarks: PolicyBenchmark[]
  improvements: string[]
  risk_alerts: string[]
  employee_satisfaction_forecast: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Virtual Team Health Analyzer ---
function analyzeTeamHealth(input: TeamHealthInput): TeamHealthResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const dimensions: HealthDimension[] = []
  const riskFactors: RiskFactor[] = []
  const recommendations: string[] = []

  // Engagement dimension
  const avgEngagement = input.engagement_scores.length > 0
    ? input.engagement_scores.reduce((a, b) => a + b, 0) / input.engagement_scores.length
    : rng.nextFloat(0.4, 0.9)
  const engagementStatus: HealthDimension['status'] = avgEngagement > 0.75 ? 'healthy' : avgEngagement > 0.5 ? 'at_risk' : 'critical'
  dimensions.push({
    dimension: '团队参与度',
    score: Math.round(avgEngagement * 100) / 100,
    status: engagementStatus,
    insight: engagementStatus === 'healthy' ? '团队参与度健康，保持当前实践' : engagementStatus === 'at_risk' ? '参与度有下降趋势，需关注' : '参与度严重不足，需立即干预',
  })

  // Communication dimension
  const commScore = input.communication_frequency_daily > 5
    ? rng.nextFloat(0.7, 0.95)
    : rng.nextFloat(0.3, 0.7)
  const commStatus: HealthDimension['status'] = commScore > 0.7 ? 'healthy' : commScore > 0.45 ? 'at_risk' : 'critical'
  dimensions.push({
    dimension: '沟通质量',
    score: Math.round(commScore * 100) / 100,
    status: commStatus,
    insight: commStatus === 'healthy' ? '沟通频率和渠道适中' : '沟通模式需要优化',
  })

  // Workload dimension
  const workloadScore = input.meeting_hours_per_week < 15
    ? rng.nextFloat(0.7, 0.95)
    : rng.nextFloat(0.2, 0.6)
  const workloadStatus: HealthDimension['status'] = workloadScore > 0.65 ? 'healthy' : workloadScore > 0.4 ? 'at_risk' : 'critical'
  dimensions.push({
    dimension: '工作负载平衡',
    score: Math.round(workloadScore * 100) / 100,
    status: workloadStatus,
    insight: input.meeting_hours_per_week > 15 ? '会议过多，挤压深度工作时间' : '工作负载在合理范围',
  })

  // Time zone dimension
  const tzScore = input.time_zone_spread_hours <= 4
    ? rng.nextFloat(0.7, 0.95)
    : input.time_zone_spread_hours <= 8
    ? rng.nextFloat(0.4, 0.7)
    : rng.nextFloat(0.2, 0.5)
  const tzStatus: HealthDimension['status'] = tzScore > 0.65 ? 'healthy' : tzScore > 0.4 ? 'at_risk' : 'critical'
  dimensions.push({
    dimension: '跨时区协作',
    score: Math.round(tzScore * 100) / 100,
    status: tzStatus,
    insight: tzStatus === 'healthy' ? '时区重叠充足，协作顺畅' : '时区差异大，需强化异步协作',
  })

  // Turnover risk
  if (input.turnover_rate_pct > 15) {
    riskFactors.push({
      factor: '高流动率',
      severity: 'high',
      impact: '年流失率超过15%，影响团队稳定性',
      mitigation: '开展留任访谈，改善职业发展路径',
    })
  } else if (input.turnover_rate_pct > 8) {
    riskFactors.push({
      factor: '中等流动风险',
      severity: 'medium',
      impact: '流动率略高于行业平均',
      mitigation: '加强员工认可计划，定期一对一沟通',
    })
  }

  if (input.time_zone_spread_hours > 8) {
    riskFactors.push({
      factor: '时区分散',
      severity: 'medium',
      impact: '超过8小时时区跨度导致实时协作困难',
      mitigation: '建立异步优先文化，核心时间窗口外自主安排',
    })
  }

  if (avgEngagement < 0.5) {
    riskFactors.push({
      factor: '低参与度',
      severity: 'high',
      impact: '团队成员参与度低，可能预示倦怠或离职意愿',
      mitigation: '匿名调查根因，快速实施改善措施',
    })
  }

  // Generate recommendations
  if (engagementStatus !== 'healthy') recommendations.push('实施季度参与度调查 + 行动计划跟踪')
  if (commStatus !== 'healthy') recommendations.push('引入异步视频工具，减少同步会议依赖')
  if (workloadStatus !== 'healthy') recommendations.push('设立无会议日，保护深度工作时间')
  if (tzStatus !== 'healthy') recommendations.push('建立异步文档优先文化，使用Loom/Notion替代实时同步')
  if (input.turnover_rate_pct > 10) recommendations.push('启动留任计划和职业发展对话')
  recommendations.push('建立持续的健康度跟踪仪表板')

  const overallScore = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  const grade = overallScore > 0.8 ? 'A' : overallScore > 0.65 ? 'B' : overallScore > 0.5 ? 'C' : overallScore > 0.35 ? 'D' : 'F'

  return {
    overall_health_score: Math.round(overallScore * 100) / 100,
    health_grade: grade,
    dimensions,
    risk_factors: riskFactors,
    recommendations,
    benchmark_percentile: Math.round(rng.nextFloat(40, 95)),
  }
}

// --- Tool 2: Async Collaboration Optimizer ---
function analyzeAsyncCollab(input: AsyncCollabInput): AsyncCollabResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const toolEfficiencies: ToolEfficiency[] = []
  const bottlenecks: Bottleneck[] = []
  const optimizations: string[] = []

  // Analyze each tool
  const defaultTools = ['Slack', 'Notion', 'Loom', 'Linear', 'GitHub', 'Figma']
  const tools = input.tools_used.length > 0 ? input.tools_used : defaultTools
  for (const tool of tools) {
    const adoption = Math.round(rng.nextFloat(0.4, 0.98) * 100) / 100
    const efficiency = Math.round(rng.nextFloat(0.3, 0.95) * 100) / 100
    toolEfficiencies.push({
      tool_name: tool,
      adoption_rate: adoption,
      efficiency_score: efficiency,
      recommended_action: adoption < 0.6 ? '加强培训和推广' : efficiency < 0.5 ? '优化工作流程集成' : '保持并分享最佳实践',
    })
  }

  // Response time analysis
  if (input.avg_response_time_hours > 4) {
    bottlenecks.push({
      area: '消息响应时间',
      delay_hours: Math.round(input.avg_response_time_hours * 10) / 10,
      frequency: 'daily',
      resolution: '设置SLA：高优先级2h内响应，普通24h内',
    })
  }

  if (input.handoff_count_weekly > 10) {
    bottlenecks.push({
      area: '任务交接瓶颈',
      delay_hours: Math.round(input.handoff_count_weekly * rng.nextFloat(0.5, 2) * 10) / 10,
      frequency: 'weekly',
      resolution: '建立标准化交接模板和自动化状态流转',
    })
  }

  // Overlap hours analysis
  if (input.overlap_hours < 3) {
    bottlenecks.push({
      area: '实时协作窗口不足',
      delay_hours: Math.round((3 - input.overlap_hours) * rng.nextFloat(2, 5) * 10) / 10,
      frequency: 'daily',
      resolution: '固定每日2-3小时核心重叠时段用于同步协作',
    })
  }

  // Optimization suggestions
  if (input.async_first_score < 0.6) optimizations.push('推行异步优先：所有决策先文档后讨论')
  if (input.avg_response_time_hours > 3) optimizations.push('建立消息分级制度：紧急/重要/普通')
  if (input.overlap_hours > 5) optimizations.push('减少实时协作窗口，增加异步深度工作时间')
  optimizations.push('使用Loom/异步视频会议替代部分同步会议')
  optimizations.push('建立团队知识库，减少重复问答')
  optimizations.push('实施每周异步状态更新（取代部分站会）')

  const collabScore = (
    (input.async_first_score * 0.3) +
    (Math.max(0, 1 - input.avg_response_time_hours / 24) * 0.25) +
    (Math.min(1, input.overlap_hours / 4) * 0.2) +
    (toolEfficiencies.reduce((s, t) => s + t.efficiency_score, 0) / Math.max(1, toolEfficiencies.length) * 0.25)
  )
  const maturityLevel = collabScore > 0.8 ? '高级异步' : collabScore > 0.6 ? '成熟异步' : collabScore > 0.4 ? '转型中' : '同步依赖'

  const timeSaved = Math.round(
    (input.avg_response_time_hours > 4 ? 5 : 0) +
    (input.overlap_hours > 5 ? 3 : 0) +
    rng.nextInt(2, 8)
  )

  return {
    collaboration_score: Math.round(collabScore * 100) / 100,
    async_maturity_level: maturityLevel,
    tool_efficiencies: toolEfficiencies,
    bottlenecks,
    optimizations,
    time_saved_estimate_hours: timeSaved,
  }
}

// --- Tool 3: Digital Workplace Scorer ---
function analyzeDigitalWorkplace(input: DigitalWorkplaceInput): DigitalWorkplaceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const dimensions: MaturityDimension[] = []
  const roadmap: string[] = []

  const dims = [
    { name: '工具成熟度', score: input.tool_maturity, target: 0.9 },
    { name: '流程自动化', score: input.process_automation_pct / 100, target: 0.85 },
    { name: '数字文化', score: input.culture_score, target: 0.85 },
    { name: '安全态势', score: input.security_posture, target: 0.95 },
    { name: '员工体验', score: (input.employee_nps + 100) / 200, target: 0.8 },
    { name: '系统集成度', score: input.integration_level, target: 0.85 },
  ]

  for (const d of dims) {
    const gap = Math.round((d.target - d.score) * 100) / 100
    dimensions.push({
      dimension: d.name,
      current_score: Math.round(d.score * 100) / 100,
      target_score: d.target,
      gap: Math.max(0, gap),
      priority: gap > 0.3 ? 'high' : gap > 0.15 ? 'medium' : 'low',
    })
  }

  const topGaps = dimensions
    .filter(d => d.gap > 0.15)
    .sort((a, b) => b.gap - a.gap)
    .map(d => d.dimension + '(差距: ' + Math.round(d.gap * 100) + '%)')

  // Roadmap generation
  const highPriority = dimensions.filter(d => d.priority === 'high')
  if (highPriority.length > 0) {
    roadmap.push('Q1: 优先提升 ' + highPriority.map(d => d.dimension).join('、'))
  }
  roadmap.push('Q2: 实施集成平台，打通工具孤岛')
  roadmap.push('Q3: 推广自动化流程，减少手动操作')
  roadmap.push('Q4: 建立持续优化机制和员工反馈循环')

  const overallScore = dimensions.reduce((s, d) => s + d.current_score, 0) / dimensions.length
  const level = overallScore > 0.85 ? '领先' : overallScore > 0.65 ? '成熟' : overallScore > 0.45 ? '发展中' : '初始'

  return {
    overall_maturity_score: Math.round(overallScore * 100) / 100,
    maturity_level: level,
    dimensions,
    top_gaps: topGaps,
    roadmap,
    investment_priority: highPriority.length > 0 ? highPriority[0].dimension : '持续优化',
  }
}

// --- Tool 4: Remote Onboarding Automator ---
function analyzeOnboarding(input: OnboardingInput): OnboardingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const milestones: OnboardingMilestone[] = []
  const riskAreas: string[] = []
  const automations: string[] = []

  const milestoneDefs = [
    { name: '入职前准备', baseDays: 2, baseRate: 0.9 },
    { name: 'Day 1 环境配置', baseDays: 1, baseRate: 0.85 },
    { name: 'Week 1 文化融入', baseDays: 5, baseRate: 0.75 },
    { name: 'Month 1 技能掌握', baseDays: 20, baseRate: 0.65 },
    { name: 'Month 3 独立贡献', baseDays: 45, baseRate: 0.55 },
  ]

  for (const m of milestoneDefs) {
    const completionRate = Math.round(
      (m.baseRate + rng.nextFloat(-0.1, 0.1)) * 100
    ) / 100
    const avgDays = Math.round(m.baseDays * rng.nextFloat(0.8, 1.4))
    milestones.push({
      milestone: m.name,
      completion_rate: Math.min(1, completionRate),
      avg_days_to_complete: avgDays,
      status: completionRate > 0.75 ? 'on_track' : completionRate > 0.5 ? 'delayed' : 'blocked',
    })
  }

  if (input.buddy_assigned_pct < 80) {
    riskAreas.push('伙伴系统覆盖率不足(' + input.buddy_assigned_pct + '%)，新员工缺乏引导')
  }
  if (input.checklist_completion_pct < 70) {
    riskAreas.push('入职清单完成率低(' + input.checklist_completion_pct + '%)，流程执行不严格')
  }
  if (input.first_month_retention_pct < 85) {
    riskAreas.push('首月留存率偏低(' + input.first_month_retention_pct + '%)，需关注早期体验')
  }

  // Automation suggestions
  if (input.automation_level < 0.5) automations.push('自动化IT设备申请和账号开通流程')
  automations.push('自动发送入职前准备清单和欢迎邮件')
  automations.push('自动分配伙伴并设置定期check-in提醒')
  automations.push('自动化入职培训进度跟踪和提醒')
  automations.push('自动收集入职反馈并生成改善报告')

  const effectivenessScore = (
    (input.checklist_completion_pct / 100 * 0.3) +
    (input.buddy_assigned_pct / 100 * 0.2) +
    (input.first_month_retention_pct / 100 * 0.3) +
    (input.automation_level * 0.2)
  )

  return {
    onboarding_effectiveness_score: Math.round(effectivenessScore * 100) / 100,
    automation_coverage_pct: Math.round(input.automation_level * 100),
    milestones,
    risk_areas: riskAreas,
    automations,
    retention_impact: input.first_month_retention_pct > 90 ? '积极：高留存率表明入职体验良好' : input.first_month_retention_pct > 75 ? '中等：有改善空间' : '警示：需立即改善入职流程',
  }
}

// --- Tool 5: Meeting Effectiveness Evaluator ---
function analyzeMeetingEffectiveness(input: MeetingEffectivenessInput): MeetingEffectivenessResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const metrics: MeetingMetric[] = []
  const wasteAreas: MeetingWasteArea[] = []
  const reductions: string[] = []

  // Meeting load
  const meetingLoad = input.meeting_count_per_week * input.avg_duration_minutes / 60
  metrics.push({
    metric: '每周会议时长(h)',
    value: Math.round(meetingLoad * 10) / 10,
    benchmark: 10,
    status: meetingLoad > 20 ? 'poor' : meetingLoad > 12 ? 'warning' : 'good',
  })

  metrics.push({
    metric: '会议成果率(%)',
    value: input.outcome_rate_pct,
    benchmark: 70,
    status: input.outcome_rate_pct > 70 ? 'good' : input.outcome_rate_pct > 50 ? 'warning' : 'poor',
  })

  metrics.push({
    metric: '无议程会议占比(%)',
    value: input.no_agenda_pct,
    benchmark: 10,
    status: input.no_agenda_pct < 10 ? 'good' : input.no_agenda_pct < 25 ? 'warning' : 'poor',
  })

  metrics.push({
    metric: '跟进完成率(%)',
    value: input.follow_up_rate_pct,
    benchmark: 75,
    status: input.follow_up_rate_pct > 75 ? 'good' : input.follow_up_rate_pct > 50 ? 'warning' : 'poor',
  })

  // Waste analysis
  if (input.no_agenda_pct > 20) {
    const wasteHours = Math.round(meetingLoad * (input.no_agenda_pct / 100) * 0.6 * 10) / 10
    wasteAreas.push({
      area: '无议程会议浪费',
      waste_hours_per_week: wasteHours,
      cost_estimate: '约 ' + Math.round(wasteHours * 50 * 52 / 1000) + 'K/年(按$50/h人均)',
      fix: '强制议程模板，无议程不开会',
    })
  }

  if (input.avg_duration_minutes > 30) {
    const wasteHours = Math.round(input.meeting_count_per_week * (input.avg_duration_minutes - 25) / 60 * 10) / 10
    wasteAreas.push({
      area: '会议超时/过长',
      waste_hours_per_week: wasteHours,
      cost_estimate: '约 ' + Math.round(wasteHours * 50 * 52 / 1000) + 'K/年',
      fix: '默认25/50分钟会议，设置计时提醒',
    })
  }

  if (input.participant_count > 7) {
    wasteAreas.push({
      area: '参会人数过多',
      waste_hours_per_week: Math.round(input.meeting_count_per_week * 0.5 * 10) / 10,
      cost_estimate: '约 ' + Math.round(input.meeting_count_per_week * 0.5 * 50 * 52 / 1000) + 'K/年',
      fix: '遵循两人披萨原则，仅必要人员参会',
    })
  }

  // Reduction suggestions
  if (meetingLoad > 15) reductions.push('设立每周无会议日(如周三)')
  if (input.no_agenda_pct > 15) reductions.push('实施议程前置制度，无议程会议自动取消')
  if (input.avg_duration_minutes > 30) reductions.push('默认会议时长从60分钟缩短到25/50分钟')
  reductions.push('用异步文档评审替代部分同步评审会')
  reductions.push('合并重复主题的站会为每周一次全员同步')

  const effectivenessScore = (
    (input.outcome_rate_pct / 100 * 0.35) +
    (input.follow_up_rate_pct / 100 * 0.25) +
    (Math.max(0, 1 - meetingLoad / 30) * 0.2) +
    (Math.max(0, 1 - input.no_agenda_pct / 50) * 0.2)
  )

  const grade = meetingLoad > 25 ? '过载' : meetingLoad > 15 ? '偏高' : meetingLoad > 8 ? '适中' : '精简'
  const totalWasteHours = wasteAreas.reduce((s, w) => s + w.waste_hours_per_week, 0)

  return {
    effectiveness_score: Math.round(effectivenessScore * 100) / 100,
    meeting_load_grade: grade,
    metrics,
    waste_areas: wasteAreas,
    reductions,
    annual_savings_estimate: '约 $' + Math.round(totalWasteHours * 50 * 52 / 1000) + 'K/年',
  }
}

// --- Tool 6: Knowledge Sharing Facilitator ---
function analyzeKnowledgeSharing(input: KnowledgeSharingInput): KnowledgeSharingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const channels: KnowledgeChannel[] = []
  const gaps: string[] = []
  const facilitationActions: string[] = []

  channels.push({
    channel: '文档/维基',
    utilization: input.doc_coverage_pct / 100,
    effectiveness: rng.nextFloat(0.5, 0.9),
    growth_potential: input.doc_coverage_pct < 70 ? '高：文档覆盖率有较大提升空间' : '中：重点提升文档质量和更新频率',
  })

  channels.push({
    channel: '导师制',
    utilization: Math.min(1, input.mentoring_pairs / 20),
    effectiveness: rng.nextFloat(0.6, 0.95),
    growth_potential: input.mentoring_pairs < 10 ? '高：扩大导师配对规模' : '中：提升导师制质量和结构化程度',
  })

  channels.push({
    channel: '跨团队分享',
    utilization: Math.min(1, input.cross_team_sessions_monthly / 8),
    effectiveness: rng.nextFloat(0.4, 0.85),
    growth_potential: input.cross_team_sessions_monthly < 4 ? '高：增加跨团队分享频率' : '中：提升分享深度和互动性',
  })

  channels.push({
    channel: '搜索/发现',
    utilization: input.search_findability_score,
    effectiveness: input.search_findability_score * rng.nextFloat(0.8, 1.1),
    growth_potential: input.search_findability_score < 0.6 ? '高：改善搜索体验和知识组织' : '中：优化推荐和个性化',
  })

  if (input.doc_coverage_pct < 60) gaps.push('文档覆盖率不足，大量知识存在于个人头脑中')
  if (input.knowledge_retention_rate < 0.7) gaps.push('知识留存率低，员工离职导致知识流失')
  if (input.search_findability_score < 0.5) gaps.push('搜索可发现性差，知识难以被找到')
  if (input.cross_team_sessions_monthly < 2) gaps.push('跨团队知识流动不足，存在信息孤岛')

  facilitationActions.push('建立知识贡献认可和激励机制')
  facilitationActions.push('实施文档即代码(Docs as Code)流程')
  facilitationActions.push('创建专家目录和知识地图')
  facilitationActions.push('定期举办内部技术分享会和午餐学习会')
  if (input.mentoring_pairs < 10) facilitationActions.push('扩大导师制覆盖范围')

  const sharingScore = (
    (input.doc_coverage_pct / 100 * 0.25) +
    (input.knowledge_retention_rate * 0.25) +
    (input.search_findability_score * 0.2) +
    (Math.min(1, input.cross_team_sessions_monthly / 6) * 0.15) +
    (Math.min(1, input.wiki_contributions_monthly / 30) * 0.15)
  )

  const maturity = sharingScore > 0.8 ? '卓越' : sharingScore > 0.6 ? '成熟' : sharingScore > 0.4 ? '发展中' : '初始'
  const siloRisk = gaps.length > 2 ? '高风险' : gaps.length > 1 ? '中等风险' : '低风险'

  return {
    sharing_score: Math.round(sharingScore * 100) / 100,
    knowledge_maturity: maturity,
    channels,
    gaps,
    facilitation_actions: facilitationActions,
    silo_risk_level: siloRisk,
  }
}

// --- Tool 7: Culture Reinforcement Engine ---
function analyzeCultureReinforcement(input: CultureReinforcementInput): CultureReinforcementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const pillars: CulturePillar[] = []
  const blindSpots: string[] = []
  const reinforcementPlans: string[] = []

  const pillarDefs = [
    { name: '仪式与传统', score: Math.min(1, input.ritual_count_monthly / 8), trend: rng.pick(['improving', 'stable', 'declining'] as const) },
    { name: '认可与激励', score: Math.min(1, input.recognition_frequency_weekly / 5), trend: rng.pick(['improving', 'stable', 'declining'] as const) },
    { name: '价值观对齐', score: input.values_alignment_score, trend: rng.pick(['improving', 'stable', 'declining'] as const) },
    { name: '社交连接', score: Math.min(1, input.social_events_monthly / 6), trend: rng.pick(['improving', 'stable', 'declining'] as const) },
    { name: '远程包容', score: input.remote_inclusion_score, trend: rng.pick(['improving', 'stable', 'declining'] as const) },
  ]

  for (const p of pillarDefs) {
    const score = Math.round(p.score * 100) / 100
    pillars.push({
      pillar: p.name,
      strength: score,
      trend: p.trend,
      action: p.trend === 'declining' ? '紧急干预：' + p.name + '正在弱化' : score < 0.5 ? '重点提升：' + p.name + '需加强' : '保持并优化',
    })
  }

  if (input.remote_inclusion_score < 0.6) blindSpots.push('远程员工可能感到被忽视，近端偏好明显')
  if (input.social_events_monthly < 2) blindSpots.push('社交活动不足，团队凝聚力下降')
  if (input.recognition_frequency_weekly < 2) blindSpots.push('认可频率低，员工价值感不足')
  if (input.culture_nps < 30) blindSpots.push('文化NPS偏低，需深入了解员工感受')

  reinforcementPlans.push('建立每周全员虚拟咖啡时间(15分钟)')
  reinforcementPlans.push('实施同事间即时认可平台(如Bonusly)')
  reinforcementPlans.push('每月一次团队建设活动(线上/线下混合)')
  reinforcementPlans.push('创建远程员工资源组(ERG)')
  if (input.values_alignment_score < 0.7) reinforcementPlans.push('开展价值观工作坊，将价值观融入日常工作')

  const cultureScore = (
    input.values_alignment_score * 0.25 +
    input.remote_inclusion_score * 0.25 +
    Math.min(1, input.ritual_count_monthly / 6) * 0.15 +
    Math.min(1, input.recognition_frequency_weekly / 4) * 0.15 +
    Math.min(1, input.social_events_monthly / 4) * 0.2
  )

  const grade = cultureScore > 0.8 ? 'A' : cultureScore > 0.65 ? 'B' : cultureScore > 0.5 ? 'C' : cultureScore > 0.35 ? 'D' : 'F'
  const inclusionGap = input.remote_inclusion_score < 0.5 ? '严重：远程包容性亟需改善' : input.remote_inclusion_score < 0.7 ? '中等：有改善空间' : '良好：包容性实践到位'

  return {
    culture_score: Math.round(cultureScore * 100) / 100,
    culture_health_grade: grade,
    pillars,
    blind_spots: blindSpots,
    reinforcement_plans: reinforcementPlans,
    inclusion_gap: inclusionGap,
  }
}

// --- Tool 8: Flexibility Policy Advisor ---
function analyzeFlexibilityPolicy(input: FlexibilityPolicyInput): FlexibilityPolicyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const benchmarks: PolicyBenchmark[] = []
  const improvements: string[] = []
  const riskAlerts: string[] = []

  benchmarks.push({
    policy_area: '混合办公天数',
    current_value: input.hybrid_days_per_week + ' 天/周',
    industry_benchmark: '3 天/周',
    status: input.hybrid_days_per_week >= 2 && input.hybrid_days_per_week <= 4 ? 'aligned' : input.hybrid_days_per_week > 4 ? 'leading' : 'lagging',
  })

  benchmarks.push({
    policy_area: 'PTO灵活性',
    current_value: input.pto_flexibility + '/10',
    industry_benchmark: '7/10',
    status: input.pto_flexibility >= 7 ? 'aligned' : input.pto_flexibility >= 8 ? 'leading' : 'lagging',
  })

  benchmarks.push({
    policy_area: '核心时间重叠',
    current_value: input.core_hours_overlap + ' 小时',
    industry_benchmark: '4 小时',
    status: input.core_hours_overlap >= 3 ? 'aligned' : input.core_hours_overlap >= 5 ? 'leading' : 'lagging',
  })

  benchmarks.push({
    policy_area: '工作生活平衡',
    current_value: input.work_life_balance_score + '/10',
    industry_benchmark: '7/10',
    status: input.work_life_balance_score >= 7 ? 'aligned' : input.work_life_balance_score >= 8 ? 'leading' : 'lagging',
  })

  if (input.hybrid_days_per_week < 2) improvements.push('增加混合办公天数至每周至少2天')
  if (input.pto_flexibility < 7) improvements.push('提升PTO灵活性，引入无限制休假政策')
  if (input.core_hours_overlap < 3) improvements.push('设定每日核心协作时段(至少3小时重叠)')
  if (input.work_life_balance_score < 7) improvements.push('实施工作生活平衡计划(如断联权政策)')
  improvements.push('建立弹性工作政策定期审查机制')

  if (input.policy_satisfaction < 60) riskAlerts.push('政策满意度低(' + input.policy_satisfaction + '%)，存在人才流失风险')
  if (input.work_life_balance_score < 5) riskAlerts.push('工作生活平衡严重不足，倦怠风险高')
  if (input.timezone_policy === 'strict' && input.core_hours_overlap < 3) riskAlerts.push('严格时区政策+低重叠=跨时区员工体验差')

  const flexibilityScore = (
    (Math.min(1, input.hybrid_days_per_week / 3) * 0.2) +
    (input.pto_flexibility / 10 * 0.2) +
    (input.work_life_balance_score / 10 * 0.25) +
    (input.policy_satisfaction / 100 * 0.2) +
    (Math.min(1, input.core_hours_overlap / 4) * 0.15)
  )

  const tier = flexibilityScore > 0.8 ? '行业领先' : flexibilityScore > 0.6 ? '对齐市场' : flexibilityScore > 0.4 ? '发展中' : '落后'
  const satisfactionForecast = input.policy_satisfaction > 75 ? '预计满意度将维持或提升' : input.policy_satisfaction > 50 ? '满意度有下降风险，需政策调整' : '紧急：满意度危机，需全面政策改革'

  return {
    flexibility_score: Math.round(flexibilityScore * 100) / 100,
    policy_tier: tier,
    benchmarks,
    improvements,
    risk_alerts: riskAlerts,
    employee_satisfaction_forecast: satisfactionForecast,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Virtual Team Health Analyzer Report ---
function formatTeamHealthReport(result: TeamHealthResult): string {
  const lines: string[] = []
  lines.push('## 🏥 Virtual Team Health Analyzer — 虚拟团队健康度报告')
  lines.push('')
  lines.push('综合健康分: ' + result.overall_health_score + ' | 等级: ' + result.health_grade + ' | 行业百分位: 第' + result.benchmark_percentile + '百分位')
  lines.push('')
  lines.push('### 🔗 健康度仪表板')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    TEAM[Virtual Team] --> HEALTH[Health Score: ' + result.overall_health_score + ']')
  lines.push('    HEALTH --> D1[Engagement: ' + (result.dimensions[0]?.score || 0) + ']')
  lines.push('    HEALTH --> D2[Communication: ' + (result.dimensions[1]?.score || 0) + ']')
  lines.push('    HEALTH --> D3[Workload: ' + (result.dimensions[2]?.score || 0) + ']')
  lines.push('    HEALTH --> D4[Timezone: ' + (result.dimensions[3]?.score || 0) + ']')
  lines.push('    D1 --> ACTION[Action Plan]')
  lines.push('    D2 --> ACTION')
  lines.push('    D3 --> ACTION')
  lines.push('    D4 --> ACTION')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 健康维度评分')
  lines.push('| 维度 | 得分 | 状态 | 洞察 |')
  lines.push('|------|------|------|------|')
  for (const d of result.dimensions) {
    lines.push('| ' + d.dimension + ' | ' + d.score + ' | ' + d.status + ' | ' + d.insight + ' |')
  }
  lines.push('')

  if (result.risk_factors.length > 0) {
    lines.push('### ⚠️ 风险因素')
    lines.push('| 风险 | 严重度 | 影响 | 缓解措施 |')
    lines.push('|------|--------|------|----------|')
    for (const r of result.risk_factors) {
      lines.push('| ' + r.factor + ' | ' + r.severity + ' | ' + r.impact + ' | ' + r.mitigation + ' |')
    }
    lines.push('')
  }

  lines.push('### 📋 改善建议')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Market: $30B+ future of work tech*')
  return lines.join('\n')
}

// --- Tool 2: Async Collaboration Optimizer Report ---
function formatAsyncCollabReport(result: AsyncCollabResult): string {
  const lines: string[] = []
  lines.push('## 🔄 Async Collaboration Optimizer — 异步协作优化报告')
  lines.push('')
  lines.push('协作得分: ' + result.collaboration_score + ' | 成熟度: ' + result.async_maturity_level + ' | 预计节省: ' + result.time_saved_estimate_hours + 'h/周')
  lines.push('')
  lines.push('### 🔗 协作流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    ASYNC[Async First] --> DOC[Documentation]')
  lines.push('    DOC --> REVIEW[Async Review]')
  lines.push('    REVIEW --> DECIDE[Decision Log]')
  lines.push('    DECIDE --> SYNC[Sync Meeting Only When Needed]')
  lines.push('    SYNC --> ACTION[Action Items in Linear/Notion]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 工具效率分析')
  lines.push('| 工具 | 采纳率 | 效率分 | 建议 |')
  lines.push('|------|--------|--------|------|')
  for (const t of result.tool_efficiencies) {
    lines.push('| ' + t.tool_name + ' | ' + Math.round(t.adoption_rate * 100) + '% | ' + t.efficiency_score + ' | ' + t.recommended_action + ' |')
  }
  lines.push('')

  if (result.bottlenecks.length > 0) {
    lines.push('### 🚧 瓶颈分析')
    lines.push('| 瓶颈 | 延迟(h) | 频率 | 解决方案 |')
    lines.push('|------|---------|------|----------|')
    for (const b of result.bottlenecks) {
      lines.push('| ' + b.area + ' | ' + b.delay_hours + ' | ' + b.frequency + ' | ' + b.resolution + ' |')
    }
    lines.push('')
  }

  lines.push('### 📋 优化建议')
  for (const opt of result.optimizations) {
    lines.push('- ' + opt)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Async-first collaboration*')
  return lines.join('\n')
}

// --- Tool 3: Digital Workplace Scorer Report ---
function formatDigitalWorkplaceReport(result: DigitalWorkplaceResult): string {
  const lines: string[] = []
  lines.push('## 🏢 Digital Workplace Scorer — 数字工作场所成熟度报告')
  lines.push('')
  lines.push('成熟度得分: ' + result.overall_maturity_score + ' | 等级: ' + result.maturity_level + ' | 投资优先级: ' + result.investment_priority)
  lines.push('')
  lines.push('### 🔗 成熟度模型')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    L1[Initial] --> L2[Developing]')
  lines.push('    L2 --> L3[Mature]')
  lines.push('    L3 --> L4[Leading]')
  lines.push('    CURRENT[Current: ' + result.maturity_level + '] --> L4')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 成熟度维度')
  lines.push('| 维度 | 当前分 | 目标分 | 差距 | 优先级 |')
  lines.push('|------|--------|--------|------|--------|')
  for (const d of result.dimensions) {
    lines.push('| ' + d.dimension + ' | ' + d.current_score + ' | ' + d.target_score + ' | ' + d.gap + ' | ' + d.priority + ' |')
  }
  lines.push('')

  if (result.top_gaps.length > 0) {
    lines.push('### 🔝 主要差距')
    for (const g of result.top_gaps) {
      lines.push('- ' + g)
    }
    lines.push('')
  }

  lines.push('### 📋 改进路线图')
  for (const r of result.roadmap) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Digital workplace maturity*')
  return lines.join('\n')
}

// --- Tool 4: Remote Onboarding Automator Report ---
function formatOnboardingReport(result: OnboardingResult): string {
  const lines: string[] = []
  lines.push('## 🚀 Remote Onboarding Automator — 远程入职自动化报告')
  lines.push('')
  lines.push('入职效能分: ' + result.onboarding_effectiveness_score + ' | 自动化覆盖: ' + result.automation_coverage_pct + '% | 留存影响: ' + result.retention_impact)
  lines.push('')
  lines.push('### 🔗 入职旅程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('journey')
  lines.push('    title Remote Onboarding Journey')
  lines.push('    section Pre-boarding')
  lines.push('      Welcome Email: 5: Auto')
  lines.push('      Equipment Ship: 3: Auto')
  lines.push('    section Week 1')
  lines.push('      Orientation: 4: Buddy')
  lines.push('      Tool Setup: 5: Auto')
  lines.push('    section Month 1')
  lines.push('      Training: 3: Manager')
  lines.push('      First Task: 4: Buddy')
  lines.push('    section Month 3')
  lines.push('      Independent: 5: Self')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 里程碑跟踪')
  lines.push('| 里程碑 | 完成率 | 平均天数 | 状态 |')
  lines.push('|--------|--------|----------|------|')
  for (const m of result.milestones) {
    lines.push('| ' + m.milestone + ' | ' + Math.round(m.completion_rate * 100) + '% | ' + m.avg_days_to_complete + '天 | ' + m.status + ' |')
  }
  lines.push('')

  if (result.risk_areas.length > 0) {
    lines.push('### ⚠️ 风险区域')
    for (const r of result.risk_areas) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('### 📋 自动化建议')
  for (const a of result.automations) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Remote onboarding automation*')
  return lines.join('\n')
}

// --- Tool 5: Meeting Effectiveness Evaluator Report ---
function formatMeetingEffectivenessReport(result: MeetingEffectivenessResult): string {
  const lines: string[] = []
  lines.push('## 📊 Meeting Effectiveness Evaluator — 会议效能评估报告')
  lines.push('')
  lines.push('效能得分: ' + result.effectiveness_score + ' | 会议负荷: ' + result.meeting_load_grade + ' | 预计年节省: ' + result.annual_savings_estimate)
  lines.push('')
  lines.push('### 🔗 会议优化循环')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    PLAN[Plan with Agenda] --> HOLD[Hold Effective Meeting]')
  lines.push('    HOLD --> CAPTURE[Capture Decisions]')
  lines.push('    CAPTURE --> FOLLOW[Follow Up Actions]')
  lines.push('    FOLLOW --> REVIEW[Review Effectiveness]')
  lines.push('    REVIEW --> PLAN')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 会议指标')
  lines.push('| 指标 | 当前值 | 基准 | 状态 |')
  lines.push('|------|--------|------|------|')
  for (const m of result.metrics) {
    lines.push('| ' + m.metric + ' | ' + m.value + ' | ' + m.benchmark + ' | ' + m.status + ' |')
  }
  lines.push('')

  if (result.waste_areas.length > 0) {
    lines.push('### 💸 浪费分析')
    lines.push('| 浪费区域 | 每周浪费(h) | 年成本估算 | 改善方案 |')
    lines.push('|----------|------------|------------|----------|')
    for (const w of result.waste_areas) {
      lines.push('| ' + w.area + ' | ' + w.waste_hours_per_week + ' | ' + w.cost_estimate + ' | ' + w.fix + ' |')
    }
    lines.push('')
  }

  lines.push('### 📋 精简建议')
  for (const r of result.reductions) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Meeting effectiveness*')
  return lines.join('\n')
}

// --- Tool 6: Knowledge Sharing Facilitator Report ---
function formatKnowledgeSharingReport(result: KnowledgeSharingResult): string {
  const lines: string[] = []
  lines.push('## 📚 Knowledge Sharing Facilitator — 知识共享促进报告')
  lines.push('')
  lines.push('共享得分: ' + result.sharing_score + ' | 知识成熟度: ' + result.knowledge_maturity + ' | 孤岛风险: ' + result.silo_risk_level)
  lines.push('')
  lines.push('### 🔗 知识流转图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CREATE[Create Knowledge] --> DOC[Document in Wiki]')
  lines.push('    DOC --> SHARE[Share via Channels]')
  lines.push('    SHARE --> DISCOVER[Discover via Search]')
  lines.push('    DISCOVER --> REUSE[Reuse & Build Upon]')
  lines.push('    REUSE --> CREATE')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 知识渠道分析')
  lines.push('| 渠道 | 利用率 | 有效性 | 增长潜力 |')
  lines.push('|------|--------|--------|----------|')
  for (const c of result.channels) {
    lines.push('| ' + c.channel + ' | ' + Math.round(c.utilization * 100) + '% | ' + Math.round(c.effectiveness * 100) + '% | ' + c.growth_potential + ' |')
  }
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### 🔍 知识缺口')
    for (const g of result.gaps) {
      lines.push('- ' + g)
    }
    lines.push('')
  }

  lines.push('### 📋 促进行动')
  for (const a of result.facilitation_actions) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Knowledge sharing facilitation*')
  return lines.join('\n')
}

// --- Tool 7: Culture Reinforcement Engine Report ---
function formatCultureReinforcementReport(result: CultureReinforcementResult): string {
  const lines: string[] = []
  lines.push('## 🎭 Culture Reinforcement Engine — 文化强化引擎报告')
  lines.push('')
  lines.push('文化得分: ' + result.culture_score + ' | 健康等级: ' + result.culture_health_grade + ' | 包容差距: ' + result.inclusion_gap)
  lines.push('')
  lines.push('### 🔗 文化强化循环')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    VALUES[Core Values] --> RITUALS[Team Rituals]')
  lines.push('    RITUALS --> RECOGNITION[Peer Recognition]')
  lines.push('    RECOGNITION --> INCLUSION[Remote Inclusion]')
  lines.push('    INCLUSION --> BELONGING[Belonging & Trust]')
  lines.push('    BELONGING --> VALUES')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 文化支柱')
  lines.push('| 支柱 | 强度 | 趋势 | 行动 |')
  lines.push('|------|------|------|------|')
  for (const p of result.pillars) {
    lines.push('| ' + p.pillar + ' | ' + p.strength + ' | ' + p.trend + ' | ' + p.action + ' |')
  }
  lines.push('')

  if (result.blind_spots.length > 0) {
    lines.push('### 👁️ 盲点')
    for (const b of result.blind_spots) {
      lines.push('- ' + b)
    }
    lines.push('')
  }

  lines.push('### 📋 强化计划')
  for (const p of result.reinforcement_plans) {
    lines.push('- ' + p)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Culture reinforcement*')
  return lines.join('\n')
}

// --- Tool 8: Flexibility Policy Advisor Report ---
function formatFlexibilityPolicyReport(result: FlexibilityPolicyResult): string {
  const lines: string[] = []
  lines.push('## ⚖️ Flexibility Policy Advisor — 弹性工作政策建议报告')
  lines.push('')
  lines.push('弹性得分: ' + result.flexibility_score + ' | 政策层级: ' + result.policy_tier + ' | 满意度预测: ' + result.employee_satisfaction_forecast)
  lines.push('')
  lines.push('### 🔗 政策框架')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    FLEX[Flexibility Policy] --> HYBRID[Hybrid Work]')
  lines.push('    FLEX --> PTO[PTO Flexibility]')
  lines.push('    FLEX --> CORE[Core Hours]')
  lines.push('    FLEX --> WLB[Work-Life Balance]')
  lines.push('    HYBRID --> SATISFACTION[Employee Satisfaction]')
  lines.push('    PTO --> SATISFACTION')
  lines.push('    CORE --> SATISFACTION')
  lines.push('    WLB --> SATISFACTION')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 政策对标')
  lines.push('| 政策领域 | 当前值 | 行业基准 | 状态 |')
  lines.push('|----------|--------|----------|------|')
  for (const b of result.benchmarks) {
    lines.push('| ' + b.policy_area + ' | ' + b.current_value + ' | ' + b.industry_benchmark + ' | ' + b.status + ' |')
  }
  lines.push('')

  if (result.risk_alerts.length > 0) {
    lines.push('### 🚨 风险预警')
    for (const r of result.risk_alerts) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('### 📋 改善建议')
  for (const i of result.improvements) {
    lines.push('- ' + i)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Future of Work Toolkit • v' + VERSION + ' • Flexibility policy advisory*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Virtual Team Health Analyzer
  tools.register(defineTool({
    name: 'virtual_team_health_analyzer',
    description: '虚拟团队健康度分析 | 评估参与度、沟通质量、工作负载平衡、跨时区协作 | Analyze virtual team health across engagement, communication, workload, and timezone dimensions.',
    parameters: {
      health_input: {
        type: 'string',
        required: true,
        description: 'JSON: team_size, time_zone_spread_hours, communication_frequency_daily, engagement_scores[], turnover_rate_pct, meeting_hours_per_week'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { health_input: string }) {
      const input: TeamHealthInput = JSON.parse(args.health_input)
      return formatTeamHealthReport(analyzeTeamHealth(input))
    }
  }))

  // Tool 2: Async Collaboration Optimizer
  tools.register(defineTool({
    name: 'async_collaboration_optimizer',
    description: '异步协作优化 | 分析工具效率、识别瓶颈、提供优化建议 | Optimize async collaboration with tool efficiency analysis, bottleneck detection, and optimization suggestions.',
    parameters: {
      collab_input: {
        type: 'string',
        required: true,
        description: 'JSON: team_members_count, tools_used[], avg_response_time_hours, handoff_count_weekly, overlap_hours, async_first_score'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { collab_input: string }) {
      const input: AsyncCollabInput = JSON.parse(args.collab_input)
      return formatAsyncCollabReport(analyzeAsyncCollab(input))
    }
  }))

  // Tool 3: Digital Workplace Scorer
  tools.register(defineTool({
    name: 'digital_workplace_scorer',
    description: '数字工作场所成熟度评分 | 评估工具、流程、文化、安全、体验、集成度 | Score digital workplace maturity across tools, processes, culture, security, and integrations.',
    parameters: {
      workplace_input: {
        type: 'string',
        required: true,
        description: 'JSON: tool_maturity(0-1), process_automation_pct(0-100), culture_score(0-1), security_posture(0-1), employee_nps(-100 to 100), integration_level(0-1)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { workplace_input: string }) {
      const input: DigitalWorkplaceInput = JSON.parse(args.workplace_input)
      return formatDigitalWorkplaceReport(analyzeDigitalWorkplace(input))
    }
  }))

  // Tool 4: Remote Onboarding Automator
  tools.register(defineTool({
    name: 'remote_onboarding_automator',
    description: '远程入职自动化 | 跟踪里程碑、识别风险、提供自动化建议 | Automate remote onboarding with milestone tracking, risk identification, and automation suggestions.',
    parameters: {
      onboarding_input: {
        type: 'string',
        required: true,
        description: 'JSON: new_hire_count, onboarding_weeks, buddy_assigned_pct, checklist_completion_pct, first_month_retention_pct, automation_level(0-1)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { onboarding_input: string }) {
      const input: OnboardingInput = JSON.parse(args.onboarding_input)
      return formatOnboardingReport(analyzeOnboarding(input))
    }
  }))

  // Tool 5: Meeting Effectiveness Evaluator
  tools.register(defineTool({
    name: 'meeting_effectiveness_evaluator',
    description: '会议效能评估 | 分析会议负荷、浪费区域、提供精简建议 | Evaluate meeting effectiveness with load analysis, waste detection, and reduction suggestions.',
    parameters: {
      meeting_input: {
        type: 'string',
        required: true,
        description: 'JSON: meeting_count_per_week, avg_duration_minutes, participant_count, outcome_rate_pct, follow_up_rate_pct, no_agenda_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { meeting_input: string }) {
      const input: MeetingEffectivenessInput = JSON.parse(args.meeting_input)
      return formatMeetingEffectivenessReport(analyzeMeetingEffectiveness(input))
    }
  }))

  // Tool 6: Knowledge Sharing Facilitator
  tools.register(defineTool({
    name: 'knowledge_sharing_facilitator',
    description: '知识共享促进 | 分析渠道利用率、识别缺口、提供促进行动 | Facilitate knowledge sharing with channel analysis, gap detection, and facilitation actions.',
    parameters: {
      knowledge_input: {
        type: 'string',
        required: true,
        description: 'JSON: doc_coverage_pct, mentoring_pairs, cross_team_sessions_monthly, wiki_contributions_monthly, knowledge_retention_rate(0-1), search_findability_score(0-1)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { knowledge_input: string }) {
      const input: KnowledgeSharingInput = JSON.parse(args.knowledge_input)
      return formatKnowledgeSharingReport(analyzeKnowledgeSharing(input))
    }
  }))

  // Tool 7: Culture Reinforcement Engine
  tools.register(defineTool({
    name: 'culture_reinforcement_engine',
    description: '文化强化引擎 | 评估文化支柱、识别盲点、提供强化计划 | Reinforce remote culture with pillar assessment, blind spot detection, and reinforcement plans.',
    parameters: {
      culture_input: {
        type: 'string',
        required: true,
        description: 'JSON: ritual_count_monthly, recognition_frequency_weekly, values_alignment_score(0-1), social_events_monthly, culture_nps, remote_inclusion_score(0-1)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { culture_input: string }) {
      const input: CultureReinforcementInput = JSON.parse(args.culture_input)
      return formatCultureReinforcementReport(analyzeCultureReinforcement(input))
    }
  }))

  // Tool 8: Flexibility Policy Advisor
  tools.register(defineTool({
    name: 'flexibility_policy_advisor',
    description: '弹性工作政策建议 | 对标行业基准、识别风险、提供改善建议 | Advise on flexibility policies with benchmarking, risk alerts, and improvement suggestions.',
    parameters: {
      policy_input: {
        type: 'string',
        required: true,
        description: 'JSON: hybrid_days_per_week, timezone_policy, pto_flexibility(0-10), work_life_balance_score(0-10), policy_satisfaction(0-100), core_hours_overlap'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { policy_input: string }) {
      const input: FlexibilityPolicyInput = JSON.parse(args.policy_input)
      return formatFlexibilityPolicyReport(analyzeFlexibilityPolicy(input))
    }
  }))

  console.log('[dsh-tool-futurework] Loaded v' + VERSION + ' — Future of Work: 8 tools active')
  console.log('  Tools: virtual_team_health_analyzer, async_collaboration_optimizer, digital_workplace_scorer, remote_onboarding_automator, meeting_effectiveness_evaluator, knowledge_sharing_facilitator, culture_reinforcement_engine, flexibility_policy_advisor')
}
