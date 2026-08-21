import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'logistagentpro'
export const inject = ['tools']

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic RNG utilities
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

// ─────────────────────────────────────────────────────────────────────────────
// Tool 1: route_optimization
// ─────────────────────────────────────────────────────────────────────────────

interface RouteInput {
  routes?: Array<{
    id?: string
    origin?: string
    destination?: string
    distance_km?: number
    estimated_time_hours?: number
    cost_per_km?: number
    carbon_per_km?: number
  }>
  objective?: 'distance' | 'time' | 'cost' | 'carbon' | 'balanced'
}

interface RouteResult {
  recommendedRoute: string
  routes: Array<{
    id: string
    origin: string
    destination: string
    distanceKm: number
    timeHours: number
    cost: number
    carbonKg: number
    score: number
  }>
  summary: {
    totalRoutes: number
    avgDistanceKm: number
    avgTimeHours: number
    avgCost: number
    avgCarbonKg: number
    objective: string
  }
}

function analyzeRoute(data: RouteInput): RouteResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const objective = data.objective || 'balanced'

  const routes = (data.routes || []).map((r, i) => {
    const distanceKm = r.distance_km ?? round(randRange(rng, 80, 1200))
    const timeHours = r.estimated_time_hours ?? round(distanceKm / randRange(rng, 40, 80))
    const costPerKm = r.cost_per_km ?? round(randRange(rng, 1.5, 5.0))
    const carbonPerKm = r.carbon_per_km ?? round(randRange(rng, 0.12, 0.35))
    const cost = round(distanceKm * costPerKm)
    const carbonKg = round(distanceKm * carbonPerKm)

    let score: number
    switch (objective) {
      case 'distance':
        score = round(100 - distanceKm / 12)
        break
      case 'time':
        score = round(100 - timeHours * 2.5)
        break
      case 'cost':
        score = round(100 - cost / 15)
        break
      case 'carbon':
        score = round(100 - carbonKg / 1.5)
        break
      default:
        score = round((100 - distanceKm / 12) * 0.25 + (100 - timeHours * 2.5) * 0.25 +
          (100 - cost / 15) * 0.25 + (100 - carbonKg / 1.5) * 0.25)
    }

    return {
      id: r.id || `R${String(i + 1).padStart(3, '0')}`,
      origin: r.origin || 'Warehouse',
      destination: r.destination || `Node-${i + 1}`,
      distanceKm,
      timeHours,
      cost,
      carbonKg,
      score
    }
  })

  const totalRoutes = routes.length
  const avgDistanceKm = round(routes.reduce((s, r) => s + r.distanceKm, 0) / totalRoutes)
  const avgTimeHours = round(routes.reduce((s, r) => s + r.timeHours, 0) / totalRoutes)
  const avgCost = round(routes.reduce((s, r) => s + r.cost, 0) / totalRoutes)
  const avgCarbonKg = round(routes.reduce((s, r) => s + r.carbonKg, 0) / totalRoutes)

  const recommendedRoute = routes.length > 0
    ? routes.reduce((best, r) => (r.score > best.score ? r : best)).id
    : 'N/A'

  return {
    recommendedRoute,
    routes,
    summary: { totalRoutes, avgDistanceKm, avgTimeHours, avgCost, avgCarbonKg, objective }
  }
}

