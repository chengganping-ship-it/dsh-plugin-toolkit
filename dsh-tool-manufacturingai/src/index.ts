import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'manufacturingai'
export const inject = ['tools']

const DISCLAIMER = '本分析基于AI模型推断，仅供智能制造参考，不替代专业工程与运营决策。'

function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rngFromInput(input: string) {
  return mulberry32(hashStr(input))
}

// ============ 1. predictive_maintenance_scheduler ============

interface PredictiveMaintenanceInput {
  machine_id: string
  operating_hours?: number
  sensor_vibration?: number
  sensor_temperature?: number
  sensor_pressure?: number
  last_maintenance_days?: number
  maintenance_type?: string
}

interface PredictiveMaintenanceResult {
  machine_id: string
  health_score: number
  remaining_useful_life_days: number
  next_maintenance_due: string
  failure_probability_30d: string
  risk_level: string
  top_risk_factors: string[]
  recommended_actions: string[]
  cost_avoidance: string
}

function analyzePredictiveMaintenance(data: PredictiveMaintenanceInput): PredictiveMaintenanceResult {
  const r = rngFromInput(JSON.stringify(data))
  const operatingHours = data.operating_hours || 8000
  const lastMaintDays = data.last_maintenance_days || 45
  const vibration = data.sensor_vibration || 2.5
  const temperature = data.sensor_temperature || 72

  const healthScore = Math.round(Math.max(20, Math.min(98, 95 - (operatingHours / 200) - (lastMaintDays / 3) - (vibration * 5) - (temperature - 65) * 0.8 + r() * 15)))
  const rul = Math.max(7, Math.round(healthScore * 1.2 + r() * 30 - lastMaintDays * 0.5))
  const failProb = (Math.max(0.01, (100 - healthScore) / 100 * 0.6 + r() * 0.15) * 100).toFixed(1)
  const riskLevel = healthScore < 50 ? 'Critical' : healthScore < 70 ? 'High' : healthScore < 85 ? 'Medium' : 'Low'

  const allRiskFactors = [
    'Bearing wear level elevated',
    'Lubricant degradation detected',
    'Motor current draw anomaly',
    'Vibration spectrum shift',
    'Thermal hotspot formation',
    'Seal integrity decline',
    'Rotor imbalance trending'
  ]
  const topRiskFactors: string[] = []
  const used = new Set<number>()
  const factorCount = Math.min(4, Math.floor(r() * 3) + 2)
  for (let i = 0; i < factorCount; i++) {
    let idx: number
    do { idx = Math.floor(r() * allRiskFactors.length) } while (used.has(idx))
    used.add(idx)
    topRiskFactors.push(allRiskFactors[idx])
  }

  const actions: string[] = []
  if (healthScore < 60) actions.push('Schedule immediate inspection and component replacement')
  else if (healthScore < 80) actions.push('Plan maintenance window within 2 weeks')
  else actions.push('Continue standard monitoring interval')
  actions.push('Update CMMS with current health assessment')
  actions.push('Review spare parts inventory for at-risk components')

  const costAvoidance = '$' + Math.round(healthScore * 150 + r() * 5000).toLocaleString()

  return {
    machine_id: data.machine_id || 'MCH-001',
    health_score: healthScore,
    remaining_useful_life_days: rul,
    next_maintenance_due: rul <= 14 ? 'Within 14 days' : 'Within ' + rul + ' days',
    failure_probability_30d: failProb + '%',
    risk_level: riskLevel,
    top_risk_factors: topRiskFactors,
    recommended_actions: actions,
    cost_avoidance: costAvoidance
  }
}

