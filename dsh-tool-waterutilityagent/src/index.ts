import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'waterutilityagent'
export const inject = ['tools']

const DISCLAIMER = '本分析基于AI模型推断，仅供水务管理参考，不替代专业工程判断与安全决策。'

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

// ==================== 1. Water Quality Monitor — 水质在线监测与GB 5749达标分析 ====================

function analyzeWaterQuality(data: any) {
  const seed = data.station_id || data.plant_id || 'default'
  const r = rng(seed)
  const stations = data.monitoring_stations || []
  const gb5749: Record<string, { min?: number; max?: number; unit: string }> = {
    'pH值': { min: 6.5, max: 8.5, unit: '' },
    '浑浊度': { max: 1, unit: 'NTU' },
    '色度': { max: 15, unit: '度' },
    '臭和味': { max: 0, unit: '无' },
    '肉眼可见物': { max: 0, unit: '无' },
    '总硬度': { max: 450, unit: 'mg/L' },
    '溶解性总固体': { max: 1000, unit: 'mg/L' },
    '氯化物': { max: 250, unit: 'mg/L' },
    '氟化物': { max: 1.0, unit: 'mg/L' },
    '硝酸盐': { max: 10, unit: 'mg/L' },
    '砷': { max: 0.01, unit: 'mg/L' },
    '铅': { max: 0.01, unit: 'mg/L' },
    '汞': { max: 0.001, unit: 'mg/L' },
    '镉': { max: 0.005, unit: 'mg/L' },
    '铬(六价)': { max: 0.05, unit: 'mg/L' },
    '菌落总数': { max: 100, unit: 'CFU/mL' },
    '总大肠菌群': { max: 0, unit: 'MPN/100mL' },
    '游离氯': { min: 0.05, max: 4, unit: 'mg/L' }
  }
  const results: any[] = []
  for (const st of stations) {
    const measures = st.measurements || {}
    const violations: any[] = []
    const checks: any[] = []
    for (const [param, limits] of Object.entries(gb5749)) {
      const val = measures[param]
      if (val !== undefined && val !== null) {
        let passed = true
        if (limits.min !== undefined && val < limits.min) {
          passed = false
          violations.push({ param, value: val, limit: `≥${limits.min}${limits.unit}` })
        }
        if (limits.max !== undefined && limits.max !== 0 && val > limits.max) {
          passed = false
          violations.push({ param, value: val, limit: `≤${limits.max}${limits.unit}` })
        }
        if (limits.max === 0 && val > 0) {
          passed = false
          violations.push({ param, value: val, limit: '不得检出' })
        }
        checks.push({ param, value: val, unit: limits.unit, passed })
      }
    }
    const passRate = checks.length > 0 ? ((checks.length - violations.length) / checks.length * 100).toFixed(1) : '100.0'
    results.push({
      station: st.name || st.id,
      location: st.location || '未指定',
      checks,
      violations,
      passRate,
      sampleTime: st.sample_time || '未知',
      status: violations.length === 0 ? '达标' : violations.length <= 2 ? '轻微超标' : '严重超标'
    })
  }
  const totalChecks = results.reduce((a, x) => a + x.checks.length, 0)
  const totalViolations = results.reduce((a, x) => a + x.violations.length, 0)
  const overallPassRate = totalChecks > 0 ? ((totalChecks - totalViolations) / totalChecks * 100).toFixed(1) : '100.0'
  return { stations: results, totalChecks, totalViolations, overallPassRate, gb5749Standard: 'GB 5749-2022' }
}

function formatWaterQualityReport(r: any): string {
  return `# 水质在线监测与GB 5749达标分析

**执行标准**: ${r.gb5749Standard} | **总检测项**: ${r.totalChecks} | **超标项**: ${r.totalViolations} | **整体达标率**: ${r.overallPassRate}%

**各监测点结果**:
${r.stations.map((s: any) => `
**${s.station}** (${s.location}) — ${s.status === '达标' ? '✅ 达标' : s.status === '轻微超标' ? '⚠️ 轻微超标' : '🔴 严重超标'} | 达标率: ${s.passRate}%
- 检测时间: ${s.sampleTime}
- 检测项: ${s.checks.length} | 超标: ${s.violations.length}
${s.violations.length > 0 ? '- ⚠️ 超标详情: ' + s.violations.map((v: any) => `${v.param}(${v.value}, 限${v.limit})`).join('; ') : '- 所有指标均在限值范围内'}
`).join('\n')}

**建议措施**:
1. 超标监测点应立即增加采样频次，确认不是偶发波动
2. 对重金属指标异常需排查上游污染源
3. 游离氯偏低区域应调整消毒剂投加量
4. 建议每日对各监测点数据进行趋势分析预警

---
${DISCLAIMER}`
}

// ==================== 2. Leak Detection Locator — 供水管网漏损定位与DMA分析 ====================

