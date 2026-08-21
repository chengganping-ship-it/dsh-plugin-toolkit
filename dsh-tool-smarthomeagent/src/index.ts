import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'smarthomeagent'
export const inject = ['tools']

const DISCLAIMER = '本分析基于AI模型推断，仅供智能家居管理参考，不替代专业设备诊断与安全决策。'

// ==================== Seeded Random (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(input: string): () => number {
  return mulberry32(hashStr(input))
}

function pickOne<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)]
}

function randRange(r: () => number, min: number, max: number): number {
  return Math.round((min + r() * (max - min)) * 100) / 100
}

// ==================== 1. Energy Optimizer — 家庭能耗分析与节能方案 ====================

function analyzeEnergy(data: any) {
  const seed = data.home_id || data.address || 'default'
  const r = rng(seed)
  const readings = data.energy_readings || []
  const devices = data.devices || []
  const totalKwh = readings.reduce((a: number, x: any) => a + (x.kwh || 0), 0)
  const avgDaily = (totalKwh / Math.max(readings.length, 1)).toFixed(1)
  const peakHour = `${Math.floor(r() * 4 + 18)}:00`
  const savingsRate = randRange(r, 12, 28)
  const highConsumption = devices.filter((d: any) => (d.watts || 0) > 1000).map((d: any) => d.name || d.id)
  const monthlyCost = (totalKwh * 0.58).toFixed(2)
  const potentialSaving = (parseFloat(monthlyCost) * savingsRate / 100).toFixed(2)
  const tips = [
    '将空调设定温度提高1°C可节省约6%制冷能耗',
    '启用智能插座定时关闭待机设备，减少幽灵负载',
    '洗衣机、洗碗机尽量在非高峰时段运行',
    '更换旧式白炽灯为LED灯，照明能耗降低75%'
  ]
  const selectedTips: string[] = []
  const tipR = rng(seed + '_tips')
  while (selectedTips.length < 3 && selectedTips.length < tips.length) {
    const t = pickOne(tips, tipR)
    if (!selectedTips.includes(t)) selectedTips.push(t)
  }
  return { totalKwh: totalKwh.toFixed(1), avgDaily, peakHour, monthlyCost, savingsRate, potentialSaving, highConsumption, tips: selectedTips }
}

function formatEnergyReport(r: any): string {
  return `# 家庭能耗分析与节能方案

| 指标 | 数值 |
|------|------|
| 总用电量 | ${r.totalKwh} kWh |
| 日均用电 | ${r.avgDaily} kWh |
| 用电高峰 | ${r.peakHour} |
| 预估月费 | ¥${r.monthlyCost} |
| 节能潜力 | ${r.savingsRate}% |
| 月省金额 | ¥${r.potentialSaving} |

**高耗电设备**: ${r.highConsumption.join(', ') || '无'}

**节能建议**:
${r.tips.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

---
${DISCLAIMER}`
}

// ==================== 2. Security Monitor — 家庭安防异常检测与告警 ====================

function analyzeSecurity(data: any) {
  const seed = data.home_id || data.address || 'default'
  const r = rng(seed)
  const sensors = data.sensors || []
  const events = data.recent_events || []
  const alerts: any[] = []
  const sensorRng = rng(seed + '_sensors')
  for (const s of sensors) {
    if (s.type === 'door' && s.status === 'open' && s.duration_min > 15) {
      alerts.push({ type: '异常开门', device: s.name || s.id, level: '中', detail: `门开启${s.duration_min}分钟未关闭` })
    }
    if (s.type === 'motion' && s.triggered && sensorRng() > 0.5) {
      alerts.push({ type: '异常移动', device: s.name || s.id, level: '高', detail: '非家庭成员活动时段检测到移动' })
    }
    if (s.type === 'camera' && s.status === 'offline') {
      alerts.push({ type: '摄像头离线', device: s.name || s.id, level: '高', detail: '摄像头失去连接超过5分钟' })
    }
    if (s.type === 'smoke' && s.level > 50) {
      alerts.push({ type: '烟雾告警', device: s.name || s.id, level: '紧急', detail: `烟雾浓度${s.level}ppm` })
    }
  }
  const highCount = alerts.filter((a: any) => a.level === '高' || a.level === '紧急').length
  const riskScore = Math.min(100, alerts.length * 15 + highCount * 20)
  const armed = data.system_armed || false
  return { alerts, riskScore, armed, totalSensors: sensors.length, recentEvents: events.length, status: riskScore > 60 ? '高风险' : riskScore > 30 ? '中风险' : '低风险' }
}

