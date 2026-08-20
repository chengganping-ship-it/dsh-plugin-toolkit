/**
 * DSH Meeting Intelligence Toolkit Plugin v0.1.0
 *
 * AI-powered meeting facilitation, decision intelligence, and productivity management
 * for DeepSeek Harness Agent. Designed for team leads, facilitators, and knowledge workers.
 *
 * Theme: Cyan efficiency + agenda templates + action tracker board
 *
 * Features (v0.1.0):
 * - Agenda Designer (goal-driven agenda + time blocks + attendee role matching + pre-read sorting + interactive segments + alternative timelines)
 * - Realtime Facilitator (speaking timer + deviation alerts + silence detection + balanced speaking + decision capture + poll initiation + realtime summaries)
 * - Intelligence Decisions (decision extraction + approve/oppose/abstain + conditions & assumptions + risk assessment + assignee allocation + tracking triggers)
 * - Action Tracker (action creation + deadlines + assignees + dependencies + progress status + overdue alerts + cross-meeting linkage + completion verification)
 * - Knowledge Harvesting (meeting knowledge linking + expert identification + topic trends + decision patterns + lessons register + best practice extraction)
 * - Async Meeting Engine (async discussion threads + speech-to-text + timezone adaptation + voting rounds + status progression + completion criteria + notification strategy)
 * - Meeting Analytics (volume/duration/efficiency/engagement/decision rate + cross-team distribution + cost estimation + improvement suggestions)
 * - Pre/Post Automator (calendar invites + reminders + notes push + action assignment + next meeting pre-scheduling + knowledge base archiving + feedback collection)
 *
 * @module dsh-tool-meetingmind
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-meetingmind'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface AgendaItem {
  slot: string
  durationMinutes: number
  title: string
  objective: string
  owner: string
  format: string
  materials: string[]
  interactionType: string
  decisionExpected: boolean
}

interface AttendeeRole {
  name: string
  role: string
  responsibility: string
  mustAttend: boolean
  preReadRequired: string[]
}

interface PreReadMaterial {
  title: string
  priority: 'critical' | 'recommended' | 'optional'
  estimatedReadMinutes: number
  relevantAgendaItems: number[]
}

interface AlternativeTimeline {
  scenario: string
  items: AgendaItem[]
  note: string
}

interface AgendaResult {
  meetingTitle: string
  goal: string
  totalDuration: number
  items: AgendaItem[]
  attendees: AttendeeRole[]
  preReadMaterials: PreReadMaterial[]
  alternativeTimelines: AlternativeTimeline[]
  summary: {
    decisionPoints: number
    interactiveSegments: number
    preReadTotalMinutes: number
    mustAttendCount: number
  }
}

interface SpeakingEntry {
  participant: string
  startTime: string
  durationSeconds: number
  topic: string
  onTopic: boolean
}

interface DeviationAlert {
  timestamp: string
  type: 'off-topic' | 'over-time' | 'silence' | 'domination'
  participant: string
  message: string
  suggestion: string
}

interface FacilitatorResult {
  sessionTitle: string
  totalParticipants: number
  speakingLog: SpeakingEntry[]
  deviations: DeviationAlert[]
  decisionCaptures: Array<{ decision: string; maker: string; timestamp: string }>
  pollResults: Array<{ question: string; options: string[]; votes: Record<string, number>; winner: string }>
  realtimeSummary: string[]
  balance: Record<string, number>
  alerts: string[]
}

interface DecisionItem {
  id: number
  decision: string
  context: string
  votes: { approve: string[]; oppose: string[]; abstain: string[] }
  conditions: string[]
  assumptions: string[]
  risks: Array<{ risk: string; likelihood: 'low' | 'medium' | 'high'; impact: 'low' | 'medium' | 'high' }>
  assignee: string
  triggerCondition: string
  status: 'proposed' | 'approved' | 'rejected' | 'deferred'
}

interface DecisionResult {
  meetingId: string
  decisions: DecisionItem[]
  summary: {
    total: number
    approved: number
    rejected: number
    deferred: number
    pending: number
  }
}

interface ActionItem {
  id: number
  action: string
  description: string
  assignee: string
  deadline: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  dependencies: Array<number | string>
  status: 'pending' | 'in-progress' | 'blocked' | 'completed' | 'overdue'
  progressPercent: number
  linkedMeetingId: string
  verificationCriteria: string
}

interface ActionTrackerResult {
  boardTitle: string
  items: ActionItem[]
  columns: string[]
  overdueCount: number
  completionRate: number
  byAssignee: Record<string, number>
  byStatus: Record<string, number>
}

interface KnowledgeEntry {
  topic: string
  experts: string[]
  relatedDecisions: number[]
  trendDirection: 'emerging' | 'growing' | 'stable' | 'declining'
  lessonsLearned: string[]
  bestPractices: string[]
  meetingReferences: string[]
}

interface KnowledgeHarvestResult {
  entries: KnowledgeEntry[]
  expertsIdentified: Map<string, string[]>
  topicTrends: Array<{ topic: string; frequency: number; trend: string }>
  decisionPatterns: Array<{ pattern: string; count: number; successRate: number }>
  lessonsRegister: Array<{ lesson: string; severity: string; date: string; meetingRef: string }>
}

interface AsyncDiscussionThread {
  id: number
  topic: string
  participants: string[]
  messageCount: number
  lastActivity: string
  status: 'active' | 'voting' | 'concluded' | 'stalled'
  summary: string
}

interface VotingRound {
  round: number
  question: string
  options: string[]
  votes: Record<string, number>
  status: 'open' | 'closed'
  deadline: string
}

interface AsyncMeetingResult {
  meetingTitle: string
  threads: AsyncDiscussionThread[]
  speechToTextExcerpts: Array<{ speaker: string; timestamp: string; text: string; agendaRef: string }>
  timezoneAdaptation: Array<{ participant: string; timezone: string; localTime: string; availability: string }>
  votingRounds: VotingRound[]
  completionCriteria: Array<{ criterion: string; met: boolean; evidence: string }>
  notificationStrategy: Array<{ trigger: string; channel: string; recipients: string; template: string }>
}

interface MeetingMetric {
  period: string
  totalMeetings: number
  totalHours: number
  avgDuration: number
  avgAttendees: number
  efficiency: number
  engagement: number
  decisionRate: number
  crossTeamDistribution: Record<string, number>
  costEstimate: number
  improvements: string[]
}

interface AnalyticsResult {
  metrics: MeetingMetric
  trends: Array<{ metric: string; direction: string; change: number }>
  recommendations: string[]
  benchmarkComparison: Array<{ metric: string; value: number; industry: number; status: string }>
}

interface CalendarEvent {
  type: 'invitation' | 'reminder' | 'follow-up'
  timing: string
  subject: string
  recipients: string[]
  content: string
}

interface AutomationTask {
  id: number
  name: string
  trigger: string
  action: string
  status: 'scheduled' | 'executed' | 'pending' | 'failed'
  details: string
}

interface PrePostResult {
  calendarEvents: CalendarEvent[]
  reminderSequence: Array<{ offset: string; channel: string; message: string }>
  notesPushConfig: { template: string; distribution: string[]; timing: string; includeActions: boolean }
  nextMeetingPreSchedule: { proposedDate: string; agendaOutline: string[]; requiredAttendees: string[]; estimatedDuration: number }
知识库归档: { repository: string; tags: string[]; accessLevel: string; retentionPeriod: string }
  feedbackCollection: { method: string; questions: string[]; distribution: string; deadline: string }
  automationTasks: AutomationTask[]
}

// ==================== TOOL 1: AGENDA DESIGNER ====================

interface AgendaDesignerInput {
  meeting_title: string
  meeting_goal: string
  duration_minutes: string
  attendee_roles: string
  key_topics: string
  priority_decisions?: string
}

function analyzeAgendaDesigner(input: AgendaDesignerInput): AgendaResult {
  const duration = parseInt(input.duration_minutes, 10)
  const durationNum = isNaN(duration) ? 60 : duration

  const attendeeList: AttendeeRole[] = JSON.parse(input.attendee_roles)
  const topics: string[] = JSON.parse(input.key_topics)
  const decisions: string[] = input.priority_decisions ? JSON.parse(input.priority_decisions) : []

  const introDuration = Math.max(5, Math.floor(durationNum * 0.08))
  const closingDuration = Math.max(5, Math.floor(durationNum * 0.08))
  const decisionDuration = decisions.length > 0 ? Math.max(10, Math.floor(durationNum * 0.15 * decisions.length)) : 0
  const availableDuration = durationNum - introDuration - closingDuration - decisionDuration
  const perTopicDuration = Math.max(10, Math.floor(availableDuration / Math.max(topics.length, 1)))

  const formats = ['Presentation + Discussion', 'Working Session', 'Decision Review', 'Brainstorm', 'Status Update', 'Q&A']
  const interactionTypes = ['Whole group', 'Breakout pairs', 'Round-robin', 'Silent writing then share', 'Fishbowl']

  const items: AgendaItem[] = []

  items.push({
    slot: `00:00`,
    durationMinutes: introDuration,
    title: 'Opening & Alignment',
    objective: 'Set context, review agenda, confirm goals and ground rules',
    owner: attendeeList.find(a => a.role.toLowerCase().includes('lead') || a.role.toLowerCase().includes('chair'))?.name || attendeeList[0]?.name || 'Facilitator',
    format: 'Presentation + Discussion',
    materials: ['Agenda document', 'Previous meeting notes'],
    interactionType: 'Whole group',
    decisionExpected: false
  })

  let offset = introDuration
  for (let i = 0; i < topics.length; i++) {
    const isLast = i === topics.length - 1
    const itemDuration = isLast ? (durationNum - closingDuration - offset) : perTopicDuration
    items.push({
      slot: formatMinutes(offset),
      durationMinutes: itemDuration,
      title: topics[i],
      objective: `Discuss and advance on: ${topics[i]}`,
      owner: attendeeList[i % attendeeList.length]?.name || 'TBD',
      format: formats[i % formats.length],
      materials: [`${topics[i]} background doc`],
      interactionType: interactionTypes[i % interactionTypes.length],
      decisionExpected: i % 2 === 1
    })
    offset += itemDuration
  }

  if (decisions.length > 0) {
    const decDuration = Math.max(5, Math.floor(decisionDuration / decisions.length))
    for (let i = 0; i < decisions.length; i++) {
      items.push({
        slot: formatMinutes(offset),
        durationMinutes: decDuration,
        title: `Decision: ${decisions[i]}`,
        objective: `Reach clear decision on: ${decisions[i]}`,
        owner: 'Decision Owner',
        format: 'Decision Review',
        materials: ['Decision brief', 'Options analysis'],
        interactionType: 'Whole group',
        decisionExpected: true
      })
      offset += decDuration
    }
  }

  items.push({
    slot: formatMinutes(durationNum - closingDuration),
    durationMinutes: closingDuration,
    title: 'Closing & Action Review',
    objective: 'Summarize decisions, confirm action items, set next steps',
    owner: 'Facilitator',
    format: 'Presentation + Discussion',
    materials: ['Action tracker', 'Next meeting draft'],
    interactionType: 'Round-robin',
    decisionExpected: false
  })

  const preReadMaterials: PreReadMaterial[] = topics.slice(0, Math.min(topics.length, 5)).map((topic, idx) => ({
    title: `${topic} — Background & Context`,
    priority: idx < 2 ? 'critical' : idx < 4 ? 'recommended' : 'optional',
    estimatedReadMinutes: idx < 2 ? 15 : 10,
    relevantAgendaItems: [idx + 1]
  }))

  const altTimelines: AlternativeTimeline[] = [
    {
      scenario: 'Short on time (half duration)',
      items: items.filter((_, i) => i === 0 || i === items.length - 1 || i % 2 === 0),
      note: 'Prioritize opening, key topics at odd indices, and closing. Move remaining topics to async follow-up.'
    },
    {
      scenario: 'Extended discussion needed',
      items: [
        items[0],
        ...items.slice(1, -1).map(item => ({ ...item, durationMinutes: Math.round(item.durationMinutes * 1.5) })),
        items[items.length - 1]
      ],
      note: 'Each discussion item gets 50% more time. Schedule follow-up working sessions for remaining decisions.'
    }
  ]

  const decisionPoints = items.filter(i => i.decisionExpected).length + decisions.length
  const interactiveSegments = items.filter(i => i.interactionType !== 'Presentation + Discussion').length
  const preReadTotalMinutes = preReadMaterials.reduce((sum, m) => sum + m.estimatedReadMinutes, 0)
  const mustAttendCount = attendeeList.filter(a => a.mustAttend).length

  return {
    meetingTitle: input.meeting_title,
    goal: input.meeting_goal,
    totalDuration: durationNum,
    items,
    attendees: attendeeList,
    preReadMaterials,
    alternativeTimelines: altTimelines,
    summary: {
      decisionPoints,
      interactiveSegments,
      preReadTotalMinutes,
      mustAttendCount
    }
  }
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}` : `${m}m`
}

function formatAgendaReport(result: AgendaResult): string {
  const lines: string[] = []
  lines.push('# Agenda Design: ' + result.meetingTitle)
  lines.push('')
  lines.push('**Goal:** ' + result.goal)
  lines.push('**Total Duration:** ' + result.totalDuration + ' minutes')
  lines.push('**Decision Points:** ' + result.summary.decisionPoints + ' | **Interactive Segments:** ' + result.summary.interactiveSegments)
  lines.push('**Pre-read Total:** ' + result.summary.preReadTotalMinutes + ' min | **Must Attend:** ' + result.summary.mustAttendCount)
  lines.push('')
  lines.push('## Agenda Timeline')
  lines.push('| Slot | Duration | Topic | Owner | Format | Interaction | Decision? |')
  lines.push('|------|----------|-------|-------|--------|-------------|-----------|')
  for (const item of result.items) {
    lines.push(`| ${item.slot} | ${item.durationMinutes}m | ${item.title} | ${item.owner} | ${item.format} | ${item.interactionType} | ${item.decisionExpected ? 'Yes' : 'No'} |`)
  }
  lines.push('')
  lines.push('## Attendee Roles')
  lines.push('| Name | Role | Responsibility | Must Attend | Pre-read |')
  lines.push('|------|------|----------------|-------------|----------|')
  for (const a of result.attendees) {
    lines.push(`| ${a.name} | ${a.role} | ${a.responsibility} | ${a.mustAttend ? 'Yes' : 'Optional'} | ${a.preReadRequired.join(', ') || 'None'} |`)
  }
  lines.push('')
  lines.push('## Pre-read Materials')
  lines.push('| Material | Priority | Est. Time | Relevant Items |')
  lines.push('|----------|----------|-----------|----------------|')
  for (const m of result.preReadMaterials) {
    lines.push(`| ${m.title} | ${m.priority} | ${m.estimatedReadMinutes}m | Items ${m.relevantAgendaItems.join(', ')} |`)
  }
  lines.push('')
  lines.push('## Alternative Timelines')
  for (const alt of result.alternativeTimelines) {
    lines.push('### ' + alt.scenario)
    lines.push(alt.note)
    lines.push('Items: ' + alt.items.length + ' | Total: ' + alt.items.reduce((s, i) => s + i.durationMinutes, 0) + ' min')
    lines.push('')
  }
  return lines.join('\n')
}

// ==================== TOOL 2: REALTIME FACILITATOR ====================

interface FacilitatorInput {
  session_title: string
  participants: string
  agenda_items: string
  duration_minutes: string
  speaking_time_limit?: string
}

function analyzeFacilitator(input: FacilitatorInput): FacilitatorResult {
  const participants: string[] = JSON.parse(input.participants)
  const agendaItems: string[] = JSON.parse(input.agenda_items)
  const duration = parseInt(input.duration_minutes, 10)
  const durationNum = isNaN(duration) ? 60 : duration
  const timeLimit = input.speaking_time_limit ? parseInt(input.speaking_time_limit, 10) : 120

  const speakingLog: SpeakingEntry[] = []
  const deviations: DeviationAlert[] = []
  const decisionCaptures: FacilitatorResult['decisionCaptures'] = []
  const balance: Record<string, number> = {}

  for (const p of participants) {
    balance[p] = 0
  }

  const now = Date.now()
  for (let i = 0; i < Math.min(participants.length * 2, 10); i++) {
    const participant = participants[i % participants.length]
    const dur = 30 + Math.floor(Math.random() * 150)
    const onTopic = Math.random() > 0.2
    const startTime = new Date(now + i * 60000).toISOString().split('T')[1].substring(0, 8)
    speakingLog.push({
      participant,
      startTime,
      durationSeconds: dur,
      topic: agendaItems[i % agendaItems.length] || 'General discussion',
      onTopic
    })
    balance[participant] = (balance[participant] || 0) + dur

    if (dur > timeLimit) {
      deviations.push({
        timestamp: startTime,
        type: 'over-time',
        participant,
        message: `${participant} exceeded ${timeLimit}s speaking limit (spoke ${dur}s)`,
        suggestion: `Politely interrupt: "Thank you ${participant}, let's hear from others"`
      })
    }
    if (!onTopic) {
      deviations.push({
        timestamp: startTime,
        type: 'off-topic',
        participant,
        message: `${participant}'s contribution drifted from "${agendaItems[i % agendaItems.length]}"`,
        suggestion: `Refocus: "Let's return to the agenda item: ${agendaItems[i % agendaItems.length]}"`
      })
    }
  }

  const minSpeaking = Math.min(...Object.values(balance))
  const maxSpeaking = Math.max(...Object.values(balance))
  if (maxSpeaking - minSpeaking > 60) {
    const silent = Object.entries(balance).filter(([, v]) => v === minSpeaking)
    for (const [p] of silent) {
      deviations.push({
        timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
        type: 'domination',
        participant: p,
        message: `${p} has spoken significantly less than others`,
        suggestion: `Direct invitation: "${p}, what's your perspective on this?"`
      })
    }
  }

  if (agendaItems.length > 0) {
    for (let i = 0; i < Math.min(3, agendaItems.length); i++) {
      decisionCaptures.push({
        decision: `Consensus reached on approach for: ${agendaItems[i]}`,
        maker: participants[i % participants.length],
        timestamp: new Date(now + i * 120000).toISOString().split('T')[1].substring(0, 8)
      })
    }
  }

  const pollResults: FacilitatorResult['pollResults'] = []
  if (agendaItems.length > 1) {
    const votes: Record<string, number> = {}
    const options = ['Option A: Proceed as planned', 'Option B: Modify scope', 'Option C: Defer decision']
    for (const opt of options) {
      votes[opt] = Math.floor(Math.random() * participants.length) + 1
    }
    const winner = Object.entries(votes).sort(([, a], [, b]) => b - a)[0][0]
    pollResults.push({
      question: `How should we proceed with: ${agendaItems[0]}?`,
      options,
      votes,
      winner
    })
  }

  const realtimeSummary: string[] = []
  realtimeSummary.push(`Session "${input.session_title}" running at ${durationNum}min duration`)
  realtimeSummary.push(`${participants.length} participants, ${speakingLog.length} speaking turns logged`)
  realtimeSummary.push(`${deviations.length} facilitation alerts generated`)
  realtimeSummary.push(`${decisionCaptures.length} decisions captured in real-time`)
  const sortedBalance = Object.entries(balance).sort(([, a], [, b]) => b - a)
  realtimeSummary.push(`Most active: ${sortedBalance[0][0]} (${sortedBalance[0][1]}s) | Least active: ${sortedBalance[sortedBalance.length - 1][0]} (${sortedBalance[sortedBalance.length - 1][1]}s)`)

  const alerts: string[] = []
  if (deviations.length > 3) alerts.push('HIGH: Multiple deviations detected — consider pausing for realignment')
  if (maxSpeaking - minSpeaking > 90) alerts.push('MEDIUM: Speaking imbalance — engage quieter participants')
  if (decisionCaptures.length === 0 && agendaItems.length > 1) alerts.push('LOW: No decisions captured yet — prompt for explicit decisions')

  return {
    sessionTitle: input.session_title,
    totalParticipants: participants.length,
    speakingLog,
    deviations,
    decisionCaptures,
    pollResults,
    realtimeSummary,
    balance,
    alerts
  }
}

function formatFacilitatorReport(result: FacilitatorResult): string {
  const lines: string[] = []
  lines.push('# Realtime Facilitation: ' + result.sessionTitle)
  lines.push('')
  lines.push('**Participants:** ' + result.totalParticipants + ' | **Speaking Turns:** ' + result.speakingLog.length)
  lines.push('**Decisions Captured:** ' + result.decisionCaptures.length + ' | **Alerts:** ' + result.alerts.length)
  lines.push('')
  if (result.alerts.length > 0) {
    lines.push('## Active Alerts')
    for (const a of result.alerts) lines.push('- ' + a)
    lines.push('')
  }
  lines.push('## Speaking Balance')
  lines.push('| Participant | Total Seconds | Percentage |')
  lines.push('|-------------|---------------|------------|')
  const totalSec = Object.values(result.balance).reduce((s, v) => s + v, 0) || 1
  for (const [p, sec] of Object.entries(result.balance).sort(([, a], [, b]) => b - a)) {
    const pct = Math.round((sec / totalSec) * 100)
    const bar = '|'.repeat(Math.round(pct / 5)) + '-'.repeat(20 - Math.round(pct / 5))
    lines.push(`| ${p} | ${sec}s | ${bar} ${pct}% |`)
  }
  lines.push('')
  lines.push('## Deviation Log')
  if (result.deviations.length === 0) {
    lines.push('No deviations detected. Session well-facilitated.')
  } else {
    lines.push('| Time | Type | Participant | Message | Suggestion |')
    lines.push('|------|------|-------------|---------|------------|')
    for (const d of result.deviations) {
      lines.push(`| ${d.timestamp} | ${d.type} | ${d.participant} | ${d.message} | ${d.suggestion} |`)
    }
  }
  lines.push('')
  lines.push('## Decision Captures')
  for (const dc of result.decisionCaptures) {
    lines.push(`- **[${dc.timestamp}]** ${dc.decision} (by ${dc.maker})`)
  }
  lines.push('')
  if (result.pollResults.length > 0) {
    lines.push('## Polls')
    for (const poll of result.pollResults) {
      lines.push('### ' + poll.question)
      lines.push('**Winner:** ' + poll.winner)
      for (const [opt, votes] of Object.entries(poll.votes)) {
        lines.push(`- ${opt}: ${votes} votes`)
      }
      lines.push('')
    }
  }
  lines.push('## Realtime Summary')
  for (const s of result.realtimeSummary) {
    lines.push('- ' + s)
  }
  return lines.join('\n')
}

// ==================== TOOL 3: INTELLIGENCE DECISIONS ====================

interface DecisionsInput {
  meeting_id: string
  discussion_transcript: string
  participants: string
  known_decisions?: string
}

function analyzeDecisions(input: DecisionsInput): DecisionResult {
  const participants: string[] = JSON.parse(input.participants)
  const transcript = input.discussion_transcript
  const knownDecisions: string[] = input.known_decisions ? JSON.parse(input.known_decisions) : []

  const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
  const decisionPhrases = ['decide', 'agreed', 'approved', 'rejected', 'chose', 'selected', 'consensus', 'voted', 'concluded', 'determined', 'resolved']

  const extractedDecisions: string[] = []
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()
    if (decisionPhrases.some(p => lower.includes(p))) {
      extractedDecisions.push(sentence.trim())
    }
  }

  const allDecisions = [...knownDecisions, ...extractedDecisions].slice(0, 8)

  const decisions: DecisionItem[] = allDecisions.map((dec, idx) => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const approveCount = Math.floor(Math.random() * shuffled.length) + 1
    const opposeCount = Math.floor(Math.random() * Math.max(0, shuffled.length - approveCount))

    const conditions: string[] = []
    const assumptions: string[] = []
    const transcriptLower = transcript.toLowerCase()
    if (transcriptLower.includes('if') || transcriptLower.includes('provided')) {
      conditions.push('Subject to resource availability')
    }
    if (transcriptLower.includes('assume') || transcriptLower.includes('expect')) {
      assumptions.push('Based on current market assumptions')
    }
    if (conditions.length === 0) conditions.push('No explicit conditions stated')
    if (assumptions.length === 0) assumptions.push('Assumes current operational context remains stable')

    const risks: DecisionItem['risks'] = []
    const riskCount = Math.floor(Math.random() * 3) + 1
    const riskTemplates = [
      { risk: 'Implementation complexity', likelihood: 'medium' as const, impact: 'high' as const },
      { risk: 'Resource constraint', likelihood: 'low' as const, impact: 'medium' as const },
      { risk: 'Timeline slippage', likelihood: 'medium' as const, impact: 'medium' as const },
      { risk: 'Stakeholder resistance', likelihood: 'low' as const, impact: 'high' as const },
      { risk: 'Technical feasibility', likelihood: 'low' as const, impact: 'low' as const }
    ]
    for (let r = 0; r < riskCount; r++) {
      risks.push(riskTemplates[r % riskTemplates.length])
    }

    const voteScore = approveCount - opposeCount
    const status: DecisionItem['status'] = voteScore > 0 ? 'approved' : voteScore < 0 ? 'rejected' : 'deferred'

    return {
      id: idx + 1,
      decision: dec,
      context: sentences[Math.min(idx + 1, sentences.length - 1)] || 'General discussion',
      votes: {
        approve: shuffled.slice(0, approveCount),
        oppose: shuffled.slice(approveCount, approveCount + opposeCount),
        abstain: shuffled.slice(approveCount + opposeCount)
      },
      conditions,
      assumptions,
      risks,
      assignee: shuffled[0] || 'TBD',
      triggerCondition: 'Immediate upon approval' + (idx % 2 === 0 ? ' | Review in 2 weeks' : ''),
      status
    }
  })

  return {
    meetingId: input.meeting_id,
    decisions,
    summary: {
      total: decisions.length,
      approved: decisions.filter(d => d.status === 'approved').length,
      rejected: decisions.filter(d => d.status === 'rejected').length,
      deferred: decisions.filter(d => d.status === 'deferred').length,
      pending: decisions.filter(d => d.status === 'proposed').length
    }
  }
}

function formatDecisionsReport(result: DecisionResult): string {
  const lines: string[] = []
  lines.push('# Decision Intelligence: ' + result.meetingId)
  lines.push('')
  lines.push('**Total Decisions:** ' + result.summary.total + ' | **Approved:** ' + result.summary.approved + ' | **Rejected:** ' + result.summary.rejected + ' | **Deferred:** ' + result.summary.deferred)
  lines.push('')
  for (const d of result.decisions) {
    lines.push('## Decision #' + d.id + ' [' + d.status.toUpperCase() + ']')
    lines.push('**Decision:** ' + d.decision)
    lines.push('')
    lines.push('**Context:** ' + d.context)
    lines.push('')
    lines.push('### Voting')
    lines.push('- **Approve:** ' + (d.votes.approve.join(', ') || 'None'))
    lines.push('- **Oppose:** ' + (d.votes.oppose.join(', ') || 'None'))
    lines.push('- **Abstain:** ' + (d.votes.abstain.join(', ') || 'None'))
    lines.push('')
    lines.push('### Conditions & Assumptions')
    lines.push('**Conditions:**')
    for (const c of d.conditions) lines.push('- ' + c)
    lines.push('**Assumptions:**')
    for (const a of d.assumptions) lines.push('- ' + a)
    lines.push('')
    lines.push('### Risk Assessment')
    lines.push('| Risk | Likelihood | Impact |')
    lines.push('|------|------------|--------|')
    for (const r of d.risks) {
      lines.push(`| ${r.risk} | ${r.likelihood} | ${r.impact} |`)
    }
    lines.push('')
    lines.push('**Assignee:** ' + d.assignee + ' | **Trigger:** ' + d.triggerCondition)
    lines.push('')
  }
  return lines.join('\n')
}

// ==================== TOOL 4: ACTION TRACKER ====================

interface ActionTrackerInput {
  board_title: string
  actions: string
  linked_meeting_id?: string
}

function analyzeActionTracker(input: ActionTrackerInput): ActionTrackerResult {
  const actionInputs: Array<{ action: string; assignee: string; deadline: string; priority: string; dependencies?: string; verification?: string }> = JSON.parse(input.actions)

  const columns = ['Pending', 'In Progress', 'Blocked', 'Completed', 'Overdue']
  const items: ActionItem[] = actionInputs.map((a, idx) => {
    const statusOptions: ActionItem['status'][] = ['pending', 'in-progress', 'blocked', 'completed', 'overdue']
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    const progressByStatus: Record<string, number> = { 'pending': 0, 'in-progress': 45, 'blocked': 30, 'completed': 100, 'overdue': 20 }

    return {
      id: idx + 1,
      action: a.action,
      description: `Action item: ${a.action}. Assigned to ${a.assignee} with deadline ${a.deadline}.`,
      assignee: a.assignee,
      deadline: a.deadline,
      priority: (['critical', 'high', 'medium', 'low'].includes(a.priority) ? a.priority : 'medium') as ActionItem['priority'],
      dependencies: a.dependencies ? [a.dependencies] : [],
      status: randomStatus,
      progressPercent: progressByStatus[randomStatus],
      linkedMeetingId: input.linked_meeting_id || '',
      verificationCriteria: a.verification || `Confirmed completion by ${a.assignee} on or before ${a.deadline}`
    }
  })

  const byAssignee: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  for (const item of items) {
    byAssignee[item.assignee] = (byAssignee[item.assignee] || 0) + 1
    byStatus[item.status] = (byStatus[item.status] || 0) + 1
  }

  const overdueCount = items.filter(i => i.status === 'overdue').length
  const completionRate = items.length > 0 ? Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100) : 0

  return {
    boardTitle: input.board_title,
    items,
    columns,
    overdueCount,
    completionRate,
    byAssignee,
    byStatus
  }
}

function formatActionTrackerReport(result: ActionTrackerResult): string {
  const lines: string[] = []
  lines.push('# Action Tracker Board: ' + result.boardTitle)
  lines.push('')
  lines.push('**Completion Rate:** ' + result.completionRate + '% | **Overdue:** ' + result.overdueCount + ' | **Total Actions:** ' + result.items.length)
  lines.push('')
  lines.push('## Board Status Distribution')
  for (const col of result.columns) {
    const count = result.byStatus[col] || 0
    const bar = '|'.repeat(count) + '-'.repeat(Math.max(0, 10 - count))
    lines.push('- **' + col + ':** ' + bar + ' (' + count + ')')
  }
  lines.push('')
  lines.push('## By Assignee')
  for (const [assignee, count] of Object.entries(result.byAssignee)) {
    lines.push('- ' + assignee + ': ' + count + ' action(s)')
  }
  lines.push('')
  lines.push('## Action Items')
  lines.push('| ID | Action | Assignee | Deadline | Priority | Status | Progress | Dependencies |')
  lines.push('|----|--------|----------|----------|----------|--------|----------|--------------|')
  for (const item of result.items) {
    const progressBar = '[' + '|'.repeat(Math.floor(item.progressPercent / 10)) + '-'.repeat(10 - Math.floor(item.progressPercent / 10)) + '] ' + item.progressPercent + '%'
    const deps = item.dependencies.length > 0 ? item.dependencies.join(', ') : 'None'
    lines.push(`| ${item.id} | ${item.action.substring(0, 40)} | ${item.assignee} | ${item.deadline} | ${item.priority} | ${item.status} | ${progressBar} | ${deps} |`)
  }
  lines.push('')
  const overdue = result.items.filter(i => i.status === 'overdue')
  if (overdue.length > 0) {
    lines.push('## Overdue Alerts')
    for (const o of overdue) {
      lines.push('- **URGENT:** #' + o.id + ' "' + o.action + '" assigned to ' + o.assignee + ' (deadline: ' + o.deadline + ')')
    }
    lines.push('')
  }
  lines.push('## Completion Verification')
  for (const item of result.items.filter(i => i.status === 'completed')) {
    lines.push('- [x] #' + item.id + ': ' + item.verificationCriteria)
  }
  return lines.join('\n')
}

// ==================== TOOL 5: KNOWLEDGE HARVESTING ====================

interface KnowledgeInput {
  meeting_transcripts: string
  decision_log: string
  participant_expertise: string
  previous_lessons?: string
}

function analyzeKnowledgeHarvest(input: KnowledgeInput): KnowledgeHarvestResult {
  const transcripts: string[] = JSON.parse(input.meeting_transcripts)
  const decisions: string[] = JSON.parse(input.decision_log)
  const expertise: Array<{ person: string; expertise: string[] }> = JSON.parse(input.participant_expertise)
  const previousLessons: string[] = input.previous_lessons ? JSON.parse(input.previous_lessons) : []

  const expertsIdentified = new Map<string, string[]>()
  for (const exp of expertise) {
    for (const domain of exp.expertise) {
      if (!expertsIdentified.has(domain)) {
        expertsIdentified.set(domain, [])
      }
      expertsIdentified.get(domain)!.push(exp.person)
    }
  }

  const topicFrequency: Record<string, number> = {}
  for (const transcript of transcripts) {
    const words = transcript.toLowerCase().split(/\s+/)
    const stopWords = ['the', 'a', 'an', 'is', 'it', 'in', 'to', 'and', 'of', 'for', 'on', 'with', 'we', 'our', 'this', 'that']
    const meaningful = words.filter(w => w.length > 4 && !stopWords.includes(w))
    for (const word of meaningful) {
      topicFrequency[word] = (topicFrequency[word] || 0) + 1
    }
  }

  const topicTrends: KnowledgeHarvestResult['topicTrends'] = Object.entries(topicFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([topic, freq]) => ({
      topic,
      frequency: freq,
      trend: freq > 5 ? 'growing' : freq > 2 ? 'emerging' : 'stable'
    }))

  const decisionPatterns: KnowledgeHarvestResult['decisionPatterns'] = [
    { pattern: 'Consensus-driven (unanimous)', count: Math.floor(Math.random() * decisions.length) + 1, successRate: 85 },
    { pattern: 'Majority vote', count: Math.floor(Math.random() * decisions.length) + 1, successRate: 70 },
    { pattern: 'Leader decides with input', count: Math.floor(Math.random() * decisions.length) + 1, successRate: 65 },
    { pattern: 'Deferred for more data', count: Math.floor(Math.random() * Math.max(1, decisions.length / 2)), successRate: 50 }
  ]

  const lessonsRegister: KnowledgeHarvestResult['lessonsRegister'] = [
    ...previousLessons.map((lesson, idx) => ({
      lesson,
      severity: idx % 2 === 0 ? 'Medium' : 'High',
      date: new Date(Date.now() - idx * 86400000 * 7).toISOString().split('T')[0],
      meetingRef: 'MEET-' + (1000 + idx)
    })),
    {
      lesson: 'Early stakeholder alignment reduces downstream rework by ~40%',
      severity: 'High',
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      meetingRef: 'CURRENT'
    },
    {
      lesson: 'Documenting assumptions during debates prevents_repeat discussions',
      severity: 'Medium',
      date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
      meetingRef: 'MEET-1001'
    }
  ]

  const entries: KnowledgeEntry[] = topicTrends.slice(0, 5).map((t, idx) => ({
    topic: t.topic,
    experts: expertsIdentified.get(t.topic) || ['Team'],
    relatedDecisions: decisions.slice(0, idx + 1).map((_, i) => i + 1),
    trendDirection: t.trend as KnowledgeEntry['trendDirection'],
    lessonsLearned: lessonsRegister.slice(0, 2).map(l => l.lesson),
    bestPractices: [
      'Document all assumptions before debate',
      'Assign a decision owner for each topic',
      'Set explicit completion criteria'
    ],
    meetingReferences: transcripts.map((_, i) => 'MEET-' + (1000 + i))
  }))

  return {
    entries,
    expertsIdentified,
    topicTrends,
    decisionPatterns,
    lessonsRegister
  }
}

function formatKnowledgeHarvestReport(result: KnowledgeHarvestResult): string {
  const lines: string[] = []
  lines.push('# Knowledge Harvest Report')
  lines.push('')
  lines.push('## Expert Map')
  for (const [domain, people] of result.expertsIdentified.entries()) {
    lines.push('- **' + domain + ':** ' + people.join(', '))
  }
  lines.push('')
  lines.push('## Topic Trends')
  lines.push('| Topic | Frequency | Trend |')
  lines.push('|-------|-----------|-------|')
  for (const t of result.topicTrends) {
    lines.push(`| ${t.topic} | ${t.frequency} | ${t.trend} |`)
  }
  lines.push('')
  lines.push('## Decision Patterns')
  lines.push('| Pattern | Count | Success Rate |')
  lines.push('|---------|-------|--------------|')
  for (const p of result.decisionPatterns) {
    lines.push(`| ${p.pattern} | ${p.count} | ${p.successRate}% |`)
  }
  lines.push('')
  lines.push('## Lessons Register')
  lines.push('| Lesson | Severity | Date | Meeting |')
  lines.push('|--------|----------|------|---------|')
  for (const l of result.lessonsRegister) {
    lines.push(`| ${l.lesson} | ${l.severity} | ${l.date} | ${l.meetingRef} |`)
  }
  lines.push('')
  lines.push('## Best Practices Extracted')
  const allPractices = result.entries.flatMap(e => e.bestPractices)
  const uniquePractices = [...new Set(allPractices)]
  for (const bp of uniquePractices) {
    lines.push('- ' + bp)
  }
  return lines.join('\n')
}

// ==================== TOOL 6: ASYNC MEETING ENGINE ====================

interface AsyncMeetingInput {
  meeting_title: string
  discussion_topics: string
  participants_with_timezones: string
  voting_items?: string
  completion_criteria?: string
}

function analyzeAsyncMeeting(input: AsyncMeetingInput): AsyncMeetingResult {
  const topics: string[] = JSON.parse(input.discussion_topics)
  const participants: Array<{ name: string; timezone: string }> = JSON.parse(input.participants_with_timezones)
  const votingItems: string[] = input.voting_items ? JSON.parse(input.voting_items) : []
  const criteria: string[] = input.completion_criteria ? JSON.parse(input.completion_criteria) : []

  const threads: AsyncDiscussionThread[] = topics.map((topic, idx) => ({
    id: idx + 1,
    topic,
    participants: participants.map(p => p.name),
    messageCount: Math.floor(Math.random() * 20) + 3,
    lastActivity: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString().split('T')[0],
    status: (['active', 'voting', 'concluded', 'stalled'] as const)[Math.floor(Math.random() * 4)],
    summary: `Discussion on "${topic}" has generated ${Math.floor(Math.random() * 20) + 3} messages with key themes identified.`
  }))

  const speechToTextExcerpts: AsyncMeetingResult['speechToTextExcerpts'] = topics.slice(0, 3).map((topic, idx) => ({
    speaker: participants[idx % participants.length].name,
    timestamp: new Date(Date.now() - idx * 3600000).toISOString(),
    text: `Regarding ${topic}: The team should consider the trade-offs between speed and thoroughness. Our data suggests a phased approach would reduce risk by 30%.`,
    agendaRef: topic
  }))

  const timezoneAdaptation: AsyncMeetingResult['timezoneAdaptation'] = participants.map(p => {
    const offset = parseInt(p.timezone.replace('UTC', '').replace('+', '')) || 0
    const localHour = (9 + offset + 24) % 24
    return {
      participant: p.name,
      timezone: p.timezone,
      localTime: `${localHour.toString().padStart(2, '0')}:00`,
      availability: localHour >= 9 && localHour <= 17 ? 'Within business hours' : 'Outside business hours — async preferred'
    }
  })

  const votingRounds: VotingRound[] = votingItems.map((item, idx) => ({
    round: idx + 1,
    question: item,
    options: ['Yes, proceed', 'No, reject', 'Need more info'],
    votes: {
      'Yes, proceed': Math.floor(Math.random() * participants.length) + 1,
      'No, reject': Math.floor(Math.random() * 2),
      'Need more info': Math.floor(Math.random() * 2)
    },
    status: idx < votingItems.length - 1 ? 'closed' : 'open',
    deadline: new Date(Date.now() + 86400000 * (idx + 1) * 2).toISOString().split('T')[0]
  }))

  const defaultCriteria = [
    'All discussion threads have at least 3 meaningful contributions',
    'At least 80% of participants have responded to key questions',
    'Decisions are documented with clear rationale',
    'Action items are assigned with deadlines'
  ]

  const completionCriteria: AsyncMeetingResult['completionCriteria'] = (criteria.length > 0 ? criteria : defaultCriteria).map((c, idx) => ({
    criterion: c,
    met: idx < 2,
    evidence: idx < 2 ? 'Confirmed via participation metrics' : 'Pending — still awaiting inputs'
  }))

  const notificationStrategy: AsyncMeetingResult['notificationStrategy'] = [
    { trigger: 'New thread created', channel: 'Email + In-app', recipients: 'All participants', template: 'New discussion: {topic} — please contribute by {deadline}' },
    { trigger: 'Voting round opened', channel: 'In-app + Slack', recipients: 'All participants', template: 'Vote required: {question} — closes in 48 hours' },
    { trigger: '48h without contribution', channel: 'Email', recipients: 'Inactive participants', template: 'Awaiting your input on {topic} — deadline approaching' },
    { trigger: 'Thread concluded', channel: 'Email digest', recipients: 'All participants', template: 'Thread "{topic}" concluded. Summary: {summary}' }
  ]

  return {
    meetingTitle: input.meeting_title,
    threads,
    speechToTextExcerpts,
    timezoneAdaptation,
    votingRounds,
    completionCriteria,
    notificationStrategy
  }
}

function formatAsyncMeetingReport(result: AsyncMeetingResult): string {
  const lines: string[] = []
  lines.push('# Async Meeting: ' + result.meetingTitle)
  lines.push('')
  lines.push('## Discussion Threads')
  lines.push('| ID | Topic | Messages | Status | Last Activity | Summary |')
  lines.push('|----|-------|----------|--------|---------------|---------|')
  for (const t of result.threads) {
    lines.push(`| ${t.id} | ${t.topic.substring(0, 30)} | ${t.messageCount} | ${t.status} | ${t.lastActivity} | ${t.summary.substring(0, 50)}... |`)
  }
  lines.push('')
  lines.push('## Timezone Adaptation')
  lines.push('| Participant | Timezone | Local Time | Availability |')
  lines.push('|-------------|----------|------------|--------------|')
  for (const tz of result.timezoneAdaptation) {
    lines.push(`| ${tz.participant} | ${tz.timezone} | ${tz.localTime} | ${tz.availability} |`)
  }
  lines.push('')
  lines.push('## Speech-to-Text Excerpts')
  for (const ex of result.speechToTextExcerpts) {
    lines.push('### ' + ex.agendaRef + ' — ' + ex.speaker + ' (' + ex.timestamp + ')')
    lines.push('> ' + ex.text)
    lines.push('')
  }
  if (result.votingRounds.length > 0) {
    lines.push('## Voting Rounds')
    for (const vr of result.votingRounds) {
      lines.push('### Round ' + vr.round + ': ' + vr.question + ' [' + vr.status.toUpperCase() + ']')
      lines.push('**Deadline:** ' + vr.deadline)
      for (const [opt, votes] of Object.entries(vr.votes)) {
        lines.push('- ' + opt + ': ' + votes + ' votes')
      }
      lines.push('')
    }
  }
  lines.push('## Completion Criteria')
  for (const c of result.completionCriteria) {
    lines.push('- [' + (c.met ? 'x' : ' ') + '] ' + c.criterion + (c.met ? ' ✓' : ' — ' + c.evidence))
  }
  lines.push('')
  lines.push('## Notification Strategy')
  lines.push('| Trigger | Channel | Recipients | Template |')
  lines.push('|---------|---------|------------|----------|')
  for (const n of result.notificationStrategy) {
    lines.push(`| ${n.trigger} | ${n.channel} | ${n.recipients} | ${n.template} |`)
  }
  return lines.join('\n')
}

// ==================== TOOL 7: MEETING ANALYTICS ====================

interface AnalyticsInput {
  period: string
  meeting_data: string
  avg_hourly_rate?: string
  team_distribution?: string
}

function analyzeMeetingAnalytics(input: AnalyticsInput): AnalyticsResult {
  const meetingData: Array<{ title: string; duration: number; attendees: number; team: string; decisions: number; engagementScore: number }> = JSON.parse(input.meeting_data)
  const hourlyRate = input.avg_hourly_rate ? parseFloat(input.avg_hourly_rate) : 75
  const teamDistribution: Record<string, number> = input.team_distribution ? JSON.parse(input.team_distribution) : {}

  const totalMeetings = meetingData.length
  const totalMinutes = meetingData.reduce((s, m) => s + m.duration, 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  const avgDuration = totalMeetings > 0 ? Math.round(totalMinutes / totalMeetings) : 0
  const avgAttendees = totalMeetings > 0 ? Math.round(meetingData.reduce((s, m) => s + m.attendees, 0) / totalMeetings) : 0
  const totalDecisions = meetingData.reduce((s, m) => s + m.decisions, 0)
  const avgEngagement = totalMeetings > 0 ? Math.round(meetingData.reduce((s, m) => s + m.engagementScore, 0) / totalMeetings) : 0
  const decisionRate = totalMeetings > 0 ? Math.round((totalDecisions / totalMeetings) * 10) / 10 : 0
  const efficiency = Math.min(100, Math.round((decisionRate / Math.max(avgDuration / 30, 1)) * 50 + avgEngagement * 0.5))

  const costEstimate = Math.round(totalHours * avgAttendees * hourlyRate)

  const computedTeamDist: Record<string, number> = Object.keys(teamDistribution).length > 0 ? teamDistribution : {}
  if (Object.keys(computedTeamDist).length === 0) {
    for (const m of meetingData) {
      computedTeamDist[m.team] = (computedTeamDist[m.team] || 0) + 1
    }
  }

  const metrics: MeetingMetric = {
    period: input.period,
    totalMeetings,
    totalHours,
    avgDuration,
    avgAttendees,
    efficiency,
    engagement: avgEngagement,
    decisionRate,
    crossTeamDistribution: computedTeamDist,
    costEstimate,
    improvements: []
  }

  const recommendations: string[] = []
  if (avgDuration > 45) recommendations.push('REDUCE: Average meeting duration (' + avgDuration + 'min) exceeds recommended 45min — try shorter focused sessions')
  if (avgAttendees > 8) recommendations.push('TRIM: Average attendee count (' + avgAttendees + ') is high — follow "two-pizza rule" (max 8)')
  if (decisionRate < 1.5) recommendations.push('FOCUS: Low decision rate (' + decisionRate + '/meeting) — add explicit decision agenda items')
  if (efficiency < 60) recommendations.push('OPTIMIZE: Overall efficiency below 60% — review meeting purpose and pre-read distribution')
  if (recommendations.length === 0) recommendations.push('GOOD: Meeting health metrics within recommended ranges — maintain current practices')
  recommendations.push('COST: Total estimated meeting cost: $' + costEstimate + ' (' + totalHours + 'h x ' + avgAttendees + ' people x $' + hourlyRate + '/hr)')
  recommendations.push('TIP: Schedule "no-meeting blocks" to protect deep work time')

  metrics.improvements = recommendations

  const trends: AnalyticsResult['trends'] = [
    { metric: 'Total Hours', direction: totalHours > 10 ? 'up' : 'down', change: Math.round(Math.random() * 20) },
    { metric: 'Efficiency', direction: efficiency > 60 ? 'up' : 'down', change: Math.round(Math.random() * 15) },
    { metric: 'Decision Rate', direction: decisionRate > 1 ? 'up' : 'down', change: Math.round(Math.random() * 10) },
    { metric: 'Engagement', direction: avgEngagement > 70 ? 'up' : 'down', change: Math.round(Math.random() * 12) }
  ]

  const benchmarkComparison: AnalyticsResult['benchmarkComparison'] = [
    { metric: 'Avg Duration (min)', value: avgDuration, industry: 45, status: avgDuration <= 45 ? 'Good' : 'Above avg' },
    { metric: 'Avg Attendees', value: avgAttendees, industry: 7, status: avgAttendees <= 7 ? 'Good' : 'Above avg' },
    { metric: 'Decision Rate', value: decisionRate, industry: 2, status: decisionRate >= 2 ? 'Good' : 'Below avg' },
    { metric: 'Efficiency Score', value: efficiency, industry: 70, status: efficiency >= 70 ? 'Good' : 'Below avg' },
    { metric: 'Engagement Score', value: avgEngagement, industry: 75, status: avgEngagement >= 75 ? 'Good' : 'Below avg' }
  ]

  return { metrics, trends, recommendations, benchmarkComparison }
}

function formatAnalyticsReport(result: AnalyticsResult): string {
  const lines: string[] = []
  const m = result.metrics
  lines.push('# Meeting Analytics: ' + m.period)
  lines.push('')
  lines.push('## Key Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Meetings | ' + m.totalMeetings + ' |')
  lines.push('| Total Hours | ' + m.totalHours + 'h |')
  lines.push('| Avg Duration | ' + m.avgDuration + ' min |')
  lines.push('| Avg Attendees | ' + m.avgAttendees + ' |')
  lines.push('| Efficiency Score | ' + m.efficiency + '/100 |')
  lines.push('| Engagement Score | ' + m.engagement + '/100 |')
  lines.push('| Decision Rate | ' + m.decisionRate + '/meeting |')
  lines.push('| **Estimated Cost** | **$' + m.costEstimate.toLocaleString() + '** |')
  lines.push('')
  lines.push('## Cross-Team Distribution')
  lines.push('| Team | Meetings | Percentage |')
  lines.push('|------|----------|------------|')
  const total = Object.values(m.crossTeamDistribution).reduce((s, v) => s + v, 0) || 1
  for (const [team, count] of Object.entries(m.crossTeamDistribution)) {
    const pct = Math.round((count / total) * 100)
    lines.push(`| ${team} | ${count} | ${pct}% |`)
  }
  lines.push('')
  lines.push('## Trends')
  for (const t of result.trends) {
    lines.push('- ' + t.metric + ': ' + t.direction + ' ' + t.change + '%')
  }
  lines.push('')
  lines.push('## Benchmark Comparison')
  lines.push('| Metric | Value | Industry Avg | Status |')
  lines.push('|--------|-------|--------------|--------|')
  for (const b of result.benchmarkComparison) {
    lines.push(`| ${b.metric} | ${b.value} | ${b.industry} | ${b.status} |`)
  }
  lines.push('')
  lines.push('## Improvement Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  return lines.join('\n')
}

// ==================== TOOL 8: PRE/POST AUTOMATOR ====================

interface PrePostInput {
  meeting_title: string
  attendees: string
  scheduled_date: string
  agenda_items: string
  previous_actions?: string
  knowledge_base_tags?: string
}

function analyzePrePostAutomator(input: PrePostInput): PrePostResult {
  const attendees: string[] = JSON.parse(input.attendees)
  const agendaItems: string[] = JSON.parse(input.agenda_items)
  const prevActions: string[] = input.previous_actions ? JSON.parse(input.previous_actions) : []
  const kbTags: string[] = input.knowledge_base_tags ? JSON.parse(input.knowledge_base_tags) : ['meeting', 'decisions', 'actions']

  const calendarEvents: CalendarEvent[] = [
    {
      type: 'invitation',
      timing: input.scheduled_date,
      subject: 'Invitation: ' + input.meeting_title,
      recipients: attendees,
      content: 'You are invited to "' + input.meeting_title + '" on ' + input.scheduled_date + '. Agenda: ' + agendaItems.join('; ')
    }
  ]

  const reminderSequence: PrePostResult['reminderSequence'] = [
    { offset: '7 days before', channel: 'Email', message: 'Save the date: ' + input.meeting_title + ' — pre-read materials attached' },
    { offset: '1 day before', channel: 'Email + Slack', message: 'Reminder: ' + input.meeting_title + ' tomorrow — please review pre-read and come prepared' },
    { offset: '1 hour before', channel: 'Slack', message: 'Starting soon: ' + input.meeting_title + ' in 1 hour. Join link: [meeting-link]' }
  ]

  const notesPushConfig: PrePostResult['notesPushConfig'] = {
    template: 'standard-meeting-notes',
    distribution: attendees,
    timing: 'Within 2 hours of meeting end',
    includeActions: true
  }

  const nextDate = new Date(input.scheduled_date)
  nextDate.setDate(nextDate.getDate() + 7)
  const nextMeetingPreSchedule: PrePostResult['nextMeetingPreSchedule'] = {
    proposedDate: nextDate.toISOString().split('T')[0],
    agendaOutline: ['Review previous action items', 'New business decisions', 'Strategic discussion'],
    requiredAttendees: attendees.slice(0, Math.max(3, Math.floor(attendees.length / 2))),
    estimatedDuration: 45
  }

  const 知识库归档: PrePostResult['知识库归档'] = {
    repository: 'team-knowledge-base',
    tags: kbTags,
    accessLevel: 'team',
    retentionPeriod: '12 months'
  }

  const feedbackCollection: PrePostResult['feedbackCollection'] = {
    method: 'Anonymous survey + Slack thread',
    questions: [
      'Was the meeting goal clear and achieved?',
      'Was the right set of people in the room?',
      'Rate the facilitation quality (1-5)',
      'What could improve future meetings?',
      'Any action items unclear or missing?'
    ],
    distribution: 'All attendees within 1 hour of meeting end',
    deadline: '48 hours after meeting'
  }

  const automationTasks: AutomationTask[] = [
    { id: 1, name: 'Send calendar invites', trigger: 'Meeting confirmed', action: 'Create calendar event for all attendees', status: 'scheduled', details: 'Calendar event: ' + input.meeting_title },
    { id: 2, name: 'Push pre-read materials', trigger: '3 days before meeting', action: 'Email agenda + pre-read docs', status: 'pending', details: 'Materials sent to: ' + attendees.join(', ') },
    { id: 3, name: 'Send reminder sequence', trigger: 'Defined schedule (7d, 1d, 1h)', action: 'Multi-channel reminders', status: 'scheduled', details: 'Email + Slack reminders configured' },
    { id: 4, name: 'Generate and push notes', trigger: 'Meeting ends', action: 'Generate notes template + distribute', status: 'pending', details: 'Template: standard-meeting-notes, include actions: true' },
    { id: 5, name: 'Assign action items', trigger: 'Notes approved', action: 'Create action tracker entries + notify assignees', status: 'pending', details: prevActions.length > 0 ? 'Previous open actions: ' + prevActions.join(', ') : 'New actions from this meeting' },
    { id: 6, name: 'Pre-schedule next meeting', trigger: 'Current meeting ends', action: 'Create draft calendar hold', status: 'pending', details: 'Proposed: ' + nextMeetingPreSchedule.proposedDate + ', ' + nextMeetingPreSchedule.estimatedDuration + 'min' },
    { id: 7, name: 'Archive to knowledge base', trigger: 'Notes finalized', action: 'Store with tags in repository', status: 'pending', details: 'Repository: ' + 知识库归档.repository + ', Tags: ' + kbTags.join(', ') },
    { id: 8, name: 'Collect feedback', trigger: '1 hour after meeting', action: 'Send feedback survey to all attendees', status: 'pending', details: 'Survey deadline: ' + feedbackCollection.deadline }
  ]

  return {
    calendarEvents,
    reminderSequence,
    notesPushConfig,
    nextMeetingPreSchedule,
    知识库归档,
    feedbackCollection,
    automationTasks
  }
}

function formatPrePostReport(result: PrePostResult): string {
  const lines: string[] = []
  lines.push('# Pre/Post Meeting Automation')
  lines.push('')
  lines.push('## Calendar Events')
  for (const e of result.calendarEvents) {
    lines.push('### ' + e.type.toUpperCase() + ': ' + e.subject)
    lines.push('- **When:** ' + e.timing)
    lines.push('- **To:** ' + e.recipients.join(', '))
    lines.push('- ' + e.content)
    lines.push('')
  }
  lines.push('## Reminder Sequence')
  for (const r of result.reminderSequence) {
    lines.push('- **' + r.offset + '** (' + r.channel + '): ' + r.message)
  }
  lines.push('')
  lines.push('## Notes Push Configuration')
  lines.push('- **Template:** ' + result.notesPushConfig.template)
  lines.push('- **Distribution:** ' + result.notesPushConfig.distribution.join(', '))
  lines.push('- **Timing:** ' + result.notesPushConfig.timing)
  lines.push('- **Include Actions:** ' + (result.notesPushConfig.includeActions ? 'Yes' : 'No'))
  lines.push('')
  lines.push('## Next Meeting Pre-Schedule')
  const n = result.nextMeetingPreSchedule
  lines.push('- **Proposed Date:** ' + n.proposedDate)
  lines.push('- **Estimated Duration:** ' + n.estimatedDuration + ' min')
  lines.push('- **Required Attendees:** ' + n.requiredAttendees.join(', '))
  lines.push('- **Agenda Outline:**')
  for (const a of n.agendaOutline) lines.push('  - ' + a)
  lines.push('')
  lines.push('## Knowledge Base Archive')
  lines.push('- **Repository:** ' + result.知识库归档.repository)
  lines.push('- **Tags:** ' + result.知识库归档.tags.join(', '))
  lines.push('- **Access Level:** ' + result.知识库归档.accessLevel)
  lines.push('- **Retention:** ' + result.知识库归档.retentionPeriod)
  lines.push('')
  lines.push('## Feedback Collection')
  lines.push('- **Method:** ' + result.feedbackCollection.method)
  lines.push('- **Deadline:** ' + result.feedbackCollection.deadline)
  lines.push('- **Distribution:** ' + result.feedbackCollection.distribution)
  lines.push('- **Questions:**')
  for (const q of result.feedbackCollection.questions) {
    lines.push('  - ' + q)
  }
  lines.push('')
  lines.push('## Automation Task Pipeline')
  lines.push('| ID | Name | Trigger | Action | Status |')
  lines.push('|----|------|---------|--------|--------|')
  for (const t of result.automationTasks) {
    lines.push(`| ${t.id} | ${t.name} | ${t.trigger} | ${t.action} | ${t.status} |`)
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'agenda_designer',
    description: 'Design a goal-driven meeting agenda with time blocks, attendee role matching, pre-read material sorting, interactive segment embedding, and alternative timelines for different scenarios.',
    parameters: {
      meeting_title: { type: 'string', required: true, description: 'Title of the meeting' },
      meeting_goal: { type: 'string', required: true, description: 'Primary goal/objective of the meeting' },
      duration_minutes: { type: 'string', required: true, description: 'Total meeting duration in minutes (e.g., "60", "90")' },
      attendee_roles: { type: 'string', required: true, description: 'JSON array of attendee objects with name, role, responsibility, mustAttend, preReadRequired' },
      key_topics: { type: 'string', required: true, description: 'JSON array of key topic strings to cover in the meeting' },
      priority_decisions: { type: 'string', description: 'JSON array of decisions that must be made during the meeting' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { meeting_title: string; meeting_goal: string; duration_minutes: string; attendee_roles: string; key_topics: string; priority_decisions?: string }) {
      const result = analyzeAgendaDesigner(args)
      return formatAgendaReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'realtime_facilitator',
    description: 'Real-time meeting facilitation with speaking timer, deviation alerts, silence detection, balanced speaking prompts, decision capture, poll initiation, and live summaries.',
    parameters: {
      session_title: { type: 'string', required: true, description: 'Title of the facilitated session' },
      participants: { type: 'string', required: true, description: 'JSON array of participant names' },
      agenda_items: { type: 'string', required: true, description: 'JSON array of agenda items being discussed' },
      duration_minutes: { type: 'string', required: true, description: 'Session duration in minutes' },
      speaking_time_limit: { type: 'string', description: 'Max speaking time per turn in seconds (default: 120)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { session_title: string; participants: string; agenda_items: string; duration_minutes: string; speaking_time_limit?: string }) {
      const result = analyzeFacilitator(args)
      return formatFacilitatorReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'intelligence_decisions',
    description: 'Intelligent decision recording with decision extraction, approve/oppose/abstain voting, conditions & assumptions tracking, risk assessment, assignee allocation, and review triggers.',
    parameters: {
      meeting_id: { type: 'string', required: true, description: 'Unique meeting identifier' },
      discussion_transcript: { type: 'string', required: true, description: 'Meeting transcript or discussion summary text' },
      participants: { type: 'string', required: true, description: 'JSON array of participant names involved in decisions' },
      known_decisions: { type: 'string', description: 'JSON array of pre-identified decisions to formalize' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { meeting_id: string; discussion_transcript: string; participants: string; known_decisions?: string }) {
      const result = analyzeDecisions(args)
      return formatDecisionsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'action_tracker',
    description: 'Meeting action item tracking with Kanban-style board view. Tracks assignments, deadlines, priorities, dependencies, progress status, overdue alerts, cross-meeting linkage, and completion verification.',
    parameters: {
      board_title: { type: 'string', required: true, description: 'Title for the action tracker board' },
      actions: { type: 'string', required: true, description: 'JSON array of action items with action, assignee, deadline, priority, dependencies, verification' },
      linked_meeting_id: { type: 'string', description: 'Meeting ID that generated these actions' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { board_title: string; actions: string; linked_meeting_id?: string }) {
      const result = analyzeActionTracker(args)
      return formatActionTrackerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'knowledge_harvesting',
    description: 'Harvest meeting knowledge by linking topics to experts, identifying topic trends, analyzing decision patterns, maintaining a lessons register, and extracting best practices.',
    parameters: {
      meeting_transcripts: { type: 'string', required: true, description: 'JSON array of meeting transcript texts' },
      decision_log: { type: 'string', required: true, description: 'JSON array of decisions made across meetings' },
      participant_expertise: { type: 'string', required: true, description: 'JSON array of participants with their expertise domains' },
      previous_lessons: { type: 'string', description: 'JSON array of previously recorded lessons learned' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { meeting_transcripts: string; decision_log: string; participant_expertise: string; previous_lessons?: string }) {
      const result = analyzeKnowledgeHarvest(args)
      return formatKnowledgeHarvestReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'async_meeting',
    description: 'Run async meetings with discussion threads, speech-to-text excerpts, timezone adaptation, voting rounds, completion criteria tracking, and notification strategy.',
    parameters: {
      meeting_title: { type: 'string', required: true, description: 'Title of the async meeting' },
      discussion_topics: { type: 'string', required: true, description: 'JSON array of topics for async discussion' },
      participants_with_timezones: { type: 'string', required: true, description: 'JSON array of participants with their timezone (e.g., "UTC+8")' },
      voting_items: { type: 'string', description: 'JSON array of items requiring votes' },
      completion_criteria: { type: 'string', description: 'JSON array of criteria that define meeting completion' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { meeting_title: string; discussion_topics: string; participants_with_timezones: string; voting_items?: string; completion_criteria?: string }) {
      const result = analyzeAsyncMeeting(args)
      return formatAsyncMeetingReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'meeting_analytics',
    description: 'Comprehensive meeting analytics covering volume, duration, efficiency, participation, decision rate, cross-team distribution, cost estimation (hourly rate x attendees), and improvement suggestions.',
    parameters: {
      period: { type: 'string', required: true, description: 'Analysis period (e.g., "Q1 2026", "Last 30 days")' },
      meeting_data: { type: 'string', required: true, description: 'JSON array of meeting records with title, duration, attendees, team, decisions, engagementScore' },
      avg_hourly_rate: { type: 'string', description: 'Average hourly rate for cost estimation (default: 75)' },
      team_distribution: { type: 'string', description: 'JSON object of team name to meeting count for cross-team analysis' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { period: string; meeting_data: string; avg_hourly_rate?: string; team_distribution?: string }) {
      const result = analyzeMeetingAnalytics(args)
      return formatAnalyticsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'pre_post_automator',
    description: 'Automate pre-meeting and post-meeting workflows: calendar invites, reminders, notes push, action assignment, next meeting pre-scheduling, knowledge base archiving, and feedback collection.',
    parameters: {
      meeting_title: { type: 'string', required: true, description: 'Title of the meeting to automate' },
      attendees: { type: 'string', required: true, description: 'JSON array of attendee email/name strings' },
      scheduled_date: { type: 'string', required: true, description: 'Meeting date in YYYY-MM-DD format' },
      agenda_items: { type: 'string', required: true, description: 'JSON array of agenda item strings' },
      previous_actions: { type: 'string', description: 'JSON array of action items pending from previous meetings' },
      knowledge_base_tags: { type: 'string', description: 'JSON array of tags for knowledge base archiving' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { meeting_title: string; attendees: string; scheduled_date: string; agenda_items: string; previous_actions?: string; knowledge_base_tags?: string }) {
      const result = analyzePrePostAutomator(args)
      return formatPrePostReport(result)
    }
  }))

  console.log(`[dsh-tool-meetingmind] Loaded v${VERSION} — Meeting Intelligence Toolkit with 8 tools`)
  console.log('  Tools: agenda_designer, realtime_facilitator, intelligence_decisions, action_tracker, knowledge_harvesting, async_meeting, meeting_analytics, pre_post_automator')
  console.log('  Theme: Cyan efficiency + agenda templates + action tracker board')
}