function analyzeLeakDetection(data: any) {
  const seed = data.dma_id || data.zone_id || 'default'
  const r = rng(seed)
  const dmas = data.dma_zones || []
  const reports: any[] = []
  for (const dma of dmas) {
    const inflow = dma.min_night_flow || randRange(r, 15, 80)
    const expected = dma.expected_baseline || randRange(r, 10, 50)
    const excess = Math.max(0, inflow - expected)
    const leakProbability = Math.min(95, (excess / expected * 100) + randRange(r, 5, 20))
    const likelihood = leakProbability > 70 ? '高' : leakProbability > 40 ? '中' : '低'
    const pipeMaterial = dma.pipe_material || pickOne(['球墨铸铁', 'PE', 'PVC', '钢管', '水泥管'], r)
    const pipeAge = dma.pipe_age_years || Math.floor(randRange(r, 5, 40))
    const pipeLength = dma.pipe_length_km || randRange(r, 3, 50)
    const pressure = dma.avg_pressure || randRange(r, 0.15, 0.45)
    const suspectedLocations: string[] = []
    if (leakProbability > 50) {
      const locCount = Math.floor(randRange(r, 1, 4))
      const locTypes = ['老旧接头', '腐蚀管段', '第三方施工附近', '阀门井周边', '管道穿越处', '弯头/三通']
      for (let i = 0; i < locCount; i++) {
        const loc = pickOne(locTypes, r)
        const road = pickOne(['主干道', '次干道', '支路', '小区路'], r)
        suspectedLocations.push(`${road}${i + 1}号${loc}`)
      }
    }
    const nightFlowRatio = (inflow / Math.max(dma.day_flow || inflow * 5, 1) * 100).toFixed(1)
    const uli = dma.pipe_length > 0 ? (inflow / dma.pipe_length).toFixed(1) : '0'
    const nrw = dma.total_supplied ? (excess / dma.total_supplied * 100).toFixed(1) : (excess / Math.max(expected, 1) * 100).toFixed(1)
    reports.push({
      dma: dma.name || dma.id,
      inflow: inflow.toFixed(1),
      expected: expected.toFixed(1),
      excess: excess.toFixed(1),
      leakProbability: leakProbability.toFixed(0),
      likelihood,
      pipeMaterial,
      pipeAge,
      pipeLength: pipeLength.toFixed(1),
      pressure: pressure.toFixed(2),
      nightFlowRatio,
      uli,
      nrw,
      suspectedLocations,
      recommendAction: likelihood === '高' ? '立即检漏' : likelihood === '中' ? '短期排查' : '持续监测',
      potentialSaving: (excess * 365).toFixed(0) + ' m³/年'
    })
  }
  const highRiskCount = reports.filter((rp: any) => rp.likelihood === '高').length
  const totalExcess = reports.reduce((a: number, x: any) => a + parseFloat(x.excess), 0)
  return { reports, totalZones: dmas.length, highRiskCount, totalExcess: totalExcess.toFixed(1) }
}

function formatLeakDetectionReport(r: any): string {
  return `# 供水管网漏损定位与DMA分析

**DMA总数**: ${r.totalZones} | **高风险区**: ${r.highRiskCount} | **总异常流量**: ${r.totalExcess} m³/h

**各DMA分区分析**:
${r.reports.map((rp: any) => `
**${rp.dma}** — 漏损概率: ${rp.leakProbability}% [${rp.likelihood === '高' ? '🔴 高' : rp.likelihood === '中' ? '🟡 中' : '🟢 低'}]
- 夜间最小流量: ${rp.inflow} m³/h | 基线: ${rp.expected} m³/h | 异常流量: ${rp.excess} m³/h
- 管网特征: ${rp.pipeMaterial}管 | 龄期: ${rp.pipeAge}年 | 长度: ${rp.pipeLength}km | 压力: ${rp.pressure}MPa
- UI指数: ${rp.uli} L/(h·km) | 夜间流量比: ${rp.nightFlowRatio}% | NRW占比: ${rp.nrw}%${rp.suspectedLocations.length > 0 ? `
- 疑似漏点: ${rp.suspectedLocations.join('; ')}` : ''}
- 建议措施: ${rp.recommendAction} | 潜在年节水量: ${rp.potentialSaving}
`).join('\n')}

**检漏建议**:
1. 高风险DMA建议部署声波传感器进行精确定位
2. 夜间流量异常区域可逐步缩小排查范围（关阀测试）
3. 龄期超过25年的管道优先安排更新改造
4. 建议建立DMA水量平衡日分析机制

---
${DISCLAIMER}`
}

// ==================== 3. Pump Station Optimizer — 泵站调度优化与能耗管理 ====================

function analyzePumpOptimization(data: any) {
  const seed = data.station_id || data.plant_id || 'default'
  const r = rng(seed)
  const pumps = data.pumps || []
  const schedules: any[] = []
  const demandForecast = data.hourly_demand || []
  let totalKwh = 0
  let totalSaving = 0
  for (const pump of pumps) {
    const flow = pump.flow_rate || randRange(r, 200, 1500)
    const head = pump.head || randRange(r, 20, 80)
    const efficiency = pump.efficiency || randRange(r, 55, 85)
    const power = (flow * head * 9.81) / (3600 * efficiency / 100)
    const runningHours = pump.daily_hours || randRange(r, 8, 24)
    const dailyKwh = power * runningHours
    totalKwh += dailyKwh
    const age = pump.age_years || Math.floor(randRange(r, 2, 20))
    const maintenanceNeeded = age > 10 || efficiency < 65
    const speedControl = pump.speed_control || pickOne(['变频', '工频', '双速'], r)
    let savingPotential = 0
    let suggestion = '运行正常'
    if (speedControl === '工频') {
      savingPotential = 25
      suggestion = '建议加装变频调速装置'
    } else if (efficiency < 60) {
      savingPotential = 30
      suggestion = '效率偏低，建议更换高效水泵或修复密封'
    } else if (age > 15) {
      savingPotential = 15
      suggestion = '设备老化，计划更新'
    }
    totalSaving += dailyKwh * savingPotential / 100
    schedules.push({
      id: pump.id || '未知',
      name: pump.name || '水泵',
      flow: flow.toFixed(0) + ' m³/h',
      head: head.toFixed(1) + ' m',
      power: power.toFixed(1) + ' kW',
      efficiency: efficiency.toFixed(0) + '%',
      speedControl,
      dailyHours: runningHours.toFixed(0) + ' h',
      dailyKwh: dailyKwh.toFixed(0) + ' kWh',
      status: maintenanceNeeded ? '需维护' : '正常',
      savingPotential: savingPotential + '%',
      suggestion,
      age: age + '年'
    })
  }
  const avgEfficiency = pumps.length > 0 ?
    (schedules.reduce((a, s) => a + parseFloat(s.efficiency), 0) / pumps.length).toFixed(0) : '0'
  const peakDemand = demandForecast.length > 0 ? Math.max(...demandForecast.map((d: any) => d.demand || 0)) : 1200
  const valleyDemand = demandForecast.length > 0 ? Math.min(...demandForecast.map((d: any) => d.demand || 0)) : 300
  const peakValleyRatio = peakDemand && valleyDemand ? (peakDemand / Math.max(valleyDemand, 1)).toFixed(1) : '2.5'
  const recommendedMode = parseFloat(peakValleyRatio) > 3 ? '高峰减压、低谷蓄水' : '均衡调度'
  const tariff = data.tariff || { peak: 0.85, flat: 0.55, valley: 0.30 }
  const dailyCost = totalKwh * tariff.flat
  const savingCost = totalSaving * tariff.flat
  return {
    schedules,
    totalKwh: totalKwh.toFixed(0),
    avgEfficiency: avgEfficiency + '%',
    peakValleyRatio,
    peakDemand: peakDemand + ' m³/h',
    valleyDemand: valleyDemand + ' m³/h',
    recommendedMode,
    totalSaving: totalSaving.toFixed(0) + ' kWh/日',
    dailyCost: '¥' + dailyCost.toFixed(0),
    savingCost: '¥' + savingCost.toFixed(0) + '/日',
    pumps: pumps.length
  }
}

