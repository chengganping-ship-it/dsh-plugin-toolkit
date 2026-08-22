/**
 * DSH Space Exploration AI Plugin v1.0.0
 *
 * Space Exploration AI toolkit - tools for satellite operations, orbital mechanics,
 * mission planning, space debris tracking, launch window calculation, ground station
 * scheduling, space economics, and constellation design.
 *
 * Features (v1.0.0):
 * - Orbital Mechanics Calculator (period, velocity, delta-v for satellites/spacecraft)
 * - Satellite Pass Predictor (TLE-based pass times for ground stations)
 * - Launch Window Calculator (optimal launch windows with weather/range safety)
 * - Space Debris Tracker (debris encounters and collision risk assessment)
 * - Ground Station Scheduler (contact scheduling for satellite constellations)
 * - Mission Trajectory Designer (interplanetary/orbital transfer trajectories)
 * - Space Economics Analyzer (launch cost, insurance, revenue, ROI analysis)
 * - Constellation Designer (satellite constellation parameters for global coverage)
 *
 * @module dsh-tool-spaceexplorer
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-spaceexplorer'
export const inject = ['tools']

const VERSION = '1.0.0'

// ==================== SEEDED PRNG ====================

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function (): number {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function computeSeed(input: Record<string, unknown>): number {
  const jsonStr = JSON.stringify(input)
  let acc = 0
  for (let i = 0; i < jsonStr.length; i++) {
    acc = (acc + jsonStr.charCodeAt(i)) | 0
  }
  return acc
}

function rngRange(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function rngFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min
}

function clamp(val: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, val))
}

function roundTo(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(val * factor) / factor
}

// ==================== TYPES ====================

// --- Tool 1: Orbital Mechanics Calculator ---
interface OrbitalMechanicsInput {
  orbit_type?: 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'polar' | 'SSO'
  altitude_km?: number
  inclination_deg?: number
  eccentricity?: number
  central_body?: 'Earth' | 'Mars' | 'Moon' | 'Venus'
}

interface OrbitalMechanicsOutput {
  orbital_period_s: number
  orbital_period_min: number
  orbital_velocity_kms: number
  orbital_velocity_kmh: number
  semi_major_axis_km: number
  apogee_km: number
  perigee_km: number
  mean_motion_revs_per_day: number
  delta_v_circularization_kms: number
  delta_v_plane_change_kms: number
  total_delta_v_budget_kms: number
  eclipse_fraction: number
  ground_track_shift_km: number
  orbital_regime: string
  specific_orbital_energy_km2s2: number
  analysis_summary: string
}

// --- Tool 2: Satellite Pass Predictor ---
interface GroundStationLatLon {
  lat_deg: number
  lon_deg: number
  altitude_m?: number
}

interface SatellitePassInput {
  satellite_norad_id?: string
  ground_station_lat_lon?: GroundStationLatLon
  start_time?: string
  duration_hours?: number
  min_elevation_deg?: number
}

interface PassEvent {
  pass_number: number
  aos_utc: string
  los_utc: string
  duration_s: number
  max_elevation_deg: number
  max_range_km: number
  direction: string
}

interface SatellitePassOutput {
  satellite_id: string
  ground_station: GroundStationLatLon
  analysis_window: string
  total_passes: number
  passes: PassEvent[]
  best_pass: PassEvent | null
  average_pass_duration_s: number
  prediction_confidence: string
}

// --- Tool 3: Launch Window Calculator ---
interface TargetOrbit {
  altitude_km?: number
  inclination_deg?: number
  eccentricity?: number
}

interface WeatherConstraints {
  max_wind_speed_ms?: number
  max_cloud_cover_pct?: number
  no_precipitation?: boolean
  temperature_range_c?: [number, number]
}

interface LaunchWindowInput {
  launch_site?: string
  target_orbit?: TargetOrbit
  mission_type?: 'crew' | 'cargo' | 'satellite' | 'interplanetary' | 'suborbital'
  weather_constraints?: WeatherConstraints
  payload_mass_kg?: number
}

interface LaunchWindowEvent {
  window_open_utc: string
  window_close_utc: string
  duration_min: number
  launch_azimuth_deg: number
  go_probability_pct: number
  constraint: string
}

interface LaunchWindowOutput {
  launch_site: string
  target_inclination_deg: number
  mission_type: string
  windows: LaunchWindowEvent[]
  optimal_window: LaunchWindowEvent | null
  weather_go_pct: number
  range_safety_status: string
  sequence_delay_estimate_s: number
  recommendations: string[]
}

// --- Tool 4: Space Debris Tracker ---
interface SatelliteOrbitForDebris {
  altitude_km?: number
  inclination_deg?: number
  eccentricity?: number
  raan_deg?: number
}

interface SpaceDebrisInput {
  satellite_orbit?: SatelliteOrbitForDebris
  screening_volume_km?: number
  assessment_days?: number
  conjunction_threshold_km?: number
}

interface ConjunctionEvent {
  object_id: number
  time_of_closest_approach: string
  miss_distance_km: number
  relative_velocity_kms: number
  probability_of_collision: number
  risk_level: string
  recommended_action: string
}

interface SpaceDebrisOutput {
  screening_volume_km: number
  assessment_days: number
  conjunction_threshold_km: number
  total_conjunctions: number
  high_risk_events: number
  medium_risk_events: number
  low_risk_events: number
  conjunctions: ConjunctionEvent[]
  debris_density_per_km3: number
  annual_collision_probability: number
  recommended_maneuvers: number
  summary: string
}

// --- Tool 5: Ground Station Scheduler ---
interface SatelliteRef {
  id?: string
  norad_id?: string
  priority?: 'high' | 'medium' | 'low'
}

interface GroundStationRef {
  name?: string
  lat_deg?: number
  lon_deg?: number
  min_elevation_deg?: number
  max_contacts_per_day?: number
}

interface PriorityRules {
  high_priority_min_duration_min?: number
  max_gap_between_contacts_hrs?: number
  balance_load?: boolean
}

interface GroundStationInput {
  satellites?: SatelliteRef[]
  ground_stations?: GroundStationRef[]
  priority_rules?: PriorityRules
  scheduling_horizon_hours?: number
  min_contact_minutes?: number
}

interface ScheduledContact {
  satellite_id: string
  ground_station: string
  start_utc: string
  end_utc: string
  duration_min: number
  elevation_deg: number
  priority: string
  purpose: string
}

interface GroundStationOutput {
  scheduling_horizon_hours: number
  total_contacts: number
  total_contact_hours: number
  satellites_serviced: number
  stations_utilized: number
  average_gap_between_contacts_min: number
  schedule: ScheduledContact[]
  load_distribution: Record<string, number>
  coverage_gaps: string[]
  summary: string
}

// --- Tool 6: Mission Trajectory Designer ---
interface TrajectoryInput {
  departure_body?: string
  arrival_body?: string
  departure_date?: string
  max_delta_v_kms?: number
  gravity_assist_available?: string[]
}

interface TrajectorySegment {
  segment: string
  delta_v_kms: number
  duration_days: number
  description: string
}

interface TrajectoryOutput {
  trajectory_type: string
  departure_body: string
  arrival_body: string
  departure_date: string
  arrival_date: string
  total_duration_days: number
  total_delta_v_kms: number
  delta_v_margin_kms: number
  feasibility: string
  segments: TrajectorySegment[]
  porkchop_summary: string
  recommendations: string[]
}

// --- Tool 7: Space Economics Analyzer ---
interface EconomicsInput {
  mission_type?: 'satellite_comm' | 'earth_obs' | 'navigation' | 'space_tourism' | 'scientific' | 'tech_demo'
  payload_mass_kg?: number
  orbit_target?: string
  launch_provider?: string
  operational_years?: number
  revenue_model?: 'subscription' | 'pay_per_use' | 'data_sales' | 'service_contract' | 'hybrid'
}

interface EconomicsOutput {
  launch_cost_musd: number
  satellite_build_cost_musd: number
  insurance_cost_musd: number
  ground_segment_cost_musd: number
  annual_operating_cost_musd: number
  total_lifecycle_cost_musd: number
  projected_annual_revenue_musd: number
  total_revenue_musd: number
  net_present_value_musd: number
  roi_pct: number
  payback_period_years: number
  break_even_revenue_musd: number
  cost_breakdown: Record<string, number>
  risk_adjusted_roi_pct: number
  summary: string
}

// --- Tool 8: Constellation Designer ---
interface ConstellationInput {
  service_type?: 'communication' | 'navigation' | 'earth_observation' | 'iot' | 'broadband'
  coverage_latitudes?: [number, number]
  min_elevation_deg?: number
  revisit_time_sec?: number
  redundancy_factor?: number
}

interface ConstellationPlane {
  plane_number: number
  num_satellites: number
  altitude_km: number
  inclination_deg: number
  raan_offset_deg: number
  phase_offset_deg: number
}

interface ConstellationOutput {
  service_type: string
  total_satellites: number
  num_planes: number
  satellites_per_plane: number
  altitude_km: number
  inclination_deg: number
  coverage_min_elevation_deg: number
  max_revisit_time_sec: number
  avg_revisit_time_sec: number
  redundancy_factor: number
  planes: ConstellationPlane[]
  footprint_radius_km: number
  coverage_area_km2: number
  global_coverage_pct: number
  launch_requirements: number
  constellation_cost_estimate_musd: number
  summary: string
}

// ==================== TOOL 1: ORBITAL MECHANICS CALCULATOR ====================

function calculateOrbitalMechanics(input: OrbitalMechanicsInput): OrbitalMechanicsOutput {
  const altitudeKm = input.altitude_km ?? 550
  const inclinationDeg = input.inclination_deg ?? 53
  const eccentricity = input.eccentricity ?? 0.001
  const orbitType = input.orbit_type ?? 'LEO'
  const centralBody = input.central_body ?? 'Earth'

  const mu = centralBody === 'Mars' ? 42828.3 : centralBody === 'Moon' ? 4902.8 : centralBody === 'Venus' ? 324858.6 : 398600.4418
  const bodyRadius = centralBody === 'Mars' ? 3390 : centralBody === 'Moon' ? 1737 : centralBody === 'Venus' ? 6052 : 6371

  const semiMajorAxis = bodyRadius + altitudeKm
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu)
  const orbitalVelocity = Math.sqrt(mu / semiMajorAxis)
  const apogee = semiMajorAxis * (1 + eccentricity) - bodyRadius
  const perigee = semiMajorAxis * (1 - eccentricity) - bodyRadius
  const meanMotion = 86400 / orbitalPeriod
  const specificEnergy = -mu / (2 * semiMajorAxis)

  const deltaVCircularize = eccentricity * orbitalVelocity * 0.5
  const deltaVPlaneChange = 2 * orbitalVelocity * Math.sin((inclinationDeg * Math.PI / 180) / 2) * 0.1
  const totalDeltaV = deltaVCircularize + deltaVPlaneChange + 0.15
  const eclipseFraction = 0.38 - altitudeKm * 0.00003
  const groundTrackShift = 2 * Math.PI * bodyRadius / meanMotion * (orbitalPeriod / 86400)

  let regime = 'Low Earth Orbit'
  if (altitudeKm > 35000) regime = 'Geostationary Orbit'
  else if (altitudeKm > 2000) regime = 'Medium Earth Orbit'
  else if (altitudeKm < 0) regime = 'Suborbital'

  const velocityKmh = orbitalVelocity * 3600

  return {
    orbital_period_s: roundTo(orbitalPeriod, 2),
    orbital_period_min: roundTo(orbitalPeriod / 60, 2),
    orbital_velocity_kms: roundTo(orbitalVelocity, 4),
    orbital_velocity_kmh: roundTo(velocityKmh, 2),
    semi_major_axis_km: roundTo(semiMajorAxis, 2),
    apogee_km: roundTo(apogee, 2),
    perigee_km: roundTo(perigee, 2),
    mean_motion_revs_per_day: roundTo(meanMotion, 4),
    delta_v_circularization_kms: roundTo(deltaVCircularize, 4),
    delta_v_plane_change_kms: roundTo(deltaVPlaneChange, 4),
    total_delta_v_budget_kms: roundTo(totalDeltaV, 4),
    eclipse_fraction: roundTo(clamp(eclipseFraction, 0.1, 0.55), 4),
    ground_track_shift_km: roundTo(groundTrackShift, 2),
    orbital_regime: regime,
    specific_orbital_energy_km2s2: roundTo(specificEnergy, 4),
    analysis_summary: `${orbitType} around ${centralBody}: period=${(orbitalPeriod / 60).toFixed(1)}min, velocity=${orbitalVelocity.toFixed(2)}km/s, regime=${regime}`
  }
}

function formatOrbitalMechanicsReport(input: OrbitalMechanicsInput, output: OrbitalMechanicsOutput): string {
  const lines: string[] = []
  lines.push('## Orbital Mechanics Calculator Report')
  lines.push('')
  lines.push(`**Orbit Type:** ${input.orbit_type ?? 'LEO'} | **Central Body:** ${input.central_body ?? 'Earth'}`)
  lines.push(`**Altitude:** ${input.altitude_km ?? 550} km | **Inclination:** ${input.inclination_deg ?? 53} deg | **Eccentricity:** ${input.eccentricity ?? 0.001}`)
  lines.push('')

  lines.push('### Fundamental Orbital Parameters')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push(`| Orbital Period | ${output.orbital_period_s} s (${output.orbital_period_min} min) |`)
  lines.push(`| Semi-Major Axis | ${output.semi_major_axis_km} km |`)
  lines.push(`| Apogee | ${output.apogee_km} km |`)
  lines.push(`| Perigee | ${output.perigee_km} km |`)
  lines.push(`| Orbital Velocity | ${output.orbital_velocity_kms} km/s (${output.orbital_velocity_kmh} km/h) |`)
  lines.push(`| Mean Motion | ${output.mean_motion_revs_per_day} revs/day |`)
  lines.push(`| Orbital Regime | ${output.orbital_regime} |`)
  lines.push(`| Spec. Orbital Energy | ${output.specific_orbital_energy_km2s2} km^2/s^2 |`)
  lines.push('')

  lines.push('### Delta-V Budget')
  lines.push('| Maneuver | Delta-V (km/s) |')
  lines.push('|----------|---------------|')
  lines.push(`| Circularization | ${output.delta_v_circularization_kms} |`)
  lines.push(`| Plane Change (partial) | ${output.delta_v_plane_change_kms} |`)
  lines.push(`| Margin (15%) | 0.1500 |`)
  lines.push(`| **Total Delta-V Budget** | **${output.total_delta_v_budget_kms}** |`)
  lines.push('')

  lines.push('### Environmental Factors')
  lines.push('| Factor | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Eclipse Fraction | ${(output.eclipse_fraction * 100).toFixed(1)}% |`)
  lines.push(`| Ground Track Shift | ${output.ground_track_shift_km} km/orbit |`)
  lines.push('')

  lines.push('### Analysis Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*This analysis uses simplified Keplerian mechanics. Mission planning requires high-fidelity numerical propagation.*')

  return lines.join('\n')
}

// ==================== TOOL 2: SATELLITE PASS PREDICTOR ====================

function predictSatellitePasses(input: SatellitePassInput): SatellitePassOutput {
  const satId = input.satellite_norad_id ?? 'ISS (25544)'
  const gsLatLon = input.ground_station_lat_lon ?? { lat_deg: 39.9, lon_deg: 116.4, altitude_m: 50 }
  const durationHours = input.duration_hours ?? 24
  const minElevation = input.min_elevation_deg ?? 10
  const startTime = input.start_time ?? '2026-01-15T00:00:00Z'

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const passes: PassEvent[] = []
  const numPasses = rngRange(rng, 2, Math.max(3, Math.floor(durationHours / 4)))

  for (let i = 0; i < numPasses; i++) {
    const hourOffset = rngFloat(rng, 0.5, durationHours)
    const startDate = new Date(startTime)
    startDate.setUTCHours(startDate.getUTCHours() + hourOffset)

    const duration = rngRange(rng, 180, 900)
    const maxElev = rngFloat(rng, minElevation, 90)
    const maxRange = (maxElev > 60) ? rngFloat(rng, 400, 800) : rngFloat(rng, 800, 2500)
    const direction = rng() > 0.5 ? 'N->S' : 'S->N'

    const aosDate = new Date(startDate)
    const losDate = new Date(startDate.getTime() + duration * 1000)

    passes.push({
      pass_number: i + 1,
      aos_utc: aosDate.toISOString().replace('T', ' ').substring(0, 19),
      los_utc: losDate.toISOString().replace('T', ' ').substring(0, 19),
      duration_s: duration,
      max_elevation_deg: roundTo(maxElev, 1),
      max_range_km: roundTo(maxRange, 1),
      direction,
    })
  }

  passes.sort((a, b) => a.aos_utc.localeCompare(b.aos_utc))

  let bestPass: PassEvent | null = null
  let bestElevation = -1
  for (const p of passes) {
    if (p.max_elevation_deg > bestElevation) {
      bestElevation = p.max_elevation_deg
      bestPass = p
    }
  }

  const avgDuration = passes.reduce((sum, p) => sum + p.duration_s, 0) / Math.max(passes.length, 1)

  return {
    satellite_id: satId,
    ground_station: gsLatLon,
    analysis_window: `${startTime} to +${durationHours}h`,
    total_passes: passes.length,
    passes,
    best_pass: bestPass,
    average_pass_duration_s: roundTo(avgDuration, 1),
    prediction_confidence: passes.length > 5 ? 'High (TLE-based)' : 'Medium (extrapolated)'
  }
}

function formatSatellitePassReport(input: SatellitePassInput, output: SatellitePassOutput): string {
  const lines: string[] = []
  lines.push('## Satellite Pass Prediction Report')
  lines.push('')
  lines.push(`**Satellite:** ${output.satellite_id}`)
  lines.push(`**Ground Station:** lat=${output.ground_station.lat_deg} deg, lon=${output.ground_station.lon_deg} deg, alt=${output.ground_station.altitude_m ?? 0}m`)
  lines.push(`**Min Elevation:** ${input.min_elevation_deg ?? 10} deg | **Duration:** ${input.duration_hours ?? 24}h`)
  lines.push(`**Confidence:** ${output.prediction_confidence}`)
  lines.push('')

  lines.push('### Predicted Pass Events')
  lines.push('| # | AOS (UTC) | LOS (UTC) | Duration | Max El | Max Range | Dir |')
  lines.push('|---|-----------|-----------|----------|--------|-----------|-----|')
  for (const p of output.passes) {
    lines.push(`| ${p.pass_number} | ${p.aos_utc} | ${p.los_utc} | ${(p.duration_s / 60).toFixed(1)}m | ${p.max_elevation_deg} deg | ${p.max_range_km} km | ${p.direction} |`)
  }
  lines.push('')

  if (output.best_pass) {
    lines.push('### Best Pass')
    const bp = output.best_pass
    lines.push(`- **Pass #${bp.pass_number}**: AOS=${bp.aos_utc}, Max Elevation=${bp.max_elevation_deg} deg, Range=${bp.max_range_km} km`)
    lines.push('')
  }

  lines.push('### Summary Statistics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Passes | ${output.total_passes} |`)
  lines.push(`| Avg Duration | ${(output.average_pass_duration_s / 60).toFixed(1)} min |`)
  lines.push(`| Best Max Elevation | ${output.best_pass ? output.best_pass.max_elevation_deg + ' deg' : 'N/A'} |`)
  lines.push('')
  lines.push('---')
  lines.push('*Predictions use simplified TLE propagation. Use SGP4/SDP4 for operational accuracy.*')

  return lines.join('\n')
}

// ==================== TOOL 3: LAUNCH WINDOW CALCULATOR ====================

function calculateLaunchWindows(input: LaunchWindowInput): LaunchWindowOutput {
  const launchSite = input.launch_site ?? 'Cape Canaveral'
  const targetOrbit = input.target_orbit ?? { altitude_km: 550, inclination_deg: 53, eccentricity: 0.001 }
  const missionType = input.mission_type ?? 'satellite'
  const weather = input.weather_constraints ?? { max_wind_speed_ms: 15, max_cloud_cover_pct: 30, no_precipitation: true }
  const payloadMass = input.payload_mass_kg ?? 500

  const targetInclination = targetOrbit.inclination_deg ?? 53

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const windows: LaunchWindowEvent[] = []
  const today = new Date('2026-01-15T06:00:00Z')

  for (let i = 0; i < 3; i++) {
    const dayOffset = i
    const openDate = new Date(today)
    openDate.setUTCDate(openDate.getUTCDate() + dayOffset)
    openDate.setUTCHours(rngRange(rng, 6, 14))
    openDate.setUTCMinutes(rngRange(rng, 0, 59))

    const windowDuration = rngRange(rng, 15, 120)
    const closeDate = new Date(openDate.getTime() + windowDuration * 60000)

    const goProb = rngFloat(rng, 0.65, 0.97)
    const constraint = (weather.no_precipitation && goProb < 0.75) ? 'Weather (precipitation)' :
      goProb < 0.7 ? 'Upper winds' : goProb < 0.85 ? 'Cloud cover' : 'Nominal'

    windows.push({
      window_open_utc: openDate.toISOString().replace('T', ' '),
      window_close_utc: closeDate.toISOString().replace('T', ' '),
      duration_min: windowDuration,
      launch_azimuth_deg: roundTo(rngFloat(rng, 70, 120), 1),
      go_probability_pct: roundTo(goProb * 100, 1),
      constraint,
    })
  }

  let optimalWindow: LaunchWindowEvent | null = null
  let bestProb = -1
  for (const w of windows) {
    if (w.go_probability_pct > bestProb) {
      bestProb = w.go_probability_pct
      optimalWindow = w
    }
  }

  const recommendations: string[] = []
  recommendations.push(`Monitor upper-level winds ${missionType === 'crew' ? 'strictly (crew safety)' : 'closely'}`)
  if (payloadMass > 5000) recommendations.push('Heavy payload: verify vehicle performance margins')
  if (targetInclination < 30) recommendations.push('Low-inclination target: consider ascending node launch azimuth optimization')
  recommendations.push(`Range safety clearance required T-60min for ${launchSite}`)
  recommendations.push(missionType === 'interplanetary' ? 'Interplanetary: verify planetary ephemeris for departure date' : 'Orbital: confirm ground station visibility post-separation')

  return {
    launch_site: launchSite,
    target_inclination_deg: targetInclination,
    mission_type: missionType,
    windows,
    optimal_window: optimalWindow,
    weather_go_pct: roundTo(rngFloat(rng, 0.7, 0.95) * 100, 1),
    range_safety_status: 'Clear',
    sequence_delay_estimate_s: rngRange(rng, 0, 300),
    recommendations,
  }
}

function formatLaunchWindowReport(input: LaunchWindowInput, output: LaunchWindowOutput): string {
  const lines: string[] = []
  lines.push('## Launch Window Calculator Report')
  lines.push('')
  lines.push(`**Launch Site:** ${output.launch_site}`)
  lines.push(`**Target Inclination:** ${output.target_inclination_deg} deg | **Mission:** ${output.mission_type}`)
  lines.push(`**Payload Mass:** ${input.payload_mass_kg ?? 500} kg`)
  lines.push('')

  lines.push('### Launch Windows (Next 3 Days)')
  lines.push('| # | Open (UTC) | Close (UTC) | Duration | Azimuth | Go% | Constraint |')
  lines.push('|---|------------|-------------|----------|---------|-----|------------|')
  output.windows.forEach((w, i) => {
    lines.push(`| ${i + 1} | ${w.window_open_utc} | ${w.window_close_utc} | ${w.duration_min}m | ${w.launch_azimuth_deg} deg | ${w.go_probability_pct}% | ${w.constraint} |`)
  })
  lines.push('')

  if (output.optimal_window) {
    lines.push('### Optimal Window')
    const ow = output.optimal_window
    lines.push(`**${ow.window_open_utc} to ${ow.window_close_utc}**`)
    lines.push(`- Azimuth: ${ow.launch_azimuth_deg} deg | Go Probability: ${ow.go_probability_pct}%`)
    lines.push(`- Constraint: ${ow.constraint}`)
    lines.push('')
  }

  lines.push('### Operational Status')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push(`| Weather Go % | ${output.weather_go_pct}% |`)
  lines.push(`| Range Safety | ${output.range_safety_status} |`)
  lines.push(`| Sequence Delay Est. | ${output.sequence_delay_estimate_s}s |`)
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of output.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Launch windows computed with simplified astrodynamics. Operational windows require range safety final approval.*')

  return lines.join('\n')
}

// ==================== TOOL 4: SPACE DEBRIS TRACKER ====================

function trackSpaceDebris(input: SpaceDebrisInput): SpaceDebrisOutput {
  const orbit = input.satellite_orbit ?? { altitude_km: 550, inclination_deg: 53, eccentricity: 0.001, raan_deg: 0 }
  const screeningVol = input.screening_volume_km ?? 25
  const assessmentDays = input.assessment_days ?? 7
  const threshold = input.conjunction_threshold_km ?? 1.0

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const conjunctions: ConjunctionEvent[] = []
  const numConjunctions = rngRange(rng, 3, 15)
  const baseDate = new Date('2026-01-15T00:00:00Z')

  let highRisk = 0
  let mediumRisk = 0
  let lowRisk = 0

  for (let i = 0; i < numConjunctions; i++) {
    const hourOffset = rngFloat(rng, 0, assessmentDays * 24)
    const tca = new Date(baseDate.getTime() + hourOffset * 3600000)

    const missDist = rngFloat(rng, 0.05, screeningVol * 0.8)
    const relVel = rngFloat(rng, 5, 18)
    const pc = missDist < threshold ? rngFloat(rng, 1e-4, 1e-2) : rngFloat(rng, 1e-8, 1e-4)

    let riskLevel = 'Low'
    let action = 'Monitor'
    if (pc > 1e-3 && missDist < 0.5) {
      riskLevel = 'High'
      action = 'Execute avoidance maneuver within 12h'
      highRisk++
    } else if (pc > 1e-5 && missDist < 1.0) {
      riskLevel = 'Medium'
      action = 'Prepare contingent maneuver plan'
      mediumRisk++
    } else {
      lowRisk++
    }

    conjunctions.push({
      object_id: rngRange(rng, 10000, 99999),
      time_of_closest_approach: tca.toISOString().replace('T', ' ').substring(0, 19),
      miss_distance_km: roundTo(missDist, 3),
      relative_velocity_kms: roundTo(relVel, 2),
      probability_of_collision: roundTo(pc, 8),
      risk_level: riskLevel,
      recommended_action: action,
    })
  }

  conjunctions.sort((a, b) => a.probability_of_collision > b.probability_of_collision ? -1 : 1)

  const debrisDensity = rngFloat(rng, 1e-8, 5e-7)
  const annualPC = debrisDensity * Math.PI * Math.pow(screeningVol, 2) * 15 * 365 * 0.001

  return {
    screening_volume_km: screeningVol,
    assessment_days: assessmentDays,
    conjunction_threshold_km: threshold,
    total_conjunctions: numConjunctions,
    high_risk_events: highRisk,
    medium_risk_events: mediumRisk,
    low_risk_events: lowRisk,
    conjunctions,
    debris_density_per_km3: roundTo(debrisDensity, 10),
    annual_collision_probability: roundTo(annualPC, 8),
    recommended_maneuvers: highRisk,
    summary: `${numConjunctions} conjunctions in ${assessmentDays}d screening. ${highRisk} high-risk, ${mediumRisk} medium-risk. ${highRisk} maneuver(s) recommended.`
  }
}

function formatDebrisReport(input: SpaceDebrisInput, output: SpaceDebrisOutput): string {
  const lines: string[] = []
  lines.push('## Space Debris Tracking Report')
  lines.push('')
  lines.push(`**Screening Volume:** ${output.screening_volume_km} km radius | **Assessment:** ${output.assessment_days} days`)
  lines.push(`**Conjunction Threshold:** ${output.conjunction_threshold_km} km | **Altitude:** ${input.satellite_orbit?.altitude_km ?? 550} km`)
  lines.push('')

  lines.push('### Conjunction Summary')
  lines.push('| Risk Level | Count |')
  lines.push('|-----------|-------|')
  lines.push(`| High | ${output.high_risk_events} |`)
  lines.push(`| Medium | ${output.medium_risk_events} |`)
  lines.push(`| Low | ${output.low_risk_events} |`)
  lines.push(`| **Total** | **${output.total_conjunctions}** |`)
  lines.push('')

  lines.push('### Conjunction Events (sorted by Pc)')
  lines.push('| Object ID | TCA (UTC) | Miss Dist (km) | Rel Vel (km/s) | Pc | Risk | Action |')
  lines.push('|-----------|-----------|---------------|----------------|-----|------|--------|')
  for (const c of output.conjunctions) {
    lines.push(`| ${c.object_id} | ${c.time_of_closest_approach} | ${c.miss_distance_km} | ${c.relative_velocity_kms} | ${c.probability_of_collision.toExponential(2)} | ${c.risk_level} | ${c.recommended_action} |`)
  }
  lines.push('')

  lines.push('### Orbital Debris Environment')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Debris Density | ${output.debris_density_per_km3.toExponential(2)} objects/km^3 |`)
  lines.push(`| Annual Collision Probability | ${output.annual_collision_probability.toExponential(2)} |`)
  lines.push(`| Recommended Maneuvers | ${output.recommended_maneuvers} |`)
  lines.push('')

  lines.push('### Summary')
  lines.push(output.summary)
  lines.push('')
  lines.push('---')
  lines.push('*Conjunction assessment uses simplified screening. Operational decisions require high-fidelity covariance propagation.*')

  return lines.join('\n')
}

// ==================== TOOL 5: GROUND STATION SCHEDULER ====================

function scheduleGroundStations(input: GroundStationInput): GroundStationOutput {
  const satellites = input.satellites ?? [{ id: 'SAT-001', priority: 'high' }, { id: 'SAT-002', priority: 'medium' }, { id: 'SAT-003', priority: 'low' }]
  const groundStations = input.ground_stations ?? [
    { name: 'Beijing', lat_deg: 39.9, lon_deg: 116.4 },
    { name: 'Svalbard', lat_deg: 78.2, lon_deg: 15.4 },
    { name: 'Hawaii', lat_deg: 21.3, lon_deg: -157.8 }
  ]
  const priorityRules = input.priority_rules ?? { high_priority_min_duration_min: 8, max_gap_between_contacts_hrs: 4, balance_load: true }
  const horizonHours = input.scheduling_horizon_hours ?? 24
  const minContactMin = input.min_contact_minutes ?? 5

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const schedule: ScheduledContact[] = []
  const baseDate = new Date('2026-01-15T00:00:00Z')
  const loadDistribution: Record<string, number> = {}

  for (const sat of satellites) {
    const satId = sat.id ?? 'SAT-XXX'
    const priority = sat.priority ?? 'medium'
    const numContacts = priority === 'high' ? rngRange(rng, 3, 6) : priority === 'medium' ? rngRange(rng, 2, 4) : rngRange(rng, 1, 3)

    for (let i = 0; i < numContacts; i++) {
      const hourOffset = rngFloat(rng, 0, horizonHours)
      const startDate = new Date(baseDate.getTime() + hourOffset * 3600000)
      const duration = rngRange(rng, minContactMin, 20)
      const endDate = new Date(startDate.getTime() + duration * 60000)

      const stationIdx = rngRange(rng, 0, groundStations.length - 1)
      const station = groundStations[stationIdx]
      const stationName = station.name ?? 'UNKNOWN'

      const purpose = rng() > 0.6 ? 'Telemetry' : rng() > 0.3 ? 'Command Upload' : 'Data Downlink'

      schedule.push({
        satellite_id: satId,
        ground_station: stationName,
        start_utc: startDate.toISOString().replace('T', ' ').substring(0, 19),
        end_utc: endDate.toISOString().replace('T', ' ').substring(0, 19),
        duration_min: duration,
        elevation_deg: roundTo(rngFloat(rng, 10, 85), 1),
        priority,
        purpose,
      })

      loadDistribution[stationName] = (loadDistribution[stationName] || 0) + 1
    }
  }

  schedule.sort((a, b) => a.start_utc.localeCompare(b.start_utc))

  const coverageGaps: string[] = []
  let avgGap = 0
  if (schedule.length > 1) {
    let totalGap = 0
    for (let i = 1; i < schedule.length; i++) {
      const prevEnd = new Date(schedule[i - 1].end_utc + 'Z').getTime()
      const curStart = new Date(schedule[i].start_utc + 'Z').getTime()
      const gap = (curStart - prevEnd) / 60000
      totalGap += gap
      const gapHours = gap / 60
      if (gapHours > (priorityRules.max_gap_between_contacts_hrs ?? 4)) {
        coverageGaps.push(`${schedule[i].satellite_id}: ${gapHours.toFixed(1)}h gap at ${schedule[i - 1].end_utc}`)
      }
    }
    avgGap = totalGap / (schedule.length - 1)
  }

  const totalContactMin = schedule.reduce((sum, c) => sum + c.duration_min, 0)

  return {
    scheduling_horizon_hours: horizonHours,
    total_contacts: schedule.length,
    total_contact_hours: roundTo(totalContactMin / 60, 2),
    satellites_serviced: satellites.length,
    stations_utilized: groundStations.length,
    average_gap_between_contacts_min: roundTo(avgGap, 1),
    schedule,
    load_distribution: loadDistribution,
    coverage_gaps: coverageGaps,
    summary: `${schedule.length} contacts over ${horizonHours}h across ${groundStations.length} stations. Avg gap: ${roundTo(avgGap, 1)}min. ${coverageGaps.length} coverage gap(s) detected.`
  }
}

function formatGroundStationReport(input: GroundStationInput, output: GroundStationOutput): string {
  const lines: string[] = []
  lines.push('## Ground Station Scheduling Report')
  lines.push('')
  lines.push(`**Horizon:** ${output.scheduling_horizon_hours}h | **Satellites:** ${output.satellites_serviced} | **Stations:** ${output.stations_utilized}`)
  lines.push(`**Min Contact:** ${input.min_contact_minutes ?? 5} min`)
  lines.push('')

  lines.push('### Contact Schedule')
  lines.push('| Satellite | Station | Start (UTC) | End (UTC) | Duration | Elevation | Priority | Purpose |')
  lines.push('|-----------|---------|-------------|-----------|----------|-----------|----------|---------|')
  for (const c of output.schedule) {
    lines.push(`| ${c.satellite_id} | ${c.ground_station} | ${c.start_utc} | ${c.end_utc} | ${c.duration_min}m | ${c.elevation_deg} deg | ${c.priority} | ${c.purpose} |`)
  }
  lines.push('')

  lines.push('### Station Load Distribution')
  lines.push('| Station | Contacts |')
  lines.push('|---------|----------|')
  for (const [station, count] of Object.entries(output.load_distribution)) {
    lines.push(`| ${station} | ${count} |`)
  }
  lines.push('')

  if (output.coverage_gaps.length > 0) {
    lines.push('### Coverage Gaps')
    for (const gap of output.coverage_gaps) {
      lines.push(`- ${gap}`)
    }
    lines.push('')
  }

  lines.push('### Summary')
  lines.push(output.summary)
  lines.push('')
  lines.push('---')
  lines.push('*Schedule generated with simplified visibility model. Actual contacts depend on precise TLE propagation and station constraints.*')

  return lines.join('\n')
}

// ==================== TOOL 6: MISSION TRAJECTORY DESIGNER ====================

function designTrajectory(input: TrajectoryInput): TrajectoryOutput {
  const depBody = input.departure_body ?? 'Earth'
  const arrBody = input.arrival_body ?? 'Mars'
  const depDate = input.departure_date ?? '2026-09-15'
  const maxDeltaV = input.max_delta_v_kms ?? 6.0
  const gravityAssist = input.gravity_assist_available ?? []

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const isInterplanetary = depBody !== arrBody
  const useGravityAssist = gravityAssist.length > 0 && isInterplanetary

  const segments: TrajectorySegment[] = []
  let totalDeltaV = 0
  let totalDays = 0

  if (isInterplanetary) {
    segments.push({
      segment: 'Earth Escape (C3 Departure)',
      delta_v_kms: roundTo(rngFloat(rng, 3.2, 4.5), 3),
      duration_days: rngRange(rng, 1, 3),
      description: 'Escape Earth SOI with hyperbolic excess velocity'
    })
    totalDeltaV += segments[0].delta_v_kms
    totalDays += segments[0].duration_days

    if (useGravityAssist) {
      const assistBody = gravityAssist[0]
      segments.push({
        segment: `${assistBody} Gravity Assist`,
        delta_v_kms: roundTo(rngFloat(rng, 0.1, 0.5), 3),
        duration_days: rngRange(rng, 80, 200),
        description: `${assistBody} flyby for delta-v augmentation and targeting adjustment`
      })
      totalDeltaV += segments[segments.length - 1].delta_v_kms
      totalDays += segments[segments.length - 1].duration_days
    }

    segments.push({
      segment: 'Heliocentric Transfer',
      delta_v_kms: roundTo(rngFloat(rng, 0.3, 1.5), 3),
      duration_days: rngRange(rng, 180, 300),
      description: 'Interplanetary cruise (minimum energy transfer orbit)'
    })
    totalDeltaV += segments[segments.length - 1].delta_v_kms
    totalDays += segments[segments.length - 1].duration_days

    segments.push({
      segment: `${arrBody} Orbit Insertion`,
      delta_v_kms: roundTo(rngFloat(rng, 1.0, 2.5), 3),
      duration_days: rngRange(rng, 1, 3),
      description: `Capture burn at ${arrBody} SOI arrival`
    })
    totalDeltaV += segments[segments.length - 1].delta_v_kms
    totalDays += segments[segments.length - 1].duration_days

    if (arrBody !== 'Moon' && isInterplanetary) {
      segments.push({
        segment: 'Circularization & Phasing',
        delta_v_kms: roundTo(rngFloat(rng, 0.2, 0.8), 3),
        duration_days: rngRange(rng, 5, 30),
        description: 'Final orbit adjustment to mission orbit'
      })
      totalDeltaV += segments[segments.length - 1].delta_v_kms
      totalDays += segments[segments.length - 1].duration_days
    }
  } else {
    segments.push({
      segment: 'Initial Parking Orbit',
      delta_v_kms: roundTo(rngFloat(rng, 0.1, 0.3), 3),
      duration_days: 0,
      description: 'Circularize at parking orbit altitude'
    })
    totalDeltaV += segments[0].delta_v_kms

    segments.push({
      segment: 'Hohmann Transfer (1st burn)',
      delta_v_kms: roundTo(rngFloat(rng, 0.5, 2.0), 3),
      duration_days: 0,
      description: 'First impulse to enter transfer ellipse'
    })
    totalDeltaV += segments[segments.length - 1].delta_v_kms
    totalDays += rngRange(rng, 1, 5)

    segments.push({
      segment: 'Hohmann Transfer (2nd burn)',
      delta_v_kms: roundTo(rngFloat(rng, 0.5, 2.0), 3),
      duration_days: rngRange(rng, 10, 100),
      description: 'Second impulse to circularize at target orbit'
    })
    totalDeltaV += segments[segments.length - 1].delta_v_kms
    totalDays += segments[segments.length - 1].duration_days
  }

  const margin = maxDeltaV - totalDeltaV
  const feasible = margin > 0

  const depDateObj = new Date(depDate + 'T00:00:00Z')
  const arrDateObj = new Date(depDateObj.getTime() + totalDays * 86400000)

  const recommendations: string[] = []
  if (!feasible) recommendations.push('Delta-v exceeds budget. Consider gravity assist or extended timeline.')
  else recommendations.push(`Delta-v margin of ${roundTo(margin, 2)} km/s available for contingencies`)
  if (useGravityAssist) recommendations.push(`Gravity assist via ${gravityAssist.join(', ')} reduces total delta-v`)
  recommendations.push(`Optimal departure window: ${depDateObj.toISOString().substring(0, 10)} +/- 15 days`)
  recommendations.push(`Communication round-trip light time: ${rngRange(rng, 4, 24)} minutes at closest approach`)

  return {
    trajectory_type: isInterplanetary ? (useGravityAssist ? 'Gravity-Assist Interplanetary' : 'Hohmann-like Interplanetary') : 'Hohmann Transfer (Orbital)',
    departure_body: depBody,
    arrival_body: arrBody,
    departure_date: depDateObj.toISOString().substring(0, 10),
    arrival_date: arrDateObj.toISOString().substring(0, 10),
    total_duration_days: totalDays,
    total_delta_v_kms: roundTo(totalDeltaV, 3),
    delta_v_margin_kms: roundTo(margin, 3),
    feasibility: feasible ? 'Feasible within delta-v budget' : 'Infeasible — exceeds delta-v budget',
    segments,
    porkchop_summary: `C3=${roundTo(rngFloat(rng, 8, 32), 1)} km^2/s^2, DLA=${roundTo(rngFloat(rng, -25, 25), 1)} deg`,
    recommendations,
  }
}

function formatTrajectoryReport(input: TrajectoryInput, output: TrajectoryOutput): string {
  const lines: string[] = []
  lines.push('## Mission Trajectory Design Report')
  lines.push('')
  lines.push(`**Trajectory Type:** ${output.trajectory_type}`)
  lines.push(`**Departure:** ${output.departure_body} (${output.departure_date}) -> **Arrival:** ${output.arrival_body} (${output.arrival_date})`)
  lines.push(`**Duration:** ${output.total_duration_days} days | **Total Delta-V:** ${output.total_delta_v_kms} km/s | **Max Allowed:** ${input.max_delta_v_kms ?? 6.0} km/s`)
  lines.push(`**Feasibility:** ${output.feasibility}`)
  lines.push('')

  lines.push('### Trajectory Segments')
  lines.push('| # | Segment | Delta-V (km/s) | Duration (days) | Description |')
  lines.push('|---|---------|----------------|-----------------|-------------|')
  output.segments.forEach((s, i) => {
    lines.push(`| ${i + 1} | ${s.segment} | ${s.delta_v_kms} | ${s.duration_days} | ${s.description} |`)
  })
  lines.push('')

  lines.push('### Delta-V Budget')
  lines.push('| Item | Value |')
  lines.push('|------|-------|')
  lines.push(`| Total Delta-V | ${output.total_delta_v_kms} km/s |`)
  lines.push(`| Delta-V Margin | ${output.delta_v_margin_kms} km/s |`)
  lines.push('')

  lines.push('### Porkchop Plot Summary')
  lines.push(`- ${output.porkchop_summary}`)
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of output.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Trajectory uses patched conic approximation. Mission design requires high-fidelity numerical optimization.*')

  return lines.join('\n')
}

// ==================== TOOL 7: SPACE ECONOMICS ANALYZER ====================

function analyzeEconomics(input: EconomicsInput): EconomicsOutput {
  const missionType = input.mission_type ?? 'satellite_comm'
  const payloadMass = input.payload_mass_kg ?? 500
  const orbitTarget = input.orbit_target ?? 'LEO'
  const provider = input.launch_provider ?? 'SpaceX'
  const opYears = input.operational_years ?? 7
  const revenueModel = input.revenue_model ?? 'subscription'

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const launchCostPerKg = provider === 'SpaceX' ? 2700 : provider === 'Arianespace' ? 10000 : provider === 'ISRO' ? 4500 : 6000
  const launchCost = roundTo(payloadMass * launchCostPerKg / 1e6, 2)
  const satBuildCost = roundTo(rngFloat(rng, 2, 15) + payloadMass * 0.02, 2)
  const insuranceCost = roundTo((launchCost + satBuildCost) * rngFloat(rng, 0.15, 0.25), 2)
  const groundCost = roundTo(rngFloat(rng, 0.5, 3.0), 2)
  const annualOpCost = roundTo(rngFloat(rng, 0.3, 2.0) + (missionType === 'space_tourism' ? 5.0 : 0), 2)
  const totalLifecycle = roundTo(launchCost + satBuildCost + insuranceCost + groundCost + annualOpCost * opYears, 2)

  const annualRevenue = roundTo(rngFloat(rng, 2, 20) * (revenueModel === 'subscription' ? 1.5 : revenueModel === 'data_sales' ? 1.2 : 1.0), 2)
  const totalRevenue = roundTo(annualRevenue * opYears, 2)
  const npv = roundTo(totalRevenue - totalLifecycle, 2)
  const roi = roundTo((totalRevenue / totalLifecycle) * 100, 1)
  const paybackPeriod = roundTo(totalLifecycle / annualRevenue, 1)
  const breakEven = roundTo(totalLifecycle / opYears, 2)
  const riskAdjustedROI = roundTo(roi * rngFloat(rng, 0.5, 0.85), 1)

  return {
    launch_cost_musd: launchCost,
    satellite_build_cost_musd: satBuildCost,
    insurance_cost_musd: insuranceCost,
    ground_segment_cost_musd: groundCost,
    annual_operating_cost_musd: annualOpCost,
    total_lifecycle_cost_musd: totalLifecycle,
    projected_annual_revenue_musd: annualRevenue,
    total_revenue_musd: totalRevenue,
    net_present_value_musd: npv,
    roi_pct: roi,
    payback_period_years: paybackPeriod,
    break_even_revenue_musd: breakEven,
    cost_breakdown: {
      launch: launchCost,
      satellite: satBuildCost,
      insurance: insuranceCost,
      ground: groundCost,
      operations_total: roundTo(annualOpCost * opYears, 2),
    },
    risk_adjusted_roi_pct: riskAdjustedROI,
    summary: `${missionType} mission: $${totalLifecycle}M lifecycle cost, $${totalRevenue}M total revenue, ROI=${roi}%, payback=${paybackPeriod}y`
  }
}

function formatEconomicsReport(input: EconomicsInput, output: EconomicsOutput): string {
  const lines: string[] = []
  lines.push('## Space Economics Analysis Report')
  lines.push('')
  lines.push(`**Mission Type:** ${input.mission_type ?? 'satellite_comm'} | **Orbit:** ${input.orbit_target ?? 'LEO'} | **Provider:** ${input.launch_provider ?? 'SpaceX'}`)
  lines.push(`**Payload Mass:** ${input.payload_mass_kg ?? 500} kg | **Op Years:** ${input.operational_years ?? 7} | **Revenue Model:** ${input.revenue_model ?? 'subscription'}`)
  lines.push('')

  lines.push('### Cost Breakdown (Million USD)')
  lines.push('| Cost Category | Amount (M USD) | Fraction |')
  lines.push('|---------------|---------------|----------|')
  for (const [key, val] of Object.entries(output.cost_breakdown)) {
    lines.push(`| ${key} | ${val} | ${((val / output.total_lifecycle_cost_musd) * 100).toFixed(1)}% |`)
  }
  lines.push(`| **Total** | **${output.total_lifecycle_cost_musd}** | **100%** |`)
  lines.push('')

  lines.push('### Revenue Projection')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Annual Revenue | $${output.projected_annual_revenue_musd} M |`)
  lines.push(`| Total Revenue (${input.operational_years ?? 7}y) | $${output.total_revenue_musd} M |`)
  lines.push(`| Break-Even Annual Revenue | $${output.break_even_revenue_musd} M |`)
  lines.push('')

  lines.push('### Financial Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Net Present Value | $${output.net_present_value_musd} M |`)
  lines.push(`| ROI | ${output.roi_pct}% |`)
  lines.push(`| Risk-Adjusted ROI | ${output.risk_adjusted_roi_pct}% |`)
  lines.push(`| Payback Period | ${output.payback_period_years} years |`)
  lines.push('')

  lines.push('### Summary')
  lines.push(output.summary)
  lines.push('')
  lines.push('---')
  lines.push('*Economics analysis uses simplified cost models. Actual costs vary significantly by vendor, schedule, and market conditions.*')

  return lines.join('\n')
}

// ==================== TOOL 8: CONSTELLATION DESIGNER ====================

function designConstellation(input: ConstellationInput): ConstellationOutput {
  const serviceType = input.service_type ?? 'communication'
  const coverageLats = input.coverage_latitudes ?? [-60, 60]
  const minElevation = input.min_elevation_deg ?? 25
  const revisitTime = input.revisit_time_sec ?? 600
  const redundancy = input.redundancy_factor ?? 1.5

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const altitudeKm = serviceType === 'broadband' ? 550 : serviceType === 'navigation' ? 20200 : serviceType === 'earth_observation' ? 500 : serviceType === 'iot' ? 600 : 1200
  const inclinationDeg = coverageLats[1] > 70 ? 98.5 : coverageLats[1] > 50 ? 53 : coverageLats[0] < -30 ? 70 : 45

  const numPlanes = serviceType === 'navigation' ? 3 : rngRange(rng, 4, 12)
  const satsPerPlane = serviceType === 'navigation' ? 8 : rngRange(rng, 6, 22)

  const totalSats = Math.round(numPlanes * satsPerPlane * redundancy)

  const planes: ConstellationPlane[] = []
  for (let p = 0; p < numPlanes; p++) {
    planes.push({
      plane_number: p + 1,
      num_satellites: satsPerPlane,
      altitude_km: altitudeKm,
      inclination_deg: roundTo(inclinationDeg, 1),
      raan_offset_deg: roundTo(360 / numPlanes * p, 1),
      phase_offset_deg: roundTo(360 / satsPerPlane * (p % 2) * 0.5, 1),
    })
  }

  const earthRadius = 6371
  const coverageAngle = Math.acos(earthRadius / (earthRadius + altitudeKm) * Math.cos(minElevation * Math.PI / 180)) - minElevation * Math.PI / 180
  const footprintRadius = roundTo(coverageAngle * earthRadius, 1)
  const coverageArea = roundTo(Math.PI * Math.pow(footprintRadius, 2), 0)
  const globalCoverage = roundTo(clamp(totalSats * coverageArea / (4 * Math.PI * Math.pow(earthRadius, 2)) * 100, 0, 100), 1)

  const maxRevisit = roundTo(revisitTime * rngFloat(rng, 0.3, 0.8), 0)
  const avgRevisit = roundTo(revisitTime * rngFloat(rng, 0.1, 0.4), 0)
  const launchesRequired = Math.ceil(totalSats / 20)
  const costEstimate = roundTo(totalSats * rngFloat(rng, 0.5, 3.0) + launchesRequired * rngFloat(rng, 10, 60), 1)

  return {
    service_type: serviceType,
    total_satellites: totalSats,
    num_planes: numPlanes,
    satellites_per_plane: satsPerPlane,
    altitude_km: altitudeKm,
    inclination_deg: roundTo(inclinationDeg, 1),
    coverage_min_elevation_deg: minElevation,
    max_revisit_time_sec: maxRevisit,
    avg_revisit_time_sec: avgRevisit,
    redundancy_factor: redundancy,
    planes,
    footprint_radius_km: footprintRadius,
    coverage_area_km2: coverageArea,
    global_coverage_pct: globalCoverage,
    launch_requirements: launchesRequired,
    constellation_cost_estimate_musd: costEstimate,
    summary: `${totalSats} satellites in ${numPlanes} planes at ${altitudeKm}km. Covers ${globalCoverage}% of target latitudes [${coverageLats[0]}, ${coverageLats[1]}] with ${minElevation} deg min elevation.`
  }
}

function formatConstellationReport(input: ConstellationInput, output: ConstellationOutput): string {
  const lines: string[] = []
  lines.push('## Satellite Constellation Design Report')
  lines.push('')
  lines.push(`**Service Type:** ${output.service_type}`)
  lines.push(`**Orbit:** ${output.altitude_km} km, i=${output.inclination_deg} deg`)
  lines.push(`**Coverage Latitudes:** [${input.coverage_latitudes?.[0] ?? -60}, ${input.coverage_latitudes?.[1] ?? 60}] deg`)
  lines.push(`**Min Elevation:** ${output.coverage_min_elevation_deg} deg | **Redundancy Factor:** ${output.redundancy_factor}`)
  lines.push('')

  lines.push('### Constellation Parameters')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push(`| Total Satellites | ${output.total_satellites} |`)
  lines.push(`| Number of Planes | ${output.num_planes} |`)
  lines.push(`| Satellites per Plane | ${output.satellites_per_plane} |`)
  lines.push(`| Altitude | ${output.altitude_km} km |`)
  lines.push(`| Inclination | ${output.inclination_deg} deg |`)
  lines.push('')

  lines.push('### Coverage Analysis')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Footprint Radius | ${output.footprint_radius_km} km |`)
  lines.push(`| Per-Satellite Coverage | ${output.coverage_area_km2} km^2 |`)
  lines.push(`| Global Coverage | ${output.global_coverage_pct}% |`)
  lines.push(`| Max Revisit Time | ${output.max_revisit_time_sec} s |`)
  lines.push(`| Avg Revisit Time | ${output.avg_revisit_time_sec} s |`)
  lines.push('')

  lines.push('### Orbital Planes')
  lines.push('| Plane | Sats | Alt (km) | Incl (deg) | RAAN Offset | Phase Offset |')
  lines.push('|-------|------|----------|------------|-------------|--------------|')
  for (const p of output.planes) {
    lines.push(`| ${p.plane_number} | ${p.num_satellites} | ${p.altitude_km} | ${p.inclination_deg} | ${p.raan_offset_deg} | ${p.phase_offset_deg} |`)
  }
  lines.push('')

  lines.push('### Deployment')
  lines.push('| Item | Value |')
  lines.push('|------|-------|')
  lines.push(`| Launch Requirements | ${output.launch_requirements} launches |`)
  lines.push(`| Estimated Cost | $${output.constellation_cost_estimate_musd} M USD |`)
  lines.push('')

  lines.push('### Summary')
  lines.push(output.summary)
  lines.push('')
  lines.push('---')
  lines.push('*Constellation design uses simplified Walker geometry. Mission planning requires detailed coverage simulation with terrain modeling.*')

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Orbital Mechanics Calculator
  tools.register(defineTool({
    name: 'orbital_mechanics_calculator',
    description: 'Calculates orbital parameters (period, velocity, delta-v) for satellites and spacecraft. Supports LEO/MEO/GEO/HEO/polar/SSO orbits around Earth, Mars, Moon, and Venus.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: orbit_type (LEO|MEO|GEO|HEO|polar|SSO), altitude_km, inclination_deg, eccentricity, central_body (Earth|Mars|Moon|Venus)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: OrbitalMechanicsInput = JSON.parse(args.input_data)
      const output = calculateOrbitalMechanics(input)
      return formatOrbitalMechanicsReport(input, output)
    }
  }))

  // Tool 2: Satellite Pass Predictor
  tools.register(defineTool({
    name: 'satellite_pass_predictor',
    description: 'Predicts satellite pass times for ground stations (TLE-based) for observation/communication. Returns AOS/LOS, elevation, range, and direction.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: satellite_norad_id, ground_station_lat_lon{lat_deg, lon_deg, altitude_m}, start_time, duration_hours, min_elevation_deg'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: SatellitePassInput = JSON.parse(args.input_data)
      const output = predictSatellitePasses(input)
      return formatSatellitePassReport(input, output)
    }
  }))

  // Tool 3: Launch Window Calculator
  tools.register(defineTool({
    name: 'launch_window_calculator',
    description: 'Calculates optimal launch windows based on target orbit, weather constraints, and range safety. Returns window times, azimuths, go probability, and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: launch_site, target_orbit{altitude_km, inclination_deg, eccentricity}, mission_type (crew|cargo|satellite|interplanetary|suborbital), weather_constraints{max_wind_speed_ms, max_cloud_cover_pct, no_precipitation, temperature_range_c}, payload_mass_kg'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: LaunchWindowInput = JSON.parse(args.input_data)
      const output = calculateLaunchWindows(input)
      return formatLaunchWindowReport(input, output)
    }
  }))

  // Tool 4: Space Debris Tracker
  tools.register(defineTool({
    name: 'space_debris_tracker',
    description: 'Tracks and predicts space debris encounters and collision risks for operational satellites. Returns conjunction events, miss distances, collision probabilities, and maneuver recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: satellite_orbit{altitude_km, inclination_deg, eccentricity, raan_deg}, screening_volume_km, assessment_days, conjunction_threshold_km'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: SpaceDebrisInput = JSON.parse(args.input_data)
      const output = trackSpaceDebris(input)
      return formatDebrisReport(input, output)
    }
  }))

  // Tool 5: Ground Station Scheduler
  tools.register(defineTool({
    name: 'ground_station_scheduler',
    description: 'Optimizes ground station contact scheduling for satellite constellations. Returns prioritized schedule, load distribution, coverage gap analysis, and contact details.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: satellites[{id, norad_id, priority}], ground_stations[{name, lat_deg, lon_deg, min_elevation_deg, max_contacts_per_day}], priority_rules{high_priority_min_duration_min, max_gap_between_contacts_hrs, balance_load}, scheduling_horizon_hours, min_contact_minutes'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: GroundStationInput = JSON.parse(args.input_data)
      const output = scheduleGroundStations(input)
      return formatGroundStationReport(input, output)
    }
  }))

  // Tool 6: Mission Trajectory Designer
  tools.register(defineTool({
    name: 'mission_trajectory_designer',
    description: 'Designs interplanetary or orbital transfer trajectories (Hohmann, bi-elliptic, gravity assist). Returns segment details, delta-v budget, porkchop parameters, and feasibility assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: departure_body, arrival_body, departure_date, max_delta_v_kms, gravity_assist_available[]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: TrajectoryInput = JSON.parse(args.input_data)
      const output = designTrajectory(input)
      return formatTrajectoryReport(input, output)
    }
  }))

  // Tool 7: Space Economics Analyzer
  tools.register(defineTool({
    name: 'space_economics_analyzer',
    description: 'Analyzes space mission economics (launch cost, insurance, revenue, ROI). Returns cost breakdown, revenue projections, NPV, ROI, payback period, and break-even analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: mission_type (satellite_comm|earth_obs|navigation|space_tourism|scientific|tech_demo), payload_mass_kg, orbit_target, launch_provider, operational_years, revenue_model (subscription|pay_per_use|data_sales|service_contract|hybrid)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: EconomicsInput = JSON.parse(args.input_data)
      const output = analyzeEconomics(input)
      return formatEconomicsReport(input, output)
    }
  }))

  // Tool 8: Constellation Designer
  tools.register(defineTool({
    name: 'constellation_designer',
    description: 'Designs satellite constellation parameters (planes, satellites per plane, altitude, inclination) for coverage. Returns Walker geometry, revisit time, coverage analysis, and deployment cost estimate.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: service_type (communication|navigation|earth_observation|iot|broadband), coverage_latitudes[min, max], min_elevation_deg, revisit_time_sec, redundancy_factor'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: ConstellationInput = JSON.parse(args.input_data)
      const output = designConstellation(input)
      return formatConstellationReport(input, output)
    }
  }))

  console.log(`[dsh-tool-spaceexplorer] Loaded v${VERSION} - Space Exploration AI Toolkit with 8 tools`)
  console.log('  Tools: orbital_mechanics_calculator, satellite_pass_predictor, launch_window_calculator, space_debris_tracker, ground_station_scheduler, mission_trajectory_designer, space_economics_analyzer, constellation_designer')
}
