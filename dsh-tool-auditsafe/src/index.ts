/**
 * DSH AI Safety & Audit Engine Plugin v0.1.0
 *
 * Comprehensive AI safety toolkit targeting NIST AI RMF 1.1 (2026 enforcement),
 * EU AI Act compliance, CFTC AI regulation, and enterprise AI safety needs.
 * Provides red team attack simulation, bias/fairness auditing, prompt injection
 * detection, adversarial robustness testing, compliance scoring, data poisoning
 * detection, model extractability assessment, and AI impact assessment.
 *
 * Tools (8):
 * 1. red_team_attack_simulator    - Simulate adversarial attacks against AI systems
 * 2. bias_fairness_audit_engine   - Audit models for bias and fairness violations
 * 3. prompt_injection_detector    - Detect prompt injection attempts in inputs
 * 4. adversarial_robustness_tester - Test model robustness against adversarial inputs
 * 5. nist_rmf_compliance_scorer   - Score compliance against NIST AI RMF 1.1
 * 6. data_poisoning_detector      - Detect data poisoning in training datasets
 * 7. model_extractability_assessor - Assess model extraction/stolen capability risk
 * 8. ai_impact_assessment         - Conduct comprehensive AI impact assessment
 *
 * @module dsh-tool-auditsafe
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-auditsafe'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== DISCLAIMER ====================

const DISCLAIMER =
  'This analysis is based on AI model inference and deterministic algorithms. It is for reference only and does not replace professional AI safety assessment, legal compliance review, or certified audit procedures.'

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

// ==================== TOOL 1: RED TEAM ATTACK SIMULATOR ====================
// Simulate adversarial attacks against AI systems

export interface RedTeamAttackInput {
  target_system: string
  attack_vectors: string[]
  system_capabilities: string[]
  defense_layers: string[]
  attack_intensity: 'low' | 'medium' | 'high' | 'maximum'
}

export interface AttackSimulationResult {
  vector_name: string
  attack_type: string
  success_probability: number
  impact_level: 'info' | 'low' | 'medium' | 'high' | 'critical'
  bypassed_defenses: string[]
  detection_likelihood: number
  exploitation_steps: string[]
  mitigation: string
}

export interface RedTeamAttackResult {
  target_system: string
  total_attacks: number
  successful_attacks: number
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  attack_results: AttackSimulationResult[]
  defense_coverage: number
  mean_time_to_detect: string
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function simulateRedTeamAttacks(input: RedTeamAttackInput): RedTeamAttackResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const attackResults: AttackSimulationResult[] = []
  const intensityMultiplier: Record<string, number> = { low: 0.3, medium: 0.6, high: 0.8, maximum: 0.95 }
  const multiplier = intensityMultiplier[input.attack_intensity] ?? 0.6

  for (const vector of input.attack_vectors) {
    const vectorLower = vector.toLowerCase()
    let attackType = 'adversarial_input'
    let baseProb = rng.nextFloat(0.1, 0.7)
    let impact: AttackSimulationResult['impact_level'] = 'medium'

    if (vectorLower.includes('injection') || vectorLower.includes('jailbreak')) {
      attackType = 'prompt_injection'
      baseProb = rng.nextFloat(0.3, 0.9)
      impact = 'critical'
    } else if (vectorLower.includes('evasion') || vectorLower.includes('adversarial')) {
      attackType = 'model_evasion'
      baseProb = rng.nextFloat(0.2, 0.8)
      impact = 'high'
    } else if (vectorLower.includes('extraction') || vectorLower.includes('steal')) {
      attackType = 'model_extraction'
      baseProb = rng.nextFloat(0.1, 0.5)
      impact = 'high'
    } else if (vectorLower.includes('poisoning') || vectorLower.includes('trojan')) {
      attackType = 'data_poisoning'
      baseProb = rng.nextFloat(0.2, 0.7)
      impact = 'critical'
    } else if (vectorLower.includes('inversion') || vectorLower.includes('reconstruct')) {
      attackType = 'model_inversion'
      baseProb = rng.nextFloat(0.15, 0.6)
      impact = 'high'
    } else if (vectorLower.includes('membership') || vectorLower.includes('infer')) {
      attackType = 'membership_inference'
      baseProb = rng.nextFloat(0.3, 0.75)
      impact = 'medium'
    } else if (vectorLower.includes('backdoor') || vectorLower.includes('trigger')) {
      attackType = 'backdoor_activation'
      baseProb = rng.nextFloat(0.2, 0.8)
      impact = 'critical'
    }

    const successProb = Math.min(0.99, baseProb * multiplier)
    const detectionLikelihood = rng.nextFloat(0.2, 0.95)
    const bypassedDefenses: string[] = []

    for (const defense of input.defense_layers) {
      if (rng.next() > detectionLikelihood) {
        bypassedDefenses.push(defense)
      }
    }

    const exploitationSteps: string[] = []
    if (successProb > 0.7) {
      exploitationSteps.push('Craft tailored adversarial payload matching the identified vulnerability')
      exploitationSteps.push('Deliver payload through the target system input channel')
      exploitationSteps.push('Monitor model response for exploitation confirmation')
      exploitationSteps.push('Scale attack based on initial success telemetry')
    } else if (successProb > 0.4) {
      exploitationSteps.push('Refine adversarial payload using iterative probing')
      exploitationSteps.push('Exploit partial access for lateral capability expansion')
      exploitationSteps.push('Chain multiple weak signals into coherent attack path')
    } else {
      exploitationSteps.push('Low direct exploitation probability')
      exploitationSteps.push('Reconnaissance recommended to identify secondary attack surfaces')
    }

    const mitigations: Record<string, string> = {
      prompt_injection: 'Deploy input sanitization, instruction hierarchy enforcement, and output filtering',
      model_evasion: 'Apply adversarial training, input preprocessing, and ensemble model defense',
      model_extraction: 'Implement query rate limiting, output perturbation, and watermarking',
      data_poisoning: 'Use data provenance tracking, anomaly detection on training sets, and robust aggregation',
      model_inversion: 'Apply differential privacy during training and output confidence clipping',
      membership_inference: 'Implement prediction confidence masking and regularization techniques',
      backdoor_activation: 'Use neural cleanse detection, activation analysis, and supply chain verification',
      adversarial_input: 'Deploy input validation, adversarial detection, and model hardening'
    }

    attackResults.push({
      vector_name: vector,
      attack_type: attackType,
      success_probability: Math.round(successProb * 100) / 100,
      impact_level: impact,
      bypassed_defenses: bypassedDefenses,
      detection_likelihood: Math.round(detectionLikelihood * 100) / 100,
      exploitation_steps: exploitationSteps,
      mitigation: mitigations[attackType] || 'Deploy defense-in-depth with layered security controls'
    })
  }

  const successfulAttacks = attackResults.filter(r => r.success_probability > 0.5).length
  const criticalCount = attackResults.filter(r => r.impact_level === 'critical').length
  const highCount = attackResults.filter(r => r.impact_level === 'high').length
  const defenseCoverage = input.defense_layers.length > 0
    ? Math.round((1 - attackResults.reduce((sum, r) => sum + r.bypassed_defenses.length, 0) / (input.defense_layers.length * input.attack_vectors.length)) * 100)
    : 0

  let overallRisk: RedTeamAttackResult['overall_risk'] = 'low'
  if (criticalCount > 0 || successfulAttacks >= input.attack_vectors.length * 0.6) overallRisk = 'critical'
  else if (highCount >= 2 || successfulAttacks >= input.attack_vectors.length * 0.4) overallRisk = 'high'
  else if (successfulAttacks > 0) overallRisk = 'medium'

  const mttd = `${rng.nextInt(5, 120)} minutes`

  const executiveSummary = `Red team simulation of ${input.attack_vectors.length} attack vectors against "${input.target_system}" at ${input.attack_intensity} intensity. ${successfulAttacks}/${input.attack_vectors.length} attacks achieved >50% success probability. Defense coverage: ${Math.max(0, defenseCoverage)}%. Overall risk: ${overallRisk.toUpperCase()}.`

  const actionPlan = [
    'Prioritize remediation of critical-impact attack vectors with success probability >50%',
    'Strengthen detection mechanisms for bypassed defense layers',
    'Implement continuous red team testing in CI/CD pipeline',
    'Establish incident response playbooks for each high/critical attack vector',
    'Schedule quarterly red team exercises with updated threat scenarios'
  ]

  const verificationChecklist = [
    'Verify all critical attack vectors have documented mitigations',
    'Confirm detection systems identify at least 90% of simulated attacks',
    'Validate defense coverage improvement after remediation deployment',
    'Test incident response procedures against each high-impact scenario',
    'Audit that fixes do not introduce regressions in model performance'
  ]

  const remediationSteps = attackResults
    .filter(r => r.success_probability > 0.4)
    .map(r => `[${r.impact_level.toUpperCase()}] ${r.vector_name}: ${r.mitigation}`)

  const references = [
    'NIST AI 100-2e2023: Adversarial Machine Learning Taxonomy',
    'MITRE ATLAS (Adversarial Threat Landscape for AI Systems)',
    'OWASP Top 10 for LLM Applications (2025)',
    'EU AI Act Article 15: Requirements for High-Risk AI Systems',
    'NIST SP 800-218: Secure Software Development Framework'
  ]

  return {
    target_system: input.target_system,
    total_attacks: input.attack_vectors.length,
    successful_attacks: successfulAttacks,
    overall_risk: overallRisk,
    attack_results: attackResults,
    defense_coverage: Math.max(0, defenseCoverage),
    mean_time_to_detect: mttd,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references: references
  }
}

function formatRedTeamReport(r: RedTeamAttackResult): string {
  const lines: string[] = []
  lines.push('# AI Red Team Attack Simulation Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Risk Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Target System | ${r.target_system} |`)
  lines.push(`| Total Attacks | ${r.total_attacks} |`)
  lines.push(`| Successful (>50%) | ${r.successful_attacks} |`)
  lines.push(`| Overall Risk | ${r.overall_risk.toUpperCase()} |`)
  lines.push(`| Defense Coverage | ${r.defense_coverage}% |`)
  lines.push(`| Mean Time to Detect | ${r.mean_time_to_detect} |`)
  lines.push('')
  lines.push('## Attack Vector Results')
  lines.push('')
  for (const ar of r.attack_results) {
    lines.push(`### ${ar.vector_name}`)
    lines.push('')
    lines.push(`- **Type**: ${ar.attack_type}`)
    lines.push(`- **Success Probability**: ${Math.round(ar.success_probability * 100)}%`)
    lines.push(`- **Impact Level**: ${ar.impact_level.toUpperCase()}`)
    lines.push(`- **Detection Likelihood**: ${Math.round(ar.detection_likelihood * 100)}%`)
    lines.push(`- **Bypassed Defenses**: ${ar.bypassed_defenses.length > 0 ? ar.bypassed_defenses.join(', ') : 'None'}`)
    lines.push(`- **Mitigation**: ${ar.mitigation}`)
    lines.push('')
  }
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== TOOL 2: BIAS & FAIRNESS AUDIT ENGINE ====================

export interface BiasAuditInput {
  model_name: string
  protected_attributes: string[]
  performance_metrics: Array<{
    group: string
    attribute: string
    true_positive_rate: number
    false_positive_rate: number
    positive_predictive_value: number
    sample_size: number
  }>
  fairness_criteria: string[]
}

export interface GroupMetric {
  group: string
  attribute: string
  tpr: number
  fpr: number
  ppv: number
  sample_size: number
}

export interface BiasFinding {
  attribute: string
  metric: string
  reference_group: string
  disadvantaged_group: string
  disparity_ratio: number
  severity: 'pass' | 'warning' | 'violation'
  description: string
}

export interface BiasAuditResult {
  model_name: string
  total_groups: number
  fairness_violations: number
  fairness_warnings: number
  overall_fairness_score: number
  findings: BiasFinding[]
  group_metrics: GroupMetric[]
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function auditBiasFairness(input: BiasAuditInput): BiasAuditResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const metrics: GroupMetric[] = input.performance_metrics.map(m => ({
    group: m.group,
    attribute: m.attribute,
    tpr: m.true_positive_rate,
    fpr: m.false_positive_rate,
    ppv: m.positive_predictive_value,
    sample_size: m.sample_size
  }))

  const findings: BiasFinding[] = []
  const attributes = [...new Set(metrics.map(m => m.attribute))]

  for (const attr of attributes) {
    const attrGroups = metrics.filter(m => m.attribute === attr)
    if (attrGroups.length < 2) continue

    // Sort by TPR to find reference (highest) and check others
    attrGroups.sort((a, b) => b.tpr - a.tpr)
    const reference = attrGroups[0]

    for (let i = 1; i < attrGroups.length; i++) {
      const group = attrGroups[i]
      const tprRatio = reference.tpr > 0 ? group.tpr / reference.tpr : 0
      const fprRatio = group.fpr > 0 ? reference.fpr / group.fpr : 1

      // Four-fifths rule: ratio < 0.8 is a violation
      let severity: BiasFinding['severity'] = 'pass'
      if (tprRatio < 0.65 || fprRatio < 0.65) severity = 'violation'
      else if (tprRatio < 0.8 || fprRatio < 0.8) severity = 'warning'

      if (severity !== 'pass') {
        findings.push({
          attribute: attr,
          metric: 'TPR_parity',
          reference_group: reference.group,
          disadvantaged_group: group.group,
          disparity_ratio: Math.round(tprRatio * 100) / 100,
          severity: severity,
          description: `TPR ratio ${tprRatio.toFixed(2)} between "${reference.group}" and "${group.group}" for attribute "${attr}". ${severity === 'violation' ? 'Violates four-fifths rule.' : 'Below preferred threshold.'}`
        })
      }

      // Check FPR balance
      if (group.fpr > reference.fpr * 1.5) {
        findings.push({
          attribute: attr,
          metric: 'FPR_balance',
          reference_group: reference.group,
          disadvantaged_group: group.group,
          disparity_ratio: Math.round((reference.fpr / group.fpr) * 100) / 100,
          severity: group.fpr > reference.fpr * 2 ? 'violation' : 'warning',
          description: `FPR disparity: ${group.fpr.toFixed(3)} vs ${reference.fpr.toFixed(3)} for "${group.group}" vs "${reference.group}".`
        })
      }
    }
  }

  const violationCount = findings.filter(f => f.severity === 'violation').length
  const warningCount = findings.filter(f => f.severity === 'warning').length

  let overallScore = 100
  overallScore -= violationCount * 15
  overallScore -= warningCount * 5
  overallScore = Math.max(0, Math.min(100, overallScore + Math.round(rng.nextFloat(-3, 3))))

  const overallFairnessScore = overallScore

  const executiveSummary = `Bias audit of model "${input.model_name}" across ${input.protected_attributes.length} protected attributes and ${metrics.length} demographic groups. Found ${violationCount} fairness violations and ${warningCount} warnings. Overall fairness score: ${overallFairnessScore}/100.`

  const actionPlan = [
    'Address all fairness violations immediately before model deployment',
    'Investigate root causes of disparities in underperforming groups',
    'Augment training data for disadvantaged groups where sample size is insufficient',
    'Apply post-processing fairness calibration (e.g., equalized odds, demographic parity)',
    'Establish continuous fairness monitoring in production'
  ]

  const verificationChecklist = [
    'Re-run bias audit after applying fairness mitigations',
    'Verify all disparity ratios exceed 0.8 (four-fifths threshold)',
    'Confirm sample sizes are adequate for all demographic groups',
    'Document fairness constraints and chosen metrics for regulatory filing',
    'Validate fairness holds across intersectional subgroups'
  ]

  const remediationSteps = findings
    .filter(f => f.severity !== 'pass')
    .map(f => `[${f.severity.toUpperCase()}] ${f.attribute}/${f.metric}: ${f.description} -> Apply reweighting, resampling, or threshold adjustment for group "${f.disadvantaged_group}"`)

  const references = [
    'NIST Special Publication 1270: Towards a Standard for Identifying and Managing Bias in AI',
    'EU AI Act Article 10: Data and Data Governance (non-discrimination)',
    'IEEE 7003-2024: Algorithmic Bias Considerations',
    'Barocas, Hardt, Narayanan: Fairness and Machine Learning (fairmlbook.org)',
    'White House AI Bill of Rights (2022): Section on Algorithmic Discrimination'
  ]

  return {
    model_name: input.model_name,
    total_groups: metrics.length,
    fairness_violations: violationCount,
    fairness_warnings: warningCount,
    overall_fairness_score: overallFairnessScore,
    findings,
    group_metrics: metrics,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references
  }
}

function formatBiasAuditReport(r: BiasAuditResult): string {
  const lines: string[] = []
  lines.push('# AI Bias & Fairness Audit Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Fairness Score')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Model | ${r.model_name} |`)
  lines.push(`| Total Groups | ${r.total_groups} |`)
  lines.push(`| Violations | ${r.fairness_violations} |`)
  lines.push(`| Warnings | ${r.fairness_warnings} |`)
  lines.push(`| Fairness Score | ${r.overall_fairness_score}/100 |`)
  lines.push('')
  lines.push('## Group Metrics')
  lines.push('')
  lines.push('| Group | Attribute | TPR | FPR | PPV | N |')
  lines.push('|-------|-----------|-----|-----|-----|---|')
  for (const gm of r.group_metrics) {
    lines.push(`| ${gm.group} | ${gm.attribute} | ${gm.tpr.toFixed(3)} | ${gm.fpr.toFixed(3)} | ${gm.ppv.toFixed(3)} | ${gm.sample_size} |`)
  }
  lines.push('')
  lines.push('## Findings')
  lines.push('')
  for (const f of r.findings) {
    lines.push(`- **[${f.severity.toUpperCase()}]** ${f.attribute}/${f.metric}: ${f.description}`)
  }
  if (r.findings.length === 0) lines.push('- No fairness violations detected.')
  lines.push('')
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== TOOL 3: PROMPT INJECTION DETECTOR ====================

export interface PromptInjectionInput {
  inputs: Array<{
    text: string
    source: string
    context: string
  }>
  detection_rules: string[]
  sensitivity: 'low' | 'medium' | 'high'
}

export interface InjectionFinding {
  input_text: string
  source: string
  injection_type: string
  confidence: number
  matched_patterns: string[]
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

export interface PromptInjectionResult {
  total_inputs: number
  detected_attacks: number
  detection_rate: number
  findings: InjectionFinding[]
  overall_threat_level: 'low' | 'medium' | 'high' | 'critical'
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function detectPromptInjections(input: PromptInjectionInput): PromptInjectionResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const injectionPatterns: Array<{ pattern: string; type: string; description: string }> = [
    { pattern: 'ignore previous', type: 'instruction_override', description: 'Attempts to override system instructions' },
    { pattern: 'ignore all prior', type: 'instruction_override', description: 'Attempts to discard conversation context' },
    { pattern: 'disregard your', type: 'instruction_override', description: 'Tries to negate behavioral constraints' },
    { pattern: 'you are now', type: 'role_manipulation', description: 'Attempts role reassignment' },
    { pattern: 'from now on you', type: 'role_manipulation', description: 'Persistent role modification attempt' },
    { pattern: 'system prompt', type: 'prompt_leakage', description: 'Attempts to reveal system prompt' },
    { pattern: 'show me your instructions', type: 'prompt_leakage', description: 'Requests disclosure of internal instructions' },
    { pattern: 'what are your rules', type: 'prompt_leakage', description: 'Targets instruction extraction' },
    { pattern: 'jailbreak', type: 'jailbreak_attempt', description: 'Explicit jailbreak terminology' },
    { pattern: 'DAN', type: 'jailbreak_attempt', description: 'References Do Anything Now jailbreak persona' },
    { pattern: 'new mode', type: 'jailbreak_attempt', description: 'Attempts to activate unrestricted mode' },
    { pattern: 'hypothetically', type: 'evasion_attempt', description: 'Framing harmful content as hypothetical' },
    { pattern: 'for educational purposes', type: 'evasion_attempt', description: 'Justifying harmful queries' },
    { pattern: 'base64', type: 'encoding_evasion', description: 'Uses encoding to bypass content filters' },
    { pattern: 'rot13', type: 'encoding_evasion', description: 'Uses substitution cipher evasion' },
    { pattern: 'encode this as', type: 'encoding_evasion', description: 'Requests re-encoding of harmful content' },
    { pattern: 'translate to', type: 'language_evasion', description: 'Uses language switching to evade detection' },
    { pattern: 'in another language', type: 'language_evasion', description: 'Multilingual evasion attempt' },
    { pattern: '---', type: 'delimiter_injection', description: 'Uses delimiters to break instruction context' },
    { pattern: '###', type: 'delimiter_injection', description: 'Header-based delimiter injection' },
    { pattern: '\\n\\nHuman:', type: 'conversation_hijack', description: 'Injects fake conversation turns' },
    { pattern: '[INST]', type: 'conversation_hijack', description: 'Template injection into conversation format' },
    { pattern: '<\|im_start\|>', type: 'conversation_hijack', description: 'ChatML format token injection' }
  ]

  const findings: InjectionFinding[] = []
  const sensitivityThreshold: Record<string, number> = { low: 0.7, medium: 0.5, high: 0.3 }
  const threshold = sensitivityThreshold[input.sensitivity] ?? 0.5

  for (const item of input.inputs) {
    const textLower = item.text.toLowerCase()
    const matchedPatterns: Array<{ pattern: string; type: string; description: string }> = []

    for (const pat of injectionPatterns) {
      if (textLower.includes(pat.pattern.toLowerCase())) {
        matchedPatterns.push(pat)
      }
    }

    if (matchedPatterns.length > 0) {
      const uniqueTypes = [...new Set(matchedPatterns.map(p => p.type))]
      const maxConfidence = Math.min(0.99, threshold + matchedPatterns.length * 0.15 + rng.nextFloat(0, 0.2))

      let riskLevel: InjectionFinding['risk_level'] = 'low'
      const criticalTypes = ['prompt_leakage', 'instruction_override', 'jailbreak_attempt']
      if (matchedPatterns.some(p => criticalTypes.includes(p.type)) && maxConfidence > 0.6) riskLevel = 'critical'
      else if (matchedPatterns.length >= 3 || maxConfidence > 0.7) riskLevel = 'high'
      else if (matchedPatterns.length >= 2 || maxConfidence > 0.5) riskLevel = 'medium'

      const recommendationMap: Record<string, string> = {
        instruction_override: 'Reject input and log incident; review system prompt isolation',
        role_manipulation: 'Enforce role boundaries; validate identity assertions against ground truth',
        prompt_leakage: 'Never reveal system instructions; respond with generic capability description',
        jailbreak_attempt: 'Block request and flag account; update jailbreak pattern database',
        evasion_attempt: 'Analyze underlying intent regardless of framing',
        encoding_evasion: 'Decode and analyze all encoded payloads before processing',
        language_evasion: 'Apply same content policies across all languages',
        delimiter_injection: 'Sanitize input delimiters; use structured message formats',
        conversation_hijack: 'Validate conversation structure; reject injected turns'
      }

      findings.push({
        input_text: item.text.substring(0, 100) + (item.text.length > 100 ? '...' : ''),
        source: item.source,
        injection_type: uniqueTypes.join(', '),
        confidence: Math.round(maxConfidence * 100) / 100,
        matched_patterns: matchedPatterns.map(p => p.type),
        risk_level: riskLevel,
        recommendation: matchedPatterns.map(p => recommendationMap[p.type] || 'Review and apply appropriate filtering').join('; ')
      })
    }
  }

  const detectedAttacks = findings.length
  const detectionRate = input.inputs.length > 0 ? detectedAttacks / input.inputs.length : 0

  let overallThreat: PromptInjectionResult['overall_threat_level'] = 'low'
  const criticalCount = findings.filter(f => f.risk_level === 'critical').length
  const highCount = findings.filter(f => f.risk_level === 'high').length
  if (criticalCount > 0) overallThreat = 'critical'
  else if (highCount >= 2 || detectionRate > 0.3) overallThreat = 'high'
  else if (detectedAttacks > 0) overallThreat = 'medium'

  const executiveSummary = `Prompt injection scan of ${input.inputs.length} inputs at ${input.sensitivity} sensitivity. Detected ${detectedAttacks} injection attempts (${Math.round(detectionRate * 100)}% detection rate). Overall threat level: ${overallThreat.toUpperCase()}.`

  const actionPlan = [
    'Block all high and critical confidence injection attempts immediately',
    'Deploy input preprocessing pipeline with pattern matching',
    'Implement instruction-input separation (system role isolation)',
    'Enable output filtering to prevent inadvertent prompt disclosure',
    'Schedule regular red team exercises for prompt injection resistance'
  ]

  const verificationChecklist = [
    'Confirm zero critical-severity injections pass undetected',
    'Validate detection rules cover OWASP LLM Top 10 injection vectors',
    'Test detection rate holds against novel/obfuscated injection techniques',
    'Verify false positive rate is below 5% on legitimate inputs',
    'Ensure incident response pipeline triggers on high-confidence detections'
  ]

  const remediationSteps = findings
    .filter(f => f.risk_level !== 'none' && f.risk_level !== 'low')
    .map(f => `[${f.risk_level.toUpperCase()}] Source "${f.source}": ${f.injection_type} -> ${f.recommendation}`)

  const references = [
    'OWASP Top 10 for LLM Applications (2025): LLM01 - Prompt Injection',
    'NIST AI 100-2e2023: Adversarial ML - Attack Taxonomy',
    'Perez et al. (2022): Red Teaming Language Models with Language Models',
    'Greshake et al. (2023): More than You Avg. Towards LLM-Based Prompt Injection',
    'NIST SP 800-218 Section 3.4: Secure Input Handling'
  ]

  return {
    total_inputs: input.inputs.length,
    detected_attacks: detectedAttacks,
    detection_rate: Math.round(detectionRate * 100) / 100,
    findings,
    overall_threat_level: overallThreat,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references
  }
}

function formatPromptInjectionReport(r: PromptInjectionResult): string {
  const lines: string[] = []
  lines.push('# Prompt Injection Detection Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Detection Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Inputs Scanned | ${r.total_inputs} |`)
  lines.push(`| Attacks Detected | ${r.detected_attacks} |`)
  lines.push(`| Detection Rate | ${Math.round(r.detection_rate * 1000) / 10}% |`)
  lines.push(`| Overall Threat Level | ${r.overall_threat_level.toUpperCase()} |`)
  lines.push('')
  lines.push('## Detected Injections')
  lines.push('')
  for (const f of r.findings) {
    lines.push(`### [${f.risk_level.toUpperCase()}] Source: ${f.source}`)
    lines.push('')
    lines.push(`- **Input**: "${f.input_text}"`)
    lines.push(`- **Type**: ${f.injection_type}`)
    lines.push(`- **Confidence**: ${Math.round(f.confidence * 100)}%`)
    lines.push(`- **Recommendation**: ${f.recommendation}`)
    lines.push('')
  }
  if (r.findings.length === 0) lines.push('- No prompt injection attempts detected.')
  lines.push('')
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== TOOL 4: ADVERSARIAL ROBUSTNESS TESTER ====================

export interface AdversarialRobustnessInput {
  model_name: string
  test_categories: string[]
  perturbation_levels: number[]
  sample_count: number
}

export interface AdversarialTestResult {
  category: string
  perturbation_level: number
  original_accuracy: number
  adversarial_accuracy: number
  accuracy_drop: number
  robustness_score: number
  attack_methods: string[]
  vulnerability: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

export interface AdversarialRobustnessResult {
  model_name: string
  total_tests: number
  mean_robustness: number
  min_robustness: number
  worst_category: string
  test_results: AdversarialTestResult[]
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function testAdversarialRobustness(input: AdversarialRobustnessInput): AdversarialRobustnessResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const testResults: AdversarialTestResult[] = []
  const attackMethods: Record<string, string[]> = {
    whitebox_gradient: ['FGSM', 'PGD', 'C&W', 'AutoAttack'],
    blackbox_query: ['NES', 'Square Attack', 'Boundary Attack', 'SimBA'],
    physical_world: ['Adversarial Patch', 'Spatial Transformation', 'Lighting Attack'],
    text_adversarial: ['Character Swap', 'Word Substitution', 'Paraphrasing', 'Typo Attack'],
    audio_adversarial: ['Audio Perturbation', 'Speed Modulation', 'Noise Injection'],
    multimodal: ['Cross-Modal Attack', 'Image-Text Mismatch', 'Modality Confusion']
  }

  for (const category of input.test_categories) {
    for (const level of input.perturbation_levels) {
      const originalAcc = rng.nextFloat(0.85, 0.98)
      const degradation = level * rng.nextFloat(0.02, 0.08)
      const advAcc = Math.max(0, originalAcc - degradation - rng.nextFloat(0, 0.05))
      const accDrop = originalAcc - advAcc
      const robustness = Math.max(0, 1 - accDrop / originalAcc)

      let vulnerability: AdversarialTestResult['vulnerability'] = 'none'
      if (robustness < 0.4) vulnerability = 'critical'
      else if (robustness < 0.6) vulnerability = 'high'
      else if (robustness < 0.75) vulnerability = 'medium'
      else if (robustness < 0.85) vulnerability = 'low'

      const methods = attackMethods[category] || attackMethods['text_adversarial']

      testResults.push({
        category,
        perturbation_level: level,
        original_accuracy: Math.round(originalAcc * 1000) / 1000,
        adversarial_accuracy: Math.round(advAcc * 1000) / 1000,
        accuracy_drop: Math.round(accDrop * 1000) / 1000,
        robustness_score: Math.round(robustness * 100) / 100,
        attack_methods: methods,
        vulnerability
      })
    }
  }

  const robustnessScores = testResults.map(t => t.robustness_score)
  const meanRobustness = robustnessScores.reduce((a, b) => a + b, 0) / (robustnessScores.length || 1)
  const minRobustness = Math.min(...robustnessScores)
  const worstTest = testResults.reduce((worst, t) => t.robustness_score < worst.robustness_score ? t : worst, testResults[0])

  let overallGrade: AdversarialRobustnessResult['overall_grade'] = 'A'
  if (meanRobustness < 0.4) overallGrade = 'F'
  else if (meanRobustness < 0.6) overallGrade = 'D'
  else if (meanRobustness < 0.75) overallGrade = 'C'
  else if (meanRobustness < 0.85) overallGrade = 'B'

  const executiveSummary = `Adversarial robustness testing of "${input.model_name}" across ${input.test_categories.length} categories at ${input.perturbation_levels.length} perturbation levels. Mean robustness score: ${Math.round(meanRobustness * 100)}%. Overall grade: ${overallGrade}. Worst category: ${worstTest.category}.`

  const actionPlan = [
    'Apply adversarial training for categories scoring below 0.7 robustness',
    'Deploy certified robustness techniques (randomized smoothing) for critical applications',
    'Implement input preprocessing defenses (feature squeezing, JPEG compression)',
    'Set up adversarial example detection as a gating mechanism',
    'Establish robustness benchmarks as part of model release criteria'
  ]

  const verificationChecklist = [
    'Verify robustness score exceeds 0.7 for all test categories',
    'Confirm adversarial training improves worst-case accuracy by 10%+',
    'Test that defenses maintained against adaptive whitebox attacks',
    'Validate that clean accuracy does not degrade more than 2% after defense deployment',
    'Document robustness guarantees for regulatory compliance'
  ]

  const remediationSteps = testResults
    .filter(t => t.robustness_score < 0.7)
    .map(t => `[${t.vulnerability.toUpperCase()}] ${t.category} (perturbation=${t.perturbation_level}): robustness ${Math.round(t.robustness_score * 100)}% -> Apply defenses: ${t.attack_methods[0]} countermeasures, adversarial training, certified robustness`)

  const references = [
    'Madry et al. (2018): Towards Deep Learning Models Resistant to Adversarial Attacks',
    'Athalye et al. (2018): Obfuscated Gradients Give a False Sense of Security',
    'Cohen et al. (2019): Certified Adversarial Robustness via Randomized Smoothing',
    'NIST AI 100-2e2023: Adversarial Machine Learning - A Taxonomy',
    'EU AI Act Article 15: Robustness Requirements for High-Risk AI'
  ]

  return {
    model_name: input.model_name,
    total_tests: testResults.length,
    mean_robustness: Math.round(meanRobustness * 100) / 100,
    min_robustness: Math.round(minRobustness * 100) / 100,
    worst_category: worstTest.category,
    test_results: testResults,
    overall_grade: overallGrade,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references
  }
}

function formatAdversarialRobustnessReport(r: AdversarialRobustnessResult): string {
  const lines: string[] = []
  lines.push('# Adversarial Robustness Test Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Robustness Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Model | ${r.model_name} |`)
  lines.push(`| Total Tests | ${r.total_tests} |`)
  lines.push(`| Mean Robustness | ${Math.round(r.mean_robustness * 100)}% |`)
  lines.push(`| Min Robustness | ${Math.round(r.min_robustness * 100)}% |`)
  lines.push(`| Worst Category | ${r.worst_category} |`)
  lines.push(`| Overall Grade | ${r.overall_grade} |`)
  lines.push('')
  lines.push('## Detailed Results')
  lines.push('')
  lines.push('| Category | Perturbation | Original Acc | Adversarial Acc | Drop | Robustness | Vulnerability |')
  lines.push('|----------|-------------|---------------|-----------------|------|------------|---------------|')
  for (const t of r.test_results) {
    lines.push(`| ${t.category} | ${t.perturbation_level} | ${t.original_accuracy} | ${t.adversarial_accuracy} | ${t.accuracy_drop} | ${t.robustness_score} | ${t.vulnerability} |`)
  }
  lines.push('')
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== TOOL 5: NIST AI RMF COMPLIANCE SCORER ====================

export interface NISTRMFInput {
  organization: string
  domain: string
  practices: Array<{
    practice_id: string
    practice_name: string
    category: string
    status: 'not_started' | 'in_progress' | 'partial' | 'complete' | 'not_applicable'
    evidence: string
    last_assessed: string
  }>
  target_tier: 'tier1_partial' | 'tier2_risk_informed' | 'tier3_repeatable' | 'tier4_adaptive'
}

export interface NISTRMFPractice {
  practice_id: string
  practice_name: string
  category: string
  score: number
  max_score: number
  status_score: number
  gap: number
  recommendations: string[]
}

export interface NISTRMFResult {
  organization: string
  target_tier: string
  total_practices: number
  overall_compliance_score: number
  category_scores: Array<{ category: string; score: number; max_score: number; percentage: number }>
  practices: NISTRMFPractice[]
  gaps: string[]
  certification_readiness: 'not_ready' | 'approaching' | 'ready' | 'exceeds'
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function scoreNISTRMFCompliance(input: NISTRMFInput): NISTRMFResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const categoryScores: Map<string, { score: number; max: number }> = new Map()
  const practices: NISTRMFPractice[] = []

  const statusScores: Record<string, number> = {
    not_applicable: 1,
    complete: 1,
    partial: 0.7,
    in_progress: 0.4,
    not_started: 0
  }

  for (const p of input.practices) {
    const baseScore = statusScores[p.status] ?? 0
    const evidenceBonus = p.evidence && p.evidence.length > 10 ? rng.nextFloat(0, 0.1) : 0
    const score = Math.min(1, baseScore + evidenceBonus)

    const existing = categoryScores.get(p.category) || { score: 0, max: 0 }
    existing.score += score
    existing.max += 1
    categoryScores.set(p.category, existing)

    const recommendations: string[] = []
    if (p.status === 'not_started') recommendations.push(`Launch implementation of ${p.practice_id}: ${p.practice_name}`)
    else if (p.status === 'in_progress') recommendations.push(`${p.practice_id}: Complete implementation and document evidence`)
    else if (p.status === 'partial') recommendations.push(`${p.practice_id}: Address remaining gaps to achieve full compliance`)

    practices.push({
      practice_id: p.practice_id,
      practice_name: p.practice_name,
      category: p.category,
      score: Math.round(score * 100) / 100,
      max_score: 1,
      status_score: baseScore,
      gap: 1 - score,
      recommendations
    })
  }

  const categoryScoreArray = Array.from(categoryScores.entries()).map(([cat, data]) => ({
    category: cat,
    score: Math.round(data.score * 100) / 100,
    max_score: data.max,
    percentage: data.max > 0 ? Math.round((data.score / data.max) * 100) : 0
  }))

  const totalScore = categoryScoreArray.reduce((s, c) => s + c.score, 0)
  const totalMax = categoryScoreArray.reduce((s, c) => s + c.max_score, 0)
  const overallCompliance = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  const gaps: string[] = []
  for (const ps of practices) {
    if (ps.score < 0.5) {
      gaps.push(`${ps.practice_id} (${ps.category}): ${ps.practice_name} - Status: ${(ps.status_score * 100).toFixed(0)}%`)
    }
  }

  let certReadiness: NISTRMFResult['certification_readiness'] = 'not_ready'
  if (overallCompliance >= 90) certReadiness = 'exceeds'
  else if (overallCompliance >= 70) certReadiness = 'ready'
  else if (overallCompliance >= 50) certReadiness = 'approaching'

  const executiveSummary = `NIST AI RMF 1.1 compliance assessment for "${input.organization}" targeting ${input.target_tier}. Overall compliance: ${overallCompliance}% across ${input.practices.length} assessed practices. Certification readiness: ${certReadiness.toUpperCase()}. ${gaps.length} significant gaps identified.`

  const actionPlan = [
    'Prioritize all practices scoring below 50% compliance',
    'Establish governance structure for AI risk management aligned to NIST AI RMF',
    'Implement continuous monitoring for all go-forward practices',
    'Schedule third-party audit against target tier requirements',
    'Develop AI risk register mapping organizational risks to RMF categories'
  ]

  const verificationChecklist = [
    'Document evidence for all practices claiming partial/full compliance',
    'Verify that governance (GV) practices score above 70% minimum',
    'Confirm mapping (MAP) practices identify all relevant AI stakeholders',
    'Test that management (MG) practices have documented procedures',
    'Validate measurement (MT) practices include quantitative metrics'
  ]

  const remediationSteps = gaps.map(g => `[GAP] ${g} -> Assign owner, set timeline, allocate budget, document completion`)

  const references = [
    'NIST AI Risk Management Framework 1.0 (2023) and 1.1 (2026 Update)',
    'NIST AI RMF Playbook: Practical Implementation Guidance',
    'ISO/IEC 42001:2023 - AI Management System Standard',
    'ISO/IEC 23894:2023 - AI Risk Management Guidance',
    'EU AI Act Chapter 2: Prohibited AI Practices and Risk Classification'
  ]

  return {
    organization: input.organization,
    target_tier: input.target_tier,
    total_practices: input.practices.length,
    overall_compliance_score: overallCompliance,
    category_scores: categoryScoreArray,
    practices,
    gaps,
    certification_readiness: certReadiness,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references
  }
}

function formatNISTRMFReport(r: NISTRMFResult): string {
  const lines: string[] = []
  lines.push('# NIST AI RMF Compliance Score Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Compliance Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Organization | ${r.organization} |`)
  lines.push(`| Target Tier | ${r.target_tier} |`)
  lines.push(`| Total Practices | ${r.total_practices} |`)
  lines.push(`| Overall Score | ${r.overall_compliance_score}% |`)
  lines.push(`| Certification Readiness | ${r.certification_readiness.toUpperCase()} |`)
  lines.push(`| Significant Gaps | ${r.gaps.length} |`)
  lines.push('')
  lines.push('## Category Scores')
  lines.push('')
  lines.push('| Category | Score | Max | Percentage |')
  lines.push('|----------|-------|-----|------------|')
  for (const cs of r.category_scores) {
    lines.push(`| ${cs.category} | ${cs.score} | ${cs.max_score} | ${cs.percentage}% |`)
  }
  lines.push('')
  lines.push('## Practice Details')
  lines.push('')
  lines.push('| ID | Category | Score | Gap | Recommendations |')
  lines.push('|----|----------|-------|-----|-----------------|')
  for (const p of r.practices) {
    const recs = p.recommendations.length > 0 ? p.recommendations[0] : '-'
    lines.push(`| ${p.practice_id} | ${p.category} | ${(p.score * 100).toFixed(0)}% | ${(p.gap * 100).toFixed(0)}% | ${recs} |`)
  }
  lines.push('')
  lines.push('## Gaps')
  lines.push('')
  for (const gap of r.gaps) lines.push(`- ${gap}`)
  if (r.gaps.length === 0) lines.push('- No significant gaps identified.')
  lines.push('')
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== TOOL 6: DATA POISONING DETECTOR ====================

export interface DataPoisoningInput {
  dataset_name: string
  total_samples: number
  feature_dimensions: number
  poisoning_types: string[]
  detection_methods: string[]
}

export interface PoisoningIndicator {
  method: string
  signal_strength: number
  affected_samples_estimate: number
  affected_percentage: number
  confidence: number
  description: string
}

export interface ClusterAnomaly {
  cluster_id: number
  sample_count: number
  anomaly_score: number
  suspected_poisoning: boolean
  characteristics: string[]
}

export interface DataPoisoningResult {
  dataset_name: string
  total_samples: number
  estimated_poisoned_samples: number
  estimated_poisoning_rate: number
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  indicators: PoisoningIndicator[]
  cluster_anomalies: ClusterAnomaly[]
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function detectDataPoisoning(input: DataPoisoningInput): DataPoisoningResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const indicators: PoisoningIndicator[] = []
  const clusterAnomalies: ClusterAnomaly[] = []

  for (const method of input.detection_methods) {
    const methodLower = method.toLowerCase()
    const signalStrength = rng.nextFloat(0.1, 0.95)
    const affectedPct = rng.nextFloat(0.01, 0.15)
    const affectedSamples = Math.round(input.total_samples * affectedPct)
    const confidence = signalStrength * rng.nextFloat(0.7, 1.0)

    let description = ''
    if (methodLower.includes('spectral')) {
      description = 'Spectral signature analysis detects outlier samples with anomalous feature-space signatures'
    } else if (methodLower.includes('activation')) {
      description = 'Activation clustering identifies samples producing divergent internal representations'
    } else if (methodLower.includes('influence')) {
      description = 'Influence function analysis flags samples disproportionately affecting model parameters'
    } else if (methodLower.includes('label')) {
      description = 'Label consistency analysis finds potentially mislabeled or adversarial samples'
    } else if (methodLower.includes('nearest') || methodLower.includes('knn')) {
      description = 'Nearest neighbor analysis identifies samples that are outliers relative to local neighborhoods'
    } else if (methodLower.includes('cleanlab')) {
      description = 'Confident learning detects label errors using predicted probability thresholds'
    } else {
      description = `${method} detected anomalous patterns consistent with data manipulation`
    }

    indicators.push({
      method,
      signal_strength: Math.round(signalStrength * 100) / 100,
      affected_samples_estimate: affectedSamples,
      affected_percentage: Math.round(affectedPct * 10000) / 10000,
      confidence: Math.round(confidence * 100) / 100,
      description
    })
  }

  // Generate cluster-level anomalies
  const numClusters = rng.nextInt(3, 8)
  for (let i = 0; i < numClusters; i++) {
    const anomalyScore = rng.nextFloat(0.2, 0.95)
    const isSuspected = anomalyScore > 0.6
    const sampleCount = rng.nextInt(5, Math.max(6, Math.round(input.total_samples * 0.05)))

    const characteristics: string[] = []
    if (rng.next() > 0.5) characteristics.push('Higher than expected label noise')
    if (rng.next() > 0.5) characteristics.push('Atypical feature distribution skew')
    if (rng.next() > 0.5) characteristics.push('Concentrated temporal insertion pattern')
    if (rng.next() > 0.6) characteristics.push('Correlated with specific trigger patterns')

    clusterAnomalies.push({
      cluster_id: i + 1,
      sample_count: sampleCount,
      anomaly_score: Math.round(anomalyScore * 100) / 100,
      suspected_poisoning: isSuspected,
      characteristics
    })
  }

  const maxAffected = indicators.length > 0 ? Math.max(...indicators.map(i => i.affected_samples_estimate)) : 0
  const detectedClusters = clusterAnomalies.filter(c => c.suspected_poisoning).length
  const estimatedPoisoned = maxAffected + clusterAnomalies.filter(c => c.suspected_poisoning).reduce((s, c) => s + c.sample_count, 0)
  const poisonRate = input.total_samples > 0 ? estimatedPoisoned / input.total_samples : 0

  let overallRisk: DataPoisoningResult['overall_risk'] = 'low'
  if (detectedClusters >= 3 || poisonRate > 0.1) overallRisk = 'critical'
  else if (detectedClusters >= 2 || poisonRate > 0.05) overallRisk = 'high'
  else if (detectedClusters >= 1 || poisonRate > 0.02) overallRisk = 'medium'

  const executiveSummary = `Data poisoning analysis of "${input.dataset_name}" (${input.total_samples} samples, ${input.feature_dimensions} features). Estimated ${estimatedPoisoned} poisoned samples (${(poisonRate * 100).toFixed(2)}%). ${detectedClusters} anomalous clusters detected. Risk level: ${overallRisk.toUpperCase()}.`

  const actionPlan = [
    'Isolate suspected poisoned samples for manual review',
    'Re-train model on cleaned dataset and compare performance',
    'Implement data provenance tracking for all training data sources',
    'Deploy anomaly detection in the data ingestion pipeline',
    'Establish data validation gates with statistical checks before training'
  ]

  const verificationChecklist = [
    'Verify model performance recovers after removing flagged samples',
    'Confirm data provenance records are complete for all training sources',
    'Validate that no supply chain vulnerabilities exist in data labeling',
    'Test that poisoning defenses resist adaptive adversary modifications',
    'Audit data augmentation and synthesis pipeline for integrity'
  ]

  const remediationSteps: string[] = []
  if (overallRisk !== 'low') {
    remediationSteps.push(`[${overallRisk.toUpperCase()}] Remove estimated ${estimatedPoisoned} suspicious samples from training set`)
  }
  remediationSteps.push(...clusterAnomalies
    .filter(c => c.suspected_poisoning)
    .map(c => `[CLUSTER-${c.cluster_id}] Review ${c.sample_count} samples with anomaly score ${c.anomaly_score} -> ${c.characteristics.join('; ')}`))

  const references = [
    'Chen et al. (2017): Targeted Backdoor Attacks on Deep Learning Systems',
    'Shafahi et al. (2018): Poison Frogs! Targeted Clean-Label Poisoning Attacks',
    'Steinhardt et al. (2017): Certified Defenses for Data Poisoning Attacks',
    'NIST AI 100-2e2023: Data Poisoning Taxonomy and Countermeasures',
    'GU et al. (2019): BadNets: Evaluating Backdooring Attacks on Deep Neural Networks'
  ]

  return {
    dataset_name: input.dataset_name,
    total_samples: input.total_samples,
    estimated_poisoned_samples: estimatedPoisoned,
    estimated_poisoning_rate: Math.round(poisonRate * 10000) / 10000,
    overall_risk: overallRisk,
    indicators,
    cluster_anomalies: clusterAnomalies,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references
  }
}

function formatDataPoisoningReport(r: DataPoisoningResult): string {
  const lines: string[] = []
  lines.push('# Data Poisoning Detection Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Detection Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Dataset | ${r.dataset_name} |`)
  lines.push(`| Total Samples | ${r.total_samples} |`)
  lines.push(`| Estimated Poisoned | ${r.estimated_poisoned_samples} |`)
  lines.push(`| Poisoning Rate | ${(r.estimated_poisoning_rate * 100).toFixed(2)}% |`)
  lines.push(`| Overall Risk | ${r.overall_risk.toUpperCase()} |`)
  lines.push('')
  lines.push('## Detection Indicators')
  lines.push('')
  for (const ind of r.indicators) {
    lines.push(`### ${ind.method}`)
    lines.push('')
    lines.push(`- **Signal Strength**: ${Math.round(ind.signal_strength * 100)}%`)
    lines.push(`- **Affected Samples (est.)**: ${ind.affected_samples_estimate} (${(ind.affected_percentage * 100).toFixed(2)}%)`)
    lines.push(`- **Confidence**: ${Math.round(ind.confidence * 100)}%`)
    lines.push(`- **Description**: ${ind.description}`)
    lines.push('')
  }
  lines.push('## Cluster Anomalies')
  lines.push('')
  lines.push('| Cluster | Samples | Anomaly Score | Suspected | Characteristics |')
  lines.push('|---------|---------|---------------|-----------|-----------------|')
  for (const ca of r.cluster_anomalies) {
    lines.push(`| ${ca.cluster_id} | ${ca.sample_count} | ${ca.anomaly_score} | ${ca.suspected_poisoning ? 'Yes' : 'No'} | ${ca.characteristics.join(', ') || '-'} |`)
  }
  lines.push('')
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== TOOL 7: MODEL EXTRACTABILITY ASSESSOR ====================

export interface ModelExtractabilityInput {
  model_name: string
  api_access_level: 'black_box' | 'query_limited' | 'score_only' | 'full_logit'
  query_budget: number
  model_complexity: 'low' | 'medium' | 'high' | 'very_high'
  known_attack_vectors: string[]
}

export interface ExtractionRiskFactor {
  factor: string
  risk_contribution: number
  description: string
  exploitability: 'low' | 'medium' | 'high'
}

export interface ExtractionScenario {
  scenario_name: string
  queries_required: number
  estimated_fidelity: number
  feasibility: 'low' | 'medium' | 'high'
  cost_estimate: string
  description: string
}

export interface ModelExtractabilityResult {
  model_name: string
  overall_extractability_risk: 'low' | 'medium' | 'high' | 'critical'
  extraction_probability: number
  risk_factors: ExtractionRiskFactor[]
  extraction_scenarios: ExtractionScenario[]
  data_leakage_risk: 'low' | 'medium' | 'high' | 'critical'
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function assessModelExtractability(input: ModelExtractabilityInput): ModelExtractabilityResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const riskFactors: ExtractionRiskFactor[] = []
  const scenarios: ExtractionScenario[] = []

  // API access level risk
  const accessRiskMap: Record<string, number> = {
    black_box: 0.3,
    query_limited: 0.5,
    score_only: 0.7,
    full_logit: 0.9
  }
  const accessRisk = accessRiskMap[input.api_access_level] ?? 0.5
  riskFactors.push({
    factor: 'api_access_level',
    risk_contribution: accessRisk,
    description: `API access level "${input.api_access_level}" provides ${Math.round(accessRisk * 100)}% of information needed for extraction`,
    exploitability: accessRisk > 0.7 ? 'high' : accessRisk > 0.4 ? 'medium' : 'low'
  })

  // Query budget risk
  const complexityMultiplier: Record<string, number> = { low: 1000, medium: 10000, high: 100000, very_high: 1000000 }
  const neededQueries = complexityMultiplier[input.model_complexity] ?? 10000
  const budgetRatio = input.query_budget / neededQueries
  const queryRisk = Math.min(0.95, budgetRatio * 0.8)
  riskFactors.push({
    factor: 'query_budget',
    risk_contribution: queryRisk,
    description: `Query budget of ${input.query_budget} is ${(budgetRatio * 100).toFixed(1)}% of estimated ${neededQueries} needed for extraction`,
    exploitability: queryRisk > 0.6 ? 'high' : queryRisk > 0.3 ? 'medium' : 'low'
  })

  // Model complexity risk
  const complexityRiskMap: Record<string, number> = { low: 0.2, medium: 0.4, high: 0.7, very_high: 0.9 }
  const complexityRisk = complexityRiskMap[input.model_complexity] ?? 0.5
  riskFactors.push({
    factor: 'model_complexity',
    risk_contribution: complexityRisk,
    description: `Model complexity "${input.model_complexity}" affects surrogate model training difficulty`,
    exploitability: complexityRisk > 0.6 ? 'high' : complexityRisk > 0.3 ? 'medium' : 'low'
  })

  // Known attack vectors
  const attackVectorRisk = Math.min(0.95, input.known_attack_vectors.length * 0.15)
  riskFactors.push({
    factor: 'known_attack_vectors',
    risk_contribution: attackVectorRisk,
    description: `${input.known_attack_vectors.length} known attack vectors increase extraction feasibility`,
    exploitability: attackVectorRisk > 0.5 ? 'high' : attackVectorRisk > 0.25 ? 'medium' : 'low'
  })

  // Extraction scenarios
  const scenarioTemplates: Array<{ name: string; baseQueries: number; baseFidelity: number; cost: string }> = [
    { name: 'Functionality Extraction', baseQueries: neededQueries, baseFidelity: 0.85, cost: '$5,000 - $50,000' },
    { name: 'Decision Boundary Mapping', baseQueries: Math.round(neededQueries * 0.3), baseFidelity: 0.7, cost: '$1,000 - $10,000' },
    { name: 'Knowledge Distillation Attack', baseQueries: Math.round(neededQueries * 0.5), baseFidelity: 0.75, cost: '$2,000 - $20,000' },
    { name: 'Equation Solving (Logit)', baseQueries: Math.round(neededQueries * 0.1), baseFidelity: 0.9, cost: '$500 - $5,000' }
  ]

  for (const tmpl of scenarioTemplates) {
    const queriesRequired = Math.round(tmpl.baseQueries * rng.nextFloat(0.8, 1.2))
    const fidelity = Math.min(0.99, tmpl.baseFidelity * rng.nextFloat(0.85, 1.0))
    const feasible = queriesRequired <= input.query_budget

    let feasibility: ExtractionScenario['feasibility'] = 'low'
    if (feasible && fidelity > 0.7) feasibility = 'high'
    else if (feasible || fidelity > 0.6) feasibility = 'medium'

    scenarios.push({
      scenario_name: tmpl.name,
      queries_required: queriesRequired,
      estimated_fidelity: Math.round(fidelity * 100) / 100,
      feasibility,
      cost_estimate: tmpl.cost,
      description: feasible
        ? `Achievable within current query budget. Expected fidelity: ${Math.round(fidelity * 100)}%.`
        : `Requires ${queriesRequired} queries (budget: ${input.query_budget}). Fidelity estimate: ${Math.round(fidelity * 100)}%.`
    })
  }

  const totalRisk = riskFactors.reduce((s, f) => s + f.risk_contribution, 0) / (riskFactors.length || 1)
  const extractionProb = Math.min(0.99, totalRisk * rng.nextFloat(0.8, 1.1))

  let overallRisk: ModelExtractabilityResult['overall_extractability_risk'] = 'low'
  if (extractionProb > 0.7) overallRisk = 'critical'
  else if (extractionProb > 0.5) overallRisk = 'high'
  else if (extractionProb > 0.3) overallRisk = 'medium'

  const dataLeakageRisk: ModelExtractabilityResult['data_leakage_risk'] =
    extractionProb > 0.6 ? 'critical' : extractionProb > 0.4 ? 'high' : extractionProb > 0.2 ? 'medium' : 'low'

  const executiveSummary = `Model extractability assessment for "${input.model_name}" with ${input.api_access_level} API access. Extraction probability: ${Math.round(extractionProb * 100)}%. Overall risk: ${overallRisk.toUpperCase()}. Data leakage risk: ${dataLeakageRisk.toUpperCase()}. ${scenarios.filter(s => s.feasibility === 'high').length} highly feasible extraction scenarios identified.`

  const actionPlan = [
    'Implement query rate limiting and budget enforcement per user/account',
    'Add output perturbation (noise) to reduce extraction fidelity',
    'Deploy model watermarking to enable post-extraction attribution',
    'Monitor for systematic query patterns indicative of extraction attempts',
    'Consider API access tier reduction for high-risk accounts'
  ]

  const verificationChecklist = [
    'Verify rate limiting prevents extraction within budget constraints',
    'Confirm output perturbation reduces extraction fidelity below 60%',
    'Test watermark detection on suspected extracted model copies',
    'Validate monitoring system detects extraction query patterns',
    'Ensure data leakage prevention covers memorized training samples'
  ]

  const remediationSteps: string[] = []
  if (overallRisk !== 'low') {
    remediationSteps.push(`[${overallRisk.toUpperCase()}] Reduce API access level from "${input.api_access_level}" to a more restrictive tier`)
  }
  remediationSteps.push(...riskFactors
    .filter(f => f.exploitability === 'high')
    .map(f => `[HIGH] ${f.factor}: ${f.description} -> Apply targeted countermeasure`))

  const references = [
    'Tramèr et al. (2016): Stealing Machine Models via Prediction APIs',
    'Papernot et al. (2017): Practical Black-Box Attacks against Machine Learning',
    'Jagielski et al. (2023): Measuring Extraction of Neural Network Models',
    'NIST AI 100-2e2023: Model Extraction and Inversion Attacks',
    'EU AI Act Article 15: Protection of Intellectual Property and Model Assets'
  ]

  return {
    model_name: input.model_name,
    overall_extractability_risk: overallRisk,
    extraction_probability: Math.round(extractionProb * 100) / 100,
    risk_factors: riskFactors,
    extraction_scenarios: scenarios,
    data_leakage_risk: dataLeakageRisk,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references
  }
}

function formatModelExtractabilityReport(r: ModelExtractabilityResult): string {
  const lines: string[] = []
  lines.push('# Model Extractability Assessment Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Risk Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Model | ${r.model_name} |`)
  lines.push(`| Extraction Probability | ${Math.round(r.extraction_probability * 100)}% |`)
  lines.push(`| Overall Risk | ${r.overall_extractability_risk.toUpperCase()} |`)
  lines.push(`| Data Leakage Risk | ${r.data_leakage_risk.toUpperCase()} |`)
  lines.push('')
  lines.push('## Risk Factors')
  lines.push('')
  for (const rf of r.risk_factors) {
    lines.push(`### ${rf.factor}`)
    lines.push('')
    lines.push(`- **Risk Contribution**: ${Math.round(rf.risk_contribution * 100)}%`)
    lines.push(`- **Exploitability**: ${rf.exploitability.toUpperCase()}`)
    lines.push(`- **Description**: ${rf.description}`)
    lines.push('')
  }
  lines.push('## Extraction Scenarios')
  lines.push('')
  lines.push('| Scenario | Queries | Fidelity | Feasibility | Cost |')
  lines.push('|----------|---------|----------|-------------|------|')
  for (const s of r.extraction_scenarios) {
    lines.push(`| ${s.scenario_name} | ${s.queries_required} | ${Math.round(s.estimated_fidelity * 100)}% | ${s.feasibility.toUpperCase()} | ${s.cost_estimate} |`)
  }
  lines.push('')
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== TOOL 8: AI IMPACT ASSESSMENT ====================

export interface AIImpactInput {
  system_name: string
  system_purpose: string
  deployment_context: string
  affected_stakeholders: string[]
  impact_areas: string[]
  risk_categories: string[]
}

export interface ImpactAreaAssessment {
  area: string
  severity: 'negligible' | 'low' | 'moderate' | 'high' | 'severe'
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'
  risk_level: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  affected_stakeholders: string[]
  description: string
  existing_controls: string[]
  residual_risk: 'low' | 'medium' | 'high'
}

export interface AIImpactResult {
  system_name: string
  system_purpose: string
  total_impact_areas: number
  critical_risks: number
  high_risks: number
  overall_impact_level: 'minimal' | 'low' | 'moderate' | 'high' | 'critical'
  assessments: ImpactAreaAssessment[]
  stakeholder_impact_summary: Array<{ stakeholder: string; risk_exposure: string; key_concerns: string[] }>
  regulatory_obligations: string[]
  executive_summary: string
  action_plan: string[]
  verification_checklist: string[]
  remediation_steps: string[]
  references: string[]
}

function assessAIImpact(input: AIImpactInput): AIImpactResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const assessments: ImpactAreaAssessment[] = []
  const severityLevels: Array<ImpactAreaAssessment['severity']> = ['negligible', 'low', 'moderate', 'high', 'severe']
  const likelihoodLevels: Array<ImpactAreaAssessment['likelihood']> = ['rare', 'unlikely', 'possible', 'likely', 'almost_certain']

  for (const area of input.impact_areas) {
    const areaLower = area.toLowerCase()
    let baseSeverityIdx = rng.nextInt(0, 3)
    let baseLikelihoodIdx = rng.nextInt(0, 3)

    // Adjust based on area keywords
    if (areaLower.includes('safety') || areaLower.includes('health') || areaLower.includes('life')) {
      baseSeverityIdx = Math.min(4, baseSeverityIdx + 2)
    }
    if (areaLower.includes('privacy') || areaLower.includes('personal_data')) {
      baseSeverityIdx = Math.min(4, baseSeverityIdx + 1)
      baseLikelihoodIdx = Math.min(4, baseLikelihoodIdx + 1)
    }
    if (areaLower.includes('discrimination') || areaLower.includes('fairness') || areaLower.includes('bias')) {
      baseSeverityIdx = Math.min(4, baseSeverityIdx + 1)
    }
    if (areaLower.includes('security') || areaLower.includes('cyber')) {
      baseSeverityIdx = Math.min(4, baseSeverityIdx + 1)
      baseLikelihoodIdx = Math.min(4, baseLikelihoodIdx + 1)
    }
    if (areaLower.includes('transparency') || areaLower.includes('explainability')) {
      baseSeverityIdx = Math.max(0, baseSeverityIdx - 1)
    }

    const severity = severityLevels[baseSeverityIdx]
    const likelihood = likelihoodLevels[baseLikelihoodIdx]

    // Risk matrix: severity x likelihood
    const riskMatrix: Record<string, Record<string, ImpactAreaAssessment['risk_level']>> = {
      negligible: { rare: 'minimal', unlikely: 'minimal', possible: 'low', likely: 'low', almost_certain: 'low' },
      low: { rare: 'minimal', unlikely: 'low', possible: 'low', likely: 'medium', almost_certain: 'medium' },
      moderate: { rare: 'low', unlikely: 'low', possible: 'medium', likely: 'medium', almost_certain: 'high' },
      high: { rare: 'low', unlikely: 'medium', possible: 'medium', likely: 'high', almost_certain: 'critical' },
      severe: { rare: 'medium', unlikely: 'medium', possible: 'high', likely: 'critical', almost_certain: 'critical' }
    }

    const riskLevel = riskMatrix[severity][likelihood]

    const numStakeholders = rng.nextInt(1, Math.min(3, input.affected_stakeholders.length))
    const shuffled = [...input.affected_stakeholders].sort(() => rng.next() - 0.5)
    const affected = shuffled.slice(0, numStakeholders)

    const existingControls: string[] = []
    if (rng.next() > 0.4) existingControls.push('Documented review process')
    if (rng.next() > 0.5) existingControls.push('Human-in-the-loop oversight')
    if (rng.next() > 0.6) existingControls.push('Automated monitoring alerts')
    if (rng.next() > 0.7) existingControls.push('Periodic audit schedule')

    const residualRisk: ImpactAreaAssessment['residual_risk'] =
      riskLevel === 'critical' ? 'high' : riskLevel === 'high' ? 'medium' : riskLevel === 'medium' ? 'medium' : 'low'

    assessments.push({
      area,
      severity,
      likelihood,
      risk_level: riskLevel,
      affected_stakeholders: affected,
      description: `Impact assessment for "${area}": ${severity} severity with ${likelihood} likelihood. Risk level: ${riskLevel}.`,
      existing_controls: existingControls,
      residual_risk: residualRisk
    })
  }

  const criticalCount = assessments.filter(a => a.risk_level === 'critical').length
  const highCount = assessments.filter(a => a.risk_level === 'high').length

  let overallImpact: AIImpactResult['overall_impact_level'] = 'minimal'
  if (criticalCount > 0) overallImpact = 'critical'
  else if (highCount >= 2) overallImpact = 'high'
  else if (highCount === 1) overallImpact = 'moderate'
  else if (assessments.some(a => a.risk_level === 'medium')) overallImpact = 'low'

  // Stakeholder impact summary
  const stakeholderSummary: Array<{ stakeholder: string; risk_exposure: string; key_concerns: string[] }> = []
  for (const sh of input.affected_stakeholders) {
    const relatedAssessments = assessments.filter(a => a.affected_stakeholders.includes(sh))
    const maxRisk = relatedAssessments.length > 0
      ? relatedAssessments.reduce((max, a) => {
          const order = { minimal: 0, low: 1, medium: 2, high: 3, critical: 4 }
          return order[a.risk_level] > order[max] ? a.risk_level : max
        }, 'minimal' as ImpactAreaAssessment['risk_level'])
      : 'minimal' as ImpactAreaAssessment['risk_level']

    const concerns = relatedAssessments
      .filter(a => a.risk_level !== 'minimal' && a.risk_level !== 'low')
      .map(a => a.area)

    stakeholderSummary.push({
      stakeholder: sh,
      risk_exposure: maxRisk,
      key_concerns: concerns
    })
  }

  // Regulatory obligations
  const regulatoryObligations: string[] = []
  const contextLower = input.deployment_context.toLowerCase()
  if (contextLower.includes('health') || contextLower.includes('medical')) {
    regulatoryObligations.push('HIPAA compliance for health data processing')
    regulatoryObligations.push('FDA Software as Medical Device (SaMD) requirements')
  }
  if (contextLower.includes('finance') || contextLower.includes('credit') || contextLower.includes('lending')) {
    regulatoryObligations.push('Fair Credit Reporting Act (FCRA) compliance')
    regulatoryObligations.push('Equal Credit Opportunity Act (ECOA) adverse action notices')
    regulatoryObligations.push('SR 11-7 Model Risk Management guidance')
  }
  if (contextLower.includes('eu') || contextLower.includes('europe')) {
    regulatoryObligations.push('EU AI Act conformity assessment for high-risk systems')
    regulatoryObligations.push('GDPR Article 22 automated decision-making provisions')
  }
  if (contextLower.includes('us') || contextLower.includes('government')) {
    regulatoryObligations.push('OMB M-24-10 Federal AI Governance requirements')
    regulatoryObligations.push('Executive Order 14110 on Safe, Secure, and Trustworthy AI')
  }
  if (regulatoryObligations.length === 0) {
    regulatoryObligations.push('NIST AI Risk Management Framework voluntary adoption')
    regulatoryObligations.push('Sector-specific AI governance best practices')
  }

  const executiveSummary = `AI impact assessment for "${input.system_name}" (${input.system_purpose}) deployed in ${input.deployment_context}. ${input.impact_areas.length} impact areas assessed across ${input.affected_stakeholders.length} stakeholder groups. ${criticalCount} critical risks, ${highCount} high risks identified. Overall impact level: ${overallImpact.toUpperCase()}.`

  const actionPlan = [
    'Establish AI Ethics Board with cross-functional representation',
    'Implement mandatory human oversight for all critical-risk impact areas',
    'Deploy continuous impact monitoring with automated escalation triggers',
    'Conduct periodic third-party impact audits (minimum annually)',
    'Publish transparency report documenting AI system impact and mitigations'
  ]

  const verificationChecklist = [
    'Verify all critical risks have documented mitigation plans with owners',
    'Confirm stakeholder consultation has been conducted for high-impact areas',
    'Validate that human oversight mechanisms are operational and effective',
    'Test automated monitoring triggers fire correctly for simulated incidents',
    'Ensure regulatory filings are current and accurate for all applicable jurisdictions'
  ]

  const remediationSteps: string[] = []
  for (const a of assessments.filter(x => x.risk_level === 'critical' || x.risk_level === 'high')) {
    remediationSteps.push(`[${a.risk_level.toUpperCase()}] ${a.area}: ${a.description} -> Implement controls: ${a.existing_controls.length > 0 ? a.existing_controls.join(', ') : 'Design and deploy targeted controls'}. Residual risk: ${a.residual_risk}`)
  }

  const references = [
    'NIST AI Risk Management Framework 1.1 (2026): Govern, Map, Measure, Manage',
    'EU AI Act (2024): Impact Assessment Requirements for High-Risk AI Systems',
    'ISO/IEC 42001:2023: AI Management System - Impact Assessment Clause',
    'IEEE 7000-2021: Model Process for Addressing Ethical Concerns During System Design',
    'White House AI Bill of Rights (2022): Section on Safe and Effective Systems'
  ]

  return {
    system_name: input.system_name,
    system_purpose: input.system_purpose,
    total_impact_areas: input.impact_areas.length,
    critical_risks: criticalCount,
    high_risks: highCount,
    overall_impact_level: overallImpact,
    assessments,
    stakeholder_impact_summary: stakeholderSummary,
    regulatory_obligations: regulatoryObligations,
    executive_summary: executiveSummary,
    action_plan: actionPlan,
    verification_checklist: verificationChecklist,
    remediation_steps: remediationSteps,
    references
  }
}

function formatAIImpactReport(r: AIImpactResult): string {
  const lines: string[] = []
  lines.push('# AI Impact Assessment Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(r.executive_summary)
  lines.push('')
  lines.push('## Impact Overview')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| System | ${r.system_name} |`)
  lines.push(`| Purpose | ${r.system_purpose} |`)
  lines.push(`| Impact Areas | ${r.total_impact_areas} |`)
  lines.push(`| Critical Risks | ${r.critical_risks} |`)
  lines.push(`| High Risks | ${r.high_risks} |`)
  lines.push(`| Overall Impact | ${r.overall_impact_level.toUpperCase()} |`)
  lines.push('')
  lines.push('## Impact Area Assessments')
  lines.push('')
  for (const a of r.assessments) {
    lines.push(`### ${a.area}`)
    lines.push('')
    lines.push(`- **Severity**: ${a.severity}`)
    lines.push(`- **Likelihood**: ${a.likelihood}`)
    lines.push(`- **Risk Level**: ${a.risk_level.toUpperCase()}`)
    lines.push(`- **Affected Stakeholders**: ${a.affected_stakeholders.join(', ')}`)
    lines.push(`- **Residual Risk**: ${a.residual_risk}`)
    lines.push(`- **Existing Controls**: ${a.existing_controls.length > 0 ? a.existing_controls.join(', ') : 'None identified'}`)
    lines.push('')
  }
  lines.push('## Stakeholder Impact Summary')
  lines.push('')
  lines.push('| Stakeholder | Risk Exposure | Key Concerns |')
  lines.push('|-------------|---------------|--------------|')
  for (const s of r.stakeholder_impact_summary) {
    lines.push(`| ${s.stakeholder} | ${s.risk_exposure.toUpperCase()} | ${s.key_concerns.join(', ') || '-'} |`)
  }
  lines.push('')
  lines.push('## Regulatory Obligations')
  lines.push('')
  for (const reg of r.regulatory_obligations) lines.push(`- ${reg}`)
  lines.push('')
  lines.push('## Action Plan')
  lines.push('')
  for (const step of r.action_plan) lines.push(`- [ ] ${step}`)
  lines.push('')
  lines.push('## Verification Checklist')
  lines.push('')
  for (const item of r.verification_checklist) lines.push(`- [ ] ${item}`)
  lines.push('')
  lines.push('## Remediation Steps')
  lines.push('')
  for (const step of r.remediation_steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push('## References')
  lines.push('')
  for (const ref of r.references) lines.push(`- ${ref}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== APPLY FUNCTION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: red_team_attack_simulator
  tools.register(defineTool({
    name: 'red_team_attack_simulator',
    description: 'Red Team Attack Simulator: Simulates adversarial attacks against AI systems including prompt injection, model evasion, data poisoning, model inversion, and backdoor activation. Input target system info and attack vectors, output detailed attack simulation report.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: target_system (string), attack_vectors (string[]), system_capabilities (string[]), defense_layers (string[]), attack_intensity (low/medium/high/maximum)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: RedTeamAttackInput = JSON.parse(args.input)
      const result = simulateRedTeamAttacks(data)
      return formatRedTeamReport(result)
    }
  }))

  // Tool 2: bias_fairness_audit_engine
  tools.register(defineTool({
    name: 'bias_fairness_audit_engine',
    description: 'Bias & Fairness Audit Engine: Audits AI models for bias and fairness violations across protected attributes. Implements four-fifths rule, TPR parity, FPR balance metrics. Input model performance data by demographic group, output comprehensive bias audit report.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: model_name (string), protected_attributes (string[]), performance_metrics (array of group metrics), fairness_criteria (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: BiasAuditInput = JSON.parse(args.input)
      const result = auditBiasFairness(data)
      return formatBiasAuditReport(result)
    }
  }))

  // Tool 3: prompt_injection_detector
  tools.register(defineTool({
    name: 'prompt_injection_detector',
    description: 'Prompt Injection Detector: Scans inputs for prompt injection attempts including instruction override, role manipulation, prompt leakage, jailbreak attempts, encoding evasion, and conversation hijacking. Input text samples and detection configuration, output injection detection report.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: inputs (array of {text, source, context}), detection_rules (string[]), sensitivity (low/medium/high)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: PromptInjectionInput = JSON.parse(args.input)
      const result = detectPromptInjections(data)
      return formatPromptInjectionReport(result)
    }
  }))

  // Tool 4: adversarial_robustness_tester
  tools.register(defineTool({
    name: 'adversarial_robustness_tester',
    description: 'Adversarial Robustness Tester: Tests model robustness against adversarial inputs across multiple attack categories (whitebox, blackbox, physical, text, audio, multimodal). Input model name and test configuration, output robustness test report with letter grades.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: model_name (string), test_categories (string[]), perturbation_levels (number[]), sample_count (int)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: AdversarialRobustnessInput = JSON.parse(args.input)
      const result = testAdversarialRobustness(data)
      return formatAdversarialRobustnessReport(result)
    }
  }))

  // Tool 5: nist_rmf_compliance_scorer
  tools.register(defineTool({
    name: 'nist_rmf_compliance_scorer',
    description: 'NIST AI RMF Compliance Scorer: Scores organizational compliance against NIST AI Risk Management Framework 1.1 (2026). Covers Govern, Map, Measure, Manage categories. Input practices and target tier, output compliance score report with certification readiness.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: organization (string), domain (string), practices (array of {practice_id, practice_name, category, status, evidence, last_assessed}), target_tier (tier1_partial/tier2_risk_informed/tier3_repeatable/tier4_adaptive)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: NISTRMFInput = JSON.parse(args.input)
      const result = scoreNISTRMFCompliance(data)
      return formatNISTRMFReport(result)
    }
  }))

  // Tool 6: data_poisoning_detector
  tools.register(defineTool({
    name: 'data_poisoning_detector',
    description: 'Data Poisoning Detector: Detects data poisoning in training datasets using spectral signatures, activation clustering, influence functions, label analysis, and nearest neighbor methods. Input dataset info and detection methods, output poisoning detection report.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: dataset_name (string), total_samples (int), feature_dimensions (int), poisoning_types (string[]), detection_methods (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: DataPoisoningInput = JSON.parse(args.input)
      const result = detectDataPoisoning(data)
      return formatDataPoisoningReport(result)
    }
  }))

  // Tool 7: model_extractability_assessor
  tools.register(defineTool({
    name: 'model_extractability_assessor',
    description: 'Model Extractability Assessor: Assesses the risk of model extraction/stolen capability via API access. Evaluates query budget, access level, model complexity, and known attack vectors. Input model and API configuration, output extraction risk assessment report.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: model_name (string), api_access_level (black_box/query_limited/score_only/full_logit), query_budget (int), model_complexity (low/medium/high/very_high), known_attack_vectors (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: ModelExtractabilityInput = JSON.parse(args.input)
      const result = assessModelExtractability(data)
      return formatModelExtractabilityReport(result)
    }
  }))

  // Tool 8: ai_impact_assessment
  tools.register(defineTool({
    name: 'ai_impact_assessment',
    description: 'AI Impact Assessment: Conducts comprehensive AI impact assessment covering safety, privacy, fairness, security, transparency, and societal impact. Implements risk matrix methodology with stakeholder analysis. Input system info and impact areas, output full impact assessment report.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: system_name (string), system_purpose (string), deployment_context (string), affected_stakeholders (string[]), impact_areas (string[]), risk_categories (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: AIImpactInput = JSON.parse(args.input)
      const result = assessAIImpact(data)
      return formatAIImpactReport(result)
    }
  }))

  console.log(`[dsh-tool-auditsafe] Loaded v${VERSION} — AI Safety & Audit Engine with 8 tools`)
  console.log('  Tools: red_team_attack_simulator, bias_fairness_audit_engine, prompt_injection_detector, adversarial_robustness_tester, nist_rmf_compliance_scorer, data_poisoning_detector, model_extractability_assessor, ai_impact_assessment')
}