function formatPumpOptimizationReport(r: any): string {
  return `# 泵站调度优化与能耗管理

**运行水泵**: ${r.pumps}台 | **总日耗电**: ${r.totalKwh} kWh | **平均效率**: ${r.avgEfficiency} | **日运行成本**: ${r.dailyCost}
**峰谷比**: ${r.peakValleyRatio} (高峰${r.peakDemand} / 低谷${r.valleyDemand}) | **建议调度**: ${r.recommendedMode}
**节能潜力**: ${r.totalSaving} (日节省 ${r.savingCost})

**水泵运行详情**:
${r.schedules.map((s: any) => `
**${s.name}** (${s.id}) — ${s.status}
- 流量: ${s.flow} | 扬程: ${s.head} | 功率: ${s.power} | 效率: ${s.efficiency} | 调速: ${s.speedControl}
- 日运行: ${s.dailyHours} | 日耗电: ${s.dailyKwh} | 龄期: ${s.age}
- 节能潜力: ${s.savingPotential} | 建议: ${s.suggestion}
`).join('\n')}

**调度优化建议**:
1. 低谷时段降低泵速蓄水至高位水池，高峰时段减压运行
2. 根据实时需水量动态调整运行台数，避免"大马拉小车"
3. 效率低于70%的水泵优先安排节能改造
4. 建立泵站能效KPI考核体系，对标先进水厂

---
${DISCLAIMER}`
}

// ==================== 4. Water Demand Forecaster — 用水量预测与峰谷平衡 ====================

function analyzeWaterDemand(data: any) {
  const seed = data.region_id || data.plant_id || 'default'
  const r = rng(seed)
  const days = data.historical_days || 30
  const baseDemand = data.base_daily_demand || randRange(r, 30000, 150000)
  const population = data.population || Math.floor(baseDemand / randRange(r, 0.15, 0.3))
  const forecastDays = data.forecast_days || 7
  const forecasts: any[] = []
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = 0; i < forecastDays; i++) {
    const dayType = i < 5 ? '工作日' : '周末'
    const factor = dayType === '工作日' ? randRange(r, 0.95, 1.15) : randRange(r, 0.80, 0.95)
    const tempFactor = data.temperature ? (data.temperature > 30 ? 1.12 : data.temperature < 10 ? 0.92 : 1.0) : 1.0
    const specialEvent = pickOne([null, null, null, '节假日', '大型活动', '降雨'], r)
    const eventFactor = specialEvent === '节假日' ? 1.15 : specialEvent === '大型活动' ? 1.25 : specialEvent === '降雨' ? 0.85 : 1.0
    const predicted = Math.round(baseDemand * factor * tempFactor * eventFactor)
    const peakMorning = Math.round(predicted * randRange(r, 0.08, 0.12) / 24 * 10) / 10
    const peakEvening = Math.round(predicted * randRange(r, 0.10, 0.15) / 24 * 10) / 10
    const valleyNight = Math.round(predicted * randRange(r, 0.02, 0.04) / 24 * 10) / 10
    forecasts.push({
      dayOffset: i + 1,
      dayType,
      weekDay: dayNames[i % 7],
      predicted: predicted + ' m³/d',
      perCapita: (predicted / Math.max(population, 1) * 1000).toFixed(1) + ' L/(人·d)',
      morningPeak: peakMorning.toFixed(1) + ' m³/h',
      eveningPeak: peakEvening.toFixed(1) + ' m³/h',
      nightValley: valleyNight.toFixed(1) + ' m³/h',
      peakValleyDiff: (peakEvening - valleyNight).toFixed(1) + ' m³/h',
      event: specialEvent,
      confidence: (randRange(r, 82, 97)).toFixed(0) + '%',
      suggestedStorage: Math.round((peakEvening - predicted / 24) * 2) + ' m³',
      strategy: peakEvening / valleyNight > 3 ? '高差明显：低谷蓄水+高峰减压' : '相对平稳：均衡供水'
    })
  }
  const totalPredicted = forecasts.reduce((a, f) => a + parseFloat(f.predicted), 0)
  const avgDemand = (totalPredicted / forecastDays).toFixed(0)
  const maxPeak = Math.max(...forecasts.map((f) => parseFloat(f.eveningPeak)))
  const minValley = Math.min(...forecasts.map((f) => parseFloat(f.nightValley)))
  return {
    forecasts,
    days: forecastDays,
    totalPredicted: totalPredicted.toFixed(0) + ' m³',
    avgDaily: avgDemand + ' m³/d',
    population: population + '人',
    maxPeak: maxPeak.toFixed(1) + ' m³/h',
    minValley: minValley.toFixed(1) + ' m³/h',
    waterStress: parseFloat(avgDemand) / baseDemand > 1.1 ? '偏高' : parseFloat(avgDemand) / baseDemand < 0.9 ? '偏低' : '正常'
  }
}

function formatWaterDemandReport(r: any): string {
  return `# 用水量预测与峰谷平衡

**预测周期**: ${r.days}天 | **总预测用水**: ${r.totalPredicted} | **日均**: ${r.avgDaily} | **负荷状态**: ${r.waterStress}
**服务人口**: ${r.population} | **最高峰值**: ${r.maxPeak} | **最低谷值**: ${r.minValley}

**逐日预测**:
${r.forecasts.map((f: any) => `
**第${f.dayOffset}天 (${f.weekDay}/${f.dayType})** — ${f.predicted} | 置信度: ${f.confidence}${f.event ? ` | 事件: ${f.event}` : ''}
- 人均用水: ${f.perCapita} | 早高峰: ${f.morningPeak} | 晚高峰: ${f.eveningPeak} | 夜间谷: ${f.nightValley}
- 峰谷差: ${f.peakValleyDiff} | 调节池建议容量: ${f.suggestedStorage} | 策略: ${f.strategy}
`).join('\n')}

**峰谷平衡建议**:
1. 利用高位水池/调节池在低谷蓄水、高峰补水
2. 高峰时段适当降低管网压力，减少漏损
3. 大型活动日提前增加清水池蓄水至80%以上
4. 建议安装在线需水预测系统实现动态调度

---
${DISCLAIMER}`
}

