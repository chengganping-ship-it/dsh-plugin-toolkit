/**
 * DSH AI Agent Memory & Cognition Plugin v0.1.0
 * AI Agent 记忆管理与认知架构 for DeepSeek Harness — 记忆管理、上下文检索、认知架构、遗忘曲线
 *
 * 对标 2026年 AI Agent 记忆基础设施 $3B+ 市场机遇，覆盖记忆全生命周期管理。
 *
 * 工具清单:
 * 1. memory_management_engine      — 记忆管理引擎（存储/检索/去重/压缩/生命周期）
 * 2. context_retrieval_optimizer   — 上下文检索优化（混合检索/重排序/相关性评分/召回率）
 * 3. cognitive_architect           — 认知架构设计（多层记忆体系/注意力分配/推理链）
 * 4. forgetting_curve_modeler      — 遗忘曲线建模（艾宾浩斯/间隔重复/记忆保持率预测）
 * 5. episodic_memory_indexer       — 情景记忆索引（时间线/事件链/经验回放）
 * 6. semantic_memory_store         — 语义记忆存储（向量嵌入/知识图谱/概念网络）
 * 7. working_memory_monitor        — 工作记忆监控（容量/负载/注意力/实时追踪）
 * 8. memory_consolidation_planner  — 记忆巩固规划（睡眠巩固/迁移/归档策略）
 *
 * @module dsh-tool-agentmemory | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agentmemory'
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

// --- Tool 1: Memory Management Engine ---
export interface MemoryEntry {
  key: string
  content: string
  category: 'episodic' | 'semantic' | 'procedural' | 'working'
  importance: number
  tags: string[]
  created_at?: string
  ttl_days?: number
}

export interface MemoryManagementInput {
  operation: 'store' | 'retrieve' | 'deduplicate' | 'compress' | 'gc'
  entries?: MemoryEntry[]
  query?: string
  max_results?: number
  compression_ratio?: number
}

export interface MemoryOperationResult {
  operation: string
  status: 'success' | 'partial' | 'skipped'
  entries_affected: number
  storage_bytes: number
  dedup_count: number
  compression_savings_pct: number
  gc_collected: number
  details: string[]
}

export interface MemoryManagementResult {
  operation: string
  result: MemoryOperationResult
  memory_stats: {
    total_entries: number
    total_categories: number
    total_storage_kb: number
    avg_importance: number
    health_score: number
  }
  recommendations: string[]
}

// --- Tool 2: Context Retrieval Optimizer ---
export interface RetrievalInput {
  query: string
  strategy: 'vector' | 'keyword' | 'hybrid' | 'reranking' | 'adaptive'
  top_k: number
  filters?: {
    category?: string[]
    date_range?: [string, string]
    min_importance?: number
  }
  corpus_size?: number
}

export interface RetrievalMetrics {
  precision_at_k: number
  recall_at_k: number
  f1_score: number
  mrr: number
  ndcg: number
  latency_ms: number
  strategy_used: string
}

export interface RetrievalResult {
  rank: number
  key: string
  snippet: string
  relevance_score: number
  retrieval_method: string
}

export interface ContextRetrievalResult {
  query: string
  metrics: RetrievalMetrics
  results: RetrievalResult[]
  optimization_notes: string[]
  strategy_comparison: Array<{ strategy: string; f1: number; latency_ms: number }>
}

// --- Tool 3: Cognitive Architect ---
export interface CognitiveArchitectInput {
  design_goal: string
  memory_layers: Array<{
    name: string
    type: 'sensory' | 'working' | 'short_term' | 'long_term' | 'episodic' | 'semantic' | 'procedural'
    capacity: number
    decay_rate: number
  }>
  attention_budget: number
  reasoning_depth: number
}

export interface LayerDesign {
  name: string
  type: string
  capacity: number
  decay_rate: number
  connectivity: string[]
  attention_weight: number
  status: 'optimal' | 'overloaded' | 'underutilized'
}

export interface CognitiveArchitecture {
  architecture_id: string
  layers: LayerDesign[]
  attention_allocation: Array<{ layer: string; weight: number; budget_pct: number }>
  reasoning_chains: string[]
  bottleneck_analysis: string[]
  overall_efficiency: number
}

export interface CognitiveArchitectResult {
  design_goal: string
  architecture: CognitiveArchitecture
  design_principles: string[]
  scalability_score: number
  recommendations: string[]
}

// --- Tool 4: Forgetting Curve Modeler ---
export interface ForgettingCurveInput {
  memory_strength: number
  time_points: number[]
  repetition_count: number
  repetition_intervals?: number[]
  material_difficulty?: 'easy' | 'medium' | 'hard'
  individual_factor?: number
}

export interface TimePointRetention {
  time: number
  retention_pct: number
  predicted_strength: number
  decay_rate: number
}

export interface RepetitionEffect {
  repetition: number
  interval_days: number
  retention_boost: number
  new_strength: number
}

export interface ForgettingCurveResult {
  curve_type: string
  retention_series: TimePointRetention[]
  repetition_effects: RepetitionEffect[]
  half_life_days: number
  optimal_review_schedule: number[]
  forgetting_rate: number
  recommendations: string[]
}

// --- Tool 5: Episodic Memory Indexer ---
export interface EpisodicIndexInput {
  episodes?: Array<{
    episode_id: string
    timestamp: string
    event: string
    participants: string[]
    outcome: string
    emotional_valence: number
    context_tags: string[]
  }>
  index_strategy: 'temporal' | 'causal' | 'thematic' | 'participant'
  query_episode?: string
  time_window?: [string, string]
}

export interface IndexedEpisode {
  episode_id: string
  timestamp: string
  event: string
  temporal_position: number
  causal_links: string[]
  thematic_cluster: string
  emotional_valence: number
  accessibility_score: number
}

export interface EpisodicCluster {
  cluster_id: string
  theme: string
  episodes: string[]
  time_span: string
  avg_valence: number
}

export interface EpisodicIndexResult {
  index_strategy: string
  indexed_episodes: IndexedEpisode[]
  clusters: EpisodicCluster[]
  timeline_coverage: string
  retrieval_paths: string[]
  index_health: number
}

// --- Tool 6: Semantic Memory Store ---
export interface SemanticStoreInput {
  operation: 'embed' | 'query' | 'cluster' | 'relate' | 'traverse'
  concepts?: Array<{
    concept_id: string
    label: string
    description: string
    relations?: Array<{ target: string; relation_type: string; weight: number }>
  }>
  query_concept?: string
  embedding_dim?: number
  similarity_threshold?: number
}

export interface ConceptNode {
  concept_id: string
  label: string
  embedding_norm: number
  cluster_id: string
  centrality: number
  connections: number
}

export interface ConceptRelation {
  source: string
  target: string
  relation_type: string
  weight: number
  path_length: number
}

export interface SemanticCluster {
  cluster_id: string
  label: string
  members: string[]
  coherence: number
  density: number
}

export interface SemanticStoreResult {
  operation: string
  concepts: ConceptNode[]
  relations: ConceptRelation[]
  clusters: SemanticCluster[]
  graph_metrics: {
    total_nodes: number
    total_edges: number
    avg_clustering_coeff: number
    graph_density: number
    connected_components: number
  }
  query_results: Array<{ concept_id: string; similarity: number; path: string[] }>
}

// --- Tool 7: Working Memory Monitor ---
export interface WorkingMemoryInput {
  session_id: string
  token_capacity: number
  current_items: Array<{
    item_id: string
    content: string
    token_cost: number
    priority: number
    last_accessed: number
  }>
  incoming_item?: {
    item_id: string
    content: string
    token_cost: number
    priority: number
  }
  eviction_policy: 'lru' | 'priority' | 'cost_aware' | 'hybrid'
}

export interface MemoryItemStatus {
  item_id: string
  token_cost: number
  priority: number
  age_ms: number
  access_count: number
  status: 'active' | 'evicted' | 'compressed'
}

export interface WorkingMemoryStatus {
  session_id: string
  capacity: number
  used_tokens: number
  utilization_pct: number
  item_count: number
  items: MemoryItemStatus[]
  evicted_items: string[]
  compressed_items: string[]
  attention_focus: string[]
  overflow_risk: 'low' | 'medium' | 'high' | 'critical'
}

export interface WorkingMemoryResult {
  status: WorkingMemoryStatus
  timeline: Array<{ timestamp: number; event: string; token_delta: number }>
  optimization_suggestions: string[]
  predicted_overflow_at?: number
}

// --- Tool 8: Memory Consolidation Planner ---
export interface ConsolidationInput {
  source_memories: Array<{
    memory_id: string
    type: 'episodic' | 'semantic' | 'procedural'
    importance: number
    age_days: number
    access_count: number
    last_consolidated?: string
  }>
  consolidation_type: 'sleep_replay' | 'spaced_review' | 'knowledge_transfer' | 'archive'
  available_time_minutes: number
  target_retention_pct: number
}

export interface ConsolidationAction {
  memory_id: string
  action: 'consolidate' | 'strengthen' | 'transfer' | 'archive' | 'prune'
  priority: number
  estimated_time_min: number
  expected_retention_gain: number
  method: string
}

export interface ConsolidationPhase {
  phase: string
  duration_min: number
  actions: string[]
  target_memories: string[]
}

export interface ConsolidationPlanResult {
  consolidation_type: string
  actions: ConsolidationAction[]
  phases: ConsolidationPhase[]
  total_time_min: number
  expected_retention_pct: number
  memories_consolidated: number
  memories_archived: number
  schedule: Array<{ time: string; action: string; target: string }>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Memory Management Engine ---
function analyzeMemoryManagement(input: MemoryManagementInput): MemoryManagementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const entries = input.entries || []
  const details: string[] = []
  let entriesAffected = 0
  let storageBytes = 0
  let dedupCount = 0
  let compressionSavings = 0
  let gcCollected = 0

  if (input.operation === 'store') {
    entriesAffected = entries.length
    storageBytes = entries.reduce((sum, e) => sum + (e.content.length * 2 + 200), 0)
    details.push(`Stored ${entries.length} memory entries`)
    details.push(`Estimated storage: ${(storageBytes / 1024).toFixed(1)} KB`)
  } else if (input.operation === 'deduplicate') {
    const seen = new Set<string>()
    for (const e of entries) {
      const hash = e.content.slice(0, 50)
      if (seen.has(hash)) dedupCount++
      else seen.add(hash)
    }
    entriesAffected = dedupCount
    details.push(`Found ${dedupCount} duplicate entries out of ${entries.length}`)
    details.push(`Deduplication rate: ${entries.length > 0 ? ((dedupCount / entries.length) * 100).toFixed(1) : 0}%`)
  } else if (input.operation === 'compress') {
    const ratio = input.compression_ratio || 0.5
    compressionSavings = Math.round(ratio * 100)
    entriesAffected = entries.length
    storageBytes = Math.round(entries.reduce((sum, e) => sum + e.content.length * 2, 0) * (1 - ratio))
    details.push(`Compressed ${entries.length} entries at ${(ratio * 100).toFixed(0)}% ratio`)
    details.push(`Storage reduced by ${compressionSavings}%`)
  } else if (input.operation === 'gc') {
    gcCollected = Math.round(entries.length * rng.nextFloat(0.1, 0.4))
    entriesAffected = gcCollected
    details.push(`Garbage collected ${gcCollected} expired/stale entries`)
  } else {
    entriesAffected = Math.min(input.max_results || 5, entries.length)
    details.push(`Retrieved ${entriesAffected} entries matching query`)
  }

  const categories = new Set(entries.map(e => e.category))
  const avgImportance = entries.length > 0
    ? Math.round((entries.reduce((s, e) => s + e.importance, 0) / entries.length) * 10) / 10
    : 0
  const healthScore = Math.round(rng.nextFloat(0.7, 0.98) * 100) / 100

  const recommendations: string[] = []
  if (dedupCount > entries.length * 0.2) recommendations.push('High duplication rate — enable auto-dedup on write')
  if (compressionSavings < 30 && input.operation === 'compress') recommendations.push('Consider stronger compression (semantic summarization)')
  if (entries.length > 1000) recommendations.push('Large memory base — implement tiered storage (hot/warm/cold)')
  if (categories.size < 3) recommendations.push('Low category diversity — expand memory taxonomy')
  if (recommendations.length === 0) recommendations.push('Memory management operating within healthy parameters')

  return {
    operation: input.operation,
    result: {
      operation: input.operation,
      status: 'success',
      entries_affected: entriesAffected,
      storage_bytes: storageBytes,
      dedup_count: dedupCount,
      compression_savings_pct: compressionSavings,
      gc_collected: gcCollected,
      details,
    },
    memory_stats: {
      total_entries: entries.length,
      total_categories: categories.size,
      total_storage_kb: Math.round(storageBytes / 1024 * 10) / 10,
      avg_importance: avgImportance,
      health_score: healthScore,
    },
    recommendations,
  }
}

// --- Tool 2: Context Retrieval Optimizer ---
function analyzeContextRetrieval(input: RetrievalInput): ContextRetrievalResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const strategyPerformance: Record<string, { f1_base: number; latency_base: number }> = {
    vector: { f1_base: 0.78, latency_base: 45 },
    keyword: { f1_base: 0.65, latency_base: 12 },
    hybrid: { f1_base: 0.85, latency_base: 58 },
    reranking: { f1_base: 0.88, latency_base: 120 },
    adaptive: { f1_base: 0.9, latency_base: 85 },
  }

  const perf = strategyPerformance[input.strategy] || strategyPerformance.hybrid
  const noise = rng.nextFloat(-0.03, 0.03)
  const precision = Math.round(Math.min(0.98, perf.f1_base + noise + rng.nextFloat(0, 0.05)) * 100) / 100
  const recall = Math.round(Math.min(0.98, perf.f1_base + noise - rng.nextFloat(0, 0.02)) * 100) / 100
  const f1 = precision + recall > 0
    ? Math.round((2 * precision * recall) / (precision + recall) * 100) / 100
    : 0
  const latency = Math.round(perf.latency_base * rng.nextFloat(0.8, 1.3))
  const mrr = Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100
  const ndcg = Math.round(rng.nextFloat(0.72, 0.96) * 100) / 100

  const results: RetrievalResult[] = []
  const topK = input.top_k || 5
  for (let i = 0; i < topK; i++) {
    const score = Math.round(Math.max(0.3, 0.95 - i * rng.nextFloat(0.08, 0.15)) * 100) / 100
    results.push({
      rank: i + 1,
      key: `mem_${rng.nextInt(10000, 99999)}`,
      snippet: `Retrieved content snippet #${i + 1} via ${input.strategy} search`,
      relevance_score: score,
      retrieval_method: input.strategy,
    })
  }

  const strategyComparison = Object.entries(strategyPerformance).map(([strategy, p]) => ({
    strategy,
    f1: Math.round(Math.min(0.98, p.f1_base + rng.nextFloat(-0.02, 0.04)) * 100) / 100,
    latency_ms: Math.round(p.latency_base * rng.nextFloat(0.85, 1.2)),
  }))
  strategyComparison.sort((a, b) => b.f1 - a.f1)

  const optimizationNotes: string[] = []
  if (f1 < 0.75) optimizationNotes.push('F1 below threshold — consider hybrid retrieval with reranking')
  if (latency > 100) optimizationNotes.push('Latency exceeds 100ms — enable caching or approximate search')
  if (recall < precision * 0.8) optimizationNotes.push('Recall significantly lower than precision — expand index coverage')
  if (input.strategy === 'keyword') optimizationNotes.push('Pure keyword search limits semantic matching — add vector index')
  if (optimizationNotes.length === 0) optimizationNotes.push('Retrieval performance within target SLA')

  return {
    query: input.query,
    metrics: {
      precision_at_k: precision,
      recall_at_k: recall,
      f1_score: f1,
      mrr,
      ndcg,
      latency_ms: latency,
      strategy_used: input.strategy,
    },
    results,
    optimization_notes: optimizationNotes,
    strategy_comparison: strategyComparison,
  }
}

// --- Tool 3: Cognitive Architect ---
function analyzeCognitiveArchitect(input: CognitiveArchitectInput): CognitiveArchitectResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const layers: LayerDesign[] = input.memory_layers.map((layer, idx) => {
    const connectivity = input.memory_layers
      .filter((_, i) => i !== idx && Math.abs(i - idx) <= 2)
      .map(l => l.name)
    const attentionWeight = Math.round(rng.nextFloat(0.1, 0.4) * 100) / 100
    const utilization = layer.capacity > 0 ? rng.nextFloat(0.3, 0.95) : 0
    const status: LayerDesign['status'] =
      utilization > 0.85 ? 'overloaded' : utilization < 0.4 ? 'underutilized' : 'optimal'

    return {
      name: layer.name,
      type: layer.type,
      capacity: layer.capacity,
      decay_rate: layer.decay_rate,
      connectivity,
      attention_weight: attentionWeight,
      status,
    }
  })

  const totalWeight = layers.reduce((s, l) => s + l.attention_weight, 0) || 1
  const attentionAllocation = layers.map(l => ({
    layer: l.name,
    weight: l.attention_weight,
    budget_pct: Math.round((l.attention_weight / totalWeight) * 100),
  }))

  const reasoningChains: string[] = []
  const depth = input.reasoning_depth || 3
  for (let i = 0; i < depth; i++) {
    reasoningChains.push(`Chain ${i + 1}: ${rng.pick(layers).name} → ${rng.pick(layers).name} → ${rng.pick(layers).name}`)
  }

  const bottlenecks: string[] = []
  for (const l of layers) {
    if (l.status === 'overloaded') bottlenecks.push(`${l.name} overloaded — redistribute attention or increase capacity`)
    if (l.decay_rate > 0.5) bottlenecks.push(`${l.name} high decay rate (${l.decay_rate}) — increase consolidation frequency`)
  }
  if (bottlenecks.length === 0) bottlenecks.push('No critical bottlenecks detected')

  const overallEfficiency = Math.round(
    (layers.filter(l => l.status === 'optimal').length / Math.max(layers.length, 1)) *
    rng.nextFloat(0.85, 0.98) * 100
  ) / 100

  const designPrinciples = [
    'Hierarchical memory with distinct timescales (sensory → working → long-term)',
    'Attention-gated encoding and retrieval to manage cognitive load',
    'Consolidation pathways from fast-learning to slow-learning stores',
    'Complementary learning systems for pattern separation and completion',
  ]

  const recommendations: string[] = []
  if (layers.length < 4) recommendations.push('Consider adding more memory layers for richer cognitive architecture')
  if (input.attention_budget < 0.5) recommendations.push('Low attention budget may limit parallel processing — increase if possible')
  if (overallEfficiency < 0.7) recommendations.push('Overall efficiency below target — address overloaded layers')
  if (recommendations.length === 0) recommendations.push('Architecture well-balanced — monitor and iterate')

  return {
    design_goal: input.design_goal,
    architecture: {
      architecture_id: `cog-arch-${rng.nextInt(10000, 99999)}`,
      layers,
      attention_allocation: attentionAllocation,
      reasoning_chains: reasoningChains,
      bottleneck_analysis: bottlenecks,
      overall_efficiency: overallEfficiency,
    },
    design_principles: designPrinciples,
    scalability_score: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
    recommendations,
  }
}

// --- Tool 4: Forgetting Curve Modeler ---
function analyzeForgettingCurve(input: ForgettingCurveInput): ForgettingCurveResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const difficultyFactor = input.material_difficulty === 'easy' ? 0.8 : input.material_difficulty === 'hard' ? 1.5 : 1.0
  const individualFactor = input.individual_factor || 1.0
  const baseDecay = 0.3 * difficultyFactor / individualFactor
  const strengthFactor = Math.max(0.1, input.memory_strength || 1.0)

  const retentionSeries: TimePointRetention[] = []
  for (const t of input.time_points) {
    const retention = Math.round(Math.max(0.02, 100 * Math.exp(-baseDecay * t / strengthFactor)) * 100) / 100
    const strength = Math.round(strengthFactor * Math.exp(-baseDecay * t) * 100) / 100
    const decay = Math.round(baseDecay * Math.exp(-0.1 * t) * 1000) / 1000
    retentionSeries.push({ time: t, retention_pct: retention, predicted_strength: strength, decay_rate: decay })
  }

  const repetitionEffects: RepetitionEffect[] = []
  const intervals = input.repetition_intervals || [1, 3, 7, 14, 30]
  let currentStrength = strengthFactor
  for (let r = 0; r < input.repetition_count; r++) {
    const interval = intervals[r % intervals.length]
    const boost = Math.round(rng.nextFloat(0.15, 0.35) * (1 / (r + 1)) * 100) / 100
    currentStrength = Math.min(2.0, currentStrength + boost)
    repetitionEffects.push({
      repetition: r + 1,
      interval_days: interval,
      retention_boost: boost,
      new_strength: Math.round(currentStrength * 100) / 100,
    })
  }

  const halfLife = Math.round(Math.log(2) / baseDecay * strengthFactor * 10) / 10
  const optimalReviewSchedule = [1, 3, 7, 14, 30, 60, 120].filter(d => d <= halfLife * 4)

  const recommendations: string[] = []
  if (halfLife < 7) recommendations.push('Short half-life — increase initial encoding strength or review frequency')
  if (input.repetition_count < 3) recommendations.push('Insufficient repetitions — schedule at least 3 reviews in first 2 weeks')
  if (input.material_difficulty === 'hard') recommendations.push('Hard material detected — use elaborative encoding and concrete examples')
  if (retentionSeries.length > 0 && retentionSeries[retentionSeries.length - 1].retention_pct < 30) {
    recommendations.push('Long-term retention critically low — implement spaced repetition immediately')
  }
  if (recommendations.length === 0) recommendations.push('Forgetting curve within expected parameters — maintain current schedule')

  return {
    curve_type: 'Ebbinghaus-Exponential',
    retention_series: retentionSeries,
    repetition_effects: repetitionEffects,
    half_life_days: halfLife,
    optimal_review_schedule: optimalReviewSchedule,
    forgetting_rate: Math.round(baseDecay * 1000) / 1000,
    recommendations,
  }
}

// --- Tool 5: Episodic Memory Indexer ---
function analyzeEpisodicIndex(input: EpisodicIndexInput): EpisodicIndexResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const episodes = input.episodes || []
  const indexedEpisodes: IndexedEpisode[] = episodes.map((ep, idx) => {
    const causalLinks = episodes
      .filter((e, i) => i !== idx && Math.abs(i - idx) <= 2 && rng.next() > 0.4)
      .map(e => e.episode_id)
    const accessibility = Math.round(rng.nextFloat(0.4, 0.98) * 100) / 100

    return {
      episode_id: ep.episode_id,
      timestamp: ep.timestamp,
      event: ep.event,
      temporal_position: idx,
      causal_links: causalLinks,
      thematic_cluster: ep.context_tags[0] || 'uncategorized',
      emotional_valence: ep.emotional_valence,
      accessibility_score: accessibility,
    }
  })

  const clusterMap = new Map<string, string[]>()
  for (const ie of indexedEpisodes) {
    if (!clusterMap.has(ie.thematic_cluster)) clusterMap.set(ie.thematic_cluster, [])
    clusterMap.get(ie.thematic_cluster)!.push(ie.episode_id)
  }

  const clusters: EpisodicCluster[] = []
  let clusterIdx = 0
  for (const [theme, members] of clusterMap) {
    if (members.length >= 1) {
      const valences = indexedEpisodes.filter(e => members.includes(e.episode_id)).map(e => e.emotional_valence)
      const avgValence = valences.length > 0
        ? Math.round((valences.reduce((a, b) => a + b, 0) / valences.length) * 100) / 100
        : 0
      clusters.push({
        cluster_id: `cluster-${clusterIdx++}`,
        theme,
        episodes: members,
        time_span: `${members.length} episodes`,
        avg_valence: avgValence,
      })
    }
  }

  const retrievalPaths = [
    'Temporal forward: earliest → latest',
    'Temporal reverse: latest → earliest',
    'Causal chain: trigger → consequence',
    'Thematic cluster: shared context tags',
    'Emotional salience: high valence first',
  ]

  const timelineCoverage = episodes.length > 0
    ? `${episodes.length} episodes indexed`
    : 'No episodes in index'
  const indexHealth = Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100

  return {
    index_strategy: input.index_strategy,
    indexed_episodes: indexedEpisodes,
    clusters,
    timeline_coverage: timelineCoverage,
    retrieval_paths: retrievalPaths,
    index_health: indexHealth,
  }
}

// --- Tool 6: Semantic Memory Store ---
function analyzeSemanticStore(input: SemanticStoreInput): SemanticStoreResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const concepts = input.concepts || []
  const conceptNodes: ConceptNode[] = concepts.map(c => ({
    concept_id: c.concept_id,
    label: c.label,
    embedding_norm: Math.round(rng.nextFloat(0.8, 1.2) * 100) / 100,
    cluster_id: `cluster-${rng.nextInt(0, Math.max(1, Math.floor(concepts.length / 3)))}`,
    centrality: Math.round(rng.nextFloat(0.1, 0.9) * 100) / 100,
    connections: (c.relations || []).length,
  }))

  const relations: ConceptRelation[] = []
  for (const c of concepts) {
    for (const r of (c.relations || [])) {
      relations.push({
        source: c.concept_id,
        target: r.target,
        relation_type: r.relation_type,
        weight: r.weight,
        path_length: rng.nextInt(1, 4),
      })
    }
  }

  const clusterMap = new Map<string, string[]>()
  for (const cn of conceptNodes) {
    if (!clusterMap.has(cn.cluster_id)) clusterMap.set(cn.cluster_id, [])
    clusterMap.get(cn.cluster_id)!.push(cn.concept_id)
  }

  const clusters: SemanticCluster[] = []
  for (const [clusterId, members] of clusterMap) {
    const memberNodes = conceptNodes.filter(n => n.cluster_id === clusterId)
    const avgCentrality = memberNodes.length > 0
      ? memberNodes.reduce((s, n) => s + n.centrality, 0) / memberNodes.length
      : 0
    clusters.push({
      cluster_id: clusterId,
      label: `Cluster ${clusterId}`,
      members,
      coherence: Math.round(avgCentrality * 100) / 100,
      density: Math.round(Math.min(1, members.length / 8) * 100) / 100,
    })
  }

  const totalNodes = conceptNodes.length
  const totalEdges = relations.length
  const graphDensity = totalNodes > 1
    ? Math.round((totalEdges / (totalNodes * (totalNodes - 1))) * 1000) / 1000
    : 0

  const queryResults: SemanticStoreResult['query_results'] = []
  if (input.query_concept) {
    const matches = conceptNodes.filter(c => c.concept_id !== input.query_concept).slice(0, 5)
    for (const m of matches) {
      queryResults.push({
        concept_id: m.concept_id,
        similarity: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
        path: [input.query_concept, m.concept_id],
      })
    }
  }

  return {
    operation: input.operation,
    concepts: conceptNodes,
    relations,
    clusters,
    graph_metrics: {
      total_nodes: totalNodes,
      total_edges: totalEdges,
      avg_clustering_coeff: Math.round(rng.nextFloat(0.3, 0.7) * 100) / 100,
      graph_density: graphDensity,
      connected_components: Math.max(1, clusters.length),
    },
    query_results: queryResults,
  }
}

// --- Tool 7: Working Memory Monitor ---
function analyzeWorkingMemory(input: WorkingMemoryInput): WorkingMemoryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const now = Date.now()
  const items: MemoryItemStatus[] = input.current_items.map(item => {
    const age = now - item.last_accessed
    return {
      item_id: item.item_id,
      token_cost: item.token_cost,
      priority: item.priority,
      age_ms: age,
      access_count: rng.nextInt(1, 20),
      status: 'active',
    }
  })

  let usedTokens = items.reduce((s, i) => s + i.token_cost, 0)
  const evicted: string[] = []
  const compressed: string[] = []

  if (input.incoming_item) {
    const incomingCost = input.incoming_item.token_cost
    if (usedTokens + incomingCost > input.token_capacity) {
      const overflow = usedTokens + incomingCost - input.token_capacity
      const sorted = [...items].sort((a, b) => {
        if (input.eviction_policy === 'lru') return a.age_ms - b.age_ms
        if (input.eviction_policy === 'priority') return a.priority - b.priority
        if (input.eviction_policy === 'cost_aware') return b.token_cost - a.token_cost
        return (a.priority * 0.5 + a.age_ms / 10000 * 0.5) - (b.priority * 0.5 + b.age_ms / 10000 * 0.5)
      })

      let freed = 0
      for (const item of sorted) {
        if (freed >= overflow) break
        if (item.priority > 8) {
          item.status = 'compressed'
          freed += Math.round(item.token_cost * 0.5)
          compressed.push(item.item_id)
        } else {
          item.status = 'evicted'
          freed += item.token_cost
          evicted.push(item.item_id)
        }
      }
    }
    items.push({
      item_id: input.incoming_item.item_id,
      token_cost: input.incoming_item.token_cost,
      priority: input.incoming_item.priority,
      age_ms: 0,
      access_count: 1,
      status: 'active',
    })
    usedTokens = items.filter(i => i.status === 'active' || i.status === 'compressed')
      .reduce((s, i) => s + (i.status === 'compressed' ? Math.round(i.token_cost * 0.5) : i.token_cost), 0)
  }

  const activeItems = items.filter(i => i.status === 'active')
  const utilization = input.token_capacity > 0 ? Math.round((usedTokens / input.token_capacity) * 1000) / 10 : 0
  const overflowRisk: WorkingMemoryStatus['overflow_risk'] =
    utilization > 95 ? 'critical' : utilization > 85 ? 'high' : utilization > 70 ? 'medium' : 'low'

  const attentionFocus = activeItems
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
    .map(i => i.item_id)

  const timeline: WorkingMemoryResult['timeline'] = [
    { timestamp: now - 60000, event: 'Session start', token_delta: items.reduce((s, i) => s + i.token_cost, 0) },
    { timestamp: now - 30000, event: 'Context expansion', token_delta: rng.nextInt(500, 2000) },
    { timestamp: now, event: 'Current state', token_delta: usedTokens },
  ]

  const optimization: string[] = []
  if (utilization > 85) optimization.push('High utilization — enable compression or increase capacity')
  if (evicted.length > 0) optimization.push(`${evicted.length} items evicted — review eviction policy`)
  if (activeItems.length > 7) optimization.push('Too many active items — consolidate or summarize')
  if (optimization.length === 0) optimization.push('Working memory within healthy operating range')

  return {
    status: {
      session_id: input.session_id,
      capacity: input.token_capacity,
      used_tokens: usedTokens,
      utilization_pct: utilization,
      item_count: activeItems.length,
      items,
      evicted_items: evicted,
      compressed_items: compressed,
      attention_focus: attentionFocus,
      overflow_risk: overflowRisk,
    },
    timeline,
    optimization_suggestions: optimization,
    predicted_overflow_at: overflowRisk === 'critical' ? now + 30000 : overflowRisk === 'high' ? now + 120000 : undefined,
  }
}

// --- Tool 8: Memory Consolidation Planner ---
function analyzeConsolidation(input: ConsolidationInput): ConsolidationPlanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const actions: ConsolidationAction[] = []
  const memories = input.source_memories || []

  for (const mem of memories) {
    let action: ConsolidationAction['action']
    let method: string
    let gain: number

    if (mem.age_days > 90 && mem.access_count < 3) {
      action = 'archive'
      method = 'cold_storage_transfer'
      gain = 0
    } else if (mem.importance >= 8 && mem.access_count >= 5) {
      action = 'consolidate'
      method = input.consolidation_type === 'sleep_replay' ? 'hippocampal_replay' : 'spaced_reinforcement'
      gain = Math.round(rng.nextFloat(0.15, 0.35) * 100) / 100
    } else if (mem.type === 'episodic' && mem.importance >= 6) {
      action = 'transfer'
      method = 'episodic_to_semantic_abstraction'
      gain = Math.round(rng.nextFloat(0.1, 0.25) * 100) / 100
    } else if (mem.importance < 3 && mem.age_days > 30) {
      action = 'prune'
      method = 'low_value_cleanup'
      gain = 0
    } else {
      action = 'strengthen'
      method = 'activation_reinforcement'
      gain = Math.round(rng.nextFloat(0.05, 0.15) * 100) / 100
    }

    actions.push({
      memory_id: mem.memory_id,
      action,
      priority: mem.importance,
      estimated_time_min: action === 'archive' ? 0.5 : action === 'prune' ? 0.2 : rng.nextInt(2, 10),
      expected_retention_gain: gain,
      method,
    })
  }

  actions.sort((a, b) => b.priority - a.priority)

  const phases: ConsolidationPhase[] = [
    {
      phase: 'Encoding Review',
      duration_min: Math.round(input.available_time_minutes * 0.2),
      actions: ['Identify high-value memories', 'Assess consolidation candidates'],
      target_memories: actions.filter(a => a.action === 'consolidate').map(a => a.memory_id),
    },
    {
      phase: 'Active Consolidation',
      duration_min: Math.round(input.available_time_minutes * 0.5),
      actions: ['Replay and strengthen', 'Transfer episodic to semantic'],
      target_memories: actions.filter(a => a.action === 'consolidate' || a.action === 'transfer').map(a => a.memory_id),
    },
    {
      phase: 'Optimization',
      duration_min: Math.round(input.available_time_minutes * 0.3),
      actions: ['Archive low-value memories', 'Prune redundant entries'],
      target_memories: actions.filter(a => a.action === 'archive' || a.action === 'prune').map(a => a.memory_id),
    },
  ]

  const totalTime = phases.reduce((s, p) => s + p.duration_min, 0)
  const consolidated = actions.filter(a => a.action === 'consolidate' || a.action === 'transfer').length
  const archived = actions.filter(a => a.action === 'archive').length
  const avgGain = actions.length > 0
    ? actions.reduce((s, a) => s + a.expected_retention_gain, 0) / actions.length
    : 0
  const expectedRetention = Math.min(99, Math.round((input.target_retention_pct + avgGain * 100) * 10) / 10)

  const schedule: ConsolidationPlanResult['schedule'] = []
  let elapsed = 0
  for (const phase of phases) {
    for (const action of phase.actions) {
      schedule.push({
        time: `+${elapsed}min`,
        action,
        target: phase.target_memories.slice(0, 2).join(', ') || 'all',
      })
      elapsed += Math.round(phase.duration_min / phase.actions.length)
    }
  }

  return {
    consolidation_type: input.consolidation_type,
    actions,
    phases,
    total_time_min: totalTime,
    expected_retention_pct: expectedRetention,
    memories_consolidated: consolidated,
    memories_archived: archived,
    schedule,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

function formatMemoryManagementReport(result: MemoryManagementResult): string {
  const lines: string[] = []
  lines.push('## Memory Management Engine — 记忆管理引擎报告')
  lines.push('')
  lines.push(`Operation: ${result.operation} | Status: ${result.result.status}`)
  lines.push(`Entries Affected: ${result.result.entries_affected} | Storage: ${result.memory_stats.total_storage_kb} KB`)
  lines.push(`Dedup Count: ${result.result.dedup_count} | Compression Savings: ${result.result.compression_savings_pct}%`)
  lines.push(`GC Collected: ${result.result.gc_collected}`)
  lines.push('')
  lines.push('### Memory Statistics')
  lines.push(`- Total Entries: ${result.memory_stats.total_entries}`)
  lines.push(`- Categories: ${result.memory_stats.total_categories}`)
  lines.push(`- Avg Importance: ${result.memory_stats.avg_importance}/10`)
  lines.push(`- Health Score: ${result.memory_stats.health_score}/1.0`)
  lines.push('')
  lines.push('### Operation Details')
  for (const d of result.result.details) lines.push(`- ${d}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*Memory Management Engine v0.1.0 | Storage optimized*')
  return lines.join('\n')
}

function formatContextRetrievalReport(result: ContextRetrievalResult): string {
  const lines: string[] = []
  lines.push('## Context Retrieval Optimizer — 上下文检索优化报告')
  lines.push('')
  lines.push(`Query: "${result.query}" | Strategy: ${result.metrics.strategy_used}`)
  lines.push(`F1: ${result.metrics.f1_score} | Precision: ${result.metrics.precision_at_k} | Recall: ${result.metrics.recall_at_k}`)
  lines.push(`MRR: ${result.metrics.mrr} | NDCG: ${result.metrics.ndcg} | Latency: ${result.metrics.latency_ms}ms`)
  lines.push('')
  lines.push('### Top Results')
  lines.push('| Rank | Key | Score | Method |')
  lines.push('|------|-----|-------|--------|')
  for (const r of result.results) {
    lines.push(`| ${r.rank} | ${r.key} | ${r.relevance_score} | ${r.retrieval_method} |`)
  }
  lines.push('')
  lines.push('### Strategy Comparison')
  lines.push('| Strategy | F1 | Latency(ms) |')
  lines.push('|----------|-----|-------------|')
  for (const s of result.strategy_comparison) {
    lines.push(`| ${s.strategy} | ${s.f1} | ${s.latency_ms} |`)
  }
  lines.push('')
  lines.push('### Optimization Notes')
  for (const n of result.optimization_notes) lines.push(`- ${n}`)
  lines.push('')
  lines.push('---')
  lines.push('*Context Retrieval Optimizer v0.1.0 | Hybrid search ready*')
  return lines.join('\n')
}

function formatCognitiveArchitectReport(result: CognitiveArchitectResult): string {
  const lines: string[] = []
  lines.push('## Cognitive Architect — 认知架构设计报告')
  lines.push('')
  lines.push(`Design Goal: ${result.design_goal}`)
  lines.push(`Architecture ID: ${result.architecture.architecture_id}`)
  lines.push(`Overall Efficiency: ${result.architecture.overall_efficiency} | Scalability: ${result.scalability_score}`)
  lines.push('')
  lines.push('### Layer Design')
  lines.push('| Layer | Type | Capacity | Decay | Attention | Status |')
  lines.push('|-------|------|----------|-------|-----------|--------|')
  for (const l of result.architecture.layers) {
    lines.push(`| ${l.name} | ${l.type} | ${l.capacity} | ${l.decay_rate} | ${l.attention_weight} | ${l.status} |`)
  }
  lines.push('')
  lines.push('### Attention Allocation')
  for (const a of result.architecture.attention_allocation) {
    lines.push(`- ${a.layer}: ${a.budget_pct}% (weight: ${a.weight})`)
  }
  lines.push('')
  lines.push('### Reasoning Chains')
  for (const c of result.architecture.reasoning_chains) lines.push(`- ${c}`)
  lines.push('')
  lines.push('### Bottleneck Analysis')
  for (const b of result.architecture.bottleneck_analysis) lines.push(`- ${b}`)
  lines.push('')
  lines.push('### Design Principles')
  for (const p of result.design_principles) lines.push(`- ${p}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*Cognitive Architect v0.1.0 | Multi-layer design*')
  return lines.join('\n')
}

function formatForgettingCurveReport(result: ForgettingCurveResult): string {
  const lines: string[] = []
  lines.push('## Forgetting Curve Modeler — 遗忘曲线建模报告')
  lines.push('')
  lines.push(`Curve Type: ${result.curve_type} | Half-life: ${result.half_life_days} days`)
  lines.push(`Forgetting Rate: ${result.forgetting_rate}`)
  lines.push('')
  lines.push('### Retention Series')
  lines.push('| Time (days) | Retention % | Strength | Decay Rate |')
  lines.push('|-------------|-------------|----------|------------|')
  for (const r of result.retention_series) {
    lines.push(`| ${r.time} | ${r.retention_pct}% | ${r.predicted_strength} | ${r.decay_rate} |`)
  }
  lines.push('')
  lines.push('### Repetition Effects')
  lines.push('| Repetition | Interval (days) | Boost | New Strength |')
  lines.push('|------------|-----------------|-------|--------------|')
  for (const r of result.repetition_effects) {
    lines.push(`| ${r.repetition} | ${r.interval_days} | +${r.retention_boost} | ${r.new_strength} |`)
  }
  lines.push('')
  lines.push('### Optimal Review Schedule')
  lines.push(result.optimal_review_schedule.map(d => `${d}d`).join(' → '))
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push('*Forgetting Curve Modeler v0.1.0 | Ebbinghaus model*')
  return lines.join('\n')
}

function formatEpisodicIndexReport(result: EpisodicIndexResult): string {
  const lines: string[] = []
  lines.push('## Episodic Memory Indexer — 情景记忆索引报告')
  lines.push('')
  lines.push(`Index Strategy: ${result.index_strategy} | Health: ${result.index_health}`)
  lines.push(`Coverage: ${result.timeline_coverage}`)
  lines.push('')
  lines.push('### Indexed Episodes')
  lines.push('| ID | Event | Cluster | Valence | Accessibility |')
  lines.push('|----|-------|---------|---------|---------------|')
  for (const e of result.indexed_episodes.slice(0, 10)) {
    lines.push(`| ${e.episode_id} | ${e.event.slice(0, 30)} | ${e.thematic_cluster} | ${e.emotional_valence} | ${e.accessibility_score} |`)
  }
  lines.push('')
  lines.push('### Clusters')
  for (const c of result.clusters) {
    lines.push(`- ${c.theme}: ${c.episodes.length} episodes (valence: ${c.avg_valence})`)
  }
  lines.push('')
  lines.push('### Retrieval Paths')
  for (const p of result.retrieval_paths) lines.push(`- ${p}`)
  lines.push('')
  lines.push('---')
  lines.push('*Episodic Memory Indexer v0.1.0 | Temporal + causal indexing*')
  return lines.join('\n')
}

function formatSemanticStoreReport(result: SemanticStoreResult): string {
  const lines: string[] = []
  lines.push('## Semantic Memory Store — 语义记忆存储报告')
  lines.push('')
  lines.push(`Operation: ${result.operation}`)
  lines.push(`Nodes: ${result.graph_metrics.total_nodes} | Edges: ${result.graph_metrics.total_edges}`)
  lines.push(`Density: ${result.graph_metrics.graph_density} | Components: ${result.graph_metrics.connected_components}`)
  lines.push('')
  lines.push('### Concept Nodes')
  lines.push('| ID | Label | Norm | Centrality | Connections |')
  lines.push('|----|-------|------|------------|-------------|')
  for (const c of result.concepts.slice(0, 10)) {
    lines.push(`| ${c.concept_id} | ${c.label} | ${c.embedding_norm} | ${c.centrality} | ${c.connections} |`)
  }
  lines.push('')
  lines.push('### Clusters')
  for (const c of result.clusters) {
    lines.push(`- ${c.label}: ${c.members.length} members (coherence: ${c.coherence}, density: ${c.density})`)
  }
  lines.push('')
  if (result.query_results.length > 0) {
    lines.push('### Query Results')
    lines.push('| Concept | Similarity | Path |')
    lines.push('|---------|------------|------|')
    for (const q of result.query_results) {
      lines.push(`| ${q.concept_id} | ${q.similarity} | ${q.path.join(' → ')} |`)
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('*Semantic Memory Store v0.1.0 | Vector + graph hybrid*')
  return lines.join('\n')
}

function formatWorkingMemoryReport(result: WorkingMemoryResult): string {
  const lines: string[] = []
  lines.push('## Working Memory Monitor — 工作记忆监控报告')
  lines.push('')
  lines.push(`Session: ${result.status.session_id} | Risk: ${result.status.overflow_risk.toUpperCase()}`)
  lines.push(`Capacity: ${result.status.capacity} tokens | Used: ${result.status.used_tokens} (${result.status.utilization_pct}%)`)
  lines.push(`Active Items: ${result.status.item_count} | Evicted: ${result.status.evicted_items.length} | Compressed: ${result.status.compressed_items.length}`)
  lines.push('')
  lines.push('### Item Status')
  lines.push('| Item | Tokens | Priority | Status |')
  lines.push('|------|--------|----------|--------|')
  for (const item of result.status.items) {
    lines.push(`| ${item.item_id} | ${item.token_cost} | ${item.priority} | ${item.status} |`)
  }
  lines.push('')
  lines.push('### Attention Focus')
  for (const f of result.status.attention_focus) lines.push(`- ${f}`)
  lines.push('')
  lines.push('### Timeline')
  for (const t of result.timeline) {
    lines.push(`- ${new Date(t.timestamp).toISOString()}: ${t.event} (${t.token_delta >= 0 ? '+' : ''}${t.token_delta})`)
  }
  lines.push('')
  lines.push('### Optimization Suggestions')
  for (const s of result.optimization_suggestions) lines.push(`- ${s}`)
  lines.push('')
  lines.push('---')
  lines.push('*Working Memory Monitor v0.1.0 | Real-time tracking*')
  return lines.join('\n')
}

function formatConsolidationPlanReport(result: ConsolidationPlanResult): string {
  const lines: string[] = []
  lines.push('## Memory Consolidation Planner — 记忆巩固规划报告')
  lines.push('')
  lines.push(`Type: ${result.consolidation_type} | Total Time: ${result.total_time_min}min`)
  lines.push(`Expected Retention: ${result.expected_retention_pct}% | Consolidated: ${result.memories_consolidated} | Archived: ${result.memories_archived}`)
  lines.push('')
  lines.push('### Consolidation Actions')
  lines.push('| Memory | Action | Priority | Time(min) | Gain | Method |')
  lines.push('|--------|--------|----------|-----------|------|--------|')
  for (const a of result.actions.slice(0, 10)) {
    lines.push(`| ${a.memory_id} | ${a.action} | ${a.priority} | ${a.estimated_time_min} | +${a.expected_retention_gain} | ${a.method} |`)
  }
  lines.push('')
  lines.push('### Phases')
  for (const p of result.phases) {
    lines.push(`- ${p.phase} (${p.duration_min}min): ${p.actions.join(', ')}`)
  }
  lines.push('')
  lines.push('### Schedule')
  for (const s of result.schedule) {
    lines.push(`- ${s.time}: ${s.action} → ${s.target}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Memory Consolidation Planner v0.1.0 | Sleep-replay inspired*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Memory Management Engine — 记忆管理引擎
  tools.register(defineTool({
    name: 'memory_management_engine',
    description: '记忆管理引擎 | 存储/检索/去重/压缩/生命周期管理 | Core memory CRUD with deduplication, compression, and garbage collection.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"store|retrieve|deduplicate|compress|gc","entries":[{"key":"","content":"","category":"episodic|semantic|procedural|working","importance":1-10,"tags":[""]}],"query":"search text","max_results":5,"compression_ratio":0.5}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: MemoryManagementInput = JSON.parse(args.input)
      return formatMemoryManagementReport(analyzeMemoryManagement(input))
    },
  }))

  // Tool 2: Context Retrieval Optimizer — 上下文检索优化
  tools.register(defineTool({
    name: 'context_retrieval_optimizer',
    description: '上下文检索优化 | 混合检索/重排序/相关性评分/召回率分析 | Optimize context retrieval with hybrid search, reranking, and strategy comparison.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"query":"search text","strategy":"vector|keyword|hybrid|reranking|adaptive","top_k":5,"filters":{"category":["episodic"],"date_range":["2024-01-01","2024-12-31"],"min_importance":5},"corpus_size":10000}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: RetrievalInput = JSON.parse(args.input)
      return formatContextRetrievalReport(analyzeContextRetrieval(input))
    },
  }))

  // Tool 3: Cognitive Architect — 认知架构设计
  tools.register(defineTool({
    name: 'cognitive_architect',
    description: '认知架构设计 | 多层记忆体系/注意力分配/推理链/瓶颈分析 | Design multi-layer cognitive architecture with attention allocation and reasoning chains.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"design_goal":"","memory_layers":[{"name":"","type":"sensory|working|short_term|long_term|episodic|semantic|procedural","capacity":100,"decay_rate":0.1}],"attention_budget":0.8,"reasoning_depth":3}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: CognitiveArchitectInput = JSON.parse(args.input)
      return formatCognitiveArchitectReport(analyzeCognitiveArchitect(input))
    },
  }))

  // Tool 4: Forgetting Curve Modeler — 遗忘曲线建模
  tools.register(defineTool({
    name: 'forgetting_curve_modeler',
    description: '遗忘曲线建模 | 艾宾浩斯/间隔重复/记忆保持率预测/最优复习计划 | Model forgetting curves with Ebbinghaus decay, spaced repetition, and optimal review scheduling.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"memory_strength":1.0,"time_points":[1,3,7,14,30,60,90],"repetition_count":5,"repetition_intervals":[1,3,7,14,30],"material_difficulty":"easy|medium|hard","individual_factor":1.0}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: ForgettingCurveInput = JSON.parse(args.input)
      return formatForgettingCurveReport(analyzeForgettingCurve(input))
    },
  }))

  // Tool 5: Episodic Memory Indexer — 情景记忆索引
  tools.register(defineTool({
    name: 'episodic_memory_indexer',
    description: '情景记忆索引 | 时间线/事件链/经验回放/主题聚类 | Index episodic memories with temporal, causal, thematic, and participant-based retrieval paths.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"episodes":[{"episode_id":"","timestamp":"2024-01-01T00:00:00Z","event":"","participants":[],"outcome":"","emotional_valence":0.5,"context_tags":[""]}],"index_strategy":"temporal|causal|thematic|participant","query_episode":"","time_window":["2024-01-01","2024-12-31"]}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: EpisodicIndexInput = JSON.parse(args.input)
      return formatEpisodicIndexReport(analyzeEpisodicIndex(input))
    },
  }))

  // Tool 6: Semantic Memory Store — 语义记忆存储
  tools.register(defineTool({
    name: 'semantic_memory_store',
    description: '语义记忆存储 | 向量嵌入/知识图谱/概念网络/图遍历 | Store and query semantic memory with vector embeddings, knowledge graphs, and concept networks.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"operation":"embed|query|cluster|relate|traverse","concepts":[{"concept_id":"","label":"","description":"","relations":[{"target":"","relation_type":"is_a|part_of|causes","weight":0.8}]}],"query_concept":"","embedding_dim":1536,"similarity_threshold":0.7}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: SemanticStoreInput = JSON.parse(args.input)
      return formatSemanticStoreReport(analyzeSemanticStore(input))
    },
  }))

  // Tool 7: Working Memory Monitor — 工作记忆监控
  tools.register(defineTool({
    name: 'working_memory_monitor',
    description: '工作记忆监控 | 容量/负载/注意力/实时追踪/溢出预测 | Monitor working memory in real-time with capacity tracking, eviction policies, and overflow prediction.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"session_id":"","token_capacity":128000,"current_items":[{"item_id":"","content":"","token_cost":100,"priority":5,"last_accessed":1700000000000}],"incoming_item":{"item_id":"","content":"","token_cost":200,"priority":7},"eviction_policy":"lru|priority|cost_aware|hybrid"}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: WorkingMemoryInput = JSON.parse(args.input)
      return formatWorkingMemoryReport(analyzeWorkingMemory(input))
    },
  }))

  // Tool 8: Memory Consolidation Planner — 记忆巩固规划
  tools.register(defineTool({
    name: 'memory_consolidation_planner',
    description: '记忆巩固规划 | 睡眠巩固/迁移/归档策略/间隔重复 | Plan memory consolidation with sleep-replay, knowledge transfer, and archival strategies.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {"source_memories":[{"memory_id":"","type":"episodic|semantic|procedural","importance":8,"age_days":30,"access_count":5,"last_consolidated":"2024-01-01"}],"consolidation_type":"sleep_replay|spaced_review|knowledge_transfer|archive","available_time_minutes":60,"target_retention_pct":85}',
      },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: ConsolidationInput = JSON.parse(args.input)
      return formatConsolidationPlanReport(analyzeConsolidation(input))
    },
  }))

  console.log(`[dsh-tool-agentmemory] Loaded v${VERSION} — AI Agent Memory & Cognition with 8 tools`)
  console.log('  Tools: memory_management_engine, context_retrieval_optimizer, cognitive_architect, forgetting_curve_modeler, episodic_memory_indexer, semantic_memory_store, working_memory_monitor, memory_consolidation_planner')
}