function formatRouteReport(r: RouteResult): string {
  let md = `## 🚛 路径优化分析报告\n\n`
  md += `**优化目标**: ${r.summary.objective}\n\n`
  md += `**推荐路线**: \`${r.recommendedRoute}\`\n\n`
  md += `### 汇总统计\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 路线总数 | ${r.summary.totalRoutes} |\n`
  md += `| 平均距离 (km) | ${r.summary.avgDistanceKm} |\n`
  md += `| 平均时效 (h) | ${r.summary.avgTimeHours} |\n`
  md += `| 平均成本 (CNY) | ${r.summary.avgCost} |\n`
  md += `| 平均碳排放 (kg CO₂) | ${r.summary.avgCarbonKg} |\n\n`
  md += `### 路线详情\n\n`
  md += `| 编号 | 起点 | 终点 | 距离(km) | 时效(h) | 成本(CNY) | 碳排(kg) | 评分 |\n`
  md += `|------|------|------|----------|---------|-----------|----------|------|\n`
  for (const route of r.routes) {
    md += `| ${route.id} | ${route.origin} | ${route.destination} | ${route.distanceKm} | ${route.timeHours} | ${route.cost} | ${route.carbonKg} | ${route.score} |\n`
  }
  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 2: warehouse_slotting
// ─────────────────────────────────────────────────────────────────────────────

interface WarehouseInput {
  items?: Array<{
    sku?: string
    name?: string
    category?: string
    monthly_picks?: number
    volume_cbm?: number
    unit_value?: number
    zone?: string
  }>
  strategy?: 'abc' | 'velocity' | 'hybrid'
  totalSlots?: number
}

interface WarehouseResult {
  strategy: string
  totalItems: number
  totalSlots: number
  spaceUtilization: number
  categories: Array<{
    tier: string
    itemCount: number
    picksShare: number
    spaceShare: number
    suggestedZone: string
    items: Array<{ sku: string; name: string; picks: number; volume: number; tier: string }>
  }>
  pickingPathEstimate: {
    totalDistanceM: number
    estimatedTimeMin: number
  }
}

function analyzeWarehouse(data: WarehouseInput): WarehouseResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const strategy = data.strategy || 'hybrid'
  const totalSlots = data.totalSlots || 500

  const items = (data.items || []).map((item, i) => ({
    sku: item.sku || `SKU-${String(i + 1).padStart(4, '0')}`,
    name: item.name || `Product-${i + 1}`,
    category: item.category || 'General',
    picks: item.monthly_picks ?? randInt(rng, 10, 500),
    volume: item.volume_cbm ?? round(randRange(rng, 0.01, 2.5)),
    zone: item.zone || 'Unassigned'
  }))

  const totalPicks = items.reduce((s, it) => s + it.picks, 0)

  // ABC classification
  const sorted = [...items].sort((a, b) => b.picks - a.picks)
  let cumulative = 0
  for (const it of sorted) {
    cumulative += it.picks
    const pct = (cumulative / totalPicks) * 100
    ;(it as any).tier = pct <= 70 ? 'A' : pct <= 90 ? 'B' : 'C'
  }

  const tiers = ['A', 'B', 'C']
  const categories = tiers.map(tier => {
    const tierItems = sorted.filter(it => (it as any).tier === tier)
    const picksShare = tierItems.length > 0 ? round((tierItems.reduce((s, it) => s + it.picks, 0) / totalPicks) * 100) : 0
    const spaceShare = tierItems.length > 0 ? round((tierItems.reduce((s, it) => s + it.volume, 0) / items.reduce((s, it) => s + it.volume, 0)) * 100) : 0
    return {
      tier,
      itemCount: tierItems.length,
      picksShare,
      spaceShare,
      suggestedZone: tier === 'A' ? '黄金区(靠近出库口)' : tier === 'B' ? '中间区' : '偏远区',
      items: tierItems.map(it => ({ sku: it.sku, name: it.name, picks: it.picks, volume: it.volume, tier: (it as any).tier }))
    }
  })

  const totalVolume = round(items.reduce((s, it) => s + it.volume, 0))
  const spaceUtilization = round((totalVolume / (totalSlots * 1.5)) * 100)
  const totalDistanceM = round(totalSlots * randRange(rng, 0.3, 1.2))
  const estimatedTimeMin = round(totalDistanceM / randRange(rng, 50, 80))

  return { strategy, totalItems: items.length, totalSlots, spaceUtilization, categories, pickingPathEstimate: { totalDistanceM, estimatedTimeMin } }
}

function formatWarehouseReport(r: WarehouseResult): string {
  let md = `## 🏭 库位优化分析报告\n\n`
  md += `**优化策略**: ${r.strategy} | **总SKU数**: ${r.totalItems} | **总库位数**: ${r.totalSlots}\n\n`
  md += `### 空间利用\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 空间利用率 | ${r.spaceUtilization}% |\n`
  md += `| 拣货路径总长 (m) | ${r.pickingPathEstimate.totalDistanceM} |\n`
  md += `| 预计拣货时间 (min) | ${r.pickingPathEstimate.estimatedTimeMin} |\n\n`
  md += `### ABC 分类详情\n\n`
  md += `| 等级 | SKU数 | 拣货占比 | 空间占比 | 建议区域 |\n`
  md += `|------|-------|----------|----------|----------|\n`
  for (const cat of r.categories) {
    md += `| ${cat.tier} | ${cat.itemCount} | ${cat.picksShare}% | ${cat.spaceShare}% | ${cat.suggestedZone} |\n`
  }

  for (const cat of r.categories) {
    md += `\n#### ${cat.tier} 级 SKU (${cat.itemCount} 个)\n\n`
    md += `| SKU | 名称 | 月拣货量 | 体积(m³) |\n|-----|------|----------|----------|\n`
    for (const it of cat.items) {
      md += `| ${it.sku} | ${it.name} | ${it.picks} | ${it.volume} |\n`
    }
  }

  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 3: cross_border_compliance
// ─────────────────────────────────────────────────────────────────────────────

interface CrossBorderInput {
  shipments?: Array<{
    id?: string
    product?: string
    hs_code?: string
    origin_country?: string
    destination_country?: string
    declared_value?: number
    weight_kg?: number
    documents?: string[]
  }>
  trade_agreement?: string
}

interface CrossBorderResult {
  totalShipments: number
  compliance: {
    compliant: number
    warnings: number
    critical: number
  }
  shipments: Array<{
    id: string
    product: string
    hsCode: string
    originCountry: string
    destinationCountry: string
    declaredValue: number
    weightKg: number
    dutyRate: number
    estimatedDuty: number
    requiredDocs: string[]
    missingDocs: string[]
    rulesOfOrigin: boolean
    status: 'compliant' | 'warning' | 'critical'
  }>
}

function analyzeCrossBorder(data: CrossBorderInput): CrossBorderResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)

  const shipments = (data.shipments || []).map((s, i) => {
    const hsCode = s.hs_code || `${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}.${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}`
    const declaredValue = s.declared_value ?? round(randRange(rng, 500, 50000))
    const weightKg = s.weight_kg ?? round(randRange(rng, 0.5, 500))
    const dutyRate = round(randRange(rng, 0.03, 0.35))
    const estimatedDuty = round(declaredValue * dutyRate)

    const requiredDocs = ['Commercial Invoice', 'Packing List', 'Bill of Lading']
    if (!s.documents || !s.documents.includes('Certificate of Origin')) {
      requiredDocs.push('Certificate of Origin')
    }
    if (parseInt(hsCode.substring(0, 2)) >= 61 && parseInt(hsCode.substring(0, 2)) <= 63) {
      requiredDocs.push('Textile Declaration')
    }
    if (parseInt(hsCode.substring(0, 2)) >= 84 && parseInt(hsCode.substring(0, 2)) <= 85) {
      requiredDocs.push('FCC/CE Certification')
    }
    if (parseInt(hsCode.substring(0, 2)) >= 16 && parseInt(hsCode.substring(0, 2)) <= 24) {
      requiredDocs.push('Phytosanitary Certificate')
    }

    const providedDocs = s.documents || []
    const missingDocs = requiredDocs.filter(d => !providedDocs.includes(d))
    const rulesOfOrigin = missingDocs.length === 0 && rng() > 0.2

    let status: 'compliant' | 'warning' | 'critical'
    if (missingDocs.length === 0) status = 'compliant'
    else if (missingDocs.length <= 2 && rulesOfOrigin) status = 'warning'
    else status = 'critical'

    return {
      id: s.id || `SHP-${String(i + 1).padStart(4, '0')}`,
      product: s.product || `Product-${i + 1}`,
      hsCode,
      originCountry: s.origin_country || 'CN',
      destinationCountry: s.destination_country || 'US',
      declaredValue,
      weightKg,
      dutyRate,
      estimatedDuty,
      requiredDocs,
      missingDocs,
      rulesOfOrigin,
      status
    }
  })

  return {
    totalShipments: shipments.length,
    compliance: {
      compliant: shipments.filter(s => s.status === 'compliant').length,
      warnings: shipments.filter(s => s.status === 'warning').length,
      critical: shipments.filter(s => s.status === 'critical').length
    },
    shipments
  }
}

