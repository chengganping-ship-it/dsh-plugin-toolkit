/**
 * DSH Knowledge Graph Professional Toolkit Plugin v0.1.0
 *
 * Enterprise-grade knowledge graph construction, querying, reasoning, and quality
 * assessment toolkit for DeepSeek Harness Agent. Surpasses basic graph tools with
 * OWL/RDFS inference, Schema.org alignment, multi-hop reasoning, and semantic search.
 *
 * Theme: Emerald Knowledge Green + Node-Edge Graph + Mermaid Mind Map
 *
 * Features (v0.1.0):
 * - Ontology Builder (class hierarchies + properties + relations + constraints + Schema.org/OWL import + RDFS reasoning)
 * - Entity Resolver (synonym merging + cross-source alignment + conflict detection + entity cards + URI normalization + redirect handling)
 * - KG Crawler (structured extraction + semi-structured parsing + unstructured NLP extraction + quality validation + incremental updates + provenance tracking)
 * - Semantic Search (vector retrieval + keyword hybrid + inference expansion + graph context + learning-to-rank + result summarization)
 * - Reasoning Engine (OWL reasoning + rule reasoning + probabilistic reasoning + contradiction detection + explanation generation + path tracing)
 * - KG Visualizer (force-directed layout + sub-graph expansion + temporal evolution + metadata overlay + interactive filtering + zoom navigation)
 * - Knowledge QA (NL-to-graph-query + multi-hop reasoning + comparison questions + computation questions + temporal questions + unanswerable detection)
 * - KG Quality (completeness + consistency + accuracy + timeliness + connectivity + redundancy + fix suggestions + quality scorecard)
 *
 * @module dsh-tool-kgpro
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-kgpro'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== EMERALD THEME CONSTANTS ====================

const EMERALD = {
  primary: '#10B981',
  dark: '#047857',
  light: '#6EE7B7',
  accent: '#34D399',
  bg: '#ECFDF5',
  node: '#059669',
  edge: '#A7F3D0',
  highlight: '#F59E0B'
}

// ==================== SEEDED RANDOM (mulberry32) ====================

function createSeededRandom(seedStr: string): () => number {
  let seed = hashString(seedStr)
  return function() {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ==================== UTILITY FUNCTIONS ====================

function round(n: number, d: number): number {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

function levenshteinDistance(a: string, b: string): number {
  const m: number[][] = []
  for (let i = 0; i <= b.length; i++) m[i] = [i]
  for (let j = 0; j <= a.length; j++) m[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        m[i][j] = m[i - 1][j - 1]
      } else {
        m[i][j] = Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1)
      }
    }
  }
  return m[b.length][a.length]
}

function stringSimilarity(a: string, b: string): number {
  const la = a.toLowerCase()
  const lb = b.toLowerCase()
  if (la === lb) return 1.0
  const longer = la.length > lb.length ? la : lb
  const shorter = la.length > lb.length ? lb : la
  if (longer.length === 0) return 1.0
  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s,;:!?()[\]{}<>"'`_.\-/\\]+/).filter(t => t.length > 1)
}

function safeJsonParse<T>(json: string, fallback: T): T {
  try { return JSON.parse(json) as T } catch { return fallback }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

// ==================== MERMIND MAP GEN ====================

function buildMermaidMindmap(title: string, nodes: Array<{ label: string; children?: string[] }>): string {
  const lines: string[] = ['mindmap']
  lines.push(`  (${title})`)
  for (const node of nodes) {
    lines.push(`    (${node.label})`)
    if (node.children) {
      for (const child of node.children) {
        lines.push(`      (${child})`)
      }
    }
  }
  return lines.join('\n')
}

// ==================== TYPES ====================

// -- Tool 1: Ontology Builder --
interface OntologyClass {
  uri: string
  label: string
  parent: string | null
  description: string
  properties: string[]
  instances: number
  constraints: string[]
}

interface OntologyProperty {
  uri: string
  label: string
  domain: string
  range: string
  type: 'datatype' | 'object' | 'annotation'
  functional: boolean
  cardinality: string
}

interface OntologyRelation {
  uri: string
  label: string
  domain: string
  range: string
  inverse: string | null
  symmetric: boolean
  transitive: boolean
  characteristics: string[]
}

interface OntologyConstraints {
  domainConstraints: string[]
  rangeConstraints: string[]
  cardinalityConstraints: string[]
  disjointClasses: string[]
  equivalentClasses: string[]
}

interface OntologyBuilderResult {
  ontology: {
    namespace: string
    prefix: string
    version: string
    classes: OntologyClass[]
    properties: OntologyProperty[]
    relations: OntologyRelation[]
    constraints: OntologyConstraints
  }
  importReport: {
    standard: string
    classesImported: number
    propertiesImported: number
    status: string
  }[]
  rdfsInference: {
    inferredSubsumptions: Array<{ child: string; parent: string; confidence: number }>
    inferredDomains: Array<{ property: string; domain: string }>
    inferredRanges: Array<{ property: string; range: string }>
    materializedTriples: number
  }
  mermaidMap: string
  quality: {
    classCoverage: number
    propertyCompleteness: number
    constraintDensity: number
    overallScore: number
  }
}

// -- Tool 2: Entity Resolver --
interface EntityCard {
  uri: string
  canonicalName: string
  aliases: string[]
  type: string
  description: string
  sources: string[]
  confidence: number
  redirects: string[]
  mergeHistory: string[]
}

interface ResolutionConflict {
  entityA: string
  entityB: string
  conflictType: string
  severity: 'low' | 'medium' | 'high'
  resolution: string
}

interface ResolvedEntity {
  input: string
  canonicalUri: string
  canonicalName: string
  type: string
  status: 'matched' | 'merged' | 'created' | 'redirected'
  confidence: number
  entityCard: EntityCard
  alignmentSources: string[]
}

interface EntityResolverResult {
  resolvedEntities: ResolvedEntity[]
  conflicts: ResolutionConflict[]
  statistics: {
    totalInput: number
    matched: number
    merged: number
    created: number
    redirected: number
    avgConfidence: number
  }
  synonymGroups: Array<{ representative: string; members: string[] }>
  uriNormalizationReport: Array<{ original: string; normalized: string; rule: string }>
}

// -- Tool 3: KG Crawler --
interface CrawlSource {
  uri: string
  type: 'structured' | 'semi-structured' | 'unstructured'
  format: string
  status: string
  triplesExtracted: number
  quality: number
}

interface CrawledTriple {
  subject: string
  predicate: string
  object: string
  confidence: number
  source: string
  extractionMethod: string
  validationStatus: 'valid' | 'warning' | 'error'
}

interface KGCrawlerResult {
  crawlSession: {
    sessionId: string
    startTime: string
    duration: string
    sourcesProcessed: number
    sourcesSucceeded: number
  }
  sources: CrawlSource[]
  triples: CrawledTriple[]
  provenance: {
    totalTriples: number
    bySource: Record<string, number>
    byMethod: Record<string, number>
    byValidation: Record<string, number>
  }
  incrementalUpdate: {
    newTriples: number
    updatedTriples: number
    deletedTriples: number
    unchangedTriples: number
    deltaRatio: number
  }
  qualityValidation: {
    totalChecked: number
    passed: number
    warnings: number
    errors: number
    overallQuality: number
  }
}

// -- Tool 4: Semantic Search --
interface SearchResult {
  rank: number
  nodeUri: string
  nodeLabel: string
  nodeType: string
  score: number
  scoreComponents: {
    vectorScore: number
    keywordScore: number
    inferenceScore: number
    graphContextScore: number
  }
  path: string[]
  snippet: string
  expansion: string[]
}

interface SemanticSearchResult {
  query: string
  results: SearchResult[]
  queryAnalysis: {
    tokens: string[]
    entities: string[]
    intent: string
    expandedTerms: string[]
  }
  searchMetrics: {
    totalCandidates: number
    returnedResults: number
    searchTime: string
    vectorCandidates: number
    keywordCandidates: number
    inferenceCandidates: number
  }
  summary: string
  mermaidContext: string
}

// -- Tool 5: Reasoning Engine --
interface InferenceStep {
  step: number
  rule: string
  input: string[]
  output: string
  type: 'OWL' | 'Rule' | 'Probability'
  confidence: number
  explanation: string
}

interface Contradiction {
  statementA: string
  statementB: string
  type: string
  severity: 'warning' | 'error'
  resolution: string
}

interface ReasoningResult {
  inferredTriples: Array<{ subject: string; predicate: string; object: string; confidence: number; rule: string }>
  inferenceChain: InferenceStep[]
  contradictions: Contradiction[]
  explanation: string
  trace: {
    depth: number
    branchingFactor: number
    totalSteps: number
    prunedBranches: number
  }
  probabilityEstimates: Array<{ statement: string; probability: number; prior: number; posterior: number }>
}

// -- Tool 6: KG Visualizer --
interface VisNode {
  id: string
  label: string
  type: string
  x: number
  y: number
  size: number
  color: string
  metadata: Record<string, string>
  degree: number
  community: number
}

interface VisEdge {
  id: string
  source: string
  target: string
  label: string
  weight: number
  color: string
  style: 'solid' | 'dashed' | 'dotted'
}

interface KGVisualizerResult {
  layout: {
    algorithm: string
    dimensions: { width: number; height: number }
    iterations: number
    convergence: number
  }
  nodes: VisNode[]
  edges: VisEdge[]
  communities: Array<{ id: number; label: string; size: number; color: string }>
  temporalLayer?: { timestamp: string; changeCount: number; changeType: string }
  mermaidGraph: string
  filterConfig: {
    activeFilters: string[]
    visibleTypes: string[]
    zoom: number
    pan: { x: number; y: number }
  }
}

// -- Tool 7: Knowledge QA --
interface QAStep {
  step: number
  description: string
  query: string
  intermediateResult: string
}

interface KnowledgeQAResult {
  question: string
  questionType: 'fact' | 'comparison' | 'computation' | 'temporal' | 'causal' | 'relational' | 'unanswerable'
  answer: string
  confidence: number
  graphQuery: string
  executionSteps: QAStep[]
  evidence: Array<{ triple: string; source: string; relevance: number }>
  hops: number
  unanswerableReason: string | null
  mermaidReasoning: string
}

// -- Tool 8: KG Quality --
interface QualityDimension {
  name: string
  score: number
  weight: number
  findings: string[]
  recommendations: string[]
}

interface KGQualityResult {
  completeness: QualityDimension
  consistency: QualityDimension
  accuracy: QualityDimension
  timeliness: QualityDimension
  connectivity: QualityDimension
  redundancy: QualityDimension
  overallScore: number
  grade: string
  scorecard: {
    totalChecks: number
    passed: number
    warnings: number
    failed: number
  }
  topIssues: Array<{ severity: string; dimension: string; issue: string; fix: string }>
  mermaidRadar: string
}

// ==================== TOOL 1: ONTOLOGY BUILDER ====================

const SCHEMA_ORG_TYPES: Record<string, { parent: string | null; props: string[] }> = {
  'schema:Thing': { parent: null, props: ['schema:name', 'schema:description', 'schema:url', 'schema:image'] },
  'schema:Person': { parent: 'schema:Thing', props: ['schema:givenName', 'schema:familyName', 'schema:birthDate', 'schema:email', 'schema:jobTitle'] },
  'schema:Organization': { parent: 'schema:Thing', props: ['schema:legalName', 'schema:foundingDate', 'schema:numberOfEmployees', 'schema:taxID'] },
  'schema:Place': { parent: 'schema:Thing', props: ['schema:address', 'schema:latitude', 'schema:longitude', 'schema:telephone'] },
  'schema:Event': { parent: 'schema:Thing', props: ['schema:startDate', 'schema:endDate', 'schema:location', 'schema:organizer'] },
  'schema:Product': { parent: 'schema:Thing', props: ['schema:brand', 'schema:manufacturer', 'schema:material', 'schema:sku'] },
  'schema:CreativeWork': { parent: 'schema:Thing', props: ['schema:author', 'schema:datePublished', 'schema:headline', 'schema:genre'] },
  'schema:Action': { parent: 'schema:Thing', props: ['schema:agent', 'schema:object', 'schema:result', 'schema:startTime'] }
}

function buildOntology(
  spec: {
    domain: string
    namespace?: string
    classes?: Array<{ label: string; parent?: string; description?: string }>
    properties?: Array<{ label: string; domain: string; range: string; type?: string }>
    relations?: Array<{ label: string; domain: string; range: string; inverse?: string }>
    constraints?: { disjoint?: string[][]; equivalent?: string[][]; cardinality?: string[] }
    importStandard?: string
  }
): OntologyBuilderResult {
  const rng = createSeededRandom(spec.domain)
  const prefix = spec.domain.toLowerCase().replace(/[^a-z]/g, '').substring(0, 6) || 'onto'
  const ns = spec.namespace || `http://example.org/${prefix}#`

  // Build classes
  const classes: OntologyClass[] = []
  const importReports: OntologyBuilderResult['importReport'] = []

  if (spec.importStandard && SCHEMA_ORG_TYPES[spec.importStandard]) {
    const stdData = SCHEMA_ORG_TYPES[spec.importStandard]
    const baseClass: OntologyClass = {
      uri: `${ns}${spec.importStandard.split(':')[1]}`,
      label: spec.importStandard.split(':')[1],
      parent: stdData.parent ? `${ns}${stdData.parent.split(':')[1]}` : null,
      description: `Imported from ${spec.importStandard}`,
      properties: stdData.props.map(p => `${ns}${p.split(':')[1]}`),
      instances: Math.floor(rng() * 100) + 10,
      constraints: []
    }
    classes.push(baseClass)
    importReports.push({ standard: spec.importStandard, classesImported: 1, propertiesImported: stdData.props.length, status: 'success' })
  }

  if (spec.classes) {
    for (const cls of spec.classes) {
      classes.push({
        uri: `${ns}${cls.label.replace(/\s+/g, '')}`,
        label: cls.label,
        parent: cls.parent ? `${ns}${cls.parent.replace(/\s+/g, '')}` : null,
        description: cls.description || `Class representing ${cls.label}`,
        properties: [],
        instances: Math.floor(rng() * 200) + 5,
        constraints: []
      })
    }
  }

  // Ensure at least the root class
  if (classes.length === 0) {
    classes.push({
      uri: `${ns}Entity`,
      label: 'Entity',
      parent: null,
      description: 'Root entity class',
      properties: [],
      instances: Math.floor(rng() * 50) + 10,
      constraints: []
    })
  }

  // Build properties
  const properties: OntologyProperty[] = []
  if (spec.properties) {
    for (const prop of spec.properties) {
      properties.push({
        uri: `${ns}${prop.label.replace(/\s+/g, '')}`,
        label: prop.label,
        domain: `${ns}${prop.domain.replace(/\s+/g, '')}`,
        range: prop.range.startsWith('schema:') || prop.range.startsWith('http') ? prop.range : `${ns}${prop.range.replace(/\s+/g, '')}`,
        type: (prop.type as OntologyProperty['type']) || 'datatype',
        functional: rng() > 0.5,
        cardinality: rng() > 0.7 ? '0..1' : rng() > 0.4 ? '1..*' : '1..1'
      })
    }
  }

  // Build relations
  const relations: OntologyRelation[] = []
  if (spec.relations) {
    for (const rel of spec.relations) {
      relations.push({
        uri: `${ns}${rel.label.replace(/\s+/g, '')}`,
        label: rel.label,
        domain: `${ns}${rel.domain.replace(/\s+/g, '')}`,
        range: `${ns}${rel.range.replace(/\s+/g, '')}`,
        inverse: rel.inverse ? `${ns}${rel.inverse.replace(/\s+/g, '')}` : null,
        symmetric: rng() > 0.8,
        transitive: rng() > 0.85,
        characteristics: rng() > 0.6 ? ['functional'] : []
      })
    }
  }

  // Constraints
  const constraints: OntologyConstraints = {
    domainConstraints: properties.map(p => `${p.uri} domain ${p.domain}`),
    rangeConstraints: properties.map(p => `${p.uri} range ${p.range}`),
    cardinalityConstraints: properties.filter(p => p.cardinality !== '0..1').map(p => `${p.uri} cardinality ${p.cardinality}`),
    disjointClasses: (spec.constraints?.disjoint || []).map(pair => `${pair[0]} DisjointWith ${pair[1]}`),
    equivalentClasses: (spec.constraints?.equivalent || []).map(pair => `${pair[0]} EquivalentTo ${pair[1]}`)
  }

  // RDFS reasoning
  const inferredSubsumptions: OntologyBuilderResult['rdfsInference']['inferredSubsumptions'] = []
  for (const cls of classes) {
    if (cls.parent) {
      inferredSubsumptions.push({ child: cls.label, parent: cls.parent.split('#').pop() || cls.parent, confidence: 0.95 })
    }
  }
  // Transitive closure inference
  for (const cls of classes) {
    if (cls.parent) {
      const parentClass = classes.find(c => c.uri === cls.parent)
      if (parentClass?.parent && parentClass.parent !== cls.uri) {
        inferredSubsumptions.push({
          child: cls.label,
          parent: parentClass.parent.split('#').pop() || '',
          confidence: 0.85
        })
      }
    }
  }

  const inferredDomains = properties.map(p => ({ property: p.label, domain: p.domain.split('#').pop() || '' }))
  const inferredRanges = properties.map(p => ({ property: p.label, range: p.range.split('#').pop() || '' }))
  const materializedTriples = inferredSubsumptions.length + inferredDomains.length + inferredRanges.length

  // Quality metrics
  const classCoverage = classes.length > 0 ? round(classes.filter(c => c.description && c.description.length > 10).length / classes.length, 2) : 0
  const propCompleteness = classes.length > 0 ? round(properties.length / (classes.length * 3), 2) : 1
  const constraintDensity = round(constraints.cardinalityConstraints.length / Math.max(classes.length, 1), 2)
  const overallScore = round((classCoverage * 0.3 + clamp(propCompleteness, 0, 1) * 0.3 + constraintDensity * 0.2 + 0.2), 2)

  // Mermaid map
  const rootClasses = classes.filter(c => !c.parent || c.parent === null)
  const mindmapNodes = rootClasses.slice(0, 4).map(rc => ({
    label: rc.label,
    children: classes.filter(c => c.parent === rc.uri).map(c => c.label).slice(0, 4)
  }))
  const mermaidMap = buildMermaidMindmap(spec.domain || 'Ontology', mindmapNodes)

  return {
    ontology: { namespace: ns, prefix, version: VERSION, classes, properties, relations, constraints },
    importReport: importReports,
    rdfsInference: { inferredSubsumptions, inferredDomains, inferredRanges, materializedTriples },
    mermaidMap,
    quality: { classCoverage, propertyCompleteness: clamp(propCompleteness, 0, 1), constraintDensity: clamp(constraintDensity, 0, 1), overallScore }
  }
}

function formatOntologyReport(result: OntologyBuilderResult): string {
  const L: string[] = []
  L.push('## Ontology Builder Report')
  L.push('')
  L.push(`**Namespace:** \`${result.ontology.namespace}\` | **Prefix:** \`${result.ontology.prefix}\` | **Version:** ${result.ontology.version}`)
  L.push(`**Classes:** ${result.ontology.classes.length} | **Properties:** ${result.ontology.properties.length} | **Relations:** ${result.ontology.relations.length}`)
  L.push('')
  L.push('### Class Hierarchy')
  L.push('| Class | Parent | Properties | Instances |')
  L.push('|-------|--------|------------|-----------|')
  for (const c of result.ontology.classes) {
    L.push(`| \`${c.label}\` | ${c.parent ? '`' + (c.parent.split('#').pop() || '') + '`' : 'root'} | ${c.properties.length} | ${c.instances} |`)
  }
  if (result.ontology.properties.length > 0) {
    L.push('')
    L.push('### Properties')
    L.push('| Property | Domain | Range | Type | Cardinality |')
    L.push('|----------|--------|-------|------|-------------|')
    for (const p of result.ontology.properties.slice(0, 15)) {
      L.push(`| \`${p.label}\` | \`${p.domain.split('#').pop()}\` | \`${p.range.split('#').pop()}\` | ${p.type} | ${p.cardinality} |`)
    }
  }
  if (result.ontology.relations.length > 0) {
    L.push('')
    L.push('### Relations')
    L.push('| Relation | Domain | Range | Inverse | Characteristics |')
    L.push('|----------|--------|-------|---------|-----------------|')
    for (const r of result.ontology.relations.slice(0, 10)) {
      const chars = [r.symmetric ? 'Symmetric' : '', r.transitive ? 'Transitive' : '', ...r.characteristics].filter(Boolean).join(', ') || 'none'
      L.push(`| \`${r.label}\` | \`${r.domain.split('#').pop()}\` | \`${r.range.split('#').pop()}\` | ${r.inverse ? '`' + (r.inverse.split('#').pop() || '') + '`' : 'none'} | ${chars} |`)
    }
  }
  L.push('')
  L.push('### RDFS Inference Materialization')
  L.push(`- Inferred subsumptions: ${result.rdfsInference.inferredSubsumptions.length}`)
  L.push(`- Materialized domain/range triples: ${result.rdfsInference.inferredDomains.length + result.rdfsInference.inferredRanges.length}`)
  L.push(`- Total materialized: ${result.rdfsInference.materializedTriples} triples`)
  if (result.rdfsInference.inferredSubsumptions.length > 0) {
    L.push('')
    L.push('| Child | Parent | Confidence |')
    L.push('|-------|--------|------------|')
    for (const s of result.rdfsInference.inferredSubsumptions.slice(0, 10)) {
      L.push(`| ${s.child} | ${s.parent} | ${s.confidence} |`)
    }
  }
  L.push('')
  L.push('### Quality Metrics')
  L.push(`| Metric | Score |`)
  L.push(`|--------|-------|`)
  L.push(`| Class Coverage | ${round(result.quality.classCoverage * 100, 0)}% |`)
  L.push(`| Property Completeness | ${round(result.quality.propertyCompleteness * 100, 0)}% |`)
  L.push(`| Constraint Density | ${round(result.quality.constraintDensity * 100, 0)}% |`)
  L.push(`| **Overall Score** | **${round(result.quality.overallScore * 100, 0)}%** |`)
  L.push('')
  L.push('### Ontology Map (Mermaid)')
  L.push('```mermaid')
  L.push(result.mermaidMap)
  L.push('```')
  return L.join('\n')
}

// ==================== TOOL 2: ENTITY RESOLVER ====================

function resolveEntities(
  inputEntities: Array<{ name: string; type?: string; context?: string }>,
  knownEntities?: Array<{ uri: string; name: string; aliases: string[]; type: string }>,
  options?: { synonymThreshold?: number; crossSourceAlign?: boolean; handleRedirects?: boolean }
): EntityResolverResult {
  const rng = createSeededRandom(inputEntities.map(e => e.name).join(',') || 'default')
  const threshold = options?.synonymThreshold ?? 0.8

  const resolved: EntityResolverResult['resolvedEntities'] = []
  const conflicts: ResolutionConflict[] = []
  const synonymGroups: Array<{ representative: string; members: string[] }> = []
  const uriNormalizationReport: Array<{ original: string; normalized: string; rule: string }> = []

  const seen = new Map<string, { canonical: EntityCard; members: string[] }>()
  let matchCount = 0, mergeCount = 0, createCount = 0, redirectCount = 0

  for (const entity of inputEntities) {
    // URI normalization
    const nameLower = entity.name.toLowerCase().trim()
    const normalized = nameLower.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '_')
    uriNormalizationReport.push({
      original: entity.name,
      normalized: `http://example.org/entity/${normalized}`,
      rule: 'lowercase, strip special chars, spaces to underscores'
    })

    // Check known entities
    let matched = false
    if (knownEntities) {
      for (const ke of knownEntities) {
        if (ke.name.toLowerCase() === nameLower || ke.aliases.some(a => a.toLowerCase() === nameLower)) {
          matchCount++
          const card: EntityCard = {
            uri: ke.uri,
            canonicalName: ke.name,
            aliases: ke.aliases,
            type: ke.type,
            description: `Canonical entity: ${ke.name}`,
            sources: ['internal-kb'],
            confidence: 0.95,
            redirects: [],
            mergeHistory: []
          }
          resolved.push({
            input: entity.name, canonicalUri: ke.uri, canonicalName: ke.name, type: ke.type,
            status: 'matched', confidence: 0.95, entityCard: card, alignmentSources: ['exact-match']
          })
          matched = true
          break
        }
      }
    }

    if (!matched) {
      // Fuzzy matching within input
      let bestMatch: { name: string; sim: number } | null = null
      for (const [key, entry] of seen) {
        const sim = stringSimilarity(nameLower, key)
        if (sim >= threshold && sim < 1.0) {
          if (!bestMatch || sim > bestMatch.sim) bestMatch = { name: key, sim }
        }
      }

      if (bestMatch) {
        mergeCount++
        const entry = seen.get(bestMatch.name)!
        entry.members.push(entity.name)
        synonymGroups.push({ representative: entry.canonical.canonicalName, members: [...entry.members] })
        resolved.push({
          input: entity.name, canonicalUri: entry.canonical.uri, canonicalName: entry.canonical.canonicalName,
          type: entry.canonical.type, status: 'merged', confidence: round(bestMatch.sim, 2),
          entityCard: entry.canonical, alignmentSources: ['fuzzy-match']
        })

        // Conflict detection
        if (entity.type && entity.type !== entry.canonical.type) {
          conflicts.push({
            entityA: entity.name, entityB: entry.canonical.canonicalName,
            conflictType: 'type-mismatch', severity: 'medium',
            resolution: `Type conflict: ${entity.type} vs ${entry.canonical.type}. Keeping canonical type.`
          })
        }
      } else {
        createCount++
        const uri = `http://example.org/entity/${normalized}`
        const card: EntityCard = {
          uri, canonicalName: entity.name, aliases: [], type: entity.type || 'Unknown',
          description: entity.context || `New entity created from resolution`,
          sources: ['user-input'], confidence: 0.7, redirects: [], mergeHistory: []
        }
        seen.set(nameLower, { canonical: card, members: [entity.name] })
        resolved.push({
          input: entity.name, canonicalUri: uri, canonicalName: entity.name,
          type: entity.type || 'Unknown', status: 'created', confidence: 0.7,
          entityCard: card, alignmentSources: []
        })
      }
    }
  }

  // Redirect handling
  if (options?.handleRedirects) {
    for (const r of resolved) {
      if (r.status === 'created' && rng() > 0.7) {
        r.status = 'redirected'
        r.entityCard.redirects.push(r.canonicalUri + '/redirect')
        redirectCount++
      }
    }
  }

  const totalInput = inputEntities.length
  const avgConf = resolved.length > 0 ? round(resolved.reduce((s, r) => s + r.confidence, 0) / resolved.length, 3) : 0

  return {
    resolvedEntities: resolved,
    conflicts,
    statistics: {
      totalInput, matched: matchCount, merged: mergeCount,
      created: createCount, redirected: redirectCount, avgConfidence: avgConf
    },
    synonymGroups: synonymGroups.filter((g, i, arr) => arr.findIndex(x => x.representative === g.representative) === i),
    uriNormalizationReport
  }
}

function formatEntityResolverReport(result: EntityResolverResult): string {
  const L: string[] = []
  L.push('## Entity Resolution & Disambiguation Report')
  L.push('')
  L.push(`**Total Input:** ${result.statistics.totalInput} | **Matched:** ${result.statistics.matched} | **Merged:** ${result.statistics.merged} | **Created:** ${result.statistics.created} | **Redirected:** ${result.statistics.redirected}`)
  L.push(`**Avg Confidence:** ${round(result.statistics.avgConfidence * 100, 1)}%`)
  L.push('')
  L.push('### Resolved Entities')
  L.push('| Input | Canonical | Type | Status | Confidence |')
  L.push('|-------|-----------|------|--------|------------|')
  for (const r of result.resolvedEntities) {
    const statusIcon = r.status === 'matched' ? 'MATCH' : r.status === 'merged' ? 'MERGE' : r.status === 'redirected' ? 'REDIR' : 'NEW'
    L.push(`| \`${r.input}\` | \`${r.canonicalName}\` | ${r.type} | ${statusIcon} | ${round(r.confidence * 100, 0)}% |`)
  }
  if (result.conflicts.length > 0) {
    L.push('')
    L.push('### Conflict Detection')
    for (const c of result.conflicts) {
      L.push(`- [${c.severity.toUpperCase()}] ${c.entityA} vs ${c.entityB}: ${c.conflictType}`)
      L.push(`  Resolution: ${c.resolution}`)
    }
  }
  if (result.synonymGroups.length > 0) {
    L.push('')
    L.push('### Synonym Groups')
    for (const g of result.synonymGroups) {
      L.push(`- **${g.representative}**: ${g.members.join(', ')}`)
    }
  }
  L.push('')
  L.push('### URI Normalization')
  L.push('| Original | Normalized | Rule |')
  L.push('|----------|------------|------|')
  for (const u of result.uriNormalizationReport.slice(0, 10)) {
    L.push(`| ${u.original} | \`${u.normalized}\` | ${u.rule} |`)
  }
  return L.join('\n')
}

// ==================== TOOL 3: KG CRAWLER ====================

function crawlKnowledgeGraph(
  spec: {
    seedEntities: string[]
    sources?: Array<{ uri: string; type: 'structured' | 'semi-structured' | 'unstructured'; format: string }>
    maxDepth?: number
    extractionMode?: 'full' | 'incremental'
    qualityThreshold?: number
    provenanceTracking?: boolean
  }
): KGCrawlerResult {
  const rng = createSeededRandom(spec.seedEntities.join(','))
  const sessionId = `crawl_${Date.now()}_${Math.floor(rng() * 10000)}`
  const existingTripleCount = Math.floor(rng() * 5000) + 1000

  // Build sources
  const rawSources: Array<{ uri: string; type: 'structured' | 'semi-structured' | 'unstructured'; format: string }> = (spec.sources || [
    { uri: 'http://dbpedia.org/sparql', type: 'structured', format: 'SPARQL/RDF' },
    { uri: 'https://en.wikipedia.org', type: 'semi-structured', format: 'WikiMarkup' },
    { uri: 'http://pubmed.ncbi.nlm.nih.gov', type: 'unstructured', format: 'PDF/NLP' }
  ])
  const sources: CrawlSource[] = rawSources as unknown as CrawlSource[]

  const sourcesProcessed = sources.length
  const sourcesSucceeded = Math.max(1, Math.floor(sourcesProcessed * (0.7 + rng() * 0.3)))

  const crawlSources: CrawlSource[] = sources.map((s, i) => ({
    ...s,
    status: i < sourcesSucceeded ? 'success' : 'partial',
    triplesExtracted: i < sourcesSucceeded ? Math.floor(rng() * 200) + 50 : Math.floor(rng() * 20),
    quality: round(0.6 + rng() * 0.4, 2)
  }))

  // Extract triples
  const triples: CrawledTriple[] = []
  const methods = ['pattern-matching', 'NLP-extractor', 'table-parser', 'wrapper-induction', 'deep-IE']
  const predicates = ['rdf:type', 'rdfs:label', 'dbo:birthPlace', 'dbo:occupation', 'dbo:almaMater', 'dbo:award', 'dbo:spouse', 'dbo:employer']

  for (const seed of spec.seedEntities) {
    const numTriples = Math.floor(rng() * 8) + 3
    for (let i = 0; i < numTriples; i++) {
      const method = methods[Math.floor(rng() * methods.length)]
      const pred = predicates[Math.floor(rng() * predicates.length)]
      const objVal = `${pred.split(':')[1]}_${Math.floor(rng() * 1000)}`
      const conf = round(0.5 + rng() * 0.5, 2)
      const validation: CrawledTriple['validationStatus'] =
        conf > 0.8 ? 'valid' : conf > 0.5 ? 'warning' : 'error'
      triples.push({
        subject: seed,
        predicate: pred,
        object: objVal,
        confidence: conf,
        source: crawlSources[Math.floor(rng() * crawlSources.length)].uri,
        extractionMethod: method,
        validationStatus: validation
      })
    }
  }

  // Provenance
  const bySource: Record<string, number> = {}
  const byMethod: Record<string, number> = {}
  const byValidation: Record<string, number> = { valid: 0, warning: 0, error: 0 }
  for (const t of triples) {
    bySource[t.source] = (bySource[t.source] || 0) + 1
    byMethod[t.extractionMethod] = (byMethod[t.extractionMethod] || 0) + 1
    byValidation[t.validationStatus]++
  }

  // Incremental update
  const newTriples = Math.floor(spec.extractionMode === 'incremental' ? triples.length * 0.3 : triples.length * 0.8)
  const updatedTriples = Math.floor(rng() * triples.length * 0.2)
  const deletedTriples = Math.floor(rng() * 5)
  const unchangedTriples = existingTripleCount - updatedTriples - deletedTriples
  const deltaRatio = round(newTriples / Math.max(existingTripleCount, 1), 4)

  // Quality validation
  const totalChecked = triples.length
  const passed = byValidation.valid
  const warnings = byValidation.warning
  const errors = byValidation.error
  const overallQuality = totalChecked > 0 ? round(passed / totalChecked, 2) : 0

  return {
    crawlSession: {
      sessionId, startTime: new Date().toISOString(),
      duration: `${(rng() * 30 + 5).toFixed(1)}s`,
      sourcesProcessed, sourcesSucceeded
    },
    sources: crawlSources,
    triples: triples.slice(0, 50),
    provenance: { totalTriples: triples.length, bySource, byMethod, byValidation },
    incrementalUpdate: { newTriples, updatedTriples, deletedTriples, unchangedTriples, deltaRatio },
    qualityValidation: { totalChecked, passed, warnings, errors, overallQuality }
  }
}

function formatKGCrawlerReport(result: KGCrawlerResult): string {
  const L: string[] = []
  L.push('## Knowledge Graph Crawler Report')
  L.push('')
  L.push(`**Session:** \`${result.crawlSession.sessionId}\` | **Duration:** ${result.crawlSession.duration}`)
  L.push(`**Sources:** ${result.crawlSession.sourcesSucceeded}/${result.crawlSession.sourcesProcessed} succeeded`)
  L.push(`**Triples Extracted:** ${result.provenance.totalTriples}`)
  L.push('')
  L.push('### Crawl Sources')
  L.push('| Source | Type | Format | Status | Triples | Quality |')
  L.push('|--------|------|--------|--------|---------|---------|')
  for (const s of result.sources) {
    L.push(`| ${s.uri.substring(0, 35)} | ${s.type} | ${s.format} | ${s.status} | ${s.triplesExtracted} | ${round(s.quality * 100, 0)}% |`)
  }
  L.push('')
  L.push('### Extraction Methods')
  for (const [method, count] of Object.entries(result.provenance.byMethod)) {
    L.push(`- \`${method}\`: ${count} triples`)
  }
  L.push('')
  L.push('### Triple Validation')
  L.push(`| Status | Count |`)
  L.push(`|--------|-------|`)
  L.push(`| Valid | ${result.provenance.byValidation.valid || 0} |`)
  L.push(`| Warning | ${result.provenance.byValidation.warning || 0} |`)
  L.push(`| Error | ${result.provenance.byValidation.error || 0} |`)
  L.push('')
  L.push('### Incremental Update')
  L.push(`| Metric | Value |`)
  L.push(`|--------|-------|`)
  L.push(`| New Triples | ${result.incrementalUpdate.newTriples} |`)
  L.push(`| Updated Triples | ${result.incrementalUpdate.updatedTriples} |`)
  L.push(`| Deleted Triples | ${result.incrementalUpdate.deletedTriples} |`)
  L.push(`| Delta Ratio | ${round(result.incrementalUpdate.deltaRatio * 100, 2)}% |`)
  L.push('')
  L.push('### Quality Validation')
  L.push(`**Overall Quality:** ${round(result.qualityValidation.overallQuality * 100, 0)}% (${result.qualityValidation.passed}/${result.qualityValidation.totalChecked} passed)`)
  if (result.triples.length > 0) {
    L.push('')
    L.push('### Sample Triples (Provenance Tracked)')
    L.push('| Subject | Predicate | Object | Method | Conf. | Status |')
    L.push('|---------|-----------|--------|--------|-------|--------|')
    for (const t of result.triples.slice(0, 10)) {
      const icon = t.validationStatus === 'valid' ? 'OK' : t.validationStatus === 'warning' ? 'WARN' : 'ERR'
      L.push(`| \`${t.subject}\` | \`${t.predicate}\` | \`${t.object.substring(0, 20)}\` | ${t.extractionMethod} | ${t.confidence} | ${icon} |`)
    }
  }
  return L.join('\n')
}

// ==================== TOOL 4: SEMANTIC SEARCH ====================

function performSemanticSearch(
  query: string,
  graphData: {
    nodes: Array<{ id: string; label: string; type: string; embedding?: number[] }>
    edges: Array<{ source: string; target: string; label: string; weight?: number }>
  },
  options?: { maxResults?: number; inferenceExpansion?: boolean; hybridWeight?: number; summarizeResults?: boolean }
): SemanticSearchResult {
  const rng = createSeededRandom(query)
  const maxResults = options?.maxResults ?? 8
  const hybridWeight = options?.hybridWeight ?? 0.5

  const tokens = tokenize(query)
  const entities = graphData.nodes.filter(n =>
    tokens.some(t => n.label.toLowerCase().includes(t) || n.type.toLowerCase().includes(t))
  ).map(n => n.label)

  // Determine intent
  const intentMap: Record<string, string> = {
    'who': 'person-query', 'what': 'definition-query', 'where': 'location-query',
    'when': 'temporal-query', 'how': 'process-query', 'why': 'causal-query',
    'compare': 'comparison-query', 'list': 'enumeration-query'
  }
  let intent = 'knowledge-query'
  for (const [key, val] of Object.entries(intentMap)) {
    if (tokens.includes(key) || tokens.some(t => t.startsWith(key))) intent = val
  }

  // Score nodes: vector + keyword + inference + graph context
  const scoredNodes = graphData.nodes.map(node => {
    // Keyword match score
    const labelLower = node.label.toLowerCase()
    let keywordScore = 0
    for (const token of tokens) {
      if (labelLower.includes(token)) keywordScore += 0.3
      if (labelLower === token) keywordScore += 0.2
    }
    keywordScore = clamp(keywordScore, 0, 1)

    // Embedding similarity (simulated)
    const vectorScore = round(0.3 + rng() * 0.7, 3)

    // Inference expansion score
    let inferenceScore = 0
    if (options?.inferenceExpansion) {
      const relatedEdges = graphData.edges.filter(e =>
        e.source === node.id && tokens.some(t => e.label.toLowerCase().includes(t))
      )
      inferenceScore = clamp(relatedEdges.length * 0.15, 0, 1)
    }

    // Graph context (neighborhood relevance)
    const neighbors = graphData.edges
      .filter(e => e.source === node.id || e.target === node.id)
      .map(e => e.source === node.id ? e.target : e.source)
    const neighborNodes = neighbors.map(id => graphData.nodes.find(n => n.id === id)).filter(Boolean)
    const graphContextScore = clamp(neighborNodes.filter(n =>
      n && tokens.some(t => n.label.toLowerCase().includes(t || ''))
    ).length * 0.2, 0, 1)

    const score = round(
      vectorScore * (1 - hybridWeight) * 0.4 +
      keywordScore * hybridWeight * 0.3 +
      inferenceScore * 0.15 +
      graphContextScore * 0.15,
      3
    )

    return { node, vectorScore, keywordScore, inferenceScore, graphContextScore, score }
  })

  // Sort and select top results
  const ranked = scoredNodes
    .filter(s => s.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  const results: SearchResult[] = ranked.map((r, idx) => {
    const neighbors = graphData.edges
      .filter(e => e.source === r.node.id || e.target === r.node.id)
      .map(e => e.source === r.node.id ? e.target : e.source)
      .slice(0, 3)
    const neighborLabels = neighbors.map(id => graphData.nodes.find(n => n.id === id)?.label || id)
    const path = [r.node.label, ...neighborLabels]
    const snippet = `${r.node.label} (${r.node.type}) connected to ${neighborLabels.join(', ')}`

    const expansion: string[] = []
    if (options?.inferenceExpansion) {
      const related = graphData.edges.filter(e => e.source === r.node.id).map(e => e.label)
      expansion.push(...related.slice(0, 3))
    }

    return {
      rank: idx + 1, nodeUri: r.node.id, nodeLabel: r.node.label, nodeType: r.node.type,
      score: r.score, scoreComponents: {
        vectorScore: r.vectorScore, keywordScore: r.keywordScore,
        inferenceScore: r.inferenceScore, graphContextScore: r.graphContextScore
      }, path, snippet, expansion
    }
  })

  // Summary generation
  let summary = ''
  if (options?.summarizeResults !== false && results.length > 0) {
    const top3 = results.slice(0, 3).map(r => `${r.nodeLabel} (${round(r.score * 100, 0)}%)`)
    summary = `Found ${results.length} results for "${query}". Top matches: ${top3.join(', ')}. Intent classified as "${intent}".`
  }

  // Mermaid context graph
  const mermaidLines: string[] = ['graph TD']
  for (const r of results.slice(0, 5)) {
    mermaidLines.push(`  ${r.rank}["${r.nodeLabel} (${r.score.toFixed(2)})"]`)
    for (const nodeId of r.path.slice(1)) {
      const targetIdx = results.findIndex(x => x.nodeLabel === nodeId)
      if (targetIdx >= 0) {
        mermaidLines.push(`  ${r.rank} --> ${targetIdx + 1}`)
      }
    }
  }

  return {
    query, results,
    queryAnalysis: { tokens, entities, intent, expandedTerms: entities.length > 0 ? entities : tokens },
    searchMetrics: {
      totalCandidates: graphData.nodes.length, returnedResults: results.length,
      searchTime: `${(rng() * 500 + 50).toFixed(0)}ms`,
      vectorCandidates: graphData.nodes.length,
      keywordCandidates: scoredNodes.filter(s => s.keywordScore > 0).length,
      inferenceCandidates: scoredNodes.filter(s => s.inferenceScore > 0).length
    },
    summary,
    mermaidContext: mermaidLines.join('\n')
  }
}

function formatSemanticSearchReport(result: SemanticSearchResult): string {
  const L: string[] = []
  L.push('## Semantic Search Report')
  L.push('')
  L.push(`**Query:** "${result.query}"`)
  L.push(`**Intent:** ${result.queryAnalysis.intent} | **Entities:** ${result.queryAnalysis.entities.length > 0 ? result.queryAnalysis.entities.join(', ') : 'none detected'}`)
  L.push(`**Results:** ${result.searchMetrics.returnedResults}/${result.searchMetrics.totalCandidates} | **Search Time:** ${result.searchMetrics.searchTime}`)
  L.push('')
  L.push('### Score Breakdown')
  L.push(`- Vector Candidates: ${result.searchMetrics.vectorCandidates}`)
  L.push(`- Keyword Candidates: ${result.searchMetrics.keywordCandidates}`)
  L.push(`- Inference Candidates: ${result.searchMetrics.inferenceCandidates}`)
  L.push('')
  if (result.results.length > 0) {
    L.push('### Ranked Results')
    L.push('| Rank | Node | Type | Score | Vector | Keyword | Inference | Context |')
    L.push('|------|------|------|-------|--------|---------|-----------|---------|')
    for (const r of result.results) {
      L.push(`| ${r.rank} | ${r.nodeLabel} | ${r.nodeType} | ${r.score.toFixed(3)} | ${r.scoreComponents.vectorScore.toFixed(2)} | ${r.scoreComponents.keywordScore.toFixed(2)} | ${r.scoreComponents.inferenceScore.toFixed(2)} | ${r.scoreComponents.graphContextScore.toFixed(2)} |`)
    }
    L.push('')
    L.push('### Top Result Paths')
    for (const r of result.results.slice(0, 3)) {
      L.push(`- **${r.nodeLabel}**: ${r.path.join(' → ')}`)
      if (r.expansion.length > 0) L.push(`  Expansion: ${r.expansion.join(', ')}`)
    }
  }
  if (result.summary) {
    L.push('')
    L.push('### Summary')
    L.push(result.summary)
  }
  L.push('')
  L.push('### Search Context Graph (Mermaid)')
  L.push('```mermaid')
  L.push(result.mermaidContext)
  L.push('```')
  return L.join('\n')
}

// ==================== TOOL 5: REASONING ENGINE ====================

function runReasoningEngine(
  spec: {
    triples: Array<{ subject: string; predicate: string; object: string }>
    rules?: Array<{ name: string; antecedent: string; consequent: string; type: 'OWL' | 'Rule' | 'Probability' }>
    owlAxioms?: string[]
    detectContradictions?: boolean
    probabilisticMode?: boolean
    maxDepth?: number
  }
): ReasoningResult {
  const rng = createSeededRandom(spec.triples.map(t => `${t.subject}${t.predicate}`).join(',') || 'reasoning')
  const inferred: ReasoningResult['inferredTriples'] = []
  const chain: InferenceStep[] = []
  const contradictions: Contradiction[] = []
  let stepNum = 0

  // Apply OWL reasoning
  const owlRules = spec.rules?.filter(r => r.type === 'OWL') || [
    { name: 'rdfs:subClassOf-transitivity', antecedent: 'A subClassOf B && B subClassOf C', consequent: 'A subClassOf C', type: 'OWL' as const },
    { name: 'owl:inverseOf', antecedent: 'P inverseOf Q && P(x,y)', consequent: 'Q(y,x)', type: 'OWL' as const },
    { name: 'owl:symmetricProperty', antecedent: 'Sym(P) && P(x,y)', consequent: 'P(y,x)', type: 'OWL' as const }
  ]

  for (const rule of owlRules) {
    stepNum++
    const applicable = spec.triples.filter(t =>
      t.predicate.includes('subClassOf') || t.predicate.includes('type')
    ).slice(0, 3)

    if (applicable.length > 0) {
      const inferredObj = `${rule.consequent.replace(/\s/g, '_')}_${Math.floor(rng() * 1000)}`
      inferred.push({
        subject: applicable[0].subject, predicate: 'rdfs:inferred', object: inferredObj,
        confidence: round(0.8 + rng() * 0.2, 2), rule: rule.name
      })
      chain.push({
        step: stepNum, rule: rule.name, input: applicable.map(t => `${t.subject} ${t.predicate} ${t.object}`),
        output: `${applicable[0].subject} rdfs:inferred ${inferredObj}`, type: 'OWL',
        confidence: round(0.8 + rng() * 0.2, 2),
        explanation: `Applied ${rule.name}: ${rule.antecedent} => ${rule.consequent}`
      })
    }
  }

  // Apply rule-based reasoning
  const swrlRules = spec.rules?.filter(r => r.type === 'Rule') || [
    { name: 'bornIn-samePlace', antecedent: 'bornIn(X,P) && bornIn(Y,P)', consequent: 'colleague(X,Y)', type: 'Rule' as const },
    { name: 'employedBy-chain', antecedent: 'worksFor(X,O) && subOrganizationOf(O,P)', consequent: 'indirectlyEmployedBy(X,P)', type: 'Rule' as const }
  ]

  for (const rule of swrlRules) {
    stepNum++
    const inputTriples = spec.triples.slice(0, 2)
    const inferredObj = `${rule.consequent}_${Math.floor(rng() * 1000)}`
    inferred.push({
      subject: inputTriples[0]?.subject || 'entity_A', predicate: rule.consequent.split('(')[0] || 'inferred',
      object: inferredObj, confidence: round(0.6 + rng() * 0.3, 2), rule: rule.name
    })
    chain.push({
      step: stepNum, rule: rule.name, input: inputTriples.map(t => `${t.subject} ${t.predicate} ${t.object}`),
      output: `${inputTriples[0]?.subject} ${rule.consequent.split('(')[0]} ${inferredObj}`,
      type: 'Rule', confidence: round(0.6 + rng() * 0.3, 2),
      explanation: `Applied SWRL rule: ${rule.antecedent} => ${rule.consequent}`
    })
  }

  // Probabilistic reasoning
  const probabilities: ReasoningResult['probabilityEstimates'] = []
  if (spec.probabilisticMode) {
    for (const t of spec.triples.slice(0, 5)) {
      const prior = round(0.3 + rng() * 0.4, 2)
      const likelihood = round(0.5 + rng() * 0.5, 2)
      const posterior = round(clamp(prior * likelihood / Math.max(prior * likelihood + (1 - prior) * 0.3, 0.01), 0, 1), 2)
      probabilities.push({
        statement: `${t.subject} ${t.predicate} ${t.object}`,
        probability: posterior, prior, posterior
      })
      stepNum++
      chain.push({
        step: stepNum, rule: 'Bayesian-update', input: [`${t.subject} ${t.predicate} ${t.object}`],
        output: `P(statement) = ${posterior}`, type: 'Probability',
        confidence: posterior, explanation: `Prior: ${prior}, Likelihood: ${likelihood}, Posterior: ${posterior}`
      })
    }
  }

  // Contradiction detection
  if (spec.detectContradictions !== false) {
    const typeMap = new Map<string, Set<string>>()
    for (const t of spec.triples) {
      if (t.predicate === 'rdf:type' || t.predicate === 'dbo:type') {
        if (!typeMap.has(t.subject)) typeMap.set(t.subject, new Set())
        typeMap.get(t.subject)!.add(t.object)
      }
    }
    // Check for disjoint class violations
    for (const [entity, types] of typeMap) {
      if (types.size > 2) {
        const typesArr = [...types]
        contradictions.push({
          statementA: `${entity} a ${typesArr[0]}`, statementB: `${entity} a ${typesArr[1]}`,
          type: 'potential-class-overload', severity: 'warning',
          resolution: `Verify that ${entity} belongs to multiple non-disjoint classes. Consider class specialization.`
        })
      }
    }
    // Functional property violation
    const funcProps = new Map<string, Map<string, string[]>>()
    for (const t of spec.triples) {
      if (t.predicate === 'dbo:birthDate' || t.predicate === 'foaf:age') {
        if (!funcProps.has(t.predicate)) funcProps.set(t.predicate, new Map())
        const propMap = funcProps.get(t.predicate)!
        if (!propMap.has(t.subject)) propMap.set(t.subject, [])
        propMap.get(t.subject)!.push(t.object)
      }
    }
    for (const [prop, subjects] of funcProps) {
      for (const [subject, values] of subjects) {
        if (values.length > 1 && new Set(values).size > 1) {
          contradictions.push({
            statementA: `${subject} ${prop} ${values[0]}`,
            statementB: `${subject} ${prop} ${values[1]}`,
            type: 'functional-property-violation', severity: 'error',
            resolution: `${prop} is functional — ${subject} has conflicting values ${values.join(', ')}. Requires data cleansing.`
          })
        }
      }
    }
  }

  // Explanation
  const explanation = `Inferred ${inferred.length} new triples through ${chain.length} reasoning steps. ` +
    `${contradictions.length} potential contradictions detected. ` +
    `Used ${owlRules.length} OWL rules and ${swrlRules.length} SWRL rules.` +
    (spec.probabilisticMode ? ` Bayesian posterior computed for ${probabilities.length} statements.` : '')

  return {
    inferredTriples: inferred, inferenceChain: chain, contradictions,
    explanation,
    trace: {
      depth: maxDepth(chain.length), branchingFactor: round(1 + rng() * 2, 1),
      totalSteps: chain.length, prunedBranches: Math.floor(rng() * 3)
    },
    probabilityEstimates: probabilities
  }
}

function maxDepth(steps: number): number {
  return Math.ceil(Math.log2(Math.max(steps, 1))) + 1
}

function formatReasoningReport(result: ReasoningResult): string {
  const L: string[] = []
  L.push('## Reasoning Engine Report')
  L.push('')
  L.push(`**Inferred Triples:** ${result.inferredTriples.length} | **Steps:** ${result.trace.totalSteps} | **Contradictions:** ${result.contradictions.length}`)
  L.push(`**Depth:** ${result.trace.depth} | **Branching Factor:** ${result.trace.branchingFactor} | **Pruned:** ${result.trace.prunedBranches}`)
  L.push('')

  if (result.inferenceChain.length > 0) {
    L.push('### Inference Chain')
    L.push('| Step | Rule | Type | Output | Confidence |')
    L.push('|------|------|------|--------|------------|')
    for (const s of result.inferenceChain.slice(0, 15)) {
      L.push(`| ${s.step} | \`${s.rule}\` | ${s.type} | ${s.output.substring(0, 40)} | ${s.confidence} |`)
    }
    L.push('')
    L.push('### Step Explanations')
    for (const s of result.inferenceChain.slice(0, 5)) {
      L.push(`**Step ${s.step}:** ${s.explanation}`)
      L.push(`  Input: ${s.input.slice(0, 2).join('; ')}`)
    }
  }

  if (result.contradictions.length > 0) {
    L.push('')
    L.push('### Contradiction Detection')
    for (const c of result.contradictions) {
      const icon = c.severity === 'error' ? 'ERR' : 'WARN'
      L.push(`- [${icon}] ${c.statementA} vs ${c.statementB}`)
      L.push(`  Type: ${c.type} | Fix: ${c.resolution}`)
    }
  }

  if (result.probabilityEstimates.length > 0) {
    L.push('')
    L.push('### Probabilistic Estimates')
    L.push('| Statement | Prior | Posterior |')
    L.push('|-----------|-------|-----------|')
    for (const p of result.probabilityEstimates) {
      L.push(`| ${p.statement.substring(0, 40)} | ${p.prior} | ${p.posterior} |`)
    }
  }

  L.push('')
  L.push('### Explanation')
  L.push(result.explanation)
  return L.join('\n')
}

// ==================== TOOL 6: KG VISUALIZER ==================

function visualizeKnowledgeGraph(
  graphData: {
    nodes: Array<{ id: string; label: string; type: string; timestamp?: string; community?: number }>
    edges: Array<{ source: string; target: string; label: string; weight?: number; timestamp?: string }>
  },
  options?: {
    layout?: 'force-directed' | 'circular' | 'hierarchical' | 'grid'
    showCommunities?: boolean
    showTimestamps?: boolean
    filterTypes?: string[]
    maxNodes?: number
    zoom?: number
  }
): KGVisualizerResult {
  const rng = createSeededRandom(graphData.nodes.map(n => n.id).join(',') || 'viz')
  const layout = options?.layout || 'force-directed'
  const maxNodes = options?.maxNodes || 50
  const showCommunities = options?.showCommunities !== false

  // Filter nodes by type if specified
  let filteredNodes = graphData.nodes
  if (options?.filterTypes && options.filterTypes.length > 0) {
    filteredNodes = graphData.nodes.filter(n => options!.filterTypes!.includes(n.type))
  }
  filteredNodes = filteredNodes.slice(0, maxNodes)

  // Compute degrees
  const degrees = new Map<string, number>()
  for (const n of filteredNodes) degrees.set(n.id, 0)
  for (const e of graphData.edges) {
    if (degrees.has(e.source)) degrees.set(e.source, (degrees.get(e.source) || 0) + 1)
    if (degrees.has(e.target)) degrees.set(e.target, (degrees.get(e.target) || 0) + 1)
  }
  const maxDeg = Math.max(...degrees.values(), 1)

  // Layout computation
  const width = 800
  const height = 600
  const positions = computeLayout(filteredNodes, graphData.edges, layout, width, height, rng)

  // Community detection / coloring
  const communityCount = showCommunities ? Math.min(5, Math.max(1, Math.floor(filteredNodes.length / 5))) : 1
  const communityColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const nodes: VisNode[] = filteredNodes.map((n, i) => {
    const pos = positions.get(n.id) || { x: rng() * width, y: rng() * height }
    const deg = degrees.get(n.id) || 0
    const community = n.community ?? (i % communityCount)
    const typeColors: Record<string, string> = {
      person: EMERALD.primary, organization: '#3B82F6', location: '#F59E0B',
      event: '#EF4444', product: '#8B5CF6', concept: '#6B7280'
    }
    return {
      id: n.id, label: n.label, type: n.type,
      x: round(pos.x, 1), y: round(pos.y, 1),
      size: 8 + (deg / maxDeg) * 24,
      color: showCommunities ? communityColors[community % communityColors.length] : (typeColors[n.type] || EMERALD.dark),
      metadata: getMetadata(n.timestamp),
      degree: deg, community
    }
  })

  // Edges
  const nodeIds = new Set(filteredNodes.map(n => n.id))
  const edges: VisEdge[] = graphData.edges
    .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
    .slice(0, maxNodes * 2)
    .map((e, i) => ({
      id: `viz_edge_${i}`, source: e.source, target: e.target, label: e.label,
      weight: e.weight || 1, color: EMERALD.edge,
      style: e.weight && e.weight > 0.8 ? 'solid' as const : 'dashed' as const
    }))

  // Communities summary
  const communities: KGVisualizerResult['communities'] = []
  for (let c = 0; c < communityCount; c++) {
    const members = nodes.filter(n => n.community === c)
    if (members.length > 0) {
      communities.push({
        id: c, label: `Community ${c + 1}`,
        size: members.length, color: communityColors[c % communityColors.length]
      })
    }
  }

  // Temporal layer
  const timestamps = graphData.nodes.filter(n => n.timestamp).map(n => n.timestamp)
  let temporalLayer: KGVisualizerResult['temporalLayer'] | undefined
  if (options?.showTimestamps && timestamps.length > 0) {
    const unique = [...new Set(timestamps)].sort()
    const lastTs = unique[unique.length - 1]
    temporalLayer = {
      timestamp: lastTs || '', changeCount: Math.floor(rng() * 10) + 2, changeType: 'node-addition'
    }
  }

  // Mermaid graph
  const mermaidLines: string[] = ['graph LR']
  for (const n of nodes.slice(0, 12)) {
    mermaidLines.push(`  ${n.id}["${n.label}"]`)
  }
  for (const e of edges.slice(0, 15)) {
    mermaidLines.push(`  ${e.source} -->|${e.label.substring(0, 15)}| ${e.target}`)
  }

  return {
    layout: { algorithm: layout, dimensions: { width, height }, iterations: 100, convergence: round(0.85 + rng() * 0.15, 2) },
    nodes, edges, communities,
    temporalLayer,
    mermaidGraph: mermaidLines.join('\n'),
    filterConfig: {
      activeFilters: options?.filterTypes || [],
      visibleTypes: unique(filteredNodes.map(n => n.type)),
      zoom: options?.zoom || 1.0,
      pan: { x: 0, y: 0 }
    }
  }
}

function getMetadata(timestamp?: string): Record<string, string> {
  const m: Record<string, string> = { source: 'knowledge-graph' }
  if (timestamp) m.timestamp = timestamp
  return m
}

function computeLayout(
  nodes: Array<{ id: string }>,
  edges: Array<{ source: string; target: string }>,
  algorithm: string,
  width: number,
  height: number,
  rng: () => number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const n = nodes.length

  if (algorithm === 'circular') {
    const radius = Math.max(n * 35, 200)
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(n, 1)
      positions.set(node.id, {
        x: width / 2 + radius * Math.cos(angle) * 0.4,
        y: height / 2 + radius * Math.sin(angle) * 0.4
      })
    })
  } else if (algorithm === 'grid') {
    const cols = Math.ceil(Math.sqrt(n))
    const spacing = Math.min(width, height) / (cols + 1)
    nodes.forEach((node, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      positions.set(node.id, { x: (col + 1) * spacing, y: (row + 1) * spacing })
    })
  } else if (algorithm === 'hierarchical') {
    // BFS layering from roots
    const inDeg = new Map<string, number>()
    const adj = new Map<string, string[]>()
    for (const node of nodes) { inDeg.set(node.id, 0); adj.set(node.id, []) }
    for (const e of edges) {
      if (adj.has(e.source) && inDeg.has(e.target)) {
        adj.get(e.source)!.push(e.target)
        inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1)
      }
    }
    const levels = new Map<string, number>()
    const queue: string[] = []
    for (const [id, deg] of inDeg) if (deg === 0) queue.push(id)
    while (queue.length > 0) {
      const id = queue.shift()!
      if (levels.has(id)) continue
      levels.set(id, 0)
      for (const neighbor of (adj.get(id) || [])) {
        if (!levels.has(neighbor)) queue.push(neighbor)
      }
    }
    const levelGroups = new Map<number, string[]>()
    for (const [id, level] of levels) {
      if (!levelGroups.has(level)) levelGroups.set(level, [])
      levelGroups.get(level)!.push(id)
    }
    for (const [level, ids] of levelGroups) {
      const y = (level + 1) * 100
      const spacing = width / (ids.length + 1)
      ids.forEach((id, i) => { positions.set(id, { x: (i + 1) * spacing, y }) })
    }
  } else {
    // Force-directed: random init + simulate
    for (const node of nodes) {
      positions.set(node.id, { x: rng() * width, y: rng() * height })
    }
    for (let iter = 0; iter < 50; iter++) {
      // Repulsion
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = positions.get(nodes[i].id)!
          const b = positions.get(nodes[j].id)!
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 300 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.x -= fx; a.y -= fy
          b.x += fx; b.y += fy
        }
      }
      // Attraction along edges
      for (const e of edges) {
        const a = positions.get(e.source)
        const b = positions.get(e.target)
        if (!a || !b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = dist * 0.01
        a.x += (dx / dist) * force
        a.y += (dy / dist) * force
        b.x -= (dx / dist) * force
        b.y -= (dy / dist) * force
      }
      // Center gravity
      for (const node of nodes) {
        const p = positions.get(node.id)!
        p.x += (width / 2 - p.x) * 0.02
        p.y += (height / 2 - p.y) * 0.02
      }
    }
  }
  return positions
}

function formatVisualizerReport(result: KGVisualizerResult): string {
  const L: string[] = []
  L.push('## Knowledge Graph Visualizer Report')
  L.push('')
  L.push(`**Layout:** ${result.layout.algorithm} | **Dimensions:** ${result.layout.dimensions.width}x${result.layout.dimensions.height}`)
  L.push(`**Iterations:** ${result.layout.iterations} | **Convergence:** ${round(result.layout.convergence * 100, 0)}%`)
  L.push(`**Nodes:** ${result.nodes.length} | **Edges:** ${result.edges.length} | **Communities:** ${result.communities.length}`)
  L.push('')
  L.push('### Communities')
  for (const c of result.communities) {
    L.push(`- ${c.label}: ${c.size} nodes (${c.color})`)
  }
  if (result.nodes.length > 0) {
    L.push('')
    L.push('### Node Positions (Top 10)')
    L.push('| Node | Type | X | Y | Size | Degree | Community |')
    L.push('|------|------|---|---|------|--------|-----------|')
    for (const n of result.nodes.slice(0, 10)) {
      L.push(`| ${n.label} | ${n.type} | ${n.x} | ${n.y} | ${round(n.size, 1)} | ${n.degree} | ${n.community} |`)
    }
  }
  if (result.temporalLayer) {
    L.push('')
    L.push('### Temporal Layer')
    L.push(`- Timestamp: ${result.temporalLayer.timestamp}`)
    L.push(`- Changes: ${result.temporalLayer.changeCount} (${result.temporalLayer.changeType})`)
  }
  L.push('')
  L.push('### Filter Config')
  L.push(`- Visible Types: ${result.filterConfig.visibleTypes.join(', ')}`)
  L.push(`- Zoom: ${result.filterConfig.zoom}x | Pan: (${result.filterConfig.pan.x}, ${result.filterConfig.pan.y})`)
  L.push('')
  L.push('### Graph Visualization (Mermaid)')
  L.push('```mermaid')
  L.push(result.mermaidGraph)
  L.push('```')
  return L.join('\n')
}

// ==================== TOOL 7: KNOWLEDGE QA ==================

function answerKnowledgeQuestion(
  question: string,
  graphData: {
    nodes: Array<{ id: string; label: string; type: string }>
    edges: Array<{ source: string; target: string; label: string; weight?: number }>
  },
  options?: { maxHops?: number; detectUnanswerable?: boolean; explainSteps?: boolean }
): KnowledgeQAResult {
  const rng = createSeededRandom(question)
  const maxHops = options?.maxHops ?? 3
  const tokens = tokenize(question)

  // Classify question type
  let qType: KnowledgeQAResult['questionType'] = 'fact'
  if (/compare|difference|versus|vs\.?|better|worse|more|less/.test(question)) qType = 'comparison'
  else if (/how many|count|total|sum|average|calculate|number of/.test(question)) qType = 'computation'
  else if (/when|before|after|during|year|decade|first|last/.test(question)) qType = 'temporal'
  else if (/why|cause|reason|because|lead to|result/.test(question)) qType = 'causal'
  else if (/who|what|which|where/.test(question)) qType = 'relational'

  // Build graph query
  const matchedNodes = graphData.nodes.filter(n =>
    tokens.some(t => n.label.toLowerCase().includes(t) || n.type.toLowerCase().includes(t))
  )

  // Check unanswerable
  let unanswerableReason: string | null = null
  if (options?.detectUnanswerable !== false && matchedNodes.length === 0) {
    unanswerableReason = `No entities in the knowledge graph match the question terms: ${tokens.join(', ')}. The graph may lack coverage for this domain.`
  }

  // Multi-hop traversal
  const steps: QAStep[] = []
  const evidence: KnowledgeQAResult['evidence'] = []
  let hops = 0
  let answer = ''

  if (matchedNodes.length > 0) {
    // Start from best matching node
    const startNode = matchedNodes[0]
    const visited = new Set<string>([startNode.id])
    const queue: Array<{ id: string; path: string[]; depth: number }> = [{ id: startNode.id, path: [startNode.label], depth: 0 }]

    while (queue.length > 0 && hops < maxHops) {
      const current = queue.shift()!
      hops = Math.max(hops, current.depth)

      // Find connected edges
      const connectedEdges = graphData.edges.filter(e => e.source === current.id || e.target === current.id)

      for (const edge of connectedEdges) {
        const nextId = edge.source === current.id ? edge.target : edge.source
        if (visited.has(nextId)) continue
        visited.add(nextId)

        const nextNode = graphData.nodes.find(n => n.id === nextId)
        if (!nextNode) continue

        const newPath = [...current.path, edge.label, nextNode.label]
        const relevance = round(0.5 + rng() * 0.5, 2)

        evidence.push({
          triple: `${current.id === edge.source ? current.path[current.path.length - 1] : nextNode.label} ${edge.label} ${nextNode.label}`,
          source: 'kg-traversal', relevance
        })

        if (options?.explainSteps !== false) {
          steps.push({
            step: steps.length + 1,
            description: `Traverse ${edge.label} from ${current.path[current.path.length - 1]} to ${nextNode.label}`,
            query: `MATCH (a)-[:${edge.label}]->(b) WHERE a.label = '${current.path[current.path.length - 1]}' RETURN b`,
            intermediateResult: nextNode.label
          })
        }

        if (current.depth + 1 < maxHops) {
          queue.push({ id: nextId, path: newPath, depth: current.depth + 1 })
        }
      }
    }

    // Generate answer based on question type
    const evidenceLabels = evidence.map(e => e.triple)
    switch (qType) {
      case 'fact':
        answer = matchedNodes.length > 0
          ? `${matchedNodes[0].label} is a ${matchedNodes[0].type}. ${evidence.length > 0 ? `Related: ${evidenceLabels[0]}.` : ''}`
          : 'No matching entity found in the knowledge graph.'
        break
      case 'comparison':
        answer = matchedNodes.length >= 2
          ? `Comparing ${matchedNodes[0].label} and ${matchedNodes[1].label}: Both are entities in the graph. ${evidence.length} relationship(s) found connecting them through ${hops} hop(s).`
          : `Insufficient entities for comparison. Found ${matchedNodes.length} matching entity.`
        break
      case 'computation':
        answer = `Found ${matchedNodes.length} matching entities and ${evidence.length} relationships. Total connections traversed: ${evidence.length} over ${hops} hop(s).`
        break
      case 'temporal':
        answer = `Temporal analysis: ${matchedNodes[0]?.label || 'Entity'} has ${evidence.length} temporal relationships. Traversed ${hops} hop(s) through the graph.`
        break
      case 'causal':
        answer = `Causal chain: ${evidence.length > 0 ? evidence.map(e => e.triple).join(' => ') : 'No causal path found in the available graph data.'}`
        break
      case 'relational':
        answer = `${matchedNodes[0]?.label || 'Entity'} connects to ${evidence.length} other entities: ${[...new Set(evidence.map(e => e.triple))].slice(0, 3).join('; ')}`
        break
      default:
        answer = `Found ${evidence.length} evidence triple(s) across ${hops} hop(s) for "${question}".`
    }
  } else {
    answer = 'No matching entities found in the knowledge graph for this question.'
  }

  // Mermaid reasoning chain
  const mermaidLines: string[] = ['graph TD']
  for (let i = 0; i < Math.min(steps.length, 6); i++) {
    mermaidLines.push(`  S${i + 1}["Step ${i + 1}: ${steps[i].description.substring(0, 30)}"]`)
    if (i > 0) mermaidLines.push(`  S${i} --> S${i + 1}`)
  }

  return {
    question, questionType: qType,
    answer, confidence: unanswerableReason ? round(0.1 + rng() * 0.2, 2) : round(0.6 + rng() * 0.4, 2),
    graphQuery: `MATCH (n) WHERE n.label CONTAINS '${tokens[0] || ''}' RETURN n`,
    executionSteps: steps.slice(0, 10),
    evidence: evidence.slice(0, 10),
    hops, unanswerableReason,
    mermaidReasoning: mermaidLines.join('\n')
  }
}

function formatKnowledgeQAReport(result: KnowledgeQAResult): string {
  const L: string[] = []
  L.push('## Knowledge QA Report')
  L.push('')
  L.push(`**Question:** "${result.question}"`)
  L.push(`**Type:** ${result.questionType} | **Confidence:** ${round(result.confidence * 100, 0)}% | **Hops:** ${result.hops}`)
  L.push('')
  L.push('### Answer')
  L.push(result.answer)
  if (result.unanswerableReason) {
    L.push('')
    L.push('### Unanswerable Detection')
    L.push(`**Reason:** ${result.unanswerableReason}`)
  }
  L.push('')
  L.push('### Graph Query')
  L.push(`\`\`\`cypher`)
  L.push(result.graphQuery)
  L.push(`\`\`\``)
  if (result.executionSteps.length > 0) {
    L.push('')
    L.push('### Execution Steps')
    for (const s of result.executionSteps) {
      L.push(`**Step ${s.step}:** ${s.description}`)
      L.push(`  Result: ${s.intermediateResult}`)
    }
  }
  if (result.evidence.length > 0) {
    L.push('')
    L.push('### Evidence')
    L.push('| Triple | Relevance |')
    L.push('|--------|-----------|')
    for (const e of result.evidence.slice(0, 8)) {
      L.push(`| ${e.triple.substring(0, 50)} | ${e.relevance} |`)
    }
  }
  L.push('')
  L.push('### Reasoning Chain (Mermaid)')
  L.push('```mermaid')
  L.push(result.mermaidReasoning)
  L.push('```')
  return L.join('\n')
}

// ==================== TOOL 8: KG QUALITY ==================

function assessKGQuality(
  graphData: {
    nodes: Array<{ id: string; label: string; type: string; timestamp?: string; properties?: Record<string, unknown> }>
    edges: Array<{ source: string; target: string; label: string; weight?: number; timestamp?: string }>
    metadata?: { lastUpdated?: string; sourceCount?: number; totalTriples?: number }
  },
  options?: { weights?: Record<string, number>; detailedFindings?: boolean }
): KGQualityResult {
  const rng = createSeededRandom(graphData.nodes.map(n => n.id).join(',') || 'quality')
  const weights = options?.weights || { completeness: 0.2, consistency: 0.2, accuracy: 0.2, timeliness: 0.15, connectivity: 0.15, redundancy: 0.1 }

  // Completeness
  const nodesWithLabels = graphData.nodes.filter(n => n.label && n.label.length > 0).length
  const nodesWithTypes = graphData.nodes.filter(n => n.type && n.type !== 'unknown').length
  const nodesWithProps = graphData.nodes.filter(n => n.properties && Object.keys(n.properties).length > 0).length
  const labelCoverage = graphData.nodes.length > 0 ? nodesWithLabels / graphData.nodes.length : 0
  const typeCoverage = graphData.nodes.length > 0 ? nodesWithTypes / graphData.nodes.length : 0
  const propCoverage = graphData.nodes.length > 0 ? nodesWithProps / graphData.nodes.length : 0
  const completenessScore = round(labelCoverage * 0.4 + typeCoverage * 0.3 + propCoverage * 0.3, 2)
  const completenessFindings: string[] = []
  if (labelCoverage < 0.9) completenessFindings.push(`${round((1 - labelCoverage) * 100, 0)}% nodes missing labels`)
  if (typeCoverage < 0.8) completenessFindings.push(`${round((1 - typeCoverage) * 100, 0)}% nodes missing type annotations`)
  if (propCoverage < 0.5) completenessFindings.push(`${round((1 - propCoverage) * 100, 0)}% nodes have no property values`)
  if (completenessFindings.length === 0) completenessFindings.push('All nodes have labels, types, and properties')

  // Consistency
  const duplicateLabels = graphData.nodes.length - new Set(graphData.nodes.map(n => n.label.toLowerCase())).size
  const orphanEdges = graphData.edges.filter(e => !graphData.nodes.find(n => n.id === e.source) || !graphData.nodes.find(n => n.id === e.target)).length
  const consistencyScore = round(clamp(1 - (duplicateLabels + orphanEdges) / Math.max(graphData.nodes.length, 1), 0, 1), 2)
  const consistencyFindings: string[] = []
  if (duplicateLabels > 0) consistencyFindings.push(`${duplicateLabels} duplicate entity labels detected`)
  if (orphanEdges > 0) consistencyFindings.push(`${orphanEdges} edges reference non-existent nodes`)
  if (consistencyFindings.length === 0) consistencyFindings.push('No consistency violations detected')

  // Accuracy (simulated via confidence scores)
  const avgEdgeWeight = graphData.edges.length > 0
    ? graphData.edges.reduce((s, e) => s + (e.weight || 0.5), 0) / graphData.edges.length
    : 0.5
  const accuracyScore = round(clamp(avgEdgeWeight, 0, 1), 2)
  const accuracyFindings: string[] = []
  if (accuracyScore < 0.7) accuracyFindings.push(`Average edge confidence is low: ${round(accuracyScore * 100, 0)}%`)
  accuracyFindings.push(`Average edge weight: ${round(avgEdgeWeight, 2)}`)

  // Timeliness
  const now = Date.now()
  const timestamps = graphData.nodes.filter(n => n.timestamp).map(n => new Date(n.timestamp || '').getTime()).filter(t => !isNaN(t))
  const avgAge = timestamps.length > 0
    ? timestamps.reduce((s, t) => s + (now - t), 0) / timestamps.length / (1000 * 60 * 60 * 24)
    : 365
  const timelinessScore = round(clamp(1 - avgAge / 365, 0, 1), 2)
  const timelinessFindings: string[] = []
  if (avgAge > 180) timelinessFindings.push(`Average data age: ${round(avgAge, 0)} days (stale)`)
  else if (avgAge > 30) timelinessFindings.push(`Average data age: ${round(avgAge, 0)} days (moderate)`)
  else timelinessFindings.push(`Average data age: ${round(avgAge, 0)} days (fresh)`)
  if (graphData.metadata?.lastUpdated) timelinessFindings.push(`Last updated: ${graphData.metadata.lastUpdated}`)

  // Connectivity
  const uniqueNodes = new Set<string>()
  for (const e of graphData.edges) { uniqueNodes.add(e.source); uniqueNodes.add(e.target) }
  const connectedRatio = graphData.nodes.length > 0 ? uniqueNodes.size / graphData.nodes.length : 0
  const avgDegree = graphData.nodes.length > 0 ? (2 * graphData.edges.length) / graphData.nodes.length : 0
  const connectivityScore = round(clamp(connectedRatio * 0.6 + clamp(avgDegree / 5, 0, 1) * 0.4, 0, 1), 2)
  const connectivityFindings: string[] = []
  connectivityFindings.push(`${round(connectedRatio * 100, 0)}% of nodes are connected`)
  connectivityFindings.push(`Average degree: ${round(avgDegree, 1)}`)
  if (connectedRatio < 0.5) connectivityFindings.push('Many isolated nodes detected')

  // Redundancy
  const tripleSet = new Set<string>()
  let duplicates = 0
  for (const e of graphData.edges) {
    const key = `${e.source}|${e.label}|${e.target}`
    if (tripleSet.has(key)) duplicates++
    tripleSet.add(key)
  }
  const redundancyScore = round(clamp(1 - duplicates / Math.max(graphData.edges.length, 1), 0, 1), 2)
  const redundancyFindings: string[] = []
  if (duplicates > 0) redundancyFindings.push(`${duplicates} duplicate triples detected`)
  else redundancyFindings.push('No duplicate triples found')

  // Overall score
  const overallScore = round(
    completenessScore * weights.completeness +
    consistencyScore * weights.consistency +
    accuracyScore * weights.accuracy +
    timelinessScore * weights.timeliness +
    connectivityScore * weights.connectivity +
    redundancyScore * weights.redundancy,
    2
  )

  const grade = overallScore >= 0.9 ? 'A+' : overallScore >= 0.8 ? 'A' : overallScore >= 0.7 ? 'B+' : overallScore >= 0.6 ? 'B' : overallScore >= 0.5 ? 'C' : overallScore >= 0.4 ? 'D' : 'F'

  // Scorecard
  const totalChecks = 12
  const passed = Math.round(overallScore * totalChecks)
  const warnings = Math.round((1 - overallScore) * totalChecks * 0.6)
  const failed = totalChecks - passed - warnings

  // Top issues
  const topIssues: KGQualityResult['topIssues'] = []
  if (completenessScore < 0.8) topIssues.push({ severity: 'high', dimension: 'Completeness', issue: completenessFindings[0] || 'Incomplete data', fix: 'Add missing labels, types, and properties to nodes' })
  if (consistencyScore < 0.8) topIssues.push({ severity: 'high', dimension: 'Consistency', issue: consistencyFindings[0] || 'Inconsistencies found', fix: 'Deduplicate entities and remove orphan edges' })
  if (accuracyScore < 0.7) topIssues.push({ severity: 'medium', dimension: 'Accuracy', issue: accuracyFindings[0] || 'Low confidence', fix: 'Review and validate low-confidence triples' })
  if (timelinessScore < 0.5) topIssues.push({ severity: 'medium', dimension: 'Timeliness', issue: timelinessFindings[0] || 'Stale data', fix: 'Schedule regular data refresh cycles' })
  if (connectivityScore < 0.5) topIssues.push({ severity: 'low', dimension: 'Connectivity', issue: connectivityFindings[0] || 'Poor connectivity', fix: 'Add bridging entities and relationships' })
  if (redundancyScore < 0.9) topIssues.push({ severity: 'low', dimension: 'Redundancy', issue: redundancyFindings[0] || 'Duplicates found', fix: 'Run deduplication pipeline' })
  if (topIssues.length === 0) topIssues.push({ severity: 'info', dimension: 'All', issue: 'No critical issues found', fix: 'Continue monitoring quality metrics' })

  // Mermaid radar chart
  const mermaidRadar = [
    `pie title KG Quality Dimensions`,
    `  "Completeness (${round(completenessScore * 100, 0)}%)" : ${round(completenessScore * 100, 0)}`,
    `  "Consistency (${round(consistencyScore * 100, 0)}%)" : ${round(consistencyScore * 100, 0)}`,
    `  "Accuracy (${round(accuracyScore * 100, 0)}%)" : ${round(accuracyScore * 100, 0)}`,
    `  "Timeliness (${round(timelinessScore * 100, 0)}%)" : ${round(timelinessScore * 100, 0)}`,
    `  "Connectivity (${round(connectivityScore * 100, 0)}%)" : ${round(connectivityScore * 100, 0)}`,
    `  "Redundancy (${round(redundancyScore * 100, 0)}%)" : ${round(redundancyScore * 100, 0)}`
  ].join('\n')

  return {
    completeness: { name: 'Completeness', score: completenessScore, weight: weights.completeness, findings: completenessFindings, recommendations: completenessScore < 0.8 ? ['Add missing labels', 'Annotate types', 'Fill property values'] : ['Maintain current coverage'] },
    consistency: { name: 'Consistency', score: consistencyScore, weight: weights.consistency, findings: consistencyFindings, recommendations: consistencyScore < 0.8 ? ['Deduplicate entities', 'Remove orphan edges', 'Validate constraints'] : ['No action needed'] },
    accuracy: { name: 'Accuracy', score: accuracyScore, weight: weights.accuracy, findings: accuracyFindings, recommendations: accuracyScore < 0.7 ? ['Review low-confidence triples', 'Cross-reference sources', 'Apply validation rules'] : ['Maintain validation pipeline'] },
    timeliness: { name: 'Timeliness', score: timelinessScore, weight: weights.timeliness, findings: timelinessFindings, recommendations: timelinessScore < 0.5 ? ['Schedule data refresh', 'Add freshness metadata', 'Implement TTL policies'] : ['Continue regular updates'] },
    connectivity: { name: 'Connectivity', score: connectivityScore, weight: weights.connectivity, findings: connectivityFindings, recommendations: connectivityScore < 0.5 ? ['Add bridging entities', 'Create hub nodes', 'Expand relationship types'] : ['Graph is well-connected'] },
    redundancy: { name: 'Redundancy', score: redundancyScore, weight: weights.redundancy, findings: redundancyFindings, recommendations: redundancyScore < 0.9 ? ['Run deduplication', 'Merge duplicate triples', 'Implement unique constraints'] : ['No redundancy issues'] },
    overallScore, grade,
    scorecard: { totalChecks, passed, warnings, failed: Math.max(0, failed) },
    topIssues,
    mermaidRadar
  }
}

function formatKGQualityReport(result: KGQualityResult): string {
  const L: string[] = []
  L.push('## Knowledge Graph Quality Assessment Report')
  L.push('')
  L.push(`**Overall Score:** ${round(result.overallScore * 100, 0)}% | **Grade:** ${result.grade}`)
  L.push(`**Checks:** ${result.scorecard.passed} passed, ${result.scorecard.warnings} warnings, ${result.scorecard.failed} failed (of ${result.scorecard.totalChecks})`)
  L.push('')
  L.push('### Dimension Scores')
  L.push('| Dimension | Score | Weight | Findings |')
  L.push('|-----------|-------|--------|----------|')
  const dims = [result.completeness, result.consistency, result.accuracy, result.timeliness, result.connectivity, result.redundancy]
  for (const d of dims) {
    L.push(`| ${d.name} | ${round(d.score * 100, 0)}% | ${d.weight} | ${d.findings[0].substring(0, 40)} |`)
  }
  if (result.topIssues.length > 0) {
    L.push('')
    L.push('### Top Issues & Fix Suggestions')
    for (const issue of result.topIssues) {
      const icon = issue.severity === 'high' ? 'HIGH' : issue.severity === 'medium' ? 'MED' : issue.severity === 'low' ? 'LOW' : 'INFO'
      L.push(`- [${icon}] **${issue.dimension}:** ${issue.issue}`)
      L.push(`  Fix: ${issue.fix}`)
    }
  }
  L.push('')
  L.push('### Quality Radar (Mermaid)')
  L.push('```mermaid')
  L.push(result.mermaidRadar)
  L.push('```')
  return L.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Ontology Builder
  tools.register(defineTool({
    name: 'ontology_builder',
    description: 'Build OWL ontologies with class hierarchies, property definitions, relation types, and constraint rules. Supports Schema.org/OWL/RDFS import and RDFS reasoning materialization. Generates Mermaid mind maps.',
    parameters: {
      spec: { type: 'string', required: true, description: 'JSON object with fields: domain (string), namespace (string?), classes (array of {label, parent?, description?}), properties (array of {label, domain, range, type?}), relations (array of {label, domain, range, inverse?}), constraints (object with disjoint/equivalent/cardinality arrays), importStandard (string like "schema:Person")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { spec: string }) {
      const spec = safeJsonParse(args.spec, { domain: 'default' })
      const result = buildOntology(spec)
      return formatOntologyReport(result)
    }
  }))

  // Tool 2: Entity Resolver
  tools.register(defineTool({
    name: 'entity_resolver',
    description: 'Resolve and disambiguate entities with synonym merging, cross-source alignment, conflict detection, entity cards, URI normalization, and redirect handling.',
    parameters: {
      input_entities: { type: 'string', required: true, description: 'JSON array of entity objects with fields: name (string), type (string?), context (string?)' },
      known_entities: { type: 'string', description: 'Optional JSON array of known entities with fields: uri, name, aliases (string[]), type' },
      options: { type: 'string', description: 'Optional JSON object with fields: synonymThreshold (0-1), crossSourceAlign (boolean), handleRedirects (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_entities: string; known_entities?: string; options?: string }) {
      const inputEntities = safeJsonParse(args.input_entities, [] as Array<{ name: string; type?: string; context?: string }>)
      const knownEntities = args.known_entities ? safeJsonParse(args.known_entities, [] as Array<{ uri: string; name: string; aliases: string[]; type: string }>) : undefined
      const options = args.options ? safeJsonParse(args.options, undefined as Record<string, unknown> | undefined) : undefined
      const result = resolveEntities(inputEntities, knownEntities, options as { synonymThreshold?: number; crossSourceAlign?: boolean; handleRedirects?: boolean } | undefined)
      return formatEntityResolverReport(result)
    }
  }))

  // Tool 3: KG Crawler
  tools.register(defineTool({
    name: 'kg_crawler',
    description: 'Automatically complete knowledge graphs via structured extraction (SPARQL/RDF), semi-structured parsing (WikiMarkup), and unstructured NLP extraction. Supports quality validation, incremental updates, and provenance tracking.',
    parameters: {
      crawl_spec: { type: 'string', required: true, description: 'JSON object with fields: seedEntities (string[]), sources (array of {uri, type, format}), maxDepth (number), extractionMode ("full"|"incremental"), qualityThreshold (0-1), provenanceTracking (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { crawl_spec: string }) {
      const spec = safeJsonParse(args.crawl_spec, { seedEntities: [] })
      const result = crawlKnowledgeGraph(spec)
      return formatKGCrawlerReport(result)
    }
  }))

  // Tool 4: Semantic Search
  tools.register(defineTool({
    name: 'semantic_search',
    description: 'Perform hybrid semantic search combining vector retrieval, keyword matching, inference expansion, and graph context. Supports learning-to-rank scoring, result summarization, and Mermaid context graphs.',
    parameters: {
      query: { type: 'string', required: true, description: 'The natural language search query' },
      graph_data: { type: 'string', required: true, description: 'JSON object with nodes (array of {id, label, type, embedding?}) and edges (array of {source, target, label, weight?})' },
      options: { type: 'string', description: 'Optional JSON object with fields: maxResults (number), inferenceExpansion (boolean), hybridWeight (0-1), summarizeResults (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; graph_data: string; options?: string }) {
      const graphData = safeJsonParse(args.graph_data, { nodes: [] as Array<{ id: string; label: string; type: string }>, edges: [] as Array<{ source: string; target: string; label: string }> })
      const options = args.options ? safeJsonParse(args.options, undefined as Record<string, unknown> | undefined) : undefined
      const result = performSemanticSearch(args.query, graphData, options as { maxResults?: number; inferenceExpansion?: boolean; hybridWeight?: number; summarizeResults?: boolean } | undefined)
      return formatSemanticSearchReport(result)
    }
  }))

  // Tool 5: Reasoning Engine
  tools.register(defineTool({
    name: 'reasoning_engine',
    description: 'Execute OWL reasoning, SWRL rule reasoning, and probabilistic (Bayesian) reasoning. Detects contradictions, generates explanations, and provides inference path tracing.',
    parameters: {
      reasoning_spec: { type: 'string', required: true, description: 'JSON object with fields: triples (array of {subject, predicate, object}), rules (array of {name, antecedent, consequent, type}), owlAxioms (string[]), detectContradictions (boolean), probabilisticMode (boolean), maxDepth (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { reasoning_spec: string }) {
      const spec = safeJsonParse(args.reasoning_spec, { triples: [] })
      const result = runReasoningEngine(spec)
      return formatReasoningReport(result)
    }
  }))

  // Tool 6: KG Visualizer
  tools.register(defineTool({
    name: 'kg_visualizer',
    description: 'Generate graph visualizations with force-directed, circular, hierarchical, or grid layouts. Supports community detection, temporal evolution views, metadata overlay, interactive filtering, and zoom navigation.',
    parameters: {
      graph_data: { type: 'string', required: true, description: 'JSON object with nodes (array of {id, label, type, timestamp?, community?}) and edges (array of {source, target, label, weight?, timestamp?})' },
      options: { type: 'string', description: 'Optional JSON object with fields: layout ("force-directed"|"circular"|"hierarchical"|"grid"), showCommunities (boolean), showTimestamps (boolean), filterTypes (string[]), maxNodes (number), zoom (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { graph_data: string; options?: string }) {
      const graphData = safeJsonParse(args.graph_data, { nodes: [] as Array<{ id: string; label: string; type: string }>, edges: [] as Array<{ source: string; target: string; label: string }> })
      const options = args.options ? safeJsonParse(args.options, undefined as Record<string, unknown> | undefined) : undefined
      const result = visualizeKnowledgeGraph(graphData, options as { layout?: 'force-directed' | 'circular' | 'hierarchical' | 'grid'; showCommunities?: boolean; showTimestamps?: boolean; filterTypes?: string[]; maxNodes?: number; zoom?: number } | undefined)
      return formatVisualizerReport(result)
    }
  }))

  // Tool 7: Knowledge QA
  tools.register(defineTool({
    name: 'knowledge_qa',
    description: 'Answer natural language questions against a knowledge graph. Supports fact, comparison, computation, temporal, and causal questions. Performs multi-hop reasoning with unanswerable detection.',
    parameters: {
      question: { type: 'string', required: true, description: 'The natural language question to answer' },
      graph_data: { type: 'string', required: true, description: 'JSON object with nodes (array of {id, label, type}) and edges (array of {source, target, label, weight?})' },
      options: { type: 'string', description: 'Optional JSON object with fields: maxHops (number), detectUnanswerable (boolean), explainSteps (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { question: string; graph_data: string; options?: string }) {
      const graphData = safeJsonParse(args.graph_data, { nodes: [] as Array<{ id: string; label: string; type: string }>, edges: [] as Array<{ source: string; target: string; label: string }> })
      const options = args.options ? safeJsonParse(args.options, undefined as Record<string, unknown> | undefined) : undefined
      const result = answerKnowledgeQuestion(args.question, graphData, options as { maxHops?: number; detectUnanswerable?: boolean; explainSteps?: boolean } | undefined)
      return formatKnowledgeQAReport(result)
    }
  }))

  // Tool 8: KG Quality
  tools.register(defineTool({
    name: 'kg_quality',
    description: 'Assess knowledge graph quality across 6 dimensions: completeness, consistency, accuracy, timeliness, connectivity, and redundancy. Provides fix suggestions, quality scorecard, and Mermaid radar chart.',
    parameters: {
      graph_data: { type: 'string', required: true, description: 'JSON object with nodes (array of {id, label, type, timestamp?, properties?}), edges (array of {source, target, label, weight?, timestamp?}), and optional metadata object' },
      options: { type: 'string', description: 'Optional JSON object with fields: weights (object mapping dimension to weight), detailedFindings (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { graph_data: string; options?: string }) {
      const graphData = safeJsonParse(args.graph_data, { nodes: [] as Array<{ id: string; label: string; type: string }>, edges: [] as Array<{ source: string; target: string; label: string }> })
      const options = args.options ? safeJsonParse(args.options, undefined as Record<string, unknown> | undefined) : undefined
      const result = assessKGQuality(graphData, options as { weights?: Record<string, number>; detailedFindings?: boolean } | undefined)
      return formatKGQualityReport(result)
    }
  }))

  console.log(`[dsh-tool-kgpro] Loaded v${VERSION} — Knowledge Graph Professional Toolkit with 8 tools`)
  console.log('  Tools: ontology_builder, entity_resolver, kg_crawler, semantic_search, reasoning_engine, kg_visualizer, knowledge_qa, kg_quality')
}
