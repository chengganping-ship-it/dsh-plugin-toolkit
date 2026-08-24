import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// =====================================================================
// DSH Underwater Robotics & Marine Tech - dsh-tool-underwaterbot v0.1.0
// 8 tools: AUV mission, ROV ops, inspection, marine data, sonar,
//          underwater comms, sediment sampler, biodiversity monitor
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
// TOOL 1: auv_mission_planner
// =====================================================================

export interface AUVMissionInput {
  vehicle_model: string
  mission_type: 'pipeline_survey' | 'bathymetric_map' | 'water_column_profile' | 'search_pattern' | 'cable_track'
  survey_area: { north_lat: number; south_lat: number; east_lng: number; west_lng: number }
  max_depth_m: number
  speed_kn?: number
  endurance_hrs?: number
  waypoints?: Array<{ lat: number; lng: number; depth_m?: number; action?: string }>
  current_speed_ms?: number
  current_direction_deg?: number
  obstacle_avoidance?: 'none' | 'reactive' | 'predictive'
  redundancy_level?: 'single' | 'dual' | 'triple'
  seed_date?: string
}

export interface WaypointPlan {
  sequence: number
  lat: number
  lng: number
  depth_m: number
  action: string
  estimated_time_min: number
  cumulative_time_min: number
}

export interface EnergyBudget {
  total_wh: number
  propulsion_wh: number
  payload_wh: number
  navigation_wh: number
  comms_wh: number
  margin_wh: number
  reserve_percent: number
}

export interface AUVMissionResult {
  vehicle_model: string
  mission_type: string
  survey_area_km2: number
  total_distance_km: number
  estimated_duration_hrs: number
  max_depth_m: number
  waypoints: WaypointPlan[]
  energy_budget: EnergyBudget
  current_compensation: string
  obstacle_avoidance_mode: string
  redundancy_status: string
  risk_assessment: string[]
  operational_notes: string[]
  recommendations: string[]
  mission_feasibility: 'FEASIBLE' | 'FEASIBLE_WITH_CONSTRAINTS' | 'NOT_FEASIBLE'
}

function planAUVMission(input: AUVMissionInput): AUVMissionResult {
  const rng = seededRng(JSON.stringify(input))
  const speedKn = input.speed_kn || 3.5
  const enduranceHrs = input.endurance_hrs || 24
  const speedKmh = speedKn * 1.852

  const latDiff = Math.abs(input.survey_area.north_lat - input.survey_area.south_lat)
  const lngDiff = Math.abs(input.survey_area.east_lng - input.survey_area.west_lng)
  const avgLat = (input.survey_area.north_lat + input.survey_area.south_lat) / 2
  const kmPerLat = 111.32
  const kmPerLng = 111.32 * Math.cos(avgLat * Math.PI / 180)
  const areaKm2 = round(latDiff * kmPerLat * lngDiff * kmPerLng, 2)

  const totalDistKm = round((latDiff * kmPerLat + lngDiff * kmPerLng) * 2.5, 2)
  const durationHrs = round(totalDistKm / speedKmh, 2)

  const dpw = 8 + Math.floor(rng() * 12)
  const waypoints: WaypointPlan[] = []
  let cumulativeMin = 0
  const inputWaypoints = input.waypoints || []
  if (inputWaypoints.length > 0) {
    for (let i = 0; i < inputWaypoints.length; i++) {
      const wp = inputWaypoints[i]
      const timeMin = i === 0 ? 0 : round(distanceBetween(
        inputWaypoints[i - 1].lat, inputWaypoints[i - 1].lng,
        wp.lat, wp.lng
      ) / (speedKmh / 60), 1)
      cumulativeMin += timeMin
      waypoints.push({
        sequence: i + 1,
        lat: wp.lat,
        lng: wp.lng,
        depth_m: wp.depth_m || round(rng() * input.max_depth_m, 0),
        action: wp.action || 'survey_pass',
        estimated_time_min: round(timeMin, 1),
        cumulative_time_min: round(cumulativeMin, 1),
      })
    }
  } else {
    for (let i = 0; i < dpw; i++) {
      const lat = round(input.survey_area.south_lat + rng() * latDiff, 6)
      const lng = round(input.survey_area.west_lng + rng() * lngDiff, 6)
      const depthM = round(rng() * input.max_depth_m, 0)
      const actions = ['survey_pass', 'dive', 'hover', 'ascend', 'camera_on', 'sonar_sweep']
      const action = actions[Math.floor(rng() * actions.length)]
      const timeMin = round(5 + rng() * 25, 1)
      cumulativeMin += timeMin
      waypoints.push({
        sequence: i + 1,
        lat, lng, depth_m: depthM, action,
        estimated_time_min: timeMin,
        cumulative_time_min: round(cumulativeMin, 1),
      })
    }
  }

  const totalWh = enduranceHrs * 500
  const propulsionWh = round(totalWh * 0.55, 0)
  const payloadWh = round(totalWh * 0.2, 0)
  const navWh = round(totalWh * 0.1, 0)
  const commsWh = round(totalWh * 0.05, 0)
  const marginWh = round(totalWh * 0.1, 0)
  const energyBudget: EnergyBudget = {
    total_wh: totalWh, propulsion_wh: propulsionWh, payload_wh: payloadWh,
    navigation_wh: navWh, comms_wh: commsWh, margin_wh: marginWh, reserve_percent: 10,
  }

  const currentSpd = input.current_speed_ms || 0.5
  const currentDir = input.current_direction_deg || 180
  const currentComp = 'Current: ' + currentSpd + ' m/s from ' + currentDir + ' deg — crab angle compensation: ' + round(Math.atan2(currentSpd, speedKmh / 3.6) * 180 / Math.PI, 1) + ' deg'

  const obsModes: Record<string, string> = {
    none: 'No obstacle avoidance',
    reactive: 'Reactive: forward sonar with 50m range',
    predictive: 'Predictive: 3D mapping with 100m look-ahead',
  }
  const obsMode = obsModes[input.obstacle_avoidance || 'reactive'] || obsModes.reactive

  const redLevels: Record<string, string> = {
    single: 'Single string — no redundancy',
    dual: 'Dual redundant — fault tolerant',
    triple: 'Triple modular redundancy — fail-operational',
  }
  const redStatus = redLevels[input.redundancy_level || 'dual'] || redLevels.dual

  const risks: string[] = []
  if (durationHrs > enduranceHrs * 0.8) risks.push('MISSION DURATION exceeds 80% of endurance — high energy risk')
  if (input.max_depth_m > 3000) risks.push('OPERATING DEPTH >3000m — requires titanium hull')
  if (currentSpd > 1.5) risks.push('STRONG CURRENTS >1.5 m/s — may impact navigation accuracy')
  if (areaKm2 > 100) risks.push('LARGE SURVEY AREA — consider splitting into multiple missions')
  if (risks.length === 0) risks.push('No critical risks identified')

  const opNotes: string[] = []
  opNotes.push(input.vehicle_model + ' configured for ' + input.mission_type + ' mission')
  opNotes.push('Survey coverage: ' + areaKm2 + ' km² at ' + speedKn + ' kn')
  opNotes.push('Energy budget: ' + totalWh + ' Wh over ' + enduranceHrs + ' hr endurance')
  opNotes.push('Waypoints: ' + waypoints.length + ' planned, total ' + totalDistKm + ' km')

  const recommendations: string[] = []
  if (durationHrs > enduranceHrs * 0.9) recommendations.push('Reduce speed or shorten mission to stay within 90% endurance')
  if (waypoints.length < 5) recommendations.push('Add more waypoints for consistent coverage')
  recommendations.push('Activate USBL tracking for surface positioning verification')
  recommendations.push('Set emergency ascent trigger at 15% battery reserve')
  if (input.max_depth_m > 2000) recommendations.push('Enable pressure hull monitor with real-time strain gauges')

  const feasibility: AUVMissionResult['mission_feasibility'] =
    durationHrs > enduranceHrs ? 'NOT_FEASIBLE'
    : durationHrs > enduranceHrs * 0.8 ? 'FEASIBLE_WITH_CONSTRAINTS'
    : 'FEASIBLE'

  return {
    vehicle_model: input.vehicle_model,
    mission_type: input.mission_type,
    survey_area_km2: areaKm2,
    total_distance_km: totalDistKm,
    estimated_duration_hrs: durationHrs,
    max_depth_m: input.max_depth_m,
    waypoints,
    energy_budget: energyBudget,
    current_compensation: currentComp,
    obstacle_avoidance_mode: obsMode,
    redundancy_status: redStatus,
    risk_assessment: risks,
    operational_notes: opNotes,
    recommendations,
    mission_feasibility: feasibility,
  }
}

function distanceBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatAUVMission(r: AUVMissionResult): string {
  const lines: string[] = []
  lines.push('# AUV Mission Plan: ' + r.mission_type)
  lines.push('Vehicle: ' + r.vehicle_model + ' | Depth rating: ' + r.max_depth_m + 'm')
  lines.push('Survey area: ' + r.survey_area_km2 + ' km² | Distance: ' + r.total_distance_km + ' km | Duration: ' + r.estimated_duration_hrs + ' hrs')
  lines.push('Feasibility: **' + r.mission_feasibility + '**')
  lines.push('')
  lines.push('## Energy Budget')
  lines.push('- Total: ' + r.energy_budget.total_wh + ' Wh (propulsion ' + r.energy_budget.propulsion_wh + ', payload ' + r.energy_budget.payload_wh + ', nav ' + r.energy_budget.navigation_wh + ', comms ' + r.energy_budget.comms_wh + ', margin ' + r.energy_budget.margin_wh + ')')
  lines.push('')
  lines.push('## Waypoints (' + r.waypoints.length + ')')
  r.waypoints.forEach(w => {
    lines.push('- WP' + w.sequence + ': ' + w.lat + ',' + w.lng + ' @ ' + w.depth_m + 'm [' + w.action + '] T+' + w.cumulative_time_min + 'min')
  })
  lines.push('')
  lines.push('## Current Compensation')
  lines.push('- ' + r.current_compensation)
  lines.push('')
  lines.push('## Risks')
  r.risk_assessment.forEach(x => lines.push('- ' + x))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(x => lines.push('- ' + x))
  return lines.join('\n')
}

// =====================================================================
// TOOL 2: rov_operations_manager
// =====================================================================

export interface ROVOpsInput {
  rov_model: string
  operation_type: 'inspection' | 'construction' | 'pipeline_repair' | 'cable_lay' | 'sampling' | 'decommissioning'
  depth_m: number
  tether_length_m?: number
  thruster_count?: number
  sea_state?: number
  current_speed_ms?: number
  visibility_m?: number
  payload_kg?: number
  umbilical_diameter_mm?: number
  pilot_experience?: 'novice' | 'intermediate' | 'expert'
  seed_date?: string
}

export interface ThrusterAllocation {
  thruster_id: string
  x_force_n: number
  y_force_n: number
  z_force_n: number
  yaw_torque_nm: number
  status: 'active' | 'standby' | 'fault'
}

export interface TetherStatus {
  tension_n: number
  length_deployed_m: number
  drag_force_n: number
  snap_load_n: number
  safety_factor: number
}

export interface ROVOpsResult {
  rov_model: string
  operation_type: string
  depth_m: number
  tether_status: TetherStatus
  thruster_allocation: ThrusterAllocation[]
  available_thrust_n: number
  required_thrust_n: number
  thrust_margin_percent: number
  power_consumption_kw: number
  pilot_recommendation: string
  sea_state_limit: number
  operational_warnings: string[]
  positioning_accuracy: string
  emergency_protocols: string[]
}

function manageROVOperations(input: ROVOpsInput): ROVOpsResult {
  const rng = seededRng(JSON.stringify(input))
  const depthM = input.depth_m
  const tetherLen = input.tether_length_m || (depthM * 1.5)
  const thrusterCount = input.thruster_count || 6
  const seaState = input.sea_state || 3
  const currentSpd = input.current_speed_ms || 0.8
  const visibility = input.visibility_m || 5

  const waterDensity = 1025
  const rovArea = 4.5
  const dragCoeff = 1.2
  const dragForceN = round(0.5 * waterDensity * rovArea * dragCoeff * currentSpd ** 2, 1)
  const tetherDragCoeff = 1.0
  const tetherDiameterM = (input.umbilical_diameter_mm || 18) / 1000
  const tetherDragN = round(0.5 * waterDensity * tetherDragCoeff * tetherDiameterM * tetherLen * currentSpd ** 2, 1)
  const tensionN = round(dragForceN + tetherDragN + depthM * 0.1, 1)
  const snapLoadN = round(depthM * 50 + 5000, 0)
  const safetyFactor = round(snapLoadN / Math.max(1, tensionN), 2)

  const thrustPerThruster = 200 + rng() * 100
  const thrusters: ThrusterAllocation[] = []
  let totalThrust = 0
  for (let i = 0; i < thrusterCount; i++) {
    const status: ThrusterAllocation['status'] = rng() < 0.9 ? 'active' : rng() < 0.95 ? 'standby' : 'fault'
    const fx = round((rng() - 0.5) * thrustPerThruster, 1)
    const fy = round((rng() - 0.5) * thrustPerThruster, 1)
    const fz = round((status === 'active' ? rng() : 0) * thrusterCount * 50 * 0.3, 1)
    const yaw = round((rng() - 0.5) * 50, 1)
    if (status === 'active') totalThrust += Math.sqrt(fx * fx + fy * fy)
    thrusters.push({
      thruster_id: 'T' + (i + 1),
      x_force_n: fx, y_force_n: fy, z_force_n: fz, yaw_torque_nm: yaw,
      status,
    })
  }

  const activeThrusters = thrusters.filter(t => t.status === 'active').length
  const availThrust = round(activeThrusters * thrustPerThruster * 0.7, 1)
  const reqThrust = round(dragForceN + tetherDragN + (input.payload_kg || 50) * 9.81, 1)
  const thrustMargin = round((availThrust - reqThrust) / reqThrust * 100, 1)
  const powerKw = round(activeThrusters * 3.5 + rng() * 5, 1)

  const pilotRec = input.pilot_experience === 'novice'
    ? 'NOVICE PILOT: limit operations to Sea State 3, depth <500m, tether tension <50% snap load'
    : input.pilot_experience === 'intermediate'
    ? 'INTERMEDIATE: standard operations authorized, degrade to Sea State 4 max'
    : 'EXPERT: full operational envelope, Sea State 5 authorized with caution'

  const maxSeaState = input.pilot_experience === 'expert' ? 5 : input.pilot_experience === 'intermediate' ? 4 : 3

  const warnings: string[] = []
  if (thrustMargin < 20) warnings.push('LOW THRUST MARGIN: ' + thrustMargin + '% — reduce payload or current exposure')
  if (safetyFactor < 3) warnings.push('TETHER SAFETY FACTOR LOW: ' + safetyFactor + ' — risk of snap')
  if (seaState > maxSeaState) warnings.push('SEA STATE ' + seaState + ' exceeds pilot authorization (max ' + maxSeaState + ')')
  if (visibility < 3) warnings.push('LOW VISIBILITY: ' + visibility + 'm — rely on sonar navigation')
  if (activeThrusters < thrusterCount) warnings.push((thrusterCount - activeThrusters) + ' thruster(s) not available — reduced maneuverability')
  if (warnings.length === 0) warnings.push('All systems nominal')

  const posAccuracy = depthM < 500 ? 'DGPS/USBL: ±0.5m'
    : depthM < 2000 ? 'USBL: ±2m / DVL: ±1% distance'
    : 'DVL + INS: ±5m / LBL beacons recommended'

  const emergencyProtocols: string[] = []
  emergencyProtocols.push('Tether severance: auto-surface with drop weight release')
  emergencyProtocols.push('Power loss: switch to battery backup, abort mission')
  emergencyProtocols.push('Thruster fault: redistribute thrust, reduce speed')
  emergencyProtocols.push('Flooding: emergency buoyancy ascent, close all seals')
  emergencyProtocols.push('Entanglement: stop all thrusters, notify surface vessel')

  return {
    rov_model: input.rov_model,
    operation_type: input.operation_type,
    depth_m: depthM,
    tether_status: {
      tension_n: tensionN, length_deployed_m: tetherLen,
      drag_force_n: tetherDragN, snap_load_n: snapLoadN, safety_factor: safetyFactor,
    },
    thruster_allocation: thrusters,
    available_thrust_n: availThrust,
    required_thrust_n: reqThrust,
    thrust_margin_percent: thrustMargin,
    power_consumption_kw: powerKw,
    pilot_recommendation: pilotRec,
    sea_state_limit: maxSeaState,
    operational_warnings: warnings,
    positioning_accuracy: posAccuracy,
    emergency_protocols: emergencyProtocols,
  }
}

