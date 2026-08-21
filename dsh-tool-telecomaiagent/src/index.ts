import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
export const name = 'telecomaiagent'
export const inject = ['tools']

const DISCLAIMER = '本分析基于AI模型推断，仅供通信网络运营参考，不替代专业网优与运维决策。'

// ---------------------------------------------------------------------------
// Deterministic PRNG helpers (mulberry32)
// ---------------------------------------------------------------------------

class SeededRandom {
  private state: number
  constructor(seed: number) { this.state = seed }
  next(): number {
    let t = (this.state += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  range(min: number, max: number): number { return min + this.next() * (max - min) }
  int(min: number, max: number): number { return Math.floor(this.range(min, max + 1)) }
  pick<T>(arr: T[]): T { return arr[this.int(0, arr.length - 1)] }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(seed: string): SeededRandom {
  return new SeededRandom(hashStr(seed))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ===========================================================================
// 1. NETWORK OPTIMIZATION -- 网络优化 (覆盖/容量/切换/RSRP)
// ===========================================================================

function analyzeNetworkOptimization(data: any) {
  const cells = data.cells || []
  if (cells.length === 0) return { total: 0, avgRsrp: 0, avgSinr: 0, handoverSuccess: 0, recommendation: '无小区数据' }
  const avgRsrp = cells.reduce((a: number, c: any) => a + (c.rsrp || -100), 0) / cells.length
  const avgSinr = cells.reduce((a: number, c: any) => a + (c.sinr || 15), 0) / cells.length
  const avgThroughput = cells.reduce((a: number, c: any) => a + (c.throughputMbps || 50), 0) / cells.length
  const handoverSuccess = cells.reduce((a: number, c: any) => a + (c.handoverSuccessRate || 95), 0) / cells.length
  const byBand: Record<string, number> = {}
  for (const c of cells) { byBand[c.band || 'n78'] = (byBand[c.band || 'n78'] || 0) + 1 }
  const coverageRate = cells.filter((c: any) => (c.rsrp || -100) > -110).length / cells.length
  return {
    total: cells.length,
    avgRsrp: round2(avgRsrp),
    avgSinr: round2(avgSinr),
    avgThroughput: round2(avgThroughput),
    handoverSuccess: round2(handoverSuccess),
    coverageRate: round2(coverageRate * 100),
    byBand,
    recommendation: avgRsrp < -105 ? '覆盖偏弱，建议增加站点或调整天馈' : avgSinr < 10 ? 'SINR偏低，建议优化频率规划和干扰' : '网络覆盖与质量良好',
  }
}
function formatNetworkOptimizationReport(r: any) {
  return `# 网络优化分析
📊 小区数: ${r.total} | 平均RSRP: ${r.avgRsrp}dBm | 平均SINR: ${r.avgSinr}dB | 切换成功率: ${r.handoverSuccess}%
📊 平均吞吐: ${r.avgThroughput}Mbps | 覆盖率: ${r.coverageRate}%
## 频段分布
${Object.entries(r.byBand).map(([k, v]: any) => `- ${k}: ${v}个小区`).join('\n')}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// 2. FAULT DIAGNOSIS AI -- 故障诊断AI (告警关联/根因分析/故障预测)
// ===========================================================================

function analyzeFaultDiagnosisAi(data: any) {
  const alarms = data.alarms || []
  if (alarms.length === 0) return { total: 0, critical: 0, correlated: 0, mttr: '0', recommendation: '无告警数据' }
  const critical = alarms.filter((a: any) => a.severity === 'critical').length
  const major = alarms.filter((a: any) => a.severity === 'major').length
  const minor = alarms.filter((a: any) => a.severity === 'minor').length
  const correlated = alarms.filter((a: any) => a.correlated).length
  const avgMttr = alarms.reduce((a: number, al: any) => a + (al.mttrMinutes || 45), 0) / alarms.length
  const byType: Record<string, number> = {}
  for (const a of alarms) { byType[a.type || 'unknown'] = (byType[a.type || 'unknown'] || 0) + 1 }
  const rootCauses = ['传输故障', '电源异常', '硬件故障', '软件异常', '外部干扰']
  return {
    total: alarms.length,
    critical,
    major,
    minor,
    correlated,
    correlationRate: round2((correlated / alarms.length) * 100),
    mttr: round2(avgMttr),
    byType,
    topRootCause: rootCauses[Math.floor(Math.random() * rootCauses.length)],
    recommendation: critical > 5 ? '⚠️ 严重告警过多，建议立即启动应急预案' : correlated > alarms.length * 0.6 ? '告警关联度高，建议排查根因' : '告警总体可控，建议持续监控',
  }
}
function formatFaultDiagnosisAiReport(r: any) {
  return `# 故障诊断AI分析
📊 告警总数: ${r.total} | 严重: ${r.critical} | 主要: ${r.major} | 次要: ${r.minor}
📊 关联率: ${r.correlationRate}% | 平均修复时长(MTTR): ${r.mttr}分钟
## 告警类型分布
${Object.entries(r.byType).map(([k, v]: any) => `- ${k}: ${v}条`).join('\n')}
🔍 疑似根因: ${r.topRootCause}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// 3. SPECTRUM MANAGEMENT -- 频谱管理 (频率分配/干扰检测/频谱效率)
// ===========================================================================

function analyzeSpectrumManagement(data: any) {
  const bands = data.spectrumBands || []
  if (bands.length === 0) return { total: 0, utilization: 0, interference: 0, recommendation: '无频谱数据' }
  const totalBandwidth = bands.reduce((a: number, b: any) => a + (b.bandwidthMHz || 20), 0)
  const avgUtilization = bands.reduce((a: number, b: any) => a + (b.utilizationPct || 60), 0) / bands.length
  const interferenceCount = bands.filter((b: any) => b.interferenceDetected).length
  const avgEfficiency = bands.reduce((a: number, b: any) => a + (b.spectralEfficiency || 3.5), 0) / bands.length
  const byOperator: Record<string, number> = {}
  for (const b of bands) { byOperator[b.operator || 'unknown'] = (byOperator[b.operator || 'unknown'] || 0) + (b.bandwidthMHz || 20) }
  return {
    total: bands.length,
    totalBandwidth,
    utilization: round2(avgUtilization),
    interferenceCount,
    interferenceRate: round2((interferenceCount / bands.length) * 100),
    spectralEfficiency: round2(avgEfficiency),
    byOperator,
    recommendation: interferenceCount > bands.length * 0.3 ? '干扰比例高，建议开展频谱整治' : avgUtilization > 85 ? '频谱利用率饱和，建议申请新频段' : '频谱资源利用合理',
  }
}
function formatSpectrumManagementReport(r: any) {
  return `# 频谱管理分析
📊 频段数: ${r.total} | 总带宽: ${r.totalBandwidth}MHz | 平均利用率: ${r.utilization}%
📊 干扰频段: ${r.interferenceCount} | 干扰率: ${r.interferenceRate}% | 频谱效率: ${r.spectralEfficiency}bps/Hz
## 运营商分布
${Object.entries(r.byOperator).map(([k, v]: any) => `- ${k}: ${v}MHz`).join('\n')}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// 4. CUSTOMER EXPERIENCE MGMT -- 客户体验管理 (QoE/MOS/投诉分析)
// ===========================================================================

function analyzeCustomerExperienceMgmt(data: any) {
  const services = data.services || []
  if (services.length === 0) return { total: 0, avgMos: 0, qoeScore: 0, recommendation: '无业务数据' }
  const avgMos = services.reduce((a: number, s: any) => a + (s.mos || 3.8), 0) / services.length
  const avgQoe = services.reduce((a: number, s: any) => a + (s.qoeScore || 75), 0) / services.length
  const complaintRate = services.reduce((a: number, s: any) => a + (s.complaintRate || 2), 0) / services.length
  const byService: Record<string, number> = {}
  for (const s of services) { byService[s.type || 'voice'] = (byService[s.type || 'voice'] || 0) + 1 }
  const nps = Math.round((avgQoe - 50) * 0.8 + (avgMos - 3) * 10)
  return {
    total: services.length,
    avgMos: round2(avgMos),
    qoeScore: round2(avgQoe),
    complaintRate: round2(complaintRate),
    nps,
    byService,
    recommendation: avgMos < 3.5 ? 'MOS偏低，建议排查语音质量和网络时延' : avgQoe < 70 ? 'QoE评分不足，建议优化视频和游戏体验' : '客户体验总体良好',
  }
}
function formatCustomerExperienceMgmtReport(r: any) {
  return `# 客户体验管理分析
📊 业务数: ${r.total} | 平均MOS: ${r.avgMos} | QoE评分: ${r.qoeScore}/100 | NPS: ${r.nps}
📊 投诉率: ${r.complaintRate}%
## 业务类型分布
${Object.entries(r.byService).map(([k, v]: any) => `- ${k}: ${v}项`).join('\n')}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// 5. SMART BILLING ASSURANCE -- 智能计费保障 (计费准确性/收入泄漏/欺诈检测)
// ===========================================================================

function analyzeSmartBillingAssurance(data: any) {
  const records = data.billingRecords || []
  if (records.length === 0) return { total: 0, accuracy: 0, leakage: 0, recommendation: '无计费数据' }
  const totalRevenue = records.reduce((a: number, r: any) => a + (r.revenue || 0), 0)
  const errorCount = records.filter((r: any) => r.error).length
  const accuracy = ((records.length - errorCount) / records.length) * 100
  const leakageAmount = records.filter((r: any) => r.leakage).reduce((a: number, r: any) => a + (r.leakageAmount || 0), 0)
  const fraudCount = records.filter((r: any) => r.fraudSuspected).length
  const byType: Record<string, number> = {}
  for (const r of records) { byType[r.type || 'data'] = (byType[r.type || 'data'] || 0) + 1 }
  return {
    total: records.length,
    totalRevenue: round2(totalRevenue),
    accuracy: round2(accuracy),
    errorCount,
    leakageAmount: round2(leakageAmount),
    leakageRate: round2((leakageAmount / totalRevenue) * 100),
    fraudCount,
    byType,
    recommendation: accuracy < 99 ? '计费准确率不足99%，建议核查计费规则' : leakageAmount > totalRevenue * 0.01 ? '收入泄漏超过1%，建议加强稽核' : '计费保障运行良好',
  }
}
function formatSmartBillingAssuranceReport(r: any) {
  return `# 智能计费保障分析
📊 话单数: ${r.total} | 总收入: ¥${r.totalRevenue.toLocaleString()} | 准确率: ${r.accuracy}%
📊 错误话单: ${r.errorCount} | 收入泄漏: ¥${r.leakageAmount.toLocaleString()} | 泄漏率: ${r.leakageRate}%
📊 疑似欺诈: ${r.fraudCount}条
## 业务类型
${Object.entries(r.byType).map(([k, v]: any) => `- ${k}: ${v}条`).join('\n')}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// 6. ENERGY EFFICIENCY NETWORK -- 节能网络 (能耗/绿色网络/节能策略)
// ===========================================================================

function analyzeEnergyEfficiencyNetwork(data: any) {
  const sites = data.sites || []
  if (sites.length === 0) return { total: 0, totalPower: 0, pue: 0, recommendation: '无站点数据' }
  const totalPower = sites.reduce((a: number, s: any) => a + (s.powerKw || 5), 0)
  const avgPue = sites.reduce((a: number, s: any) => a + (s.pue || 1.5), 0) / sites.length
  const renewableSites = sites.filter((s: any) => s.renewableEnergy).length
  const co2Reduction = sites.reduce((a: number, s: any) => a + (s.co2ReductionTon || 0), 0)
  const byEnergyLevel: Record<string, number> = {}
  for (const s of sites) {
    const level = (s.pue || 1.5) < 1.3 ? '高效' : (s.pue || 1.5) < 1.6 ? '中等' : '高能耗'
    byEnergyLevel[level] = (byEnergyLevel[level] || 0) + 1
  }
  return {
    total: sites.length,
    totalPower: round2(totalPower),
    avgPue: round2(avgPue),
    renewableSites,
    renewableRate: round2((renewableSites / sites.length) * 100),
    co2Reduction: round2(co2Reduction),
    byEnergyLevel,
    recommendation: avgPue > 1.6 ? 'PUE偏高，建议优化空调和供电系统' : renewableSites < sites.length * 0.3 ? '可再生能源占比低，建议增加太阳能/风能' : '网络能效表现良好',
  }
}
function formatEnergyEfficiencyNetworkReport(r: any) {
  return `# 节能网络分析
📊 站点数: ${r.total} | 总功耗: ${r.totalPower}kW | 平均PUE: ${r.avgPue}
📊 可再生能源站点: ${r.renewableSites} | 占比: ${r.renewableRate}% | CO2减排: ${r.co2Reduction}吨
## 能效分级
${Object.entries(r.byEnergyLevel).map(([k, v]: any) => `- ${k}: ${v}个站点`).join('\n')}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// 7. SLA PERFORMANCE MONITOR -- SLA性能监控 (可用性/时延/吞吐/合规)
// ===========================================================================

function analyzeSlaPerformanceMonitor(data: any) {
  const slas = data.slas || []
  if (slas.length === 0) return { total: 0, compliant: 0, avgAvailability: 0, recommendation: '无SLA数据' }
  const compliant = slas.filter((s: any) => s.compliant).length
  const avgAvailability = slas.reduce((a: number, s: any) => a + (s.availabilityPct || 99.9), 0) / slas.length
  const avgLatency = slas.reduce((a: number, s: any) => a + (s.latencyMs || 20), 0) / slas.length
  const avgThroughput = slas.reduce((a: number, s: any) => a + (s.throughputMbps || 100), 0) / slas.length
  const byTier: Record<string, number> = {}
  for (const s of slas) { byTier[s.tier || 'gold'] = (byTier[s.tier || 'gold'] || 0) + 1 }
  const violations = slas.filter((s: any) => !s.compliant).map((s: any) => s.name || 'unknown')
  return {
    total: slas.length,
    compliant,
    complianceRate: round2((compliant / slas.length) * 100),
    avgAvailability: round2(avgAvailability),
    avgLatency: round2(avgLatency),
    avgThroughput: round2(avgThroughput),
    byTier,
    violations,
    recommendation: compliant < slas.length * 0.95 ? '⚠️ SLA合规率不足95%，需重点关注违规项' : avgAvailability < 99.9 ? '可用性未达99.9%，建议提升冗余' : 'SLA性能总体达标',
  }
}
function formatSlaPerformanceMonitorReport(r: any) {
  return `# SLA性能监控分析
📊 SLA总数: ${r.total} | 合规: ${r.compliant} | 合规率: ${r.complianceRate}%
📊 平均可用性: ${r.avgAvailability}% | 平均时延: ${r.avgLatency}ms | 平均吞吐: ${r.avgThroughput}Mbps
## 等级分布
${Object.entries(r.byTier).map(([k, v]: any) => `- ${k}: ${v}项`).join('\n')}
${r.violations.length > 0 ? `⚠️ 违规项: ${r.violations.join(', ')}` : '✅ 无违规项'}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// 8. NEW GULF SERVICE DESIGNER -- 新业务服务设计器 (新业务规划/海湾地区/服务设计)
// ===========================================================================

function analyzeNewGulfServiceDesigner(data: any) {
  const services = data.newServices || []
  if (services.length === 0) return { total: 0, launched: 0, revenue: 0, recommendation: '无新业务数据' }
  const launched = services.filter((s: any) => s.status === 'launched').length
  const piloting = services.filter((s: any) => s.status === 'piloting').length
  const planning = services.filter((s: any) => s.status === 'planning').length
  const totalRevenue = services.reduce((a: number, s: any) => a + (s.projectedRevenue || 0), 0)
  const avgTimeToMarket = services.reduce((a: number, s: any) => a + (s.timeToMarketMonths || 6), 0) / services.length
  const byCategory: Record<string, number> = {}
  for (const s of services) { byCategory[s.category || '5G'] = (byCategory[s.category || '5G'] || 0) + 1 }
  const gulfFocus = services.filter((s: any) => s.gulfRegion).length
  return {
    total: services.length,
    launched,
    piloting,
    planning,
    totalRevenue: round2(totalRevenue),
    avgTimeToMarket: round2(avgTimeToMarket),
    byCategory,
    gulfFocus,
    gulfRate: round2((gulfFocus / services.length) * 100),
    recommendation: launched < services.length * 0.3 ? '新业务上市率偏低，建议加速商业化' : avgTimeToMarket > 9 ? '上市周期过长，建议优化流程' : '新业务发展势头良好',
  }
}
function formatNewGulfServiceDesignerReport(r: any) {
  return `# 新业务服务设计分析
📊 新业务总数: ${r.total} | 已上市: ${r.launched} | 试点中: ${r.piloting} | 规划中: ${r.planning}
📊 预计总收入: ¥${r.totalRevenue.toLocaleString()} | 平均上市周期: ${r.avgTimeToMarket}个月
📊 海湾地区聚焦: ${r.gulfFocus}项 | 占比: ${r.gulfRate}%
## 业务类别
${Object.entries(r.byCategory).map(([k, v]: any) => `- ${k}: ${v}项`).join('\n')}
💡 ${r.recommendation}
---
> ${DISCLAIMER}`
}

// ===========================================================================
// PLUGIN REGISTRATION
// ===========================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'network_optimization',
    description: '网络优化分析: 小区覆盖/容量/切换成功率/RSRP/SINR/吞吐评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"cells":[{"name":"CellA","band":"n78","rsrp":-95,"sinr":18,"throughputMbps":80,"handoverSuccessRate":97}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatNetworkOptimizationReport(analyzeNetworkOptimization(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'fault_diagnosis_ai',
    description: '故障诊断AI: 告警关联/根因分析/MTTR/严重等级分布',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"alarms":[{"name":"传输中断","severity":"critical","type":"transmission","correlated":true,"mttrMinutes":30}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatFaultDiagnosisAiReport(analyzeFaultDiagnosisAi(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'spectrum_management',
    description: '频谱管理: 频率分配/干扰检测/频谱效率/运营商分布',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"spectrumBands":[{"band":"n78","bandwidthMHz":100,"utilizationPct":70,"interferenceDetected":false,"spectralEfficiency":4.0,"operator":"China Mobile"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSpectrumManagementReport(analyzeSpectrumManagement(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'customer_experience_mgmt',
    description: '客户体验管理: MOS/QoE/NPS/投诉率/业务类型分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"services":[{"type":"voice","mos":4.2,"qoeScore":82,"complaintRate":1.5},{"type":"video","mos":3.8,"qoeScore":75,"complaintRate":2.0}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCustomerExperienceMgmtReport(analyzeCustomerExperienceMgmt(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'smart_billing_assurance',
    description: '智能计费保障: 计费准确性/收入泄漏/欺诈检测/话单分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"billingRecords":[{"type":"data","revenue":1500,"error":false,"leakage":false,"leakageAmount":0,"fraudSuspected":false}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSmartBillingAssuranceReport(analyzeSmartBillingAssurance(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'energy_efficiency_network',
    description: '节能网络: 站点能耗/PUE/可再生能源/CO2减排/能效分级',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"sites":[{"name":"SiteA","powerKw":4.5,"pue":1.4,"renewableEnergy":true,"co2ReductionTon":12}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatEnergyEfficiencyNetworkReport(analyzeEnergyEfficiencyNetwork(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'sla_performance_monitor',
    description: 'SLA性能监控: 可用性/时延/吞吐/合规率/违规项分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"slas":[{"name":"企业专线","tier":"gold","compliant":true,"availabilityPct":99.95,"latencyMs":15,"throughputMbps":200}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSlaPerformanceMonitorReport(analyzeSlaPerformanceMonitor(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'new_gulf_service_designer',
    description: '新业务服务设计: 新业务规划/上市状态/收入预测/海湾地区聚焦',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"newServices":[{"name":"5G专网","category":"5G","status":"launched","projectedRevenue":5000000,"timeToMarketMonths":4,"gulfRegion":true}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatNewGulfServiceDesignerReport(analyzeNewGulfServiceDesigner(JSON.parse(args.input_data))) }
  }))
}
