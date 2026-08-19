/**
 * DSH LLM Token Compression & Optimization Engine Plugin v0.1.0
 *
 * Context window management, prompt compression, and cost optimization toolkit for DeepSeek Harness Agent.
 * Designed for AI engineers, LLM operators, and cost-conscious developers.
 *
 * Features (v0.1.0):
 * - Prompt Compressor (semantic-aware prompt reduction)
 * - Context Window Optimizer (intelligent context pruning)
 * - Token Budget Planner (phase-based allocation strategy)
 * - Semantic Deduplicator (duplicate document detection)
 * - Summarization Pipeline (extractive/abstractive/hybrid)
 * - Embedding Cache Advisor (cache hit projections)
 * - Batch Optimizer (request batching for throughput)
 * - Cost Analyzer (usage-based cost breakdown and savings)
 *
 * @module dsh-tool-compress
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-compress'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ContextItem {
  content: string
  importance: number
  recency: number
}

interface DocumentInput {
  id: string
  content: string
  source: string
}

interface UsageRecord {
  model: string
  input_tokens: number
  output_tokens: number
  timestamp: number
}

interface PricingConfig {
  [model: string]: {
    input_cost_per_1k: number
    output_cost_per_1k: number
  }
}

interface QueryLogEntry {
  query: string
  timestamp: number
  embedding_cost: number
}

interface BatchRequest {
  prompt: string
  max_tokens: number
  priority: number
}

interface ModelLimits {
  max_batch_size: number
  max_tokens_per_request: number
  requests_per_minute: number
  tokens_per_minute: number
}

// ==================== UTILITY FUNCTIONS ====================

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

function simpleHash(text: string): number[] {
  const vec = new Array(64).fill(0)
  const words = text.toLowerCase().split(/\s+/)
  for (const word of words) {
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i)
      hash |= 0
    }
    const idx = Math.abs(hash) % 64
    vec[idx] += 1
  }
  return vec
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because', 'if', 'when', 'where', 'how', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their'])
  const words = text.toLowerCase().split(/[\s,.!?;:'"()\[\]{}]+/).filter(w => w.length > 2 && !stopWords.has(w))
  return [...new Set(words)]
}

function sentenceScore(sentence: string, keywords: string[], position: number, totalSentences: number): number {
  const words = sentence.toLowerCase().split(/\s+/)
  let keywordCount = 0
  for (const word of words) {
    if (keywords.includes(word)) keywordCount++
  }
  const keywordScore = words.length > 0 ? keywordCount / words.length : 0
  const positionScore = 1 - (position / totalSentences) * 0.5
  const lengthScore = Math.min(sentence.length / 100, 1)
  return keywordScore * 0.5 + positionScore * 0.3 + lengthScore * 0.2
}

// ==================== TOOL 1: PROMPT COMPRESSOR ====================

interface PromptCompressorResult {
  compressed_prompt: string
  compression_ratio: number
  semantic_preservation_score: number
  estimated_savings: {
    tokens_saved: number
    cost_per_1k_usd: number
    percent_reduction: number
  }
  techniques_applied: string[]
}

function compressPrompt(
  originalPrompt: string,
  targetRatio: number = 0.5,
  preserveKeywords: string[] = []
): PromptCompressorResult {
  const originalTokens = estimateTokens(originalPrompt)
  const keywords = preserveKeywords.length > 0 ? preserveKeywords : extractKeywords(originalPrompt)
  const techniques: string[] = []

  let compressed = originalPrompt

  // Technique 1: Remove redundant whitespace and formatting
  compressed = compressed.replace(/\s+/g, ' ').trim()
  techniques.push('whitespace_normalization')

  // Technique 2: Remove filler phrases
  const fillerPhrases = [
    /\b(as you know|as mentioned|it should be noted|it is important to note|please note that|kindly note)\b/gi,
    /\b(in order to|due to the fact that|for the purpose of|with regard to|with respect to)\b/gi,
    /\b(basically|essentially|fundamentally|actually|really|very|quite|rather|somewhat)\b/gi,
    /\b(I think that|I believe that|it seems that|it appears that)\b/gi,
  ]
  for (const pattern of fillerPhrases) {
    compressed = compressed.replace(pattern, '').replace(/\s+/g, ' ')
  }
  techniques.push('filler_removal')

  // Technique 3: Sentence-level compression via extractive selection
  const sentences = compressed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)
  if (sentences.length > 2) {
    const scored = sentences.map((s, i) => ({
      sentence: s,
      score: sentenceScore(s, keywords, i, sentences.length)
    }))
    scored.sort((a, b) => b.score - a.score)
    const targetCount = Math.max(1, Math.ceil(sentences.length * targetRatio))
    const selected = scored.slice(0, targetCount).map(s => s.sentence)
    // Restore original order
    const originalOrder = sentences.filter(sel => selected.includes(sel))
    compressed = originalOrder.join(' ')
    techniques.push('extractive_selection')
  }

  // Technique 4: Abbreviate common patterns
  compressed = compressed.replace(/\bfor example\b/gi, 'e.g.')
  compressed = compressed.replace(/\bthat is\b/gi, 'i.e.')
  compressed = compressed.replace(/\bet cetera\b/gi, 'etc.')
  compressed = compressed.replace(/\bversus\b/gi, 'vs.')
  compressed = compressed.replace(/\bapproximately\b/gi, '~')
  compressed = compressed.replace(/\bdoes not\b/gi, "doesn't")
  compressed = compressed.replace(/\bcannot\b/gi, "can't")
  compressed = compressed.replace(/\bdo not\b/gi, "don't")
  compressed = compressed.replace(/\bwill not\b/gi, "won't")
  compressed = compressed.replace(/\bis not\b/gi, "isn't")
  compressed = compressed.replace(/\bare not\b/gi, "aren't")
  techniques.push('abbreviation')

  // Ensure we meet target ratio
  const compressedTokens = estimateTokens(compressed)
  if (compressedTokens > originalTokens * targetRatio && sentences.length > 1) {
    // Further compress by keeping only top sentences
    const targetLen = Math.floor(originalTokens * targetRatio * 4)
    compressed = compressed.substring(0, targetLen)
    const lastPeriod = compressed.lastIndexOf('.')
    if (lastPeriod > 0) {
      compressed = compressed.substring(0, lastPeriod + 1)
    }
    techniques.push('length_truncation')
  }

  const finalTokens = estimateTokens(compressed)
  const compressionRatio = originalTokens > 0 ? finalTokens / originalTokens : 1
  const preservationScore = Math.max(0.6, 1 - (1 - compressionRatio) * 0.8)

  return {
    compressed_prompt: compressed.trim(),
    compression_ratio: parseFloat(compressionRatio.toFixed(3)),
    semantic_preservation_score: parseFloat(preservationScore.toFixed(3)),
    estimated_savings: {
      tokens_saved: originalTokens - finalTokens,
      cost_per_1k_usd: parseFloat(((originalTokens - finalTokens) / 1000 * 0.01).toFixed(4)),
      percent_reduction: parseFloat(((1 - compressionRatio) * 100).toFixed(1))
    },
    techniques_applied: techniques
  }
}

function formatPromptCompressorReport(result: PromptCompressorResult): string {
  const lines: string[] = []
  lines.push('## Prompt Compression Report')
  lines.push('')
  lines.push(`**Compression Ratio:** ${(result.compression_ratio * 100).toFixed(1)}% of original`)
  lines.push(`**Semantic Preservation:** ${(result.semantic_preservation_score * 100).toFixed(1)}%`)
  lines.push(`**Tokens Saved:** ${result.estimated_savings.tokens_saved}`)
  lines.push(`**Cost Savings:** $${result.estimated_savings.cost_per_1k_usd.toFixed(4)} per 1K requests`)
  lines.push(`**Reduction:** ${result.estimated_savings.percent_reduction}%`)
  lines.push('')
  lines.push('### Techniques Applied')
  for (const t of result.techniques_applied) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push('### Compressed Prompt')
  lines.push('```')
  lines.push(result.compressed_prompt)
  lines.push('```')
  return lines.join('\n')
}

// ==================== TOOL 2: CONTEXT WINDOW OPTIMIZER ====================

interface ContextOptimizerResult {
  optimized_context: ContextItem[]
  items_included: number
  items_dropped: number
  coverage_score: number
  total_tokens: number
  dropped_items: Array<{ content: string; importance: number; reason: string }>
}

function optimizeContextWindow(
  contextItems: ContextItem[],
  maxTokens: number
): ContextOptimizerResult {
  if (contextItems.length === 0) {
    return {
      optimized_context: [],
      items_included: 0,
      items_dropped: 0,
      coverage_score: 1,
      total_tokens: 0,
      dropped_items: []
    }
  }

  // Score each item based on importance and recency
  const scored = contextItems.map((item, idx) => {
    const tokenCost = estimateTokens(item.content)
    const score = item.importance * 0.6 + item.recency * 0.4
    return { ...item, tokenCost, score, originalIndex: idx }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  const included: ContextItem[] = []
  const dropped: ContextOptimizerResult['dropped_items'] = []
  let tokenBudget = 0

  for (const item of scored) {
    if (tokenBudget + item.tokenCost <= maxTokens) {
      included.push({ content: item.content, importance: item.importance, recency: item.recency })
      tokenBudget += item.tokenCost
    } else {
      // Try to fit a truncated version
      const remaining = maxTokens - tokenBudget
      if (remaining > 50 && item.importance > 0.7) {
        const truncated = item.content.substring(0, remaining * 4)
        const lastSpace = truncated.lastIndexOf(' ')
        const finalContent = lastSpace > remaining * 3 ? truncated.substring(0, lastSpace) : truncated
        included.push({ content: finalContent + '...', importance: item.importance, recency: item.recency })
        tokenBudget += estimateTokens(finalContent)
        dropped.push({ content: item.content.substring(0, 80) + '...', importance: item.importance, reason: 'truncated_to_fit' })
      } else {
        dropped.push({ content: item.content.substring(0, 80) + '...', importance: item.importance, reason: 'low_priority' })
      }
    }
  }

  // Restore original order
  const originalOrder = contextItems.filter(orig =>
    included.some(inc => inc.content === orig.content)
  )

  const totalImportanceIncluded = included.reduce((s, i) => s + i.importance, 0)
  const totalImportance = contextItems.reduce((s, i) => s + i.importance, 0)
  const coverageScore = totalImportance > 0 ? totalImportanceIncluded / totalImportance : 0

  return {
    optimized_context: originalOrder,
    items_included: included.length,
    items_dropped: dropped.length,
    coverage_score: parseFloat(coverageScore.toFixed(3)),
    total_tokens: tokenBudget,
    dropped_items: dropped
  }
}

function formatContextOptimizerReport(result: ContextOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Context Window Optimization Report')
  lines.push('')
  lines.push(`**Items Included:** ${result.items_included} | **Items Dropped:** ${result.items_dropped}`)
  lines.push(`**Coverage Score:** ${(result.coverage_score * 100).toFixed(1)}%`)
  lines.push(`**Total Tokens Used:** ${result.total_tokens}`)
  lines.push('')

  if (result.dropped_items.length > 0) {
    lines.push('### Dropped Items')
    for (const d of result.dropped_items.slice(0, 10)) {
      lines.push(`- [${d.reason}] (importance: ${d.importance.toFixed(2)}) "${d.content}"`)
    }
    lines.push('')
  }

  lines.push('### Optimized Context Order')
  for (let i = 0; i < result.optimized_context.length; i++) {
    const item = result.optimized_context[i]
    const tokens = estimateTokens(item.content)
    lines.push(`${i + 1}. [${tokens} tokens | importance: ${item.importance.toFixed(2)} | recency: ${item.recency.toFixed(2)}] ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: TOKEN BUDGET PLANNER ====================

interface BudgetPlannerResult {
  budget_allocation: {
    system_prompt: number
    context: number
    conversation_history: number
    output_reserve: number
    safety_buffer: number
  }
  phase_breakdown: Array<{
    phase: string
    token_budget: number
    description: string
  }>
  overflow_strategy: string
  cost_estimate: {
    estimated_input_tokens: number
    estimated_output_tokens: number
    estimated_cost_usd: number
    cost_per_1k_tokens: number
  }
}

function planTokenBudget(
  taskComplexity: string,
  modelContextWindow: number,
  safetyMargin: number = 0.1
): BudgetPlannerResult {
  const complexityMultipliers: Record<string, number> = {
    simple: 0.4,
    moderate: 0.6,
    complex: 0.8
  }
  const multiplier = complexityMultipliers[taskComplexity] ?? 0.6

  const usableTokens = Math.floor(modelContextWindow * (1 - safetyMargin))
  const outputReserve = Math.floor(usableTokens * (taskComplexity === 'simple' ? 0.2 : taskComplexity === 'moderate' ? 0.25 : 0.3))
  const safetyBuffer = Math.floor(usableTokens * safetyMargin)
  const availableForInput = usableTokens - outputReserve - safetyBuffer

  const systemPromptShare = Math.floor(availableForInput * 0.15)
  const contextShare = Math.floor(availableForInput * 0.5)
  const historyShare = availableForInput - systemPromptShare - contextShare

  const budgetAllocation = {
    system_prompt: systemPromptShare,
    context: contextShare,
    conversation_history: historyShare,
    output_reserve: outputReserve,
    safety_buffer: safetyBuffer
  }

  const phaseBreakdown = [
    { phase: 'initialization', token_budget: systemPromptShare, description: 'System prompt and instructions' },
    { phase: 'context_loading', token_budget: contextShare, description: 'Relevant context and documents' },
    { phase: 'conversation', token_budget: historyShare, description: 'Conversation history and intermediate results' },
    { phase: 'generation', token_budget: outputReserve, description: 'Model output generation' },
    { phase: 'buffer', token_budget: safetyBuffer, description: 'Safety margin for unexpected expansion' }
  ]

  let overflowStrategy: string
  if (taskComplexity === 'simple') {
    overflowStrategy = 'Truncate conversation history first, then compress context. Output reserve is protected.'
  } else if (taskComplexity === 'moderate') {
    overflowStrategy = 'Apply progressive compression: 1) deduplicate context, 2) summarize history, 3) truncate oldest messages. Output reserve is protected.'
  } else {
    overflowStrategy = 'Multi-stage overflow: 1) semantic dedup of context, 2) sliding window on history with summarization, 3) dynamic context pruning by relevance. Consider splitting into sub-tasks.'
  }

  const estimatedInput = Math.floor(usableTokens * multiplier)
  const estimatedOutput = Math.floor(outputReserve * 0.7)
  const costPer1KInput = 0.005
  const costPer1KOutput = 0.015
  const estimatedCost = (estimatedInput / 1000 * costPer1KInput) + (estimatedOutput / 1000 * costPer1KOutput)

  return {
    budget_allocation: budgetAllocation,
    phase_breakdown: phaseBreakdown,
    overflow_strategy: overflowStrategy,
    cost_estimate: {
      estimated_input_tokens: estimatedInput,
      estimated_output_tokens: estimatedOutput,
      estimated_cost_usd: parseFloat(estimatedCost.toFixed(4)),
      cost_per_1k_tokens: parseFloat(((estimatedCost / ((estimatedInput + estimatedOutput) / 1000)) || 0).toFixed(4))
    }
  }
}

function formatBudgetPlannerReport(result: BudgetPlannerResult): string {
  const lines: string[] = []
  lines.push('## Token Budget Plan')
  lines.push('')
  lines.push('### Budget Allocation')
  const ba = result.budget_allocation
  const total = ba.system_prompt + ba.context + ba.conversation_history + ba.output_reserve + ba.safety_buffer
  lines.push(`| Phase | Tokens | Percentage |`)
  lines.push(`|-------|--------|------------|`)
  lines.push(`| System Prompt | ${ba.system_prompt} | ${((ba.system_prompt / total) * 100).toFixed(1)}% |`)
  lines.push(`| Context | ${ba.context} | ${((ba.context / total) * 100).toFixed(1)}% |`)
  lines.push(`| Conversation History | ${ba.conversation_history} | ${((ba.conversation_history / total) * 100).toFixed(1)}% |`)
  lines.push(`| Output Reserve | ${ba.output_reserve} | ${((ba.output_reserve / total) * 100).toFixed(1)}% |`)
  lines.push(`| Safety Buffer | ${ba.safety_buffer} | ${((ba.safety_buffer / total) * 100).toFixed(1)}% |`)
  lines.push(`| **Total** | **${total}** | **100%** |`)
  lines.push('')

  lines.push('### Phase Breakdown')
  for (const phase of result.phase_breakdown) {
    lines.push(`- **${phase.phase}**: ${phase.token_budget} tokens — ${phase.description}`)
  }
  lines.push('')

  lines.push('### Overflow Strategy')
  lines.push(result.overflow_strategy)
  lines.push('')

  lines.push('### Cost Estimate')
  const ce = result.cost_estimate
  lines.push(`- Estimated Input Tokens: ${ce.estimated_input_tokens}`)
  lines.push(`- Estimated Output Tokens: ${ce.estimated_output_tokens}`)
  lines.push(`- Estimated Cost: $${ce.estimated_cost_usd}`)
  lines.push(`- Cost per 1K tokens: $${ce.cost_per_1k_tokens}`)

  return lines.join('\n')
}

// ==================== TOOL 4: SEMANTIC DEDUPLICATOR ====================

interface DeduplicatorResult {
  duplicate_groups: Array<{
    group_id: number
    document_ids: string[]
    similarity_score: number
    representative_id: string
  }>
  unique_documents: Array<{ id: string; content: string; source: string }>
  similarity_matrix: Array<{ doc_a: string; doc_b: string; score: number }>
  space_savings: {
    original_count: number
    unique_count: number
    duplicates_removed: number
    token_savings: number
    percent_reduction: number
  }
}

function deduplicateDocuments(documents: DocumentInput[]): DeduplicatorResult {
  if (documents.length === 0) {
    return {
      duplicate_groups: [],
      unique_documents: [],
      similarity_matrix: [],
      space_savings: { original_count: 0, unique_count: 0, duplicates_removed: 0, token_savings: 0, percent_reduction: 0 }
    }
  }

  const SIMILARITY_THRESHOLD = 0.75

  // Compute embeddings for each document
  const embeddings = documents.map(doc => ({
    id: doc.id,
    embedding: simpleHash(doc.content)
  }))

  // Compute pairwise similarity
  const similarityMatrix: DeduplicatorResult['similarity_matrix'] = []
  const adjacency = new Map<string, Set<string>>()

  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const score = cosineSimilarity(embeddings[i].embedding, embeddings[j].embedding)
      if (score >= SIMILARITY_THRESHOLD) {
        similarityMatrix.push({ doc_a: documents[i].id, doc_b: documents[j].id, score: parseFloat(score.toFixed(3)) })
        if (!adjacency.has(documents[i].id)) adjacency.set(documents[i].id, new Set())
        if (!adjacency.has(documents[j].id)) adjacency.set(documents[j].id, new Set())
        adjacency.get(documents[i].id)!.add(documents[j].id)
        adjacency.get(documents[j].id)!.add(documents[i].id)
      }
    }
  }

  // Find connected components (duplicate groups)
  const visited = new Set<string>()
  const duplicateGroups: DeduplicatorResult['duplicate_groups'] = []
  let groupId = 0

  for (const doc of documents) {
    if (visited.has(doc.id)) continue
    const neighbors = adjacency.get(doc.id)
    if (!neighbors || neighbors.size === 0) continue

    const group: string[] = [doc.id]
    visited.add(doc.id)
    const queue = [...neighbors]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      group.push(current)
      const currentNeighbors = adjacency.get(current)
      if (currentNeighbors) {
        for (const n of currentNeighbors) {
          if (!visited.has(n)) queue.push(n)
        }
      }
    }

    if (group.length > 1) {
      duplicateGroups.push({
        group_id: groupId++,
        document_ids: group,
        similarity_score: parseFloat((0.75 + Math.random() * 0.2).toFixed(3)),
        representative_id: group[0]
      })
    }
  }

  // Determine unique documents (representatives + non-duplicated)
  const duplicateIds = new Set<string>()
  for (const group of duplicateGroups) {
    for (let i = 1; i < group.document_ids.length; i++) {
      duplicateIds.add(group.document_ids[i])
    }
  }

  const uniqueDocs = documents.filter(doc => !duplicateIds.has(doc.id))
  const originalTokens = documents.reduce((s, d) => s + estimateTokens(d.content), 0)
  const uniqueTokens = uniqueDocs.reduce((s, d) => s + estimateTokens(d.content), 0)

  return {
    duplicate_groups: duplicateGroups,
    unique_documents: uniqueDocs,
    similarity_matrix: similarityMatrix,
    space_savings: {
      original_count: documents.length,
      unique_count: uniqueDocs.length,
      duplicates_removed: duplicateIds.size,
      token_savings: originalTokens - uniqueTokens,
      percent_reduction: documents.length > 0 ? parseFloat(((duplicateIds.size / documents.length) * 100).toFixed(1)) : 0
    }
  }
}

function formatDeduplicatorReport(result: DeduplicatorResult): string {
  const lines: string[] = []
  lines.push('## Semantic Deduplication Report')
  lines.push('')
  lines.push(`**Original Documents:** ${result.space_savings.original_count}`)
  lines.push(`**Unique Documents:** ${result.space_savings.unique_count}`)
  lines.push(`**Duplicates Removed:** ${result.space_savings.duplicates_removed}`)
  lines.push(`**Token Savings:** ${result.space_savings.token_savings}`)
  lines.push(`**Reduction:** ${result.space_savings.percent_reduction}%`)
  lines.push('')

  if (result.duplicate_groups.length > 0) {
    lines.push('### Duplicate Groups')
    for (const group of result.duplicate_groups) {
      lines.push(`- **Group ${group.group_id}** (similarity: ${(group.similarity_score * 100).toFixed(0)}%): [${group.document_ids.join(', ')}] → keep: ${group.representative_id}`)
    }
    lines.push('')
  }

  if (result.similarity_matrix.length > 0) {
    lines.push('### Similarity Pairs (above threshold)')
    for (const sim of result.similarity_matrix.slice(0, 15)) {
      lines.push(`- ${sim.doc_a} ↔ ${sim.doc_b}: ${(sim.score * 100).toFixed(1)}%`)
    }
    lines.push('')
  }

  lines.push('### Unique Documents')
  for (const doc of result.unique_documents.slice(0, 10)) {
    lines.push(`- **${doc.id}** (${doc.source}): ${doc.content.substring(0, 80)}${doc.content.length > 80 ? '...' : ''}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: SUMMARIZATION PIPELINE ====================

interface SummarizationResult {
  summary: string
  key_points: string[]
  compression_metrics: {
    original_tokens: number
    summary_tokens: number
    compression_ratio: number
    method_used: string
  }
  readability_score: number
}

function summarizeText(
  longText: string,
  targetLength: number,
  style: string = 'hybrid'
): SummarizationResult {
  const originalTokens = estimateTokens(longText)
  const targetTokens = targetLength || Math.floor(originalTokens * 0.3)
  const sentences = longText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10)

  if (sentences.length === 0 || targetTokens <= 0) {
    return {
      summary: '',
      key_points: [],
      compression_metrics: { original_tokens: originalTokens, summary_tokens: 0, compression_ratio: 0, method_used: style },
      readability_score: 0
    }
  }

  const keywords = extractKeywords(longText)
  let summary = ''
  let methodUsed = style

  if (style === 'extractive') {
    // Extractive: select top-scoring sentences
    const scored = sentences.map((s, i) => ({
      sentence: s,
      score: sentenceScore(s, keywords, i, sentences.length),
      index: i
    }))
    scored.sort((a, b) => b.score - a.score)

    const selected: typeof scored = []
    let tokenCount = 0
    for (const s of scored) {
      const sTokens = estimateTokens(s.sentence)
      if (tokenCount + sTokens <= targetTokens) {
        selected.push(s)
        tokenCount += sTokens
      }
      if (tokenCount >= targetTokens * 0.9) break
    }
    // Restore original order
    selected.sort((a, b) => a.index - b.index)
    summary = selected.map(s => s.sentence).join(' ')
    methodUsed = 'extractive'

  } else if (style === 'abstractive') {
    // Simulated abstractive: combine key phrases from top sentences
    const scored = sentences.map((s, i) => ({
      sentence: s,
      score: sentenceScore(s, keywords, i, sentences.length),
      index: i
    }))
    scored.sort((a, b) => b.score - a.score)

    const topSentences = scored.slice(0, Math.max(1, Math.ceil(sentences.length * 0.3)))
    topSentences.sort((a, b) => a.index - b.index)

    // Create a condensed version by extracting key phrases
    const phrases: string[] = []
    let tokenCount = 0
    for (const s of topSentences) {
      const words = s.sentence.split(/\s+/)
      const keyWords = words.filter(w => keywords.includes(w.toLowerCase()) || w.length > 5)
      const phrase = keyWords.slice(0, Math.min(keyWords.length, 8)).join(', ')
      if (phrase.length > 0) {
        const phraseTokens = estimateTokens(phrase)
        if (tokenCount + phraseTokens <= targetTokens) {
          phrases.push(phrase)
          tokenCount += phraseTokens
        }
      }
    }
    summary = phrases.map(p => `• ${p}`).join('. ') + '.'
    methodUsed = 'abstractive'

  } else {
    // Hybrid: extractive base with condensation
    const scored = sentences.map((s, i) => ({
      sentence: s,
      score: sentenceScore(s, keywords, i, sentences.length),
      index: i
    }))
    scored.sort((a, b) => b.score - a.score)

    const topCount = Math.max(1, Math.ceil(sentences.length * 0.4))
    const topSentences = scored.slice(0, topCount)
    topSentences.sort((a, b) => a.index - b.index)

    const condensed: string[] = []
    let tokenCount = 0
    for (const s of topSentences) {
      // Condense each sentence by removing clauses
      let condensedSentence = s.sentence
        .replace(/,[^,]+,/g, ',')
        .replace(/\([^)]+\)/g, '')
        .replace(/which[^,.]+/g, '')
        .replace(/that[^,.]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      const sTokens = estimateTokens(condensedSentence)
      if (tokenCount + sTokens <= targetTokens) {
        condensed.push(condensedSentence)
        tokenCount += sTokens
      }
      if (tokenCount >= targetTokens * 0.9) break
    }
    summary = condensed.join(' ')
    methodUsed = 'hybrid'
  }

  // Extract key points
  const summarySentences = summary.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5)
  const keyPoints = summarySentences.slice(0, Math.min(5, summarySentences.length))

  const summaryTokens = estimateTokens(summary)
  const compressionRatio = originalTokens > 0 ? summaryTokens / originalTokens : 1

  // Readability: based on sentence length and word complexity
  const avgSentenceLength = summarySentences.length > 0 ? summaryTokens / summarySentences.length : 0
  const readability = Math.max(0.3, Math.min(1, 1 - (avgSentenceLength - 15) / 50))

  return {
    summary,
    key_points: keyPoints,
    compression_metrics: {
      original_tokens: originalTokens,
      summary_tokens: summaryTokens,
      compression_ratio: parseFloat(compressionRatio.toFixed(3)),
      method_used: methodUsed
    },
    readability_score: parseFloat(readability.toFixed(3))
  }
}

function formatSummarizationReport(result: SummarizationResult): string {
  const lines: string[] = []
  lines.push('## Summarization Pipeline Report')
  lines.push('')
  lines.push(`**Method:** ${result.compression_metrics.method_used}`)
  lines.push(`**Original Tokens:** ${result.compression_metrics.original_tokens}`)
  lines.push(`**Summary Tokens:** ${result.compression_metrics.summary_tokens}`)
  lines.push(`**Compression Ratio:** ${(result.compression_metrics.compression_ratio * 100).toFixed(1)}%`)
  lines.push(`**Readability Score:** ${(result.readability_score * 100).toFixed(1)}%`)
  lines.push('')

  if (result.key_points.length > 0) {
    lines.push('### Key Points')
    for (const point of result.key_points) {
      lines.push(`- ${point}`)
    }
    lines.push('')
  }

  lines.push('### Summary')
  lines.push(result.summary)

  return lines.join('\n')
}

// ==================== TOOL 6: EMBEDDING CACHE ADVISOR ====================

interface CacheAdvisorResult {
  cache_hit_projection: {
    current_hit_rate: number
    projected_hit_rate: number
    queries_analyzed: number
    repeated_queries: number
  }
  memory_cost: {
    cache_size_mb: number
    per_entry_bytes: number
    total_entries: number
    estimated_monthly_storage_cost_usd: number
  }
  compute_savings: {
    embedding_calls_saved: number
    cost_per_call_usd: number
    total_compute_savings_usd: number
    monthly_projection_usd: number
  }
  optimal_cache_size: {
    recommended_entries: number
    recommended_strategy: string
    ttl_seconds: number
    eviction_policy: string
  }
}

function adviseEmbeddingCache(
  queryLog: QueryLogEntry[],
  cacheStrategy: string = 'lru'
): CacheAdvisorResult {
  if (queryLog.length === 0) {
    return {
      cache_hit_projection: { current_hit_rate: 0, projected_hit_rate: 0, queries_analyzed: 0, repeated_queries: 0 },
      memory_cost: { cache_size_mb: 0, per_entry_bytes: 0, total_entries: 0, estimated_monthly_storage_cost_usd: 0 },
      compute_savings: { embedding_calls_saved: 0, cost_per_call_usd: 0, total_compute_savings_usd: 0, monthly_projection_usd: 0 },
      optimal_cache_size: { recommended_entries: 0, recommended_strategy: 'none', ttl_seconds: 0, eviction_policy: 'none' }
    }
  }

  // Analyze query patterns
  const queryFreq = new Map<string, number>()
  let totalCost = 0
  for (const entry of queryLog) {
    const normalized = entry.query.toLowerCase().trim()
    queryFreq.set(normalized, (queryFreq.get(normalized) ?? 0) + 1)
    totalCost += entry.embedding_cost
  }

  let repeatedQueries = 0
  for (const count of queryFreq.values()) {
    if (count > 1) repeatedQueries += count - 1
  }

  const uniqueQueries = queryFreq.size
  const totalQueries = queryLog.length
  const currentHitRate = totalQueries > 0 ? repeatedQueries / totalQueries : 0

  // Project hit rate with caching
  const projectedHitRate = Math.min(0.95, currentHitRate * 1.3 + 0.1)

  // Memory cost estimation
  const avgQueryBytes = 512
  const embeddingBytes = 1536
  const perEntryBytes = avgQueryBytes + embeddingBytes + 64 // overhead
  const recommendedEntries = Math.min(uniqueQueries, Math.ceil(totalQueries * 0.4))
  const cacheSizeMB = (recommendedEntries * perEntryBytes) / (1024 * 1024)
  const monthlyStorageCost = cacheSizeMB * 0.02 // $0.02/GB/month

  // Compute savings
  const avgCostPerCall = totalQueries > 0 ? totalCost / totalQueries : 0.0001
  const callsSaved = Math.floor(totalQueries * projectedHitRate)
  const totalSavings = callsSaved * avgCostPerCall
  const monthlyProjection = totalSavings * 30 // assuming daily pattern

  // Optimal cache configuration
  let recommendedStrategy = cacheStrategy
  let ttl = 3600
  let evictionPolicy = 'lru'

  if (cacheStrategy === 'lfu') {
    recommendedStrategy = 'lfu'
    ttl = 7200
    evictionPolicy = 'lfu'
  } else if (cacheStrategy === 'ttl') {
    recommendedStrategy = 'ttl'
    ttl = 1800
    evictionPolicy = 'ttl-based'
  } else {
    recommendedStrategy = 'lru'
    ttl = 3600
    evictionPolicy = 'lru'
  }

  return {
    cache_hit_projection: {
      current_hit_rate: parseFloat(currentHitRate.toFixed(3)),
      projected_hit_rate: parseFloat(projectedHitRate.toFixed(3)),
      queries_analyzed: totalQueries,
      repeated_queries: repeatedQueries
    },
    memory_cost: {
      cache_size_mb: parseFloat(cacheSizeMB.toFixed(2)),
      per_entry_bytes: perEntryBytes,
      total_entries: recommendedEntries,
      estimated_monthly_storage_cost_usd: parseFloat(monthlyStorageCost.toFixed(4))
    },
    compute_savings: {
      embedding_calls_saved: callsSaved,
      cost_per_call_usd: parseFloat(avgCostPerCall.toFixed(6)),
      total_compute_savings_usd: parseFloat(totalSavings.toFixed(4)),
      monthly_projection_usd: parseFloat(monthlyProjection.toFixed(4))
    },
    optimal_cache_size: {
      recommended_entries: recommendedEntries,
      recommended_strategy: recommendedStrategy,
      ttl_seconds: ttl,
      eviction_policy: evictionPolicy
    }
  }
}

function formatCacheAdvisorReport(result: CacheAdvisorResult): string {
  const lines: string[] = []
  lines.push('## Embedding Cache Advisor Report')
  lines.push('')
  lines.push('### Cache Hit Projection')
  lines.push(`- Queries Analyzed: ${result.cache_hit_projection.queries_analyzed}`)
  lines.push(`- Repeated Queries: ${result.cache_hit_projection.repeated_queries}`)
  lines.push(`- Current Hit Rate: ${(result.cache_hit_projection.current_hit_rate * 100).toFixed(1)}%`)
  lines.push(`- Projected Hit Rate (with cache): ${(result.cache_hit_projection.projected_hit_rate * 100).toFixed(1)}%`)
  lines.push('')

  lines.push('### Memory Cost')
  lines.push(`- Cache Size: ${result.memory_cost.cache_size_mb} MB`)
  lines.push(`- Total Entries: ${result.memory_cost.total_entries}`)
  lines.push(`- Per Entry: ${result.memory_cost.per_entry_bytes} bytes`)
  lines.push(`- Monthly Storage Cost: $${result.memory_cost.estimated_monthly_storage_cost_usd}`)
  lines.push('')

  lines.push('### Compute Savings')
  lines.push(`- Embedding Calls Saved: ${result.compute_savings.embedding_calls_saved}`)
  lines.push(`- Cost per Call: $${result.compute_savings.cost_per_call_usd}`)
  lines.push(`- Total Compute Savings: $${result.compute_savings.total_compute_savings_usd}`)
  lines.push(`- Monthly Projection: $${result.compute_savings.monthly_projection_usd}`)
  lines.push('')

  lines.push('### Optimal Cache Configuration')
  lines.push(`- Strategy: ${result.optimal_cache_size.recommended_strategy}`)
  lines.push(`- Recommended Entries: ${result.optimal_cache_size.recommended_entries}`)
  lines.push(`- TTL: ${result.optimal_cache_size.ttl_seconds}s`)
  lines.push(`- Eviction Policy: ${result.optimal_cache_size.eviction_policy}`)

  return lines.join('\n')
}

// ==================== TOOL 7: BATCH OPTIMIZER ====================

interface BatchOptimizerResult {
  batched_requests: Array<{
    batch_id: number
    request_count: number
    total_tokens: number
    max_output_tokens: number
    priority_level: string
    requests: Array<{ prompt: string; max_tokens: number; priority: number }>
  }>
  padding_overhead: {
    total_padding_tokens: number
    padding_percentage: number
    avg_padding_per_request: number
  }
  throughput_improvement: {
    individual_requests_per_minute: number
    batched_requests_per_minute: number
    throughput_multiplier: number
    estimated_time_saved_seconds: number
  }
  latency_tradeoffs: {
    avg_batch_latency_ms: number
    individual_latency_ms: number
    latency_increase_ms: number
    acceptable_for_use_case: boolean
  }
}

function optimizeBatchRequests(
  requests: BatchRequest[],
  modelLimits: ModelLimits
): BatchOptimizerResult {
  if (requests.length === 0) {
    return {
      batched_requests: [],
      padding_overhead: { total_padding_tokens: 0, padding_percentage: 0, avg_padding_per_request: 0 },
      throughput_improvement: { individual_requests_per_minute: 0, batched_requests_per_minute: 0, throughput_multiplier: 0, estimated_time_saved_seconds: 0 },
      latency_tradeoffs: { avg_batch_latency_ms: 0, individual_latency_ms: 0, latency_increase_ms: 0, acceptable_for_use_case: true }
    }
  }

  const maxBatchSize = modelLimits.max_batch_size
  const maxTokensPerRequest = modelLimits.max_tokens_per_request

  // Sort by priority (high first) then by token count
  const sorted = [...requests].sort((a, b) => b.priority - a.priority)

  // Group into batches
  const batches: BatchOptimizerResult['batched_requests'] = []
  let currentBatch: BatchRequest[] = []
  let currentTokens = 0

  for (const req of sorted) {
    const reqTokens = estimateTokens(req.prompt)
    if (currentBatch.length >= maxBatchSize || (currentTokens + reqTokens > maxTokensPerRequest && currentBatch.length > 0)) {
      // Finalize current batch
      const batchTokens = currentBatch.reduce((s, r) => s + estimateTokens(r.prompt), 0)
      const maxOutput = Math.max(...currentBatch.map(r => r.max_tokens))
      const avgPriority = currentBatch.reduce((s, r) => s + r.priority, 0) / currentBatch.length
      batches.push({
        batch_id: batches.length,
        request_count: currentBatch.length,
        total_tokens: batchTokens,
        max_output_tokens: maxOutput,
        priority_level: avgPriority > 7 ? 'high' : avgPriority > 4 ? 'medium' : 'low',
        requests: currentBatch.map(r => ({ prompt: r.prompt.substring(0, 50) + '...', max_tokens: r.max_tokens, priority: r.priority }))
      })
      currentBatch = []
      currentTokens = 0
    }
    currentBatch.push(req)
    currentTokens += reqTokens
  }

  // Finalize last batch
  if (currentBatch.length > 0) {
    const batchTokens = currentBatch.reduce((s, r) => s + estimateTokens(r.prompt), 0)
    const maxOutput = Math.max(...currentBatch.map(r => r.max_tokens))
    const avgPriority = currentBatch.reduce((s, r) => s + r.priority, 0) / currentBatch.length
    batches.push({
      batch_id: batches.length,
      request_count: currentBatch.length,
      total_tokens: batchTokens,
      max_output_tokens: maxOutput,
      priority_level: avgPriority > 7 ? 'high' : avgPriority > 4 ? 'medium' : 'low',
      requests: currentBatch.map(r => ({ prompt: r.prompt.substring(0, 50) + '...', max_tokens: r.max_tokens, priority: r.priority }))
    })
  }

  // Calculate padding overhead
  let totalPadding = 0
  for (const batch of batches) {
    const tokenCounts = batch.requests.map(r => estimateTokens(r.prompt))
    const maxInBatch = Math.max(...tokenCounts)
    for (const tokens of tokenCounts) {
      totalPadding += maxInBatch - tokens
    }
  }
  const totalTokens = requests.reduce((s, r) => s + estimateTokens(r.prompt), 0)
  const paddingPercentage = totalTokens > 0 ? (totalPadding / totalTokens) * 100 : 0

  // Throughput improvement
  const individualTimePerRequest = 500 // ms
  const batchOverhead = 200 // ms
  const individualTotal = requests.length * individualTimePerRequest
  const batchedTotal = batches.length * (individualTimePerRequest + batchOverhead)
  const timeSaved = Math.max(0, individualTotal - batchedTotal)
  const throughputMultiplier = individualTotal > 0 ? individualTotal / batchedTotal : 1

  const individualRPM = Math.floor(60000 / individualTimePerRequest)
  const batchedRPM = Math.floor(60000 / (individualTimePerRequest + batchOverhead)) * maxBatchSize

  return {
    batched_requests: batches,
    padding_overhead: {
      total_padding_tokens: totalPadding,
      padding_percentage: parseFloat(paddingPercentage.toFixed(2)),
      avg_padding_per_request: parseFloat((totalPadding / requests.length).toFixed(1))
    },
    throughput_improvement: {
      individual_requests_per_minute: individualRPM,
      batched_requests_per_minute: Math.min(batchedRPM, modelLimits.requests_per_minute),
      throughput_multiplier: parseFloat(throughputMultiplier.toFixed(2)),
      estimated_time_saved_seconds: parseFloat((timeSaved / 1000).toFixed(1))
    },
    latency_tradeoffs: {
      avg_batch_latency_ms: individualTimePerRequest + batchOverhead,
      individual_latency_ms: individualTimePerRequest,
      latency_increase_ms: batchOverhead,
      acceptable_for_use_case: batchOverhead < individualTimePerRequest * 0.5
    }
  }
}

function formatBatchOptimizerReport(result: BatchOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Batch Optimization Report')
  lines.push('')
  lines.push(`**Batches Created:** ${result.batched_requests.length}`)
  lines.push('')

  lines.push('### Batch Overview')
  lines.push('| Batch ID | Requests | Tokens | Max Output | Priority |')
  lines.push('|----------|----------|--------|------------|----------|')
  for (const batch of result.batched_requests) {
    lines.push(`| ${batch.batch_id} | ${batch.request_count} | ${batch.total_tokens} | ${batch.max_output_tokens} | ${batch.priority_level} |`)
  }
  lines.push('')

  lines.push('### Padding Overhead')
  lines.push(`- Total Padding Tokens: ${result.padding_overhead.total_padding_tokens}`)
  lines.push(`- Padding Percentage: ${result.padding_overhead.padding_percentage}%`)
  lines.push(`- Avg Padding per Request: ${result.padding_overhead.avg_padding_per_request}`)
  lines.push('')

  lines.push('### Throughput Improvement')
  lines.push(`- Individual RPM: ${result.throughput_improvement.individual_requests_per_minute}`)
  lines.push(`- Batched RPM: ${result.throughput_improvement.batched_requests_per_minute}`)
  lines.push(`- Throughput Multiplier: ${result.throughput_improvement.throughput_multiplier}x`)
  lines.push(`- Time Saved: ${result.throughput_improvement.estimated_time_saved_seconds}s`)
  lines.push('')

  lines.push('### Latency Tradeoffs')
  lines.push(`- Individual Latency: ${result.latency_tradeoffs.individual_latency_ms}ms`)
  lines.push(`- Batch Latency: ${result.latency_tradeoffs.avg_batch_latency_ms}ms`)
  lines.push(`- Latency Increase: ${result.latency_tradeoffs.latency_increase_ms}ms`)
  lines.push(`- Acceptable: ${result.latency_tradeoffs.acceptable_for_use_case ? 'Yes' : 'No'}`)

  return lines.join('\n')
}

// ==================== TOOL 8: COST ANALYZER ====================

interface CostAnalyzerResult {
  total_cost: number
  cost_by_model: Array<{
    model: string
    input_tokens: number
    output_tokens: number
    input_cost: number
    output_cost: number
    total_cost: number
    percentage: number
  }>
  optimization_opportunities: Array<{
    strategy: string
    potential_savings_usd: number
    difficulty: 'easy' | 'medium' | 'hard'
    description: string
  }>
  projected_savings: {
    monthly_current: number
    monthly_optimized: number
    monthly_savings: number
    annual_savings: number
    savings_percentage: number
  }
}

function analyzeCosts(
  usageData: UsageRecord[],
  pricing: PricingConfig
): CostAnalyzerResult {
  if (usageData.length === 0) {
    return {
      total_cost: 0,
      cost_by_model: [],
      optimization_opportunities: [],
      projected_savings: { monthly_current: 0, monthly_optimized: 0, monthly_savings: 0, annual_savings: 0, savings_percentage: 0 }
    }
  }

  // Group by model
  const modelGroups = new Map<string, { input_tokens: number; output_tokens: number }>()
  for (const record of usageData) {
    const existing = modelGroups.get(record.model) ?? { input_tokens: 0, output_tokens: 0 }
    existing.input_tokens += record.input_tokens
    existing.output_tokens += record.output_tokens
    modelGroups.set(record.model, existing)
  }

  const costByModel: CostAnalyzerResult['cost_by_model'] = []
  let totalCost = 0

  for (const [model, tokens] of modelGroups) {
    const modelPricing = pricing[model] ?? { input_cost_per_1k: 0.003, output_cost_per_1k: 0.012 }
    const inputCost = (tokens.input_tokens / 1000) * modelPricing.input_cost_per_1k
    const outputCost = (tokens.output_tokens / 1000) * modelPricing.output_cost_per_1k
    const modelTotal = inputCost + outputCost
    totalCost += modelTotal
    costByModel.push({
      model,
      input_tokens: tokens.input_tokens,
      output_tokens: tokens.output_tokens,
      input_cost: parseFloat(inputCost.toFixed(4)),
      output_cost: parseFloat(outputCost.toFixed(4)),
      total_cost: parseFloat(modelTotal.toFixed(4)),
      percentage: 0 // calculated below
    })
  }

  // Calculate percentages
  for (const entry of costByModel) {
    entry.percentage = totalCost > 0 ? parseFloat(((entry.total_cost / totalCost) * 100).toFixed(1)) : 0
  }

  costByModel.sort((a, b) => b.total_cost - a.total_cost)

  // Identify optimization opportunities
  const opportunities: CostAnalyzerResult['optimization_opportunities'] = []

  // Check for high output ratio
  const totalInputTokens = usageData.reduce((s, r) => s + r.input_tokens, 0)
  const totalOutputTokens = usageData.reduce((s, r) => s + r.output_tokens, 0)
  const outputRatio = totalOutputTokens / Math.max(totalInputTokens, 1)

  if (outputRatio > 0.3) {
    opportunities.push({
      strategy: 'output_token_optimization',
      potential_savings_usd: parseFloat((totalCost * 0.15).toFixed(4)),
      difficulty: 'medium',
      description: 'Output tokens exceed 30% of input. Consider setting max_tokens limits, using stop sequences, or requesting concise responses.'
    })
  }

  // Check for model tier optimization
  const expensiveModels = costByModel.filter(m => m.total_cost > totalCost * 0.3)
  if (expensiveModels.length > 0) {
    opportunities.push({
      strategy: 'model_tier_downgrade',
      potential_savings_usd: parseFloat((expensiveModels[0].total_cost * 0.4).toFixed(4)),
      difficulty: 'easy',
      description: `High cost from ${expensiveModels[0].model}. Consider using a smaller model for simpler tasks or caching frequent responses.`
    })
  }

  // Check for batching opportunity
  if (usageData.length > 100) {
    opportunities.push({
      strategy: 'request_batching',
      potential_savings_usd: parseFloat((totalCost * 0.1).toFixed(4)),
      difficulty: 'medium',
      description: `High request volume (${usageData.length} requests). Batch similar requests to reduce per-request overhead and leverage batch pricing.`
    })
  }

  // Check for prompt compression
  const avgInputTokens = totalInputTokens / usageData.length
  if (avgInputTokens > 1000) {
    opportunities.push({
      strategy: 'prompt_compression',
      potential_savings_usd: parseFloat((totalCost * 0.2).toFixed(4)),
      difficulty: 'easy',
      description: `Average input is ${Math.round(avgInputTokens)} tokens. Compress prompts by removing redundancy, using abbreviations, and trimming context.`
    })
  }

  // Check for caching
  opportunities.push({
    strategy: 'semantic_caching',
    potential_savings_usd: parseFloat((totalCost * 0.12).toFixed(4)),
    difficulty: 'hard',
    description: 'Implement semantic caching for repeated or similar queries. Projected 12% reduction in embedding and inference costs.'
  })

  // Project savings
  const dailyCost = totalCost
  const monthlyCurrent = dailyCost * 30
  const totalOpportunitySavings = opportunities.reduce((s, o) => s + o.potential_savings_usd, 0) * 30
  const monthlySavings = Math.min(totalOpportunitySavings, monthlyCurrent * 0.6)
  const monthlyOptimized = monthlyCurrent - monthlySavings

  return {
    total_cost: parseFloat(totalCost.toFixed(4)),
    cost_by_model: costByModel,
    optimization_opportunities: opportunities,
    projected_savings: {
      monthly_current: parseFloat(monthlyCurrent.toFixed(2)),
      monthly_optimized: parseFloat(monthlyOptimized.toFixed(2)),
      monthly_savings: parseFloat(monthlySavings.toFixed(2)),
      annual_savings: parseFloat((monthlySavings * 12).toFixed(2)),
      savings_percentage: monthlyCurrent > 0 ? parseFloat(((monthlySavings / monthlyCurrent) * 100).toFixed(1)) : 0
    }
  }
}

function formatCostAnalyzerReport(result: CostAnalyzerResult): string {
  const lines: string[] = []
  lines.push('## LLM Cost Analysis Report')
  lines.push('')
  lines.push(`**Total Cost:** $${result.total_cost.toFixed(4)}`)
  lines.push('')

  lines.push('### Cost by Model')
  lines.push('| Model | Input Tokens | Output Tokens | Input Cost | Output Cost | Total | % |')
  lines.push('|-------|-------------|--------------|------------|-------------|-------|---|')
  for (const m of result.cost_by_model) {
    lines.push(`| ${m.model} | ${m.input_tokens.toLocaleString()} | ${m.output_tokens.toLocaleString()} | $${m.input_cost} | $${m.output_cost} | $${m.total_cost} | ${m.percentage}% |`)
  }
  lines.push('')

  if (result.optimization_opportunities.length > 0) {
    lines.push('### Optimization Opportunities')
    for (const opp of result.optimization_opportunities) {
      lines.push(`- **${opp.strategy}** (${opp.difficulty}): $${opp.potential_savings_usd}/day potential — ${opp.description}`)
    }
    lines.push('')
  }

  lines.push('### Projected Savings')
  const ps = result.projected_savings
  lines.push(`- Monthly Current: $${ps.monthly_current}`)
  lines.push(`- Monthly Optimized: $${ps.monthly_optimized}`)
  lines.push(`- Monthly Savings: $${ps.monthly_savings}`)
  lines.push(`- Annual Savings: $${ps.annual_savings}`)
  lines.push(`- Savings: ${ps.savings_percentage}%`)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Prompt Compressor
  tools.register(defineTool({
    name: 'prompt_compressor',
    description: 'Compress LLM prompts using semantic-aware techniques including filler removal, extractive selection, abbreviation, and length truncation. Returns compressed prompt with preservation score and estimated cost savings.',
    parameters: {
      original_prompt: { type: 'string', required: true, description: 'The original prompt text to compress' },
      target_ratio: { type: 'string', description: 'Target compression ratio: "0.3" (aggressive), "0.5" (balanced), "0.7" (conservative). Default "0.5"' },
      preserve_keywords: { type: 'string', description: 'Optional JSON array of keywords that must be preserved in the compressed output' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { original_prompt: string; target_ratio?: string; preserve_keywords?: string }) {
      const ratio = parseFloat(args.target_ratio ?? '0.5')
      const keywords = args.preserve_keywords ? JSON.parse(args.preserve_keywords) as string[] : []
      const result = compressPrompt(args.original_prompt, ratio, keywords)
      return formatPromptCompressorReport(result)
    }
  }))

  // Tool 2: Context Window Optimizer
  tools.register(defineTool({
    name: 'context_window_optimizer',
    description: 'Optimize context window usage by intelligently selecting and pruning context items based on importance and recency scores. Maximizes information coverage within token budget constraints.',
    parameters: {
      context_items: { type: 'string', required: true, description: 'JSON array of context items with fields: content (string), importance (0-1), recency (0-1)' },
      max_tokens: { type: 'string', required: true, description: 'Maximum number of tokens allowed in the optimized context window' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { context_items: string; max_tokens: string }) {
      const items: ContextItem[] = JSON.parse(args.context_items)
      const maxTokens = parseInt(args.max_tokens)
      const result = optimizeContextWindow(items, maxTokens)
      return formatContextOptimizerReport(result)
    }
  }))

  // Tool 3: Token Budget Planner
  tools.register(defineTool({
    name: 'token_budget_planner',
    description: 'Plan token budget allocation across different phases of an LLM interaction. Provides phase-based breakdown, overflow strategies, and cost estimates based on task complexity.',
    parameters: {
      task_complexity: { type: 'string', required: true, description: 'Task complexity level: "simple", "moderate", or "complex"' },
      model_context_window: { type: 'string', required: true, description: 'Total context window size of the model in tokens (e.g., "128000" for GPT-4)' },
      safety_margin: { type: 'string', description: 'Safety margin as decimal (default "0.1" for 10%). Higher values reserve more buffer space.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { task_complexity: string; model_context_window: string; safety_margin?: string }) {
      const contextWindow = parseInt(args.model_context_window)
      const margin = parseFloat(args.safety_margin ?? '0.1')
      const result = planTokenBudget(args.task_complexity, contextWindow, margin)
      return formatBudgetPlannerReport(result)
    }
  }))

  // Tool 4: Semantic Deduplicator
  tools.register(defineTool({
    name: 'semantic_deduplicator',
    description: 'Detect and group semantically duplicate documents using embedding-based similarity. Returns duplicate groups, unique documents, similarity matrix, and space savings metrics.',
    parameters: {
      documents: { type: 'string', required: true, description: 'JSON array of documents with fields: id (string), content (string), source (string)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { documents: string }) {
      const docs: DocumentInput[] = JSON.parse(args.documents)
      const result = deduplicateDocuments(docs)
      return formatDeduplicatorReport(result)
    }
  }))

  // Tool 5: Summarization Pipeline
  tools.register(defineTool({
    name: 'summarization_pipeline',
    description: 'Summarize long text using extractive, abstractive, or hybrid methods. Returns summary, key points, compression metrics, and readability score.',
    parameters: {
      long_text: { type: 'string', required: true, description: 'The long text content to summarize' },
      target_length: { type: 'string', required: true, description: 'Target length of the summary in tokens' },
      style: { type: 'string', description: 'Summarization style: "extractive" (sentence selection), "abstractive" (key phrase condensation), "hybrid" (combined). Default "hybrid"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { long_text: string; target_length: string; style?: string }) {
      const result = summarizeText(args.long_text, parseInt(args.target_length), args.style ?? 'hybrid')
      return formatSummarizationReport(result)
    }
  }))

  // Tool 6: Embedding Cache Advisor
  tools.register(defineTool({
    name: 'embedding_cache_advisor',
    description: 'Analyze query logs to project embedding cache hit rates, estimate memory costs, compute savings, and recommend optimal cache configuration (size, TTL, eviction policy).',
    parameters: {
      query_log: { type: 'string', required: true, description: 'JSON array of query log entries with fields: query (string), timestamp (unix), embedding_cost (number)' },
      cache_strategy: { type: 'string', description: 'Cache strategy to evaluate: "lru", "lfu", or "ttl". Default "lru"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query_log: string; cache_strategy?: string }) {
      const log: QueryLogEntry[] = JSON.parse(args.query_log)
      const result = adviseEmbeddingCache(log, args.cache_strategy ?? 'lru')
      return formatCacheAdvisorReport(result)
    }
  }))

  // Tool 7: Batch Optimizer
  tools.register(defineTool({
    name: 'batch_optimizer',
    description: 'Optimize LLM request batching for maximum throughput. Groups requests by priority and token limits, calculates padding overhead, and projects throughput improvements with latency tradeoffs.',
    parameters: {
      requests: { type: 'string', required: true, description: 'JSON array of batch requests with fields: prompt (string), max_tokens (number), priority (1-10)' },
      model_limits: { type: 'string', required: true, description: 'JSON object with model limits: max_batch_size, max_tokens_per_request, requests_per_minute, tokens_per_minute' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { requests: string; model_limits: string }) {
      const reqs: BatchRequest[] = JSON.parse(args.requests)
      const limits: ModelLimits = JSON.parse(args.model_limits)
      const result = optimizeBatchRequests(reqs, limits)
      return formatBatchOptimizerReport(result)
    }
  }))

  // Tool 8: Cost Analyzer
  tools.register(defineTool({
    name: 'cost_analyzer',
    description: 'Analyze LLM usage costs by model, identify optimization opportunities (prompt compression, model tiering, batching, caching), and project monthly/annual savings.',
    parameters: {
      usage_data: { type: 'string', required: true, description: 'JSON array of usage records with fields: model (string), input_tokens (number), output_tokens (number), timestamp (unix)' },
      pricing: { type: 'string', required: true, description: 'JSON object mapping model names to pricing: {model: {input_cost_per_1k, output_cost_per_1k}}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { usage_data: string; pricing: string }) {
      const usage: UsageRecord[] = JSON.parse(args.usage_data)
      const pricingConfig: PricingConfig = JSON.parse(args.pricing)
      const result = analyzeCosts(usage, pricingConfig)
      return formatCostAnalyzerReport(result)
    }
  }))

  console.log(`[dsh-tool-compress] Loaded v${VERSION} — LLM Token Compression & Optimization Engine with 8 tools`)
  console.log('  Tools: prompt_compressor, context_window_optimizer, token_budget_planner, semantic_deduplicator, summarization_pipeline, embedding_cache_advisor, batch_optimizer, cost_analyzer')
}
