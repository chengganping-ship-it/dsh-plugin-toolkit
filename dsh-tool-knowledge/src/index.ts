/**
 * DSH Tool Knowledge Plugin v0.1.0
 *
 * Persistent knowledge management for DeepSeek Harness Agent.
 * Markdown planning, project memory, decision logs, learning accumulation,
 * context restoration, knowledge linking, progress tracking, and insight extraction.
 *
 * Aligned with the planning-with-files paradigm pioneered by Manus — every
 * planning artifact, memory snapshot, decision record, and learning entry is
 * persisted as structured markdown, enabling session-independent continuity
 * and compounding knowledge intelligence.
 *
 * Features (v0.1.0):
 * - Plan Creator (structured Markdown plans with task trees, timelines, dependencies)
 * - Memory Journal (append-only session event logs with context snapshots)
 * - Decision Logger (Architecture Decision Records with rationale)
 * - Learning Accumulator (deduplicated, associative knowledge base)
 * - Context Restorer (session continuity from checkpoint reconstruction)
 * - Knowledge Linker (associative graph with relevance scoring)
 * - Progress Tracker (plan completion metrics and workload estimation)
 * - Insight Extractor (pattern recognition and action item derivation)
 *
 * @module dsh-tool-knowledge
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-knowledge'
export const inject = ['tools']

const VERSION = '0.1.0'

// ============================================================================
// SEEDED RANDOM UTILITY
// ============================================================================

class SeededRandom {
  private seed: number

  constructor(seed: number = 42) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647
    return (this.seed - 1) / 2147483646
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }
}

const seededRandom = new SeededRandom(20241213)

// ============================================================================
// SHARED UTILITY FUNCTIONS
// ============================================================================

function padNum(n: number): string {
  return n < 10 ? '0' + n.toString() : n.toString()
}

function todayISO(): string {
  const d = new Date()
  return d.getFullYear().toString() + '-' + padNum(d.getMonth() + 1) + '-' + padNum(d.getDate())
}

function nowISO(): string {
  const d = new Date()
  return d.getFullYear().toString() + '-' + padNum(d.getMonth() + 1) + '-' + padNum(d.getDate())
    + 'T' + padNum(d.getHours()) + ':' + padNum(d.getMinutes()) + ':' + padNum(d.getSeconds())
}

function generateId(prefix: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 8)
  return prefix + '_' + ts + '_' + rand
}

function renderProgressBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  return '[' + '|'.repeat(filled) + '-'.repeat(empty) + '] ' + pct.toFixed(0) + '%'
}

function renderPriorityBadge(priority: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'critical': return '[!!!] CRITICAL'
    case 'high': return '[!!] HIGH'
    case 'medium': return '[!] MEDIUM'
    case 'low': return '[-] LOW'
  }
}

function renderStatusBadge(status: 'done' | 'in_progress' | 'blocked' | 'pending' | 'deferred'): string {
  switch (status) {
    case 'done': return '[x] Done'
    case 'in_progress': return '[~] In Progress'
    case 'blocked': return '[!] Blocked'
    case 'pending': return '[ ] Pending'
    case 'deferred': return '[>] Deferred'
  }
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen - 3) + '...'
}

// ============================================================================
// TOOL 1: PLAN CREATOR
// ============================================================================

interface PlanMilestone {
  title: string
  description: string
  tasks: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  dependencies: string[]
  estimatedDays: number
  deliverable: string
}

interface PlanConstraint {
  type: 'time' | 'resource' | 'technical' | 'regulatory' | 'budget'
  description: string
  severity: 'hard' | 'soft'
}

interface PlanResult {
  planId: string
  title: string
  goal: string
  milestones: PlanMilestone[]
  constraints: PlanConstraint[]
  timeline: {
    startDate: string
    endDate: string
    totalDays: number
    phases: Array<{
      name: string
      startDay: number
      endDay: number
      milestones: string[]
    }>
  }
  taskTree: Array<{
    milestone: string
    level: number
    items: Array<{ task: string; priority: string; status: string }>
  }>
  metadata: {
    createdAt: string
    version: string
    tags: string[]
  }
}

interface PlanCreatorInput {
  project_goal: string
  milestones: Array<{
    title: string
    description?: string
    tasks?: string[]
    priority?: 'critical' | 'high' | 'medium' | 'low'
    dependencies?: string[]
    estimated_days?: number
    deliverable?: string
  }>
  constraints?: Array<{
    type?: string
    description: string
    severity?: 'hard' | 'soft'
  }>
}

function createPlan(input: PlanCreatorInput): PlanResult {
  const planId = generateId('plan')
  const startDate = todayISO()

  const milestones: PlanMilestone[] = input.milestones.map((m, idx) => ({
    title: m.title,
    description: m.description || 'Milestone ' + (idx + 1) + ' of project plan',
    tasks: m.tasks && m.tasks.length > 0 ? m.tasks : ['Execute ' + m.title],
    priority: m.priority || (idx === 0 ? 'high' : 'medium') as PlanMilestone['priority'],
    dependencies: m.dependencies || [],
    estimatedDays: m.estimated_days || seededRandom.nextInt(3, 14),
    deliverable: m.deliverable || m.title + ' completed'
  }))

  const constraints: PlanConstraint[] = (input.constraints || []).map(c => ({
    type: (c.type as PlanConstraint['type']) || 'resource',
    description: c.description,
    severity: c.severity || 'soft'
  }))

  let currentDay = 0
  const phases: PlanResult['timeline']['phases'] = []
  for (const m of milestones) {
    const startDay = currentDay
    const endDay = currentDay + m.estimatedDays
    phases.push({
      name: m.title,
      startDay,
      endDay,
      milestones: [m.title]
    })
    currentDay = endDay + 1
  }

  const totalDays = currentDay
  const endDateD = new Date(startDate)
  endDateD.setDate(endDateD.getDate() + totalDays)
  const endDateStr = endDateD.getFullYear() + '-' + padNum(endDateD.getMonth() + 1) + '-' + padNum(endDateD.getDate())

  const taskTree = milestones.map(m => ({
    milestone: m.title,
    level: 0,
    items: m.tasks.map((t, i) => ({
      task: t,
      priority: i === 0 ? m.priority : 'medium',
      status: 'pending'
    }))
  }))

  const tags: string[] = []
  const goalLower = input.project_goal.toLowerCase()
  if (goalLower.includes('web') || goalLower.includes('app') || goalLower.includes('build')) tags.push('development')
  if (goalLower.includes('market') || goalLower.includes('launch') || goalLower.includes('grow')) tags.push('marketing')
  if (goalLower.includes('research') || goalLower.includes('analysis') || goalLower.includes('study')) tags.push('research')
  if (goalLower.includes('migrate') || goalLower.includes('refactor') || goalLower.includes('rewrite')) tags.push('refactoring')
  if (tags.length === 0) tags.push('general')

  return {
    planId,
    title: input.project_goal.substring(0, 60),
    goal: input.project_goal,
    milestones,
    constraints,
    timeline: {
      startDate,
      endDate: endDateStr,
      totalDays,
      phases
    },
    taskTree,
    metadata: {
      createdAt: nowISO(),
      version: '1.0',
      tags
    }
  }
}

function formatPlanCreatorReport(plan: PlanResult): string {
  const lines: string[] = []
  lines.push('# Plan: ' + plan.title)
  lines.push('')
  lines.push('> **Plan ID:** `' + plan.planId + '`  ')
  lines.push('> **Created:** ' + plan.metadata.createdAt + '  ')
  lines.push('> **Timeline:** ' + plan.timeline.startDate + ' → ' + plan.timeline.endDate + ' (' + plan.timeline.totalDays + ' days)')
  lines.push('')
  lines.push('## Goal')
  lines.push('')
  lines.push(plan.goal)
  lines.push('')

  if (plan.constraints.length > 0) {
    lines.push('## Constraints')
    lines.push('')
    for (const c of plan.constraints) {
      const sev = c.severity === 'hard' ? 'HARD' : 'SOFT'
      lines.push('- [' + sev + '] ' + c.description + ' (' + c.type + ')')
    }
    lines.push('')
  }

  lines.push('## Task Tree')
  lines.push('')
  for (const branch of plan.taskTree) {
    lines.push('### ' + branch.milestone)
    lines.push('')
    for (const item of branch.items) {
      lines.push('- ' + renderStatusBadge(item.status as 'pending') + ' ' + item.task + ' ' + renderPriorityBadge(item.priority as 'medium'))
    }
    lines.push('')
  }

  lines.push('## Timeline & Phases')
  lines.push('')
  lines.push('| Phase | Days | Milestone | Progress |')
  lines.push('|-------|------|-----------|----------|')
  for (const phase of plan.timeline.phases) {
    const duration = phase.endDay - phase.startDay + 1
    lines.push('| ' + phase.name + ' | D' + phase.startDay + '-D' + phase.endDay + ' (' + duration + 'd) | ' + phase.milestones.join(', ') + ' | ' + renderProgressBar(0) + ' |')
  }
  lines.push('')

  lines.push('## Dependencies')
  lines.push('')
  let hasDeps = false
  for (const m of plan.milestones) {
    if (m.dependencies.length > 0) {
      hasDeps = true
      lines.push('- **' + m.title + '** depends on: ' + m.dependencies.join(', '))
    }
  }
  if (!hasDeps) {
    lines.push('_No cross-milestone dependencies defined._')
  }
  lines.push('')

  lines.push('## Metadata')
  lines.push('')
  lines.push('- Tags: ' + plan.metadata.tags.map(t => '`' + t + '`').join(', '))
  lines.push('- Version: ' + plan.metadata.version)
  lines.push('- Plan ID: `' + plan.planId + '`')
  lines.push('')
  lines.push('---')
  lines.push('_Generated by dsh-tool-knowledge v' + VERSION + ' — Plan Creator_')

  return lines.join('\n')
}

// ============================================================================
// TOOL 2: MEMORY JOURNAL
// ============================================================================

interface SessionEvent {
  timestamp?: string
  type: 'decision' | 'discovery' | 'lesson' | 'context' | 'error' | 'milestone' | 'interaction'
  summary: string
  details?: string
  importance: 'critical' | 'high' | 'medium' | 'low'
  tags?: string[]
}

interface JournalEntry {
  entryId: string
  timestamp: string
  sessionId: string
  project: string
  events: SessionEvent[]
  checkpoints: Array<{
    checkpointId: string
    state: string
    contextSnapshot: string
  }>
  lessonsLearned: string[]
  keywords: string[]
}

interface MemoryJournalInput {
  session_events: Array<{
    timestamp?: string
    type: string
    summary: string
    details?: string
    importance?: 'critical' | 'high' | 'medium' | 'low'
    tags?: string[]
  }>
  project_id: string
}

function createMemoryJournal(input: MemoryJournalInput): JournalEntry {
  const sessionId = generateId('sess')
  const entryId = generateId('jrnl')

  const events: SessionEvent[] = input.session_events.map(e => ({
    timestamp: e.timestamp || nowISO(),
    type: e.type as SessionEvent['type'],
    summary: e.summary,
    details: e.details || '',
    importance: (e.importance || 'medium') as SessionEvent['importance'],
    tags: e.tags || []
  }))

  const checkpoints: JournalEntry['checkpoints'] = []
  const milestones = events.filter(e => e.type === 'milestone' || e.importance === 'critical')
  for (const m of milestones) {
    checkpoints.push({
      checkpointId: generateId('ckpt'),
      state: m.summary,
      contextSnapshot: m.details || 'Snapshot at: ' + m.timestamp
    })
  }

  const lessonsLearned: string[] = []
  const discoveryEvents = events.filter(e => e.type === 'discovery' || e.type === 'lesson')
  for (const d of discoveryEvents) {
    lessonsLearned.push(d.summary)
  }
  if (lessonsLearned.length === 0) {
    const highImp = events.filter(e => e.importance === 'high' || e.importance === 'critical')
    for (const h of highImp.slice(0, 3)) {
      lessonsLearned.push('Observed: ' + h.summary)
    }
  }

  const keywords: string[] = []
  for (const e of events) {
    if (e.tags) keywords.push(...e.tags)
    const words = e.summary.split(/\s+/).filter(w => w.length > 4)
    keywords.push(...words.slice(0, 2))
  }
  const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 20)

  return {
    entryId,
    timestamp: nowISO(),
    sessionId,
    project: input.project_id,
    events,
    checkpoints,
    lessonsLearned,
    keywords: uniqueKeywords
  }
}

function formatMemoryJournalReport(journal: JournalEntry): string {
  const lines: string[] = []
  lines.push('# Memory Journal: ' + journal.project)
  lines.push('')
  lines.push('> **Journal ID:** `' + journal.entryId + '`  ')
  lines.push('> **Session ID:** `' + journal.sessionId + '`  ')
  lines.push('> **Timestamp:** ' + journal.timestamp + '  ')
  lines.push('> **Events:** ' + journal.events.length.toString())
  lines.push('')

  lines.push('## Event Log')
  lines.push('')
  for (const event of journal.events) {
    const icon = getEventIcon(event.type)
    lines.push('### ' + icon + ' ' + event.summary)
    lines.push('')
    lines.push('- **Type:** ' + event.type)
    lines.push('- **Importance:** ' + renderPriorityBadge(event.importance))
    lines.push('- **Timestamp:** ' + event.timestamp)
    if (event.details) {
      lines.push('- **Details:** ' + truncateText(event.details, 200))
    }
    if (event.tags && event.tags.length > 0) {
      lines.push('- **Tags:** ' + event.tags.map(t => '`' + t + '`').join(', '))
    }
    lines.push('')
  }

  if (journal.checkpoints.length > 0) {
    lines.push('## Checkpoints')
    lines.push('')
    for (const cp of journal.checkpoints) {
      lines.push('- **' + cp.checkpointId + '**: ' + cp.state)
      lines.push('  - Snapshot: ' + truncateText(cp.contextSnapshot, 150))
    }
    lines.push('')
  }

  if (journal.lessonsLearned.length > 0) {
    lines.push('## Lessons Learned')
    lines.push('')
    for (let i = 0; i < journal.lessonsLearned.length; i++) {
      lines.push((i + 1) + '. ' + journal.lessonsLearned[i])
    }
    lines.push('')
  }

  if (journal.keywords.length > 0) {
    lines.push('## Keywords')
    lines.push('')
    lines.push(journal.keywords.map(k => '`' + k + '`').join('  '))
    lines.push('')
  }

  lines.push('---')
  lines.push('_Append-only memory journal — dsh-tool-knowledge v' + VERSION + '_')

  return lines.join('\n')
}

function getEventIcon(type: SessionEvent['type']): string {
  switch (type) {
    case 'decision': return 'DECISION'
    case 'discovery': return 'DISCOVERY'
    case 'lesson': return 'LESSON'
    case 'context': return 'CONTEXT'
    case 'error': return 'ERROR'
    case 'milestone': return 'MILESTONE'
    case 'interaction': return 'INTERACTION'
    default: return 'EVENT'
  }
}

// ============================================================================
// TOOL 3: DECISION LOGGER
// ============================================================================

interface DecisionOption {
  name: string
  pros: string[]
  cons: string[]
  tradeoffs: string
  feasibility: 'high' | 'medium' | 'low'
}

interface DecisionLogEntry {
  decisionId: string
  timestamp: string
  context: string
  optionsConsidered: DecisionOption[]
  chosenOption: string
  rationale: string
  consequences: {
    positive: string[]
    negative: string[]
    uncertain: string[]
  }
  status: 'accepted' | 'superseded' | 'reverted'
  tags: string[]
  adr: {
    title: string
    status: 'proposed' | 'accepted' | 'deprecated'
    contextBlock: string
    decisionBlock: string
    consequencesBlock: string
  }
}

interface DecisionLoggerInput {
  decision_context: string
  options_considered: Array<{
    name: string
    pros?: string[]
    cons?: string[]
    tradeoffs?: string
    feasibility?: 'high' | 'medium' | 'low'
  }>
  chosen_option: string
  rationale: string
  tags?: string[]
}

function logDecision(input: DecisionLoggerInput): DecisionLogEntry {
  const decisionId = generateId('dec')
  const timestamp = nowISO()

  const options: DecisionOption[] = input.options_considered.map(o => ({
    name: o.name,
    pros: o.pros || ['No specific pros recorded'],
    cons: o.cons || ['No specific cons recorded'],
    tradeoffs: o.tradeoffs || 'Tradeoffs not documented',
    feasibility: o.feasibility || 'medium'
  }))

  const positive: string[] = []
  const negative: string[] = []
  const uncertain: string[] = []

  const chosen = options.find(o => o.name === input.chosen_option)
  if (chosen) {
    positive.push(...chosen.pros)
    negative.push(...chosen.cons)
    uncertain.push(chosen.tradeoffs)
  } else {
    uncertain.push('Chosen option not found in considered options list')
  }

  const nonChosen = options.filter(o => o.name !== input.chosen_option)
  for (const nc of nonChosen) {
    uncertain.push('Opportunity cost: ' + nc.name + ' (' + nc.tradeoffs + ')')
  }

  const adrTitle = input.decision_context.substring(0, 50)

  return {
    decisionId,
    timestamp,
    context: input.decision_context,
    optionsConsidered: options,
    chosenOption: input.chosen_option,
    rationale: input.rationale,
    consequences: { positive, negative, uncertain },
    status: 'accepted',
    tags: input.tags || [],
    adr: {
      title: adrTitle,
      status: 'accepted',
      contextBlock: input.decision_context,
      decisionBlock: 'Chose: ' + input.chosen_option,
      consequencesBlock:
        'Positive: ' + positive.slice(0, 3).join('; ') +
        ' | Negative: ' + negative.slice(0, 3).join('; ') +
        ' | Uncertain: ' + uncertain.slice(0, 2).join('; ')
    }
  }
}

function formatDecisionLoggerReport(entry: DecisionLogEntry): string {
  const lines: string[] = []
  lines.push('# ADR: ' + entry.adr.title)
  lines.push('')
  lines.push('> **Decision ID:** `' + entry.decisionId + '`  ')
  lines.push('> **Timestamp:** ' + entry.timestamp + '  ')
  lines.push('> **Status:** ' + entry.status.toUpperCase())
  lines.push('')

  lines.push('## Context')
  lines.push('')
  lines.push(entry.context)
  lines.push('')

  lines.push('## Options Considered')
  lines.push('')
  for (const opt of entry.optionsConsidered) {
    const chosen = opt.name === entry.chosenOption ? ' [CHOSEN]' : ''
    lines.push('### ' + opt.name + chosen)
    lines.push('')
    lines.push('**Feasibility:** ' + opt.feasibility.toUpperCase())
    lines.push('')
    lines.push('**Pros:**')
    lines.push('')
    for (const p of opt.pros) {
      lines.push('- [+] ' + p)
    }
    lines.push('')
    lines.push('**Cons:**')
    lines.push('')
    for (const c of opt.cons) {
      lines.push('- [-] ' + c)
    }
    lines.push('')
    lines.push('**Tradeoffs:** ' + opt.tradeoffs)
    lines.push('')
  }

  lines.push('## Decision')
  lines.push('')
  lines.push('**Chosen:** ' + entry.chosenOption)
  lines.push('')
  lines.push('## Rationale')
  lines.push('')
  lines.push(entry.rationale)
  lines.push('')

  lines.push('## Consequences')
  lines.push('')
  if (entry.consequences.positive.length > 0) {
    lines.push('### Positive')
    lines.push('')
    for (const p of entry.consequences.positive) {
      lines.push('- ' + p)
    }
    lines.push('')
  }
  if (entry.consequences.negative.length > 0) {
    lines.push('### Negative')
    lines.push('')
    for (const n of entry.consequences.negative) {
      lines.push('- ' + n)
    }
    lines.push('')
  }
  if (entry.consequences.uncertain.length > 0) {
    lines.push('### Uncertain')
    lines.push('')
    for (const u of entry.consequences.uncertain) {
      lines.push('- ' + u)
    }
    lines.push('')
  }

  if (entry.tags.length > 0) {
    lines.push('## Tags')
    lines.push('')
    lines.push(entry.tags.map(t => '`' + t + '`').join('  '))
    lines.push('')
  }

  lines.push('---')
  lines.push('_Architecture Decision Record — dsh-tool-knowledge v' + VERSION + '_')

  return lines.join('\n')
}

// ============================================================================
// TOOL 4: LEARNING ACCUMULATOR
// ============================================================================

interface LearningEntry {
  id: string
  topic: string
  content: string
  source: string
  confidence: string
  relationships: string[]
  timestamp: string
  merged: boolean
}

interface AccumulatedKnowledge {
  knowledgeId: string
  timestamp: string
  entries: LearningEntry[]
  deduplicationReport: {
    originalCount: number
    uniqueCount: number
    mergedCount: number
    duplicatesRemoved: number
  }
  topicClusters: Array<{
    topic: string
    entryCount: number
    keyInsights: string[]
  }>
  relationships: Array<{
    from: string
    to: string
    type: string
  }>
  summary: {
    totalEntries: number
    topicsCovered: string[]
    knowledgeDepth: 'shallow' | 'moderate' | 'deep'
  }
}

interface LearningAccumulatorInput {
  new_learnings: Array<{
    topic: string
    content: string
    source?: string
    confidence?: 'high' | 'medium' | 'low'
    relationships?: string[]
  }>
  existing_knowledge?: Array<{
    topic: string
    content: string
    source?: string
    confidence?: 'high' | 'medium' | 'low'
    relationships?: string[]
  }>
}

function accumulateknowledge(input: LearningAccumulatorInput): AccumulatedKnowledge {
  const knowledgeId = generateId('know')
  const timestamp = nowISO()

  const existing: LearningEntry[] = (input.existing_knowledge || []).map(e => ({
    id: generateId('learn'),
    topic: e.topic,
    content: e.content,
    source: e.source || 'prior',
    confidence: e.confidence || 'medium',
    relationships: e.relationships || [],
    timestamp: timestamp,
    merged: false
  }))

  const newOnes: LearningEntry[] = input.new_learnings.map(e => ({
    id: generateId('learn'),
    topic: e.topic,
    content: e.content,
    source: e.source || 'session',
    confidence: e.confidence || 'medium',
    relationships: e.relationships || [],
    timestamp: timestamp,
    merged: false
  }))

  const allEntries = [...existing, ...newOnes]
  const originalCount = allEntries.length
  const duplicates: Set<string> = new Set()

  for (let i = 0; i < allEntries.length; i++) {
    for (let j = i + 1; j < allEntries.length; j++) {
      if (isDuplicateLearning(allEntries[i], allEntries[j])) {
        duplicates.add(allEntries[i].id)
        allEntries[j].merged = true
      }
    }
  }

  const uniqueEntries = allEntries.filter(e => !duplicates.has(e.id))
  const uniqueCount = uniqueEntries.length
  const mergedCount = duplicates.size

  const topicMap = new Map<string, LearningEntry[]>()
  for (const entry of uniqueEntries) {
    const cluster = topicMap.get(entry.topic) || []
    cluster.push(entry)
    topicMap.set(entry.topic, cluster)
  }

  const topicClusters: AccumulatedKnowledge['topicClusters'] = []
  for (const [topic, entries] of topicMap) {
    const keyInsights = entries
      .sort((a, b) => {
        const confOrder = { high: 3, medium: 2, low: 1 }
        return (confOrder[b.confidence as keyof typeof confOrder] || 0) - (confOrder[a.confidence as keyof typeof confOrder] || 0)
      })
      .slice(0, 3)
      .map(e => e.content)
    topicClusters.push({ topic, entryCount: entries.length, keyInsights })
  }

  const relationships: AccumulatedKnowledge['relationships'] = []
  for (const entry of uniqueEntries) {
    for (const rel of entry.relationships) {
      relationships.push({ from: entry.topic, to: rel, type: 'related' })
    }
  }

  let knowledgeDepth: 'shallow' | 'moderate' | 'deep' = 'shallow'
  if (topicClusters.length >= 5 && uniqueEntries.length >= 10) knowledgeDepth = 'deep'
  else if (topicClusters.length >= 3 && uniqueEntries.length >= 5) knowledgeDepth = 'moderate'

  return {
    knowledgeId,
    timestamp,
    entries: uniqueEntries,
    deduplicationReport: {
      originalCount,
      uniqueCount,
      mergedCount,
      duplicatesRemoved: originalCount - uniqueCount
    },
    topicClusters,
    relationships,
    summary: {
      totalEntries: uniqueEntries.length,
      topicsCovered: Array.from(topicMap.keys()),
      knowledgeDepth
    }
  }
}

function isDuplicateLearning(a: LearningEntry, b: LearningEntry): boolean {
  if (a.topic === b.topic) return true
  const sim = similarityScore(a.content, b.content)
  return sim > 0.7
}

function similarityScore(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  let intersection = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++
  }
  const union = wordsA.size + wordsB.size - intersection
  return union === 0 ? 0 : intersection / union
}

function formatLearningAccumulatorReport(knowledge: AccumulatedKnowledge): string {
  const lines: string[] = []
  lines.push('# Knowledge Base: Accumulated Learning')
  lines.push('')
  lines.push('> **Knowledge ID:** `' + knowledge.knowledgeId + '`  ')
  lines.push('> **Timestamp:** ' + knowledge.timestamp + '  ')
  lines.push('> **Depth:** ' + knowledge.summary.knowledgeDepth.toUpperCase())
  lines.push('')

  lines.push('## Deduplication Report')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Original entries | ' + knowledge.deduplicationReport.originalCount + ' |')
  lines.push('| Unique entries | ' + knowledge.deduplicationReport.uniqueCount + ' |')
  lines.push('| Merged (duplicates) | ' + knowledge.deduplicationReport.mergedCount + ' |')
  lines.push('| Duplicates removed | ' + knowledge.deduplicationReport.duplicatesRemoved + ' |')
  lines.push('')

  lines.push('## Topic Clusters')
  lines.push('')
  for (const cluster of knowledge.topicClusters) {
    lines.push('### ' + cluster.topic + ' (' + cluster.entryCount + ' entries)')
    lines.push('')
    for (let i = 0; i < cluster.keyInsights.length; i++) {
      lines.push((i + 1) + '. ' + truncateText(cluster.keyInsights[i], 200))
    }
    lines.push('')
  }

  if (knowledge.relationships.length > 0) {
    lines.push('## Relationships')
    lines.push('')
    for (const rel of knowledge.relationships.slice(0, 15)) {
      lines.push('- ' + rel.from + ' → ' + rel.to + ' (' + rel.type + ')')
    }
    if (knowledge.relationships.length > 15) {
      lines.push('- ... and ' + (knowledge.relationships.length - 15) + ' more')
    }
    lines.push('')
  }

  lines.push('## Summary')
  lines.push('')
  lines.push('- Total entries: ' + knowledge.summary.totalEntries)
  lines.push('- Topics: ' + knowledge.summary.topicsCovered.join(', '))
  lines.push('- Depth: ' + knowledge.summary.knowledgeDepth)
  lines.push('')

  lines.push('---')
  lines.push('_Knowledge accumulation engine — dsh-tool-knowledge v' + VERSION + '_')

  return lines.join('\n')
}

// ============================================================================
// TOOL 5: CONTEXT RESTORER
// ============================================================================

interface ContextCheckpoint {
  checkpointId: string
  sessionId: string
  timestamp: string
  state: {
    activeProject: string
    currentMilestone: string
    completedSteps: string[]
    pendingSteps: string[]
    keyVariables: Record<string, string>
    lastDecision: string
    openQuestions: string[]
  }
  contextWindow: {
    recentEvents: string[]
    importantNotes: string[]
    referencedFiles: string[]
  }
}

interface RestoredContext {
  contextId: string
  timestamp: string
  checkpoint: ContextCheckpoint
  restoration: {
    completeness: string
    fidelityScore: string
    inferredContext: string[]
    gaps: string[]
  }
  promptTemplate: string
  quickReference: {
    mustRemember: string[]
    mustNotForget: string[]
    nextActions: string[]
  }
}

interface ContextRestorerInput {
  session_id: string
  checkpoint_id?: string
  checkpoint_data?: {
    active_project?: string
    current_milestone?: string
    completed_steps?: string[]
    pending_steps?: string[]
    key_variables?: Record<string, string>
    last_decision?: string
    open_questions?: string[]
    recent_events?: string[]
    important_notes?: string[]
    referenced_files?: string[]
  }
}

function restoreContext(input: ContextRestorerInput): RestoredContext {
  const contextId = generateId('ctx')
  const timestamp = nowISO()

  const data = input.checkpoint_data || {}
  const checkpoint: ContextCheckpoint = {
    checkpointId: input.checkpoint_id || generateId('ckpt'),
    sessionId: input.session_id,
    timestamp: timestamp,
    state: {
      activeProject: data.active_project || 'Unknown project',
      currentMilestone: data.current_milestone || 'Unknown milestone',
      completedSteps: data.completed_steps || [],
      pendingSteps: data.pending_steps || [],
      keyVariables: data.key_variables || {},
      lastDecision: data.last_decision || 'No decision recorded',
      openQuestions: data.open_questions || []
    },
    contextWindow: {
      recentEvents: data.recent_events || [],
      importantNotes: data.important_notes || [],
      referencedFiles: data.referenced_files || []
    }
  }

  let completeness = 'low'
  const stateObj = checkoutState(checkpoint) as Record<string, unknown>
  const filledFields = Object.values(stateObj).filter((v: unknown) => {
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'object' && v !== null) return Object.keys(v).length > 0
    return Boolean(v && v !== 'Unknown project' && v !== 'Unknown milestone')
  }).length
  const totalFields = 7
  const fillRatio = filledFields / totalFields
  if (fillRatio > 0.7) completeness = 'high'
  else if (fillRatio > 0.3) completeness = 'medium'

  const fidelityScore = (fillRatio * 10).toFixed(1)

  const inferredContext: string[] = []
  const gaps: string[] = []

  if (checkpoint.state.completedSteps.length === 0) gaps.push('No completed steps recorded')
  if (checkpoint.state.pendingSteps.length === 0) gaps.push('No pending steps recorded')
  if (Object.keys(checkpoint.state.keyVariables).length === 0) gaps.push('Key variables missing')

  if (checkpoint.state.lastDecision && checkpoint.state.lastDecision !== 'No decision recorded') {
    inferredContext.push('Continuing from last decision: ' + checkpoint.state.lastDecision)
  }
  if (checkpoint.state.activeProject !== 'Unknown project') {
    inferredContext.push('Active project context: ' + checkpoint.state.activeProject)
  }
  if (checkpoint.contextWindow.recentEvents.length > 0) {
    inferredContext.push('Recent events available (' + checkpoint.contextWindow.recentEvents.length + ')')
  }

  const promptTemplate = generateRestorationPrompt(checkpoint)

  const quickReference: RestoredContext['quickReference'] = {
    mustRemember: [
      'Project: ' + checkpoint.state.activeProject,
      'Current: ' + checkpoint.state.currentMilestone,
      checkpoint.state.lastDecision
    ].filter(s => s && s !== 'Unknown project' && s !== 'Unknown milestone' && s !== 'No decision recorded'),
    mustNotForget: checkpoint.state.openQuestions,
    nextActions: checkpoint.state.pendingSteps.slice(0, 5)
  }

  if (quickReference.mustRemember.length === 0) {
    quickReference.mustRemember.push('Session ID: ' + checkpoint.sessionId)
  }

  return {
    contextId,
    timestamp,
    checkpoint,
    restoration: {
      completeness,
      fidelityScore,
      inferredContext,
      gaps
    },
    promptTemplate,
    quickReference
  }
}

function checkoutState(checkpoint: ContextCheckpoint): Record<string, unknown> {
  return {
    project: checkpoint.state.activeProject,
    milestone: checkpoint.state.currentMilestone,
    completed: checkpoint.state.completedSteps,
    pending: checkpoint.state.pendingSteps,
    variables: checkpoint.state.keyVariables,
    decision: checkpoint.state.lastDecision,
    questions: checkpoint.state.openQuestions
  }
}

function generateRestorationPrompt(checkpoint: ContextCheckpoint): string {
  const parts: string[] = []
  parts.push('# Context Restoration Prompt')
  parts.push('')
  parts.push('Session `' + checkpoint.sessionId + '` — restoring from checkpoint `' + checkpoint.checkpointId + '`.')
  parts.push('')
  parts.push('## Project State')
  parts.push('- Project: ' + checkpoint.state.activeProject)
  parts.push('- Milestone: ' + checkpoint.state.currentMilestone)
  parts.push('- Last decision: ' + checkpoint.state.lastDecision)
  parts.push('')
  if (checkpoint.state.completedSteps.length > 0) {
    parts.push('## Completed Steps')
    for (const s of checkpoint.state.completedSteps) parts.push('- [x] ' + s)
    parts.push('')
  }
  if (checkpoint.state.pendingSteps.length > 0) {
    parts.push('## Pending Steps')
    for (const s of checkpoint.state.pendingSteps) parts.push('- [ ] ' + s)
    parts.push('')
  }
  if (checkpoint.state.openQuestions.length > 0) {
    parts.push('## Open Questions')
    for (const q of checkpoint.state.openQuestions) parts.push('- ? ' + q)
    parts.push('')
  }
  return parts.join('\n')
}

function formatContextRestorerReport(restored: RestoredContext): string {
  const lines: string[] = []
  lines.push('# Context Restoration Report')
  lines.push('')
  lines.push('> **Context ID:** `' + restored.contextId + '`  ')
  lines.push('> **Session:** `' + restored.checkpoint.sessionId + '`  ')
  lines.push('> **Checkpoint:** `' + restored.checkpoint.checkpointId + '`  ')
  lines.push('> **Restored At:** ' + restored.timestamp)
  lines.push('')

  lines.push('## Restoration Quality')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Completeness | ' + restored.restoration.completeness.toUpperCase() + ' |')
  lines.push('| Fidelity Score | ' + restored.restoration.fidelityScore + '/10 |')
  lines.push('| Inferred Context | ' + restored.restoration.inferredContext.length + ' items |')
  lines.push('| Gaps Identified | ' + restored.restoration.gaps.length + ' items |')
  lines.push('')

  if (restored.restoration.inferredContext.length > 0) {
    lines.push('## Inferred Context')
    lines.push('')
    for (const ic of restored.restoration.inferredContext) {
      lines.push('- ' + ic)
    }
    lines.push('')
  }

  if (restored.restoration.gaps.length > 0) {
    lines.push('## Identified Gaps')
    lines.push('')
    for (const g of restored.restoration.gaps) {
      lines.push('- [GAP] ' + g)
    }
    lines.push('')
  }

  lines.push('## Quick Reference')
  lines.push('')
  lines.push('### Must Remember')
  lines.push('')
  for (const m of restored.quickReference.mustRemember) {
    lines.push('- [!] ' + m)
  }
  lines.push('')
  if (restored.quickReference.mustNotForget.length > 0) {
    lines.push('### Must Not Forget')
    lines.push('')
    for (const m of restored.quickReference.mustNotForget) {
      lines.push('- [?] ' + m)
    }
    lines.push('')
  }
  lines.push('### Next Actions')
  lines.push('')
  for (let i = 0; i < restored.quickReference.nextActions.length; i++) {
    lines.push((i + 1) + '. ' + restored.quickReference.nextActions[i])
  }
  lines.push('')

  lines.push('## Restoration Prompt')
  lines.push('')
  lines.push('```markdown')
  lines.push(restored.promptTemplate)
  lines.push('```')
  lines.push('')

  lines.push('---')
  lines.push('_Context restoration engine — dsh-tool-knowledge v' + VERSION + '_')

  return lines.join('\n')
}

// ============================================================================
// TOOL 6: KNOWLEDGE LINKER
// ============================================================================

interface KnowledgeNode {
  id: string
  label: string
  type: 'concept' | 'fact' | 'decision' | 'lesson' | 'plan' | 'context'
  summary: string
  weight: number
}

interface KnowledgeEdge {
  from: string
  to: string
  relation: string
  strength: number
}

interface KnowledgeGraph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

interface LinkerResult {
  resultId: string
  timestamp: string
  newEntry: KnowledgeNode
  existingEntries: KnowledgeNode[]
  suggestions: Array<{
    targetEntry: string
    relation: string
    strength: number
    reason: string
    action: string
  }>
  graphUpdate: KnowledgeGraph
  insights: string[]
  orphanedEntries: string[]
  clusterCount: number
}

interface KnowledgeLinkerInput {
  new_entry: {
    id?: string
    label: string
    type?: 'concept' | 'fact' | 'decision' | 'lesson' | 'plan' | 'context'
    summary: string
  }
  existing_entries?: Array<{
    id: string
    label: string
    type?: 'concept' | 'fact' | 'decision' | 'lesson' | 'plan' | 'context'
    summary: string
  }>
}

function linkKnowledge(input: KnowledgeLinkerInput): LinkerResult {
  const resultId = generateId('link')
  const timestamp = nowISO()

  const newEntry: KnowledgeNode = {
    id: input.new_entry.id || generateId('node'),
    label: input.new_entry.label,
    type: input.new_entry.type || 'concept',
    summary: input.new_entry.summary,
    weight: 1.0
  }

  const existing: KnowledgeNode[] = (input.existing_entries || []).map(e => ({
    id: e.id || generateId('node'),
    label: e.label,
    type: e.type || 'concept',
    summary: e.summary,
    weight: 0.5
  }))

  const suggestions: LinkerResult['suggestions'] = []
  for (const entry of existing) {
    const score = computeLinkScore(newEntry, entry)
    if (score > 0.3) {
      const relation = inferRelation(newEntry, entry)
      suggestions.push({
        targetEntry: entry.label,
        relation,
        strength: score,
        reason: generateLinkReason(newEntry, entry, score),
        action: score > 0.7 ? 'strong-link' : 'weak-link'
      })
    }
  }

  suggestions.sort((a, b) => b.strength - a.strength)

  const nodes = [newEntry, ...existing]
  const edges: KnowledgeEdge[] = []
  for (const s of suggestions) {
    const target = existing.find(e => e.label === s.targetEntry)
    if (target) {
      edges.push({
        from: newEntry.id,
        to: target.id,
        relation: s.relation,
        strength: s.strength
      })
    }
  }

  let clusterCount = 1
  if (suggestions.length > 3) clusterCount = Math.ceil(suggestions.length / 3)

  const orphanedEntries: string[] = []
  for (const entry of existing) {
    const hasLink = suggestions.some(s => s.targetEntry === entry.label)
    if (!hasLink) orphanedEntries.push(entry.label)
  }

  const insights: string[] = []
  if (suggestions.length > 0) {
    insights.push('New entry connects to ' + suggestions.length + ' existing entries')
    const strongLinks = suggestions.filter(s => s.action === 'strong-link')
    if (strongLinks.length > 0) {
      insights.push('Strong links detected with: ' + strongLinks.map(s => s.targetEntry).join(', '))
    }
  } else {
    insights.push('No strong connections found — new entry may represent a novel topic area')
  }
  if (orphanedEntries.length > 0) {
    insights.push(orphanedEntries.length + ' existing entries remain unlinked — consider review')
  }

  return {
    resultId,
    timestamp,
    newEntry,
    existingEntries: existing,
    suggestions,
    graphUpdate: { nodes, edges },
    insights,
    orphanedEntries,
    clusterCount
  }
}

function computeLinkScore(a: KnowledgeNode, b: KnowledgeNode): number {
  let score = 0.0

  if (a.type === b.type) score += 0.3

  const wordsA = new Set(a.label.toLowerCase().split(/\s+/).concat(a.summary.toLowerCase().split(/\s+/)))
  const wordsB = new Set(b.label.toLowerCase().split(/\s+/).concat(b.summary.toLowerCase().split(/\s+/)))
  let overlap = 0
  for (const w of wordsA) {
    if (wordsB.has(w) && w.length > 3) overlap++
  }
  const maxWords = Math.max(wordsA.size, wordsB.size, 1)
  score += (overlap / maxWords) * 0.6

  const totalLen = a.summary.length + b.summary.length
  if (totalLen > 0) {
    const lenDiff = Math.abs(a.summary.length - b.summary.length) / totalLen
    score += (1 - lenDiff) * 0.1
  }

  return Math.min(score, 1.0)
}

function inferRelation(a: KnowledgeNode, b: KnowledgeNode): string {
  if (a.type === 'decision' && b.type === 'lesson') return 'decision-produces-lesson'
  if (a.type === 'lesson' && b.type === 'decision') return 'lesson-informs-decision'
  if (a.type === 'concept' && b.type === 'fact') return 'concept-supports-fact'
  if (a.type === 'fact' && b.type === 'concept') return 'fact-illustrates-concept'
  if (a.type === 'plan' && b.type === 'context') return 'plan-operates-in-context'
  if (a.type === 'context' && b.type === 'plan') return 'context-enables-plan'
  if (a.type === b.type) return 'same-type-association'
  return 'cross-domain-link'
}

function generateLinkReason(a: KnowledgeNode, b: KnowledgeNode, score: number): string {
  const wordsA = new Set(a.summary.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.summary.toLowerCase().split(/\s+/))
  const shared: string[] = []
  for (const w of wordsA) {
    if (wordsB.has(w) && w.length > 4) shared.push(w)
  }

  if (shared.length > 0) {
    return 'Shared terminology: ' + shared.slice(0, 3).join(', ')
  }
  if (a.type === b.type) return 'Same knowledge type (' + a.type + ')'
  return 'Structural similarity detected (score: ' + score.toFixed(2) + ')'
}

function formatKnowledgeLinkerReport(result: LinkerResult): string {
  const lines: string[] = []
  lines.push('# Knowledge Linker Report')
  lines.push('')
  lines.push('> **Result ID:** `' + result.resultId + '`  ')
  lines.push('> **Timestamp:** ' + result.timestamp + '  ')
  lines.push('> **Suggestions:** ' + result.suggestions.length + '  ')
  lines.push('> **Clusters:** ' + result.clusterCount)
  lines.push('')

  lines.push('## New Entry')
  lines.push('')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push('| ID | `' + result.newEntry.id + '` |')
  lines.push('| Label | ' + result.newEntry.label + ' |')
  lines.push('| Type | ' + result.newEntry.type + ' |')
  lines.push('| Summary | ' + truncateText(result.newEntry.summary, 100) + ' |')
  lines.push('')

  if (result.suggestions.length > 0) {
    lines.push('## Link Suggestions')
    lines.push('')
    lines.push('| Target | Relation | Strength | Action |')
    lines.push('|--------|----------|----------|--------|')
    for (const s of result.suggestions) {
      const bar = renderStrengthBar(s.strength)
      lines.push('| ' + s.targetEntry + ' | ' + s.relation + ' | ' + bar + ' | ' + s.action + ' |')
    }
    lines.push('')

    lines.push('### Reasoning')
    lines.push('')
    for (const s of result.suggestions) {
      lines.push('- **' + s.targetEntry + '**: ' + s.reason)
    }
    lines.push('')
  } else {
    lines.push('## Link Suggestions')
    lines.push('')
    lines.push('_No significant links detected. Entry may represent a new knowledge area._')
    lines.push('')
  }

  if (result.insights.length > 0) {
    lines.push('## Insights')
    lines.push('')
    for (const insight of result.insights) {
      lines.push('- [!] ' + insight)
    }
    lines.push('')
  }

  if (result.orphanedEntries.length > 0) {
    lines.push('## Orphaned Entries')
    lines.push('')
    for (const o of result.orphanedEntries) {
      lines.push('- [ORPHAN] ' + o)
    }
    lines.push('')
  }

  lines.push('## Graph Update')
  lines.push('')
  lines.push('- Nodes: ' + result.graphUpdate.nodes.length)
  lines.push('- Edges: ' + result.graphUpdate.edges.length)
  lines.push('- Estimated clusters: ' + result.clusterCount)
  lines.push('')

  lines.push('---')
  lines.push('_Knowledge graph linker — dsh-tool-knowledge v' + VERSION + '_')

  return lines.join('\n')
}

function renderStrengthBar(strength: number): string {
  const pct = Math.round(strength * 100)
  const filled = Math.round(strength * 10)
  return '[' + '|'.repeat(filled) + '-'.repeat(10 - filled) + '] ' + pct + '%'
}

// ============================================================================
// TOOL 7: PROGRESS TRACKER
// ============================================================================

interface ProgressReport {
  reportId: string
  timestamp: string
  planId: string
  status: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    blockedTasks: number
    pendingTasks: number
    completionPct: number
    health: 'healthy' | 'at_risk' | 'critical' | 'stalled'
  }
  milestoneProgress: Array<{
    name: string
    totalTasks: number
    completedTasks: number
    pct: number
    status: string
    eta: string
  }>
  workloadEstimate: {
    remainingTasks: number
    estimatedHours: number
    estimatedDays: number
    bottleneck: string
  }
  trends: {
    velocityTrend: 'accelerating' | 'stable' | 'decelerating'
    blockersFound: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  recommendations: string[]
}

interface ProgressTrackerInput {
  plan_id: string
  current_status: 'on_track' | 'at_risk' | 'blocked' | 'ahead' | 'behind'
  tasks: Array<{
    name: string
    milestone: string
    status: 'done' | 'in_progress' | 'blocked' | 'pending'
    estimated_hours?: number
    priority?: 'critical' | 'high' | 'medium' | 'low'
  }>
}

function trackProgress(input: ProgressTrackerInput): ProgressReport {
  const reportId = generateId('prog')
  const timestamp = nowISO()

  const allTasks = input.tasks
  const completed = allTasks.filter(t => t.status === 'done')
  const inProgress = allTasks.filter(t => t.status === 'in_progress')
  const blocked = allTasks.filter(t => t.status === 'blocked')
  const pending = allTasks.filter(t => t.status === 'pending')

  const totalTasks = allTasks.length
  const completionPct = totalTasks > 0 ? (completed.length / totalTasks) * 100 : 0

  let health: ProgressReport['status']['health'] = 'healthy'
  if (blocked.length > totalTasks * 0.3) health = 'critical'
  else if (input.current_status === 'blocked') health = 'stalled'
  else if (input.current_status === 'at_risk' || input.current_status === 'behind') health = 'at_risk'
  else if (input.current_status === 'ahead') health = 'healthy'

  const milestoneMap = new Map<string, typeof allTasks>()
  for (const t of allTasks) {
    const m = milestoneMap.get(t.milestone) || []
    m.push(t)
    milestoneMap.set(t.milestone, m)
  }

  const milestoneProgress: ProgressReport['milestoneProgress'] = []
  for (const [name, tasks] of milestoneMap) {
    const mCompleted = tasks.filter(t => t.status === 'done')
    const mPct = tasks.length > 0 ? (mCompleted.length / tasks.length) * 100 : 0
    let mStatus = 'pending'
    if (mPct === 100) mStatus = 'done'
    else if (mPct > 0) mStatus = 'in_progress'
    milestoneProgress.push({
      name,
      totalTasks: tasks.length,
      completedTasks: mCompleted.length,
      pct: mPct,
      status: mStatus,
      eta: mPct === 100 ? 'Complete' : '~' + Math.max(1, Math.round((tasks.length - mCompleted.length) * 1.5)) + ' days'
    })
  }

  const remainingTasks = pending.length + inProgress.length
  let estimatedHours = 0
  for (const t of [...pending, ...inProgress]) {
    estimatedHours += t.estimated_hours || seededRandom.nextInt(2, 8)
  }
  const estimatedDays = Math.max(1, Math.round(estimatedHours / 6))

  let bottleneck = 'None identified'
  if (blocked.length > 0) {
    const blockedCritical = blocked.filter(t => t.priority === 'critical')
    if (blockedCritical.length > 0) {
      bottleneck = 'Blocked critical: ' + blockedCritical.map(t => t.name).join(', ')
    } else {
      bottleneck = blocked.length + ' tasks blocked'
    }
  }

  let velocityTrend: ProgressReport['trends']['velocityTrend'] = 'stable'
  if (input.current_status === 'ahead') velocityTrend = 'accelerating'
  else if (input.current_status === 'behind') velocityTrend = 'decelerating'

  const riskLevel = health === 'critical' ? 'high' : health === 'at_risk' ? 'medium' : 'low'

  const recommendations: string[] = []
  if (blocked.length > 0) {
    recommendations.push('Resolve ' + blocked.length + ' blocked tasks to unblock progress')
  }
  if (completionPct < 25 && totalTasks > 4) {
    recommendations.push('Consider parallelizing workstreams to improve velocity')
  }
  if (health === 'healthy' && completionPct > 75) {
    recommendations.push('Near completion — begin planning for project wrap-up')
  }
  if (inProgress.length > 3) {
    recommendations.push('Too many concurrent tasks — focus on top priorities')
  }
  const criticalPending = pending.filter(t => t.priority === 'critical')
  if (criticalPending.length > 0) {
    recommendations.push('Prioritize critical pending: ' + criticalPending.map(t => t.name).join(', '))
  }
  if (recommendations.length === 0) {
    recommendations.push('Progress is nominal — maintain current pace')
  }

  return {
    reportId,
    timestamp,
    planId: input.plan_id,
    status: {
      totalTasks,
      completedTasks: completed.length,
      inProgressTasks: inProgress.length,
      blockedTasks: blocked.length,
      pendingTasks: pending.length,
      completionPct,
      health
    },
    milestoneProgress,
    workloadEstimate: {
      remainingTasks,
      estimatedHours,
      estimatedDays,
      bottleneck
    },
    trends: {
      velocityTrend,
      blockersFound: blocked.length,
      riskLevel
    },
    recommendations
  }
}

function formatProgressTrackerReport(report: ProgressReport): string {
  const lines: string[] = []
  lines.push('# Progress Report: ' + report.planId)
  lines.push('')
  lines.push('> **Report ID:** `' + report.reportId + '`  ')
  lines.push('> **Timestamp:** ' + report.timestamp + '  ')
  lines.push('> **Health:** ' + report.status.health.replace('_', ' ').toUpperCase())
  lines.push('')

  lines.push('## Overview')
  lines.push('')
  lines.push(renderProgressBar(report.status.completionPct))
  lines.push('')
  lines.push('| Metric | Count |')
  lines.push('|--------|-------|')
  lines.push('| Total tasks | ' + report.status.totalTasks + ' |')
  lines.push('| Completed | ' + report.status.completedTasks + ' |')
  lines.push('| In Progress | ' + report.status.inProgressTasks + ' |')
  lines.push('| Blocked | ' + report.status.blockedTasks + ' |')
  lines.push('| Pending | ' + report.status.pendingTasks + ' |')
  lines.push('| Completion | ' + report.status.completionPct.toFixed(1) + '% |')
  lines.push('')

  lines.push('## Milestone Breakdown')
  lines.push('')
  for (const m of report.milestoneProgress) {
    lines.push('### ' + m.name)
    lines.push('')
    lines.push('- Progress: ' + renderProgressBar(m.pct, 15))
    lines.push('- Tasks: ' + m.completedTasks + '/' + m.totalTasks)
    lines.push('- Status: ' + m.status)
    lines.push('- ETA: ' + m.eta)
    lines.push('')
  }

  lines.push('## Workload Estimate')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Remaining tasks | ' + report.workloadEstimate.remainingTasks + ' |')
  lines.push('| Estimated hours | ' + report.workloadEstimate.estimatedHours + 'h |')
  lines.push('| Estimated days | ' + report.workloadEstimate.estimatedDays + ' days |')
  lines.push('| Bottleneck | ' + report.workloadEstimate.bottleneck + ' |')
  lines.push('')

  lines.push('## Trends')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Velocity | ' + report.trends.velocityTrend + ' |')
  lines.push('| Blockers | ' + report.trends.blockersFound + ' |')
  lines.push('| Risk level | ' + report.trends.riskLevel.toUpperCase() + ' |')
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  for (let i = 0; i < report.recommendations.length; i++) {
    lines.push((i + 1) + '. ' + report.recommendations[i])
  }
  lines.push('')

  lines.push('---')
  lines.push('_Progress tracking engine — dsh-tool-knowledge v' + VERSION + '_')

  return lines.join('\n')
}

// ============================================================================
// TOOL 8: INSIGHT EXTRACTOR
// ============================================================================

interface ExtractedInsight {
  insightId: string
  category: 'pattern' | 'anomaly' | 'opportunity' | 'risk' | 'trend' | 'correlation'
  title: string
  description: string
  confidence: string
  evidence: string[]
  actionItems: string[]
  relatedPatterns: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
}

interface InsightExtractionResult {
  extractionId: string
  timestamp: string
  insights: ExtractedInsight[]
  patternsFound: string[]
  actionItems: Array<{
    action: string
    priority: string
    sourceInsight: string
    deadline: string
  }>
  summary: {
    totalInsights: number
    criticalFindings: number
    highValueActions: number
    coverageScore: string
  }
  metadata: {
    patternsSearched: string[]
    notesProcessed: number
    extractionMethod: string
  }
}

interface InsightExtractorInput {
  raw_notes: string[]
  patterns_to_find?: string[]
}

function extractInsights(input: InsightExtractorInput): InsightExtractionResult {
  const extractionId = generateId('ins')
  const timestamp = nowISO()

  const patternsToFind = input.patterns_to_find || [
    'recurring_issue', 'growth_opportunity', 'efficiency_gap',
    'risk_indicator', 'emerging_trend', 'blocker_pattern'
  ]

  const insights: ExtractedInsight[] = []
  const patternsFound: string[] = []

  for (const note of input.raw_notes) {
    const extracted = analyzeNoteForPatterns(note, patternsToFind)
    insights.push(...extracted)
    patternsFound.push(...extracted.map(i => i.category))
  }

  const uniquePatternsFound = Array.from(new Set(patternsFound))

  const actionItems: InsightExtractionResult['actionItems'] = []
  for (const insight of insights) {
    for (const action of insight.actionItems) {
      actionItems.push({
        action,
        priority: insight.priority,
        sourceInsight: insight.title,
        deadline: computeDeadline(insight.priority)
      })
    }
  }

  const criticalFindings = insights.filter(i => i.priority === 'critical').length
  const highValueActions = actionItems.filter(a => a.priority === 'critical' || a.priority === 'high').length
  const coverageScore = patternsToFind.length > 0
    ? ((uniquePatternsFound.length / patternsToFind.length) * 100).toFixed(0) + '%'
    : '0%'

  return {
    extractionId,
    timestamp,
    insights,
    patternsFound: uniquePatternsFound,
    actionItems,
    summary: {
      totalInsights: insights.length,
      criticalFindings,
      highValueActions,
      coverageScore
    },
    metadata: {
      patternsSearched: patternsToFind,
      notesProcessed: input.raw_notes.length,
      extractionMethod: 'pattern-matching-with-heuristics'
    }
  }
}

function analyzeNoteForPatterns(note: string, patterns: string[]): ExtractedInsight[] {
  const results: ExtractedInsight[] = []
  const lower = note.toLowerCase()

  if (patterns.includes('recurring_issue') && (lower.includes('again') || lower.includes('still') || lower.includes('repeated'))) {
    results.push({
      insightId: generateId('i'),
      category: 'pattern',
      title: 'Recurring Issue Detected',
      description: 'Pattern of repetition suggests systemic issue: ' + truncateText(note, 100),
      confidence: 'medium',
      evidence: [note],
      actionItems: ['Investigate root cause of recurrence', 'Document workaround'],
      relatedPatterns: ['blocker_pattern'],
      priority: 'high'
    })
  }

  if (patterns.includes('growth_opportunity') && (lower.includes('could') || lower.includes('potential') || lower.includes('opportunity'))) {
    results.push({
      insightId: generateId('i'),
      category: 'opportunity',
      title: 'Growth Opportunity Identified',
      description: 'Potential upside detected: ' + truncateText(note, 100),
      confidence: 'medium',
      evidence: [note],
      actionItems: ['Quantify opportunity size', 'Create action plan'],
      relatedPatterns: ['emerging_trend'],
      priority: 'high'
    })
  }

  if (patterns.includes('efficiency_gap') && (lower.includes('slow') || lower.includes('manual') || lower.includes('bottleneck'))) {
    results.push({
      insightId: generateId('i'),
      category: 'anomaly',
      title: 'Efficiency Gap Found',
      description: 'Process bottleneck or manual overhead: ' + truncateText(note, 100),
      confidence: 'high',
      evidence: [note],
      actionItems: ['Map process steps', 'Identify automation candidates'],
      relatedPatterns: ['blocker_pattern'],
      priority: 'medium'
    })
  }

  if (patterns.includes('risk_indicator') && (lower.includes('risk') || lower.includes('failure') || lower.includes('downtime') || lower.includes('critical'))) {
    results.push({
      insightId: generateId('i'),
      category: 'risk',
      title: 'Risk Signal Detected',
      description: 'Potential risk requires attention: ' + truncateText(note, 100),
      confidence: 'high',
      evidence: [note],
      actionItems: ['Assess impact and likelihood', 'Create mitigation plan'],
      relatedPatterns: ['blocker_pattern'],
      priority: 'critical'
    })
  }

  if (patterns.includes('emerging_trend') && (lower.includes('increasing') || lower.includes('growing') || lower.includes('new'))) {
    results.push({
      insightId: generateId('i'),
      category: 'trend',
      title: 'Emerging Trend Observed',
      description: 'Positive trajectory or new development: ' + truncateText(note, 100),
      confidence: 'low',
      evidence: [note],
      actionItems: ['Monitor trend direction', 'Assess relevance to goals'],
      relatedPatterns: ['growth_opportunity'],
      priority: 'medium'
    })
  }

  if (patterns.includes('blocker_pattern') && (lower.includes('blocked') || lower.includes('waiting') || lower.includes('cannot'))) {
    results.push({
      insightId: generateId('i'),
      category: 'anomaly',
      title: 'Blocker Pattern Found',
      description: 'Dependency or obstacle identified: ' + truncateText(note, 100),
      confidence: 'high',
      evidence: [note],
      actionItems: ['Identify blocker owner', 'Set escalation path'],
      relatedPatterns: ['risk_indicator', 'recurring_issue'],
      priority: 'high'
    })
  }

  if (results.length === 0 && note.length > 10) {
    results.push({
      insightId: generateId('i'),
      category: 'correlation',
      title: 'General Observation',
      description: 'Uncategorized insight from notes: ' + truncateText(note, 100),
      confidence: 'low',
      evidence: [note],
      actionItems: ['Review for relevance'],
      relatedPatterns: [],
      priority: 'low'
    })
  }

  return results
}

function computeDeadline(priority: ExtractedInsight['priority']): string {
  const d = new Date()
  switch (priority) {
    case 'critical': d.setDate(d.getDate() + 1); break
    case 'high': d.setDate(d.getDate() + 3); break
    case 'medium': d.setDate(d.getDate() + 7); break
    case 'low': d.setDate(d.getDate() + 14); break
  }
  return d.getFullYear() + '-' + padNum(d.getMonth() + 1) + '-' + padNum(d.getDate())
}

function formatInsightExtractorReport(result: InsightExtractionResult): string {
  const lines: string[] = []
  lines.push('# Insight Extraction Report')
  lines.push('')
  lines.push('> **Extraction ID:** `' + result.extractionId + '`  ')
  lines.push('> **Timestamp:** ' + result.timestamp + '  ')
  lines.push('> **Notes Processed:** ' + result.metadata.notesProcessed + '  ')
  lines.push('> **Coverage:** ' + result.summary.coverageScore)
  lines.push('')

  lines.push('## Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total insights | ' + result.summary.totalInsights + ' |')
  lines.push('| Critical findings | ' + result.summary.criticalFindings + ' |')
  lines.push('| High-value actions | ' + result.summary.highValueActions + ' |')
  lines.push('| Pattern coverage | ' + result.summary.coverageScore + ' |')
  lines.push('')

  if (result.patternsFound.length > 0) {
    lines.push('## Patterns Detected')
    lines.push('')
    for (const p of result.patternsFound) {
      lines.push('- ' + p)
    }
    lines.push('')
  }

  if (result.insights.length > 0) {
    lines.push('## Extracted Insights')
    lines.push('')
    for (const insight of result.insights) {
      lines.push('### ' + insight.title)
      lines.push('')
      lines.push('| Field | Value |')
      lines.push('|-------|-------|')
      lines.push('| Category | ' + insight.category + ' |')
      lines.push('| Confidence | ' + insight.confidence + ' |')
      lines.push('| Priority | ' + renderPriorityBadge(insight.priority) + ' |')
      lines.push('')
      lines.push(insight.description)
      lines.push('')
      if (insight.actionItems.length > 0) {
        lines.push('**Action Items:**')
        lines.push('')
        for (const a of insight.actionItems) {
          lines.push('- ' + a)
        }
        lines.push('')
      }
    }
  }

  if (result.actionItems.length > 0) {
    lines.push('## Action Items')
    lines.push('')
    lines.push('| Action | Priority | Source | Deadline |')
    lines.push('|--------|----------|--------|----------|')
    for (const ai of result.actionItems) {
      lines.push('| ' + truncateText(ai.action, 40) + ' | ' + ai.priority.toUpperCase() + ' | ' + truncateText(ai.sourceInsight, 20) + ' | ' + ai.deadline + ' |')
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('_Insight extraction engine — dsh-tool-knowledge v' + VERSION + '_')

  return lines.join('\n')
}

// ============================================================================
// PLUGIN REGISTRATION
// ============================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'plan_creator',
    description: 'Create a structured Markdown project plan with task tree, milestones, timeline phases, and dependency mapping. Input project goal, milestones array, and constraints to produce a comprehensive planning document ready for execution.',
    parameters: {
      project_goal: { type: 'string', required: true, description: 'The high-level project goal or objective (e.g., "Build a cross-platform SaaS dashboard for analytics")' },
      milestones: { type: 'string', required: true, description: 'JSON array of milestone objects with title, description, tasks, priority, dependencies, estimated_days, deliverable' },
      constraints: { type: 'string', description: 'JSON array of constraint objects with type (time/resource/technical/regulatory/budget), description, severity (hard/soft)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { project_goal: string; milestones: string; constraints?: string }) {
      const milestoneList = JSON.parse(args.milestones) as PlanCreatorInput['milestones']
      const constraintList = args.constraints ? JSON.parse(args.constraints) as PlanCreatorInput['constraints'] : undefined
      const input: PlanCreatorInput = { project_goal: args.project_goal, milestones: milestoneList, constraints: constraintList }
      const plan = createPlan(input)
      return formatPlanCreatorReport(plan)
    }
  }))

  tools.register(defineTool({
    name: 'memory_journal',
    description: 'Create an append-only memory journal from session events. Records decisions, discoveries, lessons, context snapshots, and milestones. Each journal entry captures the full context of a working session for future reference.',
    parameters: {
      session_events: { type: 'string', required: true, description: 'JSON array of session events with type (decision/discovery/lesson/context/error/milestone/interaction), summary, details, importance, tags' },
      project_id: { type: 'string', required: true, description: 'Unique identifier for the project this journal belongs to' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { session_events: string; project_id: string }) {
      const events = JSON.parse(args.session_events) as MemoryJournalInput['session_events']
      const input: MemoryJournalInput = { session_events: events, project_id: args.project_id }
      const journal = createMemoryJournal(input)
      return formatMemoryJournalReport(journal)
    }
  }))

  tools.register(defineTool({
    name: 'decision_logger',
    description: 'Record a structured Architecture Decision Record (ADR). Documents the context, options considered with pros/cons, the chosen path, and rationale. Produces a reference-quality decision document for future audits.',
    parameters: {
      decision_context: { type: 'string', required: true, description: 'The problem or situation requiring a decision' },
      options_considered: { type: 'string', required: true, description: 'JSON array of options with name, pros, cons, tradeoffs, feasibility (high/medium/low)' },
      chosen_option: { type: 'string', required: true, description: 'The name of the selected option (must match one in options_considered)' },
      rationale: { type: 'string', required: true, description: 'Detailed reasoning for why this option was chosen' },
      tags: { type: 'string', description: 'Optional JSON array of string tags for categorization' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { decision_context: string; options_considered: string; chosen_option: string; rationale: string; tags?: string }) {
      const options = JSON.parse(args.options_considered) as DecisionLoggerInput['options_considered']
      const tags = args.tags ? JSON.parse(args.tags) as string[] : undefined
      const input: DecisionLoggerInput = { decision_context: args.decision_context, options_considered: options, chosen_option: args.chosen_option, rationale: args.rationale, tags }
      const entry = logDecision(input)
      return formatDecisionLoggerReport(entry)
    }
  }))

  tools.register(defineTool({
    name: 'learning_accumulator',
    description: 'Accumulate new learnings into a knowledge base with automatic deduplication, topic clustering, and relationship detection. Merges new entries with existing knowledge and reports on dedup statistics and knowledge depth.',
    parameters: {
      new_learnings: { type: 'string', required: true, description: 'JSON array of new learning entries with topic, content, source, confidence (high/medium/low), relationships' },
      existing_knowledge: { type: 'string', description: 'JSON array of existing knowledge entries in the same format to merge against' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { new_learnings: string; existing_knowledge?: string }) {
      const learnings = JSON.parse(args.new_learnings) as LearningAccumulatorInput['new_learnings']
      const existing = args.existing_knowledge ? JSON.parse(args.existing_knowledge) as LearningAccumulatorInput['existing_knowledge'] : undefined
      const input: LearningAccumulatorInput = { new_learnings: learnings, existing_knowledge: existing }
      const knowledge = accumulateknowledge(input)
      return formatLearningAccumulatorReport(knowledge)
    }
  }))

  tools.register(defineTool({
    name: 'context_restorer',
    description: 'Restore full working context from a checkpoint or session data. Reconstructs project state, pending work, key variables, and open questions. Generates a restoration prompt template and quick reference card for seamless session resumption.',
    parameters: {
      session_id: { type: 'string', required: true, description: 'Unique session identifier to restore context for' },
      checkpoint_id: { type: 'string', description: 'Optional checkpoint ID if restoring from a specific checkpoint' },
      checkpoint_data: { type: 'string', description: 'JSON object with restoration data: active_project, current_milestone, completed_steps, pending_steps, key_variables, last_decision, open_questions, recent_events, important_notes, referenced_files' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { session_id: string; checkpoint_id?: string; checkpoint_data?: string }) {
      const data = args.checkpoint_data ? JSON.parse(args.checkpoint_data) as ContextRestorerInput['checkpoint_data'] : undefined
      const input: ContextRestorerInput = { session_id: args.session_id, checkpoint_id: args.checkpoint_id, checkpoint_data: data }
      const restored = restoreContext(input)
      return formatContextRestorerReport(restored)
    }
  }))

  tools.register(defineTool({
    name: 'knowledge_linker',
    description: 'Link a new knowledge entry to existing entries using semantic similarity and structural analysis. Produces link suggestions with strength scores, generates graph updates, identifies orphaned entries, and provides linking insights.',
    parameters: {
      new_entry: { type: 'string', required: true, description: 'JSON object with label, type (concept/fact/decision/lesson/plan/context), summary, and optional id' },
      existing_entries: { type: 'string', description: 'JSON array of existing knowledge entries with id, label, type, summary' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { new_entry: string; existing_entries?: string }) {
      const newE = JSON.parse(args.new_entry) as KnowledgeLinkerInput['new_entry']
      const existing = args.existing_entries ? JSON.parse(args.existing_entries) as KnowledgeLinkerInput['existing_entries'] : undefined
      const input: KnowledgeLinkerInput = { new_entry: newE, existing_entries: existing }
      const result = linkKnowledge(input)
      return formatKnowledgeLinkerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'progress_tracker',
    description: 'Track plan progress and generate comprehensive status reports. Analyzes task completion across milestones, estimates remaining workload, identifies bottlenecks, and provides trend analysis with actionable recommendations.',
    parameters: {
      plan_id: { type: 'string', required: true, description: 'Plan identifier to track progress for' },
      current_status: { type: 'string', required: true, description: 'Overall plan status: on_track, at_risk, blocked, ahead, behind' },
      tasks: { type: 'string', required: true, description: 'JSON array of task objects with name, milestone, status (done/in_progress/blocked/pending), estimated_hours, priority (critical/high/medium/low)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { plan_id: string; current_status: string; tasks: string }) {
      const tasks = JSON.parse(args.tasks) as ProgressTrackerInput['tasks']
      const input: ProgressTrackerInput = { plan_id: args.plan_id, current_status: args.current_status as ProgressTrackerInput['current_status'], tasks }
      const report = trackProgress(input)
      return formatProgressTrackerReport(report)
    }
  }))

  tools.register(defineTool({
    name: 'insight_extractor',
    description: 'Extract key insights and action items from raw notes using pattern matching. Identifies recurring issues, growth opportunities, efficiency gaps, risk indicators, emerging trends, and blockers. Produces prioritized action items with deadlines.',
    parameters: {
      raw_notes: { type: 'string', required: true, description: 'JSON array of raw note strings to analyze' },
      patterns_to_find: { type: 'string', description: 'Optional JSON array of pattern types to search for. Defaults to: recurring_issue, growth_opportunity, efficiency_gap, risk_indicator, emerging_trend, blocker_pattern' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { raw_notes: string; patterns_to_find?: string }) {
      const notes = JSON.parse(args.raw_notes) as string[]
      const patterns = args.patterns_to_find ? JSON.parse(args.patterns_to_find) as string[] : undefined
      const input: InsightExtractorInput = { raw_notes: notes, patterns_to_find: patterns }
      const result = extractInsights(input)
      return formatInsightExtractorReport(result)
    }
  }))

  console.log('[dsh-tool-knowledge] Loaded v' + VERSION + ' — Persistent knowledge management with 8 tools')
  console.log('  Tools: plan_creator, memory_journal, decision_logger, learning_accumulator, context_restorer, knowledge_linker, progress_tracker, insight_extractor')
}