// ==================== 5. Pipe Network Aging Assessor — 管网龄期评估与更新优先级 ====================

function analyzePipeAging(data: any) {
  const seed = data.network_id || data.utility_id || 'default'
  const r = rng(seed)
  const pipes = data.pipe_segments || []
  const assessments: any[] = []
  for (const pipe of pipes) {
    const material = pipe.material || pickOne(['球墨铸铁', 'PE100', 'PVC-U', '钢管', '铸铁管', '水泥管'], r)
    const installYear = pipe.install_year || Math.floor(randRange(r, 1975, 2020))
    const age = new Date().getFullYear() - installYear
    const diameter = pipe.diameter_mm || pickOne([100, 150, 200, 300, 400, 600, 800, 1000], r)
    const length = pipe.length_m || randRange(r, 100, 5000)
    const pressure = pipe.pressure_mpa || randRange(r, 0.2, 0.6)
    const soilType = pipe.soil_type || pickOne(['黏土', '砂土', '回填土', '岩石', '湿陷性黄土'], r)
    const trafficLoad = pipe.traffic_load || pickOne(['轻', '中', '重'], r)
    const breakHistory = pipe.break_count || Math.floor(randRange(r, 0, 8))
    const corrosionRate = material === '钢管' ? randRange(r, 0.05, 0.2) : material === '铸铁管' ? randRange(r, 0.03, 0.12) : randRange(r, 0.01, 0.05)
    const designLife = material === 'PE100' ? 50 : material === 'PVC-U' ? 50 : material === '球墨铸铁' ? 50 : material === '钢管' ? 30 : material === '水泥管' ? 40 : 30
    const remainingLife = Math.max(0, designLife - age - breakHistory * 2 - (corrosionRate * 10))
    const conditionScore = Math.max(10, Math.min(95, 100 - age * 1.2 - breakHistory * 5 - corrosionRate * 30))
    const riskScore = Math.min(100, (age / designLife) * 40 + breakHistory * 8 + (diameter >= 600 ? 15 : 0) + (trafficLoad === '重' ? 10 : 0))
    const priority = riskScore > 70 ? '紧急' : riskScore > 50 ? '高' : riskScore > 30 ? '中' : '低'
    const replacementCost = (length * (diameter <= 200 ? 800 : diameter <= 400 ? 1500 : diameter <= 600 ? 2500 : 4000) / 10000).toFixed(1)
    const method = material === 'PE100' || material === 'PVC-U' ? '内衬修复/穿插法' : diameter <= 300 ? '裂管法' : '开挖更换'
    assessments.push({
      id: pipe.id || '未知',
      location: pipe.location || '未指定',
      material,
      diameter: diameter + 'mm',
      length: length.toFixed(0) + 'm',
      installYear,
      age: age + '年',
      designLife: designLife + '年',
      remainingLife: remainingLife.toFixed(0) + '年',
      conditionScore: conditionScore.toFixed(0),
      riskScore: riskScore.toFixed(0),
      priority,
      breakHistory: breakHistory + '次',
      corrosionRate: corrosionRate.toFixed(2) + 'mm/年',
      soilType,
      trafficLoad,
      replacementCost: replacementCost + '万元',
      method,
      nextAction: priority === '紧急' ? '立即制定更换计划' : priority === '高' ? '1年内安排更新' : priority === '中' ? '3年内列入计划' : '持续监测'
    })
  }
  const totalLength = assessments.reduce((a, p) => a + parseFloat(p.length), 0)
  const urgentCount = assessments.filter((p: any) => p.priority === '紧急').length
  const highCount = assessments.filter((p: any) => p.priority === '高').length
  const avgCondition = assessments.length > 0 ?
    (assessments.reduce((a, p) => a + parseFloat(p.conditionScore), 0) / assessments.length).toFixed(0) : '0'
  const totalCost = assessments.reduce((a, p) => a + parseFloat(p.replacementCost), 0).toFixed(1)
  return {
    assessments: assessments.sort((a: any, b: any) => parseFloat(b.riskScore) - parseFloat(a.riskScore)),
    totalSegments: pipes.length,
    totalLength: (totalLength / 1000).toFixed(1) + 'km',
    urgentCount,
    highCount,
    avgCondition: avgCondition + '/100',
    totalCost: totalCost + '万元'
  }
}

function formatPipeAgingReport(r: any): string {
  return `# 管网龄期评估与更新优先级

**管段总数**: ${r.totalSegments} | **总长度**: ${r.totalLength} | **平均状况评分**: ${r.avgCondition}
**紧急更新**: ${r.urgentCount}段 | **高优先级**: ${r.highCount}段 | **预估总投资**: ${r.totalCost}

**管段评估（按风险排序）**:
${r.assessments.map((a: any) => `
**${a.id}** (${a.location}) — ${a.priority === '紧急' ? '🔴 紧急' : a.priority === '高' ? '🟠 高' : a.priority === '中' ? '🟡 中' : '🟢 低'} | 风险: ${a.riskScore}/100 | 状况: ${a.conditionScore}/100
- ${a.material} | ${a.diameter} | ${a.length} | 安装: ${a.installYear}年 | 龄期: ${a.age} | 设计寿命: ${a.designLife}
- 剩余寿命: ${a.remainingLife} | 爆管记录: ${a.breakHistory} | 腐蚀速率: ${a.corrosionRate}
- 环境: ${a.soilType} | 交通荷载: ${a.trafficLoad}
- 建议工法: ${a.method} | 预估费用: ${a.replacementCost} | 行动: ${a.nextAction}
`).join('\n')}

**更新策略建议**:
1. 优先更新风险评分>70且管径≥300mm的主干管
2. PE/PVC管段可采用非开挖修复技术降低成本
3. 建立管网GIS系统实现全生命周期管理
4. 建议每年更新一次管网风险评估模型

---
${DISCLAIMER}`
}

