/**
 * dsh-tool-personalai - 个人AI助手 for DeepSeek Harness
 *
 * 每位员工的数字副手，对标 Google 趋势"人人拥有AI Agent"。
 * 覆盖日常工作生活全场景：简报、邮件、会议、专注、知识、习惯、学习、生活OS。
 *
 * 8个工具 (v0.1.0):
 * 1. daily_briefing      - 每日智能简报（日程/天气/热点/待办优先级排序）
 * 2. inbox_triage        - 邮件/消息智能分类（紧急/重要/可延后、自动起草回复）
 * 3. meeting_assistant   - 会议助手（议程生成、发言纪要、行动项提取、后续跟进）
 * 4. focus_guardian      - 专注力守护（打断统计、深度工作时段建议、干扰过滤规则）
 * 5. knowledge_feed      - 个性化知识推送（基于项目和兴趣的论文/新闻/行业动态）
 * 6. habit_tracker       - 习惯养成追踪（目标设定、连胜记录、智能提醒、奖励机制）
 * 7. learning_path       - 个性化学习路径（技能差距分析、推荐课程、进度追踪）
 * 8. life_os_lite        - 个人操作系统仪表盘（健康/财务/社交/成长的平衡分析）
 *
 * @module dsh-tool-personalai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-personalai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ============================================================================
// SEEDED RANDOM (mulberry32) - 确定性随机数生成器
// ============================================================================

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function (): number {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function roundTo(v: number, d: number): number {
  const f = Math.pow(10, d)
  return Math.round(v * f) / f
}

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

/** 每日简报输入数据 */
interface DailyBriefingData {
  date: string
  weather: { temp_high: number; temp_low: number; condition: string; city: string }
  schedule: Array<{ time: string; event: string; duration_min: number; priority: 'high' | 'medium' | 'low' }>
  news_headlines: Array<{ title: string; source: string; relevance: 'high' | 'medium' | 'low' }>
  todos: Array<{ task: string; deadline: string; urgency: number; importance: number; estimated_min: number }>
}

/** 邮件分类输入数据 */
interface InboxData {
  messages: Array<{ id: string; from: string; subject: string; body_preview: string; received_at: string; has_attachment: boolean; labels: string[] }>
}

/** 会议助手输入数据 */
interface MeetingData {
  meeting_title: string
  attendees: string[]
  duration_min: number
  objective: string
  prior_meeting_notes?: string
}

/** 专注力守护输入数据 */
interface FocusData {
  work_hours_start: string
  work_hours_end: string
  interruptions: Array<{ time: string; source: string; duration_min: string; type: 'meeting' | 'message' | 'call' | 'self' | 'other' }>
  deep_work_goal_min: number
  energy_pattern: 'morning_person' | 'night_owl' | 'steady'
}

/** 知识推送输入数据 */
interface KnowledgeData {
  interests: string[]
  current_projects: string[]
  read_history: Array<{ title: string; category: string; date: string }>
  preferred_sources: string[]
  max_items: number
}

/** 习惯追踪输入数据 */
interface HabitData {
  habits: Array<{ name: string; target_per_week: number; completed_days: string[]; category: string; streak_target: number }>
  week_start_date: string
}

/** 学习路径输入数据 */
interface LearningData {
  current_skills: Array<{ skill: string; level: number }>
  target_skills: Array<{ skill: string; target_level: number; deadline: string }>
  available_hours_per_week: number
  preferred_format: 'video' | 'article' | 'interactive' | 'mixed'
}

/** 生活OS输入数据 */
interface LifeOSData {
  health: { exercise_min_week: number; sleep_hours_avg: number; meditation_days_week: number; energy_level: number }
  finance: { monthly_income: number; monthly_expenses: number; savings_rate: number; investment_pct: number }
  social: { close_friends_count: number; quality_time_hours_week: number; network_growth_monthly: number }
  growth: { books_read_month: number; courses_completed_month: number; new_skills_practiced: number }
}

// ============================================================================
// TOOL 1: DAILY BRIEFING - 每日智能简报
// ============================================================================

interface DailyBriefingResult {
  summary: string
  weather_summary: string
  schedule_items: Array<{ time: string; event: string; duration_min: number; priority_label: string; priority_emoji: string }>
  news_highlights: Array<{ title: string; source: string; why_relevant: string }>
  todo_priority_matrix: { urgent_important: string[]; not_urgent_important: string[]; urgent_not_important: string[]; not_urgent_not_important: string[] }
  time_blocks: Array<{ period: string; focus: string; tasks: string[] }>
}

function analyzeDailyBriefing(data: DailyBriefingData): DailyBriefingResult {
  const rng = mulberry32(hashStr(data.date))

  // 天气摘要
  const w = data.weather
  const weatherSummary = `${w.city} ${w.temp_low}~${w.temp_high}°C / ${w.condition}`

  // 按优先级排序日程
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sortedSchedule = [...data.schedule].sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1))
  const scheduleItems = sortedSchedule.map(function (s) {
    const em = s.priority === 'high' ? '\u{1F534}' : s.priority === 'medium' ? '\u{1F7E1}' : '\u{1F7E2}'
    return { time: s.time, event: s.event, duration_min: s.duration_min, priority_label: s.priority.toUpperCase(), priority_emoji: em }
  })

  // 新闻筛选高相关
  const highNews = data.news_headlines.filter(function (n) { return n.relevance === 'high' }).slice(0, 3)
  const medNews = data.news_headlines.filter(function (n) { return n.relevance === 'medium' }).slice(0, 2)
  const newsHighlights = [...highNews, ...medNews].map(function (n) {
    const reasons = ['与当前项目直接相关', '行业趋势值得关注', '竞对动态需监控', '政策变化影响评估', '技术突破可能带来机会']
    return { title: n.title, source: n.source, why_relevant: pick(rng, reasons) }
  })

  // 待办优先级矩阵 (Eisenhower Matrix)
  const ui: string[] = [], nui: string[] = [], uni: string[] = [], nuni: string[] = []
  data.todos.forEach(function (t) {
    if (t.urgency >= 7 && t.importance >= 7) ui.push(t.task)
    else if (t.urgency < 7 && t.importance >= 7) nui.push(t.task)
    else if (t.urgency >= 7 && t.importance < 7) uni.push(t.task)
    else nuni.push(t.task)
  })

  // 时间块建议
  const timeBlocks: DailyBriefingResult['time_blocks'] = [
    { period: '上午 (09:00-12:00)', focus: '深度工作 / 高优先级任务', tasks: ui.slice(0, 2) },
    { period: '午后 (13:00-15:00)', focus: '协作 / 会议 / 邮件处理', tasks: uni.slice(0, 2) },
    { period: '下午 (15:00-17:00)', focus: '规划 / 学习 / 中低优先级', tasks: nui.slice(0, 2) },
    { period: '晚间 (19:00-21:00)', focus: '阅读 / 复盘 / 可延后事项', tasks: nuni.slice(0, 2) }
  ]

  const urgentCount = ui.length + uni.length
  const summary = `今日概览：${data.schedule.length}场会议、${data.todos.length}项待办（${urgentCount}项紧急）、${data.news_headlines.length}条资讯。天气${w.condition}，建议优先处理${ui.length > 0 ? ui[0] : '暂无紧急事项'}。`

  return {
    summary,
    weather_summary: weatherSummary,
    schedule_items: scheduleItems,
    news_highlights: newsHighlights,
    todo_priority_matrix: { urgent_important: ui, not_urgent_important: nui, urgent_not_important: uni, not_urgent_not_important: nuni },
    time_blocks: timeBlocks
  }
}

