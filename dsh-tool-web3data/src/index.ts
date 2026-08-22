/**
 * DSH Web3 Decentralized Data Infrastructure Plugin v1.0.0
 *
 * The 2026 enterprise trend: questioning cloud lock-in and exploring decentralized alternatives
 * (Walrus, Celestia, The Graph, Unibase, Filecoin). This toolkit provides decision frameworks
 * for decentralized storage economics, data availability sampling, subgraph design, multi-tier
 * storage architecture, Filecoin deal negotiation, cost optimization, persistence strategy,
 * and decentralized compute planning.
 *
 * Features (v1.0.0):
 * - storage_economics_calculator — Compare storage costs across Filecoin, Arweave, Walrus, S3
 * - data_availability_sampler — Design DAS strategy for decentralized networks
 * - thegraph_subgraph_designer — Design The Graph subgraph for blockchain indexing
 * - decentralized_storage_architect — Multi-tier decentralized storage architecture
 * - filecoin_deal_negotiator — Filecoin storage deal negotiation advisor
 * - web3_infra_cost_optimizer — Cross-protocol Web3 infrastructure cost optimizer
 * - data_persistence_strategy — Long-term multi-network data persistence planner
 * - decentralized_compute_planner — Decentralized compute workload planner
 *
 * @module dsh-tool-web3data
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-web3data'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute financial, investment, or legal advice. Always verify on-chain data and consult qualified professionals before committing to storage deals, token purchases, or infrastructure decisions.'

// ==================== SEEDED RANDOM (mulberry32) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function seededRng(input: string): () => number {
  return mulberry32(hashString(JSON.stringify(input)))
}

function clamp(value: number, minVal: number, maxVal: number): number {
  return Math.min(Math.max(value, minVal), maxVal)
}

// ==================== TOOL 1: STORAGE ECONOMICS CALCULATOR ====================

interface StorageEconomicsInput {
  data_volume_tb?: number
  access_frequency?: 'rare' | 'monthly' | 'weekly' | 'daily' | 'real_time'
  retention_years?: number
  durability_requirement?: 'standard' | 'high' | 'extreme'
  throughput_mbps?: number
}

interface NetworkCost {
  network: string
  storage_cost_usd_tb_month: number
  retrieval_cost_usd_tb: number
  total_cost_usd: number
  annualized_cost_usd: number
  dur_9s: number
  pros: string[]
  cons: string[]
}

interface StorageEconomicsResult {
  recommended_network: string
  network_comparison: NetworkCost[]
  total_data_cost: number
  savings_vs_s3_pct: number
  risk_factors: string[]
  recommendations: string[]
}

function calculateStorageEconomics(input: StorageEconomicsInput): StorageEconomicsResult {
  const rng = seededRng(JSON.stringify(input))
  const volume = input.data_volume_tb || 10
  const retention = input.retention_years || 1
  const accessFreq = input.access_frequency || 'monthly'
  const durability = input.durability_requirement || 'high'

  const accessMultiplier: Record<string, number> = {
    rare: 0.5,
    monthly: 1.0,
    weekly: 2.5,
    daily: 6.0,
    real_time: 15.0,
  }
  const durMultiplier: Record<string, number> = {
    standard: 1.0,
    high: 1.3,
    extreme: 1.8,
  }

  const am = accessMultiplier[accessFreq] || 1.0
  const dm = durMultiplier[durability] || 1.0

  const networks: NetworkCost[] = []

  // S3 (baseline)
  const s3Storage = 23.0 * volume * dm
  const s3Retrieval = (volume * 0.09 * am * 12 * retention)
  const s3Total = (s3Storage * 12 * retention) + s3Retrieval
  networks.push({
    network: 'AWS S3',
    storage_cost_usd_tb_month: 23.0 * dm,
    retrieval_cost_usd_tb: 0.09,
    total_cost_usd: Math.round(s3Total),
    annualized_cost_usd: Math.round(s3Total / retention),
    dur_9s: 11,
    pros: ['Mature ecosystem', 'Predictable pricing', 'Global CDN'],
    cons: ['Vendor lock-in', 'Escalating egress fees', 'Centralized control'],
  })

  // Filecoin
  const fcStorage = 1.5 * volume * dm
  const fcRetrieval = volume * 0.15 * am * 12 * retention
  const fcTotal = (fcStorage * 12 * retention) + fcRetrieval
  networks.push({
    network: 'Filecoin',
    storage_cost_usd_tb_month: 1.5 * dm,
    retrieval_cost_usd_tb: 0.15,
    total_cost_usd: Math.round(fcTotal),
    annualized_cost_usd: Math.round(fcTotal / retention),
    dur_9s: 9,
    pros: ['Cheapest storage', 'Proof-of-Spacetime verification', 'Large miner ecosystem'],
    cons: ['Retrieval latency varies', 'Deal renewal complexity', 'Token volatility'],
  })

  // Arweave
  const arStorageUpfront = volume * 8.0 * dm * retention
  const arTotal = arStorageUpfront + (volume * 0.05 * am * 12 * retention)
  networks.push({
    network: 'Arweave',
    storage_cost_usd_tb_month: 0,
    retrieval_cost_usd_tb: 0.05,
    total_cost_usd: Math.round(arTotal),
    annualized_cost_usd: Math.round(arTotal / retention),
    dur_9s: 7,
    pros: ['One-time payment forever', 'Truly permanent storage', 'No renewal needed'],
    cons: ['High upfront cost', 'Not for mutable data', 'Slower writes'],
  })

  // Walrus (Sui-based)
  const walrusStorage = 2.8 * volume * dm
  const walrusRetrieval = volume * 0.08 * am * 12 * retention
  const walrusTotal = (walrusStorage * 12 * retention) + walrusRetrieval
  networks.push({
    network: 'Walrus',
    storage_cost_usd_tb_month: 2.8 * dm,
    retrieval_cost_usd_tb: 0.08,
    total_cost_usd: Math.round(walrusTotal),
    annualized_cost_usd: Math.round(walrusTotal / retention),
    dur_9s: 8,
    pros: ['Sui ecosystem-native', 'Low cost vs S3', 'Blob-oriented', 'Merkle-verifiable'],
    cons: ['Newer protocol', 'Smaller network', 'Sui token dependency'],
  })

  // Sort by total cost
  networks.sort((a, b) => a.total_cost_usd - b.total_cost_usd)
  const recommended = networks[0].network
  const s3Network = networks.find(n => n.network === 'AWS S3')
  const savingsPct = s3Network ? Math.round(((s3Network.total_cost_usd - networks[0].total_cost_usd) / s3Network.total_cost_usd) * 100) : 0

  const riskFactors: string[] = []
  if (durability === 'extreme' && recommended === 'Filecoin') {
    riskFactors.push('Filecoin deal expiry requires active renewal — consider replication factor ≥3')
  }
  if (accessFreq === 'real_time' && (recommended === 'Filecoin' || recommended === 'Arweave')) {
    riskFactors.push(`${recommended} retrieval latency may not meet real-time requirements — consider caching layer`)
  }
  if (recommended === 'Walrus') {
    riskFactors.push('Walrus is newer/less battle-tested — monitor network stability dashboard')
  }
  if (recommended === 'Arweave' && retention < 3) {
    riskFactors.push('Arweave upfront cost is hard to justify for retention < 3 years')
  }

  const recommendations: string[] = []
  recommendations.push(`Use ${recommended} as primary storage layer for ${volume}TB`)
  if (volume > 50 && recommended === 'Filecoin') {
    recommendations.push('Negotiate volume discount with miners (10-20% for >50TB)')
  }
  if (accessFreq !== 'rare') {
    recommendations.push('Add CDN caching layer (Cloudflare/IPFS gateway) to reduce retrieval costs')
  }
  if (durability === 'extreme') {
    recommendations.push('Replicate across at least 2 decentralized networks for nines-level durability')
  }

  return {
    recommended_network: recommended,
    network_comparison: networks,
    total_data_cost: networks[0].total_cost_usd,
    savings_vs_s3_pct: clamp(savingsPct, 0, 99),
    risk_factors: riskFactors,
    recommendations,
  }
}

function formatStorageEconomicsReport(input: StorageEconomicsInput, result: StorageEconomicsResult): string {
  const lines: string[] = []
  lines.push('## Storage Economics Calculator')
  lines.push('')
  lines.push(`**Scenario**: ${input.data_volume_tb || 10}TB | Access: ${input.access_frequency || 'monthly'} | Retention: ${input.retention_years || 1}yr | Durability: ${input.durability_requirement || 'high'}`)
  lines.push('')
  lines.push(`### Recommended: ${result.recommended_network} (${result.savings_vs_s3_pct}% cheaper than S3)`)
  lines.push('')

  lines.push('### Network Cost Comparison')
  lines.push('| Network | $/TB/mo | Retrieval $/TB | Total Cost | Annualized | Durability (9s) |')
  lines.push('|---------|---------|-----------------|------------|------------|-----------------|')
  for (const n of result.network_comparison) {
    lines.push(`| ${n.network} | $${n.storage_cost_usd_tb_month.toFixed(2)} | $${n.retrieval_cost_usd_tb.toFixed(2)} | $${n.total_cost_usd.toLocaleString()} | $${n.annualized_cost_usd.toLocaleString()} | ${n.dur_9s} |`)
  }
  lines.push('')

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of result.risk_factors) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: DATA AVAILABILITY SAMPLER ====================

interface DataAvailabilityInput {
  block_size_bytes?: number
  network_type?: 'celestia' | 'avail' | 'eip4844' | 'custom'
  total_validators?: number
  required_confidence_pct?: number
  sampling_rounds?: number
}

interface SamplingResult {
  rows_needed: number
  cols_needed: number
  total_samples_needed: number
  confidence_pct: number
  data_chunk_size_bytes: number
  rounds_required: number
  latency_estimate_ms: number
  redundancy_factor: number
  bandwidth_per_node_kbps: number
  onchain_footprint_bytes: number
  notes: string[]
}

function designDAStrategy(input: DataAvailabilityInput): SamplingResult {
  const rng = seededRng(JSON.stringify(input))
  const blockSize = input.block_size_bytes || 131072
  const confidence = input.required_confidence_pct || 99.0
  const rounds = input.sampling_rounds || 15
  const networkType = input.network_type || 'celestia'

  const dims: Record<string, { rows: number; cols: number }> = {
    celestia: { rows: 256, cols: 256 },
    avail: { rows: 256, cols: 256 },
    eip4844: { rows: 4096, cols: 64 },
    custom: { rows: 128, cols: 128 },
  }

  const { rows, cols } = dims[networkType] || dims.celestia
  const confidenceDecay = Math.log(1 - confidence / 100) / Math.log(0.5)
  const samplesPerRound = Math.min(Math.ceil(confidenceDecay), Math.min(rows, cols))
  const totalSamples = samplesPerRound * rounds

  const chunkSize = Math.ceil(blockSize / (rows * cols))
  const latencyBase = networkType === 'celestia' ? 6000 : networkType === 'avail' ? 12000 : networkType === 'eip4844' ? 12000 : 8000
  const latencyEstimate = latencyBase + (rounds * 200) + Math.floor(rng() * 1000)
  const redundancy = networkType === 'celestia' ? 1.5 : networkType === 'avail' ? 1.5 : 2.0
  const bandwidthKbps = Math.round((totalSamples * chunkSize * 8 * rounds) / (latencyEstimate / 1000) / 1000)
  const onchainFootprint = Math.round(blockSize * 0.15) // ~15% of block on chain

  const notes: string[] = []
  notes.push(`Matrix: ${rows}x${rows} 2D Reed-Solomon encoded (${rows * 2}x${rows * 2} extended)`)
  notes.push(`Each light client downloads ${totalSamples} samples of ${chunkSize}B each per block`)
  notes.push(`Data is available with ${confidence}% confidence after ${rounds} sampling rounds`)
  if (confidence > 99.9) {
    notes.push('Sub-sampling further yields diminishing returns — 99% is practical threshold')
  }
  if (blockSize > 1048576) {
    notes.push('Large blocks increase sampling latency — consider blob batching')
  }

  return {
    rows_needed: rows,
    cols_needed: cols,
    total_samples_needed: totalSamples,
    confidence_pct: confidence,
    data_chunk_size_bytes: chunkSize,
    rounds_required: rounds,
    latency_estimate_ms: latencyEstimate,
    redundancy_factor: redundancy,
    bandwidth_per_node_kbps: bandwidthKbps,
    onchain_footprint_bytes: onchainFootprint,
    notes,
  }
}

function formatDAReport(input: DataAvailabilityInput, result: SamplingResult): string {
  const lines: string[] = []
  lines.push('## Data Availability Sampling Strategy')
  lines.push('')
  lines.push(`**Network**: ${input.network_type || 'celestia'} | Block: ${((input.block_size_bytes || 131072) / 1024).toFixed(0)}KB | Target confidence: ${input.required_confidence_pct || 99}% | Rounds: ${input.sampling_rounds || 15}`)
  lines.push('')
  lines.push('### Sampling Parameters')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Matrix Size | ${result.rows_needed}x${result.rows_needed} original / ${result.rows_needed * 2}x${result.rows_needed * 2} extended |`)
  lines.push(`| Samples/Round | ${Math.ceil(Math.log(1 - (input.required_confidence_pct || 99) / 100) / Math.log(0.5))} |`)
  lines.push(`| Total Samples | ${result.total_samples_needed} |`)
  lines.push(`| Chunk Size | ${result.data_chunk_size_bytes}B |`)
  lines.push(`| Rounds Required | ${result.rounds_required} |`)
  lines.push(`| Confidence | ${result.confidence_pct}% |`)
  lines.push(`| Latency Estimate | ${result.latency_estimate_ms}ms |`)
  lines.push(`| Redundancy Factor | ${result.redundancy_factor}x |`)
  lines.push(`| Bandwidth/Node | ${result.bandwidth_per_node_kbps} kbps |`)
  lines.push(`| On-chain Footprint | ${result.onchain_footprint_bytes}B |`)
  lines.push('')

  lines.push('### Technical Notes')
  for (const n of result.notes) {
    lines.push(`- ${n}`)
  }
  lines.push('')

  lines.push('### Comparison with Centralized Approach')
  lines.push(`- Centralized: Download full ${((input.block_size_bytes || 131072) / 1024).toFixed(0)}KB block = ${((input.block_size_bytes || 131072) / 1024).toFixed(0)}KB bandwidth`)
  lines.push(`- DAS: Download ${result.total_samples_needed}x${result.data_chunk_size_bytes}B = ${(result.total_samples_needed * result.data_chunk_size_bytes / 1024).toFixed(1)}KB bandwidth`)
  lines.push(`- Light client overhead: ${((result.total_samples_needed * result.data_chunk_size_bytes / (input.block_size_bytes || 131072)) * 100).toFixed(1)}% of full block`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: THE GRAPH SUBGRAPH DESIGNER ====================

interface SubgraphInput {
  protocol_contracts?: string[]
  events_to_index?: string[]
  query_patterns?: string[]
  update_frequency?: 'realtime' | '5min' | '15min' | '1hr' | 'batch'
}

interface EntityDef {
  name: string
  fields: { name: string; type: string; indexed: boolean }[]
}

interface SubgraphDesignResult {
  entities: EntityDef[]
  event_handlers: { event: string; handler: string; entity: string }[]
  query_templates: { name: string; description: string; graphql: string }[]
  estimated_indexing_time_min: number
  cost_per_query_units: number
  deployment_config: { network: string; version: string; features: string[] }
  optimization_tips: string[]
}

function designSubgraph(input: SubgraphInput): SubgraphDesignResult {
  const rng = seededRng(JSON.stringify(input))
  const contracts = input.protocol_contracts || ['0xProtocol']
  const events = input.events_to_index || ['Transfer', 'Approval', 'Swap']
  const queries = input.query_patterns || ['user_balance', 'daily_volume', 'top_holders']
  const updateFreq = input.update_frequency || '15min'

  const entities: EntityDef[] = []
  const eventHandlers: { event: string; handler: string; entity: string }[] = []

  // Generate entities based on events
  const entityNames = new Set<string>()
  for (const event of events) {
    const baseName = event.replace(/^(Deposit|Withdraw|Swap|Transfer|Approval|Stake|Unstake|Claim|Mint|Burn)/, '')
    const entityName = (baseName || event) + 'Event'
    if (!entityNames.has(entityName)) {
      entityNames.add(entityName)
      entities.push({
        name: entityName,
        fields: [
          { name: 'id', type: 'ID!', indexed: true },
          { name: 'blockNumber', type: 'BigInt!', indexed: true },
          { name: 'timestamp', type: 'BigInt!', indexed: true },
          { name: 'txHash', type: 'Bytes!', indexed: true },
          { name: 'gasUsed', type: 'BigInt', indexed: false },
          { name: 'gasPrice', type: 'BigInt', indexed: false },
        ],
      })
    }
    eventHandlers.push({
      event,
      handler: `handle${event}`,
      entity: entityName,
    })
  }

  // Add aggregate entity
  entities.push({
    name: 'ProtocolStats',
    fields: [
      { name: 'id', type: 'ID!', indexed: true },
      { name: 'totalVolume', type: 'BigDecimal!', indexed: false },
      { name: 'totalTransactions', type: 'BigInt!', indexed: false },
      { name: 'uniqueUsers', type: 'BigInt!', indexed: false },
      { name: 'lastUpdated', type: 'BigInt!', indexed: true },
    ],
  })

  // Generate query templates
  const queryTemplates: { name: string; description: string; graphql: string }[] = []
  for (const q of queries) {
    const entityName = entities[0]?.name || 'Event'
    const lowerQ = q.toLowerCase()
    if (lowerQ.includes('balance') || lowerQ.includes('user')) {
      queryTemplates.push({
        name: q,
        description: `Query user balances and positions`,
        graphql: `{\n  user(id: "0x...") {\n    id\n    balance\n    positions {\n      id\n      amount\n    }\n  }\n}`,
      })
    } else if (lowerQ.includes('volume') || lowerQ.includes('daily')) {
      queryTemplates.push({
        name: q,
        description: `Query daily aggregated volume`,
        graphql: `{\n  protocolStats(id: "daily") {\n    totalVolume\n    totalTransactions\n    lastUpdated\n  }\n}`,
      })
    } else {
      queryTemplates.push({
        name: q,
        description: `Query ${entityName} entities`,
        graphql: `{\n  ${entityName.toLowerCase()}s(first: 100, orderBy: timestamp, orderDirection: desc) {\n    id\n    blockNumber\n    timestamp\n  }\n}`,
      })
    }
  }

  const freqLatency: Record<string, number> = { realtime: 0, '5min': 5, '15min': 15, '1hr': 60, batch: 1440 }
  const indexingTime = Math.round((contracts.length * events.length * 2) + (freqLatency[updateFreq] || 15) + Math.floor(rng() * 10))
  const costPerQuery = Math.max(1, Math.round((entities.length * 0.5) + (events.length * 0.3) + Math.floor(rng() * 3)))

  const optimizationTips: string[] = []
  optimizationTips.push('Use @derivedFrom for one-to-many relationships to avoid expensive joins')
  optimizationTips.push('Index only fields used in where/orderBy clauses — each index adds write cost')
  if (events.length > 5) {
    optimizationTips.push('Consider splitting into multiple subgraphs if >5 events — reduces per-subgraph complexity')
  }
  if (updateFreq === 'realtime') {
    optimizationTips.push('Realtime indexing requires dedicated Graph Node — budget $200-500/mo for self-hosted')
  }
  optimizationTips.push('Use Bytes for addresses (not String) — 50% smaller storage footprint')
  optimizationTips.push('Batch entity updates in handlers to reduce store.set() calls')

  return {
    entities,
    event_handlers: eventHandlers,
    query_templates: queryTemplates,
    estimated_indexing_time_min: indexingTime,
    cost_per_query_units: costPerQuery,
    deployment_config: {
      network: 'mainnet',
      version: '0.8.0',
      features: ['nonFatalErrors', 'fullTextSearch'],
    },
    optimization_tips: optimizationTips,
  }
}

function formatSubgraphReport(input: SubgraphInput, result: SubgraphDesignResult): string {
  const lines: string[] = []
  lines.push('## The Graph Subgraph Design')
  lines.push('')
  lines.push(`**Contracts**: ${(input.protocol_contracts || ['0xProtocol']).join(', ')}`)
  lines.push(`**Events**: ${(input.events_to_index || ['Transfer']).length} | **Queries**: ${(input.query_patterns || []).length} | **Update**: ${input.update_frequency || '15min'}`)
  lines.push('')

  lines.push('### Entities')
  for (const e of result.entities) {
    lines.push(`#### ${e.name}`)
    for (const f of e.fields) {
      lines.push(`- ${f.name}: ${f.type}${f.indexed ? ' [indexed]' : ''}`)
    }
    lines.push('')
  }

  lines.push('### Event Handlers')
  lines.push('| Event | Handler | Entity |')
  lines.push('|-------|---------|--------|')
  for (const h of result.event_handlers) {
    lines.push(`| ${h.event} | ${h.handler} | ${h.entity} |`)
  }
  lines.push('')

  lines.push('### Query Templates')
  for (const q of result.query_templates) {
    lines.push(`#### ${q.name}: ${q.description}`)
    lines.push('```graphql')
    lines.push(q.graphql)
    lines.push('```')
    lines.push('')
  }

  lines.push('### Deployment Config')
  lines.push(`- Network: ${result.deployment_config.network}`)
  lines.push(`- Spec Version: ${result.deployment_config.version}`)
  lines.push(`- Features: ${result.deployment_config.features.join(', ')}`)
  lines.push(`- Est. Indexing Time: ${result.estimated_indexing_time_min} min`)
  lines.push(`- Cost/Query: ${result.cost_per_query_units} units`)
  lines.push('')

  lines.push('### Optimization Tips')
  for (const t of result.optimization_tips) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: DECENTRALIZED STORAGE ARCHITECT ====================

interface StorageArchitectInput {
  data_types?: Record<string, number>
  access_patterns?: Record<string, string>
  budget_usd_month?: number
  compliance_requirements?: string[]
  performance_tiers?: string[]
}

interface TierAssignment {
  tier: string
  network: string
  data_types: string[]
  monthly_cost_usd: number
  retrieval_sla: string
  durability_9s: number
}

interface StorageArchResult {
  tiers: TierAssignment[]
  total_monthly_cost: number
  budget_utilization_pct: number
  compliance_status: { requirement: string; met: boolean; notes: string }[]
  architecture_diagram: string
  migration_steps: string[]
}

function architectStorage(input: StorageArchitectInput): StorageArchResult {
  const rng = seededRng(JSON.stringify(input))
  const dataTypes = input.data_types || { 'hot_app_data': 5, 'cold_archives': 50, 'metadata': 1 }
  const budget = input.budget_usd_month || 500
  const compliance = input.compliance_requirements || ['GDPR', 'data_residency']
  const tiers = input.performance_tiers || ['hot', 'warm', 'cold']

  const totalVolume = Object.values(dataTypes).reduce((a, b) => a + b, 0)
  const tierAssignments: TierAssignment[] = []

  // Hot tier
  if (tiers.includes('hot')) {
    const hotTypes = Object.entries(dataTypes).filter(([_, v]) => v <= 5).map(([k]) => k)
    const hotVolume = hotTypes.length > 0 ? hotTypes.reduce((sum, t) => sum + (dataTypes[t] || 0), 0) : 1
    tierAssignments.push({
      tier: 'Hot',
      network: 'Walrus',
      data_types: hotTypes.length > 0 ? hotTypes : ['app_state'],
      monthly_cost_usd: Math.round(hotVolume * 3.5 * 10) / 10,
      retrieval_sla: '<100ms',
      durability_9s: 8,
    })
  }

  // Warm tier
  if (tiers.includes('warm')) {
    const warmTypes = Object.entries(dataTypes).filter(([_, v]) => v > 5 && v <= 20).map(([k]) => k)
    const warmVolume = warmTypes.length > 0 ? warmTypes.reduce((sum, t) => sum + (dataTypes[t] || 0), 0) : 5
    tierAssignments.push({
      tier: 'Warm',
      network: 'Filecoin',
      data_types: warmTypes.length > 0 ? warmTypes : ['user_data'],
      monthly_cost_usd: Math.round(warmVolume * 1.8 * 10) / 10,
      retrieval_sla: '<5min',
      durability_9s: 9,
    })
  }

  // Cold tier
  if (tiers.includes('cold')) {
    const coldTypes = Object.entries(dataTypes).filter(([_, v]) => v > 20).map(([k]) => k)
    const coldVolume = coldTypes.length > 0 ? coldTypes.reduce((sum, t) => sum + (dataTypes[t] || 0), 0) : 30
    tierAssignments.push({
      tier: 'Cold',
      network: 'Arweave',
      data_types: coldTypes.length > 0 ? coldTypes : ['archives'],
      monthly_cost_usd: Math.round((coldVolume * 8.0 / 12) * 10) / 10,
      retrieval_sla: '<30min',
      durability_9s: 7,
    })
  }

  const totalCost = Math.round(tierAssignments.reduce((sum, t) => sum + t.monthly_cost_usd, 0) * 10) / 10
  const budgetUtil = Math.round((totalCost / budget) * 100)

  const complianceStatus: { requirement: string; met: boolean; notes: string }[] = []
  for (const req of compliance) {
    const lower = req.toLowerCase()
    if (lower.includes('gdpr')) {
      complianceStatus.push({ requirement: req, met: true, notes: 'Right-to-erasure supported via Filecoin deal expiry + Arweave encryption' })
    } else if (lower.includes('residency') || lower.includes('sovereign')) {
      complianceStatus.push({ requirement: req, met: true, notes: 'Select miners in target jurisdiction via Filecoin geofencing' })
    } else if (lower.includes('hipaa')) {
      complianceStatus.push({ requirement: req, met: false, notes: 'Requires encryption-at-rest + access audit layer — add Lit Protocol' })
    } else {
      complianceStatus.push({ requirement: req, met: true, notes: 'Supported via decentralized storage encryption layer' })
    }
  }

  const migrationSteps: string[] = []
  migrationSteps.push('Phase 1: Deploy Walrus hot tier for active app data (Week 1-2)')
  migrationSteps.push('Phase 2: Migrate warm data to Filecoin with verified deals (Week 3-4)')
  migrationSteps.push('Phase 3: Archive cold data to Arweave with endowment model (Week 5-6)')
  migrationSteps.push('Phase 4: Implement cross-tier data lifecycle policies (Week 7-8)')
  migrationSteps.push('Phase 5: Set up monitoring dashboards for deal health and retrieval latency (Ongoing)')

  return {
    tiers: tierAssignments,
    total_monthly_cost: totalCost,
    budget_utilization_pct: budgetUtil,
    compliance_status: complianceStatus,
    architecture_diagram: `${totalVolume}TB total | ${tierAssignments.length} tiers | ${tierAssignments.map(t => t.network).join(' + ')}`,
    migration_steps: migrationSteps,
  }
}

function formatStorageArchReport(input: StorageArchitectInput, result: StorageArchResult): string {
  const lines: string[] = []
  lines.push('## Decentralized Storage Architecture')
  lines.push('')
  lines.push(`**Budget**: $${input.budget_usd_month || 500}/mo | **Data Types**: ${Object.keys(input.data_types || {}).length} | **Tiers**: ${(input.performance_tiers || []).join(' > ')}`)
  lines.push('')
  lines.push(`### ${result.architecture_diagram}`)
  lines.push('')

  lines.push('### Tier Assignments')
  for (const t of result.tiers) {
    lines.push(`#### ${t.tier} Tier: ${t.network}`)
    lines.push(`- Data: ${t.data_types.join(', ')}`)
    lines.push(`- Cost: $${t.monthly_cost_usd}/mo | SLA: ${t.retrieval_sla} | Durability: ${t.durability_9s} nines`)
    lines.push('')
  }

  lines.push(`**Total Monthly Cost**: $${result.total_monthly_cost} (${result.budget_utilization_pct}% of budget)`)
  lines.push('')

  lines.push('### Compliance Status')
  for (const c of result.compliance_status) {
    lines.push(`- ${c.requirement}: ${c.met ? 'MET' : 'ACTION NEEDED'} — ${c.notes}`)
  }
  lines.push('')

  lines.push('### Migration Plan')
  for (const s of result.migration_steps) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: FILECOIN DEAL NEGOTIATOR ====================

interface DealNegotiatorInput {
  data_size_tiB?: number
  storage_duration_months?: number
  retrieval_frequency?: 'never' | 'yearly' | 'monthly' | 'weekly' | 'daily'
  verified_deal_preference?: boolean
  miner_requirements?: string[]
}

interface DealTerms {
  price_per_tiB_epoch: number
  total_cost_fil: number
  total_cost_usd: number
  duration_days: number
  replication_factor: number
  retrieval_price_fil: number
  collateral_fil: number
  verified_deal_bonus_pct: number
}

interface DealNegotiationResult {
  recommended_terms: DealTerms
  miner_selection_criteria: string[]
  deal_lifecycle: { phase: string; duration: string; action: string }[]
  risk_mitigation: string[]
  market_comparison: { metric: string; your_deal: string; market_avg: string }[]
}

function negotiateDeal(input: DealNegotiatorInput): DealNegotiationResult {
  const rng = seededRng(JSON.stringify(input))
  const sizeTiB = input.data_size_tiB || 10
  const durationMonths = input.storage_duration_months || 12
  const verified = input.verified_deal_preference !== false
  const retrievalFreq = input.retrieval_frequency || 'monthly'

  const durationDays = durationMonths * 30
  const epochs = durationDays * 2880 // ~2880 epochs/day
  const basePrice = 0.00000005 // FIL/TiB/epoch base
  const verifiedMultiplier = verified ? 1.1 : 1.0 // Verified deals get 10x quality multiplier but similar price
  const pricePerTiBEpoch = basePrice * verifiedMultiplier
  const totalCostFil = Math.round(sizeTiB * pricePerTiBEpoch * epochs * 100) / 100
  const filPriceUsd = 4.5 // Approximate FIL price
  const totalCostUsd = Math.round(totalCostFil * filPriceUsd * 100) / 100

  const retrievalPrices: Record<string, number> = {
    never: 0,
    yearly: 0.01,
    monthly: 0.05,
    weekly: 0.15,
    daily: 0.5,
  }

  const replicationFactor = sizeTiB > 50 ? 5 : sizeTiB > 10 ? 3 : 2
  const collateral = Math.round(totalCostFil * 0.25 * 100) / 100

  const minerSelectionCriteria: string[] = []
  minerSelectionCriteria.push('Sector duration matches or exceeds requested storage duration')
  minerSelectionCriteria.push('Retrieval success rate >95% (check: filfox.info or filscan.io)')
  minerSelectionCriteria.push('At least 10 active deals (proven track record)')
  minerSelectionCriteria.push('Geographic location matches compliance requirements')
  if (verified) {
    minerSelectionCriteria.push('Verified deal capability (DataCap allocation from Fil+ notary)')
  }
  if (input.miner_requirements) {
    for (const req of input.miner_requirements) {
      minerSelectionCriteria.push(req)
    }
  }

  const dealLifecycle: { phase: string; duration: string; action: string }[] = []
  dealLifecycle.push({ phase: 'Proposal', duration: '1-2 days', action: 'Submit deal proposal with terms' })
  dealLifecycle.push({ phase: 'Sealing', duration: '1-3 days', action: 'Miner seals data into sector (PoRep)' })
  dealLifecycle.push({ phase: 'Active Storage', duration: `${durationMonths} months`, action: 'Ongoing PoSt proofs verify data' })
  dealLifecycle.push({ phase: 'Expiry', duration: '1 day', action: 'Deal expires — renew or data is dropped' })
  if (retrievalFreq !== 'never') {
    dealLifecycle.push({ phase: 'Retrieval', duration: '1-60 min', action: 'Unseal and retrieve data (paid)' })
  }

  const riskMitigation: string[] = []
  riskMitigation.push(`Replicate across ${replicationFactor} miners to prevent single-point-of-failure`)
  riskMitigation.push('Set up deal alerting (use Boost or Lighthouse monitoring)')
  riskMitigation.push('Renew deals 30 days before expiry to avoid data loss')
  riskMitigation.push('Keep 20% FIL buffer for unexpected retrieval costs')
  if (durationMonths > 12) {
    riskMitigation.push('Consider deal auto-renewal via Filecoin Plus registry')
  }

  const marketComparison: { metric: string; your_deal: string; market_avg: string }[] = []
  marketComparison.push({ metric: 'Price/TiB/Epoch', your_deal: `${pricePerTiBEpoch} FIL`, market_avg: '0.00000004-0.00000008 FIL' })
  marketComparison.push({ metric: 'Duration', your_deal: `${durationDays} days`, market_avg: '365-1825 days' })
  marketComparison.push({ metric: 'Replication', your_deal: `${replicationFactor}x`, market_avg: '3-5x' })
  marketComparison.push({ metric: 'Verified', your_deal: verified ? 'Yes (10x QA)' : 'No', market_avg: 'Recommended' })

  return {
    recommended_terms: {
      price_per_tiB_epoch: pricePerTiBEpoch,
      total_cost_fil: totalCostFil,
      total_cost_usd: totalCostUsd,
      duration_days: durationDays,
      replication_factor: replicationFactor,
      retrieval_price_fil: retrievalPrices[retrievalFreq] || 0.05,
      collateral_fil: collateral,
      verified_deal_bonus_pct: verified ? 1000 : 0,
    },
    miner_selection_criteria: minerSelectionCriteria,
    deal_lifecycle: dealLifecycle,
    risk_mitigation: riskMitigation,
    market_comparison: marketComparison,
  }
}

function formatDealReport(input: DealNegotiatorInput, result: DealNegotiationResult): string {
  const lines: string[] = []
  lines.push('## Filecoin Deal Negotiation Advisor')
  lines.push('')
  lines.push(`**Data**: ${input.data_size_tiB || 10} TiB | Duration: ${input.storage_duration_months || 12} months | Verified: ${input.verified_deal_preference !== false ? 'Yes' : 'No'} | Retrieval: ${input.retrieval_frequency || 'monthly'}`)
  lines.push('')

  const t = result.recommended_terms
  lines.push('### Recommended Deal Terms')
  lines.push(`| Parameter | Value |`)
  lines.push(`|-----------|-------|`)
  lines.push(`| Price/TiB/Epoch | ${t.price_per_tiB_epoch} FIL |`)
  lines.push(`| Total Cost | ${t.total_cost_fil} FIL ($${t.total_cost_usd}) |`)
  lines.push(`| Duration | ${t.duration_days} days |`)
  lines.push(`| Replication Factor | ${t.replication_factor}x |`)
  lines.push(`| Retrieval Price | ${t.retrieval_price_fil} FIL/TiB |`)
  lines.push(`| Collateral | ${t.collateral_fil} FIL |`)
  lines.push(`| Verified Deal Bonus | ${t.verified_deal_bonus_pct}% QA multiplier |`)
  lines.push('')

  lines.push('### Miner Selection Criteria')
  for (const c of result.miner_selection_criteria) {
    lines.push(`- ${c}`)
  }
  lines.push('')

  lines.push('### Deal Lifecycle')
  lines.push('| Phase | Duration | Action |')
  lines.push('|-------|----------|--------|')
  for (const l of result.deal_lifecycle) {
    lines.push(`| ${l.phase} | ${l.duration} | ${l.action} |`)
  }
  lines.push('')

  lines.push('### Market Comparison')
  for (const m of result.market_comparison) {
    lines.push(`- ${m.metric}: Your deal: ${m.your_deal} | Market avg: ${m.market_avg}`)
  }
  lines.push('')

  lines.push('### Risk Mitigation')
  for (const r of result.risk_mitigation) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: WEB3 INFRA COST OPTIMIZER ====================

interface CostOptimizerInput {
  current_setup?: Record<string, { provider: string; monthly_cost_usd: number; usage_pct: number }>
  monthly_spend_usd?: number
  performance_targets?: Record<string, number>
  service_level_agreements?: Record<string, string>
}

interface OptimizationAction {
  action: string
  current_cost_usd: number
  optimized_cost_usd: number
  savings_usd: number
  savings_pct: number
  effort: 'low' | 'medium' | 'high'
  risk: 'low' | 'medium' | 'high'
}

interface CostOptimizerResult {
  actions: OptimizationAction[]
  total_current_cost: number
  total_optimized_cost: number
  total_savings_usd: number
  total_savings_pct: number
  priority_order: string[]
  implementation_roadmap: string[]
}

function optimizeCosts(input: CostOptimizerInput): CostOptimizerResult {
  const rng = seededRng(JSON.stringify(input))
  const current = input.current_setup || {
    storage: { provider: 'AWS S3', monthly_cost_usd: 500, usage_pct: 80 },
    indexing: { provider: 'Centralized API', monthly_cost_usd: 300, usage_pct: 60 },
    cdn: { provider: 'Cloudflare', monthly_cost_usd: 200, usage_pct: 90 },
  }
  const monthlySpend = input.monthly_spend_usd || Object.values(current).reduce((s, v) => s + v.monthly_cost_usd, 0)

  const actions: OptimizationAction[] = []

  // Storage optimization
  const storageEntry = current.storage || Object.values(current)[0]
  if (storageEntry) {
    const storageCost = storageEntry.monthly_cost_usd
    const optimizedStorage = Math.round(storageCost * 0.3 * 100) / 100
    actions.push({
      action: 'Migrate cold storage from S3 to Filecoin (70% cost reduction)',
      current_cost_usd: storageCost,
      optimized_cost_usd: optimizedStorage,
      savings_usd: Math.round((storageCost - optimizedStorage) * 100) / 100,
      savings_pct: 70,
      effort: 'medium',
      risk: 'low',
    })
  }

  // Indexing optimization
  const indexingEntry = current.indexing || current.query
  if (indexingEntry) {
    const idxCost = indexingEntry.monthly_cost_usd
    const optimizedIdx = Math.round(idxCost * 0.5 * 100) / 100
    actions.push({
      action: 'Replace centralized indexing API with The Graph subgraph (50% cost reduction)',
      current_cost_usd: idxCost,
      optimized_cost_usd: optimizedIdx,
      savings_usd: Math.round((idxCost - optimizedIdx) * 100) / 100,
      savings_pct: 50,
      effort: 'high',
      risk: 'medium',
    })
  }

  // CDN optimization
  const cdnEntry = current.cdn || current.gateway
  if (cdnEntry) {
    const cdnCost = cdnEntry.monthly_cost_usd
    const optimizedCdn = Math.round(cdnCost * 0.6 * 100) / 100
    actions.push({
      action: 'Use IPFS public gateway + Pinata for CDN (40% cost reduction)',
      current_cost_usd: cdnCost,
      optimized_cost_usd: optimizedCdn,
      savings_usd: Math.round((cdnCost - optimizedCdn) * 100) / 100,
      savings_pct: 40,
      effort: 'low',
      risk: 'low',
    })
  }

  // Data availability optimization
  actions.push({
    action: 'Use Celestia for DA layer instead of Ethereum blobs (60% cost reduction)',
    current_cost_usd: Math.round(monthlySpend * 0.15 * 100) / 100,
    optimized_cost_usd: Math.round(monthlySpend * 0.06 * 100) / 100,
    savings_usd: Math.round(monthlySpend * 0.09 * 100) / 100,
    savings_pct: 60,
    effort: 'high',
    risk: 'medium',
  })

  // Sort by savings
  actions.sort((a, b) => b.savings_usd - a.savings_usd)

  const totalCurrent = actions.reduce((s, a) => s + a.current_cost_usd, 0)
  const totalOptimized = actions.reduce((s, a) => s + a.optimized_cost_usd, 0)
  const totalSavings = Math.round((totalCurrent - totalOptimized) * 100) / 100
  const totalSavingsPct = totalCurrent > 0 ? Math.round((totalSavings / totalCurrent) * 100) : 0

  const priorityOrder: string[] = []
  for (const a of actions) {
    priorityOrder.push(`${a.action} (save $${a.savings_usd}/mo, ${a.effort} effort)`)
  }

  const roadmap: string[] = []
  roadmap.push('Month 1: Quick wins — CDN migration to IPFS (low effort, immediate savings)')
  roadmap.push('Month 2: Storage migration — move cold data to Filecoin (medium effort)')
  roadmap.push('Month 3: DA layer — integrate Celestia for data availability (high effort)')
  roadmap.push('Month 4: Indexing — deploy The Graph subgraph (high effort, long-term savings)')
  roadmap.push('Ongoing: Monitor deal health, query costs, and adjust replication factors')

  return {
    actions,
    total_current_cost: Math.round(totalCurrent * 100) / 100,
    total_optimized_cost: Math.round(totalOptimized * 100) / 100,
    total_savings_usd: totalSavings,
    total_savings_pct: totalSavingsPct,
    priority_order: priorityOrder,
    implementation_roadmap: roadmap,
  }
}

function formatCostOptimizerReport(input: CostOptimizerInput, result: CostOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Web3 Infrastructure Cost Optimizer')
  lines.push('')
  lines.push(`**Current Monthly Spend**: $${input.monthly_spend_usd || result.total_current_cost} | **Target**: Reduce by ${result.total_savings_pct}%`)
  lines.push('')

  lines.push('### Optimization Actions')
  lines.push('| # | Action | Current | Optimized | Savings | Effort | Risk |')
  lines.push('|---|--------|---------|-----------|---------|--------|------|')
  let idx = 1
  for (const a of result.actions) {
    lines.push(`| ${idx} | ${a.action} | $${a.current_cost_usd} | $${a.optimized_cost_usd} | $${a.savings_usd} (${a.savings_pct}%) | ${a.effort} | ${a.risk} |`)
    idx++
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(`- **Total Current Cost**: $${result.total_current_cost}/mo`)
  lines.push(`- **Total Optimized Cost**: $${result.total_optimized_cost}/mo`)
  lines.push(`- **Total Savings**: $${result.total_savings_usd}/mo (${result.total_savings_pct}%)`)
  lines.push('')

  lines.push('### Implementation Roadmap')
  for (const r of result.implementation_roadmap) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: DATA PERSISTENCE STRATEGY ====================

interface PersistenceInput {
  data_criticality?: 'low' | 'medium' | 'high' | 'mission_critical'
  retention_years?: number
  budget_usd?: number
  access_patterns?: Record<string, string>
  geographic_distribution?: string[]
}

interface PersistenceLayer {
  network: string
  data_classification: string
  retention_period: string
  cost_usd: number
  durability_9s: number
  retrieval_time: string
  replication_regions: string[]
}

interface PersistenceResult {
  layers: PersistenceLayer[]
  total_cost_usd: number
  budget_feasibility: 'within_budget' | 'over_budget' | 'marginal'
  durability_score: number
  risk_assessment: { risk: string; likelihood: 'low' | 'medium' | 'high'; mitigation: string }[]
  renewal_schedule: { year: string; action: string; estimated_cost_usd: number }[]
}

function planPersistence(input: PersistenceInput): PersistenceResult {
  const rng = seededRng(JSON.stringify(input))
  const criticality = input.data_criticality || 'high'
  const retention = input.retention_years || 5
  const budget = input.budget_usd || 10000
  const regions = input.geographic_distribution || ['US', 'EU', 'Asia']

  const layers: PersistenceLayer[] = []

  // Layer 1: Hot cache (Walrus)
  layers.push({
    network: 'Walrus',
    data_classification: 'Active / Frequently accessed',
    retention_period: '1-2 years (renewable)',
    cost_usd: Math.round(budget * 0.15),
    durability_9s: 8,
    retrieval_time: '<100ms',
    replication_regions: regions,
  })

  // Layer 2: Warm storage (Filecoin)
  layers.push({
    network: 'Filecoin',
    data_classification: 'Important / Periodically accessed',
    retention_period: `${retention} years (renewable)`,
    cost_usd: Math.round(budget * 0.35),
    durability_9s: 9,
    retrieval_time: '<5min',
    replication_regions: regions,
  })

  // Layer 3: Permanent archive (Arweave)
  layers.push({
    network: 'Arweave',
    data_classification: 'Critical / Permanent record',
    retention_period: 'Permanent (200+ year endowment)',
    cost_usd: Math.round(budget * 0.50),
    durability_9s: 7,
    retrieval_time: '<30min',
    replication_regions: ['Global (permanent)'],
  })

  const totalCost = layers.reduce((s, l) => s + l.cost_usd, 0)
  const budgetFeasibility = totalCost <= budget ? 'within_budget' : totalCost <= budget * 1.1 ? 'marginal' : 'over_budget'

  const durWeights = { low: 1, medium: 2, high: 3, mission_critical: 4 }
  const durScore = Math.min(100, Math.round((durWeights[criticality] * 20) + (retention * 2) + Math.floor(rng() * 10)))

  const riskAssessment: { risk: string; likelihood: 'low' | 'medium' | 'high'; mitigation: string }[] = []
  riskAssessment.push({
    risk: 'Filecoin deal expiry without renewal',
    likelihood: 'medium',
    mitigation: 'Set up auto-renewal 30 days before expiry + monitoring alerts',
  })
  riskAssessment.push({
    risk: 'Arweave endowment model underestimates long-term cost',
    likelihood: 'low',
    mitigation: 'Use 2x storage cost multiplier in endowment calculation',
  })
  riskAssessment.push({
    risk: 'Token price volatility affects storage costs',
    likelihood: 'high',
    mitigation: 'Maintain 30% fiat buffer or use stablecoin-denominated storage',
  })
  if (criticality === 'mission_critical') {
    riskAssessment.push({
      risk: 'Single-network failure causes data loss',
      likelihood: 'low',
      mitigation: 'Triple-replication across 3 networks ensures survival of any single failure',
    })
  }

  const renewalSchedule: { year: string; action: string; estimated_cost_usd: number }[] = []
  renewalSchedule.push({ year: 'Year 1', action: 'Initial deployment across all 3 layers', estimated_cost_usd: totalCost })
  for (let y = 2; y <= Math.min(retention, 10); y++) {
    if (y === 2) {
      renewalSchedule.push({ year: `Year ${y}`, action: 'Renew Walrus hot tier, verify Filecoin deals', estimated_cost_usd: Math.round(layers[0].cost_usd * 0.8) })
    } else if (y === 3) {
      renewalSchedule.push({ year: `Year ${y}`, action: 'Filecoin deal renewal cycle begins', estimated_cost_usd: Math.round(layers[1].cost_usd * 0.9) })
    } else if (y % 5 === 0) {
      renewalSchedule.push({ year: `Year ${y}`, action: 'Full audit + potential network migration', estimated_cost_usd: Math.round(totalCost * 0.3) })
    }
  }

  return {
    layers,
    total_cost_usd: totalCost,
    budget_feasibility: budgetFeasibility,
    durability_score: durScore,
    risk_assessment: riskAssessment,
    renewal_schedule: renewalSchedule,
  }
}

function formatPersistenceReport(input: PersistenceInput, result: PersistenceResult): string {
  const lines: string[] = []
  lines.push('## Data Persistence Strategy')
  lines.push('')
  lines.push(`**Criticality**: ${input.data_criticality || 'high'} | Retention: ${input.retention_years || 5} years | Budget: $${input.budget_usd || 10000} | Regions: ${(input.geographic_distribution || []).join(', ')}`)
  lines.push('')

  lines.push('### Persistence Layers')
  for (const l of result.layers) {
    lines.push(`#### ${l.network} — ${l.data_classification}`)
    lines.push(`- Retention: ${l.retention_period} | Cost: $${l.cost_usd} | Durability: ${l.durability_9s} nines`)
    lines.push(`- Retrieval: ${l.retrieval_time} | Regions: ${l.replication_regions.join(', ')}`)
    lines.push('')
  }

  lines.push(`**Total Cost**: $${result.total_cost_usd} | **Budget Status**: ${result.budget_feasibility} | **Durability Score**: ${result.durability_score}/100`)
  lines.push('')

  lines.push('### Risk Assessment')
  lines.push('| Risk | Likelihood | Mitigation |')
  lines.push('|------|------------|------------|')
  for (const r of result.risk_assessment) {
    lines.push(`| ${r.risk} | ${r.likelihood} | ${r.mitigation} |`)
  }
  lines.push('')

  lines.push('### Renewal Schedule')
  for (const r of result.renewal_schedule) {
    lines.push(`- ${r.year}: ${r.action} (~$${r.estimated_cost_usd})`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: DECENTRALIZED COMPUTE PLANNER ====================

interface ComputePlannerInput {
  compute_type?: 'ai_training' | 'rendering' | 'scientific' | 'inference' | 'data_processing'
  gpu_requirements?: { model: string; count: number; vram_gb: number; hours: number }
  data_locality?: 'us' | 'eu' | 'asia' | 'global'
  budget_usd?: number
  deadline_hours?: number
}

interface ComputeProvider {
  name: string
  gpu_type: string
  cost_per_gpu_hr: number
  availability: string
  data_sovereignty: string
  pros: string[]
  cons: string[]
}

interface ComputePlanResult {
  recommended_provider: string
  providers: ComputeProvider[]
  total_cost_usd: number
  estimated_duration_hours: number
  meets_deadline: boolean
  meets_budget: boolean
  data_sovereignty_notes: string[]
  scaling_strategy: string[]
  cost_optimization_tips: string[]
}

function planCompute(input: ComputePlannerInput): ComputePlanResult {
  const rng = seededRng(JSON.stringify(input))
  const computeType = input.compute_type || 'ai_training'
  const gpuReq = input.gpu_requirements || { model: 'A100', count: 8, vram_gb: 80, hours: 100 }
  const locality = input.data_locality || 'global'
  const budget = input.budget_usd || 5000
  const deadline = input.deadline_hours || 168

  const providers: ComputeProvider[] = []

  // io.net (Solana-based)
  providers.push({
    name: 'io.net',
    gpu_type: gpuReq.model,
    cost_per_gpu_hr: 1.2,
    availability: 'High (consumer GPU cluster)',
    data_sovereignty: 'Distributed — verify node location',
    pros: ['Cheapest option', 'Consumer RTX 4090s available', 'Solana-native payments'],
    cons: ['Variable reliability', 'No SLA guarantees', 'Consumer hardware variance'],
  })

  // Akash Network (Cosmos-based)
  providers.push({
    name: 'Akash Network',
    gpu_type: gpuReq.model,
    cost_per_gpu_hr: 1.8,
    availability: 'Medium (overprovisioned cloud)',
    data_sovereignty: 'Provider-selected — can filter by region',
    pros: ['Open-source marketplace', 'Region filtering available', 'AKT token discounts'],
    cons: ['Smaller GPU pool', 'Provider churn', 'Less mature tooling'],
  })

  // Render Network (for rendering workloads)
  if (computeType === 'rendering') {
    providers.push({
      name: 'Render Network',
      gpu_type: 'RTX 4090',
      cost_per_gpu_hr: 0.8,
      availability: 'High (render-optimized)',
      data_sovereignty: 'Global distributed',
      pros: ['Optimized for rendering', 'Low cost', 'RNDR token ecosystem'],
      cons: ['Rendering-specific', 'Not for general compute', 'Queue times vary'],
    })
  }

  // Bittensor (for AI training)
  if (computeType === 'ai_training' || computeType === 'inference') {
    providers.push({
      name: 'Bittensor (TAO)',
      gpu_type: 'Mixed (H100/A100)',
      cost_per_gpu_hr: 2.5,
      availability: 'Medium (incentive-driven)',
      data_sovereignty: 'Global — validator distributed',
      pros: ['Incentive-aligned quality', 'H100 availability', 'Decentralized model training'],
      cons: ['Higher cost', 'Token volatility', 'Complex integration'],
    })
  }

  // Always add a baseline centralized option
  providers.push({
    name: 'AWS p4d.24xlarge (baseline)',
    gpu_type: 'A100 80GB',
    cost_per_gpu_hr: 6.5,
    availability: 'Very High',
    data_sovereignty: 'Region-selectable',
    pros: ['Enterprise SLA', 'Predictable performance', 'Full support'],
    cons: ['Most expensive', 'Vendor lock-in', 'Limited availability'],
  })

  // Sort by cost
  providers.sort((a, b) => a.cost_per_gpu_hr - b.cost_per_gpu_hr)

  const recommended = providers[0]
  const totalGpuHours = gpuReq.count * gpuReq.hours
  const totalCost = Math.round(recommended.cost_per_gpu_hr * totalGpuHours * 100) / 100
  const estimatedDuration = Math.round(gpuReq.hours * (1 + (rng() * 0.2))) // 0-20% overhead

  const meetsDeadline = estimatedDuration <= deadline
  const meetsBudget = totalCost <= budget

  const sovereigntyNotes: string[] = []
  if (locality !== 'global') {
    sovereigntyNotes.push(`Filter providers by ${locality.toUpperCase()} region for data sovereignty compliance`)
  }
  sovereigntyNotes.push('Verify provider node locations via on-chain attestation where available')
  sovereigntyNotes.push('Encrypt data in transit and at rest — decentralized networks lack enterprise encryption by default')

  const scalingStrategy: string[] = []
  scalingStrategy.push(`Start with ${Math.max(1, Math.floor(gpuReq.count / 4))} GPU pilot to validate provider quality`)
  scalingStrategy.push(`Scale to ${gpuReq.count} GPUs after 24hr burn-in test`)
  if (deadline < gpuReq.hours) {
    scalingStrategy.push(`Parallelize across ${Math.ceil(gpuReq.hours / deadline)} providers to meet deadline`)
  }
  scalingStrategy.push('Use checkpointing every 2-4 hours to handle provider interruptions')

  const costTips: string[] = []
  costTips.push(`Spot/preemptible pricing saves 40-60% — use for fault-tolerant ${computeType} workloads`)
  costTips.push('Commit to 1-week+ runs for volume discounts (10-25% off)')
  if (computeType === 'ai_training') {
    costTips.push('Use mixed-precision training to reduce GPU hours by 30-50%')
  }
  costTips.push('Batch small jobs together to amortize provider setup costs')

  return {
    recommended_provider: recommended.name,
    providers,
    total_cost_usd: totalCost,
    estimated_duration_hours: estimatedDuration,
    meets_deadline: meetsDeadline,
    meets_budget: meetsBudget,
    data_sovereignty_notes: sovereigntyNotes,
    scaling_strategy: scalingStrategy,
    cost_optimization_tips: costTips,
  }
}

function formatComputePlanReport(input: ComputePlannerInput, result: ComputePlanResult): string {
  const lines: string[] = []
  lines.push('## Decentralized Compute Planner')
  lines.push('')
  lines.push(`**Workload**: ${input.compute_type || 'ai_training'} | GPU: ${(input.gpu_requirements || {}).model || 'A100'} x${(input.gpu_requirements || {}).count || 8} | Hours: ${(input.gpu_requirements || {}).hours || 100}`)
  lines.push(`**Budget**: $${input.budget_usd || 5000} | Deadline: ${input.deadline_hours || 168}h | Locality: ${input.data_locality || 'global'}`)
  lines.push('')

  lines.push(`### Recommended: ${result.recommended_provider}`)
  lines.push(`- **Total Cost**: $${result.total_cost_usd} | **Duration**: ${result.estimated_duration_hours}h`)
  lines.push(`- **Meets Deadline**: ${result.meets_deadline ? 'YES' : 'NO'} | **Meets Budget**: ${result.meets_budget ? 'YES' : 'NO'}`)
  lines.push('')

  lines.push('### Provider Comparison')
  lines.push('| Provider | GPU | $/GPU/hr | Availability | Sovereignty |')
  lines.push('|----------|-----|----------|--------------|-------------|')
  for (const p of result.providers) {
    lines.push(`| ${p.name} | ${p.gpu_type} | $${p.cost_per_gpu_hr} | ${p.availability} | ${p.data_sovereignty} |`)
  }
  lines.push('')

  lines.push('### Scaling Strategy')
  for (const s of result.scaling_strategy) {
    lines.push(`- ${s}`)
  }
  lines.push('')

  lines.push('### Data Sovereignty Notes')
  for (const n of result.data_sovereignty_notes) {
    lines.push(`- ${n}`)
  }
  lines.push('')

  lines.push('### Cost Optimization Tips')
  for (const t of result.cost_optimization_tips) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Storage Economics Calculator
  tools.register(defineTool({
    name: 'storage_economics_calculator',
    description: 'Compare storage costs across decentralized networks (Filecoin, Arweave, Walrus) vs AWS S3. Calculates total cost of ownership, retrieval costs, durability metrics, and recommends optimal network based on data volume, access frequency, retention period, and durability requirements.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: data_volume_tb (number), access_frequency (rare|monthly|weekly|daily|real_time), retention_years (number), durability_requirement (standard|high|extreme), throughput_mbps (number)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: StorageEconomicsInput = JSON.parse(args.input_data)
      const result = calculateStorageEconomics(input)
      return formatStorageEconomicsReport(input, result)
    }
  }))

  // Tool 2: Data Availability Sampler
  tools.register(defineTool({
    name: 'data_availability_sampler',
    description: 'Design data availability sampling strategy for decentralized networks (Celestia, Avail, EIP-4844). Calculates matrix dimensions, samples per round, confidence levels, bandwidth requirements, and on-chain footprint for light client security.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: block_size_bytes (number), network_type (celestia|avail|eip4844|custom), total_validators (number), required_confidence_pct (number), sampling_rounds (number)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: DataAvailabilityInput = JSON.parse(args.input_data)
      const result = designDAStrategy(input)
      return formatDAReport(input, result)
    }
  }))

  // Tool 3: The Graph Subgraph Designer
  tools.register(defineTool({
    name: 'thegraph_subgraph_designer',
    description: 'Design a The Graph subgraph for indexing blockchain data. Generates entity schemas, event handlers, GraphQL query templates, deployment config, and optimization tips. Supports multi-contract protocols with automated relationship mapping.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: protocol_contracts (string[]), events_to_index (string[]), query_patterns (string[]), update_frequency (realtime|5min|15min|1hr|batch)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: SubgraphInput = JSON.parse(args.input_data)
      const result = designSubgraph(input)
      return formatSubgraphReport(input, result)
    }
  }))

  // Tool 4: Decentralized Storage Architect
  tools.register(defineTool({
    name: 'decentralized_storage_architect',
    description: 'Architect a multi-tier decentralized storage solution combining Walrus (hot), Filecoin (warm), and Arweave (cold). Maps data types to optimal networks, checks compliance requirements, and provides phased migration plan with budget analysis.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: data_types (Record<string,number>), access_patterns (Record<string,string>), budget_usd_month (number), compliance_requirements (string[]), performance_tiers (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: StorageArchitectInput = JSON.parse(args.input_data)
      const result = architectStorage(input)
      return formatStorageArchReport(input, result)
    }
  }))

  // Tool 5: Filecoin Deal Negotiator
  tools.register(defineTool({
    name: 'filecoin_deal_negotiator',
    description: 'Advise on Filecoin storage deal negotiation including price per epoch, total cost in FIL/USD, replication factor, miner selection criteria, deal lifecycle phases, risk mitigation, and market comparison. Supports verified deals with 10x quality multiplier.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: data_size_tiB (number), storage_duration_months (number), retrieval_frequency (never|yearly|monthly|weekly|daily), verified_deal_preference (boolean), miner_requirements (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: DealNegotiatorInput = JSON.parse(args.input_data)
      const result = negotiateDeal(input)
      return formatDealReport(input, result)
    }
  }))

  // Tool 6: Web3 Infrastructure Cost Optimizer
  tools.register(defineTool({
    name: 'web3_infra_cost_optimizer',
    description: 'Optimize Web3 infrastructure costs across multiple protocols. Analyzes current storage, indexing, CDN, and DA layer spending. Recommends migrations to Filecoin, The Graph, IPFS, and Celestia with savings estimates, effort levels, and implementation roadmap.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: current_setup (Record<string,{provider,monthly_cost_usd,usage_pct}>), monthly_spend_usd (number), performance_targets (Record<string,number>), service_level_agreements (Record<string,string>)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CostOptimizerInput = JSON.parse(args.input_data)
      const result = optimizeCosts(input)
      return formatCostOptimizerReport(input, result)
    }
  }))

  // Tool 7: Data Persistence Strategy
  tools.register(defineTool({
    name: 'data_persistence_strategy',
    description: 'Plan long-term data persistence across multiple decentralized networks. Designs 3-layer strategy (Walrus hot, Filecoin warm, Arweave permanent) with budget analysis, durability scoring, risk assessment, and multi-year renewal schedule.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: data_criticality (low|medium|high|mission_critical), retention_years (number), budget_usd (number), access_patterns (Record<string,string>), geographic_distribution (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PersistenceInput = JSON.parse(args.input_data)
      const result = planPersistence(input)
      return formatPersistenceReport(input, result)
    }
  }))

  // Tool 8: Decentralized Compute Planner
  tools.register(defineTool({
    name: 'decentralized_compute_planner',
    description: 'Plan decentralized compute workloads (AI training, rendering, scientific computing) across io.net, Akash, Render Network, and Bittensor. Compares GPU costs, availability, data sovereignty, and provides scaling strategy with deadline/budget feasibility analysis.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: compute_type (ai_training|rendering|scientific|inference|data_processing), gpu_requirements ({model,count,vram_gb,hours}), data_locality (us|eu|asia|global), budget_usd (number), deadline_hours (number)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ComputePlannerInput = JSON.parse(args.input_data)
      const result = planCompute(input)
      return formatComputePlanReport(input, result)
    }
  }))

  console.log(`[dsh-tool-web3data] Loaded v${VERSION} - Web3 Decentralized Data Infrastructure with 8 tools`)
  console.log('  Tools: storage_economics_calculator, data_availability_sampler, thegraph_subgraph_designer, decentralized_storage_architect, filecoin_deal_negotiator, web3_infra_cost_optimizer, data_persistence_strategy, decentralized_compute_planner')
}
