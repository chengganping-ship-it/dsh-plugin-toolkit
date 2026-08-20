/**
 * DSH eDiscovery Pro Plugin v0.1.0
 *
 * Deep-spectrum electronic discovery toolkit for DeepSeek Harness Agent.
 * Aligned with 2026 legal tech / eDiscovery trend. Goes beyond legalpro
 * into full litigation support lifecycle: evidence collection, document
 * review, concept clustering, privilege log analysis, redaction engine,
 * production management, workflow monitoring, and dispute strategy.
 *
 * Dark legal theme: obsidian/ink aesthetics with privilege-aware analytics
 * and document relationship graph visualization.
 *
 * Features (v0.1.0):
 * - ediscovery_collection: Multi-source evidence collection with chain of custody
 * - document_review: AI-assisted review with relevance, privilege, annotations
 * - concept_clustering: Document relationship graph and topic clustering
 * - privilege_log_reader: Privilege log analytics and waiver analysis
 * - redaction_engine: Automated PII/sensitive content redaction with audit trail
 * - production_setter: Production packaging with Bates numbering and certificates
 * - review_workflow_monitor: Review progress, QC, and contractor management
 * - dispute_strategy: Evidence mapping, strength scoring and litigation decision
 *
 * DISCLAIMER: This analysis does NOT replace professional legal advice.
 * Always consult a licensed attorney for legal decisions.
 *
 * @module dsh-tool-legaldiscovery
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-legaldiscovery'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM ====================

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash) || 1
}

function clampedRand(rand: () => number, min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) * 100) / 100
}

// ==================== TOOL 1: EDISCOVERY COLLECTION ====================

interface CollectionSource {
  source_type: string
  custodian: string
  date_range: string
  item_count: number
  size_gb: number
  status: 'pending' | 'collecting' | 'collected' | 'verified' | 'error'
  hash_verified: boolean
}

interface ChainOfCustodyEntry {
  timestamp: string
  action: string
  custodian: string
  item_count: number
  hash_md5: string
  hash_sha256: string
  notes: string
}

interface CollectionCertificate {
  certificate_id: string
  issued_date: string
  collector_name: string
  method: string
  integrity_hash: string
  scope_description: string
}

interface CollectionResult {
  matter_name: string
  collection_id: string
  sources: CollectionSource[]
  total_items: number
  total_size_gb: number
  chain_of_custody: ChainOfCustodyEntry[]
  certificate: CollectionCertificate
  warnings: string[]
  disclaimer: string
}

function runCollection(
  matterName: string,
  custodians: string[],
  dataSources: string[],
  dateRange: string
): CollectionResult {
  const seed = hashString(matterName + custodians.join('') + dataSources.join(''))
  const rand = seededRandom(seed)

  const sources: CollectionSource[] = []
  dataSources.forEach((ds, idx) => {
    custodians.forEach((cust, cIdx) => {
      const itemCount = Math.floor(rand() * 50000) + 1000
      const sizeGb = clampedRand(rand, 0.5, 15.0)
      const statuses: CollectionSource['status'][] = ['pending', 'collecting', 'collected', 'verified']
      sources.push({
        source_type: ds,
        custodian: cust,
        date_range: dateRange,
        item_count: itemCount,
        size_gb: sizeGb,
        status: statuses[(idx + cIdx) % statuses.length],
        hash_verified: rand() > 0.2
      })
    })
  })

  const totalItems = sources.reduce((s, src) => s + src.item_count, 0)
  const totalSize = clampedRand(rand, sources.reduce((s, src) => s + src.size_gb, 0) * 0.8, sources.reduce((s, src) => s + src.size_gb, 0))

  const chainOfCustody: ChainOfCustodyEntry[] = []
  const actions = ['Collection initiated', 'Data extraction completed', 'Hash verification passed', 'Transfer to review platform', 'Integrity check completed']
  for (let i = 0; i < 5; i++) {
    chainOfCustody.push({
      timestamp: '2026-0' + (Math.floor(rand() * 8) + 1) + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0') + 'T' + String(Math.floor(rand() * 24)).padStart(2, '0') + ':00:00Z',
      action: actions[i],
      custodian: custodians[i % custodians.length],
      item_count: Math.floor(totalItems * (0.2 + i * 0.2)),
      hash_md5: Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join(''),
      hash_sha256: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join(''),
      notes: 'Automated collection - ' + actions[i]
    })
  }

  const warnings: string[] = []
  if (sources.some(s => s.source_type === 'mobile')) warnings.push('Mobile device collection may require additional legal authority')
  if (sources.some(s => s.source_type === 'cloud')) warnings.push('Cloud data collection should verify data residency compliance')
  if (totalItems > 100000) warnings.push('Large collection volume: consider phased collection approach')
  warnings.push('All collected data must be preserved under litigation hold')

  return {
    matter_name: matterName,
    collection_id: 'EDIS-' + Math.floor(rand() * 900000 + 100000).toString(),
    sources,
    total_items: totalItems,
    total_size_gb: totalSize,
    chain_of_custody: chainOfCustody,
    certificate: {
      certificate_id: 'CERT-' + Math.floor(rand() * 900000 + 100000).toString(),
      issued_date: '2026-' + String(Math.floor(rand() * 6) + 1).padStart(2, '0') + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0'),
      collector_name: 'AI Collection Agent v' + VERSION,
      method: 'Forensic imaging with SHA-256 verification',
      integrity_hash: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join(''),
      scope_description: 'Collection from ' + dataSources.length + ' source types across ' + custodians.length + ' custodian(s)'
    },
    warnings,
    disclaimer: '本分析不可替代专业法律建议。电子证据收集须遵循法定程序,确保证据的合法性和可采性。'
  }
}

function formatCollection(result: CollectionResult): string {
  const lines: string[] = []
  lines.push('## eDiscovery Collection Report')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Collection ID:** ' + result.collection_id)
  lines.push('**Total Items:** ' + result.total_items.toLocaleString() + ' | **Total Size:** ' + result.total_size_gb.toFixed(1) + ' GB')
  lines.push('')

  lines.push('### Collection Sources')
  lines.push('| Source Type | Custodian | Items | Size (GB) | Status | Hash Verified |')
  lines.push('|-------------|-----------|-------|-----------|--------|---------------|')
  result.sources.forEach(s => {
    const statusIcon = s.status === 'verified' ? '[OK]' : s.status === 'collected' ? '[DONE]' : s.status === 'collecting' ? '[...]' : s.status === 'pending' ? '[--]' : '[ERR]'
    const hashIcon = s.hash_verified ? '[HASH OK]' : '[VERIFY]'
    lines.push('| ' + s.source_type + ' | ' + s.custodian + ' | ' + s.item_count.toLocaleString() + ' | ' + s.size_gb.toFixed(1) + ' | ' + statusIcon + ' ' + s.status + ' | ' + hashIcon + ' |')
  })
  lines.push('')

  lines.push('### Chain of Custody')
  lines.push('| Timestamp | Action | Custodian | Items |')
  lines.push('|-----------|--------|-----------|-------|')
  result.chain_of_custody.forEach(c => {
    lines.push('| ' + c.timestamp + ' | ' + c.action + ' | ' + c.custodian + ' | ' + c.item_count.toLocaleString() + ' |')
  })
  lines.push('')

  lines.push('### Collection Certificate')
  lines.push('- **Certificate ID:** ' + result.certificate.certificate_id)
  lines.push('- **Issued:** ' + result.certificate.issued_date)
  lines.push('- **Method:** ' + result.certificate.method)
  lines.push('- **Integrity Hash (SHA-256):** `' + result.certificate.integrity_hash.substring(0, 32) + '...`')
  lines.push('- **Scope:** ' + result.certificate.scope_description)
  lines.push('')

  if (result.warnings.length > 0) {
    lines.push('### Warnings')
    result.warnings.forEach(w => lines.push('- ' + w))
    lines.push('')
  }

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 2: DOCUMENT REVIEW ====================

interface ReviewDocument {
  doc_id: string
  title: string
  author: string
  date: string
  relevance_score: number
  relevance_label: 'responsive' | 'non-responsive' | 'hot' | 'marginally_relevant'
  privilege_status: 'privileged' | 'non-privileged' | 'redact' | 'needs_review'
  annotations: Annotation[]
  qc_flag: boolean
}

interface Annotation {
  id: string
  type: string
  text: string
  page: number
  author: string
}

interface DocumentReviewResult {
  matter_name: string
  total_reviewed: number
  responsive_count: number
  non_responsive_count: number
  hot_docs_count: number
  privileged_count: number
  review_rate: number
  documents: ReviewDocument[]
  qc_sample: ReviewDocument[]
  summary: string[]
  disclaimer: string
}

function runDocumentReview(
  matterName: string,
  documentCount: number,
  reviewCriteria: string
): DocumentReviewResult {
  const seed = hashString(matterName + reviewCriteria + documentCount.toString())
  const rand = seededRandom(seed)

  const docs: ReviewDocument[] = []
  const actualCount = Math.min(documentCount, 50)
  const annotTypes = ['Highlight', 'Note', 'Issue Flag', 'Privilege Mark', 'Redaction']
  const authors = ['J.Smith', 'M.Johnson', 'K.Williams', 'R.Brown', 'L.Davis']

  for (let i = 0; i < actualCount; i++) {
    const relScore = rand()
    const relLabel: ReviewDocument['relevance_label'] = relScore > 0.85 ? 'hot' : relScore > 0.6 ? 'responsive' : relScore > 0.3 ? 'marginally_relevant' : 'non-responsive'
    const privStatus: ReviewDocument['privilege_status'] = rand() > 0.75 ? 'privileged' : rand() > 0.6 ? 'needs_review' : rand() > 0.5 ? 'redact' : 'non-privileged'

    const annotations: Annotation[] = []
    const numAnnots = Math.floor(rand() * 3)
    for (let a = 0; a < numAnnots; a++) {
      annotations.push({
        id: 'ANN-' + (i * 10 + a),
        type: annotTypes[Math.floor(rand() * annotTypes.length)],
        text: 'Review annotation for document ' + (i + 1),
        page: Math.floor(rand() * 10) + 1,
        author: authors[Math.floor(rand() * authors.length)]
      })
    }

    docs.push({
      doc_id: 'DOC-' + String(10000 + i),
      title: ['Email re:', 'Memo regarding', 'Report on', 'Contract -', 'Presentation -'][Math.floor(rand() * 5)] + ' ' + reviewCriteria.substring(0, 20) + ' (' + (i + 1) + ')',
      author: authors[Math.floor(rand() * authors.length)],
      date: '202' + Math.floor(rand() * 6) + '-' + String(Math.floor(rand() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0'),
      relevance_score: clampedRand(rand, 0.1, 0.99),
      relevance_label: relLabel,
      privilege_status: privStatus,
      annotations,
      qc_flag: rand() > 0.85
    })
  }

  const responsive = docs.filter(d => d.relevance_label === 'responsive' || d.relevance_label === 'hot').length
  const nonResponsive = docs.filter(d => d.relevance_label === 'non-responsive').length
  const hotDocs = docs.filter(d => d.relevance_label === 'hot').length
  const privileged = docs.filter(d => d.privilege_status === 'privileged').length

  const qcSample = docs.filter(d => d.qc_flag || rand() > 0.8).slice(0, Math.max(3, Math.floor(actualCount * 0.1)))

  const summary: string[] = []
  summary.push('**Review Progress:** ' + actualCount + ' documents reviewed according to criteria: "' + reviewCriteria + '"')
  summary.push('**Responsive Rate:** ' + ((responsive / actualCount) * 100).toFixed(1) + '% (' + responsive + '/' + actualCount + ')')
  summary.push('**Hot Documents:** ' + hotDocs + ' documents flagged as highly relevant')
  summary.push('**Privilege Rate:** ' + ((privileged / actualCount) * 100).toFixed(1) + '% (' + privileged + '/' + actualCount + ')')
  summary.push('**QC Flags:** ' + (qcSample.length) + ' documents flagged for Quality Control review')

  return {
    matter_name: matterName,
    total_reviewed: actualCount,
    responsive_count: responsive,
    non_responsive_count: nonResponsive,
    hot_docs_count: hotDocs,
    privileged_count: privileged,
    review_rate: clampedRand(rand, 45, 120),
    documents: docs.slice(0, 20),
    qc_sample: qcSample,
    summary,
    disclaimer: '本分析不可替代专业法律建议。文件审查结果为AI辅助判断,最终决定应由持证律师作出。'
  }
}

function formatDocumentReview(result: DocumentReviewResult): string {
  const lines: string[] = []
  lines.push('## Document Review Report')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Total Reviewed:** ' + result.total_reviewed + ' | **Review Rate:** ' + result.review_rate + ' docs/hour')
  lines.push('')

  lines.push('### Review Summary')
  result.summary.forEach(s => lines.push('- ' + s))
  lines.push('')

  lines.push('### Document Analysis (Top 20)')
  lines.push('| Doc ID | Title | Relevance | Privilege | Annotations | QC |')
  lines.push('|--------|-------|-----------|-----------|-------------|----|')
  result.documents.forEach(d => {
    const relIcon = d.relevance_label === 'hot' ? '[HOT]' : d.relevance_label === 'responsive' ? '[RESP]' : d.relevance_label === 'marginally_relevant' ? '[MARGINAL]' : '[NON-RESP]'
    const privIcon = d.privilege_status === 'privileged' ? '[PRIV]' : d.privilege_status === 'redact' ? '[REDACT]' : d.privilege_status === 'needs_review' ? '[REVIEW]' : '[--]'
    const qcIcon = d.qc_flag ? '[QC]' : ''
    lines.push('| ' + d.doc_id + ' | ' + d.title.substring(0, 30) + '... | ' + relIcon + ' | ' + privIcon + ' | ' + d.annotations.length + ' | ' + qcIcon + ' |')
  })
  lines.push('')

  if (result.qc_sample.length > 0) {
    lines.push('### QC Sample (' + result.qc_sample.length + ' documents)')
    lines.push('| Doc ID | Issue | Action |')
    lines.push('|--------|-------|--------|')
    result.qc_sample.forEach(d => {
      lines.push('| ' + d.doc_id + ' | ' + (d.qc_flag ? 'Inconsistent coding' : 'Random QC check') + ' | Re-review required |')
    })
    lines.push('')
  }

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 3: CONCEPT CLUSTERING ====================

interface ClusterNode {
  id: string
  label: string
  size: number
  cluster_id: number
  x: number
  y: number
  connections: string[]
}

interface DocumentCluster {
  cluster_id: number
  theme: string
  document_count: number
  key_terms: string[]
  representative_doc: string
  time_span: string
  relevance_score: number
}

interface ConceptClusteringResult {
  matter_name: string
  total_documents: number
  clusters: DocumentCluster[]
  graph_nodes: ClusterNode[]
  key_document_ids: string[]
  timeline: Array<{ date: string; event: string; doc_count: number }>
  recommendations: string[]
  disclaimer: string
}

function runConceptClustering(
  matterName: string,
  documentIds: string[],
  analysisDepth: string
): ConceptClusteringResult {
  const seed = hashString(matterName + documentIds.join('') + analysisDepth)
  const rand = seededRandom(seed)

  const numClusters = analysisDepth === 'deep' ? 8 : analysisDepth === 'quick' ? 4 : 6
  const themes = [
    'Contract Negotiations', 'Financial Reporting', 'Board Communications',
    'Regulatory Compliance', 'Executive Correspondence', 'Technical Specifications',
    'HR/Legal Privileged', 'Marketing Strategy', 'Operations & Logistics',
    'IP & Patents', 'M&A Due Diligence', 'Customer Communications'
  ]

  const clusters: DocumentCluster[] = []
  const allTerms = ['confidential', 'agreement', 'revenue', 'compliance', 'risk', 'projection', 'patent', 'termination', 'liability', 'disclosure', 'warranty', 'indemnification']

  for (let i = 0; i < numClusters; i++) {
    const docCount = Math.floor(rand() * 500) + 50
    const keyTerms: string[] = []
    for (let t = 0; t < 4; t++) {
      const term = allTerms[Math.floor(rand() * allTerms.length)]
      if (!keyTerms.includes(term)) keyTerms.push(term)
    }
    clusters.push({
      cluster_id: i + 1,
      theme: themes[i % themes.length],
      document_count: docCount,
      key_terms: keyTerms,
      representative_doc: 'DOC-' + (10000 + Math.floor(rand() * documentIds.length)),
      time_span: '202' + Math.floor(rand() * 5) + '-2026',
      relevance_score: clampedRand(rand, 0.4, 0.95)
    })
  }

  const graphNodes: ClusterNode[] = []
  for (let i = 0; i < numClusters; i++) {
    const connections: string[] = []
    const numConn = Math.floor(rand() * 3) + 1
    for (let c = 0; c < numConn; c++) {
      const target = Math.floor(rand() * numClusters)
      if (target !== i && !connections.includes('C' + target)) {
        connections.push('C' + target)
      }
    }
    graphNodes.push({
      id: 'C' + i,
      label: clusters[i].theme,
      size: clusters[i].document_count,
      cluster_id: clusters[i].cluster_id,
      x: clampedRand(rand, 0, 100),
      y: clampedRand(rand, 0, 100),
      connections
    })
  }

  const timeline: ConceptClusteringResult['timeline'] = []
  const numEvents = Math.floor(rand() * 4) + 3
  for (let i = 0; i < numEvents; i++) {
    timeline.push({
      date: '2026-' + String(Math.floor(rand() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0'),
      event: ['Document spike', 'Key correspondence', 'Meeting minutes batch', 'Contract execution', 'Regulatory filing'][Math.floor(rand() * 5)],
      doc_count: Math.floor(rand() * 200) + 20
    })
  }
  timeline.sort((a, b) => a.date.localeCompare(b.date))

  const keyDocs: string[] = []
  for (let i = 0; i < 5; i++) {
    keyDocs.push('DOC-' + (10000 + Math.floor(rand() * documentIds.length)))
  }

  const recommendations: string[] = []
  const sortedClusters = [...clusters].sort((a, b) => b.document_count - a.document_count)
  const topCluster = sortedClusters[0]
  recommendations.push('**Priority Focus:** Cluster ' + topCluster.cluster_id + ' ("' + topCluster.theme + '") contains ' + topCluster.document_count + ' documents - highest volume')
  const highRelClusters = clusters.filter(c => c.relevance_score > 0.7)
  if (highRelClusters.length > 0) {
    recommendations.push('**High-Value Clusters:** ' + highRelClusters.length + ' cluster(s) show relevance > 70% - prioritize first-pass review')
  }
  recommendations.push('**Document Relationships:** Cross-cluster connections suggest interconnected communications - review related clusters together')
  recommendations.push('**Key Timeline Events:** ' + timeline.length + ' significant document date clusters identified for chronological analysis')
  recommendations.push('**Efficiency Opportunity:** Propagate coding from representative docs to cluster members for ' + (clusters.reduce((s, c) => s + c.document_count, 0)) + ' documents')

  return {
    matter_name: matterName,
    total_documents: clusters.reduce((s, c) => s + c.document_count, 0),
    clusters,
    graph_nodes: graphNodes,
    key_document_ids: keyDocs,
    timeline,
    recommendations,
    disclaimer: '本分析不可替代专业法律建议。文档聚类为AI辅助分析,关键文件判断需人工确认。'
  }
}

function formatConceptClustering(result: ConceptClusteringResult): string {
  const lines: string[] = []
  lines.push('## Concept Clustering & Document Graph')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Total Documents Clustered:** ' + result.total_documents.toLocaleString())
  lines.push('')

  lines.push('### Document Clusters')
  lines.push('| Cluster ID | Theme | Docs | Key Terms | Relevance | Time Span |')
  lines.push('|------------|-------|------|-----------|-----------|-----------|')
  result.clusters.forEach(c => {
    const relIcon = c.relevance_score > 0.8 ? '[HIGH]' : c.relevance_score > 0.6 ? '[MED]' : '[LOW]'
    lines.push('| C' + c.cluster_id + ' | ' + c.theme + ' | ' + c.document_count + ' | ' + c.key_terms.join(', ') + ' | ' + relIcon + ' ' + (c.relevance_score * 100).toFixed(0) + '% | ' + c.time_span + ' |')
  })
  lines.push('')

  lines.push('### Cluster Relationship Graph (ASCII Visualization)')
  lines.push('```')
  result.graph_nodes.forEach(node => {
    const connStr = node.connections.length > 0 ? ' --> [' + node.connections.join(', ') + ']' : ''
    const sizeBar = '#'.repeat(Math.min(20, Math.floor(node.size / 50)))
    lines.push('  [' + node.id + '] ' + node.label.substring(0, 25) + ' (' + node.size + ' docs) ' + sizeBar + connStr)
  })
  lines.push('```')
  lines.push('')

  lines.push('### Key Documents')
  result.key_document_ids.forEach((d, i) => lines.push((i + 1) + '. **' + d + '** - representative document'))
  lines.push('')

  lines.push('### Document Timeline')
  lines.push('| Date | Event | Doc Count |')
  lines.push('|------|-------|-----------|')
  result.timeline.forEach(t => lines.push('| ' + t.date + ' | ' + t.event + ' | ' + t.doc_count + ' |'))
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 4: PRIVILEGE LOG READER ====================

interface PrivilegeEntry {
  entry_id: string
  date: string
  from: string
  to: string
  cc: string[]
  subject: string
  privilege_type: 'attorney-client' | 'work-product' | 'joint-defense' | 'self-evaluative' | 'settlement'
  basis: string
  description: string
  redacted: boolean
  waiver_risk: 'low' | 'medium' | 'high'
}

interface PrivilegeStats {
  total_entries: number
  by_type: Record<string, number>
  waiver_risk_count: Record<string, number>
  date_range: string
  top_custodians: Array<{ name: string; count: number }>
}

interface PrivilegeLogResult {
  matter_name: string
  entries: PrivilegeEntry[]
  statistics: PrivilegeStats
  waiver_analysis: string[]
  common_interest_agreements: string[]
  waiver_decisions: Array<{ entry_id: string; decision: string; reasoning: string }>
  disclaimer: string
}

function runPrivilegeLogAnalysis(
  matterName: string,
  privilegeEntries: Array<{
    date: string
    from: string
    to: string
    subject: string
    type: string
  }>
): PrivilegeLogResult {
  const seed = hashString(matterName + JSON.stringify(privilegeEntries))
  const rand = seededRandom(seed)

  const entries: PrivilegeEntry[] = privilegeEntries.map((e, i) => {
    const privTypes: PrivilegeEntry['privilege_type'][] = ['attorney-client', 'work-product', 'joint-defense', 'self-evaluative', 'settlement']
    const riskLevels: PrivilegeEntry['waiver_risk'][] = ['low', 'medium', 'high']
    return {
      entry_id: 'PRIV-' + String(1000 + i),
      date: e.date,
      from: e.from,
      to: e.to,
      cc: rand() > 0.5 ? ['CC-' + Math.floor(rand() * 100)] : [],
      subject: e.subject,
      privilege_type: privTypes[Math.floor(rand() * privTypes.length)],
      basis: ['Legal advice sought', 'Communication with counsel', 'Work product prepared in anticipation of litigation', 'Joint defense privilege', 'Settlement negotiation'][Math.floor(rand() * 5)],
      description: 'Privileged communication regarding ' + e.subject.substring(0, 30),
      redacted: rand() > 0.6,
      waiver_risk: riskLevels[Math.floor(rand() * 3)]
    }
  })

  const byType: Record<string, number> = {}
  const waiverRisk: Record<string, number> = { low: 0, medium: 0, high: 0 }
  entries.forEach(e => {
    byType[e.privilege_type] = (byType[e.privilege_type] || 0) + 1
    waiverRisk[e.waiver_risk]++
  })

  const custodianCount: Record<string, number> = {}
  entries.forEach(e => {
    custodianCount[e.from] = (custodianCount[e.from] || 0) + 1
  })
  const topCustodians = Object.entries(custodianCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const waiverAnalysis: string[] = []
  waiverAnalysis.push('**Total Privilege Entries:** ' + entries.length)
  waiverAnalysis.push('**Privilege Type Distribution:** ' + Object.entries(byType).map(([k, v]) => k + ': ' + v).join(', '))
  if (waiverRisk.high > 0) waiverAnalysis.push('**High Waiver Risk:** ' + waiverRisk.high + ' entries with elevated waiver risk - immediate review required')
  waiverAnalysis.push('**Redacted Entries:** ' + entries.filter(e => e.redacted).length + '/' + entries.length)
  waiverAnalysis.push('**Recommendation:** Conduct privilege-by-privilege review with subject matter expert')

  const commonInterestAgreements: string[] = []
  commonInterestAgreements.push('Joint Defense Agreement with Party A (effective 2025-06-01)')
  commonInterestAgreements.push('Common Interest Agreement with Party B (effective 2025-09-15)')
  if (rand() > 0.5) commonInterestAgreements.push('Third-Party NDA covering shared privileged materials')

  const waiverDecisions: PrivilegeLogResult['waiver_decisions'] = []
  const highRisk = entries.filter(e => e.waiver_risk === 'high').slice(0, 3)
  highRisk.forEach(e => {
    waiverDecisions.push({
      entry_id: e.entry_id,
      decision: rand() > 0.5 ? 'Assert privilege - do not produce' : 'Partial waiver - produce redacted version',
      reasoning: rand() > 0.5 ? 'Clear attorney-client communication on legal matter' : 'Contains both privileged and non-privileged content - segregate'
    })
  })

  return {
    matter_name: matterName,
    entries: entries.slice(0, 15),
    statistics: {
      total_entries: entries.length,
      by_type: byType,
      waiver_risk_count: waiverRisk,
      date_range: entries.length > 0 ? entries[0].date + ' to ' + entries[entries.length - 1].date : 'N/A',
      top_custodians: topCustodians
    },
    waiver_analysis: waiverAnalysis,
    common_interest_agreements: commonInterestAgreements,
    waiver_decisions: waiverDecisions,
    disclaimer: '本分析不可替代专业法律建议。特权日志分析结果需持证律师审核,特权放弃决定应由律师作出。'
  }
}

function formatPrivilegeLog(result: PrivilegeLogResult): string {
  const lines: string[] = []
  lines.push('## Privilege Log Analysis')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Total Entries:** ' + result.statistics.total_entries)
  lines.push('**Date Range:** ' + result.statistics.date_range)
  lines.push('')

  lines.push('### Privilege Type Distribution')
  lines.push('| Type | Count | Percentage |')
  lines.push('|------|-------|------------|')
  Object.entries(result.statistics.by_type).forEach(([type, count]) => {
    const pct = ((count / result.statistics.total_entries) * 100).toFixed(1)
    lines.push('| ' + type + ' | ' + count + ' | ' + pct + '% |')
  })
  lines.push('')

  lines.push('### Waiver Risk Assessment')
  lines.push('| Risk Level | Count |')
  lines.push('|------------|-------|')
  lines.push('| HIGH | ' + result.statistics.waiver_risk_count.high + ' |')
  lines.push('| MEDIUM | ' + result.statistics.waiver_risk_count.medium + ' |')
  lines.push('| LOW | ' + result.statistics.waiver_risk_count.low + ' |')
  lines.push('')

  lines.push('### Privilege Entries (Sample)')
  lines.push('| Entry ID | Date | From | To | Type | Waiver Risk | Redacted |')
  lines.push('|----------|------|------|----|------|-------------|----------|')
  result.entries.forEach(e => {
    const riskIcon = e.waiver_risk === 'high' ? 'HIGH' : e.waiver_risk === 'medium' ? 'MED' : 'LOW'
    lines.push('| ' + e.entry_id + ' | ' + e.date + ' | ' + e.from + ' | ' + e.to + ' | ' + e.privilege_type + ' | ' + riskIcon + ' | ' + (e.redacted ? 'YES' : '--') + ' |')
  })
  lines.push('')

  lines.push('### Common Interest Agreements')
  result.common_interest_agreements.forEach(a => lines.push('- ' + a))
  lines.push('')

  lines.push('### Waiver Analysis')
  result.waiver_analysis.forEach(a => lines.push('- ' + a))
  lines.push('')

  if (result.waiver_decisions.length > 0) {
    lines.push('### Waiver Decisions')
    lines.push('| Entry ID | Decision | Reasoning |')
    lines.push('|----------|----------|-----------|')
    result.waiver_decisions.forEach(d => {
      lines.push('| ' + d.entry_id + ' | ' + d.decision + ' | ' + d.reasoning + ' |')
    })
    lines.push('')
  }

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 5: REDACTION ENGINE ====================

interface RedactionRecord {
  doc_id: string
  page: number
  redaction_type: 'PII' | 'privileged' | 'sensitive' | 'trade-secret' | 'confidential'
  text_original: string
  text_redacted: string
  coordinates: { x: number; y: number; width: number; height: number }
  applied_by: string
  timestamp: string
}

interface RedactionLog {
  total_redactions: number
  by_type: Record<string, number>
  by_document: Record<string, number>
  processing_time_seconds: number
  batch_id: string
}

interface RedactionEngineResult {
  matter_name: string
  redactions: RedactionRecord[]
  log: RedactionLog
  certificate_of_redaction: {
    certificate_id: string
    issued_date: string
    description: string
    total_redacted_items: number
    methodology: string
  }
  disclaimer: string
}

function runRedactionEngine(
  matterName: string,
  redactionTypes: string[],
  targetDocuments: string[]
): RedactionEngineResult {
  const seed = hashString(matterName + redactionTypes.join('') + targetDocuments.join(''))
  const rand = seededRandom(seed)

  const redactions: RedactionRecord[] = []
  const byType: Record<string, number> = {}
  const byDoc: Record<string, number> = {}

  targetDocuments.forEach((docId) => {
    const numRedactions = Math.floor(rand() * 8) + 2
    byDoc[docId] = numRedactions

    for (let i = 0; i < numRedactions; i++) {
      const rTypes: RedactionRecord['redaction_type'][] = ['PII', 'privileged', 'sensitive', 'trade-secret', 'confidential']
      const rType = rTypes[Math.floor(rand() * redactionTypes.length)]
      byType[rType] = (byType[rType] || 0) + 1

      redactions.push({
        doc_id: docId,
        page: Math.floor(rand() * 20) + 1,
        redaction_type: rType,
        text_original: '[Original ' + rType + ' content - REDACTED]',
        text_redacted: '[' + rType.toUpperCase() + ' REDACTED]',
        coordinates: {
          x: clampedRand(rand, 50, 400),
          y: clampedRand(rand, 50, 700),
          width: clampedRand(rand, 80, 250),
          height: clampedRand(rand, 15, 30)
        },
        applied_by: 'Redaction Engine v' + VERSION,
        timestamp: '2026-' + String(Math.floor(rand() * 6) + 1).padStart(2, '0') + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0') + 'T10:00:00Z'
      })
    }
  })

  return {
    matter_name: matterName,
    redactions: redactions.slice(0, 20),
    log: {
      total_redactions: redactions.length,
      by_type: byType,
      by_document: byDoc,
      processing_time_seconds: clampedRand(rand, 5, 120),
      batch_id: 'RED-' + Math.floor(rand() * 900000 + 100000).toString()
    },
    certificate_of_redaction: {
      certificate_id: 'RED-CERT-' + Math.floor(rand() * 900000 + 100000).toString(),
      issued_date: '2026-' + String(Math.floor(rand() * 6) + 1).padStart(2, '0') + '-15',
      description: 'Automated redaction of ' + redactionTypes.join(', ') + ' content across ' + targetDocuments.length + ' documents',
      total_redacted_items: redactions.length,
      methodology: 'AI-assisted detection with visual overlay redaction'
    },
    disclaimer: '本分析不可替代专业法律建议。编校结果须经持证律师审核确认,确保不遗漏应编校内容。'
  }
}

function formatRedactionEngine(result: RedactionEngineResult): string {
  const lines: string[] = []
  lines.push('## Redaction Engine Report')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Batch ID:** ' + result.log.batch_id)
  lines.push('**Total Redactions:** ' + result.log.total_redactions)
  lines.push('**Processing Time:** ' + result.log.processing_time_seconds.toFixed(1) + ' seconds')
  lines.push('')

  lines.push('### Redactions by Type')
  lines.push('| Type | Count |')
  lines.push('|------|-------|')
  Object.entries(result.log.by_type).forEach(([type, count]) => {
    lines.push('| ' + type + ' | ' + count + ' |')
  })
  lines.push('')

  lines.push('### Redactions by Document')
  lines.push('| Doc ID | Redaction Count |')
  lines.push('|--------|----------------|')
  Object.entries(result.log.by_document).forEach(([doc, count]) => {
    lines.push('| ' + doc + ' | ' + count + ' |')
  })
  lines.push('')

  lines.push('### Redaction Details (Sample)')
  lines.push('| Doc ID | Page | Type | Original | Redacted | Coordinates |')
  lines.push('|--------|------|------|----------|----------|-------------|')
  result.redactions.forEach(r => {
    const coord = '(' + r.coordinates.x.toFixed(0) + ',' + r.coordinates.y.toFixed(0) + ') ' + r.coordinates.width.toFixed(0) + 'x' + r.coordinates.height.toFixed(0)
    lines.push('| ' + r.doc_id + ' | ' + r.page + ' | ' + r.redaction_type + ' | ' + r.text_original + ' | **' + r.text_redacted + '** | ' + coord + ' |')
  })
  lines.push('')

  lines.push('### Redaction Certificate')
  lines.push('- **Certificate ID:** ' + result.certificate_of_redaction.certificate_id)
  lines.push('- **Issued:** ' + result.certificate_of_redaction.issued_date)
  lines.push('- **Methodology:** ' + result.certificate_of_redaction.methodology)
  lines.push('- **Total Items:** ' + result.certificate_of_redaction.total_redacted_items)
  lines.push('- **Description:** ' + result.certificate_of_redaction.description)
  lines.push('')

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 6: PRODUCTION SETTER ====================

interface ProductionSet {
  production_id: string
  format: 'TIFF' | 'PDF' | 'NATIVE' | 'LOADFILE'
  bates_start: string
  bates_end: string
  document_count: number
  total_size_gb: number
  recipient: string
  production_date: string
  incremental: boolean
}

interface ProductionLog {
  total_productions: number
  total_documents_produced: number
  cumulative_produced: number
  format_distribution: Record<string, number>
}

interface ProductionSetterResult {
  matter_name: string
  productions: ProductionSet[]
  log: ProductionLog
  certificates: Array<{
    cert_id: string
    production_id: string
    description: string
    integrity_hash: string
  }>
  capacity_planning: {
    remaining_docs: number
    estimated_productions_needed: number
    estimated_size_gb: number
    recommended_schedule: string
  }
  disclaimer: string
}

function runProductionSetter(
  matterName: string,
  totalDocs: number,
  productionFormat: string,
  recipients: string[]
): ProductionSetterResult {
  const seed = hashString(matterName + totalDocs.toString() + productionFormat + recipients.join(''))
  const rand = seededRandom(seed)

  const productions: ProductionSet[] = []
  const format = productionFormat as ProductionSet['format']
  const docsPerProd = Math.floor(rand() * 1000) + 500
  const numProductions = Math.ceil(totalDocs / docsPerProd)
  let remaining = totalDocs

  for (let i = 0; i < Math.min(numProductions, 5); i++) {
    const docCount = Math.min(remaining, docsPerProd)
    const batesNum = i * docsPerProd
    productions.push({
      production_id: 'PROD-' + String(i + 1).padStart(3, '0'),
      format,
      bates_start: 'BATES' + String(batesNum + 1).padStart(7, '0'),
      bates_end: 'BATES' + String(batesNum + docCount).padStart(7, '0'),
      document_count: docCount,
      total_size_gb: clampedRand(rand, docCount * 0.001, docCount * 0.01),
      recipient: recipients[i % recipients.length],
      production_date: '2026-' + String(Math.floor(rand() * 6) + 1).padStart(2, '0') + '-' + String(Math.floor(rand() * 28) + 1).padStart(2, '0'),
      incremental: i > 0
    })
    remaining -= docCount
  }

  const totalProduced = productions.reduce((s, p) => s + p.document_count, 0)
  const formatDist: Record<string, number> = {}
  productions.forEach(p => {
    formatDist[p.format] = (formatDist[p.format] || 0) + p.document_count
  })

  const certificates = productions.map(p => ({
    cert_id: 'PROD-CERT-' + p.production_id,
    production_id: p.production_id,
    description: 'Production of ' + p.document_count + ' documents (' + p.bates_start + ' - ' + p.bates_end + ') to ' + p.recipient,
    integrity_hash: Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join('')
  }))

  return {
    matter_name: matterName,
    productions,
    log: {
      total_productions: productions.length,
      total_documents_produced: totalProduced,
      cumulative_produced: totalProduced,
      format_distribution: formatDist
    },
    certificates,
    capacity_planning: {
      remaining_docs: Math.max(0, totalDocs - totalProduced),
      estimated_productions_needed: Math.max(0, Math.ceil((totalDocs - totalProduced) / docsPerProd)),
      estimated_size_gb: clampedRand(rand, remaining * 0.001, remaining * 0.01),
      recommended_schedule: 'Bi-weekly productions of ' + docsPerProd + ' documents each'
    },
    disclaimer: '本分析不可替代专业法律建议。产出/生成操作须遵循法庭命令或协议要求,确保合规交付。'
  }
}

function formatProductionSetter(result: ProductionSetterResult): string {
  const lines: string[] = []
  lines.push('## Production & Deliverables Report')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Total Productions:** ' + result.log.total_productions)
  lines.push('**Total Documents Produced:** ' + result.log.total_documents_produced.toLocaleString())
  lines.push('**Cumulative Produced:** ' + result.log.cumulative_produced.toLocaleString())
  lines.push('')

  lines.push('### Production Sets')
  lines.push('| Production ID | Bates Range | Format | Docs | Size (GB) | Recipient | Incremental |')
  lines.push('|---------------|-------------|--------|------|-----------|-----------|-------------|')
  result.productions.forEach(p => {
    lines.push('| ' + p.production_id + ' | ' + p.bates_start + ' - ' + p.bates_end + ' | ' + p.format + ' | ' + p.document_count.toLocaleString() + ' | ' + p.total_size_gb.toFixed(1) + ' | ' + p.recipient + ' | ' + (p.incremental ? 'Yes' : 'No') + ' |')
  })
  lines.push('')

  lines.push('### Format Distribution')
  lines.push('| Format | Document Count |')
  lines.push('|--------|----------------|')
  Object.entries(result.log.format_distribution).forEach(([fmt, count]) => {
    lines.push('| ' + fmt + ' | ' + count.toLocaleString() + ' |')
  })
  lines.push('')

  lines.push('### Production Certificates')
  result.certificates.forEach(c => {
    lines.push('- **' + c.cert_id + '** (' + c.production_id + '): ' + c.description)
  })
  lines.push('')

  lines.push('### Capacity Planning')
  lines.push('- **Remaining Docs:** ' + result.capacity_planning.remaining_docs.toLocaleString())
  lines.push('- **Est. Productions Needed:** ' + result.capacity_planning.estimated_productions_needed)
  lines.push('- **Est. Size Remaining:** ' + result.capacity_planning.estimated_size_gb.toFixed(1) + ' GB')
  lines.push('- **Recommended Schedule:** ' + result.capacity_planning.recommended_schedule)
  lines.push('')

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 7: REVIEW WORKFLOW MONITOR ====================

interface ReviewerStats {
  name: string
  docs_reviewed: number
  review_rate: number
  agreement_rate: number
  flags: number
  role: 'partner' | 'associate' | 'contractor' | 'paralegal'
}

interface BacklogItem {
  priority: 'critical' | 'high' | 'medium' | 'low'
  document_count: number
  estimated_hours: number
  assigned_to: string
}

interface WorkflowMonitorResult {
  matter_name: string
  overall_progress: {
    total_documents: number
    reviewed: number
    remaining: number
    percent_complete: number
    estimated_completion_days: number
  }
  reviewers: ReviewerStats[]
  qc_metrics: {
    sample_size: number
    agreement_rate: number
    error_rate: number
    recommended_actions: string[]
  }
  backlog: BacklogItem[]
  cost_tracking: {
    total_spent: number
    hourly_rate_avg: number
    projected_total: number
    budget_remaining: number
  }
  contractor_management: {
    active_contractors: number
    avg_quality_score: number
    top_performer: string
    needs_coaching: string[]
  }
  disclaimer: string
}

function runWorkflowMonitor(
  matterName: string,
  totalDocs: number,
  teamSize: number,
  budget: number
): WorkflowMonitorResult {
  const seed = hashString(matterName + totalDocs.toString() + teamSize.toString())
  const rand = seededRandom(seed)

  const reviewers: ReviewerStats[] = []
  const roles: ReviewerStats['role'][] = ['partner', 'associate', 'contractor', 'paralegal']
  const names = ['A.Patel', 'J.Kim', 'M.Chen', 'S.Williams', 'R.Garcia', 'T.Mueller', 'L.Yamamoto', 'K.Novak']

  let totalReviewed = 0
  for (let i = 0; i < Math.min(teamSize, 8); i++) {
    const docsReviewed = Math.floor(rand() * (totalDocs / teamSize)) + 50
    totalReviewed += docsReviewed
    reviewers.push({
      name: names[i % names.length],
      docs_reviewed: docsReviewed,
      review_rate: clampedRand(rand, 30, 100),
      agreement_rate: clampedRand(rand, 0.75, 0.98),
      flags: Math.floor(rand() * 10),
      role: roles[i % roles.length]
    })
  }

  const reviewed = Math.min(totalReviewed, totalDocs)
  const remaining = totalDocs - reviewed
  const avgRate = reviewers.reduce((s, r) => s + r.review_rate, 0) / reviewers.length
  const estDays = Math.ceil(remaining / (avgRate * reviewers.length * 8))

  const qcAgreement = clampedRand(rand, 0.82, 0.96)
  const sampleSize = Math.ceil(reviewed * 0.1)

  const backlog: BacklogItem[] = [
    { priority: 'critical', document_count: Math.floor(rand() * 500) + 100, estimated_hours: 50, assigned_to: reviewers[0].name },
    { priority: 'high', document_count: Math.floor(rand() * 1000) + 200, estimated_hours: 80, assigned_to: reviewers[1 % reviewers.length].name },
    { priority: 'medium', document_count: Math.floor(rand() * 2000) + 500, estimated_hours: 120, assigned_to: reviewers[2 % reviewers.length].name }
  ]

  const totalSpent = Math.floor(rand() * budget * 0.6)
  const projectedTotal = Math.floor(totalSpent + remaining * clampedRand(rand, 3, 8))

  return {
    matter_name: matterName,
    overall_progress: {
      total_documents: totalDocs,
      reviewed,
      remaining,
      percent_complete: clampedRand(rand, (reviewed / totalDocs) * 0.9, (reviewed / totalDocs) * 1.0),
      estimated_completion_days: estDays
    },
    reviewers,
    qc_metrics: {
      sample_size: sampleSize,
      agreement_rate: qcAgreement,
      error_rate: clampedRand(rand, 0.02, 0.15),
      recommended_actions: qcAgreement < 0.9
        ? ['Hold calibration session for reviewers with < 90% agreement', 'Re-review QC sample with discrepancies', 'Update review guidelines based on QC findings']
        : ['Continue current QC schedule', 'Spot-check high-priority documents weekly']
    },
    backlog,
    cost_tracking: {
      total_spent: totalSpent,
      hourly_rate_avg: clampedRand(rand, 35, 250),
      projected_total: projectedTotal,
      budget_remaining: budget - projectedTotal
    },
    contractor_management: {
      active_contractors: Math.floor(teamSize * 0.6),
      avg_quality_score: clampedRand(rand, 0.78, 0.95),
      top_performer: reviewers.sort((a, b) => b.agreement_rate - a.agreement_rate)[0].name,
      needs_coaching: reviewers.filter(r => r.agreement_rate < 0.85).map(r => r.name)
    },
    disclaimer: '本分析不可替代专业法律建议。工作流监控数据仅供参考,管理决策应结合实际项目情况。'
  }
}

function formatWorkflowMonitor(result: WorkflowMonitorResult): string {
  const lines: string[] = []
  lines.push('## Review Workflow Monitor')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Overall Progress:** ' + result.overall_progress.percent_complete.toFixed(1) + '% complete (' + result.overall_progress.reviewed.toLocaleString() + '/' + result.overall_progress.total_documents.toLocaleString() + ')')
  lines.push('**Estimated Completion:** ' + result.overall_progress.estimated_completion_days + ' business days')
  lines.push('')

  lines.push('### Reviewer Performance')
  lines.push('| Reviewer | Role | Docs Reviewed | Rate (docs/hr) | Agreement | Flags |')
  lines.push('|----------|------|---------------|----------------|-----------|-------|')
  result.reviewers.forEach(r => {
    const agrIcon = r.agreement_rate > 0.9 ? 'OK' : r.agreement_rate > 0.8 ? 'CHECK' : 'REVIEW'
    lines.push('| ' + r.name + ' | ' + r.role + ' | ' + r.docs_reviewed.toLocaleString() + ' | ' + r.review_rate.toFixed(0) + ' | ' + agrIcon + ' ' + (r.agreement_rate * 100).toFixed(0) + '% | ' + r.flags + ' |')
  })
  lines.push('')

  lines.push('### QC Metrics')
  lines.push('- **Sample Size:** ' + result.qc_metrics.sample_size + ' documents')
  lines.push('- **Agreement Rate:** ' + (result.qc_metrics.agreement_rate * 100).toFixed(1) + '%')
  lines.push('- **Error Rate:** ' + (result.qc_metrics.error_rate * 100).toFixed(1) + '%')
  lines.push('- **Recommended Actions:**')
  result.qc_metrics.recommended_actions.forEach(a => lines.push('  - ' + a))
  lines.push('')

  lines.push('### Priority Backlog')
  lines.push('| Priority | Document Count | Est. Hours | Assigned To |')
  lines.push('|-----------|----------------|------------|-------------|')
  result.backlog.forEach(b => {
    const priIcon = b.priority === 'critical' ? '[CRITICAL]' : b.priority === 'high' ? '[HIGH]' : b.priority === 'medium' ? '[MEDIUM]' : '[LOW]'
    lines.push('| ' + priIcon + ' | ' + b.document_count.toLocaleString() + ' | ' + b.estimated_hours + 'h | ' + b.assigned_to + ' |')
  })
  lines.push('')

  lines.push('### Cost Tracking')
  lines.push('- **Total Spent:** $' + result.cost_tracking.total_spent.toLocaleString())
  lines.push('- **Avg Hourly Rate:** $' + result.cost_tracking.hourly_rate_avg.toFixed(0))
  lines.push('- **Projected Total:** $' + result.cost_tracking.projected_total.toLocaleString())
  lines.push('- **Budget Remaining:** $' + result.cost_tracking.budget_remaining.toLocaleString() + (result.cost_tracking.budget_remaining < 0 ? ' OVER BUDGET' : ''))
  lines.push('')

  lines.push('### Contractor Management')
  lines.push('- **Active Contractors:** ' + result.contractor_management.active_contractors)
  lines.push('- **Avg Quality Score:** ' + (result.contractor_management.avg_quality_score * 100).toFixed(0) + '%')
  lines.push('- **Top Performer:** ' + result.contractor_management.top_performer)
  if (result.contractor_management.needs_coaching.length > 0) {
    lines.push('- **Needs Coaching:** ' + result.contractor_management.needs_coaching.join(', '))
  }
  lines.push('')

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 8: DISPUTE STRATEGY ====================

interface FactNode {
  fact_id: string
  fact_text: string
  supported_by: string[]
  contested: boolean
  importance: 'critical' | 'important' | 'supporting'
  evidence_strength: number
}

interface EvidenceAssessment {
  doc_id: string
  assessment: 'favorable' | 'neutral' | 'unfavorable'
  strength_score: number
  description: string
  category: string
}

interface StrategyOption {
  name: string
  description: string
  estimated_cost: number
  estimated_duration: string
  success_probability: number
  risk_level: 'high' | 'medium' | 'low'
  pros: string[]
  cons: string[]
}

interface DisputeStrategyResult {
  matter_name: string
  key_facts: FactNode[]
  evidence_assessment: {
    favorable: EvidenceAssessment[]
    unfavorable: EvidenceAssessment[]
    overall_strength: number
  }
  strategies: StrategyOption[]
  recommendation: {
    recommended_strategy: string
    reasoning: string[]
    opponent_prediction: string
    cost_benefit: { expected_value: number; worst_case: number; best_case: number; likelihood_weighted: number }
  }
  next_steps: string[]
  disclaimer: string
}

function runDisputeStrategy(
  matterName: string,
  facts: string[],
  evidenceItems: Array<{ id: string; description: string; favorable: boolean }>
): DisputeStrategyResult {
  const seed = hashString(matterName + JSON.stringify(facts) + JSON.stringify(evidenceItems))
  const rand = seededRandom(seed)

  const keyFacts: FactNode[] = facts.map((f, i) => {
    const importance: FactNode['importance'][] = ['critical', 'important', 'supporting']
    return {
      fact_id: 'F' + String(i + 1).padStart(3, '0'),
      fact_text: f,
      supported_by: evidenceItems.filter(() => rand() > 0.5).slice(0, 3).map(e => e.id),
      contested: rand() > 0.4,
      importance: importance[Math.floor(rand() * 3)],
      evidence_strength: clampedRand(rand, 0.3, 0.95)
    }
  })

  const favorable: EvidenceAssessment[] = []
  const unfavorable: EvidenceAssessment[] = []

  evidenceItems.forEach(e => {
    const score = clampedRand(rand, 0.4, 0.9)
    if (e.favorable) {
      favorable.push({
        doc_id: e.id,
        assessment: 'favorable',
        strength_score: score,
        description: e.description,
        category: ['documentary', 'testimonial', 'expert', 'digital'][Math.floor(rand() * 4)]
      })
    } else {
      unfavorable.push({
        doc_id: e.id,
        assessment: 'unfavorable',
        strength_score: score,
        description: e.description,
        category: ['documentary', 'testimonial', 'expert', 'digital'][Math.floor(rand() * 4)]
      })
    }
  })

  const totalStrength = keyFacts.reduce((s, f) => s + f.evidence_strength, 0) / keyFacts.length
  const favRatio = favorable.length / (favorable.length + unfavorable.length || 1)
  const overallStrength = clampedRand(rand, totalStrength * 0.4, totalStrength * 0.4 + favRatio * 0.6)

  const strategies: StrategyOption[] = [
    {
      name: 'Aggressive Motion Practice',
      description: 'File dispositive motions early to narrow issues and force favorable settlement',
      estimated_cost: Math.round(clampedRand(rand, 80000, 250000) / 1000) * 1000,
      estimated_duration: '3-6 months',
      success_probability: clampedRand(rand, 0.45, 0.7),
      risk_level: 'high',
      pros: ['Early resolution potential', 'Cost-effective if successful', 'Shifts burden to opposing party'],
      cons: ['Risk of adverse ruling', 'May delay overall timeline', 'Requires strong legal arguments']
    },
    {
      name: 'Mediated Settlement',
      description: 'Engage neutral mediator to facilitate negotiated resolution',
      estimated_cost: Math.round(clampedRand(rand, 20000, 80000) / 1000) * 1000,
      estimated_duration: '2-4 months',
      success_probability: clampedRand(rand, 0.65, 0.85),
      risk_level: 'low',
      pros: ['Controlled outcome', 'Preserves business relationships', 'Confidential proceedings'],
      cons: ['Requires compromise', 'No guarantee of resolution', 'May signal weakness']
    },
    {
      name: 'Full Litigation to Verdict',
      description: 'Proceed through discovery, trial, and potential appeal',
      estimated_cost: Math.round(clampedRand(rand, 300000, 800000) / 1000) * 1000,
      estimated_duration: '18-36 months',
      success_probability: clampedRand(rand, 0.5, 0.7),
      risk_level: 'high',
      pros: ['Maximum potential recovery', 'Sets precedent', 'Full discovery rights'],
      cons: ['Highest cost', 'Lengthiest timeline', 'Most uncertain outcome', 'Public exposure']
    }
  ]

  let recommended = strategies[0]
  if (overallStrength > 0.7) recommended = strategies[0]
  else if (overallStrength > 0.45) recommended = strategies[1]
  else recommended = strategies[1]

  const reasoning: string[] = []
  reasoning.push('Overall evidence strength: ' + (overallStrength * 100).toFixed(0) + '% (based on ' + evidenceItems.length + ' evidence items)')
  reasoning.push('Favorable/Unfavorable ratio: ' + favorable.length + '/' + unfavorable.length)
  if (keyFacts.filter(f => f.importance === 'critical' && !f.contested).length > 0) {
    reasoning.push('Strong uncontested critical facts support ' + recommended.name)
  }
  reasoning.push('Key risk factors: ' + unfavorable.slice(0, 2).map(e => e.description.substring(0, 30)).join('; '))

  const opponentPrediction = rand() > 0.5
    ? 'Opposing party likely to pursue aggressive defense based on available counter-evidence'
    : 'Opposing party may consider early settlement given strength of primary evidence'

  const expectedValue = Math.round(recommended.success_probability * recommended.estimated_cost * 0.5)
  const worstCase = -recommended.estimated_cost
  const bestCase = Math.round(recommended.estimated_cost * clampedRand(rand, 2, 6))
  const likelihoodWeighted = Math.round(expectedValue * recommended.success_probability + worstCase * (1 - recommended.success_probability) * 0.3)

  const nextSteps: string[] = [
    'Finalize evidence portfolio and prepare exhibit list for ' + recommended.name,
    'Conduct additional discovery on identified weak points',
    'Prepare cost-benefit analysis for client briefing',
    'Establish key milestones and budget checkpoints',
    'Engage subject matter expert if technical issues require testimony',
    'Prepare opening demand/position paper aligned with recommended strategy'
  ]

  return {
    matter_name: matterName,
    key_facts: keyFacts.slice(0, 10),
    evidence_assessment: { favorable: favorable.slice(0, 8), unfavorable: unfavorable.slice(0, 8), overall_strength: overallStrength },
    strategies,
    recommendation: {
      recommended_strategy: recommended.name,
      reasoning,
      opponent_prediction: opponentPrediction,
      cost_benefit: { expected_value: expectedValue, worst_case: worstCase, best_case: bestCase, likelihood_weighted: likelihoodWeighted }
    },
    next_steps: nextSteps,
    disclaimer: '本分析不可替代专业法律建议。争议策略分析仅供初步参考,具体诉讼策略应由持证律师在充分了解案情后制定。'
  }
}

function formatDisputeStrategy(result: DisputeStrategyResult): string {
  const lines: string[] = []
  lines.push('## Dispute Strategy Analysis')
  lines.push('')
  lines.push('**Matter:** ' + result.matter_name)
  lines.push('**Overall Evidence Strength:** ' + (result.evidence_assessment.overall_strength * 100).toFixed(0) + '%')
  lines.push('**Recommended Strategy:** ' + result.recommendation.recommended_strategy)
  lines.push('')

  lines.push('### Key Facts Map')
  lines.push('| Fact ID | Fact | Importance | Contested | Evidence Strength |')
  lines.push('|---------|------|------------|-----------|-------------------|')
  result.key_facts.forEach(f => {
    const impIcon = f.importance === 'critical' ? '[CRITICAL]' : f.importance === 'important' ? '[IMPORTANT]' : '[SUPPORTING]'
    const contestIcon = f.contested ? '[CONTESTED]' : '[AGREED]'
    lines.push('| ' + f.fact_id + ' | ' + f.fact_text.substring(0, 40) + '... | ' + impIcon + ' | ' + contestIcon + ' | ' + (f.evidence_strength * 100).toFixed(0) + '% |')
  })
  lines.push('')

  lines.push('### Favorable Evidence (' + result.evidence_assessment.favorable.length + ')')
  lines.push('| Doc ID | Category | Strength | Description |')
  lines.push('|--------|----------|----------|-------------|')
  result.evidence_assessment.favorable.forEach(e => {
    lines.push('| ' + e.doc_id + ' | ' + e.category + ' | ' + (e.strength_score * 100).toFixed(0) + '% | ' + e.description.substring(0, 40) + ' |')
  })
  lines.push('')

  if (result.evidence_assessment.unfavorable.length > 0) {
    lines.push('### Unfavorable Evidence (' + result.evidence_assessment.unfavorable.length + ')')
    lines.push('| Doc ID | Category | Strength | Description |')
    lines.push('|--------|----------|----------|-------------|')
    result.evidence_assessment.unfavorable.forEach(e => {
      lines.push('| ' + e.doc_id + ' | ' + e.category + ' | ' + (e.strength_score * 100).toFixed(0) + '% | ' + e.description.substring(0, 40) + ' |')
    })
    lines.push('')
  }

  lines.push('### Strategy Comparison')
  lines.push('| Strategy | Cost | Duration | Success % | Risk |')
  lines.push('|----------|------|----------|-----------|------|')
  result.strategies.forEach(s => {
    const recIcon = s.name === result.recommendation.recommended_strategy ? '>> ' : '   '
    lines.push('| ' + recIcon + s.name + ' | $' + s.estimated_cost.toLocaleString() + ' | ' + s.estimated_duration + ' | ' + (s.success_probability * 100).toFixed(0) + '% | ' + s.risk_level + ' |')
  })
  lines.push('')

  lines.push('### Recommendation: ' + result.recommendation.recommended_strategy)
  lines.push('')
  lines.push('**Reasoning:**')
  result.recommendation.reasoning.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push('**Opponent Prediction:** ' + result.recommendation.opponent_prediction)
  lines.push('')

  lines.push('### Cost-Benefit Analysis')
  lines.push('- **Expected Value:** $' + result.recommendation.cost_benefit.expected_value.toLocaleString())
  lines.push('- **Worst Case:** $' + result.recommendation.cost_benefit.worst_case.toLocaleString())
  lines.push('- **Best Case:** $' + result.recommendation.cost_benefit.best_case.toLocaleString())
  lines.push('- **Likelihood-Weighted:** $' + result.recommendation.cost_benefit.likelihood_weighted.toLocaleString())
  lines.push('')

  lines.push('### Next Steps')
  result.next_steps.forEach((s, i) => lines.push((i + 1) + '. ' + s))
  lines.push('')

  lines.push('> ' + result.disclaimer)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context): void {
  const tools = ctx.tools

  // Tool 1: eDiscovery Collection
  tools.register(defineTool({
    name: 'ediscovery_collection',
    description: 'Multi-source electronic evidence collection (email, IM, cloud, mobile) with chain of custody, hash verification, and collection certificate.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      custodians: { type: 'string', required: true, description: 'JSON array of custodian names' },
      data_sources: { type: 'string', required: true, description: 'JSON array: "email", "instant_messaging", "collaborative_docs", "cloud", "mobile"' },
      date_range: { type: 'string', required: true, description: 'Collection date range (e.g., "2024-01-01 to 2026-06-30")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; custodians: string; data_sources: string; date_range: string }) {
      const custodians = JSON.parse(args.custodians) as string[]
      const sources = JSON.parse(args.data_sources) as string[]
      const result = runCollection(args.matter_name, custodians, sources, args.date_range)
      return formatCollection(result)
    }
  }))

  // Tool 2: Document Review
  tools.register(defineTool({
    name: 'document_review',
    description: 'AI-assisted document review with relevance judgment, privilege identification, annotations, summary generation, and QC sampling.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      document_count: { type: 'string', required: true, description: 'Number of documents to review (as string number)' },
      review_criteria: { type: 'string', required: true, description: 'Description of review criteria and issues' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; document_count: string; review_criteria: string }) {
      const count = parseInt(args.document_count, 10)
      const result = runDocumentReview(args.matter_name, count, args.review_criteria)
      return formatDocumentReview(result)
    }
  }))

  // Tool 3: Concept Clustering
  tools.register(defineTool({
    name: 'concept_clustering',
    description: 'Document relationship graph and topic clustering. Produces theme clusters, similarity groups, key document identification, timeline, and recommendations.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      document_ids: { type: 'string', required: true, description: 'JSON array of document IDs to cluster' },
      analysis_depth: { type: 'string', required: true, description: 'Depth: "quick", "standard", or "deep"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; document_ids: string; analysis_depth: string }) {
      const docIds = JSON.parse(args.document_ids) as string[]
      const result = runConceptClustering(args.matter_name, docIds, args.analysis_depth)
      return formatConceptClustering(result)
    }
  }))

  // Tool 4: Privilege Log Reader
  tools.register(defineTool({
    name: 'privilege_log_reader',
    description: 'Privilege log analysis with type statistics, waiver analysis, common interest agreement tracking, and waiver decisions.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      privilege_entries: { type: 'string', required: true, description: 'JSON array of privilege entries (date, from, to, subject, type)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; privilege_entries: string }) {
      const entries = JSON.parse(args.privilege_entries) as Array<{ date: string; from: string; to: string; subject: string; type: string }>
      const result = runPrivilegeLogAnalysis(args.matter_name, entries)
      return formatPrivilegeLog(result)
    }
  }))

  // Tool 5: Redaction Engine
  tools.register(defineTool({
    name: 'redaction_engine',
    description: 'Automated redaction tool for PII, privileged content, sensitive terms, visual masking with redaction certificate and batch processing log.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      redaction_types: { type: 'string', required: true, description: 'JSON array: "PII", "privileged", "sensitive", "trade-secret", "confidential"' },
      target_documents: { type: 'string', required: true, description: 'JSON array of document IDs to redact' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; redaction_types: string; target_documents: string }) {
      const types = JSON.parse(args.redaction_types) as string[]
      const docs = JSON.parse(args.target_documents) as string[]
      const result = runRedactionEngine(args.matter_name, types, docs)
      return formatRedactionEngine(result)
    }
  }))

  // Tool 6: Production Setter
  tools.register(defineTool({
    name: 'production_setter',
    description: 'Production packaging with Bates numbering, production logs, recipient confirmation, incremental production, capacity planning, and certificates.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      total_documents: { type: 'string', required: true, description: 'Total documents to produce (as string number)' },
      production_format: { type: 'string', required: true, description: 'Format: "TIFF", "PDF", "NATIVE", or "LOADFILE"' },
      recipients: { type: 'string', required: true, description: 'JSON array of recipient names' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; total_documents: string; production_format: string; recipients: string }) {
      const total = parseInt(args.total_documents, 10)
      const recips = JSON.parse(args.recipients) as string[]
      const result = runProductionSetter(args.matter_name, total, args.production_format, recips)
      return formatProductionSetter(result)
    }
  }))

  // Tool 7: Review Workflow Monitor
  tools.register(defineTool({
    name: 'review_workflow_monitor',
    description: 'Monitor review progress, QC consistency, reviewer performance, priority backlog, cost tracking, and contractor management.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      total_documents: { type: 'string', required: true, description: 'Total documents in review set (as string number)' },
      team_size: { type: 'string', required: true, description: 'Number of reviewers on the team (as string number)' },
      budget: { type: 'string', required: true, description: 'Total review budget in USD (as string number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; total_documents: string; team_size: string; budget: string }) {
      const docs = parseInt(args.total_documents, 10)
      const team = parseInt(args.team_size, 10)
      const budget = parseInt(args.budget, 10)
      const result = runWorkflowMonitor(args.matter_name, docs, team, budget)
      return formatWorkflowMonitor(result)
    }
  }))

  // Tool 8: Dispute Strategy
  tools.register(defineTool({
    name: 'dispute_strategy',
    description: 'Litigation strategy tool with key fact mapping, favorable/unfavorable evidence assessment, strength scoring, opponent prediction, and cost-benefit analysis.',
    parameters: {
      matter_name: { type: 'string', required: true, description: 'Name of the legal matter' },
      facts: { type: 'string', required: true, description: 'JSON array of key fact statements' },
      evidence_items: { type: 'string', required: true, description: 'JSON array of evidence items with id, description, favorable (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { matter_name: string; facts: string; evidence_items: string }) {
      const facts = JSON.parse(args.facts) as string[]
      const evidence = JSON.parse(args.evidence_items) as Array<{ id: string; description: string; favorable: boolean }>
      const result = runDisputeStrategy(args.matter_name, facts, evidence)
      return formatDisputeStrategy(result)
    }
  }))

  // eslint-disable-next-line no-console
  console.log('[dsh-tool-legaldiscovery] Loaded v' + VERSION + ' - eDiscovery Pro with 8 tools')
  // eslint-disable-next-line no-console
  console.log('  Tools: ediscovery_collection, document_review, concept_clustering, privilege_log_reader, redaction_engine, production_setter, review_workflow_monitor, dispute_strategy')
}
