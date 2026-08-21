import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
export const name = 'legalagentpro'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeContract(data: any) {
  const contract = data.contract || {}
  const risks = contract.risks || []
  if (risks.length === 0 && !contract.name) return { name: '-', total: 0, high: 0, score: 100, recommendation: '未发现风险', disclaimer: '本报告为初步分析，最终判断需专业律师确认。' }
  const high = risks.filter((r: any) => r.severity === 'high').length
  const medium = risks.filter((r: any) => r.severity === 'medium').length
  const score = Math.max(0, 100 - high * 25 - medium * 10)
  const aiTerms = risks.filter((r: any) => r.type === 'ai_clause').length
  return { name: contract.name || '-', total: risks.length, high, medium, score, aiTerms, recommendation: score > 70 ? '整体风险可控' : '存在重大风险点，建议律师审查', disclaimer: '本报告为初步分析，最终判断需专业律师确认。' }
}
function formatContract(r: any) {
  return `# 合同智能审查：${r.name}
📊 风险评分: ${r.score}/100 | 总风险点: ${r.total} | 🔴 高: ${r.high} | 🟡 中: ${r.medium}
🤖 AI条款: ${r.aiTerms}项
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeCasePrediction(data: any) {
  const caseData = data.case || {}
  const factors = caseData.factors || []
  if (factors.length === 0 && !caseData.type) return { type: '-', winProbability: 'N/A', recommendation: '无案件数据', disclaimer: '预测结果仅供参考，不构成法律意见。' }
  const positive = factors.filter((f: any) => f.impact === 'positive').length
  const total = factors.length || 1
  const winProb = ((positive / total) * 100).toFixed(0)
  const estimatedDuration = caseData.estimatedMonths || 6
  const estimatedCost = caseData.estimatedCostWan || 5
  return { type: caseData.type || '-', winProb, estimatedDuration, estimatedCost, positive, totalFactors: total, recommendation: parseInt(winProb) > 60 ? '胜诉概率较高' : '建议考虑和解或补充证据', disclaimer: '预测结果仅供参考，不构成法律意见。' }
}
function formatCasePrediction(r: any) {
  return `# 案件胜诉预测：${r.type}
📊 胜诉概率: ${r.winProb}% | 有利因素: ${r.positive}/${r.totalFactors}
⏱ 预计周期: ${r.estimatedDuration}个月 | 预计费用: ${r.estimatedCost}万
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeComplianceCheck(data: any) {
  const regulations = data.regulations || []
  if (regulations.length === 0) return { total: 0, compliant: 0, rate: '0', recommendation: '无合规检查数据', disclaimer: '本报告为初步筛查，最终判断需专业法律意见。' }
  const compliant = regulations.filter((r: any) => r.status === 'compliant').length
  const pending = regulations.filter((r: any) => r.status === 'pending').length
  const rate = ((compliant / regulations.length) * 100).toFixed(0)
  return { total: regulations.length, compliant, pending, rate, recommendation: parseInt(rate) > 85 ? '整体合规良好' : `${regulations.length - compliant - pending}项需整改`, disclaimer: '本报告为初步筛查，最终判断需专业法律意见。' }
}
function formatComplianceCheck(r: any) {
  return `# 法律合规检查
📊 合规率: ${r.rate}% | 总计: ${r.total} | ✅ 合规: ${r.compliant} | ⏳ 待确认: ${r.pending}
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeLegalResearch(data: any) {
  const research = data.research || {}
  const results = research.results || []
  if (results.length === 0 && !research.topic) return { topic: '-', resultCount: 0, relevance: '0', recommendation: '无检索数据' }
  const highRelevance = results.filter((r: any) => (r.relevance || 0) > 0.7).length
  const avgRelevance = results.length > 0 ? (results.reduce((a: number, r: any) => a + (r.relevance || 0), 0) / results.length * 100).toFixed(0) : '0'
  const jurisdictions = [...new Set(results.map((r: any) => r.jurisdiction).filter(Boolean))]
  return { topic: research.topic || '-', resultCount: results.length, highRelevance, avgRelevance, jurisdictions, recommendation: highRelevance > 5 ? `找到${highRelevance}个高相关条目` : '建议扩展检索范围', disclaimer: '检索结果需经律师验证其适用性。' }
}
function formatLegalResearch(r: any) {
  return `# 法律研究：${r.topic}
📊 检索结果: ${r.resultCount} | 高相关: ${r.highRelevance} | 平均相关度: ${r.avgRelevance}%
⚖️ 覆盖法域: ${r.jurisdictions.join(', ') || '无'}
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeDisputeResolution(data: any) {
  const dispute = data.dispute || {}
  const options = dispute.options || []
  if (options.length === 0) return { disputeType: '-', options: [], bestOption: '无数据', recommendation: '无争议解决数据' }
  const scored = options.map((o: any) => ({ ...o, score: ((o.successRate * 0.4) + ((100 - o.cost / 1000) * 0.3) + ((100 - o.durationMonths * 5) * 0.3)).toFixed(1) }))
  const sorted = scored.sort((a: any, b: any) => parseFloat(b.score) - parseFloat(a.score))
  return { disputeType: dispute.type || '-', options: sorted, bestOption: sorted[0].name, recommendation: `推荐${sorted[0].name}方案（得分${sorted[0].score}）`, disclaimer: '方案选择需结合实际情况综合判断。' }
}
function formatDisputeResolution(r: any) {
  return `# 争议解决分析：${r.disputeType}
## 方案排序
${r.options.map((o: any, i: number) => `${i + 1}. ${o.name}：得分${o.score} | 成功率${o.successRate || '-'}% | 成本¥${o.cost?.toLocaleString() || '-'} | ${o.durationMonths || '-'}个月`).join('\n') || '无方案'}
⭐ ${r.bestOption}
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeIPManagement(data: any) {
  const ip = data.ipPortfolio || {}
  const patents = ip.patents || []
  const trademarks = ip.trademarks || []
  if (patents.length === 0 && trademarks.length === 0) return { patents: 0, trademarks: 0, total: 0, recommendation: '无知识产权数据' }
  const total = patents.length + trademarks.length
  const geos = new Set([...patents.map((p: any) => p.country), ...trademarks.map((t: any) => t.country)])
  const pendingPatents = patents.filter((p: any) => p.status === 'pending').length
  return { patents: patents.length, trademarks: trademarks.length, total, geosCount: geos.size, pendingPatents, recommendation: pendingPatents > 5 ? `${pendingPatents}件专利申请中，需关注审查进度` : '知识产权组合稳定', disclaimer: '知识产权策略需专业代理机构协助。' }
}
function formatIPManagement(r: any) {
  return `# 知识产权管理
📊 专利: ${r.patents} | 商标: ${r.trademarks} | 总数: ${r.total} | 覆盖地域: ${r.geosCount}国
⏳ 审查中专利: ${r.pendingPatents}
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeLitigationBudget(data: any) {
  const budget = data.budget || {}
  const totalBudget = budget.totalWan || 0
  const spent = budget.spentWan || 0
  const cases = budget.activeCases || 0
  const avgCost = cases > 0 ? (spent / cases).toFixed(1) : '0'
  const utilization = totalBudget > 0 ? ((spent / totalBudget) * 100).toFixed(0) : '0'
  return { totalBudget, spent, cases, avgCost, utilization, recommendation: parseInt(utilization) > 85 ? '诉讼预算即将超支' : '诉讼预算执行正常', disclaimer: '预算分析仅供参考，实际费用因案件复杂程度而异。' }
}
function formatLitigationBudget(r: any) {
  return `# 诉讼预算分析
📊 总预算: ${r.totalBudget}万 | 已支出: ${r.spent}万 | 执行率: ${r.utilization}%
⚖️ 在办案件: ${r.cases} | 平均成本: ${r.avgCost}万/件
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'contract_reviewer',
    description: '合同智能审查：风险点识别、AI条款检测、风险评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"contract":{"name":"NDA协议","risks":[{"type":"liability","severity":"high","description":"无限责任"}]}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatContract(analyzeContract(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'case_prediction_engine',
    description: '案件胜诉预测：胜诉概率、周期与费用估算',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"case":{"type":"合同纠纷","factors":[{"factor":"证据充分","impact":"positive"}],"estimatedMonths":8,"estimatedCostWan":10}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCasePrediction(analyzeCasePrediction(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'legal_compliance_checker',
    description: '法律合规检查：合规率、待整改项',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"regulations":[{"name":"数据保护","status":"compliant"},{"name":"劳动合规","status":"pending"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatComplianceCheck(analyzeComplianceCheck(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'legal_research_assistant',
    description: '法律研究助手：案例检索、相关度、法域覆盖',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"research":{"topic":"AI侵权","results":[{"title":"案例A","relevance":0.85,"jurisdiction":"CN"}]}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatLegalResearch(analyzeLegalResearch(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'dispute_resolution_advisor',
    description: '争议解决建议：诉讼/仲裁/调解方案排序与推荐',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"dispute":{"type":"合同纠纷","options":[{"name":"诉讼","successRate":70,"cost":50000,"durationMonths":12}]}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatDisputeResolution(analyzeDisputeResolution(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'ip_portfolio_manager_tool',
    description: '知识产权管理：专利/商标组合、审查进度、地域覆盖',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"ipPortfolio":{"patents":[{"id":"P1","country":"CN","status":"pending"}],"trademarks":[{"name":"BrandX","country":"US"}]}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatIPManagement(analyzeIPManagement(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'litigation_budget_analyzer',
    description: '诉讼预算分析：执行率、在办案件、平均成本',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"budget":{"totalWan":100,"spentWan":65,"activeCases":5}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatLitigationBudget(analyzeLitigationBudget(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'regulatory_change_tracker',
    description: '法规变更追踪：监控法律法规变化对业务的影响，输出合规差距与应对建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"regulations":[{"name":"生成式AI服务管理办法","status":"updated","effectiveDate":"2026-09-01","impact":"high","actionRequired":"更新算法备案"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const regs = d.regulations || []
      const highImpact = regs.filter((r: any) => r.impact === 'high').length
      const report = regs.map((r: any) => `- ${r.name} [${r.impact === 'high' ? '🔴' : '🟡'}] ${r.effectiveDate || ''}: ${r.actionRequired || '需评估'}`).join('\n')
      return `# 法规变更追踪器
📊 法规动态: ${regs.length}项 | 高影响: ${highImpact}项
## 待应对法规
${report || '无待追踪法规'}
📅 ${highImpact > 0 ? `⚡ ${highImpact}项高影响法规需立即应对` : '暂无紧迫法规变更'}
---
💡 对标合规科技：2026年AI披露义务年增240%，实时法规追踪是企业合规的刚需。`
    }
  }))
}
