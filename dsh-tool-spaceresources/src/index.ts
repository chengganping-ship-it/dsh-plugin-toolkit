/**
 * DSH Space Resources & Mining AI Plugin v1.0.0
 *
 * Space Resources & Mining AI toolkit - tools for asteroid mining feasibility,
 * space manufacturing optimization, orbital debris valuation, lunar resource mapping,
 * space logistics planning, in-situ resource utilization, space economics modeling,
 * and orbital slot optimization.
 *
 * Features (v1.0.0):
 * - Asteroid Mining Feasibility (delta-v, composition, economics, timeline)
 * - Space Manufacturing Optimizer (microgravity processes, volume, cost, quality)
 * - Orbital Debris Valuator (debris recycling/salvage value and retrieval cost)
 * - Lunar Resource Mapper (water ice, regolith, rare earths at coordinates)
 * - Space Logistics Planner (Earth-Moon-LEO-GEO cargo, delta-v, propellant, scheduling)
 * - In-Situ Resource Utilization Analyzer (extract water, oxygen, metals from regolith)
 * - Space Economics Modeler (supply/demand, pricing, market sizing for space economy)
 * - Orbital Slot Optimizer (GEO/MEO slot allocation and station-keeping)
 *
 * @module dsh-tool-spaceresources
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-spaceresources'
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

// --- Tool 1: Asteroid Mining Feasibility ---
interface AsteroidTarget {
  designation?: string
  semi_major_axis_au?: number
  eccentricity?: number
  inclination_deg?: number
  asteroid_type?: 'C-type' | 'S-type' | 'M-type' | 'V-type'
  estimated_diameter_m?: number
  delta_v_kms?: number
}

interface MiningParameters {
  target_return_mass_kg?: number
  mining_duration_years?: number
  extraction_method?: 'surface' | 'shallow_depth' | 'deep_mining' | 'thermal_extraction'
  propulsion_type?: 'chemical' | 'electric' | 'solar_sail' | 'nuclear_thermal'
}

interface AsteroidMiningInput {
  target?: AsteroidTarget
  mining_params?: MiningParameters
  economic_constraints?: {
    max_budget_musd?: number
    min_roi_pct?: number
    discount_rate_pct?: number
    commodity_prices?: Record<string, number>
  }
}

interface MineralYield {
  mineral: string
  concentration_pct: number
  extractable_mass_kg: number
  market_value_per_kg: number
  total_value_musd: number
}

interface AsteroidMiningOutput {
  target: AsteroidTarget
  mining_params: MiningParameters
  feasibility_score: number
  feasibility_rating: string
  delta_v_total_kms: number
  delta_v_match: boolean
  transit_time_days: number
  mission_duration_years: number
  total_return_mass_kg: number
  mineral_yields: MineralYield[]
  total_mineral_value_musd: number
  extraction_efficiency_pct: number
  propulsion_suitability: string
  capital_cost_musd: number
  operating_cost_musd: number
  total_mission_cost_musd: number
  net_present_value_musd: number
  roi_pct: number
  payback_period_years: number
  risk_factors: string[]
  technology_readiness_level: number
  timeline_to_first_return_years: number
  analysis_summary: string
}

// --- Tool 2: Space Manufacturing Optimizer ---
interface ManufacturingProcess {
  process_type?: 'fiber_optic' | 'pharmaceutical' | 'alloy' | 'crystal_growth' | 'bioprinting' | 'semiconductor'
  material_input?: string
  target_output_kg?: number
  quality_grade?: 'research' | 'commercial' | 'industrial'
}

interface FacilityConstraints {
  available_volume_m3?: number
    power_budget_kw?: number
  crew_time_hours_per_week?: number
  resupply_interval_months?: number
  manufacturing_location?: 'LEO_station' | 'lunar_surface' | 'deep_space_habitat' | 'free_flyer'
}

interface ManufacturingInput {
  process?: ManufacturingProcess
  facility?: FacilityConstraints
  economic_targets?: {
    target_unit_cost_kg?: number
    min_profit_margin_pct?: number
    market_demand_kg_per_year?: number
  }
}

interface ProcessStep {
  step_number: number
  step_name: string
  duration_hours: number
  energy_kwh: number
  microgravity_benefit: string
  yield_pct: number
}

interface ManufacturingOutput {
  process: ManufacturingProcess
  facility: FacilityConstraints
  suitability_score: number
  suitability_rating: string
  microgravity_advantage_factor: number
  achievable_quality: string
  process_steps: ProcessStep[]
  total_process_duration_hours: number
  total_energy_kwh: number
  output_mass_kg: number
  usable_output_kg: number
  material_utilization_pct: number
  unit_cost_per_kg: number
  revenue_per_year_musd: number
  profit_per_year_musd: number
  profit_margin_pct: number
  payback_on_facility_musd: number
  resupply_dependency: string
  key_risks: string[]
  recommendations: string[]
  optimization_summary: string
}

// --- Tool 3: Orbital Debris Valuator ---
interface DebrisObject {
  norad_id?: string
  object_type?: 'spent_stage' | 'fragment' | ' defunct_satellite' | 'rocket_body' | 'mission_related_debris'
  altitude_km?: number
  inclination_deg?: number
  mass_kg?: number
  material_composition?: Record<string, number>
  delta_v_to_reach_kms?: number
}

interface ValuationParameters {
  retrieval_method?: 'robotic_armed' | 'tether_net' | 'laser_abation' | 'aerobrake_capture'
  recycling_efficiency_pct?: number
  commodity_price_index?: number
  retrieval_budget_musd?: number
}

interface DebrisValuatorInput {
  target_debris?: DebrisObject
  valuation_params?: ValuationParameters
  market_assumptions?: {
    aluminum_price_per_kg?: number
    titanium_price_per_kg?: number
    rare_earth_price_per_kg?: number
    composite_price_per_kg?: number
    copper_price_per_kg?: number
  }
}

interface RecoveredMaterial {
  material: string
  mass_kg: number
  purity_pct: number
  market_price_per_kg: number
  recovered_value_musd: number
}

interface DebrisValuatorOutput {
  target_debris: DebrisObject
  valuation_params: ValuationParameters
  retrieval_feasibility: string
  retrieval_feasibility_score: number
  total_retrieval_cost_musd: number
  propellant_cost_musd: number
  operations_cost_musd: number
  recovered_materials: RecoveredMaterial[]
  total_recovered_mass_kg: number
  total_recovered_value_musd: number
  net_value_musd: number
  roi_pct: number
  environmental_credit_value_musd: number
  orbital_slot_value_musd: number
  combined_value_musd: number
  risk_factors: string[]
  technology_readiness: number
  commercial_viability: string
  analysis_summary: string
}

// --- Tool 4: Lunar Resource Mapper ---
interface LunarSite {
  site_name?: string
  latitude_deg?: number
  longitude_deg?: number
  elevation_km?: number
  terrain_type?: 'mare' | 'highland' | 'crater_floor' | 'polar_region' | 'rille'
}

interface ResourceTarget {
  resource_type?: 'water_ice' | 'helium3' | 'rare_earths' | 'titanium' | 'aluminum' | 'silicon' | 'oxygen'
  min_concentration_ppm?: number
  target_extraction_rate_kg_year?: number
}

interface MappingParameters {
  mapping_resolution_m?: number
  survey_type?: 'orbital' | 'rover' | 'static_lander' | 'sample_return'
  instrumentation?: string[]
  mission_duration_days?: number
}

interface LunarMapperInput {
  site?: LunarSite
  resource_targets?: ResourceTarget[]
  mapping_params?: MappingParameters
  geological_model?: {
    regolith_depth_m?: number
    bedrock_type?: number
    age_billion_years?: number
    crater_density_per_km2?: number
  }
}

interface ResourceDeposit {
  resource: string
  estimated_concentration_ppm: number
  estimated_total_mass_kg: number
  depth_range_m: string
  extraction_difficulty: string
  confidence_level: string
}

interface RegionalAnomaly {
  anomaly_id: number
  latitude_deg: number
  longitude_deg: number
  anomaly_type: string
  anomaly_strength: number
  interpretation: string
}

interface LunarMapperOutput {
  site: LunarSite
  mapping_params: MappingParameters
  survey_coverage_km2: number
  resolution_achieved_m: number
  resource_deposits: ResourceDeposit[]
  regional_anomalies: RegionalAnomaly[]
  total_water_ice_estimate_kg: number
  total_helium3_estimate_kg: number
  total_rare_earth_estimate_kg: number
  geological_complexity: string
  recommended_extraction_zones: number
  mapping_confidence: string
  mission_cost_estimate_musd: number
  timeline_to_production_years: number
  analysis_summary: string
}

// --- Tool 5: Space Logistics Planner ---
interface LogisticsNode {
  node_type?: 'Earth_surface' | 'LEO' | 'GEO' | 'lunar_orbit' | 'lunar_surface' | 'EML1' | 'EML2' | 'Mars_orbit'
  node_id?: number
  delta_v_departure_kms?: number
  delta_v_arrival_kms?: number
  orbital_period_days?: number
}

interface CargoManifest {
  cargo_type?: 'crew' | 'fuel' | 'equipment' | 'scientific' | 'consumables' | 'construction_material'
  mass_kg?: number
  volume_m3?: number
  priority?: 'critical' | 'high' | 'medium' | 'low'
  perishable?: boolean
}

interface LogisticsRoute {
  origin?: LogisticsNode
  destination?: LogisticsNode
  transfer_type?: 'Hohmann' | 'bi_elliptic' | 'low_thrust' | 'gravity_assist' | 'direct'
  wait_time_days?: number
  refueling_stops?: string[]
}

interface LogisticsPlannerInput {
  nodes?: LogisticsNode[]
  cargo?: CargoManifest[]
  route?: LogisticsRoute
  constraints?: {
    max_delta_v_kms?: number
    max_transfer_time_days?: number
    launch_window_start?: string
    launch_window_end?: string
    max_payload_mass_kg?: number
    propellant_margin_pct?: number
  }
}

interface TransferLeg {
  leg_number: number
  origin: string
  destination: string
  transfer_type: string
  delta_v_kms: number
  duration_days: number
  departure_epoch: string
  arrival_epoch: string
  payload_mass_kg: number
  propellant_mass_kg: number
}

interface LogisticsPlannerOutput {
  route: LogisticsRoute
  total_delta_v_kms: number
  total_transfer_time_days: number
  feasible: boolean
  feasibility_reason: string
  total_cargo_mass_kg: number
  total_cargo_volume_m3: number
  transfer_legs: TransferLeg[]
  propellant_budget_kg: number
  propellant_margin_pct: number
  number_of_launches: number
  estimated_cost_musd: number
  critical_path: string[]
  schedule_risks: string[]
  launch_windows: string[]
  delta_v_margin_kms: number
  analysis_summary: string
}

// --- Tool 6: In-Situ Resource Utilization ---
interface ISRULocation {
  location_type?: 'lunar_surface' | 'lunar_polar' | 'martian_surface' | 'asteroid' | 'orbital_debris'
  coordinates?: {
    lat_deg?: number
    lon_deg?: number
    altitude_km?: number
  }
}

interface ResourceExtraction {
  resource?: 'water' | 'oxygen' | 'hydrogen' | 'methane' | 'iron' | 'silicon' | 'aluminum'
  extraction_method?: 'electrolysis' | 'thermal_sublimation' | 'chemical_reduction' | 'molten_regolith_electrolysis' | 'biomining'
  feedstock_composition?: Record<string, number>
  target_production_kg_year?: number
}

interface ISRUInfrastructure {
  power_source?: 'solar_array' | 'nuclear_reactor' | 'radioisotope' | 'fuel_cell'
  power_available_kw?: number
  reactor_mass_kg?: number
  robotic_automation_level?: number
  crew_support_requirement?: number
}

interface ISRUInput {
  location?: ISRULocation
  extraction?: ResourceExtraction
  infrastructure?: ISRUInfrastructure
  operational_constraints?: {
    mission_duration_years?: number
    dust_mitigation_required?: boolean
    operating_temperature_min_k?: number
    operating_temperature_max_k?: number
    maintenance_interval_months?: number
  }
}

interface ProductionEstimate {
  resource: string
  daily_production_kg: number
  annual_production_kg: number
  cumulative_production_kg: number
  energy_per_kg_kwh: number
  extraction_efficiency_pct: number
  purity_pct: number
}

interface MassSavings {
  item: string
  earth_launched_mass_saved_kg: number
  cost_savings_musd: number
}

interface ISRUOutput {
  location: ISRULocation
  extraction: ResourceExtraction
  infrastructure: ISRUInfrastructure
  isru_readiness_level: number
  overall_feasibility: string
  production_estimates: ProductionEstimate[]
  total_power_required_kw: number
  power_surplus_kw: number
  mass_savings: MassSavings[]
  total_mass_savings_kg: number
  total_cost_savings_musd: number
  infrastructure_cost_musd: number
  operational_cost_per_year_musd: number
  break_even_years: number
  roi_pct: number
  dust_impact_rating: string
  thermal_challenges: string[]
  technology_gaps: string[]
  analysis_summary: string
}

// --- Tool 7: Space Economics Modeler ---
interface EconomicSector {
  sector_name?: 'launch_services' | 'satellite_manufacturing' | 'space_resources' | 'space_tourism' | 'in_space_manufacturing' | 'space_data_services' | 'orbital_logistics'
  current_revenue_busd?: number
  annual_growth_rate_pct?: number
  market_saturation_pct?: number
}

interface SupplyDemandModel {
  commodity?: 'propellant' | 'water' | 'oxygen' | 'metals' | 'rare_earths' | 'helium3' | 'data_bandwidth' | 'manufactured_goods'
  current_supply_units?: number
  current_demand_units?: number
  supply_growth_rate_pct?: number
  demand_growth_rate_pct?: number
  price_per_unit?: number
}

interface InvestmentScenario {
  scenario_name?: string
  total_investment_musd?: number
  investment_horizon_years?: number
  discount_rate_pct?: number
  risk_adjustment_factor?: number
}

interface EconomicsModelerInput {
  sectors?: EconomicSector[]
  supply_demand?: SupplyDemandModel[]
  scenario?: InvestmentScenario
  external_factors?: {
    regulatory_environment?: 'supportive' | 'neutral' | 'restrictive'
    technology_acceleration_factor?: number
    international_cooperation_level?: number
    space_debris_mitigation_cost_annual_musd?: number
  }
}

interface SectorProjection {
  sector: string
  revenue_year_0_busd: number
  revenue_year_5_busd: number
  revenue_year_10_busd: number
  cagr_pct: number
  market_share_pct: number
}

interface PriceForecast {
  commodity: string
  current_price: number
  price_year_5: number
  price_year_10: number
  price_volatility_pct: number
  supply_demand_balance: string
}

interface EconomicsModelerOutput {
  scenario: InvestmentScenario
  gdp_contribution_space_sector_busd: number
  gdp_contribution_growth_pct: number
  total_market_size_year_0_busd: number
  total_market_size_year_5_busd: number
  total_market_size_year_10_busd: number
  sector_projections: SectorProjection[]
  price_forecasts: PriceForecast[]
  investment_npv_musd: number
  investment_irr_pct: number
  investment_payback_years: number
  sensitivity_best_case_npv_musd: number
  sensitivity_worst_case_npv_musd: number
  key_growth_drivers: string[]
  market_risks: string[]
  regulatory_outlook: string
  technology_inflection_points: string[]
  analysis_summary: string
}

// --- Tool 8: Orbital Slot Optimizer ---
interface SatelliteRequirement {
  satellite_id?: number
  service_type?: 'communications' | 'broadcast' | 'weather' | 'navigation' | 'earth_observation'
  coverage_longitude_min_deg?: number
  coverage_longitude_max_deg?: number
  coverage_latitude_min_deg?: number
  coverage_latitude_max_deg?: number
  frequency_band?: 'L' | 'S' | 'C' | 'X' | 'Ku' | 'Ka' | 'V'
  min_elevation_deg?: number
  power_tdbudget_kw?: number
}

interface OrbitalRegime {
  regime_type?: 'GEO' | 'MEO' | 'HEO' | 'molniya' | 'TUNDRA'
  orbit_altitude_km?: number
  orbit_inclination_deg?: number
  orbit_period_minutes?: number
  station_keeping_delta_v_ms_year?: number
}

interface SlotConstraints {
  min_separation_deg?: number
  coordination_agreements?: string[]
  interference_threshold_db?: number
  maximum_satellites_per_slot?: number
  priority_rules?: 'first_come_first_served' | 'auctions' | 'ITU_filing' | 'operational_need'
}

interface OrbitalSlotOptimizerInput {
  satellite_requirements?: SatelliteRequirement[]
  orbital_regime?: OrbitalRegime
  slot_constraints?: SlotConstraints
  optimization_criteria?: {
    maximize_coverage?: boolean
    minimize_interference?: boolean
    equidistribute_slots?: boolean
    respect_filing_priority?: boolean
  }
}

interface SlotAssignment {
  satellite_id: number
  assigned_longitude_deg: number
  assigned_latitude_offset_deg: number
  coverage_radius_deg: number
  interference_level_db: number
  station_keeping_fuel_kg_year: number
  slot_priority: string
  conflicts_with: number[]
  coordination_required: boolean
}

interface OrbitalSlotOptimizerOutput {
  orbital_regime: OrbitalRegime
  slot_constraints: SlotConstraints
  total_satellites: number
  assigned_satellites: number
  unassigned_satellites: number
  slot_assignments: SlotAssignment[]
  coverage_uniformity_pct: number
  average_interference_db: number
  peak_interference_db: number
  total_station_keeping_fuel_kg_year: number
  available_slots_remaining: number
  optimization_score: number
  regulatory_compliance: string
  conflict_resolution_notes: string[]
  recommendations: string[]
  analysis_summary: string
}

// ==================== TOOL 1: ASTEROID MINING FEASIBILITY ====================

function assessAsteroidMining(input: AsteroidMiningInput): AsteroidMiningOutput {
  const target = input.target ?? {
    designation: '16 Psyche',
    semi_major_axis_au: 2.92,
    eccentricity: 0.14,
    inclination_deg: 3.1,
    asteroid_type: 'M-type',
    estimated_diameter_m: 226,
  }
  const mining = input.mining_params ?? {
    target_return_mass_kg: 10000,
    mining_duration_years: 3,
    extraction_method: 'surface',
    propulsion_type: 'electric',
  }
  const econ = input.economic_constraints ?? {
    max_budget_musd: 5000,
    min_roi_pct: 15,
    discount_rate_pct: 8,
    commodity_prices: {},
  }

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const asteroidType = target.asteroid_type ?? 'M-type'
  const deltaV = target.delta_v_kms ?? rngFloat(rng, 2.5, 8.0)
  const miningDuration = mining.mining_duration_years ?? 3
  const returnMass = mining.target_return_mass_kg ?? 10000

  const propulsionBonus = mining.propulsion_type === 'nuclear_thermal' ? 0.85 : mining.propulsion_type === 'electric' ? 0.75 : mining.propulsion_type === 'solar_sail' ? 0.9 : 0.8
  const extractionBonus = mining.extraction_method === 'deep_mining' ? 1.3 : mining.extraction_method === 'shallow_depth' ? 1.1 : mining.extraction_method === 'thermal_extraction' ? 1.2 : 1.0

  const transitTimeDays = Math.round(rngFloat(rng, 200, 800) * (deltaV / 5.0))
  const missionDurationYears = miningDuration + (transitTimeDays / 365.25) * 2

  const mineralYields: MineralYield[] = []
  const minerals = asteroidType === 'M-type'
    ? ['Iron', 'Nickel', 'Platinum', 'Gold', 'Cobalt']
    : asteroidType === 'C-type'
      ? ['Water', 'Carbon', 'Organics', 'Silicates', 'Phosphorus']
      : asteroidType === 'S-type'
        ? ['Silicates', 'Iron', 'Nickel', 'Olivine', 'Pyroxene']
        : ['Basalt', 'Ilmenite', 'Anorthite', 'Olivine', 'Glass']

  const concentrations = asteroidType === 'M-type' ? [20, 10, 0.005, 0.003, 0.5]
    : asteroidType === 'C-type' ? [15, 5, 8, 40, 1]
    : asteroidType === 'S-type' ? [30, 15, 5, 25, 20]
    : [40, 8, 30, 20, 2]

  const prices = asteroidType === 'M-type' ? [0.5, 15, 30000, 60000, 35]
    : asteroidType === 'C-type' ? [50, 10, 5, 1, 8]
    : asteroidType === 'S-type' ? [1, 0.5, 15, 0.2, 0.1]
    : [0.3, 2, 0.5, 0.2, 0.1]

  for (let i = 0; i < minerals.length; i++) {
    const conc = concentrations[i] * extractionBonus * (0.8 + rngFloat(rng, 0, 0.4))
    const extractableMass = returnMass * (conc / 100)
    const pricePerKg = prices[i] * (commodityOverride(econ.commodity_prices, minerals[i]) ?? 1)
    const totalValue = (extractableMass * pricePerKg) / 1e6
    mineralYields.push({
      mineral: minerals[i],
      concentration_pct: roundTo(conc, 3),
      extractable_mass_kg: roundTo(extractableMass, 1),
      market_value_per_kg: roundTo(pricePerKg, 2),
      total_value_musd: roundTo(totalValue, 3),
    })
  }

  const totalMineralValue = mineralYields.reduce((s, m) => s + m.total_value_musd, 0)

  const diameterFactor = (target.estimated_diameter_m ?? 200) / 200
  const capitalCost = roundTo(rngFloat(rng, 800, 3000) * diameterFactor + rngFloat(rng, 200, 800), 1)
  const operatingCost = roundTo(miningDuration * rngFloat(rng, 100, 400), 1)
  const totalMissionCost = roundTo(capitalCost + operatingCost, 1)

  const npv = roundTo(totalMineralValue - totalMissionCost, 1)
  const roi = roundTo((totalMineralValue / totalMissionCost) * 100, 1)
  const payback = roundTo(totalMissionCost / Math.max(totalMineralValue, 0.01), 1)

  const feasibilityScore = roundTo(clamp(
    (totalMineralValue / Math.max(totalMissionCost, 1)) * 30 +
    (deltaV < 6 ? 25 : 10) +
    (propulsionBonus * 20) +
    (extractionBonus * 15) +
    rngFloat(rng, 0, 10),
    0, 100), 1)

  let feasibilityRating = 'Infeasible'
  if (feasibilityScore > 75) feasibilityRating = 'Highly Feasible'
  else if (feasibilityScore > 55) feasibilityRating = 'Feasible'
  else if (feasibilityScore > 35) feasibilityRating = 'Marginally Feasible'

  const riskFactors: string[] = []
  if (deltaV > 6) riskFactors.push('High delta-v increases transit time and cost')
  if (miningDuration > 5) riskFactors.push('Extended mining duration increases operational risk')
  if (target.estimated_diameter_m && target.estimated_diameter_m < 100) riskFactors.push('Small target body may limit total recoverable mass')
  if (mining.extraction_method === 'deep_mining') riskFactors.push('Deep mining technology unproven in microgravity')
  riskFactors.push('Commodity price volatility affects return projections')
  riskFactors.push('Regulatory framework for space resource extraction still evolving')

  const trl = Math.round(rngRange(rng, 3, 6))

  return {
    target,
    mining_params: mining,
    feasibility_score: feasibilityScore,
    feasibility_rating: feasibilityRating,
    delta_v_total_kms: roundTo(deltaV, 2),
    delta_v_match: deltaV < (input.economic_constraints?.max_budget_musd ?? 5000) / 1000,
    transit_time_days: transitTimeDays,
    mission_duration_years: roundTo(missionDurationYears, 1),
    total_return_mass_kg: returnMass,
    mineral_yields: mineralYields,
    total_mineral_value_musd: roundTo(totalMineralValue, 1),
    extraction_efficiency_pct: roundTo(extractionBonus * 70 * propulsionBonus, 1),
    propulsion_suitability: `${mining.propulsion_type} (${roundTo(propulsionBonus * 100, 0)}% efficiency)`,
    capital_cost_musd: capitalCost,
    operating_cost_musd: operatingCost,
    total_mission_cost_musd: totalMissionCost,
    net_present_value_musd: npv,
    roi_pct: roi,
    payback_period_years: payback,
    risk_factors: riskFactors,
    technology_readiness_level: trl,
    timeline_to_first_return_years: roundTo(missionDurationYears + rngFloat(rng, 0.5, 2.0), 1),
    analysis_summary: `${asteroidType} asteroid ${target.designation ?? 'unknown'}: delta-v=${roundTo(deltaV,1)}km/s, ROI=${roi}%, NPV=$${npv}M, feasibility=${feasibilityRating}, TRL=${trl}`
  }
}

function commodityOverride(prices: Record<string, number> | undefined, mineral: string): number | undefined {
  if (!prices) return undefined
  const key = mineral.toLowerCase()
  for (const [k, v] of Object.entries(prices)) {
    if (k.toLowerCase() === key) return v
  }
  return undefined
}

function formatAsteroidMiningReport(input: AsteroidMiningInput, output: AsteroidMiningOutput): string {
  const lines: string[] = []
  lines.push('## Asteroid Mining Feasibility Report')
  lines.push('')
  lines.push('**Target:** ' + (output.target.designation ?? 'Unknown') + ' (' + (output.target.asteroid_type ?? 'unknown') + ')')
  lines.push('**Diameter:** ' + (output.target.estimated_diameter_m ?? 'N/A') + 'm | **Semi-major axis:** ' + (output.target.semi_major_axis_au ?? 'N/A') + ' AU')
  lines.push('**Extraction:** ' + (output.mining_params.extraction_method ?? 'surface') + ' | **Propulsion:** ' + (output.mining_params.propulsion_type ?? 'electric'))
  lines.push('**Feasibility:** ' + output.feasibility_rating + ' (' + output.feasibility_score + '/100)')
  lines.push('')

  lines.push('### Mission Profile')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Delta-V Total | ' + output.delta_v_total_kms + ' km/s |')
  lines.push('| Transit Time | ' + output.transit_time_days + ' days |')
  lines.push('| Mission Duration | ' + output.mission_duration_years + ' years |')
  lines.push('| Return Mass | ' + output.total_return_mass_kg.toLocaleString() + ' kg |')
  lines.push('| First Return Timeline | ' + output.timeline_to_first_return_years + ' years |')
  lines.push('')

  lines.push('### Mineral Yield Analysis')
  lines.push('| Mineral | Concentration | Extractable Mass | Price/kg | Total Value |')
  lines.push('|---------|---------------|------------------|----------|-------------|')
  for (const m of output.mineral_yields) {
    lines.push('| ' + m.mineral + ' | ' + m.concentration_pct + '% | ' + m.extractable_mass_kg.toLocaleString() + ' kg | $' + m.market_value_per_kg + '/kg | $' + m.total_value_musd + 'M |')
  }
  lines.push('| **Total** | | | | **$' + output.total_mineral_value_musd + 'M** |')
  lines.push('')

  lines.push('### Economics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Capital Cost | $' + output.capital_cost_musd + 'M |')
  lines.push('| Operating Cost | $' + output.operating_cost_musd + 'M |')
  lines.push('| Total Mission Cost | $' + output.total_mission_cost_musd + 'M |')
  lines.push('| Net Present Value | $' + output.net_present_value_musd + 'M |')
  lines.push('| ROI | ' + output.roi_pct + '% |')
  lines.push('| Payback Period | ' + output.payback_period_years + ' years |')
  lines.push('| Extraction Efficiency | ' + output.extraction_efficiency_pct + '% |')
  lines.push('| Technology Readiness | TRL ' + output.technology_readiness_level + ' |')
  lines.push('')

  lines.push('### Risk Factors')
  for (const r of output.risk_factors) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Analysis uses simplified cost and trajectory models. Mission planning requires high-fidelity assessment.*')

  return lines.join('\n')
}

// ==================== TOOL 2: SPACE MANUFACTURING OPTIMIZER ====================

function optimizeManufacturing(input: ManufacturingInput): ManufacturingOutput {
  const process = input.process ?? {
    process_type: 'fiber_optic',
    material_input: 'ZBLAN glass preform',
    target_output_kg: 10,
    quality_grade: 'commercial',
  }
  const facility = input.facility ?? {
    available_volume_m3: 50,
    power_budget_kw: 30,
    crew_time_hours_per_week: 20,
    resupply_interval_months: 6,
    manufacturing_location: 'LEO_station',
  }
  const econ = input.economic_targets ?? {
    target_unit_cost_kg: 50000,
    min_profit_margin_pct: 20,
    market_demand_kg_per_year: 50,
  }

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const processType = process.process_type ?? 'fiber_optic'
  const quality = process.quality_grade ?? 'commercial'
  const location = facility.manufacturing_location ?? 'LEO_station'

  let mgAdvantage = 1.0
  let baseQuality = ''
  switch (processType) {
    case 'fiber_optic': mgAdvantage = 5.0; baseQuality = 'Ultra-pure ZBLAN fiber with 10x lower signal attenuation'; break
    case 'pharmaceutical': mgAdvantage = 3.5; baseQuality = 'Perfect crystal structures for protein crystallography'; break
    case 'alloy': mgAdvantage = 2.0; baseQuality = 'Homogeneous immiscible alloy microstructures'; break
    case 'crystal_growth': mgAdvantage = 4.0; baseQuality = 'Defect-free semiconductor crystals >99.9999%'; break
    case 'bioprinting': mgAdvantage = 3.0; baseQuality = 'Vascularized tissue scaffolds with natural morphology'; break
    case 'semiconductor': mgAdvantage = 4.5; baseQuality = 'Epitaxial wafers with atomic-layer uniformity'; break
  }

  const locationFactor = location === 'LEO_station' ? 1.0 : location === 'free_flyer' ? 0.85 : location === 'lunar_surface' ? 0.6 : 0.7

  const steps: ProcessStep[] = []
  const stepNames = getProcessSteps(processType)
  let totalHours = 0
  let totalEnergy = 0

  for (let i = 0; i < stepNames.length; i++) {
    const hours = roundTo(rngFloat(rng, 2, 48) * locationFactor, 1)
    const energy = roundTo(hours * rngFloat(rng, 0.1, 2.0), 2)
    steps.push({
      step_number: i + 1,
      step_name: stepNames[i],
      duration_hours: hours,
      energy_kwh: energy,
      microgravity_benefit: getMicrogravityBenefit(processType, i),
      yield_pct: roundTo(rngFloat(rng, 70, 99), 1),
    })
    totalHours += hours
    totalEnergy += energy
  }

  const totalOutputKg = process.target_output_kg ?? 10
  const usableFraction = steps.reduce((p, s) => p * (s.yield_pct / 100), 1)
  const usableOutput = roundTo(totalOutputKg * usableFraction, 2)

  const powerRequired = roundTo(totalEnergy / Math.max(totalHours, 1) * 5, 1)
  const powerSurplusOk = powerRequired <= (facility.power_budget_kw ?? 30)

  const materialUtilization = roundTo(rngFloat(rng, 60, 95) * locationFactor, 1)
  const facilityCost = roundTo(rngFloat(rng, 50, 500), 1)
  const operatingCostPerKg = roundTo((facilityCost * 0.1 + rngFloat(rng, 5, 30)) / Math.max(usableOutput, 0.1), 1)
  const unitCost = roundTo(operatingCostPerKg + ( rngFloat(rng, 0.5, 5) * mgAdvantage), 1)
  const sellingPrice = roundTo(unitCost * rngFloat(rng, 2, 5) + rngFloat(rng, 100, 50000), 1)

  const annualDemand = econ.market_demand_kg_per_year ?? 50
  const annualProduced = Math.min(usableOutput * (12 / Math.max(facility.resupply_interval_months ?? 6, 1)), annualDemand)
  const revenue = roundTo(annualProduced * sellingPrice / 1e6, 2)
  const profit = roundTo(revenue - (facilityCost * 0.1 + rngFloat(rng, 5, 20)), 2)
  const margin = roundTo((profit / Math.max(revenue, 0.01)) * 100, 1)

  const suitabilityScore = roundTo(clamp(
    mgAdvantage * 10 +
    locationFactor * 20 +
    (powerSurplusOk ? 15 : 0) +
    (margin > 20 ? 20 : margin) +
    rngFloat(rng, 0, 15),
    0, 100), 1)

  let suitabilityRating = 'Unsuitable'
  if (suitabilityScore > 75) suitabilityRating = 'Highly Suitable'
  else if (suitabilityScore > 55) suitabilityRating = 'Suitable'
  else if (suitabilityScore > 35) suitabilityRating = 'Conditionally Suitable'

  const targetUnitCost = econ.target_unit_cost_kg ?? 50000
  const profitTarget = econ.min_profit_margin_pct ?? 20
  const risks: string[] = []
  if (!powerSurplusOk) risks.push('Insufficient power budget for continuous operation')
  if (facility.resupply_interval_months && facility.resupply_interval_months > 9) risks.push('Long resupply interval limits production continuity')
  if (margin < profitTarget) risks.push('Profit margin below minimum threshold')
  risks.push('Market demand uncertainty for microgravity-produced materials')
  risks.push('Quality certification in microgravity remains under development')

  const recommendations: string[] = []
  recommendations.push('Optimize batch size to align with resupply cycle')
  if (processType === 'fiber_optic') recommendations.push('ZBLAN fiber justifies premium pricing due to 10x performance advantage')
  if (mgAdvantage > 3) recommendations.push('High microgravity advantage: prioritize this process for space manufacturing')
  recommendations.push('Establish quality certification pipeline with terrestrial standards bodies')

  return {
    process,
    facility,
    suitability_score: suitabilityScore,
    suitability_rating: suitabilityRating,
    microgravity_advantage_factor: roundTo(mgAdvantage, 1),
    achievable_quality: baseQuality,
    process_steps: steps,
    total_process_duration_hours: roundTo(totalHours, 1),
    total_energy_kwh: roundTo(totalEnergy, 1),
    output_mass_kg: totalOutputKg,
    usable_output_kg: usableOutput,
    material_utilization_pct: materialUtilization,
    unit_cost_per_kg: roundTo(unitCost, 1),
    revenue_per_year_musd: revenue,
    profit_per_year_musd: profit,
    profit_margin_pct: margin,
    payback_on_facility_musd: roundTo(facilityCost / Math.max(profit, 0.01), 1),
    resupply_dependency: 'Every ' + (facility.resupply_interval_months ?? 6) + ' months (input materials)',
    key_risks: risks,
    recommendations,
    optimization_summary: processType + ' at ' + location + ': suitability=' + suitabilityRating + ', margin=' + margin + '%, mg-advantage=' + roundTo(mgAdvantage, 1) + 'x'
  }
}

function getProcessSteps(processType: string): string[] {
  switch (processType) {
    case 'fiber_optic': return ['Preform heating', 'Microgravity fiber drawing', 'Annealing', 'Coating application', 'Quality inspection']
    case 'pharmaceutical': return ['Protein solution preparation', 'Crystallization chamber loading', 'Microgravity crystal growth', 'Crystal harvesting', 'Analysis & packaging']
    case 'alloy': return ['Material loading', 'Induction melting', 'Microgravity solidification', 'Homogenization', 'Sample extraction']
    case 'crystal_growth': return ['Substrate preparation', 'Epitaxial deposition', 'Temperature ramp', 'Cooling & annealing', 'Structural characterization']
    case 'bioprinting': return ['Bioink preparation', 'Scaffold printing', 'Cell seeding', 'Maturation incubation', 'Tissue harvesting']
    case 'semiconductor': return ['Wafer cleaning', 'Deposition calibration', 'Epitaxial layer growth', 'In-situ metrology', 'Wafer dicing']
    default: return ['Material preparation', 'Processing', 'Quality control', 'Packaging']
  }
}

function getMicrogravityBenefit(processType: string, stepIndex: number): string {
  const benefits: Record<string, string[]> = {
    fiber_optic: ['No convection-induced defects', 'Uniform fiber diameter', 'Stress-free annealing', 'Consistent refractive index', 'No sedimentation artifacts'],
    pharmaceutical: ['Unrestricted crystal nucleation', 'Zero-buoyancy convection', 'Growth rate control', 'Uniform morphology', 'No container contamination'],
    alloy: ['Prevented segregation', 'Uniform melt', 'Extended solubility', 'Amorphous phases possible', 'No density-driven separation'],
    crystal_growth: ['Convection-free deposition', 'Smooth monolayer growth', 'Uniform cooling', 'Strain-free lattices', 'Defect density reduction'],
    bioprinting: ['No gravitational sag', 'Isotropic tissue growth', 'Precise cell placement', 'Vascular uniformity', 'Scaffold integrity'],
    semiconductor: ['Conformal deposition', 'Atomic-layer precision', 'Thermal uniformity', 'Stress-free epitaxy', 'Wafer-scale uniformity'],
  }
  return benefits[processType]?.[stepIndex] ?? 'Reduced convection'
}

function formatManufacturingReport(input: ManufacturingInput, output: ManufacturingOutput): string {
  const lines: string[] = []
  lines.push('## Space Manufacturing Optimization Report')
  lines.push('')
  lines.push('**Process:** ' + (output.process.process_type ?? 'unknown') + ' | **Location:** ' + (output.facility.manufacturing_location ?? 'LEO_station'))
  lines.push('**Output Target:** ' + output.output_mass_kg + ' kg | **Quality:** ' + (output.process.quality_grade ?? 'commercial'))
  lines.push('**Suitability:** ' + output.suitability_rating + ' (' + output.suitability_score + '/100)')
  lines.push('')

  lines.push('### Microgravity Advantage')
  lines.push('- Advantage Factor: ' + output.microgravity_advantage_factor + 'x over terrestrial production')
  lines.push('- Achievable Quality: ' + output.achievable_quality)
  lines.push('')

  lines.push('### Process Steps')
  lines.push('| # | Step | Duration (h) | Energy (kWh) | Yield | Mg-Benefit |')
  lines.push('|---|------|-------------|-------------|-------|------------|')
  for (const s of output.process_steps) {
    lines.push('| ' + s.step_number + ' | ' + s.step_name + ' | ' + s.duration_hours + ' | ' + s.energy_kwh + ' | ' + s.yield_pct + '% | ' + s.microgravity_benefit + ' |')
  }
  lines.push('')

  lines.push('### Production Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Process Duration | ' + output.total_process_duration_hours + ' h |')
  lines.push('| Total Energy | ' + output.total_energy_kwh + ' kWh |')
  lines.push('| Usable Output | ' + output.usable_output_kg + ' kg |')
  lines.push('| Material Utilization | ' + output.material_utilization_pct + '% |')
  lines.push('| Unit Cost | $' + output.unit_cost_per_kg + '/kg |')
  lines.push('')

  lines.push('### Economics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Revenue/Year | $' + output.revenue_per_year_musd + 'M |')
  lines.push('| Profit/Year | $' + output.profit_per_year_musd + 'M |')
  lines.push('| Profit Margin | ' + output.profit_margin_pct + '% |')
  lines.push('| Facility Payback | ' + output.payback_on_facility_musd + ' years |')
  lines.push('| Resupply | ' + output.resupply_dependency + ' |')
  lines.push('')

  lines.push('### Risks')
  for (const r of output.key_risks) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const r of output.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(output.optimization_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Manufacturing optimization uses simplified process models. Actual yields depend on facility specifications and microgravity conditions.*')

  return lines.join('\n')
}

// ==================== TOOL 3: ORBITAL DEBRIS VALUATOR ====================

function valueOrbitalDebris(input: DebrisValuatorInput): DebrisValuatorOutput {
  const debris = input.target_debris ?? {
    norad_id: 'DEBRIS-001',
    object_type: 'spent_stage',
    altitude_km: 800,
    inclination_deg: 98.5,
    mass_kg: 2500,
    material_composition: { aluminum: 0.65, titanium: 0.15, copper: 0.1, composite: 0.1 },
  }
  const params = input.valuation_params ?? {
    retrieval_method: 'robotic_armed',
    recycling_efficiency_pct: 75,
    commodity_price_index: 1.0,
    retrieval_budget_musd: 150,
  }
  const market = input.market_assumptions ?? {
    aluminum_price_per_kg: 3,
    titanium_price_per_kg: 35,
    rare_earth_price_per_kg: 50,
    composite_price_per_kg: 15,
    copper_price_per_kg: 8,
  }

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const debrisMass = debris.mass_kg ?? 2000
  const recyclingEff = (params.recycling_efficiency_pct ?? 75) / 100
  const composition = debris.material_composition ?? { aluminum: 0.6, titanium: 0.2, copper: 0.1, composite: 0.1 }

  const priceMap: Record<string, number> = {
    aluminum: market.aluminum_price_per_kg ?? 3,
    titanium: market.titanium_price_per_kg ?? 35,
    copper: market.copper_price_per_kg ?? 8,
    composite: market.composite_price_per_kg ?? 15,
    rare_earths: market.rare_earth_price_per_kg ?? 50,
  }

  const recovered: RecoveredMaterial[] = []
  let totalRecoveredMass = 0
  let totalRecoveredValue = 0

  for (const [mat, frac] of Object.entries(composition)) {
    const mass = debrisMass * frac * recyclingEff
    const price = priceMap[mat] ?? 1
    const purity = rngFloat(rng, 0.85, 0.99)
    const value = (mass * price) / 1e6
    recovered.push({ material: mat, mass_kg: roundTo(mass, 1), purity_pct: roundTo(purity * 100, 1), market_price_per_kg: price, recovered_value_musd: roundTo(value, 3) })
    totalRecoveredMass += mass
    totalRecoveredValue += value
  }

  const retrievalDeltaV = debris.delta_v_to_reach_kms ?? rngFloat(rng, 0.5, 3.0)
  const propellantCost = roundTo(retrievalDeltaV * rngFloat(rng, 5, 20), 1)
  const operationsCost = roundTo(rngFloat(rng, 30, 120), 1)
  const totalRetrievalCost = roundTo(propellantCost + operationsCost, 1)

  const envCredit = roundTo(rngFloat(rng, 5, 30), 1)
  const slotValue = roundTo(rngFloat(rng, 0, 10), 1)
  const netValue = roundTo(totalRecoveredValue - totalRetrievalCost, 1)
  const combinedValue = roundTo(netValue + envCredit + slotValue, 1)
  const roi = roundTo((combinedValue / Math.max(totalRetrievalCost, 0.01)) * 100, 1)

  const feasibilityScore = roundTo(clamp(
    (combinedValue / Math.max(totalRetrievalCost, 1)) * 25 +
    (debrisMass > 1000 ? 15 : 5) +
    (retrievalDeltaV < 2 ? 20 : 5) +
    (recyclingEff * 20) +
    rngFloat(rng, 0, 15),
    0, 100), 1)

  let feasibility = 'Infeasible'
  if (feasibilityScore > 70) feasibility = 'Highly Feasible'
  else if (feasibilityScore > 50) feasibility = 'Feasible'
  else if (feasibilityScore > 30) feasibility = 'Marginally Feasible'

  const risks: string[] = []
  risks.push('Debris tumbling attitude may complicate retrieval')
  if (retrievalDeltaV > 2.5) risks.push('High delta-v to reach debris orbit')
  risks.push('Recycling efficiency depends on material separation technology readiness')
  risks.push('Legal framework for debris ownership/retrieval evolving')

  const viable = roi > 20 && feasibilityScore > 40

  return {
    target_debris: debris,
    valuation_params: params,
    retrieval_feasibility: feasibility,
    retrieval_feasibility_score: feasibilityScore,
    total_retrieval_cost_musd: totalRetrievalCost,
    propellant_cost_musd: propellantCost,
    operations_cost_musd: operationsCost,
    recovered_materials: recovered,
    total_recovered_mass_kg: roundTo(totalRecoveredMass, 1),
    total_recovered_value_musd: roundTo(totalRecoveredValue, 1),
    net_value_musd: netValue,
    environmental_credit_value_musd: envCredit,
    orbital_slot_value_musd: slotValue,
    combined_value_musd: combinedValue,
    roi_pct: roi,
    risk_factors: risks,
    technology_readiness: rngRange(rng, 3, 6),
    commercial_viability: viable ? 'Commercially Viable' : 'Not Currently Viable',
    analysis_summary: debris.object_type + ' at ' + (debris.altitude_km ?? '?') + 'km: recovery ROI=' + roi + '%, net=$' + netValue + 'M, viability=' + (viable ? 'yes' : 'no')
  }
}

function formatDebrisValuatorReport(input: DebrisValuatorInput, output: DebrisValuatorOutput): string {
  const lines: string[] = []
  lines.push('## Orbital Debris Valuation Report')
  lines.push('')
  lines.push('**Object:** ' + (output.target_debris.norad_id ?? 'unknown') + ' (' + (output.target_debris.object_type ?? 'unknown') + ')')
  lines.push('**Altitude:** ' + (output.target_debris.altitude_km ?? '?') + ' km | **Mass:** ' + (output.target_debris.mass_kg ?? '?') + ' kg')
  lines.push('**Retrieval Method:** ' + (output.valuation_params.retrieval_method ?? 'unknown'))
  lines.push('**Feasibility:** ' + output.retrieval_feasibility + ' (' + output.retrieval_feasibility_score + '/100)')
  lines.push('')

  lines.push('### Recovered Materials')
  lines.push('| Material | Mass (kg) | Purity | Price/kg | Value |')
  lines.push('|----------|-----------|--------|----------|-------|')
  for (const r of output.recovered_materials) {
    lines.push('| ' + r.material + ' | ' + r.mass_kg.toLocaleString() + ' | ' + r.purity_pct + '% | $' + r.market_price_per_kg + ' | $' + r.recovered_value_musd + 'M |')
  }
  lines.push('| **Total** | **' + output.total_recovered_mass_kg.toLocaleString() + '** | | | **$' + output.total_recovered_value_musd + 'M** |')
  lines.push('')

  lines.push('### Cost Breakdown')
  lines.push('| Item | Cost (M USD) |')
  lines.push('|------|-------------|')
  lines.push('| Propellant | $' + output.propellant_cost_musd + 'M |')
  lines.push('| Operations | $' + output.operations_cost_musd + 'M |')
  lines.push('| **Total Retrieval** | **$' + output.total_retrieval_cost_musd + 'M** |')
  lines.push('')

  lines.push('### Valuation')
  lines.push('| Component | Value (M USD) |')
  lines.push('|-----------|--------------|')
  lines.push('| Recovered Materials | $' + output.total_recovered_value_musd + 'M |')
  lines.push('| Environmental Credit | $' + output.environmental_credit_value_musd + 'M |')
  lines.push('| Orbital Slot Value | $' + output.orbital_slot_value_musd + 'M |')
  lines.push('| **Combined Value** | **$' + output.combined_value_musd + 'M** |')
  lines.push('| Net Value (minus cost) | $' + output.net_value_musd + 'M |')
  lines.push('| ROI | ' + output.roi_pct + '% |')
  lines.push('| Commercial Viability | ' + output.commercial_viability + ' |')
  lines.push('| Technology Readiness | TRL ' + output.technology_readiness + ' |')
  lines.push('')

  lines.push('### Risk Factors')
  for (const r of output.risk_factors) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Valuation uses simplified retrieval cost models. Actual missions require detailed operational analysis.*')

  return lines.join('\n')
}

// ==================== TOOL 4: LUNAR RESOURCE MAPPER ====================

function mapLunarResources(input: LunarMapperInput): LunarMapperOutput {
  const site = input.site ?? { site_name: 'Shackleton Crater Rim', latitude_deg: -89.9, longitude_deg: 0, elevation_km: 2.5, terrain_type: 'polar_region' }
  const targets = input.resource_targets ?? [{ resource_type: 'water_ice', min_concentration_ppm: 100 }]
  const mapping = input.mapping_params ?? { mapping_resolution_m: 100, survey_type: 'orbital', instrumentation: ['neutron_spectrometer', 'radar'], mission_duration_days: 365 }
  const geo = input.geological_model ?? { regolith_depth_m: 5, bedrock_type: 1, age_billion_years: 4.2, crater_density_per_km2: 15 }

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const resolution = mapping.mapping_resolution_m ?? 100
  const surveyType = mapping.survey_type ?? 'orbital'

  const coverageFactor = surveyType === 'orbital' ? 1000 : surveyType === 'rover' ? 50 : surveyType === 'sample_return' ? 10 : 200
  const coverage = roundTo(rngFloat(rng, coverageFactor * 0.3, coverageFactor), 1)

  const deposits: ResourceDeposit[] = []
  const waterIce = targets.some(t => t.resource_type === 'water_ice')
  const he3 = targets.some(t => t.resource_type === 'helium3')
  const rareEarths = targets.some(t => t.resource_type === 'rare_earths')
  const titanium = targets.some(t => t.resource_type === 'titanium')
  const aluminum = targets.some(t => t.resource_type === 'aluminum')
  const oxygen = targets.some(t => t.resource_type === 'oxygen')
  const silicon = targets.some(t => t.resource_type === 'silicon')

  if (waterIce) {
    deposits.push({
      resource: 'Water Ice',
      estimated_concentration_ppm: roundTo(rngFloat(rng, 50, 5000), 0),
      estimated_total_mass_kg: roundTo(rngFloat(rng, 1e6, 1e9), 0),
      depth_range_m: rngFloat(rng, 0.1, 3.0).toFixed(2) + ' - ' + rngFloat(rng, 1, 8).toFixed(1),
      extraction_difficulty: rng() > 0.5 ? 'Moderate' : 'Difficult',
      confidence_level: rng() > 0.6 ? 'High' : rng() > 0.3 ? 'Medium' : 'Low',
    })
  }
  if (he3) {
    deposits.push({
      resource: 'Helium-3',
      estimated_concentration_ppm: roundTo(rngFloat(rng, 1, 50), 1),
      estimated_total_mass_kg: roundTo(rngFloat(rng, 1e3, 1e6), 0),
      depth_range_m: rngFloat(rng, 1, 10).toFixed(1) + ' - ' + rngFloat(rng, 5, 20).toFixed(1),
      extraction_difficulty: 'Difficult (embedded in regolith)',
      confidence_level: rng() > 0.7 ? 'Medium' : 'Low',
    })
  }
  if (rareEarths) {
    deposits.push({
      resource: 'Rare Earth Elements',
      estimated_concentration_ppm: roundTo(rngFloat(rng, 50, 800), 0),
      estimated_total_mass_kg: roundTo(rngFloat(rng, 1e4, 1e7), 0),
      depth_range_m: rngFloat(rng, 3, 30).toFixed(1) + ' - ' + rngFloat(rng, 20, 100).toFixed(1),
      extraction_difficulty: 'Difficult',
      confidence_level: rng() > 0.5 ? 'Medium' : 'Low',
    })
  }
  if (titanium) {
    deposits.push({
      resource: 'Titanium (Ilmenite)',
      estimated_concentration_ppm: roundTo(rngFloat(rng, 1000, 15000), 0),
      estimated_total_mass_kg: roundTo(rngFloat(rng, 1e6, 1e9), 0),
      depth_range_m: '0.5 - ' + rngFloat(rng, 3, 15).toFixed(1),
      extraction_difficulty: 'Moderate',
      confidence_level: rng() > 0.6 ? 'High' : 'Medium',
    })
  }
  if (aluminum) {
    deposits.push({
      resource: 'Aluminum (Anorthite)',
      estimated_concentration_ppm: roundTo(rngFloat(rng, 5000, 30000), 0),
      estimated_total_mass_kg: roundTo(rngFloat(rng, 1e7, 1e10), 0),
      depth_range_m: '1.0 - ' + rngFloat(rng, 5, 50).toFixed(1),
      extraction_difficulty: 'Moderate',
      confidence_level: rng() > 0.5 ? 'High' : 'Medium',
    })
  }
  if (oxygen) {
    deposits.push({
      resource: 'Oxygen (Regolith-bound)',
      estimated_concentration_ppm: roundTo(rngFloat(rng, 10000, 45000), 0),
      estimated_total_mass_kg: roundTo(rngFloat(rng, 1e8, 1e11), 0),
      depth_range_m: '0.1 - ' + rngFloat(rng, 1, 5).toFixed(1),
      extraction_difficulty: 'Moderate (molten regolith electrolysis)',
      confidence_level: rng() > 0.5 ? 'High' : 'Medium',
    })
  }
  if (silicon) {
    deposits.push({
      resource: 'Silicon',
      estimated_concentration_ppm: roundTo(rngFloat(rng, 10000, 25000), 0),
      estimated_total_mass_kg: roundTo(rngFloat(rng, 1e8, 1e11), 0),
      depth_range_m: '0.5 - ' + rngFloat(rng, 3, 20).toFixed(1),
      extraction_difficulty: 'Moderate',
      confidence_level: rng() > 0.5 ? 'High' : 'Medium',
    })
  }

  const totalWater = deposits.find(d => d.resource === 'Water Ice')?.estimated_total_mass_kg ?? 0
  const totalHe3 = deposits.find(d => d.resource === 'Helium-3')?.estimated_total_mass_kg ?? 0
  const totalRE = deposits.find(d => d.resource === 'Rare Earth Elements')?.estimated_total_mass_kg ?? 0

  const anomalies: RegionalAnomaly[] = []
  const anomalyCount = rngRange(rng, 2, 8)
  const anomalyTypes = ['neutron_spectral', 'radar_reflectivity', 'thermal_inertial', 'gravitational', 'magnetic']
  for (let i = 0; i < anomalyCount; i++) {
    anomalies.push({
      anomaly_id: i + 1,
      latitude_deg: roundTo(rngFloat(rng, -90, 90), 2),
      longitude_deg: roundTo(rngFloat(rng, -180, 180), 2),
      anomaly_type: anomalyTypes[rngRange(rng, 0, anomalyTypes.length - 1)],
      anomaly_strength: roundTo(rngFloat(rng, 0.3, 1.0), 2),
      interpretation: rng() > 0.5 ? 'Possible subsurface ice' : rng() > 0.3 ? 'Regolith thickness variation' : 'Mineral concentration anomaly',
    })
  }

  const complexity = geo.crater_density_per_km2 && geo.crater_density_per_km2 > 20 ? 'High' : geo.crater_density_per_km2 && geo.crater_density_per_km2 > 10 ? 'Moderate' : 'Low'
  const confidence = surveyType === 'orbital' ? 'Regional (requires ground truth)' : surveyType === 'sample_return' ? 'Localized (high precision)' : 'Regional (moderate)'
  const missionCost = roundTo(rngFloat(rng, 100, 2000), 1)
  const zones = rngRange(rng, 1, 6)

  return {
    site,
    mapping_params: mapping,
    survey_coverage_km2: coverage,
    resolution_achieved_m: resolution,
    resource_deposits: deposits,
    regional_anomalies: anomalies,
    total_water_ice_estimate_kg: roundTo(totalWater, 0),
    total_helium3_estimate_kg: roundTo(totalHe3, 0),
    total_rare_earth_estimate_kg: roundTo(totalRE, 0),
    geological_complexity: complexity,
    recommended_extraction_zones: zones,
    mapping_confidence: confidence,
    mission_cost_estimate_musd: missionCost,
    timeline_to_production_years: roundTo(rngFloat(rng, 5, 20), 1),
    analysis_summary: site.site_name + ': ' + deposits.length + ' deposits mapped, ' + anomalies.length + ' anomalies, complexity=' + confidence
  }
}

function formatLunarMapperReport(input: LunarMapperInput, output: LunarMapperOutput): string {
  const lines: string[] = []
  lines.push('## Lunar Resource Mapping Report')
  lines.push('')
  lines.push('**Site:** ' + (output.site.site_name ?? 'Unknown') + ' (' + (output.site.terrain_type ?? 'unknown') + ')')
  lines.push('**Coordinates:** lat=' + (output.site.latitude_deg ?? '?') + ' deg, lon=' + (output.site.longitude_deg ?? '?') + ' deg')
  lines.push('**Survey Type:** ' + (output.mapping_params.survey_type ?? 'unknown') + ' | **Resolution:** ' + output.resolution_achieved_m + ' m')
  lines.push('**Coverage:** ' + output.survey_coverage_km2.toLocaleString() + ' km^2')
  lines.push('**Confidence:** ' + output.mapping_confidence)
  lines.push('')

  lines.push('### Resource Deposits')
  lines.push('| Resource | Concentration (ppm) | Total Mass (kg) | Depth Range | Difficulty | Confidence |')
  lines.push('|----------|-------------------|-----------------|-------------|------------|------------|')
  for (const d of output.resource_deposits) {
    lines.push('| ' + d.resource + ' | ' + d.estimated_concentration_ppm + ' | ' + d.estimated_total_mass_kg.toExponential(2) + ' | ' + d.depth_range_m + ' m | ' + d.extraction_difficulty + ' | ' + d.confidence_level + ' |')
  }
  lines.push('')

  lines.push('### Aggregate Resource Estimates')
  lines.push('| Resource | Total Mass (kg) |')
  lines.push('|----------|-----------------|')
  lines.push('| Water Ice | ' + output.total_water_ice_estimate_kg.toExponential(2) + ' |')
  lines.push('| Helium-3 | ' + output.total_helium3_estimate_kg.toExponential(2) + ' |')
  lines.push('| Rare Earths | ' + output.total_rare_earth_estimate_kg.toExponential(2) + ' |')
  lines.push('')

  lines.push('### Regional Anomalies')
  lines.push('| # | Lat | Lon | Type | Strength | Interpretation |')
  lines.push('|---|-----|-----|------|----------|----------------|')
  for (const a of output.regional_anomalies) {
    lines.push('| ' + a.anomaly_id + ' | ' + a.latitude_deg + ' | ' + a.longitude_deg + ' | ' + a.anomaly_type + ' | ' + a.anomaly_strength + ' | ' + a.interpretation + ' |')
  }
  lines.push('')

  lines.push('### Mission Summary')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Geological Complexity | ' + output.geological_complexity + ' |')
  lines.push('| Recommended Extraction Zones | ' + output.recommended_extraction_zones + ' |')
  lines.push('| Mission Cost Estimate | $' + output.mission_cost_estimate_musd + 'M |')
  lines.push('| Timeline to Production | ' + output.timeline_to_production_years + ' years |')
  lines.push('')

  lines.push('### Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Mapping data based on remote sensing. Ground truth validation required for resource confirmation.*')

  return lines.join('\n')
}

// ==================== TOOL 5: SPACE LOGISTICS PLANNER ====================

function planLogistics(input: LogisticsPlannerInput): LogisticsPlannerOutput {
  const route = input.route ?? { origin: { node_type: 'LEO' }, destination: { node_type: 'lunar_orbit' }, transfer_type: 'Hohmann' }
  const constraints = input.constraints ?? { max_delta_v_kms: 8, max_transfer_time_days: 180, max_payload_mass_kg: 50000, propellant_margin_pct: 15 }
  const cargo = input.cargo ?? [{ cargo_type: 'equipment', mass_kg: 5000, volume_m3: 25, priority: 'critical' }]

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const originNode = route.origin ?? { node_type: 'LEO' }
  const destNode = route.destination ?? { node_type: 'lunar_orbit' }
  const transferType = route.transfer_type ?? 'Hohmann'

  const originType = originNode.node_type ?? 'LEO'
  const destType = destNode.node_type ?? 'lunar_orbit'

  const deltaVTable: Record<string, Record<string, number>> = {
    'Earth_surface': { 'LEO': 9.3, 'GEO': 13.5, 'lunar_orbit': 15.2, 'lunar_surface': 17.0, 'EML1': 14.8, 'EML2': 15.0, 'Mars_orbit': 16.5 },
    'LEO': { 'Earth_surface': 0, 'GEO': 3.9, 'lunar_orbit': 3.9, 'lunar_surface': 5.7, 'EML1': 3.7, 'EML2': 3.4, 'Mars_orbit': 5.5 },
    'GEO': { 'LEO': 1.5, 'Earth_surface': 0, 'lunar_orbit': 2.5, 'lunar_surface': 4.3, 'EML1': 2.3, 'EML2': 2.1, 'Mars_orbit': 4.0 },
    'lunar_orbit': { 'LEO': 0.9, 'lunar_surface': 1.7, 'Earth_surface': 2.5, 'EML1': 0.7, 'EML2': 0.6, 'Mars_orbit': 3.5 },
    'lunar_surface': { 'lunar_orbit': 1.7, 'LEO': 2.5, 'EML1': 2.2, 'EML2': 2.0, 'Earth_surface': 4.0, 'Mars_orbit': 4.5 },
    'EML1': { 'lunar_orbit': 0.7, 'lunar_surface': 0.9, 'LEO': 3.2, 'GEO': 2.8, 'EML2': 0.2, 'Mars_orbit': 3.0 },
    'EML2': { 'lunar_orbit': 0.6, 'lunar_surface': 1.0, 'LEO': 3.0, 'GEO': 2.6, 'EML1': 0.2, 'Mars_orbit': 2.8 },
  }

  const durationTable: Record<string, Record<string, number>> = {
    'Earth_surface': { 'LEO': 0.01, 'GEO': 0.2, 'lunar_orbit': 3, 'lunar_surface': 5, 'EML1': 5, 'EML2': 7, 'Mars_orbit': 258 },
    'LEO': { 'Earth_surface': 0.1, 'GEO': 0.2, 'lunar_orbit': 3, 'lunar_surface': 5, 'EML1': 5, 'EML2': 7, 'Mars_orbit': 258 },
    'GEO': { 'LEO': 0.2, 'Earth_surface': 0.5, 'lunar_orbit': 5, 'lunar_surface': 7, 'EML1': 7, 'EML2': 8, 'Mars_orbit': 260 },
    'lunar_orbit': { 'LEO': 3, 'lunar_surface': 0.5, 'Earth_surface': 3, 'EML1': 1, 'EML2': 1.5, 'Mars_orbit': 255 },
    'lunar_surface': { 'lunar_orbit': 0.5, 'LEO': 5, 'EML1': 2, 'EML2': 3, 'Earth_surface': 10, 'Mars_orbit': 255 },
    'EML1': { 'lunar_orbit': 1, 'lunar_surface': 1, 'LEO': 5, 'GEO': 5, 'EML2': 0.5, 'Mars_orbit': 255 },
    'EML2': { 'lunar_orbit': 1.5, 'lunar_surface': 2, 'LEO': 7, 'GEO': 7, 'EML1': 0.5, 'Mars_orbit': 255 },
  }

  const baseDeltaV = (deltaVTable[originType]?.[destType] ?? 5.0) + rngFloat(rng, -0.2, 0.5)
  const baseDuration = (durationTable[originType]?.[destType] ?? 5) + rngFloat(rng, -0.5, 1.0)

  const transferFactor = transferType === 'bi_elliptic' ? 1.2 : transferType === 'low_thrust' ? 1.5 : transferType === 'gravity_assist' ? 0.9 : 1.0
  const effectiveDeltaV = roundTo(baseDeltaV * transferFactor, 2)
  const effectiveDuration = roundTo(baseDuration * transferFactor, 1)

  const totalMass = cargo.reduce((s, c) => s + (c.mass_kg ?? 0), 0)
  const totalVolume = cargo.reduce((s, c) => s + (c.volume_m3 ?? 0), 0)
  const maxMass = constraints.max_payload_mass_kg ?? 50000
  const massLimited = Math.min(totalMass, maxMass)

  const propellantBudget = roundTo(effectiveDeltaV * massLimited * 0.001 * (1 + rngFloat(rng, 0.05, 0.2)), 1)
  const marginPct = constraints.propellant_margin_pct ?? 15

  const maxDeltaV = constraints.max_delta_v_kms ?? 8
  const maxTime = constraints.max_transfer_time_days ?? 180
  const deltaVOk = effectiveDeltaV <= maxDeltaV
  const timeOk = effectiveDuration <= maxTime
  const massOk = totalMass <= maxMass
  const feasible = deltaVOk && timeOk && massOk

  const reason = feasible
    ? 'All constraints satisfied'
    : !deltaVOk ? 'Delta-V exceeds budget'
      : !timeOk ? 'Transfer time exceeds limit'
        : 'Payload mass exceeds capacity'

  const legs: TransferLeg[] = []
  const legOrigin = originType.replace('_', ' ')
  const legDestination = destType.replace('_', ' ')
  const startDate = new Date('2026-03-15T00:00:00Z')
  const arrivalDate = new Date(startDate.getTime() + effectiveDuration * 86400000)

  legs.push({
    leg_number: 1,
    origin: legOrigin,
    destination: legDestination,
    transfer_type: transferType,
    delta_v_kms: effectiveDeltaV,
    duration_days: effectiveDuration,
    departure_epoch: startDate.toISOString().substring(0, 10),
    arrival_epoch: arrivalDate.toISOString().substring(0, 10),
    payload_mass_kg: massLimited,
    propellant_mass_kg: propellantBudget,
  })

  const numLaunches = Math.ceil(totalMass / (constraints.max_payload_mass_kg ?? 50000))
  const costPerLaunch = 50 + rngFloat(rng, 0, 150)
  const totalCost = roundTo(numLaunches * costPerLaunch + rngFloat(rng, 10, 100), 1)

  const criticalPath: string[] = []
  criticalPath.push('Launch vehicle integration and testing')
  if (originType !== 'LEO' && originType !== 'Earth_surface') criticalPath.push('Transit to departure node')
  criticalPath.push(transferType + ' transfer: ' + legOrigin + ' to ' + legDestination)
  if (destType === 'lunar_surface') criticalPath.push('Landing and surface operations deployment')
  criticalPath.push('Cargo offloading and systems checkout')

  const risks: string[] = []
  risks.push('Launch window availability may delay departure')
  if (effectiveDeltaV > maxDeltaV * 0.8) risks.push('Delta-V close to margin limit')
  risks.push('Transfer trajectory sensitive to propulsion system performance')
  if (effectiveDuration > maxTime * 0.7) risks.push('Transfer time approaching maximum allowable')

  const windows: string[] = []
  windows.push('Window 1: ' + startDate.toISOString().substring(0, 10))
  const w2 = new Date(startDate.getTime() + 21 * 86400000)
  windows.push('Window 2: ' + w2.toISOString().substring(0, 10))

  return {
    route,
    total_delta_v_kms: effectiveDeltaV,
    total_transfer_time_days: effectiveDuration,
    feasible,
    feasibility_reason: reason,
    total_cargo_mass_kg: roundTo(totalMass, 0),
    total_cargo_volume_m3: roundTo(totalVolume, 1),
    transfer_legs: legs,
    propellant_budget_kg: propellantBudget,
    propellant_margin_pct: marginPct,
    number_of_launches: numLaunches,
    estimated_cost_musd: totalCost,
    critical_path: criticalPath,
    schedule_risks: risks,
    launch_windows: windows,
    delta_v_margin_kms: roundTo(maxDeltaV - effectiveDeltaV, 2),
    analysis_summary: legOrigin + ' to ' + legDestination + ' via ' + transferType + ': dv=' + effectiveDeltaV + 'km/s, t=' + effectiveDuration + 'd, mass=' + roundTo(totalMass,0) + 'kg, feasible=' + (feasible ? 'yes' : 'no')
  }
}

function formatLogisticsReport(input: LogisticsPlannerInput, output: LogisticsPlannerOutput): string {
  const lines: string[] = []
  lines.push('## Space Logistics Planning Report')
  lines.push('')
  const originStr = (output.route.origin?.node_type ?? 'Unknown').replace('_', ' ')
  const destStr = (output.route.destination?.node_type ?? 'Unknown').replace('_', ' ')
  lines.push('**Route:** ' + originStr + ' to ' + destStr + ' via ' + (output.route.transfer_type ?? 'Hohmann'))
  lines.push('**Feasibility:** ' + (output.feasible ? 'Feasible' : 'Infeasible') + ' - ' + output.feasibility_reason)
  lines.push('')

  lines.push('### Transfer Legs')
  lines.push('| # | Origin | Destination | Type | Delta-V | Duration | Departure | Arrival | Payload | Propellant |')
  lines.push('|---|--------|-------------|------|---------|----------|-----------|---------|---------|------------|')
  for (const t of output.transfer_legs) {
    lines.push('| ' + t.leg_number + ' | ' + t.origin + ' | ' + t.destination + ' | ' + t.transfer_type + ' | ' + t.delta_v_kms + ' km/s | ' + t.duration_days + ' d | ' + t.departure_epoch + ' | ' + t.arrival_epoch + ' | ' + t.payload_mass_kg.toLocaleString() + ' kg | ' + t.propellant_mass_kg.toLocaleString() + ' kg |')
  }
  lines.push('')

  lines.push('### Cargo Manifest')
  if (input.cargo) {
    lines.push('| Type | Mass (kg) | Volume (m3) | Priority |')
    lines.push('|------|-----------|-------------|----------|')
    for (const c of input.cargo) {
      lines.push('| ' + (c.cargo_type ?? 'unknown') + ' | ' + (c.mass_kg ?? 0).toLocaleString() + ' | ' + (c.volume_m3 ?? 0) + ' | ' + (c.priority ?? 'medium') + ' |')
    }
  }
  lines.push('')

  lines.push('### Mission Parameters')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Total Delta-V | ' + output.total_delta_v_kms + ' km/s |')
  lines.push('| Total Transfer Time | ' + output.total_transfer_time_days + ' days |')
  lines.push('| Delta-V Margin | ' + output.delta_v_margin_kms + ' km/s |')
  lines.push('| Total Cargo Mass | ' + output.total_cargo_mass_kg.toLocaleString() + ' kg |')
  lines.push('| Total Cargo Volume | ' + output.total_cargo_volume_m3 + ' m^3 |')
  lines.push('| Propellant Budget | ' + output.propellant_budget_kg.toLocaleString() + ' kg |')
  lines.push('| Propellant Margin | ' + output.propellant_margin_pct + '% |')
  lines.push('| Number of Launches | ' + output.number_of_launches + ' |')
  lines.push('| Estimated Cost | $' + output.estimated_cost_musd + 'M |')
  lines.push('')

  lines.push('### Launch Windows')
  for (const w of output.launch_windows) {
    lines.push('- ' + w)
  }
  lines.push('')

  lines.push('### Critical Path')
  for (const step of output.critical_path) {
    lines.push('- [ ] ' + step)
  }
  lines.push('')

  lines.push('### Schedule Risks')
  for (const r of output.schedule_risks) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Logistics plan uses simplified patched conic trajectories. Operational planning requires high-fidelity analysis.*')

  return lines.join('\n')
}

// ==================== TOOL 6: IN-SITU RESOURCE UTILIZATION ====================

function analyzeISRU(input: ISRUInput): ISRUOutput {
  const location = input.location ?? { location_type: 'lunar_polar' }
  const extraction = input.extraction ?? { resource: 'water', extraction_method: 'thermal_sublimation', target_production_kg_year: 1000 }
  const infra = input.infrastructure ?? { power_source: 'nuclear_reactor', power_available_kw: 100, reactor_mass_kg: 5000, robotic_automation_level: 8 }
  const constraints = input.operational_constraints ?? { mission_duration_years: 10, dust_mitigation_required: true, operating_temperature_min_k: 100, operating_temperature_max_k: 1500, maintenance_interval_months: 6 }

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const locType = location.location_type ?? 'lunar_polar'
  const resource = extraction.resource ?? 'water'
  const method = extraction.extraction_method ?? 'thermal_sublimation'
  const targetProd = extraction.target_production_kg_year ?? 1000

  const isruTRL: Record<string, number> = {
    lunar_surface: 4, lunar_polar: 3, martian_surface: 3, asteroid: 2, orbital_debris: 2,
  }
  const trl = isruTRL[locType] ?? 3

  const energyPerKg: Record<string, number> = {
    water: 15, oxygen: 25, hydrogen: 50, methane: 35, iron: 8, silicon: 12, aluminum: 18,
  }
  const extractionEff: Record<string, number> = {
    electrolysis: 0.8, thermal_sublimation: 0.6, chemical_reduction: 0.5, molten_regolith_electrolysis: 0.7, biomining: 0.3,
  }

  const energyFactor = energyPerKg[resource] ?? 20
  const effFactor = extractionEff[method] ?? 0.5

  const dailyProd = roundTo(targetProd / 365, 1)
  const annualProd = roundTo(targetProd, 0)
  const cumulative = roundTo(annualProd * (constraints.mission_duration_years ?? 10), 0)

  const productions: ProductionEstimate[] = []
  productions.push({
    resource: resource,
    daily_production_kg: dailyProd,
    annual_production_kg: annualProd,
    cumulative_production_kg: cumulative,
    energy_per_kg_kwh: roundTo(energyFactor, 1),
    extraction_efficiency_pct: roundTo(effFactor * 100, 1),
    purity_pct: roundTo(rngFloat(rng, 90, 99.5), 1),
  })

  // Co-products
  if (resource === 'water') {
    productions.push({ resource: 'Oxygen (byproduct)', daily_production_kg: roundTo(dailyProd * 0.89, 1), annual_production_kg: roundTo(annualProd * 0.89, 0), cumulative_production_kg: roundTo(cumulative * 0.89, 0), energy_per_kg_kwh: roundTo(energyFactor * 0.5, 1), extraction_efficiency_pct: roundTo(effFactor * 80, 1), purity_pct: roundTo(rngFloat(rng, 95, 99.9), 1) })
    productions.push({ resource: 'Hydrogen (byproduct)', daily_production_kg: roundTo(dailyProd * 0.11, 1), annual_production_kg: roundTo(annualProd * 0.11, 0), cumulative_production_kg: roundTo(cumulative * 0.11, 0), energy_per_kg_kwh: roundTo(energyFactor * 0.5, 1), extraction_efficiency_pct: roundTo(effFactor * 75, 1), purity_pct: roundTo(rngFloat(rng, 95, 99.9), 1) })
  } else if (resource === 'oxygen') {
    productions.push({ resource: 'Slag (metal oxides)', daily_production_kg: roundTo(dailyProd * 2.5, 1), annual_production_kg: roundTo(annualProd * 2.5, 0), cumulative_production_kg: roundTo(cumulative * 2.5, 0), energy_per_kg_kwh: roundTo(energyFactor * 1.2, 1), extraction_efficiency_pct: roundTo(effFactor * 70, 1), purity_pct: roundTo(rngFloat(rng, 80, 95), 1) })
  }

  const totalPowerKw = roundTo(energyFactor * dailyProd / 24 + rngFloat(rng, 5, 30), 1)
  const powerAvailable = infra.power_available_kw ?? 100
  const powerSurplus = roundTo(powerAvailable - totalPowerKw, 1)

  const savings: MassSavings[] = []
  const earthLaunchCostPerKg = 10000
  for (const p of productions) {
    if (p.resource !== 'Slag (metal oxides)') {
      const saved = p.cumulative_production_kg
      const costSaving = roundTo(saved * earthLaunchCostPerKg / 1e6, 1)
      savings.push({ item: p.resource, earth_launched_mass_saved_kg: roundTo(saved, 0), cost_savings_musd: costSaving })
    }
  }

  const totalMassSavings = roundTo(savings.reduce((s, m) => s + m.earth_launched_mass_saved_kg, 0), 0)
  const totalCostSavings = roundTo(savings.reduce((s, m) => s + m.cost_savings_musd, 0), 1)

  const infraCost = roundTo(rngFloat(rng, 50, 500), 1)
  const annualOpCost = roundTo(rngFloat(rng, 5, 30), 1)
  const breakEven = infraCost > 0 && totalCostSavings > 0 ? roundTo(infraCost / Math.max(totalCostSavings / Math.max(constraints.mission_duration_years ?? 1, 1), 0.01), 1) : 99
  const roi = roundTo((totalCostSavings / Math.max(infraCost, 1)) * 100, 1)

  let feasibility = 'Infeasible'
  if (powerSurplus >= 0 && roi > 30) feasibility = 'Highly Feasible'
  else if (powerSurplus >= -10 && roi > 10) feasibility = 'Feasible'
  else if (powerSurplus >= -20) feasibility = 'Marginally Feasible'

  const dustImpact = constraints.dust_mitigation_required ? 'High (regolith dust is abrasive)' : 'Moderate'
  const thermalChallenges: string[] = []
  thermalChallenges.push('Extreme thermal cycling between lunar day/night')
  const maxTemp = constraints.operating_temperature_max_k ?? 1500
  if (maxTemp > 1000) thermalChallenges.push('High-temperature process requires advanced materials')
  thermalChallenges.push('Cryogenic storage for produced propellants')
  if (constraints.operating_temperature_min_k && constraints.operating_temperature_min_k < 150) thermalChallenges.push('Startup from cryostatic state requires pre-heating')

  const techGaps: string[] = []
  techGaps.push('Long-duration reliability of extraction equipment')
  if (locType === 'asteroid') techGaps.push('Surface attachment in microgravity')
  if (method === 'biomining') techGaps.push('Biological process control in space environment')
  techGaps.push('Automated maintenance and repair capability')
  techGaps.push('Regolith handling in vacuum at scale')

  return {
    location,
    extraction,
    infrastructure: infra,
    isru_readiness_level: trl,
    overall_feasibility: feasibility,
    production_estimates: productions,
    total_power_required_kw: totalPowerKw,
    power_surplus_kw: powerSurplus,
    mass_savings: savings,
    total_mass_savings_kg: totalMassSavings,
    total_cost_savings_musd: totalCostSavings,
    infrastructure_cost_musd: infraCost,
    operational_cost_per_year_musd: annualOpCost,
    break_even_years: breakEven,
    roi_pct: roi,
    dust_impact_rating: dustImpact,
    thermal_challenges: thermalChallenges,
    technology_gaps: techGaps,
    analysis_summary: locType + ' ' + resource + ' ISRU: power=' + powerSurplus + 'kW surplus, ROI=' + roi + '%, feasibility=' + feasibility
  }
}

function formatISRUReport(input: ISRUInput, output: ISRUOutput): string {
  const lines: string[] = []
  lines.push('## In-Situ Resource Utilization Analysis Report')
  lines.push('')
  lines.push('**Location:** ' + (output.location.location_type ?? 'unknown') + ' | **Resource:** ' + (output.extraction.resource ?? 'unknown'))
  lines.push('**Extraction:** ' + (output.extraction.extraction_method ?? 'unknown') + ' | **Power:** ' + (output.infrastructure.power_source ?? 'unknown'))
  lines.push('**ISRU TRL:** ' + output.isru_readiness_level + ' | **Feasibility:** ' + output.overall_feasibility)
  lines.push('')

  lines.push('### Production Estimates')
  lines.push('| Resource | Daily (kg) | Annual (kg) | Cumulative (kg) | Energy/kg (kWh) | Efficiency | Purity |')
  lines.push('|----------|-----------|-------------|-----------------|-----------------|------------|--------|')
  for (const p of output.production_estimates) {
    lines.push('| ' + p.resource + ' | ' + p.daily_production_kg + ' | ' + p.annual_production_kg.toLocaleString() + ' | ' + p.cumulative_production_kg.toLocaleString() + ' | ' + p.energy_per_kg_kwh + ' | ' + p.extraction_efficiency_pct + '% | ' + p.purity_pct + '% |')
  }
  lines.push('')

  lines.push('### Power Budget')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Total Power Required | ' + output.total_power_required_kw + ' kW |')
  lines.push('| Power Surplus | ' + output.power_surplus_kw + ' kW |')
  lines.push('| Power Source | ' + (output.infrastructure.power_source ?? 'unknown') + ' (' + (output.infrastructure.power_available_kw ?? '?') + ' kW) |')
  lines.push('')

  lines.push('### Mass Savings vs. Earth Launch')
  lines.push('| Resource | Mass Saved (kg) | Cost Savings (M USD) |')
  lines.push('|----------|----------------|---------------------|')
  for (const m of output.mass_savings) {
    lines.push('| ' + m.item + ' | ' + m.earth_launched_mass_saved_kg.toLocaleString() + ' | $' + m.cost_savings_musd + 'M |')
  }
  lines.push('| **Total** | **' + output.total_mass_savings_kg.toLocaleString() + '** | **$' + output.total_cost_savings_musd + 'M** |')
  lines.push('')

  lines.push('### Economics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Infrastructure Cost | $' + output.infrastructure_cost_musd + 'M |')
  lines.push('| Operational Cost/Year | $' + output.operational_cost_per_year_musd + 'M |')
  lines.push('| Total Cost Savings | $' + output.total_cost_savings_musd + 'M |')
  lines.push('| Break-Even | ' + output.break_even_years + ' years |')
  lines.push('| ROI | ' + output.roi_pct + '% |')
  lines.push('')

  lines.push('### Challenges')
  lines.push('| Category | Details |')
  lines.push('|----------|---------|')
  lines.push('| Dust Impact | ' + output.dust_impact_rating + ' |')
  lines.push('| Thermal | ' + output.thermal_challenges.length + ' challenges identified |')
  lines.push('| Technology Gaps | ' + output.technology_gaps.length + ' gaps identified |')
  lines.push('')

  lines.push('### Thermal Challenges')
  for (const t of output.thermal_challenges) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('### Technology Gaps')
  for (const t of output.technology_gaps) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*ISRU analysis uses simplified process models. Actual production depends on regolith composition and equipment reliability.*')

  return lines.join('\n')
}

// ==================== TOOL 7: SPACE ECONOMICS MODELER ====================

function modelSpaceEconomics(input: EconomicsModelerInput): EconomicsModelerOutput {
  const sectors = input.sectors ?? [
    { sector_name: 'launch_services', current_revenue_busd: 12, annual_growth_rate_pct: 10, market_saturation_pct: 40 },
    { sector_name: 'space_resources', current_revenue_busd: 0.5, annual_growth_rate_pct: 45, market_saturation_pct: 1 },
    { sector_name: 'in_space_manufacturing', current_revenue_busd: 0.2, annual_growth_rate_pct: 35, market_saturation_pct: 2 },
    { sector_name: 'space_data_services', current_revenue_busd: 28, annual_growth_rate_pct: 8, market_saturation_pct: 55 },
    { sector_name: 'orbital_logistics', current_revenue_busd: 0.1, annual_growth_rate_pct: 50, market_saturation_pct: 1 },
  ]
  const supplyDemand = input.supply_demand ?? [
    { commodity: 'propellant', current_supply_units: 1000, current_demand_units: 1200, supply_growth_rate_pct: 20, demand_growth_rate_pct: 25, price_per_unit: 50000 },
    { commodity: 'water', current_supply_units: 100, current_demand_units: 500, supply_growth_rate_pct: 40, demand_growth_rate_pct: 35, price_per_unit: 25000 },
    { commodity: 'rare_earths', current_supply_units: 50, current_demand_units: 80, supply_growth_rate_pct: 15, demand_growth_rate_pct: 30, price_per_unit: 100000 },
  ]
  const scenario = input.scenario ?? { scenario_name: 'base_case', total_investment_musd: 5000, investment_horizon_years: 15, discount_rate_pct: 10, risk_adjustment_factor: 1.0 }
  const external = input.external_factors ?? { regulatory_environment: 'supportive', technology_acceleration_factor: 1.0, international_cooperation_level: 0.6, space_debris_mitigation_cost_annual_musd: 50 }

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const projections: SectorProjection[] = []
  let totalRevenueY0 = 0
  let totalRevenueY5 = 0
  let totalRevenueY10 = 0

  for (const s of sectors) {
    const y0 = s.current_revenue_busd ?? 0
    const growth = (s.annual_growth_rate_pct ?? 5) / 100
    const y5 = roundTo(y0 * Math.pow(1 + growth, 5), 2)
    const y10 = roundTo(y0 * Math.pow(1 + growth, 10), 2)
    const cagr = roundTo((Math.pow(y10 / Math.max(y0, 0.01), 0.1) - 1) * 100, 1)
    const saturation = s.market_saturation_pct ?? 50
    const share = roundTo(clamp(saturation > 0 ? (y10 / 100) * (1 - saturation / 200) : y10 / 100, 0, 40), 1)
    projections.push({ sector: s.sector_name ?? 'unknown', revenue_year_0_busd: y0, revenue_year_5_busd: y5, revenue_year_10_busd: y10, cagr_pct: cagr, market_share_pct: share })
    totalRevenueY0 += y0
    totalRevenueY5 += y5
    totalRevenueY10 += y10
  }

  const priceForecasts: PriceForecast[] = []
  for (const sd of supplyDemand) {
    const supply = sd.current_supply_units ?? 100
    const demand = sd.current_demand_units ?? 100
    const supplyGrowth = (sd.supply_growth_rate_pct ?? 5) / 100
    const demandGrowth = (sd.demand_growth_rate_pct ?? 5) / 100
    const basePrice = sd.price_per_unit ?? 1000
    const scarcityFactorY5 = demand * Math.pow(1 + demandGrowth, 5) / Math.max(supply * Math.pow(1 + supplyGrowth, 5), 1)
    const scarcityFactorY10 = demand * Math.pow(1 + demandGrowth, 10) / Math.max(supply * Math.pow(1 + supplyGrowth, 10), 1)
    const vol = roundTo(rngFloat(rng, 10, 60), 1)
    priceForecasts.push({
      commodity: sd.commodity ?? 'unknown',
      current_price: Math.round(basePrice),
      price_year_5: roundTo(basePrice * scarcityFactorY5, 0),
      price_year_10: roundTo(basePrice * scarcityFactorY10, 0),
      price_volatility_pct: vol,
      supply_demand_balance: scarcityFactorY10 > 1.5 ? 'Significant deficit' : scarcityFactorY10 > 1.0 ? 'Tight balance' : scarcityFactorY10 > 0.7 ? 'Adequate' : 'Surplus',
    })
  }

  const scenarioName = scenario.scenario_name ?? 'base_case'
  const investment = scenario.total_investment_musd ?? 5000
  const horizon = scenario.investment_horizon_years ?? 15
  const discountRate = (scenario.discount_rate_pct ?? 10) / 100
  const riskFactor = scenario.risk_adjustment_factor ?? 1.0

  const avgCagr = projections.reduce((s, p) => s + p.cagr_pct, 0) / Math.max(projections.length, 1)
  const revenueMultiple = Math.pow(1 + avgCagr / 100, horizon)
  const totalReturn = roundTo(investment * revenueMultiple * riskFactor, 1)
  const npv = roundTo(totalReturn / Math.pow(1 + discountRate, horizon) - investment, 1)
  const irr = roundTo((Math.pow(totalReturn / Math.max(investment, 1), 1 / horizon) - 1) * 100, 1)
  const payback = roundTo(investment / Math.max(totalReturn / horizon, 0.01), 1)

  const bestNpv = roundTo(npv * rngFloat(rng, 1.5, 3.0), 1)
  const worstNpv = roundTo(npv * rngFloat(rng, -1.0, 0.3), 1)

  const drivers: string[] = []
  drivers.push('Declining launch costs enabling new mission classes')
  if (external.regulatory_environment === 'supportive') drivers.push('Supportive regulatory environment accelerates licensing')
  if (external.technology_acceleration_factor && external.technology_acceleration_factor > 1) drivers.push('Technology advancement above historical trends')
  drivers.push('Growing demand for in-space infrastructure')
  drivers.push('Commercial lunar mission cadence expected to increase 5x by 2035')
  drivers.push('Space manufacturing enabling new high-value markets')

  const marketRisks: string[] = []
  marketRisks.push('Revenue projections depend on market adoption timelines')
  marketRisks.push('Commodity price volatility for space-produced materials')
  marketRisks.push('Competition from terrestrial alternatives remains strong')
  if (totalRevenueY0 < 5) marketRisks.push('Nascent revenue base amplifies uncertainty')
  marketRisks.push('Regulatory changes could alter competitive landscape')
  marketRisks.push('International tensions may disrupt supply chains')

  const regulatory = external.regulatory_environment === 'supportive'
    ? 'Favorable: national space resource laws enacted, streamlined licensing'
    : external.regulatory_environment === 'restrictive'
      ? 'Challenging: export controls and licensing delays'
      : 'Evolving: incremental regulatory framework development'

  const inflections: string[] = []
  inflections.push('2026-2028: First commercial lunar landers return data')
  inflections.push('2028-2030: In-space manufacturing pilot facilities operational')
  inflections.push('2030-2033: Asteroid mining demonstration missions')
  inflections.push('2033-2035: Space resource extraction at industrial scale')

  const gdpContrib = roundTo(totalRevenueY10 * 1.8, 1)
  const gdpGrowth = roundTo((totalRevenueY10 / Math.max(totalRevenueY0, 0.01) - 1) * 100, 1)

  return {
    scenario,
    gdp_contribution_space_sector_busd: gdpContrib,
    gdp_contribution_growth_pct: gdpGrowth,
    total_market_size_year_0_busd: roundTo(totalRevenueY0, 1),
    total_market_size_year_5_busd: roundTo(totalRevenueY5, 1),
    total_market_size_year_10_busd: roundTo(totalRevenueY10, 1),
    sector_projections: projections,
    price_forecasts: priceForecasts,
    investment_npv_musd: npv,
    investment_irr_pct: irr,
    investment_payback_years: payback,
    sensitivity_best_case_npv_musd: bestNpv,
    sensitivity_worst_case_npv_musd: worstNpv,
    key_growth_drivers: drivers,
    market_risks: marketRisks,
    regulatory_outlook: regulatory,
    technology_inflection_points: inflections,
    analysis_summary: scenarioName + ': market=$' + roundTo(totalRevenueY10,0) + 'B by year 10, NPV=$' + npv + 'M, IRR=' + irr + '%, payback=' + payback + 'y'
  }
}

function formatEconomicsReport(input: EconomicsModelerInput, output: EconomicsModelerOutput): string {
  const lines: string[] = []
  lines.push('## Space Economics Modeling Report')
  lines.push('')
  lines.push('**Scenario:** ' + (output.scenario.scenario_name ?? 'base_case') + ' | **Horizon:** ' + (output.scenario.investment_horizon_years ?? 15) + ' years')
  lines.push('**Investment:** $' + (output.scenario.total_investment_musd ?? '?') + 'M | **Discount Rate:** ' + (output.scenario.discount_rate_pct ?? 10) + '%')
  lines.push('**Risk Adjustment:** ' + (output.scenario.risk_adjustment_factor ?? 1.0) + 'x')
  lines.push('')

  lines.push('### Market Size Projections')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Year-0 Market Size | $' + output.total_market_size_year_0_busd + 'B |')
  lines.push('| Year-5 Market Size | $' + output.total_market_size_year_5_busd + 'B |')
  lines.push('| Year-10 Market Size | $' + output.total_market_size_year_10_busd + 'B |')
  lines.push('| GDP Contribution | $' + output.gdp_contribution_space_sector_busd + 'B |')
  lines.push('| GDP Growth % | ' + output.gdp_contribution_growth_pct + '% |')
  lines.push('')

  lines.push('### Sector Projections')
  lines.push('| Sector | Y0 ($B) | Y5 ($B) | Y10 ($B) | CAGR | Share % |')
  lines.push('|--------|---------|---------|----------|------|---------|')
  for (const p of output.sector_projections) {
    lines.push('| ' + p.sector + ' | ' + p.revenue_year_0_busd + ' | ' + p.revenue_year_5_busd + ' | ' + p.revenue_year_10_busd + ' | ' + p.cagr_pct + '% | ' + p.market_share_pct + '% |')
  }
  lines.push('')

  lines.push('### Price Forecasts')
  lines.push('| Commodity | Current ($/unit) | Year 5 ($/unit) | Year 10 ($/unit) | Volatility | Balance |')
  lines.push('|-----------|-------------------|-----------------|------------------|------------|---------|')
  for (const f of output.price_forecasts) {
    lines.push('| ' + f.commodity + ' | ' + f.current_price.toLocaleString() + ' | ' + f.price_year_5.toLocaleString() + ' | ' + f.price_year_10.toLocaleString() + ' | ' + f.price_volatility_pct + '% | ' + f.supply_demand_balance + ' |')
  }
  lines.push('')

  lines.push('### Investment Analysis')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| NPV | $' + output.investment_npv_musd + 'M |')
  lines.push('| IRR | ' + output.investment_irr_pct + '% |')
  lines.push('| Payback | ' + output.investment_payback_years + ' years |')
  lines.push('| Best Case NPV | $' + output.sensitivity_best_case_npv_musd + 'M |')
  lines.push('| Worst Case NPV | $' + output.sensitivity_worst_case_npv_musd + 'M |')
  lines.push('')

  lines.push('### Growth Drivers')
  for (const d of output.key_growth_drivers) {
    lines.push('- ' + d)
  }
  lines.push('')

  lines.push('### Market Risks')
  for (const r of output.market_risks) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Regulatory Outlook')
  lines.push(output.regulatory_outlook)
  lines.push('')

  lines.push('### Technology Inflection Points')
  for (const t of output.technology_inflection_points) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Economics model uses simplified supply/demand and growth projections. Actual markets depend on technology readiness and policy development.*')

  return lines.join('\n')
}

// ==================== TOOL 8: ORBITAL SLOT OPTIMIZER ====================

function optimizeOrbitalSlots(input: OrbitalSlotOptimizerInput): OrbitalSlotOptimizerOutput {
  const reqs = input.satellite_requirements ?? [
    { satellite_id: 1, service_type: 'communications', coverage_longitude_min_deg: -30, coverage_longitude_max_deg: 30, frequency_band: 'Ku' },
    { satellite_id: 2, service_type: 'broadcast', coverage_longitude_min_deg: 30, coverage_longitude_max_deg: 90, frequency_band: 'C' },
    { satellite_id: 3, service_type: 'communications', coverage_longitude_min_deg: 90, coverage_longitude_max_deg: 150, frequency_band: 'Ku' },
  ]
  const regime = input.orbital_regime ?? { regime_type: 'GEO', orbit_altitude_km: 35786, orbit_inclination_deg: 0, station_keeping_delta_v_ms_year: 50 }
  const constraints = input.slot_constraints ?? { min_separation_deg: 2, interference_threshold_db: -120, maximum_satellites_per_slot: 3, priority_rules: 'first_come_first_served' }
  const criteria = input.optimization_criteria ?? { maximize_coverage: true, minimize_interference: true, equidistribute_slots: true, respect_filing_priority: true }

  const seed = computeSeed(input as Record<string, unknown>)
  const rng = mulberry32(seed)

  const minSep = constraints.min_separation_deg ?? 2
  const regimeType = regime.regime_type ?? 'GEO'
  const maxLong = regimeType === 'GEO' ? 360 : regimeType === 'MEO' ? 180 : 360

  const assignments: SlotAssignment[] = []
  const usedSlots: number[] = []
  let assignedCount = 0
  let unassignedCount = 0

  for (const req of reqs) {
    const satId = req.satellite_id ?? assignedCount + unassignedCount + 1
    const covMin = req.coverage_longitude_min_deg ?? -30
    const covMax = req.coverage_longitude_max_deg ?? 30

    let assigned: number
    if (usedSlots.length === 0) {
      assigned = roundTo((covMin + covMax) / 2, 2)
    } else {
      assigned = roundTo((covMin + covMax) / 2, 2)
      // Try to find a slot that respects minimum separation
      let attempts = 0
      const maxAttempts = 20
      while (attempts < maxAttempts) {
        let valid = true
        for (const used of usedSlots) {
          if (Math.abs(assigned - used) < minSep) {
            valid = false
            break
          }
        }
        if (valid) break
        assigned = roundTo((covMin + covMax) / 2 + rngFloat(rng, -15, 15), 2)
        attempts++
      }
    }

    const conflicts: number[] = []
    for (const a of assignments) {
      if (Math.abs(assigned - a.assigned_longitude_deg) < minSep) {
        conflicts.push(a.satellite_id)
      }
    }

    const coverage = roundTo((Math.abs(covMax - covMin)) / 2, 1)
    const interference = roundTo(rngFloat(rng, -180, conflicts.length > 0 ? -100 : -140), 1)
    const fuel = roundTo((regime.station_keeping_delta_v_ms_year ?? 50) * rngFloat(rng, 0.8, 1.2) / 10, 2)
    const priority = criteria.respect_filing_priority && satId <= 3 ? 'High (filing priority)' : rng() > 0.5 ? 'Standard' : 'Low (secondary)'
    const needsCoordination = interference > (constraints.interference_threshold_db ?? -120) && conflicts.length > 0

    if (conflicts.length === 0 || usedSlots.length < maxLong / minSep) {
      assignments.push({
        satellite_id: satId,
        assigned_longitude_deg: assigned,
        assigned_latitude_offset_deg: roundTo(rngFloat(rng, -0.1, 0.1), 3),
        coverage_radius_deg: coverage,
        interference_level_db: interference,
        station_keeping_fuel_kg_year: fuel,
        slot_priority: priority,
        conflicts_with: conflicts,
        coordination_required: needsCoordination,
      })
      usedSlots.push(assigned)
      assignedCount++
    } else {
      unassignedCount++
    }
  }

  const totalFuel = roundTo(assignments.reduce((s, a) => s + a.station_keeping_fuel_kg_year, 0), 2)
  const availSlots = Math.max(Math.floor(maxLong / minSep) - assignedCount, 0)

  const coverageValues = assignments.map(a => a.coverage_radius_deg * 2)
  const avgCoverage = coverageValues.length > 0 ? coverageValues.reduce((s, v) => s + v, 0) / coverageValues.length : 0
  const coverageUniformity = roundTo(clamp(100 - (avgCoverage > 0 ? Math.max(...coverageValues.map(v => Math.abs(v - avgCoverage))) / avgCoverage * 100 : 50), 0, 100), 1)

  const interferenceValues = assignments.map(a => a.interference_level_db)
  const avgInterference = interferenceValues.length > 0 ? interferenceValues.reduce((s, v) => s + v, 0) / interferenceValues.length : 0
  const peakInterference = interferenceValues.length > 0 ? Math.min(...interferenceValues) : 0

  const optCriteriaScore = roundTo(clamp(
    coverageUniformity * 0.3 +
    (avgInterference < -130 ? 20 : avgInterference < -110 ? 10 : 5) +
    (assignedCount / Math.max(reqs.length, 1)) * 30 +
    (availSlots > 5 ? 20 : availSlots * 4),
    0, 100), 1)

  const compliant = avgInterference < (constraints.interference_threshold_db ?? -120) && assignments.every(a => a.conflicts_with.length <= (constraints.maximum_satellites_per_slot ?? 3) - 1)

  const conflicts: string[] = []
  for (const a of assignments) {
    if (a.coordination_required) {
      conflicts.push('Sat-' + a.satellite_id + ' requires coordination with Sat-' + a.conflicts_with.join(','))
    }
  }

  const recommendations: string[] = []
  recommendations.push('Maintain ' + minSep + ' deg minimum separation for all GEO co-frequency operations')
  if (unassignedCount > 0) recommendations.push(unassignedCount + ' satellite(s) require reassignment to avoid interference')
  recommendations.push('Implement automated station-keeping to prevent longitudinal drift')
  recommendations.push('Establish coordination framework with adjacent operators')
  recommendations.push('Consider inclined orbit operation for end-of-life disposal')

  return {
    orbital_regime: regime,
    slot_constraints: constraints,
    total_satellites: reqs.length,
    assigned_satellites: assignedCount,
    unassigned_satellites: unassignedCount,
    slot_assignments: assignments,
    coverage_uniformity_pct: coverageUniformity,
    average_interference_db: roundTo(avgInterference, 1),
    peak_interference_db: roundTo(peakInterference, 1),
    total_station_keeping_fuel_kg_year: totalFuel,
    available_slots_remaining: availSlots,
    optimization_score: optCriteriaScore,
    regulatory_compliance: compliant ? 'Fully Compliant' : 'Requires Coordination',
    conflict_resolution_notes: conflicts,
    recommendations,
    analysis_summary: regimeType + ': ' + assignedCount + '/' + reqs.length + ' assigned, coverage uniformity=' + coverageUniformity + '%, interference=' + roundTo(avgInterference,1) + 'dB, compliance=' + (compliant ? 'yes' : 'no')
  }
}

function formatOrbitalSlotReport(input: OrbitalSlotOptimizerInput, output: OrbitalSlotOptimizerOutput): string {
  const lines: string[] = []
  lines.push('## Orbital Slot Optimization Report')
  lines.push('')
  lines.push('**Regime:** ' + (output.orbital_regime.regime_type ?? 'GEO') + ' | **Altitude:** ' + (output.orbital_regime.orbit_altitude_km ?? '?') + ' km')
  lines.push('**Min Separation:** ' + (output.slot_constraints.min_separation_deg ?? '?') + ' deg | **Max per slot:** ' + (output.slot_constraints.maximum_satellites_per_slot ?? '?'))
  lines.push('**Priority Rule:** ' + (output.slot_constraints.priority_rules ?? 'unknown'))
  lines.push('**Optimization Score:** ' + output.optimization_score + '/100')
  lines.push('')

  lines.push('### Slot Assignments')
  lines.push('| Sat ID | Longitude (deg) | Lat Offset | Coverage (rad) | Interference (dB) | Fuel (kg/y) | Priority | Coordination |')
  lines.push('|--------|-----------------|------------|----------------|-------------------|-------------|----------|--------------|')
  for (const a of output.slot_assignments) {
    lines.push('| SAT-' + a.satellite_id + ' | ' + a.assigned_longitude_deg + ' | ' + a.assigned_latitude_offset_deg + ' | ' + a.coverage_radius_deg + ' | ' + a.interference_level_db + ' | ' + a.station_keeping_fuel_kg_year + ' | ' + a.slot_priority + ' | ' + (a.coordination_required ? 'Yes' : 'No') + ' |')
  }
  lines.push('')

  lines.push('### Optimization Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Satellites | ' + output.total_satellites + ' |')
  lines.push('| Assigned | ' + output.assigned_satellites + ' |')
  lines.push('| Unassigned | ' + output.unassigned_satellites + ' |')
  lines.push('| Coverage Uniformity | ' + output.coverage_uniformity_pct + '% |')
  lines.push('| Average Interference | ' + output.average_interference_db + ' dB |')
  lines.push('| Peak Interference | ' + output.peak_interference_db + ' dB |')
  lines.push('| Station-Keeping Fuel | ' + output.total_station_keeping_fuel_kg_year + ' kg/year |')
  lines.push('| Available Slots | ' + output.available_slots_remaining + ' |')
  lines.push('| Regulatory Compliance | ' + output.regulatory_compliance + ' |')
  lines.push('| Optimization Score | ' + output.optimization_score + '/100 |')
  lines.push('')

  if (output.conflict_resolution_notes.length > 0) {
    lines.push('### Conflict Resolution')
    for (const c of output.conflict_resolution_notes) {
      lines.push('- ' + c)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of output.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(output.analysis_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Slot optimization uses simplified colinear GEO model. Operational deployment requires ITU coordination and detailed interference analysis.*')

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Asteroid Mining Feasibility
  tools.register(defineTool({
    name: 'asteroid_mining_feasibility',
    description: 'Evaluates feasibility of mining a specific asteroid based on orbital parameters (delta-v), mineral composition, extraction method, and economic returns. Returns mineral yield analysis, NPV, ROI, and risk factors.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: target{designation, semi_major_axis_au, eccentricity, inclination_deg, asteroid_type (C-type|S-type|M-type|V-type), estimated_diameter_m, delta_v_kms}, mining_params{target_return_mass_kg, mining_duration_years, extraction_method (surface|shallow_depth|deep_mining|thermal_extraction), propulsion_type (chemical|electric|solar_sail|nuclear_thermal)}, economic_constraints{max_budget_musd, min_roi_pct, discount_rate_pct, commodity_prices}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: AsteroidMiningInput = JSON.parse(args.input_data)
      const output = assessAsteroidMining(input)
      return formatAsteroidMiningReport(input, output)
    }
  }))

  // Tool 2: Space Manufacturing Optimizer
  tools.register(defineTool({
    name: 'space_manufacturing_optimizer',
    description: 'Optimizes manufacturing processes in microgravity (fiber optics, pharmaceuticals, alloys, crystal growth, bioprinting, semiconductors). Returns process steps, microgravity advantages, production metrics, and profit analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: process{process_type, material_input, target_output_kg, quality_grade}, facility{available_volume_m3, power_budget_kw, crew_time_hours_per_week, resupply_interval_months, manufacturing_location (LEO_station|lunar_surface|deep_space_habitat|free_flyer)}, economic_targets{target_unit_cost_kg, min_profit_margin_pct, market_demand_kg_per_year}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: ManufacturingInput = JSON.parse(args.input_data)
      const output = optimizeManufacturing(input)
      return formatManufacturingReport(input, output)
    }
  }))

  // Tool 3: Orbital Debris Valuator
  tools.register(defineTool({
    name: 'orbital_debris_valuator',
    description: 'Values orbital debris objects for recycling/salvage operations. Returns recovered material analysis, retrieval cost breakdown, net value, and commercial viability assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: target_debris{norad_id, object_type (spent_stage|fragment|defunct_satellite|rocket_body|mission_related_debris), altitude_km, inclination_deg, mass_kg, material_composition, delta_v_to_reach_kms}, valuation_params{retrieval_method (robotic_armed|tether_net|laser_abation|aerobrake_capture), recycling_efficiency_pct, commodity_price_index, retrieval_budget_musd}, market_assumptions{aluminum_price_per_kg, titanium_price_per_kg, rare_earth_price_per_kg, composite_price_per_kg, copper_price_per_kg}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: DebrisValuatorInput = JSON.parse(args.input_data)
      const output = valueOrbitalDebris(input)
      return formatDebrisValuatorReport(input, output)
    }
  }))

  // Tool 4: Lunar Resource Mapper
  tools.register(defineTool({
    name: 'lunar_resource_mapper',
    description: 'Maps lunar surface resources at specified sites (water ice, helium-3, rare earths, titanium, aluminum, oxygen, silicon). Returns deposit estimates, resource concentrations, regional anomalies, and confidence levels.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: site{site_name, latitude_deg, longitude_deg, elevation_km, terrain_type (mare|highland|crater_floor|polar_region|rille)}, resource_targets[{resource_type (water_ice|helium3|rare_earths|titanium|aluminum|oxygen|silicon)}], mapping_params{mapping_resolution_m, survey_type (orbital|rover|static_lander|sample_return), instrumentation, mission_duration_days}, geological_model{regolith_depth_m, age_billion_years, crater_density_per_km2}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: LunarMapperInput = JSON.parse(args.input_data)
      const output = mapLunarResources(input)
      return formatLunarMapperReport(input, output)
    }
  }))

  // Tool 5: Space Logistics Planner
  tools.register(defineTool({
    name: 'space_logistics_planner',
    description: 'Plans cargo logistics between space nodes (Earth surface, LEO, GEO, lunar orbit, lunar surface, EML1/2, Mars orbit). Returns transfer legs, delta-v budgets, propellant requirements, launch windows, and feasibility assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: nodes{node_types with delta_v/duration tables}, route{origin{node_type}, destination{node_type}, transfer_type (Hohmann|bi_elliptic|low_thrust|gravity_assist|direct)}, cargo[{cargo_type, mass_kg, volume_m3, priority}], constraints{max_delta_v_kms, max_transfer_time_days, max_payload_mass_kg, propellant_margin_pct}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: LogisticsPlannerInput = JSON.parse(args.input_data)
      const output = planLogistics(input)
      return formatLogisticsReport(input, output)
    }
  }))

  // Tool 6: In-Situ Resource Utilization Analyzer
  tools.register(defineTool({
    name: 'in_situ_resource_utilization',
    description: 'Analyzes ISRU feasibility for extracting resources at lunar, Martian, or asteroid locations. Returns production estimates, energy budgets, mass savings vs. earth launch, cost analysis, and technology gaps.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: location{location_type (lunar_surface|lunar_polar|martian_surface|asteroid|orbital_debris), coordinates}, extraction{resource (water|oxygen|hydrogen|methane|iron|silicon|aluminum), extraction_method (electrolysis|thermal_sublimation|chemical_reduction|molten_regolith_electrolysis|biomining), target_production_kg_year}, infrastructure{power_source (solar_array|nuclear_reactor|radioisotope|fuel_cell), power_available_kw}, operational_constraints{mission_duration_years, dust_mitigation_required, maintenance_interval_months}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: ISRUInput = JSON.parse(args.input_data)
      const output = analyzeISRU(input)
      return formatISRUReport(input, output)
    }
  }))

  // Tool 7: Space Economics Modeler
  tools.register(defineTool({
    name: 'space_economics_modeler',
    description: 'Models the space economy across sectors (launch, resources, manufacturing, data services, logistics). Returns market projections, sector CAGR, price forecasts, investment NPV/IRR, and scenario analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: sectors[{sector_name, current_revenue_busd, annual_growth_rate_pct, market_saturation_pct}], supply_demand[{commodity, current_supply_units, current_demand_units, supply_growth_rate_pct, demand_growth_rate_pct, price_per_unit}], scenario{scenario_name, total_investment_musd, investment_horizon_years, discount_rate_pct, risk_adjustment_factor}, external_factors{regulatory_environment, technology_acceleration_factor}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: EconomicsModelerInput = JSON.parse(args.input_data)
      const output = modelSpaceEconomics(input)
      return formatEconomicsReport(input, output)
    }
  }))

  // Tool 8: Orbital Slot Optimizer
  tools.register(defineTool({
    name: 'orbital_slot_optimizer',
    description: 'Optimizes orbital slot allocation for GEO/MEO satellite constellations. Returns slot assignments, interference analysis, coverage uniformity, station-keeping fuel budgets, and coordination requirements.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: satellite_requirements[{satellite_id, service_type, coverage_longitude_min_deg, coverage_longitude_max_deg, frequency_band (L|S|C|X|Ku|Ka|V)}], orbital_regime{regime_type (GEO|MEO|HEO|molniya|TUNDRA), orbit_altitude_km, station_keeping_delta_v_ms_year}, slot_constraints{min_separation_deg, interference_threshold_db, maximum_satellites_per_slot, priority_rules}, optimization_criteria{maximize_coverage, minimize_interference, equidistribute_slots, respect_filing_priority}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      const input: OrbitalSlotOptimizerInput = JSON.parse(args.input_data)
      const output = optimizeOrbitalSlots(input)
      return formatOrbitalSlotReport(input, output)
    }
  }))

  console.log('[dsh-tool-spaceresources] Loaded v' + VERSION + ' - Space Resources & Mining Toolkit with 8 tools')
  console.log('  Tools: asteroid_mining_feasibility, space_manufacturing_optimizer, orbital_debris_valuator, lunar_resource_mapper, space_logistics_planner, in_situ_resource_utilization, space_economics_modeler, orbital_slot_optimizer')
}
