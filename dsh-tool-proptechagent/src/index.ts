import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'proptechagent'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeBuildingOps(data: any) {
  const buildings = data.buildings || []
  let totalArea = 0, totalSensors = 0, alertsActive = 0
  const byType: Record<string, number> = {}
  for (const b of buildings) {
    totalArea += b.areaSqm || 0
    totalSensors += b.sensorCount || 0
    alertsActive += b.activeAlerts || 0
    byType[b.type || '其他'] = (byType[b.type || '其他'] || 0) + 1
  }
  const coverage = totalSensors > 0 ? (Math.min(totalSensors / Math.max(totalArea / 100, 1), 1) * 100).toFixed(0) : '0'
  return { totalBuildings: buildings.length, totalArea, totalSensors, alertsActive, coverage, byType }
}
function formatBuildingOps(r: any) {
  return `# 智慧楼宇运营概览
🏢 楼宇: ${r.totalBuildings} | 总面积: ${r.totalArea.toLocaleString()}㎡
📡 传感器: ${r.totalSensors} | 覆盖率: ${r.coverage}% | 🔴 告警: ${r.alertsActive}
## 楼宇类型
${Object.entries(r.byType).map(([k, v]: any) => `- ${k}: ${v}栋`).join('\n')}
---
💡 对标ProptechOS：目标40%运营自动化率、25%能耗降低、10%租户留存提升。`
}
function analyzeTenantExp(data: any) {
  const surveys = data.surveys || []
  const total = surveys.length
  if (total === 0) return { satisfaction: 'N/A', promoterCount: 0, avgScore: 0, topComplaint: '无数据', recommendation: '需收集租户反馈' }
  const scores = surveys.map((s: any) => s.score).filter(Boolean)
  const avg = (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)
  const promoters = scores.filter((s: number) => s >= 9).length
  const complaints: Record<string, number> = {}
  for (const s of surveys) for (const c of (s.complaints || [])) complaints[c] = (complaints[c] || 0) + 1
  const top = Object.entries(complaints).sort((a: any, b: any) => b[1] - a[1])[0]
  return { satisfaction: avg, promoters: promoters, avgScore: avg, topComplaint: top?.[0] || '无', recommendation: parseFloat(avg) < 7 ? '需立即改善' : '持续监测' }
}
function formatTenantExp(r: any) {
  return `# 租户体验分析
😊 满意度: ${r.satisfaction}/10 | 推荐者: ${r.promoters}人
⚠️ 主要投诉: ${r.topComplaint}
💡 ${r.recommendation}
---
📋 对标ProptechOS：目标租户留存提升10%。`
}
function analyzeEnergyOpt(data: any) {
  const meters = data.meters || []
  let totalKwh = 0, totalCost = 0, potentialSaving = 0
  for (const m of meters) {
    totalKwh += m.monthlyKwh || 0
    totalCost += m.monthlyCostYuan || 0
    potentialSaving += (m.monthlyKwh || 0) * (m.savingPct || 0.2)
  }
  const savingPct = totalKwh > 0 ? (potentialSaving / totalKwh * 100).toFixed(1) : '0'
  return { totalKwh: totalKwh.toLocaleString(), totalCost: totalCost.toLocaleString(), potentialSaving: potentialSaving.toLocaleString(), savingPct, recommendation: `年节省约¥${Math.round(potentialSaving * 12 * 1).toLocaleString()}` }
}
function formatEnergyOpt(r: any) {
  return `# 能耗优化分析
⚡ 月度耗电: ${r.totalKwh} kWh | 月费用: ¥${r.totalCost}
🌱 可优化节能: ${r.savingPct}% (${r.potentialSaving} kWh/月)
💰 ${r.recommendation}
---
💡 对标ProptechOS：目标25%能耗降低、ESG节能减排合规。`
}
function analyzeFacilityMaintenance(data: any) {
  const assets = data.assets || []
  const total = assets.length
  const byStatus: Record<string, number> = {}
  const upcoming: any[] = []
  for (const a of assets) {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1
    if (a.daysToNextService < 30 && a.daysToNextService > 0) upcoming.push({ name: a.name, days: a.daysToNextService })
  }
  return { total, byStatus, upcoming: upcoming.sort((a, b) => a.days - b.days) }
}
function formatFacilityMaintenance(r: any) {
  return `# 设施设备维护
🔧 资产总数: ${r.total}
## 状态分布
${Object.entries(r.byStatus).map(([k, v]: any) => `- ${k}: ${v}`).join('\n')}
## 近30天需维护
${r.upcoming.map((u: any) => `- ${u.name}: ${u.days}天后`).join('\n') || '无需近期维护'}
---
💡 建议采用预测性维护，减少突发停机，延长设备寿命。`
}
function analyzeESGCompliance(data: any) {
  const dataPoints = data.esgData || []
  const categories: Record<string, number> = {}
  for (const dp of dataPoints) categories[dp.category] = (categories[dp.category] || 0) + (dp.score || 0)
  const total = Object.values(categories).reduce((a: number, b: number) => a + b, 0) as number
  const avg = Object.keys(categories).length > 0 ? (total / Object.keys(categories).length).toFixed(1) : '0'
  return { categories, avg, recommendation: parseFloat(avg) < 60 ? '存在合规风险，需立即整改' : 'ESG表现良好，持续监测' }
}
function formatESGCompliance(r: any) {
  return `# ESG合规评估
📊 综合评分: ${r.avg}/100
## 分维度
${Object.entries(r.categories).map(([k, v]: any) => `- ${k}: ${v}分`).join('\n')}
---
💡 ${r.recommendation}
对标ProptechOS：ESG合规是地产科技核心价值，直接影响资产估值。`
}
function analyzeLeasePortfolio(data: any) {
  const leases = data.leases || []
  let totalRevenue = 0, expiring12m = 0, vacancyPct: any = 0, occupied = 0
  const now = new Date()
  for (const l of leases) {
    totalRevenue += l.monthlyRent * 12
    const expiry = new Date(l.expiryDate)
    if ((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 364) expiring12m++
    if (l.status === 'occupied') occupied++
  }
  vacancyPct = leases.length > 0 ? ((leases.length - occupied) / leases.length * 100).toFixed(1) : '0'
  return { total: leases.length, annualRevenue: (totalRevenue / 10000).toFixed(0), expiring12m, vacancyPct, recommendation: vacancyPct > '20' ? '空置率偏高，需加强招商' : '资产运营稳健' }
}
function formatLeasePortfolio(r: any) {
  return `# 租赁资产组合
🏢 租约: ${r.total}份 | 年租金: ${r.annualRevenue}万
📅 未来12月到期: ${r.expiring12m}份 | 空置率: ${r.vacancyPct}%
---
💡 ${r.recommendation}
对标ProptechOS：租户留存提升10% = 显著降低空置风险。`
}
function analyzeInvestmentROI(data: any) {
  const project = data.project || {}
  const investment = project.totalInvestment || 1000
  const annualNetRevenue = project.annualNetRevenue || 100
  const payback = annualNetRevenue > 0 ? (investment / annualNetRevenue).toFixed(1) : 'N/A'
  const roi = annualNetRevenue > 0 ? ((annualNetRevenue / investment) * 100).toFixed(1) : '0'
  return { projectName: project.name || '-', investment, annualNetRevenue, payback, roi, recommendation: parseFloat(roi) > 8 ? '项目优质，建议推进' : '回报率偏低，需重新评估' }
}
function formatInvestmentROI(r: any) {
  return `# 投资回报分析
项目: ${r.projectName} | 投资: ${r.investment.toLocaleString()}万
📈 年净收益: ${r.annualNetRevenue.toLocaleString()}万 | ROI: ${r.roi}%
⏱ 回本周期: ${r.payback}年
---
💡 ${r.recommendation}
---
📋 本报告为项目初步测算，最终决策需专业评估报告。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'building_ops_center',
    description: '智慧楼宇运营中心：资产分布、传感器覆盖、告警监控、楼宇类型分析，对标ProptechOS',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"buildings":[{"name":"A座","type":"写字楼","areaSqm":50000,"sensorCount":200,"activeAlerts":3}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatBuildingOps(analyzeBuildingOps(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'tenant_experience_analyzer',
    description: '租户体验分析：满意度评分、NPS推荐率、投诉热点，输出改善建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"surveys":[{"tenant":"A公司","score":8,"complaints":["空调","电梯"]}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTenantExp(analyzeTenantExp(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'energy_optimizer',
    description: '能耗优化分析：水电气消耗分析、节能潜力估算、ESG减排目标对标（参考ProptechOS 25%节能目标）',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"meters":[{"name":"冷站","monthlyKwh":50000,"monthlyCostYuan":35000,"savingPct":0.22}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatEnergyOpt(analyzeEnergyOpt(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'facility_maintenance_planner',
    description: '设施设备维护计划：资产台账、状态分布、近期保养提醒、预测性维护建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"assets":[{"name":"冷水机组","status":"运行","daysToNextService":20}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatFacilityMaintenance(analyzeFacilityMaintenance(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'esg_compliance_tracker',
    description: 'ESG合规跟踪：环境/社会/治理三维度评分、合规差距、整改建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"esgData":[{"category":"能源效率","score":75},{"category":"碳排放","score":60}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatESGCompliance(analyzeESGCompliance(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'lease_portfolio_manager',
    description: '租赁资产组合管理：租约状态、到期预警、空置率分析、租金收入测算',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"leases":[{"tenant":"X公司","monthlyRent":50000,"status":"occupied","expiryDate":"2026-06-30"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatLeasePortfolio(analyzeLeasePortfolio(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'property_investment_roi',
    description: '房产投资回报分析：投资总额、年净收益率、回本周期、投资建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"project":{"name":"智慧园改造","totalInvestment":5000,"annualNetRevenue":600}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatInvestmentROI(analyzeInvestmentROI(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'workspace_utilization_optimizer',
    description: '办公空间利用优化：分析面积使用率、工位布局效率、会议室利用率，给出空间规划与节约建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"zones":[{"name":"开放办公区","areaSqm":500,"seats":60,"dailyOccupancy":0.7},{"name":"会议室A","areaSqm":30,"capacity":12,"bookRate":0.6}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const zones = d.zones || []
      let totalArea = 0, utilized = 0
      const report = zones.map((z: any) => {
        const rate = z.dailyOccupancy || z.bookRate || 0
        const efficiency = rate > 0.8 ? '高效' : rate > 0.5 ? '适中' : '低效'
        totalArea += z.areaSqm; utilized += z.areaSqm * rate
        return `- ${z.name}: ${(rate * 100).toFixed(0)}%利用率 (${efficiency})`
      }).join('\n')
      const overall = totalArea > 0 ? ((utilized / totalArea) * 100).toFixed(0) : '0'
      return `# 空间利用优化
📊 整体利用率: ${overall}% | 总面积: ${totalArea.toLocaleString()}㎡
## 各区域
${report}
💡 ${parseInt(overall) < 65 ? '建议优化低效区域，推行共享工位或混合办公' : '空间利用良好，持续监测'}
---
💡 对标ProptechOS：目标空间利用率80%+、运营成本降低15%。`
    }
  }))
}
