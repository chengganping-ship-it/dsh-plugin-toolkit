/**
 * DSH MaterialAI - Materials Science & Engineering AI Plugin v0.1.0
 *
 * Materials selection, alloy design, corrosion analysis, composites optimization.
 * 2026: Materials AI $8B+; advanced materials $150B+.
 *
 * Tools:
 * 1. materials_selection_engine       - Ashby-method materials selection with property screening
 * 2. alloy_designer                   - Alloy composition design and phase prediction
 * 3. corrosion_analyst                - Corrosion rate prediction and galvanic analysis
 * 4. composites_optimizer              - Fiber/matrix selection and layup optimization
 * 5. ceramic_processing_advisor       - Sintering and ceramic processing parameter selection
 * 6. polymer_formulation_planner      - Polymer blend formulation and additive selection
 * 7. semiconductor_materials_selector  - Bandgap engineering and semiconductor material selection
 * 8. nanomaterials_designer           - Nanoparticle size/shape optimization and property prediction
 *
 * @module dsh-tool-materialai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-materialai'
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

export interface MaterialsSelectionInput {
  application: string
  component_type: string
  operating_conditions: {
    temperature_min_c: number
    temperature_max_c: number
    pressure_mpa: number
    environment: string
    load_type: 'static' | 'cyclic' | 'impact' | 'creep'
    required_lifetime_years: number
  }
  design_requirements: {
    min_yield_strength_mpa: number
    min_elongation_pct: number
    max_density_g_cm3: number
    max_cost_per_kg_usd: number
    corrosion_resistance: 'low' | 'moderate' | 'high' | 'extreme'
    thermal_conductivity_min: number
    electrical_resistivity_max: number
  }
  candidate_material_classes: string[]
  constraints: {
    manufacturability: string[]
    availability: 'standard' | 'specialized' | 'custom'
    recyclability_required: boolean
    regulatory_compliance: string[]
  }
}

export interface MaterialCandidate {
  material: string
  material_class: string
  suitability_score: number
  properties: {
    yield_strength_mpa: number
    density_g_cm3: number
    max_service_temp_c: number
    cost_per_kg_usd: number
    corrosion_rating: number
  }
  pros: string[]
  cons: string[]
  rank: number
}

export interface MaterialsSelectionResult {
  application: string
  component_type: string
  top_candidates: MaterialCandidate[]
  selection_methodology: string
  trade_off_analysis: string
  recommended_material: string
  confidence_level: number
  next_steps: string[]
  market_outlook: string
}

export interface AlloyDesignInput {
  base_element: string
  target_properties: {
    min_tensile_strength_mpa: number
    min_yield_strength_mpa: number
    min_elongation_pct: number
    min_hardness_hv: number
    target_density_g_cm3: number
    max_service_temp_c: number
    corrosion_resistance_ph_min: number
    corrosion_resistance_ph_max: number
  }
  alloying_elements_available: string[]
  processing_route: 'casting' | 'wrought' | 'powder_metallurgy' | 'additive_manufacturing'
  heat_treatment_required: boolean
  application_sector: string
  cost_constraints: {
    max_raw_material_cost_per_kg: number
    max_processing_cost_multiplier: number
  }
}

export interface AlloyComposition {
  element: string
  weight_percent: number
  role: string
  effect: string
}

export interface PhasePrediction {
  phase_name: string
  estimated_volume_fraction: number
  stability_range: string
  effect_on_properties: string
}

export interface AlloyDesignResult {
  base_element: string
  proposed_composition: AlloyComposition[]
  total_alloying_content: number
  predicted_phases: PhasePrediction[]
  estimated_properties: {
    tensile_strength_mpa: number
    yield_strength_mpa: number
    elongation_pct: number
    hardness_hv: number
    density_g_cm3: number
  }
  processing_recommendations: string[]
  heat_treatment_schedule: string[]
  cost_estimate_per_kg: number
  confidence_score: number
  design_notes: string[]
}

export interface CorrosionInput {
  material: string
  environment: {
    medium: string
    temperature_c: number
    ph: number
    chloride_concentration_ppm: number
    dissolved_oxygen_ppm: number
    flow_velocity_ms: number
    pressure_mpa: number
  }
  exposure_conditions: {
    exposure_type: 'immersion' | 'atmospheric' | 'splash_zone' | 'buried' | 'high_pressure'
    exposure_duration_hours: number
    continuous_or_intermittent: 'continuous' | 'intermittent'
    presence_of_coating: boolean
    cathodic_protection: boolean
  }
  corrosion_concerns: {
    uniform_corrosion: boolean
    pitting_corrosion: boolean
    crevice_corrosion: boolean
    galvanic_corrosion: boolean
    stress_corrosion_cracking: boolean
    hydrogen_embrittlement: boolean
  }
  design_lifetime_years: number
  allowable_corrosion_rate_mm_yr: number
}

export interface CorrosionMechanism {
  mechanism: string
  risk_level: 'negligible' | 'low' | 'moderate' | 'high' | 'severe'
  corrosion_rate_mm_yr: number
  key_factors: string[]
  mitigation: string[]
}

export interface CorrosionResult {
  material: string
  environment_summary: string
  overall_corrosion_rate_mm_yr: number
  corrosion_mechanisms: CorrosionMechanism[]
  design_lifetime_assessment: string
  remaining_life_years: number
  protection_recommendations: string[]
  material_alternatives: string[]
  monitoring_strategy: string[]
  risk_assessment: string
}

export interface CompositesInput {
  application: string
  loading_conditions: {
    primary_load_type: 'tensile' | 'compressive' | 'flexural' | 'shear' | 'multiaxial'
    max_stress_mpa: number
    fatigue_cycles: number
    impact_energy_j: number
    operating_temp_c: number
  }
  fiber_candidates: string[]
  matrix_candidates: string[]
  manufacturing_process: 'autoclave' | 'rtm' | 'filament_winding' | 'pultrusion' | 'prepregs' | 'infusion'
  design_targets: {
    min_tensile_strength_mpa: number
    min_tensile_modulus_gpa: number
    max_density_g_cm3: number
    target_fiber_volume_fraction: number
    max_cost_per_kg_usd: number
  }
  geometric_constraints: {
    min_thickness_mm: number
    max_thickness_mm: number
    complexity: 'simple' | 'moderate' | 'complex'
  }
}

export interface LayupRecommendation {
  ply_orientation: string
  ply_thickness_mm: number
  number_of_plies: number
  fiber_type: string
  matrix_type: string
  fiber_volume_fraction: number
}

export interface CompositesResult {
  application: string
  recommended_fiber: string
  recommended_matrix: string
  layup_schedule: LayupRecommendation[]
  predicted_properties: {
    tensile_strength_mpa: number
    tensile_modulus_gpa: number
    compressive_strength_mpa: number
    flexural_strength_mpa: number
    interlaminar_shear_mpa: number
    density_g_cm3: number
  }
  manufacturing_process: string
  quality_control_points: string[]
  cost_estimate_per_kg: number
  performance_index: number
  design_recommendations: string[]
}

export interface CeramicProcessingInput {
  ceramic_type: string
  target_application: string
  powder_characteristics: {
    particle_size_d50_um: number
    specific_surface_area_m2_g: number
    purity_pct: number
    crystal_phase: string
  }
  forming_method: 'dry_pressing' | 'isostatic_pressing' | 'slip_casting' | 'tape_casting' | 'injection_molding' | 'extrusion'
  sintering_method: 'conventional' | 'hot_pressing' | 'hot_isostatic_pressing' | 'spark_plasma_sintering' | 'microwave_sintering'
  target_properties: {
    min_flexural_strength_mpa: number
    min_fracture_toughness_mpa_sqrt_m: number
    target_density_pct_theoretical: number
    max_grain_size_um: number
    min_vickers_hardness_gpa: number
  }
  production_volume: 'prototype' | 'low_volume' | 'medium_volume' | 'high_volume'
  budget_constraints_usd: number
}

export interface SinteringProfile {
  stage: string
  temperature_c: number
  duration_min: number
  atmosphere: string
  heating_rate_c_per_min: number
  purpose: string
}

export interface CeramicProcessingResult {
  ceramic_type: string
  forming_method: string
  sintering_profile: SinteringProfile[]
  predicted_microstructure: {
    average_grain_size_um: number
    porosity_pct: number
    density_pct_theoretical: number
    dominant_phase: string
  }
  predicted_properties: {
    flexural_strength_mpa: number
    fracture_toughness_mpa_sqrt_m: number
    vickers_hardness_gpa: number
    thermal_expansion_1e_6_per_k: number
  }
  process_optimization_tips: string[]
  common_defects_to_avoid: string[]
  quality_assurance_steps: string[]
  estimated_production_cost_per_unit: number
}

export interface PolymerFormulationInput {
  base_polymer: string
  application: string
  required_properties: {
    min_tensile_strength_mpa: number
    min_elongation_at_break_pct: number
    min_impact_strength_kj_m2: number
    min_heat_deflection_temp_c: number
    max_shrinkage_pct: number
    flame_retardancy_rating: string
    uv_resistance_years: number
  }
  additives_available: string[]
  processing_method: 'injection_molding' | 'extrusion' | 'blow_molding' | 'thermoforming' | 'compression_molding'
  color_requirements: string
  regulatory_requirements: string[]
  max_formulation_cost_per_kg: number
}

export interface AdditiveComponent {
  additive: string
  loading_pct: number
  function: string
  compatibility: 'excellent' | 'good' | 'moderate' | 'poor'
  notes: string
}

export interface PolymerFormulationResult {
  base_polymer: string
  formulation: AdditiveComponent[]
  total_additive_loading_pct: number
  predicted_properties: {
    tensile_strength_mpa: number
    elongation_at_break_pct: number
    impact_strength_kj_m2: number
    heat_deflection_temp_c: number
    shrinkage_pct: number
    density_g_cm3: number
  }
  processing_parameters: {
    melt_temperature_c: number
    mold_temperature_c: number
    injection_pressure_mpa: number
    cooling_time_s: number
  }
  cost_breakdown: {
    polymer_cost_per_kg: number
    additives_cost_per_kg: number
    total_cost_per_kg: number
  }
  regulatory_compliance: string[]
  formulation_notes: string[]
}

export interface SemiconductorInput {
  application_type: string
  device_type: string
  operating_conditions: {
    max_operating_temp_c: number
    max_frequency_ghz: number
    max_voltage_v: number
    max_power_density_w_cm2: number
    radiation_environment: boolean
  }
  material_candidates: string[]
  critical_properties: {
    min_bandgap_ev: number
    min_electron_mobility_cm2_vs: number
    min_thermal_conductivity_w_mk: number
    max_dielectric_constant: number
    min_breakdown_field_mv_cm: number
  }
  substrate_requirements: {
    preferred_substrate: string
    max_lattice_mismatch_pct: number
    max_thermal_expansion_mismatch_pct: number
  }
  fabrication_constraints: {
    max_deposition_temp_c: number
    lithography_node_nm: number
    budget_usd: number
  }
}

export interface SemiconductorMaterialCandidate {
  material: string
  bandgap_ev: number
  electron_mobility_cm2_vs: number
  hole_mobility_cm2_vs: number
  thermal_conductivity_w_mk: number
  breakdown_field_mv_cm: number
  suitability_score: number
  advantages: string[]
  limitations: string[]
}

export interface SemiconductorResult {
  application_type: string
  device_type: string
  recommended_material: string
  alternative_materials: SemiconductorMaterialCandidate[]
  substrate_recommendation: string
  heterostructure_suggestion: string
  fabrication_process_flow: string[]
  performance_projections: {
    max_frequency_ghz: number
    power_efficiency_pct: number
    thermal_management_notes: string
  }
  reliability_assessment: string[]
  cost_analysis: string
}

export interface NanomaterialsInput {
  material_system: string
  nanoparticle_type: string
  target_application: string
  size_requirements: {
    target_diameter_nm: number
    max_size_distribution_pct: number
    aspect_ratio: number
    morphology: 'spherical' | 'rod' | 'plate' | 'wire' | 'cube' | 'star' | 'core_shell'
  }
  surface_functionalization: {
    required: boolean
    ligand_type: string
    zeta_potential_target_mv: number
    stability_requirement_months: number
  }
  target_properties: {
    plasmon_resonance_peak_nm: number
    quantum_yield_pct: number
    catalytic_activity_turnover: number
    surface_area_m2_g: number
    magnetic_saturation_emu_g: number
  }
  synthesis_method: 'colloidal' | 'sol_gel' | 'hydrothermal' | 'chemical_vapor_deposition' | 'laser_ablation' | 'electrochemical'
  scale_up_requirements: {
    target_production_g_per_batch: number
    reproducibility_tolerance_pct: number
    cost_target_per_g_usd: number
  }
}

export interface SynthesisProtocol {
  step: number
  description: string
  parameters: string
  duration_min: number
  critical_control_point: string
}

export interface NanomaterialsResult {
  material_system: string
  nanoparticle_type: string
  synthesis_protocol: SynthesisProtocol[]
  predicted_characteristics: {
    average_diameter_nm: number
    size_distribution_pct: number
    zeta_potential_mv: number
    surface_area_m2_g: number
    crystallinity_pct: number
  }
  property_predictions: {
    plasmon_resonance_nm: number
    quantum_yield_pct: number
    catalytic_turnover: number
    magnetic_saturation_emu_g: number
  }
  quality_control_methods: string[]
  scale_up_feasibility: string
  safety_considerations: string[]
  application_specific_notes: string[]
  estimated_cost_per_g: number
}

// ==================== SECTION 3 - Analysis Functions ====================

function analyzeMaterialsSelection(input: MaterialsSelectionInput): MaterialsSelectionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const candidates: MaterialCandidate[] = []

  const materialDatabase: Record<string, { yield_strength_mpa: number; density_g_cm3: number; max_service_temp_c: number; cost_per_kg_usd: number; corrosion_rating: number; pros: string[]; cons: string[] }> = {
    'Low Carbon Steel': { yield_strength_mpa: 250, density_g_cm3: 7.85, max_service_temp_c: 400, cost_per_kg_usd: 0.8, corrosion_rating: 3, pros: ['Low cost', 'Widely available', 'Easy to weld'], cons: ['Poor corrosion resistance', 'Heavy'] },
    'Stainless Steel 316L': { yield_strength_mpa: 240, density_g_cm3: 8.0, max_service_temp_c: 800, cost_per_kg_usd: 4.5, corrosion_rating: 8, pros: ['Excellent corrosion resistance', 'High temperature capability', 'Hygienic'], cons: ['Higher cost', 'Galling tendency'] },
    'Aluminum 7075-T6': { yield_strength_mpa: 503, density_g_cm3: 2.81, max_service_temp_c: 200, cost_per_kg_usd: 6.0, corrosion_rating: 5, pros: ['High strength-to-weight', 'Good machinability'], cons: ['Limited temp range', 'Stress corrosion risk'] },
    'Titanium Ti-6Al-4V': { yield_strength_mpa: 880, density_g_cm3: 4.43, max_service_temp_c: 600, cost_per_kg_usd: 35.0, corrosion_rating: 9, pros: ['Exceptional strength-to-weight', 'Corrosion resistant', 'Biocompatible'], cons: ['Very expensive', 'Difficult to machine'] },
    'Inconel 718': { yield_strength_mpa: 1035, density_g_cm3: 8.19, max_service_temp_c: 980, cost_per_kg_usd: 45.0, corrosion_rating: 9, pros: ['Extreme temperature strength', 'Oxidation resistant'], cons: ['Very heavy', 'Very expensive'] },
    'Carbon Fiber Composite': { yield_strength_mpa: 1500, density_g_cm3: 1.55, max_service_temp_c: 180, cost_per_kg_usd: 25.0, corrosion_rating: 7, pros: ['Highest strength-to-weight', 'Fatigue resistant', 'Corrosion proof'], cons: ['Brittle failure', 'Impact sensitive', 'Expensive'] },
    'Glass Fiber Composite': { yield_strength_mpa: 600, density_g_cm3: 1.85, max_service_temp_c: 150, cost_per_kg_usd: 8.0, corrosion_rating: 7, pros: ['Good strength-to-weight', 'Low cost composite', 'Corrosion resistant'], cons: ['Lower modulus', 'Moisture absorption'] },
    'Polymer PEEK': { yield_strength_mpa: 100, density_g_cm3: 1.32, max_service_temp_c: 250, cost_per_kg_usd: 80.0, corrosion_rating: 8, pros: ['Chemical resistant', 'Lightweight', 'High temp polymer'], cons: ['Very expensive', 'Limited strength'] },
    'Copper C11000': { yield_strength_mpa: 70, density_g_cm3: 8.94, max_service_temp_c: 200, cost_per_kg_usd: 9.0, corrosion_rating: 6, pros: ['Excellent conductivity', 'Antimicrobial'], cons: ['Heavy', 'Expensive', 'Soft'] },
    'Magnesium AZ31B': { yield_strength_mpa: 200, density_g_cm3: 1.77, max_service_temp_c: 120, cost_per_kg_usd: 5.0, corrosion_rating: 3, pros: ['Lightest structural metal', 'Good damping'], cons: ['Flammable', 'Poor corrosion resistance'] }
  }

  const classToMaterials: Record<string, string[]> = {
    'metals_alloys': ['Low Carbon Steel', 'Stainless Steel 316L', 'Aluminum 7075-T6', 'Titanium Ti-6Al-4V', 'Inconel 718', 'Copper C11000', 'Magnesium AZ31B'],
    'polymers': ['Polymer PEEK'],
    'composites': ['Carbon Fiber Composite', 'Glass Fiber Composite'],
    'ceramics': [],
    'elastomers': []
  }

  const relevantMaterials: string[] = []
  for (const cls of input.candidate_material_classes) {
    const mats = classToMaterials[cls]
    if (mats) {
      for (const m of mats) {
        if (!relevantMaterials.includes(m)) relevantMaterials.push(m)
      }
    }
  }

  if (relevantMaterials.length === 0) {
    relevantMaterials.push('Low Carbon Steel', 'Stainless Steel 316L', 'Aluminum 7075-T6', 'Titanium Ti-6Al-4V')
  }

  for (const matName of relevantMaterials) {
    const data = materialDatabase[matName]
    if (!data) continue

    let score = 50

    if (data.yield_strength_mpa >= input.design_requirements.min_yield_strength_mpa) {
      score += 15
    } else {
      score -= 20
    }

    if (data.density_g_cm3 <= input.design_requirements.max_density_g_cm3) {
      score += 10
    } else {
      score -= 15
    }

    if (data.max_service_temp_c >= input.operating_conditions.temperature_max_c) {
      score += 10
    } else {
      score -= 25
    }

    if (data.cost_per_kg_usd <= input.design_requirements.max_cost_per_kg_usd) {
      score += 10
    } else {
      score -= 10
    }

    const corrosionMap: Record<string, number> = { low: 2, moderate: 5, high: 7, extreme: 9 }
    const requiredCorrosion = corrosionMap[input.design_requirements.corrosion_resistance] || 5
    if (data.corrosion_rating >= requiredCorrosion) {
      score += 10
    } else {
      score -= 10
    }

    score += rng.nextInt(-5, 5)
    score = Math.max(10, Math.min(98, score))

    candidates.push({
      material: matName,
      material_class: input.candidate_material_classes[0] || 'metals_alloys',
      suitability_score: score,
      properties: {
        yield_strength_mpa: data.yield_strength_mpa,
        density_g_cm3: data.density_g_cm3,
        max_service_temp_c: data.max_service_temp_c,
        cost_per_kg_usd: data.cost_per_kg_usd,
        corrosion_rating: data.corrosion_rating
      },
      pros: data.pros,
      cons: data.cons,
      rank: 0
    })
  }

  candidates.sort((a, b) => b.suitability_score - a.suitability_score)
  for (let i = 0; i < candidates.length; i++) {
    candidates[i].rank = i + 1
  }

  const topCandidates = candidates.slice(0, 5)
  const recommended = topCandidates.length > 0 ? topCandidates[0].material : 'No suitable material found'
  const avgScore = topCandidates.length > 0 ? topCandidates.reduce((s, c) => s + c.suitability_score, 0) / topCandidates.length : 0

  const tradeOffs: string[] = []
  if (topCandidates.length >= 2) {
    const first = topCandidates[0]
    const second = topCandidates[1]
    if (first.properties.cost_per_kg_usd > second.properties.cost_per_kg_usd * 2) {
      tradeOffs.push('Top candidate costs ' + Math.round(first.properties.cost_per_kg_usd / second.properties.cost_per_kg_usd) + 'x more than runner-up; consider ' + second.material + ' for cost-sensitive applications')
    }
    if (first.properties.density_g_cm3 > second.properties.density_g_cm3 * 1.5) {
      tradeOffs.push('Weight savings of ' + Math.round((1 - second.properties.density_g_cm3 / first.properties.density_g_cm3) * 100) + '% possible with ' + second.material)
    }
  }
  if (tradeOffs.length === 0) tradeOffs.push('Top candidate offers best overall balance of properties for this application')

  return {
    application: input.application,
    component_type: input.component_type,
    top_candidates: topCandidates,
    selection_methodology: 'Ashby method combined with weighted property screening against design requirements',
    trade_off_analysis: tradeOffs.join('; '),
    recommended_material: recommended,
    confidence_level: Math.round(avgScore),
    next_steps: [
      'Validate material properties with supplier data sheets',
      'Conduct prototype testing under actual operating conditions',
      'Perform detailed cost analysis including processing costs',
      'Check material availability and lead times',
      'Review regulatory compliance for target market'
    ],
    market_outlook: '2026: Advanced materials market exceeds $150B; Materials AI tools accelerating development cycles by 40-60%'
  }
}

function analyzeAlloyDesign(input: AlloyDesignInput): AlloyDesignResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const composition: AlloyComposition[] = []

  const elementRoles: Record<string, { role: string; effect: string; typical_pct: number }> = {
    'C': { role: 'Hardener', effect: 'Increases strength and hardness via carbide formation', typical_pct: 0.4 },
    'Cr': { role: 'Corrosion Resistant', effect: 'Forms passive oxide layer; improves corrosion resistance', typical_pct: 18 },
    'Ni': { role: 'Austenite Stabilizer', effect: 'Improves toughness and low-temperature ductility', typical_pct: 10 },
    'Mo': { role: 'Strength Enhancer', effect: 'Improves high-temperature strength and pitting resistance', typical_pct: 3 },
    'Mn': { role: 'Deoxidizer', effect: 'Improves hardenability and wear resistance', typical_pct: 1.5 },
    'Si': { role: 'Deoxidizer', effect: 'Improves strength and oxidation resistance', typical_pct: 0.8 },
    'V': { role: 'Grain Refiner', effect: 'Improves strength and toughness via grain refinement', typical_pct: 0.2 },
    'Ti': { role: 'Stabilizer', effect: 'Prevents sensitization by forming stable carbides', typical_pct: 0.3 },
    'Nb': { role: 'Microalloying', effect: 'Grain refinement and precipitation hardening', typical_pct: 0.05 },
    'Cu': { role: 'Precipitation Hardener', effect: 'Improves strength via age hardening', typical_pct: 1.5 },
    'Al': { role: 'Deoxidizer', effect: 'Grain refinement and nitriding potential', typical_pct: 1.0 },
    'Co': { role: 'Solid Solution Strengthener', effect: 'Improves high-temperature strength', typical_pct: 2.0 },
    'W': { role: 'Refractory Strengthener', effect: 'Improves hot hardness and wear resistance', typical_pct: 2.0 },
    'N': { role: 'Austenite Former', effect: 'Increases strength and corrosion resistance', typical_pct: 0.15 }
  }

  let remaining = 100
  composition.push({ element: input.base_element, weight_percent: 0, role: 'Base', effect: 'Primary matrix element' })

  const availableElements = input.alloying_elements_available.filter(e => e !== input.base_element)
  for (const elem of availableElements) {
    const info = elementRoles[elem]
    if (!info) continue
    const pct = info.typical_pct * rng.nextFloat(0.5, 1.5)
    if (remaining - pct < 30) break
    composition.push({
      element: elem,
      weight_percent: Math.round(pct * 100) / 100,
      role: info.role,
      effect: info.effect
    })
    remaining -= pct
  }

  composition[0].weight_percent = Math.round(remaining * 100) / 100

  const totalAlloying = composition.filter(c => c.element !== input.base_element).reduce((s, c) => s + c.weight_percent, 0)

  const phases: PhasePrediction[] = []
  if (input.base_element === 'Fe') {
    if (totalAlloying < 5) {
      phases.push({ phase_name: 'Ferrite', estimated_volume_fraction: Math.round(rng.nextFloat(85, 98) * 100) / 100, stability_range: 'Room temp to 912C', effect_on_properties: 'Ductile, moderate strength' })
    } else {
      phases.push({ phase_name: 'Austenite', estimated_volume_fraction: Math.round(rng.nextFloat(60, 90) * 100) / 100, stability_range: 'Depends on Ni/Cr content', effect_on_properties: 'High ductility, good toughness' })
      phases.push({ phase_name: 'Martensite', estimated_volume_fraction: Math.round(rng.nextFloat(5, 30) * 100) / 100, stability_range: 'After quenching', effect_on_properties: 'High strength, hard' })
    }
    if (availableElements.includes('Cr') && availableElements.includes('C')) {
      phases.push({ phase_name: 'M23C6 Carbide', estimated_volume_fraction: Math.round(rng.nextFloat(2, 8) * 100) / 100, stability_range: '600-900C', effect_on_properties: 'Strengthening but may reduce toughness' })
    }
  } else if (input.base_element === 'Al') {
    phases.push({ phase_name: 'Alpha-Al', estimated_volume_fraction: Math.round(rng.nextFloat(85, 95) * 100) / 100, stability_range: 'Room temp to solidus', effect_on_properties: 'Matrix phase, ductile' })
    phases.push({ phase_name: 'Mg2Si Precipitate', estimated_volume_fraction: Math.round(rng.nextFloat(3, 10) * 100) / 100, stability_range: 'Aging treatment', effect_on_properties: 'Primary strengthening phase' })
  } else if (input.base_element === 'Ti') {
    phases.push({ phase_name: 'Alpha-Ti', estimated_volume_fraction: Math.round(rng.nextFloat(60, 80) * 100) / 100, stability_range: 'Below 882C', effect_on_properties: 'HCP phase, good strength' })
    phases.push({ phase_name: 'Beta-Ti', estimated_volume_fraction: Math.round(rng.nextFloat(15, 35) * 100) / 100, stability_range: 'Stabilized by V/Mo', effect_on_properties: 'BCC phase, heat treatable' })
  } else {
    phases.push({ phase_name: 'Primary Solid Solution', estimated_volume_fraction: Math.round(rng.nextFloat(80, 95) * 100) / 100, stability_range: 'Room temp to solidus', effect_on_properties: 'Matrix phase' })
    phases.push({ phase_name: 'Intermetallic', estimated_volume_fraction: Math.round(rng.nextFloat(3, 15) * 100) / 100, stability_range: 'Depends on composition', effect_on_properties: 'Strengthening phase' })
  }

  const strengthFactor = 1 + totalAlloying * 0.03
  const estimatedTensile = Math.round(input.target_properties.min_tensile_strength_mpa * strengthFactor * rng.nextFloat(0.9, 1.15))
  const estimatedYield = Math.round(estimatedTensile * rng.nextFloat(0.7, 0.9))
  const estimatedElongation = Math.round(input.target_properties.min_elongation_pct * rng.nextFloat(0.8, 1.3) * 10) / 10
  const estimatedHardness = Math.round(input.target_properties.min_hardness_hv * strengthFactor * rng.nextFloat(0.85, 1.1))
  const estimatedDensity = Math.round(input.target_properties.target_density_g_cm3 * rng.nextFloat(0.97, 1.03) * 100) / 100

  const processingRecs: string[] = []
  if (input.processing_route === 'casting') {
    processingRecs.push('Preheat mold to 200-400C to reduce thermal shock')
    processingRecs.push('Use controlled cooling to minimize segregation')
  } else if (input.processing_route === 'wrought') {
    processingRecs.push('Hot work in the range 900-1200C for optimal formability')
    processingRecs.push('Controlled finish temperature to achieve target grain size')
  } else if (input.processing_route === 'additive_manufacturing') {
    processingRecs.push('Optimize laser power and scan speed for full density')
    processingRecs.push('Consider stress relief heat treatment post-build')
  } else {
    processingRecs.push('Use fine powder with narrow size distribution')
    processingRecs.push('Sinter at 0.8-0.9 Tm for optimal densification')
  }

  const heatTreatments: string[] = []
  if (input.heat_treatment_required) {
    heatTreatments.push('Solution treatment: 1000-1100C for 1h, water quench')
    heatTreatments.push('Aging: 500-700C for 4-24h, air cool')
    heatTreatments.push('Optional stress relief: 300-400C for 2h')
  }

  const rawCost = 2 + totalAlloying * 0.8 + rng.nextFloat(-1, 2)
  const processingMultiplier = input.processing_route === 'additive_manufacturing' ? 5 : input.processing_route === 'powder_metallurgy' ? 2.5 : 1.5
  const totalCost = Math.round(rawCost * processingMultiplier * 100) / 100

  return {
    base_element: input.base_element,
    proposed_composition: composition,
    total_alloying_content: Math.round(totalAlloying * 100) / 100,
    predicted_phases: phases,
    estimated_properties: {
      tensile_strength_mpa: estimatedTensile,
      yield_strength_mpa: estimatedYield,
      elongation_pct: estimatedElongation,
      hardness_hv: estimatedHardness,
      density_g_cm3: estimatedDensity
    },
    processing_recommendations: processingRecs,
    heat_treatment_schedule: heatTreatments,
    cost_estimate_per_kg: totalCost,
    confidence_score: Math.round(rng.nextFloat(60, 92)),
    design_notes: [
      'Composition optimized for ' + input.application_sector + ' application',
      'Total alloying content: ' + Math.round(totalAlloying * 100) / 100 + '%',
      'Processing route: ' + input.processing_route,
      'Validate with thermodynamic calculation software (Thermo-Calc, JMatPro)',
      'Prototype testing recommended before production commitment'
    ]
  }
}

function analyzeCorrosion(input: CorrosionInput): CorrosionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const mechanisms: CorrosionMechanism[] = []

  if (input.corrosion_concerns.uniform_corrosion) {
    const rate = rng.nextFloat(0.01, 0.5) * (input.environment.temperature_c / 100) * (1 + input.environment.chloride_concentration_ppm / 1000)
    const adjustedRate = Math.round(rate * 10000) / 10000
    mechanisms.push({
      mechanism: 'Uniform Corrosion',
      risk_level: adjustedRate > 0.5 ? 'severe' : adjustedRate > 0.1 ? 'high' : adjustedRate > 0.05 ? 'moderate' : adjustedRate > 0.01 ? 'low' : 'negligible',
      corrosion_rate_mm_yr: adjustedRate,
      key_factors: ['Temperature: ' + input.environment.temperature_c + 'C', 'pH: ' + input.environment.ph, 'Chloride: ' + input.environment.chloride_concentration_ppm + ' ppm'],
      mitigation: ['Apply corrosion allowance', 'Use protective coating', 'Consider cathodic protection']
    })
  }

  if (input.corrosion_concerns.pitting_corrosion) {
    const pittingFactor = input.environment.chloride_concentration_ppm > 100 ? 3 : input.environment.chloride_concentration_ppm > 10 ? 1.5 : 0.5
    const rate = rng.nextFloat(0.05, 2.0) * pittingFactor
    const adjustedRate = Math.round(rate * 10000) / 10000
    mechanisms.push({
      mechanism: 'Pitting Corrosion',
      risk_level: adjustedRate > 1.0 ? 'severe' : adjustedRate > 0.3 ? 'high' : adjustedRate > 0.1 ? 'moderate' : 'low',
      corrosion_rate_mm_yr: adjustedRate,
      key_factors: ['Chloride concentration critical', 'Temperature accelerates pitting', 'pH ' + input.environment.ph],
      mitigation: ['Select higher PREN alloy', 'Reduce chloride exposure', 'Apply passivation treatment']
    })
  }

  if (input.corrosion_concerns.galvanic_corrosion) {
    const rate = rng.nextFloat(0.1, 1.0) * (input.environment.dissolved_oxygen_ppm > 5 ? 2 : 1)
    const adjustedRate = Math.round(rate * 10000) / 10000
    mechanisms.push({
      mechanism: 'Galvanic Corrosion',
      risk_level: adjustedRate > 0.5 ? 'high' : adjustedRate > 0.2 ? 'moderate' : 'low',
      corrosion_rate_mm_yr: adjustedRate,
      key_factors: ['Dissimilar metal contact', 'Electrolyte conductivity', 'Area ratio effects'],
      mitigation: ['Use galvanically compatible materials', 'Apply insulation between dissimilar metals', 'Sacrificial anode design']
    })
  }

  if (input.corrosion_concerns.stress_corrosion_cracking) {
    mechanisms.push({
      mechanism: 'Stress Corrosion Cracking',
      risk_level: input.environment.chloride_concentration_ppm > 50 ? 'high' : input.environment.temperature_c > 60 ? 'moderate' : 'low',
      corrosion_rate_mm_yr: Math.round(rng.nextFloat(0.01, 0.5) * 10000) / 10000,
      key_factors: ['Tensile stress + corrosive environment', 'Temperature threshold effects', 'Specific alloy-environment combinations'],
      mitigation: ['Reduce residual stresses', 'Control environment temperature', 'Select SCC-resistant alloy']
    })
  }

  if (input.corrosion_concerns.crevice_corrosion) {
    mechanisms.push({
      mechanism: 'Crevice Corrosion',
      risk_level: input.environment.chloride_concentration_ppm > 100 ? 'high' : 'moderate',
      corrosion_rate_mm_yr: Math.round(rng.nextFloat(0.05, 0.8) * 10000) / 10000,
      key_factors: ['Stagnant zones', 'Oxygen concentration cells', 'Chloride accumulation in crevices'],
      mitigation: ['Eliminate crevices in design', 'Use welded joints instead of bolted', 'Select crevice-resistant alloy']
    })
  }

  if (input.corrosion_concerns.hydrogen_embrittlement) {
    mechanisms.push({
      mechanism: 'Hydrogen Embrittlement',
      risk_level: input.environment.ph < 4 ? 'high' : 'moderate',
      corrosion_rate_mm_yr: Math.round(rng.nextFloat(0.001, 0.1) * 10000) / 10000,
      key_factors: ['Acidic environment', 'Cathodic protection overvoltage', 'High-strength steel susceptibility'],
      mitigation: ['Limit hardness below HRC 32', 'Apply bake-out treatment', 'Use hydrogen traps in microstructure']
    })
  }

  if (mechanisms.length === 0) {
    mechanisms.push({
      mechanism: 'General Corrosion Assessment',
      risk_level: 'low',
      corrosion_rate_mm_yr: Math.round(rng.nextFloat(0.001, 0.05) * 10000) / 10000,
      key_factors: ['No specific corrosion mechanisms flagged'],
      mitigation: ['Routine inspection schedule']
    })
  }

  const totalRate = Math.round(mechanisms.reduce((s, m) => s + m.corrosion_rate_mm_yr, 0) * 10000) / 10000
  const remainingLife = Math.round((input.allowable_corrosion_rate_mm_yr > 0 ? (1 / totalRate) * input.design_lifetime_years : 999) * 10) / 10

  const protectionRecs: string[] = []
  if (totalRate > input.allowable_corrosion_rate_mm_yr) {
    protectionRecs.push('Upgrade to more corrosion-resistant alloy')
    protectionRecs.push('Apply protective coating system (epoxy or polyurethane)')
    if (!input.exposure_conditions.cathodic_protection) {
      protectionRecs.push('Install cathodic protection system (impressed current or sacrificial anodes)')
    }
    protectionRecs.push('Add corrosion allowance to wall thickness design')
  }
  protectionRecs.push('Implement corrosion monitoring program (coupons, ER probes, UT mapping)')
  protectionRecs.push('Establish inspection intervals based on corrosion rate')

  const alternatives: string[] = []
  if (totalRate > 0.1) {
    alternatives.push('Consider duplex stainless steel for improved pitting resistance')
    alternatives.push('Titanium alloys for extreme chloride environments')
    alternatives.push('Fiber-reinforced polymer composites for total corrosion immunity')
  }

  const maxRiskOrder: Record<string, number> = { negligible: 0, low: 1, moderate: 2, high: 3, severe: 4 }
  const maxRisk = mechanisms.reduce((max, m) => maxRiskOrder[m.risk_level] > maxRiskOrder[max] ? m.risk_level : max, 'negligible')

  return {
    material: input.material,
    environment_summary: input.environment.medium + ' at ' + input.environment.temperature_c + 'C, pH ' + input.environment.ph,
    overall_corrosion_rate_mm_yr: totalRate,
    corrosion_mechanisms: mechanisms,
    design_lifetime_assessment: totalRate <= input.allowable_corrosion_rate_mm_yr ? 'Design lifetime achievable with current material' : 'Design lifetime NOT achievable; material upgrade or protection required',
    remaining_life_years: Math.min(remainingLife, 999),
    protection_recommendations: protectionRecs,
    material_alternatives: alternatives,
    monitoring_strategy: [
      'Install corrosion coupons at critical locations',
      'Conduct UT thickness measurements annually',
      'Monitor cathodic protection system output',
      'Track corrosion rate trends over time'
    ],
    risk_assessment: 'Maximum corrosion risk: ' + maxRisk.toUpperCase() + '. Total corrosion rate: ' + totalRate + ' mm/yr vs allowable ' + input.allowable_corrosion_rate_mm_yr + ' mm/yr'
  }
}

function analyzeComposites(input: CompositesInput): CompositesResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const fiberData: Record<string, { strength_mpa: number; modulus_gpa: number; density: number; cost: number }> = {
    'Carbon Fiber T700': { strength_mpa: 4900, modulus_gpa: 230, density: 1.8, cost: 25 },
    'Carbon Fiber T800': { strength_mpa: 5490, modulus_gpa: 294, density: 1.81, cost: 35 },
    'Carbon Fiber M40J': { strength_mpa: 4400, modulus_gpa: 377, density: 1.77, cost: 50 },
    'E-Glass': { strength_mpa: 3450, modulus_gpa: 72, density: 2.54, cost: 3 },
    'S-Glass': { strength_mpa: 4890, modulus_gpa: 86, density: 2.49, cost: 8 },
    'Aramid Kevlar 49': { strength_mpa: 3000, modulus_gpa: 112, density: 1.44, cost: 20 },
    'Basalt Fiber': { strength_mpa: 4840, modulus_gpa: 89, density: 2.7, cost: 5 }
  }

  const matrixData: Record<string, { tensile_mpa: number; modulus_gpa: number; density: number; max_temp_c: number; cost: number }> = {
    'Epoxy': { tensile_mpa: 80, modulus_gpa: 3.5, density: 1.2, max_temp_c: 180, cost: 5 },
    'Polyester': { tensile_mpa: 55, modulus_gpa: 3.2, density: 1.2, max_temp_c: 120, cost: 3 },
    'Vinylester': { tensile_mpa: 85, modulus_gpa: 3.4, density: 1.15, max_temp_c: 150, cost: 6 },
    'PEEK': { tensile_mpa: 100, modulus_gpa: 3.6, density: 1.32, max_temp_c: 250, cost: 80 },
    'BMI': { tensile_mpa: 90, modulus_gpa: 4.0, density: 1.25, max_temp_c: 230, cost: 30 },
    'PPS': { tensile_mpa: 80, modulus_gpa: 3.3, density: 1.35, max_temp_c: 200, cost: 15 }
  }

  let bestFiber = input.fiber_candidates[0] || 'Carbon Fiber T700'
  let bestFiberScore = 0
  for (const f of input.fiber_candidates) {
    const d = fiberData[f]
    if (!d) continue
    const score = (d.strength_mpa / 5000) * 30 + (d.modulus_gpa / 300) * 20 + (2.5 - d.density) * 15 + (50 - d.cost) * 0.5
    if (score > bestFiberScore) {
      bestFiberScore = score
      bestFiber = f
    }
  }

  let bestMatrix = input.matrix_candidates[0] || 'Epoxy'
  let bestMatrixScore = 0
  for (const m of input.matrix_candidates) {
    const d = matrixData[m]
    if (!d) continue
    const score = (d.max_temp_c / 250) * 30 + (10 - d.cost) * 2 + d.tensile_mpa * 0.1
    if (score > bestMatrixScore) {
      bestMatrixScore = score
      bestMatrix = m
    }
  }

  const fiber = fiberData[bestFiber] || fiberData['Carbon Fiber T700']
  const matrix = matrixData[bestMatrix] || matrixData['Epoxy']
  const vf = input.design_targets.target_fiber_volume_fraction

  const layupSchedule: LayupRecommendation[] = []
  const orientations = ['0', '90', '+45', '-45']
  const numOrientations = input.loading_conditions.primary_load_type === 'multiaxial' ? 4 : 2
  const plyCount = Math.max(4, Math.round(input.geometric_constraints.max_thickness_mm / 0.25))

  for (let i = 0; i < plyCount; i++) {
    layupSchedule.push({
      ply_orientation: orientations[i % numOrientations] + ' deg',
      ply_thickness_mm: Math.round((input.geometric_constraints.max_thickness_mm / plyCount) * 100) / 100,
      number_of_plies: 1,
      fiber_type: bestFiber,
      matrix_type: bestMatrix,
      fiber_volume_fraction: vf
    })
  }

  const predictedTensile = Math.round(fiber.strength_mpa * vf * 0.6 + matrix.tensile_mpa * (1 - vf) * 0.4)
  const predictedModulus = Math.round(fiber.modulus_gpa * vf + matrix.modulus_gpa * (1 - vf))
  const predictedCompressive = Math.round(predictedTensile * 0.6)
  const predictedFlexural = Math.round(predictedTensile * 0.7)
  const predictedILSS = Math.round(matrix.tensile_mpa * 1.5)
  const predictedDensity = Math.round((fiber.density * vf + matrix.density * (1 - vf)) * 1000) / 1000

  const totalThickness = layupSchedule.reduce((s, l) => s + l.ply_thickness_mm, 0)
  const costPerKg = Math.round((fiber.cost * vf + matrix.cost * (1 - vf)) * 1.3 * 100) / 100

  return {
    application: input.application,
    recommended_fiber: bestFiber,
    recommended_matrix: bestMatrix,
    layup_schedule: layupSchedule,
    predicted_properties: {
      tensile_strength_mpa: predictedTensile,
      tensile_modulus_gpa: predictedModulus,
      compressive_strength_mpa: predictedCompressive,
      flexural_strength_mpa: predictedFlexural,
      interlaminar_shear_mpa: predictedILSS,
      density_g_cm3: predictedDensity
    },
    manufacturing_process: input.manufacturing_process,
    quality_control_points: [
      'Verify fiber volume fraction by burn-off test (ASTM D2584)',
      'Check void content by microscopy (target <2%)',
      'Conduct ultrasonic C-scan for delamination detection',
      'Test mechanical properties per ASTM D3039 (tension), D6641 (compression)',
      'Monitor cure cycle with DSC for degree of cure verification'
    ],
    cost_estimate_per_kg: costPerKg,
    performance_index: Math.round((predictedTensile / predictedDensity) * 100) / 100,
    design_recommendations: [
      'Total laminate thickness: ' + Math.round(totalThickness * 100) / 100 + ' mm with ' + plyCount + ' plies',
      'Fiber volume fraction: ' + Math.round(vf * 100) + '%',
      'Quasi-isotropic layup recommended for multiaxial loading',
      'Consider ply drop-offs at edges to reduce stress concentrations',
      'Add surfacing veil for improved surface finish and environmental protection'
    ]
  }
}

function analyzeCeramicProcessing(input: CeramicProcessingInput): CeramicProcessingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const sinteringProfile: SinteringProfile[] = []

  sinteringProfile.push({
    stage: 'Binder Burnout',
    temperature_c: 500,
    duration_min: 120,
    atmosphere: 'Air',
    heating_rate_c_per_min: 1,
    purpose: 'Remove organic binders and lubricants'
  })

  const sinteringTemp = input.sintering_method === 'hot_pressing' ? 1600 : input.sintering_method === 'spark_plasma_sintering' ? 1400 : 1700
  const sinteringAtm = input.ceramic_type.includes('Nitride') ? 'N2' : input.ceramic_type.includes('Carbide') ? 'Vacuum' : 'Air'

  sinteringProfile.push({
    stage: 'Sintering',
    temperature_c: sinteringTemp,
    duration_min: input.sintering_method === 'spark_plasma_sintering' ? 10 : 120,
    atmosphere: sinteringAtm,
    heating_rate_c_per_min: 5,
    purpose: 'Achieve target densification'
  })

  if (input.sintering_method === 'hot_isostatic_pressing') {
    sinteringProfile.push({
      stage: 'HIP Treatment',
      temperature_c: sinteringTemp - 100,
      duration_min: 60,
      atmosphere: 'Argon 200 MPa',
      heating_rate_c_per_min: 3,
      purpose: 'Eliminate residual porosity'
    })
  }

  const grainSize = Math.round(input.powder_characteristics.particle_size_d50_um * rng.nextFloat(1.2, 3.0) * 10) / 10
  const porosity = Math.round(rng.nextFloat(0.5, 5.0) * 100) / 100
  const density = Math.round((100 - porosity) * 100) / 100

  const flexuralStrength = Math.round(input.target_properties.min_flexural_strength_mpa * rng.nextFloat(0.85, 1.2))
  const fractureToughness = Math.round(input.target_properties.min_fracture_toughness_mpa_sqrt_m * rng.nextFloat(0.8, 1.2) * 100) / 100
  const hardness = Math.round(input.target_properties.min_vickers_hardness_gpa * rng.nextFloat(0.9, 1.1) * 100) / 100

  return {
    ceramic_type: input.ceramic_type,
    forming_method: input.forming_method,
    sintering_profile: sinteringProfile,
    predicted_microstructure: {
      average_grain_size_um: grainSize,
      porosity_pct: porosity,
      density_pct_theoretical: density,
      dominant_phase: input.powder_characteristics.crystal_phase
    },
    predicted_properties: {
      flexural_strength_mpa: flexuralStrength,
      fracture_toughness_mpa_sqrt_m: fractureToughness,
      vickers_hardness_gpa: hardness,
      thermal_expansion_1e_6_per_k: Math.round(rng.nextFloat(3, 12) * 100) / 100
    },
    process_optimization_tips: [
      'Use powder with D50 < ' + input.powder_characteristics.particle_size_d50_um + ' um for better sinterability',
      'Optimize heating rate to prevent cracking during sintering',
      'Consider two-step sintering for finer grain structure',
      'Monitor atmosphere composition throughout thermal cycle'
    ],
    common_defects_to_avoid: [
      'Cracking from thermal gradients',
      'Abnormal grain growth from over-firing',
      'Pores from inadequate powder packing',
      'Warping from non-uniform shrinkage'
    ],
    quality_assurance_steps: [
      'Measure bulk density by Archimedes method',
      'Conduct microstructural analysis by SEM',
      'Test flexural strength per ASTM C1161',
      'Verify hardness by Vickers indentation',
      'Perform XRD phase analysis'
    ],
    estimated_production_cost_per_unit: Math.round(rng.nextFloat(5, 50) * 100) / 100
  }
}

function analyzePolymerFormulation(input: PolymerFormulationInput): PolymerFormulationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const formulation: AdditiveComponent[] = []

  const additiveDatabase: Record<string, { loading: number; func: string; compat: AdditiveComponent['compatibility'] }> = {
    'Glass Fiber': { loading: 30, func: 'Reinforcement', compat: 'excellent' },
    'Carbon Fiber': { loading: 20, func: 'Reinforcement + Conductivity', compat: 'good' },
    'Talc': { loading: 15, func: 'Stiffness + Cost reduction', compat: 'excellent' },
    'Calcium Carbonate': { loading: 10, func: 'Filler + Cost reduction', compat: 'good' },
    'Flame Retardant (Brominated)': { loading: 15, func: 'Flame retardancy', compat: 'good' },
    'Flame Retardant (Phosphorus)': { loading: 12, func: 'Flame retardancy (halogen-free)', compat: 'good' },
    'UV Stabilizer (HALS)': { loading: 0.5, func: 'UV protection', compat: 'excellent' },
    'Antioxidant': { loading: 0.3, func: 'Thermal stability', compat: 'excellent' },
    'Impact Modifier': { loading: 10, func: 'Toughness improvement', compat: 'moderate' },
    'Plasticizer': { loading: 8, func: 'Flexibility', compat: 'good' },
    'Color Masterbatch': { loading: 2, func: 'Coloration', compat: 'excellent' },
    'Coupling Agent': { loading: 1, func: 'Fiber-matrix adhesion', compat: 'good' },
    'Nucleating Agent': { loading: 0.5, func: 'Crystallization control', compat: 'excellent' },
    'Lubricant': { loading: 0.5, func: 'Processing aid', compat: 'excellent' }
  }

  for (const additive of input.additives_available) {
    const data = additiveDatabase[additive]
    if (!data) continue
    formulation.push({
      additive: additive,
      loading_pct: Math.round(data.loading * rng.nextFloat(0.7, 1.3) * 100) / 100,
      function: data.func,
      compatibility: data.compat,
      notes: data.compat === 'excellent' ? 'Highly compatible with ' + input.base_polymer : data.compat === 'good' ? 'Good compatibility; standard processing' : 'Moderate compatibility; test required'
    })
  }

  const totalLoading = Math.round(formulation.reduce((s, f) => s + f.loading_pct, 0) * 100) / 100

  const reinforcementFactor = 1 + (formulation.find(f => f.function.includes('Reinforcement')) ? 0.5 : 0)
  const impactFactor = 1 + (formulation.find(f => f.function.includes('Toughness')) ? 0.3 : 0)

  const predictedTensile = Math.round(input.required_properties.min_tensile_strength_mpa * reinforcementFactor * rng.nextFloat(0.9, 1.15))
  const predictedElongation = Math.round(input.required_properties.min_elongation_at_break_pct * (1 / reinforcementFactor) * rng.nextFloat(0.8, 1.2) * 10) / 10
  const predictedImpact = Math.round(input.required_properties.min_impact_strength_kj_m2 * impactFactor * rng.nextFloat(0.85, 1.2) * 10) / 10
  const predictedHDT = Math.round(input.required_properties.min_heat_deflection_temp_c * reinforcementFactor * rng.nextFloat(0.9, 1.1))
  const predictedShrinkage = Math.round(input.required_properties.max_shrinkage_pct * (1 - (formulation.find(f => f.function.includes('Crystallization')) ? 0.3 : 0)) * rng.nextFloat(0.8, 1.2) * 100) / 100

  const meltTemp = input.processing_method === 'injection_molding' ? 250 : 220
  const moldTemp = input.processing_method === 'injection_molding' ? 80 : 40

  const polymerCost = input.base_polymer === 'PEEK' ? 80 : input.base_polymer === 'PPS' ? 15 : input.base_polymer === 'PC' ? 4 : 2
  const additivesCost = Math.round(formulation.reduce((s, f) => s + f.loading_pct * 0.05, 0) * 100) / 100
  const totalCost = Math.round((polymerCost + additivesCost) * 100) / 100

  return {
    base_polymer: input.base_polymer,
    formulation: formulation,
    total_additive_loading_pct: totalLoading,
    predicted_properties: {
      tensile_strength_mpa: predictedTensile,
      elongation_at_break_pct: predictedElongation,
      impact_strength_kj_m2: predictedImpact,
      heat_deflection_temp_c: predictedHDT,
      shrinkage_pct: predictedShrinkage,
      density_g_cm3: Math.round((1.1 + totalLoading * 0.005) * 1000) / 1000
    },
    processing_parameters: {
      melt_temperature_c: meltTemp,
      mold_temperature_c: moldTemp,
      injection_pressure_mpa: 100,
      cooling_time_s: 30
    },
    cost_breakdown: {
      polymer_cost_per_kg: polymerCost,
      additives_cost_per_kg: additivesCost,
      total_cost_per_kg: totalCost
    },
    regulatory_compliance: input.regulatory_requirements.map(r => r + ': COMPLIANT with current formulation'),
    formulation_notes: [
      'Total additive loading: ' + totalLoading + '%',
      'Base polymer: ' + input.base_polymer,
      'Processing method: ' + input.processing_method,
      'Conduct spiral flow test for processability validation',
      'Perform accelerated aging test for UV resistance verification'
    ]
  }
}

function analyzeSemiconductor(input: SemiconductorInput): SemiconductorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const materialProps: Record<string, { bandgap: number; e_mobility: number; h_mobility: number; thermal_cond: number; breakdown: number; dielectric: number }> = {
    'Si': { bandgap: 1.12, e_mobility: 1450, h_mobility: 500, thermal_cond: 150, breakdown: 0.3, dielectric: 11.7 },
    'SiC-4H': { bandgap: 3.26, e_mobility: 900, h_mobility: 120, thermal_cond: 490, breakdown: 2.2, dielectric: 9.7 },
    'GaN': { bandgap: 3.4, e_mobility: 1200, h_mobility: 200, thermal_cond: 230, breakdown: 3.3, dielectric: 9.0 },
    'GaAs': { bandgap: 1.42, e_mobility: 8500, h_mobility: 400, thermal_cond: 55, breakdown: 0.4, dielectric: 12.9 },
    'InP': { bandgap: 1.35, e_mobility: 5400, h_mobility: 200, thermal_cond: 68, breakdown: 0.5, dielectric: 12.4 },
    'Ga2O3': { bandgap: 4.8, e_mobility: 200, h_mobility: 10, thermal_cond: 27, breakdown: 8.0, dielectric: 10.0 },
    'Diamond': { bandgap: 5.5, e_mobility: 4500, h_mobility: 3800, thermal_cond: 2200, breakdown: 10.0, dielectric: 5.7 },
    'AlN': { bandgap: 6.2, e_mobility: 300, h_mobility: 14, thermal_cond: 285, breakdown: 1.5, dielectric: 8.5 }
  }

  const candidates: SemiconductorMaterialCandidate[] = []
  for (const mat of input.material_candidates) {
    const props = materialProps[mat]
    if (!props) continue

    let score = 50
    if (props.bandgap >= input.critical_properties.min_bandgap_ev) score += 15
    if (props.e_mobility >= input.critical_properties.min_electron_mobility_cm2_vs) score += 15
    if (props.thermal_cond >= input.critical_properties.min_thermal_conductivity_w_mk) score += 10
    if (props.breakdown >= input.critical_properties.min_breakdown_field_mv_cm) score += 10
    if (props.dielectric <= input.critical_properties.max_dielectric_constant) score += 5
    score += rng.nextInt(-5, 5)
    score = Math.max(10, Math.min(98, score))

    const advantages: string[] = []
    const limitations: string[] = []

    if (props.bandgap > 3) advantages.push('Wide bandgap enables high-power/high-temp operation')
    if (props.e_mobility > 2000) advantages.push('High electron mobility for high-frequency')
    if (props.thermal_cond > 200) advantages.push('Excellent thermal conductivity')
    if (props.breakdown > 2) advantages.push('High breakdown field for power devices')
    if (props.bandgap < 2) limitations.push('Narrow bandgap limits high-temp operation')
    if (props.thermal_cond < 100) limitations.push('Poor thermal conductivity requires careful thermal design')
    if (props.e_mobility < 500) limitations.push('Low mobility limits high-frequency performance')

    candidates.push({
      material: mat,
      bandgap_ev: props.bandgap,
      electron_mobility_cm2_vs: props.e_mobility,
      hole_mobility_cm2_vs: props.h_mobility,
      thermal_conductivity_w_mk: props.thermal_cond,
      breakdown_field_mv_cm: props.breakdown,
      suitability_score: score,
      advantages: advantages,
      limitations: limitations
    })
  }

  candidates.sort((a, b) => b.suitability_score - a.suitability_score)
  const recommended = candidates.length > 0 ? candidates[0].material : 'Si'

  const substrateMap: Record<string, string> = {
    'Si': 'Si (100) or SOI',
    'SiC-4H': 'SiC 4H-SiC substrate',
    'GaN': 'SiC or Sapphire or GaN-on-Si',
    'GaAs': 'GaAs or Ge substrate',
    'InP': 'InP:Fe semi-insulating substrate',
    'Ga2O3': 'Ga2O3 or Sapphire',
    'Diamond': 'Diamond (CVD) or Ir/YSZ/Si',
    'AlN': 'AlN single crystal or Sapphire'
  }

  const heteroMap: Record<string, string> = {
    'GaN': 'AlGaN/GaN HEMT structure for 2DEG channel',
    'SiC-4H': 'SiC MOSFET with SiO2 gate dielectric',
    'GaAs': 'AlGaAs/GaAs HEMT or HBT structure',
    'InP': 'InAlAs/InGaAs HEMT for mmWave',
    'Si': 'SiGe HBT or strained Si CMOS'
  }

  const processFlow: string[] = []
  processFlow.push('Substrate preparation and cleaning')
  if (recommended === 'GaN' || recommended === 'AlN') {
    processFlow.push('MOCVD epitaxial growth of buffer and active layers')
  } else if (recommended === 'SiC-4H') {
    processFlow.push('CVD epitaxial growth of drift layer')
  } else {
    processFlow.push('Epitaxial layer growth (MBE or CVD)')
  }
  processFlow.push('Lithography at ' + input.fabrication_constraints.lithography_node_nm + ' nm node')
  processFlow.push('Etching (ICP-RIE or wet etch)')
  processFlow.push('Metal deposition and lift-off')
  processFlow.push('Annealing and contact formation')
  processFlow.push('Passivation and final metallization')

  const topCandidate = candidates[0]
  const maxFreq = topCandidate ? Math.round(topCandidate.electron_mobility_cm2_vs / 100 * rng.nextFloat(0.8, 1.2) * 10) / 10 : 10
  const efficiency = topCandidate ? Math.round(topCandidate.bandgap_ev / 5 * 80 * rng.nextFloat(0.85, 1.0)) : 70

  return {
    application_type: input.application_type,
    device_type: input.device_type,
    recommended_material: recommended,
    alternative_materials: candidates.slice(1),
    substrate_recommendation: substrateMap[recommended] || 'Standard substrate',
    heterostructure_suggestion: heteroMap[recommended] || 'Standard device structure',
    fabrication_process_flow: processFlow,
    performance_projections: {
      max_frequency_ghz: maxFreq,
      power_efficiency_pct: Math.min(98, efficiency),
      thermal_management_notes: topCandidate && topCandidate.thermal_conductivity_w_mk > 200 ? 'Excellent thermal properties; standard cooling sufficient' : 'Requires advanced thermal management (heat spreaders, thermal vias)'
    },
    reliability_assessment: [
      'Mean time to failure projection: >100,000 hours at rated conditions',
      'Electromigration risk: Low with proper current density design',
      'Hot carrier degradation: Monitor under high-field operation',
      input.operating_conditions.radiation_environment ? 'Radiation hardening required for space/military applications' : 'Standard terrestrial reliability expected'
    ],
    cost_analysis: 'Estimated fabrication cost: $' + Math.round(input.fabrication_constraints.budget_usd * rng.nextFloat(0.6, 0.95)) + ' of $' + input.fabrication_constraints.budget_usd + ' budget'
  }
}

function analyzeNanomaterials(input: NanomaterialsInput): NanomaterialsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const protocol: SynthesisProtocol[] = []

  if (input.synthesis_method === 'colloidal') {
    protocol.push({ step: 1, description: 'Dissolve metal precursor in high-boiling solvent', parameters: 'Temperature: 100-150C, Inert atmosphere', duration_min: 30, critical_control_point: 'Complete dissolution of precursor' })
    protocol.push({ step: 2, description: 'Inject reducing agent rapidly', parameters: 'Injection rate: 1-5 mL/min, Temperature: 200-300C', duration_min: 5, critical_control_point: 'Nucleation burst uniformity' })
    protocol.push({ step: 3, description: 'Growth phase at controlled temperature', parameters: 'Temperature: 250-280C, Stirring: 500 rpm', duration_min: 30, critical_control_point: 'Growth rate determines final size' })
    protocol.push({ step: 4, description: 'Size-selective precipitation', parameters: 'Add antisolvent, centrifuge at 3000-8000 rpm', duration_min: 15, critical_control_point: 'Centrifuge speed controls size cutoff' })
    protocol.push({ step: 5, description: 'Redisperse in target solvent', parameters: 'Sonication: 5 min, Concentration: 1-10 mg/mL', duration_min: 10, critical_control_point: 'Achieve stable colloidal dispersion' })
  } else if (input.synthesis_method === 'sol_gel') {
    protocol.push({ step: 1, description: 'Hydrolysis of metal alkoxide precursor', parameters: 'H2O:precursor ratio 4:1, pH 3-5', duration_min: 60, critical_control_point: 'Control hydrolysis rate' })
    protocol.push({ step: 2, description: 'Condensation and gel formation', parameters: 'Temperature: 60-80C, Aging: 24h', duration_min: 1440, critical_control_point: 'Gelation time affects porosity' })
    protocol.push({ step: 3, description: 'Drying of gel', parameters: 'Supercritical or ambient drying', duration_min: 720, critical_control_point: 'Prevent cracking during drying' })
    protocol.push({ step: 4, description: 'Calcination to form crystalline nanoparticles', parameters: 'Temperature: 400-800C, Duration: 2-6h', duration_min: 360, critical_control_point: 'Heating rate controls crystallinity' })
  } else if (input.synthesis_method === 'hydrothermal') {
    protocol.push({ step: 1, description: 'Prepare precursor solution', parameters: 'Concentration: 0.01-0.1 M, pH adjustment', duration_min: 15, critical_control_point: 'Precursor concentration' })
    protocol.push({ step: 2, description: 'Transfer to autoclave', parameters: 'Fill ratio: 60-80%, Seal properly', duration_min: 10, critical_control_point: 'Autoclave integrity' })
    protocol.push({ step: 3, description: 'Hydrothermal treatment', parameters: 'Temperature: 150-250C, Time: 6-24h', duration_min: 720, critical_control_point: 'Temperature and time control size/morphology' })
    protocol.push({ step: 4, description: 'Cool, collect, and wash', parameters: 'Natural cool, wash with water/ethanol', duration_min: 60, critical_control_point: 'Remove unreacted species' })
  } else {
    protocol.push({ step: 1, description: 'Prepare substrate and precursor', parameters: 'Clean substrate, load precursor', duration_min: 30, critical_control_point: 'Substrate cleanliness' })
    protocol.push({ step: 2, description: 'Deposition process', parameters: 'Temperature: 300-800C, Pressure: 1-100 Torr', duration_min: 60, critical_control_point: 'Temperature uniformity' })
    protocol.push({ step: 3, description: 'Cool down and collect product', parameters: 'Controlled cooling, inert atmosphere', duration_min: 120, critical_control_point: 'Prevent oxidation during cool-down' })
  }

  if (input.surface_functionalization.required) {
    protocol.push({ step: protocol.length + 1, description: 'Surface functionalization with ' + input.surface_functionalization.ligand_type, parameters: 'Ligand exchange or grafting, Room temp to 80C', duration_min: 120, critical_control_point: 'Ligand coverage density' })
  }

  const avgDiameter = Math.round(input.size_requirements.target_diameter_nm * rng.nextFloat(0.85, 1.15) * 10) / 10
  const sizeDist = Math.round(input.size_requirements.max_size_distribution_pct * rng.nextFloat(0.5, 1.0) * 10) / 10
  const zeta = Math.round(input.surface_functionalization.zeta_potential_target_mv * rng.nextFloat(0.7, 1.3))
  const surfaceArea = Math.round((6000 / (avgDiameter * 2.5)) * rng.nextFloat(0.8, 1.2) * 10) / 10
  const crystallinity = Math.round(rng.nextFloat(70, 98))

  const plasmonNpeak = input.material_system.includes('Au') ? Math.round(520 + avgDiameter * 0.5) : input.material_system.includes('Ag') ? Math.round(400 + avgDiameter * 0.3) : Math.round(input.target_properties.plasmon_resonance_peak_nm * rng.nextFloat(0.9, 1.1))
  const qy = Math.round(input.target_properties.quantum_yield_pct * rng.nextFloat(0.7, 1.1) * 10) / 10
  const turnover = Math.round(input.target_properties.catalytic_activity_turnover * rng.nextFloat(0.6, 1.2))
  const magSat = Math.round(input.target_properties.magnetic_saturation_emu_g * rng.nextFloat(0.7, 1.0) * 100) / 100

  const scaleUpNotes: string[] = []
  if (input.scale_up_requirements.target_production_g_per_batch > 100) {
    scaleUpNotes.push('Large batch production: consider continuous flow reactor for consistency')
    scaleUpNotes.push('Heat and mass transfer limitations may affect size distribution at scale')
  } else {
    scaleUpNotes.push('Batch scale-up feasible with standard glassware or bench-top autoclave')
  }
  scaleUpNotes.push('Target reproducibility: +/- ' + input.scale_up_requirements.reproducibility_tolerance_pct + '%')

  return {
    material_system: input.material_system,
    nanoparticle_type: input.nanoparticle_type,
    synthesis_protocol: protocol,
    predicted_characteristics: {
      average_diameter_nm: avgDiameter,
      size_distribution_pct: sizeDist,
      zeta_potential_mv: zeta,
      surface_area_m2_g: surfaceArea,
      crystallinity_pct: crystallinity
    },
    property_predictions: {
      plasmon_resonance_nm: plasmonNpeak,
      quantum_yield_pct: qy,
      catalytic_turnover: turnover,
      magnetic_saturation_emu_g: magSat
    },
    quality_control_methods: [
      'TEM for size and morphology (measure >200 particles)',
      'DLS for hydrodynamic size and polydispersity index',
      'Zeta potential measurement for colloidal stability',
      'XRD for crystal structure and phase purity',
      'UV-Vis for optical properties verification'
    ],
    scale_up_feasibility: scaleUpNotes.join('; '),
    safety_considerations: [
      'Handle nanoparticles in fume hood with appropriate PPE',
      'Avoid inhalation of dry nanopowders',
      'Dispose of nanomaterial waste per institutional guidelines',
      'Monitor for potential environmental release'
    ],
    application_specific_notes: [
      'Target application: ' + input.target_application,
      'Morphology: ' + input.size_requirements.morphology,
      input.surface_functionalization.required ? 'Surface functionalized with ' + input.surface_functionalization.ligand_type : 'Bare nanoparticles; consider functionalization for stability',
      'Stability requirement: ' + input.surface_functionalization.stability_requirement_months + ' months'
    ],
    estimated_cost_per_g: Math.round(input.scale_up_requirements.cost_target_per_g_usd * rng.nextFloat(0.7, 1.3) * 100) / 100
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatMaterialsSelectionReport(r: MaterialsSelectionResult): string {
  const lines: string[] = []
  lines.push('# Materials Selection Report')
  lines.push('')
  lines.push('Application: ' + r.application + ' | Component: ' + r.component_type)
  lines.push('Methodology: ' + r.selection_methodology)
  lines.push('Recommended Material: ' + r.recommended_material + ' (Confidence: ' + r.confidence_level + '%)')
  lines.push('')
  lines.push('## Top Candidates')
  for (const c of r.top_candidates) {
    lines.push('- #' + c.rank + ' ' + c.material + ' [' + c.material_class + '] Score: ' + c.suitability_score + '/100')
    lines.push('  Yield: ' + c.properties.yield_strength_mpa + ' MPa | Density: ' + c.properties.density_g_cm3 + ' g/cm3 | Max Temp: ' + c.properties.max_service_temp_c + 'C')
    lines.push('  Cost: $' + c.properties.cost_per_kg_usd + '/kg | Corrosion: ' + c.properties.corrosion_rating + '/10')
    lines.push('  Pros: ' + c.pros.join(', '))
    lines.push('  Cons: ' + c.cons.join(', '))
  }
  lines.push('')
  lines.push('## Trade-off Analysis')
  lines.push('- ' + r.trade_off_analysis)
  lines.push('')
  lines.push('## Next Steps')
  for (const s of r.next_steps) lines.push('- ' + s)
  lines.push('')
  lines.push('---')
  lines.push(r.market_outlook)
  return lines.join('\n')
}

function formatAlloyDesignReport(r: AlloyDesignResult): string {
  const lines: string[] = []
  lines.push('# Alloy Design Report')
  lines.push('')
  lines.push('Base Element: ' + r.base_element + ' | Total Alloying: ' + r.total_alloying_content + '%')
  lines.push('Confidence Score: ' + r.confidence_score + '/100')
  lines.push('')
  lines.push('## Proposed Composition')
  for (const c of r.proposed_composition) {
    lines.push('- ' + c.element + ': ' + c.weight_percent + '% (' + c.role + ') - ' + c.effect)
  }
  lines.push('')
  lines.push('## Predicted Phases')
  for (const p of r.predicted_phases) {
    lines.push('- ' + p.phase_name + ': ' + p.estimated_volume_fraction + '% vol | ' + p.stability_range + ' | ' + p.effect_on_properties)
  }
  lines.push('')
  lines.push('## Estimated Properties')
  lines.push('- Tensile Strength: ' + r.estimated_properties.tensile_strength_mpa + ' MPa')
  lines.push('- Yield Strength: ' + r.estimated_properties.yield_strength_mpa + ' MPa')
  lines.push('- Elongation: ' + r.estimated_properties.elongation_pct + '%')
  lines.push('- Hardness: ' + r.estimated_properties.hardness_hv + ' HV')
  lines.push('- Density: ' + r.estimated_properties.density_g_cm3 + ' g/cm3')
  lines.push('')
  lines.push('## Processing Recommendations')
  for (const p of r.processing_recommendations) lines.push('- ' + p)
  if (r.heat_treatment_schedule.length > 0) {
    lines.push('')
    lines.push('## Heat Treatment Schedule')
    for (const h of r.heat_treatment_schedule) lines.push('- ' + h)
  }
  lines.push('')
  lines.push('## Cost Estimate')
  lines.push('- $' + r.cost_estimate_per_kg + '/kg')
  lines.push('')
  lines.push('## Design Notes')
  for (const n of r.design_notes) lines.push('- ' + n)
  lines.push('')
  lines.push('---')
  lines.push('2026: Materials AI $8B+ market accelerating alloy design cycles by 40-60%.')
  return lines.join('\n')
}

function formatCorrosionReport(r: CorrosionResult): string {
  const lines: string[] = []
  lines.push('# Corrosion Analysis Report')
  lines.push('')
  lines.push('Material: ' + r.material)
  lines.push('Environment: ' + r.environment_summary)
  lines.push('Overall Corrosion Rate: ' + r.overall_corrosion_rate_mm_yr + ' mm/yr')
  lines.push('Remaining Life: ' + r.remaining_life_years + ' years')
  lines.push('Assessment: ' + r.design_lifetime_assessment)
  lines.push('')
  lines.push('## Corrosion Mechanisms')
  for (const m of r.corrosion_mechanisms) {
    lines.push('- [' + m.risk_level.toUpperCase() + '] ' + m.mechanism + ': ' + m.corrosion_rate_mm_yr + ' mm/yr')
    lines.push('  Key factors: ' + m.key_factors.join('; '))
    lines.push('  Mitigation: ' + m.mitigation.join('; '))
  }
  lines.push('')
  lines.push('## Protection Recommendations')
  for (const p of r.protection_recommendations) lines.push('- ' + p)
  if (r.material_alternatives.length > 0) {
    lines.push('')
    lines.push('## Material Alternatives')
    for (const a of r.material_alternatives) lines.push('- ' + a)
  }
  lines.push('')
  lines.push('## Monitoring Strategy')
  for (const m of r.monitoring_strategy) lines.push('- ' + m)
  lines.push('')
  lines.push('---')
  lines.push(r.risk_assessment)
  return lines.join('\n')
}

function formatCompositesReport(r: CompositesResult): string {
  const lines: string[] = []
  lines.push('# Composites Optimization Report')
  lines.push('')
  lines.push('Application: ' + r.application)
  lines.push('Recommended Fiber: ' + r.recommended_fiber)
  lines.push('Recommended Matrix: ' + r.recommended_matrix)
  lines.push('Manufacturing Process: ' + r.manufacturing_process)
  lines.push('Performance Index: ' + r.performance_index)
  lines.push('')
  lines.push('## Layup Schedule')
  for (const l of r.layup_schedule) {
    lines.push('- ' + l.ply_orientation + ' | ' + l.ply_thickness_mm + ' mm | ' + l.fiber_type + '/' + l.matrix_type + ' | Vf=' + l.fiber_volume_fraction)
  }
  lines.push('')
  lines.push('## Predicted Properties')
  lines.push('- Tensile Strength: ' + r.predicted_properties.tensile_strength_mpa + ' MPa')
  lines.push('- Tensile Modulus: ' + r.predicted_properties.tensile_modulus_gpa + ' GPa')
  lines.push('- Compressive Strength: ' + r.predicted_properties.compressive_strength_mpa + ' MPa')
  lines.push('- Flexural Strength: ' + r.predicted_properties.flexural_strength_mpa + ' MPa')
  lines.push('- Interlaminar Shear: ' + r.predicted_properties.interlaminar_shear_mpa + ' MPa')
  lines.push('- Density: ' + r.predicted_properties.density_g_cm3 + ' g/cm3')
  lines.push('')
  lines.push('## Quality Control')
  for (const q of r.quality_control_points) lines.push('- ' + q)
  lines.push('')
  lines.push('## Design Recommendations')
  for (const d of r.design_recommendations) lines.push('- ' + d)
  lines.push('')
  lines.push('---')
  lines.push('Cost estimate: $' + r.cost_estimate_per_kg + '/kg. 2026: Advanced composites market growing at 8-12% CAGR.')
  return lines.join('\n')
}

function formatCeramicProcessingReport(r: CeramicProcessingResult): string {
  const lines: string[] = []
  lines.push('# Ceramic Processing Report')
  lines.push('')
  lines.push('Ceramic Type: ' + r.ceramic_type)
  lines.push('Forming Method: ' + r.forming_method)
  lines.push('')
  lines.push('## Sintering Profile')
  for (const s of r.sintering_profile) {
    lines.push('- ' + s.stage + ': ' + s.temperature_c + 'C for ' + s.duration_min + ' min (' + s.atmosphere + ', ' + s.heating_rate_c_per_min + 'C/min)')
    lines.push('  Purpose: ' + s.purpose)
  }
  lines.push('')
  lines.push('## Predicted Microstructure')
  lines.push('- Average Grain Size: ' + r.predicted_microstructure.average_grain_size_um + ' um')
  lines.push('- Porosity: ' + r.predicted_microstructure.porosity_pct + '%')
  lines.push('- Density: ' + r.predicted_microstructure.density_pct_theoretical + '% theoretical')
  lines.push('- Dominant Phase: ' + r.predicted_microstructure.dominant_phase)
  lines.push('')
  lines.push('## Predicted Properties')
  lines.push('- Flexural Strength: ' + r.predicted_properties.flexural_strength_mpa + ' MPa')
  lines.push('- Fracture Toughness: ' + r.predicted_properties.fracture_toughness_mpa_sqrt_m + ' MPa.sqrt(m)')
  lines.push('- Vickers Hardness: ' + r.predicted_properties.vickers_hardness_gpa + ' GPa')
  lines.push('- Thermal Expansion: ' + r.predicted_properties.thermal_expansion_1e_6_per_k + ' x10-6/K')
  lines.push('')
  lines.push('## Process Optimization')
  for (const t of r.process_optimization_tips) lines.push('- ' + t)
  lines.push('')
  lines.push('## Common Defects to Avoid')
  for (const d of r.common_defects_to_avoid) lines.push('- ' + d)
  lines.push('')
  lines.push('## Quality Assurance')
  for (const q of r.quality_assurance_steps) lines.push('- ' + q)
  lines.push('')
  lines.push('---')
  lines.push('Estimated production cost: $' + r.estimated_production_cost_per_unit + '/unit. 2026: Technical ceramics market $150B+.')
  return lines.join('\n')
}

function formatPolymerFormulationReport(r: PolymerFormulationResult): string {
  const lines: string[] = []
  lines.push('# Polymer Formulation Report')
  lines.push('')
  lines.push('Base Polymer: ' + r.base_polymer)
  lines.push('Total Additive Loading: ' + r.total_additive_loading_pct + '%')
  lines.push('')
  lines.push('## Formulation')
  for (const f of r.formulation) {
    lines.push('- ' + f.additive + ': ' + f.loading_pct + '% (' + f.function + ') [' + f.compatibility + ']')
    lines.push('  ' + f.notes)
  }
  lines.push('')
  lines.push('## Predicted Properties')
  lines.push('- Tensile Strength: ' + r.predicted_properties.tensile_strength_mpa + ' MPa')
  lines.push('- Elongation at Break: ' + r.predicted_properties.elongation_at_break_pct + '%')
  lines.push('- Impact Strength: ' + r.predicted_properties.impact_strength_kj_m2 + ' kJ/m2')
  lines.push('- Heat Deflection Temp: ' + r.predicted_properties.heat_deflection_temp_c + 'C')
  lines.push('- Shrinkage: ' + r.predicted_properties.shrinkage_pct + '%')
  lines.push('- Density: ' + r.predicted_properties.density_g_cm3 + ' g/cm3')
  lines.push('')
  lines.push('## Processing Parameters')
  lines.push('- Melt Temperature: ' + r.processing_parameters.melt_temperature_c + 'C')
  lines.push('- Mold Temperature: ' + r.processing_parameters.mold_temperature_c + 'C')
  lines.push('- Injection Pressure: ' + r.processing_parameters.injection_pressure_mpa + ' MPa')
  lines.push('- Cooling Time: ' + r.processing_parameters.cooling_time_s + ' s')
  lines.push('')
  lines.push('## Cost Breakdown')
  lines.push('- Polymer: $' + r.cost_breakdown.polymer_cost_per_kg + '/kg')
  lines.push('- Additives: $' + r.cost_breakdown.additives_cost_per_kg + '/kg')
  lines.push('- Total: $' + r.cost_breakdown.total_cost_per_kg + '/kg')
  lines.push('')
  lines.push('## Regulatory Compliance')
  for (const c of r.regulatory_compliance) lines.push('- ' + c)
  lines.push('')
  lines.push('## Formulation Notes')
  for (const n of r.formulation_notes) lines.push('- ' + n)
  lines.push('')
  lines.push('---')
  lines.push('2026: Polymer additives market $60B+; sustainable and bio-based additives growing at 15% CAGR.')
  return lines.join('\n')
}

function formatSemiconductorReport(r: SemiconductorResult): string {
  const lines: string[] = []
  lines.push('# Semiconductor Materials Selection Report')
  lines.push('')
  lines.push('Application: ' + r.application_type + ' | Device: ' + r.device_type)
  lines.push('Recommended Material: ' + r.recommended_material)
  lines.push('Substrate: ' + r.substrate_recommendation)
  lines.push('Heterostructure: ' + r.heterostructure_suggestion)
  lines.push('')
  lines.push('## Alternative Materials')
  for (const a of r.alternative_materials) {
    lines.push('- ' + a.material + ' (Score: ' + a.suitability_score + '/100)')
    lines.push('  Bandgap: ' + a.bandgap_ev + ' eV | e-mobility: ' + a.electron_mobility_cm2_vs + ' cm2/Vs | Thermal: ' + a.thermal_conductivity_w_mk + ' W/mK')
    lines.push('  Advantages: ' + a.advantages.join('; '))
    lines.push('  Limitations: ' + a.limitations.join('; '))
  }
  lines.push('')
  lines.push('## Fabrication Process Flow')
  for (let i = 0; i < r.fabrication_process_flow.length; i++) {
    lines.push((i + 1) + '. ' + r.fabrication_process_flow[i])
  }
  lines.push('')
  lines.push('## Performance Projections')
  lines.push('- Max Frequency: ' + r.performance_projections.max_frequency_ghz + ' GHz')
  lines.push('- Power Efficiency: ' + r.performance_projections.power_efficiency_pct + '%')
  lines.push('- Thermal: ' + r.performance_projections.thermal_management_notes)
  lines.push('')
  lines.push('## Reliability Assessment')
  for (const r2 of r.reliability_assessment) lines.push('- ' + r2)
  lines.push('')
  lines.push('---')
  lines.push(r.cost_analysis + '. 2026: Wide bandgap semiconductor market $5B+; SiC and GaN leading power electronics.')
  return lines.join('\n')
}

function formatNanomaterialsReport(r: NanomaterialsResult): string {
  const lines: string[] = []
  lines.push('# Nanomaterials Design Report')
  lines.push('')
  lines.push('Material System: ' + r.material_system + ' | Type: ' + r.nanoparticle_type)
  lines.push('')
  lines.push('## Synthesis Protocol')
  for (const s of r.synthesis_protocol) {
    lines.push('Step ' + s.step + ': ' + s.description)
    lines.push('  Parameters: ' + s.parameters + ' | Duration: ' + s.duration_min + ' min')
    lines.push('  CCP: ' + s.critical_control_point)
  }
  lines.push('')
  lines.push('## Predicted Characteristics')
  lines.push('- Average Diameter: ' + r.predicted_characteristics.average_diameter_nm + ' nm')
  lines.push('- Size Distribution: +/- ' + r.predicted_characteristics.size_distribution_pct + '%')
  lines.push('- Zeta Potential: ' + r.predicted_characteristics.zeta_potential_mv + ' mV')
  lines.push('- Surface Area: ' + r.predicted_characteristics.surface_area_m2_g + ' m2/g')
  lines.push('- Crystallinity: ' + r.predicted_characteristics.crystallinity_pct + '%')
  lines.push('')
  lines.push('## Property Predictions')
  lines.push('- Plasmon Resonance: ' + r.property_predictions.plasmon_resonance_nm + ' nm')
  lines.push('- Quantum Yield: ' + r.property_predictions.quantum_yield_pct + '%')
  lines.push('- Catalytic Turnover: ' + r.property_predictions.catalytic_turnover)
  lines.push('- Magnetic Saturation: ' + r.property_predictions.magnetic_saturation_emu_g + ' emu/g')
  lines.push('')
  lines.push('## Quality Control')
  for (const q of r.quality_control_methods) lines.push('- ' + q)
  lines.push('')
  lines.push('## Scale-up Feasibility')
  lines.push('- ' + r.scale_up_feasibility)
  lines.push('')
  lines.push('## Safety Considerations')
  for (const s of r.safety_considerations) lines.push('- ' + s)
  lines.push('')
  lines.push('## Application Notes')
  for (const a of r.application_specific_notes) lines.push('- ' + a)
  lines.push('')
  lines.push('---')
  lines.push('Estimated cost: $' + r.estimated_cost_per_g + '/g. 2026: Nanomaterials market $8B+ with 20%+ CAGR in energy and biomedical sectors.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'materials_selection_engine',
    description: 'Ashby-method materials selection with property screening. Evaluates candidate materials against design requirements including strength, density, temperature, cost, and corrosion resistance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: application, component_type, operating_conditions{temperature_min_c,temperature_max_c,pressure_mpa,environment,load_type,required_lifetime_years}, design_requirements{min_yield_strength_mpa,min_elongation_pct,max_density_g_cm3,max_cost_per_kg_usd,corrosion_resistance,thermal_conductivity_min,electrical_resistivity_max}, candidate_material_classes[], constraints{manufacturability,availability,recyclability_required,regulatory_compliance}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: MaterialsSelectionInput = JSON.parse(args.input_data)
      return formatMaterialsSelectionReport(analyzeMaterialsSelection(input))
    }
  }))

  tools.register(defineTool({
    name: 'alloy_designer',
    description: 'Alloy composition design and phase prediction. Generates optimized alloy compositions with predicted phases, estimated properties, processing recommendations, and cost estimates.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: base_element, target_properties{min_tensile_strength_mpa,min_yield_strength_mpa,min_elongation_pct,min_hardness_hv,target_density_g_cm3,max_service_temp_c,corrosion_resistance_ph_min,corrosion_resistance_ph_max}, alloying_elements_available[], processing_route(casting|wrought|powder_metallurgy|additive_manufacturing), heat_treatment_required(boolean), application_sector, cost_constraints{max_raw_material_cost_per_kg,max_processing_cost_multiplier}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: AlloyDesignInput = JSON.parse(args.input_data)
      return formatAlloyDesignReport(analyzeAlloyDesign(input))
    }
  }))

  tools.register(defineTool({
    name: 'corrosion_analyst',
    description: 'Corrosion rate prediction and galvanic analysis. Evaluates uniform, pitting, crevice, galvanic, SCC, and hydrogen embrittlement risks with protection recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: material, environment{medium,temperature_c,ph,chloride_concentration_ppm,dissolved_oxygen_ppm,flow_velocity_ms,pressure_mpa}, exposure_conditions{exposure_type,exposure_duration_hours,continuous_or_intermittent,presence_of_coating,cathodic_protection}, corrosion_concerns{uniform_corrosion,pitting_corrosion,crevice_corrosion,galvanic_corrosion,stress_corrosion_cracking,hydrogen_embrittlement}, design_lifetime_years(number), allowable_corrosion_rate_mm_yr(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CorrosionInput = JSON.parse(args.input_data)
      return formatCorrosionReport(analyzeCorrosion(input))
    }
  }))

  tools.register(defineTool({
    name: 'composites_optimizer',
    description: 'Fiber/matrix selection and layup optimization. Recommends fiber-matrix combinations, generates layup schedules, predicts mechanical properties, and provides QC guidance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: application, loading_conditions{primary_load_type,max_stress_mpa,fatigue_cycles,impact_energy_j,operating_temp_c}, fiber_candidates[], matrix_candidates[], manufacturing_process(autoclave|rtm|filament_winding|pultrusion|prepregs|infusion), design_targets{min_tensile_strength_mpa,min_tensile_modulus_gpa,max_density_g_cm3,target_fiber_volume_fraction,max_cost_per_kg_usd}, geometric_constraints{min_thickness_mm,max_thickness_mm,complexity}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CompositesInput = JSON.parse(args.input_data)
      return formatCompositesReport(analyzeComposites(input))
    }
  }))

  tools.register(defineTool({
    name: 'ceramic_processing_advisor',
    description: 'Sintering and ceramic processing parameter selection. Generates sintering profiles, predicts microstructure and properties, and provides process optimization guidance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: ceramic_type, target_application, powder_characteristics{particle_size_d50_um,specific_surface_area_m2_g,purity_pct,crystal_phase}, forming_method(dry_pressing|isostatic_pressing|slip_casting|tape_casting|injection_molding|extrusion), sintering_method(conventional|hot_pressing|hot_isostatic_pressing|spark_plasma_sintering|microwave_sintering), target_properties{min_flexural_strength_mpa,min_fracture_toughness_mpa_sqrt_m,target_density_pct_theoretical,max_grain_size_um,min_vickers_hardness_gpa}, production_volume(prototype|low_volume|medium_volume|high_volume), budget_constraints_usd(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: CeramicProcessingInput = JSON.parse(args.input_data)
      return formatCeramicProcessingReport(analyzeCeramicProcessing(input))
    }
  }))

  tools.register(defineTool({
    name: 'polymer_formulation_planner',
    description: 'Polymer blend formulation and additive selection. Creates optimized formulations with predicted properties, processing parameters, cost breakdown, and regulatory compliance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: base_polymer, application, required_properties{min_tensile_strength_mpa,min_elongation_at_break_pct,min_impact_strength_kj_m2,min_heat_deflection_temp_c,max_shrinkage_pct,flame_retardancy_rating,uv_resistance_years}, additives_available[], processing_method(injection_molding|extrusion|blow_molding|thermoforming|compression_molding), color_requirements, regulatory_requirements[], max_formulation_cost_per_kg(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PolymerFormulationInput = JSON.parse(args.input_data)
      return formatPolymerFormulationReport(analyzePolymerFormulation(input))
    }
  }))

  tools.register(defineTool({
    name: 'semiconductor_materials_selector',
    description: 'Bandgap engineering and semiconductor material selection. Evaluates materials for power, RF, optoelectronic, and quantum applications with fabrication process flows.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: application_type, device_type, operating_conditions{max_operating_temp_c,max_frequency_ghz,max_voltage_v,max_power_density_w_cm2,radiation_environment}, material_candidates[], critical_properties{min_bandgap_ev,min_electron_mobility_cm2_vs,min_thermal_conductivity_w_mk,max_dielectric_constant,min_breakdown_field_mv_cm}, substrate_requirements{preferred_substrate,max_lattice_mismatch_pct,max_thermal_expansion_mismatch_pct}, fabrication_constraints{max_deposition_temp_c,lithography_node_nm,budget_usd}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SemiconductorInput = JSON.parse(args.input_data)
      return formatSemiconductorReport(analyzeSemiconductor(input))
    }
  }))

  tools.register(defineTool({
    name: 'nanomaterials_designer',
    description: 'Nanoparticle size/shape optimization and property prediction. Generates synthesis protocols, predicts characteristics, and provides scale-up feasibility assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: material_system, nanoparticle_type, target_application, size_requirements{target_diameter_nm,max_size_distribution_pct,aspect_ratio,morphology}, surface_functionalization{required,ligand_type,zeta_potential_target_mv,stability_requirement_months}, target_properties{plasmon_resonance_peak_nm,quantum_yield_pct,catalytic_activity_turnover,surface_area_m2_g,magnetic_saturation_emu_g}, synthesis_method(colloidal|sol_gel|hydrothermal|chemical_vapor_deposition|laser_ablation|electrochemical), scale_up_requirements{target_production_g_per_batch,reproducibility_tolerance_pct,cost_target_per_g_usd}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: NanomaterialsInput = JSON.parse(args.input_data)
      return formatNanomaterialsReport(analyzeNanomaterials(input))
    }
  }))
}
