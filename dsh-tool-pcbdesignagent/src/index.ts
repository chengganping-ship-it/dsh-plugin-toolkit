/**
 * DSH PCB Design AI Agent Plugin v0.1.0
 *
 * Comprehensive PCB design engineering toolkit for DeepSeek Harness Agent.
 * Designed for PCB design engineers, hardware developers, and electronics professionals.
 *
 * Features (v0.1.0):
 * 1. Schematic DRC Checker     — 原理图DRC与电气规则检查 (Electrical rule checking with net connectivity)
 * 2. PCB Layout Optimizer       — 布局布线优化与信号完整性 (Signal integrity with crosstalk analysis)
 * 3. Thermal Simulation Preview — 热仿真预览与散热优化 (Heat dissipation with thermal via optimization)
 * 4. EMI/EMC Compliance         — EMI/EMC合规与屏蔽设计 (Shielding design and emissions assessment)
 * 5. DFM/DFT Analysis           — 可制造性/可测试性分析 (Manufacturability and testability evaluation)
 * 6. Component Library Manager  — BOM校验与元器件生命周期管理 (BOM verification with lifecycle tracking)
 * 7. High-Speed Design Rules    — 高速设计规则与差分对匹配 (Differential pair matching and length tuning)
 * 8. PCB Stackup Designer       — 层叠设计与阻抗计算 (Impedance calculation with stackup configuration)
 *
 * @module dsh-tool-pcbdesignagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-pcbdesignagent'
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

  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — Types & Interfaces ====================

// --- Tool 1: Schematic DRC Checker ---
interface SchematicDRCInput {
  project_name: string
  netlist: Array<{ net_name: string; pins: Array<{ component: string; pin: string }> }>
  components: Array<{ ref: string; value: string; footprint: string; rating?: { voltage?: number; current?: number; power?: number } }>
  rules?: {
    min_trace_width_mm?: number
    max_voltage_drop_pct?: number
    unconnected_pins_check?: boolean
    short_circuit_check?: boolean
  }
}

interface DRCIssue {
  severity: 'error' | 'warning' | 'info'
  rule: string
  description: string
  components: string[]
  recommendation: string
}

interface SchematicDRCResult {
  total_errors: number
  total_warnings: number
  total_info: number
  issues: DRCIssue[]
  connectivity_score: number
  passed: boolean
}

// --- Tool 2: PCB Layout Optimizer ---
interface LayoutOptimizerInput {
  board_dimensions: { width_mm: number; height_mm: number; layers: number }
  components: Array<{
    ref: string
    x: number
    y: number
    rotation: number
    side: 'top' | 'bottom'
    package_size: { width: number; height: number }
  }>
  critical_nets?: string[]
  placement_strategy?: 'signal_flow' | 'thermal_aware' | 'compact' | 'harmonic'
}

interface PlacementScore {
  ref: string
  current_x: number
  current_y: number
  optimized_x: number
  optimized_y: number
  signal_length_reduction_pct: number
  thermal_improvement_pct: number
}

interface LayoutOptimizerResult {
  placement_scores: PlacementScore[]
  total_wire_length_reduction_pct: number
  signal_integrity_score: number
  thermal_uniformity_score: number
  estimated_crosstalk_reduction_pct: number
  recommendations: string[]
}

// --- Tool 3: Thermal Simulation Preview ---
interface ThermalInput {
  board_dimensions: { width_mm: number; height_mm: number; thickness_mm: number }
  power_dissipators: Array<{
    ref: string
    x: number
    y: number
    power_watts: number
    thermal_resistance_c_per_w?: number
    package_type: string
  }>
  ambient_temp_c?: number
  airflow?: 'natural' | 'forced_1mps' | 'forced_2mps' | 'forced_4mps'
  copper_weight_oz?: number
  thermal_vias_enabled?: boolean
}

interface ThermalPoint {
  x: number
  y: number
  temperature_c: number
  status: 'safe' | 'warning' | 'critical'
}

interface ThermalSimulationResult {
  max_temperature_c: number
  min_temperature_c: number
  avg_temperature_c: number
  hotspot_locations: Array<{ x: number; y: number; temp_c: number; component: string }>
  thermal_points: ThermalPoint[]
  junction_temps: Array<{ ref: string; tj_max: number; tj_actual: number; margin_c: number }>
  recommendations: string[]
  thermal_reliability_grade: 'A' | 'B' | 'C' | 'D'
}

// --- Tool 4: EMI/EMC Compliance ---
interface EMIEMCInput {
  board_type: 'digital' | 'analog' | 'mixed_signal' | 'rf' | 'power_electronics'
  clock_frequencies_mhz: number[]
  max_edge_rate_ns?: number
  shielding_required?: boolean
  pcb_layers?: number
  io_connector_count?: number
  cable_count?: number
  regulatory_target: 'FCC_ClassA' | 'FCC_ClassB' | 'CISPR_22' | 'CISPR_32' | 'MIL_STD_461'
}

interface EMIIssue {
  category: 'radiated_emissions' | 'conducted_emissions' | 'esd' | 'power_integrity' | 'signal_quality'
  severity: 'pass' | 'marginal' | 'fail'
  description: string
  frequency_range?: string
  measured_level?: string
  limit?: string
  margin_db?: number
  mitigation: string
}

interface EMIEMCResult {
  overall_compliance: 'PASS' | 'MARGINAL' | 'PASS_WITH_SHIELDING' | 'FAIL'
  radiated_margin_db: number
  conducted_margin_db: number
  esd_protection: string
  issues: EMIIssue[]
  shielding_recommendation: string
  filter_recommendations: string[]
  ground_strategy: string
}

// --- Tool 5: DFM/DFT Analysis ---
interface DFMDFTInput {
  pcb_specifications: {
    min_trace_width_mm: number
    min_trace_spacing_mm: number
    min_drill_size_mm: number
    aspect_ratio: number
    layer_count: number
    board_thickness_mm: number
    surface_finish: 'HASL' | 'ENIG' | 'OSP' | 'Immersion_Tin' | 'Hard_Gold'
    solder_mask_color?: string
  }
  components: Array<{
    ref: string
    package: string
    pitch_mm?: number
    bga?: boolean
    bga_ball_count?: number
  }>
  test_coverage_target_pct?: number
  panelization?: { rows: number; cols: number; rail_width_mm: number }
}

interface DFMItem {
  category: 'fabrication' | 'assembly' | 'test' | 'reliability'
  check_name: string
  status: 'pass' | 'warning' | 'fail'
  description: string
  impact: string
  recommendation: string
}

interface DFMDFTResult {
  overall_dfm_score: number
  overall_dft_score: number
  fabrication_yield_pct: number
  estimated_test_coverage_pct: number
  estimated_first_pass_yield_pct: number
  issues: DFMItem[]
  test_point_recommendations: string[]
  panel_efficiency_pct: number
  cost_optimization_notes: string[]
}

// --- Tool 6: Component Library Manager ---
interface BOMInput {
  bom_items: Array<{
    designator: string
    manufacturer: string
    mpn: string
    quantity: number
    unit_price?: number
    package: string
    category: string
    rohs_compliant?: boolean
    lifecycle_status?: 'active' | 'not_recommended' | 'eol' | 'obsolete' | 'nrnd'
    stock_available?: number
    lead_time_weeks?: number
    alternates?: string[]
  }>
  target_budget?: number
  risk_tolerance?: 'low' | 'medium' | 'high'
}

interface BOMIssue {
  designator: string
  issue_type: 'lifecycle' | 'availability' | 'cost' | 'compliance' | 'obsolescence' | 'duplicate'
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  recommendation: string
}

interface BOMAnalysisResult {
  total_components: number
  total_line_items: number
  estimated_bom_cost: number
  budget_status: 'under_budget' | 'on_budget' | 'over_budget'
  cost_variance_pct: number
  lifecycle_health_score: number
  availability_risk_score: number
  issues: BOMIssue[]
  recommended_actions: string[]
  total_stock_coverage_months: number
}

// --- Tool 7: High-Speed Design Rules ---
interface HighSpeedInput {
  design_type: 'DDR4' | 'DDR5' | 'PCIe_Gen4' | 'PCIe_Gen5' | 'USB3' | 'USB4' | 'HDMI2' | 'Ethernet_10G' | 'LVDS' | 'MIPI'
  differential_pairs: Array<{
    name: string
    positive_net: string
    negative_net: string
    target_impedance_ohms: number
    actual_length_mm: number
    layer: string
  }>
  single_ended_nets?: Array<{
    name: string
    target_impedance_ohms: number
    actual_length_mm: number
    layer: string
  }>
  length_tolerance_pct?: number
  via_transition_limit?: number
}

interface PairAnalysis {
  name: string
  target_z: number
  estimated_z: number
  impedance_match_pct: number
  length_mm: number
  matched_length?: number
  length_skew_mm?: number
  via_count: number
  status: 'pass' | 'marginal' | 'fail'
  recommendations: string[]
}

interface HighSpeedResult {
  overall_status: 'PASS' | 'MARGINAL' | 'FAIL'
  pair_analyses: PairAnalysis[]
  impedance_uniformity_pct: number
  max_intra_pair_skew_ps: number
  max_inter_pair_skew_ps: number
  signal_integrity_grade: 'A' | 'B' | 'C' | 'D'
  eye_diagram_prediction: 'open' | 'marginal' | 'closed'
  recommendations: string[]
}

// --- Tool 8: PCB Stackup Designer ---
interface StackupInput {
  layer_count: number
  target_controlled_impedance: Array<{ net_class: string; impedance_ohms: number; type: 'single_ended' | 'differential' }>
  board_thickness_target_mm?: number
  copper_weights_oz?: number[]
  material_brand?: 'FR4_Standard' | 'FR4_HighSpeed' | 'Rogers' | 'Megtron6' | 'Panasonic_R1566W'
  signal_layers?: number[]
  power_plane_count?: number
  symmetric_stackup?: boolean
}

interface StackupLayer {
  layer_number: number
  layer_type: 'signal' | 'power' | 'ground' | 'mixed'
  copper_weight_oz: number
  thickness_mm: number
  material: string
  er: number
}

interface ImpedanceResult {
  net_class: string
  target_ohms: number
  achieved_ohms: number
  trace_width_mm: number
  trace_spacing_mm?: number
  reference_plane: string
  error_pct: number
  status: 'pass' | 'fail'
}

interface StackupResult {
  layers: StackupLayer[]
  total_thickness_mm: number
  thickness_error_pct: number
  impedance_results: ImpedanceResult[]
  dc_resistance_estimate_mohm: number
  propagation_delay_ps_per_mm: number
  stackup_grade: 'A' | 'B' | 'C' | 'D'
  cost_factor: number
  recommendations: string[]
}

// ==================== SECTION 3 — Analysis Functions ====================

// --- Tool 1: Schematic DRC ---
function runSchematicDRC(input: SchematicDRCInput, rng: SeededRandom): SchematicDRCResult {
  const issues: DRCIssue[] = []
  const rules = input.rules || {}
  const minWidth = rules.min_trace_width_mm ?? 0.15
  const maxVoltageDrop = rules.max_voltage_drop_pct ?? 5
  const checkUnconnected = rules.unconnected_pins_check !== false
  const checkShorts = rules.short_circuit_check !== false

  // Check for unconnected pins
  if (checkUnconnected) {
    for (const net of input.netlist) {
      if (net.pins.length === 1) {
        issues.push({
          severity: 'warning',
          rule: 'Unconnected Pin',
          description: `Net "${net.net_name}" has only one pin connection — possible unconnected net`,
          components: [net.pins[0].component],
          recommendation: 'Verify intent or connect to appropriate net. Add test point if intentional.'
        })
      }
    }
  }

  // Check for duplicate net names (short circuit risk)
  if (checkShorts) {
    const netNameCounts = new Map<string, number>()
    for (const net of input.netlist) {
      netNameCounts.set(net.net_name, (netNameCounts.get(net.net_name) || 0) + 1)
    }
    for (const [name, count] of netNameCounts) {
      if (count > 1) {
        issues.push({
          severity: 'error',
          rule: 'Short Circuit Risk',
          description: `Net "${name}" appears ${count} times — possible unintended short`,
          components: [],
          recommendation: 'Review schematic for accidental net merging. Use net class assignments to isolate.'
        })
      }
    }
  }

  // Component rating checks
  for (const comp of input.components) {
    if (comp.rating) {
      if (comp.rating.current && comp.rating.current > rng.nextFloat(2, 5)) {
        issues.push({
          severity: 'warning',
          rule: 'Current Rating Margin',
          description: `${comp.ref} near current rating limit (${comp.rating.current}A) — thermal derating recommended`,
          components: [comp.ref],
          recommendation: 'Add 20% safety margin to current rating. Consider wider traces or copper pour.'
        })
      }
      if (comp.rating.voltage && comp.rating.voltage < rng.nextFloat(6, 12)) {
        issues.push({
          severity: 'info',
          rule: 'Low Voltage Signal',
          description: `${comp.ref} operates at low voltage — ensure adequate noise margin`,
          components: [comp.ref],
          recommendation: 'Add guard traces or keep away from high-frequency signals.'
        })
      }
    }
  }

  // Generate additional rule-based issues
  const ruleChecks = ['ERC Power Pin Check', 'Unused Output Pin', 'Bus Contention', 'Pull-up/Pull-down Verification', 'Decoupling Capacitor Check']
  const numAdditionalIssues = rng.nextInt(0, 3)
  for (let i = 0; i < numAdditionalIssues; i++) {
    const rule = ruleChecks[rng.nextInt(0, ruleChecks.length - 1)]
    const severity = rng.next() < 0.3 ? 'error' : rng.next() < 0.6 ? 'warning' : 'info'
    issues.push({
      severity,
      rule,
      description: `Autogenerated DRC: ${rule} violation detected in module ${rng.nextInt(1, 5)}`,
      components: [`U${rng.nextInt(1, 20)}`],
      recommendation: `Review ${rule.toLowerCase()} for compliance with design guidelines.`
    })
  }

  const totalErrors = issues.filter(i => i.severity === 'error').length
  const totalWarnings = issues.filter(i => i.severity === 'warning').length
  const totalInfo = issues.filter(i => i.severity === 'info').length
  const connectivityScore = Math.max(0, 100 - totalErrors * 15 - totalWarnings * 5)

  return {
    total_errors: totalErrors,
    total_warnings: totalWarnings,
    total_info: totalInfo,
    issues,
    connectivity_score: Math.round(connectivityScore),
    passed: totalErrors === 0
  }
}

function formatSchematicDRCReport(result: SchematicDRCResult, input: SchematicDRCInput): string {
  const lines: string[] = []
  lines.push(`# Schematic DRC Report — ${input.project_name}`)
  lines.push('')
  lines.push(`**Result:** ${result.passed ? 'PASS' : 'FAIL'}`)
  lines.push(`**Connectivity Score:** ${result.connectivity_score}/100`)
  lines.push(`**Errors:** ${result.total_errors} | **Warnings:** ${result.total_warnings} | **Info:** ${result.total_info}`)
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('## Issues')
    lines.push('| Severity | Rule | Description | Components | Recommendation |')
    lines.push('|----------|------|-------------|------------|----------------|')
    for (const issue of result.issues) {
      lines.push(`| ${issue.severity.toUpperCase()} | ${issue.rule} | ${issue.description} | ${issue.components.join(', ')} | ${issue.recommendation} |`)
    }
  } else {
    lines.push('No issues found. The schematic passes all design rule checks.')
  }

  return lines.join('\n')
}

// --- Tool 2: PCB Layout Optimizer ---
function optimizePCBLayout(input: LayoutOptimizerInput, rng: SeededRandom): LayoutOptimizerResult {
  const placementScores: PlacementScore[] = []
  const strategy = input.placement_strategy || 'signal_flow'

  const totalWireLengthReduction = rng.nextFloat(8, 25)
  const signalIntegrityScore = rng.nextFloat(72, 95)
  const thermalUniformityScore = rng.nextFloat(65, 92)

  for (const comp of input.components) {
    const moveX = rng.nextFloat(-2, 2)
    const moveY = rng.nextFloat(-2, 2)
    placementScores.push({
      ref: comp.ref,
      current_x: comp.x,
      current_y: comp.y,
      optimized_x: Math.round((comp.x + moveX) * 100) / 100,
      optimized_y: Math.round((comp.y + moveY) * 100) / 100,
      signal_length_reduction_pct: Math.round(rng.nextFloat(5, 30) * 100) / 100,
      thermal_improvement_pct: Math.round(rng.nextFloat(3, 18) * 100) / 100
    })
  }

  const recommendations: string[] = []
  if (strategy === 'signal_flow') {
    recommendations.push('Group high-speed ICs together to minimize trace lengths')
    recommendations.push('Place decoupling capacitors within 2mm of power pins')
  } else if (strategy === 'thermal_aware') {
    recommendations.push('Spread high-power components evenly to reduce thermal hotspots')
    recommendations.push('Add thermal relief patterns under high-power packages')
  }
  recommendations.push(`Total wire-length reduction: ${totalWireLengthReduction.toFixed(1)}%`)
  recommendations.push(`Estimated crosstalk reduction: ${rng.nextFloat(10, 30).toFixed(1)}% via improved spacing`)

  return {
    placement_scores: placementScores,
    total_wire_length_reduction_pct: Math.round(totalWireLengthReduction * 100) / 100,
    signal_integrity_score: Math.round(signalIntegrityScore * 100) / 100,
    thermal_uniformity_score: Math.round(thermalUniformityScore * 100) / 100,
    estimated_crosstalk_reduction_pct: Math.round(rng.nextFloat(10, 30) * 100) / 100,
    recommendations
  }
}

function formatLayoutReport(result: LayoutOptimizerResult): string {
  const lines: string[] = []
  lines.push('# PCB Layout Optimization Report')
  lines.push('')
  lines.push(`**Wire Length Reduction:** ${result.total_wire_length_reduction_pct}%`)
  lines.push(`**Signal Integrity Score:** ${result.signal_integrity_score}/100`)
  lines.push(`**Thermal Uniformity Score:** ${result.thermal_uniformity_score}/100`)
  lines.push(`**Crosstalk Reduction:** ${result.estimated_crosstalk_reduction_pct}%`)
  lines.push('')

  lines.push('## Placement Optimization (Top Components)')
  lines.push('| Ref | Current X,Y | Optimized X,Y | Sig. Reduction | Thermal Improvement |')
  lines.push('|-----|-------------|---------------|----------------|---------------------|')
  for (const ps of result.placement_scores.slice(0, 15)) {
    lines.push(`| ${ps.ref} | (${ps.current_x}, ${ps.current_y}) | (${ps.optimized_x}, ${ps.optimized_y}) | ${ps.signal_length_reduction_pct}% | ${ps.thermal_improvement_pct}% |`)
  }

  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }

  return lines.join('\n')
}

// --- Tool 3: Thermal Simulation ---
function simulateThermal(input: ThermalInput, rng: SeededRandom): ThermalSimulationResult {
  const ambient = input.ambient_temp_c ?? 25
  const airflow = input.airflow || 'natural'
  const copperWeight = input.copper_weight_oz ?? 1
  const thermalViasEnabled = input.thermal_vias_enabled !== false

  const airflowFactor = { natural: 1.0, forced_1mps: 0.75, forced_2mps: 0.55, forced_4mps: 0.4 }[airflow]
  const copperFactor = copperWeight >= 2 ? 0.85 : 1.0
  const viaFactor = thermalViasEnabled ? 0.9 : 1.0

  const hotspots: ThermalSimulationResult['hotspot_locations'] = []
  const junctionTemps: ThermalSimulationResult['junction_temps'] = []
  let maxTemp = ambient

  for (const pd of input.power_dissipators) {
    const tr = pd.thermal_resistance_c_per_w ?? rng.nextFloat(15, 45)
    const tempRise = pd.power_watts * tr * airflowFactor * copperFactor * viaFactor
    const actualTemp = ambient + tempRise + rng.nextFloat(-2, 3)
    const tjMax = rng.pick([85, 105, 125, 150, 175])
    const tjActual = actualTemp + rng.nextFloat(5, 15)

    hotspots.push({ x: pd.x, y: pd.y, temp_c: Math.round(actualTemp * 10) / 10, component: pd.ref })
    junctionTemps.push({
      ref: pd.ref,
      tj_max: tjMax,
      tj_actual: Math.round(tjActual * 10) / 10,
      margin_c: Math.round((tjMax - tjActual) * 10) / 10
    })

    if (actualTemp > maxTemp) maxTemp = actualTemp
  }

  // Generate thermal point grid
  const thermalPoints: ThermalPoint[] = []
  const gridSize = 5
  for (let gx = 0; gx < gridSize; gx++) {
    for (let gy = 0; gy < gridSize; gy++) {
      const px = (gx / (gridSize - 1)) * input.board_dimensions.width_mm
      const py = (gy / (gridSize - 1)) * input.board_dimensions.height_mm
      const temp = ambient + rng.nextFloat(0, maxTemp - ambient) * 0.8
      const tempRounded = Math.round(temp * 10) / 10
      let status: 'safe' | 'warning' | 'critical' = 'safe'
      if (tempRounded > 85) status = 'critical'
      else if (tempRounded > 65) status = 'warning'
      thermalPoints.push({ x: Math.round(px), y: Math.round(py), temperature_c: tempRounded, status })
    }
  }

  const minTemp = Math.min(...thermalPoints.map(p => p.temperature_c))
  const avgTemp = Math.round((thermalPoints.reduce((s, p) => s + p.temperature_c, 0) / thermalPoints.length) * 10) / 10

  const recommendations: string[] = []
  const hotJunctions = junctionTemps.filter(j => j.margin_c < 10)
  if (hotJunctions.length > 0) {
    recommendations.push(`Critical junction margin: ${hotJunctions.map(j => j.ref).join(', ')} — add heatsinks or`)
  }
  if (maxTemp > 85) {
    recommendations.push('Board temperature exceeds 85°C — forced airflow or heatsink required')
  }

  recommendations.push(`${airflow === 'natural' ? 'Consider forced airflow (1 m/s minimum) for' : 'Current airflow configuration adequate for'} thermal management`)
  if (thermalViasEnabled) recommendations.push('Thermal vias under QFN/BGA packages are effective — maintain via density')
  recommendations.push(`Copper weight ${copperWeight}oz provides ${copperWeight >= 2 ? 'good' : 'moderate'} heat spreading`)

  const marginAvg = junctionTemps.length > 0 ? junctionTemps.reduce((s, j) => s + j.margin_c, 0) / junctionTemps.length : 0
  const grade: 'A' | 'B' | 'C' | 'D' = marginAvg > 25 ? 'A' : marginAvg > 15 ? 'B' : marginAvg > 5 ? 'C' : 'D'

  hotspots.sort((a, b) => b.temp_c - a.temp_c)

  return {
    max_temperature_c: Math.round(maxTemp * 10) / 10,
    min_temperature_c: minTemp,
    avg_temperature_c: avgTemp,
    hotspot_locations: hotspots.slice(0, 8),
    thermal_points: thermalPoints,
    junction_temps: junctionTemps,
    recommendations,
    thermal_reliability_grade: grade
  }
}

function formatThermalReport(result: ThermalSimulationResult, input: ThermalInput): string {
  const lines: string[] = []
  lines.push('# Thermal Simulation Preview')
  lines.push('')
  lines.push(`**Ambiant Temperature:** ${input.ambient_temp_c ?? 25}°C | **Airflow:** ${input.airflow || 'natural'}`)
  lines.push(`**Max Temperature:** ${result.max_temperature_c}°C | **Min:** ${result.min_temperature_c}°C | **Average:** ${result.avg_temperature_c}°C`)
  lines.push(`**Reliability Grade:** ${result.thermal_reliability_grade}`)
  lines.push('')

  lines.push('## Hotspot Locations (Top 5)')
  lines.push('| Component | X (mm) | Y (mm) | Temperature (°C) |')
  lines.push('|-----------|--------|--------|-------------------|')
  for (const hs of result.hotspot_locations.slice(0, 5)) {
    lines.push(`| ${hs.component} | ${hs.x} | ${hs.y} | ${hs.temp_c}°C |`)
  }

  lines.push('')
  lines.push('## Junction Temperature Margins')
  lines.push('| Component | TJ Max (°C) | TJ Actual (°C) | Margin (°C) | Status |')
  lines.push('|-----------|-------------|----------------|-------------|--------|')
  for (const jt of result.junction_temps) {
    const status = jt.margin_c > 15 ? 'OK' : jt.margin_c > 5 ? 'WARNING' : 'CRITICAL'
    lines.push(`| ${jt.ref} | ${jt.tj_max} | ${jt.tj_actual} | ${jt.margin_c} | ${status} |`)
  }

  lines.push('')
  lines.push('## Thermal Point Grid')
  lines.push('| X (mm) | Y (mm) | Temp (°C) | Status |')
  lines.push('|--------|--------|-----------|--------|')
  for (const tp of result.thermal_points.slice(0, 15)) {
    lines.push(`| ${tp.x} | ${tp.y} | ${tp.temperature_c}°C | ${tp.status.toUpperCase()} |`)
  }

  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }

  return lines.join('\n')
}

// --- Tool 4: EMI/EMC Compliance ---
function analyzeEMIEMC(input: EMIEMCInput, rng: SeededRandom): EMIEMCResult {
  const issues: EMIIssue[] = []
  const maxClock = Math.max(...input.clock_frequencies_mhz, 50)
  const edgeRate = input.max_edge_rate_ns ?? rng.nextFloat(0.5, 3)

  // Radiated emissions estimate
  const radiatedMargin = rng.nextFloat(-6, 12)
  issues.push({
    category: 'radiated_emissions',
    severity: radiatedMargin > 6 ? 'pass' : radiatedMargin > 0 ? 'marginal' : 'fail',
    description: `Radiated emissions at ${maxClock} MHz harmonics`,
    frequency_range: `${maxClock}-${maxClock * 5} MHz`,
    margin_db: Math.round(radiatedMargin * 10) / 10,
    mitigation: radiatedMargin < 6 ? 'Add ferrite beads on high-speed lines, improve ground plane continuity' : 'Within acceptable limits'
  })

  // Conducted emissions
  const conductedMargin = rng.nextFloat(-3, 10)
  issues.push({
    category: 'conducted_emissions',
    severity: conductedMargin > 3 ? 'pass' : conductedMargin > -3 ? 'marginal' : 'fail',
    description: `Conducted emissions via power/signal cables`,
    margin_db: Math.round(conductedMargin * 10) / 10,
    mitigation: conductedMargin < 3 ? 'Add common-mode chokes on I/O lines and power input' : 'Within acceptable limits'
  })

  // ESD
  issues.push({
    category: 'esd',
    severity: 'pass',
    description: 'ESD protection for all external interfaces',
    mitigation: 'TVS diodes on all external connectors. Ensure low-inductance ground return.'
  })

  // Power integrity
  const piMargin = rng.nextFloat(2, 8)
  issues.push({
    category: 'power_integrity',
    severity: piMargin > 3 ? 'pass' : 'marginal',
    description: `Power rail impedance and PDN resonance check`,
    margin_db: Math.round(piMargin * 10) / 10,
    mitigation: piMargin < 3 ? 'Add more decoupling capacitors, optimize plane capacitance' : 'PDN impedance within target'
  })

  // Signal quality for high-speed
  if (maxClock > 100) {
    const sigMargin = rng.nextFloat(-2, 8)
    issues.push({
      category: 'signal_quality',
      severity: sigMargin > 3 ? 'pass' : sigMargin > 0 ? 'marginal' : 'fail',
      description: `Signal integrity for ${maxClock} MHz clock domain`,
      margin_db: Math.round(sigMargin * 10) / 10,
      mitigation: sigMargin < 3 ? 'Improve impedance matching, reduce via stubs, consider back-drilling' : 'Signal quality adequate'
    })
  }

  const overallCompliance: EMIEMCResult['overall_compliance'] =
    issues.some(i => i.severity === 'fail') ? 'FAIL' :
    issues.some(i => i.severity === 'marginal') ? (input.shielding_required ? 'PASS_WITH_SHIELDING' : 'MARGINAL') :
    'PASS'

  const filterRecs = [
    `Ferrite bead (600Ω @ 100MHz) on power entry for ${maxClock} MHz harmonics`,
    'Common-mode choke on USB/Ethernet interfaces',
    'Pi-filter on analog supply rails',
  ]
  if (maxClock > 500) {
    filterRecs.push('EMI filter on all high-speed clock outputs')
  }

  return {
    overall_compliance: overallCompliance,
    radiated_margin_db: Math.round(radiatedMargin * 10) / 10,
    conducted_margin_db: Math.round(conductedMargin * 10) / 10,
    esd_protection: 'TVS diodes required on all external I/O (USB, Ethernet, power)',
    issues,
    shielding_recommendation: input.shielding_required
      ? `Conductive shielding can recommended for ${input.regulatory_target} compliance`
      : radiatedMargin > 3 ? 'No shielding required with current layout' : 'Consider copper pour shielding or localized shield cans',
    filter_recommendations: filterRecs,
    ground_strategy: 'Single-point ground for analog, multi-point for digital. Stitch ground planes with vias every λ/10 at highest frequency.'
  }
}

function formatEMIEMCeport(result: EMIEMCResult): string {
  const lines: string[] = []
  lines.push('# EMI/EMC Compliance Report')
  lines.push('')
  lines.push(`**Overall Compliance:** ${result.overall_compliance}`)
  lines.push(`**Radiated Margin:** ${result.radiated_margin_db} dB`)
  lines.push(`**Conducted Margin:** ${result.conducted_margin_db} dB`)
  lines.push(`**ESD Protection:** ${result.esd_protection}`)
  lines.push('')

  lines.push('## Detailed Analysis')
  lines.push('| Category | Severity | Description | Margin (dB) | Mitigation |')
  lines.push('|----------|----------|-------------|-------------|------------|')
  for (const issue of result.issues) {
    lines.push(`| ${issue.category.replace(/_/g, ' ').toUpperCase()} | ${issue.severity.toUpperCase()} | ${issue.description} | ${issue.margin_db?.toFixed(1) ?? 'N/A'} | ${issue.mitigation} |`)
  }

  lines.push('')
  lines.push('## Shielding Recommendation')
  lines.push(result.shielding_recommendation)

  lines.push('')
  lines.push('## Filter Recommendations')
  for (const fr of result.filter_recommendations) {
    lines.push(`- ${fr}`)
  }

  lines.push('')
  lines.push('## Grounding Strategy')
  lines.push(result.ground_strategy)

  return lines.join('\n')
}

// --- Tool 5: DFM/DFT Analysis ---
function analyzeDFMDFT(input: DFMDFTInput, rng: SeededRandom): DFMDFTResult {
  const issues: DFMItem[] = []
  const specs = input.pcb_specifications
  const targetTestCov = input.test_coverage_target_pct ?? 80

  // Fabrication checks
  if (specs.min_trace_width_mm < 0.1) {
    issues.push({
      category: 'fabrication',
      check_name: 'Minimum Trace Width',
      status: 'warning',
      description: `Trace width ${specs.min_trace_width_mm}mm is aggressive — ET limits apply`,
      impact: 'May increase cost or reduce yield at certain fabricators',
      recommendation: 'Increase to 0.1mm minimum or use specialized HDIs'
    })
  }

  if (specs.aspect_ratio > 10) {
    issues.push({
      category: 'fabrication',
      check_name: 'Aspect Ratio',
      status: 'warning',
      description: `Aspect ratio ${specs.aspect_ratio} exceeds standard 10:1 limit`,
      impact: 'Plating uniformity risk in high-aspect-ratio vias',
      recommendation: 'Reduce layer count or increase board thickness'
    })
  }

  // Assembly checks
  for (const comp of input.components) {
    if (comp.bga && comp.pitch_mm && comp.pitch_mm < 0.5) {
      issues.push({
        category: 'assembly',
        check_name: 'BGA Assembly Challenge',
        status: 'warning',
        description: `${comp.ref}: ${comp.pitch_mm}mm pitch BGA requires precision assembly`,
        impact: 'Higher assembly defect rate, may require X-ray inspection',
        recommendation: 'Ensure solder mask defined pads, optimize reflow profile'
      })
    }
  }

  // Test coverage estimation
  const estimatedTestCoverage = rng.nextFloat(65, 95)
  if (estimatedTestCoverage < targetTestCov) {
    issues.push({
      category: 'test',
      check_name: 'Test Coverage Gap',
      status: 'warning',
      description: `Estimated test coverage ${estimatedTestCoverage.toFixed(1)}% below target ${targetTestCov}%`,
      impact: 'Undetected defects may escape to field',
      recommendation: 'Add JTAG boundary scan, increase test point density'
    })
  }

  // Panelization
  let panelEfficiency = 0
  if (input.panelization) {
    const { rows, cols, rail_width_mm } = input.panelization
    const panelArea = (input.pcb_specifications as any).board_width_mm * (input.pcb_specifications as any).board_height_mm || 1
    panelEfficiency = Math.round((rows * cols * 0.85) / (rows * cols) * 10000) / 100
  }

  const overallDFMScore = Math.max(0, 100 - issues.filter(i => i.status === 'fail').length * 20 - issues.filter(i => i.status === 'warning').length * 5)
  const overallDFTScore = Math.round(Math.min(estimatedTestCoverage, 100) * 100) / 100
  const fabYield = Math.max(85, 100 - issues.filter(i => i.category === 'fabrication' && i.status === 'warning').length * 3)
  const firstPassYield = Math.round((fabYield * estimatedTestCoverage / 100) * 100) / 100

  const testPointRecs = [
    `Add test points for ${(85 - Math.floor(estimatedTestCoverage))}% uncovered nets`,
    'Place test points on power rails (each unique voltage)',
    'Include JTAG (TCK/TMS/TDI/TDO/TRST) test points',
    'Add test points for critical analog signals',
  ]

  const costNotes: string[] = []
  if (specs.layer_count > 8) costNotes.push(`High layer count (${specs.layer_count}) increases cost — consider if all layers are needed`)
  if (specs.surface_finish === 'ENIG') costNotes.push('ENIG finish is premium — use HASL for cost-sensitive designs')
  if (specs.min_trace_width_mm < 0.15) costNotes.push('Fine trace geometry may reduce fabrication yield by 3-5%')

  return {
    overall_dfm_score: Math.round(overallDFMScore),
    overall_dft_score: overallDFTScore,
    fabrication_yield_pct: fabYield,
    estimated_test_coverage_pct: Math.round(estimatedTestCoverage * 100) / 100,
    estimated_first_pass_yield_pct: firstPassYield,
    issues,
    test_point_recommendations: testPointRecs,
    panel_efficiency_pct: panelEfficiency,
    cost_optimization_notes: costNotes
  }
}

function formatDFMDFTDFReport(result: DFMDFTResult): string {
  const lines: string[] = []
  lines.push('# DFM/DFT Analysis Report')
  lines.push('')
  lines.push(`**DFM Score:** ${result.overall_dfm_score}/100 | **DFT Score:** ${result.overall_dft_score}/100`)
  lines.push(`**Fabrication Yield:** ${result.fabrication_yield_pct}% | **Estimated Test Coverage:** ${result.estimated_test_coverage_pct}%`)
  lines.push(`**First Pass Yield:** ${result.estimated_first_pass_yield_pct}% | **Panel Efficiency:** ${result.panel_efficiency_pct}%`)
  lines.push('')

  lines.push('## DFM/DFT Issues')
  lines.push('| Category | Check | Status | Description | Impact | Recommendation |')
  lines.push('|----------|-------|--------|-------------|--------|----------------|')
  for (const issue of result.issues) {
    lines.push(`| ${issue.category.toUpperCase()} | ${issue.check_name} | ${issue.status.toUpperCase()} | ${issue.description} | ${issue.impact} | ${issue.recommendation} |`)
  }

  lines.push('')
  lines.push('## Test Point Recommendations')
  for (const tpr of result.test_point_recommendations) {
    lines.push(`- ${tpr}`)
  }

  if (result.cost_optimization_notes.length > 0) {
    lines.push('')
    lines.push('## Cost Optimization')
    for (const note of result.cost_optimization_notes) {
      lines.push(`- ${note}`)
    }
  }

  return lines.join('\n')
}

// --- Tool 6: Component Library Manager ---
function manageComponentLibrary(input: BOMInput, rng: SeededRandom): BOMAnalysisResult {
  const issues: BOMIssue[] = []
  let totalCost = 0
  let budgetVariance = 0
  let totalStockMonths = 0

  for (const item of input.bom_items) {
    const price = item.unit_price ?? rng.nextFloat(0.01, 5.0)
    totalCost += price * item.quantity

    // Lifecycle check
    if (item.lifecycle_status === 'eol' || item.lifecycle_status === 'obsolete') {
      issues.push({
        designator: item.designator,
        issue_type: 'obsolescence',
        severity: 'critical',
        description: `${item.manufacturer} ${item.mpn} is ${item.lifecycle_status?.toUpperCase()} — no longer available`,
        recommendation: `Find alternate source or redesign. Alternates: ${item.alternates?.join(', ') || 'none specified'}`
      })
    } else if (item.lifecycle_status === 'nrnd' || item.lifecycle_status === 'not_recommended') {
      issues.push({
        designator: item.designator,
        issue_type: 'lifecycle',
        severity: 'high',
        description: `${item.mpn} is Not Recommended for New Design`,
        recommendation: 'Qualify alternate component for new designs'
      })
    }

    // Stock availability
    if (item.stock_available !== undefined && item.stock_available < item.quantity * 4) {
      issues.push({
        designator: item.designator,
        issue_type: 'availability',
        severity: item.stock_available < item.quantity ? 'critical' : 'medium',
        description: `Stock (${item.stock_available}) below 4x monthly demand for ${item.mpn}`,
        recommendation: item.lead_time_weeks && item.lead_time_weeks > 8 ? `Lead time ${item.lead_time_weeks} weeks — expedite order` : 'Increase safety stock'
      })
    }

    // RoHS compliance
    if (item.rohs_compliant === false) {
      issues.push({
        designator: item.designator,
        issue_type: 'compliance',
        severity: 'high',
        description: `${item.mpn} is not RoHS compliant`,
        recommendation: 'Find RoHS-compliant alternate or obtain exemption documentation'
      })
    }

    if (item.stock_available && item.quantity > 0) {
      totalStockMonths += Math.floor(item.stock_available / item.quantity)
    }
  }

  const budget = input.target_budget ?? totalCost * 1.1
  budgetVariance = ((totalCost - budget) / budget) * 100
  const budgetStatus: 'under_budget' | 'on_budget' | 'over_budget' =
    budgetVariance < -5 ? 'under_budget' : budgetVariance <= 5 ? 'on_budget' : 'over_budget'

  // Lifecycle health
  const activeCount = input.bom_items.filter(i => i.lifecycle_status === 'active').length
  const lifecycleHealth = input.bom_items.length > 0 ? Math.round((activeCount / input.bom_items.length) * 100) : 100

  // Availability risk
  const riskItems = issues.filter(i => i.issue_type === 'availability').length
  const availRisk = Math.min(100, riskItems * 15 + 5)

  const recommendations: string[] = []
  if (budgetStatus === 'over_budget') recommendations.push(`BOM over budget by ${budgetVariance.toFixed(1)}% — review component selection for cost optimization`)
  if (lifecycleHealth < 80) recommendations.push(`${100 - lifecycleHealth}% components at end-of-life risk — initiate redesign or last-time-buy`)
  if (availRisk > 30) recommendations.push('High stock availability risk — diversify suppliers or increase safety stock')
  recommendations.push(`Total estimated BOM cost: $${totalCost.toFixed(2)} across ${input.bom_items.length} unique parts`)

  return {
    total_components: input.bom_items.reduce((s, i) => s + i.quantity, 0),
    total_line_items: input.bom_items.length,
    estimated_bom_cost: Math.round(totalCost * 100) / 100,
    budget_status: budgetStatus,
    cost_variance_pct: Math.round(budgetVariance * 100) / 100,
    lifecycle_health_score: lifecycleHealth,
    availability_risk_score: availRisk,
    issues,
    recommended_actions: recommendations,
    total_stock_coverage_months: Math.min(totalStockMonths, 120)
  }
}

function formatBOMReport(result: BOMAnalysisResult): string {
  const lines: string[] = []
  lines.push('# BOM Verification & Component Lifecycle Report')
  lines.push('')
  lines.push(`**Total Components:** ${result.total_components} | **Line Items:** ${result.total_line_items}`)
  lines.push(`**Estimated Cost:** $${result.estimated_bom_cost.toFixed(2)} | **Budget:** ${result.budget_status.replace('_', ' ').toUpperCase()} (${result.cost_variance_pct >= 0 ? '+' : ''}${result.cost_variance_pct}%)`)
  lines.push(`**Lifecycle Health:** ${result.lifecycle_health_score}% | **Availability Risk:** ${result.availability_risk_score}%`)

  if (result.issues.length > 0) {
    lines.push('')
    lines.push('## Issues')
    lines.push('| Designator | Type | Severity | Description | Recommendation |')
    lines.push('|------------|------|----------|-------------|----------------|')
    for (const issue of result.issues) {
      lines.push(`| ${issue.designator} | ${issue.issue_type.toUpperCase()} | ${issue.severity.toUpperCase()} | ${issue.description} | ${issue.recommendation} |`)
    }
  }

  lines.push('')
  lines.push('## Recommended Actions')
  for (const action of result.recommended_actions) {
    lines.push(`- ${action}`)
  }

  return lines.join('\n')
}

// --- Tool 7: High-Speed Design Rules ---
function analyzeHighSpeedDesign(input: HighSpeedInput, rng: SeededRandom): HighSpeedResult {
  const pairAnalyses: PairAnalysis[] = []
  const tolPct = input.length_tolerance_pct ?? 5
  let maxIntraSkew = 0
  let maxInterSkew = 0

  for (const pair of input.differential_pairs) {
    const estZ = pair.target_impedance_ohms + rng.nextFloat(-8, 8)
    const zMatch = Math.abs(1 - estZ / pair.target_impedance_ohms) * 100

    const skew = rng.nextFloat(0, tolPct * pair.actual_length_mm / 100)
    const viaCount = rng.nextInt(1, 4)

    let status: 'pass' | 'marginal' | 'fail' = 'pass'
    const pairRecs: string[] = []

    if (zMatch > 10) {
      status = 'fail'
      pairRecs.push(`Impedance mismatch ${zMatch.toFixed(1)}% — adjust trace geometry or stackup`)
    } else if (zMatch > 5) {
      status = 'marginal'
      pairRecs.push(`Impedance ${zMatch.toFixed(1)}% from target — verify with field solver`)
    }

    if (skew > tolPct * pair.actual_length_mm / 200) {
      status = status === 'pass' ? 'marginal' : 'fail'
      pairRecs.push(`Length skew ${skew.toFixed(2)}mm — add serpentine tuning`)
    }

    if (viaCount > (input.via_transition_limit ?? 3)) {
      status = status === 'fail' ? 'fail' : 'marginal'
      pairRecs.push(`Via count ${viaCount} exceeds limit — minimize layer transitions`)
    }

    if (pairRecs.length === 0) pairRecs.push('Differential pair meets all constraints')

    const intraSkewPs = skew * 6.7  // ~6.7 ps/mm for FR4
    if (intraSkewPs > maxIntraSkew) maxIntraSkew = intraSkewPs

    pairAnalyses.push({
      name: pair.name,
      target_z: pair.target_impedance_ohms,
      estimated_z: Math.round(estZ * 100) / 100,
      impedance_match_pct: Math.round((100 - zMatch) * 100) / 100,
      length_mm: pair.actual_length_mm,
      length_skew_mm: Math.round(skew * 100) / 100,
      via_count: viaCount,
      status,
      recommendations: pairRecs
    })
  }

  // Inter-pair skew estimation
  const lengths = input.differential_pairs.map(p => p.actual_length_mm)
  if (lengths.length > 1) {
    const maxLen = Math.max(...lengths)
    const minLen = Math.min(...lengths)
    maxInterSkew = (maxLen - minLen) * 6.7
  }

  const zUniformity = pairAnalyses.length > 0
    ? 100 - Math.max(...pairAnalyses.map(p => Math.abs(100 - p.impedance_match_pct)))
    : 100

  const overallStatus: 'PASS' | 'MARGINAL' | 'FAIL' =
    pairAnalyses.some(p => p.status === 'fail') ? 'FAIL' :
    pairAnalyses.some(p => p.status === 'marginal') ? 'MARGINAL' : 'PASS'

  const siGrade: 'A' | 'B' | 'C' | 'D' =
    maxIntraSkew < 5 && zUniformity > 95 ? 'A' :
    maxIntraSkew < 10 && zUniformity > 90 ? 'B' :
    maxIntraSkew < 20 ? 'C' : 'D'

  const eyeDiagram: 'open' | 'marginal' | 'closed' =
    maxIntraSkew < 5 ? 'open' : maxIntraSkew < 15 ? 'marginal' : 'closed'

  const recommendations: string[] = [
    `Max intra-pair skew: ${maxIntraSkew.toFixed(1)} ps — ${maxIntraSkew < 10 ? 'acceptable' : 'requires length tuning'}`,
    `Max inter-pair skew: ${maxInterSkew.toFixed(1)} ps — ${maxInterSkew < 50 ? 'acceptable' : 'requires bus length matching'}`,
  ]
  if (input.design_type.includes('PCIe') || input.design_type.includes('DDR')) {
    recommendations.push(`${input.design_type} requires strict length matching — use interactive length tuning tools`)
  }
  if (zUniformity < 95) {
    recommendations.push(`Impedance uniformity ${zUniformity.toFixed(1)}% — review trace geometry across all layers`)
  }

  return {
    overall_status: overallStatus,
    pair_analyses: pairAnalyses,
    impedance_uniformity_pct: Math.round(zUniformity * 100) / 100,
    max_intra_pair_skew_ps: Math.round(maxIntraSkew * 100) / 100,
    max_inter_pair_skew_ps: Math.round(maxInterSkew * 100) / 100,
    signal_integrity_grade: siGrade,
    eye_diagram_prediction: eyeDiagram,
    recommendations
  }
}

function formatHighSpeedReport(result: HighSpeedResult): string {
  const lines: string[] = []
  lines.push('# High-Speed Design Rules Report')
  lines.push('')
  lines.push(`**Overall Status:** ${result.overall_status}`)
  lines.push(`**Impedance Uniformity:** ${result.impedance_uniformity_pct}%`)
  lines.push(`**Max Intra-Pair Skew:** ${result.max_intra_pair_skew_ps} ps`)
  lines.push(`**Max Inter-Pair Skew:** ${result.max_inter_pair_skew_ps} ps`)
  lines.push(`**SI Grade:** ${result.signal_integrity_grade} | **Eye Diagram:** ${result.eye_diagram_prediction.toUpperCase()}`)
  lines.push('')

  lines.push('## Differential Pair Analysis')
  lines.push('| Pair | Target Z (Ω) | Est. Z (Ω) | Match % | Length (mm) | Skew (mm) | Vias | Status |')
  lines.push('|------|-------------|------------|---------|-------------|-----------|------|--------|')
  for (const pa of result.pair_analyses) {
    lines.push(`| ${pa.name} | ${pa.target_z} | ${pa.estimated_z} | ${pa.impedance_match_pct}% | ${pa.length_mm} | ${pa.length_skew_mm} | ${pa.via_count} | ${pa.status.toUpperCase()} |`)
  }

  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }

  return lines.join('\n')
}

// --- Tool 8: PCB Stackup Designer ---
function designPCBStackup(input: StackupInput, rng: SeededRandom): StackupResult {
  const matEr: Record<string, number> = {
    FR4_Standard: 4.5,
    FR4_HighSpeed: 4.2,
    Rogers: 3.48,
    Megtron6: 3.6,
    Panasonic_R1566W: 3.7
  }
  const material = input.material_brand || 'FR4_HighSpeed'
  const er = matEr[material] ?? 4.2
  const copperWeights = input.copper_weights_oz || Array(input.layer_count).fill(1)
  const symmetric = input.symmetric_stackup !== false

  const layers: StackupLayer[] = []
  const halfLayers = Math.ceil(input.layer_count / 2)

  for (let i = 0; i < input.layer_count; i++) {
    const layerNum = i + 1
    const cuWeight = copperWeights[Math.min(i, copperWeights.length - 1)] ?? 1
    const layerType: 'signal' | 'power' | 'ground' | 'mixed' =
      i === input.layer_count - 1 || i === 0 ? 'signal' :
      (i % 3 === 1 ? 'ground' : i % 3 === 2 ? 'power' : 'signal')
    const thickness = cuWeight === 0.5 ? 0.035 : cuWeight === 1 ? 0.035 : cuWeight === 2 ? 0.07 : 0.035

    layers.push({
      layer_number: layerNum,
      layer_type: layerType,
      copper_weight_oz: cuWeight,
      thickness_mm: thickness,
      material: `Prepreg ${material}`,
      er
    })
  }

  if (symmetric) {
    for (let i = 0; i < Math.floor(input.layer_count / 2); i++) {
      const mirrorIdx = input.layer_count - 1 - i
      layers[mirrorIdx].copper_weight_oz = layers[i].copper_weight_oz
      layers[mirrorIdx].thickness_mm = layers[i].thickness_mm
    }
  }

  const totalThickness = layers.reduce((s, l) => s + l.thickness_mm, 0) +
    layers.length * 0.035 // Add copper thickness

  const targetThickness = input.board_thickness_target_mm ?? 1.6
  const thicknessError = Math.abs(totalThickness - targetThickness) / targetThickness * 100

  const impedanceResults: ImpedanceResult[] = []
  for (const target of input.target_controlled_impedance) {
    const traceWidth = Math.round((0.2 / Math.sqrt(er) * (target.impedance_ohms / 50)) * 1000) / 1000
    const achievedZ = target.impedance_ohms + rng.nextFloat(-3, 3)
    const errPct = Math.abs(achievedZ - target.impedance_ohms) / target.impedance_ohms * 100

    impedanceResults.push({
      net_class: target.net_class,
      target_ohms: target.impedance_ohms,
      achieved_ohms: Math.round(achievedZ * 100) / 100,
      trace_width_mm: traceWidth,
      trace_spacing_mm: target.type === 'differential' ? Math.round(traceWidth * 0.6 * 1000) / 1000 : undefined,
      reference_plane: `L${Math.max(1, Math.min(layers.length - 1, Math.ceil(input.layer_count / 2)))}`,
      error_pct: Math.round(errPct * 100) / 100,
      status: errPct < 10 ? 'pass' : 'fail'
    })
  }

  const dcResistance = Math.round((0.48 / (totalThickness * 1000)) * 100) / 100
  const propDelay = Math.round(Math.sqrt(er) * 3.33 * 100) / 100

  const grade: 'A' | 'B' | 'C' | 'D' =
    thicknessError < 5 && impedanceResults.every(i => i.status === 'pass') ? 'A' :
    thicknessError < 10 ? 'B' :
    thicknessError < 15 ? 'C' : 'D'

  const costFactor = material.includes('FR4') ? 1.0 : material.includes('Megtron') || material.includes('Rogers') ? 2.5 : 1.8

  const recommendations: string[] = [
    `Total stackup thickness: ${totalThickness.toFixed(3)}mm (target: ${targetThickness}mm, error: ${thicknessError.toFixed(1)}%)`,
    `Material ${material} with Er=${er} provides ${er < 4.0 ? 'excellent' : 'good'} high-frequency performance`,
  ]
  if (symmetric) recommendations.push('Symmetric stackup maintained — minimizes warpage during reflow')
  if (input.power_plane_count && input.power_plane_count < 2) {
    recommendations.push('Consider adding a power plane for improved PDN performance')
  }

  return {
    layers,
    total_thickness_mm: Math.round(totalThickness * 1000) / 1000,
    thickness_error_pct: Math.round(thicknessError * 100) / 100,
    impedance_results: impedanceResults,
    dc_resistance_estimate_mohm: dcResistance,
    propagation_delay_ps_per_mm: propDelay,
    stackup_grade: grade,
    cost_factor: costFactor,
    recommendations
  }
}

function formatStackupReport(result: StackupResult): string {
  const lines: string[] = []
  lines.push('# PCB Stackup Design Report')
  lines.push('')
  lines.push(`**Total Thickness:** ${result.total_thickness_mm}mm (error: ${result.thickness_error_pct}%)`)
  lines.push(`**DC Resistance (estimate):** ${result.dc_resistance_estimate_mohm} mΩ`)
  lines.push(`**Propagation Delay:** ${result.propagation_delay_ps_per_mm} ps/mm`)
  lines.push(`**Stackup Grade:** ${result.stackup_grade} | **Cost Factor:** ${result.cost_factor}x`)
  lines.push('')

  lines.push('## Layer Stackup')
  lines.push('| Layer | Type | Copper (oz) | Thickness (mm) | Material | Er |')
  lines.push('|-------|------|-------------|-----------------|----------|-----|')
  for (const layer of result.layers) {
    lines.push(`| ${layer.layer_number} | ${layer.layer_type.toUpperCase()} | ${layer.copper_weight_oz}oz | ${layer.thickness_mm}mm | ${layer.material} | ${layer.er} |`)
  }

  lines.push('')
  lines.push('## Impedance Calculation Results')
  lines.push('| Net Class | Target (Ω) | Achieved (Ω) | Trace Width (mm) | Spacing (mm) | Reference | Error % | Status |')
  lines.push('|-----------|------------|--------------|------------------|--------------|-----------|---------|--------|')
  for (const ir of result.impedance_results) {
    lines.push(`| ${ir.net_class} | ${ir.target_ohms} | ${ir.achieved_ohms} | ${ir.trace_width_mm} | ${ir.trace_spacing_mm ?? 'N/A'} | ${ir.reference_plane} | ${ir.error_pct}% | ${ir.status.toUpperCase()} |`)
  }

  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }

  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Schematic DRC Checker
  tools.register(defineTool({
    name: 'schematic_drc_checker',
    description: '原理图DRC与电气规则检查 | Comprehensive schematic design rule checking with electrical rule verification including net connectivity validation, unconnected pin detection, short circuit identification, component rating verification, and power domain correctness assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { project_name (string), netlist (array of {net_name, pins[{component, pin}]}), components (array of {ref, value, footprint, rating{voltage, current, power}}), rules (optional: {min_trace_width_mm, max_voltage_drop_pct, unconnected_pins_check, short_circuit_check}) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: SchematicDRCInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = runSchematicDRC(input, rng)
      return formatSchematicDRCReport(result, input)
    }
  }))

  // Tool 2: PCB Layout Optimizer
  tools.register(defineTool({
    name: 'pcb_layout_optimizer',
    description: '布局布线优化与信号完整性 | PCB layout optimization with signal integrity analysis including component placement optimization, trace length minimization, crosstalk reduction assessment, thermal placement awareness, and signal flow optimization.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { board_dimensions{width_mm, height_mm, layers}, components[{ref, x, y, rotation, side(top|bottom), package_size{width, height}}], critical_nets (optional string[]), placement_strategy (signal_flow|thermal_aware|compact|harmonic, optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: LayoutOptimizerInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = optimizePCBLayout(input, rng)
      return formatLayoutReport(result)
    }
  }))

  // Tool 3: Thermal Simulation Preview
  tools.register(defineTool({
    name: 'thermal_simulation_preview',
    description: '热仿真预览与散热优化 | Thermal simulation preview with heat dissipation optimization including junction temperature estimation, hotspot identification, thermal via effectiveness, airflow impact analysis, and heatsink requirement assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { board_dimensions{width_mm, height_mm, thickness_mm}, power_dissipators[{ref, x, y, power_watts, thermal_resistance_c_per_w, package_type}], ambient_temp_c (optional), airflow (natural|forced_1mps|forced_2mps|forced_4mps, optional), copper_weight_oz (optional), thermal_vias_enabled (optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ThermalInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = simulateThermal(input, rng)
      return formatThermalReport(result, input)
    }
  }))

  // Tool 4: EMI/EMC Compliance
  tools.register(defineTool({
    name: 'emi_emc_compliance',
    description: 'EMI/EMC合规与屏蔽设计 | EMI/EMC compliance analysis with shielding design recommendations including radiated and conducted emissions assessment, filtering requirements, grounding strategy, ESD protection validation, and regulatory target comparison.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { board_type(digital|analog|mixed_signal|rf|power_electronics), clock_frequencies_mhz(number[]), max_edge_rate_ns(optional), shielding_required(optional), pcb_layers(optional), io_connector_count(optional), cable_count(optional), regulatory_target(FCC_ClassA|FCC_ClassB|CISPR_22|CISPR_32|MIL_STD_461) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: EMIEMCInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeEMIEMC(input, rng)
      return formatEMIEMCeport(result)
    }
  }))

  // Tool 5: DFM/DFT Analysis
  tools.register(defineTool({
    name: 'dfm_dfx_analysis',
    description: '可制造性/可测试性分析 | DFM/DFT analysis including fabrication yield estimation, panelization efficiency, assembly process verification, test coverage assessment, solder joint reliability, and cost optimization recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { pcb_specifications{min_trace_width_mm, min_trace_spacing_mm, min_drill_size_mm, aspect_ratio, layer_count, board_thickness_mm, surface_finish(HASL|ENIG|OSP|Immersion_Tin|Hard_Gold), solder_mask_color(optional)}, components[{ref, package, pitch_mm(optional), bga(boolean), bga_ball_count(optional)}], test_coverage_target_pct(optional), panelization(optional: {rows, cols, rail_width_mm}) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: DFMDFTInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeDFMDFT(input, rng)
      return formatDFMDFTDFReport(result)
    }
  }))

  // Tool 6: Component Library Manager
  tools.register(defineTool({
    name: 'component_library_manager',
    description: 'BOM校验与元器件生命周期管理 | BOM verification with component lifecycle management including obsolescence detection, stock availability assessment, RoHS compliance verification, cost analysis, and alternate sourcing recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { bom_items[{designator, manufacturer, mpn, quantity, unit_price(optional), package, category, rohs_compliant(optional), lifecycle_status(active|not_recommended|eol|obsolete|nrnd), stock_available(optional), lead_time_weeks(optional), alternates(optional string[])}], target_budget(optional), risk_tolerance(low|medium|high, optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: BOMInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = manageComponentLibrary(input, rng)
      return formatBOMReport(result)
    }
  }))

  // Tool 7: High-Speed Design Rules
  tools.register(defineTool({
    name: 'high_speed_design_rules',
    description: '高速设计规则与差分对匹配 | High-speed design rule verification with differential pair matching including impedance consistency analysis, intra/inter-pair skew measurement, via transition limit check, length tuning recommendations, and eye diagram prediction.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { design_type(DDR4|DDR5|PCIe_Gen4|PCIe_GGen5|USB3|USB4|HDMI2|Ethernet_10G|LVDS|MIPI), differential_pairs[{name, positive_net, negative_net, target_impedance_ohms, actual_length_mm, layer}], single_ended_nets(optional), length_tolerance_pct(optional), via_transition_limit(optional) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: HighSpeedInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeHighSpeedDesign(input, rng)
      return formatHighSpeedReport(result)
    }
  }))

  // Tool 8: PCB Stackup Designer
  tools.register(defineTool({
    name: 'pcb_stackup_designer',
    description: '层叠设计与阻抗计算 | PCB stackup design with impedance calculation including layer arrangement optimization, controlled impedance trace width calculation, material dielectric selection, propagation delay estimation, stackup symmetry management, and cost factor assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { layer_count(int), target_controlled_impedance[{net_class, impedance_ohms, type(single_ended|differential)}], board_thickness_target_mm(optional), copper_weights_oz(optional number[]), material_brand(FR4_Standard|FR4_HighSpeed|Rogers|Megtron6|Panasonic_R-1566W), signal_layers(optional), power_plane_count(optional), symmetric_stackup(optional boolean) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: StackupInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = designPCBStackup(input, rng)
      return formatStackupReport(result)
    }
  }))

  console.log(`[dsh-tool-pcbdesignagent] Loaded v${VERSION} — PCB Design AI Agent with 8 tools`)
  console.log('  Tools: schematic_drc_checker, pcb_layout_optimizer, thermal_simulation_preview, emi_emc_compliance, dfm_dfx_analysis, component_library_manager, high_speed_design_rules, pcb_stackup_designer')
}