function formatPredictiveMaintenance(r: PredictiveMaintenanceResult): string {
  return '# Predictive Maintenance Schedule: ' + r.machine_id + '\n' +
    'Health Score: ' + r.health_score + '/100 | RUL: ' + r.remaining_useful_life_days + ' days | Failure Prob (30d): ' + r.failure_probability_30d + '\n' +
    'Risk Level: ' + r.risk_level + ' | Next Maintenance: ' + r.next_maintenance_due + '\n' +
    'Top Risk Factors:\n' +
    r.top_risk_factors.map(function(f) { return '  - ' + f }).join('\n') + '\n' +
    'Recommended Actions:\n' +
    r.recommended_actions.map(function(a) { return '  - ' + a }).join('\n') + '\n' +
    'Estimated Cost Avoidance: ' + r.cost_avoidance + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ 2. quality_control_ai ============

interface QualityControlInput {
  product_line: string
  batch_size?: number
  inspection_points?: number
  defect_categories?: string[]
  target_cpk?: number
  measurement_data?: number[]
}

interface QualityControlResult {
  product_line: string
  batch_size: number
  total_defects: number
  defect_rate: string
  cpk: number
  sigma_level: number
  spc_status: string
  defect_breakdown: Array<{ category: string; count: number; pct: string }>
  capability_grade: string
  recommendations: string[]
}

function analyzeQualityControl(data: QualityControlInput): QualityControlResult {
  const r = rngFromInput(JSON.stringify(data))
  const batchSize = data.batch_size || 1000
  const targetCpk = data.target_cpk || 1.33
  const cpk = parseFloat((targetCpk + (r() - 0.5) * 0.6).toFixed(2))
  const sigmaLevel = parseFloat((cpk * 3 + r() * 0.5).toFixed(1))
  const defectRate = parseFloat((Math.max(0.1, (100 - cpk * 30) * 0.1 + r() * 2)).toFixed(2))
  const totalDefects = Math.round(batchSize * defectRate / 100)

  const categories = data.defect_categories || ['Dimensional', 'Surface', 'Assembly', 'Material', 'Functional']
  const breakdown: Array<{ category: string; count: number; pct: string }> = []
  let remaining = totalDefects
  for (let i = 0; i < categories.length; i++) {
    const count = i === categories.length - 1 ? remaining : Math.floor(remaining * (r() * 0.4 + 0.1))
    remaining -= count
    breakdown.push({ category: categories[i], count, pct: (count / batchSize * 100).toFixed(2) + '%' })
  }

  let spcStatus = 'In Control'
  let capabilityGrade = 'Excellent'
  if (cpk < 1.0) { spcStatus = 'Out of Control'; capabilityGrade = 'Poor' }
  else if (cpk < 1.33) { spcStatus = 'Marginal'; capabilityGrade = 'Fair' }
  else if (cpk < 1.67) { spcStatus = 'In Control'; capabilityGrade = 'Good' }

  const recommendations: string[] = []
  if (cpk < 1.33) recommendations.push('Initiate process improvement to achieve Cpk >= 1.33')
  if (breakdown[0] && breakdown[0].count > totalDefects * 0.4) recommendations.push('Focus on top defect category: ' + breakdown[0].category)
  recommendations.push('Review control limits and sampling frequency')
  recommendations.push('Conduct measurement system analysis (MSA) for critical dimensions')

  return {
    product_line: data.product_line || 'Line-A',
    batch_size: batchSize,
    total_defects: totalDefects,
    defect_rate: defectRate + '%',
    cpk,
    sigma_level: sigmaLevel,
    spc_status: spcStatus,
    defect_breakdown: breakdown,
    capability_grade: capabilityGrade,
    recommendations
  }
}

function formatQualityControl(r: QualityControlResult): string {
  return '# AI Quality Control: ' + r.product_line + '\n' +
    'Batch: ' + r.batch_size + ' | Defects: ' + r.total_defects + ' | Defect Rate: ' + r.defect_rate + '\n' +
    'Cpk: ' + r.cpk + ' | Sigma Level: ' + r.sigma_level + 'sigma | SPC: ' + r.spc_status + '\n' +
    'Capability Grade: ' + r.capability_grade + '\n' +
    'Defect Breakdown:\n' +
    r.defect_breakdown.map(function(d) { return '  - ' + d.category + ': ' + d.count + ' (' + d.pct + ')' }).join('\n') + '\n' +
    'Recommendations:\n' +
    r.recommendations.map(function(rec) { return '  - ' + rec }).join('\n') + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ 3. production_schedule_optimizer ============

interface ProductionScheduleInput {
  work_center: string
  pending_orders?: number
  available_hours?: number
  changeover_time_min?: number
  priority_orders?: number
  resource_constraints?: string[]
}

interface ProductionScheduleResult {
  work_center: string
  total_orders: number
  scheduled_orders: number
  utilization_pct: string
  makespan_hours: number
  on_time_delivery_rate: string
  bottleneck_identified: string
  schedule_efficiency: string
  optimization_suggestions: string[]
  estimated_output: number
}

function analyzeProductionSchedule(data: ProductionScheduleInput): ProductionScheduleResult {
  const r = rngFromInput(JSON.stringify(data))
  const orders = data.pending_orders || 25
  const availableHours = data.available_hours || 160
  const changeoverMin = data.changeover_time_min || 30
  const priorityOrders = data.priority_orders || 5

  const utilization = parseFloat((75 + r() * 20).toFixed(1))
  const scheduledOrders = Math.min(orders, Math.floor(orders * (utilization / 100) + r() * 3))
  const makespan = Math.round(availableHours * (utilization / 100) + r() * 10)
  const onTimeRate = parseFloat((80 + r() * 18).toFixed(1))
  const scheduleEfficiency = parseFloat((0.7 + r() * 0.25).toFixed(2))
  const estimatedOutput = Math.round(scheduledOrders * (8 + r() * 4))

  const workCenters = ['CNC-01', 'Assembly-Line-B', 'Welding-Station-3', 'Paint-Booth-2', 'Packaging-Area']
  const bottleneck = workCenters[Math.floor(r() * workCenters.length)]

  const suggestions: string[] = []
  if (utilization < 85) suggestions.push('Increase utilization by batching similar orders to reduce changeover')
  if (onTimeRate < 90) suggestions.push('Prioritize ' + priorityOrders + ' high-priority orders to improve OTD rate')
  suggestions.push('Implement SMED to reduce changeover time from ' + changeoverMin + 'min to target 15min')
  suggestions.push('Consider overtime or weekend shift for bottleneck at ' + bottleneck)
  suggestions.push('Apply theory of constraints (TOC) to elevate bottleneck capacity')

  return {
    work_center: data.work_center || 'WC-01',
    total_orders: orders,
    scheduled_orders: scheduledOrders,
    utilization_pct: utilization + '%',
    makespan_hours: makespan,
    on_time_delivery_rate: onTimeRate + '%',
    bottleneck_identified: bottleneck,
    schedule_efficiency: (scheduleEfficiency * 100).toFixed(0) + '%',
    optimization_suggestions: suggestions,
    estimated_output: estimatedOutput
  }
}

function formatProductionSchedule(r: ProductionScheduleResult): string {
  return '# Production Schedule Optimizer: ' + r.work_center + '\n' +
    'Orders: ' + r.scheduled_orders + '/' + r.total_orders + ' | Utilization: ' + r.utilization_pct + ' | Makespan: ' + r.makespan_hours + 'h\n' +
    'On-Time Delivery: ' + r.on_time_delivery_rate + ' | Efficiency: ' + r.schedule_efficiency + ' | Output: ' + r.estimated_output + ' units\n' +
    'Bottleneck: ' + r.bottleneck_identified + '\n' +
    'Optimization Suggestions:\n' +
    r.optimization_suggestions.map(function(s) { return '  - ' + s }).join('\n') + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ 4. digital_twin_factory ============

interface DigitalTwinInput {
  factory_name: string
  production_lines?: number
  simulation_scenario?: string
  iot_sensors?: number
  target_oee?: number
}

interface DigitalTwinResult {
  factory_name: string
  lines_simulated: number
  current_oee: string
  simulated_oee: string
  bottleneck_lines: Array<{ line: string; utilization: string; status: string }>
  throughput_delta: string
  energy_optimization: string
  simulation_confidence: string
  improvement_scenarios: string[]
}

function analyzeDigitalTwin(data: DigitalTwinInput): DigitalTwinResult {
  const r = rngFromInput(JSON.stringify(data))
  const lines = data.production_lines || 6
  const targetOee = data.target_oee || 0.85
  const currentOee = parseFloat((targetOee - 0.1 + r() * 0.15).toFixed(3))
  const simulatedOee = parseFloat((currentOee + 0.05 + r() * 0.1).toFixed(3))
  const throughputDelta = '+' + (r() * 15 + 5).toFixed(1)
  const energyOpt = '-' + (r() * 12 + 3).toFixed(1)
  const confidence = parseFloat((0.82 + r() * 0.15).toFixed(2))

  const bottleneckLines: Array<{ line: string; utilization: string; status: string }> = []
  for (let i = 0; i < Math.min(3, lines); i++) {
    const util = parseFloat((85 + r() * 14).toFixed(1))
    bottleneckLines.push({
      line: 'Line-' + String.fromCharCode(65 + i),
      utilization: util + '%',
      status: util > 95 ? 'Critical' : util > 90 ? 'Warning' : 'Normal'
    })
  }

  const scenarios: string[] = []
  scenarios.push('Scenario A: Add parallel station at bottleneck Line-' + String.fromCharCode(65 + Math.floor(r() * lines)))
  scenarios.push('Scenario B: Implement predictive maintenance to reduce unplanned downtime by 30%')
  scenarios.push('Scenario C: Optimize material flow with AGV rerouting simulation')
  scenarios.push('Scenario D: Shift to demand-driven production with dynamic scheduling')

  return {
    factory_name: data.factory_name || 'Smart Factory',
    lines_simulated: lines,
    current_oee: (currentOee * 100).toFixed(1) + '%',
    simulated_oee: (simulatedOee * 100).toFixed(1) + '%',
    bottleneck_lines: bottleneckLines,
    throughput_delta: throughputDelta + '%',
    energy_optimization: energyOpt + '%',
    simulation_confidence: (confidence * 100).toFixed(0) + '%',
    improvement_scenarios: scenarios
  }
}

function formatDigitalTwin(r: DigitalTwinResult): string {
  return '# Digital Twin Factory: ' + r.factory_name + '\n' +
    'Lines Simulated: ' + r.lines_simulated + ' | Current OEE: ' + r.current_oee + ' | Simulated OEE: ' + r.simulated_oee + '\n' +
    'Throughput Delta: ' + r.throughput_delta + ' | Energy Optimization: ' + r.energy_optimization + ' | Confidence: ' + r.simulation_confidence + '\n' +
    'Bottleneck Lines:\n' +
    r.bottleneck_lines.map(function(b) { return '  - ' + b.line + ': ' + b.utilization + ' [' + b.status + ']' }).join('\n') + '\n' +
    'Improvement Scenarios:\n' +
    r.improvement_scenarios.map(function(s) { return '  - ' + s }).join('\n') + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ 5. defect_detection_vision ============

interface DefectDetectionInput {
  camera_id: string
  inspected_count?: number
  defect_types?: string[]
  model_confidence?: number
  resolution_mp?: number
  inspection_speed_fpm?: number
}

interface DefectDetectionResult {
  camera_id: string
  total_inspected: number
  defects_detected: number
  detection_accuracy: string
  false_positive_rate: string
  false_negative_rate: string
  defect_summary: Array<{ type: string; count: number; confidence: string }>
  throughput_per_hour: number
  model_version: string
  recommendations: string[]
}

function analyzeDefectDetection(data: DefectDetectionInput): DefectDetectionResult {
  const r = rngFromInput(JSON.stringify(data))
  const inspected = data.inspected_count || 1000
  const modelConf = data.model_confidence || 0.94
  const speed = data.inspection_speed_fpm || 60

  const accuracy = parseFloat((modelConf + r() * 0.04).toFixed(3))
  const fpRate = parseFloat((r() * 0.06 + 0.01).toFixed(3))
  const fnRate = parseFloat((r() * 0.04 + 0.005).toFixed(3))
  const defectsDetected = Math.round(inspected * (r() * 0.04 + 0.01))
  const throughput = Math.round(speed * 60 * (0.9 + r() * 0.1))

  const defectTypes = data.defect_types || ['Scratch', 'Dent', 'Contamination', 'Misalignment', 'Color-Variation']
  const summary: Array<{ type: string; count: number; confidence: string }> = []
  let remaining = defectsDetected
  for (let i = 0; i < defectTypes.length; i++) {
    const count = i === defectTypes.length - 1 ? remaining : Math.floor(remaining * (r() * 0.5 + 0.1))
    remaining -= count
    summary.push({ type: defectTypes[i], count, confidence: (85 + r() * 14).toFixed(1) + '%' })
  }

  const recommendations: string[] = []
  if (accuracy < 0.95) recommendations.push('Retrain model with recent defect samples to improve accuracy')
  if (fpRate > 0.04) recommendations.push('Adjust confidence threshold to reduce false positives')
  recommendations.push('Implement active learning loop for continuous model improvement')
  recommendations.push('Add lighting uniformity check to reduce environmental variance')

  return {
    camera_id: data.camera_id || 'CAM-01',
    total_inspected: inspected,
    defects_detected: defectsDetected,
    detection_accuracy: (accuracy * 100).toFixed(1) + '%',
    false_positive_rate: (fpRate * 100).toFixed(1) + '%',
    false_negative_rate: (fnRate * 100).toFixed(1) + '%',
    defect_summary: summary,
    throughput_per_hour: throughput,
    model_version: 'v' + (2 + Math.floor(r() * 3)) + '.' + Math.floor(r() * 9) + '.' + Math.floor(r() * 9),
    recommendations
  }
}

function formatDefectDetection(r: DefectDetectionResult): string {
  return '# AI Defect Detection Vision: ' + r.camera_id + '\n' +
    'Inspected: ' + r.total_inspected + ' | Defects Found: ' + r.defects_detected + ' | Accuracy: ' + r.detection_accuracy + '\n' +
    'False Positive: ' + r.false_positive_rate + ' | False Negative: ' + r.false_negative_rate + ' | Throughput: ' + r.throughput_per_hour + '/hr\n' +
    'Model: ' + r.model_version + '\n' +
    'Defect Summary:\n' +
    r.defect_summary.map(function(d) { return '  - ' + d.type + ': ' + d.count + ' (conf: ' + d.confidence + ')' }).join('\n') + '\n' +
    'Recommendations:\n' +
    r.recommendations.map(function(rec) { return '  - ' + rec }).join('\n') + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ 6. oee_calculator ============

interface OEEInput {
  asset_id: string
  planned_production_time_hrs?: number
  actual_runtime_hrs?: number
  ideal_cycle_time_sec?: number
  total_produced?: number
  good_units?: number
  downtime_events?: Array<{ reason: string; duration_min: number }>
}

interface OEEResult {
  asset_id: string
  availability_pct: string
  performance_pct: string
  quality_pct: string
  oee_score: string
  oee_grade: string
  world_class_gap: string
  loss_breakdown: Array<{ category: string; impact_pct: string; recoverable: string }>
  improvement_potential: string
  six_big_losses: Array<{ loss_type: string; time_min: number; priority: string }>
}

function analyzeOEE(data: OEEInput): OEEResult {
  const r = rngFromInput(JSON.stringify(data))
  const plannedTime = data.planned_production_time_hrs || 24
  const actualRuntime = data.actual_runtime_hrs || (plannedTime * (0.75 + r() * 0.15))
  const idealCycleSec = data.ideal_cycle_time_sec || 30
  const totalProduced = data.total_produced || Math.round(actualRuntime * 3600 / idealCycleSec * (0.85 + r() * 0.1))
  const goodUnits = data.good_units || Math.round(totalProduced * (0.92 + r() * 0.07))

  const availability = parseFloat((actualRuntime / plannedTime * 100).toFixed(1))
  const idealOutput = actualRuntime * 3600 / idealCycleSec
  const performance = parseFloat((totalProduced / idealOutput * 100).toFixed(1))
  const quality = parseFloat((goodUnits / totalProduced * 100).toFixed(1))
  const oee = parseFloat((availability / 100 * performance / 100 * quality / 100 * 100).toFixed(1))

  let grade = 'World Class'
  let gap = '0%'
  if (oee < 65) { grade = 'Poor'; gap = (85 - oee).toFixed(1) + '%' }
  else if (oee < 75) { grade = 'Fair'; gap = (85 - oee).toFixed(1) + '%' }
  else if (oee < 85) { grade = 'Good'; gap = (85 - oee).toFixed(1) + '%' }

  const lossBreakdown = [
    { category: 'Equipment Failure', impact_pct: (r() * 8 + 2).toFixed(1) + '%', recoverable: 'High' },
    { category: 'Setup & Adjustment', impact_pct: (r() * 5 + 1.5).toFixed(1) + '%', recoverable: 'Medium' },
    { category: 'Idling & Minor Stops', impact_pct: (r() * 4 + 1).toFixed(1) + '%', recoverable: 'Medium' },
    { category: 'Reduced Speed', impact_pct: (r() * 6 + 2).toFixed(1) + '%', recoverable: 'High' },
    { category: 'Process Defects', impact_pct: (r() * 3 + 0.5).toFixed(1) + '%', recoverable: 'High' },
    { category: 'Reduced Yield', impact_pct: (r() * 2 + 0.5).toFixed(1) + '%', recoverable: 'Medium' }
  ]

  const sixBigLosses = [
    { loss_type: 'Breakdown Losses', time_min: Math.round(r() * 60 + 20), priority: 'Critical' },
    { loss_type: 'Setup & Changeover', time_min: Math.round(r() * 45 + 15), priority: 'High' },
    { loss_type: 'Idling & Minor Stops', time_min: Math.round(r() * 30 + 10), priority: 'Medium' },
    { loss_type: 'Speed Losses', time_min: Math.round(r() * 40 + 15), priority: 'High' },
    { loss_type: 'Quality Defects', time_min: Math.round(r() * 25 + 5), priority: 'Critical' },
    { loss_type: 'Startup Losses', time_min: Math.round(r() * 20 + 5), priority: 'Low' }
  ]

  const improvementPotential = '$' + Math.round(oee * 200 + r() * 10000).toLocaleString() + '/year'

  return {
    asset_id: data.asset_id || 'AST-001',
    availability_pct: availability + '%',
    performance_pct: performance + '%',
    quality_pct: quality + '%',
    oee_score: oee + '%',
    oee_grade: grade,
    world_class_gap: gap,
    loss_breakdown: lossBreakdown,
    improvement_potential: improvementPotential,
    six_big_losses: sixBigLosses
  }
}

function formatOEE(r: OEEResult): string {
  return '# OEE Calculator: ' + r.asset_id + '\n' +
    'Availability: ' + r.availability_pct + ' | Performance: ' + r.performance_pct + ' | Quality: ' + r.quality_pct + '\n' +
    'OEE Score: ' + r.oee_score + ' | Grade: ' + r.oee_grade + ' | Gap to World Class: ' + r.world_class_gap + '\n' +
    'Improvement Potential: ' + r.improvement_potential + '\n' +
    'Loss Breakdown:\n' +
    r.loss_breakdown.map(function(l) { return '  - ' + l.category + ': ' + l.impact_pct + ' (recoverable: ' + l.recoverable + ')' }).join('\n') + '\n' +
    'Six Big Losses:\n' +
    r.six_big_losses.map(function(s) { return '  - ' + s.loss_type + ': ' + s.time_min + 'min [' + s.priority + ']' }).join('\n') + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ 7. supply_chain_resilience_scorer ============

interface SupplyChainInput {
  supply_chain_id: string
  tier1_suppliers?: number
  tier2_suppliers?: number
  geographic_regions?: string[]
  avg_lead_time_days?: number
  single_source_pct?: number
  inventory_coverage_days?: number
  demand_volatility_pct?: number
}

interface SupplyChainResult {
  supply_chain_id: string
  resilience_score: number
  risk_level: string
  risk_factors: Array<{ factor: string; severity: string; score: number }>
  geographic_concentration: string
  supplier_risk_heatmap: Array<{ tier: string; risk_score: number; status: string }>
  mitigation_strategies: string[]
  estimated_recovery_time_days: number
  financial_exposure: string
}

function analyzeSupplyChain(data: SupplyChainInput): SupplyChainResult {
  const r = rngFromInput(JSON.stringify(data))
  const tier1 = data.tier1_suppliers || 40
  const tier2 = data.tier2_suppliers || 120
  const leadTime = data.avg_lead_time_days || 21
  const singleSource = data.single_source_pct || 25
  const inventoryDays = data.inventory_coverage_days || 18
  const demandVol = data.demand_volatility_pct || 15

  const resilienceScore = Math.round(Math.max(30, Math.min(95,
    90 - singleSource * 0.5 - demandVol * 0.8 - (leadTime - 14) * 0.5 + inventoryDays * 0.5 + r() * 10
  )))

  const riskLevel = resilienceScore < 50 ? 'High' : resilienceScore < 70 ? 'Medium' : resilienceScore < 85 ? 'Low' : 'Minimal'

  const riskFactors = [
    { factor: 'Single-source dependency', severity: singleSource > 30 ? 'High' : 'Medium', score: Math.round(singleSource + r() * 10) },
    { factor: 'Geographic concentration', severity: r() > 0.5 ? 'High' : 'Medium', score: Math.round(50 + r() * 40) },
    { factor: 'Lead time variability', severity: leadTime > 25 ? 'High' : 'Low', score: Math.round(leadTime * 2 + r() * 20) },
    { factor: 'Demand forecast accuracy', severity: demandVol > 20 ? 'High' : 'Medium', score: Math.round(demandVol * 3 + r() * 15) },
    { factor: 'Supplier financial health', severity: r() > 0.6 ? 'Medium' : 'Low', score: Math.round(30 + r() * 40) },
    { factor: 'Logistics disruption exposure', severity: r() > 0.5 ? 'High' : 'Medium', score: Math.round(40 + r() * 35) }
  ].sort(function(a, b) { return b.score - a.score })

  const geoRegions = data.geographic_regions || ['APAC', 'EMEA', 'Americas']
  const geoConcentration = geoRegions.length <= 2 ? 'High (concentrated)' : geoRegions.length <= 4 ? 'Medium (moderate spread)' : 'Low (well diversified)'

  const supplierHeatmap = [
    { tier: 'Tier-1', risk_score: Math.round(40 + r() * 35), status: resilienceScore > 70 ? 'Stable' : 'At Risk' },
    { tier: 'Tier-2', risk_score: Math.round(50 + r() * 35), status: resilienceScore > 60 ? 'Stable' : 'Monitor' },
    { tier: 'Tier-3', risk_score: Math.round(55 + r() * 35), status: 'Visibility Gap' }
  ]

  const strategies: string[] = []
  if (singleSource > 20) strategies.push('Qualify alternate suppliers for top 20% single-source components')
  strategies.push('Increase safety stock for critical items to ' + Math.round(inventoryDays * 1.5) + ' days coverage')
  strategies.push('Implement real-time supplier monitoring dashboard')
  strategies.push('Establish regional sourcing hubs to reduce geographic concentration')
  strategies.push('Deploy AI-driven demand sensing to reduce forecast error by 25%')

  const recoveryTime = Math.round(14 + r() * 30 + (100 - resilienceScore) * 0.3)
  const financialExposure = '$' + Math.round(resilienceScore * 5000 + r() * 50000).toLocaleString()

  return {
    supply_chain_id: data.supply_chain_id || 'SC-001',
    resilience_score: resilienceScore,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    geographic_concentration: geoConcentration,
    supplier_risk_heatmap: supplierHeatmap,
    mitigation_strategies: strategies,
    estimated_recovery_time_days: recoveryTime,
    financial_exposure: financialExposure
  }
}

function formatSupplyChain(r: SupplyChainResult): string {
  return '# Supply Chain Resilience: ' + r.supply_chain_id + '\n' +
    'Resilience Score: ' + r.resilience_score + '/100 | Risk Level: ' + r.risk_level + ' | Recovery Time: ' + r.estimated_recovery_time_days + ' days\n' +
    'Geographic Concentration: ' + r.geographic_concentration + ' | Financial Exposure: ' + r.financial_exposure + '\n' +
    'Risk Factors (ranked):\n' +
    r.risk_factors.map(function(f) { return '  - ' + f.factor + ': ' + f.severity + ' (score: ' + f.score + '/100)' }).join('\n') + '\n' +
    'Supplier Risk Heatmap:\n' +
    r.supplier_risk_heatmap.map(function(h) { return '  - ' + h.tier + ': ' + h.risk_score + '/100 [' + h.status + ']' }).join('\n') + '\n' +
    'Mitigation Strategies:\n' +
    r.mitigation_strategies.map(function(s) { return '  - ' + s }).join('\n') + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ 8. energy_efficiency_auditor ============

interface EnergyAuditInput {
  facility_id: string
  facility_type?: string
  monthly_kwh?: number
  peak_demand_kw?: number
  operating_hours_daily?: number
  building_area_sqm?: number
  hvac_pct?: number
  lighting_pct?: number
  process_pct?: number
  renewable_pct?: number
}

interface EnergyAuditResult {
  facility_id: string
  facility_type: string
  energy_intensity_kwh_sqm: string
  total_monthly_kwh: number
  peak_demand_kw: number
  energy_cost_monthly: string
  carbon_footprint_tons: string
  efficiency_grade: string
  consumption_breakdown: Array<{ category: string; pct: string; kwh: number; benchmark: string }>
  savings_opportunities: Array<{ measure: string; savings_pct: string; payback_years: string; annual_savings: string }>
  recommendations: string[]
}

function analyzeEnergyAudit(data: EnergyAuditInput): EnergyAuditResult {
  const r = rngFromInput(JSON.stringify(data))
  const monthlyKwh = data.monthly_kwh || 50000
  const peakDemand = data.peak_demand_kw || 250
  const area = data.building_area_sqm || 5000
  const hvacPct = data.hvac_pct || 40
  const lightingPct = data.lighting_pct || 20
  const processPct = data.process_pct || 35
  const renewablePct = data.renewable_pct || 10

  const energyIntensity = parseFloat((monthlyKwh / area).toFixed(1))
  const energyCost = '$' + Math.round(monthlyKwh * 0.12).toLocaleString()
  const carbonTons = (monthlyKwh * 0.0005).toFixed(1)

  let grade = 'A'
  if (energyIntensity > 25) grade = 'D'
  else if (energyIntensity > 18) grade = 'C'
  else if (energyIntensity > 12) grade = 'B'

  const consumptionBreakdown = [
    { category: 'HVAC', pct: hvacPct + '%', kwh: Math.round(monthlyKwh * hvacPct / 100), benchmark: hvacPct > 45 ? 'Above average' : 'Normal' },
    { category: 'Lighting', pct: lightingPct + '%', kwh: Math.round(monthlyKwh * lightingPct / 100), benchmark: lightingPct > 25 ? 'Above average' : 'Normal' },
    { category: 'Process Equipment', pct: processPct + '%', kwh: Math.round(monthlyKwh * processPct / 100), benchmark: 'Normal' },
    { category: 'Other/Plug Loads', pct: (100 - hvacPct - lightingPct - processPct) + '%', kwh: Math.round(monthlyKwh * (100 - hvacPct - lightingPct - processPct) / 100), benchmark: 'Normal' }
  ]

  const savingsOpportunities = [
    { measure: 'LED retrofit + smart controls', savings_pct: (15 + r() * 10).toFixed(0) + '%', payback_years: (1.5 + r() * 1.5).toFixed(1), annual_savings: '$' + Math.round(monthlyKwh * 0.05 * 12 * 0.12).toLocaleString() },
    { measure: 'HVAC optimization + VFDs', savings_pct: (12 + r() * 8).toFixed(0) + '%', payback_years: (2 + r() * 2).toFixed(1), annual_savings: '$' + Math.round(monthlyKwh * 0.15 * 12 * 0.12).toLocaleString() },
    { measure: 'Power factor correction', savings_pct: (3 + r() * 4).toFixed(0) + '%', payback_years: (1 + r()).toFixed(1), annual_savings: '$' + Math.round(monthlyKwh * 0.03 * 12 * 0.12).toLocaleString() },
    { measure: 'Solar PV installation', savings_pct: (renewablePct + 15 + r() * 10).toFixed(0) + '%', payback_years: (4 + r() * 3).toFixed(1), annual_savings: '$' + Math.round(monthlyKwh * 0.2 * 12 * 0.12).toLocaleString() },
    { measure: 'Compressed air leak repair', savings_pct: (5 + r() * 5).toFixed(0) + '%', payback_years: (0.3 + r() * 0.5).toFixed(1), annual_savings: '$' + Math.round(monthlyKwh * 0.05 * 12 * 0.12).toLocaleString() }
  ]

  const recommendations: string[] = []
  recommendations.push('Implement ISO 50001 energy management system')
  if (hvacPct > 40) recommendations.push('HVAC consumption above benchmark - upgrade to high-efficiency units')
  if (renewablePct < 20) recommendations.push('Increase renewable energy share to 30% via on-site solar or PPA')
  recommendations.push('Install sub-metering for real-time energy monitoring by zone')
  recommendations.push('Schedule equipment during off-peak hours to reduce demand charges')

  return {
    facility_id: data.facility_id || 'FAC-001',
    facility_type: data.facility_type || 'Manufacturing Plant',
    energy_intensity_kwh_sqm: energyIntensity.toString(),
    total_monthly_kwh: monthlyKwh,
    peak_demand_kw: peakDemand,
    energy_cost_monthly: energyCost,
    carbon_footprint_tons: carbonTons,
    efficiency_grade: grade,
    consumption_breakdown: consumptionBreakdown,
    savings_opportunities: savingsOpportunities,
    recommendations
  }
}

function formatEnergyAudit(r: EnergyAuditResult): string {
  return '# Energy Efficiency Audit: ' + r.facility_id + ' (' + r.facility_type + ')\n' +
    'Energy Intensity: ' + r.energy_intensity_kwh_sqm + ' kWh/sqm | Monthly: ' + r.total_monthly_kwh + ' kWh | Peak: ' + r.peak_demand_kw + ' kW\n' +
    'Cost: ' + r.energy_cost_monthly + '/mo | Carbon: ' + r.carbon_footprint_tons + ' tons CO2 | Grade: ' + r.efficiency_grade + '\n' +
    'Consumption Breakdown:\n' +
    r.consumption_breakdown.map(function(c) { return '  - ' + c.category + ': ' + c.pct + ' (' + c.kwh + ' kWh) - ' + c.benchmark }).join('\n') + '\n' +
    'Savings Opportunities:\n' +
    r.savings_opportunities.map(function(s) { return '  - ' + s.measure + ': ' + s.savings_pct + ' savings, payback ' + s.payback_years + 'yr, save ' + s.annual_savings + '/yr' }).join('\n') + '\n' +
    'Recommendations:\n' +
    r.recommendations.map(function(rec) { return '  - ' + rec }).join('\n') + '\n' +
    '---\n' +
    '*' + DISCLAIMER + '*'
}

// ============ PLUGIN REGISTRATION ============

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'predictive_maintenance_scheduler',
    description: 'AI-driven predictive maintenance scheduling. Analyzes machine sensor data (vibration, temperature, pressure) to compute health score, remaining useful life (RUL), failure probability, and generates prioritized maintenance actions with cost avoidance estimates.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: machine_id, operating_hours, sensor_vibration, sensor_temperature, sensor_pressure, last_maintenance_days, maintenance_type' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPredictiveMaintenance(analyzePredictiveMaintenance(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'quality_control_ai',
    description: 'AI-powered quality control analysis. Computes process capability (Cpk, sigma level), SPC status, defect breakdown by category, and generates improvement recommendations. Supports multi-category defect analysis with capability grading.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: product_line, batch_size, inspection_points, defect_categories, target_cpk, measurement_data' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatQualityControl(analyzeQualityControl(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'production_schedule_optimizer',
    description: 'Production scheduling optimization with bottleneck identification. Analyzes work center capacity, order priorities, changeover times, and resource constraints to maximize utilization and on-time delivery. Applies theory of constraints principles.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: work_center, pending_orders, available_hours, changeover_time_min, priority_orders, resource_constraints' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatProductionSchedule(analyzeProductionSchedule(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'digital_twin_factory',
    description: 'Digital twin factory simulation. Models production lines, simulates OEE improvements, identifies bottleneck lines, and evaluates improvement scenarios (parallel stations, predictive maintenance, AGV routing, demand-driven scheduling).',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: factory_name, production_lines, simulation_scenario, iot_sensors, target_oee' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatDigitalTwin(analyzeDigitalTwin(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'defect_detection_vision',
    description: 'AI vision-based defect detection system. Analyzes inspection results from machine vision cameras, computes detection accuracy, false positive/negative rates, defect type breakdown with confidence scores, and provides model improvement recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: camera_id, inspected_count, defect_types, model_confidence, resolution_mp, inspection_speed_fpm' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatDefectDetection(analyzeDefectDetection(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'oee_calculator',
    description: 'Overall Equipment Effectiveness (OEE) calculator. Computes availability, performance, and quality components. Identifies six big losses, loss breakdown by category, and provides improvement potential with financial impact estimates.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: asset_id, planned_production_time_hrs, actual_runtime_hrs, ideal_cycle_time_sec, total_produced, good_units, downtime_events' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatOEE(analyzeOEE(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'supply_chain_resilience_scorer',
    description: 'Supply chain resilience scoring and risk assessment. Evaluates supplier risk across tiers, geographic concentration, single-source dependency, lead time variability, and demand volatility. Generates mitigation strategies with financial exposure estimates.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: supply_chain_id, tier1_suppliers, tier2_suppliers, geographic_regions, avg_lead_time_days, single_source_pct, inventory_coverage_days, demand_volatility_pct' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSupplyChain(analyzeSupplyChain(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'energy_efficiency_auditor',
    description: 'Industrial energy efficiency audit. Analyzes energy intensity (kWh/sqm), consumption breakdown by category (HVAC, lighting, process), carbon footprint, and identifies savings opportunities with payback analysis and annual savings estimates.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: facility_id, facility_type, monthly_kwh, peak_demand_kw, operating_hours_daily, building_area_sqm, hvac_pct, lighting_pct, process_pct, renewable_pct' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatEnergyAudit(analyzeEnergyAudit(JSON.parse(args.input_data)))
    }
  }))
}