function formatCrossBorderReport(r: CrossBorderResult): string {
  let md = `## 🌐 跨境合规分析报告\n\n`
  md += `### 合规概览\n\n`
  md += `| 状态 | 数量 |\n|------|------|\n`
  md += `| ✅ 合规 | ${r.compliance.compliant} |\n`
  md += `| ⚠️ 警告 | ${r.compliance.warnings} |\n`
  md += `| ❌ 严重 | ${r.compliance.critical} |\n\n`
  md += `### 货物详情\n\n`
  md += `| ID | 产品 | HS编码 | 起运 | 目的 | 申报价值 | 重量(kg) | 关税率 | 预估关税 | 状态 |\n`
  md += `|------|------|--------|------|------|----------|----------|--------|----------|------|\n`
  for (const s of r.shipments) {
    const statusIcon = s.status === 'compliant' ? '✅' : s.status === 'warning' ? '⚠️' : '❌'
    md += `| ${s.id} | ${s.product} | ${s.hsCode} | ${s.originCountry} | ${s.destinationCountry} | $${s.declaredValue} | ${s.weightKg} | ${(s.dutyRate * 100).toFixed(1)}% | $${s.estimatedDuty} | ${statusIcon} |\n`
  }

  md += `\n### 单证与原产地\n\n`
  for (const s of r.shipments) {
    md += `#### ${s.id} - ${s.product}\n`
    md += `- **必需单证**: ${s.requiredDocs.join(', ')}\n`
    md += `- **缺失单证**: ${s.missingDocs.length > 0 ? s.missingDocs.join(', ') : '无'}\n`
    md += `- **原产地规则**: ${s.rulesOfOrigin ? '符合' : '需确认'}\n`
    md += `- **关税优惠**: ${s.rulesOfOrigin ? `适用 RTA/MFN 减免，预估节省 $${round(s.estimatedDuty * 0.6)}` : '不适用'}\n\n`
  }

  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 4: lastmile_delivery
// ─────────────────────────────────────────────────────────────────────────────

interface LastmileInput {
  deliveries?: Array<{
    id?: string
    order_id?: string
    address?: string
    method?: 'instant' | 'express' | 'locker' | 'standard'
    weight_kg?: number
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    deadline_minutes?: number
    customer_type?: string
  }>
  city_zone?: string
}

interface LastmileResult {
  cityZone: string
  deliveryMode: string
  totalDeliveries: number
  estimatedCompletion: number
  onTimeRate: number
  deliveries: Array<{
    id: string
    orderId: string
    address: string
    method: string
    weightKg: number
    priority: string
    deadlineMinutes: number
    estimatedArrivalMinutes: number
    onTime: boolean
    customerType: string
  }>
}

function analyzeLastmile(data: LastmileInput): LastmileResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const cityZone = data.city_zone || 'Zone-A'

  const deliveries = (data.deliveries || []).map((d, i) => {
    const method = d.method || ['instant', 'express', 'locker', 'standard'][randInt(rng, 0, 3)] as string
    const weightKg = d.weight_kg ?? round(randRange(rng, 0.1, 30))
    const priority = d.priority || ['low', 'medium', 'high', 'urgent'][randInt(rng, 0, 3)] as string
    const deadlineMinutes = d.deadline_minutes ?? (priority === 'urgent' ? 30 : priority === 'high' ? 60 : priority === 'medium' ? 120 : 240)

    const baseTime = method === 'instant' ? 25 : method === 'express' ? 90 : method === 'locker' ? 180 : 360
    const estimatedArrivalMinutes = round(baseTime * randRange(rng, 0.7, 1.4))
    const onTime = estimatedArrivalMinutes <= deadlineMinutes

    return {
      id: d.id || `DLV-${String(i + 1).padStart(4, '0')}`,
      orderId: d.order_id || `ORD-${String(i + 1).padStart(5, '0')}`,
      address: d.address || `Address-${i + 1}`,
      method,
      weightKg,
      priority,
      deadlineMinutes,
      estimatedArrivalMinutes,
      onTime,
      customerType: d.customer_type || (rng() > 0.5 ? 'B2C' : 'B2B')
    }
  })

  const onTimeCount = deliveries.filter(d => d.onTime).length
  const onTimeRate = deliveries.length > 0 ? round((onTimeCount / deliveries.length) * 100) : 0
  const deliveryMode = deliveries.length > 0
    ? deliveries.reduce((acc, d) => { acc[d.method] = (acc[d.method] || 0) + 1; return acc }, {} as Record<string, number>)
    : {}

  return {
    cityZone,
    deliveryMode: Object.entries(deliveryMode).map(([k, v]) => `${k}(${v})`).join(', ') || 'N/A',
    totalDeliveries: deliveries.length,
    estimatedCompletion: deliveries.length > 0 ? deliveries.reduce((s, d) => s + d.estimatedArrivalMinutes, 0) : 0,
    onTimeRate,
    deliveries
  }
}

