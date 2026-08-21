/**
 * DSH 智慧能源AI助手 v1.0.0 (energyagentpro)
 * 新能源运营与碳管理智能体 for DeepSeek Harness — 聚焦新能源运营、电网优化、碳管理、综合能源服务全流程
 *
 * 工具清单:
 * 1. renewable_energy_optimizer  — 新能源优化（光伏/风电功率预测、弃电分析、消纳优化、储能调度、并网管理）
 * 2. smart_grid_manager           — 智能电网管理（负荷预测、调度优化、电压控制、故障定位、自愈控制）
 * 3. carbon_footprint_tracker     — 碳足迹追踪（排放核算、碳强度、减排路径、碳配额、碳交易策略）
 * 4. energy_storage_manager       — 储能管理（充放电策略、寿命评估、容量配置、峰谷套利、安全监控）
 * 5. demand_response_coordinator  — 需求响应协调（可中断负荷、虚拟电厂、响应策略、补偿结算、用户管理）
 * 6. energy_efficiency_auditor    — 能效审计（能耗分析、节能诊断、改造方案、投资回收、能效对标）
 * 7. distributed_energy_planner   — 分布式能源规划（微网设计、多能互补、容量优化、接入方案、经济性分析）
 * 8. energy_trading_advisor       — 能源交易顾问（现货市场、中长期合约、绿证交易、风险管理、组合优化）
 *
 * @module dsh-tool-energyagentpro | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 *
 * 免责声明: 本分析基于AI模型推断，仅供能源管理参考，不替代专业电力工程与碳核查决策。
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'energyagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析基于AI模型推断，仅供能源管理参考，不替代专业电力工程与碳核查决策。'

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

// --- Tool 1: Renewable Energy Optimizer ---
interface RenewableInput {
  plant_type: 'solar' | 'wind' | 'hybrid'
  capacity_mw: number
  location: string
  forecast_hours: number
  historical_output?: number[]
  curtailment_rate?: number
  storage_mwh?: number
}

interface PowerForecast {
  hour: number
  predicted_mw: number
  confidence_low: number
  confidence_high: number
  weather_factor: string
}

interface CurtailmentAnalysis {
  current_rate: number
  target_rate: number
  lost_mwh: number
  economic_loss_kyuan: number
  root_causes: string[]
}

interface StorageSchedule {
  hour: number
  action: 'charge' | 'discharge' | 'idle'
  power_mw: number
  soc_pct: number
}

interface RenewableResult {
  plant_type: string
  capacity_mw: number
  forecasts: PowerForecast[]
  curtailment: CurtailmentAnalysis
  storage_schedule: StorageSchedule[]
  grid_integration_score: number
  recommendations: string[]
}

// --- Tool 2: Smart Grid Manager ---
interface GridInput {
  grid_region: string
  base_load_mw: number
  peak_load_mw: number
  renewable_penetration_pct: number
  voltage_level_kv: number
  fault_detected: boolean
  fault_section?: string
}

interface LoadForecast {
  hour: number
  forecast_mw: number
  actual_mw: number
  deviation_pct: number
}

interface DispatchPlan {
  source: string
  output_mw: number
  cost_per_mwh: number
  co2_kg_per_mwh: number
  status: 'running' | 'standby' | 'startup'
}

interface VoltageControl {
  bus_id: string
  voltage_kv: number
  target_kv: number
  reactive_power_mvar: number
  tap_position: number
}

interface FaultLocation {
  section: string
  distance_km: number
  fault_type: string
  isolation_status: 'isolated' | 'pending'
  self_heal_eta_min: number
}

interface GridResult {
  grid_region: string
  load_forecasts: LoadForecast[]
  dispatch_plan: DispatchPlan[]
  voltage_controls: VoltageControl[]
  fault_location: FaultLocation | null
  grid_stability_score: number
  recommendations: string[]
}

// --- Tool 3: Carbon Footprint Tracker ---
interface CarbonInput {
  entity_name: string
  reporting_year: number
  scope1_sources: Array<{ source: string; emission_tco2: number }>
  scope2_sources: Array<{ source: string; emission_tco2: number }>
  scope3_sources: Array<{ source: string; emission_tco2: number }>
  gdp_myuan?: number
  output_tons?: number
  carbon_price_per_ton?: number
}

interface EmissionSummary {
  scope1_total: number
  scope2_total: number
  scope3_total: number
  grand_total: number
  intensity_per_gdp: number
  intensity_per_output: number
}

interface ReductionPath {
  year: number
  target_reduction_pct: number
  measures: string[]
  investment_myuan: number
  annual_saving_tco2: number
}

interface CarbonQuota {
  allocated: number
  actual: number
  surplus: number
  market_price: number
  trade_action: 'buy' | 'sell' | 'hold'
}

interface CarbonResult {
  entity_name: string
  reporting_year: number
  emission_summary: EmissionSummary
  reduction_path: ReductionPath[]
  carbon_quota: CarbonQuota
  trading_strategy: string[]
  recommendations: string[]
}

// --- Tool 4: Energy Storage Manager ---
interface StorageInput {
  battery_type: 'lithium' | 'flow' | 'sodium' | 'compressed_air'
  capacity_mwh: number
  power_mw: number
  cycle_life: number
  current_soc_pct: number
  electricity_price: Array<{ hour: number; price_yuan: number }>
  safety_threshold: number
}

interface ChargeSchedule {
  hour: number
  action: 'charge' | 'discharge' | 'idle'
  power_mw: number
  soc_after_pct: number
  price_yuan: number
  profit_kyuan: number
}

interface LifeAssessment {
  soh_pct: number
  remaining_cycles: number
  remaining_years: number
  degradation_rate_pct: number
  replacement_recommended: boolean
}

interface CapacityConfig {
  optimal_power_mw: number
  optimal_capacity_mwh: number
  round_trip_efficiency_pct: number
  annual_revenue_kyuan: number
  payback_years: number
}

interface SafetyMonitor {
  temperature_c: number
  voltage_v: number
  current_a: number
  soc_pct: number
  alarm_level: 'normal' | 'warning' | 'critical'
  actions: string[]
}

interface StorageResult {
  battery_type: string
  charge_schedule: ChargeSchedule[]
  life_assessment: LifeAssessment
  capacity_config: CapacityConfig
  safety_monitor: SafetyMonitor
  peak_arbitrage_profit_kyuan: number
  recommendations: string[]
}

// --- Tool 5: Demand Response Coordinator ---
interface DemandResponseInput {
  region: string
  total_interruptible_load_mw: number
  vpp_capacity_mw: number
  response_type: 'price_based' | 'incentive_based' | 'hybrid'
  event_duration_hours: number
  participants: Array<{ id: string; load_mw: number; flexibility_pct: number }>
  compensation_rate_yuan: number
}

interface InterruptibleLoad {
  participant_id: string
  baseline_mw: number
  reduced_mw: number
  reduction_pct: number
  duration_hours: number
  compensation_kyuan: number
}

interface VPPDispatch {
  resource: string
  capacity_mw: number
  dispatched_mw: number
  response_time_min: number
  availability_pct: number
}

interface ResponseStrategy {
  trigger_condition: string
  target_reduction_mw: number
  activation_lead_time_min: number
  priority: 'high' | 'medium' | 'low'
  estimated_success_rate: number
}

interface SettlementResult {
  participant_id: string
  baseline_mw: number
  actual_mw: number
  reduced_mw: number
  compensation_kyuan: number
  penalty_kyuan: number
  net_payment_kyuan: number
}

interface DemandResponseResult {
  region: string
  interruptible_loads: InterruptibleLoad[]
  vpp_dispatch: VPPDispatch[]
  response_strategies: ResponseStrategy[]
  settlements: SettlementResult[]
  total_reduction_mw: number
  total_compensation_kyuan: number
  recommendations: string[]
}

// --- Tool 6: Energy Efficiency Auditor ---
interface AuditInput {
  facility_name: string
  facility_type: 'factory' | 'building' | 'data_center' | 'hospital'
  annual_energy_mwh: number
  annual_cost_kyuan: number
  floor_area_sqm: number
  equipment_list: Array<{ name: string; power_kw: number; hours_per_day: number; efficiency_pct: number }>
  benchmark_kwh_per_sqm: number
}

interface EnergyConsumption {
  category: string
  consumption_mwh: number
  percentage: number
  cost_kyuan: number
  benchmark_pct: number
  status: 'efficient' | 'normal' | 'wasteful'
}

interface SavingMeasure {
  measure: string
  investment_kyuan: number
  annual_saving_mwh: number
  annual_saving_kyuan: number
  payback_years: number
  co2_reduction_t: number
  priority: 'high' | 'medium' | 'low'
}

interface RetrofitPlan {
  phase: number
  measures: string[]
  total_investment_kyuan: number
  total_annual_saving_kyuan: number
  co2_reduction_t: number
  implementation_months: number
}

interface BenchmarkComparison {
  metric: string
  actual: number
  benchmark: number
  best_in_class: number
  gap_pct: number
  grade: 'A' | 'B' | 'C' | 'D' | 'E'
}

interface AuditResult {
  facility_name: string
  consumption_breakdown: EnergyConsumption[]
  saving_measures: SavingMeasure[]
  retrofit_plan: RetrofitPlan[]
  benchmark_comparison: BenchmarkComparison[]
  total_potential_saving_pct: number
  recommendations: string[]
}

// --- Tool 7: Distributed Energy Planner ---
interface DistributedInput {
  project_name: string
  load_demand_mw: number
  solar_resource_kwh_m2: number
  wind_resource_ms: number
  gas_available: boolean
  grid_connection: 'on_grid' | 'off_grid' | 'microgrid'
  land_area_sqm: number
  budget_myuan: number
}

interface MicrogridDesign {
  solar_capacity_mw: number
  wind_capacity_mw: number
  battery_mwh: number
  diesel_backup_mw: number
  total_investment_myuan: number
  self_sufficiency_pct: number
  reliability_pct: number
}

interface MultiEnergyComplement {
  source: string
  capacity_mw: number
  annual_output_gwh: number
  capacity_factor_pct: number
  co2_factor: number
  lcoe_yuan_per_mwh: number
}

interface CapacityOptimization {
  optimal_solar_mw: number
  optimal_wind_mw: number
  optimal_battery_mwh: number
  optimal_inverter_mw: number
  total_cost_myuan: number
  npv_myuan: number
  irr_pct: number
}

interface GridAccess {
  access_voltage_kv: number
  line_length_km: number
  substation_capacity_mva: number
  connection_cost_myuan: number
  approval_timeline_months: number
  technical_requirements: string[]
}

interface DistributedResult {
  project_name: string
  microgrid_design: MicrogridDesign
  multi_energy: MultiEnergyComplement[]
  capacity_optimization: CapacityOptimization
  grid_access: GridAccess
  economic_analysis: { roi_pct: number; payback_years: number; annual_revenue_kyuan: number }
  recommendations: string[]
}

// --- Tool 8: Energy Trading Advisor ---
interface TradingInput {
  market_type: 'spot' | 'forward' | 'green_certificate' | 'carbon' | 'capacity'
  position_mwh: number
  price_forecast: Array<{ period: string; price_yuan: number; volatility: number }>
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  contract_duration_months: number
  green_cert_required: boolean
  carbon_allowance_t: number
}

interface SpotMarket {
  period: string
  forecast_price: number
  recommended_action: 'buy' | 'sell' | 'hold'
  volume_mwh: number
  expected_profit_kyuan: number
  risk_level: 'low' | 'medium' | 'high'
}

interface ForwardContract {
  contract_month: string
  strike_price: number
  volume_mwh: number
  premium_kyuan: number
  delivery_type: 'physical' | 'financial'
  credit_requirement_kyuan: number
}

interface GreenCertificate {
  certificate_type: 'i_rec' | 'apx_tigrs' | 'china_green'
  volume_mwh: number
  price_per_mwh: number
  vintage_year: number
  retirement_status: 'active' | 'retired'
  compliance_value: string
}

interface RiskMetric {
  var_95_pct: number
  cvar_95_pct: number
  max_drawdown_pct: number
  sharpe_ratio: number
  hedge_ratio: number
  diversification_score: number
}

interface PortfolioOptimization {
  asset: string
  weight_pct: number
  expected_return_pct: number
  risk_contribution_pct: number
  correlation_to_portfolio: number
}

interface TradingResult {
  market_type: string
  spot_market: SpotMarket[]
  forward_contracts: ForwardContract[]
  green_certificates: GreenCertificate[]
  risk_metrics: RiskMetric
  portfolio_optimization: PortfolioOptimization[]
  total_expected_return_kyuan: number
  recommendations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Renewable Energy Optimizer ---
function analyzeRenewableEnergy(input: RenewableInput): RenewableResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.plant_type + input.location + input.capacity_mw
  ))

  const forecasts: PowerForecast[] = []
  for (let h = 0; h < Math.min(input.forecast_hours, 24); h++) {
    const solarFactor = input.plant_type === 'wind' ? 0.5 + rng.nextFloat(0, 0.5) :
      Math.sin((h - 6) * Math.PI / 12) > 0 ? Math.sin((h - 6) * Math.PI / 12) * rng.nextFloat(0.7, 1.0) : 0
    const windFactor = input.plant_type === 'solar' ? 0.3 + rng.nextFloat(0, 0.4) :
      rng.nextFloat(0.2, 0.95)
    const factor = input.plant_type === 'hybrid' ? (solarFactor + windFactor) / 2 :
      input.plant_type === 'solar' ? solarFactor : windFactor
    const predicted = Math.round(input.capacity_mw * factor * 100) / 100
    forecasts.push({
      hour: h,
      predicted_mw: predicted,
      confidence_low: Math.round(predicted * 0.8 * 100) / 100,
      confidence_high: Math.round(predicted * 1.15 * 100) / 100,
      weather_factor: factor > 0.7 ? '优' : factor > 0.4 ? '良' : '差',
    })
  }

  const curtailmentRate = input.curtailment_rate || rng.nextFloat(0.03, 0.15)
  const totalGeneration = forecasts.reduce((s, f) => s + f.predicted_mw, 0)
  const lostMwh = Math.round(totalGeneration * curtailmentRate * 100) / 100
  const curtailment: CurtailmentAnalysis = {
    current_rate: Math.round(curtailmentRate * 10000) / 10000,
    target_rate: 0.03,
    lost_mwh: lostMwh,
    economic_loss_kyuan: Math.round(lostMwh * 400),
    root_causes: rng.next() > 0.5 ? ['输电通道不足', '调峰能力受限'] : ['负荷低谷消纳困难', '预测偏差大'],
  }

  const storageSchedule: StorageSchedule[] = []
  let soc = 50
  for (let h = 0; h < Math.min(input.forecast_hours, 24); h++) {
    const isExcess = forecasts[h] && forecasts[h].predicted_mw > input.capacity_mw * 0.6
    const action: StorageSchedule['action'] = isExcess && soc < 95 ? 'charge' :
      !isExcess && soc > 20 ? 'discharge' : 'idle'
    const power = action === 'charge' ? Math.min(input.capacity_mw * 0.3, (input.storage_mwh || 50) * 0.25) :
      action === 'discharge' ? Math.min(input.capacity_mw * 0.25, (input.storage_mwh || 50) * 0.2) : 0
    soc = action === 'charge' ? Math.min(100, soc + power / (input.storage_mwh || 50) * 100) :
      action === 'discharge' ? Math.max(0, soc - power / (input.storage_mwh || 50) * 100) : soc
    storageSchedule.push({ hour: h, action, power_mw: Math.round(power * 100) / 100, soc_pct: Math.round(soc) })
  }

  const gridScore = Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100
  const recommendations = [
    '配置储能系统降低弃电率至3%以内',
    '加强功率预测精度，目标MAE<10%',
    '参与电力现货市场实现价值最大化',
    '优化并网逆变器功率因数设置',
  ]

  return {
    plant_type: input.plant_type,
    capacity_mw: input.capacity_mw,
    forecasts,
    curtailment,
    storage_schedule: storageSchedule,
    grid_integration_score: gridScore,
    recommendations,
  }
}

// --- Tool 2: Smart Grid Manager ---
function analyzeSmartGrid(input: GridInput): GridResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.grid_region + input.base_load_mw + input.peak_load_mw
  ))

  const loadForecasts: LoadForecast[] = []
  for (let h = 0; h < 24; h++) {
    const factor = 0.6 + 0.4 * Math.sin((h - 14) * Math.PI / 12) + rng.nextFloat(-0.05, 0.05)
    const forecast = Math.round(input.base_load_mw + (input.peak_load_mw - input.base_load_mw) * factor)
    const actual = Math.round(forecast * rng.nextFloat(0.95, 1.05))
    loadForecasts.push({
      hour: h,
      forecast_mw: forecast,
      actual_mw: actual,
      deviation_pct: Math.round((actual - forecast) / forecast * 10000) / 100,
    })
  }

  const dispatchPlan: DispatchPlan[] = [
    { source: '煤电', output_mw: Math.round(input.base_load_mw * 0.5), cost_per_mwh: 320, co2_kg_per_mwh: 820, status: 'running' },
    { source: '气电', output_mw: Math.round(input.base_load_mw * 0.2), cost_per_mwh: 450, co2_kg_per_mwh: 350, status: 'running' },
    { source: '水电', output_mw: Math.round(input.base_load_mw * 0.15), cost_per_mwh: 120, co2_kg_per_mwh: 0, status: 'running' },
    { source: '光伏', output_mw: Math.round(input.base_load_mw * input.renewable_penetration_pct / 100 * 0.6), cost_per_mwh: 80, co2_kg_per_mwh: 0, status: 'running' },
    { source: '风电', output_mw: Math.round(input.base_load_mw * input.renewable_penetration_pct / 100 * 0.4), cost_per_mwh: 95, co2_kg_per_mwh: 0, status: 'standby' },
    { source: '储能', output_mw: 0, cost_per_mwh: 200, co2_kg_per_mwh: 0, status: 'standby' },
  ]

  const voltageControls: VoltageControl[] = []
  for (let i = 0; i < 4; i++) {
    const target = input.voltage_level_kv
    const actual = target * rng.nextFloat(0.97, 1.03)
    voltageControls.push({
      bus_id: `BUS-${String(i + 1).padStart(2, '0')}`,
      voltage_kv: Math.round(actual * 100) / 100,
      target_kv: target,
      reactive_power_mvar: Math.round(rng.nextFloat(-50, 50)),
      tap_position: rng.nextInt(-3, 3),
    })
  }

  const faultLocation: GridResult['fault_location'] = input.fault_detected ? {
    section: input.fault_section || `Section-${rng.nextInt(1, 10)}`,
    distance_km: Math.round(rng.nextFloat(0.5, 15) * 100) / 100,
    fault_type: rng.pick(['单相接地', '相间短路', '三相短路', '断线']),
    isolation_status: rng.next() > 0.5 ? 'isolated' : 'pending',
    self_heal_eta_min: rng.nextInt(5, 30),
  } : null

  const stabilityScore = Math.round(rng.nextFloat(0.75, 0.98) * 100) / 100
  const recommendations = [
    '优化机组组合降低煤耗',
    '投入SVG动态无功补偿装置',
    '部署配电自动化FA功能',
    '加强分布式电源并网监测',
  ]

  return {
    grid_region: input.grid_region,
    load_forecasts: loadForecasts,
    dispatch_plan: dispatchPlan,
    voltage_controls: voltageControls,
    fault_location: faultLocation,
    grid_stability_score: stabilityScore,
    recommendations,
  }
}

// --- Tool 3: Carbon Footprint Tracker ---
function analyzeCarbonFootprint(input: CarbonInput): CarbonResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.entity_name + input.reporting_year
  ))

  const scope1Total = input.scope1_sources.reduce((s, src) => s + src.emission_tco2, 0)
  const scope2Total = input.scope2_sources.reduce((s, src) => s + src.emission_tco2, 0)
  const scope3Total = input.scope3_sources.reduce((s, src) => s + src.emission_tco2, 0)
  const grandTotal = scope1Total + scope2Total + scope3Total

  const emissionSummary: EmissionSummary = {
    scope1_total: Math.round(scope1Total),
    scope2_total: Math.round(scope2Total),
    scope3_total: Math.round(scope3Total),
    grand_total: Math.round(grandTotal),
    intensity_per_gdp: input.gdp_myuan ? Math.round(grandTotal / input.gdp_myuan * 100) / 100 : 0,
    intensity_per_output: input.output_tons ? Math.round(grandTotal / input.output_tons * 100) / 100 : 0,
  }

  const reductionPath: ReductionPath[] = []
  for (let y = 0; y < 5; y++) {
    reductionPath.push({
      year: input.reporting_year + y + 1,
      target_reduction_pct: Math.round((5 + y * 8 + rng.nextFloat(0, 5)) * 100) / 100,
      measures: [
        '提升电气化率',
        '采购绿电',
        '工艺优化减排',
        'CCUS技术应用',
      ].slice(0, rng.nextInt(2, 4)),
      investment_myuan: Math.round(rng.nextFloat(50, 500) * (y + 1)),
      annual_saving_tco2: Math.round(grandTotal * (0.02 + y * 0.03) * rng.nextFloat(0.8, 1.2)),
    })
  }

  const carbonPrice = input.carbon_price_per_ton || rng.nextFloat(40, 80)
  const allocated = Math.round(grandTotal * rng.nextFloat(0.85, 1.0))
  const actual = Math.round(grandTotal * rng.nextFloat(0.9, 1.05))
  const surplus = allocated - actual
  const carbonQuota: CarbonQuota = {
    allocated,
    actual,
    surplus,
    market_price: Math.round(carbonPrice * 100) / 100,
    trade_action: surplus > 0 ? 'sell' : 'buy',
  }

  const tradingStrategy = [
    surplus > 0 ? `出售富余配额${surplus}t，预计收入${Math.round(surplus * carbonPrice)}kyuan` : `需购买配额${-surplus}t，预计支出${Math.round(-surplus * carbonPrice)}kyuan`,
    '关注碳价波动，逢低建仓',
    '布局CCER抵消额度',
    '参与碳远期合约锁定成本',
  ]

  return {
    entity_name: input.entity_name,
    reporting_year: input.reporting_year,
    emission_summary: emissionSummary,
    reduction_path: reductionPath,
    carbon_quota: carbonQuota,
    trading_strategy: tradingStrategy,
    recommendations: [
      '建立碳排放实时监测系统',
      '制定科学碳目标SBTi',
      '加大清洁能源替代力度',
      '参与全国碳市场交易',
    ],
  }
}

// --- Tool 4: Energy Storage Manager ---
function analyzeEnergyStorage(input: StorageInput): StorageResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.battery_type + input.capacity_mwh + input.power_mw
  ))

  const chargeSchedule: ChargeSchedule[] = []
  let soc = input.current_soc_pct
  let totalProfit = 0
  const prices = input.electricity_price.length > 0 ? input.electricity_price :
    Array.from({ length: 24 }, (_, h) => ({ hour: h, price_yuan: 300 + 400 * Math.sin((h - 14) * Math.PI / 12) + rng.nextFloat(-50, 50) }))

  for (const p of prices) {
    const isLowPrice = p.price_yuan < 350
    const isHighPrice = p.price_yuan > 650
    const action: ChargeSchedule['action'] = isLowPrice && soc < 95 ? 'charge' :
      isHighPrice && soc > 15 ? 'discharge' : 'idle'
    const power = action === 'charge' ? input.power_mw * 0.8 :
      action === 'discharge' ? input.power_mw * 0.7 : 0
    soc = action === 'charge' ? Math.min(100, soc + power / input.capacity_mwh * 100) :
      action === 'discharge' ? Math.max(5, soc - power / input.capacity_mwh * 100) : soc
    const profit = action === 'discharge' ? power * p.price_yuan / 1000 :
      action === 'charge' ? -power * p.price_yuan / 1000 : 0
    totalProfit += profit
    chargeSchedule.push({
      hour: p.hour,
      action,
      power_mw: Math.round(power * 100) / 100,
      soc_after_pct: Math.round(soc),
      price_yuan: Math.round(p.price_yuan),
      profit_kyuan: Math.round(profit),
    })
  }

  const degradationRate = rng.nextFloat(1.5, 3.0)
  const cyclesUsed = rng.nextInt(500, input.cycle_life * 0.6)
  const lifeAssessment: LifeAssessment = {
    soh_pct: Math.round((100 - degradationRate * cyclesUsed / input.cycle_life) * 100) / 100,
    remaining_cycles: input.cycle_life - cyclesUsed,
    remaining_years: Math.round((input.cycle_life - cyclesUsed) / 365 * 10) / 10,
    degradation_rate_pct: Math.round(degradationRate * 100) / 100,
    replacement_recommended: (100 - degradationRate * cyclesUsed / input.cycle_life) < 80,
  }

  const capacityConfig: CapacityConfig = {
    optimal_power_mw: Math.round(input.power_mw * rng.nextFloat(0.9, 1.1) * 100) / 100,
    optimal_capacity_mwh: Math.round(input.capacity_mwh * rng.nextFloat(0.85, 1.15) * 100) / 100,
    round_trip_efficiency_pct: Math.round(rng.nextFloat(0.85, 0.94) * 100) / 100,
    annual_revenue_kyuan: Math.round(totalProfit * 365),
    payback_years: Math.round(rng.nextFloat(5, 10) * 10) / 10,
  }

  const temp = rng.nextFloat(25, 45)
  const voltage = rng.nextFloat(3.2, 3.7) * (input.capacity_mwh > 0 ? 100 : 1)
  const current = rng.nextFloat(0, input.power_mw * 1000 / voltage)
  const alarmLevel: SafetyMonitor['alarm_level'] = temp > 40 ? 'warning' : temp > 50 ? 'critical' : 'normal'
  const safetyMonitor: SafetyMonitor = {
    temperature_c: Math.round(temp * 10) / 10,
    voltage_v: Math.round(voltage * 10) / 10,
    current_a: Math.round(current),
    soc_pct: Math.round(soc),
    alarm_level: alarmLevel,
    actions: alarmLevel === 'normal' ? ['系统运行正常'] :
      alarmLevel === 'warning' ? ['温度偏高，启动散热', '降低充放电倍率'] :
      ['紧急停机', '启动消防系统', '通知运维'],
  }

  return {
    battery_type: input.battery_type,
    charge_schedule: chargeSchedule,
    life_assessment: lifeAssessment,
    capacity_config: capacityConfig,
    safety_monitor: safetyMonitor,
    peak_arbitrage_profit_kyuan: Math.round(totalProfit * 365),
    recommendations: [
      '优化充放电策略提升套利收益',
      '实施主动均衡延长电池寿命',
      '部署BMS三级安全保护',
      '参与辅助服务市场增加收益',
    ],
  }
}

// --- Tool 5: Demand Response Coordinator ---
function analyzeDemandResponse(input: DemandResponseInput): DemandResponseResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.region + input.total_interruptible_load_mw
  ))

  const interruptibleLoads: InterruptibleLoad[] = input.participants.map(p => {
    const reduced = Math.round(p.load_mw * p.flexibility_pct / 100 * rng.nextFloat(0.8, 1.0) * 100) / 100
    return {
      participant_id: p.id,
      baseline_mw: p.load_mw,
      reduced_mw: reduced,
      reduction_pct: Math.round(reduced / p.load_mw * 10000) / 100,
      duration_hours: input.event_duration_hours,
      compensation_kyuan: Math.round(reduced * input.event_duration_hours * input.compensation_rate_yuan),
    }
  })

  const vppDispatch: VPPDispatch[] = [
    { resource: '分布式光伏', capacity_mw: Math.round(input.vpp_capacity_mw * 0.3), dispatched_mw: Math.round(input.vpp_capacity_mw * 0.3 * rng.nextFloat(0.6, 0.9)), response_time_min: 1, availability_pct: 85 },
    { resource: '储能电站', capacity_mw: Math.round(input.vpp_capacity_mw * 0.25), dispatched_mw: Math.round(input.vpp_capacity_mw * 0.25 * rng.nextFloat(0.8, 1.0)), response_time_min: 0.5, availability_pct: 95 },
    { resource: '可中断负荷', capacity_mw: Math.round(input.vpp_capacity_mw * 0.25), dispatched_mw: Math.round(input.vpp_capacity_mw * 0.25 * rng.nextFloat(0.7, 0.9)), response_time_min: 5, availability_pct: 90 },
    { resource: '电动汽车V2G', capacity_mw: Math.round(input.vpp_capacity_mw * 0.2), dispatched_mw: Math.round(input.vpp_capacity_mw * 0.2 * rng.nextFloat(0.5, 0.8)), response_time_min: 2, availability_pct: 70 },
  ]

  const responseStrategies: ResponseStrategy[] = [
    { trigger_condition: '电价>1.2元/kWh', target_reduction_mw: Math.round(input.total_interruptible_load_mw * 0.3), activation_lead_time_min: 10, priority: 'high', estimated_success_rate: 0.92 },
    { trigger_condition: '系统备用<5%', target_reduction_mw: Math.round(input.total_interruptible_load_mw * 0.5), activation_lead_time_min: 5, priority: 'high', estimated_success_rate: 0.88 },
    { trigger_condition: '日前市场高价', target_reduction_mw: Math.round(input.total_interruptible_load_mw * 0.2), activation_lead_time_min: 60, priority: 'medium', estimated_success_rate: 0.95 },
    { trigger_condition: '可中断合同触发', target_reduction_mw: Math.round(input.total_interruptible_load_mw * 0.4), activation_lead_time_min: 30, priority: 'low', estimated_success_rate: 0.85 },
  ]

  const settlements: SettlementResult[] = input.participants.map(p => {
    const reduced = Math.round(p.load_mw * p.flexibility_pct / 100 * rng.nextFloat(0.7, 1.0) * 100) / 100
    const actual = p.load_mw - reduced
    const baseline = p.load_mw * rng.nextFloat(0.95, 1.05)
    const compensation = Math.round(reduced * input.event_duration_hours * input.compensation_rate_yuan)
    const penalty = actual > baseline ? Math.round((actual - baseline) * 200) : 0
    return {
      participant_id: p.id,
      baseline_mw: Math.round(baseline * 100) / 100,
      actual_mw: Math.round(actual * 100) / 100,
      reduced_mw: Math.round((baseline - actual) * 100) / 100,
      compensation_kyuan: compensation,
      penalty_kyuan: penalty,
      net_payment_kyuan: compensation - penalty,
    }
  })

  const totalReduction = interruptibleLoads.reduce((s, l) => s + l.reduced_mw, 0)
  const totalCompensation = settlements.reduce((s, st) => s + st.net_payment_kyuan, 0)

  return {
    region: input.region,
    interruptible_loads: interruptibleLoads,
    vpp_dispatch: vppDispatch,
    response_strategies: responseStrategies,
    settlements,
    total_reduction_mw: Math.round(totalReduction * 100) / 100,
    total_compensation_kyuan: totalCompensation,
    recommendations: [
      '扩大虚拟电厂聚合规模',
      '优化补偿机制激励用户参与',
      '部署自动需求响应ADR系统',
      '建立多时间尺度响应资源池',
    ],
  }
}

// --- Tool 6: Energy Efficiency Auditor ---
function analyzeEnergyEfficiency(input: AuditInput): AuditResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.facility_name + input.facility_type
  ))

  const totalConsumption = input.annual_energy_mwh
  const categories = [
    { name: '照明系统', pct: 15 },
    { name: '空调系统', pct: 35 },
    { name: '动力设备', pct: 30 },
    { name: '办公设备', pct: 10 },
    { name: '其他', pct: 10 },
  ]

  const consumptionBreakdown: EnergyConsumption[] = categories.map(c => {
    const consumption = Math.round(totalConsumption * c.pct / 100 * rng.nextFloat(0.9, 1.1) * 100) / 100
    return {
      category: c.name,
      consumption_mwh: consumption,
      percentage: c.pct,
      cost_kyuan: Math.round(consumption * 600),
      benchmark_pct: c.pct + rng.nextInt(-5, 5),
      status: c.pct > 30 ? 'wasteful' : c.pct > 15 ? 'normal' : 'efficient',
    }
  })

  const savingMeasures: SavingMeasure[] = [
    { measure: 'LED照明改造', investment_kyuan: Math.round(rng.nextFloat(50, 200)), annual_saving_mwh: Math.round(totalConsumption * 0.08), annual_saving_kyuan: Math.round(totalConsumption * 0.08 * 600), payback_years: Math.round(rng.nextFloat(2, 4) * 10) / 10, co2_reduction_t: Math.round(totalConsumption * 0.08 * 0.5), priority: 'high' },
    { measure: '变频驱动改造', investment_kyuan: Math.round(rng.nextFloat(100, 500)), annual_saving_mwh: Math.round(totalConsumption * 0.12), annual_saving_kyuan: Math.round(totalConsumption * 0.12 * 600), payback_years: Math.round(rng.nextFloat(3, 5) * 10) / 10, co2_reduction_t: Math.round(totalConsumption * 0.12 * 0.5), priority: 'high' },
    { measure: '余热回收系统', investment_kyuan: Math.round(rng.nextFloat(200, 800)), annual_saving_mwh: Math.round(totalConsumption * 0.06), annual_saving_kyuan: Math.round(totalConsumption * 0.06 * 600), payback_years: Math.round(rng.nextFloat(4, 7) * 10) / 10, co2_reduction_t: Math.round(totalConsumption * 0.06 * 0.5), priority: 'medium' },
    { measure: '智能楼宇控制', investment_kyuan: Math.round(rng.nextFloat(150, 400)), annual_saving_mwh: Math.round(totalConsumption * 0.1), annual_saving_kyuan: Math.round(totalConsumption * 0.1 * 600), payback_years: Math.round(rng.nextFloat(3, 6) * 10) / 10, co2_reduction_t: Math.round(totalConsumption * 0.1 * 0.5), priority: 'medium' },
    { measure: '光伏屋顶', investment_kyuan: Math.round(rng.nextFloat(300, 1000)), annual_saving_mwh: Math.round(totalConsumption * 0.15), annual_saving_kyuan: Math.round(totalConsumption * 0.15 * 600), payback_years: Math.round(rng.nextFloat(5, 8) * 10) / 10, co2_reduction_t: Math.round(totalConsumption * 0.15 * 0.5), priority: 'low' },
  ]

  const retrofitPlan: RetrofitPlan[] = [
    { phase: 1, measures: ['LED照明改造', '变频驱动改造'], total_investment_kyuan: Math.round(rng.nextFloat(150, 700)), total_annual_saving_kyuan: Math.round(totalConsumption * 0.2 * 600), co2_reduction_t: Math.round(totalConsumption * 0.2 * 0.5), implementation_months: 6 },
    { phase: 2, measures: ['余热回收系统', '智能楼宇控制'], total_investment_kyuan: Math.round(rng.nextFloat(350, 1200)), total_annual_saving_kyuan: Math.round(totalConsumption * 0.16 * 600), co2_reduction_t: Math.round(totalConsumption * 0.16 * 0.5), implementation_months: 12 },
    { phase: 3, measures: ['光伏屋顶'], total_investment_kyuan: Math.round(rng.nextFloat(300, 1000)), total_annual_saving_kyuan: Math.round(totalConsumption * 0.15 * 600), co2_reduction_t: Math.round(totalConsumption * 0.15 * 0.5), implementation_months: 18 },
  ]

  const actualIntensity = input.floor_area_sqm > 0 ? Math.round(input.annual_energy_mwh * 1000 / input.floor_area_sqm * 100) / 100 : 0
  const benchmarkComparison: BenchmarkComparison[] = [
    { metric: 'kWh/m²', actual: actualIntensity, benchmark: input.benchmark_kwh_per_sqm, best_in_class: Math.round(input.benchmark_kwh_per_sqm * 0.6), gap_pct: Math.round((actualIntensity - input.benchmark_kwh_per_sqm) / input.benchmark_kwh_per_sqm * 100), grade: actualIntensity < input.benchmark_kwh_per_sqm * 0.8 ? 'A' : actualIntensity < input.benchmark_kwh_per_sqm ? 'B' : actualIntensity < input.benchmark_kwh_per_sqm * 1.2 ? 'C' : actualIntensity < input.benchmark_kwh_per_sqm * 1.5 ? 'D' : 'E' },
    { metric: '能效比EER', actual: Math.round(rng.nextFloat(2.5, 4.0) * 100) / 100, benchmark: 3.5, best_in_class: 5.0, gap_pct: Math.round((3.5 - 3.0) / 3.5 * 100), grade: 'C' },
    { metric: '功率因数', actual: Math.round(rng.nextFloat(0.85, 0.98) * 100) / 100, benchmark: 0.95, best_in_class: 0.98, gap_pct: Math.round((0.95 - 0.92) / 0.95 * 100), grade: 'B' },
  ]

  const totalSaving = savingMeasures.reduce((s, m) => s + m.annual_saving_mwh, 0)
  const totalSavingPct = Math.round(totalSaving / totalConsumption * 100 * 100) / 100

  return {
    facility_name: input.facility_name,
    consumption_breakdown: consumptionBreakdown,
    saving_measures: savingMeasures,
    retrofit_plan: retrofitPlan,
    benchmark_comparison: benchmarkComparison,
    total_potential_saving_pct: totalSavingPct,
    recommendations: [
      '优先实施高回报率的节能改造',
      '建立能源管理中心实现精细化管控',
      '开展能源管理体系认证',
      '部署IoT传感器实现实时监测',
    ],
  }
}

// --- Tool 7: Distributed Energy Planner ---
function analyzeDistributedEnergy(input: DistributedInput): DistributedResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.project_name + input.load_demand_mw
  ))

  const solarCap = Math.round(input.load_demand_mw * rng.nextFloat(0.3, 0.6) * 100) / 100
  const windCap = Math.round(input.load_demand_mw * rng.nextFloat(0.1, 0.3) * 100) / 100
  const batteryMwh = Math.round((solarCap + windCap) * rng.nextFloat(0.3, 0.6) * 100) / 100
  const dieselCap = Math.round(input.load_demand_mw * rng.nextFloat(0.1, 0.2) * 100) / 100

  const microgridDesign: MicrogridDesign = {
    solar_capacity_mw: solarCap,
    wind_capacity_mw: windCap,
    battery_mwh: batteryMwh,
    diesel_backup_mw: dieselCap,
    total_investment_myuan: Math.round((solarCap * 3500 + windCap * 5000 + batteryMwh * 1500 + dieselCap * 800) / 1000),
    self_sufficiency_pct: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
    reliability_pct: Math.round(rng.nextFloat(0.95, 0.999) * 1000) / 1000,
  }

  const multiEnergy: MultiEnergyComplement[] = [
    { source: '光伏发电', capacity_mw: solarCap, annual_output_gwh: Math.round(solarCap * input.solar_resource_kwh_m2 / 1000 * rng.nextFloat(0.8, 1.0) * 100) / 100, capacity_factor_pct: Math.round(input.solar_resource_kwh_m2 / 2000 * 100 * 100) / 100, co2_factor: 0, lcoe_yuan_per_mwh: Math.round(rng.nextFloat(200, 350)) },
    { source: '风力发电', capacity_mw: windCap, annual_output_gwh: Math.round(windCap * 8760 * rng.nextFloat(0.25, 0.4) / 1000 * 100) / 100, capacity_factor_pct: Math.round(rng.nextFloat(25, 40) * 100) / 100, co2_factor: 0, lcoe_yuan_per_mwh: Math.round(rng.nextFloat(250, 400)) },
    { source: '储能系统', capacity_mw: batteryMwh / 4, annual_output_gwh: Math.round(batteryMwh * 365 * 0.8 / 1000 * 100) / 100, capacity_factor_pct: 90, co2_factor: 0, lcoe_yuan_per_mwh: Math.round(rng.nextFloat(300, 500)) },
    ...(input.gas_available ? [{ source: '天然气热电联产', capacity_mw: Math.round(input.load_demand_mw * 0.3 * 100) / 100, annual_output_gwh: Math.round(input.load_demand_mw * 0.3 * 8760 * 0.5 / 1000 * 100) / 100, capacity_factor_pct: 50, co2_factor: 0.35, lcoe_yuan_per_mwh: Math.round(rng.nextFloat(350, 500)) }] : []),
  ]

  const capacityOptimization: CapacityOptimization = {
    optimal_solar_mw: solarCap,
    optimal_wind_mw: windCap,
    optimal_battery_mwh: batteryMwh,
    optimal_inverter_mw: Math.round(solarCap * 1.1 * 100) / 100,
    total_cost_myuan: microgridDesign.total_investment_myuan,
    npv_myuan: Math.round(microgridDesign.total_investment_myuan * rng.nextFloat(0.3, 0.8)),
    irr_pct: Math.round(rng.nextFloat(8, 15) * 100) / 100,
  }

  const gridAccess: GridAccess = {
    access_voltage_kv: input.grid_connection === 'off_grid' ? 0 : rng.pick([10, 35, 110]),
    line_length_km: Math.round(rng.nextFloat(1, 20) * 100) / 100,
    substation_capacity_mva: Math.round(input.load_demand_mw * rng.nextFloat(1.2, 2.0) * 10) / 10,
    connection_cost_myuan: Math.round(rng.nextFloat(50, 500)),
    approval_timeline_months: rng.nextInt(3, 18),
    technical_requirements: ['短路容量校核', '继电保护整定', '电能质量评估', '防孤岛保护配置'],
  }

  return {
    project_name: input.project_name,
    microgrid_design: microgridDesign,
    multi_energy: multiEnergy,
    capacity_optimization: capacityOptimization,
    grid_access: gridAccess,
    economic_analysis: {
      roi_pct: Math.round(rng.nextFloat(10, 20) * 100) / 100,
      payback_years: Math.round(rng.nextFloat(5, 10) * 10) / 10,
      annual_revenue_kyuan: Math.round(microgridDesign.total_investment_myuan * rng.nextFloat(0.1, 0.2)),
    },
    recommendations: [
      '采用多能互补提升供电可靠性',
      '优化储能配置实现经济最优',
      '部署微网中央控制系统',
      '预留远期扩容接口',
    ],
  }
}

// --- Tool 8: Energy Trading Advisor ---
function analyzeEnergyTrading(input: TradingInput): TradingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.market_type + input.position_mwh + input.risk_tolerance
  ))

  const spotMarket: SpotMarket[] = input.price_forecast.map(p => {
    const action: SpotMarket['recommended_action'] = p.price_yuan > 600 ? 'sell' : p.price_yuan < 350 ? 'buy' : 'hold'
    const volume = action === 'buy' ? Math.round(input.position_mwh * rng.nextFloat(0.3, 0.6)) :
      action === 'sell' ? Math.round(input.position_mwh * rng.nextFloat(0.3, 0.6)) : 0
    return {
      period: p.period,
      forecast_price: Math.round(p.price_yuan),
      recommended_action: action,
      volume_mwh: volume,
      expected_profit_kyuan: action === 'sell' ? Math.round(volume * (p.price_yuan - 400)) : action === 'buy' ? Math.round(volume * (500 - p.price_yuan)) : 0,
      risk_level: p.volatility > 0.3 ? 'high' : p.volatility > 0.15 ? 'medium' : 'low',
    }
  })

  const forwardContracts: ForwardContract[] = []
  for (let m = 0; m < Math.min(input.contract_duration_months, 12); m++) {
    const month = new Date()
    month.setMonth(month.getMonth() + m + 1)
    forwardContracts.push({
      contract_month: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      strike_price: Math.round(rng.nextFloat(350, 550)),
      volume_mwh: Math.round(input.position_mwh / 12 * rng.nextFloat(0.8, 1.2)),
      premium_kyuan: Math.round(rng.nextFloat(5, 30) * input.position_mwh / 12),
      delivery_type: rng.next() > 0.5 ? 'physical' : 'financial',
      credit_requirement_kyuan: Math.round(input.position_mwh * rng.nextFloat(50, 150)),
    })
  }

  const greenCertificates: GreenCertificate[] = input.green_cert_required ? [
    { certificate_type: 'i_rec', volume_mwh: Math.round(input.position_mwh * 0.3), price_per_mwh: Math.round(rng.nextFloat(5, 15)), vintage_year: new Date().getFullYear(), retirement_status: 'active', compliance_value: '国际绿证' },
    { certificate_type: 'china_green', volume_mwh: Math.round(input.position_mwh * 0.5), price_per_mwh: Math.round(rng.nextFloat(40, 60)), vintage_year: new Date().getFullYear(), retirement_status: 'active', compliance_value: '国内绿证' },
    { certificate_type: 'apx_tigrs', volume_mwh: Math.round(input.position_mwh * 0.2), price_per_mwh: Math.round(rng.nextFloat(3, 10)), vintage_year: new Date().getFullYear(), retirement_status: 'retired', compliance_value: 'TIGRs' },
  ] : []

  const riskMetrics: RiskMetric = {
    var_95_pct: Math.round(rng.nextFloat(5, 15) * 100) / 100,
    cvar_95_pct: Math.round(rng.nextFloat(8, 20) * 100) / 100,
    max_drawdown_pct: Math.round(rng.nextFloat(10, 25) * 100) / 100,
    sharpe_ratio: Math.round(rng.nextFloat(0.8, 2.0) * 100) / 100,
    hedge_ratio: Math.round(rng.nextFloat(0.5, 0.9) * 100) / 100,
    diversification_score: Math.round(rng.nextFloat(0.6, 0.9) * 100) / 100,
  }

  const portfolioOptimization: PortfolioOptimization[] = [
    { asset: '现货电量', weight_pct: 40, expected_return_pct: Math.round(rng.nextFloat(8, 15) * 100) / 100, risk_contribution_pct: 35, correlation_to_portfolio: 0.8 },
    { asset: '中长期合约', weight_pct: 30, expected_return_pct: Math.round(rng.nextFloat(5, 10) * 100) / 100, risk_contribution_pct: 20, correlation_to_portfolio: 0.5 },
    { asset: '绿证', weight_pct: 15, expected_return_pct: Math.round(rng.nextFloat(10, 20) * 100) / 100, risk_contribution_pct: 25, correlation_to_portfolio: 0.3 },
    { asset: '碳资产', weight_pct: 10, expected_return_pct: Math.round(rng.nextFloat(12, 25) * 100) / 100, risk_contribution_pct: 15, correlation_to_portfolio: 0.2 },
    { asset: '容量市场', weight_pct: 5, expected_return_pct: Math.round(rng.nextFloat(3, 8) * 100) / 100, risk_contribution_pct: 5, correlation_to_portfolio: 0.1 },
  ]

  const totalReturn = spotMarket.reduce((s, m) => s + m.expected_profit_kyuan, 0) +
    forwardContracts.reduce((s, c) => s + c.premium_kyuan, 0)

  return {
    market_type: input.market_type,
    spot_market: spotMarket,
    forward_contracts: forwardContracts,
    green_certificates: greenCertificates,
    risk_metrics: riskMetrics,
    portfolio_optimization: portfolioOptimization,
    total_expected_return_kyuan: totalReturn,
    recommendations: [
      '构建多品种组合分散风险',
      '利用金融合约对冲价格波动',
      '关注政策变化及时调整策略',
      '建立量化交易决策模型',
    ],
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Renewable Energy Optimizer ---
function formatRenewableEnergy(r: RenewableResult): string {
  const lines: string[] = []
  lines.push('## ⚡ 新能源优化报告 — Renewable Energy Optimizer')
  lines.push('')
  lines.push(`电站类型: ${r.plant_type} | 装机容量: ${r.capacity_mw} MW | 并网评分: ${r.grid_integration_score}`)
  lines.push('')
  lines.push('### 🔮 功率预测 (24h)')
  lines.push('| 时段 | 预测功率(MW) | 置信区间 | 天气因子 |')
  lines.push('|------|-------------|----------|----------|')
  for (const f of r.forecasts) {
    lines.push(`| ${String(f.hour).padStart(2, '0')}:00 | ${f.predicted_mw} | [${f.confidence_low}, ${f.confidence_high}] | ${f.weather_factor} |`)
  }
  lines.push('')
  lines.push('### ⚠️ 弃电分析')
  lines.push(`- 当前弃电率: ${(r.curtailment.current_rate * 100).toFixed(1)}% | 目标: ${(r.curtailment.target_rate * 100).toFixed(1)}%`)
  lines.push(`- 弃电量: ${r.curtailment.lost_mwh} MWh | 经济损失: ${r.curtailment.economic_loss_kyuan} kyuan`)
  lines.push(`- 根因: ${r.curtailment.root_causes.join('、')}`)
  lines.push('')
  lines.push('### 🔋 储能调度计划')
  lines.push('| 时段 | 动作 | 功率(MW) | SOC(%) |')
  lines.push('|------|------|----------|--------|')
  for (const s of r.storage_schedule) {
    lines.push(`| ${String(s.hour).padStart(2, '0')}:00 | ${s.action} | ${s.power_mw} | ${s.soc_pct} |`)
  }
  lines.push('')
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 2: Smart Grid Manager ---
function formatSmartGrid(r: GridResult): string {
  const lines: string[] = []
  lines.push('## 🏭 智能电网管理报告 — Smart Grid Manager')
  lines.push('')
  lines.push(`电网区域: ${r.grid_region} | 稳定评分: ${r.grid_stability_score}`)
  lines.push('')
  lines.push('### 📊 负荷预测 (24h)')
  lines.push('| 时段 | 预测(MW) | 实际(MW) | 偏差(%) |')
  lines.push('|------|----------|----------|---------|')
  for (const f of r.load_forecasts) {
    lines.push(`| ${String(f.hour).padStart(2, '0')}:00 | ${f.forecast_mw} | ${f.actual_mw} | ${f.deviation_pct} |`)
  }
  lines.push('')
  lines.push('### 🔌 调度计划')
  lines.push('| 电源 | 出力(MW) | 成本(元/MWh) | CO₂(kg/MWh) | 状态 |')
  lines.push('|------|----------|-------------|-------------|------|')
  for (const d of r.dispatch_plan) {
    lines.push(`| ${d.source} | ${d.output_mw} | ${d.cost_per_mwh} | ${d.co2_kg_per_mwh} | ${d.status} |`)
  }
  lines.push('')
  lines.push('### ⚡ 电压控制')
  lines.push('| 母线 | 电压(kV) | 目标(kV) | 无功(Mvar) | 档位 |')
  lines.push('|------|----------|----------|-----------|------|')
  for (const v of r.voltage_controls) {
    lines.push(`| ${v.bus_id} | ${v.voltage_kv} | ${v.target_kv} | ${v.reactive_power_mvar} | ${v.tap_position} |`)
  }
  lines.push('')
  if (r.fault_location) {
    lines.push('### 🔧 故障定位')
    lines.push(`- 故障区段: ${r.fault_location.section} | 距离: ${r.fault_location.distance_km} km`)
    lines.push(`- 故障类型: ${r.fault_location.fault_type} | 隔离状态: ${r.fault_location.isolation_status}`)
    lines.push(`- 自愈预计: ${r.fault_location.self_heal_eta_min} min`)
    lines.push('')
  }
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 3: Carbon Footprint Tracker ---
function formatCarbonFootprint(r: CarbonResult): string {
  const lines: string[] = []
  lines.push('## 🌍 碳足迹追踪报告 — Carbon Footprint Tracker')
  lines.push('')
  lines.push(`核算主体: ${r.entity_name} | 报告年度: ${r.reporting_year}`)
  lines.push('')
  lines.push('### 📊 排放核算汇总')
  lines.push(`| 范围 | 排放量(tCO₂) |`)
  lines.push(`|------|-------------|`)
  lines.push(`| Scope 1 (直接排放) | ${r.emission_summary.scope1_total} |`)
  lines.push(`| Scope 2 (间接排放) | ${r.emission_summary.scope2_total} |`)
  lines.push(`| Scope 3 (价值链) | ${r.emission_summary.scope3_total} |`)
  lines.push(`| **总计** | **${r.emission_summary.grand_total}** |`)
  lines.push(`| 碳强度(万元GDP) | ${r.emission_summary.intensity_per_gdp} |`)
  lines.push(`| 碳强度(吨产品) | ${r.emission_summary.intensity_per_output} |`)
  lines.push('')
  lines.push('### 📉 减排路径')
  lines.push('| 年度 | 减排目标(%) | 措施 | 投资(万元) | 年减排量(tCO₂) |')
  lines.push('|------|-----------|------|-----------|---------------|')
  for (const p of r.reduction_path) {
    lines.push(`| ${p.year} | ${p.target_reduction_pct}% | ${p.measures.join(', ')} | ${p.investment_myuan} | ${p.annual_saving_tco2} |`)
  }
  lines.push('')
  lines.push('### 🎫 碳配额管理')
  lines.push(`- 分配配额: ${r.carbon_quota.allocated} tCO₂ | 实际排放: ${r.carbon_quota.actual} tCO₂`)
  lines.push(`- 盈余/缺口: ${r.carbon_quota.surplus} tCO₂ | 市场均价: ${r.carbon_quota.market_price} 元/吨`)
  lines.push(`- 交易建议: ${r.carbon_quota.trade_action === 'sell' ? '出售富余' : r.carbon_quota.trade_action === 'buy' ? '买入补足' : '持有观望'}`)
  lines.push('')
  lines.push('### 💹 碳交易策略')
  for (const s of r.trading_strategy) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 4: Energy Storage Manager ---
function formatEnergyStorage(r: StorageResult): string {
  const lines: string[] = []
  lines.push('## 🔋 储能管理报告 — Energy Storage Manager')
  lines.push('')
  lines.push(`电池类型: ${r.battery_type} | 容量: ${r.capacity_config.optimal_capacity_mwh} MWh | 功率: ${r.capacity_config.optimal_power_mw} MW`)
  lines.push('')
  lines.push('### 📊 充放电策略')
  lines.push('| 时段 | 动作 | 功率(MW) | SOC(%) | 电价(元) | 收益(元) |')
  lines.push('|------|------|----------|--------|---------|---------|')
  for (const s of r.charge_schedule) {
    lines.push(`| ${String(s.hour).padStart(2, '0')}:00 | ${s.action} | ${s.power_mw} | ${s.soc_after_pct} | ${s.price_yuan} | ${s.profit_kyuan} |`)
  }
  lines.push('')
  lines.push('### 🔬 寿命评估')
  lines.push(`- SOH: ${r.life_assessment.soh_pct}% | 剩余循环: ${r.life_assessment.remaining_cycles} 次`)
  lines.push(`- 剩余年限: ${r.life_assessment.remaining_years} 年 | 衰减率: ${r.life_assessment.degradation_rate_pct}%/年`)
  lines.push(`- 建议更换: ${r.life_assessment.replacement_recommended ? '是' : '否'}`)
  lines.push('')
  lines.push('### 💰 经济性分析')
  lines.push(`- 年收益: ${r.capacity_config.annual_revenue_kyuan} kyuan | 投资回收期: ${r.capacity_config.payback_years} 年`)
  lines.push(`- 峰谷套利年利润: ${r.peak_arbitrage_profit_kyuan} kyuan`)
  lines.push(`- 往返效率: ${r.capacity_config.round_trip_efficiency_pct}%`)
  lines.push('')
  lines.push('### 🛡️ 安全监控')
  lines.push(`- 温度: ${r.safety_monitor.temperature_c}°C | 电压: ${r.safety_monitor.voltage_v} V | 电流: ${r.safety_monitor.current_a} A`)
  lines.push(`- 告警级别: ${r.safety_monitor.alarm_level}`)
  for (const a of r.safety_monitor.actions) lines.push(`  - ${a}`)
  lines.push('')
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 5: Demand Response Coordinator ---
function formatDemandResponse(r: DemandResponseResult): string {
  const lines: string[] = []
  lines.push('## 📞 需求响应协调报告 — Demand Response Coordinator')
  lines.push('')
  lines.push(`区域: ${r.region} | 总削减量: ${r.total_reduction_mw} MW | 总补偿: ${r.total_compensation_kyuan} kyuan`)
  lines.push('')
  lines.push('### 🔌 可中断负荷')
  lines.push('| 用户 | 基线(MW) | 削减(MW) | 削减率(%) | 补偿(元) |')
  lines.push('|------|----------|----------|----------|---------|')
  for (const l of r.interruptible_loads) {
    lines.push(`| ${l.participant_id} | ${l.baseline_mw} | ${l.reduced_mw} | ${l.reduction_pct} | ${l.compensation_kyuan} |`)
  }
  lines.push('')
  lines.push('### 🏭 虚拟电厂调度')
  lines.push('| 资源 | 容量(MW) | 调度(MW) | 响应(min) | 可用率(%) |')
  lines.push('|------|----------|----------|-----------|----------|')
  for (const v of r.vpp_dispatch) {
    lines.push(`| ${v.resource} | ${v.capacity_mw} | ${v.dispatched_mw} | ${v.response_time_min} | ${v.availability_pct} |`)
  }
  lines.push('')
  lines.push('### 📋 响应策略')
  lines.push('| 触发条件 | 目标削减(MW) | 提前量(min) | 优先级 | 成功率 |')
  lines.push('|----------|-------------|------------|--------|--------|')
  for (const s of r.response_strategies) {
    lines.push(`| ${s.trigger_condition} | ${s.target_reduction_mw} | ${s.activation_lead_time_min} | ${s.priority} | ${(s.estimated_success_rate * 100).toFixed(0)}% |`)
  }
  lines.push('')
  lines.push('### 💳 补偿结算')
  lines.push('| 用户 | 基线(MW) | 实际(MW) | 削减(MW) | 补偿(元) | 罚金(元) | 净支付(元) |')
  lines.push('|------|----------|----------|----------|---------|---------|-----------|')
  for (const s of r.settlements) {
    lines.push(`| ${s.participant_id} | ${s.baseline_mw} | ${s.actual_mw} | ${s.reduced_mw} | ${s.compensation_kyuan} | ${s.penalty_kyuan} | ${s.net_payment_kyuan} |`)
  }
  lines.push('')
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 6: Energy Efficiency Auditor ---
function formatEnergyEfficiency(r: AuditResult): string {
  const lines: string[] = []
  lines.push('## 🔍 能效审计报告 — Energy Efficiency Auditor')
  lines.push('')
  lines.push(`设施: ${r.facility_name} | 节能潜力: ${r.total_potential_saving_pct}%`)
  lines.push('')
  lines.push('### 📊 能耗分析')
  lines.push('| 类别 | 耗电量(MWh) | 占比(%) | 成本(元) | 对标(%) | 状态 |')
  lines.push('|------|------------|---------|---------|---------|------|')
  for (const c of r.consumption_breakdown) {
    lines.push(`| ${c.category} | ${c.consumption_mwh} | ${c.percentage} | ${c.cost_kyuan} | ${c.benchmark_pct} | ${c.status} |`)
  }
  lines.push('')
  lines.push('### 💡 节能措施')
  lines.push('| 措施 | 投资(万元) | 年节电(MWh) | 年节省(元) | 回收期(年) | 减碳(t) | 优先级 |')
  lines.push('|------|-----------|------------|-----------|-----------|---------|--------|')
  for (const m of r.saving_measures) {
    lines.push(`| ${m.measure} | ${m.investment_kyuan} | ${m.annual_saving_mwh} | ${m.annual_saving_kyuan} | ${m.payback_years} | ${m.co2_reduction_t} | ${m.priority} |`)
  }
  lines.push('')
  lines.push('### 🏗️ 改造方案')
  lines.push('| 阶段 | 措施 | 投资(万元) | 年节省(元) | 减碳(t) | 周期(月) |')
  lines.push('|------|------|-----------|-----------|---------|---------|')
  for (const p of r.retrofit_plan) {
    lines.push(`| ${p.phase} | ${p.measures.join(', ')} | ${p.total_investment_kyuan} | ${p.total_annual_saving_kyuan} | ${p.co2_reduction_t} | ${p.implementation_months} |`)
  }
  lines.push('')
  lines.push('### 📏 能效对标')
  lines.push('| 指标 | 实际值 | 基准值 | 行业最优 | 差距(%) | 等级 |')
  lines.push('|------|--------|--------|---------|---------|------|')
  for (const b of r.benchmark_comparison) {
    lines.push(`| ${b.metric} | ${b.actual} | ${b.benchmark} | ${b.best_in_class} | ${b.gap_pct}% | ${b.grade} |`)
  }
  lines.push('')
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 7: Distributed Energy Planner ---
function formatDistributedEnergy(r: DistributedResult): string {
  const lines: string[] = []
  lines.push('## 🏗️ 分布式能源规划报告 — Distributed Energy Planner')
  lines.push('')
  lines.push(`项目名称: ${r.project_name}`)
  lines.push('')
  lines.push('### 🔌 微网设计')
  lines.push(`- 光伏: ${r.microgrid_design.solar_capacity_mw} MW | 风电: ${r.microgrid_design.wind_capacity_mw} MW`)
  lines.push(`- 储能: ${r.microgrid_design.battery_mwh} MWh | 柴发备用: ${r.microgrid_design.diesel_backup_mw} MW`)
  lines.push(`- 总投资: ${r.microgrid_design.total_investment_myuan} kyuan | 自给率: ${r.microgrid_design.self_sufficiency_pct}%`)
  lines.push(`- 供电可靠性: ${r.microgrid_design.reliability_pct}%`)
  lines.push('')
  lines.push('### ⚡ 多能互补')
  lines.push('| 能源 | 容量(MW) | 年发电量(GWh) | 容量因子(%) | CO₂因子 | LCOE(元/MWh) |')
  lines.push('|------|----------|--------------|------------|---------|-------------|')
  for (const m of r.multi_energy) {
    lines.push(`| ${m.source} | ${m.capacity_mw} | ${m.annual_output_gwh} | ${m.capacity_factor_pct} | ${m.co2_factor} | ${m.lcoe_yuan_per_mwh} |`)
  }
  lines.push('')
  lines.push('### 📊 容量优化')
  lines.push(`- 最优光伏: ${r.capacity_optimization.optimal_solar_mw} MW | 最优风电: ${r.capacity_optimization.optimal_wind_mw} MW`)
  lines.push(`- 最优储能: ${r.capacity_optimization.optimal_battery_mwh} MWh | 逆变器: ${r.capacity_optimization.optimal_inverter_mw} MW`)
  lines.push(`- NPV: ${r.capacity_optimization.npv_myuan} kyuan | IRR: ${r.capacity_optimization.irr_pct}%`)
  lines.push('')
  lines.push('### 🔗 接入方案')
  lines.push(`- 接入电压: ${r.grid_access.access_voltage_kv} kV | 线路长度: ${r.grid_access.line_length_km} km`)
  lines.push(`- 变电站容量: ${r.grid_access.substation_capacity_mva} MVA | 接入成本: ${r.grid_access.connection_cost_myuan} kyuan`)
  lines.push(`- 审批周期: ${r.grid_access.approval_timeline_months} 月`)
  lines.push(`- 技术要求: ${r.grid_access.technical_requirements.join('、')}`)
  lines.push('')
  lines.push('### 💰 经济分析')
  lines.push(`- ROI: ${r.economic_analysis.roi_pct}% | 投资回收期: ${r.economic_analysis.payback_years} 年`)
  lines.push(`- 年收入: ${r.economic_analysis.annual_revenue_kyuan} kyuan`)
  lines.push('')
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 8: Energy Trading Advisor ---
function formatEnergyTrading(r: TradingResult): string {
  const lines: string[] = []
  lines.push('## 💹 能源交易顾问报告 — Energy Trading Advisor')
  lines.push('')
  lines.push(`市场类型: ${r.market_type} | 预期总收益: ${r.total_expected_return_kyuan} kyuan`)
  lines.push('')
  lines.push('### 📊 现货市场')
  lines.push('| 时段 | 预测价格(元) | 建议 | 量(MWh) | 预期收益(元) | 风险 |')
  lines.push('|------|-------------|------|---------|-----------|------|')
  for (const s of r.spot_market) {
    lines.push(`| ${s.period} | ${s.forecast_price} | ${s.recommended_action} | ${s.volume_mwh} | ${s.expected_profit_kyuan} | ${s.risk_level} |`)
  }
  lines.push('')
  lines.push('### 📜 中长期合约')
  lines.push('| 月份 | 行权价(元) | 量(MWh) | 权利金(元) | 交割方式 | 保证金(元) |')
  lines.push('|------|-----------|---------|-----------|---------|-----------|')
  for (const c of r.forward_contracts) {
    lines.push(`| ${c.contract_month} | ${c.strike_price} | ${c.volume_mwh} | ${c.premium_kyuan} | ${c.delivery_type} | ${c.credit_requirement_kyuan} |`)
  }
  lines.push('')
  if (r.green_certificates.length > 0) {
    lines.push('### 🌿 绿证交易')
    lines.push('| 类型 | 量(MWh) | 单价(元) | 年份 | 状态 | 合规价值 |')
    lines.push('|------|---------|---------|------|------|---------|')
    for (const g of r.green_certificates) {
      lines.push(`| ${g.certificate_type} | ${g.volume_mwh} | ${g.price_per_mwh} | ${g.vintage_year} | ${g.retirement_status} | ${g.compliance_value} |`)
    }
    lines.push('')
  }
  lines.push('### 📉 风险指标')
  lines.push(`- VaR(95%): ${r.risk_metrics.var_95_pct}% | CVaR(95%): ${r.risk_metrics.cvar_95_pct}%`)
  lines.push(`- 最大回撤: ${r.risk_metrics.max_drawdown_pct}% | 夏普比率: ${r.risk_metrics.sharpe_ratio}`)
  lines.push(`- 对冲比率: ${r.risk_metrics.hedge_ratio} | 分散度: ${r.risk_metrics.diversification_score}`)
  lines.push('')
  lines.push('### 📊 组合优化')
  lines.push('| 资产 | 权重(%) | 预期收益(%) | 风险贡献(%) | 相关性 |')
  lines.push('|------|---------|------------|------------|--------|')
  for (const p of r.portfolio_optimization) {
    lines.push(`| ${p.asset} | ${p.weight_pct} | ${p.expected_return_pct} | ${p.risk_contribution_pct} | ${p.correlation_to_portfolio} |`)
  }
  lines.push('')
  lines.push('### 📋 优化建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*免责声明: ${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Renewable Energy Optimizer — 新能源优化
  tools.register(defineTool({
    name: 'renewable_energy_optimizer',
    description: '新能源优化 | 光伏/风电功率预测、弃电分析、消纳优化、储能调度、并网管理 | Renewable energy optimization with power forecasting, curtailment analysis, storage scheduling.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: plant_type (solar|wind|hybrid), capacity_mw, location, forecast_hours, historical_output?, curtailment_rate?, storage_mwh?'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatRenewableEnergy(analyzeRenewableEnergy(JSON.parse(args.input_data)))
    }
  }))

  // Tool 2: Smart Grid Manager — 智能电网管理
  tools.register(defineTool({
    name: 'smart_grid_manager',
    description: '智能电网管理 | 负荷预测、调度优化、电压控制、故障定位、自愈控制 | Smart grid management with load forecasting, dispatch optimization, voltage control, fault location.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: grid_region, base_load_mw, peak_load_mw, renewable_penetration_pct, voltage_level_kv, fault_detected, fault_section?'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSmartGrid(analyzeSmartGrid(JSON.parse(args.input_data)))
    }
  }))

  // Tool 3: Carbon Footprint Tracker — 碳足迹追踪
  tools.register(defineTool({
    name: 'carbon_footprint_tracker',
    description: '碳足迹追踪 | 排放核算、碳强度、减排路径、碳配额、碳交易策略 | Carbon footprint tracking with emission accounting, reduction pathways, carbon trading.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: entity_name, reporting_year, scope1_sources[{source, emission_tco2}], scope2_sources[], scope3_sources[], gdp_myuan?, output_tons?, carbon_price_per_ton?'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatCarbonFootprint(analyzeCarbonFootprint(JSON.parse(args.input_data)))
    }
  }))

  // Tool 4: Energy Storage Manager — 储能管理
  tools.register(defineTool({
    name: 'energy_storage_manager',
    description: '储能管理 | 充放电策略、寿命评估、容量配置、峰谷套利、安全监控 | Energy storage management with charge/discharge strategy, life assessment, safety monitoring.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: battery_type (lithium|flow|sodium|compressed_air), capacity_mwh, power_mw, cycle_life, current_soc_pct, electricity_price[{hour, price_yuan}], safety_threshold'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatEnergyStorage(analyzeEnergyStorage(JSON.parse(args.input_data)))
    }
  }))

  // Tool 5: Demand Response Coordinator — 需求响应协调
  tools.register(defineTool({
    name: 'demand_response_coordinator',
    description: '需求响应协调 | 可中断负荷、虚拟电厂、响应策略、补偿结算、用户管理 | Demand response coordination with interruptible loads, VPP dispatch, settlement.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: region, total_interruptible_load_mw, vpp_capacity_mw, response_type (price_based|incentive_based|hybrid), event_duration_hours, participants[{id, load_mw, flexibility_pct}], compensation_rate_yuan'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatDemandResponse(analyzeDemandResponse(JSON.parse(args.input_data)))
    }
  }))

  // Tool 6: Energy Efficiency Auditor — 能效审计
  tools.register(defineTool({
    name: 'energy_efficiency_auditor',
    description: '能效审计 | 能耗分析、节能诊断、改造方案、投资回收、能效对标 | Energy efficiency auditing with consumption analysis, saving measures, retrofit planning.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: facility_name, facility_type (factory|building|data_center|hospital), annual_energy_mwh, annual_cost_kyuan, floor_area_sqm, equipment_list[{name, power_kw, hours_per_day, efficiency_pct}], benchmark_kwh_per_sqm'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatEnergyEfficiency(analyzeEnergyEfficiency(JSON.parse(args.input_data)))
    }
  }))

  // Tool 7: Distributed Energy Planner — 分布式能源规划
  tools.register(defineTool({
    name: 'distributed_energy_planner',
    description: '分布式能源规划 | 微网设计、多能互补、容量优化、接入方案、经济性分析 | Distributed energy planning with microgrid design, multi-energy complementarity, capacity optimization.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: project_name, load_demand_mw, solar_resource_kwh_m2, wind_resource_ms, gas_available, grid_connection (on_grid|off_grid|microgrid), land_area_sqm, budget_myuan'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatDistributedEnergy(analyzeDistributedEnergy(JSON.parse(args.input_data)))
    }
  }))

  // Tool 8: Energy Trading Advisor — 能源交易顾问
  tools.register(defineTool({
    name: 'energy_trading_advisor',
    description: '能源交易顾问 | 现货市场、中长期合约、绿证交易、风险管理、组合优化 | Energy trading advisory with spot market, forward contracts, green certificates, risk management.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: market_type (spot|forward|green_certificate|carbon|capacity), position_mwh, price_forecast[{period, price_yuan, volatility}], risk_tolerance (conservative|moderate|aggressive), contract_duration_months, green_cert_required, carbon_allowance_t'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatEnergyTrading(analyzeEnergyTrading(JSON.parse(args.input_data)))
    }
  }))

  console.log(`[dsh-tool-energyagentpro] Loaded v${VERSION} — 智慧能源AI助手, 8 tools active`)
  console.log('  Tools: renewable_energy_optimizer, smart_grid_manager, carbon_footprint_tracker, energy_storage_manager, demand_response_coordinator, energy_efficiency_auditor, distributed_energy_planner, energy_trading_advisor')
}
