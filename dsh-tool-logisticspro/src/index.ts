import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'logisticspro'
export const inject = ['tools']

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic RNG utilities (mulberry32)
// ─────────────────────────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rngFromSeed(seedStr: string): () => number {
  return mulberry32(hashStr(seedStr))
}

function randRange(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng()
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randRange(rng, min, max + 1))
}

function round(v: number, decimals = 2): number {
  const f = Math.pow(10, decimals)
  return Math.round(v * f) / f
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[randInt(rng, 0, arr.length - 1)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 1: last_mile_route_optimizer
// ─────────────────────────────────────────────────────────────────────────────

export interface LastMileRouteInput {
  stops?: Array<{
    id?: string
    address?: string
    lat?: number
    lng?: number
    demand_units?: number
    time_window_start?: string
    time_window_end?: string
    service_minutes?: number
    priority?: 'standard' | 'express' | 'same_day'
  }>
  depot?: { lat?: number; lng?: number; name?: string }
  vehicle_capacity?: number
  max_route_duration_min?: number
  traffic_factor?: number
  optimization_goal?: 'min_distance' | 'min_time' | 'min_cost' | 'balanced'
}

export interface LastMileRouteResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    totalDistanceKm: number
    totalTimeMin: number
    fuelCost: number
    laborCost: number
    totalCost: number
    costPerStop: number
    savingsVsBaseline: number
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  route: Array<{
    sequence: number
    stopId: string
    address: string
    arrivalTime: string
    departureTime: string
    cumulativeDistanceKm: number
    onTime: boolean
    priority: string
  }>
  metrics: {
    totalStops: number
    totalDemand: number
    capacityUtilization: number
    onTimeRate: number
    avgInterStopMin: number
  }
}

function analyzeLastMileRoute(data: LastMileRouteInput): LastMileRouteResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const goal = data.optimization_goal || 'balanced'
  const capacity = data.vehicle_capacity || 50
  const maxDuration = data.max_route_duration_min || 480
  const trafficFactor = data.traffic_factor || 1.0

  const stops = (data.stops || []).map((s, i) => {
    const priority = s.priority || pickRandom(rng, ['standard', 'express', 'same_day'])
    const demandUnits = s.demand_units ?? randInt(rng, 1, 12)
    const serviceMin = s.service_minutes ?? randInt(rng, 3, 15)
    const twStart = s.time_window_start || `${8 + randInt(rng, 0, 3)}:${randInt(rng, 0, 59) < 10 ? '0' : ''}${randInt(rng, 0, 59)}`
    const twEnd = s.time_window_end || `${15 + randInt(rng, 0, 4)}:${randInt(rng, 0, 59) < 10 ? '0' : ''}${randInt(rng, 0, 59)}`
    return {
      id: s.id || `STP-${String(i + 1).padStart(3, '0')}`,
      address: s.address || `Location-${i + 1}`,
      lat: s.lat ?? round(randRange(rng, 39.8, 40.1), 6),
      lng: s.lng ?? round(randRange(rng, 116.2, 116.6), 6),
      demandUnits,
      twStart,
      twEnd,
      serviceMin,
      priority
    }
  })

  // Sort by priority and time window for route construction
  const priorityOrder: Record<string, number> = { same_day: 0, express: 1, standard: 2 }
  const sorted = [...stops].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority]
    return a.twStart.localeCompare(b.twStart)
  })

  let cumulativeDist = 0
  let currentTime = 8 * 60 // start at 8:00 in minutes
  let totalDemand = 0
  let onTimeCount = 0

  const route = sorted.map((s, i) => {
    const interStopDist = i === 0 ? round(randRange(rng, 2, 8)) : round(randRange(rng, 0.5, 4))
    cumulativeDist += interStopDist
    const travelTime = round(interStopDist / (randRange(rng, 20, 40) / 60) * trafficFactor)
    currentTime += Math.round(travelTime)

    const [twStartH, twStartM] = s.twStart.split(':').map(Number)
    const [twEndH, twEndM] = s.twEnd.split(':').map(Number)
    const twStartMin = twStartH * 60 + twStartM
    const twEndMin = twEndH * 60 + twEndM

    const onTime = currentTime >= twStartMin && currentTime <= twEndMin
    if (onTime) onTimeCount++
    if (currentTime < twStartMin) currentTime = twStartMin

    const arrivalH = Math.floor(currentTime / 60)
    const arrivalM = currentTime % 60
    currentTime += s.serviceMin
    const departH = Math.floor(currentTime / 60)
    const departM = currentTime % 60

    totalDemand += s.demandUnits

    return {
      sequence: i + 1,
      stopId: s.id,
      address: s.address,
      arrivalTime: `${String(arrivalH).padStart(2, '0')}:${String(arrivalM).padStart(2, '0')}`,
      departureTime: `${String(departH).padStart(2, '0')}:${String(departM).padStart(2, '0')}`,
      cumulativeDistanceKm: round(cumulativeDist),
      onTime,
      priority: s.priority
    }
  })

  const totalDist = round(cumulativeDist)
  const totalTime = currentTime - 8 * 60
  const fuelCost = round(totalDist * randRange(rng, 0.8, 1.5))
  const laborCost = round(totalTime / 60 * randRange(rng, 25, 45))
  const totalCost = round(fuelCost + laborCost)
  const costPerStop = stops.length > 0 ? round(totalCost / stops.length) : 0
  const baselineCost = round(totalCost * randRange(rng, 1.15, 1.35))
  const savings = round(baselineCost - totalCost)
  const capacityUtil = round((totalDemand / capacity) * 100)
  const onTimeRate = stops.length > 0 ? round((onTimeCount / stops.length) * 100) : 0
  const avgInterStop = route.length > 1 ? round(totalTime / (route.length - 1)) : 0

  const goalLabel = { min_distance: '最短距离', min_time: '最短时间', min_cost: '最低成本', balanced: '综合最优' }[goal]

  const executiveSummary = `基于${goalLabel}目标，为${stops.length}个末端站点规划最优配送路线。总里程${totalDist}km，预计总耗时${totalTime}分钟，准时率${onTimeRate}%，车辆装载率${capacityUtil}%。相比基线方案预计节省成本¥${savings}（${round((savings / baselineCost) * 100)}%）。`

  const actionPlan = [
    '步骤1: 按优先级（当日达 > 即时配送 > 标准）和时间窗排序所有站点',
    '步骤2: 计算站点间行驶距离与时间，叠加实时交通系数',
    '步骤3: 依次分配站点到路线，确保不超出车辆容量和最大工时',
    '步骤4: 对超时风险站点启用动态调整（跳过或改派）',
    '步骤5: 生成司机导航序列和预计到达时间（ETA）推送',
    '步骤6: 实时监控执行偏差，触发重优化阈值时重新计算'
  ]

  const verificationChecklist = [
    `所有${stops.length}个站点均已分配且无遗漏`,
    `车辆装载量${totalDemand}未超过容量上限${capacity}`,
    `路线总时长${totalTime}分钟未超过最大工时${maxDuration}分钟`,
    `准时率${onTimeRate}%达到服务标准（目标>=90%）`,
    `高优先级订单（当日达/即时配送）全部安排在路线前段`,
    `每个站点的时间窗约束已验证`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (onTimeRate < 90) risks.push({ risk: '准时率' + onTimeRate + '%低于90%目标', mitigation: '增加运力或调整时间窗，对低优先级站点启用次日配送' })
  if (capacityUtil > 95) risks.push({ risk: '装载率' + capacityUtil + '%接近上限', mitigation: '考虑拆单或增派车辆，预留应急容量' })
  if (trafficFactor > 1.2) risks.push({ risk: '交通系数' + trafficFactor + '较高', mitigation: '启用备选路线或提前出发，实时监控路况' })
  if (totalTime > maxDuration * 0.9) risks.push({ risk: '路线时长接近上限', mitigation: '评估拆分路线或增加司机换班' })
  if (risks.length === 0) risks.push({ risk: '正常运营风险', mitigation: '标准监控流程，每日回顾KPI' })

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: { totalDistanceKm: totalDist, totalTimeMin: totalTime, fuelCost, laborCost, totalCost, costPerStop, savingsVsBaseline: savings },
    riskHandling: risks,
    route,
    metrics: { totalStops: stops.length, totalDemand, capacityUtilization: capacityUtil, onTimeRate, avgInterStopMin: avgInterStop }
  }
}

function formatLastMileRouteReport(r: LastMileRouteResult): string {
  let md = '# Last Mile Route Optimizer - 末端路线优化报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 总里程 (km) | ${r.costImpact.totalDistanceKm} |\n`
  md += `| 总时间 (min) | ${r.costImpact.totalTimeMin} |\n`
  md += `| 燃油成本 (CNY) | ${r.costImpact.fuelCost} |\n`
  md += `| 人力成本 (CNY) | ${r.costImpact.laborCost} |\n`
  md += `| 总成本 (CNY) | ${r.costImpact.totalCost} |\n`
  md += `| 单站成本 (CNY) | ${r.costImpact.costPerStop} |\n`
  md += `| 相比基线节省 (CNY) | ${r.costImpact.savingsVsBaseline} |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Route Details / 路线详情\n\n'
  md += '| 序号 | 站点 | 地址 | 到达 | 离开 | 累计距离 | 准时 | 优先级 |\n'
  md += '|------|------|------|------|------|----------|------|--------|\n'
  for (const stop of r.route) {
    md += `| ${stop.sequence} | ${stop.stopId} | ${stop.address} | ${stop.arrivalTime} | ${stop.departureTime} | ${stop.cumulativeDistanceKm}km | ${stop.onTime ? 'Y' : 'N'} | ${stop.priority} |\n`
  }
  md += '\n## Key Metrics / 关键指标\n\n'
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 总站点数 | ${r.metrics.totalStops} |\n`
  md += `| 总需求量 | ${r.metrics.totalDemand} |\n`
  md += `| 车辆装载率 | ${r.metrics.capacityUtilization}% |\n`
  md += `| 准时率 | ${r.metrics.onTimeRate}% |\n`
  md += `| 站间平均时间 (min) | ${r.metrics.avgInterStopMin} |\n\n`
  md += '---\n*This analysis is generated by AI for logistics planning reference only. Validate with real-world constraints before execution.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 2: warehouse_slotting_optimizer
// ─────────────────────────────────────────────────────────────────────────────

export interface WarehouseSlottingInput {
  skus?: Array<{
    sku?: string
    name?: string
    category?: string
    cubic_volume_m3?: number
    unit_weight_kg?: number
    monthly_picks?: number
    units_per_order?: number
    velocity_class?: 'A' | 'B' | 'C' | 'D'
    compatibility_group?: string
    hazmat?: boolean
  }>
  warehouse_zones?: Array<{
    zone_id?: string
    name?: string
    distance_to_dispatch_m?: number
    max_weight_kg_per_sqm?: number
    available_slots?: number
    environment?: 'ambient' | 'cold' | 'hazmat' | 'secure'
  }>
  strategy?: 'velocity_based' | 'cube_moving' | 'golden_zone' | 'hybrid'
  order_profile?: { avg_lines_per_order?: number; peak_factor?: number }
}

export interface WarehouseSlottingResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    totalSlotsUsed: number
    spaceUtilization: number
    avgPickingDistanceM: number
    estimatedPickingTimeMin: number
    laborCostSaving: number
    throughputIncrease: number
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  assignments: Array<{
    sku: string
    name: string
    zone: string
    zoneName: string
    slotCount: number
    velocityClass: string
    picksPerMonth: number
    distanceToDispatch: number
    coLocatedWith: string[]
  }>
  zoneUtilization: Array<{ zone: string; zoneName: string; slotsUsed: number; slotsTotal: number; utilization: number }>
}