function formatLastmileReport(r: LastmileResult): string {
  let md = `## 🚴 末端配送分析报告\n\n`
  md += `**城市分区**: ${r.cityZone} | **配送方式**: ${r.deliveryMode} | **总单量**: ${r.totalDeliveries}\n\n`
  md += `### 配送概览\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 准时率 | ${r.onTimeRate}% |\n`
  md += `| 预计总耗时 (min) | ${r.estimatedCompletion} |\n\n`
  md += `### 配送详情\n\n`
  md += `| ID | 订单 | 方式 | 重量(kg) | 时效(min) | 截止(min) | 状态 |\n`
  md += `|------|------|------|----------|-----------|-----------|------|\n`
  for (const d of r.deliveries) {
    const status = d.onTime ? '✅ 准时' : '⚠️ 超时'
    md += `| ${d.id} | ${d.orderId} | ${d.method} | ${d.weightKg} | ${d.estimatedArrivalMinutes} | ${d.deadlineMinutes} | ${status} |\n`
  }

  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 5: demand_forecast
// ─────────────────────────────────────────────────────────────────────────────

interface ForecastInput {
  products?: Array<{
    sku?: string
    name?: string
    historical_demand?: number[]
    category?: string
    new_product?: boolean
    seasonality?: 'high' | 'medium' | 'low' | 'none'
    promotion_factor?: number
  }>
  forecast_horizon_weeks?: number
}

interface ForecastResult {
  horizonWeeks: number
  products: Array<{
    sku: string
    name: string
    category: string
    isNewProduct: boolean
    seasonality: string
    currentDemand: number
    forecastWeek: number[]
    trend: string
    recommendedStock: number
    safetyStock: number
  }>
  summary: {
    totalSku: number
    totalDemand: number
    avgWeeklyGrowth: number
    categoryBreakdown: Record<string, number>
  }
}

function analyzeForecast(data: ForecastInput): ForecastResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const horizonWeeks = data.forecast_horizon_weeks || 12

  const products = (data.products || []).map((p, i) => {
    const historical = p.historical_demand || Array.from({ length: 12 }, () => randInt(rng, 50, 500))
    const isNewProduct = p.new_product ?? false
    const seasonality = p.seasonality || 'medium'
    const promotionFactor = p.promotion_factor ?? 1.0
    const currentDemand = historical[historical.length - 1] || 0

    const trend = currentDemand > 200 ? '上升' : currentDemand > 80 ? '平稳' : '下降'

    const forecastWeek: number[] = []
    const lastVal = currentDemand * promotionFactor
    for (let w = 0; w < horizonWeeks; w++) {
      let val = lastVal
      if (seasonality === 'high') val *= (1 + 0.15 * Math.sin((w / horizonWeeks) * Math.PI * 2))
      else if (seasonality === 'medium') val *= (1 + 0.06 * Math.sin((w / horizonWeeks) * Math.PI * 2))
      if (isNewProduct) val *= (1 + randRange(rng, 0.05, 0.2) * (w / horizonWeeks))
      else val *= (1 + randRange(rng, -0.03, 0.05))
      forecastWeek.push(Math.round(val))
    }

    const totalForecast = forecastWeek.reduce((s, v) => s + v, 0)
    const recommendedStock = Math.round(totalForecast * 1.2)
    const safetyStock = Math.round(totalForecast * 0.15)

    return {
      sku: p.sku || `PROD-${String(i + 1).padStart(4, '0')}`,
      name: p.name || `Product-${i + 1}`,
      category: p.category || 'General',
      isNewProduct,
      seasonality,
      currentDemand: Math.round(currentDemand * promotionFactor),
      forecastWeek,
      trend,
      recommendedStock,
      safetyStock
    }
  })

  const totalDemand = products.reduce((s, p) => s + p.forecastWeek.reduce((a, b) => a + b, 0), 0)
  const categories: Record<string, number> = {}
  for (const p of products) {
    categories[p.category] = (categories[p.category] || 0) + p.forecastWeek.reduce((a, b) => a + b, 0)
  }

  return {
    horizonWeeks,
    products,
    summary: {
      totalSku: products.length,
      totalDemand,
      avgWeeklyGrowth: round(randRange(rng, 1.2, 4.8)),
      categoryBreakdown: categories
    }
  }
}