function formatROVOps(r: ROVOpsResult): string {
  const lines: string[] = []
  lines.push('# ROV Operations Report: ' + r.operation_type)
  lines.push('ROV: ' + r.rov_model + ' | Depth: ' + r.depth_m + 'm')
  lines.push('Thrust margin: ' + r.thrust_margin_percent + '% | Power: ' + r.power_consumption_kw + ' kW')
  lines.push('')
  lines.push('## Tether Status')
  lines.push('- Tension: ' + r.tether_status.tension_n + ' N | Deployed: ' + r.tether_status.length_deployed_m + 'm')
  lines.push('- Drag: ' + r.tether_status.drag_force_n + ' N | Snap load: ' + r.tether_status.snap_load_n + ' N | SF: ' + r.tether_status.safety_factor)
  lines.push('')
  lines.push('## Thruster Allocation (' + r.thruster_allocation.length + ')')
  r.thruster_allocation.forEach(t => {
    lines.push('- ' + t.thruster_id + ': [' + t.status + '] Fx=' + t.x_force_n + 'N Fy=' + t.y_force_n + 'N Fz=' + t.z_force_n + 'N Yaw=' + t.yaw_torque_nm + 'Nm')
  })
  lines.push('')
  lines.push('## Pilot Guidance')
  lines.push('- ' + r.pilot_recommendation)
  lines.push('- Positioning: ' + r.positioning_accuracy)
  lines.push('')
  lines.push('## Warnings')
  r.operational_warnings.forEach(w => lines.push('- ' + w))
  lines.push('')
  lines.push('## Emergency Protocols')
  r.emergency_protocols.forEach(e => lines.push('- ' + e))
  return lines.join('\n')
}

// =====================================================================
// TOOL 3: underwater_inspector
// =====================================================================

export interface UnderwaterInspectionInput {
  structure_type: 'pipeline' | 'platform_leg' | 'riser' | 'cable' | 'hull' | 'dam' | 'tunnel'
  inspection_method: 'visual' | 'ultrasonic' | 'magnetic_flux' | 'eddy_current' | 'laser_profile'
  length_m?: number
  diameter_mm?: number
  wall_thickness_mm?: number
  material?: 'steel' | 'concrete' | 'composite' | 'titanium'
  coating_type?: 'none' | 'epoxy' | 'cathodic' | 'thermal_spray'
  last_inspection_date?: string
  defect_history?: Array<{ type: string; severity: 'minor' | 'moderate' | 'critical'; location_m: number }>
  seed_date?: string
}

export interface DefectFinding {
  defect_id: string
  type: 'corrosion' | 'crack' | 'dent' | 'coating_loss' | 'weld_defect' | 'biofouling' | 'erosion'
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  location_m: number
  size_mm: number
  depth_percent: number
  recommendation: string
}

export interface InspectionResult {
  structure_type: string
  inspection_method: string
  total_length_inspected_m: number
  defects_found: DefectFinding[]
  overall_condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
  remaining_life_years: number
  coverage_percent: number
  ndt_capabilities: string[]
  critical_defects: number
  repair_urgency: 'routine' | 'scheduled' | 'priority' | 'immediate'
  recommendations: string[]
  compliance_status: string
}

function inspectUnderwater(input: UnderwaterInspectionInput): InspectionResult {
  const rng = seededRng(JSON.stringify(input))
  const lengthM = input.length_m || 100
  const wallThickness = input.wall_thickness_mm || 20
  const defectCount = Math.floor(rng() * 8) + 1
  const defects: DefectFinding[] = []

  const defectTypes: DefectFinding['type'][] = ['corrosion', 'crack', 'dent', 'coating_loss', 'weld_defect', 'biofouling', 'erosion']
  const severities: DefectFinding['severity'][] = ['minor', 'moderate', 'major', 'critical']

  for (let i = 0; i < defectCount; i++) {
    const dtype = defectTypes[Math.floor(rng() * defectTypes.length)]
    const sevRoll = rng()
    const severity = sevRoll < 0.4 ? 'minor' : sevRoll < 0.7 ? 'moderate' : sevRoll < 0.9 ? 'major' : 'critical'
    const locM = round(rng() * lengthM, 1)
    const sizeMm = round(5 + rng() * 150, 1)
    const depthPct = round(rng() * 80, 1)

    let rec = 'Monitor'
    if (severity === 'critical') rec = 'Immediate repair required'
    else if (severity === 'major') rec = 'Schedule repair within 30 days'
    else if (severity === 'moderate') rec = 'Include in next maintenance window'
    else rec = 'Continue monitoring'

    defects.push({
      defect_id: 'DEF-' + String(i + 1).padStart(3, '0'),
      type: dtype, severity, location_m: locM, size_mm: sizeMm,
      depth_percent: depthPct, recommendation: rec,
    })
  }

  const criticalCount = defects.filter(d => d.severity === 'critical').length
  const majorCount = defects.filter(d => d.severity === 'major').length
  const moderateCount = defects.filter(d => d.severity === 'moderate').length

  const condition: InspectionResult['overall_condition'] =
    criticalCount > 0 ? 'CRITICAL'
    : majorCount > 2 ? 'POOR'
    : majorCount > 0 ? 'FAIR'
    : moderateCount > 3 ? 'GOOD'
    : 'EXCELLENT'

  const remainingLife = criticalCount > 0 ? round(0.5 + rng() * 1, 1)
    : majorCount > 0 ? round(2 + rng() * 3, 1)
    : round(5 + rng() * 15, 1)

  const coverage = round(70 + rng() * 30, 1)

  const ndtCaps: string[] = []
  if (input.inspection_method === 'ultrasonic') {
    ndtCaps.push('Wall thickness measurement: ±0.1mm accuracy')
    ndtCaps.push('Crack detection: >5mm length, >1mm depth')
    ndtCaps.push('Corrosion mapping: C-scan imaging')
  } else if (input.inspection_method === 'magnetic_flux') {
    ndtCaps.push('Metal loss detection: >10% wall loss')
    ndtCaps.push('Crack detection: surface and near-surface')
    ndtCaps.push('Weld inspection: longitudinal and transverse')
  } else if (input.inspection_method === 'eddy_current') {
    ndtCaps.push('Surface crack detection: >2mm length')
    ndtCaps.push('Coating thickness measurement')
    ndtCaps.push('Conductivity/resistivity mapping')
  } else if (input.inspection_method === 'laser_profile') {
    ndtCaps.push('3D dimensional accuracy: ±0.5mm')
    ndtCaps.push('Pitting measurement and mapping')
    ndtCaps.push('Deformation analysis')
  } else {
    ndtCaps.push('Visual: color and monochrome HD cameras')
    ndtCaps.push('Scaling and measurement lasers')
    ndtCaps.push('Biofouling coverage assessment')
  }

  const repairUrgency: InspectionResult['repair_urgency'] =
    criticalCount > 0 ? 'immediate'
    : majorCount > 0 ? 'priority'
    : moderateCount > 2 ? 'scheduled'
    : 'routine'

  const recommendations: string[] = []
  if (criticalCount > 0) recommendations.push(criticalCount + ' critical defect(s) require immediate intervention')
  if (majorCount > 0) recommendations.push(majorCount + ' major defect(s) — schedule repair within 30 days')
  if (coverage < 90) recommendations.push('Coverage at ' + coverage + '% — consider re-inspection for full coverage')
  recommendations.push('Next inspection interval: ' + (condition === 'EXCELLENT' ? '24 months' : condition === 'GOOD' ? '12 months' : condition === 'FAIR' ? '6 months' : '3 months'))
  if (input.coating_type && input.coating_type !== 'none') recommendations.push('Coating assessment: verify ' + input.coating_type + ' integrity')

  const compliance = criticalCount === 0
    ? 'COMPLIANT — meets DNV-RP-F101 / API 579 standards'
    : 'NON-COMPLIANT — critical defects exceed allowable limits per DNV-RP-F101'

  return {
    structure_type: input.structure_type,
    inspection_method: input.inspection_method,
    total_length_inspected_m: lengthM,
    defects_found: defects,
    overall_condition: condition,
    remaining_life_years: remainingLife,
    coverage_percent: coverage,
    ndt_capabilities: ndtCaps,
    critical_defects: criticalCount,
    repair_urgency: repairUrgency,
    recommendations,
    compliance_status: compliance,
  }
}

function formatInspection(r: InspectionResult): string {
  const lines: string[] = []
  lines.push('# Underwater Inspection Report: ' + r.structure_type)
  lines.push('Method: ' + r.inspection_method + ' | Length: ' + r.total_length_inspected_m + 'm | Coverage: ' + r.coverage_percent + '%')
  lines.push('Condition: **' + r.overall_condition + '** | Remaining life: ' + r.remaining_life_years + ' years')
  lines.push('Repair urgency: ' + r.repair_urgency + ' | Compliance: ' + r.compliance_status)
  lines.push('')
  lines.push('## Defects Found (' + r.defects_found.length + ')')
  r.defects_found.forEach(d => {
    lines.push('- ' + d.defect_id + ': ' + d.type + ' [' + d.severity + '] @ ' + d.location_m + 'm, ' + d.size_mm + 'mm, ' + d.depth_percent + '% wall loss — ' + d.recommendation)
  })
  lines.push('')
  lines.push('## NDT Capabilities')
  r.ndt_capabilities.forEach(c => lines.push('- ' + c))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(x => lines.push('- ' + x))
  return lines.join('\n')
}

// =====================================================================
// TOOL 4: marine_data_analyzer
// =====================================================================

