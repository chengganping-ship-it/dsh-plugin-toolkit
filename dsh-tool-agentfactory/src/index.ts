import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
export const name = 'agentfactory'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeTemplateLibrary(data: any) {
  const templates = data.templates || []
  if (templates.length === 0) return { total: 0, byCategory: {}, topUsed: [], recommendation: '无模板数据' }
  const byCategory: Record<string, number> = {}
  for (const t of templates) { byCategory[t.category || '通用'] = (byCategory[t.category || '通用'] || 0) + 1 }
  const topUsed = templates.sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5).map((t: any) => t.name)
  return { total: templates.length, byCategory, topUsed, recommendation: templates.length < 20 ? '建议扩充模板库覆盖更多场景' : '模板库丰富度良好' }
}
function formatTemplateLibrary(r: any) {
  return `# 智能体模板库
📊 模板总数: ${r.total}
## 类目分布
${Object.entries(r.byCategory).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
## TOP5热门
${r.topUsed.map((n: any, i: number) => `${i + 1}. ${n}`).join('\n') || '无'}
💡 ${r.recommendation}
---
💡 对标智能体工厂：模板化生产是规模化Agent制造的基础，复用率决定效率。`
}
function analyzeBuildPipeline(data: any) {
  const pipeline = data.pipeline || {}
  const stages = [
    { name: '需求配置', status: pipeline.requirements ? 'done' : 'pending', time: '5min' },
    { name: '模板选择', status: pipeline.template ? 'done' : 'pending', time: '3min' },
    { name: '知识库挂载', status: pipeline.knowledgeBase ? 'done' : 'pending', time: '10min' },
    { name: '工具链绑定', status: pipeline.tools ? 'done' : 'pending', time: '8min' },
    { name: '测试验证', status: pipeline.testing ? 'done' : 'pending', time: '15min' },
    { name: '部署上线', status: pipeline.deployment ? 'done' : 'pending', time: '5min' }
  ]
  const done = stages.filter(s => s.status === 'done').length
  return { stages, done, total: stages.length, completionRate: ((done / stages.length) * 100).toFixed(0), recommendation: done === stages.length ? '流水线完整，可自动化生产' : `${stages.length - done}个阶段待完善` }
}
function formatBuildPipeline(r: any) {
  return `# Agent构建流水线
📊 完成度: ${r.done}/${r.total} | 覆盖率: ${r.completionRate}%
${r.stages.map((s: any) => `- ${s.name}: ${s.status === 'done' ? '✅' : '❌'} (${s.time})`).join('\n')}
💡 ${r.recommendation}
---
💡 对标DevOps：Agent工厂需要标准化流水线，实现Agent的规模化生产与持续交付。`
}
function analyzeTestingFramework(data: any) {
  const tests = data.tests || []
  if (tests.length === 0) return { total: 0, pass: 0, passRate: '0', recommendation: '无测试数据' }
  const pass = tests.filter((t: any) => t.status === 'pass').length
  const automation = tests.filter((t: any) => t.automated).length
  const passRate = ((pass / tests.length) * 100).toFixed(1)
  const automationRate = ((automation / tests.length) * 100).toFixed(0)
  return { total: tests.length, pass, fail: tests.length - pass, passRate, automationRate, recommendation: parseFloat(passRate) > 85 ? '测试通过率良好' : `${tests.length - pass}个用例需修复` }
}
function formatTestingFramework(r: any) {
  return `# Agent测试框架
📊 测试用例: ${r.total} | ✅ 通过: ${r.pass} | ❌ 失败: ${r.fail} | 通过率: ${r.passRate}%
🤖 自动化率: ${r.automationRate}%
💡 ${r.recommendation}
---
💡 对标QA体系：Agent上线前必须通过功能/安全/性能/合规四维测试，自动化率决定交付速度。`
}
function analyzeDeploymentScale(data: any) {
  const deploys = data.deployments || []
  if (deploys.length === 0) return { total: 0, running: 0, recommendation: '无部署数据' }
  const running = deploys.filter((d: any) => d.status === 'running').length
  const byEnv: Record<string, number> = {}
  for (const d of deploys) { byEnv[d.env || 'unknown'] = (byEnv[d.env || 'unknown'] || 0) + 1 }
  return { total: deploys.length, running, byEnv, uptime: deploys.length > 0 ? (deploys.reduce((a: number, d: any) => a + (d.uptimePct || 99), 0) / deploys.length).toFixed(1) : '0', recommendation: running < deploys.length ? `${deploys.length - running}个实例异常，建议排查` : '所有实例运行正常' }
}
function formatDeploymentScale(r: any) {
  return `# Agent部署规模
📊 实例: ${r.total} | 运行: ${r.running} | 可用率: ${r.uptime}%
## 环境分布
${Object.entries(r.byEnv).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
💡 ${r.recommendation}
---
💡 对标云原生：Agent工厂需要弹性扩缩/灰度发布/滚动升级/自动回滚的标准化运维能力。`
}
function analyzeCostOptimization(data: any) {
  const costs = data.costs || {}
  const tokensPerDay = costs.tokensPerDay || 1000000
  const costPerDay = costs.costPerDayYuan || 500
  const wasteRate = costs.wastePct || 25
  const optimized = costs.optimized || false
  const monthlyCost = (costPerDay * 30 / 10000).toFixed(1)
  const savingPotential = (costPerDay * 30 * wasteRate / 100 / 10000).toFixed(1)
  return { tokensPerDay: (tokensPerDay / 1000000).toFixed(1) + 'M', costPerDay: costPerDay + '元', monthlyCost: monthlyCost + '万', wasteRate, optimized, savingPotential: savingPotential + '万/月', recommendation: !optimized ? `预计可节省${savingPotential}万/月` : '已启用成本优化' }
}
function formatCostOptimization(r: any) {
  return `# Agent运营成本优化
📊 日Token: ${r.tokensPerDay} | 日费用: ${r.costPerDay} | 月费用: ${r.monthlyCost}
🗑 浪费率: ${r.wasteRate}% | 已优化: ${r.optimized ? '✅' : '❌'}
💰 优化潜力: 节省 ${r.savingPotential}
💡 ${r.recommendation}
---
💡 智能体工厂经济性：Token成本是Agent运营最大支出，缓存/压缩/批处理是降低cost的关键策略。`
}
function analyzeQualityMetrics(data: any) {
  const metrics = data.qualityMetrics || {}
  const satisfaction = metrics.userSatisfaction || 4.0
  const resolutionRate = metrics.resolutionPct || 85
  const avgResponseTime = metrics.avgResponseSec || 2.5
  const escalationRate = metrics.escalationPct || 12
  const score = ((satisfaction / 5 * 30) + (resolutionRate * 0.3) + (Math.max(0, 100 - avgResponseTime * 10) * 0.2) + ((100 - escalationRate) * 0.2)).toFixed(1)
  return { satisfaction, resolutionRate, avgResponseTime, escalationRate, score, recommendation: parseFloat(score) > 75 ? 'Agent服务质量良好' : '需优化提示词或知识库' }
}
function formatQualityMetrics(r: any) {
  return `# Agent服务质量指标
📊 综合评分: ${r.score}/100
- 用户满意度: ${r.satisfaction}/5 | 解决率: ${r.resolutionRate}%
- 平均响应: ${r.avgResponseTime}s | 升级率: ${r.escalationRate}%
💡 ${r.recommendation}
---
💡 Agent工厂SLA：满意度≥4.2星、解决率≥85%、响应<3秒、升级率<10% = 高质量Agent标准。`
}
function analyzeGovernanceCompliance(data: any) {
  const compliance = data.compliance || {}
  const items = [
    { item: '备案登记', passed: !!compliance.filingDone },
    { item: '内容安全', passed: !!compliance.contentSafety },
    { item: '数据合规', passed: !!compliance.dataCompliance },
    { item: '算法透明', passed: !!compliance.algorithmTransparency },
    { item: '用户告知', passed: !!compliance.userNotification },
    { item: '退出机制', passed: !!compliance.exitMechanism }
  ]
  const passed = items.filter(i => i.passed).length
  return { items, passed, total: items.length, score: ((passed / items.length) * 100).toFixed(0), recommendation: passed < items.length ? `${items.length - passed}项合规待补齐` : '完全合规可规模推广' }
}
function formatGovernanceCompliance(r: any) {
  return `# Agent治理合规评估
📊 评分: ${r.score}/100 | 通过: ${r.passed}/${r.total}
${r.items.map((i: any) => `- ${i.item}: ${i.passed ? '✅' : '❌'}`).join('\n')}
💡 ${r.recommendation}
---
💡 对标网信办《智能体规范应用实施意见》：合规是Agent规模化推广的前置条件，缺一不可。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'template_library_manager',
    description: '智能体模板库管理：类目分布、热门模板、复用率分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"templates":[{"name":"客服Agent","分类":"服务","category":"service","usageCount":150}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTemplateLibrary(analyzeTemplateLibrary(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'build_pipeline_orchestrator',
    description: '构建流水线编排：需求/模板/知识库/工具链/测试/部署六阶段覆盖率',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"pipeline":{"requirements":true,"template":true,"knowledgeBase":false,"tools":true,"testing":false,"deployment":false}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatBuildPipeline(analyzeBuildPipeline(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'testing_framework_evaluator',
    description: '测试框架评估：通过率、自动化率、用例质量',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"tests":[{"name":"功能测试","status":"pass","automated":true}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTestingFramework(analyzeTestingFramework(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'deployment_scale_monitor',
    description: '部署规模监控：实例数、可用率、环境分布',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"deployments":[{"name":"客服Agent-v2","env":"production","status":"running","uptimePct":99.9}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatDeploymentScale(analyzeDeploymentScale(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'cost_optimizer',
    description: '运营成本优化：Token消耗、费用分析、浪费率、节省潜力',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"costs":{"tokensPerDay":2000000,"costPerDayYuan":800,"wastePct":20,"optimized":false}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCostOptimization(analyzeCostOptimization(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'quality_metrics_tracker',
    description: '服务质量追踪：满意度/解决率/响应时间/升级率综合评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"qualityMetrics":{"userSatisfaction":4.2,"resolutionPct":88,"avgResponseSec":2.1,"escalationPct":10}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatQualityMetrics(analyzeQualityMetrics(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'governance_compliance_checker',
    description: '治理合规检查：备案/内容安全/数据合规/算法透明/用户告知/退出机制六维评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"compliance":{"filingDone":true,"contentSafety":true,"dataCompliance":true,"algorithmTransparency":false,"userNotification":true,"exitMechanism":false}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatGovernanceCompliance(analyzeGovernanceCompliance(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'roi_calculator_tool',
    description: 'Agent投资回报率计算器：投入/产出/节省人力/效率提升综合ROI分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"roi":{"agentsDeployed":10,"avgMonthlyCostYuan":5000,"hoursSavedPerDay":40,"hourlyRateYuan":200,"efficiencyGainPct":30}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const roi = d.roi || {}
      const agents = roi.agentsDeployed || 0
      const monthlyCost = (roi.avgMonthlyCostYuan || 0) * agents
      const monthlySavings = (roi.hoursSavedPerDay || 0) * (roi.hourlyRateYuan || 0) * 22
      const netSaving = monthlySavings - monthlyCost
      const roiPct = monthlyCost > 0 ? ((netSaving / monthlyCost) * 100).toFixed(0) : '0'
      return `# Agent投资回报率（ROI）分析
📊 部署Agent: ${agents} | 月成本: ¥${monthlyCost.toLocaleString()} | 月节省: ¥${monthlySavings.toLocaleString()}
💰 净节省: ¥${netSaving.toLocaleString()}/月 | ROI: ${roiPct}%
💡 ${netSaving > 0 ? '✅ Agent投入产出正向，建议扩展部署' : '⚠️ ROI为负，需优化Agent效率或评估场景适配性'}
---
💡 对标麦肯锡：AI Agent在供应链场景ROI达88%，是企业最大可自动化投资方向。`
    }
  }))
}
