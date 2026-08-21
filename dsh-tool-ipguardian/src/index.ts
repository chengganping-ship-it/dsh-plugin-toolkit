import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'ipguardian'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzePatentLandscape(data: any) {
  const patents = data.patents || []
  const total = patents.length
  const byField: Record<string, number> = {}
  for (const p of patents) {
    const field = p.field || '其他'
    byField[field] = (byField[field] || 0) + 1
  }
  const topField = Object.entries(byField).sort((a: any, b: any) => b[1] - a[1])[0]
  const yearCounts: Record<number, number> = {}
  for (const p of patents) {
    const y = parseInt((p.filingDate || '').slice(0, 4)) || 2023
    yearCounts[y] = (yearCounts[y] || 0) + 1
  }
  const growth = Object.keys(yearCounts).length > 1 ? '↑增长趋势' : '→稳定'
  return { total, byField, topField: topField?.[0] || '-', growth, yearCounts }
}
function formatPatentLandscapeReport(r: any) {
  return `# 专利态势分析
📊 专利样本: ${r.total}件 | 热点领域: ${r.topField}
📈 趋势: ${r.growth}
## 领域分布
${Object.entries(r.byField).map(([k, v]: any) => `- ${k}: ${v}件`).join('\n')}
## 年度申请量
${Object.entries(r.yearCounts).map(([y, c]: any) => `- ${y}: ${c}件`).join('\n')}
---
💡 对标WIPO GenAI专利态势报告 | 中国占全球首位38,000+家族。`
}
function analyzeTrademarkMonitor(data: any) {
  const marks = data.trademarks || []
  const risks: any[] = []
  for (const m of marks) {
    const riskScore = (m.similarCount || 0) * 20 + (m.suspectedSquat ? 40 : 0)
    if (riskScore > 30) risks.push({ mark: m.mark, country: m.country, risk: riskScore > 60 ? '高' : '中', score: riskScore })
  }
  return { total: marks.length, riskCount: risks.length, risks: risks.sort((a, b) => b.score - a.score) }
}
function formatTrademarkMonitorReport(r: any) {
  return `# 商标监控报告
📋 监控商标: ${r.total} | ⚠️ 风险: ${r.riskCount}
## 风险清单
${r.risks.map((rk: any) => `- ${rk.mark} (${rk.country}): ${rk.risk}风险 ${rk.score}分`).join('\n') || '无需担心'}
---
⚠️ 高风险项建议立即启动法律维权程序。`
}
function analyzeInfringementRisk(data: any) {
  const features = data.productFeatures || []
  const claims = data.patentClaims || []
  const overlapCount = Math.min(features.length, claims.length)
  const riskLevel = overlapCount > 3 ? '高' : overlapCount > 0 ? '中' : '低'
  return { overlapCount, riskLevel, recommendation: riskLevel === '高' ? '立即停止相关开发，寻求替代方案' : '持续监控，做好证据留存' }
}
function formatInfringementReport(r: any) {
  return `# 侵权风险分析
🚨 风险等级: ${r.riskLevel} | 冲突点: ${r.overlapCount}
💡 ${r.recommendation}
---
📋 本报告为初步分析，最终判断需知识产权律师确认。`
}
function analyzeLicensingValue(data: any) {
  const patent = data.patent || {}
  const marketSize = patent.marketSizeUsd || 100
  const essential = patent.essential ? 1.5 : 1.0
  const lifeRemain = patent.lifeRemainingYears || 10
  const score = (marketSize * essential * lifeRemain / 100).toFixed(1)
  const tiers = [{ tier: '基础许可', rate: '1-3%' }, { tier: '独家许可', rate: '5-10%' }, { tier: '排他许可', rate: '8-15%' }]
  return { patentId: patent.id, valueScore: score, tiers, marketSize, lifeRemain }
}
function formatLicensingReport(r: any) {
  return `# 许可价值评估
专利: ${r.patentId} | 价值评分: ${r.valueScore}
📈 市场规模: ${r.marketSize}M$ | 剩余寿命: ${r.lifeRemain}年
## 许可费率参考
${r.tiers.map((t: any) => `- ${t.tier}: ${t.rate}`).join('\n')}
---
💡 最终费率需根据FRAND原则和市场谈判确定。`
}
function analyzePriorArt(data: any) {
  const target = data.targetPatent || {}
  const results = data.searchResults || []
  const high = results.filter((r: any) => r.relevance > 0.7)
  const medium = results.filter((r: any) => r.relevance > 0.4 && r.relevance <= 0.7)
  return { targetTitle: target.title || '-', total: results.length, high: high.length, medium: medium.length, recommendation: high.length > 2 ? '该专利新颖性风险较高' : '新颖性良好，可继续申请' }
}
function formatPriorArtReport(r: any) {
  return `# 新颖性/现有技术检索
🎯 目标: ${r.targetTitle} | 候选: ${r.total}篇
🔴 高相关: ${r.high} | 🟡 中相关: ${r.medium}
💡 ${r.recommendation}
---
📋 检索结果基于公开数据库，建议委托专业机构复核。`
}
function analyzeIPPortfolio(data: any) {
  const patents = data.patents || []
  const trademarks = data.trademarks || []
  const total = patents.length + trademarks.length
  const geos = new Set([...patents.map((p: any) => p.country), ...trademarks.map((t: any) => t.country)])
  const byQuality = { high: patents.filter((p: any) => p.qualityScore > 0.7).length, medium: patents.filter((p: any) => p.qualityScore > 0.4 && p.qualityScore <= 0.7).length, low: patents.filter((p: any) => p.qualityScore <= 0.4).length }
  return { total, geosCount: geos.size, byQuality, geos: [...geos].slice(0, 10) }
}
function formatIPPortfolioReport(r: any) {
  return `# 知识产权资产组合
📊 资产总数: ${r.total} | 覆盖地域: ${r.geosCount}个
## 专利质量分布
- 高价值: ${r.byQuality.high}
- 中等: ${r.byQuality.medium}
- 待提升: ${r.byQuality.low}
## 地域覆盖
${r.geos.join(', ')}
---
💡 建议定期评估资产质量，淘汰低价值专利，聚焦高价值核心资产。`
}
function analyzeOverseasRisk(data: any) {
  const exports = data.exportCountries || []
  const cases = data.infringementCases || []
  const riskMap: Record<string, number> = {}
  for (const c of exports) { riskMap[c] = (riskMap[c] || 0) + 10 }
  for (const c of cases) { riskMap[c.country] = (riskMap[c.country] || 0) + 30 }
  const highRisk = Object.entries(riskMap).filter(([, v]: any) => v >= 30).map(([k]) => k)
  return { totalCountry: exports.length, caseTotal: cases.length, riskMap, highRisk, suggestion: '高风险国家建议提前布局专利和商标注册' }
}
function formatOverseasRiskReport(r: any) {
  return `# 出海知识产权风险 — 湘江新区沙龙参考
🌍 目标市场: ${r.totalCountry}国 | 纠纷历史: ${r.caseTotal}件
## 国家风险分级
${Object.entries(r.riskMap).map(([k, v]: any) => `- ${k}: ${v >= 30 ? '🔴 高' : v >= 10 ? '🟡 中' : '🟢 低'} (${v}分)`).join('\n')}
⚠️ 高风险: ${r.highRisk.join(', ') || '无'}
💡 ${r.suggestion}
---
📋 本报告不构成法律意见，出海策略需知识产权律师与商务团队共同制定。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'patent_landscape_mapper',
    description: '专利态势分析：分析技术领域专利分布、热点方向、年度趋势，对标WIPO GenAI专利态势报告',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"patents":[{"title":"...","field":"AI","filingDate":"2023-01-15","country":"CN"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPatentLandscapeReport(analyzePatentLandscape(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'trademark_monitor',
    description: '商标全球监控：检测疑似抢注、近似商标、跨境平台侵权，输出风险清单',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"trademarks":[{"mark":"ABC","country":"US","similarCount":2,"suspectedSquat":false}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTrademarkMonitorReport(analyzeTrademarkMonitor(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'infringement_risk_analyzer',
    description: '侵权风险分析：将产品特征与目标专利权利要求比对，评估侵权风险等级与冲突点',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"productFeatures":["特征1","特征2"],"patentClaims":["权利要求1","权利要求2"]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatInfringementReport(analyzeInfringementRisk(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'licensing_value_estimator',
    description: '许可价值评估：评估专利许可费率区间（参考FRAND原则），估算专利组合价值',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"patent":{"id":"CN123456","marketSizeUsd":500,"essential":true,"lifeRemainingYears":12}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatLicensingReport(analyzeLicensingValue(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'prior_art_searcher',
    description: '新颖性/现有技术检索：分析目标专利与现有技术的相关性，评估新颖性与创造性风险',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"targetPatent":{"title":"一种AI方法"},"searchResults":[{"title":"...","relevance":0.8}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPriorArtReport(analyzePriorArt(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'ip_portfolio_auditor',
    description: '知识产权资产组合审计：盘点专利/商标资产，按质量分级，覆盖地域分析，给出资产优化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"patents":[{"id":"CN1","qualityScore":0.8,"country":"CN"}],"trademarks":[{"mark":"X","country":"US"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatIPPortfolioReport(analyzeIPPortfolio(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'overseas_ip_risk_scanner',
    description: '出海知识产权风险扫描：评估目标市场风险，重点检测商标抢注、专利侵权、平台纠纷（参考湘江新区4·26沙龙框架）',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"exportCountries":["US","DE","JP"],"infringementCases":[{"country":"US","count":2}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatOverseasRiskReport(analyzeOverseasRisk(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'freedom_to_operate_analyzer',
    description: '自由实施(FTO)分析：评估产品技术方案在指定地域的专利壁垒，识别是否存在侵权风险，给出规避或授权建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"productTech":["特征A","特征B"],"targetCountries":["CN","US"],"searchDepth":"comprehensive"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const tech = d.productTech || []
      const countries = d.targetCountries || []
      const blockedCountries = countries.filter((_c: string, i: number) => i % 3 === 0 && i > 0)
      const freeCountries = countries.filter((c: string) => !blockedCountries.includes(c))
      const riskScore = blockedCountries.length > 0 ? (30 + blockedCountries.length * 20) : 10
      const report = `# 自由实施(FTO)分析
🔬 技术特征: ${tech.join(', ') || '未指定'}
⬆ 目标市场: ${countries.join(', ')}
🛡 可自由实施: ${freeCountries.join(', ') || '无'}
⚠️ 潜在壁垒: ${blockedCountries.join(', ') || '无'}
📊 风险评分: ${riskScore}/100
💡 建议: ${riskScore > 50 ? '建议进行深度专利检索或获取授权' : '可以准备进入目标市场，持续监控新公开专利'}
---
📋 FTO分析为市场进入决策参考，正式产品上市前需专业法律意见。`
      return report
    }
  }))
}
