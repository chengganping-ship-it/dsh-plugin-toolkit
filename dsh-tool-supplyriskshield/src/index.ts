import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'supplyriskshield'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeMultiTierVisibility(data: any) {
  const tiers = data.tiers || []
  if (tiers.length === 0) return { totalSuppliers: 0, tierCounts: {}, visibility: '0%', blindSpots: '无法评估', recommendation: '请配置供应链层级数据' }
  const tierCounts: Record<string, number> = {}
  let total = 0
  for (const t of tiers) {
    tierCounts[t.level || '未知'] = (tierCounts[t.level] || 0) + (t.supplierCount || 0)
    total += t.supplierCount || 0
  }
  const lowestTier = tiers.length > 0 ? tiers[tiers.length - 1].level : 'N/A'
  return { totalSuppliers: total, tierCounts, tierCount: tiers.length, lowestTier, visibility: `${Math.min(tiers.length * 25, 95)}%`, recommendation: tiers.length < 3 ? '建议扩展至三级以上供应商穿透' : '供应链可视化良好' }
}
function formatMultiTierVisibility(r: any) {
  return `# 多层供应商穿透
📊 总供应商: ${r.totalSuppliers} | 层级: ${r.tierCount}层 | 可视化率: ${r.visibility}
## 各层分布
${Object.entries(r.tierCounts).map(([k, v]: any) => `- ${k}: ${v}家`).join('\n')}
🕵️ 最深层穿透: ${r.lowestTier}
💡 ${r.recommendation}
---
💠 对标SAP IBP/Resilinc：目标三级以上全覆盖穿透。`
}
function analyzeDisruptionPrediction(data: any) {
  const events = data.riskEvents || []
  if (events.length === 0) return { totalEvents: 0, highRisk: [], riskScore: 0, topThreats: ['暂无风险事件数据'], recommendation: '建议接入地缘政治、气象、物流等外部事件源' }
  const highRisk = events.filter((e: any) => e.severity >= 7)
  const totalScore = events.reduce((a: number, e: any) => a + (e.severity || 0), 0)
  const avgScore = (totalScore / events.length).toFixed(1)
  const topThreats = events.sort((a: any, b: any) => b.severity - a.severity).slice(0, 3).map((e: any) => e.name)
  return { totalEvents: events.length, highRiskCount: highRisk.length, avgScore, topThreats, recommendation: highRisk.length > 2 ? '高风险事件密集，建议启动应急预案' : '风险水位达标，继续监测' }
}
function formatDisruptionPrediction(r: any) {
  return `# 供应链中断预警
🚨 风险事件: ${r.totalEvents} | 高严重度: ${r.highRiskCount} | 平均分: ${r.avgScore}/10
## 主要威胁
${r.topThreats.map((t: any) => `- 🔴 ${t}`).join('\n')}
💡 ${r.recommendation}
---
💠 对标Resilinc事件智能：实时监测自然/人为/地缘风险。`
}
function analyzeSupplierResilience(data: any) {
  const suppliers = data.suppliers || []
  if (suppliers.length === 0) return { total: 0, strongAverage: 0, vulnerable: 0, recommendation: '无供应商数据' }
  let totalScore = 0
  let vulnerable = 0
  const details: any[] = []
  for (const s of suppliers) {
    const score = ((s.financialStability || 5) + (s.deliveryReliability || 5) + (s.geoDiversity || 5) + (s.inventoryBuffer || 5)) / 4
    if (score < 5) vulnerable++
    totalScore += score
    details.push({ id: s.id, name: s.name, score: score.toFixed(1), level: score > 7 ? '优异' : score > 5 ? '良好' : '风险' })
  }
  return { total: suppliers.length, avgScore: (totalScore / suppliers.length).toFixed(1), vulnerable, details: details.sort((a, b) => parseFloat(a.score) - parseFloat(b.score)) }
}
function formatSupplierResilience(r: any) {
  return `# 供应商韧性评估
📊 平均韧性分: ${r.avgScore}/10 | 总数: ${r.total} | 脆弱: ${r.vulnerable}
## 脆弱供应商
${r.details.filter((d: any) => d.level === '风险').map((d: any) => `- ⚠️ ${d.name}: ${d.score}分 (${d.level})`).join('\n') || '无'}
## TOP 稳健供应商
${r.details.slice(-3).reverse().map((d: any) => `- ✅ ${d.name}: ${d.score}分 (${d.level})`).join('\n') || '无数据'}
---
💠 对标SAP IBP：从单一来源转向多元韧性供应结构。`
}
function analyzeScenarioSimulation(data: any) {
  const scenarios = data.scenarios || []
  if (scenarios.length === 0) return { total: 0, results: [], recommendation: '请配置模拟场景' }
  const results = scenarios.map((s: any) => {
    const baseImpact = s.probability * (s.impactScore || 5)
    const mitigation = s.mitigationPct || 0
    const residualRisk = baseImpact * (1 - mitigation)
    return { name: s.name, probability: s.probability, impact: s.impactScore || 5, mitigation: mitigation, residualRisk: residualRisk.toFixed(1), costEstimate: Math.round(residualRisk * (s.affectedRevenue || 100) / 100), level: residualRisk > 5 ? '高' : residualRisk > 2 ? '中' : '低' }
  })
  return { total: scenarios.length, results: results.sort((a: any, b: any) => parseFloat(b.residualRisk) - parseFloat(a.residualRisk)), recommendation: results.some((r: any) => parseFloat(r.residualRisk) > 5) ? '存在高残余风险场景，必须制定应急预案' : '所有场景可控' }
}
function formatScenarioSimulation(r: any) {
  return `# 情景模拟与预案
📊 模拟场景: ${r.total}
## 残余风险排序
${r.results.map((s: any) => `- ${s.name}: 初始${(s.probability * s.impact).toFixed(1)} | 缓解${(s.mitigation * 100).toFixed(0)}% | 残余${s.residualRisk} (${s.level}) | 损失${s.costEstimate}万`).join('\n')}
💡 ${r.recommendation}
---
💠 对标riskmethods：基于数字孪生的多情景压力测试。`
}
function analyzeAlternativeSourcing(data: any) {
  const target = data.targetComponent || {}
  const alternatives = data.alternatives || []
  if (alternatives.length === 0) return { target: target.name || '-', total: 0, matches: [], recommendation: '无备选供应商数据' }
  const scored = alternatives.map((a: any) => {
    const score = ((a.qualityMatch || 5) + (a.capacityMatch || 5) + (a.leadTimeScore || 5) + (a.costScore || 5)) / 4
    return { ...a, totalScore: score.toFixed(1), recommend: score > 7 }
  })
  const ranked = scored.sort((a: any, b: any) => parseFloat(b.totalScore) - parseFloat(a.totalScore))
  const bestPick = ranked[0]
  return { target: target.name || '-', total: alternatives.length, ranked, bestPick, recommendation: bestPick?.recommend ? `首选: ${bestPick.name}` : '无优质备选' }
}
function formatAlternativeSourcing(r: any) {
  return `# 备选供应商匹配
🎯 目标组件: ${r.target} | 候选: ${r.total}
## 推荐排序
${r.ranked.map((a: any, i: number) => `${i + 1}. ${a.name}: ${a.totalScore}分 ${a.recommend ? '⭐推荐' : ''} | 单价¥${a.unitCost || '-'}`).join('\n')}
💡 ${r.recommendation}
---
💠 对标SAP IBP：从单一来源到多元韧性，降低地缘风险。`
}
function analyzeGeoPoliticalRisk(data: any) {
  const regions = data.exposureRegions || []
  if (regions.length === 0) return { total: 0, highRisk: [], riskMap: {}, recommendation: '无区域暴露数据' }
  const riskMap: Record<string, any> = {}
  for (const r of regions) {
    const score = (r.tariffRisk || 0) + (r.sanctionRisk || 0) + (r.stabilityScore ? 10 - r.stabilityScore : 0) + (r.logisticsRisk || 0)
    riskMap[r.region] = { score, level: score > 20 ? '高' : score > 10 ? '中' : '低' }
  }
  const highRisk = Object.entries(riskMap).filter(([, v]: any) => v.level === '高').map(([k]) => k)
  return { total: regions.length, highRiskCount: highRisk.length, highRisk, riskMap, recommendation: highRisk.length > 0 ? `${highRisk.join(', ')} 地缘风险需重点监控` : '地缘风险水平达标' }
}
function formatGeoPoliticalRisk(r: any) {
  return `# 地缘政治风险扫描
🌍 暴露区域: ${r.total} | 高风险: ${r.highRiskCount}
## 各地区风险
${Object.entries(r.riskMap).map(([k, v]: any) => `- ${k}: ${v.level}风险 (${v.score}分)`).join('\n')}
⚠️ 高风险区域: ${r.highRisk.join(', ') || '无'}
💡 ${r.recommendation}
---
💠 对标Resilinc地缘风险智能：关税+制裁+政局+物流四维度综合评估。`
}
function analyzeSupplyChainPCRF(data: any) {
  const metrics = data.pcrfMetrics || {}
  // PCRF = Plan/Configure/Run/Fulfill 供应链运营参考模型
  const planScore = ((metrics.forecastAccuracy || 60) + (metrics.scheduleAdherence || 70)) / 2
  const configScore = ((metrics.contractCompliance || 80) + (metrics.supplierDiversity || 50)) / 2
  const runScore = ((metrics.productionOEE || 75) + (metrics.qualityYield || 90)) / 2
  const fulfillScore = ((metrics.ontimeDelivery || 85) + (metrics.orderFillRate || 90)) / 2
  const overall = ((planScore + configScore + runScore + fulfillScore) / 4).toFixed(1)
  const lowest = Math.min(planScore, configScore, runScore, fulfillScore)
  const lowestName = lowest === planScore ? '计划' : lowest === configScore ? '配置' : lowest === runScore ? '执行' : '履约'
  return { planScore: planScore.toFixed(0), configScore: configScore.toFixed(0), runScore: runScore.toFixed(0), fulfillScore: fulfillScore.toFixed(0), overall, weakest: lowestName, recommendation: parseFloat(overall) < 70 ? `${lowestName}环节薄弱，需重点提升` : 'PCRF整体健康' }
}
function formatSupplyChainPCRF(r: any) {
  return `# 供应链PCRF运营评估
📊 综合分: ${r.overall}/100
- Plan 计划: ${r.planScore} | Configure 配置: ${r.configScore}
- Run 执行: ${r.runScore} | Fulfill 履约: ${r.fulfillScore}
🔻 最弱环节: ${r.weakest}
💡 ${r.recommendation}
---
💠 对标APICS SCOR/PCRF模型：全链路运营健康度评估。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'multi_tier_visibility',
    description: '多层供应商穿透：统计各层供应商数量、可视化率、穿透深度，给出扩展建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"tiers":[{"level":"Tier1","supplierCount":50},{"level":"Tier2","supplierCount":200}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMultiTierVisibility(analyzeMultiTierVisibility(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'disruption_predictor',
    description: '供应链中断预警：分析风险事件，输出高严重度事件清单和总体风险水位',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"riskEvents":[{"name":"红海关税升级","severity":8,"category":"tariff"},{"name":"深圳台风","severity":6,"category":"weather"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatDisruptionPrediction(analyzeDisruptionPrediction(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'supplier_resilience_scorer',
    description: '供应商韧性评估：综合财务稳健、交付可靠、地域多元、库存缓冲四维评分，识别脆弱供应商',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"suppliers":[{"id":"S001","name":"供应商A","financialStability":7,"deliveryReliability":8,"geoDiversity":6,"inventoryBuffer":5}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSupplierResilience(analyzeSupplierResilience(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'scenario_simulator',
    description: '情景模拟与压力测试：多风险事件输入，输出缓解前后残余风险、损失估算、场景排序',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"scenarios":[{"name":"台海风险","probability":0.3,"impactScore":9,"mitigationPct":0.4,"affectedRevenue":500}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatScenarioSimulation(analyzeScenarioSimulation(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'alternative_sourcing_matcher',
    description: '备选供应商匹配：根据质量/产能/交期/成本四维度评分排序，推荐最佳替代来源',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"targetComponent":"芯片-ARM","alternatives":[{"name":"A","qualityMatch":8,"capacityMatch":7,"leadTimeScore":6,"costScore":7,"unitCost":45}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAlternativeSourcing(analyzeAlternativeSourcing(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'geopolitics_risk_scanner',
    description: '地缘政治风险扫描：综合关税+制裁+政局稳定+物流四维度评估，输出高风险区域清单',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"exposureRegions":[{"region":"东南亚","tariffRisk":3,"sanctionRisk":2,"stabilityScore":7,"logisticsRisk":4}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatGeoPoliticalRisk(analyzeGeoPoliticalRisk(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'pcrf_health_assessment',
    description: 'PCRF运营健康度评估：APICS SCOR模型四维度（计划/配置/执行/履约）评分，识别最弱环节',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"pcrfMetrics":{"forecastAccuracy":80,"scheduleAdherence":75,"contractCompliance":90,"supplierDiversity":50,"productionOEE":78,"qualityYield":95,"ontimeDelivery":88,"orderFillRate":92}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSupplyChainPCRF(analyzeSupplyChainPCRF(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'logistics_network_optimizer',
    description: '物流网络优化：分析仓储节点、运输路径、时效与成本，给出网络重构建议（区域仓前置、多式联运等）',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"nodes":[{"name":"上海仓","type":"RDC","dailyVolume":5000},{"name":"北京DC","type":"FDC","dailyVolume":2000}],"lanes":[{"from":"上海","to":"北京","mode":"truck","leadTimeDays":2,"cost":300}],"targetServiceLevel":0.95}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const nodes = d.nodes || []
      const lanes = d.lanes || []
      const target = d.targetServiceLevel || 0.95
      const totalVolume = nodes.reduce((a: number, n: number) => { const nv = (n as any).dailyVolume || 0; return a + nv }, 0)
      const avgLeadTime = lanes.length > 0 ? (lanes.reduce((a: number, l: number) => { const lt = (l as any).leadTimeDays || 0; return a + lt }, 0) / lanes.length).toFixed(1) : '0'
      const currentLevel = Math.min(0.99, 0.85 + (1 / parseFloat(avgLeadTime || '1')) * 0.1).toFixed(2)
      const gap = (parseFloat(currentLevel) < (target as number) * 100 / 100)
      return `# 物流网络优化
📦 节点: ${nodes.length} | 线路: ${lanes.length} | 日处理: ${totalVolume.toLocaleString()}件
⏱ 平均时效: ${avgLeadTime}天 | 当前服务水平: ${(parseFloat(currentLevel) * 100).toFixed(0)}% | 目标: ${(target as number) * 100}%
## 节点分布
${nodes.map((n: any) => `- ${n.name} (${n.type || '仓库'}): 日处理${(n.dailyVolume || 0).toLocaleString()}件`).join('\n')}
## 建议
${gap ? '- ⏰ 当前服务水平未达标，建议增加前置仓或短链运输' : '- ✅ 网络可达目标服务水平'}
${parseFloat(avgLeadTime) > 3 ? '- 🚛 建议多式联运（公铁/公水）降低长途干线时效' : '- 🚛 时效表现良好'}
---
💠 对标SAP IBP：物流成本每降5% = 净利润率提升1-2个百分点。`
    }
  }))
}
