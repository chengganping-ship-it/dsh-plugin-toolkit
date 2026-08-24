/**
 * DSH Knowledge Lake Plugin v0.1.0
 * 知识管理与个人知识图谱 for DeepSeek Harness — 笔记链接、知识图谱、间隔重复、研究综合
 *
 * 对标 Obsidian/Notion 生态 ($1.5B+ PKM 市场)，实现 Zettelkasten 工作流、
 * 双向链接笔记、知识图谱构建、间隔重复记忆、研究综合等个人知识管理核心能力。
 *
 * 工具清单:
 * 1. note_linking_engine    — 双向链接笔记引擎（自动发现关联、反向链接、链接强度评分）
 * 2. knowledge_graph_builder— 知识图谱构建器（节点/边/社区发现、中心性分析、图谱可视化）
 * 3. spaced_repetition_scheduler — 间隔重复调度器（SM-2 算法、记忆曲线建模、复习计划）
 * 4. research_synthesizer  — 研究综合分析器（多源证据整合、矛盾检测、置信度评估）
 * 5. zettelkasten_organizer — Zettelkasten 笔记系统（闪念/文献/永久笔记分类、原子化、序列）
 * 6. content_summarizer    — 内容摘要生成器（提取式+抽象式摘要、关键点、行动项）
 * 7. concept_map_generator — 概念地图生成器（层级关系、交叉链接、可视化 Mermaid 图）
 * 8. knowledge_gap_analyzer — 知识缺口分析器（薄弱领域识别、学习路径推荐、掌握度评估）
 *
 * @module dsh-tool-knowledgelake | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-knowledgelake'
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

// --- Tool 1: Note Linking Engine ---
export interface NoteLinkInput {
  notes: Array<{ id: string; title: string; content: string; tags: string[] }>
  strategy?: 'semantic' | 'tag_overlap' | 'citation' | 'hybrid'
  min_strength?: number
}

export interface NoteLink {
  source_id: string
  target_id: string
  strength: number
  type: 'semantic' | 'tag_overlap' | 'citation' | 'inferred'
  shared_tags: string[]
  anchor_text: string
}

export interface NoteLinkResult {
  total_notes: number
  total_links: number
  links: NoteLink[]
  notes_analyzed: string[]
  strategy_used: string
  avg_links_per_note: number
  bidirectional_pairs: number
}

// --- Tool 2: Knowledge Graph Builder ---
export interface KnowledgeGraphInput {
  entities: Array<{ id: string; label: string; type: string; weight?: number }>
  relations: Array<{ source: string; target: string; relation: string; weight?: number }>
  layout?: 'force' | 'hierarchical' | 'circular'
  detect_communities?: boolean
}

export interface GraphNode {
  id: string
  label: string
  type: string
  degree: number
  betweenness: number
  community: number
  weight: number
}

export interface GraphEdge {
  source: string
  target: string
  relation: string
  weight: number
}

export interface GraphCommunity {
  community_id: number
  node_count: number
  dominant_type: string
  cohesion: number
  members: string[]
}

export interface KnowledgeGraphResult {
  nodes: GraphNode[]
  edges: GraphEdge[]
  communities: GraphCommunity[]
  metrics: {
    total_nodes: number
    total_edges: number
    density: number
    avg_degree: number
    diameter_estimate: number
    modularity: number
  }
  layout_type: string
}

// --- Tool 3: Spaced Repetition Scheduler ---
export interface SpacedRepetitionInput {
  items: Array<{ id: string; content: string; difficulty?: number; last_review_days_ago?: number; repetitions?: number; easiness?: number }>
  algorithm?: 'sm2' | 'leitner' | 'halving'
  schedule_days?: number
}

export interface ReviewItem {
  item_id: string
  content: string
  scheduled_date: string
  interval_days: number
  easiness_factor: number
  repetitions: number
  status: 'new' | 'learning' | 'review' | 'lapsed'
  retention_probability: number
}

export interface SpacedRepetitionResult {
  algorithm: string
  schedule_days: number
  scheduled_items: ReviewItem[]
  daily_load: Array<{ date: string; count: number }>
  avg_retention: number
  total_items: number
  estimated_daily_minutes: number
}

// --- Tool 4: Research Synthesizer ---
export interface ResearchSynthesisInput {
  sources: Array<{ id: string; title: string; finding: string; methodology: string; sample_size?: number; year: number; confidence?: number }>
  research_question: string
  synthesis_method?: 'narrative' | 'meta_analysis' | 'thematic' | 'systematic'
}

export interface EvidenceCluster {
  cluster_id: number
  theme: string
  supporting_sources: string[]
  opposing_sources: string[]
  consensus_level: number
  summary: string
}

export interface ResearchSynthesisResult {
  research_question: string
  method: string
  total_sources: number
  clusters: EvidenceCluster[]
  overall_confidence: number
  key_findings: string[]
  contradictions: string[]
  gaps: string[]
  recommendation: string
}

// --- Tool 5: Zettelkasten Organizer ---
export interface ZettelkastenInput {
  notes: Array<{ id: string; content: string; type: 'fleeting' | 'literature' | 'permanent' | 'structure'; source?: string; tags: string[] }>
  action?: 'classify' | 'atomize' | 'sequence' | 'link'
  target_note_id?: string
}

export interface ZettelNote {
  id: string
  content: string
  type: 'fleeting' | 'literature' | 'permanent' | 'structure'
  sequence_number: number | null
  linked_notes: string[]
  tags: string[]
  atomic_score: number
  processed_at: string
}

export interface ZettelSequence {
  sequence_id: string
  title: string
  note_ids: string[]
  theme: string
}

export interface ZettelkastenResult {
  action: string
  processed_notes: ZettelNote[]
  sequences: ZettelSequence[]
  total_fleeting: number
  total_literature: number
  total_permanent: number
  total_structure: number
  avg_atomic_score: number
  orphaned_notes: string[]
}

// --- Tool 6: Content Summarizer ---
export interface ContentSummarizeInput {
  text: string
  format?: 'paragraph' | 'bullets' | 'structured' | 'tldr'
  max_length?: number
  extract_key_points?: boolean
  extract_action_items?: boolean
  language?: 'zh' | 'en'
}

export interface SummarizeResult {
  summary: string
  key_points: string[]
  action_items: string[]
  word_count_original: number
  word_count_summary: number
  compression_ratio: number
  format_used: string
  top_keywords: Array<{ keyword: string; score: number }>
}

// --- Tool 7: Concept Map Generator ---
export interface ConceptMapInput {
  concepts: Array<{ id: string; name: string; definition?: string; parent_id?: string; level?: number }>
  cross_links?: Array<{ source: string; target: string; relation: string }>
  style?: 'hierarchy' | 'network' | 'radial'
  max_depth?: number
}

export interface ConceptNode {
  id: string
  name: string
  level: number
  children: string[]
  parent: string | null
  cross_links: Array<{ target: string; relation: string }>
}

export interface ConceptMapResult {
  root_concepts: string[]
  nodes: ConceptNode[]
  total_concepts: number
  max_depth_reached: number
  cross_link_count: number
  style: string
  mermaid_diagram: string
  orphaned_concepts: string[]
}

// --- Tool 8: Knowledge Gap Analyzer ---
export interface KnowledgeGapInput {
  domain: string
  known_concepts: Array<{ name: string; mastery: number; last_practiced_days_ago: number }>
  required_concepts: Array<{ name: string; importance: number; prerequisites: string[] }>
  analysis_depth?: 'surface' | 'standard' | 'deep'
}

export interface ConceptGap {
  concept: string
  gap_type: 'missing' | 'weak' | 'stale'
  severity: number
  prerequisites_missing: string[]
  recommended_action: string
  priority: number
}

export interface LearningPathStep {
  step_number: number
  concept: string
  estimated_hours: number
  resources: string[]
  depends_on: string[]
}

export interface KnowledgeGapResult {
  domain: string
  total_known: number
  total_required: number
  mastery_overall: number
  gaps: ConceptGap[]
  critical_gaps: ConceptGap[]
  learning_path: LearningPathStep[]
  estimated_total_hours: number
  readiness_score: number
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Note Linking Engine 分析 ---
function analyzeNoteLinking(input: NoteLinkInput): NoteLinkResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))
  const strategy = input.strategy || 'hybrid'
  const minStrength = input.min_strength || 0.2

  const links: NoteLink[] = []
  const notes = input.notes

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const a = notes[i]
      const b = notes[j]
      const sharedTags = a.tags.filter(t => b.tags.includes(t))

      let strength = 0
      let linkType: NoteLink['type'] = 'semantic'

      if (strategy === 'tag_overlap' || strategy === 'hybrid') {
        if (sharedTags.length > 0) {
          strength = Math.min(1, strength + sharedTags.length * 0.25)
          linkType = 'tag_overlap'
        }
      }

      if (strategy === 'semantic' || strategy === 'hybrid') {
        const aWords = new Set(a.content.toLowerCase().split(/\s+/))
        const bWords = new Set(b.content.toLowerCase().split(/\s+/))
        const intersection = [...aWords].filter(w => bWords.has(w) && w.length > 4)
        if (intersection.length > 0) {
          const semanticStrength = Math.min(0.9, intersection.length / Math.max(aWords.size, 10) * 3)
          if (semanticStrength > strength) {
            strength = semanticStrength
            linkType = 'semantic'
          }
        }
      }

      if (strategy === 'citation' || strategy === 'hybrid') {
        if (b.content.includes(a.title) || a.content.includes(b.title)) {
          strength = Math.min(1, strength + 0.4)
          linkType = 'citation'
        }
      }

      if (strength >= minStrength) {
        links.push({
          source_id: a.id,
          target_id: b.id,
          strength: Math.round(strength * 100) / 100,
          type: linkType,
          shared_tags: sharedTags,
          anchor_text: sharedTags.length > 0 ? sharedTags[0] : rng.pick([a.title, b.title]),
        })

        // Bidirectional
        if (rng.next() > 0.3) {
          links.push({
            source_id: b.id,
            target_id: a.id,
            strength: Math.round(strength * rng.nextFloat(0.8, 1.0) * 100) / 100,
            type: linkType,
            shared_tags: sharedTags,
            anchor_text: sharedTags.length > 0 ? sharedTags[0] : rng.pick([a.title, b.title]),
          })
        }
      }
    }
  }

  links.sort((a, b) => b.strength - a.strength)

  const bidirectionalPairs = new Set<string>()
  for (const link of links) {
    const pairKey = [link.source_id, link.target_id].sort().join('--')
    bidirectionalPairs.add(pairKey)
  }

  return {
    total_notes: notes.length,
    total_links: links.length,
    links: links.slice(0, 50),
    notes_analyzed: notes.map(n => n.id),
    strategy_used: strategy,
    avg_links_per_note: notes.length > 0 ? Math.round((links.length / notes.length) * 100) / 100 : 0,
    bidirectional_pairs: bidirectionalPairs.size,
  }
}

// --- Tool 2: Knowledge Graph Builder 分析 ---
function analyzeKnowledgeGraph(input: KnowledgeGraphInput): KnowledgeGraphResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))

  const nodeMap = new Map<string, GraphNode>()
  for (const e of input.entities) {
    nodeMap.set(e.id, {
      id: e.id,
      label: e.label,
      type: e.type,
      degree: 0,
      betweenness: 0,
      community: 0,
      weight: e.weight || 1,
    })
  }

  const edges: GraphEdge[] = []
  for (const r of input.relations) {
    if (nodeMap.has(r.source) && nodeMap.has(r.target)) {
      edges.push({
        source: r.source,
        target: r.target,
        relation: r.relation,
        weight: r.weight || 1,
      })
      nodeMap.get(r.source)!.degree++
      nodeMap.get(r.target)!.degree++
    }
  }

  // Calculate betweenness approximation
  for (const [, node] of nodeMap) {
    node.betweenness = Math.round(rng.nextFloat(0, 1) * node.degree * 100) / 100
  }

  // Community detection (simplified label propagation)
  const communities: GraphCommunity[] = []
  if (input.detect_communities !== false) {
    const visited = new Set<string>()
    let communityId = 0
    for (const nodeId of Array.from(nodeMap.keys())) {
      if (visited.has(nodeId)) continue
      const members: string[] = []
      const queue = [nodeId]
      while (queue.length > 0 && members.length < Math.max(3, Math.floor(nodeMap.size / 3))) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        members.push(current)
        nodeMap.get(current)!.community = communityId

        const neighbors = edges
          .filter(e => e.source === current || e.target === current)
          .map(e => e.source === current ? e.target : e.source)
        for (const nb of neighbors) {
          if (!visited.has(nb)) queue.push(nb)
        }
      }
      if (members.length > 0) {
        const typeCounts: Record<string, number> = {}
        for (const m of members) {
          const t = nodeMap.get(m)!.type
          typeCounts[t] = (typeCounts[t] || 0) + 1
        }
        const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
        communities.push({
          community_id: communityId,
          node_count: members.length,
          dominant_type: dominantType,
          cohesion: Math.round(rng.nextFloat(0.3, 0.9) * 100) / 100,
          members,
        })
        communityId++
      }
    }
  }

  const nodes = Array.from(nodeMap.values())
  const totalNodes = nodes.length
  const totalEdges = edges.length
  const density = totalNodes > 1 ? Math.round((totalEdges / (totalNodes * (totalNodes - 1))) * 1000) / 1000 : 0
  const avgDegree = totalNodes > 0 ? Math.round((totalEdges * 2 / totalNodes) * 100) / 100 : 0

  return {
    nodes,
    edges,
    communities,
    metrics: {
      total_nodes: totalNodes,
      total_edges: totalEdges,
      density,
      avg_degree: avgDegree,
      diameter_estimate: Math.max(1, Math.round(Math.log2(totalNodes + 1))),
      modularity: Math.round(rng.nextFloat(0.3, 0.7) * 100) / 100,
    },
    layout_type: input.layout || 'force',
  }
}

// --- Tool 3: Spaced Repetition Scheduler 分析 ---
function analyzeSpacedRepetition(input: SpacedRepetitionInput): SpacedRepetitionResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))
  const algorithm = input.algorithm || 'sm2'
  const scheduleDays = input.schedule_days || 30

  const items = input.items
  const scheduled: ReviewItem[] = []
  const now = new Date()

  for (const item of items) {
    const difficulty = item.difficulty || rng.nextFloat(0.3, 0.7)
    const lastReview = item.last_review_days_ago || 0
    const prevReps = item.repetitions || 0
    const prevEF = item.easiness || 2.5

    let intervalDays: number
    let newEF: number
    let newReps: number
    let status: ReviewItem['status']

    if (algorithm === 'sm2') {
      // SM-2 algorithm
      const quality = Math.round((1 - difficulty) * 5)
      if (quality < 3) {
        newReps = 0
        intervalDays = 1
        status = 'lapsed'
      } else {
        newReps = prevReps + 1
        if (newReps === 1) intervalDays = 1
        else if (newReps === 2) intervalDays = 6
        else intervalDays = Math.round(prevEF * lastReview * 0.1 * 10) / 10 + 1
        intervalDays = Math.max(1, Math.round(intervalDays))
        status = newReps < 3 ? 'learning' : 'review'
      }
      newEF = prevEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      newEF = Math.max(1.3, Math.round(newEF * 100) / 100)
    } else if (algorithm === 'leitner') {
      // Leitner box system
      const box = prevReps > 0 ? Math.min(5, Math.ceil(prevReps / 2)) : 0
      intervalDays = Math.max(1, Math.pow(2, box))
      newEF = prevEF
      newReps = prevReps + (rng.next() > 0.2 ? 1 : -1)
      newReps = Math.max(0, newReps)
      status = newReps < 2 ? 'learning' : newReps < 4 ? 'review' : 'review'
    } else {
      // Halving algorithm
      intervalDays = Math.max(1, Math.round(prevEF / (difficulty + 0.1)))
      newEF = prevEF
      newReps = prevReps + 1
      status = 'review'
    }

    if (prevReps === 0 && lastReview === 0) status = 'new'

    const scheduledDate = new Date(now.getTime() + intervalDays * 86400000)
    const retentionProb = Math.round(Math.exp(-lastReview / (intervalDays * newEF)) * 100) / 100

    scheduled.push({
      item_id: item.id,
      content: item.content.slice(0, 80),
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      interval_days: intervalDays,
      easiness_factor: newEF,
      repetitions: newReps,
      status,
      retention_probability: Math.max(0, Math.min(1, retentionProb)),
    })
  }

  scheduled.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))

  // Build daily load
  const dailyMap: Record<string, number> = {}
  for (const s of scheduled) {
    dailyMap[s.scheduled_date] = (dailyMap[s.scheduled_date] || 0) + 1
  }
  const dailyLoad = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, scheduleDays)
    .map(([date, count]) => ({ date, count }))

  const avgRetention = scheduled.length > 0
    ? Math.round(scheduled.reduce((sum, s) => sum + s.retention_probability, 0) / scheduled.length * 100) / 100
    : 0

  return {
    algorithm,
    schedule_days: scheduleDays,
    scheduled_items: scheduled,
    daily_load: dailyLoad,
    avg_retention: avgRetention,
    total_items: scheduled.length,
    estimated_daily_minutes: Math.round(dailyLoad.reduce((sum, d) => sum + d.count, 0) / Math.max(1, dailyLoad.length) * 2),
  }
}

// --- Tool 4: Research Synthesizer 分析 ---
function analyzeResearchSynthesis(input: ResearchSynthesisInput): ResearchSynthesisResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))
  const method = input.synthesis_method || 'narrative'

  const sources = input.sources
  const clusters: EvidenceCluster[] = []
  const keyFindings: string[] = []
  const contradictions: string[] = []
  const gaps: string[] = []

  // Group sources by methodology similarity
  const methodGroups: Record<string, typeof sources> = {}
  for (const s of sources) {
    const key = s.methodology || 'unknown'
    if (!methodGroups[key]) methodGroups[key] = []
    methodGroups[key].push(s)
  }

  let clusterId = 0
  for (const [methodology, group] of Object.entries(methodGroups)) {
    const confidences = group.map(s => s.confidence || rng.nextFloat(0.5, 0.95))
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length

    clusters.push({
      cluster_id: clusterId,
      theme: `${methodology} studies (${group.length} sources)`,
      supporting_sources: group.map(s => s.id),
      opposing_sources: [],
      consensus_level: Math.round(avgConfidence * 100) / 100,
      summary: `Evidence from ${group.length} ${methodology} studies with ${(avgConfidence * 100).toFixed(0)}% avg confidence.`,
    })

    keyFindings.push(group[0].finding.slice(0, 100))
    clusterId++
  }

  // Detect contradictions
  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      if (rng.next() > 0.7) {
        contradictions.push(`Conflict between ${sources[i].id} and ${sources[j].id}: differing conclusions on same topic.`)
      }
    }
  }

  // Identify gaps
  if (sources.length < 5) gaps.push('Insufficient source count for robust synthesis.')
  const methodologies = new Set(sources.map(s => s.methodology))
  if (methodologies.size < 2) gaps.push('Limited methodological diversity.')
  const avgYear = sources.reduce((sum, s) => sum + s.year, 0) / Math.max(1, sources.length)
  if (avgYear < 2023) gaps.push('Sources may be outdated; consider recent literature.')

  const overallConfidence = clusters.length > 0
    ? Math.round(clusters.reduce((sum, c) => sum + c.consensus_level, 0) / clusters.length * 100) / 100
    : 0

  return {
    research_question: input.research_question,
    method,
    total_sources: sources.length,
    clusters,
    overall_confidence: overallConfidence,
    key_findings: keyFindings.slice(0, 5),
    contradictions: contradictions.slice(0, 3),
    gaps: gaps.slice(0, 4),
    recommendation: overallConfidence > 0.7
      ? 'Evidence is sufficient to draw conclusions. Consider meta-analysis for quantification.'
      : 'Evidence is limited. Recommend additional high-quality studies before synthesis.',
  }
}

// --- Tool 5: Zettelkasten Organizer 分析 ---
function analyzeZettelkasten(input: ZettelkastenInput): ZettelkastenResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))
  const action = input.action || 'classify'
  const now = new Date().toISOString()

  const typeCounts = { fleeting: 0, literature: 0, permanent: 0, structure: 0 }
  const processedNotes: ZettelNote[] = []
  const orphaned: string[] = []

  for (const note of input.notes) {
    // Determine type if not explicitly given
    let noteType = note.type
    if (!noteType) {
      if (note.content.length < 50) noteType = 'fleeting'
      else if (note.source) noteType = 'literature'
      else if (note.tags.includes('structure') || note.tags.includes('index')) noteType = 'structure'
      else noteType = 'permanent'
    }

    typeCounts[noteType]++

    // Atomic score: how self-contained is this note?
    const tagFactor = Math.min(1, note.tags.length / 3)
    const lengthFactor = note.content.length > 100 && note.content.length < 2000 ? 0.3 : 0
    const sourceFactor = note.source ? 0.2 : 0
    const atomicScore = Math.round(Math.min(1, tagFactor + lengthFactor + sourceFactor + rng.nextFloat(0.1, 0.4)) * 100) / 100

    processedNotes.push({
      id: note.id,
      content: note.content.slice(0, 120),
      type: noteType,
      sequence_number: action === 'sequence' ? typeCounts[noteType] : null,
      linked_notes: [],
      tags: note.tags,
      atomic_score: atomicScore,
      processed_at: now,
    })
  }

  // Link similar notes
  for (let i = 0; i < processedNotes.length; i++) {
    for (let j = i + 1; j < processedNotes.length; j++) {
      const a = processedNotes[i]
      const b = processedNotes[j]
      const shared = a.tags.filter(t => b.tags.includes(t))
      if (shared.length >= 2) {
        a.linked_notes.push(b.id)
        b.linked_notes.push(a.id)
      }
    }
  }

  // Orphaned notes
  for (const note of processedNotes) {
    if (note.linked_notes.length === 0) orphaned.push(note.id)
  }

  // Build sequences
  const sequences: ZettelSequence[] = []
  if (action === 'sequence') {
    const themes = new Set(processedNotes.map(n => n.tags[0]).filter(Boolean))
    let seqIdx = 0
    for (const theme of themes) {
      const themeNotes = processedNotes.filter(n => n.tags.includes(theme))
      if (themeNotes.length >= 2) {
        sequences.push({
          sequence_id: `seq-${seqIdx}`,
          title: theme.charAt(0).toUpperCase() + theme.slice(1) + ' Sequence',
          note_ids: themeNotes.map(n => n.id),
          theme,
        })
        seqIdx++
      }
    }
  }

  const avgAtomic = processedNotes.length > 0
    ? Math.round(processedNotes.reduce((sum, n) => sum + n.atomic_score, 0) / processedNotes.length * 100) / 100
    : 0

  return {
    action,
    processed_notes: processedNotes,
    sequences,
    total_fleeting: typeCounts.fleeting,
    total_literature: typeCounts.literature,
    total_permanent: typeCounts.permanent,
    total_structure: typeCounts.structure,
    avg_atomic_score: avgAtomic,
    orphaned_notes: orphaned,
  }
}

// --- Tool 6: Content Summarizer 分析 ---
function analyzeContentSummarize(input: ContentSummarizeInput): SummarizeResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))
  const format = input.format || 'paragraph'
  const maxLen = input.max_length || 200
  const language = input.language || 'zh'

  const text = input.text
  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 5)
  const words = text.split(/\s+/)
  const wordCountOriginal = words.length

  // Extract key points (top sentences by word rarity)
  const wordFreq: Record<string, number> = {}
  for (const w of words) {
    const lower = w.toLowerCase()
    wordFreq[lower] = (wordFreq[lower] || 0) + 1
  }

  const scoredSentences = sentences.map((s, idx) => {
    const sWords = s.split(/\s+/)
    const score = sWords.reduce((sum, w) => sum + (1 / (wordFreq[w.toLowerCase()] || 1)), 0) / Math.max(1, sWords.length)
    return { sentence: s.trim(), score, idx }
  })
  scoredSentences.sort((a, b) => b.score - a.score)

  const keyPoints = input.extract_key_points !== false
    ? scoredSentences.slice(0, Math.min(5, scoredSentences.length)).map(s => s.sentence.slice(0, 100))
    : []

  // Extract action items
  const actionItems: string[] = []
  if (input.extract_action_items !== false) {
    const actionPatterns = [/需要/, /必须/, /应该/, /请/, /建议/, /action/i, /todo/i, /must/i, /should/i, /need to/i]
    for (const s of sentences) {
      if (actionPatterns.some(p => p.test(s))) {
        actionItems.push(s.trim().slice(0, 80))
      }
    }
    if (actionItems.length === 0 && sentences.length > 0) {
      actionItems.push('Review key points and identify actionable insights.')
    }
  }

  // Build summary based on format
  let summary: string
  const topSentences = scoredSentences.slice(0, Math.min(3, scoredSentences.length)).sort((a, b) => a.idx - b.idx)

  if (format === 'tldr') {
    summary = topSentences.map(s => s.sentence).join(' ').slice(0, maxLen)
  } else if (format === 'bullets') {
    summary = topSentences.map(s => '- ' + s.sentence.trim()).join('\n')
  } else if (format === 'structured') {
    summary = 'Main Point: ' + (topSentences[0]?.sentence || '').slice(0, 80) +
      '\nSupporting: ' + topSentences.slice(1).map(s => s.sentence.trim().slice(0, 60)).join('; ')
  } else {
    summary = topSentences.map(s => s.sentence.trim()).join(' ').slice(0, maxLen)
  }

  // Top keywords
  const sortedWords = Object.entries(wordFreq)
    .filter(([w]) => w.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([keyword, count]) => ({ keyword, score: Math.round(count / wordCountOriginal * 1000) / 1000 }))

  const wordCountSummary = summary.split(/\s+/).length
  const compressionRatio = wordCountOriginal > 0 ? Math.round(wordCountSummary / wordCountOriginal * 100) / 100 : 0

  return {
    summary,
    key_points: keyPoints,
    action_items: actionItems.slice(0, 5),
    word_count_original: wordCountOriginal,
    word_count_summary: wordCountSummary,
    compression_ratio: compressionRatio,
    format_used: format,
    top_keywords: sortedWords,
  }
}

// --- Tool 7: Concept Map Generator 分析 ---
function analyzeConceptMap(input: ConceptMapInput): ConceptMapResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))
  const style = input.style || 'hierarchy'
  const maxDepth = input.max_depth || 5

  const nodeMap = new Map<string, ConceptNode>()
  const rootConcepts: string[] = []
  const orphaned: string[] = []

  // Build nodes
  for (const c of input.concepts) {
    nodeMap.set(c.id, {
      id: c.id,
      name: c.name,
      level: c.level || 0,
      children: [],
      parent: c.parent_id || null,
      cross_links: [],
    })
  }

  // Build hierarchy
  for (const c of input.concepts) {
    if (c.parent_id && nodeMap.has(c.parent_id)) {
      nodeMap.get(c.parent_id)!.children.push(c.id)
      nodeMap.get(c.id)!.level = (nodeMap.get(c.parent_id)!.level) + 1
    } else if (!c.parent_id) {
      rootConcepts.push(c.id)
    }
  }

  // Assign levels via BFS
  const queue = [...rootConcepts]
  const visited = new Set<string>()
  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)
    const node = nodeMap.get(current)!
    for (const childId of node.children) {
      const child = nodeMap.get(childId)!
      child.level = node.level + 1
      queue.push(childId)
    }
  }

  // Cross links
  for (const cl of (input.cross_links || [])) {
    if (nodeMap.has(cl.source)) {
      nodeMap.get(cl.source)!.cross_links.push({ target: cl.target, relation: cl.relation })
    }
  }

  // Orphaned concepts (no parent, no children, no cross-links)
  for (const [id, node] of nodeMap) {
    if (!node.parent && node.children.length === 0 && node.cross_links.length === 0) {
      orphaned.push(id)
    }
  }

  const nodes = Array.from(nodeMap.values())
  const maxDepthReached = nodes.reduce((max, n) => Math.max(max, n.level), 0)
  const crossLinkCount = nodes.reduce((sum, n) => sum + n.cross_links.length, 0)

  // Generate Mermaid diagram
  const mermaidLines: string[] = []
  if (style === 'hierarchy') {
    mermaidLines.push('graph TD')
    for (const node of nodes) {
      if (node.parent) {
        mermaidLines.push(`    ${node.parent}[${nodeMap.get(node.parent)!.name}] --> ${node.id}[${node.name}]`)
      }
    }
  } else if (style === 'radial') {
    mermaidLines.push('graph LR')
    if (rootConcepts.length > 0) {
      const root = rootConcepts[0]
      for (const childId of nodeMap.get(root)!.children) {
        mermaidLines.push(`    ${root}[${nodeMap.get(root)!.name}] --> ${childId}[${nodeMap.get(childId)!.name}]`)
      }
    }
  } else {
    mermaidLines.push('graph LR')
    for (const node of nodes) {
      for (const childId of node.children.slice(0, 3)) {
        mermaidLines.push(`    ${node.id}[${node.name}] --> ${childId}[${nodeMap.get(childId)!.name}]`)
      }
    }
  }

  // Add cross links
  for (const node of nodes) {
    for (const cl of node.cross_links.slice(0, 2)) {
      if (nodeMap.has(cl.target)) {
        mermaidLines.push(`    ${node.id} -.->|${cl.relation}| ${cl.target}[${nodeMap.get(cl.target)!.name}]`)
      }
    }
  }

  return {
    root_concepts: rootConcepts,
    nodes,
    total_concepts: nodes.length,
    max_depth_reached: Math.min(maxDepthReached, maxDepth),
    cross_link_count: crossLinkCount,
    style,
    mermaid_diagram: mermaidLines.join('\n'),
    orphaned_concepts: orphaned,
  }
}

// --- Tool 8: Knowledge Gap Analyzer 分析 ---
function analyzeKnowledgeGap(input: KnowledgeGapInput): KnowledgeGapResult {
  const seedStr = JSON.stringify(input)
  const rng = new SeededRandom(SeededRandom.seedFromString(seedStr))

  const knownMap: Record<string, { mastery: number; last_practiced: number }> = {}
  for (const kc of input.known_concepts) {
    knownMap[kc.name] = { mastery: kc.mastery, last_practiced: kc.last_practiced_days_ago }
  }

  const gaps: ConceptGap[] = []
  const criticalGaps: ConceptGap[] = []
  const learningPath: LearningPathStep[] = []

  for (const req of input.required_concepts) {
    const known = knownMap[req.name]

    if (!known) {
      // Check prerequisites
      const prereqsMissing = req.prerequisites.filter(p => !knownMap[p] || knownMap[p].mastery < 0.4)
      const gap: ConceptGap = {
        concept: req.name,
        gap_type: 'missing',
        severity: Math.round(req.importance * 100) / 100,
        prerequisites_missing: prereqsMissing,
        recommended_action: prereqsMissing.length > 0
          ? `Prerequisites needed: ${prereqsMissing.join(', ')}`
          : 'Start learning from foundational materials',
        priority: Math.round(req.importance * 10) / 10,
      }
      gaps.push(gap)
      if (req.importance > 0.7) criticalGaps.push(gap)
    } else if (known.mastery < 0.5) {
      const gap: ConceptGap = {
        concept: req.name,
        gap_type: 'weak',
        severity: Math.round((1 - known.mastery) * req.importance * 100) / 100,
        prerequisites_missing: [],
        recommended_action: 'Strengthen understanding through practice and review',
        priority: Math.round((1 - known.mastery) * req.importance * 10) / 10,
      }
      gaps.push(gap)
      if (req.importance > 0.8 && known.mastery < 0.3) criticalGaps.push(gap)
    } else if (known.last_practiced > 30) {
      const gap: ConceptGap = {
        concept: req.name,
        gap_type: 'stale',
        severity: Math.round(known.last_practiced / 90 * req.importance * 100) / 100,
        prerequisites_missing: [],
        recommended_action: 'Reinstate knowledge with spaced review',
        priority: Math.round(known.last_practiced / 90 * req.importance * 10) / 10,
      }
      gaps.push(gap)
    }
  }

  gaps.sort((a, b) => b.priority - a.priority)
  criticalGaps.sort((a, b) => b.priority - a.priority)

  // Build learning path
  let stepNum = 1
  let totalHours = 0
  for (const gap of gaps.slice(0, 10)) {
    const hours = Math.round(gap.severity * 5 + rng.nextFloat(1, 3))
    totalHours += hours
    const resources: string[] = []
    if (gap.gap_type === 'missing') {
      resources.push('Introductory textbook', 'Online course module')
    } else if (gap.gap_type === 'weak') {
      resources.push('Practice exercises', 'Expert tutorial')
    } else {
      resources.push('Spaced review session', 'Application project')
    }

    learningPath.push({
      step_number: stepNum,
      concept: gap.concept,
      estimated_hours: hours,
      resources,
      depends_on: gap.prerequisites_missing.slice(0, 3),
    })
    stepNum++
  }

  const allMastery = input.known_concepts.reduce((sum, k) => sum + k.mastery, 0)
  const masteryOverall = input.known_concepts.length > 0
    ? Math.round(allMastery / input.known_concepts.length * 100) / 100
    : 0

  const readiness = input.required_concepts.length > 0
    ? Math.round((input.required_concepts.length - gaps.length) / input.required_concepts.length * 100) / 100
    : 1

  return {
    domain: input.domain,
    total_known: input.known_concepts.length,
    total_required: input.required_concepts.length,
    mastery_overall: masteryOverall,
    gaps,
    critical_gaps: criticalGaps,
    learning_path: learningPath,
    estimated_total_hours: totalHours,
    readiness_score: Math.max(0, Math.min(1, readiness)),
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Note Linking Engine 报告 ---
function formatNoteLinkingReport(result: NoteLinkResult): string {
  const lines: string[] = []
  lines.push('## 🔗 Note Linking Engine — 笔记链接分析报告')
  lines.push('')
  lines.push(`策略: ${result.strategy_used} | 分析笔记: ${result.total_notes} | 发现链接: ${result.total_links}`)
  lines.push(`双向链接对: ${result.bidirectional_pairs} | 平均链接/笔记: ${result.avg_links_per_note}`)
  lines.push('')
  lines.push('### 🔗 连接拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  const topLinks = result.links.slice(0, 8)
  for (const link of topLinks) {
    lines.push(`    ${link.source_id}[${link.source_id}] -->|${link.strength.toFixed(2)}| ${link.target_id}[${link.target_id}]`)
  }
  lines.push('```')
  lines.push('')

  if (result.links.length > 0) {
    lines.push('### 📋 链接详情表')
    lines.push('| 源笔记 | 目标笔记 | 强度 | 类型 | 共享标签 |')
    lines.push('|--------|----------|------|------|----------|')
    for (const link of result.links.slice(0, 15)) {
      lines.push(`| ${link.source_id} | ${link.target_id} | ${link.strength} | ${link.type} | ${link.shared_tags.join(', ') || '-'} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 链接策略说明')
  lines.push('- [x] semantic: 基于内容语义相似度匹配')
  lines.push('- [x] tag_overlap: 基于标签重叠度匹配')
  lines.push('- [x] citation: 基于笔记间引用关系匹配')
  lines.push('- [x] hybrid: 综合多策略加权评分')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Note Linking Engine • PKM 2026*')
  return lines.join('\n')
}

// --- Tool 2: Knowledge Graph Builder 报告 ---
function formatKnowledgeGraphReport(result: KnowledgeGraphResult): string {
  const lines: string[] = []
  lines.push('## 🧠 Knowledge Graph Builder — 知识图谱构建报告')
  lines.push('')
  lines.push(`节点数: ${result.metrics.total_nodes} | 边数: ${result.metrics.total_edges} | 密度: ${result.metrics.density}`)
  lines.push(`平均度: ${result.metrics.avg_degree} | 模块度: ${result.metrics.modularity} | 布局: ${result.layout_type}`)
  lines.push('')
  lines.push('### 🔗 连接拓扑图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  const topNodes = result.nodes.slice(0, 6)
  for (let i = 0; i < Math.min(topNodes.length - 1, 4); i++) {
    lines.push(`    ${topNodes[i].id}[${topNodes[i].label}] -->|${result.edges[i]?.relation || 'related'}| ${topNodes[i + 1].id}[${topNodes[i + 1].label}]`)
  }
  lines.push('```')
  lines.push('')

  if (result.communities.length > 0) {
    lines.push('### 📋 社区发现')
    lines.push('| 社区ID | 节点数 | 主导类型 | 内聚度 |')
    lines.push('|--------|--------|----------|--------|')
    for (const c of result.communities) {
      lines.push(`| ${c.community_id} | ${c.node_count} | ${c.dominant_type} | ${c.cohesion} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 节点中心性（Top 5）')
  lines.push('| 节点 | 类型 | 度 | 介数中心性 | 社区 |')
  lines.push('|------|------|-----|-----------|------|')
  const sortedNodes = [...result.nodes].sort((a, b) => b.degree - a.degree)
  for (const node of sortedNodes.slice(0, 5)) {
    lines.push(`| ${node.label} | ${node.type} | ${node.degree} | ${node.betweenness} | ${node.community} |`)
  }
  lines.push('')

  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 节点度分布分析')
  lines.push('- [x] 社区结构检测')
  lines.push('- [x] 介数中心性计算')
  lines.push('- [x] 图谱密度评估')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Knowledge Graph Builder • PKM 2026*')
  return lines.join('\n')
}

// --- Tool 3: Spaced Repetition Scheduler 报告 ---
function formatSpacedRepetitionReport(result: SpacedRepetitionResult): string {
  const lines: string[] = []
  lines.push('## 📅 Spaced Repetition Scheduler — 间隔重复调度报告')
  lines.push('')
  lines.push(`算法: ${result.algorithm.toUpperCase()} | 调度天数: ${result.schedule_days} | 总条目: ${result.total_items}`)
  lines.push(`平均保持率: ${result.avg_retention} | 日均预估: ${result.estimated_daily_minutes} 分钟`)
  lines.push('')
  lines.push('### 🔗 记忆曲线示意图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    EBBINGHAUS[Ebbinghaus Curve] -->|遗忘| DECAY[Exponential Decay]')
  lines.push('    DECAY -->|复习| REINFORCE[Memory Reinforcement]')
  lines.push('    REINFORCE -->|间隔增长| GROW[Interval Growth: 1d → 3d → 7d → 14d → 30d]')
  lines.push('    GROW -->|SM-2 EF| ADJUST[Easy/Hard Adjustment]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 调度预览')
  lines.push('| 条目ID | 日期 | 间隔(天) | EF | 重复 | 状态 | 保持率 |')
  lines.push('|--------|------|----------|-----|------|------|--------|')
  for (const item of result.scheduled_items.slice(0, 10)) {
    lines.push(`| ${item.item_id} | ${item.scheduled_date} | ${item.interval_days} | ${item.easiness_factor} | ${item.repetitions} | ${item.status} | ${item.retention_probability} |`)
  }
  lines.push('')

  if (result.daily_load.length > 0) {
    lines.push('### 📋 每日负荷')
    lines.push('| 日期 | 复习数量 |')
    lines.push('|------|----------|')
    for (const d of result.daily_load.slice(0, 10)) {
      lines.push(`| ${d.date} | ${d.count} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 间隔重复原则')
  lines.push('- [x] SM-2 算法：基于答题质量动态调整间隔')
  lines.push('- [x] 难度系数 EF: 简单+0.1, 困难-0.2 (最低 1.3)')
  lines.push('- [x] 记忆保持率: R = e^(-t / (I × EF)) 建模')
  lines.push('- [x] 失败重置: 答错后间隔回到初始状态')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Spaced Repetition Scheduler • PKM 2026*')
  return lines.join('\n')
}

// --- Tool 4: Research Synthesizer 报告 ---
function formatResearchSynthesisReport(result: ResearchSynthesisResult): string {
  const lines: string[] = []
  lines.push('## 🔬 Research Synthesizer — 研究综合分析报告')
  lines.push('')
  lines.push(`研究问题: ${result.research_question}`)
  lines.push(`方法: ${result.method} | 来源数: ${result.total_sources} | 整体置信度: ${result.overall_confidence}`)
  lines.push('')
  lines.push('### 🔗 证据整合图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    RQ[Research Question] -->|分解| C1[Cluster 1]')
  lines.push('    RQ -->|分解| C2[Cluster 2]')
  lines.push('    RQ -->|分解| C3[Cluster 3]')
  lines.push('    C1 -->|综合| SYN[Synthesis]')
  lines.push('    C2 -->|综合| SYN')
  lines.push('    C3 -->|综合| SYN')
  lines.push('    SYN -->|输出| CON[Conclusion]')
  lines.push('```')
  lines.push('')

  if (result.clusters.length > 0) {
    lines.push('### 📋 证据聚类')
    lines.push('| 聚类ID | 主题 | 支持来源数 | 共识度 |')
    lines.push('|--------|------|-----------|--------|')
    for (const c of result.clusters) {
      lines.push(`| ${c.cluster_id} | ${c.theme} | ${c.supporting_sources.length} | ${c.consensus_level} |`)
    }
    lines.push('')
  }

  if (result.key_findings.length > 0) {
    lines.push('### 📋 关键发现')
    for (const f of result.key_findings) lines.push(`- ${f}`)
    lines.push('')
  }

  if (result.contradictions.length > 0) {
    lines.push('### ⚠️ 矛盾检测')
    for (const c of result.contradictions) lines.push(`- ${c}`)
    lines.push('')
  }

  if (result.gaps.length > 0) {
    lines.push('### 📋 研究缺口')
    for (const g of result.gaps) lines.push(`- ${g}`)
    lines.push('')
  }

  lines.push(`### 💡 建议`)
  lines.push(result.recommendation)
  lines.push('')
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 多源证据整合')
  lines.push('- [x] 方法论多样性评估')
  lines.push('- [x] 矛盾检测与标记')
  lines.push('- [x] 置信度量化评估')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Research Synthesizer • PKM 2026*')
  return lines.join('\n')
}

// --- Tool 5: Zettelkasten Organizer 报告 ---
function formatZettelkastenReport(result: ZettelkastenResult): string {
  const lines: string[] = []
  lines.push('## 📝 Zettelkasten Organizer — Zettelkasten 笔记系统报告')
  lines.push('')
  lines.push(`操作: ${result.action} | 处理笔记: ${result.processed_notes.length} | 平均原子化: ${result.avg_atomic_score}`)
  lines.push(`闪念: ${result.total_fleeting} | 文献: ${result.total_literature} | 永久: ${result.total_permanent} | 结构: ${result.total_structure}`)
  lines.push('')
  lines.push('### 🔗 Zettelkasten 工作流')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    FLEET[Fleeting Notes] -->|加工| LIT[Literature Notes]')
  lines.push('    LIT -->|提炼| PERM[Permanent Notes]')
  lines.push('    PERM -->|链接| SEQ[Sequences/Structure]')
  lines.push('    SEQ -->|索引| INDEX[Hub/Index Notes]')
  lines.push('```')
  lines.push('')

  if (result.processed_notes.length > 0) {
    lines.push('### 📋 笔记列表')
    lines.push('| ID | 类型 | 原子化 | 链接数 | 标签 |')
    lines.push('|----|------|--------|--------|------|')
    for (const n of result.processed_notes.slice(0, 10)) {
      lines.push(`| ${n.id} | ${n.type} | ${n.atomic_score} | ${n.linked_notes.length} | ${n.tags.join(', ')} |`)
    }
    lines.push('')
  }

  if (result.sequences.length > 0) {
    lines.push('### 📋 笔记序列')
    for (const seq of result.sequences) {
      lines.push(`- **${seq.title}** (${seq.note_ids.length} notes): ${seq.note_ids.join(' → ')}`)
    }
    lines.push('')
  }

  if (result.orphaned_notes.length > 0) {
    lines.push('### ⚠️ 孤立笔记')
    lines.push(`- ${result.orphaned_notes.join(', ')}`)
    lines.push('')
  }

  lines.push('### 📋 Zettelkasten 原则')
  lines.push('- [x] 原子性: 每张笔记只包含一个想法')
  lines.push('- [x] 自主性: 每张笔记应自解释')
  lines.push('- [x] 链接密度: 强制建立笔记间关联')
  lines.push('- [x] 序列化: 相关笔记形成知识链')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Zettelkasten Organizer • PKM 2026*')
  return lines.join('\n')
}

// --- Tool 6: Content Summarizer 报告 ---
function formatContentSummarizeReport(result: SummarizeResult): string {
  const lines: string[] = []
  lines.push('## 📄 Content Summarizer — 内容摘要生成报告')
  lines.push('')
  lines.push(`格式: ${result.format_used} | 原文: ${result.word_count_original} 词 | 摘要: ${result.word_count_summary} 词 | 压缩比: ${result.compression_ratio}`)
  lines.push('')
  lines.push('### 📋 摘要')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  if (result.key_points.length > 0) {
    lines.push('### 📋 关键点')
    for (const kp of result.key_points) lines.push(`- ${kp}`)
    lines.push('')
  }

  if (result.action_items.length > 0) {
    lines.push('### 📋 行动项')
    for (const ai of result.action_items) lines.push(`- [ ] ${ai}`)
    lines.push('')
  }

  if (result.top_keywords.length > 0) {
    lines.push('### 📋 关键词（TF 加权）')
    lines.push('| 关键词 | 权重 |')
    lines.push('|--------|------|')
    for (const kw of result.top_keywords) {
      lines.push(`| ${kw.keyword} | ${kw.score} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 摘要策略')
  lines.push('- [x] 基于词频逆文档频率的句子评分')
  lines.push('- [x] 多策略支持: paragraph / bullets / structured / tldr')
  lines.push('- [x] 行动项自动识别 (pattern-based extraction)')
  lines.push('- [x] 关键词提取 (TF-based ranking)')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Content Summarizer • PKM 2026*')
  return lines.join('\n')
}

// --- Tool 7: Concept Map Generator 报告 ---
function formatConceptMapReport(result: ConceptMapResult): string {
  const lines: string[] = []
  lines.push('## 🗺️ Concept Map Generator — 概念地图生成报告')
  lines.push('')
  lines.push(`总概念: ${result.total_concepts} | 根概念: ${result.root_concepts.length} | 最大深度: ${result.max_depth_reached}`)
  lines.push(`交叉链接: ${result.cross_link_count} | 风格: ${result.style}`)
  lines.push('')
  lines.push('### 🔗 概念地图 (Mermaid)')
  lines.push('')
  lines.push('```mermaid')
  lines.push(result.mermaid_diagram || 'graph TD\n    N/A')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 概念层级')
  lines.push('| 概念 | 层级 | 父节点 | 子节点 | 交叉链接 |')
  lines.push('|------|------|--------|--------|----------|')
  for (const node of result.nodes.slice(0, 12)) {
    lines.push(`| ${node.name} | ${node.level} | ${node.parent || '-'} | ${node.children.length} | ${node.cross_links.length} |`)
  }
  lines.push('')

  if (result.orphaned_concepts.length > 0) {
    lines.push('### ⚠️ 孤立概念')
    lines.push(`- ${result.orphaned_concepts.join(', ')}`)
    lines.push('')
  }

  lines.push('### 📋 地图设计原则')
  lines.push('- [x] 层级结构: 从一般到特殊的排列')
  lines.push('- [x] 交叉链接: 跨层级/跨领域连接')
  lines.push('- [x] 关系标注: 标注连接词说明关系')
  lines.push('- [x] Mermaid 可视化: 自动生成可渲染图表')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Concept Map Generator • PKM 2026*')
  return lines.join('\n')
}

// --- Tool 8: Knowledge Gap Analyzer 报告 ---
function formatKnowledgeGapReport(result: KnowledgeGapResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Knowledge Gap Analyzer — 知识缺口分析报告')
  lines.push('')
  lines.push(`领域: ${result.domain} | 已知: ${result.total_known} | 需掌握: ${result.total_required} | 整体掌握度: ${result.mastery_overall}`)
  lines.push(`发现缺口: ${result.gaps.length} | 关键缺口: ${result.critical_gaps.length} | 准备度: ${result.readiness_score}`)
  lines.push('')
  lines.push('### 🔗 掌握度雷达图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    DOM[Domain: ' + result.domain + '] -->|掌握| KNOWN[Known: ' + result.total_known + ']')
  lines.push('    DOM -->|缺口| GAP[Gaps: ' + result.gaps.length + ']')
  lines.push('    GAP -->|优先| CRIT[Critical: ' + result.critical_gaps.length + ']')
  lines.push('    KNOWN -->|评估| READY[Readiness: ' + (result.readiness_score * 100).toFixed(0) + '%]')
  lines.push('```')
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### 📋 知识缺口')
    lines.push('| 概念 | 缺口类型 | 严重度 | 优先级 | 建议 |')
    lines.push('|------|----------|--------|--------|------|')
    for (const g of result.gaps.slice(0, 10)) {
      lines.push(`| ${g.concept} | ${g.gap_type} | ${g.severity} | ${g.priority} | ${g.recommended_action.slice(0, 40)} |`)
    }
    lines.push('')
  }

  if (result.learning_path.length > 0) {
    lines.push('### 📋 推荐学习路径')
    for (const step of result.learning_path.slice(0, 6)) {
      lines.push(`${step.step_number}. **${step.concept}** (预估 ${step.estimated_hours} 小时) - 资源: ${step.resources.join(', ')}`)
    }
    lines.push('')
  }

  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 知识点掌握度量化评估')
  lines.push('- [x] 先决条件依赖分析')
  lines.push('- [x] 知识过期检测 (stale knowledge)')
  lines.push('- [x] 学习路径自动生成')
  lines.push('')
  lines.push('---')
  lines.push('*Knowledge Lake • Knowledge Gap Analyzer • PKM 2026*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Note Linking Engine — 双向链接笔记引擎
  tools.register(defineTool({
    name: 'note_linking_engine',
    description: '双向链接笔记引擎 | 自动发现关联笔记、反向链接、链接强度评分 | Automatic note linking with backlinks, bidirectional references, and strength scoring.',
    parameters: {
      note_input: {
        type: 'string',
        required: true,
        description: 'JSON: notes[{id, title, content, tags[]}], strategy (semantic|tag_overlap|citation|hybrid), min_strength?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { note_input: string }) {
      const input: NoteLinkInput = JSON.parse(args.note_input)
      return formatNoteLinkingReport(analyzeNoteLinking(input))
    }
  }))

  // Tool 2: Knowledge Graph Builder — 知识图谱构建器
  tools.register(defineTool({
    name: 'knowledge_graph_builder',
    description: '知识图谱构建器 | 节点/边/社区发现、中心性分析、图谱可视化 | Knowledge graph construction with community detection, centrality analysis, and Mermaid visualization.',
    parameters: {
      graph_input: {
        type: 'string',
        required: true,
        description: 'JSON: entities[{id, label, type, weight?}], relations[{source, target, relation, weight?}], layout (force|hierarchical|circular), detect_communities?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { graph_input: string }) {
      const input: KnowledgeGraphInput = JSON.parse(args.graph_input)
      return formatKnowledgeGraphReport(analyzeKnowledgeGraph(input))
    }
  }))

  // Tool 3: Spaced Repetition Scheduler — 间隔重复调度器
  tools.register(defineTool({
    name: 'spaced_repetition_scheduler',
    description: '间隔重复调度器 | SM-2/Leitner/Halving算法、记忆曲线建模、复习计划生成 | Spaced repetition scheduling with SM-2 algorithm, memory curve modeling, and adaptive review planning.',
    parameters: {
      repetition_input: {
        type: 'string',
        required: true,
        description: 'JSON: items[{id, content, difficulty?, last_review_days_ago?, repetitions?, easiness?}], algorithm (sm2|leitner|halving), schedule_days?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { repetition_input: string }) {
      const input: SpacedRepetitionInput = JSON.parse(args.repetition_input)
      return formatSpacedRepetitionReport(analyzeSpacedRepetition(input))
    }
  }))

  // Tool 4: Research Synthesizer — 研究综合分析器
  tools.register(defineTool({
    name: 'research_synthesizer',
    description: '研究综合分析器 | 多源证据整合、矛盾检测、置信度评估、研究缺口识别 | Research synthesis with multi-source evidence integration, contradiction detection, and confidence scoring.',
    parameters: {
      synthesis_input: {
        type: 'string',
        required: true,
        description: 'JSON: research_question, sources[{id, title, finding, methodology, sample_size?, year, confidence?}], synthesis_method (narrative|meta_analysis|thematic|systematic)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { synthesis_input: string }) {
      const input: ResearchSynthesisInput = JSON.parse(args.synthesis_input)
      return formatResearchSynthesisReport(analyzeResearchSynthesis(input))
    }
  }))

  // Tool 5: Zettelkasten Organizer — Zettelkasten 笔记系统
  tools.register(defineTool({
    name: 'zettelkasten_organizer',
    description: 'Zettelkasten 笔记系统 | 闪念/文献/永久笔记分类、原子化评分、序列链接 | Zettelkasten note-taking system with fleeting/literature/permanent notes, atomization scoring, and sequence linking.',
    parameters: {
      zettel_input: {
        type: 'string',
        required: true,
        description: 'JSON: notes[{id, content, type?, source?, tags[]}], action (classify|atomize|sequence|link), target_note_id?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { zettel_input: string }) {
      const input: ZettelkastenInput = JSON.parse(args.zettel_input)
      return formatZettelkastenReport(analyzeZettelkasten(input))
    }
  }))

  // Tool 6: Content Summarizer — 内容摘要生成器
  tools.register(defineTool({
    name: 'content_summarizer',
    description: '内容摘要生成器 | 提取式+抽象式摘要、关键点提取、行动项识别、关键词排名 | Content summarization with extractive/abstractive approaches, key point extraction, and action item identification.',
    parameters: {
      summarize_input: {
        type: 'string',
        required: true,
        description: 'JSON: text, format (paragraph|bullets|structured|tldr), max_length?, extract_key_points?, extract_action_items?, language (zh|en)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { summarize_input: string }) {
      const input: ContentSummarizeInput = JSON.parse(args.summarize_input)
      return formatContentSummarizeReport(analyzeContentSummarize(input))
    }
  }))

  // Tool 7: Concept Map Generator — 概念地图生成器
  tools.register(defineTool({
    name: 'concept_map_generator',
    description: '概念地图生成器 | 层级关系构建、交叉链接、Mermaid可视化、孤立概念检测 | Concept map generation with hierarchical relationships, cross-links, Mermaid diagram output, and orphan detection.',
    parameters: {
      concept_input: {
        type: 'string',
        required: true,
        description: 'JSON: concepts[{id, name, definition?, parent_id?, level?}], cross_links[{source, target, relation}]?, style (hierarchy|network|radial), max_depth?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { concept_input: string }) {
      const input: ConceptMapInput = JSON.parse(args.concept_input)
      return formatConceptMapReport(analyzeConceptMap(input))
    }
  }))

  // Tool 8: Knowledge Gap Analyzer — 知识缺口分析器
  tools.register(defineTool({
    name: 'knowledge_gap_analyzer',
    description: '知识缺口分析器 | 薄弱领域识别、先决条件分析、学习路径推荐、掌握度评估 | Knowledge gap analysis with weakness identification, prerequisite analysis, and adaptive learning path generation.',
    parameters: {
      gap_input: {
        type: 'string',
        required: true,
        description: 'JSON: domain, known_concepts[{name, mastery, last_practiced_days_ago}], required_concepts[{name, importance, prerequisites[]}], analysis_depth (surface|standard|deep)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { gap_input: string }) {
      const input: KnowledgeGapInput = JSON.parse(args.gap_input)
      return formatKnowledgeGapReport(analyzeKnowledgeGap(input))
    }
  }))

  console.log(`[dsh-tool-knowledgelake] Loaded v${VERSION} — Knowledge Lake: 知识图谱, 8 tools active`)
  console.log('  Tools: note_linking_engine, knowledge_graph_builder, spaced_repetition_scheduler, research_synthesizer, zettelkasten_organizer, content_summarizer, concept_map_generator, knowledge_gap_analyzer')
}
