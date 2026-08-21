import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// =====================================================================
// DSH Drone Delivery AI Agent — dsh-tool-dronedeliveryagent v0.1.0
// 8 tools: route planning, payload, weather, battery, airspace,
//          fleet dispatch, noise, delivery station
// =====================================================================

// -------------------- Seeded Random Utilities ----------------------

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

function mToFt(m: number): number {
  return round(m * 3.28084, 0)
}

function kgToLb(kg: number): number {
  return round(kg * 2.20462, 2)
}

// ==================== SHARED DATA ====================

const DRONE_MODELS: Record<string, { maxSpeedKmh: number; maxAltitudeM: number; maxPayloadKg: number; batteryWh: number; rangeKm: number; cruiseSpeedKmh: number; noiseDb: number; weightKg: number }> = {
  DJI_M30: { maxSpeedKmh: 75.6, maxAltitudeM: 7000, maxPayloadKg: 2.9, batteryWh: 5880, rangeKm: 32, cruiseSpeedKmh: 54, noiseDb: 68, weightKg: 6.6 },
  Matrice_350: { maxSpeedKmh: 76, maxAltitudeM: 7000, maxPayloadKg: 2.7, batteryWh: 5880, rangeKm: 35, cruiseSpeedKmh: 54, noiseDb: 70, weightKg: 9.2 },
  Wingcopter_198: { maxSpeedKmh: 130, maxAltitudeM: 4000, maxPayloadKg: 6.0, batteryWh: 18000, rangeKm: 75, cruiseSpeedKmh: 90, noiseDb: 62, weightKg: 12.0 },
  Zipline_Zip: { maxSpeedKmh: 100, maxAltitudeM: 3000, maxPayloadKg: 1.8, batteryWh: 4000, rangeKm: 80, cruiseSpeedKmh: 72, noiseDb: 58, weightKg: 11.0 },
  Alta_X: { maxSpeedKmh: 145, maxAltitudeM: 4500, maxPayloadKg: 130, batteryWh: 50000, rangeKm: 450, cruiseSpeedKmh: 100, noiseDb: 72, weightKg: 230. },
  Volocopter_VoloDrone: { maxSpeedKmh: 110, maxAltitudeM: 2500, maxPayloadKg: 200, batteryWh: 100000, rangeKm: 40, cruiseSpeedKmh: 80, noiseDb: 65, weightKg: 600. },
  Skyports_Lifter: { maxSpeedKmh: 72, maxAltitudeM: 120, maxPayloadKg: 4.0, batteryWh: 3000, rangeKm: 12, cruiseSpeedKmh: 50, noiseDb: 60, weightKg: 18. },
  Freefly_AltoX: { maxSpeedKmh: 75, maxAltitudeM: 4000, maxPayloadKg: 9.1, batteryWh: 6000, rangeKm: 20, cruiseSpeedKmh: 54, noiseDb: 66, weightKg: 20. },
}

const DRONE_MODEL_KEYS = Object.keys(DRONE_MODELS)

const WEATHER_PARAMETERS = ['Temperature', 'Wind', 'Gusts', 'Visibility', 'Precipitation', 'Humidity', 'Wind Shear']

// =====================================================================
// TOOL 1: delivery_route_planner
// Delivery route planning with BVLOS corridors
// =====================================================================

interface DeliveryRouteInput {
  drone_model: string
  origin: { lat: number; lng: number; name?: string }
  destination: { lat: number; lng: number; name?: string }
  waypoints?: Array<{ lat: number; lng: number; name?: string }>
  bvlos_required?: boolean
  altitude_m?: number
  payload_kg?: number
  terrain_type?: 'urban' | 'suburban' | 'rural' | 'mountainous' | 'coastal'
  avoid_populated?: boolean
  max_distance_km?: number
  seed_date?: string
}

interface DeliveryRouteResult {
  route_id: string
  drone_model: string
  total_distance_km: number
  estimated_time_min: number
  waypoint_count: number
  bvlos_corridor: boolean
  altitude_plan: string
  terrain_overview: string
  no_fly_zones: Array<{ name: string; status: string }>
  checkpoints: Array<{ name: string; distance_km: number; eta_min: number; action: string }>
  energy_estimate_percent: number
  risk_level: 'low' | 'moderate' | 'high'
  airspace_class: string
  visual_line_of_sight: string
  contingency_routes: number
  notes: string[]
}

function planDeliveryRoute(input: DeliveryRouteInput): DeliveryRouteResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(`${input.origin.lat},${input.origin.lng},${input.destination.lat},${input.destination.lng},${input.seed_date || '2026-08-21'}`)

  const waypoints = input.waypoints || []
  const allPoints = [input.origin, ...waypoints, input.destination]

  // Haversine distance between two coordinates
  function haversineDist(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLng = (b.lng - a.lng) * Math.PI / 180
    const lat1 = a.lat * Math.PI / 180
    const lat2 = b.lat * Math.PI / 180
    const sinDLat = Math.sin(dLat / 2)
    const sinDLng = Math.sin(dLng / 2)
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
  }

  let totalDist = 0
  for (let i = 0; i < allPoints.length - 1; i++) {
    totalDist += haversineDist(allPoints[i], allPoints[i + 1])
  }
  totalDist = round(totalDist + rng() * 2, 2)

  const minDist = drone.cruiseSpeedKmh > 0 ? drone.cruiseSpeedKmh * 0.05 : 3
  totalDist = Math.max(totalDist, minDist)

  const altitude = input.altitude_m || 120
  const bvlos = input.bvlos_required !== undefined ? input.bvlos_required : totalDist > 15

  const effectiveSpeed = drone.cruiseSpeedKmh * (0.85 + rng() * 0.15)
  const estTimeMin = round((totalDist / effectiveSpeed) * 60, 1)

  const energyPercent = clamp(round((totalDist / drone.rangeKm) * 100 + rng() * 10, 1), 5, 100)

  const terrain = input.terrain_type || pickFromList(rng, ['urban', 'suburban', 'rural', 'mountainous', 'coastal'] as const)

  const riskScores: Record<string, number> = { urban: 7, suburban: 4, rural: 2, mountainous: 8, coastal: 5 }
  const riskScore = (riskScores[terrain] || 5) + (bvlos ? 2 : 0) + (input.payload_kg && input.payload_kg > drone.maxPayloadKg * 0.8 ? 1 : 0)
  const riskLevel: 'low' | 'moderate' | 'high' = riskScore <= 3 ? 'low' : riskScore <= 6 ? 'moderate' : 'high'

  const checkpoints: Array<{ name: string; distance_km: number; eta_min: number; action: string }> = []
  let accDist = 0
  for (let i = 1; i < allPoints.length - 1; i++) {
    accDist += haversineDist(allPoints[i - 1], allPoints[i])
    const cpName = allPoints[i].name || `WP-${i}`
    const actions = ['Checkpoint', 'Visual Confirm', 'Altitude Change', 'Comm Relay', 'Obstacle Scan']
    checkpoints.push({
      name: cpName,
      distance_km: round(accDist, 2),
      eta_min: round((accDist / effectiveSpeed) * 60, 1),
      action: pickFromList(rng, actions),
    })
  }

  const noFlyZones = [
    { name: 'Class B Airport Zone', status: bvlos ? 'Coordination Required' : 'Cleared' },
    { name: 'Hospital Helipad', status: 'No-fly buffer 500m' },
    { name: 'Government Building', status: 'Restricted' },
  ]

  const notes: string[] = []
  if (bvlos) notes.push(`BVLOS corridor activated — total distance ${totalDist}km exceeds VLOS range.`)
  if (energyPercent > 80) notes.push(`High energy utilization (${energyPercent}%) — consider battery swap station en route.`)
  if (terrain === 'mountainous') notes.push('Mountainous terrain — terrain-following flight mode recommended.')
  if (terrain === 'urban') notes.push('Urban corridor — noise abatement altitude enforced above 90m.')
  if (altitude > 120) notes.push(`Altitude ${altitude}m exceeds standard 120m ceiling — special clearance required.`)
  notes.push(`Route designed for ${input.drone_model} with ${input.payload_kg || 0}kg payload (${round((input.payload_kg || 0) / drone.maxPayloadKg * 100, 1)}% of max).`)

  return {
    route_id: `ROUTE-${String(hashStr(`${input.origin.lat}${input.destination.lat}`) % 100000).padStart(5, '0')}`,
    drone_model: input.drone_model,
    total_distance_km: totalDist,
    estimated_time_min: estTimeMin,
    waypoint_count: allPoints.length,
    bvlos_corridor: bvlos,
    altitude_plan: `${altitude}m AGL (${terrain} terrain)`,
    terrain_overview: terrain,
    no_fly_zones: noFlyZones,
    checkpoints,
    energy_estimate_percent: energyPercent,
    risk_level: riskLevel,
    airspace_class: bvlos ? 'Class G (BVLOS corridor)' : 'Class G (VLOS)',
    visual_line_of_sight: bvlos ? 'Beyond Visual Line of Sight — Detect & Avoid relay' : 'Visual Line of Sight',
    contingency_routes: bvlos ? 2 : 1,
    notes,
  }
}

function formatRoute(r: DeliveryRouteResult): string {
  const lines: string[] = []
  lines.push('# Drone Delivery Route Plan')
  lines.push(`Route ID: ${r.route_id}`)
  lines.push(`Drone: ${r.drone_model}`)
  lines.push(`Total Distance: ${r.total_distance_km} km (${kmToMi(r.total_distance_km)} mi)`)
  lines.push(`Estimated Flight Time: ${r.estimated_time_min} min`)
  lines.push(`Waypoints: ${r.waypoint_count}`)
  lines.push(`Energy Estimate: ${r.energy_estimate_percent}% battery`)
  lines.push(`Risk Level: ${r.risk_level.toUpperCase()}`)
  lines.push(`Airspace: ${r.airspace_class}`)
  lines.push(`Altitude Plan: ${r.altitude_plan}`)
  lines.push(`VLOS/BVLOS: ${r.visual_line_of_sight}`)
  lines.push(`Contingency Routes: ${r.contingency_routes}`)
  lines.push('')
  lines.push('## No-fly Zone Coordination')
  r.no_fly_zones.forEach(z => lines.push(`- ${z.name}: ${z.status}`))
  lines.push('')
  lines.push('## Checkpoints')
  r.checkpoints.forEach(c => lines.push(`- ${c.name} @ ${c.distance_km}km (ETA ${c.eta_min}min): ${c.action}`))
  lines.push('')
  lines.push('## Notes')
  r.notes.forEach(n => lines.push(`- ${n}`))
  return lines.join('\n')
}

// =====================================================================
// TOOL 2: payload_weight_optimizer
// Payload weight balance with package fit analysis
// =====================================================================

interface PayloadInput {
  drone_model: string
  packages: Array<{
    id: string
    weight_kg: number
    length_cm: number
    width_cm: number
    height_cm: number
    fragile?: boolean
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }>
  battery_weight_kg?: number
  fuel_reserve_percent?: number
  wind_condition?: 'calm' | 'moderate' | 'strong'
  mission_type?: 'delivery' | 'medical' | 'survey' | 'emergency'
  seed_date?: string
}

