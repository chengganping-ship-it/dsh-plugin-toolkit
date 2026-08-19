import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ==================== Plugin Metadata ====================

export const name = 'dsh-tool-memlink'
export const inject = ['tools']

// ==================== Type Definitions ====================

interface MemoryEntry {
  id: string
  content: string
  tags: string[]
  sourceTool: string
  importance: 'high' | 'medium' | 'low'
  context?: string
  relatedIds: string[]
  createdAt: number
  updatedAt: number
  ttlHours: number
  accessCount: number
  lastAccessed: number
  compressed: boolean
  compressedFrom?: string[]
}

interface MemoryInput {
  content: string
  tags: string[]
  source_tool: string
  importance: 'high' | 'medium' | 'low'
  context?: string
  related_ids?: string[]
  ttl_hours?: number
}

interface StoreResult {
  id: string
  entry: MemoryEntry
  linkedMemories: LinkSuggestion[]
  warnings: string[]
}

interface LinkSuggestion {
  memoryId: string
  score: number
  reason: string
}

interface RecallQuery {
  query?: string
  tags?: string[]
  source_tool?: string
  importance?: 'high' | 'medium' | 'low'
  time_start?: string
  time_end?: string
  limit?: number
  decay_weight?: number
  importance_weight?: number
}

interface RecallResult {
  matches: RecallMatch[]
  totalCandidates: number
  appliedFilters: string[]
  searchMetadata: SearchMetadata
}

interface RecallMatch {
  memory: MemoryEntry
  relevanceScore: number
  decayFactor: number
  importanceScore: number
  matchReasons: string[]
}

interface SearchMetadata {
  semanticTerms: string[]
  timeRangeApplied: boolean
  decayModel: string
}

interface LinkAnalysisInput {
  memory_ids?: string[]
  auto_discover?: boolean
  min_similarity?: number
}

interface LinkAnalysisResult {
  links: MemoryLink[]
  graphStats: GraphStats
  communities: string[][]
  recommendations: string[]
}

interface MemoryLink {
  sourceId: string
  targetId: string
  strength: number
  type: 'tag_overlap' | 'temporal' | 'content_similarity' | 'explicit'
  sharedElements: string[]
}

interface GraphStats {
  totalNodes: number
  totalEdges: number
  avgDegree: number
  density: number
}

interface DecayResult {
  analyses: DecayEntry[]
  summary: DecaySummary
  recommendations: string[]
}

interface DecayEntry {
  memoryId: string
  content: string
  age: number
  halfLife: number
  remainingLife: number
  status: 'fresh' | 'aging' | 'stale' | 'expired'
  accessDecayFactor: number
  recommendation: string
}

interface DecaySummary {
  totalMemories: number
  freshCount: number
  agingCount: number
  staleCount: number
  expiredCount: number
  avgHalfLife: number
  medianAge: number
}

interface ConflictInput {
  topic?: string
  tags?: string[]
  threshold?: number
}

interface ConflictResult {
  conflicts: ConflictGroup[]
  totalConflicts: number
  resolutionSummary: string
}

interface ConflictGroup {
  topic: string
  memories: string[]
  conflictType: 'direct_contradiction' | 'partial_overlap' | 'temporal_drift'
  severity: 'critical' | 'warning' | 'info'
  resolution: string
  suggestedAction: 'merge' | 'archive_oldest' | 'keep_both' | 'manual_review'
}

interface CompressionInput {
  memory_ids?: string[]
  tags?: string[]
  target_count?: number
  strategy?: 'merge_similar' | 'summarize_cluster' | 'hierarchical'
}

interface CompressionResult {
  compressed: CompressedMemory[]
  originalCount: number
  compressionRatio: number
  tokensSaved: number
  details: string[]
}

interface CompressedMemory {
  id: string
  summary: string
  sourceIds: string[]
  tags: string[]
  importance: 'high' | 'medium' | 'low'
  compressionMethod: string
}

interface GraphInput {
  memory_ids?: string[]
  min_link_strength?: number
  algorithm?: 'default' | 'louvain' | 'connected_components'
}

interface GraphResult {
  nodes: GraphNode[]
  edges: GraphEdge[]
  communities: Community[]
  centralNodes: CentralNode[]
  metrics: GraphMetrics
}

interface GraphNode {
  id: string
  label: string
  importance: 'high' | 'medium' | 'low'
  degree: number
  communityId: number
}

interface GraphEdge {
  source: string
  target: string
  weight: number
  type: string
}

interface Community {
  id: number
  members: string[]
  cohesion: number
  dominantTags: string[]
}

interface CentralNode {
  id: string
  label: string
  centrality: number
  connections: number
  role: 'hub' | 'bridge' | 'peripheral'
}

interface GraphMetrics {
  totalNodes: number
  totalEdges: number
  avgClustering: number
  modularity: number
  communityCount: number
}

interface AuditResult {
  coverage: CoverageMetrics
  duplication: DuplicationMetrics
  conflicts: ConflictMetrics
  decay: DecayHealthMetrics
  links: LinkMetrics
  overallScore: number
  grade: string
  recommendations: string[]
}

interface CoverageMetrics {
  totalMemories: number
  uniqueTags: number
  sourceTools: string[]
  tagCoverage: number
  timeSpan: number
}

interface DuplicationMetrics {
  duplicatePairs: number
  redundancyRate: number
  similarClusters: number
  actionable: string[]
}

interface ConflictMetrics {
  activeConflicts: number
  conflictRate: number
  resolvedCount: number
  topConflictTopics: string[]
}

interface DecayHealthMetrics {
  healthyRatio: number
  avgFreshness: number
  expiredRatio: number
  needsAttention: number
}

interface LinkMetrics {
  totalLinks: number
  avgLinksPerMemory: number
  isolatedCount: number
  linkDensity: number
}

// ==================== In-Memory Store ====================

const memoryStore: Map<string, MemoryEntry> = new Map()
let idCounter = 0

function generateId(): string {
  idCounter++
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 7)
  return 'mem_' + ts + '_' + idCounter.toString(36) + '_' + rand
}