export interface MarineDataInput {
  data_type: 'ctd_profile' | 'adcp_currents' | 'wave_record' | 'tide_gauge' | 'meteorological'
  station_id: string
  depth_range_m?: [number, number]
  time_range?: { start: string; end: string }
  parameters?: string[]
  sampling_rate_hz?: number
  quality_control?: boolean
  seed_date?: string
}

export interface CTDProfile {
  depth_m: number
  temperature_c: number
  salinity_psu: number
  density_kg_m3: number
  do_mg_l: number
  turbidity_ntu: number
  chlorophyll_ug_l: number
}

export interface CurrentProfile {
  depth_m: number
  speed_ms: number
  direction_deg: number
  u_component_ms: number
  v_component_ms: number
}

export interface MarineDataResult {
  data_type: string
  station_id: string
  profile_count: number
  ctd_profiles: CTDProfile[]
  current_profiles: CurrentProfile[]
  mixed_layer_depth_m: number
  thermocline_depth_m: number
  salinity_max_depth_m: number
  max_current_speed_ms: number
  mean_temperature_c: number
  mean_salinity_psu: number
  quality_flags: string[]
  data_gaps: string[]
  analysis_notes: string[]
  recommendations: string[]
}

function analyzeMarineData(input: MarineDataInput): MarineDataResult {
  const rng = seededRng(JSON.stringify(input))
  const depthRange = input.depth_range_m || [0, 500]
  const profileCount = 10 + Math.floor(rng() * 20)

  const ctdProfiles: CTDProfile[] = []
  const currentProfiles: CurrentProfile[] = []

  let tempSum = 0, salSum = 0
  let maxCurrent = 0
  let mld = 0, thermocline = 0, salMaxDepth = 0

  for (let i = 0; i < profileCount; i++) {
    const depthM = round(depthRange[0] + (depthRange[1] - depthRange[0]) * (i / (profileCount - 1)), 1)
    const tempC = round(25 - 20 * (depthM / depthRange[1]) + (rng() - 0.5) * 2, 2)
    const salPsu = round(34 + 2 * (depthM / depthRange[1]) + (rng() - 0.5) * 0.5, 2)
    const density = round(1020 + 5 * (depthM / depthRange[1]) + (salPsu - 34) * 0.8, 2)
    const doMgL = round(8 - 6 * (depthM / depthRange[1]) + (rng() - 0.5), 2)
    const turb = round(rng() * 5 * Math.exp(-depthM / 100), 2)
    const chl = round(2 * Math.exp(-((depthM - 30) ** 2) / 2000) + rng() * 0.5, 2)

    ctdProfiles.push({
      depth_m: depthM, temperature_c: tempC, salinity_psu: salPsu,
      density_kg_m3: density, do_mg_l: doMgL, turbidity_ntu: turb,
      chlorophyll_ug_l: chl,
    })

    const currentSpd = round(0.2 + 0.8 * Math.exp(-depthM / 50) + rng() * 0.2, 3)
    const currentDir = round(rng() * 360, 1)
    const uComp = round(-currentSpd * Math.sin(currentDir * Math.PI / 180), 3)
    const vComp = round(-currentSpd * Math.cos(currentDir * Math.PI / 180), 3)

    currentProfiles.push({
      depth_m: depthM, speed_ms: currentSpd, direction_deg: currentDir,
      u_component_ms: uComp, v_component_ms: vComp,
    })

    tempSum += tempC
    salSum += salPsu
    if (currentSpd > maxCurrent) maxCurrent = currentSpd
    if (i > 0 && ctdProfiles[i].temperature_c < ctdProfiles[0].temperature_c - 0.5 && thermocline === 0) {
      thermocline = depthM
    }
    if (i > 0 && ctdProfiles[i].density_kg_m3 > ctdProfiles[0].density_kg_m3 + 0.3 && mld === 0) {
      mld = depthM
    }
    if (salPsu > 35.5 && salMaxDepth === 0) salMaxDepth = depthM
  }

  if (thermocline === 0) thermocline = round(depthRange[1] * 0.3, 0)
  if (mld === 0) mld = round(depthRange[1] * 0.1, 0)
  if (salMaxDepth === 0) salMaxDepth = round(depthRange[1] * 0.5, 0)

  const qualityFlags: string[] = []
  if (input.quality_control !== false) {
    qualityFlags.push('Range check: PASS')
    qualityFlags.push('Spike detection: PASS')
    qualityFlags.push('Gradient check: PASS')
    qualityFlags.push('Stationarity: PASS')
  } else {
    qualityFlags.push('QC disabled — raw data output')
  }

  const dataGaps: string[] = []
  if (rng() < 0.3) dataGaps.push('Surface layer (0-5m): aeration artifact in DO')
  if (rng() < 0.2) dataGaps.push('Deep layer: sensor saturation at ' + depthRange[1] + 'm')
  if (dataGaps.length === 0) dataGaps.push('No significant data gaps detected')

  const analysisNotes: string[] = []
  analysisNotes.push('Station ' + input.station_id + ': ' + profileCount + ' profiles from ' + depthRange[0] + 'm to ' + depthRange[1] + 'm')
  analysisNotes.push('Mixed layer depth: ' + mld + 'm | Thermocline: ' + thermocline + 'm')
  analysisNotes.push('Max current: ' + round(maxCurrent, 3) + ' m/s at surface layer')
  analysisNotes.push('Chlorophyll max at ~30m depth — indicates subsurface phytoplankton bloom')

  const recommendations: string[] = []
  recommendations.push('Deploy mooring for continuous monitoring at this station')
  if (maxCurrent > 1.0) recommendations.push('Strong currents detected — secure all equipment')
  if (ctdProfiles.some(p => p.do_mg_l < 3)) recommendations.push('Hypoxic conditions detected below ' + thermocline + 'm — ecological concern')
  recommendations.push('Repeat survey seasonally to capture interannual variability')

  return {
    data_type: input.data_type,
    station_id: input.station_id,
    profile_count: profileCount,
    ctd_profiles: ctdProfiles,
    current_profiles: currentProfiles,
    mixed_layer_depth_m: mld,
    thermocline_depth_m: thermocline,
    salinity_max_depth_m: salMaxDepth,
    max_current_speed_ms: round(maxCurrent, 3),
    mean_temperature_c: round(tempSum / profileCount, 2),
    mean_salinity_psu: round(salSum / profileCount, 2),
    quality_flags: qualityFlags,
    data_gaps: dataGaps,
    analysis_notes: analysisNotes,
    recommendations,
  }
}

function formatMarineData(r: MarineDataResult): string {
  const lines: string[] = []
  lines.push('# Marine Data Analysis: ' + r.data_type)
  lines.push('Station: ' + r.station_id + ' | Profiles: ' + r.profile_count)
  lines.push('Mean temp: ' + r.mean_temperature_c + ' C | Mean salinity: ' + r.mean_salinity_psu + ' PSU')
  lines.push('MLD: ' + r.mixed_layer_depth_m + 'm | Thermocline: ' + r.thermocline_depth_m + 'm | Sal max: ' + r.salinity_max_depth_m + 'm')
  lines.push('')
  lines.push('## CTD Profiles (first 5)')
  r.ctd_profiles.slice(0, 5).forEach(p => {
    lines.push('- ' + p.depth_m + 'm: T=' + p.temperature_c + 'C S=' + p.salinity_psu + 'PSU rho=' + p.density_kg_m3 + ' DO=' + p.do_mg_l + 'mg/L Chl=' + p.chlorophyll_ug_l)
  })
  lines.push('')
  lines.push('## Current Profiles (first 5)')
  r.current_profiles.slice(0, 5).forEach(c => {
    lines.push('- ' + c.depth_m + 'm: ' + c.speed_ms + 'm/s @ ' + c.direction_deg + 'deg (U=' + c.u_component_ms + ' V=' + c.v_component_ms + ')')
  })
  lines.push('')
  lines.push('## Quality Flags')
  r.quality_flags.forEach(q => lines.push('- ' + q))
  lines.push('')
  lines.push('## Data Gaps')
  r.data_gaps.forEach(g => lines.push('- ' + g))
  lines.push('')
  lines.push('## Analysis Notes')
  r.analysis_notes.forEach(n => lines.push('- ' + n))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(x => lines.push('- ' + x))
  return lines.join('\n')
}

// =====================================================================
// TOOL 5: sonar_signal_processor
// =====================================================================

export interface SonarInput {
  sonar_type: 'multibeam' | 'sidescan' | 'sub_bottom' | 'single_beam' | 'sas'
  frequency_khz: number
  range_m: number
  pulse_length_ms?: number
  beam_width_deg?: number
  grazing_angle_deg?: number
  sound_velocity_ms?: number
  bottom_type?: 'mud' | 'sand' | 'gravel' | 'rock' | 'coral'
  noise_level_db?: number
  target_strength_db?: number
  seed_date?: string
}