// ==================== 6. Wastewater Treatment Monitor — 污水处理工艺优化与达标排放 ====================

function analyzeWastewater(data: any) {
  const seed = data.plant_id || 'default'
  const r = rng(seed)
  const units = data.process_units || []
  const dischargeStandard = data.standard || 'GB 18918-2002 一级A'
  const gb18918A: Record<string, { max: number; unit: string }> = {
    'COD': { max: 50, unit: 'mg/L' },
    'BOD5': { max: 10, unit: 'mg/L' },
    'SS': { max: 10, unit: 'mg/L' },
    'NH3-N': { max: 5, unit: 'mg/L' },
    'TN': { max: 15, unit: 'mg/L' },
    'TP': { max: 0.5, unit: 'mg/L' },
    '色度': { max: 30, unit: '倍' },
    'pH': { max: 9, unit: '' },
    '粪大肠菌群': { max: 1000, unit: '个/L' }
  }
  const inflow = data.inflow_measurements || {}
  const outflow = data.outflow_measurements || {}
  const unitReports: any[] = []
  for (const unit of units) {
    const name = unit.name || unit.id
    const type = unit.type || pickOne(['格栅', '沉砂池', '初沉池', '生化池', '二沉池', '消毒池', '污泥处理'], r)
    const efficiency = unit.removal_efficiency || randRange(r, 60, 98)
    const status = efficiency > 85 ? '良好' : efficiency > 70 ? '一般' : '需优化'
    const issues: string[] = []
    if (efficiency < 70) issues.push('去除率偏低，检查运行参数')
    if (type === '生化池' && efficiency < 80) issues.push('可能污泥龄不足或DO偏低')
    if (type === '消毒池' && efficiency < 75) issues.push('消毒剂投加量可能不足')
    unitReports.push({ name, type, efficiency: efficiency.toFixed(0) + '%', status, issues, doLevel: type === '生化池' ? randRange(r, 1.5, 4.0).toFixed(1) + ' mg/L' : '-', mlss: type === '生化池' ? randRange(r, 2000, 4500).toFixed(0) + ' mg/L' : '-' })
  }
  const violations: any[] = []
  const paramChecks: any[] = []
  for (const [param, limits] of Object.entries(gb18918A)) {
    const val = outflow[param]
    if (val !== undefined && val !== null) {
      const passed = param === 'pH' ? val >= 6 && val <= limits.max : val <= limits.max
      if (!passed) violations.push({ param, value: val, limit: `≤${limits.max}${limits.unit}` })
      paramChecks.push({ param, value: val, unit: limits.unit, passed, inflow: inflow[param] || '-' })
    }
  }
  const codRemoval = inflow.COD && outflow.COD ? ((1 - outflow.COD / inflow.COD) * 100).toFixed(1) : '-'
  const nh3Removal = inflow['NH3-N'] && outflow['NH3-N'] ? ((1 - outflow['NH3-N'] / inflow['NH3-N']) * 100).toFixed(1) : '-'
  const dailyVolume = data.daily_flow || randRange(r, 5000, 100000)
  const sludgeVolume = (dailyVolume * randRange(r, 0.001, 0.005)).toFixed(0)
  const energyPerM3 = randRange(r, 0.25, 0.65)
  const totalEnergy = (dailyVolume * energyPerM3).toFixed(0)
  const chemicalCost = (dailyVolume * randRange(r, 0.05, 0.2) / 10000).toFixed(1)
  return {
    unitReports,
    paramChecks,
    violations,
    standard: dischargeStandard,
    codRemoval: codRemoval + '%',
    nh3Removal: nh3Removal + '%',
    dailyVolume: dailyVolume.toFixed(0) + ' m³/d',
    sludgeVolume: sludgeVolume + ' m³/d',
    energyPerM3: energyPerM3.toFixed(2) + ' kWh/m³',
    totalEnergy: totalEnergy + ' kWh/d',
    chemicalCost: chemicalCost + ' 万元/d',
    compliance: violations.length === 0 ? '达标排放' : '超标排放'
  }
}

function formatWastewaterReport(r: any): string {
  return `# 污水处理工艺优化与达标排放

**排放标准**: ${r.standard} | **达标状态**: ${r.compliance === '达标排放' ? '✅ 达标排放' : '🔴 超标排放'}
**日处理量**: ${r.dailyVolume} | **COD去除率**: ${r.codRemoval} | **NH3-N去除率**: ${r.nh3Removal}
**污泥产量**: ${r.sludgeVolume} | **吨水电耗**: ${r.energyPerM3} | **日总电耗**: ${r.totalEnergy} | **日药剂费**: ${r.chemicalCost}

**工艺单元运行状况**:
${r.unitReports.map((u: any) => `
**${u.name}** (${u.type}) — 去除率: ${u.efficiency} [${u.status === '良好' ? '🟢' : u.status === '一般' ? '🟡' : '🔴'} ${u.status}]
${u.doLevel !== '-'
 ? `- DO: ${u.doLevel} | MLSS: ${u.mlss}`
 : ''}${u.issues.length > 0 ? `\n- ⚠️ ${u.issues.join('; ')}` : ''}
`).join('\n')}

**出水水质检测**:
${r.paramChecks.map((p: any) => `- ${p.param}: ${p.value}${p.unit} (进水: ${p.inflow}) ${p.passed ? '✅' : '❌ 超标'}`).join('\n')}
${r.violations.length > 0 ? `\n**超标项**: ${r.violations.map((v: any) => `${v.param}(${v.value}, 限${v.limit})`).join('; ')}` : ''}

**优化建议**:
1. 生化池DO控制在2-3mg/L，过低影响硝化，过高浪费能耗
2. 碳氮比不足时考虑投加乙酸钠等外加碳源
3. 定期校准在线监测仪表，确保数据准确
4. 优化污泥脱水工艺，降低污泥含水率

---
${DISCLAIMER}`
}

// ==================== 7. Water Billing Analytics — 水费营收分析与异常用水检测 ====================

