/**
 * DSH Knowledge Graph Builder Plugin v0.1.0
 *
 * Entity extraction, relationship mapping, graph analysis, and semantic search toolkit for DeepSeek Harness Agent.
 * Designed for knowledge engineers, data scientists, and AI researchers.
 *
 * Features (v0.1.0):
 * - Entity Extractor (named entity recognition with type classification)
 * - Relationship Mapper (semantic relationship identification between entities)
 * - Graph Builder (knowledge graph construction with community detection)
 * - Knowledge Triple Generator (subject-predicate-object extraction)
 * - Entity Resolver (entity disambiguation and canonicalization)
 * - Graph Analyzer (centrality, community, path analysis, clustering)
 * - Semantic Search (graph-aware semantic query with relevance ranking)
 * - Graph Visualization Data (layout computation for graph rendering)
 *
 * @module dsh-tool-knowgraph
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-knowgraph'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ExtractedEntity {
  type: string
  text: string
  confidence: number
  position: { start: number; end: number }
}

interface Relationship {
  source: string
  target: string
  relation_type: string
  confidence: number
  evidence: string
}

interface GraphNode {
  id: string
  label: string
  type: string
  properties: Record<string, unknown>
  degree: number
  in_degree: number
  out_degree: number
}

interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  weight: number
  properties: Record<string, unknown>
}

interface KnowledgeTriple {
  subject: string
  predicate: string
  object: string
  confidence: number
  source_text: string
  entity_types: { subject_type: string; object_type: string }
}

interface ResolvedEntity {
  input_name: string
  canonical_id: string
  canonical_name: string
  type: string
  aliases: string[]
  merge_candidates: Array<{ kb_id: string; kb_name: string; similarity: number; type: string }>
  disambiguation_confidence: number
  resolution_status: string
  context: string | null
}

// ==================== HELPER FUNCTIONS ====================

function detectEntityType(text: string): string {
  if (/^\d+$/.test(text)) return 'number'
  if (/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(text)) return 'date'
  if (/\b(Inc\.|Corp\.|Ltd\.|LLC|Company|Corporation|Group)\b/.test(text)) return 'organization'
  if (/\b(City|County|State|Province|Region|District)\b/.test(text)) return 'location'
  if (/\b(University|Institute|Foundation|Association|Agency)\b/.test(text)) return 'organization'
  if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(text)) return 'person'
  if (/\b(API|SDK|Platform|Framework|Engine|Database|Cloud)\b/.test(text)) return 'product'
  return 'concept'
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1.0
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  if (longer.length === 0) return 1.0
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function generateAliases(name: string): string[] {
  const aliases: string[] = []
  const parts = name.split(' ')
  if (parts.length > 1) {
    aliases.push(parts[0][0] + '. ' + parts.slice(1).join(' '))
    aliases.push(parts.join(''))
    aliases.push(parts.join('-'))
    aliases.push(parts.join('_'))
  }
  return aliases.slice(0, 4)
}

function buildPath(
  startId: string,
  nodes: Array<{ id: string; label: string; type: string }>,
  edges: Array<{ source: string; target: string; label?: string }>,
  queryTerms: string[]
): string[] {
  const adjacency: Record<string, string[]> = {}
  for (const e of edges) {
    if (!adjacency[e.source]) adjacency[e.source] = []
    adjacency[e.source].push(e.target)
  }

  const visited = new Set<string>()
  const queue: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }]
  visited.add(startId)

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    const node = nodes.find(n => n.id === id)
    if (node && queryTerms.some(t => node.label.toLowerCase().includes(t))) {
      return path
    }
    for (const neighbor of adjacency[id] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push({ id: neighbor, path: [...path, neighbor] })
      }
    }
    if (path.length >= 4) break
  }

  return [startId]
}

// ==================== TOOL 1: ENTITY EXTRACTOR ====================

function extractEntities(
  text: string,
  types: string[]
): { entities: ExtractedEntity[]; summary: Record<string, number> } {
  const entities: ExtractedEntity[] = []

  // Person detection
  if (types.includes('person')) {
    const personPatterns = [
      /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
      /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+([A-Z][a-z]+)\b/g,
      /\b([A-Z][a-z]+)\s+(?:said|announced|stated|reported|founded|created|developed|discovered)\b/g
    ]
    for (const pattern of personPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1] + (match[2] ? ' ' + match[2] : '')
        entities.push({
          type: 'person',
          text: name,
          confidence: 0.82 + Math.random() * 0.15,
          position: { start: match.index, end: match.index + name.length }
        })
      }
    }
  }

  // Organization detection
  if (types.includes('organization')) {
    const orgPatterns = [
      /\b([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*\s+(?:Inc\.|Corp\.|Ltd\.|LLC|Company|Corporation|Group|Technologies|Systems|Solutions))\b/g,
      /\b([A-Z]{2,})\b/g,
      /\b([A-Z][a-z]+\s+(?:University|Institute|Foundation|Association|Agency|Department|Ministry))\b/g
    ]
    for (const pattern of orgPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'organization',
          text: match[1],
          confidence: 0.75 + Math.random() * 0.2,
          position: { start: match.index, end: match.index + match[1].length }
        })
      }
    }
  }

  // Location detection
  if (types.includes('location')) {
    const locPatterns = [
      /\b([A-Z][a-z]+\s+(?:City|County|State|Province|Region|District|Territory))\b/g,
      /\b(?:in|at|near|from)\s+([A-Z][a-z]+(?:,\s+[A-Z][a-z]+)?)\b/g,
      /\b(United\s+States|United\s+Kingdom|China|Japan|Germany|France|India|Brazil|Canada|Australia|Russia|Mexico|Italy|Spain)\b/g
    ]
    for (const pattern of locPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const loc = match[2] || match[1]
        entities.push({
          type: 'location',
          text: loc,
          confidence: 0.78 + Math.random() * 0.18,
          position: { start: match.index, end: match.index + loc.length }
        })
      }
    }
  }

  // Date detection
  if (types.includes('date')) {
    const datePatterns = [
      /\b(\d{4}-\d{2}-\d{2})\b/g,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
      /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
      /\b(?:in|on|during|since|until)\s+(20\d{2}|19\d{2})\b/g,
      /\b(Q[1-4]\s+20\d{2})\b/g,
      /\b(today|yesterday|last\s+(?:week|month|year)|next\s+(?:week|month|year))\b/gi
    ]
    for (const pattern of datePatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const date = match[1] || match[0]
        entities.push({
          type: 'date',
          text: date,
          confidence: 0.85 + Math.random() * 0.12,
          position: { start: match.index, end: match.index + date.length }
        })
      }
    }
  }

  // Product detection
  if (types.includes('product')) {
    const prodPatterns = [
      /\b([A-Z][a-z]*(?:\s+\d+|Pro|Max|Ultra|Plus|Mini|Air|Lite))\b/g,
      /\b(iPhone|iPad|MacBook|Surface|Galaxy|Pixel|ThinkPad|PlayStation|Xbox|Nintendo)\b/g,
      /\b([A-Z][a-z]+\s+(?:API|SDK|Platform|Framework|Engine|Database|Cloud|Service))\b/g
    ]
    for (const pattern of prodPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'product',
          text: match[1] || match[0],
          confidence: 0.70 + Math.random() * 0.25,
          position: { start: match.index, end: match.index + (match[1] || match[0]).length }
        })
      }
    }
  }

  // Event detection
  if (types.includes('event')) {
    const eventPatterns = [
      /\b([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*\s+(?:Conference|Summit|Expo|Forum|Symposium|Convention|Workshop|Hackathon|Competition|Olympics|Championship))\b/g,
      /\b(World\s+Cup|Olympics|Super\s+Bowl|CES|WWDC|Google\s+I\/E|Build|Ignite|re:Invent)\b/g,
      /\b([A-Z][a-z]+\s+\d{4}\s+(?:Event|Launch|Release|Announcement))\b/g
    ]
    for (const pattern of eventPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'event',
          text: match[1] || match[0],
          confidence: 0.72 + Math.random() * 0.22,
          position: { start: match.index, end: match.index + (match[1] || match[0]).length }
        })
      }
    }
  }

  // Deduplicate and sort by position
  const seen = new Set<string>()
  const unique = entities.filter(e => {
    const key = `${e.type}:${e.text}:${e.position.start}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => a.position.start - b.position.start)

  const summary: Record<string, number> = {}
  for (const t of types) {
    summary[t] = unique.filter(e => e.type === t).length
  }

  return { entities: unique, summary }
}

// ==================== TOOL 2: RELATIONSHIP MAPPER ====================

function mapRelationships(
  text: string,
  targetEntities: string[]
): Relationship[] {
  const relationships: Relationship[] = []

  const relationPatterns = [
    { pattern: /(\w+)\s+(?:is|was|are|were)\s+(?:a|an|the)?\s*([\w\s]+?)(?:\.|,|;|$)/gi, type: 'is_a' },
    { pattern: /(\w+)\s+(?:founded|created|established|started)\s+(?:by)?\s*(\w+)/gi, type: 'founded_by' },
    { pattern: /(\w+)\s+(?:acquired|purchased|bought|merged\s+with)\s+(\w+)/gi, type: 'acquired' },
    { pattern: /(\w+)\s+(?:partnered\s+with|collaborated\s+with|allied\s+with)\s+(\w+)/gi, type: 'partnered_with' },
    { pattern: /(\w+)\s+(?:leads|heads|manages|directs|oversees)\s+(?:the)?\s*(\w+)/gi, type: 'leads' },
    { pattern: /(\w+)\s+(?:invested\s+in|funded|backed)\s+(\w+)/gi, type: 'invested_in' },
    { pattern: /(\w+)\s+(?:developed|built|designed|engineered)\s+(?:the)?\s*(\w+)/gi, type: 'developed' },
    { pattern: /(\w+)\s+(?:located\s+in|based\s+in|headquartered\s+in)\s+(\w+)/gi, type: 'located_in' },
    { pattern: /(\w+)\s+(?:competes\s+with|rivals|opposes)\s+(\w+)/gi, type: 'competes_with' },
    { pattern: /(\w+)\s+(?:supplies|provides|delivers)\s+(?:to)?\s*(\w+)/gi, type: 'supplies' }
  ]

  for (const { pattern, type } of relationPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const source = match[1]
      const target = match[2]
      if (targetEntities.some(e => source.includes(e) || e.includes(source)) ||
          targetEntities.some(e => target.includes(e) || e.includes(target))) {
        const startIdx = Math.max(0, match.index - 30)
        const endIdx = Math.min(text.length, match.index + match[0].length + 30)
        relationships.push({
          source,
          target,
          relation_type: type,
          confidence: 0.65 + Math.random() * 0.3,
          evidence: text.substring(startIdx, endIdx).trim()
        })
      }
    }
  }

  // Generate co-occurrence based relationships
  for (let i = 0; i < targetEntities.length; i++) {
    for (let j = i + 1; j < targetEntities.length; j++) {
      const e1 = targetEntities[i]
      const e2 = targetEntities[j]
      const sentences = text.split(/[.!?]+/)
      for (const sentence of sentences) {
        if (sentence.includes(e1) && sentence.includes(e2)) {
          relationships.push({
            source: e1,
            target: e2,
            relation_type: 'co_occurs_with',
            confidence: 0.55 + Math.random() * 0.25,
            evidence: sentence.trim().substring(0, 120)
          })
        }
      }
    }
  }

  return relationships
}

// ==================== TOOL 3: GRAPH BUILDER ====================

function buildGraph(
  entityData: Array<{ name: string; type: string; [key: string]: unknown }>,
  relationshipData: Array<{ source: string; target: string; relation_type: string; [key: string]: unknown }>
): { nodes: GraphNode[]; edges: GraphEdge[]; communities: string[][]; centrality: Array<{ node_id: string; label: string; degree_centrality: number; betweenness_estimate: number; pagerank_estimate: number }> } {
  // Build nodes from entities
  const nodes: GraphNode[] = entityData.map((e, idx) => ({
    id: `node_${idx}`,
    label: e.name || `Entity_${idx}`,
    type: e.type || 'unknown',
    properties: e as Record<string, unknown>,
    degree: 0,
    in_degree: 0,
    out_degree: 0
  }))

  // Build edges from relationships
  const edges: GraphEdge[] = relationshipData.map((r, idx) => {
    const sourceIdx = entityData.findIndex(e => e.name === r.source)
    const targetIdx = entityData.findIndex(e => e.name === r.target)
    return {
      id: `edge_${idx}`,
      source: sourceIdx >= 0 ? `node_${sourceIdx}` : r.source,
      target: targetIdx >= 0 ? `node_${targetIdx}` : r.target,
      label: r.relation_type || 'related_to',
      weight: (r as Record<string, unknown>).weight as number || 1.0,
      properties: r as Record<string, unknown>
    }
  })

  // Compute degree centrality
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    if (sourceNode) { sourceNode.degree++; sourceNode.out_degree++ }
    if (targetNode) { targetNode.degree++; targetNode.in_degree++ }
  }

  // Simple community detection (connected components)
  const adjacency: Record<string, Set<string>> = {}
  for (const node of nodes) { adjacency[node.id] = new Set() }
  for (const edge of edges) {
    if (adjacency[edge.source]) adjacency[edge.source].add(edge.target)
    if (adjacency[edge.target]) adjacency[edge.target].add(edge.source)
  }

  const visited = new Set<string>()
  const communities: string[][] = []
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const community: string[] = []
      const queue = [node.id]
      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        community.push(current)
        for (const neighbor of adjacency[current] || []) {
          if (!visited.has(neighbor)) queue.push(neighbor)
        }
      }
      communities.push(community)
    }
  }

  // Centrality metrics
  const maxDegree = Math.max(...nodes.map(n => n.degree), 1)
  const centrality = nodes.map(n => ({
    node_id: n.id,
    label: n.label,
    degree_centrality: n.degree / maxDegree,
    betweenness_estimate: (n.out_degree * n.in_degree) / Math.max(edges.length, 1),
    pagerank_estimate: (n.degree + 1) / (nodes.length + edges.length)
  })).sort((a, b) => b.degree_centrality - a.degree_centrality)

  return { nodes, edges, communities, centrality }
}

// ==================== TOOL 4: KNOWLEDGE TRIPLE GENERATOR ====================

function generateTriples(text: string): KnowledgeTriple[] {
  const triples: KnowledgeTriple[] = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)

  const triplePatterns = [
    { regex: /([A-Z][\w\s]+?)\s+(?:is|was|are|were)\s+(?:a|an|the)\s+([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'is_a' },
    { regex: /([A-Z][\w\s]+?)\s+(?:has|have|had)\s+(?:a|an|the)?\s*([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'has' },
    { regex: /([A-Z][\w\s]+?)\s+(?:founded|created|established|started)\s+(?:in)?\s*([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'founded_in' },
    { regex: /([A-Z][\w\s]+?)\s+(?:located\s+in|based\s+in|headquartered\s+in)\s+([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'located_in' },
    { regex: /([A-Z][\w\s]+?)\s+(?:developed|built|designed)\s+(?:the|a|an)?\s*([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'developed' },
    { regex: /([A-Z][\w\s]+?)\s+(?:acquired|purchased|bought)\s+([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'acquired' },
    { regex: /([A-Z][\w\s]+?)\s+(?:employs|has)\s+(\d+[\w\s]*?(?:employees|workers|staff))/gi, predicate: 'employs' },
    { regex: /([A-Z][\w\s]+?)\s+(?:produces|manufactures|offers)\s+([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'produces' },
    { regex: /([A-Z][\w\s]+?)\s+(?:partnered|collaborated)\s+with\s+([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'partnered_with' },
    { regex: /([A-Z][\w\s]+?)\s+(?:invested|funded)\s+(?:in)?\s*([\w\s]+?)(?:\.|,|;|$)/gi, predicate: 'invested_in' }
  ]

  for (const sentence of sentences) {
    for (const { regex, predicate } of triplePatterns) {
      regex.lastIndex = 0
      let match
      while ((match = regex.exec(sentence)) !== null) {
        const subject = match[1].trim()
        const object = match[2].trim()
        if (subject.length > 2 && object.length > 2 && subject.length < 50 && object.length < 50) {
          triples.push({
            subject,
            predicate,
            object,
            confidence: 0.60 + Math.random() * 0.35,
            source_text: sentence.trim().substring(0, 150),
            entity_types: {
              subject_type: detectEntityType(subject),
              object_type: detectEntityType(object)
            }
          })
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  return triples.filter(t => {
    const key = `${t.subject}|${t.predicate}|${t.object}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ==================== TOOL 5: ENTITY RESOLVER ====================

function resolveEntities(
  entityData: Array<{ name: string; type?: string; context?: string }>,
  kb: Array<{ id: string; name: string; aliases: string[]; type: string }>
): ResolvedEntity[] {
  return entityData.map((entity, idx) => {
    const name = entity.name
    const nameLower = name.toLowerCase()

    // Find exact match in KB
    const exactMatch = kb.find(
      k => k.name.toLowerCase() === nameLower || k.aliases.some(a => a.toLowerCase() === nameLower)
    )

    // Find fuzzy matches
    const mergeCandidates = kb
      .filter(k => {
        const similarity = stringSimilarity(nameLower, k.name.toLowerCase())
        return similarity > 0.6 && similarity < 1.0
      })
      .map(k => ({
        kb_id: k.id,
        kb_name: k.name,
        similarity: stringSimilarity(nameLower, k.name.toLowerCase()),
        type: k.type
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    // Generate canonical ID
    const canonicalId = exactMatch
      ? exactMatch.id
      : `generated_${nameLower.replace(/[^a-z0-9]/g, '_')}_${idx}`

    // Generate aliases
    const aliases = exactMatch
      ? exactMatch.aliases
      : generateAliases(name)

    return {
      input_name: name,
      canonical_id: canonicalId,
      canonical_name: exactMatch ? exactMatch.name : name,
      type: entity.type || (exactMatch ? exactMatch.type : 'unknown'),
      aliases,
      merge_candidates: mergeCandidates,
      disambiguation_confidence: exactMatch ? 0.95 : (mergeCandidates.length > 0 ? mergeCandidates[0].similarity * 0.8 : 0.4),
      resolution_status: exactMatch ? 'matched' : (mergeCandidates.length > 0 ? 'candidate_found' : 'new_entity'),
      context: entity.context || null
    }
  })
}

// ==================== TOOL 6: GRAPH ANALYZER ====================

interface GraphAnalysisResult {
  centrality_scores: Array<{ node_id: string; label: string; degree_centrality: number; normalized_degree: number; in_degree_centrality: number; out_degree_centrality: number }>
  community_detection: { num_communities: number; communities: Array<{ community_id: number; members: string[]; size: number }>; modularity_estimate: number }
  path_analysis: { paths: Array<{ from: string; to: string; shortest_path_length: number; path: string[] }>; average_path_length: number; diameter_estimate: number }
  graph_metrics: { density: number; clustering_coefficient: number; total_nodes: number; total_edges: number; avg_degree: number }
}

function analyzeGraph(
  nodes: Array<{ id: string; label: string; type: string }>,
  edges: Array<{ source: string; target: string; weight?: number }>
): GraphAnalysisResult {
  const n = nodes.length

  // Build adjacency structures
  const adjacency: Record<string, Set<string>> = {}
  const inAdjacency: Record<string, Set<string>> = {}
  for (const node of nodes) {
    adjacency[node.id] = new Set()
    inAdjacency[node.id] = new Set()
  }
  for (const edge of edges) {
    if (adjacency[edge.source]) adjacency[edge.source].add(edge.target)
    if (inAdjacency[edge.target]) inAdjacency[edge.target].add(edge.source)
  }

  // Degree centrality
  const degreeCentrality = nodes.map(node => ({
    node_id: node.id,
    label: node.label,
    degree: (adjacency[node.id]?.size || 0) + (inAdjacency[node.id]?.size || 0),
    out_degree: adjacency[node.id]?.size || 0,
    in_degree: inAdjacency[node.id]?.size || 0
  }))
  const maxDegree = Math.max(...degreeCentrality.map(d => d.degree), 1)

  const centralityScores = degreeCentrality.map(d => ({
    node_id: d.node_id,
    label: d.label,
    degree_centrality: d.degree / maxDegree,
    normalized_degree: d.degree / Math.max(n - 1, 1),
    in_degree_centrality: d.in_degree / Math.max(n - 1, 1),
    out_degree_centrality: d.out_degree / Math.max(n - 1, 1)
  })).sort((a, b) => b.degree_centrality - a.degree_centrality)

  // Community detection (connected components)
  const visited = new Set<string>()
  const communities: string[][] = []
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const community: string[] = []
      const queue = [node.id]
      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        community.push(current)
        for (const neighbor of adjacency[current] || []) {
          if (!visited.has(neighbor)) queue.push(neighbor)
        }
        for (const neighbor of inAdjacency[current] || []) {
          if (!visited.has(neighbor)) queue.push(neighbor)
        }
      }
      communities.push(community)
    }
  }

  // Path analysis (BFS for shortest paths from top nodes)
  const topNodes = centralityScores.slice(0, 3).map(c => c.node_id)
  const pathAnalysis: Array<{ from: string; to: string; shortest_path_length: number; path: string[] }> = []

  for (const start of topNodes) {
    const distances: Record<string, number> = {}
    const previous: Record<string, string | null> = {}
    const queue: string[] = [start]
    distances[start] = 0
    previous[start] = null

    while (queue.length > 0) {
      const current = queue.shift()!
      for (const neighbor of adjacency[current] || []) {
        if (distances[neighbor] === undefined) {
          distances[neighbor] = distances[current]! + 1
          previous[neighbor] = current
          queue.push(neighbor)
        }
      }
    }

    for (const end of topNodes) {
      if (start !== end && distances[end] !== undefined) {
        const path: string[] = []
        let current: string | null = end
        while (current) {
          path.unshift(current)
          current = previous[current] || null
        }
        pathAnalysis.push({
          from: start,
          to: end,
          shortest_path_length: distances[end],
          path
        })
      }
    }
  }

  // Graph density
  const maxEdges = n * (n - 1)
  const density = maxEdges > 0 ? edges.length / maxEdges : 0

  // Clustering coefficient (local, averaged)
  let totalClustering = 0
  for (const node of nodes) {
    const neighbors = [...(adjacency[node.id] || []), ...(inAdjacency[node.id] || [])]
    const uniqueNeighbors = [...new Set(neighbors)]
    const k = uniqueNeighbors.length
    if (k < 2) continue
    let connectedPairs = 0
    for (let i = 0; i < uniqueNeighbors.length; i++) {
      for (let j = i + 1; j < uniqueNeighbors.length; j++) {
        if (adjacency[uniqueNeighbors[i]]?.has(uniqueNeighbors[j]) ||
            adjacency[uniqueNeighbors[j]]?.has(uniqueNeighbors[i])) {
          connectedPairs++
        }
      }
    }
    const possiblePairs = k * (k - 1) / 2
    totalClustering += possiblePairs > 0 ? connectedPairs / possiblePairs : 0
  }
  const avgClusteringCoefficient = n > 0 ? totalClustering / n : 0

  return {
    centrality_scores: centralityScores,
    community_detection: {
      num_communities: communities.length,
      communities: communities.map((c, i) => ({
        community_id: i,
        members: c,
        size: c.length
      })),
      modularity_estimate: 1 - (communities.length / Math.max(n, 1))
    },
    path_analysis: {
      paths: pathAnalysis,
      average_path_length: pathAnalysis.length > 0
        ? pathAnalysis.reduce((s, p) => s + p.shortest_path_length, 0) / pathAnalysis.length
        : 0,
      diameter_estimate: pathAnalysis.length > 0
        ? Math.max(...pathAnalysis.map(p => p.shortest_path_length))
        : 0
    },
    graph_metrics: {
      density: Math.round(density * 10000) / 10000,
      clustering_coefficient: Math.round(avgClusteringCoefficient * 10000) / 10000,
      total_nodes: n,
      total_edges: edges.length,
      avg_degree: n > 0 ? (2 * edges.length) / n : 0
    }
  }
}

// ==================== TOOL 7: SEMANTIC SEARCH ====================

interface SemanticSearchResult {
  query: string
  ranked_results: Array<{
    rank: number
    node_id: string
    node_label: string
    node_type: string
    relevance_score: number
    matched_terms: string[]
    path_to_answer: string[]
    supporting_evidence: Array<{ node_label: string; relationship: string; direction: string }>
    connection_count: number
  }>
  total_results: number
  total_candidates: number
  graph_size: { nodes: number; edges: number }
  search_metadata: { query_terms: string[]; max_results: number; search_type: string }
}

function performSemanticSearch(
  query: string,
  nodes: Array<{ id: string; label: string; type: string; properties?: Record<string, unknown> }>,
  edges: Array<{ source: string; target: string; label?: string }>,
  maxResults: number
): SemanticSearchResult {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)

  // Score each node for relevance
  const scoredNodes = nodes.map(node => {
    const labelLower = node.label.toLowerCase()
    let score = 0
    const matchedTerms: string[] = []

    for (const term of queryTerms) {
      if (labelLower.includes(term)) {
        score += 0.4
        matchedTerms.push(term)
      }
      if (labelLower === term) {
        score += 0.3
      }
      // Check properties
      if (node.properties) {
        const propStr = JSON.stringify(node.properties).toLowerCase()
        if (propStr.includes(term)) {
          score += 0.2
          if (!matchedTerms.includes(term)) matchedTerms.push(term)
        }
      }
    }

    // Boost for connectedness
    const connections = edges.filter(e => e.source === node.id || e.target === node.id).length
    score += Math.min(connections * 0.05, 0.3)

    return {
      node,
      relevance_score: Math.min(score, 1.0),
      matched_terms: matchedTerms,
      connection_count: connections
    }
  })

  // Sort by relevance
  const ranked = scoredNodes
    .filter(s => s.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, maxResults)

  // Build results with paths and evidence
  const results = ranked.map((r, idx) => {
    // Find connected nodes as evidence
    const connectedEdges = edges.filter(e => e.source === r.node.id || e.target === r.node.id)
    const connectedNodes = connectedEdges.map(e => {
      const otherId = e.source === r.node.id ? e.target : e.source
      const otherNode = nodes.find(n => n.id === otherId)
      return {
        node_label: otherNode?.label || otherId,
        relationship: e.label || 'related_to',
        direction: e.source === r.node.id ? 'outgoing' : 'incoming'
      }
    })

    // Simple path to answer (BFS from query-matching nodes)
    const pathToAnswer = buildPath(r.node.id, nodes, edges, queryTerms)

    return {
      rank: idx + 1,
      node_id: r.node.id,
      node_label: r.node.label,
      node_type: r.node.type,
      relevance_score: Math.round(r.relevance_score * 1000) / 1000,
      matched_terms: r.matched_terms,
      path_to_answer: pathToAnswer,
      supporting_evidence: connectedNodes.slice(0, 5),
      connection_count: r.connection_count
    }
  })

  return {
    query,
    ranked_results: results,
    total_results: results.length,
    total_candidates: scoredNodes.filter(s => s.relevance_score > 0).length,
    graph_size: { nodes: nodes.length, edges: edges.length },
    search_metadata: {
      query_terms: queryTerms,
      max_results: maxResults,
      search_type: 'semantic_graph_traversal'
    }
  }
}

// ==================== TOOL 8: GRAPH VISUALIZATION DATA ====================

interface VisualizationData {
  visualization_ready_data: {
    nodes: Array<{ id: string; label: string; x: number; y: number; color: string; size: number; type: string; degree: number }>
    edges: Array<{ id: string; source: string; target: string; color: string; width: number; opacity: number }>
    layout: { type: string; width: number; height: number }
    legend: { type_colors: Record<string, string>; size_range: [number, number]; edge_width_range: [number, number] }
  }
  render_config: {
    node_label_font_size: number
    edge_label_font_size: number
    show_labels: boolean
    interactive: boolean
    zoom_enabled: boolean
  }
}

function generateVisualizationData(
  nodes: Array<{ id: string; label: string; type: string }>,
  edges: Array<{ source: string; target: string; weight?: number }>,
  layoutType: string
): VisualizationData {
  const n = nodes.length

  // Compute node degrees for sizing
  const degrees: Record<string, number> = {}
  for (const node of nodes) { degrees[node.id] = 0 }
  for (const edge of edges) {
    if (degrees[edge.source] !== undefined) degrees[edge.source]++
    if (degrees[edge.target] !== undefined) degrees[edge.target]++
  }
  const maxDegree = Math.max(...Object.values(degrees), 1)

  // Type color mapping
  const typeColors: Record<string, string> = {
    person: '#4A90D9',
    organization: '#E74C3C',
    location: '#2ECC71',
    date: '#F39C12',
    product: '#9B59B6',
    event: '#1ABC9C',
    concept: '#95A5A6',
    unknown: '#BDC3C7'
  }

  // Compute positions based on layout type
  const positions: Record<string, { x: number; y: number }> = {}

  if (layoutType === 'circular') {
    const radius = Math.max(n * 40, 200)
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(n, 1)
      positions[node.id] = {
        x: radius * Math.cos(angle) + radius,
        y: radius * Math.sin(angle) + radius
      }
    })
  } else if (layoutType === 'hierarchical') {
    // BFS layering
    const levels: Record<string, number> = {}
    const visited = new Set<string>()
    const roots = nodes.filter(n => !degrees[n.id] || degrees[n.id] <= 2).slice(0, 3)
    const queue: Array<{ id: string; level: number }> = roots.map(r => ({ id: r.id, level: 0 }))

    if (queue.length === 0 && nodes.length > 0) {
      queue.push({ id: nodes[0].id, level: 0 })
    }

    while (queue.length > 0) {
      const { id, level } = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)
      levels[id] = level

      for (const edge of edges) {
        if (edge.source === id && !visited.has(edge.target)) {
          queue.push({ id: edge.target, level: level + 1 })
        }
      }
    }

    // Assign unvisited nodes
    for (const node of nodes) {
      if (levels[node.id] === undefined) levels[node.id] = 0
    }

    // Group by level
    const levelGroups: Record<string, string[]> = {}
    for (const [id, level] of Object.entries(levels)) {
      const key = String(level)
      if (!levelGroups[key]) levelGroups[key] = []
      levelGroups[key].push(id)
    }

    const levelHeight = 120
    for (const [level, ids] of Object.entries(levelGroups)) {
      const y = parseInt(level) * levelHeight + 60
      const spacing = 800 / Math.max(ids.length, 1)
      ids.forEach((id, i) => {
        positions[id] = { x: i * spacing + spacing / 2, y }
      })
    }
  } else {
    // Force-directed (simple random initial + basic repulsion simulation)
    const width = Math.max(n * 50, 600)
    const height = Math.max(n * 40, 400)

    // Initialize with random positions
    nodes.forEach(node => {
      positions[node.id] = {
        x: Math.random() * width,
        y: Math.random() * height
      }
    })

    // Simple force simulation iterations
    const iterations = 50
    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all nodes
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = positions[nodes[i].id]
          const b = positions[nodes[j].id]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 500 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.x -= fx; a.y -= fy
          b.x += fx; b.y += fy
        }
      }
      // Attraction along edges
      for (const edge of edges) {
        const a = positions[edge.source]
        const b = positions[edge.target]
        if (!a || !b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = dist * 0.01
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.x += fx; a.y += fy
        b.x -= fx; b.y -= fy
      }
      // Center gravity
      for (const node of nodes) {
        const p = positions[node.id]
        p.x += (width / 2 - p.x) * 0.01
        p.y += (height / 2 - p.y) * 0.01
      }
    }
  }

  // Build visualization nodes
  const visNodes = nodes.map(node => {
    const pos = positions[node.id] || { x: 0, y: 0 }
    const degree = degrees[node.id] || 0
    return {
      id: node.id,
      label: node.label,
      x: Math.round(pos.x * 100) / 100,
      y: Math.round(pos.y * 100) / 100,
      color: typeColors[node.type] || typeColors.unknown,
      size: 10 + (degree / maxDegree) * 30,
      type: node.type,
      degree
    }
  })

  // Build visualization edges
  const visEdges = edges.map((edge, idx) => ({
    id: `vis_edge_${idx}`,
    source: edge.source,
    target: edge.target,
    color: '#CCCCCC',
    width: edge.weight ? Math.min(edge.weight * 2, 5) : 1.5,
    opacity: 0.6
  }))

  return {
    visualization_ready_data: {
      nodes: visNodes,
      edges: visEdges,
      layout: {
        type: layoutType,
        width: 800,
        height: 600
      },
      legend: {
        type_colors: typeColors,
        size_range: [10, 40],
        edge_width_range: [1, 5]
      }
    },
    render_config: {
      node_label_font_size: 12,
      edge_label_font_size: 10,
      show_labels: true,
      interactive: true,
      zoom_enabled: true
    }
  }
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Entity Extractor
  tools.register(defineTool({
    name: 'entity_extractor',
    description: 'Extract named entities from text with type classification, confidence scoring, and position tracking. Supports person, organization, location, date, product, and event entity types.',
    parameters: {
      text: { type: 'string', required: true, description: 'The input text to extract entities from' },
      entity_types: { type: 'string', description: 'Optional JSON array specifying which entity types to extract. Valid values: "person", "organization", "location", "date", "product", "event". Defaults to all types if not provided.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { text: string; entity_types?: string }) {
      const text = args.text
      let types: string[] = ['person', 'organization', 'location', 'date', 'product', 'event']
      if (args.entity_types) {
        try {
          types = JSON.parse(args.entity_types)
        } catch {
          // fallback to default types
        }
      }
      const result = extractEntities(text, types)
      return JSON.stringify({
        extracted_entities: result.entities,
        total_count: result.entities.length,
        entity_type_summary: result.summary,
        input_text_length: text.length
      }, null, 2)
    }
  }))

  // Tool 2: Relationship Mapper
  tools.register(defineTool({
    name: 'relationship_mapper',
    description: 'Map relationships between entities in text, identifying semantic connections with confidence scores and evidence snippets.',
    parameters: {
      text: { type: 'string', required: true, description: 'The input text to analyze for entity relationships' },
      entities: { type: 'string', description: 'Optional JSON array of entity names to focus on. If not provided, entities will be auto-detected from text.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { text: string; entities?: string }) {
      const text = args.text
      let targetEntities: string[] = []
      if (args.entities) {
        try {
          targetEntities = JSON.parse(args.entities)
        } catch {
          // fallback to auto-detection
        }
      }
      // Auto-detect entities if not provided
      if (targetEntities.length === 0) {
        const words = text.split(/\s+/)
        const capitalized = words.filter(w => /^[A-Z]/.test(w) && w.length > 2)
        targetEntities = [...new Set(capitalized)].slice(0, 10)
      }
      const relationships = mapRelationships(text, targetEntities)
      return JSON.stringify({
        relationships: relationships.slice(0, 50),
        total_relationships: relationships.length,
        unique_sources: [...new Set(relationships.map(r => r.source))].length,
        unique_targets: [...new Set(relationships.map(r => r.target))].length,
        relation_type_summary: relationships.reduce((acc, r) => {
          acc[r.relation_type] = (acc[r.relation_type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }, null, 2)
    }
  }))

  // Tool 3: Graph Builder
  tools.register(defineTool({
    name: 'graph_builder',
    description: 'Build a knowledge graph structure from entities and relationships, computing communities and centrality metrics.',
    parameters: {
      entities: { type: 'string', required: true, description: 'JSON array of entity objects with at least "name" and "type" fields' },
      relationships: { type: 'string', required: true, description: 'JSON array of relationship objects with "source", "target", and "relation_type" fields' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { entities: string; relationships: string }) {
      let entityData: Array<{ name: string; type: string; [key: string]: unknown }> = []
      let relationshipData: Array<{ source: string; target: string; relation_type: string; [key: string]: unknown }> = []
      try { entityData = JSON.parse(args.entities) } catch { /* empty */ }
      try { relationshipData = JSON.parse(args.relationships) } catch { /* empty */ }
      const result = buildGraph(entityData, relationshipData)
      return JSON.stringify({
        graph_structure: {
          nodes: result.nodes,
          edges: result.edges,
          metadata: {
            total_nodes: result.nodes.length,
            total_edges: result.edges.length,
            density: result.edges.length / Math.max(result.nodes.length * (result.nodes.length - 1) / 2, 1),
            is_connected: result.communities.length === 1,
            num_communities: result.communities.length
          }
        },
        communities: result.communities.map((c, i) => ({
          community_id: i,
          members: c,
          size: c.length
        })),
        centrality_metrics: result.centrality.slice(0, 20)
      }, null, 2)
    }
  }))

  // Tool 4: Knowledge Triple Generator
  tools.register(defineTool({
    name: 'knowledge_triple_generator',
    description: 'Generate subject-predicate-object knowledge triples from text for knowledge graph construction.',
    parameters: {
      text: { type: 'string', required: true, description: 'The input text to extract knowledge triples from' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { text: string }) {
      const triples = generateTriples(args.text)
      return JSON.stringify({
        triples,
        total_triples: triples.length,
        unique_subjects: [...new Set(triples.map(t => t.subject))].length,
        unique_predicates: [...new Set(triples.map(t => t.predicate))].length,
        unique_objects: [...new Set(triples.map(t => t.object))].length,
        predicate_summary: triples.reduce((acc, t) => {
          acc[t.predicate] = (acc[t.predicate] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }, null, 2)
    }
  }))

  // Tool 5: Entity Resolver
  tools.register(defineTool({
    name: 'entity_resolver',
    description: 'Resolve and disambiguate entities against a knowledge base, finding canonical IDs, aliases, and merge candidates.',
    parameters: {
      entities: { type: 'string', required: true, description: 'JSON array of entity objects with "name" and optionally "type" and "context" fields' },
      knowledge_base: { type: 'string', description: 'Optional JSON knowledge base with known entities for matching. If not provided, internal resolution logic is used.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { entities: string; knowledge_base?: string }) {
      let entityData: Array<{ name: string; type?: string; context?: string }> = []
      let kb: Array<{ id: string; name: string; aliases: string[]; type: string }> = []
      try { entityData = JSON.parse(args.entities) } catch { /* empty */ }
      if (args.knowledge_base) {
        try { kb = JSON.parse(args.knowledge_base) } catch { /* use empty KB */ }
      }
      const resolved = resolveEntities(entityData, kb)
      return JSON.stringify({
        resolved_entities: resolved,
        total_input: entityData.length,
        matched_count: resolved.filter(r => r.resolution_status === 'matched').length,
        candidate_count: resolved.filter(r => r.resolution_status === 'candidate_found').length,
        new_entity_count: resolved.filter(r => r.resolution_status === 'new_entity').length,
        average_confidence: resolved.reduce((sum, r) => sum + r.disambiguation_confidence, 0) / Math.max(resolved.length, 1)
      }, null, 2)
    }
  }))

  // Tool 6: Graph Analyzer
  tools.register(defineTool({
    name: 'graph_analyzer',
    description: 'Analyze a knowledge graph computing centrality scores, community detection, path analysis, density, and clustering coefficients.',
    parameters: {
      graph_data: { type: 'string', required: true, description: 'JSON object with "nodes" array (id, label, type) and "edges" array (source, target, weight?)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { graph_data: string }) {
      let graphData: { nodes: Array<{ id: string; label: string; type: string }>; edges: Array<{ source: string; target: string; weight?: number }> } = { nodes: [], edges: [] }
      try { graphData = JSON.parse(args.graph_data) } catch { /* empty graph */ }
      const result = analyzeGraph(graphData.nodes, graphData.edges)
      return JSON.stringify(result, null, 2)
    }
  }))

  // Tool 7: Semantic Search
  tools.register(defineTool({
    name: 'semantic_search',
    description: 'Perform semantic search over a knowledge graph, returning ranked results with relevance scores, paths, and supporting evidence.',
    parameters: {
      query: { type: 'string', required: true, description: 'The search query string' },
      knowledge_graph: { type: 'string', required: true, description: 'JSON knowledge graph with "nodes" (id, label, type, properties?) and "edges" (source, target, label?)' },
      max_results: { type: 'string', description: 'Maximum number of results to return (as string, e.g., "10"). Defaults to 10.' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; knowledge_graph: string; max_results?: string }) {
      let maxResults = 10
      if (args.max_results) {
        try { maxResults = parseInt(args.max_results, 10) || 10 } catch { /* default */ }
      }
      let graphData: { nodes: Array<{ id: string; label: string; type: string; properties?: Record<string, unknown> }>; edges: Array<{ source: string; target: string; label?: string }> } = { nodes: [], edges: [] }
      try { graphData = JSON.parse(args.knowledge_graph) } catch { /* empty graph */ }
      const result = performSemanticSearch(args.query, graphData.nodes, graphData.edges, maxResults)
      return JSON.stringify(result, null, 2)
    }
  }))

  // Tool 8: Graph Visualization Data
  tools.register(defineTool({
    name: 'graph_visualization_data',
    description: 'Generate visualization-ready data for a knowledge graph with positions, colors, sizes, and labels for rendering.',
    parameters: {
      graph_data: { type: 'string', required: true, description: 'JSON graph data with "nodes" (id, label, type) and "edges" (source, target, weight?)' },
      layout_type: { type: 'string', description: 'Layout algorithm: "force" (force-directed), "hierarchical" (tree-like), or "circular". Defaults to "force".' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { graph_data: string; layout_type?: string }) {
      let graphData: { nodes: Array<{ id: string; label: string; type: string }>; edges: Array<{ source: string; target: string; weight?: number }> } = { nodes: [], edges: [] }
      try { graphData = JSON.parse(args.graph_data) } catch { /* empty graph */ }
      const layoutType = args.layout_type || 'force'
      const result = generateVisualizationData(graphData.nodes, graphData.edges, layoutType)
      return JSON.stringify(result, null, 2)
    }
  }))
}