// ==================== Plugin Entry Point ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: memory_store
  tools.register(defineTool({
    name: 'memory_store',
    description: 'Store a structured memory entry with metadata, tags, source tool, and importance level. Supports automatic linking to related memories.',
    parameters: {
      memory_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: content (string), tags (string[]), source_tool (string), importance ("high"|"medium"|"low"), context (optional string), related_ids (optional string[]), ttl_hours (optional number, 0=never expire)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { memory_data: string }) {
      const data = JSON.parse(args.memory_data) as MemoryInput
      const result = storeMemory(data)
      return formatStoreResult(result)
    }
  }))

  // Tool 2: memory_recall
  tools.register(defineTool({
    name: 'memory_recall',
    description: 'Intelligent memory recall with semantic search, time decay, importance weighting, and source tool filtering.',
    parameters: {
      query_data: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: query (optional string), tags (optional string[]), source_tool (optional string), importance (optional "high"|"medium"|"low"), time_start (optional ISO date), time_end (optional ISO date), limit (optional number), decay_weight (optional number), importance_weight (optional number)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query_data: string }) {
      const query = JSON.parse(args.query_data) as RecallQuery
      const result = recallMemories(query)
      return formatRecallResult(result)
    }
  }))

  // Tool 3: memory_link
  tools.register(defineTool({
    name: 'memory_link',
    description: 'Cross-tool memory linking: analyze associations between memories via shared tags, temporal proximity, content similarity.',
    parameters: {
      link_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: memory_ids (optional string[]), auto_discover (optional boolean, default true), min_similarity (optional number 0-1, default 0.3)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { link_input: string }) {
      const input = JSON.parse(args.link_input) as LinkAnalysisInput
      const result = analyzeLinks(input)
      return formatLinkResult(result)
    }
  }))

  // Tool 4: memory_decay_analysis
  tools.register(defineTool({
    name: 'memory_decay_analysis',
    description: 'Analyze memory lifecycle: calculate half-life, flag expired memories, suggest archival or deletion.',
    parameters: {
      target_data: {
        type: 'string',
        description: 'JSON object with fields: memory_ids (optional string[]), tag_filter (optional string[]). If omitted, analyzes all memories.'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { target_data?: string }) {
      const input = args.target_data ? JSON.parse(args.target_data) : {}
      const result = analyzeDecay(input)
      return formatDecayResult(result)
    }
  }))

  // Tool 5: memory_conflict_detect
  tools.register(defineTool({
    name: 'memory_conflict_detect',
    description: 'Detect contradictory memory entries and provide resolution recommendations.',
    parameters: {
      conflict_input: {
        type: 'string',
        description: 'JSON object with fields: topic (optional string), tags (optional string[]), threshold (optional number 0-1, default 0.5). If omitted, scans all memories.'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { conflict_input?: string }) {
      const input = args.conflict_input ? JSON.parse(args.conflict_input) as ConflictInput : {}
      const result = detectConflicts(input)
      return formatConflictResult(result)
    }
  }))

  // Tool 6: memory_compression
  tools.register(defineTool({
    name: 'memory_compression',
    description: 'Merge related memories into high-value summaries to reduce token usage while preserving key information.',
    parameters: {
      compression_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: memory_ids (optional string[]), tags (optional string[]), target_count (optional number), strategy (optional "merge_similar"|"summarize_cluster"|"hierarchical")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { compression_input: string }) {
      const input = JSON.parse(args.compression_input) as CompressionInput
      const result = compressMemories(input)
      return formatCompressionResult(result)
    }
  }))

  // Tool 7: memory_graph_build
  tools.register(defineTool({
    name: 'memory_graph_build',
    description: 'Build node-edge graph structure of memories. Supports community discovery and centrality analysis.',
    parameters: {
      graph_input: {
        type: 'string',
        description: 'JSON object with fields: memory_ids (optional string[]), min_link_strength (optional number 0-1, default 0.2), algorithm (optional "default"|"louvain"|"connected_components"). If omitted, builds full graph.'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { graph_input?: string }) {
      const input = args.graph_input ? JSON.parse(args.graph_input) as GraphInput : {}
      const result = buildGraph(input)
      return formatGraphResult(result)
    }
  }))

  // Tool 8: memory_audit_report
  tools.register(defineTool({
    name: 'memory_audit_report',
    description: 'Generate comprehensive memory system health report with coverage, duplication, conflict rate, decay status, link density metrics.',
    parameters: {
      scope: {
        type: 'string',
        description: 'JSON object with fields: source_tool (optional string), tag_filter (optional string[]). If omitted, audits all memories.'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { scope?: string }) {
      const input = args.scope ? JSON.parse(args.scope) : {}
      const result = generateAuditReport(input)
      return formatAuditResult(result)
    }
  }))
}

// ==================== Analysis Functions ====================

function storeMemory(data: MemoryInput): StoreResult {
  const id = generateId()
  const now = Date.now()

  const warnings: string[] = []
  if (!data.content || data.content.trim().length === 0) {
    warnings.push('Memory content is empty')
  }
  if (!data.tags || data.tags.length === 0) {
    warnings.push('No tags provided - recall accuracy may be reduced')
  }
  if (!data.source_tool) {
    warnings.push('No source_tool specified - cross-tool linking disabled for this entry')
  }

  const entry: MemoryEntry = {
    id,
    content: data.content,
    tags: data.tags || [],
    sourceTool: data.source_tool || 'unknown',
    importance: data.importance || 'medium',
    context: data.context,
    relatedIds: data.related_ids || [],
    createdAt: now,
    updatedAt: now,
    ttlHours: data.ttl_hours ?? 0,
    accessCount: 0,
    lastAccessed: now,
    compressed: false
  }

  memoryStore.set(id, entry)

  const linkedMemories = discoverAndLink(entry)
  return { id, entry, linkedMemories, warnings }
}

function discoverAndLink(entry: MemoryEntry): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = []
  const allMemories = Array.from(memoryStore.values())

  for (const existing of allMemories) {
    if (existing.id === entry.id) continue

    let score = 0
    const reasons: string[] = []

    const sharedTags = entry.tags.filter(t => existing.tags.includes(t))
    if (sharedTags.length > 0) {
      score += sharedTags.length * 0.2
      reasons.push('shared tags: ' + sharedTags.join(', '))
    }

    const timeDiff = Math.abs(entry.createdAt - existing.createdAt)
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    if (hoursDiff < 1) {
      score += 0.3
      reasons.push('created within same hour')
    } else if (hoursDiff < 24) {
      score += 0.15
      reasons.push('created within same day')
    }

    if (existing.sourceTool !== entry.sourceTool && existing.sourceTool !== 'unknown') {
      score += 0.1
      reasons.push('cross-tool link: ' + existing.sourceTool)
    }

    const contentWords = new Set(entry.content.toLowerCase().split(/\s+/))
    const existingWords = existing.content.toLowerCase().split(/\s+/)
    const wordOverlap = existingWords.filter(w => contentWords.has(w)).length
    if (wordOverlap > 0) {
      const overlapScore = Math.min(wordOverlap * 0.05, 0.3)
      score += overlapScore
      reasons.push(wordOverlap + ' content word overlaps')
    }

    if (entry.relatedIds && entry.relatedIds.includes(existing.id)) {
      score += 0.5
      reasons.push('explicit relation specified')
    }

    if (score >= 0.2) {
      suggestions.push({
        memoryId: existing.id,
        score: Math.min(score, 1.0),
        reason: reasons.join('; ')
      })
    }
  }

  suggestions.sort((a, b) => b.score - a.score)
  return suggestions.slice(0, 5)
}

function recallMemories(query: RecallQuery): RecallResult {
  const allMemories = Array.from(memoryStore.values())
  const filters: string[] = []
  const now = Date.now()
  const decayWeight = query.decay_weight ?? 0.5
  const importanceWeight = query.importance_weight ?? 0.3
  const limit = query.limit ?? 20

  let candidates = allMemories.filter(m => !m.compressed)

  if (query.source_tool) {
    candidates = candidates.filter(m => m.sourceTool === query.source_tool)
    filters.push('source_tool=' + query.source_tool)
  }

  if (query.importance) {
    candidates = candidates.filter(m => m.importance === query.importance)
    filters.push('importance=' + query.importance)
  }

  if (query.time_start) {
    const startTs = new Date(query.time_start).getTime()
    candidates = candidates.filter(m => m.createdAt >= startTs)
    filters.push('time_start=' + query.time_start)
  }

  if (query.time_end) {
    const endTs = new Date(query.time_end).getTime()
    candidates = candidates.filter(m => m.createdAt <= endTs)
    filters.push('time_end=' + query.time_end)
  }

  const semanticTerms = query.query
    ? query.query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    : []
  if (query.tags && query.tags.length > 0) {
    semanticTerms.push(...query.tags.map(t => t.toLowerCase()))
    filters.push('tags=' + query.tags.join(','))
  }

  const matches: RecallMatch[] = candidates.map(memory => {
    const matchReasons: string[] = []
    let relevanceScore = 0

    if (semanticTerms.length > 0) {
      const contentLower = memory.content.toLowerCase()
      const tagLower = memory.tags.map(t => t.toLowerCase())
      let termMatches = 0
      for (const term of semanticTerms) {
        if (contentLower.includes(term)) {
          termMatches++
          matchReasons.push('content matches "' + term + '"')
        }
        if (tagLower.some(t => t.includes(term))) {
          termMatches++
          matchReasons.push('tag matches "' + term + '"')
        }
      }
      relevanceScore = semanticTerms.length > 0
        ? termMatches / semanticTerms.length
        : 0
    } else {
      relevanceScore = 0.5
    }

    const ageHours = (now - memory.createdAt) / (1000 * 60 * 60)
    const ttl = memory.ttlHours > 0 ? memory.ttlHours : 168
    const decayFactor = Math.exp(-decayWeight * Math.log(2) * ageHours / ttl)

    const importanceScore = memory.importance === 'high' ? 1.0
      : memory.importance === 'medium' ? 0.6
      : 0.3

    const accessBoost = Math.min(memory.accessCount * 0.05, 0.2)
    const finalScore = (
      relevanceScore * (1 - decayWeight - importanceWeight) +
      decayFactor * decayWeight +
      importanceScore * importanceWeight +
      accessBoost
    )

    memory.accessCount++
    memory.lastAccessed = now

    return {
      memory,
      relevanceScore,
      decayFactor,
      importanceScore,
      matchReasons: matchReasons.slice(0, 5)
    }
  })

  matches.sort((a, b) => {
    const scoreA = a.relevanceScore * (1 - decayWeight - importanceWeight) + a.decayFactor * decayWeight + a.importanceScore * importanceWeight
    const scoreB = b.relevanceScore * (1 - decayWeight - importanceWeight) + b.decayFactor * decayWeight + b.importanceScore * importanceWeight
    return scoreB - scoreA
  })

  return {
    matches: matches.slice(0, limit),
    totalCandidates: candidates.length,
    appliedFilters: filters,
    searchMetadata: {
      semanticTerms,
      timeRangeApplied: !!(query.time_start || query.time_end),
      decayModel: 'exponential (half-life weighted)'
    }
  }
}

function analyzeLinks(input: LinkAnalysisInput): LinkAnalysisResult {
  const allMemories = Array.from(memoryStore.values()).filter(m => !m.compressed)
  const minSimilarity = input.min_similarity ?? 0.3
  const memoryIds = input.memory_ids
  const targetMemories = memoryIds
    ? allMemories.filter(m => memoryIds.includes(m.id))
    : allMemories

  const links: MemoryLink[] = []

  for (let i = 0; i < targetMemories.length; i++) {
    for (let j = i + 1; j < targetMemories.length; j++) {
      const a = targetMemories[i]
      const b = targetMemories[j]
      const sharedElements: string[] = []
      let strength = 0
      let linkType: MemoryLink['type'] = 'content_similarity'

      const sharedTags = a.tags.filter(t => b.tags.includes(t))
      if (sharedTags.length > 0) {
        strength += sharedTags.length * 0.15
        sharedElements.push(...sharedTags.map(t => 'tag:' + t))
        linkType = 'tag_overlap'
      }

      const timeDiff = Math.abs(a.createdAt - b.createdAt)
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      if (hoursDiff < 1) {
        strength += 0.25
        sharedElements.push('temporal: same hour')
        if (linkType === 'content_similarity') linkType = 'temporal'
      } else if (hoursDiff < 24) {
        strength += 0.1
        sharedElements.push('temporal: same day')
      }

      const wordsA = new Set(a.content.toLowerCase().split(/\s+/))
      const wordsB = new Set(b.content.toLowerCase().split(/\s+/))
      const intersection = new Set([...wordsA].filter(w => wordsB.has(w)))
      const union = new Set([...wordsA, ...wordsB])
      const jaccard = union.size > 0 ? intersection.size / union.size : 0
      if (jaccard > 0.1) {
        strength += jaccard * 0.5
        sharedElements.push('content: ' + (jaccard * 100).toFixed(0) + '% Jaccard similarity')
      }

      if (a.relatedIds.includes(b.id) || b.relatedIds.includes(a.id)) {
        strength += 0.4
        sharedElements.push('explicit relation')
        linkType = 'explicit'
      }

      strength = Math.min(strength, 1.0)

      if (strength >= minSimilarity) {
        links.push({
          sourceId: a.id,
          targetId: b.id,
          strength,
          type: linkType,
          sharedElements
        })
      }
    }
  }

  links.sort((a, b) => b.strength - a.strength)

  const adjacency: Map<string, Set<string>> = new Map()
  for (const link of links) {
    if (!adjacency.has(link.sourceId)) adjacency.set(link.sourceId, new Set())
    if (!adjacency.has(link.targetId)) adjacency.set(link.targetId, new Set())
    adjacency.get(link.sourceId)!.add(link.targetId)
    adjacency.get(link.targetId)!.add(link.sourceId)
  }

  const communities = discoveryCommunities(adjacency, targetMemories.map(m => m.id))
  const isolatedMemories = targetMemories.filter(m => !adjacency.has(m.id) || adjacency.get(m.id)!.size === 0)

  const recommendations: string[] = []
  if (isolatedMemories.length > 0) {
    recommendations.push(isolatedMemories.length + ' isolated memories detected - consider adding tags or relations')
  }
  if (communities.length > 1) {
    recommendations.push(communities.length + ' distinct communities found - memories are well-clustered')
  }
  const crossToolLinks = links.filter(l => {
    const src = memoryStore.get(l.sourceId)
    const tgt = memoryStore.get(l.targetId)
    return src && tgt && src.sourceTool !== tgt.sourceTool
  })
  if (crossToolLinks.length > 0) {
    recommendations.push(crossToolLinks.length + ' cross-tool links discovered - good cross-plugin correlation')
  }

  const edgeCount = links.length
  const nodeCount = targetMemories.length
  const maxEdges = nodeCount * (nodeCount - 1) / 2
  const density = maxEdges > 0 ? edgeCount / maxEdges : 0
  const avgDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0

  return {
    links,
    graphStats: {
      totalNodes: nodeCount,
      totalEdges: edgeCount,
      avgDegree,
      density
    },
    communities,
    recommendations
  }
}

function discoveryCommunities(adjacency: Map<string, Set<string>>, nodeIds: string[]): string[][] {
  const visited = new Set<string>()
  const communities: string[][] = []

  for (const nodeId of nodeIds) {
    if (visited.has(nodeId)) continue
    const community: string[] = []
    const queue = [nodeId]
    visited.add(nodeId)

    while (queue.length > 0) {
      const current = queue.shift()!
      community.push(current)
      const neighbors = adjacency.get(current)
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
          }
        }
      }
    }
    communities.push(community)
  }

  return communities
}