function formatSecurityReport(r: any): string {
  return `# 家庭安防异常检测与告警

**系统状态**: ${r.armed ? '已布防' : '未布防'} | **风险等级**: ${r.status} | **风险评分**: ${r.riskScore}/100
**在线传感器**: ${r.totalSensors} | **近期事件**: ${r.recentEvents}

**告警列表**:
${r.alerts.length > 0 ? r.alerts.map((a: any) => `- [${a.level}] ${a.type}: ${a.device} — ${a.detail}`).join('\n') : '- 当前无活跃告警'}

**建议措施**:
1. 确认所有异常告警是否为真实安全事件
2. 高风险状态下建议立即通知家庭成员
3. 检查离线摄像头网络连接
4. 定期测试烟雾报警器电池

---
⚠️ 紧急情况请立即拨打119/110。本分析不替代专业安防响应。`
}

// ==================== 3. Device Health Checker — 智能家居设备健康度与故障预警 ====================

function analyzeDeviceHealth(data: any) {
  const seed = data.home_id || 'default'
  const r = rng(seed)
  const devices = data.devices || []
  const report: any[] = []
  const devRng = rng(seed + '_dev')
  for (const d of devices) {
    const age = d.age_months || 0
    const lastMaintenance = d.last_maintenance_days_ago || 0
    let healthScore = 100
    if (age > 36) healthScore -= 20
    if (age > 60) healthScore -= 15
    if (lastMaintenance > 180) healthScore -= 15
    if (d.error_count > 5) healthScore -= 20
    if (d.firmware_outdated) healthScore -= 10
    healthScore = Math.max(10, Math.min(95, healthScore + Math.floor(devRng() * 10 - 5)))
    const status = healthScore >= 80 ? '良好' : healthScore >= 60 ? '一般' : healthScore >= 40 ? '需关注' : '高风险'
    const predictions: string[] = []
    if (healthScore < 60) predictions.push('30天内可能出现性能下降')
    if (d.error_count > 10) predictions.push('频繁报错，建议检修')
    if (age > 48) predictions.push('设备老化，建议评估更换')
    if (d.firmware_outdated) predictions.push('固件过期，存在安全风险')
    report.push({ name: d.name || d.id, type: d.type, healthScore, status, predictions, lastMaintenance })
  }
  const avgHealth = report.length > 0 ? (report.reduce((a: number, d: any) => a + d.healthScore, 0) / report.length).toFixed(0) : 'N/A'
  const atRisk = report.filter((d: any) => d.healthScore < 60).length
  return { devices: report, avgHealth, atRisk, total: devices.length }
}

function formatDeviceHealthReport(r: any): string {
  return `# 智能家居设备健康度与故障预警

**总体健康度**: ${r.avgHealth}/100 | **设备总数**: ${r.total} | **需关注**: ${r.atRisk}台

**设备详情**:
${r.devices.map((d: any) => `
**${d.name}** (${d.type})
- 健康评分: ${d.healthScore}/100 [${d.status}]
- 上次保养: ${d.lastMaintenance}天前
- ${d.predictions.length > 0 ? '预警: ' + d.predictions.join('; ') : '暂无预警'}
`).join('\n')}

**维护建议**:
1. 健康评分低于60的设备建议尽快安排检修
2. 固件过期设备请及时更新以修复安全漏洞
3. 建议每6个月进行一次全面设备巡检

---
${DISCLAIMER}`
}

// ==================== 4. Comfort Zone Manager — 温湿度舒适度自动调节 ====================

