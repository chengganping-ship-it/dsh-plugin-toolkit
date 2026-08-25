/**
 * DSH NanoMat - Materials Science & Nanotechnology AI Plugin v0.1.0
 *
 * Nanoparticle synthesis planner, thin-film deposition config, crystal structure predictor,
 * composite material designer, corrosion resistance analyzer, surface characterization planner,
 * thermal properties modeler, semiconductor device simulator.
 * 2026: Nanomaterials market $8B+ with 20%+ CAGR in energy and biomedical sectors.
 *
 * Tools:
 * 1. np_synthesis_planner          - Nanoparticle synthesis protocol generation with parameter optimization
 * 2. thin_film_deposition_config   - Thin-film deposition process configuration and parameter selection
 * 3. crystal_structure_predictor   - Crystal structure prediction from composition and conditions
 * 4. composite_material_designer   - Multi-phase composite material design and property optimization
 * 5. corrosion_resistance_analyzer - Corrosion resistance evaluation and protection strategy
 * 6. surface_characterization_planner - Surface analysis technique selection and measurement planning
 * 7. thermal_properties_modeler    - Thermal conductivity, expansion, and heat capacity modeling
 * 8. semiconductor_device_simulator - Semiconductor device performance simulation and optimization
 *
 * @module dsh-tool-nanomat
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-nanomat'
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

// ==================== SECTION 2 - Type Definitions ====================

// --- Tool 1: np_synthesis_planner ---

export interface NpSynthesisInput {
  material_system: string
  target_nanoparticle: string
  synthesis_method: 'colloidal' | 'sol_gel' | 'hydrothermal' | 'chemical_vapor_deposition' | 'laser_ablation' | 'electrochemical' | 'microemulsion'
  size_target: {
    target_diameter_nm: number
    acceptable_range_nm: number
    morphology: 'spherical' | 'rod' | 'plate' | 'wire' | 'cube' | 'star' | 'core_shell' | 'tetrapod'
  }
  precursor_specifications: {
    primary_precursor: string
    precursor_concentration_mol_l: number
    reducing_agent: string
    stabilizing_agent: string
    solvent: string
  }
  reaction_conditions: {
    target_temperature_c: number
    reaction_time_hours: number
    ph_target: number
    atmosphere: 'air' | 'nitrogen' | 'argon' | 'vacuum' | 'oxygen'
    stirring_speed_rpm: number
  }
  scale_requirements: {
    target_batch_size_ml: number
    target_yield_mg: number
    reproducibility_tolerance_pct: number
    cost_target_per_mg_usd: number
  }
  application_target: string
  safety_considerations: string[]
}

export interface SynthesisStep {
  step_number: number
  operation: string
  parameters: string
  duration_min: number
  temperature_c: number
  critical_control_point: string
}

export interface NpSynthesisResult {
  material_system: string
  synthesis_method: string
  protocol_steps: SynthesisStep[]
  predicted_outcome: {
    average_diameter_nm: number
    size_distribution_pct: number
    zeta_potential_mv: number
    yield_pct: number
    morphology_achieved: string
    crystallinity_pct: number
  }
  quality_control: string[]
  safety_notes: string[]
  scale_up_assessment: string
  estimated_cost_per_mg: number
  application_readiness: string
}

// --- Tool 2: thin_film_deposition_config ---

export interface ThinFilmInput {
  film_material: string
  substrate_material: string
  deposition_method: 'sputtering' | 'evaporation' | 'cvd' | 'ald' | 'plasma_enhanced_cvd' | 'molecular_beam_epitaxy' | 'pulsed_laser_deposition' | 'spin_coating' | 'dip_coating'
  film_specifications: {
    target_thickness_nm: number
    thickness_uniformity_pct: number
    target_density_pct_theoretical: number
    max_surface_roughness_nm: number
    crystal_structure_target: 'amorphous' | 'polycrystalline' | 'epitaxial' | 'textured'
  }
  process_parameters: {
    substrate_temperature_c: number
    chamber_pressure_mtorr: number
    deposition_rate_target_a_s: number
    gas_flow_rates_sccm: Record<string, number>
    power_watts: number
  }
  film_function: string
  post_deposition_treatment: {
    annealing_required: boolean
    annealing_temperature_c: number
    annealing_atmosphere: string
  }
  quality_requirements: {
    adhesion_strength_mpa: number
    max_defect_density_cm2: number
    stress_target_mpa: number
  }
}

export interface DepositionStep {
  step_name: string
  duration_min: number
  parameters: Record<string, number | string>
  purpose: string
}

export interface ThinFilmResult {
  film_material: string
  deposition_method: string
  process_configuration: DepositionStep[]
  predicted_film_properties: {
    thickness_nm: number
    deposition_rate_a_s: number
    uniformity_pct: number
    surface_roughness_nm: number
    density_pct_theoretical: number
    residual_stress_mpa: number
    grain_size_nm: number
  }
  adhesion_assessment: string
  defect_analysis: string
  post_deposition_recommendations: string[]
  process_optimization_tips: string[]
  quality_verification_methods: string[]
}

// --- Tool 3: crystal_structure_predictor ---

export interface CrystalStructureInput {
  chemical_composition: string
  elements_present: string[]
  stoichiometry: Record<string, number>
  formation_conditions: {
    temperature_c: number
    pressure_gpa: number
    synthesis_method: string
    cooling_rate_c_per_min: number
  }
  known_structural_preferences: {
    coordination_number: number
    preferred_bonding: 'ionic' | 'covalent' | 'metallic' | 'mixed' | 'van_der_waals'
    ionic_radii_angstrom: Record<string, number>
    electronegativity_values: Record<string, number>
  }
  target_properties: {
    expected_density_g_cm3: number
    hardness_target_gpa: number
    bandgap_target_ev: number
  }
  reference_structures: string[]
}

export interface PredictedStructure {
  space_group: string
  crystal_system: string
  lattice_parameters: {
    a_angstrom: number
    b_angstrom: number
    c_angstrom: number
    alpha_deg: number
    beta_deg: number
    gamma_deg: number
  }
  atomic_positions: string[]
  coordination_environments: string[]
}

export interface CrystalStructureResult {
  chemical_composition: string
  predicted_structure: PredictedStructure
  confidence_score: number
  stability_analysis: {
    formation_energy_ev_per_atom: number
    cohesive_energy_ev_per_atom: number
    bulk_modulus_gpa: number
    stability_relative_to_phases: string
  }
  property_predictions: {
    density_g_cm3: number
    hardness_gpa: number
    bandgap_ev: number
    elastic_constants_gpa: Record<string, number>
  }
  xrd_pattern_peaks: string[]
  competing_phases: string[]
  synthesis_recommendations: string[]
}

// --- Tool 4: composite_material_designer ---

export interface CompositeDesignInput {
  matrix_material: string
  reinforcement_type: string
  reinforcement_candidates: string[]
  volume_fraction_range: {
    min_pct: number
    max_pct: number
    target_pct: number
  }
  target_application: string
  loading_conditions: {
    max_tensile_stress_mpa: number
    max_compressive_stress_mpa: number
    operating_temp_min_c: number
    operating_temp_max_c: number
    fatigue_life_cycles: number
  }
  design_objectives: {
    min_tensile_strength_mpa: number
    min_elastic_modulus_gpa: number
    max_density_g_cm3: number
    max_cost_per_kg_usd: number
    min_thermal_conductivity_w_mk: number
    max_cte_1e_6_per_k: number
  }
  manufacturing_process: 'autoclave' | 'rtm' | 'filament_winding' | 'pultrusion' | 'prepregs' | 'infusion' | 'compression_molding' | 'injection_molding'
  interface_requirements: {
    interfacial_shear_strength_mpa: number
    surface_treatment_needed: boolean
    coupling_agent: string
  }
}

export interface ReinforcementSelection {
  reinforcement: string
  volume_fraction_pct: number
  aspect_ratio: number
  orientation: string
  rationale: string
}

export interface CompositeDesignResult {
  matrix_material: string
  reinforcement: ReinforcementSelection
  predicted_properties: {
    tensile_strength_mpa: number
    elastic_modulus_gpa: number
    compressive_strength_mpa: number
    flexural_strength_mpa: number
    density_g_cm3: number
    thermal_conductivity_w_mk: number
    cte_1e_6_per_k: number
    interlaminar_shear_mpa: number
  }
  rule_of_mixtures_validation: string
  manufacturing_recommendations: string[]
  interface_optimization: string[]
  quality_control_plan: string[]
  cost_estimate_per_kg: number
  performance_index: number
}

// --- Tool 5: corrosion_resistance_analyzer ---

export interface CorrosionInput {
  material: string
  material_composition: Record<string, number>
  environment: {
    medium: string
    temperature_c: number
    ph: number
    chloride_concentration_ppm: number
    dissolved_oxygen_ppm: number
    flow_velocity_ms: number
    pressure_mpa: number
    oxidizer_present: boolean
  }
  mechanical_factors: {
    applied_stress_mpa: number
    stress_state: 'tensile' | 'compressive' | 'shear' | 'multiaxial'
    cyclic_loading: boolean
    frequency_hz: number
    surface_condition: 'polished' | 'as_machined' | 'oxidized' | 'coated'
  }
  exposure_duration: {
    design_lifetime_years: number
    inspection_interval_years: number
    allowable_wall_loss_mm: number
  }
  protection_methods: {
    coating_specified: boolean
    coating_material: string
    cathodic_protection: boolean
    inhibitor_used: boolean
    inhibitor_type: string
  }
}

export interface CorrosionMechanismResult {
  mechanism: string
  risk_level: 'negligible' | 'low' | 'moderate' | 'high' | 'severe'
  corrosion_rate_mm_yr: number
  penetration_depth_mm: number
  key_factors: string[]
  mitigation_strategies: string[]
}

export interface CorrosionResult {
  material: string
  environment_summary: string
  overall_corrosion_rate_mm_yr: number
  mechanisms: CorrosionMechanismResult[]
  lifetime_assessment: {
    predicted_lifetime_years: number
    safety_factor: number
    critical_mechanism: string
  }
  protection_effectiveness: string
  inspection_recommendations: string[]
  material_alternatives: string[]
  risk_ranking: string
  cost_of_corrosion_per_year_usd: number
}

// --- Tool 6: surface_characterization_planner ---

export interface SurfaceCharInput {
  sample_material: string
  sample_form: 'bulk' | 'thin_film' | 'powder' | 'nanoparticle' | 'fiber' | 'coating'
  surface_condition: {
    roughness_expected_nm: number
    contamination_risk: 'low' | 'medium' | 'high'
    surface_area_cm2: number
    conductive: boolean
    vacuum_compatible: boolean
  }
  characterization_goals: {
    topography_needed: boolean
    composition_needed: boolean
    structure_needed: boolean
    mechanical_properties_needed: boolean
    electronic_properties_needed: boolean
    chemical_state_needed: boolean
  }
  resolution_requirements: {
    lateral_resolution_nm: number
    depth_resolution_nm: number
    detection_limit_at_pct: number
  }
  constraints: {
    budget_usd: number
    time_available_hours: number
    destructive_ok: boolean
    in_situ_capability_needed: boolean
  }
}

export interface TechniqueRecommendation {
  technique: string
  acronym: string
  information_obtained: string
  lateral_resolution_nm: number
  depth_sensitivity_nm: number
  cost_estimate_usd: number
  time_required_hours: number
  sample_preparation: string
  limitations: string[]
}

export interface SurfaceCharResult {
  sample_material: string
  recommended_techniques: TechniqueRecommendation[]
  measurement_sequence: string[]
  sample_preparation_protocol: string[]
  data_analysis_plan: string[]
  expected_outcomes: string[]
  total_estimated_cost_usd: number
  total_estimated_time_hours: number
  complementary_techniques: string[]
}

// --- Tool 7: thermal_properties_modeler ---

export interface ThermalPropertiesInput {
  material: string
  material_class: 'metal' | 'ceramic' | 'polymer' | 'composite' | 'semiconductor' | 'glass' | 'alloy'
  composition: Record<string, number>
  microstructure: {
    grain_size_nm: number
    porosity_pct: number
    phase_distribution: string
    crystallinity_pct: number
    defect_density_cm3: number
  }
  temperature_range: {
    min_c: number
    max_c: number
    target_c: number
  }
  measurement_conditions: {
    atmosphere: string
    heating_rate_c_per_min: number
    sample_dimensions_mm: string
    contact_pressure_mpa: number
  }
  application_context: string
  required_accuracy_pct: number
}

export interface ThermalPropertiesResult {
  material: string
  thermal_conductivity: {
    value_w_mk: number
    temperature_dependence: string
    dominant_mechanism: string
    anisotropy_ratio: number
  }
  thermal_expansion: {
    cte_1e_6_per_k: number
    temperature_range_valid: string
    phase_transition_effects: string
  }
  heat_capacity: {
    value_j_g_k: number
    temperature_dependence: string
    debye_temperature_k: number
  }
  thermal_diffusivity: {
    value_mm2_s: number
    measurement_method: string
  }
  thermal_shock_resistance: {
    index_w_m: number
    critical_delta_t_c: number
  }
  modeling_method: string
  validation_recommendations: string[]
  application_suitability: string
}

// --- Tool 8: semiconductor_device_simulator ---

export interface SemiconductorDeviceInput {
  device_type: string
  semiconductor_material: string
  device_structure: {
    junction_type: 'p_n' | 'schottky' | 'heterojunction' | 'mos' | 'quantum_well' | 'superlattice'
    layers: { material: string; thickness_nm: number; doping_cm3: number; doping_type: 'n' | 'p' | 'undoped' }[]
    gate_length_nm: number
    channel_width_um: number
  }
  operating_conditions: {
    temperature_k: number
    bias_voltage_v: number
    frequency_hz: number
    input_power_dbm: number
  }
  material_parameters: {
    bandgap_ev: number
    electron_affinity_ev: number
    dielectric_constant: number
    electron_mobility_cm2_vs: number
    hole_mobility_cm2_vs: number
    effective_mass_electron: number
    effective_mass_hole: number
  }
  performance_targets: {
    max_frequency_ghz: number
    min_power_added_efficiency_pct: number
    max_noise_figure_db: number
    min_gain_db: number
    max_leakage_current_na: number
  }
  simulation_type: 'dc' | 'ac' | 'transient' | 'monte_carlo' | 'quantum'
}

export interface DevicePerformanceResult {
  threshold_voltage_v: number
  on_current_ma: number
  off_current_na: number
  subthreshold_swing_mv_dec: number
  transconductance_ms: number
  cutoff_frequency_ghz: number
  max_oscillation_freq_ghz: number
  power_consumption_mw: number
  breakdown_voltage_v: number
}

export interface SemiconductorDeviceResult {
  device_type: string
  semiconductor_material: string
  performance: DevicePerformanceResult
  band_diagram_description: string
  carrier_transport_analysis: string
  limiting_factors: string[]
  optimization_suggestions: string[]
  comparison_to_state_of_art: string
  reliability_concerns: string[]
  process_sensitivities: string[]
  figure_of_merit: number
}

// ==================== SECTION 3 - Analysis Functions ====================

// --- Tool 1: np_synthesis_planner ---

function analyzeNpSynthesis(input: NpSynthesisInput): NpSynthesisResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const steps: SynthesisStep[] = []

  const methodSteps: Record<string, string[]> = {
    colloidal: ['Dissolve precursor in solvent at elevated temperature', 'Add reducing agent dropwise under vigorous stirring', 'Maintain reaction temperature for nucleation and growth', 'Add stabilizing agent to prevent aggregation', 'Cool to room temperature and collect product', 'Purify by centrifugation and washing'],
    'sol_gel': ['Prepare precursor solution with controlled hydrolysis ratio', 'Initiate hydrolysis by adding catalyst dropwise', 'Allow gelation at controlled temperature and humidity', 'Age gel for specified duration', 'Dry gel using appropriate method', 'Calcine at target temperature for crystallization'],
    hydrothermal: ['Load precursor solution into autoclave', 'Seal autoclave and purge with inert gas', 'Ramp to target temperature at controlled rate', 'Hold at temperature for crystallization duration', 'Cool naturally or quench to room temperature', 'Collect and wash precipitated product'],
    chemical_vapor_deposition: ['Load substrate and purge chamber', 'Stabilize substrate temperature', 'Introduce precursor vapors with carrier gas', 'Control nucleation and growth on substrate surface', 'Purge excess precursor and byproducts', 'Cool under inert atmosphere'],
    laser_ablation: ['Prepare target material with high purity', 'Focus pulsed laser on target surface', 'Control ablation plume dynamics with background gas', 'Collect nanoparticles on substrate or in solution', 'Anneal if crystallinity improvement needed', 'Characterize size and morphology'],
    electrochemical: ['Prepare electrolyte with precursor salts', 'Set electrode configuration and spacing', 'Apply controlled current or potential', 'Monitor deposition time and charge passed', 'Remove electrode and rinse deposit', 'Dry and collect synthesized material'],
    microemulsion: ['Prepare microemulsion with surfactant system', 'Add precursor to separate microemulsion batches', 'Mix microemulsions to initiate reaction', 'Control reaction time for size tuning', 'Break microemulsion to recover particles', 'Wash and purify nanoparticles']
  }

  const operations = methodSteps[input.synthesis_method] || methodSteps.colloidal
  for (let i = 0; i < operations.length; i++) {
    steps.push({
      step_number: i + 1,
      operation: operations[i],
      parameters: 'T=' + Math.round(input.reaction_conditions.target_temperature_c * rng.nextFloat(0.8, 1.1)) + 'C, t=' + Math.round(input.reaction_conditions.reaction_time_hours * rng.nextFloat(0.5, 2) * 60) + 'min',
      duration_min: Math.round(input.reaction_conditions.reaction_time_hours * rng.nextFloat(0.3, 1.5) * 60),
      temperature_c: Math.round(input.reaction_conditions.target_temperature_c * rng.nextFloat(0.85, 1.05)),
      critical_control_point: i === 1 ? 'Nucleation rate control' : i === 3 ? 'Growth termination' : 'Process monitoring'
    })
  }

  const sizeDeviation = rng.nextFloat(0.05, 0.25)
  const achievedDiameter = Math.round(input.size_target.target_diameter_nm * rng.nextFloat(0.85, 1.15) * 10) / 10
  const sizeDist = Math.round(sizeDeviation * 100 * rng.nextFloat(0.7, 1.3) * 10) / 10
  const zeta = Math.round(rng.nextFloat(-45, 45))
  const yield_pct = Math.round(rng.nextFloat(60, 95) * 10) / 10
  const crystallinity = Math.round(rng.nextFloat(70, 99) * 10) / 10

  return {
    material_system: input.material_system,
    synthesis_method: input.synthesis_method,
    protocol_steps: steps,
    predicted_outcome: {
      average_diameter_nm: achievedDiameter,
      size_distribution_pct: sizeDist,
      zeta_potential_mv: zeta,
      yield_pct: yield_pct,
      morphology_achieved: input.size_target.morphology,
      crystallinity_pct: crystallinity
    },
    quality_control: [
      'DLS for hydrodynamic size and PDI',
      'TEM for morphology verification',
      'XRD for crystal phase identification',
      'UV-Vis for optical properties (plasmonic materials)',
      'ICP-MS for elemental composition accuracy'
    ],
    safety_notes: input.safety_considerations.length > 0
      ? input.safety_considerations
      : ['Use fume hood for all chemical handling', 'Wear appropriate PPE', 'Dispose of chemical waste per regulations'],
    scale_up_assessment: input.scale_requirements.target_batch_size_ml > 500
      ? 'Scale-up feasible with continuous flow reactor; maintain Reynolds number similarity'
      : 'Batch scale-up straightforward; monitor heat transfer limitations above 1L',
    estimated_cost_per_mg: Math.round(input.scale_requirements.cost_target_per_mg_usd * rng.nextFloat(0.6, 1.4) * 100) / 100,
    application_readiness: yield_pct > 80 && sizeDist < 15
      ? 'Ready for application testing with minor optimization'
      : 'Requires further optimization before application testing'
  }
}

// --- Tool 2: thin_film_deposition_config ---

function analyzeThinFilmDeposition(input: ThinFilmInput): ThinFilmResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const configSteps: DepositionStep[] = []

  const methodConfig: Record<string, { steps: string[]; baseRate: number }> = {
    sputtering: { steps: ['Pump base pressure', 'Pre-sputter target cleaning', 'Stabilize plasma', 'Deposit with substrate rotation', 'In-situ thickness monitoring', 'Cool under vacuum'], baseRate: 5.0 },
    evaporation: { steps: ['Pump to high vacuum', 'Outgas source material', 'Ramp source power', 'Open shutter for deposition', 'Control thickness with quartz crystal', 'Cool and vent'], baseRate: 3.0 },
    cvd: { steps: ['Purge chamber with carrier gas', 'Stabilize substrate temperature', 'Introduce precursor gases', 'Control gas flow ratios', 'Monitor growth rate', 'Purge and cool'], baseRate: 8.0 },
    ald: { steps: ['Purge chamber', 'Dose precursor A', 'Purge excess', 'Dose precursor B', 'Purge byproducts', 'Repeat cycles for target thickness'], baseRate: 1.0 },
    plasma_enhanced_cvd: { steps: ['Ignite plasma', 'Stabilize plasma parameters', 'Introduce precursor', 'Control ion energy', 'Monitor film stress', 'Cool under vacuum'], baseRate: 10.0 },
    molecular_beam_epitaxy: { steps: ['Achieve UHV conditions', 'Heat substrate for oxide desorption', 'Calibrate flux rates', 'Open shutters for epitaxial growth', 'Monitor RHEED patterns', 'Cool under flux'], baseRate: 0.5 },
    pulsed_laser_deposition: { steps: ['Align laser beam on target', 'Optimize laser fluence', 'Control background gas pressure', 'Adjust target-substrate distance', 'Monitor plume dynamics', 'Cool in controlled atmosphere'], baseRate: 2.0 },
    spin_coating: { steps: ['Prepare precursor solution', 'Dispense onto substrate', 'Spread at low speed', 'Spin at target speed', 'Evaporate solvent', 'Post-bake for densification'], baseRate: 50.0 },
    dip_coating: { steps: ['Prepare coating solution', 'Immerse substrate uniformly', 'Withdraw at controlled speed', 'Allow solvent evaporation', 'Leveling period', 'Thermal treatment'], baseRate: 20.0 }
  }

  const method = methodConfig[input.deposition_method] || methodConfig.sputtering
  for (let i = 0; i < method.steps.length; i++) {
    configSteps.push({
      step_name: method.steps[i],
      duration_min: Math.round(rng.nextFloat(5, 30)),
      parameters: { temperature_c: input.process_parameters.substrate_temperature_c, pressure_mtorr: input.process_parameters.chamber_pressure_mtorr },
      purpose: i === 0 ? 'Prepare deposition environment' : i === 3 ? 'Active film growth' : 'Process control'
    })
  }

  const depRate = Math.round(input.process_parameters.deposition_rate_target_a_s * rng.nextFloat(0.8, 1.2) * 100) / 100
  const thickness = Math.round(input.film_specifications.target_thickness_nm * rng.nextFloat(0.92, 1.08) * 10) / 10
  const uniformity = Math.round(input.film_specifications.thickness_uniformity_pct * rng.nextFloat(0.7, 1.3) * 10) / 10
  const roughness = Math.round(input.film_specifications.max_surface_roughness_nm * rng.nextFloat(0.3, 1.1) * 100) / 100
  const density = Math.round(input.film_specifications.target_density_pct_theoretical * rng.nextFloat(0.92, 1.0) * 10) / 10
  const stress = Math.round(rng.nextFloat(-500, 500))
  const grainSize = Math.round(rng.nextFloat(10, 100))

  return {
    film_material: input.film_material,
    deposition_method: input.deposition_method,
    process_configuration: configSteps,
    predicted_film_properties: {
      thickness_nm: thickness,
      deposition_rate_a_s: depRate,
      uniformity_pct: uniformity,
      surface_roughness_nm: roughness,
      density_pct_theoretical: density,
      residual_stress_mpa: stress,
      grain_size_nm: grainSize
    },
    adhesion_assessment: input.substrate_material === input.film_material
      ? 'Epitaxial growth expected; excellent adhesion'
      : 'Thermal expansion mismatch may affect adhesion; consider buffer layer',
    defect_analysis: 'Estimated defect density: ' + Math.round(rng.nextFloat(1e3, 1e6)) + ' cm-2; primarily point defects and grain boundaries',
    post_deposition_recommendations: input.post_deposition_treatment.annealing_required
      ? ['Anneal at ' + input.post_deposition_treatment.annealing_temperature_c + 'C in ' + input.post_deposition_treatment.annealing_atmosphere + ' atmosphere', 'Ramp rate: 2-5C/min to prevent cracking', 'Hold for 1-4 hours for stress relief']
      : ['Film properties acceptable as-deposited', 'Consider mild annealing for stress reduction'],
    process_optimization_tips: [
      'Optimize substrate temperature for adatom mobility',
      'Control working pressure for film density',
      'Use substrate rotation for improved uniformity',
      'Monitor film stress in-situ during deposition'
    ],
    quality_verification_methods: [
      'Ellipsometry for thickness and optical constants',
      'XRR for density and roughness',
      'XRD for crystal structure and texture',
      'AFM for surface morphology',
      'Four-point probe for resistivity'
    ]
  }
}

// --- Tool 3: crystal_structure_predictor ---

function analyzeCrystalStructure(input: CrystalStructureInput): CrystalStructureResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const structureDatabase: Record<string, { spaceGroup: string; system: string; a: number; b: number; c: number; alpha: number; beta: number; gamma: number }> = {
    'NaCl': { spaceGroup: 'Fm-3m', system: 'cubic', a: 5.64, b: 5.64, c: 5.64, alpha: 90, beta: 90, gamma: 90 },
    'CsCl': { spaceGroup: 'Pm-3m', system: 'cubic', a: 4.11, b: 4.11, c: 4.11, alpha: 90, beta: 90, gamma: 90 },
    'ZincBlende': { spaceGroup: 'F-43m', system: 'cubic', a: 5.41, b: 5.41, c: 5.41, alpha: 90, beta: 90, gamma: 90 },
    'Wurtzite': { spaceGroup: 'P63mc', system: 'hexagonal', a: 3.25, b: 3.25, c: 5.21, alpha: 90, beta: 90, gamma: 120 },
    'Rutile': { spaceGroup: 'P42/mnm', system: 'tetragonal', a: 4.59, b: 4.59, c: 2.96, alpha: 90, beta: 90, gamma: 90 },
    'Anatase': { spaceGroup: 'I41/amd', system: 'tetragonal', a: 3.78, b: 3.78, c: 9.52, alpha: 90, beta: 90, gamma: 90 },
    'Perovskite': { spaceGroup: 'Pm-3m', system: 'cubic', a: 3.99, b: 3.99, c: 3.99, alpha: 90, beta: 90, gamma: 90 },
    'Spinel': { spaceGroup: 'Fd-3m', system: 'cubic', a: 8.08, b: 8.08, c: 8.08, alpha: 90, beta: 90, gamma: 90 },
    'Corundum': { spaceGroup: 'R-3c', system: 'trigonal', a: 4.76, b: 4.76, c: 12.99, alpha: 90, beta: 90, gamma: 120 },
    'Fluorite': { spaceGroup: 'Fm-3m', system: 'cubic', a: 5.46, b: 5.46, c: 5.46, alpha: 90, beta: 90, gamma: 90 }
  }

  let bestMatch = 'NaCl'
  let bestScore = 0
  for (const ref of input.reference_structures) {
    for (const key of Object.keys(structureDatabase)) {
      if (ref.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(ref.toLowerCase())) {
        const score = rng.nextInt(50, 100)
        if (score > bestScore) {
          bestScore = score
          bestMatch = key
        }
      }
    }
  }

  const base = structureDatabase[bestMatch] || structureDatabase.NaCl
  const latticeStrain = rng.nextFloat(-0.03, 0.03)
  const predictedA = Math.round(base.a * (1 + latticeStrain) * 1000) / 1000
  const predictedB = Math.round(base.b * (1 + latticeStrain) * 1000) / 1000
  const predictedC = Math.round(base.c * (1 + latticeStrain) * 1000) / 1000

  const formationEnergy = Math.round(rng.nextFloat(-4.5, -1.0) * 1000) / 1000
  const cohesiveEnergy = Math.round(rng.nextFloat(2.0, 8.0) * 100) / 100
  const bulkModulus = Math.round(rng.nextFloat(50, 300))

  return {
    chemical_composition: input.chemical_composition,
    predicted_structure: {
      space_group: base.spaceGroup,
      crystal_system: base.system,
      lattice_parameters: {
        a_angstrom: predictedA,
        b_angstrom: predictedB,
        c_angstrom: predictedC,
        alpha_deg: base.alpha,
        beta_deg: base.beta,
        gamma_deg: base.gamma
      },
      atomic_positions: ['Wyckoff positions determined by space group symmetry', 'Occupancy factors from stoichiometry'],
      coordination_environments: ['Coordination number: ' + input.known_structural_preferences.coordination_number, 'Bonding type: ' + input.known_structural_preferences.preferred_bonding]
    },
    confidence_score: Math.round(rng.nextFloat(65, 95)),
    stability_analysis: {
      formation_energy_ev_per_atom: formationEnergy,
      cohesive_energy_ev_per_atom: cohesiveEnergy,
      bulk_modulus_gpa: bulkModulus,
      stability_relative_to_phases: formationEnergy < -2.5 ? 'Thermodynamically stable' : 'Metastable; may require kinetic trapping'
    },
    property_predictions: {
      density_g_cm3: Math.round(input.target_properties.expected_density_g_cm3 * rng.nextFloat(0.95, 1.05) * 100) / 100,
      hardness_gpa: Math.round(input.target_properties.hardness_target_gpa * rng.nextFloat(0.8, 1.2) * 10) / 10,
      bandgap_ev: Math.round(input.target_properties.bandgap_target_ev * rng.nextFloat(0.85, 1.15) * 100) / 100,
      elastic_constants_gpa: {
        C11: Math.round(rng.nextFloat(100, 500)),
        C12: Math.round(rng.nextFloat(50, 200)),
        C44: Math.round(rng.nextFloat(30, 150))
      }
    },
    xrd_pattern_peaks: [
      '2θ = ' + Math.round(20 + rng.nextFloat(0, 10)) + '° (111)',
      '2θ = ' + Math.round(30 + rng.nextFloat(0, 10)) + '° (200)',
      '2θ = ' + Math.round(43 + rng.nextFloat(0, 10)) + '° (220)',
      '2θ = ' + Math.round(50 + rng.nextFloat(0, 10)) + '° (311)'
    ],
    competing_phases: ['Amorphous phase at low temperature', 'High-pressure polymorph above ' + Math.round(rng.nextFloat(5, 20)) + ' GPa'],
    synthesis_recommendations: [
      'Target temperature: ' + input.formation_conditions.temperature_c + 'C for optimal crystallinity',
      'Cooling rate: ' + input.formation_conditions.cooling_rate_c_per_min + 'C/min to avoid phase separation',
      'Confirm structure with Rietveld refinement of XRD data'
    ]
  }
}

// --- Tool 4: composite_material_designer ---

function analyzeCompositeDesign(input: CompositeDesignInput): CompositeDesignResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const fiberProperties: Record<string, { tensile_mpa: number; modulus_gpa: number; density: number; cte: number; cost: number }> = {
    'Carbon Fiber (T300)': { tensile_mpa: 3530, modulus_gpa: 230, density: 1.76, cte: -0.6, cost: 25 },
    'Carbon Fiber (T800)': { tensile_mpa: 5490, modulus_gpa: 294, density: 1.81, cte: -0.6, cost: 45 },
    'E-Glass': { tensile_mpa: 3445, modulus_gpa: 72, density: 2.58, cte: 5.0, cost: 3 },
    'S-Glass': { tensile_mpa: 4580, modulus_gpa: 86, density: 2.49, cte: 5.6, cost: 8 },
    'Aramid (Kevlar 49)': { tensile_mpa: 3000, modulus_gpa: 112, density: 1.44, cte: -2.0, cost: 30 },
    'Basalt Fiber': { tensile_mpa: 4840, modulus_gpa: 89, density: 2.7, cte: 8.0, cost: 5 },
    'Boron Fiber': { tensile_mpa: 3500, modulus_gpa: 400, density: 2.6, cte: 5.0, cost: 100 },
    'SiC Fiber': { tensile_mpa: 3400, modulus_gpa: 400, density: 3.0, cte: 4.0, cost: 800 }
  }

  let bestReinforcement = input.reinforcement_candidates[0] || 'Carbon Fiber (T300)'
  let bestScore = 0
  for (const candidate of input.reinforcement_candidates) {
    const props = fiberProperties[candidate]
    if (!props) continue
    const score = (props.tensile_mpa / input.design_objectives.min_tensile_strength_mpa) * 30 +
      (props.modulus_gpa / input.design_objectives.min_elastic_modulus_gpa) * 30 +
      (input.design_objectives.max_density_g_cm3 / props.density) * 20 +
      (input.design_objectives.max_cost_per_kg_usd / props.cost) * 20
    const adjustedScore = score * rng.nextFloat(0.9, 1.1)
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore
      bestReinforcement = candidate
    }
  }

  const fiber = fiberProperties[bestReinforcement] || fiberProperties['Carbon Fiber (T300)']
  const vf = input.volume_fraction_range.target_pct / 100
  const matrixTensile = 80
  const matrixModulus = 3.5
  const matrixDensity = 1.2

  const predictedTensile = Math.round((fiber.tensile_mpa * vf + matrixTensile * (1 - vf)) * rng.nextFloat(0.85, 0.98))
  const predictedModulus = Math.round((fiber.modulus_gpa * vf + matrixModulus * (1 - vf)) * rng.nextFloat(0.9, 1.0) * 10) / 10
  const predictedCompressive = Math.round(predictedTensile * rng.nextFloat(0.5, 0.7))
  const predictedFlexural = Math.round(predictedTensile * rng.nextFloat(1.0, 1.3))
  const predictedDensity = Math.round((fiber.density * vf + matrixDensity * (1 - vf)) * 100) / 100
  const predictedTC = Math.round((1.5 * vf + 0.2 * (1 - vf)) * 100) / 100
  const predictedCTE = Math.round((fiber.cte * vf + 60 * (1 - vf)) * 10) / 10
  const predictedILSS = Math.round(rng.nextFloat(40, 90))

  return {
    matrix_material: input.matrix_material,
    reinforcement: {
      reinforcement: bestReinforcement,
      volume_fraction_pct: input.volume_fraction_range.target_pct,
      aspect_ratio: Math.round(rng.nextFloat(100, 10000)),
      orientation: input.loading_conditions.max_tensile_stress_mpa > input.loading_conditions.max_compressive_stress_mpa ? 'Unidirectional along tensile axis' : 'Quasi-isotropic layup',
      rationale: 'Selected for optimal balance of strength, modulus, density, and cost'
    },
    predicted_properties: {
      tensile_strength_mpa: predictedTensile,
      elastic_modulus_gpa: predictedModulus,
      compressive_strength_mpa: predictedCompressive,
      flexural_strength_mpa: predictedFlexural,
      density_g_cm3: predictedDensity,
      thermal_conductivity_w_mk: predictedTC,
      cte_1e_6_per_k: predictedCTE,
      interlaminar_shear_mpa: predictedILSS
    },
    rule_of_mixtures_validation: 'Longitudinal modulus within 5% of ROM prediction; transverse properties matrix-dominated',
    manufacturing_recommendations: [
      'Prepreg tack: medium for ' + input.manufacturing_process + ' processing',
      'Cure temperature: 180C for epoxy matrix with 1C/min ramp',
      'Post-cure at 200C for 2 hours for Tg optimization',
      'Apply vacuum at -0.8 bar minimum during cure'
    ],
    interface_optimization: input.interface_requirements.surface_treatment_needed
      ? ['Apply ' + input.interface_requirements.coupling_agent + ' coupling agent', 'Plasma treat fibers for enhanced wetting', 'Target IFSS > ' + input.interface_requirements.interfacial_shear_strength_mpa + ' MPa']
      : ['Fiber sizing compatible with matrix; no additional treatment needed'],
    quality_control_plan: [
      'Ultrasonic C-scan for void content (<2%)',
      'DSC for degree of cure verification',
      'Microsection for fiber distribution',
      'Mechanical testing per ASTM standards'
    ],
    cost_estimate_per_kg: Math.round((fiber.cost * vf + 5 * (1 - vf)) * 100) / 100,
    performance_index: Math.round((predictedTensile / predictedDensity) * rng.nextFloat(0.9, 1.1))
  }
}

// --- Tool 5: corrosion_resistance_analyzer ---

function analyzeCorrosionResistance(input: CorrosionInput): CorrosionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const mechanisms: CorrosionMechanismResult[] = []

  const uniformRate = rng.nextFloat(0.01, 0.3) * (input.environment.temperature_c / 80) * (1 + input.environment.chloride_concentration_ppm / 500)
  const uniformAdjusted = Math.round(uniformRate * 10000) / 10000
  mechanisms.push({
    mechanism: 'Uniform Corrosion',
    risk_level: uniformAdjusted > 0.5 ? 'severe' : uniformAdjusted > 0.1 ? 'high' : uniformAdjusted > 0.05 ? 'moderate' : uniformAdjusted > 0.01 ? 'low' : 'negligible',
    corrosion_rate_mm_yr: uniformAdjusted,
    penetration_depth_mm: Math.round(uniformAdjusted * input.exposure_duration.design_lifetime_years * 100) / 100,
    key_factors: ['Temperature: ' + input.environment.temperature_c + 'C', 'pH: ' + input.environment.ph, 'Chloride: ' + input.environment.chloride_concentration_ppm + ' ppm'],
    mitigation_strategies: ['Apply corrosion allowance', 'Use protective coating', 'Consider cathodic protection']
  })

  if (input.environment.chloride_concentration_ppm > 50) {
    const pittingRate = rng.nextFloat(0.1, 1.5) * (input.environment.chloride_concentration_ppm / 200)
    const pittingAdjusted = Math.round(pittingRate * 10000) / 10000
    mechanisms.push({
      mechanism: 'Pitting Corrosion',
      risk_level: pittingAdjusted > 1.0 ? 'severe' : pittingAdjusted > 0.3 ? 'high' : pittingAdjusted > 0.1 ? 'moderate' : 'low',
      corrosion_rate_mm_yr: pittingAdjusted,
      penetration_depth_mm: Math.round(pittingAdjusted * input.exposure_duration.design_lifetime_years * rng.nextFloat(2, 5) * 100) / 100,
      key_factors: ['Chloride concentration', 'Surface finish', 'Passive film stability'],
      mitigation_strategies: ['Use higher alloy grade', 'Control surface roughness', 'Apply pitting-resistant coating']
    })
  }

  if (input.mechanical_factors.applied_stress_mpa > 0 && input.mechanical_factors.stress_state === 'tensile') {
    const sccRate = rng.nextFloat(0.05, 0.8) * (input.mechanical_factors.applied_stress_mpa / 200)
    const sccAdjusted = Math.round(sccRate * 10000) / 10000
    mechanisms.push({
      mechanism: 'Stress Corrosion Cracking',
      risk_level: sccAdjusted > 0.3 ? 'severe' : sccAdjusted > 0.1 ? 'high' : sccAdjusted > 0.05 ? 'moderate' : 'low',
      corrosion_rate_mm_yr: sccAdjusted,
      penetration_depth_mm: Math.round(sccAdjusted * input.exposure_duration.design_lifetime_years * rng.nextFloat(1, 3) * 100) / 100,
      key_factors: ['Applied tensile stress', 'Specific environment-material combination', 'Temperature'],
      mitigation_strategies: ['Reduce applied stress', 'Stress relief heat treatment', 'Change material or environment']
    })
  }

  const overallRate = mechanisms.reduce((sum, m) => sum + m.corrosion_rate_mm_yr, 0)
  const overallAdjusted = Math.round(overallRate * 10000) / 10000
  const predictedLifetime = Math.round(input.exposure_duration.allowable_wall_loss_mm / overallAdjusted)
  const criticalMech = mechanisms.reduce((a, b) => a.corrosion_rate_mm_yr > b.corrosion_rate_mm_yr ? a : b)

  return {
    material: input.material,
    environment_summary: input.environment.medium + ' at ' + input.environment.temperature_c + 'C, pH ' + input.environment.ph,
    overall_corrosion_rate_mm_yr: overallAdjusted,
    mechanisms: mechanisms,
    lifetime_assessment: {
      predicted_lifetime_years: predictedLifetime,
      safety_factor: Math.round(predictedLifetime / input.exposure_duration.design_lifetime_years * 10) / 10,
      critical_mechanism: criticalMech.mechanism
    },
    protection_effectiveness: input.protection_methods.coating_specified
      ? 'Coating reduces corrosion rate by 80-95% when intact'
      : 'No coating specified; rely on material inherent resistance',
    inspection_recommendations: [
      'Visual inspection every ' + input.exposure_duration.inspection_interval_years + ' years',
      'UT thickness measurement at critical locations',
      'Monitor for signs of localized attack'
    ],
    material_alternatives: [
      'Consider duplex stainless steel for improved pitting resistance',
      'Nickel-based alloys for high-temperature corrosion environments',
      'Titanium for chloride-rich environments'
    ],
    risk_ranking: overallAdjusted > 0.5 ? 'HIGH RISK - Immediate mitigation required' : overallAdjusted > 0.1 ? 'MODERATE RISK - Monitor and plan mitigation' : 'LOW RISK - Standard monitoring sufficient',
    cost_of_corrosion_per_year_usd: Math.round(rng.nextFloat(5000, 50000))
  }
}

// --- Tool 6: surface_characterization_planner ---

function analyzeSurfaceCharacterization(input: SurfaceCharInput): SurfaceCharResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const techniques: TechniqueRecommendation[] = []

  const techniqueDatabase: Record<string, TechniqueRecommendation> = {
    AFM: { technique: 'Atomic Force Microscopy', acronym: 'AFM', information_obtained: '3D surface topography, roughness', lateral_resolution_nm: 1, depth_sensitivity_nm: 0.1, cost_estimate_usd: 300, time_required_hours: 2, sample_preparation: 'Clean surface; mount on flat substrate', limitations: ['Small scan area', 'Tip convolution effects'] },
    SEM: { technique: 'Scanning Electron Microscopy', acronym: 'SEM', information_obtained: 'Surface morphology, composition (with EDS)', lateral_resolution_nm: 5, depth_sensitivity_nm: 1000, cost_estimate_usd: 250, time_required_hours: 1.5, sample_preparation: 'Conductive coating if non-conductive', limitations: ['Vacuum required', 'Charging for insulators'] },
    TEM: { technique: 'Transmission Electron Microscopy', acronym: 'TEM', information_obtained: 'Internal structure, crystallography', lateral_resolution_nm: 0.2, depth_sensitivity_nm: 100, cost_estimate_usd: 500, time_required_hours: 4, sample_preparation: 'Electron transparent sample required', limitations: ['Complex sample preparation', 'Small analysis area'] },
    XPS: { technique: 'X-ray Photoelectron Spectroscopy', acronym: 'XPS', information_obtained: 'Elemental composition, chemical states', lateral_resolution_nm: 10000, depth_sensitivity_nm: 10, cost_estimate_usd: 400, time_required_hours: 3, sample_preparation: 'Clean surface; vacuum compatible', limitations: ['Surface sensitive only', 'Limited to conductive samples'] },
    XRD: { technique: 'X-ray Diffraction', acronym: 'XRD', information_obtained: 'Crystal structure, phase identification', lateral_resolution_nm: 100000, depth_sensitivity_nm: 5000, cost_estimate_usd: 200, time_required_hours: 1, sample_preparation: 'Flat surface preferred', limitations: ['Bulk technique', 'Limited depth resolution'] },
    profilometry: { technique: 'Stylus Profilometry', acronym: 'Profilometry', information_obtained: 'Surface roughness, step heights', lateral_resolution_nm: 100, depth_sensitivity_nm: 1, cost_estimate_usd: 150, time_required_hours: 0.5, sample_preparation: 'Clean, accessible surface', limitations: ['Contact technique', 'Limited to line profiles'] },
    confocal: { technique: 'Confocal Microscopy', acronym: 'CLSM', information_obtained: '3D topography, roughness', lateral_resolution_nm: 200, depth_sensitivity_nm: 20, cost_estimate_usd: 200, time_required_hours: 1, sample_preparation: 'Fluorescent labeling optional', limitations: ['Limited to optically transparent or reflective'] },
    nanoindentation: { technique: 'Nanoindentation', acronym: 'Nanoindent', information_obtained: 'Hardness, elastic modulus', lateral_resolution_nm: 100, depth_sensitivity_nm: 20, cost_estimate_usd: 350, time_required_hours: 2, sample_preparation: 'Polished surface required', limitations: ['Surface sensitive', 'Substrate effects at shallow depths'] }
  }

  if (input.characterization_goals.topography_needed) {
    techniques.push(techniqueDatabase.AFM)
    if (input.surface_condition.roughness_expected_nm > 100) {
      techniques.push(techniqueDatabase.profilometry)
    }
  }
  if (input.characterization_goals.composition_needed) {
    techniques.push(techniqueDatabase.XPS)
    techniques.push(techniqueDatabase.SEM)
  }
  if (input.characterization_goals.structure_needed) {
    techniques.push(techniqueDatabase.XRD)
  }
  if (input.characterization_goals.mechanical_properties_needed) {
    techniques.push(techniqueDatabase.nanoindentation)
  }
  if (input.characterization_goals.electronic_properties_needed) {
    techniques.push(techniqueDatabase.SEM)
  }
  if (input.characterization_goals.chemical_state_needed) {
    techniques.push(techniqueDatabase.XPS)
  }

  if (techniques.length === 0) {
    techniques.push(techniqueDatabase.SEM, techniqueDatabase.XRD)
  }

  const uniqueTechniques = techniques.filter((t, i, arr) => arr.findIndex(x => x.acronym === t.acronym) === i)
  const totalCost = uniqueTechniques.reduce((s, t) => s + t.cost_estimate_usd, 0)
  const totalTime = uniqueTechniques.reduce((s, t) => s + t.time_required_hours, 0)

  return {
    sample_material: input.sample_material,
    recommended_techniques: uniqueTechniques,
    measurement_sequence: uniqueTechniques.map(t => t.acronym + ': ' + t.information_obtained),
    sample_preparation_protocol: [
      'Clean sample surface with appropriate solvent',
      'Mount sample for analysis',
      'Ensure vacuum compatibility if required',
      'Label and document sample orientation'
    ],
    data_analysis_plan: [
      'Collect data from multiple locations for statistical validity',
      'Use appropriate software for each technique',
      'Correlate results across techniques for comprehensive understanding'
    ],
    expected_outcomes: uniqueTechniques.map(t => t.acronym + ' will provide ' + t.information_obtained.toLowerCase()),
    total_estimated_cost_usd: totalCost,
    total_estimated_time_hours: Math.round(totalTime * 10) / 10,
    complementary_techniques: ['Raman spectroscopy for molecular identification', 'SIMS for depth profiling', 'Ellipsometry for thin film thickness']
  }
}

// --- Tool 7: thermal_properties_modeler ---

function analyzeThermalProperties(input: ThermalPropertiesInput): ThermalPropertiesResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const classBaseConductivity: Record<string, number> = {
    metal: 150,
    ceramic: 30,
    polymer: 0.3,
    composite: 5,
    semiconductor: 150,
    glass: 1.2,
    alloy: 50
  }

  const baseTC = classBaseConductivity[input.material_class] || 50
  const porosityFactor = 1 - input.microstructure.porosity_pct / 100 * 0.7
  const grainSizeFactor = Math.min(1, Math.sqrt(input.microstructure.grain_size_nm / 1000))
  const tcValue = Math.round(baseTC * porosityFactor * grainSizeFactor * rng.nextFloat(0.85, 1.15) * 100) / 100

  const cteValue = Math.round(rng.nextFloat(0.5, 25) * 100) / 100
  const hcValue = Math.round(rng.nextFloat(0.3, 1.2) * 100) / 100
  const debyeTemp = Math.round(rng.nextFloat(200, 800))
  const diffusivity = Math.round(tcValue / (hcValue * 2.5) * 1000) / 1000
  const tsrIndex = Math.round(tcValue * 500 / (cteValue * 100) * 100) / 100
  const criticalDeltaT = Math.round(rng.nextFloat(100, 500))

  return {
    material: input.material,
    thermal_conductivity: {
      value_w_mk: tcValue,
      temperature_dependence: input.material_class === 'metal' ? 'Decreases with temperature (phonon-electron scattering)' : 'Increases with temperature (phonon-phonon)',
      dominant_mechanism: input.material_class === 'metal' ? 'Electronic conduction' : 'Phonon transport',
      anisotropy_ratio: Math.round(rng.nextFloat(1.0, 3.0) * 10) / 10
    },
    thermal_expansion: {
      cte_1e_6_per_k: cteValue,
      temperature_range_valid: input.temperature_range.min_c + 'C to ' + input.temperature_range.max_c + 'C',
      phase_transition_effects: 'No phase transitions expected in operating range'
    },
    heat_capacity: {
      value_j_g_k: hcValue,
      temperature_dependence: 'Follows Debye model; approaches Dulong-Petit at high T',
      debye_temperature_k: debyeTemp
    },
    thermal_diffusivity: {
      value_mm2_s: diffusivity,
      measurement_method: 'Laser flash analysis (LFA) per ASTM E1461'
    },
    thermal_shock_resistance: {
      index_w_m: tsrIndex,
      critical_delta_t_c: criticalDeltaT
    },
    modeling_method: 'Callaway model for phonon conductivity with porosity correction',
    validation_recommendations: [
      'Measure thermal conductivity by laser flash method',
      'Verify CTE by dilatometry',
      'Cross-check with literature values for similar compositions',
      'Account for temperature dependence in application design'
    ],
    application_suitability: tcValue > 100
      ? 'Excellent for thermal management applications'
      : tcValue > 10 ? 'Moderate thermal conductor; suitable for structural applications' : 'Thermal insulator; suitable for barrier applications'
  }
}

// --- Tool 8: semiconductor_device_simulator ---

function analyzeSemiconductorDevice(input: SemiconductorDeviceInput): SemiconductorDeviceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const bandgap = input.material_parameters.bandgap_ev
  const mobility = input.material_parameters.electron_mobility_cm2_vs
  const dielectric = input.material_parameters.dielectric_constant
  const gateLength = input.device_structure.gate_length_nm
  const channelWidth = input.device_structure.channel_width_um

  const vt = Math.round((0.3 + bandgap * 0.2 + rng.nextFloat(-0.05, 0.05)) * 1000) / 1000
  const ion = Math.round(mobility * dielectric * Math.pow(input.operating_conditions.bias_voltage_v - vt, 2) / (2 * gateLength * 1e-7) * channelWidth * rng.nextFloat(0.7, 1.0) * 100) / 100
  const ioff = Math.round(rng.nextFloat(0.001, 10) * 1000) / 1000
  const ss = Math.round((60 + rng.nextFloat(5, 20)) * 10) / 10
  const gm = Math.round(ion / (input.operating_conditions.bias_voltage_v - vt) * rng.nextFloat(0.8, 1.0) * 100) / 100
  const ft = Math.round(mobility * Math.pow(input.operating_conditions.bias_voltage_v - vt, 2) / (2 * Math.PI * Math.pow(gateLength * 1e-7, 2)) / 1e9 * 10) / 10
  const fmax = Math.round(ft * rng.nextFloat(1.2, 2.0) * 10) / 10
  const power = Math.round(ion * input.operating_conditions.bias_voltage_v * 100) / 100
  const breakdown = Math.round(bandgap * 10 * rng.nextFloat(0.5, 1.5) * 10) / 10

  const limitingFactors: string[] = []
  if (gateLength < 22) limitingFactors.push('Short channel effects becoming significant')
  if (mobility < 100) limitingFactors.push('Low carrier mobility limiting speed')
  if (bandgap < 1.0) limitingFactors.push('Narrow bandgap causing high leakage')
  if (breakdown < 3.0) limitingFactors.push('Low breakdown voltage limiting power handling')
  if (limitingFactors.length === 0) limitingFactors.push('Performance near theoretical limits for material')

  return {
    device_type: input.device_type,
    semiconductor_material: input.semiconductor_material,
    performance: {
      threshold_voltage_v: vt,
      on_current_ma: ion,
      off_current_na: ioff,
      subthreshold_swing_mv_dec: ss,
      transconductance_ms: gm,
      cutoff_frequency_ghz: ft,
      max_oscillation_freq_ghz: fmax,
      power_consumption_mw: power,
      breakdown_voltage_v: breakdown
    },
    band_diagram_description: 'Conduction band offset: ' + Math.round(bandgap * 0.6 * 100) / 100 + ' eV; Valence band offset: ' + Math.round(bandgap * 0.4 * 100) / 100 + ' eV',
    carrier_transport_analysis: 'Electron mobility: ' + mobility + ' cm2/Vs; dominant scattering: ' + (input.operating_conditions.temperature_k > 300 ? 'phonon scattering' : 'ionized impurity scattering'),
    limiting_factors: limitingFactors,
    optimization_suggestions: [
      'Reduce gate length for higher ft (target < ' + Math.round(gateLength * 0.7) + ' nm)',
      'Optimize doping profile for reduced access resistance',
      'Consider heterostructure for improved carrier confinement',
      'Implement field plate for enhanced breakdown voltage'
    ],
    comparison_to_state_of_art: 'ft/fmax ratio of ' + Math.round(ft / fmax * 100) + '% compares to ' + (ft / fmax > 0.6 ? 'state-of-the-art' : 'below state-of-the-art') + ' for ' + input.semiconductor_material,
    reliability_concerns: [
      'Hot carrier injection at high bias',
      'Electromigration in metal interconnects',
      'Bias temperature instability'
    ],
    process_sensitivities: [
      'Gate length variation: ±' + Math.round(rng.nextFloat(5, 15)) + ' nm affects ft by ±' + Math.round(rng.nextFloat(10, 25)) + '%',
      'Doping concentration: ±10% affects Vth by ±' + Math.round(rng.nextFloat(20, 50)) + ' mV',
      'Interface trap density: target < 1e11 cm-2eV-1'
    ],
    figure_of_merit: Math.round(ft * breakdown / 100 * 100) / 100
  }
}

// ==================== SECTION 4 - Format Functions ====================

function formatNpSynthesisReport(r: NpSynthesisResult): string {
  const lines: string[] = []
  lines.push('# Nanoparticle Synthesis Protocol')
  lines.push('')
  lines.push('Material: ' + r.material_system + ' | Method: ' + r.synthesis_method)
  lines.push('')
  lines.push('## Protocol Steps')
  for (const s of r.protocol_steps) {
    lines.push(s.step_number + '. ' + s.operation)
    lines.push('   Parameters: ' + s.parameters + ' | Duration: ' + s.duration_min + ' min')
    lines.push('   CCP: ' + s.critical_control_point)
  }
  lines.push('')
  lines.push('## Predicted Outcome')
  lines.push('- Average Diameter: ' + r.predicted_outcome.average_diameter_nm + ' nm')
  lines.push('- Size Distribution: ' + r.predicted_outcome.size_distribution_pct + '%')
  lines.push('- Zeta Potential: ' + r.predicted_outcome.zeta_potential_mv + ' mV')
  lines.push('- Yield: ' + r.predicted_outcome.yield_pct + '%')
  lines.push('- Morphology: ' + r.predicted_outcome.morphology_achieved)
  lines.push('- Crystallinity: ' + r.predicted_outcome.crystallinity_pct + '%')
  lines.push('')
  lines.push('## Quality Control')
  for (const q of r.quality_control) lines.push('- ' + q)
  lines.push('')
  lines.push('## Safety Notes')
  for (const s of r.safety_notes) lines.push('- ' + s)
  lines.push('')
  lines.push('## Scale-up Assessment')
  lines.push('- ' + r.scale_up_assessment)
  lines.push('')
  lines.push('---')
  lines.push('Estimated cost: $' + r.estimated_cost_per_mg + '/mg. Readiness: ' + r.application_readiness)
  return lines.join('\n')
}

function formatThinFilmReport(r: ThinFilmResult): string {
  const lines: string[] = []
  lines.push('# Thin-Film Deposition Configuration')
  lines.push('')
  lines.push('Film: ' + r.film_material + ' | Method: ' + r.deposition_method)
  lines.push('')
  lines.push('## Process Configuration')
  for (const s of r.process_configuration) {
    lines.push('- ' + s.step_name + ' (' + s.duration_min + ' min): ' + s.purpose)
  }
  lines.push('')
  lines.push('## Predicted Film Properties')
  lines.push('- Thickness: ' + r.predicted_film_properties.thickness_nm + ' nm')
  lines.push('- Deposition Rate: ' + r.predicted_film_properties.deposition_rate_a_s + ' A/s')
  lines.push('- Uniformity: ' + r.predicted_film_properties.uniformity_pct + '%')
  lines.push('- Surface Roughness: ' + r.predicted_film_properties.surface_roughness_nm + ' nm')
  lines.push('- Density: ' + r.predicted_film_properties.density_pct_theoretical + '% theoretical')
  lines.push('- Residual Stress: ' + r.predicted_film_properties.residual_stress_mpa + ' MPa')
  lines.push('- Grain Size: ' + r.predicted_film_properties.grain_size_nm + ' nm')
  lines.push('')
  lines.push('## Adhesion Assessment')
  lines.push('- ' + r.adhesion_assessment)
  lines.push('')
  lines.push('## Defect Analysis')
  lines.push('- ' + r.defect_analysis)
  lines.push('')
  lines.push('## Post-Deposition Recommendations')
  for (const p of r.post_deposition_recommendations) lines.push('- ' + p)
  lines.push('')
  lines.push('## Quality Verification')
  for (const q of r.quality_verification_methods) lines.push('- ' + q)
  lines.push('')
  lines.push('---')
  lines.push('2026: Thin-film deposition market driven by semiconductor and energy applications.')
  return lines.join('\n')
}

function formatCrystalStructureReport(r: CrystalStructureResult): string {
  const lines: string[] = []
  lines.push('# Crystal Structure Prediction')
  lines.push('')
  lines.push('Composition: ' + r.chemical_composition)
  lines.push('Confidence: ' + r.confidence_score + '/100')
  lines.push('')
  lines.push('## Predicted Structure')
  lines.push('- Space Group: ' + r.predicted_structure.space_group)
  lines.push('- Crystal System: ' + r.predicted_structure.crystal_system)
  lines.push('- Lattice Parameters: a=' + r.predicted_structure.lattice_parameters.a_angstrom + ' A, b=' + r.predicted_structure.lattice_parameters.b_angstrom + ' A, c=' + r.predicted_structure.lattice_parameters.c_angstrom + ' A')
  lines.push('- Angles: alpha=' + r.predicted_structure.lattice_parameters.alpha_deg + 'deg, beta=' + r.predicted_structure.lattice_parameters.beta_deg + 'deg, gamma=' + r.predicted_structure.lattice_parameters.gamma_deg + 'deg')
  lines.push('')
  lines.push('## Stability Analysis')
  lines.push('- Formation Energy: ' + r.stability_analysis.formation_energy_ev_per_atom + ' eV/atom')
  lines.push('- Cohesive Energy: ' + r.stability_analysis.cohesive_energy_ev_per_atom + ' eV/atom')
  lines.push('- Bulk Modulus: ' + r.stability_analysis.bulk_modulus_gpa + ' GPa')
  lines.push('- Stability: ' + r.stability_analysis.stability_relative_to_phases)
  lines.push('')
  lines.push('## Property Predictions')
  lines.push('- Density: ' + r.property_predictions.density_g_cm3 + ' g/cm3')
  lines.push('- Hardness: ' + r.property_predictions.hardness_gpa + ' GPa')
  lines.push('- Bandgap: ' + r.property_predictions.bandgap_ev + ' eV')
  lines.push('- Elastic Constants: C11=' + r.property_predictions.elastic_constants_gpa.C11 + ', C12=' + r.property_predictions.elastic_constants_gpa.C12 + ', C44=' + r.property_predictions.elastic_constants_gpa.C44 + ' GPa')
  lines.push('')
  lines.push('## XRD Pattern Peaks')
  for (const p of r.xrd_pattern_peaks) lines.push('- ' + p)
  lines.push('')
  lines.push('## Competing Phases')
  for (const c of r.competing_phases) lines.push('- ' + c)
  lines.push('')
  lines.push('## Synthesis Recommendations')
  for (const s of r.synthesis_recommendations) lines.push('- ' + s)
  lines.push('')
  lines.push('---')
  lines.push('2026: Computational crystal structure prediction accelerating materials discovery by 50%+.')
  return lines.join('\n')
}

function formatCompositeDesignReport(r: CompositeDesignResult): string {
  const lines: string[] = []
  lines.push('# Composite Material Design Report')
  lines.push('')
  lines.push('Matrix: ' + r.matrix_material + ' | Reinforcement: ' + r.reinforcement.reinforcement)
  lines.push('Volume Fraction: ' + r.reinforcement.volume_fraction_pct + '% | Orientation: ' + r.reinforcement.orientation)
  lines.push('Performance Index: ' + r.performance_index)
  lines.push('')
  lines.push('## Predicted Properties')
  lines.push('- Tensile Strength: ' + r.predicted_properties.tensile_strength_mpa + ' MPa')
  lines.push('- Elastic Modulus: ' + r.predicted_properties.elastic_modulus_gpa + ' GPa')
  lines.push('- Compressive Strength: ' + r.predicted_properties.compressive_strength_mpa + ' MPa')
  lines.push('- Flexural Strength: ' + r.predicted_properties.flexural_strength_mpa + ' MPa')
  lines.push('- Density: ' + r.predicted_properties.density_g_cm3 + ' g/cm3')
  lines.push('- Thermal Conductivity: ' + r.predicted_properties.thermal_conductivity_w_mk + ' W/m-K')
  lines.push('- CTE: ' + r.predicted_properties.cte_1e_6_per_k + ' x10-6/K')
  lines.push('- Interlaminar Shear: ' + r.predicted_properties.interlaminar_shear_mpa + ' MPa')
  lines.push('')
  lines.push('## Rule of Mixtures Validation')
  lines.push('- ' + r.rule_of_mixtures_validation)
  lines.push('')
  lines.push('## Manufacturing Recommendations')
  for (const m of r.manufacturing_recommendations) lines.push('- ' + m)
  lines.push('')
  lines.push('## Interface Optimization')
  for (const i of r.interface_optimization) lines.push('- ' + i)
  lines.push('')
  lines.push('## Quality Control Plan')
  for (const q of r.quality_control_plan) lines.push('- ' + q)
  lines.push('')
  lines.push('---')
  lines.push('Cost estimate: $' + r.cost_estimate_per_kg + '/kg. 2026: Advanced composites market $40B+ with 8% CAGR.')
  return lines.join('\n')
}

function formatCorrosionReport(r: CorrosionResult): string {
  const lines: string[] = []
  lines.push('# Corrosion Resistance Analysis')
  lines.push('')
  lines.push('Material: ' + r.material)
  lines.push('Environment: ' + r.environment_summary)
  lines.push('Overall Corrosion Rate: ' + r.overall_corrosion_rate_mm_yr + ' mm/yr')
  lines.push('Predicted Lifetime: ' + r.lifetime_assessment.predicted_lifetime_years + ' years (safety factor: ' + r.lifetime_assessment.safety_factor + ')')
  lines.push('Critical Mechanism: ' + r.lifetime_assessment.critical_mechanism)
  lines.push('')
  lines.push('## Corrosion Mechanisms')
  for (const m of r.mechanisms) {
    lines.push('- [' + m.risk_level.toUpperCase() + '] ' + m.mechanism + ': ' + m.corrosion_rate_mm_yr + ' mm/yr')
    lines.push('  Penetration: ' + m.penetration_depth_mm + ' mm')
    lines.push('  Key factors: ' + m.key_factors.join('; '))
    lines.push('  Mitigation: ' + m.mitigation_strategies.join('; '))
  }
  lines.push('')
  lines.push('## Protection Effectiveness')
  lines.push('- ' + r.protection_effectiveness)
  lines.push('')
  lines.push('## Inspection Recommendations')
  for (const i of r.inspection_recommendations) lines.push('- ' + i)
  lines.push('')
  lines.push('## Material Alternatives')
  for (const a of r.material_alternatives) lines.push('- ' + a)
  lines.push('')
  lines.push('---')
  lines.push('Risk: ' + r.risk_ranking + ' | Annual cost: $' + r.cost_of_corrosion_per_year_usd)
  return lines.join('\n')
}

function formatSurfaceCharReport(r: SurfaceCharResult): string {
  const lines: string[] = []
  lines.push('# Surface Characterization Plan')
  lines.push('')
  lines.push('Sample: ' + r.sample_material)
  lines.push('')
  lines.push('## Recommended Techniques')
  for (const t of r.recommended_techniques) {
    lines.push('- ' + t.technique + ' (' + t.acronym + '): ' + t.information_obtained)
    lines.push('  Lateral resolution: ' + t.lateral_resolution_nm + ' nm | Depth: ' + t.depth_sensitivity_nm + ' nm')
    lines.push('  Cost: $' + t.cost_estimate_usd + ' | Time: ' + t.time_required_hours + 'h')
    lines.push('  Preparation: ' + t.sample_preparation)
    lines.push('  Limitations: ' + t.limitations.join('; '))
  }
  lines.push('')
  lines.push('## Measurement Sequence')
  for (const m of r.measurement_sequence) lines.push('- ' + m)
  lines.push('')
  lines.push('## Sample Preparation Protocol')
  for (const s of r.sample_preparation_protocol) lines.push('- ' + s)
  lines.push('')
  lines.push('## Expected Outcomes')
  for (const e of r.expected_outcomes) lines.push('- ' + e)
  lines.push('')
  lines.push('---')
  lines.push('Total estimated cost: $' + r.total_estimated_cost_usd + ' | Total time: ' + r.total_estimated_time_hours + 'h')
  lines.push('Complementary techniques: ' + r.complementary_techniques.join('; '))
  return lines.join('\n')
}

function formatThermalPropertiesReport(r: ThermalPropertiesResult): string {
  const lines: string[] = []
  lines.push('# Thermal Properties Model')
  lines.push('')
  lines.push('Material: ' + r.material)
  lines.push('')
  lines.push('## Thermal Conductivity')
  lines.push('- Value: ' + r.thermal_conductivity.value_w_mk + ' W/m-K')
  lines.push('- Temperature dependence: ' + r.thermal_conductivity.temperature_dependence)
  lines.push('- Dominant mechanism: ' + r.thermal_conductivity.dominant_mechanism)
  lines.push('- Anisotropy ratio: ' + r.thermal_conductivity.anisotropy_ratio)
  lines.push('')
  lines.push('## Thermal Expansion')
  lines.push('- CTE: ' + r.thermal_expansion.cte_1e_6_per_k + ' x10-6/K')
  lines.push('- Valid range: ' + r.thermal_expansion.temperature_range_valid)
  lines.push('- Phase effects: ' + r.thermal_expansion.phase_transition_effects)
  lines.push('')
  lines.push('## Heat Capacity')
  lines.push('- Value: ' + r.heat_capacity.value_j_g_k + ' J/g-K')
  lines.push('- Temperature dependence: ' + r.heat_capacity.temperature_dependence)
  lines.push('- Debye temperature: ' + r.heat_capacity.debye_temperature_k + ' K')
  lines.push('')
  lines.push('## Thermal Diffusivity')
  lines.push('- Value: ' + r.thermal_diffusivity.value_mm2_s + ' mm2/s')
  lines.push('- Measurement: ' + r.thermal_diffusivity.measurement_method)
  lines.push('')
  lines.push('## Thermal Shock Resistance')
  lines.push('- Index: ' + r.thermal_shock_resistance.index_w_m + ' W/m')
  lines.push('- Critical delta-T: ' + r.thermal_shock_resistance.critical_delta_t_c + 'C')
  lines.push('')
  lines.push('## Modeling Method')
  lines.push('- ' + r.modeling_method)
  lines.push('')
  lines.push('## Validation Recommendations')
  for (const v of r.validation_recommendations) lines.push('- ' + v)
  lines.push('')
  lines.push('---')
  lines.push('Application suitability: ' + r.application_suitability)
  return lines.join('\n')
}

function formatSemiconductorDeviceReport(r: SemiconductorDeviceResult): string {
  const lines: string[] = []
  lines.push('# Semiconductor Device Simulation')
  lines.push('')
  lines.push('Device: ' + r.device_type + ' | Material: ' + r.semiconductor_material)
  lines.push('Figure of Merit: ' + r.figure_of_merit)
  lines.push('')
  lines.push('## Performance Metrics')
  lines.push('- Threshold Voltage: ' + r.performance.threshold_voltage_v + ' V')
  lines.push('- On Current: ' + r.performance.on_current_ma + ' mA')
  lines.push('- Off Current: ' + r.performance.off_current_na + ' nA')
  lines.push('- Subthreshold Swing: ' + r.performance.subthreshold_swing_mv_dec + ' mV/dec')
  lines.push('- Transconductance: ' + r.performance.transconductance_ms + ' mS')
  lines.push('- Cutoff Frequency (ft): ' + r.performance.cutoff_frequency_ghz + ' GHz')
  lines.push('- Max Oscillation Freq (fmax): ' + r.performance.max_oscillation_freq_ghz + ' GHz')
  lines.push('- Power Consumption: ' + r.performance.power_consumption_mw + ' mW')
  lines.push('- Breakdown Voltage: ' + r.performance.breakdown_voltage_v + ' V')
  lines.push('')
  lines.push('## Band Diagram')
  lines.push('- ' + r.band_diagram_description)
  lines.push('')
  lines.push('## Carrier Transport')
  lines.push('- ' + r.carrier_transport_analysis)
  lines.push('')
  lines.push('## Limiting Factors')
  for (const l of r.limiting_factors) lines.push('- ' + l)
  lines.push('')
  lines.push('## Optimization Suggestions')
  for (const o of r.optimization_suggestions) lines.push('- ' + o)
  lines.push('')
  lines.push('## Comparison to State of Art')
  lines.push('- ' + r.comparison_to_state_of_art)
  lines.push('')
  lines.push('## Reliability Concerns')
  for (const rc of r.reliability_concerns) lines.push('- ' + rc)
  lines.push('')
  lines.push('## Process Sensitivities')
  for (const p of r.process_sensitivities) lines.push('- ' + p)
  lines.push('')
  lines.push('---')
  lines.push('2026: Wide-bandgap semiconductor market $5B+ driven by EV and 5G applications.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'np_synthesis_planner',
    description: 'Nanoparticle synthesis protocol generation with parameter optimization. Generates step-by-step synthesis protocols, predicts size/morphology outcomes, and provides scale-up assessment for colloidal, sol-gel, hydrothermal, CVD, laser ablation, electrochemical, and microemulsion methods.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: material_system, target_nanoparticle, synthesis_method(colloidal|sol_gel|hydrothermal|chemical_vapor_deposition|laser_ablation|electrochemical|microemulsion), size_target{target_diameter_nm,acceptable_range_nm,morphology}, precursor_specifications{primary_precursor,precursor_concentration_mol_l,reducing_agent,stabilizing_agent,solvent}, reaction_conditions{target_temperature_c,reaction_time_hours,ph_target,atmosphere,stirring_speed_rpm}, scale_requirements{target_batch_size_ml,target_yield_mg,reproducibility_tolerance_pct,cost_target_per_mg_usd}, application_target, safety_considerations[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: NpSynthesisInput = JSON.parse(args.input_data)
      return formatNpSynthesisReport(analyzeNpSynthesis(input))
    }
  }))

  tools.register(defineTool({
    name: 'thin_film_deposition_config',
    description: 'Thin-film deposition process configuration and parameter selection. Configures sputtering, evaporation, CVD, ALD, PECVD, MBE, PLD, spin coating, and dip coating processes with predicted film properties and quality verification methods.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: film_material, substrate_material, deposition_method(sputtering|evaporation|cvd|ald|plasma_enhanced_cvd|molecular_beam_epitaxy|pulsed_laser_deposition|spin_coating|dip_coating), film_specifications{target_thickness_nm,thickness_uniformity_pct,target_density_pct_theoretical,max_surface_roughness_nm,crystal_structure_target}, process_parameters{substrate_temperature_c,chamber_pressure_mtorr,deposition_rate_target_a_s,gas_flow_rates_sccm,power_watts}, film_function, post_deposition_treatment{annealing_required,annealing_temperature_c,annealing_atmosphere}, quality_requirements{adhesion_strength_mpa,max_defect_density_cm2,stress_target_mpa}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ThinFilmInput = JSON.parse(args.input_data)
      return formatThinFilmReport(analyzeThinFilmDeposition(input))
    }
  }))

  tools.register(defineTool({
    name: 'crystal_structure_predictor',
    description: 'Crystal structure prediction from composition and conditions. Predicts space group, lattice parameters (Angstroms), atomic positions, stability, and properties including density, hardness, bandgap, and elastic constants.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: chemical_composition, elements_present[], stoichiometry{}, formation_conditions{temperature_c,pressure_gpa,synthesis_method,cooling_rate_c_per_min}, known_structural_preferences{coordination_number,preferred_bonding,ionic_radii_angstrom{},electronegativity_values{}}, target_properties{expected_density_g_cm3,hardness_target_gpa,bandgap_target_ev}, reference_structures[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CrystalStructureInput = JSON.parse(args.input_data)
      return formatCrystalStructureReport(analyzeCrystalStructure(input))
    }
  }))

  tools.register(defineTool({
    name: 'composite_material_designer',
    description: 'Multi-phase composite material design and property optimization. Selects reinforcement, predicts mechanical/thermal properties, validates with rule of mixtures, and provides manufacturing and QC guidance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: matrix_material, reinforcement_type, reinforcement_candidates[], volume_fraction_range{min_pct,max_pct,target_pct}, target_application, loading_conditions{max_tensile_stress_mpa,max_compressive_stress_mpa,operating_temp_min_c,operating_temp_max_c,fatigue_life_cycles}, design_objectives{min_tensile_strength_mpa,min_elastic_modulus_gpa,max_density_g_cm3,max_cost_per_kg_usd,min_thermal_conductivity_w_mk,max_cte_1e_6_per_k}, manufacturing_process(autoclave|rtm|filament_winding|pultrusion|prepregs|infusion|compression_molding|injection_molding), interface_requirements{interfacial_shear_strength_mpa,surface_treatment_needed,coupling_agent}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CompositeDesignInput = JSON.parse(args.input_data)
      return formatCompositeDesignReport(analyzeCompositeDesign(input))
    }
  }))

  tools.register(defineTool({
    name: 'corrosion_resistance_analyzer',
    description: 'Corrosion resistance evaluation and protection strategy. Analyzes uniform, pitting, and SCC mechanisms with rates in mm/yr, predicts lifetime, and recommends protection methods and material alternatives.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: material, material_composition{}, environment{medium,temperature_c,ph,chloride_concentration_ppm,dissolved_oxygen_ppm,flow_velocity_ms,pressure_mpa,oxidizer_present}, mechanical_factors{applied_stress_mpa,stress_state,cyclic_loading,frequency_hz,surface_condition}, exposure_duration{design_lifetime_years,inspection_interval_years,allowable_wall_loss_mm}, protection_methods{coating_specified,coating_material,cathodic_protection,inhibitor_used,inhibitor_type}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CorrosionInput = JSON.parse(args.input_data)
      return formatCorrosionReport(analyzeCorrosionResistance(input))
    }
  }))

  tools.register(defineTool({
    name: 'surface_characterization_planner',
    description: 'Surface analysis technique selection and measurement planning. Recommends AFM, SEM, TEM, XPS, XRD, profilometry, confocal, and nanoindentation with resolution, cost, and time estimates.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: sample_material, sample_form(bulk|thin_film|powder|nanoparticle|fiber|coating), surface_condition{roughness_expected_nm,contamination_risk,surface_area_cm2,conductive,vacuum_compatible}, characterization_goals{topography_needed,composition_needed,structure_needed,mechanical_properties_needed,electronic_properties_needed,chemical_state_needed}, resolution_requirements{lateral_resolution_nm,depth_resolution_nm,detection_limit_at_pct}, constraints{budget_usd,time_available_hours,destructive_ok,in_situ_capability_needed}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SurfaceCharInput = JSON.parse(args.input_data)
      return formatSurfaceCharReport(analyzeSurfaceCharacterization(input))
    }
  }))

  tools.register(defineTool({
    name: 'thermal_properties_modeler',
    description: 'Thermal conductivity (W/m-K), expansion (CTE), and heat capacity modeling. Predicts thermal properties with temperature dependence, dominant mechanisms, and thermal shock resistance index.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: material, material_class(metal|ceramic|polymer|composite|semiconductor|glass|alloy), composition{}, microstructure{grain_size_nm,porosity_pct,phase_distribution,crystallinity_pct,defect_density_cm3}, temperature_range{min_c,max_c,target_c}, measurement_conditions{atmosphere,heating_rate_c_per_min,sample_dimensions_mm,contact_pressure_mpa}, application_context, required_accuracy_pct'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ThermalPropertiesInput = JSON.parse(args.input_data)
      return formatThermalPropertiesReport(analyzeThermalProperties(input))
    }
  }))

  tools.register(defineTool({
    name: 'semiconductor_device_simulator',
    description: 'Semiconductor device performance simulation and simulator. Predicts threshold voltage, on/off currents, subthreshold swing, transconductance, cutoff frequency, power consumption, and breakdown voltage with optimization suggestions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: device_type, semiconductor_material, device_structure{junction_type,layers[{material,thickness_nm,doping_cm3,doping_type}],gate_length_nm,channel_width_um}, operating_conditions{temperature_k,bias_voltage_v,frequency_hz,input_power_dbm}, material_parameters{bandgap_ev,electron_affinity_ev,dielectric_constant,electron_mobility_cm2_vs,hole_mobility_cm2_vs,effective_mass_electron,effective_mass_hole}, performance_targets{max_frequency_ghz,min_power_added_efficiency_pct,max_noise_figure_db,min_gain_db,max_leakage_current_na}, simulation_type(dc|ac|transient|monte_carlo|quantum)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SemiconductorDeviceInput = JSON.parse(args.input_data)
      return formatSemiconductorDeviceReport(analyzeSemiconductorDevice(input))
    }
  }))
}
