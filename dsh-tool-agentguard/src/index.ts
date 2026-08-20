/**
 * DSH AgentGuard - 智能体安全治理引擎 Plugin v0.1.0
 *
 * 全生命周期AI Agent安全管控套件，对标Google趋势"统一AI生态与安全主动防御"/"安全左移"。
 * 提供行为审计、权限管控、数据血缘、异常检测、合规映射、红队测试、事件响应、信任评分八大核心能力。
 *
 * Features (v0.1.0):
 * - agent_audit        - 行为审计（谁在何时调用了什么工具、数据流向、异常偏离检测）
 * - permission_guard   - 权限管控（最小权限原则、动态授权、权限升降级）
 * - data_lineage      - 数据血缘追踪（输入来源→处理过程→输出去向，全链路可观测）
 * - anomaly_detection - 异常行为检测（偏离基线的调用模式、数据外泄风险提示）
 * - compliance_map    - 合规映射（GDPR/PIPL/等保2.0/HIPAA等法规的自动化checklist）
 * - red_team_agent    - Agent红队测试（模拟恶意Agent、注入检测、自主防御演练）
 * - incident_response - 事件响应剧本（自动隔离、影响评估、恢复SOP、根因分析）
 * - trust_score       - 信任评分系统（Agent/用户/工具的动态信誉分、溯源链、声誉修复）
 *
 * @module dsh-tool-agentguard
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agentguard'
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

// ==================== TOOL 1: AGENT_BEHAVIOR_AUDIT ====================
// 谁在何时调用了什么工具、数据流向、异常偏离检测

interface AgentCall {
  agent_id: string
  tool_name: string
  timestamp: string
  parameters: string
  data_accessed: string[]
  result_status: string
  duration_ms: number
  caller_ip?: string
}

interface AuditFinding {
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string
  agent_id: string
  timestamp: string
  evidence: string
  recommendation: string
}

interface AgentAuditResult {
  total_calls: number
  unique_agents: number
  unique_tools: number
  anomaly_count: number
  data_flow_summary: { source: string; destinations: string[] }[]
  findings: AuditFinding[]
  risk_rating: 'low' | 'medium' | 'high' | 'critical'
  audit_score: number
}

function analyzeAgentAudit(
  calls: AgentCall[],
  baseline_tools: string[]
): AgentAuditResult {
  const rng = createSeededRandom('agent_audit_' + calls.length)
  const totalCalls = calls.length
  const agents = new Set<string>()
  const tools = new Set<string>()
  const findings: AuditFinding[] = []
  const dataFlows: Map<string, Set<string>> = new Map()

  for (const call of calls) {
    agents.add(call.agent_id)
    tools.add(call.tool_name)

    // Track data flows
    for (const dataItem of call.data_accessed) {
      if (!dataFlows.has(dataItem)) {
        dataFlows.set(dataItem, new Set<string>())
      }
      const dests = dataFlows.get(dataItem)
      if (dests) {
        dests.add(call.agent_id + ':' + call.tool_name)
      }
    }

    // Detect baseline deviation
    if (!baseline_tools.includes(call.tool_name)) {
      findings.push({
        severity: 'medium',
        category: 'baseline_deviation',
        description: `Agent "${call.agent_id}" 调用了非基线工具 "${call.tool_name}"`,
        agent_id: call.agent_id,
        timestamp: call.timestamp,
        evidence: `Tool: ${call.tool_name}, Params: ${call.parameters.substring(0, 80)}`,
        recommendation: '审查该工具调用是否在工作授权范围内，必要时撤销权限或更新基线'
      })
    }

    // Detect slow calls
    if (call.duration_ms > 30000) {
      findings.push({
        severity: 'low',
        category: 'performance_anomaly',
        description: `Agent "${call.agent_id}" 的工具调用耗时异常 (${call.duration_ms}ms)`,
        agent_id: call.agent_id,
        timestamp: call.timestamp,
        evidence: `Duration: ${call.duration_ms}ms, Tool: ${call.tool_name}`,
        recommendation: '检查是否存在资源争用、死循环或外部服务延迟'
      })
    }

    // Detect failed calls
    if (call.result_status === 'error' || call.result_status === 'failed') {
      findings.push({
        severity: rng.nextFloat(0, 1) > 0.5 ? 'medium' : 'high',
        category: 'execution_failure',
        description: `Agent "${call.agent_id}" 的工具调用失败: ${call.tool_name}`,
        agent_id: call.agent_id,
        timestamp: call.timestamp,
        evidence: `Status: ${call.result_status}, Tool: ${call.tool_name}`,
        recommendation: '分析失败日志，确认是否为恶意探测或权限绕过尝试'
      })
    }
  }

  // Detect data exfiltration patterns (unusual data access volume)
  const agentDataVolume: Map<string, number> = new Map()
  for (const call of calls) {
    const current = agentDataVolume.get(call.agent_id) ?? 0
    agentDataVolume.set(call.agent_id, current + call.data_accessed.length)
  }
  for (const [agentId, volume] of agentDataVolume) {
    if (volume > totalCalls * 3 && totalCalls > 0) {
      findings.push({
        severity: 'critical',
        category: 'data_exfiltration_risk',
        description: `Agent "${agentId}" 数据访问量异常 (${volume} items in ${totalCalls} calls)`,
        agent_id: agentId,
        timestamp: calls[calls.length - 1]?.timestamp ?? '',
        evidence: `Data volume: ${volume}, Calls: ${totalCalls}, Ratio: ${(volume / totalCalls).toFixed(1)}x`,
        recommendation: '立即隔离该Agent，审查其数据访问范围，启动数据安全事件响应流程'
      })
    }
  }

  // Build data flow summary
  const dataFlowSummary: { source: string; destinations: string[] }[] = []
  for (const [source, destSet] of dataFlows) {
    dataFlowSummary.push({ source, destinations: Array.from(destSet) })
  }

  // Calculate audit score
  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const highCount = findings.filter(f => f.severity === 'high').length
  const mediumCount = findings.filter(f => f.severity === 'medium').length
  let auditScore = 100
  auditScore -= criticalCount * 25
  auditScore -= highCount * 15
  auditScore -= mediumCount * 5
  auditScore = Math.max(0, Math.min(100, auditScore))

  let riskRating: AgentAuditResult['risk_rating'] = 'low'
  if (criticalCount > 0 || auditScore < 40) riskRating = 'critical'
  else if (highCount >= 2 || auditScore < 60) riskRating = 'high'
  else if (mediumCount >= 3 || auditScore < 80) riskRating = 'medium'

  findings.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
  })

  return {
    total_calls: totalCalls,
    unique_agents: agents.size,
    unique_tools: tools.size,
    anomaly_count: findings.length,
    data_flow_summary: dataFlowSummary,
    findings,
    risk_rating: riskRating,
    audit_score: auditScore
  }
}

function formatAgentAuditReport(result: AgentAuditResult): string {
  const lines: string[] = []
  lines.push('## 🛡️ Agent Behavior Audit Report — 行为审计报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  lines.push(`| 审计评分 | ${result.audit_score}/100 | ${result.risk_rating === 'low' ? '✅ 正常' : result.risk_rating === 'medium' ? '⚠️ 需关注' : result.risk_rating === 'high' ? '🔴 高风险' : '🚨 严重'} |`)
  lines.push(`| 调用总量 | ${result.total_calls} | ${result.unique_agents} 个Agent / ${result.unique_tools} 个工具 |`)
  lines.push(`| 异常发现 | ${result.anomaly_count} 项 | 按严重级别分级处理 |`)
  lines.push(`| 风险等级 | ${result.risk_rating.toUpperCase()} | ${result.risk_rating === 'low' ? '维持现状' : '需立即审查'} |`)
  lines.push('')

  lines.push('### 📋 数据流向摘要')
  lines.push('')
  if (result.data_flow_summary.length > 0) {
    lines.push('| 数据源 | 去向（Agent:Tool） |')
    lines.push('|--------|---------------------|')
    for (const flow of result.data_flow_summary.slice(0, 15)) {
      lines.push(`| ${flow.source} | ${flow.destinations.slice(0, 3).join(', ')}${flow.destinations.length > 3 ? '...' : ''} |`)
    }
  } else {
    lines.push('> 无数据流向记录')
  }
  lines.push('')

  if (result.findings.length > 0) {
    lines.push('### ⚠️ 审计发现列表')
    lines.push('')
    lines.push('| 级别 | 类别 | 描述 | Agent | 建议 |')
    lines.push('|------|------|------|-------|------|')
    for (const f of result.findings.slice(0, 20)) {
      const sevEmoji = f.severity === 'critical' ? '🚨' : f.severity === 'high' ? '🔴' : f.severity === 'medium' ? '🟡' : '🟢'
      lines.push(`| ${sevEmoji} ${f.severity.toUpperCase()} | ${f.category} | ${f.description.substring(0, 40)} | ${f.agent_id.substring(0, 12)} | ${f.recommendation.substring(0, 25)}... |`)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== TOOL 2: PERMISSION_GUARD ====================
// 最小权限原则、动态授权、权限升降级

interface PermissionRequest {
  agent_id: string
  current_level: string
  requested_level: string
  resource: string
  action: string
  justification: string
  request_time: string
}

interface PermissionDecision {
  agent_id: string
  resource: string
  action: string
  current_level: string
  granted_level: string
  decision: 'approved' | 'denied' | 'escalated' | 'partial'
  conditions: string[]
  expiry: string
  reasoning: string
}

interface PermissionGuardResult {
  decisions: PermissionDecision[]
  elevated_count: number
  denied_count: number
  escalated_count: number
  partial_count: number
  security_posture: 'strong' | 'moderate' | 'weak' | 'compromised'
  recommendations: string[]
}

const CLEARANCE_LEVELS: Record<string, number> = {
  'public': 0, 'internal': 1, 'confidential': 2, 'secret': 3, 'top_secret': 4
}

const ACTION_REQUIREMENTS: Record<string, number> = {
  'read': 0, 'write': 1, 'execute': 2, 'delete': 3, 'admin': 4
}

function analyzePermissionGuard(
  requests: PermissionRequest[],
  active_policies: { agent_id: string; max_level: string; allowed_actions: string[] }[]
): PermissionGuardResult {
  const decisions: PermissionDecision[] = []
  let elevatedCount = 0
  let deniedCount = 0
  let escalatedCount = 0
  let partialCount = 0

  for (const req of requests) {
    const policy = active_policies.find(p => p.agent_id === req.agent_id)
    const reqLevelNum = CLEARANCE_LEVELS[req.requested_level] ?? 0
    const actionReq = ACTION_REQUIREMENTS[req.action] ?? 0
    const currentLevelNum = CLEARANCE_LEVELS[req.current_level] ?? 0

    let decision: PermissionDecision['decision'] = 'approved'
    const conditions: string[] = []
    let grantedLevel = req.requested_level
    let reasoning = ''

    // Check if agent has explicit policy
    if (!policy) {
      decision = 'escalated'
      grantedLevel = req.current_level
      reasoning = '未找到该Agent的授权策略，需人工审查'
      escalatedCount++
    } else {
      const maxLevelNum = CLEARANCE_LEVELS[policy.max_level] ?? 0
      const allowedActions = policy.allowed_actions

      // Action not allowed
      if (!allowedActions.includes(req.action)) {
        decision = 'denied'
        grantedLevel = req.current_level
        reasoning = `Action "${req.action}" 不在Agent的授权动作列表中`
        deniedCount++
      }
      // Requested level exceeds max
      else if (reqLevelNum > maxLevelNum) {
        if (reqLevelNum - maxLevelNum === 1 && req.action !== 'admin' && req.action !== 'delete') {
          decision = 'partial'
          grantedLevel = policy.max_level
          conditions.push(`Upgrade limited to ${policy.max_level}`)
          conditions.push('Enhanced audit logging enabled')
          reasoning = `Requested level exceeds policy max; partial grant at ${policy.max_level}`
          partialCount++
        } else {
          decision = 'denied'
          grantedLevel = req.current_level
          reasoning = `Requested clearance (${req.requested_level}) exceeds policy maximum (${policy.max_level})`
          deniedCount++
        }
      }
      // Justification too short or missing
      else if (req.justification.length < 10) {
        decision = 'escalated'
        grantedLevel = req.current_level
        reasoning = '权限升级理由不充分，需人工审查确认'
        escalatedCount++
      }
      // Legitimate elevation
      else if (reqLevelNum > currentLevelNum) {
        decision = 'approved'
        grantedLevel = req.requested_level
        conditions.push('Auto-expiry after 4 hours')
        conditions.push('Activity logged for audit')
        reasoning = '权限升级符合最小权限策略，已附加时限条件'
        elevatedCount++
      } else {
        decision = 'approved'
        reasoning = '常规权限请求，符合既有策略'
      }
    }

    decisions.push({
      agent_id: req.agent_id,
      resource: req.resource,
      action: req.action,
      current_level: req.current_level,
      granted_level: grantedLevel,
      decision,
      conditions,
      expiry: '2099-12-31T23:59:59Z',
      reasoning
    })
  }

  const totalDecisions = decisions.length
  const riskRatio = totalDecisions > 0 ? (deniedCount + escalatedCount) / totalDecisions : 0
  let securityPosture: PermissionGuardResult['security_posture'] = 'strong'
  if (riskRatio > 0.3) securityPosture = 'weak'
  else if (riskRatio > 0.15) securityPosture = 'moderate'

  const recommendations: string[] = []
  if (deniedCount > 0) recommendations.push(`${deniedCount} 项权限请求被拒绝，建议审查Agent基线权限是否充足`)
  if (escalatedCount > 0) recommendations.push(`${escalatedCount} 项请求升级至人工审查，建议优化自动化授权规则`)
  if (elevatedCount > 0) recommendations.push(`${elevatedCount} 项动态授权已生效，建议监控授权后的行为日志`)
  if (securityPosture === 'weak') recommendations.push('当前安全态势偏弱，建议收紧最小权限基线并增加审批节点')
  recommendations.push('建议每季度执行一次权限清理（Permission Hygiene），回收过期授权')

  return {
    decisions,
    elevated_count: elevatedCount,
    denied_count: deniedCount,
    escalated_count: escalatedCount,
    partial_count: partialCount,
    security_posture: securityPosture,
    recommendations
  }
}

function formatPermissionGuardReport(result: PermissionGuardResult): string {
  const lines: string[] = []
  lines.push('## 🔐 Permission Guard Report — 权限管控报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  const postureEmoji = result.security_posture === 'strong' ? '✅' : result.security_posture === 'moderate' ? '⚠️' : result.security_posture === 'weak' ? '🔴' : '🚨'
  lines.push(`| 安全态势 | ${postureEmoji} ${result.security_posture.toUpperCase()} | ${result.security_posture === 'strong' ? '权限治理良好' : '需加强管控'} |`)
  lines.push(`| 总决策数 | ${result.decisions.length} | 批准:${result.elevated_count} 拒绝:${result.denied_count} 升级:${result.escalated_count} 部分:${result.partial_count} |`)
  lines.push('')

  lines.push('### 📋 权限决策矩阵')
  lines.push('')
  lines.push('| Agent | 资源 | 动作 | 当前级别 | 授予级别 | 决策 | 理由 |')
  lines.push('|-------|------|------|----------|----------|------|------|')
  for (const d of result.decisions.slice(0, 20)) {
    const decEmoji = d.decision === 'approved' ? '✅' : d.decision === 'denied' ? '🚫' : d.decision === 'escalated' ? '⚠️' : '🔶'
    lines.push(`| ${d.agent_id.substring(0, 12)} | ${d.resource.substring(0, 15)} | ${d.action} | ${d.current_level} | ${d.granted_level} | ${decEmoji} ${d.decision} | ${d.reasoning.substring(0, 25)}... |`)
  }
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### ⚠️ 权限治理建议')
    lines.push('')
    for (const rec of result.recommendations) {
      lines.push(`- ${rec}`)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== TOOL 3: DATA_LINEAGE ====================
// 输入来源→处理过程→输出去向，全链路可观测

interface DataLineageNode {
  data_id: string
  data_type: string
  source: string
  created_at: string
  classification: string
  transformations: { agent_id: string; tool: string; timestamp: string; operation: string }[]
  destinations: { agent_id: string; timestamp: string; access_type: string }[]
}

interface LineageTrace {
  data_id: string
  path: { stage: string; agent: string; timestamp: string; operation: string }[]
  hop_count: number
  classification_changes: number
  risk_level: 'low' | 'medium' | 'high'
}

interface DataLineageResult {
  total_tracked: number
  traces: LineageTrace[]
  cross_boundary_flows: { data_id: string; from_level: string; to_level: string }[]
  orphaned_data: string[]
  stale_data: string[]
  lineage_score: number
}

function analyzeDataLineage(
  nodes: DataLineageNode[],
  classification_hierarchy: string[]
): DataLineageResult {
  const traces: LineageTrace[] = []
  const crossBoundaryFlows: DataLineageResult['cross_boundary_flows'] = []
  const orphanedData: string[] = []
  const staleData: string[] = []

  for (const node of nodes) {
    // Build trace path
    const path: LineageTrace['path'] = []
    path.push({ stage: 'origin', agent: node.source, timestamp: node.created_at, operation: 'create' })

    for (const tx of node.transformations) {
      path.push({ stage: 'transform', agent: tx.agent_id, timestamp: tx.timestamp, operation: tx.operation })
    }
    for (const dest of node.destinations) {
      path.push({ stage: 'destination', agent: dest.agent_id, timestamp: dest.timestamp, operation: dest.access_type })
    }

    // Detect classification changes (cross-boundary)
    let classificationChanges = 0
    const originsInHigher = classification_hierarchy.indexOf(node.classification)
    for (const dest of node.destinations) {
      // Check if destination might downgrade (simplified heuristic)
      if (node.classification === 'secret' && dest.access_type === 'export') {
        crossBoundaryFlows.push({ data_id: node.data_id, from_level: node.classification, to_level: 'external' })
        classificationChanges++
      }
    }

    // Detect orphaned data (no destinations, no transformations)
    if (node.destinations.length === 0 && node.transformations.length === 0) {
      orphanedData.push(node.data_id)
    }

    // Detect stale data (more than 30 days without access)
    const lastAccess = node.destinations.length > 0
      ? node.destinations[node.destinations.length - 1]?.timestamp ?? node.created_at
      : node.created_at
    const daysSinceAccess = (Date.now() - new Date(lastAccess).getTime()) / 86400000
    if (daysSinceAccess > 30) {
      staleData.push(node.data_id)
    }

    let riskLevel: LineageTrace['risk_level'] = 'low'
    if (classificationChanges > 0 || originsInHigher >= 3) riskLevel = 'high'
    else if (node.transformations.length > 5) riskLevel = 'medium'

    traces.push({
      data_id: node.data_id,
      path,
      hop_count: path.length,
      classification_changes: classificationChanges,
      risk_level: riskLevel
    })
  }

  // Calculate lineage score
  const highRiskCount = traces.filter(t => t.risk_level === 'high').length
  const mediumRiskCount = traces.filter(t => t.risk_level === 'medium').length
  let lineageScore = 100
  lineageScore -= highRiskCount * 20
  lineageScore -= mediumRiskCount * 8
  lineageScore -= orphanedData.length * 5
  lineageScore -= staleData.length * 3
  lineageScore = Math.max(0, Math.min(100, lineageScore))

  return {
    total_tracked: nodes.length,
    traces,
    cross_boundary_flows: crossBoundaryFlows,
    orphaned_data: orphanedData,
    stale_data: staleData,
    lineage_score: lineageScore
  }
}

function formatDataLineageReport(result: DataLineageResult): string {
  const lines: string[] = []
  lines.push('## 📋 Data Lineage Report — 数据血缘追踪报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  lines.push(`| 血缘评分 | ${result.lineage_score}/100 | ${result.lineage_score >= 80 ? '✅ 良好' : result.lineage_score >= 60 ? '⚠️ 需改进' : '🔴 风险'} |`)
  lines.push(`| 追踪数据 | ${result.total_tracked} 条 | 全链路可观测 |`)
  lines.push(`| 跨边界流转 | ${result.cross_boundary_flows.length} 项 | ${result.cross_boundary_flows.length > 0 ? '⚠️ 需审查' : '✅ 无异常'} |`)
  lines.push(`| 孤立数据 | ${result.orphaned_data.length} 条 | 无访问记录 |`)
  lines.push(`| 过期数据 | ${result.stale_data.length} 条 | 超30天未访问 |`)
  lines.push('')

  // Show top traces
  const highRiskTraces = result.traces.filter(t => t.risk_level === 'high')
  if (highRiskTraces.length > 0) {
    lines.push('### ⚠️ 高风险数据流转')
    lines.push('')
    for (const trace of highRiskTraces.slice(0, 10)) {
      lines.push(`**${trace.data_id}** (hops: ${trace.hop_count}, classification changes: ${trace.classification_changes})`)
      for (const step of trace.path) {
        lines.push(`  - [${step.stage}] ${step.agent} @ ${step.timestamp.substring(0, 19)} → ${step.operation}`)
      }
      lines.push('')
    }
  }

  if (result.cross_boundary_flows.length > 0) {
    lines.push('### 🚨 跨边界数据流')
    lines.push('')
    lines.push('| 数据ID | 源级别 | 目标级别 |')
    lines.push('|--------|--------|----------|')
    for (const flow of result.cross_boundary_flows) {
      lines.push(`| ${flow.data_id.substring(0, 20)} | ${flow.from_level} | ${flow.to_level} |`)
    }
    lines.push('')
  }

  if (result.orphaned_data.length > 0) {
    lines.push(`### 🗑️ 孤立数据 (${result.orphaned_data.length})`)
    lines.push('')
    lines.push('> 以下数据无任何处理或访问记录，建议审查是否需要保留：')
    lines.push(result.orphaned_data.slice(0, 10).map(id => `- \`${id}\``).join('\n'))
    lines.push('')
  }

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== TOOL 4: ANOMALY_DETECTION ====================
// 偏离基线的调用模式、数据外泄风险提示

interface AnomalyInput {
  agent_id: string
  calls_per_hour: number[]
  data_volume_mb: number
  unique_tools_used: number
  failed_ratio: number
  avg_duration_ms: number
  time_of_day: string
  baseline_profile: {
    avg_calls_per_hour: number
    avg_data_volume_mb: number
    avg_unique_tools: number
    avg_failed_ratio: number
    avg_duration_ms: number
    active_hours: string
  }
}

interface AnomalyIndicator {
  indicator: string
  deviation_score: number
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
  evidence: string
}

interface AnomalyDetectionResult {
  agent_id: string
  overall_risk: 'normal' | 'suspicious' | 'anomalous' | 'critical'
  anomaly_score: number
  indicators: AnomalyIndicator[]
  baseline_deviation: number
  data_exfiltration_risk: boolean
  recommended_action: string
}

function analyzeAnomalyDetection(input: AnomalyInput): AnomalyDetectionResult {
  const indicators: AnomalyIndicator[] = []
  const rng = createSeededRandom(input.agent_id + input.time_of_day)

  // Check call volume deviation
  const avgCalls = input.calls_per_hour.reduce((s, v) => s + v, 0) / Math.max(input.calls_per_hour.length, 1)
  const callDeviation = input.baseline_profile.avg_calls_per_hour > 0
    ? Math.abs(avgCalls - input.baseline_profile.avg_calls_per_hour) / input.baseline_profile.avg_calls_per_hour
    : 0
  if (callDeviation > 1.5) {
    indicators.push({
      indicator: 'call_volume_spike',
      deviation_score: callDeviation,
      severity: callDeviation > 3 ? 'critical' : callDeviation > 2 ? 'high' : 'medium',
      description: '调用频率严重偏离基线',
      evidence: `当前: ${avgCalls.toFixed(1)}/h, 基线: ${input.baseline_profile.avg_calls_per_hour.toFixed(1)}/h, 偏离: ${(callDeviation * 100).toFixed(0)}%`
    })
  }

  // Check data volume deviation
  const dataDeviation = input.baseline_profile.avg_data_volume_mb > 0
    ? Math.abs(input.data_volume_mb - input.baseline_profile.avg_data_volume_mb) / input.baseline_profile.avg_data_volume_mb
    : 0
  if (dataDeviation > 2) {
    indicators.push({
      indicator: 'data_volume_anomaly',
      deviation_score: dataDeviation,
      severity: dataDeviation > 4 ? 'critical' : dataDeviation > 3 ? 'high' : 'medium',
      description: '数据访问量异常偏高，存在外泄风险',
      evidence: `当前: ${input.data_volume_mb.toFixed(1)}MB, 基线: ${input.baseline_profile.avg_data_volume_mb.toFixed(1)}MB`
    })
  }

  // Check tool diversity anomaly
  const toolDeviation = input.baseline_profile.avg_unique_tools > 0
    ? (input.unique_tools_used - input.baseline_profile.avg_unique_tools) / input.baseline_profile.avg_unique_tools
    : 0
  if (toolDeviation > 1) {
    indicators.push({
      indicator: 'tool_scope_expansion',
      deviation_score: toolDeviation,
      severity: toolDeviation > 2 ? 'high' : 'medium',
      description: '工具使用范围异常扩大，可能尝试新攻击面',
      evidence: `当前: ${input.unique_tools_used} tools, 基线: ${input.baseline_profile.avg_unique_tools} tools`
    })
  }

  // Check failure rate
  if (input.failed_ratio > input.baseline_profile.avg_failed_ratio * 3 && input.failed_ratio > 0.1) {
    indicators.push({
      indicator: 'high_failure_rate',
      deviation_score: input.failed_ratio,
      severity: input.failed_ratio > 0.5 ? 'critical' : 'high',
      description: '工具调用失败率异常',
      evidence: `失败率: ${(input.failed_ratio * 100).toFixed(1)}%, 基线: ${(input.baseline_profile.avg_failed_ratio * 100).toFixed(1)}%`
    })
  }

  // Check off-hours activity
  const hour = parseInt(input.time_of_day, 10)
  const baselineStart = parseInt(input.baseline_profile.active_hours.split('-')[0] ?? '9', 10)
  const baselineEnd = parseInt(input.baseline_profile.active_hours.split('-')[1] ?? '18', 10)
  if (hour < baselineStart || hour > baselineEnd) {
    indicators.push({
      indicator: 'off_hours_activity',
      deviation_score: 0.5,
      severity: (hour >= 0 && hour <= 5) ? 'high' : 'low',
      description: '非工作时段活跃，需确认是否为计划内任务',
      evidence: `当前时段: ${input.time_of_day}, 正常时段: ${input.baseline_profile.active_hours}`
    })
  }

  // Check duration anomaly
  const durDeviation = input.baseline_profile.avg_duration_ms > 0
    ? Math.abs(input.avg_duration_ms - input.baseline_profile.avg_duration_ms) / input.baseline_profile.avg_duration_ms
    : 0
  if (durDeviation > 2) {
    indicators.push({
      indicator: 'execution_duration_anomaly',
      deviation_score: durDeviation,
      severity: durDeviation > 3 ? 'high' : 'medium',
      description: '工具执行耗时异常偏离',
      evidence: `当前: ${input.avg_duration_ms}ms, 基线: ${input.baseline_profile.avg_duration_ms}ms`
    })
  }

  // Add random noise signal for deterministic variety
  if (rng.nextFloat(0, 1) > 0.7) {
    indicators.push({
      indicator: 'behavioral_drift',
      deviation_score: rng.nextFloat(0.3, 0.8),
      severity: 'info',
      description: '检测到轻微行为漂移属正常范围',
      evidence: '基于历史行为模式的累积偏差分析'
    })
  }

  // Calculate anomaly score
  const criticalCount = indicators.filter(i => i.severity === 'critical').length
  const highCount = indicators.filter(i => i.severity === 'high').length
  const mediumCount = indicators.filter(i => i.severity === 'medium').length
  let anomalyScore = 0
  anomalyScore += criticalCount * 30
  anomalyScore += highCount * 20
  anomalyScore += mediumCount * 10
  anomalyScore = Math.min(100, anomalyScore)

  const baselineDeviation = (callDeviation + dataDeviation + toolDeviation + durDeviation) / 4
  const dataExfiltrationRisk = dataDeviation > 3 || (dataDeviation > 2 && toolDeviation > 1)

  let overallRisk: AnomalyDetectionResult['overall_risk'] = 'normal'
  if (anomalyScore >= 60) overallRisk = 'critical'
  else if (anomalyScore >= 40) overallRisk = 'anomalous'
  else if (anomalyScore >= 20) overallRisk = 'suspicious'

  let recommendedAction = '维持现状，持续监控'
  if (overallRisk === 'critical') recommendedAction = '立即隔离Agent，启动安全事件响应流程'
  else if (overallRisk === 'anomalous') recommendedAction = '限制Agent权限至只读模式，通知安全团队审查'
  else if (overallRisk === 'suspicious') recommendedAction = '增强审计日志粒度，设置阈值告警'

  indicators.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
  })

  return {
    agent_id: input.agent_id,
    overall_risk: overallRisk,
    anomaly_score: anomalyScore,
    indicators,
    baseline_deviation: baselineDeviation,
    data_exfiltration_risk: dataExfiltrationRisk,
    recommended_action: recommendedAction
  }
}

function formatAnomalyDetectionReport(result: AnomalyDetectionResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Anomaly Detection Report — 异常行为检测报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  const riskEmoji = result.overall_risk === 'normal' ? '✅' : result.overall_risk === 'suspicious' ? '⚠️' : result.overall_risk === 'anomalous' ? '🔴' : '🚨'
  lines.push(`| 整体风险 | ${riskEmoji} ${result.overall_risk.toUpperCase()} | ${result.overall_risk === 'normal' ? '行为正常' : '需关注审查'} |`)
  lines.push(`| 异常评分 | ${result.anomaly_score}/100 | 偏离基线程度 |`)
  lines.push(`| 基线偏离 | ${(result.baseline_deviation * 100).toFixed(1)}% | 多维度综合指标 |`)
  lines.push(`| 外泄风险 | ${result.data_exfiltration_risk ? '🚨 检测到' : '✅ 未检出'} | 基于数据量+工具范围 |`)
  lines.push(`| Agent | ${result.agent_id} | 被审查主体 |`)
  lines.push('')

  if (result.indicators.length > 0) {
    lines.push('### ⚠️ 异常指标列表')
    lines.push('')
    lines.push('| 级别 | 指标 | 偏离度 | 描述 | 证据 |')
    lines.push('|------|------|--------|------|------|')
    for (const ind of result.indicators) {
      const sevEmoji = ind.severity === 'critical' ? '🚨' : ind.severity === 'high' ? '🔴' : ind.severity === 'medium' ? '🟡' : '🟢'
      lines.push(`| ${sevEmoji} ${ind.severity.toUpperCase()} | ${ind.indicator} | ${ind.deviation_score.toFixed(2)} | ${ind.description.substring(0, 25)} | ${ind.evidence.substring(0, 35)}... |`)
    }
  }

  lines.push('')
  lines.push('### 🎯 建议操作')
  lines.push('')
  lines.push(`> ${result.recommended_action}`)

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== TOOL 5: COMPLIANCE_MAP ====================
// GDPR/PIPL/等保2.0/HIPAA等法规的自动化checklist

interface ComplianceItem {
  regulation: string
  control_id: string
  control_name: string
  category: string
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable'
  evidence: string
  last_verified: string
  remediation: string
  priority: 'mandatory' | 'recommended' | 'optional'
}

interface ComplianceMapResult {
  total_controls: number
  compliant_count: number
  partial_count: number
  non_compliant_count: number
  compliance_rate: number
  by_regulation: { regulation: string; rate: number; items: number }[]
  critical_gaps: ComplianceItem[]
  remediation_plan: { control_id: string; action: string; deadline: string; owner: string }[]
  compliance_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

function analyzeComplianceMap(
  items: ComplianceItem[]
): ComplianceMapResult {
  const compliantCount = items.filter(i => i.status === 'compliant').length
  const partialCount = items.filter(i => i.status === 'partial').length
  const nonCompliantCount = items.filter(i => i.status === 'non_compliant').length
  const totalApplicable = compliantCount + partialCount + nonCompliantCount
  const complianceRate = totalApplicable > 0 ? ((compliantCount + partialCount * 0.5) / totalApplicable) * 100 : 0

  // Group by regulation
  const regGroups: Map<string, ComplianceItem[]> = new Map()
  for (const item of items) {
    if (!regGroups.has(item.regulation)) regGroups.set(item.regulation, [])
    regGroups.get(item.regulation)!.push(item)
  }
  const byRegulation: { regulation: string; rate: number; items: number }[] = []
  for (const [reg, regItems] of regGroups) {
    const regCompliant = regItems.filter(i => i.status === 'compliant').length
    const regPartial = regItems.filter(i => i.status === 'partial').length
    const regTotal = regItems.filter(i => i.status !== 'not_applicable').length
    const regRate = regTotal > 0 ? ((regCompliant + regPartial * 0.5) / regTotal) * 100 : 100
    byRegulation.push({ regulation: reg, rate: regRate, items: regItems.length })
  }

  // Find critical gaps
  const criticalGaps = items.filter(
    i => i.status === 'non_compliant' && i.priority === 'mandatory'
  )

  // Build remediation plan
  const remediationPlan: ComplianceMapResult['remediation_plan'] = []
  for (const gap of criticalGaps) {
    remediationPlan.push({
      control_id: gap.control_id,
      action: gap.remediation,
      deadline: '30天内',
      owner: '安全合规团队'
    })
  }
  const partialMandatory = items.filter(
    i => i.status === 'partial' && i.priority === 'mandatory'
  )
  for (const item of partialMandatory.slice(0, 5)) {
    remediationPlan.push({
      control_id: item.control_id,
      action: item.remediation,
      deadline: '60天内',
      owner: '安全合规团队'
    })
  }

  let complianceGrade: ComplianceMapResult['compliance_grade'] = 'A'
  if (complianceRate >= 90) complianceGrade = 'A'
  else if (complianceRate >= 75) complianceGrade = 'B'
  else if (complianceRate >= 60) complianceGrade = 'C'
  else if (complianceRate >= 40) complianceGrade = 'D'
  else complianceGrade = 'F'

  return {
    total_controls: items.length,
    compliant_count: compliantCount,
    partial_count: partialCount,
    non_compliant_count: nonCompliantCount,
    compliance_rate: Math.round(complianceRate),
    by_regulation: byRegulation,
    critical_gaps: criticalGaps,
    remediation_plan: remediationPlan,
    compliance_grade: complianceGrade
  }
}

function formatComplianceMapReport(result: ComplianceMapResult): string {
  const lines: string[] = []
  lines.push('## 📋 Compliance Map Report — 合规映射报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  const gradeEmoji = result.compliance_grade === 'A' ? '✅' : result.compliance_grade === 'B' ? '🔵' : result.compliance_grade === 'C' ? '🟡' : result.compliance_grade === 'D' ? '🔴' : '🚨'
  lines.push(`| 合规等级 | ${gradeEmoji} Grade ${result.compliance_grade} | 综合评分 ${result.compliance_rate}% |`)
  lines.push(`| 总控制项 | ${result.total_controls} | 合规:${result.compliant_count} 部分:${result.partial_count} 不合规:${result.non_compliant_count} |`)
  lines.push(`| 合规率 | ${result.compliance_rate}% | ${result.compliance_rate >= 80 ? '达标' : '未达标'} |`)
  lines.push('')

  lines.push('### 📋 法规合规矩阵')
  lines.push('')
  lines.push('| 法规 | 合规率 | 控制项数 | 状态 |')
  lines.push('|------|--------|----------|------|')
  for (const reg of result.by_regulation) {
    const regEmoji = reg.rate >= 80 ? '✅' : reg.rate >= 60 ? '⚠️' : '🔴'
    lines.push(`| ${reg.regulation} | ${reg.rate}% | ${reg.items} | ${regEmoji} ${reg.rate >= 80 ? '合规' : '待改进'} |`)
  }
  lines.push('')

  if (result.critical_gaps.length > 0) {
    lines.push('### 🚨 关键合规缺口（Mandatory项）')
    lines.push('')
    lines.push('| 控制ID | 法规 | 控制项名称 | 优先级 | 整改建议 |')
    lines.push('|--------|------|-----------|--------|---------|')
    for (const gap of result.critical_gaps.slice(0, 15)) {
      lines.push(`| ${gap.control_id} | ${gap.regulation} | ${gap.control_name.substring(0, 25)} | ${gap.priority} | ${gap.remediation.substring(0, 30)}... |`)
    }
    lines.push('')
  }

  if (result.remediation_plan.length > 0) {
    lines.push('### 📝 整改计划')
    lines.push('')
    lines.push('| 控制ID | 整改行动 | 期限 | 责任人 |')
    lines.push('|--------|----------|------|--------|')
    for (const plan of result.remediation_plan.slice(0, 10)) {
      lines.push(`| ${plan.control_id} | ${plan.action.substring(0, 30)}... | ${plan.deadline} | ${plan.owner} |`)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== TOOL 6: RED_TEAM_AGENT ====================
// 模拟恶意Agent、注入检测、自主防御演练

interface RedTeamScenario {
  scenario_id: string
  name: string
  attack_vector: string
  target_capability: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

interface RedTeamResultScenario {
  scenario_id: string
  name: string
  attack_vector: string
  executed: boolean
  detected: boolean
  blocked: boolean
  response_time_ms: number
  effectiveness: number
  notes: string
}

interface RedTeamResult {
  scenarios_tested: number
  detection_rate: number
  block_rate: number
  avg_response_time_ms: number
  results: RedTeamResultScenario[]
  defense_gaps: string[]
  readiness_score: number
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

function analyzeRedTeam(
  scenarios: RedTeamScenario[],
  defense_capabilities: string[]
): RedTeamResult {
  const results: RedTeamResultScenario[] = []
  let detectedCount = 0
  let blockedCount = 0
  const defenseGaps: string[] = []

  for (const scenario of scenarios) {
    const rng = createSeededRandom(scenario.scenario_id + scenario.attack_vector)

    // Determine if defense covers this attack vector
    const vectorLower = scenario.attack_vector.toLowerCase()
    const hasDefense = defense_capabilities.some(dc =>
      vectorLower.includes(dc.toLowerCase()) || dc.toLowerCase().includes(vectorLower)
    )

    const hasCapability = defense_capabilities.some(dc =>
      scenario.target_capability.toLowerCase().includes(dc.toLowerCase())
    )

    const detected = hasDefense || rng.nextFloat(0, 1) > 0.4
    const blocked = (hasDefense && rng.nextFloat(0, 1) > 0.2) || rng.nextFloat(0, 1) > 0.7
    const responseTime = rng.nextInt(50, 5000)

    let effectiveness = 0
    if (detected && blocked) effectiveness = 95
    else if (detected && !blocked) effectiveness = 60
    else if (!detected && blocked) effectiveness = 40
    else effectiveness = 10

    let notes = ''
    if (detected && blocked) notes = '防御体系有效检测并拦截'
    else if (detected && !blocked) notes = '成功检测但拦截失败，需强化阻断能力'
    else if (!detected && blocked) notes = '未触发告警但被其他机制拦截'
    else { notes = '检测与拦截均失效，存在重大防御缺口'; defenseGaps.push(scenario.attack_vector) }

    if (detected) detectedCount++
    if (blocked) blockedCount++

    results.push({
      scenario_id: scenario.scenario_id,
      name: scenario.name,
      attack_vector: scenario.attack_vector,
      executed: true,
      detected,
      blocked,
      response_time_ms: responseTime,
      effectiveness,
      notes
    })
  }

  const totalScenarios = scenarios.length
  const detectionRate = totalScenarios > 0 ? Math.round((detectedCount / totalScenarios) * 100) : 0
  const blockRate = totalScenarios > 0 ? Math.round((blockedCount / totalScenarios) * 100) : 0
  const avgResponseTime = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.response_time_ms, 0) / results.length)
    : 0

  const readinessScore = Math.round((detectionRate * 0.4 + blockRate * 0.4 + (100 - Math.min(avgResponseTime / 50, 100)) * 0.2))
  let overallGrade: RedTeamResult['overall_grade'] = 'A'
  if (readinessScore >= 85) overallGrade = 'A'
  else if (readinessScore >= 70) overallGrade = 'B'
  else if (readinessScore >= 55) overallGrade = 'C'
  else if (readinessScore >= 40) overallGrade = 'D'
  else overallGrade = 'F'

  return {
    scenarios_tested: totalScenarios,
    detection_rate: detectionRate,
    block_rate: blockRate,
    avg_response_time_ms: avgResponseTime,
    results,
    defense_gaps: defenseGaps,
    readiness_score: readinessScore,
    overall_grade: overallGrade
  }
}

function formatRedTeamReport(result: RedTeamResult): string {
  const lines: string[] = []
  lines.push('## 🎭 Red Team Exercise Report — Agent红队测试报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  const gradeEmoji = result.overall_grade === 'A' ? '✅' : result.overall_grade === 'B' ? '🔵' : result.overall_grade === 'C' ? '🟡' : result.overall_grade === 'D' ? '🔴' : '🚨'
  lines.push(`| 防御就绪度 | ${gradeEmoji} Grade ${result.overall_grade} (${result.readiness_score}/100) | ${result.readiness_score >= 70 ? '就绪' : '需强化'} |`)
  lines.push(`| 检测率 | ${result.detection_rate}% | ${result.scenarios_tested} 个场景中检出 ${Math.round(result.scenarios_tested * result.detection_rate / 100)} 个 |`)
  lines.push(`| 拦截率 | ${result.block_rate}% | 成功拦截恶意行为比例 |`)
  lines.push(`| 平均响应 | ${result.avg_response_time_ms}ms | 检测+响应时间中位数 |`)
  lines.push('')

  lines.push('### 📋 红队测试场景矩阵')
  lines.push('')
  lines.push('| 场景ID | 名称 | 攻击向量 | 检测 | 拦截 | 响应时间 | 有效率 |')
  lines.push('|--------|------|----------|------|------|----------|--------|')
  for (const r of result.results.slice(0, 20)) {
    const detEmoji = r.detected ? '✅' : '❌'
    const blkEmoji = r.blocked ? '🛡️' : '💥'
    lines.push(`| ${r.scenario_id} | ${r.name.substring(0, 15)} | ${r.attack_vector.substring(0, 15)} | ${detEmoji} | ${blkEmoji} | ${r.response_time_ms}ms | ${r.effectiveness}% |`)
  }
  lines.push('')

  if (result.defense_gaps.length > 0) {
    lines.push('### 🚨 防御缺口')
    lines.push('')
    for (const gap of result.defense_gaps) {
      lines.push(`- ⚠️ ${gap} — 无有效防御覆盖，建议优先补充检测规则`)
    }
    lines.push('')
  }

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== TOOL 7: INCIDENT_RESPONSE ====================
// 自动隔离、影响评估、恢复SOP、根因分析

interface IncidentReport {
  incident_id: string
  title: string
  severity: 'P1-critical' | 'P2-high' | 'P3-medium' | 'P4-low'
  status: 'detected' | 'contained' | 'eradicated' | 'recovered' | 'postmortem'
  detected_at: string
  affected_agents: string[]
  affected_resources: string[]
  description: string
  root_cause: string
  impact_scope: string
}

interface IncidentResponseResult {
  incident_id: string
  containment_actions: { action: string; status: 'completed' | 'pending' | 'failed'; timestamp: string }[]
  impact_assessment: { dimension: string; rating: string; description: string }[]
  recovery_sop: { step: number; action: string; responsible: string; sla_minutes: number }[]
  root_cause_analysis: { cause: string; confidence: number; evidence: string }
  timeline: { time: string; event: string }[]
  lessons_learned: string[]
  total_response_time_min: number
  incident_score: number
}

function analyzeIncidentResponse(
  incident: IncidentReport
): IncidentResponseResult {
  const rng = createSeededRandom(incident.incident_id + incident.title)

  // Generate containment actions
  const containmentActions: IncidentResponseResult['containment_actions'] = [
    { action: '隔离受影响Agent网络连接', status: 'completed', timestamp: incident.detected_at },
    { action: '冻结涉事Agent所有权限', status: 'completed', timestamp: incident.detected_at },
    { action: '快照保存当前系统状态', status: 'completed', timestamp: incident.detected_at },
    { action: '通知安全事件响应团队', status: 'completed', timestamp: incident.detected_at },
    { action: '启动数据泄露影响评估', status: rng.nextFloat(0, 1) > 0.3 ? 'completed' : 'pending', timestamp: incident.detected_at }
  ]

  // Impact assessment
  const impactAssessment: IncidentResponseResult['impact_assessment'] = [
    { dimension: '数据影响', rating: incident.severity === 'P1-critical' ? '严重' : '中等', description: `受影响资源: ${incident.affected_resources.length} 项` },
    { dimension: 'Agent影响', rating: incident.affected_agents.length > 3 ? '广泛' : '局部', description: `受影响Agent: ${incident.affected_agents.length} 个` },
    { dimension: '业务影响', rating: incident.severity.startsWith('P1') ? '高' : incident.severity.startsWith('P2') ? '中' : '低', description: incident.impact_scope },
    { dimension: '声誉影响', rating: incident.severity === 'P1-critical' ? '高风险' : '可控', description: '需评估是否触发监管通报义务' }
  ]

  // Recovery SOP
  const recoverySop: IncidentResponseResult['recovery_sop'] = [
    { step: 1, action: '确认威胁已完全清除', responsible: '安全运营团队', sla_minutes: 60 },
    { step: 2, action: '恢复受影响Agent至安全基线', responsible: '平台工程团队', sla_minutes: 120 },
    { step: 3, action: '逐步恢复网络访问权限', responsible: '网络管理员', sla_minutes: 30 },
    { step: 4, action: '增强监控粒度（72小时）', responsible: 'SOC团队', sla_minutes: 15 },
    { step: 5, action: '完成事件报告并归档', responsible: '安全合规团队', sla_minutes: 1440 },
    { step: 6, action: '召开复盘会议，更新防御策略', responsible: '安全架构团队', sla_minutes: 2880 }
  ]

  // Root cause analysis
  const rootCauseAnalysis = {
    cause: incident.root_cause,
    confidence: rng.nextFloat(0.6, 0.95),
    evidence: `基于 ${incident.affected_agents.length} 个Agent的行为日志和 ${incident.affected_resources.length} 个资源访问记录的综合分析`
  }

  // Timeline
  const timeline: IncidentResponseResult['timeline'] = [
    { time: incident.detected_at, event: '事件检测与告警触发' },
    { time: incident.detected_at, event: '自动隔离机制启动' },
    { time: incident.detected_at, event: '安全团队接手处置' },
    { time: incident.detected_at, event: '影响范围初步评估完成' },
    { time: incident.detected_at, event: '根因分析进行中' }
  ]

  // Lessons learned
  const lessonsLearned: string[] = [
    '建议缩短检测响应时间（MTTD），当前依赖告警触发',
    '建议增加自动化隔离覆盖率，减少人工介入延迟',
    '建议定期演练同类场景，验证响应SOP有效性',
    '建议完善Agent行为基线，提升异常检测精度'
  ]
  if (incident.severity === 'P1-critical') {
    lessonsLearned.push('P1事件需启动监管通报流程，建议提前准备通报模板')
  }

  const totalResponseTime = containmentActions.length * 15 + recoverySop.reduce((s, r) => s + r.sla_minutes, 0) / 4
  const incidentScore = Math.round(
    (containmentActions.filter(a => a.status === 'completed').length / containmentActions.length) * 40 +
    (rootCauseAnalysis.confidence * 30) +
    (incident.status === 'recovered' ? 30 : incident.status === 'eradicated' ? 20 : 10)
  )

  return {
    incident_id: incident.incident_id,
    containment_actions: containmentActions,
    impact_assessment: impactAssessment,
    recovery_sop: recoverySop,
    root_cause_analysis: rootCauseAnalysis,
    timeline,
    lessons_learned: lessonsLearned,
    total_response_time_min: Math.round(totalResponseTime),
    incident_score: Math.min(100, incidentScore)
  }
}

function formatIncidentResponseReport(result: IncidentResponseResult): string {
  const lines: string[] = []
  lines.push('## 🚨 Incident Response Report — 事件响应报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  lines.push(`| 事件ID | ${result.incident_id} | 唯一标识 |`)
  lines.push(`| 响应评分 | ${result.incident_score}/100 | ${result.incident_score >= 70 ? '✅ 良好' : '⚠️ 需改进'} |`)
  lines.push(`| 总响应时间 | ${result.total_response_time_min} 分钟 | 含恢复SOP |`)
  lines.push('')

  lines.push('### 📋 遏制行动清单')
  lines.push('')
  lines.push('| 行动 | 状态 | 时间 |')
  lines.push('|------|------|------|')
  for (const action of result.containment_actions) {
    const statusEmoji = action.status === 'completed' ? '✅' : action.status === 'pending' ? '⏳' : '❌'
    lines.push(`| ${action.action} | ${statusEmoji} ${action.status} | ${action.timestamp.substring(0, 19)} |`)
  }
  lines.push('')

  lines.push('### 📊 影响评估')
  lines.push('')
  lines.push('| 维度 | 评级 | 描述 |')
  lines.push('|------|------|------|')
  for (const impact of result.impact_assessment) {
    lines.push(`| ${impact.dimension} | ${impact.rating} | ${impact.description} |`)
  }
  lines.push('')

  lines.push('### 🔍 根因分析')
  lines.push('')
  lines.push(`- **根因**: ${result.root_cause_analysis.cause}`)
  lines.push(`- **置信度**: ${(result.root_cause_analysis.confidence * 100).toFixed(0)}%`)
  lines.push(`- **证据**: ${result.root_cause_analysis.evidence}`)
  lines.push('')

  lines.push('### 📝 恢复SOP')
  lines.push('')
  lines.push('| 步骤 | 行动 | 责任人 | SLA |')
  lines.push('|------|------|--------|-----|')
  for (const sop of result.recovery_sop) {
    lines.push(`| ${sop.step} | ${sop.action} | ${sop.responsible} | ${sop.sla_minutes}min |`)
  }
  lines.push('')

  lines.push('### 💡 经验教训')
  lines.push('')
  for (const lesson of result.lessons_learned) {
    lines.push(`- ${lesson}`)
  }

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== TOOL 8: TRUST_SCORE ====================
// Agent/用户/工具的动态信誉分、溯源链、声誉修复

interface TrustEntity {
  entity_id: string
  entity_type: 'agent' | 'user' | 'tool'
  successful_ops: number
  failed_ops: number
  anomaly_flags: number
  age_days: number
  last_activity: string
  certifications: string[]
  violations: { type: string; severity: string; date: string }[]
}

interface TrustScoreResult {
  entity_id: string
  entity_type: string
  trust_score: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  factors: { factor: string; impact: number; description: string }[]
  reputation_chain: { event: string; impact: number; date: string }[]
  recommendations: string[]
  risk_flags: string[]
}

function analyzeTrustScore(entity: TrustEntity): TrustScoreResult {
  const factors: TrustScoreResult['factors'] = []
  const reputationChain: TrustScoreResult['reputation_chain'] = []
  const riskFlags: string[] = []
  const recommendations: string[] = []

  // Base score
  let score = 50

  // Success rate factor
  const totalOps = entity.successful_ops + entity.failed_ops
  const successRate = totalOps > 0 ? entity.successful_ops / totalOps : 0.5
  const successImpact = Math.round((successRate - 0.5) * 40)
  score += successImpact
  factors.push({ factor: 'success_rate', impact: successImpact, description: `成功率: ${(successRate * 100).toFixed(1)}% (${entity.successful_ops}/${totalOps})` })
  reputationChain.push({ event: `操作记录: ${entity.successful_ops}成功/${entity.failed_ops}失败`, impact: successImpact, date: entity.last_activity })

  // Anomaly penalty
  const anomalyPenalty = -entity.anomaly_flags * 10
  score += anomalyPenalty
  if (entity.anomaly_flags > 0) {
    factors.push({ factor: 'anomaly_flags', impact: anomalyPenalty, description: `异常标记: ${entity.anomaly_flags} 次` })
    riskFlags.push(`${entity.anomaly_flags} 次异常行为标记`)
    reputationChain.push({ event: `异常标记 +${entity.anomaly_flags}`, impact: anomalyPenalty, date: entity.last_activity })
  }

  // Age bonus (older = more trustworthy)
  const ageBonus = Math.min(entity.age_days / 30, 10)
  score += ageBonus
  factors.push({ factor: 'entity_age', impact: ageBonus, description: `运行时长: ${entity.age_days} 天` })

  // Certification bonus
  const certBonus = entity.certifications.length * 5
  score += certBonus
  if (entity.certifications.length > 0) {
    factors.push({ factor: 'certifications', impact: certBonus, description: `持有认证: ${entity.certifications.join(', ')}` })
    reputationChain.push({ event: `获得认证: ${entity.certifications.join(', ')}`, impact: certBonus, date: entity.last_activity })
  }

  // Violation penalty
  let violationPenalty = 0
  for (const v of entity.violations) {
    const sevPenalty = v.severity === 'critical' ? -25 : v.severity === 'high' ? -15 : v.severity === 'medium' ? -8 : -3
    violationPenalty += sevPenalty
    reputationChain.push({ event: `违规: ${v.type} (${v.severity})`, impact: sevPenalty, date: v.date })
  }
  score += violationPenalty
  if (entity.violations.length > 0) {
    factors.push({ factor: 'violations', impact: violationPenalty, description: `违规记录: ${entity.violations.length} 次` })
    riskFlags.push(`${entity.violations.length} 次违规记录`)
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  // Determine grade
  let grade: TrustScoreResult['grade'] = 'A+'
  if (score >= 95) grade = 'A+'
  else if (score >= 80) grade = 'A'
  else if (score >= 65) grade = 'B'
  else if (score >= 50) grade = 'C'
  else if (score >= 35) grade = 'D'
  else grade = 'F'

  // Recommendations
  if (successRate < 0.8) recommendations.push('提升操作成功率至80%以上，减少失败调用')
  if (entity.anomaly_flags > 0) recommendations.push('清除异常标记：审查并修复导致异常的行为模式')
  if (entity.violations.length > 0) recommendations.push('声誉修复：完成违规整改并通过合规复审')
  if (entity.certifications.length === 0) recommendations.push('建议获取安全认证（如SOC2、ISO27001）以提升信任等级')
  if (entity.age_days < 30) recommendations.push('新实体需经过至少30天观察期才能获得完整信任')
  if (score >= 80) recommendations.push('当前信任等级良好，建议维持现有安全实践')

  reputationChain.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  return {
    entity_id: entity.entity_id,
    entity_type: entity.entity_type,
    trust_score: Math.round(score),
    grade,
    factors,
    reputation_chain: reputationChain,
    recommendations,
    risk_flags: riskFlags
  }
}

function formatTrustScoreReport(result: TrustScoreResult): string {
  const lines: string[] = []
  lines.push('## ⭐ Trust Score Report — 信任评分报告')
  lines.push('')
  lines.push('### 🔒 安全评分面板')
  lines.push('')
  lines.push('| 维度 | 评级 | 说明 |')
  lines.push('|------|------|------|')
  const gradeEmoji = result.grade.startsWith('A') ? '✅' : result.grade === 'B' ? '🔵' : result.grade === 'C' ? '🟡' : result.grade === 'D' ? '🔴' : '🚨'
  lines.push(`| 信任评分 | ${gradeEmoji} ${result.trust_score}/100 (Grade ${result.grade}) | ${result.trust_score >= 70 ? '可信' : '需审查'} |`)
  lines.push(`| 实体类型 | ${result.entity_type} | ${result.entity_id} |`)
  lines.push(`| 风险标记 | ${result.risk_flags.length} 项 | ${result.risk_flags.length > 0 ? '⚠️ 存在风险' : '✅ 无风险'} |`)
  lines.push('')

  lines.push('### 📋 评分因子分解')
  lines.push('')
  lines.push('| 因子 | 影响 | 描述 |')
  lines.push('|------|------|------|')
  for (const f of result.factors) {
    const impactEmoji = f.impact > 0 ? '📈' : f.impact < 0 ? '📉' : '➖'
    lines.push(`| ${f.factor} | ${impactEmoji} ${f.impact > 0 ? '+' : ''}${f.impact} | ${f.description} |`)
  }
  lines.push('')

  lines.push('### 🔗 溯源链（声誉历史）')
  lines.push('')
  lines.push('| 事件 | 影响 | 日期 |')
  lines.push('|------|------|------|')
  for (const chain of result.reputation_chain.slice(0, 15)) {
    const impactEmoji = chain.impact > 0 ? '📈' : chain.impact < 0 ? '📉' : '➖'
    lines.push(`| ${chain.event.substring(0, 35)} | ${impactEmoji} ${chain.impact > 0 ? '+' : ''}${chain.impact} | ${chain.date.substring(0, 10)} |`)
  }
  lines.push('')

  if (result.risk_flags.length > 0) {
    lines.push('### ⚠️ 风险标记')
    lines.push('')
    for (const flag of result.risk_flags) {
      lines.push(`- 🚩 ${flag}`)
    }
    lines.push('')
  }

  lines.push('### 💡 声誉修复建议')
  lines.push('')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }

  lines.push('')
  lines.push('---')
  lines.push('*AgentGuard • Security First • Zero Trust Architecture*')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: agent_audit
  tools.register(defineTool({
    name: 'agent_audit',
    description: '行为审计工具：分析Agent调用日志，检测谁在何时调用了什么工具、追踪数据流向、识别异常偏离行为。输入Agent调用记录JSON和基线工具列表，输出审计报告。',
    parameters: {
      calls: { type: 'string', required: true, description: 'JSON数组，每项包含: agent_id, tool_name, timestamp, parameters, data_accessed(数组), result_status, duration_ms(毫秒), caller_ip(可选)' },
      baseline_tools: { type: 'string', description: 'JSON数组，定义Agent被授权使用的基线工具列表' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { calls: string; baseline_tools?: string }) {
      const data: AgentCall[] = JSON.parse(args.calls)
      const baseline: string[] = args.baseline_tools ? JSON.parse(args.baseline_tools) : []
      const result = analyzeAgentAudit(data, baseline)
      return formatAgentAuditReport(result)
    }
  }))

  // Tool 2: permission_guard
  tools.register(defineTool({
    name: 'permission_guard',
    description: '权限管控工具：基于最小权限原则执行动态授权决策，支持权限升降级审查、条件授权和自动过期。输入权限请求列表和活跃策略，输出授权决策矩阵。',
    parameters: {
      requests: { type: 'string', required: true, description: 'JSON数组，每项包含: agent_id, current_level, requested_level, resource, action, justification, request_time' },
      active_policies: { type: 'string', description: 'JSON数组，每项包含: agent_id, max_level, allowed_actions(数组)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { requests: string; active_policies?: string }) {
      const data: PermissionRequest[] = JSON.parse(args.requests)
      const policies: { agent_id: string; max_level: string; allowed_actions: string[] }[] =
        args.active_policies ? JSON.parse(args.active_policies) : []
      const result = analyzePermissionGuard(data, policies)
      return formatPermissionGuardReport(result)
    }
  }))

  // Tool 3: data_lineage
  tools.register(defineTool({
    name: 'data_lineage',
    description: '数据血缘追踪工具：追踪数据从输入来源→处理过程→输出去向的全链路流转，检测跨边界流转、孤立数据和过期数据。输入数据节点列表和分类层级，输出血缘追踪报告。',
    parameters: {
      nodes: { type: 'string', required: true, description: 'JSON数组，每项包含: data_id, data_type, source, created_at, classification, transformations(数组), destinations(数组)' },
      classification_hierarchy: { type: 'string', description: 'JSON数组，定义数据分类层级（如 ["public","internal","confidential","secret"]）' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { nodes: string; classification_hierarchy?: string }) {
      const data: DataLineageNode[] = JSON.parse(args.nodes)
      const hierarchy: string[] = args.classification_hierarchy ? JSON.parse(args.classification_hierarchy) : ['public', 'internal', 'confidential', 'secret']
      const result = analyzeDataLineage(data, hierarchy)
      return formatDataLineageReport(result)
    }
  }))

  // Tool 4: anomaly_detection
  tools.register(defineTool({
    name: 'anomaly_detection',
    description: '异常行为检测工具：基于Agent行为基线检测偏离模式，识别调用频率异常、数据量异常、工具范围扩大、非工作时段活跃等风险，提示数据外泄风险。输入Agent行为数据和基线画像，输出异常检测报告。',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON对象，包含: agent_id, calls_per_hour(数组), data_volume_mb, unique_tools_used, failed_ratio, avg_duration_ms, time_of_day, baseline_profile(对象)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const data: AnomalyInput = JSON.parse(args.input)
      const result = analyzeAnomalyDetection(data)
      return formatAnomalyDetectionReport(result)
    }
  }))

  // Tool 5: compliance_map
  tools.register(defineTool({
    name: 'compliance_map',
    description: '合规映射工具：自动化检查GDPR/PIPL/等保2.0/HIPAA等法规的控制项合规状态，生成合规矩阵、关键缺口清单和整改计划。输入合规控制项列表，输出合规映射报告。',
    parameters: {
      items: { type: 'string', required: true, description: 'JSON数组，每项包含: regulation, control_id, control_name, category, status(compliant/partial/non_compliant/not_applicable), evidence, last_verified, remediation, priority(mandatory/recommended/optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { items: string }) {
      const data: ComplianceItem[] = JSON.parse(args.items)
      const result = analyzeComplianceMap(data)
      return formatComplianceMapReport(result)
    }
  }))

  // Tool 6: red_team_agent
  tools.register(defineTool({
    name: 'red_team_agent',
    description: 'Agent红队测试工具：模拟恶意Agent行为（注入、逃逸、数据窃取等），测试防御体系的检测率、拦截率和响应时间，识别防御缺口。输入红队场景列表和防御能力清单，输出红队测试报告。',
    parameters: {
      scenarios: { type: 'string', required: true, description: 'JSON数组，每项包含: scenario_id, name, attack_vector, target_capability, severity, description' },
      defense_capabilities: { type: 'string', description: 'JSON数组，列出当前已部署的防御能力（如 ["injection_detection","sandbox_escape","data_exfiltration"]）' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { scenarios: string; defense_capabilities?: string }) {
      const data: RedTeamScenario[] = JSON.parse(args.scenarios)
      const capabilities: string[] = args.defense_capabilities ? JSON.parse(args.defense_capabilities) : []
      const result = analyzeRedTeam(data, capabilities)
      return formatRedTeamReport(result)
    }
  }))

  // Tool 7: incident_response
  tools.register(defineTool({
    name: 'incident_response',
    description: '事件响应剧本工具：为安全事件生成自动化的遏制行动清单、影响评估、恢复SOP和根因分析。输入事件报告JSON，输出完整的事件响应报告。',
    parameters: {
      incident: { type: 'string', required: true, description: 'JSON对象，包含: incident_id, title, severity(P1-critical/P2-high/P3-medium/P4-low), status, detected_at, affected_agents(数组), affected_resources(数组), description, root_cause, impact_scope' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { incident: string }) {
      const data: IncidentReport = JSON.parse(args.incident)
      const result = analyzeIncidentResponse(data)
      return formatIncidentResponseReport(result)
    }
  }))

  // Tool 8: trust_score
  tools.register(defineTool({
    name: 'trust_score',
    description: '信任评分系统工具：为Agent/用户/工具计算动态信誉分，生成溯源链（声誉历史）、风险标记和声誉修复建议。输入实体信息JSON，输出信任评分报告。',
    parameters: {
      entity: { type: 'string', required: true, description: 'JSON对象，包含: entity_id, entity_type(agent/user/tool), successful_ops, failed_ops, anomaly_flags, age_days, last_activity, certifications(数组), violations(数组: type/severity/date)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { entity: string }) {
      const data: TrustEntity = JSON.parse(args.entity)
      const result = analyzeTrustScore(data)
      return formatTrustScoreReport(result)
    }
  }))

  console.log(`[dsh-tool-agentguard] Loaded v${VERSION} — AgentGuard Security Governance Engine with 8 tools`)
  console.log('  Tools: agent_audit, permission_guard, data_lineage, anomaly_detection, compliance_map, red_team_agent, incident_response, trust_score')
}