interface PackageAnalysis {
  id: string
  weight_kg: number
  volume_l: number
  dimensional_weight_kg: number
  cg_offset_x: number
  cg_offset_y: number
  fit_status: string
  placement_recommendation: string
  fragile_handling: string
  priority: string
}

interface PayloadResult {
  drone_model: string
  total_packages: number
  total_weight_kg: number
  max_payload_kg: number
  payload_utilization_percent: number
  weight_balance_status: string
  cg_x_offset: number
  cg_y_offset: number
  volume_utilization_percent: number
  safety_margin_kg: number
  flight_endurance_impact_percent: number
  wind_derating_percent: number
  package_analysis: PackageAnalysis[]
  loading_sequence: string[]
  recommendations: string[]
  go_no_go: 'GO' | 'MARGINAL' | 'NO-GO'
}

function optimizePayload(input: PayloadInput): PayloadResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(`${input.drone_model}${input.packages.length}${input.seed_date || '2026-08-21'}`)

  const maxPayload = drone.maxPayloadKg
  const windDerating = input.wind_condition === 'strong' ? 15 : input.wind_condition === 'moderate' ? 5 : 0
  const effectiveMax = maxPayload * (1 - windDerating / 100)

  const packages = input.packages || []
  let totalWeight = 0
  const packageAnalysis: PackageAnalysis[] = []

  for (const pkg of packages) {
    const volumeL = (pkg.length_cm * pkg.width_cm * pkg.height_cm) / 1000
    const dimWeight = round((pkg.length_cm * pkg.width_cm * pkg.height_cm) / 5000, 3)
    const cgOffX = round((rng() - 0.5) * 2, 2)
    const cgOffY = round((rng() - 0.5) * 2, 2)
    const fitOk = pkg.length_cm <= 50 && pkg.width_cm <= 50 && pkg.height_cm <= 40 && pkg.weight_kg <= effectiveMax
    const placement = cgOffX >= -0.5 && cgOffX <= 0.5 && cgOffY >= -0.5 && cgOffY <= 0.5
      ? 'Center bay — optimal CG'
      : `Offset bay (${cgOffX > 0 ? 'right' : 'left'} ${Math.abs(cgOffX).toFixed(1)}cm, ${cgOffY > 0 ? 'forward' : 'aft'} ${Math.abs(cgOffY).toFixed(1)}cm)`

    packageAnalysis.push({
      id: pkg.id,
      weight_kg: pkg.weight_kg,
      volume_l: round(volumeL, 2),
      dimensional_weight_kg: dimWeight,
      cg_offset_x: cgOffX,
      cg_offset_y: cgOffY,
      fit_status: fitOk ? 'FITS' : (pkg.length_cm > 50 || pkg.width_cm > 50 || pkg.height_cm > 40 ? 'OVERSIZE' : 'OVERWEIGHT'),
      placement_recommendation: placement,
      fragile_handling: pkg.fragile ? 'Secure with vibration-dampened mount' : 'Standard clamp',
      priority: pkg.priority || 'medium',
    })
    totalWeight += pkg.weight_kg
  }

  totalWeight = round(totalWeight, 3)
  const utilization = round((totalWeight / effectiveMax) * 100, 1)
  const safetyMargin = round(effectiveMax - totalWeight, 3)
  const cgX = packageAnalysis.reduce((s, p) => s + p.cg_offset_x * p.weight_kg, 0) / Math.max(totalWeight, 0.01)
  const cgY = packageAnalysis.reduce((s, p) => s + p.cg_offset_y * p.weight_kg, 0) / Math.max(totalWeight, 0.01)

  const balanceStatus = Math.abs(cgX) <= 1 && Math.abs(cgY) <= 1
    ? 'BALANCED'
    : Math.abs(cgX) <= 2 && Math.abs(cgY) <= 2
      ? 'ACCEPTABLE'
      : 'UNBALANCED'

  const enduranceImpact = clamp(round(utilization * 0.8 + rng() * 5, 1), 5, 95)
  const volumeUtil = clamp(round(packageAnalysis.reduce((s, p) => s + p.volume_l, 0) / 30 * 100, 1), 10, 95)

  const loadingSeq = [...packageAnalysis]
    .sort((a, b) => {
      const prioMap: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      return (prioMap[a.priority] || 2) - (prioMap[b.priority] || 2)
    })
    .map(p => `${p.id} (${p.weight_kg}kg, ${p.priority})`)

  const recommendations: string[] = []
  if (utilization > 90) recommendations.push('CRITICAL: Payload near maximum — reduce wind exposure and reduce flight altitude.')
  else if (utilization > 75) recommendations.push('Payload high — monitor energy consumption and reduce aggressive maneuvers.')
  else recommendations.push('Payload within safe operating range.')

  if (balanceStatus !== 'BALANCED') recommendations.push(`CG offset CGx=${cgX.toFixed(2)}, CGy=${cgY.toFixed(2)} — adjust loading or counterbalance.`)
  if (windDerating > 0) recommendations.push(`Wind derating of ${windDerating}% applied — effective max payload ${effectiveMax.toFixed(2)}kg.`)
  const fragileCount = packageAnalysis.filter(p => p.fragile_handling.includes('dampened')).length
  if (fragileCount > 0) recommendations.push(`${fragileCount} fragile package(s) — enable vibration dampening and reduce cruise speed by 10%.`)

  const goNoGo: 'GO' | 'MARGINAL' | 'NO-GO' = utilization <= 75 ? 'GO' : utilization <= 90 ? 'MARGINAL' : 'NO-GO'

  return {
    drone_model: input.drone_model,
    total_packages: packages.length,
    total_weight_kg: totalWeight,
    max_payload_kg: round(effectiveMax, 2),
    payload_utilization_percent: utilization,
    weight_balance_status: balanceStatus,
    cg_x_offset: round(cgX, 3),
    cg_y_offset: round(cgY, 3),
    volume_utilization_percent: volumeUtil,
    safety_margin_kg: safetyMargin,
    flight_endurance_impact_percent: enduranceImpact,
    wind_derating_percent: windDerating,
    package_analysis: packageAnalysis,
    loading_sequence: loadingSeq,
    recommendations,
    go_no_go: goNoGo,
  }
}

function formatPayload(r: PayloadResult): string {
  const lines: string[] = []
  lines.push('# Drone Payload Weight & Balance Report')
  lines.push(`Drone: ${r.drone_model}`)
  lines.push(`GO/NO-GO: **${r.go_no_go}**`)
  lines.push(`Total Packages: ${r.total_packages}`)
  lines.push(`Total Weight: ${r.total_weight_kg}kg (${kgToLb(r.total_weight_kg)}lb)`)
  lines.push(`Max Payload: ${r.max_payload_kg}kg  (utilization: ${r.payload_utilization_percent}%)`)
  lines.push(`Safety Margin: ${r.safety_margin_kg}kg`)
  lines.push(`Weight Balance: ${r.weight_balance_status}`)
  lines.push(`CG Offset: X=${r.cg_x_offset}, Y=${r.cg_y_offset}`)
  lines.push(`Volume Utilization: ${r.volume_utilization_percent}%`)
  lines.push(`Endurance Impact: -${r.flight_endurance_impact_percent}%`)
  lines.push(`Wind Derating: ${r.wind_derating_percent}%`)
  lines.push('')
  lines.push('## Package Analysis')
  r.package_analysis.forEach(p => {
    lines.push(`- ${p.id}: ${p.weight_kg}kg | ${p.volume_l}L | ${p.fit_status} | ${p.placement_recommendation} | ${p.fragile_handling} | Priority: ${p.priority}`)
  })
  lines.push('')
  lines.push('## Loading Sequence (Priority Order)')
  r.loading_sequence.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(n => lines.push(`- ${n}`))
  return lines.join('\n')
}

// =====================================================================
// TOOL 3: weather_go_no_go
// Weather go/no-go decisions with wind shear alerts
// =====================================================================

interface WeatherInput {
  drone_model: string
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
  location?: string
  flight_altitude_m?: number
  mission_priority?: 'routine' | 'important' | 'critical' | 'emergency'
  seed_date?: string
}

interface WindShearAlert {
  level: string
  altitude_m: number
  delta_speed_kmh: number
  direction_change_deg: number
  recommendation: string
}

interface WeatherResult {
  location: string
  drone_model: string
  go_no_go: 'GO' | 'GO WITH RESTRICTIONS' | 'HOLD' | 'NO-GO'
  overall_risk_score: number
  overall_risk_level: string
  temperature_status: string
  wind_status: string
  gust_status: string
  visibility_status: string
  precipitation_status: string
  humidity_status: string
  cloud_ceiling_status: string
  wind_shear_alerts: WindShearAlert[]
  parameter_scores: Array<{ parameter: string; score: number; status: string }>
  mission_adjustments: string[]
  max_safe_wind_kmh: number
  max_safe_gust_kmh: number
  recommended_departure_window: string
  monitoring_requirements: string[]
}