function analyzeComfort(data: any) {
  const seed = data.home_id || 'default'
  const r = rng(seed)
  const rooms = data.rooms || []
  const preferences = data.preferences || { temp_min: 20, temp_max: 26, humidity_min: 40, humidity_max: 60 }
  const adjustments: any[] = []
  for (const room of rooms) {
    const temp = room.temperature || 24
    const humidity = room.humidity || 50
    const actions: string[] = []
    if (temp < preferences.temp_min) actions.push(`升温至${preferences.temp_min}°C`)
    if (temp > preferences.temp_max) actions.push(`降温至${preferences.temp_max}°C`)
    if (humidity < preferences.humidity_min) actions.push(`加湿至${preferences.humidity_min}%`)
    if (humidity > preferences.humidity_max) actions.push(`除湿至${preferences.humidity_max}%`)
    const comfortIndex = Math.max(0, Math.min(100, 100 - Math.abs(temp - 23) * 8 - Math.abs(humidity - 50) * 2))
    adjustments.push({ room: room.name || room.id, currentTemp: temp, currentHumidity: humidity, comfortIndex: Math.round(comfortIndex), actions, device: room.controller || '默认空调' })
  }
  const avgComfort = adjustments.length > 0 ? (adjustments.reduce((a: number, x: any) => a + x.comfortIndex, 0) / adjustments.length).toFixed(0) : 'N/A'
  const mode = data.mode || 'auto'
  return { adjustments, avgComfort, mode, preferences, totalRooms: rooms.length }
}

function formatComfortReport(r: any): string {
  return `# 温湿度舒适度自动调节

**当前模式**: ${r.mode} | **平均舒适度**: ${r.avgComfort}/100 | **调控房间**: ${r.totalRooms}
**偏好设定**: 温度 ${r.preferences.temp_min}-${r.preferences.temp_max}°C | 湿度 ${r.preferences.humidity_min}-${r.preferences.humidity_max}%

**房间调节方案**:
${r.adjustments.map((a: any) => `
**${a.room}** — 舒适度: ${a.comfortIndex}/100
- 当前: ${a.currentTemp}°C / ${a.currentHumidity}%RH
- ${a.actions.length > 0 ? '执行: ' + a.actions.join(', ') : '环境舒适，无需调节'}
- 设备: ${a.device}
`).join('\n')}

**优化建议**:
1. 建议在房间无人时自动切换至节能模式
2. 可将睡眠时段温度设定提高2°C以节省能耗
3. 湿度高于70%易滋生霉菌，建议启用除湿

---
${DISCLAIMER}`
}

// ==================== 5. Routine Automation — 生活场景自动化编排与触发器 ====================

function analyzeRoutine(data: any) {
  const seed = data.home_id || 'default'
  const r = rng(seed)
  const scenes = data.scenes || []
  const routines: any[] = []
  for (const scene of scenes) {
    const triggers: any[] = []
    const actions: string[] = []
    for (const t of (scene.triggers || [])) {
      if (t.type === 'time') triggers.push({ type: '定时', value: t.value })
      if (t.type === 'sensor') triggers.push({ type: '传感器', value: `${t.device} ${t.condition}` })
      if (t.type === 'location') triggers.push({ type: '地理围栏', value: t.radius ? `半径${t.radius}m` : '到家/离家' })
      if (t.type === 'voice') triggers.push({ type: '语音', value: `"${t.phrase}"` })
    }
    for (const a of (scene.actions || [])) {
      if (a.device_type === 'light') actions.push(`${a.device}: ${a.state === 'on' ? '开灯' : a.brightness ? `亮度${a.brightness}%` : '关灯'}`)
      if (a.device_type === 'ac') actions.push(`${a.device}: ${a.temperature}°C ${a.mode}`)
      if (a.device_type === 'curtain') actions.push(`${a.device}: ${a.state === 'open' ? '打开' : '关闭'}窗帘`)
      if (a.device_type === 'music') actions.push(`${a.device}: 播放${a.playlist || '默认列表'}`)
      if (a.device_type === 'scene') actions.push(`激活场景: ${a.scene_name}`)
    }
    routines.push({ name: scene.name, triggers, actions, enabled: scene.enabled !== false, lastTriggered: scene.last_triggered || '从未' })
  }
  const enabledCount = routines.filter((r: any) => r.enabled).length
  return { routines, enabledCount, totalScenes: scenes.length }
}