function analyzeDecay(_input: { memory_ids?: string[]; tag_filter?: string[] }): DecayResult {
  const allMemories = Array.from(memoryStore.values()).filter(m => !m.compressed)
  const now = Date.now()
  const analyses: DecayEntry[] = []

  for (const memory of allMemories) {
    const ageMs = now - memory.createdAt
    const age = ageMs / (1000 * 60 * 60)
    const ttl = memory.ttlHours > 0 ? memory.ttlHours : 168
    const halfLife = ttl / 2

    const accessBoost = Math.min(memory.accessCount * 2, 24)
    const adjustedHalfLife = halfLife + accessBoost
    const remainingLife = Math.max(adjustedHalfLife - age, 0)

    const accessDecayFactor = Math.exp(-Math.log(2) * age / adjustedHalfLife)

    let status: DecayEntry['status']
    let recommendation: string

    if (age < ttl * 0.25) {
      status = 'fresh'
      recommendation = 'No action needed'
    } else if (age < ttl * 0.5) {
      status = 'aging'
      recommendation = 'Monitor - approaching mid-life'
    } else if (age < ttl * 0.85) {
      status = 'stale'
      recommendation = 'Consider archival or refresh'
    } else {
      status = 'expired'
      recommendation = memory.importance === 'high'
        ? 'High importance - refresh content instead of deletion'
        : 'Recommend deletion or archival'
    }

    analyses.push({
      memoryId: memory.id,
      content: memory.content.substring(0, 80),
      age,
      halfLife: adjustedHalfLife,
      remainingLife,
      status,
      accessDecayFactor,
      recommendation
    })
  }

  analyses.sort((a, b) => a.remainingLife - b.remainingLife)

  const freshCount = analyses.filter(a => a.status === 'fresh').length
  const agingCount = analyses.filter(a => a.status === 'aging').length
  const staleCount = analyses.filter(a => a.status === 'stale').length
  const expiredCount = analyses.filter(a => a.status === 'expired').length
  const avgHalfLife = analyses.length > 0
    ? analyses.reduce((s, a) => s + a.halfLife, 0) / analyses.length
    : 0
  const ages = analyses.map(a => a.age).sort((x, y) => x - y)
  const medianAge = ages.length > 0 ? ages[Math.floor(ages.length / 2)] : 0

  const recommendations: string[] = []
  if (expiredCount > 0) {
    recommendations.push(expiredCount + ' expired memories should be reviewed for deletion')
  }
  if (staleCount > analyses.length * 0.3) {
    recommendations.push('Over 30% of memories are stale - consider increasing review frequency')
  }
  if (freshCount === 0 && analyses.length > 0) {
    recommendations.push('No fresh memories - system may benefit from new entries')
  }

  return {
    analyses,
    summary: {
      totalMemories: analyses.length,
      freshCount,
      agingCount,
      staleCount,
      expiredCount,
      avgHalfLife,
      medianAge
    },
    recommendations
  }
}