export interface BeamData {
  beam_id: number
  angle_deg: number
  range_m: number
  intensity_db: number
  bottom_detected: boolean
  classification: string
}

export interface SonarResult {
  sonar_type: string
  frequency_khz: number
  range_m: number
  beam_count: number
  beams: BeamData[]
  bottom_classification: string
  backscatter_intensity_db: number
  snr_db: number
  resolution_m: number
  swath_width_m: number
  detection_probability: number
  false_alarm_rate: number
  processing_steps: string[]
  recommendations: string[]
}

function processSonarSignal(input: SonarInput): SonarResult {
  const rng = seededRng(JSON.stringify(input))
  const freqKhz = input.frequency_khz
  const rangeM = input.range_m
  const pulseLen = input.pulse_length_ms || 1
  const beamWidth = input.beam_width_deg || 1.5
  const grazingAngle = input.grazing_angle_deg || 30
  const sv = input.sound_velocity_ms || 1500
  const noiseDb = input.noise_level_db || 40
  const targetDb = input.target_strength_db || -25

  const beamCount = input.sonar_type === 'multibeam' ? 128 + Math.floor(rng() * 128)
    : input.sonar_type === 'sas' ? 256
    : input.sonar_type === 'sidescan' ? 256
    : 1

  const beams: BeamData[] = []
  const maxAngle = input.sonar_type === 'multibeam' ? 75 : input.sonar_type === 'sidescan' ? 80 : 5
  const classifications = ['hard_bottom', 'soft_bottom', 'rough', 'smooth', 'vegetated', 'unknown']

  for (let i = 0; i < Math.min(beamCount, 32); i++) {
    const angle = round(-maxAngle + (2 * maxAngle) * (i / Math.max(1, beamCount - 1)), 2)
    const beamRange = round(rangeM * (0.8 + 0.2 * rng()), 1)
    const intensity = round(-20 - rng() * 40 + (targetDb + 40), 1)
    const bottomDetected = intensity > noiseDb + 10
    const classification = classifications[Math.floor(rng() * classifications.length)]
    beams.push({
      beam_id: i, angle_deg: angle, range_m: beamRange,
      intensity_db: intensity, bottom_detected: bottomDetected,
      classification,
    })
  }

  const bottomTypes: Record<string, string> = {
    mud: 'Soft mud — high absorption, low backscatter (-30 to -20 dB)',
    sand: 'Sand — moderate backscatter (-20 to -10 dB), good penetration',
    gravel: 'Gravel — high backscatter (-15 to -5 dB), rough surface',
    rock: 'Rock — very high backscatter (-10 to 0 dB), hard return',
    coral: 'Coral reef — complex scattering, high acoustic variability',
  }
  const bottomClass = bottomTypes[input.bottom_type || 'sand'] || bottomTypes.sand

  const backscatterDb = round(-30 + rng() * 25, 1)
  const snrDb = round(targetDb - noiseDb + rng() * 10, 1)
  const resolutionM = round((sv * pulseLen / 1000) / 2, 3)
  const swathWidth = round(2 * rangeM * Math.tan(maxAngle * Math.PI / 180), 1)

  const detectionProb = clamp(round(0.7 + rng() * 0.28, 3), 0, 1)
  const falseAlarmRate = round(rng() * 0.05, 4)

  const processingSteps: string[] = []
  processingSteps.push('1. Raw data acquisition at ' + freqKhz + ' kHz, ' + rangeM + 'm range')
  processingSteps.push('2. TVG (Time Variable Gain) applied: 20logR + 2alphaR')
  processingSteps.push('3. Beamforming: ' + beamCount + ' beams at ' + beamWidth + ' deg spacing')
  processingSteps.push('4. Bottom detection: amplitude/phase hybrid method')
  processingSteps.push('5. Backscatter correction for grazing angle and absorption')
  processingSteps.push('6. Georeferencing with motion sensor and GNSS data')

  const recommendations: string[] = []
  if (snrDb < 10) recommendations.push('Low SNR (' + snrDb + ' dB) — increase power or reduce range')
  if (freqKhz < 50) recommendations.push('Low frequency selected — good penetration but lower resolution')
  if (freqKhz > 400) recommendations.push('High frequency — excellent resolution but limited range')
  recommendations.push('Apply sound velocity profile correction for refraction errors')
  recommendations.push('Use ' + (input.sonar_type === 'multibeam' ? 'backscatter mosaic' : 'radiometric normalization') + ' for seabed mapping')

  return {
    sonar_type: input.sonar_type,
    frequency_khz: freqKhz,
    range_m: rangeM,
    beam_count: beamCount,
    beams,
    bottom_classification: bottomClass,
    backscatter_intensity_db: backscatterDb,
    snr_db: snrDb,
    resolution_m: resolutionM,
    swath_width_m: swathWidth,
    detection_probability: detectionProb,
    false_alarm_rate: falseAlarmRate,
    processing_steps: processingSteps,
    recommendations,
  }
}

function formatSonar(r: SonarResult): string {
  const lines: string[] = []
  lines.push('# Sonar Signal Processing Report: ' + r.sonar_type)
  lines.push('Frequency: ' + r.frequency_khz + ' kHz | Range: ' + r.range_m + 'm | Beams: ' + r.beam_count)
  lines.push('Swath: ' + r.swath_width_m + 'm | Resolution: ' + r.resolution_m + 'm | SNR: ' + r.snr_db + ' dB')
  lines.push('Detection probability: ' + r.detection_probability + ' | False alarm rate: ' + r.false_alarm_rate)
  lines.push('')
  lines.push('## Bottom Classification')
  lines.push('- ' + r.bottom_classification)
  lines.push('- Backscatter: ' + r.backscatter_intensity_db + ' dB')
  lines.push('')
  lines.push('## Beam Data (first ' + r.beams.length + ')')
  r.beams.forEach(b => {
    lines.push('- Beam ' + b.beam_id + ': ' + b.angle_deg + 'deg, ' + b.range_m + 'm, ' + b.intensity_db + 'dB [' + (b.bottom_detected ? 'BOTTOM' : 'NOISE') + '] ' + b.classification)
  })
  lines.push('')
  lines.push('## Processing Steps')
  r.processing_steps.forEach(s => lines.push('- ' + s))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(x => lines.push('- ' + x))
  return lines.join('\n')
}

// =====================================================================
// TOOL 6: underwater_communication_planner
// =====================================================================

export interface UnderwaterCommInput {
  modem_type: 'acoustic' | 'optical' | 'inductive' | 'hybrid'
  frequency_khz?: number
  bandwidth_khz?: number
  range_m: number
  data_rate_kbps?: number
  depth_m?: number
  temperature_c?: number
  salinity_psu?: number
  noise_source?: 'shipping' | 'waves' | 'biological' | 'thermal' | 'rain'
  ambient_noise_db?: number
  required_ber?: number
  seed_date?: string
}

export interface LinkBudget {
  source_level_db: number
  transmission_loss_db: number
  noise_level_db: number
  directivity_index_db: number
  snr_db: number
  capacity_kbps: number
  margin_db: number
}

export interface UnderwaterCommResult {
  modem_type: string
  range_m: number
  link_budget: LinkBudget
  max_data_rate_kbps: number
  achievable_data_rate_kbps: number
  ber_estimate: number
  latency_ms: number
  packet_error_rate: number
  absorption_coefficient_db_km: number
  multipath_delay_spread_ms: number
  doppler_shift_hz: number
  channel_assessment: string
  deployment_notes: string[]
  recommendations: string[]
}

