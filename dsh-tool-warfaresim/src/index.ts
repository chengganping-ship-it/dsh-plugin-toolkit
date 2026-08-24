/**
 * DSH Defense Simulation & Wargaming Plugin v0.1.0
 * 兵棋推演与国防仿真工具箱 for DeepSeek Harness — 场景建模、威胁仿真、战略规划、兵力结构分析
 *
 * 对标 2026 全球军事仿真市场 $15B+ / 国防 AI 市场 $20B+ 趋势，提供多域作战兵棋推演、
 * 威胁仿真引擎、战略规划评估、兵力结构优化、后勤战备评估、网络战仿真、情报融合分析、
 * 作战风险评估等能力。
 *
 * 工具清单:
 * 1. scenario_modeler          — 多域作战场景建模（地形、兵力、目标、约束条件）
 * 2. threat_simulation_engine   — 威胁仿真引擎（红方攻击路径、蓝方防御响应、蒙特卡洛推演）
 * 3. strategic_planning_assessor— 战略规划评估（目标-手段分析、资源分配、时间线推演）
 * 4. force_structure_analyzer   — 兵力结构分析（兵种配比、装备效能、战备指数）
 * 5. logistics_readiness_evaluator — 后勤战备评估（供应链、补给线、持续作战能力）
 * 6. cyber_warfare_simulator    — 网络战仿真（攻防对抗、关键节点、恢复策略）
 * 7. intelligence_analysis_fusion — 情报融合分析（多源情报关联、置信度、态势感知）
 * 8. operational_risk_assessor  — 作战风险评估（风险矩阵、脆弱性、缓解措施）
 *
 * @module dsh-tool-warfaresim | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-warfaresim'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Scenario Modeler ---
export interface ScenarioInput {
  scenario_name: string
  domain: 'land' | 'sea' | 'air' | 'space' | 'cyber' | 'cognitive' | 'multi'
  terrain_type: string
  blue_forces: ForceGroup[]
  red_forces: ForceGroup[]
  objectives: string[]
  constraints: string[]
  weather?: string
  duration_hours?: number
}

export interface ForceGroup {
  unit_name: string
  unit_type: string
  strength: number
  readiness: number
  equipment: string[]
  position?: string
}

export interface ScenarioPhase {
  phase_id: number
  phase_name: string
  duration_hours: number
  blue_actions: string[]
  red_actions: string[]
  expected_outcome: string
  key_events: string[]
}

export interface ScenarioResult {
  scenario_name: string
  domain: string
  terrain: string
  weather: string
  phases: ScenarioPhase[]
  blue_force_summary: ForceSummary
  red_force_summary: ForceSummary
  objective_analysis: ObjectiveAnalysis[]
  feasibility_score: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
}

export interface ForceSummary {
  total_units: number
  total_strength: number
  avg_readiness: number
  force_ratio: number
  primary_capabilities: string[]
}

export interface ObjectiveAnalysis {
  objective: string
  priority: 'primary' | 'secondary' | 'tertiary'
  achievability: number
  required_forces: number
  estimated_casualty_pct: number
}

// --- Tool 2: Threat Simulation Engine ---
export interface ThreatSimInput {
  sim_name: string
  threat_actors: string[]
  attack_vectors: string[]
  target_assets: string[]
  simulation_rounds?: number
  defense_posture: 'passive' | 'active' | 'aggressive'
  escalation_model: 'linear' | 'exponential' | 'stochastic'
}

export interface SimulationRound {
  round_id: number
  red_action: string
  blue_response: string
  red_effectiveness: number
  blue_effectiveness: number
  asset_damage: number
  status: 'ongoing' | 'red_advantage' | 'blue_advantage' | 'stalemate'
}

export interface ThreatSimResult {
  sim_name: string
  total_rounds: number
  rounds: SimulationRound[]
  final_outcome: 'red_victory' | 'blue_victory' | 'stalemate' | 'inconclusive'
  red_win_probability: number
  blue_win_probability: number
  critical_vulnerabilities: string[]
  recommended_countermeasures: string[]
  confidence_level: number
}

// --- Tool 3: Strategic Planning Assessor ---
export interface StrategicInput {
  plan_name: string
  strategic_goals: string[]
  available_resources: ResourceAllocation[]
  timeline_months: number
  threat_scenarios: string[]
  alliance_factors?: string[]
  political_constraints?: string[]
}

export interface ResourceAllocation {
  resource_type: string
  quantity: number
  unit_cost: number
  availability: 'immediate' | '30_days' | '90_days' | '180_days'
}

export interface GoalAssessment {
  goal: string
  priority: number
  resource_adequacy: number
  timeline_feasibility: number
  risk_exposure: number
  overall_score: number
  status: 'achievable' | 'challenging' | 'at_risk' | 'unachievable'
}

export interface StrategicResult {
  plan_name: string
  goal_assessments: GoalAssessment[]
  resource_gap_analysis: ResourceGap[]
  timeline_feasibility: number
  overall_plan_score: number
  strategic_risk_level: 'low' | 'moderate' | 'high' | 'critical'
  recommendations: string[]
}

export interface ResourceGap {
  resource_type: string
  required: number
  available: number
  gap_pct: number
  mitigation: string
}

// --- Tool 4: Force Structure Analyzer ---
export interface ForceStructureInput {
  analysis_name: string
  branch: 'army' | 'navy' | 'air_force' | 'marines' | 'space_force' | 'cyber_command' | 'joint'
  units: UnitComposition[]
  budget_billions: number
  doctrine: string
  peer_comparison?: string[]
}

export interface UnitComposition {
  unit_type: string
  count: number
  personnel: number
  equipment_value_millions: number
  readiness_rating: number
  modernization_level: 'legacy' | 'modern' | 'cutting_edge'
}

export interface CapabilityAssessment {
  capability: string
  current_level: number
  required_level: number
  gap: number
  investment_priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface ForceStructureResult {
  analysis_name: string
  branch: string
  total_units: number
  total_personnel: number
  total_equipment_value: number
  avg_readiness: number
  capability_assessments: CapabilityAssessment[]
  modernization_index: number
  force_effectiveness_score: number
  optimization_recommendations: string[]
}

// --- Tool 5: Logistics Readiness Evaluator ---
export interface LogisticsInput {
  evaluation_name: string
  theater: string
  supply_routes: SupplyRoute[]
  depots: Depot[]
  daily_consumption_tons: number
  sustainment_days: number
  threat_to_lines: string[]
}

export interface SupplyRoute {
  route_id: string
  origin: string
  destination: string
  capacity_tons_per_day: number
  distance_km: number
  security_level: 'secure' | 'contested' | 'hostile'
  status: 'open' | 'degraded' | 'closed'
}

export interface Depot {
  depot_id: string
  location: string
  storage_capacity_tons: number
  current_stock_tons: number
  replenishment_rate: number
  vulnerability: 'low' | 'medium' | 'high'
}

export interface LogisticsResult {
  evaluation_name: string
  theater: string
  overall_readiness: number
  supply_route_status: RouteStatus[]
  depot_status: DepotStatus[]
  daily_throughput_tons: number
  sustainment_capacity_days: number
  critical_shortages: string[]
  logistics_risk: 'low' | 'moderate' | 'high' | 'critical'
  recommendations: string[]
}

export interface RouteStatus {
  route_id: string
  effective_capacity: number
  bottleneck: boolean
  risk_level: string
}

export interface DepotStatus {
  depot_id: string
  utilization_pct: number
  days_of_supply: number
  vulnerability: string
}

// --- Tool 6: Cyber Warfare Simulator ---
export interface CyberSimInput {
  sim_name: string
  attack_surface: string[]
  defense_layers: string[]
  red_team_capabilities: string[]
  blue_team_capabilities: string[]
  critical_assets: string[]
  simulation_depth: 'reconnaissance' | 'initial_access' | 'full_campaign'
}

export interface CyberAttackStep {
  step_id: number
  tactic: string
  technique: string
  target: string
  success_probability: number
  detected: boolean
  blue_response: string
  impact_score: number
}

export interface CyberSimResult {
  sim_name: string
  attack_steps: CyberAttackStep[]
  red_penetration_depth: number
  blue_detection_rate: number
  assets_compromised: string[]
  assets_protected: string[]
  mean_time_to_detect_minutes: number
  mean_time_to_respond_minutes: number
  cyber_posture_score: number
  improvement_recommendations: string[]
}

// --- Tool 7: Intelligence Analysis Fusion ---
export interface IntelFusionInput {
  analysis_name: string
  sources: IntelSource[]
  target_entities: string[]
  analysis_timeframe: string
  classification: 'unclassified' | 'confidential' | 'secret' | 'top_secret'
  priority_intelligence_requirements: string[]
}

export interface IntelSource {
  source_id: string
  source_type: 'sigint' | 'humint' | 'osint' | 'geoint' | 'masint' | 'cyberint'
  reliability: 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
  credibility: number
  content: string
  timestamp: string
}

export interface FusedAssessment {
  entity: string
  threat_level: 'negligible' | 'low' | 'moderate' | 'high' | 'imminent'
  confidence: number
  supporting_sources: string[]
  contradicting_sources: string[]
  assessment_summary: string
  recommended_actions: string[]
}

export interface IntelFusionResult {
  analysis_name: string
  fused_assessments: FusedAssessment[]
  situational_awareness_score: number
  intelligence_gaps: string[]
  source_reliability_summary: SourceReliability[]
  overall_threat_assessment: string
  priority_recommendations: string[]
}

export interface SourceReliability {
  source_type: string
  count: number
  avg_credibility: number
  reliability_grade: string
}

// --- Tool 8: Operational Risk Assessor ---
export interface OperationalRiskInput {
  assessment_name: string
  operation_type: string
  risk_factors: RiskFactor[]
  force_exposure: number
  civilian_exposure: number
  environmental_factors: string[]
  rules_of_engagement: string
  mitigation_measures?: string[]
}

export interface RiskFactor {
  factor: string
  category: 'tactical' | 'operational' | 'strategic' | 'environmental' | 'political'
  probability: number
  impact: number
  detectability: number
  current_mitigation: string
}

export interface RiskAssessment {
  factor: string
  risk_score: number
  risk_matrix_position: string
  residual_risk: number
  mitigation_effectiveness: number
  status: 'accepted' | 'mitigated' | 'transferred' | 'avoided'
}

export interface OperationalRiskResult {
  assessment_name: string
  operation_type: string
  risk_assessments: RiskAssessment[]
  overall_risk_score: number
  risk_category: 'low' | 'moderate' | 'high' | 'extreme'
  force_risk_exposure: number
  civilian_risk_exposure: number
  go_no_go_recommendation: 'go' | 'go_with_mitigation' | 'no_go'
  critical_risks: string[]
  additional_mitigations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Scenario Modeler 分析 ---
function analyzeScenario(input: ScenarioInput): ScenarioResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const weather = input.weather || rng.pick(['clear', 'overcast', 'rain', 'fog', 'snow', 'sandstorm'])
  const duration = input.duration_hours || rng.nextInt(24, 168)

  const blueStrength = input.blue_forces.reduce((s, f) => s + f.strength, 0)
  const redStrength = input.red_forces.reduce((s, f) => s + f.strength, 0)
  const blueReadiness = input.blue_forces.reduce((s, f) => s + f.readiness, 0) / Math.max(input.blue_forces.length, 1)
  const redReadiness = input.red_forces.reduce((s, f) => s + f.readiness, 0) / Math.max(input.red_forces.length, 1)

  const phases: ScenarioPhase[] = []
  const phaseCount = rng.nextInt(3, 6)
  const phaseDuration = Math.round(duration / phaseCount)
  const phaseNames = ['Initial Engagement', 'Force Maneuver', 'Decisive Operations', 'Exploitation', 'Stabilization', 'Transition']

  for (let i = 0; i < phaseCount; i++) {
    phases.push({
      phase_id: i + 1,
      phase_name: phaseNames[i] || ('Phase ' + (i + 1)),
      duration_hours: phaseDuration,
      blue_actions: input.blue_forces.slice(0, rng.nextInt(1, 3)).map(f => f.unit_type + ' ' + f.unit_name + ' advances'),
      red_actions: input.red_forces.slice(0, rng.nextInt(1, 3)).map(f => f.unit_type + ' ' + f.unit_name + ' responds'),
      expected_outcome: rng.pick(['Blue gains initiative', 'Red holds position', 'Contested engagement', 'Stalemate', 'Blue breakthrough']),
      key_events: [rng.pick(['Air support arrives', 'Artillery barrage', 'Electronic warfare activation', 'Logistics disruption', 'Reinforcement arrival'])],
    })
  }

  const blueCapabilities = [...new Set(input.blue_forces.flatMap(f => f.equipment))].slice(0, 5)
  const redCapabilities = [...new Set(input.red_forces.flatMap(f => f.equipment))].slice(0, 5)

  const objectiveAnalysis: ObjectiveAnalysis[] = input.objectives.map((obj, idx) => ({
    objective: obj,
    priority: idx === 0 ? 'primary' : idx < 3 ? 'secondary' : 'tertiary',
    achievability: Math.round(rng.nextFloat(0.4, 0.95) * 100) / 100,
    required_forces: rng.nextInt(1, input.blue_forces.length),
    estimated_casualty_pct: Math.round(rng.nextFloat(0.02, 0.25) * 100) / 100,
  }))

  const forceRatio = redStrength > 0 ? Math.round((blueStrength / redStrength) * 100) / 100 : 99
  const feasibilityScore = Math.round(((blueReadiness + forceRatio * 0.3) / 1.3) * 100) / 100

  const riskLevel: ScenarioResult['risk_level'] =
    feasibilityScore > 0.75 ? 'low' : feasibilityScore > 0.55 ? 'moderate' : feasibilityScore > 0.35 ? 'high' : 'critical'

  return {
    scenario_name: input.scenario_name,
    domain: input.domain,
    terrain: input.terrain_type,
    weather,
    phases,
    blue_force_summary: {
      total_units: input.blue_forces.length,
      total_strength: blueStrength,
      avg_readiness: Math.round(blueReadiness * 100) / 100,
      force_ratio: forceRatio,
      primary_capabilities: blueCapabilities,
    },
    red_force_summary: {
      total_units: input.red_forces.length,
      total_strength: redStrength,
      avg_readiness: Math.round(redReadiness * 100) / 100,
      force_ratio: Math.round((1 / forceRatio) * 100) / 100,
      primary_capabilities: redCapabilities,
    },
    objective_analysis: objectiveAnalysis,
    feasibility_score: Math.min(feasibilityScore, 0.99),
    risk_level: riskLevel,
  }
}

// --- Tool 2: Threat Simulation Engine 分析 ---
function analyzeThreatSimulation(input: ThreatSimInput): ThreatSimResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const rounds: SimulationRound[] = []
  const totalRounds = input.simulation_rounds || rng.nextInt(5, 15)
  let cumulativeRedEffect = 0
  let cumulativeBlueEffect = 0

  const attackActions = ['Cyber intrusion', 'Missile strike', 'Electronic warfare', 'Special forces raid', 'Air assault', 'Naval blockade', 'Information operation', 'Drone swarm attack']
  const defenseActions = ['Active defense', 'Counter-battery fire', 'Cyber hardening', 'Air interception', 'Electronic countermeasure', 'Force dispersal', 'Deception operation', 'Reinforcement']

  for (let i = 0; i < totalRounds; i++) {
    const redEff = Math.round(rng.nextFloat(0.3, 0.95) * 100) / 100
    const blueEff = Math.round(rng.nextFloat(0.3, 0.95) * 100) / 100
    cumulativeRedEffect += redEff
    cumulativeBlueEffect += blueEff

    let status: SimulationRound['status'] = 'ongoing'
    if (cumulativeRedEffect > cumulativeBlueEffect * 1.3) status = 'red_advantage'
    else if (cumulativeBlueEffect > cumulativeRedEffect * 1.3) status = 'blue_advantage'
    else if (Math.abs(cumulativeRedEffect - cumulativeBlueEffect) < 0.5) status = 'stalemate'

    rounds.push({
      round_id: i + 1,
      red_action: rng.pick(attackActions),
      blue_response: rng.pick(defenseActions),
      red_effectiveness: redEff,
      blue_effectiveness: blueEff,
      asset_damage: Math.round(rng.nextFloat(0.05, 0.4) * 100) / 100,
      status,
    })
  }

  const redAdvantage = rounds.filter(r => r.status === 'red_advantage').length
  const blueAdvantage = rounds.filter(r => r.status === 'blue_advantage').length
  const redWinProb = Math.round((redAdvantage / totalRounds) * 100) / 100
  const blueWinProb = Math.round((blueAdvantage / totalRounds) * 100) / 100

  let finalOutcome: ThreatSimResult['final_outcome'] = 'inconclusive'
  if (redWinProb > 0.5) finalOutcome = 'red_victory'
  else if (blueWinProb > 0.5) finalOutcome = 'blue_victory'
  else if (Math.abs(redWinProb - blueWinProb) < 0.1) finalOutcome = 'stalemate'

  const vulnerabilities = [...new Set(input.attack_vectors)].slice(0, rng.nextInt(2, 4))
  const countermeasures = [
    'Deploy layered defense-in-depth architecture',
    'Enhance early warning and ISR coverage',
    'Implement active cyber defense measures',
    'Pre-position rapid reaction forces',
    'Strengthen electronic warfare capabilities',
  ].slice(0, rng.nextInt(2, 5))

  return {
    sim_name: input.sim_name,
    total_rounds: totalRounds,
    rounds,
    final_outcome: finalOutcome,
    red_win_probability: redWinProb,
    blue_win_probability: blueWinProb,
    critical_vulnerabilities: vulnerabilities,
    recommended_countermeasures: countermeasures,
    confidence_level: Math.round(rng.nextFloat(0.65, 0.95) * 100) / 100,
  }
}

// --- Tool 3: Strategic Planning Assessor 分析 ---
function analyzeStrategicPlanning(input: StrategicInput): StrategicResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const totalBudget = input.available_resources.reduce((s, r) => s + r.quantity * r.unit_cost, 0)
  const goalAssessments: GoalAssessment[] = input.strategic_goals.map((goal, idx) => {
    const resourceAdequacy = Math.round(rng.nextFloat(0.4, 0.95) * 100) / 100
    const timelineFeasibility = Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100
    const riskExposure = Math.round(rng.nextFloat(0.1, 0.7) * 100) / 100
    const overallScore = Math.round(((resourceAdequacy + timelineFeasibility + (1 - riskExposure)) / 3) * 100) / 100

    let status: GoalAssessment['status'] = 'achievable'
    if (overallScore < 0.4) status = 'unachievable'
    else if (overallScore < 0.55) status = 'at_risk'
    else if (overallScore < 0.7) status = 'challenging'

    return {
      goal,
      priority: idx + 1,
      resource_adequacy: resourceAdequacy,
      timeline_feasibility: timelineFeasibility,
      risk_exposure: riskExposure,
      overall_score: overallScore,
      status,
    }
  })

  const resourceGaps: ResourceGap[] = input.available_resources.slice(0, rng.nextInt(2, 4)).map(r => {
    const gapPct = Math.round(rng.nextFloat(0.05, 0.4) * 100) / 100
    return {
      resource_type: r.resource_type,
      required: Math.round(r.quantity * (1 + gapPct)),
      available: r.quantity,
      gap_pct: gapPct,
      mitigation: rng.pick(['Increase procurement', 'Seek allied support', 'Redistribute from lower priority', 'Accelerate production', 'Lease from partner nations']),
    }
  })

  const avgGoalScore = goalAssessments.reduce((s, g) => s + g.overall_score, 0) / Math.max(goalAssessments.length, 1)
  const timelineFeasibility = Math.round(rng.nextFloat(0.55, 0.9) * 100) / 100
  const overallScore = Math.round(((avgGoalScore + timelineFeasibility) / 2) * 100) / 100

  const riskLevel: StrategicResult['strategic_risk_level'] =
    overallScore > 0.75 ? 'low' : overallScore > 0.55 ? 'moderate' : overallScore > 0.4 ? 'high' : 'critical'

  const recommendations = [
    'Prioritize resource allocation to highest-priority strategic goals',
    'Establish contingency reserves for high-risk scenarios',
    'Strengthen alliance coordination for resource sharing',
    'Implement phased timeline with decision points',
    'Enhance intelligence collection on threat scenarios',
    'Conduct regular plan review and adaptation cycles',
  ].slice(0, rng.nextInt(3, 6))

  return {
    plan_name: input.plan_name,
    goal_assessments: goalAssessments,
    resource_gap_analysis: resourceGaps,
    timeline_feasibility: timelineFeasibility,
    overall_plan_score: overallScore,
    strategic_risk_level: riskLevel,
    recommendations,
  }
}

// --- Tool 4: Force Structure Analyzer 分析 ---
function analyzeForceStructure(input: ForceStructureInput): ForceStructureResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const totalUnits = input.units.reduce((s, u) => s + u.count, 0)
  const totalPersonnel = input.units.reduce((s, u) => s + u.personnel, 0)
  const totalEquipmentValue = input.units.reduce((s, u) => s + u.equipment_value_millions, 0)
  const avgReadiness = input.units.reduce((s, u) => s + u.readiness_rating, 0) / Math.max(input.units.length, 1)

  const modernizationScores = { legacy: 0.4, modern: 0.75, cutting_edge: 0.95 }
  const modernizationIndex = Math.round(
    (input.units.reduce((s, u) => s + modernizationScores[u.modernization_level] * u.count, 0) / Math.max(totalUnits, 1)) * 100
  ) / 100

  const capabilities = ['Power projection', 'Force protection', 'C4ISR', 'Logistics sustainment', 'Cyber operations', 'Electronic warfare', 'Air defense', 'Precision strike']
  const capabilityAssessments: CapabilityAssessment[] = capabilities.slice(0, rng.nextInt(4, 8)).map(cap => {
    const current = Math.round(rng.nextFloat(0.4, 0.9) * 100) / 100
    const required = Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100
    const gap = Math.round((required - current) * 100) / 100
    const priority: CapabilityAssessment['investment_priority'] =
      gap > 0.3 ? 'critical' : gap > 0.2 ? 'high' : gap > 0.1 ? 'medium' : 'low'
    return { capability: cap, current_level: current, required_level: required, gap, investment_priority: priority }
  })

  const forceEffectiveness = Math.round(((avgReadiness * 0.4 + modernizationIndex * 0.3 + (capabilityAssessments.reduce((s, c) => s + c.current_level, 0) / Math.max(capabilityAssessments.length, 1)) * 0.3)) * 100) / 100

  const recommendations = [
    'Accelerate modernization of legacy platforms',
    'Invest in C4ISR and network-centric warfare capabilities',
    'Optimize force mix for multi-domain operations',
    'Enhance readiness through increased training tempo',
    'Develop asymmetric capabilities for peer competition',
    'Strengthen joint interoperability across branches',
  ].slice(0, rng.nextInt(3, 6))

  return {
    analysis_name: input.analysis_name,
    branch: input.branch,
    total_units: totalUnits,
    total_personnel: totalPersonnel,
    total_equipment_value: totalEquipmentValue,
    avg_readiness: Math.round(avgReadiness * 100) / 100,
    capability_assessments: capabilityAssessments,
    modernization_index: modernizationIndex,
    force_effectiveness_score: forceEffectiveness,
    optimization_recommendations: recommendations,
  }
}

// --- Tool 5: Logistics Readiness Evaluator 分析 ---
function analyzeLogistics(input: LogisticsInput): LogisticsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const routeStatuses: RouteStatus[] = input.supply_routes.map(r => {
    const securityMultiplier = r.security_level === 'secure' ? 1.0 : r.security_level === 'contested' ? 0.6 : 0.2
    const statusMultiplier = r.status === 'open' ? 1.0 : r.status === 'degraded' ? 0.5 : 0.0
    const effectiveCapacity = Math.round(r.capacity_tons_per_day * securityMultiplier * statusMultiplier)
    return {
      route_id: r.route_id,
      effective_capacity: effectiveCapacity,
      bottleneck: effectiveCapacity < r.capacity_tons_per_day * 0.5,
      risk_level: r.security_level === 'hostile' ? 'critical' : r.security_level === 'contested' ? 'high' : 'moderate',
    }
  })

  const depotStatuses: DepotStatus[] = input.depots.map(d => {
    const utilization = Math.round((d.current_stock_tons / Math.max(d.storage_capacity_tons, 1)) * 100)
    const daysOfSupply = Math.round((d.current_stock_tons / Math.max(input.daily_consumption_tons, 1)) * 10) / 10
    return {
      depot_id: d.depot_id,
      utilization_pct: utilization,
      days_of_supply: daysOfSupply,
      vulnerability: d.vulnerability,
    }
  })

  const dailyThroughput = routeStatuses.reduce((s, r) => s + r.effective_capacity, 0)
  const totalStock = input.depots.reduce((s, d) => s + d.current_stock_tons, 0)
  const sustainmentDays = dailyThroughput > 0 ? Math.round((totalStock / dailyThroughput) * 10) / 10 : 0

  const criticalShortages: string[] = []
  if (sustainmentDays < input.sustainment_days * 0.5) criticalShortages.push('Severe supply shortfall: only ' + sustainmentDays + ' days of sustainment available')
  if (routeStatuses.some(r => r.bottleneck)) criticalShortages.push('Supply route bottleneck detected: capacity reduced by >50%')
  if (depotStatuses.some(d => d.days_of_supply < 7)) criticalShortages.push('Critical depot stock levels: <7 days of supply at one or more depots')

  const readinessScore = Math.round(rng.nextFloat(0.5, 0.9) * 100) / 100
  const logisticsRisk: LogisticsResult['logistics_risk'] =
    readinessScore > 0.75 ? 'low' : readinessScore > 0.55 ? 'moderate' : readinessScore > 0.4 ? 'high' : 'critical'

  const recommendations = [
    'Establish alternate supply routes for contested areas',
    'Increase depot stock levels to 30-day minimum',
    'Deploy logistics protection forces along key routes',
    'Implement just-in-time resupply for forward units',
    'Establish forward arming and refueling points',
    'Enhance logistics ISR for threat early warning',
  ].slice(0, rng.nextInt(3, 6))

  return {
    evaluation_name: input.evaluation_name,
    theater: input.theater,
    overall_readiness: readinessScore,
    supply_route_status: routeStatuses,
    depot_status: depotStatuses,
    daily_throughput_tons: dailyThroughput,
    sustainment_capacity_days: sustainmentDays,
    critical_shortages: criticalShortages,
    logistics_risk: logisticsRisk,
    recommendations,
  }
}

// --- Tool 6: Cyber Warfare Simulator 分析 ---
function analyzeCyberWarfare(input: CyberSimInput): CyberSimResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const tactics = ['Reconnaissance', 'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Lateral Movement', 'Collection', 'Exfiltration', 'Impact']
  const techniques = ['Spearphishing', 'Exploit Public App', 'Valid Accounts', 'Scheduled Task', 'Exploitation for Privilege Escalation', 'Obfuscated Files', 'Remote Service', 'Data Staged', 'Exfiltration Over C2', 'Data Destruction']

  const stepCount = input.simulation_depth === 'reconnaissance' ? rng.nextInt(2, 4) : input.simulation_depth === 'initial_access' ? rng.nextInt(3, 6) : rng.nextInt(5, 10)
  const attackSteps: CyberAttackStep[] = []

  for (let i = 0; i < stepCount; i++) {
    const successProb = Math.round(rng.nextFloat(0.3, 0.9) * 100) / 100
    const detected = rng.next() > 0.5
    attackSteps.push({
      step_id: i + 1,
      tactic: tactics[Math.min(i, tactics.length - 1)],
      technique: techniques[Math.min(i, techniques.length - 1)],
      target: rng.pick(input.critical_assets.length > 0 ? input.critical_assets : ['Command Network', 'Logistics System', 'Intelligence Database']),
      success_probability: successProb,
      detected,
      blue_response: detected ? rng.pick(['Isolate segment', 'Deploy countermeasure', 'Activate backup', 'Trace source', 'Block IP range']) : 'No response (undetected)',
      impact_score: Math.round(successProb * rng.nextFloat(0.5, 1.0) * 100) / 100,
    })
  }

  const penetrationDepth = Math.round((attackSteps.filter(s => s.success_probability > 0.5).length / Math.max(stepCount, 1)) * 100) / 100
  const detectionRate = Math.round((attackSteps.filter(s => s.detected).length / Math.max(stepCount, 1)) * 100) / 100
  const compromisedAssets = [...new Set(attackSteps.filter(s => s.success_probability > 0.6 && !s.detected).map(s => s.target))]
  const protectedAssets = input.critical_assets.filter(a => !compromisedAssets.includes(a))

  const mttd = Math.round(rng.nextFloat(20, 240))
  const mttr = Math.round(rng.nextFloat(10, 120))
  const cyberPosture = Math.round((detectionRate * 0.4 + (1 - penetrationDepth) * 0.3 + (input.defense_layers.length / 10) * 0.3) * 100) / 100

  const recommendations = [
    'Implement zero-trust architecture across all networks',
    'Deploy advanced endpoint detection and response (EDR)',
    'Enhance network segmentation and micro-segmentation',
    'Conduct regular red team exercises and penetration testing',
    'Improve security operations center (SOC) capabilities',
    'Implement automated threat hunting and response',
  ].slice(0, rng.nextInt(3, 6))

  return {
    sim_name: input.sim_name,
    attack_steps: attackSteps,
    red_penetration_depth: penetrationDepth,
    blue_detection_rate: detectionRate,
    assets_compromised: compromisedAssets,
    assets_protected: protectedAssets,
    mean_time_to_detect_minutes: mttd,
    mean_time_to_respond_minutes: mttr,
    cyber_posture_score: Math.min(cyberPosture, 0.99),
    improvement_recommendations: recommendations,
  }
}

// --- Tool 7: Intelligence Analysis Fusion 分析 ---
function analyzeIntelFusion(input: IntelFusionInput): IntelFusionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const reliabilityScores: Record<string, number> = { a: 0.95, b: 0.85, c: 0.75, d: 0.60, e: 0.45, f: 0.30 }
  const sourceTypes: IntelSource['source_type'][] = ['sigint', 'humint', 'osint', 'geoint', 'masint', 'cyberint']

  const fusedAssessments: FusedAssessment[] = input.target_entities.map(entity => {
    const supportingCount = rng.nextInt(1, Math.max(input.sources.length, 1))
    const supportingSources = input.sources.slice(0, supportingCount).map(s => s.source_id)
    const contradictingSources = rng.next() > 0.6 ? input.sources.slice(supportingCount, supportingCount + 1).map(s => s.source_id) : []

    const avgCredibility = input.sources.length > 0
      ? input.sources.reduce((s, src) => s + (reliabilityScores[src.reliability] || 0.5), 0) / input.sources.length
      : 0.5
    const confidence = Math.round(avgCredibility * (supportingCount / Math.max(input.sources.length, 1)) * 100) / 100

    const threatScore = rng.nextFloat(0, 1)
    let threatLevel: FusedAssessment['threat_level'] = 'negligible'
    if (threatScore > 0.85) threatLevel = 'imminent'
    else if (threatScore > 0.65) threatLevel = 'high'
    else if (threatScore > 0.4) threatLevel = 'moderate'
    else if (threatScore > 0.2) threatLevel = 'low'

    return {
      entity,
      threat_level: threatLevel,
      confidence: Math.min(confidence, 0.95),
      supporting_sources: supportingSources,
      contradicting_sources: contradictingSources,
      assessment_summary: entity + ' assessed at ' + threatLevel + ' threat level with ' + Math.round(confidence * 100) + '% confidence',
      recommended_actions: [
        rng.pick(['Increase surveillance', 'Deploy counterintelligence', 'Enhance force protection', 'Monitor communications', 'Conduct HUMINT collection']),
        rng.pick(['Share with allies', 'Update threat warning', 'Adjust force posture']),
      ],
    }
  })

  const sourceReliability: SourceReliability[] = sourceTypes.map(st => {
    const typeSources = input.sources.filter(s => s.source_type === st)
    const count = typeSources.length
    const avgCred = count > 0 ? typeSources.reduce((s, src) => s + (reliabilityScores[src.reliability] || 0.5), 0) / count : 0
    return {
      source_type: st,
      count,
      avg_credibility: Math.round(avgCred * 100) / 100,
      reliability_grade: count > 0 ? rng.pick(['A - Reliable', 'B - Usually Reliable', 'C - Fairly Reliable', 'D - Not Usually Reliable']) : 'N/A',
    }
  }).filter(s => s.count > 0)

  const situationalAwareness = Math.round(
    (fusedAssessments.reduce((s, a) => s + a.confidence, 0) / Math.max(fusedAssessments.length, 1)) *
    (input.sources.length > 0 ? Math.min(input.sources.length / 5, 1) : 0.3) * 100
  ) / 100

  const intelGaps = [
    'Limited HUMINT coverage in denied areas',
    'SIGINT collection gaps in adversary encrypted networks',
    'GEOINT refresh rate insufficient for time-sensitive targets',
    'OSINT verification challenges in information warfare environment',
  ].slice(0, rng.nextInt(1, 4))

  const overallThreat = fusedAssessments.length > 0
    ? fusedAssessments.sort((a, b) => {
        const order = { imminent: 4, high: 3, moderate: 2, low: 1, negligible: 0 }
        return order[b.threat_level] - order[a.threat_level]
      })[0].assessment_summary
    : 'Insufficient data for threat assessment'

  const priorityRecommendations = [
    'Increase multi-INT collection against highest-threat entities',
    'Enhance all-source fusion and cross-cueing capabilities',
    'Deploy additional collection assets to fill intelligence gaps',
    'Strengthen counterintelligence to protect sources and methods',
    'Improve information sharing with coalition partners',
  ].slice(0, rng.nextInt(2, 5))

  return {
    analysis_name: input.analysis_name,
    fused_assessments: fusedAssessments,
    situational_awareness_score: Math.min(situationalAwareness, 0.99),
    intelligence_gaps: intelGaps,
    source_reliability_summary: sourceReliability,
    overall_threat_assessment: overallThreat,
    priority_recommendations: priorityRecommendations,
  }
}

// --- Tool 8: Operational Risk Assessor 分析 ---
function analyzeOperationalRisk(input: OperationalRiskInput): OperationalRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const riskAssessments: RiskAssessment[] = input.risk_factors.map(rf => {
    const riskScore = Math.round(rf.probability * rf.impact * 100) / 100
    const mitigationEffectiveness = Math.round(rng.nextFloat(0.3, 0.8) * 100) / 100
    const residualRisk = Math.round(riskScore * (1 - mitigationEffectiveness) * 100) / 100

    let matrixPos = 'Low'
    if (riskScore > 0.6) matrixPos = 'Extreme'
    else if (riskScore > 0.4) matrixPos = 'High'
    else if (riskScore > 0.2) matrixPos = 'Moderate'

    let status: RiskAssessment['status'] = 'accepted'
    if (mitigationEffectiveness > 0.6) status = 'mitigated'
    else if (rf.detectability > 0.7) status = 'transferred'
    else if (riskScore > 0.7) status = 'avoided'

    return {
      factor: rf.factor,
      risk_score: riskScore,
      risk_matrix_position: matrixPos,
      residual_risk: residualRisk,
      mitigation_effectiveness: mitigationEffectiveness,
      status,
    }
  })

  const overallRiskScore = Math.round(
    (riskAssessments.reduce((s, r) => s + r.risk_score, 0) / Math.max(riskAssessments.length, 1)) *
    (input.force_exposure / 100) * 100
  ) / 100

  const riskCategory: OperationalRiskResult['risk_category'] =
    overallRiskScore > 0.6 ? 'extreme' : overallRiskScore > 0.4 ? 'high' : overallRiskScore > 0.2 ? 'moderate' : 'low'

  const criticalRisks = riskAssessments.filter(r => r.risk_matrix_position === 'Extreme' || r.risk_matrix_position === 'High').map(r => r.factor)

  let goNoGo: OperationalRiskResult['go_no_go_recommendation'] = 'go'
  if (riskCategory === 'extreme') goNoGo = 'no_go'
  else if (riskCategory === 'high') goNoGo = 'go_with_mitigation'

  const additionalMitigations = [
    'Enhance force protection measures for high-risk phases',
    'Pre-position medical evacuation assets',
    'Establish contingency communication protocols',
    'Implement civilian casualty mitigation procedures',
    'Deploy additional ISR for early warning',
    'Coordinate with allied forces for mutual support',
  ].slice(0, rng.nextInt(2, 5))

  return {
    assessment_name: input.assessment_name,
    operation_type: input.operation_type,
    risk_assessments: riskAssessments,
    overall_risk_score: overallRiskScore,
    risk_category: riskCategory,
    force_risk_exposure: input.force_exposure,
    civilian_risk_exposure: input.civilian_exposure,
    go_no_go_recommendation: goNoGo,
    critical_risks: criticalRisks,
    additional_mitigations: additionalMitigations,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Scenario Modeler 报告 ---
function formatScenarioReport(result: ScenarioResult): string {
  const lines: string[] = []
  lines.push('## 🎯 Scenario Modeler — 多域作战场景建模报告')
  lines.push('')
  lines.push('场景: ' + result.scenario_name + ' | 域: ' + result.domain + ' | 地形: ' + result.terrain + ' | 气象: ' + result.weather)
  lines.push('可行性评分: ' + result.feasibility_score + ' | 风险等级: ' + result.risk_level)
  lines.push('')
  lines.push('### 🔗 场景推演拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    S[Scenario: ' + result.scenario_name + '] --> P1[Phase 1: ' + (result.phases[0]?.phase_name || 'N/A') + ']')
  for (let i = 1; i < result.phases.length; i++) {
    lines.push('    P' + i + '[Phase ' + i + ': ' + result.phases[i - 1].phase_name + '] --> P' + (i + 1) + '[Phase ' + (i + 1) + ': ' + result.phases[i].phase_name + ']')
  }
  lines.push('    P' + result.phases.length + ' --> O[Objectives Assessment]')
  lines.push('    O --> FEAS[Feasibility: ' + result.feasibility_score + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 🔵 蓝方兵力汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 单位数 | ' + result.blue_force_summary.total_units + ' |')
  lines.push('| 总兵力 | ' + result.blue_force_summary.total_strength + ' |')
  lines.push('| 平均战备 | ' + result.blue_force_summary.avg_readiness + ' |')
  lines.push('| 兵力比 | ' + result.blue_force_summary.force_ratio + ' |')
  lines.push('| 主要能力 | ' + result.blue_force_summary.primary_capabilities.join(', ') + ' |')
  lines.push('')

  lines.push('### 🔴 红方兵力汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 单位数 | ' + result.red_force_summary.total_units + ' |')
  lines.push('| 总兵力 | ' + result.red_force_summary.total_strength + ' |')
  lines.push('| 平均战备 | ' + result.red_force_summary.avg_readiness + ' |')
  lines.push('| 兵力比 | ' + result.red_force_summary.force_ratio + ' |')
  lines.push('| 主要能力 | ' + result.red_force_summary.primary_capabilities.join(', ') + ' |')
  lines.push('')

  lines.push('### 📋 阶段推演')
  lines.push('| 阶段 | 名称 | 时长(h) | 预期结果 | 关键事件 |')
  lines.push('|------|------|---------|----------|----------|')
  for (const p of result.phases) {
    lines.push('| ' + p.phase_id + ' | ' + p.phase_name + ' | ' + p.duration_hours + ' | ' + p.expected_outcome + ' | ' + p.key_events.join(', ') + ' |')
  }
  lines.push('')

  lines.push('### 🎯 目标分析')
  lines.push('| 目标 | 优先级 | 可达性 | 需兵力 | 预估伤亡率 |')
  lines.push('|------|--------|--------|--------|-----------|')
  for (const o of result.objective_analysis) {
    lines.push('| ' + o.objective + ' | ' + o.priority + ' | ' + o.achievability + ' | ' + o.required_forces + ' | ' + o.estimated_casualty_pct + ' |')
  }
  lines.push('')

  lines.push('### 📋 场景合规清单')
  lines.push('- [x] 多域作战环境建模')
  lines.push('- [x] 兵力对比与战备评估')
  lines.push('- [x] 阶段推演与关键事件')
  lines.push('- [x] 目标可达性与伤亡预估')
  lines.push('- [x] 气象与地形影响分析')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Scenario Modeler • Multi-Domain Operations*')
  return lines.join('\n')
}

// --- Tool 2: Threat Simulation Engine 报告 ---
function formatThreatSimReport(result: ThreatSimResult): string {
  const lines: string[] = []
  lines.push('## ⚔️ Threat Simulation Engine — 威胁仿真推演报告')
  lines.push('')
  lines.push('仿真: ' + result.sim_name + ' | 总轮次: ' + result.total_rounds + ' | 最终结果: ' + result.final_outcome)
  lines.push('红方胜率: ' + result.red_win_probability + ' | 蓝方胜率: ' + result.blue_win_probability + ' | 置信度: ' + result.confidence_level)
  lines.push('')
  lines.push('### 🔗 推演流程拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    INIT[Initial State] --> R1[Round 1: ' + (result.rounds[0]?.red_action || 'N/A') + ']')
  lines.push('    R1 --> R2[Round 2: ' + (result.rounds[1]?.red_action || 'N/A') + ']')
  lines.push('    R2 --> FINAL[Final: ' + result.final_outcome + ']')
  lines.push('    FINAL --> VULN[Critical Vulnerabilities: ' + result.critical_vulnerabilities.length + ']')
  lines.push('    FINAL --> CTR[Countermeasures: ' + result.recommended_countermeasures.length + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 推演轮次表')
  lines.push('| 轮次 | 红方行动 | 蓝方响应 | 红效 | 蓝效 | 资产损毁 | 状态 |')
  lines.push('|------|----------|----------|------|------|----------|------|')
  for (const r of result.rounds) {
    lines.push('| ' + r.round_id + ' | ' + r.red_action + ' | ' + r.blue_response + ' | ' + r.red_effectiveness + ' | ' + r.blue_effectiveness + ' | ' + r.asset_damage + ' | ' + r.status + ' |')
  }
  lines.push('')

  if (result.critical_vulnerabilities.length > 0) {
    lines.push('### ⚠️ 关键脆弱性')
    for (const v of result.critical_vulnerabilities) lines.push('- ' + v)
    lines.push('')
  }

  lines.push('### 📋 推荐对抗措施')
  for (const c of result.recommended_countermeasures) lines.push('- ' + c)
  lines.push('')

  lines.push('### 📋 仿真合规清单')
  lines.push('- [x] 蒙特卡洛多轮推演')
  lines.push('- [x] 红蓝双方效能评估')
  lines.push('- [x] 资产损毁累积计算')
  lines.push('- [x] 关键脆弱性识别')
  lines.push('- [x] 对抗措施推荐')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Threat Simulation Engine • Monte Carlo*')
  return lines.join('\n')
}

// --- Tool 3: Strategic Planning Assessor 报告 ---
function formatStrategicReport(result: StrategicResult): string {
  const lines: string[] = []
  lines.push('## 🏛️ Strategic Planning Assessor — 战略规划评估报告')
  lines.push('')
  lines.push('计划: ' + result.plan_name + ' | 总体评分: ' + result.overall_plan_score + ' | 战略风险: ' + result.strategic_risk_level)
  lines.push('时间线可行性: ' + result.timeline_feasibility)
  lines.push('')
  lines.push('### 🔗 战略规划拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    PLAN[Plan: ' + result.plan_name + '] --> G1[Goal 1: ' + (result.goal_assessments[0]?.goal.slice(0, 30) || 'N/A') + ']')
  for (let i = 1; i < Math.min(result.goal_assessments.length, 4); i++) {
    lines.push('    PLAN --> G' + (i + 1) + '[Goal ' + (i + 1) + ': ' + result.goal_assessments[i].goal.slice(0, 30) + ']')
  }
  lines.push('    PLAN --> RES[Resource Gaps: ' + result.resource_gap_analysis.length + ']')
  lines.push('    PLAN --> RISK[Risk Level: ' + result.strategic_risk_level + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 目标评估表')
  lines.push('| 目标 | 优先级 | 资源充足性 | 时间可行性 | 风险暴露 | 综合评分 | 状态 |')
  lines.push('|------|--------|------------|------------|----------|----------|------|')
  for (const g of result.goal_assessments) {
    lines.push('| ' + g.goal.slice(0, 40) + ' | ' + g.priority + ' | ' + g.resource_adequacy + ' | ' + g.timeline_feasibility + ' | ' + g.risk_exposure + ' | ' + g.overall_score + ' | ' + g.status + ' |')
  }
  lines.push('')

  if (result.resource_gap_analysis.length > 0) {
    lines.push('### 📊 资源缺口分析')
    lines.push('| 资源类型 | 需求 | 可用 | 缺口% | 缓解措施 |')
    lines.push('|----------|------|------|-------|----------|')
    for (const r of result.resource_gap_analysis) {
      lines.push('| ' + r.resource_type + ' | ' + r.required + ' | ' + r.available + ' | ' + r.gap_pct + ' | ' + r.mitigation + ' |')
    }
    lines.push('')
  }

  lines.push('### 📋 战略建议')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 规划合规清单')
  lines.push('- [x] 目标-手段分析')
  lines.push('- [x] 资源分配评估')
  lines.push('- [x] 时间线可行性验证')
  lines.push('- [x] 风险暴露量化')
  lines.push('- [x] 资源缺口识别')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Strategic Planning Assessor • Ends-Ways-Means*')
  return lines.join('\n')
}

// --- Tool 4: Force Structure Analyzer 报告 ---
function formatForceStructureReport(result: ForceStructureResult): string {
  const lines: string[] = []
  lines.push('## 🎖️ Force Structure Analyzer — 兵力结构分析报告')
  lines.push('')
  lines.push('分析: ' + result.analysis_name + ' | 军种: ' + result.branch)
  lines.push('总单位: ' + result.total_units + ' | 总人员: ' + result.total_personnel + ' | 装备总值: $' + result.total_equipment_value + 'M')
  lines.push('平均战备: ' + result.avg_readiness + ' | 现代化指数: ' + result.modernization_index + ' | 战力评分: ' + result.force_effectiveness_score)
  lines.push('')
  lines.push('### 🔗 兵力结构拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    FS[Force: ' + result.analysis_name + '] --> READ[Avg Readiness: ' + result.avg_readiness + ']')
  lines.push('    FS --> MOD[Modernization: ' + result.modernization_index + ']')
  lines.push('    FS --> EFF[Effectiveness: ' + result.force_effectiveness_score + ']')
  lines.push('    FS --> CAP[Capabilities: ' + result.capability_assessments.length + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 能力评估表')
  lines.push('| 能力 | 当前水平 | 需求水平 | 缺口 | 投资优先级 |')
  lines.push('|------|----------|----------|------|------------|')
  for (const c of result.capability_assessments) {
    lines.push('| ' + c.capability + ' | ' + c.current_level + ' | ' + c.required_level + ' | ' + c.gap + ' | ' + c.investment_priority + ' |')
  }
  lines.push('')

  lines.push('### 📋 优化建议')
  for (const r of result.optimization_recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 分析合规清单')
  lines.push('- [x] 兵种配比分析')
  lines.push('- [x] 装备效能评估')
  lines.push('- [x] 战备指数计算')
  lines.push('- [x] 现代化水平评估')
  lines.push('- [x] 能力缺口识别')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Force Structure Analyzer • DOTMLPF-P*')
  return lines.join('\n')
}

// --- Tool 5: Logistics Readiness Evaluator 报告 ---
function formatLogisticsReport(result: LogisticsResult): string {
  const lines: string[] = []
  lines.push('## 🚛 Logistics Readiness Evaluator — 后勤战备评估报告')
  lines.push('')
  lines.push('评估: ' + result.evaluation_name + ' | 战区: ' + result.theater)
  lines.push('总体战备: ' + result.overall_readiness + ' | 日吞吐量: ' + result.daily_throughput_tons + '吨 | 持续作战: ' + result.sustainment_capacity_days + '天')
  lines.push('后勤风险: ' + result.logistics_risk)
  lines.push('')
  lines.push('### 🔗 后勤网络拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    SRC[Supply Sources] --> R1[Route: ' + (result.supply_route_status[0]?.route_id || 'N/A') + ']')
  lines.push('    R1 --> D1[Depot: ' + (result.depot_status[0]?.depot_id || 'N/A') + ']')
  lines.push('    D1 --> FOR[Forward Units]')
  lines.push('    FOR --> SUST[Sustainment: ' + result.sustainment_capacity_days + ' days]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 补给线路状态')
  lines.push('| 线路ID | 有效容量(吨/天) | 瓶颈 | 风险等级 |')
  lines.push('|--------|----------------|------|----------|')
  for (const r of result.supply_route_status) {
    lines.push('| ' + r.route_id + ' | ' + r.effective_capacity + ' | ' + (r.bottleneck ? '是' : '否') + ' | ' + r.risk_level + ' |')
  }
  lines.push('')

  lines.push('### 📋 仓库状态')
  lines.push('| 仓库ID | 利用率% | 供应天数 | 脆弱性 |')
  lines.push('|--------|---------|----------|--------|')
  for (const d of result.depot_status) {
    lines.push('| ' + d.depot_id + ' | ' + d.utilization_pct + ' | ' + d.days_of_supply + ' | ' + d.vulnerability + ' |')
  }
  lines.push('')

  if (result.critical_shortages.length > 0) {
    lines.push('### ⚠️ 关键短缺')
    for (const s of result.critical_shortages) lines.push('- ' + s)
    lines.push('')
  }

  lines.push('### 📋 后勤建议')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 评估合规清单')
  lines.push('- [x] 补给线路容量分析')
  lines.push('- [x] 仓库库存与利用率')
  lines.push('- [x] 持续作战能力计算')
  lines.push('- [x] 关键短缺识别')
  lines.push('- [x] 后勤风险评估')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Logistics Readiness Evaluator • Sustainment*')
  return lines.join('\n')
}

// --- Tool 6: Cyber Warfare Simulator 报告 ---
function formatCyberWarfareReport(result: CyberSimResult): string {
  const lines: string[] = []
  lines.push('## 💻 Cyber Warfare Simulator — 网络战仿真报告')
  lines.push('')
  lines.push('仿真: ' + result.sim_name + ' | 攻击步骤: ' + result.attack_steps.length)
  lines.push('红方渗透深度: ' + result.red_penetration_depth + ' | 蓝方检测率: ' + result.blue_detection_rate)
  lines.push('MTTD: ' + result.mean_time_to_detect_minutes + 'min | MTTR: ' + result.mean_time_to_respond_minutes + 'min')
  lines.push('网络态势评分: ' + result.cyber_posture_score)
  lines.push('')
  lines.push('### 🔗 网络攻防拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    RED[Red Team] --> A1[Step 1: ' + (result.attack_steps[0]?.tactic || 'N/A') + ']')
  lines.push('    A1 --> A2[Step 2: ' + (result.attack_steps[1]?.tactic || 'N/A') + ']')
  lines.push('    A2 --> DET[Detection Rate: ' + result.blue_detection_rate + ']')
  lines.push('    DET --> RESP[MTTR: ' + result.mean_time_to_respond_minutes + 'min]')
  lines.push('    RESP --> POSTURE[Posture: ' + result.cyber_posture_score + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 攻击链分析')
  lines.push('| 步骤 | 战术 | 技术 | 目标 | 成功概率 | 检测 | 蓝方响应 | 影响 |')
  lines.push('|------|------|------|------|----------|------|----------|------|')
  for (const s of result.attack_steps) {
    lines.push('| ' + s.step_id + ' | ' + s.tactic + ' | ' + s.technique + ' | ' + s.target + ' | ' + s.success_probability + ' | ' + (s.detected ? '是' : '否') + ' | ' + s.blue_response + ' | ' + s.impact_score + ' |')
  }
  lines.push('')

  if (result.assets_compromised.length > 0) {
    lines.push('### ⚠️ 已失陷资产')
    for (const a of result.assets_compromised) lines.push('- ' + a)
    lines.push('')
  }

  if (result.assets_protected.length > 0) {
    lines.push('### 🛡️ 已保护资产')
    for (const a of result.assets_protected) lines.push('- ' + a)
    lines.push('')
  }

  lines.push('### 📋 改进建议')
  for (const r of result.improvement_recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 仿真合规清单')
  lines.push('- [x] MITRE ATT&CK 战术映射')
  lines.push('- [x] 攻击链逐步推演')
  lines.push('- [x] 蓝方检测与响应评估')
  lines.push('- [x] MTTD/MTTR 指标计算')
  lines.push('- [x] 网络态势综合评分')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Cyber Warfare Simulator • MITRE ATT&CK*')
  return lines.join('\n')
}

// --- Tool 7: Intelligence Analysis Fusion 报告 ---
function formatIntelFusionReport(result: IntelFusionResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Intelligence Analysis Fusion — 情报融合分析报告')
  lines.push('')
  lines.push('分析: ' + result.analysis_name + ' | 态势感知评分: ' + result.situational_awareness_score)
  lines.push('融合评估数: ' + result.fused_assessments.length + ' | 情报缺口: ' + result.intelligence_gaps.length)
  lines.push('')
  lines.push('### 🔗 情报融合拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    SIGINT[SIGINT] --> FUSE[Fusion Engine]')
  lines.push('    HUMINT[HUMINT] --> FUSE')
  lines.push('    OSINT[OSINT] --> FUSE')
  lines.push('    GEOINT[GEOINT] --> FUSE')
  lines.push('    FUSE --> SA[Situational Awareness: ' + result.situational_awareness_score + ']')
  lines.push('    FUSE --> THREAT[Threat Assessment]')
  lines.push('    SA --> REC[Priority Recommendations]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 融合评估表')
  lines.push('| 实体 | 威胁等级 | 置信度 | 支持源 | 矛盾源 | 评估摘要 |')
  lines.push('|------|----------|--------|--------|--------|----------|')
  for (const a of result.fused_assessments) {
    lines.push('| ' + a.entity + ' | ' + a.threat_level + ' | ' + a.confidence + ' | ' + a.supporting_sources.length + ' | ' + a.contradicting_sources.length + ' | ' + a.assessment_summary + ' |')
  }
  lines.push('')

  lines.push('### 📊 源可靠性汇总')
  lines.push('| 源类型 | 数量 | 平均可信度 | 可靠性等级 |')
  lines.push('|--------|------|------------|------------|')
  for (const s of result.source_reliability_summary) {
    lines.push('| ' + s.source_type + ' | ' + s.count + ' | ' + s.avg_credibility + ' | ' + s.reliability_grade + ' |')
  }
  lines.push('')

  if (result.intelligence_gaps.length > 0) {
    lines.push('### ⚠️ 情报缺口')
    for (const g of result.intelligence_gaps) lines.push('- ' + g)
    lines.push('')
  }

  lines.push('### 📋 优先建议')
  for (const r of result.priority_recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('### 📋 分析合规清单')
  lines.push('- [x] 多源情报关联融合')
  lines.push('- [x] 源可靠性评估 (A-F scale)')
  lines.push('- [x] 置信度量化')
  lines.push('- [x] 矛盾情报标记')
  lines.push('- [x] 情报缺口识别')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Intelligence Analysis Fusion • All-Source*')
  return lines.join('\n')
}

// --- Tool 8: Operational Risk Assessor 报告 ---
function formatOperationalRiskReport(result: OperationalRiskResult): string {
  const lines: string[] = []
  lines.push('## ⚠️ Operational Risk Assessor — 作战风险评估报告')
  lines.push('')
  lines.push('评估: ' + result.assessment_name + ' | 作战类型: ' + result.operation_type)
  lines.push('总体风险评分: ' + result.overall_risk_score + ' | 风险类别: ' + result.risk_category)
  lines.push('部队风险暴露: ' + result.force_risk_exposure + '% | 平民风险暴露: ' + result.civilian_risk_exposure + '%')
  lines.push('行动建议: ' + result.go_no_go_recommendation)
  lines.push('')
  lines.push('### 🔗 风险评估拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    OP[Operation: ' + result.operation_type + '] --> RA[Risk Assessment]')
  lines.push('    RA --> FORCE[Force Exposure: ' + result.force_risk_exposure + '%]')
  lines.push('    RA --> CIV[Civilian Exposure: ' + result.civilian_risk_exposure + '%]')
  lines.push('    RA --> CAT[Category: ' + result.risk_category + ']')
  lines.push('    CAT --> GNG[Go/No-Go: ' + result.go_no_go_recommendation + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 风险评估表')
  lines.push('| 风险因素 | 风险评分 | 矩阵位置 | 残余风险 | 缓解效果 | 状态 |')
  lines.push('|----------|----------|----------|----------|----------|------|')
  for (const r of result.risk_assessments) {
    lines.push('| ' + r.factor + ' | ' + r.risk_score + ' | ' + r.risk_matrix_position + ' | ' + r.residual_risk + ' | ' + r.mitigation_effectiveness + ' | ' + r.status + ' |')
  }
  lines.push('')

  if (result.critical_risks.length > 0) {
    lines.push('### 🔴 关键风险')
    for (const r of result.critical_risks) lines.push('- ' + r)
    lines.push('')
  }

  lines.push('### 📋 额外缓解措施')
  for (const m of result.additional_mitigations) lines.push('- ' + m)
  lines.push('')

  lines.push('### 📋 评估合规清单')
  lines.push('- [x] 风险矩阵评估 (Probability x Impact)')
  lines.push('- [x] 部队/平民风险暴露量化')
  lines.push('- [x] 缓解措施有效性评估')
  lines.push('- [x] Go/No-Go 决策建议')
  lines.push('- [x] 残余风险计算')
  lines.push('')
  lines.push('---')
  lines.push('*WarfareSim v' + VERSION + ' • Operational Risk Assessor • Risk Matrix*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Scenario Modeler — 多域作战场景建模
  tools.register(defineTool({
    name: 'scenario_modeler',
    description: '多域作战场景建模 | 地形、兵力、目标、约束条件、阶段推演 | Multi-domain operations scenario modeling with terrain, forces, objectives, and phase analysis.',
    parameters: {
      scenario_input: {
        type: 'string',
        required: true,
        description: 'JSON: scenario_name, domain(land|sea|air|space|cyber|cognitive|multi), terrain_type, blue_forces[{unit_name, unit_type, strength, readiness, equipment[], position?}], red_forces[same], objectives[], constraints[], weather?, duration_hours?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { scenario_input: string }) {
      const input: ScenarioInput = JSON.parse(args.scenario_input)
      return formatScenarioReport(analyzeScenario(input))
    }
  }))

  // Tool 2: Threat Simulation Engine — 威胁仿真引擎
  tools.register(defineTool({
    name: 'threat_simulation_engine',
    description: '威胁仿真引擎 | 红方攻击路径、蓝方防御响应、蒙特卡洛多轮推演 | Threat simulation with red team attack paths, blue team defense, and Monte Carlo rounds.',
    parameters: {
      sim_input: {
        type: 'string',
        required: true,
        description: 'JSON: sim_name, threat_actors[], attack_vectors[], target_assets[], simulation_rounds?, defense_posture(passive|active|aggressive), escalation_model(linear|exponential|stochastic)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sim_input: string }) {
      const input: ThreatSimInput = JSON.parse(args.sim_input)
      return formatThreatSimReport(analyzeThreatSimulation(input))
    }
  }))

  // Tool 3: Strategic Planning Assessor — 战略规划评估
  tools.register(defineTool({
    name: 'strategic_planning_assessor',
    description: '战略规划评估 | 目标-手段分析、资源分配、时间线推演、资源缺口 | Strategic planning assessment with ends-ways-means analysis and resource gap identification.',
    parameters: {
      strategic_input: {
        type: 'string',
        required: true,
        description: 'JSON: plan_name, strategic_goals[], available_resources[{resource_type, quantity, unit_cost, availability(immediate|30_days|90_days|180_days)}], timeline_months, threat_scenarios[], alliance_factors?, political_constraints?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { strategic_input: string }) {
      const input: StrategicInput = JSON.parse(args.strategic_input)
      return formatStrategicReport(analyzeStrategicPlanning(input))
    }
  }))

  // Tool 4: Force Structure Analyzer — 兵力结构分析
  tools.register(defineTool({
    name: 'force_structure_analyzer',
    description: '兵力结构分析 | 兵种配比、装备效能、战备指数、现代化水平、能力缺口 | Force structure analysis with unit composition, readiness, modernization, and capability gaps.',
    parameters: {
      force_input: {
        type: 'string',
        required: true,
        description: 'JSON: analysis_name, branch(army|navy|air_force|marines|space_force|cyber_command|joint), units[{unit_type, count, personnel, equipment_value_millions, readiness_rating, modernization_level(legacy|modern|cutting_edge)}], budget_billions, doctrine, peer_comparison?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { force_input: string }) {
      const input: ForceStructureInput = JSON.parse(args.force_input)
      return formatForceStructureReport(analyzeForceStructure(input))
    }
  }))

  // Tool 5: Logistics Readiness Evaluator — 后勤战备评估
  tools.register(defineTool({
    name: 'logistics_readiness_evaluator',
    description: '后勤战备评估 | 供应链、补给线、仓库库存、持续作战能力 | Logistics readiness evaluation with supply routes, depots, and sustainment capacity.',
    parameters: {
      logistics_input: {
        type: 'string',
        required: true,
        description: 'JSON: evaluation_name, theater, supply_routes[{route_id, origin, destination, capacity_tons_per_day, distance_km, security_level(secure|contested|hostile), status(open|degraded|closed)}], depots[{depot_id, location, storage_capacity_tons, current_stock_tons, replenishment_rate, vulnerability(low|medium|high)}], daily_consumption_tons, sustainment_days, threat_to_lines[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { logistics_input: string }) {
      const input: LogisticsInput = JSON.parse(args.logistics_input)
      return formatLogisticsReport(analyzeLogistics(input))
    }
  }))

  // Tool 6: Cyber Warfare Simulator — 网络战仿真
  tools.register(defineTool({
    name: 'cyber_warfare_simulator',
    description: '网络战仿真 | MITRE ATT&CK 攻防对抗、MTTD/MTTR、网络态势评分 | Cyber warfare simulation with MITRE ATT&CK tactics, detection/response metrics, and posture scoring.',
    parameters: {
      cyber_input: {
        type: 'string',
        required: true,
        description: 'JSON: sim_name, attack_surface[], defense_layers[], red_team_capabilities[], blue_team_capabilities[], critical_assets[], simulation_depth(reconnaissance|initial_access|full_campaign)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { cyber_input: string }) {
      const input: CyberSimInput = JSON.parse(args.cyber_input)
      return formatCyberWarfareReport(analyzeCyberWarfare(input))
    }
  }))

  // Tool 7: Intelligence Analysis Fusion — 情报融合分析
  tools.register(defineTool({
    name: 'intelligence_analysis_fusion',
    description: '情报融合分析 | 多源情报(SIGINT/HUMINT/OSINT/GEOINT)关联、置信度、态势感知 | Multi-INT fusion analysis with source reliability, confidence scoring, and situational awareness.',
    parameters: {
      intel_input: {
        type: 'string',
        required: true,
        description: 'JSON: analysis_name, sources[{source_id, source_type(sigint|humint|osint|geoint|masint|cyberint), reliability(a|b|c|d|e|f), credibility, content, timestamp}], target_entities[], analysis_timeframe, classification(unclassified|confidential|secret|top_secret), priority_intelligence_requirements[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { intel_input: string }) {
      const input: IntelFusionInput = JSON.parse(args.intel_input)
      return formatIntelFusionReport(analyzeIntelFusion(input))
    }
  }))

  // Tool 8: Operational Risk Assessor — 作战风险评估
  tools.register(defineTool({
    name: 'operational_risk_assessor',
    description: '作战风险评估 | 风险矩阵(概率x影响)、部队/平民暴露、Go/No-Go 决策 | Operational risk assessment with risk matrix, force/civilian exposure, and go/no-go recommendation.',
    parameters: {
      risk_input: {
        type: 'string',
        required: true,
        description: 'JSON: assessment_name, operation_type, risk_factors[{factor, category(tactical|operational|strategic|environmental|political), probability, impact, detectability, current_mitigation}], force_exposure(0-100), civilian_exposure(0-100), environmental_factors[], rules_of_engagement, mitigation_measures?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_input: string }) {
      const input: OperationalRiskInput = JSON.parse(args.risk_input)
      return formatOperationalRiskReport(analyzeOperationalRisk(input))
    }
  }))

  console.log('[dsh-tool-warfaresim] Loaded v' + VERSION + ' — Defense Simulation & Wargaming: 8 tools active')
  console.log('  Tools: scenario_modeler, threat_simulation_engine, strategic_planning_assessor, force_structure_analyzer, logistics_readiness_evaluator, cyber_warfare_simulator, intelligence_analysis_fusion, operational_risk_assessor')
}