function detectConflicts(input: ConflictInput): ConflictResult {
  const allMemories = Array.from(memoryStore.values()).filter(m => !m.compressed)
  const threshold = input.threshold ?? 0.5
  const conflicts: ConflictGroup[] = []

  const topicGroups = new Map<string, MemoryEntry[]>()

  for (const memory of allMemories) {
    for (const tag of memory.tags) {
      if (input.tags && !input.tags.includes(tag)) continue
      if (input.topic && !tag.toLowerCase().includes(input.topic.toLowerCase())) continue
      if (!topicGroups.has(tag)) topicGroups.set(tag, [])
      topicGroups.get(tag)!.push(memory)
    }
  }

  for (const [topic, memories] of topicGroups) {
    if (memories.length < 2) continue

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const a = memories[i]
        const b = memories[j]

        const wordsA = new Set(a.content.toLowerCase().split(/\s+/))
        const wordsB = new Set(b.content.toLowerCase().split(/\s+/))
        const intersection = new Set([...wordsA].filter(w => wordsB.has(w)))
        const union = new Set([...wordsA, ...wordsB])
        const similarity = union.size > 0 ? intersection.size / union.size : 0

        if (similarity >= threshold) {
          const conflictType = similarity > 0.8 ? 'direct_contradiction'
            : similarity > 0.5 ? 'partial_overlap'
            : 'temporal_drift'

          const severity = similarity > 0.8 ? 'critical'
            : similarity > 0.5 ? 'warning'
            : 'info'

          const resolution = buildConflictResolution(a, b, similarity)
          const suggestedAction = similarity > 0.8 ? 'manual_review'
            : similarity > 0.5 ? 'merge'
            : 'keep_both'

          conflicts.push({
            topic,
            memories: [a.id, b.id],
            conflictType,
            severity,
            resolution,
            suggestedAction
          })
        }
      }
    }
  }

  conflicts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  const resolutionSummary = conflicts.length === 0
    ? 'No conflicts detected. Memory system is consistent.'
    : conflicts.length + ' potential conflict(s) found across ' +
      new Set(conflicts.map(c => c.topic)).size + ' topic(s).'

  return { conflicts, totalConflicts: conflicts.length, resolutionSummary }
}

function buildConflictResolution(a: MemoryEntry, b: MemoryEntry, similarity: number): string {
  if (similarity > 0.8) {
    return 'High similarity (' + (similarity * 100).toFixed(0) + '%) suggests duplicate or near-duplicate entries. Review for consolidation.'
  } else if (similarity > 0.5) {
    return 'Partial overlap detected. Consider merging unique aspects of both memories into a single entry.'
  }
  return 'Minor overlap. Likely safe to keep both entries but monitor for future divergence.'
}

