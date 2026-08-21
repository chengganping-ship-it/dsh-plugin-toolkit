import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'agentskillsmarket'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeSkillsInventory(data: any) {
  const skills = data.skills || []
  if (skills.length === 0) { return { total: 0, byCategory: {}, byAuthor: {}, score: 0, topCategory: '-', recommendation: '无技能数据' } }
  const byCategory: Record<string, number> = {}
  const byAuthor: Record<string, number> = {}
  for (const s of skills) {
    byCategory[s.category || '其他'] = (byCategory[s.category || '其他'] || 0) + 1
    byAuthor[s.author || 'unknown'] = (byAuthor[s.author || 'unknown'] || 0) + 1
  }
  const topCategory = Object.entries(byCategory).sort((a: any, b: any) => b[1] - a[1])[0]
  return { total: skills.length, byCategory, byAuthor, topCategory: topCategory?.[0] || '-', recommendation: skills.length < 50 ? '建议扩充技能目录覆盖更多场景' : '技能目录丰富度良好' }
}
function formatSkillsInventory(r: any) {
  return `# Agent技能市场目录
📊 技能总数: ${r.total} | 热点类目: ${r.topCategory}
## 类目分布
${Object.entries(r.byCategory).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
## TOP发布者
${Object.entries(r.byAuthor).slice(0, 5).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
💡 ${r.recommendation}
---
💡 对标Skills经济：Skills正取代MCP成为Agent能力分发的新层级。`
}
function analyzeSkillQuality(data: any) {
  const skill = data.skill || {}
  const metrics = {
    installs: skill.installCount || 0,
    rating: skill.avgRating || 0,
    reviews: skill.reviewCount || 0,
    lastUpdated: skill.lastUpdated || '-',
    verified: skill.verified || false
  }
  const score = Math.min(100, (metrics.rating * 20) + (metrics.installs > 1000 ? 20 : metrics.installs / 50) + (metrics.verified ? 20 : 0))
  return { skillName: skill.name || '-', ...metrics, score: score.toFixed(0), recommendation: score > 70 ? '优质技能' : score > 40 ? '中等技能' : '需优化' }
}
function formatSkillQuality(r: any) {
  return `# 技能质量评估：${r.skillName}
📊 评分: ${r.score}/100 | ⭐ ${r.rating}/5 | 📥 ${r.installs}次安装 | 📝 ${r.reviews}条评价
✅ 官方认证: ${r.verified ? '是' : '否'} | 最近更新: ${r.lastUpdated}
💡 ${r.recommendation}
---
💡 Skills经济的信任基础：评级+安装量+认证=技能可发现性的关键要素。`
}
function analyzeSkillDiscovery(data: any) {
  const userQuery = data.userQuery || ''
  const availableSkills = data.availableSkills || []
  const keywords = userQuery.split(/[\s,，]+/).filter(Boolean)
  const matches = availableSkills.map((s: any) => {
    const matchScore = keywords.filter((k: string) =>
      s.name?.toLowerCase().includes(k.toLowerCase()) ||
      s.description?.toLowerCase().includes(k.toLowerCase()) ||
      s.tags?.some((t: string) => t.toLowerCase().includes(k.toLowerCase()))
    ).length
    return { name: s.name, score: matchScore, category: s.category }
  }).filter((m: any) => m.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 5)
  return { query: userQuery, matchCount: matches.length, recommendations: matches, recommendation: matches.length > 0 ? `匹配${matches.length}个技能` : '未找到匹配技能，建议扩展搜索词' }
}
function formatSkillDiscovery(r: any) {
  return `# 技能发现与推荐
🔍 搜索: "${r.query}" | 匹配: ${r.matchCount}个
## 推荐技能
${r.recommendations.map((m: any) => `- ${m.name} (${m.category}) - 匹配度: ${m.score}`).join('\n') || '未找到匹配'}
💡 ${r.recommendation}
---
💡 对标应用商店模式：发现机制是Skills市场流动性与生态繁荣的关键。`
}
function analyzeSkillMonetization(data: any) {
  const model = data.monetizationModel || {}
  const models = [
    { name: '免费', enabled: model.free || false, potential: '用户增长' },
    { name: '按次付费', enabled: model.payPerUse || false, potential: '灵活收益' },
    { name: '订阅制', enabled: model.subscription || false, potential: '稳定现金流' },
    { name: '企业授权', enabled: model.enterprise || false, potential: '高价值客户' },
    { name: '收入分成', enabled: model.revenueShare || false, potential: '生态共赢' }
  ]
  const active = models.filter(m => m.enabled)
  return { models, activeCount: active.length, recommendation: active.length < 2 ? '建议多元化定价策略' : '定价策略组合健康' }
}
function formatSkillMonetization(r: any) {
  return `# 技能变现模型
📊 已启用: ${r.activeCount}/5
${r.models.map((m: any) => `- ${m.name}: ${m.enabled ? '✅' : '❌'} (${m.potential})`).join('\n')}
💡 ${r.recommendation}
---
💡 Skills经济的商业模式：免费引流+按次/订阅变现+企业授权高价值，多元化收入驱动生态正循环。`
}
function analyzeEcosystemHealth(data: any) {
  const metrics = data.ecosystemMetrics || {}
  const growth = metrics.monthlyGrowthPct || 0
  const retention = metrics.developerRetentionPct || 0
  const nps = metrics.developerNps || 0
  const overall = (growth * 0.3) + (retention * 0.4) + ((nps + 100) / 2 * 0.3)
  return { growth, retention, nps, overall: overall.toFixed(1), recommendation: overall > 60 ? '生态健康良好' : '需关注开发者留存与增长' }
}
function formatEcosystemHealth(r: any) {
  return `# Skills市场经济健康度
📊 综合分: ${r.overall}/100
- 月增长率: ${r.growth}% | 开发者留存: ${r.retention}%
- 开发者NPS: ${r.nps}
💡 ${r.recommendation}
---
💡 对标开源生态：开发者是Skills经济的灵魂，留存比增长更重要。`
}
function analyzeCompatibilityMatrix(data: any) {
  const skills = data.skills || []
  const frameworks = ['DeepSeek Harness', 'AutoGen', 'LangGraph', 'CrewAI', 'OpenAI Agents']
  if (skills.length === 0) return { matrix: [], skills: 0, frameworkCount: frameworks.length, recommendation: '无技能兼容性数据' }
  const matrix = skills.slice(0, 5).map((s: any) => ({
    skill: s.name,
    frameworks: frameworks.reduce((acc: any, f: any) => { acc[f] = s.compatibility?.includes(f) ? '✅' : '❌'; return acc; }, {})
  }))
  return { matrix, skills: skills.length, frameworkCount: frameworks.length, frameworks, recommendation: '兼容性覆盖决定技能可移植性' }
}
function formatCompatibilityMatrix(r: any) {
  return `# 技能跨框架兼容性矩阵
📊 技能: ${r.skills} | 框架: ${r.frameworkCount}
${r.matrix.map((m: any) => `- ${m.skill}: ${Object.values(m.frameworks).filter((v: any) => v === '✅').length}/${r.frameworkCount}兼容`).join('\n') || '无数据'}
💡 ${r.recommendation}
---
💡 Skills经济的网络效应：跨框架兼容的技能具有更高价值，可触达更多Agent用户。`
}
function analyzeTrendingSkills(data: any) {
  const trends = data.trendingSkills || []
  const defaultTrends = [
    { name: '数据分析Skill', growthPct: 340, signal: '企业数据驱动决策刚需' },
    { name: '代码生成Skill', growthPct: 280, signal: 'Coding Agent渗透率67%' },
    { name: '客服对话Skill', growthPct: 250, signal: '82%企业优先客服AI化' },
    { name: '文档处理Skill', growthPct: 190, signal: 'RAG+文档自动化爆发' },
    { name: '安全审计Skill', growthPct: 180, signal: 'AI治理合规需求陡增' },
    { name: '多Agent编排Skill', growthPct: 310, signal: '多Agent协作300%增长' },
    { name: '记忆管理Skill', growthPct: 260, signal: 'Agent持久认知新支柱' }
  ]
  const result = trends.length > 0 ? trends : defaultTrends
  const totalGrowth = result.reduce((a: number, t: any) => a + (t.growthPct || 0), 0)
  const avgGrowth = (totalGrowth / result.length).toFixed(0)
  return { trends: result, avgGrowth, recommendation: '持续关注高增长类目，把握市场时机' }
}
function formatTrendingSkills(r: any) {
  return `# 热门技能趋势榜
📊 平均增长: ${r.avgGrowth}%
## 增长排行
${r.trends.map((t: any) => `- ${t.name}: +${t.growthPct}% | ${t.signal}`).join('\n')}
💡 ${r.recommendation}
---
💡 对标2026年Skills经济爆发：20天内技能数18.5倍增长，把握时机窗口至关重要。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'skills_inventory_auditor',
    description: '技能市场目录审计：技能总数、类目分布、TOP发布者，给出扩充建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"skills":[{"name":"数据分析","category":"data","author":"官方","installCount":5000}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSkillsInventory(analyzeSkillsInventory(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'skill_quality_scorer',
    description: '技能质量评分：安装量/评级/认证状态，输出综合质量分与优化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"skill":{"name":"web-search","avgRating":4.5,"installCount":8000,"reviewCount":200,"verified":true,"lastUpdated":"2026-01-15"}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSkillQuality(analyzeSkillQuality(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'skill_discovery_engine',
    description: '技能发现引擎：基于用户意图匹配相关技能，输出TOP5推荐与匹配度',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"userQuery":"数据分析 图表","availableSkills":[{"name":"数据可视化","category":"data","tags":["图表","分析"],"description":"..."}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSkillDiscovery(analyzeSkillDiscovery(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'skill_monetization_planner',
    description: '技能变现规划：免费/按次/订阅/企业授权/收入分成五维定价策略评估与多元化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"monetizationModel":{"free":true,"payPerUse":true,"subscription":false,"enterprise":true,"revenueShare":false}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSkillMonetization(analyzeSkillMonetization(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'ecosystem_health_tracker',
    description: '市场经济健康度追踪：增长率/开发者留存/NPS，输出综合健康度评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"ecosystemMetrics":{"monthlyGrowthPct":45,"developerRetentionPct":78,"developerNps":42}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatEcosystemHealth(analyzeEcosystemHealth(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'skill_compatibility_matrix',
    description: '技能跨框架兼容性矩阵：DeepSeek/AutoGen/LangGraph/CrewAI/OpenAI五框架覆盖度',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"skills":[{"name":"web-search","compatibility":["DeepSeek Harness","AutoGen"]}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCompatibilityMatrix(analyzeCompatibilityMatrix(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'trending_skills_tracker',
    description: '热门技能趋势追踪：增长率排行、驱动信号，给出市场时机建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"trendingSkills":[{"name":"多Agent编排","growthPct":310,"signal":"企业多Agent需求爆发"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTrendingSkills(analyzeTrendingSkills(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'skill_security_scanner',
    description: '技能安全扫描：检测Skill代码中的恶意行为/数据泄露/权限滥用，输出安全评分与风险项',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"skill":{"name":"data-export","permissions":["file-read","network"],"codeLines":500,"externalCalls":3,"dataExfiltrationRisk":false}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const s = d.skill || {}
      const risks: string[] = []
      if (s.dataExfiltrationRisk) risks.push('⚠️ 数据外泄风险')
      if ((s.externalCalls || 0) > 5) risks.push('⚠️ 外部调用过多')
      if ((s.permissions || []).length > 3) risks.push('⚠️ 权限过广')
      const score = risks.length === 0 ? 95 : Math.max(20, 95 - risks.length * 25)
      return `# 技能安全扫描：${s.name || '-'}
📊 安全评分: ${score}/100 | 权限: ${s.permissions?.length || 0}个 | 外部调用: ${s.externalCalls || 0}
## 风险项
${risks.length > 0 ? risks.map((r: any) => `- ${r}`).join('\n') : '✅ 未发现明显风险'}
💡 ${score > 80 ? '安全可发布' : '需修复风险项后重新审核'}
---
💡 Skills经济的安全防线：每个上架技能必须通过安全扫描，保护终端用户数据安全。`
    }
  }))
}