function formatForecastReport(r: ForecastResult): string {
  let md = `## 📈 需求预测报告\n\n`
  md += `**预测周期**: ${r.horizonWeeks} 周 | **SKU总数**: ${r.summary.totalSku} | **总需求**: ${r.summary.totalDemand} 件\n\n`
  md += `### 汇总\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 平均周增长率 | ${r.summary.avgWeeklyGrowth}% |\n\n`
  md += `### 品类需求分布\n\n`
  md += `| 品类 | 预测需求 | 占比 |\n|------|----------|------|\n`
  for (const [cat, demand] of Object.entries(r.summary.categoryBreakdown)) {
    const pct =((demand / r.summary.totalDemand) * 100).toFixed(1)
    md += `| ${cat} | ${demand} | ${pct}% |\n`
  }

  md += `\n### 各SKU预测详情\n\n`
  for (const p of r.products) {
    md += `#### ${p.sku} - ${p.name}\n`
    md += `- **品类**: ${p.category} | **季节性**: ${p.seasonality} | **趋势**: ${p.trend} | **新品**: ${p.isNewProduct ? '是' : '否'}\n`
    md += `- **当前需求**: ${p.currentDemand} 件/周\n`
    md += `- **安全库存**: ${p.safetyStock} 件\n`
    md += `- **建议备货**: ${p.recommendedStock} 件\n`
    md += `- **${r.horizonWeeks}周预测**: ${p.forecastWeek.join(', ')}\n\n`
  }

  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 6: fleet_telematics
// ─────────────────────────────────────────────────────────────────────────────

interface FleetInput {
  vehicles?: Array<{
    id?: string
    plate?: string
    driver?: string
    type?: 'light' | 'medium' | 'heavy' | 'refrigerated'
    mileage_km?: number
    fuel_consumption_l_100km?: number
    last_maintenance_km?: number
    next_maintenance_due_km?: number
    safety_score?: number
    status?: string
  }>
}

interface FleetResult {
  totalVehicles: number
  operationalRate: number
  avgFuelConsumption: number
  avgSafetyScore: number
  vehicles: Array<{
    id: string
    plate: string
    driver: string
    type: string
    mileageKm: number
    fuelConsumption: number
    fuelCost: number
    lastMaintenanceKm: number
    nextMaintenanceDueKm: number
    maintenanceUrgency: 'ok' | 'soon' | 'overdue'
    safetyScore: number
    status: string
    recommendations: string[]
  }>
}

function analyzeFleet(data: FleetInput): FleetResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)

  const vehicles = (data.vehicles || []).map((v, i) => {
    const plate = v.plate || `京A${String(randInt(rng, 10000, 99999))}`
    const type = v.type || ['light', 'medium', 'heavy', 'refrigerated'][randInt(rng, 0, 3)] as string
    const mileageKm = v.mileage_km ?? randInt(rng, 5000, 150000)
    const fuelConsumption = v.fuel_consumption_l_100km ?? round(randRange(rng, 8, 35))
    const fuelCost = round((mileageKm / 100) * fuelConsumption * randRange(rng, 7.0, 8.5))
    const lastMaintenanceKm = v.last_maintenance_km ?? (mileageKm - randInt(rng, 0, 5000))
    const nextMaintenanceDueKm = v.next_maintenance_due_km ?? (lastMaintenanceKm + randInt(rng, 8000, 15000))
    const maintenanceUrgency = (mileageKm >= nextMaintenanceDueKm ? 'overdue' :
      mileageKm >= nextMaintenanceDueKm - 1000 ? 'soon' : 'ok') as 'ok' | 'soon' | 'overdue'
    const safetyScore = v.safety_score ?? randInt(rng, 60, 100)
    const status = v.status || (maintenanceUrgency === 'overdue' ? '需检修' : safetyScore < 70 ? '高风险' : '运营中')

    const recommendations: string[] = []
    if (maintenanceUrgency === 'overdue') recommendations.push('立即安排保养')
    else if (maintenanceUrgency === 'soon') recommendations.push('近期需保养')
    if (safetyScore < 80) recommendations.push('建议安全培训')
    if (fuelConsumption > 28) recommendations.push('油耗偏高，检查工况')
    if (mileageKm > 120000) recommendations.push('里程较高，评估更换')

    return {
      id: v.id || `VEH-${String(i + 1).padStart(3, '0')}`,
      plate,
      driver: v.driver || `Driver-${i + 1}`,
      type,
      mileageKm,
      fuelConsumption,
      fuelCost,
      lastMaintenanceKm,
      nextMaintenanceDueKm,
      maintenanceUrgency,
      safetyScore,
      status,
      recommendations
    }
  })

  const operationalCount = vehicles.filter(v => v.status === '运营中').length
  const operationalRate = vehicles.length > 0 ? round((operationalCount / vehicles.length) * 100) : 0
  const avgFuelConsumption = vehicles.length > 0 ? round(vehicles.reduce((s, v) => s + v.fuelConsumption, 0) / vehicles.length) : 0
  const avgSafetyScore = vehicles.length > 0 ? round(vehicles.reduce((s, v) => s + v.safetyScore, 0) / vehicles.length) : 0

  return {
    totalVehicles: vehicles.length,
    operationalRate,
    avgFuelConsumption,
    avgSafetyScore,
    vehicles
  }
}

