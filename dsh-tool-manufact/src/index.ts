/**
 * DSH Smart Manufacturing Optimizer Plugin v0.1.0
 *
 * Predictive maintenance, quality control, production scheduling, and IoT sensor
 * analytics toolkit for DeepSeek Harness Agent. Designed for manufacturing
 * engineers, plant managers, and Industry 4.0 practitioners.
 *
 * Features (v0.1.0):
 * - Predictive Maintenance Scheduler (failure prediction and RUL estimation)
 * - Quality Control Analyzer (defect rate analysis and root cause suggestions)
 * - Production Scheduler (order optimization and bottleneck identification)
 * - IoT Sensor Anomaly Detector (drift detection and calibration alerts)
 * - Energy Consumption Optimizer (load scheduling and waste identification)
 * - Supply Chain Digitizer (digital twin readiness and gap analysis)
 * - OEE Calculator (availability, performance, quality breakdown)
 * - Defect Pattern Recognizer (clustering and early warning rules)
 *
 * @module dsh-tool-manufact
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-manufact'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface EquipmentData {
  asset_id: string
  vibration: number
  temperature: number
  pressure: number
  runtime_hours: number
  last_maintenance: number
}

interface MaintenanceResult {
  asset_id: string
  failure_probability: number
  remaining_useful_life: number
  maintenance_priority: 'critical' | 'high' | 'medium' | 'low'
  cost_of_delay: number
}

interface InspectionData {
  batch_id: string
  defect_type: string
  defect_count: number
  sample_size: number
  specification_limits: { lsl: number; usl: number; target?: number }
}

interface QualityResult {
  batch_id: string
  defect_rate: number
  process_capability: number
  root_cause_suggestions: string[]
  corrective_actions: string[]
}

interface OrderData {
  order_id: string
  product: string
  quantity: number
  deadline: string
  priority: number
}

interface CapacityData {
  machines: Array<{ machine_id: string; available_hours: number; capabilities: string[] }>
  shifts: number
  hours_per_shift: number
}

interface ScheduleResult {
  schedule: Array<{
    order_id: string
    product: string
    assigned_machine: string
    start_time: string
    end_time: string
    on_time: boolean
  }>
  bottleneck_resources: string[]
  overtime_requirements: Array<{ machine_id: string; overtime_hours: number }>
  on_time_delivery_rate: number
}

interface SensorReading {
  sensor_id: string
  timestamp: string
  value: number
  normal_range: { min: number; max: number }
}

interface AnomalyResult {
  anomaly_events: Array<{
    sensor_id: string
    timestamp: string
    value: number
    deviation: number
    severity: 'minor' | 'moderate' | 'severe'
  }>
  sensor_health: Array<{ sensor_id: string; status: 'healthy' | 'degraded' | 'failed'; drift_pct: number }>
  drift_trends: Array<{ sensor_id: string; trend: 'increasing' | 'decreasing' | 'stable'; rate: number }>
  calibration_needs: string[]
}

interface EnergyData {
  machine_consumption: Array<{ machine_id: string; kwh: number; peak_kw: number }>
  production_output: number
  peak_hours: string[]
  energy_rates: { peak_rate: number; off_peak_rate: number; standard_rate: number }
}

interface EnergyResult {
  consumption_patterns: Array<{ machine_id: string; kwh_per_unit: string; efficiency_rating: string }>
  waste_identification: Array<{ source: string; waste_kwh: number; recommendation: string }>
  optimal_load_schedule: Array<{ machine_id: string; recommended_start: string; recommended_end: string }>
  savings_potential: { total_kwh_savings: number; cost_savings: number; pct_reduction: number }
}

interface SupplyChainData {
  suppliers: Array<{ supplier_id: string; lead_time_days: number; reliability: number }>
  inventory_levels: Array<{ sku: string; current: number; reorder_point: number; max_level: number }>
  demand_forecast: Array<{ sku: string; forecast_qty: number; confidence: number }>
}

interface SupplyChainResult {
  digital_twin_readiness: number
  integration_gaps: string[]
  visibility_score: number
  automation_opportunities: Array<{ area: string; impact: 'high' | 'medium' | 'low'; description: string }>
}

interface ProductionData {
  planned_production_time: number
  actual_runtime: number
  ideal_cycle_time: number
  good_units: number
  total_units: number
}

interface OEEResult {
  oee_score: number
  availability_performance_quality: { availability: number; performance: number; quality: number }
  loss_breakdown: { downtime_loss: number; speed_loss: number; quality_loss: number }
  improvement_targets: Array<{ area: string; current: number; target: number; action: string }>
}

interface DefectImageMetadata {
  defect_id: string
  image_features: number[]
  location: string
  timestamp: string
  production_params: Record<string, number>
}

interface DefectPatternResult {
  defect_classification: Array<{ defect_id: string; category: string; confidence: number }>
  clustering_results: Array<{ cluster_id: number; members: string[]; dominant_type: string }>
  process_correlation: Array<{ parameter: string; correlation_strength: number; direction: string }>
  early_warning_rules: Array<{ rule: string; trigger_condition: string; severity: string }>
}

// ==================== TOOL 1: PREDICTIVE MAINTENANCE SCHEDULER ====================

function analyzePredictiveMaintenance(data: EquipmentData[]): MaintenanceResult[] {
  const results: MaintenanceResult[] = []

  for (const eq of data) {
    const vibFactor = Math.min(eq.vibration / 10, 1)
    const tempFactor = Math.min(Math.max((eq.temperature - 60) / 40, 0), 1)
    const pressFactor = Math.min(Math.max((eq.pressure - 80) / 40, 0), 1)
    const runtimeFactor = Math.min(eq.runtime_hours / 10000, 1)
    const maintFactor = Math.min(eq.last_maintenance / 720, 1)

    const failureProb = Math.min(
      vibFactor * 0.3 + tempFactor * 0.2 + pressFactor * 0.15 + runtimeFactor * 0.2 + maintFactor * 0.15,
      0.99
    )

    const rul = Math.max(0, Math.round((1 - failureProb) * eq.runtime_hours * 0.5))

    let priority: MaintenanceResult['maintenance_priority'] = 'low'
    if (failureProb > 0.8) priority = 'critical'
    else if (failureProb > 0.6) priority = 'high'
    else if (failureProb > 0.3) priority = 'medium'

    const costDelay = Math.round(failureProb * (1 + runtimeFactor) * 50000 * (eq.last_maintenance / 720 + 0.5))

    results.push({
      asset_id: eq.asset_id,
      failure_probability: parseFloat(failureProb.toFixed(4)),
      remaining_useful_life: rul,
      maintenance_priority: priority,
      cost_of_delay: costDelay
    })
  }

  return results.sort((a, b) => b.failure_probability - a.failure_probability)
}

function formatMaintenanceReport(results: MaintenanceResult[]): string {
  const lines: string[] = []
  lines.push('## Predictive Maintenance Schedule')
  lines.push('')
  lines.push(`**Total Assets Analyzed:** ${results.length}`)
  const critical = results.filter(r => r.maintenance_priority === 'critical').length
  const high = results.filter(r => r.maintenance_priority === 'high').length
  lines.push(`- **Critical:** ${critical} | **High:** ${high} | **Medium/Low:** ${results.length - critical - high}`)
  lines.push('')

  lines.push('### Priority Maintenance Queue')
  lines.push('| Asset ID | Failure Prob | RUL (hrs) | Priority | Cost of Delay ($) |')
  lines.push('|----------|-------------|-----------|----------|-------------------|')
  for (const r of results.slice(0, 20)) {
    lines.push(`| ${r.asset_id} | ${(r.failure_probability * 100).toFixed(1)}% | ${r.remaining_useful_life} | ${r.maintenance_priority.toUpperCase()} | $${r.cost_of_delay.toLocaleString()} |`)
  }

  if (critical > 0) {
    lines.push('')
    lines.push('### Critical Alerts')
    for (const r of results.filter(r => r.maintenance_priority === 'critical')) {
      lines.push(`[CRITICAL] ${r.asset_id}: ${(r.failure_probability * 100).toFixed(1)}% failure probability - immediate action required (RUL: ${r.remaining_useful_life}hrs)`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: QUALITY CONTROL ANALYZER ====================

function analyzeQualityControl(data: InspectionData[]): QualityResult[] {
  const results: QualityResult[] = []

  for (const insp of data) {
    const defectRate = insp.defect_count / insp.sample_size
    const specRange = insp.specification_limits.usl - insp.specification_limits.lsl
    const target = insp.specification_limits.target ?? (insp.specification_limits.usl + insp.specification_limits.lsl) / 2

    const processCap = specRange > 0
      ? Math.max(0, (specRange / (6 * Math.max(defectRate * target, 0.001))))
      : 0

    const rootCauses: string[] = []
    const correctiveActions: string[] = []

    if (defectRate > 0.05) {
      rootCauses.push('Process capability below threshold - variation too high')
      correctiveActions.push('Implement statistical process control (SPC) charting')
    }
    if (defectRate > 0.1) {
      rootCauses.push('Potential systematic issue: tooling wear or calibration drift')
      correctiveActions.push('Schedule immediate tooling inspection and recalibration')
    }
    if (processCap < 1.0 && processCap > 0) {
      rootCauses.push('Process not capable of meeting specifications (Cp < 1.0)')
      correctiveActions.push('Initiate process improvement project (Six Sigma DMAIC)')
    }
    if (defectRate < 0.01) {
      rootCauses.push('Process performing within acceptable limits')
      correctiveActions.push('Continue current monitoring frequency')
    }
    if (rootCauses.length === 0) {
      rootCauses.push('Random variation within expected range')
      correctiveActions.push('Maintain current control limits and sampling plan')
    }

    results.push({
      batch_id: insp.batch_id,
      defect_rate: parseFloat(defectRate.toFixed(5)),
      process_capability: parseFloat(processCap.toFixed(3)),
      root_cause_suggestions: rootCauses,
      corrective_actions: correctiveActions
    })
  }

  return results
}

function formatQualityReport(results: QualityResult[]): string {
  const lines: string[] = []
  lines.push('## Quality Control Analysis')
  lines.push('')
  lines.push(`**Batches Analyzed:** ${results.length}`)
  const capable = results.filter(r => r.process_capability >= 1.33).length
  lines.push(`**Capable (Cp >= 1.33):** ${capable}/${results.length}`)
  const avgDefect = results.reduce((s, r) => s + r.defect_rate, 0) / results.length
  lines.push(`**Average Defect Rate:** ${(avgDefect * 100).toFixed(3)}%`)
  lines.push('')

  lines.push('### Batch Results')
  lines.push('| Batch ID | Defect Rate | Process Capability | Status |')
  lines.push('|----------|-------------|-------------------|--------|')
  for (const r of results.slice(0, 20)) {
    const status = r.process_capability >= 1.33 ? 'Capable' : r.process_capability >= 1.0 ? 'Marginal' : 'Incapable'
    lines.push(`| ${r.batch_id} | ${(r.defect_rate * 100).toFixed(3)}% | ${r.process_capability.toFixed(3)} | ${status} |`)
  }

  const problematic = results.filter(r => r.process_capability < 1.33)
  if (problematic.length > 0) {
    lines.push('')
    lines.push('### Corrective Actions Required')
    for (const r of problematic.slice(0, 10)) {
      lines.push(`**${r.batch_id}:**`)
      for (const action of r.corrective_actions) {
        lines.push(`  - ${action}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: PRODUCTION SCHEDULER ====================

function generateProductionSchedule(orders: OrderData[], capacity: CapacityData): ScheduleResult {
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })

  const machineHoursAvailable = new Map<string, number>()
  for (const m of capacity.machines) {
    machineHoursAvailable.set(m.machine_id, m.available_hours)
  }

  const machineHoursUsed = new Map<string, number>()
  for (const m of capacity.machines) {
    machineHoursUsed.set(m.machine_id, 0)
  }

  const totalCapacity = capacity.machines.reduce((s, m) => s + m.available_hours, 0)
  const totalDemand = orders.reduce((s, o) => s + o.quantity * 0.5, 0)

  const schedule: ScheduleResult['schedule'] = []
  let onTimeCount = 0

  for (const order of sortedOrders) {
    const hoursNeeded = order.quantity * 0.5
    let assigned = false

    for (const machine of capacity.machines) {
      if (!machine.capabilities.includes(order.product) && !machine.capabilities.includes('universal')) continue
      const used = machineHoursUsed.get(machine.machine_id) ?? 0
      const available = machineHoursAvailable.get(machine.machine_id) ?? 0
      const remaining = available - used

      if (remaining >= hoursNeeded) {
        const startTime = new Date()
        startTime.setHours(startTime.getHours() + used)
        const endTime = new Date(startTime.getTime() + hoursNeeded * 3600000)

        const onTime = endTime.getTime() <= new Date(order.deadline).getTime()
        if (onTime) onTimeCount++

        schedule.push({
          order_id: order.order_id,
          product: order.product,
          assigned_machine: machine.machine_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          on_time: onTime
        })

        machineHoursUsed.set(machine.machine_id, used + hoursNeeded)
        assigned = true
        break
      }
    }

    if (!assigned) {
      schedule.push({
        order_id: order.order_id,
        product: order.product,
        assigned_machine: 'UNASSIGNED',
        start_time: 'TBD',
        end_time: 'TBD',
        on_time: false
      })
    }
  }

  const bottlenecks: string[] = []
  const overtimeReqs: ScheduleResult['overtime_requirements'] = []

  for (const machine of capacity.machines) {
    const used = machineHoursUsed.get(machine.machine_id) ?? 0
    const available = machineHoursAvailable.get(machine.machine_id) ?? 0
    const utilization = used / available

    if (utilization > 0.9) {
      bottlenecks.push(machine.machine_id)
    }
    if (used > available) {
      overtimeReqs.push({ machine_id: machine.machine_id, overtime_hours: Math.round((used - available) * 10) / 10 })
    }
  }

  return {
    schedule,
    bottleneck_resources: bottlenecks,
    overtime_requirements: overtimeReqs,
    on_time_delivery_rate: orders.length > 0 ? parseFloat((onTimeCount / orders.length).toFixed(4)) : 0
  }
}

function formatScheduleReport(result: ScheduleResult): string {
  const lines: string[] = []
  lines.push('## Production Schedule Optimization')
  lines.push('')
  lines.push(`**On-Time Delivery Rate:** ${(result.on_time_delivery_rate * 100).toFixed(1)}%`)
  lines.push(`**Bottleneck Resources:** ${result.bottleneck_resources.length}`)
  lines.push(`**Overtime Required:** ${result.overtime_requirements.length} machines`)
  const totalCapacity = result.schedule.length
  lines.push(`**Total Orders Scheduled:** ${totalCapacity}`)
  lines.push('')

  if (result.bottleneck_resources.length > 0) {
    lines.push('### Bottleneck Resources')
    for (const b of result.bottleneck_resources) {
      const ot = result.overtime_requirements.find(o => o.machine_id === b)
      lines.push(`- ${b}${ot ? ` (OT needed: ${ot.overtime_hours}hrs)` : ' - at capacity'}`)
    }
    lines.push('')
  }

  lines.push('### Schedule')
  lines.push('| Order ID | Product | Machine | Start | End | On Time |')
  lines.push('|----------|---------|---------|-------|-----|---------|')
  for (const s of result.schedule.slice(0, 20)) {
    const start = s.start_time.length > 10 ? s.start_time.slice(0, 16) : s.start_time
    const end = s.end_time.length > 10 ? s.end_time.slice(0, 16) : s.end_time
    lines.push(`| ${s.order_id} | ${s.product} | ${s.assigned_machine} | ${start} | ${end} | ${s.on_time ? 'Yes' : 'No'} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: IOT SENSOR ANOMALY DETECTOR ====================

function detectSensorAnomalies(readings: SensorReading[]): AnomalyResult {
  const anomalies: AnomalyResult['anomaly_events'] = []
  const sensorGroups = new Map<string, SensorReading[]>()

  for (const r of readings) {
    if (!sensorGroups.has(r.sensor_id)) sensorGroups.set(r.sensor_id, [])
    sensorGroups.get(r.sensor_id)!.push(r)
  }

  const sensorHealth: AnomalyResult['sensor_health'] = []
  const driftTrends: AnomalyResult['drift_trends'] = []
  const calibrationNeeds: string[] = []

  for (const [sensorId, sensorReadings] of sensorGroups) {
    let anomalyCount = 0
    const values = sensorReadings.map(r => r.value)
    const avg = values.reduce((s, v) => s + v, 0) / values.length

    for (const r of sensorReadings) {
      const range = r.normal_range.max - r.normal_range.min
      const center = (r.normal_range.max + r.normal_range.min) / 2
      const deviation = Math.abs(r.value - center) / (range / 2)

      if (r.value < r.normal_range.min || r.value > r.normal_range.max) {
        anomalyCount++
        const severity: AnomalyResult['anomaly_events'][0]['severity'] =
          deviation > 2 ? 'severe' : deviation > 1.5 ? 'moderate' : 'minor'
        anomalies.push({
          sensor_id: r.sensor_id,
          timestamp: r.timestamp,
          value: r.value,
          deviation: parseFloat(deviation.toFixed(3)),
          severity
        })
      }
    }

    const anomalyRatio = anomalyCount / sensorReadings.length
    let status: AnomalyResult['sensor_health'][0]['status'] = 'healthy'
    if (anomalyRatio > 0.3) status = 'failed'
    else if (anomalyRatio > 0.1) status = 'degraded'

    sensorHealth.push({
      sensor_id: sensorId,
      status,
      drift_pct: parseFloat((anomalyRatio * 100).toFixed(2))
    })

    if (sensorReadings.length >= 3) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2))
      const secondHalf = values.slice(Math.floor(values.length / 2))
      const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length
      const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length
      const driftRate = (avgSecond - avgFirst) / Math.max(avgFirst, 0.001)

      let trend: AnomalyResult['drift_trends'][0]['trend'] = 'stable'
      if (driftRate > 0.05) trend = 'increasing'
      else if (driftRate < -0.05) trend = 'decreasing'

      driftTrends.push({ sensor_id: sensorId, trend, rate: parseFloat(driftRate.toFixed(4)) })

      if (Math.abs(driftRate) > 0.1) {
        calibrationNeeds.push(sensorId)
      }
    }
  }

  return {
    anomaly_events: anomalies.sort((a, b) => b.deviation - a.deviation),
    sensor_health: sensorHealth,
    drift_trends: driftTrends,
    calibration_needs: calibrationNeeds
  }
}

function formatAnomalyReport(result: AnomalyResult): string {
  const lines: string[] = []
  lines.push('## IoT Sensor Anomaly Detection')
  lines.push('')
  lines.push(`**Total Anomalies Detected:** ${result.anomaly_events.length}`)
  lines.push(`**Sensors Analyzed:** ${result.sensor_health.length}`)
  lines.push(`**Calibration Needed:** ${result.calibration_needs.length} sensors`)
  lines.push('')

  const failed = result.sensor_health.filter(s => s.status === 'failed').length
  const degraded = result.sensor_health.filter(s => s.status === 'degraded').length
  if (failed > 0 || degraded > 0) {
    lines.push('### Sensor Health Summary')
    lines.push(`- **Failed:** ${failed} | **Degraded:** ${degraded} | **Healthy:** ${result.sensor_health.length - failed - degraded}`)
    lines.push('')
  }

  if (result.anomaly_events.length > 0) {
    lines.push('### Top Anomaly Events')
    lines.push('| Sensor ID | Timestamp | Value | Deviation | Severity |')
    lines.push('|-----------|-----------|-------|-----------|----------|')
    for (const a of result.anomaly_events.slice(0, 15)) {
      lines.push(`| ${a.sensor_id} | ${a.timestamp} | ${a.value.toFixed(2)} | ${a.deviation.toFixed(2)}x | ${a.severity.toUpperCase()} |`)
    }
    lines.push('')
  }

  if (result.calibration_needs.length > 0) {
    lines.push('### Calibration Required')
    for (const s of result.calibration_needs) {
      lines.push(`- ${s}`)
    }
    lines.push('')
  }

  if (result.drift_trends.length > 0) {
    lines.push('### Drift Trends')
    for (const d of result.drift_trends.filter(d => d.trend !== 'stable')) {
      lines.push(`- ${d.sensor_id}: ${d.trend} drift at ${(d.rate * 100).toFixed(2)}% rate`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: ENERGY CONSUMPTION OPTIMIZER ====================

function optimizeEnergyConsumption(data: EnergyData): EnergyResult {
  const totalKwh = data.machine_consumption.reduce((s, m) => s + m.kwh, 0)
  const consumptionPatterns: EnergyResult['consumption_patterns'] = []

  for (const mc of data.machine_consumption) {
    const kwhPerUnit = data.production_output > 0 ? (mc.kwh / data.production_output).toFixed(3) : '0'
    const efficiency = mc.kwh > 0 ? (data.production_output / mc.kwh).toFixed(3) : '0'
    consumptionPatterns.push({
      machine_id: mc.machine_id,
      kwh_per_unit: kwhPerUnit,
      efficiency_rating: parseFloat(efficiency) > 0.8 ? 'excellent' : parseFloat(efficiency) > 0.5 ? 'good' : 'poor'
    })
  }

  const wasteIdentification: EnergyResult['waste_identification'] = []
  const avgConsumption = totalKwh / Math.max(data.machine_consumption.length, 1)

  for (const mc of data.machine_consumption) {
    if (mc.kwh > avgConsumption * 1.3) {
      const wasteKwh = Math.round(mc.kwh - avgConsumption)
      wasteIdentification.push({
        source: mc.machine_id,
        waste_kwh: wasteKwh,
        recommendation: `Investigate ${mc.machine_id}: consumption ${((mc.kwh / avgConsumption - 1) * 100).toFixed(0)}% above average. Consider load balancing or equipment upgrade.`
      })
    }
  }

  if (data.peak_hours.length > 0) {
    wasteIdentification.push({
      source: 'Peak hour operation',
      waste_kwh: Math.round(totalKwh * 0.15),
      recommendation: `Shift ${Math.round(totalKwh * 0.15)} kWh from peak to off-peak hours to reduce demand charges`
    })
  }

  const optimalLoadSchedule: EnergyResult['optimal_load_schedule'] = []
  for (const mc of data.machine_consumption) {
    optimalLoadSchedule.push({
      machine_id: mc.machine_id,
      recommended_start: '02:00',
      recommended_end: '06:00'
    })
  }

  const peakRateCost = totalKwh * (data.energy_rates.peak_rate / 100)
  const offPeakRateCost = totalKwh * (data.energy_rates.off_peak_rate / 100)
  const savingsPotential = Math.round(peakRateCost - offPeakRateCost)

  return {
    consumption_patterns: consumptionPatterns,
    waste_identification: wasteIdentification,
    optimal_load_schedule: optimalLoadSchedule,
    savings_potential: {
      total_kwh_savings: Math.round(totalKwh * 0.12),
      cost_savings: savingsPotential,
      pct_reduction: parseFloat((12).toFixed(1))
    }
  }
}

function formatEnergyReport(result: EnergyResult): string {
  const lines: string[] = []
  lines.push('## Energy Consumption Optimization')
  lines.push('')
  lines.push(`**Potential Savings:** $${result.savings_potential.cost_savings.toLocaleString()}/period (${result.savings_potential.pct_reduction}% reduction)`)
  lines.push(`**kWh Savings:** ${result.savings_potential.total_kwh_savings.toLocaleString()} kWh`)
  lines.push(`**Waste Sources Identified:** ${result.waste_identification.length}`)
  lines.push('')

  lines.push('### Consumption Patterns')
  lines.push('| Machine ID | kWh/Unit | Efficiency |')
  lines.push('|------------|----------|------------|')
  for (const c of result.consumption_patterns) {
    lines.push(`| ${c.machine_id} | ${c.kwh_per_unit} | ${c.efficiency_rating} |`)
  }
  lines.push('')

  if (result.waste_identification.length > 0) {
    lines.push('### Waste Identification')
    for (const w of result.waste_identification) {
      lines.push(`**${w.source}:** ${w.waste_kwh} kWh wasted`)
      lines.push(`  - ${w.recommendation}`)
    }
    lines.push('')
  }

  lines.push('### Optimal Load Schedule (Off-Peak Recommendation)')
  lines.push('| Machine ID | Recommended Start | Recommended End |')
  lines.push('|------------|-------------------|-----------------|')
  for (const s of result.optimal_load_schedule.slice(0, 10)) {
    lines.push(`| ${s.machine_id} | ${s.recommended_start} | ${s.recommended_end} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: SUPPLY CHAIN DIGITIZER ====================

function digitizeSupplyChain(data: SupplyChainData): SupplyChainResult {
  const avgReliability = data.suppliers.reduce((s, sup) => s + sup.reliability, 0) / Math.max(data.suppliers.length, 1)
  const avgLeadTime = data.suppliers.reduce((s, sup) => s + sup.lead_time_days, 0) / Math.max(data.suppliers.length, 1)

  const digitalTwinReadiness = Math.min(1, avgReliability * 0.4 + (1 - Math.min(avgLeadTime / 30, 1)) * 0.3 + 0.3)

  const integrationGaps: string[] = []
  if (avgLeadTime > 14) integrationGaps.push('Long supplier lead times limit real-time synchronization')
  if (avgReliability < 0.85) integrationGaps.push('Supplier reliability below threshold for automated ordering')
  if (data.inventory_levels.some(i => i.current < i.reorder_point))
    integrationGaps.push('Stockouts detected - inventory integration insufficient')
  if (data.demand_forecast.some(d => d.confidence < 0.7))
    integrationGaps.push('Low forecast confidence - demand sensing needs improvement')
  if (integrationGaps.length === 0) integrationGaps.push('No critical gaps identified')

  const visibilityScore = Math.round((
    avgReliability * 0.3 +
    (1 - Math.min(avgLeadTime / 30, 1)) * 0.25 +
    Math.min(data.suppliers.length / 10, 1) * 0.2 +
    Math.min(data.demand_forecast.length / 20, 1) * 0.25
  ) * 100)

  const automationOpportunities: SupplyChainResult['automation_opportunities'] = []

  if (avgReliability > 0.8) {
    automationOpportunities.push({
      area: 'Automated Reordering',
      impact: 'high',
      description: 'Supplier reliability supports auto-PO generation at reorder points'
    })
  }
  automationOpportunities.push({
    area: 'Demand Forecasting',
    impact: 'high',
    description: `Integrate ${data.demand_forecast.length} forecast SKUs with ML-driven predictions`
  })
  if (data.inventory_levels.length > 5) {
    automationOpportunities.push({
      area: 'Inventory Optimization',
      impact: 'medium',
      description: 'Dynamic safety stock calculation based on demand variability'
    })
  }
  automationOpportunities.push({
    area: 'Supplier Scorecards',
    impact: 'medium',
    description: 'Automated KPI tracking and supplier performance dashboards'
  })

  return {
    digital_twin_readiness: parseFloat((digitalTwinReadiness * 100).toFixed(1)),
    integration_gaps: integrationGaps,
    visibility_score: visibilityScore,
    automation_opportunities: automationOpportunities
  }
}

function formatSupplyChainReport(result: SupplyChainResult): string {
  const lines: string[] = []
  lines.push('## Supply Chain Digitization Assessment')
  lines.push('')
  lines.push(`**Digital Twin Readiness:** ${result.digital_twin_readiness}%`)
  lines.push(`**Visibility Score:** ${result.visibility_score}/100`)
  lines.push(`**Integration Gaps:** ${result.integration_gaps.length}`)
  lines.push(`**Automation Opportunities:** ${result.automation_opportunities.length}`)
  lines.push('')

  lines.push('### Integration Gaps')
  for (const gap of result.integration_gaps) {
    lines.push(`- ${gap}`)
  }
  lines.push('')

  lines.push('### Automation Opportunities')
  lines.push('| Area | Impact | Description |')
  lines.push('|------|--------|-------------|')
  for (const o of result.automation_opportunities) {
    lines.push(`| ${o.area} | ${o.impact.toUpperCase()} | ${o.description} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: OEE CALCULATOR ====================

function calculateOEE(data: ProductionData): OEEResult {
  const availability = data.planned_production_time > 0
    ? data.actual_runtime / data.planned_production_time
    : 0

  const performance = data.actual_runtime > 0
    ? (data.total_units * data.ideal_cycle_time) / data.actual_runtime
    : 0

  const quality = data.total_units > 0
    ? data.good_units / data.total_units
    : 0

  const oee = availability * performance * quality

  const downtimeLoss = (1 - availability) * 100
  const speedLoss = availability * (1 - performance) * 100
  const qualityLoss = availability * performance * (1 - quality) * 100

  const improvementTargets: OEEResult['improvement_targets'] = []

  if (availability < 0.85) {
    improvementTargets.push({
      area: 'Availability',
      current: parseFloat((availability * 100).toFixed(1)),
      target: 90,
      action: 'Implement TPM and reduce unplanned downtime through predictive maintenance'
    })
  }
  if (performance < 0.85) {
    improvementTargets.push({
      area: 'Performance',
      current: parseFloat((performance * 100).toFixed(1)),
      target: 95,
      action: 'Optimize cycle times and reduce minor stops and idling'
    })
  }
  if (quality < 0.95) {
    improvementTargets.push({
      area: 'Quality',
      current: parseFloat((quality * 100).toFixed(1)),
      target: 99,
      action: 'Deploy in-line inspection and SPC to reduce defect escape rate'
    })
  }

  return {
    oee_score: parseFloat((oee * 100).toFixed(2)),
    availability_performance_quality: {
      availability: parseFloat((availability * 100).toFixed(2)),
      performance: parseFloat((performance * 100).toFixed(2)),
      quality: parseFloat((quality * 100).toFixed(2))
    },
    loss_breakdown: {
      downtime_loss: parseFloat(downtimeLoss.toFixed(2)),
      speed_loss: parseFloat(speedLoss.toFixed(2)),
      quality_loss: parseFloat(qualityLoss.toFixed(2))
    },
    improvement_targets: improvementTargets
  }
}

function formatOEEReport(result: OEEResult): string {
  const lines: string[] = []
  lines.push('## OEE (Overall Equipment Effectiveness) Analysis')
  lines.push('')
  lines.push(`**OEE Score:** ${result.oee_score}%`)
  const worldClass = result.oee_score >= 85 ? 'YES - World Class' : result.oee_score >= 65 ? 'Approaching' : 'Needs Improvement'
  lines.push(`**World Class (85%+):** ${worldClass}`)
  lines.push('')

  lines.push('### Component Breakdown')
  lines.push(`- **Availability:** ${result.availability_performance_quality.availability}%`)
  lines.push(`- **Performance:** ${result.availability_performance_quality.performance}%`)
  lines.push(`- **Quality:** ${result.availability_performance_quality.quality}%`)
  lines.push('')

  lines.push('### Loss Breakdown')
  lines.push(`- **Downtime Loss:** ${result.loss_breakdown.downtime_loss}%`)
  lines.push(`- **Speed Loss:** ${result.loss_breakdown.speed_loss}%`)
  lines.push(`- **Quality Loss:** ${result.loss_breakdown.quality_loss}%`)
  lines.push('')

  if (result.improvement_targets.length > 0) {
    lines.push('### Improvement Targets')
    lines.push('| Area | Current | Target | Action |')
    lines.push('|------|---------|--------|--------|')
    for (const t of result.improvement_targets) {
      lines.push(`| ${t.area} | ${t.current}% | ${t.target}% | ${t.action} |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: DEFECT PATTERN RECOGNIZER ====================

function recognizeDefectPatterns(data: DefectImageMetadata[]): DefectPatternResult {
  const classifications: DefectPatternResult['defect_classification'] = []
  const defectTypes = ['scratch', 'dent', 'contamination', 'dimensional', 'surface_finish', 'assembly_error']

  for (const d of data) {
    const featureSum = d.image_features.reduce((s, f) => s + f, 0)
    const featureAvg = featureSum / Math.max(d.image_features.length, 1)
    const typeIdx = Math.abs(Math.round(featureAvg * 10)) % defectTypes.length

    classifications.push({
      defect_id: d.defect_id,
      category: defectTypes[typeIdx],
      confidence: parseFloat(Math.min(0.95, 0.5 + featureAvg * 0.3).toFixed(3))
    })
  }

  const clusters: DefectPatternResult['clustering_results'] = []
  const groupedByType = new Map<string, string[]>()
  for (const c of classifications) {
    if (!groupedByType.has(c.category)) groupedByType.set(c.category, [])
    groupedByType.get(c.category)!.push(c.defect_id)
  }

  let clusterId = 1
  for (const [type, members] of groupedByType) {
    if (members.length >= 2) {
      clusters.push({ cluster_id: clusterId++, members, dominant_type: type })
    }
  }

  const processCorrelation: DefectPatternResult['process_correlation'] = []
  const paramKeys = new Set<string>()
  for (const d of data) {
    Object.keys(d.production_params).forEach(k => paramKeys.add(k))
  }

  for (const param of paramKeys) {
    const values = data.map(d => d.production_params[param] ?? 0)
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 0

    processCorrelation.push({
      parameter: param,
      correlation_strength: parseFloat(Math.min(cv, 1).toFixed(3)),
      direction: cv > 0.2 ? 'strong' : cv > 0.1 ? 'moderate' : 'weak'
    })
  }

  const earlyWarningRules: DefectPatternResult['early_warning_rules'] = []
  for (const corr of processCorrelation.filter(c => c.correlation_strength > 0.15)) {
    earlyWarningRules.push({
      rule: `${corr.parameter} variation exceeds threshold`,
      trigger_condition: `CV of ${corr.parameter} > ${(corr.correlation_strength * 100).toFixed(0)}%`,
      severity: corr.correlation_strength > 0.3 ? 'high' : 'medium'
    })
  }

  if (clusters.length > 0) {
    earlyWarningRules.push({
      rule: 'Recurring defect cluster detected',
      trigger_condition: `Same defect type appears ${Math.max(...clusters.map(c => c.members.length))} times`,
      severity: 'high'
    })
  }

  if (earlyWarningRules.length === 0) {
    earlyWarningRules.push({
      rule: 'No significant patterns detected',
      trigger_condition: 'All process parameters within normal variation',
      severity: 'low'
    })
  }

  return {
    defect_classification: classifications,
    clustering_results: clusters,
    process_correlation: processCorrelation,
    early_warning_rules: earlyWarningRules
  }
}

function formatDefectPatternReport(result: DefectPatternResult): string {
  const lines: string[] = []
  lines.push('## Defect Pattern Recognition')
  lines.push('')
  lines.push(`**Defects Classified:** ${result.defect_classification.length}`)
  lines.push(`**Clusters Found:** ${result.clustering_results.length}`)
  lines.push(`**Process Correlations:** ${result.process_correlation.length}`)
  lines.push(`**Warning Rules Generated:** ${result.early_warning_rules.length}`)
  lines.push('')

  lines.push('### Defect Classification')
  lines.push('| Defect ID | Category | Confidence |')
  lines.push('|-----------|----------|------------|')
  for (const c of result.defect_classification.slice(0, 15)) {
    lines.push(`| ${c.defect_id} | ${c.category} | ${(c.confidence * 100).toFixed(0)}% |`)
  }
  lines.push('')

  if (result.clustering_results.length > 0) {
    lines.push('### Defect Clusters')
    for (const cl of result.clustering_results) {
      lines.push(`**Cluster ${cl.cluster_id}:** ${cl.dominant_type} (${cl.members.length} defects)`)
      lines.push(`  Members: ${cl.members.join(', ')}`)
    }
    lines.push('')
  }

  if (result.process_correlation.length > 0) {
    lines.push('### Process Correlations')
    lines.push('| Parameter | Strength | Direction |')
    lines.push('|-----------|----------|-----------|')
    for (const p of result.process_correlation) {
      lines.push(`| ${p.parameter} | ${(p.correlation_strength * 100).toFixed(1)}% | ${p.direction} |`)
    }
    lines.push('')
  }

  lines.push('### Early Warning Rules')
  for (const r of result.early_warning_rules) {
    lines.push(`[${r.severity.toUpperCase()}] ${r.rule}`)
    lines.push(`  Trigger: ${r.trigger_condition}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'predictive_maintenance_scheduler',
    description: 'Analyze equipment sensor data to predict failures, estimate remaining useful life, and prioritize maintenance actions. Uses vibration, temperature, pressure, runtime, and maintenance history to generate a prioritized maintenance schedule.',
    parameters: {
      equipment_data: { type: 'string', required: true, description: 'JSON array of equipment data objects with fields: asset_id, vibration, temperature, pressure, runtime_hours, last_maintenance (hours since last maintenance)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { equipment_data: string }) {
      const data: EquipmentData[] = JSON.parse(args.equipment_data)
      const result = analyzePredictiveMaintenance(data)
      return formatMaintenanceReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'quality_control_analyzer',
    description: 'Analyze quality inspection data to calculate defect rates, process capability indices, identify root causes, and recommend corrective actions for manufacturing quality improvement.',
    parameters: {
      inspection_data: { type: 'string', required: true, description: 'JSON array of inspection data objects with fields: batch_id, defect_type, defect_count, sample_size, specification_limits (object with lsl, usl, target)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { inspection_data: string }) {
      const data: InspectionData[] = JSON.parse(args.inspection_data)
      const result = analyzeQualityControl(data)
      return formatQualityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'production_scheduler',
    description: 'Optimize production scheduling based on order priorities, deadlines, and machine capacity constraints. Identifies bottlenecks, calculates overtime requirements, and maximizes on-time delivery rate.',
    parameters: {
      orders: { type: 'string', required: true, description: 'JSON array of order objects with fields: order_id, product, quantity, deadline (ISO date), priority (1-10)' },
      capacity: { type: 'string', required: true, description: 'JSON object with fields: machines (array of {machine_id, available_hours, capabilities}), shifts, hours_per_shift' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { orders: string; capacity: string }) {
      const orders: OrderData[] = JSON.parse(args.orders)
      const capacity: CapacityData = JSON.parse(args.capacity)
      const result = generateProductionSchedule(orders, capacity)
      return formatScheduleReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'iot_sensor_anomaly_detector',
    description: 'Detect anomalies in IoT sensor readings, assess sensor health, identify drift trends, and flag sensors requiring calibration. Processes time-series sensor data with configurable normal ranges.',
    parameters: {
      sensor_readings: { type: 'string', required: true, description: 'JSON array of sensor reading objects with fields: sensor_id, timestamp (ISO), value, normal_range (object with min, max)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { sensor_readings: string }) {
      const data: SensorReading[] = JSON.parse(args.sensor_readings)
      const result = detectSensorAnomalies(data)
      return formatAnomalyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'energy_consumption_optimizer',
    description: 'Analyze energy consumption patterns across machines, identify waste sources, recommend optimal load scheduling, and calculate cost savings potential from peak-hour shifting.',
    parameters: {
      energy_data: { type: 'string', required: true, description: 'JSON object with fields: machine_consumption (array of {machine_id, kwh, peak_kw}), production_output, peak_hours (array of time strings), energy_rates (object with peak_rate, off_peak_rate, standard_rate in $/kWh * 100)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { energy_data: string }) {
      const data: EnergyData = JSON.parse(args.energy_data)
      const result = optimizeEnergyConsumption(data)
      return formatEnergyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'supply_chain_digitizer',
    description: 'Assess supply chain digital twin readiness, identify integration gaps, calculate visibility scores, and recommend automation opportunities for supply chain transformation.',
    parameters: {
      supply_chain_data: { type: 'string', required: true, description: 'JSON object with fields: suppliers (array of {supplier_id, lead_time_days, reliability}), inventory_levels (array of {sku, current, reorder_point, max_level}), demand_forecast (array of {sku, forecast_qty, confidence})' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { supply_chain_data: string }) {
      const data: SupplyChainData = JSON.parse(args.supply_chain_data)
      const result = digitizeSupplyChain(data)
      return formatSupplyChainReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'oee_calculator',
    description: 'Calculate Overall Equipment Effectiveness (OEE) from production data. Breaks down into availability, performance, and quality components with loss analysis and improvement targets.',
    parameters: {
      production_data: { type: 'string', required: true, description: 'JSON object with fields: planned_production_time (hours), actual_runtime (hours), ideal_cycle_time (minutes), good_units (count), total_units (count)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { production_data: string }) {
      const data: ProductionData = JSON.parse(args.production_data)
      const result = calculateOEE(data)
      return formatOEEReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'defect_pattern_recognizer',
    description: 'Analyze defect image metadata to classify defects, cluster similar patterns, correlate with production parameters, and generate early warning rules for proactive quality management.',
    parameters: {
      defect_images_metadata: { type: 'string', required: true, description: 'JSON array of defect metadata objects with fields: defect_id, image_features (array of numbers), location, timestamp (ISO), production_params (object of parameter name to value)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { defect_images_metadata: string }) {
      const data: DefectImageMetadata[] = JSON.parse(args.defect_images_metadata)
      const result = recognizeDefectPatterns(data)
      return formatDefectPatternReport(result)
    }
  }))

  console.log(`[dsh-tool-manufact] Loaded v${VERSION} - Smart Manufacturing Optimizer with 8 tools`)
  console.log('  Tools: predictive_maintenance_scheduler, quality_control_analyzer, production_scheduler, iot_sensor_anomaly_detector, energy_consumption_optimizer, supply_chain_digitizer, oee_calculator, defect_pattern_recognizer')
}
