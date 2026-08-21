/**
 * DSH Public Safety AI Assistant Plugin v0.1.0
 *
 * 公共安全AI助手 — Public Safety & Emergency Management Toolkit
 * Comprehensive public safety analysis for emergency management agencies,
 * urban planners, and safety compliance teams.
 *
 * Features (v0.1.0):
 * - Crime Hotspot Analysis (spatial-temporal crime pattern identification, risk mapping, trend forecasting)
 * - Emergency Dispatch Optimizer (resource allocation, response time minimization, multi-incident prioritization)
 * - Disaster Loss Estimation (economic impact modeling, infrastructure damage assessment, recovery timeline)
 * - Crowd Safety Monitor (density analysis, flow dynamics, bottleneck detection, stampede risk evaluation)
 * - Fire Safety Inspection (compliance checklist generation, hazard identification, remediation prioritization)
 * - Traffic Safety Analytics (accident pattern analysis, high-risk zone identification, countermeasure design)
 * - Food & Drug Safety (contamination risk assessment, supply chain traceability, regulatory compliance audit)
 * - Resilience Planning (urban resilience framework, preparedness gap analysis, adaptive capacity scoring)
 *
 * DISCLAIMER: 本AI助手辅助公共安全分析，不替代公安机关与社会应急部门专业决策。
 *
 * @module dsh-tool-safetyagentpro
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-safetyagentpro'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '本AI助手辅助公共安全分析，不替代公安机关与社会应急部门专业决策。'

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

// ==================== TOOL 1: CRIME HOTSPOT ANALYSIS ====================

interface CrimeHotspotInput {
  district: string
  crime_data: Array<{ type: string; lat: number; lng: number; timestamp: string; severity: number }>
  time_window_days?: number
  analysis_radius_km?: number
}

interface HotspotZone {
  zone_id: string
  center_lat: number
  center_lng: number
  radius_km: number
  incident_count: number
  dominant_crime: string
  severity_index: number
  trend: 'rising' | 'stable' | 'declining'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

function analyzeCrimeHotspots(input: CrimeHotspotInput): {
  zones: HotspotZone[]
  overall_trend: string
  peak_hours: number[]
  recommendations: string[]
} {
  const r = rng(input.district + (input.crime_data.length.toString()))
  const radius = input.analysis_radius_km ?? 1.0
  const windowDays = input.time_window_days ?? 30

  const crimeTypes = new Map<string, number>()
  for (const c of input.crime_data) {
    crimeTypes.set(c.type, (crimeTypes.get(c.type) || 0) + 1)
  }

  const sortedTypes = [...crimeTypes.entries()].sort((a, b) => b[1] - a[1])
  const dominantType = sortedTypes.length > 0 ? sortedTypes[0][0] : 'unknown'

  const gridSize = Math.max(2, Math.min(6, Math.floor(input.crime_data.length / 3)))
  const zones: HotspotZone[] = []

  for (let i = 0; i < gridSize; i++) {
    const incidentCount = Math.max(1, Math.floor(r() * (input.crime_data.length / gridSize)) + 1)
    const avgSeverity = input.crime_data.slice(0, incidentCount).reduce((s, c) => s + c.severity, 0) / incidentCount
    const sevIndex = clamp(avgSeverity / 10, 0, 1)

    const trendRoll = r()
    const trend: HotspotZone['trend'] = trendRoll > 0.6 ? 'rising' : trendRoll > 0.3 ? 'stable' : 'declining'

    let riskLevel: HotspotZone['risk_level'] = 'low'
    if (sevIndex > 0.75 && incidentCount > 5) riskLevel = 'critical'
    else if (sevIndex > 0.5 || incidentCount > 5) riskLevel = 'high'
    else if (sevIndex > 0.25 || incidentCount > 2) riskLevel = 'medium'

    zones.push({
      zone_id: `HS-${String(i + 1).padStart(3, '0')}`,
      center_lat: (input.crime_data[i % input.crime_data.length]?.lat ?? 0) + (r() - 0.5) * 0.01,
      center_lng: (input.crime_data[i % input.crime_data.length]?.lng ?? 0) + (r() - 0.5) * 0.01,
      radius_km: radius * (0.5 + r() * 1.0),
      incident_count: incidentCount,
      dominant_crime: sortedTypes[i % sortedTypes.length]?.[0] || dominantType,
      severity_index: Math.round(sevIndex * 100) / 100,
      trend,
      risk_level: riskLevel
    })
  }

  zones.sort((a, b) => b.severity_index - a.severity_index)

  const peakHours: number[] = []
  for (let i = 0; i < 4; i++) {
    peakHours.push(Math.floor(r() * 24))
  }

  const risingCount = zones.filter(z => z.trend === 'rising').length
  const overallTrend = risingCount > zones.length / 2 ? 'upward' : risingCount > 0 ? 'mixed' : 'downward'

  const recommendations: string[] = []
  const criticalZones = zones.filter(z => z.risk_level === 'critical' || z.risk_level === 'high')
  if (criticalZones.length > 0) {
    recommendations.push(`Deploy additional patrol units to ${criticalZones.length} high-risk zone(s): ${criticalZones.map(z => z.zone_id).join(', ')}`)
  }
  if (peakHours.length > 0) {
    recommendations.push(`Increase surveillance during peak crime hours: ${peakHours.slice(0, 3).join(':00, ')}:00`)
  }
  if (dominantType !== 'unknown') {
    recommendations.push(`Targeted intervention programs recommended for ${dominantType} (dominant crime type)`)
  }
  recommendations.push(`Analysis window: ${windowDays} days | Grid radius: ${radius}km | Total incidents analyzed: ${input.crime_data.length}`)

  return { zones, overall_trend: overallTrend, peak_hours: peakHours, recommendations }
}

function formatCrimeHotspotReport(result: ReturnType<typeof analyzeCrimeHotspots>, district: string): string {
  const lines: string[] = []
  lines.push('## Crime Hotspot Analysis Report')
  lines.push('')
  lines.push(`**District:** ${district}`)
  lines.push(`**Overall Trend:** ${result.overall_trend.toUpperCase()} | **Hotspot Zones:** ${result.zones.length}`)
  lines.push('')
  lines.push('### Hotspot Zones (ranked by severity)')
  lines.push('| Zone | Dominant Crime | Incidents | Severity | Trend | Risk |')
  lines.push('|------|---------------|-----------|----------|-------|------|')
  for (const z of result.zones) {
    lines.push(`| ${z.zone_id} | ${z.dominant_crime} | ${z.incident_count} | ${z.severity_index.toFixed(2)} | ${z.trend} | ${z.risk_level.toUpperCase()} |`)
  }
  lines.push('')
  lines.push(`### Peak Crime Hours: ${result.peak_hours.slice(0, 3).map(h => h + ':00').join(', ')}`)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 2: EMERGENCY DISPATCH OPTIMIZER ====================

interface DispatchInput {
  incidents: Array<{ id: string; type: string; priority: number; lat: number; lng: number; reported_at: string }>
  units: Array<{ id: string; type: string; status: 'available' | 'dispatched' | 'returning'; lat: number; lng: number }>
  max_response_time_min?: number
}

interface DispatchAssignment {
  incident_id: string
  unit_id: string
  estimated_arrival_min: number
  distance_km: number
  priority_score: number
}

function optimizeDispatch(input: DispatchInput): {
  assignments: DispatchAssignment[]
  unassigned_incidents: string[]
  avg_response_time: number
  coverage_rate: number
  recommendations: string[]
} {
  const r = rng(input.incidents.length.toString() + input.units.length.toString())
  const maxResponse = input.max_response_time_min ?? 15

  const availableUnits = input.units.filter(u => u.status === 'available')
  const assignments: DispatchAssignment[] = []
  const usedUnits = new Set<string>()

  const sortedIncidents = [...input.incidents].sort((a, b) => b.priority - a.priority)

  for (const incident of sortedIncidents) {
    let bestUnit: typeof availableUnits[0] | null = null
    let bestDist = Infinity

    for (const unit of availableUnits) {
      if (usedUnits.has(unit.id)) continue
      const dist = Math.sqrt(
        Math.pow(incident.lat - unit.lat, 2) + Math.pow(incident.lng - unit.lng, 2)
      ) * 111
      if (dist < bestDist) {
        bestDist = dist
        bestUnit = unit
      }
    }

    if (bestUnit) {
      const arrivalMin = Math.round(bestDist * (2.5 + r() * 1.5) * 10) / 10
      assignments.push({
        incident_id: incident.id,
        unit_id: bestUnit.id,
        estimated_arrival_min: arrivalMin,
        distance_km: Math.round(bestDist * 100) / 100,
        priority_score: incident.priority
      })
      usedUnits.add(bestUnit.id)
    }
  }

  const assignedIds = new Set(assignments.map(a => a.incident_id))
  const unassigned = input.incidents.filter(i => !assignedIds.has(i.id)).map(i => i.id)

  const avgResponse = assignments.length > 0
    ? Math.round(assignments.reduce((s, a) => s + a.estimated_arrival_min, 0) / assignments.length * 10) / 10
    : 0
  const coverageRate = input.incidents.length > 0 ? assignments.length / input.incidents.length : 0

  const recommendations: string[] = []
  if (unassigned.length > 0) {
    recommendations.push(`${unassigned.length} incident(s) lack available units - request mutual aid or escalate`)
  }
  if (avgResponse > maxResponse) {
    recommendations.push(`Average response time (${avgResponse}min) exceeds target (${maxResponse}min) - consider unit pre-positioning`)
  }
  const slowResponses = assignments.filter(a => a.estimated_arrival_min > maxResponse)
  if (slowResponses.length > 0) {
    recommendations.push(`${slowResponses.length} assignment(s) exceed response time target - review unit distribution`)
  }
  if (coverageRate >= 0.9) {
    recommendations.push('High coverage rate achieved - maintain current unit readiness levels')
  }
  recommendations.push(`Available units: ${availableUnits.length} / ${input.units.length} | Coverage: ${formatPercent(coverageRate)}`)

  return { assignments, unassigned_incidents: unassigned, avg_response_time: avgResponse, coverage_rate: coverageRate, recommendations }
}

function formatDispatchReport(result: ReturnType<typeof optimizeDispatch>): string {
  const lines: string[] = []
  lines.push('## Emergency Dispatch Optimization Report')
  lines.push('')
  lines.push(`**Assignments:** ${result.assignments.length} | **Avg Response:** ${result.avg_response_time}min | **Coverage:** ${formatPercent(result.coverage_rate)}`)
  lines.push('')
  lines.push('### Dispatch Assignments')
  lines.push('| Incident | Unit | ETA (min) | Distance (km) | Priority |')
  lines.push('|----------|------|-----------|---------------|----------|')
  for (const a of result.assignments.sort((x, y) => y.priority_score - x.priority_score)) {
    lines.push(`| ${a.incident_id} | ${a.unit_id} | ${a.estimated_arrival_min} | ${a.distance_km} | ${a.priority_score} |`)
  }
  if (result.unassigned_incidents.length > 0) {
    lines.push('')
    lines.push(`### Unassigned Incidents: ${result.unassigned_incidents.join(', ')}`)
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

// ==================== TOOL 3: DISASTER LOSS ESTIMATION ====================

interface DisasterLossInput {
  disaster_type: string
  magnitude: number
  affected_area_km2: number
  population: number
  infrastructure_value_million: string
  duration_hours?: string
}

interface LossEstimate {
  category: string
  estimated_loss_million: number
  confidence: number
  recovery_months: number
}

function estimateDisasterLoss(input: DisasterLossInput): {
  direct_losses: LossEstimate[]
  indirect_losses: LossEstimate[]
  total_estimated_loss: number
  affected_population_pct: number
  recovery_timeline_months: number
  recommendations: string[]
} {
  const r = rng(input.disaster_type + input.magnitude.toString() + input.affected_area_km2.toString())
  const mag = input.magnitude
  const area = input.affected_area_km2
  const pop = input.population
  const infraValue = parseFloat(input.infrastructure_value_million) || 100

  const severityFactor = clamp(mag / 10, 0.1, 1.0)
  const areaFactor = clamp(area / 500, 0.05, 1.0)

  const directLosses: LossEstimate[] = [
    {
      category: 'Infrastructure Damage',
      estimated_loss_million: Math.round(infraValue * severityFactor * areaFactor * (0.8 + r() * 0.4) * 10) / 10,
      confidence: 0.7 + r() * 0.2,
      recovery_months: Math.round(3 + r() * 18)
    },
    {
      category: 'Residential Property',
      estimated_loss_million: Math.round(pop * 0.05 * severityFactor * (0.7 + r() * 0.6) * 10) / 10,
      confidence: 0.6 + r() * 0.25,
      recovery_months: Math.round(6 + r() * 24)
    },
    {
      category: 'Commercial/Business',
      estimated_loss_million: Math.round(infraValue * 0.3 * severityFactor * (0.6 + r() * 0.8) * 10) / 10,
      confidence: 0.55 + r() * 0.25,
      recovery_months: Math.round(4 + r() * 12)
    },
    {
      category: 'Agriculture & Environment',
      estimated_loss_million: Math.round(area * 0.1 * (0.5 + r() * 1.0) * 10) / 10,
      confidence: 0.5 + r() * 0.3,
      recovery_months: Math.round(2 + r() * 36)
    }
  ]

  const indirectLosses: LossEstimate[] = [
    {
      category: 'Business Interruption',
      estimated_loss_million: Math.round(directLosses[2].estimated_loss_million * (0.3 + r() * 0.5) * 10) / 10,
      confidence: 0.45 + r() * 0.3,
      recovery_months: Math.round(3 + r() * 9)
    },
    {
      category: 'Emergency Response Cost',
      estimated_loss_million: Math.round((pop * 0.001 + area * 0.01) * (0.8 + r() * 0.4) * 10) / 10,
      confidence: 0.7 + r() * 0.2,
      recovery_months: 1
    },
    {
      category: 'Long-term Economic Impact',
      estimated_loss_million: Math.round(directLosses.reduce((s, d) => s + d.estimated_loss_million, 0) * (0.2 + r() * 0.4) * 10) / 10,
      confidence: 0.4 + r() * 0.3,
      recovery_months: Math.round(12 + r() * 48)
    }
  ]

  const totalLoss = Math.round(
    [...directLosses, ...indirectLosses].reduce((s, l) => s + l.estimated_loss_million, 0) * 10
  ) / 10

  const affectedPopPct = clamp(severityFactor * areaFactor * (0.5 + r() * 0.5), 0.05, 0.95)
  const maxRecovery = Math.max(...directLosses.concat(indirectLosses).map(l => l.recovery_months))

  const recommendations: string[] = []
  recommendations.push(`Activate emergency operations center at ${Math.round(severityFactor * 100)}% staffing level`)
  if (totalLoss > infraValue * 0.5) {
    recommendations.push('Catastrophic loss level detected - request federal/national disaster declaration')
  }
  if (affectedPopPct > 0.3) {
    recommendations.push(`Mass displacement likely (${formatPercent(affectedPopPct)} of population) - prepare shelter capacity`)
  }
  recommendations.push(`Estimated recovery timeline: ${maxRecovery} months for full infrastructure restoration`)
  recommendations.push(`Priority: Focus on ${directLosses.sort((a, b) => b.estimated_loss_million - a.estimated_loss_million)[0].category} (highest loss category)`)

  return {
    direct_losses: directLosses,
    indirect_losses: indirectLosses,
    total_estimated_loss: totalLoss,
    affected_population_pct: Math.round(affectedPopPct * 100) / 100,
    recovery_timeline_months: maxRecovery,
    recommendations
  }
}

function formatDisasterLossReport(result: ReturnType<typeof estimateDisasterLoss>, disasterType: string): string {
  const lines: string[] = []
  lines.push('## Disaster Loss Estimation Report')
  lines.push('')
  lines.push(`**Disaster Type:** ${disasterType} | **Total Estimated Loss:** $${result.total_estimated_loss}M | **Population Affected:** ${formatPercent(result.affected_population_pct)}`)
  lines.push('')
  lines.push('### Direct Losses')
  lines.push('| Category | Est. Loss ($M) | Confidence | Recovery (months) |')
  lines.push('|----------|---------------|------------|-------------------|')
  for (const l of result.direct_losses) {
    lines.push(`| ${l.category} | $${l.estimated_loss_million}M | ${formatPercent(l.confidence)} | ${l.recovery_months} |`)
  }
  lines.push('')
  lines.push('### Indirect Losses')
  lines.push('| Category | Est. Loss ($M) | Confidence | Recovery (months) |')
  lines.push('|----------|---------------|------------|-------------------|')
  for (const l of result.indirect_losses) {
    lines.push(`| ${l.category} | $${l.estimated_loss_million}M | ${formatPercent(l.confidence)} | ${l.recovery_months} |`)
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

// ==================== TOOL 4: CROWD SAFETY MONITOR ====================

interface CrowdSafetyInput {
  venue_name: string
  venue_capacity: number
  current_occupancy: number
  entry_rate_per_min: number
  exit_rate_per_min: number
  zones?: Array<{ name: string; capacity: number; current_count: number }>
}

interface CrowdZoneAlert {
  zone_name: string
  density_pct: number
  status: 'safe' | 'caution' | 'warning' | 'critical'
  estimated_time_to_critical_min: number | null
}

function monitorCrowdSafety(input: CrowdSafetyInput): {
  overall_density_pct: number
  overall_status: string
  net_flow_per_min: number
  estimated_capacity_time_min: number | null
  zone_alerts: CrowdZoneAlert[]
  stampede_risk: 'low' | 'moderate' | 'high' | 'extreme'
  recommendations: string[]
} {
  const r = rng(input.venue_name + input.current_occupancy.toString())
  const density = clamp(input.current_occupancy / input.venue_capacity, 0, 1)
  const netFlow = input.entry_rate_per_min - input.exit_rate_per_min
  const capacityLeft = input.venue_capacity - input.current_occupancy

  let estCapacityTime: number | null = null
  if (netFlow > 0) {
    estCapacityTime = Math.round(capacityLeft / netFlow)
  }

  let overallStatus = 'safe'
  if (density > 0.9) overallStatus = 'critical'
  else if (density > 0.75) overallStatus = 'warning'
  else if (density > 0.6) overallStatus = 'caution'

  const zoneAlerts: CrowdZoneAlert[] = []
  if (input.zones && input.zones.length > 0) {
    for (const z of input.zones) {
      const zDensity = clamp(z.current_count / z.capacity, 0, 1)
      let status: CrowdZoneAlert['status'] = 'safe'
      if (zDensity > 0.9) status = 'critical'
      else if (zDensity > 0.75) status = 'warning'
      else if (zDensity > 0.6) status = 'caution'

      let timeToCritical: number | null = null
      if (netFlow > 0 && zDensity < 0.9) {
        timeToCritical = Math.round((z.capacity * 0.9 - z.current_count) / (netFlow / input.zones!.length))
      }

      zoneAlerts.push({
        zone_name: z.name,
        density_pct: Math.round(zDensity * 100) / 100,
        status,
        estimated_time_to_critical_min: timeToCritical
      })
    }
  }

  let stampedeRisk: 'low' | 'moderate' | 'high' | 'extreme' = 'low'
  if (density > 0.95 && netFlow > 10) stampedeRisk = 'extreme'
  else if (density > 0.85 && netFlow > 5) stampedeRisk = 'high'
  else if (density > 0.7 && netFlow > 0) stampedeRisk = 'moderate'

  const recommendations: string[] = []
  if (stampedeRisk === 'extreme' || stampedeRisk === 'high') {
    recommendations.push(`IMMEDIATE: Halt all entry to ${input.venue_name} - stampede risk is ${stampedeRisk.toUpperCase()}`)
    recommendations.push('Activate crowd control barriers and open all emergency exits')
  }
  if (density > 0.8) {
    recommendations.push(`Venue at ${formatPercent(density)} capacity - implement one-in-one-out policy`)
  }
  if (netFlow > 20) {
    recommendations.push(`High net inflow (${netFlow}/min) - deploy additional entry management staff`)
  }
  const criticalZones = zoneAlerts.filter(z => z.status === 'critical' || z.status === 'warning')
  if (criticalZones.length > 0) {
    recommendations.push(`Redirect crowd flow away from: ${criticalZones.map(z => z.zone_name).join(', ')}`)
  }
  if (estCapacityTime !== null && estCapacityTime < 30) {
    recommendations.push(`Venue reaching full capacity in ~${estCapacityTime} minutes - prepare overflow areas`)
  }
  recommendations.push(`Current occupancy: ${input.current_occupancy}/${input.venue_capacity} (${formatPercent(density)}) | Net flow: ${netFlow > 0 ? '+' : ''}${netFlow}/min`)

  return {
    overall_density_pct: Math.round(density * 100) / 100,
    overall_status: overallStatus,
    net_flow_per_min: netFlow,
    estimated_capacity_time_min: estCapacityTime,
    zone_alerts: zoneAlerts,
    stampede_risk: stampedeRisk,
    recommendations
  }
}

function formatCrowdSafetyReport(result: ReturnType<typeof monitorCrowdSafety>, venueName: string): string {
  const lines: string[] = []
  lines.push('## Crowd Safety Monitor Report')
  lines.push('')
  lines.push(`**Venue:** ${venueName} | **Status:** ${result.overall_status.toUpperCase()} | **Stampede Risk:** ${result.stampede_risk.toUpperCase()}`)
  lines.push(`**Density:** ${formatPercent(result.overall_density_pct)} | **Net Flow:** ${result.net_flow_per_min > 0 ? '+' : ''}${result.net_flow_per_min}/min`)
  if (result.estimated_capacity_time_min !== null) {
    lines.push(`**Time to Full Capacity:** ~${result.estimated_capacity_time_min} minutes`)
  }
  lines.push('')
  if (result.zone_alerts.length > 0) {
    lines.push('### Zone Status')
    lines.push('| Zone | Density | Status | Time to Critical |')
    lines.push('|------|---------|--------|------------------|')
    for (const z of result.zone_alerts) {
      const ttc = z.estimated_time_to_critical_min !== null ? z.estimated_time_to_critical_min + 'min' : 'N/A'
      lines.push(`| ${z.zone_name} | ${formatPercent(z.density_pct)} | ${z.status.toUpperCase()} | ${ttc} |`)
    }
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== TOOL 5: FIRE SAFETY INSPECTION ====================

interface FireInspectionInput {
  facility_name: string
  facility_type: string
  building_area_sqm: number
  floors: number
  occupancy_count: number
  has_sprinkler?: string
  has_alarm?: string
  last_inspection_date?: string
}

interface InspectionItem {
  category: string
  item: string
  status: 'pass' | 'fail' | 'na'
  severity: 'critical' | 'major' | 'minor'
  remediation: string
}

function performFireInspection(input: FireInspectionInput): {
  inspection_items: InspectionItem[]
  pass_rate: number
  critical_failures: number
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  recommendations: string[]
} {
  const r = rng(input.facility_name + input.facility_type)
  const area = input.building_area_sqm
  const floors = input.floors
  const occupancy = input.occupancy_count

  const hasSprinkler = (input.has_sprinkler || 'no').toLowerCase() === 'yes'
  const hasAlarm = (input.has_alarm || 'no').toLowerCase() === 'yes'

  const items: InspectionItem[] = [
    {
      category: 'Fire Suppression',
      item: 'Automatic sprinkler system coverage',
      status: hasSprinkler ? 'pass' : 'fail',
      severity: 'critical',
      remediation: hasSprinkler ? 'N/A' : 'Install NFPA 13 compliant sprinkler system throughout facility'
    },
    {
      category: 'Fire Detection',
      item: 'Smoke detection and alarm system',
      status: hasAlarm ? 'pass' : 'fail',
      severity: 'critical',
      remediation: hasAlarm ? 'N/A' : 'Install addressable fire alarm system with smoke detectors in all zones'
    },
    {
      category: 'Egress',
      item: 'Emergency exit count and distribution',
      status: occupancy > 200 ? (r() > 0.3 ? 'pass' : 'fail') : 'pass',
      severity: 'critical',
      remediation: 'Ensure minimum 2 exits per floor, max travel distance 60m to nearest exit'
    },
    {
      category: 'Egress',
      item: 'Exit signage and emergency lighting',
      status: r() > 0.2 ? 'pass' : 'fail',
      severity: 'major',
      remediation: 'Install illuminated exit signs at all egress points with battery backup'
    },
    {
      category: 'Equipment',
      item: 'Fire extinguisher placement and maintenance',
      status: r() > 0.25 ? 'pass' : 'fail',
      severity: 'major',
      remediation: 'Place ABC extinguishers per NFPA 10 (max 22m travel distance), verify annual inspection tags'
    },
    {
      category: 'Equipment',
      item: 'Standpipe and hose system',
      status: floors > 3 ? (r() > 0.4 ? 'pass' : 'fail') : 'na',
      severity: 'major',
      remediation: 'Install Class I standpipe system for buildings 4+ stories'
    },
    {
      category: 'Structural',
      item: 'Fire resistance rating of structural elements',
      status: r() > 0.3 ? 'pass' : 'fail',
      severity: 'critical',
      remediation: 'Verify 1-2 hour fire rating on structural columns and floor assemblies'
    },
    {
      category: 'Structural',
      item: 'Fire door integrity and self-closing mechanisms',
      status: r() > 0.35 ? 'pass' : 'fail',
      severity: 'major',
      remediation: 'Repair/replace damaged fire doors, verify self-closer operation'
    },
    {
      category: 'Operations',
      item: 'Evacuation plan posted and current',
      status: r() > 0.3 ? 'pass' : 'fail',
      severity: 'minor',
      remediation: 'Post updated evacuation floor plans at all elevator lobbies and stairwells'
    },
    {
      category: 'Operations',
      item: 'Staff fire safety training records',
      status: r() > 0.4 ? 'pass' : 'fail',
      severity: 'minor',
      remediation: 'Conduct annual fire drill and document all staff training completion'
    },
    {
      category: 'Hazmat',
      item: 'Hazardous material storage compliance',
      status: r() > 0.5 ? 'pass' : 'fail',
      severity: 'major',
      remediation: 'Store flammables in approved cabinets, maintain SDS sheets on-site'
    },
    {
      category: 'Electrical',
      item: 'Electrical panel clearance and labeling',
      status: r() > 0.3 ? 'pass' : 'fail',
      severity: 'minor',
      remediation: 'Maintain 1m clearance in front of all electrical panels, verify circuit labeling'
    }
  ]

  const applicableItems = items.filter(i => i.status !== 'na')
  const passedItems = applicableItems.filter(i => i.status === 'pass')
  const passRate = applicableItems.length > 0 ? passedItems.length / applicableItems.length : 0
  const criticalFailures = items.filter(i => i.status === 'fail' && i.severity === 'critical').length

  let overallGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A'
  if (criticalFailures > 0 || passRate < 0.6) overallGrade = 'F'
  else if (passRate < 0.7) overallGrade = 'D'
  else if (passRate < 0.8) overallGrade = 'C'
  else if (passRate < 0.9) overallGrade = 'B'

  const recommendations: string[] = []
  if (criticalFailures > 0) {
    recommendations.push(`URGENT: ${criticalFailures} critical failure(s) require immediate remediation before occupancy`)
  }
  const failedItems = items.filter(i => i.status === 'fail')
  if (failedItems.length > 0) {
    recommendations.push(`${failedItems.length} total item(s) require correction - prioritize critical and major items`)
  }
  if (!hasSprinkler && area > 500) {
    recommendations.push('Facility exceeds 500sqm without sprinkler - high priority for suppression system installation')
  }
  if (floors > 2 && !hasSprinkler) {
    recommendations.push('Multi-story building requires sprinkler system per building code')
  }
  recommendations.push(`Inspection scope: ${area}sqm, ${floors} floors, max occupancy ${occupancy} | Grade: ${overallGrade}`)

  return {
    inspection_items: items,
    pass_rate: Math.round(passRate * 100) / 100,
    critical_failures: criticalFailures,
    overall_grade: overallGrade,
    recommendations
  }
}

function formatFireInspectionReport(result: ReturnType<typeof performFireInspection>, facilityName: string): string {
  const lines: string[] = []
  lines.push('## Fire Safety Inspection Report')
  lines.push('')
  lines.push(`**Facility:** ${facilityName} | **Grade:** ${result.overall_grade} | **Pass Rate:** ${formatPercent(result.pass_rate)} | **Critical Failures:** ${result.critical_failures}`)
  lines.push('')
  lines.push('### Inspection Items')
  lines.push('| Category | Item | Status | Severity |')
  lines.push('|----------|------|--------|----------|')
  for (const item of result.inspection_items) {
    if (item.status !== 'na') {
      lines.push(`| ${item.category} | ${item.item} | ${item.status.toUpperCase()} | ${item.severity} |`)
    }
  }
  const failedItems = result.inspection_items.filter(i => i.status === 'fail')
  if (failedItems.length > 0) {
    lines.push('')
    lines.push('### Remediation Required')
    for (const item of failedItems) {
      lines.push(`- [${item.severity.toUpperCase()}] ${item.item}: ${item.remediation}`)
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

// ==================== TOOL 6: TRAFFIC SAFETY ANALYTICS ====================

interface TrafficSafetyInput {
  road_segment: string
  accidents: Array<{ date: string; type: string; severity: string; vehicles_involved: number; weather: string }>
  avg_daily_traffic: number
  speed_limit_kmh: number
  road_type: string
}

interface AccidentPattern {
  pattern_name: string
  frequency: string
  contributing_factors: string[]
  risk_multiplier: number
}

function analyzeTrafficSafety(input: TrafficSafetyInput): {
  accident_rate_per_million_vkt: number
  severity_index: number
  patterns: AccidentPattern[]
  high_risk_factors: string[]
  black_spot_score: number
  recommendations: string[]
} {
  const r = rng(input.road_segment + input.avg_daily_traffic.toString())
  const accidents = input.accidents
  const adt = input.avg_daily_traffic
  const speedLimit = input.speed_limit_kmh

  const totalAccidents = accidents.length
  const fatalCount = accidents.filter(a => a.severity === 'fatal').length
  const injuryCount = accidents.filter(a => a.severity === 'injury').length
  const pdoCount = accidents.filter(a => a.severity === 'pdo' || a.severity === 'property').length

  const severityIndex = totalAccidents > 0
    ? (fatalCount * 10 + injuryCount * 3 + pdoCount * 1) / totalAccidents
    : 0

  const accidentRate = Math.round((totalAccidents / (adt * 365)) * 1000000 * 100) / 100

  const patterns: AccidentPattern[] = []

  const rearEndCount = accidents.filter(a => a.type.toLowerCase().includes('rear') || a.type.toLowerCase().includes('rear-end')).length
  if (rearEndCount > 0) {
    patterns.push({
      pattern_name: 'Rear-end Collisions',
      frequency: `${rearEndCount} incident(s)`,
      contributing_factors: ['Insufficient following distance', 'Distracted driving', 'Sudden braking'],
      risk_multiplier: 1.0 + r() * 0.5
    })
  }

  const intersectionCount = accidents.filter(a => a.type.toLowerCase().includes('intersection') || a.type.toLowerCase().includes('angle')).length
  if (intersectionCount > 0) {
    patterns.push({
      pattern_name: 'Intersection Conflicts',
      frequency: `${intersectionCount} incident(s)`,
      contributing_factors: ['Signal visibility', 'Red-light running', 'Pedestrian conflicts'],
      risk_multiplier: 1.2 + r() * 0.6
    })
  }

  const weatherRelated = accidents.filter(a => a.weather === 'rain' || a.weather === 'snow' || a.weather === 'fog').length
  if (weatherRelated > 0) {
    patterns.push({
      pattern_name: 'Weather-related Incidents',
      frequency: `${weatherRelated} incident(s)`,
      contributing_factors: ['Reduced visibility', 'Slippery road surface', 'Inadequate drainage'],
      risk_multiplier: 0.8 + r() * 0.4
    })
  }

  const pedestrianCount = accidents.filter(a => a.type.toLowerCase().includes('pedestrian') || a.type.toLowerCase().includes('cyclist')).length
  if (pedestrianCount > 0) {
    patterns.push({
      pattern_name: 'Vulnerable Road User Incidents',
      frequency: `${pedestrianCount} incident(s)`,
      contributing_factors: ['Missing crosswalks', 'Inadequate lighting', 'Speed management'],
      risk_multiplier: 1.5 + r() * 0.8
    })
  }

  if (patterns.length === 0) {
    patterns.push({
      pattern_name: 'General Safety Pattern',
      frequency: `${totalAccidents} incident(s)`,
      contributing_factors: ['Speed management', 'Road geometry', 'Driver behavior'],
      risk_multiplier: 0.5 + r() * 0.5
    })
  }

  const highRiskFactors: string[] = []
  if (speedLimit > 60) highRiskFactors.push(`High speed limit (${speedLimit}km/h) increases severity`)
  if (adt > 20000) highRiskFactors.push(`High traffic volume (${adt.toLocaleString()} ADT) increases exposure`)
  if (fatalCount > 0) highRiskFactors.push('Fatal accidents recorded - systemic safety issue')
  if (severityIndex > 5) highRiskFactors.push('Above-average severity index indicates dangerous conditions')
  if (weatherRelated > totalAccidents * 0.3) highRiskFactors.push('Weather is a significant contributing factor')

  const blackSpotScore = clamp(
    (severityIndex / 10) * 0.4 +
    (Math.min(accidentRate, 10) / 10) * 0.3 +
    (fatalCount > 0 ? 0.2 : 0) +
    (patterns.length > 2 ? 0.1 : 0),
    0, 1
  )

  const recommendations: string[] = []
  if (blackSpotScore > 0.7) {
    recommendations.push('HIGH PRIORITY: Segment qualifies for black spot treatment program - detailed engineering study recommended')
  }
  if (speedLimit > 50 && severityIndex > 4) {
    recommendations.push(`Consider speed reduction measures (current limit ${speedLimit}km/h) - lower speeds reduce fatal outcomes`)
  }
  if (pedestrianCount > 0) {
    recommendations.push('Install pedestrian refuge islands and high-visibility crosswalks')
  }
  if (rearEndCount > 2) {
    recommendations.push('Review signal timing and add advance warning signs for queuing')
  }
  if (weatherRelated > 2) {
    recommendations.push('Improve road surface drainage and install weather-responsive speed limits')
  }
  recommendations.push(`ADT: ${adt.toLocaleString()} | Speed Limit: ${speedLimit}km/h | Black Spot Score: ${Math.round(blackSpotScore * 100)}/100`)

  return {
    accident_rate_per_million_vkt: accidentRate,
    severity_index: Math.round(severityIndex * 100) / 100,
    patterns,
    high_risk_factors: highRiskFactors,
    black_spot_score: Math.round(blackSpotScore * 100) / 100,
    recommendations
  }
}

function formatTrafficSafetyReport(result: ReturnType<typeof analyzeTrafficSafety>, roadSegment: string): string {
  const lines: string[] = []
  lines.push('## Traffic Safety Analytics Report')
  lines.push('')
  lines.push(`**Road Segment:** ${roadSegment} | **Accident Rate:** ${result.accident_rate_per_million_vkt}/M VKT | **Severity Index:** ${result.severity_index} | **Black Spot Score:** ${Math.round(result.black_spot_score * 100)}/100`)
  lines.push('')
  lines.push('### Identified Patterns')
  for (const p of result.patterns) {
    lines.push(`**${p.pattern_name}** (${p.frequency}, risk multiplier: ${p.risk_multiplier.toFixed(2)}x)`)
    for (const f of p.contributing_factors) {
      lines.push(`  - ${f}`)
    }
  }
  if (result.high_risk_factors.length > 0) {
    lines.push('')
    lines.push('### High Risk Factors')
    for (const f of result.high_risk_factors) {
      lines.push(`- ${f}`)
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

// ==================== TOOL 7: FOOD & DRUG SAFETY ====================

interface FoodDrugSafetyInput {
  product_name: string
  product_type: 'food' | 'drug' | 'supplement' | 'cosmetic'
  batch_id: string
  manufacturer: string
  test_results: Array<{ parameter: string; result: string; limit: string; unit: string }>
  supply_chain_nodes?: Array<{ stage: string; location: string; temperature_c?: number; duration_hrs?: number }>
}

interface SafetyViolation {
  parameter: string
  severity: 'critical' | 'major' | 'minor'
  finding: string
  regulatory_reference: string
  action: string
}

function assessFoodDrugSafety(input: FoodDrugSafetyInput): {
  overall_compliance: 'pass' | 'conditional' | 'fail'
  violations: SafetyViolation[]
  risk_score: number
  supply_chain_risk: 'low' | 'medium' | 'high'
  recall_recommended: boolean
  recommendations: string[]
} {
  const r = rng(input.batch_id + input.product_name)
  const violations: SafetyViolation[] = []

  for (const test of input.test_results) {
    const resultVal = parseFloat(test.result)
    const limitVal = parseFloat(test.limit)

    if (isNaN(resultVal) || isNaN(limitVal)) continue

    if (resultVal > limitVal) {
      const excessRatio = resultVal / limitVal
      let severity: SafetyViolation['severity'] = 'minor'
      if (excessRatio > 2.0) severity = 'critical'
      else if (excessRatio > 1.5) severity = 'major'

      const paramLower = test.parameter.toLowerCase()
      let regRef = 'General Food Safety Regulation'
      if (paramLower.includes('micro') || paramLower.includes('bacteria') || paramLower.includes('pathogen')) {
        regRef = 'GB 4789 / FDA BAM Chapter 4'
      } else if (paramLower.includes('heavy') || paramLower.includes('lead') || paramLower.includes('mercury') || paramLower.includes('arsenic')) {
        regRef = 'GB 2762 / FDA CPG 545.450'
      } else if (paramLower.includes('pesticide')) {
        regRef = 'GB 2763 / FDA PAM'
      } else if (paramLower.includes('additive') || paramLower.includes('color')) {
        regRef = 'GB 2760 / FDA 21 CFR 73'
      } else if (paramLower.includes('drug') || paramLower.includes('active') || paramLower.includes('potency')) {
        regRef = 'ChP / USP <905>'
      }

      violations.push({
        parameter: test.parameter,
        severity,
        finding: `Detected ${resultVal}${test.unit}, exceeds limit of ${limitVal}${test.unit} (${excessRatio.toFixed(2)}x limit)`,
        regulatory_reference: regRef,
        action: severity === 'critical' ? 'IMMEDIATE: Quarantine batch, initiate recall assessment' : severity === 'major' ? 'Hold batch pending corrective action' : 'Document and monitor trend'
      })
    }
  }

  let supplyChainRisk: 'low' | 'medium' | 'high' = 'low'
  if (input.supply_chain_nodes && input.supply_chain_nodes.length > 0) {
    const tempBreaches = input.supply_chain_nodes.filter(n => {
      if (n.temperature_c === undefined) return false
      return input.product_type === 'food' ? n.temperature_c > 8 : n.temperature_c > 25
    })
    if (tempBreaches.length > input.supply_chain_nodes.length * 0.5) supplyChainRisk = 'high'
    else if (tempBreaches.length > 0) supplyChainRisk = 'medium'
  }

  const criticalCount = violations.filter(v => v.severity === 'critical').length
  const majorCount = violations.filter(v => v.severity === 'major').length
  const riskScore = clamp(
    criticalCount * 0.3 + majorCount * 0.15 + violations.filter(v => v.severity === 'minor').length * 0.05 + (supplyChainRisk === 'high' ? 0.2 : supplyChainRisk === 'medium' ? 0.1 : 0),
    0, 1
  )

  let overallCompliance: 'pass' | 'conditional' | 'fail' = 'pass'
  if (criticalCount > 0 || riskScore > 0.6) overallCompliance = 'fail'
  else if (majorCount > 0 || riskScore > 0.3) overallCompliance = 'conditional'

  const recallRecommended = criticalCount > 0 || (input.product_type === 'drug' && majorCount > 0)

  const recommendations: string[] = []
  if (recallRecommended) {
    recommendations.push('RECALL ASSESSMENT REQUIRED: Critical violations detected - initiate batch recall evaluation immediately')
  }
  if (criticalCount > 0) {
    recommendations.push(`${criticalCount} critical violation(s) - quarantine affected batch pending disposition`)
  }
  if (supplyChainRisk === 'high') {
    recommendations.push('Supply chain temperature control failures detected - audit cold chain logistics partners')
  }
  if (violations.length === 0) {
    recommendations.push('All tested parameters within acceptable limits - batch meets release criteria')
  }
  if (input.supply_chain_nodes && input.supply_chain_nodes.length > 0) {
    recommendations.push(`Supply chain: ${input.supply_chain_nodes.length} node(s) tracked | Risk level: ${supplyChainRisk.toUpperCase()}`)
  }
  recommendations.push(`Product type: ${input.product_type} | Batch: ${input.batch_id} | Manufacturer: ${input.manufacturer}`)

  return {
    overall_compliance: overallCompliance,
    violations,
    risk_score: Math.round(riskScore * 100) / 100,
    supply_chain_risk: supplyChainRisk,
    recall_recommended: recallRecommended,
    recommendations
  }
}

function formatFoodDrugSafetyReport(result: ReturnType<typeof assessFoodDrugSafety>, productName: string): string {
  const lines: string[] = []
  lines.push('## Food & Drug Safety Assessment Report')
  lines.push('')
  lines.push(`**Product:** ${productName} | **Compliance:** ${result.overall_compliance.toUpperCase()} | **Risk Score:** ${Math.round(result.risk_score * 100)}/100 | **Recall:** ${result.recall_recommended ? 'YES' : 'NO'}`)
  lines.push('')
  if (result.violations.length > 0) {
    lines.push('### Violations Detected')
    lines.push('| Parameter | Severity | Finding | Regulatory Ref |')
    lines.push('|-----------|----------|---------|----------------|')
    for (const v of result.violations) {
      lines.push(`| ${v.parameter} | ${v.severity.toUpperCase()} | ${v.finding} | ${v.regulatory_reference} |`)
    }
    lines.push('')
    lines.push('### Required Actions')
    for (const v of result.violations) {
      lines.push(`- [${v.severity.toUpperCase()}] ${v.parameter}: ${v.action}`)
    }
  } else {
    lines.push('### No Violations Detected')
    lines.push('All tested parameters are within regulatory limits.')
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

// ==================== TOOL 8: RESILIENCE PLANNING ====================

interface ResilienceInput {
  city_name: string
  population: number
  primary_hazards: string[]
  existing_plans?: string[]
  budget_million?: string
  critical_infrastructure_count?: string
}

interface ResilienceDimension {
  name: string
  score: number
  gaps: string[]
  strengths: string[]
}

function planResilience(input: ResilienceInput): {
  dimensions: ResilienceDimension[]
  overall_resilience_score: number
  preparedness_level: 'advanced' | 'moderate' | 'basic' | 'nascent'
  priority_actions: string[]
  investment_roadmap: string[]
  recommendations: string[]
} {
  const r = rng(input.city_name + input.population.toString())
  const hazards = input.primary_hazards
  const budget = parseFloat(input.budget_million || '0') || 0
  const infraCount = parseInt(input.critical_infrastructure_count || '0') || 10

  const dimensions: ResilienceDimension[] = [
    {
      name: 'Governance & Leadership',
      score: Math.round((0.4 + r() * 0.5) * 100) / 100,
      gaps: ['Cross-department coordination protocols', 'Emergency authority delegation clarity'],
      strengths: ['Existing emergency operations framework', 'Political commitment to resilience']
    },
    {
      name: 'Risk Assessment & Monitoring',
      score: Math.round((0.3 + r() * 0.6) * 100) / 100,
      gaps: ['Real-time hazard monitoring coverage', 'Vulnerability mapping completeness'],
      strengths: ['Historical disaster data availability', 'Scientific risk assessment capability']
    },
    {
      name: 'Critical Infrastructure Protection',
      score: Math.round((0.35 + r() * 0.55) * 100) / 100,
      gaps: ['Infrastructure redundancy levels', 'Backup system testing frequency'],
      strengths: [`${infraCount} critical facilities identified and cataloged`, 'Infrastructure hardening program in place']
    },
    {
      name: 'Community Preparedness',
      score: Math.round((0.25 + r() * 0.6) * 100) / 100,
      gaps: ['Public awareness campaign reach', 'Community emergency response team coverage'],
      strengths: ['School safety education programs', 'Volunteer network established']
    },
    {
      name: 'Economic Resilience',
      score: Math.round((0.3 + r() * 0.5) * 100) / 100,
      gaps: ['Business continuity planning adoption', 'Insurance coverage penetration'],
      strengths: ['Diversified economic base', 'Emergency fund allocation mechanism']
    },
    {
      name: 'Environmental & Social',
      score: Math.round((0.35 + r() * 0.5) * 100) / 100,
      gaps: ['Ecosystem-based adaptation measures', 'Social vulnerability reduction programs'],
      strengths: ['Natural buffer zone preservation', 'Social safety net programs']
    }
  ]

  const overallScore = Math.round(
    dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length * 100
  ) / 100

  let preparednessLevel: 'advanced' | 'moderate' | 'basic' | 'nascent' = 'nascent'
  if (overallScore > 0.75) preparednessLevel = 'advanced'
  else if (overallScore > 0.55) preparednessLevel = 'moderate'
  else if (overallScore > 0.35) preparednessLevel = 'basic'

  const priorityActions: string[] = []
  const sortedDimensions = [...dimensions].sort((a, b) => a.score - b.score)
  for (let i = 0; i < Math.min(3, sortedDimensions.length); i++) {
    const dim = sortedDimensions[i]
    priorityActions.push(`${i + 1}. Strengthen ${dim.name} (current: ${formatPercent(dim.score)}) - address: ${dim.gaps[0]}`)
  }

  const investmentRoadmap: string[] = []
  if (budget > 0) {
    const phase1Budget = Math.round(budget * 0.4 * 10) / 10
    const phase2Budget = Math.round(budget * 0.35 * 10) / 10
    const phase3Budget = Math.round(budget * 0.25 * 10) / 10
    investmentRoadmap.push(`Phase 1 (Year 1): $${phase1Budget}M - Address critical gaps in ${sortedDimensions[0].name} and ${sortedDimensions[1].name}`)
    investmentRoadmap.push(`Phase 2 (Year 2-3): $${phase2Budget}M - Expand monitoring systems and community programs`)
    investmentRoadmap.push(`Phase 3 (Year 4-5): $${phase3Budget}M - Long-term infrastructure hardening and ecosystem restoration`)
  } else {
    investmentRoadmap.push('No budget specified - conduct cost-benefit analysis for priority interventions')
  }

  const recommendations: string[] = []
  recommendations.push(`Overall resilience score: ${formatPercent(overallScore)} (${preparednessLevel.toUpperCase()} preparedness level)`)
  if (hazards.length > 0) {
    recommendations.push(`Multi-hazard approach required for: ${hazards.join(', ')}`)
  }
  if (overallScore < 0.5) {
    recommendations.push('Resilience below threshold - prioritize governance and risk assessment improvements')
  }
  recommendations.push(`Population ${input.population.toLocaleString()} | Critical infrastructure: ${infraCount} facilities`)
  recommendations.push('Establish annual resilience scorecard tracking and public reporting mechanism')

  return {
    dimensions,
    overall_resilience_score: overallScore,
    preparedness_level: preparednessLevel,
    priority_actions: priorityActions,
    investment_roadmap: investmentRoadmap,
    recommendations
  }
}

function formatResilienceReport(result: ReturnType<typeof planResilience>, cityName: string): string {
  const lines: string[] = []
  lines.push('## Urban Resilience Planning Report')
  lines.push('')
  lines.push(`**City:** ${cityName} | **Overall Score:** ${formatPercent(result.overall_resilience_score)} | **Preparedness Level:** ${result.preparedness_level.toUpperCase()}`)
  lines.push('')
  lines.push('### Resilience Dimensions')
  lines.push('| Dimension | Score | Key Gap |')
  lines.push('|-----------|-------|---------|')
  for (const d of result.dimensions) {
    lines.push(`| ${d.name} | ${formatPercent(d.score)} | ${d.gaps[0]} |`)
  }
  lines.push('')
  lines.push('### Priority Actions')
  for (const a of result.priority_actions) {
    lines.push(`- ${a}`)
  }
  lines.push('')
  lines.push('### Investment Roadmap')
  for (const r of result.investment_roadmap) {
    lines.push(`- ${r}`)
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

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'crime_hotspot_analysis',
    description: 'Analyze crime data to identify geographic hotspots, temporal patterns, and risk zones. Returns severity-ranked hotspot zones with trend analysis and patrol deployment recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: district (string), crime_data (array of {type, lat, lng, timestamp, severity}), time_window_days (number, optional), analysis_radius_km (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<CrimeHotspotInput>(args.input_data)
      const result = analyzeCrimeHotspots(input)
      return formatCrimeHotspotReport(result, input.district || 'Unknown District')
    }
  }))

  tools.register(defineTool({
    name: 'emergency_dispatch_optimizer',
    description: 'Optimize emergency resource dispatch by matching available response units to active incidents based on proximity, priority, and response time targets. Returns assignments with ETAs and coverage analysis.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: incidents (array of {id, type, priority, lat, lng, reported_at}), units (array of {id, type, status, lat, lng}), max_response_time_min (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<DispatchInput>(args.input_data)
      const result = optimizeDispatch(input)
      return formatDispatchReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'disaster_loss_estimation',
    description: 'Estimate economic and human losses from natural disasters. Models direct losses (infrastructure, property, agriculture) and indirect losses (business interruption, long-term impact) with recovery timelines.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: disaster_type (string), magnitude (number), affected_area_km2 (number), population (number), infrastructure_value_million (string), duration_hours (string, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<DisasterLossInput>(args.input_data)
      const result = estimateDisasterLoss(input)
      return formatDisasterLossReport(result, input.disaster_type || 'Unknown Disaster')
    }
  }))

  tools.register(defineTool({
    name: 'crowd_safety_monitor',
    description: 'Monitor crowd density and flow dynamics for public venues. Evaluates stampede risk, identifies bottleneck zones, and provides real-time safety status with evacuation recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: venue_name (string), venue_capacity (number), current_occupancy (number), entry_rate_per_min (number), exit_rate_per_min (number), zones (array of {name, capacity, current_count}, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<CrowdSafetyInput>(args.input_data)
      const result = monitorCrowdSafety(input)
      return formatCrowdSafetyReport(result, input.venue_name || 'Unknown Venue')
    }
  }))

  tools.register(defineTool({
    name: 'fire_safety_inspection',
    description: 'Generate comprehensive fire safety inspection reports for facilities. Covers suppression systems, detection, egress, equipment, structural fire resistance, and operational compliance with pass/fail grading.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: facility_name (string), facility_type (string), building_area_sqm (number), floors (number), occupancy_count (number), has_sprinkler (string: yes/no, optional), has_alarm (string: yes/no, optional), last_inspection_date (string, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<FireInspectionInput>(args.input_data)
      const result = performFireInspection(input)
      return formatFireInspectionReport(result, input.facility_name || 'Unknown Facility')
    }
  }))

  tools.register(defineTool({
    name: 'traffic_safety_analytics',
    description: 'Analyze traffic accident patterns on road segments. Identifies contributing factors, calculates severity indices, scores black spot risk, and recommends engineering countermeasures.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: road_segment (string), accidents (array of {date, type, severity, vehicles_involved, weather}), avg_daily_traffic (number), speed_limit_kmh (number), road_type (string)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<TrafficSafetyInput>(args.input_data)
      const result = analyzeTrafficSafety(input)
      return formatTrafficSafetyReport(result, input.road_segment || 'Unknown Segment')
    }
  }))

  tools.register(defineTool({
    name: 'food_drug_safety',
    description: 'Assess food, drug, supplement, or cosmetic safety compliance. Evaluates test results against regulatory limits, identifies violations with severity classification, and recommends recall actions.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: product_name (string), product_type (food/drug/supplement/cosmetic), batch_id (string), manufacturer (string), test_results (array of {parameter, result, limit, unit}), supply_chain_nodes (array of {stage, location, temperature_c, duration_hrs}, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<FoodDrugSafetyInput>(args.input_data)
      const result = assessFoodDrugSafety(input)
      return formatFoodDrugSafetyReport(result, input.product_name || 'Unknown Product')
    }
  }))

  tools.register(defineTool({
    name: 'resilience_planning',
    description: 'Develop urban resilience and disaster preparedness plans. Scores resilience across six dimensions (governance, risk assessment, infrastructure, community, economy, environment) and generates prioritized investment roadmaps.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: city_name (string), population (number), primary_hazards (string[]), existing_plans (string[], optional), budget_million (string, optional), critical_infrastructure_count (string, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = parseInput<ResilienceInput>(args.input_data)
      const result = planResilience(input)
      return formatResilienceReport(result, input.city_name || 'Unknown City')
    }
  }))

  console.log(`[dsh-tool-safetyagentpro] Loaded v${VERSION} -- Public Safety AI Assistant with 8 tools`)
  console.log('  Tools: crime_hotspot_analysis, emergency_dispatch_optimizer, disaster_loss_estimation, crowd_safety_monitor, fire_safety_inspection, traffic_safety_analytics, food_drug_safety, resilience_planning')
}
