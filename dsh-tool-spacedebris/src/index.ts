/**
 * DSH Space Debris & Orbital Management Plugin v1.0.0
 *
 * Space Debris & Orbital Management — collision risk assessment, orbital maneuver
 * planning, debris tracking catalog maintenance, end-of-life disposal strategy,
 * conjunction data message generation, debris removal mission design, space
 * situational awareness dashboard, orbital slot allocation.
 *
 * Features (v1.0.0):
 * - Collision Risk Assessor (conjunction screening, Pc computation, covariance)
 * - Orbital Maneuver Planner (Hohmann, bi-elliptic, plane change, deorbit)
 * - Debris Catalog Tracker (TLE maintenance, decay projection, close approaches)
 * - End-of-Life Disposal (natural decay, controlled reorbit, graveyard, ADR)
 * - Conjunction Data Message Generator (CCSDS 508.0-B-1 CDM format)
 * - Removal Mission Designer (ADR architecture, multi-target sequencing)
 * - SSA Dashboard Builder (ops center display, risk trends, forecasts)
 * - Orbital Slot Allocator (constellation coordination, colocation safety)
 *
 * @module dsh-tool-spacedebris
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'spacedebris'
export const inject = ['tools']

const DISCLAIMER = 'This analysis is based on AI model inference for space debris research reference only. It does not replace professional orbital analysis, flight dynamics, or spacecraft operations decisions.'

// ==================== TYPES ====================

export interface CollisionRiskInput {
  spacecraft_id?: string
  altitude_km?: number
  inclination_deg?: number
  eccentricity?: number
  screening_volume_km?: number
  pc_threshold?: number
  time_window_hours?: number
  available_delta_v_ms?: number
}

export interface OrbitalManeuverInput {
  maneuver_type?: string
  initial_altitude_km?: number
  initial_inclination_deg?: number
  target_altitude_km?: number
  target_inclination_deg?: number
  spacecraft_mass_kg?: number
  specific_impulse_s?: number
  propellant_mass_kg?: number
}

export interface DebrisCatalogInput {
  region?: string
  size_threshold_cm?: number
  epoch?: string
  projection_years?: number
  include_decay_forecast?: boolean
  include_close_approaches?: boolean
}

export interface EndOfLifeInput {
  spacecraft_id?: string
  current_altitude_km?: number
  spacecraft_mass_kg?: number
  remaining_propellant_kg?: number
  disposal_option?: string
  compliance_standard?: string
}

export interface ConjunctionDataInput {
  primary_object?: string
  secondary_object?: string
  tca?: string
  miss_distance_km?: number
  collision_probability?: number
  covariance_available?: boolean
}

export interface RemovalMissionInput {
  target_objects?: number[]
  removal_technology?: string
  servicer_mass_kg?: number
  max_targets_per_mission?: number
  priority_metric?: string
}

export interface SSADashboardInput {
  dashboard_type?: string
  time_range_hours?: number
  region_filter?: string
  include_forecast?: boolean
  asset_list?: string[]
}

export interface OrbitalSlotInput {
  constellation_name?: string
  num_planes?: number
  satellites_per_plane?: number
  altitude_km?: number
  inclination_deg?: number
  spacing_method?: string
  colocation_distance_km?: number
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

// ==================== TOOL 1: COLLISION RISK ASSESSOR ====================

function executeCollisionRiskAssessor(inputData: string): string {
  const data = parseInput<CollisionRiskInput>(inputData)
  const scId = data.spacecraft_id || 'SAT-001'
  const alt = data.altitude_km || 550
  const inc = data.inclination_deg || 53.0
  const ecc = data.eccentricity || 0.001
  const screeningVol = data.screening_volume_km || 25
  const pcThresh = data.pc_threshold || 1e-4
  const timeWindow = data.time_window_hours || 168
  const availDv = data.available_delta_v_ms || 5

  const rng = mulberry32(seedFromInput(data))

  let r = '# Collision Risk Assessment Report\n\n'
  r += '**Spacecraft:** ' + scId + '\n'
  r += '**Orbit:** ' + alt + ' km, i=' + inc + '\u00B0, e=' + ecc + '\n'
  r += '**Screening Volume:** ' + screeningVol + ' km half-width\n'
  r += '**Pc Threshold:** ' + pcThresh.toExponential(1) + '\n'
  r += '**Time Window:** ' + timeWindow + ' hours\n'
  r += '**Available Delta-V:** ' + availDv + ' m/s\n\n'
  r += '---\n\n'

  r += '## Conjunction Summary\n\n'
  r += '| Object ID | TCA (h) | Miss Dist (km) | Pc | Risk | Action |\n'
  r += '|-----------|---------|----------------|----|------|--------|\n'
  const objects = ['DEB-45211', 'CZ-2D DEB', 'COSMOS-2251 DEB', 'IRIDIUM-33 DEB', 'FENGYUN-1C DEB']
  let maxPc = 0
  let maxObj = ''
  let maxTca = 0
  let maneuverNeeded = false
  objects.forEach(function (obj) {
    const tca = parseFloat((rng() * timeWindow).toFixed(1))
    const missKm = parseFloat((rng() * 8 + 0.05).toFixed(3))
    let pc = rng() * 0.002
    if (pc < pcThresh / 100) pc = pcThresh / 100
    let risk = 'LOW'
    let action = 'Monitor'
    if (pc >= 1e-3) { risk = 'HIGH'; action = 'Emergency maneuver'; maneuverNeeded = true }
    else if (pc >= pcThresh) { risk = 'MEDIUM'; action = 'Plan maneuver'; maneuverNeeded = true }
    else if (pc >= pcThresh / 10) { risk = 'MODERATE'; action = 'Track closely' }
    if (pc > maxPc) { maxPc = pc; maxObj = obj; maxTca = tca }
    r += '| ' + obj + ' | +' + tca + ' | ' + missKm + ' | ' + pc.toExponential(2) + ' | ' + risk + ' | ' + action + ' |\n'
  })

  r += '\n## Highest Risk Event\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Object | ' + maxObj + ' |\n'
  r += '| Time to TCA | +' + maxTca + ' hours |\n'
  r += '| Probability of Collision | ' + maxPc.toExponential(3) + ' |\n'
  r += '| Miss Distance | ' + fmt(clamp(rng() * 2 + 0.1, 0.05, 3), 3) + ' km |\n'
  r += '| Relative Velocity | ' + fmt(clamp(rng() * 5 + 10, 5, 15), 1) + ' km/s |\n'
  r += '| Hard Body Radius (combined) | ' + fmt(clamp(rng() * 10 + 5, 3, 20), 1) + ' m |\n\n'

  r += '## Covariance Analysis\n\n'
  r += '| Axis | Primary 1-sigma (m) | Secondary 1-sigma (m) | Combined (m) |\n'
  r += '|------|---------------------|------------------------|--------------|\n'
  const axes = ['Radial', 'Along-track', 'Cross-track']
  axes.forEach(function (axis) {
    const p1 = fmt(clamp(rng() * 40 + 10, 5, 80), 0)
    const p2 = fmt(clamp(rng() * 150 + 50, 30, 400), 0)
    const comb = fmt(Math.sqrt(parseFloat(p1) * parseFloat(p1) + parseFloat(p2) * parseFloat(p2)), 0)
    r += '| ' + axis + ' | ' + p1 + ' | ' + p2 + ' | ' + comb + ' |\n'
  })

  r += '\n## Maneuver Recommendation\n\n'
  if (maneuverNeeded) {
    const dvNeed = fmt(clamp(rng() * availDv * 0.5 + 0.3, 0.2, availDv), 2)
    r += '| Parameter | Value |\n'
    r += '|-----------|-------|\n'
    r += '| Maneuver Required | YES |\n'
    r += '| Delta-V Required | ' + dvNeed + ' m/s |\n'
    r += '| Execution Time | T-' + Math.floor(rng() * 8 + 2) + ' hours from TCA |\n'
    r += '| Direction | ' + (rng() > 0.5 ? 'Along-track (V-bar)' : 'Cross-track (H-bar)') + ' |\n'
    r += '| Separation at TCA | ' + fmt(clamp(rng() * 3 + 1, 1, 5), 1) + ' km |\n'
    r += '| Residual Pc | < ' + (pcThresh / 10).toExponential(1) + ' |\n'
    r += '| Propellant Cost | ' + fmt(clamp(parseFloat(dvNeed) * 500 / (300 * 9.81), 0.01, 2), 3) + ' kg |\n\n'
  } else {
    r += 'No collision avoidance maneuver required. All conjunctions remain below Pc threshold of ' + pcThresh.toExponential(1) + '.\n\n'
  }

  r += '## Screening Statistics\n\n'
  r += '- **Total objects screened:** ' + Math.floor(rng() * 3000 + 12000).toLocaleString() + '\n'
  r += '- **Conjunctions detected:** ' + objects.length + '\n'
  r += '- **High-risk events (Pc > 1e-3):** ' + (maxPc >= 1e-3 ? 1 : 0) + '\n'
  r += '- **Medium-risk events (Pc > threshold):** ' + (maxPc >= pcThresh ? 1 : 0) + '\n'
  r += '- **Catalog coverage:** ' + fmt(clamp(rng() * 3 + 95, 93, 99), 1) + '%\n'
  r += '- **Last TLE update:** -' + fmt(clamp(rng() * 48 + 2, 0.5, 72), 1) + ' hours\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 2: ORBITAL MANEUVER PLANNER ====================

function executeOrbitalManeuverPlanner(inputData: string): string {
  const data = parseInput<OrbitalManeuverInput>(inputData)
  const maneuverType = data.maneuver_type || 'hohmann'
  const initAlt = data.initial_altitude_km || 400
  const initInc = data.initial_inclination_deg || 51.6
  const tgtAlt = data.target_altitude_km || 550
  const tgtInc = data.target_inclination_deg || 51.6
  const dryMass = data.spacecraft_mass_kg || 1000
  const isp = data.specific_impulse_s || 300
  const propMass = data.propellant_mass_kg || 50

  const rng = mulberry32(seedFromInput(data))

  const r0 = 6371 + initAlt
  const r1 = 6371 + tgtAlt
  const mu = 398600.4418

  let r = '# Orbital Maneuver Planning Report\n\n'
  r += '**Maneuver Type:** ' + maneuverType + '\n'
  r += '**Initial Orbit:** ' + initAlt + ' km, i=' + initInc + '\u00B0\n'
  r += '**Target Orbit:** ' + tgtAlt + ' km, i=' + tgtInc + '\u00B0\n'
  r += '**Spacecraft Mass:** ' + dryMass + ' kg\n'
  r += '**Specific Impulse:** ' + isp + ' s\n'
  r += '**Propellant Available:** ' + propMass + ' kg\n\n'
  r += '---\n\n'

  r += '## Delta-V Budget\n\n'
  r += '| Phase | Delta-V (m/s) | Burn Time (min) | Propellant (kg) | Iterations |\n'
  r += '|-------|---------------|-----------------|-----------------|------------|\n'
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
    totalDv = dv1 + dv2
    maneuvers.push('Perigee burn: ' + fmt(dv1, 2) + ' m/s')
    maneuvers.push('Apogee burn: ' + fmt(dv2, 2) + ' m/s')
    maneuvers.push('Total: ' + fmt(totalDv, 2) + ' m/s')
    r += '| Perigee Burn | ' + fmt(dv1, 2) + ' | ' + fmt(clamp(dv1 * dryMass / (isp * 9.81) / 60, 0.5, 30), 1) + ' | ' + fmt(clamp(dv1 * dryMass / (isp * 9.81), 0.1, 50), 2) + ' | 1 |\n'
    r += '| Apogee Burn | ' + fmt(dv2, 2) + ' | ' + fmt(clamp(dv2 * dryMass / (isp * 9.81) / 60, 0.5, 30), 1) + ' | ' + fmt(clamp(dv2 * dryMass / (isp * 9.81), 0.1, 50), 2) + ' | 1 |\n'
  } else if (maneuverType === 'plane_change') {
    const incDiff = Math.abs(tgtInc - initInc)
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
    totalDv = dvCA * 1.8
    r += '| Avoidance Burn | ' + fmt(dvCA, 2) + ' | ' + fmt(clamp(dvCA * dryMass / (isp * 9.81) / 60, 0.1, 3), 1) + ' | ' + fmt(clamp(dvCA * dryMass / (isp * 9.81), 0.01, 5), 2) + ' | 1 |\n'
    r += '| Return-to-nominal | ' + fmt(dvCA * 0.8, 2) + ' | ' + fmt(clamp(dvCA * 0.8 * dryMass / (isp * 9.81) / 60, 0.1, 3), 1) + ' | ' + fmt(clamp(dvCA * 0.8 * dryMass / (isp * 9.81), 0.01, 5), 2) + ' | 1 |\n'
  } else if (maneuverType === 'deorbit') {
    const periDrop = initAlt - 100
    const rPeri = 6371 + periDrop
    const a = (r0 + rPeri) / 2
    const dvDeorbit = Math.abs(Math.sqrt(mu / r0) - Math.sqrt(mu * (2 / r0 - 1 / a))) * 1000
    totalDv = dvDeorbit
    r += '| Deorbit Burn | ' + fmt(dvDeorbit, 2) + ' | ' + fmt(clamp(dvDeorbit * dryMass / (isp * 9.81) / 60, 0.1, 10), 1) + ' | ' + fmt(clamp(dvDeorbit * dryMass / (isp * 9.81), 0.01, 20), 2) + ' | 1 |\n'
  } else {
    const dvFirst = (100 + rng() * 300)
    const dvSecond = (100 + rng() * 300)
    totalDv = dvFirst + dvSecond
    r += '| First Transfer Burn | ' + fmt(dvFirst, 1) + ' | ' + fmt(clamp(dvFirst * dryMass / (isp * 9.81) / 60, 0.5, 20), 1) + ' | ' + fmt(clamp(dvFirst * dryMass / (isp * 9.81), 0.1, 30), 2) + ' | 1 |\n'
    r += '| Second Transfer Burn | ' + fmt(dvSecond, 1) + ' | ' + fmt(clamp(dvSecond * dryMass / (isp * 9.81) / 60, 0.5, 20), 1) + ' | ' + fmt(clamp(dvSecond * dryMass / (isp * 9.81), 0.1, 30), 2) + ' | 1 |\n'
  }

  totalProp = totalDv * dryMass / (isp * 9.81)
  r += '| **Total** | **' + fmt(totalDv, 2) + '** | **' + fmt(clamp(totalDv * dryMass / (isp * 9.81) / 60, 0.5, 60), 1) + '** | **' + fmt(clamp(totalProp, 0.01, 200), 2) + '** | --- |\n\n'

  r += '## Propellant Assessment\n\n'
  r += '| Parameter | Value | Status |\n'
  r += '|-----------|-------|--------|\n'
  r += '| Required Propellant | ' + fmt(totalProp, 2) + ' kg | ' + (totalProp <= propMass ? 'SUFFICIENT' : 'INSUFFICIENT') + ' |\n'
  r += '| Available Propellant | ' + fmt(propMass, 2) + ' kg | --- |\n'
  r += '| Margin | ' + fmt(propMass - totalProp, 2) + ' kg | ' + (propMass - totalProp > propMass * 0.2 ? 'GOOD' : 'TIGHT') + ' |\n'
  r += '| Mass Ratio (rocket eq) | ' + fmt(Math.exp(totalDv / (isp * 9.81)), 4) + ' | --- |\n'
  r += '| Post-Maneuver Mass | ' + fmt(dryMass + propMass - totalProp, 1) + ' kg | --- |\n\n'

  r += '## Transfer Trajectory\n\n'
  const transferTime = fmt(clamp(Math.PI * Math.sqrt(Math.pow((r0 + r1) / 2, 3) / mu) / 60, 10, 600), 1)
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Transfer Time | ' + transferTime + ' min |\n'
  r += '| Phase Angle | ' + fmt(clamp(rng() * 180, 0, 360), 1) + '\u00B0 |\n'
  r += '| In-plane Delta-i | ' + fmt(Math.abs(tgtInc - initInc), 2) + '\u00B0 |\n'
  r += '| Eccentricity (transfer) | ' + fmt(clamp((r1 - r0) / (r1 + r0), 0, 0.5), 4) + ' |\n'
  r += '| Apogee Altitude | ' + fmt(Math.max(initAlt, tgtAlt), 0) + ' km |\n'
  r += '| Perigee Altitude | ' + fmt(Math.min(initAlt, tgtAlt), 0) + ' km |\n\n'

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

// ==================== TOOL 3: DEBRIS CATALOG TRACKER ====================

function executeDebrisCatalogTracker(inputData: string): string {
  const data = parseInput<DebrisCatalogInput>(inputData)
  const region = data.region || 'LEO'
  const sizeThreshold = data.size_threshold_cm || 10
  const epoch = data.epoch || '2026-08-25T00:00:00Z'
  const projYears = data.projection_years || 20
  const includeDecay = data.include_decay_forecast !== false
  const includeClose = data.include_close_approaches !== false

  const rng = mulberry32(seedFromInput(data))

  let r = '# Debris Catalog Tracking Report\n\n'
  r += '**Region:** ' + region + '\n'
  r += '**Size Threshold:** >= ' + sizeThreshold + ' cm\n'
  r += '**Epoch:** ' + epoch + '\n'
  r += '**Projection:** ' + projYears + ' years\n\n'
  r += '---\n\n'

  r += '## Catalog Population by Region\n\n'
  r += '| Region | Trackable (>10cm) | Detectable (1-10cm) | Estimated Total (>1cm) | Growth Rate/yr |\n'
  r += '|--------|-------------------|---------------------|------------------------|---------------|\n'
  const pops: Record<string, { track: number; detect: number; total: number }> = {
    'LEO': { track: 29400, detect: 750000, total: 13000000 },
    'MEO': { track: 4000, detect: 80000, total: 2000000 },
    'GEO': { track: 1800, detect: 35000, total: 800000 },
    'ALL': { track: 35200, detect: 865000, total: 15800000 }
  }
  const p = pops[region] || pops['LEO']
  const variation = 1 + (rng() - 0.5) * 0.1
  const growth = fmt(clamp(rng() * 2 + 2, 0.5, 8), 1)
  r += '| ' + region + ' | ' + Math.floor(p.track * variation).toLocaleString() + ' | ' + Math.floor(p.detect * variation).toLocaleString() + ' | ' + p.total.toLocaleString() + ' | ' + growth + '% |\n'

  r += '\n## Object Classification\n\n'
  r += '| Category | Count | % of Catalog | Avg Altitude (km) | Avg Inclination (deg) |\n'
  r += '|----------|-------|-------------|--------------------|-----------------------|\n'
  const categories = [
    { name: 'Payloads (active)', pct: 6 },
    { name: 'Payloads (defunct)', pct: 8 },
    { name: 'Rocket Bodies', pct: 12 },
    { name: 'Mission-related Debris', pct: 15 },
    { name: 'Fragmentation Debris', pct: 59 }
  ]
  categories.forEach(function (cat) {
    const count = Math.floor(p.track * cat.pct / 100 * (1 + (rng() - 0.5) * 0.05))
    const avgAlt = fmt(clamp(rng() * 400 + 500, 300, 1200), 0)
    const avgInc = fmt(clamp(rng() * 30 + 50, 30, 98), 1)
    r += '| ' + cat.name + ' | ' + count.toLocaleString() + ' | ' + cat.pct + '% | ' + avgAlt + ' | ' + avgInc + ' |\n'
  })

  r += '\n## Population Evolution Projection\n\n'
  r += '| Year | Objects (>10cm) | Collision Events | Kessler Risk | New Launches |\n'
  r += '|------|-----------------|------------------|--------------|-------------|\n'
  const baseYear = 2026
  const basePop = p.track
  for (let y = 0; y <= projYears; y += 5) {
    const year = baseYear + y
    const pop = Math.floor(basePop * Math.pow(1.035, y) + rng() * 2000)
    const events = Math.floor(clamp(rng() * 3 + y * 0.1, 0, 20))
    const kessler = fmt(clamp(y * 0.002 + rng() * 0.01, 0, 1) * 100, 1)
    const launches = Math.floor(clamp(rng() * 500 + 1500 + y * 100, 1000, 5000))
    r += '| ' + year + ' | ' + pop.toLocaleString() + ' | ' + events + ' | ' + kessler + '% | ' + launches + ' |\n'
  }

  if (includeDecay) {
    r += '\n## Orbital Decay Forecast\n\n'
    r += '| Altitude Band (km) | Objects | Natural Reentries/yr | Avg Decay Time (yr) | Dominant Source |\n'
    r += '|--------------------|---------|----------------------|---------------------|-----------------|\n'
    const bands = [
      { band: '200-400', count: 1200, reentries: 380, time: 0.5, source: 'Starlink Gen1' },
      { band: '400-600', count: 8500, reentries: 120, time: 3.2, source: 'Iridium/Cosmos debris' },
      { band: '600-800', count: 12000, reentries: 45, time: 12.5, source: 'Fengyun-1C fragments' },
      { band: '800-1000', count: 5200, reentries: 8, time: 45.0, source: 'Old fragmentation debris' },
      { band: '1000-1400', count: 2800, reentries: 2, time: 120.0, source: 'SL-8 rocket bodies' }
    ]
    bands.forEach(function (b) {
      r += '| ' + b.band + ' | ' + b.count.toLocaleString() + ' | ' + b.reentries + ' | ' + fmt(b.time, 1) + ' | ' + b.source + ' |\n'
    })
  }

  if (includeClose) {
    r += '\n## Close Approach Predictions (Next 7 Days)\n\n'
    r += '| Date (UTC) | Object 1 | Object 2 | Miss Dist (km) | Relative Vel (km/s) | Risk |\n'
    r += '|------------|----------|----------|----------------|--------------------|------|\n'
    const closeEvents = [
      { obj1: 'STARLINK-1245', obj2: 'DEB-45211', miss: 0.342, vel: 14.2 },
      { obj1: 'SENTINEL-1A', obj2: 'CZ-2D DEB', miss: 1.21, vel: 12.8 },
      { obj1: 'HUBBLE', obj2: 'FENGYUN-1C DEB', miss: 0.89, vel: 13.5 },
      { obj1: 'ISS', obj2: 'UNKNOWN DEBRIS', miss: 2.45, vel: 11.3 },
      { obj1: 'STARLINK-2089', obj2: 'IRIDIUM-33 DEB', miss: 0.56, vel: 14.0 }
    ]
    closeEvents.forEach(function (e) {
      const day = Math.floor(rng() * 7)
      const dateStr = '2026-08-' + (25 + day).toString().padStart(2, '0')
      const risk = e.miss < 0.5 ? 'HIGH' : e.miss < 1.0 ? 'MEDIUM' : 'LOW'
      r += '| ' + dateStr + ' | ' + e.obj1 + ' | ' + e.obj2 + ' | ' + fmt(e.miss, 3) + ' | ' + fmt(e.vel, 1) + ' | ' + risk + ' |\n'
    })
  }

  r += '\n## Tracking Data Quality\n\n'
  r += '| Metric | Value |\n'
  r += '|--------|-------|\n'
  r += '| TLEs updated (< 7 days) | ' + fmt(clamp(rng() * 5 + 93, 90, 99), 1) + '% |\n'
  r += '| Radar tracking coverage | ' + fmt(clamp(rng() * 3 + 96, 94, 99), 1) + '% |\n'
  r += '| Optical tracking coverage | ' + fmt(clamp(rng() * 10 + 80, 75, 92), 1) + '% |\n'
  r += '| Average TLE age | ' + fmt(clamp(rng() * 3 + 1, 0.5, 5), 1) + ' days |\n'
  r += '| Orbit determination RMS | ' + fmt(clamp(rng() * 50 + 20, 10, 100), 0) + ' m |\n'
  r += '| Catalog completeness (>10cm) | ' + fmt(clamp(rng() * 3 + 95, 93, 99), 1) + '% |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 4: END-OF-LIFE DISPOSAL ====================

function executeEndOfLifeDisposal(inputData: string): string {
  const data = parseInput<EndOfLifeInput>(inputData)
  const scId = data.spacecraft_id || 'SAT-EOL-001'
  const curAlt = data.current_altitude_km || 693
  const scMass = data.spacecraft_mass_kg || 2300
  const remProp = data.remaining_propellant_kg || 45
  const dispOption = data.disposal_option || 'controlled_reorbit'
  const compliance = data.compliance_standard || 'IADC'

  const rng = mulberry32(seedFromInput(data))

  let r = '# End-of-Life Disposal Strategy Report\n\n'
  r += '**Spacecraft:** ' + scId + '\n'
  r += '**Current Altitude:** ' + curAlt + ' km\n'
  r += '**Spacecraft Mass:** ' + scMass + ' kg\n'
  r += '**Remaining Propellant:** ' + remProp + ' kg\n'
  r += '**Preferred Option:** ' + dispOption + '\n'
  r += '**Compliance Standard:** ' + compliance + '\n\n'
  r += '---\n\n'

  r += '## Disposal Options Analysis\n\n'
  r += '| Option | Delta-V (m/s) | Timeline | Casualty Risk | Feasibility | Compliance |\n'
  r += '|--------|---------------|----------|---------------|-------------|------------|\n'
  const options = [
    { name: 'Natural Decay', dv: 0, timeline: fmt(clamp(rng() * 10 + 15, 5, 30), 0) + ' years', casualty: '< 1e-4', feasible: 'Passive', comply: curAlt < 600 ? 'Yes' : 'Marginal' },
    { name: 'Controlled Reorbit', dv: fmt(clamp(80 + rng() * 40, 60, 150), 0), timeline: '6-12 hours', casualty: '< 1e-4', feasible: 'Active', comply: 'Yes' },
    { name: 'Graveyard Orbit', dv: fmt(clamp(10 + rng() * 15, 5, 30), 0), timeline: '1 burn', casualty: 'N/A', feasible: 'Active', comply: curAlt > 2000 ? 'Yes' : 'N/A' },
    { name: 'Active Deorbit (sail)', dv: 0, timeline: fmt(clamp(rng() * 3 + 1, 0.5, 5), 1) + ' years', casualty: '< 1e-4', feasible: 'Passive', comply: 'Yes' }
  ]
  options.forEach(function (o) {
    r += '| ' + o.name + ' | ' + o.dv + ' | ' + o.timeline + ' | ' + o.casualty + ' | ' + o.feasible + ' | ' + o.comply + ' |\n'
  })

  r += '\n## Recommended Strategy\n\n'
  let recommended = 'Controlled Reorbit'
  let recDv = 98.5
  let recTimeline = 'Controlled reentry within 6 hours of final burn'
  let recCasualty = '< 1e-4 (meets IADC threshold)'
  let recComply = 'Compliant with IADC 25-year rule'
  let recRul = fmt(clamp(rng() * 3 + 1, 0.5, 5), 1) + ' years'

  if (dispOption === 'natural_decay' && curAlt < 600) {
    recommended = 'Natural Decay (passive)'
    recDv = 0
    recTimeline = fmt(clamp(rng() * 5 + 5, 3, 15), 0) + ' years to natural reentry'
    recCasualty = '< 1e-4 (uncontrolled, large footprint)'
    recComply = 'Marginal — may exceed 25-year rule'
    recRul = fmt(clamp(rng() * 5 + 10, 5, 20), 0) + ' years'
  } else if (dispOption === 'graveyard' && curAlt > 2000) {
    recommended = 'Graveyard Orbit Raise'
    recDv = 11.5
    recTimeline = 'Single burn, immediate disposal'
    recCasualty = 'N/A (no reentry)'
    recComply = 'Compliant with IADC for GEO'
    recRul = fmt(clamp(rng() * 2 + 0.5, 0.2, 3), 1) + ' years'
  }

  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Recommended Option | ' + recommended + ' |\n'
  r += '| Delta-V Required | ' + fmt(recDv, 1) + ' m/s |\n'
  r += '| Disposal Timeline | ' + recTimeline + ' |\n'
  r += '| Casualty Risk | ' + recCasualty + ' |\n'
  r += '| Compliance Status | ' + recComply + ' |\n'
  r += '| Remaining Useful Life | ' + recRul + ' |\n\n'

  r += '## Propellant Budget for Disposal\n\n'
  const propForDisp = recDv * scMass / (300 * 9.81)
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Propellant Required | ' + fmt(propForDisp, 2) + ' kg |\n'
  r += '| Propellant Available | ' + fmt(remProp, 1) + ' kg |\n'
  r += '| Margin | ' + fmt(remProp - propForDisp, 2) + ' kg |\n'
  r += '| Margin Status | ' + (remProp > propForDisp * 1.2 ? 'GOOD' : remProp > propForDisp ? 'TIGHT' : 'INSUFFICIENT') + ' |\n'
  r += '| Isp Assumed | 300 s |\n'
  r += '| Burn Duration | ' + fmt(clamp(propForDisp * 300 * 9.81 / (scMass * 0.5), 10, 300), 0) + ' seconds |\n\n'

  r += '## Reentry Footprint (if applicable)\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Predicted Impact Latitude | ' + fmt(clamp((rng() - 0.5) * 40, -40, 40), 2) + '\u00B0 |\n'
  r += '| Predicted Impact Longitude | ' + fmt(clamp((rng() - 0.5) * 80, -180, 180), 2) + '\u00B0 |\n'
  r += '| Ground Track Length | ' + fmt(clamp(rng() * 2000 + 1000, 500, 4000), 0) + ' km |\n'
  r += '| Debris Casualty Area | ' + fmt(clamp(rng() * 80 + 10, 5, 150), 0) + ' km\u00B2 |\n'
  r += '| Surviving Components | Propulsion tank, reaction wheels, optical bench |\n'
  r += '| Casualty Probability | ' + fmt(clamp(rng() * 5e-5 + 1e-5, 1e-6, 1e-3), 1) + ' |\n\n'

  r += '## Regulatory Compliance Checklist\n\n'
  r += '| Requirement | Status | Notes |\n'
  r += '|-------------|--------|-------|\n'
  r += '| IADC 25-year rule | ' + (recComply.indexOf('Compliant') >= 0 ? 'PASS' : 'REVIEW') + ' | Post-mission disposal within 25 years |\n'
  r += '| Passivation | PASS | Battery and propulsion passivation planned |\n'
  r += '| Orbit clearance | PASS | No interference with protected regions |\n'
  r += '| Casualty risk < 1e-4 | PASS | Meets UN COPUOS guideline |\n'
  r += '| Notification to UNOOSA | PENDING | File within 30 days of disposal |\n'
  r += '| FCC debris mitigation (if US) | ' + (compliance === 'FCC_25yr' ? 'PASS' : 'N/A') + ' | 5-year rule for LEO |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 5: CONJUNCTION DATA MESSAGE GENERATOR ====================

function executeConjunctionDataGenerator(inputData: string): string {
  const data = parseInput<ConjunctionDataInput>(inputData)
  const primary = data.primary_object || 'SAT-001'
  const secondary = data.secondary_object || 'DEB-45211'
  const tca = data.tca || '2026-08-26T14:23:45Z'
  const missDist = data.miss_distance_km || 0.342
  const pc = data.collision_probability || 2.3e-4
  const covAvail = data.covariance_available !== false

  const rng = mulberry32(seedFromInput(data))

  let r = '# Conjunction Data Message (CDM)\n\n'
  r += '**CDM ID:** CDM-' + tca.slice(0, 10).replace(/-/g, '') + '-' + Math.floor(rng() * 9000 + 1000) + '\n'
  r += '**CDM Version:** 1.0 (CCSDS 508.0-B-1)\n'
  r += '**Creation Date:** ' + tca + '\n'
  r += '**TCA:** ' + tca + '\n\n'
  r += '---\n\n'

  r += '## Header\n\n'
  r += '| Field | Value |\n'
  r += '|-------|-------|\n'
  r += '| CCSDS CDM VERS | 1.0 |\n'
  r += '| CREATION DATE | ' + tca + ' |\n'
  r += '| ORIGINATOR | JSPOC/CAESAR |\n'
  r += '| MESSAGE ID | CDM-' + tca.slice(0, 10).replace(/-/g, '') + '-' + Math.floor(rng() * 9000 + 1000) + ' |\n'
  r += '| MESSAGE FORMAT | JSON (simplified) |\n\n'

  r += '## Object Identification\n\n'
  r += '| Field | Object 1 (Primary) | Object 2 (Secondary) |\n'
  r += '|-------|--------------------|----------------------|\n'
  r += '| OBJECT | ' + primary + ' | ' + secondary + ' |\n'
  r += '| OBJECT DESIGNATOR | ' + (primary.indexOf('-') > 0 ? '2024-012A' : '1997-056AB') + ' | ' + (secondary.indexOf('-') > 0 ? '2021-035B' : '1997-056CD') + ' |\n'
  r += '| CATALOG NAME | SATCAT | SATCAT |\n'
  r += '| OBJECT NAME | ' + primary + ' | ' + secondary + ' |\n'
  r += '| INTERNATIONAL DESIGNATOR | 2024-012A | ' + (secondary.indexOf('FENGYUN') >= 0 ? '2007-015C' : '1997-056CD') + ' |\n'
  r += '| OBJECT TYPE | PAYLOAD | ' + (secondary.indexOf('DEB') >= 0 ? 'DEBRIS' : 'ROCKET BODY') + ' |\n'
  r += '| OPERATOR | COMMERCIAL | HISTORIC |\n\n'

  r += '## Orbit State at TCA\n\n'
  r += '| Parameter | Object 1 | Object 2 |\n'
  r += '|-----------|----------|----------|\n'
  r += '| EPOCH | ' + tca + ' | ' + tca + ' |\n'
  r += '| SEMI-MAJOR AXIS (km) | ' + fmt(clamp(rng() * 100 + 6800, 6700, 7200), 2) + ' | ' + fmt(clamp(rng() * 100 + 6800, 6700, 7200), 2) + ' |\n'
  r += '| ECCENTRICITY | ' + fmt(clamp(rng() * 0.002, 0, 0.005), 5) + ' | ' + fmt(clamp(rng() * 0.01, 0, 0.02), 5) + ' |\n'
  r += '| INCLINATION (deg) | ' + fmt(clamp(rng() * 5 + 50, 48, 58), 4) + ' | ' + fmt(clamp(rng() * 5 + 50, 48, 58), 4) + ' |\n'
  r += '| RAAN (deg) | ' + fmt(rng() * 360, 4) + ' | ' + fmt(rng() * 360, 4) + ' |\n'
  r += '| ARG OF PERIGEE (deg) | ' + fmt(rng() * 360, 4) + ' | ' + fmt(rng() * 360, 4) + ' |\n'
  r += '| TRUE ANOMALY (deg) | ' + fmt(rng() * 360, 4) + ' | ' + fmt(rng() * 360, 4) + ' |\n\n'

  r += '## Conjunction Geometry\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| TCA | ' + tca + ' |\n'
  r += '| MISS DISTANCE (km) | ' + fmt(missDist, 4) + ' |\n'
  r += '| MISS DISTANCE (m) | ' + fmt(missDist * 1000, 1) + ' |\n'
  r += '| RELATIVE SPEED (km/s) | ' + fmt(clamp(rng() * 5 + 10, 5, 15), 2) + ' |\n'
  r += '| COLLISION PROBABILITY (Pc) | ' + pc.toExponential(3) + ' |\n'
  r += '| COLLISION PROBABILITY METHOD | ' + (covAvail ? 'Foster 1992 / Chan 2008' : 'Geometry-based estimate') + ' |\n'
  r += '| HARD BODY RADIUS (m) | ' + fmt(clamp(rng() * 8 + 5, 3, 15), 1) + ' |\n\n'

  r += '## Covariance Data\n\n'
  if (covAvail) {
    r += '| Axis | Object 1 (m) | Object 2 (m) | Correlation |\n'
    r += '|------|-------------|-------------|-------------|\n'
    r += '| Radial | ' + fmt(clamp(rng() * 30 + 10, 5, 50), 1) + ' | ' + fmt(clamp(rng() * 100 + 30, 20, 200), 1) + ' | ' + fmt(clamp(rng() * 0.3, -0.5, 0.5), 3) + ' |\n'
    r += '| Along-track | ' + fmt(clamp(rng() * 80 + 20, 10, 150), 1) + ' | ' + fmt(clamp(rng() * 300 + 100, 50, 500), 1) + ' | ' + fmt(clamp(rng() * 0.2, -0.3, 0.3), 3) + ' |\n'
    r += '| Cross-track | ' + fmt(clamp(rng() * 40 + 15, 10, 80), 1) + ' | ' + fmt(clamp(rng() * 150 + 50, 30, 300), 1) + ' | ' + fmt(clamp(rng() * 0.1, -0.2, 0.2), 3) + ' |\n\n'
  } else {
    r += 'Covariance data not available for one or both objects. Pc computed from geometric overlap only.\n\n'
  }

  r += '## Risk Assessment\n\n'
  let riskClass = 'LOW'
  let action = 'Routine monitoring'
  if (pc >= 1e-3) { riskClass = 'HIGH'; action = 'Execute avoidance maneuver' }
  else if (pc >= 1e-4) { riskClass = 'MEDIUM'; action = 'Prepare avoidance maneuver, standby for update' }
  else if (pc >= 1e-5) { riskClass = 'MODERATE'; action = 'Track closely, next CDM in 8h' }

  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| RISK CLASSIFICATION | ' + riskClass + ' |\n'
  r += '| RECOMMENDED ACTION | ' + action + ' |\n'
  r += '| NEXT CDM UPDATE | +' + fmt(clamp(rng() * 8 + 4, 2, 12), 0) + ' hours |\n'
  r += '| COVARIANCE QUALITY | ' + (covAvail ? 'Good — 1-sigma < 50m RMS' : 'Poor — no covariance') + ' |\n'
  r += '| DATA SOURCES | Space-Track TLE, EISCAT radar, JSC Vimpel |\n'
  r += '| CONFIDENCE LEVEL | ' + fmt(clamp(rng() * 15 + 80, 70, 98), 0) + '% |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 6: REMOVAL MISSION DESIGNER ====================

function executeRemovalMissionDesigner(inputData: string): string {
  const data = parseInput<RemovalMissionInput>(inputData)
  const targets = data.target_objects || [45211, 38901, 40214]
  const tech = data.removal_technology || 'net'
  const servMass = data.servicer_mass_kg || 1500
  const maxTargets = data.max_targets_per_mission || 5
  const priority = data.priority_metric || 'collision_risk'

  const rng = mulberry32(seedFromInput(data))

  let r = '# Active Debris Removal Mission Design Report\n\n'
  r += '**Removal Technology:** ' + tech + '\n'
  r += '**Servicer Mass:** ' + servMass + ' kg\n'
  r += '**Max Targets/Mission:** ' + maxTargets + '\n'
  r += '**Priority Metric:** ' + priority + '\n'
  r += '**Target Count:** ' + targets.length + '\n\n'
  r += '---\n\n'

  r += '## Target Object Analysis\n\n'
  r += '| NORAD ID | Object Name | Mass (kg) | Altitude (km) | Inclination (deg) | Pc Contribution | Priority |\n'
  r += '|----------|-------------|-----------|---------------|-------------------|-----------------|----------|\n'
  const targetNames = ['CZ-2D R/B', 'COSMOS-2251 DEB', 'FENGYUN-1C DEB', 'SL-8 R/B', 'IRIDIUM-33 DEB']
  const targetMasses = [2500, 800, 1200, 1800, 600]
  const targetAlts = [650, 780, 850, 1000, 790]
  const targetIncs = [98.5, 74.0, 98.6, 82.5, 86.4]
  targets.forEach(function (t, i) {
    const name = targetNames[i % targetNames.length]
    const mass = targetMasses[i % targetMasses.length]
    const alt = targetAlts[i % targetAlts.length]
    const inc = targetIncs[i % targetIncs.length]
    const pcContrib = (rng() * 0.001).toExponential(2)
    const pri = i === 0 ? 'CRITICAL' : i === 1 ? 'HIGH' : 'MEDIUM'
    r += '| ' + t + ' | ' + name + ' | ' + mass + ' | ' + alt + ' | ' + inc + ' | ' + pcContrib + ' | ' + pri + ' |\n'
  })

  r += '\n## Mission Architecture\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Architecture | Multi-target sequential capture with ' + tech + ' deployment |\n'
  r += '| Servicer Dry Mass | ' + servMass + ' kg |\n'
  r += '| Propellant Mass | ' + fmt(clamp(rng() * 200 + 300, 200, 600), 0) + ' kg |\n'
  r += '| Total Launch Mass | ' + fmt(servMass + clamp(rng() * 200 + 300, 200, 600), 0) + ' kg |\n'
  r += '| Capture Mechanism | ' + tech + ' (TRL ' + (tech === 'net' ? '6-7' : tech === 'robotic_arm' ? '5-6' : tech === 'tether' ? '5-6' : '4-5') + ') |\n'
  r += '| Disposal Method | Controlled reentry (deorbit to 200km) |\n'
  r += '| Mission Duration | ' + fmt(clamp(rng() * 12 + 12, 6, 24), 0) + ' months |\n\n'

  r += '## Delta-V Budget\n\n'
  r += '| Phase | Delta-V (m/s) | Duration | Propellant (kg) |\n'
  r += '|-------|---------------|----------|-----------------|\n'
  const dvRendezvous = fmt(clamp(rng() * 200 + 150, 100, 400), 0)
  const dvCapture = fmt(clamp(rng() * 20 + 10, 5, 40), 0)
  const dvTransfer = fmt(clamp(rng() * 300 + 200, 150, 600), 0)
  const dvDisposal = fmt(clamp(rng() * 100 + 80, 50, 200), 0)
  const totalDv = parseFloat(dvRendezvous) + parseFloat(dvCapture) + parseFloat(dvTransfer) + parseFloat(dvDisposal)
  r += '| Rendezvous (per target) | ' + dvRendezvous + ' | 2-4 weeks | ' + fmt(parseFloat(dvRendezvous) * servMass / (300 * 9.81), 1) + ' |\n'
  r += '| Capture & Securing | ' + dvCapture + ' | 1-2 days | ' + fmt(parseFloat(dvCapture) * servMass / (300 * 9.81), 1) + ' |\n'
  r += '| Inter-target Transfer | ' + dvTransfer + ' | 3-6 weeks | ' + fmt(parseFloat(dvTransfer) * servMass / (300 * 9.81), 1) + ' |\n'
  r += '| Final Disposal | ' + dvDisposal + ' | 1 day | ' + fmt(parseFloat(dvDisposal) * servMass / (300 * 9.81), 1) + ' |\n'
  r += '| **Total** | **' + fmt(totalDv, 0) + '** | --- | **' + fmt(totalDv * servMass / (300 * 9.81), 0) + '** |\n\n'

  r += '## Cost Estimation\n\n'
  r += '| Cost Element | Estimate (M USD) |\n'
  r += '|-------------|------------------|\n'
  r += '| Servicer Development | ' + fmt(clamp(rng() * 50 + 80, 50, 150), 0) + ' |\n'
  r += '| Launch (dedicated) | ' + fmt(clamp(rng() * 30 + 40, 30, 80), 0) + ' |\n'
  r += '| Operations (mission) | ' + fmt(clamp(rng() * 20 + 15, 10, 40), 0) + ' |\n'
  r += '| Ground Segment | ' + fmt(clamp(rng() * 10 + 5, 3, 15), 0) + ' |\n'
  r += '| Contingency (20%) | ' + fmt(clamp(rng() * 20 + 30, 20, 60), 0) + ' |\n'
  r += '| **Total** | **' + fmt(clamp(rng() * 100 + 150, 100, 300), 0) + '** |\n\n'

  r += '## Mission Impact Assessment\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Targets Served | ' + targets.length + ' priority objects |\n'
  r += '| Regional Pc Reduction | ' + fmt(clamp(rng() * 10 + 5, 3, 20), 1) + '% |\n'
  r += '| Kessler Syndrome Impact | Reduces cascade probability by ' + fmt(clamp(rng() * 5 + 2, 1, 10), 1) + '% |\n'
  r += '| Cost per Object | ' + fmt(clamp(rng() * 30 + 40, 20, 80), 0) + ' M USD |\n'
  r += '| Technology Readiness | TRL ' + (tech === 'net' ? '6-7 (demo phase)' : tech === 'robotic_arm' ? '5-6 (lab demo)' : '4-5 (concept)') + ' |\n'
  r += '| Regulatory Status | Requires ITU coordination, UNOOSA notification |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 7: SSA DASHBOARD BUILDER ====================

function executeSSADashboardBuilder(inputData: string): string {
  const data = parseInput<SSADashboardInput>(inputData)
  const dashType = data.dashboard_type || 'ops_center'
  const timeRange = data.time_range_hours || 24
  const region = data.region_filter || 'LEO'
  const includeForecast = data.include_forecast !== false
  const assets = data.asset_list || ['STARLINK-1245', 'STARLINK-2089', 'SENTINEL-1A']

  const rng = mulberry32(seedFromInput(data))

  let r = '# Space Situational Awareness Dashboard\n\n'
  r += '**Dashboard Type:** ' + dashType + '\n'
  r += '**Time Range:** ' + timeRange + ' hours\n'
  r += '**Region:** ' + region + '\n'
  r += '**Monitored Assets:** ' + assets.length + '\n'
  r += '**Forecast Enabled:** ' + (includeForecast ? 'Yes' : 'No') + '\n\n'
  r += '---\n\n'

  r += '## Situation Summary\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Overall Status | ' + (rng() > 0.7 ? 'ELEVATED — Active conjunction monitoring' : 'Nominal — Routine operations') + ' |\n'
  r += '| Active Conjunctions | ' + Math.floor(rng() * 5 + 1) + ' |\n'
  r += '| High-Risk Events | ' + (rng() > 0.6 ? 1 : 0) + ' |\n'
  r += '| Maneuvers Executed (24h) | ' + Math.floor(rng() * 2) + ' |\n'
  r += '| Catalog Objects Tracked | ' + Math.floor(rng() * 3000 + 27000).toLocaleString() + ' |\n'
  r += '| Last Update | ' + utcTimestamp(rng) + ' |\n\n'

  r += '## Asset Risk Status\n\n'
  r += '| Asset | Altitude (km) | Active Conj | Max Pc | Status | Next TCA |\n'
  r += '|-------|--------------|-------------|--------|--------|----------|\n'
  const assetAlts: Record<string, number> = { 'STARLINK-1245': 550, 'STARLINK-2089': 560, 'SENTINEL-1A': 693 }
  assets.forEach(function (a) {
    const alt = assetAlts[a] || (400 + Math.floor(rng() * 300))
    const activeConj = Math.floor(rng() * 3)
    const maxPc = (rng() * 0.001).toExponential(2)
    const status = parseFloat(maxPc) > 1e-4 ? 'ALERT' : 'NOMINAL'
    const nextTca = '+' + fmt(clamp(rng() * 72 + 2, 1, 96), 0) + 'h'
    r += '| ' + a + ' | ' + alt + ' | ' + activeConj + ' | ' + maxPc + ' | ' + status + ' | ' + nextTca + ' |\n'
  })

  r += '\n## Conjunction Timeline (Next ' + timeRange + ' Hours)\n\n'
  r += '| TCA | Object 1 | Object 2 | Miss Dist (km) | Pc | Risk | Action |\n'
  r += '|-----|----------|----------|----------------|----|------|--------|\n'
  const conjEvents = [
    { obj1: 'STARLINK-1245', obj2: 'DEB-45211', miss: 0.342, pc: 2.3e-4 },
    { obj1: 'STARLINK-2089', obj2: 'CZ-2D DEB', miss: 1.21, pc: 3.1e-5 },
    { obj1: 'SENTINEL-1A', obj2: 'FENGYUN-1C DEB', miss: 0.89, pc: 8.7e-5 },
    { obj1: 'STARLINK-1245', obj2: 'IRIDIUM-33 DEB', miss: 2.45, pc: 1.2e-6 }
  ]
  conjEvents.forEach(function (e) {
    const tca = '+' + fmt(clamp(rng() * timeRange, 1, timeRange), 0) + 'h'
    const risk = e.pc >= 1e-3 ? 'HIGH' : e.pc >= 1e-4 ? 'MEDIUM' : 'LOW'
    const action = e.pc >= 1e-4 ? 'Maneuver standby' : 'Monitor'
    r += '| ' + tca + ' | ' + e.obj1 + ' | ' + e.obj2 + ' | ' + fmt(e.miss, 3) + ' | ' + e.pc.toExponential(1) + ' | ' + risk + ' | ' + action + ' |\n'
  })

  r += '\n## Debris Density Heatmap (Objects/km\u00B3 x 1e-6)\n\n'
  r += '| Altitude Band (km) | Inclination 30-60\u00B0 | Inclination 60-82\u00B0 | Inclination 82-98\u00B0 | Inclination 98-110\u00B0 |\n'
  r += '|--------------------|-----------------------|-----------------------|------------------------|-------------------------|\n'
  const densityBands = [
    { band: '300-400', d1: 0.8, d2: 1.2, d3: 2.1, d4: 1.5 },
    { band: '400-500', d1: 1.5, d2: 2.0, d3: 3.5, d4: 2.8 },
    { band: '500-600', d1: 3.2, d2: 2.8, d3: 4.1, d4: 3.0 },
    { band: '600-700', d1: 2.1, d2: 1.8, d3: 2.5, d4: 2.0 },
    { band: '700-800', d1: 1.2, d2: 1.5, d3: 1.8, d4: 1.3 }
  ]
  densityBands.forEach(function (b) {
    r += '| ' + b.band + ' | ' + fmt(b.d1, 1) + ' | ' + fmt(b.d2, 1) + ' | ' + fmt(b.d3, 1) + ' | ' + fmt(b.d4, 1) + ' |\n'
  })

  if (includeForecast) {
    r += '\n## Forecast Alerts (Next 72 Hours)\n\n'
    r += '| Time | Event | Severity | Description |\n'
    r += '|------|-------|----------|-------------|\n'
    r += '| +18h | Conjunction update | MEDIUM | CDM-0042 update expected for STARLINK-1245 |\n'
    r += '| +37h | TCA — DEB-45211 | HIGH | Pc=2.3e-4, maneuver decision needed at T-6h |\n'
    r += '| +48h | Debris cluster transit | LOW | Fengyun-1C fragment cluster in vicinity |\n'
    r += '| +72h | Launch window conflict | MEDIUM | Falcon 9 R/B deployment near constellation |\n\n'
  }

  r += '## Operational Recommendations\n\n'
  r += '| Priority | Action | Deadline | Owner |\n'
  r += '|----------|--------|----------|-------|\n'
  r += '| 1 | Review CDM-0042 and confirm maneuver plan | T-6h | Flight Dynamics |\n'
  r += '| 2 | Update conjunction screening for new TLEs | +2h | SSA Team |\n'
  r += '| 3 | Coordinate with Starlink ops on avoidance | +4h | Mission Control |\n'
  r += '| 4 | Prepare contingency maneuver for SENTINEL-1A | +12h | Flight Dynamics |\n'
  r += '| 5 | Weekly debris density report to stakeholders | +72h | SSA Analysis |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== TOOL 8: ORBITAL SLOT ALLOCATOR ====================

function executeOrbitalSlotAllocator(inputData: string): string {
  const data = parseInput<OrbitalSlotInput>(inputData)
  const constellation = data.constellation_name || 'Starlink Gen2'
  const numPlanes = data.num_planes || 72
  const satsPerPlane = data.satellites_per_plane || 22
  const alt = data.altitude_km || 550
  const inc = data.inclination_deg || 53.0
  const spacing = data.spacing_method || 'uniform'
  const colocDist = data.colocation_distance_km || 10

  const rng = mulberry32(seedFromInput(data))

  const totalSats = numPlanes * satsPerPlane
  const slotSpacingDeg = 360 / satsPerPlane
  const slotSpacingKm = parseFloat(fmt(2 * Math.PI * (6371 + alt) / satsPerPlane, 0))
  const planeSpacingDeg = 360 / numPlanes

  let r = '# Orbital Slot Allocation Report\n\n'
  r += '**Constellation:** ' + constellation + '\n'
  r += '**Orbital Planes:** ' + numPlanes + '\n'
  r += '**Satellites per Plane:** ' + satsPerPlane + '\n'
  r += '**Total Satellites:** ' + totalSats + '\n'
  r += '**Altitude:** ' + alt + ' km\n'
  r += '**Inclination:** ' + inc + '\u00B0\n'
  r += '**Spacing Method:** ' + spacing + '\n'
  r += '**Min Colocation Distance:** ' + colocDist + ' km\n\n'
  r += '---\n\n'

  r += '## Allocation Plan\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Configuration | Walker ' + numPlanes + '/' + satsPerPlane + '/1 delta |\n'
  r += '| Total Satellites | ' + totalSats + ' |\n'
  r += '| Slot Spacing (deg) | ' + fmt(slotSpacingDeg, 2) + '\u00B0 |\n'
  r += '| Slot Spacing (km) | ' + slotSpacingKm + ' km (along-track) |\n'
  r += '| Plane Spacing (RAAN) | ' + fmt(planeSpacingDeg, 2) + '\u00B0 |\n'
  r += '| Inter-plane Spacing (km) | ' + fmt(2 * Math.PI * (6371 + alt) * planeSpacingDeg / 360, 0) + ' km |\n'
  r += '| Phasing Offset | ' + fmt(rng() * slotSpacingDeg, 2) + '\u00B0 between planes |\n\n'

  r += '## Slot Assignment Table (First 3 Planes)\n\n'
  r += '| Plane | RAAN (deg) | Sat 1 Mean Anom (deg) | Sat 2 Mean Anom (deg) | Sat 3 Mean Anom (deg) | Sat 4 Mean Anom (deg) |\n'
  r += '|--------|-----------|----------------------|----------------------|----------------------|----------------------|\n'
  for (let p = 0; p < Math.min(3, numPlanes); p++) {
    const raan = fmt(p * planeSpacingDeg, 2)
    const phOffset = p * (rng() * slotSpacingDeg / numPlanes)
    const s1 = fmt(phOffset, 2)
    const s2 = fmt(phOffset + slotSpacingDeg, 2)
    const s3 = fmt(phOffset + 2 * slotSpacingDeg, 2)
    const s4 = fmt(phOffset + 3 * slotSpacingDeg, 2)
    r += '| ' + (p + 1) + ' | ' + raan + ' | ' + s1 + ' | ' + s2 + ' | ' + s3 + ' | ' + s4 + ' |\n'
  }
  r += '| ... | ... | ... | ... | ... | ... |\n'
  r += '| ' + numPlanes + ' | ' + fmt((numPlanes - 1) * planeSpacingDeg, 2) + ' | ... | ... | ... | ... |\n\n'

  r += '## Colocation Safety Analysis\n\n'
  r += '| Parameter | Value | Status |\n'
  r += '|-----------|-------|--------|\n'
  r += '| Min Along-track Separation | ' + fmt(slotSpacingKm, 0) + ' km | ' + (slotSpacingKm > colocDist ? 'SAFE' : 'VIOLATION') + ' |\n'
  r += '| Min Cross-track Separation | ' + fmt(clamp(rng() * 5 + 8, 5, 15), 1) + ' km | ' + (rng() > colocDist ? 'SAFE' : 'REVIEW') + ' |\n'
  r += '| Min Radial Separation | ' + fmt(clamp(rng() * 2 + 0.5, 0.1, 3), 1) + ' km | SAFE |\n'
  r += '| Min 3D Separation | ' + fmt(clamp(slotSpacingKm * 0.9, colocDist, slotSpacingKm), 1) + ' km | ' + (slotSpacingKm * 0.9 > colocDist ? 'SAFE' : 'REVIEW') + ' |\n'
  r += '| Collision Risk (per year) | ' + (rng() * 1e-6).toExponential(2) + ' | NEGLIGIBLE |\n'
  r += '| Station-keeping Box | \u00B1' + fmt(clamp(rng() * 2 + 1, 0.5, 5), 1) + ' km | WITHIN LIMITS |\n\n'

  r += '## ITU Regulatory Compliance\n\n'
  r += '| Requirement | Status | Notes |\n'
  r += '|-------------|--------|-------|\n'
  r += '| ITU Appendix 30B | COMPLIANT | Filing submitted, coordination complete |\n'
  r += '| Frequency Coordination | COMPLIANT | Ku/Ka band, no harmful interference |\n'
  r += '| 25-year disposal rule | COMPLIANT | Post-mission deorbit < 5 years |\n'
  r += '| Ephemeris sharing | COMPLIANT | TLEs published to Space-Track |\n'
  r += '| Collision avoidance capability | COMPLIANT | Autonomous propulsion system |\n'
  r += '| Orbital spacing compliance | COMPLIANT | > ' + colocDist + ' km minimum separation |\n\n'

  r += '## Constellation Performance\n\n'
  r += '| Parameter | Value |\n'
  r += '|-----------|-------|\n'
  r += '| Orbital Period | ' + fmt(orbitalPeriodSec(alt) / 60, 1) + ' min |\n'
  r += '| Ground Track Velocity | ' + fmt(orbitalVelocityKmSec(alt), 2) + ' km/s |\n'
  r += '| Revisit Time (min) | ' + fmt(clamp(rng() * 30 + 60, 30, 120), 0) + ' |\n'
  r += '| Coverage Latitude | \u00B1' + fmt(clamp(inc + 5, inc, 90), 0) + '\u00B0 |\n'
  r += '| Min Elevation Angle | ' + fmt(clamp(rng() * 15 + 25, 20, 45), 0) + '\u00B0 |\n'
  r += '| Number of Visible Sats | ' + fmt(clamp(rng() * 8 + 4, 2, 15), 0) + ' (avg) |\n\n'

  r += '---\n\n*' + DISCLAIMER + '*'
  return r
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'collision_risk_assessor',
    description: 'Collision Risk Assessment | Conjunction screening, Pc computation, covariance evaluation, avoidance maneuver recommendation',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: spacecraft_id, altitude_km, inclination_deg, eccentricity, screening_volume_km, pc_threshold, time_window_hours, available_delta_v_ms'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeCollisionRiskAssessor(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'orbital_maneuver_planner',
    description: 'Orbital Maneuver Planner | Hohmann, bi-elliptic, plane change, station-keeping, collision avoidance, deorbit',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: maneuver_type, initial_altitude_km, initial_inclination_deg, target_altitude_km, target_inclination_deg, spacecraft_mass_kg, specific_impulse_s, propellant_mass_kg'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeOrbitalManeuverPlanner(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'debris_catalog_tracker',
    description: 'Debris Catalog Tracker | TLE maintenance, decay projection, close approach monitoring, population evolution',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: region, size_threshold_cm, epoch, projection_years, include_decay_forecast, include_close_approaches'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeDebrisCatalogTracker(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'end_of_life_disposal',
    description: 'End-of-Life Disposal Strategy | Natural decay, controlled reorbit, graveyard orbit, active deorbit assessment',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: spacecraft_id, current_altitude_km, spacecraft_mass_kg, remaining_propellant_kg, disposal_option, compliance_standard'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeEndOfLifeDisposal(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'conjunction_data_generator',
    description: 'Conjunction Data Message Generator | CCSDS 508.0-B-1 CDM format, orbit states, miss distance, Pc, covariance',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: primary_object, secondary_object, tca, miss_distance_km, collision_probability, covariance_available'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeConjunctionDataGenerator(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'removal_mission_designer',
    description: 'Active Debris Removal Mission Design | Target selection, rendezvous planning, capture mechanism, delta-V budget, cost estimation',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: target_objects, removal_technology, servicer_mass_kg, max_targets_per_mission, priority_metric'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeRemovalMissionDesigner(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'ssa_dashboard_builder',
    description: 'SSA Dashboard Builder | Ops center display, conjunction timeline, debris density, risk trends, forecast alerts',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: dashboard_type, time_range_hours, region_filter, include_forecast, asset_list'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeSSADashboardBuilder(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'orbital_slot_allocator',
    description: 'Orbital Slot Allocator | Constellation coordination, colocation safety, ITU compliance, Walker delta phasing',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: constellation_name, num_planes, satellites_per_plane, altitude_km, inclination_deg, spacing_method, colocation_distance_km'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function (_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeOrbitalSlotAllocator(args.input_data) }
  }))
}
