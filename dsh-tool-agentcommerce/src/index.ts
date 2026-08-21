import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'agentcommerce'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeServiceIntegrationReadiness(data: any) {
  const merchants = data.merchants || []
  if (merchants.length === 0) return { total: 0, ready: 0, coverage: '0', recommendation: '无商户数据，请接入首批试点商户' }
  let ready = 0, pending = 0, blocked = 0
  for (const m of merchants) {
    if (m.status === 'live') ready++
    else if (m.status === 'integration') pending++
    else blocked++
  }
  const categories = [...new Set(merchants.map((m: any) => m.category).filter(Boolean))]
  return { total: merchants.length, ready, pending, blocked, categories, coverage: merchants.length > 0 ? ((ready / merchants.length) * 100).toFixed(0) : '0', recommendation: ready < merchants.length * 0.5 ? '需加速商户接入与API对接' : '首批商户就绪，可启动小范围试点' }
}
function formatServiceIntegrationReadiness(r: any) {
  return `# Agent电商服务接入就绪度
📊 商户: ${r.total} | ✅ 已上线: ${r.ready} | ⏳ 对接中: ${r.pending} | ❌ 阻塞: ${r.blocked}
🌐 上线率: ${r.coverage}%
## 品类覆盖
${r.categories.join(', ') || '暂无'}
💡 ${r.recommendation}
---
💡 对标支付宝AI开放平台：蜜雪冰城/瑞幸/肯德基已接入，Agent下单→支付→取餐全闭环。`
}
function analyzeTransactionRouting(data: any) {
  const orders = data.orders || []
  if (orders.length === 0) return { total: 0, success: 0, failed: 0, avgTime: '0s', gmv: 0, recommendation: '无订单数据' }
  let success = 0, gmv = 0
  for (const o of orders) {
    if (o.status === 'completed') { success++; gmv += o.amount }
  }
  const failed = orders.length - success
  const successRate = ((success / orders.length) * 100).toFixed(1)
  return { total: orders.length, success, failed, successRate, gmv: (gmv / 10000).toFixed(1), avgTime: `${(orders.length * 0.8).toFixed(1)}s`, recommendation: parseFloat(successRate) > 90 ? '交易链路健康' : '需优化支付方式与接单接口' }
}
function formatTransactionRouting(r: any) {
  return `# Agent路由交易链路
📊 订单: ${r.total} | ✅ 成功: ${r.success} | ❌ 失败: ${r.failed} | 成功率: ${r.successRate}%
💰 总GMV: ${r.gmv}万元 | 平均耗时: ${r.avgTime}
💡 ${r.recommendation}
---
💡 Agent商业核心：意图→匹配→下单→支付→履约，全链路<30秒闭环。`
}
function analyzeMerchantOnboarding(data: any) {
  const candidate = data.candidateMerchant || {}
  const score = ((candidate.apiMaturity || 5) + (candidate.menuStructured || 5) + (candidate.paymentReady || 5) + (candidate.fulfillmentCapacity || 5)) / 4
  const factors = [
    { factor: 'API成熟度', score: candidate.apiMaturity || 5 },
    { factor: '商品结构化', score: candidate.menuStructured || 5 },
    { factor: '支付能力', score: candidate.paymentReady || 5 },
    { factor: '履约能力', score: candidate.fulfillmentCapacity || 5 }
  ]
  return { merchantName: candidate.name || '-', score: score.toFixed(1), factors, recommendation: score > 7 ? '优质商户，优先接入' : score > 5 ? '中等，需补强短板' : '接入风险高，建议先优化' }
}
function formatMerchantOnboarding(r: any) {
  return `# 商户接入评估：${r.merchantName}
📊 综合评分: ${r.score}/10
## 分项评分
${r.factors.map((f: any) => `- ${f.factor}: ${f.score}/10`).join('\n')}
💡 ${r.recommendation}
---
💡 Agent标准化接入公约：结构化商品 + 标准化API + 支付闭环 + 履约追踪 = 4要素齐备。`
}
function analyzeConsumerIntentMatching(data: any) {
  const intents = data.consumerIntents || []
  if (intents.length === 0) return { total: 0, matched: 0, topCategories: [], recommendation: '无用户意图数据' }
  const matched = intents.filter((i: any) => i.matched).length
  const categoryCount: Record<string, number> = {}
  for (const i of intents) { const cat = i.category || '其他'; categoryCount[cat] = (categoryCount[cat] || 0) + 1 }
  const topCategories = Object.entries(categoryCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([k]) => k)
  return { total: intents.length, matched, matchRate: ((matched / intents.length) * 100).toFixed(0), topCategories, recommendation: matched < intents.length * 0.8 ? '匹配率偏低，建议丰富服务目录' : '用户意图匹配良好' }
}
function formatConsumerIntentMatching(r: any) {
  return `# 消费者意图匹配分析
📊 意图: ${r.total} | 匹配成功: ${r.matched} | 匹配率: ${r.matchRate}%
## TOP5服务类目
${r.topCategories.map((c: any) => `- ${c}`).join('\n')}
💡 ${r.recommendation}
---
💡 Agent商业本质：把"人找服务"翻转为"服务找人"——意图精准匹配是关键转化引擎。`
}
function analyzeAgentStorefront(data: any) {
  const storefront = data.storefront || {}
  const design = [
    { item: '服务卡片', status: storefront.serviceCards ? '✅' : '❌' },
    { item: '意图模板', status: storefront.intentTemplates ? '✅' : '❌' },
    { item: '对话式导购', status: storefront.conversationalUI ? '✅' : '❌' },
    { item: '一键下单', status: storefront.oneClickBuy ? '✅' : '❌' },
    { item: '订单追踪', status: storefront.orderTracking ? '✅' : '❌' }
  ]
  const count = design.filter(d => d.status === '✅').length
  return { design, count, total: 5, recommendation: count < 3 ? '建议补齐核心交易组件' : '店铺基础组件完善' }
}
function formatAgentStorefront(r: any) {
  return `# Agent店铺组件
📊 完成度: ${r.count}/${r.total}
${r.design.map((d: any) => `- ${d.item}: ${d.status}`).join('\n')}
💡 ${r.recommendation}
---
💡 Agent时代的"店铺"不再是页面，而是对话流+服务卡片+下单组件的组合。`
}
function analyzeCrossIndustryPotential(data: any) {
  const industries = data.targetIndustries || []
  const scoring: Record<string, { potential: string; signal: string }> = {
    '餐饮外卖': { potential: '极高', signal: '瑞幸/蜜雪冰城/肯德基已跑通' },
    '打车出行': { potential: '极高', signal: '高德打车/滴滴Agent化' },
    '电商购物': { potential: '高', signal: '淘宝/京东Agent接入中' },
    '政务便民': { potential: '高', signal: '支付宝城市服务' },
    '医疗健康': { potential: '中', signal: '合规门槛高但价值大' },
    '房产家居': { potential: '中', signal: '决策链路长' },
    '教育培训': { potential: '高', signal: 'AI学习助手+课程购买' }
  }
  const results = industries.map((ind: string) => ({ industry: ind, ...(scoring[ind] || { potential: '待评估', signal: '暂无信号' }) }))
  return { results }
}
function formatCrossIndustryPotential(r: any) {
  return `# 跨行业Agent商业化潜力
${r.results.map((r: any) => `- **${r.industry}**: ${r.potential}潜力 | ${r.signal}`).join('\n')}
---
💡 对标支付宝AI大会阵容：手机厂商+车企+餐饮+物流+政务，Agent商业的跨行业生态正在形成。`
}
function analyzeRevenueModel(data: any) {
  const model = data.revenueModel || {}
  const models = [
    { name: '交易佣金', rate: model.commissionRate || '1-3%', applicable: true },
    { name: '订阅服务费', rate: model.subscriptionFee || '¥99-999/月', applicable: model.subscriptionFee ? true : false },
    { name: '广告推广', rate: model.adRevenue || 'CPC/CPM', applicable: model.adRevenue ? true : false },
    { name: '技术服务费', rate: model.techServiceFee || 'API调用计费', applicable: true },
    { name: '数据服务', rate: model.dataService || '洞察报告', applicable: model.dataService ? true : false }
  ]
  const active = models.filter(m => m.applicable)
  return { models, activeCount: active.length, recommendation: active.length < 2 ? '建议多元化收入模式' : '收入模型组合健康' }
}
function formatRevenueModel(r: any) {
  return `# Agent电商收入模型
📊 已启用: ${r.activeCount}/5
${r.models.map((m: any) => `- ${m.name}: ${m.rate} ${m.applicable ? '✅' : '❌'}`).join('\n')}
💡 ${r.recommendation}
---
💡 对标平台经济：佣金+订阅+广告+技术服务+数据，多元化收入驱动可持续增长。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'service_integration_readiness',
    description: '服务接入就绪度评估：商户接入状态、品类覆盖、上线率，给出首批试点推进建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"merchants":[{"name":"瑞幸咖啡","category":"餐饮","status":"live"},{"name":"XX商户","category":"零售","status":"integration"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatServiceIntegrationReadiness(analyzeServiceIntegrationReadiness(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'transaction_routing_monitor',
    description: '交易路由监控：Agent订单→支付→履约全链路成功率与GMV分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"orders":[{"id":"O001","amount":3500,"status":"completed"},{"id":"O002","amount":1200,"status":"failed"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTransactionRouting(analyzeTransactionRouting(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'merchant_onboarding_assessor',
    description: '商户接入评估：API成熟度、商品结构化、支付与履约能力四维评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"candidateMerchant":{"name":"XX奶茶","apiMaturity":7,"menuStructured":8,"paymentReady":6,"fulfillmentCapacity":7}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMerchantOnboarding(analyzeMerchantOnboarding(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'consumer_intent_matcher',
    description: '消费者意图匹配分析：用户意图→商户服务匹配率、TOP品类分布',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"consumerIntents":[{"intent":"点杯冰美式","category":"餐饮","matched":true}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatConsumerIntentMatching(analyzeConsumerIntentMatching(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'agent_storefront_evaluator',
    description: 'Agent店铺组件评估：服务卡片/意图模板/对话导购/一键下单/订单追踪五要素',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"storefront":{"serviceCards":true,"intentTemplates":true,"conversationalUI":false,"oneClickBuy":true,"orderTracking":true}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAgentStorefront(analyzeAgentStorefront(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'cross_industry_potential_scanner',
    description: '跨行业商业化潜力扫描：餐饮/打车/电商/政务/医疗/房产/教育七大领域评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"targetIndustries":["餐饮外卖","打车出行","电商购物","政务便民"]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCrossIndustryPotential(analyzeCrossIndustryPotential(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'revenue_model_optimizer',
    description: '收入模型优化：佣金/订阅/广告/技术服务/数据收入五维评估与多元化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"revenueModel":{"commissionRate":"2%","subscriptionFee":"","adRevenue":"","techServiceFee":"¥0.1/次","dataService":""}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRevenueModel(analyzeRevenueModel(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'agent_payment_routing',
    description: 'Agent支付路由：评估多渠道支付（支付宝/微信/数字人民币/银行卡）接入状态与成功率',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"paymentChannels":[{"name":"支付宝","status":"active","successRate":99.5},{"name":"数字人民币","status":"pending","successRate":0}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const channels = d.paymentChannels || []
      const active = channels.filter((c: any) => c.status === 'active').length
      const avgRate = channels.length > 0 ? (channels.reduce((a: number, c: any) => a + (c.successRate || 0), 0) / channels.length).toFixed(1) : '0'
      return `# Agent支付路由
📊 渠道: ${channels.length} | 已激活: ${active} | 平均成功率: ${avgRate}%
## 渠道状态
${channels.map((c: any) => `- ${c.name}: ${c.status === 'active' ? '✅' : '⏳'} ${c.successRate || 0}%`).join('\n') || '无'}
💡 ${active < 2 ? '建议接入备用支付渠道' : '支付路由冗余良好'}
---
💡 Agent商业闭环：支付是交易完成的最后一步，多渠道冗余保障交易成功率。`
    }
  }))
}