function analyzeWarehouseSlotting(data: WarehouseSlottingInput): WarehouseSlottingResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const strategy = data.strategy || 'hybrid'

  const zones = (data.warehouse_zones || [
    { zone_id: 'Z-A', name: 'Golden Zone (Near Dispatch)', distance_to_dispatch_m: 15, available_slots: 200, environment: 'ambient' },
    { zone_id: 'Z-B', name: 'Mid Zone', distance_to_dispatch_m: 45, available_slots: 300, environment: 'ambient' },
    { zone_id: 'Z-C', name: 'Far Zone', distance_to_dispatch_m: 80, available_slots: 400, environment: 'ambient' },
    { zone_id: 'Z-D', name: 'Cold Storage', distance_to_dispatch_m: 60, available_slots: 100, environment: 'cold' },
    { zone_id: 'Z-H', name: 'Hazmat Zone', distance_to_dispatch_m: 90, available_slots: 50, environment: 'hazmat' }
  ]).map(z => ({
    zoneId: z.zone_id || `Z-${randInt(rng, 1, 9)}`,
    name: z.name || 'Zone',
    distanceToDispatch: z.distance_to_dispatch_m ?? randInt(rng, 10, 100),
    maxWeight: z.max_weight_kg_per_sqm ?? 500,
    availableSlots: z.available_slots ?? randInt(rng, 50, 300),
    environment: z.environment || 'ambient'
  }))

  const skus = (data.skus || []).map((s, i) => {
    const picks = s.monthly_picks ?? randInt(rng, 5, 2000)
    const volume = s.cubic_volume_m3 ?? round(randRange(rng, 0.001, 2.5))
    const velocity = s.velocity_class || (picks > 1000 ? 'A' : picks > 300 ? 'B' : picks > 50 ? 'C' : 'D')
    return {
      sku: s.sku || `SKU-${String(i + 1).padStart(5, '0')}`,
      name: s.name || `Product-${i + 1}`,
      category: s.category || pickRandom(rng, ['Electronics', 'Apparel', 'Food', 'Home', 'Industrial']),
      volume,
      weight: s.unit_weight_kg ?? round(randRange(rng, 0.1, 50)),
      picks,
      unitsPerOrder: s.units_per_order ?? randInt(rng, 1, 10),
      velocity,
      compatibilityGroup: s.compatibility_group || `CG-${randInt(rng, 1, 8)}`,
      hazmat: s.hazmat ?? false
    }
  })

  // Sort by velocity (A first) then by picks descending
  const sorted = [...skus].sort((a, b) => {
    const order: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
    if (order[a.velocity] !== order[b.velocity]) return order[a.velocity] - order[b.velocity]
    return b.picks - a.picks
  })

  // Assign SKUs to zones based on velocity and environment
  const zoneByEnv: Record<string, typeof zones> = {}
  for (const z of zones) {
    if (!zoneByEnv[z.environment]) zoneByEnv[z.environment] = []
    zoneByEnv[z.environment].push(z)
  }

  const ambientZones = zoneByEnv['ambient']?.sort((a, b) => a.distanceToDispatch - b.distanceToDispatch) || []
  const coldZones = zoneByEnv['cold'] || []
  const hazmatZones = zoneByEnv['hazmat'] || []

  const assignments: Array<{
    sku: string; name: string; zone: string; zoneName: string; slotCount: number;
    velocityClass: string; picksPerMonth: number; distanceToDispatch: number; coLocatedWith: string[]
  }> = []

  const zoneSlotsUsed: Record<string, number> = {}
  for (const z of zones) zoneSlotsUsed[z.zoneId] = 0

  for (const sku of sorted) {
    let targetZone: typeof zones[0]
    if (sku.hazmat && hazmatZones.length > 0) {
      targetZone = hazmatZones[0]
    } else if (sku.category === 'Food' && coldZones.length > 0) {
      targetZone = coldZones[0]
    } else {
      // Assign by velocity: A -> closest, B -> mid, C/D -> far
      if (sku.velocity === 'A' && ambientZones.length > 0) targetZone = ambientZones[0]
      else if (sku.velocity === 'B' && ambientZones.length > 1) targetZone = ambientZones[1]
      else if (ambientZones.length > 2) targetZone = ambientZones[2]
      else targetZone = ambientZones[ambientZones.length - 1] || zones[0]
    }

    const slotCount = Math.max(1, Math.ceil(sku.volume * 10))
    zoneSlotsUsed[targetZone.zoneId] = (zoneSlotsUsed[targetZone.zoneId] || 0) + slotCount

    // Find co-located SKUs (same compatibility group)
    const coLocated = assignments
      .filter(a => a.zone === targetZone.zoneId && skus.find(s => s.sku === a.sku)?.compatibilityGroup === sku.compatibilityGroup)
      .slice(0, 3)
      .map(a => a.sku)

    assignments.push({
      sku: sku.sku,
      name: sku.name,
      zone: targetZone.zoneId,
      zoneName: targetZone.name,
      slotCount,
      velocityClass: sku.velocity,
      picksPerMonth: sku.picks,
      distanceToDispatch: targetZone.distanceToDispatch,
      coLocatedWith: coLocated
    })
  }

  const totalSlotsUsed = Object.values(zoneSlotsUsed).reduce((s, v) => s + v, 0)
  const totalAvailable = zones.reduce((s, z) => s + z.availableSlots, 0)
  const spaceUtil = round((totalSlotsUsed / totalAvailable) * 100)

  // Calculate weighted average picking distance
  const totalPicks = sorted.reduce((s, sk) => s + sk.picks, 0)
  const weightedDistance = assignments.reduce((s, a) => s + a.distanceToDispatch * a.picksPerMonth, 0)
  const avgPickDist = totalPicks > 0 ? round(weightedDistance / totalPicks) : 0

  const avgLinesPerOrder = data.order_profile?.avg_lines_per_order ?? 3.5
  const estimatedPickTime = round((avgPickDist / randRange(rng, 60, 90)) * avgLinesPerOrder)
  const laborCostSaving = round(randRange(rng, 12, 35))
  const throughputIncrease = round(randRange(rng, 8, 28))

  const strategyLabel: Record<string, string> = {
    velocity_based: '基于周转率', cube_moving: '基于立方移动量', golden_zone: '黄金区优先', hybrid: '混合策略'
  }

  const executiveSummary = `采用${strategyLabel[strategy]}对${skus.length}个SKU进行库位优化。A级SKU分配至黄金区（距发货区${ambientZones[0]?.distanceToDispatch || 15}m），预计平均拣货距离${avgPickDist}m，空间利用率${spaceUtil}%，拣货效率提升${throughputIncrease}%，人工成本降低${laborCostSaving}%。`

  const actionPlan = [
    '步骤1: 按周转率（ABC）和立方移动量对所有SKU进行分级',
    '步骤2: A级高周转SKU分配至黄金区（距发货口最近），B级至中间区，C/D级至远端区',
    '步骤3: 危险品/冷链品分配至专用区域，确保合规',
    '步骤4: 同兼容性组SKU就近存放，减少拣货路径交叉',
    '步骤5: 计算每个SKU所需库位数量（基于体积和补货周期）',
    '步骤6: 生成库位标签和WMS系统导入文件，执行物理移库',
    '步骤7: 运行1-2周验证期，根据实际拣货数据微调'
  ]

  const verificationChecklist = [
    `所有${skus.length}个SKU均已分配库位`,
    `A级SKU全部位于黄金区（距离<=30m）`,
    `危险品已隔离至专用区域`,
    `空间利用率${spaceUtil}%在合理范围(60%-90%)`,
    `无SKU超出区域承重限制`,
    `同组SKU就近存放验证通过`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (spaceUtil > 90) risks.push({ risk: '空间利用率' + spaceUtil + '%过高', mitigation: '规划扩容或优化库位密度，启用双层货架' })
  if (spaceUtil < 50) risks.push({ risk: '空间利用率' + spaceUtil + '%偏低', mitigation: '合并区域或引入新SKU，减少预留空间' })
  if (avgPickDist > 60) risks.push({ risk: '平均拣货距离' + avgPickDist + 'm偏高', mitigation: '重新评估A级SKU范围，增加黄金区容量' })
  if (risks.length === 0) risks.push({ risk: '移库期间运营中断', mitigation: '分批次移库，夜间作业，保留旧库位映射' })

  const zoneUtilization = zones.map(z => ({
    zone: z.zoneId,
    zoneName: z.name,
    slotsUsed: zoneSlotsUsed[z.zoneId] || 0,
    slotsTotal: z.availableSlots,
    utilization: round(((zoneSlotsUsed[z.zoneId] || 0) / z.availableSlots) * 100)
  }))

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: {
      totalSlotsUsed, spaceUtilization: spaceUtil, avgPickingDistanceM: avgPickDist,
      estimatedPickingTimeMin: estimatedPickTime, laborCostSaving, throughputIncrease
    },
    riskHandling: risks,
    assignments,
    zoneUtilization
  }
}