function assessWeather(input: WeatherInput): WeatherResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(`${input.location || 'site'}${input.seed_date || '2026-08-21'}`)

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

  const maxWind = drone.cruiseSpeedKmh * 0.4
  const maxGust = drone.cruiseSpeedKmh * 0.55

  const paramScores: Array<{ parameter: string; score: number; status: string }> = []

  // Temperature
  const tempOk = temp >= -10 && temp <= 45
  const tempScore = tempOk ? clamp(round(10 - Math.abs(temp - 22) * 0.3, 1), 1, 10) : 2
  paramScores.push({ parameter: 'Temperature', score: tempScore, status: tempOk ? 'OK' : 'OUT OF RANGE' })

  // Wind
  const windOk = wind <= maxWind
  const windScore = clamp(round(10 - wind / maxWind * 8, 1), 1, 10)
  paramScores.push({ parameter: 'Wind', score: windScore, status: windOk ? 'OK' : `EXCEEDS LIMIT (${round(maxWind,1)}km/h)` })

  // Gusts
  const gustOk = gust <= maxGust
  const gustScore = clamp(round(10 - gust / maxGust * 8, 1), 1, 10)
  paramScores.push({ parameter: 'Gusts', score: gustScore, status: gustOk ? 'OK' : `EXCEEDS LIMIT (${round(maxGust,1)}km/h)` })

  // Visibility
  const visScore = clamp(round(vis / 5 * 7 + 3, 1), 2, 10)
  paramScores.push({ parameter: 'Visibility', score: visScore, status: vis >= 5 ? 'GOOD' : vis >= 1 ? 'REDUCED' : 'DANGEROUS' })

  // Precipitation
  const precipScore = clamp(round(10 - precip * 2, 1), 1, 10)
  paramScores.push({ parameter: 'Precipitation', score: precipScore, status: precip < 1 ? 'NONE/LIGHT' : precip < 3 ? 'MODERATE' : 'HEAVY' })

  // Humidity
  const humidScore = humid > 90 ? 3 : humid > 80 ? 5 : 8
  paramScores.push({ parameter: 'Humidity', score: humidScore, status: humid < 70 ? 'OK' : humid < 85 ? 'ELEVATED' : 'HIGH' })

  // Wind shear alerts
  const shearAlerts: WindShearAlert[] = []
  if (shear) {
    const shearAlts = [50, 100, 200].filter(a => a <= (input.flight_altitude_m || 120))
    for (const alt of shearAlts.slice(0, 2)) {
      const delta = round(10 + rng() * 20, 1)
      const dirChange = round(30 + rng() * 90, 0)
      const level = delta > 25 ? 'SEVERE' : delta > 15 ? 'MODERATE' : 'LOW'
      shearAlerts.push({
        level,
        altitude_m: alt,
        delta_speed_kmh: delta,
        direction_change_deg: dirChange,
        recommendation: level === 'SEVERE' ? `AVOID ${alt}m altitude — severe wind shear`
          : level === 'MODERATE' ? `Caution at ${alt}m — moderate shear, reduce speed`
          : `Monitor ${alt}m — low shear detectable`,
      })
    }
  }
  if (microburst) {
    shearAlerts.push({
      level: 'EXTREME',
      altitude_m: 80,
      delta_speed_kmh: round(40 + rng() * 30, 1),
      direction_change_deg: 180,
      recommendation: 'MICROBURST RISK — Ground all aircraft immediately',
    })
  }
  if (icing) {
    shearAlerts.push({
      level: 'HAZARD',
      altitude_m: 120,
      delta_speed_kmh: 0,
      direction_change_deg: 0,
      recommendation: 'ICING CONDITIONS — risk of rotor ice buildup',
    })
  }

  // Cloud ceiling
  const ceilingOk = ceiling >= 120
  paramScores.push({ parameter: 'Cloud Ceiling', score: ceilingOk ? 7 : 3, status: ceilingOk ? 'ABOVE MINIMUM' : 'BELOW 120m' })

  // Averages
  const avgScore = round(paramScores.reduce((s, p) => s + p.score, 0) / paramScores.length, 2)
  const overallRisk = 10 - avgScore
  const riskLevel = overallRisk <= 3 ? 'LOW' : overallRisk <= 5 ? 'MODERATE' : overallRisk <= 7 ? 'HIGH' : 'EXTREME'

  const priority = input.mission_priority || 'routine'
  const goNoGo: 'GO' | 'GO WITH RESTRICTIONS' | 'HOLD' | 'NO-GO' =
    microburst || overallRisk > 7 ? 'NO-GO'
    : icing && priority !== 'emergency' ? 'NO-GO'
    : overallRisk > 5 ? 'HOLD'
    : overallRisk > 3 ? 'GO WITH RESTRICTIONS'
    : 'GO'

  const adjustments: string[] = []
  if (wind > maxWind * 0.7) adjustments.push(`Reduce cruise speed by ${round((wind / maxWind) * 15,0)}% for wind margin.`)
  if (gust > maxGust * 0.7) adjustments.push('Enable gust-stabilization mode and increase altitude buffer.')
  if (precip > 2) adjustments.push('Seal payload bay — water ingress risk elevated.')
  if (vis < 3) adjustments.push('Activate terrain-following radar and reduce cruise speed.')
  if (icing) adjustments.push('Pre-heat rotors and limit flight duration to 15 min.')
  if (adjustments.length === 0) adjustments.push('Standard flight parameters — no adjustments needed.')

  const monitoring: string[] = []
  monitoring.push('Continuous wind speed checks every 2 min during flight.')
  if (shear) monitoring.push('Real-time wind shear detection active — auto-abort on severe alert.')
  monitoring.push('Battery temperature monitoring in cold/hot conditions.')
  if (precip > 1) monitoring.push('Precipitation sensor active — return-to-base on heavy rain.')
  if (priority === 'emergency') monitoring.push('Emergency mission: elevated risk tolerance applied.')

  const departWindow = goNoGo === 'NO-GO' ? 'No departure — conditions unsafe'
    : goNoGo === 'HOLD' ? 'Hold for 30-min weather update'
    : `Depart within ${round(15 + rng() * 30, 0)} minutes`

  return {
    location: input.location || 'Undefined Site',
    drone_model: input.drone_model,
    go_no_go: goNoGo,
    overall_risk_score: round(overallRisk, 2),
    overall_risk_level: riskLevel,
    temperature_status: `${round(temp, 1)}C`,
    wind_status: `${round(wind, 1)} km/h (limit ${round(maxWind,1)})`,
    gust_status: `${round(gust, 1)} km/h (limit ${round(maxGust,1)})`,
    visibility_status: `${round(vis, 1)} km`,
    precipitation_status: `${round(precip, 1)} mm/h`,
    humidity_status: `${round(humid, 1)}%`,
    cloud_ceiling_status: `${round(ceiling, 0)} m`,
    wind_shear_alerts: shearAlerts,
    parameter_scores: paramScores,
    mission_adjustments: adjustments,
    max_safe_wind_kmh: round(maxWind, 1),
    max_safe_gust_kmh: round(maxGust, 1),
    recommended_departure_window: departWindow,
    monitoring_requirements: monitoring,
  }
}

function formatWeather(r: WeatherResult): string {
  const lines: string[] = []
  lines.push('# Weather GO/NO-GO Decision Report')
  lines.push(`Location: ${r.location}`)
  lines.push(`Drone: ${r.drone_model}`)
  lines.push(`GO/NO-GO: **${r.go_no_go}**`)
  lines.push(`Overall Risk: ${r.overall_risk_level} (score ${r.overall_risk_score}/10)`)
  lines.push('')
  lines.push('## Weather Parameters')
  r.parameter_scores.forEach(p => {
    lines.push(`- ${p.parameter}: ${p.score}/10 — ${p.status}`)
  })
  lines.push('')
  lines.push(`Wind: ${r.wind_status} | Gusts: ${r.gust_status}`)
  lines.push(`Visibility: ${r.visibility_status} | Precipitation: ${r.precipitation_status}`)
  lines.push(`Humidity: ${r.humidity_status} | Cloud Ceiling: ${r.cloud_ceiling_status}`)
  lines.push(`Temperature: ${r.temperature_status}`)
  lines.push('')
  if (r.wind_shear_alerts.length > 0) {
    lines.push('## Wind Shear & Hazard Alerts')
    r.wind_shear_alerts.forEach(a => {
      lines.push(`- [${a.level}] Alt ${a.altitude_m}m: dV=${a.delta_speed_kmh}km/h, dir change ${a.direction_change_deg}deg — ${a.recommendation}`)
    })
    lines.push('')
  }
  lines.push('## Mission Adjustments')
  r.mission_adjustments.forEach(m => lines.push(`- ${m}`))
  lines.push('')
  lines.push('## Monitoring Requirements')
  r.monitoring_requirements.forEach(m => lines.push(`- ${m}`))
  lines.push('')
  lines.push(`Departure Window: ${r.recommended_departure_window}`)
  return lines.join('\n')
}

// =====================================================================
// TOOL 4: battery_range_calculator
// Battery range calculation with swap/charge strategy
// =====================================================================

interface BatteryInput {
  drone_model: string
  battery_capacity_percent?: number
  payload_kg?: number
  average_speed_kmh?: number
  altitude_m?: number
  wind_speed_kmh?: number
  wind_direction_deg?: number
  temperature_c?: number
  distance_km?: number
  reserve_percent?: number
  swap_stations?: Array<{ name: string; distance_km: number; battery_available: boolean }>
  seed_date?: string
}

interface BatterySegment {
  segment: string
  distance_km: number
  avg_speed_kmh: number
  power_draw_percent_per_km: number
  energy_used_percent: number
  soc_start_percent: number
  soc_end_percent: number
}

interface BatteryResult {
  drone_model: string
  battery_capacity_wh: number
  initial_soc_percent: number
  target_soc_percent: number
  usable_energy_wh: number
  max_theoretical_range_km: number
  adjusted_range_km: number
  payload_derating_percent: number
  wind_derating_percent: number
  temperature_derating_percent: number
  speed_derating_percent: number
  total_derating_percent: number
  single_charge_range_km: number
  mission_distance_km: number
  mission_feasible: boolean
  mission_soc_end_percent: number
  total_flight_time_min: number
  segments: BatterySegment[]
  swap_strategy: string
  swap_stations_used: number
  total_swap_time_min: number
  total_mission_time_min: number
  charging_strategy: string
  range_buffer_percent: number
  recommendations: string[]
}