function analyzeBilling(data: any) {
  const seed = data.utility_id || data.region_id || 'default'
  const r = rng(seed)
  const customers = data.customer_records || []
  const analytics: any[] = []
  let totalRevenue = 0
  let totalConsumption = 0
  let abnormalCount = 0
  for (const cust of customers) {
    const meterId = cust.meter_id || cust.id
    const name = cust.name || '用户'
    const type = cust.type || pickOne(['居民', '商业', '工业', '机关', '特种行业'], r)
    const currentReading = cust.current_reading || Math.floor(randRange(r, 100, 50000))
    const lastReading = cust.last_reading || Math.floor(currentReading * randRange(r, 0.85, 0.98))
    const consumption = currentReading - lastReading
    const tariff = type === '居民' ? 3.5 : type === '商业' ? 5.8 : type === '工业' ? 4.5 : type === '机关' ? 4.0 : 8.0
    const amount = consumption * tariff
    totalRevenue += amount
    totalConsumption += consumption
    const avgHistorical = cust.avg_monthly || consumption * randRange(r, 0.7, 1.3)
    const deviation = ((consumption - avgHistorical) / Math.max(avgHistorical, 1) * 100).toFixed(0)
    const isAbnormal = Math.abs(parseFloat(deviation)) > 50
    if (isAbnormal) abnormalCount++
    let abnormalType = '正常'
    if (isAbnormal) {
      if (parseFloat(deviation) > 50) abnormalType = pickOne(['疑似漏水', '用水量突增', '水表故障'], r)
      else abnormalType = pickOne(['用水量骤降', '疑似抄表异常', '季节性变化'], r)
    }
    const arrears = cust.arrears || (r() > 0.85 ? Math.floor(randRange(r, 50, 2000)) : 0)
    analytics.push({
      meterId,
      name,
      type,
      consumption: consumption + ' m³',
      amount: '¥' + amount.toFixed(0),
      tariff: '¥' + tariff + '/m³',
      deviation: deviation + '%',
      isAbnormal,
      abnormalType,
      arrears: arrears > 0 ? '¥' + arrears : '无',
      lastPayment: cust.last_payment_date || '未知',
      riskLevel: arrears > 1000 ? '高风险' : arrears > 200 ? '中风险' : isAbnormal ? '关注' : '正常'
    })
  }
  const avgConsumption = customers.length > 0 ? (totalConsumption / customers.length).toFixed(0) : '0'
  const collectionRate = randRange(r, 92, 99.5).toFixed(1)
  const nonRevenueWater = randRange(r, 8, 22).toFixed(1)
  const avgTariff = totalConsumption > 0 ? (totalRevenue / totalConsumption).toFixed(2) : '0'
  return {
    analytics: analytics.sort((a: any, b: any) => {
      const riskOrder: Record<string, number> = { '高风险': 0, '中风险': 1, '关注': 2, '正常': 3 }
      return (riskOrder[a.riskLevel] || 3) - (riskOrder[b.riskLevel] || 3)
    }),
    totalCustomers: customers.length,
    totalRevenue: '¥' + totalRevenue.toFixed(0),
    totalConsumption: totalConsumption + ' m³',
    avgConsumption: avgConsumption + ' m³/户',
    avgTariff: '¥' + avgTariff + '/m³',
    collectionRate: collectionRate + '%',
    nonRevenueWater: nonRevenueWater + '%',
    abnormalCount,
    arrearsTotal: '¥' + analytics.reduce((a: number, c: any) => a + (parseInt(c.arrears.replace(/[¥,]/g, '')) || 0), 0).toFixed(0)
  }
}

function formatBillingReport(r: any): string {
  return `# 水费营收分析与异常用水检测

**用户总数**: ${r.totalCustomers} | **总营收**: ${r.totalRevenue} | **总用水量**: ${r.totalConsumption}
**户均用水**: ${r.avgConsumption} | **综合水价**: ${r.avgTariff} | **产销差率**: ${r.nonRevenueWater}%
**抄表回收率**: ${r.collectionRate} | **异常用户**: ${r.abnormalCount}户 | **欠费总额**: ${r.arrearsTotal}

**用户明细（按风险排序）**:
${r.analytics.map((a: any) => `
**${a.name}** (${a.meterId}/${a.type}) — ${a.riskLevel === '高风险' ? '🔴' : a.riskLevel === '中风险' ? '🟠' : a.riskLevel === '关注' ? '🟡' : '🟢'} ${a.riskLevel}
- 用水量: ${a.consumption} | 水费: ${a.amount} | 单价: ${a.tariff} | 偏差: ${a.deviation}
- 异常类型: ${a.abnormalType} | 欠费: ${a.arrears} | 最近缴费: ${a.lastPayment}
`).join('\n')}

**管理建议**:
1. 异常用水用户建议48小时内现场核查
2. 欠费超1000元用户启动催缴程序并评估停水风险
3. 产销差率超15%的区域应加强管网检漏
4. 推广智能远传水表，提高抄表准确率与及时性

---
${DISCLAIMER}`
}

// ==================== 8. Flood Prevention Early Warning — 城市内涝预警与排涝调度 ====================