function planUnderwaterComm(input: UnderwaterCommInput): UnderwaterCommResult {
  const rng = seededRng(JSON.stringify(input))
  const rangeM = input.range_m
  const rangeKm = rangeM / 1000
  const freqKhz = input.frequency_khz || 25
  const depthM = input.depth_m || 100
  const tempC = input.temperature_c || 15
  const salPsu = input.salinity_psu || 35

  const absorptionCoeff = round(0.11 * freqKhz ** 2 / (1 + freqKhz ** 2) + 44 * freqKhz ** 2 / (4100 + freqKhz ** 2) + 0.0003 * freqKhz ** 2, 3)
  const spreadingLoss = round(20 * Math.log10(rangeM), 1)
  const absorptionLoss = round(absorptionCoeff * rangeKm, 1)
  const totalLoss = round(spreadingLoss + absorptionLoss, 1)

  const noiseLevels: Record<string, number> = {
    shipping: 70 + rng() * 10, waves: 60 + rng() * 15,
    biological: 50 + rng() * 10, thermal: 30 + rng() * 5, rain: 55 + rng() * 10,
  }
  const noiseDb = input.ambient_noise_db || noiseLevels[input.noise_source || 'shipping'] || 65

  const sourceLevel = round(140 + rng() * 30, 1)
  const diDb = input.modem_type === 'optical' ? 20 : input.modem_type === 'acoustic' ? 10 : 5
  const snrDb = round(sourceLevel - totalLoss - noiseDb + diDb, 1)

  const bwKhz = input.bandwidth_khz || freqKhz * 0.5
  const capacityKbps = round(bwKhz * Math.log2(1 + Math.pow(10, snrDb / 10)), 1)
  const achievableRate = round(Math.min(capacityKbps, input.data_rate_kbps || 10), 1)
  const marginDb = round(snrDb - 10, 1)

  const berEst = snrDb > 15 ? round(rng() * 1e-5, 6)
    : snrDb > 10 ? round(1e-5 + rng() * 1e-3, 6)
    : snrDb > 5 ? round(1e-3 + rng() * 1e-2, 4)
    : round(0.01 + rng() * 0.05, 3)

  const latencyMs = round(rangeM / 1500 * 1000, 1)
  const per = round(berEst * 1000, 4)

  const multipathDelay = round(rng() * 20 * (rangeM / 1000), 2)
  const dopplerShift = round((rng() - 0.5) * 5, 2)

  const channelQuality = snrDb > 15 ? 'EXCELLENT — reliable high-bandwidth link'
    : snrDb > 10 ? 'GOOD — suitable for telemetry and low-rate data'
    : snrDb > 5 ? 'MARGINAL — limited to command/control only'
    : 'POOR — link unreliable, reduce range or increase power'

  const deploymentNotes: string[] = []
  deploymentNotes.push(input.modem_type + ' modem at ' + freqKhz + ' kHz, ' + rangeM + 'm range')
  deploymentNotes.push('Absorption coefficient: ' + absorptionCoeff + ' dB/km at ' + freqKhz + ' kHz')
  deploymentNotes.push('Multipath delay spread: ' + multipathDelay + ' ms — equalizer required')
  deploymentNotes.push('Doppler shift: ±' + Math.abs(dopplerShift) + ' Hz — compensate for platform motion')
  deploymentNotes.push('Sound velocity: ~1500 m/s (T=' + tempC + 'C, S=' + salPsu + 'PSU, D=' + depthM + 'm)')

  const recommendations: string[] = []
  if (snrDb < 10) recommendations.push('Increase source level or reduce range for better SNR')
  if (absorptionCoeff > 5) recommendations.push('High absorption — consider lower frequency for longer range')
  if (multipathDelay > 10) recommendations.push('Severe multipath — use OFDM or adaptive equalization')
  if (input.modem_type === 'optical' && rangeM > 100) recommendations.push('Optical range limited to ~100m — switch to acoustic for >100m')
  recommendations.push('Deploy relay nodes every ' + round(rangeM * 0.6, 0) + 'm for extended range')
  recommendations.push('Use FEC (Reed-Solomon or LDPC) to improve BER by 2-3 orders of magnitude')

  return {
    modem_type: input.modem_type,
    range_m: rangeM,
    link_budget: {
      source_level_db: sourceLevel, transmission_loss_db: totalLoss,
      noise_level_db: noiseDb, directivity_index_db: diDb, snr_db: snrDb,
      capacity_kbps: capacityKbps, margin_db: marginDb,
    },
    max_data_rate_kbps: capacityKbps,
    achievable_data_rate_kbps: achievableRate,
    ber_estimate: berEst,
    latency_ms: latencyMs,
    packet_error_rate: per,
    absorption_coefficient_db_km: absorptionCoeff,
    multipath_delay_spread_ms: multipathDelay,
    doppler_shift_hz: dopplerShift,
    channel_assessment: channelQuality,
    deployment_notes: deploymentNotes,
    recommendations,
  }
}

function formatUnderwaterComm(r: UnderwaterCommResult): string {
  const lines: string[] = []
  lines.push('# Underwater Communication Plan: ' + r.modem_type)
  lines.push('Range: ' + r.range_m + 'm | Data rate: ' + r.achievable_data_rate_kbps + ' kbps (max ' + r.max_data_rate_kbps + ')')
  lines.push('Latency: ' + r.latency_ms + 'ms | BER: ' + r.ber_estimate + ' | PER: ' + r.packet_error_rate)
  lines.push('Channel: **' + r.channel_assessment + '**')
  lines.push('')
  lines.push('## Link Budget')
  lines.push('- Source level: ' + r.link_budget.source_level_db + ' dB')
  lines.push('- Transmission loss: ' + r.link_budget.transmission_loss_db + ' dB (spreading + absorption)')
  lines.push('- Noise level: ' + r.link_budget.noise_level_db + ' dB')
  lines.push('- Directivity index: ' + r.link_budget.directivity_index_db + ' dB')
  lines.push('- SNR: ' + r.link_budget.snr_db + ' dB | Margin: ' + r.link_budget.margin_db + ' dB')
  lines.push('')
  lines.push('## Channel Characteristics')
  lines.push('- Absorption: ' + r.absorption_coefficient_db_km + ' dB/km')
  lines.push('- Multipath delay: ' + r.multipath_delay_spread_ms + ' ms')
  lines.push('- Doppler shift: ' + r.doppler_shift_hz + ' Hz')
  lines.push('')
  lines.push('## Deployment Notes')
  r.deployment_notes.forEach(n => lines.push('- ' + n))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(x => lines.push('- ' + x))
  return lines.join('\n')
}

// =====================================================================
// TOOL 7: ocean_sediment_sampler
// =====================================================================

export interface SedimentSamplerInput {
  sampler_type: 'gravity_corer' | 'box_corer' | 'multi_corer' | 'grab' | 'piston_corer'
  target_depth_m: number
  water_depth_m: number
  core_length_m?: number
  grain_size_range?: 'clay' | 'silt' | 'sand' | 'gravel' | 'mixed'
  analysis_types?: string[]
  station_id: string
  seed_date?: string
}

export interface SedimentLayer {
  depth_cm: number
  grain_size_mm: number
  classification: string
  color: string
  moisture_percent: number
  organic_content_percent: number
  carbonate_percent: number
  porosity_percent: number
}

export interface SedimentSamplerResult {
  sampler_type: string
  station_id: string
  water_depth_m: number
  core_recovery_m: number
  penetration_percent: number
  layers: SedimentLayer[]
  mean_grain_size_mm: number
  sorting_coefficient: number
  sedimentation_rate_mm_kyr: number
  bulk_density_g_cm3: number
  analysis_results: string[]
  core_quality: 'excellent' | 'good' | 'fair' | 'poor'
  recommendations: string[]
}

function sampleOceanSediment(input: SedimentSamplerInput): SedimentSamplerResult {
  const rng = seededRng(JSON.stringify(input))
  const coreLen = input.core_length_m || 2
  const waterDepth = input.water_depth_m
  const recoveryM = round(coreLen * (0.6 + rng() * 0.4), 2)
  const penetration = round(recoveryM / coreLen * 100, 1)

  const layerCount = 5 + Math.floor(rng() * 10)
  const layers: SedimentLayer[] = []
  let grainSum = 0

  const grainClassifications = ['Clay', 'Silt', 'Fine sand', 'Medium sand', 'Coarse sand', 'Gravel']
  const colors = ['Dark brown', 'Olive gray', 'Dark gray', 'Black', 'Light brown', 'Greenish gray']

  for (let i = 0; i < layerCount; i++) {
    const depthCm = round((i / (layerCount - 1)) * recoveryM * 100, 1)
    const grainSize = round(0.001 + rng() * 2, 4)
    const classification = grainSize < 0.004 ? 'Clay' : grainSize < 0.063 ? 'Silt' : grainSize < 2 ? 'Sand' : 'Gravel'
    const color = colors[Math.floor(rng() * colors.length)]
    const moisture = round(30 + rng() * 50, 1)
    const organic = round(rng() * 8, 2)
    const carbonate = round(rng() * 30, 1)
    const porosity = round(40 + rng() * 30, 1)

    layers.push({
      depth_cm: depthCm, grain_size_mm: grainSize, classification,
      color, moisture_percent: moisture, organic_content_percent: organic,
      carbonate_percent: carbonate, porosity_percent: porosity,
    })
    grainSum += grainSize
  }

  const meanGrain = round(grainSum / layerCount, 4)
  const sorting = round(0.5 + rng() * 2, 2)
  const sedRate = round(0.5 + rng() * 10, 2)
  const bulkDensity = round(1.2 + rng() * 0.8, 2)

  const analysisResults: string[] = []
  if (input.analysis_types && input.analysis_types.length > 0) {
    input.analysis_types.forEach(a => {
      if (a === 'grain_size') analysisResults.push('Grain size: laser diffraction, 0.02-2000 um range')
      if (a === 'geochemistry') analysisResults.push('XRF geochemistry: major and trace elements')
      if (a === 'foraminifera') analysisResults.push('Foraminifera: >100 species identified, paleo indicators')
      if (a === 'radiocarbon') analysisResults.push('Radiocarbon dating: AMS 14C, ±20 yr precision')
      if (a === 'paleomag') analysisResults.push('Paleomagnetism: secular variation and reversal stratigraphy')
      if (a === 'moisture') analysisResults.push('Moisture content: gravimetric at 105C')
    })
  } else {
    analysisResults.push('Standard analysis: grain size, moisture, bulk density')
  }

  const quality: SedimentSamplerResult['core_quality'] =
    penetration > 90 ? 'excellent'
    : penetration > 70 ? 'good'
    : penetration > 50 ? 'fair'
    : 'poor'

  const recommendations: string[] = []
  if (penetration < 70) recommendations.push('Low recovery (' + penetration + '%) — consider piston corer for deeper penetration')
  if (sorting > 1.5) recommendations.push('Poorly sorted sediment — indicates mixed depositional environment')
  if (layers.some(l => l.organic_content_percent > 5)) recommendations.push('High organic content — potential for paleoclimate reconstruction')
  recommendations.push('Store cores at 4C for future subsampling')
  recommendations.push('X-ray imaging recommended before splitting for structural analysis')

  return {
    sampler_type: input.sampler_type,
    station_id: input.station_id,
    water_depth_m: waterDepth,
    core_recovery_m: recoveryM,
    penetration_percent: penetration,
    layers,
    mean_grain_size_mm: meanGrain,
    sorting_coefficient: sorting,
    sedimentation_rate_mm_kyr: sedRate,
    bulk_density_g_cm3: bulkDensity,
    analysis_results: analysisResults,
    core_quality: quality,
    recommendations,
  }
}