function compressMemories(input: CompressionInput): CompressionResult {
  const allMemories = Array.from(memoryStore.values()).filter(m => !m.compressed)
  const targetCount = input.target_count ?? 3
  const strategy = input.strategy ?? 'merge_similar'
  const sourceIds = input.memory_ids
  const tagFilter = input.tags

  let targets = sourceIds
    ? allMemories.filter(m => sourceIds.includes(m.id))
    : allMemories

  if (tagFilter && tagFilter.length > 0) {
    targets = targets.filter(m => m.tags.some(t => tagFilter.includes(t)))
  }

  if (targets.length === 0) {
    return { compressed: [], originalCount: 0, compressionRatio: 0, tokensSaved: 0, details: ['No memories matched the compression criteria'] }
  }

  const groups = strategy === 'hierarchical'
    ? groupHierarchically(targets)
    : groupBySimilarity(targets, targetCount)

  const compressed: CompressedMemory[] = []
  const details: string[] = []

  for (const group of groups) {
    if (group.length < 2) continue

    const important = group.reduce((best, m) =>
      m.importance === 'high' ? m : best.importance === 'high' ? best : m
    )

    const allTags = [...new Set(group.flatMap(m => m.tags))]
    const summary = generateSummary(group)

    const compressedEntry: CompressedMemory = {
      id: generateId(),
      summary,
      sourceIds: group.map(m => m.id),
      tags: allTags,
      importance: important.importance,
      compressionMethod: strategy
    }

    compressed.push(compressedEntry)
    details.push('Compressed ' + group.length + ' memories into: "' + summary.substring(0, 60) + '..."')

    for (const m of group) {
      m.compressed = true
      m.compressedFrom = [compressedEntry.id]
    }
  }

  const origTokens = targets.reduce((s, m) => s + estimateTokens(m.content), 0)
  const newTokens = compressed.reduce((s, m) => s + estimateTokens(m.summary), 0)
  const tokensSaved = Math.max(origTokens - newTokens, 0)
  const compressionRatio = targets.length > 0 ? compressed.length / targets.length : 0

  return {
    compressed,
    originalCount: targets.length,
    compressionRatio,
    tokensSaved,
    details
  }
}

function groupBySimilarity(memories: MemoryEntry[], targetGroups: number): MemoryEntry[][] {
  const groups: MemoryEntry[][] = []
  const ungrouped = [...memories]

  while (ungrouped.length > 0 && groups.length < targetGroups) {
    const seed = ungrouped.shift()!
    const group = [seed]

    for (let i = ungrouped.length - 1; i >= 0; i--) {
      const candidate = ungrouped[i]
      const shared = seed.tags.filter(t => candidate.tags.includes(t))
      if (shared.length > 0) {
        group.push(candidate)
        ungrouped.splice(i, 1)
      }
    }
    groups.push(group)
  }

  if (ungrouped.length > 0) {
    groups.push(ungrouped)
  }

  return groups
}

function groupHierarchically(memories: MemoryEntry[]): MemoryEntry[][] {
  const tagIndex = new Map<string, MemoryEntry[]>()
  for (const m of memories) {
    for (const tag of m.tags) {
      if (!tagIndex.has(tag)) tagIndex.set(tag, [])
      tagIndex.get(tag)!.push(m)
    }
  }

  const sortedTags = Array.from(tagIndex.entries())
    .sort((a, b) => b[1].length - a[1].length)

  const assigned = new Set<string>()
  const groups: MemoryEntry[][] = []

  for (const [, members] of sortedTags) {
    const unassigned = members.filter(m => !assigned.has(m.id))
    if (unassigned.length > 1) {
      groups.push(unassigned)
      unassigned.forEach(m => assigned.add(m.id))
    }
  }

  const remaining = memories.filter(m => !assigned.has(m.id))
  if (remaining.length > 0) {
    groups.push(remaining)
  }

  return groups
}

function generateSummary(group: MemoryEntry[]): string {
  const allContents = group.map(m => m.content)
  const allTags = [...new Set(group.flatMap(m => m.tags))]
  const importance = group.some(m => m.importance === 'high') ? 'high'
    : group.some(m => m.importance === 'medium') ? 'medium' : 'low'

  const wordFreq = new Map<string, number>()
  for (const content of allContents) {
    const words = content.toLowerCase().split(/\s+/)
    for (const w of words) {
      if (w.length > 3) {
        wordFreq.set(w, (wordFreq.get(w) || 0) + 1)
      }
    }
  }

  const topTerms = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)

  const sources = [...new Set(group.map(m => m.sourceTool))]
  const sourceInfo = sources.length > 1 ? ' (cross-tool: ' + sources.join(', ') + ')' : ''

  return '[Compressed ' + group.length + ' memories' + sourceInfo + '] ' +
    'Tags: ' + allTags.join(', ') + '. ' +
    'Key terms: ' + topTerms.join(', ') + '. ' +
    'Importance: ' + importance + '. ' +
    'Summary: ' + allContents[0].substring(0, 100) + (allContents[0].length > 100 ? '...' : '')
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function buildGraph(input: GraphInput): GraphResult {
  const allMemories = Array.from(memoryStore.values()).filter(m => !m.compressed)
  const minLinkStrength = input.min_link_strength ?? 0.2
  const algorithm = input.algorithm ?? 'default'
  const memoryIds = input.memory_ids

  const targets = memoryIds
    ? allMemories.filter(m => memoryIds.includes(m.id))
    : allMemories

  const linksInput: LinkAnalysisInput = {
    memory_ids: targets.map(m => m.id),
    min_similarity: minLinkStrength,
    auto_discover: true
  }
  const linkResult = analyzeLinks(linksInput)

  const nodes: GraphNode[] = targets.map(m => ({
    id: m.id,
    label: m.content.substring(0, 40),
    importance: m.importance,
    degree: 0,
    communityId: -1
  }))

  const adjacency: Map<string, number> = new Map()
  for (const link of linkResult.links) {
    adjacency.set(link.sourceId, (adjacency.get(link.sourceId) || 0) + 1)
    adjacency.set(link.targetId, (adjacency.get(link.targetId) || 0) + 1)
  }

  for (const node of nodes) {
    node.degree = adjacency.get(node.id) || 0
  }

  const communityMap = new Map<string, number>()
  for (let i = 0; i < linkResult.communities.length; i++) {
    for (const member of linkResult.communities[i]) {
      communityMap.set(member, i)
    }
  }

  for (const node of nodes) {
    node.communityId = communityMap.get(node.id) ?? -1
  }

  const communities: Community[] = linkResult.communities.map((members, idx) => {
    const memberMemories = targets.filter(m => members.includes(m.id))
    const tagCounts = new Map<string, number>()
    for (const m of memberMemories) {
      for (const t of m.tags) {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1)
      }
    }
    const dominantTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag)

    const internalLinks = linkResult.links.filter(l =>
      members.includes(l.sourceId) && members.includes(l.targetId)
    )
    const maxInternal = members.length > 1 ? (members.length * (members.length - 1)) / 2 : 1
    const cohesion = maxInternal > 0 ? internalLinks.length / maxInternal : 0

    return { id: idx, members, cohesion, dominantTags }
  })

  const edges: GraphEdge[] = linkResult.links.map(l => ({
    source: l.sourceId,
    target: l.targetId,
    weight: l.strength,
    type: l.type
  }))

  const degreeValues = nodes.map(n => n.degree).sort((a, b) => b - a)
  const maxDegree = degreeValues[0] || 0
  const avgDegree = nodes.length > 0 ? degreeValues.reduce((s, d) => s + d, 0) / nodes.length : 0

  const centralNodes: CentralNode[] = nodes
    .filter(n => n.degree > 0)
    .map(n => {
      const role: CentralNode['role'] = n.degree >= maxDegree * 0.8 ? 'hub'
        : n.degree >= avgDegree ? 'bridge'
        : 'peripheral'
      return {
        id: n.id,
        label: n.label,
        centrality: maxDegree > 0 ? n.degree / maxDegree : 0,
        connections: n.degree,
        role
      }
    })
    .sort((a, b) => b.centrality - a.centrality)
    .slice(0, 10)

  const totalNodes = nodes.length
  const totalEdges = edges.length
  const avgClustering = totalNodes > 0
    ? nodes.reduce((s, n) => s + (n.degree > 1 ? (2 * n.degree) / (n.degree * (n.degree - 1)) : 0), 0) / totalNodes
    : 0

  const modularity = computeModularity(communities, linkResult.links, totalEdges)
  const communityCount = communities.length

  return {
    nodes,
    edges,
    communities,
    centralNodes,
    metrics: {
      totalNodes,
      totalEdges,
      avgClustering,
      modularity,
      communityCount
    }
  }
}

