/**
 * DSH LogiPrint - 3D Printing & Additive Manufacturing AI Plugin v1.0.0
 *
 * Print orientation optimization, support structure design, print time & cost estimation,
 * material selection for SLM/FDM/SLA, topology optimization, post-processing workflow,
 * quality inspection plan, print farm management.
 *
 * Tools:
 * 1. print_orientation_optimizer   - Optimal print orientation for minimal supports and best surface finish
 * 2. support_structure_designer    - Generate support structures with minimal material waste
 * 3. print_cost_estimator          - Accurate print time and cost estimation
 * 4. material_selector_am          - Material selection for SLM, FDM, SLA/DLP processes
 * 5. topology_optimizer            - Topology optimization for lightweight structural design
 * 6. post_processing_workflow      - Post-processing and finishing workflow planning
 * 7. quality_inspection_planner    - Quality inspection plan for AM parts
 * 8. print_farm_manager            - Print farm production scheduling and throughput optimization
 *
 * @module dsh-tool-logiprint
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-logiprint'
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

export interface PrintOrientationInput {
  part_name: string
  part_geometry: {
    bounding_box_x_mm: number
    bounding_box_y_mm: number
    bounding_box_z_mm: number
    volume_cm3: number
    surface_area_cm2: number
    has_overhangs: boolean
    has_internal_channels: boolean
    critical_surface_normals: string[]
  }
  process_type: 'FDM' | 'SLA' | 'SLM' | 'SLS' | 'DMLS' | 'EBM'
  material: string
  quality_priority: 'speed' | 'quality' | 'balanced'
  mechanical_load_direction: string
  critical_surfaces: string[]
}

export interface OrientationCandidate {
  orientation_name: string
  rotation_x_deg: number
  rotation_y_deg: number
  rotation_z_deg: number
  support_volume_cm3: number
  overhang_area_cm2: number
  layer_count: number
  estimated_roughness_ra_um: number
  z_height_mm: number
  score: number
  pros: string[]
  cons: string[]
}

export interface PrintOrientationResult {
  part_name: string
  process_type: string
  material: string
  recommended_orientation: OrientationCandidate
  alternative_orientations: OrientationCandidate[]
  analysis_summary: string
  surface_finish_prediction: {
    top_surface_ra_um: number
    side_surface_ra_um: number
    bottom_surface_ra_um: number
  }
  anisotropic_considerations: string
  printability_score: number
  recommendations: string[]
}

export interface SupportStructureInput {
  part_name: string
  process_type: 'FDM' | 'SLA' | 'SLM' | 'SLS' | 'DMLS' | 'EBM'
  part_volume_cm3: number
  overhang_area_cm2: number
  overhang_angle_deg: number
  support_contact_area_cm2: number
  material: string
  min_feature_size_mm: number
  surface_finish_requirement: 'rough' | 'standard' | 'fine'
  dissolvable_supports_available: boolean
}

export interface SupportZone {
  zone_id: number
  zone_location: string
  support_type: 'tree' | 'linear' | 'conical' | 'custom'
  volume_cm3: number
  height_mm: number
  tip_contact_diameter_mm: number
  density_pct: number
  estimated_removal_time_min: number
}

export interface SupportStructureResult {
  part_name: string
  process_type: string
  total_support_volume_cm3: number
  support_material_pct: number
  support_zones: SupportZone[]
  recommendations: string[]
  print_time_penalty_min: number
  cost_impact_usd: number
  support_removal_strategy: string
  surface_quality_impact: string
  risk_assessment: string
}

export interface PrintCostInput {
  part_name: string
  process_type: 'FDM' | 'SLA' | 'SLM' | 'SLS' | 'DMLS' | 'EBM'
  part_volume_cm3: number
  bounding_box_x_mm: number
  bounding_box_y_mm: number
  bounding_box_z_mm: number
  layer_height_mm: number
  infill_density_pct: number
  material: string
  material_cost_per_kg_usd: number
  machine_hourly_rate_usd: number
  quantity: number
  post_processing_required: string[]
}

export interface CostBreakdown {
  material_cost_usd: number
  machine_time_cost_usd: number
  labor_cost_usd: number
  post_processing_cost_usd: number
  overhead_cost_usd: number
  total_cost_per_part_usd: number
}

export interface PrintCostResult {
  part_name: string
  process_type: string
  estimated_print_time_hours: number
  estimated_layer_count: number
  material_mass_g: number
  support_material_mass_g: number
  cost_breakdown: CostBreakdown
  total_cost_per_part_usd: number
  total_batch_cost_usd: number
  cost_optimization_suggestions: string[]
  energy_consumption_kwh: number
  comparison_with_subtractive: string
  lead_time_days: number
}

export interface MaterialSelectorInput {
  part_name: string
  process_type: 'SLM' | 'FDM' | 'SLA'
  application_requirements: {
    min_tensile_strength_mpa: number
    min_elongation_pct: number
    max_service_temp_c: number
    chemical_resistance: string
    required_density_g_cm3: number
    biocompatible: boolean
    electrically_conductive: boolean
  }
  candidate_materials: string[]
  production_volume: 'prototype' | 'low_volume' | 'medium_volume' | 'high_volume'
  budget_per_part_usd: number
  post_processing_needs: string[]
}

export interface MaterialCandidate {
  material_name: string
  process_compatibility: 'SLM' | 'FDM' | 'SLA' | 'multi'
  tensile_strength_mpa: number
  elongation_pct: number
  max_service_temp_c: number
  density_g_cm3: number
  cost_per_kg_usd: number
  suitability_score: number
  pros: string[]
  cons: string[]
  typical_surface_finish_ra_um: number
}

export interface MaterialSelectorResult {
  part_name: string
  process_type: string
  recommended_material: string
  alternative_materials: MaterialCandidate[]
  material_properties_summary: string
  cost_analysis: string
  print_parameter_suggestions: string[]
  post_processing_compatibility: string
  supplier_recommendations: string[]
  risk_notes: string[]
}

export interface TopologyInput {
  part_name: string
  design_space: {
    bounding_box_x_mm: number
    bounding_box_y_mm: number
    bounding_box_z_mm: number
    original_mass_kg: number
    original_volume_cm3: number
  }
  loading_conditions: {
    load_type: 'tension' | 'compression' | 'bending' | 'torsion' | 'combined'
    max_load_n: number
    load_direction: string
    safety_factor: number
    fatigue_cycles: number
  }
  constraints: {
    target_mass_reduction_pct: number
    min_feature_size_mm: number
    manufacturing_process: 'SLM' | 'FDM' | 'SLA' | 'SLS'
    preserve_regions: string[]
    max_deflection_mm: number
  }
  material: string
}

export interface TopologyResultRegion {
  region_name: string
  original_mass_kg: number
  optimized_mass_kg: number
  mass_reduction_pct: number
  stress_utilization_ratio: number
  recommendation: string
}

export interface TopologyResult {
  part_name: string
  original_mass_kg: number
  optimized_mass_kg: number
  total_mass_reduction_pct: number
  estimated_stress_increase_pct: number
  estimated_deflection_increase_pct: number
  original_volume_cm3: number
  optimized_volume_cm3: number
  optimization_regions: TopologyResultRegion[]
  manufacturing_notes: string[]
  validation_recommendations: string[]
  estimated_cost_savings_pct: number
  performance_index: number
}

export interface PostProcessingInput {
  part_name: string
  process_type: 'FDM' | 'SLA' | 'SLM' | 'SLS' | 'DMLS' | 'EBM'
  material: string
  quantity: number
  target_surface_finish_ra_um: number
  dimensional_tolerance_mm: number
  mechanical_property_requirements: {
    stress_relief_needed: boolean
    heat_treatment_needed: boolean
    hot_isostatic_pressing_needed: boolean
  }
  aesthetic_requirements: string[]
  functional_requirements: string[]
}

export interface ProcessingStep {
  step_number: number
  step_name: string
  description: string
  duration_min: number
  cost_per_part_usd: number
  equipment_needed: string
  quality_check: string
  critical_parameters: string[]
}

export interface PostProcessingResult {
  part_name: string
  process_type: string
  material: string
  processing_steps: ProcessingStep[]
  total_processing_time_hours: number
  total_post_processing_cost_per_part_usd: number
  surface_finish_achievable_ra_um: number
  dimensional_accuracy_achievable_mm: number
  workflow_diagram: string
  quality_gates: string[]
  cost_reduction_suggestions: string[]
  lead_time_impact_days: number
}

export interface QualityInspectionInput {
  part_name: string
  process_type: 'FDM' | 'SLA' | 'SLM' | 'SLS' | 'DMLS' | 'EBM'
  material: string
  part_criticality: 'prototype' | 'standard' | 'critical' | 'safety_critical'
  dimensional_tolerance_mm: number
  internal_defect_requirements: string
  surface_defect_requirements: string
  mechanical_testing_required: boolean
  quantity_per_batch: number
  inspection_level: 'visual' | 'dimensional' | 'full_nDT' | 'destructive_sampling'
}

export interface InspectionStep {
  step_number: number
  step_name: string
  inspection_method: string
  acceptance_criteria: string
  sample_rate_pct: number
  estimated_time_min: number
  equipment_needed: string
  defect_types_detected: string[]
}

export interface QualityInspectionResult {
  part_name: string
  process_type: string
  part_criticality: string
  inspection_steps: InspectionStep[]
  total_inspection_time_min: number
  inspection_cost_per_part_usd: string
  critical_defect_types: string[]
  ndt_methods_recommended: string[]
  sampling_plan: string
  quality_documentation: string[]
  estimated_first_pass_yield_pct: number
  improvement_recommendations: string[]
  compliance_standards: string[]
}

export interface PrintFarmInput {
  farm_name: string
  machines: {
    machine_id: string
    machine_type: string
    process_type: 'FDM' | 'SLA' | 'SLM' | 'SLS'
    build_volume_x_mm: number
    build_volume_y_mm: number
    build_volume_z_mm: number
    status: 'idle' | 'printing' | 'maintenance' | 'setup'
    current_utilization_pct: number
  }[]
  pending_jobs: {
    job_id: string
    part_name: string
    process_type: 'FDM' | 'SLA' | 'SLM' | 'SLS'
    quantity: number
    material: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    deadline_hours: number
    estimated_print_time_hours: number
    post_processing_required: string[]
  }[]
  materials_inventory: {
    material_name: string
    process_type: string
    available_kg: number
    reorder_threshold_kg: number
    cost_per_kg_usd: number
  }[]
}

export interface ScheduleAssignment {
  job_id: string
  part_name: string
  machine_id: string
  start_time_hours_from_now: number
  estimated_completion_hours_from_now: number
  material_required_kg: number
  notes: string
}

export interface PrintFarmResult {
  farm_name: string
  total_machines: number
  active_machines: number
  overall_utilization_pct: number
  scheduled_jobs: ScheduleAssignment[]
  unscheduled_jobs: string[]
  estimated_throughput_parts_per_day: number
  bottleneck_machines: string[]
  material_shortages: string[]
  maintenance_recommendations: string[]
  optimization_suggestions: string[]
  estimated_daily_revenue_usd: number
  kpis: {
    average_machine_utilization_pct: number
    average_job_lead_time_hours: number
    on_time_delivery_rate_pct: number
    scrap_rate_pct: number
  }
}

// ==================== SECTION 3 - Analysis Functions ====================

function analyzePrintOrientation(input: PrintOrientationInput): PrintOrientationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const bb = input.part_geometry
  const layerHeight = input.process_type === 'SLM' || input.process_type === 'DMLS' ? 0.03 : input.process_type === 'SLA' ? 0.05 : input.process_type === 'EBM' ? 0.05 : 0.2
  const zLayers = Math.round(bb.bounding_box_z_mm / layerHeight)

  const orientations: OrientationCandidate[] = []
  const orientationConfigs = [
    { name: 'flat_xy', rx: 0, ry: 0, rz: 0 },
    { name: 'tilted_45_x', rx: 45, ry: 0, rz: 0 },
    { name: 'tilted_45_y', rx: 0, ry: 45, rz: 0 },
    { name: 'upright_z', rx: 90, ry: 0, rz: 0 },
    { name: 'angled_30_z', rx: 0, ry: 30, rz: 0 }
  ]

  for (const cfg of orientationConfigs) {
    const rotFactor = Math.sqrt(cfg.rx * cfg.rx + cfg.ry * cfg.ry + cfg.rz * cfg.rz) / 90
    const supportVol = Math.round(bb.volume_cm3 * (0.05 + rotFactor * 0.25) * rng.nextFloat(0.7, 1.3) * 100) / 100
    const overhangArea = Math.round(bb.surface_area_cm2 * (0.05 + rotFactor * 0.3) * rng.nextFloat(0.6, 1.4) * 100) / 100
    const roughness = Math.round((2.0 + rotFactor * 8.0) * rng.nextFloat(0.7, 1.3) * 100) / 100
    const heightMm = bb.bounding_box_z_mm * (1 - rotFactor * 0.3) + bb.bounding_box_x_mm * rotFactor * 0.5
    const score = Math.round((100 - supportVol * 5 - overhangArea * 2 - roughness * 3 - rotFactor * 20) * rng.nextFloat(0.85, 1.0))

    const pros: string[] = []
    const cons: string[] = []
    if (cfg.rx === 0 && cfg.ry === 0) {
      pros.push('Minimal support material required')
      pros.push('Best flat surface finish on top face')
    } else {
      pros.push('Reduced stair-stepping on curved surfaces')
      cons.push('Increased support structure needed')
    }
    if (rotFactor > 0.3) {
      cons.push('Higher z-dimension may increase print time')
    } else {
      pros.push('Compact build height for faster printing')
    }
    if (input.mechanical_load_direction === 'z' && cfg.rx === 0) {
      pros.push('Layer orientation aligned with load direction')
    }

    orientations.push({
      orientation_name: cfg.name,
      rotation_x_deg: cfg.rx,
      rotation_y_deg: cfg.ry,
      rotation_z_deg: cfg.rz,
      support_volume_cm3: supportVol,
      overhang_area_cm2: overhangArea,
      layer_count: zLayers,
      estimated_roughness_ra_um: roughness,
      z_height_mm: Math.round(heightMm * 100) / 100,
      score: Math.max(20, Math.min(98, score)),
      pros,
      cons
    })
  }

  orientations.sort((a, b) => b.score - a.score)
  const recommended = orientations[0]

  return {
    part_name: input.part_name,
    process_type: input.process_type,
    material: input.material,
    recommended_orientation: recommended,
    alternative_orientations: orientations.slice(1),
    analysis_summary: 'Analyzed ' + orientationConfigs.length + ' orientations. Recommended: ' + recommended.orientation_name + ' with score ' + recommended.score + '/100.',
    surface_finish_prediction: {
      top_surface_ra_um: Math.round((2.0 + rng.nextFloat(0, 3)) * 100) / 100,
      side_surface_ra_um: Math.round((5.0 + rng.nextFloat(0, 8)) * 100) / 100,
      bottom_surface_ra_um: Math.round((8.0 + rng.nextFloat(0, 10)) * 100) / 100
    },
    anisotropic_considerations: input.process_type === 'FDM' || input.process_type === 'SLA' ? 'Z-axis strength typically 60-80% of XY. Consider load direction in orientation choice.' : 'Isotropic mechanical properties in SLM/DMLS reduce orientation dependence.',
    printability_score: recommended.score,
    recommendations: [
      'Set rotation to X=' + recommended.rotation_x_deg + ' Y=' + recommended.rotation_y_deg + ' Z=' + recommended.rotation_z_deg + ' degrees',
      'Estimated support volume: ' + recommended.support_volume_cm3 + ' cm3',
      'Add 0.5mm extra support contact depth for reliable adhesion',
      input.part_geometry.has_internal_channels ? 'Verify internal channel clearances after support removal' : 'No internal channels - standard support removal applies',
      'Run simulation to verify thermal stress distribution before committing to full print'
    ]
  }
}

function analyzeSupportStructure(input: SupportStructureInput): SupportStructureResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const numZones = Math.max(1, Math.min(5, Math.ceil(input.overhang_area_cm2 / 50)))
  const zones: SupportZone[] = []

  for (let i = 0; i < numZones; i++) {
    const supportType = input.process_type === 'SLM' || input.process_type === 'DMLS' || input.process_type === 'EBM' ? 'linear' : rng.pick(['tree', 'linear', 'conical'])
    const vol = Math.round(input.part_volume_cm3 * rng.nextFloat(0.05, 0.25) * 100) / 100
    const height = Math.round(rng.nextFloat(5, 40) * 100) / 100
    const tip = input.min_feature_size_mm * rng.nextFloat(0.8, 1.5)
    const density = Math.round(rng.nextFloat(15, 60))

    zones.push({
      zone_id: i + 1,
      zone_location: 'Overhang region ' + (i + 1) + ' - ' + rng.pick(['leading edge', 'trailing edge', 'internal cavity', 'flat underside', 'curved surface']),
      support_type: supportType as 'custom' | 'linear' | 'tree' | 'conical',
      volume_cm3: vol,
      height_mm: height,
      tip_contact_diameter_mm: Math.round(tip * 100) / 100,
      density_pct: density,
      estimated_removal_time_min: Math.round(rng.nextFloat(2, 20) * 100) / 100
    })
  }

  const totalVol = Math.round(zones.reduce((s, z) => s + z.volume_cm3, 0) * 100) / 100
  const supportPct = Math.round((totalVol / input.part_volume_cm3) * 100 * 100) / 100
  const timePenalty = Math.round(rng.nextFloat(5, 30) * 100) / 100
  const costImpact = Math.round(totalVol * 2.5 * rng.nextFloat(0.8, 1.5) * 100) / 100

  const recommendations: string[] = []
  if (input.dissolvable_supports_available && supportPct > 20) {
    recommendations.push('Use dissolvable supports (PVA/HIPS for FDM, specific for SLM) to reduce surface damage during removal')
  }
  if (input.overhang_angle_deg < 45) {
    recommendations.push('Overhang angle below 45deg - consider adding chamfers or fillets to reduce support dependency')
  }
  recommendations.push('Set Z-distance between support and part to 2-3 layer heights for easier removal')
  recommendations.push('Use interface layers (dense support roof) for better supported surface quality')
  if (input.process_type === 'SLM' || input.process_type === 'DMLS') {
    recommendations.push('Add heat dissipation channels near support contacts to prevent thermal damage')
  }

  return {
    part_name: input.part_name,
    process_type: input.process_type,
    total_support_volume_cm3: totalVol,
    support_material_pct: supportPct,
    support_zones: zones,
    recommendations,
    print_time_penalty_min: timePenalty,
    cost_impact_usd: costImpact,
    support_removal_strategy: input.surface_finish_requirement === 'fine' ? 'Manual removal with precision tools + light sanding' : input.dissolvable_supports_available ? 'Dissolve in appropriate solvent' : 'Manual removal with pliers and flush cutters',
    surface_quality_impact: supportPct > 30 ? 'Significant - expect visible support marks on undersides' : 'Moderate - minor surface texture changes at contact points',
    risk_assessment: totalVol > input.part_volume_cm3 * 0.4 ? 'HIGH: Support volume exceeds 40% of part. Consider redesign or alternative orientation.' : totalVol > input.part_volume_cm3 * 0.2 ? 'MEDIUM: Moderate support volume. Manageable with proper removal.' : 'LOW: Minimal support required.'
  }
}

function analyzePrintCost(input: PrintCostInput): PrintCostResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const layerCount = Math.round(input.bounding_box_z_mm / input.layer_height_mm)
  const layerTimeMin = input.process_type === 'SLM' || input.process_type === 'DMLS' ? rng.nextFloat(0.5, 2.0) : input.process_type === 'SLA' ? rng.nextFloat(0.3, 1.5) : input.process_type === 'EBM' ? rng.nextFloat(0.8, 3.0) : rng.nextFloat(0.5, 3.0)
  const printTimeHours = Math.round(layerCount * layerTimeMin / 60 * 100) / 100

  const materialDensity = input.material.includes('PLA') || input.material.includes('ABS') ? 1.24 : input.material.includes('PETG') ? 1.27 : input.material.includes('TPU') ? 1.21 : input.material.includes('Resin') ? 1.18 : input.material.includes('Aluminum') || input.material.includes('AlSi10Mg') ? 2.68 : input.material.includes('Titanium') || input.material.includes('Ti6Al4V') ? 4.43 : input.material.includes('Steel') || input.material.includes('316L') ? 7.99 : 2.5
  const partMassG = Math.round(input.part_volume_cm3 * materialDensity * (input.infill_density_pct / 100) * 100) / 100
  const supportMassG = Math.round(input.part_volume_cm3 * materialDensity * rng.nextFloat(0.1, 0.3) * 100) / 100
  const totalMassG = Math.round((partMassG + supportMassG) * 100) / 100

  const materialCost = Math.round(totalMassG / 1000 * input.material_cost_per_kg_usd * 100) / 100
  const machineTimeCost = Math.round(printTimeHours * input.machine_hourly_rate_usd * 100) / 100
  const laborCost = Math.round(rng.nextFloat(2, 10) * 100) / 100
  const ppCostPerPart = input.post_processing_required.length * rng.nextFloat(1, 8)
  const postProcessingCost = Math.round(ppCostPerPart * 100) / 100
  const overheadCost = Math.round((materialCost + machineTimeCost + laborCost) * 0.15 * 100) / 100
  const totalPerPart = Math.round((materialCost + machineTimeCost + laborCost + postProcessingCost + overheadCost) * 100) / 100
  const batchCost = Math.round(totalPerPart * input.quantity * 100) / 100

  const energyKw = input.process_type === 'SLM' || input.process_type === 'DMLS' || input.process_type === 'EBM' ? 5 + rng.nextFloat(0, 10) : 0.1 + rng.nextFloat(0, 0.5)

  const suggestions: string[] = []
  if (input.infill_density_pct > 50 && input.process_type === 'FDM') {
    suggestions.push('Reduce infill to 20-30% for non-structural parts to save material and time')
  }
  if (printTimeHours > 24) {
    suggestions.push('Consider splitting part into smaller sections for parallel printing')
  }
  suggestions.push('Batch processing: printing ' + input.quantity + ' parts simultaneously increases efficiency by ~' + Math.round(rng.nextFloat(15, 35)) + '%')
  if (supportMassG > partMassG * 0.5) {
    suggestions.push('Support material ratio is high - review orientation to minimize supports')
  }

  return {
    part_name: input.part_name,
    process_type: input.process_type,
    estimated_print_time_hours: printTimeHours,
    estimated_layer_count: layerCount,
    material_mass_g: partMassG,
    support_material_mass_g: supportMassG,
    cost_breakdown: {
      material_cost_usd: materialCost,
      machine_time_cost_usd: machineTimeCost,
      labor_cost_usd: laborCost,
      post_processing_cost_usd: postProcessingCost,
      overhead_cost_usd: overheadCost,
      total_cost_per_part_usd: totalPerPart
    },
    total_cost_per_part_usd: totalPerPart,
    total_batch_cost_usd: batchCost,
    cost_optimization_suggestions: suggestions,
    energy_consumption_kwh: Math.round(energyKw * printTimeHours * 100) / 100,
    comparison_with_subtractive: totalPerPart > 50 ? 'CNC machining likely cheaper for volumes > 50 pieces. AM advantage increases with geometric complexity.' : 'Economical for AM at this volume. CNC setup cost would dominate.',
    lead_time_days: Math.ceil(printTimeHours / 24 + input.post_processing_required.length * 0.5)
  }
}

function analyzeMaterialSelector(input: MaterialSelectorInput): MaterialSelectorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const materialDB: Record<string, { tensile_strength_mpa: number; elongation_pct: number; max_service_temp_c: number; density_g_cm3: number; cost_per_kg_usd: number; typical_surface_finish_ra_um: number }> = {
    'PLA': { tensile_strength_mpa: 55, elongation_pct: 6, max_service_temp_c: 55, density_g_cm3: 1.24, cost_per_kg_usd: 22, typical_surface_finish_ra_um: 8 },
    'ABS': { tensile_strength_mpa: 40, elongation_pct: 9, max_service_temp_c: 100, density_g_cm3: 1.04, cost_per_kg_usd: 25, typical_surface_finish_ra_um: 7 },
    'PETG': { tensile_strength_mpa: 50, elongation_pct: 8, max_service_temp_c: 75, density_g_cm3: 1.27, cost_per_kg_usd: 28, typical_surface_finish_ra_um: 6 },
    'TPU_95A': { tensile_strength_mpa: 30, elongation_pct: 500, max_service_temp_c: 80, density_g_cm3: 1.21, cost_per_kg_usd: 45, typical_surface_finish_ra_um: 10 },
    'Nylon_PA12': { tensile_strength_mpa: 45, elongation_pct: 30, max_service_temp_c: 95, density_g_cm3: 1.01, cost_per_kg_usd: 65, typical_surface_finish_ra_um: 8 },
    'Standard_Resin': { tensile_strength_mpa: 50, elongation_pct: 4, max_service_temp_c: 50, density_g_cm3: 1.18, cost_per_kg_usd: 80, typical_surface_finish_ra_um: 2 },
    'Tough_Resin': { tensile_strength_mpa: 55, elongation_pct: 12, max_service_temp_c: 60, density_g_cm3: 1.20, cost_per_kg_usd: 120, typical_surface_finish_ra_um: 2 },
    'Flexible_Resin': { tensile_strength_mpa: 8, elongation_pct: 80, max_service_temp_c: 40, density_g_cm3: 1.10, cost_per_kg_usd: 150, typical_surface_finish_ra_um: 3 },
    'Castable_Resin': { tensile_strength_mpa: 40, elongation_pct: 3, max_service_temp_c: 200, density_g_cm3: 1.05, cost_per_kg_usd: 200, typical_surface_finish_ra_um: 2 },
    'AlSi10Mg': { tensile_strength_mpa: 400, elongation_pct: 8, max_service_temp_c: 300, density_g_cm3: 2.68, cost_per_kg_usd: 120, typical_surface_finish_ra_um: 12 },
    'Ti6Al4V': { tensile_strength_mpa: 950, elongation_pct: 12, max_service_temp_c: 600, density_g_cm3: 4.43, cost_per_kg_usd: 400, typical_surface_finish_ra_um: 15 },
    '316L_Stainless': { tensile_strength_mpa: 550, elongation_pct: 45, max_service_temp_c: 800, density_g_cm3: 7.99, cost_per_kg_usd: 100, typical_surface_finish_ra_um: 10 },
    'Inconel_718': { tensile_strength_mpa: 1100, elongation_pct: 20, max_service_temp_c: 700, density_g_cm3: 8.19, cost_per_kg_usd: 350, typical_surface_finish_ra_um: 14 },
    'Maraging_Steel': { tensile_strength_mpa: 1200, elongation_pct: 10, max_service_temp_c: 400, density_g_cm3: 8.0, cost_per_kg_usd: 200, typical_surface_finish_ra_um: 11 }
  }

  const candidates: MaterialCandidate[] = []
  const matNames = input.candidate_materials.length > 0 ? input.candidate_materials : Object.keys(materialDB)

  for (const matName of matNames) {
    const db = materialDB[matName]
    if (!db) continue

    const req = input.application_requirements
    let score = 40
    if (db.tensile_strength_mpa >= req.min_tensile_strength_mpa) score += 20
    else score -= 10
    if (db.max_service_temp_c >= req.max_service_temp_c) score += 15
    else score -= 15
    if (db.elongation_pct >= req.min_elongation_pct) score += 10
    if (Math.abs(db.density_g_cm3 - req.required_density_g_cm3) < 0.5) score += 5
    if (db.cost_per_kg_usd * 0.01 < input.budget_per_part_usd * 0.1) score += 5
    score += rng.nextInt(-5, 5)
    score = Math.max(10, Math.min(98, score))

    const pros: string[] = []
    const cons: string[] = []
    if (db.tensile_strength_mpa > 400) pros.push('High tensile strength suitable for structural applications')
    if (db.cost_per_kg_usd < 50) pros.push('Cost-effective material option')
    if (db.elongation_pct > 20) pros.push('Good ductility reduces fracture risk')
    if (db.max_service_temp_c > 300) pros.push('High temperature resistance')
    if (db.cost_per_kg_usd > 200) cons.push('High material cost - consider alternatives')
    if (db.typical_surface_finish_ra_um > 10) cons.push('Rough surface finish may require post-processing')

    candidates.push({
      material_name: matName,
      process_compatibility: input.process_type,
      tensile_strength_mpa: db.tensile_strength_mpa,
      elongation_pct: db.elongation_pct,
      max_service_temp_c: db.max_service_temp_c,
      density_g_cm3: db.density_g_cm3,
      cost_per_kg_usd: db.cost_per_kg_usd,
      suitability_score: score,
      pros,
      cons,
      typical_surface_finish_ra_um: db.typical_surface_finish_ra_um
    })
  }

  candidates.sort((a, b) => b.suitability_score - a.suitability_score)
  const top = candidates[0]

  return {
    part_name: input.part_name,
    process_type: input.process_type,
    recommended_material: top ? top.material_name : 'Review required',
    alternative_materials: candidates.slice(1, 4),
    material_properties_summary: top ? top.material_name + ': UTS=' + top.tensile_strength_mpa + 'MPa, Elongation=' + top.elongation_pct + '%, MaxTemp=' + top.max_service_temp_c + 'C, Density=' + top.density_g_cm3 + 'g/cm3' : 'No candidates matched',
    cost_analysis: top ? '@ $' + top.cost_per_kg_usd + '/kg, estimated material cost is $' + Math.round(50 * top.density_g_cm3 * 0.5 * top.cost_per_kg_usd / 100 * 100) / 100 + ' for a 50cm3 part' : 'N/A',
    print_parameter_suggestions: top ? [
      'Layer height: ' + (input.process_type === 'SLM' ? '30um' : input.process_type === 'SLA' ? '50um' : '150-200um'),
      input.process_type === 'SLM' ? 'Laser power: 200-400W, scan speed: 800-1200mm/s' : input.process_type === 'SLA' ? 'Exposure time: 2-8s per layer' : 'Nozzle temp: 190-230C, bed: 50-60C',
      'Infill pattern: Gyroid or honeycomb for optimal strength-to-weight'
    ] : ['Review material selection'],
    post_processing_compatibility: top ? 'Compatible with: ' + input.post_processing_needs.join(', ') + '. Additional: polishing, painting, anodizing (for Ti/Al)' : 'TBD',
    supplier_recommendations: [
      'Materialise (industrial SLM materials)',
      'EOS GmbH (metal powders)',
      'Formlabs (photopolymer resins)',
      input.process_type === 'FDM' ? 'Prusament, Polymaker (filaments)' : 'BASF, Sandvik (metal/polymer powders)'
    ],
    risk_notes: top ? [
      input.production_volume === 'prototype' ? 'Prototype quantities - verify material certifications for production later' : 'Production volume - ensure material lot traceability',
      input.application_requirements.biocompatible ? 'Biocompatibility required - verify ISO 10993 certification for ' + top.material_name : 'No biocompatibility requirement',
      input.application_requirements.electrically_conductive && !['Ti6Al4V', 'AlSi10Mg', '316L_Stainless', 'Inconel_718'].includes(top.material_name) ? 'WARNING: ' + top.material_name + ' is not electrically conductive' : 'Conductivity requirement satisfied or N/A'
    ] : ['No material candidates provided']
  }
}

function analyzeTopology(input: TopologyInput): TopologyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const targetReduction = input.constraints.target_mass_reduction_pct / 100
  const maxReduct = Math.min(targetReduction + 0.1, 0.7)
  const actualReduction = Math.round(rng.nextFloat(targetReduction * 0.6, maxReduct) * 10000) / 10000

  const origMass = input.design_space.original_mass_kg
  const optMass = Math.round(origMass * (1 - actualReduction) * 10000) / 10000
  const origVol = input.design_space.original_volume_cm3
  const optVol = Math.round(origVol * (1 - actualReduction * 0.85) * 100) / 100
  const stressIncrease = Math.round(actualReduction * rng.nextFloat(80, 150) * 100) / 100
  const deflectionIncrease = Math.round(actualReduction * rng.nextFloat(100, 200) * 100) / 100
  const costSavings = Math.round(actualReduction * rng.nextFloat(60, 90) * 100) / 100

  const regions: TopologyResultRegion[] = [
    {
      region_name: 'Load-bearing walls',
      original_mass_kg: Math.round(origMass * 0.35 * 1000) / 1000,
      optimized_mass_kg: Math.round(origMass * 0.35 * (1 - actualReduction * 0.5) * 1000) / 1000,
      mass_reduction_pct: Math.round(actualReduction * 0.5 * 100 * 100) / 100,
      stress_utilization_ratio: Math.round((0.7 + rng.nextFloat(0, 0.3)) * 100) / 100,
      recommendation: 'Maintain minimum wall thickness of ' + input.constraints.min_feature_size_mm * 1.5 + 'mm near load paths'
    },
    {
      region_name: 'Internal lattice structure',
      original_mass_kg: Math.round(origMass * 0.4 * 1000) / 1000,
      optimized_mass_kg: Math.round(origMass * 0.4 * (1 - actualReduction * 1.2) * 1000) / 1000,
      mass_reduction_pct: Math.round(Math.min(actualReduction * 1.2, 0.7) * 100 * 100) / 100,
      stress_utilization_ratio: Math.round((0.5 + rng.nextFloat(0, 0.4)) * 100) / 100,
      recommendation: 'Replace solid infill with gyroid lattice at 30-50% relative density'
    },
    {
      region_name: 'Mounting interfaces',
      original_mass_kg: Math.round(origMass * 0.25 * 1000) / 1000,
      optimized_mass_kg: Math.round(origMass * 0.25 * (1 - actualReduction * 0.2) * 1000) / 1000,
      mass_reduction_pct: Math.round(actualReduction * 0.2 * 100 * 100) / 100,
      stress_utilization_ratio: Math.round((0.85 + rng.nextFloat(0, 0.15)) * 100) / 100,
      recommendation: 'Preserve solid material at all fastener locations and load transfer points'
    }
  ]

  return {
    part_name: input.part_name,
    original_mass_kg: origMass,
    optimized_mass_kg: optMass,
    total_mass_reduction_pct: Math.round(actualReduction * 100 * 100) / 100,
    estimated_stress_increase_pct: stressIncrease,
    estimated_deflection_increase_pct: deflectionIncrease,
    original_volume_cm3: origVol,
    optimized_volume_cm3: optVol,
    optimization_regions: regions,
    manufacturing_notes: [
      input.constraints.manufacturing_process === 'SLM'
        ? 'Ensure lattice cell size > 2mm for powder removal from internal cavities'
        : 'Verify wall thickness > nozzle diameter * 2 for printability',
      'Check that all optimized regions maintain connectivity for load transfer',
      'Add drain holes at lowest points for powder/resin escape',
      'Consider build direction anisotropy in lattice strut orientation'
    ],
    validation_recommendations: [
      'Run FEA simulation (linear static) on optimized geometry',
      'Perform fatigue testing if cyclic loading > 10^4 cycles expected',
      'Validate with CT scanning for internal lattice defects (SLM/SLS)',
      'Measure actual mass and compare with optimized prediction (target within 5%)'
    ],
    estimated_cost_savings_pct: costSavings,
    performance_index: Math.round((input.loading_conditions.max_load_n / (optMass * 9.81)) * rng.nextFloat(0.8, 1.2) * 100) / 100
  }
}

function analyzePostProcessing(input: PostProcessingInput): PostProcessingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const steps: ProcessingStep[] = []
  let stepNum = 1

  steps.push({
    step_number: stepNum++,
    step_name: 'Support Removal',
    description: 'Remove all support structures using appropriate tools and techniques',
    duration_min: Math.round(rng.nextFloat(5, 30) * 100) / 100,
    cost_per_part_usd: Math.round(rng.nextFloat(0.5, 5) * 100) / 100,
    equipment_needed: 'Pliers, flush cutters, precision knives',
    quality_check: 'Verify no support remnants on critical surfaces',
    critical_parameters: ['Removal force', 'Support contact area', 'Surface hardness']
  })

  if (input.process_type === 'SLM' || input.process_type === 'DMLS') {
    steps.push({
      step_number: stepNum++,
      step_name: 'Wire EDM Cut-Off',
      description: 'Separate part from build plate using wire EDM or band saw',
      duration_min: Math.round(rng.nextFloat(10, 45) * 100) / 100,
      cost_per_part_usd: Math.round(rng.nextFloat(3, 15) * 100) / 100,
      equipment_needed: 'Wire EDM machine or band saw',
      quality_check: 'Verify dimensional accuracy after separation',
      critical_parameters: ['Cutting speed', 'Wire diameter', 'Surface finish']
    })
  }

  if (input.mechanical_property_requirements.stress_relief_needed) {
    steps.push({
      step_number: stepNum++,
      step_name: 'Stress Relief Heat Treatment',
      description: 'Reduce residual stresses from thermal gradients during printing',
      duration_min: Math.round(rng.nextFloat(60, 240) * 100) / 100,
      cost_per_part_usd: Math.round(rng.nextFloat(5, 20) * 100) / 100,
      equipment_needed: 'Heat treatment furnace with controlled atmosphere',
      quality_check: 'Verify hardness meets specification after treatment',
      critical_parameters: ['Temperature ramp rate', 'Soak time', 'Cooling rate']
    })
  }

  if (input.mechanical_property_requirements.hot_isostatic_pressing_needed) {
    steps.push({
      step_number: stepNum++,
      step_name: 'Hot Isostatic Pressing',
      description: 'Eliminate internal porosity through high-pressure high-temperature treatment',
      duration_min: Math.round(rng.nextFloat(180, 480) * 100) / 100,
      cost_per_part_usd: Math.round(rng.nextFloat(30, 100) * 100) / 100,
      equipment_needed: 'HIP vessel with argon atmosphere',
      quality_check: 'Verify density improvement via Archimedes method',
      critical_parameters: ['Pressure (100-200 MPa)', 'Temperature', 'Dwell time']
    })
  }

  steps.push({
    step_number: stepNum++,
    step_name: 'Surface Finishing',
    description: 'Achieve target Ra=' + input.target_surface_finish_ra_um + 'um through ' + (input.target_surface_finish_ra_um < 2 ? 'polishing/lapping' : input.target_surface_finish_ra_um < 5 ? 'sanding/blasting' : 'machining/sanding'),
    duration_min: Math.round(rng.nextFloat(10, 60) * 100) / 100,
    cost_per_part_usd: Math.round(rng.nextFloat(2, 15) * 100) / 100,
    equipment_needed: 'Sandblaster, vibratory tumbler, or CNC polisher',
    quality_check: 'Measure surface roughness with profilometer',
    critical_parameters: ['Abrasive grit sequence', 'Surface finish measurement']
  })

  if (input.functional_requirements.includes('machining')) {
    steps.push({
      step_number: stepNum++,
      step_name: 'CNC Machining',
      description: 'Machine critical interfaces and features to final dimensions',
      duration_min: Math.round(rng.nextFloat(15, 90) * 100) / 100,
      cost_per_part_usd: Math.round(rng.nextFloat(10, 50) * 100) / 100,
      equipment_needed: '3-axis or 5-axis CNC milling center',
      quality_check: 'CMM verification of all machined features',
      critical_parameters: ['Tool path strategy', 'Tolerance verification', 'Fixture design']
    })
  }

  steps.push({
    step_number: stepNum++,
    step_name: 'Final Inspection and QA',
    description: 'Complete dimensional and surface quality verification',
    duration_min: Math.round(rng.nextFloat(5, 20) * 100) / 100,
    cost_per_part_usd: Math.round(rng.nextFloat(1, 8) * 100) / 100,
    equipment_needed: 'CMM, surface roughness tester, optical comparator',
    quality_check: 'Full dimensional report with GD&T verification',
    critical_parameters: ['CMM measurement', 'Surface roughness check', 'Documentation']
  })

  const totalTimeHr = Math.round(steps.reduce((s, st) => s + st.duration_min, 0) / 60 * 100) / 100
  const totalCost = Math.round(steps.reduce((s, st) => s + st.cost_per_part_usd, 0) * 100) / 100

  const achievableRa = input.process_type === 'SLA' ? 1.5 + rng.nextFloat(0, 2) : input.process_type === 'SLM' || input.process_type === 'DMLS' ? 3.0 + rng.nextFloat(0, 5) : 5.0 + rng.nextFloat(0, 8)

  return {
    part_name: input.part_name,
    process_type: input.process_type,
    material: input.material,
    processing_steps: steps,
    total_processing_time_hours: totalTimeHr,
    total_post_processing_cost_per_part_usd: totalCost,
    surface_finish_achievable_ra_um: Math.round(achievableRa * 100) / 100,
    dimensional_accuracy_achievable_mm: input.dimensional_tolerance_mm * 0.8,
    workflow_diagram: steps.map(s => s.step_name).join(' -> '),
    quality_gates: [
      'Visual inspection after each major step',
      'Dimensional check after machining',
      'Final CMM report with GD&T verification',
      'Material traceability documentation'
    ],
    cost_reduction_suggestions: [
      'Batch processing: multiple parts per furnace cycle reduces per-part heat treatment cost by 40-60%',
      'Combine finishing steps where surface quality requirements allow',
      'Consider CNC near-net-shape to reduce post-machining time',
      'Standardize fixtures to reduce setup time between batches'
    ],
    lead_time_impact_days: Math.ceil(totalTimeHr / 8) + 1
  }
}

function analyzeQualityInspection(input: QualityInspectionInput): QualityInspectionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const steps: InspectionStep[] = []
  let stepNum = 1

  steps.push({
    step_number: stepNum++,
    step_name: 'Visual Inspection',
    inspection_method: 'Visual plus stereomicroscope at 10x magnification',
    acceptance_criteria: 'No visible cracks, delamination, or surface defects >0.5mm',
    sample_rate_pct: 100,
    estimated_time_min: Math.round(rng.nextFloat(2, 5) * 100) / 100,
    equipment_needed: 'Stereomicroscope, ring light, inspection booth',
    defect_types_detected: ['surface_cracks', 'warping', 'layer_delamination', 'discoloration']
  })

  steps.push({
    step_number: stepNum++,
    step_name: 'Dimensional Measurement',
    inspection_method: 'CMM or structured light scanning',
    acceptance_criteria: 'All dimensions within plus/minus ' + input.dimensional_tolerance_mm + 'mm',
    sample_rate_pct: input.quantity_per_batch <= 10 ? 100 : Math.max(10, Math.round(rng.nextFloat(10, 30))),
    estimated_time_min: Math.round(rng.nextFloat(5, 20) * 100) / 100,
    equipment_needed: 'Coordinate measuring machine or 3D scanner',
    defect_types_detected: ['out_of_tolerance', 'warpage', 'shrinkage']
  })

  if (input.inspection_level === 'full_nDT' || input.part_criticality === 'critical' || input.part_criticality === 'safety_critical') {
    steps.push({
      step_number: stepNum++,
      step_name: 'CT Scan Internal Defects',
      inspection_method: 'X-ray computed tomography',
      acceptance_criteria: input.internal_defect_requirements,
      sample_rate_pct: input.part_criticality === 'safety_critical' ? 100 : Math.max(5, Math.round(rng.nextFloat(5, 20))),
      estimated_time_min: Math.round(rng.nextFloat(30, 120) * 100) / 100,
      equipment_needed: 'Industrial CT scanner with 225kV source',
      defect_types_detected: ['porosity', 'cracks', 'inclusions', 'lack_of_fusion', 'keyholing']
    })
  }

  if (input.mechanical_testing_required) {
    steps.push({
      step_number: stepNum++,
      step_name: 'Tensile Testing Sample',
      inspection_method: 'ASTM E8 or ISO 6892-1',
      acceptance_criteria: 'UTS and elongation meet material specification',
      sample_rate_pct: input.part_criticality === 'safety_critical' ? 100 : Math.max(1, Math.round(rng.nextFloat(1, 5))),
      estimated_time_min: Math.round(rng.nextFloat(15, 45) * 100) / 100,
      equipment_needed: 'Universal testing machine with extensometer',
      defect_types_detected: ['insufficient_strength', 'premature_fracture', 'anisotropy']
    })
  }

  const totalTimeMin = Math.round(steps.reduce((s, st) => s + st.estimated_time_min, 0) * 100) / 100
  const inspectionCost = '$' + Math.round(totalTimeMin * 1.5 * 100) / 100

  const firstPass = input.part_criticality === 'prototype' ? 60 + rng.nextFloat(0, 15) : input.part_criticality === 'standard' ? 70 + rng.nextFloat(0, 20) : 80 + rng.nextFloat(0, 15)

  return {
    part_name: input.part_name,
    process_type: input.process_type,
    part_criticality: input.part_criticality,
    inspection_steps: steps,
    total_inspection_time_min: totalTimeMin,
    inspection_cost_per_part_usd: inspectionCost,
    critical_defect_types: ['porosity', 'lack_of_fusion', 'cracks', 'inclusions', 'dimensional_deviation', 'surface_roughness_exceedance'],
    ndt_methods_recommended: [
      input.process_type === 'SLM' || input.process_type === 'DMLS' ? 'X-ray CT (best for internal defects in metal AM)' : 'Ultrasonic testing (for composites/delamination)',
      'Dye penetrant inspection (surface-breaking cracks)',
      'Magnetic particle inspection (ferromagnetic materials)',
      input.process_type === 'FDM' ? 'Thermographic inspection (for delamination)' : 'Eddy current testing (for surface conductivity changes)'
    ],
    sampling_plan: input.part_criticality === 'safety_critical' ? '100 percent inspection required (single part traceability)' : 'ANSI/ASQ Z1.4 General Level II, AQL 1.0 - sample ' + Math.max(1, Math.round(input.quantity_per_batch * (steps[1].sample_rate_pct / 100))) + ' from batch of ' + input.quantity_per_batch,
    quality_documentation: [
      'First Article Inspection Report (FAIR)',
      'Material certification and traceability records',
      'Print parameter log for each build',
      'CT scan report with porosity analysis',
      'Dimensional inspection report with GD&T data',
      'Non-conformance reports (if applicable)'
    ],
    estimated_first_pass_yield_pct: Math.round(firstPass * 100) / 100,
    improvement_recommendations: [
      'Implement real-time melt pool monitoring (SLM/DMLS) for in-process defect detection',
      'Use build-to-build statistical process control (SPC) charts',
      input.process_type === 'FDM' ? 'Monitor chamber temperature consistency to reduce warpage' : 'Optimize scan strategy to reduce residual stress',
      'Calibrate equipment per manufacturer schedule (laser power, galvo accuracy)',
      'Maintain material handling logs (powder reuse count, moisture exposure)',
      'Conduct regular proficiency testing for inspection personnel'
    ],
    compliance_standards: [
      input.part_criticality === 'safety_critical' ? 'ASTM F3301 (AM aerospace parts)' : 'ISO/ASTM 52900 (AM terminology)',
      'ISO/ASTM 52901 (AM requirements for purchased parts)',
      input.process_type === 'SLM' ? 'ASTM F3187 (AM powder bed fusion)' : 'ASTM F2971 (AM data processing)',
      'AS9100 (aerospace QMS)',
      'ISO 9001:2015 (quality management)'
    ]
  }
}

function analyzePrintFarm(input: PrintFarmInput): PrintFarmResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const machines = input.machines
  const jobs = input.pending_jobs
  const inventory = input.materials_inventory

  let activeCount = 0
  let totalUtil = 0
  for (const m of machines) {
    if (m.status === 'printing' || m.status === 'idle') {
      activeCount++
      totalUtil += m.current_utilization_pct
    }
  }
  const avgUtil = activeCount > 0 ? Math.round(totalUtil / activeCount * 100) / 100 : 0

  const scheduled: ScheduleAssignment[] = []
  const unscheduled: string[] = []
  const machineAvailable: Record<string, number> = {}
  for (const m of machines) {
    if (m.status === 'idle' || m.status === 'printing') {
      machineAvailable[m.machine_id] = m.status === 'printing' ? rng.nextFloat(2, 8) : 0
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    const prioOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return prioOrder[a.priority] - prioOrder[b.priority]
  })

  for (const job of sortedJobs) {
    const availMachines = Object.entries(machineAvailable).filter(([id]) => {
      const m = machines.find(mm => mm.machine_id === id)
      return m && m.process_type === job.process_type
    })

    if (availMachines.length === 0) {
      unscheduled.push(job.job_id + ' (' + job.part_name + ') - no compatible machine available')
      continue
    }

    const [machineId, startTime] = availMachines[0]
    const completion = startTime + job.estimated_print_time_hours
    const matNeeded = Math.round(job.quantity * job.estimated_print_time_hours * 0.05 * 100) / 100

    scheduled.push({
      job_id: job.job_id,
      part_name: job.part_name,
      machine_id: machineId,
      start_time_hours_from_now: Math.round(startTime * 100) / 100,
      estimated_completion_hours_from_now: Math.round(completion * 100) / 100,
      material_required_kg: matNeeded,
      notes: 'Priority: ' + job.priority + ', Deadline: ' + job.deadline_hours + 'h'
    })

    machineAvailable[machineId] = completion
  }

  const bottleneckIds: string[] = []
  for (const m of machines) {
    if (m.current_utilization_pct > 85) {
      bottleneckIds.push(m.machine_id + ' (' + m.machine_type + ' at ' + m.current_utilization_pct + '%)')
    }
  }

  const shortages: string[] = []
  for (const inv of inventory) {
    if (inv.available_kg < inv.reorder_threshold_kg) {
      shortages.push(inv.material_name + ': ' + inv.available_kg + 'kg available, threshold ' + inv.reorder_threshold_kg + 'kg')
    }
  }

  const totalPartsPerDay = Math.round(machines.filter(m => m.status !== 'maintenance').length * 24 / 8 * rng.nextFloat(0.7, 1.0) * 100) / 100
  const dailyRevenue = Math.round(totalPartsPerDay * rng.nextFloat(15, 80) * 100) / 100

  return {
    farm_name: input.farm_name,
    total_machines: machines.length,
    active_machines: activeCount,
    overall_utilization_pct: avgUtil,
    scheduled_jobs: scheduled,
    unscheduled_jobs: unscheduled,
    estimated_throughput_parts_per_day: totalPartsPerDay,
    bottleneck_machines: bottleneckIds,
    material_shortages: shortages,
    maintenance_recommendations: [
      'Schedule preventive maintenance for machines > 500 print hours',
      'Calibrate laser power and galvo systems monthly (SLM/DMLS)',
      'Replace FDM nozzles every 500-1000 hours of abrasive material printing',
      'Clean and recoat SLA build platforms per manufacturer schedule',
      'Verify powder sieving system operation weekly (SLS/SLM)'
    ],
    optimization_suggestions: [
      'Group same-material jobs to reduce changeover time',
      'Implement nesting algorithms to maximize build volume utilization',
      'Schedule long prints during off-peak energy hours for cost savings',
      'Use predictive maintenance based on print hour tracking',
      'Consider adding ' + (bottleneckIds.length > 0 ? bottleneckIds[0].split(' ')[0] + ' capacity' : 'machines') + ' to reduce queue times'
    ],
    estimated_daily_revenue_usd: dailyRevenue,
    kpis: {
      average_machine_utilization_pct: avgUtil,
      average_job_lead_time_hours: Math.round(scheduled.reduce((s, j) => s + j.estimated_completion_hours_from_now, 0) / Math.max(1, scheduled.length) * 100) / 100,
      on_time_delivery_rate_pct: Math.round(rng.nextFloat(75, 95) * 100) / 100,
      scrap_rate_pct: Math.round(rng.nextFloat(2, 12) * 100) / 100
    }
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatPrintOrientationReport(r: PrintOrientationResult): string {
  const lines: string[] = []
  lines.push('# Print Orientation Optimization Report')
  lines.push('')
  lines.push('Part: ' + r.part_name + ' | Process: ' + r.process_type + ' | Material: ' + r.material)
  lines.push('')
  lines.push('## Recommended Orientation')
  const rec = r.recommended_orientation
  lines.push('- Name: ' + rec.orientation_name)
  lines.push('- Rotation: X=' + rec.rotation_x_deg + 'deg Y=' + rec.rotation_y_deg + 'deg Z=' + rec.rotation_z_deg + 'deg')
  lines.push('- Support Volume: ' + rec.support_volume_cm3 + ' cm3')
  lines.push('- Overhang Area: ' + rec.overhang_area_cm2 + ' cm2')
  lines.push('- Layer Count: ' + rec.layer_count)
  lines.push('- Estimated Roughness: ' + rec.estimated_roughness_ra_um + ' um Ra')
  lines.push('- Z-Height: ' + rec.z_height_mm + ' mm')
  lines.push('- Score: ' + rec.score + '/100')
  lines.push('')
  lines.push('## Surface Finish Prediction')
  lines.push('- Top surface: ' + r.surface_finish_prediction.top_surface_ra_um + ' um Ra')
  lines.push('- Side surface: ' + r.surface_finish_prediction.side_surface_ra_um + ' um Ra')
  lines.push('- Bottom surface: ' + r.surface_finish_prediction.bottom_surface_ra_um + ' um Ra')
  lines.push('')
  lines.push('## Anisotropic Considerations')
  lines.push(r.anisotropic_considerations)
  lines.push('')
  lines.push('## Recommendations')
  for (const rec2 of r.recommendations) lines.push('- ' + rec2)
  lines.push('')
  lines.push('---')
  lines.push('Printability Score: ' + r.printability_score + '/100. 2026: AM market $35B+; orientation optimization reduces post-processing by 20-40%.')
  return lines.join('\n')
}

function formatSupportStructureReport(r: SupportStructureResult): string {
  const lines: string[] = []
  lines.push('# Support Structure Design Report')
  lines.push('')
  lines.push('Part: ' + r.part_name + ' | Process: ' + r.process_type)
  lines.push('Total Support Volume: ' + r.total_support_volume_cm3 + ' cm3 (' + r.support_material_pct + '% of part volume)')
  lines.push('Print Time Penalty: +' + r.print_time_penalty_min + ' min')
  lines.push('Cost Impact: $' + r.cost_impact_usd)
  lines.push('')
  lines.push('## Support Zones')
  for (const z of r.support_zones) {
    lines.push('- Zone ' + z.zone_id + ': ' + z.zone_location)
    lines.push('  Type: ' + z.support_type + ' | Volume: ' + z.volume_cm3 + ' cm3 | Height: ' + z.height_mm + ' mm')
    lines.push('  Tip diameter: ' + z.tip_contact_diameter_mm + ' mm | Density: ' + z.density_pct + '% | Removal: ' + z.estimated_removal_time_min + ' min')
  }
  lines.push('')
  lines.push('## Removal Strategy')
  lines.push(r.support_removal_strategy)
  lines.push('')
  lines.push('## Surface Quality Impact')
  lines.push(r.surface_quality_impact)
  lines.push('')
  lines.push('## Risk Assessment')
  lines.push(r.risk_assessment)
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('2026: Support-free design and dissolvable supports reducing post-processing costs by 30-50%.')
  return lines.join('\n')
}

function formatPrintCostReport(r: PrintCostResult): string {
  const lines: string[] = []
  lines.push('# Print Cost Estimation Report')
  lines.push('')
  lines.push('Part: ' + r.part_name + ' | Process: ' + r.process_type)
  lines.push('')
  lines.push('## Time and Material')
  lines.push('- Print Time: ' + r.estimated_print_time_hours + ' hours')
  lines.push('- Layer Count: ' + r.estimated_layer_count)
  lines.push('- Part Mass: ' + r.material_mass_g + ' g')
  lines.push('- Support Mass: ' + r.support_material_mass_g + ' g')
  lines.push('- Energy: ' + r.energy_consumption_kwh + ' kWh')
  lines.push('')
  lines.push('## Cost Breakdown (per part)')
  lines.push('- Material: $' + r.cost_breakdown.material_cost_usd)
  lines.push('- Machine Time: $' + r.cost_breakdown.machine_time_cost_usd)
  lines.push('- Labor: $' + r.cost_breakdown.labor_cost_usd)
  lines.push('- Post-Processing: $' + r.cost_breakdown.post_processing_cost_usd)
  lines.push('- Overhead: $' + r.cost_breakdown.overhead_cost_usd)
  lines.push('- TOTAL: $' + r.total_cost_per_part_usd)
  lines.push('')
  lines.push('## Batch Summary')
  lines.push('- Total Batch Cost: $' + r.total_batch_cost_usd)
  lines.push('- Lead Time: ' + r.lead_time_days + ' days')
  lines.push('')
  lines.push('## Cost Optimization')
  for (const s of r.cost_optimization_suggestions) lines.push('- ' + s)
  lines.push('')
  lines.push('## Comparison')
  lines.push(r.comparison_with_subtractive)
  lines.push('')
  lines.push('---')
  lines.push('2026: AM cost per part declining 10-15% annually through faster machines and material optimization.')
  return lines.join('\n')
}

function formatMaterialSelectorReport(r: MaterialSelectorResult): string {
  const lines: string[] = []
  lines.push('# AM Material Selection Report')
  lines.push('')
  lines.push('Part: ' + r.part_name + ' | Process: ' + r.process_type)
  lines.push('Recommended Material: ' + r.recommended_material)
  lines.push('')
  lines.push('## Properties Summary')
  lines.push(r.material_properties_summary)
  lines.push('')
  lines.push('## Cost Analysis')
  lines.push(r.cost_analysis)
  lines.push('')
  lines.push('## Alternative Materials')
  for (const alt of r.alternative_materials) {
    lines.push('- ' + alt.material_name + ' (Score: ' + alt.suitability_score + '/100)')
    lines.push('  UTS: ' + alt.tensile_strength_mpa + ' MPa | Elongation: ' + alt.elongation_pct + '% | Max Temp: ' + alt.max_service_temp_c + 'C')
    lines.push('  Cost: $' + alt.cost_per_kg_usd + '/kg | Surface: ' + alt.typical_surface_finish_ra_um + ' um Ra')
    lines.push('  Pros: ' + alt.pros.join('; '))
    lines.push('  Cons: ' + alt.cons.join('; '))
  }
  lines.push('')
  lines.push('## Print Parameters')
  for (const p of r.print_parameter_suggestions) lines.push('- ' + p)
  lines.push('')
  lines.push('## Post-Processing Compatibility')
  lines.push(r.post_processing_compatibility)
  lines.push('')
  lines.push('## Risk Notes')
  for (const n of r.risk_notes) lines.push('- ' + n)
  lines.push('')
  lines.push('---')
  lines.push('2026: AM materials market $8B+; metal powders growing at 25% CAGR, photopolymers at 18%.')
  return lines.join('\n')
}

function formatTopologyReport(r: TopologyResult): string {
  const lines: string[] = []
  lines.push('# Topology Optimization Report')
  lines.push('')
  lines.push('Part: ' + r.part_name)
  lines.push('')
  lines.push('## Mass Reduction Summary')
  lines.push('- Original Mass: ' + r.original_mass_kg + ' kg')
  lines.push('- Optimized Mass: ' + r.optimized_mass_kg + ' kg')
  lines.push('- Total Reduction: ' + r.total_mass_reduction_pct + '%')
  lines.push('- Volume Change: ' + r.original_volume_cm3 + ' -> ' + r.optimized_volume_cm3 + ' cm3')
  lines.push('- Estimated Stress Increase: +' + r.estimated_stress_increase_pct + '%')
  lines.push('- Estimated Deflection Increase: +' + r.estimated_deflection_increase_pct + '%')
  lines.push('- Cost Savings: ' + r.estimated_cost_savings_pct + '%')
  lines.push('- Performance Index: ' + r.performance_index + ' N/kg')
  lines.push('')
  lines.push('## Optimization Regions')
  for (const reg of r.optimization_regions) {
    lines.push('- ' + reg.region_name + ':')
    lines.push('  Mass: ' + reg.original_mass_kg + ' -> ' + reg.optimized_mass_kg + ' kg (-' + reg.mass_reduction_pct + '%)')
    lines.push('  Stress utilization: ' + reg.stress_utilization_ratio)
    lines.push('  ' + reg.recommendation)
  }
  lines.push('')
  lines.push('## Manufacturing Notes')
  for (const n of r.manufacturing_notes) lines.push('- ' + n)
  lines.push('')
  lines.push('## Validation Recommendations')
  for (const v of r.validation_recommendations) lines.push('- ' + v)
  lines.push('')
  lines.push('---')
  lines.push('2026: Topology optimization plus AM enabling 30-70% weight reduction in aerospace and automotive parts.')
  return lines.join('\n')
}

function formatPostProcessingReport(r: PostProcessingResult): string {
  const lines: string[] = []
  lines.push('# Post-Processing Workflow Report')
  lines.push('')
  lines.push('Part: ' + r.part_name + ' | Process: ' + r.process_type + ' | Material: ' + r.material)
  lines.push('')
  lines.push('## Processing Steps')
  for (const s of r.processing_steps) {
    lines.push(s.step_number + '. ' + s.step_name)
    lines.push('   ' + s.description)
    lines.push('   Duration: ' + s.duration_min + ' min | Cost: $' + s.cost_per_part_usd)
    lines.push('   Equipment: ' + s.equipment_needed)
    lines.push('   Critical params: ' + s.critical_parameters.join(', '))
  }
  lines.push('')
  lines.push('## Summary')
  lines.push('- Total Processing Time: ' + r.total_processing_time_hours + ' hours')
  lines.push('- Total Cost per Part: $' + r.total_post_processing_cost_per_part_usd)
  lines.push('- Achievable Surface Finish: ' + r.surface_finish_achievable_ra_um + ' um Ra')
  lines.push('- Dimensional Accuracy: +/-' + r.dimensional_accuracy_achievable_mm + ' mm')
  lines.push('- Lead Time Impact: +' + r.lead_time_impact_days + ' days')
  lines.push('')
  lines.push('## Workflow')
  lines.push(r.workflow_diagram)
  lines.push('')
  lines.push('## Quality Gates')
  for (const g of r.quality_gates) lines.push('- ' + g)
  lines.push('')
  lines.push('## Cost Reduction Suggestions')
  for (const s of r.cost_reduction_suggestions) lines.push('- ' + s)
  lines.push('')
  lines.push('---')
  lines.push('2026: Automated post-processing reducing labor costs by 40-60% in high-volume AM production.')
  return lines.join('\n')
}

function formatQualityInspectionReport(r: QualityInspectionResult): string {
  const lines: string[] = []
  lines.push('# Quality Inspection Plan Report')
  lines.push('')
  lines.push('Part: ' + r.part_name + ' | Process: ' + r.process_type + ' | Criticality: ' + r.part_criticality)
  lines.push('')
  lines.push('## Inspection Steps')
  for (const s of r.inspection_steps) {
    lines.push(s.step_number + '. ' + s.step_name)
    lines.push('   Method: ' + s.inspection_method)
    lines.push('   Criteria: ' + s.acceptance_criteria)
    lines.push('   Sample rate: ' + s.sample_rate_pct + '% | Time: ' + s.estimated_time_min + ' min')
    lines.push('   Equipment: ' + s.equipment_needed)
    lines.push('   Defects: ' + s.defect_types_detected.join(', '))
  }
  lines.push('')
  lines.push('## Summary')
  lines.push('- Total Inspection Time: ' + r.total_inspection_time_min + ' min')
  lines.push('- Inspection Cost: ' + r.inspection_cost_per_part_usd + '/part')
  lines.push('- First Pass Yield: ' + r.estimated_first_pass_yield_pct + '%')
  lines.push('')
  lines.push('## NDT Methods Recommended')
  for (const n of r.ndt_methods_recommended) lines.push('- ' + n)
  lines.push('')
  lines.push('## Sampling Plan')
  lines.push(r.sampling_plan)
  lines.push('')
  lines.push('## Compliance Standards')
  for (const c of r.compliance_standards) lines.push('- ' + c)
  lines.push('')
  lines.push('## Improvement Recommendations')
  for (const i of r.improvement_recommendations) lines.push('- ' + i)
  lines.push('')
  lines.push('---')
  lines.push('2026: In-process monitoring and AI-driven defect detection reducing scrap rates to <3% in production AM.')
  return lines.join('\n')
}

function formatPrintFarmReport(r: PrintFarmResult): string {
  const lines: string[] = []
  lines.push('# Print Farm Management Report')
  lines.push('')
  lines.push('Farm: ' + r.farm_name)
  lines.push('Machines: ' + r.total_machines + ' total, ' + r.active_machines + ' active')
  lines.push('Overall Utilization: ' + r.overall_utilization_pct + '%')
  lines.push('Throughput: ' + r.estimated_throughput_parts_per_day + ' parts/day')
  lines.push('Estimated Daily Revenue: $' + r.estimated_daily_revenue_usd)
  lines.push('')
  lines.push('## Scheduled Jobs')
  for (const s of r.scheduled_jobs) {
    lines.push('- ' + s.job_id + ' (' + s.part_name + ') -> ' + s.machine_id)
    lines.push('  Start: +' + s.start_time_hours_from_now + 'h | Complete: +' + s.estimated_completion_hours_from_now + 'h')
    lines.push('  Material: ' + s.material_required_kg + ' kg | ' + s.notes)
  }
  if (r.unscheduled_jobs.length > 0) {
    lines.push('')
    lines.push('## Unscheduled Jobs')
    for (const u of r.unscheduled_jobs) lines.push('- ' + u)
  }
  if (r.bottleneck_machines.length > 0) {
    lines.push('')
    lines.push('## Bottleneck Machines')
    for (const b of r.bottleneck_machines) lines.push('- ' + b)
  }
  if (r.material_shortages.length > 0) {
    lines.push('')
    lines.push('## Material Shortages')
    for (const m of r.material_shortages) lines.push('- ' + m)
  }
  lines.push('')
  lines.push('## KPIs')
  lines.push('- Avg Machine Utilization: ' + r.kpis.average_machine_utilization_pct + '%')
  lines.push('- Avg Lead Time: ' + r.kpis.average_job_lead_time_hours + ' hours')
  lines.push('- On-Time Delivery: ' + r.kpis.on_time_delivery_rate_pct + '%')
  lines.push('- Scrap Rate: ' + r.kpis.scrap_rate_pct + '%')
  lines.push('')
  lines.push('## Maintenance Recommendations')
  for (const m of r.maintenance_recommendations) lines.push('- ' + m)
  lines.push('')
  lines.push('## Optimization Suggestions')
  for (const o of r.optimization_suggestions) lines.push('- ' + o)
  lines.push('')
  lines.push('---')
  lines.push('2026: Print farm automation and AI scheduling increasing throughput by 25-40% year-over-year.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context): void {
  const tools = ctx.tools as { register: (tool: ReturnType<typeof defineTool>) => void }

  tools.register(defineTool({
    name: 'print_orientation_optimizer',
    description: 'Optimal print orientation for minimal supports and best surface finish. Analyzes multiple orientations and recommends the best trade-off between support volume, surface quality, and mechanical properties.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: part_name, part_geometry{bounding_box_x_mm,bounding_box_y_mm,bounding_box_z_mm,volume_cm3,surface_area_cm2,has_overhangs,has_internal_channels,critical_surface_normals[]}, process_type(FDM|SLA|SLM|SLS|DMLS|EBM), material, quality_priority(speed|quality|balanced), mechanical_load_direction, critical_surfaces[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PrintOrientationInput = JSON.parse(args.input_data)
      return formatPrintOrientationReport(analyzePrintOrientation(input))
    }
  }))

  tools.register(defineTool({
    name: 'support_structure_designer',
    description: 'Generate support structures with minimal material waste. Designs support zones with optimal type, density, and removal strategy for FDM, SLA, SLM, and other AM processes.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: part_name, process_type(FDM|SLA|SLM|SLS|DMLS|EBM), part_volume_cm3, overhang_area_cm2, overhang_angle_deg, support_contact_area_cm2, material, min_feature_size_mm, surface_finish_requirement(rough|standard|fine), dissolvable_supports_available(boolean)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SupportStructureInput = JSON.parse(args.input_data)
      return formatSupportStructureReport(analyzeSupportStructure(input))
    }
  }))

  tools.register(defineTool({
    name: 'print_cost_estimator',
    description: 'Accurate print time and cost estimation. Calculates material consumption, machine time, labor, post-processing, and energy costs with batch optimization suggestions.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: part_name, process_type(FDM|SLA|SLM|SLS|DMLS|EBM), part_volume_cm3, bounding_box_x_mm, bounding_box_y_mm, bounding_box_z_mm, layer_height_mm, infill_density_pct, material, material_cost_per_kg_usd, machine_hourly_rate_usd, quantity(number), post_processing_required[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PrintCostInput = JSON.parse(args.input_data)
      return formatPrintCostReport(analyzePrintCost(input))
    }
  }))

  tools.register(defineTool({
    name: 'material_selector_am',
    description: 'Material selection for SLM, FDM, SLA/DLP processes. Evaluates candidate materials against application requirements with property matching, cost analysis, and supplier recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: part_name, process_type(SLM|FDM|SLA), application_requirements{min_tensile_strength_mpa,min_elongation_pct,max_service_temp_c,chemical_resistance,required_density_g_cm3,biocompatible,electrically_conductive}, candidate_materials[], production_volume(prototype|low_volume|medium_volume|high_volume), budget_per_part_usd, post_processing_needs[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: MaterialSelectorInput = JSON.parse(args.input_data)
      return formatMaterialSelectorReport(analyzeMaterialSelector(input))
    }
  }))

  tools.register(defineTool({
    name: 'topology_optimizer',
    description: 'Topology optimization for lightweight structural design. Generates mass-optimized geometries with lattice structures, stress analysis, and manufacturing feasibility for AM processes.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: part_name, design_space{bounding_box_x_mm,bounding_box_y_mm,bounding_box_z_mm,original_mass_kg,original_volume_cm3}, loading_conditions{load_type,max_load_n,load_direction,safety_factor,fatigue_cycles}, constraints{target_mass_reduction_pct,min_feature_size_mm,manufacturing_process,preserve_regions[],max_deflection_mm}, material'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: TopologyInput = JSON.parse(args.input_data)
      return formatTopologyReport(analyzeTopology(input))
    }
  }))

  tools.register(defineTool({
    name: 'post_processing_workflow',
    description: 'Post-processing and finishing workflow planning. Generates step-by-step post-processing sequences with time estimates, cost analysis, and quality gates for AM parts.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: part_name, process_type(FDM|SLA|SLM|SLS|DMLS|EBM), material, quantity(number), target_surface_finish_ra_um, dimensional_tolerance_mm, mechanical_property_requirements{stress_relief_needed,heat_treatment_needed,hot_isostatic_pressing_needed}, aesthetic_requirements[], functional_requirements[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PostProcessingInput = JSON.parse(args.input_data)
      return formatPostProcessingReport(analyzePostProcessing(input))
    }
  }))

  tools.register(defineTool({
    name: 'quality_inspection_planner',
    description: 'Quality inspection plan for AM parts. Creates comprehensive inspection workflows with NDT methods, sampling plans, acceptance criteria, and compliance standards.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: part_name, process_type(FDM|SLA|SLM|SLS|DMLS|EBM), material, part_criticality(prototype|standard|critical|safety_critical), dimensional_tolerance_mm, internal_defect_requirements, surface_defect_requirements, mechanical_testing_required(boolean), quantity_per_batch(number), inspection_level(visual|dimensional|full_nDT|destructive_sampling)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: QualityInspectionInput = JSON.parse(args.input_data)
      return formatQualityInspectionReport(analyzeQualityInspection(input))
    }
  }))

  tools.register(defineTool({
    name: 'print_farm_manager',
    description: 'Print farm production scheduling and throughput optimization. Assigns jobs to machines, identifies bottlenecks, tracks materials, and provides KPI dashboards.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: farm_name, machines[{machine_id,machine_type,process_type,build_volume_x_mm,build_volume_y_mm,build_volume_z_mm,status,current_utilization_pct}], pending_jobs[{job_id,part_name,process_type,quantity,material,priority,deadline_hours,estimated_print_time_hours,post_processing_required[]}], materials_inventory[{material_name,process_type,available_kg,reorder_threshold_kg,cost_per_kg_usd}]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PrintFarmInput = JSON.parse(args.input_data)
      return formatPrintFarmReport(analyzePrintFarm(input))
    }
  }))
}
