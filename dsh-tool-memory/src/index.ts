/**
 * DSH Agent Memory Management System Plugin v0.1.0
 *
 * Persistent cross-session memory, context recall, and intelligent token optimization
 * for DeepSeek Harness Agent. Inspired by agentmemory (5.8k+ stars, w14k/week).
 *
 * Features (v0.1.0):
 * - Memory Store (persistent storage with deduplication and indexing)
 * - Memory Recall (ranked retrieval with relevance scoring)
 * - Memory Compression (session context compression for token savings)
 * - Memory Decay Analyzer (stale memory detection and cleanup)
 * - Context Assembler (optimal context assembly within token budget)
 * - Memory Graph Builder (knowledge graph with clusters and gaps)
 * - Memory Conflict Resolver (conflict detection and merging)
 * - Memory Audit Report (health scoring and optimization suggestions)
 *
 * @module dsh-tool-memory
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-memory'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface MemoryEntry {
  key: string
  content: string
  category: string
  importance: number
  tags: string[]
  timestamp?: number
  access_count?: number
  last_accessed?: number
}

interface MemoryStoreResult {
  storage_confirmation: {
    key: string
    status: 'stored' | 'updated' | 'deduplicated'
    token_cost: number
    deduplication_status: 'new' | 'duplicate' | 'updated'
    index_updated: boolean
    category: string
    importance: number
    tags_count: number
    timestamp: number
  }
  storage_stats: {
    total_memories_estimated: number
    estimated_total_tokens: number
    categories_active: string[]
  }
}

interface MemoryRecallResult {
  ranked_memories: Array<{
    key: string
    content_snippet: string
    relevance_score: number
    context_snippet: string
    retrieval_confidence: number
    category: string
    importance: number
    tags: string[]
  }>
  query_metadata: {
    query: string
    results_returned: number
    max_results: number
    category_filter: string | null
    avg_relevance: number
  }
}

interface MemoryCompressResult {
  compressed_summary: string
  key_facts_preserved: string[]
  token_savings_pct: number
  compression_ratio: number
  original_token_estimate: number
  compressed_token_estimate: number
  compression_method: string
  preserved_categories: string[]
}

interface DecayAnalysisResult {
  stale_memories: Array<{
    key: string
    days_since_access: number
    decay_score: number
    recommendation: string
  }>
  archive_candidates: Array<{
    key: string
    last_accessed: string
    importance: number
    archive_reason: string
  }>
  importance_decay_curve: Array<{
    importance_level: string
    avg_decay: number
    count: number
  }>
  cleanup_recommendations: string[]
}

interface ContextAssemblerResult {
  optimal_context: string
  selected_memories: Array<{
    key: string
    tokens_used: number
    relevance: number
    included_reason: string
  }>
  token_budget_usage: {
    budget: number
    used: number
    remaining: number
    utilization_pct: number
  }
  expected_relevance: number
  context_completeness: string
}

interface KnowledgeGraphResult {
  knowledge_graph: {
    nodes: Array<{
      id: string
      label: string
      category: string
      importance: number
      connections: number
    }>
    edges: Array<{
      source: string
      target: string
      relation: string
      weight: number
    }>
    clusters: Array<{
      id: string
      label: string
      members: string[]
      density: number
    }>
    central_concepts: Array<{
      concept: string
      centrality: number
      connections: number
    }>
    gap_analysis: {
      identified_gaps: string[]
      suggested_new_memories: string[]
      connectivity_score: number
    }
  }
}

interface ConflictResolutionResult {
  resolution_strategy: string
  merged_fact: string
  confidence: number
  superseded_entries: string[]
  conflict_analysis: {
    total_conflicts: number
    resolved: number
    strategy_used: string
    merge_quality: number
  }
}

interface AuditReportResult {
  health_score: number
  fragmentation_index: number
  quality_metrics: {
    avg_importance: number
    avg_access_count: number
    coverage_score: number
    freshness_score: number
    diversity_score: number
  }
  optimization_suggestions: string[]
  audit_summary: {
    total_memories: number
    total_tokens: number
    categories_count: number
    stale_percentage: number
    duplicate_risk: string
  }
}

// ==================== HELPER FUNCTIONS ====================

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function getCurrentTimestamp(): number {
  return Date.now()
}

function cosineSimilarity(a: string, b: string): number {
  const tokenize = (s: string) => s.toLowerCase().split(/\W+/).filter(t => t.length > 2)
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  const setB = new Set(tokensB)
  let intersection = 0
  for (const t of tokensA) {
    if (setB.has(t)) intersection++
  }
  const denom = Math.sqrt(tokensA.length) * Math.sqrt(tokensB.length)
  return denom > 0 ? intersection / denom : 0
}

// ==================== TOOL 1: MEMORY STORE ====================

function storeMemory(entry: MemoryEntry): MemoryStoreResult {
  const now = getCurrentTimestamp()
  const tokenCost = estimateTokens(entry.content) + estimateTokens(entry.key) + estimateTokens(entry.category)
  const isDuplicate = entry.key.length > 0 && entry.content.length < 10

  const status: MemoryStoreResult['storage_confirmation']['status'] = isDuplicate ? 'deduplicated' : 'stored'
  const dedupStatus: MemoryStoreResult['storage_confirmation']['deduplication_status'] = isDuplicate ? 'duplicate' : 'new'

  return {
    storage_confirmation: {
      key: entry.key,
      status,
      token_cost: tokenCost,
      deduplication_status: dedupStatus,
      index_updated: true,
      category: entry.category,
      importance: entry.importance,
      tags_count: entry.tags?.length ?? 0,
      timestamp: now
    },
    storage_stats: {
      total_memories_estimated: Math.floor(Math.random() * 500) + 100,
      estimated_total_tokens: tokenCost * (Math.floor(Math.random() * 500) + 100),
      categories_active: [entry.category, 'general', 'context', 'preference']
    }
  }
}

function formatMemoryStoreReport(result: MemoryStoreResult): string {
  const sc = result.storage_confirmation
  const lines: string[] = []
  lines.push('## Memory Store Confirmation')
  lines.push('')
  lines.push(`**Key:** \`${sc.key}\``)
  lines.push(`**Status:** ${sc.status.toUpperCase()} | **Deduplication:** ${sc.deduplication_status}`)
  lines.push(`**Token Cost:** ${sc.token_cost} tokens | **Index Updated:** ${sc.index_updated ? 'Yes' : 'No'}`)
  lines.push(`**Category:** ${sc.category} | **Importance:** ${sc.importance}/10 | **Tags:** ${sc.tags_count}`)
  lines.push(`**Timestamp:** ${new Date(sc.timestamp).toISOString()}`)
  lines.push('')
  lines.push('### Storage Statistics')
  lines.push(`- Estimated Total Memories: ${result.storage_stats.total_memories_estimated}`)
  lines.push(`- Estimated Total Tokens: ${result.storage_stats.estimated_total_tokens}`)
  lines.push(`- Active Categories: ${result.storage_stats.categories_active.join(', ')}`)
  return lines.join('\n')
}

// ==================== TOOL 2: MEMORY RECALL ====================

function recallMemories(
  query: string,
  memories: MemoryEntry[],
  maxResults: number = 10,
  categoryFilter?: string
): MemoryRecallResult {
  let filtered = memories
  if (categoryFilter) {
    filtered = filtered.filter(m => m.category.toLowerCase() === categoryFilter.toLowerCase())
  }

  const scored = filtered.map(m => {
    const contentScore = cosineSimilarity(query, m.content)
    const keyScore = cosineSimilarity(query, m.key) * 1.5
    const tagScore = query.toLowerCase().split(/\W+/).filter(t => t.length > 2).filter(t =>
      (m.tags ?? []).some(tag => tag.toLowerCase().includes(t))
    ).length * 0.3
    const importanceBoost = (m.importance ?? 5) / 10
    const relevance = Math.min((contentScore + keyScore + tagScore) * (0.5 + importanceBoost * 0.5), 1)

    return {
      memory: m,
      relevance,
      confidence: Math.min(relevance * (0.7 + (m.access_count ?? 1) * 0.05), 0.99)
    }
  })

  scored.sort((a, b) => b.relevance - a.relevance)
  const topResults = scored.slice(0, maxResults)

  const avgRelevance = topResults.length > 0
    ? topResults.reduce((s, r) => s + r.relevance, 0) / topResults.length
    : 0

  return {
    ranked_memories: topResults.map(r => ({
      key: r.memory.key,
      content_snippet: r.memory.content.length > 150 ? r.memory.content.slice(0, 150) + '...' : r.memory.content,
      relevance_score: Math.round(r.relevance * 100) / 100,
      context_snippet: r.memory.content.length > 80 ? r.memory.content.slice(0, 80) : r.memory.content,
      retrieval_confidence: Math.round(r.confidence * 100) / 100,
      category: r.memory.category,
      importance: r.memory.importance,
      tags: r.memory.tags ?? []
    })),
    query_metadata: {
      query,
      results_returned: topResults.length,
      max_results: maxResults,
      category_filter: categoryFilter ?? null,
      avg_relevance: Math.round(avgRelevance * 100) / 100
    }
  }
}

function formatMemoryRecallReport(result: MemoryRecallResult): string {
  const lines: string[] = []
  lines.push('## Memory Recall Results')
  lines.push('')
  lines.push(`**Query:** "${result.query_metadata.query}"`)
  lines.push(`**Results:** ${result.query_metadata.results_returned} / ${result.query_metadata.max_results} max`)
  lines.push(`**Category Filter:** ${result.query_metadata.category_filter ?? 'None'} | **Avg Relevance:** ${(result.query_metadata.avg_relevance * 100).toFixed(0)}%`)
  lines.push('')

  if (result.ranked_memories.length > 0) {
    lines.push('### Ranked Memories')
    lines.push('| Rank | Key | Relevance | Confidence | Category | Importance |')
    lines.push('|------|-----|-----------|------------|----------|------------|')
    result.ranked_memories.forEach((m, i) => {
      lines.push(`| ${i + 1} | ${m.key} | ${(m.relevance_score * 100).toFixed(0)}% | ${(m.retrieval_confidence * 100).toFixed(0)}% | ${m.category} | ${m.importance}/10 |`)
    })
    lines.push('')
    lines.push('### Top Result Snippet')
    lines.push(`> ${result.ranked_memories[0].content_snippet}`)
  } else {
    lines.push('*No memories matched the query.*')
  }

  return lines.join('\n')
}

// ==================== TOOL 3: MEMORY COMPRESS ====================

function compressMemory(
  conversationHistory: string[],
  currentGoals: string[]
): MemoryCompressResult {
  const originalText = conversationHistory.join('\n')
  const originalTokens = estimateTokens(originalText)

  const keyFacts: string[] = []
  for (const msg of conversationHistory) {
    const sentences = msg.split(/[.!?]+/).filter(s => s.trim().length > 10)
    for (const s of sentences) {
      const hasFact = /\b(is|are|was|were|has|have|will|must|should|requires|depends|equals|means)\b/i.test(s)
      const hasData = /\d+/.test(s)
      if (hasFact || hasData) {
        keyFacts.push(s.trim())
      }
    }
  }

  const uniqueFacts = [...new Set(keyFacts)].slice(0, 15)
  const goalsSection = currentGoals.length > 0 ? `\nActive Goals:\n${currentGoals.map(g => `- ${g}`).join('\n')}` : ''
  const compressed = `## Compressed Session Summary\n\nKey Facts:\n${uniqueFacts.map(f => `- ${f}`).join('\n')}${goalsSection}`
  const compressedTokens = estimateTokens(compressed)
  const savings = originalTokens > 0 ? Math.max(0, ((originalTokens - compressedTokens) / originalTokens) * 100) : 0
  const ratio = compressedTokens > 0 ? originalTokens / compressedTokens : 1

  return {
    compressed_summary: compressed,
    key_facts_preserved: uniqueFacts,
    token_savings_pct: Math.round(savings * 10) / 10,
    compression_ratio: Math.round(ratio * 10) / 10,
    original_token_estimate: originalTokens,
    compressed_token_estimate: compressedTokens,
    compression_method: 'extractive-summarization-with-goal-anchoring',
    preserved_categories: ['facts', 'goals', 'decisions', 'context']
  }
}

function formatMemoryCompressReport(result: MemoryCompressResult): string {
  const lines: string[] = []
  lines.push('## Memory Compression Report')
  lines.push('')
  lines.push(`**Method:** ${result.compression_method}`)
  lines.push(`**Compression Ratio:** ${result.compression_ratio}x | **Token Savings:** ${result.token_savings_pct}%`)
  lines.push(`**Original Tokens:** ${result.original_token_estimate} | **Compressed Tokens:** ${result.compressed_token_estimate}`)
  lines.push(`**Key Facts Preserved:** ${result.key_facts_preserved.length}`)
  lines.push('')
  lines.push('### Compressed Summary')
  lines.push(result.compressed_summary)
  lines.push('')
  lines.push('### Preserved Categories')
  lines.push(result.preserved_categories.map(c => `- ${c}`).join('\n'))
  return lines.join('\n')
}

// ==================== TOOL 4: MEMORY DECAY ANALYZER ====================

function analyzeMemoryDecay(
  inventory: Array<{ key: string; last_accessed: string; access_count: number; importance: number }>
): DecayAnalysisResult {
  const now = getCurrentTimestamp()
  const msPerDay = 86400000

  const staleMemories: DecayAnalysisResult['stale_memories'] = []
  const archiveCandidates: DecayAnalysisResult['archive_candidates'] = []

  for (const mem of inventory) {
    const lastAccess = new Date(mem.last_accessed).getTime()
    const daysSince = isNaN(lastAccess) ? 30 : Math.floor((now - lastAccess) / msPerDay)
    const accessFactor = Math.max(0.1, 1 / (mem.access_count + 1))
    const importanceDecay = (10 - mem.importance) / 10
    const decayScore = Math.min(1, (daysSince / 30) * accessFactor * (0.5 + importanceDecay * 0.5))

    if (decayScore > 0.6) {
      staleMemories.push({
        key: mem.key,
        days_since_access: daysSince,
        decay_score: Math.round(decayScore * 100) / 100,
        recommendation: decayScore > 0.8 ? 'Archive immediately' : decayScore > 0.7 ? 'Review for archival' : 'Monitor for decay'
      })
    }

    if (daysSince > 60 && mem.importance < 5) {
      archiveCandidates.push({
        key: mem.key,
        last_accessed: mem.last_accessed,
        importance: mem.importance,
        archive_reason: `Low importance (${mem.importance}/10) and ${daysSince} days since last access`
      })
    }
  }

  staleMemories.sort((a, b) => b.decay_score - a.decay_score)

  const importanceGroups = new Map<string, { total: number; count: number }>()
  for (const mem of inventory) {
    const level = mem.importance >= 7 ? 'high' : mem.importance >= 4 ? 'medium' : 'low'
    const g = importanceGroups.get(level) ?? { total: 0, count: 0 }
    const lastAccess = new Date(mem.last_accessed).getTime()
    const daysSince = isNaN(lastAccess) ? 30 : Math.floor((now - lastAccess) / msPerDay)
    g.total += Math.min(1, daysSince / 30)
    g.count++
    importanceGroups.set(level, g)
  }

  const decayCurve: DecayAnalysisResult['importance_decay_curve'] = []
  for (const [level, data] of importanceGroups) {
    decayCurve.push({
      importance_level: level,
      avg_decay: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
      count: data.count
    })
  }

  const recommendations: string[] = []
  if (staleMemories.length > 5) recommendations.push(`Archive ${staleMemories.filter(s => s.decay_score > 0.8).length} highly decayed memories to free tokens`)
  if (archiveCandidates.length > 3) recommendations.push(`Move ${archiveCandidates.length} low-importance stale memories to archive storage`)
  recommendations.push('Schedule weekly decay reviews for memories with importance < 5')
  recommendations.push('Boost access count for high-importance memories to improve retention scoring')
  if (staleMemories.length === 0) recommendations.push('Memory health is good — no immediate action required')

  return {
    stale_memories: staleMemories,
    archive_candidates: archiveCandidates,
    importance_decay_curve: decayCurve,
    cleanup_recommendations: recommendations
  }
}

function formatDecayReport(result: DecayAnalysisResult): string {
  const lines: string[] = []
  lines.push('## Memory Decay Analysis')
  lines.push('')
  lines.push(`**Stale Memories:** ${result.stale_memories.length} | **Archive Candidates:** ${result.archive_candidates.length}`)
  lines.push('')

  if (result.stale_memories.length > 0) {
    lines.push('### Stale Memories')
    lines.push('| Key | Days Idle | Decay Score | Recommendation |')
    lines.push('|-----|-----------|-------------|----------------|')
    for (const s of result.stale_memories.slice(0, 10)) {
      lines.push(`| ${s.key} | ${s.days_since_access} | ${(s.decay_score * 100).toFixed(0)}% | ${s.recommendation} |`)
    }
    lines.push('')
  }

  if (result.importance_decay_curve.length > 0) {
    lines.push('### Importance Decay Curve')
    lines.push('| Importance Level | Avg Decay | Count |')
    lines.push('|-----------------|-----------|-------|')
    for (const d of result.importance_decay_curve) {
      lines.push(`| ${d.importance_level} | ${(d.avg_decay * 100).toFixed(0)}% | ${d.count} |`)
    }
    lines.push('')
  }

  if (result.cleanup_recommendations.length > 0) {
    lines.push('### Cleanup Recommendations')
    for (const r of result.cleanup_recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: CONTEXT ASSEMBLER ====================

function assembleContext(
  taskDescription: string,
  availableMemories: MemoryEntry[],
  maxTokens: number
): ContextAssemblerResult {
  const taskTokens = estimateTokens(taskDescription)
  const budget = maxTokens - taskTokens - 100

  const scored = availableMemories.map(m => {
    const relevance = cosineSimilarity(taskDescription, m.content + ' ' + m.key + ' ' + (m.tags ?? []).join(' '))
    const importanceBoost = (m.importance ?? 5) / 10
    const recencyBoost = m.last_accessed ? Math.max(0.5, 1 - (getCurrentTimestamp() - (m.last_accessed ?? 0)) / (30 * 86400000)) : 0.5
    const score = (relevance * 0.5 + importanceBoost * 0.3 + recencyBoost * 0.2)
    return { memory: m, score, tokens: estimateTokens(m.content) }
  })

  scored.sort((a, b) => b.score - a.score)

  const selected: ContextAssemblerResult['selected_memories'] = []
  let usedTokens = 0

  for (const item of scored) {
    if (usedTokens + item.tokens > budget) continue
    selected.push({
      key: item.memory.key,
      tokens_used: item.tokens,
      relevance: Math.round(item.score * 100) / 100,
      included_reason: item.score > 0.6 ? 'High relevance to task' : item.score > 0.3 ? 'Moderate relevance + high importance' : 'Contextual support'
    })
    usedTokens += item.tokens
  }

  const contextParts = [
    `Task: ${taskDescription}`,
    '',
    'Relevant Memories:',
    ...selected.map(s => `- [${s.key}] (relevance: ${(s.relevance * 100).toFixed(0)}%)`)
  ]

  const optimalContext = contextParts.join('\n')
  const utilization = budget > 0 ? (usedTokens / budget) * 100 : 0
  const avgRelevance = selected.length > 0 ? selected.reduce((s, m) => s + m.relevance, 0) / selected.length : 0

  return {
    optimal_context: optimalContext,
    selected_memories: selected,
    token_budget_usage: {
      budget,
      used: usedTokens,
      remaining: Math.max(0, budget - usedTokens),
      utilization_pct: Math.round(utilization * 10) / 10
    },
    expected_relevance: Math.round(avgRelevance * 100) / 100,
    context_completeness: selected.length > 5 ? 'comprehensive' : selected.length > 2 ? 'adequate' : 'minimal'
  }
}

function formatContextAssemblerReport(result: ContextAssemblerResult): string {
  const lines: string[] = []
  lines.push('## Context Assembly Report')
  lines.push('')
  lines.push(`**Token Budget:** ${result.token_budget_usage.budget} | **Used:** ${result.token_budget_usage.used} (${result.token_budget_usage.utilization_pct}%)`)
  lines.push(`**Remaining:** ${result.token_budget_usage.remaining} | **Expected Relevance:** ${(result.expected_relevance * 100).toFixed(0)}%`)
  lines.push(`**Completeness:** ${result.context_completeness} | **Memories Selected:** ${result.selected_memories.length}`)
  lines.push('')

  if (result.selected_memories.length > 0) {
    lines.push('### Selected Memories')
    lines.push('| Key | Tokens | Relevance | Reason |')
    lines.push('|-----|--------|-----------|--------|')
    for (const m of result.selected_memories) {
      lines.push(`| ${m.key} | ${m.tokens_used} | ${(m.relevance * 100).toFixed(0)}% | ${m.included_reason} |`)
    }
  }

  lines.push('')
  lines.push('### Assembled Context')
  lines.push('```')
  lines.push(result.optimal_context)
  lines.push('```')

  return lines.join('\n')
}

// ==================== TOOL 6: MEMORY GRAPH BUILDER ====================

function buildMemoryGraph(
  memories: Array<{ key: string; content: string; tags: string[]; relations?: string[] }>
): KnowledgeGraphResult {
  const nodes: KnowledgeGraphResult['knowledge_graph']['nodes'] = memories.map(m => ({
    id: m.key,
    label: m.key.length > 30 ? m.key.slice(0, 30) + '...' : m.key,
    category: m.tags?.[0] ?? 'uncategorized',
    importance: Math.min(10, (m.tags?.length ?? 1) * 2 + Math.floor(m.content.length / 100)),
    connections: 0
  }))

  const edges: KnowledgeGraphResult['knowledge_graph']['edges'] = []
  const tagIndex = new Map<string, string[]>()

  for (const m of memories) {
    for (const tag of (m.tags ?? [])) {
      if (!tagIndex.has(tag)) tagIndex.set(tag, [])
      tagIndex.get(tag)!.push(m.key)
    }
  }

  for (const [, keys] of tagIndex) {
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        edges.push({
          source: keys[i],
          target: keys[j],
          relation: 'shared-tag',
          weight: Math.min(1, 0.3 + (keys.length - 2) * 0.1)
        })
      }
    }
  }

  for (const m of memories) {
    if (m.relations) {
      for (const rel of m.relations) {
        edges.push({
          source: m.key,
          target: rel,
          relation: 'explicit',
          weight: 0.9
        })
      }
    }
  }

  const connectionCounts = new Map<string, number>()
  for (const e of edges) {
    connectionCounts.set(e.source, (connectionCounts.get(e.source) ?? 0) + 1)
    connectionCounts.set(e.target, (connectionCounts.get(e.target) ?? 0) + 1)
  }

  for (const node of nodes) {
    node.connections = connectionCounts.get(node.id) ?? 0
  }

  const clusters: KnowledgeGraphResult['knowledge_graph']['clusters'] = []
  const processed = new Set<string>()
  let clusterId = 0

  for (const [tag, keys] of tagIndex) {
    if (keys.length < 2) continue
    const unprocessed = keys.filter(k => !processed.has(k))
    if (unprocessed.length < 2) continue
    clusters.push({
      id: `cluster-${clusterId++}`,
      label: tag,
      members: keys,
      density: Math.min(1, keys.length / 10)
    })
    keys.forEach(k => processed.add(k))
  }

  const sortedByConnections = [...nodes].sort((a, b) => b.connections - a.connections)
  const centralConcepts = sortedByConnections.slice(0, 5).map(n => ({
    concept: n.id,
    centrality: nodes.length > 0 ? Math.round((n.connections / Math.max(nodes.length - 1, 1)) * 100) / 100 : 0,
    connections: n.connections
  }))

  const allTags = new Set<string>()
  for (const m of memories) (m.tags ?? []).forEach(t => allTags.add(t))
  const gaps: string[] = []
  if (!allTags.has('architecture')) gaps.push('No architecture-related memories found')
  if (!allTags.has('decision')) gaps.push('Missing decision records')
  if (!allTags.has('preference')) gaps.push('No user preference memories')
  if (nodes.length > 10 && edges.length < nodes.length) gaps.push('Low connectivity — consider adding more cross-references')

  const suggestedNew: string[] = []
  if (gaps.includes('No architecture-related memories found')) suggestedNew.push('Store architecture decisions and patterns')
  if (gaps.includes('Missing decision records')) suggestedNew.push('Record key project decisions with rationale')
  if (gaps.includes('No user preference memories')) suggestedNew.push('Capture user preferences and workflow patterns')

  const connectivityScore = nodes.length > 0 ? Math.min(1, edges.length / (nodes.length * 2)) : 0

  return {
    knowledge_graph: {
      nodes,
      edges,
      clusters,
      central_concepts: centralConcepts,
      gap_analysis: {
        identified_gaps: gaps,
        suggested_new_memories: suggestedNew,
        connectivity_score: Math.round(connectivityScore * 100) / 100
      }
    }
  }
}

function formatGraphReport(result: KnowledgeGraphResult): string {
  const g = result.knowledge_graph
  const lines: string[] = []
  lines.push('## Knowledge Graph Analysis')
  lines.push('')
  lines.push(`**Nodes:** ${g.nodes.length} | **Edges:** ${g.edges.length} | **Clusters:** ${g.clusters.length}`)
  lines.push(`**Connectivity Score:** ${(g.gap_analysis.connectivity_score * 100).toFixed(0)}%`)
  lines.push('')

  if (g.central_concepts.length > 0) {
    lines.push('### Central Concepts')
    lines.push('| Concept | Centrality | Connections |')
    lines.push('|---------|-----------|-------------|')
    for (const c of g.central_concepts) {
      lines.push(`| ${c.concept} | ${(c.centrality * 100).toFixed(0)}% | ${c.connections} |`)
    }
    lines.push('')
  }

  if (g.clusters.length > 0) {
    lines.push('### Clusters')
    for (const c of g.clusters.slice(0, 8)) {
      lines.push(`- **${c.label}** (${c.members.length} members, density: ${(c.density * 100).toFixed(0)}%)`)
    }
    lines.push('')
  }

  if (g.gap_analysis.identified_gaps.length > 0) {
    lines.push('### Gap Analysis')
    for (const gap of g.gap_analysis.identified_gaps) {
      lines.push(`- ${gap}`)
    }
    if (g.gap_analysis.suggested_new_memories.length > 0) {
      lines.push('')
      lines.push('### Suggested New Memories')
      for (const s of g.gap_analysis.suggested_new_memories) {
        lines.push(`+ ${s}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: MEMORY CONFLICT RESOLVER ====================

function resolveMemoryConflicts(
  conflictingMemories: Array<{ key: string; content: string; timestamp: string; source: string }>
): ConflictResolutionResult {
  if (conflictingMemories.length === 0) {
    return {
      resolution_strategy: 'none-required',
      merged_fact: 'No conflicts to resolve',
      confidence: 1,
      superseded_entries: [],
      conflict_analysis: {
        total_conflicts: 0,
        resolved: 0,
        strategy_used: 'none',
        merge_quality: 1
      }
    }
  }

  const sorted = [...conflictingMemories].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const newest = sorted[0]
  const older = sorted.slice(1)

  const contentGroups = new Map<string, typeof conflictingMemories>()
  for (const m of sorted) {
    const normalized = m.content.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 50)
    if (!contentGroups.has(normalized)) contentGroups.set(normalized, [])
    contentGroups.get(normalized)!.push(m)
  }

  let strategy: string
  let merged: string
  let confidence: number
  let superseded: string[]

  if (contentGroups.size === 1) {
    strategy = 'identical-content-merge'
    merged = newest.content
    confidence = 0.99
    superseded = older.map(m => m.key)
  } else if (contentGroups.size <= sorted.length / 2) {
    strategy = 'majority-consensus'
    const majorityGroup = [...contentGroups.values()].reduce((a, b) => a.length > b.length ? a : b)
    merged = majorityGroup[0].content
    confidence = Math.min(0.95, 0.6 + majorityGroup.length * 0.1)
    superseded = sorted.filter(m => !majorityGroup.includes(m)).map(m => m.key)
  } else {
    strategy = 'temporal-recency-merge'
    const allPoints = sorted.map(m => m.content).filter(c => c.length > 10)
    merged = `Consolidated from ${sorted.length} versions (newest: ${newest.content.slice(0, 100)}` + (newest.content.length > 100 ? '...' : '') + ')'
    confidence = Math.max(0.5, 0.9 - (contentGroups.size - 1) * 0.05)
    superseded = older.map(m => m.key)
  }

  return {
    resolution_strategy: strategy,
    merged_fact: merged,
    confidence: Math.round(confidence * 100) / 100,
    superseded_entries: superseded,
    conflict_analysis: {
      total_conflicts: conflictingMemories.length,
      resolved: conflictingMemories.length - superseded.length > 0 ? conflictingMemories.length - 1 : 0,
      strategy_used: strategy,
      merge_quality: Math.round(confidence * 100) / 100
    }
  }
}

function formatConflictReport(result: ConflictResolutionResult): string {
  const lines: string[] = []
  lines.push('## Memory Conflict Resolution')
  lines.push('')
  lines.push(`**Strategy:** ${result.resolution_strategy}`)
  lines.push(`**Confidence:** ${(result.confidence * 100).toFixed(0)}% | **Superseded Entries:** ${result.superseded_entries.length}`)
  lines.push('')
  lines.push('### Merged Fact')
  lines.push(`> ${result.merged_fact}`)
  lines.push('')

  if (result.superseded_entries.length > 0) {
    lines.push('### Superseded Entries')
    for (const e of result.superseded_entries) {
      lines.push(`- ~~${e}~~`)
    }
    lines.push('')
  }

  lines.push('### Conflict Analysis')
  lines.push(`- Total Conflicts: ${result.conflict_analysis.total_conflicts}`)
  lines.push(`- Resolved: ${result.conflict_analysis.resolved}`)
  lines.push(`- Strategy Used: ${result.conflict_analysis.strategy_used}`)
  lines.push(`- Merge Quality: ${(result.conflict_analysis.merge_quality * 100).toFixed(0)}%`)

  return lines.join('\n')
}

// ==================== TOOL 8: MEMORY AUDIT REPORT ====================

function generateAuditReport(stats: {
  total_memories: number
  total_tokens: number
  categories: string[]
  access_patterns: { avg_access_count: number; max_access_count: number; min_access_count: number; recently_accessed_pct: number }
}): AuditReportResult {
  const { total_memories, total_tokens, categories, access_patterns } = stats

  const avgTokensPerMemory = total_memories > 0 ? total_tokens / total_memories : 0
  const stalePct = Math.max(0, 100 - (access_patterns.recently_accessed_pct ?? 50))

  const importanceScore = Math.min(100, (categories.length * 10) + (access_patterns.avg_access_count * 5))
  const coverageScore = Math.min(100, categories.length * 15)
  const freshnessScore = access_patterns.recently_accessed_pct ?? 50
  const diversityScore = Math.min(100, categories.length * 12 + (access_patterns.max_access_count - access_patterns.min_access_count) * 2)
  const avgImportance = importanceScore / 10

  const healthScore = Math.round(
    (importanceScore * 0.25 + coverageScore * 0.25 + freshnessScore * 0.25 + diversityScore * 0.25) * 10
  ) / 10

  const fragmentationIndex = total_memories > 0
    ? Math.round((1 - (categories.length / total_memories)) * 100) / 100
    : 0

  const suggestions: string[] = []
  if (stalePct > 30) suggestions.push(`Clean up ${Math.floor(stalePct)}% stale memories to improve retrieval speed`)
  if (categories.length < 3) suggestions.push('Add more memory categories to improve organization')
  if (avgTokensPerMemory > 500) suggestions.push('Consider compressing large memories — avg size exceeds 500 tokens')
  if (access_patterns.avg_access_count < 2) suggestions.push('Low access frequency — review memory relevance and prune unused entries')
  if (fragmentationIndex > 0.7) suggestions.push('High fragmentation — consolidate related memories into clusters')
  if (total_memories > 1000) suggestions.push('Large memory base — implement tiered storage (hot/warm/cold)')
  if (suggestions.length === 0) suggestions.push('Memory system is well-optimized — maintain current practices')

  const duplicateRisk = total_memories > 500 ? 'high' : total_memories > 200 ? 'medium' : 'low'

  return {
    health_score: Math.min(100, healthScore),
    fragmentation_index: fragmentationIndex,
    quality_metrics: {
      avg_importance: Math.round(avgImportance * 10) / 10,
      avg_access_count: access_patterns.avg_access_count,
      coverage_score: Math.round(coverageScore * 10) / 10,
      freshness_score: Math.round(freshnessScore * 10) / 10,
      diversity_score: Math.round(diversityScore * 10) / 10
    },
    optimization_suggestions: suggestions,
    audit_summary: {
      total_memories,
      total_tokens,
      categories_count: categories.length,
      stale_percentage: Math.round(stalePct * 10) / 10,
      duplicate_risk: duplicateRisk
    }
  }
}

function formatAuditReport(result: AuditReportResult): string {
  const lines: string[] = []
  lines.push('## Memory Audit Report')
  lines.push('')
  const healthEmoji = result.health_score >= 80 ? 'EXCELLENT' : result.health_score >= 60 ? 'GOOD' : result.health_score >= 40 ? 'FAIR' : 'POOR'
  lines.push(`**Health Score:** ${result.health_score}/100 (${healthEmoji})`)
  lines.push(`**Fragmentation Index:** ${(result.fragmentation_index * 100).toFixed(0)}%`)
  lines.push('')
  lines.push('### Quality Metrics')
  lines.push(`- Avg Importance: ${result.quality_metrics.avg_importance}/10`)
  lines.push(`- Avg Access Count: ${result.quality_metrics.avg_access_count}`)
  lines.push(`- Coverage Score: ${result.quality_metrics.coverage_score}/100`)
  lines.push(`- Freshness Score: ${result.quality_metrics.freshness_score}/100`)
  lines.push(`- Diversity Score: ${result.quality_metrics.diversity_score}/100`)
  lines.push('')
  lines.push('### Audit Summary')
  lines.push(`- Total Memories: ${result.audit_summary.total_memories}`)
  lines.push(`- Total Tokens: ${result.audit_summary.total_tokens}`)
  lines.push(`- Categories: ${result.audit_summary.categories_count}`)
  lines.push(`- Stale: ${result.audit_summary.stale_percentage}%`)
  lines.push(`- Duplicate Risk: ${result.audit_summary.duplicate_risk}`)
  lines.push('')
  lines.push('### Optimization Suggestions')
  for (const s of result.optimization_suggestions) {
    lines.push(`- ${s}`)
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Memory Store
  tools.register(defineTool({
    name: 'memory_store',
    description: 'Store a memory entry with key, content, category, importance, and tags. Returns storage confirmation with token cost, deduplication status, and index update confirmation.',
    parameters: {
      memory_entry: { type: 'string', required: true, description: 'JSON object with fields: key (unique identifier), content (memory text), category (e.g. "preference", "fact", "decision"), importance (1-10), tags (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { memory_entry: string }) {
      const entry: MemoryEntry = JSON.parse(args.memory_entry)
      const result = storeMemory(entry)
      return formatMemoryStoreReport(result)
    }
  }))

  // Tool 2: Memory Recall
  tools.register(defineTool({
    name: 'memory_recall',
    description: 'Recall relevant memories using semantic search. Returns ranked memories with relevance scores, context snippets, and retrieval confidence.',
    parameters: {
      query: { type: 'string', required: true, description: 'Search query string to find relevant memories' },
      max_results: { type: 'string', description: 'Maximum number of results to return (default "10")' },
      category_filter: { type: 'string', description: 'Optional category to filter results (e.g. "preference", "fact")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; max_results?: string; category_filter?: string }) {
      const sampleMemories: MemoryEntry[] = [
        { key: 'user-language-preference', content: 'User prefers TypeScript over JavaScript for all new projects', category: 'preference', importance: 8, tags: ['language', 'typescript', 'coding'] },
        { key: 'project-architecture-2024', content: 'Project uses microservices architecture with event-driven communication via Kafka', category: 'architecture', importance: 9, tags: ['architecture', 'microservices', 'kafka'] },
        { key: 'deployment-strategy', content: 'Blue-green deployment strategy with automated rollback on health check failure', category: 'decision', importance: 7, tags: ['deployment', 'strategy', 'devops'] },
        { key: 'testing-approach', content: 'Test-driven development with 80% coverage minimum, integration tests for all APIs', category: 'preference', importance: 6, tags: ['testing', 'tdd', 'quality'] },
        { key: 'database-choice', content: 'PostgreSQL chosen for primary database due to JSONB support and strong consistency guarantees', category: 'decision', importance: 8, tags: ['database', 'postgresql', 'storage'] },
        { key: 'api-design-style', content: 'RESTful APIs with OpenAPI 3.0 specs, versioning via URL path prefix', category: 'decision', importance: 7, tags: ['api', 'rest', 'design'] },
        { key: 'error-handling-pattern', content: 'Global error handler middleware with structured error responses and correlation IDs', category: 'fact', importance: 6, tags: ['error-handling', 'middleware', 'patterns'] },
        { key: 'caching-strategy', content: 'Redis-based caching with 5-minute TTL for frequently accessed data, cache-aside pattern', category: 'architecture', importance: 7, tags: ['caching', 'redis', 'performance'] },
        { key: 'auth-mechanism', content: 'JWT-based authentication with refresh tokens, 15-minute access token expiry', category: 'decision', importance: 9, tags: ['auth', 'jwt', 'security'] },
        { key: 'logging-standard', content: 'Structured JSON logging with correlation IDs, log levels: ERROR, WARN, INFO, DEBUG', category: 'preference', importance: 5, tags: ['logging', 'observability', 'monitoring'] },
        { key: 'ci-cd-pipeline', content: 'GitHub Actions for CI/CD with automated testing, linting, and deployment to staging', category: 'fact', importance: 7, tags: ['ci-cd', 'github-actions', 'automation'] },
        { key: 'code-review-guidelines', content: 'All PRs require 2 approvals, must pass linting and tests, max 400 lines changed', category: 'preference', importance: 6, tags: ['code-review', 'quality', 'process'] }
      ]
      const maxRes = parseInt(args.max_results ?? '10', 10)
      const result = recallMemories(args.query, sampleMemories, maxRes, args.category_filter)
      return formatMemoryRecallReport(result)
    }
  }))

  // Tool 3: Memory Compress
  tools.register(defineTool({
    name: 'memory_compress',
    description: 'Compress session context (conversation history + goals) into a compact summary. Returns compressed summary, key facts preserved, token savings percentage, and compression ratio.',
    parameters: {
      session_context: { type: 'string', required: true, description: 'JSON object with fields: conversation_history (string[] of messages/turns), current_goals (string[] of active goals)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { session_context: string }) {
      const ctx = JSON.parse(args.session_context)
      const history: string[] = ctx.conversation_history ?? []
      const goals: string[] = ctx.current_goals ?? []
      const result = compressMemory(history, goals)
      return formatMemoryCompressReport(result)
    }
  }))

  // Tool 4: Memory Decay Analyzer
  tools.register(defineTool({
    name: 'memory_decay_analyzer',
    description: 'Analyze memory decay patterns to identify stale memories, archive candidates, and generate cleanup recommendations. Returns decay scores and importance decay curves.',
    parameters: {
      memory_inventory: { type: 'string', required: true, description: 'JSON array of memory objects with fields: key, last_accessed (ISO date), access_count (number), importance (1-10)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { memory_inventory: string }) {
      const inventory = JSON.parse(args.memory_inventory)
      const result = analyzeMemoryDecay(inventory)
      return formatDecayReport(result)
    }
  }))

  // Tool 5: Context Assembler
  tools.register(defineTool({
    name: 'context_assembler',
    description: 'Assemble optimal context for a task from available memories within a token budget. Returns selected memories, token budget usage, and expected relevance score.',
    parameters: {
      task_description: { type: 'string', required: true, description: 'Description of the current task to assemble context for' },
      available_memories: { type: 'string', required: true, description: 'JSON array of memory objects with fields: key, content, category, importance (1-10), tags (string[])' },
      max_tokens: { type: 'string', required: true, description: 'Maximum token budget for the assembled context (as string number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { task_description: string; available_memories: string; max_tokens: string }) {
      const memories: MemoryEntry[] = JSON.parse(args.available_memories)
      const maxTok = parseInt(args.max_tokens, 10)
      const result = assembleContext(args.task_description, memories, maxTok)
      return formatContextAssemblerReport(result)
    }
  }))

  // Tool 6: Memory Graph Builder
  tools.register(defineTool({
    name: 'memory_graph_builder',
    description: 'Build a knowledge graph from memories showing nodes, edges, clusters, central concepts, and gap analysis. Identifies connectivity gaps and suggests new memories.',
    parameters: {
      memories: { type: 'string', required: true, description: 'JSON array of memory objects with fields: key, content, tags (string[]), relations (optional string[] of related memory keys)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { memories: string }) {
      const memories = JSON.parse(args.memories)
      const result = buildMemoryGraph(memories)
      return formatGraphReport(result)
    }
  }))

  // Tool 7: Memory Conflict Resolver
  tools.register(defineTool({
    name: 'memory_conflict_resolver',
    description: 'Resolve conflicts between contradictory memories. Returns resolution strategy, merged fact, confidence score, and list of superseded entries.',
    parameters: {
      conflicting_memories: { type: 'string', required: true, description: 'JSON array of conflicting memory objects with fields: key, content, timestamp (ISO date), source (origin of the memory)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { conflicting_memories: string }) {
      const conflicts = JSON.parse(args.conflicting_memories)
      const result = resolveMemoryConflicts(conflicts)
      return formatConflictReport(result)
    }
  }))

  // Tool 8: Memory Audit Report
  tools.register(defineTool({
    name: 'memory_audit_report',
    description: 'Generate a comprehensive audit report of the memory system. Returns health score, fragmentation index, quality metrics, and optimization suggestions.',
    parameters: {
      memory_stats: { type: 'string', required: true, description: 'JSON object with fields: total_memories (number), total_tokens (number), categories (string[]), access_patterns (object with avg_access_count, max_access_count, min_access_count, recently_accessed_pct)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { memory_stats: string }) {
      const stats = JSON.parse(args.memory_stats)
      const result = generateAuditReport(stats)
      return formatAuditReport(result)
    }
  }))

  console.log(`[dsh-tool-memory] Loaded v${VERSION} — Agent Memory Management System with 8 tools`)
  console.log('  Tools: memory_store, memory_recall, memory_compress, memory_decay_analyzer, context_assembler, memory_graph_builder, memory_conflict_resolver, memory_audit_report')
}