function computeModularity(communities: Community[], links: MemoryLink[], totalEdges: number): number {
  if (totalEdges === 0) return 0
  let q = 0
  for (const community of communities) {
    const internalLinks = links.filter(l =>
      community.members.includes(l.sourceId) && community.members.includes(l.targetId)
    )
    const internalWeight = internalLinks.reduce((s, l) => s + l.strength, 0)
    const totalWeight = links.reduce((s, l) => s + l.strength, 0)
    if (totalWeight > 0) {
      q += (internalWeight / totalWeight) - Math.pow(community.members.length / (communities.reduce((s, c) => s + c.members.length, 0)), 2)
    }
  }
  return q
}

function generateAuditReport(_scope: { source_tool?: string; tag_filter?: string[] }): AuditResult {
  const allMemories = Array.from(memoryStore.values())
  const activeMemories = allMemories.filter(m => !m.compressed)
  const now = Date.now()

  const uniqueTags = new Set(activeMemories.flatMap(m => m.tags))
  const sourceTools = [...new Set(activeMemories.map(m => m.sourceTool))]
  const timeSpan = activeMemories.length > 0
    ? (now - Math.min(...activeMemories.map(m => m.createdAt))) / (1000 * 60 * 60 * 24)
    : 0

  const tagCoverage = activeMemories.length > 0
    ? uniqueTags.size / activeMemories.length
    : 0

  const duplicatePairs = countDuplicatePairs(activeMemories)
  const redundancyRate = activeMemories.length > 0 ? duplicatePairs / activeMemories.length : 0

  const conflictResult = detectConflicts({})
  const activeConflicts = conflictResult.totalConflicts
  const conflictRate = activeMemories.length > 0
    ? activeConflicts / (activeMemories.length * (activeMemories.length - 1) / 2 || 1)
    : 0

  const decayResult = analyzeDecay({})
  const healthyRatio = decayResult.summary.totalMemories > 0
    ? (decayResult.summary.freshCount + decayResult.summary.agingCount) / decayResult.summary.totalMemories
    : 1
  const expiredRatio = decayResult.summary.totalMemories > 0
    ? decayResult.summary.expiredCount / decayResult.summary.totalMemories
    : 0
  const avgFreshness = decayResult.analyses.length > 0
    ? decayResult.analyses.reduce((s, a) => s + a.accessDecayFactor, 0) / decayResult.analyses.length
    : 0

  const linkResult = analyzeLinks({})
  const totalLinks = linkResult.graphStats.totalEdges
  const avgLinksPerMemory = linkResult.graphStats.avgDegree
  const isolatedCount = activeMemories.filter(m =>
    !linkResult.links.some(l => l.sourceId === m.id || l.targetId === m.id)
  ).length

  const recommendations: string[] = []
  if (duplicatePairs > 0) {
    recommendations.push(duplicatePairs + ' duplicate pairs detected - run memory_compression to consolidate')
  }
  if (activeConflicts > 0) {
    recommendations.push(activeConflicts + ' active conflicts need resolution')
  }
  if (expiredRatio > 0.2) {
    recommendations.push('Over 20% expired memories - consider bulk archival')
  }
  if (isolatedCount > activeMemories.length * 0.3) {
    recommendations.push(isolatedCount + ' isolated memories (>30%) - improve tagging for better linking')
  }
  if (linkResult.graphStats.density < 0.1 && activeMemories.length > 5) {
    recommendations.push('Low link density (' + linkResult.graphStats.density.toFixed(3) + ') - consider adding more shared tags')
  }
  if (sourceTools.length === 1) {
    recommendations.push('Only one source tool detected - cross-tool correlation is limited')
  }

  const overallScore = (
    healthyRatio * 0.3 +
    (1 - Math.min(conflictRate * 10, 1)) * 0.25 +
    (1 - redundancyRate) * 0.2 +
    linkResult.graphStats.density * 0.15 +
    avgFreshness * 0.1
  )

  const grade = overallScore >= 0.8 ? 'A'
    : overallScore >= 0.6 ? 'B'
    : overallScore >= 0.4 ? 'C'
    : overallScore >= 0.2 ? 'D'
    : 'F'

  return {
    coverage: {
      totalMemories: activeMemories.length,
      uniqueTags: uniqueTags.size,
      sourceTools,
      tagCoverage,
      timeSpan
    },
    duplication: {
      duplicatePairs,
      redundancyRate,
      similarClusters: Math.ceil(duplicatePairs / 2),
      actionable: duplicatePairs > 0
        ? ['Run memory_compression with strategy "merge_similar" to reduce duplicates']
        : ['No duplication issues detected']
    },
    conflicts: {
      activeConflicts,
      conflictRate,
      resolvedCount: 0,
      topConflictTopics: [...new Set(conflictResult.conflicts.map(c => c.topic))].slice(0, 5)
    },
    decay: {
      healthyRatio,
      avgFreshness,
      expiredRatio,
      needsAttention: decayResult.summary.staleCount + decayResult.summary.expiredCount
    },
    links: {
      totalLinks,
      avgLinksPerMemory,
      isolatedCount,
      linkDensity: linkResult.graphStats.density
    },
    overallScore,
    grade,
    recommendations
  }
}

function countDuplicatePairs(memories: MemoryEntry[]): number {
  let count = 0
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const a = memories[i]
      const b = memories[j]
      const wordsA = new Set(a.content.toLowerCase().split(/\s+/))
      const wordsB = new Set(b.content.toLowerCase().split(/\s+/))
      const intersection = new Set([...wordsA].filter(w => wordsB.has(w)))
      const union = new Set([...wordsA, ...wordsB])
      const similarity = union.size > 0 ? intersection.size / union.size : 0
      if (similarity > 0.7) count++
    }
  }
  return count
}

// ==================== Format Functions ====================

