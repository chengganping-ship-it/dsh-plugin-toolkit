/**
 * DSH Quantum Computing Applications Plugin v1.0.0
 * Quantum Computing Applications toolkit for DeepSeek Harness.
 *
 * 8 Tools:
 *   1. quantum_circuit_designer        --- Quantum circuit construction and gate synthesis
 *   2. vqe_configurator                --- Variational Quantum Eigensolver configuration
 *   3. error_correction_mapper         --- Quantum error correction code mapping
 *   4. quantum_optimizer               --- Quantum optimization problem encoding
 *   5. qml_model_setup                 --- Quantum machine learning model architecture
 *   6. quantum_safe_migration_planner  --- Post-quantum cryptographic migration planning
 *   7. quantum_hardware_selector       --- Quantum hardware platform selection guide
 *   8. nisq_algorithm_advisor          --- NISQ-era algorithm recommendation
 *
 * Conventions:
 *   - Seeded PRNG via mulberry32 (seed = hash of JSON.stringify(input)).
 *   - Only single quotes in TypeScript source (no plain backticks).
 *   - Each tool registers via ctx.tools.register(defineTool({ ... })).
 *   - outputSchema with concrete fields documented.
 *
 * @module dsh-tool-quantumapp | @version 1.0.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-quantumapp'
export const inject = ['tools']

const VERSION = '1.0.0'

// ======================== mulberry32 PRNG ========================

function mulberry32(seedNum: number): () => number {
  let s = seedNum | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToInt(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) || 1
}

function seededRng(input: unknown): () => number {
  const json = JSON.stringify(input)
  return mulberry32(hashStringToInt(json))
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ====================== Type Declarations ======================

// Tool 1 --- quantum_circuit_designer
export interface CircuitDesignInput {
  algorithm: 'grover' | 'shor' | 'qft' | 'qaoa' | 'vqe' | 'bernstein' | 'quantum_walk'
  qubit_count: number
  optimization_level: 0 | 1 | 2 | 3
  target_backend: 'superconducting' | 'trapped_ion' | 'photonic' | 'neutral_atom' | 'topological'
  max_depth?: number
  entanglement_pattern?: 'linear' | 'circular' | 'full' | 'star' | 'custom'
}

export interface CircuitLayer {
  index: number
  gate_type: string
  target_qubits: number[]
  parameters?: string
  depth_contribution: number
}

export interface CircuitDesignResult {
  circuit_id: string
  algorithm: string
  qubit_count: number
  gate_count_total: number
  circuit_depth: number
  single_qubit_gates: number
  two_qubit_gates: number
  t_gate_count: number
  estimated_fidelity: number
  backend_compatibility: string[]
  layers: CircuitLayer[]
  synthesis_notes: string[]
}

// Tool 2 --- vqe_configurator
export interface VqeConfigInput {
  molecule: 'H2' | 'LiH' | 'H2O' | 'NH3' | 'CH4' | 'C2H4' | 'FeMoCo' | 'custom'
  basis_set: 'sto-3g' | '6-31g' | 'cc-pvdz' | 'aug-cc-pvqz'
  ansatz_type: 'UCCSD' | 'UCCD' | 'HardwareEfficient' | 'QAOA-inspired' | 'ADAPT-VQE'
  optimizer: 'COBYLA' | 'L-BFGS-B' | 'SPSA' | 'Adam' | 'Nelder-Mead'
  max_iterations: number
  convergence_threshold: number
  noise_model?: 'ideal' | 'depolarizing' | 'amplitude_damping' | 'real_device'
}

export interface VqeConfigResult {
  config_id: string
  molecule: string
  basis_set: string
  active_orbitals: number
  active_electrons: number
  qubit_requirement: number
  ansatz_type: string
  variational_parameters: number
  circuit_depth_per_iteration: number
  optimizer: string
  max_iterations: number
  convergence_threshold: number
  error_mitigation_recommended: string[]
  energy_unit: string
  expected_accuracy: number
  convergence_behavior: string
  resource_estimate_hours: number
}

// Tool 3 --- error_correction_mapper
export interface ErrorCorrectionInput {
  code_family: 'surface' | 'color' | 'toric' | 'steane' | 'shor' | 'bosonic_GKP' | 'ldpc'
  code_distance: number
  physical_error_rate: number
  logical_qubit_target: number
  syndrome_method: 'shor' | 'steane' | 'flag' | 'single_shot'
}

export interface ErrorCorrectionResult {
  mapping_id: string
  code_family: string
  code_distance: number
  logical_error_rate: number
  threshold_surpassed: boolean
  physical_qubits_per_logical: number
  total_physical_qubits: number
  syndrome_extraction_rounds: number
  decoder_type: string
  decoder_latency_ns: number
  logical_fidelity_estimate: number
  overhead_ratio: number
  error_budget_breakdown: Record<string, number>
  recommendations: string[]
}

// Tool 4 --- quantum_optimizer
export interface QuantumOptimizerInput {
  problem_type: 'maxcut' | 'tsp' | 'portfolio' | 'scheduling' | 'sat' | 'knapsack' | 'vehicle_routing'
  variable_count: number
  constraint_count: number
  hamiltonian_type: 'Ising' | 'QUBO' | 'PUBO'
  algorithm: 'QAOA' | 'quantum_annealing' | 'VQE_opt' | 'Grover_adaptive'
  penalty_weight?: number
  mixer_type?: 'standard' | 'XY' | 'controlled_phase'
}

export interface OptimizerEncoding {
  variable_name: string
  qubit_index: number
  hamiltonian_coeff: number
  constraint_applied: boolean
}

export interface QuantumOptimizerResult {
  encoding_id: string
  problem_type: string
  hamiltonian_type: string
  qubits_required: number
  terms_in_hamiltonian: number
  p_qaoa_layers: number
  classical_variables: number
  penalty_weight_applied: number
  ground_state_energy_estimate: number
  approximation_ratio_expected: number
  encoding_map: OptimizerEncoding[]
  mixer_type: string
  optimization_rounds_estimate: number
  feasibility_notes: string[]
}

// Tool 5 --- qml_model_setup
export interface QmlModelInput {
  task_type: 'classification' | 'regression' | 'generative' | 'reinforcement' | 'clustering'
  feature_dimension: number
  num_classes?: number
  quantum_ansatz: 'amplitude_embedding' | 'angle_embedding' | 'IQP' | 'tensor_network' | '_data_reuploading'
  measurement_basis: 'Z' | 'X' | 'Y' | 'bell' | 'full_tomography'
  classical_postprocessing: 'none' | 'dense_128' | 'dense_256' | 'resnet_adapter' | 'lstm_adapter'
  training_shots: number
  noise_aware_training: boolean
}

export interface QuantumLayerSpec {
  layer_index: number
  layer_type: 'encoding' | 'variational' | 'entanglement' | 'measurement'
  qubits_used: number
  parameter_count: number
  unitary_description: string
}

export interface QmlModelResult {
  model_id: string
  task_type: string
  quantum_ansatz: string
  total_variational_params: number
  circuit_depth: number
  qubit_requirement: number
  measurement_basis: string
  expectation_value_method: string
  layers: QuantumLayerSpec[]
  classical_postprocessing: string
  barren_plateau_risk: 'low' | 'medium' | 'high'
  generalization_capacity: string
  training_complexity: string
  measurement_shots: number
  noise_aware_training: boolean
  observables: string[]
}

// Tool 6 --- quantum_safe_migration_planner
export interface QuantumSafeMigrationInput {
  current_crypto: ('RSA-2048' | 'RSA-4096' | 'ECC-P256' | 'ECC-P384' | 'AES-128' | 'AES-256' | 'SHA-256' | 'SHA-3')[]
  infrastructure_type: 'web_pkca' | 'vpn' | 'iot' | 'blockchain' | 'cloud_hsm' | 'code_signing' | 'mixed'
  compliance_requirements: ('FIPS-140-3' | 'NIST-PQC' | 'Common-Criteria' | 'GDPR' | 'PCI-DSS' | 'SOX')[]
  migration_deadline_years: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  budget_priority: 'cost_driven' | 'security_driven' | 'balanced'
}

export interface CryptoMigrationItem {
  current_scheme: string
  replacement_scheme: string
  migration_phase: 1 | 2 | 3 | 4
  urgency: 'critical' | 'high' | 'medium' | 'low'
  effort_estimate_person_months: number
  quantum_threat_level: 'imminent' | 'near_term' | 'long_term'
}

export interface QuantumSafeMigrationResult {
  plan_id: string
  overall_risk_score: number
  vulnerability_count: number
  migration_items: CryptoMigrationItem[]
  hybrid_transition_strategy: string
  compliance_gaps: string[]
  milestone_timeline: string[]
  total_effort_person_months: number
  recommended_priority_order: string[]
  crypto_agility_framework: string
}

// Tool 7 --- quantum_hardware_selector
export interface HardwareSelectionInput {
  use_case: 'chemistry' | 'optimization' | 'ml' | 'simulation' | 'cryptography' | 'sensing'
  required_logical_qubits: number
  required_circuit_depth: number
  min_gate_fidelity: number
  max_coherence_time_us?: number
  connectivity_requirement: 'nearest_neighbor' | 'all_to_all' | 'high_degree'
  operational_constraints: ('cryogenic' | 'room_temp' | 'optical_table' | 'portable' | 'fiber_coupled')[]
  budget_millions_usd: number
}

export interface HardwareCandidate {
  platform: string
  qubit_count: number
  two_qubit_gate_fidelity: number
  t1_coherence_us: number
  gate_speed_ns: number
  connectivity: string
  maturity: 'production' | 'pilot' | 'research'
  score: number
}

export interface QuantumHardwareResult {
  selection_id: string
  use_case: string
  candidates: HardwareCandidate[]
  top_candidate: string
  score_breakdown: Record<string, number>
  qubit_overhead_factor: number
  effective_logical_qubits: number
  estimated_system_cost_millions: number
  infrastructure_requirements: string[]
  roadmap_alignment: string
  risk_factors: string[]
}

// Tool 8 --- nisq_algorithm_advisor
export interface NisqAdvisorInput {
  problem_category: 'quantum_chemistry' | 'combinatorial_opt' | 'linear_algebra' | 'sampling' | 'differential_eq' | 'machine_learning'
  qubit_budget: number
  depth_budget: number
  error_mitigation_budget: 'none' | 'low' | 'medium' | 'high'
  classical_compute_available: 'limited' | 'moderate' | 'abundant'
  accuracy_target: number
}

export interface NisqAlgorithmCandidate {
  algorithm_name: string
  qubit_requirement: number
  depth_requirement: number
  classical_components: string[]
  error_mitigation_needed: string[]
  suitability_score: number
  expected_speedup: string
  noise_sensitivity: 'low' | 'medium' | 'high'
}

export interface NisqAdvisorResult {
  advisory_id: string
  problem_category: string
  candidates: NisqAlgorithmCandidate[]
  recommended_algorithm: string
  feasibility_assessment: string
  error_mitigation_strategy: string
  hybrid_decomposition: string
  resource_tradeoffs: string[]
  accuracy_achievable: number
  circuit_generation_platforms: string[]
  key_references: string[]
}

// ====================== Analysis Functions ======================

// Tool 1: Quantum Circuit Designer
function analyzeCircuitDesign(input: CircuitDesignInput): CircuitDesignResult {
  const rng = seededRng(input)

  const gateEstimates: Record<string, { sq: number; tq: number; t: number; baseDepth: number }> = {
    grover: { sq: input.qubit_count * 6, tq: input.qubit_count * 4, t: input.qubit_count * 2, baseDepth: Math.ceil(Math.sqrt(Math.pow(2, input.qubit_count))) * 3 },
    shor: { sq: input.qubit_count * 10, tq: input.qubit_count * 8, t: input.qubit_count * 6, baseDepth: Math.pow(input.qubit_count, 2) * 4 },
    qft: { sq: (input.qubit_count * (input.qubit_count + 1)) / 2, tq: input.qubit_count * (input.qubit_count - 1), t: input.qubit_count * 2, baseDepth: input.qubit_count * input.qubit_count },
    qaoa: { sq: input.qubit_count * 4, tq: input.qubit_count * 6, t: input.qubit_count, baseDepth: input.qubit_count * 3 * 2 },
    vqe: { sq: input.qubit_count * 8, tq: input.qubit_count * 10, t: input.qubit_count * 2, baseDepth: input.qubit_count * 5 },
    bernstein: { sq: input.qubit_count * 12, tq: input.qubit_count * 8, t: input.qubit_count * 4, baseDepth: input.qubit_count * input.qubit_count * 2 },
    quantum_walk: { sq: input.qubit_count * 5, tq: input.qubit_count * 7, t: input.qubit_count * 3, baseDepth: Math.ceil(Math.sqrt(input.qubit_count * 100)) * 4 },
  }

  const est = gateEstimates[input.algorithm] || gateEstimates.qaoa
  const optFactor = 1 - (input.optimization_level * 0.15)
  const singleQubitGates = Math.round(est.sq * optFactor * randFloat(rng, 0.9, 1.1))
  const twoQubitGates = Math.round(est.tq * optFactor * randFloat(rng, 0.9, 1.1))
  const tGates = Math.round(est.t * optFactor * randFloat(rng, 0.8, 1.2))
  const totalGates = singleQubitGates + twoQubitGates
  const depth = Math.round(est.baseDepth * optFactor * randFloat(rng, 0.85, 1.1))

  const baseFidelitySuperconducting = Math.pow(0.999, singleQubitGates) * Math.pow(0.995, twoQubitGates)
  const baseFidelityIonTrap = Math.pow(0.9995, singleQubitGates) * Math.pow(0.997, twoQubitGates)
  const baseFidelityPhotonic = Math.pow(0.998, singleQubitGates) * Math.pow(0.992, twoQubitGates)
  const baseFidelityNeutralAtom = Math.pow(0.9992, singleQubitGates) * Math.pow(0.996, twoQubitGates)
  const baseFidelityTopological = Math.pow(0.9999, singleQubitGates) * Math.pow(0.998, twoQubitGates)

  const backendFidelities: Record<string, number> = {
    superconducting: baseFidelitySuperconducting,
    trapped_ion: baseFidelityIonTrap,
    photonic: baseFidelityPhotonic,
    neutral_atom: baseFidelityNeutralAtom,
    topological: baseFidelityTopological,
  }
  const targetFidelity = backendFidelities[input.target_backend] || baseFidelitySuperconducting

  const layers: CircuitLayer[] = []
  const layerCount = Math.min(Math.ceil(depth / 3), 12)
  for (let i = 0; i < layerCount; i++) {
    layers.push({
      index: i,
      gate_type: pickOne(rng, ['H', 'RX', 'RY', 'RZ', 'CNOT', 'CZ', 'T', 'S', 'SWAP']),
      target_qubits: [randInt(rng, 0, input.qubit_count - 1), randInt(rng, 0, input.qubit_count - 1)].filter((v, idx, arr) => arr.indexOf(v) === idx),
      parameters: randFloat(rng, 0, Math.PI).toFixed(4),
      depth_contribution: randInt(rng, 2, 5),
    })
  }

  const synthesisNotes: string[] = []
  synthesisNotes.push('Algorithm "' + input.algorithm + '" mapped to ' + totalGates + ' gates on ' + input.qubit_count + ' qubits')
  synthesisNotes.push('Target backend ' + input.target_backend + ' with estimated fidelity ' + (targetFidelity * 100).toFixed(3) + '%')
  if (tGates > 50) {
    synthesisNotes.push('High T-count (' + tGates + '): consider phase-aware optimization or gate decomposition caching')
  }
  if (depth > 100) {
    synthesisNotes.push('Deep circuit (' + depth + '): circuit knitting or divide-and-conquer strategies recommended')
  }
  if (input.entanglement_pattern === 'full' && input.qubit_count > 12) {
    synthesisNotes.push('Full entanglement on ' + input.qubit_count + ' qubits: consider hardware-efficient patterns to reduce CNOT count')
  }
  synthesisNotes.push('Backend nativation: ' + input.target_backend === 'trapped_ion' ? 'all-to-all connectivity, no SWAP overhead' : 'mapping to native topology required, SWAP insertion anticipated')

  return {
    circuit_id: 'QC-' + randInt(rng, 10000, 99999),
    algorithm: input.algorithm,
    qubit_count: input.qubit_count,
    gate_count_total: totalGates,
    circuit_depth: depth,
    single_qubit_gates: singleQubitGates,
    two_qubit_gates: twoQubitGates,
    t_gate_count: tGates,
    estimated_fidelity: Math.round(targetFidelity * 100000) / 100000,
    backend_compatibility: Object.entries(backendFidelities).filter(([, v]) => v > 0.7).map(([k]) => k),
    layers,
    synthesis_notes: synthesisNotes,
  }
}

// Tool 2: VQE Configurator
function analyzeVqeConfig(input: VqeConfigInput): VqeConfigResult {
  const rng = seededRng(input)

  const molData: Record<string, { orbitals: number; electrons: number }> = {
    H2: { orbitals: 2, electrons: 2 },
    LiH: { orbitals: 6, electrons: 4 },
    H2O: { orbitals: 10, electrons: 10 },
    NH3: { orbitals: 10, electrons: 10 },
    CH4: { orbitals: 10, electrons: 10 },
    C2H4: { orbitals: 14, electrons: 16 },
    FeMoCo: { orbitals: 54, electrons: 72 },
    custom: { orbitals: randInt(rng, 4, 30), electrons: randInt(rng, 4, 40) },
  }
  const mol = molData[input.molecule] || molData.H2

  const ansatzDepth: Record<string, number> = {
    UCCSD: mol.orbitals * 4,
    UCCD: mol.orbitals * 3,
    HardwareEfficient: mol.orbitals * 2,
    'QAOA-inspired': mol.orbitals * 3,
    'ADAPT-VQE': mol.orbitals * 5,
  }
  const ansatzParams: Record<string, number> = {
    UCCSD: mol.orbitals * mol.electrons,
    UCCD: mol.orbitals * 2,
    HardwareEfficient: mol.orbitals * 4,
    'QAOA-inspired': mol.orbitals * 2,
    'ADAPT-VQE': mol.orbitals * 6,
  }

  const activeOrbitals = Math.min(mol.orbitals, 16)
  const activeElectrons = mol.electrons
  const qubitsRequired = activeOrbitals * 2
  const depthPerIter = (ansatzDepth[input.ansatz_type] || mol.orbitals * 4) + 2
  const varParams = (ansatzParams[input.ansatz_type] || mol.orbitals * 4) + randInt(rng, 5, 25)

  const accuracyLookup: Record<string, number> = {
    'sto-3g': 0.85,
    '6-31g': 0.90,
    'cc-pvdz': 0.94,
    'aug-cc-pvqz': 0.97,
  }
  const basisAccuracy = accuracyLookup[input.basis_set] || 0.90
  const noisePenalty = input.noise_model === 'real_device' ? 0.10 : input.noise_model === 'depolarizing' ? 0.07 : input.noise_model === 'amplitude_damping' ? 0.05 : 0.0
  const expectedAcc = Math.max(0.65, basisAccuracy - noisePenalty + randFloat(rng, -0.02, 0.02))

  const mitigations: string[] = []
  if (input.noise_model !== 'ideal') {
    mitigations.push('Zero-Noise Extrapolation (ZNE)')
    mitigations.push('Readout Error Mitigation')
    if (input.noise_model === 'real_device') {
      mitigations.push('Dynamical Decoupling')
      mitigations.push('Probabilistic Error Cancellation (PEC)')
    }
  }

  return {
    config_id: 'VQE-' + randInt(rng, 10000, 99999),
    molecule: input.molecule,
    basis_set: input.basis_set,
    active_orbitals: activeOrbitals,
    active_electrons: activeElectrons,
    qubit_requirement: qubitsRequired,
    ansatz_type: input.ansatz_type,
    variational_parameters: varParams,
    circuit_depth_per_iteration: depthPerIter,
    optimizer: input.optimizer,
    max_iterations: input.max_iterations,
    convergence_threshold: input.convergence_threshold,
    error_mitigation_recommended: mitigations,
    energy_unit: 'Hartree',
    expected_accuracy: Math.round(expectedAcc * 1000) / 1000,
    convergence_behavior: input.optimizer === 'COBYLA' ? 'robust but slow, ~' + (input.max_iterations * 0.8).toFixed(0) + ' iters' : input.optimizer === 'SPSA' ? 'noise-tolerant, quadratic convergence' : 'fast convergence, noise sensitive',
    resource_estimate_hours: Math.round((input.max_iterations * depthPerIter * 0.0001 * randFloat(rng, 0.8, 1.5)) * 100) / 100,
  }
}

// Tool 3: Error Correction Mapper
function analyzeErrorCorrection(input: ErrorCorrectionInput): ErrorCorrectionResult {
  const rng = seededRng(input)

  const thresholdTable: Record<string, number> = {
    surface: 0.01,
    color: 0.011,
    toric: 0.01,
    steane: 0.008,
    shor: 0.006,
    bosonic_GKP: 0.02,
    ldpc: 0.005,
  }
  const threshold = thresholdTable[input.code_family] || 0.01
  const d = input.code_distance
  const pPhys = input.physical_error_rate
  const pLogical = pPhys * Math.pow(pPhys / threshold, (d + 1) / 2)

  const qubitOverhead: Record<string, number> = {
    surface: 2 * d * d,
    color: 3 * d * d,
    toric: 2 * d * d,
    steane: 7,
    shor: 9,
    bosonic_GKP: 1,
    ldpc: d * d * 0.5,
  }
  const physicalPerLogical = Math.round(qubitOverhead[input.code_family] || 2 * d * d)
  const totalPhysical = physicalPerLogical * input.logical_qubit_target

  const decoderTable: Record<string, { type: string; latency: number }> = {
    surface: { type: 'Minimum Weight Perfect Matching (MWPM)', latency: randInt(rng, 500, 2000) },
    color: { type: 'Color-code decoder + Union-Find', latency: randInt(rng, 300, 1500) },
    toric: { type: 'Renormalization Group decoder', latency: randInt(rng, 1000, 5000) },
    steane: { type: 'Steane decoder circuit', latency: randInt(rng, 100, 500) },
    shor: { type: 'Shor-type parity check', latency: randInt(rng, 200, 800) },
    bosonic_GKP: { type: 'Maximum-likelihood GKP decoder', latency: randInt(rng, 50, 200) },
    ldpc: { type: 'Belief propagation OSD', latency: randInt(rng, 1000, 10000) },
  }
  const decoderInfo = decoderTable[input.code_family] || { type: 'generic decoder', latency: randInt(rng, 500, 3000) }

  const syndromeRounds = d * (input.syndrome_method === 'shor' ? 2 : 1)
  const logicalFidelity = Math.exp(-pLogical * 100)
  const overheadRatio = physicalPerLogical

  const budget: Record<string, number> = {
    single_qubit_gate: pPhys * 0.3,
    two_qubit_gate: pPhys * 0.4,
    measurement: pPhys * 0.15,
    idling: pPhys * 0.1,
    state_preparation: pPhys * 0.05,
  }

  const recommendations: string[] = []
  if (pPhys > threshold) {
    recommendations.push('Physical error rate ' + pPhys.toExponential(2) + ' exceeds threshold ' + threshold + ': improve physical qubits or lower temperature')
  }
  if (d < 5) {
    recommendations.push('Code distance ' + d + ' is minimal: consider d >= 5 for fault tolerance')
  }
  if (input.syndrome_method === 'shor') {
    recommendations.push('Shor syndrome extraction requires ancilla preperation: consider flag-based methods for lower overhead')
  }
  recommendations.push('Total physical qubit budget: ' + totalPhysical.toLocaleString() + ' physical qubits for ' + input.logical_qubit_target + ' logical qubits')
  recommendations.push('Decoder latency ' + decoderInfo.latency + 'ns: verify real-time constraint feasibility')
  if (input.code_family === 'bosonic_GKP') {
    recommendations.push('GKP states require high-quality bosonic modes: ensure squeezing > 10 dB')
  }

  return {
    mapping_id: 'ECM-' + randInt(rng, 10000, 99999),
    code_family: input.code_family,
    code_distance: d,
    logical_error_rate: Math.round(pLogical * 1e18) / 1e18,
    threshold_surpassed: pPhys < threshold,
    physical_qubits_per_logical: physicalPerLogical,
    total_physical_qubits: totalPhysical,
    syndrome_extraction_rounds: syndromeRounds,
    decoder_type: decoderInfo.type,
    decoder_latency_ns: decoderInfo.latency,
    logical_fidelity_estimate: Math.round(logicalFidelity * 100000) / 100000,
    overhead_ratio: overheadRatio,
    error_budget_breakdown: budget,
    recommendations,
  }
}

// Tool 4: Quantum Optimizer
function analyzeQuantumOptimizer(input: QuantumOptimizerInput): QuantumOptimizerResult {
  const rng = seededRng(input)

  const penalty = input.penalty_weight || randFloat(rng, 1.5, 5.0)
  const mixer = input.mixer_type || pickOne(rng, ['standard', 'XY', 'controlled_phase'])
  const qubitsReq = input.hamiltonian_type === 'QUBO' ? input.variable_count : input.variable_count * 2
  const pLayers = input.algorithm === 'QAOA' ? Math.min(Math.ceil(input.variable_count / 4), 10) : 1
  const termsHamiltonian = input.constraint_count + input.variable_count + (input.hamiltonian_type === 'PUBO' ? Math.floor(input.variable_count * 1.5) : 0)

  const encodingMap: OptimizerEncoding[] = []
  for (let i = 0; i < input.variable_count; i++) {
    encodingMap.push({
      variable_name: 'x_' + i,
      qubit_index: i % qubitsReq,
      hamiltonian_coeff: Math.round(randFloat(rng, -5, 5) * 100) / 100,
      constraint_applied: i < input.constraint_count,
    })
  }

  const groundStateEst = -randFloat(rng, 5, 20) * Math.log2(input.variable_count + 1)
  const approxRatio = 1 - (1 / Math.sqrt(pLayers + 1)) + randFloat(rng, -0.02, 0.05)

  const feasibilityNotes: string[] = []
  feasibilityNotes.push('Problem type ' + input.problem_type + ' encoded as ' + input.hamiltonian_type)
  feasibilityNotes.push('Qubits required: ' + qubitsReq + ' (' + input.hamiltonian_type + ' representation)')
  feasibilityNotes.push('Penalty weight ' + penalty.toFixed(2) + ' for constraint enforcement')
  if (input.constraint_count > input.variable_count * 2) {
    feasibilityNotes.push('High constraint ratio: consider constraint relaxation or penalty tuning')
  }
  feasibilityNotes.push('Mixer hamiltonian: ' + mixer + ' --- select based on problem symmetry')
  if (input.algorithm === 'quantum_annealing') {
    feasibilityNotes.push('Quantum annealing: verify annealing schedule compatibility with ' + qubitsReq + ' qubits')
  } else {
    feasibilityNotes.push('Variational approach: ' + pLayers + ' QAOA layers estimated')
  }
  feasibilityNotes.push('Estimated classical runtime: ' + Math.round(input.variable_count * pLayers * 0.5) + ' objective evaluations')

  return {
    encoding_id: 'QOPT-' + randInt(rng, 10000, 99999),
    problem_type: input.problem_type,
    hamiltonian_type: input.hamiltonian_type,
    qubits_required: qubitsReq,
    terms_in_hamiltonian: termsHamiltonian,
    p_qaoa_layers: pLayers,
    classical_variables: input.variable_count,
    penalty_weight_applied: Math.round(penalty * 100) / 100,
    ground_state_energy_estimate: Math.round(groundStateEst * 1000) / 1000,
    approximation_ratio_expected: Math.max(0.5, Math.round(approxRatio * 100) / 100),
    encoding_map: encodingMap,
    mixer_type: mixer,
    optimization_rounds_estimate: randInt(rng, 50, 500) * pLayers,
    feasibility_notes: feasibilityNotes,
  }
}

// Tool 5: QML Model Setup
function analyzeQmlModel(input: QmlModelInput): QmlModelResult {
  const rng = seededRng(input)

  const embeddingQubits: Record<string, number> = {
    amplitude_embedding: Math.ceil(Math.log2(Math.max(input.feature_dimension, 2))),
    angle_embedding: input.feature_dimension,
    IQP: input.feature_dimension,
    tensor_network: Math.ceil(Math.sqrt(input.feature_dimension)),
    _data_reuploading: Math.ceil(input.feature_dimension / 2),
  }
  const qubitsReq = embeddingQubits[input.quantum_ansatz] || Math.ceil(Math.log2(input.feature_dimension))

  const layers: QuantumLayerSpec[] = []
  layers.push({
    layer_index: 0,
    layer_type: 'encoding',
    qubits_used: qubitsReq,
    parameter_count: qubitsReq,
    unitary_description: input.quantum_ansatz + ' encoding of ' + input.feature_dimension + '-dim input',
  })

  const varLayerCount = randInt(rng, 2, 5)
  let totalParams = qubitsReq
  for (let i = 1; i <= varLayerCount; i++) {
    const pCount = qubitsReq * randInt(rng, 2, 4)
    totalParams += pCount
    layers.push({
      layer_index: i,
      layer_type: i % 2 === 0 ? 'entanglement' : 'variational',
      qubits_used: qubitsReq,
      parameter_count: pCount,
      unitary_description: i % 2 === 0 ? 'CNOT ring entanglement' : 'Parameterized RY/RZ rotations',
    })
  }

  layers.push({
    layer_index: varLayerCount + 1,
    layer_type: 'measurement',
    qubits_used: qubitsReq,
    parameter_count: 0,
    unitary_description: input.measurement_basis + '-basis measurement on all qubits',
  })

  const depthPerLayer = randInt(rng, 5, 20)
  const totalDepth = depthPerLayer * (varLayerCount + 1)

  const barrenRisk: 'low' | 'medium' | 'high' =
    input.quantum_ansatz === 'amplitude_embedding' && input.feature_dimension > 32 ? 'high' :
    input.quantum_ansatz === '_data_reuploading' ? 'medium' :
    input.noise_aware_training ? 'low' : 'medium'

  const observables: string[] = []
  for (let i = 0; i < Math.min(qubitsReq, 4); i++) {
    observables.push(pickOne(rng, ['Z_pauli_str', 'X_pauli_str', 'Y_pauli_str', 'multi_qubit_correlator']))
  }

  return {
    model_id: 'QML-' + randInt(rng, 10000, 99999),
    task_type: input.task_type,
    quantum_ansatz: input.quantum_ansatz,
    total_variational_params: totalParams,
    circuit_depth: totalDepth,
    qubit_requirement: qubitsReq,
    measurement_basis: input.measurement_basis,
    expectation_value_method: input.training_shots >= 10000 ? 'sample-average' : 'exact_statevector_simulation',
    layers,
    classical_postprocessing: input.classical_postprocessing,
    barren_plateau_risk: barrenRisk,
    generalization_capacity: input.feature_dimension <= 16 ? 'excellent' : input.feature_dimension <= 64 ? 'good (may need data augmentation)' : 'limited --- dimensionality reduction recommended',
    training_complexity: 'O(' + input.training_shots + ' * ' + totalDepth + ' * ' + totalParams + ') per iteration',
    measurement_shots: input.training_shots,
    noise_aware_training: input.noise_aware_training,
    observables,
  }
}

// Tool 6: Quantum Safe Migration Planner
function analyzeQuantumSafeMigration(input: QuantumSafeMigrationInput): QuantumSafeMigrationResult {
  const rng = seededRng(input)

  const replacementMap: Record<string, { replacement: string; urgency: 'critical' | 'high' | 'medium' | 'low'; threat: 'imminent' | 'near_term' | 'long_term' }> = {
    'RSA-2048': { replacement: 'CRYSTALS-Kyber-1024 + SPHINCS+-256f', urgency: 'critical', threat: 'imminent' },
    'RSA-4096': { replacement: 'CRYSTALS-Kyber-1024 + Classic-McEliece', urgency: 'high', threat: 'near_term' },
    'ECC-P256': { replacement: 'CRYSTALS-Dilithium5', urgency: 'critical', threat: 'imminent' },
    'ECC-P384': { replacement: 'CRYSTALS-Dilithium5 + Falcon-1024', urgency: 'high', threat: 'near_term' },
    'AES-128': { replacement: 'AES-256', urgency: 'high', threat: 'near_term' },
    'AES-256': { replacement: 'AES-256 (Grover-reduced but still 128-bit security)', urgency: 'medium', threat: 'long_term' },
    'SHA-256': { replacement: 'SHA-3-384 or SHA-256 with extended output', urgency: 'medium', threat: 'near_term' },
    'SHA-3': { replacement: 'SHA-3 (quantum-safe at current security levels)', urgency: 'low', threat: 'long_term' },
  }

  const migrationItems: CryptoMigrationItem[] = []
  let totalEffort = 0
  for (const scheme of input.current_crypto) {
    const r = replacementMap[scheme] || { replacement: 'NIST-PQC-standardized-algorithm', urgency: 'medium', threat: 'near_term' }
    const effort = r.urgency === 'critical' ? randInt(rng, 4, 10) : r.urgency === 'high' ? randInt(rng, 3, 7) : randInt(rng, 2, 5)
    totalEffort += effort
    migrationItems.push({
      current_scheme: scheme,
      replacement_scheme: r.replacement,
      migration_phase: randInt(rng, 1, 4) as 1 | 2 | 3 | 4,
      urgency: r.urgency,
      effort_estimate_person_months: effort,
      quantum_threat_level: r.threat,
    })
  }

  const vulnCount = migrationItems.filter(i => i.urgency === 'critical' || i.urgency === 'high').length
  const riskScore = Math.min(100, vulnCount * 15 + input.current_crypto.length * 5)
  const deadlineUrgency = input.migration_deadline_years < 3 ? 'compressed' : input.migration_deadline_years < 5 ? 'standard' : 'relaxed'

  const complianceGaps: string[] = []
  if (!input.compliance_requirements.includes('NIST-PQC')) complianceGaps.push('Add NIST-PQC compliance tracking for post-quantum algorithm adoption')
  if (!input.compliance_requirements.includes('FIPS-140-3')) complianceGaps.push('FIPS-140-3 cryptographic module validation required')
  if (input.infrastructure_type === 'iot') complianceGaps.push('IoT device firmware signing: constrained-environment PQC may need lightweight variants')
  if (input.infrastructure_type === 'blockchain') complianceGaps.push('Blockchain: address format changes and transaction size increase require community coordination')

  const milestones: string[] = []
  milestones.push('Month 1-3: Cryptographic inventory and dependency mapping')
  milestones.push('Month 3-6: Lab testing of PQC candidates against ' + input.infrastructure_type + ' workload')
  milestones.push('Month 6-12: Hybrid mode deployment (classical + PQC dual certificates)')
  if (deadlineUrgency === 'compressed') {
    milestones.push('Month 12-18: Accelerated cutover with crypto-agile intermediates')
  } else {
    milestones.push('Month 12-24: Gradual migration with backward-compatible fallbacks')
  }
  milestones.push('Month 24+: Full PQC deployment and legacy algorithm deprecation')

  return {
    plan_id: 'QSM-' + randInt(rng, 10000, 99999),
    overall_risk_score: Math.min(100, riskScore),
    vulnerability_count: vulnCount,
    migration_items: migrationItems,
    hybrid_transition_strategy: 'DualCertificate hybrid: X.509 with composite classical+PQC public keys during transition period',
    compliance_gaps: complianceGaps,
    milestone_timeline: milestones,
    total_effort_person_months: totalEffort,
    recommended_priority_order: migrationItems.sort((a, b) => {
      const order: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
      return order[b.urgency] - order[a.urgency]
    }).map(i => i.current_scheme + ' -> ' + i.replacement_scheme),
    crypto_agility_framework: 'Implement crypto-agility layer with pluggable algorithm providers (OpenSSL 3.0+ engine or PKCS#11 module)',
  }
}

// Tool 7: Quantum Hardware Selector
function analyzeHardwareSelection(input: HardwareSelectionInput): QuantumHardwareResult {
  const rng = seededRng(input)

  const candidates: HardwareCandidate[] = [
    {
      platform: 'IBM Quantum Heron (133 qubits)',
      qubit_count: 133,
      two_qubit_gate_fidelity: 0.998,
      t1_coherence_us: 200,
      gate_speed_ns: 50,
      connectivity: 'heavy-hexagonal',
      maturity: 'production' as const,
      score: 0,
    },
    {
      platform: 'Google Sycamore/Willow (105 qubits)',
      qubit_count: 105,
      two_qubit_gate_fidelity: 0.995,
      t1_coherence_us: 100,
      gate_speed_ns: 25,
      connectivity: 'nearest-neighbor grid',
      maturity: 'production' as const,
      score: 0,
    },
    {
      platform: 'Quantinuum H2 (56 qubits trapped-ion)',
      qubit_count: 56,
      two_qubit_gate_fidelity: 0.997,
      t1_coherence_us: 100000,
      gate_speed_ns: 200,
      connectivity: 'all-to-all',
      maturity: 'production' as const,
      score: 0,
    },
    {
      platform: 'QuEra Aquila (256 qubits neutral atom)',
      qubit_count: 256,
      two_qubit_gate_fidelity: 0.995,
      t1_coherence_us: 1000,
      gate_speed_ns: 500,
      connectivity: 'reconfigurable atom arrays',
      maturity: 'pilot' as const,
      score: 0,
    },
    {
      platform: 'Xanadu Borealis (216 modes photonic)',
      qubit_count: 216,
      two_qubit_gate_fidelity: 0.98,
      t1_coherence_us: 100,
      gate_speed_ns: 10,
      connectivity: 'Gaussian boson sampling',
      maturity: 'pilot' as const,
      score: 0,
    },
    {
      platform: 'Microsoft Majorana (topological, in development)',
      qubit_count: 8,
      two_qubit_gate_fidelity: 0.9999,
      t1_coherence_us: 1000000,
      gate_speed_ns: 100,
      connectivity: 'topological protection',
      maturity: 'research' as const,
      score: 0,
    },
  ]

  for (const c of candidates) {
    let s = 0
    s += c.qubit_count >= input.required_logical_qubits ? 30 : (c.qubit_count / input.required_logical_qubits) * 20
    s += c.two_qubit_gate_fidelity >= input.min_gate_fidelity ? 25 : (c.two_qubit_gate_fidelity / input.min_gate_fidelity) * 15
    if (input.connectivity_requirement === 'all_to_all' && c.connectivity.includes('all-to-all')) s += 20
    else if (input.connectivity_requirement === 'high_degree' && !c.connectivity.includes('nearest-neighbor')) s += 15
    else if (input.connectivity_requirement === 'nearest_neighbor') s += 10
    s += c.maturity === 'production' ? 15 : c.maturity === 'pilot' ? 8 : 3
    const speedScore = Math.min(10, 1000 / c.gate_speed_ns)
    s += speedScore
    c.score = Math.round(s * 10) / 10
  }

  candidates.sort((a, b) => b.score - a.score)
  const top = candidates[0]

  const scoreBreakdown: Record<string, number> = {
    qubit_capacity: Math.min(30, (top.qubit_count / input.required_logical_qubits) * 25),
    gate_fidelity: Math.min(25, (top.two_qubit_gate_fidelity / input.min_gate_fidelity) * 20),
    connectivity_match: input.connectivity_requirement === 'all_to_all' && top.connectivity.includes('all-to-all') ? 20 : 10,
    maturity_bonus: top.maturity === 'production' ? 15 : top.maturity === 'pilot' ? 8 : 3,
    speed_factor: Math.min(10, 1000 / top.gate_speed_ns),
  }

  const overhead = 10
  const effectiveLogical = Math.floor(top.qubit_count / overhead)
  const cost = top.maturity === 'production' ? randFloat(rng, 10, 50) : top.maturity === 'pilot' ? randFloat(rng, 2, 20) : randFloat(rng, 0.1, 2)

  const infraReqs: string[] = []
  if (top.platform.includes('IBM') || top.platform.includes('Google') || top.platform.includes('Microsoft')) {
    infraReqs.push('Dilution refrigerator (10 mK) required')
    infraReqs.push('Classical control electronics (AWG + digitizer per qubit)')
  }
  if (top.platform.includes('Quantinuum')) {
    infraReqs.push('Ultra-high vacuum chamber + laser systems')
    infraReqs.push('Room-temperature operation for qubit control')
  }
  if (top.platform.includes('QuEra')) {
    infraReqs.push('Optical tweezers and AOD systems')
    infraReqs.push('Vacuum chamber with atom loading')
  }
  if (top.platform.includes('Xanadu')) {
    infraReqs.push('Squeezed light source + fiber delay lines')
    infraReqs.push('Photon-number-resolving detector array')
  }

  const risks: string[] = []
  if (effectiveLogical < input.required_logical_qubits) {
    risks.push('WARNING: effective logical qubits (' + effectiveLogical + ') below requirement (' + input.required_logical_qubits + ') --- circuit knitting needed')
  }
  if (top.maturity === 'research') {
    risks.push('Platform not yet production-ready: delays and limited availability expected')
  }
  if (top.two_qubit_gate_fidelity < input.min_gate_fidelity) {
    risks.push('Gate fidelity below requirement: error correction or mitigation mandatory')
  }
  risks.push('Vendor lock-in risk: prefer open-standard pulse-level interfaces (OpenPulse/Qiskit Pulse)')

  return {
    selection_id: 'HWS-' + randInt(rng, 10000, 99999),
    use_case: input.use_case,
    candidates,
    top_candidate: top.platform,
    score_breakdown: scoreBreakdown,
    qubit_overhead_factor: overhead,
    effective_logical_qubits: effectiveLogical,
    estimated_system_cost_millions: Math.round(cost * 100) / 100,
    infrastructure_requirements: infraReqs,
    roadmap_alignment: top.maturity === 'production' ? 'Deployable within 12 months' : top.maturity === 'pilot' ? 'Available via cloud access; on-premise 18-24 months' : 'Technology maturing; revisit in 24-36 months',
    risk_factors: risks,
  }
}

// Tool 8: NISQ Algorithm Advisor
function analyzeNisqAdvisor(input: NisqAdvisorInput): NisqAdvisorResult {
  const rng = seededRng(input)

  const allCandidates: NisqAlgorithmCandidate[] = [
    {
      algorithm_name: 'Variational Quantum Eigensolver (VQE)',
      qubit_requirement: 8,
      depth_requirement: 100,
      classical_components: ['classical optimizer', 'qubit tapering', 'grouping'],
      error_mitigation_needed: ['readout correction'],
      suitability_score: 0,
      expected_speedup: 'heuristic, polynomial in some regimes',
      noise_sensitivity: 'medium',
    },
    {
      algorithm_name: 'Quantum Approximate Optimization (QAOA)',
      qubit_requirement: input.qubit_budget,
      depth_requirement: input.qubit_budget * 4,
      classical_components: ['classical parameter optimizer', 'warm-starting'],
      error_mitigation_needed: ['ZNE', 'readout correction'],
      suitability_score: 0,
      expected_speedup: 'constant-factor improvement over Goemans-Williamson',
      noise_sensitivity: 'medium',
    },
    {
      algorithm_name: 'Variational Quantum Linear Solver (VQLS)',
      qubit_requirement: Math.ceil(Math.log2(Math.max(input.qubit_budget, 8))),
      depth_requirement: 200,
      classical_components: ['classical linear algebra preconditioner', 'Hadamard test circuits'],
      error_mitigation_needed: ['ZNE', 'probabilistic error cancellation'],
      suitability_score: 0,
      expected_speedup: 'exponential for sparse, well-conditioned systems',
      noise_sensitivity: 'high',
    },
    {
      algorithm_name: 'Quantum Boltzmann Machine',
      qubit_requirement: Math.min(20, input.qubit_budget),
      depth_requirement: 50,
      classical_components: ['classical Gibbs sampling', 'gradient descent'],
      error_mitigation_needed: ['readout correction'],
      suitability_score: 0,
      expected_speedup: 'improved sampling from multimodal distributions',
      noise_sensitivity: 'low',
    },
    {
      algorithm_name: 'Quantum Generative Adversarial Network (qGAN)',
      qubit_requirement: Math.min(16, input.qubit_budget),
      depth_requirement: 80,
      classical_components: ['classical discriminator', 'loss function evaluation'],
      error_mitigation_needed: ['ZNE'],
      suitability_score: 0,
      expected_speedup: 'fewer parameters for distribution learning',
      noise_sensitivity: 'medium',
    },
    {
      algorithm_name: 'Quantum Walk Sampling',
      qubit_requirement: input.qubit_budget,
      depth_requirement: Math.ceil(Math.sqrt(input.qubit_budget)) * 6,
      classical_components: ['graph construction', 'step operator'],
      error_mitigation_needed: [],
      suitability_score: 0,
      expected_speedup: 'quadratic in graph hitting time',
      noise_sensitivity: 'high',
    },
  ]

  const filtered = allCandidates.filter(c => c.qubit_requirement <= input.qubit_budget && c.depth_requirement <= input.depth_budget)

  let candidates = filtered.length > 0 ? filtered.slice() : [allCandidates[0]]

  for (const c of candidates) {
    let score = 50
    if (c.qubit_requirement <= input.qubit_budget * 0.5) score += 15
    if (c.depth_requirement <= input.depth_budget * 0.5) score += 15
    if (input.error_mitigation_budget === 'high' && c.error_mitigation_needed.length <= 2) score += 10
    if (input.classical_compute_available === 'abundant' && c.classical_components.length > 1) score += 8
    if (c.noise_sensitivity === 'low' && input.error_mitigation_budget === 'none') score += 12
    score += randInt(rng, -5, 10)
    c.suitability_score = Math.max(0, Math.min(100, score))
  }

  candidates.sort((a, b) => b.suitability_score - a.suitability_score)
  const top = candidates[0]

  let feasibility: string
  if (top.qubit_requirement <= input.qubit_budget && top.depth_requirement <= input.depth_budget) {
    feasibility = 'FEASIBLE: algorithm fits within NISQ constraints (' + top.qubit_requirement + ' qubits, ' + top.depth_requirement + ' depth)'
  } else if (top.qubit_requirement > input.qubit_budget) {
    feasibility = 'INFEASIBLE: qubit requirement (' + top.qubit_requirement + ') exceeds budget (' + input.qubit_budget + ')'
  } else {
    feasibility = 'INFEASIBLE: depth requirement (' + top.depth_requirement + ') exceeds budget (' + input.depth_budget + ')'
  }

  const mitMap: Record<string, string> = {
    none: 'No error mitigation: use noise-aware circuit design and post-selection',
    low: 'Basic readout correction and zero-noise extrapolation',
    medium: 'ZNE + measurement error mitigation + dynamical decoupling',
    high: 'Full PEC or virtual distillation for near-exact expectation values',
  }

  const tradeoffs: string[] = []
  tradeoffs.push('Qubit-depth tradeoff: deeper circuits improve accuracy but accumulate noise faster')
  tradeoffs.push('Classical overhead: ' + input.classical_compute_available + ' classical resources enable ' + (input.classical_compute_available === 'abundant' ? 'shot-loop-parallelised optimisation' : input.classical_compute_available === 'moderate' ? 'batched parameter updates' : 'sequential optimisation with caching'))
  tradeoffs.push('NISQ constraint: keep total gate count below ' + (input.qubit_budget * input.depth_budget * 0.8) + ' for meaningful signal')
  if (input.accuracy_target > 0.95) {
    tradeoffs.push('High accuracy target (>95%): NISQ era unlikely to achieve --- consider fault-tolerant algorithms')
  }

  const platforms: string[] = []
  if (input.qubit_budget <= 50) platforms.push('IBM Qiskit Runtime', 'Amazon Braket', 'Azure Quantum')
  else platforms.push('IBM Quantum (100+ qubit systems)', 'Google Quantum AI', 'IonQ via cloud')

  return {
    advisory_id: 'NISQ-' + randInt(rng, 10000, 99999),
    problem_category: input.problem_category,
    candidates,
    recommended_algorithm: top.algorithm_name,
    feasibility_assessment: feasibility,
    error_mitigation_strategy: mitMap[input.error_mitigation_budget],
    hybrid_decomposition: 'Problem partitioned into: (1) quantum subroutine (' + top.qubit_requirement + ' qubits) + (2) classical control + (' + top.classical_components.join(', ') + ')',
    resource_tradeoffs: tradeoffs,
    accuracy_achievable: Math.min(input.accuracy_target, top.noise_sensitivity === 'high' ? 0.80 : top.noise_sensitivity === 'medium' ? 0.90 : 0.95),
    circuit_generation_platforms: platforms,
    key_references: [
      'Preskill (2018) "Quantum Computing in the NISQ era and beyond"',
      'Bharti et al. (2022) "Noisy intermediate-scale quantum algorithms"',
      'Cerezo et al. (2021) "Variational quantum algorithms" Nature Reviews Physics',
    ],
  }
}

// ====================== Formatting Helpers ========================

function generateMermaidGraph(title: string, nodes: string[]): string {
  const lines = ['```mermaid', 'graph LR']
  nodes.forEach((n, i) => {
    if (i > 0) lines.push('    ' + nodes[i - 1].replace(/[\[\]]/g, '') + ' -->|step ' + i + '| ' + n.replace(/[\[\]]/g, ''))
  })
  lines.push('```')
  return '\n' + lines.join('\n') + '\n'
}

// Tool 1 Formatter
function formatCircuitDesignReport(r: CircuitDesignResult): string {
  const L: string[] = []
  L.push('## Quantum Circuit Designer')
  L.push('')
  L.push('Circuit ID: ' + r.circuit_id + ' | Algorithm: ' + r.algorithm + ' | Qubits: ' + r.qubit_count)
  L.push('')
  L.push('| Metric | Value |')
  L.push('|--------|-------|')
  L.push('| Total gates | ' + r.gate_count_total.toLocaleString() + ' |')
  L.push('| Circuit depth | ' + r.circuit_depth.toLocaleString() + ' |')
  L.push('| Single-qubit gates | ' + r.single_qubit_gates.toLocaleString() + ' |')
  L.push('| Two-qubit gates | ' + r.two_qubit_gates.toLocaleString() + ' |')
  L.push('| T gates | ' + r.t_gate_count.toLocaleString() + ' |')
  L.push('| Estimated fidelity | ' + (r.estimated_fidelity * 100).toFixed(3) + '% |')
  L.push('| Backend compatibility | ' + r.backend_compatibility.join(', ') + ' |')
  L.push('')
  L.push('### Layers')
  L.push('| Index | Gate | Targets | Params | Depth |')
  L.push('|-------|------|---------|--------|-------|')
  for (const layer of r.layers) {
    L.push('| ' + layer.index + ' | ' + layer.gate_type + ' | ' + layer.target_qubits.join(',') + ' | ' + (layer.parameters || '-') + ' | ' + layer.depth_contribution + ' |')
  }
  L.push('')
  L.push('### Synthesis Notes')
  for (const n of r.synthesis_notes) L.push('- ' + n)
  L.push('')
  L.push('---')
  L.push('*Quantum Circuit Designer v' + VERSION + ' | Gates: ' + r.gate_count_total + ' | Depth: ' + r.circuit_depth + ' | Fidelity: ' + (r.estimated_fidelity * 100).toFixed(3) + '%*')
  return L.join('\n')
}

// Tool 2 Formatter
function formatVqeConfigReport(r: VqeConfigResult): string {
  const L: string[] = []
  L.push('## VQE Configurator')
  L.push('')
  L.push('Config ID: ' + r.config_id + ' | Molecule: ' + r.molecule + ' | Basis: ' + r.basis_set)
  L.push('')
  L.push('| Metric | Value |')
  L.push('|--------|-------|')
  L.push('| Active orbitals | ' + r.active_orbitals + ' |')
  L.push('| Active electrons | ' + r.active_electrons + ' |')
  L.push('| Qubit requirement | ' + r.qubit_requirement + ' |')
  L.push('| Ansatz | ' + r.ansatz_type + ' |')
  L.push('| Variational parameters | ' + r.variational_parameters + ' |')
  L.push('| Depth per iteration | ' + r.circuit_depth_per_iteration + ' |')
  L.push('| Optimizer | ' + r.optimizer + ' |')
  L.push('| Max iterations | ' + r.max_iterations + ' |')
  L.push('| Convergence threshold | ' + r.convergence_threshold + ' |')
  L.push('| Expected accuracy | ' + (r.expected_accuracy * 100).toFixed(1) + '% |')
  L.push('| Resource estimate | ' + r.resource_estimate_hours + ' GPU-QPU hours |')
  L.push('')
  L.push('### Error Mitigation')
  for (const m of r.error_mitigation_recommended) L.push('- ' + m)
  L.push('')
  L.push('### Convergence')
  L.push('- ' + r.convergence_behavior)
  L.push('')
  L.push('---')
  L.push('*VQE Configurator v' + VERSION + ' | ' + r.variational_parameters + ' params | ' + r.optimizer + ' opt*')
  return L.join('\n')
}

// Tool 3 Formatter
function formatErrorCorrectionReport(r: ErrorCorrectionResult): string {
  const L: string[] = []
  L.push('## Error Correction Mapper')
  L.push('')
  L.push('Mapping ID: ' + r.mapping_id + ' | Code: ' + r.code_family + ' | Distance: ' + r.code_distance)
  L.push('')
  L.push('| Metric | Value |')
  L.push('|--------|-------|')
  L.push('| Logical error rate | ' + r.logical_error_rate.toExponential(2) + ' |')
  L.push('| Threshold surpassed | ' + (r.threshold_surpassed ? 'yes' : 'no') + ' |')
  L.push('| Physical / Logical | ' + r.physical_qubits_per_logical + ' |')
  L.push('| Total physical | ' + r.total_physical_qubits.toLocaleString() + ' |')
  L.push('| Syndrome rounds | ' + r.syndrome_extraction_rounds + ' |')
  L.push('| Decoder | ' + r.decoder_type + ' |')
  L.push('| Decoder latency | ' + r.decoder_latency_ns + ' ns |')
  L.push('| Logical fidelity | ' + (r.logical_fidelity_estimate * 100).toFixed(3) + '% |')
  L.push('')
  L.push('### Error Budget')
  L.push('| Source | Fraction |')
  L.push('|--------|----------|')
  for (const [k, v] of Object.entries(r.error_budget_breakdown)) {
    L.push('| ' + k.replace(/_/g, ' ') + ' | ' + v.toFixed(4) + ' |')
  }
  L.push('')
  L.push('### Recommendations')
  for (const rec of r.recommendations) L.push('- ' + rec)
  L.push('')
  L.push('---')
  L.push('*Error Correction Mapper v' + VERSION + ' | ' + r.code_family + ' d=' + r.code_distance + ' | ' + r.total_physical_qubits + ' phys qubits*')
  return L.join('\n')
}

// Tool 4 Formatter
function formatQuantumOptimizerReport(r: QuantumOptimizerResult): string {
  const L: string[] = []
  L.push('## Quantum Optimizer')
  L.push('')
  L.push('Encoding ID: ' + r.encoding_id + ' | Problem: ' + r.problem_type + ' | Hamiltonian: ' + r.hamiltonian_type)
  L.push('')
  L.push('| Metric | Value |')
  L.push('|--------|-------|')
  L.push('| Qubits required | ' + r.qubits_required + ' |')
  L.push('| Hamiltonian terms | ' + r.terms_in_hamiltonian.toLocaleString() + ' |')
  L.push('| QAOA layers (p) | ' + r.p_qaoa_layers + ' |')
  L.push('| Classical variables | ' + r.classical_variables + ' |')
  L.push('| Penalty weight | ' + r.penalty_weight_applied + ' |')
  L.push('| Ground energy est | ' + r.ground_state_energy_estimate + ' |')
  L.push('| Approx ratio | ' + r.approximation_ratio_expected.toFixed(3) + ' |')
  L.push('| Mixer | ' + r.mixer_type + ' |')
  L.push('| Opt rounds est | ' + r.optimization_rounds_estimate + ' |')
  L.push('')
  L.push('### Encoding Map')
  L.push('| Variable | Qubit | Coeff | Constraint |')
  L.push('|----------|-------|-------|------------|')
  for (const e of r.encoding_map.slice(0, 15)) {
    L.push('| ' + e.variable_name + ' | ' + e.qubit_index + ' | ' + e.hamiltonian_coeff + ' | ' + (e.constraint_applied ? 'yes' : 'no') + ' |')
  }
  if (r.encoding_map.length > 15) L.push('| ... | ... | ... | ... |')
  L.push('')
  L.push('### Feasibility')
  for (const f of r.feasibility_notes) L.push('- ' + f)
  L.push('')
  L.push('---')
  L.push('*Quantum Optimizer v' + VERSION + ' | ' + r.problem_type + ' | ' + r.qubits_required + ' qubits*')
  return L.join('\n')
}

// Tool 5 Formatter
function formatQmlModelReport(r: QmlModelResult): string {
  const L: string[] = []
  L.push('## QML Model Setup')
  L.push('')
  L.push('Model ID: ' + r.model_id + ' | Task: ' + r.task_type + ' | Ansatz: ' + r.quantum_ansatz)
  L.push('')
  L.push('| Metric | Value |')
  L.push('|--------|-------|')
  L.push('| Total variat. params | ' + r.total_variational_params + ' |')
  L.push('| Circuit depth | ' + r.circuit_depth + ' |')
  L.push('| Qubit requirement | ' + r.qubit_requirement + ' |')
  L.push('| Measurement basis | ' + r.measurement_basis + ' |')
  L.push('| Observable method | ' + r.expectation_value_method + ' |')
  L.push('| Classical post-proc | ' + r.classical_postprocessing + ' |')
  L.push('| Barren plateau risk | ' + r.barren_plateau_risk + ' |')
  L.push('| Training complexity | ' + r.training_complexity + ' |')
  L.push('| Measurement shots | ' + r.measurement_shots.toLocaleString() + ' |')
  L.push('| Noise-aware training | ' + (r.noise_aware_training ? 'yes' : 'no') + ' |')
  L.push('')
  L.push('### Layers')
  L.push('| Idx | Type | Qubits | Params | Unitary |')
  L.push('|-----|------|--------|--------|---------|')
  for (const layer of r.layers) {
    L.push('| ' + layer.layer_index + ' | ' + layer.layer_type + ' | ' + layer.qubits_used + ' | ' + layer.parameter_count + ' | ' + layer.unitary_description + ' |')
  }
  L.push('')
  L.push('### Observables')
  for (const o of r.observables) L.push('- ' + o)
  L.push('')
  L.push('---')
  L.push('*QML Model Setup v' + VERSION + ' | ' + r.total_variational_params + ' params | ' + r.barren_plateau_risk + ' BP risk*')
  return L.join('\n')
}

// Tool 6 Formatter
function formatMigrationReport(r: QuantumSafeMigrationResult): string {
  const L: string[] = []
  L.push('## Quantum-Safe Migration Planner')
  L.push('')
  L.push('Plan ID: ' + r.plan_id + ' | Risk score: ' + r.overall_risk_score + '/100 | Vulnerabilities: ' + r.vulnerability_count)
  L.push('')
  L.push('| Current | Replacement | Phase | Urgency | Effort (PM) | Threat |')
  L.push('|---------|-------------|-------|---------|-------------|--------|')
  for (const item of r.migration_items) {
    L.push('| ' + item.current_scheme + ' | ' + item.replacement_scheme + ' | ' + item.migration_phase + ' | ' + item.urgency + ' | ' + item.effort_estimate_person_months + ' | ' + item.quantum_threat_level + ' |')
  }
  L.push('')
  L.push('### Milestones')
  for (const m of r.milestone_timeline) L.push('- ' + m)
  L.push('')
  L.push('### Crypto-Agility')
  L.push('- ' + r.crypto_agility_framework)
  L.push('')
  L.push('---')
  L.push('*Quantum-Safe Migration Planner v' + VERSION + ' | ' + r.total_effort_person_months + ' person-months total*')
  return L.join('\n')
}

// Tool 7 Formatter
function formatHardwareReport(r: QuantumHardwareResult): string {
  const L: string[] = []
  L.push('## Quantum Hardware Selector')
  L.push('')
  L.push('Selection ID: ' + r.selection_id + ' | Use case: ' + r.use_case)
  L.push('')
  L.push('| Platform | Qubits | 2Q Fid | T1 (us) | Gate (ns) | Connectivity | Maturity | Score |')
  L.push('|----------|--------|--------|---------|-----------|--------------|----------|-------|')
  for (const c of r.candidates) {
    L.push('| ' + c.platform + ' | ' + c.qubit_count + ' | ' + c.two_qubit_gate_fidelity.toFixed(3) + ' | ' + c.t1_coherence_us + ' | ' + c.gate_speed_ns + ' | ' + c.connectivity + ' | ' + c.maturity + ' | ' + c.score + ' |')
  }
  L.push('')
  L.push('### Top Pick')
  L.push('**' + r.top_candidate + '**')
  L.push('')
  L.push('| Factor | Score |')
  L.push('|--------|-------|')
  for (const [k, v] of Object.entries(r.score_breakdown)) {
    L.push('| ' + k.replace(/_/g, ' ') + ' | ' + v.toFixed(1) + ' |')
  }
  L.push('')
  L.push('### Infrastructure')
  for (const i of r.infrastructure_requirements) L.push('- ' + i)
  L.push('')
  L.push('### Risks')
  for (const rf of r.risk_factors) L.push('- ' + rf)
  L.push('')
  L.push('---')
  L.push('*Quantum Hardware Selector v' + VERSION + ' | Effective logical qubits: ' + r.effective_logical_qubits + ' | Cost: $' + r.estimated_system_cost_millions + 'M*')
  return L.join('\n')
}

// Tool 8 Formatter
function formatNisqAdvisorReport(r: NisqAdvisorResult): string {
  const L: string[] = []
  L.push('## NISQ Algorithm Advisor')
  L.push('')
  L.push('Advisory ID: ' + r.advisory_id + ' | Category: ' + r.problem_category)
  L.push('')
  L.push('| Algorithm | Qubits | Depth | Score | Speedup | Noise |')
  L.push('|-----------|--------|-------|-------|---------|-------|')
  for (const c of r.candidates) {
    L.push('| ' + c.algorithm_name + ' | ' + c.qubit_requirement + ' | ' + c.depth_requirement + ' | ' + c.suitability_score + ' | ' + c.expected_speedup + ' | ' + c.noise_sensitivity + ' |')
  }
  L.push('')
  L.push('### Recommendation')
  L.push('**' + r.recommended_algorithm + '**')
  L.push('- Feasibility: ' + r.feasibility_assessment)
  L.push('- Error mitigation: ' + r.error_mitigation_strategy)
  L.push('- Hybrid decomposition: ' + r.hybrid_decomposition)
  L.push('- Achievable accuracy: ' + (r.accuracy_achievable * 100).toFixed(1) + '%')
  L.push('')
  L.push('### Tradeoffs')
  for (const t of r.resource_tradeoffs) L.push('- ' + t)
  L.push('')
  L.push('### References')
  for (const ref of r.key_references) L.push('- ' + ref)
  L.push('')
  L.push('---')
  L.push('*NISQ Algorithm Advisor v' + VERSION + ' | Platforms: ' + r.circuit_generation_platforms.join(', ') + '*')
  return L.join('\n')
}

// ==================== Plugin Registration ========================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: quantum_circuit_designer
  tools.register(defineTool({
    name: 'quantum_circuit_designer',
    description: 'Design quantum circuits for Grover, Shor, QFT, QAOA, VQE, Bernstein-Vazirani, or quantum walk algorithms. Returns gate counts, depth, fidelity estimates, layer decomposition, and backend compatibility for superconducting, trapped-ion, photonic, neutral-atom, or topological hardware.',
    inputSchema: {
      type: 'object',
      required: ['algorithm', 'qubit_count', 'optimization_level', 'target_backend'],
      properties: {
        algorithm: { type: 'string', enum: ['grover', 'shor', 'qft', 'qaoa', 'vqe', 'bernstein', 'quantum_walk'], description: 'Target quantum algorithm' },
        qubit_count: { type: 'integer', minimum: 2, maximum: 1000, description: 'Number of qubits to use' },
        optimization_level: { type: 'integer', enum: [0, 1, 2, 3], description: 'Circuit optimization aggressiveness (0=none, 3=maximum)' },
        target_backend: { type: 'string', enum: ['superconducting', 'trapped_ion', 'photonic', 'neutral_atom', 'topological'], description: 'Target hardware platform' },
        max_depth: { type: 'integer', description: 'Maximum allowed circuit depth (optional)' },
        entanglement_pattern: { type: 'string', enum: ['linear', 'circular', 'full', 'star', 'custom'], description: 'Qubit entanglement topology (optional)' },
      },
    },
    outputSchema: {
      circuit_id: { type: 'string', description: 'Unique circuit identifier' },
      algorithm: { type: 'string', description: 'Algorithm name' },
      qubit_count: { type: 'integer', description: 'Number of qubits' },
      gate_count_total: { type: 'integer', description: 'Total number of gates' },
      circuit_depth: { type: 'integer', description: 'Circuit depth' },
      single_qubit_gates: { type: 'integer', description: 'Number of single-qubit gates (H, X, T, S, Rx, Ry, Rz)' },
      two_qubit_gates: { type: 'integer', description: 'Number of two-qubit gates (CNOT, CZ, SWAP)' },
      t_gate_count: { type: 'integer', description: 'Number of T and Tdg gates (magic-state-intensive)' },
      estimated_fidelity: { type: 'number', description: 'Estimated overall circuit fidelity (0-1)' },
      backend_compatibility: { type: 'array', items: { type: 'string' }, description: 'List of compatible backends' },
      layers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            index: { type: 'integer' },
            gate_type: { type: 'string' },
            target_qubits: { type: 'array', items: { type: 'integer' } },
            parameters: { type: 'string' },
            depth_contribution: { type: 'integer' },
          },
        },
        description: 'Circuit layer decomposition',
      },
      synthesis_notes: { type: 'array', items: { type: 'string' }, description: 'Synthesises recommendations' },
    },
    examples: [
      {
        input: JSON.stringify({ algorithm: 'qaoa', qubit_count: 16, optimization_level: 2, target_backend: 'superconducting', entanglement_pattern: 'linear' }),
        output: JSON.stringify({ circuit_id: 'QC-82741', gate_count_total: 168, circuit_depth: 72, estimated_fidelity: 0.98234 }),
      },
      {
        input: JSON.stringify({ algorithm: 'qft', qubit_count: 32, optimization_level: 1, target_backend: 'trapped_ion' }),
        output: JSON.stringify({ circuit_id: 'QC-61529', gate_count_total: 1584, circuit_depth: 1024, t_gate_count: 64 }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatCircuitDesignReport(analyzeCircuitDesign(JSON.parse(args.input_data) as CircuitDesignInput))
    },
  }))

  // Tool 2: vqe_configurator
  tools.register(defineTool({
    name: 'vqe_configurator',
    description: 'Configure a Variational Quantum Eigensolver (VQE) for molecular simulation. Select molecule, basis set, UCCSD/HardwareEfficient/ADAPT-VQE ansatz, classical optimizer, noise model, and error mitigation strategy. Returns qubit requirements, parameter count, convergence behavior, and runtime estimate.',
    inputSchema: {
      type: 'object',
      required: ['molecule', 'basis_set', 'ansatz_type', 'optimizer', 'max_iterations', 'convergence_threshold'],
      properties: {
        molecule: { type: 'string', enum: ['H2', 'LiH', 'H2O', 'NH3', 'CH4', 'C2H4', 'FeMoCo', 'custom'], description: 'Target molecule' },
        basis_set: { type: 'string', enum: ['sto-3g', '6-31g', 'cc-pvdz', 'aug-cc-pvqz'], description: 'Quantum chemistry basis set' },
        ansatz_type: { type: 'string', enum: ['UCCSD', 'UCCD', 'HardwareEfficient', 'QAOA-inspired', 'ADAPT-VQE'], description: 'Variational ansatz family' },
        optimizer: { type: 'string', enum: ['COBYLA', 'L-BFGS-B', 'SPSA', 'Adam', 'Nelder-Mead'], description: 'Classical optimizer' },
        max_iterations: { type: 'integer', minimum: 10, maximum: 10000, description: 'Maximum optimizer iterations' },
        convergence_threshold: { type: 'number', description: 'Energy convergence threshold in Hartree (e.g. 1e-6)' },
        noise_model: { type: 'string', enum: ['ideal', 'depolarizing', 'amplitude_damping', 'real_device'], description: 'Noise model for simulation (optional)' },
      },
    },
    outputSchema: {
      config_id: { type: 'string', description: 'VQE configuration ID' },
      molecule: { type: 'string', description: 'Target molecule' },
      basis_set: { type: 'string', description: 'Basis set identifier' },
      active_orbitals: { type: 'integer', description: 'Number of active orbitals' },
      active_electrons: { type: 'integer', description: 'Number of active electrons' },
      qubit_requirement: { type: 'integer', description: 'Qubits needed (Jordan-Wigner)' },
      ansatz_type: { type: 'string', description: 'Selected ansatz' },
      variational_parameters: { type: 'integer', description: 'Number of trainable parameters' },
      circuit_depth_per_iteration: { type: 'integer', description: 'Depth per VQE iteration' },
      optimizer: { type: 'string', description: 'Classical optimizer' },
      max_iterations: { type: 'integer', description: 'Max iterations' },
      convergence_threshold: { type: 'number', description: 'Convergence threshold Hartree' },
      error_mitigation_recommended: { type: 'array', items: { type: 'string' }, description: 'Recommended error mitigation techniques' },
      energy_unit: { type: 'string', description: 'Energy unit (Hartree)' },
      expected_accuracy: { type: 'number', description: 'Expected accuracy fraction' },
      convergence_behavior: { type: 'string', description: 'Expected convergence profile' },
      resource_estimate_hours: { type: 'number', description: 'Estimated GPU-QPU compute hours' },
    },
    examples: [
      {
        input: JSON.stringify({ molecule: 'H2O', basis_set: 'sto-3g', ansatz_type: 'UCCSD', optimizer: 'COBYLA', max_iterations: 500, convergence_threshold: 1e-5, noise_model: 'depolarizing' }),
        output: JSON.stringify({ config_id: 'VQE-38421', qubit_requirement: 20, variational_parameters: 58, expected_accuracy: 0.832 }),
      },
      {
        input: JSON.stringify({ molecule: 'LiH', basis_set: '6-31g', ansatz_type: 'HardwareEfficient', optimizer: 'SPSA', max_iterations: 1000, convergence_threshold: 1e-6 }),
        output: JSON.stringify({ config_id: 'VQE-90218', qubit_requirement: 12, variational_parameters: 48, resource_estimate_hours: 14.7 }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatVqeConfigReport(analyzeVqeConfig(JSON.parse(args.input_data) as VqeConfigInput))
    },
  }))

  // Tool 3: error_correction_mapper
  tools.register(defineTool({
    name: 'error_correction_mapper',
    description: 'Map a quantum error correction code (surface, color, toric, Steane, Shor, GKP, LDPC) to specific hardware parameters. Returns logical error rate, physical qubit overhead, decoder type and latency, syndrome extraction rounds, error budget breakdown, and fault-tolerance recommendations.',
    inputSchema: {
      type: 'object',
      required: ['code_family', 'code_distance', 'physical_error_rate', 'logical_qubit_target', 'syndrome_method'],
      properties: {
        code_family: { type: 'string', enum: ['surface', 'color', 'toric', 'steane', 'shor', 'bosonic_GKP', 'ldpc'], description: 'QEC code family' },
        code_distance: { type: 'integer', minimum: 3, maximum: 21, description: 'Code distance (odd numbers preferred)' },
        physical_error_rate: { type: 'number', description: 'Physical gate error rate (e.g. 1e-3)' },
        logical_qubit_target: { type: 'integer', minimum: 1, description: 'Number of logical qubits needed' },
        syndrome_method: { type: 'string', enum: ['shor', 'steane', 'flag', 'single_shot'], description: 'Syndrome extraction method' },
      },
    },
    outputSchema: {
      mapping_id: { type: 'string', description: 'QEC mapping ID' },
      code_family: { type: 'string', description: 'Code family used' },
      code_distance: { type: 'integer', description: 'Code distance' },
      logical_error_rate: { type: 'number', description: 'Estimated logical error rate per syndrome round' },
      threshold_surpassed: { type: 'boolean', description: 'True if physical error rate is below threshold' },
      physical_qubits_per_logical: { type: 'integer', description: 'Physical qubits per logical qubit' },
      total_physical_qubits: { type: 'integer', description: 'Total physical qubits required' },
      syndrome_extraction_rounds: { type: 'integer', description: 'Syndrome extraction rounds needed' },
      decoder_type: { type: 'string', description: 'Decoder algorithm name' },
      decoder_latency_ns: { type: 'number', description: 'Decoder latency in nanoseconds' },
      logical_fidelity_estimate: { type: 'number', description: 'Estimated logical state fidelity' },
      overhead_ratio: { type: 'number', description: 'Physical-to-logical qubit ratio' },
      error_budget_breakdown: { type: 'object', description: 'Error budget components: single_qubit_gate, two_qubit_gate, measurement, idling, state_preparation' },
      recommendations: { type: 'array', items: { type: 'string' }, description: 'Hardware and code optimization recommendations' },
    },
    examples: [
      {
        input: JSON.stringify({ code_family: 'surface', code_distance: 7, physical_error_rate: 0.001, logical_qubit_target: 4, syndrome_method: 'single_shot' }),
        output: JSON.stringify({ mapping_id: 'ECM-55329', logical_error_rate: '1.00e-15', threshold_surpassed: true, physical_qubits_per_logical: 98, total_physical_qubits: 392 }),
      },
      {
        input: JSON.stringify({ code_family: 'bosonic_GKP', code_distance: 3, physical_error_rate: 0.005, logical_qubit_target: 2, syndrome_method: 'flag' }),
        output: JSON.stringify({ mapping_id: 'ECM-27841', total_physical_qubits: 2, decoder_type: 'Maximum-likelihood GKP decoder', decoder_latency_ns: 137 }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatErrorCorrectionReport(analyzeErrorCorrection(args as unknown as ErrorCorrectionInput))
    },
  }))

  // Tool 4: quantum_optimizer
  tools.register(defineTool({
    name: 'quantum_optimizer',
    description: 'Encode a combinatorial optimization problem (MaxCut, TSP, portfolio, scheduling, SAT, knapsack, vehicle routing) into Ising/QUBO/PUBO Hamiltonians for QAOA, quantum annealing, or VQE-based optimization. Returns qubit requirements, Hamiltonian terms, encoding map, expected approximation ratio, penalty weights, and mixer selection.',
    inputSchema: {
      type: 'object',
      required: ['problem_type', 'variable_count', 'constraint_count', 'hamiltonian_type', 'algorithm'],
      properties: {
        problem_type: { type: 'string', enum: ['maxcut', 'tsp', 'portfolio', 'scheduling', 'sat', 'knapsack', 'vehicle_routing'], description: 'Optimization problem class' },
        variable_count: { type: 'integer', description: 'Number of decision variables' },
        constraint_count: { type: 'integer', description: 'Number of constraints' },
        hamiltonian_type: { type: 'string', enum: ['Ising', 'QUBO', 'PUBO'], description: 'Hamiltonian representation' },
        algorithm: { type: 'string', enum: ['QAOA', 'quantum_annealing', 'VQE_opt', 'Grover_adaptive'], description: 'Quantum algorithm variant' },
        penalty_weight: { type: 'number', description: 'Constraint penalty weight (optional, auto-tuned if omitted)' },
        mixer_type: { type: 'string', enum: ['standard', 'XY', 'controlled_phase'], description: 'QAOA mixer Hamiltonian (optional, auto-selected if omitted)' },
      },
    },
    outputSchema: {
      encoding_id: { type: 'string', description: 'Optimizer encoding ID' },
      problem_type: { type: 'string', description: 'Problem class' },
      hamiltonian_type: { type: 'string', description: 'Ising/QUBO/PUBO form' },
      qubits_required: { type: 'integer', description: 'Number of qubits needed' },
      terms_in_hamiltonian: { type: 'integer', description: 'Total Pauli terms or quadratic terms' },
      p_qaoa_layers: { type: 'integer', description: 'QAOA depth parameter p' },
      classical_variables: { type: 'integer', description: 'Number of classical decision variables' },
      penalty_weight_applied: { type: 'number', description: 'Effective penalty weight' },
      ground_state_energy_estimate: { type: 'number', description: 'Estimated ground-state energy' },
      approximation_ratio_expected: { type: 'number', description: 'Expected approximation ratio vs. optimal' },
      encoding_map: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            variable_name: { type: 'string' },
            qubit_index: { type: 'integer' },
            hamiltonian_coeff: { type: 'number' },
            constraint_applied: { type: 'boolean' },
          },
        },
        description: 'Variable-to-qubit mapping and Hamiltonian coefficients',
      },
      mixer_type: { type: 'string', description: 'Selected mixer Hamiltonian' },
      optimization_rounds_estimate: { type: 'integer', description: 'Estimated optimization iterations' },
      feasibility_notes: { type: 'array', items: { type: 'string' }, description: 'Feasibility analysis and recommendations' },
    },
    examples: [
      {
        input: JSON.stringify({ problem_type: 'maxcut', variable_count: 24, constraint_count: 0, hamiltonian_type: 'Ising', algorithm: 'QAOA' }),
        output: JSON.stringify({ encoding_id: 'QOPT-77283', qubits_required: 48, p_qaoa_layers: 6, approximation_ratio_expected: 0.923 }),
      },
      {
        input: JSON.stringify({ problem_type: 'portfolio', variable_count: 10, constraint_count: 5, hamiltonian_type: 'QUBO', algorithm: 'quantum_annealing', penalty_weight: 3.5 }),
        output: JSON.stringify({ encoding_id: 'QOPT-31059', qubits_required: 10, penalty_weight_applied: 3.5, mixer_type: 'standard' }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatQuantumOptimizerReport(analyzeQuantumOptimizer(args as unknown as QuantumOptimizerInput))
    },
  }))

  // Tool 5: qml_model_setup
  tools.register(defineTool({
    name: 'qml_model_setup',
    description: 'Build a quantum machine learning model architecture for classification, regression, generative, reinforcement, or clustering tasks. Configure data embedding (amplitude, angle, IQP, tensor-network, data-reuploading), variational layers, measurement basis, classical postprocessing, and training shot budget.',
    inputSchema: {
      type: 'object',
      required: ['task_type', 'feature_dimension', 'quantum_ansatz', 'measurement_basis', 'classical_postprocessing', 'training_shots', 'noise_aware_training'],
      properties: {
        task_type: { type: 'string', enum: ['classification', 'regression', 'generative', 'reinforcement', 'clustering'], description: 'ML task category' },
        feature_dimension: { type: 'integer', description: 'Input feature dimensionality' },
        num_classes: { type: 'integer', description: 'Number of output classes for classification (optional)' },
        quantum_ansatz: { type: 'string', enum: ['amplitude_embedding', 'angle_embedding', 'IQP', 'tensor_network', '_data_reuploading'], description: 'Quantum data encoding and ansatz' },
        measurement_basis: { type: 'string', enum: ['Z', 'X', 'Y', 'bell', 'full_tomography'], description: 'Pauli measurement basis' },
        classical_postprocessing: { type: 'string', enum: ['none', 'dense_128', 'dense_256', 'resnet_adapter', 'lstm_adapter'], description: 'Classical NN head (optional)' },
        training_shots: { type: 'integer', description: 'Number of measurement shots per circuit evaluation' },
        noise_aware_training: { type: 'boolean', description: 'Enable noise-aware gradient estimation' },
      },
    },
    outputSchema: {
      model_id: { type: 'string', description: 'QML model ID' },
      task_type: { type: 'string', description: 'ML task category' },
      quantum_ansatz: { type: 'string', description: 'Selected ansatz' },
      total_variational_params: { type: 'integer', description: 'Total trainable parameters' },
      circuit_depth: { type: 'integer', description: 'Total circuit depth' },
      qubit_requirement: { type: 'integer', description: 'Number of qubits needed' },
      measurement_basis: { type: 'string', description: 'Measurement basis' },
      expectation_value_method: { type: 'string', description: 'Observable estimation approach' },
      layers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            layer_index: { type: 'integer' },
            layer_type: { type: 'string', enum: ['encoding', 'variational', 'entanglement', 'measurement'] },
            qubits_used: { type: 'integer' },
            parameter_count: { type: 'integer' },
            unitary_description: { type: 'string' },
          },
        },
        description: 'Layer-wise architecture',
      },
      classical_postprocessing: { type: 'string', description: 'Classical postprocessing head' },
      barren_plateau_risk: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Barren plateau susceptibility' },
      generalization_capacity: { type: 'string', description: 'Expected generalization assessment' },
      training_complexity: { type: 'string', description: 'Computational complexity per update' },
      measurement_shots: { type: 'integer', description: 'Shots per measurement' },
      noise_aware_training: { type: 'boolean', description: 'Noise-aware training flag' },
      observables: { type: 'array', items: { type: 'string' }, description: 'Observables to measure' },
    },
    examples: [
      {
        input: JSON.stringify({ task_type: 'classification', feature_dimension: 8, quantum_ansatz: 'angle_embedding', measurement_basis: 'Z', classical_postprocessing: 'dense_128', training_shots: 10000, noise_aware_training: true }),
        output: JSON.stringify({ model_id: 'QML-11284', qubit_requirement: 8, total_variational_params: 34, barren_plateau_risk: 'medium' }),
      },
      {
        input: JSON.stringify({ task_type: 'generative', feature_dimension: 64, quantum_ansatz: 'amplitude_embedding', measurement_basis: 'full_tomography', classical_postprocessing: 'none', training_shots: 100000, noise_aware_training: false }),
        output: JSON.stringify({ model_id: 'QML-68340', qubit_requirement: 6, circuit_depth: 18, measurement_shots: 100000 }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatQmlModelReport(analyzeQmlModel(args as unknown as QmlModelInput))
    },
  }))

  // Tool 6: quantum_safe_migration_planner
  tools.register(defineTool({
    name: 'quantum_safe_migration_planner',
    description: 'Plan migration from current cryptographic primitives (RSA, ECC, AES, SHA) to NIST-post-quantum standards. Assesses vulnerability urgency, maps to Kyber/Dilithium/Falcon/SPHINCS+ replacements, builds phased timeline, identifies compliance gaps, and recommends hybrid transition strategy and crypto-agility framework.',
    inputSchema: {
      type: 'object',
      required: ['current_crypto', 'infrastructure_type', 'compliance_requirements', 'migration_deadline_years', 'risk_tolerance', 'budget_priority'],
      properties: {
        current_crypto: {
          type: 'array',
          items: { type: 'string', enum: ['RSA-2048', 'RSA-4096', 'ECC-P256', 'ECC-P384', 'AES-128', 'AES-256', 'SHA-256', 'SHA-3'] },
          description: 'Currently deployed cryptographic schemes',
        },
        infrastructure_type: { type: 'string', enum: ['web_pkca', 'vpn', 'iot', 'blockchain', 'cloud_hsm', 'code_signing', 'mixed'], description: 'Deployment context' },
        compliance_requirements: {
          type: 'array',
          items: { type: 'string', enum: ['FIPS-140-3', 'NIST-PQC', 'Common-Criteria', 'GDPR', 'PCI-DSS', 'SOX'] },
          description: 'Regulatory frameworks to satisfy',
        },
        migration_deadline_years: { type: 'number', description: 'Years until completion required' },
        risk_tolerance: { type: 'string', enum: ['conservative', 'moderate', 'aggressive'], description: 'Risk appetite' },
        budget_priority: { type: 'string', enum: ['cost_driven', 'security_driven', 'balanced'], description: 'Budget priority mode' },
      },
    },
    outputSchema: {
      plan_id: { type: 'string', description: 'Migration plan ID' },
      overall_risk_score: { type: 'number', description: 'Composite risk score 0-100' },
      vulnerability_count: { type: 'integer', description: 'Number of critical/high urgency items' },
      migration_items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            current_scheme: { type: 'string' },
            replacement_scheme: { type: 'string' },
            migration_phase: { type: 'integer', enum: [1, 2, 3, 4] },
            urgency: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            effort_estimate_person_months: { type: 'integer' },
            quantum_threat_level: { type: 'string', enum: ['imminent', 'near_term', 'long_term'] },
          },
        },
        description: 'Per-scheme migration items',
      },
      hybrid_transition_strategy: { type: 'string', description: 'Dual-certificate hybrid model' },
      compliance_gaps: { type: 'array', items: { type: 'string' }, description: 'Compliance shortfalls' },
      milestone_timeline: { type: 'array', items: { type: 'string' }, description: 'Phased migration steps' },
      total_effort_person_months: { type: 'integer', description: 'Total person-month effort' },
      recommended_priority_order: { type: 'array', items: { type: 'string' }, description: 'Recommended replacement sequence' },
      crypto_agility_framework: { type: 'string', description: 'Recommended crypto-agility architecture' },
    },
    examples: [
      {
        input: JSON.stringify({ current_crypto: ['RSA-2048', 'ECC-P256', 'AES-128'], infrastructure_type: 'web_pkca', compliance_requirements: ['NIST-PQC', 'FIPS-140-3'], migration_deadline_years: 4, risk_tolerance: 'conservative', budget_priority: 'security_driven' }),
        output: JSON.stringify({ plan_id: 'QSM-44291', overall_risk_score: 65, vulnerability_count: 2, total_effort_person_months: 18 }),
      },
      {
        input: JSON.stringify({ current_crypto: ['ECC-P384', 'AES-256'], infrastructure_type: 'iot', compliance_requirements: ['NIST-PQC'], migration_deadline_years: 5, risk_tolerance: 'moderate', budget_priority: 'balanced' }),
        output: JSON.stringify({ plan_id: 'QSM-78921', total_effort_person_months: 8, crypto_agility_framework: 'pkcs11-engine' }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatMigrationReport(analyzeQuantumSafeMigration(args as unknown as QuantumSafeMigrationInput))
    },
  }))

  // Tool 7: quantum_hardware_selector
  tools.register(defineTool({
    name: 'quantum_hardware_selector',
    description: 'Recommend the best quantum hardware platform (superconducting, trapped-ion, neutral-atom, photonic, topological) for a given use case. Evaluates qubit count, 2Q gate fidelity, T1 coherence, gate speed, connectivity, maturity against your requirements. Returns scored candidates, top pick with score breakdown, infrastructure needs, and risk assessment.',
    inputSchema: {
      type: 'object',
      required: ['use_case', 'required_logical_qubits', 'required_circuit_depth', 'min_gate_fidelity', 'connectivity_requirement', 'operational_constraints', 'budget_millions_usd'],
      properties: {
        use_case: { type: 'string', enum: ['chemistry', 'optimization', 'ml', 'simulation', 'cryptography', 'sensing'], description: 'Primary application domain' },
        required_logical_qubits: { type: 'integer', description: 'Minimum logical qubits required' },
        required_circuit_depth: { type: 'integer', description: 'Target circuit depth' },
        min_gate_fidelity: { type: 'number', description: 'Minimum 2Q gate fidelity threshold (e.g. 0.99)' },
        max_coherence_time_us: { type: 'number', description: 'Minimum T1 coherence time in microseconds (optional)' },
        connectivity_requirement: { type: 'string', enum: ['nearest_neighbor', 'all_to_all', 'high_degree'], description: 'Qubit connectivity need' },
        operational_constraints: {
          type: 'array',
          items: { type: 'string', enum: ['cryogenic', 'room_temp', 'optical_table', 'portable', 'fiber_coupled'] },
          description: 'Physical/operational constraints',
        },
        budget_millions_usd: { type: 'number', description: 'Budget cap in millions USD' },
      },
    },
    outputSchema: {
      selection_id: { type: 'string', description: 'Hardware selection ID' },
      use_case: { type: 'string', description: 'Requested use case' },
      candidates: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            platform: { type: 'string' },
            qubit_count: { type: 'integer' },
            two_qubit_gate_fidelity: { type: 'number' },
            t1_coherence_us: { type: 'number' },
            gate_speed_ns: { type: 'number' },
            connectivity: { type: 'string' },
            maturity: { type: 'string', enum: ['production', 'pilot', 'research'] },
            score: { type: 'number' },
          },
        },
        description: 'Scored platform candidates',
      },
      top_candidate: { type: 'string', description: 'Highest-scoring platform' },
      score_breakdown: { type: 'object', description: 'Score components: qubit_capacity, gate_fidelity, connectivity_match, maturity_bonus, speed_factor' },
      qubit_overhead_factor: { type: 'number', description: 'Qubit overhead for error correction/mitigation' },
      effective_logical_qubits: { type: 'integer', description: 'Effective usable logical qubits after overhead' },
      estimated_system_cost_millions: { type: 'number', description: 'Estimated platform cost in millions USD' },
      infrastructure_requirements: { type: 'array', items: { type: 'string' }, description: 'Facility and equipment needs' },
      roadmap_alignment: { type: 'string', description: 'Deployment readiness timeline' },
      risk_factors: { type: 'array', items: { type: 'string' }, description: 'Identified platform risks' },
    },
    examples: [
      {
        input: JSON.stringify({ use_case: 'chemistry', required_logical_qubits: 50, required_circuit_depth: 500, min_gate_fidelity: 0.995, connectivity_requirement: 'nearest_neighbor', operational_constraints: ['cryogenic'], budget_millions_usd: 30 }),
        output: JSON.stringify({ selection_id: 'HWS-21947', top_candidate: 'IBM Quantum Heron (133 qubits)', estimated_system_cost_millions: 28.5 }),
      },
      {
        input: JSON.stringify({ use_case: 'optimization', required_logical_qubits: 20, required_circuit_depth: 100, min_gate_fidelity: 0.99, connectivity_requirement: 'all_to_all', operational_constraints: ['room_temp'], budget_millions_usd: 15 }),
        output: JSON.stringify({ selection_id: 'HWS-66138', top_candidate: 'Quantinuum H2 (56 qubits trapped-ion)', effective_logical_qubits: 5, infrastructure_requirements: ['laser-systems'] }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatHardwareReport(analyzeHardwareSelection(args as unknown as HardwareSelectionInput))
    },
  }))

  // Tool 8: nisq_algorithm_advisor
  tools.register(defineTool({
    name: 'nisq_algorithm_advisor',
    description: 'Recommend the best NISQ-era algorithm (VQE, QAOA, VQLS, Quantum Boltzmann Machine, qGAN, Quantum Walk) for a given problem category. Scores candidates against your qubit budget, depth budget, error-mitigation budget, and classical compute availability. Returns ranked candidates, feasibility assessment, error-mitigation strategy, hybrid decomposition, and resource tradeoffs.',
    inputSchema: {
      type: 'object',
      required: ['problem_category', 'qubit_budget', 'depth_budget', 'error_mitigation_budget', 'classical_compute_available', 'accuracy_target'],
      properties: {
        problem_category: { type: 'string', enum: ['quantum_chemistry', 'combinatorial_opt', 'linear_algebra', 'sampling', 'differential_eq', 'machine_learning'], description: 'Problem domain' },
        qubit_budget: { type: 'integer', description: 'Qubit count available on target hardware' },
        depth_budget: { type: 'integer', description: 'Maximum circuit depth tolerable' },
        error_mitigation_budget: { type: 'string', enum: ['none', 'low', 'medium', 'high'], description: 'Error mitigation investment level' },
        classical_compute_available: { type: 'string', enum: ['limited', 'moderate', 'abundant'], description: 'Classical support resources' },
        accuracy_target: { type: 'number', description: 'Desired accuracy as fraction (0-1)' },
      },
    },
    outputSchema: {
      advisory_id: { type: 'string', description: 'Advisory ID' },
      problem_category: { type: 'string', description: 'Problem domain' },
      candidates: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            algorithm_name: { type: 'string' },
            qubit_requirement: { type: 'integer' },
            depth_requirement: { type: 'integer' },
            classical_components: { type: 'array', items: { type: 'string' } },
            error_mitigation_needed: { type: 'array', items: { type: 'string' } },
            suitability_score: { type: 'number' },
            expected_speedup: { type: 'string' },
            noise_sensitivity: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
        },
        description: 'Ranked NISQ algorithm candidates',
      },
      recommended_algorithm: { type: 'string', description: 'Top-ranked NISQ algorithm' },
      feasibility_assessment: { type: 'string', description: 'Feasibility verdict' },
      error_mitigation_strategy: { type: 'string', description: 'Recommended error mitigation stack' },
      hybrid_decomposition: { type: 'string', description: 'Quantum-classical decomposition description' },
      resource_tradeoffs: { type: 'array', items: { type: 'string' }, description: 'Resource allocation guidance' },
      accuracy_achievable: { type: 'number', description: 'Realistic accuracy based on noise' },
      circuit_generation_platforms: { type: 'array', items: { type: 'string' }, description: 'Platform recommendations' },
      key_references: { type: 'array', items: { type: 'string' }, description: 'Key academic references' },
    },
    examples: [
      {
        input: JSON.stringify({ problem_category: 'combinatorial_opt', qubit_budget: 50, depth_budget: 200, error_mitigation_budget: 'medium', classical_compute_available: 'moderate', accuracy_target: 0.90 }),
        output: JSON.stringify({ advisory_id: 'NISQ-33871', recommended_algorithm: 'Quantum Approximate Optimization (QAOA)', accuracy_achievable: 0.88 }),
      },
      {
        input: JSON.stringify({ problem_category: 'quantum_chemistry', qubit_budget: 20, depth_budget: 500, error_mitigation_budget: 'high', classical_compute_available: 'abundant', accuracy_target: 0.95 }),
        output: JSON.stringify({ advisory_id: 'NISQ-99102', recommended_algorithm: 'Variational Quantum Eigensolver (VQE)', feasibility_assessment: 'FEASIBLE', circuit_generation_platforms: ['IBM Qiskit Runtime', 'Amazon Braket'] }),
      },
    ],
    async execute(args: { input_data: string }) {
      return formatNisqAdvisorReport(analyzeNisqAdvisor(args as unknown as NisqAdvisorInput))
    },
  }))

  console.log('[dsh-tool-quantumapp] Loaded v' + VERSION + ' --- 8 quantum computing application tools active')
  console.log('  Tools: quantum_circuit_designer, vqe_configurator, error_correction_mapper, quantum_optimizer, qml_model_setup, quantum_safe_migration_planner, quantum_hardware_selector, nisq_algorithm_advisor')
}