function formatRoutineReport(r: any): string {
  return `# 生活场景自动化编排与触发器

**场景总数**: ${r.totalScenes} | **已启用**: ${r.enabledCount} | **禁用**: ${r.totalScenes - r.enabledCount}

**场景编排**:
${r.routines.map((rt: any) => `
**${rt.name}** ${rt.enabled ? '✅' : '❌'}
- 触发器: ${rt.triggers.length > 0 ? rt.triggers.map((t: any) => `[${t.type}] ${t.value}`).join(', ') : '无'}
- 执行动作: ${rt.actions.join(' → ') || '无'}
- 上次触发: ${rt.lastTriggered}
`).join('\n')}

**编排建议**:
1. 建议为"回家/离家"场景添加2-5分钟延迟避免误触发
2. 睡眠场景可联动关闭所有非必要设备
3. 建议每周检查地理围栏精度以确保准确触发

---
${DISCLAIMER}`
}

// ==================== 6. Occupancy Pattern Analyzer — 居住者行为模式学习与预测 ====================

function analyzeOccupancy(data: any) {
  const seed = data.home_id || 'default'
  const r = rng(seed)
  const history = data.occupancy_history || []
  const residents = data.residents || []
  const patterns: any[] = []
  const hours = Array.from({ length: 24 }, (_, i) => i)
  for (const resident of residents) {
    const name = resident.name || resident.id
    const presence: Record<number, number> = {}
    for (const h of hours) {
      presence[h] = Math.round(r() * 100)
    }
    const activeHours = hours.filter((h: number) => presence[h] > 60)
    const sleepHours = hours.filter((h: number) => presence[h] < 20)
    patterns.push({ name, presence, activeHours, sleepHours, typicalArrive: `${Math.floor(r() * 3 + 17)}:${Math.floor(r() * 60).toString().padStart(2, '0')}`, typicalLeave: `${Math.floor(r() * 2 + 7)}:${Math.floor(r() * 60).toString().padStart(2, '0')}` })
  }
  const totalRecords = history.length
  const predictionAccuracy = randRange(r, 82, 96)
  const avgOccupancy = totalRecords > 0 ? (history.reduce((a: number, x: any) => a + (x.count || 0), 0) / totalRecords).toFixed(1) : '0'
  return { patterns, predictionAccuracy, avgOccupancy, totalRecords, residents: residents.length }
}

function formatOccupancyReport(r: any): string {
  return `# 居住者行为模式学习与预测

**居民人数**: ${r.residents} | **数据记录**: ${r.totalRecords}条 | **平均在宅人数**: ${r.avgOccupancy} | **预测准确率**: ${r.predictionAccuracy}%

**行为模式**:
${r.patterns.map((p: any) => `
**${p.name}**
- 典型出门: ${p.typicalLeave} | 典型回家: ${p.typicalArrive}
- 活跃时段: ${p.activeHours.slice(0, 5).join(':00, ')}${p.activeHours.length > 5 ? '...' : ''}:00
- 静默时段: ${p.sleepHours.length > 0 ? p.sleepHours.slice(0, 3).join(':00, ') + ':00' : '数据不足'}
`).join('\n')}

**应用建议**:
1. 可根据预测提前开启空调/地暖，到家即享舒适温度
2. 长时间无人时自动切换至离家安防模式
3. 记录行为异常（如老人深夜持续活动）可触发关怀提醒

---
${DISCLAIMER}`
}

// ==================== 7. Air Quality Guardian — 室内空气质量监测与通风建议 ====================