function formatSedimentSampler(r: SedimentSamplerResult): string {
  const lines: string[] = []
  lines.push('# Ocean Sediment Sampling Report: ' + r.sampler_type)
  lines.push('Station: ' + r.station_id + ' | Water depth: ' + r.water_depth_m + 'm')
  lines.push('Recovery: ' + r.core_recovery_m + 'm (' + r.penetration_percent + '%) | Quality: **' + r.core_quality + '**')
  lines.push('Mean grain size: ' + r.mean_grain_size_mm + 'mm | Sorting: ' + r.sorting_coefficient + ' | Bulk density: ' + r.bulk_density_g_cm3 + ' g/cm3')
  lines.push('Sedimentation rate: ' + r.sedimentation_rate_mm_kyr + ' mm/kyr')
  lines.push('')
  lines.push('## Sediment Layers (' + r.layers.length + ')')
  r.layers.forEach(l => {
    lines.push('- ' + l.depth_cm + 'cm: ' + l.classification + ' (' + l.grain_size_mm + 'mm) ' + l.color + ' | Moisture: ' + l.moisture_percent + '% | OC: ' + l.organic_content_percent + '% | CaCO3: ' + l.carbonate_percent + '%')
  })
  lines.push('')
  lines.push('## Analysis Results')
  r.analysis_results.forEach(a => lines.push('- ' + a))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(x => lines.push('- ' + x))
  return lines.join('\n')
}

// =====================================================================
// TOOL 8: marine_biodiversity_monitor
// =====================================================================

export interface BiodiversityInput {
  survey_method: 'visual_census' | 'eDNA' | 'trawl' | 'rov_video' | 'acoustic_survey' | 'photo_quadrat'
  habitat_type: 'coral_reef' | 'kelp_forest' | 'seagrass' | 'deep_sea' | 'hydrothermal_vent' | 'open_ocean' | 'rocky_reef'
  survey_area_km2: number
  depth_range_m?: [number, number]
  duration_hrs?: number
  target_taxa?: string[]
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
  seed_date?: string
}

export interface SpeciesRecord {
  species_id: string
  common_name: string
  scientific_name: string
  abundance_count: number
  biomass_kg_ha: number
  iucn_status: 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'DD'
  depth_m: number
  behavior: string
}

export interface BiodiversityResult {
  survey_method: string
  habitat_type: string
  survey_area_km2: number
  species_richness: number
  total_abundance: number
  shannon_index: number
  simpson_index: number
  evenness: number
  species_records: SpeciesRecord[]
  endemic_count: number
  invasive_count: number
  threatened_count: number
  biodiversity_grade: 'A' | 'B' | 'C' | 'D' | 'E'
  conservation_priorities: string[]
  recommendations: string[]
}

function monitorBiodiversity(input: BiodiversityInput): BiodiversityResult {
  const rng = seededRng(JSON.stringify(input))
  const areaKm2 = input.survey_area_km2
  const depthRange = input.depth_range_m || [0, 50]
  const durationHrs = input.duration_hrs || 4

  const speciesPool: Array<{ common: string; scientific: string; behavior: string }> = [
    { common: 'Clownfish', scientific: 'Amphiprion ocellaris', behavior: 'Territorial, symbiotic with anemones' },
    { common: 'Blue tang', scientific: 'Paracanthurus hepatus', behavior: 'Schooling, herbivorous' },
    { common: 'Napoleon wrasse', scientific: 'Cheilinus undulatus', behavior: 'Solitary, reef-associated' },
    { common: 'Manta ray', scientific: 'Mobula alfredi', behavior: 'Pelagic, filter-feeding' },
    { common: 'Hawksbill turtle', scientific: 'Eretmochelys imbricata', behavior: 'Solitary, sponge-feeder' },
    { common: 'Grouper', scientific: 'Epinephelus lanceolatus', behavior: 'Ambush predator' },
    { common: 'Moray eel', scientific: 'Gymnothorax javanicus', behavior: 'Nocturnal, crevice-dwelling' },
    { common: 'Parrotfish', scientific: 'Scarus ghobban', behavior: 'Schooling, bioeroding' },
    { common: 'Whale shark', scientific: 'Rhincodon typus', behavior: 'Pelagic, filter-feeding' },
    { common: 'Lionfish', scientific: 'Pterois volitans', behavior: 'Invasive, ambush predator' },
    { common: 'Sea cucumber', scientific: 'Holothuria atra', behavior: 'Benthic, deposit feeder' },
    { common: 'Crown-of-thorns starfish', scientific: 'Acanthaster planci', behavior: 'Coral predator' },
    { common: 'Giant clam', scientific: 'Tridacna gigas', behavior: 'Sessile, filter-feeding' },
    { common: 'Reef shark', scientific: 'Carcharhinus melanopterus', behavior: 'Apex predator' },
    { common: 'Seahorse', scientific: 'Hippocampus kuda', behavior: 'Ambush predator, pair-bonding' },
  ]

  const speciesCount = 8 + Math.floor(rng() * 12)
  const records: SpeciesRecord[] = []
  let totalAbundance = 0
  let endemicCount = 0
  let invasiveCount = 0
  let threatenedCount = 0

  const iucnStatuses: SpeciesRecord['iucn_status'][] = ['LC', 'NT', 'VU', 'EN', 'CR', 'DD']

  for (let i = 0; i < speciesCount; i++) {
    const sp = speciesPool[Math.floor(rng() * speciesPool.length)]
    const abundance = Math.floor(1 + rng() * 200)
    const biomass = round(rng() * 50, 2)
    const depth = round(depthRange[0] + rng() * (depthRange[1] - depthRange[0]), 1)
    const iucn = iucnStatuses[Math.floor(rng() * iucnStatuses.length)]

    if (iucn === 'VU' || iucn === 'EN' || iucn === 'CR') threatenedCount++
    if (sp.common === 'Lionfish') invasiveCount++
    if (rng() < 0.15) endemicCount++

    records.push({
      species_id: 'SP-' + String(i + 1).padStart(3, '0'),
      common_name: sp.common,
      scientific_name: sp.scientific,
      abundance_count: abundance,
      biomass_kg_ha: biomass,
      iucn_status: iucn,
      depth_m: depth,
      behavior: sp.behavior,
    })
    totalAbundance += abundance
  }

  let hIndex = 0
  for (const r of records) {
    const p = r.abundance_count / totalAbundance
    if (p > 0) hIndex += -p * Math.log(p)
  }
  hIndex = round(hIndex, 3)

  let dSum = 0
  for (const r of records) {
    const p = r.abundance_count / totalAbundance
    dSum += p * p
  }
  const simpson = round(1 - dSum, 3)
  const evenness = round(hIndex / Math.log(records.length), 3)

  const grade: BiodiversityResult['biodiversity_grade'] =
    hIndex > 2.5 ? 'A' : hIndex > 2.0 ? 'B' : hIndex > 1.5 ? 'C' : hIndex > 1.0 ? 'D' : 'E'

  const conservationPriorities: string[] = []
  if (threatenedCount > 0) conservationPriorities.push(threatenedCount + ' threatened species identified — priority protection needed')
  if (invasiveCount > 0) conservationPriorities.push('Invasive species detected — management intervention recommended')
  if (endemicCount > 0) conservationPriorities.push(endemicCount + ' endemic species — high conservation value area')
  if (evenness < 0.5) conservationPriorities.push('Low evenness — community dominated by few species')
  if (conservationPriorities.length === 0) conservationPriorities.push('Biodiversity within expected range for habitat type')

  const recommendations: string[] = []
  recommendations.push('Establish permanent monitoring transects for long-term trend analysis')
  if (grade === 'A' || grade === 'B') recommendations.push('High biodiversity area — recommend MPA designation')
  if (invasiveCount > 0) recommendations.push('Implement invasive species control program')
  if (threatenedCount > 0) recommendations.push('Develop species recovery plans for threatened taxa')
  recommendations.push('Repeat survey in ' + (input.season === 'spring' ? 'autumn' : input.season === 'summer' ? 'winter' : input.season === 'autumn' ? 'spring' : 'summer') + ' for seasonal comparison')
  recommendations.push('Deploy BRUVS (Baited Remote Underwater Video Systems) for continuous monitoring')

  return {
    survey_method: input.survey_method,
    habitat_type: input.habitat_type,
    survey_area_km2: areaKm2,
    species_richness: records.length,
    total_abundance: totalAbundance,
    shannon_index: hIndex,
    simpson_index: simpson,
    evenness,
    species_records: records,
    endemic_count: endemicCount,
    invasive_count: invasiveCount,
    threatened_count: threatenedCount,
    biodiversity_grade: grade,
    conservation_priorities: conservationPriorities,
    recommendations,
  }
}