function calculateBatteryRange(input: BatteryInput): BatteryResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(`${input.drone_model}${input.seed_date || '2026-08-21'}`)

  const initialSoc = input.battery_capacity_percent ?? 100
  const reserve = input.reserve_percent ?? 15
  const usablePercent = initialSoc - reserve
  const usableEnergy = drone.batteryWh * (usablePercent / 100)

  const payload = input.payload_kg || 0
  const payloadDerating = clamp(round((payload / drone.maxPayloadKg) * 25, 1), 0, 30)

  const speed = input.average_speed_kmh || drone.cruiseSpeedKmh
  const speedRatio = speed / drone.cruiseSpeedKmh
  const speedDerating = clamp(round((speedRatio - 1) * 15, 1), -5, 20)

  const altitude = input.altitude_m || 120
  const altDerating = altitude > 300 ? clamp(round((altitude - 300) / 100 * 1.5, 1), 0, 10) : 0

  const wind = input.wind_speed_kmh || 0
  const windDir = input.wind_direction_deg || 0
  const headwindFactor = Math.abs(Math.cos((windDir * Math.PI) / 180))
  const windDerating = clamp(round(wind * headwindFactor * 0.4, 1), 0, 25)

  const temp = input.temperature_c ?? 20
  let tempDerating = 0
  if (temp < 0) tempDerating = clamp(round(Math.abs(temp) * 1.5, 1), 0, 25)
  else if (temp < 10) tempDerating = clamp(round((10 - temp) * 0.8, 1), 0, 8)
  else if (temp > 40) tempDerating = clamp(round((temp - 40) * 1.2, 1), 0, 15)

  const totalDerating = clamp(payloadDerating + speedDerating + windDerating + tempDerating + altDerating, 0, 60)
  const adjustedRange = round(drone.rangeKm * (1 - totalDerating / 100), 2)

  const missionDist = input.distance_km || adjustedRange * 0.8

  // Calculate segments
  const segments: BatterySegment[] = []
  const segNames = ['Climb', 'Cruise Out', 'Descent', 'Cruise Return', 'Approach']
  const segDists = [
    Math.max(0.2, missionDist * 0.05),
    missionDist * 0.4,
    Math.max(0.2, missionDist * 0.05),
    missionDist * 0.4,
    Math.max(0.1, missionDist * 0.1),
  ]
  const segSpeeds = [speed * 0.7, speed, speed * 0.8, speed, speed * 0.6]
  const powerMultipliers = [1.4, 1.0, 0.9, 1.0, 1.2]

  let socNow = initialSoc
  for (let i = 0; i < segNames.length; i++) {
    const energyPerKm = ((100 - reserve) / adjustedRange) * powerMultipliers[i]
    const energyUsed = Math.min(segDists[i] * energyPerKm, socNow - reserve)
    segments.push({
      segment: segNames[i],
      distance_km: round(segDists[i], 2),
      avg_speed_kmh: round(segSpeeds[i], 1),
      power_draw_percent_per_km: round(energyPerKm, 3),
      energy_used_percent: round(energyUsed, 2),
      soc_start_percent: round(socNow, 1),
      soc_end_percent: round(Math.max(socNow - energyUsed, reserve), 1),
    })
    socNow = Math.max(socNow - energyUsed, reserve)
  }

  const socEnd = segments.length > 0 ? segments[segments.length - 1].soc_end_percent : initialSoc
  const totalFlightMin = round(segments.reduce((s, seg) => s + (seg.distance_km / seg.avg_speed_kmh) * 60, 0), 1)
  const missionFeasible = socEnd >= reserve && missionDist <= adjustedRange

  // Swap/charge strategy
  const swapStations = input.swap_stations || []
  let swapStationsUsed = 0
  let swapStrategy = 'No swap needed — single charge sufficient'
  let totalSwapTime = 0
  let chargeStrategy = 'Complete charge to 100% at base'

  if (!missionFeasible) {
    let remainingDist = missionDist
    let currentRange = adjustedRange
    const sorted = [...swapStations].sort((a, b) => a.distance_km - b.distance_km)
    for (const st of sorted) {
      if (st.battery_available && st.distance_km <= currentRange) {
        swapStationsUsed++
        remainingDist -= st.distance_km
        currentRange = adjustedRange
        totalSwapTime += 5
      }
    }
    swapStrategy = swapStationsUsed > 0
      ? `Battery swap at ${swapStationsUsed} station(s) — adds ${totalSwapTime}min`
      : 'Mission distance exceeds single-charge range — deploy additional drones or reduce payload'
    chargeStrategy = swapStationsUsed > 0
      ? 'Hot-swap batteries at stations (90s swap time each)'
      : 'Pre-position charged batteries along route'
  } else if (adjustedRange - missionDist < adjustedRange * 0.15) {
    swapStrategy = 'Tight range margin — position emergency battery at midpoint'
    chargeStrategy = 'Use rapid charge (80% in 30min) for turnaround missions'
  }

  const totalMissionTime = round(totalFlightMin + totalSwapTime, 1)
  const rangeBuffer = clamp(round(((adjustedRange - missionDist) / adjustedRange) * 100, 1), 0, 100)

  const recommendations: string[] = []
  if (!missionFeasible) recommendations.push('Mission NOT feasible on single charge — use battery swap strategy or reduce payload.')
  if (payloadDerating > 15) recommendations.push(`High payload derating (${payloadDerating}%) — remove non-essential payload.`)
  if (tempDerating > 10) recommendations.push('Extreme temperature derating — pre-condition battery or limit flight time.')
  if (windDerating > 10) recommendations.push(`Strong headwind (${round(wind,1)}km/h) — adjust route to reduce headwind exposure.`)
  if (rangeBuffer < 15) recommendations.push('Range buffer below 15% — maintain reserve and monitor SoC closely.')
  if (socEnd - reserve < 10) recommendations.push('Low state-of-charge margin — abort threshold approaching.')
  if (recommendations.length === 0) recommendations.push('Battery plan is within safe operating margins.')

  return {
    drone_model: input.drone_model,
    battery_capacity_wh: drone.batteryWh,
    initial_soc_percent: initialSoc,
    target_soc_percent: reserve,
    usable_energy_wh: round(usableEnergy, 1),
    max_theoretical_range_km: drone.rangeKm,
    adjusted_range_km: adjustedRange,
    payload_derating_percent: payloadDerating,
    wind_derating_percent: windDerating,
    temperature_derating_percent: tempDerating,
    speed_derating_percent: speedDerating,
    total_derating_percent: round(totalDerating, 1),
    single_charge_range_km: adjustedRange,
    mission_distance_km: round(missionDist, 2),
    mission_feasible: missionFeasible,
    mission_soc_end_percent: round(socEnd, 1),
    total_flight_time_min: totalFlightMin,
    segments,
    swap_strategy: swapStrategy,
    swap_stations_used: swapStationsUsed,
    total_swap_time_min: totalSwapTime,
    total_mission_time_min: totalMissionTime,
    charging_strategy: chargeStrategy,
    range_buffer_percent: rangeBuffer,
    recommendations,
  }
}

function formatBattery(r: BatteryResult): string {
  const lines: string[] = []
  lines.push('# Battery Range & Swap/Charge Strategy Report')
  lines.push(`Drone: ${r.drone_model}`)
  lines.push(`Battery: ${r.battery_capacity_wh}Wh | Initial SoC: ${r.initial_soc_percent}% | Reserve Target: ${r.target_soc_percent}%`)
  lines.push(`Usable Energy: ${r.usable_energy_wh}Wh`)
  lines.push('')
  lines.push('## Range Analysis')
  lines.push(`Theoretical Range: ${r.max_theoretical_range_km}km (${kmToMi(r.max_theoretical_range_km)}mi)`)
  lines.push(`Adjusted Range: ${r.adjusted_range_km}km (${kmToMi(r.adjusted_range_km)}mi)`)
  lines.push(`Total Derating: -${r.total_derating_percent}% (payload ${r.payload_derating_percent}% + wind ${r.wind_derating_percent}% + temp ${r.temperature_derating_percent}% + speed ${r.speed_derating_percent}%)`)
  lines.push('')
  lines.push('## Mission Assessment')
  lines.push(`Mission Distance: ${r.mission_distance_km}km`)
  lines.push(`Feasible (single charge): ${r.mission_feasible ? 'YES' : 'NO'}`)
  lines.push(`End SoC: ${r.mission_soc_end_percent}% (target reserve: ${r.target_soc_percent}%)`)
  lines.push(`Flight Time: ${r.total_flight_time_min}min`)
  lines.push(`Range Buffer: ${r.range_buffer_percent}%`)
  lines.push('')
  lines.push('## Flight Segments')
  r.segments.forEach(s => {
    lines.push(`- ${s.segment}: ${s.distance_km}km @ ${s.avg_speed_kmh}km/h | ${s.soc_start_percent}% -> ${s.soc_end_percent}% SoC (${s.energy_used_percent}% used)`)
  })
  lines.push('')
  lines.push('## Swap/Charge Strategy')
  lines.push(`Strategy: ${r.swap_strategy}`)
  lines.push(`Stations Used: ${r.swap_stations_used}`)
  lines.push(`Swap Time Penalty: ${r.total_swap_time_min}min`)
  lines.push(`Total Mission Time: ${r.total_mission_time_min}min`)
  lines.push(`Charging Plan: ${r.charging_strategy}`)
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rec => lines.push(`- ${rec}`))
  return lines.join('\n')
}

// =====================================================================
// TOOL 5: airspace_compliance_checker
// Airspace compliance with UTM coordination
// =====================================================================

interface AirspaceInput {
  drone_model: string
  operation_area: { center_lat: number; center_lng: number; radius_km: number }
  altitude_m?: number
  flight_purpose?: 'commercial' | 'medical' | 'emergency' | 'recreational' | 'government'
  flight_type?: 'VLOS' | 'BVLOS' | 'autonomous'
  start_time?: string
  duration_min?: number
  nearby_airports?: Array<{ name: string; distance_km: number; class: string }>
  nearby_helipads?: Array<{ name: string; distance_km: number }>
  restricted_areas?: Array<{ name: string; type: string; active: boolean }>
  utm_provider?: string
  remote_id_enabled?: boolean
  detect_and_avoid?: boolean
  pilot_certification?: string
  insurance_verified?: boolean
  seed_date?: string
}

interface ComplianceCheck {
  requirement: string
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT APPLICABLE'
  detail: string
  regulation: string
}

interface UTMStatus {
  provider: string
  flight_plan_submitted: boolean
  clearance_status: string
  corridor_assigned: boolean
  traffic_deconfliction: string
  real_time_monitoring: boolean
}

interface AirspaceResult {
  operation_area: AirspaceInput['operation_area']
  drone_model: string
  overall_compliance: 'COMPLIANT' | 'PARTIALLY COMPLIANT' | 'NON-COMPLIANT' | 'PENDING REVIEW'
  flight_category: string
  airspace_class: string
  max_permitted_altitude_m: number
  altitude_compliant: boolean
  checks: ComplianceCheck[]
  utm_status: UTMStatus
  required_documentation: string[]
  authorizations_needed: string[]
  restrictions: string[]
  operational_limits: string[]
  penalty_risk: string
  recommendations: string[]
  valid_from?: string;
  valid_until?: string;
}

