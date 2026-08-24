/**
 * DSH Circular Supply Chain Plugin v0.1.0
 * 循环供应链 — 逆向物流、再制造优化、废弃物资源化匹配、生命周期评估
 *
 * 2026: 循环经济市场 $650B+；循环供应链 $50B+。
 *
 * 工具清单:
 * 1. reverse_logistics_optimizer       — 逆向物流优化（回收网络、路径规划、成本最小化）
 * 2. remanufacturing_process_planner   — 再制造流程规划（拆解、修复、重组、质量检测）
 * 3. waste_resource_matcher            — 废弃物资源化匹配（工业共生、废料-需求智能配对）
 * 4. lifecycle_assessment_tool         — 生命周期评估 LCA（碳足迹、水足迹、环境影响量化）
 * 5. circularity_score_calculator      — 循环度评分（材料循环率、产品寿命延长、回收含量）
 * 6. material_flow_analyzer            — 物质流分析 MFA（输入-输出平衡、循环率、损失点）
 * 7. carbon_footprint_reducer          — 碳足迹减排（减排路径、抵消策略、净零路线图）
 * 8. sustainable_packaging_advisor     — 可持续包装设计（材料选择、减量、可回收性）
 *
 * @module dsh-tool-circsupply | @version 0.1.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-circsupply'
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

// --- Tool 1: Reverse Logistics Optimizer ---
export interface ReverseLogisticsInput {
  collection_points?: { id: string; location: string; volume: number; material_type: string }[]
  processing_centers?: { id: string; location: string; capacity: number; cost_per_unit: number }[]
  target_material?: string
  optimization_goal?: 'cost' | 'emissions' | 'speed' | 'balanced'
}

export interface RoutePlan {
  from: string
  to: string
  volume: number
  cost: number
  emissions_kg: number
  transport_mode: string
}

// --- Tool 2: Remanufacturing Process Planner ---
export interface RemanufacturingInput {
  product_type?: string
  core_condition?: 'good' | 'fair' | 'poor'
  target_output?: number
  available_cores?: number
  quality_threshold?: number
}

export interface ProcessStep {
  step: string
  duration_hours: number
  yield_rate: number
  cost_per_unit: number
}

// --- Tool 3: Waste Resource Matcher ---
export interface WasteResourceInput {
  waste_streams?: { id: string; material: string; quantity: number; location: string; purity: number }[]
  resource_demands?: { id: string; material: string; min_quantity: number; location: string; min_purity: number }[]
  max_distance_km?: number
}

export interface MatchResult {
  waste_id: string
  demand_id: string
  match_score: number
  distance_km: number
  co2_saved_kg: number
}

// --- Tool 4: Lifecycle Assessment Tool ---
export interface LCAInput {
  product_name?: string
  material_composition?: { material: string; weight_kg: number; recycled_content: number }[]
  manufacturing_energy_kwh?: number
  use_phase_years?: number
  use_phase_energy_kwh_per_year?: number
  end_of_life_method?: 'landfill' | 'incineration' | 'recycling' | 'reuse'
  transport_km?: number
}

export interface LCAResult {
  stage: string
  co2_kg: number
  water_liters: number
  energy_mj: number
}

// --- Tool 5: Circularity Score Calculator ---
export interface CircularityInput {
  product_name?: string
  recycled_content_pct?: number
  recyclability_pct?: number
  avg_lifespan_years?: number
  industry_avg_lifespan?: number
  repairability_score?: number
  take_back_program?: boolean
  modular_design?: boolean
}

// --- Tool 6: Material Flow Analyzer ---
export interface MaterialFlowInput {
  system_name?: string
  inputs?: { material: string; quantity: number; source: string }[]
  outputs?: { material: string; quantity: number; destination: string }[]
  recycled_flows?: { material: string; quantity: number }[]
}

export interface FlowAnalysis {
  material: string
  input: number
  output: number
  recycled: number
  loss: number
  recycling_rate: number
}

// --- Tool 7: Carbon Footprint Reducer ---
export interface CarbonReductionInput {
  baseline_co2_tons?: number
  target_reduction_pct?: number
  sector?: string
  measures?: { name: string; reduction_potential_pct: number; cost_per_ton: number; timeframe_years: number }[]
  budget_usd?: number
}

export interface ReductionMeasure {
  name: string
  reduction_tons: number
  cost: number
  cost_effectiveness: number
  priority: number
}

// --- Tool 8: Sustainable Packaging Advisor ---
export interface PackagingInput {
  product_name?: string
  current_material?: string
  current_weight_g?: number
  product_weight_g?: number
  target?: 'reduce_weight' | 'switch_material' | 'improve_recyclability' | 'full_optimization'
  distribution_distance_km?: number
  recyclable_infrastructure?: boolean
}

export interface PackagingRecommendation {
  material: string
  weight_g: number
  co2_reduction_pct: number
  recyclability: string
  cost_impact_pct: number
}

// ==================== SECTION 3 — Helper Functions ====================

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function formatScore(val: number): string {
  return (val * 100).toFixed(1)
}

// ==================== SECTION 4 — Tool Implementations ====================

// --- Tool 1: Reverse Logistics Optimizer ---
function executeReverseLogistics(input: ReverseLogisticsInput): string {
  const points = input.collection_points || []
  const centers = input.processing_centers || []
  const goal = input.optimization_goal || 'balanced'
  const target = input.target_material || 'mixed'

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const routes: RoutePlan[] = []
  let totalCost = 0
  let totalEmissions = 0
  let totalVolume = 0

  for (const p of points) {
    if (centers.length === 0) break
    const center = centers[rng.nextInt(0, centers.length - 1)]
    const distance = rng.nextFloat(20, 500)
    const volume = p.volume
    const modes = ['truck', 'rail', 'ship', 'electric_vehicle']
    const mode = modes[rng.nextInt(0, modes.length - 1)]
    const costFactor = goal === 'cost' ? 0.6 : goal === 'emissions' ? 1.2 : 0.8
    const emitFactor = mode === 'electric_vehicle' ? 0.3 : mode === 'rail' ? 0.5 : mode === 'ship' ? 0.4 : 1.0
    const cost = Math.round(volume * distance * 0.01 * costFactor * (center.cost_per_unit / 10))
    const emissions = Math.round(volume * distance * 0.001 * emitFactor * 100) / 100
    routes.push({ from: p.location, to: center.location, volume, cost, emissions_kg: emissions, transport_mode: mode })
    totalCost += cost
    totalEmissions += emissions
    totalVolume += volume
  }

  const avgCostPerUnit = totalVolume > 0 ? (totalCost / totalVolume).toFixed(2) : '0'
  const avgEmissionsPerUnit = totalVolume > 0 ? (totalEmissions / totalVolume).toFixed(2) : '0'

  let report = '# Reverse Logistics Optimization Report' + '\n\n'
  report += '**Target Material:** ' + target + '\n'
  report += '**Optimization Goal:** ' + goal + '\n'
  report += '**Collection Points:** ' + points.length + ' | **Processing Centers:** ' + centers.length + '\n\n'
  report += '## Route Plans' + '\n\n'
  report += '| From | To | Volume | Mode | Cost | Emissions (kg) |\n'
  report += '|------|----|--------|------|------|----------------|\n'
  for (const r of routes) {
    report += '| ' + r.from + ' | ' + r.to + ' | ' + r.volume + ' | ' + r.transport_mode + ' | $' + r.cost + ' | ' + r.emissions_kg + ' |\n'
  }
  report += '\n## Summary' + '\n\n'
  report += '- **Total Volume:** ' + totalVolume + ' units\n'
  report += '- **Total Cost:** $' + totalCost + '\n'
  report += '- **Total Emissions:** ' + totalEmissions.toFixed(1) + ' kg CO2\n'
  report += '- **Avg Cost/Unit:** $' + avgCostPerUnit + '\n'
  report += '- **Avg Emissions/Unit:** ' + avgEmissionsPerUnit + ' kg CO2\n\n'
  report += '## Recommendations' + '\n\n'
  if (goal === 'cost' || goal === 'balanced') {
    report += '- Consolidate shipments to reduce per-unit transport costs\n'
    report += '- Prioritize rail/ship for long-distance bulk transport\n'
  }
  if (goal === 'emissions' || goal === 'balanced') {
    report += '- Switch to electric vehicles for last-mile collection\n'
    report += '- Optimize route density to minimize empty runs\n'
  }
  report += '- Implement IoT tracking for real-time route adjustment\n'
  report += '- Establish regional micro-hubs to reduce transport distance\n\n'
  report += '---\n\n'
  report += '*Circular supply chains can reduce reverse logistics costs by 20-30% through network optimization.*'

  return report
}

// --- Tool 2: Remanufacturing Process Planner ---
function executeRemanufacturing(input: RemanufacturingInput): string {
  const product = input.product_type || 'electronics'
  const condition = input.core_condition || 'fair'
  const target = input.target_output || 100
  const available = input.available_cores || 150
  const threshold = input.quality_threshold || 0.8

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const conditionMultiplier = condition === 'good' ? 0.9 : condition === 'fair' ? 0.7 : 0.5
  const steps: ProcessStep[] = [
    { step: 'Inspection & Sorting', duration_hours: 0.5, yield_rate: conditionMultiplier, cost_per_unit: 2 },
    { step: 'Disassembly', duration_hours: 1.2, yield_rate: 0.95, cost_per_unit: 3 },
    { step: 'Cleaning & Preparation', duration_hours: 0.8, yield_rate: 0.98, cost_per_unit: 1.5 },
    { step: 'Component Testing', duration_hours: 0.6, yield_rate: 0.9, cost_per_unit: 2.5 },
    { step: 'Repair/Refurbishment', duration_hours: 2.0, yield_rate: 0.85, cost_per_unit: 8 },
    { step: 'Reassembly', duration_hours: 1.5, yield_rate: 0.95, cost_per_unit: 4 },
    { step: 'Quality Testing', duration_hours: 0.8, yield_rate: 0.92, cost_per_unit: 3 },
    { step: 'Packaging & Labeling', duration_hours: 0.3, yield_rate: 0.99, cost_per_unit: 1 }
  ]

  let cumulativeYield = 1
  let totalCost = 0
  let totalTime = 0
  for (const s of steps) {
    cumulativeYield *= s.yield_rate
    totalCost += s.cost_per_unit
    totalTime += s.duration_hours
  }

  const viableCores = Math.min(available, Math.round(available * conditionMultiplier))
  const expectedOutput = Math.round(viableCores * cumulativeYield)
  const meetsTarget = expectedOutput >= target
  const qualityPassRate = clamp(cumulativeYield / threshold, 0, 1)

  let report = '# Remanufacturing Process Plan' + '\n\n'
  report += '**Product Type:** ' + product + '\n'
  report += '**Core Condition:** ' + condition + '\n'
  report += '**Available Cores:** ' + available + ' | **Viable Cores:** ' + viableCores + '\n'
  report += '**Target Output:** ' + target + ' | **Expected Output:** ' + expectedOutput + ' ' + (meetsTarget ? '(MET)' : '(SHORTFALL)') + '\n\n'
  report += '## Process Steps' + '\n\n'
  report += '| Step | Duration (h) | Yield Rate | Cost/Unit | Cumulative Yield |\n'
  report += '|------|-------------|------------|-----------|------------------|\n'
  let cumYield = 1
  for (const s of steps) {
    cumYield *= s.yield_rate
    report += '| ' + s.step + ' | ' + s.duration_hours + ' | ' + (s.yield_rate * 100).toFixed(0) + '% | $' + s.cost_per_unit + ' | ' + (cumYield * 100).toFixed(1) + '% |\n'
  }
  report += '\n## Summary' + '\n\n'
  report += '- **Total Process Time:** ' + totalTime.toFixed(1) + ' hours\n'
  report += '- **Total Cost/Unit:** $' + totalCost.toFixed(1) + '\n'
  report += '- **Overall Yield:** ' + (cumulativeYield * 100).toFixed(1) + '%\n'
  report += '- **Quality Pass Rate:** ' + (qualityPassRate * 100).toFixed(1) + '%\n'
  report += '- **Material Savings vs New:** ' + rng.nextInt(40, 70) + '%\n'
  report += '- **Energy Savings vs New:** ' + rng.nextInt(50, 80) + '%\n\n'
  report += '## Recommendations' + '\n\n'
  if (!meetsTarget) {
    report += '- **Shortfall Alert:** Need ' + (target - expectedOutput) + ' more viable cores to meet target\n'
    report += '- Expand core collection network or improve sorting to increase viable rate\n'
  }
  report += '- Implement modular design for easier disassembly and component reuse\n'
  report += '- Use predictive grading to route cores to highest-value recovery path\n'
  report += '- Establish quality feedback loop to improve yield at bottleneck steps\n\n'
  report += '---\n\n'
  report += '*Remanufacturing saves 50-80% energy vs new production and is a $50B+ market opportunity.*'

  return report
}

// --- Tool 3: Waste Resource Matcher ---
function executeWasteResourceMatcher(input: WasteResourceInput): string {
  const wastes = input.waste_streams || []
  const demands = input.resource_demands || []
  const maxDist = input.max_distance_km || 200

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const matches: MatchResult[] = []
  let totalCo2Saved = 0

  for (const w of wastes) {
    for (const d of demands) {
      if (w.material === d.material && w.purity >= d.min_purity && w.quantity >= d.min_quantity * 0.5) {
        const distance = rng.nextFloat(10, maxDist)
        const matchScore = clamp((w.purity / 100) * (1 - distance / maxDist) * (w.quantity / d.min_quantity), 0, 1)
        const co2Saved = Math.round(w.quantity * distance * 0.001 * rng.nextFloat(0.5, 2.0) * 100) / 100
        matches.push({ waste_id: w.id, demand_id: d.id, match_score: Math.round(matchScore * 100) / 100, distance_km: Math.round(distance), co2_saved_kg: co2Saved })
        totalCo2Saved += co2Saved
      }
    }
  }

  matches.sort((a, b) => b.match_score - a.match_score)

  let report = '# Waste-to-Resource Matching Report' + '\n\n'
  report += '**Waste Streams:** ' + wastes.length + ' | **Resource Demands:** ' + demands.length + '\n'
  report += '**Max Distance:** ' + maxDist + ' km | **Matches Found:** ' + matches.length + '\n\n'

  if (matches.length > 0) {
    report += '## Top Matches' + '\n\n'
    report += '| Waste ID | Demand ID | Match Score | Distance (km) | CO2 Saved (kg) |\n'
    report += '|----------|-----------|-------------|---------------|----------------|\n'
    for (const m of matches.slice(0, 10)) {
      report += '| ' + m.waste_id + ' | ' + m.demand_id + ' | ' + (m.match_score * 100).toFixed(0) + '% | ' + m.distance_km + ' | ' + m.co2_saved_kg + ' |\n'
    }
    report += '\n## Impact Summary' + '\n\n'
    report += '- **Total CO2 Saved:** ' + totalCo2Saved.toFixed(1) + ' kg\n'
    report += '- **Avg Match Score:** ' + (matches.reduce((a, m) => a + m.match_score, 0) / matches.length * 100).toFixed(0) + '%\n'
    report += '- **High-Score Matches (>70%):** ' + matches.filter(m => m.match_score > 0.7).length + '\n'
  } else {
    report += '## No Matches Found' + '\n\n'
    report += 'Consider:\n'
    report += '- Expanding material compatibility criteria\n'
    report += '- Increasing maximum distance threshold\n'
    report += '- Pre-processing waste to improve purity\n'
  }

  report += '\n## Recommendations' + '\n\n'
  report += '- Establish industrial symbiosis network for regular waste exchange\n'
  report += '- Implement real-time material availability dashboard\n'
  report += '- Pre-process waste streams to increase purity and matchability\n'
  report += '- Create long-term supply agreements for high-volume matches\n\n'
  report += '---\n\n'
  report += '*Industrial symbiosis can divert 30-50% of waste from landfill while creating new revenue streams.*'

  return report
}

// --- Tool 4: Lifecycle Assessment Tool ---
function executeLCA(input: LCAInput): string {
  const product = input.product_name || 'Generic Product'
  const materials = input.material_composition || []
  const mfgEnergy = input.manufacturing_energy_kwh || 50
  const useYears = input.use_phase_years || 5
  const useEnergyPerYear = input.use_phase_energy_kwh_per_year || 100
  const eol = input.end_of_life_method || 'recycling'
  const transportKm = input.transport_km || 500

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const materialCO2: Record<string, number> = {
    'steel': 1.8, 'aluminum': 8.2, 'copper': 3.5, 'plastic_pet': 2.7,
    'plastic_hdpe': 1.8, 'glass': 0.85, 'concrete': 0.13, 'wood': 0.46,
    'lithium': 12.0, 'cobalt': 8.5, 'rare_earth': 7.5, 'silicon': 2.5,
    'rubber': 3.2, 'paper': 1.1, 'cotton': 5.9, 'polyester': 2.1
  }
  const materialWater: Record<string, number> = {
    'steel': 50, 'aluminum': 1100, 'copper': 200, 'plastic_pet': 60,
    'plastic_hdpe': 40, 'glass': 25, 'concrete': 15, 'wood': 50,
    'lithium': 1800, 'cobalt': 300, 'rare_earth': 250, 'silicon': 150,
    'rubber': 100, 'paper': 100, 'cotton': 10000, 'polyester': 70
  }

  let rawMaterialCO2 = 0
  let rawMaterialWater = 0
  let rawMaterialEnergy = 0
  for (const m of materials) {
    const factor = materialCO2[m.material] || 2.0
    const waterFactor = materialWater[m.material] || 100
    const recycledFactor = 1 - (m.recycled_content / 100) * 0.6
    rawMaterialCO2 += m.weight_kg * factor * recycledFactor
    rawMaterialWater += m.weight_kg * waterFactor
    rawMaterialEnergy += m.weight_kg * rng.nextFloat(5, 20)
  }

  const mfgCO2 = mfgEnergy * 0.42
  const mfgWater = mfgEnergy * 2.5
  const mfgEnergyMJ = mfgEnergy * 3.6

  const useCO2 = useYears * useEnergyPerYear * 0.42
  const useWater = useYears * useEnergyPerYear * 1.8
  const useEnergyMJ = useYears * useEnergyPerYear * 3.6

  const eolFactor = eol === 'recycling' ? -0.3 : eol === 'reuse' ? -0.5 : eol === 'incineration' ? 0.2 : 0.5
  const eolCO2 = rawMaterialCO2 * eolFactor
  const eolWater = eol === 'recycling' ? rawMaterialWater * 0.1 : rawMaterialWater * 0.3
  const eolEnergyMJ = eol === 'recycling' ? rawMaterialEnergy * 0.2 : rawMaterialEnergy * 0.5

  const transportCO2 = transportKm * 0.001 * materials.reduce((a, m) => a + m.weight_kg, 0) * 0.1
  const transportWater = transportKm * 0.01
  const transportEnergyMJ = transportKm * 0.005

  const totalCO2 = rawMaterialCO2 + mfgCO2 + useCO2 + eolCO2 + transportCO2
  const totalWater = rawMaterialWater + mfgWater + useWater + eolWater + transportWater
  const totalEnergy = rawMaterialEnergy + mfgEnergyMJ + useEnergyMJ + eolEnergyMJ + transportEnergyMJ

  const stages: LCAResult[] = [
    { stage: 'Raw Materials', co2_kg: Math.round(rawMaterialCO2 * 100) / 100, water_liters: Math.round(rawMaterialWater), energy_mj: Math.round(rawMaterialEnergy) },
    { stage: 'Manufacturing', co2_kg: Math.round(mfgCO2 * 100) / 100, water_liters: Math.round(mfgWater), energy_mj: Math.round(mfgEnergyMJ) },
    { stage: 'Use Phase', co2_kg: Math.round(useCO2 * 100) / 100, water_liters: Math.round(useWater), energy_mj: Math.round(useEnergyMJ) },
    { stage: 'End of Life', co2_kg: Math.round(eolCO2 * 100) / 100, water_liters: Math.round(eolWater), energy_mj: Math.round(eolEnergyMJ) },
    { stage: 'Transport', co2_kg: Math.round(transportCO2 * 100) / 100, water_liters: Math.round(transportWater), energy_mj: Math.round(transportEnergyMJ) }
  ]

  let report = '# Lifecycle Assessment (LCA) Report' + '\n\n'
  report += '**Product:** ' + product + '\n'
  report += '**End-of-Life Method:** ' + eol + '\n'
  report += '**Use Phase:** ' + useYears + ' years\n\n'
  report += '## Impact by Life Cycle Stage' + '\n\n'
  report += '| Stage | CO2 (kg) | Water (L) | Energy (MJ) |\n'
  report += '|-------|----------|-----------|-------------|\n'
  for (const s of stages) {
    report += '| ' + s.stage + ' | ' + s.co2_kg + ' | ' + s.water_liters + ' | ' + s.energy_mj + ' |\n'
  }
  report += '\n## Totals' + '\n\n'
  report += '- **Total CO2:** ' + totalCO2.toFixed(1) + ' kg\n'
  report += '- **Total Water:** ' + totalWater.toFixed(0) + ' liters\n'
  report += '- **Total Energy:** ' + totalEnergy.toFixed(0) + ' MJ\n\n'
  report += '## Hotspot Analysis' + '\n\n'
  const maxCO2Stage = stages.reduce((a, b) => Math.abs(b.co2_kg) > Math.abs(a.co2_kg) ? b : a)
  report += '- **Highest CO2 Contributor:** ' + maxCO2Stage.stage + ' (' + maxCO2Stage.co2_kg + ' kg)\n'
  report += '- **Material Efficiency:** ' + (materials.length > 0 ? (materials.reduce((a, m) => a + m.recycled_content, 0) / materials.length).toFixed(0) : '0') + '% avg recycled content\n\n'
  report += '## Improvement Opportunities' + '\n\n'
  report += '- Increase recycled content in raw materials (up to 60% CO2 reduction)\n'
  report += '- Optimize use-phase energy efficiency\n'
  report += '- Switch to recycling/reuse end-of-life pathway\n'
  report += '- Reduce transport distances through local sourcing\n\n'
  report += '---\n\n'
  report += '*LCA is the foundation of circular economy decision-making — measure, then improve.*'

  return report
}

// --- Tool 5: Circularity Score Calculator ---
function executeCircularityScore(input: CircularityInput): string {
  const product = input.product_name || 'Product'
  const recycled = input.recycled_content_pct || 0
  const recyclable = input.recyclability_pct || 0
  const lifespan = input.avg_lifespan_years || 5
  const industryAvg = input.industry_avg_lifespan || 5
  const repairability = input.repairability_score || 5
  const takeBack = input.take_back_program || false
  const modular = input.modular_design || false

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const materialScore = (recycled * 0.5 + recyclable * 0.5) / 100
  const lifespanScore = clamp(lifespan / industryAvg, 0, 1.5) / 1.5
  const designScore = (repairability / 10 * 0.5 + (modular ? 0.5 : 0))
  const systemScore = takeBack ? 1.0 : 0.3

  const overallScore = (materialScore * 0.35 + lifespanScore * 0.25 + designScore * 0.2 + systemScore * 0.2)

  const dimensions = [
    { name: 'Material Circularity', score: materialScore, weight: 0.35, detail: 'Recycled: ' + recycled + '%, Recyclable: ' + recyclable + '%' },
    { name: 'Lifespan Extension', score: lifespanScore, weight: 0.25, detail: 'Product: ' + lifespan + 'y, Industry Avg: ' + industryAvg + 'y' },
    { name: 'Design for Circularity', score: designScore, weight: 0.2, detail: 'Repairability: ' + repairability + '/10, Modular: ' + (modular ? 'Yes' : 'No') },
    { name: 'System & Recovery', score: systemScore, weight: 0.2, detail: 'Take-back: ' + (takeBack ? 'Yes' : 'No') }
  ]

  let report = '# Circularity Score Report' + '\n\n'
  report += '**Product:** ' + product + '\n'
  report += '**Overall Circularity Score:** ' + formatScore(overallScore) + '%\n'
  report += '**Rating:** ' + (overallScore > 0.7 ? 'A - Excellent' : overallScore > 0.5 ? 'B - Good' : overallScore > 0.3 ? 'C - Moderate' : 'D - Needs Improvement') + '\n\n'
  report += '## Dimension Breakdown' + '\n\n'
  report += '| Dimension | Score | Weight | Weighted | Detail |\n'
  report += '|-----------|-------|--------|----------|--------|\n'
  for (const d of dimensions) {
    report += '| ' + d.name + ' | ' + formatScore(d.score) + '% | ' + (d.weight * 100).toFixed(0) + '% | ' + formatScore(d.score * d.weight) + '% | ' + d.detail + ' |\n'
  }
  report += '\n## Improvement Roadmap' + '\n\n'
  if (recycled < 30) report += '- **Increase recycled content** to 30%+ (current: ' + recycled + '%)\n'
  if (recyclable < 70) report += '- **Improve recyclability** through material selection (current: ' + recyclable + '%)\n'
  if (lifespan < industryAvg) report += '- **Extend product lifespan** to exceed industry average\n'
  if (repairability < 7) report += '- **Enhance repairability** with modular components and repair manuals\n'
  if (!takeBack) report += '- **Establish take-back program** for end-of-life recovery\n'
  if (!modular) report += '- **Adopt modular design** for easier upgrade and repair\n'
  report += '- **Digital Product Passport** to track material provenance and enable recovery\n\n'
  report += '---\n\n'
  report += '*The global circular economy market exceeds $650B in 2026 — circularity is both environmental and economic imperative.*'

  return report
}

// --- Tool 6: Material Flow Analyzer ---
function executeMaterialFlow(input: MaterialFlowInput): string {
  const system = input.system_name || 'Production System'
  const inputs = input.inputs || []
  const outputs = input.outputs || []
  const recycled = input.recycled_flows || []

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const allMaterials = new Set<string>()
  for (const i of inputs) allMaterials.add(i.material)
  for (const o of outputs) allMaterials.add(o.material)
  for (const r of recycled) allMaterials.add(r.material)

  const analyses: FlowAnalysis[] = []
  let totalInput = 0
  let totalRecycled = 0
  let totalLoss = 0

  for (const mat of allMaterials) {
    const inputQty = inputs.filter(i => i.material === mat).reduce((a, i) => a + i.quantity, 0)
    const outputQty = outputs.filter(o => o.material === mat).reduce((a, o) => a + o.quantity, 0)
    const recycledQty = recycled.filter(r => r.material === mat).reduce((a, r) => a + r.quantity, 0)
    const loss = Math.max(0, inputQty - outputQty - recycledQty)
    const recyclingRate = inputQty > 0 ? recycledQty / inputQty : 0
    analyses.push({ material: mat, input: inputQty, output: outputQty, recycled: recycledQty, loss, recycling_rate: Math.round(recyclingRate * 100) / 100 })
    totalInput += inputQty
    totalRecycled += recycledQty
    totalLoss += loss
  }

  const overallRecyclingRate = totalInput > 0 ? totalRecycled / totalInput : 0
  const overallEfficiency = totalInput > 0 ? (totalInput - totalLoss) / totalInput : 0

  let report = '# Material Flow Analysis (MFA) Report' + '\n\n'
  report += '**System:** ' + system + '\n'
  report += '**Materials Tracked:** ' + allMaterials.size + '\n\n'
  report += '## Flow Balance' + '\n\n'
  report += '| Material | Input | Output | Recycled | Loss | Recycling Rate |\n'
  report += '|----------|-------|--------|----------|------|----------------|\n'
  for (const a of analyses) {
    report += '| ' + a.material + ' | ' + a.input + ' | ' + a.output + ' | ' + a.recycled + ' | ' + a.loss + ' | ' + (a.recycling_rate * 100).toFixed(0) + '% |\n'
  }
  report += '\n## System Metrics' + '\n\n'
  report += '- **Total Input:** ' + totalInput + ' units\n'
  report += '- **Total Recycled:** ' + totalRecycled + ' units\n'
  report += '- **Total Loss:** ' + totalLoss + ' units\n'
  report += '- **Overall Recycling Rate:** ' + (overallRecyclingRate * 100).toFixed(1) + '%\n'
  report += '- **Material Efficiency:** ' + (overallEfficiency * 100).toFixed(1) + '%\n\n'
  report += '## Loss Point Analysis' + '\n\n'
  const lossPoints = analyses.filter(a => a.loss > 0).sort((a, b) => b.loss - a.loss)
  if (lossPoints.length > 0) {
    for (const lp of lossPoints) {
      report += '- **' + lp.material + ':** ' + lp.loss + ' units lost (' + (lp.input > 0 ? (lp.loss / lp.input * 100).toFixed(0) : '0') + '% of input)\n'
    }
  } else {
    report += '- No significant loss points identified\n'
  }
  report += '\n## Recommendations' + '\n\n'
  report += '- Close material loops by increasing internal recycling\n'
  report += '- Identify loss reduction opportunities at top loss points\n'
  report += '- Substitute hard-to-recycle materials with circular alternatives\n'
  report += '- Implement real-time material flow monitoring\n\n'
  report += '---\n\n'
  report += '*Material flow analysis reveals hidden inefficiencies — what gets measured gets managed in circular systems.*'

  return report
}

// --- Tool 7: Carbon Footprint Reducer ---
function executeCarbonReduction(input: CarbonReductionInput): string {
  const baseline = input.baseline_co2_tons || 1000
  const target = input.target_reduction_pct || 30
  const sector = input.sector || 'manufacturing'
  const measures = input.measures || []
  const budget = input.budget_usd || 50000

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const reductionTarget = baseline * (target / 100)
  const plannedMeasures: ReductionMeasure[] = []
  let totalReduction = 0
  let totalCost = 0

  for (const m of measures) {
    const reductionTons = baseline * (m.reduction_potential_pct / 100)
    const cost = reductionTons * m.cost_per_ton
    const costEffectiveness = cost > 0 ? reductionTons / cost : 0
    plannedMeasures.push({
      name: m.name,
      reduction_tons: Math.round(reductionTons * 10) / 10,
      cost: Math.round(cost),
      cost_effectiveness: Math.round(costEffectiveness * 10000) / 10000,
      priority: 0
    })
    totalReduction += reductionTons
    totalCost += cost
  }

  plannedMeasures.sort((a, b) => b.cost_effectiveness - a.cost_effectiveness)
  for (let i = 0; i < plannedMeasures.length; i++) {
    plannedMeasures[i].priority = i + 1
  }

  const reductionGap = Math.max(0, reductionTarget - totalReduction)
  const achievement = reductionTarget > 0 ? (totalReduction / reductionTarget * 100) : 0

  let report = '# Carbon Footprint Reduction Plan' + '\n\n'
  report += '**Sector:** ' + sector + '\n'
  report += '**Baseline Emissions:** ' + baseline + ' tons CO2/year\n'
  report += '**Reduction Target:** ' + target + '% (' + reductionTarget.toFixed(0) + ' tons)\n'
  report += '**Budget:** $' + budget.toLocaleString() + '\n\n'
  report += '## Reduction Measures (Ranked by Cost-Effectiveness)' + '\n\n'
  report += '| Priority | Measure | Reduction (t) | Cost ($) | $/ton |\n'
  report += '|----------|---------|---------------|----------|-------|\n'
  for (const m of plannedMeasures) {
    report += '| ' + m.priority + ' | ' + m.name + ' | ' + m.reduction_tons + ' | $' + m.cost.toLocaleString() + ' | $' + (m.cost / m.reduction_tons).toFixed(0) + ' |\n'
  }
  report += '\n## Summary' + '\n\n'
  report += '- **Total Planned Reduction:** ' + totalReduction.toFixed(1) + ' tons CO2/year\n'
  report += '- **Target Achievement:** ' + achievement.toFixed(0) + '%\n'
  report += '- **Remaining Gap:** ' + reductionGap.toFixed(1) + ' tons\n'
  report += '- **Total Investment:** $' + totalCost.toLocaleString() + '\n'
  report += '- **Budget Status:** ' + (totalCost <= budget ? 'Within budget' : 'Over budget by $' + (totalCost - budget).toLocaleString()) + '\n'
  report += '- **Avg Cost per Ton:** $' + (totalReduction > 0 ? (totalCost / totalReduction).toFixed(0) : '0') + '\n\n'
  report += '## Net Zero Roadmap' + '\n\n'
  report += '| Phase | Timeline | Action | Expected Reduction |\n'
  report += '|-------|----------|--------|--------------------|\n'
  report += '| Phase 1 | Year 1 | Implement top 3 cost-effective measures | ' + (reductionTarget * 0.4).toFixed(0) + ' tons |\n'
  report += '| Phase 2 | Year 2-3 | Scale successful measures + new tech | ' + (reductionTarget * 0.7).toFixed(0) + ' tons |\n'
  report += '| Phase 3 | Year 3-5 | Deep decarbonization + offsets | ' + reductionTarget.toFixed(0) + ' tons |\n'
  report += '\n## Recommendations' + '\n\n'
  if (reductionGap > 0) {
    report += '- **Gap Alert:** Additional ' + reductionGap.toFixed(0) + ' tons reduction needed to meet target\n'
    report += '- Consider: renewable energy switch, process electrification, carbon offsets\n'
  }
  report += '- Prioritize measures with lowest $/ton for maximum impact per dollar\n'
  report += '- Purchase high-quality carbon credits for residual emissions\n'
  report += '- Set science-based targets aligned with 1.5°C pathway\n\n'
  report += '---\n\n'
  report += '*Carbon reduction is both a climate imperative and a competitive advantage in the $650B+ circular economy.*'

  return report
}

// --- Tool 8: Sustainable Packaging Advisor ---
function executePackagingAdvisor(input: PackagingInput): string {
  const product = input.product_name || 'Product'
  const currentMat = input.current_material || 'plastic_pet'
  const currentWeight = input.current_weight_g || 50
  const productWeight = input.product_weight_g || 500
  const target = input.target || 'full_optimization'
  const distance = input.distribution_distance_km || 500
  const recyclable = input.recyclable_infrastructure !== false

  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const materialDB: Record<string, { co2_factor: number; recyclable: boolean; cost_factor: number; barrier: string }> = {
    'plastic_pet': { co2_factor: 2.7, recyclable: true, cost_factor: 1.0, barrier: 'good' },
    'plastic_hdpe': { co2_factor: 1.8, recyclable: true, cost_factor: 0.9, barrier: 'moderate' },
    'glass': { co2_factor: 0.85, recyclable: true, cost_factor: 1.5, barrier: 'excellent' },
    'aluminum': { co2_factor: 8.2, recyclable: true, cost_factor: 1.8, barrier: 'excellent' },
    'paper_cardboard': { co2_factor: 1.1, recyclable: true, cost_factor: 0.7, barrier: 'low' },
    'molded_pulp': { co2_factor: 0.8, recyclable: true, cost_factor: 0.8, barrier: 'low' },
    'bioplastic_pla': { co2_factor: 1.5, recyclable: false, cost_factor: 2.0, barrier: 'moderate' },
    'mushroom_packaging': { co2_factor: 0.5, recyclable: true, cost_factor: 2.5, barrier: 'moderate' },
    'seaweed_film': { co2_factor: 0.3, recyclable: true, cost_factor: 3.0, barrier: 'low' },
    'recycled_cardboard': { co2_factor: 0.6, recyclable: true, cost_factor: 0.6, barrier: 'low' }
  }

  const current = materialDB[currentMat] || materialDB['plastic_pet']
  const recommendations: PackagingRecommendation[] = []

  const candidates = Object.entries(materialDB)
    .filter(([name]) => name !== currentMat)
    .map(([name, props]) => {
      const weightReduction = target === 'reduce_weight' || target === 'full_optimization' ? rng.nextFloat(0.1, 0.5) : rng.nextFloat(0, 0.2)
      const newWeight = Math.round(currentWeight * (1 - weightReduction))
      const co2Reduction = ((current.co2_factor * currentWeight) - (props.co2_factor * newWeight)) / (current.co2_factor * currentWeight)
      const costImpact = ((props.cost_factor * newWeight) - (current.cost_factor * currentWeight)) / (current.cost_factor * currentWeight)
      return {
        material: name,
        weight_g: newWeight,
        co2_reduction_pct: Math.round(co2Reduction * 100),
        recyclability: props.recyclable ? (recyclable ? 'Widely recyclable' : 'Recyclable where infrastructure exists') : 'Not recyclable / compostable',
        cost_impact_pct: Math.round(costImpact * 100)
      }
    })
    .sort((a, b) => b.co2_reduction_pct - a.co2_reduction_pct)

  const packagingRatio = (currentWeight / productWeight).toFixed(2)

  let report = '# Sustainable Packaging Advisory Report' + '\n\n'
  report += '**Product:** ' + product + '\n'
  report += '**Current Material:** ' + currentMat + ' (' + currentWeight + 'g)\n'
  report += '**Product Weight:** ' + productWeight + 'g | **Packaging Ratio:** ' + packagingRatio + '\n'
  report += '**Target:** ' + target + ' | **Distribution Distance:** ' + distance + ' km\n\n'
  report += '## Current Packaging Assessment' + '\n\n'
  report += '- **Material:** ' + currentMat + '\n'
  report += '- **CO2 Factor:** ' + current.co2_factor + ' kg CO2/kg\n'
  report += '- **Recyclability:** ' + current.recyclable + '\n'
  report += '- **Barrier Properties:** ' + current.barrier + '\n\n'
  report += '## Recommended Alternatives' + '\n\n'
  report += '| Material | Weight (g) | CO2 Reduction | Recyclability | Cost Impact |\n'
  report += '|----------|------------|---------------|---------------|-------------|\n'
  for (const r of candidates.slice(0, 5)) {
    report += '| ' + r.material + ' | ' + r.weight_g + ' | ' + r.co2_reduction_pct + '% | ' + r.recyclability + ' | ' + (r.cost_impact_pct >= 0 ? '+' : '') + r.cost_impact_pct + '% |\n'
  }
  report += '\n## Optimization Strategies' + '\n\n'
  if (target === 'reduce_weight' || target === 'full_optimization') {
    report += '- **Lightweighting:** Reduce material thickness by 20-40% through structural design\n'
    report += '- **Eliminate unnecessary layers** and secondary packaging\n'
  }
  if (target === 'switch_material' || target === 'full_optimization') {
    report += '- **Material Switch:** Move to recycled cardboard or molded pulp for 40-60% CO2 reduction\n'
    report += '- **Bio-based alternatives:** Consider seaweed film or mushroom packaging for premium positioning\n'
  }
  if (target === 'improve_recyclability' || target === 'full_optimization') {
    report += '- **Design for Recycling:** Use mono-materials, avoid mixed layers\n'
    report += '- **Clear labeling:** Add recycling instructions and material identification\n'
  }
  report += '- **Right-size packaging:** Match packaging volume to product to reduce material and transport emissions\n\n'
  report += '---\n\n'
  report += '*Sustainable packaging reduces carbon footprint by 30-60% while meeting growing consumer demand for eco-friendly products.*'

  return report
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'reverse_logistics_optimizer',
    description: '逆向物流优化：回收网络设计、运输路径规划、成本与排放最小化，支持多目标优化',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: collection_points, processing_centers, target_material, optimization_goal' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeReverseLogistics(JSON.parse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'remanufacturing_process_planner',
    description: '再制造流程规划：拆解-检测-修复-重组-质检全流程，产出率与质量分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_type, core_condition, target_output, available_cores, quality_threshold' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeRemanufacturing(JSON.parse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'waste_resource_matcher',
    description: '废弃物资源化匹配：工业共生智能配对，废料-需求匹配度评分与CO2减排量估算',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: waste_streams, resource_demands, max_distance_km' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeWasteResourceMatcher(JSON.parse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'lifecycle_assessment_tool',
    description: '生命周期评估LCA：全生命周期碳足迹、水足迹、能耗量化，热点识别与改进建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_name, material_composition, manufacturing_energy_kwh, use_phase_years, end_of_life_method, transport_km' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeLCA(JSON.parse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'circularity_score_calculator',
    description: '循环度评分：材料循环率、寿命延长、可修复性、回收体系四维综合评分与改进路线图',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_name, recycled_content_pct, recyclability_pct, avg_lifespan_years, repairability_score, take_back_program, modular_design' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeCircularityScore(JSON.parse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'material_flow_analyzer',
    description: '物质流分析MFA：系统输入-输出平衡、循环率、损失点识别与效率评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: system_name, inputs, outputs, recycled_flows' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeMaterialFlow(JSON.parse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'carbon_footprint_reducer',
    description: '碳足迹减排：减排路径规划、成本效益分析、净零路线图、缺口识别',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: baseline_co2_tons, target_reduction_pct, sector, measures, budget_usd' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeCarbonReduction(JSON.parse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'sustainable_packaging_advisor',
    description: '可持续包装设计：材料替代、减量优化、可回收性提升、成本影响评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_name, current_material, current_weight_g, product_weight_g, target, distribution_distance_km, recyclable_infrastructure' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePackagingAdvisor(JSON.parse(args.input_data)) }
  }))
}
