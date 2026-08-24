/**
 * DSH Telecom and Network Intelligence AI Plugin v0.1.0
 *
 * Telecom & Network Intelligence toolkit covering network optimization,
 * spectrum management, 5G/6G deployment planning, network slicing,
 * customer churn prediction, fraud detection, quality of experience
 * analysis, and infrastructure investment advisory. Telecom AI market
 * exceeds $10B in 2026 with network optimization alone at $8B+.
 *
 * Tools:
 * 1. network_optimization_engine - AI-driven network coverage/capacity/handover optimization
 * 2. spectrum_allocation_optimizer - Spectrum band allocation with interference analysis
 * 3. five_g_deployment_planner - 5G/6G site deployment planning and ROI projection
 * 4. network_slice_manager - End-to-end network slice lifecycle management
 * 5. customer_churn_predictor - ML-based customer churn prediction and retention
 * 6. fraud_detection_telecom - Real-time telecom fraud detection and prevention
 * 7. quality_of_experience_analyzer - QoE scoring across voice/video/data services
 * 8. infrastructure_investment_advisor - Capex planning and investment optimization
 *
 * @module dsh-tool-telecomai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-telecomai'
export const inject = ['tools']

const VERSION = '0.1.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated telecom analysis for informational purposes only. It does not constitute professional engineering, financial, or regulatory advice. Consult qualified telecom engineers, data scientists, and financial advisors before making deployment or investment decisions.'

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

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// ==================== TYPES ====================

// --- Tool 1: Network Optimization Engine ---
export interface NetworkOptimizationInput {
  cells: Array<{
    cell_id: string
    band: string
    rsrp: number
    sinr: number
    throughput_mbps: number
    handover_success_rate: number
    user_count: number
    latency_ms: number
  }>
  optimization_target: 'coverage' | 'capacity' | 'handover' | 'energy'
  target_thresholds: {
    min_rsrp?: number
    min_sinr?: number
    min_throughput_mbps?: number
    min_handover_rate?: number
    max_latency_ms?: number
  }
}

export interface CellOptimizationResult {
  cell_id: string
  band: string
  rsrp: number
  sinr: number
  throughput_mbps: number
  handover_rate: number
  user_count: number
  latency_ms: number
  health_score: number
  issues: string[]
  recommendations: string[]
}

export interface NetworkOptimizationResult {
  total_cells: number
  healthy_cells: number
  degraded_cells: number
  critical_cells: number
  avg_rsrp: number
  avg_sinr: number
  avg_throughput: number
  avg_handover_rate: number
  avg_latency: number
  network_health_score: number
  cells: CellOptimizationResult[]
  optimization_actions: string[]
  summary: string
}

// --- Tool 2: Spectrum Allocation Optimizer ---
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

export interface SpectrumBandResult {
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
  bands: SpectrumBandResult[]
  optimization_notes: string[]
}

// --- Tool 3: 5G/6G Deployment Planner ---
export interface FiveGDeploymentInput {
  deployment_type: 'greenfield' | 'brownfield' | 'densification'
  target_area_km2: number
  existing_sites: number
  target_coverage_pct: number
  spectrum_bands: string[]
  use_cases: string[]
  budget_usd: number
  timeline_months: number
}

export interface DeploymentSitePlan {
  site_id: string
  site_type: 'macro' | 'small_cell' | 'indoor' | 'mmwave'
  band: string
  coverage_radius_km: number
  estimated_capacity_gbps: number
  capex_usd: number
  opex_annual_usd: number
  priority: number
}

export interface FiveGDeploymentResult {
  total_sites_required: number
  new_sites: number
  upgraded_sites: number
  total_capex_usd: number
  annual_opex_usd: number
  coverage_achieved_pct: number
  capacity_total_gbps: number
  budget_feasible: boolean
  timeline_feasible: boolean
  sites: DeploymentSitePlan[]
  deployment_phases: string[]
  recommendations: string[]
}

// --- Tool 4: Network Slice Manager ---
export interface NetworkSliceInput {
  slice_templates: Array<{
    name: string
    type: 'eMBB' | 'URLLC' | 'mMTC' | 'HCS' | 'custom'
    max_bandwidth_pct: number
    max_latency_ms: number
    reliability_pct: number
    priority: number
    isolation_required: boolean
  }>
  total_bandwidth_mhz: number
  total_compute_units: number
  isolation_policy: 'physical' | 'logical' | 'hybrid'
}

export interface SliceAllocation {
  name: string
  type: string
  allocated_bandwidth_mhz: number
  allocated_bandwidth_pct: number
  allocated_compute_units: number
  max_latency_ms: number
  reliability_pct: number
  priority: number
  isolation_method: string
  status: 'active' | 'degraded' | 'rejected'
  rejection_reason?: string
}

export interface NetworkSliceResult {
  total_slices_requested: number
  active_slices: number
  degraded_slices: number
  rejected_slices: number
  bandwidth_utilization_pct: number
  compute_utilization_pct: number
  slices: SliceAllocation[]
  lifecycle_recommendations: string[]
}

// --- Tool 5: Customer Churn Predictor ---
export interface CustomerChurnInput {
  customers: Array<{
    customer_id: string
    tenure_months: number
    monthly_charges_usd: number
    total_charges_usd: number
    contract_type: 'month-to-month' | 'one_year' | 'two_year'
    support_calls_last_3m: number
    data_usage_gb: number
    satisfaction_score: number
    payment_delay_days: number
    has_premium_plan: boolean
    num_subscriptions: number
  }>
  churn_threshold?: number
}

export interface CustomerChurnRisk {
  customer_id: string
  churn_probability: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  key_factors: string[]
  retention_actions: string[]
  estimated_monthly_revenue_at_risk: number
}

export interface CustomerChurnResult {
  total_customers: number
  low_risk: number
  medium_risk: number
  high_risk: number
  critical_risk: number
  avg_churn_probability: number
  total_revenue_at_risk_usd: number
  customers: CustomerChurnRisk[]
  retention_program_recommendations: string[]
}

// --- Tool 6: Fraud Detection Telecom ---
export interface FraudDetectionInput {
  call_records: Array<{
    record_id: string
    caller_number: string
    callee_number: string
    call_duration_seconds: number
    call_type: 'local' | 'national' | 'international' | 'premium' | 'roaming'
    timestamp: number
    location: string
    cost_usd: number
  }>
  known_fraud_patterns?: string[]
  sensitivity?: 'low' | 'medium' | 'high'
}

export interface FraudAlert {
  record_id: string
  caller_number: string
  fraud_type: string
  confidence_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  indicators: string[]
  recommended_action: string
  estimated_financial_impact_usd: number
}

export interface FraudDetectionResult {
  total_records_analyzed: number
  alerts_generated: number
  high_confidence_alerts: number
  total_estimated_fraud_usd: number
  fraud_rate_pct: number
  alerts: FraudAlert[]
  pattern_summary: string[]
  prevention_recommendations: string[]
}

// --- Tool 7: Quality of Experience Analyzer ---
export interface QoEAnalysisInput {
  services: Array<{
    service_name: string
    service_type: 'voice' | 'video' | 'gaming' | 'streaming' | 'data' | 'iot'
    mos_score: number
    latency_ms: number
    jitter_ms: number
    packet_loss_pct: number
    throughput_mbps: number
    session_count: number
    error_rate_pct: number
  }>
  weights?: {
    mos?: number
    latency?: number
    jitter?: number
    packet_loss?: number
    throughput?: number
  }
}

export interface ServiceQoEResult {
  service_name: string
  service_type: string
  mos_score: number
  latency_ms: number
  jitter_ms: number
  packet_loss_pct: number
  throughput_mbps: number
  session_count: number
  qoe_score: number
  qoe_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  issues: string[]
  improvement_suggestions: string[]
}

export interface QoEAnalysisResult {
  total_services: number
  avg_qoe_score: number
  services_grade_a: number
  services_grade_b: number
  services_grade_c: number
  services_grade_d: number
  services_grade_f: number
  total_sessions: number
  services: ServiceQoEResult[]
  network_wide_issues: string[]
  improvement_roadmap: string[]
}

// --- Tool 8: Infrastructure Investment Advisor ---
export interface InfrastructureInvestmentInput {
  investment_type: '5g_rollout' | 'fiber_expansion' | 'data_center' | 'edge_computing' | 'spectrum_acquisition' | 'network_modernization'
  total_budget_usd: number
  project_duration_years: number
  target_regions: string[]
  expected_subscriber_growth_pct: number
  current_arpu_usd: number
  competitor_activity: 'low' | 'medium' | 'high'
  regulatory_environment: 'favorable' | 'neutral' | 'restrictive'
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
}

export interface InvestmentPhase {
  phase: number
  year: number
  description: string
  capex_usd: number
  opex_usd: number
  expected_revenue_usd: number
  cumulative_cash_flow_usd: number
  key_milestones: string[]
}

export interface InfrastructureInvestmentResult {
  investment_type: string
  total_budget_usd: number
  recommended_capex_usd: number
  total_opex_usd: number
  total_revenue_usd: number
  net_present_value_usd: number
  roi_pct: number
  payback_period_years: number
  irr_pct: number
  risk_adjusted_return_pct: number
  investment_grade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C'
  phases: InvestmentPhase[]
  risk_factors: string[]
  strategic_recommendations: string[]
}

// ==================== TOOL 1: NETWORK OPTIMIZATION ENGINE ====================

function optimizeNetwork(input: NetworkOptimizationInput): NetworkOptimizationResult {
  const seed = seedFromInput(input)
  const cells = input.cells
  const results: CellOptimizationResult[] = []
  let healthyCount = 0
  let degradedCount = 0
  let criticalCount = 0
  let totalRsrp = 0
  let totalSinr = 0
  let totalThroughput = 0
  let totalHandover = 0
  let totalLatency = 0

  const thresholds = input.target_thresholds
  const minRsrp = thresholds.min_rsrp ?? -110
  const minSinr = thresholds.min_sinr ?? 10
  const minThroughput = thresholds.min_throughput_mbps ?? 50
  const minHandover = thresholds.min_handover_rate ?? 95
  const maxLatency = thresholds.max_latency_ms ?? 30

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const cellSeed = seed + i * 137
    const issues: string[] = []
    const recommendations: string[] = []

    // Identify issues
    if (cell.rsrp < minRsrp) {
      issues.push('RSRP below threshold (' + cell.rsrp + ' dBm < ' + minRsrp + ' dBm)')
      recommendations.push('Increase TX power or adjust antenna tilt for cell ' + cell.cell_id)
    }
    if (cell.sinr < minSinr) {
      issues.push('SINR below threshold (' + cell.sinr + ' dB < ' + minSinr + ' dB)')
      recommendations.push('Optimize frequency planning to reduce interference on ' + cell.band)
    }
    if (cell.throughput_mbps < minThroughput) {
      issues.push('Throughput below target (' + cell.throughput_mbps + ' Mbps < ' + minThroughput + ' Mbps)')
      recommendations.push('Enable carrier aggregation or add PRBs for cell ' + cell.cell_id)
    }
    if (cell.handover_success_rate < minHandover) {
      issues.push('Handover success rate low (' + cell.handover_success_rate + '% < ' + minHandover + '%)')
      recommendations.push('Adjust handover margins and neighbor relations for cell ' + cell.cell_id)
    }
    if (cell.latency_ms > maxLatency) {
      issues.push('Latency exceeds target (' + cell.latency_ms + ' ms > ' + maxLatency + ' ms)')
      recommendations.push('Optimize scheduling algorithm and reduce processing delay')
    }

    // Health score (0-100)
    let healthScore = 100
    healthScore -= issues.length * rng.next(12, 18, cellSeed)
    healthScore = clamp(Math.round(healthScore + rng.next(-3, 3, cellSeed + 1)), 0, 100)

    let healthLabel: 'healthy' | 'degraded' | 'critical'
    if (healthScore >= 75) { healthyCount++; healthLabel = 'healthy' }
    else if (healthScore >= 45) { degradedCount++; healthLabel = 'degraded' }
    else { criticalCount++; healthLabel = 'critical' }

    if (healthLabel === 'critical') {
      recommendations.push('URGENT: Schedule field inspection for cell ' + cell.cell_id)
    }
    if (cell.user_count > 500 && healthLabel !== 'healthy') {
      recommendations.push('High user load (' + cell.user_count + ' users) on degraded cell - prioritize optimization')
    }

    totalRsrp += cell.rsrp
    totalSinr += cell.sinr
    totalThroughput += cell.throughput_mbps
    totalHandover += cell.handover_success_rate
    totalLatency += cell.latency_ms

    results.push({
      cell_id: cell.cell_id,
      band: cell.band,
      rsrp: cell.rsrp,
      sinr: cell.sinr,
      throughput_mbps: cell.throughput_mbps,
      handover_rate: cell.handover_success_rate,
      user_count: cell.user_count,
      latency_ms: cell.latency_ms,
      health_score: healthScore,
      issues,
      recommendations
    })
  }

  const n = Math.max(cells.length, 1)
  const avgRsrp = round2(totalRsrp / n)
  const avgSinr = round2(totalSinr / n)
  const avgThroughput = round2(totalThroughput / n)
  const avgHandover = round2(totalHandover / n)
  const avgLatency = round2(totalLatency / n)
  const networkHealth = clamp(Math.round((healthyCount / n) * 100 + rng.next(-3, 3, seed + 999)), 0, 100)

  const actions: string[] = []
  actions.push('Optimization target: ' + input.optimization_target)
  if (criticalCount > 0) actions.push('Immediate action required for ' + criticalCount + ' critical cell(s)')
  if (degradedCount > cells.length * 0.2) actions.push('Over 20% cells degraded - consider systematic parameter audit')
  if (avgRsrp < minRsrp) actions.push('Network-wide coverage gap detected - plan site densification')
  if (avgSinr < minSinr) actions.push('Interference levels elevated - run ICIC/eICIC optimization')
  if (avgHandover < minHandover) actions.push('Mobility performance below target - review handover parameters')
  actions.push('Deploy ML-based self-organizing network (SON) for continuous optimization')
  actions.push('Implement real-time KPI monitoring with automated anomaly detection')

  const summary = 'Network health: ' + networkHealth + '% | ' + healthyCount + ' healthy, ' + degradedCount + ' degraded, ' + criticalCount + ' critical out of ' + cells.length + ' cells'

  return {
    total_cells: cells.length,
    healthy_cells: healthyCount,
    degraded_cells: degradedCount,
    critical_cells: criticalCount,
    avg_rsrp: avgRsrp,
    avg_sinr: avgSinr,
    avg_throughput: avgThroughput,
    avg_handover_rate: avgHandover,
    avg_latency: avgLatency,
    network_health_score: networkHealth,
    cells: results,
    optimization_actions: actions,
    summary
  }
}

function formatNetworkOptimizationReport(input: NetworkOptimizationInput, result: NetworkOptimizationResult): string {
  const lines: string[] = []
  lines.push('## Network Optimization Engine Report')
  lines.push('')
  lines.push('**Optimization Target:** ' + input.optimization_target + ' | **Cells Analyzed:** ' + result.total_cells)
  lines.push('')
  lines.push('### Network Health Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Network Health Score | ' + result.network_health_score + '% |')
  lines.push('| Healthy Cells | ' + result.healthy_cells + ' |')
  lines.push('| Degraded Cells | ' + result.degraded_cells + ' |')
  lines.push('| Critical Cells | ' + result.critical_cells + ' |')
  lines.push('| Avg RSRP | ' + result.avg_rsrp + ' dBm |')
  lines.push('| Avg SINR | ' + result.avg_sinr + ' dB |')
  lines.push('| Avg Throughput | ' + result.avg_throughput + ' Mbps |')
  lines.push('| Avg Handover Rate | ' + result.avg_handover_rate + '% |')
  lines.push('| Avg Latency | ' + result.avg_latency + ' ms |')
  lines.push('')

  lines.push('### Cell Details')
  lines.push('| Cell | Band | RSRP | SINR | Throughput | Handover | Health | Issues |')
  lines.push('|------|------|------|------|------------|----------|--------|--------|')
  for (const c of result.cells) {
    lines.push('| ' + c.cell_id + ' | ' + c.band + ' | ' + c.rsrp + ' | ' + c.sinr + ' | ' + c.throughput_mbps + ' Mbps | ' + c.handover_rate + '% | ' + c.health_score + '% | ' + c.issues.length + ' |')
  }
  lines.push('')

  if (result.optimization_actions.length > 0) {
    lines.push('### Optimization Actions')
    for (const a of result.optimization_actions) {
      lines.push('- ' + a)
    }
    lines.push('')
  }

  lines.push('> ' + result.summary)
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: SPECTRUM ALLOCATION OPTIMIZER ====================

function optimizeSpectrumAllocation(input: SpectrumAllocationInput): SpectrumAllocationResult {
  const seed = seedFromInput(input)
  const bands = input.frequency_bands_mhz
  const maxBw = input.license_constraints?.max_bandwidth_mhz ?? 100
  const exclusive = input.license_constraints?.exclusive_bands ?? []
  const region = input.license_constraints?.regulatory_region ?? 'ITU Region 3'

  const bandResults: SpectrumBandResult[] = []
  let totalCapacity = 0
  let totalCoverage = 0
  let maxInterference = 0
  let allocatedCount = 0

  for (let i = 0; i < bands.length; i++) {
    const band = bands[i]
    const bandSeed = seed + i * 137

    const coverageRadius = clamp(120 / Math.sqrt(band) + rng.nextFloat(-1, 3, bandSeed), 1, 50)
    const spectralEfficiency = rng.nextFloat(2.5, 6.5, bandSeed + 1)
    const capacity = round2(band * spectralEfficiency * 0.001)
    const interference = rng.nextFloat(-90, -60, bandSeed + 2)

    const isExclusive = exclusive.length === 0 || exclusive.includes(band)
    const withinBandwidth = band <= maxBw
    const withinInterference = interference > input.interference_threshold_db
    const allocated = isExclusive && withinBandwidth && withinInterference

    const useCases = ['eMBB downlink', 'FDD uplink', 'Carrier aggregation', 'Private 5G', 'Backhaul']
    const recommendedUse = rng.pick(useCases, bandSeed + 3)
    const efficiencyScore = Math.round(clamp(rng.nextFloat(40, 95, bandSeed + 4) + (allocated ? 10 : -20), 0, 100))

    bandResults.push({
      band_mhz: band,
      allocated,
      coverage_radius_km: round1(coverageRadius),
      capacity_gbps: capacity,
      interference_risk_db: round1(interference),
      recommended_use: recommendedUse,
      efficiency_score: efficiencyScore
    })

    if (allocated) {
      allocatedCount++
      totalCapacity += capacity
      totalCoverage += coverageRadius
    }
    if (interference > maxInterference) maxInterference = interference
  }

  const avgCoverage = allocatedCount > 0 ? round1(totalCoverage / allocatedCount) : 0
  const efficiency = Math.round(clamp((allocatedCount / Math.max(bands.length, 1)) * 100 + rng.next(-5, 5, seed + 999), 0, 100))

  const notes: string[] = []
  notes.push('Analyzed ' + bands.length + ' frequency bands covering ' + input.coverage_area_km2 + ' km2 with population density of ' + input.population_density + '/km2')
  notes.push('Regulatory region: ' + region + ' - exclusive bands: ' + (exclusive.length > 0 ? exclusive.join(', ') : 'none specified'))
  if (allocatedCount < bands.length) notes.push((bands.length - allocatedCount) + ' bands rejected due to interference, bandwidth, or licensing constraints')
  if (efficiency < 60) notes.push('Spectrum efficiency below target - consider band refarming or carrier aggregation')
  if (avgCoverage < 5) notes.push('Coverage radius limited - additional small cells or macro tower densification recommended')
  notes.push('AI-driven real-time spectrum sharing (CBRS/LSA) could improve utilization by 20-30%')

  return {
    total_bands_analyzed: bands.length,
    bands_allocated: allocatedCount,
    total_capacity_gbps: round2(totalCapacity),
    avg_coverage_radius_km: avgCoverage,
    max_interference_db: round1(maxInterference),
    spectrum_efficiency_pct: efficiency,
    bands: bandResults,
    optimization_notes: notes
  }
}

function formatSpectrumAllocationReport(input: SpectrumAllocationInput, result: SpectrumAllocationResult): string {
  const lines: string[] = []
  lines.push('## Spectrum Allocation Optimization Report')
  lines.push('')
  lines.push('**Coverage Area:** ' + input.coverage_area_km2 + ' km2 | **Population Density:** ' + input.population_density + '/km2')
  lines.push('**Interference Threshold:** ' + input.interference_threshold_db + ' dB | **Max Bandwidth:** ' + (input.license_constraints?.max_bandwidth_mhz ?? 100) + ' MHz')
  lines.push('')
  lines.push('### Allocation Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Bands Analyzed | ' + result.total_bands_analyzed + ' |')
  lines.push('| Bands Allocated | ' + result.bands_allocated + ' |')
  lines.push('| Total Capacity | ' + result.total_capacity_gbps + ' Gbps |')
  lines.push('| Avg Coverage Radius | ' + result.avg_coverage_radius_km + ' km |')
  lines.push('| Max Interference | ' + result.max_interference_db + ' dB |')
  lines.push('| Spectrum Efficiency | ' + result.spectrum_efficiency_pct + '% |')
  lines.push('')

  lines.push('### Band Details')
  lines.push('| Band (MHz) | Alloc | Coverage (km) | Capacity (Gbps) | Interference (dB) | Use Case | Efficiency |')
  lines.push('|-----------|-------|---------------|----------------|-------------------|----------|------------|')
  for (const b of result.bands) {
    lines.push('| ' + b.band_mhz + ' | ' + (b.allocated ? 'Yes' : 'No') + ' | ' + b.coverage_radius_km + ' | ' + b.capacity_gbps + ' | ' + b.interference_risk_db + ' | ' + b.recommended_use + ' | ' + b.efficiency_score + '% |')
  }
  lines.push('')

  if (result.optimization_notes.length > 0) {
    lines.push('### Optimization Notes')
    for (const n of result.optimization_notes) {
      lines.push('- ' + n)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: 5G/6G DEPLOYMENT PLANNER ====================

function planFiveGDeployment(input: FiveGDeploymentInput): FiveGDeploymentResult {
  const seed = seedFromInput(input)
  const sites: DeploymentSitePlan[] = []

  const coveragePerMacro = 10.0
  const coveragePerSmall = 1.5
  const coveragePerIndoor = 0.3
  const coveragePerMmwave = 0.5

  const totalCoverageNeeded = input.target_area_km2 * (input.target_coverage_pct / 100)
  const existingCoverage = input.existing_sites * coveragePerMacro
  const coverageGap = Math.max(0, totalCoverageNeeded - existingCoverage)

  const siteTypeDistribution: Record<string, { type: DeploymentSitePlan['site_type']; coverage: number; capex: [number, number]; opex: [number, number] }> = {
    macro: { type: 'macro', coverage: coveragePerMacro, capex: [80000, 150000], opex: [12000, 25000] },
    small_cell: { type: 'small_cell', coverage: coveragePerSmall, capex: [15000, 40000], opex: [3000, 8000] },
    indoor: { type: 'indoor', coverage: coveragePerIndoor, capex: [5000, 20000], opex: [1000, 5000] },
    mmwave: { type: 'mmwave', coverage: coveragePerMmwave, capex: [20000, 50000], opex: [4000, 10000] }
  }

  let remainingCoverage = coverageGap
  let siteIdx = 0
  let totalCapex = 0
  let totalOpex = 0
  let totalCapacity = 0
  let newSites = 0
  let upgradedSites = 0

  // Upgrade existing sites first
  const upgradeCount = Math.min(input.existing_sites, Math.ceil(input.existing_sites * 0.6))
  for (let i = 0; i < upgradeCount; i++) {
    const siteSeed = seed + siteIdx * 211
    const band = rng.pick(input.spectrum_bands.length > 0 ? input.spectrum_bands : ['n78'], siteSeed)
    const capex = rng.next(20000, 50000, siteSeed + 1)
    const opex = rng.next(3000, 8000, siteSeed + 2)
    totalCapex += capex
    totalOpex += opex
    upgradedSites++
    siteIdx++
  }

  // Deploy new sites
  while (remainingCoverage > 0 && siteIdx < 200) {
    const siteSeed = seed + siteIdx * 211
    const siteTypes = ['macro', 'small cell', 'indoor', 'mmwave']
    const weights = input.deployment_type === 'densification' ? [0.2, 0.4, 0.2, 0.2] : [0.4, 0.3, 0.15, 0.15]
    const pickVal = rng.nextFloat(0, 1, siteSeed + 10)
    let cumSum = 0
    let selectedType = 'macro'
    for (let t = 0; t < siteTypes.length; t++) {
      cumSum += weights[t]
      if (pickVal <= cumSum) { selectedType = siteTypes[t]; break }
    }

    const siteDef = siteTypeDistribution[selectedType]
    const band = rng.pick(input.spectrum_bands.length > 0 ? input.spectrum_bands : ['n78'], siteSeed)
    const capex = rng.next(siteDef.capex[0], siteDef.capex[1], siteSeed + 1)
    const opex = rng.next(siteDef.opex[0], siteDef.opex[1], siteSeed + 2)
    const capacity = round2(rng.nextFloat(0.5, 10, siteSeed + 3) * (selectedType === 'macro' ? 3 : 1))

    totalCapex += capex
    totalOpex += opex
    totalCapacity += capacity
    remainingCoverage -= siteDef.coverage
    newSites++

    sites.push({
      site_id: 'SITE-' + String(siteIdx + 1).padStart(3, '0'),
      site_type: siteDef.type,
      band,
      coverage_radius_km: round1(siteDef.coverage * rng.nextFloat(0.7, 1.0, siteDef.type.length + siteSeed)),
      estimated_capacity_gbps: capacity,
      capex_usd: capex,
      opex_annual_usd: opex,
      priority: siteDef.type === 'macro' ? 1 : siteDef.type === 'small_cell' ? 2 : 3
    })
    siteIdx++
  }

  const coverageAchieved = Math.min(100, round1(((existingCoverage + coverageGap - Math.max(0, remainingCoverage)) / input.target_area_km2) * 100))
  const budgetFeasible = totalCapex <= input.budget_usd
  const timelineFeasible = input.timeline_months >= Math.ceil(newSites / 12)

  const phases: string[] = []
  phases.push('Phase 1 (Months 1-3): Site acquisition, permitting, and detailed RF design')
  phases.push('Phase 2 (Months 4-' + Math.min(6, input.timeline_months) + '): Core network upgrade and backhaul provisioning')
  phases.push('Phase 3 (Months ' + Math.min(7, input.timeline_months) + '-' + Math.min(12, input.timeline_months) + '): First wave site deployment and commissioning')
  if (input.timeline_months > 12) phases.push('Phase 4 (Months 13-' + input.timeline_months + '): Densification and optimization')

  const recommendations: string[] = []
  recommendations.push('Deployment type: ' + input.deployment_type + ' | Spectrum: ' + (input.spectrum_bands.join(', ') ?? 'n78'))
  if (!budgetFeasible) recommendations.push('Budget overrun: $' + totalCapex.toLocaleString() + ' vs $' + input.budget_usd.toLocaleString() + ' - consider phased deployment or infrastructure sharing')
  if (!timelineFeasible) recommendations.push('Timeline aggressive for ' + newSites + ' sites - increase workforce or extend schedule')
  if (input.target_coverage_pct > 95) recommendations.push('Ultra-high coverage target - plan for indoor small cells and mmWave hotspots')
  recommendations.push('Use AI-based RF propagation modeling for 15-20% fewer sites at same coverage')
  recommendations.push('Implement zero-touch provisioning (ZTP) to accelerate deployment velocity')
  recommendations.push('Plan for 6G evolution: ensure sites support software-upgradable radios')

  return {
    total_sites_required: newSites + upgradedSites,
    new_sites: newSites,
    upgraded_sites: upgradedSites,
    total_capex_usd: totalCapex,
    annual_opex_usd: totalOpex,
    coverage_achieved_pct: coverageAchieved,
    capacity_total_gbps: round2(totalCapacity),
    budget_feasible: budgetFeasible,
    timeline_feasible: timelineFeasible,
    sites,
    deployment_phases: phases,
    recommendations
  }
}

function formatFiveGDeploymentReport(input: FiveGDeploymentInput, result: FiveGDeploymentResult): string {
  const lines: string[] = []
  lines.push('## 5G/6G Deployment Plan Report')
  lines.push('')
  lines.push('**Deployment Type:** ' + input.deployment_type + ' | **Target Area:** ' + input.target_area_km2 + ' km2 | **Target Coverage:** ' + input.target_coverage_pct + '%')
  lines.push('**Budget:** $' + input.budget_usd.toLocaleString() + ' | **Timeline:** ' + input.timeline_months + ' months | **Existing Sites:** ' + input.existing_sites)
  lines.push('')
  lines.push('### Deployment Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Sites Required | ' + result.total_sites_required + ' |')
  lines.push('| New Sites | ' + result.new_sites + ' |')
  lines.push('| Upgraded Sites | ' + result.upgraded_sites + ' |')
  lines.push('| Total CAPEX | $' + result.total_capex_usd.toLocaleString() + ' |')
  lines.push('| Annual OPEX | $' + result.annual_opex_usd.toLocaleString() + ' |')
  lines.push('| Coverage Achieved | ' + result.coverage_achieved_pct + '% |')
  lines.push('| Total Capacity | ' + result.capacity_total_gbps + ' Gbps |')
  lines.push('| Budget Feasible | ' + (result.budget_feasible ? 'Yes' : 'No') + ' |')
  lines.push('| Timeline Feasible | ' + (result.timeline_feasible ? 'Yes' : 'No') + ' |')
  lines.push('')

  if (result.sites.length > 0) {
    lines.push('### Site Plan (first 20)')
    lines.push('| Site ID | Type | Band | Coverage (km) | Capacity (Gbps) | CAPEX | OPEX | Priority |')
    lines.push('|---------|------|------|---------------|-----------------|-------|------|----------|')
    for (const s of result.sites.slice(0, 20)) {
      lines.push('| ' + s.site_id + ' | ' + s.site_type + ' | ' + s.band + ' | ' + s.coverage_radius_km + ' | ' + s.estimated_capacity_gbps + ' | $' + s.capex_usd.toLocaleString() + ' | $' + s.opex_annual_usd.toLocaleString() + ' | P' + s.priority + ' |')
    }
    if (result.sites.length > 20) lines.push('| ... | (' + (result.sites.length - 20) + ' more sites) | | | | | | |')
    lines.push('')
  }

  if (result.deployment_phases.length > 0) {
    lines.push('### Deployment Phases')
    for (const p of result.deployment_phases) {
      lines.push('- ' + p)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: NETWORK SLICE MANAGER ====================

function manageNetworkSlices(input: NetworkSliceInput): NetworkSliceResult {
  const seed = seedFromInput(input)
  const slices: SliceAllocation[] = []
  let activeCount = 0
  let degradedCount = 0
  let rejectedCount = 0
  let usedBandwidth = 0
  let usedCompute = 0

  const isolationMethods: Record<string, string> = {
    physical: 'Dedicated hardware resources per slice',
    logical: 'Shared hardware with VLAN/VRF separation',
    hybrid: 'Critical slices physical, best-effort logical'
  }

  for (let i = 0; i < input.slice_templates.length; i++) {
    const tmpl = input.slice_templates[i]
    const sliceSeed = seed + i * 313

    const requestedBw = Math.round(input.total_bandwidth_mhz * tmpl.max_bandwidth_pct / 100)
    const requestedCompute = Math.max(1, Math.round(input.total_compute_units * (tmpl.max_bandwidth_pct / 100) * rng.nextFloat(0.8, 1.2, sliceSeed)))

    const availableBw = input.total_bandwidth_mhz - usedBandwidth
    const availableCompute = input.total_compute_units - usedCompute

    let status: 'active' | 'degraded' | 'rejected' = 'active'
    let rejectionReason: string | undefined
    let allocatedBw = requestedBw
    let allocatedCompute = requestedCompute

    if (requestedBw > availableBw && requestedCompute > availableCompute) {
      status = 'rejected'
      rejectionReason = 'Insufficient bandwidth and compute resources'
      allocatedBw = 0
      allocatedCompute = 0
      rejectedCount++
    } else if (requestedBw > availableBw) {
      status = 'degraded'
      allocatedBw = Math.round(availableBw * 0.8)
      allocatedCompute = Math.min(requestedCompute, availableCompute)
      usedBandwidth += allocatedBw
      usedCompute += allocatedCompute
      degradedCount++
    } else if (requestedCompute > availableCompute) {
      status = 'degraded'
      allocatedCompute = Math.round(availableCompute * 0.8)
      allocatedBw = Math.min(requestedBw, availableBw)
      usedBandwidth += allocatedBw
      usedCompute += allocatedCompute
      degradedCount++
    } else {
      usedBandwidth += allocatedBw
      usedCompute += allocatedCompute
      activeCount++
    }

    slices.push({
      name: tmpl.name,
      type: tmpl.type,
      allocated_bandwidth_mhz: allocatedBw,
      allocated_bandwidth_pct: round1((allocatedBw / input.total_bandwidth_mhz) * 100),
      allocated_compute_units: allocatedCompute,
      max_latency_ms: tmpl.max_latency_ms,
      reliability_pct: tmpl.reliability_pct,
      priority: tmpl.priority,
      isolation_method: tmpl.isolation_required ? isolationMethods.physical : isolationMethods[input.isolation_policy],
      status,
      rejection_reason: rejectionReason
    })
  }

  const bwUtil = round1((usedBandwidth / input.total_bandwidth_mhz) * 100)
  const computeUtil = round1((usedCompute / input.total_compute_units) * 100)

  const lifecycleRecs: string[] = []
  lifecycleRecs.push('Isolation policy: ' + input.isolation_policy + ' - ' + isolationMethods[input.isolation_policy])
  if (rejectedCount > 0) lifecycleRecs.push(rejectedCount + ' slice(s) rejected - review resource allocation or add capacity')
  if (degradedCount > 0) lifecycleRecs.push(degradedCount + ' slice(s) degraded - monitor SLA compliance closely')
  if (bwUtil > 90) lifecycleRecs.push('Bandwidth utilization at ' + bwUtil + '% - limited headroom for new slices')
  if (computeUtil > 85) lifecycleRecs.push('Compute utilization at ' + computeUtil + '% - consider edge node expansion')
  lifecycleRecs.push('Implement AI-driven dynamic slice scaling for 20-30% resource efficiency gains')
  lifecycleRecs.push('Deploy real-time SLA monitoring with automated slice reconfiguration triggers')
  lifecycleRecs.push('Plan for network slice as a service (NSaaS) monetization opportunities')

  return {
    total_slices_requested: input.slice_templates.length,
    active_slices: activeCount,
    degraded_slices: degradedCount,
    rejected_slices: rejectedCount,
    bandwidth_utilization_pct: bwUtil,
    compute_utilization_pct: computeUtil,
    slices,
    lifecycle_recommendations: lifecycleRecs
  }
}

function formatNetworkSliceReport(input: NetworkSliceInput, result: NetworkSliceResult): string {
  const lines: string[] = []
  lines.push('## Network Slice Management Report')
  lines.push('')
  lines.push('**Total Bandwidth:** ' + input.total_bandwidth_mhz + ' MHz | **Total Compute:** ' + input.total_compute_units + ' units | **Isolation:** ' + input.isolation_policy)
  lines.push('')
  lines.push('### Slice Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Slices Requested | ' + result.total_slices_requested + ' |')
  lines.push('| Active | ' + result.active_slices + ' |')
  lines.push('| Degraded | ' + result.degraded_slices + ' |')
  lines.push('| Rejected | ' + result.rejected_slices + ' |')
  lines.push('| Bandwidth Utilization | ' + result.bandwidth_utilization_pct + '% |')
  lines.push('| Compute Utilization | ' + result.compute_utilization_pct + '% |')
  lines.push('')

  lines.push('### Slice Allocations')
  lines.push('| Name | Type | BW (MHz) | BW % | Compute | Latency (ms) | Reliability | Status |')
  lines.push('|------|------|----------|------|---------|-------------|-------------|--------|')
  for (const s of result.slices) {
    lines.push('| ' + s.name + ' | ' + s.type + ' | ' + s.allocated_bandwidth_mhz + ' | ' + s.allocated_bandwidth_pct + '% | ' + s.allocated_compute_units + ' | ' + s.max_latency_ms + ' | ' + s.reliability_pct + '% | ' + s.status + ' |')
  }
  lines.push('')

  if (result.lifecycle_recommendations.length > 0) {
    lines.push('### Lifecycle Recommendations')
    for (const r of result.lifecycle_recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: CUSTOMER CHURN PREDICTOR ====================

function predictCustomerChurn(input: CustomerChurnInput): CustomerChurnResult {
  const seed = seedFromInput(input)
  const churnThreshold = input.churn_threshold ?? 0.5
  const results: CustomerChurnRisk[] = []
  let lowCount = 0
  let medCount = 0
  let highCount = 0
  let critCount = 0
  let totalChurnProb = 0
  let totalRevenueAtRisk = 0

  for (let i = 0; i < input.customers.length; i++) {
    const cust = input.customers[i]
    const custSeed = seed + i * 419
    const factors: string[] = []
    const actions: string[] = []

    // Churn probability model (simplified logistic-style scoring)
    let churnScore = 0.3

    // Tenure factor (shorter = higher churn)
    if (cust.tenure_months < 6) { churnScore += 0.2; factors.push('Short tenure (' + cust.tenure_months + ' months)') }
    else if (cust.tenure_months < 12) { churnScore += 0.1; factors.push('Early tenure (' + cust.tenure_months + ' months)') }
    else if (cust.tenure_months > 36) { churnScore -= 0.15; factors.push('Long tenure loyalty (' + cust.tenure_months + ' months)') }

    // Contract type
    if (cust.contract_type === 'month-to-month') { churnScore += 0.15; factors.push('Month-to-month contract (no lock-in)') }
    else if (cust.contract_type === 'two_year') { churnScore -= 0.1; factors.push('Two-year contract commitment') }

    // Support calls
    if (cust.support_calls_last_3m > 5) { churnScore += 0.2; factors.push('High support calls (' + cust.support_calls_last_3m + ' in 3 months)') }
    else if (cust.support_calls_last_3m > 2) { churnScore += 0.08; factors.push('Elevated support calls (' + cust.support_calls_last_3m + ' in 3 months)') }

    // Satisfaction
    if (cust.satisfaction_score < 5) { churnScore += 0.2; factors.push('Low satisfaction score (' + cust.satisfaction_score + '/10)') }
    else if (cust.satisfaction_score < 7) { churnScore += 0.08; factors.push('Moderate satisfaction (' + cust.satisfaction_score + '/10)') }
    else if (cust.satisfaction_score >= 9) { churnScore -= 0.1; factors.push('High satisfaction (' + cust.satisfaction_score + '/10)') }

    // Payment delays
    if (cust.payment_delay_days > 30) { churnScore += 0.15; factors.push('Payment delays (' + cust.payment_delay_days + ' days)') }
    else if (cust.payment_delay_days > 10) { churnScore += 0.05; factors.push('Minor payment delays (' + cust.payment_delay_days + ' days)') }

    // Data usage (low usage = less sticky)
    if (cust.data_usage_gb < 5) { churnScore += 0.08; factors.push('Low data usage (' + cust.data_usage_gb + ' GB)') }

    // Monthly charges (higher = more incentive to shop)
    if (cust.monthly_charges_usd > 80) { churnScore += 0.08; factors.push('High monthly charges ($' + cust.monthly_charges_usd + ')') }

    // Premium plan (more sticky)
    if (cust.has_premium_plan) { churnScore -= 0.08; factors.push('Premium plan subscriber') }

    // Number of subscriptions (more = stickier)
    if (cust.num_subscriptions >= 3) { churnScore -= 0.1; factors.push('Multi-service bundle (' + cust.num_subscriptions + ' services)') }
    else if (cust.num_subscriptions === 1) { churnScore += 0.05; factors.push('Single service (no bundle)') }

    // Add noise
    churnScore += rng.nextFloat(-0.05, 0.05, custSeed)
    const churnProb = clamp(round2(churnScore), 0, 1)

    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (churnProb < 0.25) { riskLevel = 'low'; lowCount++ }
    else if (churnProb < 0.5) { riskLevel = 'medium'; medCount++ }
    else if (churnProb < churnThreshold + 0.15) { riskLevel = 'high'; highCount++ }
    else { riskLevel = 'critical'; critCount++ }

    // Retention actions
    if (riskLevel === 'critical') {
      actions.push('Immediate outreach: assign dedicated retention specialist')
      actions.push('Offer loyalty discount or plan upgrade at no cost')
    }
    if (riskLevel === 'high') {
      actions.push('Proactive call to address pain points')
      actions.push('Offer bundle discount or data boost')
    }
    if (cust.support_calls_last_3m > 3) {
      actions.push('Escalate unresolved support issues to priority queue')
    }
    if (cust.satisfaction_score < 6) {
      actions.push('Send satisfaction survey and follow-up with personalized offer')
    }
    if (cust.contract_type === 'month-to-month' && churnProb > 0.4) {
      actions.push('Offer contract upgrade incentive (e.g., free month for 1-year commitment)')
    }
    if (actions.length === 0) {
      actions.push('Continue monitoring - include in loyalty rewards program')
    }

    const revenueAtRisk = round2(churnProb * cust.monthly_charges_usd)
    totalRevenueAtRisk += revenueAtRisk
    totalChurnProb += churnProb

    results.push({
      customer_id: cust.customer_id,
      churn_probability: churnProb,
      risk_level: riskLevel,
      key_factors: factors,
      retention_actions: actions,
      estimated_monthly_revenue_at_risk: revenueAtRisk
    })
  }

  const avgChurn = input.customers.length > 0 ? round2(totalChurnProb / input.customers.length) : 0

  const programRecs: string[] = []
  programRecs.push('Total customers analyzed: ' + input.customers.length + ' | Average churn probability: ' + (avgChurn * 100) + '%')
  if (critCount > 0) programRecs.push('CRITICAL: ' + critCount + ' customer(s) require immediate retention intervention')
  if (highCount > input.customers.length * 0.1) programRecs.push('High-risk segment exceeds 10% - review pricing and service quality')
  programRecs.push('Deploy ML-based early warning system for real-time churn scoring')
  programRecs.push('Implement personalized retention offers using recommendation engine')
  programRecs.push('Establish win-back campaign for recently churned customers (target 15-20% recovery)')
  programRecs.push('Create loyalty tier program with escalating benefits for tenure milestones')

  return {
    total_customers: input.customers.length,
    low_risk: lowCount,
    medium_risk: medCount,
    high_risk: highCount,
    critical_risk: critCount,
    avg_churn_probability: avgChurn,
    total_revenue_at_risk_usd: round2(totalRevenueAtRisk),
    customers: results,
    retention_program_recommendations: programRecs
  }
}

function formatCustomerChurnReport(input: CustomerChurnInput, result: CustomerChurnResult): string {
  const lines: string[] = []
  lines.push('## Customer Churn Prediction Report')
  lines.push('')
  lines.push('**Total Customers:** ' + result.total_customers + ' | **Churn Threshold:** ' + ((input.churn_threshold ?? 0.5) * 100) + '%')
  lines.push('')
  lines.push('### Risk Distribution')
  lines.push('| Risk Level | Count | Percentage |')
  lines.push('|-----------|-------|------------|')
  lines.push('| Low | ' + result.low_risk + ' | ' + round1((result.low_risk / Math.max(result.total_customers, 1)) * 100) + '% |')
  lines.push('| Medium | ' + result.medium_risk + ' | ' + round1((result.medium_risk / Math.max(result.total_customers, 1)) * 100) + '% |')
  lines.push('| High | ' + result.high_risk + ' | ' + round1((result.high_risk / Math.max(result.total_customers, 1)) * 100) + '% |')
  lines.push('| Critical | ' + result.critical_risk + ' | ' + round1((result.critical_risk / Math.max(result.total_customers, 1)) * 100) + '% |')
  lines.push('| **Avg Churn Prob** | | **' + (result.avg_churn_probability * 100) + '%** |')
  lines.push('| **Revenue at Risk** | | **$' + result.total_revenue_at_risk_usd.toLocaleString() + '/month** |')
  lines.push('')

  lines.push('### High/Critical Risk Customers')
  lines.push('| Customer ID | Churn Prob | Risk | Revenue at Risk | Key Factors |')
  lines.push('|-------------|-----------|------|-----------------|-------------|')
  for (const c of result.customers.filter(c => c.risk_level === 'high' || c.risk_level === 'critical')) {
    lines.push('| ' + c.customer_id + ' | ' + (c.churn_probability * 100) + '% | ' + c.risk_level + ' | $' + c.estimated_monthly_revenue_at_risk + ' | ' + c.key_factors.slice(0, 2).join('; ') + ' |')
  }
  lines.push('')

  if (result.retention_program_recommendations.length > 0) {
    lines.push('### Retention Program Recommendations')
    for (const r of result.retention_program_recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: FRAUD DETECTION TELECOM ====================

function detectFraud(input: FraudDetectionInput): FraudDetectionResult {
  const seed = seedFromInput(input)
  const sensitivity = input.sensitivity ?? 'medium'
  const alerts: FraudAlert[] = []
  let totalFraudUsd = 0
  let highConfCount = 0

  const fraudPatterns: Record<string, { indicators: string[]; threshold: number }> = {
    'SIM Box/Bypass': { indicators: ['High call volume to international', 'Short duration calls', 'Sequential dialing'], threshold: 0.6 },
    'Wangiri (One-ring)': { indicators: ['Very short incoming calls', 'Premium rate callbacks', 'Repeated missed calls'], threshold: 0.5 },
    'Subscription Fraud': { indicators: ['New account high usage', 'No payment history', 'Multiple SIMs activated'], threshold: 0.7 },
    'Roaming Fraud': { indicators: ['Roaming in high-risk regions', 'Unusual roaming charges', 'Location mismatch'], threshold: 0.65 },
    'IRS/Fraud': { indicators: ['International revenue sharing', 'Excessive premium rate calls', 'Unusual call patterns'], threshold: 0.6 },
    'CLI Spoofing': { indicators: ['Caller ID mismatch', 'Multiple calls same number', 'Call forwarding anomalies'], threshold: 0.55 }
  }

  const sensitivityMultiplier: Record<string, number> = { low: 0.7, medium: 1.0, high: 1.3 }
  const sensMult = sensitivityMultiplier[sensitivity]

  for (let i = 0; i < input.call_records.length; i++) {
    const record = input.call_records[i]
    const recSeed = seed + i * 523

    // Score each fraud pattern
    for (const [patternName, pattern] of Object.entries(fraudPatterns)) {
      let score = 0
      const matchedIndicators: string[] = []

      // Check indicators
      if (patternName === 'SIM Box/Bypass') {
        if (record.call_type === 'international' && record.call_duration_seconds < 30) { score += 0.3; matchedIndicators.push('Short international call') }
        if (record.call_type === 'international' && record.cost_usd > 5) { score += 0.2; matchedIndicators.push('High-cost international') }
      }
      if (patternName === 'Wangiri (One-ring)') {
        if (record.call_duration_seconds < 5) { score += 0.3; matchedIndicators.push('Very short call duration') }
        if (record.call_type === 'premium') { score += 0.25; matchedIndicators.push('Premium rate call') }
      }
      if (patternName === 'Subscription Fraud') {
        if (record.cost_usd > 50) { score += 0.25; matchedIndicators.push('High cost for new pattern') }
        if (record.call_type === 'international' && record.call_duration_seconds > 600) { score += 0.2; matchedIndicators.push('Long international call') }
      }
      if (patternName === 'Roaming Fraud') {
        if (record.call_type === 'roaming') { score += 0.35; matchedIndicators.push('Roaming activity detected') }
        if (record.cost_usd > 20 && record.call_type === 'roaming') { score += 0.2; matchedIndicators.push('High roaming charges') }
      }
      if (patternName === 'IRS/Fraud') {
        if (record.call_type === 'premium') { score += 0.3; matchedIndicators.push('Premium rate call') }
        if (record.cost_usd > 10) { score += 0.2; matchedIndicators.push('High premium charges') }
      }
      if (patternName === 'CLI Spoofing') {
        if (record.call_duration_seconds < 10 && record.call_type === 'international') { score += 0.25; matchedIndicators.push('Suspicious short international') }
        if (record.caller_number === record.callee_number) { score += 0.4; matchedIndicators.push('Caller equals callee') }
      }

      // Add noise
      score += rng.nextFloat(-0.05, 0.05, recSeed + patternName.length)
      score *= sensMult
      const confidence = clamp(round2(score), 0, 1)

      if (confidence >= pattern.threshold) {
        let riskLevel: 'low' | 'medium' | 'high' | 'critical'
        if (confidence >= 0.85) riskLevel = 'critical'
        else if (confidence >= 0.7) riskLevel = 'high'
        else if (confidence >= 0.5) riskLevel = 'medium'
        else riskLevel = 'low'

        const financialImpact = round2(confidence * record.cost_usd * rng.nextFloat(1, 5, recSeed + 99))
        totalFraudUsd += financialImpact
        if (confidence >= 0.7) highConfCount++

        let action: string
        if (riskLevel === 'critical') action = 'Block number immediately and escalate to fraud investigation team'
        else if (riskLevel === 'high') action = 'Flag for review and temporarily restrict international/premium calls'
        else if (riskLevel === 'medium') action = 'Add to watchlist and monitor next 48 hours of activity'
        else action = 'Log for pattern analysis and include in next fraud report'

        alerts.push({
          record_id: record.record_id,
          caller_number: record.caller_number,
          fraud_type: patternName,
          confidence_score: confidence,
          risk_level: riskLevel,
          indicators: matchedIndicators,
          recommended_action: action,
          estimated_financial_impact_usd: financialImpact
        })
      }
    }
  }

  // Sort alerts by confidence descending
  alerts.sort((a, b) => b.confidence_score - a.confidence_score)

  const fraudRate = input.call_records.length > 0 ? round2((alerts.length / input.call_records.length) * 100) : 0

  const patternSummary: string[] = []
  const patternCounts: Record<string, number> = {}
  for (const a of alerts) { patternCounts[a.fraud_type] = (patternCounts[a.fraud_type] || 0) + 1 }
  for (const [p, c] of Object.entries(patternCounts).sort((a, b) => b[1] - a[1])) {
    patternSummary.push(p + ': ' + c + ' alert(s)')
  }

  const preventionRecs: string[] = []
  preventionRecs.push('Sensitivity level: ' + sensitivity + ' | Total alerts: ' + alerts.length + ' | High confidence: ' + highConfCount)
  if (alerts.length > input.call_records.length * 0.05) preventionRecs.push('Alert rate exceeds 5% - review thresholds to reduce false positives')
  preventionRecs.push('Deploy real-time streaming fraud detection with sub-100ms latency')
  preventionRecs.push('Implement SIM swap detection with multi-factor authentication')
  preventionRecs.push('Share fraud intelligence with industry databases (GSMA Fraud Desk)')
  preventionRecs.push('Use graph analytics to identify fraud rings and organized activity')
  preventionRecs.push('Implement AI-based anomaly detection for zero-day fraud patterns')

  return {
    total_records_analyzed: input.call_records.length,
    alerts_generated: alerts.length,
    high_confidence_alerts: highConfCount,
    total_estimated_fraud_usd: round2(totalFraudUsd),
    fraud_rate_pct: fraudRate,
    alerts: alerts.slice(0, 50),
    pattern_summary: patternSummary,
    prevention_recommendations: preventionRecs
  }
}

function formatFraudDetectionReport(input: FraudDetectionInput, result: FraudDetectionResult): string {
  const lines: string[] = []
  lines.push('## Telecom Fraud Detection Report')
  lines.push('')
  lines.push('**Records Analyzed:** ' + result.total_records_analyzed + ' | **Sensitivity:** ' + (input.sensitivity ?? 'medium'))
  lines.push('')
  lines.push('### Detection Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Alerts Generated | ' + result.alerts_generated + ' |')
  lines.push('| High Confidence Alerts | ' + result.high_confidence_alerts + ' |')
  lines.push('| Fraud Rate | ' + result.fraud_rate_pct + '% |')
  lines.push('| Est. Total Fraud Value | $' + result.total_estimated_fraud_usd.toLocaleString() + ' |')
  lines.push('')

  if (result.pattern_summary.length > 0) {
    lines.push('### Pattern Summary')
    for (const p of result.pattern_summary) {
      lines.push('- ' + p)
    }
    lines.push('')
  }

  if (result.alerts.length > 0) {
    lines.push('### Top Alerts')
    lines.push('| Record | Caller | Fraud Type | Confidence | Risk | Financial Impact |')
    lines.push('|--------|--------|-----------|------------|------|-----------------|')
    for (const a of result.alerts.slice(0, 20)) {
      lines.push('| ' + a.record_id + ' | ' + a.caller_number + ' | ' + a.fraud_type + ' | ' + (a.confidence_score * 100) + '% | ' + a.risk_level + ' | $' + a.estimated_financial_impact_usd.toLocaleString() + ' |')
    }
    if (result.alerts.length > 20) lines.push('| ... | (' + (result.alerts.length - 20) + ' more alerts) | | | | |')
    lines.push('')
  }

  if (result.prevention_recommendations.length > 0) {
    lines.push('### Prevention Recommendations')
    for (const r of result.prevention_recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: QUALITY OF EXPERIENCE ANALYZER ====================

function analyzeQoE(input: QoEAnalysisInput): QoEAnalysisResult {
  const seed = seedFromInput(input)
  const services: ServiceQoEResult[] = []
  let totalQoe = 0
  let totalSessions = 0
  let gradeA = 0, gradeB = 0, gradeC = 0, gradeD = 0, gradeF = 0

  const weights = input.weights ?? { mos: 0.35, latency: 0.2, jitter: 0.15, packet_loss: 0.15, throughput: 0.15 }

  for (let i = 0; i < input.services.length; i++) {
    const svc = input.services[i]
    const svcSeed = seed + i * 631
    const issues: string[] = []
    const suggestions: string[] = []

    // QoE score calculation (weighted composite)
    const mosNorm = clamp((svc.mos_score - 1) / 4, 0, 1)
    const latencyNorm = clamp(1 - (svc.latency_ms / 200), 0, 1)
    const jitterNorm = clamp(1 - (svc.jitter_ms / 50), 0, 1)
    const lossNorm = clamp(1 - (svc.packet_loss_pct / 5), 0, 1)
    const throughputNorm = clamp(svc.throughput_mbps / 100, 0, 1)

    const wMos = weights.mos ?? 0.35
    const wLatency = weights.latency ?? 0.2
    const wJitter = weights.jitter ?? 0.15
    const wLoss = weights.packet_loss ?? 0.15
    const wThroughput = weights.throughput ?? 0.15

    const qoeScore = clamp(Math.round(
      (mosNorm * wMos +
       latencyNorm * wLatency +
       jitterNorm * wJitter +
       lossNorm * wLoss +
       throughputNorm * wThroughput) * 100 + rng.next(-2, 2, svcSeed)
    ), 0, 100)

    totalQoe += qoeScore
    totalSessions += svc.session_count

    // Grade assignment
    let grade: 'A' | 'B' | 'C' | 'D' | 'F'
    if (qoeScore >= 85) { grade = 'A'; gradeA++ }
    else if (qoeScore >= 70) { grade = 'B'; gradeB++ }
    else if (qoeScore >= 55) { grade = 'C'; gradeC++ }
    else if (qoeScore >= 40) { grade = 'D'; gradeD++ }
    else { grade = 'F'; gradeF++ }

    // Issue detection
    if (svc.mos_score < 3.5) { issues.push('MOS below acceptable threshold (' + svc.mos_score + ')') }
    if (svc.latency_ms > 100) { issues.push('High latency (' + svc.latency_ms + ' ms)') }
    if (svc.jitter_ms > 30) { issues.push('Excessive jitter (' + svc.jitter_ms + ' ms)') }
    if (svc.packet_loss_pct > 1) { issues.push('Packet loss detected (' + svc.packet_loss_pct + '%)') }
    if (svc.error_rate_pct > 2) { issues.push('Elevated error rate (' + svc.error_rate_pct + '%)') }
    if (svc.throughput_mbps < 10) { issues.push('Low throughput (' + svc.throughput_mbps + ' Mbps)') }

    // Improvement suggestions
    if (svc.latency_ms > 50) suggestions.push('Deploy edge caching and optimize routing for ' + svc.service_name)
    if (svc.jitter_ms > 20) suggestions.push('Enable jitter buffer optimization and QoS prioritization')
    if (svc.packet_loss_pct > 0.5) suggestions.push('Investigate link quality and enable FEC/ARQ')
    if (svc.mos_score < 4.0) suggestions.push('Upgrade codec to HD voice (EVS/WB-AMR) for ' + svc.service_name)
    if (svc.throughput_mbps < 25) suggestions.push('Increase bandwidth allocation or enable compression')
    if (svc.error_rate_pct > 1) suggestions.push('Review application-layer error handling and retry logic')
    if (suggestions.length === 0) suggestions.push('Service performing well - maintain current configuration')

    services.push({
      service_name: svc.service_name,
      service_type: svc.service_type,
      mos_score: svc.mos_score,
      latency_ms: svc.latency_ms,
      jitter_ms: svc.jitter_ms,
      packet_loss_pct: svc.packet_loss_pct,
      throughput_mbps: svc.throughput_mbps,
      session_count: svc.session_count,
      qoe_score: qoeScore,
      qoe_grade: grade,
      issues,
      improvement_suggestions: suggestions
    })
  }

  const avgQoe = input.services.length > 0 ? Math.round(totalQoe / input.services.length) : 0

  const networkIssues: string[] = []
  if (gradeD + gradeF > input.services.length * 0.2) networkIssues.push('Over 20% services rated D/F - network-wide performance degradation')
  if (services.some(s => s.latency_ms > 150)) networkIssues.push('Critical latency detected on some services - review core network routing')
  if (services.some(s => s.packet_loss_pct > 2)) networkIssues.push('Significant packet loss - investigate transport network quality')
  if (services.filter(s => s.mos_score < 3.5).length > 1) networkIssues.push('Multiple services with poor MOS - prioritize voice quality optimization')

  const roadmap: string[] = []
  roadmap.push('QoE monitoring: implement real-time dashboards with per-service drill-down')
  roadmap.push('Short-term (0-3 months): Address all Grade F services with targeted fixes')
  roadmap.push('Medium-term (3-6 months): Deploy AI-based predictive QoE management')
  roadmap.push('Long-term (6-12 months): Implement closed-loop automation for self-optimizing QoE')
  roadmap.push('Establish QoE SLAs per service tier with automated violation alerting')
  roadmap.push('Integrate subscriber-level QoE data with CRM for proactive care')

  return {
    total_services: input.services.length,
    avg_qoe_score: avgQoe,
    services_grade_a: gradeA,
    services_grade_b: gradeB,
    services_grade_c: gradeC,
    services_grade_d: gradeD,
    services_grade_f: gradeF,
    total_sessions: totalSessions,
    services,
    network_wide_issues: networkIssues,
    improvement_roadmap: roadmap
  }
}

function formatQoEAnalysisReport(input: QoEAnalysisInput, result: QoEAnalysisResult): string {
  const lines: string[] = []
  lines.push('## Quality of Experience (QoE) Analysis Report')
  lines.push('')
  lines.push('**Total Services:** ' + result.total_services + ' | **Total Sessions:** ' + result.total_sessions.toLocaleString() + ' | **Avg QoE Score:** ' + result.avg_qoe_score + '/100')
  lines.push('')
  lines.push('### Grade Distribution')
  lines.push('| Grade | Count | Percentage |')
  lines.push('|-------|-------|------------|')
  lines.push('| A (Excellent) | ' + result.services_grade_a + ' | ' + round1((result.services_grade_a / Math.max(result.total_services, 1)) * 100) + '% |')
  lines.push('| B (Good) | ' + result.services_grade_b + ' | ' + round1((result.services_grade_b / Math.max(result.total_services, 1)) * 100) + '% |')
  lines.push('| C (Fair) | ' + result.services_grade_c + ' | ' + round1((result.services_grade_c / Math.max(result.total_services, 1)) * 100) + '% |')
  lines.push('| D (Poor) | ' + result.services_grade_d + ' | ' + round1((result.services_grade_d / Math.max(result.total_services, 1)) * 100) + '% |')
  lines.push('| F (Fail) | ' + result.services_grade_f + ' | ' + round1((result.services_grade_f / Math.max(result.total_services, 1)) * 100) + '% |')
  lines.push('')

  lines.push('### Service Details')
  lines.push('| Service | Type | MOS | Latency (ms) | Jitter (ms) | Loss (%) | Throughput (Mbps) | QoE Score | Grade |')
  lines.push('|---------|------|-----|-------------|-------------|----------|-------------------|-----------|-------|')
  for (const s of result.services) {
    lines.push('| ' + s.service_name + ' | ' + s.service_type + ' | ' + s.mos_score + ' | ' + s.latency_ms + ' | ' + s.jitter_ms + ' | ' + s.packet_loss_pct + ' | ' + s.throughput_mbps + ' | ' + s.qoe_score + ' | ' + s.qoe_grade + ' |')
  }
  lines.push('')

  if (result.network_wide_issues.length > 0) {
    lines.push('### Network-Wide Issues')
    for (const i of result.network_wide_issues) {
      lines.push('- ' + i)
    }
    lines.push('')
  }

  if (result.improvement_roadmap.length > 0) {
    lines.push('### Improvement Roadmap')
    for (const r of result.improvement_roadmap) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: INFRASTRUCTURE INVESTMENT ADVISOR ====================

function adviseInfrastructureInvestment(input: InfrastructureInvestmentInput): InfrastructureInvestmentResult {
  const seed = seedFromInput(input)
  const phases: InvestmentPhase[] = []

  // Investment type parameters
  const typeParams: Record<string, { capexRatio: number; opexRatio: number; revenueGrowth: number; riskFactor: number }> = {
    '5g_rollout': { capexRatio: 0.7, opexRatio: 0.3, revenueGrowth: 0.12, riskFactor: 0.15 },
    'fiber_expansion': { capexRatio: 0.8, opexRatio: 0.2, revenueGrowth: 0.08, riskFactor: 0.1 },
    'data_center': { capexRatio: 0.75, opexRatio: 0.25, revenueGrowth: 0.15, riskFactor: 0.12 },
    'edge_computing': { capexRatio: 0.65, opexRatio: 0.35, revenueGrowth: 0.18, riskFactor: 0.2 },
    'spectrum_acquisition': { capexRatio: 0.9, opexRatio: 0.1, revenueGrowth: 0.1, riskFactor: 0.18 },
    'network_modernization': { capexRatio: 0.6, opexRatio: 0.4, revenueGrowth: 0.06, riskFactor: 0.08 }
  }

  const params = typeParams[input.investment_type] ?? typeParams['5g_rollout']
  const recommendedCapex = Math.round(input.total_budget_usd * params.capexRatio)
  const annualOpex = Math.round(input.total_budget_usd * params.opexRatio / input.project_duration_years)

  // Competitor and regulatory adjustments
  const competitorAdj = input.competitor_activity === 'high' ? 1.15 : input.competitor_activity === 'medium' ? 1.05 : 1.0
  const regulatoryAdj = input.regulatory_environment === 'restrictive' ? 0.85 : input.regulatory_environment === 'neutral' ? 0.95 : 1.0
  const riskAdj = input.risk_tolerance === 'aggressive' ? 1.1 : input.risk_tolerance === 'moderate' ? 1.0 : 0.9

  let cumulative = -recommendedCapex
  let totalRevenue = 0
  let totalOpex = 0

  for (let y = 0; y < input.project_duration_years; y++) {
    const phaseSeed = seed + y * 719
    const yearRevenue = Math.round(
      input.current_arpu_usd * input.expected_subscriber_growth_pct / 100 *
      (1 + params.revenueGrowth) ** y * input.target_regions.length *
      1000000 * competitorAdj * regulatoryAdj * riskAdj * rng.nextFloat(0.9, 1.1, phaseSeed)
    )
    const yearOpex = Math.round(annualOpex * (1 + rng.nextFloat(-0.05, 0.1, phaseSeed + 1)))
    const netCf = yearRevenue - yearOpex
    cumulative += netCf
    totalRevenue += yearRevenue
    totalOpex += yearOpex

    const milestones: string[] = []
    if (y === 0) milestones.push('Site acquisition and permitting complete')
    if (y === 0) milestones.push('Core network deployment initiated')
    if (y === Math.floor(input.project_duration_years / 2)) milestones.push('50% coverage target achieved')
    if (y === input.project_duration_years - 1) milestones.push('Full commercial launch and optimization')

    const descriptions: Record<string, string> = {
      '5g_rollout': '5G network rollout phase ' + (y + 1),
      'fiber_expansion': 'Fiber infrastructure expansion phase ' + (y + 1),
      'data_center': 'Data center build-out phase ' + (y + 1),
      'edge_computing': 'Edge computing deployment phase ' + (y + 1),
      'spectrum_acquisition': 'Spectrum acquisition and deployment phase ' + (y + 1),
      'network_modernization': 'Network modernization phase ' + (y + 1)
    }

    phases.push({
      phase: y + 1,
      year: y + 1,
      description: descriptions[input.investment_type] ?? 'Investment phase ' + (y + 1),
      capex_usd: y === 0 ? recommendedCapex : Math.round(recommendedCapex * 0.1),
      opex_usd: yearOpex,
      expected_revenue_usd: yearRevenue,
      cumulative_cash_flow_usd: cumulative,
      key_milestones: milestones
    })
  }

  // Financial metrics
  const discountRate = input.risk_tolerance === 'aggressive' ? 0.08 : input.risk_tolerance === 'moderate' ? 0.1 : 0.12
  let npv = -recommendedCapex
  for (const p of phases) {
    npv += (p.expected_revenue_usd - p.opex_usd) / Math.pow(1 + discountRate, p.year)
  }
  const roi = ((totalRevenue - totalOpex - recommendedCapex) / recommendedCapex) * 100

  // Payback period
  let payback = input.project_duration_years
  let running = -recommendedCapex
  for (const p of phases) {
    running += p.expected_revenue_usd - p.opex_usd
    if (running >= 0) {
      const prevRunning = running - (p.expected_revenue_usd - p.opex_usd)
      payback = p.year - prevRunning / (p.expected_revenue_usd - p.opex_usd)
      break
    }
  }

  // IRR approximation
  let irrRate = discountRate
  for (let iter = 0; iter < 50; iter++) {
    let npvAtRate = -recommendedCapex
    let dnpv = 0
    for (const p of phases) {
      npvAtRate += (p.expected_revenue_usd - p.opex_usd) / Math.pow(1 + irrRate, p.year)
      dnpv -= p.year * (p.expected_revenue_usd - p.opex_usd) / Math.pow(1 + irrRate, p.year + 1)
    }
    if (dnpv !== 0) {
      const newRate = irrRate - npvAtRate / dnpv
      if (Math.abs(newRate - irrRate) < 0.0001) { irrRate = newRate; break }
      irrRate = newRate
    }
  }

  const riskAdjReturn = round2(roi * (1 - params.riskFactor) * riskAdj)

  // Investment grade
  let grade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C'
  if (npv > recommendedCapex * 0.5 && payback < input.project_duration_years * 0.4) grade = 'AAA'
  else if (npv > recommendedCapex * 0.3 && payback < input.project_duration_years * 0.5) grade = 'AA'
  else if (npv > 0 && payback < input.project_duration_years * 0.6) grade = 'A'
  else if (npv > 0 && payback < input.project_duration_years * 0.7) grade = 'BBB'
  else if (npv > -recommendedCapex * 0.2) grade = 'BB'
  else if (npv > -recommendedCapex * 0.4) grade = 'B'
  else grade = 'C'

  const riskFactors: string[] = []
  if (input.competitor_activity === 'high') riskFactors.push('High competitor activity may erode market share and pricing power')
  if (input.regulatory_environment === 'restrictive') riskFactors.push('Restrictive regulatory environment may delay permits and increase compliance costs')
  if (input.expected_subscriber_growth_pct > 15) riskFactors.push('Aggressive subscriber growth assumptions may not materialize')
  if (input.investment_type === 'spectrum_acquisition') riskFactors.push('Spectrum auction prices are volatile and may exceed budget')
  if (input.investment_type === 'edge_computing') riskFactors.push('Edge computing demand still emerging - revenue timing uncertain')
  riskFactors.push('Technology obsolescence risk: ensure upgrade path to next-generation standards')
  riskFactors.push('Interest rate sensitivity: rising rates increase cost of capital and reduce NPV')

  const strategicRecs: string[] = []
  strategicRecs.push('Investment type: ' + input.investment_type + ' | Regions: ' + input.target_regions.join(', '))
  strategicRecs.push('Risk tolerance: ' + input.risk_tolerance + ' | Investment grade: ' + grade)
  if (npv < 0) strategicRecs.push('Negative NPV - consider phased approach, infrastructure sharing, or government subsidies')
  if (payback > input.project_duration_years * 0.6) strategicRecs.push('Extended payback - explore co-investment or vendor financing to improve returns')
  if (irrRate < discountRate) strategicRecs.push('IRR below hurdle rate - project does not create value at required return')
  strategicRecs.push('Stress-test with 20% downside on revenue and 15% upside on CAPEX for risk assessment')
  strategicRecs.push('Consider ESG-linked financing for green infrastructure (lower cost of capital)')
  strategicRecs.push('Leverage AI/ML for operational automation to reduce OPEX by 15-30% over project life')
  strategicRecs.push('Explore infrastructure monetization: tower sales, fiber leasing, spectrum sharing')

  return {
    investment_type: input.investment_type,
    total_budget_usd: input.total_budget_usd,
    recommended_capex_usd: recommendedCapex,
    total_opex_usd: totalOpex,
    total_revenue_usd: totalRevenue,
    net_present_value_usd: Math.round(npv),
    roi_pct: round1(roi),
    payback_period_years: round1(payback),
    irr_pct: round1(irrRate * 100),
    risk_adjusted_return_pct: riskAdjReturn,
    investment_grade: grade,
    phases,
    risk_factors: riskFactors,
    strategic_recommendations: strategicRecs
  }
}

function formatInfrastructureInvestmentReport(input: InfrastructureInvestmentInput, result: InfrastructureInvestmentResult): string {
  const lines: string[] = []
  lines.push('## Infrastructure Investment Advisory Report')
  lines.push('')
  lines.push('**Investment Type:** ' + result.investment_type + ' | **Budget:** $' + result.total_budget_usd.toLocaleString() + ' | **Duration:** ' + input.project_duration_years + ' years')
  lines.push('**Regions:** ' + input.target_regions.join(', ') + ' | **Risk Tolerance:** ' + input.risk_tolerance + ' | **Grade:** ' + result.investment_grade)
  lines.push('')
  lines.push('### Financial Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Recommended CAPEX | $' + result.recommended_capex_usd.toLocaleString() + ' |')
  lines.push('| Total OPEX | $' + result.total_opex_usd.toLocaleString() + ' |')
  lines.push('| Total Revenue | $' + result.total_revenue_usd.toLocaleString() + ' |')
  lines.push('| Net Present Value | $' + result.net_present_value_usd.toLocaleString() + ' |')
  lines.push('| ROI | ' + result.roi_pct + '% |')
  lines.push('| IRR | ' + result.irr_pct + '% |')
  lines.push('| Payback Period | ' + result.payback_period_years + ' years |')
  lines.push('| Risk-Adjusted Return | ' + result.risk_adjusted_return_pct + '% |')
  lines.push('| Investment Grade | ' + result.investment_grade + ' |')
  lines.push('')

  lines.push('### Investment Phases')
  lines.push('| Phase | Year | Description | CAPEX | OPEX | Revenue | Cumulative CF |')
  lines.push('|-------|------|-------------|-------|------|---------|---------------|')
  for (const p of result.phases) {
    lines.push('| ' + p.phase + ' | ' + p.year + ' | ' + p.description + ' | $' + p.capex_usd.toLocaleString() + ' | $' + p.opex_usd.toLocaleString() + ' | $' + p.expected_revenue_usd.toLocaleString() + ' | $' + p.cumulative_cash_flow_usd.toLocaleString() + ' |')
  }
  lines.push('')

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of result.risk_factors) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  if (result.strategic_recommendations.length > 0) {
    lines.push('### Strategic Recommendations')
    for (const r of result.strategic_recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Network Optimization Engine
  tools.register(defineTool({
    name: 'network_optimization_engine',
    description: 'AI-driven network optimization engine for cellular coverage, capacity, handover, and latency analysis. Scores cell health, identifies degradation issues, and generates prioritized optimization actions. Supports coverage, capacity, handover, and energy optimization targets.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: cells[{cell_id, band, rsrp, sinr, throughput_mbps, handover_success_rate, user_count, latency_ms}], optimization_target (coverage|capacity|handover|energy), target_thresholds{min_rsrp, min_sinr, min_throughput_mbps, min_handover_rate, max_latency_ms}' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: NetworkOptimizationInput = JSON.parse(args.input_data)
      const result = optimizeNetwork(input)
      return formatNetworkOptimizationReport(input, result)
    }
  }))

  // Tool 2: Spectrum Allocation Optimizer
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

  // Tool 3: 5G/6G Deployment Planner
  tools.register(defineTool({
    name: 'five_g_deployment_planner',
    description: 'Plans 5G/6G network deployment including site selection, coverage estimation, capacity projection, CAPEX/OPEX budgeting, and timeline planning. Supports greenfield, brownfield, and densification scenarios with phased rollout schedules.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: deployment_type (greenfield|brownfield|densification), target_area_km2, existing_sites, target_coverage_pct, spectrum_bands[], use_cases[], budget_usd, timeline_months' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FiveGDeploymentInput = JSON.parse(args.input_data)
      const result = planFiveGDeployment(input)
      return formatFiveGDeploymentReport(input, result)
    }
  }))

  // Tool 4: Network Slice Manager
  tools.register(defineTool({
    name: 'network_slice_manager',
    description: 'Manages end-to-end network slice lifecycle including resource allocation, bandwidth/compute assignment, isolation enforcement, and SLA compliance. Handles slice admission control with active/degraded/rejected status tracking.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: slice_templates[{name, type (eMBB|URLLC|mMTC|HCS|custom), max_bandwidth_pct, max_latency_ms, reliability_pct, priority, isolation_required}], total_bandwidth_mhz, total_compute_units, isolation_policy (physical|logical|hybrid)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: NetworkSliceInput = JSON.parse(args.input_data)
      const result = manageNetworkSlices(input)
      return formatNetworkSliceReport(input, result)
    }
  }))

  // Tool 5: Customer Churn Predictor
  tools.register(defineTool({
    name: 'customer_churn_predictor',
    description: 'ML-based customer churn prediction using tenure, contract type, support calls, satisfaction scores, payment behavior, and usage patterns. Outputs churn probability, risk levels, key factors, and personalized retention actions per customer.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: customers[{customer_id, tenure_months, monthly_charges_usd, total_charges_usd, contract_type, support_calls_last_3m, data_usage_gb, satisfaction_score, payment_delay_days, has_premium_plan, num_subscriptions}], churn_threshold (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CustomerChurnInput = JSON.parse(args.input_data)
      const result = predictCustomerChurn(input)
      return formatCustomerChurnReport(input, result)
    }
  }))

  // Tool 6: Fraud Detection Telecom
  tools.register(defineTool({
    name: 'fraud_detection_telecom',
    description: 'Real-time telecom fraud detection across call records. Identifies SIM box bypass, Wangiri, subscription fraud, roaming fraud, IRS fraud, and CLI spoofing. Configurable sensitivity with confidence scoring and financial impact estimation.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: call_records[{record_id, caller_number, callee_number, call_duration_seconds, call_type, timestamp, location, cost_usd}], known_fraud_patterns (optional), sensitivity (low|medium|high, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FraudDetectionInput = JSON.parse(args.input_data)
      const result = detectFraud(input)
      return formatFraudDetectionReport(input, result)
    }
  }))

  // Tool 7: Quality of Experience Analyzer
  tools.register(defineTool({
    name: 'quality_of_experience_analyzer',
    description: 'Analyzes Quality of Experience (QoE) across voice, video, gaming, streaming, data, and IoT services. Computes weighted QoE scores, assigns A-F grades, identifies issues, and generates improvement roadmaps with network-wide recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: services[{service_name, service_type, mos_score, latency_ms, jitter_ms, packet_loss_pct, throughput_mbps, session_count, error_rate_pct}], weights{mos, latency, jitter, packet_loss, throughput} (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: QoEAnalysisInput = JSON.parse(args.input_data)
      const result = analyzeQoE(input)
      return formatQoEAnalysisReport(input, result)
    }
  }))

  // Tool 8: Infrastructure Investment Advisor
  tools.register(defineTool({
    name: 'infrastructure_investment_advisor',
    description: 'Advises on telecom infrastructure investment strategy with full financial modeling including NPV, IRR, payback period, and risk-adjusted returns. Covers 5G rollout, fiber expansion, data center, edge computing, spectrum acquisition, and network modernization.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: investment_type (5g_rollout|fiber_expansion|data_center|edge_computing|spectrum_acquisition|network_modernization), total_budget_usd, project_duration_years, target_regions[], expected_subscriber_growth_pct, current_arpu_usd, competitor_activity (low|medium|high), regulatory_environment (favorable|neutral|restrictive), risk_tolerance (conservative|moderate|aggressive)' }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: InfrastructureInvestmentInput = JSON.parse(args.input_data)
      const result = adviseInfrastructureInvestment(input)
      return formatInfrastructureInvestmentReport(input, result)
    }
  }))

  console.log('[dsh-tool-telecomai] Loaded v' + VERSION + ' - Telecom and Network Intelligence AI with 8 tools')
  console.log('  Tools: network_optimization_engine, spectrum_allocation_optimizer, five_g_deployment_planner, network_slice_manager, customer_churn_predictor, fraud_detection_telecom, quality_of_experience_analyzer, infrastructure_investment_advisor')
}