function formatStoreResult(result: StoreResult): string {
  const lines: string[] = []
  lines.push('# Memory Stored Successfully')
  lines.push('')
  lines.push('**ID:** ' + result.id)
  lines.push('**Source Tool:** ' + result.entry.sourceTool)
  lines.push('**Importance:** ' + result.entry.importance)
  lines.push('**Tags:** ' + (result.entry.tags.length > 0 ? result.entry.tags.join(', ') : '(none)'))
  lines.push('**TTL:** ' + (result.entry.ttlHours > 0 ? result.entry.ttlHours + ' hours' : 'Never expires'))
  lines.push('**Created:** ' + new Date(result.entry.createdAt).toISOString())
  lines.push('')

  if (result.linkedMemories.length > 0) {
    lines.push('## Auto-Discovered Links')
    lines.push('')
    result.linkedMemories.forEach((link, i) => {
      lines.push('**' + (i + 1) + '.** `' + link.memoryId + '`')
      lines.push('   - Strength: ' + (link.score * 100).toFixed(0) + '%')
      lines.push('   - Reason: ' + link.reason)
    })
    lines.push('')
  }

  if (result.warnings.length > 0) {
    lines.push('## Warnings')
    lines.push('')
    result.warnings.forEach(w => {
      lines.push('-  ' + w)
    })
  }

  return lines.join('\n')
}

function formatRecallResult(result: RecallResult): string {
  const lines: string[] = []
  lines.push('# Memory Recall Results')
  lines.push('')
  lines.push('**Candidates Scanned:** ' + result.totalCandidates)
  lines.push('**Matches Returned:** ' + result.matches.length)
  lines.push('**Filters Applied:** ' + (result.appliedFilters.length > 0 ? result.appliedFilters.join(', ') : 'None'))
  lines.push('**Decay Model:** ' + result.searchMetadata.decayModel)
  lines.push('')

  if (result.matches.length === 0) {
    lines.push('_No matching memories found. Try broadening your query or reducing filters._')
    return lines.join('\n')
  }

  lines.push('## Top Matches')
  lines.push('')

  result.matches.forEach((match, i) => {
    const m = match.memory
    const overallScore = match.relevanceScore * 0.4 + match.decayFactor * 0.35 + match.importanceScore * 0.25
    lines.push('### ' + (i + 1) + '. ' + m.id)
    lines.push('')
    lines.push('> ' + m.content.substring(0, 150) + (m.content.length > 150 ? '...' : ''))
    lines.push('')
    lines.push('- **Score:** ' + (overallScore * 100).toFixed(0) + '% (relevance: ' + (match.relevanceScore * 100).toFixed(0) + '%, decay: ' + (match.decayFactor * 100).toFixed(0) + '%, importance: ' + (match.importanceScore * 100).toFixed(0) + '%)')
    lines.push('- **Source:** ' + m.sourceTool + ' | **Importance:** ' + m.importance)
    lines.push('- **Tags:** ' + (m.tags.length > 0 ? m.tags.join(', ') : '(none)'))
    lines.push('- **Created:** ' + new Date(m.createdAt).toISOString())
    if (match.matchReasons.length > 0) {
      lines.push('- **Match Reasons:** ' + match.matchReasons.join('; '))
    }
    lines.push('')
  })

  return lines.join('\n')
}

function formatLinkResult(result: LinkAnalysisResult): string {
  const lines: string[] = []
  lines.push('# Memory Link Analysis')
  lines.push('')
  lines.push('## Graph Statistics')
  lines.push('')
  lines.push('- **Nodes:** ' + result.graphStats.totalNodes)
  lines.push('- **Edges:** ' + result.graphStats.totalEdges)
  lines.push('- **Avg Degree:** ' + result.graphStats.avgDegree.toFixed(2))
  lines.push('- **Density:** ' + result.graphStats.density.toFixed(4))
  lines.push('- **Communities:** ' + result.communities.length)
  lines.push('')

  if (result.links.length > 0) {
    lines.push('## Top Links (by strength)')
    lines.push('')
    result.links.slice(0, 10).forEach((link, i) => {
      lines.push('**' + (i + 1) + '.** `' + link.sourceId.slice(0, 12) + '...` <-> `' + link.targetId.slice(0, 12) + '...`')
      lines.push('   - Strength: ' + (link.strength * 100).toFixed(0) + '% | Type: ' + link.type)
      if (link.sharedElements.length > 0) {
        lines.push('   - Shared: ' + link.sharedElements.join(', '))
      }
    })
    lines.push('')
  }

  if (result.communities.length > 0) {
    lines.push('## Communities')
    lines.push('')
    result.communities.forEach((community, i) => {
      lines.push('- **Community ' + (i + 1) + ':** ' + community.length + ' members')
      if (community.length <= 5) {
        lines.push('  - Members: ' + community.map(id => '`' + id.slice(0, 10) + '...`').join(', '))
      }
    })
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    result.recommendations.forEach(r => {
      lines.push('- ' + r)
    })
  }

  return lines.join('\n')
}

function formatDecayResult(result: DecayResult): string {
  const lines: string[] = []
  lines.push('# Memory Decay Analysis')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('- **Total Memories:** ' + result.summary.totalMemories)
  lines.push('- **Fresh:** ' + result.summary.freshCount + ' | **Aging:** ' + result.summary.agingCount + ' | **Stale:** ' + result.summary.staleCount + ' | **Expired:** ' + result.summary.expiredCount)
  lines.push('- **Avg Half-Life:** ' + result.summary.avgHalfLife.toFixed(1) + ' hours')
  lines.push('- **Median Age:** ' + result.summary.medianAge.toFixed(1) + ' hours')
  lines.push('')

  if (result.analyses.length > 0) {
    lines.push('## Detailed Analysis')
    lines.push('')
    result.analyses.forEach(entry => {
      const icon = entry.status === 'fresh' ? ''
        : entry.status === 'aging' ? ''
        : entry.status === 'stale' ? ' '
        : ' '
      lines.push('### ' + icon + ' ' + entry.memoryId.slice(0, 16) + '...')
      lines.push('')
      lines.push('> ' + entry.content)
      lines.push('')
      lines.push('- **Status:** ' + entry.status.toUpperCase())
      lines.push('- **Age:** ' + entry.age.toFixed(1) + 'h | **Half-life:** ' + entry.halfLife.toFixed(1) + 'h | **Remaining:** ' + entry.remainingLife.toFixed(1) + 'h')
      lines.push('- **Decay Factor:** ' + entry.accessDecayFactor.toFixed(3))
      lines.push('- **Action:** ' + entry.recommendation)
      lines.push('')
    })
  }

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    result.recommendations.forEach(r => {
      lines.push('- ' + r)
    })
  }

  return lines.join('\n')
}