function checkAirspaceCompliance(input: AirspaceInput): AirspaceResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(`${input.operation_area.center_lat}${input.operation_area.center_lng}${input.seed_date || '2026-08-21'}`)

  const altitude = input.altitude_m || 120
  const maxAlt = drone.maxAltitudeM > 5000 ? 120 : Math.min(drone.maxAltitudeM, 400)
  const altitudeOk = altitude <= maxAlt

  const flightType = input.flight_type || 'VLOS'
  const purpose = input.flight_purpose || 'commercial'

  const checks: ComplianceCheck[] = []

  // Altitude check
  checks.push({
    requirement: 'Altitude ceiling',
    status: altitudeOk ? 'PASS' : 'FAIL',
    detail: `Flight altitude ${altitude}m ${altitudeOk ? 'within' : 'exceeds'} ${maxAlt}m limit`,
    regulation: '14 CFR 107.51 / SORA',
  })

  // Remote ID
  const remoteId = input.remote_id_enabled ?? true
  checks.push({
    requirement: 'Remote ID broadcast',
    status: remoteId ? 'PASS' : 'FAIL',
    detail: remoteId ? 'Remote ID module active — broadcasting ID, position, altitude' : 'Remote ID NOT enabled — required for all Part 107 operations',
    regulation: '14 CFR 107.104 / EASA U-space',
  })

  // Detect & Avoid (BVLOS)
  const daa = input.detect_and_avoid ?? (flightType === 'BVLOS')
  checks.push({
    requirement: 'Detect & Avoid capability',
    status: daa || flightType !== 'BVLOS' ? 'PASS' : 'FAIL',
    detail: daa ? 'DAA system operational (radar + optical)' : (flightType === 'BVLOS' ? 'BVLOS REQUIRES DAA — not detected' : 'VLOS with visual observer'),
    regulation: '14 CFR 107.31 / SORA SAIL II',
  })

  // Pilot certification
  const pilotCert = input.pilot_certification || 'Part 107'
  checks.push({
    requirement: 'Pilot certification',
    status: 'PASS',
    detail: `Pilot holds ${pilotCert} certification`,
    regulation: '14 CFR Part 107 Remote Pilot',
  })

  // Insurance
  const insured = input.insurance_verified ?? true
  checks.push({
    requirement: 'Liability insurance',
    status: insured ? 'PASS' : 'FAIL',
    detail: insured ? 'Liability insurance verified ($1M minimum)' : 'Insurance NOT verified',
    regulation: 'Local regulation / operator requirement',
  })

  // Airport proximity
  const airports = input.nearby_airports || []
  for (const ap of airports) {
    const reqAuth = ap.distance_km < 8 && input.altitude_m !== undefined && input.altitude_m > 0
    checks.push({
      requirement: `Airport proximity: ${ap.name}`,
      status: reqAuth ? 'WARNING' : 'PASS',
      detail: `${ap.distance_km}km from ${ap.class} airport${reqAuth ? ' — LAANC/ATC authorization required' : ''}`,
      regulation: '14 CFR 107.41 / SORA ground risk',
    })
  }

  // Restricted areas
  const restricted = input.restricted_areas || []
  for (const ra of restricted) {
    checks.push({
      requirement: `Restricted area: ${ra.name}`,
      status: ra.active ? 'FAIL' : 'NOT APPLICABLE',
      detail: ra.active ? `Active ${ra.type} — flight PROHIBITED` : `Inactive ${ra.type} — clear`,
      regulation: 'FAA NOTAM / local authority',
    })
  }

  // Flight purpose
  checks.push({
    requirement: 'Flight purpose authorization',
    status: 'PASS',
    detail: `${purpose} operation — ${purpose === 'emergency' ? 'expedited approval' : 'standard authorization'}`,
    regulation: '14 CFR 107.41 / EASA',
  })

  // UTM coordination
  const utmProvider = input.utm_provider || pickFromList(rng, ['AirMap', 'Altitude Angel', 'Thales UTM', 'OneSky', 'Unifly'])
  const utmFlightPlan = rng() > 0.2
  const utmClearance = utmFlightPlan ? pickFromList(rng, ['APPROVED', 'APPROVED', 'PENDING', 'CONDITIONAL']) : 'NOT SUBMITTED'
  const utmCorridor = utmClearance === 'APPROVED' || utmClearance === 'CONDITIONAL'

  const utmStatus: UTMStatus = {
    provider: utmProvider,
    flight_plan_submitted: utmFlightPlan,
    clearance_status: utmClearance,
    corridor_assigned: utmCorridor,
    traffic_deconfliction: utmCorridor ? 'Active — cooperative separation' : 'Not available',
    real_time_monitoring: utmCorridor,
  }

  // Overall compliance
  const failCount = checks.filter(c => c.status === 'FAIL').length
  const warnCount = checks.filter(c => c.status === 'WARNING').length
  const overall: 'COMPLIANT' | 'PARTIALLY COMPLIANT' | 'NON-COMPLIANT' | 'PENDING REVIEW' =
    failCount > 0 ? 'NON-COMPLIANT'
    : utmClearance === 'PENDING' ? 'PENDING REVIEW'
    : warnCount > 0 ? 'PARTIALLY COMPLIANT'
    : 'COMPLIANT'

  const requiredDocs: string[] = []
  requiredDocs.push('Remote Pilot Certificate')
  requiredDocs.push('Drone registration certificate')
  if (flightType === 'BVLOS') requiredDocs.push('BVLOS operational waiver')
  if (purpose === 'commercial') requiredDocs.push('Commercial operation declaration')
  if (altitude > 120) requiredDocs.push('Altitude exemption request')
  requiredDocs.push('Flight plan (UTM submission)')
  if (!insured) requiredDocs.push('Proof of liability insurance')

  const authorizations: string[] = []
  if (airports.some(a => a.distance_km < 8)) authorizations.push('LAANC / ATC authorization for airport proximity')
  if (flightType === 'BVLOS') authorizations.push('BVLOS waiver (FAA Part 107.31)')
  if (altitude > 120) authorizations.push('Altitude exemption (>120m AGL)')
  if (restricted.some(r => r.active)) authorizations.push('Restricted area clearance')
  if (authorizations.length === 0) authorizations.push('Standard Part 107 authorization — no special waivers needed')

  const restrictions: string[] = []
  if (flightType === 'VLOS') restrictions.push('Maintain visual line of sight at all times')
  if (altitude > 120) restrictions.push('Altitude exceeds standard ceiling — special clearance required')
  if (airports.some(a => a.distance_km < 5)) restrictions.push('Stay below 60m within 5km of airport')
  if (restricted.some(r => r.active)) restrictions.push('Avoid active restricted areas')
  if (restrictions.length === 0) restrictions.push('Standard Part 107 restrictions apply')

  const opLimits: string[] = []
  opLimits.push(`Max altitude: ${maxAlt}m AGL`)
  opLimits.push(`Max speed: ${drone.maxSpeedKmh}km/h`)
  opLimits.push(`Operation radius: ${input.operation_area.radius_km}km`)
  opLimits.push(`Flight duration: ${input.duration_min || 30}min`)
  if (flightType === 'BVLOS') opLimits.push('BVLOS corridor width: 500m')
  opLimits.push('Yield right-of-way to manned aircraft')

  const penaltyRisk = failCount > 0 ? 'HIGH — operation prohibited until resolved'
    : warnCount > 0 ? 'MODERATE — conditional operation with restrictions'
    : 'LOW — full compliance'

  const recommendations: string[] = []
  if (failCount > 0) recommendations.push(`Resolve ${failCount} compliance failure(s) before flight.`)
  if (!utmFlightPlan) recommendations.push('Submit flight plan to UTM provider for deconfliction.')
  if (utmClearance === 'PENDING') recommendations.push('Await UTM clearance before departure.')
  if (!daa && flightType === 'BVLOS') recommendations.push('Install and activate Detect & Avoid system for BVLOS.')
  if (!remoteId) recommendations.push('Enable Remote ID broadcast — mandatory for all operations.')
  if (airports.some(a => a.distance_km < 8)) recommendations.push('Request LAANC authorization for airport proximity.')
  if (recommendations.length === 0) recommendations.push('All compliance checks passed — proceed with standard pre-flight.')

  return {
    operation_area: input.operation_area,
    drone_model: input.drone_model,
    overall_compliance: overall,
    flight_category: `${flightType} / ${purpose}`,
    airspace_class: 'Class G (uncontrolled)',
    max_permitted_altitude_m: maxAlt,
    altitude_compliant: altitudeOk,
    checks,
    utm_status: utmStatus,
    required_documentation: requiredDocs,
    authorizations_needed: authorizations,
    restrictions,
    operational_limits: opLimits,
    penalty_risk: penaltyRisk,
    recommendations,
  }
}

function formatAirspace(r: AirspaceResult): string {
  const lines: string[] = []
  lines.push('# Airspace Compliance & UTM Coordination Report')
  lines.push(`Drone: ${r.drone_model}`)
  lines.push(`Operation Area: ${r.operation_area.radius_km}km radius @ (${r.operation_area.center_lat}, ${r.operation_area.center_lng})`)
  lines.push(`Overall Compliance: **${r.overall_compliance}**`)
  lines.push(`Flight Category: ${r.flight_category}`)
  lines.push(`Airspace Class: ${r.airspace_class}`)
  lines.push(`Altitude Compliant: ${r.altitude_compliant ? 'YES' : 'NO'} (max ${r.max_permitted_altitude_m}m)`)
  lines.push('')
  lines.push('## Compliance Checks')
  r.checks.forEach(c => {
    lines.push(`- [${c.status}] ${c.requirement}: ${c.detail} (${c.regulation})`)
  })
  lines.push('')
  lines.push('## UTM Coordination')
  lines.push(`Provider: ${r.utm_status.provider}`)
  lines.push(`Flight Plan: ${r.utm_status.flight_plan_submitted ? 'Submitted' : 'Not submitted'}`)
  lines.push(`Clearance: ${r.utm_status.clearance_status}`)
  lines.push(`Corridor Assigned: ${r.utm_status.corridor_assigned ? 'YES' : 'NO'}`)
  lines.push(`Traffic Deconfliction: ${r.utm_status.traffic_deconfliction}`)
  lines.push(`Real-time Monitoring: ${r.utm_status.real_time_monitoring ? 'Active' : 'Inactive'}`)
  lines.push('')
  lines.push('## Required Documentation')
  r.required_documentation.forEach(d => lines.push(`- [ ] ${d}`))
  lines.push('')
  lines.push('## Authorizations Needed')
  r.authorizations_needed.forEach(a => lines.push(`- ${a}`))
  lines.push('')
  lines.push('## Operational Restrictions')
  r.restrictions.forEach(r2 => lines.push(`- ${r2}`))
  lines.push('')
  lines.push('## Operational Limits')
  r.operational_limits.forEach(l => lines.push(`- ${l}`))
  lines.push('')
  lines.push(`Penalty Risk: ${r.penalty_risk}`)
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rec => lines.push(`- ${rec}`))
  return lines.join('\n')
}

// =====================================================================
// TOOL 6: drone_fleet_dispatcher
// Drone fleet dispatch with emergency landing backup
// =====================================================================

interface FleetInput {
  fleet_size: number
  drone_model: string
  deliveries: Array<{
    id: string
    origin: { lat: number; lng: number }
    destination: { lat: number; lng: number }
    priority?: 'low' | 'medium' | 'high' | 'critical'
    payload_kg?: number
    deadline_min?: number
  }>
  available_drones?: number
  weather_ok?: boolean
  emergency_landing_sites?: Array<{ name: string; lat: number; lng: number; type: string }>
  seed_date?: string
}

interface DroneAssignment {
  drone_id: string
  delivery_id: string
  status: string
  estimated_departure: string
  estimated_arrival: string
  distance_km: number
  battery_required_percent: number
  priority: string
  emergency_site: string
}

interface FleetResult {
  fleet_size: number
  drone_model: string
  available_drones: number
  total_deliveries: number
  assigned_deliveries: number
  queued_deliveries: number
  assignments: DroneAssignment[]
  fleet_utilization_percent: number
  total_distance_km: number
  total_flight_time_min: number
  avg_battery_per_delivery_percent: number
  emergency_landing_sites_active: number
  emergency_protocols: string[]
  dispatch_timeline: string[]
  recommendations: string[]
  overall_status: 'OPERATIONAL' | 'CONSTRAINED' | 'CRITICAL'
}