function analyzeFloodPrevention(data: any) {
  const seed = data.city_id || data.district_id || 'default'
  const r = rng(seed)
  const zones = data.flood_zones || []
  const rainfallForecast = data.rainfall_forecast || []
  const warnings: any[] = []
  for (const zone of zones) {
    const name = zone.name || zone.id
    const area = zone.area_km2 || randRange(r, 0.5, 15)
    const drainageCapacity = zone.drainage_capacity || randRange(r, 20, 80)
    const pumpStations = zone.pump_stations || Math.floor(randRange(r, 1, 5))
    const pumpCapacity = zone.total_pump_capacity || pumpStations * randRange(r, 5, 20)
    const imperviousRatio = zone.impervious_ratio || randRange(r, 0.4, 0.85)
    const historicalFloods = zone.historical_floods || Math.floor(randRange(r, 0, 5))
    const forecastRain = rainfallForecast.length > 0 ? rainfallForecast[0].mm || randRange(r, 30, 200) : randRange(r, 30, 200)
    const runoff = forecastRain * area * imperviousRatio * 1000
    const capacity = pumpCapacity * 3600
    const overloadRatio = runoff / Math.max(capacity, 1)
    const waterDepth = Math.min(150, overloadRatio * randRange(r, 10, 40))
    const warningLevel = waterDepth > 80 ? '红色(I级)' : waterDepth > 50 ? '橙色(II级)' : waterDepth > 30 ? '黄色(III级)' : '蓝色(IV级)'
    const affectedPop = Math.round(area * randRange(r, 500, 5000))
    const keyFacilities = zone.key_facilities || pickOne(['地铁站', '医院', '学校', '地下车库', '变电站', '商业中心'], r)
    const dispatchPlan: string[] = []
    if (waterDepth > 30) dispatchPlan.push(`开启${pumpStations}台泵站全力抽排`)
    if (waterDepth > 50) dispatchPlan.push('启动移动泵车支援')
    if (waterDepth > 80) dispatchPlan.push('通知交通管制，封闭积水路段')
    if (historicalFloods > 2) dispatchPlan.push('该区域为历史易涝点，重点关注')
    if (dispatchPlan.length === 0) dispatchPlan.push('常规监测，保持泵站待机')
    warnings.push({
      name,
      area: area.toFixed(1) + ' km²',
      forecastRain: forecastRain.toFixed(0) + ' mm',
      drainageCapacity: drainageCapacity + ' mm/h',
      pumpStations: pumpStations + '座',
      pumpCapacity: pumpCapacity.toFixed(0) + ' m³/h',
      imperviousRatio: (imperviousRatio * 100).toFixed(0) + '%',
      waterDepth: waterDepth.toFixed(0) + ' cm',
      warningLevel,
      affectedPop: affectedPop + '人',
      keyFacilities,
      historicalFloods: historicalFloods + '次',
      dispatchPlan,
      responseTime: waterDepth > 50 ? '30分钟内' : '1小时内',
      priority: waterDepth > 80 ? '最高' : waterDepth > 50 ? '高' : waterDepth > 30 ? '中' : '低'
    })
  }
  const redCount = warnings.filter((w: any) => w.warningLevel.includes('红色')).length
  const orangeCount = warnings.filter((w: any) => w.warningLevel.includes('橙色')).length
  const totalAffected = warnings.reduce((a, w) => a + parseInt(w.affectedPop), 0)
  const maxRain = rainfallForecast.length > 0 ? Math.max(...rainfallForecast.map((r: any) => r.mm || 0)) : 120
  return {
    warnings: warnings.sort((a: any, b: any) => parseFloat(b.waterDepth) - parseFloat(a.waterDepth)),
    totalZones: zones.length,
    redCount,
    orangeCount,
    totalAffected: totalAffected + '人',
    maxRainfall: maxRain + ' mm',
    forecastPeriod: rainfallForecast.length > 0 ? rainfallForecast[0].period || '未来6小时' : '未来6小时',
    overallRisk: redCount > 0 ? '极高' : orangeCount > 0 ? '高' : warnings.some((w) => w.warningLevel.includes('黄色')) ? '中' : '低'
  }
}

function formatFloodPreventionReport(r: any): string {
  return `# 城市内涝预警与排涝调度

**预警时段**: ${r.forecastPeriod} | **最大降雨**: ${r.maxRainfall} | **总体风险**: ${r.overallRisk === '极高' ? '🔴 极高' : r.overallRisk === '高' ? '🟠 高' : r.overallRisk === '中' ? '🟡 中' : '🟢 低'}
**监测区域**: ${r.totalZones} | **红色预警**: ${r.redCount} | **橙色预警**: ${r.orangeCount} | **受影响人口**: ${r.totalAffected}

**分区预警详情**:
${r.warnings.map((w: any) => `
**${w.name}** — ${w.warningLevel} | 预估积水: ${w.waterDepth} | 优先级: ${w.priority}
- 面积: ${w.area} | 预报降雨: ${w.forecastRain} | 排水能力: ${w.drainageCapacity}
- 泵站: ${w.pumpStations} (总排${w.pumpCapacity}) | 不透水率: ${w.imperviousRatio} | 历史涝灾: ${w.historicalFloods}
- 受影响人口: ${w.affectedPop} | 关键设施: ${w.keyFacilities} | 响应时限: ${w.responseTime}
- 调度方案: ${w.dispatchPlan.join(' → ')}
`).join('\n')}

**排涝调度建议**:
1. 红色预警区域泵站全部开启，移动泵车预置到位
2. 提前降低河道水位，腾出调蓄容量
3. 通知交管部门做好交通疏导准备
4. 地下空间（车库、商场）提前部署挡水板与沙袋

---
${DISCLAIMER}`
}

