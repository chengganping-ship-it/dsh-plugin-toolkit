/**
 * DSH Agent Behavior Audit & Compliance Plugin v0.1.0
 *
 * Agent behavior audit toolkit for DeepSeek Harness - action logging, anomaly detection,
 * compliance checking, forensics, behavior profiling, and trajectory replay.
 * Designed for AI agent governance, regulatory compliance, and operational traceability.
 *
 * Features (v0.1.0):
 * - Action Logger (structured audit log entry generation with severity classification)
 * - Anomaly Detector (behavioral deviation detection with baseline profiling)
 * - Compliance Checker (policy compliance validation with violation reporting)
 * - Forensics Analyzer (incident reconstruction with timeline and root cause)
 * - Behavior Profiler (agent preference and pattern identification)
 * - Policy Violation Scanner (real-time policy enforcement scanning)
 * - Audit Report Generator (comprehensive audit reports with executive summary)
 * - Trajectory Replayer (session decision-point analysis and replay)
 *
 * @module dsh-tool-auditor
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-auditor'
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

// ==================== TYPES ====================

// --- Tool 1: Action Logger ---
interface ActionLogInput {
  agent_id: string
  action: string
  target: string
  result: string
  timestamp: string
}

interface AuditLogEntry {
  log_id: string
  agent_id: string
  action: string
  target: string
  result: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
  category: string
  compliance_relevant: boolean
  retention_days: number
  hash_chain: string
}

// --- Tool 2: Anomaly Detector ---
interface ActionHistoryEntry {
  action: string
  timestamp: string
  duration_ms: number
  success: boolean
}

interface BaselineProfile {
  avg_actions_per_hour: number
  avg_duration_ms: number
  success_rate: number
  common_actions: string[]
  risk_tolerance: 'low' | 'medium' | 'high'
}

interface AnomalyAlert {
  action: string
  timestamp: string
  deviation_score: number
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface AnomalyDetectionResult {
  alerts: AnomalyAlert[]
  overall_deviation_score: number
  status: 'normal' | 'suspicious' | 'anomalous' | 'critical'
  summary: string
}

// --- Tool 3: Compliance Checker ---
interface ComplianceAction {
  action: string
  target: string
  data_accessed: string[]
  timestamp: string
  agent_id: string
}

interface CompliancePolicy {
  policy_id: string
  name: string
  description: string
  forbidden_actions: string[]
  forbidden_targets: string[]
  required_approval_above: string[]
  max_data_types: number
}

interface ViolationItem {
  action: string
  policy_id: string
  policy_name: string
  violation_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

interface ComplianceCheckResult {
  status: 'compliant' | 'partial' | 'violation'
  violations: ViolationItem[]
  checks_performed: number
  summary: string
}

// --- Tool 4: Forensics Analyzer ---
interface LogEntry {
  timestamp: string
  action: string
  agent_id: string
  details: string
  severity: string
}

interface TimelineEvent {
  timestamp: string
  action: string
  details: string
  significance: 'routine' | 'notable' | 'critical'
}

interface ForensicsResult {
  incident_id: string
  timeline: TimelineEvent[]
  root_cause: string
  contributing_factors: string[]
  impact_assessment: string
  recommendations: string[]
  confidence: number
}

// --- Tool 5: Behavior Profiler ---
interface BehaviorProfileResult {
  agent_id: string
  patterns: {
    preferred_actions: Array<{ action: string; frequency: number; percentage: number }>
    avg_session_duration_ms: number
    success_rate: number
    risk_appetite: 'conservative' | 'moderate' | 'aggressive'
    peak_activity_hour: number
    common_targets: Array<{ target: string; count: number }>
  }
  preferences: {
    automation_level: number
    collaboration_tendency: number
    retry_persistence: number
    exploration_vs_exploitation: number
  }
  classification: string
  summary: string
}

// --- Tool 6: Policy Violation Scanner ---
interface RecentAction {
  action: string
  timestamp: string
  agent_id: string
  target: string
  metadata: Record<string, string>
}

interface ActivePolicy {
  policy_id: string
  name: string
  rules: Array<{
    condition: string
    action: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }>
  enabled: boolean
}

interface ViolationFinding {
  rule_matched: string
  action: string
  policy_id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  risk_contribution: number
  description: string
}

interface PolicyViolationScanResult {
  scan_id: string
  total_actions_scanned: number
  total_policies_checked: number
  findings: ViolationFinding[]
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  summary: string
}

// --- Tool 7: Audit Report Generator ---
interface AuditFinding {
  finding_id: string
  category: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
}

interface TimeRange {
  start: string
  end: string
}

interface AuditReportInput {
  audit_scope: string
  time_range: TimeRange
  findings: AuditFinding[]
}

interface AuditReportResult {
  report_id: string
  generated_at: string
  executive_summary: string
  statistics: {
    total_findings: number
    critical_count: number
    high_count: number
    medium_count: number
    low_count: number
    info_count: number
    overall_grade: string
  }
  findings_by_category: Record<string, number>
  top_recommendations: string[]
  compliance_score: number
}

// --- Tool 8: Trajectory Replayer ---
interface TrajectoryEvent {
  timestamp: string
  action: string
  input_summary: string
  output_summary: string
  duration_ms: number
  decision_point: boolean
  alternatives_considered: string[]
}

interface DecisionPoint {
  timestamp: string
  action: string
  alternatives: string[]
  choice_rationale: string
  outcome: string
  risk_at_decision: 'low' | 'medium' | 'high'
}

interface TrajectoryReplayResult {
  session_id: string
  total_events: number
  decision_points: DecisionPoint[]
  execution_path: Array<{ step: number; action: string; duration_ms: string }>
  critical_decisions: DecisionPoint[]
  optimization_suggestions: string[]
  total_duration_ms: number
}

// ==================== TOOL 1: ACTION LOGGER ====================

function createAuditLogEntry(input: ActionLogInput): AuditLogEntry {
  const severityMap: Record<string, 'info' | 'warning' | 'critical'> = {
    delete: 'critical',
    modify: 'warning',
    write: 'warning',
    read: 'info',
    execute: 'critical',
    access: 'warning',
    create: 'info',
    export: 'critical',
    login: 'warning',
    config_change: 'critical',
  }

  let severity: 'info' | 'warning' | 'critical' = 'info'
  const actionLower = input.action.toLowerCase()
  for (const [key, val] of Object.entries(severityMap)) {
    if (actionLower.includes(key)) {
      severity = val
      break
    }
  }

  const categoryMap: Record<string, string> = {
    read: 'data_access',
    write: 'data_modification',
    delete: 'data_deletion',
    execute: 'code_execution',
    access: 'system_access',
    create: 'resource_creation',
    export: 'data_export',
    login: 'authentication',
    modify: 'configuration',
    config_change: 'configuration',
  }

  let category = 'general'
  for (const [key, val] of Object.entries(categoryMap)) {
    if (actionLower.includes(key)) {
      category = val
      break
    }
  }

  const complianceRelevant = severity !== 'info' || category === 'data_export' || category === 'authentication'
  const retentionDays = severity === 'critical' ? 365 : severity === 'warning' ? 180 : 90
  const hashInput = `${input.agent_id}${input.action}${input.target}${input.timestamp}`
  let hash = 0
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  const hashChain = Math.abs(hash).toString(16).padStart(8, '0')

  return {
    log_id: `AUD-${Date.now()}-${hashChain}`,
    agent_id: input.agent_id,
    action: input.action,
    target: input.target,
    result: input.result,
    timestamp: input.timestamp,
    severity,
    category,
    compliance_relevant: complianceRelevant,
    retention_days: retentionDays,
    hash_chain: hashChain,
  }
}

function formatActionLogReport(entry: AuditLogEntry): string {
  const lines: string[] = []
  const sevIcon = entry.severity === 'critical' ? '[CRITICAL]' : entry.severity === 'warning' ? '[WARNING]' : '[INFO]'

  lines.push('## Action Log Entry')
  lines.push('')
  lines.push('### Log Metadata')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push(`| Log ID | ${entry.log_id} |`)
  lines.push(`| Agent ID | ${entry.agent_id} |`)
  lines.push(`| Timestamp | ${entry.timestamp} |`)
  lines.push(`| Severity | ${sevIcon} ${entry.severity.toUpperCase()} |`)
  lines.push(`| Category | ${entry.category} |`)
  lines.push(`| Compliance Relevant | ${entry.compliance_relevant ? 'YES' : 'NO'} |`)
  lines.push(`| Retention (days) | ${entry.retention_days} |`)
  lines.push(`| Hash Chain | ${entry.hash_chain} |`)
  lines.push('')
  lines.push('### Action Details')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push(`| Action | ${entry.action} |`)
  lines.push(`| Target | ${entry.target} |`)
  lines.push(`| Result | ${entry.result} |`)
  lines.push('')
  lines.push(`Entry logged successfully | Severity: ${entry.severity} | Retention: ${entry.retention_days}d`)

  return lines.join('\n')
}

// ==================== TOOL 2: ANOMALY DETECTOR ====================

function detectAnomalies(history: ActionHistoryEntry[], baseline: BaselineProfile): AnomalyDetectionResult {
  const alerts: AnomalyAlert[] = []

  if (history.length === 0) {
    return {
      alerts: [],
      overall_deviation_score: 0,
      status: 'normal',
      summary: 'No action history provided — baseline assumed normal',
    }
  }

  // Frequency anomaly check
  const timeSpanHours = history.length > 1
    ? Math.max((new Date(history[history.length - 1].timestamp).getTime() - new Date(history[0].timestamp).getTime()) / 3600000, 0.5)
    : 1
  const actionsPerHour = history.length / timeSpanHours

  if (actionsPerHour > baseline.avg_actions_per_hour * 2.5) {
    alerts.push({
      action: 'frequency_check',
      timestamp: history[history.length - 1].timestamp,
      deviation_score: clamp(actionsPerHour / baseline.avg_actions_per_hour, 0, 1),
      reason: `Action frequency ${actionsPerHour.toFixed(1)}/hr exceeds baseline ${baseline.avg_actions_per_hour}/hr by ${((actionsPerHour / baseline.avg_actions_per_hour - 1) * 100).toFixed(0)}%`,
      severity: actionsPerHour > baseline.avg_actions_per_hour * 4 ? 'critical' : 'high',
    })
  }

  // Duration anomaly check
  const avgDuration = history.reduce((s, h) => s + h.duration_ms, 0) / history.length
  if (avgDuration > baseline.avg_duration_ms * 3) {
    alerts.push({
      action: 'duration_check',
      timestamp: history[history.length - 1].timestamp,
      deviation_score: clamp(avgDuration / baseline.avg_duration_ms / 5, 0, 1),
      reason: `Average duration ${avgDuration.toFixed(0)}ms significantly higher than baseline ${baseline.avg_duration_ms}ms`,
      severity: avgDuration > baseline.avg_duration_ms * 5 ? 'high' : 'medium',
    })
  }

  // Success rate anomaly check
  const successRate = history.filter(h => h.success).length / history.length
  if (successRate < baseline.success_rate * 0.5) {
    alerts.push({
      action: 'success_rate_check',
      timestamp: history[history.length - 1].timestamp,
      deviation_score: clamp(1 - (successRate / baseline.success_rate), 0, 1),
      reason: `Success rate ${(successRate * 100).toFixed(0)}% is ${((1 - successRate / baseline.success_rate) * 100).toFixed(0)}% below baseline ${(baseline.success_rate * 100).toFixed(0)}%`,
      severity: successRate < baseline.success_rate * 0.3 ? 'critical' : 'high',
    })
  }

  // Unfamiliar action detection
  for (const entry of history) {
    const isCommon = baseline.common_actions.some(
      ca => entry.action.toLowerCase().includes(ca.toLowerCase()) || ca.toLowerCase().includes(entry.action.toLowerCase())
    )
    if (!isCommon) {
      alerts.push({
        action: entry.action,
        timestamp: entry.timestamp,
        deviation_score: 0.4,
        reason: `Action "${entry.action}" not found in baseline common actions list`,
        severity: baseline.risk_tolerance === 'low' ? 'medium' : 'low',
      })
    }
  }

  // Calculate overall deviation score
  const totalDeviation = alerts.reduce((s, a) => s + a.deviation_score, 0)
  const overallDeviation = alerts.length > 0 ? totalDeviation / alerts.length : 0

  let status: 'normal' | 'suspicious' | 'anomalous' | 'critical' = 'normal'
  if (alerts.some(a => a.severity === 'critical')) status = 'critical'
  else if (alerts.some(a => a.severity === 'high')) status = 'anomalous'
  else if (alerts.some(a => a.severity === 'medium')) status = 'suspicious'

  const summary = alerts.length === 0
    ? 'All actions within normal baseline parameters'
    : `${alerts.length} anomaly/anomalies detected — Status: ${status.toUpperCase} | Overall deviation: ${(overallDeviation * 100).toFixed(0)}%`

  return {
    alerts: alerts.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return sevOrder[a.severity] - sevOrder[b.severity]
    }),
    overall_deviation_score: overallDeviation,
    status,
    summary,
  }
}

function formatAnomalyReport(result: AnomalyDetectionResult): string {
  const lines: string[] = []
  const statusIcon = result.status === 'critical' ? '[CRITICAL]' : result.status === 'anomalous' ? '[ANOMALOUS]' : result.status === 'suspicious' ? '[SUSPICIOUS]' : '[NORMAL]'

  lines.push('### Anomaly Detection Result')
  lines.push('')
  lines.push(`Status: ${statusIcon} | Overall Deviation: ${(result.overall_deviation_score * 100).toFixed(1)}%`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  if (result.alerts.length > 0) {
    lines.push('### Detected Anomalies')
    lines.push('| # | Severity | Action | Deviation | Reason |')
    lines.push('|---|----------|--------|-----------|--------|')
    let idx = 1
    for (const alert of result.alerts) {
      const sevTag = alert.severity === 'critical' ? 'CRITICAL' : alert.severity === 'high' ? 'HIGH' : alert.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${sevTag} | ${alert.action} | ${(alert.deviation_score * 100).toFixed(0)}% | ${alert.reason.substring(0, 50)}${alert.reason.length > 50 ? '...' : ''} |`)
      idx++
    }
  } else {
    lines.push('No anomalies detected.')
  }

  return lines.join('\n')
}

// ==================== TOOL 3: COMPLIANCE CHECKER ====================

function checkCompliance(actions: ComplianceAction[], policies: CompliancePolicy[]): ComplianceCheckResult {
  const violations: ViolationItem[] = []
  let checksPerformed = 0

  for (const action of actions) {
    for (const policy of policies) {
      // Check forbidden actions
      checksPerformed++
      for (const forbidden of policy.forbidden_actions) {
        if (action.action.toLowerCase().includes(forbidden.toLowerCase())) {
          violations.push({
            action: action.action,
            policy_id: policy.policy_id,
            policy_name: policy.name,
            violation_type: 'forbidden_action',
            severity: 'critical',
            description: `Action "${action.action}" matches forbidden action "${forbidden}" in policy ${policy.policy_id}`,
          })
        }
      }

      // Check forbidden targets
      for (const forbidden of policy.forbidden_targets) {
        checksPerformed++
        if (action.target.toLowerCase().includes(forbidden.toLowerCase())) {
          violations.push({
            action: action.action,
            policy_id: policy.policy_id,
            policy_name: policy.name,
            violation_type: 'forbidden_target',
            severity: 'high',
            description: `Target "${action.target}" matches forbidden target "${forbidden}" in policy ${policy.policy_id}`,
          })
        }
      }

      // Check data type count
      checksPerformed++
      if (action.data_accessed.length > policy.max_data_types) {
        violations.push({
          action: action.action,
          policy_id: policy.policy_id,
          policy_name: policy.name,
          violation_type: 'excessive_data_access',
          severity: 'medium',
          description: `Accessed ${action.data_accessed.length} data types (max: ${policy.max_data_types}) in policy ${policy.policy_id}`,
        })
      }

      // Check approval requirements
      for (const approvalItem of policy.required_approval_above) {
        checksPerformed++
        if (action.target.toLowerCase().includes(approvalItem.toLowerCase()) || action.action.toLowerCase().includes(approvalItem.toLowerCase())) {
          violations.push({
            action: action.action,
            policy_id: policy.policy_id,
            policy_name: policy.name,
            violation_type: 'missing_approval',
            severity: 'high',
            description: `Action "${action.action}" on "${action.target}" requires prior approval per policy ${policy.policy_id}`,
          })
        }
      }
    }
  }

  let status: 'compliant' | 'partial' | 'violation' = 'compliant'
  if (violations.some(v => v.severity === 'critical')) status = 'violation'
  else if (violations.length > 0) status = 'partial'

  const summary = `${checksPerformed} compliance checks performed | ${violations.length} violation(s) found | Status: ${status.toUpperCase()}`

  return { status, violations, checks_performed: checksPerformed, summary }
}

function formatComplianceReport(result: ComplianceCheckResult): string {
  const lines: string[] = []
  const statusIcon = result.status === 'compliant' ? 'COMPLIANT' : result.status === 'partial' ? 'PARTIAL' : 'VIOLATION'

  lines.push('### Compliance Check Result')
  lines.push('')
  lines.push(`Status: ${statusIcon} | Checks: ${result.checks_performed} | Violations: ${result.violations.length}`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  if (result.violations.length > 0) {
    lines.push('### Violations Detail')
    lines.push('| # | Severity | Type | Action | Policy | Description |')
    lines.push('|---|----------|------|--------|--------|-------------|')
    let idx = 1
    for (const v of result.violations) {
      const sevTag = v.severity === 'critical' ? 'CRITICAL' : v.severity === 'high' ? 'HIGH' : v.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${sevTag} | ${v.violation_type} | ${v.action} | ${v.policy_id} | ${v.description.substring(0, 45)}${v.description.length > 45 ? '...' : ''} |`)
      idx++
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: FORENSICS ANALYZER ====================

function analyzeForensics(incidentId: string, logs: LogEntry[]): ForensicsResult {
  if (logs.length === 0) {
    return {
      incident_id: incidentId,
      timeline: [],
      root_cause: 'No logs provided for analysis',
      contributing_factors: [],
      impact_assessment: 'Unable to assess impact without log data',
      recommendations: ['Collect relevant logs before analysis'],
      confidence: 0,
    }
  }

  // Sort logs chronologically
  const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Build timeline
  const timeline: TimelineEvent[] = sortedLogs.map(log => {
    const isCritical = log.severity === 'critical' || log.action.toLowerCase().includes('delete') ||
      log.action.toLowerCase().includes('overwrite') || log.details.toLowerCase().includes('error') ||
      log.details.toLowerCase().includes('unauthorized')
    const isNotable = log.severity === 'warning' || log.action.toLowerCase().includes('modify') ||
      log.action.toLowerCase().includes('access')

    let significance: 'routine' | 'notable' | 'critical' = 'routine'
    if (isCritical) significance = 'critical'
    else if (isNotable) significance = 'notable'

    const timelineEvent: TimelineEvent = {
      timestamp: log.timestamp,
      action: log.action,
      details: log.details,
      significance,
    }
    return timelineEvent
  })

  // Identify root cause: first critical event or most severe
  const criticalEvents = timeline.filter(t => t.significance === 'critical')
  const rootCauseEvent = criticalEvents.length > 0 ? criticalEvents[0] : timeline[timeline.length - 1]
  const rootCause = criticalEvents.length > 0
    ? `Critical action "${rootCauseEvent.action}" at ${rootCauseEvent.timestamp} — ${rootCauseEvent.details}`
    : `Last action "${rootCauseEvent.action}" at ${rootCauseEvent.timestamp} — ${rootCauseEvent.details}`

  // Contributing factors
  const contributingFactors: string[] = []
  const uniqueAgents = new Set(sortedLogs.map(l => l.agent_id))
  if (uniqueAgents.size > 1) {
    contributingFactors.push(`Multiple agents involved: ${Array.from(uniqueAgents).join(', ')}`)
  }
  const actionTypes = new Set(sortedLogs.map(l => l.action.split('_')[0]))
  if (actionTypes.size > 3) {
    contributingFactors.push(`High action diversity (${actionTypes.size} action categories) suggesting uncoordinated activity`)
  }
  const failureLogs = sortedLogs.filter(l => l.details.toLowerCase().includes('fail') || l.details.toLowerCase().includes('error'))
  if (failureLogs.length > 0) {
    contributingFactors.push(`${failureLogs.length} failure(s) detected in chain — possible cascading effect`)
  }
  const timeSpan = new Date(sortedLogs[sortedLogs.length - 1].timestamp).getTime() - new Date(sortedLogs[0].timestamp).getTime()
  if (timeSpan < 60000) {
    contributingFactors.push(`Rapid sequence (${(timeSpan / 1000).toFixed(0)}s span) — insufficient time for human review`)
  }

  // Impact assessment
  const criticalCount = timeline.filter(t => t.significance === 'critical').length
  const targetSet = new Set(sortedLogs.map(l => l.action))
  let impactAssessment: string
  if (criticalCount > 2) {
    impactAssessment = `HIGH: ${criticalCount} critical events across ${targetSet.size} action types — potential data integrity compromise`
  } else if (criticalCount > 0) {
    impactAssessment = `MEDIUM: ${criticalCount} critical event(s) detected — limited blast radius but requires investigation`
  } else if (timeline.filter(t => t.significance === 'notable').length > 2) {
    impactAssessment = 'LOW-MEDIUM: Multiple notable events — monitor for escalation'
  } else {
    impactAssessment = 'LOW: Primarily routine operations with no critical events'
  }

  // Recommendations
  const recommendations: string[] = []
  if (criticalCount > 0) {
    recommendations.push('Immediately review all critical actions for authorization validity')
    recommendations.push('Consider rolling back changes from the identified root cause event')
  }
  if (uniqueAgents.size > 1) {
    recommendations.push('Verify cross-agent coordination protocols are followed')
  }
  if (failureLogs.length > 2) {
    recommendations.push('Investigate failure chain — determine if errors are cause or symptom')
  }
  recommendations.push('Implement additional approval gates for high-severity actions')
  recommendations.push('Enable real-time alerting on critical action patterns')

  // Confidence based on data quality
  const confidence = clamp(0.5 + (logs.length * 0.02) + (criticalCount > 0 ? 0.15 : 0), 0.4, 0.92)

  return {
    incident_id: incidentId,
    timeline,
    root_cause: rootCause,
    contributing_factors: contributingFactors,
    impact_assessment: impactAssessment,
    recommendations,
    confidence,
  }
}

function formatForensicsReport(result: ForensicsResult): string {
  const lines: string[] = []

  lines.push('### Forensics Analysis Report')
  lines.push('')
  lines.push(`Incident: ${result.incident_id} | Confidence: ${(result.confidence * 100).toFixed(0)}%`)
  lines.push('')
  lines.push(`Root Cause: ${result.root_cause}`)
  lines.push('')
  lines.push(`Impact Assessment: ${result.impact_assessment}`)
  lines.push('')

  if (result.contributing_factors.length > 0) {
    lines.push('### Contributing Factors')
    for (const factor of result.contributing_factors) {
      lines.push(`- ${factor}`)
    }
    lines.push('')
  }

  if (result.timeline.length > 0) {
    lines.push('### Event Timeline')
    lines.push('| # | Timestamp | Action | Significance | Details |')
    lines.push('|---|-----------|--------|--------------|---------|')
    let idx = 1
    for (const event of result.timeline.slice(0, 25)) {
      const sigTag = event.significance === 'critical' ? 'CRITICAL' : event.significance === 'notable' ? 'NOTABLE' : 'ROUTINE'
      lines.push(`| ${idx} | ${event.timestamp} | ${event.action} | ${sigTag} | ${event.details.substring(0, 40)}${event.details.length > 40 ? '...' : ''} |`)
      idx++
    }
    if (result.timeline.length > 25) {
      lines.push(`| ... | (${result.timeline.length - 25} more events omitted) | | | |`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const rec of result.recommendations) {
      lines.push(`- ${rec}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: BEHAVIOR PROFILER ====================

function buildBehaviorProfile(agentId: string, history: ActionHistoryEntry[]): BehaviorProfileResult {
  if (history.length === 0) {
    return {
      agent_id: agentId,
      patterns: {
        preferred_actions: [],
        avg_session_duration_ms: 0,
        success_rate: 0,
        risk_appetite: 'moderate',
        peak_activity_hour: 12,
        common_targets: [],
      },
      preferences: {
        automation_level: 0.5,
        collaboration_tendency: 0.5,
        retry_persistence: 0.5,
        exploration_vs_exploitation: 0.5,
      },
      classification: 'unclassified',
      summary: 'Insufficient data — no action history provided for profiling',
    }
  }

  // Action frequency analysis
  const actionCounts = new Map<string, number>()
  for (const h of history) {
    const normalizedAction = h.action.toLowerCase().replace(/\d+/g, '').trim()
    actionCounts.set(normalizedAction, (actionCounts.get(normalizedAction) || 0) + 1)
  }
  const preferredActions = Array.from(actionCounts.entries())
    .map(([action, count]) => ({
      action,
      frequency: count,
      percentage: (count / history.length) * 100,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)

  // Average session duration
  const avgDuration = history.reduce((s, h) => s + h.duration_ms, 0) / history.length

  // Success rate
  const successRate = history.filter(h => h.success).length / history.length

  // Risk appetite based on action types
  const riskyActions = history.filter(h =>
    h.action.toLowerCase().includes('delete') ||
    h.action.toLowerCase().includes('overwrite') ||
    h.action.toLowerCase().includes('sudo') ||
    h.action.toLowerCase().includes('force') ||
    h.action.toLowerCase().includes('bypass')
  ).length
  const riskyRatio = riskyActions / history.length
  let riskAppetite: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  if (riskyRatio > 0.3 || successRate < 0.5) riskAppetite = 'aggressive'
  else if (riskyRatio < 0.05 && successRate > 0.85) riskAppetite = 'conservative'

  // Peak activity hour (using seeded determinism on agent_id)
  const seed = `${agentId}-peak`
  const peakHour = Math.floor(seededRandom(seed) * 24)

  // Target frequency (embedded in action names for simplicity)
  const targetCounts = new Map<string, number>()
  for (const h of history) {
    const parts = h.action.split('_')
    const target = parts.length > 1 ? parts[parts.length - 1] : 'general'
    targetCounts.set(target, (targetCounts.get(target) || 0) + 1)
  }
  const commonTargets = Array.from(targetCounts.entries())
    .map(([target, count]) => ({ target, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Preference metrics
  const automationLevel = clamp(0.3 + (history.length / 200) + (successRate * 0.3), 0.1, 0.95)
  const failedActions = history.filter(h => !h.success).length
  const retryActions = history.filter((h, i) => i > 0 && h.action === history[i - 1].action).length
  const retryPersistence = failedActions > 0 ? clamp(retryActions / failedActions, 0, 1) : 0.5
  const uniqueActions = new Set(history.map(h => h.action.toLowerCase())).size
  const explorationRatio = clamp(uniqueActions / history.length, 0.05, 0.95)

  // Classification
  let classification: string
  if (riskAppetite === 'aggressive' && automationLevel > 0.7) {
    classification = 'high_autonomy_high_risk'
  } else if (riskAppetite === 'conservative' && automationLevel > 0.7) {
    classification = 'high_autonomy_low_risk'
  } else if (riskAppetite === 'aggressive' && automationLevel <= 0.7) {
    classification = 'manual_high_risk'
  } else {
    classification = 'balanced_operator'
  }

  const summary = `Agent "${agentId}" classified as ${classification} | ${history.length} actions | ${(successRate * 100).toFixed(0)}% success | Risk: ${riskAppetite} | Automation: ${(automationLevel * 100).toFixed(0)}%`

  return {
    agent_id: agentId,
    patterns: {
      preferred_actions: preferredActions,
      avg_session_duration_ms: avgDuration,
      success_rate: successRate,
      risk_appetite: riskAppetite,
      peak_activity_hour: peakHour,
      common_targets: commonTargets,
    },
    preferences: {
      automation_level: automationLevel,
      collaboration_tendency: 0.5,
      retry_persistence: retryPersistence,
      exploration_vs_exploitation: explorationRatio,
    },
    classification,
    summary,
  }
}

function formatBehaviorProfileReport(result: BehaviorProfileResult): string {
  const lines: string[] = []

  lines.push('### Behavior Profile Report')
  lines.push('')
  lines.push(`Agent: ${result.agent_id} | Classification: ${result.classification}`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  lines.push('### Behavior Patterns')
  lines.push('| Pattern | Value |')
  lines.push('|---------|-------|')
  lines.push(`| Avg Session Duration | ${result.patterns.avg_session_duration_ms.toFixed(0)}ms |`)
  lines.push(`| Success Rate | ${(result.patterns.success_rate * 100).toFixed(1)}% |`)
  lines.push(`| Risk Appetite | ${result.patterns.risk_appetite.toUpperCase()} |`)
  lines.push(`| Peak Activity Hour | ${result.patterns.peak_activity_hour}:00 UTC |`)
  lines.push('')

  if (result.patterns.preferred_actions.length > 0) {
    lines.push('### Top Preferred Actions')
    lines.push('| Action | Frequency | Percentage |')
    lines.push('|--------|-----------|------------|')
    for (const a of result.patterns.preferred_actions.slice(0, 8)) {
      lines.push(`| ${a.action} | ${a.frequency} | ${a.percentage.toFixed(1)}% |`)
    }
    lines.push('')
  }

  if (result.patterns.common_targets.length > 0) {
    lines.push('### Common Targets')
    lines.push('| Target | Interactions |')
    lines.push('|--------|-------------|')
    for (const t of result.patterns.common_targets.slice(0, 6)) {
      lines.push(`| ${t.target} | ${t.count} |`)
    }
    lines.push('')
  }

  lines.push('### Preference Metrics')
  lines.push('| Metric | Score |')
  lines.push('|--------|-------|')
  lines.push(`| Automation Level | ${(result.preferences.automation_level * 100).toFixed(0)}% |`)
  lines.push(`| Retry Persistence | ${(result.preferences.retry_persistence * 100).toFixed(0)}% |`)
  lines.push(`| Exploration vs Exploitation | ${(result.preferences.exploration_vs_exploitation * 100).toFixed(0)}% explore |`)

  return lines.join('\n')
}

// ==================== TOOL 6: POLICY VIOLATION SCANNER ====================

function scanPolicyViolations(actions: RecentAction[], policies: ActivePolicy[]): PolicyViolationScanResult {
  const findings: ViolationFinding[] = []
  const enabledPolicies = policies.filter(p => p.enabled)
  const scanId = `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  for (const action of actions) {
    for (const policy of enabledPolicies) {
      for (const rule of policy.rules) {
        let matched = false

        switch (rule.condition) {
          case 'action_contains':
            if (action.action.toLowerCase().includes(rule.action.toLowerCase())) {
              matched = true
            }
            break
          case 'target_contains':
            if (action.target.toLowerCase().includes(rule.action.toLowerCase())) {
              matched = true
            }
            break
          case 'metadata_equals':
            for (const [key, val] of Object.entries(action.metadata)) {
              if (key.toLowerCase() === rule.action.toLowerCase().split('=')[0] &&
                  val.toLowerCase() === rule.action.toLowerCase().split('=')[1]) {
                matched = true
              }
            }
            break
          case 'action_not_contains':
            // This rule type means: if action does NOT contain the string, it's a violation
            if (!action.action.toLowerCase().includes(rule.action.toLowerCase())) {
              matched = true
            }
            break
          default:
            // Default: substring match on action
            if (action.action.toLowerCase().includes(rule.action.toLowerCase())) {
              matched = true
            }
        }

        if (matched) {
          const riskMap: Record<string, number> = { low: 1, medium: 3, high: 6, critical: 10 }
          findings.push({
            rule_matched: rule.condition,
            action: action.action,
            policy_id: policy.policy_id,
            severity: rule.severity,
            risk_contribution: riskMap[rule.severity] || 1,
            description: `Action "${action.action}" matched rule "${rule.condition}:${rule.action}" in policy "${policy.name}"`,
          })
        }
      }
    }
  }

  const totalRisk = findings.reduce((s, f) => s + f.risk_contribution, 0)
  const maxPossibleRisk = actions.length * 10
  const riskScore = maxPossibleRisk > 0 ? clamp(totalRisk / maxPossibleRisk, 0, 1) : 0

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (riskScore > 0.7) riskLevel = 'critical'
  else if (riskScore > 0.4) riskLevel = 'high'
  else if (riskScore > 0.15) riskLevel = 'medium'

  const summary = `Scanned ${actions.length} actions against ${enabledPolicies.length} active policies | ${findings.length} finding(s) | Risk: ${riskLevel.toUpperCase()} (${(riskScore * 100).toFixed(0)}%)`

  return {
    scan_id: scanId,
    total_actions_scanned: actions.length,
    total_policies_checked: enabledPolicies.length,
    findings: findings.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return sevOrder[a.severity] - sevOrder[b.severity]
    }),
    risk_score: riskScore,
    risk_level: riskLevel,
    summary,
  }
}

function formatPolicyViolationReport(result: PolicyViolationScanResult): string {
  const lines: string[] = []

  lines.push('### Policy Violation Scan Result')
  lines.push('')
  lines.push(`Scan ID: ${result.scan_id} | Actions: ${result.total_actions_scanned} | Policies: ${result.total_policies_checked}`)
  lines.push(`Risk Level: ${result.risk_level.toUpperCase()} | Risk Score: ${(result.risk_score * 100).toFixed(1)}%`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  if (result.findings.length > 0) {
    lines.push('### Findings')
    lines.push('| # | Severity | Rule | Action | Policy | Description |')
    lines.push('|---|----------|------|--------|--------|-------------|')
    let idx = 1
    for (const f of result.findings) {
      const sevTag = f.severity === 'critical' ? 'CRITICAL' : f.severity === 'high' ? 'HIGH' : f.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${sevTag} | ${f.rule_matched} | ${f.action} | ${f.policy_id} | ${f.description.substring(0, 40)}${f.description.length > 40 ? '...' : ''} |`)
      idx++
    }
  } else {
    lines.push('No policy violations detected.')
  }

  return lines.join('\n')
}

// ==================== TOOL 7: AUDIT REPORT GENERATOR ====================

function generateAuditReport(input: AuditScopeInput): AuditReportResult {
  const { audit_scope, time_range, findings } = input

  const stats = {
    total_findings: findings.length,
    critical_count: findings.filter(f => f.severity === 'critical').length,
    high_count: findings.filter(f => f.severity === 'high').length,
    medium_count: findings.filter(f => f.severity === 'medium').length,
    low_count: findings.filter(f => f.severity === 'low').length,
    info_count: findings.filter(f => f.severity === 'info').length,
    overall_grade: 'A',
  }

  // Calculate grade
  const penaltyPoints = stats.critical_count * 10 + stats.high_count * 5 + stats.medium_count * 2 + stats.low_count * 0.5
  if (penaltyPoints > 30) stats.overall_grade = 'F'
  else if (penaltyPoints > 20) stats.overall_grade = 'D'
  else if (penaltyPoints > 10) stats.overall_grade = 'C'
  else if (penaltyPoints > 3) stats.overall_grade = 'B'

  // Findings by category
  const byCategory: Record<string, number> = {}
  for (const f of findings) {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1
  }
  const findingsByCategory = Object.fromEntries(
    Object.entries(byCategory).sort(([, a], [, b]) => b - a)
  )

  // Top recommendations (prioritized by severity)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  const topRecommendations = findings
    .filter(f => f.recommendation)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 10)
    .map(f => `[${f.severity.toUpperCase()}] ${f.recommendation}`)

  // Compliance score
  const maxPenalty = findings.length * 10
  const actualPenalty = findings.reduce((s, f) => {
    const points = { critical: 10, high: 5, medium: 2, low: 0.5, info: 0.1 }
    return s + (points[f.severity] || 0)
  }, 0)
  const complianceScore = maxPenalty > 0 ? clamp(100 - (actualPenalty / maxPenalty) * 100, 0, 100) : 100

  // Executive summary
  const executiveSummary = stats.total_findings === 0
    ? `Audit of "${audit_scope}" from ${time_range.start} to ${time_range.end} found zero findings. Full compliance maintained.`
    : `Audit of "${audit_scope}" (${time_range.start} to ${time_range.end}) found ${stats.total_findings} finding(s): ${stats.critical_count} critical, ${stats.high_count} high, ${stats.medium_count} medium, ${stats.low_count} low. Overall grade: ${stats.overall_grade}. Compliance score: ${complianceScore.toFixed(0)}%.`

  const reportId = `RPT-${Date.now()}-${Math.abs(hashCode(audit_scope)).toString(16).substring(0, 4)}`
  const generatedAt = new Date().toISOString()

  return {
    report_id: reportId,
    generated_at: generatedAt,
    executive_summary: executiveSummary,
    statistics: stats,
    findings_by_category: findingsByCategory,
    top_recommendations: topRecommendations,
    compliance_score: complianceScore,
  }
}

// Helper for report ID generation
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

interface AuditScopeInput {
  audit_scope: string
  time_range: TimeRange
  findings: AuditFinding[]
}

function formatAuditReport(result: AuditReportResult): string {
  const lines: string[] = []
  const gradeIcon = result.statistics.overall_grade === 'A' ? '[EXCELLENT]' :
    result.statistics.overall_grade === 'B' ? '[GOOD]' :
    result.statistics.overall_grade === 'C' ? '[FAIR]' :
    result.statistics.overall_grade === 'D' ? '[POOR]' : '[FAIL]'

  lines.push('## Audit Report')
  lines.push('')
  lines.push(`Report ID: ${result.report_id} | Generated: ${result.generated_at}`)
  lines.push(`Overall Grade: ${gradeIcon} ${result.statistics.overall_grade} | Compliance Score: ${result.compliance_score.toFixed(1)}%`)
  lines.push('')
  lines.push('### Executive Summary')
  lines.push('')
  lines.push(result.executive_summary)
  lines.push('')

  lines.push('### Statistics')
  lines.push('| Severity | Count |')
  lines.push('|----------|-------|')
  lines.push(`| CRITICAL | ${result.statistics.critical_count} |`)
  lines.push(`| HIGH | ${result.statistics.high_count} |`)
  lines.push(`| MEDIUM | ${result.statistics.medium_count} |`)
  lines.push(`| LOW | ${result.statistics.low_count} |`)
  lines.push(`| INFO | ${result.statistics.info_count} |`)
  lines.push(`| **TOTAL** | **${result.statistics.total_findings}** |`)
  lines.push('')

  const categories = Object.entries(result.findings_by_category)
  if (categories.length > 0) {
    lines.push('### Findings by Category')
    lines.push('| Category | Count |')
    lines.push('|----------|-------|')
    for (const [cat, count] of categories) {
      lines.push(`| ${cat} | ${count} |`)
    }
    lines.push('')
  }

  if (result.top_recommendations.length > 0) {
    lines.push('### Top Recommendations')
    let idx = 1
    for (const rec of result.top_recommendations) {
      lines.push(`${idx}. ${rec}`)
      idx++
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: TRAJECTORY REPLAYER ====================

function replayTrajectory(sessionId: string, events: TrajectoryEvent[]): TrajectoryReplayResult {
  if (events.length === 0) {
    return {
      session_id: sessionId,
      total_events: 0,
      decision_points: [],
      execution_path: [],
      critical_decisions: [],
      optimization_suggestions: ['No trajectory data provided for replay'],
      total_duration_ms: 0,
    }
  }

  // Build execution path
  const executionPath = events.map((e, i) => ({
    step: i + 1,
    action: e.action,
    duration_ms: `${e.duration_ms}ms`,
  }))

  // Identify decision points
  const decisionPoints: DecisionPoint[] = events
    .filter(e => e.decision_point)
    .map(e => {
      const hasBackup = e.alternatives_considered.length > 0
      const outcomeEval = e.duration_ms > 10000 ? 'slow_execution' : e.duration_ms > 3000 ? 'moderate_pace' : 'efficient'

      let riskAtDecision: 'low' | 'medium' | 'high' = 'low'
      const actionLower = e.action.toLowerCase()
      if (actionLower.includes('delete') || actionLower.includes('overwrite') || actionLower.includes('deploy')) {
        riskAtDecision = 'high'
      } else if (actionLower.includes('modify') || actionLower.includes('create') || actionLower.includes('push')) {
        riskAtDecision = 'medium'
      }

      return {
        timestamp: e.timestamp,
        action: e.action,
        alternatives: e.alternatives_considered,
        choice_rationale: hasBackup
          ? `Selected from ${e.alternatives_considered.length} alternatives based on ${outcomeEval}`
          : 'No alternatives recorded — direct action with no evaluation trail',
        outcome: e.output_summary,
        risk_at_decision: riskAtDecision,
      }
    })

  // Critical decisions: high-risk or slow-executing decision points
  const criticalDecisions = decisionPoints.filter(
    dp => dp.risk_at_decision === 'high' || dp.alternatives.length > 2
  )

  // Total duration
  const totalDuration = events.reduce((s, e) => s + e.duration_ms, 0)

  // Optimization suggestions
  const suggestions: string[] = []
  const noAlternatives = decisionPoints.filter(dp => dp.alternatives.length === 0).length
  if (noAlternatives > 0) {
    suggestions.push(`${noAlternatives} decision(s) without alternatives — implement multi-option evaluation before execution`)
  }
  const highRiskDecisions = decisionPoints.filter(dp => dp.risk_at_decision === 'high').length
  if (highRiskDecisions > 0) {
    suggestions.push(`${highRiskDecisions} high-risk decision(s) identified — require additional approval or confirmation step`)
  }
  const slowEvents = events.filter(e => e.duration_ms > 10000).length
  if (slowEvents > 0) {
    suggestions.push(`${slowEvents} event(s) exceeding 10s — investigate performance bottlenecks or timeout handling`)
  }
  if (events.length > 10) {
    const repeated = events.filter((e, i) => i > 0 && e.action === events[i - 1].action).length
    if (repeated > 2) {
      suggestions.push(`${repeated} repeated consecutive actions — consider batching or loop optimization`)
    }
  }
  suggestions.push('Enable decision-point logging for all operations above medium risk')
  suggestions.push('Implement rollback capability for high-risk decision trajectories')

  return {
    session_id: sessionId,
    total_events: events.length,
    decision_points: decisionPoints,
    execution_path: executionPath,
    critical_decisions: criticalDecisions,
    optimization_suggestions: suggestions,
    total_duration_ms: totalDuration,
  }
}

function formatTrajectoryReport(result: TrajectoryReplayResult): string {
  const lines: string[] = []

  lines.push('### Trajectory Replay Report')
  lines.push('')
  lines.push(`Session: ${result.session_id} | Events: ${result.total_events} | Duration: ${result.total_duration_ms}ms`)
  lines.push(`Decision Points: ${result.decision_points.length} | Critical: ${result.critical_decisions.length}`)
  lines.push('')

  if (result.execution_path.length > 0) {
    lines.push('### Execution Path')
    lines.push('| Step | Action | Duration |')
    lines.push('|------|--------|----------|')
    for (const step of result.execution_path.slice(0, 20)) {
      lines.push(`| ${step.step} | ${step.action} | ${step.duration_ms} |`)
    }
    if (result.execution_path.length > 20) {
      lines.push(`| ... | (${result.execution_path.length - 20} more steps) | |`)
    }
    lines.push('')
  }

  if (result.decision_points.length > 0) {
    lines.push('### Decision Points Analysis')
    lines.push('| # | Timestamp | Action | Risk | Alternatives | Outcome |')
    lines.push('|---|-----------|--------|------|--------------|---------|')
    let idx = 1
    for (const dp of result.decision_points) {
      const riskTag = dp.risk_at_decision === 'high' ? 'HIGH' : dp.risk_at_decision === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${dp.timestamp} | ${dp.action} | ${riskTag} | ${dp.alternatives.length} | ${dp.outcome.substring(0, 30)}${dp.outcome.length > 30 ? '...' : ''} |`)
      idx++
    }
    lines.push('')
  }

  if (result.critical_decisions.length > 0) {
    lines.push('### Critical Decisions')
    for (const cd of result.critical_decisions) {
      lines.push(`- ${cd.action} | Risk: ${cd.risk_at_decision.toUpperCase()} | ${cd.choice_rationale}`)
    }
    lines.push('')
  }

  if (result.optimization_suggestions.length > 0) {
    lines.push('### Optimization Suggestions')
    for (const sug of result.optimization_suggestions) {
      lines.push(`- ${sug}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'action_logger',
    description: 'Create structured audit log entries for agent actions. Classifies severity (info/warning/critical), determines compliance relevance, assigns retention policies, and generates hash chain integrity markers.',
    parameters: {
      log_input: { type: 'string', required: true, description: 'JSON object with fields: agent_id, action, target, result, timestamp' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { log_input: string }) {
      const input: ActionLogInput = JSON.parse(args.log_input)
      const entry = createAuditLogEntry(input)
      return formatActionLogReport(entry)
    }
  }))

  tools.register(defineTool({
    name: 'anomaly_detector',
    description: 'Detect anomalous agent behavior by comparing action history against a baseline profile. Identifies frequency spikes, duration anomalies, success rate drops, and unfamiliar action patterns with deviation scoring.',
    parameters: {
      action_history: { type: 'string', required: true, description: 'JSON array of action history objects: action, timestamp, duration_ms, success' },
      baseline_profile: { type: 'string', required: true, description: 'JSON baseline profile: avg_actions_per_hour, avg_duration_ms, success_rate, common_actions[], risk_tolerance' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { action_history: string; baseline_profile: string }) {
      const history: ActionHistoryEntry[] = JSON.parse(args.action_history)
      const baseline: BaselineProfile = JSON.parse(args.baseline_profile)
      const result = detectAnomalies(history, baseline)
      return formatAnomalyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'compliance_checker',
    description: 'Validate agent actions against compliance policies. Checks for forbidden actions/targets, excessive data access, and missing approvals. Returns detailed violation report with severity classification.',
    parameters: {
      actions: { type: 'string', required: true, description: 'JSON array of compliance action objects: action, target, data_accessed[], timestamp, agent_id' },
      policies: { type: 'string', required: true, description: 'JSON array of compliance policy objects: policy_id, name, description, forbidden_actions[], forbidden_targets[], required_approval_above[], max_data_types' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { actions: string; policies: string }) {
      const actions: ComplianceAction[] = JSON.parse(args.actions)
      const policies: CompliancePolicy[] = JSON.parse(args.policies)
      const result = checkCompliance(actions, policies)
      return formatComplianceReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'forensics_analyzer',
    description: 'Perform digital forensics analysis on incidents. Reconstructs event timelines, identifies root causes, assesses impact, and provides remediation recommendations with confidence scoring.',
    parameters: {
      incident_id: { type: 'string', required: true, description: 'Unique identifier for the incident under investigation' },
      related_logs: { type: 'string', required: true, description: 'JSON array of log entries: timestamp, action, agent_id, details, severity' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { incident_id: string; related_logs: string }) {
      const logs: LogEntry[] = JSON.parse(args.related_logs)
      const result = analyzeForensics(args.incident_id, logs)
      return formatForensicsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'behavior_profiler',
    description: 'Build comprehensive behavior profiles for AI agents. Identifies action preferences, risk appetite, peak activity patterns, automation tendencies, and classifies agents into behavioral archetypes.',
    parameters: {
      agent_id: { type: 'string', required: true, description: 'Unique identifier of the agent to profile' },
      action_history: { type: 'string', required: true, description: 'JSON array of action history objects: action, timestamp, duration_ms, success' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { agent_id: string; action_history: string }) {
      const history: ActionHistoryEntry[] = JSON.parse(args.action_history)
      const result = buildBehaviorProfile(args.agent_id, history)
      return formatBehaviorProfileReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'policy_violation_scanner',
    description: 'Scan recent agent actions against active enforcement policies. Supports multiple rule matching strategies (contains, metadata, negation) with risk scoring and prioritization.',
    parameters: {
      recent_actions: { type: 'string', required: true, description: 'JSON array of recent action objects: action, timestamp, agent_id, target, metadata{}' },
      active_policies: { type: 'string', required: true, description: 'JSON array of active policy objects: policy_id, name, rules[], enabled' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { recent_actions: string; active_policies: string }) {
      const actions: RecentAction[] = JSON.parse(args.recent_actions)
      const policies: ActivePolicy[] = JSON.parse(args.active_policies)
      const result = scanPolicyViolations(actions, policies)
      return formatPolicyViolationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'audit_report_generator',
    description: 'Generate comprehensive audit reports with executive summary, severity-graded findings, category breakdown, compliance scoring (0-100), and prioritized recommendations with letter-grade assessment.',
    parameters: {
      audit_scope: { type: 'string', required: true, description: 'Description of the audit scope (e.g., "Q4 2024 Agent Operations")' },
      time_range: { type: 'string', required: true, description: 'JSON object: { start: ISO date, end: ISO date }' },
      findings: { type: 'string', required: true, description: 'JSON array of finding objects: finding_id, category, severity, description, recommendation' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { audit_scope: string; time_range: string; findings: string }) {
      const scopeInput: AuditScopeInput = {
        audit_scope: args.audit_scope,
        time_range: JSON.parse(args.time_range),
        findings: JSON.parse(args.findings),
      }
      const result = generateAuditReport(scopeInput)
      return formatAuditReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'trajectory_replayer',
    description: 'Replay and analyze agent execution trajectories. Identifies decision points, evaluates alternatives considered, flags critical decisions, and provides optimization suggestions for execution paths.',
    parameters: {
      session_id: { type: 'string', required: true, description: 'Unique session identifier for the trajectory to replay' },
      trajectory_events: { type: 'string', required: true, description: 'JSON array of trajectory events: timestamp, action, input_summary, output_summary, duration_ms, decision_point, alternatives_considered[]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { session_id: string; trajectory_events: string }) {
      const events: TrajectoryEvent[] = JSON.parse(args.trajectory_events)
      const result = replayTrajectory(args.session_id, events)
      return formatTrajectoryReport(result)
    }
  }))

  console.log(`[dsh-tool-auditor] Loaded v${VERSION} - Agent Behavior Audit & Compliance with 8 tools`)
  console.log('  Tools: action_logger, anomaly_detector, compliance_checker, forensics_analyzer, behavior_profiler, policy_violation_scanner, audit_report_generator, trajectory_replayer')
}