function dispatchFleet(input: FleetInput): FleetResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(`${input.fleet_size}${input.deliveries.length}${input.seed_date || '2026-08-21'}`)

  const fleetSize = input.fleet_size
  const available = input.available_drones ?? Math.max(1, Math.floor(fleetSize * 0.85))
  const weatherOk = input.weather_ok ?? true

  const deliveries = [...(input.deliveries || [])].sort((a, b) => {
    const prioMap: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return (prioMap[a.priority || 'medium'] || 2) - (prioMap[b.priority || 'medium'] || 2)
  })

  const assignments: DroneAssignment[] = []
  const elSites = input.emergency_landing_sites || [
    { name: 'ELP-Alpha', lat: 0, lng: 0, type: 'park' },
    { name: 'ELP-Beta', lat: 0, lng: 0, type: 'rooftop' },
    { name: 'ELP-Gamma', lat: 0, lng: 0, type: 'open_field' },
  ]

  function haversineDist(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLng = (b.lng - a.lng) * Math.PI / 180
    const lat1 = a.lat * Math.PI / 180
    const lat2 = b.lat * Math.PI / 180
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
  }

  let droneIdx = 0
  let totalDist = 0
  let totalFlightMin = 0
  let totalBattery = 0

  for (const d of deliveries) {
    if (droneIdx >= available || !weatherOk) break
    const dist = round(haversineDist(d.origin, d.destination) + rng() * 1.5, 2)
    const flightMin = round((dist / drone.cruiseSpeedKmh) * 60 + 2, 1)
    const batteryPct = clamp(round((dist / drone.rangeKm) * 100 + rng() * 8, 1), 10, 95)
    const elp = pickFromList(rng, elSites)

    assignments.push({
      drone_id: `UAV-${String(droneIdx + 1).padStart(3, '0')}`,
      delivery_id: d.id,
      status: 'ASSIGNED',
      estimated_departure: `T+${round(droneIdx * 3, 0)}min`,
      estimated_arrival: `T+${round(droneIdx * 3 + flightMin, 1)}min`,
      distance_km: dist,
      battery_required_percent: batteryPct,
      priority: d.priority || 'medium',
      emergency_site: elp.name,
    })

    totalDist += dist
    totalFlightMin += flightMin
    totalBattery += batteryPct
    droneIdx++
  }

  const queued = deliveries.length - assignments.length
  const utilization = clamp(round((assignments.length / available) * 100, 1), 0, 100)
  const avgBattery = assignments.length > 0 ? round(totalBattery / assignments.length, 1) : 0

  const emergencyProtocols: string[] = []
  emergencyProtocols.push('All drones carry parachute recovery system')
  emergencyProtocols.push('Return-to-base on battery <20% or comm loss >30s')
  emergencyProtocols.push(`Emergency landing sites: ${elSites.map(s => s.name).join(', ')}`)
  emergencyProtocols.push('Auto-hover and alert on motor failure')
  emergencyProtocols.push('Geofence breach triggers immediate RTH')

  const timeline: string[] = []
  timeline.push('T+0: Pre-flight checks on all assigned drones')
  timeline.push(`T+2: First departure (UAV-001)`)
  assignments.forEach((a, i) => {
    if (i < 5) timeline.push(`${a.estimated_departure}: ${a.drone_id} departs for ${a.delivery_id} (${a.distance_km}km)`)
  })
  timeline.push(`T+${round(totalFlightMin + 5, 0)}: All deliveries complete — fleet returns to base`)

  const recommendations: string[] = []
  if (queued > 0) recommendations.push(`${queued} delivery(ies) queued — deploy additional drones or extend shift.`)
  if (avgBattery > 70) recommendations.push('High average battery usage — schedule mid-shift battery swap.')
  if (!weatherOk) recommendations.push('Weather HOLD — do not dispatch until conditions improve.')
  if (utilization > 90) recommendations.push('Fleet utilization above 90% — no capacity for surge demand.')
  if (assignments.length > 0 && assignments.some(a => a.battery_required_percent > 80)) {
    recommendations.push('Some deliveries require >80% battery — position emergency batteries.')
  }
  if (recommendations.length === 0) recommendations.push('Fleet dispatch plan is within normal operating parameters.')

  const overall: 'OPERATIONAL' | 'CONSTRAINED' | 'CRITICAL' =
    !weatherOk ? 'CRITICAL'
    : queued > assignments.length ? 'CONSTRAINED'
    : 'OPERATIONAL'

  return {
    fleet_size: fleetSize,
    drone_model: input.drone_model,
    available_drones: available,
    total_deliveries: deliveries.length,
    assigned_deliveries: assignments.length,
    queued_deliveries: queued,
    assignments,
    fleet_utilization_percent: utilization,
    total_distance_km: round(totalDist, 2),
    total_flight_time_min: round(totalFlightMin, 1),
    avg_battery_per_delivery_percent: avgBattery,
    emergency_landing_sites_active: elSites.length,
    emergency_protocols: emergencyProtocols,
    dispatch_timeline: timeline,
    recommendations,
    overall_status: overall,
  }
}

function formatFleet(r: FleetResult): string {
  const lines: string[] = []
  lines.push('# Drone Fleet Dispatch Plan')
  lines.push(`Fleet: ${r.fleet_size}x ${r.drone_model} | Available: ${r.available_drones}`)
  lines.push(`Overall Status: **${r.overall_status}**`)
  lines.push(`Deliveries: ${r.assigned_deliveries}/${r.total_deliveries} assigned (${r.queued_deliveries} queued)`)
  lines.push(`Fleet Utilization: ${r.fleet_utilization_percent}%`)
  lines.push(`Total Distance: ${r.total_distance_km}km | Total Flight Time: ${r.total_flight_time_min}min`)
  lines.push(`Avg Battery/Delivery: ${r.avg_battery_per_delivery_percent}%`)
  lines.push(`Emergency Landing Sites: ${r.emergency_landing_sites_active}`)
  lines.push('')
  lines.push('## Assignments')
  r.assignments.forEach(a => {
    lines.push(`- ${a.drone_id} -> ${a.delivery_id} | ${a.distance_km}km | ${a.battery_required_percent}% battery | ${a.priority} | ELP: ${a.emergency_site} | ${a.estimated_departure} -> ${a.estimated_arrival}`)
  })
  lines.push('')
  lines.push('## Emergency Protocols')
  r.emergency_protocols.forEach(p => lines.push(`- ${p}`))
  lines.push('')
  lines.push('## Dispatch Timeline')
  r.dispatch_timeline.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rec => lines.push(`- ${rec}`))
  return lines.join('\n')
}

// =====================================================================
// TOOL 7: noise_impact_assessor
// Noise impact assessment with route mitigation
// =====================================================================

interface NoiseInput {
  drone_model: string
  route_waypoints: Array<{ lat: number; lng: number; altitude_m?: number }>
  population_density_per_km2?: number
  sensitive_areas?: Array<{ name: string; type: string; distance_m: number; sensitivity: 'low' | 'medium' | 'high' }>
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night'
  ambient_noise_db?: number
  flight_frequency_per_day?: number
  altitude_m?: number
  seed_date?: string
}

interface NoiseZone {
  zone_name: string
  distance_m: number
  estimated_noise_db: number
  impact_level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  population_affected: number
  mitigation: string
}

interface NoiseResult {
  drone_model: string
  drone_noise_db: number
  route_length_km: number
  max_noise_at_ground_db: number
  avg_noise_at_ground_db: number
  noise_zones: NoiseZone[]
  sensitive_area_impacts: Array<{ name: string; type: string; impact: string; recommendation: string }>
  time_restriction: string
  altitude_recommendation_m: number
  speed_reduction_recommendation_percent: number
  route_deviation_recommendation: string
  overall_noise_rating: 'ACCEPTABLE' | 'MODERATE' | 'SIGNIFICANT' | 'EXCESSIVE'
  community_acceptance_score: number
  regulatory_compliance: string
  mitigation_measures: string[]
  recommendations: string[]
}

function assessNoiseImpact(input: NoiseInput): NoiseResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(`${input.drone_model}${input.route_waypoints.length}${input.seed_date || '2026-08-21'}`)

  const droneNoiseDb = drone.noiseDb
  const altitude = input.altitude_m || 120
  const popDensity = input.population_density_per_km2 || 2000
  const ambientDb = input.ambient_noise_db || 45
  const freq = input.flight_frequency_per_day || 10
  const timeOfDay = input.time_of_day || 'afternoon'

  // Route length
  function haversineDist(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLng = (b.lng - a.lng) * Math.PI / 180
    const lat1 = a.lat * Math.PI / 180
    const lat2 = b.lat * Math.PI / 180
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
  }

  let routeLen = 0
  for (let i = 0; i < input.route_waypoints.length - 1; i++) {
    routeLen += haversineDist(input.route_waypoints[i], input.route_waypoints[i + 1])
  }
  routeLen = round(routeLen, 2)

  // Noise attenuation with distance (simplified inverse square)
  const groundNoiseMax = round(droneNoiseDb - 20 * Math.log10(altitude / 1) * 0.5 - rng() * 3, 1)
  const groundNoiseAvg = round(groundNoiseMax - 3 - rng() * 2, 1)

  // Noise zones
  const noiseZones: NoiseZone[] = []
  const distances = [50, 100, 200, 500]
  for (const d of distances) {
    const attenDb = round(droneNoiseDb - 20 * Math.log10(d) - rng() * 2, 1)
    const impact: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' =
      attenDb > 65 ? 'SEVERE' : attenDb > 55 ? 'HIGH' : attenDb > 45 ? 'MODERATE' : 'LOW'
    const popAffected = round(Math.PI * (d / 1000) ** 2 * popDensity, 0)
    const mitigation = impact === 'SEVERE' ? 'Avoid overflight — mandatory detour'
      : impact === 'HIGH' ? 'Increase altitude to 150m+ or reroute'
      : impact === 'MODERATE' ? 'Acceptable with standard altitude'
      : 'No mitigation needed'
    noiseZones.push({
      zone_name: `Within ${d}m of route`,
      distance_m: d,
      estimated_noise_db: attenDb,
      impact_level: impact,
      population_affected: popAffected,
      mitigation,
    })
  }

  // Sensitive areas
  const sensitiveAreas = input.sensitive_areas || [
    { name: 'Riverside Elementary', type: 'school', distance_m: 150, sensitivity: 'high' as const },
    { name: 'St. Mary Hospital', type: 'hospital', distance_m: 300, sensitivity: 'high' as const },
    { name: 'Oakwood Nursing Home', type: 'nursing_home', distance_m: 200, sensitivity: 'high' as const },
  ]

  const sensitiveImpacts = sensitiveAreas.map(sa => {
    const noiseAtLoc = round(droneNoiseDb - 20 * Math.log10(Math.max(sa.distance_m, 1)) - rng() * 2, 1)
    const impact = noiseAtLoc > 55 && sa.sensitivity === 'high' ? 'HIGH IMPACT'
      : noiseAtLoc > 45 ? 'MODERATE IMPACT'
      : 'LOW IMPACT'
    const recommendation = impact === 'HIGH IMPACT' ? `Reroute — maintain >500m from ${sa.name}`
      : impact === 'MODERATE IMPACT' ? `Schedule flights outside ${sa.name} operating hours`
      : `Standard overflight acceptable near ${sa.name}`
    return { name: sa.name, type: sa.type, impact, recommendation }
  })

  // Time restrictions
  const timeRestriction = timeOfDay === 'night' ? 'Night operations (22:00-06:00) — noise curfew may apply, reduce altitude'
    : timeOfDay === 'evening' ? 'Evening operations (18:00-22:00) — moderate noise sensitivity'
    : 'Daytime operations — standard noise limits apply'

  const altRec = groundNoiseAvg > 55 ? 150 : groundNoiseAvg > 45 ? 120 : 90
  const speedReduction = groundNoiseAvg > 55 ? 20 : groundNoiseAvg > 45 ? 10 : 0

  const routeDeviation = noiseZones.some(z => z.impact_level === 'SEVERE')
    ? 'Mandatory 200m detour around high-noise zones'
    : noiseZones.some(z => z.impact_level === 'HIGH')
      ? 'Recommended 100m lateral offset from moderate zones'
      : 'Current route acceptable — no deviation needed'

  const overallRating: 'ACCEPTABLE' | 'MODERATE' | 'SIGNIFICANT' | 'EXCESSIVE' =
    groundNoiseAvg > 65 ? 'EXCESSIVE'
    : groundNoiseAvg > 55 ? 'SIGNIFICANT'
    : groundNoiseAvg > 45 ? 'MODERATE'
    : 'ACCEPTABLE'

  const communityScore = clamp(round(100 - (groundNoiseAvg - 35) * 3 - freq * 0.5, 1), 10, 95)

  const regulatoryCompliance = groundNoiseAvg <= 55
    ? 'COMPLIANT — within WHO/EPA daytime noise guidelines'
    : groundNoiseAvg <= 65
      ? 'CONDITIONAL — exceeds recommended levels, mitigation required'
      : 'NON-COMPLIANT — exceeds regulatory noise limits'

  const mitigationMeasures: string[] = []
  mitigationMeasures.push(`Maintain minimum altitude of ${altRec}m over populated areas`)
  if (speedReduction > 0) mitigationMeasures.push(`Reduce cruise speed by ${speedReduction}% to lower noise footprint`)
  mitigationMeasures.push(`Limit flight frequency to ${Math.max(3, Math.floor(freq * 0.7))} flights/day over same corridor`)
  if (timeOfDay === 'night' || timeOfDay === 'evening') mitigationMeasures.push('Avoid night/evening flights over residential areas')
  mitigationMeasures.push('Use noise-optimized flight paths (avoid direct overflight of sensitive areas)')
  mitigationMeasures.push('Deploy low-noise propellers if available')

  const recommendations: string[] = []
  if (overallRating === 'EXCESSIVE') recommendations.push('CRITICAL: Noise levels excessive — redesign route or change drone model.')
  if (overallRating === 'SIGNIFICANT') recommendations.push('Significant noise impact — implement all mitigation measures.')
  if (sensitiveImpacts.some(s => s.impact === 'HIGH IMPACT')) recommendations.push('High impact on sensitive areas — mandatory reroute required.')
  if (communityScore < 50) recommendations.push('Low community acceptance — engage with local stakeholders before operations.')
  if (regulatoryCompliance.includes('NON-COMPLIANT')) recommendations.push('Regulatory non-compliance — operation not permitted without noise mitigation.')
  if (recommendations.length === 0) recommendations.push('Noise impact within acceptable limits — proceed with standard operations.')

  return {
    drone_model: input.drone_model,
    drone_noise_db: droneNoiseDb,
    route_length_km: routeLen,
    max_noise_at_ground_db: groundNoiseMax,
    avg_noise_at_ground_db: groundNoiseAvg,
    noise_zones: noiseZones,
    sensitive_area_impacts: sensitiveImpacts,
    time_restriction: timeRestriction,
    altitude_recommendation_m: altRec,
    speed_reduction_recommendation_percent: speedReduction,
    route_deviation_recommendation: routeDeviation,
    overall_noise_rating: overallRating,
    community_acceptance_score: communityScore,
    regulatory_compliance: regulatoryCompliance,
    mitigation_measures: mitigationMeasures,
    recommendations,
  }
}

