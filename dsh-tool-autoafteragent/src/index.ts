/**
 * DSH Auto Aftermarket AI Assistant Plugin v1.0.0
 * 汽车后市场AI助手 for DeepSeek Harness — 二手车估值·AI检测·预测维护·配件定价·保险理赔·车间运营·客户生命周期·电池健康
 *
 * 覆盖汽车后市场全业务链路：二手车交易 → AI检测 → 预测性维护 → 配件定价 → 保险理赔 → 车间运营 → 客户生命周期 → 电动车电池健康
 *
 * 工具清单:
 * 1. used_car_valuation       — 二手车估值（多维度车况/市场/残值分析）
 * 2. vehicle_inspection_ai    — AI车辆检测（视觉损伤/机械健康/事故识别）
 * 3. predictive_maintenance_after — 预测性维护（故障预警/保养周期/寿命预测）
 * 4. parts_pricing_sourcing   — 配件定价与采购（OEM/副厂/二手件比价）
 * 5. insurance_claims_estimator — 保险理赔估算（定损/工时/配件/赔付分析）
 * 6. workshop_operations      — 车间运营（排程/工位/技师/效率优化）
 * 7. customer_lifecycle_after — 客户生命周期（获客/留存/增购/LTV）
 * 8. ev_battery_health        — 电动车电池健康（SOH/SOH预测/梯次利用）
 *
 * @module dsh-tool-autoafteragent | @version 1.0.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'autoafteragent'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析基于AI模型推断，仅供汽车后市场经营参考，不替代专业检测评估与合规决策。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

function mulberry32(s: number): () => number {
  let x = s >>> 0
  return () => {
    x = (x + 0x6D2B79F5) | 0
    let t = x
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(seedStr: string): () => number {
  return mulberry32(hashStr(seedStr))
}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Used Car Valuation ---
interface CarProfile {
  vin: string
  brand: string
  model: string
  year: number
  mileage: number
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'ev'
  transmission: 'manual' | 'automatic' | 'cvt'
  body_type: 'sedan' | 'suv' | 'truck' | 'van' | 'hatchback' | 'coupe'
  color: string
  owner_count: number
  accident_history: number
  service_history_complete: boolean
  condition_score: number
  region: string
  listing_price?: number
}

interface ValuationFactor {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  value_impact_pct: number
  description: string
}

interface MarketComparison {
  source: string
  avg_price: number
  median_price: number
  sample_size: number
  days_on_market_avg: number
}

interface DepreciationCurve {
  year: number
  residual_pct: number
  estimated_value: number
}

interface UsedCarValuationResult {
  vin: string
  vehicle_descriptor: string
  estimated_value_low: number
  estimated_value_mid: number
  estimated_value_high: number
  confidence_score: number
  valuation_factors: ValuationFactor[]
  market_comparisons: MarketComparison[]
  depreciation_curve: DepreciationCurve[]
  recommended_listing_price: number
  days_to_sell_estimate: number
  dashboard_data: Record<string, number>
}

// --- Tool 2: Vehicle Inspection AI ---
interface InspectionInput {
  inspection_id: string
  vin: string
  brand_model: string
  year: number
  mileage: number
  inspection_type: 'pre_purchase' | 'periodic' | 'pre_sale' | 'insurance'
  image_damage_scores: Array<{ panel: string; damage_prob: number; severity: 'minor' | 'moderate' | 'severe' }>
  diagnostic_codes: string[]
  fluid_conditions: { oil: string; coolant: string; brake: string; transmission: string }
  tire_measurements: Array<{ position: string; tread_depth_mm: number; pressure_psi: number }>
  brake_measurements: Array<{ position: string; pad_thickness_mm: number; rotor_condition: string }>
  engine_health_score: number
  accident_history: number
  suspension_notes: string[]
  electrical_systems_check: Array<{ system: string; status: 'pass' | 'warn' | 'fail' }>
  service_history_available?: boolean
}

interface DamageItem {
  component: string
  damage_type: string
  severity: 'cosmetic' | 'functional' | 'structural' | 'safety'
  repair_cost_estimate: number
  urgency: 'immediate' | 'soon' | 'monitor' | 'cosmetic'
}

interface InspectionFinding {
  category: string
  finding: string
  risk_level: 'info' | 'low' | 'moderate' | 'high' | 'critical'
  recommendation: string
  estimated_cost: number
}

interface VehicleInspectionResult {
  inspection_id: string
  overall_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  overall_score: number
  structural_integrity_score: number
  mechanical_health_score: number
  electrical_health_score: number
  cosmetic_score: number
  damage_items: DamageItem[]
  findings: InspectionFinding[]
  accident_probability: number
  odometer_rollback_risk: number
  service_history_available: boolean
  total_repair_estimate: number
  safety_concerns: string[]
  pass_fail: 'pass' | 'conditional' | 'fail'
  dashboard_data: Record<string, number>
}

// --- Tool 3: Predictive Maintenance ---
interface MaintenanceInput {
  vehicle_id: string
  brand: string
  model: string
  year: number
  current_mileage: number
  last_service_mileage: number
  last_service_date: string
  oil_change_interval_km: number
  driving_conditions: 'normal' | 'severe' | 'extreme'
  warning_lights: string[]
  fluid_health_index: number
  brake_wear_pct: number
  tire_wear_pct: number
  battery_health_pct: number
  transmission_health_pct: number
  coolant_health_pct: number
  historical_failures: Array<{ component: string; at_mileage: number; repair_cost: number }>
}

interface MaintenancePrediction {
  component: string
  predicted_failure_mileage: number
  predicted_failure_date: string
  failure_probability_30d: number
  failure_probability_90d: number
  recommended_action: string
  estimated_repair_cost: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface ServiceSchedule {
  service_type: string
  due_at_mileage: number
  due_in_km: number
  due_in_days: number
  status: 'ok' | 'approaching' | 'due' | 'overdue'
  estimated_cost: number
}

interface PredictiveMaintenanceResult {
  vehicle_id: string
  overall_reliability_score: number
  predictions: MaintenancePrediction[]
  upcoming_services: ServiceSchedule[]
  maintenance_cost_forecast_12m: number
  critical_alerts: string[]
  maintenance_urgency: 'routine' | 'attention' | 'urgent' | 'critical'
  dashboard_data: Record<string, number>
}

// --- Tool 4: Parts Pricing & Sourcing ---
interface PartsInput {
  part_query: string
  oem_part_number: string
  brand_model: string
  year: number
  part_category: 'engine' | 'transmission' | 'brakes' | 'suspension' | 'body' | 'electrical' | 'interior' | 'exhaust' | 'cooling' | 'fuel'
  quality_preference: 'oem' | 'aftermarket' | 'used' | 'any'
  quantity_needed: number
  urgency: 'standard' | 'expedited' | 'emergency'
  region: string
}

interface PartsQuote {
  supplier: string
  supplier_type: string
  part_name: string
  part_number: string
  unit_price: number
  total_price: number
  warranty_months: number
  availability: string
  shipping_days: number
  reliability_score: number
}

interface PartAlternative {
  alternative_type: string
  brand: string
  price: number
  quality_rating: string
  savings_pct: number
  trade_offs: string
}

interface PartsPricingResult {
  part_query: string
  oem_part_number: string
  quotes: PartsQuote[]
  alternatives: PartAlternative[]
  best_value_pick: string
  fastest_availability_pick: string
  total_cost_range_low: number
  total_cost_range_high: number
  market_price_trend: 'rising' | 'stable' | 'falling'
  dashboard_data: Record<string, number>
}

// --- Tool 5: Insurance Claims Estimator ---
interface ClaimsInput {
  claim_id: string
  vehicle_info: { brand: string; model: string; year: number; vin: string }
  incident_type: 'collision' | 'theft' | 'vandalism' | 'weather' | 'single_vehicle' | 'hit_and_run'
  incident_date: string
  damage_description: string
  damaged_areas: string[]
  airbags_deployed: boolean
  vehicle_drivable: boolean
  police_report_filed: boolean
  third_party_involved: boolean
  insurance_coverage: { comprehensive: boolean; collision: boolean; liability: boolean; deductible: number }
  repair_facility_type: 'dealership' | 'independent' | 'chain_shop'
}

interface DamageAssessment {
  area: string
  damage_level: 'minor' | 'moderate' | 'major' | 'total'
  repair_method: 'repair' | 'replace' | 'blend' | 'refinish'
  parts_cost: number
  labor_hours: number
  labor_rate: number
  labor_cost: number
  paint_cost: number
  subtotal: number
}

interface ClaimsEstimationResult {
  claim_id: string
  total_repair_cost: number
  damage_assessments: DamageAssessment[]
  total_parts_cost: number
  total_labor_cost: number
  total_paint_cost: number
  deductible_amount: number
  estimated_payout: number
  total_loss_threshold_pct: number
  is_total_loss_candidate: boolean
  salvage_value_estimate: number
  repair_vs_replace_breakdown: Array<{ action: string; count: number; cost: number }>
  processing_time_estimate_days: number
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 6: Workshop Operations ---
interface WorkshopInput {
  workshop_id: string
  name: string
  bays_total: number
  technicians_count: number
  current_jobs: Array<{ job_id: string; service_type: string; estimated_hours: number; priority: string; bay_assigned: number; technician_id: string }>
  daily_capacity_hours: number
  hours_utilized_yesterday: number
  avg_labor_rate: number
  monthly_revenue: number
  monthly_target: number
  customer_satisfaction_score: number
  comeback_rate_pct: number
  parts_inventory_days: number
  technician_skill_matrix: Array<{ tech_id: string; name: string; specialties: string[]; efficiency_rating: number; current_workload_hours: number }>
}

interface SchedulingRecommendation {
  job_id: string
  recommended_bay: number
  recommended_technician: string
  suggested_start_hour: number
  priority_score: number
  reasoning: string
}

interface WorkshopMetrics {
  utilization_rate_pct: number
  efficiency_rate_pct: number
  revenue_per_bay: number
  revenue_per_technician: number
  average_job_turnaround_hours: number
  parts_turnover_rate: number
}

interface WorkshopOperationsResult {
  workshop_id: string
  scheduling_recommendations: SchedulingRecommendation[]
  metrics: WorkshopMetrics
  bottleneck_analysis: string[]
  revenue_forecast_30d: number
  capacity_remaining_today: number
  underutilized_resources: string[]
  overloaded_technicians: string[]
  optimization_actions: string[]
  projected_monthly_vs_target_pct: number
  dashboard_data: Record<string, number>
}

// --- Tool 7: Customer Lifecycle Aftermarket ---
interface CustomerLifecycleInput {
  customer_id: string
  acquisition_channel: string
  first_service_date: string
  total_visits: number
  total_revenue: number
  last_visit_date: string
  average_visit_value: number
  service_categories: string[]
  warranty_active: boolean
  nps_score: number
  vehicle_age_years: number
  vehicle_mileage: number
  communication_preference: string
  referral_count: number
  maintenance_plan_active: boolean
}

interface CLVProjection {
  scenario: string
  annual_retention_rate: number
  projected_annual_revenue: number
  projected_lifetime_years: number
  projected_total_clv: number
}

interface RetentionRisk {
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  days_since_last_visit: number
  churn_probability: number
  recommended_intervention: string
}

interface UpsellOpportunity {
  service: string
  relevance: string
  estimated_value: number
  urgency: string
  script: string
}

interface CustomerLifecycleResult {
  customer_id: string
  customer_tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'at_risk'
  clv_projections: CLVProjection[]
  retention_risk: RetentionRisk
  upsell_opportunities: UpsellOpportunity[]
  recommended_actions: string[]
  estimated_referral_value: number
  reactivation_campaign_eligible: boolean
  dashboard_data: Record<string, number>
}

// --- Tool 8: EV Battery Health ---
interface BatteryInput {
  vehicle_id: string
  brand_model: string
  battery_capacity_kwh: number
  battery_chemistry: 'NMC' | 'LFP' | 'NCA' | 'solid_state'
  manufacture_date: string
  current_odometer_km: number
  full_charge_range_km: number
  original_range_km: number
  charge_cycles_count: number
  avg_charging_speed_kw: number
  fast_charge_pct: number
  temperature_exposure: 'moderate' | 'hot' | 'extreme'
  recent_obd_data: { cell_voltage_min: number; cell_voltage_max: number; cell_delta_mv: number; battery_temp_c: number; charging_status: string }
  warranty_status: { years_remaining: number; capacity_warranty_threshold_pct: number }
}

interface BatteryDegradation {
  expected_soh_pct: number
  current_soh_pct: number
  degradation_rate_pct_per_year: number
  remaining_useful_life_years: number
  projected_range_in_5yr_km: number
}

interface CellBalanceAnalysis {
  balance_status: 'excellent' | 'good' | 'fair' | 'poor'
  max_cell_delta_mv: number
  weakest_cell_position: number
  balancing_action_required: boolean
}

interface BatteryHealthResult {
  vehicle_id: string
  overall_battery_health: 'excellent' | 'good' | 'fair' | 'degraded' | 'poor'
  soh_score: number
  soh_grade: string
  degradation: BatteryDegradation
  cell_balance: CellBalanceAnalysis
  range_anomaly_detected: boolean
  current_range_efficiency_pct: number
  recommended_charging_practices: string[]
  warranty_claim_eligible: boolean
  second_life_potential: 'high' | 'moderate' | 'low' | 'none'
  replacement_cost_estimate: number
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Used Car Valuation ---
function analyzeUsedCarValuation(data: string): UsedCarValuationResult {
  const car: CarProfile = JSON.parse(data)
  const rand = rng(car.vin + car.brand + car.model + car.year)
  const factors: ValuationFactor[] = []
  let baseValue = 0

  // Base value estimation from brand/model tier
  const luxuryBrands = ['mercedes', 'bmw', 'audi', 'lexus', 'porsche', 'land_rover', 'volvo', 'infiniti']
  const mainstreamBrands = ['toyota', 'honda', 'vw', 'volkswagen', 'nissan', 'mazda', 'hyundai', 'kia', 'ford', 'chevrolet']
  const basePriceByYear = car.fuel_type === 'ev' ? 45000 : car.fuel_type === 'hybrid' ? 32000 : 28000
  const age = new Date().getFullYear() - car.year

  if (luxuryBrands.some(b => car.brand.toLowerCase().includes(b))) {
    baseValue = basePriceByYear * 2.2
    factors.push({ factor: '豪华品牌溢价', impact: 'positive', value_impact_pct: 15, description: `${car.brand}属于豪华品牌，保值率相对较高` })
  } else if (mainstreamBrands.some(b => car.brand.toLowerCase().includes(b))) {
    baseValue = basePriceByYear * 1.3
    factors.push({ factor: '主流品牌保值', impact: 'positive', value_impact_pct: 8, description: `${car.brand}市场认知度高，流转性好` })
  } else {
    baseValue = basePriceByYear
    factors.push({ factor: '一般品牌', impact: 'neutral', value_impact_pct: 0, description: `${car.brand}市场保值能力一般` })
  }

  // Mileage depreciation
  const avgKmPerYear = 15000
  const mileageDelta = car.mileage - (avgKmPerYear * age)
  const mileageImpact = mileageDelta > 0 ? -Math.min(20, Math.round(mileageDelta / avgKmPerYear * 5)) : Math.min(10, Math.round(Math.abs(mileageDelta) / avgKmPerYear * 3))
  if (mileageDelta > 10000) {
    factors.push({ factor: '高于平均里程', impact: 'negative', value_impact_pct: mileageImpact, description: `里程${car.mileage.toLocaleString()}km高于同龄车平均水平` })
  } else if (mileageDelta < -10000) {
    factors.push({ factor: '低于平均里程', impact: 'positive', value_impact_pct: mileageImpact, description: `里程${car.mileage.toLocaleString()}km低于同龄车平均水平，更受欢迎` })
  }
  baseValue *= (1 + mileageImpact / 100)

  // Age depreciation
  const ageDepreciation = age <= 1 ? 0.15 : age <= 3 ? 0.35 : age <= 5 ? 0.50 : age <= 8 ? 0.65 : 0.75
  baseValue *= (1 - ageDepreciation)
  factors.push({ factor: `车龄${age}年折旧`, impact: 'negative', value_impact_pct: Math.round(-ageDepreciation * 100), description: `${age}年车龄标准折旧率${Math.round(ageDepreciation * 100)}%` })

  // Accident history
  if (car.accident_history > 0) {
    const accidentImpact = -car.accident_history * 8 - (car.accident_history > 2 ? 10 : 0)
    baseValue *= (1 + accidentImpact / 100)
    factors.push({ factor: `${car.accident_history}次事故记录`, impact: 'negative', value_impact_pct: accidentImpact, description: `有${car.accident_history}次事故记录，显著影响价值` })
  }

  // Condition score
  if (car.condition_score >= 85) {
    factors.push({ factor: '车况优秀', impact: 'positive', value_impact_pct: 8, description: `车况评分${car.condition_score}/100，内外如新` })
    baseValue *= 1.08
  } else if (car.condition_score >= 70) {
    factors.push({ factor: '车况良好', impact: 'positive', value_impact_pct: 3, description: `车况评分${car.condition_score}/100，正常使用痕迹` })
    baseValue *= 1.03
  } else if (car.condition_score < 50) {
    factors.push({ factor: '车况较差', impact: 'negative', value_impact_pct: -15, description: `车况评分${car.condition_score}/100，需要大量整备` })
    baseValue *= 0.85
  }

  // Owner count
  if (car.owner_count === 1) {
    factors.push({ factor: '一手车', impact: 'positive', value_impact_pct: 5, description: '仅一位车主，通常保养更好' })
    baseValue *= 1.05
  } else if (car.owner_count >= 3) {
    factors.push({ factor: `${car.owner_count}手车`, impact: 'negative', value_impact_pct: -6, description: '多次过户，影响买家信心' })
    baseValue *= 0.94
  }

  // Fuel type factor
  if (car.fuel_type === 'ev') {
    factors.push({ factor: '新能源车型', impact: 'neutral', value_impact_pct: -3, description: '电动车市场保值率波动较大' })
    baseValue *= 0.97
  } else if (car.fuel_type === 'hybrid') {
    factors.push({ factor: '混合动力', impact: 'positive', value_impact_pct: 4, description: '混动车型城市工况经济性受欢迎' })
    baseValue *= 1.04
  }

  // Service history
  if (car.service_history_complete) {
    factors.push({ factor: '完整维保记录', impact: 'positive', value_impact_pct: 6, description: '全程4S店维保记录可追溯' })
    baseValue *= 1.06
  } else {
    factors.push({ factor: '维保记录不全', impact: 'negative', value_impact_pct: -8, description: '缺少部分维保记录，增加不确定性' })
    baseValue *= 0.92
  }

  // Region factor
  const tier1 = ['北京', '上海', '广州', '深圳', 'beijing', 'shanghai', 'guangzhou', 'shenzhen']
  if (tier1.some(r => car.region.toLowerCase().includes(r.toLowerCase()))) {
    factors.push({ factor: '一线城市', impact: 'positive', value_impact_pct: 3, description: `地区${car.region}消费力强，二手车需求旺盛` })
    baseValue *= 1.03
  }

  const estimatedMid = Math.round((baseValue +rand() * baseValue * 0.1 - baseValue * 0.05) * 100) / 100
  const estimatedLow = Math.round(estimatedMid * 0.88)
  const estimatedHigh = Math.round(estimatedMid * 1.12)
  const recommendedListing = Math.round(estimatedMid * 1.05)
  const confidence = Math.round((65 + rand() * 25 + (car.service_history_complete ? 5 : 0)) * 10) / 10

  const marketComparisons: MarketComparison[] = [
    { source: '全国均价', avg_price: estimatedMid, median_price: Math.round(estimatedMid * 0.97), sample_size: Math.round(50 + rand() * 200), days_on_market_avg: Math.round(25 + rand() * 30) },
    { source: `${car.region}区域`, avg_price: Math.round(estimatedMid * 1.02), median_price: Math.round(estimatedMid * 0.99), sample_size: Math.round(10 + rand() * 50), days_on_market_avg: Math.round(20 + rand() * 25) }
  ]

  const depreciationCurve: DepreciationCurve[] = []
  const currentYear = new Date().getFullYear()
  let cumulativeValue = estimatedHigh * 1.3
  for (let y = 0; y <= Math.min(10, 15 - age); y++) {
    const residualPct = Math.max(0.1, 1 - (y + age) * (age <= 3 ? 0.12 : 0.08))
    const yearlyValue = Math.round(cumulativeValue * residualPct)
    depreciationCurve.push({ year: currentYear + y, residual_pct: Math.round(residualPct * 1000) / 10, estimated_value: yearlyValue })
  }

  return {
    vin: car.vin,
    vehicle_descriptor: `${car.year} ${car.brand} ${car.model} ${car.fuel_type.toUpperCase()}`,
    estimated_value_low: estimatedLow,
    estimated_value_mid: estimatedMid,
    estimated_value_high: estimatedHigh,
    confidence_score: Math.min(95, confidence),
    valuation_factors: factors,
    market_comparisons: marketComparisons,
    depreciation_curve: depreciationCurve,
    recommended_listing_price: recommendedListing,
    days_to_sell_estimate: Math.round(20 + rand() * 35),
    dashboard_data: {
      estimated_mid: estimatedMid,
      confidence: confidence,
      factors_count: factors.length,
      mileage_impact: mileageImpact,
      days_to_sell: Math.round(20 + rand() * 35)
    }
  }
}

// --- Tool 2: Vehicle Inspection AI ---
function analyzeVehicleInspection(data: string): VehicleInspectionResult {
  const input: InspectionInput = JSON.parse(data)
  const rand = rng(input.inspection_id + input.vin + input.mileage)
  const damageItems: DamageItem[] = []
  const findings: InspectionFinding[] = []
  let totalRepairCost = 0

  // Image damage analysis
  for (const dmg of input.image_damage_scores) {
    if (dmg.damage_prob > 0.6) {
      const urgency = dmg.severity === 'severe' ? 'immediate' : dmg.severity === 'moderate' ? 'soon' : 'monitor'
      const cost = dmg.severity === 'severe' ? Math.round(2000 + rand() * 5000) : dmg.severity === 'moderate' ? Math.round(800 + rand() * 1500) : Math.round(200 + rand() * 500)
      damageItems.push({
        component: dmg.panel,
        damage_type: dmg.severity === 'severe' ? '结构性损伤' : dmg.severity === 'moderate' ? '功能性损伤' : '外观损伤',
        severity: dmg.severity === 'severe' ? 'structural' : dmg.severity === 'moderate' ? 'functional' : 'cosmetic',
        repair_cost_estimate: cost,
        urgency: urgency as 'immediate' | 'soon' | 'monitor' | 'cosmetic'
      })
      totalRepairCost += cost
    }
  }

  // Diagnostic codes
  if (input.diagnostic_codes.length > 0) {
    for (const code of input.diagnostic_codes) {
      const isCritical = code.startsWith('P0') || code.startsWith('C0')
      findings.push({
        category: '故障码',
        finding: `检测到OBD-II故障码: ${code}`,
        risk_level: isCritical ? 'high' : 'moderate',
        recommendation: isCritical ? '立即诊断修复，影响行车安全' : '尽快安排检修',
        estimated_cost: isCritical ? Math.round(500 + rand() * 2000) : Math.round(200 + rand() * 500)
      })
      totalRepairCost += isCritical ? Math.round(500 + rand() * 2000) : Math.round(200 + rand() * 500)
    }
  }

  // Engine health
  if (input.engine_health_score < 60) {
    findings.push({ category: '发动机', finding: `发动机健康评分偏低 (${input.engine_health_score}/100)`, risk_level: 'high', recommendation: '建议进行气缸压力测试与内窥镜检查', estimated_cost: Math.round(1500 + rand() * 3000) })
    totalRepairCost += 1500 + Math.round(rand() * 3000)
  } else if (input.engine_health_score >= 85) {
    findings.push({ category: '发动机', finding: `发动机工况良好 (${input.engine_health_score}/100)`, risk_level: 'info', recommendation: '按常规保养计划维护', estimated_cost: 0 })
  }

  // Fluid conditions
  const highRiskFluids = ['black', 'contaminated', 'low', 'burnt']
  if (highRiskFluids.includes(input.fluid_conditions.oil)) {
    findings.push({ category: '油液', finding: `机油状态异常: ${input.fluid_conditions.oil}`, risk_level: 'moderate', recommendation: '立即更换机油及滤清器', estimated_cost: Math.round(300 + rand() * 400) })
    totalRepairCost += 300 + Math.round(rand() * 400)
  }

  // Tires
  for (const tire of input.tire_measurements) {
    if (tire.tread_depth_mm < 3.2) {
      findings.push({ category: '轮胎', finding: `${tire.position}胎花纹深度不足 (${tire.tread_depth_mm}mm)`, risk_level: tire.tread_depth_mm < 1.6 ? 'high' : 'moderate', recommendation: tire.tread_depth_mm < 1.6 ? '立即更换轮胎' : '建议近期更换', estimated_cost: Math.round(400 + rand() * 400) })
    }
  }

  // Brakes
  for (const brake of input.brake_measurements) {
    if (brake.pad_thickness_mm < 3) {
      findings.push({ category: '制动', finding: `${brake.position}刹车片厚度不足 (${brake.pad_thickness_mm}mm)`, risk_level: 'high', recommendation: '尽快更换刹车片与刹车盘', estimated_cost: Math.round(600 + rand() * 800) })
    }
  }

  // Electrical
  for (const sys of input.electrical_systems_check) {
    if (sys.status === 'fail') {
      findings.push({ category: '电气', finding: `${sys.system}系统检测失败`, risk_level: 'high', recommendation: '专业电路诊断及维修', estimated_cost: Math.round(500 + rand() * 1500) })
    } else if (sys.status === 'warn') {
      findings.push({ category: '电气', finding: `${sys.system}系统警告`, risk_level: 'moderate', recommendation: '关注并安排检查', estimated_cost: Math.round(200 + rand() * 400) })
    }
  }

  // Scores
  const structuralScore = Math.round(Math.max(0, 100 - input.image_damage_scores.filter(d => d.severity === 'severe').length * 25 - input.accident_history * 10 + rand() * 10))
  const mechanicalScore = Math.round(Math.max(0, Math.min(100, input.engine_health_score - input.diagnostic_codes.length * 5 + rand() * 5)))
  const electricalScore = Math.round(Math.max(0, 100 - input.electrical_systems_check.filter(s => s.status === 'fail').length * 20 - input.electrical_systems_check.filter(s => s.status === 'warn').length * 8))
  const cosmeticScore = Math.round(Math.max(0, 90 - input.image_damage_scores.filter(d => d.damage_prob > 0.6).length * 8 - input.image_damage_scores.filter(d => d.damage_prob > 0.3).length * 4))
  const overallScore = Math.round((structuralScore * 0.35 + mechanicalScore * 0.3 + electricalScore * 0.15 + cosmeticScore * 0.2))

  let overallCondition: VehicleInspectionResult['overall_condition'] = 'excellent'
  if (overallScore >= 85) overallCondition = 'excellent'
  else if (overallScore >= 70) overallCondition = 'good'
  else if (overallScore >= 55) overallCondition = 'fair'
  else if (overallScore >= 40) overallCondition = 'poor'
  else overallCondition = 'critical'

  const accidentProbability = Math.round(Math.min(95, input.image_damage_scores.filter(d => d.severity === 'severe' && d.damage_prob > 0.7).length * 25 + rand() * 15) * 10) / 10
  const odometerRollbackRisk = Math.round(rand() * 30 * (input.image_damage_scores.length > 0 ? 0.3 : 1) * 10) / 10
  const safetyConcerns: string[] = []
  if (input.brake_measurements.some(b => b.pad_thickness_mm < 2)) safetyConcerns.push('制动系统安全隐患')
  if (input.tire_measurements.some(t => t.tread_depth_mm < 1.6)) safetyConcerns.push('轮胎抓地力严重不足')
  if (input.electrical_systems_check.some(s => s.system === 'ABS' && s.status === 'fail')) safetyConcerns.push('ABS系统失效')
  if (input.image_damage_scores.some(d => d.severity === 'severe' && d.panel.includes('车架'))) safetyConcerns.push('车身结构损伤')

  const passFail: VehicleInspectionResult['pass_fail'] = overallScore >= 70 ? 'pass' : overallScore >= 55 ? 'conditional' : 'fail'

  return {
    inspection_id: input.inspection_id,
    overall_condition: overallCondition,
    overall_score: overallScore,
    structural_integrity_score: structuralScore,
    mechanical_health_score: mechanicalScore,
    electrical_health_score: electricalScore,
    cosmetic_score: cosmeticScore,
    damage_items: damageItems,
    findings: findings,
    accident_probability: accidentProbability,
    odometer_rollback_risk: odometerRollbackRisk,
    service_history_available: input.service_history_available ?? false,
    total_repair_estimate: totalRepairCost,
    safety_concerns: safetyConcerns,
    pass_fail: passFail,
    dashboard_data: { overall_score: overallScore, structural: structuralScore, mechanical: mechanicalScore, electrical: electricalScore, cosmetic: cosmeticScore, repair_cost: totalRepairCost }
  }
}

// --- Tool 3: Predictive Maintenance ---
function analyzePredictiveMaintenance(data: string): PredictiveMaintenanceResult {
  const input: MaintenanceInput = JSON.parse(data)
  const rand = rng(input.vehicle_id + input.brand + input.current_mileage)
  const predictions: MaintenancePrediction[] = []
  const services: ServiceSchedule[] = []
  const alerts: string[] = []

  const kmSinceService = input.current_mileage - input.last_service_mileage
  const daysSinceService = Math.round((Date.now() - new Date(input.last_service_date).getTime()) / 86400000)
  const severityMultiplier = input.driving_conditions === 'extreme' ? 0.6 : input.driving_conditions === 'severe' ? 0.8 : 1.0

  // Oil change
  const oilDueKm = input.oil_change_interval_km - kmSinceService
  services.push({ service_type: '机油及滤清器更换', due_at_mileage: input.last_service_mileage + input.oil_change_interval_km, due_in_km: oilDueKm, due_in_days: Math.round(oilDueKm / 40), status: oilDueKm < 0 ? 'overdue' : oilDueKm < 1000 ? 'due' : oilDueKm < 3000 ? 'approaching' : 'ok', estimated_cost: 400 + Math.round(rand() * 300) })

  // Brakes
  if (input.brake_wear_pct > 70) {
    const predictedMileage = input.current_mileage + Math.round((100 - input.brake_wear_pct) * 500 * severityMultiplier)
    predictions.push({ component: '制动系统（刹车片/盘）', predicted_failure_mileage: predictedMileage, predicted_failure_date: new Date(Date.now() + (predictedMileage - input.current_mileage) / 40 * 86400000).toISOString().slice(0, 10), failure_probability_30d: input.brake_wear_pct > 85 ? Math.round(40 + rand() * 30) : Math.round(10 + rand() * 20), failure_probability_90d: Math.round(50 + rand() * 40), recommended_action: '更换刹车片，检查刹车盘', estimated_repair_cost: Math.round(800 + rand() * 600), priority: input.brake_wear_pct > 85 ? 'critical' : 'high' })
    if (input.brake_wear_pct > 85) alerts.push('刹车片磨损严重，建议立即更换')
  }

  // Tires
  if (input.tire_wear_pct > 60) {
    const predictedMileage = input.current_mileage + Math.round((100 - input.tire_wear_pct) * 800 * severityMultiplier)
    predictions.push({ component: '轮胎', predicted_failure_mileage: predictedMileage, predicted_failure_date: new Date(Date.now() + (predictedMileage - input.current_mileage) / 40 * 86400000).toISOString().slice(0, 10), failure_probability_30d: input.tire_wear_pct > 80 ? Math.round(30 + rand() * 25) : Math.round(8 + rand() * 15), failure_probability_90d: Math.round(45 + rand() * 35), recommended_action: '更换轮胎，做四轮定位', estimated_repair_cost: Math.round(1500 + rand() * 1000), priority: input.tire_wear_pct > 80 ? 'high' : 'medium' })
  }

  // Battery
  if (input.battery_health_pct < 50) {
    const predictedMileage = input.current_mileage + Math.round(input.battery_health_pct * 200)
    predictions.push({ component: '蓄电池', predicted_failure_mileage: predictedMileage, predicted_failure_date: new Date(Date.now() + (predictedMileage - input.current_mileage) / 30 * 86400000).toISOString().slice(0, 10), failure_probability_30d: Math.round(20 + rand() * 30), failure_probability_90d: Math.round(50 + rand() * 40), recommended_action: '更换蓄电池', estimated_repair_cost: Math.round(500 + rand() * 400), priority: input.battery_health_pct < 30 ? 'critical' : 'high' })
    if (input.battery_health_pct < 30) alerts.push('蓄电池健康度极低，随时可能无法启动')
  }

  // Transmission
  if (input.transmission_health_pct < 60) {
    predictions.push({ component: '变速箱', predicted_failure_mileage: input.current_mileage + Math.round(input.transmission_health_pct * 300 * severityMultiplier), predicted_failure_date: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10), failure_probability_30d: Math.round(5 + rand() * 15), failure_probability_90d: Math.round(20 + rand() * 30), recommended_action: '变速箱油更换及系统检查', estimated_repair_cost: Math.round(2000 + rand() * 5000), priority: input.transmission_health_pct < 40 ? 'critical' : 'high' })
    alerts.push('变速箱健康状况需要关注')
  }

  // Coolant / timing belt
  if (input.coolant_health_pct < 50) {
    predictions.push({ component: '冷却系统', predicted_failure_mileage: input.current_mileage + 8000, predicted_failure_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10), failure_probability_30d: Math.round(5 + rand() * 10), failure_probability_90d: Math.round(15 + rand() * 20), recommended_action: '更换冷却液，检查水泵和节温器', estimated_repair_cost: Math.round(800 + rand() * 1200), priority: 'medium' })
  }

  // Warning lights
  for (const light of input.warning_lights) {
    alerts.push(`仪表警告灯: ${light}`)
  }

  // Service schedule
  services.push({ service_type: '空气滤清器', due_at_mileage: Math.ceil(input.current_mileage / 20000) * 20000, due_in_km: Math.ceil(input.current_mileage / 20000) * 20000 - input.current_mileage, due_in_days: Math.round((Math.ceil(input.current_mileage / 20000) * 20000 - input.current_mileage) / 40), status: 'ok', estimated_cost: 150 })
  services.push({ service_type: '变速箱油', due_at_mileage: Math.ceil(input.current_mileage / 60000) * 60000, due_in_km: Math.ceil(input.current_mileage / 60000) * 60000 - input.current_mileage, due_in_days: Math.round((Math.ceil(input.current_mileage / 60000) * 60000 - input.current_mileage) / 40), status: 'ok', estimated_cost: 1500 })
  services.push({ service_type: '火花塞', due_at_mileage: Math.ceil(input.current_mileage / 40000) * 40000, due_in_km: Math.ceil(input.current_mileage / 40000) * 40000 - input.current_mileage, due_in_days: Math.round((Math.ceil(input.current_mileage / 40000) * 40000 - input.current_mileage) / 40), status: 'ok', estimated_cost: 600 })

  const totalCostForecast = predictions.reduce((sum, p) => sum + p.estimated_repair_cost, 0) + services.filter(s => s.status !== 'ok').reduce((sum, s) => sum + s.estimated_cost, 0)
  const overallReliability = Math.round(Math.max(0, 100 - predictions.length * 12 - alerts.length * 8 - (100 - input.fluid_health_index) * 0.3))

  let urgency: PredictiveMaintenanceResult['maintenance_urgency'] = 'routine'
  if (predictions.some(p => p.priority === 'critical')) urgency = 'critical'
  else if (predictions.some(p => p.priority === 'high')) urgency = 'urgent'
  else if (predictions.some(p => p.priority === 'medium')) urgency = 'attention'

  return {
    vehicle_id: input.vehicle_id,
    overall_reliability_score: overallReliability,
    predictions: predictions.sort((a, b) => (a.priority === 'critical' ? -1 : 1)),
    upcoming_services: services.filter(s => s.status !== 'ok'),
    maintenance_cost_forecast_12m: totalCostForecast,
    critical_alerts: alerts,
    maintenance_urgency: urgency,
    dashboard_data: { reliability: overallReliability, predictions_count: predictions.length, alerts_count: alerts.length, cost_forecast: totalCostForecast }
  }
}

// --- Tool 4: Parts Pricing & Sourcing ---
function analyzePartsPricing(data: string): PartsPricingResult {
  const input: PartsInput = JSON.parse(data)
  const rand = rng(input.part_query + input.oem_part_number + input.brand_model)
  const quotes: PartsQuote[] = []

  // Generate quotes from different supplier types
  const basePrice = Math.round(500 + rand() * 2000)
  quotes.push({ supplier: `${input.brand_model.split(' ')[0]}授权经销商`, supplier_type: 'oem_dealer', part_name: input.part_query, part_number: input.oem_part_number, unit_price: Math.round(basePrice * 1.4), total_price: Math.round(basePrice * 1.4 * input.quantity_needed), warranty_months: 24, availability: '1_week', shipping_days: 5, reliability_score: 95 })
  quotes.push({ supplier: '途虎养车配件中心', supplier_type: 'aftermarket', part_name: `${input.part_query}（品牌件）`, part_number: `AM-${input.oem_part_number}`, unit_price: Math.round(basePrice * 0.75), total_price: Math.round(basePrice * 0.75 * input.quantity_needed), warranty_months: 12, availability: 'in_stock', shipping_days: 2, reliability_score: 80 })
  quotes.push({ supplier: '天猫养车旗舰店', supplier_type: 'online_marketplace', part_name: `${input.part_query}（品质件）`, part_number: `OL-${input.oem_part_number}`, unit_price: Math.round(basePrice * 0.85), total_price: Math.round(basePrice * 0.85 * input.quantity_needed), warranty_months: 18, availability: 'in_stock', shipping_days: 3, reliability_score: 82 })
  quotes.push({ supplier: '拆车件市场', supplier_type: 'salvage', part_name: `${input.part_query}（二手原厂件）`, part_number: `US-${input.oem_part_number}`, unit_price: Math.round(basePrice * 0.45), total_price: Math.round(basePrice * 0.45 * input.quantity_needed), warranty_months: 6, availability: '3_days', shipping_days: 2, reliability_score: 60 })

  const alternatives: PartAlternative[] = [
    { alternative_type: '品牌替代件（盖茨/博世/曼牌等级）', brand: 'BOSCH/MAHLE', price: Math.round(basePrice * 0.7), quality_rating: 'A级（等同OEM品质）', savings_pct: 30, trade_offs: '非原厂包装，性能等同' },
    { alternative_type: '国产配套件', brand: '国产OEM配套厂', price: Math.round(basePrice * 0.5), quality_rating: 'B级（符合国标）', savings_pct: 50, trade_offs: '耐久性略逊于品牌件' }
  ]

  const totalLow = Math.min(...quotes.map(q => q.total_price))
  const totalHigh = Math.max(...quotes.map(q => q.total_price))
  const bestValue = quotes.reduce((best, q) => (q.reliability_score / q.unit_price > best.reliability_score / best.unit_price ? q : best), quotes[0])
  const fastest = quotes.reduce((best, q) => q.shipping_days < best.shipping_days ? q : best, quotes[0])

  return {
    part_query: input.part_query,
    oem_part_number: input.oem_part_number,
    quotes,
    alternatives,
    best_value_pick: bestValue.supplier,
    fastest_availability_pick: fastest.supplier,
    total_cost_range_low: totalLow,
    total_cost_range_high: totalHigh,
    market_price_trend: rand() > 0.6 ? 'rising' : rand() > 0.3 ? 'stable' : 'falling',
    dashboard_data: { quotes_count: quotes.length, min_price: totalLow, max_price: totalHigh, best_value_reliability: bestValue.reliability_score }
  }
}

// --- Tool 5: Insurance Claims Estimator ---
function analyzeClaimsEstimation(data: string): ClaimsEstimationResult {
  const input: ClaimsInput = JSON.parse(data)
  const rand = rng(input.claim_id + input.vehicle_info.vin)
  const assessments: DamageAssessment[] = []
  let totalParts = 0; let totalLabor = 0; let totalPaint = 0

  const laborRate = input.repair_facility_type === 'dealership' ? 800 : input.repair_facility_type === 'chain_shop' ? 500 : 350
  const hoursMap: Record<string, number> = { minor: 2, moderate: 8, major: 20, total: 50 }

  for (const area of input.damaged_areas) {
    const severity = area.includes('front') && input.incident_type === 'collision' ? 'major' : area.includes('rear') ? 'moderate' : area.includes('side') ? 'moderate' : 'minor'
    const partsCost = severity === 'major' ? Math.round(3000 + rand() * 8000) : severity === 'moderate' ? Math.round(800 + rand() * 2000) : Math.round(200 + rand() * 500)
    const hours = hoursMap[severity] + Math.round(rand() * 3)
    const labor = hours * laborRate
    const paint = severity === 'major' ? Math.round(1500 + rand() * 2000) : severity === 'moderate' ? Math.round(800 + rand() * 1000) : Math.round(300 + rand() * 500)
    assessments.push({ area, damage_level: severity as 'minor' | 'moderate' | 'major' | 'total', repair_method: severity === 'major' ? 'replace' : 'repair', parts_cost: partsCost, labor_hours: hours, labor_rate: laborRate, labor_cost: labor, paint_cost: paint, subtotal: partsCost + labor + paint })
    totalParts += partsCost; totalLabor += labor; totalPaint += paint
  }

  const totalRepair = totalParts + totalLabor + totalPaint
  const vehicleAge = new Date().getFullYear() - input.vehicle_info.year
  const estimatedVehicleValue = Math.max(20000, 300000 * Math.pow(0.85, vehicleAge))
  const tlThreshold = estimatedVehicleValue * 0.6
  const isTotalLoss = totalRepair > tlThreshold
  const salvageValue = Math.round(estimatedVehicleValue * 0.25)
  const deductible = input.insurance_coverage.deductible
  const estimatedPayout = isTotalLoss ? estimatedVehicleValue - salvageValue - deductible : Math.max(0, totalRepair - deductible)

  const replaceCount = assessments.filter(a => a.repair_method === 'replace').length
  const repairCount = assessments.filter(a => a.repair_method === 'repair').length
  const blendCount = assessments.filter(a => a.repair_method === 'blend').length
  const refineCount = assessments.length

  const recommendations: string[] = []
  if (isTotalLoss) recommendations.push('维修费用超过车辆实际价值60%，建议推定全损处理')
  if (input.airbags_deployed) recommendations.push('气囊弹出需更换气囊模块及传感器，费用较高')
  if (!input.vehicle_drivable) recommendations.push('车辆无法行驶，需拖车施救费用')
  if (!input.police_report_filed && input.incident_type === 'collision') recommendations.push('建议补充警方事故认定书加速理赔')
  if (input.repair_facility_type === 'dealership') recommendations.push('4S店维修费用较高但品质保障，注意与定损员沟通')

  return {
    claim_id: input.claim_id,
    total_repair_cost: totalRepair,
    damage_assessments: assessments,
    total_parts_cost: totalParts,
    total_labor_cost: totalLabor,
    total_paint_cost: totalPaint,
    deductible_amount: deductible,
    estimated_payout: Math.round(estimatedPayout),
    total_loss_threshold_pct: 60,
    is_total_loss_candidate: isTotalLoss,
    salvage_value_estimate: salvageValue,
    repair_vs_replace_breakdown: [
      { action: '更换', count: replaceCount, cost: assessments.filter(a => a.repair_method === 'replace').reduce((s, a) => s + a.parts_cost, 0) },
      { action: '修复', count: repairCount, cost: assessments.filter(a => a.repair_method === 'repair').reduce((s, a) => s + a.labor_cost, 0) },
      { action: '钣金喷漆', count: refineCount, cost: totalPaint }
    ],
    processing_time_estimate_days: isTotalLoss ? Math.round(15 + rand() * 20) : Math.round(5 + rand() * 10),
    recommendations,
    dashboard_data: { total_repair: totalRepair, payout: Math.round(estimatedPayout), parts: totalParts, labor: totalLabor, paint: totalPaint, is_tl: isTotalLoss ? 1 : 0 }
  }
}

// --- Tool 6: Workshop Operations ---
function analyzeWorkshopOperations(data: string): WorkshopOperationsResult {
  const input: WorkshopInput = JSON.parse(data)
  const rand = rng(input.workshop_id + input.name)
  const recommendations: SchedulingRecommendation[] = []
  const bottlenecks: string[] = []
  const underutilized: string[] = []
  const overloaded: string[] = []
  const optimizationActions: string[] = []

  // Metrics
  const utilRate = Math.round((input.hours_utilized_yesterday / input.daily_capacity_hours) * 100)
  const efficiencyRate = Math.round(utilRate * (0.85 + rand() * 0.1))
  const revenuePerBay = Math.round(input.monthly_revenue / input.bays_total)
  const revenuePerTech = Math.round(input.monthly_revenue / input.technicians_count)
  const avgTurnaround = Math.round(4 + rand() * 8)
  const partsTurnover = Math.round((30 / Math.max(5, input.parts_inventory_days)) * 10) / 10

  // Scheduling
  for (const job of input.current_jobs.slice(0, 6)) {
    const availableTech = input.technician_skill_matrix.filter(t => t.current_workload_hours < 6 && t.specialties.some(s => job.service_type.toLowerCase().includes(s.toLowerCase())))
    const recommendedTech = availableTech.length > 0 ? availableTech[0].tech_id : (input.technician_skill_matrix.length > 0 ? input.technician_skill_matrix[0].tech_id : 'T001')
    const bay = job.bay_assigned || Math.ceil(rand() * input.bays_total)
    const startHour = 8 + Math.round(rand() * 3)
    recommendations.push({ job_id: job.job_id, recommended_bay: bay, recommended_technician: recommendedTech, suggested_start_hour: startHour, priority_score: job.priority === 'high' ? 3 : job.priority === 'medium' ? 2 : 1, reasoning: `技师负载适中，工位空闲，建议${startHour}:00开始` })
  }

  // Bottlenecks
  if (utilRate > 90) bottlenecks.push('工位利用率超90%，需扩充产能或优化流程')
  if (input.technician_skill_matrix.some(t => t.current_workload_hours > 10)) bottlenecks.push('部分技师工作超负荷')
  if (input.parts_inventory_days < 7) bottlenecks.push('配件库存不足，可能延误工期')

  // Underutilized / Overloaded
  for (const tech of input.technician_skill_matrix) {
    if (tech.current_workload_hours < 3) { overloaded.push(`${tech.name}(${tech.tech_id})`); underutilized.push(`技师${tech.name}负载不足(${tech.current_workload_hours}h)`) }
    if (tech.current_workload_hours > 8) overloaded.push(`${tech.name}(${tech.tech_id}): ${tech.current_workload_hours}h`)
  }

  // Revenue forecast
  const dailyAvg = input.monthly_revenue / 26
  const revenue30d = Math.round(dailyAvg * 30 * (0.9 + rand() * 0.2))
  const projectedVsTarget = Math.round((input.monthly_revenue / input.monthly_target) * 100)

  if (projectedVsTarget < 85) optimizationActions.push('启动引流促销活动，提升进场台次')
  if (input.comeback_rate_pct > 8) optimizationActions.push('返修率偏高，加强质量检验环节')
  if (input.customer_satisfaction_score < 4.0) optimizationActions.push('客户满意度低于4.0，优化服务体验')
  if (input.parts_inventory_days > 45) optimizationActions.push('配件库存积压严重，优化采购频率')

  const metrics: WorkshopMetrics = {
    utilization_rate_pct: Math.min(98, utilRate),
    efficiency_rate_pct: Math.min(95, efficiencyRate),
    revenue_per_bay: revenuePerBay,
    revenue_per_technician: revenuePerTech,
    average_job_turnaround_hours: avgTurnaround,
    parts_turnover_rate: partsTurnover
  }

  return {
    workshop_id: input.workshop_id,
    scheduling_recommendations: recommendations,
    metrics,
    bottleneck_analysis: bottlenecks,
    revenue_forecast_30d: revenue30d,
    capacity_remaining_today: Math.max(0, input.daily_capacity_hours - input.hours_utilized_yesterday),
    underutilized_resources: underutilized,
    overloaded_technicians: overloaded,
    optimization_actions: optimizationActions,
    projected_monthly_vs_target_pct: projectedVsTarget,
    dashboard_data: { utilization: utilRate, efficiency: efficiencyRate, revenue_30d: revenue30d, vs_target: projectedVsTarget, satisfaction: input.customer_satisfaction_score }
  }
}

// --- Tool 7: Customer Lifecycle Aftermarket ---
function analyzeCustomerLifecycle(data: string): CustomerLifecycleResult {
  const input: CustomerLifecycleInput = JSON.parse(data)
  const rand = rng(input.customer_id + input.first_service_date)
  const today = new Date()
  const lastVisit = new Date(input.last_visit_date)
  const daysSinceLastVisit = Math.round((today.getTime() - lastVisit.getTime()) / 86400000)

  // CLV Projections
  const clvProjections = [
    { scenario: '保守（年留存60%）', annual_retention_rate: 60, projected_annual_revenue: Math.round(input.average_visit_value * Math.max(1, input.total_visits / Math.max(1, (today.getTime() - new Date(input.first_service_date).getTime()) / 31536000000))), projected_lifetime_years: 3, projected_total_clv: 0 },
    { scenario: '基准（年留存75%）', annual_retention_rate: 75, projected_annual_revenue: Math.round(input.average_visit_value * Math.max(1, input.total_visits / Math.max(1, (today.getTime() - new Date(input.first_service_date).getTime()) / 315360000000))), projected_lifetime_years: 5, projected_total_clv: 0 },
    { scenario: '乐观（年留存90%）', annual_retention_rate: 90, projected_annual_revenue: Math.round(input.average_visit_value * Math.max(1.2, input.total_visits / Math.max(1, (today.getTime() - new Date(input.first_service_date).getTime()) / 315360000000))), projected_lifetime_years: 8, projected_total_clv: 0 }
  ]
  for (const proj of clvProjections) {
    let total = 0
    let annualRev = proj.projected_annual_revenue
    for (let y = 0; y < proj.projected_lifetime_years; y++) {
      total += annualRev
      annualRev = annualRev * (proj.annual_retention_rate / 100)
    }
    proj.projected_total_clv = Math.round(total)
  }

  // Retention risk
  const riskFactors: string[] = []
  if (daysSinceLastVisit > 180) riskFactors.push(`超过180天未进店(${daysSinceLastVisit}天)`)
  if (input.nps_score < 6) riskFactors.push(`NPS评分较低(${input.nps_score}/10)`)
  if (!input.maintenance_plan_active) riskFactors.push('未加入保养计划')
  const churnProb = Math.min(85, Math.round(riskFactors.length * 18 + rand() * 15))
  const riskLevel = churnProb >= 50 ? 'critical' : churnProb >= 35 ? 'high' : churnProb >= 20 ? 'medium' : 'low'
  const intervention = churnProb >= 35 ? '立即安排专属客服回访，赠送检测服务或优惠券' : churnProb >= 20 ? '发送保养提醒短信，提供免费检测' : '纳入常规客户关怀计划'

  // Upsell opportunities
  const upsells: Array<{ service: string; relevance: string; estimated_value: number; urgency: string; script: string }> = []
  if (input.vehicle_mileage > 30000 && !input.service_categories.includes('变速箱保养')) upsells.push({ service: '变速箱油深度保养', relevance: '里程已过3万公里，建议首次变速箱保养', estimated_value: 1500, urgency: 'soon', script: `您的车辆已行驶${input.vehicle_mileage.toLocaleString()}公里，建议进行变速箱深度保养，延长传动系统寿命` })
  if (input.vehicle_age_years >= 3 && !input.service_categories.includes('空调系统')) upsells.push({ service: '空调系统清洗杀菌', relevance: '夏季来临，空调系统已使用3年+', estimated_value: 398, urgency: 'soon', script: '夏季空调使用频率高，建议清洗蒸发箱和管路，保障车内空气质量' })
  if (input.vehicle_mileage > 50000) upsells.push({ service: '刹车系统深度保养', relevance: '高里程制动安全重点检查', estimated_value: 800, urgency: 'medium', script: '您的车辆已行驶较远里程，建议全面检查刹车系统，确保行车安全' })
  if (!input.maintenance_plan_active) upsells.push({ service: '年度保养套餐', relevance: '签约年度保养可节省15%费用', estimated_value: 3500, urgency: 'low', script: '加入我们的年度保养会员计划，享受全年免费检测和折扣优惠' })

  // Customer tier
  let tier: CustomerLifecycleResult['customer_tier'] = 'bronze'
  if (input.total_revenue >= 20000 && input.nps_score >= 8) tier = 'platinum'
  else if (input.total_revenue >= 10000 || input.nps_score >= 7) tier = 'gold'
  else if (input.total_revenue >= 5000) tier = 'silver'
  if (daysSinceLastVisit > 270) tier = 'at_risk'

  const recommendedActions: string[] = []
  if (tier === 'at_risk') recommendedActions.push('触发客户挽回计划，48小时内主动联系')
  if (upsells.length > 0) recommendedActions.push(`推荐${upsells[0].service}，预计转化概率${Math.round(20 + rand() * 30)}%`)
  if (input.referral_count === 0 && input.nps_score >= 7) recommendedActions.push('邀请参与客户推荐计划')
  if (!input.warranty_active && input.vehicle_age_years < 5) recommendedActions.push('推荐延保产品')

  return {
    customer_id: input.customer_id,
    customer_tier: tier,
    clv_projections: clvProjections,
    retention_risk: { risk_level: riskLevel as 'low' | 'medium' | 'high' | 'critical', risk_factors: riskFactors, days_since_last_visit: daysSinceLastVisit, churn_probability: churnProb, recommended_intervention: intervention },
    upsell_opportunities: upsells,
    recommended_actions: recommendedActions,
    estimated_referral_value: input.referral_count * Math.round(input.average_visit_value * 0.8),
    reactivation_campaign_eligible: daysSinceLastVisit > 180,
    dashboard_data: { tier_score: tier === 'platinum' ? 5 : tier === 'gold' ? 4 : tier === 'silver' ? 3 : 2, churn_risk: churnProb, clv_base: clvProjections[1].projected_total_clv, upsell_count: upsells.length }
  }
}

// --- Tool 8: EV Battery Health ---
function analyzeEVBatteryHealth(data: string): BatteryHealthResult {
  const input: BatteryInput = JSON.parse(data)
  const rand = rng(input.vehicle_id + input.manufacture_date)

  const ageYears = (Date.now() - new Date(input.manufacture_date).getTime()) / 31536000000
  const tempFactor = input.temperature_exposure === 'extreme' ? 1.5 : input.temperature_exposure === 'hot' ? 1.2 : 1.0
  const fastChargePenalty = input.fast_charge_pct * 0.02
  const baseDegradationRate = input.battery_chemistry === 'LFP' ? 1.2 : input.battery_chemistry === 'NMC' ? 2.0 : input.battery_chemistry === 'NCA' ? 2.2 : 0.8

  const degradationRate = baseDegradationRate * tempFactor + fastChargePenalty
  const expectedSOH = Math.max(50, Math.round(100 - degradationRate * ageYears * 10) / 10)
  const currentSOH = Math.round((input.full_charge_range_km / input.original_range_km * 100) * 10) / 10
  const remainingLife = Math.max(0, Math.round((currentSOH - 70) / degradationRate * 10) / 10)
  const rangeIn5yr = Math.round(input.full_charge_range_km * Math.pow(0.97, 5) * (1 - degradationRate * 0.01 * 5))

  // Cell balance
  const balanceStatus: CellBalanceAnalysis = (() => {
    const delta = input.recent_obd_data.cell_delta_mv
    if (delta < 50) return { balance_status: 'excellent', max_cell_delta_mv: delta, weakest_cell_position: Math.round(rand() * 100), balancing_action_required: false }
    if (delta < 150) return { balance_status: 'good', max_cell_delta_mv: delta, weakest_cell_position: Math.round(rand() * 100), balancing_action_required: false }
    if (delta < 300) return { balance_status: 'fair', max_cell_delta_mv: delta, weakest_cell_position: Math.round(rand() * 100), balancing_action_required: true }
    return { balance_status: 'poor', max_cell_delta_mv: delta, weakest_cell_position: Math.round(rand() * 100), balancing_action_required: true }
  })()

  // Range anomaly
  const expectedRange = input.original_range_km * (currentSOH / 100)
  const rangeAnomaly = Math.abs(input.full_charge_range_km - expectedRange) > expectedRange * 0.15
  const rangeEfficiency = Math.round((input.full_charge_range_km / expectedRange) * 1000) / 10

  // Overall health
  let overallHealth: BatteryHealthResult['overall_battery_health'] = 'good'
  if (currentSOH >= 90) overallHealth = 'excellent'
  else if (currentSOH >= 80) overallHealth = 'good'
  else if (currentSOH >= 70) overallHealth = 'fair'
  else if (currentSOH >= 60) overallHealth = 'degraded'
  else overallHealth = 'poor'

  const sohGrade = currentSOH >= 90 ? 'A (优秀)' : currentSOH >= 80 ? 'B (良好)' : currentSOH >= 70 ? 'C (一般)' : currentSOH >= 60 ? 'D (衰减)' : 'E (严重衰减)'

  // Charging recommendations
  const chargingPractices: string[] = []
  chargingPractices.push('日常充电保持20%-80% SOC区间，延长电池寿命')
  if (input.fast_charge_pct > 30) chargingPractices.push(`当前快充占比${input.fast_charge_pct}%，建议降低至20%以下`)
  if (input.recent_obd_data.battery_temp_c > 40) chargingPractices.push('电池温度偏高，避免高温环境快充')
  if (input.battery_chemistry === 'LFP') chargingPractices.push('LFP电池建议每周充满一次以校准BMS')
  chargingPractices.push('避免长期低电量(<10%)存放车辆')

  // Warranty claim
  const warrantyEligible = currentSOH < input.warranty_status.capacity_warranty_threshold_pct && input.warranty_status.years_remaining > 0

  // Second life
  let secondLife: 'high' | 'moderate' | 'low' | 'none' = 'none'
  if (currentSOH >= 75) secondLife = 'high'
  else if (currentSOH >= 70) secondLife = 'moderate'
  else if (currentSOH >= 60) secondLife = 'low'

  const replacementCost = Math.round(input.battery_capacity_kwh * 1200)

  return {
    vehicle_id: input.vehicle_id,
    overall_battery_health: overallHealth,
    soh_score: currentSOH,
    soh_grade: sohGrade,
    degradation: { expected_soh_pct: expectedSOH, current_soh_pct: currentSOH, degradation_rate_pct_per_year: Math.round(degradationRate * 100) / 100, remaining_useful_life_years: remainingLife, projected_range_in_5yr_km: rangeIn5yr },
    cell_balance: balanceStatus,
    range_anomaly_detected: rangeAnomaly,
    current_range_efficiency_pct: rangeEfficiency,
    recommended_charging_practices: chargingPractices,
    warranty_claim_eligible: warrantyEligible,
    second_life_potential: secondLife,
    replacement_cost_estimate: replacementCost,
    dashboard_data: { soh: currentSOH, projected_soh: expectedSOH, degradation_rate: degradationRate, warranty_eligible: warrantyEligible ? 1 : 0, replacement_cost: replacementCost }
  }
}

// ==================== SECTION 4 — 报告格式化函数 ====================

function formatUsedCarValuationReport(r: UsedCarValuationResult): string {
  const lines: string[] = []
  lines.push('## 🔧 Used Car Valuation — 二手车估值报告')
  lines.push('')
  lines.push(`> **车辆**: ${r.vehicle_descriptor} | **VIN**: ${r.vin} | **估值区间**: ¥${r.estimated_value_low.toLocaleString()} - ¥${r.estimated_value_high.toLocaleString()} | **置信度**: ${r.confidence_score}%`)
  lines.push('')
  lines.push('### 📊 估值仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    INPUT[车辆信息] --> APPRAISE[专业评估]')
  lines.push('    APPRAISE --> MARKET[市场横向对比]')
  lines.push('    APPRAISE --> DEPRECI[折旧分析]')
  lines.push('    MARKET --> VALUE[综合估值]')
  lines.push('    DEPRECI --> VALUE')
  lines.push(`    LOW[低值: ¥${r.estimated_value_low.toLocaleString()}]`)
  lines.push(`    MID[中值: ¥${r.estimated_value_mid.toLocaleString()}]`)
  lines.push(`    HIGH[高值: ¥${r.estimated_value_high.toLocaleString()}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 估值汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 估值低值 | ¥${r.estimated_value_low.toLocaleString()} |`)
  lines.push(`| 估值中值 | ¥${r.estimated_value_mid.toLocaleString()} |`)
  lines.push(`| 估值高值 | ¥${r.estimated_value_high.toLocaleString()} |`)
  lines.push(`| 建议挂牌价 | ¥${r.recommended_listing_price.toLocaleString()} |`)
  lines.push(`| 预计售出天数 | ${r.days_to_sell_estimate}天 |`)
  lines.push(`| 置信度 | ${r.confidence_score}% |`)
  lines.push('')

  lines.push('### 📊 估值因素分析')
  if (r.valuation_factors.length > 0) {
    lines.push('| 因素 | 影响方向 | 价值影响 | 说明 |')
    lines.push('|------|----------|----------|------|')
    for (const f of r.valuation_factors) {
      lines.push(`| ${f.factor} | ${f.impact === 'positive' ? '正面' : f.impact === 'negative' ? '负面' : '中性'} | ${f.value_impact_pct > 0 ? '+' : ''}${f.value_impact_pct}% | ${f.description} |`)
    }
  }
  lines.push('')

  lines.push('### 📊 市场横向对比')
  for (const mc of r.market_comparisons) {
    lines.push(`- **${mc.source}** — 均价 ¥${mc.avg_price.toLocaleString()} | 中位数 ¥${mc.median_price.toLocaleString()} | 样本量 ${mc.sample_size} | 平均在售 ${mc.days_on_market_avg}天`)
  }
  lines.push('')

  lines.push('### 📊 残值折旧曲线')
  lines.push('| 年份 | 残率 | 预估价值 |')
  lines.push('|------|------|----------|')
  for (const dc of r.depreciation_curve.slice(0, 6)) {
    lines.push(`| ${dc.year} | ${dc.residual_pct}% | ¥${dc.estimated_value.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📋 估值清单')
  lines.push('- [x] 品牌/车型基础价值分析')
  lines.push('- [x] 里程折旧计算')
  lines.push('- [x] 车龄折旧计算')
  lines.push('- [x] 事故记录影响评估')
  lines.push('- [x] 车况评分分析')
  lines.push('- [x] 过户次数评估')
  lines.push('- [x] 燃料类型因素')
  lines.push('- [x] 维保记录完整性')
  lines.push('- [x] 区域市场因素')
  lines.push('- [x] 市场横向对比')
  lines.push('- [x] 残值折旧曲线生成')
  lines.push('- [x] 挂牌价与售出周期建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

function formatVehicleInspectionReport(r: VehicleInspectionResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Vehicle Inspection AI — AI车辆检测报告')
  lines.push('')
  lines.push(`> **检测编号**: ${r.inspection_id} | **总体评分**: ${r.overall_score}/100 | **车况**: ${r.overall_condition.toUpperCase()} | **结论**: ${r.pass_fail === 'pass' ? '通过' : r.pass_fail === 'conditional' ? '有条件通过' : '不通过'}`)
  lines.push('')
  lines.push('### 📊 检测仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    INS[车辆检测] --> STRUCT[结构检测]')
  lines.push('    INS --> MECH[机械检测]')
  lines.push('    INS --> ELEC[电气检测]')
  lines.push('    INS --> COSM[外观检测]')
  lines.push('    STRUCT --> SCORE[综合评分]')
  lines.push('    MECH --> SCORE')
  lines.push('    ELEC --> SCORE')
  lines.push('    COSM --> SCORE')
  lines.push(`    SCORE[综合评分: ${r.overall_score}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 评分总览')
  lines.push('| 维度 | 评分 |')
  lines.push('|------|------|')
  lines.push(`| 结构完整性 | ${r.structural_integrity_score}/100 |`)
  lines.push(`| 机械健康度 | ${r.mechanical_health_score}/100 |`)
  lines.push(`| 电气系统 | ${r.electrical_health_score}/100 |`)
  lines.push(`| 外观状况 | ${r.cosmetic_score}/100 |`)
  lines.push(`| 综合评分 | ${r.overall_score}/100 |`)
  lines.push('')

  lines.push('### ⚠️ 损伤项目')
  if (r.damage_items.length > 0) {
    lines.push('| 部件 | 损伤类型 | 严重程度 | 紧急度 | 修复费用 |')
    lines.push('|------|----------|----------|--------|----------|')
    for (const d of r.damage_items) {
      lines.push(`| ${d.component} | ${d.damage_type} | ${d.severity} | ${d.urgency} | ¥${d.repair_cost_estimate.toLocaleString()} |`)
    }
  } else {
    lines.push('- 未发现明显损伤')
  }
  lines.push('')

  lines.push('### 📋 检测发现')
  if (r.findings.length > 0) {
    for (const f of r.findings) {
      lines.push(`- **[${f.risk_level.toUpperCase()}]** ${f.category}: ${f.finding}`)
      lines.push(`  - 建议: ${f.recommendation}`)
      if (f.estimated_cost > 0) lines.push(`  - 预估费用: ¥${f.estimated_cost.toLocaleString()}`)
    }
  }
  lines.push('')

  if (r.safety_concerns.length > 0) {
    lines.push('### 🚨 安全隐患')
    for (const s of r.safety_concerns) lines.push(`- **${s}**`)
    lines.push('')
  }

  lines.push('### 📊 风险评估')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 事故概率 | ${r.accident_probability}% |`)
  lines.push(`| 里程表回调风险 | ${r.odometer_rollback_risk}% |`)
  lines.push(`| 总维修预估 | ¥${r.total_repair_estimate.toLocaleString()} |`)
  lines.push('')

  lines.push('### 📋 检测清单')
  lines.push('- [x] AI视觉外观损伤检测')
  lines.push('- [x] OBD-II故障码读取')
  lines.push('- [x] 发动机工况分析')
  lines.push('- [x] 油液状态评估')
  lines.push('- [x] 轮胎磨损与气压检测')
  lines.push('- [x] 制动系统检测')
  lines.push('- [x] 电气系统全面检查')
  lines.push('- [x] 事故痕迹识别')
  lines.push('- [x] 里程表回调风险分析')
  lines.push('- [x] 安全隐患排查')
  lines.push('- [x] 维修费用估算')
  lines.push('- [x] 综合评分与结论')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

function formatPredictiveMaintenanceReport(r: PredictiveMaintenanceResult): string {
  const lines: string[] = []
  lines.push('## 🔮 Predictive Maintenance — 预测性维护报告')
  lines.push('')
  lines.push(`> **车辆ID**: ${r.vehicle_id} | **可靠性评分**: ${r.overall_reliability_score}/100 | **紧急程度**: ${r.maintenance_urgency.toUpperCase()} | **12个月维护预算**: ¥${r.maintenance_cost_forecast_12m.toLocaleString()}`)
  lines.push('')
  lines.push('### 📊 维护仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    VEH[车辆数据] --> PRED[故障预测]')
  lines.push('    VEH --> SCHED[保养计划]')
  lines.push('    PRED --> COST[成本预测]')
  lines.push('    SCHED --> COST')
  lines.push(`    REL[可靠性: ${r.overall_reliability_score}]`)
  lines.push(`    COST[12月预算: ¥${r.maintenance_cost_forecast_12m.toLocaleString()}]`)
  lines.push('```')
  lines.push('')

  if (r.critical_alerts.length > 0) {
    lines.push('### 🚨 紧急警报')
    for (const a of r.critical_alerts) lines.push(`- **${a}**`)
    lines.push('')
  }

  lines.push('### 🔮 故障预测')
  if (r.predictions.length > 0) {
    lines.push('| 部件 | 预测失效里程 | 30天概率 | 90天概率 | 建议操作 | 预估费用 | 优先级 |')
    lines.push('|------|-------------|----------|----------|----------|----------|--------|')
    for (const p of r.predictions) {
      lines.push(`| ${p.component} | ${p.predicted_failure_mileage.toLocaleString()}km | ${p.failure_probability_30d}% | ${p.failure_probability_90d}% | ${p.recommended_action} | ¥${p.estimated_repair_cost.toLocaleString()} | ${p.priority} |`)
    }
  } else {
    lines.push('- 暂无重大故障预测')
  }
  lines.push('')

  lines.push('### 📅 近期保养计划')
  if (r.upcoming_services.length > 0) {
    lines.push('| 服务项目 | 到期里程 | 剩余里程 | 剩余天数 | 状态 | 预估费用 |')
    lines.push('|----------|----------|----------|----------|------|----------|')
    for (const s of r.upcoming_services) {
      lines.push(`| ${s.service_type} | ${s.due_at_mileage.toLocaleString()}km | ${s.due_in_km.toLocaleString()}km | ${s.due_in_days}天 | ${s.status} | ¥${s.estimated_cost.toLocaleString()} |`)
    }
  } else {
    lines.push('- 所有保养项目均在正常周期内')
  }
  lines.push('')

  lines.push('### 📋 维护清单')
  lines.push('- [x] 机油及滤清器寿命预测')
  lines.push('- [x] 制动系统磨损预测')
  lines.push('- [x] 轮胎更换周期预测')
  lines.push('- [x] 蓄电池健康度预测')
  lines.push('- [x] 变速箱工况预测')
  lines.push('- [x] 冷却系统状态评估')
  lines.push('- [x] 仪表警告灯分析')
  lines.push('- [x] 12个月维护成本预测')
  lines.push('- [x] 紧急程度评估')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

function formatPartsPricingReport(r: PartsPricingResult): string {
  const lines: string[] = []
  lines.push('## 🔩 Parts Pricing & Sourcing — 配件定价与采购报告')
  lines.push('')
  lines.push(`> **配件**: ${r.part_query} | **OEM号**: ${r.oem_part_number} | **价格区间**: ¥${r.total_cost_range_low.toLocaleString()} - ¥${r.total_cost_range_high.toLocaleString()} | **市场趋势**: ${r.market_price_trend === 'rising' ? '上涨' : r.market_price_trend === 'falling' ? '下降' : '稳定'}`)
  lines.push('')
  lines.push('### 📊 采购仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    QUERY[配件查询] --> OEM[原厂件]')
  lines.push('    QUERY --> AM[品牌件]')
  lines.push('    QUERY --> OL[线上件]')
  lines.push('    QUERY --> US[二手件]')
  lines.push('    OEM --> COMPARE[综合比价]')
  lines.push('    AM --> COMPARE')
  lines.push('    OL --> COMPARE')
  lines.push('    US --> COMPARE')
  lines.push(`    BEST[最佳性价比: ${r.best_value_pick}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📊 供应商报价')
  lines.push('| 供应商 | 类型 | 单价 | 总价 | 质保 | 库存 | 发货 | 可靠性 |')
  lines.push('|--------|------|------|------|------|------|------|--------|')
  for (const q of r.quotes) {
    lines.push(`| ${q.supplier} | ${q.supplier_type} | ¥${q.unit_price.toLocaleString()} | ¥${q.total_price.toLocaleString()} | ${q.warranty_months}月 | ${q.availability} | ${q.shipping_days}天 | ${q.reliability_score}% |`)
  }
  lines.push('')

  lines.push('### 📊 替代方案')
  for (const a of r.alternatives) {
    lines.push(`- **${a.alternative_type}** (${a.brand}) — ¥${a.price.toLocaleString()} | 品质: ${a.quality_rating} | 节省: ${a.savings_pct}% | 权衡: ${a.trade_offs}`)
  }
  lines.push('')

  lines.push('### 📋 采购建议')
  lines.push(`| 指标 | 推荐 |`)
  lines.push(`|------|------|`)
  lines.push(`| 最佳性价比 | ${r.best_value_pick} |`)
  lines.push(`| 最快到货 | ${r.fastest_availability_pick} |`)
  lines.push(`| 价格区间 | ¥${r.total_cost_range_low.toLocaleString()} - ¥${r.total_cost_range_high.toLocaleString()} |`)
  lines.push(`| 市场趋势 | ${r.market_price_trend === 'rising' ? '上涨' : r.market_price_trend === 'falling' ? '下降' : '稳定'} |`)
  lines.push('')

  lines.push('### 📋 采购清单')
  lines.push('- [x] OEM原厂件价格查询')
  lines.push('- [x] 品牌替代件比价')
  lines.push('- [x] 线上平台比价')
  lines.push('- [x] 二手拆车件查询')
  lines.push('- [x] 库存与发货时效评估')
  lines.push('- [x] 供应商可靠性评分')
  lines.push('- [x] 替代方案分析')
  lines.push('- [x] 市场趋势判断')
  lines.push('- [x] 最佳采购推荐')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

function formatClaimsEstimationReport(r: ClaimsEstimationResult): string {
  const lines: string[] = []
  lines.push('## 📋 Insurance Claims Estimator — 保险理赔估算报告')
  lines.push('')
  lines.push(`> **理赔号**: ${r.claim_id} | **总维修费用**: ¥${r.total_repair_cost.toLocaleString()} | **预估赔付**: ¥${r.estimated_payout.toLocaleString()} | **全损候选**: ${r.is_total_loss_candidate ? '是' : '否'}`)
  lines.push('')
  lines.push('### 📊 理赔仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    INC[事故报案] --> ASSESS[损失评估]')
  lines.push('    ASSESS --> PARTS[配件定价]')
  lines.push('    ASSESS --> LABOR[工时计算]')
  lines.push('    ASSESS --> PAINT[喷漆费用]')
  lines.push('    PARTS --> TOTAL[总维修费]')
  lines.push('    LABOR --> TOTAL')
  lines.push('    PAINT --> TOTAL')
  lines.push('    TOTAL --> PAYOUT[赔付金额]')
  lines.push(`    PAYOUT[赔付: ¥${r.estimated_payout.toLocaleString()}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 损失评估明细')
  lines.push('| 受损区域 | 损伤程度 | 维修方式 | 配件费 | 工时 | 工时费 | 喷漆费 | 小计 |')
  lines.push('|----------|----------|----------|--------|------|--------|--------|------|')
  for (const a of r.damage_assessments) {
    lines.push(`| ${a.area} | ${a.damage_level} | ${a.repair_method} | ¥${a.parts_cost.toLocaleString()} | ${a.labor_hours}h | ¥${a.labor_cost.toLocaleString()} | ¥${a.paint_cost.toLocaleString()} | ¥${a.subtotal.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📊 费用汇总')
  lines.push('| 项目 | 金额 |')
  lines.push('|------|------|')
  lines.push(`| 配件费用合计 | ¥${r.total_parts_cost.toLocaleString()} |`)
  lines.push(`| 工时费用合计 | ¥${r.total_labor_cost.toLocaleString()} |`)
  lines.push(`| 喷漆费用合计 | ¥${r.total_paint_cost.toLocaleString()} |`)
  lines.push(`| **总维修费用** | **¥${r.total_repair_cost.toLocaleString()}** |`)
  lines.push(`| 免赔额 | -¥${r.deductible_amount.toLocaleString()} |`)
  lines.push(`| **预估赔付** | **¥${r.estimated_payout.toLocaleString()}** |`)
  lines.push('')

  lines.push('### 📊 维修/更换分析')
  for (const b of r.repair_vs_replace_breakdown) {
    lines.push(`- **${b.action}**: ${b.count}项，费用 ¥${b.cost.toLocaleString()}`)
  }
  lines.push('')

  if (r.is_total_loss_candidate) {
    lines.push('### ⚠️ 推定全损分析')
    lines.push(`- 维修费用超过车辆实际价值${r.total_loss_threshold_pct}%阈值`)
    lines.push(`- 预估残值: ¥${r.salvage_value_estimate.toLocaleString()}`)
    lines.push('- 建议与保险公司协商推定全损处理')
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('### 📋 理赔建议')
    for (const rec of r.recommendations) lines.push(`- ${rec}`)
    lines.push('')
  }

  lines.push('### 📋 理赔清单')
  lines.push('- [x] 事故类型与责任分析')
  lines.push('- [x] 受损区域逐项评估')
  lines.push('- [x] 配件价格查询')
  lines.push('- [x] 工时定额计算')
  lines.push('- [x] 喷漆费用估算')
  lines.push('- [x] 推定全损判定')
  lines.push('- [x] 免赔额计算')
  lines.push('- [x] 赔付金额估算')
  lines.push('- [x] 理赔时效预估')
  lines.push('- [x] 理赔建议生成')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

function formatWorkshopOperationsReport(r: WorkshopOperationsResult): string {
  const lines: string[] = []
  lines.push('## 🏭 Workshop Operations — 车间运营报告')
  lines.push('')
  lines.push(`> **车间**: ${r.workshop_id} | **利用率**: ${r.metrics.utilization_rate_pct}% | **效率**: ${r.metrics.efficiency_rate_pct}% | **30天营收预测**: ¥${r.revenue_forecast_30d.toLocaleString()} | **目标达成率**: ${r.projected_monthly_vs_target_pct}%`)
  lines.push('')
  lines.push('### 📊 运营仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    BAYS[工位资源] --> UTIL[利用率分析]')
  lines.push('    TECHS[技师资源] --> EFF[效率分析]')
  lines.push('    JOBS[工单队列] --> SCHED[排程优化]')
  lines.push('    UTIL --> METRICS[运营指标]')
  lines.push('    EFF --> METRICS')
  lines.push('    SCHED --> METRICS')
  lines.push(`    REV[30天预测: ¥${r.revenue_forecast_30d.toLocaleString()}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📊 运营指标')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 工位利用率 | ${r.metrics.utilization_rate_pct}% |`)
  lines.push(`| 综合效率 | ${r.metrics.efficiency_rate_pct}% |`)
  lines.push(`| 单工位营收 | ¥${r.metrics.revenue_per_bay.toLocaleString()} |`)
  lines.push(`| 单人营收 | ¥${r.metrics.revenue_per_technician.toLocaleString()} |`)
  lines.push(`| 平均交车时间 | ${r.metrics.average_job_turnaround_hours}小时 |`)
  lines.push(`| 配件周转率 | ${r.metrics.parts_turnover_rate}次/月 |`)
  lines.push(`| 今日剩余产能 | ${r.capacity_remaining_today}小时 |`)
  lines.push('')

  if (r.bottleneck_analysis.length > 0) {
    lines.push('### ⚠️ 瓶颈分析')
    for (const b of r.bottleneck_analysis) lines.push(`- ${b}`)
    lines.push('')
  }

  if (r.scheduling_recommendations.length > 0) {
    lines.push('### 📋 排程建议')
    lines.push('| 工单 | 推荐工位 | 推荐技师 | 建议开始 | 优先级 | 理由 |')
    lines.push('|------|----------|----------|----------|--------|------|')
    for (const s of r.scheduling_recommendations) {
      lines.push(`| ${s.job_id} | ${s.recommended_bay}号 | ${s.recommended_technician} | ${s.suggested_start_hour}:00 | ${s.priority_score} | ${s.reasoning} |`)
    }
    lines.push('')
  }

  if (r.overloaded_technicians.length > 0) {
    lines.push('### ⚠️ 超负荷技师')
    for (const o of r.overloaded_technicians) lines.push(`- ${o}`)
    lines.push('')
  }

  if (r.optimization_actions.length > 0) {
    lines.push('### 📋 优化建议')
    for (const a of r.optimization_actions) lines.push(`- ${a}`)
    lines.push('')
  }

  lines.push('### 📋 运营清单')
  lines.push('- [x] 工位利用率分析')
  lines.push('- [x] 技师效率评估')
  lines.push('- [x] 工单排程优化')
  lines.push('- [x] 瓶颈识别与分析')
  lines.push('- [x] 营收预测')
  lines.push('- [x] 目标达成率分析')
  lines.push('- [x] 资源利用率评估')
  lines.push('- [x] 优化建议生成')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

function formatCustomerLifecycleReport(r: CustomerLifecycleResult): string {
  const lines: string[] = []
  lines.push('## 👥 Customer Lifecycle — 客户生命周期报告')
  lines.push('')
  lines.push(`> **客户**: ${r.customer_id} | **客户等级**: ${r.customer_tier.toUpperCase()} | **流失概率**: ${r.retention_risk.churn_probability}% | **流失风险**: ${r.retention_risk.risk_level.toUpperCase()}`)
  lines.push('')
  lines.push('### 📊 客户仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    ACQ[获客] --> RETAIN[留存]')
  lines.push('    RETAIN --> UPSELL[增购/升级]')
  lines.push('    UPSELL --> REFER[推荐]')
  lines.push('    RETAIN --> CHURN{流失风险}')
  lines.push(`    CLV[客户终身价值: ¥${r.clv_projections[1]?.projected_total_clv.toLocaleString() || 0}]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📊 客户终身价值预测')
  lines.push('| 场景 | 年留存率 | 年收入 | 生命周期 | 总CLV |')
  lines.push('|------|----------|--------|----------|--------|')
  for (const c of r.clv_projections) {
    lines.push(`| ${c.scenario} | ${c.annual_retention_rate}% | ¥${c.projected_annual_revenue.toLocaleString()} | ${c.projected_lifetime_years}年 | ¥${c.projected_total_clv.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### ⚠️ 流失风险分析')
  lines.push(`| 指标 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 风险等级 | ${r.retention_risk.risk_level.toUpperCase()} |`)
  lines.push(`| 流失概率 | ${r.retention_risk.churn_probability}% |`)
  lines.push(`| 距上次进店 | ${r.retention_risk.days_since_last_visit}天 |`)
  lines.push(`| 建议干预 | ${r.retention_risk.recommended_intervention} |`)
  if (r.retention_risk.risk_factors.length > 0) {
    lines.push('风险因素:')
    for (const f of r.retention_risk.risk_factors) lines.push(`  - ${f}`)
  }
  lines.push('')

  if (r.upsell_opportunities.length > 0) {
    lines.push('### 📊 增购机会')
    for (const u of r.upsell_opportunities) {
      lines.push(`- **${u.service}** — 预估价值 ¥${u.estimated_value.toLocaleString()} | 紧急度: ${u.urgency}`)
      lines.push(`  - ${u.script}`)
    }
    lines.push('')
  }

  if (r.recommended_actions.length > 0) {
    lines.push('### 📋 推荐行动')
    for (const a of r.recommended_actions) lines.push(`- ${a}`)
    lines.push('')
  }

  lines.push('### 📋 客户管理清单')
  lines.push('- [x] 客户等级评估')
  lines.push('- [x] 终身价值预测（保守/基准/乐观）')
  lines.push('- [x] 流失风险分析')
  lines.push('- [x] 流失因素识别')
  lines.push('- [x] 增购机会挖掘')
  lines.push('- [x] 推荐话术生成')
  lines.push('- [x] 推荐客户价值评估')
  lines.push('- [x] 再营销活动资格判定')
  lines.push('- [x] 客户挽回建议')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

function formatEVBatteryHealthReport(r: BatteryHealthResult): string {
  const lines: string[] = []
  lines.push('## 🔋 EV Battery Health — 电动车电池健康报告')
  lines.push('')
  lines.push(`> **车辆**: ${r.vehicle_id} | **SOH评分**: ${r.soh_score}% | **等级**: ${r.soh_grade} | **健康状态**: ${r.overall_battery_health.toUpperCase()} | **梯次利用潜力**: ${r.second_life_potential}`)
  lines.push('')
  lines.push('### 📊 电池仪表盘')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    BATT[电池包] --> SOH[SOH健康度]')
  lines.push('    BATT --> CELL[电芯均衡]')
  lines.push('    BATT --> RANGE[续航分析]')
  lines.push('    SOH --> DEGRAD[衰减预测]')
  lines.push('    DEGRAD --> LIFE[梯次利用评估]')
  lines.push(`    SOH_SCORE[SOH: ${r.soh_score}%]`)
  lines.push(`    RANGE_EFF[续航效率: ${r.current_range_efficiency_pct}%]`)
  lines.push('```')
  lines.push('')

  lines.push('### 📊 健康度总览')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| SOH评分 | ${r.soh_score}% |`)
  lines.push(`| 健康等级 | ${r.soh_grade} |`)
  lines.push(`| 健康状态 | ${r.overall_battery_health.toUpperCase()} |`)
  lines.push(`| 续航效率 | ${r.current_range_efficiency_pct}% |`)
  lines.push(`| 续航异常 | ${r.range_anomaly_detected ? '是' : '否'} |`)
  lines.push('')

  lines.push('### 📊 衰减分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 当前SOH | ${r.degradation.current_soh_pct}% |`)
  lines.push(`| 预期SOH | ${r.degradation.expected_soh_pct}% |`)
  lines.push(`| 年衰减率 | ${r.degradation.degradation_rate_pct_per_year}%/年 |`)
  lines.push(`| 剩余使用寿命 | ${r.degradation.remaining_useful_life_years}年 |`)
  lines.push(`| 5年后预估续航 | ${r.degradation.projected_range_in_5yr_km}km |`)
  lines.push('')

  lines.push('### 📊 电芯均衡分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 均衡状态 | ${r.cell_balance.balance_status} |`)
  lines.push(`| 最大压差 | ${r.cell_balance.max_cell_delta_mv}mV |`)
  lines.push(`| 最弱电芯位置 | #${r.cell_balance.weakest_cell_position} |`)
  lines.push(`| 需均衡维护 | ${r.cell_balance.balancing_action_required ? '是' : '否'} |`)
  lines.push('')

  lines.push('### 📋 充电建议')
  for (const p of r.recommended_charging_practices) lines.push(`- ${p}`)
  lines.push('')

  lines.push('### 📊 质保与梯次利用')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 质保索赔资格 | ${r.warranty_claim_eligible ? '符合' : '不符合'} |`)
  lines.push(`| 梯次利用潜力 | ${r.second_life_potential} |`)
  lines.push(`| 更换费用预估 | ¥${r.replacement_cost_estimate.toLocaleString()} |`)
  lines.push('')

  lines.push('### 📋 电池检测清单')
  lines.push('- [x] SOH健康度评估')
  lines.push('- [x] 电芯一致性分析')
  lines.push('- [x] 续航异常检测')
  lines.push('- [x] 衰减趋势预测')
  lines.push('- [x] 剩余使用寿命估算')
  lines.push('- [x] 充电行为建议')
  lines.push('- [x] 质保索赔资格判定')
  lines.push('- [x] 梯次利用潜力评估')
  lines.push('- [x] 更换成本预估')
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  lines.push('*AutoAfterAgent v1.0.0 — AI-Powered Auto Aftermarket Intelligence*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Used Car Valuation — 二手车估值
  tools.register(defineTool({
    name: 'used_car_valuation',
    description: '二手车估值 | 多维度车况/市场/残值分析 | Multi-dimensional used car valuation with market comparison and depreciation curve.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vin, brand, model, year, mileage, fuel_type(gasoline|diesel|hybrid|ev), transmission, body_type, color, owner_count, accident_history, service_history_complete, condition_score, region, listing_price?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatUsedCarValuationReport(analyzeUsedCarValuation(args.input_data))
    }
  }))

  // Tool 2: Vehicle Inspection AI — AI车辆检测
  tools.register(defineTool({
    name: 'vehicle_inspection_ai',
    description: 'AI车辆检测 | 视觉损伤/机械健康/事故识别 | AI-powered vehicle inspection with damage detection, mechanical health, and accident identification.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: inspection_id, vin, brand_model, year, mileage, inspection_type(pre_purchase|periodic|pre_sale|insurance), image_damage_scores[{panel, damage_prob, severity}], diagnostic_codes[], fluid_conditions{oil, coolant, brake, transmission}, tire_measurements[{position, tread_depth_mm, pressure_psi}], brake_measurements[{position, pad_thickness_mm, rotor_condition}], engine_health_score, suspension_notes[], electrical_systems_check[{system, status(pass|warn|fail)}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatVehicleInspectionReport(analyzeVehicleInspection(args.input_data))
    }
  }))

  // Tool 3: Predictive Maintenance — 预测性维护
  tools.register(defineTool({
    name: 'predictive_maintenance_after',
    description: '预测性维护 | 故障预警/保养周期/寿命预测 | Predictive maintenance with failure forecasting, service scheduling, and component life prediction.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vehicle_id, brand, model, year, current_mileage, last_service_mileage, last_service_date, oil_change_interval_km, driving_conditions(normal|severe|extreme), warning_lights[], fluid_health_index, brake_wear_pct, tire_wear_pct, battery_health_pct, transmission_health_pct, coolant_health_pct, historical_failures[{component, at_mileage, repair_cost}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatPredictiveMaintenanceReport(analyzePredictiveMaintenance(args.input_data))
    }
  }))

  // Tool 4: Parts Pricing & Sourcing — 配件定价与采购
  tools.register(defineTool({
    name: 'parts_pricing_sourcing',
    description: '配件定价与采购 | OEM/副厂/二手件比价 | Parts pricing and sourcing with OEM, aftermarket, and salvage comparison.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: part_query, oem_part_number, brand_model, year, part_category(engine|transmission|brakes|suspension|body|electrical|interior|exhaust|cooling|fuel), quality_preference(oem|aftermarket|used|any), quantity_needed, urgency(standard|expedited|emergency), region'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatPartsPricingReport(analyzePartsPricing(args.input_data))
    }
  }))

  // Tool 5: Insurance Claims Estimator — 保险理赔估算
  tools.register(defineTool({
    name: 'insurance_claims_estimator',
    description: '保险理赔估算 | 定损/工时/配件/赔付分析 | Insurance claims estimation with damage assessment, labor hours, parts cost, and payout analysis.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: claim_id, vehicle_info{brand, model, year, vin}, incident_type(collision|theft|vandalism|weather|single_vehicle|hit_and_run), incident_date, damage_description, damaged_areas[], airbags_deployed, vehicle_drivable, police_report_filed, third_party_involved, insurance_coverage{comprehensive, collision, liability, deductible}, repair_facility_type(dealership|independent|chain_shop)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatClaimsEstimationReport(analyzeClaimsEstimation(args.input_data))
    }
  }))

  // Tool 6: Workshop Operations — 车间运营
  tools.register(defineTool({
    name: 'workshop_operations',
    description: '车间运营 | 排程/工位/技师/效率优化 | Workshop operations optimization with scheduling, bay utilization, and technician efficiency.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: workshop_id, name, bays_total, technicians_count, current_jobs[{job_id, service_type, estimated_hours, priority, bay_assigned, technician_id}], daily_capacity_hours, hours_utilized_yesterday, avg_labor_rate, monthly_revenue, monthly_target, customer_satisfaction_score, comeback_rate_pct, parts_inventory_days, technician_skill_matrix[{tech_id, name, specialties[], efficiency_rating, current_workload_hours}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatWorkshopOperationsReport(analyzeWorkshopOperations(args.input_data))
    }
  }))

  // Tool 7: Customer Lifecycle — 客户生命周期
  tools.register(defineTool({
    name: 'customer_lifecycle_after',
    description: '客户生命周期 | 获客/留存/增购/LTV | Customer lifecycle management with retention risk, CLV projection, and upsell opportunities.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: customer_id, acquisition_channel, first_service_date, total_visits, total_revenue, last_visit_date, average_visit_value, service_categories[], warranty_active, nps_score, vehicle_age_years, vehicle_mileage, communication_preference, referral_count, maintenance_plan_active'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatCustomerLifecycleReport(analyzeCustomerLifecycle(args.input_data))
    }
  }))

  // Tool 8: EV Battery Health — 电动车电池健康
  tools.register(defineTool({
    name: 'ev_battery_health',
    description: '电动车电池健康 | SOH/SOH预测/梯次利用 | EV battery health assessment with SOH analysis, cell balancing, and second-life potential.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vehicle_id, brand_model, battery_capacity_kwh, battery_chemistry(NMC|LFP|NCA|solid_state), manufacture_date, current_odometer_km, full_charge_range_km, original_range_km, charge_cycles_count, avg_charging_speed_kw, fast_charge_pct, temperature_exposure(moderate|hot|extreme), recent_obd_data{cell_voltage_min, cell_voltage_max, cell_delta_mv, battery_temp_c, charging_status}, warranty_status{years_remaining, capacity_warranty_threshold_pct}'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatEVBatteryHealthReport(analyzeEVBatteryHealth(args.input_data))
    }
  }))

  console.log(`[autoafteragent] Loaded v${VERSION} — Auto Aftermarket AI Assistant with 8 tools`)
  console.log('  Tools: used_car_valuation, vehicle_inspection_ai, predictive_maintenance_after, parts_pricing_sourcing, insurance_claims_estimator, workshop_operations, customer_lifecycle_after, ev_battery_health')
}