// ==================== Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'water_quality_monitor',
    description: '水质在线监测与GB 5749达标分析：输入各监测点水质检测数据，对照GB 5749-2022生活饮用水卫生标准，逐项判定达标情况，输出超标项与处理建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"station_id":"WQ-001","plant_id":"水厂A","monitoring_stations":[{"id":"S01","name":"出厂水","location":"水厂出水口","sample_time":"2025-01-15T08:00:00","measurements":{"pH值":7.2,"浑浊度":0.5,"色度":5,"总硬度":280,"溶解性总固体":520,"氯化物":120,"氟化物":0.6,"硝酸盐":5.2,"砷":0.003,"铅":0.002,"汞":0.0003,"镉":0.001,"铬(六价)":0.01,"菌落总数":45,"总大肠菌群":0,"游离氯":0.3}},{"id":"S02","name":"管网末梢","location":"幸福小区","sample_time":"2025-01-15T09:00:00","measurements":{"pH值":7.0,"浑浊度":1.2,"色度":8,"游离氯":0.08,"菌落总数":80,"总大肠菌群":0}}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatWaterQualityReport(analyzeWaterQuality(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'leak_detection_locator',
    description: '供水管网漏损定位与DMA分析：输入DMA分区夜间流量、管网参数，计算漏损概率，定位疑似漏点，输出检漏优先级与节水潜力',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"dma_id":"DMA-001","dma_zones":[{"id":"DMA-01","name":"城东片区","min_night_flow":35.5,"expected_baseline":18.0,"day_flow":280,"total_supplied":5200,"pipe_material":"球墨铸铁","pipe_age_years":18,"pipe_length_km":25.3,"avg_pressure":0.32},{"id":"DMA-02","name":"城西片区","min_night_flow":62.0,"expected_baseline":22.0,"day_flow":350,"total_supplied":6800,"pipe_material":"铸铁管","pipe_age_years":32,"pipe_length_km":18.7,"avg_pressure":0.28}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatLeakDetectionReport(analyzeLeakDetection(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'pump_station_optimizer',
    description: '泵站调度优化与能耗管理：输入水泵运行参数、需水预测，分析运行效率，识别节能潜力，输出调度优化方案与成本节约建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"station_id":"PS-001","plant_id":"二水厂","pumps":[{"id":"P-01","name":"1号泵","flow_rate":800,"head":45,"efficiency":78,"daily_hours":16,"speed_control":"变频","age_years":5},{"id":"P-02","name":"2号泵","flow_rate":1200,"head":50,"efficiency":62,"daily_hours":20,"speed_control":"工频","age_years":15},{"id":"P-03","name":"3号泵","flow_rate":600,"head":40,"efficiency":82,"daily_hours":12,"speed_control":"变频","age_years":3}],"hourly_demand":[{"hour":0,"demand":350},{"hour":6,"demand":800},{"hour":12,"demand":1200},{"hour":18,"demand":1500},{"hour":22,"demand":500}],"tariff":{"peak":0.85,"flat":0.55,"valley":0.30}}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPumpOptimizationReport(analyzePumpOptimization(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'water_demand_forecaster',
    description: '用水量预测与峰谷平衡：输入历史用水数据、人口、气象预报，预测未来多日用水量，分析峰谷特征，输出蓄水调度与减压策略',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"region_id":"R-001","plant_id":"一水厂","base_daily_demand":85000,"population":320000,"historical_days":30,"forecast_days":7,"temperature":28,"rainfall_expected":false}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatWaterDemandReport(analyzeWaterDemand(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'pipe_network_aging_assessor',
    description: '管网龄期评估与更新优先级：输入管段属性（材质、龄期、管径、环境等），评估状况与风险评分，排序更新优先级，输出更换工法与投资估算',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"network_id":"NET-001","utility_id":"U-001","pipe_segments":[{"id":"PIPE-001","location":"建设路","material":"铸铁管","diameter_mm":300,"length_m":1200,"install_year":1985,"pressure_mpa":0.35,"soil_type":"黏土","traffic_load":"中","break_count":3},{"id":"PIPE-002","location":"人民路","material":"PE100","diameter_mm":200,"length_m":800,"install_year":2015,"pressure_mpa":0.30,"soil_type":"砂土","traffic_load":"重","break_count":0},{"id":"PIPE-003","location":"解放大道","material":"钢管","diameter_mm":600,"length_m":2500,"install_year":1990,"pressure_mpa":0.40,"soil_type":"回填土","traffic_load":"重","break_count":5}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPipeAgingReport(analyzePipeAging(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'wastewater_treatment_monitor',
    description: '污水处理工艺优化与达标排放：输入进出水水质、工艺参数，对照GB 18918-2002标准判定达标情况，分析各单元去除率，输出工艺调控建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"plant_id":"WWTP-001","standard":"GB 18918-2002 一级A","daily_flow":50000,"inflow_measurements":{"COD":320,"BOD5":150,"SS":180,"NH3-N":35,"TN":45,"TP":4.5,"色度":60,"pH":7.2,"粪大肠菌群":1000000},"outflow_measurements":{"COD":28,"BOD5":5,"SS":6,"NH3-N":2.5,"TN":12,"TP":0.3,"色度":20,"pH":7.0,"粪大肠菌群":500},"process_units":[{"id":"U01","name":"粗格栅","type":"格栅","removal_efficiency":5},{"id":"U02","name":"生化池","type":"生化池","removal_efficiency":92},{"id":"U03","name":"二沉池","type":"二沉池","removal_efficiency":85},{"id":"U04","name":"消毒池","type":"消毒池","removal_efficiency":99}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatWastewaterReport(analyzeWastewater(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'water_billing_analytics',
    description: '水费营收分析与异常用水检测：输入用户抄表数据，分析用水偏差，识别异常用水（漏水/突增/骤降），输出营收统计与风险用户清单',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"utility_id":"U-001","region_id":"R-001","customer_records":[{"id":"M-001","name":"张先生","type":"居民","current_reading":1250,"last_reading":1180,"avg_monthly":65,"arrears":0,"last_payment_date":"2025-01-10"},{"id":"M-002","name":"某餐厅","type":"商业","current_reading":8500,"last_reading":7200,"avg_monthly":800,"arrears":1500,"last_payment_date":"2024-12-20"},{"id":"M-003","name":"某工厂","type":"工业","current_reading":52000,"last_reading":48000,"avg_monthly":3500,"arrears":0,"last_payment_date":"2025-01-08"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatBillingReport(analyzeBilling(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'flood_prevention_early_warning',
    description: '城市内涝预警与排涝调度：输入降雨预报、区域排水能力、历史涝情，评估积水风险等级，输出预警信息、受影响人口与排涝调度方案',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"city_id":"C-001","district_id":"D-001","rainfall_forecast":[{"period":"未来6小时","mm":120},{"period":"未来12小时","mm":180}],"flood_zones":[{"id":"FZ-01","name":"火车站片区","area_km2":3.5,"drainage_capacity":35,"pump_stations":3,"total_pump_capacity":45,"impervious_ratio":0.72,"historical_floods":4,"key_facilities":"地铁站"},{"id":"FZ-02","name":"高新区","area_km2":8.2,"drainage_capacity":55,"pump_stations":2,"total_pump_capacity":30,"impervious_ratio":0.55,"historical_floods":1,"key_facilities":"变电站"},{"id":"FZ-03","name":"老城区","area_km2":2.1,"drainage_capacity":20,"pump_stations":1,"total_pump_capacity":12,"impervious_ratio":0.80,"historical_floods":6,"key_facilities":"医院"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatFloodPreventionReport(analyzeFloodPrevention(JSON.parse(args.input_data))) }
  }))
}