function formatNoise(r: NoiseResult): string {
  const lines: string[] = []
  lines.push('# Noise Impact Assessment Report')
  lines.push(`Drone: ${r.drone_model} (${r.drone_noise_db}dB at source)`)
  lines.push(`Route Length: ${r.route_length_km}km`)
  lines.push(`Overall Noise Rating: **${r.overall_noise_rating}**`)
  lines.push(`Max Ground Noise: ${r.max_noise_at_ground_db}dB | Avg: ${r.avg_noise_at_ground_db}dB`)
  lines.push(`Community Acceptance Score: ${r.community_acceptance_score}/100`)
  lines.push(`Regulatory Compliance: ${r.regulatory_compliance}`)
  lines.push('')
  lines.push('## Noise Zones')
  r.noise_zones.forEach(z => {
    lines.push(`- ${z.zone_name}: ${z.estimated_noise_db}dB | ${z.impact_level} | Pop. affected: ~${z.population_affected} | ${z.mitigation}`)
  })
  lines.push('')
  lines.push('## Sensitive Area Impacts')
  r.sensitive_area_impacts.forEach(s => {
    lines.push(`- ${s.name} (${s.type}): ${s.impact} — ${s.recommendation}`)
  })
  lines.push('')
  lines.push(`Time Restriction: ${r.time_restriction}`)
  lines.push(`Altitude Recommendation: ${r.altitude_recommendation_m}m`)
  lines.push(`Speed Reduction: ${r.speed_reduction_recommendation_percent}%`)
  lines.push(`Route Deviation: ${r.route_deviation_recommendation}`)
  lines.push('')
  lines.push('## Mitigation Measures')
  r.mitigation_measures.forEach(m => lines.push(`- ${m}`))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rec => lines.push(`- ${rec}`))
  return lines.join('\n')
}

// =====================================================================
// TOOL 8: delivery_station_sitter
// Delivery station planning with visual positioning layout
// =====================================================================

interface StationInput {
  area_bounds: { north_lat: number; south_lat: number; east_lng: number; west_lng: number }
  population_served: number
  avg_daily_deliveries: number
  terrain_type?: 'urban' | 'suburban' | 'rural' | 'mixed'
  existing_infrastructure?: string[]
  visual_positioning_required?: boolean
  min_coverage_radius_km?: number
  max_stations?: number
  budget_constraint?: 'low' | 'medium' | 'high'
  seed_date?: string
}

interface StationProposal {
  station_id: string
  name: string
  lat: number
  lng: number
  type: 'hub' | 'spoke' | 'micro'
  coverage_radius_km: number
  estimated_daily_deliveries: number
  visual_markers: number
  landing_pads: number
  charging_points: number
  connectivity: string
  accessibility: string
  estimated_cost_usd: number
  priority: 'high' | 'medium' | 'low'
}

interface StationResult {
  area_bounds: StationInput['area_bounds']
  total_area_km2: number
  population_served: number
  avg_daily_deliveries: number
  terrain_type: string
  stations_proposed: number
  stations: StationProposal[]
  total_coverage_km2: number
  coverage_percent: number
  total_landing_pads: number
  total_charging_points: number
  total_visual_markers: number
  total_estimated_cost_usd: number
  visual_positioning_layout: string[]
  connectivity_plan: string[]
  phased_rollout: string[]
  recommendations: string[]
}

function planDeliveryStations(input: StationInput): StationResult {
  const rng = seededRng(`${input.area_bounds.north_lat}${input.area_bounds.east_lng}${input.seed_date || '2026-08-21'}`)

  const bounds = input.area_bounds
  const latSpan = Math.abs(bounds.north_lat - bounds.south_lat)
  const lngSpan = Math.abs(bounds.east_lng - bounds.west_lng)
  const avgLat = (bounds.north_lat + bounds.south_lat) / 2
  const kmPerDegLat = 111
  const kmPerDegLng = 111 * Math.cos(avgLat * Math.PI / 180)
  const areaKm2 = round(latSpan * kmPerDegLat * lngSpan * kmPerDegLng, 2)

  const terrain = input.terrain_type || 'mixed'
  const maxStations = input.max_stations || clamp(Math.ceil(areaKm2 / 15), 2, 12)
  const coverageRadius = input.min_coverage_radius_km || 3
  const vpRequired = input.visual_positioning_required ?? true
  const budget = input.budget_constraint || 'medium'

  // Generate station proposals
  const stations: StationProposal[] = []
  const numStations = maxStations
  const centerLat = avgLat
  const centerLng = (bounds.east_lng + bounds.west_lng) / 2

  for (let i = 0; i < numStations; i++) {
    const angle = (i / numStations) * 2 * Math.PI + rng() * 0.3
    const radiusKm = coverageRadius * (0.5 + rng() * 0.8)
    const dLat = (radiusKm / kmPerDegLat) * Math.sin(angle)
    const dLng = (radiusKm / kmPerDegLng) * Math.cos(angle)
    const lat = round(centerLat + dLat, 6)
    const lng = round(centerLng + dLng, 6)

    const type: 'hub' | 'spoke' | 'micro' = i === 0 ? 'hub' : (rng() > 0.6 ? 'spoke' : 'micro')
    const covRad = type === 'hub' ? coverageRadius * 1.5 : type === 'spoke' ? coverageRadius : coverageRadius * 0.7
    const dailyDel = type === 'hub' ? Math.ceil(input.avg_daily_deliveries * 0.4) : type === 'spoke' ? Math.ceil(input.avg_daily_deliveries * 0.2) : Math.ceil(input.avg_daily_deliveries * 0.1)
    const landingPads = type === 'hub' ? 4 : type === 'spoke' ? 2 : 1
    const chargingPts = type === 'hub' ? 8 : type === 'spoke' ? 4 : 2
    const vpMarkers = vpRequired ? (type === 'hub' ? 8 : type === 'spoke' ? 4 : 2) : 0
    const connectivity = type === 'hub' ? 'Fiber + 5G' : type === 'spoke' ? '5G + LTE' : 'LTE'
    const accessibility = type === 'hub' ? 'Road + pedestrian' : type === 'spoke' ? 'Road access' : 'Pedestrian + bike'
    const costBase = type === 'hub' ? 150000 : type === 'spoke' ? 60000 : 25000
    const cost = round(costBase * (0.8 + rng() * 0.4), 0)
    const priority: 'high' | 'medium' | 'low' = type === 'hub' ? 'high' : type === 'spoke' ? 'medium' : 'low'

    stations.push({
      station_id: `STN-${String(i + 1).padStart(3, '0')}`,
      name: `Station ${type === 'hub' ? 'Hub' : type === 'spoke' ? 'Spoke' : 'Micro'}-${String.fromCharCode(65 + i)}`,
      lat,
      lng,
      type,
      coverage_radius_km: round(covRad, 2),
      estimated_daily_deliveries: dailyDel,
      visual_markers: vpMarkers,
      landing_pads: landingPads,
      charging_points: chargingPts,
      connectivity,
      accessibility,
      estimated_cost_usd: cost,
      priority,
    })
  }

  const totalCoverage = round(stations.reduce((s, st) => s + Math.PI * st.coverage_radius_km ** 2, 0), 2)
  const coveragePct = clamp(round((totalCoverage / areaKm2) * 100, 1), 10, 100)
  const totalPads = stations.reduce((s, st) => s + st.landing_pads, 0)
  const totalCharging = stations.reduce((s, st) => s + st.charging_points, 0)
  const totalMarkers = stations.reduce((s, st) => s + st.visual_markers, 0)
  const totalCost = stations.reduce((s, st) => s + st.estimated_cost_usd, 0)

  // Visual positioning layout
  const vpLayout: string[] = []
  if (vpRequired) {
    vpLayout.push('Visual Positioning System (VPS) Layout:')
    vpLayout.push('- ArUco markers at 4 corners of each landing pad (20cm x 20cm)')
    vpLayout.push('- Infrared LED arrays for night operations (850nm wavelength)')
    vpLayout.push('- RTK-GNSS base station at each hub for cm-level positioning')
    vpLayout.push('- Visual fiducial markers on approach corridors (every 20m)')
    vpLayout.push('- Downward-facing camera with 60° FOV for precision landing')
    vpLayout.push('- Ultrasonic rangefinder for final 5m altitude hold')
    vpLayout.push(`- Total visual markers deployed: ${totalMarkers}`)
  } else {
    vpLayout.push('Visual positioning not required — GNSS-only navigation')
  }

  // Connectivity plan
  const connPlan: string[] = []
  connPlan.push('Connectivity Architecture:')
  connPlan.push('- Hub stations: Fiber backbone + 5G small cell')
  connPlan.push('- Spoke stations: 5G/LTE with satellite backup')
  connPlan.push('- Micro stations: LTE-M for telemetry and control')
  connPlan.push('- Mesh network between stations for redundancy')
  connPlan.push('- Edge computing node at each hub for local processing')

  // Phased rollout
  const phased: string[] = []
  const phase1 = stations.filter(s => s.type === 'hub')
  const phase2 = stations.filter(s => s.type === 'spoke')
  const phase3 = stations.filter(s => s.type === 'micro')
  phased.push(`Phase 1 (Month 1-3): Deploy ${phase1.length} hub station(s) — core coverage`)
  phased.push(`Phase 2 (Month 4-6): Deploy ${phase2.length} spoke station(s) — expand coverage`)
  phased.push(`Phase 3 (Month 7-9): Deploy ${phase3.length} micro station(s) — fill gaps`)
  phased.push(`Total estimated cost: $${totalCost.toLocaleString()} (${budget} budget)`)

  // Recommendations
  const recommendations: string[] = []
  if (coveragePct < 70) recommendations.push(`Coverage at ${coveragePct}% — consider adding ${Math.ceil((0.7 * areaKm2 - totalCoverage) / (Math.PI * coverageRadius ** 2))} more stations.`)
  if (budget === 'low' && totalCost > 500000) recommendations.push('Budget constraint LOW — prioritize hub stations and defer micro stations.')
  if (terrain === 'urban') recommendations.push('Urban terrain — use rooftop installations to minimize ground footprint.')
  if (terrain === 'rural') recommendations.push('Rural terrain — solar-powered stations with satellite backhaul recommended.')
  if (vpRequired && totalMarkers < 20) recommendations.push('Increase visual marker density for reliable precision landing.')
  recommendations.push(`Target: ${input.avg_daily_deliveries} daily deliveries across ${stations.length} stations (~${Math.ceil(input.avg_daily_deliveries / stations.length)} per station).`)
  recommendations.push('Conduct site surveys for each proposed station before final placement.')

  return {
    area_bounds: bounds,
    total_area_km2: areaKm2,
    population_served: input.population_served,
    avg_daily_deliveries: input.avg_daily_deliveries,
    terrain_type: terrain,
    stations_proposed: stations.length,
    stations,
    total_coverage_km2: totalCoverage,
    coverage_percent: coveragePct,
    total_landing_pads: totalPads,
    total_charging_points: totalCharging,
    total_visual_markers: totalMarkers,
    total_estimated_cost_usd: totalCost,
    visual_positioning_layout: vpLayout,
    connectivity_plan: connPlan,
    phased_rollout: phased,
    recommendations,
  }
}

