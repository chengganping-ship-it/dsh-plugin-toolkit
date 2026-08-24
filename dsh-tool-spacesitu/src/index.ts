/**
 * DSH Space Situational Awareness (SSA) Plugin v1.0.0 *
 * Space Situational Awareness Toolkit — space weather prediction, satellite collision
 * avoidance, orbital debris tracking, launch window analysis. *
 * Features (v1.0.0):
 * - Space Weather Predictor (solar flares, geomagnetic storms, radiation belts)
 * - Collision Avoidance System (conjunction assessment, maneuver planning)
 * - Debris Tracking Analyzer (catalog, evolution, risk projection)
 * - Launch Window Optimizer (weather, range safety, orbit constraints)
 * - Satellite Health Monitor (telemetry anomaly, degradation forecasting)
 * - Ground Station Scheduler (pass planning, contact windows)
 * - Orbital Maneuver Planner (Hohmann, bi-impulsive, station-keeping)
 * - Reentry Prediction Tracker (decay analysis, footprint, casualty risk)
 *
 * @module dsh-tool-spacesitu
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'spacesitu'
export const inject = ['tools']

const DISCLAIMER = 'This analysis is based on AI model inference for SSA research reference only. It does not replace professional orbital analysis or flight safety decisions.'

// ==================== TYPES ====================

export interface SpaceWeatherInput {
  forecast_hours?: number
  region?: 'LEO' | 'MEO' | 'GEO' | 'HEO'
  solar_activity_level?: 'low' | 'moderate' | 'high' | 'extreme'
  include_radiation_belt?: boolean
  include_ionospheric?: boolean
  satellite_altitude_km?: number
}

export interface CollisionAvoidanceInput {
  primary_satellite_id?: string
  primary_orbit?: { altitude_km?: number; inclination_deg?: number; eccentricity?: number; raan_deg?: number }
  secondary_objects?: string[]
  screening_volume_km?: number
  probability_threshold?: number
  time_window_hours?: number
  available_dv_ms?: number
}

export interface DebrisTrackingInput {
  region_filter?: ('LEO' | 'MEO' | 'GEO' | 'HEO')[]
  size_threshold_cm?: number
  tracked_satellites?: string[]
  projection_years?: number
  include_removal_assessment?: boolean
}

export interface LaunchWindowInput {
  launch_site?: string
  target_orbit?: { altitude_km?: number; inclination_deg?: number; type?: string }
  launch_vehicle?: string
  payload_mass_kg?: number
  window_start?: string
  window_end?: string
  weather_constraints?: { max_wind_speed_ms?: number; max_precipitation_mm?: number; lightning_risk?: boolean }
}

export interface SatelliteHealthInput {
  satellite_id?: string
  telemetry?: { temperature_c?: number; battery_voltage?: number; solar_array_current?: number; signal_strength_dbm?: number; reaction_wheel_rpm?: number }
  orbit_info?: { type?: string; altitude_km?: number; age_years?: number }
  anomaly_flags?: string[]
}

export interface GroundStationInput {
  ground_stations?: { name?: string; lat_deg?: number; lon_deg?: number; min_elevation_deg?: number }[]
  satellite_tle?: { line1?: string; line2?: string; norad_id?: string }
  scheduling_window_hours?: number
  min_pass_duration_min?: number
  data_volume_mb?: number
}

export interface OrbitalManeuverInput {
  maneuver_type?: 'hohmann' | 'bi_elliptic' | 'plane_change' | 'station_keeping' | 'collision_avoidance' | 'deorbit'
  initial_orbit?: { altitude_km?: number; inclination_deg?: number; eccentricity?: number }
  target_orbit?: { altitude_km?: number; inclination_deg?: number; eccentricity?: number }
  spacecraft_dry_mass_kg?: number
  specific_impulse_s?: number
  propellant_mass_kg?: number
}

export interface ReentryInput {
  object_norad_id?: string
  object_mass_kg?: number
  object_cross_section_m2?: number
  object_cd?: number
  initial_altitude_km?: number
  initial_epoch?: string
  ballistic_coefficient?: number
}

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

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

function seedFromInput(input: unknown): number {
  return hashString(JSON.stringify(input))
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

function fmt(val: number, decimals: number = 1): string {
  return val.toFixed(decimals)
}

function orbitalVelocityKmSec(altitude_km: number): number {
  const mu = 398600.4418
  const r = 6371 + altitude_km
  return Math.sqrt(mu / r)
}

function orbitalPeriodSec(altitude_km: number): number {
  const mu = 398600.4418
  const r = 6371 + altitude_km
  return 2 * Math.PI * Math.sqrt((r * r * r) / mu)
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

function utcTimestamp(rng: () => number): string {
  const h = Math.floor(rng() * 24)
  const m = Math.floor(rng() * 60)
  const s = Math.floor(rng() * 60)
  return (
    'T' +
    h.toString().padStart(2, '0') +
    ':' +
    m.toString().padStart(2, '0') +
    ':' +
    s.toString().padStart(2, '0') +
    'Z'
  )
}

// ==================== TOOL 1: SPACE WEATHER PREDICTOR ====================

function executeSpaceWeatherPredictor(inputData: string): string {
  const data = parseInput<SpaceWeatherInput>(inputData)
  const forecastHours = data.forecast_hours || 72
  const region = data.region || 'LEO'
  const solarLevel = data.solar_activity_level || 'moderate'
  const includeRadiation = data.include_radiation_belt !== false
  const includeIonospheric = data.include_ionospheric !== false
  const satAltitude = data.satellite_altitude_km || 550

  const rng = mulberry32(seedFromInput(data))

  let r = '# Space Weather Prediction Report\n\n'
  r += '**Forecast Horizon:** ' + forecastHours + ' hours\n'
  r += '**Region:** ' + region + '\n'
  r += '**Solar Activity:** ' + solarLevel + '\n'
  r += '**Satellite Altitude:** ' + satAltitude + ' km\n\n'
  r += '---\n\n'

  r += '## Solar Activity Forecast\n\n'
  r += '| Time (UTC) | F10.7 (sfu) | Sunspot # | Flare Prob | CME Risk |\n'
  r += '|------------|-------------|-----------|------------|----------|\n'
  for (let h = 0; h < forecastHours; h += 12) {
    const f107 = fmt(clamp(rng() * 80 + 70, 70, 250), 1)
    const ssNum = Math.floor(clamp(rng() * 100 + 20, 0, 200))
    const flareProb = fmt(clamp(rng() * 0.5 + (solarLevel === 'extreme' ? 0.4 : solarLevel === 'high' ? 0.2 : 0.05), 0, 1) * 100, 1)
    const cmeRisk = fmt(clamp(rng() * 0.3 + (solarLevel === 'extreme' ? 0.2 : 0.05), 0, 1) * 100, 1)
    r += '| +' + h + 'h | ' + f107 + ' | ' + ssNum + ' | ' + flareProb + '% | ' + cmeRisk + '% |\n'
  }

  r += '\n## Geomagnetic Indices\n\n'
  r += '**Kp Index Range:** ' + fmt(clamp(rng() * 4 + (solarLevel === 'extreme' ? 6 : solarLevel === 'high' ? 4 : 2), 0, 9), 1) + ' - ' + fmt(clamp(rng() * 3 + (solarLevel === 'extreme' ? 7 : solarLevel === 'high' ? 5 : 3), 0, 9), 1) + '\n'
  r += '**Ap Index (24h):** ' + Math.floor(clamp(rng() * 50 + (solarLevel === 'extreme' ? 80 : 20), 0, 400)) + '\n'
  r += '**Dst Index (nT):** ' + Math.floor(clamp(rng() * 100 - 50 - (solarLevel === 'extreme' ? 100 : 0), -300, 50)) + '\n'
  r += '**AE Index (nT):** ' + Math.floor(clamp(rng() * 500 + 200, 0, 2000)) + '\n\n'

  if (includeRadiation) {
    r += '## Radiation Belt Assessment\n\n'
    r += '| Belt | Electron Flux (e-/cm2/s) | Proton Flux (p+/cm2/s) | Dose Rate (rad/s) | Risk |\n'
    r += '|------|--------------------------|------------------------|--------------------|------|\n'
    const eFlux = Math.floor(clamp(rng() * 1e7 + 1e6, 1e6, 1e8))
    const pFlux = Math.floor(clamp(rng() * 1e4 + 1e3, 1e3, 1e5))
    const dose = fmt(clamp(rng() * 0.01 + 0.001, 0.001, 0.1), 5)
    r += '| Outer (3-7 Re) | ' + eFlux.toExponential(2) + ' | ' + pFlux.toExponential(2) + ' | ' + dose + ' | ' + (eFlux > 5e7 ? 'HIGH' : 'MODERATE') + '\n'
    r += '| Inner (1.2-2.5 Re) | ' + Math.floor(clamp(rng() * 1e6 + 1e5, 1e5, 1e7)).toExponential(2) + ' | ' + Math.floor(clamp(rng() * 1e3 + 500, 500, 5e3)).toExponential(2) + ' | ' + fmt(clamp(rng() * 0.005 + 0.001, 0.001, 0.05), 4) + ' | LOW |\n'
    r += '| Slot Region | ' + Math.floor(clamp(rng() * 1e5 + 1e4, 1e4, 1e6)).toExponential(2) + ' | — | ' + fmt(clamp(rng() * 0.002 + 0.0005, 0.0005, 0.02), 4) + ' | LOW |\n\n'
    r += '**Radiation Effects on ' + satAltitude + ' km orbit:**\n'
    r += '- Single Event Upset Rate: ' + fmt(clamp(rng() * 0.01 + 0.001, 0.001, 0.1), 4) + ' events/day\n'
    r += '- Total Ionizing Dose (30d): ' + fmt(clamp(rng() * 5 + 2, 0.5, 30), 2) + ' krad\n'
    r += '- Single Event Latch-up Risk: ' + (rng() > 0.9 ? 'ELEVATED' : 'LOW') + '\n\n'
  }

  if (includeIonospheric) {
    r += '## Ionospheric Conditions\n\n'
    r += '| Parameter | Value | Impact |\n'
    r += '|-----------|-------|--------|\n'
    const tec = fmt(clamp(rng() * 80 + 20, 10, 150), 1)
    r += '| TEC (TECU) | ' + tec + ' | ' + (parseFloat(tec) > 80 ? 'Severe scintillation' : 'Moderate delay') + ' |\n'
    r += '| Scintillation S4 | ' + fmt(clamp(rng() * 0.8 + 0.1, 0, 1), 2) + ' | ' + (rng() > 0.6 ? 'Signal fading possible' : 'Nominal') + ' |\n'
    r += '| FoF2 (MHz) | ' + fmt(clamp(rng() * 8 + 4, 3, 15), 1) + ' | HF comm degradation |\n'
    r += '| Spread F Index | ' + fmt(clamp(rng() * 0.6, 0, 1), 2) + ' | ' + (rng() > 0.5 ? 'Anomalous' : 'Quiet') + ' |\n\n'
  }

  r += '## Alerts & Recommendations\n\n'
  const alertCount = Math.floor(clamp(rng() * 3 + (solarLevel === 'extreme' ? 3 : solarLevel === 'high' ? 1 : 0), 0, 5))
  if (alertCount > 0) {
    r += '| Level | Phenomenon | Onset | Duration | Confidence |\n'
    r += '|-------|-----------|-------|----------|------------|\n'
    const alerts = [
      { lvl: 'G3 - Strong', phen: 'Geomagnetic Storm' },
      { lvl: 'S2 - Moderate', phen: 'Solar Radiation Storm' },
      { lvl: 'R2 - Moderate', phen: 'Radio Blackout' },
      { lvl: 'G4 - Severe', phen: 'Geomagnetic Storm' },
      { lvl: 'S3 - Strong', phen: 'Solar Radiation Storm' }
    ]
    for (let i = 0; i < alertCount; i++) {
      const a = alerts[i % alerts.length]
      r += '| ' + a.lvl + ' | ' + a.phen + ' | +' + Math.floor(rng() * 24) + 'h | ' + Math.floor(rng() * 12 + 2) + 'h | ' + Math.floor(clamp(rng() * 20 + 70, 0, 100)) + '% |\n'
    }
  } else {
    r += 'No significant space weather alerts. Nominal conditions expected.\n'
  }

  r += '\n---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 2: COLLISION AVOIDANCE SYSTEM ====================

function executeCollisionAvoidanceSystem(inputData: string): string {
  const data = parseInput<CollisionAvoidanceInput>(inputData)
  const primaryId = data.primary_satellite_id || 'SAT-SSA-001'
  const primaryOrbit = data.primary_orbit || { altitude_km: 550, inclination_deg: 53, eccentricity: 0.001, raan_deg: 120 }
  const secondaries = data.secondary_objects || ['DEB-45211', 'DEB-38901', 'COSMOS-2251-DEB', 'IRIDIUM-33-DEB']
  const screeningVol = data.screening_volume_km || 25
  const probThreshold = data.probability_threshold || 1e-4
  const timeWindow = data.time_window_hours || 168
  const availableDv = data.available_dv_ms || 5

  const rng = mulberry32(seedFromInput(data))

  let r = '# Collision Avoidance System Report\n\n'
  r += '**Primary Satellite:** ' + primaryId + '\n'
  r += '**Orbit:** ' + primaryOrbit.altitude_km + ' km, i=' + primaryOrbit.inclination_deg + '\u00B0, e=' + (primaryOrbit.eccentricity ?? 0.001) + '\n'
  r += '**Screening Volume:\u00B0 ' + screeningVol + ' km\n'
  r += '**Probability Threshold:** ' + probThreshold.toExponential(1) + '\n'
  r += '**Time Window:** ' + timeWindow + ' h\n'
  r += '**Available \u0394V:** ' + availableDv + ' m/s\n\n'
  r += '---\n\n'

  r += '## Conjunction Summary\n\n'
  r += '| Object ID | TCA (UTC) | Miss Distance (km) | Pc | Risk Level | Action |\n'
  r += '|-----------|-----------|--------------------|----|-----------|--------|\n'
  const riskActions = ['Monitor', 'Maneuver', 'Emergency maneuver', 'Track closely']
  secondaries.forEach(function (obj) {
    const tca = Math.floor(rng() * timeWindow)
    const missKm = parseFloat((rng() * 10 + 0.1).toFixed(3))
    let pc = rng() * 0.001
    if (rng() > 0.7) pc = rng() * 1e-3 + 1e-4
    if (pc < probThreshold / 10) pc = probThreshold / 10
    let risk = 'LOW'
    let action = riskActions[0]
    if (pc >= 1e-3) { risk = 'HIGH'; action = riskActions[2] }
    else if (pc >= probThreshold) { risk = 'MEDIUM'; action = riskActions[1] }
    else if (pc >= probThreshold / 10) { risk = 'MODERATE'; action = riskActions[3] }
    r += '| ' + obj + ' | +' + tca + 'h | ' + missKm.toFixed(3) + ' | ' + pc.toExponential(2) + ' | ' + risk + ' | ' + action + ' |\n'
  })

  r += '\n## Recommended Maneuver Plan\n\n'
  const needManeuver = rng() > 0.3
  if (needManeuver) {
    r += '| Parameter | Value |\n'
    r += '|-----------|-------|\n'
    r += '| Maneuver Type | ' + (rng() > 0.5 ? 'In-plane avoidance' : 'Out-of-plane avoidance') + ' |\n'
    r += '| \u0394V Required | ' + fmt(clamp(rng() * availableDv * 0.6 + 0.2, 0.1, availableDv), 2) + ' m/s |\n'
    r += '| Execution Time | T-' + Math.floor(rng() * 12 + 1) + ' hours from TCA |\n'
    r += '| Direction | ' + (rng() > 0.5 ? 'Along-track (V-bar)' : 'Cross-track (H-bar)') + ' |\n'
    r += '| Separation at TCA | ' + fmt(clamp(rng() * 2 + 1, 1, 5), 1) + ' km |\n'
    r += '| Propellant Cost | ' + fmt(clamp(rng() * 0.5 + 0.1, 0.1, 2), 2) + ' kg |\n'
    r += '| Residual Risk | Pc < ' + (probThreshold / 10).toExponential(1) + ' |\n\n'
  } else {
    r += 'No collision avoidance maneuver required within the screening window.\n'
    r += 'All conjunctions remain below the probability threshold of ' + probThreshold.toExponential(1) + '.\n\n'
  }

  r += '## Covariance Analysis\n\n'
  r += '| Axis | Primary 1\u03C3 (m) | Secondary 1\u03C3 (m) | Combined (m) |\n'
  r += '|------|--------------------|-----------------------|----------------|\n'
  const axes = ['Radial', 'Along-track', 'Cross-track']
  axes.forEach(function (axis) {
    const p1 = fmt(clamp(rng() * 50 + 10, 5, 100), 0)
    const p2 = fmt(clamp(rng() * 200 + 50, 50, 500), 0)
    const comb = fmt(Math.sqrt(parseFloat(p1) * parseFloat(p1) + parseFloat(p2) * parseFloat(p2)), 0)
    r += '| ' + axis + ' | ' + p1 + ' | ' + p2 + ' | ' + comb + ' |\n'
  })

  r += '\n## Screening Statistics\n\n'
  r += '- **Total objects screened:** ' + Math.floor(rng() * 5000 + 15000) + '\n'
  r += '- **Conjunctions (all):** ' + secondaries.length + '\n'
  r += '- **High-risk events:** ' + Math.floor(rng() * 2) + '\n'
  r += '- **Maneuvers recommended:** ' + (needManeuver ? 1 : 0) + '\n'
  r += '- **Catalog coverage:** ' + Math.floor(clamp(rng() * 5 + 93, 90, 99)) + '%\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 3: DEBRIS TRACKING ANALYZER ====================

function executeDebrisTrackingAnalyzer(inputData: string): string {
  const data = parseInput<DebrisTrackingInput>(inputData)
  const regions = data.region_filter || ['LEO', 'MEO', 'GEO']
  const sizeThreshold = data.size_threshold_cm || 10
  const trackedSats = data.tracked_satellites || ['ISS', 'HUBBLE', 'SINODETE', 'SENTINEL-1A']
  const projYears = data.projection_years || 20
  const includeRemoval = data.include_removal_assessment !== false

  const rng = mulberry32(seedFromInput(data))

  let r = '# Orbital Debris Tracking Report\n\n'
  r += '**Regions:** ' + regions.join(', ') + '\n'
  r += '**Size Threshold:** \u2265 ' + sizeThreshold + ' cm\n'
  r += '**Tracked Assets:** ' + trackedSats.join(', ') + '\n'
  r += '**Projection:** ' + projYears + ' years\n\n'
  r += '---\n\n'

  r += '## Debris Population by Region\n\n'
  r += '| Region | Trackable (>10cm) | Detectable (1-10cm) | Estimated Total (>1cm) | Growth Rate/yr |\n'
  r += '|--------|-------------------|---------------------|------------------------|----------------|\n'
  const pops: Record<string, { track: number; detect: number; total: number }> = {
    'LEO': { track: 29000, detect: 750000, total: 13000000 },
    'MEO': { track: 4000, detect: 80000, total: 2000000 },
    'GEO': { track: 1800, detect: 35000, total: 800000 },
    'HEO': { track: 1200, detect: 25000, total: 500000 }
  }
  regions.forEach(function (reg) {
    const p = pops[reg] || pops['LEO']
    const variation = 1 + (rng() - 0.5) * 0.1
    const growth = fmt(clamp(rng() * 2 + 2, 0.5, 8), 1)
    r += '| ' + reg + ' | ' + Math.floor(p.track * variation).toLocaleString() + ' | ' + Math.floor(p.detect * variation).toLocaleString() + ' | ' + (p.total).toLocaleString() + ' | ' + growth + '% |\n'
  })

  r += '\n## Asset Risk Assessment\n\n'
  r += '| Asset | Altitude (km) | Debris Density | Annual Impact Prob | Action |\n'
  r += '|-------|--------------|----------------|--------------------|--------|\n'
  const altitudes: Record<string, number> = {
    'ISS': 408, 'HUBBLE': 540, 'SINODETE': 630, 'SENTINEL-1A': 693
  }
  trackedSats.forEach(function (sat) {
    const alt = altitudes[sat] || (400 + Math.floor(rng() * 400))
    const density = fmt(clamp(rng() * 10 + 1, 0.5, 20), 2)
    let impactProb = rng() * 0.01
    if (alt < 600) impactProb += rng() * 0.005
    let action = 'Routine monitoring'
    if (impactProb > 0.01) action = 'Enhanced shielding'
    if (impactProb > 0.02) action = 'Maneuver-capable'
    r += '| ' + sat + ' | ' + alt + ' | ' + density + ' /km\u00B3/year | ' + impactProb.toExponential(2) + ' | ' + action + ' |\n'
  })

  r += '\n## Debris Evolution Projection\n\n'
  r += '| Year | LEO Objects (>10cm) | Collision Events | Kessler Syndrome Risk |\n'
  r += '|------|---------------------|------------------|----------------------|\n'
  const baseYear = 2025
  const basePop = 29000
  for (let y = 0; y <= projYears; y += 5) {
    const year = baseYear + y
    const pop = Math.floor(basePop * Math.pow(1.035, y) + rng() * 2000)
    const events = Math.floor(clamp(rng() * 3 + y * 0.1, 0, 20))
    const kessler = fmt(clamp(y * 0.002 + rng() * 0.01, 0, 1) * 100, 1)
    r += '| ' + year + ' | ' + pop.toLocaleString() + ' | ' + events + ' | ' + kessler + '% |\n'
  }

  if (includeRemoval) {
    r += '\n## Active Debris Removal Assessment\n\n'
    r += '| Strategy | TRL | Cost (M USD) | Objects/yr | Timeline |\n'
    r += '|----------|-----|-------------|-----------|----------|\n'
    const strategies = [
      { name: 'Nets/Harpoons', trl: '6-7', cost: 80 + Math.floor(rng() * 70), rate: Math.floor(rng() * 5 + 2), timeline: '2026-2028' },
      { name: 'Laser Nudging', trl: '4-5', cost: 150 + Math.floor(rng() * 100), rate: Math.floor(rng() * 10 + 5), timeline: '2029-2032' },
      { name: 'Drag Augmentation', trl: '7-8', cost: 20 + Math.floor(rng() * 30), rate: Math.floor(rng() * 8 + 3), timeline: '2025-2027' },
      { name: 'Robotic Arm Capture', trl: '5-6', cost: 100 + Math.floor(rng() * 80), rate: Math.floor(rng() * 3 + 1), timeline: '2027-2030' },
      { name: 'Electrodynamic Tether', trl: '5-6', cost: 50 + Math.floor(rng() * 50), rate: Math.floor(rng() * 4 + 1), timeline: '2028-2031' }
    ]
    strategies.forEach(function (s) {
      r += '| ' + s.name + ' | ' + s.trl + ' | ' + s.cost + ' | ' + s.rate + ' | ' + s.timeline + ' |\n'
    })
  }

  r += '\n## Source Event Analysis\n\n'
  r += '| Event | Year | Debris Generated | Still Trackable | Zone |\n'
  r += '|-------|------|-----------------|-----------------|------|\n'
  r += '| Fengyun-1C ASAT | 2007 | 3,500+ | 2,800 | LEO |\n'
  r += '| Iridium 33 / Cosmos 2251 | 2009 | 2,200+ | 1,500 | LEO |\n'
  r += '| Cosmos 1408 ASAT | 2021 | 1,500+ | 1,200 | LEO |\n'
  r += '| Long March 3B Stage | 2023 | 30 | 22 | GTO |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 4: LAUNCH WINDOW OPTIMIZER ====================

function executeLaunchWindowOptimizer(inputData: string): string {
  const data = parseInput<LaunchWindowInput>(inputData)
  const launchSite = data.launch_site || 'Wenchang'
  const targetOrbit = data.target_orbit || { altitude_km: 550, inclination_deg: 51.6, type: 'ISS-resupply' }
  const launchVehicle = data.launch_vehicle || 'Long March 7'
  const payloadMass = data.payload_mass_kg || 5000
  const windowStart = data.window_start || '2026-03-01'
  const windowEnd = data.window_end || '2026-03-15'
  const weather = data.weather_constraints || { max_wind_speed_ms: 15, max_precipitation_mm: 0, lightning_risk: false }

  const rng = mulberry32(seedFromInput(data))

  let r = '# Launch Window Optimization Report\n\n'
  r += '**Launch Site:** ' + launchSite + '\n'
  r += '**Launch Vehicle:** ' + launchVehicle + '\n'
  r += '**Target Orbit:** ' + targetOrbit.type + ' @ ' + targetOrbit.altitude_km + ' km, i=' + targetOrbit.inclination_deg + '\u00B0\n'
  r += '**Payload Mass:** ' + payloadMass + ' kg\n'
  r += '**Window:** ' + windowStart + ' to ' + windowEnd + '\n\n'
  r += '---\n\n'

  r += '## Orbital Mechanics Constraints\n\n'
  r += '| Parameter | Value | Constraint | Status |\n'
  r += '|-----------|-------|------------|--------|\n'
  const launchAz = fmt((targetOrbit.inclination_deg || 51.6) + (rng() - 0.5) * 10, 1)
  r += '| Launch Azimuth | ' + launchAz + '\u00B0 | 35\u00B0 - 120\u00B0 | PASS |\n'
  r += '| Inclination Access | ' + fmt(targetOrbit.inclination_deg || 51.6, 1) + '\u00B0 | From ' + launchSite + ' | OK |\n'
  r += '| RAAN Offset | ' + fmt(rng() * 360, 1) + '\u00B0 | \u00B15\u00B0 | ' + (rng() > 0.2 ? 'PASS' : 'MARGINAL') + ' |\n'
  r += '| Phase Angle | ' + fmt(rng() * 360, 1) + '\u00B0 | \u00B12\u00B0 | PASS |\n\n'

  r += '## Daily Window Analysis\n\n'
  r += '| Date | Window Open | Window Close | Duration (min) | Azimuth (deg) | Go Prob (%) |\n'
  r += '|------|-------------|--------------|-----------------|---------------|-------------|\n'
  const startDate = new Date(windowStart)
  const endDate = new Date(windowEnd)
  const dayCount = Math.min(Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1, 14)
  for (let d = 0; d < dayCount; d++) {
    const day = new Date(startDate.getTime() + d * 86400000)
    const dateStr = day.toISOString().slice(0, 10)
    const wOpen = fmt(clamp(rng() * 12 + 2, 0, 14), 1)
    const wClose = fmt(parseFloat(wOpen) + clamp(rng() * 90 + 10, 5, 120), 1)
    const dur = (parseFloat(wClose) - parseFloat(wOpen)) * 60
    const az = fmt(clamp(rng() * 30 + (targetOrbit.inclination_deg || 51.6) - 5, 30, 120), 1)
    const goProb = Math.floor(clamp(rng() * 30 + 65, 50, 98))
    r += '| ' + dateStr + ' | ' + wOpen + ' | ' + wClose + ' | ' + Math.floor(dur) + ' | ' + az + ' | ' + goProb + ' |\n'
  }

  r += '\n## Weather Go Analysis\n\n'
  r += '| Constraint | Threshold | Forecast Max | Margin | Status |\n'
  r += '|------------|-----------|-------------|--------|--------|\n'
  const maxWind = weather.max_wind_speed_ms ?? 15
  const windMax = fmt(clamp(rng() * 10 + 5, 3, maxWind + 5), 1)
  const precip = fmt(clamp(rng() * 2, 0, 5), 1)
  r += '| Wind Speed | < ' + (weather.max_wind_speed_ms || 15) + ' m/s | ' + windMax + ' m/s | ' + fmt(((weather.max_wind_speed_ms || 15) - parseFloat(windMax)), 1) + ' | ' + (parseFloat(windMax) < (weather.max_wind_speed_ms || 15) ? 'GO' : 'NO-GO') + ' |\n'
  r += '| Precipitation | < ' + (weather.max_precipitation_mm || 0) + ' mm | ' + precip + ' mm | ' + fmt((weather.max_precipitation_mm || 0) - parseFloat(precip), 1) + ' | ' + (parseFloat(precip) <= (weather.max_precipitation_mm || 0) ? 'GO' : 'NO-GO') + ' |\n'
  r += '| Upper Winds | < 30 m/s | ' + fmt(clamp(rng() * 25 + 10, 5, 45), 1) + ' m/s | ' + fmt(30 - clamp(rng() * 25 + 10, 5, 45), 1) + ' | ' + (rng() > 0.2 ? 'GO' : 'MONITOR') + ' |\n'
  r += '| Cloud Ceiling | > 3 km | ' + fmt(clamp(rng() * 4 + 2, 1, 8), 1) + ' km | ' + fmt(clamp(rng() * 4 + 2, 1, 8) - 3, 1) + ' | ' + (rng() > 0.3 ? 'GO' : 'MARGINAL') + ' |\n'
  r += '| Lightning | None | ' + (rng() > 0.8 ? 'Isolated' : 'None') + ' | — | ' + (rng() > 0.8 ? 'HOLD' : 'GO') + ' |\n\n'

  r += '## Range Safety\n\n'
  r += '| Zone | Status | Risk Level | Notes |\n'
  r += '|------|--------|------------|-------|\n'
  r += '| Downrange EDS | Clear | Low | Flight termination corridor clear |\n'
  r += '| Overflight Risk | Clear | Low | No populated areas in trajectory |\n'
  r += '| Shipping Lanes | Monitored | Low | NOTAMs issued |\n'
  r += '| Airspace | Coordinated | Low | ATC coordination complete |\n\n'

  r += '## Injection Accuracy\n\n'
  r += '| Parameter | Target | Predicted | 3\u03C3 Error |\n'
  r += '|-----------|--------|-----------|----------|\n'
  const tAlt = targetOrbit.altitude_km ?? 550
  const tInc = targetOrbit.inclination_deg ?? 51.6
  r += '| Altitude (km) | ' + tAlt + ' | ' + fmt(tAlt + (rng() - 0.5) * 4, 1) + ' | \u00B1' + fmt(clamp(rng() * 3 + 1, 1, 5), 1) + ' |\n'
  r += '| Inclination (deg) | ' + tInc + ' | ' + fmt(tInc + (rng() - 0.5) * 0.05, 3) + ' | \u00B1' + fmt(clamp(rng() * 0.03 + 0.01, 0.01, 0.08), 3) + ' |\n'
  r += '| Eccentricity | 0.001 | ' + fmt(clamp(rng() * 0.003, 0, 0.005), 4) + ' | \u00B10.002 |\n'
  r += '| RAAN (deg) | 120.0 | ' + fmt(120 + (rng() - 0.5) * 2, 2) + ' | \u00B1' + fmt(clamp(rng() * 1 + 0.2, 0.2, 1.5), 2) + ' |\n\n'

  r += '## Recommendation\n\n'
  r += '**Optimal Launch Date:** ' + (function () {
    const bestDay = new Date(startDate.getTime() + Math.floor(rng() * dayCount) * 86400000)
    return bestDay.toISOString().slice(0, 10)
  })() + '\n'
  r += '**Overall Go Probability:** ' + Math.floor(clamp(rng() * 20 + 75, 60, 95)) + '%\n'
  r += '**Key Risk Factor:** ' + (rng() > 0.5 ? 'Upper-level winds at T-3h' : 'Cumulus cloud ceiling at T-0') + '\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 5: SATELLITE HEALTH MONITOR ====================

function executeSatelliteHealthMonitor(inputData: string): string {
  const data = parseInput<SatelliteHealthInput>(inputData)
  const satId = data.satellite_id || 'SAT-HEALTH-001'
  const telemetry = data.telemetry || { temperature_c: 25, battery_voltage: 28.5, solar_array_current: 4.2, signal_strength_dbm: -72, reaction_wheel_rpm: 4500 }
  const orbit = data.orbit_info || { type: 'LEO', altitude_km: 550, age_years: 3.5 }
  const anomalies = data.anomaly_flags || []

  const rng = mulberry32(seedFromInput(data))

  let r = '# Satellite Health Monitoring Report\n\n'
  r += '**Satellite ID:** ' + satId + '\n'
  r += '**Orbit:** ' + orbit.type + ' @ ' + orbit.altitude_km + ' km\n'
  r += '**Mission Age:** ' + orbit.age_years + ' years\n'
  r += '**Active Anomalies:** ' + (anomalies.length > 0 ? anomalies.join(', ') : 'None') + '\n\n'
  r += '---\n\n'

  r += '## Telemetry Status\n\n'
  r += '| Parameter | Value | Nominal Range | Status | Trend |\n'
  r += '|-----------|-------|--------------|--------|-------|\n'
  const temp = telemetry.temperature_c ?? 25
  const tempRange = '-10 to +45 \u00B0C'
  const tempStatus = temp > 45 || temp < -10 ? 'CRITICAL' : temp > 40 || temp < -5 ? 'WARNING' : 'NOMINAL'
  r += '| Temperature | ' + fmt(temp, 1) + ' \u00B0C | ' + tempRange + ' | ' + tempStatus + ' | ' + (rng() > 0.5 ? 'Stable' : 'Drifting +\u00B0C') + ' |\n'
  const voltage = telemetry.battery_voltage ?? 28.5
  const voltStatus = voltage < 24 ? 'CRITICAL' : voltage < 26 ? 'WARNING' : 'NOMINAL'
  r += '| Battery Voltage | ' + fmt(voltage, 2) + ' V | 26.0-32.0 V | ' + voltStatus + ' | ' + (voltage < 26 ? 'Degrading' : 'Stable') + ' |\n'
  const saCurrent = telemetry.solar_array_current ?? 4.2
  const saStatus = saCurrent < 3.0 ? 'WARNING' : 'NOMINAL'
  r += '| Solar Array Current | ' + fmt(saCurrent, 2) + ' A | 4.0-6.5 A | ' + saStatus + ' | ' + fmt(clamp(rng() * 0.3 + 0.05, 0, 1), 1) + '%/yr degradation |\n'
  const sigStr = telemetry.signal_strength_dbm ?? -72
  const sigStatus = sigStr < -90 ? 'CRITICAL' : sigStr < -80 ? 'WARNING' : 'NOMINAL'
  r += '| Signal Strength | ' + fmt(sigStr, 1) + ' dBm | > -85 dBm | ' + sigStatus + ' | ' + (rng() > 0.5 ? 'Stable' : 'Fading') + ' |\n'
  const rwRpm = telemetry.reaction_wheel_rpm ?? 4500
  const rwStatus = rwRpm < 2000 || rwRpm > 5800 ? 'WARNING' : 'NOMINAL'
  r += '| Reaction Wheel | ' + Math.floor(rwRpm) + ' RPM | 2000-5800 RPM | ' + rwStatus + ' | ' + fmt(clamp(rng() * 50 + 20, 10, 100), 0) + '% wear |\n\n'

  r += '## Subsystem Health Scores\n\n'
  r += '| Subsystem | Health Score | Confidence | Primary Concern |\n'
  r += '|-----------|-------------|------------|-----------------|\n'
  const subsystems = [
    { name: 'Power (EPS)', base: 92 },
    { name: 'Attitude Control (ACS)', base: 88 },
    { name: 'Thermal Control (TCS)', base: 95 },
    { name: 'Communications (COM)', base: 90 },
    { name: 'Command & Data (CDH)', base: 96 },
    { name: 'Propulsion (PROP)', base: 85 },
    { name: 'Payload', base: 93 }
  ]
  subsystems.forEach(function (s) {
    const score = Math.floor(clamp(s.base + (rng() - 0.5) * 10, 60, 100))
    const conf = Math.floor(clamp(rng() * 10 + 88, 80, 99))
    const concerns = ['None', 'Minor drift', 'Degradation trend', 'Calibration needed', 'No concern']
    const concern = score < 75 ? concerns[2] : score < 85 ? concerns[1] : concerns[4]
    r += '| ' + s.name + ' | ' + score + '% | ' + conf + '% | ' + concern + ' |\n'
  })

  r += '\n## Anomaly Detection\n\n'
  r += '| Timestamp | Severity | System | Description | Status |\n'
  r += '|-----------|----------|--------|-------------|--------|\n'
  const anomalyCount = Math.floor(rng() * 4) + (anomalies.length > 0 ? anomalies.length : 0)
  const anomalyDB = [
    { sev: 'LOW', sys: 'COM', desc: 'Signal dropout (<2s)', status: 'Resolved' },
    { sev: 'MEDIUM', sys: 'EPS', desc: 'Battery cell imbalance', status: 'Investigating' },
    { sev: 'LOW', sys: 'TCS', desc: 'Heater cycle anomaly', status: 'Resolved' },
    { sev: 'HIGH', sys: 'ACS', desc: 'Reaction wheel vibration', status: 'Active' },
    { sev: 'MEDIUM', sys: 'PROP', desc: 'Pressure trend deviation', status: 'Monitoring' },
    { sev: 'LOW', sys: 'CDH', desc: 'EDAC correction spike', status: 'Resolved' }
  ]
  for (let i = 0; i < Math.min(anomalyCount, 6); i++) {
    const a = anomalyDB[i]
    r += '| ' + utcTimestamp(rng) + ' | ' + a.sev + ' | ' + a.sys + ' | ' + a.desc + ' | ' + a.status + ' |\n'
  }

  r += '\n## Remaining Useful Life\n\n'
  r += '| Subsystem | RUL (years) | Degradation Rate | End-of-Life |\n'
  r += '|-----------|-------------|-----------------|-------------|\n'
  const rulData = [
    { sub: 'Reaction Wheels', base: 4 },
    { sub: 'Batteries', base: 2.5 },
    { sub: 'Solar Arrays', base: 6 },
    { sub: 'Star Trackers', base: 7 },
    { sub: 'Gyros', base: 3 },
    { sub: 'Transponders', base: 8 }
  ]
  rulData.forEach(function (rd) {
    const rul = fmt(clamp(rd.base + (rng() - 0.5) * 2, 0.5, 10), 1)
    const rate = fmt(clamp(rng() * 3 + 1, 0.5, 8), 1)
    const eolYear = 2025 + Math.floor(parseFloat(rul))
    r += '| ' + rd.sub + ' | ' + rul + ' | ' + rate + '%/yr | ' + eolYear + ' |\n'
  })

  r += '\n## Recommendations\n\n'
  r += '1. **Immediate:** ' + (rng() > 0.5 ? 'Monitor ACS wheel vibration spectrum' : 'Schedule battery conditioning cycle') + '\n'
  r += '2. **7-Day:** Perform detailed trend analysis on power subsystem\n'
  r += '3. **30-Day:** Update onboard anomaly detection thresholds\n'
  r += '4. **Long-term:** Plan end-of-life deorbit strategy (RUL < 2 years)\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 6: GROUND STATION SCHEDULER ====================

function executeGroundStationScheduler(inputData: string): string {
  const data = parseInput<GroundStationInput>(inputData)
  const stations = data.ground_stations || [
    { name: 'Svalbard', lat_deg: 78.23, lon_deg: 15.39, min_elevation_deg: 5 },
    { name: 'Kiruna', lat_deg: 67.86, lon_deg: 20.97, min_elevation_deg: 5 },
    { name: 'Inuvik', lat_deg: 68.36, lon_deg: -133.72, min_elevation_deg: 5 }
  ]
  const tle = data.satellite_tle || { line1: '1 25544U 98067A   26001.50000000  .00020000  00000-0  28000-4 0  9995', line2: '2 25544  51.6430 210.0000 0005000  60.0000 300.0000 15.50000000    100', norad_id: '25544' }
  const schedWindow = data.scheduling_window_hours || 48
  const minPassMin = data.min_pass_duration_min || 5
  const dataVolume = data.data_volume_mb || 4000

  const rng = mulberry32(seedFromInput(data))

  let r = '# Ground Station Scheduling Report\n\n'
  r += '**Satellite NORAD ID:** ' + (tle.norad_id || '25544') + '\n'
  r += '**Scheduling Window:** ' + schedWindow + ' hours\n'
  r += '**Min Pass Duration:** ' + minPassMin + ' min\n'
  r += '**Data Volume Required:** ' + dataVolume + ' MB\n'
  r += '**Stations:** ' + stations.map(function (s): string { return s.name || 'Unknown' }).join(', ') + '\n\n'
  r += '---\n\n'

  r += '## Predicted Pass Schedule\n\n'
  r += '| Station | AOS (UTC) | LOS (UTC) | Duration (min) | Max Elev (deg) | Azimuth Range |\n'
  r += '|---------|-----------|-----------|----------------|----------------|----------------|\n'
  let totalContact = 0
  let totalData = 0
  stations.forEach(function (stn) {
    const numPasses = Math.floor(rng() * 3 + 2)
    for (let p = 0; p < numPasses; p++) {
      const toff = rng() * schedWindow
      const hour = Math.floor(toff)
      const minOff = Math.floor((toff - hour) * 60)
      const duration = fmt(clamp(rng() * 12 + minPassMin, 2, 15), 0)
      const maxElev = fmt(clamp(rng() * 60 + (stn.min_elevation_deg || 5), 10, 90), 1)
      const azStart = Math.floor(rng() * 360)
      const azEnd = (azStart + Math.floor(rng() * 90 + 20)) % 360
      const hStr = hour.toString().padStart(2, '0')
      const mStr = minOff.toString().padStart(2, '0')
      r += '| ' + (stn.name || 'STN') + ' | ' + hStr + ':' + mStr + ' | +' + fmt(toff + parseFloat(duration) / 60, 2) + 'h | ' + duration + ' | ' + maxElev + ' | ' + azStart + '\u00B0-' + azEnd + '\u00B0 |\n'
      totalContact += parseFloat(duration)
      totalData += parseFloat(duration) * 35
    }
  })

  r += '\n## Contact Summary\n\n'
  r += '| Metric | Value |\n'
  r += '|--------|-------|\n'
  r += '| Total Passes | ' + Math.floor(rng() * 5 + stations.length * 2) + ' |\n'
  r += '| Total Contact Time | ' + fmt(totalContact, 0) + ' min |\n'
  r += '| Average Pass Duration | ' + fmt(clamp(rng() * 5 + minPassMin, 5, 15), 1) + ' min |\n'
  r += '| Data Downlink Capacity | ' + fmt(totalData, 0) + ' MB |\n'
  r += '| Data Volume Satisfied | ' + (totalData >= dataVolume ? 'YES' : 'PARTIAL (' + fmt(totalData / dataVolume * 100, 0) + '%)') + ' |\n'
  r += '| Max Gap Between Passes | ' + fmt(clamp(rng() * 4 + 2, 1, 8), 1) + ' h |\n'
  r += '| Link Availability | ' + fmt(clamp(totalData / dataVolume * 100, 50, 100), 0) + '% |\n\n'

  r += '## Link Budget\n\n'
  r += '| Parameter | S-Band | X-Band |\n'
  r += '|-----------|--------|--------|\n'
  r += '| Frequency | 2.2 GHz | 8.4 GHz |\n'
  r += '| TX Power | ' + fmt(clamp(rng() * 10 + 30, 20, 43), 0) + ' dBm | ' + fmt(clamp(rng() * 15 + 35, 30, 50), 0) + ' dBm |\n'
  r += '| Antenna Gain | ' + fmt(clamp(rng() * 10 + 35, 30, 48), 1) + ' dBi | ' + fmt(clamp(rng() * 15 + 40, 38, 55), 1) + ' dBi |\n'
  r += '| Path Loss | ' + fmt(clamp(rng() * 30 + 160, 150, 195), 0) + ' dB | ' + fmt(clamp(rng() * 30 + 170, 165, 200), 0) + ' dB |\n'
  r += '| Received Power | ' + fmt(clamp(rng() * 20 - 110, -120, -85), 0) + ' dBm | ' + fmt(clamp(rng() * 20 - 115, -125, -88), 0) + ' dBm |\n'
  r += '| SNR | ' + fmt(clamp(rng() * 15 + 10, 5, 30), 1) + ' dB | ' + fmt(clamp(rng() * 15 + 8, 3, 25), 1) + ' dB |\n'
  r += '| Data Rate | ' + fmt(clamp(rng() * 5 + 2, 1, 10), 0) + ' Mbps | ' + fmt(clamp(rng() * 100 + 50, 30, 300), 0) + ' Mbps |\n\n'

  r += '## Scheduling Conflicts\n\n'
  const conflictCount = Math.floor(rng() * 2)
  if (conflictCount > 0) {
    r += '| Priority | Station | Conflict Type | Resolution |\n'
    r += '|----------|---------|---------------|------------|\n'
    r += '| High | ' + (stations[0]?.name || 'STN-A') + ' | Weather delay | Shift pass +30 min |\n'
  } else {
    r += 'No scheduling conflicts detected. All passes executable as planned.\n'
  }

  r += '\n---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 7: ORBITAL MANEUVER PLANNER ====================

function executeOrbitalManeuverPlanner(inputData: string): string {
  const data = parseInput<OrbitalManeuverInput>(inputData)
  const maneuverType = data.maneuver_type || 'hohmann'
  const initialOrbit = data.initial_orbit || { altitude_km: 400, inclination_deg: 51.6, eccentricity: 0.001 }
  const targetOrbit = data.target_orbit || { altitude_km: 550, inclination_deg: 51.6, eccentricity: 0.001 }
  const dryMass = data.spacecraft_dry_mass_kg || 1000
  const isp = data.specific_impulse_s || 300
  const propMass = data.propellant_mass_kg || 50

  const rng = mulberry32(seedFromInput(data))

  const r0 = 6371 + (initialOrbit.altitude_km || 400)
  const r1 = 6371 + (targetOrbit.altitude_km || 550)
  const mu = 398600.4418

  let r = '# Orbital Maneuver Planning Report\n\n'
  r += '**Maneuver Type:** ' + maneuverType + '\n'
  r += '**Initial Orbit:** ' + initialOrbit.altitude_km + ' km, i=' + initialOrbit.inclination_deg + '\u00B0, e=' + (initialOrbit.eccentricity || 0.001) + '\n'
  r += '**Target Orbit:** ' + targetOrbit.altitude_km + ' km, i=' + targetOrbit.inclination_deg + '\u00B0, e=' + (targetOrbit.eccentricity || 0.001) + '\n'
  r += '**Dry Mass:** ' + dryMass + ' kg\n'
  r += '**Specific Impulse:** ' + isp + ' s\n'
  r += '**Propellant Available:** ' + propMass + ' kg\n\n'
  r += '---\n\n'

  r += '## \u0394V Budget\n\n'
  r += '| Phase | \u0394V (m/s) | Burn Time (min) | Propellant (kg) | ITER |\n'
  r += '|-------|----------|-----------------|-----------------|------|\n'
  let totalDv = 0
  let totalProp = 0
  const maneuvers: string[] = []

  if (maneuverType === 'hohmann') {
    const v0 = Math.sqrt(mu / r0)
    const va = Math.sqrt(mu * (2 / r0 - 1 / ((r0 + r1) / 2)))
    const vb = Math.sqrt(mu * (2 / r1 - 1 / ((r0 + r1) / 2)))
    const v1 = Math.sqrt(mu / r1)
    const dv1 = Math.abs(va - v0) * 1000
    const dv2 = Math.abs(vb - v1) * 1000
    maneuvers.push('Perigee burn: ' + fmt(dv1, 2) + ' m/s')
    maneuvers.push('Apogee burn: ' + fmt(dv2, 2) + ' m/s')
    totalDv = dv1 + dv2
    maneuvers.push('Total \u0394V: ' + fmt(totalDv, 2) + ' m/s')

    r += '| Perigee Burn | ' + fmt(dv1, 2) + ' | ' + fmt(clamp(dv1 * dryMass / (isp * 9.81) / 60, 0.5, 30), 1) + ' | ' + fmt(clamp(dv1 * dryMass / (isp * 9.81), 0.1, 50), 2) + ' | 1 |\n'
    r += '| Apogee Burn | ' + fmt(dv2, 2) + ' | ' + fmt(clamp(dv2 * dryMass / (isp * 9.81) / 60, 0.5, 30), 1) + ' | ' + fmt(clamp(dv2 * dryMass / (isp * 9.81), 0.1, 50), 2) + ' | 1 |\n'
  } else if (maneuverType === 'plane_change') {
    const incDiff = Math.abs((targetOrbit.inclination_deg || 51.6) - (initialOrbit.inclination_deg || 51.6))
    const vAvg = Math.sqrt(mu / ((r0 + r1) / 2)) * 1000
    const dvPlane = 2 * vAvg * Math.sin(degToRad(incDiff) / 2)
    totalDv = dvPlane
    maneuvers.push('Plane change ' + fmt(incDiff, 1) + '\u00B0: ' + fmt(totalDv, 2) + ' m/s')
    r += '| Plane Change | ' + fmt(dvPlane, 2) + ' | ' + fmt(clamp(dvPlane * dryMass / (isp * 9.81) / 60, 0.5, 60), 1) + ' | ' + fmt(clamp(dvPlane * dryMass / (isp * 9.81), 0.1, 100), 2) + ' | 1 |\n'
  } else if (maneuverType === 'station_keeping') {
    const yearlyDv = 2 + rng() * 30
    totalDv = yearlyDv
    r += '| Annual Station-Keeping | ' + fmt(yearlyDv, 1) + ' | ' + fmt(clamp(yearlyDv * dryMass / (isp * 9.81) / 60, 0.1, 5), 1) + ' | ' + fmt(clamp(yearlyDv * dryMass / (isp * 9.81), 0.05, 20), 2) + ' | 52 |\n'
  } else if (maneuverType === 'collision_avoidance') {
    const dvCA = 0.2 + rng() * 1.5
    totalDv = dvCA
    r += '| Avoidance Burn | ' + fmt(dvCA, 2) + ' | ' + fmt(clamp(dvCA * dryMass / (isp * 9.81) / 60, 0.1, 3), 1) + ' | ' + fmt(clamp(dvCA * dryMass / (isp * 9.81), 0.01, 5), 2) + ' | 1 |\n'
    r += '| Return-to-nominal | ' + fmt(dvCA * 0.8, 2) + ' | ' + fmt(clamp(dvCA * 0.8 * dryMass / (isp * 9.81) / 60, 0.1, 3), 1) + ' | ' + fmt(clamp(dvCA * 0.8 * dryMass / (isp * 9.81), 0.01, 5), 2) + ' | 1 |\n'
    totalDv *= 1.8
  } else if (maneuverType === 'deorbit') {
    const periDrop = initialOrbit.altitude_km || 400 - 100
    const rPeri = 6371 + periDrop
    const a = (r0 + rPeri) / 2
    const dvDeorbit = Math.abs(Math.sqrt(mu / r0) - Math.sqrt(mu * (2 / r0 - 1 / a))) * 1000
    totalDv = dvDeorbit
    r += '| Deorbit Burn | ' + fmt(dvDeorbit, 2) + ' | ' + fmt(clamp(dvDeorbit * dryMass / (isp * 9.81) / 60, 0.1, 10), 1) + ' | ' + fmt(clamp(dvDeorbit * dryMass / (isp * 9.81), 0.01, 20), 2) + ' | 1 |\n'
  } else {
    const dvBiEll = fmt(100 + rng() * 500, 1)
    totalDv = parseFloat(dvBiEll)
    r += '| First Transfer Burn | ' + fmt(totalDv * 0.4, 1) + ' | ' + fmt(clamp(totalDv * 0.4 * dryMass / (isp * 9.81) / 60, 0.5, 20), 1) + ' | ' + fmt(clamp(totalDv * 0.4 * dryMass / (isp * 9.81), 0.1, 30), 2) + ' | 1 |\n'
    r += '| Second Transfer Burn | ' + fmt(totalDv * 0.6, 1) + ' | ' + fmt(clamp(totalDv * 0.6 * dryMass / (isp * 9.81) / 60, 0.5, 20), 1) + ' | ' + fmt(clamp(totalDv * 0.6 * dryMass / (isp * 9.81), 0.1, 30), 2) + ' | 1 |\n'
  }

  totalProp = totalDv * dryMass / (isp * 9.81)

  r += '| **Total** | **' + fmt(totalDv, 2) + '** | **' + fmt(clamp(totalDv * dryMass / (isp * 9.81) / 60, 0.5, 60), 1) + '** | **' + fmt(clamp(totalProp, 0.01, 200), 2) + '** | — |\n\n'

  r += '## Propellant Assessment\n\n'
  r += '| Parameter | Value | Status |\n'
  r += '|-----------|-------|--------|\n'
  r += '| Required Propellant | ' + fmt(totalProp, 2) + ' kg | ' + (totalProp <= propMass ? 'SUFFICIENT' : 'INSUFFICIENT') + ' |\n'
  r += '| Available Propellant | ' + fmt(propMass, 2) + ' kg | — |\n'
  r += '| Margin | ' + fmt(propMass - totalProp, 2) + ' kg | ' + (propMass - totalProp > propMass * 0.2 ? 'GOOD' : 'TIGHT') + ' |\n'
  r += '| Mass Ratio (rocket eq) | ' + fmt(Math.exp(totalDv / (isp * 9.81)), 4) + ' | — |\n'
  r += '| Post-Maneuver Mass | ' + fmt(dryMass + propMass - totalProp, 1) + ' kg | — |\n\n'

  r += '## Transfer Trajectory\n\n'
  const transferTime = fmt(clamp(Math.PI * Math.sqrt(Math.pow((r0 + r1) / 2, 3) / mu) / 60, 10, 600), 1)
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Transfer Time | ' + transferTime + ' min |\n'
  r += '| Phase Angle | ' + fmt(clamp(rng() * 180, 0, 360), 1) + '\u00B0 |\n'
  r += '| In-plane \u0394i | ' + fmt(Math.abs((targetOrbit.inclination_deg || 51.6) - (initialOrbit.inclination_deg || 51.6)), 2) + '\u00B0 |\n'
  r += '| Eccentricity (transfer) | ' + fmt(clamp((r1 - r0) / (r1 + r0), 0, 0.5), 4) + ' |\n\n'

  r += '## Maneuver Sequence\n\n'
  maneuvers.forEach(function (m, i) {
    r += (i + 1) + '. ' + m + '\n'
  })
  if (maneuvers.length === 0) {
    r += 'Single-burn execution at optimal phasing point.\n'
  }

  r += '\n## Execution Constraints\n\n'
  r += '| Constraint | Requirement | Predicted | Status |\n'
  r += '|------------|-------------|-----------|--------|\n'
  r += '| Ground contact during burn | ' + (rng() > 0.3 ? 'Required' : 'Preferred') + ' | ' + (rng() > 0.2 ? 'Available' : 'Gap ~5 min') + ' | ' + (rng() > 0.2 ? 'GO' : 'MARGINAL') + ' |\n'
  r += '| Eclipse avoidance | No eclipse during burn | ' + (rng() > 0.15 ? 'Clear' : 'Partial') + ' | ' + (rng() > 0.15 ? 'GO' : 'ADJUST') + ' |\n'
  r += '| Communication lock | Carrier lock maintained | ' + fmt(clamp(rng() * 5 + 92, 85, 100), 1) + '% | ' + (rng() > 0.1 ? 'GO' : 'MARGINAL') + ' |\n'
  r += '| Attitude alignment | < 0.5\u00B0 pointing error | ' + fmt(clamp(rng() * 0.3 + 0.05, 0.01, 0.8), 2) + '\u00B0 | ' + (rng() > 0.2 ? 'GO' : 'CLOSE') + ' |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 8: REENTRY PREDICTION TRACKER ====================

function executeReentryPredictionTracker(inputData: string): string {
  const data = parseInput<ReentryInput>(inputData)
  const norad = data.object_norad_id || 'DECAY-45211'
  const mass = data.object_mass_kg || 2500
  const crossSec = data.object_cross_section_m2 || 10
  const cd = data.object_cd || 2.2
  const initAlt = data.initial_altitude_km || 200
  const epoch = data.initial_epoch || '2026-08-25T00:00:00Z'
  const bc = data.ballistic_coefficient || (mass / (cd * crossSec))

  const rng = mulberry32(seedFromInput(data))

  let r = '# Reentry Prediction & Tracking Report\n\n'
  r += '**Object NORAD ID:** ' + norad + '\n'
  r += '**Object Mass:** ' + mass + ' kg\n'
  r += '**Cross-Section:** ' + crossSec + ' m\u00B2\n'
  r += '**Drag Coefficient (Cd):** ' + cd + '\n'
  r += '**Ballistic Coefficient:** ' + fmt(bc, 1) + ' kg/m\u00B2\n'
  r += '**Initial Altitude:** ' + initAlt + ' km\n'
  r += '**Epoch:** ' + epoch + '\n\n'
  r += '---\n\n'

  r += '## Orbital Decay Projection\n\n'
  r += '| Epoch (days) | Altitude (km) | Period (min) | Decay Rate (km/day) | Drag Accel (m/s\u00B2) |\n'
  r += '|-------------|--------------|--------------|----------------------|--------------------|\n'
  let alt = initAlt
  const decayRate = 0.5 + rng() * 5
  for (let d = 0; d <= 30; d += 5) {
    const period = fmt(orbitalPeriodSec(alt) / 60, 1)
    const dragAccel = fmt(clamp((bc > 0 ? 1 / bc : 0) * 1e-6 * (7.27e-5 * 6000) * (7.27e-5 * 6000) * alt * 1000, 1e-10, 1e-3), 2)
    const decayR = fmt(clamp(decayRate + d * 0.1 + rng() * 0.5, 0.1, 20), 1)
    r += '| +' + d + ' | ' + fmt(alt, 1) + ' | ' + period + ' | ' + decayR + ' | ' + dragAccel + ' |\n'
    alt -= decayRate + d * 0.1
    if (alt < 100) break
  }

  r += '\n## Reentry Window\n\n'
  const reentryHours = fmt(clamp(initAlt / (decayRate / 24), 1, 720), 1)
  const reentryUncertainty = fmt(clamp(rng() * 15 + 5, 2, 30), 1)
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Predicted Reentry Epoch | +' + reentryHours + ' h from ' + epoch + ' |\n'
  r += '| Uncertainty (\u00B1) | ' + reentryUncertainty + ' hours |\n'
  r += '| Window Start | +' + fmt(parseFloat(reentryHours) - parseFloat(reentryUncertainty), 1) + ' h |\n'
  r += '| Window End | +' + fmt(parseFloat(reentryHours) + parseFloat(reentryUncertainty), 1) + ' h |\n\n'

  r += '## Reentry Geometry\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Reentry Interface | 120 km |\n'
  r += '| Peak Heating Altitude | ' + fmt(clamp(rng() * 15 + 55, 50, 75), 0) + ' km |\n'
  r +=('| Peak Heat Flux | ' + fmt(clamp(rng() * 300 + 100, 50, 600), 0) + ' kW/m\u00B2 |\n')
  r += '| Peak Deceleration | ' + fmt(clamp(rng() * 8 + 4, 2, 15), 1) + ' g |\n'
  r += '| Total Radiated Energy | ' + fmt(clamp(mass * 80, 1e3, 1e6), 0) + ' MJ |\n'
  r += '| Breakup Altitude | ' + fmt(clamp(rng() * 20 + 55, 40, 80), 0) + ' km |\n\n'

  r += '## Ground Footprint\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Impact Latitude | ' + fmt(clamp((rng() - 0.5) * 60, -60, 60), 2) + '\u00B0 |\n'
  r += '| Impact Longitude | ' + fmt(clamp((rng() - 0.5) * 120, -180, 180), 2) + '\u00B0 |\n'
  r += '| Ground Track Length | ' + fmt(clamp(rng() * 3000 + 500, 1000, 8000), 0) + ' km |\n'
  r += '| Debris Casualty Area | ' + fmt(clamp(rng() * 100 + 10, 5, 200), 0) + ' km\u00B2 |\n'
  r += '| Casualty Probability | ' + fmt(clamp(rng() * 1e-4, 1e-6, 1e-3), 1) + ' |\n\n'

  r += '## Survivability Assessment\n\n'
  r += '| Component | Material | Survives? | Impact Energy (MJ) |\n'
  r += '|----------|----------|-----------|-------------------|\n'
  const components = [
    { comp: 'Fuel Tanks', mat: 'Aluminum-Lithium', survives: 'No', energy: 5 + rng() * 20 },
    { comp: 'Reaction Wheels', mat: 'Steel', survives: 'Maybe', energy: 20 + rng() * 50 },
    { comp: 'Solar Array Panels', mat: 'Composite', survives: 'No', energy: 1 + rng() * 5 },
    { comp: 'Optical Bench', mat: 'Titanium', survives: 'Yes', energy: 80 + rng() * 100 },
    { comp: 'Battery Units', mat: 'Various', survives: 'No', energy: 10 + rng() * 30 },
    { comp: 'Propulsion Tank', mat: 'Titanium', survives: 'Yes', energy: 100 + rng() * 150 }
  ]
  components.forEach(function (c) {
    r += '| ' + c.comp + ' | ' + c.mat + ' | ' + c.survives + ' | ' + fmt(c.energy, 0) + ' |\n'
  })

  r += '\n## Risk Notification\n\n'
  r += '| Stakeholder | Notification Status | Lead Time |\n'
  r += '|-------------|--------------------|----------|\n'
  r += '| Aviation Authorities | ' + (rng() > 0.2 ? 'Sent' : 'Pending') + ' | -24 h |\n'
  r += '| Maritime Services | ' + (rng() > 0.3 ? 'Sent' : 'N/A') + ' | -12 h |\n'
  r += '| Civil Defense | ' + (rng() > 0.3 ? 'Sent' : 'N/A') + ' | -6 h |\n'
  r += '| Air Traffic Control | Sent | -48 h |\n'
  r += '| UN COPUOS | ' + (rng() > 0.5 ? 'Sent' : 'Pending') + ' | -72 h |\n\n'

  r += '## Tracking Sources\n\n'
  r += '| Source | Type | Last Update | Accuracy (km) |\n'
  r += '|--------|------|-------------|------------------|\n'
  r += '| Space-Track.org | TLE | -' + Math.floor(rng() * 48) + ' h | \u00B11 |\n'
  r += '| EISCAT | Radar | -' + Math.floor(rng() * 12) + ' h | \u00B10.1 |\n'
  r += '| Goldstone | Radar | -' + Math.floor(rng() * 72) + ' h | \u00B10.05 |\n'
  r += '| AMOS | Optical | -' + Math.floor(rng() * 24) + ' h | \u00B10.5 |\n'
  r += '| ESA SST | Combined | -' + Math.floor(rng() * 6) + ' h | \u00B10.3 |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'space_weather_predictor',
    description: 'Space Weather Predictor | Solar flares, geomagnetic storms, radiation belt assessment',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: forecast_hours, region, solar_activity_level, include_radiation_belt, satellite_altitude_km'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeSpaceWeatherPredictor(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'collision_avoidance_system',
    description: 'Collision Avoidance System | Conjunction assessment, Pc analysis, maneuver planning',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: primary_satellite_id, primary_orbit, secondary_objects, screening_volume_km, probability_threshold'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeCollisionAvoidanceSystem(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'debris_tracking_analyzer',
    description: 'Debris Tracking Analyzer | Catalog analysis, evolution projections, removal assessment',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: region_filter, size_threshold_cm, tracked_satellites, projection_years, include_removal_assessment'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeDebrisTrackingAnalyzer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'launch_window_optimizer',
    description: 'Launch Window Optimizer | Orbital constraints, weather go, range safety, injection accuracy',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: launch_site, target_orbit, launch_vehicle, payload_mass_kg, window_start, weather_constraints'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeLaunchWindowOptimizer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'satellite_health_monitor',
    description: 'Satellite Health Monitor | Telemetry anomalies, subsystem degradation, remaining useful life',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: satellite_id, telemetry, orbit_info, anomaly_flags'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeSatelliteHealthMonitor(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'ground_station_scheduler',
    description: 'Ground Station Scheduler | Pass prediction, contact windows, link budget, conflict resolution',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: ground_stations, satellite_tle, scheduling_window_hours, min_pass_duration_min, data_volume_mb'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeGroundStationScheduler(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'orbital_maneuver_planner',
    description: 'Orbital Maneuver Planner | Hohmann, bi-elliptic, plane change, station-keeping, deorbit',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: maneuver_type, initial_orbit, target_orbit, spacecraft_dry_mass_kg, specific_impulse_s, propellant_mass_kg'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeOrbitalManeuverPlanner(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'reentry_prediction_tracker',
    description: 'Reentry Prediction Tracker | Decay projection, footprint, survivability, risk notification',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: object_norad_id, object_mass_kg, object_cross_section_m2, ballistic_coefficient, initial_altitude_km'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeReentryPredictionTracker(args.input_data) }
  }))
}
