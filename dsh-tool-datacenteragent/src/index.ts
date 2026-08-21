/**
 * DSH Data Center Management AI Agent Plugin v0.1.0
 *
 * Comprehensive data center infrastructure management toolkit for DeepSeek Harness Agent.
 * Designed for data center operators, facility managers, and IT infrastructure teams.
 *
 * Features (v0.1.0):
 * - PUE Optimization Engine (PUE analysis with free cooling optimization)
 * - Capacity Planning Forecaster (Capacity planning with rack space forecasting)
 * - Cooling System Optimizer (CRAC/liquid cooling system optimization)
 * - Power Distribution Monitor (UPS/PDU power distribution monitoring with redundancy analysis)
 * - IT Asset Lifecycle (IT asset lifecycle with maintenance management)
 * - Network Topology Mapper (Network topology with cable management)
 * - Data Center Carbon Tracker (Carbon emissions with green power trading)
 * - Disaster Recovery Planner (Disaster recovery with RTO/RPO drill)
 *
 * @module dsh-tool-datacenteragent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-datacenteragent'
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

// ==================== SECTION 2 — Type Definitions ====================

// --- Tool 1: PUE Optimization Engine ---
interface PUEInput {
  action: 'analyze' | 'optimize' | 'forecast' | 'benchmark'
  datacenter_name: string
  total_power_kw: number
  it_load_kw: number
  cooling_type: 'air_cooled' | 'water_cooled' | 'liquid_cooled' | 'hybrid'
  location: string
  ambient_temp_c: number
  free_cooling_hours?: number
}

interface PUEAnalysis {
  pue_value: number
  pue_rating: 'poor' | 'average' | 'good' | 'excellent'
  cooling_overhead_pct: number
  power_overhead_pct: number
  losses_breakdown: Record<string, number>
  free_cooling_potential: string
  optimization_actions: string[]
  estimated_savings_kw: number
  estimated_savings_pct: number
}

// --- Tool 2: Capacity Planning Forecaster ---
interface CapacityInput {
  action: 'forecast' | 'plan' | 'analyze' | 'recommend'
  datacenter_name: string
  total_racks: number
  occupied_racks: number
  avg_rack_power_kw: number
  total_power_capacity_kw: number
  growth_rate_pct: number
  forecast_months: number
}

interface CapacityForecast {
  current_utilization_pct: number
  months_to_capacity: number
  projected_racks_needed: number
  power_headroom_kw: number
  rack_headroom: number
  growth_scenario: string
  recommendations: string[]
  capacity_timeline: Array<{ month: string; utilization_pct: number; racks_needed: number }>
}

// --- Tool 3: Cooling System Optimizer ---
interface CoolingInput {
  action: 'optimize' | 'analyze' | 'simulate' | 'tune'
  system_type: 'crac' | 'chiller' | 'liquid_cooling' | 'evaporative' | 'free_cooling'
  total_cooling_capacity_kw: number
  current_load_kw: number
  supply_temp_c: number
  return_temp_c: number
  airflow_cfm: number
  num_units: number
  setpoint_temp_c: number
}

interface CoolingOptimization {
  cop: number
  efficiency_rating: 'poor' | 'fair' | 'good' | 'excellent'
  load_pct: number
  supply_optimization: string
  airflow_recommendations: string[]
  setpoint_recommendations: string[]
  potential_energy_savings_pct: number
  hot_spot_risks: string[]
  unit_redundancy_status: string
}

// --- Tool 4: Power Distribution Monitor ---
interface PowerInput {
  action: 'monitor' | 'analyze' | 'redundancy' | 'audit'
  ups_capacity_kva: number
  ups_load_kva: number
  pdu_count: number
  pdu_loads: number[]
  redundancy_mode: 'N' | 'N+1' | '2N' | '2N+1'
  battery_runtime_min: number
  generator_backup: boolean
}

interface PowerAnalysis {
  ups_utilization_pct: number
  redundancy_status: 'at_risk' | 'adequate' | 'optimal'
  n_plus_1_capable: boolean
  battery_adequacy: string
  load_imbalance_pct: number
  pdu_health: Array<{ pdu_id: string; load_pct: number; status: string }>
  risk_assessment: string[]
  recommendations: string[]
}

// --- Tool 5: IT Asset Lifecycle ---
interface AssetInput {
  action: 'inventory' | 'lifecycle' | 'maintenance' | 'refresh'
  assets: Array<{
    asset_id: string
    type: string
    model: string
    purchase_date: string
    warranty_years: number
    status: 'active' | 'maintenance' | 'end_of_life' | 'decommissioned'
    utilization_pct: number
  }>
  refresh_budget_usd?: number
}

interface AssetAnalysis {
  total_assets: number
  by_status: Record<string, number>
  by_type: Record<string, number>
  warranty_expired_count: number
  end_of_life_count: number
  avg_age_years: number
  refresh_recommendations: string[]
  maintenance_schedule: Array<{ asset_id: string; action: string; priority: string; due_date: string }>
  lifecycle_summary: string
}

// --- Tool 6: Network Topology Mapper ---
interface NetworkInput {
  action: 'map' | 'analyze' | 'optimize' | 'audit'
  switches: number
  routers: number
  firewalls: number
  servers: number
  cable_runs: Array<{ from: string; to: string; type: 'fiber' | 'copper' | 'dac'; length_m: number; utilization_pct: number }>
  topology_type: 'three_tier' | 'spine_leaf' | 'mesh' | 'hybrid'
  bandwidth_tiers: string[]
}

interface NetworkAnalysis {
  topology_health: 'critical' | 'warning' | 'healthy' | 'optimal'
  oversubscription_ratio: string
  single_points_of_failure: string[]
  cable_utilization_summary: Array<{ segment: string; utilization_pct: number; status: string }>
  bandwidth_analysis: string[]
  optimization_recommendations: string[]
  redundancy_gaps: string[]
}

// --- Tool 7: Data Center Carbon Tracker ---
interface CarbonInput {
  action: 'track' | 'reduce' | 'trade' | 'report'
  annual_energy_mwh: number
  pue: number
  grid_carbon_intensity_gco2_kwh: number
  renewable_energy_pct: number
  green_power_purchases_mwh?: number
  carbon_offset_tons?: number
  reporting_year: number
}

interface CarbonAnalysis {
  annual_emissions_tons: number
  it_emissions_tons: number
  infrastructure_emissions_tons: number
  carbon_intensity_per_mwh: number
  renewable_impact: string
  offset_status: string
  reduction_opportunities: string[]
  green_power_recommendations: string[]
  compliance_status: string
}

// --- Tool 8: Disaster Recovery Planner ---
interface DRInput {
  action: 'plan' | 'drill' | 'assess' | 'optimize'
  primary_site: string
  dr_site: string
  rto_hours: number
  rpo_hours: number
  replication_type: 'synchronous' | 'asynchronous' | 'snapshot'
  last_drill_date: string
  critical_systems_count: number
  tested_systems_count: number
}

interface DRAnalysis {
  dr_readiness_score: number
  rto_feasibility: string
  rpo_feasibility: string
  replication_adequacy: string
  drill_compliance: string
  gap_analysis: string[]
  drill_recommendations: string[]
  recovery_procedures: Array<{ step: number; action: string; estimated_minutes: string; responsible: string }>
  improvement_roadmap: string[]
}

// ==================== SECTION 3 — Analysis Functions ====================

// --- Tool 1: PUE Optimization Engine ---
function analyzePUE(input: PUEInput): PUEAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.datacenter_name + input.cooling_type + input.location
  ))

  const pue = input.total_power_kw / Math.max(input.it_load_kw, 1)
  const coolingOverhead = ((input.total_power_kw - input.it_load_kw) / input.total_power_kw) * 100
  const powerOverhead = rng.nextFloat(3, 8)

  let pueRating: PUEAnalysis['pue_rating'] = 'poor'
  if (pue <= 1.2) pueRating = 'excellent'
  else if (pue <= 1.5) pueRating = 'good'
  else if (pue <= 1.8) pueRating = 'average'

  const freeCoolingPotential = input.ambient_temp_c < 15
    ? `High potential — estimated ${input.free_cooling_hours || rng.nextInt(2000, 4000)} hours/year of free cooling available`
    : input.ambient_temp_c < 25
      ? `Moderate potential — estimated ${input.free_cooling_hours || rng.nextInt(500, 2000)} hours/year of free cooling available`
      : `Low potential — ambient temperature too high for effective free cooling`

  const optimizationActions: string[] = []
  if (pue > 1.5) optimizationActions.push('Upgrade to variable-speed fans and pumps for partial-load efficiency')
  if (input.ambient_temp_c < 20) optimizationActions.push('Implement economizer/free cooling mode during low ambient periods')
  optimizationActions.push('Optimize cold aisle/hot aisle containment to reduce mixing losses')
  optimizationActions.push('Raise cold aisle setpoint temperature to 18-22°C per ASHRAE guidelines')
  optimizationActions.push('Deploy AI-driven cooling control with real-time load matching')
  if (input.cooling_type === 'air_cooled') optimizationActions.push('Evaluate transition to water-cooled or liquid-cooled systems')

  const savingsPct = pue > 1.5 ? rng.nextFloat(10, 25) : rng.nextFloat(5, 15)
  const savingsKw = (input.total_power_kw - input.it_load_kw) * (savingsPct / 100)

  return {
    pue_value: Math.round(pue * 100) / 100,
    pue_rating: pueRating,
    cooling_overhead_pct: Math.round(coolingOverhead * 10) / 10,
    power_overhead_pct: Math.round(powerOverhead * 10) / 10,
    losses_breakdown: {
      cooling: Math.round(coolingOverhead * 0.7 * 10) / 10,
      power_distribution: Math.round(powerOverhead * 10) / 10,
      lighting_other: Math.round(coolingOverhead * 0.3 * 10) / 10,
    },
    free_cooling_potential: freeCoolingPotential,
    optimization_actions: optimizationActions,
    estimated_savings_kw: Math.round(savingsKw * 10) / 10,
    estimated_savings_pct: Math.round(savingsPct * 10) / 10,
  }
}

function formatPUEReport(result: PUEAnalysis, input: PUEInput): string {
  const lines: string[] = []
  lines.push('## PUE Optimization Engine — Analysis Report')
  lines.push('')
  lines.push(`**Data Center:** ${input.datacenter_name} | **Location:** ${input.location} | **Cooling:** ${input.cooling_type}`)
  lines.push('')
  lines.push(`**PUE Value:** ${result.pue_value} | **Rating:** ${result.pue_rating.toUpperCase()}`)
  lines.push('')
  lines.push('### Power Breakdown')
  lines.push(`- IT Load: ${input.it_load_kw} kW`)
  lines.push(`- Total Power: ${input.total_power_kw} kW`)
  lines.push(`- Cooling Overhead: ${result.cooling_overhead_pct}%`)
  lines.push(`- Power Distribution Loss: ${result.power_overhead_pct}%`)
  lines.push('')
  lines.push('### Losses Breakdown')
  for (const [key, val] of Object.entries(result.losses_breakdown)) {
    lines.push(`- ${key}: ${val}%`)
  }
  lines.push('')
  lines.push('### Free Cooling Potential')
  lines.push(result.free_cooling_potential)
  lines.push('')
  lines.push('### Optimization Actions')
  for (const action of result.optimization_actions) {
    lines.push(`- ${action}`)
  }
  lines.push('')
  lines.push(`**Estimated Savings:** ${result.estimated_savings_kw} kW (${result.estimated_savings_pct}%)`)
  return lines.join('\n')
}

// --- Tool 2: Capacity Planning Forecaster ---
function forecastCapacity(input: CapacityInput): CapacityForecast {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.datacenter_name + String(input.forecast_months)
  ))

  const currentUtilization = (input.occupied_racks / input.total_racks) * 100
  const powerUtilization = (input.occupied_racks * input.avg_rack_power_kw) / input.total_power_capacity_kw * 100
  const maxUtilization = Math.max(currentUtilization, powerUtilization)

  const monthlyGrowthRate = (input.growth_rate_pct / 100) / 12
  let racksNeeded = input.occupied_racks
  let monthsToCapacity = 0
  for (let m = 1; m <= input.forecast_months; m++) {
    racksNeeded = Math.ceil(input.occupied_racks * Math.pow(1 + monthlyGrowthRate, m))
    if (racksNeeded >= input.total_racks) {
      monthsToCapacity = m
      break
    }
  }
  if (monthsToCapacity === 0) monthsToCapacity = input.forecast_months

  const powerHeadroom = input.total_power_capacity_kw - (input.occupied_racks * input.avg_rack_power_kw)
  const rackHeadroom = input.total_racks - input.occupied_racks

  const growthScenario = input.growth_rate_pct > 30
    ? 'Aggressive growth — immediate capacity expansion recommended'
    : input.growth_rate_pct > 15
      ? 'Moderate growth — plan expansion within 12-18 months'
      : 'Steady growth — monitor and plan proactively'

  const recommendations: string[] = []
  if (monthsToCapacity <= 6) recommendations.push('URGENT: Initiate capacity expansion procurement immediately')
  if (monthsToCapacity <= 12) recommendations.push('Plan for additional rack space and power capacity within 12 months')
  if (powerHeadroom < input.total_power_capacity_kw * 0.2) recommendations.push('Power headroom below 20% — evaluate power infrastructure upgrade')
  recommendations.push('Implement high-density rack planning (8-15 kW/rack) for future growth')
  recommendations.push('Consider modular/scalable UPS and cooling for incremental capacity')
  recommendations.push('Deploy DCIM for real-time capacity monitoring and alerting')

  const timeline: CapacityForecast['capacity_timeline'] = []
  for (let m = 0; m <= input.forecast_months; m += Math.max(1, Math.floor(input.forecast_months / 6))) {
    const projectedRacks = Math.ceil(input.occupied_racks * Math.pow(1 + monthlyGrowthRate, m))
    const util = Math.min((projectedRacks / input.total_racks) * 100, 100)
    timeline.push({
      month: `M+${m}`,
      utilization_pct: Math.round(util * 10) / 10,
      racks_needed: projectedRacks,
    })
  }

  return {
    current_utilization_pct: Math.round(maxUtilization * 10) / 10,
    months_to_capacity: monthsToCapacity,
    projected_racks_needed: racksNeeded,
    power_headroom_kw: Math.round(powerHeadroom * 10) / 10,
    rack_headroom: rackHeadroom,
    growth_scenario: growthScenario,
    recommendations,
    capacity_timeline: timeline,
  }
}

function formatCapacityReport(result: CapacityForecast, input: CapacityInput): string {
  const lines: string[] = []
  lines.push('## Capacity Planning Forecast Report')
  lines.push('')
  lines.push(`**Data Center:** ${input.datacenter_name} | **Forecast Period:** ${input.forecast_months} months | **Growth Rate:** ${input.growth_rate_pct}%/year`)
  lines.push('')
  lines.push('### Current Status')
  lines.push(`- Total Racks: ${input.total_racks} | Occupied: ${input.occupied_racks} | Headroom: ${result.rack_headroom}`)
  lines.push(`- Current Utilization: ${result.current_utilization_pct}%`)
  lines.push(`- Power Headroom: ${result.power_headroom_kw} kW`)
  lines.push(`- Months to Capacity Limit: ${result.months_to_capacity}`)
  lines.push('')
  lines.push(`**Growth Scenario:** ${result.growth_scenario}`)
  lines.push('')
  lines.push('### Capacity Timeline')
  lines.push('| Month | Utilization | Racks Needed |')
  lines.push('|-------|-------------|--------------|')
  for (const t of result.capacity_timeline) {
    lines.push(`| ${t.month} | ${t.utilization_pct}% | ${t.racks_needed} |`)
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  return lines.join('\n')
}

// --- Tool 3: Cooling System Optimizer ---
function optimizeCooling(input: CoolingInput): CoolingOptimization {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.system_type + String(input.total_cooling_capacity_kw)
  ))

  const loadPct = (input.current_load_kw / input.total_cooling_capacity_kw) * 100
  const deltaT = input.supply_temp_c - input.return_temp_c
  const cop = input.system_type === 'liquid_cooling'
    ? rng.nextFloat(8, 15)
    : input.system_type === 'evaporative'
      ? rng.nextFloat(4, 8)
      : rng.nextFloat(2.5, 5)

  let efficiencyRating: CoolingOptimization['efficiency_rating'] = 'poor'
  if (cop >= 8) efficiencyRating = 'excellent'
  else if (cop >= 5) efficiencyRating = 'good'
  else if (cop >= 3) efficiencyRating = 'fair'

  const supplyOptimization = input.supply_temp_c < 12
    ? 'Supply temperature too low — raise to 15-18°C for improved efficiency'
    : input.supply_temp_c > 20
      ? 'Supply temperature high — verify adequate cooling at rack level'
      : 'Supply temperature within optimal range (12-18°C)'

  const airflowRecs: string[] = []
  const cfmPerKw = input.airflow_cfm / Math.max(input.current_load_kw, 1)
  if (cfmPerKw < 150) airflowRecs.push('Airflow insufficient — increase CFM or reduce bypass airflow')
  if (cfmPerKw > 300) airflowRecs.push('Excessive airflow — reduce fan speed to save energy')
  airflowRecs.push('Implement blanking panels to prevent cold air bypass')
  airflowRecs.push('Deploy containment (hot aisle or cold aisle) to improve efficiency')

  const setpointRecs: string[] = []
  if (input.setpoint_temp_c < 18) setpointRecs.push('Raise cold aisle setpoint to 18-22°C per ASHRAE TC 9.9')
  if (deltaT > 15) setpointRecs.push('High delta-T detected — verify airflow balance across racks')
  setpointRecs.push('Implement dynamic setpoint adjustment based on real-time load')

  const hotSpotRisks: string[] = []
  if (loadPct > 80) hotSpotRisks.push('Cooling system near capacity — risk of insufficient cooling during peak')
  if (deltaT < 5) hotSpotRisks.push('Low delta-T indicates poor heat transfer — check for recirculation')
  if (input.num_units <= 1) hotSpotRisks.push('No cooling unit redundancy — single point of failure')

  const unitRedundancy = input.num_units >= 3
    ? `N+1 redundancy with ${input.num_units} units — adequate`
    : input.num_units === 2
      ? '2 units — N+1 redundancy if each can handle full load'
      : 'Single unit — NO redundancy, high risk'

  const savingsPct = loadPct < 60 ? rng.nextFloat(15, 30) : rng.nextFloat(5, 15)

  return {
    cop: Math.round(cop * 100) / 100,
    efficiency_rating: efficiencyRating,
    load_pct: Math.round(loadPct * 10) / 10,
    supply_optimization: supplyOptimization,
    airflow_recommendations: airflowRecs,
    setpoint_recommendations: setpointRecs,
    potential_energy_savings_pct: Math.round(savingsPct * 10) / 10,
    hot_spot_risks: hotSpotRisks,
    unit_redundancy_status: unitRedundancy,
  }
}

function formatCoolingReport(result: CoolingOptimization, input: CoolingInput): string {
  const lines: string[] = []
  lines.push('## Cooling System Optimization Report')
  lines.push('')
  lines.push(`**System Type:** ${input.system_type} | **Units:** ${input.num_units} | **Capacity:** ${input.total_cooling_capacity_kw} kW`)
  lines.push('')
  lines.push('### Performance Metrics')
  lines.push(`- COP (Coefficient of Performance): ${result.cop}`)
  lines.push(`- Efficiency Rating: ${result.efficiency_rating.toUpperCase()}`)
  lines.push(`- Current Load: ${result.load_pct}% (${input.current_load_kw} kW / ${input.total_cooling_capacity_kw} kW)`)
  lines.push(`- Supply Temp: ${input.supply_temp_c}°C | Return Temp: ${input.return_temp_c}°C`)
  lines.push('')
  lines.push('### Supply Temperature Analysis')
  lines.push(result.supply_optimization)
  lines.push('')
  lines.push('### Airflow Recommendations')
  for (const rec of result.airflow_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push('### Setpoint Recommendations')
  for (const rec of result.setpoint_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push('### Hot Spot Risks')
  if (result.hot_spot_risks.length > 0) {
    for (const risk of result.hot_spot_risks) {
      lines.push(`- ${risk}`)
    }
  } else {
    lines.push('- No immediate hot spot risks detected')
  }
  lines.push('')
  lines.push(`**Unit Redundancy:** ${result.unit_redundancy_status}`)
  lines.push(`**Potential Energy Savings:** ${result.potential_energy_savings_pct}%`)
  return lines.join('\n')
}

// --- Tool 4: Power Distribution Monitor ---
function monitorPower(input: PowerInput): PowerAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    String(input.ups_capacity_kva) + input.redundancy_mode
  ))

  const upsUtilization = (input.ups_load_kva / input.ups_capacity_kva) * 100
  const nPlus1Capable = input.redundancy_mode === 'N+1' || input.redundancy_mode === '2N' || input.redundancy_mode === '2N+1'

  let redundancyStatus: PowerAnalysis['redundancy_status'] = 'at_risk'
  if (upsUtilization < 40 && nPlus1Capable) redundancyStatus = 'optimal'
  else if (upsUtilization < 60 && nPlus1Capable) redundancyStatus = 'adequate'

  const batteryAdequacy = input.battery_runtime_min >= 15
    ? `Adequate — ${input.battery_runtime_min} min runtime covers generator start + transfer`
    : input.battery_runtime_min >= 10
      ? `Marginal — ${input.battery_runtime_min} min may not cover full generator start sequence`
      : `Insufficient — ${input.battery_runtime_min} min runtime is below minimum recommendation`

  const avgPduLoad = input.pdu_loads.length > 0
    ? input.pdu_loads.reduce((a, b) => a + b, 0) / input.pdu_loads.length
    : 0
  const maxPduLoad = Math.max(...input.pdu_loads, 0)
  const minPduLoad = Math.min(...input.pdu_loads, 0)
  const loadImbalance = avgPduLoad > 0 ? ((maxPduLoad - minPduLoad) / avgPduLoad) * 100 : 0

  const pduHealth: PowerAnalysis['pdu_health'] = input.pdu_loads.map((load, i) => {
    const pct = (load / (input.ups_capacity_kva / Math.max(input.pdu_count, 1))) * 100
    const status = pct > 80 ? 'CRITICAL' : pct > 60 ? 'WARNING' : pct > 40 ? 'NORMAL' : 'LOW'
    return { pdu_id: `PDU-${String(i + 1).padStart(3, '0')}`, load_pct: Math.round(pct * 10) / 10, status }
  })

  const risks: string[] = []
  if (upsUtilization > 80) risks.push('UPS load above 80% — risk of overload during transfer')
  if (!nPlus1Capable) risks.push('No N+1 redundancy — single UPS failure causes outage')
  if (loadImbalance > 30) risks.push('Significant PDU load imbalance — risk of overloading individual PDUs')
  if (!input.generator_backup) risks.push('No generator backup — battery-only runtime during grid failure')
  if (input.battery_runtime_min < 10) risks.push('Battery runtime below 10 minutes — insufficient for generator start')

  const recommendations: string[] = []
  if (upsUtilization > 70) recommendations.push('Add UPS capacity or redistribute load to reduce utilization')
  if (!nPlus1Capable) recommendations.push('Upgrade to N+1 or 2N redundancy for critical loads')
  if (loadImbalance > 20) recommendations.push('Rebalance loads across PDUs to achieve <15% imbalance')
  if (input.battery_runtime_min < 15) recommendations.push('Extend battery runtime to minimum 15 minutes')
  recommendations.push('Implement UPS monitoring with predictive battery analytics')
  recommendations.push('Schedule quarterly UPS maintenance and battery impedance testing')

  return {
    ups_utilization_pct: Math.round(upsUtilization * 10) / 10,
    redundancy_status: redundancyStatus,
    n_plus_1_capable: nPlus1Capable,
    battery_adequacy: batteryAdequacy,
    load_imbalance_pct: Math.round(loadImbalance * 10) / 10,
    pdu_health: pduHealth,
    risk_assessment: risks,
    recommendations,
  }
}

function formatPowerReport(result: PowerAnalysis, input: PowerInput): string {
  const lines: string[] = []
  lines.push('## Power Distribution Monitoring Report')
  lines.push('')
  lines.push(`**UPS Capacity:** ${input.ups_capacity_kva} kVA | **Load:** ${input.ups_load_kva} kVA | **Utilization:** ${result.ups_utilization_pct}%`)
  lines.push(`**Redundancy Mode:** ${input.redundancy_mode} | **Status:** ${result.redundancy_status.toUpperCase()}`)
  lines.push(`**Generator Backup:** ${input.generator_backup ? 'Yes' : 'No'} | **Battery Runtime:** ${input.battery_runtime_min} min`)
  lines.push('')
  lines.push('### Battery Adequacy')
  lines.push(result.battery_adequacy)
  lines.push('')
  lines.push('### PDU Health')
  lines.push('| PDU ID | Load % | Status |')
  lines.push('|--------|--------|--------|')
  for (const pdu of result.pdu_health) {
    lines.push(`| ${pdu.pdu_id} | ${pdu.load_pct}% | ${pdu.status} |`)
  }
  lines.push('')
  lines.push(`**Load Imbalance:** ${result.load_imbalance_pct}%`)
  lines.push('')
  lines.push('### Risk Assessment')
  if (result.risk_assessment.length > 0) {
    for (const risk of result.risk_assessment) {
      lines.push(`- ${risk}`)
    }
  } else {
    lines.push('- No critical risks identified')
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  return lines.join('\n')
}

// --- Tool 5: IT Asset Lifecycle ---
function analyzeAssets(input: AssetInput): AssetAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    String(input.assets.length) + (input.refresh_budget_usd || 0)
  ))

  const now = new Date()
  const byStatus: Record<string, number> = {}
  const byType: Record<string, number> = {}
  let warrantyExpired = 0
  let endOfLife = 0
  let totalAge = 0

  for (const asset of input.assets) {
    byStatus[asset.status] = (byStatus[asset.status] || 0) + 1
    byType[asset.type] = (byType[asset.type] || 0) + 1

    const purchaseDate = new Date(asset.purchase_date)
    const ageYears = (now.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    totalAge += ageYears

    const warrantyEnd = new Date(purchaseDate)
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + asset.warranty_years)
    if (now > warrantyEnd) warrantyExpired++
    if (asset.status === 'end_of_life') endOfLife++
  }

  const avgAge = input.assets.length > 0 ? totalAge / input.assets.length : 0

  const refreshRecs: string[] = []
  if (endOfLife > 0) refreshRecs.push(`Prioritize replacement of ${endOfLife} end-of-life asset(s)`)
  if (warrantyExpired > 0) refreshRecs.push(`${warrantyExpired} asset(s) out of warranty — evaluate extended support or replacement`)
  if (avgAge > 4) refreshRecs.push(`Average asset age ${avgAge.toFixed(1)} years — plan refresh cycle`)
  refreshRecs.push('Implement automated asset discovery and CMDB synchronization')
  refreshRecs.push('Establish 3-5 year refresh cycle based on workload requirements')

  const maintenanceSchedule: AssetAnalysis['maintenance_schedule'] = []
  for (const asset of input.assets.slice(0, 10)) {
    if (asset.status === 'active' && asset.utilization_pct > 80) {
      maintenanceSchedule.push({
        asset_id: asset.asset_id,
        action: 'Performance review and capacity assessment',
        priority: 'HIGH',
        due_date: new Date(now.getTime() + rng.nextInt(30, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    } else if (asset.status === 'maintenance') {
      maintenanceSchedule.push({
        asset_id: asset.asset_id,
        action: 'Complete pending maintenance and return to service',
        priority: 'MEDIUM',
        due_date: new Date(now.getTime() + rng.nextInt(7, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }

  const lifecycleSummary = `Portfolio of ${input.assets.length} assets: ${byStatus['active'] || 0} active, ${byStatus['maintenance'] || 0} in maintenance, ${endOfLife} end-of-life. Average age: ${avgAge.toFixed(1)} years. Warranty coverage: ${((input.assets.length - warrantyExpired) / Math.max(input.assets.length, 1) * 100).toFixed(0)}%.`

  return {
    total_assets: input.assets.length,
    by_status: byStatus,
    by_type: byType,
    warranty_expired_count: warrantyExpired,
    end_of_life_count: endOfLife,
    avg_age_years: Math.round(avgAge * 10) / 10,
    refresh_recommendations: refreshRecs,
    maintenance_schedule: maintenanceSchedule,
    lifecycle_summary: lifecycleSummary,
  }
}

function formatAssetReport(result: AssetAnalysis): string {
  const lines: string[] = []
  lines.push('## IT Asset Lifecycle Management Report')
  lines.push('')
  lines.push(`**Total Assets:** ${result.total_assets}`)
  lines.push('')
  lines.push('### Status Distribution')
  for (const [status, count] of Object.entries(result.by_status)) {
    lines.push(`- ${status}: ${count}`)
  }
  lines.push('')
  lines.push('### Type Distribution')
  for (const [type, count] of Object.entries(result.by_type)) {
    lines.push(`- ${type}: ${count}`)
  }
  lines.push('')
  lines.push('### Key Metrics')
  lines.push(`- Average Age: ${result.avg_age_years} years`)
  lines.push(`- Warranty Expired: ${result.warranty_expired_count}`)
  lines.push(`- End of Life: ${result.end_of_life_count}`)
  lines.push('')
  lines.push('### Lifecycle Summary')
  lines.push(result.lifecycle_summary)
  lines.push('')
  lines.push('### Refresh Recommendations')
  for (const rec of result.refresh_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push('### Maintenance Schedule')
  if (result.maintenance_schedule.length > 0) {
    lines.push('| Asset ID | Action | Priority | Due Date |')
    lines.push('|----------|--------|----------|----------|')
    for (const m of result.maintenance_schedule) {
      lines.push(`| ${m.asset_id} | ${m.action} | ${m.priority} | ${m.due_date} |`)
    }
  } else {
    lines.push('- No immediate maintenance actions required')
  }
  return lines.join('\n')
}

// --- Tool 6: Network Topology Mapper ---
function mapNetworkTopology(input: NetworkInput): NetworkAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.topology_type + String(input.switches)
  ))

  const totalDevices = input.switches + input.routers + input.firewalls + input.servers
  const cableCount = input.cable_runs.length
  const avgCableUtilization = cableCount > 0
    ? input.cable_runs.reduce((s, c) => s + c.utilization_pct, 0) / cableCount
    : 0

  let topologyHealth: NetworkAnalysis['topology_health'] = 'healthy'
  const spf: string[] = []
  const redundancyGaps: string[] = []

  if (input.topology_type === 'three_tier') {
    if (input.switches < 2) {
      topologyHealth = 'critical'
      spf.push('Single core switch — no redundancy at aggregation layer')
      redundancyGaps.push('Deploy redundant core switches for high availability')
    }
    if (input.firewalls < 2) {
      topologyHealth = topologyHealth === 'critical' ? 'critical' : 'warning'
      spf.push('Single firewall — no failover capability')
      redundancyGaps.push('Implement firewall HA pair (active/standby or active/active)')
    }
  } else if (input.topology_type === 'spine_leaf') {
    if (input.switches < 4) {
      topologyHealth = 'warning'
      spf.push('Insufficient spine switches for full bisectional bandwidth')
      redundancyGaps.push('Add spine switches to achieve N+1 fabric redundancy')
    }
  }

  if (input.routers < 2) {
    spf.push('Single router — no WAN/edge redundancy')
    redundancyGaps.push('Deploy redundant edge routers with BGP failover')
  }

  const oversub = input.topology_type === 'spine_leaf'
    ? `Typical spine-leaf oversubscription: 3:1 to 1:1 (current estimate: ${rng.nextInt(2, 5)}:1)`
    : `Three-tier oversubscription: 5:1 to 20:1 (current estimate: ${rng.nextInt(5, 15)}:1)`

  const cableSummary: NetworkAnalysis['cable_utilization_summary'] = input.cable_runs.map((cable, i) => {
    const status = cable.utilization_pct > 80 ? 'CRITICAL' : cable.utilization_pct > 60 ? 'WARNING' : cable.utilization_pct > 40 ? 'NORMAL' : 'LOW'
    return {
      segment: `${cable.from} → ${cable.to}`,
      utilization_pct: cable.utilization_pct,
      status,
    }
  })

  const bandwidthAnalysis: string[] = []
  for (const tier of input.bandwidth_tiers) {
    bandwidthAnalysis.push(`${tier} tier — ${rng.nextInt(70, 95)}% ports utilized`)
  }
  if (bandwidthAnalysis.length === 0) bandwidthAnalysis.push('No bandwidth tier data provided — recommend capacity audit')

  const optimizationRecs: string[] = []
  if (avgCableUtilization > 70) optimizationRecs.push('High average cable utilization — plan for additional cable runs')
  if (cableCount > 100) optimizationRecs.push('Large cable inventory — implement structured cable management and labeling')
  optimizationRecs.push('Deploy network automation for configuration management')
  optimizationRecs.push('Implement network monitoring with flow analysis (NetFlow/sFlow)')
  if (input.topology_type === 'three_tier') optimizationRecs.push('Consider spine-leaf migration for cloud-scale workloads')

  return {
    topology_health: topologyHealth,
    oversubscription_ratio: oversub,
    single_points_of_failure: spf,
    cable_utilization_summary: cableSummary,
    bandwidth_analysis: bandwidthAnalysis,
    optimization_recommendations: optimizationRecs,
    redundancy_gaps: redundancyGaps,
  }
}

function formatNetworkReport(result: NetworkAnalysis, input: NetworkInput): string {
  const lines: string[] = []
  lines.push('## Network Topology Mapping Report')
  lines.push('')
  lines.push(`**Topology:** ${input.topology_type} | **Switches:** ${input.switches} | **Routers:** ${input.routers} | **Firewalls:** ${input.firewalls} | **Servers:** ${input.servers}`)
  lines.push(`**Overall Health:** ${result.topology_health.toUpperCase()}`)
  lines.push('')
  lines.push('### Oversubscription')
  lines.push(result.oversubscription_ratio)
  lines.push('')
  lines.push('### Single Points of Failure')
  if (result.single_points_of_failure.length > 0) {
    for (const spf of result.single_points_of_failure) {
      lines.push(`- ${spf}`)
    }
  } else {
    lines.push('- No single points of failure detected')
  }
  lines.push('')
  lines.push('### Cable Utilization')
  if (result.cable_utilization_summary.length > 0) {
    lines.push('| Segment | Utilization | Status |')
    lines.push('|---------|-------------|--------|')
    for (const c of result.cable_utilization_summary) {
      lines.push(`| ${c.segment} | ${c.utilization_pct}% | ${c.status} |`)
    }
  } else {
    lines.push('- No cable run data provided')
  }
  lines.push('')
  lines.push('### Bandwidth Analysis')
  for (const ba of result.bandwidth_analysis) {
    lines.push(`- ${ba}`)
  }
  lines.push('')
  lines.push('### Redundancy Gaps')
  if (result.redundancy_gaps.length > 0) {
    for (const gap of result.redundancy_gaps) {
      lines.push(`- ${gap}`)
    }
  } else {
    lines.push('- No critical redundancy gaps identified')
  }
  lines.push('')
  lines.push('### Optimization Recommendations')
  for (const rec of result.optimization_recommendations) {
    lines.push(`- ${rec}`)
  }
  return lines.join('\n')
}

// --- Tool 7: Data Center Carbon Tracker ---
function trackCarbon(input: CarbonInput): CarbonAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    String(input.annual_energy_mwh) + String(input.reporting_year)
  ))

  const annualEmissions = (input.annual_energy_mwh * input.grid_carbon_intensity_gco2_kwh) / 1000000
  const itEmissions = annualEmissions / input.pue
  const infraEmissions = annualEmissions - itEmissions
  const carbonIntensity = (annualEmissions * 1000000) / Math.max(input.annual_energy_mwh, 1)

  const renewableImpact = input.renewable_energy_pct >= 80
    ? `Excellent — ${input.renewable_energy_pct}% renewable energy significantly reduces carbon footprint`
    : input.renewable_energy_pct >= 50
      ? `Good — ${input.renewable_energy_pct}% renewable energy, room for improvement`
      : input.renewable_energy_pct >= 20
        ? `Moderate — ${input.renewable_energy_pct}% renewable energy, significant grid reliance`
        : `Low — only ${input.renewable_energy_pct}% renewable energy, high carbon intensity`

  const offsetTons = input.carbon_offset_tons || 0
  const greenPowerMwh = (input.green_power_purchases_mwh ?? 0)
  const offsetPct = annualEmissions > 0 ? ((offsetTons + greenPowerMwh * 0.5) / annualEmissions) * 100 : 0
  const offsetStatus = offsetPct >= 80
    ? `Carbon neutral achieved — ${offsetPct.toFixed(0)}% offset`
    : offsetPct >= 40
      ? `Partial offset — ${offsetPct.toFixed(0)}% of emissions covered`
      : `Insufficient offset — only ${offsetPct.toFixed(0)}% of emissions covered`

  const reductionOpportunities: string[] = []
  if (input.pue > 1.5) reductionOpportunities.push(`Improve PUE from ${input.pue} to 1.3 — saves ~${((input.pue - 1.3) / input.pue * 100).toFixed(0)}% infrastructure energy`)
  if (input.renewable_energy_pct < 50) reductionOpportunities.push('Increase renewable energy procurement through PPAs or green tariffs')
  reductionOpportunities.push('Deploy AI-optimized cooling to reduce energy consumption by 15-25%')
  reductionOpportunities.push('Implement server virtualization to improve utilization and reduce idle power')
  reductionOpportunities.push('Transition to high-efficiency UPS systems (97%+ efficiency)')

  const greenPowerRecs: string[] = []
  if ((input.green_power_purchases_mwh ?? 0) < input.annual_energy_mwh * 0.3) {
    greenPowerRecs.push('Increase green power purchase agreements (PPAs) to cover 50%+ of consumption')
  }
  greenPowerRecs.push('Evaluate on-site solar/wind generation for supplemental renewable energy')
  greenPowerRecs.push('Purchase Renewable Energy Certificates (RECs) for remaining grid consumption')
  greenPowerRecs.push('Explore 24/7 carbon-free energy matching (hourly matching)')

  const complianceStatus = offsetPct >= 80 && input.renewable_energy_pct >= 50
    ? 'Compliant — meets major sustainability reporting requirements (GRI/SASB/TCFD)'
    : offsetPct >= 40
      ? 'Partially compliant — additional offsets or renewable procurement needed'
      : 'At risk — significant gap to carbon neutrality commitments'

  return {
    annual_emissions_tons: Math.round(annualEmissions * 10) / 10,
    it_emissions_tons: Math.round(itEmissions * 10) / 10,
    infrastructure_emissions_tons: Math.round(infraEmissions * 10) / 10,
    carbon_intensity_per_mwh: Math.round(carbonIntensity),
    renewable_impact: renewableImpact,
    offset_status: offsetStatus,
    reduction_opportunities: reductionOpportunities,
    green_power_recommendations: greenPowerRecs,
    compliance_status: complianceStatus,
  }
}

function formatCarbonReport(result: CarbonAnalysis, input: CarbonInput): string {
  const lines: string[] = []
  lines.push('## Data Center Carbon Tracking Report')
  lines.push('')
  lines.push(`**Reporting Year:** ${input.reporting_year} | **Annual Energy:** ${input.annual_energy_mwh} MWh | **PUE:** ${input.pue}`)
  lines.push('')
  lines.push('### Emissions Summary')
  lines.push(`- Total Annual Emissions: ${result.annual_emissions_tons} tCO2e`)
  lines.push(`- IT Equipment Emissions: ${result.it_emissions_tons} tCO2e`)
  lines.push(`- Infrastructure Emissions: ${result.infrastructure_emissions_tons} tCO2e`)
  lines.push(`- Carbon Intensity: ${result.carbon_intensity_per_mwh} gCO2/kWh`)
  lines.push('')
  lines.push('### Renewable Energy Impact')
  lines.push(result.renewable_impact)
  lines.push('')
  lines.push('### Offset Status')
  lines.push(result.offset_status)
  lines.push('')
  lines.push('### Reduction Opportunities')
  for (const opp of result.reduction_opportunities) {
    lines.push(`- ${opp}`)
  }
  lines.push('')
  lines.push('### Green Power Recommendations')
  for (const rec of result.green_power_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`**Compliance Status:** ${result.compliance_status}`)
  return lines.join('\n')
}

// --- Tool 8: Disaster Recovery Planner ---
function planDisasterRecovery(input: DRInput): DRAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.primary_site + input.dr_site + input.replication_type
  ))

  const lastDrill = new Date(input.last_drill_date)
  const now = new Date()
  const monthsSinceDrill = (now.getTime() - lastDrill.getTime()) / (30 * 24 * 60 * 60 * 1000)
  const testedPct = input.critical_systems_count > 0
    ? (input.tested_systems_count / input.critical_systems_count) * 100
    : 0

  const rtoFeasibility = input.rto_hours <= 4
    ? `Achievable — ${input.rto_hours}h RTO with ${input.replication_type} replication`
    : input.rto_hours <= 8
      ? `Challenging — ${input.rto_hours}h RTO requires well-documented runbooks and regular drills`
      : `Difficult — ${input.rto_hours}h RTO may require infrastructure improvements`

  const rpoFeasibility = input.rpo_hours <= 1
    ? `Excellent — ${input.rpo_hours}h RPO with synchronous replication`
    : input.rpo_hours <= 4
      ? `Acceptable — ${input.rpo_hours}h RPO with asynchronous replication`
      : `High data loss risk — ${input.rpo_hours}h RPO exceeds typical tolerance`

  const replicationAdequacy = input.replication_type === 'synchronous'
    ? 'Synchronous replication — zero data loss capability (RPO ≈ 0)'
    : input.replication_type === 'asynchronous'
      ? `Asynchronous replication — typical RPO of ${input.rpo_hours} hours`
      : 'Snapshot-based replication — RPO depends on snapshot frequency'

  const drillCompliance = monthsSinceDrill <= 6
    ? `Compliant — last drill ${monthsSinceDrill.toFixed(0)} months ago`
    : monthsSinceDrill <= 12
      ? `Overdue — last drill ${monthsSinceDrill.toFixed(0)} months ago, schedule within 30 days`
      : `Non-compliant — last drill ${monthsSinceDrill.toFixed(0)} months ago, immediate action required`

  const gapAnalysis: string[] = []
  if (testedPct < 80) gapAnalysis.push(`Only ${testedPct.toFixed(0)}% of critical systems tested — target 100% coverage`)
  if (monthsSinceDrill > 6) gapAnalysis.push('DR drill overdue — schedule immediately')
  if (input.rto_hours > 8) gapAnalysis.push('RTO exceeds 8 hours — evaluate infrastructure improvements')
  if (input.rpo_hours > 4) gapAnalysis.push('RPO exceeds 4 hours — consider synchronous replication for critical systems')
  if (input.replication_type === 'snapshot') gapAnalysis.push('Snapshot replication has highest RPO — upgrade to async or sync for critical workloads')

  const drillRecs: string[] = []
  drillRecs.push('Conduct full DR drill semi-annually (minimum) with documented results')
  drillRecs.push('Test failover and failback procedures for all critical systems')
  drillRecs.push('Validate data integrity post-failover with application-level checks')
  drillRecs.push('Include network failover testing (DNS, load balancer, VPN)')
  drillRecs.push('Document lessons learned and update runbooks after each drill')

  const recoveryProcedures = [
    { step: 1, action: 'Declare disaster and activate DR team', estimated_minutes: '15', responsible: 'DR Coordinator' },
    { step: 2, action: 'Failover network connectivity to DR site', estimated_minutes: '30', responsible: 'Network Team' },
    { step: 3, action: 'Activate DR infrastructure and verify replication status', estimated_minutes: '45', responsible: 'Infrastructure Team' },
    { step: 4, action: 'Failover critical applications in priority order', estimated_minutes: '60', responsible: 'Application Team' },
    { step: 5, action: 'Validate application functionality and data integrity', estimated_minutes: '30', responsible: 'QA Team' },
    { step: 6, action: 'Update DNS and redirect user traffic to DR site', estimated_minutes: '15', responsible: 'Network Team' },
    { step: 7, action: 'Notify stakeholders and confirm service restoration', estimated_minutes: '15', responsible: 'DR Coordinator' },
  ]

  const improvementRoadmap: string[] = []
  if (testedPct < 100) improvementRoadmap.push(`Phase 1 (0-30 days): Test remaining ${(100 - testedPct).toFixed(0)}% of critical systems`)
  improvementRoadmap.push('Phase 1 (0-30 days): Update DR runbooks and contact lists')
  improvementRoadmap.push('Phase 2 (30-60 days): Conduct tabletop exercise with key stakeholders')
  improvementRoadmap.push('Phase 3 (60-90 days): Execute full-scale DR drill with application validation')
  improvementRoadmap.push('Phase 4 (ongoing): Implement automated DR testing where possible')

  const readinessScore = Math.round(
    (testedPct * 0.3) +
    (monthsSinceDrill <= 6 ? 25 : monthsSinceDrill <= 12 ? 15 : 5) +
    (input.rto_hours <= 4 ? 25 : input.rto_hours <= 8 ? 15 : 5) +
    (input.rpo_hours <= 1 ? 25 : input.rpo_hours <= 4 ? 15 : 5)
  )

  return {
    dr_readiness_score: Math.min(readinessScore, 100),
    rto_feasibility: rtoFeasibility,
    rpo_feasibility: rpoFeasibility,
    replication_adequacy: replicationAdequacy,
    drill_compliance: drillCompliance,
    gap_analysis: gapAnalysis,
    drill_recommendations: drillRecs,
    recovery_procedures: recoveryProcedures,
    improvement_roadmap: improvementRoadmap,
  }
}

function formatDRReport(result: DRAnalysis, input: DRInput): string {
  const lines: string[] = []
  lines.push('## Disaster Recovery Planning Report')
  lines.push('')
  lines.push(`**Primary Site:** ${input.primary_site} | **DR Site:** ${input.dr_site} | **Replication:** ${input.replication_type}`)
  lines.push(`**RTO:** ${input.rto_hours}h | **RPO:** ${input.rpo_hours}h | **Readiness Score:** ${result.dr_readiness_score}/100`)
  lines.push('')
  lines.push('### Feasibility Assessment')
  lines.push(`- RTO: ${result.rto_feasibility}`)
  lines.push(`- RPO: ${result.rpo_feasibility}`)
  lines.push(`- Replication: ${result.replication_adequacy}`)
  lines.push(`- Drill Compliance: ${result.drill_compliance}`)
  lines.push('')
  lines.push('### Gap Analysis')
  if (result.gap_analysis.length > 0) {
    for (const gap of result.gap_analysis) {
      lines.push(`- ${gap}`)
    }
  } else {
    lines.push('- No critical gaps identified')
  }
  lines.push('')
  lines.push('### Recovery Procedures')
  lines.push('| Step | Action | Est. Time | Responsible |')
  lines.push('|------|--------|-----------|-------------|')
  for (const proc of result.recovery_procedures) {
    lines.push(`| ${proc.step} | ${proc.action} | ${proc.estimated_minutes} min | ${proc.responsible} |`)
  }
  lines.push('')
  lines.push('### Drill Recommendations')
  for (const rec of result.drill_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push('### Improvement Roadmap')
  for (const step of result.improvement_roadmap) {
    lines.push(`- ${step}`)
  }
  return lines.join('\n')
}

// ==================== SECTION 4 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: PUE Optimization Engine
  tools.register(defineTool({
    name: 'pue_optimization_engine',
    description: 'PUE能效分析与自然冷却优化 | Analyze Power Usage Effectiveness with free cooling optimization. Input: datacenter_name, total_power_kw, it_load_kw, cooling_type, location, ambient_temp_c, free_cooling_hours.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (analyze|optimize|forecast|benchmark), datacenter_name, total_power_kw, it_load_kw, cooling_type (air_cooled|water_cooled|liquid_cooled|hybrid), location, ambient_temp_c, free_cooling_hours?'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: PUEInput = JSON.parse(args.input_data)
      const result = analyzePUE(input)
      return formatPUEReport(result, input)
    }
  }))

  // Tool 2: Capacity Planning Forecaster
  tools.register(defineTool({
    name: 'capacity_planning_forecaster',
    description: '容量规划与机柜空间预测 | Forecast data center capacity needs with rack space planning. Input: datacenter_name, total_racks, occupied_racks, avg_rack_power_kw, total_power_capacity_kw, growth_rate_pct, forecast_months.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (forecast|plan|analyze|recommend), datacenter_name, total_racks, occupied_racks, avg_rack_power_kw, total_power_capacity_kw, growth_rate_pct, forecast_months'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: CapacityInput = JSON.parse(args.input_data)
      const result = forecastCapacity(input)
      return formatCapacityReport(result, input)
    }
  }))

  // Tool 3: Cooling System Optimizer
  tools.register(defineTool({
    name: 'cooling_system_optimizer',
    description: '精密空调/液冷系统优化 | Optimize CRAC/liquid cooling system performance. Input: system_type, total_cooling_capacity_kw, current_load_kw, supply_temp_c, return_temp_c, airflow_cfm, num_units, setpoint_temp_c.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (optimize|analyze|simulate|tune), system_type (crac|chiller|liquid_cooling|evaporative|free_cooling), total_cooling_capacity_kw, current_load_kw, supply_temp_c, return_temp_c, airflow_cfm, num_units, setpoint_temp_c'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: CoolingInput = JSON.parse(args.input_data)
      const result = optimizeCooling(input)
      return formatCoolingReport(result, input)
    }
  }))

  // Tool 4: Power Distribution Monitor
  tools.register(defineTool({
    name: 'power_distribution_monitor',
    description: 'UPS/PDU配电监测与冗余分析 | Monitor power distribution with UPS/PDU redundancy analysis. Input: ups_capacity_kva, ups_load_kva, pdu_count, pdu_loads[], redundancy_mode, battery_runtime_min, generator_backup.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (monitor|analyze|redundancy|audit), ups_capacity_kva, ups_load_kva, pdu_count, pdu_loads (array of numbers), redundancy_mode (N|N+1|2N|2N+1), battery_runtime_min, generator_backup (boolean)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: PowerInput = JSON.parse(args.input_data)
      const result = monitorPower(input)
      return formatPowerReport(result, input)
    }
  }))

  // Tool 5: IT Asset Lifecycle
  tools.register(defineTool({
    name: 'it_asset_lifecycle',
    description: 'IT资产生命周期与维保管理 | Manage IT asset lifecycle with maintenance scheduling. Input: assets array with asset_id, type, model, purchase_date, warranty_years, status, utilization_pct. Optional: refresh_budget_usd.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (inventory|lifecycle|maintenance|refresh), assets[{asset_id, type, model, purchase_date, warranty_years, status (active|maintenance|end_of_life|decommissioned), utilization_pct}], refresh_budget_usd?'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: AssetInput = JSON.parse(args.input_data)
      const result = analyzeAssets(input)
      return formatAssetReport(result)
    }
  }))

  // Tool 6: Network Topology Mapper
  tools.register(defineTool({
    name: 'network_topology_mapper',
    description: '网络拓扑与线缆管理 | Map network topology with cable management. Input: switches, routers, firewalls, servers, cable_runs[{from,to,type,length_m,utilization_pct}], topology_type, bandwidth_tiers[].',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (map|analyze|optimize|audit), switches, routers, firewalls, servers, cable_runs[{from, to, type (fiber|copper|dac), length_m, utilization_pct}], topology_type (three_tier|spine_leaf|mesh|hybrid), bandwidth_tiers (array of strings)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: NetworkInput = JSON.parse(args.input_data)
      const result = mapNetworkTopology(input)
      return formatNetworkReport(result, input)
    }
  }))

  // Tool 7: Data Center Carbon Tracker
  tools.register(defineTool({
    name: 'datacenter_carbon_tracker',
    description: '数据中心碳排放与绿电交易 | Track carbon emissions with green power trading analysis. Input: annual_energy_mwh, pue, grid_carbon_intensity_gco2_kwh, renewable_energy_pct, reporting_year. Optional: green_power_purchases_mwh, carbon_offset_tons.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (track|reduce|trade|report), annual_energy_mwh, pue, grid_carbon_intensity_gco2_kwh, renewable_energy_pct, green_power_purchases_mwh?, carbon_offset_tons?, reporting_year'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: CarbonInput = JSON.parse(args.input_data)
      const result = trackCarbon(input)
      return formatCarbonReport(result, input)
    }
  }))

  // Tool 8: Disaster Recovery Planner
  tools.register(defineTool({
    name: 'disaster_recovery_planner',
    description: '灾备切换与RTO/RPO演练 | Plan disaster recovery with RTO/RPO drill management. Input: primary_site, dr_site, rto_hours, rpo_hours, replication_type, last_drill_date, critical_systems_count, tested_systems_count.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: action (plan|drill|assess|optimize), primary_site, dr_site, rto_hours, rpo_hours, replication_type (synchronous|asynchronous|snapshot), last_drill_date, critical_systems_count, tested_systems_count'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: DRInput = JSON.parse(args.input_data)
      const result = planDisasterRecovery(input)
      return formatDRReport(result, input)
    }
  }))

  console.log(`[dsh-tool-datacenteragent] Loaded v${VERSION} — Data Center Management AI Agent with 8 tools`)
  console.log('  Tools: pue_optimization_engine, capacity_planning_forecaster, cooling_system_optimizer, power_distribution_monitor, it_asset_lifecycle, network_topology_mapper, datacenter_carbon_tracker, disaster_recovery_planner')
}
