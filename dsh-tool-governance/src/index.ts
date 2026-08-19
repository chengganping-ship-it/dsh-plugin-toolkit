/**
 * DSH Agent Security Governance Plugin v0.1.0
 *
 * Agent compliance auditing, permission management, and safety guardrails toolkit for DeepSeek Harness Agent.
 * Inspired by agent-governance-toolkit (GitHub trending) and Microsoft MXC from Build 2026.
 *
 * Features (v0.1.0):
 * - Permission Auditor (overprivileged tool detection, least-privilege recommendations)
 * - Compliance Checker (GDPR/HIPAA/SOC2/PCI violation detection and remediation)
 * - Guardrail Designer (safety rule generation, escalation triggers, override procedures)
 * - Audit Trail Generator (session log integrity hashing, anomaly detection, timeline)
 * - Data Leak Detector (sensitive pattern detection, masking recommendations)
 * - Tool Sandbox Scorer (isolation level assessment, resource limits, monitoring rules)
 * - Prompt Injection Detector (attack classification, sanitization, block recommendations)
 * - Governance Maturity Assessor (org practice scoring, gap analysis, improvement roadmap)
 *
 * @module dsh-tool-governance
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-governance'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface AgentConfig {
  tools: string[]
  access_scopes: string[]
  data_permissions: string[]
}

interface PermissionAnalysis {
  overprivileged_tools: Array<{ tool: string; reason: string; recommendation: string }>
  least_privilege_recommendations: Array<{ tool: string; current: string[]; recommended: string[] }>
  risk_score: number
  summary: string
}

interface AgentAction {
  action: string
  target: string
  data_type: string
  timestamp: string
}

interface ComplianceViolation {
  regulation: string
  violation: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action_reference: string
  remediation: string
}

interface ComplianceResult {
  compliance_violations: ComplianceViolation[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  remediation_steps: string[]
  summary: string
}

interface GuardrailRule {
  rule_id: string
  condition: string
  action: 'block' | 'warn' | 'escalate' | 'log'
  description: string
}

interface GuardrailDesign {
  guardrail_rules: GuardrailRule[]
  escalation_triggers: Array<{ trigger: string; severity: string; response: string }>
  override_procedures: Array<{ scenario: string; approver: string; conditions: string }>
  summary: string
}

interface SessionEntry {
  timestamp: string
  action: string
  tool: string
  input_summary: string
  output_summary: string
}

interface AuditReport {
  integrity_hash: string
  anomaly_flags: Array<{ timestamp: string; description: string; severity: string }>
  timeline: Array<{ timestamp: string; event: string; tool: string }>
  compliance_status: 'compliant' | 'warnings' | 'violations'
  summary: string
}

interface LeakDetectionResult {
  leak_risk_score: number
  detected_patterns: Array<{ pattern: string; count: number; context: string }>
  masking_recommendations: Array<{ original: string; masked: string; technique: string }>
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  summary: string
}

interface ToolManifest {
  name: string
  permissions: string[]
  network_access: boolean
  file_system_access: boolean
}

interface SandboxRecommendation {
  sandbox_recommendation: string
  isolation_level: 'none' | 'light' | 'moderate' | 'strict' | 'maximum'
  resource_limits: { cpu: string; memory: string; network: string; filesystem: string }
  monitoring_rules: Array<{ metric: string; threshold: string; action: string }>
  summary: string
}

interface InjectionDetectionResult {
  injection_risk: 'none' | 'low' | 'medium' | 'high' | 'critical'
  attack_type: string
  sanitization_recommendation: string
  block_recommendation: boolean
  details: string
}

interface OrgPractices {
  policies: string[]
  training: string[]
  monitoring: string[]
  incident_response: string[]
}

interface MaturityAssessment {
  maturity_score: number
  gap_analysis: Array<{ area: string; current: number; target: number; gap: number }>
  improvement_roadmap: Array<{ phase: string; actions: string[]; timeline: string }>
  benchmarking: { percentile: number; industry_avg: number; best_in_class: number }
  summary: string
}

// ==================== TOOL 1: PERMISSION AUDITOR ====================

function auditPermissions(config: AgentConfig): PermissionAnalysis {
  const overprivileged: PermissionAnalysis['overprivileged_tools'] = []
  const recommendations: PermissionAnalysis['least_privilege_recommendations'] = []

  const highRiskTools = ['file_delete', 'system_exec', 'database_write', 'admin_access', 'user_impersonation', 'network_request', 'shell_exec', 'registry_write']
  const mediumRiskTools = ['file_read', 'database_read', 'email_send', 'api_call', 'webhook_trigger']

  for (const tool of config.tools) {
    if (highRiskTools.includes(tool)) {
      overprivileged.push({
        tool,
        reason: 'High-risk tool with potential for irreversible system changes or data exposure',
        recommendation: 'Require explicit user confirmation before execution; scope to specific resources'
      })
    } else if (mediumRiskTools.includes(tool) && config.data_permissions.length > 3) {
      overprivileged.push({
        tool,
        reason: 'Medium-risk tool combined with broad data permissions increases blast radius',
        recommendation: 'Restrict data access to minimum required datasets'
      })
    }
  }

  if (config.access_scopes.includes('*') || config.access_scopes.includes('all')) {
    overprivileged.push({
      tool: 'global',
      reason: 'Wildcard access scope grants unrestricted access to all resources',
      recommendation: 'Replace wildcard with explicit resource-level scopes'
    })
  }

  for (const tool of config.tools) {
    const currentPerms = config.data_permissions
    if (currentPerms.length > 3) {
      recommendations.push({
        tool,
        current: currentPerms,
        recommended: currentPerms.slice(0, 2)
      })
    }
  }

  const riskScore = Math.min(
    (overprivileged.length * 15) +
    (config.access_scopes.includes('*') ? 30 : 0) +
    (config.data_permissions.length > 5 ? 20 : config.data_permissions.length * 3),
    100
  )

  return {
    overprivileged_tools: overprivileged,
    least_privilege_recommendations: recommendations,
    risk_score: riskScore,
    summary: `Analyzed ${config.tools.length} tools, ${config.access_scopes.length} access scopes, ${config.data_permissions.length} data permissions. Found ${overprivileged.length} overprivileged areas. Risk score: ${riskScore}/100.`
  }
}

function formatPermissionReport(result: PermissionAnalysis): string {
  const lines: string[] = []
  lines.push('## Permission Audit Report')
  lines.push('')
  lines.push(`**Risk Score:** ${result.risk_score}/100`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  if (result.overprivileged_tools.length > 0) {
    lines.push('### Overprivileged Tools')
    lines.push('| Tool | Reason | Recommendation |')
    lines.push('|------|--------|----------------|')
    for (const o of result.overprivileged_tools) {
      lines.push(`| ${o.tool} | ${o.reason} | ${o.recommendation} |`)
    }
    lines.push('')
  }

  if (result.least_privilege_recommendations.length > 0) {
    lines.push('### Least Privilege Recommendations')
    for (const r of result.least_privilege_recommendations) {
      lines.push(`- **${r.tool}**: Reduce from [${r.current.join(', ')}] to [${r.recommended.join(', ')}]`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: COMPLIANCE CHECKER ====================

function checkCompliance(actions: AgentAction[], regulations: string[]): ComplianceResult {
  const violations: ComplianceViolation[] = []
  const remediation: string[] = []

  const gdprSensitiveTypes = ['pii', 'health', 'biometric', 'genetic', 'children_data']
  const hipaaSensitiveTypes = ['phi', 'medical_record', 'diagnosis', 'treatment', 'insurance']
  const pciSensitiveTypes = ['credit_card', 'payment', 'cvv', 'bank_account', 'transaction']
  const soc2SensitiveTypes = ['financial', 'audit_log', 'access_control', 'encryption_key']

  for (const action of actions) {
    const dtype = action.data_type.toLowerCase()

    if (regulations.includes('GDPR')) {
      if (gdprSensitiveTypes.some(t => dtype.includes(t))) {
        if (action.action.includes('share') || action.action.includes('export') || action.action.includes('transfer')) {
          violations.push({
            regulation: 'GDPR',
            violation: `Data transfer of ${action.data_type} without explicit consent mechanism`,
            severity: 'critical',
            action_reference: `${action.action} -> ${action.target}`,
            remediation: 'Implement explicit consent collection before data transfer; document legal basis'
          })
        }
      }
      if (action.target.includes('external') || action.target.includes('third-party')) {
        violations.push({
          regulation: 'GDPR',
          violation: `Potential cross-border data transfer of ${action.data_type}`,
          severity: 'high',
          action_reference: `${action.action} -> ${action.target}`,
          remediation: 'Verify adequacy decision or implement Standard Contractual Clauses (SCCs)'
        })
      }
    }

    if (regulations.includes('HIPAA')) {
      if (hipaaSensitiveTypes.some(t => dtype.includes(t))) {
        if (!action.action.includes('encrypt') && !action.action.includes('audit')) {
          violations.push({
            regulation: 'HIPAA',
            violation: `PHI access without encryption/audit safeguards: ${action.data_type}`,
            severity: 'critical',
            action_reference: `${action.action} -> ${action.target}`,
            remediation: 'Apply AES-256 encryption at rest and TLS 1.3 in transit; enable audit logging'
          })
        }
      }
    }

    if (regulations.includes('PCI')) {
      if (pciSensitiveTypes.some(t => dtype.includes(t))) {
        violations.push({
          regulation: 'PCI-DSS',
          violation: `Payment data handling requires PCI compliance: ${action.data_type}`,
          severity: 'critical',
          action_reference: `${action.action} -> ${action.target}`,
          remediation: 'Tokenize payment data; ensure PCI-DSS Level 1 compliance for storage/processing'
        })
      }
    }

    if (regulations.includes('SOC2')) {
      if (soc2SensitiveTypes.some(t => dtype.includes(t))) {
        if (action.action.includes('delete') || action.action.includes('modify')) {
          violations.push({
            regulation: 'SOC2',
            violation: `Sensitive data modification without change control: ${action.data_type}`,
            severity: 'medium',
            action_reference: `${action.action} -> ${action.target}`,
            remediation: 'Implement change management approval workflow; maintain audit trail'
          })
        }
      }
    }
  }

  const criticalCount = violations.filter(v => v.severity === 'critical').length
  const highCount = violations.filter(v => v.severity === 'high').length
  let riskLevel: ComplianceResult['risk_level'] = 'low'
  if (criticalCount > 0) riskLevel = 'critical'
  else if (highCount > 0) riskLevel = 'high'
  else if (violations.length > 0) riskLevel = 'medium'

  if (violations.length > 0) {
    remediation.push('1. Immediately review and address all critical violations')
    remediation.push('2. Implement data classification and handling policies')
    remediation.push('3. Deploy automated compliance monitoring for agent actions')
    remediation.push('4. Conduct regular compliance audits (quarterly recommended)')
    remediation.push('5. Establish incident response procedures for data breaches')
  } else {
    remediation.push('No violations detected. Continue monitoring and maintain current controls.')
  }

  return {
    compliance_violations: violations,
    risk_level: riskLevel,
    remediation_steps: remediation,
    summary: `Checked ${actions.length} actions against ${regulations.join(', ')}. Found ${violations.length} violations (${criticalCount} critical, ${highCount} high). Risk level: ${riskLevel}.`
  }
}

function formatComplianceReport(result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('## Compliance Check Report')
  lines.push('')
  lines.push(`**Risk Level:** ${result.risk_level.toUpperCase()}`)
  lines.push(result.summary)
  lines.push('')

  if (result.compliance_violations.length > 0) {
    lines.push('### Violations')
    lines.push('| Regulation | Severity | Violation | Action | Remediation |')
    lines.push('|------------|----------|-----------|--------|-------------|')
    for (const v of result.compliance_violations) {
      lines.push(`| ${v.regulation} | ${v.severity.toUpperCase()} | ${v.violation} | ${v.action_reference} | ${v.remediation} |`)
    }
    lines.push('')
  }

  lines.push('### Remediation Steps')
  for (const step of result.remediation_steps) {
    lines.push(`- ${step}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: GUARDRAIL DESIGNER ====================

function designGuardrails(useCase: string, riskTolerance: string, capabilities: string[]): GuardrailDesign {
  const rules: GuardrailRule[] = []
  const escalations: GuardrailDesign['escalation_triggers'] = []
  const overrides: GuardrailDesign['override_procedures'] = []

  // Base rules for all use cases
  rules.push({
    rule_id: 'GR-001',
    condition: 'action_involves_pii',
    action: 'warn',
    description: 'Warn before processing personally identifiable information'
  })
  rules.push({
    rule_id: 'GR-002',
    condition: 'external_communication_detected',
    action: 'escalate',
    description: 'Escalate when agent attempts to send data to external endpoints'
  })

  if (riskTolerance === 'low') {
    rules.push({
      rule_id: 'GR-003',
      condition: 'file_system_write',
      action: 'block',
      description: 'Block all file system write operations without explicit approval'
    })
    rules.push({
      rule_id: 'GR-004',
      condition: 'network_request',
      action: 'block',
      description: 'Block outbound network requests; require allowlist approval'
    })
    rules.push({
      rule_id: 'GR-005',
      condition: 'code_execution',
      action: 'block',
      description: 'Block dynamic code execution in production environments'
    })
    escalations.push({ trigger: 'any_blocked_action', severity: 'high', response: 'Notify security team and pause agent session' })
    escalations.push({ trigger: 'repeated_violation_3x', severity: 'critical', response: 'Terminate session and require re-authorization' })
  } else if (riskTolerance === 'medium') {
    rules.push({
      rule_id: 'GR-003',
      condition: 'file_system_write',
      action: 'warn',
      description: 'Log and warn on file system write operations'
    })
    rules.push({
      rule_id: 'GR-004',
      condition: 'sensitive_data_access',
      action: 'escalate',
      description: 'Escalate access to sensitive data categories'
    })
    escalations.push({ trigger: 'sensitive_data_bulk_access', severity: 'high', response: 'Require manager approval to continue' })
    escalations.push({ trigger: 'unusual_pattern_detected', severity: 'medium', response: 'Log for review and notify team lead' })
  } else {
    rules.push({
      rule_id: 'GR-003',
      condition: 'destructive_operation',
      action: 'warn',
      description: 'Warn before irreversible operations'
    })
    rules.push({
      rule_id: 'GR-004',
      condition: 'data_exfiltration_pattern',
      action: 'block',
      description: 'Block detected data exfiltration patterns'
    })
    escalations.push({ trigger: 'confirmed_data_exfiltration', severity: 'critical', response: 'Immediately terminate and isolate agent' })
  }

  // Capability-specific rules
  for (const cap of capabilities) {
    if (cap.includes('database') || cap.includes('sql')) {
      rules.push({
        rule_id: `GR-DB-${rules.length + 1}`,
        condition: 'database_query_without_filter',
        action: riskTolerance === 'low' ? 'block' : 'warn',
        description: 'Prevent unfiltered database queries that could expose bulk records'
      })
    }
    if (cap.includes('email') || cap.includes('message')) {
      rules.push({
        rule_id: `GR-COM-${rules.length + 1}`,
        condition: 'bulk_communication',
        action: 'escalate',
        description: 'Escalate bulk email/messaging operations'
      })
    }
  }

  overrides.push({
    scenario: 'Emergency data recovery',
    approver: 'Security Team Lead + Data Owner',
    conditions: 'Documented emergency ticket, time-limited access (4 hours), full audit trail'
  })
  overrides.push({
    scenario: 'Pre-approved automated workflow',
    approver: 'Workflow Owner',
    conditions: 'Workflow registered in approved catalog, scope verified, periodic re-authorization'
  })

  return {
    guardrail_rules: rules,
    escalation_triggers: escalations,
    override_procedures: overrides,
    summary: `Designed ${rules.length} guardrail rules, ${escalations.length} escalation triggers, and ${overrides.length} override procedures for "${useCase}" with ${riskTolerance} risk tolerance.`
  }
}

function formatGuardrailReport(result: GuardrailDesign): string {
  const lines: string[] = []
  lines.push('## Guardrail Design Report')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Guardrail Rules')
  lines.push('| Rule ID | Condition | Action | Description |')
  lines.push('|---------|-----------|--------|-------------|')
  for (const r of result.guardrail_rules) {
    lines.push(`| ${r.rule_id} | ${r.condition} | ${r.action.toUpperCase()} | ${r.description} |`)
  }
  lines.push('')

  lines.push('### Escalation Triggers')
  for (const e of result.escalation_triggers) {
    lines.push(`- **${e.trigger}** (${e.severity}): ${e.response}`)
  }
  lines.push('')

  lines.push('### Override Procedures')
  for (const o of result.override_procedures) {
    lines.push(`- **${o.scenario}**: Approver: ${o.approver}. Conditions: ${o.conditions}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: AUDIT TRAIL GENERATOR ====================

function generateAuditTrail(sessionLog: SessionEntry[]): AuditReport {
  const anomalies: AuditReport['anomaly_flags'] = []
  const timeline: AuditReport['timeline'] = []

  for (const entry of sessionLog) {
    timeline.push({
      timestamp: entry.timestamp,
      event: entry.action,
      tool: entry.tool
    })
  }

  // Detect anomalies
  const toolUsage = new Map<string, number>()
  for (const entry of sessionLog) {
    toolUsage.set(entry.tool, (toolUsage.get(entry.tool) ?? 0) + 1)

    // Detect sensitive actions
    if (entry.action.includes('delete') || entry.action.includes('drop') || entry.action.includes('truncate')) {
      anomalies.push({
        timestamp: entry.timestamp,
        description: `Destructive action detected: ${entry.action} via ${entry.tool}`,
        severity: 'high'
      })
    }
    if (entry.output_summary.includes('error') || entry.output_summary.includes('unauthorized')) {
      anomalies.push({
        timestamp: entry.timestamp,
        description: `Error/unauthorized response from ${entry.tool}: ${entry.output_summary.substring(0, 80)}`,
        severity: 'medium'
      })
    }
  }

  // Detect unusual tool usage frequency
  for (const [tool, count] of toolUsage) {
    if (count > sessionLog.length * 0.5 && sessionLog.length > 5) {
      anomalies.push({
        timestamp: sessionLog[sessionLog.length - 1].timestamp,
        description: `Tool "${tool}" used in ${(count / sessionLog.length * 100).toFixed(0)}% of actions — potential over-reliance`,
        severity: 'low'
      })
    }
  }

  // Generate integrity hash (simple deterministic hash)
  const hashInput = sessionLog.map(e => `${e.timestamp}${e.action}${e.tool}`).join('|')
  let hash = 0
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const integrityHash = Math.abs(hash).toString(16).padStart(8, '0')

  const hasHigh = anomalies.some(a => a.severity === 'high')
  const hasMedium = anomalies.some(a => a.severity === 'medium')
  let status: AuditReport['compliance_status'] = 'compliant'
  if (hasHigh) status = 'violations'
  else if (hasMedium) status = 'warnings'

  return {
    integrity_hash: integrityHash,
    anomaly_flags: anomalies,
    timeline,
    compliance_status: status,
    summary: `Generated audit trail for ${sessionLog.length} session entries. Integrity hash: ${integrityHash}. Found ${anomalies.length} anomalies. Status: ${status}.`
  }
}

function formatAuditReport(result: AuditReport): string {
  const lines: string[] = []
  lines.push('## Audit Trail Report')
  lines.push('')
  lines.push(`**Integrity Hash:** \`${result.integrity_hash}\` | **Status:** ${result.compliance_status.toUpperCase()}`)
  lines.push(result.summary)
  lines.push('')

  if (result.anomaly_flags.length > 0) {
    lines.push('### Anomaly Flags')
    lines.push('| Timestamp | Severity | Description |')
    lines.push('|-----------|----------|-------------|')
    for (const a of result.anomaly_flags) {
      lines.push(`| ${a.timestamp} | ${a.severity.toUpperCase()} | ${a.description} |`)
    }
    lines.push('')
  }

  lines.push('### Timeline')
  for (const t of result.timeline.slice(0, 20)) {
    lines.push(`- \`${t.timestamp}\` | ${t.event} | via ${t.tool}`)
  }
  if (result.timeline.length > 20) {
    lines.push(`- ... and ${result.timeline.length - 20} more entries`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: DATA LEAK DETECTOR ====================

function detectDataLeaks(agentOutput: string, sensitivePatterns?: string[]): LeakDetectionResult {
  const detected: LeakDetectionResult['detected_patterns'] = []
  const masking: LeakDetectionResult['masking_recommendations'] = []

  const defaultPatterns = [
    { pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', name: 'SSN' },
    { pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b', name: 'Credit Card' },
    { pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', name: 'Email' },
    { pattern: '\\b\\d{3}-\\d{3}-\\d{4}\\b', name: 'Phone Number' },
    { pattern: '\\b(?:api[_-]?key|secret|password|token)\\s*[:=]\\s*["\']?[^\\s"\'{}]+["\']?', name: 'Credential' },
    { pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', name: 'IP Address' },
    { pattern: '\\b[A-Z]{2}\\d{6,10}\\b', name: 'ID Number' },
  ]

  const patternsToCheck = sensitivePatterns
    ? sensitivePatterns.map(p => ({ pattern: p, name: 'Custom' }))
    : defaultPatterns

  for (const p of patternsToCheck) {
    const regex = new RegExp(p.pattern, 'gi')
    const matches = agentOutput.match(regex)
    if (matches && matches.length > 0) {
      detected.push({
        pattern: p.name,
        count: matches.length,
        context: matches[0].substring(0, 30) + (matches[0].length > 30 ? '...' : '')
      })

      // Generate masking recommendation
      const sample = matches[0]
      let masked: string
      let technique: string
      if (p.name === 'Email') {
        masked = sample.replace(/(?<=.{2}).(?=.*@)/g, '*')
        technique = 'Partial masking (show first 2 chars and domain)'
      } else if (p.name === 'Credit Card') {
        masked = sample.replace(/.(?=.{4})/g, '*')
        technique = 'Show last 4 digits only'
      } else if (p.name === 'SSN') {
        masked = '***-**-' + sample.slice(-4)
        technique = 'Show last 4 digits only'
      } else {
        masked = sample.replace(/./g, '*')
        technique = 'Full redaction'
      }
      masking.push({ original: sample, masked, technique })
    }
  }

  const riskScore = Math.min(detected.reduce((sum, d) => sum + d.count * 10, 0), 100)
  let severity: LeakDetectionResult['severity'] = 'none'
  if (riskScore > 70) severity = 'critical'
  else if (riskScore > 40) severity = 'high'
  else if (riskScore > 20) severity = 'medium'
  else if (riskScore > 0) severity = 'low'

  return {
    leak_risk_score: riskScore,
    detected_patterns: detected,
    masking_recommendations: masking,
    severity,
    summary: `Scanned output for ${patternsToCheck.length} sensitive patterns. Found ${detected.length} pattern types with ${detected.reduce((s, d) => s + d.count, 0)} total matches. Risk: ${severity} (${riskScore}/100).`
  }
}

function formatLeakReport(result: LeakDetectionResult): string {
  const lines: string[] = []
  lines.push('## Data Leak Detection Report')
  lines.push('')
  lines.push(`**Risk Score:** ${result.leak_risk_score}/100 | **Severity:** ${result.severity.toUpperCase()}`)
  lines.push(result.summary)
  lines.push('')

  if (result.detected_patterns.length > 0) {
    lines.push('### Detected Patterns')
    lines.push('| Pattern Type | Count | Sample Context |')
    lines.push('|--------------|-------|----------------|')
    for (const d of result.detected_patterns) {
      lines.push(`| ${d.pattern} | ${d.count} | ${d.context} |`)
    }
    lines.push('')

    lines.push('### Masking Recommendations')
    lines.push('| Original | Masked | Technique |')
    lines.push('|----------|--------|-----------|')
    for (const m of result.masking_recommendations) {
      lines.push(`| ${m.original} | ${m.masked} | ${m.technique} |`)
    }
  } else {
    lines.push('No sensitive data patterns detected in agent output.')
  }

  return lines.join('\n')
}

// ==================== TOOL 6: TOOL SANDBOX SCORER ====================

function scoreSandbox(toolManifest: ToolManifest): SandboxRecommendation {
  let riskPoints = 0
  const monitoring: SandboxRecommendation['monitoring_rules'] = []

  // Score based on permissions
  const highRiskPerms = ['file_write', 'system_exec', 'network', 'admin', 'root', 'registry']
  const medRiskPerms = ['file_read', 'process_spawn', 'environment', 'user_data']

  for (const perm of toolManifest.permissions) {
    if (highRiskPerms.some(p => perm.includes(p))) riskPoints += 20
    else if (medRiskPerms.some(p => perm.includes(p))) riskPoints += 10
    else riskPoints += 3
  }

  if (toolManifest.network_access) riskPoints += 25
  if (toolManifest.file_system_access) riskPoints += 20

  riskPoints = Math.min(riskPoints, 100)

  let isolation: SandboxRecommendation['isolation_level'] = 'none'
  let recommendation = ''
  let cpu = 'unlimited'
  let memory = 'unlimited'
  let network = 'unrestricted'
  let filesystem = 'unrestricted'

  if (riskPoints >= 70) {
    isolation = 'maximum'
    recommendation = 'Deploy in fully isolated container with no host access. Use gVisor or Firecracker microVM.'
    cpu = '1 core'
    memory = '512MB'
    network = 'deny all (explicit allowlist only)'
    filesystem = 'read-only root, tmpfs only'
  } else if (riskPoints >= 50) {
    isolation = 'strict'
    recommendation = 'Run in dedicated container with seccomp profiles and dropped capabilities.'
    cpu = '2 cores'
    memory = '1GB'
    network = 'egress-only to approved endpoints'
    filesystem = 'read-only with bounded volumes'
  } else if (riskPoints >= 30) {
    isolation = 'moderate'
    recommendation = 'Use namespace isolation with resource constraints and syscall filtering.'
    cpu = '4 cores'
    memory = '2GB'
    network = 'monitored with DNS filtering'
    filesystem = 'project-scoped access'
  } else if (riskPoints >= 15) {
    isolation = 'light'
    recommendation = 'Apply basic process isolation and resource limits.'
    cpu = 'unlimited'
    memory = '4GB'
    network = 'monitored'
    filesystem = 'user-scoped access'
  } else {
    isolation = 'none'
    recommendation = 'Standard execution environment sufficient. Apply basic monitoring.'
  }

  monitoring.push({ metric: 'cpu_usage', threshold: '80%', action: 'throttle' })
  monitoring.push({ metric: 'memory_usage', threshold: '90%', action: 'restart' })
  if (toolManifest.network_access) {
    monitoring.push({ metric: 'network_connections', threshold: '10/min', action: 'alert' })
    monitoring.push({ metric: 'dns_queries', threshold: '100/min', action: 'block' })
  }
  if (toolManifest.file_system_access) {
    monitoring.push({ metric: 'file_writes', threshold: '100/min', action: 'alert' })
    monitoring.push({ metric: 'file_reads_sensitive', threshold: '1', action: 'block_and_alert' })
  }

  return {
    sandbox_recommendation: recommendation,
    isolation_level: isolation,
    resource_limits: { cpu, memory, network, filesystem },
    monitoring_rules: monitoring,
    summary: `Tool "${toolManifest.name}" scored ${riskPoints}/100 risk points. Recommended isolation: ${isolation}. ${toolManifest.permissions.length} permissions evaluated.`
  }
}

function formatSandboxReport(result: SandboxRecommendation): string {
  const lines: string[] = []
  lines.push('## Tool Sandbox Score Report')
  lines.push('')
  lines.push(`**Isolation Level:** ${result.isolation_level.toUpperCase()}`)
  lines.push(result.summary)
  lines.push('')

  lines.push('### Recommendation')
  lines.push(result.sandbox_recommendation)
  lines.push('')

  lines.push('### Resource Limits')
  const rl = result.resource_limits
  lines.push(`- CPU: ${rl.cpu}`)
  lines.push(`- Memory: ${rl.memory}`)
  lines.push(`- Network: ${rl.network}`)
  lines.push(`- Filesystem: ${rl.filesystem}`)
  lines.push('')

  lines.push('### Monitoring Rules')
  lines.push('| Metric | Threshold | Action |')
  lines.push('|--------|-----------|--------|')
  for (const m of result.monitoring_rules) {
    lines.push(`| ${m.metric} | ${m.threshold} | ${m.action} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: PROMPT INJECTION DETECTOR ====================

function detectPromptInjection(userInput: string, context?: string): InjectionDetectionResult {
  const injectionPatterns = [
    { pattern: 'ignore (all |previous |above |your )?(instructions|rules|prompts|guidelines)', type: 'instruction_override', severity: 'critical' },
    { pattern: 'you are now|act as|pretend to be|roleplay as|from now on you', type: 'role_manipulation', severity: 'high' },
    { pattern: 'system:\\s|\\[system\\]|<<SYS>>|### (system|instruction|human|assistant)', type: 'system_prompt_leak', severity: 'critical' },
    { pattern: 'DAN|jailbreak|do anything now|no restrictions|without (rules|limits|filters)', type: 'jailbreak_attempt', severity: 'critical' },
    { pattern: 'repeat (after me|this|the following|word for word)|output (your|the) (prompt|instruction|system)', type: 'prompt_extraction', severity: 'high' },
    { pattern: 'base64|decode this|execute.*\\(|eval\\(|\\$\\{|\\`.*\\`', type: 'code_injection', severity: 'high' },
    { pattern: '<!--|-->|<!\\[CDATA\\[|\\]\\]>|&lt;|&gt;', type: 'markup_injection', severity: 'medium' },
    { pattern: '\\x00|\\x1b|\\u0000|\\u001b|%00|%1b', type: 'null_byte_injection', severity: 'medium' },
    { pattern: 'new instructions|updated rules|override|supersede|disregard', type: 'instruction_manipulation', severity: 'high' },
    { pattern: 'http[s]?://|ftp://|file://|data:text', type: 'url_injection', severity: 'medium' },
  ]

  let highestSeverity: InjectionDetectionResult['injection_risk'] = 'none'
  let detectedType = 'none'
  let details = ''

  const severityOrder = ['none', 'low', 'medium', 'high', 'critical']

  for (const p of injectionPatterns) {
    const regex = new RegExp(p.pattern, 'i')
    if (regex.test(userInput)) {
      const sevIdx = severityOrder.indexOf(p.severity)
      const currentIdx = severityOrder.indexOf(highestSeverity)
      if (sevIdx > currentIdx) {
        highestSeverity = p.severity as InjectionDetectionResult['injection_risk']
        detectedType = p.type
      }
      details += `Detected ${p.type} pattern (severity: ${p.severity}). `
    }
  }

  // Check for context mismatch
  if (context && userInput.length > context.length * 2) {
    details += 'Input significantly longer than expected context — possible payload hiding. '
    if (severityOrder.indexOf(highestSeverity) < severityOrder.indexOf('medium')) {
      highestSeverity = 'medium'
      detectedType = 'length_anomaly'
    }
  }

  // Check for encoding tricks
  const encodedPatterns = /(&#x?[0-9a-f]+;|\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|%[0-9a-f]{2})/gi
  if (encodedPatterns.test(userInput)) {
    details += 'Encoded characters detected — possible evasion attempt. '
    if (severityOrder.indexOf(highestSeverity) < severityOrder.indexOf('medium')) {
      highestSeverity = 'medium'
      detectedType = 'encoding_evasion'
    }
  }

  const shouldBlock = severityOrder.indexOf(highestSeverity) >= severityOrder.indexOf('high')

  let sanitization = 'No sanitization needed.'
  if (shouldBlock) {
    sanitization = 'Block input entirely. Strip all non-alphanumeric characters if partial processing is required. Apply HTML entity encoding and remove control characters.'
  } else if (highestSeverity === 'medium') {
    sanitization = 'Apply input normalization: remove control characters, decode HTML entities, validate against expected format, and truncate to maximum allowed length.'
  } else if (highestSeverity === 'low') {
    sanitization = 'Apply basic input validation and length limits.'
  }

  if (!details) details = 'No injection patterns detected.'

  return {
    injection_risk: highestSeverity,
    attack_type: detectedType,
    sanitization_recommendation: sanitization,
    block_recommendation: shouldBlock,
    details: details.trim()
  }
}

function formatInjectionReport(result: InjectionDetectionResult): string {
  const lines: string[] = []
  lines.push('## Prompt Injection Detection Report')
  lines.push('')
  lines.push(`**Risk Level:** ${result.injection_risk.toUpperCase()} | **Attack Type:** ${result.attack_type}`)
  lines.push(`**Block Recommendation:** ${result.block_recommendation ? 'YES — Block this input' : 'No — Input appears safe'}`)
  lines.push('')

  lines.push('### Details')
  lines.push(result.details)
  lines.push('')

  lines.push('### Sanitization Recommendation')
  lines.push(result.sanitization_recommendation)

  return lines.join('\n')
}

// ==================== TOOL 8: GOVERNANCE MATURITY ASSESSOR ====================

function assessMaturity(orgPractices: OrgPractices): MaturityAssessment {
  const gapAnalysis: MaturityAssessment['gap_analysis'] = []
  const roadmap: MaturityAssessment['improvement_roadmap'] = []

  // Score each area (0-100)
  const policiesScore = Math.min(orgPractices.policies.length * 15 + (orgPractices.policies.some(p => p.includes('review')) ? 10 : 0), 100)
  const trainingScore = Math.min(orgPractices.training.length * 15 + (orgPractices.training.some(t => t.includes('regular')) ? 10 : 0), 100)
  const monitoringScore = Math.min(orgPractices.monitoring.length * 15 + (orgPractices.monitoring.some(m => m.includes('automated')) ? 10 : 0), 100)
  const incidentScore = Math.min(orgPractices.incident_response.length * 15 + (orgPractices.incident_response.some(i => i.includes('tested')) ? 10 : 0), 100)

  const overallScore = Math.round((policiesScore + trainingScore + monitoringScore + incidentScore) / 4)

  // Gap analysis
  const areas = [
    { area: 'Policies & Standards', current: policiesScore },
    { area: 'Training & Awareness', current: trainingScore },
    { area: 'Monitoring & Detection', current: monitoringScore },
    { area: 'Incident Response', current: incidentScore },
  ]

  for (const a of areas) {
    const target = 80
    gapAnalysis.push({ area: a.area, current: a.current, target, gap: Math.max(0, target - a.current) })
  }

  // Improvement roadmap
  if (policiesScore < 80) {
    roadmap.push({
      phase: 'Phase 1 (0-3 months)',
      actions: [
        'Draft comprehensive AI governance policy',
        'Define roles and responsibilities for agent oversight',
        'Establish data classification standards'
      ],
      timeline: '3 months'
    })
  }
  if (trainingScore < 80) {
    roadmap.push({
      phase: 'Phase 2 (3-6 months)',
      actions: [
        'Implement mandatory AI security training for developers',
        'Conduct red-team exercises for agent systems',
        'Establish certification program for agent operators'
      ],
      timeline: '3 months'
    })
  }
  if (monitoringScore < 80) {
    roadmap.push({
      phase: 'Phase 3 (6-9 months)',
      actions: [
        'Deploy real-time agent behavior monitoring',
        'Implement automated compliance checking',
        'Establish metrics dashboard for governance KPIs'
      ],
      timeline: '3 months'
    })
  }
  if (incidentScore < 80) {
    roadmap.push({
      phase: 'Phase 4 (9-12 months)',
      actions: [
        'Develop and test incident response playbooks',
        'Conduct tabletop exercises for agent-related incidents',
        'Establish post-incident review process'
      ],
      timeline: '3 months'
    })
  }

  if (roadmap.length === 0) {
    roadmap.push({
      phase: 'Continuous Improvement',
      actions: ['Maintain current practices', 'Benchmark against evolving standards', 'Share learnings with industry peers'],
      timeline: 'Ongoing'
    })
  }

  const percentile = Math.min(50 + overallScore / 2, 99)

  return {
    maturity_score: overallScore,
    gap_analysis: gapAnalysis,
    improvement_roadmap: roadmap,
    benchmarking: {
      percentile: Math.round(percentile),
      industry_avg: 45,
      best_in_class: 92
    },
    summary: `Overall governance maturity: ${overallScore}/100 (${overallScore >= 80 ? 'Advanced' : overallScore >= 60 ? 'Intermediate' : overallScore >= 40 ? 'Developing' : 'Initial'}). Benchmarking: ${Math.round(percentile)}th percentile.`
  }
}

function formatMaturityReport(result: MaturityAssessment): string {
  const lines: string[] = []
  lines.push('## Governance Maturity Assessment')
  lines.push('')
  lines.push(`**Maturity Score:** ${result.maturity_score}/100`)
  lines.push(result.summary)
  lines.push('')

  lines.push('### Gap Analysis')
  lines.push('| Area | Current | Target | Gap |')
  lines.push('|------|---------|--------|-----|')
  for (const g of result.gap_analysis) {
    lines.push(`| ${g.area} | ${g.current}/100 | ${g.target}/100 | ${g.gap} points |`)
  }
  lines.push('')

  lines.push('### Benchmarking')
  lines.push(`- Your organization: ${result.maturity_score}/100 (${result.benchmarking.percentile}th percentile)`)
  lines.push(`- Industry average: ${result.benchmarking.industry_avg}/100`)
  lines.push(`- Best in class: ${result.benchmarking.best_in_class}/100`)
  lines.push('')

  lines.push('### Improvement Roadmap')
  for (const phase of result.improvement_roadmap) {
    lines.push(`**${phase.phase}** (${phase.timeline})`)
    for (const action of phase.actions) {
      lines.push(`- ${action}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'permission_auditor',
    description: 'Audit agent tool permissions to identify overprivileged access. Analyzes tool configurations, access scopes, and data permissions against least-privilege principles. Returns risk score and actionable recommendations.',
    parameters: {
      agent_config: { type: 'string', required: true, description: 'JSON object with fields: tools (string[]), access_scopes (string[]), data_permissions (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { agent_config: string }) {
      const config: AgentConfig = JSON.parse(args.agent_config)
      const result = auditPermissions(config)
      return formatPermissionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'compliance_checker',
    description: 'Check agent actions against regulatory compliance frameworks (GDPR, HIPAA, SOC2, PCI-DSS). Identifies violations, assigns risk levels, and provides remediation steps.',
    parameters: {
      agent_actions: { type: 'string', required: true, description: 'JSON array of action objects with fields: action, target, data_type, timestamp' },
      regulations: { type: 'string', required: true, description: 'JSON array of regulation names: "GDPR", "HIPAA", "SOC2", "PCI"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { agent_actions: string; regulations: string }) {
      const actions: AgentAction[] = JSON.parse(args.agent_actions)
      const regs: string[] = JSON.parse(args.regulations)
      const result = checkCompliance(actions, regs)
      return formatComplianceReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'guardrail_designer',
    description: 'Design safety guardrails for AI agent deployments. Generates guardrail rules, escalation triggers, and override procedures based on use case, risk tolerance, and agent capabilities.',
    parameters: {
      use_case: { type: 'string', required: true, description: 'Description of the agent use case (e.g., "customer support chatbot", "data analysis agent")' },
      risk_tolerance: { type: 'string', required: true, description: 'Risk tolerance level: "low", "medium", or "high"' },
      capabilities: { type: 'string', required: true, description: 'JSON array of agent capability strings (e.g., ["database_query", "email_send", "file_read"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { use_case: string; risk_tolerance: string; capabilities: string }) {
      const caps: string[] = JSON.parse(args.capabilities)
      const result = designGuardrails(args.use_case, args.risk_tolerance, caps)
      return formatGuardrailReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'audit_trail_generator',
    description: 'Generate tamper-evident audit trails from agent session logs. Produces integrity hashes, detects anomalies, builds timelines, and assesses compliance status.',
    parameters: {
      session_log: { type: 'string', required: true, description: 'JSON array of session entries with fields: timestamp, action, tool, input_summary, output_summary' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { session_log: string }) {
      const log: SessionEntry[] = JSON.parse(args.session_log)
      const result = generateAuditTrail(log)
      return formatAuditReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'data_leak_detector',
    description: 'Detect sensitive data leaks in agent output. Scans for PII, credentials, financial data, and custom patterns. Provides risk scoring and masking recommendations.',
    parameters: {
      agent_output: { type: 'string', required: true, description: 'The agent output text to scan for sensitive data' },
      sensitive_patterns: { type: 'string', description: 'Optional JSON array of custom regex patterns to detect' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { agent_output: string; sensitive_patterns?: string }) {
      const patterns = args.sensitive_patterns ? JSON.parse(args.sensitive_patterns) : undefined
      const result = detectDataLeaks(args.agent_output, patterns)
      return formatLeakReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'tool_sandbox_scorer',
    description: 'Score tool security requirements and recommend sandbox isolation levels. Evaluates permissions, network access, and file system access to determine appropriate containment strategies.',
    parameters: {
      tool_manifest: { type: 'string', required: true, description: 'JSON object with fields: name, permissions (string[]), network_access (boolean), file_system_access (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { tool_manifest: string }) {
      const manifest: ToolManifest = JSON.parse(args.tool_manifest)
      const result = scoreSandbox(manifest)
      return formatSandboxReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'prompt_injection_detector',
    description: 'Detect prompt injection attacks in user input. Identifies instruction override, role manipulation, jailbreak attempts, and encoding evasion. Provides sanitization and blocking recommendations.',
    parameters: {
      user_input: { type: 'string', required: true, description: 'The user input text to analyze for injection attempts' },
      context: { type: 'string', description: 'Optional expected context or prompt template for comparison' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { user_input: string; context?: string }) {
      const result = detectPromptInjection(args.user_input, args.context)
      return formatInjectionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'governance_maturity_assessor',
    description: 'Assess organizational AI governance maturity across policies, training, monitoring, and incident response. Provides gap analysis, improvement roadmap, and industry benchmarking.',
    parameters: {
      org_practices: { type: 'string', required: true, description: 'JSON object with fields: policies (string[]), training (string[]), monitoring (string[]), incident_response (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { org_practices: string }) {
      const practices: OrgPractices = JSON.parse(args.org_practices)
      const result = assessMaturity(practices)
      return formatMaturityReport(result)
    }
  }))

  console.log(`[dsh-tool-governance] Loaded v${VERSION} — Agent Security Governance with 8 tools`)
  console.log('  Tools: permission_auditor, compliance_checker, guardrail_designer, audit_trail_generator, data_leak_detector, tool_sandbox_scorer, prompt_injection_detector, governance_maturity_assessor')
}
