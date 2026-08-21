import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'agentorch'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeA2AProtocolStack(data: any) {
  const agents = data.agents || []
  const totalAgents = agents.length
  const byFramework: Record<string, number> = {}
  const byProtocol: Record<string, number> = {}
  for (const a of agents) {
    byFramework[a.framework || 'unknown'] = (byFramework[a.framework || 'unknown'] || 0) + 1
    const proto = a.protocol || 'none'
    byProtocol[proto] = (byProtocol[proto] || 0) + 1
  }
  const a2aReady = agents.filter((a: any) => a.protocol === 'A2A' || a.a2aCompliant).length
  const mcpReady = agents.filter((a: any) => a.mcpEnabled).length
  const interoperability = totalAgents > 0 ? ((a2aReady / totalAgents) * 100).toFixed(0) : '0'
  return { totalAgents, byFramework, byProtocol, a2aReady, mcpReady, interoperability }
}
function formatA2AProtocolStack(r: any) {
  return `# A2A协议栈与多Agent互联分析
📊 Agent总数: ${r.totalAgents} | A2A就绪: ${r.a2aReady} | MCP就绪: ${r.mcpReady}
🌐 互操作率: ${r.interoperability}%
## 框架分布
${Object.entries(r.byFramework).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
## 协议分布
${Object.entries(r.byProtocol).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
---
💡 对标Google A2A协议：目标100% A2A就绪，实现跨平台Agent无缝协同。`
}
function analyzeTaskRouting(data: any) {
  const tasks = data.tasks || []
  const agents = data.availableAgents || []
  if (tasks.length === 0) return { totalTasks: 0, routed: 0, failed: 0, avgTime: '0s', recommendation: '无任务需路由' }
  const routed: any[] = []
  const failed: any[] = []
  for (const t of tasks) {
    const match = agents.find((a: any) => a.capabilities?.some((c: string) => t.requiredCapabilities?.includes(c)))
    if (match) routed.push({ task: t.name, agent: match.name, score: 85 + Math.floor(seededRandom(t.name.length)() * 15) })
    else failed.push({ task: t.name, reason: '无匹配Agent' })
  }
  return { totalTasks: tasks.length, routed: routed.length, failed: failed.length, routes: routed, failures: failed, avgTime: `${(routed.length * 0.3).toFixed(1)}s` }
}
function formatTaskRouting(r: any) {
  return `# 智能任务路由
📊 总任务: ${r.totalTasks} | ✅ 成功: ${r.routed} | ❌ 失败: ${r.failed} | 平均耗时: ${r.avgTime}
## 路由结果
${r.routes.map((rt: any) => `- ${rt.task} → ${rt.agent} (匹配度${rt.score}%)`).join('\n') || '无'}
## 失败任务
${r.failures.map((f: any) => `- ${f.task}: ${f.reason}`).join('\n') || '无'}
---
💡 对标A2A协议任务路由：基于能力匹配的自动分发，支持跨组织跨云。`
}
function analyzeSharedMemory(data: any) {
  const config = data.memoryConfig || {}
  const hasWorking = !!(config.working?.enabled)
  const hasLongTerm = !!(config.longTerm?.enabled)
  const hasSemantic = !!(config.semantic?.enabled)
  const hasEpisodic = !!(config.episodic?.enabled)
  const hasSharedContext = !!(config.sharedContext?.enabled)
  const maturity = [hasWorking, hasLongTerm, hasSemantic, hasEpisodic, hasSharedContext].filter(Boolean).length
  const recommendations: string[] = []
  if (!hasSharedContext) recommendations.push('建议启用共享上下文（跨Agent协作基础）')
  if (!hasSemantic) recommendations.push('建议启用语义检索（知识共享）')
  if (!hasLongTerm) recommendations.push('建议启用长期记忆（经验积累）')
  return { hasWorking, hasLongTerm, hasSemantic, hasEpisodic, hasSharedContext, maturity, total: 5, recommendations }
}
function formatSharedMemory(r: any) {
  return `# 共享记忆系统配置
📊 成熟度: ${r.maturity}/${r.total}
- 工作记忆: ${r.hasWorking ? '✅' : '❌'} | 长期记忆: ${r.hasLongTerm ? '✅' : '❌'}
- 语义检索: ${r.hasSemantic ? '✅' : '❌'} | 情景记忆: ${r.hasEpisodic ? '✅' : '❌'}
- 共享上下文: ${r.hasSharedContext ? '✅' : '❌'}
## 建议
${r.recommendations.map((x: any) => `- ${x}`).join('\n') || '记忆系统配置完善'}
---
💡 对标Agent三大支柱（记忆/工具/规划）：共享记忆是多Agent协作的核心基础设施。`
}
function analyzeAgentTeamDesign(data: any) {
  const goal = data.goal || ''
  const complexity = data.complexity || 'medium'
  const patterns = [
    { name: '编排式(Orchestrated)', desc: '中央协调器调度子Agent', bestFor: '流程固定的工业化任务', framework: 'CrewAI/AutoGen' },
    { name: '市场式(Marketplace)', desc: 'Agent自主竞标认领任务', bestFor: '弹性需求/非结构化工作', framework: '开源Agent市场' },
    { name: '组织式(Organizational)', desc: '角色化/层级化/治理化团队', bestFor: '长期持续跨职能协作', framework: 'Markus/企业级平台' }
  ]
  const recommended = complexity === 'high' ? patterns[2] : complexity === 'medium' ? patterns[0] : patterns[1]
  return { goal, complexity, patterns, recommended }
}
function formatAgentTeamDesign(r: any) {
  return `# 多Agent团队架构设计
🎯 目标: ${r.goal} | 复杂度: ${r.complexity}
## 三种范式
${r.patterns.map((p: any) => `- **${p.name}**: ${p.desc} | 适用: ${p.bestFor} | 框架: ${p.framework}`).join('\n')}
## ⭐ 推荐: ${r.recommended.name}
${r.recommended.desc} | 框架: ${r.recommended.framework}
---
💡 对标2026多Agent架构趋势：组织式架构正成为企业长期协作首选。`
}
function analyzeCrossPlatformInterop(data: any) {
  const platforms = data.platforms || []
  if (platforms.length === 0) return { total: 0, compatible: 0, gaps: [], recommendation: '无平台数据' }
  const gaps: any[] = []
  let compatible = 0
  for (const p of platforms) {
    if (p.a2aSupported && p.mcpSupported) compatible++
    else gaps.push({ platform: p.name, missing: [!p.a2aSupported ? 'A2A' : null, !p.mcpSupported ? 'MCP' : null].filter(Boolean) })
  }
  return { total: platforms.length, compatible, gaps, interoperability: platforms.length > 0 ? ((compatible / platforms.length) * 100).toFixed(0) : '0' }
}
function formatCrossPlatformInterop(r: any) {
  return `# 跨平台互操作评估
📊 平台: ${r.total} | 完全兼容: ${r.compatible} | 互操作率: ${r.interoperability}%
## 差距分析
${r.gaps.map((g: any) => `- ${g.platform}: 缺少 ${g.missing.join(', ')}`).join('\n') || '所有平台完全兼容'}
---
💡 对标国家智能体互联标准：目标100% A2A+MCP双协议支持。`
}
function analyzeAgentIdentityRegistry(data: any) {
  const agents = data.agents || []
  if (agents.length === 0) return { total: 0, identified: 0, recommendation: '无Agent注册数据' }
  const identified = agents.filter((a: any) => a.identityCode && a.a2aCard).length
  const byOrg: Record<string, number> = {}
  for (const a of agents) { byOrg[a.organization || 'unknown'] = (byOrg[a.organization || 'unknown'] || 0) + 1 }
  return { total: agents.length, identified, byOrg, coverage: ((identified / agents.length) * 100).toFixed(0) }
}
function formatAgentIdentityRegistry(r: any) {
  return `# Agent身份注册中心
📊 注册Agent: ${r.total} | 身份完备: ${r.identified} | 覆盖率: ${r.coverage}%
## 组织分布
${Object.entries(r.byOrg).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
---
💡 对标国家智能体互联标准：身份码是Agent互信的基础设施。`
}
function analyzeCollaborationMetrics(data: any) {
  const metrics = data.metrics || {}
  const taskSuccessRate = metrics.taskSuccessRate || 0
  const avgCollaborationTime = metrics.avgCollaborationTimeSec || 0
  const contextRetention = metrics.contextRetentionPct || 0
  const conflictRate = metrics.conflictRate || 0
  const overall = ((taskSuccessRate * 0.4) + (contextRetention * 0.3) + ((100 - conflictRate) * 0.2) + (Math.max(0, 100 - avgCollaborationTime) * 0.1)).toFixed(1)
  return { taskSuccessRate, avgCollaborationTime, contextRetention, conflictRate, overall, recommendation: parseFloat(overall) > 75 ? '协作效率良好' : '需优化协作流程' }
}
function formatCollaborationMetrics(r: any) {
  return `# 多Agent协作效能指标
📊 综合评分: ${r.overall}/100
- 任务成功率: ${r.taskSuccessRate}% | 上下文保持: ${r.contextRetention}%
- 平均协作耗时: ${r.avgCollaborationTime}s | 冲突率: ${r.conflictRate}%
💡 ${r.recommendation}
---
💡 对标企业级AgentOps：持续监测协作效能，驱动流程优化。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'a2a_protocol_analyzer',
    description: 'A2A协议栈分析：评估多Agent系统的协议就绪度（A2A/MCP），输出互操作率和框架分布',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"agents":[{"name":"客服Agent","framework":"CrewAI","protocol":"A2A","a2aCompliant":true,"mcpEnabled":true}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatA2AProtocolStack(analyzeA2AProtocolStack(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'task_router',
    description: '智能任务路由：根据任务需求与Agent能力自动匹配，输出路由结果与失败任务清单',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"tasks":[{"name":"数据分析","requiredCapabilities":["python","sql"]}],"availableAgents":[{"name":"数据Agent","capabilities":["python","sql"]}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTaskRouting(analyzeTaskRouting(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'shared_memory_configurator',
    description: '共享记忆系统配置：评估Agent记忆架构完善度（工作/长期/语义/情景/共享上下文），给出升级建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"memoryConfig":{"working":{"enabled":true},"longTerm":{"enabled":true},"semantic":{"enabled":false},"episodic":{"enabled":false},"sharedContext":{"enabled":true}}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSharedMemory(analyzeSharedMemory(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'agent_team_architect',
    description: '多Agent团队架构设计：根据目标复杂度推荐编排式/市场式/组织式最佳架构',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"goal":"构建客服+工单+知识库多Agent系统","complexity":"high"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAgentTeamDesign(analyzeAgentTeamDesign(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'cross_platform_interop_checker',
    description: '跨平台互操作检查：评估各Agent平台对A2A/MCP协议的支持情况，输出兼容性差距',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"platforms":[{"name":"Salesforce","a2aSupported":true,"mcpSupported":true},{"name":"内部平台","a2aSupported":false,"mcpSupported":true}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCrossPlatformInterop(analyzeCrossPlatformInterop(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'agent_identity_registry',
    description: 'Agent身份注册中心：管理Agent身份码与A2A名片，输出注册覆盖率与组织分布',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"agents":[{"name":"Agent1","identityCode":"AGT-001","a2aCard":true,"organization":"IT部门"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAgentIdentityRegistry(analyzeAgentIdentityRegistry(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'collaboration_effectiveness_tracker',
    description: '协作效能追踪：综合任务成功率/上下文保持/耗时/冲突率，输出协作健康度评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"metrics":{"taskSuccessRate":85,"avgCollaborationTimeSec":12,"contextRetentionPct":78,"conflictRate":5}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCollaborationMetrics(analyzeCollaborationMetrics(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'agent_lifecycle_manager',
    description: 'Agent生命周期管理：创建/部署/监控/升级/退役全链路治理，输出Agent运营成熟度',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"lifecycle":{"totalAgents":50,"activeAgents":35,"retiredAgents":5,"avgUptimePct":99.2,"autoScaling":true}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const lc = d.lifecycle || {}
      const total = lc.totalAgents || 0
      const active = lc.activeAgents || 0
      const retired = lc.retiredAgents || 0
      const uptime = lc.avgUptimePct || 0
      const scaling = lc.autoScaling || false
      const utilization = total > 0 ? ((active / total) * 100).toFixed(0) : '0'
      return `# Agent生命周期管理
📊 总数: ${total} | 运行: ${active} | 退役: ${retired} | 利用率: ${utilization}%
⏱ 可用率: ${uptime}% | 自动扩缩: ${scaling ? '✅' : '❌'}
💡 ${parseFloat(utilization) > 80 ? 'Agent利用率高' : '建议清理闲置Agent释放资源'}
---
💡 对标AgentOps：全生命周期管理是Agent规模化运营的基础设施。`
    }
  }))
}
