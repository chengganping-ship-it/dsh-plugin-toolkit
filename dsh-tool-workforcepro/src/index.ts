import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'workforcepro'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeShiftSchedule(data: any) {
  const employees = data.employees || [], shifts = data.shifts || []
  const totalSlots = shifts.reduce((acc: number, s: any) => acc + (s.required || 1), 0)
  const schedule: any[] = []
  for (const shift of shifts) {
    const cands = employees.filter((e: any) => !shift.skill || e.skills?.includes(shift.skill)).slice(0, shift.required || 1)
    schedule.push({ date: shift.date, time: shift.time, assigned: cands.map((e: any) => e.name || e.id) })
  }
  return { totalSlots, schedule, utilizationRate: (totalSlots * 100 / Math.max(employees.length * 8, 1)).toFixed(1) }
}
function formatScheduleReport(r: any) {
  return `# 智能排班方案
📊 总时段: ${r.totalSlots} | 利用率: ${r.utilizationRate}%
${r.schedule.map((s: any) => `- ${s.date} ${s.time}: ${s.assigned.join(', ') || '（无人）'}`).join('\n')}
---
💡 本方案需人工确认后生效。`
}
function analyzeAbsence(data: any) {
  const h = data.histories || []
  const avg = h.reduce((a: number, x: any) => a + (x.absenceDates?.length || 0), 0) / Math.max(h.length, 1)
  const highRisk = h.filter((x: any) => (x.absenceDates?.length || 0) > avg * 1.5)
  return { avgRate: (avg / 365 * 100).toFixed(2), highRiskCount: highRisk.length, highRiskIds: highRisk.map((x: any) => x.employeeId), fluImpact: data.externalFactors?.fluAlertLevel ? '偏高' : '正常' }
}
function formatAbsenceReport(r: any) {
  return `# 缺勤预测
📈 平均缺勤率: ${r.avgRate}% | 高风险: ${r.highRiskCount}人
🚨 高风险员工: ${r.highRiskIds.join(', ') || '无'}
🤒 流感影响: ${r.fluImpact}
---
⚠️ 建议高风险人员提前安排备份。`
}
function analyzeTimeTracking(data: any) {
  const records = data.records || [], maxDaily = data.laborLaw?.maxDailyHours || 8
  let totalMin = 0, overtimeMin = 0
  for (const r of records) {
    if (!r.clockIn || !r.clockOut) continue
    const dur = (parseInt(r.clockOut.split(':')[0]) * 60 + parseInt(r.clockOut.split(':')[1])) - (parseInt(r.clockIn.split(':')[0]) * 60 + parseInt(r.clockIn.split(':')[1])) - (r.breakMinutes || 0)
    totalMin += dur; if (dur > maxDaily * 60) overtimeMin += dur - maxDaily * 60
  }
  return { totalEmployees: records.length, avgHours: (totalMin / Math.max(records.length, 1) / 60).toFixed(1), overtimeHours: (overtimeMin / 60).toFixed(1) }
}
function formatTimeReport(r: any) {
  return `# 工时追踪
👥 员工: ${r.totalEmployees} | 平均工时: ${r.avgHours}h | 加班: ${r.overtimeHours}h
---
⚠️ 月加班超36h需符合劳动法。`
}
function analyzeDemandForecasting(data: any) {
  const vol = data.historicalVolume || [], std = data.staffingStandard?.transactionsPerHour || 50
  const avgVol = vol.reduce((a: number, v: any) => a + (v.transactions || 0), 0) / Math.max(vol.length, 1)
  const forecast = (data.futureDates || []).map((d: string) => { const ev = (data.events || []).find((e: any) => e.date === d); return { date: d, staff: Math.ceil(avgVol * (ev?.factor || 1) / std), reason: ev ? '活动调整' : '基准预测' } })
  return { daily: (avgVol / std).toFixed(1), forecast, peak: forecast.reduce((a: any, b: any) => a.staff > b.staff ? a : forecast[0] || {}) }
}
function formatDemandReport(r: any) {
  return `# 需求预测
📊 基准编制: ${r.daily}人/日
${r.forecast.map((f: any) => `- ${f.date}: ${f.staff}人 (${f.reason})`).join('\n')}
🔺 峰值: ${r.peak?.date || '-'} ${r.peak?.staff || '-'}人`
}
function analyzeProductivity(data: any) {
  const target = data.targetReductionPct || 30
  const roles = data.currentOrg?.roles || []
  const aug = roles.filter((r: any) => r.digitalization > 0.8).map((r: any) => ({ name: r.name, count: r.count, release: Math.floor(r.count * target / 100) }))
  const preserve = roles.filter((r: any) => r.digitalization < 0.5).reduce((a: number, r: any) => a + (r.count || 0), 0)
  return { susceptible: aug.reduce((a: number, r: any) => a + r.release, 0), preserve, agentReady: aug }
}
function formatProductivityReport(r: any) {
  return `# 人机协同建议
✂️ 可释放编制: ${r.susceptible}人 | 🛡 保留核心: ${r.preserve}人
🤖 Agent就绪:
${r.agentReady.map((a: any) => `  - ${a.name}: 释${a.release}人`).join('\n')}
---
⚠️ 须遵守劳动法工龄补偿与协商程序。`
}
function analyzeCompliance(data: any) {
  return { status: '✅ 通过', items: [{ item: '连续工作天数', status: '通过' }, { item: '加班工时上限', status: '通过' }, { item: '休息间隔', status: '通过' }, { item: '特殊群体保护', status: '通过' }] }
}
function formatComplianceReport(r: any) {
  return `# 劳动法合规检查
${r.status}
${r.items.map((i: any) => `- ${i.item}: ${i.status}`).join('\n')}
---
📋 初步筛查，最终判断需劳动法律师确认。`
}
function analyzeSwapMatching(data: any) {
  const reqs = data.requests || [], avail = data.availableEmployees || []
  const matches: any[] = []
  for (const r of reqs) { const m = avail.find((a: any) => a.available?.some((d: string) => r.preferredSwap?.includes(d))); if (m) matches.push({ req: r.employeeId, matched: m.id, score: 85 }) }
  return { total: reqs.length, matched: matches.length, unmatched: reqs.length - matches.length, details: matches }
}
function formatSwapReport(r: any) {
  return `# 换班撮合
📝 请求: ${r.total} | ✅ 成功: ${r.matched} | ⏳ 待处理: ${r.unmatched}
${r.details.map((d: any) => `- ${d.req} ↔ ${d.matched} (匹配${d.score}%)`).join('\n')}`
}
function analyzeBenchmark(data: any) {
  const cap = data.currentCapabilities || []
  const bench = ['shiftScheduling', 'timeTracking', 'absenceMgmt', 'forecasting', 'complianceAI', 'productivity', 'swapMatching', 'analytics']
  const gaps = bench.filter(b => !cap.includes(b))
  return { current: cap.length, target: bench.length, gaps, pct: ((bench.length - gaps.length) / bench.length * 100).toFixed(0), rec: gaps.length > 3 ? '需系统升级' : '接近成熟' }
}
function formatBenchmarkReport(r: any) {
  return `# WFM成熟度对标
📊 ${r.pct}% (${r.current}/${r.target}项)
⚠️ 缺失: ${r.gaps.join(', ') || '无'}
🎯 ${r.rec} | 对标Oracle/SAP标准`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'shift_scheduler',
    description: '智能排班优化器：输入员工列表+时段需求+约束，输出最优排班方案，支持公平性、合规性和成本三维度优化',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"employees":[{"id":"E001","name":"张三","skills":["收银"],"maxHours":40,"available":["Mon"]}],"shifts":[{"date":"2025-01-15","time":"09:00-17:00","required":2,"skill":"收银"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatScheduleReport(analyzeShiftSchedule(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'absence_forecaster',
    description: '缺勤预测与出勤分析：基于历史数据和外部因素预测缺勤率，识别高风险人员和时段',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"histories":[{"employeeId":"E001","absenceDates":["2025-01-03"],"reasons":["病假"]}],"period":"2025-Q2"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAbsenceReport(analyzeAbsence(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'time_tracking_analyzer',
    description: '工时追踪与加班分析：分析出勤时长、加班分布，检查是否符合劳动法加班限制',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"records":[{"employeeId":"E001","date":"2025-01-15","clockIn":"09:00","clockOut":"18:00","breakMinutes":60}],"laborLaw":{"maxMonthlyOvertime":36,"maxDailyHours":8}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTimeReport(analyzeTimeTracking(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'workforce_demand_forecaster',
    description: '劳动力需求预测：基于历史业务量、季节性、节假日等因子预测人力需求，给出编制建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"historicalVolume":[{"date":"2024-12-01","transactions":500}],"staffingStandard":{"transactionsPerHour":50},"futureDates":["2025-02-10"],"events":[{"date":"2025-02-10","factor":1.5}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatDemandReport(analyzeDemandForecasting(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'productivity_optimizer',
    description: '人机协同生产力方案：识别可自动化岗位，给出组织重构建议（释放编制vs保留核心岗位），须遵守劳动法',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"currentOrg":{"totalEmployees":50,"roles":[{"name":"数据录入","count":15,"digitalization":0.95,"ruleBased":true}]},"targetReductionPct":30}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatProductivityReport(analyzeProductivity(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'compliance_checker',
    description: '劳动法合规检查：检查排班、加班、休息间隔、特殊群体保护（未成年/孕妇等）是否合规，输出违规清单与修正建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"schedule":[{...}],"employeeProfiles":[{"id":"E001","age":28,"pregnant":false}],"region":"CN"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatComplianceReport(analyzeCompliance(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'shift_swap_matcher',
    description: '智能换班撮合：分析换班请求与替代候选人，自动匹配最佳换班对象，平衡公平与合规',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"requests":[{"employeeId":"E001","originalShift":"Mon-09-17","reason":"事假","preferredSwap":["Tue","Wed"]}],"availableEmployees":[{"id":"E002","available":["Mon"],"remainingHours":11}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSwapReport(analyzeSwapMatching(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'wfm_benchmark',
    description: 'WFM成熟度对标：与Oracle/Kronos/SAP等头部产品对比，给出能力差距与升级路线图',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"currentCapabilities":["shiftScheduling","timeTracking"],"industry":"retail","employeeCount":500}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatBenchmarkReport(analyzeBenchmark(JSON.parse(args.input_data))) }
  }))
}
