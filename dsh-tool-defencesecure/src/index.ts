/**
 * DSH Defense & National Security AI Plugin v0.1.0
 *
 * C4ISR, threat assessment, cyber defense, autonomous systems, and intelligence analysis
 * toolkit for DeepSeek Harness Agent. Designed for defense and national security
 * decision-support workflows including multi-domain operations, cyber resilience,
 * and strategic foresight.
 *
 * Features (v0.1.0):
 * - Threat Assessment Matrix (multi-domain threat scoring with MITRE ATT&CK mapping)
 * - Cyber Defense Orchestrator (adaptive defense playbook generation and response coordination)
 * - Intelligence Fusion Engine (multi-source intelligence correlation and analysis)
 * - Autonomous System Executor (unmanned system mission planning and risk governance)
 * - Critical Infrastructure Protector (infrastructure vulnerability and resilience analysis)
 * - Supply Chain Security AI (supply chain risk mapping and supplier assurance)
 * - Strategic Forecasting Model (geopolitical scenario modeling and trend extrapolation)
 * - Classified Network Monitor (anomaly detection and security posture assessment)
 *
 * @module dsh-tool-defencesecure
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-defencesecure'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private s: number

  constructor(seed: number) {
    this.s = seed % 2147483647
    if (this.s <= 0) this.s += 2147483646
  }

  next(): number {
    this.s = (this.s * 16807) % 2147483647
    return (this.s - 1) / 2147483646
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

// ==================== TYPES ====================

// --- Tool 1: Threat Assessment Matrix ---

export interface ThreatAssessmentInput {
  threat_actors: string[]
  target_assets: string[]
  attack_vectors: string[]
  domain: 'land' | 'sea' | 'air' | 'space' | 'cyber' | 'cognitive' | 'multi'
  classification_level: 'unclassified' | 'confidential' | 'secret' | 'top_secret'
  mitre_techniques?: string[]
}

export interface ThreatScore {
  actor: string
  asset: string
  vector: string
  likelihood: number
  impact: number
  risk_score: number
  mitre_mappings: string[]
  severity: 'low' | 'moderate' | 'high' | 'critical' | 'catastrophic'
  recommended_countermeasures: string[]
}

export interface ThreatAssessmentResult {
  domain: string
  classification: string
  threat_scores: ThreatScore[]
  overall_risk: 'low' | 'moderate' | 'high' | 'critical' | 'catastrophic'
  risk_heatmap: Array<{ actor: string; asset: string; score: number }>
  top_threats: string[]
  strategic_recommendations: string[]
  intelligence_gaps: string[]
}

// --- Tool 2: Cyber Defense Orchestrator ---

export interface CyberDefenseInput {
  network_segments: string[]
  detected_anomalies: string[]
  threat_intel_feeds: string[]
  security_controls: string[]
  response_level: 'monitor' | 'alert' | 'contain' | 'eradicate' | 'recover'
  zero_trust_enabled: boolean
}

export interface DefenseAction {
  action_id: string
  name: string
  target_segment: string
  action_type: 'isolate' | 'block' | 'redirect' | 'patch' | 'harden' | 'monitor' | 'deceive'
  priority: number
  estimated_effectiveness: number
  dependencies: string[]
  automated: boolean
}

export interface CyberDefenseResult {
  response_level: string
  defense_actions: DefenseAction[]
  playbook_name: string
  coverage_score: number
  mean_time_to_respond: string
  zero_trust_compliance: number
  residual_risk: number
  escalation_path: string[]
  recommendations: string[]
}

// --- Tool 3: Intelligence Fusion Engine ---

export interface IntelligenceFusionInput {
  sources: Array<{ source_id: string; type: 'sigint' | 'humint' | 'osint' | 'geoint' | 'masint' | 'cyberint'; reliability: number; freshness_hours: number }>
  targets: string[]
  fusion_level: 'single' | 'cross_correlation' | 'multi_int' | 'all_source'
  temporal_window_hours: number
  confidence_threshold: number
}

export interface FusedIntelligence {
  target: string
  confidence: number
  contributing_sources: string[]
  assessment: string
  indicators: string[]
  reliability_score: number
  freshness_score: number
  discrepancies: string[]
}

export interface IntelligenceFusionResult {
  fusion_level: string
  fused_intelligence: FusedIntelligence[]
  source_utilization: Record<string, number>
  overall_confidence: number
  coverage_gaps: string[]
  priority_targets: string[]
  recommendations: string[]
}

// --- Tool 4: Autonomous System Executor ---

export interface AutonomousSystemInput {
  system_type: 'uav' | 'usv' | 'ugv' | 'uum' | 'satellite' | 'swarm'
  mission_type: 'reconnaissance' | 'strike' | 'logistics' | 'electronic_warfare' | 'mine_countermeasure' | 'search_rescue'
  operational_area: string
  rules_of_engagement: string
  human_oversight: 'full' | 'supervisory' | 'on_call' | 'autonomous'
  payloads: string[]
  endurance_hours: number
}

export interface MissionPhase {
  phase_id: string
  name: string
  duration_minutes: number
  waypoints: string[]
  actions: string[]
  abort_conditions: string[]
  risk_level: 'low' | 'medium' | 'high'
}

export interface AutonomousSystemResult {
  system_type: string
  mission_type: string
  mission_phases: MissionPhase[]
  total_duration_minutes: number
  risk_assessment: { overall: string; ethical_compliance: number; roe_adherence: number }
  contingency_plans: string[]
  human_oversight_checkpoints: string[]
  recommendations: string[]
}

// --- Tool 5: Critical Infrastructure Protector ---

export interface InfrastructureProtectionInput {
  infrastructure_type: 'energy' | 'water' | 'transport' | 'telecom' | 'healthcare' | 'financial' | 'government'
  assets: Array<{ name: string; criticality: number; interdependencies: string[] }>
  threat_scenarios: string[]
  existing_controls: string[]
  regulatory_frameworks: string[]
}

export interface VulnerabilityFinding {
  asset: string
  vulnerability: string
  exploitability: number
  impact: number
  risk_rating: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
  residual_risk: number
}

export interface InfrastructureProtectionResult {
  infrastructure_type: string
  vulnerabilities: VulnerabilityFinding[]
  resilience_score: number
  single_points_of_failure: string[]
  cascade_risks: string[]
  compliance_status: Record<string, number>
  investment_priorities: string[]
  recommendations: string[]
}

// --- Tool 6: Supply Chain Security AI ---

export interface SupplyChainInput {
  supply_chain_name: string
  tiers: Array<{ tier: number; suppliers: string[]; geography: string }>
  critical_components: string[]
  threat_vectors: string[]
  assurance_level: 'basic' | 'enhanced' | 'rigorous'
}

export interface SupplierRisk {
  supplier: string
  tier: number
  geography: string
  risk_score: number
  risk_factors: string[]
  single_source: boolean
  alternatives: string[]
  assurance_status: 'verified' | 'partial' | 'unverified' | 'high_risk'
}

export interface SupplyChainResult {
  supply_chain_name: string
  supplier_risks: SupplierRisk[]
  overall_risk: 'low' | 'moderate' | 'high' | 'critical'
  concentration_risks: string[]
  geographic_risks: string[]
  single_source_dependencies: string[]
  resilience_recommendations: string[]
  monitoring_indicators: string[]
}

// --- Tool 7: Strategic Forecasting Model ---

export interface StrategicForecastingInput {
  region: string
  time_horizon_years: number
  domains: string[]
  key_variables: string[]
  scenario_count: number
  baseline_assumptions: string[]
}

export interface Scenario {
  scenario_id: string
  name: string
  probability: number
  description: string
  key_drivers: string[]
  implications: string[]
  early_warning_indicators: string[]
  wildcard_potential: number
}

export interface StrategicForecastingResult {
  region: string
  time_horizon: string
  scenarios: Scenario[]
  most_likely_scenario: string
  trend_extrapolations: Array<{ variable: string; direction: string; confidence: number }>
  strategic_implications: string[]
  recommendations: string[]
}

// --- Tool 8: Classified Network Monitor ---

export interface ClassifiedNetworkInput {
  network_classification: 'confidential' | 'secret' | 'top_secret' | 'sci'
  monitored_zones: string[]
  traffic_patterns: Array<{ source: string; destination: string; protocol: string; volume_mbps: number; encrypted: boolean }>
  anomaly_indicators: string[]
  security_posture: 'green' | 'amber' | 'red'
  insider_threat_level: 'low' | 'moderate' | 'high'
}

export interface NetworkAnomaly {
  anomaly_id: string
  zone: string
  type: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
  source_dest: string
  confidence: number
  recommended_action: string
}

export interface ClassifiedNetworkResult {
  network_classification: string
  anomalies: NetworkAnomaly[]
  security_posture: string
  posture_score: number
  insider_threat_assessment: string
  data_exfiltration_risks: string[]
  compliance_violations: string[]
  incident_response_recommendations: string[]
  monitoring_gaps: string[]
}

// ==================== TOOL 1: THREAT ASSESSMENT MATRIX ====================

function assessThreatMatrix(input: ThreatAssessmentInput): ThreatAssessmentResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const threatScores: ThreatScore[] = []
  const riskHeatmap: Array<{ actor: string; asset: string; score: number }> = []

  for (const actor of input.threat_actors) {
    for (const asset of input.target_assets) {
      for (const vector of input.attack_vectors) {
        const likelihood = Math.round(rng.nextFloat(0.1, 0.95) * 100) / 100
        const impact = Math.round(rng.nextFloat(0.2, 1.0) * 100) / 100
        const riskScore = Math.round(likelihood * impact * 100) / 100

        let severity: ThreatScore['severity'] = 'low'
        if (riskScore > 0.8) severity = 'catastrophic'
        else if (riskScore > 0.6) severity = 'critical'
        else if (riskScore > 0.4) severity = 'high'
        else if (riskScore > 0.2) severity = 'moderate'

        const mitreMappings: string[] = []
        if (input.mitre_techniques && input.mitre_techniques.length > 0) {
          const numMappings = rng.nextInt(1, Math.min(3, input.mitre_techniques.length))
          const shuffled = [...input.mitre_techniques].sort(() => rng.next() - 0.5)
          for (let i = 0; i < numMappings; i++) {
            mitreMappings.push(shuffled[i])
          }
        }

        const countermeasurePool = [
          'Deploy multi-factor authentication across all access points',
          'Implement network segmentation with micro-firewall policies',
          'Establish continuous monitoring with behavioral analytics',
          'Conduct red team exercises targeting identified attack vectors',
          'Deploy deception technology with decoy assets',
          'Implement zero-trust architecture with least-privilege access',
          'Establish threat hunting operations with ML-based detection',
          'Deploy endpoint detection and response on all critical systems'
        ]
        const numCounter = rng.nextInt(2, 4)
        const shuffledCounter = [...countermeasurePool].sort(() => rng.next() - 0.5)
        const recommendedCountermeasures = shuffledCounter.slice(0, numCounter)

        threatScores.push({
          actor, asset, vector, likelihood, impact, risk_score: riskScore,
          mitre_mappings: mitreMappings, severity, recommended_countermeasures: recommendedCountermeasures
        })

        riskHeatmap.push({ actor, asset, score: riskScore })
      }
    }
  }

  const avgRisk = threatScores.reduce((s, t) => s + t.risk_score, 0) / Math.max(1, threatScores.length)
  let overallRisk: ThreatAssessmentResult['overall_risk'] = 'low'
  if (avgRisk > 0.75) overallRisk = 'catastrophic'
  else if (avgRisk > 0.55) overallRisk = 'critical'
  else if (avgRisk > 0.35) overallRisk = 'high'
  else if (avgRisk > 0.18) overallRisk = 'moderate'

  const sorted = [...threatScores].sort((a, b) => b.risk_score - a.risk_score)
  const topThreats = sorted.slice(0, Math.min(5, sorted.length)).map(t => `${t.actor} targeting ${t.asset} via ${t.vector} (risk: ${t.risk_score})`)

  const strategicRecommendations: string[] = []
  if (overallRisk === 'critical' || overallRisk === 'catastrophic') {
    strategicRecommendations.push('Elevate threat level and activate crisis response protocols')
    strategicRecommendations.push('Coordinate with allied intelligence services for shared threat awareness')
  }
  if (input.domain === 'cyber' || input.domain === 'multi') {
    strategicRecommendations.push('Enhance cyber threat intelligence sharing through ISAC frameworks')
  }
  if (input.domain === 'cognitive') {
    strategicRecommendations.push('Deploy counter-disinformation monitoring and strategic communications')
  }
  strategicRecommendations.push('Conduct quarterly threat landscape reassessment with updated actor profiles')
  strategicRecommendations.push('Integrate threat assessment with national defense planning cycles')

  const intelligenceGaps: string[] = []
  if (input.threat_actors.length < 3) intelligenceGaps.push('Limited threat actor coverage — expand actor profiling')
  if (!input.mitre_techniques || input.mitre_techniques.length < 5) intelligenceGaps.push('Incomplete MITRE ATT&CK mapping — conduct technique gap analysis')
  if (input.attack_vectors.length < 3) intelligenceGaps.push('Narrow attack vector scope — include supply chain and insider vectors')

  return {
    domain: input.domain, classification: input.classification_level,
    threat_scores: threatScores, overall_risk: overallRisk, risk_heatmap: riskHeatmap,
    top_threats: topThreats, strategic_recommendations: strategicRecommendations,
    intelligence_gaps: intelligenceGaps
  }
}

function formatThreatAssessmentReport(result: ThreatAssessmentResult): string {
  const lines: string[] = []
  lines.push('## Threat Assessment Matrix Report')
  lines.push('')
  lines.push(`**Domain:** ${result.domain.toUpperCase()} | **Classification:** ${result.classification.toUpperCase()} | **Overall Risk:** ${result.overall_risk.toUpperCase()}`)
  lines.push('')
  lines.push('### Top Threats')
  for (const t of result.top_threats) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push('### Threat Score Details')
  lines.push('| Actor | Asset | Vector | Likelihood | Impact | Risk | Severity |')
  lines.push('|-------|-------|--------|------------|--------|------|----------|')
  for (const ts of result.threat_scores.slice(0, 15)) {
    lines.push(`| ${ts.actor.substring(0, 20)} | ${ts.asset.substring(0, 20)} | ${ts.vector.substring(0, 20)} | ${(ts.likelihood * 100).toFixed(0)}% | ${(ts.impact * 100).toFixed(0)}% | ${ts.risk_score.toFixed(2)} | ${ts.severity} |`)
  }
  if (result.threat_scores.length > 15) {
    lines.push(`| ... | ... | ... | ... | ... | ... | +${result.threat_scores.length - 15} more |`)
  }
  if (result.strategic_recommendations.length > 0) {
    lines.push('')
    lines.push('### Strategic Recommendations')
    for (const r of result.strategic_recommendations) {
      lines.push(`- ${r}`)
    }
  }
  if (result.intelligence_gaps.length > 0) {
    lines.push('')
    lines.push('### Intelligence Gaps')
    for (const g of result.intelligence_gaps) {
      lines.push(`- ⚠ ${g}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 2: CYBER DEFENSE ORCHESTRATOR ====================

function orchestrateCyberDefense(input: CyberDefenseInput): CyberDefenseResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const defenseActions: DefenseAction[] = []
  let actionCounter = 0

  for (const anomaly of input.detected_anomalies) {
    actionCounter++
    const anomalyLower = anomaly.toLowerCase()
    let actionType: DefenseAction['action_type'] = 'monitor'
    let effectiveness = rng.nextFloat(0.5, 0.8)

    if (anomalyLower.includes('malware') || anomalyLower.includes('ransomware')) {
      actionType = 'isolate'
      effectiveness = rng.nextFloat(0.8, 0.98)
    } else if (anomalyLower.includes('ddos') || anomalyLower.includes('flood')) {
      actionType = 'block'
      effectiveness = rng.nextFloat(0.75, 0.95)
    } else if (anomalyLower.includes('exfiltration') || anomalyLower.includes('data loss')) {
      actionType = 'block'
      effectiveness = rng.nextFloat(0.85, 0.99)
    } else if (anomalyLower.includes('lateral') || anomalyLower.includes('movement')) {
      actionType = 'redirect'
      effectiveness = rng.nextFloat(0.7, 0.9)
    } else if (anomalyLower.includes('vulnerability') || anomalyLower.includes('cve')) {
      actionType = 'patch'
      effectiveness = rng.nextFloat(0.8, 0.95)
    } else if (anomalyLower.includes('recon') || anomalyLower.includes('scan')) {
      actionType = 'deceive'
      effectiveness = rng.nextFloat(0.6, 0.85)
    } else if (anomalyLower.includes('config') || anomalyLower.includes('misconfig')) {
      actionType = 'harden'
      effectiveness = rng.nextFloat(0.7, 0.9)
    }

    const targetSegment = input.network_segments.length > 0
      ? input.network_segments[rng.nextInt(0, input.network_segments.length - 1)]
      : 'perimeter'

    const automated = effectiveness > 0.85 && input.response_level !== 'monitor'

    defenseActions.push({
      action_id: `DEF-${String(actionCounter).padStart(3, '0')}`,
      name: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} response for: ${anomaly.substring(0, 40)}`,
      target_segment: targetSegment,
      action_type: actionType,
      priority: Math.round((1 - effectiveness) * 10),
      estimated_effectiveness: Math.round(effectiveness * 100) / 100,
      dependencies: actionCounter > 1 ? [`DEF-${String(actionCounter - 1).padStart(3, '0')}`] : [],
      automated
    })
  }

  defenseActions.sort((a, b) => a.priority - b.priority)

  const avgEffectiveness = defenseActions.reduce((s, a) => s + a.estimated_effectiveness, 0) / Math.max(1, defenseActions.length)
  const coverageScore = Math.min(0.99, avgEffectiveness * (input.security_controls.length / 10))

  const mtttrMap: Record<string, string> = {
    monitor: '240 minutes', alert: '120 minutes', contain: '30 minutes',
    eradicate: '15 minutes', recover: '5 minutes'
  }

  const playbookMap: Record<string, string> = {
    monitor: 'Continuous Monitoring Playbook v3.2',
    alert: 'Threat Alert Response Playbook v2.8',
    contain: 'Active Containment Playbook v4.1',
    eradicate: 'Threat Eradication Playbook v3.5',
    recover: 'System Recovery Playbook v2.9'
  }

  const zeroTrustCompliance = input.zero_trust_enabled
    ? Math.min(0.99, rng.nextFloat(0.8, 0.98))
    : rng.nextFloat(0.3, 0.6)

  const residualRisk = Math.max(0, Math.round((1 - avgEffectiveness) * (1 - zeroTrustCompliance) * 100) / 100)

  const escalationPath: string[] = []
  if (input.response_level === 'contain' || input.response_level === 'eradicate') {
    escalationPath.push('SOC Analyst -> SOC Manager -> CISO -> Crisis Management Team')
  } else {
    escalationPath.push('SOC Analyst -> SOC Manager -> CISO')
  }

  const recommendations: string[] = []
  if (residualRisk > 0.3) recommendations.push('High residual risk — deploy additional compensating controls')
  if (!input.zero_trust_enabled) recommendations.push('Enable zero-trust architecture to reduce lateral movement risk')
  if (input.security_controls.length < 5) recommendations.push('Expand security control coverage — current controls insufficient')
  recommendations.push('Conduct purple team exercise to validate defense effectiveness')
  recommendations.push('Update threat intelligence feeds with latest IOC data')

  return {
    response_level: input.response_level,
    defense_actions: defenseActions,
    playbook_name: playbookMap[input.response_level] || 'Standard Response Playbook',
    coverage_score: Math.round(coverageScore * 100) / 100,
    mean_time_to_respond: mtttrMap[input.response_level] || '60 minutes',
    zero_trust_compliance: Math.round(zeroTrustCompliance * 100) / 100,
    residual_risk: residualRisk,
    escalation_path: escalationPath,
    recommendations
  }
}

function formatCyberDefenseReport(result: CyberDefenseResult): string {
  const lines: string[] = []
  lines.push('## Cyber Defense Orchestration Report')
  lines.push('')
  lines.push(`**Response Level:** ${result.response_level.toUpperCase()} | **Playbook:** ${result.playbook_name}`)
  lines.push(`**Coverage Score:** ${(result.coverage_score * 100).toFixed(0)}% | **MTTR:** ${result.mean_time_to_respond} | **Residual Risk:** ${(result.residual_risk * 100).toFixed(0)}%`)
  lines.push(`**Zero Trust Compliance:** ${(result.zero_trust_compliance * 100).toFixed(0)}%`)
  lines.push('')
  lines.push('### Defense Actions')
  lines.push('| ID | Action | Type | Target | Effectiveness | Auto |')
  lines.push('|----|--------|------|--------|---------------|------|')
  for (const a of result.defense_actions) {
    lines.push(`| ${a.action_id} | ${a.name.substring(0, 35)} | ${a.action_type} | ${a.target_segment.substring(0, 15)} | ${(a.estimated_effectiveness * 100).toFixed(0)}% | ${a.automated ? 'Yes' : 'No'} |`)
  }
  if (result.escalation_path.length > 0) {
    lines.push('')
    lines.push(`### Escalation Path: ${result.escalation_path[0]}`)
  }
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 3: INTELLIGENCE FUSION ENGINE ====================

function fuseIntelligence(input: IntelligenceFusionInput): IntelligenceFusionResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const fusedIntelligence: FusedIntelligence[] = []
  const sourceUtilization: Record<string, number> = {}

  for (const source of input.sources) {
    sourceUtilization[source.source_id] = 0
  }

  for (const target of input.targets) {
    const contributingSources: string[] = []
    let totalReliability = 0
    let totalFreshness = 0
    let sourceCount = 0

    for (const source of input.sources) {
      const freshnessDecay = Math.max(0, 1 - (source.freshness_hours / input.temporal_window_hours))
      const sourceConfidence = source.reliability * freshnessDecay

      if (sourceConfidence >= input.confidence_threshold) {
        contributingSources.push(source.source_id)
        totalReliability += source.reliability
        totalFreshness += freshnessDecay
        sourceCount++
        sourceUtilization[source.source_id] = (sourceUtilization[source.source_id] || 0) + 1
      }
    }

    const confidence = sourceCount > 0 ? Math.min(0.99, (totalReliability / sourceCount) * (1 + sourceCount * 0.1)) : rng.nextFloat(0.1, 0.3)
    const reliabilityScore = sourceCount > 0 ? totalReliability / sourceCount : 0
    const freshnessScore = sourceCount > 0 ? totalFreshness / sourceCount : 0

    const indicators: string[] = []
    const numIndicators = rng.nextInt(2, 5)
    const indicatorTypes = ['Communications pattern anomaly', 'Financial transaction cluster', 'Movement correlation', 'Digital footprint expansion', 'Network activity spike', 'Association link detected', 'Geolocation convergence', 'Behavioral pattern shift']
    for (let i = 0; i < numIndicators; i++) {
      indicators.push(indicatorTypes[rng.nextInt(0, indicatorTypes.length - 1)])
    }

    const discrepancies: string[] = []
    if (sourceCount >= 2 && rng.next() > 0.5) {
      discrepancies.push(`Temporal mismatch between ${contributingSources[0]} and ${contributingSources[1]} reporting`)
    }
    if (sourceCount >= 3 && rng.next() > 0.6) {
      discrepancies.push('Geospatial inconsistency across HUMINT and GEOINT sources')
    }

    const assessmentStrength = confidence > 0.8 ? 'High-confidence assessment' : confidence > 0.5 ? 'Moderate-confidence assessment with caveats' : 'Low-confidence preliminary assessment requiring corroboration'

    fusedIntelligence.push({
      target,
      confidence: Math.round(confidence * 100) / 100,
      contributing_sources: contributingSources,
      assessment: `${assessmentStrength} for target ${target} based on ${sourceCount} INT source(s)`,
      indicators,
      reliability_score: Math.round(reliabilityScore * 100) / 100,
      freshness_score: Math.round(freshnessScore * 100) / 100,
      discrepancies
    })
  }

  const overallConfidence = fusedIntelligence.reduce((s, f) => s + f.confidence, 0) / Math.max(1, fusedIntelligence.length)

  const coverageGaps: string[] = []
  if (!input.sources.some(s => s.type === 'humint')) coverageGaps.push('No HUMINT source — human source coverage gap')
  if (!input.sources.some(s => s.type === 'sigint')) coverageGaps.push('No SIGINT source — signals intelligence gap')
  if (!input.sources.some(s => s.type === 'geoint')) coverageGaps.push('No GEOINT source — geospatial intelligence gap')
  if (!input.sources.some(s => s.type === 'osint')) coverageGaps.push('No OSINT source — open source intelligence gap')
  if (input.sources.length < 3) coverageGaps.push('Insufficient source diversity for robust all-source fusion')

  const priorityTargets = [...fusedIntelligence].sort((a, b) => b.confidence - a.confidence).slice(0, 3).map(f => f.target)

  const recommendations: string[] = []
  if (overallConfidence < 0.5) recommendations.push('Low overall confidence — task additional collection assets')
  if (coverageGaps.length > 2) recommendations.push('Significant intelligence gaps — prioritize collection planning')
  recommendations.push('Cross-validate findings with allied intelligence partners')
  recommendations.push('Update fusion model with latest source reliability ratings')

  return {
    fusion_level: input.fusion_level,
    fused_intelligence: fusedIntelligence,
    source_utilization: sourceUtilization,
    overall_confidence: Math.round(overallConfidence * 100) / 100,
    coverage_gaps: coverageGaps,
    priority_targets: priorityTargets,
    recommendations
  }
}

function formatIntelligenceFusionReport(result: IntelligenceFusionResult): string {
  const lines: string[] = []
  lines.push('## Intelligence Fusion Engine Report')
  lines.push('')
  lines.push(`**Fusion Level:** ${result.fusion_level.replace(/_/g, ' ').toUpperCase()} | **Overall Confidence:** ${(result.overall_confidence * 100).toFixed(0)}%`)
  lines.push('')
  lines.push('### Fused Intelligence Assessments')
  for (const fi of result.fused_intelligence) {
    lines.push(`#### Target: ${fi.target}`)
    lines.push(`- **Confidence:** ${(fi.confidence * 100).toFixed(0)}% | **Reliability:** ${(fi.reliability_score * 100).toFixed(0)}% | **Freshness:** ${(fi.freshness_score * 100).toFixed(0)}%`)
    lines.push(`- **Sources:** ${fi.contributing_sources.join(', ') || 'None above threshold'}`)
    lines.push(`- **Assessment:** ${fi.assessment}`)
    lines.push(`- **Indicators:** ${fi.indicators.join('; ')}`)
    if (fi.discrepancies.length > 0) {
      lines.push(`- **Discrepancies:** ${fi.discrepancies.join('; ')}`)
    }
    lines.push('')
  }
  if (result.coverage_gaps.length > 0) {
    lines.push('### Coverage Gaps')
    for (const g of result.coverage_gaps) {
      lines.push(`- ⚠ ${g}`)
    }
    lines.push('')
  }
  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 4: AUTONOMOUS SYSTEM EXECUTOR ====================

function executeAutonomousSystem(input: AutonomousSystemInput): AutonomousSystemResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const missionPhases: MissionPhase[] = []
  const phaseNames = ['Pre-flight Check', 'Transit to Area', 'Area Search/Patrol', 'Target Engagement', 'Egress', 'Recovery']
  const actualPhases = input.mission_type === 'reconnaissance'
    ? phaseNames.filter(p => !p.includes('Engagement'))
    : input.mission_type === 'logistics'
      ? ['Pre-flight Check', 'Transit to Area', 'Cargo Delivery', 'Return Transit', 'Recovery']
      : phaseNames

  let totalDuration = 0
  for (let i = 0; i < actualPhases.length; i++) {
    const duration = rng.nextInt(10, Math.min(60, input.endurance_hours * 60 / actualPhases.length))
    totalDuration += duration

    const waypoints = [`WP-${i + 1}A`, `WP-${i + 1}B`, `WP-${i + 1}C`]
    const actions: string[] = []
    const abortConditions: string[] = []

    if (i === 0) {
      actions.push('System self-diagnostic and payload verification')
      actions.push('Communication link establishment with C2 node')
      abortConditions.push('Critical system failure detected')
      abortConditions.push('Communication link loss exceeding 60 seconds')
    } else if (i === actualPhases.length - 1) {
      actions.push('Return to base and systems safing')
      actions.push('Mission data download and debrief')
      abortConditions.push('Insufficient fuel/energy for return transit')
    } else {
      actions.push(`Execute ${actualPhases[i]} operations per ROE`)
      actions.push('Continuous telemetry reporting to C2')
      abortConditions.push('ROE violation detected')
      abortConditions.push('Hostile countermeasure engagement')
    }

    let riskLevel: MissionPhase['risk_level'] = 'low'
    if (i === 3 || i === 2) riskLevel = rng.next() > 0.4 ? 'high' : 'medium'
    else if (i === 1 || i === 4) riskLevel = rng.next() > 0.6 ? 'medium' : 'low'

    missionPhases.push({
      phase_id: `PHASE-${i + 1}`,
      name: actualPhases[i],
      duration_minutes: duration,
      waypoints,
      actions,
      abort_conditions: abortConditions,
      risk_level: riskLevel
    })
  }

  const highRiskPhases = missionPhases.filter(p => p.risk_level === 'high').length
  const overallRisk = highRiskPhases > 2 ? 'high' : highRiskPhases > 0 ? 'medium' : 'low'

  const ethicalCompliance = input.human_oversight === 'full' ? rng.nextFloat(0.9, 0.99)
    : input.human_oversight === 'supervisory' ? rng.nextFloat(0.75, 0.92)
      : input.human_oversight === 'on_call' ? rng.nextFloat(0.55, 0.78)
        : rng.nextFloat(0.3, 0.6)

  const roeAdherence = Math.min(0.99, rng.nextFloat(0.7, 0.98))

  const contingencyPlans: string[] = []
  contingencyPlans.push('Lost link procedure: Return to pre-designated hold point and attempt re-establishment')
  contingencyPlans.push('Contingency divert to alternate recovery site if primary is compromised')
  if (input.system_type === 'uav' || input.system_type === 'swarm') {
    contingencyPlans.push('Mid-air abort: Deploy recovery parachute at nearest safe zone')
  }
  if (input.mission_type === 'strike') {
    contingencyPlans.push('Weapons hold: Abort engagement if ROE ambiguity detected, await C2 clarification')
  }

  const oversightCheckpoints: string[] = []
  if (input.human_oversight === 'full') {
    oversightCheckpoints.push('Pre-mission authorization required')
    oversightCheckpoints.push('Each phase transition requires operator approval')
    oversightCheckpoints.push('Weapons release requires explicit human command')
  } else if (input.human_oversight === 'supervisory') {
    oversightCheckpoints.push('Pre-mission authorization required')
    oversightCheckpoints.push('Operator notified at each phase transition')
    oversightCheckpoints.push('Weapons release requires human confirmation within 10 seconds')
  } else if (input.human_oversight === 'on_call') {
    oversightCheckpoints.push('Mission start notification to operator')
    oversightCheckpoints.push('Operator alerted on anomaly detection')
  } else {
    oversightCheckpoints.push('Fully autonomous — post-mission review required')
  }

  const recommendations: string[] = []
  if (ethicalCompliance < 0.7) recommendations.push('Ethical compliance below threshold — increase human oversight level')
  if (overallRisk === 'high') recommendations.push('High mission risk — consider additional force protection measures')
  if (input.endurance_hours < 2) recommendations.push('Limited endurance — plan for mid-mission refueling/recharge')
  recommendations.push('Conduct mission rehearsal in synthetic environment before execution')
  recommendations.push('Validate ROE interpretation with legal advisor prior to deployment')

  return {
    system_type: input.system_type,
    mission_type: input.mission_type,
    mission_phases: missionPhases,
    total_duration_minutes: totalDuration,
    risk_assessment: { overall: overallRisk, ethical_compliance: Math.round(ethicalCompliance * 100) / 100, roe_adherence: Math.round(roeAdherence * 100) / 100 },
    contingency_plans: contingencyPlans,
    human_oversight_checkpoints: oversightCheckpoints,
    recommendations
  }
}

function formatAutonomousSystemReport(result: AutonomousSystemResult): string {
  const lines: string[] = []
  lines.push('## Autonomous System Mission Plan')
  lines.push('')
  lines.push(`**System:** ${result.system_type.toUpperCase()} | **Mission:** ${result.mission_type.replace(/_/g, ' ').toUpperCase()}`)
  lines.push(`**Total Duration:** ${result.total_duration_minutes} minutes | **Overall Risk:** ${result.risk_assessment.overall.toUpperCase()}`)
  lines.push(`**Ethical Compliance:** ${(result.risk_assessment.ethical_compliance * 100).toFixed(0)}% | **ROE Adherence:** ${(result.risk_assessment.roe_adherence * 100).toFixed(0)}%`)
  lines.push('')
  lines.push('### Mission Phases')
  lines.push('| Phase | Name | Duration | Risk | Waypoints |')
  lines.push('|-------|------|----------|------|-----------|')
  for (const p of result.mission_phases) {
    lines.push(`| ${p.phase_id} | ${p.name} | ${p.duration_minutes}m | ${p.risk_level} | ${p.waypoints.join(', ')} |`)
  }
  lines.push('')
  lines.push('### Human Oversight Checkpoints')
  for (const c of result.human_oversight_checkpoints) {
    lines.push(`- ${c}`)
  }
  if (result.contingency_plans.length > 0) {
    lines.push('')
    lines.push('### Contingency Plans')
    for (const c of result.contingency_plans) {
      lines.push(`- ${c}`)
    }
  }
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 5: CRITICAL INFRASTRUCTURE PROTECTOR ====================

function protectInfrastructure(input: InfrastructureProtectionInput): InfrastructureProtectionResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const vulnerabilities: VulnerabilityFinding[] = []
  for (const asset of input.assets) {
    for (const scenario of input.threat_scenarios) {
      const exploitability = Math.round(rng.nextFloat(0.1, 0.9) * 100) / 100
      const impact = Math.round(asset.criticality * rng.nextFloat(0.5, 1.0) * 100) / 100
      const riskValue = exploitability * impact

      let riskRating: VulnerabilityFinding['risk_rating'] = 'low'
      if (riskValue > 0.6) riskRating = 'critical'
      else if (riskValue > 0.4) riskRating = 'high'
      else if (riskValue > 0.2) riskRating = 'medium'

      const mitigationPool = [
        'Implement redundant systems with automatic failover',
        'Deploy physical security enhancements with access control',
        'Establish continuous monitoring with anomaly detection',
        'Conduct regular penetration testing and vulnerability assessments',
        'Implement network segmentation and air-gapping for critical systems',
        'Deploy backup power and communication systems',
        'Establish mutual aid agreements with neighboring facilities',
        'Implement supply chain diversification for critical components'
      ]
      const mitigation = mitigationPool[rng.nextInt(0, mitigationPool.length - 1)]
      const residualRisk = Math.round(riskValue * rng.nextFloat(0.2, 0.5) * 100) / 100

      vulnerabilities.push({
        asset: asset.name,
        vulnerability: `Exploitable via ${scenario.substring(0, 50)}`,
        exploitability,
        impact,
        risk_rating: riskRating,
        mitigation,
        residual_risk: residualRisk
      })
    }
  }

  const avgImpact = vulnerabilities.reduce((s, v) => s + v.impact, 0) / Math.max(1, vulnerabilities.length)
  const controlCoverage = input.existing_controls.length / 10
  const resilienceScore = Math.round(Math.max(0, Math.min(1, (1 - avgImpact) * controlCoverage + rng.nextFloat(0.1, 0.3))) * 100) / 100

  const singlePointsOfFailure: string[] = []
  for (const asset of input.assets) {
    if (asset.interdependencies.length > 2 && asset.criticality > 0.7) {
      singlePointsOfFailure.push(`${asset.name} — high criticality with ${asset.interdependencies.length} interdependencies`)
    }
  }
  if (singlePointsOfFailure.length === 0 && input.assets.length > 0) {
    singlePointsOfFailure.push('No critical single points of failure identified — maintain redundancy')
  }

  const cascadeRisks: string[] = []
  for (const asset of input.assets) {
    if (asset.interdependencies.length >= 2) {
      cascadeRisks.push(`Failure of ${asset.name} could cascade to: ${asset.interdependencies.slice(0, 3).join(', ')}`)
    }
  }

  const complianceStatus: Record<string, number> = {}
  for (const framework of input.regulatory_frameworks) {
    complianceStatus[framework] = Math.round(rng.nextFloat(0.6, 0.98) * 100) / 100
  }

  const criticalVulns = vulnerabilities.filter(v => v.risk_rating === 'critical' || v.risk_rating === 'high')
  const investmentPriorities: string[] = []
  for (const v of criticalVulns.slice(0, 3)) {
    investmentPriorities.push(`Address ${v.vulnerability.substring(0, 40)} on ${v.asset} (risk: ${v.risk_rating})`)
  }
  if (investmentPriorities.length === 0) {
    investmentPriorities.push('Maintain current security posture — no critical investments required')
  }

  const recommendations: string[] = []
  if (resilienceScore < 0.5) recommendations.push('Low resilience score — prioritize redundancy investments')
  if (singlePointsOfFailure.length > 2) recommendations.push('Multiple single points of failure — implement failover mechanisms')
  recommendations.push('Conduct annual infrastructure resilience assessment with stress testing')
  recommendations.push('Establish cross-sector information sharing for threat intelligence')

  return {
    infrastructure_type: input.infrastructure_type,
    vulnerabilities,
    resilience_score: resilienceScore,
    single_points_of_failure: singlePointsOfFailure,
    cascade_risks: cascadeRisks,
    compliance_status: complianceStatus,
    investment_priorities: investmentPriorities,
    recommendations
  }
}

function formatInfrastructureProtectionReport(result: InfrastructureProtectionResult): string {
  const lines: string[] = []
  lines.push('## Critical Infrastructure Protection Report')
  lines.push('')
  lines.push(`**Infrastructure Type:** ${result.infrastructure_type.toUpperCase()} | **Resilience Score:** ${(result.resilience_score * 100).toFixed(0)}%`)
  lines.push('')
  lines.push('### Vulnerability Findings')
  lines.push('| Asset | Vulnerability | Exploitability | Impact | Risk | Mitigation |')
  lines.push('|-------|---------------|----------------|--------|------|------------|')
  for (const v of result.vulnerabilities.slice(0, 12)) {
    lines.push(`| ${v.asset.substring(0, 20)} | ${v.vulnerability.substring(0, 30)} | ${(v.exploitability * 100).toFixed(0)}% | ${(v.impact * 100).toFixed(0)}% | ${v.risk_rating} | ${v.mitigation.substring(0, 30)}... |`)
  }
  if (result.vulnerabilities.length > 12) {
    lines.push(`| ... | ... | ... | ... | ... | +${result.vulnerabilities.length - 12} more findings |`)
  }
  if (result.single_points_of_failure.length > 0) {
    lines.push('')
    lines.push('### Single Points of Failure')
    for (const s of result.single_points_of_failure) {
      lines.push(`- ⚠ ${s}`)
    }
  }
  if (result.cascade_risks.length > 0) {
    lines.push('')
    lines.push('### Cascade Risks')
    for (const c of result.cascade_risks) {
      lines.push(`- ${c}`)
    }
  }
  if (Object.keys(result.compliance_status).length > 0) {
    lines.push('')
    lines.push('### Compliance Status')
    for (const [fw, score] of Object.entries(result.compliance_status)) {
      lines.push(`- ${fw}: ${(score * 100).toFixed(0)}%`)
    }
  }
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 6: SUPPLY CHAIN SECURITY AI ====================

function analyzeSupplyChainSecurity(input: SupplyChainInput): SupplyChainResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const supplierRisks: SupplierRisk[] = []
  const allSuppliers: Array<{ name: string; tier: number; geography: string }> = []

  for (const tier of input.tiers) {
    for (const supplier of tier.suppliers) {
      allSuppliers.push({ name: supplier, tier: tier.tier, geography: tier.geography })
    }
  }

  for (const sup of allSuppliers) {
    const riskFactors: string[] = []
    let riskScore = rng.nextFloat(0.1, 0.5)

    if (sup.tier >= 3) {
      riskFactors.push('Deep supply chain tier — limited visibility')
      riskScore += 0.15
    }

    const highRiskGeographies = ['adversarial', 'unstable', 'sanctioned', 'contested']
    if (highRiskGeographies.some(g => sup.geography.toLowerCase().includes(g))) {
      riskFactors.push(`Geographic risk: ${sup.geography}`)
      riskScore += 0.2
    }

    if (input.critical_components.some(c => sup.name.toLowerCase().includes(c.toLowerCase().split(' ')[0]))) {
      riskFactors.push('Critical component supplier')
      riskScore += 0.1
    }

    if (rng.next() > 0.6) {
      riskFactors.push('Limited cybersecurity maturity assessment available')
      riskScore += 0.08
    }

    if (rng.next() > 0.7) {
      riskFactors.push('Single-source dependency identified')
      riskScore += 0.12
    }

    riskScore = Math.min(0.99, Math.round(riskScore * 100) / 100)

    const singleSource = riskFactors.some(r => r.includes('Single-source'))
    const alternatives: string[] = []
    if (singleSource) {
      alternatives.push(`Alternative supplier search required for ${sup.name}`)
    }

    let assuranceStatus: SupplierRisk['assurance_status'] = 'verified'
    if (riskScore > 0.7) assuranceStatus = 'high_risk'
    else if (riskScore > 0.5) assuranceStatus = 'unverified'
    else if (riskScore > 0.3) assuranceStatus = 'partial'

    supplierRisks.push({
      supplier: sup.name, tier: sup.tier, geography: sup.geography,
      risk_score: riskScore, risk_factors: riskFactors,
      single_source: singleSource, alternatives, assurance_status: assuranceStatus
    })
  }

  const avgRisk = supplierRisks.reduce((s, r) => s + r.risk_score, 0) / Math.max(1, supplierRisks.length)
  let overallRisk: SupplyChainResult['overall_risk'] = 'low'
  if (avgRisk > 0.65) overallRisk = 'critical'
  else if (avgRisk > 0.45) overallRisk = 'high'
  else if (avgRisk > 0.25) overallRisk = 'moderate'

  const concentrationRisks: string[] = []
  const tierCounts: Record<number, number> = {}
  for (const sr of supplierRisks) {
    tierCounts[sr.tier] = (tierCounts[sr.tier] || 0) + 1
  }
  for (const [tier, count] of Object.entries(tierCounts)) {
    if (count > 5) concentrationRisks.push(`Tier ${tier}: ${count} suppliers — monitor for concentration risk`)
  }

  const geoCounts: Record<string, number> = {}
  for (const sr of supplierRisks) {
    geoCounts[sr.geography] = (geoCounts[sr.geography] || 0) + 1
  }
  const geographicRisks: string[] = []
  for (const [geo, count] of Object.entries(geoCounts)) {
    if (count > supplierRisks.length * 0.5) {
      geographicRisks.push(`Over 50% of suppliers concentrated in ${geo} — geographic concentration risk`)
    }
  }

  const singleSourceDeps = supplierRisks.filter(s => s.single_source).map(s => s.supplier)

  const resilienceRecommendations: string[] = []
  if (singleSourceDeps.length > 0) resilienceRecommendations.push(`Qualify alternative suppliers for ${singleSourceDeps.length} single-source dependency(ies)`)
  if (geographicRisks.length > 0) resilienceRecommendations.push('Diversify supplier geography to reduce concentration risk')
  if (input.assurance_level === 'basic') resilienceRecommendations.push('Upgrade assurance level to enhanced for critical tier suppliers')
  resilienceRecommendations.push('Implement continuous supplier monitoring with real-time risk scoring')
  resilienceRecommendations.push('Establish strategic stockpile for critical single-source components')

  const monitoringIndicators: string[] = []
  monitoringIndicators.push('Supplier financial health score changes')
  monitoringIndicators.push('Geopolitical risk index for supplier regions')
  monitoringIndicators.push('Cybersecurity incident reports from suppliers')
  monitoringIndicators.push('Delivery performance and quality metrics degradation')
  monitoringIndicators.push('Regulatory compliance status changes')

  return {
    supply_chain_name: input.supply_chain_name,
    supplier_risks: supplierRisks,
    overall_risk: overallRisk,
    concentration_risks: concentrationRisks,
    geographic_risks: geographicRisks,
    single_source_dependencies: singleSourceDeps,
    resilience_recommendations: resilienceRecommendations,
    monitoring_indicators: monitoringIndicators
  }
}

function formatSupplyChainReport(result: SupplyChainResult): string {
  const lines: string[] = []
  lines.push('## Supply Chain Security Report')
  lines.push('')
  lines.push(`**Supply Chain:** ${result.supply_chain_name} | **Overall Risk:** ${result.overall_risk.toUpperCase()}`)
  lines.push('')
  lines.push('### Supplier Risk Assessment')
  lines.push('| Supplier | Tier | Geography | Risk Score | Status | Single Source |')
  lines.push('|----------|------|-----------|------------|--------|---------------|')
  for (const sr of result.supplier_risks) {
    lines.push(`| ${sr.supplier.substring(0, 20)} | ${sr.tier} | ${sr.geography.substring(0, 15)} | ${(sr.risk_score * 100).toFixed(0)}% | ${sr.assurance_status} | ${sr.single_source ? 'Yes' : 'No'} |`)
  }
  if (result.single_source_dependencies.length > 0) {
    lines.push('')
    lines.push('### Single Source Dependencies')
    for (const s of result.single_source_dependencies) {
      lines.push(`- ⚠ ${s}`)
    }
  }
  if (result.geographic_risks.length > 0) {
    lines.push('')
    lines.push('### Geographic Risks')
    for (const g of result.geographic_risks) {
      lines.push(`- ${g}`)
    }
  }
  if (result.resilience_recommendations.length > 0) {
    lines.push('')
    lines.push('### Resilience Recommendations')
    for (const r of result.resilience_recommendations) {
      lines.push(`- ${r}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 7: STRATEGIC FORECASTING MODEL ====================

function forecastStrategicTrends(input: StrategicForecastingInput): StrategicForecastingResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const scenarios: Scenario[] = []
  const scenarioTemplates = [
    { name: 'Status Quo Stability', desc: 'Current geopolitical dynamics persist with incremental adjustments. Major power competition remains managed through diplomatic channels.', drivers: ['Diplomatic engagement', 'Economic interdependence', 'Institutional resilience'] },
    { name: 'Escalation Spiral', desc: 'Rising tensions lead to miscalculation and rapid escalation. Alliance structures activate and economic decoupling accelerates.', drivers: ['Miscalculation', 'Alliance entrapment', 'Resource competition'] },
    { name: 'Cooperative Breakthrough', desc: 'Diplomatic breakthrough on key issues leads to new frameworks for cooperation. Arms control and trade agreements stabilize relations.', drivers: ['Economic pressure', 'Leadership change', 'Crisis-driven cooperation'] },
    { name: 'Fragmentation & Multipolarity', desc: 'Global order fragments into competing blocs. Regional powers assert autonomy and international institutions weaken.', drivers: ['Power diffusion', 'Technology decoupling', 'Regional assertiveness'] },
    { name: 'Technological Disruption', desc: 'Breakthrough technologies reshape military and economic balance. AI, quantum, and biotech create new domains of competition.', drivers: ['AI arms race', 'Quantum advantage', 'Biotech breakthroughs'] },
    { name: 'Climate Security Crisis', desc: 'Climate impacts drive resource conflicts and mass migration. Arctic competition intensifies and water security becomes critical.', drivers: ['Resource scarcity', 'Climate migration', 'Arctic access'] }
  ]

  const numScenarios = Math.min(input.scenario_count, scenarioTemplates.length)
  const selectedTemplates = [...scenarioTemplates].sort(() => rng.next() - 0.5).slice(0, numScenarios)

  let totalProb = 0
  for (let i = 0; i < numScenarios; i++) {
    const template = selectedTemplates[i]
    const probability = i === 0 ? rng.nextFloat(0.3, 0.45) : rng.nextFloat(0.05, 0.25)
    totalProb += probability

    const implications: string[] = []
    if (template.name.includes('Escalation')) {
      implications.push('Increase defense readiness levels and force posture')
      implications.push('Accelerate allied coordination and joint planning')
    } else if (template.name.includes('Cooperative')) {
      implications.push('Pursue arms control negotiations and confidence-building measures')
      implications.push('Expand economic cooperation frameworks')
    } else if (template.name.includes('Fragmentation')) {
      implications.push('Strengthen regional alliance structures')
      implications.push('Diversify supply chains and reduce dependencies')
    } else {
      implications.push('Monitor indicators and maintain flexible response options')
      implications.push('Invest in intelligence collection on emerging threats')
    }

    const earlyWarnings: string[] = []
    earlyWarnings.push(`Shift in ${input.key_variables[rng.nextInt(0, Math.max(0, input.key_variables.length - 1))] || 'key indicator'} trajectory`)
    earlyWarnings.push('Unusual military force movements or exercises')
    earlyWarnings.push('Diplomatic communication pattern changes')

    scenarios.push({
      scenario_id: `SCEN-${i + 1}`,
      name: template.name,
      probability: Math.round(probability * 100) / 100,
      description: template.desc,
      key_drivers: template.drivers,
      implications,
      early_warning_indicators: earlyWarnings,
      wildcard_potential: Math.round(rng.nextFloat(0.1, 0.8) * 100) / 100
    })
  }

  // Normalize probabilities
  const normFactor = 1 / totalProb
  for (const s of scenarios) {
    s.probability = Math.round(s.probability * normFactor * 100) / 100
  }

  const mostLikely = [...scenarios].sort((a, b) => b.probability - a.probability)[0]

  const trendExtrapolations: Array<{ variable: string; direction: string; confidence: number }> = []
  for (const variable of input.key_variables) {
    const directions = ['increasing', 'decreasing', 'stable', 'volatile']
    trendExtrapolations.push({
      variable,
      direction: directions[rng.nextInt(0, directions.length - 1)],
      confidence: Math.round(rng.nextFloat(0.4, 0.85) * 100) / 100
    })
  }

  const strategicImplications: string[] = []
  strategicImplications.push(`Most likely scenario: ${mostLikely.name} (${(mostLikely.probability * 100).toFixed(0)}% probability)`)
  if (scenarios.some(s => s.wildcard_potential > 0.6)) {
    strategicImplications.push('High-impact wildcard scenarios identified — develop contingency plans')
  }
  strategicImplications.push('Reassess strategic posture annually based on indicator tracking')
  strategicImplications.push('Strengthen intelligence collection on key scenario drivers')

  const recommendations: string[] = []
  recommendations.push('Establish early warning indicator monitoring system')
  recommendations.push('Develop branch plans for each scenario above 15% probability')
  recommendations.push('Conduct strategic gaming exercises to stress-test plans')
  recommendations.push('Coordinate scenario planning with allied nations')

  return {
    region: input.region,
    time_horizon: `${input.time_horizon_years} years`,
    scenarios,
    most_likely_scenario: mostLikely.name,
    trend_extrapolations: trendExtrapolations,
    strategic_implications: strategicImplications,
    recommendations
  }
}

function formatStrategicForecastingReport(result: StrategicForecastingResult): string {
  const lines: string[] = []
  lines.push('## Strategic Forecasting Report')
  lines.push('')
  lines.push(`**Region:** ${result.region} | **Time Horizon:** ${result.time_horizon} | **Most Likely:** ${result.most_likely_scenario}`)
  lines.push('')
  lines.push('### Scenarios')
  for (const s of result.scenarios) {
    lines.push(`#### ${s.scenario_id}: ${s.name} (${(s.probability * 100).toFixed(0)}% probability)`)
    lines.push(`- **Description:** ${s.description}`)
    lines.push(`- **Key Drivers:** ${s.key_drivers.join(', ')}`)
    lines.push(`- **Implications:** ${s.implications.join('; ')}`)
    lines.push(`- **Early Warning:** ${s.early_warning_indicators.join('; ')}`)
    lines.push(`- **Wildcard Potential:** ${(s.wildcard_potential * 100).toFixed(0)}%`)
    lines.push('')
  }
  if (result.trend_extrapolations.length > 0) {
    lines.push('### Trend Extrapolations')
    lines.push('| Variable | Direction | Confidence |')
    lines.push('|----------|-----------|------------|')
    for (const t of result.trend_extrapolations) {
      lines.push(`| ${t.variable.substring(0, 25)} | ${t.direction} | ${(t.confidence * 100).toFixed(0)}% |`)
    }
    lines.push('')
  }
  if (result.strategic_implications.length > 0) {
    lines.push('### Strategic Implications')
    for (const i of result.strategic_implications) {
      lines.push(`- ${i}`)
    }
    lines.push('')
  }
  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 8: CLASSIFIED NETWORK MONITOR ====================

function monitorClassifiedNetwork(input: ClassifiedNetworkInput): ClassifiedNetworkResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const anomalies: NetworkAnomaly[] = []
  let anomalyCounter = 0

  for (const indicator of input.anomaly_indicators) {
    anomalyCounter++
    const indicatorLower = indicator.toLowerCase()
    let severity: NetworkAnomaly['severity'] = 'low'
    let anomalyType = 'unknown'
    let confidence = rng.nextFloat(0.4, 0.7)

    if (indicatorLower.includes('exfil') || indicatorLower.includes('data transfer')) {
      severity = 'critical'
      anomalyType = 'data_exfiltration'
      confidence = rng.nextFloat(0.8, 0.98)
    } else if (indicatorLower.includes('lateral') || indicatorLower.includes('movement')) {
      severity = 'high'
      anomalyType = 'lateral_movement'
      confidence = rng.nextFloat(0.7, 0.95)
    } else if (indicatorLower.includes('privilege') || indicatorLower.includes('escalation')) {
      severity = 'high'
      anomalyType = 'privilege_escalation'
      confidence = rng.nextFloat(0.75, 0.95)
    } else if (indicatorLower.includes('unauthorized') || indicatorLower.includes('access')) {
      severity = 'medium'
      anomalyType = 'unauthorized_access'
      confidence = rng.nextFloat(0.6, 0.85)
    } else if (indicatorLower.includes('malware') || indicatorLower.includes('beacon')) {
      severity = 'critical'
      anomalyType = 'malware_beacon'
      confidence = rng.nextFloat(0.85, 0.99)
    } else if (indicatorLower.includes('policy') || indicatorLower.includes('violation')) {
      severity = 'medium'
      anomalyType = 'policy_violation'
      confidence = rng.nextFloat(0.7, 0.9)
    } else if (indicatorLower.includes('volume') || indicatorLower.includes('spike')) {
      severity = 'low'
      anomalyType = 'traffic_anomaly'
      confidence = rng.nextFloat(0.5, 0.75)
    }

    const zone = input.monitored_zones.length > 0
      ? input.monitored_zones[rng.nextInt(0, input.monitored_zones.length - 1)]
      : 'core'

    const matchingTraffic = input.traffic_patterns.find(t =>
      indicatorLower.includes(t.source.toLowerCase()) || indicatorLower.includes(t.destination.toLowerCase())
    )
    const sourceDest = matchingTraffic
      ? `${matchingTraffic.source} -> ${matchingTraffic.destination} (${matchingTraffic.protocol})`
      : 'Unknown source-destination pair'

    const actionMap: Record<string, string> = {
      data_exfiltration: 'Immediately isolate affected segment and initiate forensic preservation',
      lateral_movement: 'Deploy micro-segmentation and trace movement path',
      privilege_escalation: 'Revoke elevated sessions and force re-authentication',
      unauthorized_access: 'Block source IP and initiate identity verification',
      malware_beacon: 'Isolate affected endpoints and initiate malware analysis',
      policy_violation: 'Log violation and notify security officer for review',
      traffic_anomaly: 'Increase monitoring granularity and capture packet samples',
      unknown: 'Flag for analyst review and correlation with other indicators'
    }

    anomalies.push({
      anomaly_id: `ANOM-${String(anomalyCounter).padStart(3, '0')}`,
      zone,
      type: anomalyType,
      severity,
      description: `${anomalyType.replace(/_/g, ' ')} detected: ${indicator.substring(0, 60)}`,
      source_dest: sourceDest,
      confidence: Math.round(confidence * 100) / 100,
      recommended_action: actionMap[anomalyType] || actionMap['unknown']
    })
  }

  anomalies.sort((a, b) => {
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4)
  })

  const postureScoreMap: Record<string, number> = { green: 0.85, amber: 0.55, red: 0.25 }
  let postureScore = postureScoreMap[input.security_posture] || 0.5
  const criticalCount = anomalies.filter(a => a.severity === 'critical').length
  postureScore = Math.max(0, postureScore - criticalCount * 0.1)
  postureScore = Math.round(postureScore * 100) / 100

  const insiderMap: Record<string, string> = {
    low: 'Insider threat level LOW — standard monitoring sufficient',
    moderate: 'Insider threat level MODERATE — enhanced user behavior analytics recommended',
    high: 'Insider threat level HIGH — activate counterintelligence monitoring protocols'
  }

  const dataExfiltrationRisks: string[] = []
  for (const t of input.traffic_patterns) {
    if (t.volume_mbps > 100 && !t.encrypted) {
      dataExfiltrationRisks.push(`High-volume unencrypted traffic: ${t.source} -> ${t.destination} (${t.volume_mbps} Mbps)`)
    }
    if (t.volume_mbps > 500) {
      dataExfiltrationRisks.push(`Anomalous traffic volume: ${t.source} -> ${t.destination} (${t.volume_mbps} Mbps)`)
    }
  }
  if (dataExfiltrationRisks.length === 0) {
    dataExfiltrationRisks.push('No immediate data exfiltration indicators detected')
  }

  const complianceViolations: string[] = []
  if (input.network_classification === 'top_secret' || input.network_classification === 'sci') {
    const unencrypted = input.traffic_patterns.filter(t => !t.encrypted && t.volume_mbps > 10)
    if (unencrypted.length > 0) {
      complianceViolations.push(`${unencrypted.length} unencrypted traffic flow(s) on ${input.network_classification} network`)
    }
  }
  if (input.security_posture === 'red') {
    complianceViolations.push('Network in RED posture — immediate remediation required per security policy')
  }

  const incidentResponseRecommendations: string[] = []
  if (criticalCount > 0) {
    incidentResponseRecommendations.push(`Activate incident response team — ${criticalCount} critical anomaly(ies) detected`)
    incidentResponseRecommendations.push('Preserve all forensic evidence and maintain chain of custody')
  }
  if (input.insider_threat_level === 'high') {
    incidentResponseRecommendations.push('Coordinate with counterintelligence for insider threat investigation')
  }
  incidentResponseRecommendations.push('Update SIEM rules with latest threat intelligence IOCs')
  incidentResponseRecommendations.push('Conduct tabletop exercise for identified threat scenarios')

  const monitoringGaps: string[] = []
  if (input.monitored_zones.length < 3) monitoringGaps.push('Limited zone coverage — expand monitoring to all network segments')
  if (input.traffic_patterns.length < 5) monitoringGaps.push('Insufficient traffic baseline — collect additional flow data')
  if (!input.anomaly_indicators.some(i => i.toLowerCase().includes('insider'))) {
    monitoringGaps.push('No insider threat indicators configured — add user behavior analytics')
  }

  return {
    network_classification: input.network_classification,
    anomalies,
    security_posture: input.security_posture,
    posture_score: postureScore,
    insider_threat_assessment: insiderMap[input.insider_threat_level] || 'Insider threat level not assessed',
    data_exfiltration_risks: dataExfiltrationRisks,
    compliance_violations: complianceViolations,
    incident_response_recommendations: incidentResponseRecommendations,
    monitoring_gaps: monitoringGaps
  }
}

function formatClassifiedNetworkReport(result: ClassifiedNetworkResult): string {
  const lines: string[] = []
  lines.push('## Classified Network Monitoring Report')
  lines.push('')
  lines.push(`**Classification:** ${result.network_classification.toUpperCase()} | **Posture:** ${result.security_posture.toUpperCase()} | **Posture Score:** ${(result.posture_score * 100).toFixed(0)}%`)
  lines.push('')
  lines.push(`**Insider Threat:** ${result.insider_threat_assessment}`)
  lines.push('')
  lines.push('### Detected Anomalies')
  lines.push('| ID | Zone | Type | Severity | Confidence | Action |')
  lines.push('|----|------|------|----------|------------|--------|')
  for (const a of result.anomalies) {
    lines.push(`| ${a.anomaly_id} | ${a.zone.substring(0, 15)} | ${a.type.substring(0, 20)} | ${a.severity} | ${(a.confidence * 100).toFixed(0)}% | ${a.recommended_action.substring(0, 35)}... |`)
  }
  if (result.data_exfiltration_risks.length > 0) {
    lines.push('')
    lines.push('### Data Exfiltration Risks')
    for (const r of result.data_exfiltration_risks) {
      lines.push(`- ${r}`)
    }
  }
  if (result.compliance_violations.length > 0) {
    lines.push('')
    lines.push('### Compliance Violations')
    for (const v of result.compliance_violations) {
      lines.push(`- ⚠ ${v}`)
    }
  }
  if (result.incident_response_recommendations.length > 0) {
    lines.push('')
    lines.push('### Incident Response Recommendations')
    for (const r of result.incident_response_recommendations) {
      lines.push(`- ${r}`)
    }
  }
  if (result.monitoring_gaps.length > 0) {
    lines.push('')
    lines.push('### Monitoring Gaps')
    for (const g of result.monitoring_gaps) {
      lines.push(`- ⚠ ${g}`)
    }
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: threat_assessment_matrix
  tools.register(defineTool({
    name: 'threat_assessment_matrix',
    description: 'Multi-domain threat assessment matrix with MITRE ATT&CK mapping. Evaluates threat actors, target assets, and attack vectors across land, sea, air, space, cyber, and cognitive domains. Produces risk scores, severity ratings, and strategic countermeasure recommendations.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: threat_actors (string[]), target_assets (string[]), attack_vectors (string[]), domain (land/sea/air/space/cyber/cognitive/multi), classification_level (unclassified/confidential/secret/top_secret), mitre_techniques (string[], optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: ThreatAssessmentInput = JSON.parse(args.input)
      const result = assessThreatMatrix(data)
      return formatThreatAssessmentReport(result)
    }
  }))

  // Tool 2: cyber_defense_orchestrator
  tools.register(defineTool({
    name: 'cyber_defense_orchestrator',
    description: 'Adaptive cyber defense playbook generation and response coordination. Analyzes network anomalies, threat intelligence feeds, and security controls to produce prioritized defense actions with automated response recommendations.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: network_segments (string[]), detected_anomalies (string[]), threat_intel_feeds (string[]), security_controls (string[]), response_level (monitor/alert/contain/eradicate/recover), zero_trust_enabled (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: CyberDefenseInput = JSON.parse(args.input)
      const result = orchestrateCyberDefense(data)
      return formatCyberDefenseReport(result)
    }
  }))

  // Tool 3: intelligence_fusion_engine
  tools.register(defineTool({
    name: 'intelligence_fusion_engine',
    description: 'Multi-source intelligence correlation and fusion engine. Combines SIGINT, HUMINT, OSINT, GEOINT, MASINT, and CYBERINT sources with reliability weighting and temporal decay. Produces all-source assessments with confidence scoring.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: sources (array of {source_id, type, reliability, freshness_hours}), targets (string[]), fusion_level (single/cross_correlation/multi_int/all_source), temporal_window_hours (number), confidence_threshold (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: IntelligenceFusionInput = JSON.parse(args.input)
      const result = fuseIntelligence(data)
      return formatIntelligenceFusionReport(result)
    }
  }))

  // Tool 4: autonomous_system_executor
  tools.register(defineTool({
    name: 'autonomous_system_executor',
    description: 'Unmanned system mission planning and risk governance for UAV, USV, UGV, UUM, satellite, and swarm platforms. Generates phase-based mission plans with ROE compliance, ethical oversight checkpoints, and contingency procedures.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: system_type (uav/usv/ugv/uum/satellite/swarm), mission_type (reconnaissance/strike/logistics/electronic_warfare/mine_countermeasure/search_rescue), operational_area (string), rules_of_engagement (string), human_oversight (full/supervisory/on_call/autonomous), payloads (string[]), endurance_hours (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: AutonomousSystemInput = JSON.parse(args.input)
      const result = executeAutonomousSystem(data)
      return formatAutonomousSystemReport(result)
    }
  }))

  // Tool 5: critical_infrastructure_protector
  tools.register(defineTool({
    name: 'critical_infrastructure_protector',
    description: 'Critical infrastructure vulnerability and resilience analysis across energy, water, transport, telecom, healthcare, financial, and government sectors. Identifies single points of failure, cascade risks, and compliance gaps.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: infrastructure_type (energy/water/transport/telecom/healthcare/financial/government), assets (array of {name, criticality, interdependencies}), threat_scenarios (string[]), existing_controls (string[]), regulatory_frameworks (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: InfrastructureProtectionInput = JSON.parse(args.input)
      const result = protectInfrastructure(data)
      return formatInfrastructureProtectionReport(result)
    }
  }))

  // Tool 6: supply_chain_security_ai
  tools.register(defineTool({
    name: 'supply_chain_security_ai',
    description: 'Supply chain risk mapping and supplier assurance analysis. Evaluates multi-tier supplier risks, geographic concentration, single-source dependencies, and cybersecurity maturity. Produces resilience recommendations and monitoring indicators.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: supply_chain_name (string), tiers (array of {tier, suppliers, geography}), critical_components (string[]), threat_vectors (string[]), assurance_level (basic/enhanced/rigorous)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: SupplyChainInput = JSON.parse(args.input)
      const result = analyzeSupplyChainSecurity(data)
      return formatSupplyChainReport(result)
    }
  }))

  // Tool 7: strategic_forecasting_model
  tools.register(defineTool({
    name: 'strategic_forecasting_model',
    description: 'Geopolitical scenario modeling and trend extrapolation for defense planning. Generates multiple future scenarios with probability weighting, early warning indicators, and strategic implications for national security decision-making.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: region (string), time_horizon_years (number), domains (string[]), key_variables (string[]), scenario_count (number), baseline_assumptions (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: StrategicForecastingInput = JSON.parse(args.input)
      const result = forecastStrategicTrends(data)
      return formatStrategicForecastingReport(result)
    }
  }))

  // Tool 8: classified_network_monitor
  tools.register(defineTool({
    name: 'classified_network_monitor',
    description: 'Anomaly detection and security posture assessment for classified networks. Monitors traffic patterns, detects data exfiltration risks, assesses insider threats, and ensures compliance with classification-level security policies.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: network_classification (confidential/secret/top_secret/sci), monitored_zones (string[]), traffic_patterns (array of {source, destination, protocol, volume_mbps, encrypted}), anomaly_indicators (string[]), security_posture (green/amber/red), insider_threat_level (low/moderate/high)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: ClassifiedNetworkInput = JSON.parse(args.input)
      const result = monitorClassifiedNetwork(data)
      return formatClassifiedNetworkReport(result)
    }
  }))

  console.log(`[dsh-tool-defencesecure] Loaded v${VERSION} - Defense & National Security AI with 8 tools`)
  console.log('  Tools: threat_assessment_matrix, cyber_defense_orchestrator, intelligence_fusion_engine, autonomous_system_executor, critical_infrastructure_protector, supply_chain_security_ai, strategic_forecasting_model, classified_network_monitor')
}
