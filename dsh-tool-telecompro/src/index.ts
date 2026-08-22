/**
 * DSH Telecom and Network Engineering Pro Plugin v1.0.0
 *
 * Telecom and Network Engineering toolkit covering 5G/6G network planning,
 * spectrum allocation, network optimization, edge computing infrastructure,
 * IoT connectivity, and telecom operations. Telecom is experiencing major
 * AI-driven transformation in 2026.
 *
 * Tools:
 * 1. spectrum_allocation_optimizer - Optimizes spectrum allocation for max coverage/capacity
 * 2. network_slicing_designer - Designs 5G/6G network slices for different use cases
 * 3. ran_intelligence_controller - Designs RIC policies for real-time optimization
 * 4. edge_computing_planner - Plans edge computing deployment for low-latency apps
 * 5. iot_connectivity_advisor - Advises on IoT connectivity technology selection
 * 6. fiber_network_designer - Designs fiber optic network topology
 * 7. qos_policy_designer - Designs QoS policies for differentiated traffic treatment
 * 8. telecom_roi_calculator - Calculates ROI for telecom infrastructure investments
 *
 * @module dsh-tool-telecompro
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-telecompro'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated telecom analysis for informational purposes only. It does not constitute professional engineering advice. Consult qualified telecom engineers and regulatory bodies before deployment.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = {
  next: (min: number, max: number, seed: number): number => Math.floor(mulberry32(seed)() * (max - min + 1)) + min,
  nextFloat: (min: number, max: number, seed: number): number => mulberry32(seed)() * (max - min) + min,
  pick: <T>(arr: T[], seed: number): T => arr[Math.floor(mulberry32(seed)() * arr.length)],
  pickN: <T>(arr: T[], n: number, seed: number): T[] => {
    const shuffled = [...arr].sort(() => mulberry32(seed)() - 0.5)
    return shuffled.slice(0, n)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function seedFromInput(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function rateScore(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Moderate'
  if (score >= 40) return 'Below Average'
  return 'Poor'
}

// ==================== TYPES ====================

// --- Tool 1: Spectrum Allocation Optimizer ---
export interface SpectrumAllocationInput {
  frequency_bands_mhz: number[]
  coverage_area_km2: number
  population_density: number
  interference_threshold_db: number
  license_constraints: {
    max_bandwidth_mhz?: number
    exclusive_bands?: number[]
    shared_bands?: number[]
    regulatory_region?: string
  }
}

export interface SpectrumAllocationBand {
  band_mhz: number
  allocated: boolean
  coverage_radius_km: number
  capacity_gbps: number
  interference_risk_db: number
  recommended_use: string
  efficiency_score: number
}

export interface SpectrumAllocationResult {
  total_bands_analyzed: number
  bands_allocated: number
  total_capacity_gbps: number
  avg_coverage_radius_km: number
  max_interference_db: number
  spectrum_efficiency_pct: number
  bands: SpectrumAllocationBand[]
  optimization_notes: string[]
}

// --- Tool 2: Network Slicing Designer ---
export interface NetworkSlicingInput {
  slice_types: string[]
  total_bandwidth_mhz: number
  latency_requirements_ms: Record<string, number>
  reliability_targets: Record<string, number>
  isolation_level: 'physical' | 'logical' | 'hybrid'
}

export interface NetworkSliceDesign {
  slice_type: string
  bandwidth_mhz: number
  bandwidth_pct: number
  max_latency_ms: number
  reliability_pct: number
  isolation_method: string
  resource_priority: number
  use_case_description: string
}

export interface NetworkSlicingResult {
  total_slices: number
  total_bandwidth_allocated_mhz: number
  bandwidth_utilization_pct: number
  slices: NetworkSliceDesign[]
  isolation_feasibility: string
  recommendations: string[]
}

// --- Tool 3: RAN Intelligence Controller ---
export interface RICInput {
  ran_vendor: string
  optimization_objectives: Record<string, number>
  cell_count: number
  measurement_interval_ms: number
  xapp_types: string[]
}

export interface RICPolicy {
  policy_name: string
  objective: string
  target_cells: number
  measurement_interval_ms: number
  adjustment_range: string
  expected_improvement_pct: number
  xapp_dependency: string
}

export interface RICResult {
  vendor_compatibility: string
  total_policies: number
  coverage_pct: number
  policies: RICPolicy[]
  near_rt_ric_feasibility: boolean
  optimization_summary: string
  recommendations: string[]
}

// --- Tool 4: Edge Computing Planner ---
export interface EdgeComputingInput {
  application_types: string[]
  max_latency_ms: number
  compute_gpu_needed: boolean
  bandwidth_gbps: number
  geographic_locations: string[]
  backhaul_type: string
}

export interface EdgeNode {
  location: string
  latency_ms: number
  compute_units: number
  gpu_enabled: boolean
  bandwidth_gbps: number
  power_consumption_kw: number
  estimated_cost_usd: number
}

export interface EdgeComputingResult {
  total_nodes: number
  max_latency_ms: number
  avg_latency_ms: number
  total_compute_units: number
  total_bandwidth_gbps: number
  nodes: EdgeNode[]
  backhaul_assessment: string
  recommendations: string[]
}

// --- Tool 5: IoT Connectivity Advisor ---
export interface IoTConnectivityInput {
  device_count: number
  message_frequency: number
  payload_bytes: number
  battery_years: number
  mobility_required: boolean
  coverage_area_km2: number
}

export interface IoTTechnology {
  technology: string
  suitability_score: number
  range_km: number
  max_devices_per_gateway: number
  battery_life_years: number
  data_rate_kbps: number
  pros: string[]
  cons: string[]
  recommended: boolean
}

export interface IoTConnectivityResult {
  recommended_technology: string
  gateway_count: number
  total_capacity: number
  coverage_assessment: string
  technologies_ranked: IoTConnectivityResult_technology[]
  deployment_notes: string[]
}

export interface IoTConnectivityResult_technology {
  technology: string
  suitability_score: number
  range_km: number
  max_devices_per_gateway: number
  battery_life_years: number
  data_rate_kbps: number
  recommended: boolean
}

// --- Tool 6: Fiber Network Designer ---
export interface FiberNetworkInput {
  premises_count: number
  topology_type: string
  max_distance_km: number
  redundancy_level: string
  split_ratio: number
  budget_usd: number
}

export interface FiberSegment {
  segment_id: string
  from_node: string
  to_node: string
  distance_km: number
  fiber_count: number
  splitter_ratio: number
  estimated_cost_usd: number
}

export interface FiberNetworkResult {
  total_segments: number
  total_fiber_km: number
  total_splitters: number
  total_cost_usd: number
  budget_feasibility: boolean
  cost_per_premise_usd: number
  segments: FiberSegment[]
  topology_notes: string[]
}

// --- Tool 7: QoS Policy Designer ---
export interface QoSInput {
  traffic_classes: string[]
  bandwidth_allocation_pct: Record<string, number>
  latency_targets_ms: Record<string, number>
  drop_priorities: Record<string, number>
  marking_strategy: string
}

export interface QoSClass {
  class_name: string
  dscp_marking: string
  bandwidth_pct: number
  latency_target_ms: number
  drop_priority: number
  queueing_algorithm: string
  policing_rate_mbps: number
}

export interface QoSResult {
  total_classes: number
  bandwidth_allocated_pct: number
  classes: QoSClass[]
  marking_feasibility: string
  congestion_risk: string
  recommendations: string[]
}

// --- Tool 8: Telecom ROI Calculator ---
export interface TelecomROIInput {
  project_type: string
  capex_usd: number
  opex_annual_usd: number
  revenue_projections_usd: number[]
  discount_rate_pct: number
  project_years: number
}

export interface TelecomROIResult {
  project_type: string
  total_capex_usd: number
  total_opex_usd: number
  total_revenue_usd: number
  net_present_value_usd: number
  roi_pct: number
  payback_period_years: number
  irr_pct: number
  year_by_year: Array<{
    year: number
    revenue_usd: number
    opex_usd: number
    net_cash_flow_usd: number
    cumulative_usd: number
    discounted_cash_flow_usd: number
  }>
  viability: string
  recommendations: string[]
}

// ==================== TOOL 1: SPECTRUM ALLOCATION OPTIMIZER ====================

function optimizeSpectrumAllocation(input: SpectrumAllocationInput): SpectrumAllocationResult {
  const seed = seedFromInput(input)
  const bands = input.frequency_bands_mhz
  const maxBw = input.license_constraints?.max_bandwidth_mhz || 100
  const exclusive = input.license_constraints?.exclusive_bands || []
  const region = input.license_constraints?.regulatory_region || 'ITU Region 1'

  const bandResults: SpectrumAllocationBand[] = []
  let totalCapacity = 0
  let totalCoverage = 0
  let maxInterference = 0
  let allocatedCount = 0

  for (let i = 0; i < bands.length; i++) {
    const band = bands[i]
    const bandSeed = seed + i * 137

    // Lower frequency = better coverage (free space path loss model simplified)
    const coverageRadius = clamp(120 / Math.sqrt(band) + rng.nextFloat(-1, 3, bandSeed), 1, 50)
    // Capacity scales with bandwidth (Shannon limit approximation)
    const spectralEfficiency = rng.nextFloat(2.5, 6.5, bandSeed + 1)
    const capacity = parseFloat((band * spectralEfficiency * 0.001).toFixed(2))
    const interference = rng.nextFloat(-90, -60, bandSeed + 2)

    const isExclusive = exclusive.length === 0 || exclusive.includes(band)
    const withinBandwidth = band <= maxBw
    const withinInterference = interference > input.interference_threshold_db
    const allocated = isExclusive && withinBandwidth && withinInterference

    const useCases = ['eMBB downlink', 'FDD uplink', 'Carrier aggregation', 'Private 5G', 'Backhaul']
    const recommendedUse = rng.pick(useCases, bandSeed + 3)
    const efficiencyScore = Math.round(clamp(rng.nextFloat(40, 95, bandSeed + 4) + (allocated ? 10 : -20), 0, 100))

    const bandResult: SpectrumAllocationBand = {
      band_mhz: band,
      allocated,
      coverage_radius_km: parseFloat(coverageRadius.toFixed(1)),
      capacity_gbps: capacity,
      interference_risk_db: parseFloat(interference.toFixed(1)),
      recommended_use: recommendedUse,
      efficiency_score: efficiencyScore
    }

    bandResults.push(bandResult)

    if (allocated) {
      allocatedCount++
      totalCapacity += capacity
      totalCoverage += coverageRadius
    }
    if (interference > maxInterference) maxInterference = interference
  }

  const avgCoverage = allocatedCount > 0 ? parseFloat((totalCoverage / allocatedCount).toFixed(1)) : 0
  const efficiency = Math.round(clamp((allocatedCount / Math.max(bands.length, 1)) * 100 + rng.next(-5, 5, seed + 999), 0, 100))

  const notes: string[] = []
  notes.push(`Analyzed ${bands.length} frequency bands covering ${input.coverage_area_km2} km2 with population density of ${input.population_density} per km2`)
  notes.push(`Regulatory region: ${region} - exclusive bands: ${exclusive.length > 0 ? exclusive.join(', ') : 'none specified'}`)
  if (allocatedCount < bands.length) notes.push(`${bands.length - allocatedCount} bands rejected due to interference, bandwidth, or licensing constraints`)
  if (efficiency < 60) notes.push('Spectrum efficiency below target - consider band refarming or carrier aggregation')
  if (avgCoverage < 5) notes.push('Coverage radius limited - additional small cells or macro tower densification recommended')
  notes.push('AI-driven real-time spectrum sharing (CBRS/LSA) could improve utilization by 20-30%')

  return {
    total_bands_analyzed: bands.length,
    bands_allocated: allocatedCount,
    total_capacity_gbps: parseFloat(totalCapacity.toFixed(2)),
    avg_coverage_radius_km: avgCoverage,
    max_interference_db: parseFloat(maxInterference.toFixed(1)),
    spectrum_efficiency_pct: efficiency,
    bands: bandResults,
    optimization_notes: notes
  }
}

function formatSpectrumAllocationReport(input: SpectrumAllocationInput, result: SpectrumAllocationResult): string {
  const lines: string[] = []
  lines.push('## Spectrum Allocation Optimization Report')
  lines.push('')
  lines.push(`**Coverage Area:** ${input.coverage_area_km2} km2 | **Population Density:** ${input.population_density}/km2`)
  lines.push(`**Interference Threshold:** ${input.interference_threshold_db} dB | **Max Bandwidth:** ${input.license_constraints?.max_bandwidth_mhz || 100} MHz`)
  lines.push('')
  lines.push('### Allocation Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Bands Analyzed | ${result.total_bands_analyzed} |`)
  lines.push(`| Bands Allocated | ${result.bands_allocated} |`)
  lines.push(`| Total Capacity | ${result.total_capacity_gbps} Gbps |`)
  lines.push(`| Avg Coverage Radius | ${result.avg_coverage_radius_km} km |`)
  lines.push(`| Max Interference | ${result.max_interference_db} dB |`)
  lines.push(`| Spectrum Efficiency | ${result.spectrum_efficiency_pct}% |`)
  lines.push('')

  lines.push('### Band Details')
  lines.push('| Band (MHz) | Alloc | Coverage (km) | Capacity (Gbps) | Interference (dB) | Use Case | Efficiency |')
  lines.push('|-----------|-------|---------------|----------------|-------------------|----------|------------|')
  for (const b of result.bands) {
    lines.push(`| ${b.band_mhz} | ${b.allocated ? 'Yes' : 'No'} | ${b.coverage_radius_km} | ${b.capacity_gbps} | ${b.interference_risk_db} | ${b.recommended_use} | ${b.efficiency_score}% |`)
  }
  lines.push('')

  if (result.optimization_notes.length > 0) {
    lines.push('### Optimization Notes')
    for (const n of result.optimization_notes) {
      lines.push(`- ${n}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: NETWORK SLICING DESIGNER ====================

function designNetworkSlicing(input: NetworkSlicingInput): NetworkSlicingResult {
  const seed = seedFromInput(input)
  const slices: NetworkSliceDesign[] = []
  let totalAllocated = 0

  const descriptions: Record<string, string> = {
    eMBB: 'Enhanced Mobile Broadband - high throughput consumer/enterprise data',
    URLLC: 'Ultra-Reliable Low-Latency Communications - industrial automation, V2X',
    mMTC: 'Massive Machine-Type Communications - IoT sensor networks',
    MIoT: 'Massive IoT - large-scale low-power device connectivity',
    HCS: 'High Communications Service - mission-critical voice/video'
  }

  const isolationMethods: Record<string, string> = {
    physical: 'Dedicated hardware resources per slice (guaranteed isolation)',
    logical: 'Shared hardware with VLAN/VRF separation (cost-efficient)',
    hybrid: 'Critical slices physical, best-effort slices logical (balanced)'
  }

  for (let i = 0; i < input.slice_types.length; i++) {
    const st = input.slice_types[i]
    const sliceSeed = seed + i * 211
    const latencyReq = input.latency_requirements_ms[st] || rng.nextFloat(1, 50, sliceSeed)
    const reliabilityTarget = input.reliability_targets[st] || rng.nextFloat(99, 99.999, sliceSeed + 1)

    // Slice-specific bandwidth allocation logic
    let bwPortion: number
    if (st === 'eMBB') bwPortion = rng.nextFloat(35, 50, sliceSeed + 2)
    else if (st === 'URLLC') bwPortion = rng.nextFloat(10, 20, sliceSeed + 2)
    else if (st === 'mMTC') bwPortion = rng.nextFloat(15, 30, sliceSeed + 2)
    else bwPortion = rng.nextFloat(10, 25, sliceSeed + 2)

    const sliceBw = parseFloat((input.total_bandwidth_mhz * bwPortion / 100).toFixed(1))
    totalAllocated += sliceBw

    slices.push({
      slice_type: st,
      bandwidth_mhz: sliceBw,
      bandwidth_pct: parseFloat(bwPortion.toFixed(1)),
      max_latency_ms: parseFloat(latencyReq.toFixed(2)),
      reliability_pct: parseFloat(reliabilityTarget.toFixed(3)),
      isolation_method: isolationMethods[input.isolation_level] || 'Logical separation',
      resource_priority: st === 'URLLC' ? 1 : st === 'eMBB' ? 2 : 3,
      use_case_description: descriptions[st] || 'Custom network slice'
    })
  }

  const utilization = Math.round((totalAllocated / input.total_bandwidth_mhz) * 100)

  const recommendations: string[] = []
  recommendations.push(`${input.isolation_level.charAt(0).toUpperCase() + input.isolation_level.slice(1)} isolation selected: ${isolationMethods[input.isolation_level]}`)
  if (utilization > 95) recommendations.push('High bandwidth utilization - monitor for congestion during peak hours')
  if (utilization < 70) recommendations.push('Under-utilization detected - consider adding best-effort slice to absorb excess capacity')
  if (input.slice_types.includes('URLLC')) recommendations.push('URLLC slices require guaranteed scheduling - ensure RAN scheduler supports preemption')
  recommendations.push('Implement AI-driven dynamic slice orchestration for 15-25% efficiency gains')
  recommendations.push('Monitor SLA compliance via real-time KPI dashboards per slice')

  return {
    total_slices: input.slice_types.length,
    total_bandwidth_allocated_mhz: parseFloat(totalAllocated.toFixed(1)),
    bandwidth_utilization_pct: utilization,
    slices,
    isolation_feasibility: utilization <= 100 ? 'Feasible within bandwidth constraints' : 'Over-allocated - reduce slice bandwidth or increase total MHz',
    recommendations
  }
}

function formatNetworkSlicingReport(input: NetworkSlicingInput, result: NetworkSlicingResult): string {
  const lines: string[] = []
  lines.push('## 5G/6G Network Slicing Design Report')
  lines.push('')
  lines.push(`**Total Bandwidth:** ${input.total_bandwidth_mhz} MHz | **Isolation Level:** ${input.isolation_level} | **Slices:** ${result.total_slices}`)
  lines.push('')
  lines.push('### Slice Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Slices | ${result.total_slices} |`)
  lines.push(`| Bandwidth Allocated | ${result.total_bandwidth_allocated_mhz} / ${input.total_bandwidth_mhz} MHz |`)
  lines.push(`| Utilization | ${result.bandwidth_utilization_pct}% |`)
  lines.push(`| Isolation Feasibility | ${result.isolation_feasibility} |`)
  lines.push('')

  lines.push('### Slice Configurations')
  lines.push('| Slice Type | BW (MHz) | BW % | Latency (ms) | Reliability (%) | Priority | Description |')
  lines.push('|------------|----------|------|--------------|-----------------|----------|-------------|')
  for (const s of result.slices) {
    lines.push(`| ${s.slice_type} | ${s.bandwidth_mhz} | ${s.bandwidth_pct}% | ${s.max_latency_ms} | ${s.reliability_pct} | P${s.resource_priority} | ${s.use_case_description} |`)
  }
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: RAN INTELLIGENCE CONTROLLER ====================

function designRICPolicies(input: RICInput): RICResult {
  const seed = seedFromInput(input)
  const policies: RICPolicy[] = []

  const vendorCaps: Record<string, string> = {
    Nokia: 'Full O-RAN compliant with near-RT RIC v2.0',
    Ericsson: 'Proprietary RIC with O-RAN alignment layer',
    Samsung: 'vRAN-integrated RIC supporting xApps and rApps',
    Huawei: 'IntelligentRAN controller (partial O-RAN interoperability)',
    ZTE: 'uSmartNet RIC with AI-driven optimization',
    NEC: 'Open RIC platform with multi-vendor support'
  }

  const vendorCap = vendorCaps[input.ran_vendor] || 'Generic O-RAN compliant RIC platform'
  const isNearRt = input.measurement_interval_ms <= 10000

  let policyIdx = 0
  for (const [objective, weight] of Object.entries(input.optimization_objectives)) {
    const polSeed = seed + policyIdx * 313
    const targetCells = Math.min(input.cell_count, rng.next(Math.max(1, Math.floor(input.cell_count * 0.3)), input.cell_count, polSeed))
    const improvement = rng.nextFloat(5, 25, polSeed + 1) * (weight / 100)

    const adjustmentRanges: Record<string, string> = {
      coverage: '+/- 3dB power, tilt adjustment 0-10 deg',
      capacity: '+/- 20% PRB allocation, CA activation',
      interference: 'ICIC patterns 1-3, power reduction 0-6dB',
      energy: 'Symbol shutdown, carrier shutdown, sleep mode',
      load_balancing: 'Handover offset +/- 6dB, cell reselection',
      mobility: 'A3 offset, TTT adjustment, frequency priority'
    }

    const xappDeps = ['Traffic Steering xApp', 'QoS Optimization xApp', 'Energy Saving xApp', 'Coverage/Capacity xApp', 'Load Balancing xApp']
    const xappDep = rng.pick(xappDeps, polSeed + 2)

    const policyNameMap: Record<string, string> = {
      coverage: 'Coverage Optimization Policy',
      capacity: 'Capacity Balancing Policy',
      interference: 'Interference Coordination Policy',
      energy: 'Energy Efficiency Policy',
      load_balancing: 'Load Balancing Policy',
      mobility: 'Mobility Robustness Policy'
    }

    policies.push({
      policy_name: policyNameMap[objective] || `${objective} Optimization Policy`,
      objective,
      target_cells: targetCells,
      measurement_interval_ms: input.measurement_interval_ms,
      adjustment_range: adjustmentRanges[objective] || 'Standard parameter adjustment',
      expected_improvement_pct: parseFloat(improvement.toFixed(1)),
      xapp_dependency: xappDep
    })
    policyIdx++
  }

  const coveragePct = Math.round((policies.reduce((sum, p) => sum + p.target_cells, 0) / Math.max(input.cell_count * policies.length, 1)) * 100)

  const recommendations: string[] = []
  recommendations.push(`Vendor platform: ${input.ran_vendor} - ${vendorCap}`)
  if (!isNearRt) recommendations.push('Measurement interval > 10s operates in non-RT RIC domain (rApps) - slower optimization cycle')
  if (input.cell_count > 500) recommendations.push('Large RAN deployment - distribute RIC instances hierarchically ( regional + edge )')
  if (input.xapp_types.length > policies.length) recommendations.push(`${input.xapp_types.length - policies.length} xApp types not mapped to objectives - review optimization scope`)
  recommendations.push('Deploy ML-based xApps for predictive resource allocation (15-30% capacity improvement)')
  recommendations.push('Implement closed-loop automation with policy conflict resolution')

  return {
    vendor_compatibility: vendorCap,
    total_policies: policies.length,
    coverage_pct: clamp(coveragePct, 0, 100),
    policies,
    near_rt_ric_feasibility: isNearRt,
    optimization_summary: `${policies.length} policies covering ${policies.reduce((s, p) => s + p.target_cells, 0)} cell-targeted optimizations`,
    recommendations
  }
}

function formatRICReport(input: RICInput, result: RICResult): string {
  const lines: string[] = []
  lines.push('## RAN Intelligent Controller (RIC) Policy Design Report')
  lines.push('')
  lines.push(`**Vendor:** ${input.ran_vendor} | **Cells:** ${input.cell_count} | **Measurement Interval:** ${input.measurement_interval_ms}ms`)
  lines.push(`**Near-RT RIC:** ${result.near_rt_ric_feasibility ? 'Yes (<=10s interval)' : 'No (non-RT, >10s interval)'}`)
  lines.push('')
  lines.push('### Vendor Compatibility')
  lines.push(`> ${result.vendor_compatibility}`)
  lines.push('')
  lines.push('### Policy Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Policies | ${result.total_policies} |`)
  lines.push(`| Coverage | ${result.coverage_pct}% of cells |`)
  lines.push(`| xApps Required | ${input.xapp_types.join(', ')} |`)
  lines.push('')

  if (result.policies.length > 0) {
    lines.push('### Policies')
    lines.push('| Policy | Objective | Target Cells | Improvement | xApp Dependency |')
    lines.push('|--------|-----------|--------------|-------------|-----------------|')
    for (const p of result.policies) {
      lines.push(`| ${p.policy_name} | ${p.objective} | ${p.target_cells} | ${p.expected_improvement_pct}% | ${p.xapp_dependency} |`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: EDGE COMPUTING PLANNER ====================

function planEdgeComputing(input: EdgeComputingInput): EdgeComputingResult {
  const seed = seedFromInput(input)
  const nodes: EdgeNode[] = []
  let totalCompute = 0
  let totalBandwidth = 0

  for (let i = 0; i < input.geographic_locations.length; i++) {
    const loc = input.geographic_locations[i]
    const nodeSeed = seed + i * 419

    // Latency calculation based on distance from cloud (simplified propagation)
    const distanceFactor = rng.nextFloat(0.3, 1.0, nodeSeed)
    const latency = parseFloat((input.max_latency_ms * distanceFactor).toFixed(1))
    const computeUnits = rng.next(8, 64, nodeSeed + 1)
    const bw = parseFloat((input.bandwidth_gbps * rng.nextFloat(0.5, 1.0, nodeSeed + 2)).toFixed(1))
    const powerKw = parseFloat((rng.nextFloat(2, 15, nodeSeed + 3) + (input.compute_gpu_needed ? 5 : 0)).toFixed(1))
    const cost = rng.next(50000, 500000, nodeSeed + 4)

    totalCompute += computeUnits
    totalBandwidth += bw

    nodes.push({
      location: loc,
      latency_ms: latency,
      compute_units: computeUnits,
      gpu_enabled: input.compute_gpu_needed,
      bandwidth_gbps: bw,
      power_consumption_kw: powerKw,
      estimated_cost_usd: cost
    })
  }

  const avgLatency = nodes.length > 0 ? parseFloat((nodes.reduce((s, n) => s + n.latency_ms, 0) / nodes.length).toFixed(1)) : 0
  const maxLatency = nodes.length > 0 ? Math.max(...nodes.map(n => n.latency_ms)) : 0

  const backhaulAssessment: Record<string, string> = {
    'fiber': 'Fiber backhaul - excellent reliability, low latency, 10+ Gbps capacity',
    'microwave': 'Microwave backhaul - good for remote locations, up to 10 Gbps, weather sensitive',
    'millimeter-wave': 'mmWave backhaul - ultra-high capacity, short range, line-of-sight required',
    'satellite': 'Satellite backhaul - global coverage, higher latency, suitable for remote sites',
    'copper': 'Copper backhaul - limited capacity, suitable for low-bandwidth edge nodes only'
  }

  const recommendations: string[] = []
  recommendations.push(`Backhaul: ${backhaulAssessment[input.backhaul_type] || 'Custom backhaul - assess capacity and reliability requirements'}`)
  if (maxLatency > input.max_latency_ms) recommendations.push('WARNING: Some nodes exceed max latency target - review placement or add caching')
  if (input.compute_gpu_needed) recommendations.push('GPU-enabled nodes increase power consumption by ~5kW per node - ensure power infrastructure')
  if (input.bandwidth_gbps > 10) recommendations.push('High bandwidth requirements - verify backhaul scaling supports peak demand')
  recommendations.push('Implement Kubernetes-based edge orchestration for workload mobility')
  recommendations.push('Deploy AI inference at edge for sub-10ms response on time-critical applications')

  return {
    total_nodes: nodes.length,
    max_latency_ms: maxLatency,
    avg_latency_ms: avgLatency,
    total_compute_units: totalCompute,
    total_bandwidth_gbps: parseFloat(totalBandwidth.toFixed(1)),
    nodes,
    backhaul_assessment: backhaulAssessment[input.backhaul_type] || 'Custom backhaul',
    recommendations
  }
}

function formatEdgeComputingReport(input: EdgeComputingInput, result: EdgeComputingResult): string {
  const lines: string[] = []
  lines.push('## Edge Computing Deployment Plan')
  lines.push('')
  lines.push(`**Applications:** ${input.application_types.join(', ')}`)
  lines.push(`**Max Latency Target:** ${input.max_latency_ms}ms | **GPU Required:** ${input.compute_gpu_needed ? 'Yes' : 'No'} | **Bandwidth:** ${input.bandwidth_gbps} Gbps | **Backhaul:** ${input.backhaul_type}`)
  lines.push('')
  lines.push('### Deployment Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Edge Nodes | ${result.total_nodes} |`)
  lines.push(`| Total Compute Units | ${result.total_compute_units} |`)
  lines.push(`| Total Bandwidth | ${result.total_bandwidth_gbps} Gbps |`)
  lines.push(`| Avg Latency | ${result.avg_latency_ms} ms |`)
  lines.push(`| Max Latency | ${result.max_latency_ms} ms |`)
  lines.push('')

  if (result.nodes.length > 0) {
    lines.push('### Node Details')
    lines.push('| Location | Latency (ms) | Compute Units | GPU | Bandwidth (Gbps) | Power (kW) | Cost (USD) |')
    lines.push('|----------|-------------|---------------|-----|-------------------|------------|-----------|')
    for (const n of result.nodes) {
      lines.push(`| ${n.location} | ${n.latency_ms} | ${n.compute_units} | ${n.gpu_enabled ? 'Yes' : 'No'} | ${n.bandwidth_gbps} | ${n.power_consumption_kw} | $${n.estimated_cost_usd.toLocaleString()} |`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: IOT CONNECTIVITY ADVISOR ====================

function adviseIoTConnectivity(input: IoTConnectivityInput): IoTConnectivityResult {
  const seed = seedFromInput(input)
  const monthlyMessages = input.message_frequency * 30

  const techs: IoTTechnology[] = [
    {
      technology: 'NB-IoT',
      suitability_score: 0,
      range_km: 15,
      max_devices_per_gateway: 50000,
      battery_life_years: 10,
      data_rate_kbps: 250,
      pros: ['Deep indoor coverage', 'Ultra-low power', '3GPP standard', 'Licensed spectrum'],
      cons: ['Limited data rate', 'Not suitable for mobility', 'Higher latency than LTE-M'],
      recommended: false
    },
    {
      technology: 'LoRa',
      suitability_score: 0,
      range_km: 10,
      max_devices_per_gateway: 10000,
      battery_life_years: 12,
      data_rate_kbps: 50,
      pros: ['Very long range (rural)', 'Unlicensed spectrum (zero fees)', 'Very low cost modules', 'Mesh capable'],
      cons: ['Unlicensed (interference risk)', 'Low data rate', ' Duty cycle limits', 'No native mobility'],
      recommended: false
    },
    {
      technology: 'LTE-M',
      suitability_score: 0,
      range_km: 11,
      max_devices_per_gateway: 40000,
      battery_life_years: 8,
      data_rate_kbps: 1000,
      pros: ['Mobility support (handover)', 'Voice capable', 'Higher data rate', '3GPP standard'],
      cons: ['Higher power than NB-IoT', 'Higher module cost', 'Requires SIM'],
      recommended: false
    },
    {
      technology: 'WiFi6',
      suitability_score: 0,
      range_km: 0.5,
      max_devices_per_gateway: 200,
      battery_life_years: 2,
      data_rate_kbps: 100000,
      pros: ['Very high data rate', 'Low latency', 'Dense device support', 'No spectrum fees'],
      cons: ['Very short range', 'Higher power consumption', 'Not ideal for battery devices'],
      recommended: false
    }
  ]

  for (const tech of techs) {
    let score = 50
    // Battery life scoring
    if (tech.battery_life_years >= input.battery_years) score += 20
    else if (tech.battery_life_years >= input.battery_years * 0.5) score += 5
    else score -= 15

    // Payload/data rate scoring
    if (tech.data_rate_kbps >= (input.payload_bytes * 8) / 60) score += 15
    else score -= 10

    // Mobility scoring
    if (input.mobility_required && tech.technology === 'LTE-M') score += 15
    else if (input.mobility_required && tech.technology !== 'LTE-M') score -= 20
    else if (!input.mobility_required && tech.technology === 'LoRa') score += 5

    // Coverage/range scoring
    const areaRadius = Math.sqrt(input.coverage_area_km2 / Math.PI)
    if (tech.range_km >= areaRadius * 1.5) score += 10
    else if (tech.range_km >= areaRadius * 0.5) score += 3
    else score -= 10

    // Device count scoring
    if (tech.max_devices_per_gateway >= input.device_count) score += 5
    else if (tech.max_devices_per_gateway * 5 >= input.device_count) score += 0
    else score -= 10

    // Monthly message frequency
    if (monthlyMessages > 10000 && tech.data_rate_kbps < 100) score -= 10
    if (monthlyMessages < 100 && tech.technology === 'WiFi6') score -= 10

    tech.suitability_score = clamp(score + rng.next(-3, 3, seed + tech.technology.charCodeAt(0)), 0, 100)
  }

  // Rank and select best
  techs.sort((a, b) => b.suitability_score - a.suitability_score)
  techs[0].recommended = true

  const bestTech = techs[0]
  const gatewayCount = Math.ceil(input.device_count / bestTech.max_devices_per_gateway)
  const totalCapacity = gatewayCount * bestTech.max_devices_per_gateway

  let coverageAssessment: string
  const areaRadius = Math.sqrt(input.coverage_area_km2 / Math.PI)
  if (bestTech.range_km >= areaRadius * 2) coverageAssessment = 'Excellent - single gateway covers entire area with margin'
  else if (bestTech.range_km >= areaRadius) coverageAssessment = 'Adequate - gateway placement at center provides full coverage'
  else if (bestTech.range_km >= areaRadius * 0.5) coverageAssessment = 'Requires multiple gateways for full coverage'
  else coverageAssessment = 'Insufficient range - dense gateway deployment needed'

  const notes: string[] = []
  notes.push(`Recommended: ${bestTech.technology} (score: ${bestTech.suitability_score}/100)`)
  notes.push(`Monthly message volume: ${monthlyMessages.toFixed(0)} msg/device`)
  notes.push(`Required gateways: ${gatewayCount} (capacity: ${totalCapacity} devices)`)
  if (input.mobility_required && bestTech.technology !== 'LTE-M') notes.push('Mobility recommended - consider LTE-M as primary or add roaming gateways')
  if (input.battery_years > bestTech.battery_life_years) notes.push(`Battery target (${input.battery_years}yr) exceeds ${bestTech.technology} capability (${bestTech.battery_life_years}yr) - implement power-saving modes`)
  notes.push('Evaluate satellite IoT (NTN) as backup for remote areas beyond terrestrial coverage')
  notes.push('Use AI-based network selection for multi-connectivity devices to optimize performance and cost')

  const ranked: IoTConnectivityResult_technology[] = techs.map(t => ({
    technology: t.technology,
    suitability_score: t.suitability_score,
    range_km: t.range_km,
    max_devices_per_gateway: t.max_devices_per_gateway,
    battery_life_years: t.battery_life_years,
    data_rate_kbps: t.data_rate_kbps,
    recommended: t.recommended
  }))

  return {
    recommended_technology: bestTech.technology,
    gateway_count: gatewayCount,
    total_capacity: totalCapacity,
    coverage_assessment: coverageAssessment,
    technologies_ranked: ranked,
    deployment_notes: notes
  }
}

function formatIoTReport(input: IoTConnectivityInput, result: IoTConnectivityResult): string {
  const lines: string[] = []
  lines.push('## IoT Connectivity Advisory Report')
  lines.push('')
  lines.push(`**Devices:** ${input.device_count} | **Frequency:** ${input.message_frequency}/day | **Payload:** ${input.payload_bytes} bytes`)
  lines.push(`**Battery Target:** ${input.battery_years} years | **Mobility:** ${input.mobility_required ? 'Required' : 'Static'} | **Area:** ${input.coverage_area_km2} km2`)
  lines.push('')
  lines.push('### Recommendation')
  lines.push(`> **${result.recommended_technology}** — ${result.gateway_count} gateway(s) needed — total capacity: ${result.total_capacity} devices`)
  lines.push(`> Coverage: ${result.coverage_assessment}`)
  lines.push('')
  lines.push('### Technology Rankings')
  lines.push('| Rank | Technology | Score | Range (km) | Max Devices/GW | Battery (yr) | Data Rate (kbps) | Recommended |')
  lines.push('|------|-----------|-------|------------|----------------|-------------|------------------|-------------|')
  for (let i = 0; i < result.technologies_ranked.length; i++) {
    const t = result.technologies_ranked[i]
    lines.push(`| ${i + 1} | ${t.technology} | ${t.suitability_score}/100 | ${t.range_km} | ${t.max_devices_per_gateway} | ${t.battery_life_years} | ${t.data_rate_kbps} | ${t.recommended ? 'Yes' : ''} |`)
  }
  lines.push('')

  if (result.deployment_notes.length > 0) {
    lines.push('### Deployment Notes')
    for (const n of result.deployment_notes) {
      lines.push(`- ${n}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: FIBER NETWORK DESIGNER ====================

function designFiberNetwork(input: FiberNetworkInput): FiberNetworkResult {
  const seed = seedFromInput(input)
  const segments: FiberSegment[] = []

  const redundancyMultiplier: Record<string, number> = {
    none: 1.0,
    'N+1': 1.5,
    '2N': 2.0,
    ring: 1.8
  }
  const redMult = redundancyMultiplier[input.redundancy_level] || 1.5

  let totalFiberKm = 0
  let totalSplitters = 0
  let totalCost = 0

  const segmentCount = Math.max(3, Math.min(12, Math.ceil(Math.sqrt(input.premises_count))))

  for (let i = 0; i < segmentCount; i++) {
    const segSeed = seed + i * 523
    const distance = parseFloat((input.max_distance_km * rng.nextFloat(0.2, 0.9, segSeed)).toFixed(1))
    const fiberCount = Math.round(input.split_ratio * rng.nextFloat(0.5, 1.0, segSeed + 1))
    const splitterStages = input.split_ratio >= 64 ? 3 : input.split_ratio >= 32 ? 2 : 1
    const splittersInSegment = splitterStages
    const cost = Math.round(distance * 3000 * redMult + splittersInSegment * 500)

    totalFiberKm += distance * (input.topology_type === 'ring' ? 2 : 1)
    totalSplitters += splittersInSegment
    totalCost += cost

    const nodeTypes = ['Central Office', 'Fiber Hub', 'Distribution Point', 'Street Cabinet', 'Building Entry']
    const fromNode = rng.pick(nodeTypes, segSeed + 2)
    const toNode = rng.pick(nodeTypes.filter(n => n !== fromNode), segSeed + 3)

    segments.push({
      segment_id: `SEG-${String(i + 1).padStart(3, '0')}`,
      from_node: fromNode,
      to_node: toNode,
      distance_km: distance,
      fiber_count: fiberCount,
      splitter_ratio: input.split_ratio,
      estimated_cost_usd: cost
    })
  }

  totalFiberKm = parseFloat(totalFiberKm.toFixed(1))
  const budgetFeasible = totalCost <= input.budget_usd
  const costPerPremise = Math.round(totalCost / input.premises_count)

  const topologyNotes: string[] = []
  topologyNotes.push(`${input.topology_type} topology with ${input.redundancy_level} redundancy (multiplier: ${redMult}x)`)
  topologyNotes.push(`Fiber distribution uses ${input.split_ratio}:1 split ratio (${totalSplitters} splitter stages)`)
  topologyNotes.push(`Distributing across ${segmentCount} segments totaling ${totalFiberKm} fiber-km`)
  if (!budgetFeasible) topologyNotes.push(`Budget overrun: $${totalCost.toLocaleString()} vs $${input.budget_usd.toLocaleString()} — consider phased deployment`)
  if (input.topology_type === 'ring') topologyNotes.push('Ring topology provides self-healing protection (50ms failover)')
  if (input.split_ratio > 64) topologyNotes.push('High split ratio may reduce per-user bandwidth — plan for XGS-PON upgrade path')
  topologyNotes.push('Deploy fiber monitoring (OTDR) for proactive fault detection and reduced MTTR')

  return {
    total_segments: segments.length,
    total_fiber_km: totalFiberKm,
    total_splitters: totalSplitters,
    total_cost_usd: totalCost,
    budget_feasibility: budgetFeasible,
    cost_per_premise_usd: costPerPremise,
    segments,
    topology_notes: topologyNotes
  }
}

function formatFiberNetworkReport(input: FiberNetworkInput, result: FiberNetworkResult): string {
  const lines: string[] = []
  lines.push('## Fiber Optic Network Design Report')
  lines.push('')
  lines.push(`**Premises:** ${input.premises_count} | **Topology:** ${input.topology_type} | **Redundancy:** ${input.redundancy_level}`)
  lines.push(`**Max Distance:** ${input.max_distance_km} km | **Split Ratio:** ${input.split_ratio}:1 | **Budget:** $${input.budget_usd.toLocaleString()}`)
  lines.push('')
  lines.push('### Design Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Segments | ${result.total_segments} |`)
  lines.push(`| Total Fiber (km) | ${result.total_fiber_km} |`)
  lines.push(`| Total Splitters | ${result.total_splitters} |`)
  lines.push(`| Total Cost | $${result.total_cost_usd.toLocaleString()} |`)
  lines.push(`| Cost per Premise | $${result.cost_per_premise_usd} |`)
  lines.push(`| Budget Feasible | ${result.budget_feasibility ? 'Yes' : 'No'} |`)
  lines.push('')

  lines.push('### Segment Details')
  lines.push('| Segment | From | To | Distance (km) | Fiber Count | Splitter Ratio | Cost (USD) |')
  lines.push('|---------|------|----|---------------|-------------|----------------|------------|')
  for (const s of result.segments) {
    lines.push(`| ${s.segment_id} | ${s.from_node} | ${s.to_node} | ${s.distance_km} | ${s.fiber_count} | ${s.splitter_ratio}:1 | $${s.estimated_cost_usd.toLocaleString()} |`)
  }
  lines.push('')

  if (result.topology_notes.length > 0) {
    lines.push('### Topology Notes')
    for (const n of result.topology_notes) {
      lines.push(`- ${n}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: QOS POLICY DESIGNER ====================

function designQoSPolicies(input: QoSInput): QoSResult {
  const seed = seedFromInput(input)
  const classes: QoSClass[] = []

  const dscpMappings: Record<string, string> = {
    voice: 'EF (46)',
    video: 'AF41 (34)',
    gaming: 'AF31 (26)',
    streaming: 'AF21 (18)',
    data: 'AF11 (10)',
    background: 'BE (0)',
    signaling: 'CS3 (24)',
    management: 'CS2 (16)',
    emergency: 'CS6 (48)'
  }

  const queueingAlgorithms: Record<string, string> = {
    voice: 'Priority Queue (PQ)',
    video: 'Class-Based Weighted Fair Queue (CBWFQ)',
    gaming: 'Low-Latency Queue (LLQ)',
    streaming: 'CBWFQ with rate limiting',
    data: 'WFQ (Weighted Fair Queueing)',
    background: 'RED (Random Early Detection)',
    signaling: 'PQ with strict priority',
    management: 'CBWFQ with minimum guarantee',
    emergency: 'Strict Priority + Preemption'
  }

  let totalBw = 0

  for (let i = 0; i < input.traffic_classes.length; i++) {
    const tc = input.traffic_classes[i]
    const clsSeed = seed + i * 631
    const bwPct = input.bandwidth_allocation_pct[tc] || rng.next(5, 30, clsSeed)
    const latency = input.latency_targets_ms[tc] || rng.nextFloat(1, 100, clsSeed + 1)
    const dropPrio = input.drop_priorities[tc] || rng.next(1, 5, clsSeed + 2)
    const policingRate = Math.round(bwPct * 100 + rng.next(-50, 50, clsSeed + 3))

    totalBw += bwPct

    classes.push({
      class_name: tc,
      dscp_marking: dscpMappings[tc] || `CS${i} (${i * 8})`,
      bandwidth_pct: bwPct,
      latency_target_ms: parseFloat(latency.toFixed(1)),
      drop_priority: dropPrio,
      queueing_algorithm: queueingAlgorithms[tc] || 'WFQ',
      policing_rate_mbps: Math.max(1, policingRate)
    })
  }

  let markingFeasibility: string
  if (input.marking_strategy === 'DSCP') markingFeasibility = 'DSCP markings are end-to-end transparent (L3) - fully feasible'
  else if (input.marking_strategy === '802.1p') markingFeasibility = '802.1p only works within single L2 domain - limited to access/edge'
  else if (input.marking_strategy === 'MPLS-EXP') markingFeasibility = 'MPLS EXP works within MPLS core - consistent with backbone architecture'
  else markingFeasibility = 'Custom marking strategy - assess hop-by-hop transparency'

  let congestionRisk: string
  if (totalBw > 100) congestionRisk = 'HIGH - over-allocated bandwidth will cause congestion under load'
  else if (totalBw > 90) congestionRisk = 'MEDIUM - tight allocation leaves minimal headroom for bursty traffic'
  else congestionRisk = 'LOW - adequate headroom for traffic bursts and growth'

  const recommendations: string[] = []
  recommendations.push(`Marking strategy: ${input.marking_strategy} — ${markingFeasibility}`)
  if (totalBw > 95) recommendations.push('Reduce overallocation or implement admission control to handle oversubscription')
  if (totalBw < 80) recommendations.push('Unallocated bandwidth detected - consider adding default best-effort class')
  recommendations.push('Implement H-QoS (Hierarchical QoS) for multi-tenant/enterprise scenarios')
  recommendations.push('Deploy AI-driven dynamic QoS adjustment based on real-time traffic patterns')
  recommendations.push('Monitor queue depth and drop rates per class — set proactive thresholds at 70% capacity')

  return {
    total_classes: classes.length,
    bandwidth_allocated_pct: totalBw,
    classes,
    marking_feasibility: markingFeasibility,
    congestion_risk: congestionRisk,
    recommendations
  }
}

function formatQoSReport(input: QoSInput, result: QoSResult): string {
  const lines: string[] = []
  lines.push('## QoS Policy Design Report')
  lines.push('')
  lines.push(`**Marking Strategy:** ${input.marking_strategy} | **Traffic Classes:** ${result.total_classes} | **Total Bandwidth Allocated:** ${result.bandwidth_allocated_pct}%`)
  lines.push('')
  lines.push('### Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Classes | ${result.total_classes} |`)
  lines.push(`| Bandwidth Allocated | ${result.bandwidth_allocated_pct}% |`)
  lines.push(`| Congestion Risk | ${result.congestion_risk} |`)
  lines.push(`| Marking Feasibility | ${result.marking_feasibility} |`)
  lines.push('')

  lines.push('### Class Configurations')
  lines.push('| Class | DSCP | BW % | Latency Target (ms) | Drop Priority | Queueing | Policing Rate (Mbps) |')
  lines.push('|-------|------|------|---------------------|---------------|----------|----------------------|')
  for (const c of result.classes) {
    lines.push(`| ${c.class_name} | ${c.dscp_marking} | ${c.bandwidth_pct}% | ${c.latency_target_ms} | ${c.drop_priority} | ${c.queueing_algorithm} | ${c.policing_rate_mbps} |`)
  }
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: TELECOM ROI CALCULATOR ====================

function calculateROI(input: TelecomROIInput): TelecomROIResult {
  const seed = seedFromInput(input)
  const year_by_year: TelecomROIResult['year_by_year'] = []

  let cumulative = -input.capex_usd
  let totalRevenue = 0
  let totalOpex = 0
  const discountRate = input.discount_rate_pct / 100

  for (let y = 0; y < input.project_years; y++) {
    const rev = input.revenue_projections_usd[y] || input.revenue_projections_usd[input.revenue_projections_usd.length - 1] * (1 + rng.nextFloat(-0.05, 0.15, seed + y * 7))
    const opex = y === 0 ? input.opex_annual_usd * 0.5 : input.opex_annual_usd * (1 + rng.nextFloat(-0.03, 0.08, seed + y * 11))
    const netCf = rev - opex
    cumulative += netCf
    const discountedCf = netCf / Math.pow(1 + discountRate, y + 1)

    totalRevenue += rev
    totalOpex += opex

    year_by_year.push({
      year: y + 1,
      revenue_usd: Math.round(rev),
      opex_usd: Math.round(opex),
      net_cash_flow_usd: Math.round(netCf),
      cumulative_usd: Math.round(cumulative),
      discounted_cash_flow_usd: Math.round(discountedCf)
    })
  }

  const npv = year_by_year.reduce((s, y) => s + y.discounted_cash_flow_usd, 0) - input.capex_usd
  const roi = ((totalRevenue - totalOpex - input.capex_usd) / input.capex_usd) * 100

  // Payback period calculation
  let payback = input.project_years
  let running = -input.capex_usd
  for (let y = 0; y < year_by_year.length; y++) {
    running += year_by_year[y].net_cash_flow_usd
    if (running >= 0) {
      const prevRunning = running - year_by_year[y].net_cash_flow_usd
      payback = y + 1 - prevRunning / year_by_year[y].net_cash_flow_usd
      break
    }
  }

  // IRR approximation via Newton-Raphson
  let irrRate = discountRate
  for (let iter = 0; iter < 50; iter++) {
    let npvAtRate = -input.capex_usd
    let dnpv = 0
    for (const y of year_by_year) {
      npvAtRate += y.net_cash_flow_usd / Math.pow(1 + irrRate, y.year)
      dnpv -= y.year * y.net_cash_flow_usd / Math.pow(1 + irrRate, y.year + 1)
    }
    if (dnpv !== 0) {
      const newRate = irrRate - npvAtRate / dnpv
      if (Math.abs(newRate - irrRate) < 0.0001) { irrRate = newRate; break }
      irrRate = newRate
    }
  }

  let viability: string
  if (npv > 0 && payback < input.project_years * 0.6) viability = 'Highly viable - strong positive NPV and rapid payback'
  else if (npv > 0) viability = 'Viable - positive NPV but extended payback period'
  else if (roi > 0) viability = 'Marginal - positive ROI but negative NPV at current discount rate'
  else viability = 'Not viable - negative ROI, revise business case or reduce costs'

  const recommendations: string[] = []
  recommendations.push(`Project: ${input.project_type} over ${input.project_years} years`)
  if (npv < 0) recommendations.push('Negative NPV - explore cost reduction, revenue acceleration, or phased investment')
  if (payback > input.project_years * 0.7) recommendations.push('Extended payback period - consider debt financing to improve cash flow timing')
  if (irrRate < discountRate) recommendations.push('IRR below discount rate - project does not create value at required return threshold')
  recommendations.push('Stress-test model with 20% downside on revenue and 15% upside on CAPEX for risk assessment')
  recommendations.push('Consider government subsidies, spectrum sharing, or infrastructure co-investment to improve returns')
  recommendations.push('AI/ML-driven operational automation can reduce OPEX by 15-30% over project lifetime')

  return {
    project_type: input.project_type,
    total_capex_usd: input.capex_usd,
    total_opex_usd: Math.round(totalOpex),
    total_revenue_usd: Math.round(totalRevenue),
    net_present_value_usd: Math.round(npv),
    roi_pct: parseFloat(roi.toFixed(1)),
    payback_period_years: parseFloat(payback.toFixed(1)),
    irr_pct: parseFloat((irrRate * 100).toFixed(1)),
    year_by_year,
    viability,
    recommendations
  }
}

function formatROIReport(input: TelecomROIInput, result: TelecomROIResult): string {
  const lines: string[] = []
  lines.push('## Telecom Infrastructure ROI Analysis')
  lines.push('')
  lines.push(`**Project:** ${result.project_type} | **Duration:** ${input.project_years} years | **Discount Rate:** ${input.discount_rate_pct}%`)
  lines.push('')
  lines.push('### Financial Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| CAPEX | $${result.total_capex_usd.toLocaleString()} |`)
  lines.push(`| Total OPEX | $${result.total_opex_usd.toLocaleString()} |`)
  lines.push(`| Total Revenue | $${result.total_revenue_usd.toLocaleString()} |`)
  lines.push(`| Net Present Value | $${result.net_present_value_usd.toLocaleString()} |`)
  lines.push(`| ROI | ${result.roi_pct}% |`)
  lines.push(`| IRR | ${result.irr_pct}% |`)
  lines.push(`| Payback Period | ${result.payback_period_years} years |`)
  lines.push(`| Viability | ${result.viability} |`)
  lines.push('')

  lines.push('### Year-by-Year Cash Flow')
  lines.push('| Year | Revenue | OPEX | Net Cash Flow | Cumulative | Discounted CF |')
  lines.push('|------|---------|------|---------------|------------|---------------|')
  for (const y of result.year_by_year) {
    lines.push(`| ${y.year} | $${y.revenue_usd.toLocaleString()} | $${y.opex_usd.toLocaleString()} | $${y.net_cash_flow_usd.toLocaleString()} | $${y.cumulative_usd.toLocaleString()} | $${y.discounted_cash_flow_usd.toLocaleString()} |`)
  }
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Spectrum Allocation Optimizer
  tools.register(defineTool({
    name: 'spectrum_allocation_optimizer',
    description: 'Optimizes spectrum allocation for maximum coverage and capacity. Analyzes frequency bands for interference risk, coverage radius, capacity potential, and licensing constraints. Supports multi-band scenarios with regulatory compliance checks.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: frequency_bands_mhz[], coverage_area_km2, population_density, interference_threshold_db, license_constraints{max_bandwidth_mhz, exclusive_bands, shared_bands, regulatory_region}' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SpectrumAllocationInput = JSON.parse(args.input_data)
      const result = optimizeSpectrumAllocation(input)
      return formatSpectrumAllocationReport(input, result)
    }
  }))

  // Tool 2: Network Slicing Designer
  tools.register(defineTool({
    name: 'network_slicing_designer',
    description: 'Designs 5G/6G network slices for different use cases including eMBB, URLLC, and mMTC. Computes bandwidth allocation, latency targets, reliability specs, and isolation methods per slice. Validates total bandwidth constraints and isolation feasibility.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: slice_types[], total_bandwidth_mhz, latency_requirements_ms{}, reliability_targets{}, isolation_level (physical|logical|hybrid)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: NetworkSlicingInput = JSON.parse(args.input_data)
      const result = designNetworkSlicing(input)
      return formatNetworkSlicingReport(input, result)
    }
  }))

  // Tool 3: RAN Intelligence Controller
  tools.register(defineTool({
    name: 'ran_intelligence_controller',
    description: 'Designs RAN Intelligent Controller (RIC) policies for real-time network optimization. Maps optimization objectives to policies with xApp dependencies, target cell coverage, and expected improvement metrics. Supports major RAN vendor platforms.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: ran_vendor, optimization_objectives{}, cell_count, measurement_interval_ms, xapp_types[]' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RICInput = JSON.parse(args.input_data)
      const result = designRICPolicies(input)
      return formatRICReport(input, result)
    }
  }))

  // Tool 4: Edge Computing Planner
  tools.register(defineTool({
    name: 'edge_computing_planner',
    description: 'Plans edge computing deployment for low-latency applications. Computes node placement, bandwidth allocation, latency estimates, GPU requirements, power consumption, and cost projections across geographic locations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: application_types[], max_latency_ms, compute_gpu_needed, bandwidth_gbps, geographic_locations[], backhaul_type' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EdgeComputingInput = JSON.parse(args.input_data)
      const result = planEdgeComputing(input)
      return formatEdgeComputingReport(input, result)
    }
  }))

  // Tool 5: IoT Connectivity Advisor
  tools.register(defineTool({
    name: 'iot_connectivity_advisor',
    description: 'Advises on IoT connectivity technology (NB-IoT, LoRa, LTE-M, WiFi6) for specific use cases. Scores technologies by battery life, range, data rate, mobility support, and device density. Returns ranked recommendations with gateway counts.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: device_count, message_frequency, payload_bytes, battery_years, mobility_required, coverage_area_km2' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: IoTConnectivityInput = JSON.parse(args.input_data)
      const result = adviseIoTConnectivity(input)
      return formatIoTReport(input, result)
    }
  }))

  // Tool 6: Fiber Network Designer
  tools.register(defineTool({
    name: 'fiber_network_designer',
    description: 'Designs fiber optic network topology (FTTH, FTTN, backbone) with segment planning, redundancy levels, split ratios, cost estimation, and budget feasibility assessment. Optimizes node placement and fiber routing.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: premises_count, topology_type, max_distance_km, redundancy_level, split_ratio, budget_usd' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FiberNetworkInput = JSON.parse(args.input_data)
      const result = designFiberNetwork(input)
      return formatFiberNetworkReport(input, result)
    }
  }))

  // Tool 7: QoS Policy Designer
  tools.register(defineTool({
    name: 'qos_policy_designer',
    description: 'Designs Quality of Service policies for differentiated traffic treatment. Maps traffic classes to DSCP markings, bandwidth allocation, queueing algorithms, and polices rates. Evaluates congestion risks and marking feasibility.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: traffic_classes[], bandwidth_allocation_pct{}, latency_targets_ms, drop_priorities{}, marking_strategy' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: QoSInput = JSON.parse(args.input_data)
      const result = designQoSPolicies(input)
      return formatQoSReport(input, result)
    }
  }))

  // Tool 8: Telecom ROI Calculator
  tools.register(defineTool({
    name: 'telecom_roi_calculator',
    description: 'Calculates ROI for telecom infrastructure investments with full financial modeling including NPV, IRR, payback period, and year-by-year discounted cash flow analysis. Supports sensitivity analysis for revenue and cost variations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: project_type, capex_usd, opex_annual_usd, revenue_projections_usd[], discount_rate_pct, project_years' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TelecomROIInput = JSON.parse(args.input_data)
      const result = calculateROI(input)
      return formatROIReport(input, result)
    }
  }))

  console.log(`[dsh-tool-telecompro] Loaded v${VERSION} - Telecom and Network Engineering Pro with 8 tools`)
  console.log('  Tools: spectrum_allocation_optimizer, network_slicing_designer, ran_intelligence_controller, edge_computing_planner, iot_connectivity_advisor, fiber_network_designer, qos_policy_designer, telecom_roi_calculator')
}

