import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'agentbuildercit'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeRequirementsDecomposition(data: any) {
  const goal = data.goal || ''
  const rules = data.constraints || []
  const complexity = goal.length > 50 ? '高' : goal.length > 20 ? '中' : '低'
  const subTasks = goal.split(/[，,。]/).filter((s: string) => s.trim())
  const agentRoles = subTasks.map((t: string, i: number) => ({
    id: `role_${i + 1}`,
    name: `子Agent_${i + 1}`,
    task: t.trim(),
    type: rules.includes('合规') ? '合规审查' : rules.includes('安全') ? '安全控制' : '通用'
  }))
  return { goal, complexity, subTaskCount: subTasks.length, agentRoles }
}
function formatRequirementsDecomp(r: any) {
  return `# 需求解构与逻辑建模
🎯 目标: ${r.goal}
📊 复杂度: ${r.complexity} | 子任务数: ${r.subTaskCount}
## Agent角色分配
${r.agentRoles.map((ar: any) => `- ${ar.name} (${ar.type}): ${ar.task}`).join('\n')}
---
💡 对标AI Agent搭建师"需求解构"职能，将模糊商业目标转为Agent可执行逻辑链。`
}
function analyzeWorkflowDesign(data: any) {
  const steps = data.steps || []
  const totalSteps = steps.length
  const hasPlanning = steps.some((s: any) => s.type === 'planning')
  const hasReview = steps.some((s: any) => s.type === 'review')
  const hasMemory = steps.some((s: any) => s.type === 'memory')
  const isAgentic = hasPlanning && hasReview && hasMemory
  const recommendations: string[] = []
  if (!hasPlanning) recommendations.push('建议增加Planning步骤（多步规划能力）')
  if (!hasReview) recommendations.push('建议增加Self-Review步骤（自我反思闭环）')
  if (!hasMemory) recommendations.push('建议增加Memory步骤（长期知识积累）')
  return { totalSteps, hasPlanning, hasReview, hasMemory, isAgentic, steps, recommendations }
}
function formatWorkflowDesign(r: any) {
  return `# 工作流设计建议
📊 当前步数: ${r.totalSteps} | Agentic闭环: ${r.isAgentic ? '✅ 是' : '❌ 否'}
- Planning: ${r.hasPlanning ? '✅' : '❌'} | Memory: ${r.hasMemory ? '✅' : '❌'} | Self-Review: ${r.hasReview ? '✅' : '❌'}
## 当前步骤
${r.steps.map((s: any, i: number) => `${i + 1}. ${s.name} (${s.type})`).join('\n')}
## 建议
${r.recommendations.map((x: any) => `- ${x}`).join('\n') || '设计已符合Agentic闭环要求'}
---
💠 对标AI Agent搭建师"工作流编排"职能，构建感知-思考-行动-反馈闭环。`
}
function analyzeToolOrchestration(data: any) {
  const tools = data.availableTools || []
  const required = data.requiredCapabilities || []
  const matched = required.filter((r: string) => tools.some((t: any) => t.capability?.includes(r) || t.name?.includes(r)))
  const unmatched = required.filter((r: string) => !matched.includes(r))
  const coverage = required.length > 0 ? ((matched.length / required.length) * 100).toFixed(0) : '100'
  return { totalTools: tools.length, requiredCount: required.length, matched, unmatched, coverage, recommendation: unmatched.length > 0 ? `缺失${unmatched.length}项能力需配置MCP/自定义工具` : '工具链完整' }
}
function formatToolOrchestration(r: any) {
  return `# 工具链编排评估
🔧 可用工具: ${r.totalTools} | 需求能力: ${r.requiredCount}
✅ 已覆盖: ${r.coverage}%
已匹配: ${r.matched.join(', ') || '无'}
❌ 缺失: ${r.unmatched.join(', ') || '无'}
💡 ${r.recommendation}
---
💠 对标AI Agent搭建师"工具调度"职能，采用A2A协议跨Agent协同。`
}
function analyzeMemoryConfig(data: any) {
  const config = data.memoryConfig || {}
  const hasShortTerm = !!(config.shortTerm?.enabled)
  const hasLongTerm = !!(config.longTerm?.enabled)
  const hasSemantic = !!(config.semanticSearch?.enabled)
  const hasEpisodic = !!(config.episodic?.enabled)
  const hasWorkingMemory = !!(config.working?.enabled)
  const maturity = [hasShortTerm, hasLongTerm, hasSemantic, hasEpisodic, hasWorkingMemory].filter(Boolean).length
  const recommendations: string[] = []
  if (!hasSemantic) recommendations.push('建议启用语义搜索知识库')
  if (!hasLongTerm) recommendations.push('建议启用长期记忆向量存储')
  if (!hasWorkingMemory) recommendations.push('建议启用工作记忆缓存')
  return { hasShortTerm, hasLongTerm, hasSemantic, hasEpisodic, hasWorkingMemory, maturity, total: 5, recommendations }
}
function formatMemoryConfig(r: any) {
  return `# 记忆系统配置
📊 成熟度: ${r.maturity}/${r.total}
- 短期记忆: ${r.hasShortTerm ? '✅' : '❌'}
- 长期记忆: ${r.hasLongTerm ? '✅' : '❌'}
- 语义检索: ${r.hasSemantic ? '✅' : '❌'}
- 情景记忆: ${r.hasEpisodic ? '✅' : '❌'}
- 工作记忆: ${r.hasWorkingMemory ? '✅' : '❌'}
## 建议
${r.recommendations.map((x: any) => `- ${x}`).join('\n') || '记忆系统配置完善'}
---
💠 对标AI Agent搭建师"Memory设计"职能，支撑Agent跨会话持续学习与积累。`
}
function analyzeTestingSimulation(data: any) {
  const testCases = data.testCases || []
  if (testCases.length === 0) return { total: 0, pass: 0, fail: 0, coverage: '0', result: '无测试用例', recommendation: '请至少配置10个测试场景' }
  let pass = 0
  const details: any[] = []
  for (const tc of testCases) {
    const passed = tc.expected && tc.actual && tc.expected.toString().slice(0, 30) === tc.actual.toString().slice(0, 30)
    if (passed) pass++
    details.push({ name: tc.name || '未命名', passed })
  }
  return { total: testCases.length, pass, fail: testCases.length - pass, details, coverage: ((pass / testCases.length) * 100).toFixed(0), recommendation: pass < testCases.length * 0.8 ? '通过率偏低，需调优提示词或调整工具链' : '通过率良好，可进入生产部署' }
}
function formatTestingSimulation(r: any) {
  return `# 测试与仿真报告
📊 总用例: ${r.total} | ✅ 通过: ${r.pass} | ❌ 失败: ${r.fail} | 覆盖率: ${r.coverage}%
## 用例详情
${r.details.map((d: any) => `- ${d.name}: ${d.passed ? '✅' : '❌'}`).join('\n') || '无测试用例'}
💡 ${r.recommendation}
---
💠 对标AI Agent搭建师"测试验证"职能，确保Agent在生产环境可靠运行。`
}
function analyzeIntegrationReadiness(data: any) {
  const systems = data.integrations || []
  if (systems.length === 0) return { total: 0, ready: 0, result: '无外部系统集成', recommendation: '建议至少配置CRM/ERP/HIS等关键系统' }
  const ready = systems.filter((s: any) => s.status === 'connected').length
  const pending = systems.filter((s: any) => s.status === 'pending').length
  const blocked = systems.filter((s: any) => s.status === 'blocked').length
  return { total: systems.length, ready, pending, blocked, systems, recommendation: blocked > 0 ? `${blocked}个阻塞需处理` : pending > 0 ? `${pending}个待处理` : '所有系统集成完成' }
}
function formatIntegrationReadiness(r: any) {
  return `# 系统集成就绪核查
📊 总计: ${r.total}个系统 | ✅ 已连通: ${r.ready} | ⏳ 待处理: ${r.pending} | ❌ 阻塞: ${r.blocked}
## 系统列表
${r.systems.map((s: any) => `- ${s.name}: ${s.status === 'connected' ? '✅ 连通' : s.status === 'pending' ? '⏳ 待处理' : '❌ 阻塞'}`).join('\n') || '无'}
💡 ${r.recommendation}
---
💠 对标AI Agent搭建师"系统集成"职能，无缝接入企业复杂IT生态（CRM/ERP/HRM/SaaS）。`
}
function analyzeCitizenDeveloperSuitability(data: any) {
  const profile = data.developerProfile || {}
  const codingLevel = profile.codingLevel || 'beginner'
  const domainExperience = profile.domainYears || 0
  const needsAgentCount = profile.targetAgentCount || 1
  const suitableForLowCode = codingLevel === 'beginner' || codingLevel === 'intermediate'
  const recommendation = domainExperience > 5 && suitableForLowCode ? '高度适合Agent搭建' :
    domainExperience > 2 && codingLevel !== 'expert' ? '适合但需培训' : '建议从现有模板起步'
  const tracks = [
    { name: '模板快速搭建', needs: '零代码', suitable: codingLevel === 'beginner' },
    { name: '引导式组装', needs: '基础编程', suitable: codingLevel === 'intermediate' },
    { name: '高级编排', needs: 'TypeScript/框架开发', suitable: codingLevel === 'expert' }
  ]
  return { profile, codingLevel, domainExperience, needsAgentCount, suitableForLowCode, recommendation, tracks }
}
function formatCitizenDeveloperSuitability(r: any) {
  return `# AI Agent搭建适合度评估
👤 开发者: 编程水平 ${r.codingLevel} | 领域经验 ${r.domainExperience}年 | 目标Agent: ${r.needsAgentCount}个
💡 结论: ${r.recommendation}
## 推荐路径
${r.tracks.filter((t: any) => t.suitable).map((t: any) => `- ✅ ${t.name} (${t.needs})`).join('\n') || '- 建议从低代码模板起步'}
---
💠 对标AI Agent搭建师职业：非传统码农也能成为Agent架构师，领域经验是核心资产。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'requirements_decomposer',
    description: '需求解构与逻辑建模：将模糊商业目标拆解为Agent可执行的子任务链，自动分配角色与协作关系',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"goal":"提高销售线索转化率15%","constraints":["合规","安全"]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRequirementsDecomp(analyzeRequirementsDecomposition(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'workflow_architect',
    description: '工作流编排设计：分析Agent流程完整性，给出Planning/Memory/Self-Review闭环建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"steps":[{"name":"识别线索","type":"planning"},{"name":"触达客户","type":"action"},{"name":"自我反思","type":"review"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatWorkflowDesign(analyzeWorkflowDesign(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'tool_chain_orchestrator',
    description: '工具链编排评估：比对所需能力与可用工具，输出覆盖率、缺失项和MCP配置建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"availableTools":[{"name":"web-search","capability":"internet-search"}],"requiredCapabilities":["internet-search","database-access"]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatToolOrchestration(analyzeToolOrchestration(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'memory_system_configurator',
    description: '记忆系统配置：分析Agent记忆架构完善度（语义/长期/短期/情景/工作五项），给出升级建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"memoryConfig":{"shortTerm":{"enabled":true},"longTerm":{"enabled":false},"semanticSearch":{"enabled":true},"episodic":{"enabled":false},"working":{"enabled":true}}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMemoryConfig(analyzeMemoryConfig(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'agent_test_simulator',
    description: '测试仿真评估：基于测试用例输出通过率、覆盖率、失败用例详情，给出调优建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"testCases":[{"name":"客户询问产品","expected":"输出产品方案","actual":"输出产品方案"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTestingSimulation(analyzeTestingSimulation(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'integration_readiness_checker',
    description: '系统集成就绪核查：检查CRM/ERP/HRM等关键系统连通状态，识别阻塞项',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"integrations":[{"name":"Salesforce-CRM","status":"connected"},{"name":"SAP-ERP","status":"pending"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatIntegrationReadiness(analyzeIntegrationReadiness(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'developer_suitability_assessment',
    description: '开发者适合度评估：根据编程水平、领域经验、目标推荐最适合的Agent搭建路径（模板/引导/高级）',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"developerProfile":{"codingLevel":"beginner","domainYears":8,"targetAgentCount":3}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCitizenDeveloperSuitability(analyzeCitizenDeveloperSuitability(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'agent_governance_configurator',
    description: 'Agent治理框架配置：根据企业规模与行业，自动生成Agent治理策略（权限边界、审计日志、人工介入点、回滚机制）',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"enterprise":{"size":"large","industry":"finance","region":"CN"},"agentCount":10,"riskLevel":"high"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const ent = d.enterprise || {}
      const size = ent.size || 'medium'
      const industry = ent.industry || 'general'
      const risk = d.riskLevel || 'medium'
      const governance = {
        permissionBoundary: size === 'large' ? '严格RBAC+最小权限' : '基础权限隔离',
        auditLog: risk === 'high' ? '全量审计+实时告警' : '关键操作审计',
        humanIntervention: industry === 'finance' ? '每笔交易人工复核' : '异常触发人工',
        rollback: '自动回滚+版本快照',
        compliance: ent.region === 'CN' ? '符合《生成式AI服务管理办法》' : '符合EU AI Act'
      }
      return `# Agent治理框架配置
🏢 企业: ${size}规模 | ${industry}行业 | ${ent.region || '未知'}
## 治理策略
- 权限边界: ${governance.permissionBoundary}
- 审计日志: ${governance.auditLog}
- 人工介入: ${governance.humanIntervention}
- 回滚机制: ${governance.rollback}
- 合规要求: ${governance.compliance}
---
💠 对标AI Agent搭建师"治理"职能：Agent规模化部署必须前置治理框架。`
    }
  }))
}