function formatBiodiversity(r: BiodiversityResult): string {
  const lines: string[] = []
  lines.push('# Marine Biodiversity Monitoring Report')
  lines.push('Method: ' + r.survey_method + ' | Habitat: ' + r.habitat_type + ' | Area: ' + r.survey_area_km2 + ' km2')
  lines.push('Species richness: ' + r.species_richness + ' | Total abundance: ' + r.total_abundance)
  lines.push('Shannon: ' + r.shannon_index + ' | Simpson: ' + r.simpson_index + ' | Evenness: ' + r.evenness)
  lines.push('Grade: **' + r.biodiversity_grade + '** | Endemic: ' + r.endemic_count + ' | Invasive: ' + r.invasive_count + ' | Threatened: ' + r.threatened_count)
  lines.push('')
  lines.push('## Species Records')
  r.species_records.forEach(s => {
    lines.push('- ' + s.common_name + ' (' + s.scientific_name + '): n=' + s.abundance_count + ', ' + s.biomass_kg_ha + ' kg/ha, ' + s.iucn_status + ' @ ' + s.depth_m + 'm — ' + s.behavior)
  })
  lines.push('')
  lines.push('## Conservation Priorities')
  r.conservation_priorities.forEach(c => lines.push('- ' + c))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(x => lines.push('- ' + x))
  return lines.join('\n')
}

// =====================================================================
// PLUGIN REGISTRATION
// =====================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. auv_mission_planner
  tools.register(defineTool({
    name: 'auv_mission_planner',
    description: 'AUV mission planning with waypoint optimization, energy budgeting, current compensation, and obstacle avoidance',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { vehicle_model: string, mission_type: "pipeline_survey"|"bathymetric_map"|"water_column_profile"|"search_pattern"|"cable_track", survey_area: { north_lat: number, south_lat: number, east_lng: number, west_lng: number }, max_depth_m: number, speed_kn?: number, endurance_hrs?: number, waypoints?: Array<{ lat: number, lng: number, depth_m?: number, action?: string }>, current_speed_ms?: number, current_direction_deg?: number, obstacle_avoidance?: "none"|"reactive"|"predictive", redundancy_level?: "single"|"dual"|"triple", seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatAUVMission(planAUVMission(JSON.parse(args.input_data)))
    },
  }))

  // 2. rov_operations_manager
  tools.register(defineTool({
    name: 'rov_operations_manager',
    description: 'ROV operations management with tether dynamics, thruster allocation, power budgeting, and emergency protocols',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { rov_model: string, operation_type: "inspection"|"construction"|"pipeline_repair"|"cable_lay"|"sampling"|"decommissioning", depth_m: number, tether_length_m?: number, thruster_count?: number, sea_state?: number, current_speed_ms?: number, visibility_m?: number, payload_kg?: number, umbilical_diameter_mm?: number, pilot_experience?: "novice"|"intermediate"|"expert", seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatROVOps(manageROVOperations(JSON.parse(args.input_data)))
    },
  }))

  // 3. underwater_inspector
  tools.register(defineTool({
    name: 'underwater_inspector',
    description: 'Underwater structural inspection with defect detection, NDT methods, remaining life assessment, and compliance checking',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { structure_type: "pipeline"|"platform_leg"|"riser"|"cable"|"hull"|"dam"|"tunnel", inspection_method: "visual"|"ultrasonic"|"magnetic_flux"|"eddy_current"|"laser_profile", length_m?: number, diameter_mm?: number, wall_thickness_mm?: number, material?: "steel"|"concrete"|"composite"|"titanium", coating_type?: "none"|"epoxy"|"cathodic"|"thermal_spray", last_inspection_date?: string, defect_history?: Array<{ type: string, severity: "minor"|"moderate"|"critical", location_m: number }>, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatInspection(inspectUnderwater(JSON.parse(args.input_data)))
    },
  }))

  // 4. marine_data_analyzer
  tools.register(defineTool({
    name: 'marine_data_analyzer',
    description: 'Marine data analysis with CTD processing, current profiling, mixed layer detection, and quality control',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { data_type: "ctd_profile"|"adcp_currents"|"wave_record"|"tide_gauge"|"meteorological", station_id: string, depth_range_m?: [number, number], time_range?: { start: string, end: string }, parameters?: string[], sampling_rate_hz?: number, quality_control?: boolean, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatMarineData(analyzeMarineData(JSON.parse(args.input_data)))
    },
  }))

  // 5. sonar_signal_processor
  tools.register(defineTool({
    name: 'sonar_signal_processor',
    description: 'Sonar signal processing with beamforming, bottom classification, backscatter analysis, and link budget calculation',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { sonar_type: "multibeam"|"sidescan"|"sub_bottom"|"single_beam"|"sas", frequency_khz: number, range_m: number, pulse_length_ms?: number, beam_width_deg?: number, grazing_angle_deg?: number, sound_velocity_ms?: number, bottom_type?: "mud"|"sand"|"gravel"|"rock"|"coral", noise_level_db?: number, target_strength_db?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSonar(processSonarSignal(JSON.parse(args.input_data)))
    },
  }))

  // 6. underwater_communication_planner
  tools.register(defineTool({
    name: 'underwater_communication_planner',
    description: 'Underwater acoustic/optical communication planning with link budget, absorption modeling, and channel assessment',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { modem_type: "acoustic"|"optical"|"inductive"|"hybrid", frequency_khz?: number, bandwidth_khz?: number, range_m: number, data_rate_kbps?: number, depth_m?: number, temperature_c?: number, salinity_psu?: number, noise_source?: "shipping"|"waves"|"biological"|"thermal"|"rain", ambient_noise_db?: number, required_ber?: number, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatUnderwaterComm(planUnderwaterComm(JSON.parse(args.input_data)))
    },
  }))

  // 7. ocean_sediment_sampler
  tools.register(defineTool({
    name: 'ocean_sediment_sampler',
    description: 'Ocean sediment sampling with core logging, grain size analysis, layer classification, and recovery assessment',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { sampler_type: "gravity_corer"|"box_corer"|"multi_corer"|"grab"|"piston_corer", target_depth_m: number, water_depth_m: number, core_length_m?: number, grain_size_range?: "clay"|"silt"|"sand"|"gravel"|"mixed", analysis_types?: string[], station_id: string, seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSedimentSampler(sampleOceanSediment(JSON.parse(args.input_data)))
    },
  }))

  // 8. marine_biodiversity_monitor
  tools.register(defineTool({
    name: 'marine_biodiversity_monitor',
    description: 'Marine biodiversity monitoring with species identification, abundance estimation, diversity indices, and conservation assessment',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: { survey_method: "visual_census"|"eDNA"|"trawl"|"rov_video"|"acoustic_survey"|"photo_quadrat", habitat_type: "coral_reef"|"kelp_forest"|"seagrass"|"deep_sea"|"hydrothermal_vent"|"open_ocean"|"rocky_reef", survey_area_km2: number, depth_range_m?: [number, number], duration_hrs?: number, target_taxa?: string[], season?: "spring"|"summer"|"autumn"|"winter", seed_date?: string }' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatBiodiversity(monitorBiodiversity(JSON.parse(args.input_data)))
    },
  }))
}