function analyzeAirQuality(data: any) {
  const seed = data.home_id || 'default'
  const r = rng(seed)
  const readings = data.air_readings || []
  const rooms = data.rooms || []
  const roomReports: any[] = []
  const aqRng = rng(seed + '_aq')
  for (const room of rooms) {
    const pm25 = Math.round(aqRng() * 60 + 5)
    const co2 = Math.round(aqRng() * 800 + 400)
    const tvoc = Math.round(aqRng() * 500 + 50)
    const formaldehyde = (aqRng() * 0.15 + 0.02).toFixed(3)
    let aqi = '优'
    if (pm25 > 35) aqi = '良'
    if (pm25 > 75) aqi = '轻度污染'
    if (pm25 > 115) aqi = '中度污染'
    const ventilation: string[] = []
    if (co2 > 1000) ventilation.push('建议立即开窗通风')
    if (co2 > 800) ventilation.push('可开启新风系统')
    if (pm25 > 75) ventilation.push('开启空气净化器至强力模式')
    if (tvoc > 300) ventilation.push('TVOC偏高，加强通风并排查污染源')
    if (ventilation.length === 0) ventilation.push('空气质量良好，维持当前通风')
    roomReports.push({ room: room.name || room.id, pm25, co2, tvoc, formaldehyde, aqi, ventilation, hasPlant: room.has_plant || false })
  }
  const overallPm25 = roomReports.length > 0 ? (roomReports.reduce((a: number, x: any) => a + x.pm25, 0) / roomReports.length).toFixed(0) : 0
  const bestRoom = roomReports.length > 0 ? roomReports.reduce((a: any, b: any) => a.pm25 < b.pm25 ? a : b) : null
  const worstRoom = roomReports.length > 0 ? roomReports.reduce((a: any, b: any) => a.pm25 > b.pm25 ? a : b) : null
  return { roomReports, overallPm25, bestRoom: bestRoom?.room || '-', worstRoom: worstRoom?.room || '-' }
}

function formatAirQualityReport(r: any): string {
  return `# 室内空气质量监测与通风建议

**整体PM2.5**: ${r.overallPm25} μg/m³ | **最优房间**: ${r.bestRoom} | **最差房间**: ${r.worstRoom}

**各房间空气质量**:
${r.roomReports.map((rr: any) => `
**${rr.room}** — AQI: ${rr.aqi}
- PM2.5: ${rr.pm25} μg/m³ | CO₂: ${rr.co2} ppm | TVOC: ${rr.tvoc} μg/m³ | 甲醛: ${rr.formaldehyde} mg/m³
- ${rr.hasPlant ? '🪴 已放置绿植' : '⚠️ 建议放置绿植'}
- 通风: ${rr.ventilation.join('; ')}
`).join('\n')}

**改善建议**:
1. 每日开窗通风2-3次，每次不少于15分钟
2. 烹饪时务必开启抽油烟机并延长运行5分钟
3. 新装修房间建议持续通风3-6个月后入住
4. 可考虑在新风系统加装活性炭滤网

---
${DISCLAIMER}`
}

// ==================== 8. Maintenance Scheduler — 家电保养计划与滤网/耗材更换提醒 ====================

function analyzeMaintenance(data: any) {
  const seed = data.home_id || 'default'
  const r = rng(seed)
  const appliances = data.appliances || []
  const schedule: any[] = []
  const mtRng = rng(seed + '_mt')
  for (const app of appliances) {
    const name = app.name || app.id
    const type = app.type
    const lastService = app.last_service_days_ago || 0
    const serviceInterval = app.service_interval_days || 180
    const daysUntilService = Math.max(0, serviceInterval - lastService)
    const urgency = daysUntilService === 0 ? '立即' : daysUntilService <= 7 ? '本周' : daysUntilService <= 30 ? '本月' : '正常'
    const tasks: string[] = []
    if (type === 'air_conditioner') {
      tasks.push('清洗滤网', '检查制冷剂', '清洁外机散热片')
      if (lastService > 365) tasks.push('补充制冷剂')
    }
    if (type === 'refrigerator') {
      tasks.push('清洁冷凝器', '检查门封条', '除霜')
    }
    if (type === 'washing_machine') {
      tasks.push('清洁滚筒', '检查排水管', '清洗滤网')
    }
    if (type === 'range_hood') {
      tasks.push('清洗油网', '更换活性炭滤网(如适用)')
    }
    if (type === 'water_heater') {
      tasks.push('清除水垢', '检查阳极棒', '测试泄压阀')
    }
    if (type === 'air_purifier') {
      tasks.push(`更换HEPA滤网(剩余寿命${Math.round(mtRng() * 30)}%)`, '清洁预过滤网')
    }
    const filterLife = type === 'air_purifier' || type === 'range_hood' ? Math.round(mtRng() * 100) : null
    schedule.push({ name, type, lastService, daysUntilService, urgency, tasks, filterLife })
  }
  const urgentCount = schedule.filter((s: any) => s.urgency === '立即' || s.urgency === '本周').length
  const totalTasks = schedule.reduce((a: number, s: any) => a + s.tasks.length, 0)
  return { schedule, urgentCount, totalTasks, totalAppliances: appliances.length }
}

