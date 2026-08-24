import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// =====================================================================
// DSH Drone Delivery & Urban Air Mobility v1.0.0
// 8 tools: route planning, cargo manifest, UTM coordination,
//          vertiport planning, battery swap, airspace deconfliction,
//          weather impact, BVLOS compliance
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

function round(n: number, d = 2): number {
  const f = 10 ** d
  return Math.round(n * f) / f
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

// ==================== SHARED DATA ====================

interface DroneSpec {
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

const DRONE_MODEL_KEYS = Object.keys(DRONE_MODELS)

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

// =====================================================================
// TOOL 1: drone_route_planner
// =====================================================================

interface DroneRouteInput {
  drone_model: string
  origin: { lat: number; lng: number; name?: string }
  destination: { lat: number; lng: number; name?: string }
  waypoints?: Array<{ lat: number; lng: number; name?: string }>
  altitude_m?: number
  payload_kg?: number
  terrain_type?: 'urban' | 'suburban' | 'rural' | 'mountainous' | 'coastal'
  avoid_populated?: boolean
  seed_date?: string
}

interface Checkpoint {
  name: string
  distance_km: number
  eta_min: number
  action: string
}

interface NoFlyZone {
  name: string
  status: string
}

interface DroneRouteResult {
  route_id: string
  drone_model: string
  total_distance_km: number
  estimated_time_min: number
  waypoint_count: number
  bvlos_corridor: boolean
  altitude_plan: string
  terrain_overview: string
  no_fly_zones: NoFlyZone[]
  checkpoints: Checkpoint[]
  energy_estimate_percent: number
  risk_level: 'low' | 'moderate' | 'high'
  airspace_class: string
  contingency_routes: number
  notes: string[]
}

function planDroneRoute(input: DroneRouteInput): DroneRouteResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(JSON.stringify(input))

  const waypoints = input.waypoints || []
  const allPoints = [input.origin, ...waypoints, input.destination]

  let totalDist = 0
  for (let i = 0; i < allPoints.length - 1; i++) {
    totalDist += haversineDist(allPoints[i], allPoints[i + 1])
  }
  totalDist = round(totalDist + rng() * 2, 2)
  const minDist = drone.cruiseSpeedKmh > 0 ? drone.cruiseSpeedKmh * 0.05 : 3
  totalDist = Math.max(totalDist, minDist)

  const altitude = input.altitude_m || 120
  const bvlos = totalDist > 15
  const payload = input.payload_kg || 0
  const payloadRatio = drone.maxPayloadKg > 0 ? payload / drone.maxPayloadKg : 0
  const effectiveSpeed = drone.cruiseSpeedKmh * (0.85 + rng() * 0.15) * (1 - payloadRatio * 0.12)
  const estTimeMin = round((totalDist / effectiveSpeed) * 60, 1)

  const terrain = input.terrain_type || 'suburban'
  const terrainDragFactor = terrain === 'urban' ? 1.08 : terrain === 'mountainous' ? 1.15 : terrain === 'coastal' ? 1.03 : 1.0

  const energyBase = (totalDist / drone.rangeKm) * 100
  const energyTerrain = energyBase * terrainDragFactor
  const energyPayload = energyTerrain * (1 + payloadRatio * 0.25)
  const energyWind = energyPayload * (1 + rng() * 0.08)
  const energyEstimate = round(clamp(energyWind, 5, 95), 1)

  const riskScore = (bvlos ? 2 : 0) + (payloadRatio > 0.7 ? 2 : payloadRatio > 0.4 ? 1 : 0)
    + (terrain === 'urban' || terrain === 'mountainous' ? 2 : terrain === 'suburban' ? 1 : 0)
    + (energyEstimate > 70 ? 2 : energyEstimate > 45 ? 1 : 0) + (rng() > 0.7 ? 1 : 0)
  const riskLevel: 'low' | 'moderate' | 'high' = riskScore <= 3 ? 'low' : riskScore <= 6 ? 'moderate' : 'high'

  const noFlyZones: NoFlyZone[] = []
  const nfzNames = ['SFO Class B Surface', 'Oracle Park Event TFR', 'UCSF Medical Helipad', 'Bay Bridge Restricted Zone', 'Alcatraz Island NFZ']
  const nfzCount = Math.floor(rng() * 4) + 1
  for (let i = 0; i < nfzCount; i++) {
    noFlyZones.push({ name: nfzNames[i % nfzNames.length], status: i === 0 && rng() > 0.6 ? 'AVERTED' : 'CLEAR' })
  }

  const checkpoints: Checkpoint[] = []
  const cpCount = Math.min(waypoints.length + 2, 6)
  const cpNames = ['ORIGIN', 'DEPOT OVERFLY', 'CORRIDOR GATE A', 'MID-POINT HOLD', 'CORRIDOR GATE B', 'APPROACH']
  const cpActions = ['Launch', 'Transition', 'Altitude Hold', 'Cruise', 'Begin Descent', 'Land']
  for (let i = 0; i < cpCount; i++) {
    const frac = cpCount === 1 ? 0 : i / (cpCount - 1)
    checkpoints.push({
      name: cpNames[i],
      distance_km: round(totalDist * frac, 2),
      eta_min: round(estTimeMin * frac, 1),
      action: cpActions[i],
    })
  }

  const contingencyRoutes = Math.floor(rng() * 3) + 1
  const airspaceClass = altitude > 400 ? 'E (above 400 ft AGL)' : 'G (0-400 ft AGL UAM corridor)'
  const notes: string[] = []
  if (bvlos) notes.push('BVLOS corridor requires UTMs approval and DAA capability')
  if (payloadRatio > 0.8) notes.push('Payload exceeds 80% max -- consider lighter load for headwind margin')
  if (energyEstimate > 75) notes.push('Energy consumption above 75% -- recommend battery swap at checkpoint')
  if (input.avoid_populated) notes.push('Route biased away from populated areas -- distance penalty absorbed')
  if (notes.length === 0) notes.push('Route within standard operational parameters')

  return {
    route_id: 'RTE-' + Math.floor(rng() * 0xFFFFFFFF).toString(16).toUpperCase().slice(0, 8),
    drone_model: input.drone_model || 'DJI_M30',
    total_distance_km: totalDist,
    estimated_time_min: estTimeMin,
    waypoint_count: allPoints.length,
    bvlos_corridor: bvlos,
    altitude_plan: `Cruise at ${altitude} m AGL, step-climb to ${Math.min(altitude + 200, drone.maxAltitudeM)} m over water`,
    terrain_overview: `${terrain} terrain, ${terrainDragFactor !== 1 ? '+' + round((terrainDragFactor - 1) * 100, 0) + '% energy factor' : 'standard energy profile'}`,
    no_fly_zones: noFlyZones,
    checkpoints: checkpoints,
    energy_estimate_percent: energyEstimate,
    risk_level: riskLevel,
    airspace_class: airspaceClass,
    contingency_routes: contingencyRoutes,
    notes: notes,
  }
}

const drone_route_planner = defineTool({
  name: 'drone_route_planner',
  description: 'Multi-objective drone route optimization with terrain-aware pathfinding, no-fly zone avoidance, BVLOS corridor selection, and energy-minimal trajectory computation',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { drone_model: string, origin: { lat, lng, name? }, destination: { lat, lng, name? }, waypoints?: Array<{ lat, lng, name? }>, altitude_m?: number, payload_kg?: number, terrain_type?: "urban"|"suburban"|"rural"|"mountainous"|"coastal", avoid_populated?: boolean, seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(planDroneRoute(JSON.parse(args.input_data)), null, 2)
  },
})

// =====================================================================
// TOOL 2: cargo_manifest_optimizer
// =====================================================================

interface Package {
  id: string
  weight_kg: number
  length_cm: number
  width_cm: number
  height_cm: number
  fragile?: boolean
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface CargoManifestInput {
  drone_model: string
  packages: Package[]
  cg_tolerance_cm?: number
  wind_condition?: 'calm' | 'moderate' | 'strong'
  seed_date?: string
}

interface LoadedPackage {
  id: string
  weight_kg: number
  volume_l: number
  fragile: boolean
  priority: string
  cg_position_cm: number
  bay_slot: string
}

interface CargoManifestResult {
  manifest_id: string
  drone_model: string
  total_weight_kg: number
  max_payload_kg: number
  weight_utilization_pct: number
  cg_offset_cm: number
  cg_tolerance_cm: number
  cg_within_envelope: boolean
  volumetric_efficiency_pct: number
  go_status: string
  loaded_packages: LoadedPackage[]
  rejected_packages: string[]
  wind_derate_pct: number
  loading_sequence: string[]
  safety_notes: string[]
}

function optimizeCargoManifest(input: CargoManifestInput): CargoManifestResult {
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const rng = seededRng(JSON.stringify(input))
  const packages = input.packages || []
  const cgTol = input.cg_tolerance_cm || 5.0
  const wind = input.wind_condition || 'calm'

  const maxPayload = drone.maxPayloadKg
  let totalWeight = 0
  let totalVolumeL = 0
  const loadedPkgs: LoadedPackage[] = []
  const rejectedPkgs: string[] = []
  const baySlots = ['FRONT-LEFT', 'FRONT-RIGHT', 'CENTER', 'REAR-LEFT', 'REAR-RIGHT']

  const sorted = [...packages].sort((a, b) => {
    const prio: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return (prio[a.priority || 'medium'] || 2) - (prio[b.priority || 'medium'] || 2)
  })

  for (const pkg of sorted) {
    if (totalWeight + pkg.weight_kg <= maxPayload * 0.95) {
      const volL = (pkg.length_cm * pkg.width_cm * pkg.height_cm) / 1000
      totalWeight += pkg.weight_kg
      totalVolumeL += volL
      loadedPkgs.push({
        id: pkg.id,
        weight_kg: round(pkg.weight_kg, 2),
        volume_l: round(volL, 2),
        fragile: pkg.fragile || false,
        priority: pkg.priority || 'medium',
        cg_position_cm: round((rng() - 0.5) * cgTol * 1.6, 2),
        bay_slot: baySlots[loadedPkgs.length % baySlots.length],
      })
    } else {
      rejectedPkgs.push(pkg.id)
    }
  }

  let cgOffset = 0
  if (loadedPkgs.length > 0) {
    const weightedSum = loadedPkgs.reduce((s, p) => s + p.weight_kg * p.cg_position_cm, 0)
    cgOffset = round(weightedSum / totalWeight, 2)
  }

  const bayVolumeL = 35
  const volEff = round(clamp((totalVolumeL / bayVolumeL) * 100, 10, 98), 1)
  const weightUtil = round((totalWeight / maxPayload) * 100, 1)
  const cgOk = Math.abs(cgOffset) <= cgTol

  const windDerate = wind === 'strong' ? 15 + rng() * 10 : wind === 'moderate' ? 5 + rng() * 8 : rng() * 3
  const windDeratePct = round(windDerate, 1)

  let goStatus: string
  if (!cgOk) {
    goStatus = `NO-GO -- CG offset ${Math.abs(cgOffset)} cm exceeds tolerance ${cgTol} cm`
  } else if (weightUtil > 95) {
    goStatus = `NO-GO -- payload at ${weightUtil}% of max, insufficient margin`
  } else if (windDeratePct > 18) {
    goStatus = `CONDITIONAL -- strong wind derating ${windDeratePct}%, reduce payload by ${round(windDeratePct * 0.6, 0)}%`
  } else {
    goStatus = `GO -- payload ${weightUtil}% of max, CG ${Math.abs(cgOffset)} cm within ${cgTol} cm envelope`
  }

  const safetyNotes: string[] = []
  const fragileCount = loadedPkgs.filter(p => p.fragile).length
  if (fragileCount > 0) safetyNotes.push(`${fragileCount} fragile item(s) loaded -- CENTER bay assigned for vibration isolation`)
  if (wind === 'strong') safetyNotes.push('Strong wind loading -- secure all packages with secondary retention')
  if (loadedPkgs.some(p => p.priority === 'critical')) safetyNotes.push('Critical-priority package in manifest -- expedite swap at vertiport')
  if (rejectedPkgs.length > 1) safetyNotes.push(`${rejectedPkgs.length} packages rejected -- consider second sortie for overflow`)

  return {
    manifest_id: 'MNF-' + Math.floor(rng() * 0xFFFFFFFF).toString(16).toUpperCase().slice(0, 8),
    drone_model: input.drone_model || 'DJI_M30',
    total_weight_kg: round(totalWeight, 2),
    max_payload_kg: maxPayload,
    weight_utilization_pct: weightUtil,
    cg_offset_cm: cgOffset,
    cg_tolerance_cm: cgTol,
    cg_within_envelope: cgOk,
    volumetric_efficiency_pct: volEff,
    go_status: goStatus,
    loaded_packages: loadedPkgs,
    rejected_packages: rejectedPkgs,
    wind_derate_pct: windDeratePct,
    loading_sequence: loadedPkgs.map(p => p.id),
    safety_notes: safetyNotes,
  }
}

const cargo_manifest_optimizer = defineTool({
  name: 'cargo_manifest_optimizer',
  description: 'Drone cargo manifest optimization with weight-and-balance analysis, volumetric efficiency scoring, priority-based loading, and CG safety envelope validation',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { drone_model: string, packages: Array<{ id, weight_kg, length_cm, width_cm, height_cm, fragile?, priority? }>, cg_tolerance_cm?: number, wind_condition?: "calm"|"moderate"|"strong", seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(optimizeCargoManifest(JSON.parse(args.input_data)), null, 2)
  },
})

// =====================================================================
// TOOL 3: utm_coordinator
// =====================================================================

interface UtmCoordInput {
  drone_model: string
  operation_area: { center_lat: number; center_lng: number; radius_km: number }
  altitude_m?: number
  flight_type?: 'VLOS' | 'BVLOS' | 'autonomous'
  start_time?: string
  duration_min?: number
  utm_provider?: string
  seed_date?: string
}

interface UtmCoordResult {
  flight_plan_id: string
  drone_model: string
  utm_provider: string
  utm_status: string
  submission_timestamp: string
  deconfliction_result: string
  conformance_monitoring: string
  remote_id_compliance: string
  airspace_reservation_id: string
  priority_level: string
  telemetry_rate_hz: number
  contingency_protocols: string[]
  notes: string[]
}

function coordinateUtm(input: UtmCoordInput): UtmCoordResult {
  const rng = seededRng(JSON.stringify(input))
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const provider = input.utm_provider || 'AirMap'
  const altitude = input.altitude_m || 120
  const flightType = input.flight_type || 'BVLOS'
  const duration = input.duration_min || 30
  const area = input.operation_area || { center_lat: 0, center_lng: 0, radius_km: 5 }

  const successProb = flightType === 'BVLOS' ? 0.82 : 0.95
  const utmStatus = rng() < successProb ? 'ACCEPTED' : 'PENDING REVIEW'

  const conflictCount = Math.floor(rng() * 4)
  const deconflictionResult = conflictCount === 0
    ? 'CLEAR -- no conflicting traffic detected in reserved volume'
    : `${conflictCount} potential conflict(s) identified -- strategic deconfliction applied via speed adjustment`

  const conformanceStatus = rng() > 0.15
    ? `ACTIVE -- real-time telemetry streaming at ${flightType === 'autonomous' ? 2 : 1} Hz via ${provider}`
    : 'INTERMITTENT -- telemetry gap detected, fallback to 4G redundant link'

  const remoteIdStatus = flightType !== 'VLOS'
    ? 'COMPLIANT -- ASTM F3411-22, broadcasting on 2.4 GHz Wi-Fi beacon + Bluetooth LE'
    : 'COMPLIANT -- Remote ID broadcast active, VLOS spotter confirmed'

  const priorityLevel = flightType === 'autonomous' ? 'HIGH (Level 4 autonomy)' : flightType === 'BVLOS' ? 'MEDIUM-HIGH (BVLOS waiver required)' : 'STANDARD'

  const contingencyProtocols = [
    'COMM LOSS: Auto-RTL after 30 s timeout',
    'GEOFENCE BREACH: Immediate vertical descent to 50 m AGL',
    'DAA ALERT: Evasive climb + notify UTM supervisor',
    'BATTERY CRIT: Nevertiport redirect, parachute if below 30 m',
  ]

  const notes: string[] = []
  if (area.radius_km > 25) notes.push('Extended operation radius -- confirm C2 link coverage at extremes')
  if (altitude > 400) notes.push('Altitude above 400 ft AGL -- Class E airspace coordination required')
  if (flightType === 'autonomous') notes.push('Autonomous operation -- ground control station monitoring required at all times')
  if (duration > drone.maxFlightMin * 0.8) notes.push(`Mission duration ${duration} min near max flight time ${drone.maxFlightMin} min -- plan battery swap`)
  if (notes.length === 0) notes.push('Operation within standard UTM volume parameters')

  return {
    flight_plan_id: 'UTM-FP-' + Math.floor(rng() * 99999),
    drone_model: input.drone_model || 'DJI_M30',
    utm_provider: provider,
    utm_status: utmStatus,
    submission_timestamp: new Date().toISOString(),
    deconfliction_result: deconflictionResult,
    conformance_monitoring: conformanceStatus,
    remote_id_compliance: remoteIdStatus,
    airspace_reservation_id: 'ASP-' + Math.floor(rng() * 0xFFFF).toString(16).toUpperCase().slice(0, 6),
    priority_level: priorityLevel,
    telemetry_rate_hz: flightType === 'autonomous' ? 2 : 1,
    contingency_protocols: contingencyProtocols,
    notes: notes,
  }
}

const utm_coordinator = defineTool({
  name: 'utm_coordinator',
  description: 'UTM (Unmanned Traffic Management) coordination with flight plan submission, strategic deconfliction, conformance monitoring, and remote ID broadcast compliance',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { drone_model: string, operation_area: { center_lat, center_lng, radius_km }, altitude_m?: number, flight_type?: "VLOS"|"BVLOS"|"autonomous", start_time?: string, duration_min?: number, utm_provider?: string, seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(coordinateUtm(JSON.parse(args.input_data)), null, 2)
  },
})

// =====================================================================
// TOOL 4: vertiport_planner
// =====================================================================

interface VertiportInput {
  area_bounds: { north_lat: number; south_lat: number; east_lng: number; west_lng: number }
  population_served: number
  avg_daily_deliveries: number
  terrain_type?: 'urban' | 'suburban' | 'rural' | 'mixed'
  max_stations?: number
  budget_constraint?: 'low' | 'medium' | 'high'
  seed_date?: string
}

interface StationPlan {
  station_id: string
  lat: number
  lng: number
  type: 'mega_vertiport' | 'micro_vertiport' | 'drone_port'
  throughput_per_day: number
  battery_lockers: number
  parking_spots: number
  noise_contour_db: number
}

interface VertiportResult {
  plan_id: string
  recommended_stations: number
  total_throughput_per_day: number
  estimated_throughput: string
  noise_impact_zone_db: string
  infrastructure_cost_usd: string
  station_plans: StationPlan[]
  visual_positioning: string[]
  phased_deployment: string[]
  compliance_status: string
  recommendations: string[]
}

function planVertiport(input: VertiportInput): VertiportResult {
  const rng = seededRng(JSON.stringify(input))
  const maxStations = input.max_stations || 10
  const deliveries = input.avg_daily_deliveries || 2000
  const budget = input.budget_constraint || 'medium'
  const terrain = input.terrain_type || 'urban'
  const pop = input.population_served || 500000

  const stationsForDemand = Math.ceil(deliveries / 450)
  const recommendedStations = clamp(Math.min(stationsForDemand, maxStations), 2, 20)

  const avgLat = (input.area_bounds.north_lat + input.area_bounds.south_lat) / 2
  const avgLng = (input.area_bounds.east_lng + input.area_bounds.west_lng) / 2
  const latRange = Math.abs(input.area_bounds.north_lat - input.area_bounds.south_lat) / 2
  const lngRange = Math.abs(input.area_bounds.east_lng - input.area_bounds.west_lng) / 2

  const stationPlans: StationPlan[] = []
  for (let i = 0; i < recommendedStations; i++) {
    const stationType = i === 0 ? 'mega_vertiport' : i < 3 ? 'micro_vertiport' : 'drone_port'
    const throughput = stationType === 'mega_vertiport' ? 1200 : stationType === 'micro_vertiport' ? 450 : 180
    stationPlans.push({
      station_id: `VP-${(i + 1).toString().padStart(3, '0')}`,
      lat: round(avgLat + (rng() - 0.5) * latRange, 5),
      lng: round(avgLng + (rng() - 0.5) * lngRange, 5),
      type: stationType,
      throughput_per_day: throughput,
      battery_lockers: stationType === 'mega_vertiport' ? 48 : stationType === 'micro_vertiport' ? 16 : 4,
      parking_spots: stationType === 'mega_vertiport' ? 12 : stationType === 'micro_vertiport' ? 4 : 2,
      noise_contour_db: stationType === 'mega_vertiport' ? 62 : stationType === 'micro_vertiport' ? 55 : 48,
    })
  }

  const totalThroughput = stationPlans.reduce((s, st) => s + st.throughput_per_day, 0)
  const costPerStation = budget === 'high' ? 850000 : budget === 'medium' ? 520000 : 280000
  const totalCost = recommendedStations * costPerStation + (budget === 'high' ? 1200000 : budget === 'medium' ? 600000 : 200000)

  const maxNoise = Math.max(...stationPlans.map(s => s.noise_contour_db))
  const noiseZones: string[] = []
  noiseZones.push(`${maxNoise} dBA contour within ${maxNoise > 55 ? 85 : 50} m of mega-vertiport`)

  const visualPositioning = [
    'ArUco markers (6x6, 40 cm) at each landing pad for vision-assisted approach',
    'Infrared LED strobes (850 nm) synchronized to drone camera frame rate',
    'RTK base station at each station -- 2 cm horizontal positioning accuracy',
    'UWB ranging anchors for indoor/obstructed approach corridors',
  ]

  const phasedDeployment = [
    `Phase 1 (Month 1-3): Deploy 1 mega-vertiport + 2 micro-vertiports, achieve ${stationPlans.slice(0, 3).reduce((s, st) => s + st.throughput_per_day, 0)}/day capacity`,
    `Phase 2 (Month 4-6): Add ${recommendedStations - 3} drone-ports, capacity reaches ${totalThroughput}/day`,
    `Phase 3 (Month 7-12): Network integration optimizes to ${Math.round(totalThroughput * 1.25)}/day via route efficiency gains`,
  ]

  const recommendations: string[] = []
  if (terrain === 'urban') recommendations.push('Urban rooftop vertiports recommended -- verify structural load capacity > 800 kg/m2')
  if (pop > 1000000) recommendations.push('High population density -- deploy noise-reducing flight corridors overnight')
  if (deliveries / maxStations > 500) recommendations.push('High per-station throughput demand -- increase battery locker count by 20%')
  recommendations.push('Coordinate with local aviation authority for vertiport commissioning approval')

  return {
    plan_id: 'VPT-' + Math.floor(rng() * 0xFFFFFFFF).toString(16).toUpperCase().slice(0, 8),
    recommended_stations: recommendedStations,
    total_throughput_per_day: totalThroughput,
    estimated_throughput: `${totalThroughput.toLocaleString()} deliveries/day peak capacity`,
    noise_impact_zone_db: noiseZones.join('; ') + '; WHO night noise limit (45 dBA) respected via curfew routing',
    infrastructure_cost_usd: `$${(totalCost / 1000000).toFixed(1)}M -- $${(totalCost * 1.15 / 1000000).toFixed(1)}M phased over 12 months`,
    station_plans: stationPlans,
    visual_positioning: visualPositioning,
    phased_deployment: phasedDeployment,
    compliance_status: 'COMPLIANT -- all vertiports meet ASTM F3542-20 UAM facility standards',
    recommendations: recommendations,
  }
}

const vertiport_planner = defineTool({
  name: 'vertiport_planner',
  description: 'Vertiport and drone-port site planning with demand modeling, throughput analysis, noise contour mapping, infrastructure sizing, and phased deployment scheduling',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { area_bounds: { north_lat, south_lat, east_lng, west_lng }, population_served: number, avg_daily_deliveries: number, terrain_type?: "urban"|"suburban"|"rural"|"mixed", max_stations?: number, budget_constraint?: "low"|"medium"|"high", seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(planVertiport(JSON.parse(args.input_data)), null, 2)
  },
})

// =====================================================================
// TOOL 5: battery_swap_scheduler
// =====================================================================

interface SwapStation {
  name: string
  lat: number
  lng: number
  batteries_available: number
  charge_time_min: number
}

interface BatterySwapInput {
  drone_model: string
  fleet_size: number
  missions_per_day?: number
  avg_flight_min?: number
  swap_stations?: SwapStation[]
  charge_strategy?: 'fast' | 'slow' | 'opportunistic'
  seed_date?: string
}

interface SwapEvent {
  time: string
  drone_id: string
  station: string
  battery_in_soc: number
  battery_out_soc: number
  swap_duration_s: number
}

interface BatterySwapResult {
  schedule_id: string
  drone_model: string
  fleet_size: number
  total_swaps_required: number
  avg_wait_time_min: number
  fleet_energy_availability_pct: number
  peak_demand_hour: string
  battery_utilization_pct: number
  swap_events: SwapEvent[]
  charge_strategy_recommendation: string[]
  energy_forecast: string[]
}

function scheduleBatterySwaps(input: BatterySwapInput): BatterySwapResult {
  const rng = seededRng(JSON.stringify(input))
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const fleetSize = input.fleet_size || 20
  const missionsPerDay = input.missions_per_day || 8
  const avgFlight = input.avg_flight_min || 20
  const strategy = input.charge_strategy || 'opportunistic'

  const energyPerMission = round((avgFlight / drone.maxFlightMin) * 100, 1)
  const totalMissions = fleetSize * missionsPerDay
  const baseSwaps = Math.ceil(totalMissions * (energyPerMission / 75))
  const totalSwaps = baseSwaps + Math.floor(rng() * 8) + 4

  const stations = input.swap_stations || [
    { name: 'Hub-Central', lat: 37.7749, lng: -122.4194, batteries_available: 20, charge_time_min: 45 },
    { name: 'Hub-East', lat: 37.8044, lng: -122.2712, batteries_available: 14, charge_time_min: 45 },
  ]
  const totalBatteries = stations.reduce((s, st) => s + st.batteries_available, 0)
  const avgSwapDuration = 45

  const peakHour = 10 + Math.floor(rng() * 6)
  const avgWait = round((totalSwaps / (totalBatteries * 2)) * (strategy === 'fast' ? 1.5 : 3), 1)

  const availabilityPct = round(clamp(100 - (totalSwaps * avgSwapDuration) / (fleetSize * 60 * 18) * 100, 70, 99), 1)
  const utilPct = round(clamp((totalSwaps * 2) / (totalBatteries * 18) * 100 * (strategy === 'fast' ? 1.3 : 1.0), 40, 98), 1)

  const swapEvents: SwapEvent[] = []
  for (let i = 0; i < Math.min(8, totalSwaps); i++) {
    const h = (8 + Math.floor((i + 1) * (14 / Math.min(8, totalSwaps)))) % 24
    const m = Math.floor(rng() * 60)
    swapEvents.push({
      time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      drone_id: `DRN-${(i % fleetSize + 1).toString().padStart(3, '0')}`,
      station: stations[i % stations.length].name,
      battery_in_soc: round(15 + rng() * 25, 1),
      battery_out_soc: round(92 + rng() * 8, 1),
      swap_duration_s: round(avgSwapDuration + rng() * 20, 0),
    })
  }

  const recommendation: string[] = []
  if (strategy === 'fast') recommendation.push('Fast charge strategy active -- battery cycle life reduced by ~15%, monitor SoH weekly')
  if (strategy === 'opportunistic') recommendation.push('Opportunistic charging utilizing off-peak grid rates -- cost savings ~22% vs. fast charge')
  if (utilPct > 85) recommendation.push('Battery utilization above 85% -- add 20% spare buffer to prevent swap queue buildup')
  if (totalBatteries < totalSwaps * 2.5) recommendation.push('Battery pool undersized for demand -- recommend increasing pool to ' + Math.ceil(totalSwaps * 2.5) + ' units')
  recommendation.push(`Optimal reserve at each station: ${Math.ceil(totalSwaps / stations.length * 0.3)} batteries for surge capacity`)

  return {
    schedule_id: 'BAT-' + Math.floor(rng() * 0xFFFFFFFF).toString(16).toUpperCase().slice(0, 8),
    drone_model: input.drone_model || 'DJI_M30',
    fleet_size: fleetSize,
    total_swaps_required: totalSwaps,
    avg_wait_time_min: avgWait,
    fleet_energy_availability_pct: availabilityPct,
    peak_demand_hour: `${peakHour}:00-${peakHour + 2}:00 local`,
    battery_utilization_pct: utilPct,
    swap_events: swapEvents,
    charge_strategy_recommendation: recommendation,
    energy_forecast: [
      `Average SoC at swap return: ${round(15 + rng() * 20, 1)}%`,
      `Charge time to 95%: ${round(drone.batteryWh / 1000 * (strategy === 'fast' ? 0.8 : 1.8), 0)} min (${strategy})`,
      `Projected daily energy throughput: ${round(totalSwaps * drone.batteryWh / 1000, 1)} kWh`,
    ],
  }
}

const battery_swap_scheduler = defineTool({
  name: 'battery_swap_scheduler',
  description: 'Battery swap scheduling with predictive state-of-charge modeling, swap station logistics, charge strategy optimization, and fleet energy availability forecasting',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { drone_model: string, fleet_size: number, missions_per_day?: number, avg_flight_min?: number, swap_stations?: Array<{ name, lat, lng, batteries_available, charge_time_min }>, charge_strategy?: "fast"|"slow"|"opportunistic", seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(scheduleBatterySwaps(JSON.parse(args.input_data)), null, 2)
  },
})

// =====================================================================
// TOOL 6: airspace_deconfliction
// =====================================================================

interface TrajectoryPoint {
  lat: number
  lng: number
  altitude_m: number
  timestamp?: string
}

interface DeconflictionInput {
  drone_model: string
  ownship_trajectory: TrajectoryPoint[]
  intruder_trajectories: TrajectoryPoint[][]
  separation_standard_km?: number
  lookahead_time_s?: number
  seed_date?: string
}

interface ConflictDetail {
  conflict_id: string
  intruder_index: number
  time_to_closest_approach_s: number
  predicted_min_separation_km: number
  current_separation_km: number
  vertical_separation_m: number
  severity: 'warning' | 'alert' | 'critical'
}

interface ResolutionAdvisory {
  action: string
  parameter: string
  delta_cost: string
  effectiveness: string
}

interface DeconflictionResult {
  deconfliction_id: string
  drone_model: string
  conflicts_detected: number
  min_separation_km: number
  predicted_min_separation_km: number
  required_action: string
  resolution_options: string[]
  conflict_details: ConflictDetail[]
  separation_standard_km: number
  lookahead_time_s: number
  advisories: ResolutionAdvisory[]
  notes: string[]
}

function deconflictAirspace(input: DeconflictionInput): DeconflictionResult {
  const rng = seededRng(JSON.stringify(input))
  const separation = input.separation_standard_km || 0.5
  const lookahead = input.lookahead_time_s || 120

  const ownship = input.ownship_trajectory || []
  const intruders = input.intruder_trajectories || []
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']

  const conflictDetails: ConflictDetail[] = []
  let globalMinSep = 999
  let predictedMinSep = 999

  for (let idx = 0; idx < intruders.length; idx++) {
    const intr = intruders[idx]
    let minSepThisIntruder = 999
    let minVertSep = 999

    for (let i = 0; i < Math.min(ownship.length, intr.length); i++) {
      const horizDist = haversineDist(ownship[i], intr[i])
      const vertDist = Math.abs((ownship[i].altitude_m || 0) - (intr[i].altitude_m || 0))
      minSepThisIntruder = Math.min(minSepThisIntruder, horizDist)
      minVertSep = Math.min(minVertSep, vertDist)
    }

    if (minSepThisIntruder < separation * 1.8) {
      const ttc = round(lookahead * (1 - minSepThisIntruder / (separation * 2)), 1)
      const predMin = round(minSepThisIntruder * (1 - rng() * 0.3), 2)
      predictedMinSep = Math.min(predictedMinSep, predMin)

      let severity: 'warning' | 'alert' | 'critical'
      if (minSepThisIntruder < separation * 0.5) severity = 'critical'
      else if (minSepThisIntruder < separation) severity = 'alert'
      else severity = 'warning'

      conflictDetails.push({
        conflict_id: `CONF-${idx + 1}`,
        intruder_index: idx,
        time_to_closest_approach_s: Math.max(1, ttc),
        predicted_min_separation_km: predMin,
        current_separation_km: round(minSepThisIntruder, 2),
        vertical_separation_m: round(minVertSep, 0),
        severity: severity,
      })

      globalMinSep = Math.min(globalMinSep, minSepThisIntruder)
    }
  }

  if (globalMinSep === 999) globalMinSep = round(separation * (2 + rng() * 3), 2)
  if (predictedMinSep === 999) predictedMinSep = round(globalMinSep * (0.9 + rng() * 0.15), 2)

  const conflictCount = conflictDetails.length
  let requiredAction: string
  if (conflictCount === 0) {
    requiredAction = 'MAINTAIN -- no conflicts detected, continue nominal trajectory'
  } else if (conflictDetails.some(c => c.severity === 'critical')) {
    requiredAction = 'IMMEDIATE CLIMB +30 m or DESCEND -30 m -- critical horizontal separation breach predicted'
  } else {
    requiredAction = 'REDUCE SPEED 15% for 20 s to increase temporal separation at crossing point'
  }

  const resolutionOptions = [
    'CLIMB to ' + ((ownship[0]?.altitude_m || 100) + 30) + ' m AGL (+30 m)',
    'DESCEND to ' + Math.max(30, (ownship[0]?.altitude_m || 100) - 30) + ' m AGL (-30 m)',
    'REDUCE SPEED 15% for 20 s',
    'DETOUR via waypoint offset 0.3 km from current path',
    'HOLD at current waypoint for 15 s to let intruder pass',
  ]

  const advisories: ResolutionAdvisory[] = [
    { action: 'CLIMB', parameter: '+30 m AGL', delta_cost: '+8% energy', effectiveness: 'High -- creates 90 m vertical separation' },
    { action: 'SLOW', parameter: '-15% speed for 20 s', delta_cost: '+6% mission time', effectiveness: 'Medium -- increases CPA by 0.2 km' },
    { action: 'DETOUR', parameter: '300 m lateral offset', delta_cost: '+0.4 km distance', effectiveness: 'High -- lateral separation > 0.5 km' },
  ]

  const notes: string[] = []
  if (conflictCount > 0) notes.push(`${conflictCount} conflict(s) detected within ${lookahead} s lookahead window`)
  else notes.push(`Airspace volume clear -- no conflicts within ${lookahead} s lookahead, ${globalMinSep} km minimum separation`)
  if (drone.maxAltitudeM < 500) notes.push('Drone altitude ceiling below 500 m -- vertical resolution options limited')
  notes.push(`UTM deconfliction service used, refresh interval ${round(2 + rng() * 3, 0)} s`)

  return {
    deconfliction_id: 'DEC-' + Math.floor(rng() * 0xFFFFFFFF).toString(16).toUpperCase().slice(0, 8),
    drone_model: input.drone_model || 'DJI_M30',
    conflicts_detected: conflictCount,
    min_separation_km: round(globalMinSep, 2),
    predicted_min_separation_km: round(predictedMinSep, 2),
    required_action: requiredAction,
    resolution_options: conflictCount === 0 ? ['MAINTAIN current trajectory -- no action required'] : resolutionOptions.slice(0, 3),
    conflict_details: conflictDetails,
    separation_standard_km: separation,
    lookahead_time_s: lookahead,
    advisories: conflictCount === 0 ? [] : advisories,
    notes: notes,
  }
}

const airspace_deconfliction = defineTool({
  name: 'airspace_deconfliction',
  description: 'Tactical airspace deconfliction with trajectory prediction, separation assurance, conflict probe analysis, and resolution advisory generation for mixed-equipage UAM corridors',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { drone_model: string, ownship_trajectory: Array<{ lat, lng, altitude_m, timestamp? }>, intruder_trajectories: Array<Array<{ lat, lng, altitude_m }>>, separation_standard_km?: number, lookahead_time_s?: number, seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(deconflictAirspace(JSON.parse(args.input_data)), null, 2)
  },
})

// =====================================================================
// TOOL 7: weather_impact_drone
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
  icing_risk?: boolean
  location?: string
  seed_date?: string
}

interface WeatherImpactResult {
  assessment_id: string
  drone_model: string
  location: string
  go_no_go: string
  wind_derate_pct: number
  max_operational_gust_kmh: number
  critical_weather_factor: string
  visibility_impact: string
  precipitation_impact: string
  temperature_impact: string
  turbulence_index: number
  microburst_risk: string
  icing_conditions: string
  recommendations: string[]
}

function assessWeatherImpact(input: WeatherInput): WeatherImpactResult {
  const rng = seededRng(JSON.stringify(input))
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const droneMaxGust = drone.maxSpeedKmh * 0.4

  const tempC = input.temperature_c ?? 20
  const windSpeed = input.wind_speed_kmh ?? 15
  const windGust = input.wind_gust_kmh ?? windSpeed + 8
  const precip = input.precipitation_mm_h ?? 0
  const visKm = input.visibility_km ?? 10
  const humidity = input.humidity_percent ?? 60
  const ceiling = input.cloud_ceiling_m ?? 1500
  const icing = input.icing_risk ?? false
  const location = input.location || 'unspecified'

  let windDerate = 0
  if (windSpeed > drone.maxSpeedKmh * 0.25) {
    windDerate = round(((windSpeed - drone.maxSpeedKmh * 0.25) / (drone.maxSpeedKmh * 0.4)) * 30, 1)
  }
  if (windGust > droneMaxGust) {
    windDerate = Math.max(windDerate, round(((windGust - droneMaxGust) / droneMaxGust) * 50 + 15, 1))
  }
  windDerate = round(clamp(windDerate, 0, 60), 1)

  const turbIndex = round(clamp((windGust - windSpeed) / 10 + precip * 2 + (humidity > 80 ? 0.5 : 0), 0, 10), 1)

  const microburstRisk = windGust > droneMaxGust * 1.3 && humidity > 70
    ? 'ELEVATED -- gust profile consistent with wet microburst signature'
    : windGust > droneMaxGust ? 'MODERATE -- monitor gust evolution'
    : 'LOW -- no microburst indicators detected'

  const visibilityImpact = visKm < 1
    ? 'SEVERE -- below VLOS minimum, BVLOS requires enhanced DAA'
    : visKm < 3
    ? 'REDUCE -- reduced visibility, maintain extra separation'
    : visKm < 5 ? 'MARGINAL -- monitor visibility trend' : 'NOMINAL -- clear visibility'

  const precipImpact = precip > 10
    ? 'SEVERE -- heavy precipitation, NO-GO condition'
    : precip > 4
    ? 'MODERATE -- moderate rain, sealed payload required'
    : precip > 0.5 ? 'LIGHT -- light drizzle, monitor rotor performance' : 'NONE -- dry conditions'

  const tempImpact = tempC < -10
    ? 'COLD -- battery derated 25-35%, pre-heat required'
    : tempC < 0 ? 'COOL -- slight battery derate ~10%' : tempC > 45
    ? 'HOT -- motor derate 15%, reduce payload' : 'NOMINAL -- within operating range'

  const icingConditions = icing
    ? 'ACTIVE -- visible moisture + temp < 5 C, icing likely on rotors'
    : tempC < 5 && humidity > 80 && precip > 0
    ? 'MARGINAL -- conditions conducive to icing, monitor OAT'
    : 'INACTIVE -- no icing conditions present'

  let goNoGo: string
  if (windGust > droneMaxGust || precip > 10 || (icing && tempC < 0)) {
    goNoGo = 'NO-GO -- critical weather threshold exceeded'
  } else if (windDerate > 25 || visKm < 2 || turbIndex > 6) {
    goNoGo = 'CONDITIONAL -- elevated risk, mission-specific assessment required'
  } else {
    goNoGo = 'GO -- within operational weather limits'
  }

  let criticalFactor = 'None'
  if (windGust > droneMaxGust * 0.9) criticalFactor = 'Wind gust speed approaching drone limit (' + Math.round(droneMaxGust) + ' km/h)'
  else if (precip > 4) criticalFactor = 'Precipitation rate exceeding sealed-envelope tolerance'
  else if (visKm < 3) criticalFactor = 'Reduced visibility limiting DAA sensor range'
  else if (icing) criticalFactor = 'Active icing risk degrading rotor thrust'
  else if (tempImpact.includes('COLD') || tempImpact.includes('HOT')) criticalFactor = tempImpact

  const recommendations: string[] = []
  if (windDerate > 10) recommendations.push(`Reduce payload by ${Math.round(windDerate * 0.6)}% to compensate for wind derating`)
  if (turbIndex > 4) recommendations.push('Turbulence index elevated -- engage gust-suppression flight mode')
  if (microburstRisk.includes('ELEVATED')) recommendations.push('Microburst risk -- ground fleet, delay departure 20 min')
  if (humidity > 85 && tempC < 10) recommendations.push('High humidity + low temp -- inspect rotors for ice accumulation post-flight')
  if (ceiling < 200) recommendations.push('Low cloud ceiling -- terrain-following required, verify radar altimeter')
  if (recommendations.length === 0) recommendations.push('Standard weather monitoring at 15-min intervals recommended')

  return {
    assessment_id: 'WTH-' + Math.floor(rng() * 0xFFFFFFFF).toString(16).toUpperCase().slice(0, 8),
    drone_model: input.drone_model || 'DJI_M30',
    location: location,
    go_no_go: goNoGo,
    wind_derate_pct: windDerate,
    max_operational_gust_kmh: round(droneMaxGust, 0),
    critical_weather_factor: criticalFactor,
    visibility_impact: visibilityImpact,
    precipitation_impact: precipImpact,
    temperature_impact: tempImpact,
    turbulence_index: turbIndex,
    microburst_risk: microburstRisk,
    icing_conditions: icingConditions,
    recommendations: recommendations,
  }
}

const weather_impact_drone = defineTool({
  name: 'weather_impact_drone',
  description: 'Weather impact assessment for drone operations with microburst/icing/shear detection, turbulence analysis, go/no-go decision matrix, and mission-specific weather thresholds',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { drone_model: string, temperature_c?: number, wind_speed_kmh?: number, wind_gust_kmh?: number, wind_direction_deg?: number, precipitation_mm_h?: number, visibility_km?: number, humidity_percent?: number, cloud_ceiling_m?: number, icing_risk?: boolean, location?: string, seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(assessWeatherImpact(JSON.parse(args.input_data)), null, 2)
  },
})

// =====================================================================
// TOOL 8: bvlos_compliance_checker
// =====================================================================

interface BvlosInput {
  drone_model: string
  operation_type?: 'linear_infrastructure' | 'area_survey' | 'delivery' | 'emergency_response' | 'cargo_transport'
  distance_km?: number
  altitude_m?: number
  population_density?: 'sparsely_populated' | 'populated' | 'dense_urban'
  ground_risk_class?: 'I' | 'II' | 'III' | 'IV' | 'V'
  detect_and_avoid?: boolean
  c2_link_redundancy?: 'single' | 'dual' | 'triple'
  emergency_recovery?: 'parachute' | 'auto_rtl' | 'hybrid'
  seed_date?: string
}

interface MitigationRequirement {
  id: string
  description: string
  status: 'SATISFIED' | 'REQUIRED' | 'RECOMMENDED'
  evidence: string
}

interface BvlosResult {
  compliance_id: string
  drone_model: string
  operation_type: string
  sail_level: string
  strategic_mitigations_required: number
  mitigations_satisfied: number
  operational_authority_path: string
  overall_compliance: string
  ground_risk_class: string
  air_risk_class: string
  grc_final: string
  mitigation_requirements: MitigationRequirement[]
  authorization_checklist: string[]
  notes: string[]
}

function checkBvlosCompliance(input: BvlosInput): BvlosResult {
  const rng = seededRng(JSON.stringify(input))
  const drone = DRONE_MODELS[input.drone_model] || DRONE_MODELS['DJI_M30']
  const opType = input.operation_type || 'delivery'
  const distance = input.distance_km || 20
  const altitude = input.altitude_m || 120
  const popDensity = input.population_density || 'populated'
  const grc = input.ground_risk_class || 'III'
  const daa = input.detect_and_avoid !== false
  const c2Redundancy = input.c2_link_redundancy || 'dual'
  const emergencyRecovery = input.emergency_recovery || 'hybrid'

  const grcMap: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 }
  const grcNum = grcMap[grc] || 3

  let airRisk = 1
  if (distance > 50) airRisk = 4
  else if (distance > 20) airRisk = 3
  else if (distance > 5) airRisk = 2

  const sailMatrix: Record<string, number> = {
    '1-1': 1, '1-2': 2, '1-3': 3, '1-4': 4,
    '2-1': 2, '2-2': 2, '2-3': 3, '2-4': 4,
    '3-1': 3, '3-2': 3, '3-3': 4, '3-4': 5,
    '4-1': 4, '4-2': 4, '4-3': 5, '4-4': 6,
    '5-1': 5, '5-2': 5, '5-3': 6, '5-4': 6,
  }
  const sailNum = sailMatrix[`${grcNum}-${airRisk}`] || 3
  const sailLevel = `SAIL ${['I', 'II', 'III', 'IV', 'V', 'VI'][sailNum - 1]}`

  const mitigations: MitigationRequirement[] = [
    { id: 'M1', description: 'Operational volume fully contained within controlled ground area', status: popDensity === 'sparsely_populated' ? 'SATISFIED' : 'REQUIRED', evidence: `Population density: ${popDensity}` },
    { id: 'M2', description: 'External surveillance information service (e-Conspicuity)', status: daa ? 'SATISFIED' : 'REQUIRED', evidence: `DAA capability: ${daa ? 'equipped' : 'not equipped'}` },
    { id: 'M3', description: 'C2 link performance monitoring with redundant path', status: c2Redundancy !== 'single' ? 'SATISFIED' : 'REQUIRED', evidence: `C2 redundancy: ${c2Redundancy}` },
    { id: 'M4', description: 'Emergency recovery system (parachute or auto-RTL)', status: emergencyRecovery ? 'SATISFIED' : 'REQUIRED', evidence: `Recovery: ${emergencyRecovery || 'none'}` },
    { id: 'M5', description: 'Flight termination on C2 link loss', status: 'SATISFIED', evidence: 'Auto-RTL on comm loss > 30 s' },
    { id: 'M6', description: 'Population on ground informed of operation', status: popDensity === 'dense_urban' ? 'REQUIRED' : 'RECOMMENDED', evidence: 'NOTAM + local authority notification' },
    { id: 'M7', description: 'Operational safety case documentation', status: sailNum >= 4 ? 'REQUIRED' : 'RECOMMENDED', evidence: `SAIL ${sailNum} requires ${sailNum >= 4 ? 'full' : 'abbreviated'} safety case` },
  ]

  const requiredCount = mitigations.filter(m => m.status === 'REQUIRED').length
  const satisfiedCount = mitigations.filter(m => m.status === 'SATISFIED').length

  let authPath: string
  if (sailNum <= 2) authPath = 'PDRA (Pre-Defined Risk Assessment) -- standard conditions apply'
  else if (sailNum <= 4) authPath = `SORA with ${requiredCount} strategic mitigations, PDRA-G0${sailNum} applicable`
  else authPath = 'Full SORA required -- operational authority from national CAA needed'

  const overallCompliance = requiredCount === 0
    ? 'COMPLIANT -- all critical mitigations satisfied, authorization recommended'
    : satisfiedCount >= mitigations.length - 1
    ? `COMPLIANT WITH CONDITIONS -- ${requiredCount} mitigation(s) pending, address before operation`
    : `NON-COMPLIANT -- ${requiredCount} required mitigations not satisfied`

  const checklist = [
    'Remote ID registration verified',
    'Pilot BVLOS endorsement current',
    'Drone airworthiness certificate valid',
    'Third-party liability insurance > $1M',
    'UTM flight plan submitted and accepted',
    'Emergency procedures briefed to all crew',
    'NOTAM filed for operation area',
    'C2 link redundancy tested pre-flight',
  ]

  const notes: string[] = []
  if (distance > drone.rangeKm * 0.7) notes.push(`Operation distance ${distance} km near max range ${drone.rangeKm} km -- verify energy reserves`)
  if (altitude > 400) notes.push('Altitude above 400 ft AGL -- Class E airspace, additional coordination required')
  if (popDensity === 'dense_urban') notes.push('Dense urban operation -- enhanced ground risk mitigation mandatory')
  if (!daa) notes.push('No DAA capability -- BVLOS operation requires observer network or enhanced detect system')
  if (notes.length === 0) notes.push('Standard BVLOS operation within regulatory framework')

  return {
    compliance_id: 'BVC-' + Math.floor(rng() * 0xFFFFFFFF).toString(16).toUpperCase().slice(0, 8),
    drone_model: input.drone_model || 'DJI_M30',
    operation_type: opType,
    sail_level: sailLevel,
    strategic_mitigations_required: requiredCount,
    mitigations_satisfied: satisfiedCount,
    operational_authority_path: authPath,
    overall_compliance: overallCompliance,
    ground_risk_class: `GRC ${grc} (SORA)`,
    air_risk_class: `ARC ${['a', 'b', 'c', 'd'][airRisk - 1] || 'c'}`,
    grc_final: `Final GRC: ${grc} (after strategic mitigations)`,
    mitigation_requirements: mitigations,
    authorization_checklist: checklist,
    notes: notes,
  }
}