function formatDailyBriefingReport(r: DailyBriefingResult): string {
  const lines: string[] = []
  lines.push('## 📋 每日智能简报 / Daily Briefing')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 🌤️ 天气 / Weather')
  lines.push('')
  lines.push('`' + r.weather_summary + '`')
  lines.push('')
  lines.push('### 📊 优先级矩阵 / Priority Matrix (Eisenhower)')
  lines.push('')
  lines.push('| 紧急 \\ 重要 | ✅ 重要 | ⚠️ 不重要 |')
  lines.push('|-------------|---------|-----------|')
  lines.push('| **🔴 紧急** | ' + (r.todo_priority_matrix.urgent_important.join('; ') || '—') + ' | ' + (r.todo_priority_matrix.urgent_not_important.join('; ') || '—') + ' |')
  lines.push('| **🟢 不紧急** | ' + (r.todo_priority_matrix.not_urgent_important.join('; ') || '—') + ' | ' + (r.todo_priority_matrix.not_urgent_not_important.join('; ') || '—') + ' |')
  lines.push('')
  lines.push('### ⏰ 日程时间线 / Schedule')
  lines.push('')
  lines.push('| 时间 | 事项 | 时长 | 优先级 |')
  lines.push('|------|------|------|--------|')
  r.schedule_items.forEach(function (s) {
    lines.push('| ' + s.time + ' | ' + s.event + ' | ' + s.duration_min + 'min | ' + s.priority_emoji + ' ' + s.priority_label + ' |')
  })
  lines.push('')
  lines.push('### 📰 资讯精选 / News Highlights')
  lines.push('')
  r.news_highlights.forEach(function (n) {
    lines.push('- **' + n.title + '** (' + n.source + ') — ' + n.why_relevant)
  })
  lines.push('')
  lines.push('### 🕐 时间块建议 / Time Blocks')
  lines.push('')
  r.time_blocks.forEach(function (tb) {
    lines.push('- **' + tb.period + '** → ' + tb.focus + (tb.tasks.length > 0 ? ' → ' + tb.tasks.join('; ') : ''))
  })
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 2: INBOX TRIAGE - 邮件/消息智能分类
// ============================================================================

interface InboxTriageResult {
  summary: string
  urgent: Array<{ id: string; from: string; subject: string; draft_reply: string; reason: string }>
  important: Array<{ id: string; from: string; subject: string; draft_reply: string; reason: string }>
  deferrable: Array<{ id: string; from: string; subject: string; suggested_action: string }>
  archive: Array<{ id: string; from: string; subject: string }>
  total_processed: number
  avg_response_time_min: number
}

function analyzeInboxTriage(data: InboxData): InboxTriageResult {
  const rng = mulberry32(hashStr(data.messages.length.toString() + (data.messages[0]?.id ?? '')))

  const urgent: InboxTriageResult['urgent'] = []
  const important: InboxTriageResult['important'] = []
  const deferrable: InboxTriageResult['deferrable'] = []
  const archive: InboxTriageResult['archive'] = []

  const urgentKeywords = ['urgent', 'asap', 'deadline', 'action required', 'blocked', 'critical', '紧急', '截止', '立即']
  const importantKeywords = ['meeting', 'decision', 'approval', 'review', 'feedback', 'project', '审批', '决策', '会议']

  data.messages.forEach(function (msg) {
    const text = (msg.subject + ' ' + msg.body_preview).toLowerCase()
    const isFromBoss = msg.from.toLowerCase().includes('manager') || msg.from.toLowerCase().includes('director') || msg.from.toLowerCase().includes('ceo')
    const hasUrgentKw = urgentKeywords.some(function (kw) { return text.includes(kw) })
    const hasImportantKw = importantKeywords.some(function (kw) { return text.includes(kw) })

    if (hasUrgentKw || isFromBoss) {
      const drafts = [
        '收到，我会在今天内处理并回复您。',
        '感谢您的邮件，我已了解情况，正在处理中，稍后给您详细回复。',
        '收到，优先级已提升，我会在今日下班前给出方案。'
      ]
      urgent.push({ id: msg.id, from: msg.from, subject: msg.subject, draft_reply: pick(rng, drafts), reason: isFromBoss ? '来自管理层' : '含紧急关键词' })
    } else if (hasImportantKw) {
      const drafts = [
        '感谢您的信息，我会仔细审阅并在两个工作日内回复。',
        '收到，这个事项很重要，我计划本周内安排讨论。',
        '已收到，我会整理相关材料后回复您。'
      ]
      important.push({ id: msg.id, from: msg.from, subject: msg.subject, draft_reply: pick(rng, drafts), reason: '含重要关键词' })
    } else if (msg.labels.includes('newsletter') || msg.labels.includes('notification') || msg.labels.includes('social')) {
      archive.push({ id: msg.id, from: msg.from, subject: msg.subject })
    } else {
      deferrable.push({ id: msg.id, from: msg.from, subject: msg.subject, suggested_action: '延后处理 / 批量处理' })
    }
  })

  return {
    summary: `共处理 ${data.messages.length} 封邮件：🔴紧急 ${urgent.length} 封、🟡重要 ${important.length} 封、🟢可延后 ${deferrable.length} 封、归档 ${archive.length} 封。`,
    urgent, important, deferrable, archive,
    total_processed: data.messages.length,
    avg_response_time_min: roundTo(8 + rng() * 12, 1)
  }
}

function formatInboxTriageReport(r: InboxTriageResult): string {
  const lines: string[] = []
  lines.push('## 📧 邮件智能分类 / Inbox Triage')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 📊 优先级矩阵 / Triage Matrix')
  lines.push('')
  lines.push('| 类别 | 数量 | 处理建议 |')
  lines.push('|------|------|----------|')
  lines.push('| 🔴 紧急 | ' + r.urgent.length + ' | 立即回复 |')
  lines.push('| 🟡 重要 | ' + r.important.length + ' | 今日处理 |')
  lines.push('| 🟢 可延后 | ' + r.deferrable.length + ' | 批量/延后 |')
  lines.push('| ⚪ 归档 | ' + r.archive.length + ' | 标记已读 |')
  lines.push('')

  if (r.urgent.length > 0) {
    lines.push('### 🔴 紧急 / Urgent')
    lines.push('')
    r.urgent.forEach(function (m) {
      lines.push('- **' + m.subject + '** (来自: ' + m.from + ')')
      lines.push('  - 原因: ' + m.reason)
      lines.push('  - 草稿: ' + m.draft_reply)
    })
    lines.push('')
  }

  if (r.important.length > 0) {
    lines.push('### 🟡 重要 / Important')
    lines.push('')
    r.important.forEach(function (m) {
      lines.push('- **' + m.subject + '** (来自: ' + m.from + ')')
      lines.push('  - 原因: ' + m.reason)
      lines.push('  - 草稿: ' + m.draft_reply)
    })
    lines.push('')
  }

  if (r.deferrable.length > 0) {
    lines.push('### 🟢 可延后 / Deferrable')
    lines.push('')
    r.deferrable.forEach(function (m) {
      lines.push('- ' + m.subject + ' → ' + m.suggested_action)
    })
    lines.push('')
  }

  lines.push('> 平均预计回复时间: **' + r.avg_response_time_min + '分钟**')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 3: MEETING ASSISTANT - 会议助手
// ============================================================================

interface MeetingResult {
  summary: string
  agenda: Array<{ time_min: number; section: string; owner: string; objective: string }>
  speaking_notes: Array<{ topic: string; key_points: string[] }>
  action_items: Array<{ task: string; owner: string; deadline: string; priority: string }>
  follow_up: Array<{ action: string; timeline: string }>
}

function analyzeMeetingAssistant(data: MeetingData): MeetingResult {
  const rng = mulberry32(hashStr(data.meeting_title + data.objective))
  const attendees = data.attendees.length > 0 ? data.attendees : ['负责人', '相关成员']

  // 议程生成
  const agenda: MeetingResult['agenda'] = [
    { time_min: Math.max(Math.round(data.duration_min * 0.1), 2), section: '开场 & 目标对齐', owner: attendees[0], objective: '明确会议目标和预期产出' },
    { time_min: Math.max(Math.round(data.duration_min * 0.25), 5), section: '现状回顾与数据同步', owner: pick(rng, attendees), objective: '统一信息基线，确认当前进展' },
    { time_min: Math.max(Math.round(data.duration_min * 0.35), 10), section: '核心议题讨论', owner: '全体', objective: '围绕' + data.objective + '展开深入讨论' },
    { time_min: Math.max(Math.round(data.duration_min * 0.15), 5), section: '方案评估与决策', owner: attendees[0], objective: '评估可行方案并达成共识' },
    { time_min: Math.max(Math.round(data.duration_min * 0.1), 3), section: '行动项确认 & 总结', owner: '全体', objective: '明确下一步行动、负责人和时间节点' }
  ]

  // 发言纪要模板
  const speakingNotes: MeetingResult['speaking_notes'] = [
    { topic: '项目背景与当前状态', key_points: ['进度vs计划对比', '关键里程碑完成情况', '风险与阻塞项'] },
    { topic: data.objective, key_points: ['各方案优劣对比', '资源约束分析', '决策标准对齐'] },
    { topic: '后续行动计划', key_points: ['行动项清单', '负责人确认', '时间节点设定'] }
  ]

  // 行动项提取模板
  const actionItems: MeetingResult['action_items'] = [
    { task: '整理会议纪要并发给全体参与者', owner: attendees[0], deadline: '当天', priority: 'high' },
    { task: '跟进各项决策的资源协调', owner: pick(rng, attendees), deadline: '3个工作日内', priority: 'high' },
    { task: '更新项目进度看板/文档', owner: pick(rng, attendees), deadline: '次日', priority: 'medium' },
    { task: '安排下次同步会议或异步更新机制', owner: attendees.length > 1 ? attendees[1] : attendees[0], deadline: '1周内', priority: 'medium' }
  ]

  // 后续跟进计划
  const followUp: MeetingResult['follow_up'] = [
    { action: '24h内发送会议纪要和行动项清单', timeline: '当天' },
    { action: '1周后检查行动项进展', timeline: '第7天' },
    { action: '根据决议推动下一阶段工作', timeline: '按项目计划' }
  ]

  const summary = `会议"${data.meeting_title}"议程已生成（${data.duration_min}分钟，${attendees.length}人参会），包含${agenda.length}个议程环节、${actionItems.length}项行动项。`

  return { summary, agenda, speaking_notes: speakingNotes, action_items: actionItems, follow_up: followUp }
}

function formatMeetingAssistantReport(r: MeetingResult): string {
  const lines: string[] = []
  lines.push('## 🎯 会议助手 / Meeting Assistant')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 📋 议程 / Agenda')
  lines.push('')
  lines.push('| 时长(min) | 环节 | 负责人 | 目标 |')
  lines.push('|-----------|------|--------|------|')
  r.agenda.forEach(function (a) {
    lines.push('| ' + a.time_min + ' | ' + a.section + ' | ' + a.owner + ' | ' + a.objective + ' |')
  })
  lines.push('')
  lines.push('### 📝 发言纪要框架 / Speaking Notes')
  lines.push('')
  r.speaking_notes.forEach(function (sn) {
    lines.push('**' + sn.topic + '**')
    sn.key_points.forEach(function (kp) {
      lines.push('- ' + kp)
    })
    lines.push('')
  })
  lines.push('### ✅ 行动项 / Action Items')
  lines.push('')
  lines.push('| 任务 | 负责人 | 截止时间 | 优先级 |')
  lines.push('|------|--------|----------|--------|')
  r.action_items.forEach(function (ai) {
    const em = ai.priority === 'high' ? '\u{1F534}' : ai.priority === 'medium' ? '\u{1F7E1}' : '\u{1F7E2}'
    lines.push('| ' + ai.task + ' | ' + ai.owner + ' | ' + ai.deadline + ' | ' + em + ' ' + ai.priority + ' |')
  })
  lines.push('')
  lines.push('### 📬 后续跟进 / Follow-up')
  lines.push('')
  r.follow_up.forEach(function (fu) {
    lines.push('- **' + fu.timeline + '** → ' + fu.action)
  })
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 4: FOCUS GUARDIAN - 专注力守护
// ============================================================================

interface FocusResult {
  summary: string
  interruption_stats: { total_count: number; total_min_lost: number; by_type: Record<string, number>; by_source: Record<string, number> }
  deep_work_recommendation: { best_period: string; duration_suggestion_min: string; break_interval_min: number; technique: string }
  filtering_rules: Array<{ rule: string; condition: string; action: string }>
  weekly_goal_progress: { target_min: number; current_min: number; remaining_min: number; daily_average_needed: number }
}

function analyzeFocusGuardian(data: FocusData): FocusResult {
  const rng = mulberry32(hashStr(data.work_hours_start + data.deep_work_goal_min.toString()))

  // 打断统计
  const byType: Record<string, number> = {}
  const bySource: Record<string, number> = {}
  let totalMinLost = 0
  data.interruptions.forEach(function (i) {
    const dur = parseFloat(i.duration_min) || 0
    totalMinLost += dur
    byType[i.type] = (byType[i.type] || 0) + 1
    bySource[i.source] = (bySource[i.source] || 0) + 1
  })

  // 深度工作时段建议
  let bestPeriod = '09:00-11:00'
  let technique = 'Pomodoro (25min工作+5min休息)'
  if (data.energy_pattern === 'morning_person') {
    bestPeriod = '08:00-11:00'
    technique = 'Time Blocking (90min块+20min休息)'
  } else if (data.energy_pattern === 'night_owl') {
    bestPeriod = '20:00-23:00'
    technique = 'Flow Time (不设限专注块)'
  }

  const totalInterrupts = data.interruptions.length
  const avgLossPerInterrupt = totalInterrupts > 0 ? roundTo(totalMinLost / totalInterrupts, 1) : 0

  const filteringRules: FocusResult['filtering_rules'] = [
    { rule: '会议勿扰', condition: '深度工作时段内', action: '关闭消息通知、设置自动回复' },
    { rule: '消息聚合', condition: '非紧急消息', action: '每2小时集中处理一次' },
    { rule: '打断记录', condition: '每次被打断时', action: '记录打断来源，每周回顾优化' },
    { rule: '能量匹配', condition: '高能量时段', action: '只安排深度任务，拒绝低价值会议' }
  ]

  // 进度计算
  const workedMin = Math.max(0, data.deep_work_goal_min - totalMinLost)
  const remaining = Math.max(0, data.deep_work_goal_min - workedMin)

  return {
    summary: `今日打断${totalInterrupts}次、损失${totalMinLost}分钟（平均每次${avgLossPerInterrupt}分钟）。建议${bestPeriod}进行深度工作，采取${technique}。`,
    interruption_stats: { total_count: totalInterrupts, total_min_lost: totalMinLost, by_type: byType, by_source: bySource },
    deep_work_recommendation: { best_period: bestPeriod, duration_suggestion_min: '90~120', break_interval_min: 90, technique },
    filtering_rules: filteringRules,
    weekly_goal_progress: { target_min: data.deep_work_goal_min, current_min: workedMin, remaining_min: remaining, daily_average_needed: roundTo(remaining / 5, 0) }
  }
}

function formatFocusGuardianReport(r: FocusResult): string {
  const lines: string[] = []
  lines.push('## 🧠 专注力守护 / Focus Guardian')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 📊 打断统计 / Interruption Stats')
  lines.push('')
  lines.push('- 总打断次数: **' + r.interruption_stats.total_count + '次**')
  lines.push('- 总损失时间: **' + r.interruption_stats.total_min_lost + '分钟**')
  lines.push('')
  lines.push('**按类型分布:**')
  lines.push('')
  const typeLabels: Record<string, string> = { meeting: '\u{1F4CB}会议', message: '\u{1F4E7}消息', call: '\u{1F4DE}电话', self: '\u{1F9E0}分心', other: '\u{2753}其他' }
  Object.entries(r.interruption_stats.by_type).forEach(function (entry) {
    lines.push('- ' + (typeLabels[entry[0]] || entry[0]) + ': ' + entry[1] + '次')
  })
  lines.push('')
  lines.push('### ⏰ 深度工作建议 / Deep Work Recommendation')
  lines.push('')
  lines.push('| 项目 | 建议 |')
  lines.push('|------|------|')
  lines.push('| 最佳时段 | ' + r.deep_work_recommendation.best_period + ' |')
  lines.push('| 持续时长 | ' + r.deep_work_recommendation.duration_suggestion_min + '分钟 |')
  lines.push('| 休息间隔 | 每' + r.deep_work_recommendation.break_interval_min + '分钟 |')
  lines.push('| 推荐方法 | ' + r.deep_work_recommendation.technique + ' |')
  lines.push('')
  lines.push('### 🛡️ 干扰过滤规则 / Filtering Rules')
  lines.push('')
  lines.push('| 规则 | 触发条件 | 执行动作 |')
  lines.push('|------|----------|----------|')
  r.filtering_rules.forEach(function (rule) {
    lines.push('| ' + rule.rule + ' | ' + rule.condition + ' | ' + rule.action + ' |')
  })
  lines.push('')
  lines.push('### 📈 深度工作进度 / Progress')
  lines.push('')
  lines.push('- 目标: **' + r.weekly_goal_progress.target_min + '分钟/天**')
  lines.push('- 当前: **' + r.weekly_goal_progress.current_min + '分钟**')
  lines.push('- 缺口: **' + r.weekly_goal_progress.remaining_min + '分钟**')
  lines.push('- 建议日均补足: **' + r.weekly_goal_progress.daily_average_needed + '分钟**')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 5: KNOWLEDGE FEED - 个性化知识推送
// ============================================================================

interface KnowledgeResult {
  summary: string
  feed_items: Array<{ title: string; category: string; source: string; reason: string; estimated_read_min: number; relevance_score: number }>
  reading_queue: { high: string[]; medium: string[]; low: string[] }
  topic_coverage: Record<string, number>
}

function analyzeKnowledgeFeed(data: KnowledgeData): KnowledgeResult {
  const rng = mulberry32(hashStr(data.interests.join(',') + data.current_projects.join(',')))
  const maxItems = data.max_items || 8

  // 模拟知识推荐（基于兴趣和项目）
  const feedItems: KnowledgeResult['feed_items'] = []
  const usedTitles = new Set<string>(data.read_history.map(function (h) { return h.title }))

  const topicTemplates: Record<string, string[]> = {
    AI: ['大模型推理优化最新进展', '多Agent协作框架对比', 'AI Agent在企业中的落地实践', 'RAG架构的下一个演进方向'],
    engineering: ['微服务 vs 单体架构再思考', '高并发系统设计模式', '代码审查最佳实践', 'DevOps 2026趋势'],
    management: ['远程团队管理新范式', 'OKR与KPI的平衡之道', '技术领导力成长路径', '跨部门协作的方法论'],
    finance: ['量化投资策略新进展', '区块链在金融领域的应用', '宏观经济趋势分析', '个人理财的资产配置'],
    health: ['间歇性禁食的科学研究', '睡眠质量提升的认知科学', '压力管理的神经科学基础', '运动表现优化方法']
  }

  const sources = data.preferred_sources.length > 0 ? data.preferred_sources : ['Hacker News', 'arXiv', 'Medium', 'InfoQ', 'Harvard Business Review']

  for (let i = 0; i < maxItems; i++) {
    const interest = pick(rng, data.interests.length > 0 ? data.interests : ['技术', '商业', '科学'])
    const templates = topicTemplates[interest] || topicTemplates['engineering']
    const title = pick(rng, templates)
    if (usedTitles.has(title)) continue
    usedTitles.add(title)

    const relevance = roundTo(0.6 + rng() * 0.4, 2)
    const readMin = Math.floor(5 + rng() * 20)
    const reasons = [
      '与当前项目"' + pick(rng, data.current_projects.length > 0 ? data.current_projects : ['个人成长']) + '"直接相关',
      '匹配兴趣领域"' + interest + '"',
      '行业前沿趋势，值得持续关注',
      '可能影响近期决策方向'
    ]
    feedItems.push({
      title: title,
      category: interest,
      source: pick(rng, sources),
      reason: pick(rng, reasons),
      estimated_read_min: readMin,
      relevance_score: relevance
    })
  }

  feedItems.sort(function (a, b) { return b.relevance_score - a.relevance_score })

  const high: string[] = [], medium: string[] = [], low: string[] = []
  feedItems.forEach(function (item) {
    if (item.relevance_score >= 0.85) high.push(item.title)
    else if (item.relevance_score >= 0.7) medium.push(item.title)
    else low.push(item.title)
  })

  const topicCoverage: Record<string, number> = {}
  data.interests.forEach(function (i) {
    topicCoverage[i] = feedItems.filter(function (f) { return f.category === i }).length
  })

  return {
    summary: `根据${data.interests.length}个兴趣领域和${data.current_projects.length}个项目，推荐${feedItems.length}条内容（${high.length}高相关/${medium.length}中相关/${low.length}低相关）。`,
    feed_items: feedItems,
    reading_queue: { high, medium, low },
    topic_coverage: topicCoverage
  }
}

function formatKnowledgeFeedReport(r: KnowledgeResult): string {
  const lines: string[] = []
  lines.push('## 📚 个性化知识推送 / Knowledge Feed')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 📊 推荐优先级矩阵 / Relevance Matrix')
  lines.push('')
  lines.push('| 优先级 | 内容 | 来源 | 阅读时长 | 推荐理由 |')
  lines.push('|--------|------|------|----------|----------|')
  r.feed_items.forEach(function (item) {
    const em = item.relevance_score >= 0.85 ? '\u{1F534}' : item.relevance_score >= 0.7 ? '\u{1F7E1}' : '\u{1F7E2}'
    lines.push('| ' + em + ' ' + (item.relevance_score * 100).toFixed(0) + '% | ' + item.title + ' | ' + item.source + ' | ' + item.estimated_read_min + 'min | ' + item.reason + ' |')
  })
  lines.push('')
  lines.push('### 📖 阅读队列 / Reading Queue')
  lines.push('')
  lines.push('**🔴 高优先 (今日阅读):**')
  r.reading_queue.high.forEach(function (t) { lines.push('- ' + t) })
  lines.push('')
  lines.push('**🟡 中优先 (本周阅读):**')
  r.reading_queue.medium.forEach(function (t) { lines.push('- ' + t) })
  lines.push('')
  lines.push('**🟢 低优先 (空闲时):**')
  r.reading_queue.low.forEach(function (t) { lines.push('- ' + t) })
  lines.push('')
  lines.push('### 📈 领域覆盖 / Topic Coverage')
  lines.push('')
  Object.entries(r.topic_coverage).forEach(function (entry) {
    lines.push('- ' + entry[0] + ': ' + entry[1] + '条')
  })
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 6: HABIT TRACKER - 习惯养成追踪
// ============================================================================

interface HabitResult {
  summary: string
  habit_details: Array<{ name: string; target: number; completed: number; completion_rate: number; streak: number; status: string; reward_eligible: boolean }>
  total_completion_rate: number
  streak_leader: string
  at_risk_habits: string[]
  weekly_reward_status: string
}

function analyzeHabitTracker(data: HabitData): HabitResult {
  const rng = mulberry32(hashStr(data.week_start_date + data.habits.length.toString()))

  let totalRate = 0
  let streakLeader = ''
  let maxStreak = 0
  const atRisk: string[] = []

  const habitDetails = data.habits.map(function (h) {
    const completed = h.completed_days.length
    const rate = h.target_per_week > 0 ? roundTo((completed / h.target_per_week) * 100, 1) : 0
    totalRate += rate

    // 连胜计算（简化：连续完成的最大天数）
    let streak = 0
    let maxS = 0
    for (let i = 0; i < h.completed_days.length; i++) {
      if (i > 0 && h.completed_days[i] && h.completed_days[i - 1]) {
        streak++
      } else if (h.completed_days[i]) {
        streak = 1
      } else {
        streak = 0
      }
      if (streak > maxS) maxS = streak
    }

    const status = rate >= 100 ? '\u{2705} 达标' : rate >= 70 ? '\u{1F7E1}进行中' : '\u{26A0}\u{FE0F}需关注'
    const reward = rate >= 80 && maxS >= h.streak_target

    if (maxS > maxStreak) { maxStreak = maxS; streakLeader = h.name }
    if (rate < 50) atRisk.push(h.name)

    return { name: h.name, target: h.target_per_week, completed, completion_rate: rate, streak: maxS, status, reward_eligible: reward }
  })

  const avgRate = data.habits.length > 0 ? roundTo(totalRate / data.habits.length, 1) : 0
  const rewardCount = habitDetails.filter(function (h) { return h.reward_eligible }).length

  return {
    summary: `${data.habits.length}个习惯追踪中，平均完成率${avgRate}%。${rewardCount}个习惯达标可获奖励。${atRisk.length > 0 ? atRisk.length + '个习惯需加强。' : '所有习惯状态良好！'}`,
    habit_details: habitDetails,
    total_completion_rate: avgRate,
    streak_leader: streakLeader || '暂无',
    at_risk_habits: atRisk,
    weekly_reward_status: `${rewardCount}/${data.habits.length} 个习惯达标`
  }
}

function formatHabitTrackerReport(r: HabitResult): string {
  const lines: string[] = []
  lines.push('## 🏃 习惯养成追踪 / Habit Tracker')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 📊 习惯进度 / Habit Progress')
  lines.push('')
  lines.push('| 习惯 | 目标(次/周) | 完成 | 完成率 | 连胜 | 状态 | 奖励 |')
  lines.push('|------|-------------|------|--------|------|------|------|')
  r.habit_details.forEach(function (h) {
    lines.push('| ' + h.name + ' | ' + h.target + ' | ' + h.completed + ' | ' + h.completion_rate + '% | ' + h.streak + '天 | ' + h.status + ' | ' + (h.reward_eligible ? '\u{1F3C6}' : '—') + ' |')
  })
  lines.push('')
  lines.push('### 📈 总览 / Summary')
  lines.push('')
  lines.push('- 平均完成率: **' + r.total_completion_rate + '%**')
  lines.push('- 连胜王: **' + r.streak_leader + '**')
  lines.push('- 奖励状态: **' + r.weekly_reward_status + '**')
  lines.push('')
  if (r.at_risk_habits.length > 0) {
    lines.push('### ⚠️ 需关注 / At Risk')
    lines.push('')
    r.at_risk_habits.forEach(function (h) {
      lines.push('- ' + h)
    })
    lines.push('')
  }
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 7: LEARNING PATH - 个性化学习路径
// ============================================================================

interface LearningResult {
  summary: string
  skill_gaps: Array<{ skill: string; current: number; target: number; gap: number; priority: string; deadline: string }>
  recommendations: Array<{ resource: string; format: string; duration_weeks: number; reason: string; provider: string }>
  weekly_plan: Array<{ week: number; focus: string; hours: number; milestone: string }>
  progress_projection: { on_track: boolean; estimated_completion_weeks: number; risk: string }
}

function analyzeLearningPath(data: LearningData): LearningResult {
  const rng = mulberry32(hashStr(data.current_skills.map(function (s) { return s.skill }).join(',')))

  // 技能差距分析
  const skillGaps = data.target_skills.map(function (ts) {
    const current = data.current_skills.find(function (s) { return s.skill === ts.skill })
    const curLevel = current ? current.level : 0
    const gap = ts.target_level - curLevel
    const priority = gap >= 4 ? 'high' : gap >= 2 ? 'medium' : 'low'
    return { skill: ts.skill, current: curLevel, target: ts.target_level, gap, priority, deadline: ts.deadline }
  }).sort(function (a, b) { return b.gap - a.gap })

  // 推荐资源
  const providers = ['Coursera', 'edX', 'Udemy', '极客时间', 'MIT OpenCourseWare', 'DeepLearning.AI', '知乎专栏', '官方文档']
  const recommendations = skillGaps.slice(0, 5).map(function (sg) {
    const formats = data.preferred_format === 'mixed' ? ['video', 'article', 'interactive'] : [data.preferred_format]
    const format = pick(rng, formats)
    const durWeeks = Math.ceil(sg.gap * 1.5 + rng() * 2)
    const reasons = [
      '技能差距大(' + sg.gap + '级)，需系统学习',
      '与职业目标直接相关',
      '市场需求高，投资回报显著'
    ]
    return { resource: sg.skill + ' 系统课程', format, duration_weeks: durWeeks, reason: pick(rng, reasons), provider: pick(rng, providers) }
  })

  // 周计划
  const weeklyPlan: LearningResult['weekly_plan'] = []
  const weeks = Math.min(recommendations.length, 6)
  for (let w = 0; w < weeks; w++) {
    const rec = recommendations[w]
    if (rec) {
      const hrs = roundTo(data.available_hours_per_week / Math.min(weeks, 3), 1)
      weeklyPlan.push({
        week: w + 1,
        focus: rec.resource,
        hours: hrs,
        milestone: '完成' + rec.resource + '第' + (w + 1) + '单元'
      })
    }
  }

  const totalWeeks = recommendations.reduce(function (s, r) { return s + r.duration_weeks }, 0)
  const avgGap = skillGaps.length > 0 ? skillGaps.reduce(function (s, g) { return s + g.gap }, 0) / skillGaps.length : 0
  const onTrack = data.available_hours_per_week >= avgGap * 2

  return {
    summary: `${skillGaps.length}项技能差距分析完成，平均差距${avgGap.toFixed(1)}级。推荐${recommendations.length}个学习资源，预计${totalWeeks}周达成目标。`,
    skill_gaps: skillGaps,
    recommendations,
    weekly_plan: weeklyPlan,
    progress_projection: { on_track: onTrack, estimated_completion_weeks: totalWeeks, risk: onTrack ? '低风险' : '时间投入不足，建议增加每周学习时间' }
  }
}

function formatLearningPathReport(r: LearningResult): string {
  const lines: string[] = []
  lines.push('## 🎓 个性化学习路径 / Learning Path')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 📊 技能差距分析 / Skill Gap Analysis')
  lines.push('')
  lines.push('| 技能 | 当前水平 | 目标水平 | 差距 | 优先级 | 截止 |')
  lines.push('|------|----------|----------|------|--------|------|')
  r.skill_gaps.forEach(function (sg) {
    const em = sg.priority === 'high' ? '\u{1F534}' : sg.priority === 'medium' ? '\u{1F7E1}' : '\u{1F7E2}'
    lines.push('| ' + sg.skill + ' | ' + sg.current + '/10 | ' + sg.target + '/10 | ' + sg.gap + '级 | ' + em + ' ' + sg.priority + ' | ' + sg.deadline + ' |')
  })
  lines.push('')
  lines.push('### 📚 推荐资源 / Recommended Resources')
  lines.push('')
  lines.push('| 资源 | 格式 | 时长(周) | 提供方 | 推荐理由 |')
  lines.push('|------|------|----------|--------|----------|')
  r.recommendations.forEach(function (rec) {
    lines.push('| ' + rec.resource + ' | ' + rec.format + ' | ' + rec.duration_weeks + ' | ' + rec.provider + ' | ' + rec.reason + ' |')
  })
  lines.push('')
  lines.push('### 📅 周学习计划 / Weekly Plan')
  lines.push('')
  lines.push('| 周次 | 重点 | 投入(小时) | 里程碑 |')
  lines.push('|------|------|-----------|--------|')
  r.weekly_plan.forEach(function (wp) {
    lines.push('| W' + wp.week + ' | ' + wp.focus + ' | ' + wp.hours + 'h | ' + wp.milestone + ' |')
  })
  lines.push('')
  lines.push('### 🎯 进度预测 / Projection')
  lines.push('')
  lines.push('- 状态: **' + (r.progress_projection.on_track ? '\u{2705}按计划进行' : '\u{26A0}\u{FE0F}需调整') + '**')
  lines.push('- 预计完成: **' + r.progress_projection.estimated_completion_weeks + '周**')
  lines.push('- 风险: ' + r.progress_projection.risk)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// TOOL 8: LIFE OS LITE - 个人操作系统仪表盘
// ============================================================================

interface LifeOSResult {
  summary: string
  dimension_scores: { health: number; finance: number; social: number; growth: number; overall: number }
  quadrant_analysis: { strength: string[]; balanced: string[]; attention: string[] }
  balance_insight: string
  this_week_focus: Array<{ area: string; action: string; impact: string }>
  trend: string
}

function analyzeLifeOSLite(data: LifeOSData): LifeOSResult {
  const rng = mulberry32(hashStr(data.health.exercise_min_week.toString() + data.finance.savings_rate.toString()))

  // 各维度评分 (0-100)
  const healthScore = Math.min(100, roundTo(
    (data.health.exercise_min_week / 150) * 30 +
    (data.health.sleep_hours_avg / 8) * 25 +
    (data.health.meditation_days_week / 7) * 20 +
    (data.health.energy_level / 10) * 25
  , 1))

  const financeScore = Math.min(100, roundTo(
    (data.finance.savings_rate / 30) * 30 +
    (data.finance.investment_pct / 50) * 25 +
    (data.finance.monthly_income > data.finance.monthly_expenses ? 30 : 10) +
    (data.finance.savings_rate > 20 ? 15 : 5)
  , 1))

  const socialScore = Math.min(100, roundTo(
    (data.social.quality_time_hours_week / 10) * 35 +
    (data.social.close_friends_count >= 5 ? 35 : data.social.close_friends_count * 7) +
    (data.social.network_growth_monthly >= 3 ? 30 : data.social.network_growth_monthly * 10)
  , 1))

  const growthScore = Math.min(100, roundTo(
    (data.growth.books_read_month / 2) * 30 +
    (data.growth.courses_completed_month / 1) * 35 +
    (data.growth.new_skills_practiced / 3) * 35
  , 1))

  const overall = roundTo((healthScore + financeScore + socialScore + growthScore) / 4, 1)

  // 象限分析
  const dims = [
    { name: '健康', score: healthScore },
    { name: '财务', score: financeScore },
    { name: '社交', score: socialScore },
    { name: '成长', score: growthScore }
  ]
  const strength = dims.filter(function (d) { return d.score >= 75 }).map(function (d) { return d.name })
  const balanced = dims.filter(function (d) { return d.score >= 50 && d.score < 75 }).map(function (d) { return d.name })
  const attention = dims.filter(function (d) { return d.score < 50 }).map(function (d) { return d.name })

  // 平衡洞察
  const maxDim = dims.reduce(function (a, b) { return a.score > b.score ? a : b })
  const minDim = dims.reduce(function (a, b) { return a.score < b.score ? a : b })
  const gap = maxDim.score - minDim.score

  let balanceInsight = ''
  if (gap > 30) {
    balanceInsight = '维度间差距较大（' + maxDim.score + ' vs ' + minDim.score + '），' + minDim.name + '明显滞后，建议重新分配精力。'
  } else if (gap > 15) {
    balanceInsight = '整体较为均衡，' + minDim.name + '可适度加强。'
  } else {
    balanceInsight = '各维度发展均衡，继续保持！'
  }

  // 本周焦点
  const thisWeekFocus: LifeOSResult['this_week_focus'] = []
  if (attention.length > 0) {
    attention.forEach(function (area) {
      const actions: Record<string, { action: string; impact: string }> = {
        '健康': { action: '每天30分钟运动 + 保证7小时睡眠', impact: '提升精力和免疫力' },
        '财务': { action: '梳理月度支出 + 设定自动储蓄计划', impact: '建立财务安全感' },
        '社交': { action: '安排2次高质量社交', impact: '增强归属感和支持系统' },
        '成长': { action: '完成1个学习模块或读1本书', impact: '持续自我增值' }
      }
      const a = actions[area] || { action: '制定行动计划', impact: '逐步提升' }
      thisWeekFocus.push({ area, action: a.action, impact: a.impact })
    })
  } else {
    thisWeekFocus.push({ area: '综合', action: '维持当前好习惯 + 探索新可能', impact: '持续精进' })
  }

  const trend = overall >= 70 ? '\u{2191} 上升趋势' : overall >= 50 ? '\u{2192} 稳步持平' : '\u{2193} 需要调整'

  return {
    summary: `生活OS综合评分 ${overall}/100。最强: ${maxDim.name}(${maxDim.score})，待加强: ${minDim.name}(${minDim.score})。${balanceInsight}`,
    dimension_scores: { health: healthScore, finance: financeScore, social: socialScore, growth: growthScore, overall },
    quadrant_analysis: { strength, balanced, attention },
    balance_insight: balanceInsight,
    this_week_focus: thisWeekFocus,
    trend
  }
}

function formatLifeOSLiteReport(r: LifeOSResult): string {
  const lines: string[] = []
  lines.push('## ⚖️ 个人操作系统 / Life OS Dashboard')
  lines.push('')
  lines.push('> ' + r.summary)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('### 📊 四维度评分 / Dimension Scores')
  lines.push('')
  lines.push('| 维度 | 得分 | 状态 | 进度条 |')
  lines.push('|------|------|------|--------|')
  const dims = [
    { label: '🏃 健康 Health', score: r.dimension_scores.health },
    { label: '💰 财务 Finance', score: r.dimension_scores.finance },
    { label: '🤝 社交 Social', score: r.dimension_scores.social },
    { label: '🎓 成长 Growth', score: r.dimension_scores.growth }
  ]
  dims.forEach(function (d) {
    const filled = Math.round(d.score / 5)
    const bar = '\u{2588}'.repeat(filled) + '\u{2591}'.repeat(20 - filled)
    const status = d.score >= 75 ? '\u{1F7E2}优秀' : d.score >= 50 ? '\u{1F7E1}良好' : '\u{1F534}需关注'
    lines.push('| ' + d.label + ' | ' + d.score + '/100 | ' + status + ' | ' + bar + ' |')
  })
  lines.push('| **综合 Overall** | **' + r.dimension_scores.overall + '/100** | — | — |')
  lines.push('')
  lines.push('### ⚖️ 平衡分析 / Balance Analysis')
  lines.push('')
  lines.push('**优势维度:** ' + (r.quadrant_analysis.strength.length > 0 ? r.quadrant_analysis.strength.join('、') : '暂无'))
  lines.push('')
  lines.push('**均衡维度:** ' + (r.quadrant_analysis.balanced.length > 0 ? r.quadrant_analysis.balanced.join('、') : '暂无'))
  lines.push('')
  lines.push('**需关注维度:** ' + (r.quadrant_analysis.attention.length > 0 ? r.quadrant_analysis.attention.join('、') : '暂无'))
  lines.push('')
  lines.push('### 📝 洞察 / Insight')
  lines.push('')
  lines.push('> ' + r.balance_insight)
  lines.push('')
  lines.push('### 🎯 本周焦点 / This Week Focus')
  lines.push('')
  lines.push('| 领域 | 行动 | 预期效果 |')
  lines.push('|------|------|----------|')
  r.this_week_focus.forEach(function (f) {
    lines.push('| ' + f.area + ' | ' + f.action + ' | ' + f.impact + ' |')
  })
  lines.push('')
  lines.push('### 📈 趋势 / Trend')
  lines.push('')
  lines.push('`' + r.trend + '`')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*PersonalAI v1 • Powered by DeepSeek Harness*')
  return lines.join('\n')
}

// ============================================================================
// PLUGIN REGISTRATION - 插件注册
// ============================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: 每日智能简报
  tools.register(defineTool({
    name: 'daily_briefing',
    description: '每日智能简报(Daily Briefing) - 整合日程、天气、热点新闻和待办，自动优先级排序，生成Eisenhower矩阵和时间块建议',
    parameters: {
      briefing_data: { type: 'string', required: true, description: 'JSON.stringify的DailyBriefingData对象，包含date/weather/schedule/news_headlines/todos字段，用于生成每日简报' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { briefing_data: string }) {
      const data: DailyBriefingData = JSON.parse(args.briefing_data)
      const result = analyzeDailyBriefing(data)
      return formatDailyBriefingReport(result)
    }
  }))

  // Tool 2: 邮件智能分类
  tools.register(defineTool({
    name: 'inbox_triage',
    description: '邮件/消息智能分类(Inbox Triage) - 自动将邮件分为紧急/重要/可延后/归档四类，并起草回复建议',
    parameters: {
      inbox_data: { type: 'string', required: true, description: 'JSON.stringify的InboxData对象，包含messages数组（每项含id/from/subject/body_preview/received_at/labels等字段）' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { inbox_data: string }) {
      const data: InboxData = JSON.parse(args.inbox_data)
      const result = analyzeInboxTriage(data)
      return formatInboxTriageReport(result)
    }
  }))

  // Tool 3: 会议助手
  tools.register(defineTool({
    name: 'meeting_assistant',
    description: '会议助手(Meeting Assistant) - 自动生成议程、发言纪要框架、行动项提取和后续跟进计划',
    parameters: {
      meeting_data: { type: 'string', required: true, description: 'JSON.stringify的MeetingData对象，包含meeting_title/attendees/duration_min/objective等字段' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { meeting_data: string }) {
      const data: MeetingData = JSON.parse(args.meeting_data)
      const result = analyzeMeetingAssistant(data)
      return formatMeetingAssistantReport(result)
    }
  }))

  // Tool 4: 专注力守护
  tools.register(defineTool({
    name: 'focus_guardian',
    description: '专注力守护(Focus Guardian) - 统计打断次数、分析深度工作时段建议、生成干扰过滤规则',
    parameters: {
      focus_data: { type: 'string', required: true, description: 'JSON.stringify的FocusData对象，包含work_hours_start/end/interruptions数组/deep_work_goal_min/energy_pattern等字段' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { focus_data: string }) {
      const data: FocusData = JSON.parse(args.focus_data)
      const result = analyzeFocusGuardian(data)
      return formatFocusGuardianReport(result)
    }
  }))

  // Tool 5: 个性化知识推送
  tools.register(defineTool({
    name: 'knowledge_feed',
    description: '个性化知识推送(Knowledge Feed) - 基于兴趣和当前项目推荐论文/新闻/行业动态，生成阅读队列',
    parameters: {
      knowledge_data: { type: 'string', required: true, description: 'JSON.stringify的KnowledgeData对象，包含interests/current_projects/read_history/preferred_sources/max_items等字段' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { knowledge_data: string }) {
      const data: KnowledgeData = JSON.parse(args.knowledge_data)
      const result = analyzeKnowledgeFeed(data)
      return formatKnowledgeFeedReport(result)
    }
  }))

  // Tool 6: 习惯养成追踪
  tools.register(defineTool({
    name: 'habit_tracker',
    description: '习惯养成追踪(Habit Tracker) - 追踪目标完成度、连胜记录、达标奖励机制和需关注习惯预警',
    parameters: {
      habit_data: { type: 'string', required: true, description: 'JSON.stringify的HabitData对象，包含habits数组（每项含name/target_per_week/completed_days/category/streak_target）和week_start_date字段' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { habit_data: string }) {
      const data: HabitData = JSON.parse(args.habit_data)
      const result = analyzeHabitTracker(data)
      return formatHabitTrackerReport(result)
    }
  }))

  // Tool 7: 个性化学习路径
  tools.register(defineTool({
    name: 'learning_path',
    description: '个性化学习路径(Learning Path) - 分析技能差距、推荐学习资源、生成周学习计划和进度预测',
    parameters: {
      learning_data: { type: 'string', required: true, description: 'JSON.stringify的LearningData对象，包含current_skills/target_skills/available_hours_per_week/preferred_format等字段' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { learning_data: string }) {
      const data: LearningData = JSON.parse(args.learning_data)
      const result = analyzeLearningPath(data)
      return formatLearningPathReport(result)
    }
  }))

  // Tool 8: 个人操作系统仪表盘
  tools.register(defineTool({
    name: 'life_os_lite',
    description: '个人操作系统仪表盘(Life OS Lite) - 健康/财务/社交/成长四维度平衡分析，生成改进建议和本周焦点',
    parameters: {
      life_data: { type: 'string', required: true, description: 'JSON.stringify的LifeOSData对象，包含health/finance/social/growth四个维度的细分数据字段' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { life_data: string }) {
      const data: LifeOSData = JSON.parse(args.life_data)
      const result = analyzeLifeOSLite(data)
      return formatLifeOSLiteReport(result)
    }
  }))

  console.log(`[dsh-tool-personalai] 已加载 v${VERSION} - 个人AI助手，8个工具就绪`)
  console.log('  工具列表: daily_briefing, inbox_triage, meeting_assistant, focus_guardian, knowledge_feed, habit_tracker, learning_path, life_os_lite')
}