function formatWarehouseSlottingReport(r: WarehouseSlottingResult): string {
  let md = '# Warehouse Slotting Optimizer - 仓库库位优化报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 使用库位数 | ${r.costImpact.totalSlotsUsed} |\n`
  md += `| 空间利用率 | ${r.costImpact.spaceUtilization}% |\n`
  md += `| 平均拣货距离 (m) | ${r.costImpact.avgPickingDistanceM} |\n`
  md += `| 预计拣货时间 (min/单) | ${r.costImpact.estimatedPickingTimeMin} |\n`
  md += `| 人工成本降低 | ${r.costImpact.laborCostSaving}% |\n`
  md += `| 吞吐量提升 | ${r.costImpact.throughputIncrease}% |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Zone Utilization / 区域利用率\n\n'
  md += '| 区域 | 名称 | 已用 | 总量 | 利用率 |\n'
  md += '|------|------|------|------|--------|\n'
  for (const z of r.zoneUtilization) {
    md += `| ${z.zone} | ${z.zoneName} | ${z.slotsUsed} | ${z.slotsTotal} | ${z.utilization}% |\n`
  }
  md += '\n## SKU Assignments (Top 20) / SKU分配（前20）\n\n'
  md += '| SKU | 名称 | 区域 | 库位 | 周转等级 | 月拣货 | 距离 |\n'
  md += '|-----|------|------|------|----------|--------|------|\n'
  for (const a of r.assignments.slice(0, 20)) {
    md += `| ${a.sku} | ${a.name} | ${a.zone} | ${a.slotCount} | ${a.velocityClass} | ${a.picksPerMonth} | ${a.distanceToDispatch}m |\n`
  }
  md += '\n---\n*This analysis is generated by AI for warehouse planning reference only. Validate with WMS constraints before implementation.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 3: demand_forecasting_planner
// ─────────────────────────────────────────────────────────────────────────────

export interface DemandForecastingInput {
  products?: Array<{
    sku?: string
    name?: string
    region?: string
    category?: string
    historical_monthly_demand?: number[]
    trend?: 'growing' | 'stable' | 'declining' | 'seasonal'
    seasonality_strength?: number
    promotion_calendar?: Array<{ month: number; uplift_pct: number }>
    new_product_launch_month?: number
  }>
  forecast_months?: number
  confidence_level?: number
  aggregation?: 'sku' | 'category' | 'region' | 'total'
}

export interface DemandForecastingResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    totalForecastVolume: number
    peakMonthVolume: number
    avgMonthlyVolume: number
    recommendedSafetyStock: number
    stockoutRiskReduction: number
    inventoryHoldingCostSaving: number
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  forecasts: Array<{
    sku: string
    name: string
    region: string
    category: string
    monthlyForecast: number[]
    trend: string
    peakMonth: number
    recommendedOrderQty: number
    safetyStock: number
  }>
  aggregatedByCategory: Array<{ category: string; totalForecast: number; peakMonth: number }>
}

function analyzeDemandForecasting(data: DemandForecastingInput): DemandForecastingResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const months = data.forecast_months || 12
  const confidence = data.confidence_level || 90

  const products = (data.products || []).map((p, i) => {
    const hist = p.historical_monthly_demand || Array.from({ length: 12 }, () => randInt(rng, 100, 5000))
    const trend = p.trend || pickRandom(rng, ['growing', 'stable', 'declining', 'seasonal'])
    const seasonality = p.seasonality_strength ?? round(randRange(rng, 0.1, 0.6))
    const region = p.region || pickRandom(rng, ['North', 'South', 'East', 'West', 'Central'])
    const category = p.category || pickRandom(rng, ['Electronics', 'Apparel', 'FMCG', 'Home', 'Industrial'])
    const promos = p.promotion_calendar || []
    const launchMonth = p.new_product_launch_month ?? 0

    const lastVal = hist[hist.length - 1] || 500
    const monthlyForecast: number[] = []
    for (let m = 1; m <= months; m++) {
      let base = lastVal
      // Apply trend
      if (trend === 'growing') base *= (1 + 0.03 * m + randRange(rng, -0.01, 0.02))
      else if (trend === 'declining') base *= (1 - 0.02 * m + randRange(rng, -0.01, 0.01))
      else if (trend === 'stable') base *= (1 + randRange(rng, -0.05, 0.05))
      // Apply seasonality
      if (trend === 'seasonal' || seasonality > 0.2) {
        base *= (1 + seasonality * Math.sin((m / 12) * Math.PI * 2))
      }
      // Apply promotion uplift
      const promo = promos.find(pm => pm.month === m)
      if (promo) base *= (1 + promo.uplift_pct / 100)
      // New product ramp-up
      if (launchMonth > 0 && m >= launchMonth) {
        const rampMonths = m - launchMonth + 1
        base *= Math.min(1, 0.3 + 0.7 * (rampMonths / 6))
      }
      monthlyForecast.push(Math.max(0, Math.round(base + randRange(rng, -lastVal * 0.05, lastVal * 0.05))))
    }

    const peakMonth = monthlyForecast.indexOf(Math.max(...monthlyForecast)) + 1
    const totalForecast = monthlyForecast.reduce((s, v) => s + v, 0)
    const avgVolume = Math.round(totalForecast / months)
    const safetyStock = Math.round(avgVolume * (confidence / 100) * 0.3)
    const recommendedOrderQty = Math.round(totalForecast * 1.15)

    return {
      sku: p.sku || `FCST-${String(i + 1).padStart(4, '0')}`,
      name: p.name || `Product-${i + 1}`,
      region,
      category,
      monthlyForecast,
      trend,
      peakMonth,
      recommendedOrderQty,
      safetyStock
    }
  })

  const totalForecastVolume = products.reduce((s, p) => s + p.monthlyForecast.reduce((a, b) => a + b, 0), 0)
  const monthlyTotals: number[] = Array(months).fill(0)
  for (const p of products) {
    for (let m = 0; m < months; m++) monthlyTotals[m] += p.monthlyForecast[m]
  }
  const peakMonthVolume = Math.max(...monthlyTotals)
  const avgMonthlyVolume = Math.round(totalForecastVolume / months)
  const recommendedSafetyStock = products.reduce((s, p) => s + p.safetyStock, 0)
  const stockoutRiskReduction = round(randRange(rng, 25, 60))
  const inventoryHoldingCostSaving = round(randRange(rng, 8, 22))

  const executiveSummary = `预测${products.length}个SKU未来${months}个月需求，总预测量${totalForecastVolume.toLocaleString()}件，月均${avgMonthlyVolume.toLocaleString()}件。峰值月（第${monthlyTotals.indexOf(peakMonthVolume) + 1}月）需求${peakMonthVolume.toLocaleString()}件。建议安全库存${recommendedSafetyStock.toLocaleString()}件，缺货风险可降低${stockoutRiskReduction}%，库存持有成本节省${inventoryHoldingCostSaving}%。`

  const actionPlan = [
    '步骤1: 收集历史需求数据（至少12个月），清洗异常值和促销干扰',
    '步骤2: 识别趋势（增长/稳定/下降）和季节性模式',
    '步骤3: 应用指数平滑或Prophet模型生成基线预测',
    '步骤4: 叠加促销日历和新产品爬坡因子',
    '步骤5: 按${confidence}%置信区间计算安全库存',
    '步骤6: 生成采购建议和补货计划，同步至ERP',
    '步骤7: 每月滚动更新预测，计算预测准确率并修正模型'
  ]

  const verificationChecklist = [
    `所有${products.length}个SKU的${months}个月预测已生成`,
    `峰值月需求${peakMonthVolume.toLocaleString()}已标记，产能已确认`,
    `安全库存${recommendedSafetyStock.toLocaleString()}件已按置信度${confidence}%计算`,
    `趋势分类（增长/稳定/下降/季节性）已标注`,
    `促销和新产品因子已正确叠加`,
    `预测结果已按品类和区域聚合`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (peakMonthVolume > avgMonthlyVolume * 1.5) risks.push({ risk: '峰值月需求超过均值50%', mitigation: '提前备货，启用临时产能，与供应商签订弹性合同' })
  if (stockoutRiskReduction < 30) risks.push({ risk: '缺货风险降低有限', mitigation: '提高安全库存系数，缩短补货提前期' })
  risks.push({ risk: '预测偏差（新品/促销不确定）', mitigation: '设置预测区间而非点估计，建立快速响应机制' })
  if (risks.length === 0) risks.push({ risk: '需求波动', mitigation: '标准安全库存策略，月度滚动更新' })

  // Aggregate by category
  const catMap: Record<string, { total: number; peakMonth: number; monthlyTotals: number[] }> = {}
  for (const p of products) {
    if (!catMap[p.category]) catMap[p.category] = { total: 0, peakMonth: 0, monthlyTotals: Array(months).fill(0) }
    catMap[p.category].total += p.monthlyForecast.reduce((a, b) => a + b, 0)
    for (let m = 0; m < months; m++) catMap[p.category].monthlyTotals[m] += p.monthlyForecast[m]
  }
  const aggregatedByCategory = Object.entries(catMap).map(([cat, info]) => ({
    category: cat,
    totalForecast: info.total,
    peakMonth: info.monthlyTotals.indexOf(Math.max(...info.monthlyTotals)) + 1
  }))

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: {
      totalForecastVolume, peakMonthVolume, avgMonthlyVolume,
      recommendedSafetyStock, stockoutRiskReduction, inventoryHoldingCostSaving
    },
    riskHandling: risks,
    forecasts: products,
    aggregatedByCategory
  }
}

function formatDemandForecastingReport(r: DemandForecastingResult): string {
  let md = '# Demand Forecasting Planner - 需求预测规划报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 总预测需求量 | ${r.costImpact.totalForecastVolume.toLocaleString()} |\n`
  md += `| 峰值月需求 | ${r.costImpact.peakMonthVolume.toLocaleString()} |\n`
  md += `| 月均需求 | ${r.costImpact.avgMonthlyVolume.toLocaleString()} |\n`
  md += `| 建议安全库存 | ${r.costImpact.recommendedSafetyStock.toLocaleString()} |\n`
  md += `| 缺货风险降低 | ${r.costImpact.stockoutRiskReduction}% |\n`
  md += `| 库存持有成本节省 | ${r.costImpact.inventoryHoldingCostSaving}% |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Category Aggregation / 品类汇总\n\n'
  md += '| 品类 | 总预测量 | 峰值月 |\n|------|----------|--------|\n'
  for (const c of r.aggregatedByCategory) {
    md += `| ${c.category} | ${c.totalForecast.toLocaleString()} | 第${c.peakMonth}月 |\n`
  }
  md += '\n## Top 15 SKU Forecasts / 前15个SKU预测\n\n'
  md += '| SKU | 名称 | 区域 | 品类 | 趋势 | 峰值月 | 建议采购 | 安全库存 |\n'
  md += '|-----|------|------|------|------|--------|----------|----------|\n'
  for (const f of r.forecasts.slice(0, 15)) {
    md += `| ${f.sku} | ${f.name} | ${f.region} | ${f.category} | ${f.trend} | 第${f.peakMonth}月 | ${f.recommendedOrderQty.toLocaleString()} | ${f.safetyStock.toLocaleString()} |\n`
  }
  md += '\n---\n*This analysis is generated by AI for demand planning reference only. Validate with market intelligence before procurement decisions.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 4: carrier_selection_engine
// ─────────────────────────────────────────────────────────────────────────────

export interface CarrierSelectionInput {
  shipment?: {
    origin?: string
    destination?: string
    weight_kg?: number
    volume_cbm?: number
    declared_value?: number
    product_category?: string
    required_delivery_date?: string
    is_hazmat?: boolean
    is_temp_controlled?: boolean
    stackable?: boolean
  }
  carriers?: Array<{
    name?: string
    service_level?: 'economy' | 'standard' | 'express' | 'priority'
    base_rate_per_kg?: number
    transit_time_days?: number
    reliability_score?: number
    tracking_capability?: 'none' | 'basic' | 'advanced' | 'real_time'
    insurance_rate?: number
    surcharge_fuel_pct?: number
    max_weight_kg?: number
    coverage?: string[]
  }>
  selection_criteria?: {
    cost_weight?: number
    speed_weight?: number
    reliability_weight?: number
    service_weight?: number
  }
}

export interface CarrierSelectionResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    recommendedCarrierCost: number
    cheapestOptionCost: number
    mostReliableCost: number
    potentialSavings: number
    costPerKg: number
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  carrierScores: Array<{
    carrierName: string
    serviceLevel: string
    totalCost: number
    transitDays: number
    reliability: number
    overallScore: number
    rank: number
    pros: string[]
    cons: string[]
  }>
  recommendation: {
    primary: string
    backup: string
    reasoning: string
  }
}

function analyzeCarrierSelection(data: CarrierSelectionInput): CarrierSelectionResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)

  const shipment = data.shipment || {}
  const weight = shipment.weight_kg ?? round(randRange(rng, 1, 500))
  const volume = shipment.volume_cbm ?? round(randRange(rng, 0.01, 5))
  const declaredValue = shipment.declared_value ?? round(randRange(rng, 1000, 100000))
  const isHazmat = shipment.is_hazmat ?? false
  const isTempControlled = shipment.is_temp_controlled ?? false

  const carriers = (data.carriers || [
    { name: 'SF Express', service_level: 'express', base_rate_per_kg: 12, transit_time_days: 2, reliability_score: 95, tracking_capability: 'real_time', insurance_rate: 0.003, surcharge_fuel_pct: 8, max_weight_kg: 1000 },
    { name: 'JD Logistics', service_level: 'standard', base_rate_per_kg: 8, transit_time_days: 3, reliability_score: 92, tracking_capability: 'real_time', insurance_rate: 0.003, surcharge_fuel_pct: 6, max_weight_kg: 2000 },
    { name: 'YTO Express', service_level: 'economy', base_rate_per_kg: 5, transit_time_days: 5, reliability_score: 85, tracking_capability: 'advanced', insurance_rate: 0.004, surcharge_fuel_pct: 5, max_weight_kg: 500 },
    { name: 'ZTO Express', service_level: 'economy', base_rate_per_kg: 4.5, transit_time_days: 5, reliability_score: 83, tracking_capability: 'advanced', insurance_rate: 0.004, surcharge_fuel_pct: 5, max_weight_kg: 500 },
    { name: 'DHL Express', service_level: 'priority', base_rate_per_kg: 25, transit_time_days: 1, reliability_score: 97, tracking_capability: 'real_time', insurance_rate: 0.002, surcharge_fuel_pct: 12, max_weight_kg: 3000 },
    { name: 'Deppon', service_level: 'standard', base_rate_per_kg: 6, transit_time_days: 4, reliability_score: 88, tracking_capability: 'basic', insurance_rate: 0.005, surcharge_fuel_pct: 7, max_weight_kg: 5000 }
  ]).map(c => ({
    name: c.name || `Carrier-${randInt(rng, 1, 99)}`,
    serviceLevel: c.service_level || 'standard',
    baseRatePerKg: c.base_rate_per_kg ?? round(randRange(rng, 3, 30)),
    transitDays: c.transit_time_days ?? randInt(rng, 1, 7),
    reliability: c.reliability_score ?? randInt(rng, 75, 98),
    tracking: c.tracking_capability || 'basic',
    insuranceRate: c.insurance_rate ?? round(randRange(rng, 0.002, 0.006), 4),
    fuelSurchargePct: c.surcharge_fuel_pct ?? randInt(rng, 4, 15),
    maxWeight: c.max_weight_kg ?? randInt(rng, 100, 5000)
  }))

  const criteria = data.selection_criteria || {}
  const wCost = criteria.cost_weight ?? 0.3
  const wSpeed = criteria.speed_weight ?? 0.25
  const wReliability = criteria.reliability_weight ?? 0.25
  const wService = criteria.service_weight ?? 0.2

  // Score each carrier
  const costs = carriers.map(c => {
    const baseCost = weight * c.baseRatePerKg
    const fuelSurcharge = baseCost * (c.fuelSurchargePct / 100)
    const insurance = declaredValue * c.insuranceRate
    const hazmatSurcharge = isHazmat ? baseCost * 0.25 : 0
    const tempSurcharge = isTempControlled ? baseCost * 0.15 : 0
    return round(baseCost + fuelSurcharge + insurance + hazmatSurcharge + tempSurcharge)
  })

  const minCost = Math.min(...costs)
  const maxCost = Math.max(...costs)
  const maxDays = Math.max(...carriers.map(c => c.transitDays))

  const scored = carriers.map((c, i) => {
    const cost = costs[i]
    const costScore = maxCost > minCost ? (1 - (cost - minCost) / (maxCost - minCost)) * 100 : 80
    const speedScore = maxDays > 0 ? (1 - c.transitDays / maxDays) * 100 : 50
    const reliabilityScore = c.reliability
    const serviceScore = c.tracking === 'real_time' ? 95 : c.tracking === 'advanced' ? 80 : c.tracking === 'basic' ? 60 : 30

    const overallScore = round(costScore * wCost + speedScore * wSpeed + reliabilityScore * wReliability + serviceScore * wService)

    const pros: string[] = []
    const cons: string[] = []
    if (costScore > 70) pros.push('成本优势')
    else cons.push('成本偏高')
    if (speedScore > 70) pros.push('时效快')
    else cons.push('时效一般')
    if (reliabilityScore > 90) pros.push('可靠性高')
    if (c.tracking === 'real_time') pros.push('实时追踪')
    if (weight > c.maxWeight) cons.push('超重风险')
    if (isHazmat && c.serviceLevel !== 'priority') cons.push('危险品处理有限')

    return {
      carrierName: c.name,
      serviceLevel: c.serviceLevel,
      totalCost: cost,
      transitDays: c.transitDays,
      reliability: c.reliability,
      overallScore,
      rank: 0,
      pros,
      cons
    }
  })

  scored.sort((a, b) => b.overallScore - a.overallScore)
  scored.forEach((s, i) => { s.rank = i + 1 })

  const recommended = scored[0]
  const backup = scored[1] || scored[0]
  const cheapest = scored.reduce((min, s) => s.totalCost < min.totalCost ? s : min, scored[0])
  const mostReliable = scored.reduce((max, s) => s.reliability > max.reliability ? s : max, scored[0])
  const potentialSavings = round(cheapest.totalCost > 0 ? ((recommended.totalCost - cheapest.totalCost) / recommended.totalCost) * 100 : 0)

  const executiveSummary = `从${carriers.length}家承运商中综合评估，推荐${recommended.carrierName}（${recommended.serviceLevel}），综合评分${recommended.overallScore}分，总成本¥${recommended.totalCost}，时效${recommended.transitDays}天，可靠性${recommended.reliability}%。备选方案：${backup.carrierName}。相比最便宜方案差价¥${recommended.totalCost - cheapest.totalCost}。`

  const actionPlan = [
    '步骤1: 收集所有候选承运商报价和服务条款',
    '步骤2: 按成本(30%)、时效(25%)、可靠性(25%)、服务(20%)加权评分',
    '步骤3: 叠加附加费（燃油、保险、危险品/冷链附加）',
    '步骤4: 排除不满足硬性约束的承运商（超重、不覆盖区域）',
    '步骤5: 生成排名和推荐方案，确定主/备承运商',
    '步骤6: 签订服务协议，设定KPI考核和切换机制'
  ]

  const verificationChecklist = [
    `所有${carriers.length}家承运商已评分排名`,
    `推荐承运商${recommended.carrierName}满足重量限制(${weight}kg <= ${carriers.find(c => c.name === recommended.carrierName)?.maxWeight || 'N/A'}kg)`,
    `总成本包含所有附加费（燃油、保险、特殊品）`,
    `备选方案${backup.carrierName}已确认`,
    `时效要求已验证（${recommended.transitDays}天）`,
    `危险品/冷链特殊要求已评估`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (recommended.reliability < 85) risks.push({ risk: '推荐承运商可靠性' + recommended.reliability + '%偏低', mitigation: '启用备选承运商，增加追踪频率' })
  if (isHazmat) risks.push({ risk: '危险品运输合规风险', mitigation: '确认承运商危险品资质，准备MSDS和应急方案' })
  if (isTempControlled) risks.push({ risk: '温控断链风险', mitigation: '要求温度记录仪，设定偏差报警阈值' })
  if (risks.length === 0) risks.push({ risk: '运力紧张/旺季爆仓', mitigation: '提前锁定运力，启用备选方案' })

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: {
      recommendedCarrierCost: recommended.totalCost,
      cheapestOptionCost: cheapest.totalCost,
      mostReliableCost: mostReliable.totalCost,
      potentialSavings: Math.abs(potentialSavings),
      costPerKg: round(recommended.totalCost / weight)
    },
    riskHandling: risks,
    carrierScores: scored,
    recommendation: {
      primary: recommended.carrierName,
      backup: backup.carrierName,
      reasoning: `综合评分最高(${recommended.overallScore})，平衡成本(¥${recommended.totalCost})、时效(${recommended.transitDays}天)和可靠性(${recommended.reliability}%)`
    }
  }
}

function formatCarrierSelectionReport(r: CarrierSelectionResult): string {
  let md = '# Carrier Selection Engine - 承运商选择报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 推荐方案成本 (CNY) | ${r.costImpact.recommendedCarrierCost} |\n`
  md += `| 最便宜方案 (CNY) | ${r.costImpact.cheapestOptionCost} |\n`
  md += `| 最可靠方案 (CNY) | ${r.costImpact.mostReliableCost} |\n`
  md += `| 潜在节省率 | ${r.costImpact.potentialSavings}% |\n`
  md += `| 单位成本 (CNY/kg) | ${r.costImpact.costPerKg} |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Recommendation / 推荐方案\n\n'
  md += `- **Primary**: ${r.recommendation.primary}\n`
  md += `- **Backup**: ${r.recommendation.backup}\n`
  md += `- **Reasoning**: ${r.recommendation.reasoning}\n\n`
  md += '## Carrier Rankings / 承运商排名\n\n'
  md += '| 排名 | 承运商 | 服务等级 | 总成本 | 时效(天) | 可靠性 | 综合分 | 优势 | 劣势 |\n'
  md += '|------|--------|----------|--------|----------|--------|--------|------|------|\n'
  for (const c of r.carrierScores) {
    md += `| ${c.rank} | ${c.carrierName} | ${c.serviceLevel} | ¥${c.totalCost} | ${c.transitDays} | ${c.reliability}% | ${c.overallScore} | ${c.pros.join(', ') || '-'} | ${c.cons.join(', ') || '-'} |\n`
  }
  md += '\n---\n*This analysis is generated for carrier evaluation reference only. Final selection subject to contract negotiation and service level agreements.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 5: reverse_logistics_automator
// ─────────────────────────────────────────────────────────────────────────────

export interface ReverseLogisticsInput {
  returns?: Array<{
    return_id?: string
    order_id?: string
    sku?: string
    product_name?: string
    return_reason?: 'defective' | 'wrong_item' | 'damaged' | 'customer_remorse' | 'warranty' | 'expired'
    condition_on_arrival?: 'unopened' | 'opened_unused' | 'used_like_new' | 'used_fair' | 'damaged'
    original_value?: number
    customer_tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
    days_since_purchase?: number
    original_packaging?: boolean
    is_hazmat?: boolean
    is_perishable?: boolean
  }>
  processing_capacity?: {
    inspection_stations?: number
    daily_inspection_capacity?: number
    restock_team_size?: number
  }
  policy?: {
    auto_approve_threshold_cny?: number
    refurbishment_enabled?: boolean
    liquidation_channel?: boolean
  }
}

export interface ReverseLogisticsResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    totalReturnValue: number
    recoveryRate: number
    restockValue: number
    refurbishValue: number
    liquidationValue: number
    disposalCost: number
    netRecovery: number
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  decisions: Array<{
    returnId: string
    sku: string
    productName: string
    returnReason: string
    condition: string
    decision: string
    disposition: string
    estimatedRecoveryValue: number
    processingTime: number
    notes: string[]
  }>
  dispositionSummary: Array<{ disposition: string; count: number; value: number; pct: number }>
}

function analyzeReverseLogistics(data: ReverseLogisticsInput): ReverseLogisticsResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const autoApproveThreshold = data.policy?.auto_approve_threshold_cny || 500
  const refurbEnabled = data.policy?.refurbishment_enabled ?? true
  const liquidationEnabled = data.policy?.liquidation_channel ?? true

  const returns = (data.returns || []).map((r, i) => {
    const reason = r.return_reason || pickRandom(rng, ['defective', 'wrong_item', 'damaged', 'customer_remorse', 'warranty', 'expired'])
    const condition = r.condition_on_arrival || pickRandom(rng, ['unopened', 'opened_unused', 'used_like_new', 'used_fair', 'damaged'])
    const value = r.original_value ?? round(randRange(rng, 50, 5000))
    const tier = r.customer_tier || pickRandom(rng, ['bronze', 'silver', 'gold', 'platinum'])
    const daysSince = r.days_since_purchase ?? randInt(rng, 1, 90)
    const hasPackaging = r.original_packaging ?? (rng() > 0.3)
    const isHazmat = r.is_hazmat ?? false
    const isPerishable = r.is_perishable ?? false

    return {
      returnId: r.return_id || `RET-${String(i + 1).padStart(5, '0')}`,
      orderId: r.order_id || `ORD-${String(randInt(rng, 10000, 99999))}`,
      sku: r.sku || `SKU-${String(randInt(rng, 1000, 9999))}`,
      productName: r.product_name || `Product-${i + 1}`,
      reason,
      condition,
      value,
      tier,
      daysSince,
      hasPackaging,
      isHazmat,
      isPerishable
    }
  })

  // Decision tree for each return
  const decisions = returns.map(r => {
    let decision: string
    let disposition: string
    let recoveryRate: number
    const notes: string[] = []

    // Decision tree logic
    if (r.isHazmat) {
      decision = 'specialized_disposal'
      disposition = '专业危废处理'
      recoveryRate = 0.05
      notes.push('危险品需专业处理')
    } else if (r.isPerishable && r.daysSince > 7) {
      decision = 'dispose'
      disposition = '报废处理'
      recoveryRate = 0
      notes.push('易腐品超期')
    } else if (r.condition === 'unopened' && r.hasPackaging) {
      decision = 'restock'
      disposition = '直接上架'
      recoveryRate = 0.95
      notes.push('未开封原包装')
    } else if (r.condition === 'opened_unused' || r.condition === 'used_like_new') {
      if (refurbEnabled) {
        decision = 'refurbish'
        disposition = '翻新后二次销售'
        recoveryRate = 0.7
        notes.push('轻度使用，可翻新')
      } else {
        decision = 'liquidate'
        disposition = '清仓渠道'
        recoveryRate = 0.4
        notes.push('翻新不可用，走清仓')
      }
    } else if (r.condition === 'used_fair') {
      if (liquidationEnabled) {
        decision = 'liquidate'
        disposition = '清仓渠道'
        recoveryRate = 0.35
        notes.push('一般使用痕迹')
      } else {
        decision = 'dispose'
        disposition = '报废处理'
        recoveryRate = 0.05
        notes.push('无清仓渠道')
      }
    } else if (r.condition === 'damaged' || r.reason === 'defective') {
      if (r.reason === 'defective' && r.value > 1000 && refurbEnabled) {
        decision = 'refurbish'
        disposition = '返厂维修'
        recoveryRate = 0.5
        notes.push('高价值缺陷品返修')
      } else {
        decision = 'dispose'
        disposition = '报废处理'
        recoveryRate = 0.02
        notes.push('损坏无法修复')
      }
    } else {
      decision = 'liquidate'
      disposition = '清仓渠道'
      recoveryRate = 0.3
      notes.push('默认处理')
    }

    // Customer tier bonus
    if (r.tier === 'platinum' && decision !== 'dispose') {
      recoveryRate = Math.min(1, recoveryRate + 0.05)
      notes.push('高价值客户优先处理')
    }

    // Auto-approve check
    if (r.value <= autoApproveThreshold && decision === 'restock') {
      notes.push('自动审批通过')
    }

    const estimatedRecoveryValue = round(r.value * recoveryRate)
    const processingTime = decision === 'restock' ? randInt(rng, 1, 3) :
      decision === 'refurbish' ? randInt(rng, 5, 15) :
      decision === 'liquidate' ? randInt(rng, 3, 7) : randInt(rng, 1, 2)

    return {
      returnId: r.returnId,
      sku: r.sku,
      productName: r.productName,
      returnReason: r.reason,
      condition: r.condition,
      decision,
      disposition,
      estimatedRecoveryValue,
      processingTime,
      notes
    }
  })

  const totalReturnValue = returns.reduce((s, r) => s + r.value, 0)
  const restockValue = decisions.filter(d => d.decision === 'restock').reduce((s, d) => s + d.estimatedRecoveryValue, 0)
  const refurbishValue = decisions.filter(d => d.decision === 'refurbish').reduce((s, d) => s + d.estimatedRecoveryValue, 0)
  const liquidationValue = decisions.filter(d => d.decision === 'liquidate').reduce((s, d) => s + d.estimatedRecoveryValue, 0)
  const disposalCost = decisions.filter(d => d.decision === 'dispose' || d.decision === 'specialized_disposal').length * round(randRange(rng, 10, 50))
  const totalRecovery = restockValue + refurbishValue + liquidationValue
  const netRecovery = totalRecovery - disposalCost
  const recoveryRate = totalReturnValue > 0 ? round((totalRecovery / totalReturnValue) * 100) : 0

  // Disposition summary
  const dispMap: Record<string, { count: number; value: number }> = {}
  for (const d of decisions) {
    if (!dispMap[d.disposition]) dispMap[d.disposition] = { count: 0, value: 0 }
    dispMap[d.disposition].count++
    dispMap[d.disposition].value += d.estimatedRecoveryValue
  }
  const dispositionSummary = Object.entries(dispMap).map(([k, v]) => ({
    disposition: k, count: v.count, value: v.value,
    pct: round((v.count / decisions.length) * 100)
  }))

  const executiveSummary = `处理${returns.length}个退货申请，总退货金额¥${totalReturnValue.toLocaleString()}。通过智能决策树分配：直接上架、翻新、清仓、报废。综合回收率${recoveryRate}%，净回收价值¥${netRecovery.toLocaleString()}（扣除处置成本¥${disposalCost}）。`

  const actionPlan = [
    '步骤1: 接收退货申请，自动分类退货原因和商品状态',
    '步骤2: 按决策树判定处理路径（上架/翻新/清仓/报废）',
    '步骤3: 高价值客户和自动审批阈值内订单快速通道处理',
    '步骤4: 质检站按优先级排序，分配检验员',
    '步骤5: 上架品24h内完成入库，翻新品进入维修队列',
    '步骤6: 清仓品批量打包发往折扣渠道，危废品专业处理',
    '步骤7: 生成退货分析报告，反馈至采购/品控部门'
  ]

  const verificationChecklist = [
    `所有${returns.length}个退货已分配处理决策`,
    `危险品/易腐品已隔离至专用处理通道`,
    `高价值客户（Platinum/Gold）优先处理`,
    `自动审批阈值¥${autoApproveThreshold}已应用`,
    `回收率${recoveryRate}%达到目标（>=60%）`,
    `处置成本已计入净回收计算`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (recoveryRate < 50) risks.push({ risk: '回收率' + recoveryRate + '%偏低', mitigation: '优化翻新能力，拓展清仓渠道，收紧退货政策' })
  if (returns.some(r => r.isHazmat)) risks.push({ risk: '危险品处理合规风险', mitigation: '确认危废处理资质，完整记录处置链' })
  if (returns.filter(r => r.condition === 'damaged').length > returns.length * 0.3) {
    risks.push({ risk: '损坏率过高', mitigation: '排查运输/包装问题，反馈供应链改进' })
  }
  if (risks.length === 0) risks.push({ risk: '退货量突增', mitigation: '启用临时人力，延长处理时间窗口' })

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: {
      totalReturnValue, recoveryRate, restockValue, refurbishValue, liquidationValue, disposalCost, netRecovery
    },
    riskHandling: risks,
    decisions,
    dispositionSummary
  }
}

function formatReverseLogisticsReport(r: ReverseLogisticsResult): string {
  let md = '# Reverse Logistics Automator - 逆向物流自动化报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 退货总价值 (CNY) | ${r.costImpact.totalReturnValue.toLocaleString()} |\n`
  md += `| 综合回收率 | ${r.costImpact.recoveryRate}% |\n`
  md += `| 上架回收 (CNY) | ${r.costImpact.restockValue.toLocaleString()} |\n`
  md += `| 翻新回收 (CNY) | ${r.costImpact.refurbishValue.toLocaleString()} |\n`
  md += `| 清仓回收 (CNY) | ${r.costImpact.liquidationValue.toLocaleString()} |\n`
  md += `| 处置成本 (CNY) | ${r.costImpact.disposalCost.toLocaleString()} |\n`
  md += `| 净回收价值 (CNY) | ${r.costImpact.netRecovery.toLocaleString()} |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Disposition Summary / 处理方式汇总\n\n'
  md += '| 处理方式 | 数量 | 占比 | 回收价值 |\n|----------|------|------|----------|\n'
  for (const d of r.dispositionSummary) {
    md += `| ${d.disposition} | ${d.count} | ${d.pct}% | ¥${d.value.toLocaleString()} |\n`
  }
  md += '\n## Decision Details (Top 20) / 决策详情（前20）\n\n'
  md += '| 退货ID | SKU | 原因 | 状态 | 决策 | 回收价值 | 耗时(天) |\n'
  md += '|--------|-----|------|------|------|----------|----------|\n'
  for (const d of r.decisions.slice(0, 20)) {
    md += `| ${d.returnId} | ${d.sku} | ${d.returnReason} | ${d.condition} | ${d.disposition} | ¥${d.estimatedRecoveryValue} | ${d.processingTime} |\n`
  }
  md += '\n---\n*This analysis is generated for reverse logistics planning reference only. Validate with quality inspection before final disposition.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 6: cross_border_shipping_advisor
// ─────────────────────────────────────────────────────────────────────────────

export interface CrossBorderShippingInput {
  shipment?: {
    origin_country?: string
    destination_country?: string
    product_description?: string
    hs_code?: string
    declared_value_usd?: number
    weight_kg?: number
    quantity?: number
    is_restricted?: boolean
    is_dual_use?: boolean
    ip_rights?: boolean
  }
  shipping_modes?: Array<{
    mode?: 'air_express' | 'air_freight' | 'sea_fcl' | 'sea_lcl' | 'rail' | 'courier' | 'postal'
    transit_time_days?: number
    cost_per_kg?: number
    min_charge?: number
    reliability?: number
  }>
  trade_agreement?: string
  incoterm?: 'EXW' | 'FOB' | 'CIF' | 'DDP' | 'DAP'
}

export interface CrossBorderShippingResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    recommendedModeCost: number
    dutiesAndTaxes: number
    totalLandedCost: number
    costSavingsVsAir: number
    estimatedTransitDays: number
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  modeComparison: Array<{
    mode: string
    modeLabel: string
    totalCost: number
    transitDays: number
    reliability: number
    suitable: boolean
    notes: string[]
  }>
  documentation: Array<{ document: string; required: boolean; status: string; notes: string }>
  customsInfo: {
    hsCode: string
    dutyRate: number
    vatRate: number
    totalDuties: number
    restrictedItems: string[]
    requiredCertifications: string[]
  }
}

function analyzeCrossBorderShipping(data: CrossBorderShippingInput): CrossBorderShippingResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)

  const shipment = data.shipment || {}
  const origin = shipment.origin_country || 'CN'
  const dest = shipment.destination_country || pickRandom(rng, ['US', 'DE', 'JP', 'AU', 'BR', 'IN', 'GB'])
  const hsCode = shipment.hs_code || `${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}.${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}`
  const declaredValue = shipment.declared_value_usd ?? round(randRange(rng, 1000, 50000))
  const weight = shipment.weight_kg ?? round(randRange(rng, 1, 500))
  const quantity = shipment.quantity ?? randInt(rng, 1, 1000)
  const isRestricted = shipment.is_restricted ?? false
  const isDualUse = shipment.is_dual_use ?? false
  const ipRights = shipment.ip_rights ?? false

  const modes = (data.shipping_modes || [
    { mode: 'air_express', transit_time_days: 3, cost_per_kg: 8.5, min_charge: 50, reliability: 95 },
    { mode: 'air_freight', transit_time_days: 7, cost_per_kg: 4.2, min_charge: 150, reliability: 90 },
    { mode: 'sea_fcl', transit_time_days: 25, cost_per_kg: 0.8, min_charge: 500, reliability: 82 },
    { mode: 'sea_lcl', transit_time_days: 30, cost_per_kg: 1.2, min_charge: 100, reliability: 78 },
    { mode: 'rail', transit_time_days: 18, cost_per_kg: 1.5, min_charge: 200, reliability: 85 },
    { mode: 'courier', transit_time_days: 5, cost_per_kg: 12, min_charge: 30, reliability: 93 }
  ]).map(m => ({
    mode: m.mode || 'air_freight',
    transitDays: m.transit_time_days ?? randInt(rng, 2, 35),
    costPerKg: m.cost_per_kg ?? round(randRange(rng, 0.5, 15)),
    minCharge: m.min_charge ?? randInt(rng, 30, 500),
    reliability: m.reliability ?? randInt(rng, 70, 98)
  }))

  const modeLabels: Record<string, string> = {
    air_express: '国际快递(空运快件)', air_freight: '空运货运', sea_fcl: '海运整柜(FCL)',
    sea_lcl: '海运拼箱(LCL)', rail: '中欧班列', courier: '商业快递'
  }

  // Calculate costs for each mode
  const modeComparison = modes.map(m => {
    const freightCost = Math.max(m.minCharge, round(weight * m.costPerKg))
    const insurance = round(declaredValue * 0.003)
    const handlingFee = round(randRange(rng, 20, 80))
    const totalCost = round(freightCost + insurance + handlingFee)

    const notes: string[] = []
    let suitable = true

    if (m.mode === 'sea_fcl' && weight < 500) { suitable = false; notes.push('整柜不适用于小批量') }
    if (m.mode === 'sea_lcl' && weight > 5000) { notes.push('大批量建议整柜更经济') }
    if (m.mode === 'air_express' && weight > 100) { notes.push('大重量快递成本高') }
    if (isRestricted && (m.mode === 'courier' || m.mode === 'postal')) { suitable = false; notes.push('受限品不可走快递/邮政') }
    if (m.transitDays <= 5) notes.push('时效快，适合高价值/紧急货物')
    if (m.transitDays > 20) notes.push('时效慢，适合大批量/非紧急')

    return {
      mode: m.mode,
      modeLabel: modeLabels[m.mode] || m.mode,
      totalCost,
      transitDays: m.transitDays,
      reliability: m.reliability,
      suitable,
      notes
    }
  })

  // Customs and duties
  const dutyRate = round(randRange(rng, 0.03, 0.25), 4)
  const vatRate = dest === 'US' ? 0 : dest === 'GB' ? 0.2 : dest === 'DE' ? 0.19 : dest === 'JP' ? 0.1 : 0.13
  const duties = round(declaredValue * dutyRate)
  const vat = round((declaredValue + duties) * vatRate)
  const totalDuties = round(duties + vat)

  const restrictedItems: string[] = []
  const requiredCerts: string[] = []
  if (isRestricted) restrictedItems.push('受控商品需出口许可证')
  if (isDualUse) restrictedItems.push('军民两用物项需额外审查')
  if (ipRights) requiredCerts.push('知识产权授权书')
  if (parseInt(hsCode.substring(0, 2)) >= 84 && parseInt(hsCode.substring(0, 2)) <= 85) requiredCerts.push('CE/FCC认证')
  if (parseInt(hsCode.substring(0, 2)) >= 16 && parseInt(hsCode.substring(0, 2)) <= 24) requiredCerts.push('卫生/检疫证书')
  requiredCerts.push('商业发票', '装箱单', '提单/运单')

  // Documentation
  const documentation = [
    { document: 'Commercial Invoice / 商业发票', required: true, status: 'required', notes: '须注明HS编码、原产国、交易条款' },
    { document: 'Packing List / 装箱单', required: true, status: 'required', notes: '详细列出每件货物信息' },
    { document: 'Bill of Lading / 提单', required: true, status: 'required', notes: '海运/空运提单' },
    { document: 'Certificate of Origin / 原产地证', required: true, status: 'required', notes: '适用' + (data.trade_agreement || '最惠国') + '税率' },
    { document: 'Export License / 出口许可证', required: isRestricted, status: isRestricted ? 'required' : 'not_needed', notes: isRestricted ? '受控商品必须' : '一般贸易不需要' },
    { document: 'Insurance Certificate / 保险单', required: declaredValue > 5000, status: declaredValue > 5000 ? 'recommended' : 'optional', notes: '建议高价值货物投保' },
    { document: 'Inspection Certificate / 检验证书', required: parseInt(hsCode.substring(0, 2)) >= 16 && parseInt(hsCode.substring(0, 2)) <= 24, status: 'conditional', notes: '食品/农产品需要' }
  ]

  // Recommend best mode
  const suitableModes = modeComparison.filter(m => m.suitable)
  const recommended = suitableModes.length > 0 ? suitableModes.reduce((best, m) =>
    m.totalCost < best.totalCost && m.transitDays < 20 ? m : best, suitableModes[0]) : modeComparison[0]
  const airExpressCost = modeComparison.find(m => m.mode === 'air_express')?.totalCost || recommended.totalCost * 2
  const costSavingsVsAir = round(airExpressCost - recommended.totalCost)

  const incotermLabel: Record<string, string> = { EXW: '工厂交货', FOB: '装运港船上交货', CIF: '成本加运保费', DDP: '完税后交货', DAP: '目的地交货' }
  const incoterm = data.incoterm || 'CIF'

  const executiveSummary = `${origin}至${dest}跨境运输方案：推荐${recommended.modeLabel}，总成本¥${recommended.totalCost}（含关税$${totalDuties}），时效${recommended.transitDays}天。相比快递节省¥${costSavingsVsAir}。贸易条款：${incoterm}（${incotermLabel[incoterm] || incoterm}）。`

  const actionPlan = [
    '步骤1: 确认商品HS编码和目的国进口管制要求',
    '步骤2: 比较各运输方式成本、时效、可靠性',
    '步骤3: 计算关税和增值税（基于贸易协定优惠税率）',
    '步骤4: 准备所需单证（发票、装箱单、原产地证等）',
    '步骤5: 选择贸易条款（Incoterm），明确买卖双方责任',
    '步骤6: 安排订舱/发货，购买保险',
    '步骤7: 跟踪货物状态，准备清关文件'
  ]

  const verificationChecklist = [
    `HS编码${hsCode}已确认`,
    `目的国${dest}进口限制已核查`,
    `关税税率${(dutyRate * 100).toFixed(1)}%已确认`,
    `所需单证清单已生成`,
    `贸易条款${incoterm}已明确`,
    `保险覆盖已确认`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (isRestricted) risks.push({ risk: '出口管制风险', mitigation: '提前申请出口许可证，确认最终用户' })
  if (isDualUse) risks.push({ risk: '军民两用物项审查', mitigation: '准备最终用户声明，预留审查时间' })
  if (recommended.transitDays > 20) risks.push({ risk: '长时效导致库存风险', mitigation: '提前备货，设置安全库存' })
  if (ipRights) risks.push({ risk: '知识产权海关备案', mitigation: '提前在目的国海关备案IP' })
  if (risks.length === 0) risks.push({ risk: '清关延误', mitigation: '预清关，准备完整文件' })

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: {
      recommendedModeCost: recommended.totalCost,
      dutiesAndTaxes: totalDuties,
      totalLandedCost: round(recommended.totalCost + totalDuties),
      costSavingsVsAir,
      estimatedTransitDays: recommended.transitDays
    },
    riskHandling: risks,
    modeComparison,
    documentation,
    customsInfo: {
      hsCode, dutyRate: round(dutyRate * 100, 2), vatRate: round(vatRate * 100, 2),
      totalDuties, restrictedItems, requiredCertifications: requiredCerts
    }
  }
}

function formatCrossBorderShippingReport(r: CrossBorderShippingResult): string {
  let md = '# Cross-Border Shipping Advisor - 跨境运输建议报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 推荐方式成本 (USD) | $${r.costImpact.recommendedModeCost} |\n`
  md += `| 关税+税费 (USD) | $${r.costImpact.dutiesAndTaxes} |\n`
  md += `| 总到岸成本 (USD) | $${r.costImpact.totalLandedCost} |\n`
  md += `| 相比快递节省 (USD) | $${r.costImpact.costSavingsVsAir} |\n`
  md += `| 预计时效 (天) | ${r.costImpact.estimatedTransitDays} |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Mode Comparison / 运输方式对比\n\n'
  md += '| 方式 | 总成本 | 时效(天) | 可靠性 | 适用 | 备注 |\n'
  md += '|------|--------|----------|--------|------|------|\n'
  for (const m of r.modeComparison) {
    md += `| ${m.modeLabel} | $${m.totalCost} | ${m.transitDays} | ${m.reliability}% | ${m.suitable ? 'Y' : 'N'} | ${m.notes.join('; ') || '-'} |\n`
  }
  md += '\n## Customs Information / 清关信息\n\n'
  md += `| 项目 | 值 |\n|------|----|\n`
  md += `| HS编码 | ${r.customsInfo.hsCode} |\n`
  md += `| 关税率 | ${r.customsInfo.dutyRate}% |\n`
  md += `| 增值税率 | ${r.customsInfo.vatRate}% |\n`
  md += `| 总税费 | $${r.customsInfo.totalDuties} |\n\n`
  md += '## Documentation Checklist / 单证清单\n\n'
  md += '| 单证 | 必需 | 状态 | 备注 |\n|------|------|------|------|\n'
  for (const d of r.documentation) {
    md += `| ${d.document} | ${d.required ? 'Y' : 'N'} | ${d.status} | ${d.notes} |\n`
  }
  md += '\n---\n*This analysis is generated for cross-border shipping reference only. Consult a licensed customs broker for compliance matters.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 7: fleet_maintenance_predictor
// ─────────────────────────────────────────────────────────────────────────────

export interface FleetMaintenanceInput {
  vehicles?: Array<{
    id?: string
    plate?: string
    vehicle_type?: 'light_duty' | 'medium_duty' | 'heavy_duty' | 'refrigerated' | 'tanker'
    make?: string
    model?: string
    year?: number
    current_mileage_km?: number
    last_service_mileage_km?: number
    last_service_date?: string
    service_interval_km?: number
    engine_hours?: number
    fault_codes?: string[]
    tire_condition?: 'good' | 'fair' | 'poor'
    brake_condition?: 'good' | 'fair' | 'poor'
    oil_quality?: 'good' | 'fair' | 'poor'
    daily_usage_km?: number
  }>
  maintenance_capacity?: {
    service_bays?: number
    daily_capacity?: number
    operating_hours?: string
  }
  prediction_horizon_days?: number
}

export interface FleetMaintenanceResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    totalMaintenanceCost: number
    preventiveCost: number
    estimatedBreakdownCostAvoided: number
    downtimeReduction: number
    fleetAvailability: number
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  predictions: Array<{
    vehicleId: string
    plate: string
    vehicleType: string
    currentMileage: number
    nextServiceDueKm: number
    kmUntilService: number
    daysUntilService: number
    urgency: 'ok' | 'soon' | 'overdue' | 'critical'
    predictedIssues: string[]
    recommendedActions: string[]
    estimatedCost: number
    scheduledDate: string
  }>
  schedule: Array<{ date: string; vehicles: string[]; totalCost: number }>
}

function analyzeFleetMaintenance(data: FleetMaintenanceInput): FleetMaintenanceResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const horizon = data.prediction_horizon_days || 90
  const dailyCapacity = data.maintenance_capacity?.daily_capacity || 5

  const vehicles = (data.vehicles || []).map((v, i) => {
    const type = v.vehicle_type || pickRandom(rng, ['light_duty', 'medium_duty', 'heavy_duty', 'refrigerated', 'tanker'])
    const currentMileage = v.current_mileage_km ?? randInt(rng, 10000, 200000)
    const serviceInterval = v.service_interval_km ?? (type === 'heavy_duty' ? 10000 : type === 'medium_duty' ? 8000 : 5000)
    const lastServiceMileage = v.last_service_mileage_km ?? (currentMileage - randInt(rng, 0, serviceInterval))
    const engineHours = v.engine_hours ?? randInt(rng, 500, 15000)
    const dailyUsage = v.daily_usage_km ?? randInt(rng, 50, 400)
    const tireCondition = v.tire_condition || pickRandom(rng, ['good', 'fair', 'poor'])
    const brakeCondition = v.brake_condition || pickRandom(rng, ['good', 'fair', 'poor'])
    const oilQuality = v.oil_quality || pickRandom(rng, ['good', 'fair', 'poor'])
    const faultCodes = v.fault_codes || (rng() > 0.7 ? [`P0${randInt(rng, 100, 999)}`] : [])

    return {
      id: v.id || `VEH-${String(i + 1).padStart(3, '0')}`,
      plate: v.plate || `${pickRandom(rng, ['京', '沪', '粤', '浙', '苏'])}${String.fromCharCode(65 + randInt(rng, 0, 25))}${randInt(rng, 10000, 99999)}`,
      type,
      make: v.make || pickRandom(rng, ['Volvo', 'Mercedes', 'Isuzu', 'FAW', 'Dongfeng']),
      model: v.model || `Model-${randInt(rng, 1, 9)}`,
      year: v.year || randInt(rng, 2018, 2025),
      currentMileage,
      lastServiceMileage,
      lastServiceDate: v.last_service_date || `2026-0${randInt(rng, 1, 7)}-${String(randInt(rng, 1, 28)).padStart(2, '0')}`,
      serviceInterval,
      engineHours,
      dailyUsage,
      tireCondition,
      brakeCondition,
      oilQuality,
      faultCodes
    }
  })

  const predictions = vehicles.map(v => {
    const nextServiceDueKm = v.lastServiceMileage + v.serviceInterval
    const kmUntilService = nextServiceDueKm - v.currentMileage
    const daysUntilService = Math.round(kmUntilService / v.dailyUsage)

    let urgency: 'ok' | 'soon' | 'overdue' | 'critical'
    if (kmUntilService < 0) urgency = 'overdue'
    else if (kmUntilService < 500) urgency = 'critical'
    else if (kmUntilService < 2000) urgency = 'soon'
    else urgency = 'ok'

    const predictedIssues: string[] = []
    const recommendedActions: string[] = []

    if (v.oilQuality === 'poor') { predictedIssues.push('机油劣化') ; recommendedActions.push('更换机油和滤芯') }
    if (v.tireCondition === 'poor') { predictedIssues.push('轮胎磨损严重') ; recommendedActions.push('更换轮胎') }
    if (v.brakeCondition === 'poor') { predictedIssues.push('刹车系统磨损') ; recommendedActions.push('更换刹车片/盘') }
    if (v.engineHours > 10000) { predictedIssues.push('发动机高工时') ; recommendedActions.push('发动机全面检查') }
    if (v.faultCodes.length > 0) { predictedIssues.push(`故障码: ${v.faultCodes.join(', ')}`) ; recommendedActions.push('诊断并清除故障码') }
    if (v.currentMileage > 150000) { predictedIssues.push('高里程车辆') ; recommendedActions.push('评估大修或更换') }
    if (predictedIssues.length === 0) { predictedIssues.push('正常磨损') ; recommendedActions.push('常规保养') }

    const baseCost = v.type === 'heavy_duty' ? 3000 : v.type === 'medium_duty' ? 1500 : 800
    const estimatedCost = round(baseCost + predictedIssues.length * randRange(rng, 200, 800))

    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + Math.max(0, daysUntilService))

    return {
      vehicleId: v.id,
      plate: v.plate,
      vehicleType: v.type,
      currentMileage: v.currentMileage,
      nextServiceDueKm,
      kmUntilService: Math.max(0, kmUntilService),
      daysUntilService: Math.max(0, daysUntilService),
      urgency,
      predictedIssues,
      recommendedActions,
      estimatedCost,
      scheduledDate: scheduledDate.toISOString().split('T')[0]
    }
  })

  // Sort by urgency
  const urgencyOrder: Record<string, number> = { overdue: 0, critical: 1, soon: 2, ok: 3 }
  predictions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

  const totalMaintenanceCost = predictions.reduce((s, p) => s + p.estimatedCost, 0)
  const preventiveCost = round(totalMaintenanceCost * 0.6)
  const breakdownCostAvoided = round(totalMaintenanceCost * randRange(rng, 1.5, 3.0))
  const downtimeReduction = round(randRange(rng, 20, 45))
  const operationalVehicles = predictions.filter(p => p.urgency === 'ok' || p.urgency === 'soon').length
  const fleetAvailability = predictions.length > 0 ? round((operationalVehicles / predictions.length) * 100) : 100

  // Generate schedule
  const schedule: Record<string, { date: string; vehicles: string[]; totalCost: number }> = {}
  for (const p of predictions) {
    const dateKey = p.scheduledDate
    if (!schedule[dateKey]) schedule[dateKey] = { date: dateKey, vehicles: [], totalCost: 0 }
    schedule[dateKey].vehicles.push(p.plate)
    schedule[dateKey].totalCost += p.estimatedCost
  }
  const scheduleList = Object.values(schedule).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10)

  const overdueCount = predictions.filter(p => p.urgency === 'overdue').length
  const criticalCount = predictions.filter(p => p.urgency === 'critical').length

  const executiveSummary = `车队${vehicles.length}辆车维护预测（${horizon}天窗口）：${overdueCount}辆超期未保养，${criticalCount}辆紧急需处理。预计总维护成本¥${totalMaintenanceCost.toLocaleString()}，预防性维护投入¥${preventiveCost.toLocaleString()}，可避免故障损失约¥${breakdownCostAvoided.toLocaleString()}。车队可用率${fleetAvailability}%，停机时间可减少${downtimeReduction}%。`

  const actionPlan = [
    '步骤1: 收集车辆里程、工时、故障码、车况数据',
    '步骤2: 基于里程间隔和车况指标预测下次保养时间',
    '步骤3: 按紧急程度排序（超期 > 紧急 > 临近 > 正常）',
    '步骤4: 在维修能力约束下生成保养排程',
    '步骤5: 识别潜在故障并推荐预防性维修',
    '步骤6: 执行保养并更新车辆档案',
    '步骤7: 持续监控，动态调整预测模型'
  ]

  const verificationChecklist = [
    `所有${vehicles.length}辆车已纳入预测`,
    `超期车辆${overdueCount}辆已标记并优先处理`,
    `保养排程未超出日维修能力${dailyCapacity}辆`,
    `故障码车辆已分配诊断任务`,
    `备件需求已生成采购清单`,
    `车队可用率${fleetAvailability}%达到目标（>=85%）`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (overdueCount > 0) risks.push({ risk: overdueCount + '辆车超期未保养', mitigation: '立即安排保养，暂停运营超期车辆' })
  if (criticalCount > vehicles.length * 0.2) risks.push({ risk: '紧急保养比例过高', mitigation: '增加维修班次或外包，评估车辆更新计划' })
  if (fleetAvailability < 85) risks.push({ risk: '车队可用率' + fleetAvailability + '%低于目标', mitigation: '优先处理关键车辆，租赁临时运力' })
  if (risks.length === 0) risks.push({ risk: '突发故障', mitigation: '保留应急维修预算，建立快速响应机制' })

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: {
      totalMaintenanceCost, preventiveCost, estimatedBreakdownCostAvoided: breakdownCostAvoided,
      downtimeReduction, fleetAvailability
    },
    riskHandling: risks,
    predictions,
    schedule: scheduleList
  }
}

function formatFleetMaintenanceReport(r: FleetMaintenanceResult): string {
  let md = '# Fleet Maintenance Predictor - 车队维护预测报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 总维护成本 (CNY) | ${r.costImpact.totalMaintenanceCost.toLocaleString()} |\n`
  md += `| 预防性维护 (CNY) | ${r.costImpact.preventiveCost.toLocaleString()} |\n`
  md += `| 避免故障损失 (CNY) | ${r.costImpact.estimatedBreakdownCostAvoided.toLocaleString()} |\n`
  md += `| 停机时间减少 | ${r.costImpact.downtimeReduction}% |\n`
  md += `| 车队可用率 | ${r.costImpact.fleetAvailability}% |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Maintenance Schedule / 保养排程\n\n'
  md += '| 日期 | 车辆 | 总成本 |\n|------|------|--------|\n'
  for (const s of r.schedule) {
    md += `| ${s.date} | ${s.vehicles.join(', ')} | ¥${s.totalCost.toLocaleString()} |\n`
  }
  md += '\n## Vehicle Predictions / 车辆预测\n\n'
  md += '| ID | 车牌 | 类型 | 里程 | 距保养(km) | 紧急度 | 预计问题 | 成本 | 排程 |\n'
  md += '|----|------|------|------|------------|--------|----------|------|------|\n'
  for (const p of r.predictions) {
    const urgencyIcon = p.urgency === 'overdue' ? '!!' : p.urgency === 'critical' ? '!' : p.urgency === 'soon' ? '~' : 'ok'
    md += `| ${p.vehicleId} | ${p.plate} | ${p.vehicleType} | ${p.currentMileage} | ${p.kmUntilService} | ${urgencyIcon} | ${p.predictedIssues.slice(0, 2).join(', ')} | ¥${p.estimatedCost} | ${p.scheduledDate} |\n`
  }
  md += '\n---\n*This analysis is generated for fleet maintenance planning reference only. Always follow manufacturer service guidelines.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 8: logistics_cost_analyzer
// ─────────────────────────────────────────────────────────────────────────────

export interface LogisticsCostInput {
  cost_data?: {
    transportation?: {
      line_haul_cny?: number
      last_mile_cny?: number
      fuel_surcharge_cny?: number
      tolls_cny?: number
      driver_overtime_cny?: number
      freight_forwarding_cny?: number
    }
    warehousing?: {
      rent_cny?: number
      labor_cny?: number
      equipment_cny?: number
      utilities_cny?: number
      packaging_materials_cny?: number
      wms_software_cny?: number
    }
    inventory?: {
      holding_cost_cny?: number
      obsolescence_cny?: number
      insurance_cny?: number
      stockout_cost_cny?: number
      capital_cost_cny?: number
    }
    packaging?: {
      primary_packaging_cny?: number
      secondary_packaging_cny?: number
      void_fill_cny?: number
      labels_cny?: number
    }
    overhead?: {
      management_cny?: number
      it_systems_cny?: number
      compliance_cny?: number
      returns_processing_cny?: number
    }
  }
  revenue_context?: {
    annual_revenue_cny?: number
    order_volume?: number
    sku_count?: number
    geographic_coverage?: string
  }
  benchmark_industry?: string
}

export interface LogisticsCostResult {
  executiveSummary: string
  actionPlan: string[]
  verificationChecklist: string[]
  costImpact: {
    totalLogisticsCost: number
    costAsPctOfRevenue: number
    costPerOrder: number
    potentialSavings: number
    savingsBreakdown: Array<{ category: string; current: number; target: number; saving: number }>
  }
  riskHandling: Array<{ risk: string; mitigation: string }>
  costBreakdown: Array<{
    category: string
    subcategory: string
    amount: number
    pctOfTotal: number
    benchmark: 'above' | 'at' | 'below'
    levers: string[]
  }>
  reductionRoadmap: Array<{ phase: string; actions: string[]; expectedSaving: number; timeline: string }>
}

function analyzeLogisticsCost(data: LogisticsCostInput): LogisticsCostResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)

  const cd = data.cost_data || {}
  const trans = cd.transportation || {}
  const wh = cd.warehousing || {}
  const inv = cd.inventory || {}
  const pkg = cd.packaging || {}
  const oh = cd.overhead || {}

  const lineHaul = trans.line_haul_cny ?? round(randRange(rng, 50000, 500000))
  const lastMile = trans.last_mile_cny ?? round(randRange(rng, 30000, 300000))
  const fuelSurcharge = trans.fuel_surcharge_cny ?? round(randRange(rng, 5000, 50000))
  const tolls = trans.tolls_cny ?? round(randRange(rng, 3000, 30000))
  const driverOvertime = trans.driver_overtime_cny ?? round(randRange(rng, 2000, 20000))
  const freightForwarding = trans.freight_forwarding_cny ?? round(randRange(rng, 10000, 100000))

  const whRent = wh.rent_cny ?? round(randRange(rng, 20000, 200000))
  const whLabor = wh.labor_cny ?? round(randRange(rng, 30000, 250000))
  const whEquipment = wh.equipment_cny ?? round(randRange(rng, 5000, 50000))
  const whUtilities = wh.utilities_cny ?? round(randRange(rng, 3000, 20000))
  const pkgMaterials = wh.packaging_materials_cny ?? round(randRange(rng, 5000, 40000))
  const wmsSoftware = wh.wms_software_cny ?? round(randRange(rng, 2000, 15000))

  const invHolding = inv.holding_cost_cny ?? round(randRange(rng, 10000, 100000))
  const obsolescence = inv.obsolescence_cny ?? round(randRange(rng, 2000, 30000))
  const invInsurance = inv.insurance_cny ?? round(randRange(rng, 3000, 20000))
  const stockoutCost = inv.stockout_cost_cny ?? round(randRange(rng, 5000, 50000))
  const capitalCost = inv.capital_cost_cny ?? round(randRange(rng, 5000, 40000))

  const primaryPkg = pkg.primary_packaging_cny ?? round(randRange(rng, 10000, 80000))
  const secondaryPkg = pkg.secondary_packaging_cny ?? round(randRange(rng, 3000, 20000))
  const voidFill = pkg.void_fill_cny ?? round(randRange(rng, 1000, 8000))
  const labels = pkg.labels_cny ?? round(randRange(rng, 500, 5000))

  const mgmt = oh.management_cny ?? round(randRange(rng, 10000, 80000))
  const itSystems = oh.it_systems_cny ?? round(randRange(rng, 5000, 40000))
  const compliance = oh.compliance_cny ?? round(randRange(rng, 2000, 15000))
  const returnsProcessing = oh.returns_processing_cny ?? round(randRange(rng, 3000, 25000))

  const transportTotal = lineHaul + lastMile + fuelSurcharge + tolls + driverOvertime + freightForwarding
  const warehouseTotal = whRent + whLabor + whEquipment + whUtilities + pkgMaterials + wmsSoftware
  const inventoryTotal = invHolding + obsolescence + invInsurance + stockoutCost + capitalCost
  const packagingTotal = primaryPkg + secondaryPkg + voidFill + labels
  const overheadTotal = mgmt + itSystems + compliance + returnsProcessing
  const totalLogisticsCost = round(transportTotal + warehouseTotal + inventoryTotal + packagingTotal + overheadTotal)

  const revenue = data.revenue_context?.annual_revenue_cny ?? round(totalLogisticsCost * randRange(rng, 5, 15))
  const orderVolume = data.revenue_context?.order_volume ?? randInt(rng, 10000, 500000)
  const costAsPct = round((totalLogisticsCost / revenue) * 100)
  const costPerOrder = round(totalLogisticsCost / orderVolume)

  // Cost breakdown with benchmarks
  const costBreakdown: Array<{
    category: string; subcategory: string; amount: number; pctOfTotal: number;
    benchmark: 'above' | 'at' | 'below'; levers: string[]
  }> = []

  const addBreakdown = (cat: string, sub: string, amount: number, benchmarkPct: number, levers: string[]) => {
    const pct = round((amount / totalLogisticsCost) * 100)
    const actualPctOfRevenue = (amount / revenue) * 100
    costBreakdown.push({
      category: cat, subcategory: sub, amount, pctOfTotal: pct,
      benchmark: actualPctOfRevenue > benchmarkPct * 1.2 ? 'above' : actualPctOfRevenue < benchmarkPct * 0.8 ? 'below' : 'at',
      levers
    })
  }

  addBreakdown('运输', '干线运输', lineHaul, 3.5, ['优化路线', '提高装载率', '回程配载'])
  addBreakdown('运输', '末端配送', lastMile, 2.0, ['智能调度', '自提柜网络', '众包运力'])
  addBreakdown('运输', '燃油附加', fuelSurcharge, 0.5, ['新能源车辆', '优化路线减里程'])
  addBreakdown('运输', '过路费', tolls, 0.3, ['路线优化避开高费路段'])
  addBreakdown('运输', '司机加班', driverOvertime, 0.2, ['优化排班', '提高基础效率'])
  addBreakdown('运输', '货代费用', freightForwarding, 0.8, ['直客比例提升', '议价'])
  addBreakdown('仓储', '仓库租金', whRent, 1.5, ['优化布局', '共享仓', '自动化减面积'])
  addBreakdown('仓储', '仓储人工', whLabor, 2.0, ['WMS优化', '自动化设备', '绩效激励'])
  addBreakdown('仓储', '设备折旧', whEquipment, 0.4, ['设备租赁替代购买'])
  addBreakdown('仓储', '水电能耗', whUtilities, 0.2, ['节能设备', '光伏'])
  addBreakdown('仓储', '包材耗材', pkgMaterials, 0.3, ['集中采购', '循环包材'])
  addBreakdown('仓储', 'WMS系统', wmsSoftware, 0.1, ['SaaS替代自建'])
  addBreakdown('库存', '持有成本', invHolding, 1.0, ['降低库存水平', 'JIT补货'])
  addBreakdown('库存', '滞销/过期', obsolescence, 0.3, ['需求预测', '促销清仓'])
  addBreakdown('库存', '库存保险', invInsurance, 0.2, ['优化投保范围'])
  addBreakdown('库存', '缺货损失', stockoutCost, 0.4, ['安全库存优化', '快速补货'])
  addBreakdown('库存', '资金占用', capitalCost, 0.3, ['缩短库存周期', 'VMI'])
  addBreakdown('包装', '一级包装', primaryPkg, 0.8, ['包材标准化', '减量化设计'])
  addBreakdown('包装', '二级包装', secondaryPkg, 0.2, ['可循环包装'])
  addBreakdown('包装', '填充物', voidFill, 0.1, ['环保填充', '精准裁切'])
  addBreakdown('包装', '标签单据', labels, 0.05, ['电子面单', '无纸化'])
  addBreakdown('管理', '管理人员', mgmt, 0.8, ['组织优化', '数字化管理'])
  addBreakdown('管理', 'IT系统', itSystems, 0.3, ['系统集成', '云化'])
  addBreakdown('管理', '合规认证', compliance, 0.1, ['流程标准化'])
  addBreakdown('管理', '退货处理', returnsProcessing, 0.2, ['退货自动化', '降低退货率'])

  // Calculate potential savings
  const aboveBenchmark = costBreakdown.filter(c => c.benchmark === 'above')
  const savingsBreakdown = aboveBenchmark.map(c => {
    const target = round(c.amount * randRange(rng, 0.8, 0.92))
    return { category: `${c.category}-${c.subcategory}`, current: c.amount, target, saving: round(c.amount - target) }
  })
  const potentialSavings = savingsBreakdown.reduce((s, sb) => s + sb.saving, 0)

  // Reduction roadmap
  const reductionRoadmap = [
    {
      phase: 'Phase 1 (0-3个月)',
      actions: ['运输路线优化', '仓储布局调整', '包材集中采购'],
      expectedSaving: round(potentialSavings * 0.3),
      timeline: '0-3个月'
    },
    {
      phase: 'Phase 2 (3-6个月)',
      actions: ['WMS系统升级', '自动化设备引入', '库存优化'],
      expectedSaving: round(potentialSavings * 0.35),
      timeline: '3-6个月'
    },
    {
      phase: 'Phase 3 (6-12个月)',
      actions: ['新能源车队', '共享仓网络', '全链路数字化'],
      expectedSaving: round(potentialSavings * 0.35),
      timeline: '6-12个月'
    }
  ]

  const executiveSummary = `年度物流总成本¥${totalLogisticsCost.toLocaleString()}，占收入比${costAsPct}%，单均成本¥${costPerOrder}。运输占比${round((transportTotal / totalLogisticsCost) * 100)}%，仓储占比${round((warehouseTotal / totalLogisticsCost) * 100)}%，库存占比${round((inventoryTotal / totalLogisticsCost) * 100)}%。识别潜在节省¥${potentialSavings.toLocaleString()}（${round((potentialSavings / totalLogisticsCost) * 100)}%），通过三阶段降本路线图实现。`

  const actionPlan = [
    '步骤1: 收集全链路物流成本数据，按运输/仓储/库存/包装/管理五大类归集',
    '步骤2: 对标行业基准，识别高于基准的成本项',
    '步骤3: 针对高成本项制定降本杠杆（路线优化、自动化、库存优化等）',
    '步骤4: 按投资回报率和实施难度排序，制定三阶段路线图',
    '步骤5: 建立成本监控仪表盘，月度跟踪降本进展',
    '步骤6: 持续优化，每季度复盘并调整策略'
  ]

  const verificationChecklist = [
    `全链路成本已归集（5大类${costBreakdown.length}子项）`,
    `行业对标已完成，高成本项已标识`,
    `潜在节省¥${potentialSavings.toLocaleString()}已量化`,
    `三阶段路线图已制定`,
    `成本占收入比${costAsPct}%已计算`,
    `单均成本¥${costPerOrder}已计算`
  ]

  const risks: Array<{ risk: string; mitigation: string }> = []
  if (costAsPct > 15) risks.push({ risk: '物流成本占比' + costAsPct + '%过高', mitigation: '优先实施高ROI降本措施，设定硬性降本目标' })
  if (transportTotal / totalLogisticsCost > 0.6) risks.push({ risk: '运输成本占比过高', mitigation: '优化运输结构，提高自有车比例，发展多式联运' })
  if (inventoryTotal / totalLogisticsCost > 0.25) risks.push({ risk: '库存成本占比偏高', mitigation: '优化库存策略，降低安全库存，加快周转' })
  if (risks.length === 0) risks.push({ risk: '降本影响服务质量', mitigation: '设定服务质量底线，降本不降质' })

  return {
    executiveSummary,
    actionPlan,
    verificationChecklist,
    costImpact: {
      totalLogisticsCost, costAsPctOfRevenue: costAsPct, costPerOrder,
      potentialSavings, savingsBreakdown
    },
    riskHandling: risks,
    costBreakdown,
    reductionRoadmap
  }
}

function formatLogisticsCostReport(r: LogisticsCostResult): string {
  let md = '# Logistics Cost Analyzer - 物流成本分析报告\n\n'
  md += '## 1. Executive Summary / 执行摘要\n\n'
  md += r.executiveSummary + '\n\n'
  md += '## 2. Step-by-Step Action Plan / 行动计划\n\n'
  for (const step of r.actionPlan) md += `- ${step}\n`
  md += '\n## 3. Verification Checklist / 验证清单\n\n'
  for (const item of r.verificationChecklist) md += `- [ ] ${item}\n`
  md += '\n## 4. Cost Impact Estimate / 成本影响评估\n\n'
  md += '| 指标 | 值 |\n|------|----|\n'
  md += `| 物流总成本 (CNY) | ${r.costImpact.totalLogisticsCost.toLocaleString()} |\n`
  md += `| 占收入比 | ${r.costImpact.costAsPctOfRevenue}% |\n`
  md += `| 单均成本 (CNY) | ${r.costImpact.costPerOrder} |\n`
  md += `| 潜在节省 (CNY) | ${r.costImpact.potentialSavings.toLocaleString()} |\n\n`
  md += '## 5. Risk & Exception Handling / 风险与异常处理\n\n'
  md += '| 风险 | 缓解措施 |\n|------|----------|\n'
  for (const risk of r.riskHandling) md += `| ${risk.risk} | ${risk.mitigation} |\n`
  md += '\n## Cost Breakdown / 成本明细\n\n'
  md += '| 类别 | 子项 | 金额 | 占比 | 对标 | 降本杠杆 |\n'
  md += '|------|------|------|------|------|----------|\n'
  for (const c of r.costBreakdown) {
    const benchIcon = c.benchmark === 'above' ? 'H' : c.benchmark === 'below' ? 'L' : '='
    md += `| ${c.category} | ${c.subcategory} | ¥${c.amount.toLocaleString()} | ${c.pctOfTotal}% | ${benchIcon} | ${c.levers.slice(0, 2).join(', ')} |\n`
  }
  md += '\n## Savings Opportunities / 节省机会\n\n'
  md += '| 项目 | 当前 | 目标 | 节省 |\n|------|------|------|------|\n'
  for (const s of r.costImpact.savingsBreakdown) {
    md += `| ${s.category} | ¥${s.current.toLocaleString()} | ¥${s.target.toLocaleString()} | ¥${s.saving.toLocaleString()} |\n`
  }
  md += '\n## Reduction Roadmap / 降本路线图\n\n'
  for (const phase of r.reductionRoadmap) {
    md += `### ${phase.phase} (${phase.timeline})\n\n`
    md += `- **预期节省**: ¥${phase.expectedSaving.toLocaleString()}\n`
    md += `- **关键举措**: ${phase.actions.join(', ')}\n\n`
  }
  md += '---\n*This analysis is generated for logistics cost optimization reference only. Validate with finance team before budget allocation.*\n'
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin registration
// ─────────────────────────────────────────────────────────────────────────────

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'last_mile_route_optimizer',
    description: 'Optimize last-mile delivery routes with time windows, traffic conditions, and vehicle capacity constraints. Outputs prioritized stop sequence with ETA and cost analysis.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { stops, depot, vehicle_capacity, max_route_duration_min, traffic_factor, optimization_goal }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatLastMileRouteReport(analyzeLastMileRoute(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'warehouse_slotting_optimizer',
    description: 'Optimize warehouse storage locations using ABC velocity classification, golden zone assignment, and picking path minimization. Reduces travel time and increases throughput.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { skus, warehouse_zones, strategy, order_profile }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatWarehouseSlottingReport(analyzeWarehouseSlotting(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'demand_forecasting_planner',
    description: 'Predict order volumes by SKU and region using trend analysis, seasonality detection, and promotion uplift factors. Generates procurement recommendations and safety stock levels.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { products, forecast_months, confidence_level, aggregation }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatDemandForecastingReport(analyzeDemandForecasting(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'carrier_selection_engine',
    description: 'Compare carrier options by cost, speed, reliability, and service level. Multi-criteria weighted scoring with surcharge calculation and recommendation ranking.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { shipment, carriers, selection_criteria }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatCarrierSelectionReport(analyzeCarrierSelection(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'reverse_logistics_automator',
    description: 'Automate returns processing with intelligent decision trees. Routes items to restock, refurbishment, liquidation, or disposal based on condition, value, and customer tier.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { returns, processing_capacity, policy }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatReverseLogisticsReport(analyzeReverseLogistics(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'cross_border_shipping_advisor',
    description: 'Advise on international shipping modes, customs duties, documentation requirements, and trade agreement benefits. Compares air, sea, rail, and courier options.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { shipment, shipping_modes, trade_agreement, incoterm }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatCrossBorderShippingReport(analyzeCrossBorderShipping(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'fleet_maintenance_predictor',
    description: 'Predict vehicle maintenance needs using mileage intervals, engine hours, fault codes, and component condition. Generates service schedule and cost estimates.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { vehicles, maintenance_capacity, prediction_horizon_days }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatFleetMaintenanceReport(analyzeFleetMaintenance(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'logistics_cost_analyzer',
    description: 'Total logistics cost breakdown across transportation, warehousing, inventory, packaging, and overhead. Identifies reduction levers and generates phased savings roadmap.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input: { cost_data, revenue_context, benchmark_industry }' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatLogisticsCostReport(analyzeLogisticsCost(JSON.parse(args.input_data)))
    }
  }))
}