function formatConflictResult(result: ConflictResult): string {
  const lines: string[] = []
  lines.push('# Memory Conflict Detection Report')
  lines.push('')
  lines.push('## Overview')
  lines.push('')
  lines.push('- **Total Conflicts:** ' + result.totalConflicts)
  lines.push('- **Summary:** ' + result.resolutionSummary)
  lines.push('')

  if (result.conflicts.length === 0) {
    lines.push('No conflicts detected. Memory system is internally consistent.')
    return lines.join('\n')
  }

  lines.push('## Conflicts')
  lines.push('')
  result.conflicts.forEach((conflict, i) => {
    const severityIcon = conflict.severity === 'critical' ? ''
      : conflict.severity === 'warning' ? ''
      : ''
    lines.push('### ' + severityIcon + ' Conflict ' + (i + 1) + ': ' + conflict.topic)
    lines.push('')
    lines.push('- **Type:** ' + conflict.conflictType)
    lines.push('- **Severity:** ' + conflict.severity.toUpperCase())
    lines.push('- **Memories:** ' + conflict.memories.map(id => '`' + id.slice(0, 12) + '...`').join(', '))
    lines.push('- **Resolution:** ' + conflict.resolution)
    lines.push('- **Suggested Action:** ' + conflict.suggestedAction)
    lines.push('')
  })

  return lines.join('\n')
}

function formatCompressionResult(result: CompressionResult): string {
  const lines: string[] = []
  lines.push('# Memory Compression Report')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('- **Original Count:** ' + result.originalCount)
  lines.push('- **Compressed Into:** ' + result.compressed.length + ' entries')
  lines.push('- **Compression Ratio:** ' + (result.compressionRatio * 100).toFixed(0) + '%')
  lines.push('- **Tokens Saved:** ' + result.tokensSaved)
  lines.push('')

  if (result.details.length > 0) {
    lines.push('## Compression Details')
    lines.push('')
    result.details.forEach(d => {
      lines.push('- ' + d)
    })
    lines.push('')
  }

  if (result.compressed.length > 0) {
    lines.push('## Compressed Entries')
    lines.push('')
    result.compressed.forEach(entry => {
      lines.push('### ' + entry.id)
      lines.push('')
      lines.push('> ' + entry.summary.substring(0, 200))
      lines.push('')
      lines.push('- **Sources:** ' + entry.sourceIds.length + ' memories')
      lines.push('- **Method:** ' + entry.compressionMethod + ' | **Importance:** ' + entry.importance)
      lines.push('- **Tags:** ' + (entry.tags.length > 0 ? entry.tags.join(', ') : '(none)'))
      lines.push('')
    })
  }

  return lines.join('\n')
}

function formatGraphResult(result: GraphResult): string {
  const lines: string[] = []
  lines.push('# Memory Graph Analysis')
  lines.push('')
  lines.push('## Metrics')
  lines.push('')
  lines.push('- **Nodes:** ' + result.metrics.totalNodes)
  lines.push('- **Edges:** ' + result.metrics.totalEdges)
  lines.push('- **Communities:** ' + result.metrics.communityCount)
  lines.push('- **Modularity:** ' + result.metrics.modularity.toFixed(4))
  lines.push('- **Avg Clustering:** ' + result.metrics.avgClustering.toFixed(4))
  lines.push('')

  if (result.centralNodes.length > 0) {
    lines.push('## Central Nodes (Top 10)')
    lines.push('')
    result.centralNodes.forEach((node, i) => {
      lines.push('**' + (i + 1) + '.** `' + node.id.slice(0, 12) + '...` - ' + node.label)
      lines.push('   - Centrality: ' + (node.centrality * 100).toFixed(0) + '% | Connections: ' + node.connections + ' | Role: ' + node.role)
    })
    lines.push('')
  }

  if (result.communities.length > 0) {
    lines.push('## Communities')
    lines.push('')
    result.communities.forEach(community => {
      lines.push('- **Community ' + community.id + ':** ' + community.members.length + ' members')
      lines.push('  - Cohesion: ' + community.cohesion.toFixed(3))
      if (community.dominantTags.length > 0) {
        lines.push('  - Dominant Tags: ' + community.dominantTags.join(', '))
      }
    })
    lines.push('')
  }

  if (result.edges.length > 0) {
    lines.push('## Top Edges (by weight)')
    lines.push('')
    result.edges.sort((a, b) => b.weight - a.weight).slice(0, 5).forEach((edge, i) => {
      lines.push('**' + (i + 1) + '.** `' + edge.source.slice(0, 10) + '...` -> `' + edge.target.slice(0, 10) + '...`')
      lines.push('   - Weight: ' + (edge.weight * 100).toFixed(0) + '% | Type: ' + edge.type)
    })
  }

  return lines.join('\n')
}

function formatAuditResult(result: AuditResult): string {
  const lines: string[] = []
  lines.push('# Memory System Audit Report')
  lines.push('')
  lines.push('## Overall Health')
  lines.push('')
  lines.push('- **Score:** ' + (result.overallScore * 100).toFixed(1) + '%')
  lines.push('- **Grade:** ' + result.grade)
  lines.push('')

  lines.push('## Coverage')
  lines.push('')
  lines.push('- **Total Memories:** ' + result.coverage.totalMemories)
  lines.push('- **Unique Tags:** ' + result.coverage.uniqueTags)
  lines.push('- **Source Tools:** ' + result.coverage.sourceTools.join(', '))
  lines.push('- **Tag Coverage Ratio:** ' + result.coverage.tagCoverage.toFixed(3))
  lines.push('- **Time Span:** ' + result.coverage.timeSpan.toFixed(1) + ' days')
  lines.push('')

  lines.push('## Duplication')
  lines.push('')
  lines.push('- **Duplicate Pairs:** ' + result.duplication.duplicatePairs)
  lines.push('- **Redundancy Rate:** ' + (result.duplication.redundancyRate * 100).toFixed(1) + '%')
  lines.push('- **Similar Clusters:** ' + result.duplication.similarClusters)
  result.duplication.actionable.forEach(a => lines.push('- **Action:** ' + a))
  lines.push('')

  lines.push('## Conflicts')
  lines.push('')
  lines.push('- **Active Conflicts:** ' + result.conflicts.activeConflicts)
  lines.push('- **Conflict Rate:** ' + (result.conflicts.conflictRate * 100).toFixed(2) + '%')
  if (result.conflicts.topConflictTopics.length > 0) {
    lines.push('- **Top Topics:** ' + result.conflicts.topConflictTopics.join(', '))
  }
  lines.push('')

  lines.push('## Decay Health')
  lines.push('')
  lines.push('- **Healthy Ratio:** ' + (result.decay.healthyRatio * 100).toFixed(0) + '%')
  lines.push('- **Avg Freshness:** ' + result.decay.avgFreshness.toFixed(3))
  lines.push('- **Expired Ratio:** ' + (result.decay.expiredRatio * 100).toFixed(0) + '%')
  lines.push('- **Needs Attention:** ' + result.decay.needsAttention + ' memories')
  lines.push('')

  lines.push('## Link Density')
  lines.push('')
  lines.push('- **Total Links:** ' + result.links.totalLinks)
  lines.push('- **Avg Links/Memory:** ' + result.links.avgLinksPerMemory.toFixed(2))
  lines.push('- **Isolated Memories:** ' + result.links.isolatedCount)
  lines.push('- **Link Density:** ' + result.links.linkDensity.toFixed(4))
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    result.recommendations.forEach(r => {
      lines.push('- ' + r)
    })
  }

  return lines.join('\n')
}
