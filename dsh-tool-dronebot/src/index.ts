import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// =====================================================================
// DSH Drone Fleet Management & Autonomy - dsh-tool-dronebot v0.1.0
// 8 tools: fleet ops, airspace, BVLOS, autonomous mission, payload,
//          battery swap, weather risk, remote ID
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

function pickFromList<T>(rng: () => number, list: T[]): T {
  return list[Math.floor(rng() * list.length)]
}

function round(n: number, d = 2): number {
  const f = 10 ** d
  return Math.round(n * f) / f
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function kmToMi(km: number): number {
  return round(km * 0.621371, 2)
}

function kgToLb(kg: number): number {
  return round(kg * 2.20462, 2)
}

export interface DroneSpec {
  maxSpeedKmh: number
  maxAltitudeM: number
  maxPayloadKg: number
  batteryWh: number
  rangeKm: number
  cruiseSpeedKmh: number
  noiseDb: number
  weightKg: number
  maxFlightMin: number
}

const DRONE_MODELS: Record<string, DroneSpec> = {
  DJI_M30: { maxSpeedKmh: 75.6, maxAltitudeM: 7000, maxPayloadKg: 2.9, batteryWh: 5880, rangeKm: 32, cruiseSpeedKmh: 54, noiseDb: 68, weightKg: 6.6, maxFlightMin: 41 },
  Matrice_350: { maxSpeedKmh: 76, maxAltitudeM: 7000, maxPayloadKg: 2.7, batteryWh: 5880, rangeKm: 35, cruiseSpeedKmh: 54, noiseDb: 70, weightKg: 9.2, maxFlightMin: 55 },
  Wingcopter_198: { maxSpeedKmh: 130, maxAltitudeM: 4000, maxPayloadKg: 6.0, batteryWh: 18000, rangeKm: 75, cruiseSpeedKmh: 90, noiseDb: 62, weightKg: 12.0, maxFlightMin: 60 },
  Zipline_Zip: { maxSpeedKmh: 100, maxAltitudeM: 3000, maxPayloadKg: 1.8, batteryWh: 4000, rangeKm: 80, cruiseSpeedKmh: 72, noiseDb: 58, weightKg: 11.0, maxFlightMin: 45 },
  Alta_X: { maxSpeedKmh: 145, maxAltitudeM: 4500, maxPayloadKg: 130, batteryWh: 50000, rangeKm: 450, cruiseSpeedKmh: 100, noiseDb: 72, weightKg: 230, maxFlightMin: 120 },
  Volocopter_VoloDrone: { maxSpeedKmh: 110, maxAltitudeM: 2500, maxPayloadKg: 200, batteryWh: 100000, rangeKm: 40, cruiseSpeedKmh: 80, noiseDb: 65, weightKg: 600, maxFlightMin: 30 },
  Skyports_Lifter: { maxSpeedKmh: 72, maxAltitudeM: 120, maxPayloadKg: 4.0, batteryWh: 3000, rangeKm: 12, cruiseSpeedKmh: 50, noiseDb: 60, weightKg: 18, maxFlightMin: 22 },
  Freefly_AltoX: { maxSpeedKmh: 75, maxAltitudeM: 4000, maxPayloadKg: 9.1, batteryWh: 6000, rangeKm: 20, cruiseSpeedKmh: 54, noiseDb: 66, weightKg: 20, maxFlightMin: 35 },
}

// =====================================================================
// TOOL 1: fleet_operations_planner
// =====================================================================

export interface FleetOpsInput {
  fleet_size: number
  drone_model: string
  operating_hours_start?: string
  operating_hours_end?: string
  missions?: Array<{
    id: string
    type: 'delivery' | 'survey' | 'inspection' | 'mapping' | 'patrol' | 'emergency'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    estimated_duration_min: number
    distance_km?: number
    payload_kg?: number
    location?: string
  }>
  shift_overlap_min?: number
  seed_date?: string
}

export interface DroneStatus {
  drone_id: string
  model: string
  status: 'available' | 'on_mission' | 'charging' | 'maintenance' | 'standby'
  battery_soc_percent: number
  flight_hours_total: number
  missions_completed: number
  next_maintenance_due_hours: number
  assigned_mission?: string
}

export interface ShiftPlan {
  shift_id: string
  start_time: string
  end_time: string
  active_drones: number
  standby_drones: number
  maintenance_drones: number
  missions_planned: number
}

export interface FleetOpsResult {
  fleet_size: number
  drone_model: string
  operating_window: string
  total_missions: number
  missions_assigned: number
  missions_deferred: number
  drone_statuses: DroneStatus[]
  shift_plans: ShiftPlan[]
  fleet_utilization_percent: number
  total_estimated_flight_hours: number
  total_estimated_distance_km: number
  maintenance_schedule: string[]
  coordination_notes: string[]
  recommendations: string[]
  overall_readiness: 'FULLY_OPERATIONAL' | 'PARTIALLY_OPERATIONAL' | 'LIMITED' | 'NON_OPERATIONAL'
}

function planFleetOperations(input: FleetOpsInput): FleetOpsResult {
  const rng = seededRng(JSON.stringify(input))
  const fleetSize = input.fleet_size
  const missions = input.missions || []
  const overlap = input.shift_overlap_min || 15
  const opStart = input.operating_hours_start || '06:00'
  const opEnd = input.operating_hours_end || '22:00'
  const [startH, startM] = opStart.split(':').map(Number)
  const [endH, endM] = opEnd.split(':').map(Number)
  const totalOperatingMin = (endH * 60 + endM) - (startH * 60 + startM)

  const droneStatuses: DroneStatus[] = []
  for (let i = 0; i < fleetSize; i++) {
    const sr = rng()
    const status: DroneStatus['status'] = sr < 0.5 ? 'available' : sr < 0.7 ? 'on_mission' : sr < 0.85 ? 'charging' : sr < 0.95 ? 'maintenance' : 'standby'
    const batterySoc = status === 'charging' ? round(40 + rng() * 60, 1) : status === 'available' ? round(70 + rng() * 30, 1) : round(20 + rng() * 50, 1)
    droneStatuses.push({
      drone_id: 'UAV-' + String(i + 1).padStart(3, '0'),
      model: input.drone_model,
      status,
      battery_soc_percent: batterySoc,
      flight_hours_total: round(rng() * 500, 1),
      missions_completed: Math.floor(rng() * 200),
      next_maintenance_due_hours: round(25 + rng() * 25, 1),
    })
  }

  const availableDrones = droneStatuses.filter(d => d.status === 'available' || d.status === 'standby')
  const sortedMissions = [...missions].sort((a, b) => {
    const pm: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return (pm[a.priority || 'medium'] || 2) - (pm[b.priority || 'medium'] || 2)
  })

  let mi = 0
  let totalDist = 0
  let totalFlightHrs = 0
  for (const d of availableDrones) {
    if (mi >= sortedMissions.length) break
    d.assigned_mission = sortedMissions[mi].id
    d.status = 'on_mission'
    totalDist += sortedMissions[mi].distance_km || 0
    totalFlightHrs += sortedMissions[mi].estimated_duration_min / 60
    mi++
  }

  const missionsAssigned = mi
  const missionsDeferred = sortedMissions.length - missionsAssigned

  const shiftPlans: ShiftPlan[] = []
  const numShifts = Math.max(1, Math.floor(totalOperatingMin / 480))
  const shiftDuration = Math.floor(totalOperatingMin / numShifts)
  let curMin = startH * 60 + startM
  for (let s = 0; s < numShifts; s++) {
    const sStart = curMin
    const sEnd = Math.min(sStart + shiftDuration, endH * 60 + endM)
    const sS = String(Math.floor(sStart / 60)).padStart(2, '0') + ':' + String(sStart % 60).padStart(2, '0')
    const sE = String(Math.floor(sEnd / 60)).padStart(2, '0') + ':' + String(sEnd % 60).padStart(2, '0')
    const activeCount = Math.max(1, Math.floor(fleetSize * (0.5 + rng() * 0.3)))
    const maintCount = Math.floor(fleetSize * rng() * 0.15)
    shiftPlans.push({
      shift_id: 'SHIFT-' + String(s + 1).padStart(2, '0'),
      start_time: sS,
      end_time: sE,
      active_drones: activeCount,
      standby_drones: Math.max(0, fleetSize - activeCount - maintCount),
      maintenance_drones: maintCount,
      missions_planned: Math.min(activeCount, Math.max(0, sortedMissions.length - s * activeCount)),
    })
    curMin = sEnd - overlap
  }

  const utilization = clamp(round((missionsAssigned / Math.max(1, availableDrones.length)) * 100, 1), 0, 100)

  const maintSchedule: string[] = [
    'Daily pre-flight inspection: 30 min before first shift',
    'Battery cycle check: every 50 charge cycles',
    'Motor bearing inspection: every 100 flight hours',
    'Firmware update window: Sundays 02:00-04:00',
  ]

  const coordNotes: string[] = []
  coordNotes.push('Fleet of ' + fleetSize + 'x ' + input.drone_model + ' operating ' + opStart + '-' + opEnd)
  coordNotes.push(availableDrones.length + ' drones available for ' + sortedMissions.length + ' missions')
  if (missionsDeferred > 0) coordNotes.push(missionsDeferred + ' missions deferred due to fleet capacity limits')
  coordNotes.push('Shift overlap of ' + overlap + ' min ensures continuous coverage')

  const recommendations: string[] = []
  if (missionsDeferred > 0) recommendations.push(missionsDeferred + ' missions deferred — consider expanding fleet or extending hours')
  if (utilization > 85) recommendations.push('High fleet utilization (' + utilization + '%) — limited surge capacity')
  const lowBattCount = droneStatuses.filter(d => d.battery_soc_percent < 30).length
  if (lowBattCount > 0) recommendations.push(lowBattCount + ' drone(s) below 30% SoC — prioritize charging')
  if (recommendations.length === 0) recommendations.push('Fleet operations within normal parameters')

  const readiness: FleetOpsResult['overall_readiness'] =
    missionsDeferred > missionsAssigned ? 'LIMITED'
    : missionsDeferred > 0 ? 'PARTIALLY_OPERATIONAL'
    : 'FULLY_OPERATIONAL'

  return {
    fleet_size: fleetSize,
    drone_model: input.drone_model,
    operating_window: opStart + '-' + opEnd,
    total_missions: sortedMissions.length,
    missions_assigned: missionsAssigned,
    missions_deferred: missionsDeferred,
    drone_statuses: droneStatuses,
    shift_plans: shiftPlans,
    fleet_utilization_percent: utilization,
    total_estimated_flight_hours: round(totalFlightHrs, 2),
    total_estimated_distance_km: round(totalDist, 2),
    maintenance_schedule: maintSchedule,
    coordination_notes: coordNotes,
    recommendations,
    overall_readiness: readiness,
  }
}

function formatFleetOps(r: FleetOpsResult): string {
  const lines: string[] = []
  lines.push('# Fleet Operations Plan')
  lines.push('Fleet: ' + r.fleet_size + 'x ' + r.drone_model + ' | Window: ' + r.operating_window)
  lines.push('Readiness: **' + r.overall_readiness + '**')
  lines.push('Missions: ' + r.missions_assigned + '/' + r.total_missions + ' assigned (' + r.missions_deferred + ' deferred)')
  lines.push('Utilization: ' + r.fleet_utilization_percent + '% | Flight Hours: ' + r.total_estimated_flight_hours + 'h | Distance: ' + r.total_estimated_distance_km + 'km')
  lines.push('')
  lines.push('## Drone Statuses')
  r.drone_statuses.forEach(d => {
    lines.push('- ' + d.drone_id + ': ' + d.status + ' | SoC ' + d.battery_soc_percent + '% | ' + d.flight_hours_total + 'h | ' + d.missions_completed + ' missions' + (d.assigned_mission ? ' | Assigned: ' + d.assigned_mission : ''))
  })
  lines.push('')
  lines.push('## Shift Plans')
  r.shift_plans.forEach(s => {
    lines.push('- ' + s.shift_id + ' (' + s.start_time + '-' + s.end_time + '): ' + s.active_drones + ' active, ' + s.standby_drones + ' standby, ' + s.maintenance_drones + ' maint | ' + s.missions_planned + ' missions')
  })
  lines.push('')
  lines.push('## Maintenance Schedule')
  r.maintenance_schedule.forEach(m => lines.push('- ' + m))
  lines.push('')
  lines.push('## Coordination Notes')
  r.coordination_notes.forEach(n => lines.push('- ' + n))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 2: airspace_management_system
// =====================================================================

export interface AirspaceInput {
  operation_area: { center_lat: number; center_lng: number; radius_km: number }
  altitude_m?: number
  flight_type?: 'VLOS' | 'BVLOS' | 'autonomous'
  airspace_class_request?: 'B' | 'C' | 'D' | 'E' | 'G'
  geofence_enabled?: boolean
  nearby_structures?: Array<{ name: string; type: string; distance_km: number; height_m: number }>
  utm_provider?: string
  dynamic_restrictions?: Array<{ name: string; type: string; active: boolean; radius_km: number }>
  seed_date?: string
}

export interface GeofenceZone {
  zone_id: string
  name: string
  type: 'inclusion' | 'exclusion' | 'warning'
  boundary_km: number
  max_altitude_m: number
  action: string
}

export interface AirspaceResult {
  operation_area: AirspaceInput['operation_area']
  airspace_class: string
  altitude_authorized_m: number
  altitude_compliant: boolean
  flight_type: string
  geofence_zones: GeofenceZone[]
  utm_coordination: { provider: string; status: string; corridor_id: string; deconfliction: string }
  structure_conflicts: Array<{ name: string; conflict: string; mitigation: string }>
  dynamic_restrictions_active: number
  compliance_status: 'AUTHORIZED' | 'CONDITIONAL' | 'DENIED' | 'PENDING'
  authorization_scope: string[]
  operational_limits: string[]
  recommendations: string[]
}

function manageAirspace(input: AirspaceInput): AirspaceResult {
  const rng = seededRng(JSON.stringify(input))
  const alt = input.altitude_m || 120
  const flightType = input.flight_type || 'VLOS'
  const airspaceClass = input.airspace_class_request || 'G'
  const maxAuthAlt = airspaceClass === 'G' ? 120 : airspaceClass === 'E' ? 400 : 200
  const altOk = alt <= maxAuthAlt

  const geofenceZones: GeofenceZone[] = [
    { zone_id: 'GF-001', name: 'Operation Perimeter', type: 'inclusion', boundary_km: input.operation_area.radius_km, max_altitude_m: maxAuthAlt, action: 'Normal operations within zone' },
    { zone_id: 'GF-002', name: 'Airport Buffer', type: 'exclusion', boundary_km: 5, max_altitude_m: 0, action: 'No-fly — auto-return on breach' },
    { zone_id: 'GF-003', name: 'Populated Area Buffer', type: 'warning', boundary_km: 1, max_altitude_m: 60, action: 'Altitude cap enforced — alert operator' },
  ]

  const utmProvider = input.utm_provider || pickFromList(rng, ['AirMap', 'Altitude Angel', 'Thales UTM', 'OneSky', 'Unifly'])
  const utmStatus = pickFromList(rng, ['CONNECTED', 'CONNECTED', 'CONNECTED', 'DEGRADED'])
  const corridorId = utmStatus === 'CONNECTED' ? 'CORR-' + String(hashStr(JSON.stringify(input)) % 10000).padStart(4, '0') : 'NONE'

  const structures = input.nearby_structures || [
    { name: 'Cell Tower A', type: 'tower', distance_km: 2.5, height_m: 80 },
    { name: 'Office Building B', type: 'building', distance_km: 1.2, height_m: 60 },
  ]
  const structConflicts = structures.map(s => {
    const conflict = s.height_m > alt && s.distance_km < 3 ? 'HEIGHT CONFLICT' : s.distance_km < 1 ? 'PROXIMITY WARNING' : 'CLEAR'
    const mitigation = conflict === 'HEIGHT CONFLICT' ? 'Increase altitude to ' + (s.height_m + 30) + 'm or maintain >3km horizontal' : conflict === 'PROXIMITY WARNING' ? 'Maintain minimum 150m horizontal separation' : 'No action needed'
    return { name: s.name, conflict, mitigation }
  })

  const dynRest = input.dynamic_restrictions || []
  const dynActive = dynRest.filter(r => r.active).length

  const compliance: AirspaceResult['compliance_status'] =
    !altOk ? 'DENIED' : dynActive > 0 ? 'CONDITIONAL' : utmStatus === 'DEGRADED' ? 'PENDING' : 'AUTHORIZED'

  const authScope: string[] = []
  authScope.push('Class ' + airspaceClass + ' airspace operations')
  authScope.push('Max altitude: ' + maxAuthAlt + 'm AGL')
  if (flightType === 'BVLOS') authScope.push('BVLOS corridor operations with DAA')
  authScope.push('Radius: ' + input.operation_area.radius_km + 'km from center')

  const opLimits: string[] = []
  opLimits.push('Max altitude: ' + maxAuthAlt + 'm AGL')
  opLimits.push('Geofence breach triggers automatic return-to-home')
  if (flightType !== 'VLOS') opLimits.push('UTM deconfliction required for all flights')
  opLimits.push('Yield right-of-way to manned aircraft')

  const recommendations: string[] = []
  if (!altOk) recommendations.push('Altitude ' + alt + 'm exceeds Class ' + airspaceClass + ' limit of ' + maxAuthAlt + 'm — reduce or request higher class')
  if (dynActive > 0) recommendations.push(dynActive + ' active dynamic restriction(s) — check NOTAMs before departure')
  if (utmStatus === 'DEGRADED') recommendations.push('UTM connection degraded — operate with enhanced visual monitoring')
  if (structConflicts.some(s => s.conflict === 'HEIGHT CONFLICT')) recommendations.push('Structure height conflicts detected — adjust altitude or route')
  if (recommendations.length === 0) recommendations.push('Airspace management plan compliant — proceed with standard operations')

  return {
    operation_area: input.operation_area,
    airspace_class: 'Class ' + airspaceClass,
    altitude_authorized_m: maxAuthAlt,
    altitude_compliant: altOk,
    flight_type: flightType,
    geofence_zones: geofenceZones,
    utm_coordination: { provider: utmProvider, status: utmStatus, corridor_id: corridorId, deconfliction: utmStatus === 'CONNECTED' ? 'Active cooperative separation' : 'Unavailable — manual deconfliction required' },
    structure_conflicts: structConflicts,
    dynamic_restrictions_active: dynActive,
    compliance_status: compliance,
    authorization_scope: authScope,
    operational_limits: opLimits,
    recommendations,
  }
}

function formatAirspace(r: AirspaceResult): string {
  const lines: string[] = []
  lines.push('# Airspace Management System Report')
  lines.push('Area: ' + r.operation_area.radius_km + 'km radius @ (' + r.operation_area.center_lat + ', ' + r.operation_area.center_lng + ')')
  lines.push('Airspace: ' + r.airspace_class + ' | Flight Type: ' + r.flight_type)
  lines.push('Compliance: **' + r.compliance_status + '**')
  lines.push('Altitude: ' + r.altitude_authorized_m + 'm authorized | Compliant: ' + (r.altitude_compliant ? 'YES' : 'NO'))
  lines.push('')
  lines.push('## Geofence Zones')
  r.geofence_zones.forEach(z => {
    lines.push('- ' + z.zone_id + ' ' + z.name + ' (' + z.type + '): ' + z.boundary_km + 'km, max ' + z.max_altitude_m + 'm — ' + z.action)
  })
  lines.push('')
  lines.push('## UTM Coordination')
  lines.push('- Provider: ' + r.utm_coordination.provider + ' | Status: ' + r.utm_coordination.status)
  lines.push('- Corridor: ' + r.utm_coordination.corridor_id)
  lines.push('- Deconfliction: ' + r.utm_coordination.deconfliction)
  lines.push('')
  lines.push('## Structure Conflicts')
  r.structure_conflicts.forEach(s => {
    lines.push('- ' + s.name + ': ' + s.conflict + ' — ' + s.mitigation)
  })
  lines.push('')
  lines.push('## Authorization Scope')
  r.authorization_scope.forEach(a => lines.push('- ' + a))
  lines.push('')
  lines.push('## Operational Limits')
  r.operational_limits.forEach(l => lines.push('- ' + l))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 3: bvlos_compliance_checker
// =====================================================================

export interface BVLOSInput {
  drone_model: string
  operation_type?: 'linear_infrastructure' | 'area_survey' | 'delivery' | 'emergency_response' | 'cargo_transport'
  distance_km?: number
  altitude_m?: number
  population_density?: 'sparsely_populated' | 'populated' | 'dense_urban'
  ground_risk_class?: 'I' | 'II' | 'III' | 'IV' | 'V'
  strategic_mitigation_level?: 'none' | 'low' | 'medium' | 'high'
  detect_and_avoid?: boolean
  c2_link_redundancy?: 'single' | 'dual' | 'triple'
  emergency_recovery?: 'parachute' | 'auto_rtl' | 'hybrid'
  saa_equipment?: string[]
  seed_date?: string
}

export interface SORAMitigation {
  mitigation_id: string
  description: string
  risk_reduction: string
  status: 'APPLIED' | 'REQUIRED' | 'OPTIONAL'
}

export interface BVLOSResult {
  drone_model: string
  operation_type: string
  bvlos_category: 'Standard' | 'Specific' | 'Certified'
  sora_sail_level: 'SAIL I' | 'SAIL II' | 'SAIL III' | 'SAIL IV' | 'SAIL V' | 'SAIL VI'
  ground_risk_class: string
  air_risk_class: string
  strategic_mitigations: SORAMitigation[]
  operational_volume: { radius_km: number; altitude_m: number; buffer_m: number }
  contingency_volume: { radius_km: number; altitude_m: number; buffer_m: number }
  required_equipment: string[]
  compliance_gaps: string[]
  authorization_path: string
  timeline_estimate_days: number
  recommendations: string[]
  overall_compliance: 'COMPLIANT' | 'COMPLIANT_WITH_MITIGATIONS' | 'NON_COMPLIANT' | 'REQUIRES_WAIVER'
}

function checkBVLOSCompliance(input: BVLOSInput): BVLOSResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(JSON.stringify(input))

  const opType = input.operation_type || 'area_survey'
  const dist = input.distance_km || 10
  const alt = input.altitude_m || 120
  const popDensity = input.population_density || 'sparsely_populated'
  const grc = input.ground_risk_class || 'III'
  const daa = input.detect_and_avoid !== false
  const c2Redundancy = input.c2_link_redundancy || 'dual'
  const emergencyRec = input.emergency_recovery || 'hybrid'

  const sailMap: Record<string, string> = { 'I': 'SAIL I', 'II': 'SAIL II', 'III': 'SAIL III', 'IV': 'SAIL IV', 'V': 'SAIL V' }
  const sailLevel = (sailMap[grc] || 'SAIL III') as BVLOSResult['sora_sail_level']

  const airRisk = dist > 50 ? 'ARC C' : dist > 10 ? 'ARC B' : 'ARC A'

  const mitigations: SORAMitigation[] = []
  mitigations.push({ mitigation_id: 'M-001', description: 'Flight termination system (' + emergencyRec + ')', risk_reduction: 'Reduces ground fatality by 90%', status: 'APPLIED' })
  mitigations.push({ mitigation_id: 'M-002', description: 'C2 link redundancy: ' + c2Redundancy, risk_reduction: 'Reduces loss of C2 by 99.9%', status: c2Redundancy !== 'single' ? 'APPLIED' : 'REQUIRED' })
  mitigations.push({ mitigation_id: 'M-003', description: 'Detect & Avoid system', risk_reduction: 'Mid-air collision risk reduction', status: daa ? 'APPLIED' : 'REQUIRED' })
  mitigations.push({ mitigation_id: 'M-004', description: 'Strategic airspace reservation', risk_reduction: 'Reduces encounter rate with manned aircraft', status: dist > 25 ? 'APPLIED' : 'OPTIONAL' })
  mitigations.push({ mitigation_id: 'M-005', description: 'Emergency geofence with auto-RTL', risk_reduction: 'Limits exposure outside operational volume', status: 'APPLIED' })

  const opVolume = { radius_km: round(dist * 1.2, 1), altitude_m: alt + 50, buffer_m: round(50 + rng() * 100, 0) }
  const conVolume = { radius_km: round(dist * 1.5, 1), altitude_m: alt + 100, buffer_m: round(100 + rng() * 200, 0) }

  const reqEquip: string[] = []
  reqEquip.push('Remote ID broadcast module (ASTM F3411)')
  reqEquip.push('GNSS receiver with RAIM')
  if (daa) reqEquip.push('Detect & Avoid sensor suite (radar/optical/ADS-B In)')
  reqEquip.push('Flight termination system (' + emergencyRec + ')')
  if (c2Redundancy !== 'single') reqEquip.push('Redundant C2 link (' + c2Redundancy + ')')
  reqEquip.push('Telemetry logging and real-time monitoring')

  const gaps: string[] = []
  if (!daa) gaps.push('DAA system required for BVLOS — not detected')
  if (c2Redundancy === 'single') gaps.push('Single C2 link insufficient for BVLOS — add redundancy')
  if (popDensity === 'dense_urban' && grc !== 'V') gaps.push('Dense urban operations require SAIL V assessment')
  if (dist > drone.rangeKm) gaps.push('Distance ' + dist + 'km exceeds drone range ' + drone.rangeKm + 'km')

  const bvlosCategory: BVLOSResult['bvlos_category'] =
    grc === 'I' || grc === 'II' ? 'Standard' : grc === 'III' || grc === 'IV' ? 'Specific' : 'Certified'

  const authPath = bvlosCategory === 'Standard' ? 'Standard BVLOS authorization (PDRA)'
    : bvlosCategory === 'Specific' ? 'Specific Operations Risk Assessment (SORA)'
    : 'Certified aircraft pathway (EASA SC-VTOL)'

  const timelineDays = bvlosCategory === 'Standard' ? round(14 + rng() * 14, 0)
    : bvlosCategory === 'Specific' ? round(60 + rng() * 90, 0)
    : round(180 + rng() * 180, 0)

  const overallCompliance: BVLOSResult['overall_compliance'] =
    gaps.length === 0 ? 'COMPLIANT' : gaps.length <= 2 ? 'COMPLIANT_WITH_MITIGATIONS' : 'REQUIRES_WAIVER'

  const recommendations: string[] = []
  if (gaps.length > 0) gaps.forEach(g => recommendations.push('GAP: ' + g))
  recommendations.push('SORA SAIL Level: ' + sailLevel + ' — ' + (sailLevel === 'SAIL I' || sailLevel === 'SAIL II' ? 'Low complexity, standard mitigations' : sailLevel === 'SAIL III' || sailLevel === 'SAIL IV' ? 'Medium complexity, enhanced mitigations required' : 'High complexity, full certification pathway'))
  recommendations.push('Authorization path: ' + authPath + ' (~' + timelineDays + ' days)')
  if (popDensity !== 'sparsely_populated') recommendations.push('Population density: ' + popDensity + ' — enhanced ground risk mitigations required')
  recommendations.push('Operational volume: ' + opVolume.radius_km + 'km radius, ' + opVolume.altitude_m + 'm altitude, ' + opVolume.buffer_m + 'm buffer')

  return {
    drone_model: input.drone_model,
    operation_type: opType,
    bvlos_category: bvlosCategory,
    sora_sail_level: sailLevel,
    ground_risk_class: 'GRC ' + grc,
    air_risk_class: airRisk,
    strategic_mitigations: mitigations,
    operational_volume: opVolume,
    contingency_volume: conVolume,
    required_equipment: reqEquip,
    compliance_gaps: gaps,
    authorization_path: authPath,
    timeline_estimate_days: timelineDays,
    recommendations,
    overall_compliance: overallCompliance,
  }
}

function formatBVLOS(r: BVLOSResult): string {
  const lines: string[] = []
  lines.push('# BVLOS Compliance & SORA Assessment Report')
  lines.push('Drone: ' + r.drone_model + ' | Operation: ' + r.operation_type)
  lines.push('BVLOS Category: ' + r.bvlos_category + ' | SAIL Level: ' + r.sora_sail_level)
  lines.push('Overall Compliance: **' + r.overall_compliance + '**')
  lines.push('Ground Risk: ' + r.ground_risk_class + ' | Air Risk: ' + r.air_risk_class)
  lines.push('Authorization: ' + r.authorization_path + ' (~' + r.timeline_estimate_days + ' days)')
  lines.push('')
  lines.push('## Strategic Mitigations')
  r.strategic_mitigations.forEach(m => {
    lines.push('- [' + m.status + '] ' + m.mitigation_id + ': ' + m.description + ' (' + m.risk_reduction + ')')
  })
  lines.push('')
  lines.push('## Operational Volume')
  lines.push('- Radius: ' + r.operational_volume.radius_km + 'km | Altitude: ' + r.operational_volume.altitude_m + 'm | Buffer: ' + r.operational_volume.buffer_m + 'm')
  lines.push('## Contingency Volume')
  lines.push('- Radius: ' + r.contingency_volume.radius_km + 'km | Altitude: ' + r.contingency_volume.altitude_m + 'm | Buffer: ' + r.contingency_volume.buffer_m + 'm')
  lines.push('')
  lines.push('## Required Equipment')
  r.required_equipment.forEach(e => lines.push('- ' + e))
  lines.push('')
  if (r.compliance_gaps.length > 0) {
    lines.push('## Compliance Gaps')
    r.compliance_gaps.forEach(g => lines.push('- ' + g))
    lines.push('')
  }
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 4: autonomous_mission_designer
// =====================================================================

export interface MissionInput {
  drone_model: string
  mission_type?: 'waypoint_survey' | 'orbit' | 'linear_patrol' | 'grid_mapping' | 'point_inspection' | 'corridor_scan'
  waypoints?: Array<{ lat: number; lng: number; altitude_m?: number; action?: string; hover_sec?: number }>
  survey_area?: { north_lat: number; south_lat: number; east_lng: number; west_lng: number }
  altitude_m?: number
  speed_kmh?: number
  overlap_percent?: number
  fail_safe_actions?: string[]
  obstacle_avoidance?: 'none' | 'reactive' | 'predictive' | 'full_3d'
  return_home_trigger?: 'low_battery' | 'mission_complete' | 'comm_loss' | 'geofence'
  seed_date?: string
}

export interface MissionWaypoint {
  index: number
  lat: number
  lng: number
  altitude_m: number
  action: string
  hover_sec: number
  speed_kmh: number
}

export interface FailSafeLogic {
  trigger: string
  condition: string
  action: string
  priority: 'critical' | 'high' | 'medium'
}

export interface MissionResult {
  mission_id: string
  drone_model: string
  mission_type: string
  total_waypoints: number
  total_distance_km: number
  estimated_duration_min: number
  waypoints: MissionWaypoint[]
  fail_safe_logics: FailSafeLogic[]
  obstacle_avoidance_mode: string
  battery_required_percent: number
  coverage_area_km2: number
  data_quality_estimate: string
  risk_assessment: string
  recommendations: string[]
}

function designAutonomousMission(input: MissionInput): MissionResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(JSON.stringify(input))

  const missionType = input.mission_type || 'waypoint_survey'
  const alt = input.altitude_m || 100
  const speed = input.speed_kmh || drone.cruiseSpeedKmh * 0.8
  const overlap = input.overlap_percent || 60
  const obsAvoid = input.obstacle_avoidance || 'predictive'

  // Generate waypoints
  const wps: MissionWaypoint[] = []
  const inputWps = input.waypoints || []
  if (inputWps.length > 0) {
    for (let i = 0; i < inputWps.length; i++) {
      wps.push({
        index: i + 1,
        lat: inputWps[i].lat,
        lng: inputWps[i].lng,
        altitude_m: inputWps[i].altitude_m || alt,
        action: inputWps[i].action || 'Waypoint',
        hover_sec: inputWps[i].hover_sec || 0,
        speed_kmh: round(speed, 1),
      })
    }
  } else {
    const numWps = Math.floor(4 + rng() * 8)
    const baseLat = 37.7749 + (rng() - 0.5) * 0.01
    const baseLng = -122.4194 + (rng() - 0.5) * 0.01
    for (let i = 0; i < numWps; i++) {
      const actions = ['Waypoint', 'Capture Image', 'Hover & Scan', 'Altitude Change', 'Sensor Reading', 'Panorama Capture']
      wps.push({
        index: i + 1,
        lat: round(baseLat + (rng() - 0.5) * 0.005, 6),
        lng: round(baseLng + (rng() - 0.5) * 0.005, 6),
        altitude_m: Math.round(alt + (rng() - 0.5) * 40),
        action: pickFromList(rng, actions),
        hover_sec: Math.floor(rng() * 10),
        speed_kmh: round(speed, 1),
      })
    }
  }

  // Calculate distance
  function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLng = (b.lng - a.lng) * Math.PI / 180
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
  }

  let totalDist = 0
  for (let i = 0; i < wps.length - 1; i++) {
    totalDist += haversine(wps[i], wps[i + 1])
  }
  totalDist = round(totalDist, 2)

  const hoverTime = wps.reduce((s, w) => s + w.hover_sec, 0) / 60
  const flightTime = round((totalDist / speed) * 60 + hoverTime, 1)

  const failSafes: FailSafeLogic[] = [
    { trigger: 'Low Battery', condition: 'SoC < 25%', action: 'Return to Home (RTL)', priority: 'critical' },
    { trigger: 'Critical Battery', condition: 'SoC < 15%', action: 'Emergency landing at nearest safe zone', priority: 'critical' },
    { trigger: 'Comm Loss', condition: 'No C2 signal > 30s', action: 'RTL via last known path', priority: 'critical' },
    { trigger: 'Geofence Breach', condition: 'Outside operational volume', action: 'Auto-RTL with altitude hold', priority: 'high' },
    { trigger: 'Obstacle Detected', condition: 'Object within 10m', action: 'Hover and replan path', priority: 'high' },
    { trigger: 'Wind Exceedance', condition: 'Wind > 40 km/h', action: 'Reduce speed or RTL', priority: 'medium' },
    { trigger: 'GPS Degradation', condition: 'HDOP > 3.0', action: 'Switch to visual navigation', priority: 'medium' },
  ]

  const batteryReq = clamp(round((totalDist / drone.rangeKm) * 100 + (flightTime / drone.maxFlightMin) * 30 + rng() * 10, 1), 10, 95)

  let coverageKm2 = 0
  if (input.survey_area) {
    const latSpan = Math.abs(input.survey_area.north_lat - input.survey_area.south_lat)
    const lngSpan = Math.abs(input.survey_area.east_lng - input.survey_area.west_lng)
    coverageKm2 = round(latSpan * 111 * lngSpan * 111 * Math.cos((input.survey_area.north_lat + input.survey_area.south_lat) / 2 * Math.PI / 180), 2)
  } else {
    coverageKm2 = round(totalDist * (alt * 0.001) * (overlap / 100), 2)
  }

  const dataQuality = overlap >= 70 ? 'HIGH — suitable for photogrammetry' : overlap >= 50 ? 'MEDIUM — suitable for visual inspection' : 'LOW — gaps in coverage expected'

  const risk = batteryReq > 80 ? 'HIGH — battery margin critical' : flightTime > drone.maxFlightMin * 0.8 ? 'MODERATE — approaching flight time limit' : 'LOW — within safe margins'

  const recommendations: string[] = []
  recommendations.push('Mission type: ' + missionType + ' with ' + wps.length + ' waypoints')
  recommendations.push('Obstacle avoidance: ' + obsAvoid + ' mode active')
  if (batteryReq > 70) recommendations.push('High battery requirement (' + batteryReq + '%) — consider battery swap or reduce waypoints')
  if (flightTime > drone.maxFlightMin * 0.8) recommendations.push('Flight time near limit — monitor SoC closely')
  recommendations.push('Fail-safe logic: ' + failSafes.length + ' triggers configured')
  recommendations.push('Estimated coverage: ' + coverageKm2 + ' km2 at ' + overlap + '% overlap')
  if (obsAvoid === 'none') recommendations.push('WARNING: No obstacle avoidance — only for controlled environments')

  return {
    mission_id: 'MSN-' + String(hashStr(JSON.stringify(input)) % 100000).padStart(5, '0'),
    drone_model: input.drone_model,
    mission_type: missionType,
    total_waypoints: wps.length,
    total_distance_km: totalDist,
    estimated_duration_min: flightTime,
    waypoints: wps,
    fail_safe_logics: failSafes,
    obstacle_avoidance_mode: obsAvoid,
    battery_required_percent: batteryReq,
    coverage_area_km2: coverageKm2,
    data_quality_estimate: dataQuality,
    risk_assessment: risk,
    recommendations,
  }
}

function formatMission(r: MissionResult): string {
  const lines: string[] = []
  lines.push('# Autonomous Mission Design Report')
  lines.push('Mission ID: ' + r.mission_id + ' | Drone: ' + r.drone_model + ' | Type: ' + r.mission_type)
  lines.push('Waypoints: ' + r.total_waypoints + ' | Distance: ' + r.total_distance_km + 'km (' + kmToMi(r.total_distance_km) + 'mi)')
  lines.push('Duration: ' + r.estimated_duration_min + 'min | Battery: ' + r.battery_required_percent + '%')
  lines.push('Coverage: ' + r.coverage_area_km2 + 'km2 | Data Quality: ' + r.data_quality_estimate)
  lines.push('Risk: ' + r.risk_assessment + ' | Obstacle Avoidance: ' + r.obstacle_avoidance_mode)
  lines.push('')
  lines.push('## Waypoints')
  r.waypoints.forEach(w => {
    lines.push('- WP' + w.index + ': (' + w.lat + ', ' + w.lng + ') @ ' + w.altitude_m + 'm | ' + w.action + ' | Hover: ' + w.hover_sec + 's | Speed: ' + w.speed_kmh + 'km/h')
  })
  lines.push('')
  lines.push('## Fail-Safe Logic')
  r.fail_safe_logics.forEach(f => {
    lines.push('- [' + f.priority.toUpperCase() + '] ' + f.trigger + ' (' + f.condition + '): ' + f.action)
  })
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 5: payload_optimization_engine
// =====================================================================

export interface PayloadInput {
  drone_model: string
  compartments?: number
  packages: Array<{
    id: string
    weight_kg: number
    length_cm: number
    width_cm: number
    height_cm: number
    fragile?: boolean
    priority?: 'low' | 'medium' | 'high' | 'critical'
    compartment_preference?: number
  }>
  wind_condition?: 'calm' | 'moderate' | 'strong'
  cg_tolerance_cm?: number
  seed_date?: string
}

export interface CompartmentLoad {
  compartment_id: number
  packages: string[]
  total_weight_kg: number
  cg_offset_x: number
  cg_y_offset: number
  volume_utilization_percent: number
}

export interface PayloadResult {
  drone_model: string
  total_packages: number
  total_weight_kg: number
  max_payload_kg: number
  payload_utilization_percent: number
  cg_x_offset: number
  cg_y_offset: number
  cg_within_tolerance: boolean
  wind_derating_percent: number
  effective_max_kg: number
  compartments: CompartmentLoad[]
  loading_sequence: string[]
  go_no_go: 'GO' | 'MARGINAL' | 'NO-GO'
  recommendations: string[]
}

function optimizePayloadEngine(input: PayloadInput): PayloadResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(JSON.stringify(input))

  const numCompartments = input.compartments || 2
  const cgTol = input.cg_tolerance_cm || 3
  const windDerate = input.wind_condition === 'strong' ? 15 : input.wind_condition === 'moderate' ? 5 : 0
  const effectiveMax = drone.maxPayloadKg * (1 - windDerate / 100)

  const packages = input.packages || []
  let totalWeight = 0
  const compartmentLoads: CompartmentLoad[] = []

  for (let c = 0; c < numCompartments; c++) {
    compartmentLoads.push({ compartment_id: c + 1, packages: [], total_weight_kg: 0, cg_offset_x: 0, cg_y_offset: 0, volume_utilization_percent: 0 })
  }

  for (const pkg of packages) {
    const targetComp = pkg.compartment_preference ? Math.min(pkg.compartment_preference, numCompartments) - 1 : Math.floor(rng() * numCompartments)
    const comp = compartmentLoads[targetComp] || compartmentLoads[0]
    comp.packages.push(pkg.id)
    comp.total_weight_kg += pkg.weight_kg
    comp.cg_offset_x += (rng() - 0.5) * 2 * pkg.weight_kg
    comp.cg_y_offset += (rng() - 0.5) * 2 * pkg.weight_kg
    totalWeight += pkg.weight_kg
  }

  for (const comp of compartmentLoads) {
    comp.total_weight_kg = round(comp.total_weight_kg, 3)
    comp.cg_offset_x = round(comp.cg_offset_x, 2)
    comp.cg_y_offset = round(comp.cg_y_offset, 2)
    comp.volume_utilization_percent = clamp(round(comp.total_weight_kg / effectiveMax * 100 * numCompartments, 1), 5, 95)
  }

  totalWeight = round(totalWeight, 3)
  const utilization = round((totalWeight / effectiveMax) * 100, 1)
  const cgX = compartmentLoads.reduce((s, c) => s + c.cg_offset_x, 0) / Math.max(totalWeight, 0.01)
  const cgY = compartmentLoads.reduce((s, c) => s + c.cg_y_offset, 0) / Math.max(totalWeight, 0.01)
  const cgOk = Math.abs(cgX) <= cgTol && Math.abs(cgY) <= cgTol

  const loadingSeq = [...packages].sort((a, b) => {
    const pm: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return (pm[a.priority || 'medium'] || 2) - (pm[b.priority || 'medium'] || 2)
  }).map(p => p.id + ' (' + p.weight_kg + 'kg, ' + (p.priority || 'medium') + ')')

  const goNoGo: PayloadResult['go_no_go'] = utilization <= 75 ? 'GO' : utilization <= 90 ? 'MARGINAL' : 'NO-GO'

  const recommendations: string[] = []
  if (!cgOk) recommendations.push('CG offset exceeds tolerance: X=' + round(cgX, 2) + 'cm, Y=' + round(cgY, 2) + 'cm (tol: ' + cgTol + 'cm) — redistribute packages')
  if (utilization > 85) recommendations.push('High payload utilization (' + utilization + '%) — reduce wind exposure')
  if (windDerate > 0) recommendations.push('Wind derating ' + windDerate + '% applied — effective max ' + round(effectiveMax, 2) + 'kg')
  const fragileCount = packages.filter(p => p.fragile).length
  if (fragileCount > 0) recommendations.push(fragileCount + ' fragile package(s) — enable vibration dampening')
  if (recommendations.length === 0) recommendations.push('Payload configuration within safe operating margins')

  return {
    drone_model: input.drone_model,
    total_packages: packages.length,
    total_weight_kg: totalWeight,
    max_payload_kg: round(effectiveMax, 2),
    payload_utilization_percent: utilization,
    cg_x_offset: round(cgX, 3),
    cg_y_offset: round(cgY, 3),
    cg_within_tolerance: cgOk,
    wind_derating_percent: windDerate,
    effective_max_kg: round(effectiveMax, 2),
    compartments: compartmentLoads,
    loading_sequence: loadingSeq,
    go_no_go: goNoGo,
    recommendations,
  }
}

function formatPayloadEngine(r: PayloadResult): string {
  const lines: string[] = []
  lines.push('# Payload Optimization Engine Report')
  lines.push('Drone: ' + r.drone_model + ' | GO/NO-GO: **' + r.go_no_go + '**')
  lines.push('Packages: ' + r.total_packages + ' | Weight: ' + r.total_weight_kg + 'kg (' + kgToLb(r.total_weight_kg) + 'lb)')
  lines.push('Max Payload: ' + r.max_payload_kg + 'kg | Utilization: ' + r.payload_utilization_percent + '%')
  lines.push('CG Offset: X=' + r.cg_x_offset + 'cm, Y=' + r.cg_y_offset + 'cm | Within Tolerance: ' + (r.cg_within_tolerance ? 'YES' : 'NO'))
  lines.push('Wind Derating: ' + r.wind_derating_percent + '%')
  lines.push('')
  lines.push('## Compartment Loads')
  r.compartments.forEach(c => {
    lines.push('- Compartment ' + c.compartment_id + ': ' + c.packages.join(', ') + ' | ' + c.total_weight_kg + 'kg | CGx=' + c.cg_offset_x + ' CGy=' + c.cg_y_offset + ' | Vol: ' + c.volume_utilization_percent + '%')
  })
  lines.push('')
  lines.push('## Loading Sequence (Priority Order)')
  r.loading_sequence.forEach((s, i) => lines.push((i + 1) + '. ' + s))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 6: battery_swap_scheduler
// =====================================================================

export interface BatterySwapInput {
  drone_model: string
  fleet_size: number
  missions_per_day?: number
  avg_flight_min?: number
  swap_stations?: Array<{ name: string; lat: number; lng: number; batteries_available: number; charge_time_min: number }>
  charge_strategy?: 'fast' | 'slow' | 'opportunistic'
  min_swap_soc_percent?: number
  target_soc_percent?: number
  seed_date?: string
}

export interface SwapEvent {
  event_id: string
  drone_id: string
  station_name: string
  arrival_soc_percent: number
  departure_soc_percent: number
  swap_duration_min: number
  time_offset_min: number
}

export interface BatterySwapResult {
  drone_model: string
  fleet_size: number
  total_swaps_per_day: number
  total_swap_time_min: number
  avg_swap_duration_min: number
  swap_events: SwapEvent[]
  station_utilization: Array<{ name: string; swaps: number; utilization_percent: number }>
  battery_inventory_required: number
  charge_cycles_per_day: number
  soc_profile: Array<{ time_offset_min: number; avg_fleet_soc_percent: number }>
  strategy: string
  recommendations: string[]
}

function scheduleBatterySwaps(input: BatterySwapInput): BatterySwapResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(JSON.stringify(input))

  const fleetSize = input.fleet_size
  const missionsPerDay = input.missions_per_day || 20
  const avgFlightMin = input.avg_flight_min || 25
  const minSwapSoc = input.min_swap_soc_percent || 30
  const targetSoc = input.target_soc_percent || 95
  const chargeStrat = input.charge_strategy || 'fast'

  const stations = input.swap_stations || [
    { name: 'Station Alpha', lat: 37.775, lng: -122.419, batteries_available: 6, charge_time_min: 45 },
    { name: 'Station Beta', lat: 37.774, lng: -122.418, batteries_available: 4, charge_time_min: 60 },
  ]

  const swapEvents: SwapEvent[] = []
  let swapIdx = 0
  for (let m = 0; m < missionsPerDay; m++) {
    const droneId = 'UAV-' + String((m % fleetSize) + 1).padStart(3, '0')
    const arrivalSoc = round(minSwapSoc + rng() * 20, 1)
    const station = pickFromList(rng, stations)
    const swapDur = round(2 + rng() * 3, 1)
    swapEvents.push({
      event_id: 'SWAP-' + String(++swapIdx).padStart(4, '0'),
      drone_id: droneId,
      station_name: station.name,
      arrival_soc_percent: arrivalSoc,
      departure_soc_percent: targetSoc,
      swap_duration_min: swapDur,
      time_offset_min: round(m * (avgFlightMin + swapDur), 0),
    })
  }

  const totalSwapTime = round(swapEvents.reduce((s, e) => s + e.swap_duration_min, 0), 1)
  const avgSwapDur = round(totalSwapTime / Math.max(swapEvents.length, 1), 1)

  const stationUtil = stations.map(st => {
    const stSwaps = swapEvents.filter(e => e.station_name === st.name).length
    return { name: st.name, swaps: stSwaps, utilization_percent: clamp(round((stSwaps / Math.max(missionsPerDay, 1)) * 100, 1), 0, 100) }
  })

  const batteryInv = Math.ceil(fleetSize * 1.5) + stations.reduce((s, st) => s + st.batteries_available, 0)
  const chargeCycles = Math.ceil(missionsPerDay * avgFlightMin / drone.maxFlightMin)

  const socProfile: Array<{ time_offset_min: number; avg_fleet_soc_percent: number }> = []
  for (let t = 0; t <= 720; t += 60) {
    const phase = (t / 60) % 4
    const soc = phase < 2 ? round(95 - phase * 25, 1) : round(45 + (phase - 2) * 25, 1)
    socProfile.push({ time_offset_min: t, avg_fleet_soc_percent: clamp(soc, 15, 100) })
  }

  const strategy = chargeStrat === 'fast' ? 'Fast charge (80% in 30min) — high throughput, reduced battery life'
    : chargeStrat === 'slow' ? 'Slow overnight charge — maximizes battery lifespan'
    : 'Opportunistic charge — charge during mission gaps'

  const recommendations: string[] = []
  recommendations.push('Battery swap strategy: ' + strategy)
  recommendations.push('Total swaps/day: ' + swapEvents.length + ' | Total swap time: ' + totalSwapTime + 'min')
  recommendations.push('Battery inventory: ' + batteryInv + ' batteries for ' + fleetSize + ' drones')
  if (stationUtil.some(s => s.utilization_percent > 80)) recommendations.push('Station utilization >80% — add capacity to avoid bottlenecks')
  recommendations.push('Charge cycles/day: ' + chargeCycles + ' — plan battery replacement every 200 cycles')
  if (chargeStrat === 'fast') recommendations.push('Fast charging reduces battery lifespan — monitor cell health monthly')

  const result: BatterySwapResult = {
    drone_model: input.drone_model,
    fleet_size: fleetSize,
    total_swaps_per_day: swapEvents.length,
    total_swap_time_min: totalSwapTime,
    avg_swap_duration_min: avgSwapDur,
    swap_events: swapEvents.slice(0, 20),
    station_utilization: stationUtil,
    battery_inventory_required: batteryInv,
    charge_cycles_per_day: chargeCycles,
    soc_profile: socProfile,
    strategy,
    recommendations,
  }
  return result
}

function formatBatterySwap(r: BatterySwapResult): string {
  const lines: string[] = []
  lines.push('# Battery Swap Scheduling Report')
  lines.push('Drone: ' + r.drone_model + ' | Fleet: ' + r.fleet_size)
  lines.push('Total Swaps/Day: ' + r.total_swaps_per_day + ' | Total Swap Time: ' + r.total_swap_time_min + 'min | Avg Duration: ' + r.avg_swap_duration_min + 'min')
  lines.push('Battery Inventory: ' + r.battery_inventory_required + ' | Charge Cycles/Day: ' + r.charge_cycles_per_day)
  lines.push('Strategy: ' + r.strategy)
  lines.push('')
  lines.push('## Station Utilization')
  r.station_utilization.forEach(s => {
    lines.push('- ' + s.name + ': ' + s.swaps + ' swaps (' + s.utilization_percent + '%)')
  })
  lines.push('')
  lines.push('## Swap Events (first 20)')
  r.swap_events.forEach(e => {
    lines.push('- ' + e.event_id + ': ' + e.drone_id + ' @ ' + e.station_name + ' | ' + e.arrival_soc_percent + '% -> ' + e.departure_soc_percent + '% | ' + e.swap_duration_min + 'min | T+' + e.time_offset_min + 'min')
  })
  lines.push('')
  lines.push('## Fleet SoC Profile')
  r.soc_profile.forEach(p => {
    lines.push('- T+' + p.time_offset_min + 'min: ' + p.avg_fleet_soc_percent + '%')
  })
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 7: weather_risk_assessor
// =====================================================================

export interface WeatherRiskInput {
  drone_model: string
  location?: string
  temperature_c?: number
  wind_speed_kmh?: number
  wind_gust_kmh?: number
  wind_direction_deg?: number
  precipitation_mm_h?: number
  visibility_km?: number
  humidity_percent?: number
  cloud_ceiling_m?: number
  wind_shear_detected?: boolean
  microburst_risk?: boolean
  icing_risk?: boolean
  thunderstorm_risk?: boolean
  turbulence_index?: number
  mission_priority?: 'routine' | 'important' | 'critical' | 'emergency'
  seed_date?: string
}

export interface WeatherRiskZone {
  parameter: string
  value: string
  risk_score: number
  threshold: string
  status: 'OK' | 'CAUTION' | 'WARNING' | 'CRITICAL'
}

export interface WeatherRiskResult {
  location: string
  drone_model: string
  go_no_go: 'GO' | 'GO_WITH_RESTRICTIONS' | 'HOLD' | 'NO-GO'
  overall_risk_score: number
  overall_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  risk_zones: WeatherRiskZone[]
  wind_shear_alert: string
  microburst_alert: string
  icing_alert: string
  thunderstorm_alert: string
  turbulence_assessment: string
  max_safe_wind_kmh: number
  max_safe_gust_kmh: number
  recommended_departure_window: string
  monitoring_requirements: string[]
  mission_adjustments: string[]
  recommendations: string[]
}

function assessWeatherRisk(input: WeatherRiskInput): WeatherRiskResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(JSON.stringify(input))

  const temp = input.temperature_c ?? 15 + rng() * 25
  const wind = input.wind_speed_kmh ?? 5 + rng() * 30
  const gust = input.wind_gust_kmh ?? wind + rng() * 15
  const precip = input.precipitation_mm_h ?? rng() * 5
  const vis = input.visibility_km ?? 2 + rng() * 15
  const humid = input.humidity_percent ?? 30 + rng() * 60
  const ceiling = input.cloud_ceiling_m ?? 200 + rng() * 1000
  const shear = input.wind_shear_detected ?? (wind > 20 && rng() > 0.6)
  const microburst = input.microburst_risk ?? (precip > 3 && rng() > 0.8)
  const icing = input.icing_risk ?? (temp < 2 && humid > 80)
  const thunderstorm = input.thunderstorm_risk ?? (precip > 5 && rng() > 0.7)
  const turbIdx = input.turbulence_index ?? rng() * 10

  const maxWind = round(drone.cruiseSpeedKmh * 0.4, 1)
  const maxGust = round(drone.cruiseSpeedKmh * 0.55, 1)

  const riskZones: WeatherRiskZone[] = []

  const tempOk = temp >= -10 && temp <= 45
  const tempScore = tempOk ? clamp(round(10 - Math.abs(temp - 22) * 0.3, 1), 1, 10) : 2
  riskZones.push({ parameter: 'Temperature', value: round(temp, 1) + 'C', risk_score: tempScore, threshold: '-10C to 45C', status: tempOk ? (tempScore > 7 ? 'OK' : 'CAUTION') : 'CRITICAL' })

  const windScore = clamp(round(10 - wind / maxWind * 8, 1), 1, 10)
  riskZones.push({ parameter: 'Wind Speed', value: round(wind, 1) + ' km/h', risk_score: windScore, threshold: '<' + maxWind + ' km/h', status: wind <= maxWind ? (windScore > 6 ? 'OK' : 'CAUTION') : wind <= maxWind * 1.2 ? 'WARNING' : 'CRITICAL' })

  const gustScore = clamp(round(10 - gust / maxGust * 8, 1), 1, 10)
  riskZones.push({ parameter: 'Wind Gusts', value: round(gust, 1) + ' km/h', risk_score: gustScore, threshold: '<' + maxGust + ' km/h', status: gust <= maxGust ? (gustScore > 6 ? 'OK' : 'CAUTION') : gust <= maxGust * 1.2 ? 'WARNING' : 'CRITICAL' })

  const visScore = clamp(round(vis / 5 * 7 + 3, 1), 2, 10)
  riskZones.push({ parameter: 'Visibility', value: round(vis, 1) + ' km', risk_score: visScore, threshold: '>5 km', status: vis >= 5 ? 'OK' : vis >= 1 ? 'CAUTION' : 'CRITICAL' })

  const precipScore = clamp(round(10 - precip * 2, 1), 1, 10)
  riskZones.push({ parameter: 'Precipitation', value: round(precip, 1) + ' mm/h', risk_score: precipScore, threshold: '<2 mm/h', status: precip < 1 ? 'OK' : precip < 3 ? 'CAUTION' : precip < 5 ? 'WARNING' : 'CRITICAL' })

  const humidScore = humid > 90 ? 3 : humid > 80 ? 5 : 8
  riskZones.push({ parameter: 'Humidity', value: round(humid, 1) + '%', risk_score: humidScore, threshold: '<85%', status: humid < 70 ? 'OK' : humid < 85 ? 'CAUTION' : 'WARNING' })

  const ceilingOk = ceiling >= 120
  riskZones.push({ parameter: 'Cloud Ceiling', value: round(ceiling, 0) + ' m', risk_score: ceilingOk ? 7 : 3, threshold: '>120 m', status: ceilingOk ? 'OK' : 'WARNING' })

  const turbScore = clamp(round(10 - turbIdx, 1), 1, 10)
  riskZones.push({ parameter: 'Turbulence', value: round(turbIdx, 1) + '/10', risk_score: turbScore, threshold: '<5/10', status: turbIdx < 3 ? 'OK' : turbIdx < 6 ? 'CAUTION' : turbIdx < 8 ? 'WARNING' : 'CRITICAL' })

  const avgScore = round(riskZones.reduce((s, z) => s + z.risk_score, 0) / riskZones.length, 2)
  const overallRisk = round(10 - avgScore, 2)
  const riskLevel: WeatherRiskResult['overall_risk_level'] = overallRisk <= 3 ? 'LOW' : overallRisk <= 5 ? 'MODERATE' : overallRisk <= 7 ? 'HIGH' : 'EXTREME'

  const priority = input.mission_priority || 'routine'
  const goNoGo: WeatherRiskResult['go_no_go'] =
    microburst || thunderstorm || overallRisk > 7 ? 'NO-GO'
    : icing && priority !== 'emergency' ? 'NO-GO'
    : overallRisk > 5 ? 'HOLD'
    : overallRisk > 3 ? 'GO_WITH_RESTRICTIONS'
    : 'GO'

  const shearAlert = shear ? 'WIND SHEAR DETECTED — altitude-specific speed variations expected. Avoid rapid altitude changes.' : 'No wind shear detected'
  const microburstAlert = microburst ? 'MICROBURST RISK — Ground all aircraft immediately. Do not launch.' : 'No microburst risk'
  const icingAlert = icing ? 'ICING CONDITIONS — Rotor ice buildup risk. Pre-heat rotors or postpone flight.' : 'No icing risk'
  const thunderAlert = thunderstorm ? 'THUNDERSTORM RISK — Lightning and severe turbulence. Ground operations.' : 'No thunderstorm activity'
  const turbAssess = turbIdx < 3 ? 'Light turbulence — normal operations' : turbIdx < 6 ? 'Moderate turbulence — reduce speed 15%' : turbIdx < 8 ? 'Severe turbulence — consider postponement' : 'Extreme turbulence — NO-GO'

  const departWindow = goNoGo === 'NO-GO' ? 'No departure — conditions unsafe'
    : goNoGo === 'HOLD' ? 'Hold for 30-min weather update'
    : 'Depart within ' + round(15 + rng() * 30, 0) + ' minutes'

  const monitoring: string[] = []
  monitoring.push('Continuous wind speed checks every 2 min during flight')
  if (shear) monitoring.push('Real-time wind shear detection — auto-abort on severe alert')
  if (thunderstorm) monitoring.push('Lightning detection network — 30km exclusion zone')
  monitoring.push('Battery temperature monitoring in extreme conditions')
  if (precip > 1) monitoring.push('Precipitation sensor — return-to-base on heavy rain')

  const adjustments: string[] = []
  if (wind > maxWind * 0.7) adjustments.push('Reduce cruise speed by ' + round((wind / maxWind) * 15, 0) + '% for wind margin')
  if (gust > maxGust * 0.7) adjustments.push('Enable gust-stabilization mode')
  if (precip > 2) adjustments.push('Seal payload bay — water ingress risk')
  if (vis < 3) adjustments.push('Activate terrain-following radar')
  if (icing) adjustments.push('Pre-heat rotors, limit flight to 15 min')
  if (turbIdx > 5) adjustments.push('Reduce speed 20% and increase altitude buffer')
  if (adjustments.length === 0) adjustments.push('Standard flight parameters — no adjustments needed')

  const recommendations: string[] = []
  recommendations.push('Overall risk: ' + riskLevel + ' (' + overallRisk + '/10)')
  if (goNoGo === 'NO-GO') recommendations.push('NO-GO: Conditions unsafe for flight — wait for improvement')
  if (goNoGo === 'HOLD') recommendations.push('HOLD: Marginal conditions — reassess in 30 minutes')
  if (goNoGo === 'GO_WITH_RESTRICTIONS') recommendations.push('GO WITH RESTRICTIONS: Implement all mission adjustments')
  if (shear) recommendations.push('Wind shear alert: Monitor altitude-specific wind speeds')
  if (microburst) recommendations.push('Microburst risk: Ground all aircraft')
  if (thunderstorm) recommendations.push('Thunderstorm: 30km exclusion zone active')
  if (recommendations.length === 0) recommendations.push('Weather within operational limits — proceed with standard monitoring')

  return {
    location: input.location || 'Undefined Site',
    drone_model: input.drone_model,
    go_no_go: goNoGo,
    overall_risk_score: overallRisk,
    overall_risk_level: riskLevel,
    risk_zones: riskZones,
    wind_shear_alert: shearAlert,
    microburst_alert: microburstAlert,
    icing_alert: icingAlert,
    thunderstorm_alert: thunderAlert,
    turbulence_assessment: turbAssess,
    max_safe_wind_kmh: maxWind,
    max_safe_gust_kmh: maxGust,
    recommended_departure_window: departWindow,
    monitoring_requirements: monitoring,
    mission_adjustments: adjustments,
    recommendations,
  }
}

function formatWeatherRisk(r: WeatherRiskResult): string {
  const lines: string[] = []
  lines.push('# Weather Risk Assessment Report')
  lines.push('Location: ' + r.location + ' | Drone: ' + r.drone_model)
  lines.push('GO/NO-GO: **' + r.go_no_go + '**')
  lines.push('Overall Risk: ' + r.overall_risk_level + ' (' + r.overall_risk_score + '/10)')
  lines.push('Max Safe Wind: ' + r.max_safe_wind_kmh + 'km/h | Max Safe Gust: ' + r.max_safe_gust_kmh + 'km/h')
  lines.push('')
  lines.push('## Risk Zones')
  r.risk_zones.forEach(z => {
    lines.push('- [' + z.status + '] ' + z.parameter + ': ' + z.value + ' (score: ' + z.risk_score + '/10, threshold: ' + z.threshold + ')')
  })
  lines.push('')
  lines.push('## Hazard Alerts')
  lines.push('- Wind Shear: ' + r.wind_shear_alert)
  lines.push('- Microburst: ' + r.microburst_alert)
  lines.push('- Icing: ' + r.icing_alert)
  lines.push('- Thunderstorm: ' + r.thunderstorm_alert)
  lines.push('- Turbulence: ' + r.turbulence_assessment)
  lines.push('')
  lines.push('## Departure Window')
  lines.push(r.recommended_departure_window)
  lines.push('')
  lines.push('## Mission Adjustments')
  r.mission_adjustments.forEach(m => lines.push('- ' + m))
  lines.push('')
  lines.push('## Monitoring Requirements')
  r.monitoring_requirements.forEach(m => lines.push('- ' + m))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// =====================================================================
// TOOL 8: remote_id_broadcaster
// =====================================================================

export interface RemoteIDInput {
  drone_model: string
  serial_number?: string
  operator_id?: string
  location?: { lat: number; lng: number; altitude_m: number }
  broadcast_method?: 'wifi_beacon' | 'bluetooth' | 'cellular' | 'satellite'
  flight_status?: 'grounded' | 'in_flight' | 'emergency'
  timestamp_utc?: string
  speed_kmh?: number
  heading_deg?: number
  seed_date?: string
}

export interface RemoteIDMessage {
  message_type: 'Basic ID' | 'Location/Vector' | 'Authentication' | 'Self ID' | 'System' | 'Operator ID'
  protocol: string
  fields: Record<string, string>
  broadcast_interval_sec: number
  compliance: 'COMPLIANT' | 'NON_COMPLIANT'
}

export interface RemoteIDResult {
  drone_model: string
  serial_number: string
  operator_id: string
  broadcast_method: string
  protocol_standard: string
  messages: RemoteIDMessage[]
  broadcast_range_m: number
  update_rate_hz: number
  network_remote_id: boolean
  compliance_status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT'
  f3411_compliance: string
  eu_delegate_act_compliance: string
  data_elements: string[]
  recommendations: string[]
}

function broadcastRemoteID(input: RemoteIDInput): RemoteIDResult {
  const rng = seededRng(JSON.stringify(input))

  const serialNum = input.serial_number || 'SN-' + String(hashStr(JSON.stringify(input)) % 1000000).padStart(6, '0')
  const operatorId = input.operator_id || 'OP-' + String(Math.floor(rng() * 99999)).padStart(5, '0')
  const broadcastMethod = input.broadcast_method || 'wifi_beacon'
  const flightStatus = input.flight_status || 'in_flight'
  const speed = input.speed_kmh || round(30 + rng() * 50, 1)
  const heading = input.heading_deg || round(rng() * 360, 0)
  const lat = input.location?.lat || 37.7749
  const lng = input.location?.lng || -122.4194
  const alt = input.location?.altitude_m || 100

  const messages: RemoteIDMessage[] = []
  messages.push({
    message_type: 'Basic ID',
    protocol: 'ASTM F3411-22a',
    fields: { UAS_ID: serialNum, ID_TYPE: 'Serial Number', UA_TYPE: 'Rotorcraft (Multi-rotor)' },
    broadcast_interval_sec: 1,
    compliance: 'COMPLIANT',
  })
  messages.push({
    message_type: 'Location/Vector',
    protocol: 'ASTM F3411-22a',
    fields: { LATITUDE: round(lat, 6) + '', LONGITUDE: round(lng, 6) + '', ALTITUDE: alt + 'm AGL', SPEED: speed + 'km/h', HEADING: heading + 'deg', STATUS: flightStatus.toUpperCase() },
    broadcast_interval_sec: 1,
    compliance: 'COMPLIANT',
  })
  messages.push({
    message_type: 'Authentication',
    protocol: 'ASTM F3411-22a',
    fields: { AUTH_TYPE: 'None', LAST_AUTH_PAYLOAD: 'N/A' },
    broadcast_interval_sec: 0.1,
    compliance: 'COMPLIANT',
  })
  messages.push({
    message_type: 'Self ID',
    protocol: 'ASTM F3411-22a',
    fields: { TEXT_TYPE: 'Emergency', TEXT: flightStatus === 'emergency' ? 'EMERGENCY — UAS IN DISTRESS' : 'Normal Operation' },
    broadcast_interval_sec: 3,
    compliance: 'COMPLIANT',
  })
  messages.push({
    message_type: 'System',
    protocol: 'ASTM F3411-22a',
    fields: { PILOT_LOCATION: round(lat + 0.0001, 6) + ',' + round(lng + 0.0001, 6), OPERATOR_ID: operatorId, OPERATOR_CATEGORY: 'Open / Specific' },
    broadcast_interval_sec: 3,
    compliance: 'COMPLIANT',
  })
  messages.push({
    message_type: 'Operator ID',
    protocol: 'ASTM F3411-22a',
    fields: { OPERATOR_ID_TYPE: 'FAA Registration', OPERATOR_ID: operatorId },
    broadcast_interval_sec: 3,
    compliance: 'COMPLIANT',
  })

  const broadcastRange = broadcastMethod === 'wifi_beacon' ? 500 : broadcastMethod === 'bluetooth' ? 200 : broadcastMethod === 'cellular' ? 5000 : 10000
  const updateRate = broadcastMethod === 'wifi_beacon' ? 1 : broadcastMethod === 'bluetooth' ? 1 : broadcastMethod === 'cellular' ? 0.5 : 0.2

  const dataElements: string[] = []
  dataElements.push('Unique UAS identifier (serial number)')
  dataElements.push('UAS position (WGS-84 lat/lon)')
  dataElements.push('Geometric altitude (m AGL)')
  dataElements.push('Speed (km/h) and heading (deg)')
  dataElements.push('Takeoff/landing position')
  dataElements.push('Emergency status flag')
  dataElements.push('Operator identification')
  dataElements.push('Pilot location (control station)')

  const complianceStatus: RemoteIDResult['compliance_status'] = 'COMPLIANT'
  const f3411 = 'ASTM F3411-22a Remote ID — all 6 message types broadcast'
  const euCompliance = 'EU Delegated Act 2019/947 — Network Remote ID capable'

  const recommendations: string[] = []
  recommendations.push('Broadcast method: ' + broadcastMethod + ' (range: ' + broadcastRange + 'm, rate: ' + updateRate + 'Hz)')
  recommendations.push('Protocol: ASTM F3411-22a with ' + messages.length + ' message types')
  recommendations.push('Network Remote ID: ' + (broadcastMethod === 'cellular' || broadcastMethod === 'satellite' ? 'Active — real-time tracking available' : 'Not active — direct broadcast only'))
  if (broadcastMethod === 'bluetooth') recommendations.push('Bluetooth range limited to ~200m — consider WiFi beacon for extended range')
  if (flightStatus === 'emergency') recommendations.push('EMERGENCY MODE: Self ID message broadcasting distress signal')
  recommendations.push('All data elements comply with FAA Remote ID Final Rule (Part 89)')
  recommendations.push('Ensure firmware updated to latest Remote ID protocol version')

  return {
    drone_model: input.drone_model,
    serial_number: serialNum,
    operator_id: operatorId,
    broadcast_method: broadcastMethod,
    protocol_standard: 'ASTM F3411-22a',
    messages,
    broadcast_range_m: broadcastRange,
    update_rate_hz: updateRate,
    network_remote_id: broadcastMethod === 'cellular' || broadcastMethod === 'satellite',
    compliance_status: complianceStatus,
    f3411_compliance: f3411,
    eu_delegate_act_compliance: euCompliance,
    data_elements: dataElements,
    recommendations,
  }
}

function formatRemoteID(r: RemoteIDResult): string {
  const lines: string[] = []
  lines.push('# Remote ID Broadcast Report')
  lines.push('Drone: ' + r.drone_model + ' | Serial: ' + r.serial_number + ' | Operator: ' + r.operator_id)
  lines.push('Broadcast: ' + r.broadcast_method + ' | Range: ' + r.broadcast_range_m + 'm | Rate: ' + r.update_rate_hz + 'Hz')
  lines.push('Protocol: ' + r.protocol_standard)
  lines.push('Compliance: **' + r.compliance_status + '**')
  lines.push('Network Remote ID: ' + (r.network_remote_id ? 'Active' : 'Direct broadcast only'))
  lines.push('')
  lines.push('## Message Types')
  r.messages.forEach(m => {
    lines.push('- ' + m.message_type + ' (' + m.protocol + ', ' + m.broadcast_interval_sec + 's interval) [' + m.compliance + ']')
    Object.entries(m.fields).forEach(([k, v]) => lines.push('  - ' + k + ': ' + v))
  })
  lines.push('')
  lines.push('## Standards Compliance')
  lines.push('- ' + r.f3411_compliance)
  lines.push('- ' + r.eu_delegate_act_compliance)
  lines.push('')
  lines.push('## Data Elements')
  r.data_elements.forEach(d => lines.push('- ' + d))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rc => lines.push('- ' + rc))
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. fleet_operations_planner
  tools.register(defineTool({
    name: 'fleet_operations_planner',
    description: 'Multi-drone fleet operations planning with shift scheduling, mission assignment, drone status tracking, and maintenance coordination',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { fleet_size: number, drone_model: string, operating_hours_start?: string, operating_hours_end?: string, missions?: Array<{ id: string, type: "delivery"|"survey"|"inspection"|"mapping"|"patrol"|"emergency", priority?: "low"|"medium"|"high"|"critical", estimated_duration_min: number, distance_km?: number, payload_kg?: number, location?: string }>, shift_overlap_min?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatFleetOps(planFleetOperations(JSON.parse(args.input_data)))
    },
  }))

  // 2. airspace_management_system
  tools.register(defineTool({
    name: 'airspace_management_system',
    description: 'Airspace management with UTM coordination, geofencing, structure conflict detection, and dynamic restriction monitoring',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { operation_area: { center_lat: number, center_lng: number, radius_km: number }, altitude_m?: number, flight_type?: "VLOS"|"BVLOS"|"autonomous", airspace_class_request?: "B"|"C"|"D"|"E"|"G", geofence_enabled?: boolean, nearby_structures?: Array<{ name: string, type: string, distance_km: number, height_m: number }>, utm_provider?: string, dynamic_restrictions?: Array<{ name: string, type: string, active: boolean, radius_km: number }>, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatAirspace(manageAirspace(JSON.parse(args.input_data)))
    },
  }))

  // 3. bvlos_compliance_checker
  tools.register(defineTool({
    name: 'bvlos_compliance_checker',
    description: 'BVLOS compliance checking with SORA risk assessment, SAIL level determination, strategic mitigations, and authorization pathway planning',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { drone_model: string, operation_type?: "linear_infrastructure"|"area_survey"|"delivery"|"emergency_response"|"cargo_transport", distance_km?: number, altitude_m?: number, population_density?: "sparsely_populated"|"populated"|"dense_urban", ground_risk_class?: "I"|"II"|"III"|"IV"|"V", strategic_mitigation_level?: "none"|"low"|"medium"|"high", detect_and_avoid?: boolean, c2_link_redundancy?: "single"|"dual"|"triple", emergency_recovery?: "parachute"|"auto_rtl"|"hybrid", saa_equipment?: string[], seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatBVLOS(checkBVLOSCompliance(JSON.parse(args.input_data)))
    },
  }))

  // 4. autonomous_mission_designer
  tools.register(defineTool({
    name: 'autonomous_mission_designer',
    description: 'Autonomous mission design with waypoint sequencing, fail-safe logic configuration, obstacle avoidance, and coverage optimization',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { drone_model: string, mission_type?: "waypoint_survey"|"orbit"|"linear_patrol"|"grid_mapping"|"point_inspection"|"corridor_scan", waypoints?: Array<{ lat: number, lng: number, altitude_m?: number, action?: string, hover_sec?: number }>, survey_area?: { north_lat: number, south_lat: number, east_lng: number, west_lng: number }, altitude_m?: number, speed_kmh?: number, overlap_percent?: number, fail_safe_actions?: string[], obstacle_avoidance?: "none"|"reactive"|"predictive"|"full_3d", return_home_trigger?: "low_battery"|"mission_complete"|"comm_loss"|"geofence", seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatMission(designAutonomousMission(JSON.parse(args.input_data)))
    },
  }))

  // 5. payload_optimization_engine
  tools.register(defineTool({
    name: 'payload_optimization_engine',
    description: 'Multi-compartment payload optimization with CG analysis, wind derating, dimensional weight calculation, and loading sequence',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { drone_model: string, compartments?: number, packages: Array<{ id: string, weight_kg: number, length_cm: number, width_cm: number, height_cm: number, fragile?: boolean, priority?: "low"|"medium"|"high"|"critical", compartment_preference?: number }>, wind_condition?: "calm"|"moderate"|"strong", cg_tolerance_cm?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPayloadEngine(optimizePayloadEngine(JSON.parse(args.input_data)))
    },
  }))

  // 6. battery_swap_scheduler
  tools.register(defineTool({
    name: 'battery_swap_scheduler',
    description: 'Battery swap scheduling with predictive SoC modeling, station logistics, charge strategy optimization, and fleet energy management',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { drone_model: string, fleet_size: number, missions_per_day?: number, avg_flight_min?: number, swap_stations?: Array<{ name: string, lat: number, lng: number, batteries_available: number, charge_time_min: number }>, charge_strategy?: "fast"|"slow"|"opportunistic", min_swap_soc_percent?: number, target_soc_percent?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatBatterySwap(scheduleBatterySwaps(JSON.parse(args.input_data)))
    },
  }))

  // 7. weather_risk_assessor
  tools.register(defineTool({
    name: 'weather_risk_assessor',
    description: 'Comprehensive weather risk assessment with microburst/icing/thunderstorm detection, turbulence analysis, and go/no-go decision matrix',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { drone_model: string, location?: string, temperature_c?: number, wind_speed_kmh?: number, wind_gust_kmh?: number, wind_direction_deg?: number, precipitation_mm_h?: number, visibility_km?: number, humidity_percent?: number, cloud_ceiling_m?: number, wind_shear_detected?: boolean, microburst_risk?: boolean, icing_risk?: boolean, thunderstorm_risk?: boolean, turbulence_index?: number, mission_priority?: "routine"|"important"|"critical"|"emergency", seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatWeatherRisk(assessWeatherRisk(JSON.parse(args.input_data)))
    },
  }))

  // 8. remote_id_broadcaster
  tools.register(defineTool({
    name: 'remote_id_broadcaster',
    description: 'Remote ID broadcast simulation with ASTM F3411 compliance, 6 message types, network/direct broadcast, and FAA/EU regulatory compliance',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { drone_model: string, serial_number?: string, operator_id?: string, location?: { lat: number, lng: number, altitude_m: number }, broadcast_method?: "wifi_beacon"|"bluetooth"|"cellular"|"satellite", flight_status?: "grounded"|"in_flight"|"emergency", timestamp_utc?: string, speed_kmh?: number, heading_deg?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatRemoteID(broadcastRemoteID(JSON.parse(args.input_data)))
    },
  }))
}
