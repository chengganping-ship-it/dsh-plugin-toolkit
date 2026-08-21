import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'agentgovernance'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzePermissionControl(data: any) {
  const permissions = data.agentPermissions || []
  if (permissions.length === 0) { return { total: 0, overPrivileged: 0, score: 0, recommendation: '无权限数据' } }
  const overPrivileged = permissions.filter((p: any) => p.accessLevel > p.requiredLevel).length
  const leastPrivilege = permissions.filter((p: any) => p.accessLevel === p.requiredLevel).length
  const score = ((leastPrivilege / permissions.length) * 100).toFixed(0)
  const issues = permissions.filter((p: any) => p.accessLevel > p.requiredLevel).map((p: any) => `${p.agentName || p.agentId}: 超权${p.accessLevel - p.requiredLevel}级`)
  return { total: permissions.length, overPrivileged, leastPrivilege, score, issues, recommendation: parseInt(score) > 80 ? '权限控制良好' : '存在过度授权，建议收权' }
}
function formatPermissionControl(r: any) {
  return `# Agent权限控制评估
📊 Agent权限: ${r.total} | ✅ 最小权限: ${r.leastPrivilege} | ⚠️ 超权: ${r.overPrivileged} | 评分: ${r.score}/100
## 超权问题
${r.issues.map((i: any) => `- ⚠️ ${i}`).join('\n') || '无超权'}
💡 ${r.recommendation}
---
💡 对标最小权限原则：Agent只授予执行任务所需的最小权限，防止越权操作。`
}
function analyzeAuditTrail(data: any) {
  const audit = data.auditConfig || {}
  const hasFullLog = !!(audit.fullLog?.enabled)
  const hasRealTimeAlert = !!(audit.realTimeAlert?.enabled)
  const hasImmutable = !!(audit.immutableLog?.enabled)
  const hasRetention = !!(audit.retentionPolicy?.enabled)
  const hasAccessControl = !!(audit.accessControl?.enabled)
  const score = [hasFullLog, hasRealTimeAlert, hasImmutable, hasRetention, hasAccessControl].filter(Boolean).length
  return { hasFullLog, hasRealTimeAlert, hasImmutable, hasRetention, hasAccessControl, score, total: 5, recommendation: score < 3 ? '审计体系不完善，建议补齐关键能力' : '审计体系健全' }
}
function formatAuditTrail(r: any) {
  return `# Agent审计追踪体系
📊 成熟度: ${r.score}/${r.total}
- 全量日志: ${r.hasFullLog ? '✅' : '❌'} | 实时告警: ${r.hasRealTimeAlert ? '✅' : '❌'}
- 不可篡改: ${r.hasImmutable ? '✅' : '❌'} | 保留策略: ${r.hasRetention ? '✅' : '❌'}
- 访问控制: ${r.hasAccessControl ? '✅' : '❌'}
💡 ${r.recommendation}
---
💡 对标AgentOps体系：审计追踪是事后追责与合规举证的核心基础设施。`
}
function analyzeComplianceCheck(data: any) {
  const regulations = data.regulations || []
  const results = regulations.map((reg: any) => {
    const items = reg.items || []
    const passed = items.filter((i: any) => i.status === 'pass').length
    return { name: reg.name, passed, total: items.length, pct: items.length > 0 ? ((passed / items.length) * 100).toFixed(0) : '0' }
  })
  const totalPassed = results.reduce((a: number, r: any) => a + r.passed, 0)
  const totalItems = results.reduce((a: number, r: any) => a + r.total, 0)
  const overall = totalItems > 0 ? ((totalPassed / totalItems) * 100).toFixed(0) : '0'
  return { results, totalPassed, totalItems, overall, recommendation: parseInt(overall) > 85 ? '整体合规良好' : '存在合规差距，建议整改' }
}
function formatComplianceCheck(r: any) {
  return `# Agent合规检查（AI治理框架）
📊 整体合规率: ${r.overall}% | 通过: ${r.totalPassed}/${r.totalItems}
## 各法规明细
${r.results.map((r: any) => `- ${r.name}: ${r.pct}% (${r.passed}/${r.total})`).join('\n') || '无合规项'}
💡 ${r.recommendation}
---
💡 对标EU AI Act + 中国《生成式AI服务管理办法》：合规是Agent规模化部署的前提条件。`
}
function analyzeRiskAssessment(data: any) {
  const risks = data.identifiedRisks || []
  if (risks.length === 0) return { total: 0, high: 0, medium: 0, low: 0, score: 100, recommendation: '未识别风险' }
  const high = risks.filter((r: any) => r.severity === 'high').length
  const medium = risks.filter((r: any) => r.severity === 'medium').length
  const low = risks.filter((r: any) => r.severity === 'low').length
  const score = Math.max(0, 100 - high * 20 - medium * 10 - low * 3)
  const sorted = risks.sort((a: any, b: any) => { const m: any = { high: 3, medium: 2, low: 1 }; return (m[b.severity] || 0) - (m[a.severity] || 0) })
  return { total: risks.length, high, medium, low, score, topRisks: sorted.slice(0, 3), recommendation: high > 0 ? `${high}个高风险项需立即处理` : '风险水位达标' }
}
function formatRiskAssessment(r: any) {
  return `# Agent风险评估
📊 评分: ${r.score}/100 | 风险总数: ${r.total} | 🔴 高: ${r.high} | 🟡 中: ${r.medium} | 🟢 低: ${r.low}
## 主要风险
${r.topRisks.map((r: any) => `- ${r.severity === 'high' ? '🔴' : r.severity === 'medium' ? '🟡' : '🟢'} ${r.name}: ${r.description || ''}`).join('\n') || '无'}
💡 ${r.recommendation}
---
💡 对标企业AI治理框架：风险评估是Agent持续运营的基础，建议定期复评。`
}
function analyzeDataProtection(data: any) {
  const protection = data.dataProtection || {}
  const hasEncryption = !!(protection.encryption?.enabled)
  const hasAnonymization = !!(protection.anonymization?.enabled)
  const hasAccessControl = !!(protection.accessControl?.enabled)
  const hasDataMinimization = !!(protection.dataMinimization?.enabled)
  const hasRightToDeletion = !!(protection.rightToDeletion?.enabled)
  const score = [hasEncryption, hasAnonymization, hasAccessControl, hasDataMinimization, hasRightToDeletion].filter(Boolean).length
  return { hasEncryption, hasAnonymization, hasAccessControl, hasDataMinimization, hasRightToDeletion, score, total: 5, recommendation: score < 3 ? '数据保护存在短板，建议加强' : '数据保护措施完善' }
}
function formatDataProtection(r: any) {
  return `# Agent数据保护评估
📊 成熟度: ${r.score}/${r.total}
- 数据加密: ${r.hasEncryption ? '✅' : '❌'} | 匿名化: ${r.hasAnonymization ? '✅' : '❌'}
- 访问控制: ${r.hasAccessControl ? '✅' : '❌'} | 数据最小化: ${r.hasDataMinimization ? '✅' : '❌'}
- 删除权: ${r.hasRightToDeletion ? '✅' : '❌'}
💡 ${r.recommendation}
---
💡 对标GDPR/PIPL：数据保护是Agent信任的基石，违规成本极高。`
}
function analyzeGovernanceMaturity(data: any) {
  const dims = data.dimensions || []
  const defaultDims = [
    { name: '策略与规范', score: 0 },
    { name: '权限控制', score: 0 },
    { name: '审计追踪', score: 0 },
    { name: '风险评估', score: 0 },
    { name: '数据保护', score: 0 },
    { name: '应急响应', score: 0 }
  ]
  const merged = defaultDims.map((d: any) => {
    const found = dims.find((dd: any) => dd.name === d.name)
    return found ? { ...d, score: found.score } : d
  })
  const avg = merged.length > 0 ? (merged.reduce((a: number, d: any) => a + (d.score || 0), 0) / merged.length).toFixed(1) : '0'
  const level = parseFloat(avg) > 8 ? '成熟' : parseFloat(avg) > 6 ? '发展中' : parseFloat(avg) > 4 ? '初始' : '缺失'
  return { dimensions: merged, avg, level, recommendation: parseFloat(avg) > 7 ? '治理成熟度良好' : '建议系统性提升治理能力' }
}
function formatGovernanceMaturity(r: any) {
  return `# Agent治理成熟度评估
📊 综合分: ${r.avg}/10 | 等级: ${r.level}
## 六维评估
${r.dimensions.map((d: any) => `- ${d.name}: ${d.score || '-'}/10 ${d.score >= 7 ? '✅' : d.score >= 4 ? '⚠️' : '❌'}`).join('\n')}
💡 ${r.recommendation}
---
💡 对标Markus组织式治理框架：角色化+层级化+治理化的Agent团队是企业级AI的终极形态。`
}
function analyzeIncidentResponse(data: any) {
  const incidents = data.incidents || []
  if (incidents.length === 0) return { total: 0, avgResponseMin: 0, resolved: 0, score: 100, recommendation: '历史无事故' }
  const resolved = incidents.filter((i: any) => i.resolved).length
  const avgResponse = incidents.reduce((a: any, i: any) => a + (i.responseTimeMin || 0), 0) / incidents.length
  const score = Math.max(0, 100 - (avgResponse > 30 ? 40 : avgResponse > 10 ? 20 : 0) - (incidents.length - resolved) * 15)
  return { total: incidents.length, resolved, avgResponseMin: avgResponse.toFixed(0), score, recommendation: score > 70 ? '应急响应能力良好' : '需优化响应流程演练' }
}
function formatIncidentResponse(r: any) {
  return `# Agent应急响应评估
📊 评分: ${r.score}/100 | 历史事件: ${r.total} | 已解决: ${r.resolved} | 平均响应: ${r.avgResponseMin}分钟
💡 ${r.recommendation}
---
💡 对标AgentOps体系：7×24小时监控+自动告警+应急预案 = Agent安全运营的保障。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'permission_controller',
    description: 'Agent权限控制评估：检查Agent是否遵循最小权限原则，识别超权Agent，给出收权建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"agentPermissions":[{"agentId":"A1","agentName":"客服Agent","requiredLevel":2,"accessLevel":4}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPermissionControl(analyzePermissionControl(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'audit_trail_checker',
    description: '审计追踪体系检查：评估全量日志/实时告警/不可篡改/保留策略/访问控制五项能力',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"auditConfig":{"fullLog":{"enabled":true},"realTimeAlert":{"enabled":true},"immutableLog":{"enabled":false},"retentionPolicy":{"enabled":true},"accessControl":{"enabled":true}}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAuditTrail(analyzeAuditTrail(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'compliance_checker',
    description: 'Agent合规检查：对照EU AI Act/中国生成式AI管理办法等多法规输出合规差距',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"regulations":[{"name":"EU AI Act","items":[{"item":"风险评估","status":"pass"},{"item":"人类监督","status":"fail"}]}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatComplianceCheck(analyzeComplianceCheck(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'risk_assessor',
    description: 'Agent风险评估：识别高/中/低风险项，按严重度排序，输出TOP3风险与建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"identifiedRisks":[{"name":"权限越界","severity":"high","description":"Agent可访问非授权数据"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRiskAssessment(analyzeRiskAssessment(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'data_protection_evaluator',
    description: '数据保护评估：加密/匿名化/访问控制/数据最小化/删除权五维成熟度',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"dataProtection":{"encryption":{"enabled":true},"anonymization":{"enabled":true},"accessControl":{"enabled":true},"dataMinimization":{"enabled":false},"rightToDeletion":{"enabled":false}}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatDataProtection(analyzeDataProtection(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'governance_maturity_assessor',
    description: '治理成熟度评估：策略规范/权限控制/审计追踪/风险评估/数据保护/应急响应六维评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"dimensions":[{"name":"策略与规范","score":7},{"name":"权限控制","score":8}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatGovernanceMaturity(analyzeGovernanceMaturity(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'incident_response_evaluator',
    description: '应急响应评估：历史事件数/解决率/平均响应时间，给出响应能力评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"incidents":[{"name":"数据泄露","resolved":true,"responseTimeMin":15}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatIncidentResponse(analyzeIncidentResponse(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'human_oversight_configurator',
    description: '人类监督机制配置：设置人工介入触发条件（高风险操作/金额阈值/敏感数据），确保人类在环',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"oversight":{"highRiskReview":true,"amountThresholdYuan":10000,"sensitiveDataReview":true,"humanEscalationPct":5}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const o = d.oversight || {}
      return `# 人类监督机制（Human-in-the-Loop）
📊 高风险审查: ${o.highRiskReview ? '✅' : '❌'} | 金额阈值: ¥${o.amountThresholdYuan?.toLocaleString() || '-'}
🔒 敏感数据审查: ${o.sensitiveDataReview ? '✅' : '❌'} | 人工升级率: ${o.humanEscalationPct || 0}%
💡 ${o.highRiskReview && o.sensitiveDataReview ? '人类监督机制完善' : '建议补齐关键监督节点'}
---
💡 对标EU AI Act第14条：高风险AI系统必须设计有效的人类监督机制。`
    }
  }))
}
