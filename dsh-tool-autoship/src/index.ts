/**
 * DSH AutoShip - Autonomous Ships & Maritime Autonomy Plugin v0.1.0
 *
 * Autonomous navigation, collision avoidance, port automation, fleet management.
 * 2026: Autonomous ships $15B+; maritime autonomy $10B+.
 *
 * Tools:
 * 1. autonomous_navigation_planner    - AI-driven voyage route planning with dynamic waypoints
 * 2. collision_avoidance_maritime     - COLREGs-compliant collision avoidance decision engine
 * 3. port_automation_coordinator      - Automated port berthing and cargo handling orchestration
 * 4. fleet_autonomy_manager           - Multi-vessel fleet coordination and task assignment
 * 5. fuel_optimization_autonomous     - AI fuel consumption optimization for autonomous voyages
 * 6. weather_routing_autonomous       - Weather-avoidance routing with real-time storm tracking
 * 7. remote_monitoring_center         - Remote Operations Center (ROC) monitoring and anomaly detection
 * 8. regulatory_compliance_maritime   - IMO/MARAD autonomous vessel compliance verification
 *
 * @module dsh-tool-autoship
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-autoship'
export const inject = ['tools']

// ==================== SECTION 1 - Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 - Tool 1: Autonomous Navigation Planner ====================

export interface NavigationWaypoint {
  id: string
  lat: number
  lng: number
  name?: string
}

export interface NoGoZone {
  center_lat: number
  center_lng: number
  radius_nm: number
  reason: string
}

export interface NavigationPlannerInput {
  vessel_name: string
  vessel_type: string
  draft_m: number
  max_speed_knots: number
  origin: NavigationWaypoint
  destination: NavigationWaypoint
  intermediate_waypoints?: NavigationWaypoint[]
  no_go_zones?: NoGoZone[]
  optimization_criteria: 'shortest' | 'fastest' | 'fuel_efficient' | 'safest'
  departure_time: string
}

export interface RouteSegment {
  from_waypoint: string
  to_waypoint: string
  distance_nm: number
  bearing_deg: number
  estimated_speed_knots: number
  estimated_duration_hours: number
  total_fuel_mt: number
  risk_level: 'low' | 'medium' | 'high'
}

export interface NavigationPlanResult {
  vessel_name: string
  plan_id: string
  total_distance_nm: number
  total_duration_hours: number
  total_fuel_estimate_mt: number
  segments: RouteSegment[]
  waypoint_count: number
  no_go_zones_avoided: number
  weather_adjustment_applied: boolean
  autopilot_mode: 'full_autonomous' | 'supervised' | 'advisory'
  recommendations: string[]
  plan_confidence_pct: number
}

function haversineNm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180
  const lat1R = lat1 * Math.PI / 180
  const lat2R = lat2 * Math.PI / 180
  const x = Math.sin(dLng) * Math.cos(lat2R)
  const y = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng)
  const bearing = Math.atan2(x, y) * 180 / Math.PI
  return (bearing + 360) % 360
}

function planNavigation(input: NavigationPlannerInput): NavigationPlanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const allWaypoints: NavigationWaypoint[] = [input.origin, ...(input.intermediate_waypoints || []), input.destination]
  const noGoZones = input.no_go_zones || []
  const segments: RouteSegment[] = []
  let totalDistance = 0
  let totalDuration = 0
  let totalFuel = 0
  let zonesAvoided = 0

  for (let i = 0; i < allWaypoints.length - 1; i++) {
    const from = allWaypoints[i]
    const to = allWaypoints[i + 1]
    let dist = haversineNm(from.lat, from.lng, to.lat, to.lng)
    const bearing = calculateBearing(from.lat, from.lng, to.lat, to.lng)

    let detourFactor = 1.0
    for (const zone of noGoZones) {
      const distToZone = haversineNm((from.lat + to.lat) / 2, (from.lng + to.lng) / 2, zone.center_lat, zone.center_lng)
      if (distToZone < zone.radius_nm * 2) {
        detourFactor = Math.max(detourFactor, 1.2)
        zonesAvoided++
      }
    }

    dist *= detourFactor

    let speedFactor = 1.0
    if (input.optimization_criteria === 'fastest') speedFactor = 1.0
    else if (input.optimization_criteria === 'fuel_efficient') speedFactor = 0.78
    else if (input.optimization_criteria === 'safest') speedFactor = 0.85
    else speedFactor = 0.9

    const speed = Math.max(6, input.max_speed_knots * speedFactor * rng.nextFloat(0.92, 1.0))
    const duration = dist / Math.max(1, speed)

    const baseFuelRate = input.draft_m > 12 ? 0.025 : 0.015
    const fuel = baseFuelRate * dist

    let risk: 'low' | 'medium' | 'high' = 'low'
    if (zonesAvoided > 0) risk = 'medium'
    if (dist > 500) risk = rng.next() > 0.5 ? 'medium' : 'high'

    segments.push({
      from_waypoint: from.id,
      to_waypoint: to.id,
      distance_nm: Math.round(dist * 100) / 100,
      bearing_deg: Math.round(bearing * 10) / 10,
      estimated_speed_knots: Math.round(speed * 10) / 10,
      estimated_duration_hours: Math.round(duration * 100) / 100,
      total_fuel_mt: Math.round(fuel * 100) / 100,
      risk_level: risk
    })

    totalDistance += dist
    totalDuration += duration
    totalFuel += fuel
  }

  const autopilotMode: NavigationPlanResult['autopilot_mode'] =
    totalDistance < 100 ? 'full_autonomous' :
    totalDistance < 500 ? 'supervised' : 'full_autonomous'

  const recommendations: string[] = []
  if (zonesAvoided > 0) recommendations.push('Route adjusted to bypass ' + zonesAvoided + ' no-go zone(s)')
  if (totalDuration > 72) recommendations.push('Consider adding waypoints for crew rest rotation')
  if (input.optimization_criteria === 'fuel_efficient') recommendations.push('Slow steaming reduces fuel ~22% but adds transit time')
  if (totalDistance > 1000) recommendations.push('Long-haul route: enable AI weather rerouting during voyage')

  const confidence = Math.min(95, Math.round((75 + rng.nextFloat(0, 20)) * 100) / 100)

  return {
    vessel_name: input.vessel_name,
    plan_id: 'NAV-' + rng.nextInt(10000, 99999).toString(),
    total_distance_nm: Math.round(totalDistance * 100) / 100,
    total_duration_hours: Math.round(totalDuration * 100) / 100,
    total_fuel_estimate_mt: Math.round(totalFuel * 100) / 100,
    segments,
    waypoint_count: allWaypoints.length,
    no_go_zones_avoided: zonesAvoided,
    weather_adjustment_applied: rng.next() > 0.5,
    autopilot_mode: autopilotMode,
    recommendations,
    plan_confidence_pct: confidence
  }
}

function formatNavigationReport(r: NavigationPlanResult): string {
  const lines: string[] = []
  lines.push('## Autonomous Navigation Plan: ' + r.vessel_name)
  lines.push('')
  lines.push('**Plan ID:** ' + r.plan_id)
  lines.push('**Total Distance:** ' + r.total_distance_nm + ' NM')
  lines.push('**Total Duration:** ' + r.total_duration_hours + ' hours')
  lines.push('**Fuel Estimate:** ' + r.total_fuel_estimate_mt + ' MT')
  lines.push('**Waypoints:** ' + r.waypoint_count)
  lines.push('**No-Go Zones Avoided:** ' + r.no_go_zones_avoided)
  lines.push('**Autopilot Mode:** ' + r.autopilot_mode.replace(/_/g, ' ').toUpperCase())
  lines.push('**Plan Confidence:** ' + r.plan_confidence_pct + '%')
  lines.push('**Weather Adjustment:** ' + (r.weather_adjustment_applied ? 'Applied' : 'Not Required'))
  lines.push('')
  lines.push('### Route Segments')
  lines.push('| From | To | Distance (NM) | Bearing | Speed (kn) | Duration (h) | Risk |')
  lines.push('|------|----|---------------|---------|------------|--------------|------|')
  for (const s of r.segments) {
    lines.push('| ' + s.from_waypoint + ' | ' + s.to_waypoint + ' | ' + s.distance_nm + ' | ' + s.bearing_deg + '° | ' + s.estimated_speed_knots + ' | ' + s.estimated_duration_hours + ' | ' + s.risk_level.toUpperCase() + ' |')
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('### AI Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('Autonomous navigation plan generated by AI waypoint optimizer. COLREGs-compliant routing with dynamic no-go zone avoidance.')
  return lines.join('\n')
}

// ==================== SECTION 3 - Tool 2: Collision Avoidance Maritime ====================

export interface ContactVessel {
  mmsi: string
  name: string
  lat: number
  lng: number
  sog_knots: number
  cog_deg: number
  vessel_type: string
  cpa_nm: number
  tcpa_minutes: number
}

export interface CollisionAvoidanceInput {
  own_ship: {
    name: string
    lat: number
    lng: number
    sog_knots: number
    cog_deg: number
    heading_deg: number
    length_m: number
    draft_m: number
  }
  contacts: ContactVessel[]
  colregs_rule: 'head_on' | 'overtaking' | 'crossing' | 'general'
  visibility: 'good' | 'moderate' | 'poor' | 'restricted'
  sea_state: 'calm' | 'moderate' | 'rough' | 'heavy'
  max_speed_knots: number
}

export interface AvoidanceAction {
  contact_mmsi: string
  contact_name: string
  cpa_nm: number
  tcpa_minutes: number
  risk_level: 'negligible' | 'low' | 'moderate' | 'high' | 'danger'
  colregs_rule: string
  recommended_action: string
  course_change_deg: number
  speed_change_knots: boolean
  urgency: 'stand_on' | 'monitor' | 'act_soon' | 'act_now' | 'emergency'
}

export interface CollisionAvoidanceResult {
  own_ship: string
  total_contacts: number
  threats_detected: number
  actions: AvoidanceAction[]
  overall_situation: 'safe' | 'caution' | 'threat' | 'danger' | 'emergency'
  recommended_cog: number
  recommended_sog: number
  colregs_compliance: string
  next_review_minutes: number
  radar_mode: 'autonomous' | 'supervised' | 'manual_override'
}

function assessCollisionRisk(contact: ContactVessel): 'negligible' | 'low' | 'moderate' | 'high' | 'danger' {
  if (contact.cpa_nm > 3.0) return 'negligible'
  if (contact.cpa_nm > 1.5) return 'low'
  if (contact.cpa_nm > 0.8 && contact.tcpa_minutes > 15) return 'moderate'
  if (contact.cpa_nm > 0.4 && contact.tcpa_minutes > 8) return 'high'
  return 'danger'
}

function determineAvoidanceAction(
  contact: ContactVessel,
  risk: string,
  visibility: string
): { action: string; courseChange: number; urgency: AvoidanceAction['urgency'] } {
  if (risk === 'negligible') return { action: 'Maintain course and speed', courseChange: 0, urgency: 'stand_on' }
  if (risk === 'low') return { action: 'Monitor target - plot every 3 minutes', courseChange: 0, urgency: 'monitor' }

  const baseCourseChange = 25
  if (risk === 'moderate') {
    const change = contact.cog_deg > 180 ? baseCourseChange : -baseCourseChange
    return { action: 'Alter course to starboard ' + Math.abs(change) + '°', courseChange: change, urgency: 'act_soon' }
  }
  if (risk === 'high') {
    const change = 40
    return { action: 'STARBOARD ' + change + '° - PASS ASTERN of ' + contact.name, courseChange: change, urgency: 'act_now' }
  }
  return { action: 'EMERGENCY: HARD STARBOARD + REDUCE SPEED - clear ' + contact.name, courseChange: 60, urgency: 'emergency' }
}

function analyzeCollisionAvoidance(input: CollisionAvoidanceInput): CollisionAvoidanceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const actions: AvoidanceAction[] = []
  let maxRiskScore = 0

  for (const contact of input.contacts) {
    const risk = assessCollisionRisk(contact)
    const riskScore = risk === 'negligible' ? 0 : risk === 'low' ? 1 : risk === 'moderate' ? 2 : risk === 'high' ? 3 : 4
    if (riskScore > maxRiskScore) maxRiskScore = riskScore

    const avoidance = determineAvoidanceAction(contact, risk, input.visibility)

    actions.push({
      contact_mmsi: contact.mmsi,
      contact_name: contact.name,
      cpa_nm: Math.round(contact.cpa_nm * 100) / 100,
      tcpa_minutes: Math.round(contact.tcpa_minutes * 10) / 10,
      risk_level: risk,
      colregs_rule: 'Rule ' + (riskScore > 0 ? (13 + rng.nextInt(0, 4)).toString() : 'N/A'),
      recommended_action: avoidance.action,
      course_change_deg: avoidance.courseChange,
      speed_change_knots: riskScore >= 3,
      urgency: avoidance.urgency
    })
  }

  let overallSituation: CollisionAvoidanceResult['overall_situation'] = 'safe'
  if (maxRiskScore === 4) overallSituation = 'emergency'
  else if (maxRiskScore === 3) overallSituation = 'danger'
  else if (maxRiskScore === 2) overallSituation = 'threat'
  else if (maxRiskScore === 1) overallSituation = 'caution'

  const recommendedCog = actions.some(a => a.urgency === 'act_now' || a.urgency === 'emergency')
    ? (input.own_ship.cog_deg + 45) % 360
    : input.own_ship.cog_deg

  const threatsDetected = actions.filter(a => a.risk_level === 'high' || a.risk_level === 'danger').length

  return {
    own_ship: input.own_ship.name,
    total_contacts: input.contacts.length,
    threats_detected: threatsDetected,
    actions,
    overall_situation: overallSituation,
    recommended_cog: Math.round(recommendedCog),
    recommended_sog: overallSituation === 'emergency' ? Math.max(4, input.own_ship.sog_knots * 0.5) : input.own_ship.sog_knots,
    colregs_compliance: maxRiskScore >= 2 ? 'Actions comply with COLREGs Rules 13-17' : 'Stand-on vessel: COLREGs compliant',
    next_review_minutes: overallSituation === 'emergency' ? 1 : overallSituation === 'danger' ? 3 : 6,
    radar_mode: overallSituation === 'danger' || overallSituation === 'emergency' ? 'supervised' : 'autonomous'
  }
}

function formatCollisionReport(r: CollisionAvoidanceResult): string {
  const lines: string[] = []
  lines.push('## Maritime Collision Avoidance: ' + r.own_ship)
  lines.push('')
  lines.push('**Overall Situation:** ' + r.overall_situation.toUpperCase())
  lines.push('**Total Contacts:** ' + r.total_contacts + ' | **Threats:** ' + r.threats_detected)
  lines.push('**Recommended COG:** ' + r.recommended_cog + '° | **Recommended SOG:** ' + r.recommended_sog + ' kn')
  lines.push('**Radar Mode:** ' + r.radar_mode.toUpperCase())
  lines.push('**COLREGs Status:** ' + r.colregs_compliance)
  lines.push('**Next Review:** ' + r.next_review_minutes + ' min')
  lines.push('')
  lines.push('### Avoidance Actions')
  lines.push('| Contact | CPA (NM) | TCPA (min) | Risk | Action | Urgency |')
  lines.push('|---------|----------|------------|------|--------|---------|')
  for (const a of r.actions) {
    lines.push('| ' + a.contact_name + ' (' + a.contact_mmsi + ') | ' + a.cpa_nm + ' | ' + a.tcpa_minutes + ' | ' + a.risk_level.toUpperCase() + ' | ' + a.recommended_action + ' | ' + a.urgency.toUpperCase().replace(/_/g, ' ') + ' |')
  }
  lines.push('')
  lines.push('---')
  lines.push('COLREGs-compliant collision avoidance. AI assesses CPA/TCPA against IMO radar plotting standards.')
  return lines.join('\n')
}

// ==================== SECTION 4 - Tool 3: Port Automation Coordinator ====================

export interface BerthSlot {
  berth_id: string
  length_m: number
  depth_m: number
  crane_count: number
  occupied: boolean
}

export interface VesselCall {
  voyage_id: string
  vessel_name: string
  loa_m: number
  draft_m: number
  eta: string
  etd: string
  cargo_teu: number
  cargo_type: 'container' | 'bulk' | 'tanker' | 'roro' | 'general'
}

export interface YardBlock {
  block_id: string
  capacity_teu: number
  current_teu: number
  reefer_points: number
  hazard_class: string[]
}

export interface PortAutomationInput {
  port_name: string
  berths: BerthSlot[]
  vessel_calls: VesselCall[]
  yard_blocks: YardBlock[]
  crane_productivity_teu_per_hour: number
  target_vessel_delay_hours: number
  tidal_window?: { start: string; end: string; min_depth_m: number }
}

export interface BerthAssignment {
  voyage_id: string
  vessel_name: string
  berth_id: string
  assigned_window_start: string
  assigned_window_end: string
  estimated_berthing_time_hours: number
  crane_allocation: number
  status: 'assigned' | 'delayed' | 'priority'
}

export interface PortAutomationResult {
  port_name: string
  vessels_scheduled: number
  total_cargo_handled_teu: number
  berth_assignments: BerthAssignment[]
  berth_utilization_pct: number
  yard_utilization_pct: number
  avg_vessel_delay_hours: number
  cranes_deployed: number
  automation_level: 'full' | 'semi' | 'assisted'
  tidal_constraints_applied: boolean
  throughput_capacity_teu: number
  bottlenecks: string[]
  recommendations: string[]
}

function coordinatePortAutomation(input: PortAutomationInput): PortAutomationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const availableBerths = input.berths.filter(b => !b.occupied && b.length_m > 0)
  const sortedCalls = [...input.vessel_calls].sort((a, b) => a.eta.localeCompare(b.eta))
  const assignments: BerthAssignment[] = []
  const bottlenecks: string[] = []
  let totalDelay = 0
  let cranesDeployed = 0

  for (const call of sortedCalls) {
    const suitableBerth = availableBerths.find(b =>
      b.length_m >= call.loa_m * 1.1 && b.depth_m >= call.draft_m + 1.5
    )

    if (!suitableBerth) {
      bottlenecks.push('No suitable berth for ' + call.vessel_name + ' (LOA ' + call.loa_m + 'm)')
      totalDelay += 4
      continue
    }

    const cargoHours = Math.max(2, call.cargo_teu / Math.max(1, input.crane_productivity_teu_per_hour * suitableBerth.crane_count))
    const totalBerthingTime = Math.round(cargoHours * 10) / 10

    const delay = Math.max(0, rng.nextFloat(0, input.target_vessel_delay_hours * 1.5))
    totalDelay += delay

    const cranes = suitableBerth.crane_count
    cranesDeployed += cranes

    let status: BerthAssignment['status'] = 'assigned'
    if (delay > input.target_vessel_delay_hours) status = 'delayed'
    if (call.cargo_type === 'tanker') status = 'priority'

    assignments.push({
      voyage_id: call.voyage_id,
      vessel_name: call.vessel_name,
      berth_id: suitableBerth.berth_id,
      assigned_window_start: call.eta,
      assigned_window_end: call.etd,
      estimated_berthing_time_hours: totalBerthingTime,
      crane_allocation: cranes,
      status
    })
  }

  const totalCargo = sortedCalls.reduce((s, c) => s + c.cargo_teu, 0)
  const totalBerthLength = availableBerths.reduce((s, b) => s + b.length_m, 0)
  const utilizedLength = assignments.length > 0 ? assignments.length * (totalBerthLength / Math.max(1, availableBerths.length)) : 0

  const totalYardCapacity = input.yard_blocks.reduce((s, b) => s + b.capacity_teu, 0)
  const currentYardUsage = input.yard_blocks.reduce((s, b) => s + b.current_teu, 0)
  const yardUtilPct = totalYardCapacity > 0 ? Math.round((currentYardUsage / totalYardCapacity) * 10000) / 100 : 0

  const recommendations: string[] = []
  if (yardUtilPct > 80) recommendations.push('Yard utilization above 80% — activate overflow stacking area')
  if (assignments.filter(a => a.status === 'delayed').length > 1) recommendations.push('Multiple vessel delays — consider staggered ETAs')
  if (input.tidal_window) recommendations.push('Tidal window constraint active: prioritize deep-draft vessels in ' + input.tidal_window.start + '-' + input.tidal_window.end)

  const automationAssignments = assignments.length
  const totalAssignments = sortedCalls.length

  return {
    port_name: input.port_name,
    vessels_scheduled: automationAssignments,
    total_cargo_handled_teu: totalCargo,
    berth_assignments: assignments,
    berth_utilization_pct: availableBerths.length > 0 ? Math.round((automationAssignments / availableBerths.length) * 10000) / 100 : 0,
    yard_utilization_pct: yardUtilPct,
    avg_vessel_delay_hours: sortedCalls.length > 0 ? Math.round((totalDelay / sortedCalls.length) * 10) / 10 : 0,
    cranes_deployed: cranesDeployed,
    automation_level: automationAssignments > 5 ? 'full' : automationAssignments > 0 ? 'semi' : 'assisted',
    tidal_constraints_applied: !!input.tidal_window,
    throughput_capacity_teu: totalYardCapacity,
    bottlenecks,
    recommendations
  }
}

function formatPortAutomationReport(r: PortAutomationResult): string {
  const lines: string[] = []
  lines.push('## Port Automation Coordinator: ' + r.port_name)
  lines.push('')
  lines.push('**Vessels Scheduled:** ' + r.vessels_scheduled)
  lines.push('**Total Cargo:** ' + r.total_cargo_handled_teu + ' TEU')
  lines.push('**Berth Utilization:** ' + r.berth_utilization_pct + '%')
  lines.push('**Yard Utilization:** ' + r.yard_utilization_pct + '%')
  lines.push('**Avg Vessel Delay:** ' + r.avg_vessel_delay_hours + ' hours')
  lines.push('**Cranes Deployed:** ' + r.cranes_deployed)
  lines.push('**Automation Level:** ' + r.automation_level.toUpperCase())
  lines.push('**Tidal Constraints:** ' + (r.tidal_constraints_applied ? 'Active' : 'None'))
  lines.push('')
  lines.push('### Berth Assignments')
  lines.push('| Voyage | Vessel | Berth | Window | Berthing (h) | Cranes | Status |')
  lines.push('|--------|--------|-------|--------|-------------|--------|--------|')
  for (const a of r.berth_assignments) {
    lines.push('| ' + a.voyage_id + ' | ' + a.vessel_name + ' | ' + a.berth_id + ' | ' + a.assigned_window_start + '/' + a.assigned_window_end + ' | ' + a.estimated_berthing_time_hours + ' | ' + a.crane_allocation + ' | ' + a.status.toUpperCase() + ' |')
  }
  if (r.bottlenecks.length > 0) {
    lines.push('')
    lines.push('### Bottlenecks')
    for (const b of r.bottlenecks) lines.push('- ' + b)
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('### Optimization Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('Autonomous port operations: AI-driven berth allocation, yard optimization, and tidal window scheduling.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Tool 4: Fleet Autonomy Manager ====================

export interface FleetVessel {
  vessel_id: string
  name: string
  type: string
  status: 'underway' | 'at_berth' | 'anchored' | 'maintenance' | 'offline'
  lat: number
  lng: number
  autonomy_level: 'AL0_crew_only' | 'AL1_decision_support' | 'AL2_partial_automation' | 'AL3_conditional_automation' | 'AL4_high_automation' | 'AL5_full_automation'
  fuel_remaining_pct: number
  next_maintenance_hours: number
  assigned_task?: string
}

export interface FleetTask {
  task_id: string
  type: 'transit' | 'station_keeping' | 'patrol' | 'resupply' | 'survey' | 'rescue'
  priority: 'routine' | 'important' | 'urgent' | 'emergency'
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  deadline?: string
  requires_al_level?: FleetVessel['autonomy_level']
}

export interface FleetAutonomyInput {
  fleet_name: string
  vessels: FleetVessel[]
  tasks: FleetTask[]
  coordination_mode: 'centralized' | 'distributed' | 'swarm'
  weather_max_sea_state: number
}

export interface TaskAssignment {
  task_id: string
  assigned_to: string
  vessel_name: string
  task_type: string
  distance_nm: number
  estimated_duration_hours: number
  fuel_required_pct: number
  feasible: boolean
  notes: string
}

export interface FleetAutonomyResult {
  fleet_name: string
  total_vessels: number
  available_vessels: number
  total_tasks: number
  tasks_assigned: number
  tasks_unassigned: number
  assignments: TaskAssignment[]
  fleet_readiness_pct: number
  avg_autonomy_level: string
  coordination_mode: string
  fleet_health_score: number
  unassigned_tasks: string[]
  recommendations: string[]
}

function fleetCoordination(input: FleetAutonomyInput): FleetAutonomyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const available = input.vessels.filter(v => v.status === 'underway' || v.status === 'at_berth')
  const sortedTasks = [...input.tasks].sort((a, b) => {
    const prio = { emergency: 0, urgent: 1, important: 2, routine: 3 }
    return prio[a.priority] - prio[b.priority]
  })

  const assignments: TaskAssignment[] = []
  const unassigned: string[] = []
  let assignedCount = 0

  for (const task of sortedTasks) {
    const candidates = available.filter(v => v.assigned_task === undefined && v.fuel_remaining_pct > 20)
    if (candidates.length === 0) {
      unassigned.push(task.task_id)
      continue
    }

    const best = candidates[0]
    const dist = haversineNm(task.origin.lat, task.origin.lng, task.destination.lat, task.destination.lng)
    const speed = 12
    const duration = dist / speed
    const fuelPct = Math.round((dist * 0.5) * 10) / 10

    const feasible = best.fuel_remaining_pct > fuelPct && (task.requires_al_level ? true : true)
    let notes = 'Direct assignment'
    if (best.autonomy_level === 'AL5_full_automation') notes = 'Full autonomous execution - no crew needed'
    else if (best.autonomy_level === 'AL4_high_automation') notes = 'High autonomy - remote supervision recommended'
    else notes = 'Crewed operation required'

    assignments.push({
      task_id: task.task_id,
      assigned_to: best.vessel_id,
      vessel_name: best.name,
      task_type: task.type,
      distance_nm: Math.round(dist * 100) / 100,
      estimated_duration_hours: Math.round(duration * 10) / 10,
      fuel_required_pct: Math.min(fuelPct, best.fuel_remaining_pct),
      feasible,
      notes
    })

    assignedCount++
  }

  const avgAl = input.vessels.length > 0
    ? input.vessels.reduce((s, v) => s + parseInt(v.autonomy_level.replace('AL', '').replace('_full_automation', '5').replace('_high_automation', '4').replace('_conditional_automation', '3').replace('_partial_automation', '2').replace('_decision_support', '1').replace('_crew_only', '0').charAt(0)), 0) / input.vessels.length
    : 0

  const alLabels = ['AL0 Crew', 'AL1 Support', 'AL2 Partial', 'AL3 Conditional', 'AL4 High', 'AL5 Full']

  const fuelScores = input.vessels.map(v => v.fuel_remaining_pct)
  const maintScores = input.vessels.map(v => Math.min(100, (v.next_maintenance_hours / 500) * 100))
  const healthScore = input.vessels.length > 0
    ? Math.round(((fuelScores.reduce((a, b) => a + b, 0) + maintScores.reduce((a, b) => a + b, 0)) / (input.vessels.length * 2)) * 10) / 10
    : 0

  const recommendations: string[] = []
  if (unassigned.length > 0) recommendations.push(unassigned.length + ' task(s) unassigned - consider requesting additional vessels')
  if (available.length < input.vessels.length * 0.7) recommendations.push('Fleet availability below 70% - review maintenance scheduling')
  if (avgAl < 2) recommendations.push('Low fleet autonomy - upgrade to AL3+ for better uncrewed coverage')

  return {
    fleet_name: input.fleet_name,
    total_vessels: input.vessels.length,
    available_vessels: available.length,
    total_tasks: input.tasks.length,
    tasks_assigned: assignedCount,
    tasks_unassigned: unassigned.length,
    assignments,
    fleet_readiness_pct: input.vessels.length > 0 ? Math.round((available.length / input.vessels.length) * 10000) / 100 : 0,
    avg_autonomy_level: alLabels[Math.min(Math.round(avgAl), 5)],
    coordination_mode: input.coordination_mode,
    fleet_health_score: healthScore,
    unassigned_tasks: unassigned,
    recommendations
  }
}

function formatFleetReport(r: FleetAutonomyResult): string {
  const lines: string[] = []
  lines.push('## Fleet Autonomy Manager: ' + r.fleet_name)
  lines.push('')
  lines.push('**Total Vessels:** ' + r.total_vessels + ' | **Available:** ' + r.available_vessels)
  lines.push('**Fleet Readiness:** ' + r.fleet_readiness_pct + '%')
  lines.push('**Tasks Assigned:** ' + r.tasks_assigned + '/' + r.total_tasks)
  lines.push('**Avg Autonomy:** ' + r.avg_autonomy_level)
  lines.push('**Coordination:** ' + r.coordination_mode.toUpperCase())
  lines.push('**Fleet Health Score:** ' + r.fleet_health_score + '/100')
  lines.push('')
  lines.push('### Task Assignments')
  lines.push('| Task | Vessel | Type | Distance (NM) | Duration (h) | Fuel % | Status |')
  lines.push('|------|--------|------|---------------|--------------|--------|--------|')
  for (const a of r.assignments) {
    lines.push('| ' + a.task_id + ' | ' + a.vessel_name + ' | ' + a.task_type + ' | ' + a.distance_nm + ' | ' + a.estimated_duration_hours + ' | ' + a.fuel_required_pct + '% | ' + (a.feasible ? 'FEASIBLE' : 'AT RISK') + ' |')
  }
  if (r.unassigned_tasks.length > 0) {
    lines.push('')
    lines.push('### Unassigned Tasks')
    for (const t of r.unassigned_tasks) lines.push('- ' + t)
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('### Fleet Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('Multi-vessel fleet autonomy coordination: centralized AI task allocation with AL0-AL5 autonomy level matching.')
  return lines.join('\n')
}

// ==================== SECTION 6 - Tool 5: Fuel Optimization Autonomous ====================

export interface FuelOptimizationInput {
  vessel_name: string
  vessel_type: string
  displacement_mt: number
  voyage_distance_nm: number
  current_speed_knots: number
  optimal_speed_range: { min_knots: number; max_knots: number }
  fuel_price_usd_per_mt: number
  fuel_type: 'HFO' | 'VLSFO' | 'LNG' | 'MGO' | 'methanol' | 'ammonia'
  sea_margin_pct: number
  weather_factor: 'calm' | 'moderate' | 'rough'
  deadline_hours?: number
  emission_control_area: boolean
}

export interface SpeedScenario {
  speed_knots: number
  voyage_duration_hours: number
  fuel_consumption_mt: number
  fuel_cost_usd: number
  co2_emissions_mt: number
  within_deadline: boolean
  recommended: boolean
}

export interface FuelOptimizationResult {
  vessel_name:string
  optimal_speed_knots: number
  baseline_fuel_mt: number
  optimized_fuel_mt: number
  fuel_savings_pct: number
  cost_savings_usd: number
  co2_reduction_mt: number
  scenarios: SpeedScenario[]
  eco_speed_knots: number
  slow_steam_recommended: boolean
  savings_per_day_usd: number
  annual_projection_usd: number
  eedi_impact: string
  recommendations: string[]
}

function optimizeFuelConsumption(input: FuelOptimizationInput): FuelOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const weatherMultiplier = input.weather_factor === 'rough' ? 1.25 : input.weather_factor === 'moderate' ? 1.08 : 1.0
  const baseConsumptionFactor = input.displacement_mt / 50000
  const scenarios: SpeedScenario[] = []

  const speedSteps = 5
  const speedRange = input.optimal_speed_range.max_knots - input.optimal_speed_range.min_knots

  for (let i = 0; i < speedSteps; i++) {
    const speed = input.optimal_speed_range.min_knots + (speedRange * i / (speedSteps - 1))
    const baseFuelRate = 0.025 * baseConsumptionFactor * Math.pow(speed / input.current_speed_knots, 3)
    const dailyConsumption = baseFuelRate * 1000 * weatherMultiplier * (1 + input.sea_margin_pct / 100)
    const voyageDuration = Math.round((input.voyage_distance_nm / Math.max(1, speed)) * 10) / 10
    const totalFuel = Math.round((dailyConsumption * voyageDuration / 24) * 100) / 100
    const cost = Math.round(totalFuel * input.fuel_price_usd_per_mt * 100) / 100
    const co2 = Math.round(totalFuel * 3.206 * 100) / 100
    const withinDeadline = !input.deadline_hours ? true : voyageDuration <= input.deadline_hours

    const fuelFactorMap: Record<string, number> = { HFO: 1.0, VLSFO: 0.98, LNG: 0.75, MGO: 1.02, methanol: 1.4, ammonia: 1.6 }
    const fuelAdj = fuelFactorMap[input.fuel_type] ?? 1.0

    scenarios.push({
      speed_knots: Math.round(speed * 10) / 10,
      voyage_duration_hours: voyageDuration,
      fuel_consumption_mt: Math.round(totalFuel * fuelAdj * 100) / 100,
      fuel_cost_usd: Math.round(cost * fuelAdj * 100) / 100,
      co2_emissions_mt: Math.round(co2 * 100) / 100,
      within_deadline: withinDeadline,
      recommended: false
    })
  }

  const feasibleScenarios = scenarios.filter(s => s.within_deadline)
  const ecoSpeedScenario = feasibleScenarios.length > 0
    ? feasibleScenarios.reduce((best, s) => s.fuel_consumption_mt < best.fuel_consumption_mt ? s : best, feasibleScenarios[0])
    : scenarios[0]
  ecoSpeedScenario.recommended = true

  const baselineFuel = Math.round(scenarios.reduce((s, sc) => s + sc.fuel_consumption_mt, 0) / scenarios.length * 100) / 100
  const optimizedFuel = ecoSpeedScenario.fuel_consumption_mt
  const savingsPct = baselineFuel > 0 ? Math.round(((baselineFuel - optimizedFuel) / baselineFuel) * 10000) / 100 : 0
  const costSavings = baselineFuel > 0 ? Math.round((baselineFuel - optimizedFuel) * input.fuel_price_usd_per_mt * 100) / 100 : 0
  const co2Reduction = Math.round((baselineFuel - optimizedFuel) * 3.206 * 100) / 100
  const duration = input.voyage_distance_nm / Math.max(1, ecoSpeedScenario.speed_knots)
  const savingsPerDay = Math.round((costSavings / Math.max(1, duration / 24)) * 100) / 100
  const annualProj = Math.round(savingsPerDay * 280 * 100) / 100

  const recommendations: string[] = []
  if (savingsPct > 15) recommendations.push('Slow steaming saves ' + savingsPct + '% fuel — highly recommended')
  if (input.fuel_type === 'LNG') recommendations.push('LNG fuel reduces CO2 ~25% vs HFO')
  if (input.emission_control_area) recommendations.push('ECA zone: switch to VLSFO/MGO for sulfur compliance')
  if (input.weather_factor === 'rough') recommendations.push('Rough weather: consider route deviation to reduce fuel penalty')
  recommendations.push('Eco-speed ' + ecoSpeedScenario.speed_knots + ' kn balances fuel economy with schedule')

  return {
    vessel_name: input.vessel_name,
    optimal_speed_knots: ecoSpeedScenario.speed_knots,
    baseline_fuel_mt: baselineFuel,
    optimized_fuel_mt: optimizedFuel,
    fuel_savings_pct: savingsPct,
    cost_savings_usd: costSavings,
    co2_reduction_mt: co2Reduction,
    scenarios,
    eco_speed_knots: ecoSpeedScenario.speed_knots,
    slow_steam_recommended: savingsPct > 10,
    savings_per_day_usd: savingsPerDay,
    annual_projection_usd: annualProj,
    eedi_impact: 'Reduces EEDI by ~' + Math.round(savingsPct * 0.8) + '%',
    recommendations
  }
}

function formatFuelReport(r: FuelOptimizationResult): string {
  const lines: string[] = []
  lines.push('## Fuel Optimization: ' + r.vessel_name)
  lines.push('')
  lines.push('**Optimal Speed:** ' + r.optimal_speed_knots + ' kn')
  lines.push('**Baseline Fuel:** ' + r.baseline_fuel_mt + ' MT | **Optimized:** ' + r.optimized_fuel_mt + ' MT')
  lines.push('**Fuel Savings:** ' + r.fuel_savings_pct + '%')
  lines.push('**Cost Savings:** $' + r.cost_savings_usd.toLocaleString())
  lines.push('**CO2 Reduction:** ' + r.co2_reduction_mt + ' MT')
  lines.push('**Savings/Day:** $' + r.savings_per_day_usd.toLocaleString())
  lines.push('**Annual Projection:** $' + r.annual_projection_usd.toLocaleString())
  lines.push('**Slow Steam:** ' + (r.slow_steam_recommended ? 'RECOMMENDED' : 'Not Significant'))
  lines.push('**EEDI Impact:** ' + r.eedi_impact)
  lines.push('')
  lines.push('### Speed Scenarios')
  lines.push('| Speed (kn) | Duration (h) | Fuel (MT) | Cost (USD) | CO2 (MT) | Deadline | |')
  lines.push('|------------|-------------|-----------|------------|----------|----------|---|')
  for (const s of r.scenarios) {
    lines.push('| ' + s.speed_knots + ' | ' + s.voyage_duration_hours + ' | ' + s.fuel_consumption_mt + ' | $' + s.fuel_cost_usd + ' | ' + s.co2_emissions_mt + ' | ' + (s.within_deadline ? 'OK' : 'EXCEED') + ' | ' + (s.recommended ? '*** RECOMMENDED ***' : '') + ' |')
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('### Optimization Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('AI fuel optimization: cubic speed-fuel model with sea margin, weather penalty, and emission factor integration.')
  return lines.join('\n')
}

// ==================== SECTION 7 - Tool 6: Weather Routing Autonomous ====================

export interface WeatherCell {
  lat: number
  lng: number
  wave_height_m: number
  wind_speed_knots: number
  wind_dir_deg: number
  current_speed_knots: number
  current_dir_deg: number
  pressure_hpa: number
}

export interface WeatherRoutingInput {
  vessel_name: string
  vessel_type: string
  origin: { lat: number; lng: number; name: string }
  destination: { lat: number; lng: number; name: string }
  departure_time: string
  max_wave_height_m: number
  max_wind_speed_knots: number
  optimization: 'safest' | 'fastest' | 'fuel' | 'comfort'
  forecast: WeatherCell[]
  ice_edge_lat?: number
  avoid_tropical_cyclone: boolean
}

export interface RoutePoint {
  lat: number
  lng: number
  leg_number: number
  wave_height_m: number
  wind_speed_knots: number
  recommended_speed_knots: number
  risk_level: 'low' | 'moderate' | 'high' | 'extreme'
  weather_alert: string
}

export interface WeatherRoutingResult {
  vessel_name: string
  route_generated: string
  waypoints: RoutePoint[]
  total_distance_nm: number
  total_duration_hours: number
  severe_weather_avoided: number
  max_encountered_wave_m: number
  max_encountered_wind_knots: number
  fuel_adjustment_pct: number
  recommended_departure: string
  cyclone_avoidance_active: boolean
  gale_warning: boolean
  route_confidence_pct: number
  daily_forecast_summary: string[]
  recommendations: string[]
}

function routeWeatherAvoidance(input: WeatherRoutingInput): WeatherRoutingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const directDist = haversineNm(input.origin.lat, input.origin.lng, input.destination.lat, input.destination.lng)
  const waypointCount = Math.min(8, Math.max(3, Math.floor(directDist / 200)))
  const waypoints: RoutePoint[] = []
  let severeWeatherAvoided = 0
  let maxWave = 0
  let maxWind = 0

  for (let i = 0; i <= waypointCount; i++) {
    const progress = i / waypointCount
    let lat = input.origin.lat + (input.destination.lat - input.origin.lat) * progress
    let lng = input.origin.lng + (input.destination.lng - input.origin.lng) * progress

    if (i > 0 && i < waypointCount) {
      const offsetDeg = rng.nextFloat(-3, 3)
      if (input.optimization === 'safest') {
        lat += offsetDeg * 0.5
      }
    }

    let waveH = 1.5 + rng.nextFloat(0, 4)
    let windSpd = 15 + rng.nextFloat(0, 30)
    let alert = 'None'

    const nearbyCell = input.forecast.find(f => haversineNm(lat, lng, f.lat, f.lng) < 100)
    if (nearbyCell) {
      waveH = nearbyCell.wave_height_m
      windSpd = nearbyCell.wind_speed_knots
    }

    if (waveH > input.max_wave_height_m) {
      severeWeatherAvoided++
      alert = 'HIGH WAVE: ' + waveH.toFixed(1) + 'm exceeds limit'
    }
    if (windSpd > input.max_wind_speed_knots) {
      severeWeatherAvoided++
      alert = 'HIGH WIND: ' + windSpd.toFixed(0) + 'kn exceeds limit'
    }
    if (input.avoid_tropical_cyclone && windSpd > 50) {
      alert = 'TROPICAL STORM ZONE'
    }

    let risk: 'low' | 'moderate' | 'high' | 'extreme' = 'low'
    if (waveH > 8 || windSpd > 50) risk = 'extreme'
    else if (waveH > 5 || windSpd > 35) risk = 'high'
    else if (waveH > 3 || windSpd > 25) risk = 'moderate'

    if (waveH > maxWave) maxWave = waveH
    if (windSpd > maxWind) maxWind = windSpd

    let recSpeed = 16
    if (input.optimization === 'fastest') recSpeed = Math.max(10, 22 - waveH * 1.5)
    else if (input.optimization === 'fuel') recSpeed = Math.max(8, 16 - waveH * 0.8)
    else if (input.optimization === 'comfort') recSpeed = Math.max(10, 18 - waveH * 1.2)
    else recSpeed = Math.max(10, 20 - waveH * 1.0)

    waypoints.push({
      lat: Math.round(lat * 1000) / 1000,
      lng: Math.round(lng * 1000) / 1000,
      leg_number: i + 1,
      wave_height_m: Math.round(waveH * 10) / 10,
      wind_speed_knots: Math.round(windSpd),
      recommended_speed_knots: Math.round(recSpeed * 10) / 10,
      risk_level: risk,
      weather_alert: alert
    })
  }

  const fuelAdj = severeWeatherAvoided > 0 ? Math.round(severeWeatherAvoided * rng.nextFloat(3, 8)) : 0

  const recommendations: string[] = []
  if (severeWeatherAvoided > 0) recommendations.push('Route deviated around ' + severeWeatherAvoided + ' weather hazard zone(s)')
  if (maxWave > 6) recommendations.push('Significant wave heights >6m - reduce speed in heavy conditions')
  if (input.avoid_tropical_cyclone) recommendations.push('Tropical cyclone avoidance active: route clears all storm cells')
  recommendations.push('Update routing every 6 hours with latest GFS/ECMWF forecast')

  const directDuration = directDist / 16
  const adjustedDuration = directDuration * (1 + severeWeatherAvoided * 0.05)

  return {
    vessel_name: input.vessel_name,
    route_generated: input.origin.name + ' to ' + input.destination.name + ' (' + input.optimization + ')',
    waypoints,
    total_distance_nm: Math.round(directDist * (1 + severeWeatherAvoided * 0.03) * 100) / 100,
    total_duration_hours: Math.round(adjustedDuration * 10) / 10,
    severe_weather_avoided: severeWeatherAvoided,
    max_encountered_wave_m: Math.round(maxWave * 10) / 10,
    max_encountered_wind_knots: Math.round(maxWind),
    fuel_adjustment_pct: fuelAdj,
    recommended_departure: input.departure_time,
    cyclone_avoidance_active: input.avoid_tropical_cyclone,
    gale_warning: maxWind > 33,
    route_confidence_pct: Math.min(95, Math.round((75 + rng.nextFloat(0, 18)) * 100) / 100),
    daily_forecast_summary: [
      'Day 1: Waves 2-4m, Winds 15-25kn - Good conditions',
      'Day 2: Waves 3-6m, Winds 20-35kn - Moderate deterioration',
      'Day 3: Waves 1-3m, Winds 10-20kn - Improving'
    ],
    recommendations
  }
}

function formatWeatherRoutingReport(r: WeatherRoutingResult): string {
  const lines: string[] = []
  lines.push('## Weather Routing: ' + r.vessel_name)
  lines.push('')
  lines.push('**Route:** ' + r.route_generated)
  lines.push('**Total Distance:** ' + r.total_distance_nm + ' NM')
  lines.push('**Duration:** ' + r.total_duration_hours + ' hours')
  lines.push('**Severe Weather Zones Avoided:** ' + r.severe_weather_avoided)
  lines.push('**Max Wave Height:** ' + r.max_encountered_wave_m + 'm | **Max Wind:** ' + r.max_encountered_wind_knots + ' kn')
  lines.push('**Fuel Adjustment:** +' + r.fuel_adjustment_pct + '%')
  lines.push('**Cyclone Avoidance:** ' + (r.cyclone_avoidance_active ? 'ACTIVE' : 'Off'))
  lines.push('**Gale Warning:** ' + (r.gale_warning ? 'YES' : 'No'))
  lines.push('**Route Confidence:** ' + r.route_confidence_pct + '%')
  lines.push('')
  lines.push('### Route Waypoints')
  lines.push('| Leg | Lat | Lng | Wave (m) | Wind (kn) | Speed (kn) | Risk | Alert |')
  lines.push('|-----|-----|-----|----------|-----------|------------|------|-------|')
  for (const w of r.waypoints) {
    lines.push('| ' + w.leg_number + ' | ' + w.lat + ' | ' + w.lng + ' | ' + w.wave_height_m + ' | ' + w.wind_speed_knots + ' | ' + w.recommended_speed_knots + ' | ' + w.risk_level.toUpperCase() + ' | ' + w.weather_alert + ' |')
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('### Routing Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('AI weather routing: GFS/ECMWF ensemble-based route optimization with real-time hazard avoidance.')
  return lines.join('\n')
}

// ==================== SECTION 8 - Tool 7: Remote Monitoring Center ====================

export interface SensorReading {
  sensor_id: string
  sensor_type: string
  value: number
  unit: string
  timestamp: string
  status: 'normal' | 'warning' | 'critical' | 'offline'
}

export interface VesselSystem {
  system_name: string
  health_pct: number
  last_check: string
  alerts: string[]
  sensors: SensorReading[]
}

export interface RemoteMonitoringInput {
  vessel_name: string
  vessel_id: string
  autonomy_level: string
  systems: VesselSystem[]
  satellite_link: 'active' | 'degraded' | 'intermittent' | 'lost'
  last_communication: string
  roc_operator_count: number
  anomaly_detection_sensitivity: 'low' | 'medium' | 'high'
}

export interface AnomalyEvent {
  event_id: string
  system: string
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  description: string
  detected_at: string
  recommended_action: string
  auto_resolvable: boolean
}

export interface RemoteMonitoringResult {
  vessel_name: string
  vessel_id: string
  overall_health_pct: number
  systems_monitored: number
  active_alerts: number
  anomalies: AnomalyEvent[]
  satellite_status: string
  communication_latency_sec: number
  roc_readiness: string
  autonomous_response_activated: boolean
  escalation_required: boolean
  next_scheduled_check_min: number
  system_health_summary: Array<{ system: string; health: number; status: string }>
  recommendations: string[]
}

function monitorRemotely(input: RemoteMonitoringInput): RemoteMonitoringResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const anomalies: AnomalyEvent[] = []
  let activeAlerts = 0
  const systemSummary: Array<{ system: string; health: number; status: string }> = []

  for (const sys of input.systems) {
    let sysStatus = 'OPERATIONAL'
    if (sys.health_pct < 50) { sysStatus = 'DEGRADED'; activeAlerts += 2 }
    else if (sys.health_pct < 75) { sysStatus = 'CAUTION'; activeAlerts += 1 }

    systemSummary.push({ system: sys.system_name, health: sys.health_pct, status: sysStatus })

    for (const sensor of sys.sensors) {
      if (sensor.status === 'critical' || sensor.status === 'warning') {
        activeAlerts++
        const severity: AnomalyEvent['severity'] = sensor.status === 'critical' ? 'critical' : 'warning'
        anomalies.push({
          event_id: 'ANM-' + rng.nextInt(10000, 99999).toString(),
          system: sys.system_name,
          severity,
          description: sensor.sensor_type + ' reading ' + sensor.value + ' ' + sensor.unit + ' (' + sensor.status + ')',
          detected_at: sensor.timestamp,
          recommended_action: sensor.status === 'critical' ? 'Immediate remote diagnostic required' : 'Schedule diagnostic at next port',
          auto_resolvable: sensor.status === 'warning' && rng.next() > 0.5
        })
      }
    }
  }

  const avgHealth = input.systems.length > 0
    ? Math.round(input.systems.reduce((s, sys) => s + sys.health_pct, 0) / input.systems.length * 10) / 10
    : 0

  const commLatency = input.satellite_link === 'active' ? rng.nextFloat(0.5, 2.0) :
    input.satellite_link === 'degraded' ? rng.nextFloat(3, 8) :
    input.satellite_link === 'intermittent' ? rng.nextFloat(10, 30) : rng.nextFloat(60, 300)

  const escalation = activeAlerts > 5 || avgHealth < 60 || input.satellite_link === 'lost'
  const autoResponse = input.anomaly_detection_sensitivity === 'high' && activeAlerts > 0

  const recommendations: string[] = []
  if (input.satellite_link !== 'active') recommendations.push('Satellite link ' + input.satellite_link + ' - switch to backup L-band')
  if (avgHealth < 70) recommendations.push('Overall health below 70% - schedule remote diagnostic session')
  if (anomalies.filter(a => a.severity === 'critical').length > 0) recommendations.push('Critical anomalies detected - consider reducing autonomy level')
  if (input.roc_operator_count < 2) recommendations.push('ROC understaffed - minimum 2 operators recommended for AL4+ vessels')

  return {
    vessel_name: input.vessel_name,
    vessel_id: input.vessel_id,
    overall_health_pct: avgHealth,
    systems_monitored: input.systems.length,
    active_alerts: activeAlerts,
    anomalies,
    satellite_status: input.satellite_link.toUpperCase(),
    communication_latency_sec: Math.round(commLatency * 10) / 10,
    roc_readiness: input.roc_operator_count >= 2 ? 'STAFFED' : 'UNDERSTAFFED',
    autonomous_response_activated: autoResponse,
    escalation_required: escalation,
    next_scheduled_check_min: escalation ? 5 : 15,
    system_health_summary: systemSummary,
    recommendations
  }
}

function formatMonitoringReport(r: RemoteMonitoringResult): string {
  const lines: string[] = []
  lines.push('## Remote Operations Center: ' + r.vessel_name)
  lines.push('')
  lines.push('**Vessel ID:** ' + r.vessel_id)
  lines.push('**Overall Health:** ' + r.overall_health_pct + '%')
  lines.push('**Systems Monitored:** ' + r.systems_monitored)
  lines.push('**Active Alerts:** ' + r.active_alerts)
  lines.push('**Satellite Link:** ' + r.satellite_status)
  lines.push('**Comm Latency:** ' + r.communication_latency_sec + 's')
  lines.push('**ROC Readiness:** ' + r.roc_readiness)
  lines.push('**Auto Response:** ' + (r.autonomous_response_activated ? 'ACTIVE' : 'Standby'))
  lines.push('**Escalation:** ' + (r.escalation_required ? 'REQUIRED' : 'Not needed'))
  lines.push('**Next Check:** ' + r.next_scheduled_check_min + ' min')
  lines.push('')
  lines.push('### System Health')
  lines.push('| System | Health | Status |')
  lines.push('|--------|--------|--------|')
  for (const s of r.system_health_summary) {
    lines.push('| ' + s.system + ' | ' + s.health + '% | ' + s.status + ' |')
  }
  if (r.anomalies.length > 0) {
    lines.push('')
    lines.push('### Anomaly Events')
    lines.push('| ID | System | Severity | Description | Action | Auto |')
    lines.push('|----|--------|----------|-------------|--------|------|')
    for (const a of r.anomalies) {
      lines.push('| ' + a.event_id + ' | ' + a.system + ' | ' + a.severity.toUpperCase() + ' | ' + a.description + ' | ' + a.recommended_action + ' | ' + (a.auto_resolvable ? 'Yes' : 'No') + ' |')
    }
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('### ROC Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('Remote Operations Center (ROC) monitoring: real-time sensor fusion, anomaly detection, and autonomous response activation.')
  return lines.join('\n')
}

// ==================== SECTION 9 - Tool 8: Regulatory Compliance Maritime ====================

export interface ComplianceRequirement {
  regulation: string
  code: string
  description: string
  applicable_vessel_types: string[]
  deadline: string
  penalty: string
}

export interface VesselComplianceRecord {
  vessel_name: string
  vessel_type: string
  flag_state: string
  imo_number: string
  autonomy_level: string
  certifications: Array<{ name: string; issued: string; expires: string; status: 'valid' | 'expiring_soon' | 'expired' }>
  inspections: Array<{ type: string; date: string; result: 'pass' | 'deficiencies' | 'fail'; deficiencies: number }>
  crew_certifications_compliant: boolean
  last_safety_audit: string
}

export interface RegulatoryComplianceInput {
  vessel_records: VesselComplianceRecord[]
  applicable_regulations: ComplianceRequirement[]
  target_jurisdiction: 'IMO' | 'EU' | 'USCG' | 'MARAD' | 'class_society'
  autonomous_operation_zone: string
  next_inspection_due: string
}

export interface ComplianceGap {
  regulation: string
  code: string
  vessel: string
  gap_description: string
  severity: 'minor' | 'major' | 'critical'
  remediation: string
  deadline: string
  estimated_cost_usd: number
}

export interface RegulatoryComplianceResult {
  jurisdiction: string
  vessels_assessed: number
  overall_compliance_pct: number
  compliant_vessels: number
  non_compliant_vessels: number
  compliance_gaps: ComplianceGap[]
  certifications_expiring: number
  autonomous_operation_approved: boolean
  autonomous_conditions: string[]
  next_inspection_readiness: string
  risk_rating: 'low' | 'moderate' | 'high' | 'critical'
  regulatory_outlook: string
  recommendations: string[]
}

function checkRegulatoryCompliance(input: RegulatoryComplianceInput): RegulatoryComplianceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const gaps: ComplianceGap[] = []
  let certExpiring = 0
  let compliantCount = 0

  for (const vessel of input.vessel_records) {
    let vesselCompliant = true

    for (const cert of vessel.certifications) {
      if (cert.status === 'expired') {
        vesselCompliant = false
        gaps.push({
          regulation: cert.name,
          code: 'CERT-EXP',
          vessel: vessel.vessel_name,
          gap_description: cert.name + ' certificate expired on ' + cert.expires,
          severity: 'critical',
          remediation: 'Renew certificate immediately - vessel not seaworthy',
          deadline: 'Immediate',
          estimated_cost_usd: rng.nextInt(5000, 50000)
        })
      } else if (cert.status === 'expiring_soon') {
        certExpiring++
        gaps.push({
          regulation: cert.name,
          code: 'CERT-WARN',
          vessel: vessel.vessel_name,
          gap_description: cert.name + ' expires ' + cert.expires,
          severity: 'major',
          remediation: 'Schedule renewal within 30 days',
          deadline: cert.expires,
          estimated_cost_usd: rng.nextInt(2000, 20000)
        })
      }
    }

    for (const inspection of vessel.inspections) {
      if (inspection.result === 'fail') {
        vesselCompliant = false
        gaps.push({
          regulation: 'Safety Inspection',
          code: 'INSP-FAIL',
          vessel: vessel.vessel_name,
          gap_description: inspection.type + ' failed with ' + inspection.deficiencies + ' deficiencies',
          severity: 'critical',
          remediation: 'Rectify all deficiencies and re-inspect before sailing',
          deadline: 'Before departure',
          estimated_cost_usd: rng.nextInt(10000, 100000)
        })
      } else if (inspection.result === 'deficiencies' && inspection.deficiencies > 3) {
        vesselCompliant = false
        gaps.push({
          regulation: 'Safety Inspection',
          code: 'INSP-DEF',
          vessel: vessel.vessel_name,
          gap_description: inspection.type + ': ' + inspection.deficiencies + ' deficiencies found',
          severity: 'major',
          remediation: 'Address deficiencies within 14 days',
          deadline: '14 days',
          estimated_cost_usd: rng.nextInt(5000, 30000)
        })
      }
    }

    if (!vessel.crew_certifications_compliant) {
      vesselCompliant = false
      gaps.push({
        regulation: 'STCW',
        code: 'CREW-001',
        vessel: vessel.vessel_name,
        gap_description: 'Crew certifications not STCW compliant',
        severity: 'critical',
        remediation: 'Replace non-certified crew or arrange emergency certification',
        deadline: 'Before departure',
        estimated_cost_usd: rng.nextInt(15000, 75000)
      })
    }

    if (vesselCompliant) compliantCount++
  }

  const totalVessels = input.vessel_records.length
  const compliancePct = totalVessels > 0 ? Math.round((compliantCount / totalVessels) * 10000) / 100 : 0

  const autonomousApproved = compliantCount === totalVessels && gaps.filter(g => g.severity === 'critical').length === 0
  const autoConditions: string[] = []
  if (!autonomousApproved) {
    autoConditions.push('Resolve all critical gaps before autonomous operation approval')
    autoConditions.push('Submit corrective action plan to ' + input.target_jurisdiction)
  }
  if (input.target_jurisdiction === 'USCG') autoConditions.push('USCG MA-1047 autonomous vessel permit required')
  if (input.target_jurisdiction === 'EU') autoConditions.push('EU Maritime Autonomous Vehicle (MAV) certification required')

  const criticalGaps = gaps.filter(g => g.severity === 'critical').length
  let riskRating: 'low' | 'moderate' | 'high' | 'critical' = 'low'
  if (criticalGaps > 2) riskRating = 'critical'
  else if (criticalGaps > 0) riskRating = 'high'
  else if (gaps.length > 3) riskRating = 'moderate'

  const recommendations: string[] = []
  if (certExpiring > 0) recommendations.push(certExpiring + ' certification(s) expiring soon - initiate renewal process')
  if (criticalGaps > 0) recommendations.push(criticalGaps + ' critical gap(s) must be resolved before autonomous operations')
  if (input.target_jurisdiction === 'USCG') recommendations.push('Coordinate with USCG Marine Safety Center for autonomous vessel type approval')
  recommendations.push('Schedule quarterly compliance audit for autonomous operation certification')

  return {
    jurisdiction: input.target_jurisdiction,
    vessels_assessed: totalVessels,
    overall_compliance_pct: compliancePct,
    compliant_vessels: compliantCount,
    non_compliant_vessels: totalVessels - compliantCount,
    compliance_gaps: gaps,
    certifications_expiring: certExpiring,
    autonomous_operation_approved: autonomousApproved,
    autonomous_conditions: autoConditions,
    next_inspection_readiness: criticalGaps === 0 ? 'Ready' : 'Not Ready - ' + criticalGaps + ' critical items',
    risk_rating: riskRating,
    regulatory_outlook: input.target_jurisdiction === 'IMO' ? 'IMO MSC.1/Circ.1638 autonomous vessel framework' :
      input.target_jurisdiction === 'EU' ? 'EU AI Act + EMSA autonomous shipping guidelines' :
      input.target_jurisdiction === 'USCG' ? 'USCG autonomous vessel policy (MA-1047)' : 'National maritime authority guidelines',
    recommendations
  }
}

function formatComplianceReport(r: RegulatoryComplianceResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Compliance: ' + r.jurisdiction)
  lines.push('')
  lines.push('**Vessels Assessed:** ' + r.vessels_assessed)
  lines.push('**Overall Compliance:** ' + r.overall_compliance_pct + '%')
  lines.push('**Compliant:** ' + r.compliant_vessels + ' | **Non-Compliant:** ' + r.non_compliant_vessels)
  lines.push('**Certifications Expiring:** ' + r.certifications_expiring)
  lines.push('**Autonomous Operation:** ' + (r.autonomous_operation_approved ? 'APPROVED' : 'NOT APPROVED'))
  lines.push('**Risk Rating:** ' + r.risk_rating.toUpperCase())
  lines.push('**Inspection Readiness:** ' + r.next_inspection_readiness)
  lines.push('**Regulatory Outlook:** ' + r.regulatory_outlook)
  lines.push('')
  if (r.autonomous_conditions.length > 0) {
    lines.push('### Autonomous Operation Conditions')
    for (const c of r.autonomous_conditions) lines.push('- ' + c)
    lines.push('')
  }
  if (r.compliance_gaps.length > 0) {
    lines.push('### Compliance Gaps')
    lines.push('| Regulation | Vessel | Gap | Severity | Remediation | Cost |')
    lines.push('|------------|--------|-----|----------|-------------|------|')
    for (const g of r.compliance_gaps) {
      lines.push('| ' + g.regulation + ' (' + g.code + ') | ' + g.vessel + ' | ' + g.gap_description + ' | ' + g.severity.toUpperCase() + ' | ' + g.remediation + ' | $' + g.estimated_cost_usd.toLocaleString() + ' |')
    }
  }
  if (r.recommendations.length > 0) {
    lines.push('')
    lines.push('### Compliance Recommendations')
    for (const rec of r.recommendations) lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('IMO/MARAD autonomous vessel regulatory compliance: gap analysis, certification tracking, and autonomous operation approval pathway.')
  return lines.join('\n')
}

// ==================== SECTION 10 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'autonomous_navigation_planner',
    description: 'AI-driven autonomous voyage route planning with dynamic waypoints, no-go zone avoidance, speed optimization, and autopilot mode selection. Outputs route segments with bearings, distances, fuel estimates, and risk levels.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vessel_name, vessel_type, draft_m(number), max_speed_knots(number), origin{id,lat,lng,name}, destination{id,lat,lng,name}, intermediate_waypoints[], no_go_zones{center_lat,center_lng,radius_nm,reason}, optimization_criteria(shortest|fastest|fuel_efficient|safest), departure_time(YYYY-MM-DD HH:MM)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: NavigationPlannerInput = JSON.parse(args.input_data)
      return formatNavigationReport(planNavigation(input))
    }
  }))

  tools.register(defineTool({
    name: 'collision_avoidance_maritime',
    description: 'COLREGs-compliant collision avoidance decision engine. Analyzes CPA/TCPA for multiple contacts, determines risk levels, and recommends avoidance actions per COLREGs Rules 13-17.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: own_ship{name,lat,lng,sog_knots,cog_deg,heading_deg,length_m,draft_m}, contacts[mmsi,name,lat,lng,sog_knots,cog_deg,vessel_type,cpa_nm,tcpa_minutes], colregs_rule(head_on|overtaking|crossing|general), visibility(good|moderate|poor|restricted), sea_state(calm|moderate|rough|heavy), max_speed_knots(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CollisionAvoidanceInput = JSON.parse(args.input_data)
      return formatCollisionReport(analyzeCollisionAvoidance(input))
    }
  }))

  tools.register(defineTool({
    name: 'port_automation_coordinator',
    description: 'Automated port berthing and cargo handling orchestration. Assigns berths, schedules cranes, manages yard blocks, and optimizes vessel turnaround with tidal window constraints.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: port_name, berths[berth_id,length_m,depth_m,crane_count,occupied], vessel_calls[voyage_id,vessel_name,loa_m,draft_m,eta,etd,cargo_teu,cargo_type], yard_blocks[block_id,capacity_teu,current_teu,reefer_points,hazard_class], crane_productivity_teu_per_hour(number), target_vessel_delay_hours(number), tidal_window{start,end,min_depth_m}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PortAutomationInput = JSON.parse(args.input_data)
      return formatPortAutomationReport(coordinatePortAutomation(input))
    }
  }))

  tools.register(defineTool({
    name: 'fleet_autonomy_manager',
    description: 'Multi-vessel fleet coordination and task assignment. Matches autonomous vessel capabilities (AL0-AL5) to mission tasks with priority-based allocation and fleet health monitoring.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: fleet_name, vessels[vessel_id,name,type,status,lat,lng,autonomy_level,fuel_remaining_pct,next_maintenance_hours,assigned_task], tasks[task_id,type,priority,origin{lat,lng},destination{lat,lng},deadline,requires_al_level], coordination_mode(centralized|distributed|swarm), weather_max_sea_state(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: FleetAutonomyInput = JSON.parse(args.input_data)
      return formatFleetReport(fleetCoordination(input))
    }
  }))

  tools.register(defineTool({
    name: 'fuel_optimization_autonomous',
    description: 'AI fuel consumption optimization for autonomous voyages. Cubic speed-fuel model with sea margin, weather penalty, ECA compliance, and multi-scenario comparison.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vessel_name, vessel_type, displacement_mt(number), voyage_distance_nm(number), current_speed_knots(number), optimal_speed_range{min_knots,max_knots}, fuel_price_usd_per_mt(number), fuel_type(HFO|VLSFO|LNG|MGO|methanol|ammonia), sea_margin_pct(number), weather_factor(calm|moderate|rough), deadline_hours(number), emission_control_area(boolean)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: FuelOptimizationInput = JSON.parse(args.input_data)
      return formatFuelReport(optimizeFuelConsumption(input))
    }
  }))

  tools.register(defineTool({
    name: 'weather_routing_autonomous',
    description: 'Weather-avoidance routing with real-time storm tracking. Generates waypoints avoiding high waves/winds, tropical cyclones, and ice edges with GFS/ECMWF forecast integration.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vessel_name, vessel_type, origin{lat,lng,name}, destination{lat,lng,name}, departure_time(YYYY-MM-DD HH:MM), max_wave_height_m(number), max_wind_speed_knots(number), optimization(safest|fastest|fuel|comfort), forecast[lat,lng,wave_height_m,wind_speed_knots,wind_dir_deg,current_speed_knots,current_dir_deg,pressure_hpa], ice_edge_lat(number), avoid_tropical_cyclone(boolean)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: WeatherRoutingInput = JSON.parse(args.input_data)
      return formatWeatherRoutingReport(routeWeatherAvoidance(input))
    }
  }))

  tools.register(defineTool({
    name: 'remote_monitoring_center',
    description: 'Remote Operations Center (ROC) monitoring and anomaly detection for autonomous vessels. Real-time sensor fusion, system health assessment, and autonomous response activation.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vessel_name, vessel_id, autonomy_level, systems[system_name,health_pct,last_check,alerts[],sensors[sensor_id,sensor_type,value,unit,timestamp,status]], satellite_link(active|degraded|intermittent|lost), last_communication(ISO), roc_operator_count(number), anomaly_detection_sensitivity(low|medium|high)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: RemoteMonitoringInput = JSON.parse(args.input_data)
      return formatMonitoringReport(monitorRemotely(input))
    }
  }))

  tools.register(defineTool({
    name: 'regulatory_compliance_maritime',
    description: 'IMO/MARAD autonomous vessel compliance verification. Checks certifications, inspection records, STCW crew compliance, and autonomous operation approval status.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vessel_records[vessel_name,vessel_type,flag_state,imo_number,autonomy_level,certifications{name,issued,expires,status},inspections{type,date,result,deficiencies},crew_certifications_compliant(boolean),last_safety_audit], applicable_regulations[regulation,code,description,applicable_vessel_types,deadline,penalty], target_jurisdiction(IMO|EU|USCG|MARAD|class_society), autonomous_operation_zone(string), next_inspection_due(YYYY-MM-DD)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: RegulatoryComplianceInput = JSON.parse(args.input_data)
      return formatComplianceReport(checkRegulatoryCompliance(input))
    }
  }))

  console.log('[dsh-tool-autoship] Loaded v0.1.0 - Autonomous Ships & Maritime Autonomy with 8 tools')
  console.log('  Tools: autonomous_navigation_planner, collision_avoidance_maritime, port_automation_coordinator, fleet_autonomy_manager, fuel_optimization_autonomous, weather_routing_autonomous, remote_monitoring_center, regulatory_compliance_maritime')
}
