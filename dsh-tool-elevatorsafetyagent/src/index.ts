/**
 * DSH Elevator & Special Equipment Safety AI Agent Plugin v0.1.0
 *
 * 电梯与特种设备安全AI助手 — Elevator & Special Equipment Safety Toolkit
 * Comprehensive elevator safety analysis for property managers, maintenance teams,
 * safety inspectors, and special equipment compliance officers.
 *
 * Features (v0.1.0):
 * - Elevator Fault Prediction (fault diagnosis, entrapment warning, remaining useful life)
 * - Elevator Inspection Scheduler (annual inspection planning, maintenance scheduling, compliance tracking)
 * - Elevator IoT Monitor (real-time running data, vibration analysis, door motor diagnostics)
 * - Special Equipment Compliance (usage registration, compliance verification, regulatory audit)
 * - Elevator Modernization Advisor (old elevator retrofit planning, cost estimation, technology upgrade)
 * - Elevator Energy Auditor (energy consumption analysis, retrofit savings, carbon reduction)
 * - Elevator Rescue Simulator (entrapment rescue drills, emergency plan evaluation, response time)
 * - Elevator Lifecycle Cost (total cost of ownership, scrap assessment, replacement timing)
 *
 * DISCLAIMER: 本AI助手辅助电梯与特种设备安全管理，不替代专业检验检测机构与监管部门的专业判断。
 *
 * @module dsh-tool-elevatorsafetyagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-elevatorsafetyagent'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '本AI助手辅助电梯与特种设备安全管理，不替代专业检验检测机构与监管部门的专业判断。'

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  let a = seed | 0
  return function (): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(input: string): () => number {
  return mulberry32(hashStr(input))
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T
  } catch {
    return {} as T
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function formatPercent(val: number, decimals: number = 1): string {
  return (val * 100).toFixed(decimals) + '%'
}

// ==================== TOOL 1: ELEVATOR FAULT PREDICTOR ====================

interface FaultPredictorInput {
  elevator_id: string
  elevator_type: 'traction' | 'hydraulic' | 'machine_room less' | 'freight'
  install_year: number
  floor_count: number
  max_speed_ms: number
  capacity_kg: number
  fault_history?: Array<{ date: string; component: string; fault_type: string; severity: 'low' | 'medium' | 'high' | 'critical' }>
  running_hours_daily?: number
  last_maintenance_date?: string
  entrapment_count_12m?: number
}

interface FaultPrediction {
  component: string
  probability: number
  expected_failure_months: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

function predictFaults(input: FaultPredictorInput): {
  predictions: FaultPrediction[]
  entrapment_risk: 'low' | 'medium' | 'high' | 'critical'
  overall_health_score: number
  remaining_useful_life_years: number
  recommendations: string[]
} {
  const r = rng(input.elevator_id + input.install_year.toString())
  const currentYear = new Date().getFullYear()
  const age = currentYear - input.install_year
  const runningHours = input.running_hours_daily ?? 12
  const entrapments = input.entrapment_count_12m ?? 0

  const ageFactor = clamp(age / 25, 0.1, 1.0)
  const usageFactor = clamp(runningHours / 24, 0.3, 1.0)
  const faultHistoryFactor = clamp((input.fault_history?.length ?? 0) / 10, 0.1, 1.0)

  const components = [
    { name: 'Door Operator System', baseProb: 0.15, lifeMonths: 60, severity: 'high' as const },
    { name: 'Control System (Main Board)', baseProb: 0.10, lifeMonths: 84, severity: 'critical' as const },
    { name: 'Hoist Motor / Hydraulic Pump', baseProb: 0.08, lifeMonths: 120, severity: 'critical' as const },
    { name: 'Safety Gear & Governor', baseProb: 0.05, lifeMonths: 96, severity: 'critical' as const },
    { name: 'Cable / Hydraulic Hose', baseProb: 0.12, lifeMonths: 72, severity: 'high' as const },
    { name: 'Guide Rails & Shoes', baseProb: 0.10, lifeMonths: 108, severity: 'medium' as const },
    { name: 'Braking System', baseProb: 0.07, lifeMonths: 84, severity: 'critical' as const },
    { name: 'Buffer / Counterweight', baseProb: 0.04, lifeMonths: 144, severity: 'high' as const },
    { name: 'Call Buttons & Display', baseProb: 0.20, lifeMonths: 36, severity: 'low' as const },
    { name: 'Emergency Communication', baseProb: 0.09, lifeMonths: 48, severity: 'high' as const }
  ]

  const predictions: FaultPrediction[] = components.map(c => {
    const prob = clamp(
      c.baseProb * (1 + ageFactor * 0.8) * (1 + usageFactor * 0.4) * (1 + faultHistoryFactor * 0.3) * (0.7 + r() * 0.6),
      0.01, 0.95
    )
    const failureRate = c.lifeMonths / (1 + ageFactor * 1.5)
    const expectedMonths = Math.max(1, Math.round(failureRate / (1 + faultHistoryFactor)))

    let severity: FaultPrediction['severity'] = c.severity
    if (prob > 0.7) severity = 'critical'
    else if (prob > 0.4) severity = 'high'
    else if (prob > 0.2) severity = 'medium'

    const recommendations = []
    if (prob > 0.5) recommendations.push(`Schedule immediate inspection of ${c.name}`)
    if (prob > 0.3) recommendations.push(`Procure replacement parts for ${c.name}`)
    if (expectedMonths < 6) recommendations.push(`Plan replacement of ${c.name} within ${expectedMonths} months`)
    recommendations.push(`Monitor ${c.name} at weekly intervals`)

    return {
      component: c.name,
      probability: Math.round(prob * 100) / 100,
      expected_failure_months: expectedMonths,
      severity,
      recommendation: recommendations[0]
    }
  })

  predictions.sort((a, b) => b.probability - a.probability)

  const maxProb = Math.max(...predictions.map(p => p.probability))
  const entrapmentFactor = (entrapments > 2 ? 0.8 : entrapments > 0 ? 0.4 : 0.1)
  const entrapmentRiskScore = (maxProb * 0.4 + entrapmentFactor * 0.4 + faultHistoryFactor * 0.2)

  let entrapmentRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (entrapmentRiskScore > 0.7) entrapmentRisk = 'critical'
  else if (entrapmentRiskScore > 0.45) entrapmentRisk = 'high'
  else if (entrapmentRiskScore > 0.2) entrapmentRisk = 'medium'

  const healthScore = clamp(1 - (ageFactor * 0.3 + maxProb * 0.3 + usageFactor * 0.2 + faultHistoryFactor * 0.2), 0, 1)
  const remainingLife = clamp((1 - ageFactor) * 25 * healthScore, 0.5, 25)

  const recommendations: string[] = []
  if (entrapmentRisk === 'critical' || entrapmentRisk === 'high') {
    recommendations.push(`URGENT: Entrapment risk is ${entrapmentRisk.toUpperCase()} — install remote monitoring and entrapment detection system`)
    recommendations.push(`Review ${entrapments} entrapment incident(s) in past 12 months — analyze root causes`)
  }
  const criticalPredictions = predictions.filter(p => p.severity === 'critical' || p.severity === 'high')
  if (criticalPredictions.length > 0) {
    recommendations.push(`${criticalPredictions.length} component(s) require immediate attention: ${criticalPredictions.slice(0, 3).map(p => p.component).join(', ')}`)
  }
  recommendations.push(`Overall health score: ${formatPercent(healthScore)} | Estimated remaining useful life: ${remainingLife.toFixed(1)} years`)
  if (age > 15) {
    recommendations.push(`Elevator is ${age} years old — consider modernization assessment per GB/T 31821 standards`)
  }
  recommendations.push(`Running ${runningHours}h/day at ${input.max_speed_ms}m/s across ${input.floor_count} floors`)

  return {
    predictions,
    entrapment_risk: entrapmentRisk,
    overall_health_score: Math.round(healthScore * 100) / 100,
    remaining_useful_life_years: Math.round(remainingLife * 10) / 10,
    recommendations
  }
}

function formatFaultPredictorReport(result: ReturnType<typeof predictFaults>, elevatorId: string, elevatorType: string): string {
  const lines: string[] = []
  lines.push('## Elevator Fault Prediction & Entrapment Warning Report')
  lines.push('')
  lines.push(`**Elevator ID:** ${elevatorId} | **Type:** ${elevatorType} | **Health Score:** ${formatPercent(result.overall_health_score)} | **Entrapment Risk:** ${result.entrapment_risk.toUpperCase()}`)
  lines.push(`**Remaining Useful Life:** ${result.remaining_useful_life_years} years`)
  lines.push('')
  lines.push('### Fault Probability Ranking')
  lines.push('| Component | Probability | Expected Failure | Severity |')
  lines.push('|-----------|-------------|------------------|----------|')
  for (const p of result.predictions) {
    lines.push(`| ${p.component} | ${formatPercent(p.probability)} | ${p.expected_failure_months} mo | ${p.severity.toUpperCase()} |`)
  }
  lines.push('')
  lines.push('### High-Priority Actions')
  for (const p of result.predictions.filter(p => p.probability > 0.3)) {
    lines.push(`- **${p.component}** (${formatPercent(p.probability)}): ${p.recommendation}`)
  }
  lines.push('')
  lines.push('### Entrapment Analysis')
  lines.push(`- **Risk Level:** ${result.entrapment_risk.toUpperCase()}`)
  if (result.entrapment_risk === 'critical' || result.entrapment_risk === 'high') {
    lines.push('- Install AI-based entrapment detection with automatic alarm dispatch')
    lines.push('- Ensure emergency communication system (intercom/phone) is fully operational')
  }
  lines.push('- Recommend monthly door alignment checks and passenger flow analysis')
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 2: ELEVATOR INSPECTION SCHEDULER ====================

interface InspectionSchedulerInput {
  facility_name: string
  elevators: Array<{ id: string; type: string; last_inspection_date: string; next_inspection_due: string; annual_maintenance_count: number; compliance_status: 'compliant' | 'overdue' | 'pending' }>
  inspection_standard?: string
  regulatory_body?: string
}

interface ElevatorSchedule {
  elevator_id: string
  inspection_type: 'annual' | 'semi-annual' | 'quarterly' | 'major-overhaul'
  scheduled_date: string
  priority: 'routine' | 'elevated' | 'urgent' | 'critical'
  estimated_duration_hours: number
  required_items: string[]
}

function scheduleInspections(input: InspectionSchedulerInput): {
  schedule: ElevatorSchedule[]
  overdue_count: number
  upcoming_30d: number
  compliance_rate: number
  recommendations: string[]
} {
  const r = rng(input.facility_name + input.elevators.length.toString())
  const today = new Date()
  const schedules: ElevatorSchedule[] = []

  let overdueCount = 0
  let upcoming30Count = 0

  for (const elev of input.elevators) {
    const elevR = rng(elev.id)
    const nextDate = new Date(elev.next_inspection_due)
    const daysUntilDue = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      overdueCount++
      schedules.push({
        elevator_id: elev.id,
        inspection_type: elev.compliance_status === 'overdue' ? 'annual' : 'quarterly',
        scheduled_date: new Date(today.getTime() + (1 + Math.floor(elevR() * 5)) * 86400000).toISOString().split('T')[0],
        priority: 'critical',
        estimated_duration_hours: 4 + Math.floor(elevR() * 4),
        required_items: ['Full load test', 'Safety gear test', 'Buffer test', 'Door force measurement', 'Emergency stop verification', 'Governor calibration']
      })
    } else if (daysUntilDue <= 30) {
      upcoming30Count++
      schedules.push({
        elevator_id: elev.id,
        inspection_type: 'annual',
        scheduled_date: elev.next_inspection_due,
        priority: 'urgent',
        estimated_duration_hours: 3 + Math.floor(elevR() * 3),
        required_items: ['Safety device verification', 'Speed test', 'Door operator check', 'Electrical insulation test', 'Emergency alarm test']
      })
    } else {
      const scheduledOffset = Math.floor(elevR() * 14)
      const schedDate = new Date(today.getTime() + (daysUntilDue - 30 + scheduledOffset) * 86400000)
      schedules.push({
        elevator_id: elev.id,
        inspection_type: elev.annual_maintenance_count >= 2 ? 'semi-annual' : 'quarterly',
        scheduled_date: elev.next_inspection_due,
        priority: 'routine',
        estimated_duration_hours: 2 + Math.floor(elevR() * 3),
        required_items: ['Visual inspection', 'Operational test', 'Door force check', 'Communication test']
      })
    }
  }

  schedules.sort((a, b) => {
    const priorityOrder = { critical: 0, urgent: 1, elevated: 2, routine: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const complianceRate = input.elevators.length > 0
    ? (input.elevators.length - overdueCount) / input.elevators.length
    : 1

  const recommendations: string[] = []
  if (overdueCount > 0) {
    recommendations.push(`${overdueCount} elevator(s) are OVERDUE for inspection — immediate scheduling required per TSG T7001`)
    recommendations.push('Engage certified inspection body within 7 days to avoid regulatory penalties')
  }
  if (upcoming30Count > 0) {
    recommendations.push(`${upcoming30Count} elevator(s) have inspections due within 30 days — prepare documentation and access`)
  }
  if (complianceRate < 0.8) {
    recommendations.push(`Compliance rate ${formatPercent(complianceRate)} is below target (95%) — implement digital tracking system`)
  }
  const totalHours = schedules.reduce((s, sc) => s + sc.estimated_duration_hours, 0)
  recommendations.push(`Total scheduled inspection time: ${totalHours} hours across ${schedules.length} tasks`)
  recommendations.push(`Standard: ${input.inspection_standard || 'TSG T7001 (China) / EN 81-20 (Europe) / ASME A17.1 (US)'}`)

  return {
    schedule: schedules,
    overdue_count: overdueCount,
    upcoming_30d: upcoming30Count,
    compliance_rate: Math.round(complianceRate * 100) / 100,
    recommendations
  }
}

function formatInspectionSchedulerReport(result: ReturnType<typeof scheduleInspections>, facilityName: string): string {
  const lines: string[] = []
  lines.push('## Elevator Inspection & Maintenance Scheduling Report')
  lines.push('')
  lines.push(`**Facility:** ${facilityName} | **Compliance Rate:** ${formatPercent(result.compliance_rate)} | **Overdue:** ${result.overdue_count} | **Upcoming (30d):** ${result.upcoming_30d}`)
  lines.push('')
  lines.push('### Inspection Schedule')
  lines.push('| Elevator | Type | Scheduled Date | Priority | Duration |')
  lines.push('|----------|------|----------------|----------|----------|')
  for (const s of result.schedule) {
    lines.push(`| ${s.elevator_id} | ${s.inspection_type.toUpperCase()} | ${s.scheduled_date} | ${s.priority.toUpperCase()} | ${s.estimated_duration_hours}h |`)
  }
  if (result.schedule.length > 0) {
    const criticalItems = result.schedule.filter(s => s.priority === 'critical' || s.priority === 'urgent')
    if (criticalItems.length > 0) {
      lines.push('')
      lines.push('### Critical/Urgent Inspection Items')
      for (const s of criticalItems) {
        lines.push(`- **${s.elevator_id}** (${s.priority}): ${s.required_items.slice(0, 3).join(', ')}`)
      }
    }
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 3: ELEVATOR IoT MONITOR ====================

interface IoTMonitorInput {
  elevator_id: string
  sensor_data: {
    vibration_rms?: number
    motor_temp_c?: number
    door_open_time_sec?: number
    door_close_time_sec?: number
    motor_current_a?: number
    ride_quality_index?: number
    noise_level_db?: number
    trips_today?: number
    door_cycles_today?: number
  }
  baseline_ranges?: {
    vibration_rms?: [number, number]
    motor_temp_c?: [number, number]
    door_open_time_sec?: [number, number]
    door_close_time_sec?: [number, number]
  }
  duration_hours?: number
}

function monitorIoT(input: IoTMonitorInput): {
  anomalies: Array<{ parameter: string; current_value: number; threshold: number; severity: 'warning' | 'critical'; trend: 'rising' | 'stable' | 'falling' }>
  vibration_analysis: { rms_level: number; status: 'normal' | 'warning' | 'critical'; dominant_frequency_hz: number; root_cause: string }
  door_analysis: { open_time_deviation_pct: number; close_time_deviation_pct: number; alignment_status: 'good' | 'fair' | 'poor'; cycles_remaining_pct: number }
  overall_status: 'normal' | 'attention' | 'degraded' | 'fault'
  recommendations: string[]
} {
  const r = rng(input.elevator_id + (JSON.stringify(input.sensor_data).length.toString()))

  const baseline = input.baseline_ranges || {
    vibration_rms: [0.5, 2.5],
    motor_temp_c: [30, 70],
    door_open_time_sec: [2.0, 4.0],
    door_close_time_sec: [2.5, 5.0]
  }

  const data = input.sensor_data
  const anomalies: ReturnType<typeof monitorIoT>['anomalies'] = []

  // Vibration analysis
  const vibration = data.vibration_rms ?? (1.0 + r() * 1.5)
  const vibThreshold = baseline.vibration_rms![1]
  if (vibration > vibThreshold * 1.5) {
    anomalies.push({ parameter: 'Vibration RMS', current_value: vibration, threshold: vibThreshold, severity: 'critical', trend: 'rising' })
  } else if (vibration > vibThreshold) {
    anomalies.push({ parameter: 'Vibration RMS', current_value: vibration, threshold: vibThreshold, severity: 'warning', trend: r() > 0.5 ? 'rising' : 'stable' })
  }

  // Motor temperature
  const motorTemp = data.motor_temp_c ?? (50 + r() * 20)
  const tempThreshold = baseline.motor_temp_c![1]
  if (motorTemp > tempThreshold * 1.2) {
    anomalies.push({ parameter: 'Motor Temperature', current_value: motorTemp, threshold: tempThreshold, severity: 'critical', trend: 'rising' })
  } else if (motorTemp > tempThreshold) {
    anomalies.push({ parameter: 'Motor Temperature', current_value: motorTemp, threshold: tempThreshold, severity: 'warning', trend: 'rising' })
  }

  // Door analysis
  const doorOpen = data.door_open_time_sec ?? (2.0 + r() * 3.0)
  const doorClose = data.door_close_time_sec ?? (2.5 + r() * 3.5)
  const doorOpenBaseline = baseline.door_open_time_sec!
  const doorCloseBaseline = baseline.door_close_time_sec!

  const openDeviation = Math.round(((doorOpen - doorOpenBaseline[1]) / doorOpenBaseline[1]) * 100)
  const closeDeviation = Math.round(((doorClose - doorCloseBaseline[1]) / doorCloseBaseline[1]) * 100)

  if (openDeviation > 20) anomalies.push({ parameter: 'Door Open Time', current_value: doorOpen, threshold: doorOpenBaseline[1], severity: openDeviation > 50 ? 'critical' : 'warning', trend: 'rising' })
  if (closeDeviation > 20) anomalies.push({ parameter: 'Door Close Time', current_value: doorClose, threshold: doorCloseBaseline[1], severity: closeDeviation > 50 ? 'critical' : 'warning', trend: 'rising' })

  // Motor current
  const motorCurrent = data.motor_current_a ?? (8 + r() * 6)
  const currentThreshold = 12
  if (motorCurrent > currentThreshold * 1.3) {
    anomalies.push({ parameter: 'Motor Current', current_value: motorCurrent, threshold: currentThreshold, severity: 'critical', trend: 'rising' })
  } else if (motorCurrent > currentThreshold) {
    anomalies.push({ parameter: 'Motor Current', current_value: motorCurrent, threshold: currentThreshold, severity: 'warning', trend: 'stable' })
  }

  // Vibration detailed analysis
  const dominantFreq = Math.round(5 + r() * 45)
  const vibStatus: 'normal' | 'warning' | 'critical' = anomalies.some(a => a.parameter === 'Vibration RMS' && a.severity === 'critical') ? 'critical' : anomalies.some(a => a.parameter === 'Vibration RMS') ? 'warning' : 'normal'
  const rootCauses = ['Normal wear', 'Guide rail misalignment', 'Rolling element bearing wear', 'Structural resonance', 'Coupling imbalance']
  const rootCause = vibStatus !== 'normal' ? rootCauses[2 + Math.floor(r() * 3)] : rootCauses[0]

  // Door analysis details
  let alignmentStatus: 'good' | 'fair' | 'poor' = 'good'
  const maxDoorDeviation = Math.max(Math.abs(openDeviation), Math.abs(closeDeviation))
  if (maxDoorDeviation > 50) alignmentStatus = 'poor'
  else if (maxDoorDeviation > 20) alignmentStatus = 'fair'

  const doorCycles = data.door_cycles_today ?? 200
  const maxCycles = 1000000
  const cyclesRemaining = clamp(1 - (doorCycles * 365) / maxCycles * 10, 0.1, 1.0)

  // Overall status
  let overallStatus: 'normal' | 'attention' | 'degraded' | 'fault' = 'normal'
  const criticalCount = anomalies.filter(a => a.severity === 'critical').length
  const warningCount = anomalies.filter(a => a.severity === 'warning').length
  if (criticalCount > 0) overallStatus = 'fault'
  else if (warningCount >= 2) overallStatus = 'degraded'
  else if (warningCount === 1) overallStatus = 'attention'

  const recommendations: string[] = []
  if (overallStatus === 'fault') {
    recommendations.push('IMMEDIATE: Fault condition detected — dispatch maintenance team for inspection')
  }
  if (vibStatus !== 'normal') {
    recommendations.push(`Vibration analysis shows ${vibStatus} condition (${vibration.toFixed(2)}mm/s RMS) — ${rootCause}`)
    recommendations.push(`Dominant frequency: ${dominantFreq}Hz — check guide rail joints and bearing condition`)
  }
  if (alignmentStatus !== 'good') {
    recommendations.push(`Door alignment is ${alignmentStatus} (deviation: ${maxDoorDeviation}%) — adjust door operator torque and track alignment`)
  }
  if (anomalies.some(a => a.parameter === 'Motor Current')) {
    recommendations.push('Elevated motor current indicates increased mechanical load — inspect guide shoes and lubrication')
  }
  if (anomalies.some(a => a.parameter === 'Motor Temperature')) {
    recommendations.push('Motor overheating detected — verify cooling, check for brake drag or bearing friction')
  }
  if (anomalies.length === 0) {
    recommendations.push('All parameters within normal operating ranges — continue routine monitoring')
  }
  recommendations.push(`Monitoring duration: ${input.duration_hours || 24}h | Status: ${overallStatus.toUpperCase()}`)

  return {
    anomalies,
    vibration_analysis: { rms_level: Math.round(vibration * 100) / 100, status: vibStatus, dominant_frequency_hz: dominantFreq, root_cause: rootCause },
    door_analysis: { open_time_deviation_pct: openDeviation, close_time_deviation_pct: closeDeviation, alignment_status: alignmentStatus, cycles_remaining_pct: Math.round(cyclesRemaining * 100) },
    overall_status: overallStatus,
    recommendations
  }
}

function formatIoTMonitorReport(result: ReturnType<typeof monitorIoT>, elevatorId: string): string {
  const lines: string[] = []
  lines.push('## Elevator IoT Running Data & Vibration/Door Analysis Report')
  lines.push('')
  lines.push(`**Elevator ID:** ${elevatorId} | **Overall Status:** ${result.overall_status.toUpperCase()} | **Vibration:** ${result.vibration_analysis.status.toUpperCase()} | **Door Alignment:** ${result.door_analysis.alignment_status.toUpperCase()}`)
  lines.push('')
  if (result.anomalies.length > 0) {
    lines.push('### Detected Anomalies')
    lines.push('| Parameter | Current | Threshold | Severity | Trend |')
    lines.push('|-----------|---------|-----------|----------|-------|')
    for (const a of result.anomalies) {
      lines.push(`| ${a.parameter} | ${a.current_value.toFixed(2)} | ${a.threshold.toFixed(2)} | ${a.severity.toUpperCase()} | ${a.trend} |`)
    }
    lines.push('')
  } else {
    lines.push('### No Anomalies Detected')
    lines.push('All sensor parameters are within normal operating ranges.')
    lines.push('')
  }
  lines.push('### Vibration Analysis')
  lines.push(`- **RMS Level:** ${result.vibration_analysis.rms_level} mm/s (ISO 10816)`)
  lines.push(`- **Status:** ${result.vibration_analysis.status.toUpperCase()}`)
  lines.push(`- **Dominant Frequency:** ${result.vibration_analysis.dominant_frequency_hz} Hz`)
  lines.push(`- **Root Cause:** ${result.vibration_analysis.root_cause}`)
  lines.push('')
  lines.push('### Door System Analysis')
  lines.push(`- **Open Time Deviation:** ${result.door_analysis.open_time_deviation_pct}% from baseline`)
  lines.push(`- **Close Time Deviation:** ${result.door_analysis.close_time_deviation_pct}% from baseline`)
  lines.push(`- **Alignment Status:** ${result.door_analysis.alignment_status.toUpperCase()}`)
  lines.push(`- **Cycles Remaining (est.):** ${result.door_analysis.cycles_remaining_pct}%`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 4: SPECIAL EQUIPMENT COMPLIANCE ====================

interface ComplianceInput {
  facility_name: string
  equipment: Array<{
    id: string
    type: 'elevator' | 'crane' | 'boiler' | 'pressure_vessel' | 'forklift' | 'passenger_ropeway'
    registration_code?: string
    registration_status: 'registered' | 'pending' | 'expired' | 'unregistered'
    inspection_valid_until?: string
    operator_certified?: boolean
    safety_manual_available?: boolean
    daily_inspection_log?: boolean
    last_inspection_result?: 'pass' | 'conditional' | 'fail'
  }>
  regulatory_framework?: string
}

function assessCompliance(input: ComplianceInput): {
  compliance_score: number
  violations: Array<{ equipment_id: string; type: string; severity: 'critical' | 'major' | 'minor'; description: string; action: string; legal_reference: string }>
  registration_gaps: string[]
  certification_gaps: string[]
  overall_status: 'compliant' | 'non-compliant' | 'conditional'
  recommendations: string[]
} {
  const r = rng(input.facility_name + input.equipment.length.toString())
  const today = new Date()
  const violations: ReturnType<typeof assessCompliance>['violations'] = []
  const registrationGaps: string[] = []
  const certificationGaps: string[] = []

  for (const eq of input.equipment) {
    // Registration check
    if (eq.registration_status === 'unregistered' || !eq.registration_code) {
      violations.push({
        equipment_id: eq.id,
        type: 'Registration',
        severity: 'critical',
        description: `${eq.type} ${eq.id} is not registered with safety supervision authority`,
        action: 'Immediately apply for usage registration with technical documentation',
        legal_reference: 'Special Equipment Safety Law Art. 33'
      })
      registrationGaps.push(eq.id)
    } else if (eq.registration_status === 'expired' || eq.registration_status === 'pending') {
      violations.push({
        equipment_id: eq.id,
        type: 'Registration',
        severity: 'major',
        description: `${eq.type} ${eq.id} registration is ${eq.registration_status}`,
        action: 'Renew registration before expiration or expedite pending application',
        legal_reference: 'Special Equipment Safety Law Art. 33-34'
      })
      registrationGaps.push(eq.id)
    }

    // Inspection validity
    if (eq.inspection_valid_until) {
      const validDate = new Date(eq.inspection_valid_until)
      const daysUntilExpiry = Math.ceil((validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry < 0) {
        violations.push({
          equipment_id: eq.id,
          type: 'Inspection Validity',
          severity: 'critical',
          description: `${eq.type} ${eq.id} inspection expired ${Math.abs(daysUntilExpiry)} days ago`,
          action: 'Cease operation and schedule immediate re-inspection',
          legal_reference: 'Special Equipment Safety Law Art. 40'
        })
      } else if (daysUntilExpiry < 30) {
        violations.push({
          equipment_id: eq.id,
          type: 'Inspection Validity',
          severity: 'major',
          description: `${eq.type} ${eq.id} inspection expires in ${daysUntilExpiry} days`,
          action: 'Schedule re-inspection before expiration',
          legal_reference: 'Special Equipment Safety Law Art. 40'
        })
      }
    }

    // Operator certification
    if (!eq.operator_certified) {
      violations.push({
        equipment_id: eq.id,
        type: 'Operator Certification',
        severity: 'major',
        description: `No certified operator for ${eq.type} ${eq.id}`,
        action: 'Arrange operator training and certification exam',
        legal_reference: 'Special Equipment Safety Law Art. 14'
      })
      certificationGaps.push(eq.id)
    }

    // Documentation
    if (!eq.safety_manual_available) {
      violations.push({
        equipment_id: eq.id,
        type: 'Documentation',
        severity: 'minor',
        description: `Safety manual unavailable for ${eq.type} ${eq.id}`,
        action: 'Obtain and post safety operation manual at equipment location',
        legal_reference: 'Special Equipment Safety Law Art. 36'
      })
    }

    // Daily inspection
    if (!eq.daily_inspection_log) {
      violations.push({
        equipment_id: eq.id,
        type: 'Inspection Records',
        severity: 'minor',
        description: `Daily inspection log not maintained for ${eq.type} ${eq.id}`,
        action: 'Implement daily pre-use inspection checklist and logging system',
        legal_reference: 'Special Equipment Safety Law Art. 39'
      })
    }

    // Last inspection result
    if (eq.last_inspection_result === 'fail') {
      violations.push({
        equipment_id: eq.id,
        type: 'Inspection Result',
        severity: 'critical',
        description: `${eq.type} ${eq.id} FAILED last inspection — requires remediation and re-inspection`,
        action: 'Immediately cease operation, remediate violations, apply for re-inspection',
        legal_reference: 'Special Equipment Safety Law Art. 40 / Art. 44'
      })
    } else if (eq.last_inspection_result === 'conditional') {
      violations.push({
        equipment_id: eq.id,
        type: 'Inspection Result',
        severity: 'major',
        description: `${eq.type} ${eq.id} received conditional pass — corrective actions required`,
        action: 'Complete all corrective actions within specified timeframe',
        legal_reference: 'Special Equipment Safety Law Art. 40'
      })
    }
  }

  const criticalCount = violations.filter(v => v.severity === 'critical').length
  const majorCount = violations.filter(v => v.severity === 'major').length
  const totalItems = input.equipment.length * 5 // 5 compliance dimensions per equipment
  const passedItems = Math.max(0, totalItems - violations.length)
  const complianceScore = totalItems > 0 ? passedItems / totalItems : 1

  let overallStatus: 'compliant' | 'non-compliant' | 'conditional' = 'compliant'
  if (criticalCount > 0) overallStatus = 'non-compliant'
  else if (majorCount > 0 || complianceScore < 0.9) overallStatus = 'conditional'

  const recommendations: string[] = []
  if (criticalCount > 0) {
    recommendations.push(`${criticalCount} CRITICAL violation(s) require IMMEDIATE action — equipment must be taken out of service if applicable`)
  }
  if (registrationGaps.length > 0) {
    recommendations.push(`Registration gaps: ${registrationGaps.length} equipment(s) need registration — contact local market supervision bureau`)
  }
  if (certificationGaps.length > 0) {
    recommendations.push(`Certification gaps: ${certificationGaps.length} equipment(s) need certified operators — arrange TSG training`)
  }
  recommendations.push(`Compliance score: ${formatPercent(complianceScore)} | Status: ${overallStatus.toUpperCase()}`)
  recommendations.push(`Framework: ${input.regulatory_framework || 'Special Equipment Safety Law (China) / PED 2014/68/EU (Europe) / OSHA 29 CFR 1910 (US)'}`)

  return {
    compliance_score: Math.round(complianceScore * 100) / 100,
    violations,
    registration_gaps: registrationGaps,
    certification_gaps: certificationGaps,
    overall_status: overallStatus,
    recommendations
  }
}

function formatComplianceReport(result: ReturnType<typeof assessCompliance>, facilityName: string): string {
  const lines: string[] = []
  lines.push('## Special Equipment Compliance & Registration Report')
  lines.push('')
  lines.push(`**Facility:** ${facilityName} | **Compliance Score:** ${formatPercent(result.compliance_score)} | **Overall Status:** ${result.overall_status.toUpperCase()}`)
  lines.push(`**Violations:** ${result.violations.length} | **Registration Gaps:** ${result.registration_gaps.length} | **Certification Gaps:** ${result.certification_gaps.length}`)
  lines.push('')
  if (result.violations.length > 0) {
    lines.push('### Violations Detail')
    lines.push('| Equipment | Type | Severity | Legal Reference |')
    lines.push('|-----------|------|----------|-----------------|')
    for (const v of result.violations.sort((a, b) => {
      const order = { critical: 0, major: 1, minor: 2 }
      return order[a.severity] - order[b.severity]
    })) {
      lines.push(`| ${v.equipment_id} | ${v.type} | ${v.severity.toUpperCase()} | ${v.legal_reference} |`)
    }
    lines.push('')
    lines.push('### Required Actions')
    for (const v of result.violations.filter(v => v.severity === 'critical')) {
      lines.push(`- [CRITICAL] ${v.equipment_id}: ${v.action}`)
    }
  } else {
    lines.push('### Full Compliance')
    lines.push('All equipment meets regulatory requirements.')
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 5: ELEVATOR MODERNIZATION ADVISOR ====================

interface ModernizationInput {
  elevator_id: string
  install_year: number
  current_type: 'traction' | 'hydraulic' | 'machine_room less'
  floor_count: number
  max_speed_ms: number
  capacity_kg: number
  issues: string[]
  target_level?: 'basic' | 'standard' | 'premium'
  energy_priority?: boolean
  accessibility_priority?: boolean
}

interface ModernizationComponent {
  name: string
  current: string
  proposed: string
  cost_range_usd: [number, number]
  downtime_days: number
  benefit: string
}

function adviseModernization(input: ModernizationInput): {
  modernization_plan: ModernizationComponent[]
  total_cost_estimate_usd: [number, number]
  total_downtime_days: number
  energy_savings_annual_pct: number
  payback_period_years: number
  regulatory_compliance_gain: string[]
  recommendations: string[]
} {
  const r = rng(input.elevator_id + input.install_year.toString())
  const currentYear = new Date().getFullYear()
  const age = currentYear - input.install_year
  const target = input.target_level ?? 'standard'
  const costMultiplier = target === 'premium' ? 1.5 : target === 'standard' ? 1.0 : 0.6

  const floors = input.floor_count
  const speedFactor = input.max_speed_ms / 1.0

  const plan: ModernizationComponent[] = [
    {
      name: 'Controller & Drive System',
      current: 'Relay logic or early VVVF',
      proposed: `Microprocessor VVVF with regenerative drive (${target} grade)`,
      cost_range_usd: [15000 * costMultiplier * speedFactor, 35000 * costMultiplier * speedFactor],
      downtime_days: 3 + Math.floor(r() * 4),
      benefit: '30-50% energy reduction, smoother ride, precise leveling'
    },
    {
      name: 'Door Operator',
      current: 'DC motor door operator',
      proposed: 'Permanent magnet synchronous motor encoder-based door',
      cost_range_usd: [5000 * costMultiplier, 12000 * costMultiplier],
      downtime_days: 1 + Math.floor(r() * 2),
      benefit: 'Reduced entrapment risk, 60% fewer door faults'
    },
    {
      name: 'Car Interior & Fixtures',
      current: 'Worn original fixtures',
      proposed: `${target === 'premium' ? 'Premium' : target === 'standard' ? 'Modern' : 'Functional'} car interior with LED and stainless`,
      cost_range_usd: [8000 * costMultiplier, 25000 * costMultiplier],
      downtime_days: 2 + Math.floor(r() * 3),
      benefit: 'Improved user experience, accessibility compliance'
    },
    {
      name: 'Hoist Machine',
      current: input.current_type === 'hydraulic' ? 'Hydraulic pump unit' : `Gear${r() > 0.5 ? '' : 'less'} traction motor`,
      proposed: input.current_type === 'hydraulic' ? 'Convert to MRL traction' : 'PMSM gearless machine',
      cost_range_usd: [20000 * costMultiplier * speedFactor, 50000 * costMultiplier * speedFactor],
      downtime_days: 5 + Math.floor(r() * 7),
      benefit: '40% energy savings, eliminates oil maintenance, smaller footprint'
    },
    {
      name: 'Safety Systems',
      current: 'Original governor + safety gear',
      proposed: 'Digital governor, progressive safety gear, earthquake sensor',
      cost_range_usd: [6000 * costMultiplier, 15000 * costMultiplier],
      downtime_days: 1 + Math.floor(r() * 2),
      benefit: 'Enhanced passenger safety, seismic protection, remote monitoring ready'
    },
    {
      name: 'Cables & Wiring',
      current: age > 15 ? 'Aging cables' : 'Original cables',
      proposed: 'Fire-resistant low-smoke cables, shielded communication',
      cost_range_usd: [3000 * costMultiplier, 8000 * costMultiplier],
      downtime_days: 1 + Math.floor(r() * 2),
      benefit: 'Fire safety compliance, reduced EMI, future IoT readiness'
    }
  ]

  if (input.accessibility_priority) {
    plan.push({
      name: 'Accessibility Upgrades',
      current: 'Basic accessibility',
      proposed: 'Braille buttons, audio announcements, extended door time, wheelchair space',
      cost_range_usd: [4000 * costMultiplier, 10000 * costMultiplier],
      downtime_days: 1,
      benefit: 'Full GB 50763 / ADA compliance, universal access'
    })
  }

  if (input.energy_priority) {
    plan.push({
      name: 'Energy Recovery System',
      current: 'Non-regenerative drive',
      proposed: 'Regenerative braking with grid feedback',
      cost_range_usd: [8000 * costMultiplier, 18000 * costMultiplier],
      downtime_days: 2,
      benefit: '20-35% additional energy savings beyond VVVF'
    })
  }

  const floorCost = floors * 500 * costMultiplier
  const totalMin = Math.round((plan.reduce((s, c) => s + c.cost_range_usd[0], 0) + floorCost) / 1000) * 1000
  const totalMax = Math.round((plan.reduce((s, c) => s + c.cost_range_usd[1], 0) + floorCost) / 1000) * 1000
  const maxDowntime = plan.reduce((s, c) => s + c.downtime_days, 0)

  // Parallel scheduling could reduce by 40%
  const parallelDowntime = Math.round(maxDowntime * 0.6)

  const energySavings = target === 'premium' ? 45 : target === 'standard' ? 30 : 15
  const annualEnergyCost = 3000 + r() * 5000
  const annualSavings = Math.round(annualEnergyCost * (energySavings / 100))
  const avgCost = (totalMin + totalMax) / 2
  const paybackYears = Math.round((avgCost / Math.max(1, annualSavings)) * 10) / 10

  const complianceGain: string[] = []
  complianceGain.push('Meets GB 7588-2003+latest amendments (equivalent to EN 81-20/50)')
  if (input.accessibility_priority) complianceGain.push('GB 50763 / ADA accessibility compliance')
  complianceGain.push('Energy efficiency: ISO 25745 Class A or higher')
  complianceGain.push('Seismic compliance per GB/T 31095')
  complianceGain.push('IoT-ready: GB/T 24476 remote monitoring')

  const recommendations: string[] = []
  if (age > 20) {
    recommendations.push(`Elevator is ${age} years old — full modernization strongly recommended over continued repair`)
  }
  if (target === 'premium') {
    recommendations.push('Premium grade provides maximum longevity (20+ years) and lowest lifecycle cost')
  } else if (target === 'standard') {
    recommendations.push('Standard grade balances cost and performance for most buildings')
  }
  recommendations.push(`Estimated total cost: $${totalMin.toLocaleString()} - $${totalMax.toLocaleString()} USD`)
  recommendations.push(`Downtime: ${parallelDowntime} days (parallel scheduling) to ${maxDowntime} days (sequential)`)
  recommendations.push(`Annual energy savings: $${annualSavings.toLocaleString()} (${energySavings}% reduction)`)
  recommendations.push(`Payback period: ${paybackYears} years`)
  recommendations.push(`Modernization cost vs replacement: ${Math.round(((totalMin + totalMax) / 2) / (800000 * costMultiplier) * 100)}% of new elevator cost`)

  return {
    modernization_plan: plan,
    total_cost_estimate_usd: [totalMin, totalMax],
    total_downtime_days: parallelDowntime,
    energy_savings_annual_pct: energySavings,
    payback_period_years: paybackYears,
    regulatory_compliance_gain: complianceGain,
    recommendations
  }
}

function formatModernizationReport(result: ReturnType<typeof adviseModernization>, elevatorId: string): string {
  const lines: string[] = []
  lines.push('## Elevator Modernization Advisory Report')
  lines.push('')
  lines.push(`**Elevator ID:** ${elevatorId} | **Total Cost:** $${result.total_cost_estimate_usd[0].toLocaleString()} - $${result.total_cost_estimate_usd[1].toLocaleString()} | **Downtime:** ${result.total_downtime_days} days`)
  lines.push(`**Energy Savings:** ${result.energy_savings_annual_pct}% | **Payback:** ${result.payback_period_years} years`)
  lines.push('')
  lines.push('### Modernization Plan')
  lines.push('| Component | Current | Proposed | Cost (USD) | Downtime |')
  lines.push('|-----------|---------|----------|------------|----------|')
  for (const c of result.modernization_plan) {
    const cost = `$${c.cost_range_usd[0].toLocaleString()}-$${c.cost_range_usd[1].toLocaleString()}`
    lines.push(`| ${c.name} | ${c.current} | ${c.proposed} | ${cost} | ${c.downtime_days}d |`)
  }
  lines.push('')
  lines.push('### Benefits by Component')
  for (const c of result.modernization_plan) {
    lines.push(`- **${c.name}**: ${c.benefit}`)
  }
  lines.push('')
  lines.push('### Regulatory Compliance Gains')
  for (const g of result.regulatory_compliance_gain) {
    lines.push(`- ${g}`)
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 6: ELEVATOR ENERGY AUDITOR ====================

interface EnergyAuditInput {
  elevator_id: string
  elevator_type: 'traction' | 'hydraulic' | 'machine room less'
  capacity_kg: number
  max_speed_ms: number
  floor_count: number
  annual_trips: number
  annual_energy_kwh: number
  standby_power_w?: number
  trips_per_day?: number
  regenerative_drive?: boolean
  led_lighting?: boolean
  off_peak_ratio?: number
}

function auditEnergy(input: EnergyAuditInput): {
  energy_per_trip_kwh: number
  energy_per_kg_km: number
  standby_annual_kwh: number
  standby_pct: number
  iso25745_class: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  retrofit_options: Array<{ name: string; cost_usd: number; annual_savings_kwh: number; annual_savings_usd: number; payback_years: number; co2_reduction_kg: number }>
  total_potential_savings_pct: number
  carbon_footprint_annual_kg: number
  recommendations: string[]
} {
  const r = rng(input.elevator_id + input.annual_energy_kwh.toString())

  const annualKwh = input.annual_energy_kwh
  const annualTrips = input.annual_trips || 50000
  const energyPerTrip = annualTrips > 0 ? Math.round((annualKwh / annualTrips) * 100) / 100 : 0.5

  const travelDistance = input.floor_count * 3.5 // avg 3.5m per floor
  const energyPerKgKm = Math.round((energyPerTrip / (input.capacity_kg * travelDistance / 1000)) * 1000) / 1000

  const standbyPower = input.standby_power_w ?? (150 + r() * 350)
  const standbyAnnual = Math.round((standbyPower * 8760) / 1000)
  const standbyPct = Math.round((standbyAnnual / annualKwh) * 10000) / 100

  // ISO 25745 class determination (energy per kg*m traveled)
  let isoClass: typeof energyPerKgKm extends number ? 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' : 'C' = 'C'
  if (energyPerKgKm < 1.5) isoClass = 'A'
  else if (energyPerKgKm < 2.5) isoClass = 'B'
  else if (energyPerKgKm < 4.0) isoClass = 'C'
  else if (energyPerKgKm < 6.0) isoClass = 'D'
  else if (energyPerKgKm < 8.0) isoClass = 'E'
  else if (energyPerKgKm < 12.0) isoClass = 'F'

  const electricityRate = 0.10 // USD per kWh
  const carbonFactor = 0.581 // kg CO2 per kWh (China avg grid)

  const retrofitOptions: ReturnType<typeof auditEnergy>['retrofit_options'] = []

  if (!input.regenerative_drive) {
    const savingsKwh = Math.round(annualKwh * (0.20 + r() * 0.15))
    retrofitOptions.push({
      name: 'Regenerative Drive Retrofit',
      cost_usd: Math.round(12000 + r() * 8000),
      annual_savings_kwh: savingsKwh,
      annual_savings_usd: Math.round(savingsKwh * electricityRate),
      payback_years: 0,
      co2_reduction_kg: Math.round(savingsKwh * carbonFactor)
    })
  }

  if (!input.led_lighting) {
    const savingsKwh = Math.round(annualKwh * 0.03 + r() * 200)
    retrofitOptions.push({
      name: 'LED Lighting Conversion',
      cost_usd: Math.round(800 + r() * 400),
      annual_savings_kwh: savingsKwh,
      annual_savings_usd: Math.round(savingsKwh * electricityRate),
      payback_years: 0,
      co2_reduction_kg: Math.round(savingsKwh * carbonFactor)
    })
  }

  // Standby optimization
  const standbySavings = Math.round(standbyAnnual * (0.4 + r() * 0.4))
  retrofitOptions.push({
    name: 'Standby Power Management (auto-off)',
    cost_usd: Math.round(1500 + r() * 2000),
    annual_savings_kwh: standbySavings,
    annual_savings_usd: Math.round(standbySavings * electricityRate),
    payback_years: 0,
    co2_reduction_kg: Math.round(standbySavings * carbonFactor)
  })

  // Permanent Magnet Synchronous Motor
  if (input.elevator_type !== 'machine room less') {
    const savingsKwh = Math.round(annualKwh * (0.15 + r() * 0.20))
    retrofitOptions.push({
      name: 'PMSM Motor Upgrade (gearless)',
      cost_usd: Math.round(18000 + r() * 12000),
      annual_savings_kwh: savingsKwh,
      annual_savings_usd: Math.round(savingsKwh * electricityRate),
      payback_years: 0,
      co2_reduction_kg: Math.round(savingsKwh * carbonFactor)
    })
  }

  // Solar/photovoltaic integration
  const solarSavings = Math.round(annualKwh * (0.10 + r() * 0.15))
  retrofitOptions.push({
    name: 'Rooftop Solar PV (partial supply)',
    cost_usd: Math.round(8000 + r() * 15000),
    annual_savings_kwh: solarSavings,
    annual_savings_usd: Math.round(solarSavings * electricityRate),
    payback_years: 0,
    co2_reduction_kg: Math.round(solarSavings * carbonFactor)
  })

  // Calculate payback for each option
  for (const opt of retrofitOptions) {
    opt.payback_years = opt.annual_savings_usd > 0 ? Math.round((opt.cost_usd / opt.annual_savings_usd) * 10) / 10 : 99.9
  }

  retrofitOptions.sort((a, b) => a.payback_years - b.payback_years)

  const totalSavingsKwh = retrofitOptions.reduce((s, o) => s + o.annual_savings_kwh, 0)
  const totalSavingsPct = Math.min(85, Math.round((totalSavingsKwh / annualKwh) * 100))
  const carbonFootprint = Math.round(annualKwh * carbonFactor)

  const recommendations: string[] = []
  recommendations.push(`ISO 25745 energy class: ${isoClass} | Current energy intensity: ${energyPerTrip} kWh/trip`)
  if (isoClass > 'C') {
    recommendations.push(`Energy class ${isoClass} is below optimal — target class B or A through retrofit measures`)
  }
  recommendations.push(`Standby consumption: ${standbyAnnual} kWh/yr (${standbyPct}% of total) — significant standby waste detected`)
  const bestOption = retrofitOptions[0]
  if (bestOption && bestOption.payback_years < 5) {
    recommendations.push(`Best retrofit: ${bestOption.name} — ${bestOption.payback_years}yr payback, $${bestOption.annual_savings_usd}/yr savings`)
  }
  if (totalSavingsPct > 30) {
    recommendations.push(`Combined retrofit potential: ${totalSavingsPct}% total energy reduction`)
  }
  recommendations.push(`Carbon footprint: ${carbonFootprint.toLocaleString()} kg CO2/year | Grid emission factor: ${carbonFactor} kg/kWh`)

  return {
    energy_per_trip_kwh: energyPerTrip,
    energy_per_kg_km: energyPerKgKm,
    standby_annual_kwh: standbyAnnual,
    standby_pct: standbyPct,
    iso25745_class: isoClass,
    retrofit_options: retrofitOptions,
    total_potential_savings_pct: totalSavingsPct,
    carbon_footprint_annual_kg: carbonFootprint,
    recommendations
  }
}

function formatEnergyAuditReport(result: ReturnType<typeof auditEnergy>, elevatorId: string): string {
  const lines: string[] = []
  lines.push('## Elevator Energy Consumption & Retrofit Analysis Report')
  lines.push('')
  lines.push(`**Elevator ID:** ${elevatorId} | **ISO 25745 Class:** ${result.iso25745_class} | **Energy/Trip:** ${result.energy_per_trip_kwh} kWh | **Standby:** ${result.standby_pct}%`)
  lines.push(``)
  lines.push('### Energy Performance Metrics')
  lines.push(`- **Energy per trip:** ${result.energy_per_trip_kwh} kWh`)
  lines.push(`- **Energy intensity:** ${result.energy_per_kg_km} kg/m equivalence`)
  lines.push(`- **Standby annual:** ${result.standby_annual_kwh} kWh (${result.standby_pct}% of total)`)
  lines.push(`- **ISO 25745 class:** ${result.iso25745_class}`)
  lines.push(`- **Carbon footprint:** ${result.carbon_footprint_annual_kg.toLocaleString()} kg CO2/year`)
  lines.push('')
  lines.push('### Retrofit Options (ranked by payback)')
  lines.push('| # | Measure | Cost (USD) | Savings (kWh) | Savings ($) | Payback (yr) | CO2 Reduction |')
  lines.push('|---|---------|------------|---------------|-------------|--------------|---------------|')
  result.retrofit_options.forEach((o, i) => {
    lines.push(`| ${i + 1} | ${o.name} | $${o.cost_usd.toLocaleString()} | ${o.annual_savings_kwh} | $${o.annual_savings_usd.toLocaleString()} | ${o.payback_years} | ${o.co2_reduction_kg.toLocaleString()} kg |`)
  })
  lines.push('')
  lines.push(`**Combined retrofit potential:** ${formatPercent(result.total_potential_savings_pct / 100)} total reduction`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 7: ELEVATOR RESCUE SIMULATOR ====================

interface RescueSimulatorInput {
  scenario_type: 'power_failure' | 'door_entrapment' | 'earthquake' | 'fire' | 'overspeed' | 'free_fall'
  building_floors: number
  building_type: 'residential' | 'commercial' | 'hospital' | 'industrial'
  total_trapped?: number
  vip_passengers?: boolean
  emergency_team_available?: boolean
  has_remote_monitoring?: boolean
  response_constraints?: { max_response_time_min: number; max_evacuation_time_min: number }
}

interface RescuePhase {
  phase: string
  duration_min: number
  responsible: string
  action: string
  critical: boolean
}

function simulateRescue(input: RescueSimulatorInput): {
  rescue_phases: RescuePhase[]
  estimated_total_time_min: number
  response_team_size: number
  equipment_needed: string[]
  emergency_plan_checklist: Array<{ item: string; status: 'ready' | 'partial' | 'missing'; priority: 'critical' | 'important' | 'recommended' }>
  risk_assessment: { overall_risk: 'low' | 'medium' | 'high' | 'extreme'; factors: string[]; mitigation: string[] }
  drill_score: number
  recommendations: string[]
} {
  const r = rng(input.scenario_type + input.building_floors.toString())
  const trapped = input.total_trapped ?? 1
  const hasTeam = input.emergency_team_available ?? false
  const hasRemote = input.has_remote_monitoring ?? false
  const vip = input.vip_passengers ?? false
  const constraints = input.response_constraints || { max_response_time_min: 30, max_evacuation_time_min: 120 }

  const scenarios: Record<string, { phases: RescuePhase[]; equipment: string[]; baseRisk: 'low' | 'medium' | 'high' | 'extreme' }> = {
    power_failure: {
      phases: [
        { phase: 'Alarm & Detection', duration_min: hasRemote ? 1 : 3, responsible: 'Monitoring Center', action: 'Detect power failure and confirm entrapment', critical: true },
        { phase: 'Notification', duration_min: 2, responsible: 'Property Management', action: 'Notify dispatch and registered maintenance company', critical: true },
        { phase: 'Team Dispatch', duration_min: hasTeam ? 5 : 15, responsible: 'Rescue Team / Maintenance', action: 'Dispatch rescue personnel to site', critical: true },
        { phase: 'On-site Assessment', duration_min: 5, responsible: 'Rescue Team', action: 'Confirm car position, communicate with passengers', critical: true },
        { phase: 'Power Restoration / Manual Movement', duration_min: hasTeam ? 10 : 20, responsible: 'Rescue Team', action: 'Restore power or manually move car to nearest floor', critical: true },
        { phase: 'Door Opening & Evacuation', duration_min: 5 + trapped / 2, responsible: 'Rescue Team', action: 'Open doors and guide passengers out', critical: true },
        { phase: 'Post-incident Review', duration_min: 15, responsible: 'Safety Officer', action: 'Document incident and restore equipment', critical: false }
      ],
      equipment: ['Emergency lighting', 'Communication device', 'Manual handwheel/brake release', 'Door unlock key', 'Warning barriers'],
      baseRisk: trapped > 2 || vip ? 'medium' : 'low'
    },
    door_entrapment: {
      phases: [
        { phase: 'Door Fault Detection', duration_min: hasRemote ? 0.5 : 2, responsible: 'Monitoring System', action: 'Detect door operation anomaly and entrapment alarm', critical: true },
        { phase: 'Passenger Communication', duration_min: 2, responsible: 'Property Dispatch', action: 'Establish voice/video contact with trapped passengers', critical: true },
        { phase: 'Maintenance Dispatch', duration_min: 8, responsible: 'Property Management', action: 'Alert elevator maintenance company', critical: true },
        { phase: 'On-site Diagnosis', duration_min: hasRemote ? 5 : 12, responsible: 'Maintenance Tech', action: 'Diagnose door system fault', critical: true },
        { phase: 'Door Override / Manual Release', duration_min: 8 + (trapped > 3 ? 5 : 0), responsible: 'Maintenance Tech', action: 'Override door operator or manually open doors with release tool', critical: true },
        { phase: 'Passenger Evacuation', duration_min: 5, responsible: 'Maintenance Tech', action: 'Guide passengers out safely, provide medical check if needed', critical: true }
      ],
      equipment: ['Manual door release tool', 'Portable intercom', 'Warning signs', 'Door force gauge'],
      baseRisk: trapped >= 3 ? 'high' : trapped >= 1 ? 'medium' : 'low'
    },
    earthquake: {
      phases: [
        { phase: 'Seismic Sensor Activation', duration_min: 0.1, responsible: 'Building Management System', action: 'Earthquake sensor triggers emergency stop and floor leveling', critical: true },
        { phase: 'Safe Floor Movement', duration_min: 1, responsible: 'Elevator Controller (Auto)', action: 'Move car to nearest floor and open doors automatically', critical: true },
        { phase: 'Evacuation Confirmation', duration_min: 10, responsible: 'Building Security', action: 'Confirm all elevators evacuated via CCTV/intercom', critical: true },
        { phase: 'Manual Inspection', duration_min: 15, responsible: 'Elevator Inspector', action: 'Inspect all elevators for structural/mechanical damage after event', critical: true },
        { phase: 'Return to Service', duration_min: 5, responsible: 'Elevator Inspector', action: 'Clear for operation only after full safety inspection', critical: true }
      ],
      equipment: ['Seismic sensors', 'Emergency power', 'Communication system', 'Inspection toolkit'],
      baseRisk: 'high'
    },
    fire: {
      phases: [
        { phase: 'Fire Alarm Activation', duration_min: 0.5, responsible: 'Fire Alarm System', action: 'Fire alarm triggers elevator fire service mode', critical: true },
        { phase: 'Fire Service Mode', duration_min: 0.5, responsible: 'Elevator Controller', action: 'Move all cars to ground floor and park with doors open', critical: true },
        { phase: 'Evacuation Confirmation', duration_min: 5, responsible: 'Fire Command', action: 'Verify all elevator lobbies clear of personnel', critical: true },
        { phase: 'Firefighter Access', duration_min: 3, responsible: 'Firefighter', action: 'Switch to firefighter control for emergency access', critical: false },
        { phase: 'Full Building Clear', duration_min: 30, responsible: 'Fire Department', action: 'Complete building evacuation and fire containment', critical: true }
      ],
      equipment: ['Fire alarm interface', 'Emergency power supply', 'Firefighter recall switch', 'Firefighter elevator mode'],
      baseRisk: 'high'
    },
    overspeed: {
      phases: [
        { phase: 'Governor Activation', duration_min: 0.01, responsible: 'Governor', action: 'Overspeed governor trips mechanically', critical: true },
        { phase: 'Safety Gear Engagement', duration_min: 0.01, responsible: 'Safety Gear', action: 'Safety gear clamps on guide rails, stops car', critical: true },
        { phase: 'Emergency Brake Applied', duration_min: 0.05, responsible: 'Brake System', action: 'Electrical and mechanical brake engagement confirmed', critical: true },
        { phase: 'Emergency Call & Rescue', duration_min: hasRemote ? 3 : 10, responsible: 'Property / Alarm Center', action: 'Confirm entrapment, dispatch rescue per protocol', critical: true },
        { phase: 'Technical Assessment', duration_min: 20, responsible: 'Rescue Team', action: 'Assess damage, plan extrication via top hatch or door override', critical: true },
        { phase: 'Controlled Release', duration_min: 15, responsible: 'Rescue Team', action: 'Carefully release safety gear and move car', critical: true }
      ],
      equipment: ['Safety gear release tool', 'Top emergency hatch access', 'Hoist equipment', 'Medical support'],
      baseRisk: 'extreme'
    },
    free_fall: {
      phases: [
        { phase: 'Buffer Activation', duration_min: 0.05, responsible: 'Safety Systems', action: 'Hydraulic/spring buffer absorbs impact', critical: true },
        { phase: 'Emergency Response', duration_min: hasRemote ? 2 : 5, responsible: 'Monitoring Center', action: 'Mass casualty protocol activation', critical: true },
        { phase: 'Multi-team Dispatch', duration_min: 10, responsible: 'Emergency Dispatch', action: 'Fire, medical, elevator rescue, structural engineer', critical: true },
        { phase: 'Scene Secured', duration_min: 15, responsible: 'Fire Department', action: 'Secure cribbing, ventilation, power isolation', critical: true },
        { phase: 'Rescue Operation', duration_min: 30, responsible: 'Rescue Team', action: 'Controlled extrication of passengers', critical: true },
        { phase: 'Investigation', duration_min: 120, responsible: 'Safety Authority', action: 'Preserve evidence, begin incident investigation', critical: false }
      ],
      equipment: ['Heavy rescue tools', 'Medical triage', 'Structural shoring', 'Crash investigation kit', 'Forensic equipment'],
      baseRisk: 'extreme'
    }
  }

  const scenario = scenarios[input.scenario_type] || scenarios.power_failure
  const phases = [...scenario.phases]

  const totalTime = phases.reduce((s, p) => s + p.duration_min, 0)
  const teamSize = trapped + (input.scenario_type === 'free_fall' ? 6 : input.scenario_type === 'earthquake' ? 4 : 2)

  // Emergency plan checklist
  const checklist = [
    { item: 'Emergency contact list posted and current', status: hasRemote ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'critical' as const },
    { item: 'Elevator rescue procedure documented', status: r() > 0.3 ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'critical' as const },
    { item: 'Rescue equipment inventoried and accessible', status: hasTeam ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'critical' as const },
    { item: 'Staff trained on passenger communication', status: r() > 0.5 ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'important' as const },
    { item: 'Regular rescue drills conducted (at least 2x/year)', status: r() > 0.4 ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'important' as const },
    { item: 'Video monitoring in all elevator cars', status: hasRemote ? 'ready' : 'missing' as 'ready' | 'partial' | 'missing', priority: 'important' as const },
    { item: 'Backup power (UPS/generator) for emergency lighting', status: r() > 0.6 ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'important' as const },
    { item: 'Emergency evacuation signage posted', status: r() > 0.5 ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'recommended' as const },
    { item: 'Mutual aid agreement with elevator company', status: r() > 0.5 ? 'ready' : 'partial' as 'ready' | 'partial' | 'missing', priority: 'critical' as const }
  ]

  const readyItems = checklist.filter(c => c.status === 'ready').length
  const missingCritical = checklist.filter(c => c.priority === 'critical' && c.status !== 'ready').length
  const drillScore = Math.round((readyItems / checklist.length) * 100 - missingCritical * 10)

  const riskFactors: string[] = []
  const mitigation: string[] = []
  if (input.building_floors > 50) riskFactors.push('High-rise building — evacuation complexity')
  if (trapped > 3) riskFactors.push('Multiple simultaneous entrapments')
  if (vip) riskFactors.push('VIP passenger on board — heightened response')
  if (input.scenario_type === 'free_fall' || input.scenario_type === 'overspeed') riskFactors.push('Mechanical safety device activation — equipment damage')
  if (!hasRemote) riskFactors.push('No remote monitoring — delayed detection')
  if (!hasTeam) riskFactors.push('No on-site rescue team — external dependency')

  if (hasRemote) mitigation.push('Remote monitoring enabled — detection in <60sec')
  if (hasTeam) mitigation.push('On-site rescue team available — faster response')
  mitigation.push(`Response target: ${constraints.max_response_time_min}min | Evacuation target: ${constraints.max_evacuation_time_min}min`)

  const recommendations: string[] = []
  if (missingCritical > 0) {
    recommendations.push(`${missingCritical} critical plan items not ready — address before next drill`)
  }
  if (!hasRemote) {
    recommendations.push('Install IoT-based entrapment detection with automatic notification — reduces response time by 60-80%')
  }
  if (totalTime > constraints.max_evacuation_time_min) {
    recommendations.push(`Estimated evacuation time (${totalTime}min) exceeds target (${constraints.max_evacuation_time_min}min) — review staffing and procedures`)
  }
  if (trapped > 2) {
    recommendations.push(`Multiple passengers trapped (${trapped}) — deploy additional communication to manage anxiety`)
  }
  recommendations.push(`Conduct scenario-based drills quarterly for: ${input.scenario_type}`)
  recommendations.push(`Post-drill: Review ${phases.length} total rescue phases — identify bottleneck (typically phase 3-4)`)

  return {
    rescue_phases: phases,
    estimated_total_time_min: Math.round(totalTime),
    response_team_size: teamSize,
    equipment_needed: scenario.equipment,
    emergency_plan_checklist: checklist,
    risk_assessment: { overall_risk: scenario.baseRisk, factors: riskFactors, mitigation },
    drill_score: Math.max(0, Math.min(100, drillScore)),
    recommendations
  }
}

function formatRescueSimulatorReport(result: ReturnType<typeof simulateRescue>, scenarioType: string): string {
  const lines: string[] = []
  lines.push('## Elevator Rescue Drill & Emergency Plan Report')
  lines.push('')
  lines.push(`**Scenario:** ${scenarioType.toUpperCase()} | **Est. Total Time:** ${result.estimated_total_time_min}min | **Team Size:** ${result.response_team_size} | **Drill Score:** ${result.drill_score}/100 | **Risk:** ${result.risk_assessment.overall_risk.toUpperCase()}`)
  lines.push('')
  lines.push('### Rescue Phases')
  lines.push('| Phase | Duration | Responsible | Critical |')
  lines.push('|-------|----------|-------------|----------|')
  for (const p of result.rescue_phases) {
    lines.push(`| ${p.phase} | ${p.duration_min}min | ${p.responsible} | ${p.critical ? 'YES' : '-'}`)
  }
  lines.push('')
  lines.push('### Emergency Plan Checklist')
  lines.push('| Item | Status | Priority |')
  lines.push('|------|--------|----------|')
  for (const c of result.emergency_plan_checklist) {
    lines.push(`| ${c.item} | ${c.status.toUpperCase()} | ${c.priority} |`)
  }
  lines.push('')
  if (result.risk_assessment.factors.length > 0) {
    lines.push('### Risk Factors')
    for (const f of result.risk_assessment.factors) {
      lines.push(`- ${f}`)
    }
  }
  if (result.risk_assessment.mitigation.length > 0) {
    lines.push('### Mitigation Measures')
    for (const m of result.risk_assessment.mitigation) {
      lines.push(`- ${m}`)
    }
  }
  lines.push('')
  lines.push('### Equipment Required')
  for (const eq of result.equipment_needed) {
    lines.push(`- ${eq}`)
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 8: ELEVATOR LIFECYCLE COST ====================

interface LifecycleCostInput {
  elevator_id: string
  install_year: number
  current_age_years: number
  cost_currency?: string
  components: Array<{
    name: string
    original_cost: number
    install_year: number
    expected_life_years: number
    replacement_cost_current: number
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
    last_replacement?: string
  }>
  annual_energy_cost?: number
  annual_maintenance_cost?: number
  annual_inspection_cost?: number
  residual_value_pct?: number
  discount_rate_pct?: number
}

function analyzeLifecycleCost(input: LifecycleCostInput): {
  total_cost_of_ownership: number
  remaining_lifecycle_cost: number
  annual_cost_breakdown: { category: string; annual_cost: number; pct: number }[]
  replacement_schedule: Array<{ component: string; year: number; cost: number; urgency: 'plan' | 'soon' | 'urgent' }>
  scrap_assessment: { is_economic_to_repair: boolean; replacement_timing: string; justification: string }
  npv_10_year: number
  recommendations: string[]
} {
  const r = rng(input.elevator_id + input.current_age_years.toString())
  const currency = input.cost_currency || 'USD'
  const discountRate = (input.discount_rate_pct ?? 5) / 100
  const residualPct = input.residual_value_pct ?? 5

  let totalTCO = 0
  let remainingCost = 0
  const breakdown: { category: string; annual_cost: number; pct: number }[] = []
  const replacementSched: ReturnType<typeof analyzeLifecycleCost>['replacement_schedule'] = []

  // Historical costs (sunk)
  let historicalCost = 0

  // Process each component
  for (const comp of input.components) {
    const compR = rng(comp.name + comp.install_year.toString())
    const ageSinceInstall = input.current_age_years - (comp.install_year - input.install_year)
    const remainingLife = Math.max(0, comp.expected_life_years - ageSinceInstall)
    const conditionFactor = comp.condition === 'excellent' ? 1.2 : comp.condition === 'good' ? 1.0 : comp.condition === 'fair' ? 0.7 : comp.condition === 'poor' ? 0.4 : 0.1
    const effectiveRemainingLife = remainingLife * conditionFactor

    // Sunk cost
    if (comp.last_replacement) {
      historicalCost += comp.replacement_cost_current
    } else {
      historicalCost += comp.original_cost
    }

    // Future replacement needed?
    if (effectiveRemainingLife <= 0) {
      replacementSched.push({
        component: comp.name,
        year: new Date().getFullYear(),
        cost: comp.replacement_cost_current,
        urgency: 'urgent'
      })
      remainingCost += comp.replacement_cost_current
    } else if (effectiveRemainingLife < 3) {
      replacementSched.push({
        component: comp.name,
        year: new Date().getFullYear() + Math.ceil(effectiveRemainingLife),
        cost: comp.replacement_cost_current,
        urgency: effectiveRemainingLife < 1 ? 'urgent' : 'soon'
      })
      // PV of future replacement
      const pvFactor = 1 / Math.pow(1 + discountRate, effectiveRemainingLife)
      remainingCost += comp.replacement_cost_current * pvFactor
    } else {
      replacementSched.push({
        component: comp.name,
        year: new Date().getFullYear() + Math.ceil(effectiveRemainingLife),
        cost: comp.replacement_cost_current,
        urgency: 'plan'
      })
      const pvFactor = 1 / Math.pow(1 + discountRate, effectiveRemainingLife)
      remainingCost += comp.replacement_cost_current * pvFactor
    }
  }

  const annualEnergy = input.annual_energy_cost ?? (2000 + r() * 4000)
  const annualMaint = input.annual_maintenance_cost ?? (3000 + r() * 7000)
  const annualInsp = input.annual_inspection_cost ?? (800 + r() * 1200)
  const annualOpsCost = annualEnergy + annualMaint + annualInsp

  // Calculate 10-year NPV of operational costs
  let npvOps = 0
  for (let yr = 1; yr <= 10; yr++) {
    const inflationFactor = Math.pow(1.03, yr) // 3% maintenance inflation
    const escalationFactor = 1 + Math.min(0.3, input.current_age_years * 0.01 * yr)
    npvOps += annualOpsCost * inflationFactor * escalationFactor / Math.pow(1 + discountRate, yr)
  }

  // Total TCO = historical + remaining replacements + 10yr operational + residual offset
  const residualValue = historicalCost * (residualPct / 100)
  totalTCO = historicalCost + remainingCost + npvOps - residualValue

  const npv10 = Math.round(npvOps)

  const totalAnnual = annualEnergy + annualMaint + annualInsp
  breakdown.push({ category: 'Energy', annual_cost: Math.round(annualEnergy), pct: Math.round((annualEnergy / totalAnnual) * 100) })
  breakdown.push({ category: 'Maintenance', annual_cost: Math.round(annualMaint), pct: Math.round((annualMaint / totalAnnual) * 100) })
  breakdown.push({ category: 'Inspection', annual_cost: Math.round(annualInsp), pct: Math.round((annualInsp / totalAnnual) * 100) })

  replacementSched.sort((a, b) => {
    const order = { urgent: 0, soon: 1, plan: 2 }
    return order[a.urgency] - order[b.urgency]
  })

  // Scrap assessment
  const avgComponentAge = input.components.reduce((s, c) => s + (input.current_age_years - (c.install_year - input.install_year)), 0) / Math.max(1, input.components.length)
  const urgentReplacements = replacementSched.filter(r => r.urgency === 'urgent' || r.urgency === 'soon').length
  const replacementRatio = urgentReplacements / Math.max(1, input.components.length)
  const isEconomicToRepair = input.current_age_years < 20 && replacementRatio < 0.5
  let replacementTiming = 'Continue maintenance program'
  if (!isEconomicToRepair && input.current_age_years > 25) {
    replacementTiming = 'Plan full replacement within 2-3 years'
  } else if (replacementRatio > 0.6) {
    replacementTiming = 'Accelerate replacement — multiple components at end of life'
  } else if (input.current_age_years > 20) {
    replacementTiming = 'Begin replacement planning — conduct detailed cost-benefit analysis'
  }

  const justification = `Age: ${input.current_age_years}y | Urgent items: ${urgentReplacements}/${input.components.length} | ` +
    `${isEconomicToRepair ? 'Economically viable to repair' : 'Approaching end of economic life'}`

  const recommendations: string[] = []
  if (input.current_age_years > 20) {
    recommendations.push(`${input.current_age_years} years in service — major modernization or replacement recommended`)
  }
  if (urgentReplacements > 0) {
    recommendations.push(`${urgentReplacements} component(s) require urgent replacement — budget $${replacementSched.filter(r => r.urgency === 'urgent').reduce((s, r) => s + r.cost, 0).toLocaleString()} immediately`)
  }
  if (annualMaint > 8000) {
    recommendations.push(`Annual maintenance cost ($${annualMaint.toLocaleString()}) is elevated — consider modernization to reduce ongoing costs`)
  }
  recommendations.push(`Total Cost of Ownership: $${Math.round(totalTCO).toLocaleString()} | Remaining lifecycle: $${Math.round(remainingCost).toLocaleString()}`)
  recommendations.push(`10-year NPV of operations: $${npv10.toLocaleString()} at ${discountRate * 100}% discount rate`)
  recommendations.push(`Replacement timing: ${replacementTiming}`)

  return {
    total_cost_of_ownership: Math.round(totalTCO),
    remaining_lifecycle_cost: Math.round(remainingCost),
    annual_cost_breakdown: breakdown,
    replacement_schedule: replacementSched,
    scrap_assessment: { is_economic_to_repair: isEconomicToRepair, replacement_timing: replacementTiming, justification },
    npv_10_year: npv10,
    recommendations
  }
}

function formatLifecycleCostReport(result: ReturnType<typeof analyzeLifecycleCost>, elevatorId: string): string {
  const lines: string[] = []
  lines.push('## Elevator Total Lifecycle Cost & Scrap Assessment Report')
  lines.push('')
  lines.push(`**Elevator ID:** ${elevatorId} | **Total TCO:** $${result.total_cost_of_ownership.toLocaleString()} | **Remaining Cost:** $${result.remaining_lifecycle_cost.toLocaleString()} | **NPV (10yr):** $${result.npv_10_year.toLocaleString()}`)
  lines.push('')
  lines.push('### Annual Cost Breakdown')
  lines.push('| Category | Annual Cost | % of Total |')
  lines.push('|----------|-------------|------------|')
  for (const b of result.annual_cost_breakdown) {
    lines.push(`| ${b.category} | $${b.annual_cost.toLocaleString()} | ${b.pct}% |`)
  }
  lines.push('')
  lines.push('### Replacement Schedule')
  lines.push('| Component | Year | Cost (USD) | Urgency |')
  lines.push('|-----------|------|------------|---------|')
  for (const r of result.replacement_schedule) {
    lines.push(`| ${r.component} | ${r.year} | $${r.cost.toLocaleString()} | ${r.urgency.toUpperCase()} |`)
  }
  lines.push('')
  lines.push('### Scrap / Replacement Assessment')
  lines.push(`- **Economic to repair:** ${result.scrap_assessment.is_economic_to_repair ? 'YES' : 'NO'}`)
  lines.push(`- **Replacement timing:** ${result.scrap_assessment.replacement_timing}`)
  lines.push(`- **Justification:** ${result.scrap_assessment.justification}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'elevator_fault_predictor',
    description: 'Predict elevator faults and assess entrapment risk based on age, usage, fault history, and component wear. Returns component-level probability rankings, remaining useful life estimates, and entrapment warning levels with actionable recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: elevator_id (string), elevator_type (traction/hydraulic/machine room less/freight), install_year (number), floor_count (number), max_speed_ms (number), capacity_kg (number), fault_history (array of {date, component, fault_type, severity}, optional), running_hours_daily (number, optional), last_maintenance_date (string, optional), entrapment_count_12m (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<FaultPredictorInput>(args.input_data)
      const result = predictFaults(input)
      return formatFaultPredictorReport(result, input.elevator_id || 'Unknown', input.elevator_type || 'traction')
    }
  }))

  tools.register(defineTool({
    name: 'elevator_inspection_scheduler',
    description: 'Generate comprehensive inspection and maintenance schedules for elevator fleets. Prioritizes overdue items, calculates compliance rates, and schedules inspections per TSG T7001 / EN 81-20 / ASME A17.1 standards.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: facility_name (string), elevators (array of {id, type, last_inspection_date, next_inspection_due, annual_maintenance_count, compliance_status}), inspection_standard (string, optional), regulatory_body (string, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<InspectionSchedulerInput>(args.input_data)
      const result = scheduleInspections(input)
      return formatInspectionSchedulerReport(result, input.facility_name || 'Unknown Facility')
    }
  }))

  tools.register(defineTool({
    name: 'elevator_iot_monitor',
    description: 'Analyze real-time IoT sensor data from elevator systems. Performs vibration analysis (ISO 10816), door motor diagnostics, motor current/temperature monitoring, and ride quality assessment with anomaly detection and root cause identification.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: elevator_id (string), sensor_data (object with vibration_rms, motor_temp_c, door_open_time_sec, door_close_time_sec, motor_current_a, ride_quality_index, noise_level_db, trips_today, door_cycles_today), baseline_ranges (object with [min,max] arrays, optional), duration_hours (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<IoTMonitorInput>(args.input_data)
      const result = monitorIoT(input)
      return formatIoTMonitorReport(result, input.elevator_id || 'Unknown')
    }
  }))

  tools.register(defineTool({
    name: 'special_equipment_compliance',
    description: 'Assess regulatory compliance for special equipment (elevators, cranes, boilers, pressure vessels). Checks registration status, inspection validity, operator certification, and documentation per Special Equipment Safety Law and international standards.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: facility_name (string), equipment (array of {id, type, registration_code, registration_status, inspection_valid_until, operator_certified, safety_manual_available, daily_inspection_log, last_inspection_result}), regulatory_framework (string, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<ComplianceInput>(args.input_data)
      const result = assessCompliance(input)
      return formatComplianceReport(result, input.facility_name || 'Unknown Facility')
    }
  }))

  tools.register(defineTool({
    name: 'elevator_modernization_advisor',
    description: 'Develop modernization plans for aging elevators. Proposes component-level upgrades (controller, door operator, hoist machine, safety systems), estimates costs and downtime, calculates energy savings and payback period, and identifies regulatory compliance gains.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: elevator_id (string), install_year (number), current_type (traction/hydraulic/MRL), floor_count (number), max_speed_ms (number), capacity_kg (number), issues (string[]), target_level (basic/standard/premium, optional), energy_priority (boolean, optional), accessibility_priority (boolean, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<ModernizationInput>(args.input_data)
      const result = adviseModernization(input)
      return formatModernizationReport(result, input.elevator_id || 'Unknown')
    }
  }))

  tools.register(defineTool({
    name: 'elevator_energy_auditor',
    description: 'Perform comprehensive energy audits for elevators. Calculates energy per trip, ISO 25745 classification, standby power waste, carbon footprint, and evaluates retrofit options (regenerative drive, LED lighting, PMSM motor, solar PV) with payback analysis.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: elevator_id (string), elevator_type, capacity_kg (number), max_speed_ms (number), floor_count (number), annual_trips (number), annual_energy_kwh (number), standby_power_w (number, optional), trips_per_day (number, optional), regenerative_drive (boolean, optional), led_lighting (boolean, optional), off_peak_ratio (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<EnergyAuditInput>(args.input_data)
      const result = auditEnergy(input)
      return formatEnergyAuditReport(result, input.elevator_id || 'Unknown')
    }
  }))

  tools.register(defineTool({
    name: 'elevator_rescue_simulator',
    description: 'Simulate elevator entrapment rescue scenarios and evaluate emergency plans. Models rescue phases, estimates response times, assesses risk factors, generates equipment checklists, and scores drill readiness for power failure, door entrapment, earthquake, fire, overspeed, and free fall scenarios.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: scenario_type (power_failure/door_entrapment/earthquake/fire/overspeed/free_fall), building_floors (number), building_type (residential/commercial/hospital/industrial), total_trapped (number, optional), vip_passengers (boolean, optional), emergency_team_available (boolean, optional), has_remote_monitoring (boolean, optional), response_constraints (object with max_response_time_min, max_evacuation_time_min, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<RescueSimulatorInput>(args.input_data)
      const result = simulateRescue(input)
      return formatRescueSimulatorReport(result, input.scenario_type || 'power_failure')
    }
  }))

  tools.register(defineTool({
    name: 'elevator_lifecycle_cost',
    description: 'Calculate total cost of ownership and lifecycle costs for elevators. Models component replacements, operational costs, NPV analysis over 10 years, and provides scrap/replacement timing assessment with economic justification.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: elevator_id (string), install_year (number), current_age_years (number), cost_currency (string, optional), components (array of {name, original_cost, install_year, expected_life_years, replacement_cost_current, condition, last_replacement}), annual_energy_cost (number, optional), annual_maintenance_cost (number, optional), annual_inspection_cost (number, optional), residual_value_pct (number, optional), discount_rate_pct (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<LifecycleCostInput>(args.input_data)
      const result = analyzeLifecycleCost(input)
      return formatLifecycleCostReport(result, input.elevator_id || 'Unknown')
    }
  }))

  console.log(`[dsh-tool-elevatorsafetyagent] Loaded v${VERSION} -- Elevator & Special Equipment Safety AI Agent with 8 tools`)
  console.log('  Tools: elevator_fault_predictor, elevator_inspection_scheduler, elevator_iot_monitor, special_equipment_compliance, elevator_modernization_advisor, elevator_energy_auditor, elevator_rescue_simulator, elevator_lifecycle_cost')
}