function formatStation(r: StationResult): string {
  const lines: string[] = []
  lines.push('# Delivery Station Planning & Visual Positioning Report')
  lines.push(`Area: ${r.total_area_km2}km2 | Population: ${r.population_served} | Daily Deliveries: ${r.avg_daily_deliveries}`)
  lines.push(`Terrain: ${r.terrain_type}`)
  lines.push(`Stations Proposed: ${r.stations_proposed}`)
  lines.push(`Coverage: ${r.total_coverage_km2}km2 (${r.coverage_percent}%)`)
  lines.push(`Total Landing Pads: ${r.total_landing_pads} | Charging Points: ${r.total_charging_points} | Visual Markers: ${r.total_visual_markers}`)
  lines.push(`Total Estimated Cost: $${r.total_estimated_cost_usd.toLocaleString()}`)
  lines.push('')
  lines.push('## Station Proposals')
  r.stations.forEach(s => {
    lines.push(`- ${s.station_id} ${s.name} (${s.type}) @ (${s.lat}, ${s.lng})`)
    lines.push(`  Coverage: ${s.coverage_radius_km}km | Daily: ${s.estimated_daily_deliveries} | Pads: ${s.landing_pads} | Charging: ${s.charging_points} | Markers: ${s.visual_markers}`)
    lines.push(`  Connectivity: ${s.connectivity} | Access: ${s.accessibility} | Cost: $${s.estimated_cost_usd.toLocaleString()} | Priority: ${s.priority}`)
  })
  lines.push('')
  lines.push('## Visual Positioning Layout')
  r.visual_positioning_layout.forEach(l => lines.push(`- ${l}`))
  lines.push('')
  lines.push('## Connectivity Plan')
  r.connectivity_plan.forEach(l => lines.push(`- ${l}`))
  lines.push('')
  lines.push('## Phased Rollout')
  r.phased_rollout.forEach(l => lines.push(`- ${l}`))
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rec => lines.push(`- ${rec}`))
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. delivery_route_planner
  tools.register(defineTool({
    name: 'delivery_route_planner',
    description: '无人机配送路径规划与BVLOS航线 — 基于起止点坐标、地形类型、载荷重量规划最优配送航线，支持BVLOS走廊设计、禁飞区协调、检查点设置和风险评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { drone_model: string, origin: { lat: number, lng: number, name?: string }, destination: { lat: number, lng: number, name?: string }, waypoints?: Array<{ lat: number, lng: number, name?: string }>, bvlos_required?: boolean, altitude_m?: number, payload_kg?: number, terrain_type?: "urban"|"suburban"|"rural"|"mountainous"|"coastal", avoid_populated?: boolean, max_distance_km?: number, seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRoute(planDeliveryRoute(JSON.parse(args.input_data)))
    },
  }))

  // 2. payload_weight_optimizer
  tools.register(defineTool({
    name: 'payload_weight_optimizer',
    description: '载重平衡与包裹适配分析 — 分析多包裹装载方案，计算重心偏移、体积利用率、风载降额，输出装载顺序和GO/NO-GO决策',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { drone_model: string, packages: Array<{ id: string, weight_kg: number, length_cm: number, width_cm: number, height_cm: number, fragile?: boolean, priority?: "low"|"medium"|"high"|"critical" }>, battery_weight_kg?: number, fuel_reserve_percent?: number, wind_condition?: "calm"|"moderate"|"strong", mission_type?: "delivery"|"medical"|"survey"|"emergency", seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPayload(optimizePayload(JSON.parse(args.input_data)))
    },
  }))

  // 3. weather_go_no_go
  tools.register(defineTool({
    name: 'weather_go_no_go',
    description: '气象放飞决策与风切变预警 — 综合评估温度、风速、阵风、能见度、降水、湿度等气象参数，检测风切变和微下击暴流风险，输出放飞决策和任务调整建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { drone_model: string, temperature_c?: number, wind_speed_kmh?: number, wind_gust_kmh?: number, wind_direction_deg?: number, precipitation_mm_h?: number, visibility_km?: number, humidity_percent?: number, cloud_ceiling_m?: number, wind_shear_detected?: boolean, microburst_risk?: boolean, icing_risk?: boolean, location?: string, flight_altitude_m?: number, mission_priority?: "routine"|"important"|"critical"|"emergency", seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatWeather(assessWeather(JSON.parse(args.input_data)))
    },
  }))

  // 4. battery_range_calculator
  tools.register(defineTool({
    name: 'battery_range_calculator',
    description: '电池续航与换电/充电策略 — 基于载荷、风速、温度、速度计算实际续航里程，规划飞行航段能耗，制定换电站部署和充电策略',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { drone_model: string, battery_capacity_percent?: number, payload_kg?: number, average_speed_kmh?: number, altitude_m?: number, wind_speed_kmh?: number, wind_direction_deg?: number, temperature_c?: number, distance_km?: number, reserve_percent?: number, swap_stations?: Array<{ name: string, distance_km: number, battery_available: boolean }>, seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBattery(calculateBatteryRange(JSON.parse(args.input_data)))
    },
  }))

  // 5. airspace_compliance_checker
  tools.register(defineTool({
    name: 'airspace_compliance_checker',
    description: '空域审批与UTM协同 — 检查飞行计划合规性（Remote ID、DAA、机场邻近区、限制区），协调UTM空管系统，输出合规状态和所需授权文件清单',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { drone_model: string, operation_area: { center_lat: number, center_lng: number, radius_km: number }, altitude_m?: number, flight_purpose?: "commercial"|"medical"|"emergency"|"recreational"|"government", flight_type?: "VLOS"|"BVLOS"|"autonomous", start_time?: string, duration_min?: number, nearby_airports?: Array<{ name: string, distance_km: number, class: string }>, nearby_helipads?: Array<{ name: string, distance_km: number }>, restricted_areas?: Array<{ name: string, type: string, active: boolean }>, utm_provider?: string, remote_id_enabled?: boolean, detect_and_avoid?: boolean, pilot_certification?: string, insurance_verified?: boolean, seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAirspace(checkAirspaceCompliance(JSON.parse(args.input_data)))
    },
  }))

  // 6. drone_fleet_dispatcher
  tools.register(defineTool({
    name: 'drone_fleet_dispatcher',
    description: '机群调度与异常备降 — 基于配送需求、机群规模、天气状态进行多机任务分配，规划应急备降场地，输出调度时间线和紧急协议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { fleet_size: number, drone_model: string, deliveries: Array<{ id: string, origin: { lat: number, lng: number }, destination: { lat: number, lng: number }, priority?: "low"|"medium"|"high"|"critical", payload_kg?: number, deadline_min?: number }>, available_drones?: number, weather_ok?: boolean, emergency_landing_sites?: Array<{ name: string, lat: number, lng: number, type: string }>, seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFleet(dispatchFleet(JSON.parse(args.input_data)))
    },
  }))

  // 7. noise_impact_assessor
  tools.register(defineTool({
    name: 'noise_impact_assessor',
    description: '社区噪音影响评估与航线规避 — 评估无人机航线对社区的噪音影响，分析敏感区域（学校、医院、养老院），输出噪音减缓措施和航线调整建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { drone_model: string, route_waypoints: Array<{ lat: number, lng: number, altitude_m?: number }>, population_density_per_km2?: number, sensitive_areas?: Array<{ name: string, type: string, distance_m: number, sensitivity: "low"|"medium"|"high" }>, time_of_day?: "morning"|"afternoon"|"evening"|"night", ambient_noise_db?: number, flight_frequency_per_day?: number, altitude_m?: number, seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatNoise(assessNoiseImpact(JSON.parse(args.input_data)))
    },
  }))

  // 8. delivery_station_sitter
  tools.register(defineTool({
    name: 'delivery_station_sitter',
    description: '起降站点规划与视觉定位布点 — 基于服务区域面积、人口和配送量规划起降站点布局，设计视觉定位系统（ArUco标记、红外LED、RTK），输出分阶段部署计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { area_bounds: { north_lat: number, south_lat: number, east_lng: number, west_lng: number }, population_served: number, avg_daily_deliveries: number, terrain_type?: "urban"|"suburban"|"rural"|"mixed", existing_infrastructure?: string[], visual_positioning_required?: boolean, min_coverage_radius_km?: number, max_stations?: number, budget_constraint?: "low"|"medium"|"high", seed_date?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatStation(planDeliveryStations(JSON.parse(args.input_data)))
    },
  }))
}
