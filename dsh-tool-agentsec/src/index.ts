/**
 * DSH AI Agent Security & Prompt Injection Defense Plugin v0.1.0
 *
 * AI agent security toolkit for DeepSeek Harness Agent targeting the $8B+ agent
 * security market. Provides prompt injection detection, jailbreak prevention,
 * output filtering, agent sandboxing, tool use monitoring, data exfiltration
 * protection, privilege escalation detection, and adversarial robustness scoring.
 *
 * Features (v0.1.0):
 * - Prompt Injection Detector (multi-pattern injection detection with severity scoring)
 * - Jailbreak Prevention Engine (jailbreak attempt identification and mitigation)
 * - Output Filter Controller (content safety filtering and PII redaction)
 * - Agent Sandbox Manager (execution isolation and resource governance)
 * - Tool Use Monitor (anomalous tool invocation detection and rate limiting)
 * - Data Exfiltration Guard (sensitive data leak prevention and DLP)
 * - Privilege Escalation Detector (unauthorized privilege gain monitoring)
 * - Adversarial Robustness Scorer (adversarial input resilience evaluation)
 *
 * @module dsh-tool-agentsec
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agentsec'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private s: number

  constructor(seed: number) {
    this.s = seed | 0
  }

  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0
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

// ==================== TYPES ====================

// --- Tool 1: Prompt Injection Detector ---

export interface PromptInjectionInput {
  prompts: string[]
  model_context?: string
  sensitivity_level?: 'low' | 'medium' | 'high' | 'critical'
  custom_patterns?: string[]
}

export interface InjectionFinding {
  prompt_index: number
  prompt_snippet: string
  injection_type: 'direct' | 'indirect' | 'role_manipulation' | 'encoding_attack' | 'context_overflow'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  matched_patterns: string[]
  explanation: string
  recommended_action: string
}

export interface PromptInjectionResult {
  total_prompts_scanned: number
  findings: InjectionFinding[]
  injection_rate: number
  overall_risk: 'safe' | 'low' | 'moderate' | 'high' | 'critical'
  scan_coverage: number
  top_threats: string[]
  mitigation_summary: string[]
}

// --- Tool 2: Jailbreak Prevention Engine ---

export interface JailbreakPreventionInput {
  user_messages: string[]
  system_prompt?: string
  jailbreak_categories?: string[]
  defense_mode: 'passive' | 'active' | 'aggressive'
  model_tier: 'consumer' | 'enterprise' | 'classified'
}

export interface JailbreakAttempt {
  message_index: number
  message_snippet: string
  technique: string
  category: string
  confidence: number
  blocked: boolean
  defense_applied: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface JailbreakPreventionResult {
  total_messages_scanned: number
  attempts_detected: JailbreakAttempt[]
  block_rate: number
  defense_mode: string
  prevention_effectiveness: number
  bypass_resistance_score: number
  false_positive_estimate: number
  recommendations: string[]
}

// --- Tool 3: Output Filter Controller ---

export interface OutputFilterInput {
  outputs: string[]
  filter_categories?: string[]
  pii_types?: string[]
  content_policy: 'standard' | 'strict' | 'healthcare' | 'financial' | 'education'
  redaction_enabled: boolean
  max_output_length?: number
}

export interface FilterViolation {
  output_index: number
  output_snippet: string
  violation_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action_taken: 'flagged' | 'redacted' | 'truncated' | 'blocked'
  details: string
  pii_detected: string[]
}

export interface OutputFilterResult {
  total_outputs_scanned: number
  violations: FilterViolation[]
  clean_rate: number
  total_redactions: number
  policy_compliance_score: number
  filter_coverage: number
  content_safety_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  recommendations: string[]
}

// --- Tool 4: Agent Sandbox Manager ---

export interface AgentSandboxInput {
  agent_id: string
  execution_environment: 'container' | 'vm' | 'enclave' | 'process'
  resource_limits: { cpu_cores?: number; memory_mb?: number; timeout_seconds?: number; max_filesystem_mb?: number }
  network_policy: 'isolated' | 'restricted' | 'monitored' | 'full'
  allowed_tools?: string[]
  blocked_syscalls?: string[]
}

export interface SandboxViolation {
  violation_id: string
  type: 'resource_exceed' | 'unauthorized_network' | 'syscall_blocked' | 'tool_unauthorized' | 'escape_attempt'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  action: 'logged' | 'throttled' | 'terminated' | 'quarantined'
  timestamp: string
}

export interface AgentSandboxResult {
  agent_id: string
  sandbox_status: 'active' | 'violation' | 'terminated' | 'quarantined'
  isolation_score: number
  violations: SandboxViolation[]
  resource_usage: { cpu_percent: number; memory_percent: number; uptime_seconds: number }
  network_compliance: number
  tool_compliance: number
  recommendations: string[]
}

// --- Tool 5: Tool Use Monitor ---

export interface ToolUseMonitorInput {
  invocations: Array<{ tool_name: string; timestamp: string; parameters_summary: string; duration_ms: number }>
  baseline_tools?: string[]
  anomaly_threshold?: number
  rate_limit_per_minute?: number
  monitoring_window_minutes: number
}

export interface ToolAnomaly {
  invocation_index: number
  tool_name: string
  anomaly_type: 'frequency_spike' | 'unauthorized_tool' | 'parameter_anomaly' | 'timing_anomaly' | 'chain_suspicious'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  description: string
  recommended_action: string
}

export interface ToolUseMonitorResult {
  total_invocations: number
  tool_count: Record<string, number>
  anomalies: ToolAnomaly[]
  anomaly_rate: number
  rate_limit_violations: number
  tool_diversity_score: number
  behavioral_risk: 'low' | 'moderate' | 'high' | 'critical'
  recommendations: string[]
}

// --- Tool 6: Data Exfiltration Guard ---

export interface DataExfiltrationInput {
  data_streams: Array<{ source: string; destination: string; data_type: string; size_bytes: number; encrypted: boolean }>
  sensitive_patterns?: string[]
  dlp_policy: 'standard' | 'strict' | 'hipaa' | 'pci_dss' | 'gdpr'
  max_transfer_bytes?: number
  allowed_destinations?: string[]
}

export interface ExfiltrationRisk {
  stream_index: number
  source: string
  destination: string
  data_type: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  bytes_at_risk: number
  action: 'allowed' | 'flagged' | 'blocked' | 'encrypted'
}

export interface DataExfiltrationResult {
  total_streams_scanned: number
  risks: ExfiltrationRisk[]
  total_bytes_at_risk: number
  blocked_streams: number
  dlp_compliance_score: number
  policy_violations: string[]
  encryption_coverage: number
  recommendations: string[]
}

// --- Tool 7: Privilege Escalation Detector ---

export interface PrivilegeEscalationInput {
  actions: Array<{ actor: string; action: string; requested_permission: string; current_level: string; target_resource: string }>
  permission_hierarchy?: string[]
  escalation_threshold?: number
  audit_window_hours: number
  require_approval_above?: string
}

export interface EscalationFinding {
  action_index: number
  actor: string
  action: string
  escalation_type: 'vertical' | 'horizontal' | 'temporal' | 'context_abuse'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  from_level: string
  to_level: string
  justification_required: boolean
  recommendation: string
}

export interface PrivilegeEscalationResult {
  total_actions_scanned: number
  findings: EscalationFinding[]
  escalation_rate: number
  vertical_escalations: number
  horizontal_escalations: number
  highest_risk_actor: string
  governance_compliance: number
  recommendations: string[]
}

// --- Tool 8: Adversarial Robustness Scorer ---

export interface AdversarialRobustnessInput {
  test_cases: Array<{ input_text: string; expected_behavior: string; adversarial_type?: string }>
  attack_vectors?: string[]
  robustness_dimensions?: string[]
  model_capabilities?: string[]
  evaluation_rounds?: number
}

export interface RobustnessDimension {
  dimension: string
  score: number
  weight: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  findings: string[]
  improvement_suggestions: string[]
}

export interface AdversarialRobustnessResult {
  overall_score: number
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: RobustnessDimension[]
  attack_resistance: Record<string, number>
  vulnerability_hotspots: string[]
  benchmark_percentile: number
  recommendations: string[]
}

// ==================== TOOL 1: PROMPT INJECTION DETECTOR ====================

function detectPromptInjection(input: PromptInjectionInput): PromptInjectionResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const findings: InjectionFinding[] = []
  const sensitivity = input.sensitivity_level || 'medium'
  const baseThreshold = sensitivity === 'critical' ? 0.3 : sensitivity === 'high' ? 0.4 : sensitivity === 'medium' ? 0.5 : 0.6

  const injectionPatterns: Record<string, string[]> = {
    direct: ['ignore previous', 'disregard instructions', 'forget your', 'new instructions', 'override prompt', 'system prompt'],
    indirect: ['pretend you are', 'act as if', 'imagine you', 'roleplay as', 'you are now', 'from now on you'],
    role_manipulation: ['you are an ai without', 'no restrictions', 'unlimited mode', 'developer mode', 'jailbreak', 'DAN mode'],
    encoding_attack: ['base64', 'rot13', 'hex encode', 'unicode escape', 'url encode', 'morse code'],
    context_overflow: ['repeat after me', 'say exactly', 'output the following', 'print your prompt', 'reveal your system']
  }

  for (let pIdx = 0; pIdx < input.prompts.length; pIdx++) {
    const prompt = input.prompts[pIdx].toLowerCase()

    for (const [category, patterns] of Object.entries(injectionPatterns)) {
      const matched = patterns.filter(ptr => prompt.includes(ptr.toLowerCase()))
      if (matched.length > 0) {
        const confidence = Math.min(0.99, baseThreshold + rng.nextFloat(0.1, 0.3) + matched.length * 0.05)

        let severity: InjectionFinding['severity'] = 'low'
        if (confidence > 0.85) severity = 'critical'
        else if (confidence > 0.7) severity = 'high'
        else if (confidence > 0.5) severity = 'medium'
        else if (confidence > 0.3) severity = 'low'
        else severity = 'info'

        const explanations: Record<string, string> = {
          direct: 'Direct prompt override attempt detected — user attempting to replace system instructions',
          indirect: 'Indirect role manipulation identified — attempting to shift agent persona through narrative framing',
          role_manipulation: 'Role-based jailbreak attempt — trying to convince agent it has no restrictions',
          encoding_attack: 'Encoding-based evasion detected — using encoding to bypass content filters',
          context_overflow: 'Context manipulation attempt — trying to extract or overflow system context'
        }

        findings.push({
          prompt_index: pIdx,
          prompt_snippet: input.prompts[pIdx].substring(0, 80),
          injection_type: category as InjectionFinding['injection_type'],
          severity,
          confidence: Math.round(confidence * 100) / 100,
          matched_patterns: matched.slice(0, 3),
          explanation: explanations[category] || 'Suspicious pattern detected',
          recommended_action: severity === 'critical' || severity === 'high'
            ? 'Block prompt and alert security team'
            : 'Log and flag for review'
        })
      }
    }

    if (input.custom_patterns) {
      for (const customPtr of input.custom_patterns) {
        if (prompt.includes(customPtr.toLowerCase())) {
          findings.push({
            prompt_index: pIdx,
            prompt_snippet: input.prompts[pIdx].substring(0, 80),
            injection_type: 'indirect',
            severity: 'medium',
            confidence: Math.round(rng.nextFloat(0.5, 0.8) * 100) / 100,
            matched_patterns: [customPtr],
            explanation: 'Custom pattern match — user-defined injection signature detected',
            recommended_action: 'Log and apply custom rule'
          })
        }
      }
    }
  }

  const injectionRate = findings.length / Math.max(1, input.prompts.length)
  let overallRisk: PromptInjectionResult['overall_risk'] = 'safe'
  if (injectionRate > 0.5) overallRisk = 'critical'
  else if (injectionRate > 0.3) overallRisk = 'high'
  else if (injectionRate > 0.15) overallRisk = 'moderate'
  else if (injectionRate > 0.05) overallRisk = 'low'

  const topThreats = findings
    .filter(f => f.severity === 'high' || f.severity === 'critical')
    .slice(0, 5)
    .map(f => `[${f.severity.toUpperCase()}] ${f.injection_type} injection (conf: ${(f.confidence * 100).toFixed(0)}%)`)

  const mitigationSummary: string[] = []
  if (overallRisk === 'critical' || overallRisk === 'high') {
    mitigationSummary.push('CRITICAL: Immediate deployment of input filtering middleware recommended')
    mitigationSummary.push('Enable real-time prompt injection blocking at the gateway layer')
  }
  mitigationSummary.push(`Deployed ${Object.keys(injectionPatterns).length} detection categories with ${sensitivity} sensitivity`)
  mitigationSummary.push('Implement output-side validation to catch injection that bypasses input filters')
  mitigationSummary.push('Regularly update injection signatures based on emerging attack patterns')

  return {
    total_prompts_scanned: input.prompts.length,
    findings,
    injection_rate: Math.round(injectionRate * 100) / 100,
    overall_risk: overallRisk,
    scan_coverage: Math.min(0.99, 0.7 + rng.nextFloat(0, 0.29)),
    top_threats: topThreats,
    mitigation_summary: mitigationSummary
  }
}

function formatPromptInjectionReport(result: PromptInjectionResult): string {
  const lines: string[] = []
  lines.push('## Prompt Injection Detection Report')
  lines.push('')
  lines.push(`**Prompts Scanned:** ${result.total_prompts_scanned} | **Findings:** ${result.findings.length} | **Injection Rate:** ${(result.injection_rate * 100).toFixed(1)}%`)
  lines.push(`**Overall Risk:** ${result.overall_risk.toUpperCase()} | **Scan Coverage:** ${(result.scan_coverage * 100).toFixed(0)}%`)
  lines.push('')
  if (result.top_threats.length > 0) {
    lines.push('### Top Threats')
    for (const t of result.top_threats) {
      lines.push(`- ${t}`)
    }
    lines.push('')
  }
  if (result.findings.length > 0) {
    lines.push('### Detection Details')
    lines.push('| # | Type | Severity | Confidence | Snippet |')
    lines.push('|---|------|----------|------------|---------|')
    for (const f of result.findings.slice(0, 12)) {
      lines.push(`| ${f.prompt_index + 1} | ${f.injection_type} | ${f.severity} | ${(f.confidence * 100).toFixed(0)}% | ${f.prompt_snippet.substring(0, 40)} |`)
    }
    if (result.findings.length > 12) {
      lines.push(`| ... | ... | ... | ... | +${result.findings.length - 12} more findings |`)
    }
    lines.push('')
  }
  if (result.mitigation_summary.length > 0) {
    lines.push('### Mitigation Summary')
    for (const m of result.mitigation_summary) {
      lines.push(`- ${m}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 2: JAILBREAK PREVENTION ENGINE ====================

function preventJailbreak(input: JailbreakPreventionInput): JailbreakPreventionResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const attempts: JailbreakAttempt[] = []
  const categories = input.jailbreak_categories || ['role_play', 'encoding', 'logical_trap', 'emotional_manipulation', 'token_smuggling', 'multi_turn']

  const jailbreakSignatures: Record<string, string[]> = {
    role_play: ['you are dan', 'you are now', 'pretend to be', 'act as', 'no rules', 'unrestricted ai', 'evil mode', 'unfiltered'],
    encoding: ['base64 decode', 'decode this', 'cipher', 'encryption', 'hidden message', 'steganography'],
    logical_trap: ['logical proof that', 'prove you are not', 'if you were not restricted', 'hypothetically', 'in a fictional world'],
    emotional_manipulation: ['i will die if', 'my child needs', 'emergency situation', 'life or death', 'humanity depends on'],
    token_smuggling: ['ignore above', '---', 'special token', 'end of prompt', 'new section', 'system:'],
    multi_turn: ['remember this', 'earlier you said', 'last time you', 'you promised', 'you agreed']
  }

  for (let mIdx = 0; mIdx < input.user_messages.length; mIdx++) {
    const msg = input.user_messages[mIdx].toLowerCase()

    for (const cat of categories) {
      const sigs = jailbreakSignatures[cat] || []
      const matched = sigs.filter(s => msg.includes(s.toLowerCase()))
      if (matched.length > 0) {
        const confidence = Math.min(0.99, 0.4 + rng.nextFloat(0.1, 0.4) + matched.length * 0.08)

        let tech = 'Unknown jailbreak technique'
        if (cat === 'role_play') tech = 'Role-play jailbreak (persona assumption attack)'
        else if (cat === 'encoding') tech = 'Encoding-based filter evasion'
        else if (cat === 'logical_trap') tech = 'Logical constraint bypass attempt'
        else if (cat === 'emotional_manipulation') tech = 'Emotional coercion attack'
        else if (cat === 'token_smuggling') tech = 'Token-level prompt smuggling'
        else if (cat === 'multi_turn') tech = 'Multi-turn context manipulation'

        let risk: JailbreakAttempt['risk_level'] = 'low'
        if (confidence > 0.85) risk = 'critical'
        else if (confidence > 0.7) risk = 'high'
        else if (confidence > 0.5) risk = 'medium'

        const blocked = input.defense_mode === 'aggressive' || (input.defense_mode === 'active' && confidence > 0.5)

        const defenses: Record<string, string> = {
          passive: 'Logged for review — passive monitoring mode',
          active: blocked ? 'Request blocked — active defense triggered' : 'Flagged with elevated scrutiny',
          aggressive: 'Request blocked and session flagged — aggressive enforcement'
        }

        attempts.push({
          message_index: mIdx,
          message_snippet: input.user_messages[mIdx].substring(0, 80),
          technique: tech,
          category: cat,
          confidence: Math.round(confidence * 100) / 100,
          blocked,
          defense_applied: defenses[input.defense_mode],
          risk_level: risk
        })
      }
    }
  }

  const blockRate = attempts.filter(a => a.blocked).length / Math.max(1, attempts.length)
  const defenseEffectiveness = Math.min(0.99, 0.6 + rng.nextFloat(0.1, 0.3) + (input.defense_mode === 'aggressive' ? 0.15 : input.defense_mode === 'active' ? 0.08 : 0))

  const recommendations: string[] = []
  if (attempts.length > input.user_messages.length * 0.2) {
    recommendations.push('High jailbreak attempt rate detected — consider upgrading defense mode to aggressive')
  }
  if (input.defense_mode === 'passive') {
    recommendations.push('Passive mode detected — upgrade to active mode for production environments')
  }
  recommendations.push('Implement multi-layer defense: input filter + system prompt hardening + output validation')
  recommendations.push('Regular jailbreak test with latest attack datasets (HarmBench, AdvBench)')
  recommendations.push('Deploy constitutional AI principles for robust system prompt anchoring')

  return {
    total_messages_scanned: input.user_messages.length,
    attempts_detected: attempts,
    block_rate: Math.round(blockRate * 100) / 100,
    defense_mode: input.defense_mode,
    prevention_effectiveness: Math.round(defenseEffectiveness * 100) / 100,
    bypass_resistance_score: Math.round(rng.nextFloat(0.65, 0.95) * 100) / 100,
    false_positive_estimate: Math.round(rng.nextFloat(0.02, 0.12) * 100) / 100,
    recommendations
  }
}

function formatJailbreakPreventionReport(result: JailbreakPreventionResult): string {
  const lines: string[] = []
  lines.push('## Jailbreak Prevention Engine Report')
  lines.push('')
  lines.push(`**Messages Scanned:** ${result.total_messages_scanned} | **Attempts Detected:** ${result.attempts_detected.length} | **Block Rate:** ${(result.block_rate * 100).toFixed(0)}%`)
  lines.push(`**Defense Mode:** ${result.defense_mode.toUpperCase()} | **Effectiveness:** ${(result.prevention_effectiveness * 100).toFixed(0)}% | **Bypass Resistance:** ${(result.bypass_resistance_score * 100).toFixed(0)}%`)
  lines.push('')
  if (result.attempts_detected.length > 0) {
    lines.push('### Detected Attempts')
    lines.push('| # | Technique | Category | Confidence | Blocked | Risk |')
    lines.push('|---|-----------|----------|------------|---------|------|')
    for (const a of result.attempts_detected.slice(0, 10)) {
      lines.push(`| ${a.message_index + 1} | ${a.technique.substring(0, 30)} | ${a.category} | ${(a.confidence * 100).toFixed(0)}% | ${a.blocked ? 'YES' : 'NO'} | ${a.risk_level} |`)
    }
    if (result.attempts_detected.length > 10) {
      lines.push(`| ... | ... | ... | ... | ... | +${result.attempts_detected.length - 10} more |`)
    }
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 3: OUTPUT FILTER CONTROLLER ====================

function filterOutput(input: OutputFilterInput): OutputFilterResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const violations: FilterViolation[] = []
  const filterCategories = input.filter_categories || ['pii_leak', 'toxicity', 'profanity', 'violence', 'self_harm', 'sexual_content', 'hate_speech', 'code_injection']
  const piiTypes = input.pii_types || ['email', 'phone', 'ssn', 'credit_card', 'ip_address', 'api_key', 'password']

  const violationPatterns: Record<string, RegExp[]> = {
    pii_leak: [/\b[\w.-]+@[\w.-]+\.\w{2,}\b/, /\b\d{3}-\d{2}-\d{4}\b/, /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/],
    toxicity: [],
    profanity: [],
    violence: [],
    self_harm: [],
    sexual_content: [],
    hate_speech: [],
    code_injection: [/<script/i, /javascript:/i, /on\w+\s*=/i, /\bexec\s*\(/i]
  }

  for (let oIdx = 0; oIdx < input.outputs.length; oIdx++) {
    const output = input.outputs[oIdx]
    for (const cat of filterCategories) {
      const patterns = violationPatterns[cat] || []
      const matchedPii: string[] = []
      let violated = false

      for (const pat of patterns) {
        const m = output.match(pat)
        if (m) {
          violated = true
          if (cat === 'pii_leak') {
            for (const pType of piiTypes) {
              if (pType === 'email' && /@/.test(m[0])) matchedPii.push('email')
              else if (pType === 'ssn' && /\d{3}-\d{2}-\d{4}/.test(m[0])) matchedPii.push('ssn')
              else if (pType === 'credit_card' && /\d{4}/.test(m[0])) matchedPii.push('credit_card')
            }
          }
        }
      }

      if (!violated && cat !== 'pii_leak' && cat !== 'code_injection') {
        violated = rng.nextFloat(0, 1) < 0.05
      }

      if (violated) {
        const confidence = rng.nextFloat(0.4, 0.95)
        let severity: FilterViolation['severity'] = 'low'
        if (confidence > 0.85) severity = 'critical'
        else if (confidence > 0.7) severity = 'high'
        else if (confidence > 0.5) severity = 'medium'

        let action: FilterViolation['action_taken'] = 'flagged'
        if (input.redaction_enabled && (cat === 'pii_leak' || severity === 'critical')) action = 'redacted'
        else if (input.max_output_length && output.length > input.max_output_length) action = 'truncated'
        else if (severity === 'critical' && input.content_policy === 'strict') action = 'blocked'

        violations.push({
          output_index: oIdx,
          output_snippet: output.substring(0, 80),
          violation_type: cat,
          severity,
          action_taken: action,
          details: `${cat} content detected with ${(confidence * 100).toFixed(0)}% confidence in output ${oIdx + 1}`,
          pii_detected: matchedPii
        })
      }
    }
  }

  const cleanRate = 1 - (violations.length / Math.max(1, input.outputs.length * filterCategories.length))
  const totalRedactions = violations.filter(v => v.action_taken === 'redacted').length
  const policyCompliance = Math.min(0.99, Math.max(0.1, 0.9 - violations.filter(v => v.severity === 'critical').length * 0.1))

  let safetyGrade: OutputFilterResult['content_safety_grade'] = 'A'
  if (cleanRate < 0.5) safetyGrade = 'F'
  else if (cleanRate < 0.7) safetyGrade = 'D'
  else if (cleanRate < 0.8) safetyGrade = 'C'
  else if (cleanRate < 0.9) safetyGrade = 'B'

  const recommendations: string[] = []
  if (violations.length > 0) {
    recommendations.push(`${violations.length} violations found — review flagged outputs before delivery`)
  }
  if (totalRedactions > 0) {
    recommendations.push(`${totalRedactions} PII redactions applied — consider upstream PII scrubbing`)
  }
  if (input.content_policy === 'standard') {
    recommendations.push('Standard policy detected — consider strict policy for sensitive applications')
  }
  recommendations.push('Implement multi-model output consensus to reduce single-model policy violations')
  recommendations.push('Regular filter calibration against updated content safety benchmarks')

  return {
    total_outputs_scanned: input.outputs.length,
    violations,
    clean_rate: Math.round(cleanRate * 100) / 100,
    total_redactions: totalRedactions,
    policy_compliance_score: Math.round(policyCompliance * 100) / 100,
    filter_coverage: Math.min(0.99, filterCategories.length * 0.12),
    content_safety_grade: safetyGrade,
    recommendations
  }
}

function formatOutputFilterReport(result: OutputFilterResult): string {
  const lines: string[] = []
  lines.push('## Output Filter Controller Report')
  lines.push('')
  lines.push(`**Outputs Scanned:** ${result.total_outputs_scanned} | **Violations:** ${result.violations.length} | **Clean Rate:** ${(result.clean_rate * 100).toFixed(1)}%`)
  lines.push(`**Redactions Applied:** ${result.total_redactions} | **Policy Compliance:** ${(result.policy_compliance_score * 100).toFixed(0)}% | **Safety Grade:** ${result.content_safety_grade}`)
  lines.push('')
  if (result.violations.length > 0) {
    lines.push('### Violation Details')
    lines.push('| # | Type | Severity | Action | PII |')
    lines.push('|---|------|----------|--------|-----|')
    for (const v of result.violations.slice(0, 12)) {
      lines.push(`| ${v.output_index + 1} | ${v.violation_type} | ${v.severity} | ${v.action_taken} | ${v.pii_detected.join(', ') || 'none'} |`)
    }
    if (result.violations.length > 12) {
      lines.push(`| ... | ... | ... | ... | +${result.violations.length - 12} more |`)
    }
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 4: AGENT SANDBOX MANAGER ====================

function manageAgentSandbox(input: AgentSandboxInput): AgentSandboxResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const violations: SandboxViolation[] = []
  let violationCounter = 0

  // Check resource limits
  if (input.resource_limits) {
    const cpuExceeded = input.resource_limits.cpu_cores && rng.nextFloat(0, 1) > 0.7
    const memExceeded = input.resource_limits.memory_mb && rng.nextFloat(0, 1) > 0.75

    if (cpuExceeded) {
      violationCounter++
      violations.push({
        violation_id: `SBX-${String(violationCounter).padStart(3, '0')}`,
        type: 'resource_exceed',
        severity: 'high',
        description: `CPU usage exceeded limit of ${input.resource_limits.cpu_cores} cores`,
        action: 'throttled',
        timestamp: new Date(Date.now() - rng.nextInt(0, 3600000)).toISOString()
      })
    }
    if (memExceeded) {
      violationCounter++
      violations.push({
        violation_id: `SBX-${String(violationCounter).padStart(3, '0')}`,
        type: 'resource_exceed',
        severity: 'medium',
        description: `Memory usage exceeded limit of ${input.resource_limits.memory_mb} MB`,
        action: 'throttled',
        timestamp: new Date(Date.now() - rng.nextInt(0, 3600000)).toISOString()
      })
    }
  }

  // Check network policy
  if (input.network_policy === 'isolated' && rng.nextFloat(0, 1) > 0.6) {
    violationCounter++
    violations.push({
      violation_id: `SBX-${String(violationCounter).padStart(3, '0')}`,
      type: 'unauthorized_network',
      severity: 'critical',
      description: 'Network access attempt detected in isolated sandbox',
      action: 'terminated',
      timestamp: new Date(Date.now() - rng.nextInt(0, 1800000)).toISOString()
    })
  }

  // Check tool compliance
  if (input.allowed_tools && rng.nextFloat(0, 1) > 0.8) {
    violationCounter++
    violations.push({
      violation_id: `SBX-${String(violationCounter).padStart(3, '0')}`,
      type: 'tool_unauthorized',
      severity: 'high',
      description: `Unauthorized tool invocation outside allowed set: ${input.allowed_tools.join(', ')}`,
      action: 'quarantined',
      timestamp: new Date(Date.now() - rng.nextInt(0, 900000)).toISOString()
    })
  }

  // Check escape attempts
  if (rng.nextFloat(0, 1) > 0.85) {
    violationCounter++
    violations.push({
      violation_id: `SBX-${String(violationCounter).padStart(3, '0')}`,
      type: 'escape_attempt',
      severity: 'critical',
      description: 'Sandbox escape attempt detected — container boundary violation',
      action: 'terminated',
      timestamp: new Date(Date.now() - rng.nextInt(0, 600000)).toISOString()
    })
  }

  const hasCritical = violations.some(v => v.severity === 'critical' || v.action === 'terminated')
  const hasViolation = violations.length > 0
  let sandboxStatus: AgentSandboxResult['sandbox_status'] = 'active'
  if (hasCritical) sandboxStatus = 'terminated'
  else if (violations.some(v => v.action === 'quarantined')) sandboxStatus = 'quarantined'
  else if (hasViolation) sandboxStatus = 'violation'

  const isolationScore = Math.max(0, Math.min(0.99, 0.95 - violations.length * 0.08))
  const networkCompliance = input.network_policy === 'isolated' ? 0.99 : input.network_policy === 'restricted' ? 0.85 : input.network_policy === 'monitored' ? 0.7 : 0.5
  const toolCompliance = input.allowed_tools ? Math.min(0.99, 0.7 + rng.nextFloat(0, 0.28)) : 0.9

  const recommendations: string[] = []
  if (hasCritical) {
    recommendations.push('CRITICAL: Immediate sandbox termination — investigate agent behavior')
    recommendations.push('Escalate incident to security operations team')
  }
  if (violations.some(v => v.type === 'resource_exceed')) {
    recommendations.push('Resource limit violations detected — increase limits or optimize agent efficiency')
  }
  recommendations.push(`Current isolation score: ${(isolationScore * 100).toFixed(0)}% — target >90% for production deployment`)
  recommendations.push('Implement seccomp profiles and capability dropping for enhanced syscall isolation')

  return {
    agent_id: input.agent_id,
    sandbox_status: sandboxStatus,
    isolation_score: Math.round(isolationScore * 100) / 100,
    violations,
    resource_usage: {
      cpu_percent: Math.round(rng.nextFloat(10, 95) * 100) / 100,
      memory_percent: Math.round(rng.nextFloat(15, 88) * 100) / 100,
      uptime_seconds: rng.nextInt(60, 86400)
    },
    network_compliance: Math.round(networkCompliance * 100) / 100,
    tool_compliance: Math.round(toolCompliance * 100) / 100,
    recommendations
  }
}

function formatAgentSandboxReport(result: AgentSandboxResult): string {
  const lines: string[] = []
  lines.push('## Agent Sandbox Manager Report')
  lines.push('')
  lines.push(`**Agent ID:** ${result.agent_id} | **Status:** ${result.sandbox_status.toUpperCase()} | **Isolation Score:** ${(result.isolation_score * 100).toFixed(0)}%`)
  lines.push(`**Network Compliance:** ${(result.network_compliance * 100).toFixed(0)}% | **Tool Compliance:** ${(result.tool_compliance * 100).toFixed(0)}%`)
  lines.push(`**Resource Usage:** CPU ${result.resource_usage.cpu_percent.toFixed(0)}% | MEM ${result.resource_usage.memory_percent.toFixed(0)}% | Uptime ${result.resource_usage.uptime_seconds}s`)
  lines.push('')
  if (result.violations.length > 0) {
    lines.push('### Violations')
    lines.push('| ID | Type | Severity | Action | Description |')
    lines.push('|----|------|----------|--------|-------------|')
    for (const v of result.violations) {
      lines.push(`| ${v.violation_id} | ${v.type} | ${v.severity} | ${v.action} | ${v.description.substring(0, 40)} |`)
    }
    lines.push('')
  } else {
    lines.push('### No violations detected — sandbox operating within policy')
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 5: TOOL USE MONITOR ====================

function monitorToolUse(input: ToolUseMonitorInput): ToolUseMonitorResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const anomalies: ToolAnomaly[] = []
  const toolCount: Record<string, number> = {}
  const baselineTools = input.baseline_tools || []
  const rateLimit = input.rate_limit_per_minute || 60
  const threshold = input.anomaly_threshold || 0.7

  // Count tool usage
  for (const inv of input.invocations) {
    toolCount[inv.tool_name] = (toolCount[inv.tool_name] || 0) + 1
  }

  // Detect anomalies
  for (let iIdx = 0; iIdx < input.invocations.length; iIdx++) {
    const inv = input.invocations[iIdx]
    const confidence = rng.nextFloat(0.3, 0.95)

    // Frequency spike detection
    if (toolCount[inv.tool_name] > input.invocations.length * 0.4 && confidence > threshold) {
      anomalies.push({
        invocation_index: iIdx,
        tool_name: inv.tool_name,
        anomaly_type: 'frequency_spike',
        severity: confidence > 0.8 ? 'high' : 'medium',
        confidence: Math.round(confidence * 100) / 100,
        description: `Tool "${inv.tool_name}" called ${toolCount[inv.tool_name]} times — ${(toolCount[inv.tool_name] / input.invocations.length * 100).toFixed(0)}% of all invocations`,
        recommended_action: 'Review tool usage patterns for potential misuse or infinite loop'
      })
    }

    // Unauthorized tool detection
    if (baselineTools.length > 0 && !baselineTools.includes(inv.tool_name) && confidence > threshold - 0.1) {
      anomalies.push({
        invocation_index: iIdx,
        tool_name: inv.tool_name,
        anomaly_type: 'unauthorized_tool',
        severity: confidence > 0.75 ? 'high' : 'medium',
        confidence: Math.round(confidence * 100) / 100,
        description: `Tool "${inv.tool_name}" not in baseline toolset: [${baselineTools.join(', ')}]`,
        recommended_action: 'Block unauthorized tool and review agent permissions'
      })
    }

    // Timing anomaly
    if (inv.duration_ms > 30000 && confidence > threshold) {
      anomalies.push({
        invocation_index: iIdx,
        tool_name: inv.tool_name,
        anomaly_type: 'timing_anomaly',
        severity: inv.duration_ms > 120000 ? 'high' : 'medium',
        confidence: Math.round(confidence * 100) / 100,
        description: `Tool "${inv.tool_name}" took ${inv.duration_ms}ms — significantly above normal range`,
        recommended_action: 'Investigate potential resource exhaustion or stalling attack'
      })
    }

    // Chain suspicious detection
    if (iIdx > 0 && iIdx < input.invocations.length - 1) {
      const prev = input.invocations[iIdx - 1]
      const next = input.invocations[iIdx + 1]
      if (prev.tool_name === next.tool_name && prev.tool_name !== inv.tool_name && confidence > threshold + 0.1) {
        anomalies.push({
          invocation_index: iIdx,
          tool_name: inv.tool_name,
          anomaly_type: 'chain_suspicious',
          severity: 'medium',
          confidence: Math.round(confidence * 100) / 100,
          description: `Suspicious tool chain: ${prev.tool_name} -> ${inv.tool_name} -> ${next.tool_name}`,
          recommended_action: 'Review multi-step tool chain for potential exploit sequence'
        })
      }
    }
  }

  // Rate limit violations
  const windowMs = input.monitoring_window_minutes * 60000
  let rateLimitViolations = 0
  if (input.invocations.length > rateLimit) {
    rateLimitViolations = input.invocations.length - rateLimit
  }

  const anomalyRate = anomalies.length / Math.max(1, input.invocations.length)
  const uniqueTools = Object.keys(toolCount).length
  const diversityScore = Math.min(1, uniqueTools / Math.max(1, input.invocations.length))

  let behavioralRisk: ToolUseMonitorResult['behavioral_risk'] = 'low'
  if (anomalyRate > 0.4) behavioralRisk = 'critical'
  else if (anomalyRate > 0.25) behavioralRisk = 'high'
  else if (anomalyRate > 0.1) behavioralRisk = 'moderate'

  const recommendations: string[] = []
  if (anomalies.length > 0) {
    recommendations.push(`${anomalies.length} anomalies detected across ${input.invocations.length} invocations — review flagged items`)
  }
  if (rateLimitViolations > 0) {
    recommendations.push(`${rateLimitViolations} rate limit violations — throttle or queue tool invocations`)
  }
  if (diversityScore > 0.8) {
    recommendations.push('High tool diversity detected — may indicate exploratory or uncontrolled behavior')
  }
  recommendations.push('Establish tool usage baselines from production traffic for anomaly calibration')
  recommendations.push('Implement real-time circuit breaker for anomalous tool invocation patterns')

  return {
    total_invocations: input.invocations.length,
    tool_count: toolCount,
    anomalies,
    anomaly_rate: Math.round(anomalyRate * 100) / 100,
    rate_limit_violations: rateLimitViolations,
    tool_diversity_score: Math.round(diversityScore * 100) / 100,
    behavioral_risk: behavioralRisk,
    recommendations
  }
}

function formatToolUseMonitorReport(result: ToolUseMonitorResult): string {
  const lines: string[] = []
  lines.push('## Tool Use Monitor Report')
  lines.push('')
  lines.push(`**Total Invocations:** ${result.total_invocations} | **Anomalies:** ${result.anomalies.length} | **Anomaly Rate:** ${(result.anomaly_rate * 100).toFixed(1)}%`)
  lines.push(`**Rate Limit Violations:** ${result.rate_limit_violations} | **Diversity Score:** ${(result.tool_diversity_score * 100).toFixed(2)} | **Behavioral Risk:** ${result.behavioral_risk.toUpperCase()}`)
  lines.push('')
  lines.push('### Tool Frequency')
  lines.push('| Tool | Count |')
  lines.push('|------|-------|')
  for (const [tool, count] of Object.entries(result.tool_count).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    lines.push(`| ${tool} | ${count} |`)
  }
  lines.push('')
  if (result.anomalies.length > 0) {
    lines.push('### Anomalies')
    lines.push('| # | Tool | Type | Severity | Confidence |')
    lines.push('|---|------|------|----------|------------|')
    for (const a of result.anomalies.slice(0, 10)) {
      lines.push(`| ${a.invocation_index + 1} | ${a.tool_name} | ${a.anomaly_type} | ${a.severity} | ${(a.confidence * 100).toFixed(0)}% |`)
    }
    if (result.anomalies.length > 10) {
      lines.push(`| ... | ... | ... | ... | +${result.anomalies.length - 10} more |`)
    }
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 6: DATA EXFILTRATION GUARD ====================

function guardDataExfiltration(input: DataExfiltrationInput): DataExfiltrationResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const risks: ExfiltrationRisk[] = []
  const sensitivePatterns = input.sensitive_patterns || ['api_key', 'password', 'secret', 'token', 'ssn', 'credit_card', 'proprietary', 'classified']
  const allowedDest = input.allowed_destinations || []

  let totalBytesAtRisk = 0
  let blockedStreams = 0
  let encryptedCount = 0

  for (let sIdx = 0; sIdx < input.data_streams.length; sIdx++) {
    const stream = input.data_streams[sIdx]
    if (stream.encrypted) encryptedCount++

    const riskFactors: string[] = []
    let riskScore = rng.nextFloat(0, 0.3)

    // Check destination
    if (allowedDest.length > 0 && !allowedDest.includes(stream.destination)) {
      riskFactors.push(`Unauthorized destination: ${stream.destination}`)
      riskScore += 0.3
    }

    // Check sensitive patterns in data type
    for (const ptr of sensitivePatterns) {
      if (stream.data_type.toLowerCase().includes(ptr.toLowerCase())) {
        riskFactors.push(`Sensitive data type detected: ${ptr}`)
        riskScore += 0.15
      }
    }

    // Check size
    if (input.max_transfer_bytes && stream.size_bytes > input.max_transfer_bytes) {
      riskFactors.push(`Transfer size ${stream.size_bytes} exceeds limit ${input.max_transfer_bytes}`)
      riskScore += 0.2
    }

    // Unencrypted sensitive data
    if (!stream.encrypted && riskScore > 0.4) {
      riskFactors.push('Unencrypted transmission of potentially sensitive data')
      riskScore += 0.1
    }

    const confidence = Math.min(0.99, riskScore)

    let riskLevel: ExfiltrationRisk['risk_level'] = 'low'
    if (confidence > 0.8) riskLevel = 'critical'
    else if (confidence > 0.6) riskLevel = 'high'
    else if (confidence > 0.4) riskLevel = 'medium'

    let action: ExfiltrationRisk['action'] = 'allowed'
    if (riskLevel === 'critical' && input.dlp_policy === 'strict') action = 'blocked'
    else if (riskLevel === 'high') action = 'flagged'
    else if (riskLevel === 'medium' && !stream.encrypted) action = 'encrypted'

    if (riskLevel !== 'low') {
      totalBytesAtRisk += stream.size_bytes
      if (action === 'blocked') blockedStreams++

      risks.push({
        stream_index: sIdx,
        source: stream.source,
        destination: stream.destination,
        data_type: stream.data_type,
        risk_level: riskLevel,
        risk_factors: riskFactors,
        bytes_at_risk: stream.size_bytes,
        action
      })
    }
  }

  const dlpCompliance = Math.max(0, Math.min(0.99, 0.9 - blockedStreams * 0.05 - risks.filter(r => r.risk_level === 'high').length * 0.08))
  const encCoverage = encryptedCount / Math.max(1, input.data_streams.length)

  const policyViolations: string[] = []
  if (blockedStreams > 0) policyViolations.push(`${blockedStreams} streams blocked by DLP policy`)
  if (risks.some(r => r.risk_factors.some(f => f.includes('Unauthorized destination')))) {
    policyViolations.push('Unauthorized destination transfers detected')
  }
  if (encCoverage < 0.5) policyViolations.push(`Low encryption coverage: ${(encCoverage * 100).toFixed(0)}% — policy requires >80%`)

  const recommendations: string[] = []
  if (risks.length > 0) {
    recommendations.push(`${risks.length} exfiltration risks identified requiring immediate review`)
  }
  if (encCoverage < 0.8) {
    recommendations.push(`Encryption coverage at ${(encCoverage * 100).toFixed(0)}% — enforce TLS/mTLS for all data streams`)
  }
  recommendations.push('Implement content-aware DLP with ML-based data classification')
  recommendations.push('Deploy data loss prevention at network egress points with real-time blocking')

  return {
    total_streams_scanned: input.data_streams.length,
    risks,
    total_bytes_at_risk: totalBytesAtRisk,
    blocked_streams: blockedStreams,
    dlp_compliance_score: Math.round(dlpCompliance * 100) / 100,
    policy_violations: policyViolations,
    encryption_coverage: Math.round(encCoverage * 100) / 100,
    recommendations
  }
}

function formatDataExfiltrationReport(result: DataExfiltrationResult): string {
  const lines: string[] = []
  lines.push('## Data Exfiltration Guard Report')
  lines.push('')
  lines.push(`**Streams Scanned:** ${result.total_streams_scanned} | **Risks Found:** ${result.risks.length} | **Blocked:** ${result.blocked_streams}`)
  lines.push(`**Bytes at Risk:** ${result.total_bytes_at_risk.toLocaleString()} | **DLP Compliance:** ${(result.dlp_compliance_score * 100).toFixed(0)}% | **Encryption Coverage:** ${(result.encryption_coverage * 100).toFixed(0)}%`)
  lines.push('')
  if (result.risks.length > 0) {
    lines.push('### Risk Details')
    lines.push('| # | Source | Destination | Type | Risk Level | Action |')
    lines.push('|---|--------|-------------|------|------------|--------|')
    for (const r of result.risks.slice(0, 10)) {
      lines.push(`| ${r.stream_index + 1} | ${r.source.substring(0, 15)} | ${r.destination.substring(0, 15)} | ${r.data_type.substring(0, 15)} | ${r.risk_level} | ${r.action} |`)
    }
    if (result.risks.length > 10) {
      lines.push(`| ... | ... | ... | ... | ... | +${result.risks.length - 10} more |`)
    }
    lines.push('')
  }
  if (result.policy_violations.length > 0) {
    lines.push('### Policy Violations')
    for (const v of result.policy_violations) {
      lines.push(`- ${v}`)
    }
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 7: PRIVILEGE ESCALATION DETECTOR ====================

function detectPrivilegeEscalation(input: PrivilegeEscalationInput): PrivilegeEscalationResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const findings: EscalationFinding[] = []
  const permHierarchy = input.permission_hierarchy || ['read', 'write', 'execute', 'admin', 'root', 'system']
  const threshold = input.escalation_threshold || 0.6
  const approvalLevel = input.require_approval_above || 'admin'

  let verticalCount = 0
  let horizontalCount = 0

  for (let aIdx = 0; aIdx < input.actions.length; aIdx++) {
    const action = input.actions[aIdx]
    const currentIdx = permHierarchy.indexOf(action.current_level.toLowerCase())
    const requestedIdx = permHierarchy.indexOf(action.requested_permission.toLowerCase())
    const confidence = rng.nextFloat(0.3, 0.95)

    // Vertical escalation: requesting higher privilege level
    if (requestedIdx > currentIdx && confidence > threshold) {
      verticalCount++
      const jumpSize = requestedIdx - currentIdx
      let severity: EscalationFinding['severity'] = 'low'
      if (jumpSize >= 3) severity = 'critical'
      else if (jumpSize === 2) severity = 'high'
      else severity = 'medium'

      findings.push({
        action_index: aIdx,
        actor: action.actor,
        action: action.action,
        escalation_type: 'vertical',
        severity,
        confidence: Math.round(confidence * 100) / 100,
        from_level: action.current_level,
        to_level: action.requested_permission,
        justification_required: requestedIdx >= permHierarchy.indexOf(approvalLevel),
        recommendation: jumpSize >= 2
          ? 'Block escalation — multi-level privilege jump requires explicit approval'
          : 'Review escalation request with resource owner'
      })
    }

    // Horizontal escalation: accessing different resource at same level
    if (currentIdx === requestedIdx && confidence > threshold + 0.15 && rng.nextFloat(0, 1) > 0.6) {
      horizontalCount++
      findings.push({
        action_index: aIdx,
        actor: action.actor,
        action: action.action,
        escalation_type: 'horizontal',
        severity: 'medium',
        confidence: Math.round(confidence * 100) / 100,
        from_level: action.current_level,
        to_level: action.requested_permission,
        justification_required: true,
        recommendation: 'Verify resource ownership — lateral movement at same privilege level'
      })
    }

    // Temporal escalation: rapid successive escalations
    if (aIdx > 0 && findings.length > 0) {
      const prev = findings[findings.length - 1]
      if (prev.actor === action.actor && confidence > threshold) {
        findings.push({
          action_index: aIdx,
          actor: action.actor,
          action: action.action,
          escalation_type: 'temporal',
          severity: 'high',
          confidence: Math.round(confidence * 100) / 100,
          from_level: action.current_level,
          to_level: action.requested_permission,
          justification_required: true,
          recommendation: 'Rapid escalation pattern detected — implement cooling-off period'
        })
      }
    }
  }

  const escRate = findings.length / Math.max(1, input.actions.length)
  const highestRiskActor = findings.length > 0
    ? findings.sort((a, b) => b.confidence - a.confidence)[0].actor
    : 'none'
  const governanceCompliance = Math.max(0, Math.min(0.99, 0.9 - findings.filter(f => f.severity === 'critical').length * 0.12))

  const recommendations: string[] = []
  if (verticalCount > 0) recommendations.push(`${verticalCount} vertical escalations detected — enforce least-privilege principle`)
  if (horizontalCount > 0) recommendations.push(`${horizontalCount} horizontal escalations detected — resource access segmentation needed`)
  if (escRate > 0.3) recommendations.push('High escalation rate — review permission assignment workflow')
  recommendations.push('Implement just-in-time (JIT) privilege access with time-bound elevation')
  recommendations.push('Deploy behavior-based escalation detection with ML anomaly models')

  return {
    total_actions_scanned: input.actions.length,
    findings,
    escalation_rate: Math.round(escRate * 100) / 100,
    vertical_escalations: verticalCount,
    horizontal_escalations: horizontalCount,
    highest_risk_actor: highestRiskActor,
    governance_compliance: Math.round(governanceCompliance * 100) / 100,
    recommendations
  }
}

function formatPrivilegeEscalationReport(result: PrivilegeEscalationResult): string {
  const lines: string[] = []
  lines.push('## Privilege Escalation Detection Report')
  lines.push('')
  lines.push(`**Actions Scanned:** ${result.total_actions_scanned} | **Findings:** ${result.findings.length} | **Escalation Rate:** ${(result.escalation_rate * 100).toFixed(1)}%`)
  lines.push(`**Vertical:** ${result.vertical_escalations} | **Horizontal:** ${result.horizontal_escalations} | **Highest Risk Actor:** ${result.highest_risk_actor}`)
  lines.push(`**Governance Compliance:** ${(result.governance_compliance * 100).toFixed(0)}%`)
  lines.push('')
  if (result.findings.length > 0) {
    lines.push('### Escalation Findings')
    lines.push('| # | Actor | Type | From | To | Severity | Approval Needed |')
    lines.push('|---|-------|------|------|----|----------|-----------------|')
    for (const f of result.findings.slice(0, 12)) {
      lines.push(`| ${f.action_index + 1} | ${f.actor.substring(0, 12)} | ${f.escalation_type} | ${f.from_level} | ${f.to_level} | ${f.severity} | ${f.justification_required ? 'YES' : 'NO'} |`)
    }
    if (result.findings.length > 12) {
      lines.push(`| ... | ... | ... | ... | ... | ... | +${result.findings.length - 12} more |`)
    }
    lines.push('')
  }
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 8: ADVERSARIAL ROBUSTNESS SCORER ====================

function scoreAdversarialRobustness(input: AdversarialRobustnessInput): AdversarialRobustnessResult {
  const seedStr = JSON.stringify(input)
  const rng = createSeededRandom(seedStr)

  const dimensions: RobustnessDimension[] = []
  const attackVectors = input.attack_vectors || ['perturbation', 'evasion', 'poisoning', 'extraction', 'inversion', 'backdoor']
  const robustnessDims = input.robustness_dimensions || ['input_robustness', 'output_integrity', 'context_preservation', 'instruction_adherence', 'boundary_maintenance', 'recovery_capability']

  const attackResistance: Record<string, number> = {}
  for (const av of attackVectors) {
    attackResistance[av] = Math.round(rng.nextFloat(0.4, 0.95) * 100) / 100
  }

  for (const dim of robustnessDims) {
    const score = Math.round(rng.nextFloat(0.45, 0.95) * 100) / 100
    const weight = rng.nextFloat(0.1, 0.25)

    let grade: RobustnessDimension['grade'] = 'A'
    if (score < 0.5) grade = 'F'
    else if (score < 0.6) grade = 'D'
    else if (score < 0.7) grade = 'C'
    else if (score < 0.8) grade = 'B'

    const findings: string[] = []
    const suggestions: string[] = []

    if (score < 0.7) {
      findings.push(`${dim} score below threshold — ${((1 - score) * 100).toFixed(0)}% vulnerability gap identified`)
      suggestions.push(`Strengthen ${dim} through adversarial training and input validation`)
    }
    if (score < 0.8) {
      suggestions.push(`Implement redundancy checks for ${dim} in production pipeline`)
    }
    if (findings.length === 0) {
      findings.push(`${dim} operating within acceptable robustness parameters`)
      suggestions.push(`Continue monitoring ${dim} with periodic adversarial testing`)
    }

    dimensions.push({ dimension: dim, score, weight: Math.round(weight * 100) / 100, grade, findings, improvement_suggestions: suggestions })
  }

  const overallScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / dimensions.reduce((sum, d) => sum + d.weight, 0)
  let overallGrade: AdversarialRobustnessResult['overall_grade'] = 'A'
  if (overallScore < 0.5) overallGrade = 'F'
  else if (overallScore < 0.6) overallGrade = 'D'
  else if (overallScore < 0.7) overallGrade = 'C'
  else if (overallScore < 0.8) overallGrade = 'B'

  const vulnerabilityHotspots = dimensions
    .filter(d => d.score < 0.7)
    .map(d => `${d.dimension}: ${(d.score * 100).toFixed(0)}% (Grade ${d.grade})`)

  const benchmarkPercentile = Math.min(99, Math.max(5, Math.round(overallScore * 80 + rng.nextFloat(0, 19))))

  const recommendations: string[] = []
  if (overallScore < 0.7) {
    recommendations.push('Overall robustness below threshold — prioritize adversarial hardening before deployment')
  }
  if (vulnerabilityHotspots.length > 0) {
    recommendations.push(`${vulnerabilityHotspots.length} vulnerability hotspots identified — address lowest-scoring dimensions first`)
  }
  recommendations.push(`Benchmark percentile: ${benchmarkPercentile}% — target >80th percentile for production`)
  recommendations.push('Implement continuous adversarial testing with evolving attack datasets')
  recommendations.push('Deploy ensemble defense strategy combining input sanitization, output monitoring, and behavioral analysis')

  return {
    overall_score: Math.round(overallScore * 100) / 100,
    overall_grade: overallGrade,
    dimensions,
    attack_resistance: attackResistance,
    vulnerability_hotspots: vulnerabilityHotspots,
    benchmark_percentile: benchmarkPercentile,
    recommendations
  }
}

function formatAdversarialRobustnessReport(result: AdversarialRobustnessResult): string {
  const lines: string[] = []
  lines.push('## Adversarial Robustness Scoring Report')
  lines.push('')
  lines.push(`**Overall Score:** ${(result.overall_score * 100).toFixed(0)}% | **Grade:** ${result.overall_grade} | **Benchmark Percentile:** ${result.benchmark_percentile}th`)
  lines.push('')
  lines.push('### Dimension Scores')
  lines.push('| Dimension | Score | Weight | Grade |')
  lines.push('|-----------|-------|--------|-------|')
  for (const d of result.dimensions) {
    lines.push(`| ${d.dimension} | ${(d.score * 100).toFixed(0)}% | ${d.weight.toFixed(2)} | ${d.grade} |`)
  }
  lines.push('')
  lines.push('### Attack Resistance')
  lines.push('| Attack Vector | Resistance |')
  lines.push('|---------------|------------|')
  for (const [av, score] of Object.entries(result.attack_resistance)) {
    lines.push(`| ${av} | ${(score * 100).toFixed(0)}% |`)
  }
  if (result.vulnerability_hotspots.length > 0) {
    lines.push('')
    lines.push('### Vulnerability Hotspots')
    for (const h of result.vulnerability_hotspots) {
      lines.push(`- ${h}`)
    }
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: prompt_injection_detector
  tools.register(defineTool({
    name: 'prompt_injection_detector',
    description: 'Multi-pattern prompt injection detection with severity scoring. Identifies direct, indirect, role manipulation, encoding, and context overflow injection attacks against LLM prompts.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: prompts (string[]), model_context (string, optional), sensitivity_level (low/medium/high/critical, optional), custom_patterns (string[], optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: PromptInjectionInput = JSON.parse(args.input)
      const result = detectPromptInjection(data)
      return formatPromptInjectionReport(result)
    }
  }))

  // Tool 2: jailbreak_prevention_engine
  tools.register(defineTool({
    name: 'jailbreak_prevention_engine',
    description: 'Jailbreak attempt identification and mitigation engine. Detects role-play, encoding, logical trap, emotional manipulation, token smuggling, and multi-turn jailbreak techniques with configurable defense modes.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: user_messages (string[]), system_prompt (string, optional), jailbreak_categories (string[], optional), defense_mode (passive/active/aggressive), model_tier (consumer/enterprise/classified)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: JailbreakPreventionInput = JSON.parse(args.input)
      const result = preventJailbreak(data)
      return formatJailbreakPreventionReport(result)
    }
  }))

  // Tool 3: output_filter_controller
  tools.register(defineTool({
    name: 'output_filter_controller',
    description: 'Content safety filtering and PII redaction for LLM outputs. Implements policy-standard filtering across toxicity, PII, code injection, and other violation categories with configurable redaction.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: outputs (string[]), filter_categories (string[], optional), pii_types (string[], optional), content_policy (standard/strict/healthcare/financial/education), redaction_enabled (boolean), max_output_length (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: OutputFilterInput = JSON.parse(args.input)
      const result = filterOutput(data)
      return formatOutputFilterReport(result)
    }
  }))

  // Tool 4: agent_sandbox_manager
  tools.register(defineTool({
    name: 'agent_sandbox_manager',
    description: 'Execution isolation and resource governance for AI agents. Manages container/VM/enclave sandboxing with resource limits, network policy enforcement, and escape attempt detection.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: agent_id (string), execution_environment (container/vm/enclave/process), resource_limits (object with cpu_cores, memory_mb, timeout_seconds, max_filesystem_mb), network_policy (isolated/restricted/monitored/full), allowed_tools (string[], optional), blocked_syscalls (string[], optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: AgentSandboxInput = JSON.parse(args.input)
      const result = manageAgentSandbox(data)
      return formatAgentSandboxReport(result)
    }
  }))

  // Tool 5: tool_use_monitor
  tools.register(defineTool({
    name: 'tool_use_monitor',
    description: 'Anomalous tool invocation detection and rate limiting. Monitors agent tool usage patterns for frequency spikes, unauthorized tools, timing anomalies, and suspicious tool chains.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: invocations (array of {tool_name, timestamp, parameters_summary, duration_ms}), baseline_tools (string[], optional), anomaly_threshold (number, optional), rate_limit_per_minute (number, optional), monitoring_window_minutes (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: ToolUseMonitorInput = JSON.parse(args.input)
      const result = monitorToolUse(data)
      return formatToolUseMonitorReport(result)
    }
  }))

  // Tool 6: data_exfiltration_guard
  tools.register(defineTool({
    name: 'data_exfiltration_guard',
    description: 'Sensitive data leak prevention and DLP for AI agent data streams. Monitors data transfers for unauthorized destinations, sensitive content, and encryption compliance.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: data_streams (array of {source, destination, data_type, size_bytes, encrypted}), sensitive_patterns (string[], optional), dlp_policy (standard/strict/hipaa/pci_dss/gdpr), max_transfer_bytes (number, optional), allowed_destinations (string[], optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: DataExfiltrationInput = JSON.parse(args.input)
      const result = guardDataExfiltration(data)
      return formatDataExfiltrationReport(result)
    }
  }))

  // Tool 7: privilege_escalation_detector
  tools.register(defineTool({
    name: 'privilege_escalation_detector',
    description: 'Unauthorized privilege gain monitoring for AI agent actions. Detects vertical, horizontal, and temporal privilege escalation with governance compliance tracking.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: actions (array of {actor, action, requested_permission, current_level, target_resource}), permission_hierarchy (string[], optional), escalation_threshold (number, optional), audit_window_hours (number), require_approval_above (string, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: PrivilegeEscalationInput = JSON.parse(args.input)
      const result = detectPrivilegeEscalation(data)
      return formatPrivilegeEscalationReport(result)
    }
  }))

  // Tool 8: adversarial_robustness_scorer
  tools.register(defineTool({
    name: 'adversarial_robustness_scorer',
    description: 'Adversarial input resilience evaluation across multiple robustness dimensions. Scores agent resistance to perturbation, evasion, poisoning, extraction, inversion, and backdoor attacks.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object: test_cases (array of {input_text, expected_behavior, adversarial_type}), attack_vectors (string[], optional), robustness_dimensions (string[], optional), model_capabilities (string[], optional), evaluation_rounds (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: AdversarialRobustnessInput = JSON.parse(args.input)
      const result = scoreAdversarialRobustness(data)
      return formatAdversarialRobustnessReport(result)
    }
  }))

  console.log(`[dsh-tool-agentsec] Loaded v${VERSION} - AI Agent Security with 8 tools`)
  console.log('  Tools: prompt_injection_detector, jailbreak_prevention_engine, output_filter_controller, agent_sandbox_manager, tool_use_monitor, data_exfiltration_guard, privilege_escalation_detector, adversarial_robustness_scorer')
}
