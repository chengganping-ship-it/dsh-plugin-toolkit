/**
 * DSH Fusion Energy & Plasma Physics Plugin v0.1.0
 * 核聚变能源与等离子体物理工具集 for DeepSeek Harness
 *
 * 2026: Fusion energy investment $50B+; private fusion companies $10B+.
 *
 * Tool list:
 * 1. tokamak_designer            — 托卡马克设计（大半径、小半径、磁场、等离子体电流）
 * 2. plasma_confinement_analyzer — 等离子体约束分析（能量约束时间、比压、密度极限）
 * 3. fusion_fuel_cycle_optimizer — 聚变燃料循环优化（D-T, D-D, D-He3, p-B11）
 * 4. reactor_materials_selector  — 反应堆材料选择（第一壁、包层、偏滤器、超导磁体）
 * 5. tritium_breeding_calculator  — 氚增殖计算（TBR、增殖包层设计）
 * 6. magnetic_field_configurator — 磁场配置（环向场、极向场、TF/PF线圈）
 * 7. fusion_economics_modeler    — 聚变经济学（CAPEX、LCOE、建设周期）
 * 8. regulatory_pathway_fusion   — 聚变监管路径（许可框架、安全标准）
 *
 * @module dsh-tool-fusionenergy | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-fusionenergy'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 -- Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 -- Interface Definitions ====================

// --- Tool 1: Tokamak Designer ---
export interface TokamakDesignInput {
  major_radius_m: number
  minor_radius_m: number
  magnetic_field_t: number
  plasma_current_ma: number
  elongation: number
  triangularity: number
  fusion_power_mw: number
  wall_material: 'tungsten' | 'beryllium' | 'liquid_lithium' | 'sic'
}

export interface TokamakGeometry {
  aspect_ratio: number
  plasma_volume_m3: number
  plasma_surface_area_m2: number
  cross_section_area_m2: number
}

export interface TokamakPerformance {
  fusion_gain_q: number
  energy_confinement_time_s: number
  plasma_density_m3: number
  plasma_temperature_kev: number
  beta_pct: number
  bootstrap_fraction: number
}

export interface TokamakDesignResult {
  geometry: TokamakGeometry
  performance: TokamakPerformance
  power_balance: { heating_power_mw: number; alpha_power_mw: number; neutron_power_mw: number; thermal_power_mw: number }
  feasibility_score: number
  recommendation: string
  risk_factors: string[]
}

// --- Tool 2: Plasma Confinement Analyzer ---
export interface PlasmaConfinementInput {
  magnetic_field_t: number
  plasma_current_ma: number
  major_radius_m: number
  minor_radius_m: number
  line_avg_density_m3: number
  heating_power_mw: number
  confinement_mode: 'L-mode' | 'H-mode' | 'I-mode' | 'ELMy'
  isotope: 'D-T' | 'D-D' | 'D-He3'
}

export interface ConfinementMetrics {
  energy_confinement_time_s: number
  tau_e_scaling: number
  h_factor: number
  power_loss_mw: number
  power_loss_threshold_mw: number
}

export interface StabilityLimits {
  greenwald_density_limit_m3: number
  beta_limit_pct: number
  kink_current_limit_ma: number
  density_margin: number
  beta_margin: number
}

export interface PlasmaConfinementResult {
  confinement: ConfinementMetrics
  stability: StabilityLimits
  fusion_power_mw: number
  fusion_gain_q: number
  confinement_quality: string
  recommendation: string
  operational_regime: string
}

// --- Tool 3: Fusion Fuel Cycle Optimizer ---
export interface FuelCycleInput {
  fuel_type: 'D-T' | 'D-D' | 'D-He3' | 'p-B11'
  fusion_power_mw: number
  availability_target_pct: number
  tritium_breeding_ratio: number
  blanket_multiplier: number
  fuel_recirculation_fraction: number
}

export interface FuelCycleMetrics {
  reactions_per_second: number
  tritium_consumption_kg_year: number
  helium_production_kg_year: number
  neutron_energy_mw: number
  charged_particle_energy_mw: number
  fuel_efficiency_pct: number
}

export interface FuelCycleEconomics {
  fuel_cost_musd_year: number
  tritium_inventory_kg: number
  tritium_startup_kg: number
  doubling_time_years: number
  fuel_self_sufficiency: boolean
}

export interface FuelCycleResult {
  fuel_type: string
  metrics: FuelCycleMetrics
  economics: FuelCycleEconomics
  waste_profile: { activation_level: string; half_life_years: number; disposal_route: string }
  recommendation: string
  sustainability_score: number
}

// --- Tool 4: Reactor Materials Selector ---
export interface MaterialsInput {
  component: 'first_wall' | 'blanket' | 'divertor' | 'magnet' | 'vacuum_vessel'
  neutron_wall_load_mw_m2: number
  surface_heat_flux_mw_m2: number
  operating_temp_c: number
  neutron_fluence_n_m2: number
  stress_requirement_mpa: number
  radiation_resistance_required: boolean
}

export interface MaterialCandidate {
  name: string
  composition: string
  max_temp_c: number
  thermal_conductivity_w_m_k: number
  neutron_resistance: string
  activation_level: string
  availability: string
  cost_index: number
}

export interface MaterialsResult {
  component: string
  candidates: MaterialCandidate[]
  selected_material: string
  selection_rationale: string
  lifetime_years: number
  replacement_frequency: string
  tritium_retention_index: number
  recommendation: string
}

// --- Tool 5: Tritium Breeding Calculator ---
export interface TritiumBreedingInput {
  blanket_type: 'lithium_ceramic' | 'lithium_lead' | 'molten_salt' | 'helium_cooled'
  neutron_wall_load_mw_m2: number
  blanket_thickness_m: number
  lithium6_enrichment_pct: number
  coolant_type: 'helium' | 'water' | 'lithium_lead' | 'molten_salt'
  structural_material: 'rafm_steel' | 'ods_steel' | 'sic_composite'
  multiplier_material: 'beryllium' | 'lead' | 'none'
}

export interface BreedingMetrics {
  tritium_breeding_ratio: number
  tritium_production_g_day: number
  tritium_production_kg_year: number
  energy_multiplication_factor: number
  blanket_energy_gain: number
}

export interface TritiumInventory {
  startup_inventory_kg: number
  circulating_inventory_kg: number
  loss_rate_g_day: number
  doubling_time_years: number
  self_sufficiency_achieved: boolean
}

export interface TritiumBreedingResult {
  blanket_type: string
  breeding: BreedingMetrics
  inventory: TritiumInventory
  extraction_method: string
  safety_classification: string
  recommendation: string
  viability_score: number
}

// --- Tool 6: Magnetic Field Configurator ---
export interface MagneticFieldInput {
  major_radius_m: number
  minor_radius_m: number
  toroidal_field_t: number
  plasma_current_ma: number
  tf_coil_count: number
  pf_coil_count: number
  superconductor: 'Nb3Sn' | 'NbTi' | 'REBCO' | 'BSCCO'
  max_field_on_coil_t: number
}

export interface ToroidalFieldConfig {
  tf_coil_count: number
  tf_conductor_mass_tonnes: number
  tf_stored_energy_gj: number
  tf_power_mw: number
  field_ripple_pct: number
}

export interface PoloidalFieldConfig {
  pf_coil_count: number
  pf_conductor_mass_tonnes: number
  vertical_field_stability: number
  elongation_capability: number
  shaping_flexibility: string
}

export interface SuperconductorSpecs {
  material: string
  critical_temp_k: number
  critical_field_t: number
  operating_temp_k: number
  current_density_a_mm2: number
  margin_of_safety: number
}

export interface MagneticFieldResult {
  toroidal: ToroidalFieldConfig
  poloidal: PoloidalFieldConfig
  superconductor: SuperconductorSpecs
  total_coil_mass_tonnes: number
  cryogenic_power_kw: number
  recommendation: string
  field_quality_score: number
}

// --- Tool 7: Fusion Economics Modeler ---
export interface FusionEconomicsInput {
  fusion_power_mw: number
  construction_time_years: number
  availability_pct: number
  plant_lifetime_years: number
  superconducting_magnet_cost_musd: number
  blanket_cost_musd: number
  building_cost_musd: number
  turbine_cost_musd: number
  interest_rate_pct: number
  carbon_price_usd_tonne: number
}

export interface CapitalCosts {
  total_capex_musd: number
  specific_capex_usd_kw: number
  construction_financing_musd: number
  contingency_pct: number
  capex_breakdown: { magnets_pct: number; blanket_pct: number; building_pct: number; turbine_pct: number; other_pct: number }
}

export interface OperatingCosts {
  annual_opex_musd: number
  fuel_cost_musd_year: number
  blanket_replacement_cost_musd_year: number
  staffing_cost_musd_year: number
  waste_disposal_musd_year: number
}

export interface RevenueModel {
  annual_revenue_musd: number
  lcoe_usd_mwh: number
  carbon_credit_revenue_musd_year: number
  payback_period_years: number
  npv_musd: number
  irr_pct: number
}

export interface FusionEconomicsResult {
  capital: CapitalCosts
  operating: OperatingCosts
  revenue: RevenueModel
  competitiveness: string
  recommendation: string
  economic_viability_score: number
}

// --- Tool 8: Regulatory Pathway Fusion ---
export interface RegulatoryInput {
  country: 'USA' | 'UK' | 'EU' | 'China' | 'Japan' | 'South_Korea'
  reactor_type: 'tokamak' | 'stellarator' | 'inertial' | 'field_reversed' | 'mirror'
  thermal_power_mw: number
  tritium_inventory_kg: number
  site_type: 'greenfield' | 'retrofit' | 'nuclear_campus'
  public_engagement_level: 'low' | 'medium' | 'high'
}

export interface RegulatoryFramework {
  primary_regulator: string
  licensing_pathway: string
  regulatory_status: string
  key_regulations: string[]
  estimated_timeline_months: number
}

export interface SafetyRequirements {
  dose_limit_msv_year: number
  tritium_release_limit_bq_year: number
  seismic_requirement: string
  emergency_planning_zone_km: number
  waste_disposal_class: string
}

export interface RegulatoryPathwayResult {
  country: string
  framework: RegulatoryFramework
  safety: SafetyRequirements
  key_milestones: { milestone: string; timeline_months: number; status: string }[]
  stakeholder_engagement: string
  recommendation: string
  regulatory_risk: string
}

// ==================== SECTION 3 -- Analysis Functions ====================

// --- Tool 1: Tokamak Designer ---
function analyzeTokamakDesign(input: TokamakDesignInput): TokamakDesignResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const aspectRatio = input.major_radius_m / input.minor_radius_m
  const crossSectionArea = Math.PI * input.minor_radius_m * input.minor_radius_m * input.elongation
  const plasmaVolume = 2 * Math.PI * input.major_radius_m * crossSectionArea
  const plasmaSurface = 4 * Math.PI * Math.PI * input.major_radius_m * input.minor_radius_m * Math.sqrt((1 + input.elongation * input.elongation) / 2)

  const tauE = 0.0562 * Math.pow(input.plasma_current_ma, 0.93) * Math.pow(input.magnetic_field_t, 0.15) * Math.pow(input.major_radius_m, 1.97) * Math.pow(input.minor_radius_m, 0.58) * Math.pow(1e19, 0.41) / Math.pow(input.fusion_power_mw, 0.69)
  const plasmaDensity = 1e19 * rng.nextFloat(0.8, 1.2)
  const plasmaTemp = rng.nextFloat(10, 25)
  const beta = (2 * 4 * Math.PI * 1e-7 * plasmaDensity * 1.38e-23 * plasmaTemp * 1e3 * 1.6e-19) / (input.magnetic_field_t * input.magnetic_field_t / (2 * 4 * Math.PI * 1e-7)) * 100
  const bootstrapFraction = rng.nextFloat(0.2, 0.6)

  const alphaPower = input.fusion_power_mw * 0.2
  const neutronPower = input.fusion_power_mw * 0.8
  const heatingPower = input.fusion_power_mw * 0.05
  const thermalPower = input.fusion_power_mw * 0.85
  const fusionGain = input.fusion_power_mw / (heatingPower + 0.001)

  const feasibilityScore = Math.min(100, Math.round((fusionGain * 5 + (20 - Math.abs(plasmaTemp - 15)) * 2 + (beta < 5 ? beta * 5 : 25) + rng.nextFloat(5, 15)) * 100) / 100)

  const riskFactors: string[] = []
  if (aspectRatio < 2.5) riskFactors.push('Low aspect ratio may limit confinement')
  if (beta > 5) riskFactors.push('Beta exceeds Troyon limit risk')
  if (input.elongation > 2.0) riskFactors.push('High elongation increases vertical displacement risk')
  if (input.magnetic_field_t > 13) riskFactors.push('High magnetic field challenges superconducting magnet technology')
  if (riskFactors.length === 0) riskFactors.push('No critical risk factors identified')

  const recommendation = feasibilityScore > 75 ? 'Highly feasible: design parameters within proven physics basis'
    : feasibilityScore > 50 ? 'Moderately feasible: some parameters require optimization'
    : feasibilityScore > 30 ? 'Challenging: significant design modifications recommended'
    : 'Not feasible: fundamental redesign required'

  return {
    geometry: {
      aspect_ratio: Math.round(aspectRatio * 100) / 100,
      plasma_volume_m3: Math.round(plasmaVolume * 100) / 100,
      plasma_surface_area_m2: Math.round(plasmaSurface * 100) / 100,
      cross_section_area_m2: Math.round(crossSectionArea * 100) / 100,
    },
    performance: {
      fusion_gain_q: Math.round(fusionGain * 100) / 100,
      energy_confinement_time_s: Math.round(tauE * 1000) / 1000,
      plasma_density_m3: Math.round(plasmaDensity),
      plasma_temperature_kev: Math.round(plasmaTemp * 100) / 100,
      beta_pct: Math.round(beta * 100) / 100,
      bootstrap_fraction: Math.round(bootstrapFraction * 100) / 100,
    },
    power_balance: {
      heating_power_mw: Math.round(heatingPower * 100) / 100,
      alpha_power_mw: Math.round(alphaPower * 100) / 100,
      neutron_power_mw: Math.round(neutronPower * 100) / 100,
      thermal_power_mw: Math.round(thermalPower * 100) / 100,
    },
    feasibility_score: feasibilityScore,
    recommendation,
    risk_factors: riskFactors,
  }
}

// --- Tool 2: Plasma Confinement Analyzer ---
function analyzePlasmaConfinement(input: PlasmaConfinementInput): PlasmaConfinementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const hFactor: Record<string, number> = { 'L-mode': 1.0, 'H-mode': 1.8, 'I-mode': 1.3, 'ELMy': 1.5 }
  const h = hFactor[input.confinement_mode] || 1.0

  const ip98y2 = 0.0562 * Math.pow(input.plasma_current_ma, 0.93) * Math.pow(input.magnetic_field_t, 0.15) * Math.pow(input.major_radius_m, 1.97) * Math.pow(input.minor_radius_m, 0.58) * Math.pow(input.line_avg_density_m3 / 1e19, 0.41) / Math.pow(input.heating_power_mw, 0.69)
  const tauE = ip98y2 * h
  const powerLoss = input.heating_power_mw * (1 - 1 / (h + 0.01))
  const powerThreshold = input.heating_power_mw * rng.nextFloat(0.6, 0.85)

  const greenwaldLimit = input.plasma_current_ma / (Math.PI * input.minor_radius_m * input.minor_radius_m) * 1e6
  const betaLimit = 2.8 * input.magnetic_field_t / input.plasma_current_ma
  const kinkLimit = input.plasma_current_ma * rng.nextFloat(1.2, 1.8)
  const densityMargin = (greenwaldLimit - input.line_avg_density_m3) / greenwaldLimit
  const betaActual = (2 * 4 * Math.PI * 1e-7 * input.line_avg_density_m3 * 1.38e-23 * 15e3 * 1.6e-19) / (input.magnetic_field_t * input.magnetic_field_t / (2 * 4 * Math.PI * 1e-7)) * 100
  const betaMargin = (betaLimit - betaActual) / betaLimit

  const fusionPower = input.heating_power_mw * h * rng.nextFloat(0.5, 3.0)
  const fusionGain = fusionPower / (input.heating_power_mw + 0.001)

  const confinementQuality = h > 1.5 ? 'Excellent (H-mode)' : h > 1.1 ? 'Good (I-mode)' : 'Standard (L-mode)'
  const operationalRegime = densityMargin > 0.2 && betaMargin > 0.2 ? 'Comfortable operating space' : densityMargin > 0 ? 'Near density limit' : 'Exceeds density limit'

  const recommendation = fusionGain > 5 ? 'Strong confinement: Q>5 achievable with current parameters'
    : fusionGain > 1 ? 'Moderate confinement: Q>1 achievable, optimization needed for Q>5'
    : 'Weak confinement: significant heating power increase or confinement improvement needed'

  return {
    confinement: {
      energy_confinement_time_s: Math.round(tauE * 1000) / 1000,
      tau_e_scaling: Math.round(ip98y2 * 1000) / 1000,
      h_factor: h,
      power_loss_mw: Math.round(powerLoss * 100) / 100,
      power_loss_threshold_mw: Math.round(powerThreshold * 100) / 100,
    },
    stability: {
      greenwald_density_limit_m3: Math.round(greenwaldLimit),
      beta_limit_pct: Math.round(betaLimit * 100) / 100,
      kink_current_limit_ma: Math.round(kinkLimit * 100) / 100,
      density_margin: Math.round(densityMargin * 100) / 100,
      beta_margin: Math.round(betaMargin * 100) / 100,
    },
    fusion_power_mw: Math.round(fusionPower * 100) / 100,
    fusion_gain_q: Math.round(fusionGain * 100) / 100,
    confinement_quality: confinementQuality,
    recommendation,
    operational_regime: operationalRegime,
  }
}

// --- Tool 3: Fusion Fuel Cycle Optimizer ---
function analyzeFuelCycle(input: FuelCycleInput): FuelCycleResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const reactionEnergy: Record<string, number> = { 'D-T': 17.6, 'D-D': 3.65, 'D-He3': 18.3, 'p-B11': 8.7 }
  const energyPerReaction = reactionEnergy[input.fuel_type] || 17.6
  const reactionsPerSecond = input.fusion_power_mw * 1e6 / (energyPerReaction * 1.6e-13)

  const tritiumFraction: Record<string, number> = { 'D-T': 1.0, 'D-D': 0.0, 'D-He3': 0.0, 'p-B11': 0.0 }
  const tritiumConsumption = tritiumFraction[input.fuel_type] ? reactionsPerSecond * 1.0 * 5.01e-27 * 365.25 * 24 * 3600 : 0
  const heliumProduction = reactionsPerSecond * 6.65e-27 * 365.25 * 24 * 3600

  const neutronFraction: Record<string, number> = { 'D-T': 0.8, 'D-D': 0.37, 'D-He3': 0.05, 'p-B11': 0.0 }
  const neutronEnergy = input.fusion_power_mw * (neutronFraction[input.fuel_type] || 0.8)
  const chargedEnergy = input.fusion_power_mw - neutronEnergy
  const fuelEfficiency = input.fuel_type === 'D-T' ? rng.nextFloat(0.85, 0.98) : rng.nextFloat(0.6, 0.85)

  const tritiumCostPerGram = 30000
  const fuelCost = tritiumConsumption * tritiumCostPerGram / 1e6
  const tritiumInventory = tritiumConsumption * rng.nextFloat(2, 5)
  const tritiumStartup = tritiumConsumption * rng.nextFloat(1, 3)
  const doublingTime = input.tritium_breeding_ratio > 1 ? Math.log(2) / Math.log(input.tritium_breeding_ratio) * 365.25 : 999
  const fuelSelfSufficiency = input.tritium_breeding_ratio >= 1.0 && input.fuel_type === 'D-T'

  const activationLevel = input.fuel_type === 'D-T' ? 'High (14 MeV neutrons)' : input.fuel_type === 'D-D' ? 'Moderate' : 'Low'
  const halfLife = input.fuel_type === 'D-T' ? rng.nextFloat(5, 20) : rng.nextFloat(1, 10)
  const disposalRoute = input.fuel_type === 'D-T' ? 'Geological disposal or recycling' : 'Near-surface disposal or clearance'

  const sustainabilityScore = Math.round((fuelEfficiency * 30 + (fuelSelfSufficiency ? 30 : 0) + (input.fuel_type === 'p-B11' ? 25 : 10) + rng.nextFloat(5, 20)) * 100) / 100

  const recommendation = input.fuel_type === 'D-T' ? 'D-T is the most mature fuel cycle; focus on tritium self-sufficiency'
    : input.fuel_type === 'D-D' ? 'D-D eliminates tritium but requires higher temperatures and confinement'
    : input.fuel_type === 'D-He3' ? 'D-He3 is aneutronic but He3 supply is extremely limited'
    : 'p-B11 is fully aneutronic but requires extreme plasma conditions (T > 100 keV)'

  return {
    fuel_type: input.fuel_type,
    metrics: {
      reactions_per_second: Math.round(reactionsPerSecond * 100) / 100,
      tritium_consumption_kg_year: Math.round(tritiumConsumption * 10000) / 10000,
      helium_production_kg_year: Math.round(heliumProduction * 100) / 100,
      neutron_energy_mw: Math.round(neutronEnergy * 100) / 100,
      charged_particle_energy_mw: Math.round(chargedEnergy * 100) / 100,
      fuel_efficiency_pct: Math.round(fuelEfficiency * 100 * 100) / 100,
    },
    economics: {
      fuel_cost_musd_year: Math.round(fuelCost * 100) / 100,
      tritium_inventory_kg: Math.round(tritiumInventory * 100) / 100,
      tritium_startup_kg: Math.round(tritiumStartup * 100) / 100,
      doubling_time_years: Math.round(doublingTime * 100) / 100,
      fuel_self_sufficiency: fuelSelfSufficiency,
    },
    waste_profile: { activation_level: activationLevel, half_life_years: Math.round(halfLife * 100) / 100, disposal_route: disposalRoute },
    recommendation,
    sustainability_score: sustainabilityScore,
  }
}

// --- Tool 4: Reactor Materials Selector ---
function analyzeMaterials(input: MaterialsInput): MaterialsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const candidates: MaterialCandidate[] = []

  if (input.component === 'first_wall') {
    candidates.push({ name: 'Tungsten', composition: 'W (>99.9%)', max_temp_c: 3422, thermal_conductivity_w_m_k: 173, neutron_resistance: 'Good', activation_level: 'Moderate', availability: 'High', cost_index: 70 })
    candidates.push({ name: 'Beryllium', composition: 'Be (>99%)', max_temp_c: 1287, thermal_conductivity_w_m_k: 200, neutron_resistance: 'Excellent (neutron multiplier)', activation_level: 'Low', availability: 'Medium', cost_index: 90 })
    candidates.push({ name: 'SiC/SiC Composite', composition: 'SiC fibers + matrix', max_temp_c: 1600, thermal_conductivity_w_m_k: 25, neutron_resistance: 'Excellent', activation_level: 'Very Low', availability: 'Low', cost_index: 95 })
  } else if (input.component === 'blanket') {
    candidates.push({ name: 'EUROFER97', composition: 'RAFMS (9Cr-1W)', max_temp_c: 550, thermal_conductivity_w_m_k: 30, neutron_resistance: 'Good', activation_level: 'Low-Moderate', availability: 'Medium', cost_index: 60 })
    candidates.push({ name: 'ODS Steel', composition: 'ODS-RAFM', max_temp_c: 700, thermal_conductivity_w_m_k: 25, neutron_resistance: 'Very Good', activation_level: 'Low', availability: 'Low', cost_index: 85 })
    candidates.push({ name: 'SiC/SiC', composition: 'SiC composite', max_temp_c: 1000, thermal_conductivity_w_m_k: 20, neutron_resistance: 'Excellent', activation_level: 'Very Low', availability: 'Low', cost_index: 95 })
  } else if (input.component === 'divertor') {
    candidates.push({ name: 'Tungsten Monoblock', composition: 'W-Cu alloy', max_temp_c: 3422, thermal_conductivity_w_m_k: 200, neutron_resistance: 'Good', activation_level: 'Moderate', availability: 'High', cost_index: 75 })
    candidates.push({ name: 'CFC', composition: 'Carbon fiber composite', max_temp_c: 2500, thermal_conductivity_w_m_k: 100, neutron_resistance: 'Poor (tritium retention)', activation_level: 'Low', availability: 'Medium', cost_index: 65 })
  } else if (input.component === 'magnet') {
    candidates.push({ name: 'Nb3Sn', composition: 'Nb3Sn superconductor', max_temp_c: 18, thermal_conductivity_w_m_k: 50, neutron_resistance: 'Requires shielding', activation_level: 'Low', availability: 'High', cost_index: 80 })
    candidates.push({ name: 'REBCO', composition: 'YBCO tape', max_temp_c: 77, thermal_conductivity_w_m_k: 10, neutron_resistance: 'Good (HTS)', activation_level: 'Very Low', availability: 'Medium', cost_index: 95 })
  } else {
    candidates.push({ name: '316L Stainless Steel', composition: 'SS316L', max_temp_c: 800, thermal_conductivity_w_m_k: 15, neutron_resistance: 'Moderate', activation_level: 'Moderate', availability: 'Very High', cost_index: 30 })
    candidates.push({ name: 'RAFMS', composition: 'Reduced activation FM steel', max_temp_c: 550, thermal_conductivity_w_m_k: 30, neutron_resistance: 'Good', activation_level: 'Low', availability: 'Medium', cost_index: 60 })
  }

  const selected = candidates[0]!
  const lifetime = Math.round(rng.nextFloat(3, 10) * 10) / 10
  const replacementFreq = lifetime < 5 ? 'Frequent replacement required' : lifetime < 8 ? 'Standard replacement cycle' : 'Long-life component'
  const tritiumRetention = input.component === 'first_wall' ? Math.round(rng.nextFloat(0.1, 0.5) * 100) / 100 : Math.round(rng.nextFloat(0.01, 0.1) * 100) / 100

  const recommendation = selected.neutron_resistance === 'Excellent' || selected.neutron_resistance === 'Very Good'
    ? selected.name + ' is the optimal choice for ' + input.component + ' given radiation resistance requirements'
    : selected.name + ' is a viable option but consider radiation shielding and replacement strategy'

  return {
    component: input.component,
    candidates,
    selected_material: selected.name,
    selection_rationale: 'Selected based on neutron resistance, thermal performance, and availability for ' + input.component,
    lifetime_years: lifetime,
    replacement_frequency: replacementFreq,
    tritium_retention_index: tritiumRetention,
    recommendation,
  }
}

// --- Tool 5: Tritium Breeding Calculator ---
function analyzeTritiumBreeding(input: TritiumBreedingInput): TritiumBreedingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const baseTBR: Record<string, number> = { lithium_ceramic: 1.15, lithium_lead: 1.05, molten_salt: 1.2, helium_cooled: 1.1 }
  const base = baseTBR[input.blanket_type] || 1.1
  const enrichmentBoost = 1 + (input.lithium6_enrichment_pct / 100 - 0.075) * 0.5
  const multiplierBoost = input.multiplier_material !== 'none' ? rng.nextFloat(1.05, 1.2) : 1.0
  const tbr = base * enrichmentBoost * multiplierBoost

  const tritiumProduction = input.neutron_wall_load_mw_m2 * 1e6 * 24 * 3600 / (14.1e6 * 1.6e-19) * 3.016 * 1.66e-27 * 0.8
  const tritiumKgYear = tritiumProduction * 365.25 / 1000
  const energyMult = rng.nextFloat(1.1, 1.4)
  const blanketEnergyGain = tbr * energyMult

  const startupInventory = tritiumKgYear * rng.nextFloat(1, 3)
  const circulatingInventory = tritiumKgYear * rng.nextFloat(0.5, 1.5)
  const lossRate = tritiumProduction * rng.nextFloat(0.001, 0.01)
  const doublingTime = tbr > 1 ? Math.round(Math.log(2) / Math.log(tbr) * 100) / 100 : 999
  const selfSufficiency = tbr >= 1.05

  const extractionMethod = input.blanket_type === 'molten_salt' ? 'Online extraction via helium sparging'
    : input.blanket_type === 'lithium_lead' ? 'Liquid metal permeation extraction'
    : 'Thermal desorption and permeation'

  const safetyClass = input.coolant_type === 'water' ? 'Safety Class 1 (high pressure)'
    : input.coolant_type === 'helium' ? 'Safety Class 2 (high temperature)'
    : 'Safety Class 2 (chemical hazard)'

  const viabilityScore = Math.round((tbr * 30 + (selfSufficiency ? 25 : 0) + (energyMult - 1) * 50 + rng.nextFloat(5, 20)) * 100) / 100

  const recommendation = tbr > 1.1 ? 'Excellent breeding: TBR > 1.1 ensures tritium self-sufficiency with margin'
    : tbr > 1.0 ? 'Adequate breeding: TBR > 1.0 but limited margin; optimize blanket design'
    : 'Insufficient breeding: TBR < 1.0; increase lithium-6 enrichment or add neutron multiplier'

  return {
    blanket_type: input.blanket_type,
    breeding: {
      tritium_breeding_ratio: Math.round(tbr * 100) / 100,
      tritium_production_g_day: Math.round(tritiumProduction * 1000 * 100) / 100,
      tritium_production_kg_year: Math.round(tritiumKgYear * 100) / 100,
      energy_multiplication_factor: Math.round(energyMult * 100) / 100,
      blanket_energy_gain: Math.round(blanketEnergyGain * 100) / 100,
    },
    inventory: {
      startup_inventory_kg: Math.round(startupInventory * 100) / 100,
      circulating_inventory_kg: Math.round(circulatingInventory * 100) / 100,
      loss_rate_g_day: Math.round(lossRate * 1000 * 100) / 100,
      doubling_time_years: doublingTime,
      self_sufficiency_achieved: selfSufficiency,
    },
    extraction_method: extractionMethod,
    safety_classification: safetyClass,
    recommendation,
    viability_score: viabilityScore,
  }
}

// --- Tool 6: Magnetic Field Configurator ---
function analyzeMagneticField(input: MagneticFieldInput): MagneticFieldResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const tfConductorMass = input.tf_coil_count * input.major_radius_m * input.toroidal_field_t * rng.nextFloat(8, 15)
  const tfStoredEnergy = 0.5 * input.tf_coil_count * input.major_radius_m * input.toroidal_field_t * input.toroidal_field_t * 1e-9
  const tfPower = tfStoredEnergy * rng.nextFloat(0.01, 0.05)
  const fieldRipple = rng.nextFloat(0.1, 1.0) * (12 / input.tf_coil_count)

  const pfConductorMass = input.pf_coil_count * input.major_radius_m * rng.nextFloat(2, 6)
  const verticalStability = rng.nextFloat(0.7, 0.95)
  const elongationCap = input.pf_coil_count >= 6 ? rng.nextFloat(1.5, 2.2) : rng.nextFloat(1.2, 1.6)
  const shapingFlex = input.pf_coil_count >= 8 ? 'High (advanced shaping)' : input.pf_coil_count >= 5 ? 'Medium (standard shaping)' : 'Limited (basic shaping)'

  const scSpecs: Record<string, { tc: number; bc: number; op: number; j: number }> = {
    Nb3Sn: { tc: 18, bc: 30, op: 4.2, j: 1000 },
    NbTi: { tc: 9, bc: 15, op: 4.2, j: 500 },
    REBCO: { tc: 92, bc: 120, op: 20, j: 2000 },
    BSCCO: { tc: 110, bc: 150, op: 20, j: 800 },
  }
  const sc = scSpecs[input.superconductor] || scSpecs.Nb3Sn
  const marginOfSafety = sc ? (sc.bc - input.max_field_on_coil_t) / sc.bc : 0

  const totalCoilMass = tfConductorMass + pfConductorMass
  const cryoPower = sc ? (sc.op < 10 ? 50 : 20) * input.tf_coil_count * rng.nextFloat(0.5, 1.5) : 50

  const fieldQualityScore = Math.round((verticalStability * 25 + (1 - fieldRipple / 2) * 25 + marginOfSafety * 25 + (elongationCap / 2.5) * 25) * 100) / 100

  const recommendation = marginOfSafety > 0.2 && fieldRipple < 1.0
    ? 'Magnetic field configuration is well-optimized'
    : marginOfSafety > 0.1
    ? 'Configuration is acceptable but consider increasing superconductor margin'
    : 'Configuration requires optimization: field ripple or safety margin insufficient'

  return {
    toroidal: {
      tf_coil_count: input.tf_coil_count,
      tf_conductor_mass_tonnes: Math.round(tfConductorMass),
      tf_stored_energy_gj: Math.round(tfStoredEnergy * 100) / 100,
      tf_power_mw: Math.round(tfPower * 100) / 100,
      field_ripple_pct: Math.round(fieldRipple * 100) / 100,
    },
    poloidal: {
      pf_coil_count: input.pf_coil_count,
      pf_conductor_mass_tonnes: Math.round(pfConductorMass),
      vertical_field_stability: Math.round(verticalStability * 100) / 100,
      elongation_capability: Math.round(elongationCap * 100) / 100,
      shaping_flexibility: shapingFlex,
    },
    superconductor: {
      material: input.superconductor,
      critical_temp_k: sc ? sc.tc : 18,
      critical_field_t: sc ? sc.bc : 30,
      operating_temp_k: sc ? sc.op : 4.2,
      current_density_a_mm2: sc ? sc.j : 1000,
      margin_of_safety: Math.round(marginOfSafety * 100) / 100,
    },
    total_coil_mass_tonnes: Math.round(totalCoilMass),
    cryogenic_power_kw: Math.round(cryoPower),
    recommendation,
    field_quality_score: fieldQualityScore,
  }
}

// --- Tool 7: Fusion Economics Modeler ---
function analyzeFusionEconomics(input: FusionEconomicsInput): FusionEconomicsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const otherCapex = input.fusion_power_mw * rng.nextFloat(0.5, 1.5)
  const totalCapex = input.superconducting_magnet_cost_musd + input.blanket_cost_musd + input.building_cost_musd + input.turbine_cost_musd + otherCapex
  const specificCapex = totalCapex * 1e6 / (input.fusion_power_mw * 1000)
  const contingency = rng.nextFloat(15, 30)
  const constructionFinancing = totalCapex * (Math.pow(1 + input.interest_rate_pct / 100, input.construction_time_years) - 1)

  const capexTotal = totalCapex * (1 + contingency / 100)
  const magnetsPct = Math.round(input.superconducting_magnet_cost_musd / capexTotal * 100 * 100) / 100
  const blanketPct = Math.round(input.blanket_cost_musd / capexTotal * 100 * 100) / 100
  const buildingPct = Math.round(input.building_cost_musd / capexTotal * 100 * 100) / 100
  const turbinePct = Math.round(input.turbine_cost_musd / capexTotal * 100 * 100) / 100
  const otherPct = Math.round(100 - magnetsPct - blanketPct - buildingPct - turbinePct * 100) / 100

  const annualOpex = capexTotal * rng.nextFloat(0.02, 0.05)
  const fuelCost = input.fusion_power_mw * 0.01
  const blanketReplacement = input.blanket_cost_musd * 0.05
  const staffingCost = rng.nextFloat(20, 80)
  const wasteDisposal = rng.nextFloat(5, 20)

  const annualGeneration = input.fusion_power_mw * input.availability_pct / 100 * 8760 / 1000
  const electricityPrice = rng.nextFloat(60, 120)
  const annualRevenue = annualGeneration * 1000 * electricityPrice / 1e6
  const carbonCredit = annualGeneration * 1000 * 0.4 * input.carbon_price_usd_tonne / 1e6
  const totalAnnualRevenue = annualRevenue + carbonCredit
  const netAnnual = totalAnnualRevenue - annualOpex - fuelCost - blanketReplacement - staffingCost - wasteDisposal
  const payback = netAnnual > 0 ? Math.round(capexTotal / netAnnual * 10) / 10 : 99
  const npv = Math.round((netAnnual * input.plant_lifetime_years * 0.6 - capexTotal) * 100) / 100
  const irr = Math.round(rng.nextFloat(5, 18) * 100) / 100
  const lcoe = Math.round((capexTotal * 1e6 * 0.08 + annualOpex * 1e6 + fuelCost * 1e6) / (annualGeneration * 1000) * 100) / 100

  const competitiveness = lcoe < 80 ? 'Competitive with renewables+storage' : lcoe < 120 ? 'Competitive with fossil+CCS' : 'Premium pricing required (early market)'

  const economicViability = Math.round((npv > 0 ? 30 : 10) + (irr > 10 ? 25 : irr > 5 ? 15 : 5) + (payback < 20 ? 25 : payback < 30 ? 15 : 5) + rng.nextFloat(5, 20) * 100) / 100

  const recommendation = npv > 0 && irr > 8 ? 'Economically viable: positive NPV and acceptable IRR'
    : npv > 0 ? 'Marginally viable: positive NPV but IRR below target'
    : 'Not economically viable at current cost levels; cost reduction or policy support needed'

  return {
    capital: {
      total_capex_musd: Math.round(capexTotal * 100) / 100,
      specific_capex_usd_kw: Math.round(specificCapex),
      construction_financing_musd: Math.round(constructionFinancing * 100) / 100,
      contingency_pct: Math.round(contingency * 100) / 100,
      capex_breakdown: { magnets_pct: magnetsPct, blanket_pct: blanketPct, building_pct: buildingPct, turbine_pct: turbinePct, other_pct: otherPct },
    },
    operating: {
      annual_opex_musd: Math.round(annualOpex * 100) / 100,
      fuel_cost_musd_year: Math.round(fuelCost * 100) / 100,
      blanket_replacement_cost_musd_year: Math.round(blanketReplacement * 100) / 100,
      staffing_cost_musd_year: Math.round(staffingCost * 100) / 100,
      waste_disposal_musd_year: Math.round(wasteDisposal * 100) / 100,
    },
    revenue: {
      annual_revenue_musd: Math.round(totalAnnualRevenue * 100) / 100,
      lcoe_usd_mwh: lcoe,
      carbon_credit_revenue_musd_year: Math.round(carbonCredit * 100) / 100,
      payback_period_years: payback,
      npv_musd: npv,
      irr_pct: irr,
    },
    competitiveness,
    recommendation,
    economic_viability_score: economicViability,
  }
}

// --- Tool 8: Regulatory Pathway Fusion ---
function analyzeRegulatoryPathway(input: RegulatoryInput): RegulatoryPathwayResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const regulators: Record<string, string> = {
    USA: 'Nuclear Regulatory Commission (NRC) / Department of Energy (DOE)',
    UK: 'Environment Agency (EA) / Office for Nuclear Regulation (ONR)',
    EU: 'European Commission / National Nuclear Regulators',
    China: 'National Nuclear Safety Administration (NNSA)',
    Japan: 'Nuclear Regulation Authority (NRA)',
    South_Korea: 'Nuclear Safety and Security Commission (NSSC)',
  }

  const pathways: Record<string, string> = {
    USA: '10 CFR Part 50/52 or fusion-specific framework (NRC 2023 determination)',
    UK: 'Fusion regulatory framework (EA/ONR 2022)',
    EU: 'EU fusion safety framework / national regulations',
    China: 'NNSA fusion licensing framework',
    Japan: 'NRA fusion facility regulations',
    South_Korea: 'NSSA fusion reactor licensing',
  }

  const statuses: Record<string, string> = {
    USA: 'Fusion-specific framework established (2023)',
    UK: 'Fusion-specific framework in development',
    EU: 'Under review; ITER precedent applies',
    China: 'Developing; CFETR pilot program',
    Japan: 'JT-60SA and ITER-driven framework',
    South_Korea: 'KSTAR-based regulatory development',
  }

  const keyRegs: Record<string, string[]> = {
    USA: ['10 CFR Part 50', '10 CFR Part 52', 'NRC SECY-23-0050', 'Fusion Systems Rulemaking'],
    UK: ['Environmental Permitting Regulations', 'Nuclear Installations Act 1965', 'Fusion Regulatory Framework'],
    EU: ['EU Basic Safety Standards', 'Waste Framework Directive', 'Nuclear Safety Directive'],
    China: ['Nuclear Safety Law', 'Radioactive Pollution Prevention Law', 'Fusion Safety Guidelines'],
    Japan: ['Reactor Regulation Act', 'Radiation Hazard Prevention Act', 'Fusion Safety Guidelines'],
    South_Korea: ['Nuclear Safety Act', 'Radioactive Waste Management Act', 'Fusion Safety Standards'],
  }

  const timelineBase: Record<string, number> = { USA: 60, UK: 48, EU: 72, China: 54, Japan: 66, South_Korea: 60 }
  const timeline = (timelineBase[input.country] || 60) + rng.nextInt(-12, 24)

  const doseLimit = 1
  const tritiumLimit = input.tritium_inventory_kg * 1e9 * 0.001
  const seismicReq = input.thermal_power_mw > 500 ? 'SSE 0.3g minimum' : 'SSE 0.2g minimum'
  const epz = input.thermal_power_mw > 1000 ? 16 : input.thermal_power_mw > 300 ? 8 : 3
  const wasteClass = input.thermal_power_mw > 500 ? 'Class C low-level waste' : 'Class A low-level waste'

  const milestones: { milestone: string; timeline_months: number; status: string }[] = [
    { milestone: 'Pre-application engagement', timeline_months: 6, status: 'Initiated' },
    { milestone: 'Site selection and characterization', timeline_months: 12, status: 'In progress' },
    { milestone: 'Preliminary safety analysis report', timeline_months: 24, status: 'Planned' },
    { milestone: 'Construction permit application', timeline_months: 36, status: 'Planned' },
    { milestone: 'Public hearing and stakeholder review', timeline_months: 42, status: 'Planned' },
    { milestone: 'Operating license issuance', timeline_months: timeline, status: 'Target' },
  ]

  const stakeholderEng = input.public_engagement_level === 'high' ? 'Proactive engagement: public hearings, community advisory board, transparent reporting'
    : input.public_engagement_level === 'medium' ? 'Standard engagement: public comment period, information sessions'
    : 'Minimal engagement: regulatory-driven process only'

  const riskLevel = input.country === 'USA' || input.country === 'UK' ? 'Low (established framework)'
    : input.country === 'China' || input.country === 'Japan' ? 'Medium (developing framework)'
    : 'Medium-High (evolving framework)'

  const recommendation = input.country === 'USA' || input.country === 'UK'
    ? 'Favorable regulatory environment: proceed with licensing engagement'
    : 'Engage early with regulators: framework still evolving, early mover advantage possible'

  return {
    country: input.country,
    framework: {
      primary_regulator: regulators[input.country] || 'National nuclear regulator',
      licensing_pathway: pathways[input.country] || 'National fusion licensing framework',
      regulatory_status: statuses[input.country] || 'Under development',
      key_regulations: keyRegs[input.country] || ['National nuclear safety regulations'],
      estimated_timeline_months: timeline,
    },
    safety: {
      dose_limit_msv_year: doseLimit,
      tritium_release_limit_bq_year: Math.round(tritiumLimit),
      seismic_requirement: seismicReq,
      emergency_planning_zone_km: epz,
      waste_disposal_class: wasteClass,
    },
    key_milestones: milestones,
    stakeholder_engagement: stakeholderEng,
    recommendation,
    regulatory_risk: riskLevel,
  }
}

// ==================== SECTION 4 -- Report Formatting Functions ====================

function formatTokamakReport(result: TokamakDesignResult): string {
  const lines: string[] = []
  lines.push('## Tokamak Design Report')
  lines.push('')
  lines.push('Feasibility Score: ' + result.feasibility_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Geometry')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Aspect Ratio | ' + result.geometry.aspect_ratio + ' |')
  lines.push('| Plasma Volume | ' + result.geometry.plasma_volume_m3 + ' m3 |')
  lines.push('| Surface Area | ' + result.geometry.plasma_surface_area_m2 + ' m2 |')
  lines.push('| Cross-section | ' + result.geometry.cross_section_area_m2 + ' m2 |')
  lines.push('')
  lines.push('### Performance')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Fusion Gain (Q) | ' + result.performance.fusion_gain_q + ' |')
  lines.push('| Confinement Time | ' + result.performance.energy_confinement_time_s + ' s |')
  lines.push('| Plasma Density | ' + result.performance.plasma_density_m3 + ' m-3 |')
  lines.push('| Plasma Temperature | ' + result.performance.plasma_temperature_kev + ' keV |')
  lines.push('| Beta | ' + result.performance.beta_pct + '% |')
  lines.push('| Bootstrap Fraction | ' + result.performance.bootstrap_fraction + ' |')
  lines.push('')
  lines.push('### Power Balance')
  lines.push('| Component | Power |')
  lines.push('|-----------|-------|')
  lines.push('| Heating Power | ' + result.power_balance.heating_power_mw + ' MW |')
  lines.push('| Alpha Power | ' + result.power_balance.alpha_power_mw + ' MW |')
  lines.push('| Neutron Power | ' + result.power_balance.neutron_power_mw + ' MW |')
  lines.push('| Thermal Power | ' + result.power_balance.thermal_power_mw + ' MW |')
  lines.push('')
  lines.push('### Risk Factors')
  for (const r of result.risk_factors) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatPlasmaConfinementReport(result: PlasmaConfinementResult): string {
  const lines: string[] = []
  lines.push('## Plasma Confinement Analysis Report')
  lines.push('')
  lines.push('Confinement Quality: ' + result.confinement_quality)
  lines.push('Operational Regime: ' + result.operational_regime)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Confinement Metrics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Energy Confinement Time | ' + result.confinement.energy_confinement_time_s + ' s |')
  lines.push('| ITER89P Scaling | ' + result.confinement.tau_e_scaling + ' s |')
  lines.push('| H-factor | ' + result.confinement.h_factor + ' |')
  lines.push('| Power Loss | ' + result.confinement.power_loss_mw + ' MW |')
  lines.push('| Power Threshold | ' + result.confinement.power_loss_threshold_mw + ' MW |')
  lines.push('')
  lines.push('### Stability Limits')
  lines.push('| Limit | Value |')
  lines.push('|-------|-------|')
  lines.push('| Greenwald Density Limit | ' + result.stability.greenwald_density_limit_m3 + ' m-3 |')
  lines.push('| Beta Limit (Troyon) | ' + result.stability.beta_limit_pct + '% |')
  lines.push('| Kink Current Limit | ' + result.stability.kink_current_limit_ma + ' MA |')
  lines.push('| Density Margin | ' + result.stability.density_margin + ' |')
  lines.push('| Beta Margin | ' + result.stability.beta_margin + ' |')
  lines.push('')
  lines.push('### Fusion Performance')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Fusion Power | ' + result.fusion_power_mw + ' MW |')
  lines.push('| Fusion Gain (Q) | ' + result.fusion_gain_q + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatFuelCycleReport(result: FuelCycleResult): string {
  const lines: string[] = []
  lines.push('## Fusion Fuel Cycle Analysis')
  lines.push('')
  lines.push('Fuel Type: ' + result.fuel_type)
  lines.push('Sustainability Score: ' + result.sustainability_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Fuel Cycle Metrics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Reactions/s | ' + result.metrics.reactions_per_second.toExponential(2) + ' |')
  lines.push('| Tritium Consumption | ' + result.metrics.tritium_consumption_kg_year + ' kg/year |')
  lines.push('| Helium Production | ' + result.metrics.helium_production_kg_year + ' kg/year |')
  lines.push('| Neutron Energy | ' + result.metrics.neutron_energy_mw + ' MW |')
  lines.push('| Charged Particle Energy | ' + result.metrics.charged_particle_energy_mw + ' MW |')
  lines.push('| Fuel Efficiency | ' + result.metrics.fuel_efficiency_pct + '% |')
  lines.push('')
  lines.push('### Economics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Fuel Cost | $' + result.economics.fuel_cost_musd_year + 'M/year |')
  lines.push('| Tritium Inventory | ' + result.economics.tritium_inventory_kg + ' kg |')
  lines.push('| Tritium Startup | ' + result.economics.tritium_startup_kg + ' kg |')
  lines.push('| Doubling Time | ' + result.economics.doubling_time_years + ' years |')
  lines.push('| Self-Sufficiency | ' + (result.economics.fuel_self_sufficiency ? 'Yes' : 'No') + ' |')
  lines.push('')
  lines.push('### Waste Profile')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Activation Level | ' + result.waste_profile.activation_level + ' |')
  lines.push('| Half-life | ' + result.waste_profile.half_life_years + ' years |')
  lines.push('| Disposal Route | ' + result.waste_profile.disposal_route + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatMaterialsReport(result: MaterialsResult): string {
  const lines: string[] = []
  lines.push('## Reactor Materials Selection Report')
  lines.push('')
  lines.push('Component: ' + result.component)
  lines.push('Selected Material: ' + result.selected_material)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Candidate Materials')
  lines.push('| Material | Max Temp (C) | Thermal Cond. | Neutron Resist. | Cost Index |')
  lines.push('|----------|-------------|---------------|-----------------|------------|')
  for (const c of result.candidates) {
    lines.push('| ' + c.name + ' | ' + c.max_temp_c + ' | ' + c.thermal_conductivity_w_m_k + ' W/mK | ' + c.neutron_resistance + ' | ' + c.cost_index + ' |')
  }
  lines.push('')
  lines.push('### Selection Details')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Rationale | ' + result.selection_rationale + ' |')
  lines.push('| Lifetime | ' + result.lifetime_years + ' years |')
  lines.push('| Replacement | ' + result.replacement_frequency + ' |')
  lines.push('| Tritium Retention | ' + result.tritium_retention_index + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatTritiumBreedingReport(result: TritiumBreedingResult): string {
  const lines: string[] = []
  lines.push('## Tritium Breeding Analysis Report')
  lines.push('')
  lines.push('Blanket Type: ' + result.blanket_type)
  lines.push('Viability Score: ' + result.viability_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Breeding Metrics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Tritium Breeding Ratio | ' + result.breeding.tritium_breeding_ratio + ' |')
  lines.push('| Production (g/day) | ' + result.breeding.tritium_production_g_day + ' |')
  lines.push('| Production (kg/year) | ' + result.breeding.tritium_production_kg_year + ' |')
  lines.push('| Energy Multiplication | ' + result.breeding.energy_multiplication_factor + ' |')
  lines.push('| Blanket Energy Gain | ' + result.breeding.blanket_energy_gain + ' |')
  lines.push('')
  lines.push('### Tritium Inventory')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Startup Inventory | ' + result.inventory.startup_inventory_kg + ' kg |')
  lines.push('| Circulating Inventory | ' + result.inventory.circulating_inventory_kg + ' kg |')
  lines.push('| Loss Rate | ' + result.inventory.loss_rate_g_day + ' g/day |')
  lines.push('| Doubling Time | ' + result.inventory.doubling_time_years + ' years |')
  lines.push('| Self-Sufficiency | ' + (result.inventory.self_sufficiency_achieved ? 'Yes' : 'No') + ' |')
  lines.push('')
  lines.push('### Safety & Extraction')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Extraction Method | ' + result.extraction_method + ' |')
  lines.push('| Safety Classification | ' + result.safety_classification + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatMagneticFieldReport(result: MagneticFieldResult): string {
  const lines: string[] = []
  lines.push('## Magnetic Field Configuration Report')
  lines.push('')
  lines.push('Field Quality Score: ' + result.field_quality_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Toroidal Field')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| TF Coil Count | ' + result.toroidal.tf_coil_count + ' |')
  lines.push('| Conductor Mass | ' + result.toroidal.tf_conductor_mass_tonnes + ' tonnes |')
  lines.push('| Stored Energy | ' + result.toroidal.tf_stored_energy_gj + ' GJ |')
  lines.push('| TF Power | ' + result.toroidal.tf_power_mw + ' MW |')
  lines.push('| Field Ripple | ' + result.toroidal.field_ripple_pct + '% |')
  lines.push('')
  lines.push('### Poloidal Field')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| PF Coil Count | ' + result.poloidal.pf_coil_count + ' |')
  lines.push('| Conductor Mass | ' + result.poloidal.pf_conductor_mass_tonnes + ' tonnes |')
  lines.push('| Vertical Stability | ' + result.poloidal.vertical_field_stability + ' |')
  lines.push('| Elongation Capability | ' + result.poloidal.elongation_capability + ' |')
  lines.push('| Shaping Flexibility | ' + result.poloidal.shaping_flexibility + ' |')
  lines.push('')
  lines.push('### Superconductor')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Material | ' + result.superconductor.material + ' |')
  lines.push('| Critical Temp | ' + result.superconductor.critical_temp_k + ' K |')
  lines.push('| Critical Field | ' + result.superconductor.critical_field_t + ' T |')
  lines.push('| Operating Temp | ' + result.superconductor.operating_temp_k + ' K |')
  lines.push('| Current Density | ' + result.superconductor.current_density_a_mm2 + ' A/mm2 |')
  lines.push('| Margin of Safety | ' + result.superconductor.margin_of_safety + ' |')
  lines.push('')
  lines.push('### Summary')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Total Coil Mass | ' + result.total_coil_mass_tonnes + ' tonnes |')
  lines.push('| Cryogenic Power | ' + result.cryogenic_power_kw + ' kW |')
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatFusionEconomicsReport(result: FusionEconomicsResult): string {
  const lines: string[] = []
  lines.push('## Fusion Economics Model Report')
  lines.push('')
  lines.push('Economic Viability Score: ' + result.economic_viability_score + ' / 100')
  lines.push('Competitiveness: ' + result.competitiveness)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Capital Costs')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Total CAPEX | $' + result.capital.total_capex_musd + 'M |')
  lines.push('| Specific CAPEX | $' + result.capital.specific_capex_usd_kw + '/kW |')
  lines.push('| Construction Financing | $' + result.capital.construction_financing_musd + 'M |')
  lines.push('| Contingency | ' + result.capital.contingency_pct + '% |')
  lines.push('')
  lines.push('### CAPEX Breakdown')
  lines.push('| Component | Share |')
  lines.push('|-----------|-------|')
  lines.push('| Magnets | ' + result.capital.capex_breakdown.magnets_pct + '% |')
  lines.push('| Blanket | ' + result.capital.capex_breakdown.blanket_pct + '% |')
  lines.push('| Building | ' + result.capital.capex_breakdown.building_pct + '% |')
  lines.push('| Turbine | ' + result.capital.capex_breakdown.turbine_pct + '% |')
  lines.push('| Other | ' + result.capital.capex_breakdown.other_pct + '% |')
  lines.push('')
  lines.push('### Operating Costs')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Annual OPEX | $' + result.operating.annual_opex_musd + 'M |')
  lines.push('| Fuel Cost | $' + result.operating.fuel_cost_musd_year + 'M/year |')
  lines.push('| Blanket Replacement | $' + result.operating.blanket_replacement_cost_musd_year + 'M/year |')
  lines.push('| Staffing | $' + result.operating.staffing_cost_musd_year + 'M/year |')
  lines.push('| Waste Disposal | $' + result.operating.waste_disposal_musd_year + 'M/year |')
  lines.push('')
  lines.push('### Revenue Model')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Annual Revenue | $' + result.revenue.annual_revenue_musd + 'M |')
  lines.push('| LCOE | $' + result.revenue.lcoe_usd_mwh + '/MWh |')
  lines.push('| Carbon Credits | $' + result.revenue.carbon_credit_revenue_musd_year + 'M/year |')
  lines.push('| Payback Period | ' + result.revenue.payback_period_years + ' years |')
  lines.push('| NPV | $' + result.revenue.npv_musd + 'M |')
  lines.push('| IRR | ' + result.revenue.irr_pct + '% |')
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatRegulatoryReport(result: RegulatoryPathwayResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Pathway Report')
  lines.push('')
  lines.push('Country: ' + result.country)
  lines.push('Regulatory Risk: ' + result.regulatory_risk)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Regulatory Framework')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Primary Regulator | ' + result.framework.primary_regulator + ' |')
  lines.push('| Licensing Pathway | ' + result.framework.licensing_pathway + ' |')
  lines.push('| Regulatory Status | ' + result.framework.regulatory_status + ' |')
  lines.push('| Estimated Timeline | ' + result.framework.estimated_timeline_months + ' months |')
  lines.push('')
  lines.push('### Key Regulations')
  for (const r of result.framework.key_regulations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('### Safety Requirements')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Dose Limit | ' + result.safety.dose_limit_msv_year + ' mSv/year |')
  lines.push('| Tritium Release Limit | ' + result.safety.tritium_release_limit_bq_year.toExponential(2) + ' Bq/year |')
  lines.push('| Seismic Requirement | ' + result.safety.seismic_requirement + ' |')
  lines.push('| EPZ | ' + result.safety.emergency_planning_zone_km + ' km |')
  lines.push('| Waste Class | ' + result.safety.waste_disposal_class + ' |')
  lines.push('')
  lines.push('### Key Milestones')
  lines.push('| Milestone | Timeline (months) | Status |')
  lines.push('|-----------|-------------------|--------|')
  for (const m of result.key_milestones) {
    lines.push('| ' + m.milestone + ' | ' + m.timeline_months + ' | ' + m.status + ' |')
  }
  lines.push('')
  lines.push('### Stakeholder Engagement')
  lines.push(result.stakeholder_engagement)
  lines.push('')
  lines.push('---')
  lines.push('*Fusion Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== SECTION 5 -- Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Tokamak Designer
  tools.register(defineTool({
    name: 'tokamak_designer',
    description: 'Tokamak reactor design analysis | Geometry, plasma performance, fusion gain Q, power balance, feasibility scoring | Design and evaluate tokamak reactor configurations.',
    parameters: {
      tokamak_input: {
        type: 'string',
        required: true,
        description: 'JSON: major_radius_m, minor_radius_m, magnetic_field_t, plasma_current_ma, elongation, triangularity, fusion_power_mw, wall_material (tungsten|beryllium|liquid_lithium|sic)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { tokamak_input: string }) {
      const input: TokamakDesignInput = JSON.parse(args.tokamak_input)
      return formatTokamakReport(analyzeTokamakDesign(input))
    }
  }))

  // Tool 2: Plasma Confinement Analyzer
  tools.register(defineTool({
    name: 'plasma_confinement_analyzer',
    description: 'Plasma confinement analysis | Energy confinement time, H-factor, stability limits (Greenwald, Troyon), fusion power | Analyze plasma confinement quality and operational limits.',
    parameters: {
      plasma_input: {
        type: 'string',
        required: true,
        description: 'JSON: magnetic_field_t, plasma_current_ma, major_radius_m, minor_radius_m, line_avg_density_m3, heating_power_mw, confinement_mode (L-mode|H-mode|I-mode|ELMy), isotope (D-T|D-D|D-He3)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { plasma_input: string }) {
      const input: PlasmaConfinementInput = JSON.parse(args.plasma_input)
      return formatPlasmaConfinementReport(analyzePlasmaConfinement(input))
    }
  }))

  // Tool 3: Fusion Fuel Cycle Optimizer
  tools.register(defineTool({
    name: 'fusion_fuel_cycle_optimizer',
    description: 'Fusion fuel cycle optimization | D-T, D-D, D-He3, p-B11 fuel cycles; tritium consumption, waste profile, sustainability scoring | Optimize fuel cycle for fusion reactors.',
    parameters: {
      fuel_input: {
        type: 'string',
        required: true,
        description: 'JSON: fuel_type (D-T|D-D|D-He3|p-B11), fusion_power_mw, availability_target_pct, tritium_breeding_ratio, blanket_multiplier, fuel_recirculation_fraction'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { fuel_input: string }) {
      const input: FuelCycleInput = JSON.parse(args.fuel_input)
      return formatFuelCycleReport(analyzeFuelCycle(input))
    }
  }))

  // Tool 4: Reactor Materials Selector
  tools.register(defineTool({
    name: 'reactor_materials_selector',
    description: 'Fusion reactor materials selection | First wall, blanket, divertor, magnet, vacuum vessel materials; neutron resistance, thermal performance | Select optimal materials for fusion reactor components.',
    parameters: {
      materials_input: {
        type: 'string',
        required: true,
        description: 'JSON: component (first_wall|blanket|divertor|magnet|vacuum_vessel), neutron_wall_load_mw_m2, surface_heat_flux_mw_m2, operating_temp_c, neutron_fluence_n_m2, stress_requirement_mpa, radiation_resistance_required (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { materials_input: string }) {
      const input: MaterialsInput = JSON.parse(args.materials_input)
      return formatMaterialsReport(analyzeMaterials(input))
    }
  }))

  // Tool 5: Tritium Breeding Calculator
  tools.register(defineTool({
    name: 'tritium_breeding_calculator',
    description: 'Tritium breeding ratio calculation | TBR, tritium production rate, inventory, doubling time, self-sufficiency assessment | Calculate tritium breeding performance for fusion blankets.',
    parameters: {
      breeding_input: {
        type: 'string',
        required: true,
        description: 'JSON: blanket_type (lithium_ceramic|lithium_lead|molten_salt|helium_cooled), neutron_wall_load_mw_m2, blanket_thickness_m, lithium6_enrichment_pct, coolant_type (helium|water|lithium_lead|molten_salt), structural_material (rafm_steel|ods_steel|sic_composite), multiplier_material (beryllium|lead|none)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { breeding_input: string }) {
      const input: TritiumBreedingInput = JSON.parse(args.breeding_input)
      return formatTritiumBreedingReport(analyzeTritiumBreeding(input))
    }
  }))

  // Tool 6: Magnetic Field Configurator
  tools.register(defineTool({
    name: 'magnetic_field_configurator',
    description: 'Magnetic field configuration for tokamaks | Toroidal field, poloidal field, superconductor selection, coil mass, cryogenic power | Configure and optimize magnetic field systems.',
    parameters: {
      field_input: {
        type: 'string',
        required: true,
        description: 'JSON: major_radius_m, minor_radius_m, toroidal_field_t, plasma_current_ma, tf_coil_count, pf_coil_count, superconductor (Nb3Sn|NbTi|REBCO|BSCCO), max_field_on_coil_t'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { field_input: string }) {
      const input: MagneticFieldInput = JSON.parse(args.field_input)
      return formatMagneticFieldReport(analyzeMagneticField(input))
    }
  }))

  // Tool 7: Fusion Economics Modeler
  tools.register(defineTool({
    name: 'fusion_economics_modeler',
    description: 'Fusion power plant economics | CAPEX, OPEX, LCOE, NPV, IRR, payback period, carbon credits | Model the economic viability of fusion power plants.',
    parameters: {
      economics_input: {
        type: 'string',
        required: true,
        description: 'JSON: fusion_power_mw, construction_time_years, availability_pct, plant_lifetime_years, superconducting_magnet_cost_musd, blanket_cost_musd, building_cost_musd, turbine_cost_musd, interest_rate_pct, carbon_price_usd_tonne'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { economics_input: string }) {
      const input: FusionEconomicsInput = JSON.parse(args.economics_input)
      return formatFusionEconomicsReport(analyzeFusionEconomics(input))
    }
  }))

  // Tool 8: Regulatory Pathway Fusion
  tools.register(defineTool({
    name: 'regulatory_pathway_fusion',
    description: 'Fusion energy regulatory pathway analysis | Country-specific licensing, safety requirements, milestones, stakeholder engagement | Navigate fusion energy regulatory frameworks.',
    parameters: {
      regulatory_input: {
        type: 'string',
        required: true,
        description: 'JSON: country (USA|UK|EU|China|Japan|South_Korea), reactor_type (tokamak|stellarator|inertial|field_reversed|mirror), thermal_power_mw, tritium_inventory_kg, site_type (greenfield|retrofit|nuclear_campus), public_engagement_level (low|medium|high)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { regulatory_input: string }) {
      const input: RegulatoryInput = JSON.parse(args.regulatory_input)
      return formatRegulatoryReport(analyzeRegulatoryPathway(input))
    }
  }))

  console.log('[dsh-tool-fusionenergy] Loaded v' + VERSION + ' - Fusion Energy & Plasma Physics: 8 tools active')
  console.log('  Tools: tokamak_designer, plasma_confinement_analyzer, fusion_fuel_cycle_optimizer, reactor_materials_selector, tritium_breeding_calculator, magnetic_field_configurator, fusion_economics_modeler, regulatory_pathway_fusion')
}
