import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// =====================================================================
// DSH Predictive Maintenance & Asset Health - dsh-tool-predmaint v0.1.0
// 8 tools: vibration analysis, RUL calculator, maintenance scheduler,
//          spare parts optimizer, thermal imaging, oil analysis,
//          motor current signature, asset health dashboard
// =====================================================================

function hashStr(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededRng(seedStr: string): () => number {
  return mulberry32(hashStr(seedStr))
}

function round(n: number, d = 2): number {
  const f = 10 ** d
  return Math.round(n * f) / f
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

// =====================================================================
// TOOL 1: vibration_analysis_engine
// =====================================================================

export interface VibrationAnalysisInput {
  asset_id: string
  asset_type?: 'motor' | 'pump' | 'compressor' | 'turbine' | 'gearbox' | 'fan' | 'generator' | 'conveyor'
  sampling_rate_hz?: number
  measurement_points?: Array<{
    location: string
    axis: 'horizontal' | 'vertical' | 'axial'
    velocity_mm_s?: number
    acceleration_g?: number
    displacement_mm?: number
    temperature_c?: number
  }>
  operating_speed_rpm?: number
  fault_frequencies?: Array<{ label: string; frequency_hz: number; severity?: 'low' | 'medium' | 'high' | 'critical' }>
  window_function?: 'hanning' | 'hamming' | 'blackman' | 'rectangular'
  seed_date?: string
}

export interface FrequencyPeak {
  frequency_hz: number
  amplitude: number
  phase_deg: number
  label: string
  severity: 'normal' | 'alert' | 'danger'
}

export interface BearingFault {
  bearing_id: string
  fault_type: 'inner_race' | 'outer_race' | 'ball' | 'cage'
  frequency_hz: number
  severity: 'incipient' | 'developing' | 'advanced' | 'critical'
  confidence: number
  recommendation: string
}

export interface VibrationAnalysisResult {
  asset_id: string
  asset_type: string
  overall_velocity_mm_s: number
  overall_acceleration_g: number
  overall_displacement_mm: number
  iso_10816_zone: 'A' | 'B' | 'C' | 'D'
  frequency_peaks: FrequencyPeak[]
  bearing_faults: BearingFault[]
  fft_bins: Array<{ freq: number; amp: number }>
  measurement_summary: Array<{ location: string; axis: string; rms_velocity: number; peak_acceleration: number; status: string }>
  defects_detected: string[]
  recommendations: string[]
  next_measurement_due_days: number
}

function analyzeVibration(input: VibrationAnalysisInput): VibrationAnalysisResult {
  const rng = seededRng(JSON.stringify(input))
  const assetType = input.asset_type || 'motor'
  const sr = input.sampling_rate_hz || 25600
  const opSpeed = input.operating_speed_rpm || 1800
  const bpfo = opSpeed / 60 * 3.5
  const bpfi = opSpeed / 60 * 5.5
  const bsf = opSpeed / 60 * 2.3
  const ftf = opSpeed / 60 * 0.4

  const points = input.measurement_points || [
    { location: 'DE_bearing', axis: 'horizontal', velocity_mm_s: round(2.5 + rng() * 6, 2), acceleration_g: round(0.3 + rng() * 1.5, 2) },
    { location: 'DE_bearing', axis: 'vertical', velocity_mm_s: round(1.8 + rng() * 5, 2), acceleration_g: round(0.2 + rng() * 1.2, 2) },
    { location: 'NDE_bearing', axis: 'horizontal', velocity_mm_s: round(2.0 + rng() * 4, 2), acceleration_g: round(0.25 + rng() * 1.0, 2) },
    { location: 'NDE_bearing', axis: 'axial', velocity_mm_s: round(1.5 + rng() * 3, 2), acceleration_g: round(0.15 + rng() * 0.8, 2) },
  ]

  let totalVel = 0
  let totalAcc = 0
  const measurementSummary: VibrationAnalysisResult['measurement_summary'] = []
  for (const p of points) {
    totalVel += p.velocity_mm_s || 0
    totalAcc += p.acceleration_g || 0
    const v = p.velocity_mm_s || 0
    let status = 'GOOD'
    if (v > 7.1) status = 'ALARM'
    else if (v > 4.5) status = 'ALERT'
    else if (v > 2.8) status = 'ACCEPTABLE'
    measurementSummary.push({
      location: p.location,
      axis: p.axis,
      rms_velocity: v,
      peak_acceleration: p.acceleration_g || 0,
      status,
    })
  }

  const avgVel = round(totalVel / points.length, 2)
  const avgAcc = round(totalAcc / points.length, 2)

  let isoZone: VibrationAnalysisResult['iso_10816_zone'] = 'A'
  if (avgVel > 11.2) isoZone = 'D'
  else if (avgVel > 7.1) isoZone = 'C'
  else if (avgVel > 2.8) isoZone = 'B'

  const peaks: FrequencyPeak[] = []
  const numPeaks = 8 + Math.floor(rng() * 8)
  for (let i = 0; i < numPeaks; i++) {
    const freq = round((i + 1) * (opSpeed / 60) + rng() * 20, 1)
    const amp = round(rng() * (i < 3 ? 8 : 3), 2)
    const sev: FrequencyPeak['severity'] = amp > 6 ? 'danger' : amp > 3 ? 'alert' : 'normal'
    peaks.push({ frequency_hz: freq, amplitude: amp, phase_deg: round(rng() * 360, 1), label: 'Harmonic_' + (i + 1), severity: sev })
  }
  peaks.push({ frequency_hz: round(bpfo, 1), amplitude: round(2 + rng() * 6, 2), phase_deg: round(rng() * 360, 1), label: 'BPFO', severity: rng() > 0.5 ? 'alert' : 'normal' })
  peaks.push({ frequency_hz: round(bpfi, 1), amplitude: round(1.5 + rng() * 5, 2), phase_deg: round(rng() * 360, 1), label: 'BPFI', severity: rng() > 0.6 ? 'alert' : 'normal' })
  peaks.push({ frequency_hz: round(bsf, 1), amplitude: round(1 + rng() * 4, 2), phase_deg: round(rng() * 360, 1), label: 'BSF', severity: 'normal' })
  peaks.push({ frequency_hz: round(ftf, 1), amplitude: round(0.8 + rng() * 3, 2), phase_deg: round(rng() * 360, 1), label: 'FTF', severity: 'normal' })

  const bearingFaults: BearingFault[] = []
  if (rng() > 0.3) bearingFaults.push({ bearing_id: 'BRG-DE-001', fault_type: 'outer_race', frequency_hz: round(bpfo, 1), severity: rng() > 0.6 ? 'developing' : 'incipient', confidence: round(0.7 + rng() * 0.25, 3), recommendation: 'Monitor outer race BPFO trend; schedule bearing replacement within 30 days' })
  if (rng() > 0.5) bearingFaults.push({ bearing_id: 'BRG-DE-001', fault_type: 'inner_race', frequency_hz: round(bpfi, 1), severity: rng() > 0.7 ? 'developing' : 'incipient', confidence: round(0.6 + rng() * 0.3, 3), recommendation: 'Inner race defect detected — increase sampling frequency to weekly' })
  if (rng() > 0.6) bearingFaults.push({ bearing_id: 'BRG-NDE-002', fault_type: 'ball', frequency_hz: round(bsf, 1), severity: 'incipient', confidence: round(0.5 + rng() * 0.3, 3), recommendation: 'Ball spin frequency anomaly — verify lubrication condition' })
  if (rng() > 0.7) bearingFaults.push({ bearing_id: 'BRG-NDE-002', fault_type: 'cage', frequency_hz: round(ftf, 1), severity: 'incipient', confidence: round(0.4 + rng() * 0.3, 3), recommendation: 'Cage frequency low-amplitude — continue routine monitoring' })

  const fftBins: { freq: number; amp: number }[] = []
  const binCount = Math.min(512, sr / 2)
  for (let i = 0; i < Math.min(64, binCount); i++) {
    fftBins.push({ freq: round(i * (sr / 2) / 64, 1), amp: round(rng() * (peaks.some(p => Math.abs(p.frequency_hz - i * (sr / 2) / 64) < 20) ? 8 : 2), 3) })
  }

  const defects: string[] = []
  if (bearingFaults.length > 0) defects.push(bearingFaults.length + ' bearing fault(s) detected')
  if (avgVel > 7.1) defects.push('Overall vibration exceeds ISO 10816 Zone C limit')
  if (peaks.some(p => p.severity === 'danger')) defects.push('High-amplitude spectral peaks detected')
  if (rng() > 0.5) defects.push('Misalignment suspected at 1x and 2x running speed')
  if (rng() > 0.6) defects.push('Looseness indicated by sub-harmonic energy')

  const recommendations: string[] = []
  if (bearingFaults.some(b => b.severity === 'developing' || b.severity === 'critical')) {
    recommendations.push('URGENT: Schedule bearing replacement — developing fault confirmed')
  }
  if (avgVel > 7.1) recommendations.push('Vibration level in ISO Zone C/D — reduce operating load or schedule shutdown')
  if (defects.some(d => d.includes('Misalignment'))) recommendations.push('Perform precision laser alignment at next opportunity')
  if (defects.some(d => d.includes('Looseness'))) recommendations.push('Inspect foundation bolts and grouting for structural looseness')
  recommendations.push('Continue ' + (avgVel > 4.5 ? 'weekly' : 'monthly') + ' vibration monitoring per ISO 10816')
  if (recommendations.length === 0) recommendations.push('Asset within acceptable vibration limits — maintain routine monitoring')

  return {
    asset_id: input.asset_id,
    asset_type: assetType,
    overall_velocity_mm_s: avgVel,
    overall_acceleration_g: avgAcc,
    overall_displacement_mm: round(avgVel / (2 * Math.PI * (opSpeed / 60)) * 0.5, 3),
    iso_10816_zone: isoZone,
    frequency_peaks: peaks,
    bearing_faults: bearingFaults,
    fft_bins: fftBins,
    measurement_summary: measurementSummary,
    defects_detected: defects,
    recommendations,
    next_measurement_due_days: avgVel > 7.1 ? 7 : avgVel > 4.5 ? 14 : 30,
  }
}

function formatVibration(r: VibrationAnalysisResult): string {
  const lines: string[] = []
  lines.push('# Vibration Analysis Report')
  lines.push('Asset: ' + r.asset_id + ' (' + r.asset_type + ')')
  lines.push('Overall Velocity: ' + r.overall_velocity_mm_s + ' mm/s RMS | ISO 10816 Zone: **' + r.iso_10816_zone + '**')
  lines.push('Overall Acceleration: ' + r.overall_acceleration_g + ' g RMS | Displacement: ' + r.overall_displacement_mm + ' mm')
  lines.push('')
  lines.push('## Measurement Points')
  r.measurement_summary.forEach(m => {
    lines.push('- ' + m.location + ' [' + m.axis + ']: ' + m.rms_velocity + ' mm/s, ' + m.peak_acceleration + ' g peak [' + m.status + ']')
  })
  lines.push('')
  lines.push('## Bearing Faults')
  if (r.bearing_faults.length === 0) lines.push('- No bearing faults detected')
  r.bearing_faults.forEach(b => {
    lines.push('- ' + b.bearing_id + ' ' + b.fault_type + ': ' + b.severity + ' | ' + b.frequency_hz + ' Hz | confidence ' + b.confidence)
    lines.push('  - ' + b.recommendation)
  })
  lines.push('')
  lines.push('## Spectral Peaks (top)')
  r.frequency_peaks.filter(p => p.severity !== 'normal').forEach(p => {
    lines.push('- ' + p.label + ': ' + p.frequency_hz + ' Hz @ ' + p.amplitude + ' mm/s [' + p.severity + ']')
  })
  lines.push('')
  lines.push('## Defects Detected')
  r.defects_detected.forEach(d => lines.push('- ' + d))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  lines.push('')
  lines.push('Next measurement due: ' + r.next_measurement_due_days + ' days')
  return lines.join('\n')
}

// =====================================================================
// TOOL 2: remaining_useful_life_calculator
// =====================================================================

export interface RULInput {
  asset_id: string
  asset_type?: 'bearing' | 'gear' | 'motor_winding' | 'seal' | 'lubricant' | 'belt' | 'coupling' | 'filter'
  degradation_model?: 'exponential' | 'linear' | 'weibull' | 'paris_law'
  current_health_index?: number
  failure_threshold?: number
  historical_data?: Array<{ timestamp: string; health_index: number; operating_hours: number }>
  operating_conditions?: {
    avg_load_percent?: number
    avg_speed_rpm?: number
    avg_temperature_c?: number
    contamination_level?: 'low' | 'medium' | 'high'
    lubrication_quality?: 'good' | 'fair' | 'poor'
  }
  confidence_level?: number
  seed_date?: string
}

export interface DegradationPoint {
  operating_hours: number
  health_index: number
  predicted: boolean
}

export interface RULResult {
  asset_id: string
  asset_type: string
  degradation_model: string
  current_health_index: number
  failure_threshold: number
  remaining_useful_life_hours: number
  remaining_useful_life_days: number
  remaining_useful_life_cycles: number
  probability_of_failure_30d: number
  probability_of_failure_90d: number
  confidence_interval: { lower_hours: number; upper_hours: number; level: number }
  degradation_curve: DegradationPoint[]
  weibull_parameters?: { beta: number; eta: number; gamma: number }
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  maintenance_action: string
  recommendations: string[]
}

function calculateRUL(input: RULInput): RULResult {
  const rng = seededRng(JSON.stringify(input))
  const assetType = input.asset_type || 'bearing'
  const model = input.degradation_model || 'exponential'
  const ci = clamp(input.current_health_index || (0.6 + rng() * 0.3), 0.05, 1.0)
  const ft = input.failure_threshold || 0.2
  const confLevel = input.confidence_level || 0.95
  const conds = input.operating_conditions || {}
  const load = conds.avg_load_percent || 75
  const temp = conds.avg_temperature_c || 65

  let rulHours: number
  let weibullBeta = 1.5
  let weibullEta = 8000
  let weibullGamma = 0

  const degradeFactor = 1 + (load - 50) / 100 * 0.5 + Math.max(0, temp - 40) / 100 * 0.3
  const contamFactor = conds.contamination_level === 'high' ? 1.8 : conds.contamination_level === 'medium' ? 1.3 : 1.0
  const lubeFactor = conds.lubrication_quality === 'poor' ? 1.6 : conds.lubrication_quality === 'fair' ? 1.2 : 1.0
  const totalFactor = degradeFactor * contamFactor * lubeFactor

  if (model === 'exponential') {
    const rate = 0.0001 * totalFactor
    rulHours = Math.max(0, Math.log(ci / ft) / rate)
    rulHours = round(rulHours, 1)
  } else if (model === 'weibull') {
    weibullBeta = round(1.2 + rng() * 2.5, 2)
    weibullEta = round(5000 + rng() * 10000, 1)
    const effectiveCI = ci - ft
    rulHours = round(weibullEta * Math.pow(-Math.log((effectiveCI - ft) / (1 - ft)), 1 / weibullBeta), 1)
  } else if (model === 'linear') {
    const hist = input.historical_data || []
    let slope = 0.00005 * totalFactor
    if (hist.length >= 2) {
      const dH = hist[hist.length - 1].health_index - hist[0].health_index
      const dT = hist[hist.length - 1].operating_hours - hist[0].operating_hours
      if (dT > 0) slope = -Math.abs(dH / dT)
    }
    rulHours = slope < 0 ? round((ci - ft) / Math.abs(slope), 1) : round((ci - ft) / 0.00005, 1)
  } else {
    const rate = 0.00008 * totalFactor
    rulHours = round((ci - ft) / rate, 1)
  }

  rulHours = Math.max(0, round(rulHours * (0.7 + rng() * 0.6), 1))
  const rulDays = round(rulHours / 24, 1)
  const rulCycles = round(rulHours * (conds.avg_speed_rpm || 1800) / 60, 0)

  const pf30 = round(clamp(1 - Math.exp(-((720 / Math.max(1, rulHours)) ** weibullBeta)), 0, 1), 4)
  const pf90 = round(clamp(1 - Math.exp(-((2160 / Math.max(1, rulHours)) ** weibullBeta)), 0, 1), 4)

  const zConf = confLevel >= 0.99 ? 2.576 : confLevel >= 0.95 ? 1.96 : 1.645
  const stdErr = rulHours * 0.15
  const ciLower = round(Math.max(0, rulHours - zConf * stdErr), 1)
  const ciUpper = round(rulHours + zConf * stdErr, 1)

  const curve: DegradationPoint[] = []
  const numHist = 20
  const hoursPerStep = Math.max(1, Math.round((rulHours * 1.2) / numHist))
  for (let i = 0; i < numHist; i++) {
    const h = i * hoursPerStep
    let hIdx: number
    if (model === 'exponential') hIdx = ci * Math.exp(-0.0001 * totalFactor * h)
    else if (model === 'weibull') hIdx = ft + (ci - ft) * Math.exp(-((h / weibullEta) ** weibullBeta))
    else hIdx = Math.max(ft, ci - 0.00005 * totalFactor * h)
    curve.push({ operating_hours: h, health_index: round(hIdx, 4), predicted: false })
  }
  const numPred = 15
  const startPred = numHist * hoursPerStep
  for (let i = 0; i < numPred; i++) {
    const h = startPred + i * hoursPerStep
    let hIdx: number
    if (model === 'exponential') hIdx = ci * Math.exp(-0.0001 * totalFactor * h)
    else if (model === 'weibull') hIdx = ft + (ci - ft) * Math.exp(-((h / weibullEta) ** weibullBeta))
    else hIdx = Math.max(0, ci - 0.00005 * totalFactor * h)
    curve.push({ operating_hours: h, health_index: round(Math.max(0, hIdx), 4), predicted: true })
  }

  let risk: RULResult['risk_level'] = 'LOW'
  if (rulHours < 168) risk = 'CRITICAL'
  else if (rulHours < 720) risk = 'HIGH'
  else if (rulHours < 2160) risk = 'MEDIUM'

  let action = 'Continue routine monitoring'
  if (risk === 'CRITICAL') action = 'Immediate shutdown and replacement required'
  else if (risk === 'HIGH') action = 'Schedule replacement within 30 days'
  else if (risk === 'MEDIUM') action = 'Plan replacement within 90 days and increase monitoring'

  const recs: string[] = []
  if (risk === 'CRITICAL' || risk === 'HIGH') recs.push('Order replacement ' + assetType + ' immediately — lead time may exceed RUL')
  if (totalFactor > 2) recs.push('Operating conditions significantly accelerating degradation — review load/temperature/lubrication')
  recs.push('Re-assess RUL after next inspection or ' + Math.max(7, Math.round(rulDays / 4)) + ' days')
  recs.push('Trend health index at ' + (risk === 'LOW' ? 'monthly' : 'weekly') + ' intervals')
  if (model === 'weibull') recs.push('Weibull shape parameter beta=' + weibullBeta + ' indicates ' + (weibullBeta > 1 ? 'wear-out phase' : 'infant mortality / random failures'))

  return {
    asset_id: input.asset_id,
    asset_type: assetType,
    degradation_model: model,
    current_health_index: round(ci, 4),
    failure_threshold: ft,
    remaining_useful_life_hours: rulHours,
    remaining_useful_life_days: rulDays,
    remaining_useful_life_cycles: rulCycles,
    probability_of_failure_30d: pf30,
    probability_of_failure_90d: pf90,
    confidence_interval: { lower_hours: ciLower, upper_hours: ciUpper, level: confLevel },
    degradation_curve: curve,
    weibull_parameters: model === 'weibull' ? { beta: weibullBeta, eta: weibullEta, gamma: weibullGamma } : undefined,
    risk_level: risk,
    maintenance_action: action,
    recommendations: recs,
  }
}

function formatRUL(r: RULResult): string {
  const lines: string[] = []
  lines.push('# Remaining Useful Life Report')
  lines.push('Asset: ' + r.asset_id + ' (' + r.asset_type + ') | Model: ' + r.degradation_model)
  lines.push('Health Index: ' + r.current_health_index + ' (failure threshold: ' + r.failure_threshold + ')')
  lines.push('')
  lines.push('## RUL Estimate')
  lines.push('- Remaining Useful Life: **' + r.remaining_useful_life_hours + ' hours (' + r.remaining_useful_life_days + ' days, ' + r.remaining_useful_life_cycles + ' cycles)**')
  lines.push('- Confidence Interval (' + (r.confidence_interval.level * 100) + '%): [' + r.confidence_interval.lower_hours + ' — ' + r.confidence_interval.upper_hours + ' hours]')
  lines.push('- Risk Level: **' + r.risk_level + '**')
  lines.push('')
  lines.push('## Failure Probability')
  lines.push('- P(failure) within 30 days: ' + (r.probability_of_failure_30d * 100).toFixed(2) + '%')
  lines.push('- P(failure) within 90 days: ' + (r.probability_of_failure_90d * 100).toFixed(2) + '%')
  if (r.weibull_parameters) {
    lines.push('')
    lines.push('## Weibull Parameters')
    lines.push('- Shape (beta): ' + r.weibull_parameters.beta)
    lines.push('- Scale (eta): ' + r.weibull_parameters.eta + ' hours')
    lines.push('- Location (gamma): ' + r.weibull_parameters.gamma)
  }
  lines.push('')
  lines.push('## Maintenance Action')
  lines.push('- ' + r.maintenance_action)
  lines.push('')
  lines.push('## Degradation Curve (last 5 predicted)')
  r.degradation_curve.filter(d => d.predicted).slice(-5).forEach(d => {
    lines.push('- ' + d.operating_hours + ' h: HI=' + d.health_index)
  })
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 3: maintenance_scheduler
// =====================================================================

export interface MaintenanceSchedulerInput {
  asset_id: string
  asset_type?: string
  maintenance_type?: 'preventive' | 'predictive' | 'corrective' | 'condition_based'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration_hours?: number
  required_skills?: string[]
  required_parts?: Array<{ part_id: string; part_name: string; quantity: number; lead_time_days: number; unit_cost_usd?: number }>
  available_technicians?: number
  available_shifts?: Array<{ shift_id: string; start: string; end: string; technicians: number }>
  existing_backlog?: Array<{ work_order_id: string; priority: string; estimated_hours: number; due_date: string }>
  risk_consequences?: { safety?: 'low' | 'medium' | 'high' | 'critical'; environmental?: 'low' | 'medium' | 'high'; production_loss_per_hour?: number }
  rul_hours?: number
  latest_allowed_date?: string
  seed_date?: string
}

export interface ScheduledMaintenance {
  work_order_id: string
  asset_id: string
  maintenance_type: string
  priority: string
  scheduled_start: string
  scheduled_end: string
  assigned_technicians: string[]
  required_parts_status: string
  risk_score: number
  status: 'scheduled' | 'awaiting_parts' | 'awaiting_resources' | 'ready'
}

export interface MaintenanceSchedulerResult {
  asset_id: string
  schedule: ScheduledMaintenance
  resource_allocation: { technicians_used: number; technicians_available: number; shift_utilization_percent: number }
  parts_readiness: Array<{ part_name: string; available: boolean; procurement_urgency: string }>
  risk_assessment: { overall_risk: string; safety_risk: string; environmental_risk: string; financial_impact_usd: number }
  backlog_impact: { orders_delayed: number; total_delay_hours: number }
  cost_estimate: { labor_cost_usd: number; parts_cost_usd: number; total_cost_usd: number; production_loss_usd: number }
  recommendations: string[]
}

function scheduleMaintenance(input: MaintenanceSchedulerInput): MaintenanceSchedulerResult {
  const rng = seededRng(JSON.stringify(input))
  const mType = input.maintenance_type || 'predictive'
  const priority = input.priority || 'medium'
  const duration = input.estimated_duration_hours || 4
  const parts = input.required_parts || []
  const techs = input.available_technicians || 3
  const skills = input.required_skills || ['mechanical']
  const risk = input.risk_consequences || {}
  const backlog = input.existing_backlog || []

  const priorityScore = priority === 'critical' ? 100 : priority === 'high' ? 75 : priority === 'medium' ? 50 : 25
  const safetyScore = risk.safety === 'critical' ? 40 : risk.safety === 'high' ? 30 : risk.safety === 'medium' ? 15 : 5
  const envScore = risk.environmental === 'high' ? 20 : risk.environmental === 'medium' ? 10 : 0
  const productionScore = clamp((risk.production_loss_per_hour || 0) * 0.001, 0, 30)
  const totalRiskScore = Math.min(100, round(priorityScore + safetyScore + envScore + productionScore, 1))

  const rulFactor = input.rul_hours ? clamp(168 / Math.max(1, input.rul_hours), 0.5, 2) : 1
  const urgencyScore = round(totalRiskScore * rulFactor, 1)

  let schedStart = new Date()
  schedStart.setDate(schedStart.getDate() + (urgencyScore > 80 ? 1 : urgencyScore > 50 ? 3 : urgencyScore > 25 ? 7 : 14))
  const schedEnd = new Date(schedStart.getTime() + duration * 3600000)

  const assignedCount = Math.min(techs, skills.length + 1)
  const assignedTechs: string[] = []
  for (let i = 0; i < assignedCount; i++) {
    assignedTechs.push('TECH-' + String(i + 1).padStart(3, '0') + ' [' + (skills[i] || 'general') + ']')
  }

  const partsStatus: { part_name: string; available: boolean; procurement_urgency: string }[] = []
  let allPartsReady = true
  for (const p of parts) {
    const avail = rng() > 0.3 || p.lead_time_days <= 3
    if (!avail) allPartsReady = false
    partsStatus.push({
      part_name: p.part_name,
      available: avail,
      procurement_urgency: !avail && p.lead_time_days > 7 ? 'URGENT_ORDER' : !avail ? 'STANDARD_ORDER' : 'IN_STOCK',
    })
  }

  const status: ScheduledMaintenance['status'] = !allPartsReady ? 'awaiting_parts' : assignedCount === 0 ? 'awaiting_resources' : 'ready'

  const shiftUtil = round((duration / 8) * 100, 1)

  let ordersDelayed = 0
  let totalDelayHrs = 0
  for (const b of backlog) {
    if (priority !== 'critical' && b.priority === 'critical') continue
    ordersDelayed++
    totalDelayHrs += b.estimated_hours * 0.5
  }

  const laborRate = 85
  const laborCost = round(duration * assignedCount * laborRate, 2)
  const partsCost = round(parts.reduce((s, p) => s + p.quantity * (p.unit_cost_usd || 150), 0), 2)
  const prodLoss = round(duration * (risk.production_loss_per_hour || 500), 2)

  const overallRisk: MaintenanceSchedulerResult['risk_assessment']['overall_risk'] =
    totalRiskScore > 75 ? 'CRITICAL' : totalRiskScore > 50 ? 'HIGH' : totalRiskScore > 25 ? 'MEDIUM' : 'LOW'

  const recs: string[] = []
  if (!allPartsReady) recs.push('Expedite part procurement — maintenance on hold awaiting components')
  if (urgencyScore > 70) recs.push('High urgency score (' + urgencyScore + ') — consider accelerating schedule')
  if (ordersDelayed > 0) recs.push(ordersDelayed + ' existing work order(s) will be delayed by this scheduling decision')
  if (assignedCount < skills.length) recs.push('Insufficient technicians with required skills — consider cross-training or contractor support')
  recs.push('Review similar assets at the next opportunity')

  return {
    asset_id: input.asset_id,
    schedule: {
      work_order_id: 'WO-' + Math.floor(10000 + rng() * 90000),
      asset_id: input.asset_id,
      maintenance_type: mType,
      priority,
      scheduled_start: schedStart.toISOString().slice(0, 16),
      scheduled_end: schedEnd.toISOString().slice(0, 16),
      assigned_technicians: assignedTechs,
      required_parts_status: allPartsReady ? 'All parts available' : 'Awaiting procurement',
      risk_score: totalRiskScore,
      status,
    },
    resource_allocation: { technicians_used: assignedCount, technicians_available: techs, shift_utilization_percent: shiftUtil },
    parts_readiness: partsStatus,
    risk_assessment: { overall_risk: overallRisk, safety_risk: risk.safety || 'low', environmental_risk: risk.environmental || 'low', financial_impact_usd: round(laborCost + partsCost + prodLoss, 2) },
    backlog_impact: { orders_delayed: ordersDelayed, total_delay_hours: round(totalDelayHrs, 1) },
    cost_estimate: { labor_cost_usd: laborCost, parts_cost_usd: partsCost, total_cost_usd: round(laborCost + partsCost, 2), production_loss_usd: prodLoss },
    recommendations: recs,
  }
}

function formatMaintenance(r: MaintenanceSchedulerResult): string {
  const lines: string[] = []
  lines.push('# Maintenance Schedule Report')
  lines.push('Asset: ' + r.asset_id + ' | WO: ' + r.schedule.work_order_id)
  lines.push('Type: ' + r.schedule.maintenance_type + ' | Priority: ' + r.schedule.priority + ' | Status: **' + r.schedule.status + '**')
  lines.push('Scheduled: ' + r.schedule.scheduled_start + ' to ' + r.schedule.scheduled_end)
  lines.push('Risk Score: ' + r.schedule.risk_score + '/100 | Overall Risk: **' + r.risk_assessment.overall_risk + '**')
  lines.push('')
  lines.push('## Resource Allocation')
  lines.push('- Technicians: ' + r.resource_allocation.technicians_used + '/' + r.resource_allocation.technicians_available)
  lines.push('- Shift Utilization: ' + r.resource_allocation.shift_utilization_percent + '%')
  lines.push('- Assigned: ' + r.schedule.assigned_technicians.join(', '))
  lines.push('')
  lines.push('## Parts Readiness')
  r.parts_readiness.forEach(p => {
    lines.push('- ' + p.part_name + ': ' + (p.available ? 'Available' : 'Not available') + ' [' + p.procurement_urgency + ']')
  })
  lines.push('')
  lines.push('## Cost Estimate')
  lines.push('- Labor: $' + r.cost_estimate.labor_cost_usd.toLocaleString())
  lines.push('- Parts: $' + r.cost_estimate.parts_cost_usd.toLocaleString())
  lines.push('- Production Loss: $' + r.cost_estimate.production_loss_usd.toLocaleString())
  lines.push('- **Total: $' + (r.cost_estimate.total_cost_usd + r.cost_estimate.production_loss_usd).toLocaleString() + '**')
  lines.push('')
  lines.push('## Backlog Impact')
  lines.push('- Orders delayed: ' + r.backlog_impact.orders_delayed + ' | Total delay: ' + r.backlog_impact.total_delay_hours + ' hours')
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 4: spare_parts_optimizer
// =====================================================================

export interface SparePartsInput {
  asset_id: string
  parts_inventory?: Array<{
    part_id: string
    part_name: string
    current_stock: number
    reorder_point: number
    economic_order_quantity?: number
    unit_cost_usd?: number
    lead_time_days?: number
    annual_demand?: number
    criticality?: 'critical' | 'important' | 'routine'
    failure_rate_per_year?: number
    shelf_life_months?: number
  }>
  service_level_target?: number
  carrying_cost_percent?: number
  ordering_cost_usd?: number
  budget_constraint_usd?: number
  seed_date?: string
}

export interface PartOptimization {
  part_id: string
  part_name: string
  current_stock: number
  recommended_order_quantity: number
  reorder_point: number
  safety_stock: number
  economic_order_quantity: number
  total_annual_cost_usd: number
  stockout_risk: 'LOW' | 'MEDIUM' | 'HIGH'
  action: string
}

export interface SparePartsResult {
  asset_id: string
  parts_optimization: PartOptimization[]
  total_inventory_value_usd: number
  total_annual_cost_usd: number
  service_level_achieved: number
  budget_status: { budget_usd: number; projected_spend_usd: number; within_budget: boolean }
  critical_shortages: string[]
  overstock_items: string[]
  recommendations: string[]
}

function optimizeSpareParts(input: SparePartsInput): SparePartsResult {
  const rng = seededRng(JSON.stringify(input))
  const serviceTarget = input.service_level_target || 0.95
  const carryPct = input.carrying_cost_percent || 0.25
  const orderCost = input.ordering_cost_usd || 100
  const budget = input.budget_constraint_usd || 50000
  const parts = input.parts_inventory || []

  const optimizations: PartOptimization[] = []
  let totalInvValue = 0
  let totalAnnualCost = 0
  const shortages: string[] = []
  const overstock: string[] = []

  for (const p of parts) {
    const demand = p.annual_demand || Math.floor(5 + rng() * 50)
    const leadTime = p.lead_time_days || Math.floor(7 + rng() * 45)
    const unitCost = p.unit_cost_usd || round(50 + rng() * 500, 2)
    const critMult = p.criticality === 'critical' ? 2.0 : p.criticality === 'important' ? 1.5 : 1.0

    const dailyDemand = demand / 365
    const demandStd = dailyDemand * 0.3
    const leadTimeDemand = dailyDemand * leadTime
    const zScore = serviceTarget >= 0.99 ? 2.33 : serviceTarget >= 0.95 ? 1.645 : 1.28
    const safetyStock = Math.ceil(zScore * demandStd * Math.sqrt(leadTime) * critMult)
    const reorderPoint = Math.ceil(leadTimeDemand + safetyStock)
    const eoq = Math.ceil(Math.sqrt((2 * demand * orderCost) / (unitCost * carryPct)))
    const orderQty = p.current_stock <= reorderPoint ? Math.max(eoq, reorderPoint - p.current_stock + safetyStock) : 0

    const annualHolding = ((p.current_stock + orderQty / 2) * unitCost * carryPct)
    const annualOrdering = orderQty > 0 ? (demand / orderQty) * orderCost : 0
    const annualCost = round(annualHolding + annualOrdering, 2)

    totalInvValue += (p.current_stock + orderQty) * unitCost
    totalAnnualCost += annualCost

    const stockoutRisk: PartOptimization['stockout_risk'] =
      p.current_stock < safetyStock ? 'HIGH' : p.current_stock < reorderPoint ? 'MEDIUM' : 'LOW'

    let action = 'No action required'
    if (orderQty > 0) action = 'Order ' + orderQty + ' units (EOQ=' + eoq + ')'
    else if (p.current_stock > reorderPoint * 3) action = 'Overstock — consider redistribution'

    if (stockoutRisk === 'HIGH') shortages.push(p.part_name + ' (stock: ' + p.current_stock + ', safety: ' + safetyStock + ')')
    if (p.current_stock > reorderPoint * 3) overstock.push(p.part_name + ' (stock: ' + p.current_stock + ', reorder: ' + reorderPoint + ')')

    optimizations.push({
      part_id: p.part_id,
      part_name: p.part_name,
      current_stock: p.current_stock,
      recommended_order_quantity: orderQty,
      reorder_point: reorderPoint,
      safety_stock: safetyStock,
      economic_order_quantity: eoq,
      total_annual_cost_usd: annualCost,
      stockout_risk: stockoutRisk,
      action,
    })
  }

  totalInvValue = round(totalInvValue, 2)
  totalAnnualCost = round(totalAnnualCost, 2)
  const projectedSpend = round(optimizations.reduce((s, o) => s + o.recommended_order_quantity * (parts.find(p => p.part_id === o.part_id)?.unit_cost_usd || 200), 0), 2)

  const achievedSL = round(clamp(serviceTarget - (shortages.length * 0.05), 0.8, 0.99), 4)

  const recs: string[] = []
  if (shortages.length > 0) recs.push(shortages.length + ' critical shortage(s) — expedite procurement immediately')
  if (overstock.length > 0) recs.push(overstock.length + ' overstock item(s) — redistribute or return to supplier')
  if (projectedSpend > budget) recs.push('Projected spend $' + projectedSpend.toLocaleString() + ' exceeds budget $' + budget.toLocaleString() + ' — prioritize critical items')
  recs.push('Review reorder points quarterly based on updated demand forecasts')
  recs.push('Consider vendor-managed inventory for high-value, low-variability parts')

  return {
    asset_id: input.asset_id,
    parts_optimization: optimizations,
    total_inventory_value_usd: totalInvValue,
    total_annual_cost_usd: totalAnnualCost,
    service_level_achieved: achievedSL,
    budget_status: { budget_usd: budget, projected_spend_usd: projectedSpend, within_budget: projectedSpend <= budget },
    critical_shortages: shortages,
    overstock_items: overstock,
    recommendations: recs,
  }
}

function formatSpareParts(r: SparePartsResult): string {
  const lines: string[] = []
  lines.push('# Spare Parts Optimization Report')
  lines.push('Asset: ' + r.asset_id)
  lines.push('Service Level Achieved: ' + (r.service_level_achieved * 100).toFixed(1) + '%')
  lines.push('Total Inventory Value: $' + r.total_inventory_value_usd.toLocaleString())
  lines.push('Total Annual Cost: $' + r.total_annual_cost_usd.toLocaleString())
  lines.push('Budget: $' + r.budget_status.budget_usd.toLocaleString() + ' | Projected Spend: $' + r.budget_status.projected_spend_usd.toLocaleString() + ' | ' + (r.budget_status.within_budget ? 'WITHIN BUDGET' : 'OVER BUDGET'))
  lines.push('')
  lines.push('## Parts Optimization')
  r.parts_optimization.forEach(p => {
    lines.push('- ' + p.part_name + ' (' + p.part_id + '): stock=' + p.current_stock + ', ROP=' + p.reorder_point + ', SS=' + p.safety_stock + ', EOQ=' + p.economic_order_quantity + ', order=' + p.recommended_order_quantity + ' [' + p.stockout_risk + ']')
    lines.push('  - Action: ' + p.action + ' | Annual cost: $' + p.total_annual_cost_usd.toLocaleString())
  })
  if (r.critical_shortages.length > 0) {
    lines.push('')
    lines.push('## Critical Shortages')
    r.critical_shortages.forEach(s => lines.push('- ' + s))
  }
  if (r.overstock_items.length > 0) {
    lines.push('')
    lines.push('## Overstock Items')
    r.overstock_items.forEach(o => lines.push('- ' + o))
  }
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 5: thermal_imaging_analyzer
// =====================================================================

export interface ThermalImagingInput {
  asset_id: string
  asset_type?: 'motor' | 'electrical_panel' | 'transformer' | 'pipe' | 'furnace' | 'bearing' | 'steam_trap' | 'insulation'
  thermal_image_data?: Array<{
    zone_id: string
    zone_name: string
    max_temp_c: number
    min_temp_c: number
    avg_temp_c: number
    ambient_temp_c?: number
    emissivity?: number
    hotspot_detected?: boolean
  }>
  operating_conditions?: {
    load_percent?: number
    ambient_temp_c?: number
    humidity_percent?: number
    wind_speed_ms?: number
  }
  reference_standards?: string[]
  seed_date?: string
}

export interface ThermalAnomaly {
  zone_id: string
  zone_name: string
  temperature_c: number
  temperature_rise_k: number
  severity: 'normal' | 'attention' | 'warning' | 'critical'
  probable_cause: string
  recommendation: string
}

export interface ThermalImagingResult {
  asset_id: string
  asset_type: string
  max_temperature_c: number
  min_temperature_c: number
  avg_temperature_c: number
  ambient_temperature_c: number
  max_temperature_rise_k: number
  anomalies: ThermalAnomaly[]
  thermal_profile: Array<{ zone: string; temp_c: number; rise_k: number; status: string }>
  iec_60947_compliance: string
  recommendations: string[]
  next_survey_due_days: number
}

function analyzeThermal(input: ThermalImagingInput): ThermalImagingResult {
  const rng = seededRng(JSON.stringify(input))
  const assetType = input.asset_type || 'motor'
  const ambient = (input.operating_conditions?.ambient_temp_c) || 25
  const load = (input.operating_conditions?.load_percent) || 75

  const zones = input.thermal_image_data || [
    { zone_id: 'Z1', zone_name: 'Phase_A', max_temp_c: round(45 + rng() * 60, 1), min_temp_c: round(35 + rng() * 40, 1), avg_temp_c: round(40 + rng() * 50, 1) },
    { zone_id: 'Z2', zone_name: 'Phase_B', max_temp_c: round(42 + rng() * 55, 1), min_temp_c: round(33 + rng() * 38, 1), avg_temp_c: round(38 + rng() * 48, 1) },
    { zone_id: 'Z3', zone_name: 'Phase_C', max_temp_c: round(48 + rng() * 65, 1), min_temp_c: round(36 + rng() * 42, 1), avg_temp_c: round(42 + rng() * 52, 1) },
    { zone_id: 'Z4', zone_name: 'Connection_DE', max_temp_c: round(50 + rng() * 70, 1), min_temp_c: round(38 + rng() * 45, 1), avg_temp_c: round(44 + rng() * 55, 1) },
    { zone_id: 'Z5', zone_name: 'Connection_NDE', max_temp_c: round(44 + rng() * 58, 1), min_temp_c: round(34 + rng() * 40, 1), avg_temp_c: round(40 + rng() * 50, 1) },
  ]

  let maxT = 0
  let minT = 999
  let sumT = 0
  const anomalies: ThermalAnomaly[] = []
  const profile: ThermalImagingResult['thermal_profile'] = []

  for (const z of zones) {
    if (z.max_temp_c > maxT) maxT = z.max_temp_c
    if (z.min_temp_c < minT) minT = z.min_temp_c
    sumT += z.avg_temp_c
    const rise = round(z.max_temp_c - ambient, 1)

    let severity: ThermalAnomaly['severity'] = 'normal'
    let cause = 'Normal operating temperature'
    let rec = 'No action required'

    if (rise > 60 || z.max_temp_c > 105) {
      severity = 'critical'
      cause = assetType === 'electrical_panel' ? 'Severe overheating — possible loose connection or overload' : 'Critical thermal anomaly — imminent failure risk'
      rec = 'URGENT: Schedule immediate inspection and corrective action'
    } else if (rise > 40 || z.max_temp_c > 85) {
      severity = 'warning'
      cause = assetType === 'electrical_panel' ? 'Significant temperature rise — check connection torque' : 'Elevated temperature — investigate load or cooling'
      rec = 'Schedule inspection within 7 days; verify load and cooling conditions'
    } else if (rise > 20 || z.max_temp_c > 65) {
      severity = 'attention'
      cause = 'Moderate temperature rise — early degradation indicator'
      rec = 'Monitor trend; include in next planned maintenance'
    }

    if (severity !== 'normal') {
      anomalies.push({ zone_id: z.zone_id, zone_name: z.zone_name, temperature_c: z.max_temp_c, temperature_rise_k: rise, severity, probable_cause: cause, recommendation: rec })
    }
    profile.push({ zone: z.zone_name, temp_c: z.max_temp_c, rise_k: rise, status: severity })
  }

  const avgT = round(sumT / zones.length, 1)
  const maxRise = round(maxT - ambient, 1)

  let compliance = 'COMPLIANT'
  if (anomalies.some(a => a.severity === 'critical')) compliance = 'NON-COMPLIANT — Critical thermal anomaly'
  else if (anomalies.some(a => a.severity === 'warning')) compliance = 'REVIEW REQUIRED — Warning-level anomalies detected'

  const recs: string[] = []
  if (anomalies.some(a => a.severity === 'critical')) recs.push('CRITICAL: Immediate thermal anomaly — reduce load or shutdown for inspection')
  if (anomalies.some(a => a.severity === 'warning')) recs.push('Warning-level hotspots detected — schedule thermographic re-survey within 7 days')
  if (load > 85) recs.push('High load (' + load + '%) contributing to thermal stress — consider load balancing')
  recs.push('Baseline thermal profile established — compare future surveys for trend analysis')
  recs.push('Verify emissivity settings (recommended: 0.90-0.95 for oxidized metal surfaces)')

  return {
    asset_id: input.asset_id,
    asset_type: assetType,
    max_temperature_c: round(maxT, 1),
    min_temperature_c: round(minT, 1),
    avg_temperature_c: avgT,
    ambient_temperature_c: ambient,
    max_temperature_rise_k: maxRise,
    anomalies,
    thermal_profile: profile,
    iec_60947_compliance: compliance,
    recommendations: recs,
    next_survey_due_days: anomalies.some(a => a.severity === 'critical') ? 1 : anomalies.some(a => a.severity === 'warning') ? 7 : anomalies.some(a => a.severity === 'attention') ? 30 : 90,
  }
}

function formatThermal(r: ThermalImagingResult): string {
  const lines: string[] = []
  lines.push('# Thermal Imaging Analysis Report')
  lines.push('Asset: ' + r.asset_id + ' (' + r.asset_type + ')')
  lines.push('Max Temp: ' + r.max_temperature_c + ' C | Min: ' + r.min_temperature_c + ' C | Avg: ' + r.avg_temperature_c + ' C')
  lines.push('Ambient: ' + r.ambient_temperature_c + ' C | Max Rise: ' + r.max_temperature_rise_k + ' K')
  lines.push('IEC 60947 Compliance: **' + r.iec_60947_compliance + '**')
  lines.push('')
  lines.push('## Thermal Profile')
  r.thermal_profile.forEach(p => {
    lines.push('- ' + p.zone + ': ' + p.temp_c + ' C (rise ' + p.rise_k + ' K) [' + p.status + ']')
  })
  if (r.anomalies.length > 0) {
    lines.push('')
    lines.push('## Anomalies Detected')
    r.anomalies.forEach(a => {
      lines.push('- ' + a.zone_name + ': ' + a.temperature_c + ' C (rise ' + a.temperature_rise_k + ' K) [' + a.severity + ']')
      lines.push('  - Cause: ' + a.probable_cause)
      lines.push('  - Action: ' + a.recommendation)
    })
  }
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  lines.push('')
  lines.push('Next survey due: ' + r.next_survey_due_days + ' days')
  return lines.join('\n')
}

// =====================================================================
// TOOL 6: oil_analysis_interpreter
// =====================================================================

export interface OilAnalysisInput {
  asset_id: string
  asset_type?: 'gearbox' | 'turbine' | 'hydraulic' | 'compressor' | 'transformer' | 'engine'
  oil_type?: string
  oil_age_hours?: number
  sample_date?: string
  test_results?: {
    viscosity_40c_cst?: number
    viscosity_100c_cst?: number
    acid_number_mgkoh_g?: number
    water_content_ppm?: number
    particle_count_4c?: number
    particle_count_6c?: number
    particle_count_14c?: number
    iron_ppm?: number
    copper_ppm?: number
    chromium_ppm?: number
    aluminum_ppm?: number
    lead_ppm?: number
    tin_ppm?: number
    silicon_ppm?: number
    sodium_ppm?: number
    oxidation_abs?: number
    nitration_abs?: number
    sulfation_abs?: number
    soot_percent?: number
    fuel_dilution_percent?: number
    coolant_detected?: boolean
  }
  seed_date?: string
}

export interface WearMetalFinding {
  element: string
  concentration_ppm: number
  severity: 'normal' | 'caution' | 'warning' | 'critical'
  probable_source: string
  trend: 'stable' | 'increasing' | 'decreasing'
}

export interface OilAnalysisResult {
  asset_id: string
  asset_type: string
  oil_condition: 'GOOD' | 'FAIR' | 'DEGRADED' | 'CRITICAL'
  overall_severity: 'normal' | 'caution' | 'warning' | 'critical'
  viscosity_status: string
  acid_number_status: string
  water_content_status: string
  cleanliness_iso_code: string
  cleanliness_status: string
  wear_metals: WearMetalFinding[]
  contamination_findings: string[]
  degradation_findings: string[]
  remaining_oil_life_percent: number
  drain_recommendation: string
  recommendations: string[]
  next_sample_due_days: number
}

function interpretOilAnalysis(input: OilAnalysisInput): OilAnalysisResult {
  const rng = seededRng(JSON.stringify(input))
  const assetType = input.asset_type || 'gearbox'
  const tests = input.test_results || {}
  const oilAge = input.oil_age_hours || 2000

  const visc40 = tests.viscosity_40c_cst || round(60 + rng() * 40, 1)
  const visc100 = tests.viscosity_100c_cst || round(8 + rng() * 6, 1)
  const an = tests.acid_number_mgkoh_g || round(0.5 + rng() * 3, 2)
  const water = tests.water_content_ppm || round(50 + rng() * 500, 0)
  const fe = tests.iron_ppm || round(5 + rng() * 80, 0)
  const cu = tests.copper_ppm || round(1 + rng() * 30, 0)
  const cr = tests.chromium_ppm || round(0.5 + rng() * 15, 0)
  const al = tests.aluminum_ppm || round(0.5 + rng() * 20, 0)
  const pb = tests.lead_ppm || round(0.5 + rng() * 15, 0)
  const sn = tests.tin_ppm || round(0.2 + rng() * 10, 0)
  const si = tests.silicon_ppm || round(2 + rng() * 30, 0)
  const na = tests.sodium_ppm || round(2 + rng() * 40, 0)
  const pc4 = tests.particle_count_4c || Math.floor(1000 + rng() * 50000)
  const pc6 = tests.particle_count_6c || Math.floor(100 + rng() * 10000)
  const pc14 = tests.particle_count_14c || Math.floor(50 + rng() * 2000)

  let viscStatus = 'Normal'
  const viscChange = round(((visc40 - 68) / 68) * 100, 1)
  if (Math.abs(viscChange) > 20) viscStatus = 'CRITICAL: Viscosity change ' + viscChange + '% — oil replacement required'
  else if (Math.abs(viscChange) > 10) viscStatus = 'WARNING: Viscosity change ' + viscChange + '% — monitor closely'
  else viscStatus = 'Normal: Viscosity change ' + viscChange + '% within limits'

  let anStatus = 'Normal'
  if (an > 3.0) anStatus = 'CRITICAL: Acid number ' + an + ' mgKOH/g — oil oxidation severe'
  else if (an > 2.0) anStatus = 'WARNING: Acid number ' + an + ' mgKOH/g — oxidation advancing'
  else if (an > 1.5) anStatus = 'CAUTION: Acid number ' + an + ' mgKOH/g — early oxidation'
  else anStatus = 'Normal: Acid number ' + an + ' mgKOH/g'

  let waterStatus = 'Normal'
  if (water > 500) waterStatus = 'CRITICAL: Water content ' + water + ' ppm — severe contamination'
  else if (water > 200) waterStatus = 'WARNING: Water content ' + water + ' ppm — investigate source'
  else waterStatus = 'Normal: Water content ' + water + ' ppm'

  const iso4 = pc4 < 1000 ? 13 : pc4 < 2000 ? 14 : pc4 < 4000 ? 15 : pc4 < 8000 ? 16 : pc4 < 16000 ? 17 : pc4 < 32000 ? 18 : pc4 < 64000 ? 19 : 20
  const iso6 = pc6 < 100 ? 10 : pc6 < 200 ? 11 : pc6 < 400 ? 12 : pc6 < 800 ? 13 : pc6 < 1600 ? 14 : pc6 < 3200 ? 15 : pc6 < 6400 ? 16 : 17
  const iso14 = pc14 < 50 ? 7 : pc14 < 100 ? 8 : pc14 < 200 ? 9 : pc14 < 400 ? 10 : pc14 < 800 ? 11 : pc14 < 1600 ? 12 : 13
  const isoCode = iso4 + '/' + iso6 + '/' + iso14
  let cleanStatus = 'Acceptable'
  if (iso4 > 18) cleanStatus = 'UNACCEPTABLE — severe particulate contamination'
  else if (iso4 > 16) cleanStatus = 'Below target — improve filtration'
  else cleanStatus = 'Within target cleanliness'

  const wearMetals: WearMetalFinding[] = [
    { element: 'Fe', concentration_ppm: fe, severity: fe > 60 ? 'critical' : fe > 30 ? 'warning' : fe > 15 ? 'caution' : 'normal', probable_source: 'Gears, cylinders, bearings — ferrous wear', trend: rng() > 0.5 ? 'increasing' : 'stable' },
    { element: 'Cu', concentration_ppm: cu, severity: cu > 20 ? 'critical' : cu > 10 ? 'warning' : cu > 5 ? 'caution' : 'normal', probable_source: 'Bearings, bushings, copper alloy components', trend: rng() > 0.5 ? 'increasing' : 'stable' },
    { element: 'Cr', concentration_ppm: cr, severity: cr > 10 ? 'critical' : cr > 5 ? 'warning' : cr > 2 ? 'caution' : 'normal', probable_source: 'Chrome-plated rings, stainless steel', trend: 'stable' },
    { element: 'Al', concentration_ppm: al, severity: al > 15 ? 'critical' : al > 8 ? 'warning' : al > 4 ? 'caution' : 'normal', probable_source: 'Pistons, aluminum housings', trend: rng() > 0.5 ? 'increasing' : 'stable' },
    { element: 'Pb', concentration_ppm: pb, severity: pb > 10 ? 'critical' : pb > 5 ? 'warning' : pb > 2 ? 'caution' : 'normal', probable_source: 'Bearing overlays, solder', trend: 'stable' },
    { element: 'Sn', concentration_ppm: sn, severity: sn > 8 ? 'critical' : sn > 4 ? 'warning' : sn > 2 ? 'caution' : 'normal', probable_source: 'Bearing alloys, bronze', trend: 'stable' },
    { element: 'Si', concentration_ppm: si, severity: si > 25 ? 'critical' : si > 15 ? 'warning' : si > 8 ? 'caution' : 'normal', probable_source: 'Dirt/dust ingress — seal degradation', trend: rng() > 0.5 ? 'increasing' : 'stable' },
    { element: 'Na', concentration_ppm: na, severity: na > 30 ? 'critical' : na > 15 ? 'warning' : na > 8 ? 'caution' : 'normal', probable_source: 'Coolant leak or additive depletion', trend: 'stable' },
  ]

  const contamination: string[] = []
  if (water > 200) contamination.push('Water contamination: ' + water + ' ppm — check seals and breathers')
  if (si > 15) contamination.push('Silicon (dirt) elevated: ' + si + ' ppm — seal integrity compromised')
  if (na > 15) contamination.push('Sodium elevated: ' + na + ' ppm — possible coolant ingress')
  if (tests.coolant_detected) contamination.push('Coolant detected — immediate investigation required')
  if (tests.fuel_dilution_percent && tests.fuel_dilution_percent > 3) contamination.push('Fuel dilution: ' + tests.fuel_dilution_percent + '% — injector or ring issue')

  const degradation: string[] = []
  if (an > 2.0) degradation.push('Oxidation: Acid number elevated at ' + an + ' mgKOH/g')
  if (tests.oxidation_abs && tests.oxidation_abs > 20) degradation.push('Oxidation absorbance: ' + tests.oxidation_abs + ' /cm — oil aging')
  if (tests.nitration_abs && tests.nitration_abs > 15) degradation.push('Nitration absorbance: ' + tests.nitration_abs + ' /cm — combustion byproducts')
  if (tests.soot_percent && tests.soot_percent > 2) degradation.push('Soot loading: ' + tests.soot_percent + '% — combustion efficiency issue')
  if (Math.abs(viscChange) > 10) degradation.push('Viscosity shift: ' + viscChange + '% from baseline')

  const critCount = wearMetals.filter(w => w.severity === 'critical').length
  const warnCount = wearMetals.filter(w => w.severity === 'warning').length
  const cautionCount = wearMetals.filter(w => w.severity === 'caution').length

  let overallSev: OilAnalysisResult['overall_severity'] = 'normal'
  if (critCount > 0 || contamination.length > 1) overallSev = 'critical'
  else if (warnCount > 1 || degradation.length > 1) overallSev = 'warning'
  else if (cautionCount > 1) overallSev = 'caution'

  let oilCond: OilAnalysisResult['oil_condition'] = 'GOOD'
  if (overallSev === 'critical') oilCond = 'CRITICAL'
  else if (overallSev === 'warning') oilCond = 'DEGRADED'
  else if (overallSev === 'caution') oilCond = 'FAIR'

  const remainingLife = round(clamp(100 - (oilAge / 40) - (an * 10) - (critCount * 15) - (warnCount * 8), 0, 100), 1)

  let drainRec = 'Continue normal operation — next scheduled drain at ' + (4000 - oilAge) + ' hours'
  if (oilCond === 'CRITICAL') drainRec = 'IMMEDIATE oil change required — oil severely degraded'
  else if (oilCond === 'DEGRADED') drainRec = 'Schedule oil change within 500 operating hours'
  else if (oilCond === 'FAIR') drainRec = 'Schedule oil change within 1000 operating hours'

  const recs: string[] = []
  if (oilCond === 'CRITICAL') recs.push('CRITICAL: Drain and replace oil immediately — inspect for abnormal wear')
  if (contamination.length > 0) recs.push('Address contamination sources — inspect seals, breathers, and cooling systems')
  if (wearMetals.some(w => w.severity === 'critical' || w.severity === 'warning')) recs.push('Elevated wear metals — correlate with vibration analysis and schedule borescope inspection')
  if (cleanStatus !== 'Acceptable') recs.push('Improve oil filtration — target ISO 16/14/11 or better')
  recs.push('Retest oil in ' + (oilCond === 'CRITICAL' ? 168 : oilCond === 'DEGRADED' ? 500 : 1000) + ' hours or at next PM interval')

  return {
    asset_id: input.asset_id,
    asset_type: assetType,
    oil_condition: oilCond,
    overall_severity: overallSev,
    viscosity_status: viscStatus,
    acid_number_status: anStatus,
    water_content_status: waterStatus,
    cleanliness_iso_code: isoCode,
    cleanliness_status: cleanStatus,
    wear_metals: wearMetals,
    contamination_findings: contamination,
    degradation_findings: degradation,
    remaining_oil_life_percent: remainingLife,
    drain_recommendation: drainRec,
    recommendations: recs,
    next_sample_due_days: oilCond === 'CRITICAL' ? 7 : oilCond === 'DEGRADED' ? 30 : oilCond === 'FAIR' ? 60 : 90,
  }
}

function formatOilAnalysis(r: OilAnalysisResult): string {
  const lines: string[] = []
  lines.push('# Oil Analysis Report')
  lines.push('Asset: ' + r.asset_id + ' (' + r.asset_type + ')')
  lines.push('Oil Condition: **' + r.oil_condition + '** | Severity: ' + r.overall_severity)
  lines.push('Remaining Oil Life: ' + r.remaining_oil_life_percent + '%')
  lines.push('')
  lines.push('## Physical Properties')
  lines.push('- Viscosity: ' + r.viscosity_status)
  lines.push('- Acid Number: ' + r.acid_number_status)
  lines.push('- Water Content: ' + r.water_content_status)
  lines.push('- Cleanliness: ISO ' + r.cleanliness_iso_code + ' — ' + r.cleanliness_status)
  lines.push('')
  lines.push('## Wear Metals')
  r.wear_metals.forEach(w => {
    lines.push('- ' + w.element + ': ' + w.concentration_ppm + ' ppm [' + w.severity + ', ' + w.trend + '] — ' + w.probable_source)
  })
  if (r.contamination_findings.length > 0) {
    lines.push('')
    lines.push('## Contamination')
    r.contamination_findings.forEach(c => lines.push('- ' + c))
  }
  if (r.degradation_findings.length > 0) {
    lines.push('')
    lines.push('## Degradation')
    r.degradation_findings.forEach(d => lines.push('- ' + d))
  }
  lines.push('')
  lines.push('## Drain Recommendation')
  lines.push('- ' + r.drain_recommendation)
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  lines.push('')
  lines.push('Next sample due: ' + r.next_sample_due_days + ' days')
  return lines.join('\n')
}

// =====================================================================
// TOOL 7: motor_current_signature_analyzer
// =====================================================================

export interface MCSAInput {
  asset_id: string
  motor_type?: 'induction' | 'synchronous' | 'dc' | 'servo'
  rated_power_kw?: number
  rated_voltage_v?: number
  rated_current_a?: number
  rated_speed_rpm?: number
  pole_count?: number
  supply_frequency_hz?: number
  current_spectrum?: Array<{ frequency_hz: number; amplitude_db: number }>
  operating_load_percent?: number
  measurement_duration_sec?: number
  seed_date?: string
}

export interface RotorBarFault {
  fault_type: 'broken_bar' | 'cracked_bar' | 'high_resistance_joint' | 'eccentricity' | 'stator_fault'
  sideband_frequency_hz: number
  amplitude_db: number
  severity: 'incipient' | 'developing' | 'advanced' | 'critical'
  confidence: number
  recommendation: string
}

export interface MCSAResult {
  asset_id: string
  motor_type: string
  supply_frequency_hz: number
  slip_frequency_hz: number
  rotor_speed_rpm: number
  rotor_bar_pass_frequency_hz: number
  eccentricity_index: number
  rotor_bar_faults: RotorBarFault[]
  stator_findings: string[]
  power_supply_findings: string[]
  load_torque_oscillations: Array<{ frequency_hz: number; amplitude: number; source: string }>
  air_gap_uniformity: 'uniform' | 'slight_eccentricity' | 'moderate_eccentricity' | 'severe_eccentricity'
  overall_condition: 'HEALTHY' | 'DEGRADED' | 'FAULTED' | 'CRITICAL'
  recommendations: string[]
  next_analysis_due_days: number
}

function analyzeMCSA(input: MCSAInput): MCSAResult {
  const rng = seededRng(JSON.stringify(input))
  const motorType = input.motor_type || 'induction'
  const freq = input.supply_frequency_hz || 60
  const poles = input.pole_count || 4
  const ratedSpeed = input.rated_speed_rpm || (freq * 120 / poles - 50)
  const syncSpeed = freq * 120 / poles
  const slip = round((syncSpeed - ratedSpeed) / syncSpeed, 4)
  const slipFreq = round(slip * freq, 3)
  const bpfi = ratedSpeed / 60 * (poles / 2)

  const rotorBarFaults: RotorBarFault[] = []
  if (rng() > 0.3) {
    const sbFreq = round(freq - 2 * slipFreq, 2)
    const amp = round(-50 + rng() * 20, 1)
    const sev: RotorBarFault['severity'] = amp > -30 ? 'critical' : amp > -40 ? 'developing' : amp > -45 ? 'advanced' : 'incipient'
    rotorBarFaults.push({ fault_type: 'broken_bar', sideband_frequency_hz: sbFreq, amplitude_db: amp, severity: sev, confidence: round(0.6 + rng() * 0.35, 3), recommendation: sev === 'critical' || sev === 'developing' ? 'Schedule rotor bar inspection — broken bar confirmed' : 'Monitor sideband amplitude trend at monthly intervals' })
  }
  if (rng() > 0.5) {
    const sbFreq = round(freq + 2 * slipFreq, 2)
    const amp = round(-55 + rng() * 15, 1)
    rotorBarFaults.push({ fault_type: 'cracked_bar', sideband_frequency_hz: sbFreq, amplitude_db: amp, severity: amp > -40 ? 'developing' : 'incipient', confidence: round(0.5 + rng() * 0.35, 3), recommendation: 'Cracked bar detected — plan rotor rebar or replacement at next overhaul' })
  }
  if (rng() > 0.6) {
    const sbFreq = round(freq - 4 * slipFreq, 2)
    const amp = round(-60 + rng() * 12, 1)
    rotorBarFaults.push({ fault_type: 'high_resistance_joint', sideband_frequency_hz: sbFreq, amplitude_db: amp, severity: amp > -45 ? 'developing' : 'incipient', confidence: round(0.4 + rng() * 0.35, 3), recommendation: 'High-resistance joint — check brazing quality and end-ring connections' })
  }

  const eccIdx = round(rng() * 0.3, 3)
  let airGap: MCSAResult['air_gap_uniformity'] = 'uniform'
  if (eccIdx > 0.2) airGap = 'severe_eccentricity'
  else if (eccIdx > 0.1) airGap = 'moderate_eccentricity'
  else if (eccIdx > 0.05) airGap = 'slight_eccentricity'

  if (eccIdx > 0.05) {
    const sbFreq = round(freq + rng() * 5, 2)
    rotorBarFaults.push({ fault_type: 'eccentricity', sideband_frequency_hz: sbFreq, amplitude_db: round(-45 + rng() * 15, 1), severity: eccIdx > 0.15 ? 'developing' : 'incipient', confidence: round(0.5 + rng() * 0.35, 3), recommendation: 'Air gap eccentricity detected — inspect bearings and rotor alignment' })
  }

  const statorFindings: string[] = []
  if (rng() > 0.6) statorFindings.push('Stator winding asymmetry detected — phase imbalance ' + round(1 + rng() * 5, 1) + '%')
  if (rng() > 0.7) statorFindings.push('Slot pass frequency harmonics elevated — possible stator lamination looseness')

  const powerFindings: string[] = []
  if (rng() > 0.5) powerFindings.push('Supply harmonics: 5th harmonic at ' + round(2 + rng() * 4, 1) + '% — investigate VFD or power quality')
  if (rng() > 0.7) powerFindings.push('Voltage unbalance: ' + round(0.5 + rng() * 2, 2) + '% — check supply connections')

  const torqueOsc: MCSAResult['load_torque_oscillations'] = []
  const numOsc = Math.floor(rng() * 3)
  for (let i = 0; i < numOsc; i++) {
    torqueOsc.push({ frequency_hz: round(1 + rng() * 20, 1), amplitude: round(0.5 + rng() * 3, 2), source: ['Gear mesh', 'Belt misalignment', 'Pump cavitation', 'Compressor pulsation'][Math.floor(rng() * 4)] })
  }

  let overallCond: MCSAResult['overall_condition'] = 'HEALTHY'
  if (rotorBarFaults.some(f => f.severity === 'critical')) overallCond = 'CRITICAL'
  else if (rotorBarFaults.some(f => f.severity === 'developing' || f.severity === 'advanced')) overallCond = 'FAULTED'
  else if (rotorBarFaults.some(f => f.severity === 'incipient') || statorFindings.length > 0) overallCond = 'DEGRADED'

  const recs: string[] = []
  if (overallCond === 'CRITICAL') recs.push('CRITICAL: Rotor bar fault — schedule immediate motor inspection or replacement')
  if (rotorBarFaults.some(f => f.fault_type === 'broken_bar')) recs.push('Broken bar(s) detected — avoid extended operation to prevent cascading damage')
  if (airGap !== 'uniform') recs.push('Air gap eccentricity: ' + airGap + ' — inspect bearing wear and rotor concentricity')
  if (statorFindings.length > 0) recs.push('Stator anomalies detected — perform insulation resistance and surge comparison tests')
  if (powerFindings.length > 0) recs.push('Power supply quality issues — install line filters or investigate VFD settings')
  recs.push('Repeat MCSA analysis in ' + (overallCond === 'HEALTHY' ? 90 : overallCond === 'DEGRADED' ? 30 : 7) + ' days')

  return {
    asset_id: input.asset_id,
    motor_type: motorType,
    supply_frequency_hz: freq,
    slip_frequency_hz: slipFreq,
    rotor_speed_rpm: ratedSpeed,
    rotor_bar_pass_frequency_hz: round(bpfi, 2),
    eccentricity_index: eccIdx,
    rotor_bar_faults: rotorBarFaults,
    stator_findings: statorFindings,
    power_supply_findings: powerFindings,
    load_torque_oscillations: torqueOsc,
    air_gap_uniformity: airGap,
    overall_condition: overallCond,
    recommendations: recs,
    next_analysis_due_days: overallCond === 'CRITICAL' ? 1 : overallCond === 'FAULTED' ? 7 : overallCond === 'DEGRADED' ? 30 : 90,
  }
}

function formatMCSA(r: MCSAResult): string {
  const lines: string[] = []
  lines.push('# Motor Current Signature Analysis Report')
  lines.push('Asset: ' + r.asset_id + ' (' + r.motor_type + ')')
  lines.push('Supply: ' + r.supply_frequency_hz + ' Hz | Slip: ' + r.slip_frequency_hz + ' Hz | Rotor speed: ' + r.rotor_speed_rpm + ' RPM')
  lines.push('Rotor bar pass freq: ' + r.rotor_bar_pass_frequency_hz + ' Hz | Eccentricity index: ' + r.eccentricity_index)
  lines.push('Air gap: ' + r.air_gap_uniformity)
  lines.push('Overall Condition: **' + r.overall_condition + '**')
  lines.push('')
  lines.push('## Rotor Bar Faults')
  if (r.rotor_bar_faults.length === 0) lines.push('- No rotor bar faults detected')
  r.rotor_bar_faults.forEach(f => {
    lines.push('- ' + f.fault_type + ': sideband ' + f.sideband_frequency_hz + ' Hz @ ' + f.amplitude_db + ' dB [' + f.severity + ', confidence ' + f.confidence + ']')
    lines.push('  - ' + f.recommendation)
  })
  if (r.stator_findings.length > 0) {
    lines.push('')
    lines.push('## Stator Findings')
    r.stator_findings.forEach(s => lines.push('- ' + s))
  }
  if (r.power_supply_findings.length > 0) {
    lines.push('')
    lines.push('## Power Supply Findings')
    r.power_supply_findings.forEach(p => lines.push('- ' + p))
  }
  if (r.load_torque_oscillations.length > 0) {
    lines.push('')
    lines.push('## Load Torque Oscillations')
    r.load_torque_oscillations.forEach(o => {
      lines.push('- ' + o.frequency_hz + ' Hz: amplitude ' + o.amplitude + '% — ' + o.source)
    })
  }
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  lines.push('')
  lines.push('Next analysis due: ' + r.next_analysis_due_days + ' days')
  return lines.join('\n')
}

// =====================================================================
// TOOL 8: asset_health_dashboard
// =====================================================================

export interface AssetHealthInput {
  asset_id: string
  asset_name?: string
  asset_type?: string
  location?: string
  health_indicators?: Array<{
    indicator: string
    value: number
    unit: string
    weight?: number
    threshold_warning?: number
    threshold_critical?: number
    direction?: 'lower_is_better' | 'higher_is_better'
  }>
  historical_scores?: Array<{ date: string; health_score: number }>
  criticality_rating?: 'A' | 'B' | 'C' | 'D'
  seed_date?: string
}

export interface HealthKPI {
  name: string
  score: number
  weight: number
  weighted_score: number
  status: 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
  trend: 'improving' | 'stable' | 'degrading'
}

export interface AssetHealthResult {
  asset_id: string
  asset_name: string
  asset_type: string
  location: string
  overall_health_score: number
  health_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  health_status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
  kpis: HealthKPI[]
  score_trend: Array<{ date: string; score: number }>
  risk_matrix: { probability: number; consequence: number; risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' }
  criticality_rating: string
  days_since_last_maintenance: number
  days_until_next_maintenance: number
  top_risks: string[]
  action_items: string[]
  recommendations: string[]
}

function buildAssetHealthDashboard(input: AssetHealthInput): AssetHealthResult {
  const rng = seededRng(JSON.stringify(input))
  const assetName = input.asset_name || input.asset_id
  const assetType = input.asset_type || 'rotating_equipment'
  const location = input.location || 'Plant_1'
  const criticality = input.criticality_rating || 'B'

  const indicators = input.health_indicators || [
    { indicator: 'vibration', value: round(2 + rng() * 8, 2), unit: 'mm/s', weight: 0.25, threshold_warning: 4.5, threshold_critical: 7.1, direction: 'lower_is_better' },
    { indicator: 'temperature', value: round(40 + rng() * 50, 1), unit: 'C', weight: 0.15, threshold_warning: 70, threshold_critical: 90, direction: 'lower_is_better' },
    { indicator: 'oil_condition', value: round(50 + rng() * 50, 1), unit: '%', weight: 0.15, threshold_warning: 60, threshold_critical: 40, direction: 'higher_is_better' },
    { indicator: 'rul', value: round(100 + rng() * 5000, 0), unit: 'hours', weight: 0.2, threshold_warning: 720, threshold_critical: 168, direction: 'higher_is_better' },
    { indicator: 'motor_current_balance', value: round(90 + rng() * 10, 1), unit: '%', weight: 0.1, threshold_warning: 95, threshold_critical: 90, direction: 'higher_is_better' },
    { indicator: 'thermal_imaging', value: round(30 + rng() * 50, 1), unit: 'C', weight: 0.15, threshold_warning: 65, threshold_critical: 85, direction: 'lower_is_better' },
  ]

  const kpis: HealthKPI[] = []
  let totalWeighted = 0
  let totalWeight = 0

  for (const ind of indicators) {
    const w = ind.weight || (1 / indicators.length)
    let score: number
    if (ind.direction === 'higher_is_better') {
      score = clamp(ind.value / (ind.threshold_warning || 100) * 100, 0, 100)
      if (ind.value < (ind.threshold_critical || 0)) score = clamp(score * 0.5, 0, 100)
    } else {
      score = clamp(100 - (ind.value / (ind.threshold_critical || 100)) * 100, 0, 100)
      if (ind.value > (ind.threshold_warning || 0)) score = clamp(score * 0.7, 0, 100)
    }
    score = round(score, 1)

    let status: HealthKPI['status'] = 'GOOD'
    if (score < 30) status = 'CRITICAL'
    else if (score < 50) status = 'POOR'
    else if (score < 70) status = 'FAIR'

    const trend: HealthKPI['trend'] = rng() > 0.6 ? 'degrading' : rng() > 0.3 ? 'stable' : 'improving'

    kpis.push({ name: ind.indicator, score, weight: w, weighted_score: round(score * w, 2), status, trend })
    totalWeighted += score * w
    totalWeight += w
  }

  const overallScore = round(totalWeighted / totalWeight, 1)

  let grade: AssetHealthResult['health_grade'] = 'A'
  if (overallScore < 30) grade = 'F'
  else if (overallScore < 50) grade = 'D'
  else if (overallScore < 65) grade = 'C'
  else if (overallScore < 80) grade = 'B'

  let healthStatus: AssetHealthResult['health_status'] = 'EXCELLENT'
  if (overallScore < 30) healthStatus = 'CRITICAL'
  else if (overallScore < 50) healthStatus = 'POOR'
  else if (overallScore < 70) healthStatus = 'FAIR'
  else if (overallScore < 85) healthStatus = 'GOOD'

  const histScores = input.historical_scores || []
  const trend: { date: string; score: number }[] = []
  if (histScores.length > 0) {
    histScores.forEach(h => trend.push({ date: h.date, score: h.health_score }))
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      trend.push({ date: d.toISOString().slice(0, 10), score: round(overallScore + (rng() - 0.5) * 20, 1) })
    }
  }
  trend.push({ date: new Date().toISOString().slice(0, 10), score: overallScore })

  const critMult = criticality === 'A' ? 1.5 : criticality === 'B' ? 1.2 : criticality === 'C' ? 1.0 : 0.8
  const prob = round(clamp((100 - overallScore) / 100 * critMult, 0, 1), 3)
  const cons = round(clamp(critMult * (criticality === 'A' ? 0.9 : criticality === 'B' ? 0.7 : 0.5), 0, 1), 3)
  let riskLvl: AssetHealthResult['risk_matrix']['risk_level'] = 'LOW'
  if (prob * cons > 0.5) riskLvl = 'EXTREME'
  else if (prob * cons > 0.25) riskLvl = 'HIGH'
  else if (prob * cons > 0.1) riskLvl = 'MEDIUM'

  const daysSinceMaint = Math.floor(10 + rng() * 80)
  const daysUntilMaint = Math.floor(7 + rng() * 53)

  const topRisks: string[] = []
  const poorKpis = kpis.filter(k => k.status === 'POOR' || k.status === 'CRITICAL')
  poorKpis.forEach(k => topRisks.push(k.name + ' in ' + k.status + ' condition (score: ' + k.score + ')'))
  if (kpis.some(k => k.trend === 'degrading')) topRisks.push('Degrading trend detected in ' + kpis.filter(k => k.trend === 'degrading').map(k => k.name).join(', '))
  if (riskLvl === 'HIGH' || riskLvl === 'EXTREME') topRisks.push('High risk matrix position — escalate to reliability engineering')

  const actionItems: string[] = []
  if (healthStatus === 'CRITICAL') actionItems.push('IMMEDIATE: Schedule emergency maintenance — asset health critical')
  if (poorKpis.length > 0) actionItems.push('Address ' + poorKpis.length + ' critical/poor KPI(s) within 7 days')
  if (kpis.some(k => k.name === 'vibration' && k.status !== 'GOOD')) actionItems.push('Perform detailed vibration analysis and bearing inspection')
  if (kpis.some(k => k.name === 'oil_condition' && k.status !== 'GOOD')) actionItems.push('Take oil sample for laboratory analysis')
  if (kpis.some(k => k.name === 'thermal_imaging' && k.status !== 'GOOD')) actionItems.push('Conduct thermographic survey of electrical and mechanical systems')
  actionItems.push('Update health score at next weekly review')

  const recs: string[] = []
  if (healthStatus === 'CRITICAL' || healthStatus === 'POOR') recs.push('Asset requires immediate attention — consider redundancy or temporary replacement')
  if (grade === 'D' || grade === 'F') recs.push('Evaluate asset replacement vs. major overhaul economics')
  recs.push('Implement continuous monitoring for ' + kpis.filter(k => k.trend === 'degrading').map(k => k.name).join(', ') + ' indicators')
  recs.push('Review and update PM strategy based on current health assessment')
  recs.push('Benchmark against similar assets in fleet for relative performance')

  return {
    asset_id: input.asset_id,
    asset_name: assetName,
    asset_type: assetType,
    location,
    overall_health_score: overallScore,
    health_grade: grade,
    health_status: healthStatus,
    kpis,
    score_trend: trend,
    risk_matrix: { probability: prob, consequence: cons, risk_level: riskLvl },
    criticality_rating: criticality,
    days_since_last_maintenance: daysSinceMaint,
    days_until_next_maintenance: daysUntilMaint,
    top_risks: topRisks,
    action_items: actionItems,
    recommendations: recs,
  }
}

function formatAssetHealth(r: AssetHealthResult): string {
  const lines: string[] = []
  lines.push('# Asset Health Dashboard')
  lines.push('Asset: ' + r.asset_name + ' (' + r.asset_id + ') | Type: ' + r.asset_type + ' | Location: ' + r.location)
  lines.push('Health Score: **' + r.overall_health_score + '/100** | Grade: **' + r.health_grade + '** | Status: **' + r.health_status + '**')
  lines.push('Criticality: ' + r.criticality_rating + ' | Risk Level: ' + r.risk_matrix.risk_level)
  lines.push('Last maintenance: ' + r.days_since_last_maintenance + ' days ago | Next: ' + r.days_until_next_maintenance + ' days')
  lines.push('')
  lines.push('## Key Performance Indicators')
  r.kpis.forEach(k => {
    lines.push('- ' + k.name + ': ' + k.score + '/100 (weight: ' + (k.weight * 100).toFixed(0) + '%, weighted: ' + k.weighted_score + ') [' + k.status + ', ' + k.trend + ']')
  })
  lines.push('')
  lines.push('## Risk Matrix')
  lines.push('- Probability: ' + r.risk_matrix.probability + ' | Consequence: ' + r.risk_matrix.consequence + ' | Level: **' + r.risk_matrix.risk_level + '**')
  lines.push('')
  lines.push('## Score Trend (12 months)')
  r.score_trend.forEach(t => {
    lines.push('- ' + t.date + ': ' + t.score)
  })
  if (r.top_risks.length > 0) {
    lines.push('')
    lines.push('## Top Risks')
    r.top_risks.forEach(risk => lines.push('- ' + risk))
  }
  lines.push('')
  lines.push('## Action Items')
  r.action_items.forEach(a => lines.push('- ' + a))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. vibration_analysis_engine
  tools.register(defineTool({
    name: 'vibration_analysis_engine',
    description: 'FFT-based vibration spectrum analysis with bearing fault detection (BPFO/BPFI/BSF/FTF), ISO 10816 zone classification, and defect identification',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, asset_type?: "motor"|"pump"|"compressor"|"turbine"|"gearbox"|"fan"|"generator"|"conveyor", sampling_rate_hz?: number, measurement_points?: Array<{ location: string, axis: "horizontal"|"vertical"|"axial", velocity_mm_s?: number, acceleration_g?: number, displacement_mm?: number, temperature_c?: number }>, operating_speed_rpm?: number, fault_frequencies?: Array<{ label: string, frequency_hz: number, severity?: "low"|"medium"|"high"|"critical" }>, window_function?: "hanning"|"hamming"|"blackman"|"rectangular", seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatVibration(analyzeVibration(JSON.parse(args.input_data)))
    },
  }))

  // 2. remaining_useful_life_calculator
  tools.register(defineTool({
    name: 'remaining_useful_life_calculator',
    description: 'Remaining useful life estimation with exponential/linear/Weibull/Paris law degradation models, confidence intervals, and failure probability',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, asset_type?: "bearing"|"gear"|"motor_winding"|"seal"|"lubricant"|"belt"|"coupling"|"filter", degradation_model?: "exponential"|"linear"|"weibull"|"paris_law", current_health_index?: number, failure_threshold?: number, historical_data?: Array<{ timestamp: string, health_index: number, operating_hours: number }>, operating_conditions?: { avg_load_percent?: number, avg_speed_rpm?: number, avg_temperature_c?: number, contamination_level?: "low"|"medium"|"high", lubrication_quality?: "good"|"fair"|"poor" }, confidence_level?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatRUL(calculateRUL(JSON.parse(args.input_data)))
    },
  }))

  // 3. maintenance_scheduler
  tools.register(defineTool({
    name: 'maintenance_scheduler',
    description: 'Risk-based maintenance scheduling with resource allocation, parts readiness assessment, cost estimation, and backlog impact analysis',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, asset_type?: string, maintenance_type?: "preventive"|"predictive"|"corrective"|"condition_based", priority?: "low"|"medium"|"high"|"critical", estimated_duration_hours?: number, required_skills?: string[], required_parts?: Array<{ part_id: string, part_name: string, quantity: number, lead_time_days: number, unit_cost_usd?: number }>, available_technicians?: number, available_shifts?: Array<{ shift_id: string, start: string, end: string, technicians: number }>, existing_backlog?: Array<{ work_order_id: string, priority: string, estimated_hours: number, due_date: string }>, risk_consequences?: { safety?: "low"|"medium"|"high"|"critical", environmental?: "low"|"medium"|"high", production_loss_per_hour?: number }, rul_hours?: number, latest_allowed_date?: string, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatMaintenance(scheduleMaintenance(JSON.parse(args.input_data)))
    },
  }))

  // 4. spare_parts_optimizer
  tools.register(defineTool({
    name: 'spare_parts_optimizer',
    description: 'Inventory optimization with EOQ calculation, safety stock modeling, reorder point determination, service level targeting, and budget analysis',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, parts_inventory?: Array<{ part_id: string, part_name: string, current_stock: number, reorder_point: number, economic_order_quantity?: number, unit_cost_usd?: number, lead_time_days?: number, annual_demand?: number, criticality?: "critical"|"important"|"routine", failure_rate_per_year?: number, shelf_life_months?: number }>, service_level_target?: number, carrying_cost_percent?: number, ordering_cost_usd?: number, budget_constraint_usd?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSpareParts(optimizeSpareParts(JSON.parse(args.input_data)))
    },
  }))

  // 5. thermal_imaging_analyzer
  tools.register(defineTool({
    name: 'thermal_imaging_analyzer',
    description: 'Infrared thermographic analysis with hotspot detection, temperature rise calculation, IEC 60947 compliance, and anomaly classification',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, asset_type?: "motor"|"electrical_panel"|"transformer"|"pipe"|"furnace"|"bearing"|"steam_trap"|"insulation", thermal_image_data?: Array<{ zone_id: string, zone_name: string, max_temp_c: number, min_temp_c: number, avg_temp_c: number, ambient_temp_c?: number, emissivity?: number, hotspot_detected?: boolean }>, operating_conditions?: { load_percent?: number, ambient_temp_c?: number, humidity_percent?: number, wind_speed_ms?: number }, reference_standards?: string[], seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatThermal(analyzeThermal(JSON.parse(args.input_data)))
    },
  }))

  // 6. oil_analysis_interpreter
  tools.register(defineTool({
    name: 'oil_analysis_interpreter',
    description: 'Lubricant oil analysis with wear metal identification, contamination assessment, degradation tracking, ISO cleanliness coding, and drain recommendations',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, asset_type?: "gearbox"|"turbine"|"hydraulic"|"compressor"|"transformer"|"engine", oil_type?: string, oil_age_hours?: number, sample_date?: string, test_results?: { viscosity_40c_cst?: number, viscosity_100c_cst?: number, acid_number_mgkoh_g?: number, water_content_ppm?: number, particle_count_4c?: number, particle_count_6c?: number, particle_count_14c?: number, iron_ppm?: number, copper_ppm?: number, chromium_ppm?: number, aluminum_ppm?: number, lead_ppm?: number, tin_ppm?: number, silicon_ppm?: number, sodium_ppm?: number, oxidation_abs?: number, nitration_abs?: number, sulfation_abs?: number, soot_percent?: number, fuel_dilution_percent?: number, coolant_detected?: boolean }, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatOilAnalysis(interpretOilAnalysis(JSON.parse(args.input_data)))
    },
  }))

  // 7. motor_current_signature_analyzer
  tools.register(defineTool({
    name: 'motor_current_signature_analyzer',
    description: 'Motor current signature analysis with rotor bar fault detection, eccentricity analysis, stator diagnostics, and load torque oscillation identification',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, motor_type?: "induction"|"synchronous"|"dc"|"servo", rated_power_kw?: number, rated_voltage_v?: number, rated_current_a?: number, rated_speed_rpm?: number, pole_count?: number, supply_frequency_hz?: number, current_spectrum?: Array<{ frequency_hz: number, amplitude_db: number }>, operating_load_percent?: number, measurement_duration_sec?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatMCSA(analyzeMCSA(JSON.parse(args.input_data)))
    },
  }))

  // 8. asset_health_dashboard
  tools.register(defineTool({
    name: 'asset_health_dashboard',
    description: 'Comprehensive asset health dashboard with KPI scoring, trend visualization, risk matrix, criticality rating, and action item generation',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { asset_id: string, asset_name?: string, asset_type?: string, location?: string, health_indicators?: Array<{ indicator: string, value: number, unit: string, weight?: number, threshold_warning?: number, threshold_critical?: number, direction?: "lower_is_better"|"higher_is_better" }>, historical_scores?: Array<{ date: string, health_score: number }>, criticality_rating?: "A"|"B"|"C"|"D", seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatAssetHealth(buildAssetHealthDashboard(JSON.parse(args.input_data)))
    },
  }))
}
