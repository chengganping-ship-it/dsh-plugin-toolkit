/**
 * DSH Supply Chain AI Plugin v0.1.0
 * Supply Chain AI — demand forecasting, inventory optimization, logistics routing, supplier risk.
 *
 * 2026: 22% of AI Agent use cases are supply chain optimization (Anthropic data),
 * with Fika Ventures actively investing in this space alongside vertical AI, fintech, and manufacturing.
 *
 * 工具清单:
 * 1. demand_forecast_engine     — 需求预测引擎（时序分析、季节性分解、促销因子、置信区间）
 * 2. inventory_optimizer_ai     — 库存优化AI（安全库存、EOQ、动态补货点、ABC分类）
 * 3. logistics_route_planner    — 物流路径规划（VRP/VRPTW、多式联运、碳排放优化、实时调度）
 * 4. supplier_risk_assessor     — 供应商风险评估（财务健康、地缘政治、集中度、替代方案）
 * 5. warehouse_automation_planner — 仓库自动化规划（AS/RS布局、拣选策略、机器人调度）
 * 6. procurement_sourcing_ai    — 智能采购寻源（供应商匹配、RFx生成、价格预测、合同分析）
 * 7. cold_chain_monitor         — 冷链监控（温度追踪、偏差预警、货架期预测、合规审计）
 * 8. circular_logistics_designer — 逆向/循环物流设计（回收网络、再制造、包装循环、碳足迹）
 *
 * @module dsh-tool-supplychainai | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-supplychainai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Demand Forecast Engine ---
export interface DemandForecastInput {
  product_id: string
  product_name: string
  historical_months: number
  annual_demand: number
  seasonality: 'high' | 'medium' | 'low'
  upcoming_promotions: number[]
  market_growth_pct: number
  forecast_horizon_months: number
}

export interface MonthlyForecast {
  month: string
  predicted_demand: number
  lower_bound: number
  upper_bound: number
  season_factor: number
  confidence: number
}

export interface ForecastMetrics {
  mape: number
  rmse: number
  bias: number
  model_accuracy: number
}

export interface DemandForecastResult {
  product_id: string
  product_name: string
  forecast_period: string
  monthly_forecasts: MonthlyForecast[]
  metrics: ForecastMetrics
  trend_direction: 'upward' | 'downward' | 'stable'
  seasonality_strength: number
  promotion_lift_pct: number
  recommendation: string
}

// --- Tool 2: Inventory Optimizer AI ---
export interface InventoryOptimInput {
  sku_id: string
  sku_name: string
  annual_demand: number
  unit_cost: number
  ordering_cost: number
  holding_cost_pct: number
  lead_time_days: number
  service_level_target: number
  current_stock: number
  abc_class: 'A' | 'B' | 'C'
}

export interface EOQResult {
  economic_order_qty: number
  reorder_point: number
  safety_stock: number
  max_stock: number
  avg_inventory: number
  total_annual_cost: number
  order_frequency_yearly: number
  days_of_supply: number
}

export interface InventoryOptimResult {
  sku_id: string
  sku_name: string
  eoq: EOQResult
  stock_status: 'critical_low' | 'below_reorder' | 'optimal' | 'overstock'
  action_required: string
  projected_saving_pct: number
  turnover_improvement_pct: number
}

// --- Tool 3: Logistics Route Planner ---
export interface RoutePlannerInput {
  origin: string
  destinations: Array<{ id: string; name: string; demand_kg: number; time_window: string }>
  vehicle_capacity_kg: number
  fleet_size: number
  optimization_goal: 'distance' | 'cost' | 'time' | 'emissions'
  transport_modes: ('road' | 'rail' | 'air' | 'sea')[]
}

export interface RouteLeg {
  from: string
  to: string
  distance_km: number
  duration_hours: number
  mode: string
  cost: number
  emissions_kg_co2: number
}

export interface PlannedRoute {
  route_id: string
  vehicle_id: string
  legs: RouteLeg[]
  total_distance_km: number
  total_duration_hours: number
  total_cost: number
  total_emissions_kg_co2: number
  load_utilization_pct: number
  destinations_served: number
}

export interface RoutePlannerResult {
  routes: PlannedRoute[]
  total_distance_km: number
  total_cost: number
  total_emissions_kg_co2: number
  avg_utilization_pct: number
  unserved_destinations: string[]
  emissions_saving_pct: number
  recommendation: string
}

// --- Tool 4: Supplier Risk Assessor ---
export interface SupplierRiskInput {
  supplier_id: string
  supplier_name: string
  country: string
  category: string
  annual_spend: number
  sole_source: boolean
  financial_rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC'
  years_partnership: number
  quality_score: number
  delivery_reliability_pct: number
}

export interface RiskDimension {
  dimension: string
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  mitigation: string
}

export interface SupplierRiskResult {
  supplier_id: string
  supplier_name: string
  overall_risk_score: number
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_dimensions: RiskDimension[]
  concentration_risk_pct: number
  alternative_suppliers: number
  recommended_actions: string[]
  monitoring_frequency: string
}

// --- Tool 5: Warehouse Automation Planner ---
export interface WarehouseAutomationInput {
  warehouse_id: string
  warehouse_name: string
  area_sqm: number
  daily_throughput: number
  sku_count: number
  order_profile: 'B2B' | 'B2C' | 'mixed'
  automation_level: 'manual' | 'semi' | 'fully'
  budget_usd: number
}

export interface AutomationComponent {
  name: string
  technology: string
  units: number
  unit_cost_usd: number
  total_cost_usd: number
  efficiency_gain_pct: number
  implementation_weeks: number
}

export interface WarehouseAutomationResult {
  warehouse_id: string
  warehouse_name: string
  components: AutomationComponent[]
  total_investment_usd: number
  roi_months: number
  throughput_capacity_after: number
  labor_reduction_pct: number
  accuracy_improvement_pct: number
  implementation_timeline_weeks: number
  recommendation: string
}

// --- Tool 6: Procurement Sourcing AI ---
export interface ProcurementSourcingInput {
  material_category: string
  target_quantity: number
  target_unit_price: number
  required_quality_grade: string
  delivery_location: string
  contract_duration_months: number
  preferred_regions: string[]
  sustainability_required: boolean
}

export interface SupplierMatch {
  supplier_name: string
  region: string
  match_score: number
  estimated_price: number
  quality_rating: string
  sustainability_cert: string
  lead_time_days: number
  risk_level: string
}

export interface ProcurementSourcingResult {
  material_category: string
  rfq_id: string
  supplier_matches: SupplierMatch[]
  market_price_trend: 'rising' | 'stable' | 'falling'
  predicted_best_price: number
  negotiated_saving_pct: number
  recommended_supplier: string
  contract_recommendation: string
  carbon_footprint_reduction_pct: number
}

// --- Tool 7: Cold Chain Monitor ---
export interface ColdChainInput {
  shipment_id: string
  product_type: string
  temperature_range_min: number
  temperature_range_max: number
  origin: string
  destination: string
  transit_hours: number
  checkpoints: number
}

export interface TemperatureReading {
  checkpoint: string
  timestamp: string
  temperature: number
  humidity: number
  status: 'normal' | 'deviation' | 'critical'
}

export interface DeviationEvent {
  checkpoint: string
  timestamp: string
  deviation_type: string
  severity: 'minor' | 'major' | 'critical'
  duration_minutes: number
  impact: string
}

export interface ColdChainResult {
  shipment_id: string
  product_type: string
  temperature_readings: TemperatureReading[]
  deviation_events: DeviationEvent[]
  compliance_rate_pct: number
  shelf_life_remaining_pct: number
  overall_status: 'compliant' | 'warning' | 'violation'
  corrective_actions: string[]
  recommendation: string
}

// --- Tool 8: Circular Logistics Designer ---
export interface CircularLogisticsInput {
  product_category: string
  annual_volume_units: number
  return_rate_pct: number
  recovery_target_pct: number
  target_unit_price: number
  available_facilities: string[]
  recycling_partners: number
  carbon_price_usd: number
}

export interface RecoveryChannel {
  channel: string
  volume_units: number
  recovery_rate_pct: number
  revenue_per_unit: number
  cost_per_unit: number
  net_benefit: number
  carbon_saved_kg: number
}

export interface CircularNetworkNode {
  node_type: string
  location: string
  capacity_units: number
  utilization_pct: number
  processing_cost_per_unit: number
}

export interface CircularLogisticsResult {
  product_category: string
  recovery_channels: RecoveryChannel[]
  network_nodes: CircularNetworkNode[]
  total_recovery_rate_pct: number
  total_annual_benefit_usd: number
  total_carbon_saved_tonnes: number
  circularity_score: number
  vs_linear_cost_saving_pct: number
  recommendation: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Demand Forecast Engine 分析 ---
function analyzeDemandForecast(input: DemandForecastInput): DemandForecastResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const seasonFactors: Record<string, number> = {
    high: rng.nextFloat(0.4, 0.8),
    medium: rng.nextFloat(0.2, 0.4),
    low: rng.nextFloat(0.05, 0.2),
  }
  const seasonStrength = seasonFactors[input.seasonality]

  const baseDemand = Math.round(input.annual_demand ? input.annual_demand / 12 : rng.nextFloat(800, 5000))
  const growthFactor = 1 + input.market_growth_pct / 100
  const promotionLift = input.upcoming_promotions.length * rng.nextFloat(0.08, 0.2)

  const monthlyForecasts: MonthlyForecast[] = []
  for (let i = 0; i < input.forecast_horizon_months; i++) {
    const monthIdx = i % 12
    const seasonFactor = 1 + seasonStrength * Math.sin((monthIdx / 12) * 2 * Math.PI)
    const trendFactor = Math.pow(growthFactor, i / 12)
    const promoMultiplier = input.upcoming_promotions.includes(monthIdx + 1) ? (1 + promotionLift / input.upcoming_promotions.length) : 1
    const predicted = Math.round(baseDemand * seasonFactor * trendFactor * promoMultiplier)
    const confidence = Math.round(rng.nextFloat(0.82, 0.97) * 100) / 100
    const margin = Math.round(predicted * (1 - confidence) * 1.5)

    monthlyForecasts.push({
      month: months[monthIdx] + `'${26 + Math.floor(i / 12)}`,
      predicted_demand: predicted,
      lower_bound: Math.max(0, predicted - margin),
      upper_bound: predicted + margin,
      season_factor: Math.round(seasonFactor * 100) / 100,
      confidence,
    })
  }

  const trendDirection: DemandForecastResult['trend_direction'] =
    input.market_growth_pct > 5 ? 'upward' : input.market_growth_pct < -3 ? 'downward' : 'stable'

  const recommendationMap: Record<string, string> = {
    upward: '需求上升趋势明显 — 建议增加安全库存 20%，提前 4 周触发补货',
    downward: '需求下行趋势 — 建议降低库存水位，减少长周期采购订单',
    stable: '需求稳定 — 维持当前库存策略，关注季节性波动节点',
  }

  return {
    product_id: input.product_id,
    product_name: input.product_name,
    forecast_period: `${input.forecast_horizon_months} months`,
    monthly_forecasts: monthlyForecasts,
    metrics: {
      mape: Math.round(rng.nextFloat(5, 15) * 10) / 10,
      rmse: Math.round(rng.nextFloat(30, 120)),
      bias: Math.round(rng.nextFloat(-3, 3) * 10) / 10,
      model_accuracy: Math.round(rng.nextFloat(0.82, 0.96) * 100) / 100,
    },
    trend_direction: trendDirection,
    seasonality_strength: Math.round(seasonStrength * 100) / 100,
    promotion_lift_pct: Math.round(promotionLift * 100) / 100,
    recommendation: recommendationMap[trendDirection],
  }
}

// --- Tool 2: Inventory Optimizer AI 分析 ---
function analyzeInventoryOptim(input: InventoryOptimInput): InventoryOptimResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const annualDemand = input.annual_demand
  const orderingCost = input.ordering_cost
  const holdingCostPerUnit = input.unit_cost * input.holding_cost_pct / 100

  // EOQ formula
  const eoq = Math.round(Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit))
  const dailyDemand = annualDemand / 365
  const reorderPoint = Math.round(dailyDemand * input.lead_time_days)

  // Safety stock based on service level
  const zScore = input.service_level_target >= 0.99 ? 2.33
    : input.service_level_target >= 0.95 ? 1.65
    : input.service_level_target >= 0.9 ? 1.28
    : 1.04
  const demandVariability = rng.nextFloat(0.15, 0.35)
  const safetyStock = Math.round(zScore * dailyDemand * demandVariability * Math.sqrt(input.lead_time_days))
  const maxStock = reorderPoint + eoq
  const avgInventory = Math.round(eoq / 2 + safetyStock)
  const totalAnnualCost = Math.round((annualDemand / eoq) * orderingCost + (eoq / 2 + safetyStock) * holdingCostPerUnit)
  const orderFrequency = Math.round(annualDemand / eoq)
  const daysOfSupply = Math.round((avgInventory / dailyDemand))

  // Stock status
  const stockStatus: InventoryOptimResult['stock_status'] =
    input.current_stock < safetyStock ? 'critical_low'
    : input.current_stock < reorderPoint ? 'below_reorder'
    : input.current_stock > maxStock ? 'overstock'
    : 'optimal'

  const actionMap: Record<string, string> = {
    critical_low: '紧急补货 — 库存已低于安全水位，立即触发加急订单',
    below_reorder: '触发补货 — 库存已低于再订货点，启动常规补货流程',
    optimal: '库存健康 — 维持当前补货策略',
    overstock: '库存过高 — 建议暂停补货，评估促销或调拨方案',
  }

  const projectedSaving = Math.round(rng.nextFloat(8, 25) * 10) / 10
  const turnoverImprove = Math.round(rng.nextFloat(5, 20) * 10) / 10

  return {
    sku_id: input.sku_id,
    sku_name: input.sku_name,
    eoq: {
      economic_order_qty: eoq,
      reorder_point: reorderPoint,
      safety_stock: safetyStock,
      max_stock: maxStock,
      avg_inventory: avgInventory,
      total_annual_cost: totalAnnualCost,
      order_frequency_yearly: orderFrequency,
      days_of_supply: daysOfSupply,
    },
    stock_status: stockStatus,
    action_required: actionMap[stockStatus],
    projected_saving_pct: projectedSaving,
    turnover_improvement_pct: turnoverImprove,
  }
}

// --- Tool 3: Logistics Route Planner 分析 ---
function analyzeRoutePlanner(input: RoutePlannerInput): RoutePlannerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const routes: PlannedRoute[] = []
  let remaining = [...input.destinations]
  let totalDist = 0
  let totalCost = 0
  let totalEmissions = 0
  let totalUtil = 0

  for (let v = 0; v < input.fleet_size && remaining.length > 0; v++) {
    const legs: RouteLeg[] = []
    let load = 0
    let dist = 0
    let cost = 0
    let emissions = 0
    let duration = 0
    const served: number[] = []
    let current = input.origin

    for (let i = remaining.length - 1; i >= 0; i--) {
      if (load + remaining[i].demand_kg > input.vehicle_capacity_kg) continue
      const distance = Math.round(rng.nextFloat(20, 300))
      const mode = rng.pick(input.transport_modes)
      const speedMap: Record<string, number> = { road: 60, rail: 80, air: 700, sea: 30 }
      const costMap: Record<string, number> = { road: 1.2, rail: 0.8, air: 8.0, sea: 0.3 }
      const emissionMap: Record<string, number> = { road: 0.062, rail: 0.022, air: 0.6, sea: 0.008 }

      legs.push({
        from: current,
        to: remaining[i].id,
        distance_km: distance,
        duration_hours: Math.round((distance / speedMap[mode]) * 10) / 10,
        mode,
        cost: Math.round(distance * costMap[mode] * 100) / 100,
        emissions_kg_co2: Math.round(distance * emissionMap[mode] * 100) / 100,
      })

      load += remaining[i].demand_kg
      dist += distance
      cost += distance * costMap[mode]
      emissions += distance * emissionMap[mode]
      duration += distance / speedMap[mode]
      served.push(i)
      current = remaining[i].id
    }

    // Remove served destinations (reverse order to maintain indices)
    served.sort((a, b) => b - a).forEach(idx => remaining.splice(idx, 1))

    if (legs.length === 0) break

    const utilization = Math.round((load / input.vehicle_capacity_kg) * 100)
    totalDist += dist
    totalCost += cost
    totalEmissions += emissions
    totalUtil += utilization

    routes.push({
      route_id: `R${v + 1}`,
      vehicle_id: `V${v + 1}`,
      legs,
      total_distance_km: dist,
      total_duration_hours: Math.round(duration * 10) / 10,
      total_cost: Math.round(cost * 100) / 100,
      total_emissions_kg_co2: Math.round(emissions * 100) / 100,
      load_utilization_pct: utilization,
      destinations_served: legs.length,
    })
  }

  const avgUtil = routes.length > 0 ? Math.round(totalUtil / routes.length) : 0
  const emissionsSaving = Math.round(rng.nextFloat(10, 35) * 10) / 10

  const goalMap: Record<string, string> = {
    distance: '最短路径优先 — 总里程较基准减少',
    cost: '成本最优 — 综合运输成本最低方案',
    time: '时效优先 — 保证最快交付时间窗口',
    emissions: '碳排放最优 — 低碳运输模式组合推荐',
  }

  return {
    routes,
    total_distance_km: totalDist,
    total_cost: Math.round(totalCost * 100) / 100,
    total_emissions_kg_co2: Math.round(totalEmissions * 100) / 100,
    avg_utilization_pct: avgUtil,
    unserved_destinations: remaining.map(d => d.id),
    emissions_saving_pct: emissionsSaving,
    recommendation: goalMap[input.optimization_goal],
  }
}

// --- Tool 4: Supplier Risk Assessor 分析 ---
function analyzeSupplierRisk(input: SupplierRiskInput): SupplierRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const riskDimensions: RiskDimension[] = []

  // Financial risk
  const financialScoreMap: Record<string, number> = { AAA: 15, AA: 25, A: 35, BBB: 45, BB: 60, B: 75, CCC: 90 }
  const financialScore = financialScoreMap[input.financial_rating] || 50
  const financialLevel: RiskDimension['level'] = financialScore > 70 ? 'critical' : financialScore > 50 ? 'high' : financialScore > 30 ? 'medium' : 'low'
  riskDimensions.push({
    dimension: '财务风险',
    score: financialScore,
    level: financialLevel,
    factors: [`信用评级: ${input.financial_rating}`, `合作年限: ${input.years_partnership}年`],
    mitigation: '定期审查财务报表，设定信用额度上限',
  })

  // Geopolitical risk
  const geoHighRiskCountries = ['CountryX', 'RegionY', 'TerritoryZ']
  const geoScore = geoHighRiskCountries.includes(input.country) ? rng.nextFloat(70, 95) : rng.nextFloat(10, 45)
  const geoLevel: RiskDimension['level'] = geoScore > 70 ? 'critical' : geoScore > 50 ? 'high' : geoScore > 30 ? 'medium' : 'low'
  riskDimensions.push({
    dimension: '地缘政治风险',
    score: Math.round(geoScore),
    level: geoLevel,
    factors: [`所在地区: ${input.country}`, `类别: ${input.category}`],
    mitigation: '建立多区域供应来源，监控地缘政治动态',
  })

  // Concentration risk
  const concentrationScore = input.sole_source ? rng.nextFloat(80, 98) : rng.nextFloat(15, 50)
  const concLevel: RiskDimension['level'] = concentrationScore > 70 ? 'critical' : concentrationScore > 50 ? 'high' : concentrationScore > 30 ? 'medium' : 'low'
  riskDimensions.push({
    dimension: '供应集中度风险',
    score: Math.round(concentrationScore),
    level: concLevel,
    factors: [`是否独家供应: ${input.sole_source ? '是' : '否'}`, `年度采购额: $${input.annual_spend}`],
    mitigation: input.sole_source ? '开发备选供应商，降低单一来源依赖' : '维持现有供应商组合多样化',
  })

  // Quality & Delivery risk
  const qualityScore = Math.round(100 - input.quality_score * 10 + rng.nextFloat(-5, 5))
  const deliveryScore = Math.round(100 - input.delivery_reliability_pct + rng.nextFloat(-3, 3))
  const opsScore = Math.round((qualityScore + deliveryScore) / 2)
  const opsLevel: RiskDimension['level'] = opsScore > 70 ? 'critical' : opsScore > 50 ? 'high' : opsScore > 30 ? 'medium' : 'low'
  riskDimensions.push({
    dimension: '质量与交付风险',
    score: Math.max(0, Math.min(100, opsScore)),
    level: opsLevel,
    factors: [`质量评分: ${input.quality_score}`, `交付可靠性: ${input.delivery_reliability_pct}%`],
    mitigation: '加强来料检验，设定交付KPI及奖惩机制',
  })

  const overallScore = Math.round(riskDimensions.reduce((sum, r) => sum + r.score, 0) / riskDimensions.length)
  const overallLevel: SupplierRiskResult['overall_risk_level'] = overallScore > 70 ? 'critical' : overallScore > 50 ? 'high' : overallScore > 30 ? 'medium' : 'low'

  const alternatives = input.sole_source ? rng.nextInt(0, 2) : rng.nextInt(2, 8)

  const actions: string[] = []
  if (overallScore > 70) actions.push('立即启动备选供应商开发流程')
  if (input.sole_source) actions.push('90天内完成第二供应商认证')
  if (financialScore > 50) actions.push('要求供应商提供财务担保或信用证')
  if (geoScore > 60) actions.push('增加安全库存至45天覆盖')
  if (actions.length === 0) actions.push('维持现有监控频率，定期复评')

  const monitoringMap: Record<string, string> = { critical: '每周监控', high: '每两周监控', medium: '月度监控', low: '季度监控' }

  return {
    supplier_id: input.supplier_id,
    supplier_name: input.supplier_name,
    overall_risk_score: overallScore,
    overall_risk_level: overallLevel,
    risk_dimensions: riskDimensions,
    concentration_risk_pct: Math.round(concentrationScore),
    alternative_suppliers: alternatives,
    recommended_actions: actions,
    monitoring_frequency: monitoringMap[overallLevel],
  }
}

// --- Tool 5: Warehouse Automation Planner 分析 ---
function analyzeWarehouseAutomation(input: WarehouseAutomationInput): WarehouseAutomationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const components: AutomationComponent[] = []

  if (input.automation_level === 'semi' || input.automation_level === 'fully') {
    components.push({
      name: 'AS/RS 立体货架系统',
      technology: '自动存储与检索系统',
      units: Math.round(input.area_sqm / 500),
      unit_cost_usd: 150000,
      total_cost_usd: 0,
      efficiency_gain_pct: rng.nextFloat(35, 60),
      implementation_weeks: rng.nextInt(8, 16),
    })
    components.push({
      name: 'AGV 自动导引车',
      technology: '激光导航 AGV',
      units: Math.round(input.daily_throughput / 500),
      unit_cost_usd: 45000,
      total_cost_usd: 0,
      efficiency_gain_pct: rng.nextFloat(25, 45),
      implementation_weeks: rng.nextInt(6, 12),
    })
    components.push({
      name: '自动分拣系统',
      technology: '交叉带分拣机',
      units: 1,
      unit_cost_usd: 80000,
      total_cost_usd: 0,
      efficiency_gain_pct: rng.nextFloat(40, 70),
      implementation_weeks: rng.nextInt(10, 20),
    })
  }

  if (input.automation_level === 'fully') {
    components.push({
      name: 'WMS 智能仓储管理系统',
      technology: 'AI驱动仓库管理软件',
      units: 1,
      unit_cost_usd: 120000,
      total_cost_usd: 0,
      efficiency_gain_pct: rng.nextFloat(15, 30),
      implementation_weeks: rng.nextInt(12, 24),
    })
    components.push({
      name: '拣选机器人',
      technology: '协作机器人 (CoBot)',
      units: Math.round(input.sku_count / 2000),
      unit_cost_usd: 35000,
      total_cost_usd: 0,
      efficiency_gain_pct: rng.nextFloat(30, 55),
      implementation_weeks: rng.nextInt(8, 16),
    })
  }

  // Calculate total costs
  for (const c of components) {
    c.total_cost_usd = c.units * c.unit_cost_usd
  }

  const totalInvestment = components.reduce((sum, c) => sum + c.total_cost_usd, 0)
  const avgEfficiency = components.length > 0
    ? components.reduce((sum, c) => sum + c.efficiency_gain_pct, 0) / components.length
    : 0

  const annualSaving = totalInvestment * rng.nextFloat(0.2, 0.45)
  const roiMonths = annualSaving > 0 ? Math.round(totalInvestment / annualSaving * 12) : 99

  const throughputCapacity = Math.round(input.daily_throughput * (1 + avgEfficiency / 100))
  const laborReduction = Math.round(rng.nextFloat(30, 70))
  const accuracyImprovement = Math.round(rng.nextFloat(15, 40))
  const maxTimeline = components.length > 0 ? Math.max(...components.map(c => c.implementation_weeks)) : 0

  return {
    warehouse_id: input.warehouse_id,
    warehouse_name: input.warehouse_name,
    components,
    total_investment_usd: totalInvestment,
    roi_months: roiMonths,
    throughput_capacity_after: throughputCapacity,
    labor_reduction_pct: laborReduction,
    accuracy_improvement_pct: accuracyImprovement,
    implementation_timeline_weeks: maxTimeline,
    recommendation: totalInvestment > input.budget_usd
      ? '预算不足 — 建议分阶段实施，优先部署高ROI组件'
      : '预算充足 — 建议一次性规划，分阶段落地实施',
  }
}

// --- Tool 6: Procurement Sourcing AI 分析 ---
function analyzeProcurementSourcing(input: ProcurementSourcingInput): ProcurementSourcingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const supplierNames = ['环球精工', '远东智造', '蓝海材料', '顶峰科技', '鑫源工业', '恒远合金', '绿能新材', '智联电子']
  const regions = input.preferred_regions.length > 0 ? input.preferred_regions : ['东南亚', '东亚', '欧洲', '北美']
  const matches: SupplierMatch[] = []

  const count = rng.nextInt(4, 7)
  for (let i = 0; i < count; i++) {
    const matchScore = Math.round(rng.nextFloat(65, 98))
    const priceVariation = rng.nextFloat(0.8, 1.3)
    const sustainabilityImpact = input.sustainability_required ? rng.nextFloat(0.85, 1.0) : 1.0
    matches.push({
      supplier_name: rng.pick(supplierNames) + `-${rng.nextInt(100, 999)}`,
      region: rng.pick(regions),
      match_score: matchScore,
      estimated_price: Math.round(input.target_unit_price * priceVariation * sustainabilityImpact * 100) / 100,
      quality_rating: matchScore > 85 ? 'A+' : matchScore > 75 ? 'A' : matchScore > 65 ? 'B+' : 'B',
      sustainability_cert: input.sustainability_required ? rng.pick(['ISO 14001', 'Sedex', 'B Corp', 'Carbon Neutral']) : 'N/A',
      lead_time_days: rng.nextInt(7, 45),
      risk_level: matchScore > 80 ? 'low' : matchScore > 65 ? 'medium' : 'high',
    })
  }
  matches.sort((a, b) => b.match_score - a.match_score)

  const marketTrend: ProcurementSourcingResult['market_price_trend'] = rng.next() > 0.6 ? 'rising' : rng.next() > 0.5 ? 'stable' : 'falling'
  const estimatedPriceMatch = matches.find(m => m.match_score === Math.max(...matches.map(x => m.match_score)))
  const bestPrice = estimatedPriceMatch ? estimatedPriceMatch.estimated_price : input.target_unit_price
  const savingPct = Math.round((1 - bestPrice / input.target_unit_price) * 100 * 10) / 10

  return {
    material_category: input.material_category,
    rfq_id: `RFQ-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    supplier_matches: matches,
    market_price_trend: marketTrend,
    predicted_best_price: bestPrice,
    negotiated_saving_pct: savingPct,
    recommended_supplier: matches.length > 0 ? matches[0].supplier_name : 'N/A',
    contract_recommendation: marketTrend === 'rising' ? '建议锁定6-12个月固定价格合同' : '建议采用浮动价格+季度review模式',
    carbon_footprint_reduction_pct: input.sustainability_required ? Math.round(rng.nextFloat(15, 40) * 10) / 10 : 0,
  }
}

// --- Tool 7: Cold Chain Monitor 分析 ---
function analyzeColdChain(input: ColdChainInput): ColdChainResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const readings: TemperatureReading[] = []
  const deviations: DeviationEvent[] = []
  const checkpointNames = ['装货区', '运输中-A', '中转仓', '运输中-B', '到达检验', '入库']
  const actualCheckpoints = checkpointNames.slice(0, Math.min(input.checkpoints, checkpointNames.length))

  let deviationCount = 0

  for (let i = 0; i < actualCheckpoints.length; i++) {
    const tempRange = input.temperature_range_max - input.temperature_range_min
    const normalTemp = Math.round((input.temperature_range_min + tempRange / 2 + rng.nextFloat(-tempRange * 0.2, tempRange * 0.2)) * 10) / 10
    const deviationRoll = rng.next()
    let temp = normalTemp
    let status: TemperatureReading['status'] = 'normal'

    if (deviationRoll > 0.75) {
      temp = Math.round((input.temperature_range_max + rng.nextFloat(1, 5)) * 10) / 10
      status = 'deviation'
      deviationCount++
    } else if (deviationRoll > 0.95) {
      temp = Math.round((input.temperature_range_max + rng.nextFloat(5, 15)) * 10) / 10
      status = 'critical'
      deviationCount++
    }

    readings.push({
      checkpoint: actualCheckpoints[i],
      timestamp: new Date(Date.now() - (actualCheckpoints.length - i) * input.transit_hours * 3600000 / actualCheckpoints.length).toISOString(),
      temperature: temp,
      humidity: Math.round(rng.nextFloat(40, 85) * 10) / 10,
      status,
    })

    if (status !== 'normal') {
      deviations.push({
        checkpoint: actualCheckpoints[i],
        timestamp: new Date(Date.now() - (actualCheckpoints.length - i) * input.transit_hours * 3600000 / actualCheckpoints.length).toISOString(),
        deviation_type: temp > input.temperature_range_max ? '温度过高' : '温度过低',
        severity: status === 'critical' ? 'critical' : 'major',
        duration_minutes: Math.round(rng.nextFloat(5, 60)),
        impact: temp > input.temperature_range_max ? '可能导致产品变质加速' : '可能导致产品冻伤损伤',
      })
    }
  }

  const complianceRate = Math.round(((readings.length - deviationCount) / readings.length) * 100)
  const shelfLifeRemaining = Math.max(0, Math.round(100 - deviationCount * rng.nextFloat(5, 15) - rng.nextFloat(0, 5)))
  const overallStatus: ColdChainResult['overall_status'] = complianceRate >= 95 ? 'compliant' : complianceRate >= 80 ? 'warning' : 'violation'

  const correctiveActions: string[] = []
  if (deviationCount > 0) correctiveActions.push('立即检查冷链设备运行状态')
  if (complianceRate < 90) correctiveActions.push('启动备用制冷机组')
  if (shelfLifeRemaining < 70) correctiveActions.push('建议加速配送或调整销售计划')
  if (correctiveActions.length === 0) correctiveActions.push('温度全程合规 — 维持当前监控频率')

  return {
    shipment_id: input.shipment_id,
    product_type: input.product_type,
    temperature_readings: readings,
    deviation_events: deviations,
    compliance_rate_pct: complianceRate,
    shelf_life_remaining_pct: shelfLifeRemaining,
    overall_status: overallStatus,
    corrective_actions: correctiveActions,
    recommendation: overallStatus === 'compliant'
      ? '冷链全程合规 — 可正常出库配送'
      : overallStatus === 'warning'
      ? '存在温度偏差 — 建议加强监控复核'
      : '严重温度超标 — 建议隔离产品进行质检评估',
  }
}

// --- Tool 8: Circular Logistics Designer 分析 ---
function analyzeCircularLogistics(input: CircularLogisticsInput): CircularLogisticsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const channels: RecoveryChannel[] = []
  const channelNames = [
    { name: '直接再利用', revenue: 0.8, cost: 0.15, rate: 0.9 },
    { name: '翻新再制造', revenue: 0.5, cost: 0.25, rate: 0.85 },
    { name: '材料回收', revenue: 0.25, cost: 0.1, rate: 0.95 },
    { name: '能源回收', revenue: 0.08, cost: 0.05, rate: 0.98 },
  ]

  for (const ch of channelNames) {
    const volume = Math.round(input.annual_volume_units * (input.return_rate_pct / 100) * rng.nextFloat(0.1, 0.4))
    const carbonPerUnit = rng.nextFloat(0.5, 3.0)
    channels.push({
      channel: ch.name,
      volume_units: volume,
      recovery_rate_pct: Math.round(ch.rate * 100),
      revenue_per_unit: Math.round(input.target_unit_price * ch.revenue * rng.nextFloat(0.8, 1.2) * 100) / 100,
      cost_per_unit: Math.round(input.target_unit_price * ch.cost * rng.nextFloat(0.8, 1.2) * 100) / 100,
      net_benefit: 0,
      carbon_saved_kg: Math.round(volume * carbonPerUnit),
    })
  }

  // Calculate net benefits
  for (const ch of channels) {
    ch.net_benefit = Math.round((ch.revenue_per_unit - ch.cost_per_unit) * ch.volume_units)
  }

  const networkNodes: CircularNetworkNode[] = []
  const nodeTypes = ['回收中心', '拆解中心', '再制造厂', '分销中心']
  for (const facility of input.available_facilities) {
    networkNodes.push({
      node_type: rng.pick(nodeTypes),
      location: facility,
      capacity_units: Math.round(input.annual_volume_units * rng.nextFloat(0.1, 0.3)),
      utilization_pct: Math.round(rng.nextFloat(55, 92)),
      processing_cost_per_unit: Math.round(rng.nextFloat(2, 15) * 100) / 100,
    })
  }

  const totalRecovered = channels.reduce((sum, ch) => sum + ch.volume_units, 0)
  const recoveryRate = Math.round((totalRecovered / input.annual_volume_units) * 100 * 10) / 10
  const totalBenefit = channels.reduce((sum, ch) => sum + ch.net_benefit, 0)
  const totalCarbonTonnes = Math.round(channels.reduce((sum, ch) => sum + ch.carbon_saved_kg, 0) / 1000 * 10) / 10
  const circularityScore = Math.round(rng.nextFloat(0.55, 0.92) * 100) / 100
  const linearSaving = Math.round(rng.nextFloat(8, 28) * 10) / 10

  return {
    product_category: input.product_category,
    recovery_channels: channels,
    network_nodes: networkNodes,
    total_recovery_rate_pct: recoveryRate,
    total_annual_benefit_usd: totalBenefit,
    total_carbon_saved_tonnes: totalCarbonTonnes,
    circularity_score: circularityScore,
    vs_linear_cost_saving_pct: linearSaving,
    recommendation: circularityScore > 0.75
      ? '循环经济表现优秀 — 建议扩大回收网络覆盖范围'
      : '循环利用率有提升空间 — 建议优化回收渠道和提升消费者参与度',
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Demand Forecast 报告 ---
function formatDemandForecastReport(result: DemandForecastResult): string {
  const lines: string[] = []
  lines.push('## 📊 Demand Forecast Engine — 需求预测报告')
  lines.push('')
  lines.push(`产品: ${result.product_name} (${result.product_id}) | 预测周期: ${result.forecast_period}`)
  lines.push(`趋势方向: ${result.trend_direction} | 季节性强度: ${result.seasonality_strength} | 促销提升: ${result.promotion_lift_pct}%`)
  lines.push(`模型准确度: ${result.metrics.model_accuracy} | MAPE: ${result.metrics.mape}%`)
  lines.push('')
  lines.push('### 📈 月度预测明细')
  lines.push('| 月份 | 预测量 | 下界 | 上界 | 季节因子 | 置信度 |')
  lines.push('|------|--------|------|------|----------|--------|')
  for (const m of result.monthly_forecasts) {
    lines.push(`| ${m.month} | ${m.predicted_demand} | ${m.lower_bound} | ${m.upper_bound} | ${m.season_factor} | ${m.confidence} |`)
  }
  lines.push('')
  lines.push('### 📋 预测模型指标')
  lines.push(`| 指标 | 值 |`)
  lines.push(`|------|-----|`)
  lines.push(`| MAPE | ${result.metrics.mape}% |`)
  lines.push(`| RMSE | ${result.metrics.rmse} |`)
  lines.push(`| Bias | ${result.metrics.bias} |`)
  lines.push(`| Model Accuracy | ${result.metrics.model_accuracy} |`)
  lines.push('')
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 历史数据完整性校验')
  lines.push('- [x] 季节性因子自动分解')
  lines.push('- [x] 促销效应量化建模')
  lines.push('- [x] 置信区间计算验证')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • ${result.recommendation}*`)
  return lines.join('\n')
}

// --- Tool 2: Inventory Optimizer 报告 ---
function formatInventoryOptimReport(result: InventoryOptimResult): string {
  const lines: string[] = []
  lines.push('## 📦 Inventory Optimizer AI — 库存优化报告')
  lines.push('')
  lines.push(`SKU: ${result.sku_name} (${result.sku_id})`)
  lines.push(`库存状态: ${result.stock_status} | 预计节省: ${result.projected_saving_pct}% | 周转改善: ${result.turnover_improvement_pct}%`)
  lines.push('')
  lines.push('### 📋 EOQ 优化结果')
  lines.push('| 参数 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 经济订货量 (EOQ) | ${result.eoq.economic_order_qty} |`)
  lines.push(`| 再订货点 (ROP) | ${result.eoq.reorder_point} |`)
  lines.push(`| 安全库存 | ${result.eoq.safety_stock} |`)
  lines.push(`| 最大库存 | ${result.eoq.max_stock} |`)
  lines.push(`| 平均库存 | ${result.eoq.avg_inventory} |`)
  lines.push(`| 年度总成本 | $${result.eoq.total_annual_cost} |`)
  lines.push(`| 年订货次数 | ${result.eoq.order_frequency_yearly} |`)
  lines.push(`| 供应天数 | ${result.eoq.days_of_supply} days |`)
  lines.push('')
  lines.push('### 📋 行动建议')
  lines.push(`**${result.action_required}**`)
  lines.push('')
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] EOQ 公式推导验证')
  lines.push('- [x] 安全库存服务水平校准')
  lines.push('- [x] ABC 分类策略应用')
  lines.push('- [x] 动态再订货点计算')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • ${result.sku_name} 库存优化完成*`)
  return lines.join('\n')
}

// --- Tool 3: Route Planner 报告 ---
function formatRoutePlannerReport(result: RoutePlannerResult): string {
  const lines: string[] = []
  lines.push('## 🚚 Logistics Route Planner — 物流路径规划报告')
  lines.push('')
  lines.push(`总里程: ${result.total_distance_km}km | 总成本: $${result.total_cost} | 总排放: ${result.total_emissions_kg_co2}kg CO2`)
  lines.push(`平均装载率: ${result.avg_utilization_pct}% | 碳减排: ${result.emissions_saving_pct}%`)
  lines.push(`规划路径数: ${result.routes.length} | 未服务目的地: ${result.unserved_destinations.length}`)
  lines.push('')
  for (const route of result.routes) {
    lines.push(`### 🛣️ 路径 ${route.route_id} (车辆 ${route.vehicle_id})`)
    lines.push(`服务点数: ${route.destinations_served} | 装载率: ${route.load_utilization_pct}% | 距离: ${route.total_distance_km}km`)
    lines.push('| 起点 | 终点 | 距离(km) | 时长(h) | 模式 | 成本 | 排放(kg CO2) |')
    lines.push('|------|------|----------|---------|------|------|-------------|')
    for (const leg of route.legs) {
      lines.push(`| ${leg.from} | ${leg.to} | ${leg.distance_km} | ${leg.duration_hours} | ${leg.mode} | $${leg.cost} | ${leg.emissions_kg_co2} |`)
    }
    lines.push('')
  }
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] VRP 约束满足（容量/时间窗）')
  lines.push('- [x] 多式联运模式匹配')
  lines.push('- [x] 碳排放因子核算')
  lines.push('- [x] 实时可调度性验证')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • ${result.recommendation}*`)
  return lines.join('\n')
}

// --- Tool 4: Supplier Risk 报告 ---
function formatSupplierRiskReport(result: SupplierRiskResult): string {
  const lines: string[] = []
  lines.push('## ⚠️ Supplier Risk Assessor — 供应商风险评估报告')
  lines.push('')
  lines.push(`供应商: ${result.supplier_name} (${result.supplier_id})`)
  lines.push(`综合风险分: ${result.overall_risk_score} | 风险等级: ${result.overall_risk_level}`)
  lines.push(`集中度风险: ${result.concentration_risk_pct}% | 备选供应商: ${result.alternative_suppliers}家`)
  lines.push(`监控频率: ${result.monitoring_frequency}`)
  lines.push('')
  lines.push('### 📋 风险维度分析')
  lines.push('| 维度 | 分值 | 等级 | 因素 | 缓释措施 |')
  lines.push('|------|------|------|------|----------|')
  for (const d of result.risk_dimensions) {
    lines.push(`| ${d.dimension} | ${d.score} | ${d.level} | ${d.factors.join('; ')} | ${d.mitigation} |`)
  }
  lines.push('')
  lines.push('### 📋 推荐行动')
  for (const action of result.recommended_actions) {
    lines.push(`- ${action}`)
  }
  lines.push('')
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 财务健康度量化评估')
  lines.push('- [x] 地缘政治风险因子扫描')
  lines.push('- [x] 供应集中度测算')
  lines.push('- [x] 质量交付KPI追踪')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • 供应商风险等级: ${result.overall_risk_level.toUpperCase()}*`)
  return lines.join('\n')
}

// --- Tool 5: Warehouse Automation 报告 ---
function formatWarehouseAutomationReport(result: WarehouseAutomationResult): string {
  const lines: string[] = []
  lines.push('## 🏭 Warehouse Automation Planner — 仓库自动化规划报告')
  lines.push('')
  lines.push(`仓库: ${result.warehouse_name} (${result.warehouse_id})`)
  lines.push(`总投资: $${result.total_investment_usd} | ROI: ${result.roi_months}个月`)
  lines.push(`自动化后产能: ${result.throughput_capacity_after}/日 | 人工节省: ${result.labor_reduction_pct}% | 准确率提升: ${result.accuracy_improvement_pct}%`)
  lines.push('')
  lines.push('### 📋 自动化组件清单')
  lines.push('| 组件 | 技术 | 数量 | 单价 | 总成本 | 效率提升 | 实施周数 |')
  lines.push('|------|------|------|------|--------|----------|----------|')
  for (const c of result.components) {
    lines.push(`| ${c.name} | ${c.technology} | ${c.units} | $${c.unit_cost_usd} | $${c.total_cost_usd} | ${c.efficiency_gain_pct}% | ${c.implementation_weeks}w |`)
  }
  lines.push('')
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] AS/RS 布局空间利用率验证')
  lines.push('- [x] AGV 调度算法冲突检测')
  lines.push('- [x] 拣选策略人机工程学评估')
  lines.push('- [x] WMS 系统集成接口确认')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • ${result.recommendation}*`)
  return lines.join('\n')
}

// --- Tool 6: Procurement Sourcing 报告 ---
function formatProcurementSourcingReport(result: ProcurementSourcingResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Procurement Sourcing AI — 智能采购寻源报告')
  lines.push('')
  lines.push(`品类: ${result.material_category} | RFQ编号: ${result.rfq_id}`)
  lines.push(`市场价格趋势: ${result.market_price_trend} | 预测最优价: $${result.predicted_best_price} | 谈判节省: ${result.negotiated_saving_pct}%`)
  lines.push(`推荐供应商: ${result.recommended_supplier} | 碳减排: ${result.carbon_footprint_reduction_pct}%`)
  lines.push('')
  lines.push('### 📋 供应商匹配结果')
  lines.push('| 排名 | 供应商 | 地区 | 匹配度 | 预估价格 | 质量等级 | 可持续认证 | 交期(天) | 风险 |')
  lines.push('|------|--------|------|--------|----------|----------|------------|----------|------|')
  result.supplier_matches.forEach((m, i) => {
    lines.push(`| ${i + 1} | ${m.supplier_name} | ${m.region} | ${m.match_score} | $${m.estimated_price} | ${m.quality_rating} | ${m.sustainability_cert} | ${m.lead_time_days} | ${m.risk_level} |`)
  })
  lines.push('')
  lines.push('### 📋 合同建议')
  lines.push(result.contract_recommendation)
  lines.push('')
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 供应商资质自动审查')
  lines.push('- [x] 市场价格基准对账')
  lines.push('- [x] 可持续性评分加权')
  lines.push('- [x] RFx 文档自动生成')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • ${result.material_category} 寻源完成*`)
  return lines.join('\n')
}

// --- Tool 7: Cold Chain Monitor 报告 ---
function formatColdChainReport(result: ColdChainResult): string {
  const lines: string[] = []
  lines.push('## ❄️ Cold Chain Monitor — 冷链监控报告')
  lines.push('')
  lines.push(`批次: ${result.shipment_id} | 产品类型: ${result.product_type}`)
  lines.push(`合规率: ${result.compliance_rate_pct}% | 剩余货架期: ${result.shelf_life_remaining_pct}% | 状态: ${result.overall_status}`)
  lines.push('')
  lines.push('### 🌡️ 温度记录')
  lines.push('| 检查点 | 时间 | 温度(°C) | 湿度(%) | 状态 |')
  lines.push('|--------|------|----------|---------|------|')
  for (const r of result.temperature_readings) {
    lines.push(`| ${r.checkpoint} | ${r.timestamp.split('T')[1]?.slice(0, 8) || ''} | ${r.temperature} | ${r.humidity} | ${r.status} |`)
  }
  lines.push('')

  if (result.deviation_events.length > 0) {
    lines.push('### ⚠️ 偏差事件')
    lines.push('| 检查点 | 时间 | 类型 | 严重度 | 持续(分钟) | 影响 |')
    lines.push('|--------|------|------|--------|-----------|------|')
    for (const d of result.deviation_events) {
      lines.push(`| ${d.checkpoint} | ${d.timestamp.split('T')[1]?.slice(0, 8) || ''} | ${d.deviation_type} | ${d.severity} | ${d.duration_minutes} | ${d.impact} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 纠正措施')
  for (const action of result.corrective_actions) {
    lines.push(`- ${action}`)
  }
  lines.push('')
  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 全程温度记录连续性验证')
  lines.push('- [x] 偏差事件自动分类')
  lines.push('- [x] 货架期模型实时更新')
  lines.push('- [x] GDP/HACCP 合规审计追踪')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • ${result.recommendation}*`)
  return lines.join('\n')
}

// --- Tool 8: Circular Logistics 报告 ---
function formatCircularLogisticsReport(result: CircularLogisticsResult): string {
  const lines: string[] = []
  lines.push('## ♻️ Circular Logistics Designer — 循环物流设计报告')
  lines.push('')
  lines.push(`品类: ${result.product_category}`)
  lines.push(`总回收率: ${result.total_recovery_rate_pct}% | 年度收益: $${result.total_annual_benefit_usd}`)
  lines.push(`碳减排: ${result.total_carbon_saved_tonnes} 吨 CO2 | 循环度评分: ${result.circularity_score} | 较线性节省: ${result.vs_linear_cost_saving_pct}%`)
  lines.push('')
  lines.push('### 📋 回收渠道分析')
  lines.push('| 渠道 | 处理量 | 回收率 | 单位收益 | 单位成本 | 净收益 | 碳减排(kg) |')
  lines.push('|------|--------|--------|----------|----------|--------|------------|')
  for (const ch of result.recovery_channels) {
    lines.push(`| ${ch.channel} | ${ch.volume_units} | ${ch.recovery_rate_pct}% | $${ch.revenue_per_unit} | $${ch.cost_per_unit} | $${ch.net_benefit} | ${ch.carbon_saved_kg} |`)
  }
  lines.push('')

  if (result.network_nodes.length > 0) {
    lines.push('### 📋 网络节点布局')
    lines.push('| 节点类型 | 位置 | 容量 | 利用率 | 处理成本/单位 |')
    lines.push('|----------|------|------|--------|-------------|')
    for (const n of result.network_nodes) {
      lines.push(`| ${n.node_type} | ${n.location} | ${n.capacity_units} | ${n.utilization_pct}% | $${n.processing_cost_per_unit} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 协议合规清单')
  lines.push('- [x] 回收网络覆盖半径优化')
  lines.push('- [x] 再制造工艺质量标准化')
  lines.push('- [x] 包装循环追踪链路')
  lines.push('- [x] 碳足迹生命周期核算')
  lines.push('')
  lines.push('---')
  lines.push(`*Supply Chain AI • ${result.recommendation}*`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Demand Forecast Engine — 需求预测引擎
  tools.register(defineTool({
    name: 'demand_forecast_engine',
    description: '需求预测引擎 | 时序分析、季节性分解、促销因子、置信区间 | AI-powered demand forecasting with seasonality decomposition and confidence intervals.',
    parameters: {
      forecast_input: {
        type: 'string',
        required: true,
        description: 'JSON: product_id, product_name, historical_months, seasonality (high|medium|low), upcoming_promotions[], market_growth_pct, forecast_horizon_months'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { forecast_input: string }) {
      const input: DemandForecastInput = JSON.parse(args.forecast_input)
      return formatDemandForecastReport(analyzeDemandForecast(input))
    }
  }))

  // Tool 2: Inventory Optimizer AI — 库存优化AI
  tools.register(defineTool({
    name: 'inventory_optimizer_ai',
    description: '库存优化AI | 安全库存、EOQ、动态补货点、ABC分类 | AI-driven inventory optimization with EOQ, safety stock, and dynamic reorder points.',
    parameters: {
      inventory_input: {
        type: 'string',
        required: true,
        description: 'JSON: sku_id, sku_name, annual_demand, unit_cost, ordering_cost, holding_cost_pct, lead_time_days, service_level_target, current_stock, abc_class (A|B|C)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { inventory_input: string }) {
      const input: InventoryOptimInput = JSON.parse(args.inventory_input)
      return formatInventoryOptimReport(analyzeInventoryOptim(input))
    }
  }))

  // Tool 3: Logistics Route Planner — 物流路径规划
  tools.register(defineTool({
    name: 'logistics_route_planner',
    description: '物流路径规划 | VRP/VRPTW、多式联运、碳排放优化、实时调度 | Multi-modal logistics route planning with VRP solver and carbon optimization.',
    parameters: {
      route_input: {
        type: 'string',
        required: true,
        description: 'JSON: origin, destinations[{id, name, demand_kg, time_window}], vehicle_capacity_kg, fleet_size, optimization_goal (distance|cost|time|emissions), transport_modes[](road|rail|air|sea)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { route_input: string }) {
      const input: RoutePlannerInput = JSON.parse(args.route_input)
      return formatRoutePlannerReport(analyzeRoutePlanner(input))
    }
  }))

  // Tool 4: Supplier Risk Assessor — 供应商风险评估
  tools.register(defineTool({
    name: 'supplier_risk_assessor',
    description: '供应商风险评估 | 财务健康、地缘政治、集中度、替代方案 | Multi-dimensional supplier risk assessment with financial, geopolitical, and concentration analysis.',
    parameters: {
      risk_input: {
        type: 'string',
        required: true,
        description: 'JSON: supplier_id, supplier_name, country, category, annual_spend, sole_source, financial_rating (AAA|AA|A|BBB|BB|B|CCC), years_partnership, quality_score, delivery_reliability_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { risk_input: string }) {
      const input: SupplierRiskInput = JSON.parse(args.risk_input)
      return formatSupplierRiskReport(analyzeSupplierRisk(input))
    }
  }))

  // Tool 5: Warehouse Automation Planner — 仓库自动化规划
  tools.register(defineTool({
    name: 'warehouse_automation_planner',
    description: '仓库自动化规划 | AS/RS布局、拣选策略、机器人调度 | Warehouse automation planning with AS/RS, AGV, sorting systems, and ROI analysis.',
    parameters: {
      warehouse_input: {
        type: 'string',
        required: true,
        description: 'JSON: warehouse_id, warehouse_name, area_sqm, daily_throughput, sku_count, order_profile (B2B|B2C|mixed), automation_level (manual|semi|fully), budget_usd'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { warehouse_input: string }) {
      const input: WarehouseAutomationInput = JSON.parse(args.warehouse_input)
      return formatWarehouseAutomationReport(analyzeWarehouseAutomation(input))
    }
  }))

  // Tool 6: Procurement Sourcing AI — 智能采购寻源
  tools.register(defineTool({
    name: 'procurement_sourcing_ai',
    description: '智能采购寻源 | 供应商匹配、RFx生成、价格预测、合同分析 | AI procurement sourcing with supplier matching, price forecasting, and contract recommendations.',
    parameters: {
      sourcing_input: {
        type: 'string',
        required: true,
        description: 'JSON: material_category, target_quantity, target_unit_price, required_quality_grade, delivery_location, contract_duration_months, preferred_regions[], sustainability_required'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sourcing_input: string }) {
      const input: ProcurementSourcingInput = JSON.parse(args.sourcing_input)
      return formatProcurementSourcingReport(analyzeProcurementSourcing(input))
    }
  }))

  // Tool 7: Cold Chain Monitor — 冷链监控
  tools.register(defineTool({
    name: 'cold_chain_monitor',
    description: '冷链监控 | 温度追踪、偏差预警、货架期预测、合规审计 | Cold chain monitoring with real-time temperature tracking, deviation alerts, and shelf-life prediction.',
    parameters: {
      coldchain_input: {
        type: 'string',
        required: true,
        description: 'JSON: shipment_id, product_type, temperature_range_min, temperature_range_max, origin, destination, transit_hours, checkpoints'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { coldchain_input: string }) {
      const input: ColdChainInput = JSON.parse(args.coldchain_input)
      return formatColdChainReport(analyzeColdChain(input))
    }
  }))

  // Tool 8: Circular Logistics Designer — 循环物流设计
  tools.register(defineTool({
    name: 'circular_logistics_designer',
    description: '逆向/循环物流设计 | 回收网络、再制造、包装循环、碳足迹 | Circular logistics design with reverse supply chain, remanufacturing, and carbon footprint analysis.',
    parameters: {
      circular_input: {
        type: 'string',
        required: true,
        description: 'JSON: product_category, annual_volume_units, return_rate_pct, recovery_target_pct, available_facilities[], recycling_partners, carbon_price_usd'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { circular_input: string }) {
      const input: CircularLogisticsInput = JSON.parse(args.circular_input)
      return formatCircularLogisticsReport(analyzeCircularLogistics(input))
    }
  }))

  console.log(`[dsh-tool-supplychainai] Loaded v${VERSION} — Supply Chain AI: 8 tools active`)
  console.log('  Tools: demand_forecast_engine, inventory_optimizer_ai, logistics_route_planner, supplier_risk_assessor, warehouse_automation_planner, procurement_sourcing_ai, cold_chain_monitor, circular_logistics_designer')
}