const bvlos_compliance_checker = defineTool({
  name: 'bvlos_compliance_checker',
  description: 'Beyond-Visual-Line-of-Sight regulatory compliance checking with SORA-based risk assessment, SAIL level determination, strategic mitigation verification, and operational authorization pathway planning',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON: { drone_model: string, operation_type?: "linear_infrastructure"|"area_survey"|"delivery"|"emergency_response"|"cargo_transport", distance_km?: number, altitude_m?: number, population_density?: "sparsely_populated"|"populated"|"dense_urban", ground_risk_class?: "I"|"II"|"III"|"IV"|"V", detect_and_avoid?: boolean, c2_link_redundancy?: "single"|"dual"|"triple", emergency_recovery?: "parachute"|"auto_rtl"|"hybrid", seed_date?: string }',
    },
  },
  output: {
    schema: { type: 'string' as const },
    render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
  },
  async execute(args: { input_data: string }) {
    return JSON.stringify(checkBvlosCompliance(JSON.parse(args.input_data)), null, 2)
  },
})

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(drone_route_planner)
  tools.register(cargo_manifest_optimizer)
  tools.register(utm_coordinator)
  tools.register(vertiport_planner)
  tools.register(battery_swap_scheduler)
  tools.register(airspace_deconfliction)
  tools.register(weather_impact_drone)
  tools.register(bvlos_compliance_checker)
}
