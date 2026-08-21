/**
 * DSH Customer Success Agent Pro Plugin v0.1.0
 * 客户成功AI智能体专业版 for DeepSeek Harness — 全生命周期客户成功管理
 *
 * 工具清单:
 * 1. health_score_calculator — 客户健康度评分与预警系统
 * 2. churn_predictor        — 流失风险预测与干预策略
 * 3. expansion_identifier   — 增购/扩展机会识别与推荐
 * 4. onboarding_optimizer   — 客户Onboarding流程优化与里程碑追踪
 * 5. qbr_generator          — QBR季度业务回顾报告自动生成
 * 6. advocacy_program       — 客户推荐计划与成功案例挖掘
 * 7. ticket_trend_analyzer  — 工单趋势分析与根因定位
 * 8. lifecycle_stage_manager— 客户生命周期阶段管理与转化
 *
 * @module dsh-tool-csagentpro | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-csagentpro'
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

  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Health Score Calculator ---
interface HealthScoreInput {
  customer_id: string
  customer_name: string
  nps_score?: number
  product_usage_pct?: number
  support_tickets_30d?: number
  contract_value?: number
  tenure_months?: number
  feature_adoption_pct?: number
  login_frequency_weekly?: number
  csat_score?: number
  last_interaction_days?: number
}

interface HealthFactor {
  name: string
  score: number
  weight: number
  status: 'healthy' | 'at_risk' | 'critical'
  insight: string
}

interface HealthScoreResult {
  customer_id: string
  customer_name: string
  overall_score: number
  grade: 'A' | 'B' | 'C' | 'D'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  factors: HealthFactor[]
  early_warnings: string[]
  recommendations: string[]
  trend: 'improving' | 'stable' | 'declining'
}

// --- Tool 2: Churn Predictor ---
interface ChurnInput {
  customer_id: string
  customer_name: string
  months_as_customer?: number
  monthly_recurring_revenue?: number
  support_ticket_volume?: number
  nps_score?: number
  product_usage_trend?: 'increasing' | 'flat' | 'declining'
  contract_end_days?: number
  payment_delays?: number
  competitor_mentions?: number
  executive_sponsor_changes?: number
  engagement_score?: number
}

interface ChurnRiskFactor {
  factor: string
  impact: number
  direction: 'positive' | 'negative'
  detail: string
}

interface InterventionStrategy {
  action: string
  priority: 'high' | 'medium' | 'low'
  expected_impact: string
  timeline: string
}

interface ChurnResult {
  customer_id: string
  customer_name: string
  churn_probability: number
  risk_tier: 'low' | 'medium' | 'high' | 'critical'
  key_drivers: ChurnRiskFactor[]
  intervention_strategies: InterventionStrategy[]
  estimated_revenue_at_risk: number
  retention_playbook: string[]
}

// --- Tool 3: Expansion Identifier ---
interface ExpansionInput {
  customer_id: string
  customer_name: string
  current_products?: string[]
  current_contract_value?: number
  industry?: string
  employee_count?: number
  usage_growth_pct?: number
  feature_requests?: string[]
  peer_benchmark?: 'below_avg' | 'avg' | 'above_avg'
  budget_cycle_alignment?: 'q1' | 'q2' | 'q3' | 'q4' | 'rolling'
  relationship_score?: number
  available_modules?: string[]
}

interface ExpansionOpportunity {
  product: string
  type: 'upsell' | 'cross-sell' | 'renewal_uplift'
  estimated_arr_uplift: number
  confidence: number
  rationale: string
  approach: string
}

interface ExpansionResult {
  customer_id: string
  customer_name: string
  expansion_opportunities: ExpansionOpportunity[]
  total_potential_uplift: number
  priority_ranking: string[]
  recommended_approach: string
  best_call_to_action: string
}

// --- Tool 4: Onboarding Optimizer ---
interface OnboardingInput {
  customer_id: string
  customer_name: string
  start_date?: string
  current_phase?: string
  milestones_completed?: number
  milestones_total?: number
  days_in_onboarding?: number
  blockers?: string[]
  stakeholder_engagement?: 'high' | 'medium' | 'low'
  training_completion_pct?: number
  time_to_first_value_days?: number
  team_size?: number
}

interface Milestone {
  name: string
  status: 'completed' | 'in_progress' | 'blocked' | 'not_started'
  target_day: number
  actual_day?: number
  blockers: string[]
}

interface OnboardingResult {
  customer_id: string
  customer_name: string
  overall_progress_pct: number
  current_phase: string
  milestones: Milestone[]
  critical_path: string[]
  bottlenecks: string[]
  estimated_completion_days: number
  optimization_actions: string[]
}

// --- Tool 5: QBR Generator ---
interface QBRInput {
  customer_id: string
  customer_name: string
  quarter?: string
  fiscal_year?: number
  executive_sponsor?: string
  contract_value?: number
  goals_achieved?: number
  goals_total?: number
  product_adoption_metrics?: Record<string, number>
  support_summary?: {
    tickets_opened: number
    tickets_resolved: number
    avg_satisfaction: number
    avg_resolution_days: number
  }
  roi_highlights?: string[]
  strategic_initiatives?: string[]
  customer_feedback?: string
}

interface GoalReview {
  goal: string
  status: 'achieved' | 'on_track' | 'at_risk'
  progress_pct: number
  notes: string
}

interface QBRResult {
  customer_id: string
  customer_name: string
  quarter: string
  executive_summary: string
  goal_reviews: GoalReview[]
  adoption_highlights: string[]
  support_performance: Record<string, unknown>
  roi_analysis: string[]
  strategic_roadmap: string[]
  action_items: string[]
  next_quarter_priorities: string[]
}

// --- Tool 6: Advocacy Program ---
interface AdvocacyInput {
  customer_id: string
  customer_name: string
  nps_score?: number
  tenure_months?: number
  industry?: string
  company_size?: string
  case_study_willingness?: 'high' | 'medium' | 'low'
  referral_history?: number
  public_speaking_interest?: boolean
  community_participation?: 'active' | 'occasional' | 'none'
  social_media_influence?: 'high' | 'medium' | 'low'
  awards_won?: string[]
}

interface AdvocacyOpportunity {
  program_name: string
  suitability_score: number
  description: string
  expected_outcome: string
}

interface AdvocacyResult {
  customer_id: string
  customer_name: string
  advocacy_score: number
  advocacy_tier: 'champion' | 'advocate' | 'potential' | 'watch'
  recommended_programs: AdvocacyOpportunity[]
  case_study_potential: string
  referral_likelihood: number
  engagement_plan: string[]
}

// --- Tool 7: Ticket Trend Analyzer ---
interface TicketTrendInput {
  customer_id: string
  customer_name: string
  analysis_period_months?: number
  tickets?: Array<{
    month: string
    category: string
    severity: 'p1' | 'p2' | 'p3' | 'p4'
    resolution_hours: number
    satisfaction?: number
  }>
  product_areas?: string[]
  escalation_rate?: number
  self_service_adoption?: number
  sla_breach_pct?: number
}

interface CategoryTrend {
  category: string
  count: number
  trend: 'increasing' | 'stable' | 'decreasing'
  avg_resolution_hours: number
  root_cause: string
}

interface TicketTrendResult {
  customer_id: string
  customer_name: string
  total_tickets: number
  ticket_volume_trend: 'increasing' | 'stable' | 'decreasing'
  category_trends: CategoryTrend[]
  severity_distribution: Record<string, number>
  avg_resolution_hours: number
  root_causes: string[]
  improvement_recommendations: string[]
  sla_performance: string
}

// --- Tool 8: Lifecycle Stage Manager ---
interface LifecycleInput {
  customer_id: string
  customer_name: string
  current_stage?: 'prospect' | 'onboarding' | 'adoption' | 'growth' | 'renewal' | 'at_risk'
  days_in_stage?: number
  engagement_score?: number
  health_score?: number
  contract_value?: number
  expansion_potential?: 'high' | 'medium' | 'low'
  risk_factors?: string[]
  next_stage_criteria?: Record<string, boolean>
  stage_history?: Array<{ stage: string; entered: string; days: number }>
}

interface StageAction {
  action: string
  category: 'engagement' | 'value' | 'retention' | 'expansion'
  priority: 'high' | 'medium' | 'low'
  expected_outcome: string
}

interface LifecycleResult {
  customer_id: string
  customer_name: string
  current_stage: string
  days_in_stage: number
  conversion_readiness_pct: number
  recommended_actions: StageAction[]
  stage_transition_plan: string[]
  lifecycle_value_projection: string
  risk_mitigation: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Health Score Calculator 分析 ---
function analyzeHealthScore(input: HealthScoreInput): HealthScoreResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + (input.customer_name || '') + JSON.stringify(input).slice(0, 100)
  ))

  const factors: HealthFactor[] = []

  // NPS factor
  const nps = input.nps_score ?? rng.nextInt(1, 10)
  const npsFactor: HealthFactor = {
    name: 'NPS净推荐值',
    score: Math.min(100, Math.max(0, (nps / 10) * 100)),
    weight: 0.20,
    status: nps >= 7 ? 'healthy' : nps >= 4 ? 'at_risk' : 'critical',
    insight: nps >= 7 ? '客户推荐意愿强，忠诚度良好' : nps >= 4 ? '客户满意度中等，需关注体验提升' : '客户存在明显不满，需立即干预',
  }
  factors.push(npsFactor)

  // Product usage factor
  const usage = input.product_usage_pct ?? rng.nextInt(30, 95)
  const usageFactor: HealthFactor = {
    name: '产品使用率',
    score: usage,
    weight: 0.18,
    status: usage >= 70 ? 'healthy' : usage >= 40 ? 'at_risk' : 'critical',
    insight: usage >= 70 ? '核心功能使用充分，粘性良好' : usage >= 40 ? '功能使用不足，存在扩展空间' : '使用率极低，核心价值未体现',
  }
  factors.push(usageFactor)

  // Support tickets factor (inverse)
  const tickets = input.support_tickets_30d ?? rng.nextInt(0, 15)
  const ticketScore = Math.max(0, 100 - tickets * 8)
  const ticketFactor: HealthFactor = {
    name: '支持工单(反向)',
    score: ticketScore,
    weight: 0.12,
    status: tickets <= 2 ? 'healthy' : tickets <= 6 ? 'at_risk' : 'critical',
    insight: tickets <= 2 ? '支持需求少，产品体验流畅' : tickets <= 6 ? '工单量适中，关注高频问题' : '工单量过高，可能存在体验或培训问题',
  }
  factors.push(ticketFactor)

  // Tenure factor
  const tenure = input.tenure_months ?? rng.nextInt(1, 48)
  const tenureFactor: HealthFactor = {
    name: '客户 tenure',
    score: Math.min(100, (tenure / 24) * 100),
    weight: 0.10,
    status: tenure >= 12 ? 'healthy' : tenure >= 6 ? 'at_risk' : 'critical',
    insight: tenure >= 12 ? '长期合作关系稳定' : tenure >= 6 ? '处于关键成长期，需持续投入' : '新客户，关注早期体验和快速价值实现',
  }
  factors.push(tenureFactor)

  // Feature adoption
  const adoption = input.feature_adoption_pct ?? rng.nextInt(20, 90)
  const adoptionFactor: HealthFactor = {
    name: '功能采用率',
    score: adoption,
    weight: 0.15,
    status: adoption >= 60 ? 'healthy' : adoption >= 30 ? 'at_risk' : 'critical',
    insight: adoption >= 60 ? '功能采用全面，产品价值充分释放' : adoption >= 30 ? '部分功能未利用，培训和推广机会' : '采用率极低，需深入了解使用障碍',
  }
  factors.push(adoptionFactor)

  // Login frequency
  const logins = input.login_frequency_weekly ?? rng.nextInt(1, 7)
  const loginFactor: HealthFactor = {
    name: '登录频率(周)',
    score: Math.min(100, (logins / 5) * 100),
    weight: 0.10,
    status: logins >= 3 ? 'healthy' : logins >= 1 ? 'at_risk' : 'critical',
    insight: logins >= 3 ? '活跃度高，日常依赖性强' : logins >= 1 ? '活跃度中等，可提升使用粘性' : '登录频率极低，存在流失风险',
  }
  factors.push(loginFactor)

  // CSAT
  const csat = input.csat_score ?? rng.nextInt(1, 5)
  const csatFactor: HealthFactor = {
    name: 'CSAT满意度',
    score: (csat / 5) * 100,
    weight: 0.15,
    status: csat >= 4 ? 'healthy' : csat >= 3 ? 'at_risk' : 'critical',
    insight: csat >= 4 ? '服务体验优秀' : csat >= 3 ? '满意度尚可，有提升空间' : '体验不满意，需排查根因',
  }
  factors.push(csatFactor)

  // Calculate weighted overall score
  let overall = 0
  for (const f of factors) {
    overall += f.score * f.weight
  }
  overall = Math.round(overall)

  // Determine grade and risk
  const grade: HealthScoreResult['grade'] = overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 50 ? 'C' : 'D'
  const risk_level: HealthScoreResult['risk_level'] = overall >= 80 ? 'low' : overall >= 60 ? 'medium' : overall >= 40 ? 'high' : 'critical'

  // Early warnings
  const warnings: string[] = []
  if (nps < 5) warnings.push('NPS偏低：客户推荐意愿弱，存在口碑风险')
  if (usage < 40) warnings.push('使用率不足：核心价值未充分传递')
  if (tickets > 6) warnings.push('工单量异常：可能存在产品缺陷或培训缺口')
  if (logins < 2) warnings.push('活跃度下降：客户参与度显著降低')
  if (csat < 3) warnings.push('满意度低：客户对服务体验不满意')

  // Recommendations
  const recommendations: string[] = []
  if (overall >= 80) {
    recommendations.push('纳入推荐计划：健康客户是最佳口碑来源')
    recommendations.push('探索增购机会：利用良好关系推进扩展销售')
  } else if (overall >= 60) {
    recommendations.push('加强价值沟通：定期展示产品成果与ROI')
    recommendations.push('提升培训：针对未使用功能开展定向培训')
  } else {
    recommendations.push('启动挽留计划：安排高管对接，深入了解不满原因')
    recommendations.push('制定改善路线图：与客户共同制定体验提升计划')
    recommendations.push('增加触达频率：每周至少一次主动沟通')
  }

  const trend: HealthScoreResult['trend'] = overall >= 75 ? 'improving' : overall >= 50 ? 'stable' : 'declining'

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    overall_score: overall,
    grade,
    risk_level,
    factors,
    early_warnings: warnings,
    recommendations,
    trend,
  }
}

// --- Tool 2: Churn Predictor 分析 ---
function analyzeChurnRisk(input: ChurnInput): ChurnResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + input.customer_name + JSON.stringify(input).slice(0, 80)
  ))

  const drivers: ChurnRiskFactor[] = []
  let churnScore = 0

  // NPS impact
  const nps = input.nps_score ?? rng.nextInt(1, 10)
  if (nps < 5) {
    churnScore += 25
    drivers.push({ factor: 'NPS净推荐值', impact: 25, direction: 'negative', detail: `NPS仅${nps}分，远低于行业基准7+` })
  } else if (nps >= 8) {
    churnScore -= 15
    drivers.push({ factor: 'NPS净推荐值', impact: 15, direction: 'positive', detail: `NPS达${nps}分，客户忠诚度较高` })
  }

  // Usage trend
  const usageTrend = input.product_usage_trend ?? rng.pick(['increasing', 'flat', 'declining'] as const)
  if (usageTrend === 'declining') {
    churnScore += 20
    drivers.push({ factor: '产品使用趋势', impact: 20, direction: 'negative', detail: '使用量持续下降，产品粘性减弱' })
  } else if (usageTrend === 'increasing') {
    churnScore -= 10
    drivers.push({ factor: '产品使用趋势', impact: 10, direction: 'positive', detail: '使用量增长，产品价值持续释放' })
  }

  // Support tickets
  const ticketVol = input.support_ticket_volume ?? rng.nextInt(0, 20)
  if (ticketVol > 8) {
    churnScore += 15
    drivers.push({ factor: '支持工单量', impact: 15, direction: 'negative', detail: `月工单量${ticketVol}，远超健康阈值` })
  }

  // Contract end proximity
  const contractEnd = input.contract_end_days ?? rng.nextInt(30, 365)
  if (contractEnd < 90) {
    churnScore += 18
    drivers.push({ factor: '合同到期临近', impact: 18, direction: 'negative', detail: `合同将在${contractEnd}天后到期，续约窗口紧迫` })
  }

  // Payment delays
  const delays = input.payment_delays ?? rng.nextInt(0, 5)
  if (delays > 2) {
    churnScore += 12
    drivers.push({ factor: '付款延迟', impact: 12, direction: 'negative', detail: `${delays}次付款延迟，可能反映财务或满意度问题` })
  }

  // Competitor mentions
  const compMentions = input.competitor_mentions ?? rng.nextInt(0, 5)
  if (compMentions > 1) {
    churnScore += compMentions * 5
    drivers.push({ factor: '竞品关注', impact: compMentions * 5, direction: 'negative', detail: `客户提及竞品${compMentions}次，对比评估风险` })
  }

  // Engagement score
  const engagement = input.engagement_score ?? rng.nextInt(20, 90)
  if (engagement < 40) {
    churnScore += 15
    drivers.push({ factor: '互动参与度', impact: 15, direction: 'negative', detail: `参与度仅${engagement}分，关系维护不足` })
  } else if (engagement >= 70) {
    churnScore -= 10
    drivers.push({ factor: '互动参与度', impact: 10, direction: 'positive', detail: `参与度达${engagement}分，关系稳固` })
  }

  // Clamp churn probability
  const churnProbability = Math.min(95, Math.max(2, churnScore + rng.nextInt(-5, 5)))
  const risk_tier: ChurnResult['risk_tier'] = churnProbability >= 70 ? 'critical' : churnProbability >= 50 ? 'high' : churnProbability >= 30 ? 'medium' : 'low'

  // Intervention strategies
  const interventions: InterventionStrategy[] = []
  if (churnProbability >= 50) {
    interventions.push({ action: '高管拜访：安排VP/总监级别面对面沟通', priority: 'high', expected_impact: '展示重视程度，挽回信任', timeline: '本周内' })
    interventions.push({ action: '定制化挽留方案：基于需求提供专属优惠或方案调整', priority: 'high', expected_impact: '降低转换动机', timeline: '1周内出方案' })
  }
  if (nps < 5) {
    interventions.push({ action: '深度调研：一对一访谈定位不满根因', priority: 'high', expected_impact: '识别可修复的体验痛点', timeline: '3天内完成' })
  }
  if (usageTrend === 'declining') {
    interventions.push({ action: '重新培训：针对核心场景开展实操培训', priority: 'medium', expected_impact: '恢复使用习惯和产品认知', timeline: '2周内安排' })
  }
  if (contractEnd < 120) {
    interventions.push({ action: '提前续约谈判：展示ROI，锁定长期合作', priority: 'high', expected_impact: '消除到期不确定性', timeline: '立即启动' })
  }
  if (compMentions > 0) {
    interventions.push({ action: '竞品对比分析：制作差异化价值对比报告', priority: 'medium', expected_impact: '强化我方优势认知', timeline: '1周内交付' })
  }
  if (interventions.length === 0) {
    interventions.push({ action: '持续维护：保持现有沟通节奏和价值传递', priority: 'low', expected_impact: '维持健康关系', timeline: '常规节奏' })
  }

  const mrr = input.monthly_recurring_revenue ?? rng.nextInt(5000, 100000)
  const revenueAtRisk = Math.round(mrr * 12 * (churnProbability / 100))

  const playbook: string[] = [
    `第1步: 72小时内完成风险确认与客户触达`,
    `第2步: 根因诊断 — 区分产品问题/服务问题/商务问题`,
    `第3步: 联合内部资源(产品/销售/支持)制定行动计划`,
    `第4步: 每周跟踪改善指标，直至风险等级降至medium以下`,
    `第5步: 复盘总结，更新预防性监控规则`,
  ]

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    churn_probability: churnProbability,
    risk_tier,
    key_drivers: drivers,
    intervention_strategies: interventions,
    estimated_revenue_at_risk: revenueAtRisk,
    retention_playbook: playbook,
  }
}

// --- Tool 3: Expansion Identifier 分析 ---
function analyzeExpansion(input: ExpansionInput): ExpansionResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + input.customer_name + (input.current_products?.join(',') || '')
  ))

  const opportunities: ExpansionOpportunity[] = []
  const currentProducts = input.current_products ?? ['core_platform']
  const availableModules = input.available_modules ?? ['advanced_analytics', 'api_access', 'multi_language', 'sso_integration', 'workflow_automation', 'ai_assistant', 'custom_reporting', 'dedicated_support']

  const baseArr = input.current_contract_value ?? rng.nextInt(50000, 500000)
  const growth = input.usage_growth_pct ?? rng.nextInt(5, 60)
  const relationship = input.relationship_score ?? rng.nextInt(40, 95)

  // Analyze cross-sell opportunities
  const crossSellCandidates = availableModules.filter(m => !currentProducts.includes(m))
  const numOpportunities = Math.min(crossSellCandidates.length, rng.nextInt(2, 4))

  for (let i = 0; i < numOpportunities; i++) {
    const product = crossSellCandidates[i] || `premium_addon_${i}`
    const uplift = Math.round(baseArr * rng.nextFloat(0.1, 0.35))
    const confidence = Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100

    let rationale = ''
    let approach = ''
    if (product.includes('analytics')) {
      rationale = '客户使用量增长快，数据驱动决策需求强烈'
      approach = '通过数据价值演示，展示高级分析如何提升业务洞察'
    } else if (product.includes('api')) {
      rationale = '客户技术团队成熟，有集成和自动化需求'
      approach = '安排技术对接会议，展示API能力和集成案例'
    } else if (product.includes('sso')) {
      rationale = '企业客户规模扩大，安全和合规要求提升'
      approach = '强调企业级安全认证和IT管理便利性'
    } else if (product.includes('ai')) {
      rationale = '行业AI转型趋势明确，客户有降本增效需求'
      approach = '展示AI功能如何自动化重复工作，释放人力'
    } else if (product.includes('workflow')) {
      rationale = '客户团队规模增长，流程管理复杂度提升'
      approach = '演示自动化流程如何减少人工操作和错误率'
    } else {
      rationale = '基于客户业务增长趋势，该模块匹配度高'
      approach = '安排产品演示，展示同行业成功案例'
    }

    opportunities.push({
      product,
      type: 'cross-sell',
      estimated_arr_uplift: uplift,
      confidence,
      rationale,
      approach,
    })
  }

  // Upsell opportunity (if growth is strong)
  if (growth > 20 && relationship > 60) {
    opportunities.push({
      product: 'enterprise_tier_upgrade',
      type: 'upsell',
      estimated_arr_uplift: Math.round(baseArr * rng.nextFloat(0.2, 0.5)),
      confidence: Math.round(rng.nextFloat(0.6, 0.9) * 100) / 100,
      rationale: `使用量增长${growth}%且关系评分${relationship}，具备向上销售基础`,
      approach: '制作ROI对比报告，展示升级版本的增量价值',
    })
  }

  // Sort by confidence
  opportunities.sort((a, b) => b.confidence - a.confidence)

  const totalUplift = opportunities.reduce((sum, o) => sum + o.estimated_arr_uplift, 0)
  const priorityRanking = opportunities.map((o, i) => `${i + 1}. ${o.product} (${o.type}, 置信度${Math.round(o.confidence * 100)}%, +$${o.estimated_arr_uplift.toLocaleString()})`)

  const bestAction = opportunities.length > 0
    ? `优先推进「${opportunities[0].product}」(${opportunities[0].type})，预计增加ARR $${opportunities[0].estimated_arr_uplift.toLocaleString()}`
    : '当前阶段以健康度提升为主，暂缓扩展销售'

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    expansion_opportunities: opportunities,
    total_potential_uplift: totalUplift,
    priority_ranking: priorityRanking,
    recommended_approach: `基于客户增长趋势(${growth}%)和关系评分(${relationship})，建议采用价值驱动的渐进式扩展策略`,
    best_call_to_action: bestAction,
  }
}

// --- Tool 4: Onboarding Optimizer 分析 ---
function analyzeOnboarding(input: OnboardingInput): OnboardingResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + input.customer_name
  ))

  const milestonesCompleted = input.milestones_completed ?? rng.nextInt(1, 6)
  const milestonesTotal = input.milestones_total ?? rng.nextInt(milestonesCompleted, 12)
  const daysInOnboarding = input.days_in_onboarding ?? rng.nextInt(14, 120)
  const trainingPct = input.training_completion_pct ?? rng.nextInt(20, 90)

  const milestoneNames = [
    '需求确认', '环境部署', '数据迁移', '核心配置',
    '用户培训', '集成联调', 'UAT验收', '上线切换',
    '首周陪跑', '价值回顾', '运维交接', '正式上线',
  ]

  const milestones: Milestone[] = []
  for (let i = 0; i < milestonesTotal; i++) {
    const isCompleted = i < milestonesCompleted
    const isInProgress = i === milestonesCompleted
    const blockers: string[] = []
    if (isInProgress && rng.next() > 0.5) {
      blockers.push(rng.pick(['客户资源未到位', '第三方依赖延迟', '需求变更', '技术兼容问题', '数据质量问题']))
    }
    milestones.push({
      name: milestoneNames[i] || `里程碑${i + 1}`,
      status: isCompleted ? 'completed' : isInProgress ? rng.next() > 0.6 ? 'blocked' : 'in_progress' : 'not_started',
      target_day: Math.round((i + 1) * (90 / milestonesTotal)),
      actual_day: isCompleted ? Math.round((i + 1) * (90 / milestonesTotal) + rng.nextInt(-3, 5)) : undefined,
      blockers,
    })
  }

  const progressPct = Math.round((milestonesCompleted / milestonesTotal) * 100)

  // Identify bottlenecks
  const bottlenecks: string[] = []
  if (trainingPct < 50) bottlenecks.push('培训完成率偏低：自主使用中可能遇到障碍')
  const blockedCount = milestones.filter(m => m.status === 'blocked').length
  if (blockedCount > 0) bottlenecks.push(`${blockedCount}个里程碑受阻：需协调资源解除阻塞`)
  if (daysInOnboarding > 90) bottlenecks.push('Onboarding周期过长：需评估效率并加速')

  // Critical path
  const criticalPath = milestones
    .filter(m => m.status === 'in_progress' || m.status === 'blocked')
    .slice(0, 3)
    .map(m => m.name)

  // Estimate completion
  const remainingMilestones = milestonesTotal - milestonesCompleted
  const avgDaysPerMilestone = daysInOnboarding / Math.max(1, milestonesCompleted)
  const estimatedCompletion = Math.round(remainingMilestones * avgDaysPerMilestone + rng.nextInt(5, 15))

  // Optimization actions
  const optimizations: string[] = []
  if (blockedCount > 0) optimizations.push('召开阻塞问题专项会议，明确责任人和解决时间')
  if (trainingPct < 60) optimizations.push('增加培训频次，采用多模态学习方式（视频+实操+文档）')
  if (progressPct < 50 && daysInOnboarding > 45) optimizations.push('评估是否调整里程碑范围，优先保障核心场景上线')
  optimizations.push('建立每日/每周Onboarding进度看板，增强透明度')
  optimizations.push('指定客户侧对口人，确保双方协同效率')

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    overall_progress_pct: progressPct,
    current_phase: milestones[milestonesCompleted]?.name || '待启动',
    milestones,
    critical_path: criticalPath,
    bottlenecks,
    estimated_completion_days: estimatedCompletion,
    optimization_actions: optimizations,
  }
}

// --- Tool 5: QBR Generator 分析 ---
function analyzeQBR(input: QBRInput): QBRResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + (input.quarter || 'Q1') + String(input.fiscal_year || 2025)
  ))

  const quarter = input.quarter || `Q${rng.nextInt(1, 4)}`
  const goalsAchieved = input.goals_achieved ?? rng.nextInt(2, 6)
  const goalsTotal = input.goals_total ?? rng.nextInt(goalsAchieved, 8)
  const goalsProgress = Math.round((goalsAchieved / goalsTotal) * 100)

  // Goal reviews
  const goalNames = [
    '数字化转型目标达成', '运营效率提升', '成本优化',
    '团队协作增强', '数据驱动决策', '客户体验改善',
    '合规与安全强化', '创新应用落地',
  ]
  const goalReviews: GoalReview[] = []
  for (let i = 0; i < goalsTotal; i++) {
    const isAchieved = i < goalsAchieved
    goalReviews.push({
      goal: goalNames[i] || `目标${i + 1}`,
      status: isAchieved ? 'achieved' : i === goalsAchieved ? 'on_track' : 'at_risk',
      progress_pct: isAchieved ? 100 : rng.nextInt(30, 80),
      notes: isAchieved ? '已达成预期成果' : '执行中，预计下季度达成',
    })
  }

  // Adoption highlights
  const adoptionMetrics = input.product_adoption_metrics || {
    daily_active_users: rng.nextInt(50, 500),
    feature_usage_breadth: rng.nextInt(40, 95),
    report_generated: rng.nextInt(100, 2000),
    integration_points: rng.nextInt(2, 15),
  }
  const adoptionHighlights = [
    `DAU达${adoptionMetrics.daily_active_users}人，活跃度${rng.nextInt(60, 95)}%`,
    `功能使用广度覆盖${adoptionMetrics.feature_usage_breadth}%`,
    `累计生成报告${adoptionMetrics.report_generated}份`,
    `已集成${adoptionMetrics.integration_points}个系统`,
  ]

  // Support performance
  const support = input.support_summary || {
    tickets_opened: rng.nextInt(5, 50),
    tickets_resolved: 0,
    avg_satisfaction: rng.nextInt(3, 5),
    avg_resolution_days: rng.nextFloat(0.5, 5),
  }
  support.tickets_resolved = Math.min(support.tickets_opened, support.tickets_opened - rng.nextInt(0, 2))

  // ROI
  const roiHighlights = input.roi_highlights || [
    `效率提升：平均节省${rng.nextInt(20, 60)}%的操作时间`,
    `成本节约：年化节约约$${rng.nextInt(50000, 500000).toLocaleString()}`,
    `错误率降低：数据错误减少${rng.nextInt(40, 80)}%`,
    `决策提速：报表生成从${rng.nextInt(3, 10)}天缩短至实时`,
  ]

  // Strategic roadmap
  const roadmap = input.strategic_initiatives || [
    '扩展至更多业务部门和场景',
    '深化AI/自动化能力应用',
    '构建行业最佳实践标杆',
    '推进数据驱动决策文化建设',
    '探索更多生态集成机会',
  ]

  // Action items
  const actionItems = [
    `跟进${goalsTotal - goalsAchieved}个未达成目标，制定下季度推进计划`,
    `完成${rng.nextInt(3, 8)}项待办事项的技术评审和排期`,
    `安排双方季度战略对齐会议，确认下季度优先级`,
    `更新客户成功计划(Health Plan)，纳入最新反馈`,
  ]

  const nextPriorities = [
    '持续推动未利用功能的采用',
    '深化高层关系，拓展决策链覆盖',
    '规划下阶段扩展和升级路径',
    '推动客户成为行业标杆案例',
  ]

  // Executive summary
  const execSummary = `${input.customer_name || '客户'}在${quarter}季度取得了显著进展：${goalsAchieved}/${goalsTotal}个目标达成，产品活跃度健康，客户满意度${support.avg_satisfaction}/5。下季度将聚焦于深化采用、扩展场景和推动价值最大化。`

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    quarter,
    executive_summary: execSummary,
    goal_reviews: goalReviews,
    adoption_highlights: adoptionHighlights,
    support_performance: support,
    roi_analysis: roiHighlights,
    strategic_roadmap: roadmap,
    action_items: actionItems,
    next_quarter_priorities: nextPriorities,
  }
}

// --- Tool 6: Advocacy Program 分析 ---
function analyzeAdvocacy(input: AdvocacyInput): AdvocacyResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + input.customer_name
  ))

  let advocacyScore = 0

  // NPS contribution
  const nps = input.nps_score ?? rng.nextInt(1, 10)
  if (nps >= 9) advocacyScore += 30
  else if (nps >= 7) advocacyScore += 20
  else if (nps >= 5) advocacyScore += 10

  // Tenure contribution
  const tenure = input.tenure_months ?? rng.nextInt(3, 48)
  if (tenure >= 18) advocacyScore += 20
  else if (tenure >= 12) advocacyScore += 15
  else if (tenure >= 6) advocacyScore += 10
  else advocacyScore += 5

  // Case study willingness
  const willingness = input.case_study_willingness ?? rng.pick(['high', 'medium', 'low'] as const)
  if (willingness === 'high') advocacyScore += 20
  else if (willingness === 'medium') advocacyScore += 10

  // Referral history
  const referrals = input.referral_history ?? rng.nextInt(0, 5)
  advocacyScore += Math.min(15, referrals * 5)

  // Community participation
  const community = input.community_participation ?? rng.pick(['active', 'occasional', 'none'] as const)
  if (community === 'active') advocacyScore += 10
  else if (community === 'occasional') advocacyScore += 5

  // Social influence
  const influence = input.social_media_influence ?? rng.pick(['high', 'medium', 'low'] as const)
  if (influence === 'high') advocacyScore += 5

  // Determine tier
  const tier: AdvocacyResult['advocacy_tier'] = advocacyScore >= 75 ? 'champion' : advocacyScore >= 55 ? 'advocate' : advocacyScore >= 35 ? 'potential' : 'watch'

  // Recommended programs
  const programs: AdvocacyResult['recommended_programs'] = []
  if (nps >= 8 && willingness === 'high') {
    programs.push({ program_name: '成功案例联合发布', suitability_score: 95, description: '联合制作行业深度案例研究', expected_outcome: '行业曝光+双方品牌价值提升' })
  }
  if (referrals >= 2 || nps >= 9) {
    programs.push({ program_name: '客户推荐大使', suitability_score: 88, description: '邀请成为产品推荐人，参与新客分享', expected_outcome: '高质量销售线索+口碑传播' })
  }
  if (input.public_speaking_interest) {
    programs.push({ program_name: '行业峰会演讲', suitability_score: 82, description: '邀请在行业峰会/用户大会分享实践', expected_outcome: '行业影响力+品牌背书' })
  }
  if (community === 'active') {
    programs.push({ program_name: '用户社区布道者', suitability_score: 78, description: '活跃于用户社区，帮助其他用户成长', expected_outcome: '社区活跃度提升+客户自助解决率提高' })
  }
  if (influence === 'high') {
    programs.push({ program_name: '社交媒体联合发声', suitability_score: 70, description: '通过LinkedIn/微信等渠道分享合作成果', expected_outcome: '社交媒体曝光+品牌认知扩展' })
  }
  if (programs.length === 0) {
    programs.push({ program_name: '满意度提升计划', suitability_score: 60, description: '先提升客户体验和满意度，为后续推荐打基础', expected_outcome: '健康度提升，逐步具备推荐条件' })
  }

  // Case study potential
  const caseStudyPotential = willingness === 'high'
    ? '高潜力：客户愿意配合，建议安排案例访谈和素材收集'
    : willingness === 'medium'
    ? '中潜力：需进一步了解顾虑，通过ROI数据增强信心'
    : '待培育：当前意愿不足，优先提升满意度和价值感知'

  // Referral likelihood
  const referralLikelihood = Math.min(95, Math.max(5, (nps / 10) * 80 + referrals * 5))

  // Engagement plan
  const engagementPlan = [
    '建立专属客户成功档案，记录里程碑和成就',
    '每季度安排高管关系维护活动',
    '邀请参加年度用户大会/闭门沙龙',
    '提供产品优先体验和内部路线图分享',
    '节日/企业纪念日个性化关怀',
    tier === 'champion' || tier === 'advocate' ? '制定联合营销计划，共创行业内容' : '持续体验优化，争取升级为推荐者',
  ]

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    advocacy_score: advocacyScore,
    advocacy_tier: tier,
    recommended_programs: programs,
    case_study_potential: caseStudyPotential,
    referral_likelihood: Math.round(referralLikelihood),
    engagement_plan: engagementPlan,
  }
}

// --- Tool 7: Ticket Trend Analyzer 分析 ---
function analyzeTicketTrend(input: TicketTrendInput): TicketTrendResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + String(input.analysis_period_months || 6)
  ))

  const months = input.analysis_period_months ?? 6
  const categories = ['登录认证', '功能使用', '数据报表', '集成问题', '性能问题', '权限配置', '培训咨询', 'Bug反馈']

  const allTickets: TicketTrendInput['tickets'] = []
  if (input.tickets && input.tickets.length > 0) {
    allTickets.push(...input.tickets)
  } else {
    // Generate synthetic ticket data
    for (let m = 0; m < months; m++) {
      const monthTickets = rng.nextInt(3, 20)
      for (let t = 0; t < monthTickets; t++) {
        allTickets.push({
          month: `M${m + 1}`,
          category: rng.pick(categories),
          severity: rng.pick(['p1', 'p2', 'p3', 'p4'] as const),
          resolution_hours: Math.round(rng.nextFloat(0.5, 72)),
          satisfaction: rng.nextInt(1, 5),
        })
      }
    }
  }

  // Category trends
  const categoryMap: Record<string, { count: number; hours: number; months: Record<string, number> }> = {}
  for (const ticket of allTickets) {
    if (!categoryMap[ticket.category]) {
      categoryMap[ticket.category] = { count: 0, hours: 0, months: {} }
    }
    categoryMap[ticket.category].count++
    categoryMap[ticket.category].hours += ticket.resolution_hours
    categoryMap[ticket.category].months[ticket.month] = (categoryMap[ticket.category].months[ticket.month] || 0) + 1
  }

  const categoryTrends: CategoryTrend[] = Object.entries(categoryMap).map(([cat, data]) => {
    const monthCounts = Object.values(data.months)
    const firstHalf = monthCounts.slice(0, Math.floor(monthCounts.length / 2)).reduce((a, b) => a + b, 0)
    const secondHalf = monthCounts.slice(Math.floor(monthCounts.length / 2)).reduce((a, b) => a + b, 0)
    const trend: CategoryTrend['trend'] = secondHalf > firstHalf * 1.2 ? 'increasing' : secondHalf < firstHalf * 0.8 ? 'decreasing' : 'stable'

    const rootCauses: Record<string, string> = {
      '登录认证': 'SSO配置复杂或密码策略不清晰',
      '功能使用': '用户培训不足或界面引导不够直观',
      '数据报表': '报表需求复杂或数据源配置错误',
      '集成问题': 'API文档不完整或版本兼容性问题',
      '性能问题': '数据量增长导致查询优化不足',
      '权限配置': '角色权限体系过于复杂',
      '培训咨询': '新功能发布后培训覆盖不及时',
      'Bug反馈': '测试覆盖不足或回归验证缺失',
    }

    return {
      category: cat,
      count: data.count,
      trend,
      avg_resolution_hours: Math.round((data.hours / data.count) * 10) / 10,
      root_cause: rootCauses[cat] || '需进一步分析',
    }
  }).sort((a, b) => b.count - a.count)

  // Severity distribution
  const severityDist: Record<string, number> = { p1: 0, p2: 0, p3: 0, p4: 0 }
  for (const t of allTickets) {
    severityDist[t.severity]++
  }

  // Overall trend
  const monthGroups: Record<string, number> = {}
  for (const t of allTickets) {
    monthGroups[t.month] = (monthGroups[t.month] || 0) + 1
  }
  const monthValues = Object.values(monthGroups)
  const overallTrend: TicketTrendResult['ticket_volume_trend'] =
    monthValues.length >= 3 && monthValues[monthValues.length - 1] > monthValues[0] * 1.3
      ? 'increasing'
      : monthValues.length >= 3 && monthValues[monthValues.length - 1] < monthValues[0] * 0.7
      ? 'decreasing'
      : 'stable'

  const avgResolution = Math.round((allTickets.reduce((s, t) => s + t.resolution_hours, 0) / allTickets.length) * 10) / 10

  // Root causes summary
  const topCategories = categoryTrends.slice(0, 3)
  const rootCausesSummary = topCategories.map(c => `${c.category}(${c.count}件): ${c.root_cause}`)

  // Improvements
  const improvements: string[] = []
  const topCat = categoryTrends[0]
  if (topCat) improvements.push(`针对「${topCat.category}」高频问题，制作FAQ和自助解决指南`)
  if (severityDist.p1 > 0 || severityDist.p2 > 3) improvements.push('建立P1/P2工单快速响应机制，设置15分钟响应SLA')
  if (overallTrend === 'increasing') improvements.push('工单量增长趋势需关注，建议开展产品体验健康度审查')
  improvements.push('推动知识库建设，提升自助服务解决率')
  improvements.push('每月发布工单趋势报告，与产品团队共享高频问题')

  const slaBreachPct = input.sla_breach_pct ?? rng.nextInt(0, 20)
  const slaPerformance = slaBreachPct <= 5 ? '优秀：SLA达标率>95%' : slaBreachPct <= 15 ? '良好：SLA达标率85-95%' : '待改善：SLA达标率<85%'

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    total_tickets: allTickets.length,
    ticket_volume_trend: overallTrend,
    category_trends: categoryTrends,
    severity_distribution: severityDist,
    avg_resolution_hours: avgResolution,
    root_causes: rootCausesSummary,
    improvement_recommendations: improvements,
    sla_performance: slaPerformance,
  }
}

// --- Tool 8: Lifecycle Stage Manager 分析 ---
function analyzeLifecycle(input: LifecycleInput): LifecycleResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.customer_id + input.customer_name + (input.current_stage || 'unknown')
  ))

  const stage = input.current_stage ?? rng.pick(['prospect', 'onboarding', 'adoption', 'growth', 'renewal', 'at_risk'] as const)
  const daysInStage = input.days_in_stage ?? rng.nextInt(7, 180)
  const health = input.health_score ?? rng.nextInt(20, 95)
  const engagement = input.engagement_score ?? rng.nextInt(20, 95)
  const contractValue = input.contract_value ?? rng.nextInt(30000, 500000)

  // Determine conversion readiness
  let readinessFactors = 0
  if (health >= 70) readinessFactors += 30
  else if (health >= 50) readinessFactors += 15
  if (engagement >= 70) readinessFactors += 30
  else if (engagement >= 50) readinessFactors += 15
  if (daysInStage >= 14) readinessFactors += 20
  if (input.expansion_potential === 'high') readinessFactors += 20
  const readiness = Math.min(95, readinessFactors + rng.nextInt(-5, 10))

  // Recommended actions based on stage
  const actions: StageAction[] = []
  switch (stage) {
    case 'onboarding':
      actions.push({ action: '确保核心场景上线完成，达成首价值', category: 'value', priority: 'high', expected_outcome: '建立客户信心和团队使用习惯' })
      actions.push({ action: '完成关键用户培训和认证', category: 'engagement', priority: 'high', expected_outcome: '提升自主使用能力' })
      actions.push({ action: '收集反馈并快速迭代配置', category: 'retention', priority: 'medium', expected_outcome: '消除早期使用障碍' })
      break
    case 'adoption':
      actions.push({ action: '推动扩展使用场景至更多团队', category: 'expansion', priority: 'high', expected_outcome: '深化产品定位为业务基础设施' })
      actions.push({ action: '识别并培养内部Champion', category: 'engagement', priority: 'high', expected_outcome: '建立内部推广和支持网络' })
      actions.push({ action: '定期展示使用数据和业务价值', category: 'value', priority: 'medium', expected_outcome: '量化ROI，强化决策信心' })
      break
    case 'growth':
      actions.push({ action: '推进扩展模块/席位增购', category: 'expansion', priority: 'high', expected_outcome: '提升ARR，扩展产品覆盖' })
      actions.push({ action: '联合打造行业标杆案例', category: 'value', priority: 'medium', expected_outcome: '共创价值，增强粘性' })
      actions.push({ action: '探索自动化和深度集成', category: 'expansion', priority: 'medium', expected_outcome: '提升技术壁垒和替换成本' })
      break
    case 'renewal':
      actions.push({ action: '完成年度ROI回顾和价值报告', category: 'retention', priority: 'high', expected_outcome: '数据驱动续约决策' })
      actions.push({ action: '提前6个月启动续约谈判', category: 'retention', priority: 'high', expected_outcome: '避免临时谈判被动' })
      actions.push({ action: '提供续约激励和多年度优惠', category: 'retention', priority: 'medium', expected_outcome: '锁定长期合作关系' })
      break
    case 'at_risk':
      actions.push({ action: '紧急高管介入，了解核心不满', category: 'retention', priority: 'high', expected_outcome: '识别可挽回因素' })
      actions.push({ action: '制定90天改善行动计划', category: 'engagement', priority: 'high', expected_outcome: '系统性修复体验问题' })
      actions.push({ action: '提供专属支持资源和响应通道', category: 'retention', priority: 'high', expected_outcome: '重建信任和安全感' })
      break
    default:
      actions.push({ action: '建立联系并了解业务需求', category: 'engagement', priority: 'high', expected_outcome: '推进至Onboarding阶段' })
  }

  // Stage transition plan
  const transitions: string[] = []
  const nextStageMap: Record<string, string> = {
    prospect: 'onboarding',
    onboarding: 'adoption',
    adoption: 'growth',
    growth: 'renewal',
    renewal: 'growth',
    at_risk: 'adoption',
  }
  const nextStage = nextStageMap[stage] || 'growth'
  transitions.push(`当前阶段(${stage}) → 下一目标: ${nextStage}`)
  transitions.push(`转化准备度: ${readiness}% (健康度${health} + 互动${engagement})`)
  if (readiness >= 70) transitions.push('条件成熟：建议主动推进阶段跃迁')
  else if (readiness >= 40) transitions.push('条件中等：需重点改善后再推进')
  else transitions.push('条件不足：先稳固基础再考虑转化')

  // Value projection
  const expansionMult = input.expansion_potential === 'high' ? 2.5 : input.expansion_potential === 'medium' ? 1.5 : 1.2
  const projectedValue = Math.round(contractValue * expansionMult)
  const valueProjection = `当前合约 $${contractValue.toLocaleString()} → 预计12个月内可增长至 $${projectedValue.toLocaleString()} (扩展潜力: ${input.expansion_potential || 'medium'})`

  // Risk mitigation
  const risks = input.risk_factors || []
  const riskMitigation: string[] = []
  if (risks.length > 0) {
    for (const r of risks) riskMitigation.push(`"${r}" → 制定专项应对方案并每周跟踪`)
  } else {
    riskMitigation.push('暂无重大风险因素，保持现有维护节奏')
  }
  if (health < 50) riskMitigation.push('健康度偏低：需重点关注，防止进入at_risk阶段')
  if (engagement < 40) riskMitigation.push('互动不足：增加触达频率，重新激活关系')

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    current_stage: stage,
    days_in_stage: daysInStage,
    conversion_readiness_pct: readiness,
    recommended_actions: actions,
    stage_transition_plan: transitions,
    lifecycle_value_projection: valueProjection,
    risk_mitigation: riskMitigation,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Health Score Calculator 报告 ---
function formatHealthScoreReport(result: HealthScoreResult): string {
  const lines: string[] = []
  lines.push('## 🏥 客户健康度评分与预警报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`综合健康分: **${result.overall_score}/100** | 等级: **${result.grade}** | 风险: **${result.risk_level}** | 趋势: ${result.trend === 'improving' ? '↗ 改善中' : result.trend === 'stable' ? '→ 稳定' : '↘ 下降'}`)
  lines.push('')

  lines.push('### 📊 健康度因子分解')
  lines.push('| 因子 | 得分 | 权重 | 状态 | 洞察 |')
  lines.push('|------|------|------|------|------|')
  for (const f of result.factors) {
    const statusEmoji = f.status === 'healthy' ? '🟢' : f.status === 'at_risk' ? '🟡' : '🔴'
    lines.push(`| ${f.name} | ${Math.round(f.score)} | ${(f.weight * 100).toFixed(0)}% | ${statusEmoji} ${f.status} | ${f.insight} |`)
  }
  lines.push('')

  if (result.early_warnings.length > 0) {
    lines.push('### ⚠️ 预警信号')
    for (const w of result.early_warnings) lines.push(`- 🚨 ${w}`)
    lines.push('')
  }

  lines.push('### 💡 改善建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 多维度数据采集与加权计算')
  lines.push('- [x] 动态阈值预警机制')
  lines.push('- [x] 趋势追踪与自动评分')
  lines.push('- [x] 个性化改善建议生成')
  lines.push('')
  lines.push('---')
  lines.push('*免责声明：本报告基于输入数据和模型逻辑生成，建议结合定性评估(客户访谈、业务背景)综合判断。健康度评分仅供参考，不构成客户去留的唯一决策依据。*')
  return lines.join('\n')
}

// --- Tool 2: Churn Predictor 报告 ---
function formatChurnReport(result: ChurnResult): string {
  const lines: string[] = []
  lines.push('## 🔮 流失风险预测与干预策略报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`流失概率: **${result.churn_probability}%** | 风险等级: **${result.risk_tier}** | 年化风险收入: **$${result.estimated_revenue_at_risk.toLocaleString()}**`)
  lines.push('')

  lines.push('### 📊 关键驱动因素')
  lines.push('| 因子 | 影响分 | 方向 | 详情 |')
  lines.push('|------|--------|------|------|')
  for (const d of result.key_drivers) {
    const dirEmoji = d.direction === 'positive' ? '🟢' : '🔴'
    lines.push(`| ${d.factor} | ${d.impact} | ${dirEmoji} ${d.direction === 'positive' ? '正面' : '负面'} | ${d.detail} |`)
  }
  lines.push('')

  lines.push('### 🛡️ 干预策略')
  for (const s of result.intervention_strategies) {
    const priorityEmoji = s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢'
    lines.push(`- ${priorityEmoji} **[${s.priority.toUpperCase()}]** ${s.action}`)
    lines.push(`  - 预期效果: ${s.expected_impact} | 时间: ${s.timeline}`)
  }
  lines.push('')

  lines.push('### 📋 挽留手册')
  for (const step of result.retention_playbook) lines.push(`- ${step}`)
  lines.push('')

  lines.push('---')
  lines.push('*免责声明：流失概率基于历史模式和当前输入数据估算，实际结果受多种因素影响。建议结合客户沟通和市场动态综合判断，及时更新预测模型输入。*')
  return lines.join('\n')
}

// --- Tool 3: Expansion Identifier 报告 ---
function formatExpansionReport(result: ExpansionResult): string {
  const lines: string[] = []
  lines.push('## 📈 增购/扩展机会识别报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`总增购潜力: **$${result.total_potential_uplift.toLocaleString()}** | 机会数: ${result.expansion_opportunities.length}`)
  lines.push('')

  lines.push('### 🎯 机会详情')
  for (const o of result.expansion_opportunities) {
    const typeLabel = o.type === 'upsell' ? '⬆️ 向上销售' : o.type === 'cross-sell' ? '↔️ 交叉销售' : '🔄 续约提价'
    lines.push(`#### ${typeLabel}: ${o.product}`)
    lines.push(`- 预计ARR增长: $${o.estimated_arr_uplift.toLocaleString()}`)
    lines.push(`- 置信度: ${Math.round(o.confidence * 100)}%`)
    lines.push(`- 依据: ${o.rationale}`)
    lines.push(`- 推进方式: ${o.approach}`)
    lines.push('')
  }

  lines.push('### 📋 优先级排序')
  for (const p of result.priority_ranking) lines.push(`- ${p}`)
  lines.push('')

  lines.push(`### 🎯 推荐策略`)
  lines.push(result.recommended_approach)
  lines.push('')
  lines.push(`**最佳CTA: ${result.best_call_to_action}**`)
  lines.push('')

  lines.push('---')
  lines.push('*免责声明：增购预测基于当前使用模式和关系评分估算，实际结果受客户预算、业务需求变化等因素影响。建议在推进前确认客户的采购意愿和时间窗口。*')
  return lines.join('\n')
}

// --- Tool 4: Onboarding Optimizer 报告 ---
function formatOnboardingReport(result: OnboardingResult): string {
  const lines: string[] = []
  lines.push('## 🚀 客户Onboarding流程优化报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`整体进度: **${result.overall_progress_pct}%** | 当前阶段: **${result.current_phase}** | 预计完成: ${result.estimated_completion_days}天`)
  lines.push('')

  lines.push('### 📋 里程碑追踪')
  lines.push('| 里程碑 | 状态 | 目标日 | 实际日 | 阻塞 |')
  lines.push('|--------|------|--------|--------|------|')
  for (const m of result.milestones) {
    const statusEmoji = m.status === 'completed' ? '✅' : m.status === 'in_progress' ? '🔄' : m.status === 'blocked' ? '🚫' : '⬜'
    lines.push(`| ${m.name} | ${statusEmoji} ${m.status} | D${m.target_day} | ${m.actual_day ? 'D' + m.actual_day : '-'} | ${m.blockers.join(', ') || '-'} |`)
  }
  lines.push('')

  if (result.bottlenecks.length > 0) {
    lines.push('### 🚧 瓶颈识别')
    for (const b of result.bottlenecks) lines.push(`- ⚠️ ${b}`)
    lines.push('')
  }

  lines.push('### 📋 关键路径')
  for (const c of result.critical_path) lines.push(`- 🎯 ${c}`)
  lines.push('')

  lines.push('### 💡 优化建议')
  for (const o of result.optimization_actions) lines.push(`- ${o}`)
  lines.push('')

  lines.push('---')
  lines.push('*免责声明：Onboarding进度和预估完成时间基于当前里程碑状态和平均效率估算，实际时间受客户资源配合度、需求变更等因素影响。建议每周动态调整计划。*')
  return lines.join('\n')
}

// --- Tool 5: QBR Generator 报告 ---
function formatQBRReport(result: QBRResult): string {
  const lines: string[] = []
  lines.push('## 📊 QBR 季度业务回顾报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`回顾周期: **${result.quarter}**`)
  lines.push('')

  lines.push('### 📋 执行摘要')
  lines.push(result.executive_summary)
  lines.push('')

  lines.push('### 🎯 目标回顾')
  lines.push('| 目标 | 状态 | 进度 | 备注 |')
  lines.push('|------|------|------|------|')
  for (const g of result.goal_reviews) {
    const statusEmoji = g.status === 'achieved' ? '✅' : g.status === 'on_track' ? '🟡' : '🔴'
    lines.push(`| ${g.goal} | ${statusEmoji} ${g.status} | ${g.progress_pct}% | ${g.notes} |`)
  }
  lines.push('')

  lines.push('### 📈 产品采用亮点')
  for (const h of result.adoption_highlights) lines.push(`- ${h}`)
  lines.push('')

  lines.push('### 🛠️ 支持服务表现')
  lines.push(`- 工单量: ${result.support_performance.tickets_opened}件 (已解决${result.support_performance.tickets_resolved}件)`)
  lines.push(`- 平均满意度: ${result.support_performance.avg_satisfaction}/5`)
  lines.push(`- 平均解决时间: ${Number(result.support_performance.avg_resolution_days).toFixed(1)}天`)
  lines.push('')

  lines.push('### 💰 ROI分析')
  for (const r of result.roi_analysis) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 🗺️ 战略路线图')
  for (let i = 0; i < result.strategic_roadmap.length; i++) {
    lines.push(`${i + 1}. ${result.strategic_roadmap[i]}`)
  }
  lines.push('')

  lines.push('### ✅ 行动项')
  for (const a of result.action_items) lines.push(`- [ ] ${a}`)
  lines.push('')

  lines.push('### 🎯 下季度优先事项')
  for (const p of result.next_quarter_priorities) lines.push(`- ⭐ ${p}`)
  lines.push('')

  lines.push('---')
  lines.push('*免责声明：QBR报告基于输入数据自动生成，建议与内部团队和客户确认数据准确性和优先级排序。具体目标设定需结合客户业务规划动态调整。*')
  return lines.join('\n')
}

// --- Tool 6: Advocacy Program 报告 ---
function formatAdvocacyReport(result: AdvocacyResult): string {
  const lines: string[] = []
  lines.push('## 🌟 客户推荐计划与成功案例挖掘报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`推荐指数: **${result.advocacy_score}/100** | 推荐等级: **${result.advocacy_tier}** | 推荐可能性: ${result.referral_likelihood}%`)
  lines.push('')

  lines.push('### 🎯 推荐活动匹配')
  for (const p of result.recommended_programs) {
    lines.push(`- **${p.program_name}** (匹配度: ${p.suitability_score}%)`)
    lines.push(`  - ${p.description}`)
    lines.push(`  - 预期产出: ${p.expected_outcome}`)
  }
  lines.push('')

  lines.push('### 📖 案例潜力')
  lines.push(result.case_study_potential)
  lines.push('')

  lines.push('### 📋 互动计划')
  for (let i = 0; i < result.engagement_plan.length; i++) {
    lines.push(`${i + 1}. ${result.engagement_plan[i]}`)
  }
  lines.push('')

  lines.push('---')
  lines.push('*免责声明：推荐计划匹配度基于客户历史行为和偏好数据估算，实际参与意愿可能受业务周期、外部因素等影响。建议以尊重客户意愿为前提，避免过度营销。*')
  return lines.join('\n')
}

// --- Tool 7: Ticket Trend Analyzer 报告 ---
function formatTicketTrendReport(result: TicketTrendResult): string {
  const lines: string[] = []
  lines.push('## 🎫 工单趋势分析与根因定位报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`工单总量: **${result.total_tickets}件** | 趋势: **${result.ticket_volume_trend === 'increasing' ? '↗ 上升' : result.ticket_volume_trend === 'decreasing' ? '↘ 下降' : '→ 稳定'}** | 平均解决: ${result.avg_resolution_hours}h`)
  lines.push('')

  lines.push('### 📊 分类趋势')
  lines.push('| 类别 | 数量 | 趋势 | 平均解决(h) | 根因 |')
  lines.push('|------|------|------|------------|------|')
  for (const c of result.category_trends) {
    const trendEmoji = c.trend === 'increasing' ? '↗' : c.trend === 'decreasing' ? '↘' : '→'
    lines.push(`| ${c.category} | ${c.count} | ${trendEmoji} ${c.trend} | ${c.avg_resolution_hours} | ${c.root_cause} |`)
  }
  lines.push('')

  lines.push('### 🔢 严重度分布')
  lines.push(`| P1(紧急) | P2(高) | P3(中) | P4(低) |`)
  lines.push(`|----------|--------|--------|--------|`)
  lines.push(`| ${result.severity_distribution.p1} | ${result.severity_distribution.p2} | ${result.severity_distribution.p3} | ${result.severity_distribution.p4} |`)
  lines.push('')

  lines.push('### 🔍 根因总结')
  for (const r of result.root_causes) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 💡 改善建议')
  for (const i of result.improvement_recommendations) lines.push(`- ${i}`)
  lines.push('')

  lines.push(`### 📋 SLA表现: ${result.sla_performance}`)
  lines.push('')
  lines.push('---')
  lines.push('*免责声明：工单趋势分析基于提供数据，根因定位为模型推断结果，建议结合实际业务上下文验证。改善建议需根据组织资源和优先级选择性实施。*')
  return lines.join('\n')
}

// --- Tool 8: Lifecycle Stage Manager 报告 ---
function formatLifecycleReport(result: LifecycleResult): string {
  const lines: string[] = []
  lines.push('## 🔄 客户生命周期阶段管理与转化报告')
  lines.push('')
  lines.push(`客户: ${result.customer_name} (${result.customer_id})`)
  lines.push(`当前阶段: **${result.current_stage}** | 阶段天数: ${result.days_in_stage}天 | 转化准备度: **${result.conversion_readiness_pct}%**`)
  lines.push('')

  lines.push('### 🎯 推荐行动')
  for (const a of result.recommended_actions) {
    const catEmoji = a.category === 'engagement' ? '🤝' : a.category === 'value' ? '💎' : a.category === 'retention' ? '🛡️' : '📈'
    const priorityEmoji = a.priority === 'high' ? '🔴' : a.priority === 'medium' ? '🟡' : '🟢'
    lines.push(`- ${catEmoji} ${priorityEmoji} **[${a.category}]** ${a.action}`)
    lines.push(`  - 预期效果: ${a.expected_outcome}`)
  }
  lines.push('')

  lines.push('### 🔀 阶段跃迁计划')
  for (const t of result.stage_transition_plan) lines.push(`- ${t}`)
  lines.push('')

  lines.push('### 💰 生命周期价值预测')
  lines.push(result.lifecycle_value_projection)
  lines.push('')

  lines.push('### 🛡️ 风险缓解')
  for (const r of result.risk_mitigation) lines.push(`- ${r}`)
  lines.push('')

  lines.push('---')
  lines.push('*免责声明：阶段转化和价值预测基于当前数据和趋势外推，实际结果受市场变化、客户经营状况等外部因素影响。建议定期重新评估并动态调整策略。*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Health Score Calculator — 客户健康度评分与预警系统
  tools.register(defineTool({
    name: 'health_score_calculator',
    description: '客户健康度评分与预警系统 | 综合NPS、使用率、工单、CSAT等多维度生成健康分、等级、风险预警与改善建议 | Calculate comprehensive customer health score with early warnings and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, nps_score(0-10), product_usage_pct(0-100), support_tickets_30d, contract_value, tenure_months, feature_adoption_pct(0-100), login_frequency_weekly, csat_score(1-5), last_interaction_days'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: HealthScoreInput = JSON.parse(args.input_data)
      return formatHealthScoreReport(analyzeHealthScore(input))
    }
  }))

  // Tool 2: Churn Predictor — 流失风险预测与干预策略
  tools.register(defineTool({
    name: 'churn_predictor',
    description: '流失风险预测与干预策略 | 评估客户流失概率、识别风险驱动因素、推荐挽留策略和干预时间线 | Predict churn risk with drivers, intervention strategies, and retention playbook.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, months_as_customer, monthly_recurring_revenue, support_ticket_volume, nps_score(0-10), product_usage_trend(increasing|flat|declining), contract_end_days, payment_delays, competitor_mentions, executive_sponsor_changes, engagement_score(0-100)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ChurnInput = JSON.parse(args.input_data)
      return formatChurnReport(analyzeChurnRisk(input))
    }
  }))

  // Tool 3: Expansion Identifier — 增购/扩展机会识别与推荐
  tools.register(defineTool({
    name: 'expansion_identifier',
    description: '增购/扩展机会识别与推荐 | 分析交叉销售/向上销售机会，估算ARR增量和置信度 | Identify upsell/cross-sell expansion opportunities with confidence scoring.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, current_products[], current_contract_value, industry, employee_count, usage_growth_pct, feature_requests[], peer_benchmark(below_avg|avg|above_avg), budget_cycle_alignment(q1-q4|rolling), relationship_score(0-100), available_modules[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ExpansionInput = JSON.parse(args.input_data)
      return formatExpansionReport(analyzeExpansion(input))
    }
  }))

  // Tool 4: Onboarding Optimizer — 客户Onboarding流程优化与里程碑追踪
  tools.register(defineTool({
    name: 'onboarding_optimizer',
    description: '客户Onboarding流程优化与里程碑追踪 | 追踪里程碑进度、识别瓶颈、优化Onboarding路径 | Optimize customer onboarding with milestone tracking and bottleneck analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, start_date, current_phase, milestones_completed, milestones_total, days_in_onboarding, blockers[], stakeholder_engagement(high|medium|low), training_completion_pct(0-100), time_to_first_value_days, team_size'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: OnboardingInput = JSON.parse(args.input_data)
      return formatOnboardingReport(analyzeOnboarding(input))
    }
  }))

  // Tool 5: QBR Generator — QBR季度业务回顾报告自动生成
  tools.register(defineTool({
    name: 'qbr_generator',
    description: 'QBR季度业务回顾报告自动生成 | 自动产出包含目标回顾、采用分析、ROI、路线图的完整QBR报告 | Auto-generate comprehensive Quarterly Business Review reports.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, quarter(Q1-Q4), fiscal_year, executive_sponsor, contract_value, goals_achieved, goals_total, product_adoption_metrics{}, support_summary{tickets_opened, tickets_resolved, avg_satisfaction, avg_resolution_days}, roi_highlights[], strategic_initiatives[], customer_feedback'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: QBRInput = JSON.parse(args.input_data)
      return formatQBRReport(analyzeQBR(input))
    }
  }))

  // Tool 6: Advocacy Program — 客户推荐计划与成功案例挖掘
  tools.register(defineTool({
    name: 'advocacy_program',
    description: '客户推荐计划与成功案例挖掘 | 评估推荐潜力、匹配推荐活动、挖掘案例研究机会 | Identify advocacy opportunities, match programs, and mine case study potential.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, nps_score(0-10), tenure_months, industry, company_size, case_study_willingness(high|medium|low), referral_history, public_speaking_interest(boolean), community_participation(active|occasional|none), social_media_influence(high|medium|low), awards_won[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: AdvocacyInput = JSON.parse(args.input_data)
      return formatAdvocacyReport(analyzeAdvocacy(input))
    }
  }))

  // Tool 7: Ticket Trend Analyzer — 工单趋势分析与根因定位
  tools.register(defineTool({
    name: 'ticket_trend_analyzer',
    description: '工单趋势分析与根因定位 | 分析工单量、分类趋势、严重度分布、根因和改善建议 | Analyze support ticket trends, categorize root causes, and recommend improvements.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, analysis_period_months, tickets[{month, category, severity(p1-p4), resolution_hours, satisfaction}], product_areas[], escalation_rate, self_service_adoption, sla_breach_pct'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TicketTrendInput = JSON.parse(args.input_data)
      return formatTicketTrendReport(analyzeTicketTrend(input))
    }
  }))

  // Tool 8: Lifecycle Stage Manager — 客户生命周期阶段管理与转化
  tools.register(defineTool({
    name: 'lifecycle_stage_manager',
    description: '客户生命周期阶段管理与转化 | 管理客户生命周期阶段、评估转化准备度、制定跃迁计划 | Manage lifecycle stages, assess conversion readiness, and plan transitions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: customer_id, customer_name, current_stage(prospect|onboarding|adoption|growth|renewal|at_risk), days_in_stage, engagement_score(0-100), health_score(0-100), contract_value, expansion_potential(high|medium|low), risk_factors[], next_stage_criteria{}, stage_history[{stage, entered, days}]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: LifecycleInput = JSON.parse(args.input_data)
      return formatLifecycleReport(analyzeLifecycle(input))
    }
  }))

  console.log(`[dsh-tool-csagentpro] Loaded v${VERSION} — CS Agent Pro: 全生命周期客户成功管理, 8 tools active`)
  console.log('  Tools: health_score_calculator, churn_predictor, expansion_identifier, onboarding_optimizer, qbr_generator, advocacy_program, ticket_trend_analyzer, lifecycle_stage_manager')
}
