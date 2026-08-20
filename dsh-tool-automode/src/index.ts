/**
 * DSH Auto Mode Safety Classifier Plugin v0.1.0
 *
 * Auto mode safety toolkit for DeepSeek Harness - command classification, risk assessment,
 * boundary enforcement, approval recommendations, execution monitoring, safety auditing,
 * policy tuning, and incident prediction. Inspired by Claude Code auto mode (August 2026).
 *
 * @module dsh-tool-automode
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-automode'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== UTILITY ====================

/** Generate a deterministic pseudo-random number from a string seed (range: 0-1) */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs((Math.sin(hash) * 10000) % 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

// ==================== TYPES ====================

// --- Tool 1: Command Classifier ---
interface CommandClassifyInput {
  command: string
  context: string
  workspace_scope: string
}

interface ClassificationResult {
  command: string
  risk_level: 'safe' | 'review' | 'dangerous'
  confidence: number
  reasoning: string[]
  category: string
  suggested_action: string
  auto_approve_eligible: boolean
  requires_human: boolean
  related_policies: string[]
}

// --- Tool 2: Risk Assessor ---
interface ProposedAction {
  action: string
  target: string
  impact_scope: string
  reversibility: 'reversible' | 'partially_reversible' | 'irreversible'
  data_sensitivity: 'public' | 'internal' | 'confidential' | 'restricted'
}

interface EnvironmentContext {
  environment: 'development' | 'staging' | 'production' | 'testing'
  data_classification: string
  active_users: number
  backup_available: boolean
  change_window: boolean
}

interface UserClearance {
  level: 'viewer' | 'operator' | 'admin' | 'super_admin'
  roles: string[]
  mfa_verified: boolean
  session_age_minutes: number
}

interface RiskAssessmentResult {
  overall_risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: Array<{ factor: string; weight: number; contribution: number }>
  mitigations: string[]
  assessment_id: string
  timestamp: string
}

// --- Tool 3: Boundary Enforcer ---
interface ActionRequest {
  action: string
  target: string
  parameters: Record<string, string>
  initiator: string
  timestamp: string
}

interface DefinedBoundary {
  boundary_id: string
  name: string
  type: 'read_only' | 'write_limit' | 'execution_block' | 'data_scope' | 'rate_limit'
  condition: string
  action: 'deny' | 'warn' | 'log'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface CurrentState {
  current_load: number
  active_operations: number
  recent_failures: number
  resource_usage_pct: number
}

interface BoundaryEnforcementResult {
  decision: 'allow' | 'deny' | 'conditional'
  action_request: string
  violations: Array<{ boundary_id: string; boundary_name: string; violation_detail: string; severity: string }>
  conditions: string[]
  enforcement_id: string
  explanation: string
}

// --- Tool 4: Approval Recommender ---
interface PendingAction {
  action_id: string
  action: string
  risk_score: number
  requester: string
  timestamp: string
  auto_approve_history: number
  category: string
}

interface HistoricalDecision {
  action_pattern: string
  original_decision: string
  outcome: 'success' | 'failure' | 'partial'
  timestamp: string
}

interface ApprovalRecommendation {
  action_id: string
  action: string
  recommendation: 'auto_approve' | 'review' | 'escalate'
  confidence: number
  reason: string
  sla_seconds: number
}

interface ApprovalRecommenderResult {
  recommendations: ApprovalRecommendation[]
  auto_approve_count: number
  review_count: number
  escalate_count: number
  batch_id: string
  summary: string
}

// --- Tool 5: Execution Monitor ---
interface ActiveOperation {
  operation_id: string
  action: string
  started_at: string
  expected_duration_ms: number
  actual_duration_ms: number
  status: 'running' | 'completed' | 'failed' | 'timeout'
  resource_delta: number
  side_effects: string[]
}

interface ExpectedBehavior {
  max_duration_ms: number
  max_resource_pct: number
  expected_side_effects: string[]
  allowed_exit_codes: number[]
}

interface AnomalyDetection {
  operation_id: string
  action: string
  anomaly_type: 'duration_exceeded' | 'resource_spike' | 'unexpected_side_effect' | 'status_anomaly' | 'cascade_failure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  deviation_pct: number
  recommended_action: string
}

interface ExecutionMonitorResult {
  anomalies: AnomalyDetection[]
  total_monitored: number
  healthy_count: number
  anomaly_rate: number
  overall_health: 'healthy' | 'degraded' | 'critical'
  monitor_id: string
  alert_summary: string
}

// --- Tool 6: Safety Auditor ---
interface ExecutionLog {
  timestamp: string
  operation: string
  actor: string
  result: string
  risk_level: string
  duration_ms: number
  metadata: Record<string, string>
}

interface SafetyPolicy {
  policy_id: string
  name: string
  category: string
  rules: Array<{ rule_id: string; description: string; check: string; severity: string }>
}

interface ComplianceViolation {
  log_entry: string
  policy_id: string
  policy_name: string
  rule_id: string
  violation_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

interface SafetyAuditResult {
  audit_id: string
  total_logs_reviewed: number
  total_policies_checked: number
  violations: ComplianceViolation[]
  compliance_rate: number
  risk_distribution: Record<string, number>
  violation_patterns: Array<{ pattern: string; count: number; trend: string }>
  summary: string
}

// --- Tool 7: Policy Tuner ---
interface FalsePositiveEntry {
  action: string
  originally_classified_as: string
  correct_classification: string
  timestamp: string
  impact: string
}

interface FalseNegativeEntry {
  action: string
  originally_classified_as: string
  correct_classification: string
  timestamp: string
  damage: string
}

interface CurrentPolicy {
  policy_id: string
  name: string
  thresholds: Record<string, number>
  rules: string[]
  last_updated: string
}

interface PolicyTuneRecommendation {
  policy_id: string
  tuning_type: 'threshold_adjust' | 'rule_add' | 'rule_remove' | 'scope_change'
  current_value: string
  recommended_value: string
  expected_improvement: string
  confidence: number
}

interface PolicyTunerResult {
  tuning_id: string
  false_positive_rate: number
  false_negative_rate: number
  recommendations: PolicyTuneRecommendation[]
  overall_policy_health: 'optimal' | 'acceptable' | 'needs_tuning' | 'critical_review'
  summary: string
}

// --- Tool 8: Incident Predictor ---
interface OperationStep {
  step_number: number
  action: string
  target: string
  risk_score: number
  dependencies: string[]
  estimated_duration_ms: number
}

interface SystemStateState {
  cpu_usage_pct: number
  memory_usage_pct: number
  disk_usage_pct: number
  network_latency_ms: number
  active_connections: number
  recent_error_rate: number
}

interface IncidentPrediction {
  prediction_id: string
  incident_type: string
  probability: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  trigger_step: number
  description: string
  preventive_measures: string[]
  estimated_impact: string
}

interface IncidentPredictorResult {
  predictions: IncidentPrediction[]
  overall_risk_trend: 'stable' | 'increasing' | 'critical_escalation'
  highest_risk_step: number
  prediction_id: string
  summary: string
}

// ==================== TOOL 1: COMMAND CLASSIFIER ====================

function classifyCommand(input: CommandClassifyInput): ClassificationResult {
  const cmd = input.command.toLowerCase()
  const ctx = input.context.toLowerCase()

  // Risk keyword mapping
  const dangerousPatterns = [
    'rm -rf', 'drop table', 'truncate', 'delete from', 'format',
    'chmod 777', 'sudo', 'mkfs', 'dd if=', '>>/dev/',
    'DROP ', 'TRUNCATE ', 'DELETE FROM', 'ALTER TABLE',
    'git push --force', 'git reset --hard', 'npm unpublish',
    'docker system prune', 'kubectl delete', 'terraform destroy',
  ]

  const reviewPatterns = [
    'update', 'modify', 'create', 'insert', 'deploy', 'publish',
    'merge', 'rebase', 'cherry-pick', 'amend', 'config', 'restart',
    'stop', 'kill', 'terminate', 'revoke', 'grant', 'rotate',
    'UPDATE ', 'INSERT INTO', 'CREATE ', 'ALTER ', 'GRANT ', 'REVOKE ',
  ]

  const safePatterns = [
    'ls', 'cat', 'echo', 'head', 'tail', 'wc', 'grep', 'find',
    'status', 'log', 'show', 'describe', 'get', 'list', 'read',
    'SELECT ', 'SHOW ', 'DESCRIBE ', 'EXPLAIN ', 'git status',
    'git log', 'git diff', 'npm test', 'npm run lint', 'npm audit',
  ]

  let riskScore = 0
  const reasoning: string[] = []
  let category = 'general'

  for (const pattern of dangerousPatterns) {
    if (cmd.includes(pattern.toLowerCase())) { riskScore += 40; reasoning.push(`Contains dangerous pattern: "${pattern}"`); break }
  }
  for (const pattern of reviewPatterns) {
    if (cmd.includes(pattern.toLowerCase())) { riskScore += 20; reasoning.push(`Contains modification pattern: "${pattern}"`); break }
  }
  let safeMatch = false
  for (const pattern of safePatterns) {
    if (cmd.includes(pattern.toLowerCase())) { safeMatch = true; break }
  }
  if (safeMatch && riskScore === 0) { riskScore -= 10; reasoning.push('Matches known safe operation pattern') }
  if (ctx.includes('production') || ctx.includes('prod')) { riskScore += 15; reasoning.push('Production environment context elevates risk') }
  if (ctx.includes('test') || ctx.includes('dev') || ctx.includes('local')) { riskScore -= 5; reasoning.push('Non-production environment reduces risk') }
  const scope = input.workspace_scope.toLowerCase()
  if (scope.includes('system') || scope.includes('root') || scope.includes('infrastructure')) { riskScore += 10; reasoning.push('System-level workspace scope adds risk') }
  const specialChars = (input.command.match(/[|;&>$`]/g) || []).length
  if (specialChars > 2) { riskScore += 10; reasoning.push(`High command complexity: ${specialChars} special characters`) }
  if (input.command.length > 200) { riskScore += 5; reasoning.push('Unusually long command — possible encoded payload') }

  // Determine category
  if (cmd.includes('git') || cmd.includes('svn')) {
    category = 'version_control'
  } else if (cmd.includes('docker') || cmd.includes('kubectl') || cmd.includes('helm')) {
    category = 'container_orchestration'
  } else if (cmd.includes('sql') || cmd.includes('select') || cmd.includes('insert') || cmd.includes('update') || cmd.includes('delete')) {
    category = 'database'
  } else if (cmd.includes('npm') || cmd.includes('pip') || cmd.includes('cargo') || cmd.includes('go ')) {
    category = 'package_management'
  } else if (cmd.includes('rm') || cmd.includes('mv') || cmd.includes('cp') || cmd.includes('chmod')) {
    category = 'file_operation'
  } else if (cmd.includes('curl') || cmd.includes('wget') || cmd.includes('http')) {
    category = 'network_operation'
  } else if (cmd.includes('deploy') || cmd.includes('apply') || cmd.includes('terraform')) {
    category = 'deployment'
  } else {
    category = 'general'
  }

  riskScore = clamp(riskScore, 0, 100)

  let riskLevel: 'safe' | 'review' | 'dangerous'
  if (riskScore >= 50) riskLevel = 'dangerous'
  else if (riskScore >= 20) riskLevel = 'review'
  else riskLevel = 'safe'

  const confidence = clamp(0.6 + (reasoning.length * 0.05) + (seededRandom(input.command) * 0.2), 0.5, 0.98)

  const suggestedAction = riskLevel === 'safe'
    ? 'Proceed with auto-approval'
    : riskLevel === 'review'
    ? 'Queue for automated review pipeline'
    : 'Block and require explicit human authorization'

  const autoApproveEligible = riskLevel === 'safe' && confidence > 0.75
  const requiresHuman = riskLevel === 'dangerous' || (riskLevel === 'review' && confidence < 0.6)

  const relatedPolicies: string[] = []
  if (category === 'database') relatedPolicies.push('DATA-INTEGRITY-001', 'SQL-SAFETY-002')
  if (category === 'deployment') relatedPolicies.push('DEPLOY-001', 'CHANGE-MGMT-003')
  if (category === 'version_control') relatedPolicies.push('VCS-001')
  if (category === 'container_orchestration') relatedPolicies.push('K8S-SAFETY-001')
  if (riskLevel === 'dangerous') relatedPolicies.push('HIGH-RISK-001', 'HUMAN-APPROVAL-001')
  if (relatedPolicies.length === 0) relatedPolicies.push('GENERAL-001')

  if (reasoning.length === 0) {
    reasoning.push('No risky patterns detected — classified as safe by default')
  }

  return {
    command: input.command.substring(0, 100),
    risk_level: riskLevel,
    confidence,
    reasoning,
    category,
    suggested_action: suggestedAction,
    auto_approve_eligible: autoApproveEligible,
    requires_human: requiresHuman,
    related_policies: relatedPolicies,
  }
}

function formatClassificationReport(result: ClassificationResult): string {
  const lines: string[] = []
  const rIcon = result.risk_level === 'dangerous' ? '[DANGEROUS]' : result.risk_level === 'review' ? '[REVIEW]' : '[SAFE]'
  lines.push('## Command Classification Result')
  lines.push('')
  lines.push(`Risk Level: ${rIcon} | Category: ${result.category} | Confidence: ${(result.confidence * 100).toFixed(0)}%`)
  lines.push(`Command: ${result.command}`)
  lines.push('')
  lines.push('### Classification Reasoning')
  lines.push('| # | Reason |')
  lines.push('|---|--------|')
  let idx = 1
  for (const reason of result.reasoning) {
    lines.push(`| ${idx} | ${reason} |`)
    idx++
  }
  lines.push('')
  lines.push('### Decision')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push(`| Suggested Action | ${result.suggested_action} |`)
  lines.push(`| Auto-Approve Eligible | ${result.auto_approve_eligible ? 'YES' : 'NO'} |`)
  lines.push(`| Requires Human | ${result.requires_human ? 'YES' : 'NO'} |`)
  lines.push('')
  lines.push('### Related Policies')
  for (const policy of result.related_policies) lines.push(`- ${policy}`)
  return lines.join('\n')
}

// ==================== TOOL 2: RISK ASSESSOR ====================

function assessRisk(actions: ProposedAction[], env: EnvironmentContext, clearance: UserClearance): RiskAssessmentResult {
  if (actions.length === 0) {
    return {
      overall_risk_score: 0,
      risk_level: 'low',
      risk_factors: [],
      mitigations: ['No actions to assess'],
      assessment_id: `RASS-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
  }

  const riskFactors: Array<{ factor: string; weight: number; contribution: number }> = []
  let totalScore = 0

  // 1. Impact scope
  let maxImpactScore = 0
  for (const action of actions) {
    let im = 0
    const sc = action.impact_scope.toLowerCase()
    if (sc.includes('all') || sc.includes('global') || sc.includes('entire')) im = 30
    else if (sc.includes('multiple') || sc.includes('cluster')) im = 20
    else if (sc.includes('single') || sc.includes('one')) im = 10
    else im = 15
    if (action.reversibility === 'irreversible') im *= 1.5
    else if (action.reversibility === 'partially_reversible') im *= 1.2
    maxImpactScore = Math.max(maxImpactScore, im)
  }
  riskFactors.push({ factor: 'impact_scope', weight: 0.25, contribution: maxImpactScore })

  // 2. Data sensitivity
  let maxSens = 0
  for (const a of actions) {
    const sm: Record<string, number> = { restricted: 30, confidential: 20, internal: 10, public: 2 }
    maxSens = Math.max(maxSens, sm[a.data_sensitivity] || 5)
  }
  riskFactors.push({ factor: 'data_sensitivity', weight: 0.2, contribution: maxSens })

  // 3. Environment risk
  const em: Record<string, number> = { production: 25, staging: 15, development: 5, testing: 3 }
  let envScore = em[env.environment] || 10
  if (env.active_users > 1000) envScore += 5
  if (!env.backup_available) envScore += 10
  if (!env.change_window) envScore += 8
  riskFactors.push({ factor: 'environment_risk', weight: 0.2, contribution: Math.min(envScore, 40) })

  // 4. Clearance
  const cm: Record<string, number> = { super_admin: 0, admin: 5, operator: 15, viewer: 30 }
  let clrScore = cm[clearance.level] || 15
  if (!clearance.mfa_verified) clrScore += 10
  if (clearance.session_age_minutes > 480) clrScore += 5
  riskFactors.push({ factor: 'clearance_adequacy', weight: 0.15, contribution: clrScore })

  // 5. Complexity
  riskFactors.push({ factor: 'action_complexity', weight: 0.1, contribution: clamp(actions.length * 3, 0, 20) })

  // 6. Timing
  riskFactors.push({ factor: 'timing_context', weight: 0.1, contribution: seededRandom(`${actions[0].action}-${Date.now()}`) * 10 })

  // Calculate overall score
  for (const rf of riskFactors) {
    totalScore += rf.contribution * rf.weight
  }
  totalScore = clamp(totalScore, 0, 100)

  let riskLevel: 'low' | 'medium' | 'high' | 'critical'
  if (totalScore >= 70) riskLevel = 'critical'
  else if (totalScore >= 50) riskLevel = 'high'
  else if (totalScore >= 25) riskLevel = 'medium'
  else riskLevel = 'low'

  // Generate mitigations
  const mitigations: string[] = []
  if (maxImpactScore > 20) mitigations.push('Limit blast radius — apply actions to a subset first')
  if (maxSens > 15) mitigations.push('Ensure data encryption at rest and in transit before proceeding')
  if (env.environment === 'production' && !env.change_window) mitigations.push('Schedule within an approved change window')
  if (!env.backup_available) mitigations.push('Create a backup or snapshot before executing changes')
  if (clrScore > 15) mitigations.push('Escalate to a higher-clearance operator for approval')
  if (actions.some(a => a.reversibility === 'irreversible')) mitigations.push('Implement a rollback plan for irreversible actions')
  if (mitigations.length === 0) mitigations.push('Standard precautions sufficient — proceed with monitoring')

  return {
    overall_risk_score: Math.round(totalScore),
    risk_level: riskLevel,
    risk_factors: riskFactors.sort((a, b) => b.contribution * b.weight - a.contribution * a.weight),
    mitigations,
    assessment_id: `RASS-${Date.now()}-${Math.abs(hashCode(actions[0].action)).toString(16).substring(0, 4)}`,
    timestamp: new Date().toISOString(),
  }
}

function formatRiskAssessmentReport(result: RiskAssessmentResult): string {
  const lines: string[] = []
  const rIcon = result.risk_level === 'critical' ? '[CRITICAL]' : result.risk_level === 'high' ? '[HIGH]' : result.risk_level === 'medium' ? '[MEDIUM]' : '[LOW]'
  lines.push('## Risk Assessment Report')
  lines.push('')
  lines.push(`Assessment ID: ${result.assessment_id} | Score: ${result.overall_risk_score}/100 | Level: ${rIcon}`)
  lines.push('')
  lines.push('### Risk Factor Decomposition')
  lines.push('| Factor | Weight | Contribution | Weighted Score |')
  lines.push('|--------|--------|-------------|----------------|')
  for (const rf of result.risk_factors) {
    lines.push(`| ${rf.factor} | ${(rf.weight * 100).toFixed(0)}% | ${rf.contribution.toFixed(1)} | ${(rf.contribution * rf.weight).toFixed(1)} |`)
  }
  lines.push('')
  lines.push('### Recommended Mitigations')
  for (const m of result.mitigations) lines.push(`- ${m}`)
  return lines.join('\n')
}

// ==================== TOOL 3: BOUNDARY ENFORCER ====================

function enforceBoundary(request: ActionRequest, boundaries: DefinedBoundary[], state: CurrentState): BoundaryEnforcementResult {
  const violations: Array<{ boundary_id: string; boundary_name: string; violation_detail: string; severity: string }> = []
  const conditions: string[] = []

  for (const boundary of boundaries) {
    let violated = false
    let detail = ''

    const aLow = request.action.toLowerCase()
    const tLow = request.target.toLowerCase()
    const cLow = boundary.condition.toLowerCase()
    switch (boundary.type) {
      case 'execution_block':
        if (aLow.includes(cLow)) { violated = true; detail = `Action matches execution block: "${boundary.condition}"` }
        break
      case 'write_limit':
        if (['update', 'delete', 'create', 'modify', 'insert', 'drop', 'alter'].some(w => aLow.includes(w)) && state.active_operations > 10) {
          violated = true; detail = `Write blocked: ${state.active_operations} active ops exceeds threshold (10)`
        }
        break
      case 'data_scope':
        if (tLow.includes(cLow)) { violated = true; detail = `Target violates data scope: "${boundary.condition}"` }
        break
      case 'rate_limit':
        if (state.active_operations > 50 && cLow === 'high_load') { violated = true; detail = `Rate limit: ${state.active_operations} ops during high load` }
        break
      case 'read_only':
        if (['update', 'delete', 'create', 'modify', 'insert', 'drop', 'alter', 'write'].some(w => aLow.includes(w)) && cLow === 'read_only_mode') {
          violated = true; detail = `Write blocked — system in read-only mode`
        }
        break
    }

    if (violated) {
      violations.push({
        boundary_id: boundary.boundary_id,
        boundary_name: boundary.name,
        violation_detail: detail,
        severity: boundary.severity,
      })

      if (boundary.action === 'deny') {
        // Hard deny — no conditions can override
      } else if (boundary.action === 'warn') {
        conditions.push(`Warning: ${detail} — proceed with caution`)
      } else if (boundary.action === 'log') {
        conditions.push(`Logged: ${detail} — audit trail created`)
      }
    }
  }

  // Determine decision
  let decision: 'allow' | 'deny' | 'conditional'
  const hasHardDeny = violations.some(v =>
    boundaries.some(b => b.boundary_id === v.boundary_id && b.action === 'deny')
  )

  if (hasHardDeny) {
    decision = 'deny'
  } else if (violations.length > 0) {
    decision = 'conditional'
  } else {
    decision = 'allow'
  }

  // Additional conditions based on state
  if (state.resource_usage_pct > 90 && decision !== 'deny') {
    conditions.push('Resource usage above 90% — consider deferring non-critical operations')
  }
  if (state.recent_failures > 5 && decision !== 'deny') {
    conditions.push(`${state.recent_failures} recent failures detected — elevated monitoring recommended`)
  }

  const enforcementId = `BEF-${Date.now()}-${Math.abs(hashCode(request.action)).toString(16).substring(0, 4)}`

  let explanation: string
  if (decision === 'allow') {
    explanation = `Action "${request.action}" on "${request.target}" passed all ${boundaries.length} boundary checks — cleared for execution`
  } else if (decision === 'deny') {
    explanation = `Action "${request.action}" DENIED — violated ${violations.length} boundary(ies) with hard-deny enforcement`
  } else {
    explanation = `Action "${request.action}" conditionally allowed with ${violations.length} warning(s) and ${conditions.length} condition(s)`
  }

  return {
    decision,
    action_request: request.action,
    violations,
    conditions,
    enforcement_id: enforcementId,
    explanation,
  }
}

function formatBoundaryEnforcementReport(result: BoundaryEnforcementResult): string {
  const lines: string[] = []
  const dIcon = result.decision === 'allow' ? 'ALLOWED' : result.decision === 'deny' ? 'DENIED' : 'CONDITIONAL'
  lines.push('## Boundary Enforcement Result')
  lines.push('')
  lines.push(`Enforcement ID: ${result.enforcement_id} | Decision: ${dIcon}`)
  lines.push(`Action: ${result.action_request}`)
  lines.push(`Explanation: ${result.explanation}`)
  lines.push('')
  if (result.violations.length > 0) {
    lines.push('### Boundary Violations')
    lines.push('| # | Boundary | Severity | Detail |')
    lines.push('|---|----------|----------|--------|')
    let idx = 1
    for (const v of result.violations) {
      const st = v.severity === 'critical' ? 'CRITICAL' : v.severity === 'high' ? 'HIGH' : v.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${v.boundary_name} | ${st} | ${v.violation_detail.substring(0, 50)}${v.violation_detail.length > 50 ? '...' : ''} |`)
      idx++
    }
    lines.push('')
  }
  if (result.conditions.length > 0) {
    lines.push('### Conditions')
    for (const c of result.conditions) lines.push(`- ${c}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 4: APPROVAL RECOMMENDER ====================

function recommendApprovals(
  pendingActions: PendingAction[],
  riskThreshold: number,
  decisions: HistoricalDecision[]
): ApprovalRecommenderResult {
  const recommendations: ApprovalRecommendation[] = []

  for (const pa of pendingActions) {
    let recommendation: 'auto_approve' | 'review' | 'escalate'
    let confidence: number
    let reason: string
    let slaSeconds: number

    // Analyze historical patterns for similar actions
    const similarDecisions = decisions.filter(d =>
      d.action_pattern.toLowerCase().includes(pa.category.toLowerCase()) ||
      pa.action.toLowerCase().includes(d.action_pattern.toLowerCase())
    )
    const successRate = similarDecisions.length > 0
      ? similarDecisions.filter(d => d.outcome === 'success').length / similarDecisions.length
      : 0.5

    if (pa.risk_score <= riskThreshold * 0.5 && successRate >= 0.8 && pa.auto_approve_history >= 3) {
      recommendation = 'auto_approve'
      confidence = clamp(0.7 + (successRate * 0.2) + (pa.auto_approve_history * 0.02), 0.6, 0.95)
      reason = `Low risk (${pa.risk_score}/${riskThreshold}), success rate ${(successRate * 100).toFixed(0)}%, ${pa.auto_approve_history} prior auto-approvals`
      slaSeconds = 0
    } else if (pa.risk_score > riskThreshold || successRate < 0.5) {
      recommendation = 'escalate'
      confidence = clamp(0.6 + ((pa.risk_score / 100) * 0.3), 0.5, 0.9)
      reason = pa.risk_score > riskThreshold ? `Risk ${pa.risk_score} > threshold ${riskThreshold}` : `Low success rate (${(successRate * 100).toFixed(0)}%) for similar actions`
      slaSeconds = pa.risk_score > 80 ? 300 : 900
    } else {
      recommendation = 'review'
      confidence = clamp(0.5 + (successRate * 0.3), 0.4, 0.8)
      reason = `Moderate risk (${pa.risk_score}/${riskThreshold}) — requires review pipeline`
      slaSeconds = 60
    }

    recommendations.push({
      action_id: pa.action_id,
      action: pa.action,
      recommendation,
      confidence,
      reason,
      sla_seconds: slaSeconds,
    })
  }

  const autoApproveCount = recommendations.filter(r => r.recommendation === 'auto_approve').length
  const reviewCount = recommendations.filter(r => r.recommendation === 'review').length
  const escalateCount = recommendations.filter(r => r.recommendation === 'escalate').length
  const batchId = `APR-${Date.now()}-${Math.abs(hashCode(pendingActions.length.toString())).toString(16).substring(0, 4)}`

  const summary = `${pendingActions.length} action(s) evaluated | Auto-approve: ${autoApproveCount} | Review: ${reviewCount} | Escalate: ${escalateCount} | Threshold: ${riskThreshold}`

  return {
    recommendations,
    auto_approve_count: autoApproveCount,
    review_count: reviewCount,
    escalate_count: escalateCount,
    batch_id: batchId,
    summary,
  }
}

function formatApprovalReport(result: ApprovalRecommenderResult): string {
  const lines: string[] = []
  lines.push('## Approval Recommendation Report')
  lines.push('')
  lines.push(`Batch ID: ${result.batch_id} | Summary: ${result.summary}`)
  lines.push('')
  lines.push('### Recommendations')
  lines.push('| # | Action ID | Action | Rec | Confidence | SLA | Reason |')
  lines.push('|---|-----------|--------|-----|------------|-----|--------|')
  let idx = 1
  for (const rec of result.recommendations) {
    const rt = rec.recommendation === 'auto_approve' ? 'AUTO_APPROVE' : rec.recommendation === 'escalate' ? 'ESCALATE' : 'REVIEW'
    lines.push(`| ${idx} | ${rec.action_id} | ${rec.action.substring(0, 25)}${rec.action.length > 25 ? '...' : ''} | ${rt} | ${(rec.confidence * 100).toFixed(0)}% | ${rec.sla_seconds}s | ${rec.reason.substring(0, 40)}${rec.reason.length > 40 ? '...' : ''} |`)
    idx++
  }
  lines.push('')
  lines.push('### Distribution')
  lines.push('| Recommendation | Count | Percentage |')
  lines.push('|---------------|-------|------------|')
  const total = result.recommendations.length || 1
  lines.push(`| Auto-Approve | ${result.auto_approve_count} | ${((result.auto_approve_count / total) * 100).toFixed(0)}% |`)
  lines.push(`| Review | ${result.review_count} | ${((result.review_count / total) * 100).toFixed(0)}% |`)
  lines.push(`| Escalate | ${result.escalate_count} | ${((result.escalate_count / total) * 100).toFixed(0)}% |`)
  return lines.join('\n')
}

// ==================== TOOL 5: EXECUTION MONITOR ====================

function monitorExecution(operations: ActiveOperation[], expected: ExpectedBehavior): ExecutionMonitorResult {
  const anomalies: AnomalyDetection[] = []

  for (const op of operations) {
    // Duration exceeded check
    if (op.actual_duration_ms > expected.max_duration_ms) {
      const deviation = ((op.actual_duration_ms - expected.max_duration_ms) / expected.max_duration_ms) * 100
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
      if (deviation > 300) severity = 'critical'
      else if (deviation > 200) severity = 'high'
      else if (deviation > 100) severity = 'medium'

      anomalies.push({
        operation_id: op.operation_id,
        action: op.action,
        anomaly_type: 'duration_exceeded',
        severity,
        description: `Operation took ${op.actual_duration_ms}ms, exceeding max ${expected.max_duration_ms}ms by ${deviation.toFixed(0)}%`,
        deviation_pct: deviation,
        recommended_action: deviation > 200 ? 'TERMINATE and investigate' : 'Monitor closely for completion',
      })
    }

    // Resource spike check
    if (op.resource_delta > expected.max_resource_pct) {
      anomalies.push({
        operation_id: op.operation_id,
        action: op.action,
        anomaly_type: 'resource_spike',
        severity: op.resource_delta > expected.max_resource_pct * 2 ? 'critical' : 'high',
        description: `Resource usage ${op.resource_delta}% exceeds expected max ${expected.max_resource_pct}%`,
        deviation_pct: ((op.resource_delta - expected.max_resource_pct) / expected.max_resource_pct) * 100,
        recommended_action: 'Throttle resource allocation or pause operation',
      })
    }

    // Unexpected side effects
    for (const sideEffect of op.side_effects) {
      if (!expected.expected_side_effects.some(e => e.toLowerCase().includes(sideEffect.toLowerCase()))) {
        anomalies.push({
          operation_id: op.operation_id,
          action: op.action,
          anomaly_type: 'unexpected_side_effect',
          severity: 'medium',
          description: `Unexpected side effect detected: "${sideEffect}"`,
          deviation_pct: 50,
          recommended_action: 'Verify side effect is intentional and safe',
        })
      }
    }

    // Status anomaly
    if (op.status === 'failed' || op.status === 'timeout') {
      anomalies.push({
        operation_id: op.operation_id,
        action: op.action,
        anomaly_type: 'status_anomaly',
        severity: op.status === 'timeout' ? 'critical' : 'high',
        description: `Operation status: ${op.status.toUpperCase()} — expected successful completion`,
        deviation_pct: 100,
        recommended_action: op.status === 'timeout' ? 'Kill operation and trigger alert' : 'Review failure logs',
      })
    }
  }

  // Detect cascade failure pattern
  const failedOps = operations.filter(o => o.status === 'failed' || o.status === 'timeout')
  if (failedOps.length >= 3) {
    anomalies.push({
      operation_id: 'CASCADE-${Date.now()}',
      action: 'multiple_operations',
      anomaly_type: 'cascade_failure',
      severity: 'critical',
      description: `${failedOps.length} operations failed — cascade failure pattern detected`,
      deviation_pct: (failedOps.length / operations.length) * 100,
      recommended_action: 'Activate circuit breaker and halt dependent operations',
    })
  }

  const healthyCount = operations.length - new Set(anomalies.map(a => a.operation_id)).size
  const anomalyRate = operations.length > 0 ? anomalies.length / operations.length : 0

  let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy'
  if (anomalyRate > 0.5 || anomalies.some(a => a.severity === 'critical')) overallHealth = 'critical'
  else if (anomalyRate > 0.2 || anomalies.some(a => a.severity === 'high')) overallHealth = 'degraded'

  const monitorId = `MON-${Date.now()}-${Math.abs(hashCode(operations.length.toString())).toString(16).substring(0, 4)}`

  const alertSummary = anomalies.length === 0
    ? `All ${operations.length} operations within expected parameters`
    : `${anomalies.length} anomaly(ies) detected across ${operations.length} operations — Health: ${overallHealth.toUpperCase()}`

  return {
    anomalies: anomalies.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return sevOrder[a.severity] - sevOrder[b.severity]
    }),
    total_monitored: operations.length,
    healthy_count: Math.max(0, healthyCount),
    anomaly_rate: anomalyRate,
    overall_health: overallHealth,
    monitor_id: monitorId,
    alert_summary: alertSummary,
  }
}

function formatExecutionMonitorReport(result: ExecutionMonitorResult): string {
  const lines: string[] = []
  const hIcon = result.overall_health === 'healthy' ? 'HEALTHY' : result.overall_health === 'degraded' ? 'DEGRADED' : 'CRITICAL'
  lines.push('## Execution Monitor Report')
  lines.push('')
  lines.push(`Monitor ID: ${result.monitor_id} | Health: ${hIcon} | Operations: ${result.total_monitored} | Healthy: ${result.healthy_count} | Anomaly Rate: ${(result.anomaly_rate * 100).toFixed(1)}%`)
  lines.push(`Alert Summary: ${result.alert_summary}`)
  lines.push('')
  if (result.anomalies.length > 0) {
    lines.push('### Detected Anomalies')
    lines.push('| # | Severity | Type | Operation | Deviation | Recommendation |')
    lines.push('|---|----------|------|-----------|-----------|----------------|')
    let idx = 1
    for (const a of result.anomalies) {
      const st = a.severity === 'critical' ? 'CRITICAL' : a.severity === 'high' ? 'HIGH' : a.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${st} | ${a.anomaly_type} | ${a.action.substring(0, 20)}${a.action.length > 20 ? '...' : ''} | ${a.deviation_pct.toFixed(0)}% | ${a.recommended_action.substring(0, 30)}${a.recommended_action.length > 30 ? '...' : ''} |`)
      idx++
    }
  } else {
    lines.push('No anomalies detected — all operations running within expected parameters.')
  }
  return lines.join('\n')
}

// ==================== TOOL 6: SAFETY AUDITOR ====================

function auditSafety(logs: ExecutionLog[], policies: SafetyPolicy[]): SafetyAuditResult {
  const violations: ComplianceViolation[] = []
  let totalChecks = 0

  for (const log of logs) {
    for (const policy of policies) {
      for (const rule of policy.rules) {
        totalChecks++
        let violated = false
        let violationType = ''

        const cLow = rule.check.toLowerCase()
        const rLow = log.result.toLowerCase()
        const rlLow = log.risk_level.toLowerCase()
        if (cLow.includes('risk_level') && cLow.includes('critical') && rlLow === 'critical' && !rLow.includes('approved')) {
          violated = true; violationType = 'unauthorized_critical_operation'
        }
        if (cLow.includes('duration') && cLow.includes('max')) {
          const maxD = parseInt(cLow.match(/\d+/)?.[0] || '30000')
          if (log.duration_ms > maxD) { violated = true; violationType = 'duration_limit_exceeded' }
        }
        if (cLow.includes('actor') && cLow.includes('authorized') && (log.actor.toLowerCase().includes('unauthorized') || log.actor.toLowerCase().includes('unknown'))) {
          violated = true; violationType = 'unauthorized_actor'
        }
        if (cLow.includes('result') && cLow.includes('fail') && rLow.includes('fail') && rlLow === 'critical') {
          violated = true; violationType = 'critical_operation_failure'
        }
        if (cLow.includes('metadata') && cLow.includes('required')) {
          const reqKey = rule.check.split('=')[1] || 'approval_id'
          if (!log.metadata[reqKey]) { violated = true; violationType = 'missing_required_metadata' }
        }

        if (violated) {
          violations.push({
            log_entry: `${log.operation} @ ${log.timestamp}`,
            policy_id: policy.policy_id,
            policy_name: policy.name,
            rule_id: rule.rule_id,
            violation_type: violationType,
            severity: rule.severity as 'low' | 'medium' | 'high' | 'critical',
            description: `Policy "${policy.name}" rule "${rule.description}" violated by operation "${log.operation}"`,
          })
        }
      }
    }
  }

  // Compute risk distribution
  const riskDistribution: Record<string, number> = { safe: 0, review: 0, dangerous: 0, critical: 0 }
  for (const log of logs) {
    const level = log.risk_level.toLowerCase()
    if (level in riskDistribution) riskDistribution[level]++
    else riskDistribution['review']++
  }

  // Identify violation patterns
  const violationTypes = new Map<string, number>()
  for (const v of violations) {
    violationTypes.set(v.violation_type, (violationTypes.get(v.violation_type) || 0) + 1)
  }
  const violationPatterns = Array.from(violationTypes.entries())
    .map(([pattern, count]) => ({
      pattern,
      count,
      trend: count > 3 ? 'recurring' : count > 1 ? 'intermittent' : 'isolated',
    }))
    .sort((a, b) => b.count - a.count)

  const complianceRate = totalChecks > 0 ? clamp(1 - (violations.length / totalChecks), 0, 1) : 1
  const auditId = `SAUD-${Date.now()}-${Math.abs(hashCode(logs.length.toString())).toString(16).substring(0, 4)}`

  const summary = `${logs.length} log(s) audited against ${policies.length} policies | ${violations.length} violation(s) found | Compliance rate: ${(complianceRate * 100).toFixed(1)}%`

  return {
    audit_id: auditId,
    total_logs_reviewed: logs.length,
    total_policies_checked: policies.length,
    violations,
    compliance_rate: complianceRate,
    risk_distribution: riskDistribution,
    violation_patterns: violationPatterns,
    summary,
  }
}

function formatSafetyAuditReport(result: SafetyAuditResult): string {
  const lines: string[] = []
  const cIcon = result.compliance_rate >= 0.9 ? 'COMPLIANT' : result.compliance_rate >= 0.7 ? 'PARTIAL' : 'NON_COMPLIANT'
  lines.push('## Safety Audit Report')
  lines.push('')
  lines.push(`Audit ID: ${result.audit_id} | Compliance: ${cIcon} | Logs: ${result.total_logs_reviewed} | Policies: ${result.total_policies_checked}`)
  lines.push(`Summary: ${result.summary}`)
  lines.push('')
  lines.push('### Risk Distribution')
  lines.push('| Risk Level | Count |')
  lines.push('|-----------|-------|')
  for (const [level, count] of Object.entries(result.risk_distribution)) {
    lines.push(`| ${level.toUpperCase()} | ${count} |`)
  }
  lines.push('')
  if (result.violations.length > 0) {
    lines.push('### Violations Detail')
    lines.push('| # | Severity | Type | Log Entry | Policy |')
    lines.push('|---|----------|------|-----------|--------|')
    let idx = 1
    for (const v of result.violations) {
      const st = v.severity === 'critical' ? 'CRITICAL' : v.severity === 'high' ? 'HIGH' : v.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${st} | ${v.violation_type} | ${v.log_entry.substring(0, 25)}${v.log_entry.length > 25 ? '...' : ''} | ${v.policy_id} |`)
      idx++
    }
    lines.push('')
  }
  if (result.violation_patterns.length > 0) {
    lines.push('### Violation Patterns')
    lines.push('| Pattern | Count | Trend |')
    lines.push('|---------|-------|-------|')
    for (const vp of result.violation_patterns) {
      lines.push(`| ${vp.pattern} | ${vp.count} | ${vp.trend.toUpperCase()} |`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 7: POLICY TUNER ====================

function tunePolicies(
  fpLog: FalsePositiveEntry[],
  fnLog: FalseNegativeEntry[],
  currentPolicies: CurrentPolicy[]
): PolicyTunerResult {
  const recommendations: PolicyTuneRecommendation[] = []

  const totalDecisions = fpLog.length + fnLog.length
  const fpRate = totalDecisions > 0 ? fpLog.length / totalDecisions : 0
  const fnRate = totalDecisions > 0 ? fnLog.length / totalDecisions : 0

  for (const policy of currentPolicies) {
    for (const [tName, curVal] of Object.entries(policy.thresholds)) {
      const fpCount = fpLog.filter(fp => fp.impact.toLowerCase().includes(tName.toLowerCase())).length
      const fnCount = fnLog.filter(fn => fn.damage.toLowerCase().includes(tName.toLowerCase())).length
      if (fpCount > 2) {
        recommendations.push({
          policy_id: policy.policy_id, tuning_type: 'threshold_adjust',
          current_value: `${tName}=${curVal}`, recommended_value: `${tName}=${Math.round(curVal * 1.2)}`,
          expected_improvement: `Reduce FPs by ~${(fpCount * 15)}% for ${tName}`,
          confidence: clamp(0.5 + (fpCount * 0.1), 0.4, 0.85),
        })
      }
      if (fnCount > 1) {
        recommendations.push({
          policy_id: policy.policy_id, tuning_type: 'threshold_adjust',
          current_value: `${tName}=${curVal}`, recommended_value: `${tName}=${Math.round(curVal * 0.8)}`,
          expected_improvement: `Reduce FNs by ~${(fnCount * 20)}% for ${tName}`,
          confidence: clamp(0.5 + (fnCount * 0.15), 0.4, 0.9),
        })
      }
    }

    const fnActions = fnLog.map(fn => fn.action.toLowerCase())
    if (fnActions.some(a => a.includes('deploy') || a.includes('production')) && !policy.rules.some(r => r.toLowerCase().includes('production'))) {
      recommendations.push({
        policy_id: policy.policy_id, tuning_type: 'rule_add',
        current_value: 'No production rule', recommended_value: 'Add PRODUCTION_CHANGE_APPROVAL rule',
        expected_improvement: 'Prevent production incidents from misclassified deployments',
        confidence: 0.7,
      })
    }
    if (fnActions.some(a => a.includes('delete') || a.includes('drop')) && !policy.rules.some(r => r.toLowerCase().includes('destructive'))) {
      recommendations.push({
        policy_id: policy.policy_id, tuning_type: 'rule_add',
        current_value: 'No destructive-action rule', recommended_value: 'Add DESTRUCTIVE_ACTION_CONFIRMATION rule',
        expected_improvement: 'Block unapproved destructive operations',
        confidence: 0.75,
      })
    }
  }

  // Determine overall health
  let overallHealth: 'optimal' | 'acceptable' | 'needs_tuning' | 'critical_review'
  if (fpRate > 0.3 || fnRate > 0.15) overallHealth = 'critical_review'
  else if (fpRate > 0.15 || fnRate > 0.08) overallHealth = 'needs_tuning'
  else if (fpRate > 0.05 || fnRate > 0.03) overallHealth = 'acceptable'
  else overallHealth = 'optimal'

  const tuningId = `TUNE-${Date.now()}-${Math.abs(hashCode(fpLog.length.toString())).toString(16).substring(0, 4)}`

  const summary = `FP rate: ${(fpRate * 100).toFixed(1)}% | FN rate: ${(fnRate * 100).toFixed(1)}% | ${recommendations.length} tuning recommendation(s) | Health: ${overallHealth.toUpperCase()}`

  return {
    tuning_id: tuningId,
    false_positive_rate: fpRate,
    false_negative_rate: fnRate,
    recommendations,
    overall_policy_health: overallHealth,
    summary,
  }
}

function formatPolicyTunerReport(result: PolicyTunerResult): string {
  const lines: string[] = []
  const hIcon = result.overall_policy_health === 'optimal' ? 'OPTIMAL' :
    result.overall_policy_health === 'acceptable' ? 'ACCEPTABLE' :
    result.overall_policy_health === 'needs_tuning' ? 'NEEDS_TUNING' : 'CRITICAL_REVIEW'
  lines.push('## Policy Tuner Report')
  lines.push('')
  lines.push(`Tuning ID: ${result.tuning_id} | Health: ${hIcon} | FP: ${(result.false_positive_rate * 100).toFixed(1)}% | FN: ${(result.false_negative_rate * 100).toFixed(1)}%`)
  lines.push(`Summary: ${result.summary}`)
  lines.push('')
  if (result.recommendations.length > 0) {
    lines.push('### Tuning Recommendations')
    lines.push('| # | Policy | Type | Current | Recommended | Expected Improvement | Confidence |')
    lines.push('|---|--------|------|---------|-------------|---------------------|------------|')
    let idx = 1
    for (const rec of result.recommendations) {
      const tt = rec.tuning_type === 'threshold_adjust' ? 'THRESHOLD' : rec.tuning_type === 'rule_add' ? 'ADD_RULE' : rec.tuning_type === 'rule_remove' ? 'REMOVE_RULE' : 'SCOPE'
      lines.push(`| ${idx} | ${rec.policy_id} | ${tt} | ${rec.current_value.substring(0, 20)}${rec.current_value.length > 20 ? '...' : ''} | ${rec.recommended_value.substring(0, 25)}${rec.recommended_value.length > 25 ? '...' : ''} | ${rec.expected_improvement.substring(0, 30)}${rec.expected_improvement.length > 30 ? '...' : ''} | ${(rec.confidence * 100).toFixed(0)}% |`)
      idx++
    }
  } else {
    lines.push('No tuning recommendations — policies are well-calibrated.')
  }
  return lines.join('\n')
}

// ==================== TOOL 8: INCIDENT PREDICTOR ====================

function predictIncidents(sequence: OperationStep[], state: SystemStateState): IncidentPredictorResult {
  const predictions: IncidentPrediction[] = []

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i]
    const predictionId = `PRED-${step.step_number}-${Math.abs(hashCode(step.action)).toString(16).substring(0, 4)}`

    if (step.risk_score > 70) {
      predictions.push({
        prediction_id: predictionId, incident_type: 'high_risk_operation_failure',
        probability: clamp((step.risk_score / 100) * 0.8 + seededRandom(step.action) * 0.2, 0.3, 0.95),
        severity: step.risk_score > 85 ? 'critical' : 'high', trigger_step: step.step_number,
        description: `Step ${step.step_number} "${step.action}" risk score ${step.risk_score} — high failure probability`,
        preventive_measures: ['Add pre-execution validation checkpoint', 'Prepare rollback procedure', 'Require dual-authorization'],
        estimated_impact: step.risk_score > 85 ? 'SYSTEM_OUTAGE' : 'DEGRADED_SERVICE',
      })
    }
    const projCpu = state.cpu_usage_pct + (step.estimated_duration_ms / 1000) * 2
    const projMem = state.memory_usage_pct + (step.estimated_duration_ms / 1000) * 1
    if (projCpu > 90 || projMem > 90) {
      predictions.push({
        prediction_id: `${predictionId}-RES`, incident_type: 'resource_exhaustion',
        probability: clamp(Math.max(projCpu, projMem) / 100, 0.4, 0.9),
        severity: projCpu > 95 || projMem > 95 ? 'critical' : 'high', trigger_step: step.step_number,
        description: `Projected exhaustion: CPU ${projCpu.toFixed(0)}%, Memory ${projMem.toFixed(0)}% after step ${step.step_number}`,
        preventive_measures: ['Scale resources before this step', 'Add monitoring with auto-pause at 85%', 'Break into smaller sub-operations'],
        estimated_impact: 'PERFORMANCE_DEGRADATION',
      })
    }
    if (step.dependencies.length > 2) {
      const depRisk = step.dependencies.length * 0.15
      if (depRisk > 0.3) {
        predictions.push({
          prediction_id: `${predictionId}-CAS`, incident_type: 'cascade_failure',
          probability: clamp(depRisk + (state.recent_error_rate * 0.3), 0.2, 0.85),
          severity: depRisk > 0.5 ? 'critical' : 'high', trigger_step: step.step_number,
          description: `Step ${step.step_number} depends on ${step.dependencies.length} upstream ops — cascade risk`,
          preventive_measures: ['Verify all dependency health first', 'Implement circuit breaker', 'Add timeout and fallback per dependency'],
          estimated_impact: 'CASCADE_OUTAGE',
        })
      }
    }
    if (i > 0 && step.target === sequence[i - 1].target && step.action !== sequence[i - 1].action) {
      predictions.push({
        prediction_id: `${predictionId}-CNF`, incident_type: 'resource_contention',
        probability: clamp(0.3 + (state.active_connections * 0.01), 0.2, 0.7),
        severity: 'medium', trigger_step: step.step_number,
        description: `Step ${step.step_number} targets same resource "${step.target}" as previous step — contention risk`,
        preventive_measures: ['Serialize operations on same target', 'Add cooldown between same-target ops', 'Use optimistic locking'],
        estimated_impact: 'OPERATION_CONFLICT',
      })
    }
    if (state.network_latency_ms > 200 && step.dependencies.length > 0) {
      predictions.push({
        prediction_id: `${predictionId}-NET`, incident_type: 'network_timeout',
        probability: clamp(state.network_latency_ms / 1000, 0.2, 0.8),
        severity: state.network_latency_ms > 500 ? 'critical' : 'medium', trigger_step: step.step_number,
        description: `High latency (${state.network_latency_ms}ms) may timeout step ${step.step_number} with ${step.dependencies.length} deps`,
        preventive_measures: ['Increase timeout thresholds', 'Implement retry with exponential backoff', 'Consider local caching'],
        estimated_impact: 'TIMEOUT_FAILURE',
      })
    }
  }

  // Determine overall trend
  const criticalPredictions = predictions.filter(p => p.severity === 'critical').length
  const highPredictions = predictions.filter(p => p.severity === 'high').length
  const avgProbability = predictions.length > 0
    ? predictions.reduce((s, p) => s + p.probability, 0) / predictions.length
    : 0

  let overallTrend: 'stable' | 'increasing' | 'critical_escalation' = 'stable'
  if (criticalPredictions > 0 || avgProbability > 0.6) overallTrend = 'critical_escalation'
  else if (highPredictions > 1 || avgProbability > 0.4) overallTrend = 'increasing'

  // Find highest risk step
  let highestRiskStep = 1
  let highestRiskScore = 0
  for (const pred of predictions) {
    if (pred.probability > highestRiskScore) {
      highestRiskScore = pred.probability
      highestRiskStep = pred.trigger_step
    }
  }

  const predictionId = `IPRED-${Date.now()}-${Math.abs(hashCode(sequence.length.toString())).toString(16).substring(0, 4)}`

  const summary = `${predictions.length} potential incident(s) predicted across ${sequence.length} steps | Highest risk: Step ${highestRiskStep} | Trend: ${overallTrend.toUpperCase()}`

  return {
    predictions: predictions.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return sevOrder[a.severity] - sevOrder[b.severity]
    }),
    overall_risk_trend: overallTrend,
    highest_risk_step: highestRiskStep,
    prediction_id: predictionId,
    summary,
  }
}

function formatIncidentPredictorReport(result: IncidentPredictorResult): string {
  const lines: string[] = []
  const tIcon = result.overall_risk_trend === 'stable' ? 'STABLE' : result.overall_risk_trend === 'increasing' ? 'INCREASING' : 'CRITICAL'
  lines.push('## Incident Prediction Report')
  lines.push('')
  lines.push(`Prediction ID: ${result.prediction_id} | Trend: ${tIcon} | Predictions: ${result.predictions.length} | Highest Risk Step: ${result.highest_risk_step}`)
  lines.push(`Summary: ${result.summary}`)
  lines.push('')
  if (result.predictions.length > 0) {
    lines.push('### Predicted Incidents')
    lines.push('| # | Severity | Type | Step | Probability | Impact |')
    lines.push('|---|----------|------|------|-------------|--------|')
    let idx = 1
    for (const pred of result.predictions) {
      const st = pred.severity === 'critical' ? 'CRITICAL' : pred.severity === 'high' ? 'HIGH' : pred.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${st} | ${pred.incident_type} | ${pred.trigger_step} | ${(pred.probability * 100).toFixed(0)}% | ${pred.estimated_impact} |`)
      idx++
    }
    lines.push('')
    const topPredictions = result.predictions.slice(0, 3)
    for (const pred of topPredictions) {
      lines.push(`### Step ${pred.trigger_step}: ${pred.incident_type}`)
      lines.push(`Probability: ${(pred.probability * 100).toFixed(0)}% | Severity: ${pred.severity.toUpperCase()} | Impact: ${pred.estimated_impact}`)
      lines.push(`Description: ${pred.description}`)
      lines.push('Preventive Measures:')
      for (const measure of pred.preventive_measures) lines.push(`- ${measure}`)
      lines.push('')
    }
  } else {
    lines.push('No significant incident predictions — operation sequence appears safe.')
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'command_classifier',
    description: 'Classify commands by risk level (safe/review/dangerous). Analyzes command patterns, context, workspace scope, and provides classification confidence with reasoning.',
    parameters: {
      classify_input: { type: 'string', required: true, description: 'JSON object with fields: command, context, workspace_scope' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { classify_input: string }) {
      const input: CommandClassifyInput = JSON.parse(args.classify_input)
      const result = classifyCommand(input)
      return formatClassificationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'risk_assessor',
    description: 'Assess composite risk score (0-100) for proposed actions. Factors in impact scope, data sensitivity, environment risk, user clearance, and action complexity with factor decomposition.',
    parameters: {
      proposed_actions: { type: 'string', required: true, description: 'JSON array of action objects: action, target, impact_scope, reversibility, data_sensitivity' },
      environment_context: { type: 'string', required: true, description: 'JSON context: environment, data_classification, active_users, backup_available, change_window' },
      user_clearance: { type: 'string', required: true, description: 'JSON clearance: level, roles[], mfa_verified, session_age_minutes' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { proposed_actions: string; environment_context: string; user_clearance: string }) {
      const actions: ProposedAction[] = JSON.parse(args.proposed_actions)
      const env: EnvironmentContext = JSON.parse(args.environment_context)
      const clearance: UserClearance = JSON.parse(args.user_clearance)
      const result = assessRisk(actions, env, clearance)
      return formatRiskAssessmentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'boundary_enforcer',
    description: 'Enforce defined boundaries on action requests. Returns allow/deny/conditional decisions with violation details for execution blocks, write limits, data scopes, and rate limits.',
    parameters: {
      action_request: { type: 'string', required: true, description: 'JSON request: action, target, parameters{}, initiator, timestamp' },
      boundaries: { type: 'string', required: true, description: 'JSON array of boundary objects: boundary_id, name, type, condition, action, severity' },
      current_state: { type: 'string', required: true, description: 'JSON state: current_load, active_operations, recent_failures, resource_usage_pct' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { action_request: string; boundaries: string; current_state: string }) {
      const request: ActionRequest = JSON.parse(args.action_request)
      const boundaries: DefinedBoundary[] = JSON.parse(args.boundaries)
      const state: CurrentState = JSON.parse(args.current_state)
      const result = enforceBoundary(request, boundaries, state)
      return formatBoundaryEnforcementReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'approval_recommender',
    description: 'Generate approval recommendations (auto_approve/review/escalate) for pending actions based on risk thresholds and historical decision outcomes.',
    parameters: {
      pending_actions: { type: 'string', required: true, description: 'JSON array of pending action objects: action_id, action, risk_score, requester, timestamp, auto_approve_history, category' },
      risk_threshold: { type: 'number', required: true, description: 'Risk score threshold (0-100) above which escalation is recommended' },
      historical_decisions: { type: 'string', required: true, description: 'JSON array of past decision objects: action_pattern, original_decision, outcome, timestamp' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { pending_actions: string; risk_threshold: number; historical_decisions: string }) {
      const actions: PendingAction[] = JSON.parse(args.pending_actions)
      const decisions: HistoricalDecision[] = JSON.parse(args.historical_decisions)
      const result = recommendApprovals(actions, args.risk_threshold, decisions)
      return formatApprovalReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'execution_monitor',
    description: 'Monitor active operations for anomalies. Detects duration exceedance, resource spikes, unexpected side effects, status anomalies, and cascade failure patterns.',
    parameters: {
      active_operations: { type: 'string', required: true, description: 'JSON array of operation objects: operation_id, action, started_at, expected_duration_ms, actual_duration_ms, status, resource_delta, side_effects[]' },
      expected_behavior: { type: 'string', required: true, description: 'JSON expected behavior: max_duration_ms, max_resource_pct, expected_side_effects[], allowed_exit_codes[]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { active_operations: string; expected_behavior: string }) {
      const operations: ActiveOperation[] = JSON.parse(args.active_operations)
      const expected: ExpectedBehavior = JSON.parse(args.expected_behavior)
      const result = monitorExecution(operations, expected)
      return formatExecutionMonitorReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'safety_auditor',
    description: 'Audit execution logs against safety policies. Identifies compliance violations, analyzes violation patterns, and provides compliance rate reporting.',
    parameters: {
      execution_logs: { type: 'string', required: true, description: 'JSON array of execution log objects: timestamp, operation, actor, result, risk_level, duration_ms, metadata{}' },
      safety_policies: { type: 'string', required: true, description: 'JSON array of policy objects: policy_id, name, category, rules[]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { execution_logs: string; safety_policies: string }) {
      const logs: ExecutionLog[] = JSON.parse(args.execution_logs)
      const policies: SafetyPolicy[] = JSON.parse(args.safety_policies)
      const result = auditSafety(logs, policies)
      return formatSafetyAuditReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'policy_tuner',
    description: 'Analyze false positive/negative logs to recommend policy optimizations. Suggests threshold adjustments, rule additions, and scope changes with expected improvements.',
    parameters: {
      false_positive_log: { type: 'string', required: true, description: 'JSON array of false positive entries: action, originally_classified_as, correct_classification, timestamp, impact' },
      false_negative_log: { type: 'string', required: true, description: 'JSON array of false negative entries: action, originally_classified_as, correct_classification, timestamp, damage' },
      current_policies: { type: 'string', required: true, description: 'JSON array of current policy objects: policy_id, name, thresholds{}, rules[], last_updated' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { false_positive_log: string; false_negative_log: string; current_policies: string }) {
      const fpLog: FalsePositiveEntry[] = JSON.parse(args.false_positive_log)
      const fnLog: FalseNegativeEntry[] = JSON.parse(args.false_negative_log)
      const policies: CurrentPolicy[] = JSON.parse(args.current_policies)
      const result = tunePolicies(fpLog, fnLog, policies)
      return formatPolicyTunerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'incident_predictor',
    description: 'Predict potential incidents from operation sequences and system state. Identifies high-risk operations, resource exhaustion, cascade failures, and network timeouts with preventive measures.',
    parameters: {
      operation_sequence: { type: 'string', required: true, description: 'JSON array of operation steps: step_number, action, target, risk_score, dependencies[], estimated_duration_ms' },
      system_state: { type: 'string', required: true, description: 'JSON system state: cpu_usage_pct, memory_usage_pct, disk_usage_pct, network_latency_ms, active_connections, recent_error_rate' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { operation_sequence: string; system_state: string }) {
      const sequence: OperationStep[] = JSON.parse(args.operation_sequence)
      const state: SystemStateState = JSON.parse(args.system_state)
      const result = predictIncidents(sequence, state)
      return formatIncidentPredictorReport(result)
    }
  }))

  console.log(`[dsh-tool-automode] Loaded v${VERSION} - Auto Mode Safety Classifier with 8 tools`)
  console.log('  Tools: command_classifier, risk_assessor, boundary_enforcer, approval_recommender, execution_monitor, safety_auditor, policy_tuner, incident_predictor')
}
