import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
export const name = 'healthagentpro'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeRCM(data: any) {
  const rcm = data.rcm || {}
  const totalClaims = rcm.totalClaims || 0
  const cleanClaims = rcm.cleanClaims || 0
  const cleanRate = totalClaims > 0 ? ((cleanClaims / totalClaims) * 100).toFixed(1) : '0'
  const denialRate = rcm.denialPct || 8
  const arDays = rcm.averageARDays || 35
  const recommendation = parseFloat(cleanRate) > 95 && denialRate < 5 ? '收入周期管理优秀' : '存在改善空间，建议优化编码与申报流程'
  return { totalClaims, cleanClaims, cleanRate, denialRate, arDays, recommendation, disclaimer: '本建议仅供参考，不构成医疗或合规建议。' }
}
function formatRCM(r: any) {
  return `# 收入周期管理（RCM）分析
📊 总申报: ${r.totalClaims} | 一次通过: ${r.cleanClaims} | 一次通过率: ${r.cleanRate}%
❌ 拒付率: ${r.denialRate}% | 平均应收天数: ${r.arDays}天
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeClinicalSupport(data: any) {
  const clinical = data.clinical || {}
  const recommendations = clinical.recommendations || []
  if (recommendations.length === 0 && !clinical.department) return { department: '-', recCount: 0, accuracy: '0', recommendation: '无辅助诊疗数据', disclaimer: '本建议仅供参考，不构成医疗诊断。' }
  const highConfidence = recommendations.filter((r: any) => (r.confidence || 0) > 0.8).length
  const avgConfidence = recommendations.length > 0 ? (recommendations.reduce((a: number, r: any) => a + (r.confidence || 0), 0) / recommendations.length * 100).toFixed(0) : '0'
  return { department: clinical.department || '-', recCount: recommendations.length, highConfidence, avgConfidence, recommendation: parseInt(avgConfidence) > 75 ? '辅助诊疗置信度良好' : '建议验证高置信度推荐', disclaimer: '本建议仅供参考，最终诊断需执业医师确认。' }
}
function formatClinicalSupport(r: any) {
  return `# AI辅助诊疗：${r.department}
📊 推荐数: ${r.recCount} | 高置信度: ${r.highConfidence} | 平均置信度: ${r.avgConfidence}%
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeMedicalCoding(data: any) {
  const coding = data.coding || {}
  const totalCases = coding.totalCases || 0
  const coded = coding.codedCases || 0
  const autoCoded = coding.autoCoded || 0
  const autoRate = coded > 0 ? ((autoCoded / coded) * 100).toFixed(1) : '0'
  const accuracy = coding.accuracyPct || 92
  const codeTypes = coding.codeTypes || ['ICD-10', 'CPT', 'HCPCS']
  return { totalCases, coded, autoCoded, autoRate, accuracy, codeTypes, recommendation: parseFloat(autoRate) > 70 ? '自动化编码率优秀' : '建议增强NLP编码模型', disclaimer: '医疗编码需经认证编码员复核。' }
}
function formatMedicalCoding(r: any) {
  return `# 智能医疗编码
📊 病例: ${r.totalCases} | 已编码: ${r.coded} | AI自动编码: ${r.autoCoded} (${r.autoRate}%)
✅ 编码准确率: ${r.accuracy}% | 编码体系: ${r.codeTypes.join(', ')}
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeChronicDisease(data: any) {
  const chronic = data.chronic || {}
  const patients = chronic.monitoredPatients || 0
  const controlled = chronic.controlledPatients || 0
  const controlRate = patients > 0 ? ((controlled / patients) * 100).toFixed(1) : '0'
  const alerts = chronic.activeAlerts || 0
  const adherenceRate = chronic.adherencePct || 75
  return { patients, controlled, controlRate, alerts, adherenceRate, recommendation: parseFloat(controlRate) > 70 ? '慢病管理达标' : `${alerts}项预警需跟进干预`, disclaimer: '本建议仅供参考，患者管理需专业医护人员执行。' }
}
function formatChronicDisease(r: any) {
  return `# 慢病管理AI监测
📊 监测患者: ${r.patients} | 控制达标: ${r.controlled} | 控制率: ${r.controlRate}%
⚠️ 活跃预警: ${r.alerts} | 依从性: ${r.adherenceRate}%
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzePatientEngagement(data: any) {
  const engagement = data.engagement || {}
  const totalPatients = engagement.totalPatients || 0
  const activeUsers = engagement.activeUsers || 0
  const satisfaction = engagement.satisfactionScore || 4.0
  const responseTime = engagement.avgResponseMin || 5
  const activeRate = totalPatients > 0 ? ((activeUsers / totalPatients) * 100).toFixed(1) : '0'
  return { totalPatients, activeUsers, activeRate, satisfaction, responseTime, recommendation: parseFloat(activeRate) > 60 ? '患者活跃度良好' : '建议优化患者触达与互动策略', disclaimer: '数据分析需符合HIPAA/个人信息保护法。' }
}
function formatPatientEngagement(r: any) {
  return `# AI患者服务参与度
📊 总患者: ${r.totalPatients} | 活跃用户: ${r.activeUsers} | 活跃率: ${r.activeRate}%
😊 满意度: ${r.satisfaction}/5 | 平均响应: ${r.responseTime}分钟
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeImagingAI(data: any) {
  const imaging = data.imaging || {}
  const totalScans = imaging.totalScans || 0
  const aiAnalyzed = imaging.aiAnalyzed || 0
  const autoRate = totalScans > 0 ? ((aiAnalyzed / totalScans) * 100).toFixed(1) : '0'
  const sensitivity = imaging.sensitivityPct || 92
  const specificity = imaging.specificityPct || 95
  return { totalScans, aiAnalyzed, autoRate, sensitivity, specificity, recommendation: parseFloat(autoRate) > 80 ? '影像AI分析覆盖率高' : '建议扩展影像AI应用场景', disclaimer: 'AI影像分析结果需经执业医师复核确认。' }
}
function formatImagingAI(r: any) {
  return `# AI医学影像分析
📊 总影像: ${r.totalScans} | AI分析: ${r.aiAnalyzed} | 自动化率: ${r.autoRate}%
🎯 敏感性: ${r.sensitivity}% | 特异性: ${r.specificity}%
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}
function analyzeOperationalEfficiency(data: any) {
  const ops = data.operations || {}
  const bedUtilization = ops.bedUtilizationPct || 80
  const staffEfficiency = ops.staffEfficiencyPct || 75
  const waitTimeAvg = ops.avgWaitMin || 25
  const costSaving = ops.aiCostSavingWan || 0
  const score = ((bedUtilization * 0.3) + (staffEfficiency * 0.3) + (Math.max(0, 100 - waitTimeAvg * 2) * 0.4)).toFixed(0)
  return { bedUtilization, staffEfficiency, waitTimeAvg, costSaving, score, recommendation: parseFloat(score) > 75 ? '运营效率优秀' : '建议针对性优化低效环节', disclaimer: '运营建议需结合医院实际情况执行。' }
}
function formatOperationalEfficiency(r: any) {
  return `# 医疗运营效率AI优化
📊 综合评分: ${r.score}/100 | 床位利用率: ${r.bedUtilization}% | 人员效率: ${r.staffEfficiency}%
⏱ 平均候诊: ${r.waitTimeAvg}分钟 | AI节省成本: ${r.costSaving}万元/年
💡 ${r.recommendation}
---
⚠️ ${r.disclaimer}`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'rcm_analyzer',
    description: '收入周期管理分析：一次通过率、拒付率、应收天数',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"rcm":{"totalClaims":1000,"cleanClaims":920,"denialPct":6,"averageARDays":32}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRCM(analyzeRCM(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'clinical_decision_support',
    description: 'AI辅助诊疗：推荐置信度、辅助诊断准确性',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"clinical":{"department":"心内科","recommendations":[{"condition":"房颤","confidence":0.92}]}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatClinicalSupport(analyzeClinicalSupport(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'medical_coding_assistant',
    description: '智能医疗编码：自动编码率、准确率、编码体系覆盖',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"coding":{"totalCases":5000,"codedCases":4500,"autoCoded":3200,"accuracyPct":94,"codeTypes":["ICD-10","CPT"]}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMedicalCoding(analyzeMedicalCoding(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'chronic_disease_monitor',
    description: '慢病AI监测：控制率、预警数、患者依从性',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"chronic":{"monitoredPatients":1000,"controlledPatients":720,"activeAlerts":45,"adherencePct":78}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatChronicDisease(analyzeChronicDisease(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'patient_engagement_tracker',
    description: '患者服务参与度：活跃率、满意度、响应时效',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"engagement":{"totalPatients":5000,"activeUsers":3200,"satisfactionScore":4.3,"avgResponseMin":3}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPatientEngagement(analyzePatientEngagement(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'imaging_ai_evaluator',
    description: 'AI医学影像分析：自动化率、敏感性与特异性',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"imaging":{"totalScans":2000,"aiAnalyzed":1700,"sensitivityPct":93,"specificityPct":96}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatImagingAI(analyzeImagingAI(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'hospital_operations_optimizer',
    description: '医院运营效率：床位/人员/候诊/成本AI优化评分',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"operations":{"bedUtilizationPct":85,"staffEfficiencyPct":80,"avgWaitMin":18,"aiCostSavingWan":300}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatOperationalEfficiency(analyzeOperationalEfficiency(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'clinical_trial_matcher',
    description: '临床试验匹配：根据患者特征匹配适合的临床试验项目，提升患者入组效率',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"patient":{"age":55,"condition":"lung_cancer","stage":"III","biomarkers":["EGFR","PD-L1"]},"trials":[{"name":"TEMPUS-001","condition":"lung_cancer","phase":"III","eligibilityScore":85}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const patient = d.patient || {}
      const trials = (d.trials || []).sort((a: any, b: any) => (b.eligibilityScore || 0) - (a.eligibilityScore || 0))
      const topMatch = trials[0]
      const report = trials.slice(0, 5).map((t: any) => `- ${t.name} (${t.phase}期): 匹配度${t.eligibilityScore || 0}% ${t.eligibilityScore > 80 ? '⭐推荐' : ''}`).join('\n')
      return `# 临床试验智能匹配
👤 患者: ${patient.age}岁 | ${patient.condition} ${patient.stage || ''} | 标志物: ${patient.biomarkers?.join(', ') || '-'}
## 推荐试验
${report || '无匹配试验'}
${topMatch ? `⭐ 最佳推荐: ${topMatch.name}（匹配度${topMatch.eligibilityScore}%）` : ''}
---
💡 对标AI医疗：智能匹配将临床试验入组效率提升50%+，加速新药研发。`
    }
  }))
}