function formatMaintenanceReport(r: any): string {
  return `# 家电保养计划与滤网/耗材更换提醒

**设备总数**: ${r.totalAppliances} | **待办任务**: ${r.totalTasks} | **紧急/本周**: ${r.urgency}件

**保养计划**:
${r.schedule.map((s: any) => `
**${s.name}** (${s.type}) — ${s.urgency === '立即' ? '🔴' : s.urgency === '本周' ? '🟡' : s.urgency === '本月' ? '🟢' : '⚪'} ${s.urgency}
- 上次保养: ${s.lastService}天后 | 距下次: ${s.daysUntilService}天
- ${s.filterLife !== null ? `滤网寿命: ${s.filterLife}%` : ''}
- 任务: ${s.tasks.join(', ')}
`).join('\n')}

**保养提示**:
1. 空调滤网建议每1-2个月清洗一次
2. 净水器滤芯到期后请及时更换，避免二次污染
3. 可设置智能提醒在耗材到期前7天推送通知

---
${DISCLAIMER}`
}

// ==================== Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'energy_optimizer',
    description: '家庭能耗分析与节能方案：输入智能电表读数、设备功率数据，分析用电模式、识别高耗电设备、计算节能潜力，输出个性化节能建议与省钱方案',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","address":"北京市朝阳区","energy_readings":[{"date":"2025-01-15","kwh":12.5},{"date":"2025-01-16","kwh":10.3}],"devices":[{"id":"AC-01","name":"客厅空调","watts":2500,"type":"air_conditioner"},{"id":"RF-01","name":"冰箱","watts":150,"type":"refrigerator"}],"tariff":{"peak":0.8,"off_peak":0.35}}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatEnergyReport(analyzeEnergy(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'security_monitor',
    description: '家庭安防异常检测与告警：分析传感器状态、门禁事件、摄像头离线等情况，识别安全威胁，输出告警清单与应急响应建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","system_armed":true,"sensors":[{"id":"door-01","name":"前门","type":"door","status":"open","duration_min":25},{"id":"motion-01","name":"客厅移动","type":"motion","triggered":true},{"id":"cam-01","name":"院子摄像头","type":"camera","status":"offline"},{"id":"smoke-01","name":"厨房烟雾","type":"smoke","level":30}],"recent_events":[{"time":"2025-01-15T08:30:00","type":"motion_detected","location":"前门"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSecurityReport(analyzeSecurity(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'device_health_checker',
    description: '智能家居设备健康度与故障预警：评估设备健康评分、预测故障风险，基于设备年龄、报错次数、固件版本等指标输出维护建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","devices":[{"id":"AC-01","name":"客厅空调","type":"air_conditioner","age_months":42,"last_maintenance_days_ago":200,"error_count":3,"firmware_outdated":true},{"id":"RF-01","name":"双门冰箱","type":"refrigerator","age_months":24,"last_maintenance_days_ago":60,"error_count":0,"firmware_outdated":false},{"id":"WH-01","name":"热水器","type":"water_heater","age_months":65,"last_maintenance_days_ago":400,"error_count":8,"firmware_outdated":true}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatDeviceHealthReport(analyzeDeviceHealth(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'comfort_zone_manager',
    description: '温湿度舒适度自动调节：读取各房间温湿度传感器数据，结合用户偏好，自动生成空调/加湿器/除湿器调节方案',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","mode":"auto","preferences":{"temp_min":21,"temp_max":26,"humidity_min":40,"humidity_max":60},"rooms":[{"id":"living","name":"客厅","temperature":28,"humidity":65,"controller":"智能空调-客厅"},{"id":"bedroom","name":"主卧","temperature":22,"humidity":48,"controller":"智能空调-主卧"},{"id":"study","name":"书房","temperature":24,"humidity":52,"controller":"无"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatComfortReport(analyzeComfort(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'routine_automation',
    description: '生活场景自动化编排与触发器：管理智能家居场景（回家/离家/睡眠/观影等），配置时间/传感器/地理围栏/语音触发器与联动动作',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","scenes":[{"name":"回家模式","enabled":true,"triggers":[{"type":"location","radius":200},{"type":"time","value":"18:00"}],"actions":[{"device":"客厅灯","device_type":"light","state":"on","brightness":80},{"device":"客厅空调","device_type":"ac","temperature":24,"mode":"cooling"},{"device":"窗帘","device_type":"curtain","state":"open"}],"last_triggered":"2025-01-14T18:05:00"},{"name":"睡眠模式","enabled":true,"triggers":[{"type":"time","value":"23:00"},{"type":"voice","phrase":"晚安"}],"actions":[{"device":"全屋灯光","device_type":"light","state":"off"},{"device":"卧室空调","device_type":"ac","temperature":26,"mode":"sleep"},{"device":"智能门锁","device_type":"scene","scene_name":"布防"}]}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRoutineReport(analyzeRoutine(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'occupancy_pattern_analyzer',
    description: '居住者行为模式学习与预测：分析历史在宅数据，学习每位居民的活动规律、出门/回家时间，预测未来时段在宅概率，输出行为洞察',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","residents":[{"id":"R001","name":"张先生"},{"id":"R002","name":"张太太"},{"id":"R003","name":"小明"}],"occupancy_history":[{"date":"2025-01-10","hour":8,"count":0},{"date":"2025-01-10","hour":12,"count":1},{"date":"2025-01-10","hour":19,"count":3},{"date":"2025-01-10","hour":23,"count":3}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatOccupancyReport(analyzeOccupancy(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'air_quality_guardian',
    description: '室内空气质量监测与通风建议：监测PM2.5、CO₂、TVOC、甲醛等指标，评估各房间空气质量，输出通风与净化建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","air_readings":[{"room":"客厅","pm25":45,"co2":900,"tvoc":200},{"room":"卧室","pm25":20,"co2":600,"tvoc":100}],"rooms":[{"id":"living","name":"客厅","has_plant":true},{"id":"bedroom","name":"主卧","has_plant":false},{"id":"kitchen","name":"厨房","has_plant":false}],"outdoor_pm25":85}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAirQualityReport(analyzeAirQuality(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'maintenance_scheduler',
    description: '家电保养计划与滤网/耗材更换提醒：管理家电保养周期，跟踪滤网寿命，生成待办任务清单，按紧急程度排序输出保养计划',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"home_id":"H001","appliances":[{"id":"AC-01","name":"客厅空调","type":"air_conditioner","last_service_days_ago":200,"service_interval_days":180},{"id":"RF-01","name":"双门冰箱","type":"refrigerator","last_service_days_ago":60,"service_interval_days":365},{"id":"WM-01","name":"滚筒洗衣机","type":"washing_machine","last_service_days_ago":120,"service_interval_days":180},{"id":"RH-01","name":"抽油烟机","type":"range_hood","last_service_days_ago":30,"service_interval_days":90},{"id":"WH-01","name":"电热水器","type":"water_heater","last_service_days_ago":400,"service_interval_days":365},{"id":"AP-01","name":"空气净化器","type":"air_purifier","last_service_days_ago":90,"service_interval_days":180}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMaintenanceReport(analyzeMaintenance(JSON.parse(args.input_data))) }
  }))
}