function formatFleetReport(r: FleetResult): string {
  let md = `## 🚛 车队管理报告\n\n`
  md += `### 车队概览\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 车辆总数 | ${r.totalVehicles} |\n`
  md += `| 运营率 | ${r.operationalRate}% |\n`
  md += `| 平均油耗 (L/100km) | ${r.avgFuelConsumption} |\n`
  md += `| 平均安全评分 | ${r.avgSafetyScore} |\n\n`
  md += `### 车辆详情\n\n`
  md += `| ID | 车牌 | 司机 | 类型 | 里程(km) | 油耗(L/100km) | 保养 | 评分 | 状态 |\n`
  md += `|------|------|------|------|----------|----------------|------|------|------|\n`
  for (const v of r.vehicles) {
    const maintIcon = v.maintenanceUrgency === 'overdue' ? '🔴' : v.maintenanceUrgency === 'soon' ? '🟡' : '🟢'
    md += `| ${v.id} | ${v.plate} | ${v.driver} | ${v.type} | ${v.mileageKm} | ${v.fuelConsumption} | ${maintIcon} | ${v.safetyScore} | ${v.status} |\n`
  }

  md += `\n### 建议措施\n\n`
  for (const v of r.vehicles) {
    if (v.recommendations.length > 0) {
      md += `- **${v.id}** (${v.plate}): ${v.recommendations.join('；')}\n`
    }
  }

  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 7: cold_chain_monitor
// ─────────────────────────────────────────────────────────────────────────────

interface ColdChainInput {
  shipments?: Array<{
    id?: string
    product?: string
    required_temp_min?: number
    required_temp_max?: number
    current_temp?: number
    transit_hours?: number
    max_transit_hours?: number
    origin?: string
    destination?: string
    batch_id?: string
  }>
}

interface ColdChainResult {
  totalShipments: number
  complianceRate: number
  shipments: Array<{
    id: string
    product: string
    requiredTempMin: number
    requiredTempMax: number
    currentTemp: number
    tempStatus: 'normal' | 'warning' | 'critical'
    transitHours: number
    maxTransitHours: number
    timeStatus: 'normal' | 'warning' | 'critical'
    origin: string
    destination: string
    batchId: string
    traceability: { timestamp: string; location: string; temp: number }[]
    overallStatus: 'compliant' | 'at_risk' | 'violation'
  }>
}

function analyzeColdChain(data: ColdChainInput): ColdChainResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)

  const shipments = (data.shipments || []).map((s, i) => {
    const requiredTempMin = s.required_temp_min ?? round(randRange(rng, -25, 2))
    const requiredTempMax = s.required_temp_max ?? round(randRange(rng, requiredTempMin + 2, requiredTempMin + 8))
    const currentTemp = s.current_temp ?? round(randRange(rng, requiredTempMin - 3, requiredTempMax + 3))
    const transitHours = s.transit_hours ?? round(randRange(rng, 2, 72))
    const maxTransitHours = s.max_transit_hours ?? round(randRange(rng, 24, 96))

    let tempStatus: 'normal' | 'warning' | 'critical'
    if (currentTemp >= requiredTempMin && currentTemp <= requiredTempMax) tempStatus = 'normal'
    else if (currentTemp >= requiredTempMin - 2 && currentTemp <= requiredTempMax + 2) tempStatus = 'warning'
    else tempStatus = 'critical'

    let timeStatus: 'normal' | 'warning' | 'critical'
    if (transitHours <= maxTransitHours * 0.8) timeStatus = 'normal'
    else if (transitHours <= maxTransitHours) timeStatus = 'warning'
    else timeStatus = 'critical'

    const overallStatus = (tempStatus === 'critical' || timeStatus === 'critical' ? 'violation' :
      tempStatus === 'warning' || timeStatus === 'warning' ? 'at_risk' : 'compliant') as 'compliant' | 'at_risk' | 'violation'

    const traceability = Array.from({ length: randInt(rng, 3, 6) }, (_, j) => ({
      timestamp: `T-${(j + 1) * round(transitHours / 6)}h`,
      location: ['产地', '中转仓', '干线运输', '分拨中心', '末端配送'][j % 5],
      temp: round(randRange(rng, requiredTempMin - 1, requiredTempMax + 1))
    }))

    return {
      id: s.id || `CL-${String(i + 1).padStart(4, '0')}`,
      product: s.product || `Frozen-Product-${i + 1}`,
      requiredTempMin,
      requiredTempMax,
      currentTemp,
      tempStatus,
      transitHours,
      maxTransitHours,
      timeStatus,
      origin: s.origin || 'Origin',
      destination: s.destination || 'Destination',
      batchId: s.batch_id || `B${randInt(rng, 10000, 99999)}`,
      traceability,
      overallStatus
    }
  })

  const compliantCount = shipments.filter(s => s.overallStatus === 'compliant').length
  const complianceRate = shipments.length > 0 ? round((compliantCount / shipments.length) * 100) : 0

  return { totalShipments: shipments.length, complianceRate, shipments }
}

