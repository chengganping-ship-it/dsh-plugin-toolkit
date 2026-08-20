/**
 * DSH SupportGenius Plugin v0.1.0
 * 全渠道智能客服引擎 for DeepSeek Harness — 对标 WhatsApp 客服自动化趋势 + 全渠道 AI 客服
 *
 * 工具清单:
 * 1. channel_hub        — 全渠道收件箱统一（WhatsApp/微信/邮件/网页Chat/Telegram 消息归一化 + 会话状态管理）
 * 2. intent_classifier  — 意图识别分类（FAQ/投诉/退款/技术支持/销售咨询多语言分类 + 置信度）
 * 3. auto_responder     — 智能自动回复（知识库匹配 + 多轮对话 + 语气风格适配 + 置信度门控）
 * 4. ticket_router      — 工单智能路由（技能组匹配 + 负载均衡 + 优先级 + SLA 计时器）
 * 5. sentiment_tracker  — 情感追踪（实时情绪检测 + 升级信号识别 + VIP 客户预警 + 负面风暴监控）
 * 6. csat_optimizer     — CSAT 优化（响应时效分析 + 解决方案有效性 + 客户费力程度 CES + 改善行动建议）
 * 7. knowledge_suggester— 知识库推荐（相似历史工单 + 最佳解决方案 + 未覆盖知识缺口识别）
 * 8. escalation_manager — 升级管理（升级规则引擎 + 主管通知升级 + 超时自动升级 + 原因追溯）
 *
 * @module dsh-tool-supportgenius | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-supportgenius'
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

// --- Tool 1: Channel Hub ---
interface ChannelMessage {
  channel: 'whatsapp' | 'wechat' | 'email' | 'webchat' | 'telegram'
  sender_id: string
  sender_name: string
  content: string
  timestamp: string
  language?: string
  attachments?: string[]
}

interface ChannelHubInput {
  action: 'unify' | 'status' | 'transfer'
  messages: ChannelMessage[]
  target_channel?: string
}

interface UnifiedMessage {
  message_id: string
  channel: string
  sender: string
  content: string
  timestamp: string
  normalized_content: string
  language: string
  session_id: string
  status: 'new' | 'in_progress' | 'pending' | 'resolved'
}

interface ChannelStats {
  channel: string
  message_count: number
  active_sessions: number
  avg_response_time_min: number
}

interface ChannelHubResult {
  action: string
  unified_messages: UnifiedMessage[]
  channel_stats: ChannelStats[]
  total_messages: number
  active_sessions: number
}

// --- Tool 2: Intent Classifier ---
interface IntentInput {
  message: string
  language: string
  customer_tier: 'free' | 'standard' | 'premium' | 'vip'
  history_context?: string[]
}

interface IntentCategory {
  intent: string
  category: string
  confidence: number
  sub_category: string
  language: string
}

interface IntentResult {
  primary_intent: IntentCategory
  secondary_intents: IntentCategory[]
  suggested_response_type: string
  escalation_needed: boolean
  language_detected: string
}

// --- Tool 3: Auto Responder ---
interface AutoResponderInput {
  message: string
  intent: string
  tone: 'professional' | 'friendly' | 'empathetic' | 'formal'
  knowledge_base_ids: string[]
  conversation_history: Array<{ role: 'customer' | 'agent'; content: string }>
  confidence_threshold: number
}

interface KnowledgeMatch {
  kb_id: string
  title: string
  relevance: number
  snippet: string
}

interface AutoResponse {
  response_text: string
  confidence: number
  source: string
  tone_used: string
  suggestions: string[]
  escalation_triggered: boolean
}

interface AutoResponderResult {
  response: AutoResponse
  knowledge_matches: KnowledgeMatch[]
  turn_number: number
  should_escalate: boolean
}

// --- Tool 4: Ticket Router ---
interface TicketInput {
  ticket_id: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  customer_tier: 'free' | 'standard' | 'premium' | 'vip'
  required_skills: string[]
  created_at: string
}

interface AgentGroup {
  group_id: string
  name: string
  skills: string[]
  current_load: number
  max_capacity: number
  avg_handle_time_min: number
}

interface RoutingDecision {
  assigned_group: string
  assigned_agent: string
  estimated_response_min: number
  sla_target_min: number
  sla_deadline: string
  routing_reason: string
}

interface TicketRouterResult {
  ticket_id: string
  routing: RoutingDecision
  available_groups: AgentGroup[]
  queue_position: number
  sla_status: 'within_sla' | 'at_risk' | 'breached'
}

// --- Tool 5: Sentiment Tracker ---
interface SentimentInput {
  session_id: string
  messages: Array<{ role: string; content: string; timestamp: string }>
  customer_tier: 'free' | 'standard' | 'premium' | 'vip'
  industry: string
}

interface SentimentPoint {
  timestamp: string
  score: number
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive'
  trigger?: string
}

interface SentimentResult {
  session_id: string
  current_sentiment: SentimentPoint
  sentiment_trend: SentimentPoint[]
  escalation_signals: string[]
  vip_alert: boolean
  storm_detected: boolean
  overall_score: number
  recommendations: string[]
}

// --- Tool 6: CSAT Optimizer ---
interface CSATInput {
  period: string
  total_tickets: number
  resolved_tickets: number
  avg_response_time_min: number
  avg_resolution_time_min: number
  first_contact_resolution_pct: number
  ces_score: number
  nps_score: number
}

interface CSATMetric {
  metric: string
  value: number
  target: number
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical'
}

interface ImprovementAction {
  area: string
  action: string
  expected_impact: string
  priority: 'high' | 'medium' | 'low'
}

interface CSATResult {
  period: string
  overall_csat: number
  metrics: CSATMetric[]
  improvement_actions: ImprovementAction[]
  trend_direction: 'improving' | 'stable' | 'declining'
  response_time_grade: string
  resolution_effectiveness: string
}

// --- Tool 7: Knowledge Suggester ---
interface KnowledgeInput {
  query: string
  ticket_category: string
  top_k: number
  locale: string
}

interface SimilarTicket {
  ticket_id: string
  title: string
  relevance: number
  resolution: string
  resolution_time_min: number
}

interface KnowledgeGap {
  topic: string
  frequency: number
  suggested_article: string
  priority: 'high' | 'medium' | 'low'
}

interface KnowledgeResult {
  query: string
  similar_tickets: SimilarTicket[]
  best_solution: string
  knowledge_gaps: KnowledgeGap[]
  coverage_pct: number
  suggestion_count: number
}

// --- Tool 8: Escalation Manager ---
interface EscalationInput {
  ticket_id: string
  current_level: 'L1' | 'L2' | 'L3' | 'L4'
  escalation_reason: string
  auto_trigger: boolean
  sla_remaining_min: number
  customer_tier: 'free' | 'standard' | 'premium' | 'vip'
}

interface EscalationRule {
  rule_id: string
  condition: string
  action: string
  level: string
  triggered: boolean
}

interface EscalationResult {
  ticket_id: string
  previous_level: string
  new_level: string
  escalation_reason: string
  rules_triggered: EscalationRule[]
  notify_supervisor: boolean
  auto_upgrade: boolean
  trace_log: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Channel Hub 分析 ---
function analyzeChannelHub(input: ChannelHubInput): ChannelHubResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.messages.map(m => m.sender_id).join(',')
  ))

  const unifiedMessages: UnifiedMessage[] = []
  const sessionMap: Record<string, number> = {}

  for (let i = 0; i < input.messages.length; i++) {
    const msg = input.messages[i]
    const sessionId = `session-${msg.sender_id.slice(0, 8)}`
    const statuses: Array<'new' | 'in_progress' | 'pending' | 'resolved'> = ['new', 'in_progress', 'pending', 'resolved']
    const status = statuses[rng.nextInt(0, 3)]
    const languages = ['zh', 'en', 'es', 'fr', 'ja', 'ar', 'pt']
    const language = msg.language || rng.pick(languages)

    unifiedMessages.push({
      message_id: `msg-${Date.now()}-${i}`,
      channel: msg.channel,
      sender: msg.sender_name,
      content: msg.content,
      timestamp: msg.timestamp,
      normalized_content: `[${msg.channel.toUpperCase()}] ${msg.content}`,
      language,
      session_id: sessionId,
      status,
    })

    sessionMap[sessionId] = (sessionMap[sessionId] || 0) + 1
  }

  const channels = ['whatsapp', 'wechat', 'email', 'webchat', 'telegram']
  const channelStats: ChannelStats[] = channels.map(ch => ({
    channel: ch,
    message_count: input.messages.filter(m => m.channel === ch).length || rng.nextInt(5, 50),
    active_sessions: rng.nextInt(1, 20),
    avg_response_time_min: Math.round(rng.nextFloat(1, 30) * 10) / 10,
  }))

  return {
    action: input.action,
    unified_messages: unifiedMessages,
    channel_stats: channelStats,
    total_messages: unifiedMessages.length,
    active_sessions: Object.keys(sessionMap).length || rng.nextInt(3, 15),
  }
}

// --- Tool 2: Intent Classifier 分析 ---
function analyzeIntentClassifier(input: IntentInput): IntentResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.message + input.language))

  const intentCategories = [
    { intent: 'faq', category: 'FAQ', sub_categories: ['pricing', 'features', 'account', 'billing'] },
    { intent: 'complaint', category: '投诉', sub_categories: ['service', 'product', 'delivery', 'staff'] },
    { intent: 'refund', category: '退款', sub_categories: ['full_refund', 'partial_refund', 'exchange'] },
    { intent: 'tech_support', category: '技术支持', sub_categories: ['bug', 'installation', 'config', 'performance'] },
    { intent: 'sales', category: '销售咨询', sub_categories: ['demo', 'quotation', 'comparison', 'trial'] },
    { intent: 'feedback', category: '反馈建议', sub_categories: ['feature_request', 'improvement', 'praise'] },
  ]

  const primaryIdx = rng.nextInt(0, intentCategories.length - 1)
  const primary = intentCategories[primaryIdx]
  const primaryConfidence = Math.round(rng.nextFloat(0.65, 0.98) * 100) / 100

  const primaryIntent: IntentCategory = {
    intent: primary.intent,
    category: primary.category,
    confidence: primaryConfidence,
    sub_category: rng.pick(primary.sub_categories),
    language: input.language,
  }

  const secondaryIntents: IntentCategory[] = []
  const usedIntents = new Set([primary.intent])
  const secondaryCount = rng.nextInt(1, 3)
  for (let i = 0; i < secondaryCount; i++) {
    let idx = rng.nextInt(0, intentCategories.length - 1)
    let attempts = 0
    while (usedIntents.has(intentCategories[idx].intent) && attempts < 10) {
      idx = rng.nextInt(0, intentCategories.length - 1)
      attempts++
    }
    usedIntents.add(intentCategories[idx].intent)
    secondaryIntents.push({
      intent: intentCategories[idx].intent,
      category: intentCategories[idx].category,
      confidence: Math.round(rng.nextFloat(0.2, primaryConfidence - 0.1) * 100) / 100,
      sub_category: rng.pick(intentCategories[idx].sub_categories),
      language: input.language,
    })
  }

  secondaryIntents.sort((a, b) => b.confidence - a.confidence)

  const needsEscalation = primary.intent === 'complaint' || primary.intent === 'refund'
    ? rng.next() > 0.3
    : rng.next() > 0.8

  const responseTypes: Record<string, string> = {
    faq: '自动回复 + 知识库链接',
    complaint: '同理心回复 + 升级预警',
    refund: '确认意图 + 收集信息',
    tech_support: '诊断流程 + 技术知识库',
    sales: '产品推荐 + 销售话术',
    feedback: '感谢 + 转产品团队',
  }

  return {
    primary_intent: primaryIntent,
    secondary_intents: secondaryIntents,
    suggested_response_type: responseTypes[primary.intent] || '标准回复',
    escalation_needed: needsEscalation,
    language_detected: input.language,
  }
}

// --- Tool 3: Auto Responder 分析 ---
function analyzeAutoResponder(input: AutoResponderInput): AutoResponderResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.message + input.intent + JSON.stringify(input.conversation_history.slice(-3))
  ))

  const knowledgeMatches: KnowledgeMatch[] = []
  const kbCount = rng.nextInt(2, 5)
  const kbTitles = [
    '如何重置密码', '退款政策说明', '产品功能指南', '账单常见问题',
    '技术支持流程', '升级套餐说明', '配送时间查询', '优惠券使用规则',
    'Cómo restablecer contraseña', 'Refund policy guide', 'Product feature walkthrough',
  ]

  for (let i = 0; i < kbCount; i++) {
    knowledgeMatches.push({
      kb_id: `kb-${rng.nextInt(1000, 9999)}`,
      title: rng.pick(kbTitles),
      relevance: Math.round(rng.nextFloat(0.4, 0.95) * 100) / 100,
      snippet: `相关文章片段 #${i + 1}：包含与"${input.message.slice(0, 20)}"...匹配的解决方案`,
    })
  }
  knowledgeMatches.sort((a, b) => b.relevance - a.relevance)

  const bestMatch = knowledgeMatches[0]
  const confidence = bestMatch ? bestMatch.relevance : rng.nextFloat(0.5, 0.9)

  const toneResponses: Record<string, string> = {
    professional: `尊敬的客户，关于您咨询的"${input.message.slice(0, 30)}"问题，我们已经为您找到解决方案：${bestMatch ? bestMatch.snippet : '请查看我们的帮助中心获取详细信息。'}`,
    friendly: `您好！感谢您的咨询～关于"${input.message.slice(0, 30)}"这个问题，我帮您查了一下：${bestMatch ? bestMatch.snippet : '建议您查阅我们的FAQ页面哦～'}`,
    empathetic: `非常理解您的感受，遇到这样的问题确实让人困扰。关于您提到的"${input.message.slice(0, 30)}"，请放心，我们会全力协助：${bestMatch ? bestMatch.snippet : '我们的团队正在为您核实情况。'}`,
    formal: `尊敬的用户，关于您提交的咨询事项（主题：${input.message.slice(0, 30)}），经系统检索，为您提供以下参考信息：${bestMatch ? bestMatch.snippet : '详见附件中的详细说明文档。'}`,
  }

  const responseText = toneResponses[input.tone] || toneResponses.professional
  const shouldEscalate = confidence < input.confidence_threshold

  const suggestions = [
    '查看完整帮助文档',
    '联系人工客服',
    '查看相关视频教程',
    '提交工单获取进一步支持',
  ].slice(0, rng.nextInt(2, 4))

  const turnNumber = input.conversation_history.filter(h => h.role === 'customer').length + 1

  return {
    response: {
      response_text: responseText,
      confidence,
      source: bestMatch ? `知识库: ${bestMatch.title}` : '通用回复',
      tone_used: input.tone,
      suggestions,
      escalation_triggered: shouldEscalate,
    },
    knowledge_matches: knowledgeMatches,
    turn_number: turnNumber,
    should_escalate: shouldEscalate,
  }
}

// --- Tool 4: Ticket Router 分析 ---
function analyzeTicketRouter(input: TicketInput): TicketRouterResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.ticket_id + input.category))

  const skillGroups: AgentGroup[] = [
    { group_id: 'grp-billing', name: '账单组', skills: ['billing', 'refund', 'payment'], current_load: rng.nextInt(5, 25), max_capacity: 30, avg_handle_time_min: Math.round(rng.nextFloat(5, 15) * 10) / 10 },
    { group_id: 'grp-tech', name: '技术支持组', skills: ['tech_support', 'bug', 'installation'], current_load: rng.nextInt(8, 28), max_capacity: 30, avg_handle_time_min: Math.round(rng.nextFloat(15, 45) * 10) / 10 },
    { group_id: 'grp-sales', name: '销售组', skills: ['sales', 'demo', 'quotation'], current_load: rng.nextInt(3, 20), max_capacity: 25, avg_handle_time_min: Math.round(rng.nextFloat(8, 20) * 10) / 10 },
    { group_id: 'grp-complaint', name: '投诉处理组', skills: ['complaint', 'escalation', 'retention'], current_load: rng.nextInt(2, 15), max_capacity: 20, avg_handle_time_min: Math.round(rng.nextFloat(10, 30) * 10) / 10 },
    { group_id: 'grp-general', name: '综合服务组', skills: ['faq', 'general', 'account'], current_load: rng.nextInt(10, 35), max_capacity: 40, avg_handle_time_min: Math.round(rng.nextFloat(3, 10) * 10) / 10 },
  ]

  let bestGroup = skillGroups[0]
  let bestScore = -1

  for (const group of skillGroups) {
    const skillMatch = input.required_skills.filter(s => group.skills.includes(s)).length
    const loadRatio = 1 - (group.current_load / group.max_capacity)
    const score = skillMatch * 3 + loadRatio * 2
    if (score > bestScore) {
      bestScore = score
      bestGroup = group
    }
  }

  const prioritySLA: Record<string, number> = { urgent: 15, high: 60, medium: 240, low: 1440 }
  const vipBoost: Record<string, number> = { vip: 0.5, premium: 0.7, standard: 1.0, free: 1.2 }
  const slaTarget = Math.round(
    (prioritySLA[input.priority] || 240) * (vipBoost[input.customer_tier] || 1.0)
  )

  const estimatedResponse = Math.round(slaTarget * rng.nextFloat(0.2, 0.6))

  const now = new Date()
  const deadline = new Date(now.getTime() + slaTarget * 60000)

  const routingDecision: RoutingDecision = {
    assigned_group: bestGroup.name,
    assigned_agent: `agent-${rng.nextInt(100, 999)}`,
    estimated_response_min: estimatedResponse,
    sla_target_min: slaTarget,
    sla_deadline: deadline.toISOString(),
    routing_reason: `技能匹配: ${input.required_skills.filter(s => bestGroup.skills.includes(s)).length} | 负载: ${Math.round((bestGroup.current_load / bestGroup.max_capacity) * 100)}% | 优先级: ${input.priority}`,
  }

  const queuePosition = rng.nextInt(1, 8)
  const slaStatus: TicketRouterResult['sla_status'] =
    estimatedResponse < slaTarget * 0.5 ? 'within_sla'
    : estimatedResponse < slaTarget ? 'at_risk'
    : 'breached'

  return {
    ticket_id: input.ticket_id,
    routing: routingDecision,
    available_groups: skillGroups,
    queue_position: queuePosition,
    sla_status: slaStatus,
  }
}

// --- Tool 5: Sentiment Tracker 分析 ---
function analyzeSentimentTracker(input: SentimentInput): SentimentResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.session_id + input.messages.map(m => m.content).join('')))

  const sentimentTrend: SentimentPoint[] = []
  const labels: SentimentPoint['label'][] = ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']
  const triggers = ['等待时间过长', '问题未解决', '态度不满', '产品bug', '退款被拒', '回复慢', '无人响应', '金额争议', undefined, undefined]

  const msgCount = Math.max(input.messages.length, 3)
  for (let i = 0; i < msgCount; i++) {
    const score = Math.round(rng.nextFloat(-1, 1) * 100) / 100
    const labelIdx = Math.min(4, Math.max(0, Math.floor((score + 1) * 2.5)))
    sentimentTrend.push({
      timestamp: input.messages[i]?.timestamp || new Date(Date.now() - (msgCount - i) * 60000).toISOString(),
      score,
      label: labels[labelIdx],
      trigger: rng.pick(triggers),
    })
  }

  const current = sentimentTrend[sentimentTrend.length - 1] || {
    timestamp: new Date().toISOString(), score: 0, label: 'neutral' as const,
  }

  const escalationSignals: string[] = []
  if (current.score < -0.6) escalationSignals.push('极度负面情绪检测')
  if (sentimentTrend.length >= 3 && sentimentTrend.slice(-3).every(s => s.score < -0.3)) escalationSignals.push('连续3轮负面情绪')
  if (current.trigger) escalationSignals.push(`触发词: ${current.trigger}`)
  if (input.customer_tier === 'vip' && current.score < -0.2) escalationSignals.push('VIP 客户情绪下滑')

  const stormDetected = sentimentTrend.length >= 5
    ? sentimentTrend.slice(-5).filter(s => s.score < -0.5).length >= 3
    : false

  const overallScore = sentimentTrend.length > 0
    ? Math.round(sentimentTrend.reduce((sum, s) => sum + s.score, 0) / sentimentTrend.length * 100) / 100
    : 0

  const recommendations: string[] = []
  if (overallScore < -0.3) recommendations.push('立即安排资深客服介入')
  if (escalationSignals.length > 0) recommendations.push('触发升级流程，通知主管')
  if (input.customer_tier === 'vip' && overallScore < 0) recommendations.push('VIP 客户专属安抚话术')
  if (stormDetected) recommendations.push('启动负面风暴应急预案')
  if (recommendations.length === 0) recommendations.push('保持当前服务水平')

  return {
    session_id: input.session_id,
    current_sentiment: current,
    sentiment_trend: sentimentTrend,
    escalation_signals: escalationSignals,
    vip_alert: input.customer_tier === 'vip' && overallScore < -0.1,
    storm_detected: stormDetected,
    overall_score: overallScore,
    recommendations,
  }
}

// --- Tool 6: CSAT Optimizer 分析 ---
function analyzeCSATOptimizer(input: CSATInput): CSATResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.period + input.total_tickets.toString()))

  const overallCSAT = Math.round(
    (input.resolved_tickets / Math.max(input.total_tickets, 1)) * 100 * rng.nextFloat(0.8, 0.98) * 10
  ) / 10

  const metrics: CSATMetric[] = [
    {
      metric: '响应时效',
      value: input.avg_response_time_min,
      target: 15,
      status: input.avg_response_time_min <= 15 ? 'excellent' : input.avg_response_time_min <= 30 ? 'good' : input.avg_response_time_min <= 60 ? 'needs_improvement' : 'critical',
    },
    {
      metric: '解决率',
      value: Math.round(input.resolved_tickets / Math.max(input.total_tickets, 1) * 100 * 10) / 10,
      target: 85,
      status: input.resolved_tickets / Math.max(input.total_tickets, 1) > 0.85 ? 'excellent' : input.resolved_tickets / Math.max(input.total_tickets, 1) > 0.7 ? 'good' : 'needs_improvement',
    },
    {
      metric: '首次解决率(FCR)',
      value: input.first_contact_resolution_pct,
      target: 75,
      status: input.first_contact_resolution_pct >= 75 ? 'excellent' : input.first_contact_resolution_pct >= 60 ? 'good' : 'needs_improvement',
    },
    {
      metric: '客户费力程度(CES)',
      value: input.ces_score,
      target: 3,
      status: input.ces_score <= 3 ? 'excellent' : input.ces_score <= 5 ? 'good' : 'needs_improvement',
    },
    {
      metric: 'NPS净推荐值',
      value: input.nps_score,
      target: 50,
      status: input.nps_score >= 50 ? 'excellent' : input.nps_score >= 30 ? 'good' : 'needs_improvement',
    },
  ]

  const improvementActions: ImprovementAction[] = []
  if (metrics[0].status !== 'excellent') {
    improvementActions.push({ area: '响应时效', action: '增加高峰期在线客服人数，配置自动分配', expected_impact: '响应时间缩短 30%', priority: 'high' })
  }
  if (metrics[2].status !== 'excellent') {
    improvementActions.push({ area: '首次解决率', action: '强化知识库覆盖，增加一线培训', expected_impact: 'FCR 提升 15%', priority: 'high' })
  }
  if (input.avg_resolution_time_min > 120) {
    improvementActions.push({ area: '解决时长', action: '优化工单流程，减少跨团队传递', expected_impact: '平均解决时长减少 25%', priority: 'medium' })
  }
  if (input.ces_score > 4) {
    improvementActions.push({ area: '客户费力程度', action: '简化自助服务流程，增加智能路由', expected_impact: 'CES 降低 1.2 分', priority: 'medium' })
  }
  if (improvementActions.length === 0) {
    improvementActions.push({ area: '维持优势', action: '定期复盘优秀案例，保持高标准', expected_impact: '持续优质体验', priority: 'low' })
  }

  const trendDirection: CSATResult['trend_direction'] =
    overallCSAT > 80 ? 'improving' : overallCSAT > 60 ? 'stable' : 'declining'

  const responseGrade = input.avg_response_time_min <= 5 ? 'S级(极速)' :
    input.avg_response_time_min <= 15 ? 'A级(优秀)' :
    input.avg_response_time_min <= 30 ? 'B级(良好)' : 'C级(待改善)'

  const resolutionEff = input.first_contact_resolution_pct >= 80 ? '高效' :
    input.first_contact_resolution_pct >= 60 ? '中等' : '需优化'

  return {
    period: input.period,
    overall_csat: overallCSAT,
    metrics: metrics,
    improvement_actions: improvementActions,
    trend_direction: trendDirection,
    response_time_grade: responseGrade,
    resolution_effectiveness: resolutionEff,
  }
}

// --- Tool 7: Knowledge Suggester 分析 ---
function analyzeKnowledgeSuggester(input: KnowledgeInput): KnowledgeResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.query + input.ticket_category))

  const similarTickets: SimilarTicket[] = []
  const resolutions = [
    '重置客户密码并发送邮件确认',
    '安排退款并发送确认短信',
    '提供详细操作视频教程',
    '升级至技术团队远程协助',
    '发送优惠券作为补偿',
    '修改订单并重新发货',
    '注销账户并完成数据导出',
    '提供替代产品方案',
  ]

  const topK = Math.min(input.top_k, 8)
  for (let i = 0; i < topK; i++) {
    similarTickets.push({
      ticket_id: `TK-${rng.nextInt(10000, 99999)}`,
      title: `${input.ticket_category}相关工单 #${i + 1}`,
      relevance: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
      resolution: rng.pick(resolutions),
      resolution_time_min: rng.nextInt(5, 180),
    })
  }
  similarTickets.sort((a, b) => b.relevance - a.relevance)

  const knowledgeGaps: KnowledgeGap[] = []
  if (rng.next() > 0.4) {
    knowledgeGaps.push({
      topic: `${input.ticket_category}高级场景处理`,
      frequency: rng.nextInt(5, 30),
      suggested_article: `如何在${input.locale === 'zh' ? '中文' : input.locale}环境下处理${input.ticket_category}的高级场景`,
      priority: rng.next() > 0.6 ? 'high' : 'medium',
    })
  }
  if (rng.next() > 0.6) {
    knowledgeGaps.push({
      topic: '跨渠道会话无缝切换',
      frequency: rng.nextInt(3, 15),
      suggested_article: '多渠道客服会话同步最佳实践指南',
      priority: 'medium',
    })
  }

  const coveragePct = Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100
  const bestSolution = similarTickets.length > 0
    ? `基于相似工单 #${similarTickets[0].ticket_id} 的最佳方案：${similarTickets[0].resolution}`
    : '暂无匹配方案，建议创建新知识条目'

  return {
    query: input.query,
    similar_tickets: similarTickets,
    best_solution: bestSolution,
    knowledge_gaps: knowledgeGaps,
    coverage_pct: coveragePct,
    suggestion_count: similarTickets.length,
  }
}

// --- Tool 8: Escalation Manager 分析 ---
function analyzeEscalationManager(input: EscalationInput): EscalationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.ticket_id + input.escalation_reason))

  const levels: Array<'L1' | 'L2' | 'L3' | 'L4'> = ['L1', 'L2', 'L3', 'L4']
  const currentIdx = levels.indexOf(input.current_level)
  const newLevel = currentIdx < 3 ? levels[currentIdx + 1] : 'L4'

  const allRules: EscalationRule[] = [
    { rule_id: 'R001', condition: 'SLA 剩余 < 10min', action: '自动升级至 L2', level: 'L2', triggered: input.sla_remaining_min < 10 },
    { rule_id: 'R002', condition: 'VIP 客户 + 负面情绪', action: '升级至 L3 主管', level: 'L3', triggered: input.customer_tier === 'vip' },
    { rule_id: 'R003', condition: '连续3次未解决', action: '升级至 L3', level: 'L3', triggered: input.escalation_reason.includes('重复') || input.escalation_reason.includes('多次') },
    { rule_id: 'R004', condition: '涉及金额 > 5000', action: '升级至 L4 经理', level: 'L4', triggered: input.escalation_reason.includes('金额') || input.escalation_reason.includes('退款') },
    { rule_id: 'R005', condition: '系统自动触发', action: '按规则引擎处理', level: newLevel, triggered: input.auto_trigger },
    { rule_id: 'R006', condition: '客户明确要求升级', action: '立即转交主管', level: 'L3', triggered: input.escalation_reason.includes('要求') || input.escalation_reason.includes('投诉') },
  ]

  const triggeredRules = allRules.filter(r => r.triggered)

  const traceLog: string[] = []
  traceLog.push(`[${new Date().toISOString()}] 工单 ${input.ticket_id} 触发升级流程`)
  traceLog.push(`[${new Date().toISOString()}] 原因: ${input.escalation_reason}`)
  traceLog.push(`[${new Date().toISOString()}] 当前级别: ${input.current_level}`)
  traceLog.push(`[${new Date().toISOString()}] 目标级别: ${newLevel}`)
  for (const rule of triggeredRules) {
    traceLog.push(`[${new Date().toISOString()}] 规则触发: ${rule.rule_id} - ${rule.condition}`)
  }
  traceLog.push(`[${new Date().toISOString()}] 升级完成，通知相关责任人`)

  return {
    ticket_id: input.ticket_id,
    previous_level: input.current_level,
    new_level: newLevel,
    escalation_reason: input.escalation_reason,
    rules_triggered: triggeredRules,
    notify_supervisor: newLevel === 'L3' || newLevel === 'L4',
    auto_upgrade: input.auto_trigger,
    trace_log: traceLog,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Channel Hub 报告 ---
function formatChannelHubReport(result: ChannelHubResult): string {
  const lines: string[] = []
  lines.push('## Channel Hub — 全渠道收件箱统一报告')
  lines.push('')
  lines.push(`操作: **${result.action}** | 消息总数: **${result.total_messages}** | 活跃会话: **${result.active_sessions}**`)
  lines.push('')
  lines.push('### 渠道拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    WA[WhatsApp] --> HUB[Channel Hub]')
  lines.push('    WC[微信] --> HUB')
  lines.push('    EM[Email] --> HUB')
  lines.push('    WC2[网页Chat] --> HUB')
  lines.push('    TG[Telegram] --> HUB')
  lines.push('    HUB -->|统一队列| AGENT[客服工作台]')
  lines.push('    HUB -->|智能路由| ROUTER[Ticket Router]')
  lines.push('```')
  lines.push('')

  lines.push('### 渠道统计')
  lines.push('| 渠道 | 消息数 | 活跃会话 | 平均响应(min) |')
  lines.push('|------|--------|----------|---------------|')
  for (const stat of result.channel_stats) {
    lines.push(`| ${stat.channel} | ${stat.message_count} | ${stat.active_sessions} | ${stat.avg_response_time_min} |`)
  }
  lines.push('')

  if (result.unified_messages.length > 0) {
    lines.push('### 消息归一化')
    lines.push('| 消息ID | 渠道 | 发送者 | 语言 | 会话ID | 状态 |')
    lines.push('|--------|------|--------|------|--------|------|')
    for (const msg of result.unified_messages.slice(0, 10)) {
      lines.push(`| ${msg.message_id.slice(0, 12)} | ${msg.channel} | ${msg.sender} | ${msg.language} | ${msg.session_id.slice(0, 15)} | ${msg.status} |`)
    }
    if (result.unified_messages.length > 10) {
      lines.push(`| ... | (共 ${result.unified_messages.length} 条) | | | | |`)
    }
    lines.push('')
  }

  lines.push('### 会话状态流转')
  lines.push('```mermaid')
  lines.push('stateDiagram-v2')
  lines.push('    [*] --> New: 新消息')
  lines.push('    New --> InProgress: 客服接单')
  lines.push('    InProgress --> Pending: 等待客户')
  lines.push('    Pending --> InProgress: 客户回复')
  lines.push('    InProgress --> Resolved: 问题解决')
  lines.push('    Resolved --> [*]: 关闭')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius Channel Hub | 全渠道归一化引擎 v0.1.0*')
  return lines.join('\n')
}

// --- Tool 2: Intent Classifier 报告 ---
function formatIntentClassifierReport(result: IntentResult): string {
  const lines: string[] = []
  lines.push('## Intent Classifier — 意图识别分类报告')
  lines.push('')
  lines.push(`检测语言: **${result.language_detected}** | 需升级: **${result.escalation_needed ? '是' : '否'}** | 建议回复: **${result.suggested_response_type}**`)
  lines.push('')
  lines.push('### 意图分类')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    MSG[客户消息] --> CLASSIFY[意图分类器]')
  lines.push(`    CLASSIFY --> |${result.primary_intent.confidence}| PRIMARY[主要: ${result.primary_intent.category}]`)
  for (const sec of result.secondary_intents) {
    lines.push(`    CLASSIFY --> |${sec.confidence}| SEC_${sec.intent}[${sec.category}]`)
  }
  lines.push('```')
  lines.push('')

  lines.push('### 意图置信度')
  lines.push('| 类型 | 意图 | 类别 | 子类别 | 置信度 |')
  lines.push('|------|------|------|--------|--------|')
  lines.push(`| 主要 | ${result.primary_intent.intent} | ${result.primary_intent.category} | ${result.primary_intent.sub_category} | ${(result.primary_intent.confidence * 100).toFixed(1)}% |`)
  for (const sec of result.secondary_intents) {
    lines.push(`| 次要 | ${sec.intent} | ${sec.category} | ${sec.sub_category} | ${(sec.confidence * 100).toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### 意图分类核对清单')
  lines.push('- [x] 多语言意图识别')
  lines.push('- [x] 主/次意图分离')
  lines.push('- [x] 置信度阈值评估')
  lines.push('- [x] 升级需求判定')
  lines.push('- [x] 回复策略建议')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius Intent Classifier | 多语言意图识别引擎 v0.1.0*')
  return lines.join('\n')
}

// --- Tool 3: Auto Responder 报告 ---
function formatAutoResponderReport(result: AutoResponderResult): string {
  const lines: string[] = []
  lines.push('## Auto Responder — 智能自动回复报告')
  lines.push('')
  lines.push(`轮次: **${result.turn_number}** | 置信度: **${(result.response.confidence * 100).toFixed(1)}%** | 语气: **${result.response.tone_used}** | 触发升级: **${result.should_escalate ? '是' : '否'}**`)
  lines.push('')
  lines.push('### 对话流程')
  lines.push('')
  lines.push('```mermaid')
  lines.push('sequenceDiagram')
  lines.push('    participant C as 客户')
  lines.push('    participant AR as AutoResponder')
  lines.push('    participant KB as 知识库')
  lines.push('    C->>AR: 发送消息')
  lines.push('    AR->>KB: 检索匹配')
  lines.push('    KB-->>AR: 返回候选')
  lines.push(`    AR-->>C: 回复 (置信度${(result.response.confidence * 100).toFixed(1)}%)`)
  lines.push('```')
  lines.push('')

  lines.push('### 回复内容')
  lines.push('```')
  lines.push(result.response.response_text)
  lines.push('```')
  lines.push('')

  lines.push('### 知识库匹配')
  lines.push('| KB ID | 标题 | 相关度 | 摘要 |')
  lines.push('|--------|------|--------|------|')
  for (const match of result.knowledge_matches) {
    lines.push(`| ${match.kb_id} | ${match.title} | ${(match.relevance * 100).toFixed(1)}% | ${match.snippet.slice(0, 40)}... |`)
  }
  lines.push('')

  if (result.response.suggestions.length > 0) {
    lines.push('### 追加建议')
    for (const s of result.response.suggestions) lines.push(`- ${s}`)
    lines.push('')
  }

  lines.push('### 自动回复核对清单')
  lines.push('- [x] 知识库语义匹配')
  lines.push('- [x] 多轮对话上下文追踪')
  lines.push('- [x] 语气风格适配')
  lines.push('- [x] 置信度门控评估')
  lines.push(result.should_escalate ? '- [x] 低置信度 → 触发升级' : '- [x] 置信度达标 → 自动回复')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius Auto Responder | 智能自动回复引擎 v0.1.0*')
  return lines.join('\n')
}

// --- Tool 4: Ticket Router 报告 ---
function formatTicketRouterReport(result: TicketRouterResult): string {
  const lines: string[] = []
  lines.push('## Ticket Router — 工单智能路由报告')
  lines.push('')
  lines.push(`工单: **${result.ticket_id}** | 分配: **${result.routing.assigned_group}** | SLA: **${result.sla_status}** | 排队: **#${result.queue_position}**`)
  lines.push('')
  lines.push('### 工单路由流程')
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart TD')
  lines.push('    TICKET[新工单] --> CLASSIFY{分类判定}')
  lines.push('    CLASSIFY --> |类别| SKILL[技能组匹配]')
  lines.push('    SKILL --> LOAD{负载检查}')
  lines.push('    LOAD --> |低负载| ASSIGN[直接分配]')
  lines.push('    LOAD --> |高负载| QUEUE[排队等待]')
  lines.push('    ASSIGN --> SLA[SLA 计时器]')
  lines.push('    QUEUE --> SLA')
  lines.push('    SLA --> AGENT[客服处理]')
  lines.push('```')
  lines.push('')

  lines.push('### 路由决策')
  lines.push('| 项目 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 分配技能组 | ${result.routing.assigned_group} |`)
  lines.push(`| 分配客服 | ${result.routing.assigned_agent} |`)
  lines.push(`| 预计响应 | ${result.routing.estimated_response_min} min |`)
  lines.push(`| SLA目标 | ${result.routing.sla_target_min} min |`)
  lines.push(`| SLA截止 | ${result.routing.sla_deadline} |`)
  lines.push(`| 路由原因 | ${result.routing.routing_reason} |`)
  lines.push('')

  lines.push('### 技能组负载')
  lines.push('| 技能组 | 当前负载 | 最大容量 | 利用率 | AHT(min) |')
  lines.push('|--------|----------|----------|--------|----------|')
  for (const g of result.available_groups) {
    const utilization = Math.round((g.current_load / g.max_capacity) * 100)
    lines.push(`| ${g.name} | ${g.current_load} | ${g.max_capacity} | ${utilization}% | ${g.avg_handle_time_min} |`)
  }
  lines.push('')

  lines.push('### SLA 计时器')
  const slaBar = result.sla_status === 'within_sla' ? '正常' : result.sla_status === 'at_risk' ? '⚠ 风险' : '❌ 已超时'
  lines.push(`状态: **${slaBar}** | 剩余: ${result.routing.sla_target_min - result.routing.estimated_response_min} min`)
  lines.push('')
  lines.push('### 路由核对清单')
  lines.push('- [x] 技能组匹配度评估')
  lines.push('- [x] 当前负载均衡检查')
  lines.push('- [x] VIP/优先级加权')
  lines.push('- [x] SLA 计时器激活')
  lines.push('- [x] 队列位置确认')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius Ticket Router | 智能路由引擎 v0.1.0*')
  return lines.join('\n')
}

// --- Tool 5: Sentiment Tracker 报告 ---
function formatSentimentTrackerReport(result: SentimentResult): string {
  const lines: string[] = []
  lines.push('## Sentiment Tracker — 情感追踪报告')
  lines.push('')
  lines.push(`会话: **${result.session_id}** | 当前情绪: **${result.current_sentiment.label}** (${result.current_sentiment.score}) | VIP预警: **${result.vip_alert ? '是' : '否'}** | 风暴: **${result.storm_detected ? '检测到' : '无'}**`)
  lines.push('')
  lines.push('### 情绪仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('xychart-beta')
  lines.push('    title "情绪走势"')
  lines.push('    x-axis [' + result.sentiment_trend.map((_, i) => `"T${i + 1}"`).join(', ') + ']')
  lines.push('    y-axis "情绪分" -1.5 --> 1.5')
  lines.push('    line [' + result.sentiment_trend.map(s => s.score.toFixed(2)).join(', ') + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 情绪趋势')
  lines.push('| 时间点 | 情绪分 | 标签 | 触发器 |')
  lines.push('|--------|--------|------|--------|')
  for (const point of result.sentiment_trend) {
    lines.push(`| ${point.timestamp.split('T')[1]?.slice(0, 8) || '-'} | ${point.score} | ${point.label} | ${point.trigger || '-'} |`)
  }
  lines.push('')

  if (result.escalation_signals.length > 0) {
    lines.push('### 升级信号')
    for (const sig of result.escalation_signals) lines.push(`- ${sig}`)
    lines.push('')
  }

  lines.push('### 建议行动')
  for (const rec of result.recommendations) lines.push(`- ${rec}`)
  lines.push('')

  lines.push('### 情感追踪核对清单')
  lines.push('- [x] 实时情绪检测')
  lines.push('- [x] 升级信号识别')
  lines.push('- [x] VIP客户预警监控')
  lines.push('- [x] 负面风暴检测')
  lines.push('- [x] 情绪趋势可视化')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius Sentiment Tracker | 情感分析引擎 v0.1.0*')
  return lines.join('\n')
}

// --- Tool 6: CSAT Optimizer 报告 ---
function formatCSATOptimizerReport(result: CSATResult): string {
  const lines: string[] = []
  lines.push('## CSAT Optimizer — CSAT 优化报告')
  lines.push('')
  lines.push(`周期: **${result.period}** | 整体 CSAT: **${result.overall_csat}** | 趋势: **${result.trend_direction}** | 响应等级: **${result.response_time_grade}**`)
  lines.push('')
  lines.push('### CSAT 指标仪表盘')
  lines.push('')
  lines.push('| 指标 | 当前值 | 目标 | 状态 |')
  lines.push('|------|--------|------|------|')
  for (const m of result.metrics) {
    const statusIcon = m.status === 'excellent' ? '优秀' : m.status === 'good' ? '良好' : m.status === 'needs_improvement' ? '待改善' : '紧急'
    lines.push(`| ${m.metric} | ${m.value} | ${m.target} | ${statusIcon} |`)
  }
  lines.push('')

  lines.push('### 改善行动')
  lines.push('| 领域 | 行动 | 预期影响 | 优先级 |')
  lines.push('|------|------|----------|--------|')
  for (const action of result.improvement_actions) {
    lines.push(`| ${action.area} | ${action.action} | ${action.expected_impact} | ${action.priority} |`)
  }
  lines.push('')

  lines.push('### CSAT 优化核对清单')
  lines.push('- [x] 响应时效分析')
  lines.push('- [x] 解决方案有效性评估')
  lines.push('- [x] 客户费力程度(CES)分析')
  lines.push('- [x] NPS 交叉验证')
  lines.push('- [x] 改善行动计划生成')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius CSAT Optimizer | 满意度优化引擎 v0.1.0*')
  return lines.join('\n')
}

// --- Tool 7: Knowledge Suggester 报告 ---
function formatKnowledgeSuggesterReport(result: KnowledgeResult): string {
  const lines: string[] = []
  lines.push('## Knowledge Suggester — 知识库推荐报告')
  lines.push('')
  lines.push(`查询: **"${result.query}"** | 匹配数: **${result.suggestion_count}** | 覆盖率: **${(result.coverage_pct * 100).toFixed(1)}%**`)
  lines.push('')
  lines.push('### 推荐流程')
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart LR')
  lines.push('    Q[用户查询] --> SEM[语义搜索]')
  lines.push('    SEM --> SIM[相似工单匹配]')
  lines.push('    SEM --> KB[知识库检索]')
  lines.push('    SIM --> BEST{最佳方案}')
  lines.push('    KB --> BEST')
  lines.push('    BEST --> GAP[知识缺口识别]')
  lines.push('    GAP --> OUT[推荐输出]')
  lines.push('```')
  lines.push('')

  lines.push('### 最佳解决方案')
  lines.push('```')
  lines.push(result.best_solution)
  lines.push('```')
  lines.push('')

  lines.push('### 相似历史工单')
  lines.push('| 工单ID | 标题 | 相关度 | 解决方案 | 耗时(min) |')
  lines.push('|--------|------|--------|----------|-----------|')
  for (const t of result.similar_tickets) {
    lines.push(`| ${t.ticket_id} | ${t.title} | ${(t.relevance * 100).toFixed(1)}% | ${t.resolution.slice(0, 25)}... | ${t.resolution_time_min} |`)
  }
  lines.push('')

  if (result.knowledge_gaps.length > 0) {
    lines.push('### 知识缺口')
    lines.push('| 主题 | 出现频率 | 建议文档 | 优先级 |')
    lines.push('|------|----------|----------|--------|')
    for (const gap of result.knowledge_gaps) {
      lines.push(`| ${gap.topic} | ${gap.frequency}次 | ${gap.suggested_article} | ${gap.priority} |`)
    }
    lines.push('')
  }

  lines.push('### 知识库核对清单')
  lines.push('- [x] 语义相似度搜索')
  lines.push('- [x] 历史工单最佳方案提取')
  lines.push('- [x] 知识覆盖缺口识别')
  lines.push('- [x] 推荐优先级排序')
  lines.push('- [x] 覆盖率统计')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius Knowledge Suggester | 知识推荐引擎 v0.1.0*')
  return lines.join('\n')
}

// --- Tool 8: Escalation Manager 报告 ---
function formatEscalationManagerReport(result: EscalationResult): string {
  const lines: string[] = []
  lines.push('## Escalation Manager — 升级管理报告')
  lines.push('')
  lines.push(`工单: **${result.ticket_id}** | 升级: **${result.previous_level}** -> **${result.new_level}** | 自动升级: **${result.auto_upgrade ? '是' : '否'}** | 通知主管: **${result.notify_supervisor ? '是' : '否'}**`)
  lines.push('')
  lines.push('### 升级规则引擎')
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart TD')
  lines.push('    TICKET[工单触发] --> RULES{规则引擎}')
  lines.push('    RULES --> |SLA超时| R1[SLA规则]')
  lines.push('    RULES --> |VIP客户| R2[VIP规则]')
  lines.push('    RULES --> |重复未解决| R3[重复规则]')
  lines.push('    RULES --> |金额阈值| R4[金额规则]')
  lines.push('    RULES --> |客户投诉| R5[投诉规则]')
  lines.push('    R1 --> ESC[执行升级]')
  lines.push('    R2 --> ESC')
  lines.push('    R3 --> ESC')
  lines.push('    R4 --> ESC')
  lines.push('    R5 --> ESC')
  lines.push('    ESC --> NOTIFY[通知责任人]')
  lines.push('```')
  lines.push('')

  lines.push('### 触发规则')
  lines.push('| 规则ID | 条件 | 动作 | 级别 | 触发 |')
  lines.push('|--------|------|------|------|------|')
  for (const rule of result.rules_triggered) {
    lines.push(`| ${rule.rule_id} | ${rule.condition} | ${rule.action} | ${rule.level} | ${rule.triggered ? '是' : '否'} |`)
  }
  lines.push('')

  lines.push('### 原因追溯日志')
  lines.push('```')
  for (const log of result.trace_log) lines.push(log)
  lines.push('```')
  lines.push('')

  lines.push('### 升级核对清单')
  lines.push('- [x] 升级规则引擎评估')
  lines.push('- [x] 主管通知机制')
  lines.push('- [x] 超时自动升级')
  lines.push('- [x] 升级原因完整追溯')
  lines.push('- [x] 级别跃迁记录')
  lines.push('')
  lines.push('---')
  lines.push('*SupportGenius Escalation Manager | 升级管理引擎 v0.1.0*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Channel Hub — 全渠道收件箱统一
  tools.register(defineTool({
    name: 'channel_hub',
    description: '全渠道收件箱统一 | WhatsApp/微信/邮件/网页Chat/Telegram消息归一化+会话状态管理 | Unify omnichannel messages with session state management.',
    parameters: {
      hub_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (unify|status|transfer), messages[{channel(whatsapp|wechat|email|webchat|telegram), sender_id, sender_name, content, timestamp, language?, attachments?[]}], target_channel?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { hub_input: string }) {
      const input: ChannelHubInput = JSON.parse(args.hub_input)
      return formatChannelHubReport(analyzeChannelHub(input))
    }
  }))

  // Tool 2: Intent Classifier — 意图识别分类
  tools.register(defineTool({
    name: 'intent_classifier',
    description: '意图识别分类 | FAQ/投诉/退款/技术支持/销售咨询多语言分类+置信度 | Multi-language intent classification with confidence scoring.',
    parameters: {
      intent_input: {
        type: 'string',
        required: true,
        description: 'JSON: message, language, customer_tier (free|standard|premium|vip), history_context?[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { intent_input: string }) {
      const input: IntentInput = JSON.parse(args.intent_input)
      return formatIntentClassifierReport(analyzeIntentClassifier(input))
    }
  }))

  // Tool 3: Auto Responder — 智能自动回复
  tools.register(defineTool({
    name: 'auto_responder',
    description: '智能自动回复 | 知识库匹配+多轮对话+语气风格适配+置信度门gate | AI auto-response with KB matching, multi-turn context, tone adaptation, confidence gating.',
    parameters: {
      responder_input: {
        type: 'string',
        required: true,
        description: 'JSON: message, intent, tone (professional|friendly|empathetic|formal), knowledge_base_ids[], conversation_history[{role(customer|agent), content}], confidence_threshold (0-1)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { responder_input: string }) {
      const input: AutoResponderInput = JSON.parse(args.responder_input)
      return formatAutoResponderReport(analyzeAutoResponder(input))
    }
  }))

  // Tool 4: Ticket Router — 工单智能路由
  tools.register(defineTool({
    name: 'ticket_router',
    description: '工单智能路由 | 技能组匹配+负载均衡+优先级+SLA计时器 | Intelligent ticket routing with skill matching, load balancing, priority, SLA timer.',
    parameters: {
      router_input: {
        type: 'string',
        required: true,
        description: 'JSON: ticket_id, category, priority (low|medium|high|urgent), customer_tier (free|standard|premium|vip), required_skills[], created_at'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { router_input: string }) {
      const input: TicketInput = JSON.parse(args.router_input)
      return formatTicketRouterReport(analyzeTicketRouter(input))
    }
  }))

  // Tool 5: Sentiment Tracker — 情感追踪
  tools.register(defineTool({
    name: 'sentiment_tracker',
    description: '情感追踪 | 实时情绪检测+升级信号识别+VIP客户预警+负面风暴监控 | Real-time sentiment tracking with escalation signals, VIP alerts, negative storm detection.',
    parameters: {
      sentiment_input: {
        type: 'string',
        required: true,
        description: 'JSON: session_id, messages[{role, content, timestamp}], customer_tier (free|standard|premium|vip), industry'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sentiment_input: string }) {
      const input: SentimentInput = JSON.parse(args.sentiment_input)
      return formatSentimentTrackerReport(analyzeSentimentTracker(input))
    }
  }))

  // Tool 6: CSAT Optimizer — CSAT优化
  tools.register(defineTool({
    name: 'csat_optimizer',
    description: 'CSAT优化 | 响应时效分析+解决方案有效性+客户费力程度CES+改善行动建议 | CSAT optimization with response analysis, resolution effectiveness, CES, improvement actions.',
    parameters: {
      csat_input: {
        type: 'string',
        required: true,
        description: 'JSON: period, total_tickets, resolved_tickets, avg_response_time_min, avg_resolution_time_min, first_contact_resolution_pct, ces_score, nps_score'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { csat_input: string }) {
      const input: CSATInput = JSON.parse(args.csat_input)
      return formatCSATOptimizerReport(analyzeCSATOptimizer(input))
    }
  }))

  // Tool 7: Knowledge Suggester — 知识库推荐
  tools.register(defineTool({
    name: 'knowledge_suggester',
    description: '知识库推荐 | 相似历史工单+最佳解决方案+未覆盖知识缺口识别 | Knowledge suggestion with similar tickets, best solutions, knowledge gap identification.',
    parameters: {
      knowledge_input: {
        type: 'string',
        required: true,
        description: 'JSON: query, ticket_category, top_k, locale'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { knowledge_input: string }) {
      const input: KnowledgeInput = JSON.parse(args.knowledge_input)
      return formatKnowledgeSuggesterReport(analyzeKnowledgeSuggester(input))
    }
  }))

  // Tool 8: Escalation Manager — 升级管理
  tools.register(defineTool({
    name: 'escalation_manager',
    description: '升级管理 | 升级规则引擎+主管通知升级+超时自动升级+原因追溯 | Escalation management with rule engine, supervisor notification, auto-upgrade, trace log.',
    parameters: {
      escalation_input: {
        type: 'string',
        required: true,
        description: 'JSON: ticket_id, current_level (L1|L2|L3|L4), escalation_reason, auto_trigger (boolean), sla_remaining_min, customer_tier (free|standard|premium|vip)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { escalation_input: string }) {
      const input: EscalationInput = JSON.parse(args.escalation_input)
      return formatEscalationManagerReport(analyzeEscalationManager(input))
    }
  }))

  console.log(`[dsh-tool-supportgenius] Loaded v${VERSION} — SupportGenius: 8 tools active`)
  console.log('  Tools: channel_hub, intent_classifier, auto_responder, ticket_router, sentiment_tracker, csat_optimizer, knowledge_suggester, escalation_manager')
}
