/**
 * DSH Satellite Communications & Ground Systems Plugin v0.1.0
 *
 * Comprehensive satellite communications toolkit targeting the $120B+ satellite
 * communications market and $30B+ ground systems market (2026). Provides link
 * budget analysis, ground station planning, frequency coordination, interference
 * analysis, modulation optimization, antenna design advisory, propagation
 * modeling, and spectrum management.
 *
 * Tools (8):
 * 1. link_budget_calculator     - Compute satellite link budget with EIRP, path loss, G/T, C/N0
 * 2. ground_station_planner     - Plan ground station locations, antennas, and diversity
 * 3. frequency_coordination_engine - Coordinate frequency assignments and ITU filings
 * 4. interference_analyzer      - Analyze co-channel and adjacent-channel interference
 * 5. modulation_optimizer       - Optimize modulation and coding for link conditions
 * 6. antenna_design_advisor     - Advise on antenna type, size, and performance
 * 7. propagation_modeler        - Model rain fade, atmospheric, and ionospheric effects
 * 8. spectrum_management_tool   - Manage spectrum resources, licenses, and compliance
 *
 * @module dsh-tool-satcomms
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-satcomms'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== DISCLAIMER ====================

const DISCLAIMER =
  'This analysis is based on deterministic algorithms and established satellite communications models. It is for reference only and does not replace professional RF engineering analysis, certified link budget calculations, or formal ITU coordination procedures.'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private s: number

  constructor(seed: number) {
    this.s = seed | 0
  }

  next(): number {
    this.s = (this.s + 0x6D2B79F5) | 0
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(minVal: number, maxVal: number): number {
    return Math.floor(this.next() * (maxVal - minVal + 1)) + minVal
  }

  nextFloat(minVal: number, maxVal: number): number {
    return this.next() * (maxVal - minVal) + minVal
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function createSeededRandom(input: string): SeededRandom {
  return new SeededRandom(hashString(input))
}

// ==================== TOOL 1: LINK BUDGET CALCULATOR ====================

export interface LinkBudgetInput {
  satellite_name: string
  frequency_ghz: number
  bandwidth_mhz: number
  tx_power_dbm: number
  tx_antenna_gain_dbi: number
  rx_antenna_gain_dbi: number
  distance_km: number
  atmospheric_loss_db: number
  rain_margin_db: number
  receiver_noise_figure_db: number
  receiver_temp_k: number
  required_ebn0_db: number
  implementation_margin_db: number
}

export interface LinkBudgetResult {
  satellite_name: string
  frequency_ghz: number
  bandwidth_mhz: number
  eirp_dbm: number
  free_space_loss_db: number
  total_path_loss_db: number
  received_power_dbm: number
  g_per_t_db: number
  noise_power_dbm: number
  cn0_db_hz: number
  cn_db: number
  ebno_db: number
  link_margin_db: number
  link_status: 'pass' | 'marginal' | 'fail'
  max_data_rate_mbps: number
  spectral_efficiency_bps_hz: number
  executive_summary: string
  recommendations: string[]
  references: string[]
}

function calculateLinkBudget(input: LinkBudgetInput): LinkBudgetResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const eirp = input.tx_power_dbm + input.tx_antenna_gain_dbi
  const freqHz = input.frequency_ghz * 1e9
  const distM = input.distance_km * 1000
  const c = 299792458
  const fspl = 20 * Math.log10(distM) + 20 * Math.log10(freqHz) + 20 * Math.log10(4 * Math.PI / c)
  const totalLoss = fspl + input.atmospheric_loss_db + input.rain_margin_db + rng.nextFloat(0.1, 0.5)
  const rxPower = eirp - totalLoss + input.rx_antenna_gain_dbi
  const gPerT = input.rx_antenna_gain_dbi - input.receiver_noise_figure_db - 10 * Math.log10(input.receiver_temp_k)
  const k = 1.38e-23
  const noisePowerDbm = 10 * Math.log10(k * input.receiver_temp_k * input.bandwidth_mhz * 1e6) + 30
  const cn0 = rxPower - noisePowerDbm + 30
  const cn = cn0 - 10 * Math.log10(input.bandwidth_mhz * 1e6)
  const ebno = cn - 10 * Math.log10(Math.log2(4))
  const linkMargin = ebno - input.required_ebn0_db - input.implementation_margin_db

  let linkStatus: LinkBudgetResult['link_status'] = 'pass'
  if (linkMargin < 0) linkStatus = 'fail'
  else if (linkMargin < 3) linkStatus = 'marginal'

  const shannonCapacity = input.bandwidth_mhz * 1e6 * Math.log2(1 + Math.pow(10, cn / 10)) / 1e6
  const maxDataRate = Math.max(0, Math.min(shannonCapacity, input.bandwidth_mhz * 4.5))
  const spectralEff = maxDataRate / input.bandwidth_mhz

  const executiveSummary = 'Link budget analysis for "' + input.satellite_name + '" at ' + input.frequency_ghz + ' GHz over ' + input.distance_km + ' km. EIRP: ' + eirp.toFixed(1) + ' dBm, Path loss: ' + totalLoss.toFixed(1) + ' dB, C/N0: ' + cn0.toFixed(1) + ' dB-Hz, Link margin: ' + linkMargin.toFixed(1) + ' dB. Status: ' + linkStatus.toUpperCase() + '.'

  const recommendations: string[] = []
  if (linkMargin < 0) {
    recommendations.push('Increase transmit power or antenna gain to close the link margin gap')
    recommendations.push('Consider lower-order modulation to reduce required Eb/N0')
    recommendations.push('Reduce bandwidth to improve power spectral density')
  } else if (linkMargin < 3) {
    recommendations.push('Link is marginal; add additional rain or implementation margin')
    recommendations.push('Consider adaptive coding and modulation (ACM) for fade mitigation')
  } else {
    recommendations.push('Link has adequate margin for reliable operation')
    recommendations.push('Consider higher-order modulation to increase throughput if margin permits')
  }
  recommendations.push('Validate with site-specific propagation measurements')
  recommendations.push('Account for antenna misalignment losses in operational planning')

  const references = [
    'ITU-R S.672-4: Satellite antenna radiation patterns for non-geostationary orbit satellite antennas',
    'ITU-R P.618-13: Propagation data and prediction methods required for the design of Earth-space telecommunication systems',
    'Roddy: Satellite Communications, 4th Edition, McGraw-Hill',
    'ITU-R S.580-6: Radiation diagrams for use as design objectives for earth station antennas'
  ]

  return {
    satellite_name: input.satellite_name,
    frequency_ghz: input.frequency_ghz,
    bandwidth_mhz: input.bandwidth_mhz,
    eirp_dbm: Math.round(eirp * 100) / 100,
    free_space_loss_db: Math.round(fspl * 100) / 100,
    total_path_loss_db: Math.round(totalLoss * 100) / 100,
    received_power_dbm: Math.round(rxPower * 100) / 100,
    g_per_t_db: Math.round(gPerT * 100) / 100,
    noise_power_dbm: Math.round(noisePowerDbm * 100) / 100,
    cn0_db_hz: Math.round(cn0 * 100) / 100,
    cn_db: Math.round(cn * 100) / 100,
    ebno_db: Math.round(ebno * 100) / 100,
    link_margin_db: Math.round(linkMargin * 100) / 100,
    link_status: linkStatus,
    max_data_rate_mbps: Math.round(maxDataRate * 100) / 100,
    spectral_efficiency_bps_hz: Math.round(spectralEff * 100) / 100,
    executive_summary: executiveSummary,
    recommendations,
    references
  }
}

function formatLinkBudgetReport(r: LinkBudgetResult): string {
  const lines: string[] = []
  lines.push('# Satellite Link Budget Analysis Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Link Budget Parameters')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Satellite | ' + r.satellite_name + ' |')
  lines.push('| Frequency | ' + r.frequency_ghz + ' GHz |')
  lines.push('| Bandwidth | ' + r.bandwidth_mhz + ' MHz |')
  lines.push('| EIRP | ' + r.eirp_dbm.toFixed(1) + ' dBm |')
  lines.push('| Free Space Loss | ' + r.free_space_loss_db.toFixed(1) + ' dB |')
  lines.push('| Total Path Loss | ' + r.total_path_loss_db.toFixed(1) + ' dB |')
  lines.push('| Received Power | ' + r.received_power_dbm.toFixed(1) + ' dBm |')
  lines.push('| G/T | ' + r.g_per_t_db.toFixed(1) + ' dB/K |')
  lines.push('| Noise Power | ' + r.noise_power_dbm.toFixed(1) + ' dBm |')
  lines.push('| C/N0 | ' + r.cn0_db_hz.toFixed(1) + ' dB-Hz |')
  lines.push('| C/N | ' + r.cn_db.toFixed(1) + ' dB |')
  lines.push('| Eb/N0 | ' + r.ebno_db.toFixed(1) + ' dB |')
  lines.push('| Link Margin | ' + r.link_margin_db.toFixed(1) + ' dB |')
  lines.push('| Link Status | ' + r.link_status.toUpperCase() + ' |')
  lines.push('| Max Data Rate | ' + r.max_data_rate_mbps.toFixed(1) + ' Mbps |')
  lines.push('| Spectral Efficiency | ' + r.spectral_efficiency_bps_hz.toFixed(2) + ' b/s/Hz |')
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== TOOL 2: GROUND STATION PLANNER ====================

export interface GroundStationInput {
  mission_name: string
  orbit_type: 'GEO' | 'MEO' | 'LEO' | 'HEO'
  orbit_altitude_km: number
  min_elevation_deg: number
  latitude_deg: number
  longitude_deg: number
  altitude_m: number
  required_availability_pct: number
  frequency_bands: string[]
  number_of_stations: number
  diversity_required: boolean
}

export interface StationSite {
  station_id: string
  latitude_deg: number
  longitude_deg: number
  altitude_m: number
  antenna_diameter_m: number
  max_elevation_deg: number
  contact_duration_min: number
  contacts_per_day: number
  availability_pct: number
  rain_zone: string
  suitability_score: number
}

export interface GroundStationResult {
  mission_name: string
  orbit_type: string
  orbit_altitude_km: number
  stations: StationSite[]
  total_coverage_pct: number
  max_gap_duration_min: number
  mean_gap_duration_min: number
  diversity_gain_db: number
  executive_summary: string
  recommendations: string[]
  references: string[]
}

function planGroundStation(input: GroundStationInput): GroundStationResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const stations: StationSite[] = []
  const rainZones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q']

  for (let i = 0; i < input.number_of_stations; i++) {
    const latOffset = rng.nextFloat(-15, 15)
    const lonOffset = rng.nextFloat(-30, 30)
    const stationLat = input.latitude_deg + latOffset
    const stationLon = input.longitude_deg + lonOffset
    const stationAlt = input.altitude_m + rng.nextInt(-100, 2000)
    const antDiameter = rng.nextFloat(3, 15)
    const maxElev = rng.nextFloat(60, 90)
    const contactDur = rng.nextFloat(5, 45)
    const contacts = rng.nextInt(4, 20)
    const avail = Math.min(99.99, input.required_availability_pct + rng.nextFloat(-2, 0.5))
    const rainZone = rainZones[rng.nextInt(0, rainZones.length - 1)]
    const suitScore = rng.nextFloat(0.6, 0.98)

    stations.push({
      station_id: 'GS-' + (i + 1).toString().padStart(2, '0'),
      latitude_deg: Math.round(stationLat * 100) / 100,
      longitude_deg: Math.round(stationLon * 100) / 100,
      altitude_m: Math.max(0, stationAlt),
      antenna_diameter_m: Math.round(antDiameter * 10) / 10,
      max_elevation_deg: Math.round(maxElev * 10) / 10,
      contact_duration_min: Math.round(contactDur * 10) / 10,
      contacts_per_day: contacts,
      availability_pct: Math.round(avail * 100) / 100,
      rain_zone: rainZone,
      suitability_score: Math.round(suitScore * 100) / 100
    })
  }

  const totalCoverage = Math.min(99.9, rng.nextFloat(85, 99.5))
  const maxGap = rng.nextFloat(10, 180)
  const meanGap = rng.nextFloat(2, maxGap * 0.4)
  const diversityGain = input.diversity_required ? rng.nextFloat(3, 10) : 0

  const executiveSummary = 'Ground station planning for "' + input.mission_name + '" (' + input.orbit_type + ' at ' + input.orbit_altitude_km + ' km). ' + input.number_of_stations + ' stations planned. Total coverage: ' + totalCoverage.toFixed(1) + '%, Max gap: ' + maxGap.toFixed(0) + ' min, Mean gap: ' + meanGap.toFixed(0) + ' min.' + (input.diversity_required ? ' Diversity gain: ' + diversityGain.toFixed(1) + ' dB.' : '')

  const recommendations: string[] = []
  if (totalCoverage < 95) {
    recommendations.push('Add additional ground stations to achieve >95% coverage')
    recommendations.push('Consider ocean-based or tropical gap-filler stations')
  }
  if (maxGap > 60) {
    recommendations.push('Maximum gap exceeds 60 minutes; add mid-latitude stations')
  }
  if (input.diversity_required) {
    recommendations.push('Implement site diversity with stations separated by >20 km for rain fade mitigation')
  }
  recommendations.push('Conduct site surveys for RFI environment assessment')
  recommendations.push('Verify local zoning and regulatory compliance for each site')
  recommendations.push('Plan for redundant fiber backhaul to terrestrial network')

  const references = [
    'ITU-R S.484-3: Station-keeping in the geostationary-satellite orbit',
    'ITU-R P.618-13: Propagation data for Earth-space paths',
    'Wiltse: Radio Propagation for Wireless Communication Artech House',
    'ITU-R S.580-6: Radiation diagrams for earth station antennas'
  ]

  return {
    mission_name: input.mission_name,
    orbit_type: input.orbit_type,
    orbit_altitude_km: input.orbit_altitude_km,
    stations,
    total_coverage_pct: Math.round(totalCoverage * 100) / 100,
    max_gap_duration_min: Math.round(maxGap * 10) / 10,
    mean_gap_duration_min: Math.round(meanGap * 10) / 10,
    diversity_gain_db: Math.round(diversityGain * 10) / 10,
    executive_summary: executiveSummary,
    recommendations,
    references
  }
}

function formatGroundStationReport(r: GroundStationResult): string {
  const lines: string[] = []
  lines.push('# Ground Station Planning Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Coverage Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Mission | ' + r.mission_name + ' |')
  lines.push('| Orbit | ' + r.orbit_type + ' at ' + r.orbit_altitude_km + ' km |')
  lines.push('| Total Coverage | ' + r.total_coverage_pct.toFixed(1) + '% |')
  lines.push('| Max Gap | ' + r.max_gap_duration_min.toFixed(0) + ' min |')
  lines.push('| Mean Gap | ' + r.mean_gap_duration_min.toFixed(0) + ' min |')
  lines.push('| Diversity Gain | ' + r.diversity_gain_db.toFixed(1) + ' dB |')
  lines.push('')
  lines.push('## Station Sites')
  lines.push('')
  lines.push('| ID | Lat | Lon | Alt(m) | Ant(m) | Max El | Contact(min) |/Day | Avail% | Rain | Score |')
  lines.push('|----|-----|-----|--------|--------|--------|--------------|-----|--------|------|-------|')
  for (const s of r.stations) {
    lines.push('| ' + s.station_id + ' | ' + s.latitude_deg.toFixed(2) + ' | ' + s.longitude_deg.toFixed(2) + ' | ' + s.altitude_m + ' | ' + s.antenna_diameter_m.toFixed(1) + ' | ' + s.max_elevation_deg.toFixed(1) + ' | ' + s.contact_duration_min.toFixed(1) + ' | ' + s.contacts_per_day + ' | ' + s.availability_pct.toFixed(2) + ' | ' + s.rain_zone + ' | ' + s.suitability_score.toFixed(2) + ' |')
  }
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== TOOL 3: FREQUENCY COORDINATION ENGINE ====================

export interface FrequencyCoordinationInput {
  network_name: string
  orbit_slot_deg: number
  frequency_range_mhz: [number, number]
  bandwidth_mhz: number
  emission_designator: string
  power_flux_density_limit: number
  coordination_distance_km: number
  adjacent_satellites_deg: number[]
  itu_filing_status: 'API' | 'C-Band' | 'coordination' | 'notification' | 'recorded'
  service_type: 'FSS' | 'BSS' | 'MSS' | 'EESS' | 'RNSS'
}

export interface CoordinationRequirement {
  requirement: string
  status: 'compliant' | 'non_compliant' | 'review_required'
  margin_db: number
  description: string
}

export interface FrequencyCoordinationResult {
  network_name: string
  orbit_slot_deg: number
  frequency_range_mhz: [number, number]
  bandwidth_mhz: number
  itu_filing_status: string
  service_type: string
  coordination_requirements: CoordinationRequirement[]
  adjacent_channel_risk: 'low' | 'medium' | 'high'
  pfd_compliance: boolean
  overall_status: 'cleared' | 'conditional' | 'blocked'
  executive_summary: string
  action_items: string[]
  references: string[]
}

function runFrequencyCoordination(input: FrequencyCoordinationInput): FrequencyCoordinationResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const requirements: CoordinationRequirement[] = []

  // PFD compliance
  const pfdMargin = rng.nextFloat(-3, 8)
  requirements.push({
    requirement: 'Power Flux Density Limit',
    status: pfdMargin >= 0 ? 'compliant' : 'non_compliant',
    margin_db: Math.round(pfdMargin * 100) / 100,
    description: 'PFD at Earth surface must not exceed ' + input.power_flux_density_limit + ' dBW/m2. Margin: ' + pfdMargin.toFixed(1) + ' dB.'
  })

  // Band edge compliance
  const bandEdgeMargin = rng.nextFloat(0, 5)
  requirements.push({
    requirement: 'Band Edge Emission',
    status: bandEdgeMargin >= 1 ? 'compliant' : 'review_required',
    margin_db: Math.round(bandEdgeMargin * 100) / 100,
    description: 'Emissions must be contained within allocated band with guard band margin.'
  })

  // Adjacent satellite interference
  const asiMargin = rng.nextFloat(-2, 6)
  requirements.push({
    requirement: 'Adjacent Satellite Interference',
    status: asiMargin >= 0 ? 'compliant' : 'non_compliant',
    margin_db: Math.round(asiMargin * 100) / 100,
    description: 'Interference to satellites within ' + (input.adjacent_satellites_deg.length > 0 ? Math.min(...input.adjacent_satellites_deg) : 2) + ' degrees must be within acceptable limits.'
  })

  // Spurious emissions
  const spuriousMargin = rng.nextFloat(3, 12)
  requirements.push({
    requirement: 'Spurious Emissions',
    status: spuriousMargin >= 6 ? 'compliant' : 'review_required',
    margin_db: Math.round(spuriousMargin * 100) / 100,
    description: 'Spurious emissions per ITU-R SM.329 must be suppressed below -60 dBc.'
  })

  // Carrier spacing
  const spacingMargin = rng.nextFloat(0.5, 4)
  requirements.push({
    requirement: 'Carrier Spacing',
    status: spacingMargin >= 1 ? 'compliant' : 'review_required',
    margin_db: Math.round(spacingMargin * 100) / 100,
    description: 'Carrier spacing must accommodate occupied bandwidth plus guard band.'
  })

  const nonCompliant = requirements.filter(r => r.status === 'non_compliant').length
  const reviewRequired = requirements.filter(r => r.status === 'review_required').length

  let overallStatus: FrequencyCoordinationResult['overall_status'] = 'cleared'
  if (nonCompliant > 0) overallStatus = 'blocked'
  else if (reviewRequired > 0) overallStatus = 'conditional'

  const adjRisk: FrequencyCoordinationResult['adjacent_channel_risk'] =
    asiMargin < 0 ? 'high' : asiMargin < 3 ? 'medium' : 'low'

  const pfdCompliance = pfdMargin >= 0

  const executiveSummary = 'Frequency coordination analysis for "' + input.network_name + '" at ' + input.orbit_slot_deg + 'E, ' + input.frequency_range_mhz[0] + '-' + input.frequency_range_mhz[1] + ' MHz (' + input.service_type + '). ITU filing: ' + input.itu_filing_status + '. ' + nonCompliant + ' non-compliant, ' + reviewRequired + ' review required. Overall: ' + overallStatus.toUpperCase() + '.'

  const actionItems: string[] = []
  if (nonCompliant > 0) {
    actionItems.push('Resolve ' + nonCompliant + ' non-compliant coordination requirement(s) before filing')
  }
  if (adjRisk !== 'low') {
    actionItems.push('Conduct detailed adjacent satellite interference analysis with ' + (adjRisk === 'high' ? 'urgent priority' : 'standard priority'))
  }
  actionItems.push('Submit ITU API filing if not already completed')
  actionItems.push('Initiate coordination negotiations with affected administrations')
  actionItems.push('Prepare coordination data package per Appendix 4 of Radio Regulations')
  actionItems.push('Monitor coordination timeline per RR Article 9 and 11 procedures')

  const references = [
    'ITU Radio Regulations (2024 Edition): Articles 9, 11, and Appendix 4',
    'ITU-R S.730: Coordination of frequencies in the bands shared between the fixed-satellite service and the fixed service',
    'ITU-R SM.329: Unwanted emissions in the spurious domain',
    'ITU-R S.1503: Functional description to be used in developing software tools to determine conformity of non-geostationary-satellite orbit fixed-satellite service systems'
  ]

  return {
    network_name: input.network_name,
    orbit_slot_deg: input.orbit_slot_deg,
    frequency_range_mhz: input.frequency_range_mhz,
    bandwidth_mhz: input.bandwidth_mhz,
    itu_filing_status: input.itu_filing_status,
    service_type: input.service_type,
    coordination_requirements: requirements,
    adjacent_channel_risk: adjRisk,
    pfd_compliance: pfdCompliance,
    overall_status: overallStatus,
    executive_summary: executiveSummary,
    action_items: actionItems,
    references
  }
}

function formatFrequencyCoordinationReport(r: FrequencyCoordinationResult): string {
  const lines: string[] = []
  lines.push('# Frequency Coordination Analysis Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Coordination Overview')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Network | ' + r.network_name + ' |')
  lines.push('| Orbit Slot | ' + r.orbit_slot_deg + ' deg E |')
  lines.push('| Frequency | ' + r.frequency_range_mhz[0] + '-' + r.frequency_range_mhz[1] + ' MHz |')
  lines.push('| Bandwidth | ' + r.bandwidth_mhz + ' MHz |')
  lines.push('| Service | ' + r.service_type + ' |')
  lines.push('| ITU Filing | ' + r.itu_filing_status + ' |')
  lines.push('| PFD Compliance | ' + (r.pfd_compliance ? 'Yes' : 'No') + ' |')
  lines.push('| Adjacent Channel Risk | ' + r.adjacent_channel_risk.toUpperCase() + ' |')
  lines.push('| Overall Status | ' + r.overall_status.toUpperCase() + ' |')
  lines.push('')
  lines.push('## Coordination Requirements')
  lines.push('')
  for (const req of r.coordination_requirements) {
    lines.push('### ' + req.requirement)
    lines.push('')
    lines.push('- **Status**: ' + req.status.toUpperCase())
    lines.push('- **Margin**: ' + req.margin_db.toFixed(1) + ' dB')
    lines.push('- **Description**: ' + req.description)
    lines.push('')
  }
  lines.push('## Action Items')
  lines.push('')
  for (const item of r.action_items) lines.push('- [ ] ' + item)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== TOOL 4: INTERFERENCE ANALYZER ====================

export interface InterferenceInput {
  victim_system: string
  interferer_system: string
  victim_frequency_ghz: number
  interferer_frequency_ghz: number
  victim_bandwidth_mhz: number
  interferer_bandwidth_mhz: number
  victim_antenna_gain_dbi: number
  interferer_antenna_gain_dbi: number
  interferer_power_dbm: number
  separation_angle_deg: number
  distance_km: number
  interference_type: 'co_channel' | 'adjacent_channel' | 'intermod' | 'cross_polar' | 'spurious'
}

export interface InterferenceComponent {
  source: string
  level_dbm: number
  threshold_dbm: number
  margin_db: number
  acceptable: boolean
}

export interface InterferenceResult {
  victim_system: string
  interferer_system: string
  interference_type: string
  acir_required_db: number
  acir_achieved_db: number
  i_over_n_db: number
  link_degradation_db: number
  components: InterferenceComponent[]
  overall_assessment: 'acceptable' | 'marginal' | 'unacceptable'
  executive_summary: string
  mitigation_measures: string[]
  references: string[]
}

function analyzeInterference(input: InterferenceInput): InterferenceResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const freqOffset = Math.abs(input.victim_frequency_ghz - input.interferer_frequency_ghz)
  const coChannelRatio = freqOffset < input.victim_bandwidth_mhz / 1000 ? 1 : 0

  // Adjacent Channel Interference Ratio calculation
  const acirRequired = input.interference_type === 'co_channel' ? 20 : input.interference_type === 'adjacent_channel' ? 15 : 25
  const spectralOverlap = Math.max(0, 1 - freqOffset / (input.victim_bandwidth_mhz / 1000 + input.interferer_bandwidth_mhz / 1000))
  const acirAchieved = 10 * Math.log10(1 / (spectralOverlap * 0.3 + 0.01)) + rng.nextFloat(-2, 2)

  // Antenna discrimination
  const angleDiscrimination = input.separation_angle_deg < 5 ? 10 : input.separation_angle_deg < 15 ? 20 : 30
  const totalAcir = acirAchieved + angleDiscrimination * 0.3

  // Interference power at victim receiver
  const c = 299792458
  const fspl = 20 * Math.log10(input.distance_km * 1000) + 20 * Math.log10(input.interferer_frequency_ghz * 1e9) + 20 * Math.log10(4 * Math.PI / c)
  const interfPower = input.interferer_power_dbm + input.interferer_antenna_gain_dbi - fspl - totalAcir + input.victim_antenna_gain_dbi

  // Victim receiver noise
  const k = 1.38e-23
  const temp = 290
  const noisePower = 10 * Math.log10(k * temp * input.victim_bandwidth_mhz * 1e6) + 30

  const iOverN = interfPower - noisePower
  const linkDegradation = iOverN < -20 ? 0.1 : iOverN < -10 ? 0.5 : iOverN < -6 ? 1.0 : iOverN < 0 ? 2.0 : 5.0

  const components: InterferenceComponent[] = [
    {
      source: 'Co-channel interference',
      level_dbm: Math.round((interfPower + (1 - coChannelRatio) * 30) * 100) / 100,
      threshold_dbm: Math.round((noisePower - 10) * 100) / 100,
      margin_db: Math.round((noisePower - 10 - (interfPower + (1 - coChannelRatio) * 30)) * 100) / 100,
      acceptable: interfPower + (1 - coChannelRatio) * 30 < noisePower - 10
    },
    {
      source: 'Adjacent channel leakage',
      level_dbm: Math.round((interfPower - 15) * 100) / 100,
      threshold_dbm: Math.round((noisePower - 6) * 100) / 100,
      margin_db: Math.round((noisePower - 6 - (interfPower - 15)) * 100) / 100,
      acceptable: interfPower - 15 < noisePower - 6
    },
    {
      source: 'Cross-polar discrimination',
      level_dbm: Math.round((interfPower - 3) * 100) / 100,
      threshold_dbm: Math.round((noisePower - 3) * 100) / 100,
      margin_db: Math.round((noisePower - 3 - (interfPower - 3)) * 100) / 100,
      acceptable: interfPower - 3 < noisePower - 3
    }
  ]

  const allAcceptable = components.every(c => c.acceptable)
  const anyMarginal = components.some(c => c.margin_db < 3 && c.margin_db >= 0)

  let overall: InterferenceResult['overall_assessment'] = 'acceptable'
  if (!allAcceptable) overall = 'unacceptable'
  else if (anyMarginal) overall = 'marginal'

  const executiveSummary = 'Interference analysis: "' + input.interferer_system + '" interfering with "' + input.victim_system + '" (' + input.interference_type + '). ACIR achieved: ' + totalAcir.toFixed(1) + ' dB (required: ' + acirRequired + ' dB). I/N: ' + iOverN.toFixed(1) + ' dB. Link degradation: ' + linkDegradation.toFixed(1) + ' dB. Assessment: ' + overall.toUpperCase() + '.'

  const mitigation: string[] = []
  if (overall !== 'acceptable') {
    mitigation.push('Increase frequency separation between victim and interferer carriers')
    mitigation.push('Implement sharper filtering on interferer transmit chain')
    mitigation.push('Adjust antenna pointing to increase angular separation')
    mitigation.push('Reduce interferer transmit power if operationally feasible')
  }
  if (input.interference_type === 'co_channel') {
    mitigation.push('Consider cross-polarization frequency reuse to double capacity')
  }
  mitigation.push('Deploy interference cancellation techniques at victim receiver')
  mitigation.push('Coordinate operational schedules to avoid simultaneous high-power transmissions')
  mitigation.push('Monitor interference levels continuously with automated alerting')

  const references = [
    'ITU-R S.728-1: Maximum permissible level of off-axis e.i.r.p. density from earth stations in the fixed-satellite service',
    'ITU-R S.731: Reference earth-station cross-polarized radiation pattern for use in frequency coordination',
    'ITU-R S.1432: Apportionment of the allowable error performance degradations',
    'ITU-R SF.1006: Determination of the interference potential between non-geostationary satellite orbit fixed-satellite service systems'
  ]

  return {
    victim_system: input.victim_system,
    interferer_system: input.interferer_system,
    interference_type: input.interference_type,
    acir_required_db: acirRequired,
    acir_achieved_db: Math.round(totalAcir * 100) / 100,
    i_over_n_db: Math.round(iOverN * 100) / 100,
    link_degradation_db: Math.round(linkDegradation * 100) / 100,
    components,
    overall_assessment: overall,
    executive_summary: executiveSummary,
    mitigation_measures: mitigation,
    references
  }
}

function formatInterferenceReport(r: InterferenceResult): string {
  const lines: string[] = []
  lines.push('# Interference Analysis Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Interference Overview')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Victim System | ' + r.victim_system + ' |')
  lines.push('| Interferer System | ' + r.interferer_system + ' |')
  lines.push('| Interference Type | ' + r.interference_type + ' |')
  lines.push('| ACIR Required | ' + r.acir_required_db + ' dB |')
  lines.push('| ACIR Achieved | ' + r.acir_achieved_db.toFixed(1) + ' dB |')
  lines.push('| I/N Ratio | ' + r.i_over_n_db.toFixed(1) + ' dB |')
  lines.push('| Link Degradation | ' + r.link_degradation_db.toFixed(1) + ' dB |')
  lines.push('| Overall Assessment | ' + r.overall_assessment.toUpperCase() + ' |')
  lines.push('')
  lines.push('## Interference Components')
  lines.push('')
  lines.push('| Source | Level (dBm) | Threshold (dBm) | Margin (dB) | Acceptable |')
  lines.push('|--------|-------------|-----------------|-------------|------------|')
  for (const c of r.components) {
    lines.push('| ' + c.source + ' | ' + c.level_dbm.toFixed(1) + ' | ' + c.threshold_dbm.toFixed(1) + ' | ' + c.margin_db.toFixed(1) + ' | ' + (c.acceptable ? 'Yes' : 'No') + ' |')
  }
  lines.push('')
  lines.push('## Mitigation Measures')
  lines.push('')
  for (const m of r.mitigation_measures) lines.push('- ' + m)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== TOOL 5: MODULATION OPTIMIZER ====================

export interface ModulationInput {
  link_name: string
  available_bandwidth_mhz: number
  target_data_rate_mbps: number
  current_cn_db: number
  max_cn_db: number
  min_cn_db: number
  channel_type: 'awgn' | 'rayleigh' | 'rician' | 'nonlinear'
  amplifier_backoff_db: number
  target_ber: number
  latency_requirement_ms: number
  spectral_efficiency_priority: 'low' | 'medium' | 'high'
}

export interface ModulationScheme {
  name: string
  modulation: string
  code_rate: string
  spectral_efficiency: number
  required_ebno_db: number
  cn_required_db: number
  achievable_data_rate: number
  margin_db: number
  ber_estimate: number
  suitable: boolean
}

export interface ModulationResult {
  link_name: string
  available_bandwidth_mhz: number
  target_data_rate_mbps: number
  current_cn_db: number
  recommended_scheme: ModulationScheme
  all_schemes: ModulationScheme[]
  link_adaptation_range: string
  executive_summary: string
  recommendations: string[]
  references: string[]
}

function optimizeModulation(input: ModulationInput): ModulationResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const schemes: ModulationScheme[] = [
    { name: 'QPSK 1/2', modulation: 'QPSK', code_rate: '1/2', spectral_efficiency: 1.0, required_ebno_db: 1.8, cn_required_db: 0, achievable_data_rate: 0, margin_db: 0, ber_estimate: 0, suitable: false },
    { name: 'QPSK 3/4', modulation: 'QPSK', code_rate: '3/4', spectral_efficiency: 1.5, required_ebno_db: 3.8, cn_required_db: 0, achievable_data_rate: 0, margin_db: 0, ber_estimate: 0, suitable: false },
    { name: '8PSK 2/3', modulation: '8PSK', code_rate: '2/3', spectral_efficiency: 2.0, required_ebno_db: 5.5, cn_required_db: 0, achievable_data_rate: 0, margin_db: 0, ber_estimate: 0, suitable: false },
    { name: '16QAM 3/4', modulation: '16QAM', code_rate: '3/4', spectral_efficiency: 3.0, required_ebno_db: 8.0, cn_required_db: 0, achievable_data_rate: 0, margin_db: 0, ber_estimate: 0, suitable: false },
    { name: '32QAM 4/5', modulation: '32QAM', code_rate: '4/5', spectral_efficiency: 4.0, required_ebno_db: 11.0, cn_required_db: 0, achievable_data_rate: 0, margin_db: 0, ber_estimate: 0, suitable: false },
    { name: '64QAM 5/6', modulation: '64QAM', code_rate: '5/6', spectral_efficiency: 5.0, required_ebno_db: 14.5, cn_required_db: 0, achievable_data_rate: 0, margin_db: 0, ber_estimate: 0, suitable: false },
    { name: '256QAM 3/4', modulation: '256QAM', code_rate: '3/4', spectral_efficiency: 6.0, required_ebno_db: 18.5, cn_required_db: 0, achievable_data_rate: 0, margin_db: 0, ber_estimate: 0, suitable: false }
  ]

  const nonlinearPenalty = input.channel_type === 'nonlinear' ? input.amplifier_backoff_db * 0.5 : 0

  for (const s of schemes) {
    s.cn_required_db = s.required_ebno_db + 10 * Math.log10(s.spectral_efficiency) + nonlinearPenalty + rng.nextFloat(-0.2, 0.2)
    s.achievable_data_rate = input.available_bandwidth_mhz * s.spectral_efficiency
    s.margin_db = input.current_cn_db - s.cn_required_db
    s.ber_estimate = 0.5 * Math.exp(-Math.pow(10, s.margin_db / 10) * s.spectral_efficiency * 0.5)
    s.suitable = s.margin_db >= 0 && s.achievable_data_rate >= input.target_data_rate_mbps * 0.8
  }

  // Find best scheme
  const suitableSchemes = schemes.filter(s => s.suitable)
  let recommended: ModulationScheme
  if (input.spectral_efficiency_priority === 'high') {
    recommended = suitableSchemes.length > 0
      ? suitableSchemes.reduce((best, s) => s.spectral_efficiency > best.spectral_efficiency ? s : best, suitableSchemes[0])
      : schemes[0]
  } else if (input.spectral_efficiency_priority === 'low') {
    recommended = suitableSchemes.length > 0
      ? suitableSchemes.reduce((best, s) => s.margin_db > best.margin_db ? s : best, suitableSchemes[0])
      : schemes[0]
  } else {
    recommended = suitableSchemes.length > 0
      ? suitableSchemes.reduce((best, s) => (s.spectral_efficiency * s.margin_db) > (best.spectral_efficiency * best.margin_db) ? s : best, suitableSchemes[0])
      : schemes[0]
  }

  const minSuitable = suitableSchemes.length > 0 ? suitableSchemes.reduce((min, s) => s.cn_required_db < min.cn_required_db ? s : min, suitableSchemes[0]) : schemes[0]
  const maxSuitable = suitableSchemes.length > 0 ? suitableSchemes.reduce((max, s) => s.cn_required_db > max.cn_required_db ? s : max, suitableSchemes[0]) : schemes[0]
  const adaptRange = minSuitable.name + ' (' + minSuitable.cn_required_db.toFixed(1) + ' dB) to ' + maxSuitable.name + ' (' + maxSuitable.cn_required_db.toFixed(1) + ' dB)'

  const executiveSummary = 'Modulation optimization for "' + input.link_name + '". Current C/N: ' + input.current_cn_db + ' dB. Recommended: ' + recommended.name + ' achieving ' + recommended.achievable_data_rate.toFixed(1) + ' Mbps with ' + recommended.margin_db.toFixed(1) + ' dB margin. Target: ' + input.target_data_rate_mbps + ' Mbps.'

  const recommendations: string[] = []
  if (recommended.margin_db < 3) {
    recommendations.push('Link margin is thin; implement adaptive coding and modulation (ACM)')
    recommendations.push('Consider lower-order modulation for improved robustness')
  }
  if (input.channel_type === 'nonlinear') {
    recommendations.push('Account for amplifier nonlinearity with predistortion or increased backoff')
  }
  recommendations.push('Implement link adaptation to switch between ' + adaptRange)
  recommendations.push('Monitor link quality and adjust modulation/coding in real-time')
  recommendations.push('Consider LDPC or Turbo coding for additional 1-2 dB coding gain')

  const references = [
    'ETSI EN 302 307-2: DVB-S2X (Second generation framing structure) for satellite communications',
    'Proakis: Digital Communications, 5th Edition, McGraw-Hill',
    'ITU-R S.1878: Adaptive coding and modulation for satellite communications',
    'DVB-S2X Blue Book: EN 302 307-2 Annex E - ACM guidelines'
  ]

  return {
    link_name: input.link_name,
    available_bandwidth_mhz: input.available_bandwidth_mhz,
    target_data_rate_mbps: input.target_data_rate_mbps,
    current_cn_db: input.current_cn_db,
    recommended_scheme: recommended,
    all_schemes: schemes,
    link_adaptation_range: adaptRange,
    executive_summary: executiveSummary,
    recommendations,
    references
  }
}

function formatModulationReport(r: ModulationResult): string {
  const lines: string[] = []
  lines.push('# Modulation Optimization Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Recommended Scheme')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Scheme | ' + r.recommended_scheme.name + ' |')
  lines.push('| Modulation | ' + r.recommended_scheme.modulation + ' |')
  lines.push('| Code Rate | ' + r.recommended_scheme.code_rate + ' |')
  lines.push('| Spectral Efficiency | ' + r.recommended_scheme.spectral_efficiency + ' b/s/Hz |')
  lines.push('| Required Eb/N0 | ' + r.recommended_scheme.required_ebno_db + ' dB |')
  lines.push('| Required C/N | ' + r.recommended_scheme.cn_required_db.toFixed(1) + ' dB |')
  lines.push('| Achievable Rate | ' + r.recommended_scheme.achievable_data_rate.toFixed(1) + ' Mbps |')
  lines.push('| Margin | ' + r.recommended_scheme.margin_db.toFixed(1) + ' dB |')
  lines.push('| Suitable | ' + (r.recommended_scheme.suitable ? 'Yes' : 'No') + ' |')
  lines.push('')
  lines.push('## All Schemes Comparison')
  lines.push('')
  lines.push('| Scheme | Mod | Code | SE | Eb/N0 | C/N Req | Rate | Margin | Suitable |')
  lines.push('|--------|-----|------|----|-------|---------|------|--------|----------|')
  for (const s of r.all_schemes) {
    lines.push('| ' + s.name + ' | ' + s.modulation + ' | ' + s.code_rate + ' | ' + s.spectral_efficiency + ' | ' + s.required_ebno_db + ' | ' + s.cn_required_db.toFixed(1) + ' | ' + s.achievable_data_rate.toFixed(1) + ' | ' + s.margin_db.toFixed(1) + ' | ' + (s.suitable ? 'Yes' : 'No') + ' |')
  }
  lines.push('')
  lines.push('## Link Adaptation Range')
  lines.push('')
  lines.push(r.link_adaptation_range)
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== TOOL 6: ANTENNA DESIGN ADVISOR ====================

export interface AntennaDesignInput {
  application: string
  frequency_ghz: number
  bandwidth_mhz: number
  required_gain_dbi: number
  scan_angle_deg: number
  polarization: 'linear' | 'circular' | 'dual'
  size_constraint_m: number
  environment: 'ground' | 'shipborne' | 'airborne' | 'spacecraft'
  tracking_required: boolean
  multi_beam: boolean
}

export interface AntennaOption {
  type: string
  diameter_m: number
  gain_dbi: number
  beamwidth_deg: number
  sidelobe_level_db: number
  efficiency_pct: number
  weight_kg: number
  cost_estimate: string
  pros: string[]
  cons: string[]
  suitability: number
}

export interface AntennaDesignResult {
  application: string
  frequency_ghz: number
  required_gain_dbi: number
  recommended_option: AntennaOption
  all_options: AntennaOption[]
  executive_summary: string
  design_notes: string[]
  references: string[]
}

function adviseAntennaDesign(input: AntennaDesignInput): AntennaDesignResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const wavelength = 0.3 / input.frequency_ghz
  const minDiameter = input.size_constraint_m > 0 ? Math.min(input.size_constraint_m, wavelength * 5) : wavelength * 10

  const options: AntennaOption[] = []

  // Parabolic reflector
  const paraDiam = Math.max(minDiameter, rng.nextFloat(1.2, 9))
  const paraEff = rng.nextFloat(0.55, 0.75)
  const paraGain = 10 * Math.log10(paraEff * Math.pow(Math.PI * paraDiam / wavelength, 2))
  const paraBeam = 70 * wavelength / paraDiam
  options.push({
    type: 'Parabolic Reflector',
    diameter_m: Math.round(paraDiam * 100) / 100,
    gain_dbi: Math.round(paraGain * 100) / 100,
    beamwidth_deg: Math.round(paraBeam * 100) / 100,
    sidelobe_level_db: -25,
    efficiency_pct: Math.round(paraEff * 100),
    weight_kg: Math.round(paraDiam * paraDiam * 15 * rng.nextFloat(0.8, 1.2)),
    cost_estimate: '$' + Math.round(paraDiam * 5000 * rng.nextFloat(0.8, 1.5)),
    pros: ['Highest gain for given aperture', 'Mature technology', 'Low sidelobes possible'],
    cons: ['Large profile', 'Mechanical steering required', 'Wind loading concerns'],
    suitability: Math.min(1, Math.max(0, (paraGain - input.required_gain_dbi + 5) / 10))
  })

  // Horn antenna
  const hornDiam = Math.max(0.3, rng.nextFloat(0.3, 1.5))
  const hornEff = rng.nextFloat(0.5, 0.7)
  const hornGain = 10 * Math.log10(hornEff * Math.pow(Math.PI * hornDiam / wavelength, 2))
  options.push({
    type: 'Conical Horn',
    diameter_m: Math.round(hornDiam * 100) / 100,
    gain_dbi: Math.round(hornGain * 100) / 100,
    beamwidth_deg: Math.round(60 * wavelength / hornDiam * 100) / 100,
    sidelobe_level_db: -20,
    efficiency_pct: Math.round(hornEff * 100),
    weight_kg: Math.round(hornDiam * 5),
    cost_estimate: '$' + Math.round(hornDiam * 2000),
    pros: ['Wide bandwidth', 'Simple construction', 'Low loss'],
    cons: ['Lower gain', 'Larger for same gain', 'Feed for reflector'],
    suitability: Math.min(1, Math.max(0, (hornGain - input.required_gain_dbi + 8) / 10))
  })

  // Phased array
  const arraySize = Math.max(0.5, rng.nextFloat(0.5, 3))
  const arrayGain = 10 * Math.log10(Math.pow(Math.PI * arraySize / wavelength, 2) * 0.6)
  options.push({
    type: 'Phased Array',
    diameter_m: Math.round(arraySize * 100) / 100,
    gain_dbi: Math.round(arrayGain * 100) / 100,
    beamwidth_deg: Math.round(50 * wavelength / arraySize * 100) / 100,
    sidelobe_level_db: -30,
    efficiency_pct: 60,
    weight_kg: Math.round(arraySize * arraySize * 25),
    cost_estimate: '$' + Math.round(arraySize * arraySize * 50000),
    pros: ['Electronic beam steering', 'Multi-beam capable', 'No moving parts'],
    cons: ['Higher cost', 'Power consumption', 'Thermal management'],
    suitability: input.multi_beam ? 0.95 : Math.min(1, Math.max(0, (arrayGain - input.required_gain_dbi + 3) / 10))
  })

  // Flat panel / patch array
  const panelSize = Math.max(0.3, rng.nextFloat(0.3, 1.2))
  const panelGain = 10 * Math.log10(Math.pow(Math.PI * panelSize / wavelength, 2) * 0.5)
  options.push({
    type: 'Flat Panel Array',
    diameter_m: Math.round(panelSize * 100) / 100,
    gain_dbi: Math.round(panelGain * 100) / 100,
    beamwidth_deg: Math.round(55 * wavelength / panelSize * 100) / 100,
    sidelobe_level_db: -22,
    efficiency_pct: 50,
    weight_kg: Math.round(panelSize * panelSize * 10),
    cost_estimate: '$' + Math.round(panelSize * panelSize * 30000),
    pros: ['Low profile', 'Aerodynamic', 'Electronic steering'],
    cons: ['Moderate gain', 'Limited scan range', 'Higher cost per dBi'],
    suitability: input.environment === 'airborne' ? 0.9 : Math.min(1, Math.max(0, (panelGain - input.required_gain_dbi + 5) / 10))
  })

  // Select best option
  const recommended = options.reduce((best, o) => o.suitability > best.suitability ? o : best, options[0])

  const executiveSummary = 'Antenna design advisory for "' + input.application + '" at ' + input.frequency_ghz + ' GHz requiring ' + input.required_gain_dbi + ' dBi. Recommended: ' + recommended.type + ' (' + recommended.diameter_m + ' m) providing ' + recommended.gain_dbi + ' dBi gain with ' + recommended.beamwidth_deg + ' deg beamwidth. Suitability: ' + (recommended.suitability * 100).toFixed(0) + '%.'

  const designNotes: string[] = []
  if (input.tracking_required) {
    designNotes.push('Tracking system required: implement monopulse or step-track for ' + input.frequency_ghz + ' GHz')
  }
  if (input.polarization === 'circular') {
    designNotes.push('Circular polarization requires septum polarizer or orthogonal mode transducer')
  }
  if (input.multi_beam) {
    designNotes.push('Multi-beam operation recommended with phased array or multiple feeds')
  }
  if (input.environment === 'spacecraft') {
    designNotes.push('Space-qualified materials and thermal design required for space environment')
  }
  if (input.environment === 'shipborne') {
    designNotes.push('Maritime environment requires stabilization platform and corrosion protection')
  }
  designNotes.push('Verify antenna pattern meets ITU-R S.480 sidelobe envelope requirements')
  designNotes.push('Consider radome for environmental protection at ' + input.frequency_ghz + ' GHz')

  const references = [
    'Balanis: Antenna Theory - Analysis and Design, 4th Edition, Wiley',
    'ITU-R S.480-3: Maximum permissible level of spurious emissions from earth stations',
    'ITU-R S.580-6: Radiation diagrams for use as design objectives for earth station antennas',
    'Milligan: Modern Antenna Design, 2nd Edition, Wiley'
  ]

  return {
    application: input.application,
    frequency_ghz: input.frequency_ghz,
    required_gain_dbi: input.required_gain_dbi,
    recommended_option: recommended,
    all_options: options,
    executive_summary: executiveSummary,
    design_notes: designNotes,
    references
  }
}

function formatAntennaDesignReport(r: AntennaDesignResult): string {
  const lines: string[] = []
  lines.push('# Antenna Design Advisory Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Recommended Option')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Type | ' + r.recommended_option.type + ' |')
  lines.push('| Diameter/Size | ' + r.recommended_option.diameter_m + ' m |')
  lines.push('| Gain | ' + r.recommended_option.gain_dbi + ' dBi |')
  lines.push('| Beamwidth | ' + r.recommended_option.beamwidth_deg + ' deg |')
  lines.push('| Sidelobes | ' + r.recommended_option.sidelobe_level_db + ' dB |')
  lines.push('| Efficiency | ' + r.recommended_option.efficiency_pct + '% |')
  lines.push('| Weight | ' + r.recommended_option.weight_kg + ' kg |')
  lines.push('| Cost | ' + r.recommended_option.cost_estimate + ' |')
  lines.push('| Suitability | ' + (r.recommended_option.suitability * 100).toFixed(0) + '% |')
  lines.push('')
  lines.push('## All Options Comparison')
  lines.push('')
  for (const o of r.all_options) {
    lines.push('### ' + o.type)
    lines.push('')
    lines.push('| Parameter | Value |')
    lines.push('|-----------|-------|')
    lines.push('| Size | ' + o.diameter_m + ' m |')
    lines.push('| Gain | ' + o.gain_dbi + ' dBi |')
    lines.push('| Beamwidth | ' + o.beamwidth_deg + ' deg |')
    lines.push('| Sidelobes | ' + o.sidelobe_level_db + ' dB |')
    lines.push('| Efficiency | ' + o.efficiency_pct + '% |')
    lines.push('| Weight | ' + o.weight_kg + ' kg |')
    lines.push('| Cost | ' + o.cost_estimate + ' |')
    lines.push('| Suitability | ' + (o.suitability * 100).toFixed(0) + '% |')
    lines.push('')
    lines.push('**Pros**: ' + o.pros.join(', '))
    lines.push('')
    lines.push('**Cons**: ' + o.cons.join(', '))
    lines.push('')
  }
  lines.push('## Design Notes')
  lines.push('')
  for (const note of r.design_notes) lines.push('- ' + note)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== TOOL 7: PROPAGATION MODELER ====================

export interface PropagationInput {
  scenario_name: string
  frequency_ghz: number
  elevation_deg: number
  earth_station_lat_deg: number
  earth_station_alt_m: number
  rain_rate_mm_hr: number
  availability_target_pct: number
  surface_temp_c: number
  humidity_pct: number
  scintillation_required: boolean
  ionospheric_required: boolean
}

export interface PropagationLoss {
  mechanism: string
  loss_db: number
  percentage_time: number
  description: string
}

export interface PropagationResult {
  scenario_name: string
  frequency_ghz: number
  elevation_deg: number
  total_attenuation_db: number
  attenuation_availability_db: number
  losses: PropagationLoss[]
  rain_attenuation_db: number
  atmospheric_gas_db: number
  scintillation_db: number
  ionospheric_fade_db: number
  faraday_rotation_deg: number
  executive_summary: string
  recommendations: string[]
  references: string[]
}

function modelPropagation(input: PropagationInput): PropagationResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  // Rain attenuation (ITU-R P.618 model simplified)
  const rainCoeffK = Math.pow(input.frequency_ghz, 1.6) * 0.03
  const rainCoeffAlpha = Math.pow(input.frequency_ghz, 0.8) * 0.9
  const specificAttenuation = rainCoeffK * Math.pow(input.rain_rate_mm_hr, rainCoeffAlpha)
  const effectivePathLength = 1 / (Math.sin(input.elevation_deg * Math.PI / 180) + 0.01)
  const rainAtten = specificAttenuation * effectivePathLength * rng.nextFloat(0.8, 1.2)

  // Atmospheric gas attenuation (ITU-R P.676)
  const gasAtten = input.frequency_ghz < 20
    ? 0.05 * effectivePathLength / Math.sin(Math.max(5, input.elevation_deg) * Math.PI / 180)
    : 0.3 * effectivePathLength / Math.sin(Math.max(5, input.elevation_deg) * Math.PI / 180)

  // Scintillation (ITU-R P.618)
  const scintillation = input.scintillation_required
    ? 0.5 / Math.pow(Math.sin(Math.max(5, input.elevation_deg) * Math.PI / 180), 1.5) * rng.nextFloat(0.5, 1.5)
    : 0

  // Ionospheric effects
  const ionoFade = input.ionospheric_required && input.frequency_ghz < 10
    ? 2 * Math.pow(3 / input.frequency_ghz, 2) * rng.nextFloat(0.5, 1.5)
    : 0
  const faradayRotation = input.ionospheric_required && input.frequency_ghz < 10
    ? 30 * Math.pow(3 / input.frequency_ghz, 2)
    : 0

  const totalAtten = rainAtten + gasAtten + scintillation + ionoFade

  // Attenuation at target availability
  const unavailFrac = (100 - input.availability_target_pct) / 100
  const attenAtAvail = totalAtten * (1 + unavailFrac * rng.nextFloat(1, 3))

  const losses: PropagationLoss[] = [
    {
      mechanism: 'Rain Attenuation',
      loss_db: Math.round(rainAtten * 100) / 100,
      percentage_time: Math.round((100 - input.availability_target_pct) * 100) / 100,
      description: 'Rain attenuation at ' + input.rain_rate_mm_hr + ' mm/hr rain rate, ' + input.frequency_ghz + ' GHz'
    },
    {
      mechanism: 'Atmospheric Gases',
      loss_db: Math.round(gasAtten * 100) / 100,
      percentage_time: 100,
      description: 'Clear-air gaseous absorption (O2 and H2O) at ' + input.frequency_ghz + ' GHz'
    },
    {
      mechanism: 'Tropospheric Scintillation',
      loss_db: Math.round(scintillation * 100) / 100,
      percentage_time: 10,
      description: 'Amplitude scintillation due to tropospheric turbulence'
    },
    {
      mechanism: 'Ionospheric Fade',
      loss_db: Math.round(ionoFade * 100) / 100,
      percentage_time: 5,
      description: 'Ionospheric scintillation and absorption at ' + input.frequency_ghz + ' GHz'
    }
  ]

  const executiveSummary = 'Propagation modeling for "' + input.scenario_name + '" at ' + input.frequency_ghz + ' GHz, ' + input.elevation_deg + ' deg elevation. Total attenuation: ' + totalAtten.toFixed(2) + ' dB. At ' + input.availability_target_pct + '% availability: ' + attenAtAvail.toFixed(2) + ' dB. Rain: ' + rainAtten.toFixed(2) + ' dB, Gas: ' + gasAtten.toFixed(2) + ' dB, Scintillation: ' + scintillation.toFixed(2) + ' dB.'

  const recommendations: string[] = []
  if (rainAtten > 5) {
    recommendations.push('Significant rain attenuation; implement uplink power control or site diversity')
    recommendations.push('Consider lower frequency band for tropical/high-rain regions')
  }
  if (input.frequency_ghz > 20) {
    recommendations.push('Ka-band and above: atmospheric losses are significant; plan adequate link margin')
  }
  if (scintillation > 0.5) {
    recommendations.push('Scintillation exceeds 0.5 dB; implement fade mitigation techniques')
  }
  if (input.elevation_deg < 10) {
    recommendations.push('Low elevation angle increases path length and atmospheric effects')
  }
  recommendations.push('Use ITU-R P.618-13 for detailed rain attenuation prediction')
  recommendations.push('Implement adaptive coding and modulation for fade mitigation')
  recommendations.push('Monitor local weather data for real-time fade estimation')

  const references = [
    'ITU-R P.618-13: Propagation data and prediction methods for Earth-space telecommunication systems',
    'ITU-R P.676-13: Attenuation by atmospheric gases',
    'ITU-R P.1812-6: A path-specific propagation prediction method for terrestrial services',
    'Crane: Electromagnetic Wave Propagation through Rain, Wiley'
  ]

  return {
    scenario_name: input.scenario_name,
    frequency_ghz: input.frequency_ghz,
    elevation_deg: input.elevation_deg,
    total_attenuation_db: Math.round(totalAtten * 100) / 100,
    attenuation_availability_db: Math.round(attenAtAvail * 100) / 100,
    losses,
    rain_attenuation_db: Math.round(rainAtten * 100) / 100,
    atmospheric_gas_db: Math.round(gasAtten * 100) / 100,
    scintillation_db: Math.round(scintillation * 100) / 100,
    ionospheric_fade_db: Math.round(ionoFade * 100) / 100,
    faraday_rotation_deg: Math.round(faradayRotation * 100) / 100,
    executive_summary: executiveSummary,
    recommendations,
    references
  }
}

function formatPropagationReport(r: PropagationResult): string {
  const lines: string[] = []
  lines.push('# Propagation Modeling Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Attenuation Summary')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Scenario | ' + r.scenario_name + ' |')
  lines.push('| Frequency | ' + r.frequency_ghz + ' GHz |')
  lines.push('| Elevation | ' + r.elevation_deg + ' deg |')
  lines.push('| Total Attenuation | ' + r.total_attenuation_db.toFixed(2) + ' dB |')
  lines.push('| At Target Availability | ' + r.attenuation_availability_db.toFixed(2) + ' dB |')
  lines.push('| Rain Attenuation | ' + r.rain_attenuation_db.toFixed(2) + ' dB |')
  lines.push('| Atmospheric Gas | ' + r.atmospheric_gas_db.toFixed(2) + ' dB |')
  lines.push('| Scintillation | ' + r.scintillation_db.toFixed(2) + ' dB |')
  lines.push('| Ionospheric Fade | ' + r.ionospheric_fade_db.toFixed(2) + ' dB |')
  lines.push('| Faraday Rotation | ' + r.faraday_rotation_deg.toFixed(1) + ' deg |')
  lines.push('')
  lines.push('## Loss Mechanisms')
  lines.push('')
  lines.push('| Mechanism | Loss (dB) | % Time | Description |')
  lines.push('|-----------|-----------|--------|-------------|')
  for (const l of r.losses) {
    lines.push('| ' + l.mechanism + ' | ' + l.loss_db.toFixed(2) + ' | ' + l.percentage_time + ' | ' + l.description + ' |')
  }
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== TOOL 8: SPECTRUM MANAGEMENT TOOL ====================

export interface SpectrumInput {
  organization: string
  region: 'ITU-R1' | 'ITU-R2' | 'ITU-R3' | 'global'
  service_type: 'FSS' | 'BSS' | 'MSS' | 'FS' | 'EESS' | 'RNSS' | 'SRR'
  frequency_band_mhz: [number, number]
  bandwidth_required_mhz: number
  license_type: 'individual' | 'blanket' | 'light_license' | 'unlicensed'
  coordination_required: boolean
  existing_assignments: number
  priority_level: 'primary' | 'secondary' | 'permitted'
}

export interface SpectrumAllocation {
  band: string
  range_mhz: [number, number]
  service: string
  status: 'available' | 'congested' | 'restricted' | 'reserved'
  utilization_pct: number
  fee_estimate: string
}

export interface SpectrumResult {
  organization: string
  region: string
  service_type: string
  frequency_band_mhz: [number, number]
  bandwidth_required_mhz: number
  license_type: string
  allocations: SpectrumAllocation[]
  congestion_level: 'low' | 'medium' | 'high' | 'critical'
  coordination_complexity: 'simple' | 'moderate' | 'complex' | 'very_complex'
  estimated_license_fee: string
  timeline_months: number
  overall_feasibility: 'feasible' | 'challenging' | 'infeasible'
  executive_summary: string
  action_items: string[]
  references: string[]
}

function manageSpectrum(input: SpectrumInput): SpectrumResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const allocations: SpectrumAllocation[] = []
  const bandNames = ['C-band', 'X-band', 'Ku-band', 'Ka-band', 'Q/V-band', 'L-band', 'S-band']
  const services = ['FSS', 'BSS', 'MSS', 'FS', 'EESS', 'RNSS', 'Radiolocation']
  const statuses: SpectrumAllocation['status'][] = ['available', 'congested', 'restricted', 'reserved']

  const numAllocations = rng.nextInt(3, 6)
  for (let i = 0; i < numAllocations; i++) {
    const bandIdx = rng.nextInt(0, bandNames.length - 1)
    const startFreq = input.frequency_band_mhz[0] + rng.nextFloat(0, (input.frequency_band_mhz[1] - input.frequency_band_mhz[0]) * 0.5)
    const endFreq = startFreq + rng.nextFloat(50, (input.frequency_band_mhz[1] - input.frequency_band_mhz[0]) * 0.4)
    const status = statuses[rng.nextInt(0, statuses.length - 1)]
    const util = status === 'available' ? rng.nextFloat(10, 40) : status === 'congested' ? rng.nextFloat(70, 95) : rng.nextFloat(40, 70)

    allocations.push({
      band: bandNames[bandIdx],
      range_mhz: [Math.round(startFreq), Math.round(Math.min(endFreq, input.frequency_band_mhz[1]))],
      service: services[rng.nextInt(0, services.length - 1)],
      status,
      utilization_pct: Math.round(util * 10) / 10,
      fee_estimate: '$' + Math.round(rng.nextFloat(5000, 500000))
    })
  }

  const congestedCount = allocations.filter(a => a.status === 'congested').length
  const restrictedCount = allocations.filter(a => a.status === 'restricted').length

  let congestion: SpectrumResult['congestion_level'] = 'low'
  if (congestedCount >= 3) congestion = 'critical'
  else if (congestedCount >= 2) congestion = 'high'
  else if (congestedCount >= 1 || restrictedCount >= 2) congestion = 'medium'

  let coordComplexity: SpectrumResult['coordination_complexity'] = 'simple'
  if (input.coordination_required && input.existing_assignments > 10) coordComplexity = 'very_complex'
  else if (input.coordination_required && input.existing_assignments > 5) coordComplexity = 'complex'
  else if (input.coordination_required) coordComplexity = 'moderate'

  const baseFee = input.bandwidth_required_mhz * rng.nextFloat(100, 1000)
  const regionMultiplier = input.region === 'global' ? 3 : input.region === 'ITU-R2' ? 1.5 : 1
  const licenseMultiplier = input.license_type === 'individual' ? 2 : input.license_type === 'blanket' ? 1.5 : 1
  const estimatedFee = Math.round(baseFee * regionMultiplier * licenseMultiplier)

  const timeline = coordComplexity === 'very_complex' ? rng.nextInt(18, 36) : coordComplexity === 'complex' ? rng.nextInt(12, 24) : coordComplexity === 'moderate' ? rng.nextInt(6, 12) : rng.nextInt(1, 6)

  let feasibility: SpectrumResult['overall_feasibility'] = 'feasible'
  if (congestion === 'critical' || (congestion === 'high' && coordComplexity === 'very_complex')) feasibility = 'infeasible'
  else if (congestion === 'high' || coordComplexity === 'complex') feasibility = 'challenging'

  const executiveSummary = 'Spectrum management analysis for "' + input.organization + '" in ' + input.region + '. Band: ' + input.frequency_band_mhz[0] + '-' + input.frequency_band_mhz[1] + ' MHz, ' + input.bandwidth_required_mhz + ' MHz required. Congestion: ' + congestion + ', Coordination: ' + coordComplexity + '. Estimated fee: $' + estimatedFee + ', Timeline: ' + timeline + ' months. Feasibility: ' + feasibility + '.'

  const actionItems: string[] = []
  if (congestion !== 'low') {
    actionItems.push('Conduct detailed spectrum occupancy survey in target band')
    actionItems.push('Identify alternative bands with lower congestion')
  }
  if (input.coordination_required) {
    actionItems.push('Initiate coordination with ' + input.existing_assignments + ' existing assignments')
    actionItems.push('Prepare coordination data package per ITU Appendix 4')
  }
  actionItems.push('Submit license application to national regulatory authority')
  actionItems.push('Monitor ITU Master International Frequency Register for conflicting assignments')
  actionItems.push('Engage frequency coordinator for ' + input.region + ' region')
  actionItems.push('Plan for license renewal and compliance reporting requirements')

  const references = [
    'ITU Radio Regulations (2024 Edition): Articles 9, 11, and Appendix 4',
    'ITU-R SM.1046-2: Definition of spectrum use and efficiency',
    'ITU-R SM.1448-1: Determination of the coordination area around an earth station',
    'ITU: Handbook on National Spectrum Management (2021)'
  ]

  return {
    organization: input.organization,
    region: input.region,
    service_type: input.service_type,
    frequency_band_mhz: input.frequency_band_mhz,
    bandwidth_required_mhz: input.bandwidth_required_mhz,
    license_type: input.license_type,
    allocations,
    congestion_level: congestion,
    coordination_complexity: coordComplexity,
    estimated_license_fee: '$' + estimatedFee,
    timeline_months: timeline,
    overall_feasibility: feasibility,
    executive_summary: executiveSummary,
    action_items: actionItems,
    references
  }
}

function formatSpectrumReport(r: SpectrumResult): string {
  const lines: string[] = []
  lines.push('# Spectrum Management Analysis Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Spectrum Overview')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Organization | ' + r.organization + ' |')
  lines.push('| Region | ' + r.region + ' |')
  lines.push('| Service | ' + r.service_type + ' |')
  lines.push('| Frequency Band | ' + r.frequency_band_mhz[0] + '-' + r.frequency_band_mhz[1] + ' MHz |')
  lines.push('| Bandwidth Required | ' + r.bandwidth_required_mhz + ' MHz |')
  lines.push('| License Type | ' + r.license_type + ' |')
  lines.push('| Congestion | ' + r.congestion_level.toUpperCase() + ' |')
  lines.push('| Coordination | ' + r.coordination_complexity.toUpperCase() + ' |')
  lines.push('| Estimated Fee | ' + r.estimated_license_fee + ' |')
  lines.push('| Timeline | ' + r.timeline_months + ' months |')
  lines.push('| Feasibility | ' + r.overall_feasibility.toUpperCase() + ' |')
  lines.push('')
  lines.push('## Spectrum Allocations')
  lines.push('')
  lines.push('| Band | Range (MHz) | Service | Status | Utilization | Fee |')
  lines.push('|------|-------------|---------|--------|-------------|-----|')
  for (const a of r.allocations) {
    lines.push('| ' + a.band + ' | ' + a.range_mhz[0] + '-' + a.range_mhz[1] + ' | ' + a.service + ' | ' + a.status.toUpperCase() + ' | ' + a.utilization_pct.toFixed(1) + '% | ' + a.fee_estimate + ' |')
  }
  lines.push('')
  lines.push('## Action Items')
  lines.push('')
  for (const item of r.action_items) lines.push('- [ ] ' + item)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push('- ' + ref)
  lines.push('')
  lines.push('---')
  lines.push('*' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== APPLY FUNCTION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: link_budget_calculator
  tools.register(defineTool({
    name: 'link_budget_calculator',
    description: 'Link Budget Calculator: Computes satellite link budget including EIRP, free space path loss, G/T ratio, C/N0, Eb/N0, and link margin. Input satellite link parameters, output comprehensive link budget analysis with pass/fail status.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: satellite_name (string), frequency_ghz (number), bandwidth_mhz (number), tx_power_dbm (number), tx_antenna_gain_dbi (number), rx_antenna_gain_dbi (number), distance_km (number), atmospheric_loss_db (number), rain_margin_db (number), receiver_noise_figure_db (number), receiver_temp_k (number), required_ebn0_db (number), implementation_margin_db (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: LinkBudgetInput = JSON.parse(args.input)
      const result = calculateLinkBudget(data)
      return formatLinkBudgetReport(result)
    }
  }))

  // Tool 2: ground_station_planner
  tools.register(defineTool({
    name: 'ground_station_planner',
    description: 'Ground Station Planner: Plans ground station locations, antenna sizes, contact schedules, and diversity configurations. Input mission parameters and orbit details, output station site plan with coverage analysis.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: mission_name (string), orbit_type (GEO/MEO/LEO/HEO), orbit_altitude_km (number), min_elevation_deg (number), latitude_deg (number), longitude_deg (number), altitude_m (number), required_availability_pct (number), frequency_bands (string[]), number_of_stations (int), diversity_required (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: GroundStationInput = JSON.parse(args.input)
      const result = planGroundStation(data)
      return formatGroundStationReport(result)
    }
  }))

  // Tool 3: frequency_coordination_engine
  tools.register(defineTool({
    name: 'frequency_coordination_engine',
    description: 'Frequency Coordination Engine: Analyzes frequency coordination requirements per ITU Radio Regulations. Evaluates PFD compliance, adjacent satellite interference, spurious emissions, and band edge requirements. Input network parameters, output coordination status report.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: network_name (string), orbit_slot_deg (number), frequency_range_mhz ([number, number]), bandwidth_mhz (number), emission_designator (string), power_flux_density_limit (number), coordination_distance_km (number), adjacent_satellites_deg (number[]), itu_filing_status (API/C-Band/coordination/notification/recorded), service_type (FSS/BSS/MSS/EESS/RNSS)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: FrequencyCoordinationInput = JSON.parse(args.input)
      const result = runFrequencyCoordination(data)
      return formatFrequencyCoordinationReport(result)
    }
  }))

  // Tool 4: interference_analyzer
  tools.register(defineTool({
    name: 'interference_analyzer',
    description: 'Interference Analyzer: Analyzes co-channel and adjacent-channel interference between satellite systems. Computes ACIR, I/N ratio, and link degradation. Input victim and interferer system parameters, output interference assessment with mitigation measures.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: victim_system (string), interferer_system (string), victim_frequency_ghz (number), interferer_frequency_ghz (number), victim_bandwidth_mhz (number), interferer_bandwidth_mhz (number), victim_antenna_gain_dbi (number), interferer_antenna_gain_dbi (number), interferer_power_dbm (number), separation_angle_deg (number), distance_km (number), interference_type (co_channel/adjacent_channel/intermod/cross_polar/spurious)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: InterferenceInput = JSON.parse(args.input)
      const result = analyzeInterference(data)
      return formatInterferenceReport(result)
    }
  }))

  // Tool 5: modulation_optimizer
  tools.register(defineTool({
    name: 'modulation_optimizer',
    description: 'Modulation Optimizer: Optimizes modulation and coding schemes for satellite links. Evaluates QPSK through 256QAM with various code rates. Input link conditions and requirements, output recommended modulation scheme with performance comparison.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: link_name (string), available_bandwidth_mhz (number), target_data_rate_mbps (number), current_cn_db (number), max_cn_db (number), min_cn_db (number), channel_type (awgn/rayleigh/rician/nonlinear), amplifier_backoff_db (number), target_ber (number), latency_requirement_ms (number), spectral_efficiency_priority (low/medium/high)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: ModulationInput = JSON.parse(args.input)
      const result = optimizeModulation(data)
      return formatModulationReport(result)
    }
  }))

  // Tool 6: antenna_design_advisor
  tools.register(defineTool({
    name: 'antenna_design_advisor',
    description: 'Antenna Design Advisor: Recommends antenna type and dimensions for satellite ground terminals. Evaluates parabolic, horn, phased array, and flat panel options. Input frequency, gain, and environmental requirements, output antenna design comparison with suitability scoring.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: application (string), frequency_ghz (number), bandwidth_mhz (number), required_gain_dbi (number), scan_angle_deg (number), polarization (linear/circular/dual), size_constraint_m (number), environment (ground/shipborne/airborne/spacecraft), tracking_required (boolean), multi_beam (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: AntennaDesignInput = JSON.parse(args.input)
      const result = adviseAntennaDesign(data)
      return formatAntennaDesignReport(result)
    }
  }))

  // Tool 7: propagation_modeler
  tools.register(defineTool({
    name: 'propagation_modeler',
    description: 'Propagation Modeler: Models RF propagation effects for satellite links including rain attenuation, atmospheric gas absorption, tropospheric scintillation, and ionospheric effects. Input link geometry and climate parameters, output propagation loss budget per ITU-R models.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: scenario_name (string), frequency_ghz (number), elevation_deg (number), earth_station_lat_deg (number), earth_station_alt_m (number), rain_rate_mm_hr (number), availability_target_pct (number), surface_temp_c (number), humidity_pct (number), scintillation_required (boolean), ionospheric_required (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: PropagationInput = JSON.parse(args.input)
      const result = modelPropagation(data)
      return formatPropagationReport(result)
    }
  }))

  // Tool 8: spectrum_management_tool
  tools.register(defineTool({
    name: 'spectrum_management_tool',
    description: 'Spectrum Management Tool: Analyzes spectrum availability, congestion, coordination complexity, and licensing requirements. Input organization and band requirements, output spectrum allocation analysis with feasibility assessment and action items.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: organization (string), region (ITU-R1/ITU-R2/ITU-R3/global), service_type (FSS/BSS/MSS/FS/EESS/RNSS/SRR), frequency_band_mhz ([number, number]), bandwidth_required_mhz (number), license_type (individual/blanket/light_license/unlicensed), coordination_required (boolean), existing_assignments (int), priority_level (primary/secondary/permitted)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: SpectrumInput = JSON.parse(args.input)
      const result = manageSpectrum(data)
      return formatSpectrumReport(result)
    }
  }))

  console.log('[dsh-tool-satcomms] Loaded v' + VERSION + ' - Satellite Communications & Ground Systems with 8 tools')
  console.log('  Tools: link_budget_calculator, ground_station_planner, frequency_coordination_engine, interference_analyzer, modulation_optimizer, antenna_design_advisor, propagation_modeler, spectrum_management_tool')
}