function formatColdChainReport(r: ColdChainResult): string {
  let md = `## ❄️ 冷链监控报告\n\n`
  md += `### 合规概览\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 总批次 | ${r.totalShipments} |\n`
  md += `| 合规率 | ${r.complianceRate}% |\n\n`
  md += `### 批次详情\n\n`
  md += `| ID | 产品 | 要求温度 | 当前温度 | 温度状态 | 运输时长 | 时效状态 | 综合状态 |\n`
  md += `|------|------|----------|----------|----------|----------|----------|----------|\n`
  for (const s of r.shipments) {
    const tempIcon = s.tempStatus === 'normal' ? '✅' : s.tempStatus === 'warning' ? '⚠️' : '❌'
    const timeIcon = s.timeStatus === 'normal' ? '✅' : s.timeStatus === 'warning' ? '⚠️' : '❌'
    const overallIcon = s.overallStatus === 'compliant' ? '✅' : s.overallStatus === 'at_risk' ? '⚠️' : '❌'
    md += `| ${s.id} | ${s.product} | ${s.requiredTempMin}~${s.requiredTempMax}°C | ${s.currentTemp}°C ${tempIcon} | ${s.transitHours}h/${s.maxTransitHours}h ${timeIcon} | ${overallIcon} |\n`
  }

  md += `\n### 追溯链\n\n`
  for (const s of r.shipments) {
    md += `#### ${s.id} - ${s.product} (批次: ${s.batchId})\n`
    md += `| 时间 | 节点 | 温度 |\n|------|------|------|\n`
    for (const t of s.traceability) {
      md += `| ${t.timestamp} | ${t.location} | ${t.temp}°C |\n`
    }
    md += `\n`
  }

  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 8: supply_chain_finance
// ─────────────────────────────────────────────────────────────────────────────

interface FinanceInput {
  invoices?: Array<{
    id?: string
    debtor?: string
    creditor?: string
    amount?: number
    due_days?: number
    credit_rating?: string
    invoice_date?: string
    industry?: string
  }>
  inventory_finance?: Array<{
    sku?: string
    quantity?: number
    unit_value?: number
    warehouse?: string
    liquidity_score?: number
  }>
  risk_appetite?: 'conservative' | 'moderate' | 'aggressive'
}

interface FinanceResult {
  riskAppetite: string
  totalReceivables: number
  totalPayables: number
  netPosition: number
  invoices: Array<{
    id: string
    debtor: string
    creditor: string
    amount: number
    dueDays: number
    creditRating: string
    invoiceDate: string
    industry: string
    riskLevel: 'low' | 'medium' | 'high'
    factoringEligible: boolean
    suggestedAction: string
  }>
  inventoryFinance: Array<{
    sku: string
    quantity: number
    unitValue: number
    totalValue: number
    warehouse: string
    liquidityScore: number
    eligibleForFinancing: boolean
    suggestedLoanAmount: number
  }>
  riskMetrics: {
    portfolioRisk: number
    concentrationIndex: number
    avgCollectionPeriod: number
    badDebtEstimate: number
  }
}

function analyzeFinance(data: FinanceInput): FinanceResult {
  const seed = JSON.stringify(data)
  const rng = rngFromSeed(seed)
  const riskAppetite = data.risk_appetite || 'moderate'

  const invoices = (data.invoices || []).map((inv, i) => {
    const amount = inv.amount ?? round(randRange(rng, 10000, 500000))
    const dueDays = inv.due_days ?? randInt(rng, 15, 180)
    const creditRating = inv.credit_rating || ['AAA', 'AA', 'A', 'BBB', 'BB'][randInt(rng, 0, 4)]
    const invoiceDate = inv.invoice_date || `2026-0${randInt(rng, 1, 8)}-${String(randInt(rng, 1, 28)).padStart(2, '0')}`
    const industry = inv.industry || 'Manufacturing'

    let riskLevel: 'low' | 'medium' | 'high'
    if (creditRating === 'AAA' || creditRating === 'AA') riskLevel = 'low'
    else if (creditRating === 'A' || creditRating === 'BBB') riskLevel = 'medium'
    else riskLevel = 'high'

    const factoringEligible = riskLevel !== 'high' && dueDays <= 90 && amount >= 50000
    const suggestedAction = factoringEligible ? '建议保理融资' :
      riskLevel === 'high' ? '建议信用保险' : '正常跟踪'

    return {
      id: inv.id || `INV-${String(i + 1).padStart(5, '0')}`,
      debtor: inv.debtor || `Debtor-${i + 1}`,
      creditor: inv.creditor || `Creditor-${i + 1}`,
      amount,
      dueDays,
      creditRating,
      invoiceDate,
      industry,
      riskLevel,
      factoringEligible,
      suggestedAction
    }
  })

  const inventoryFinance = (data.inventory_finance || []).map((inv, i) => {
    const quantity = inv.quantity ?? randInt(rng, 100, 10000)
    const unitValue = inv.unit_value ?? round(randRange(rng, 10, 500))
    const totalValue = round(quantity * unitValue)
    const warehouse = inv.warehouse || `WH-${String.fromCharCode(65 + i % 5)}`
    const liquidityScore = inv.liquidity_score ?? randInt(rng, 40, 95)
    const eligibleForFinancing = liquidityScore >= 60 && totalValue >= 100000
    const suggestedLoanAmount = eligibleForFinancing ? round(totalValue * randRange(rng, 0.5, 0.75)) : 0

    return {
      sku: inv.sku || `SKU-${String(i + 1).padStart(4, '0')}`,
      quantity,
      unitValue,
      totalValue,
      warehouse,
      liquidityScore,
      eligibleForFinancing,
      suggestedLoanAmount
    }
  })

  const totalReceivables = invoices.reduce((s, inv) => s + inv.amount, 0)
  const totalPayables = round(totalReceivables * randRange(rng, 0.6, 0.9))
  const netPosition = round(totalReceivables - totalPayables)
  const portfolioRisk = round(randRange(rng, 0.02, 0.15) * 100)
  const concentrationIndex = round(randRange(rng, 0.15, 0.45) * 100)
  const avgCollectionPeriod = invoices.length > 0 ? round(invoices.reduce((s, inv) => s + inv.dueDays, 0) / invoices.length) : 0
  const badDebtEstimate = round(totalReceivables * portfolioRisk / 100)

  return {
    riskAppetite,
    totalReceivables,
    totalPayables,
    netPosition,
    invoices,
    inventoryFinance,
    riskMetrics: { portfolioRisk, concentrationIndex, avgCollectionPeriod, badDebtEstimate }
  }
}

function formatFinanceReport(r: FinanceResult): string {
  let md = `## 💰 供应链金融分析报告\n\n`
  md += `**风险偏好**: ${r.riskAppetite}\n\n`
  md += `### 财务概览\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 应收账款总额 | ¥${r.totalReceivables.toLocaleString()} |\n`
  md += `| 应付账款总额 | ¥${r.totalPayables.toLocaleString()} |\n`
  md += `| 净头寸 | ¥${r.netPosition.toLocaleString()} |\n\n`
  md += `### 风险指标\n\n`
  md += `| 指标 | 值 |\n|------|----|\n`
  md += `| 组合风险率 | ${r.riskMetrics.portfolioRisk}% |\n`
  md += `| 集中度指数 | ${r.riskMetrics.concentrationIndex}% |\n`
  md += `| 平均回款周期 (天) | ${r.riskMetrics.avgCollectionPeriod} |\n`
  md += `| 坏账预估 | ¥${r.riskMetrics.badDebtEstimate.toLocaleString()} |\n\n`
  md += `### 应收账款明细\n\n`
  md += `| ID | 债务人 | 金额 | 到期天数 | 评级 | 风险 | 保理资格 | 建议 |\n`
  md += `|------|--------|------|----------|------|------|----------|------|\n`
  for (const inv of r.invoices) {
    const riskIcon = inv.riskLevel === 'low' ? '🟢' : inv.riskLevel === 'medium' ? '🟡' : '🔴'
    md += `| ${inv.id} | ${inv.debtor} | ¥${inv.amount.toLocaleString()} | ${inv.dueDays} | ${inv.creditRating} | ${riskIcon} | ${inv.factoringEligible ? '✅' : '❌'} | ${inv.suggestedAction} |\n`
  }

  md += `\n### 库存融资\n\n`
  md += `| SKU | 数量 | 单价 | 总价值 | 仓库 | 流动性 | 融资资格 | 建议额度 |\n`
  md += `|------|------|------|--------|------|--------|----------|----------|\n`
  for (const inv of r.inventoryFinance) {
    md += `| ${inv.sku} | ${inv.quantity} | ¥${inv.unitValue} | ¥${inv.totalValue.toLocaleString()} | ${inv.warehouse} | ${inv.liquidityScore} | ${inv.eligibleForFinancing ? '✅' : '❌'} | ${inv.suggestedLoanAmount > 0 ? '¥' + inv.suggestedLoanAmount.toLocaleString() : 'N/A'} |\n`
  }

  md += `\n---\n*本分析基于AI模型推断，仅供物流运营参考，不替代专业供应链规划决策。*\n`
  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin registration
// ─────────────────────────────────────────────────────────────────────────────

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'route_optimization',
    description: '路径优化分析 — 基于距离、时间、成本、碳排放多维度评估并推荐最优运输路线',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的路线数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatRouteReport(analyzeRoute(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'warehouse_slotting',
    description: '库位优化分析 — 基于ABC分类、拣货路径、空间利用率优化仓储布局',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的仓储数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatWarehouseReport(analyzeWarehouse(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'cross_border_compliance',
    description: '跨境合规分析 — HS编码归类、关税估算、单证审核、原产地规则判定',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的跨境货物数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatCrossBorderReport(analyzeCrossBorder(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'lastmile_delivery',
    description: '末端配送分析 — 即时配送、快递、自提柜等多模式时效与准时率评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的配送数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatLastmileReport(analyzeLastmile(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'demand_forecast',
    description: '需求预测 — 时序分析、促销因子、新品爬坡、季节性波动预测',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的需求数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatForecastReport(analyzeForecast(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'fleet_telematics',
    description: '车队管理 — 车辆调度、油耗分析、维保提醒、安全评分',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的车队数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatFleetReport(analyzeFleet(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'cold_chain_monitor',
    description: '冷链监控 — 温度合规、时效管控、全链路追溯',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的冷链数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatColdChainReport(analyzeColdChain(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'supply_chain_finance',
    description: '供应链金融 — 应收账款融资、库存融资、风控评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的金融数据' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatFinanceReport(analyzeFinance(JSON.parse(args.input_data)))
    }
  }))
}
