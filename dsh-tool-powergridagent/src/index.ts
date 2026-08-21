/**
 * DSH Power Grid Agent Plugin v0.1.0
 * 智能电网AI Agent for DeepSeek Harness — 电力负荷预测、电网稳定、分布式能源、故障隔离、电能质量、需求响应、设备健康、电力市场
 *
 * 八大工具覆盖智能电网全链条业务场景，从发电预测到输变电管理到用电侧需求响应。
 *
 * 工具清单:
 * 1. load_forecasting_engine    — 电力负荷预测与峰谷调节 (Power load forecasting with peak-valley regulation)
 * 2. grid_stability_analyzer    — 电网稳定分析与谐波评估 (Grid stability analysis with harmonic assessment)
 * 3. distributed_energy_manager — 分布式光伏/储能并网管理 (Distributed PV/storage grid integration management)
 * 4. fault_location_isolation   — 故障定位隔离与自愈重构 (Fault location/isolation with self-healing reconfiguration)
 * 5. power_quality_monitor      — 电能质量监测与无功补偿 (Power quality monitoring with reactive power compensation)
 * 6. demand_response_coordinator— 需求响应调度与虚拟电厂 (Demand response dispatch with virtual power plant)
 * 7. grid_asset_management      — 输变电设备健康管理 (Transmission/substation asset health management)
 * 8. electricity_market_trader  — 电力市场交易与现货价格预测 (Electricity market trading with spot price prediction)
 *
 * @module dsh-tool-powergridagent | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-powergridagent'
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

// --- Tool 1: Load Forecasting Engine ---
interface LoadForecastInput {
  region_id: string
  forecast_hours: number
  historical_load_mw: number[]
  weather_temp_c: number
  weather_humidity_pct: number
  is_holiday: boolean
  industrial_pct: number
  residential_pct: number
  commercial_pct: number
}

interface ForecastPoint {
  hour: number
  predicted_load_mw: number
  confidence_lower: number
  confidence_upper: number
}

interface PeakValleyInfo {
  peak_hour: number
  peak_load_mw: number
  valley_hour: number
  valley_load_mw: number
  peak_valley_ratio: number
}

interface LoadForecastResult {
  region_id: string
  forecast_points: ForecastPoint[]
  peak_valley: PeakValleyInfo
  total_energy_mwh: number
  avg_load_mw: number
  max_load_mw: number
  min_load_mw: number
  regulation_suggestion: string
  accuracy_mape_pct: number
}

// --- Tool 2: Grid Stability Analyzer ---
interface GridStabilityInput {
  grid_segment_id: string
  base_voltage_kv: number
  current_voltage_kv: number
  frequency_hz: number
  active_power_mw: number
  reactive_power_mvar: number
  harmonic_orders: number[]
  harmonic_distortion_pct: number[]
  short_capacity_mva: number
}

interface VoltageStability {
  status: 'stable' | 'warning' | 'critical'
  voltage_deviation_pct: number
  margin_to_collapse_pct: number
}

interface HarmonicAssessment {
  thd_pct: number
  dominant_harmonic: number
  compliance_status: 'compliant' | 'marginal' | 'violation'
  std_reference: string
}

interface TransientStability {
  critical_clearing_time_ms: number
  stability_margin_pct: number
  oscillation_damping_ratio: number
}

interface GridStabilityResult {
  grid_segment_id: string
  voltage_stability: VoltageStability
  harmonic_assessment: HarmonicAssessment
  transient_stability: TransientStability
  frequency_deviation_mhz: number
  power_factor: number
  overall_stability_score: number
  risk_level: 'low' | 'medium' | 'high' | 'severe'
  recommendations: string[]
}

// --- Tool 3: Distributed Energy Manager ---
interface DistEnergyInput {
  node_id: string
  pv_capacity_mw: number
  pv_current_output_mw: number
  battery_capacity_mwh: number
  battery_soc_pct: number
  battery_power_mw: number
  grid_connection_mw: number
  load_demand_mw: number
  inverter_efficiency_pct: number
  grid_voltage_kv: number
  grid_frequency_hz: number
}

interface PVStatus {
  capacity_factor: number
  curtailment_risk: boolean
  forecast_next_hour_mw: number
  irradiance_wm2: number
}

interface BatteryStatus {
  state_of_health_pct: number
  cycles_today: number
  charge_discharge_mode: 'charging' | 'discharging' | 'idle'
  available_energy_kwh: number
  remaining_life_years: number
}

interface GridSyncStatus {
  voltage_match: boolean
  frequency_match: boolean
  phase_sync: boolean
  sync_quality_score: number
  islanding_risk: boolean
}

interface DistEnergyResult {
  node_id: string
  pv_status: PVStatus
  battery_status: BatteryStatus
  grid_sync: GridSyncStatus
  power_balance_mw: number
  self_consumption_pct: number
  grid_independence_pct: number
  revenue_per_hour_usd: number
  carbon_reduction_kg: number
  operational_mode: string
}

// --- Tool 4: Fault Location Isolation ---
interface FaultInput {
  feeder_id: string
  fault_type: 'single_phase_ground' | 'phase_to_phase' | 'three_phase' | 'open_circuit'
  fault_current_ka: number
  fault_resistance_ohm: number
  line_length_km: number
  section_lengths_km: number[]
  upstream_protection_status: string
  downstream_load_mw: number
  smart_switch_count: number
}

interface FaultLocation {
  estimated_section: number
  distance_from_substation_km: number
  confidence_pct: number
  fault_resistance_estimated_ohm: number
  probable_cause: string
}

interface IsolationPlan {
  switches_to_open: number[]
  switches_to_close: number[]
  sections_isolated: number[]
  customers_affected: number
  restoration_time_estimate_min: number
}

interface SelfHealingResult {
  alternative_feeders: string[]
  load_transfer_mw: number
  reconfiguration_success_prob: number
  estimated_recovery_time_min: number
  steps: string[]
}

interface FaultResult {
  feeder_id: string
  fault_location: FaultLocation
  isolation_plan: IsolationPlan
  self_healing: SelfHealingResult
  protection_coordination: string
  safety_lockout_status: boolean
  crew_dispatch_priority: 'routine' | 'urgent' | 'emergency'
}

// --- Tool 5: Power Quality Monitor ---
interface PowerQualityInput {
  monitoring_point_id: string
  voltage_l1_v: number
  voltage_l2_v: number
  voltage_l3_v: number
  current_l1_a: number
  current_l2_a: number
  current_l3_a: number
  active_power_kw: number
  reactive_power_kvar: number
  apparent_power_kva: number
  frequency_hz: number
  thd_voltage_pct: number
  thd_current_pct: number
}

interface VoltageQuality {
  unbalance_pct: number
  sag_events: number
  swells_events: number
  flicker_pst: number
  compliance: 'compliant' | 'marginal' | 'violation'
}

interface ReactivePowerStatus {
  current_pf: number
  target_pf: number
  deficit_kvar: number
  compensation_required: boolean
  suggested_capacitor_steps: number
}

interface HarmonicSpectrum {
  h3_pct: number
  h5_pct: number
  h7_pct: number
  h11_pct: number
  h13_pct: number
  thd_compliance: 'pass' | 'fail'
}

interface PowerQualityResult {
  monitoring_point_id: string
  voltage_quality: VoltageQuality
  reactive_status: ReactivePowerStatus
  harmonic_spectrum: HarmonicSpectrum
  overall_pq_index: number
  ieee_519_compliant: boolean
  en_50160_compliant: boolean
  compensation_action: string
}

// --- Tool 6: Demand Response Coordinator ---
interface DemandResponseInput {
  vpp_id: string
  total_capacity_mw: number
  enrolled_customers: number
  current_demand_mw: number
  target_reduction_mw: number
  event_type: 'price_based' | 'incentive_based' | 'emergency'
  electricity_price_per_mwh: number
  time_of_use_period: string
  available_resources: string[]
  weather_forecast_temp_c: number
}

interface ResourceDispatch {
  resource_type: string
  dispatched_mw: number
  duration_min: number
  cost_per_mwh: number
  customer_count: number
}

interface VPPSummary {
  total_dispatchable_mw: number
  committed_reduction_mw: number
  actual_reduction_mw: number
  performance_ratio: number
  revenue_usd: number
  customer_participation_pct: number
}

interface PriceForecast {
  clearing_price_per_mwh: number
  price_volatility: number
  peak_price_hour: number
  offpeak_price_hour: number
}

interface DemandResponseResult {
  vpp_id: string
  dispatches: ResourceDispatch[]
  vpp_summary: VPPSummary
  price_forecast: PriceForecast
  carbon_offset_tonnes: number
  customer_incentives_usd: number
  grid_relief_pct: number
  event_status: 'scheduled' | 'active' | 'completed' | 'cancelled'
}

// --- Tool 7: Grid Asset Management ---
interface AssetInput {
  asset_id: string
  asset_type: 'transformer' | 'switchgear' | 'cable' | 'tower' | 'breaker'
  installation_year: number
  last_maintenance_date: string
  operating_years: number
  load_factor_pct: number
  ambient_temp_c: number
  oil_temp_c?: number
  dissolved_gas_h2_ppm?: number
  dissolved_gas_ch4_ppm?: number
  partial_discharge_pc?: number
  infrared_temp_c?: number
  vibration_mm_s?: number
}

interface HealthIndex {
  overall_score: number
  age_factor: number
  load_factor: number
  condition_factor: number
  health_grade: 'A' | 'B' | 'C' | 'D' | 'E'
}

interface DegradationAnalysis {
  insulation_life_consumed_pct: number
  remaining_useful_life_years: number
  failure_probability_12mo: number
  degradation_rate: 'slow' | 'moderate' | 'accelerated' | 'rapid'
}

interface MaintenanceRecommendation {
  action: string
  priority: 'routine' | 'planned' | 'urgent' | 'emergency'
  estimated_cost_usd: number
  recommended_date: string
  risk_if_deferred: string
}

interface AssetResult {
  asset_id: string
  health_index: HealthIndex
  degradation: DegradationAnalysis
  maintenance: MaintenanceRecommendation
  failure_mode_risks: string[]
  replacement_urgency: 'none' | 'monitor' | 'plan' | 'immediate'
  inspection_interval_months: number
}

// --- Tool 8: Electricity Market Trader ---
interface MarketInput {
  market_id: string
  trading_date: string
  participant_id: string
  generation_capacity_mw: number
  generation_cost_per_mwh: number
  contract_position_mw: number
  historical_prices: number[]
  demand_forecast_mw: number
  renewable_share_pct: number
  fuel_cost_per_mmbtu: number
  carbon_cost_per_tonne: number
  market_type: 'day_ahead' | 'real_time' | 'futures' | 'ancillary'
}

interface PricePrediction {
  hour: number
  predicted_price_per_mwh: number
  confidence_interval_low: number
  confidence_interval_high: number
  price_driver: string
}

interface TradingSignal {
  action: 'buy' | 'sell' | 'hold'
  volume_mw: number
  target_price_per_mwh: number
  strategy: string
  risk_score: number
}

interface RiskMetrics {
  var_95_pct: number
  cvar_95_pct: number
  max_drawdown_pct: number
  sharpe_ratio: number
  exposure_mwh: number
}

interface MarketResult {
  market_id: string
  price_predictions: PricePrediction[]
  trading_signal: TradingSignal
  risk_metrics: RiskMetrics
  expected_revenue_usd: number
  market_clearing_probability: number
  regulatory_compliance: string
  carbon_exposure_tonnes: number
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Load Forecasting Engine 分析 ---
function analyzeLoadForecast(input: LoadForecastInput): LoadForecastResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.region_id + input.forecast_hours + input.weather_temp_c
  ))

  const avgHistorical = input.historical_load_mw.length > 0
    ? input.historical_load_mw.reduce((a, b) => a + b, 0) / input.historical_load_mw.length
    : 500

  const tempFactor = 1 + (input.weather_temp_c - 25) * 0.015
  const holidayFactor = input.is_holiday ? 0.7 : 1.0
  const humidityFactor = 1 + (input.weather_humidity_pct - 50) * 0.002

  const forecastPoints: ForecastPoint[] = []
  let peakLoad = 0, peakHour = 0, valleyLoad = Infinity, valleyHour = 0
  let totalEnergy = 0

  for (let h = 0; h < Math.min(input.forecast_hours, 24); h++) {
    const hourFactor = (h >= 8 && h <= 22) ? 1.2 + rng.nextFloat(-0.1, 0.1) : 0.7 + rng.nextFloat(-0.05, 0.05)
    const baseLoad = avgHistorical * hourFactor * tempFactor * holidayFactor * humidityFactor
    const noise = rng.nextFloat(-0.03, 0.03)
    const predicted = Math.round(baseLoad * (1 + noise) * 10) / 10
    const margin = Math.round(predicted * rng.nextFloat(0.03, 0.08) * 10) / 10

    forecastPoints.push({
      hour: h,
      predicted_load_mw: predicted,
      confidence_lower: Math.round((predicted - margin) * 10) / 10,
      confidence_upper: Math.round((predicted + margin) * 10) / 10,
    })

    totalEnergy += predicted
    if (predicted > peakLoad) { peakLoad = predicted; peakHour = h }
    if (predicted < valleyLoad) { valleyLoad = predicted; valleyHour = h }
  }

  const avgLoad = Math.round((totalEnergy / forecastPoints.length) * 10) / 10
  const peakValleyRatio = Math.round((peakLoad / valleyLoad) * 100) / 100

  let regulation = ''
  if (peakValleyRatio > 2.5) {
    regulation = '峰谷差过大，建议启用储能削峰填谷 + 需求响应调度'
  } else if (peakValleyRatio > 1.8) {
    regulation = '峰谷差中等，建议优化机组启停计划 + 分时电价引导'
  } else {
    regulation = '峰谷差合理，保持现有调度策略'
  }

  return {
    region_id: input.region_id,
    forecast_points: forecastPoints,
    peak_valley: {
      peak_hour: peakHour,
      peak_load_mw: Math.round(peakLoad * 10) / 10,
      valley_hour: valleyHour,
      valley_load_mw: Math.round(valleyLoad * 10) / 10,
      peak_valley_ratio: peakValleyRatio,
    },
    total_energy_mwh: Math.round(totalEnergy * 10) / 10,
    avg_load_mw: avgLoad,
    max_load_mw: Math.round(peakLoad * 10) / 10,
    min_load_mw: Math.round(valleyLoad * 10) / 10,
    regulation_suggestion: regulation,
    accuracy_mape_pct: Math.round(rng.nextFloat(1.5, 4.5) * 100) / 100,
  }
}

// --- Tool 2: Grid Stability Analyzer 分析 ---
function analyzeGridStability(input: GridStabilityInput): GridStabilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.grid_segment_id + input.current_voltage_kv + input.frequency_hz
  ))

  const voltageDeviation = ((input.current_voltage_kv - input.base_voltage_kv) / input.base_voltage_kv) * 100
  const voltStatus: VoltageStability['status'] =
    Math.abs(voltageDeviation) > 10 ? 'critical' :
    Math.abs(voltageDeviation) > 5 ? 'warning' : 'stable'

  const thd = input.harmonic_distortion_pct.length > 0
    ? input.harmonic_distortion_pct.reduce((a, b) => a + b, 0) / input.harmonic_distortion_pct.length
    : rng.nextFloat(1.5, 6.5)
  const dominantHarmonic = input.harmonic_orders.length > 0
    ? input.harmonic_orders[input.harmonic_distortion_pct.indexOf(Math.max(...input.harmonic_distortion_pct))]
    : rng.pick([3, 5, 7, 11])
  const harmonicCompliance: HarmonicAssessment['compliance_status'] =
    thd > 8 ? 'violation' : thd > 5 ? 'marginal' : 'compliant'

  const sccr = input.short_capacity_mva / (input.active_power_mw || 1)
  const cct = Math.round(rng.nextFloat(80, 250) * sccr) / 10

  const freqDeviation = Math.round((input.frequency_hz - 50) * 1000) / 1000
  const apparentPowerMva = Math.sqrt(input.active_power_mw ** 2 + input.reactive_power_mvar ** 2)
  const pf = Math.round((input.active_power_mw / (apparentPowerMva || 1)) * 100) / 100

  const overallScore = Math.round(
    (voltStatus === 'stable' ? 90 : voltStatus === 'warning' ? 65 : 35) * 0.4 +
    (harmonicCompliance === 'compliant' ? 90 : harmonicCompliance === 'marginal' ? 65 : 30) * 0.3 +
    (Math.abs(freqDeviation) < 0.1 ? 90 : Math.abs(freqDeviation) < 0.2 ? 60 : 30) * 0.3
  )

  const riskLevel: GridStabilityResult['risk_level'] =
    overallScore >= 80 ? 'low' : overallScore >= 60 ? 'medium' : overallScore >= 40 ? 'high' : 'severe'

  const recommendations: string[] = []
  if (voltStatus !== 'stable') recommendations.push('调整变压器分接头或投入无功补偿装置')
  if (harmonicCompliance !== 'compliant') recommendations.push('投入有源滤波器(APF)抑制谐波')
  if (Math.abs(freqDeviation) > 0.15) recommendations.push('调整机组出力以恢复频率')
  if (cct < 100) recommendations.push('加速保护整定优化，缩短故障清除时间')
  if (recommendations.length === 0) recommendations.push('系统运行正常，维持当前调度策略')

  return {
    grid_segment_id: input.grid_segment_id,
    voltage_stability: {
      status: voltStatus,
      voltage_deviation_pct: Math.round(voltageDeviation * 100) / 100,
      margin_to_collapse_pct: Math.round(rng.nextFloat(15, 45) * 100) / 100,
    },
    harmonic_assessment: {
      thd_pct: Math.round(thd * 100) / 100,
      dominant_harmonic: dominantHarmonic,
      compliance_status: harmonicCompliance,
      std_reference: 'IEEE 519-2022 / GB/T 14549-93',
    },
    transient_stability: {
      critical_clearing_time_ms: cct,
      stability_margin_pct: Math.round(rng.nextFloat(10, 35) * 100) / 100,
      oscillation_damping_ratio: Math.round(rng.nextFloat(0.03, 0.12) * 1000) / 1000,
    },
    frequency_deviation_mhz: freqDeviation,
    power_factor: pf,
    overall_stability_score: overallScore,
    risk_level: riskLevel,
    recommendations,
  }
}

// --- Tool 3: Distributed Energy Manager 分析 ---
function analyzeDistEnergy(input: DistEnergyInput): DistEnergyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.node_id + input.pv_current_output_mw + input.battery_soc_pct
  ))

  const capacityFactor = Math.round((input.pv_current_output_mw / (input.pv_capacity_mw || 1)) * 100 * 100) / 100
  const irradiance = Math.round(rng.nextFloat(200, 1000))
  const forecastNextHour = Math.round(input.pv_capacity_mw * (irradiance / 1000) * input.inverter_efficiency_pct / 100 * rng.nextFloat(0.85, 1.0) * 10) / 10

  const batteryMode: BatteryStatus['charge_discharge_mode'] =
    input.battery_power_mw > 0.1 ? 'discharging' :
    input.battery_power_mw < -0.1 ? 'charging' : 'idle'

  const voltageMatch = Math.abs(input.grid_voltage_kv - 10) < 0.5
  const frequencyMatch = Math.abs(input.grid_frequency_hz - 50) < 0.1
  const phaseSync = rng.next() > 0.1
  const syncQuality = Math.round(rng.nextFloat(0.85, 0.99) * 100) / 100

  const powerBalance = Math.round((input.pv_current_output_mw + input.battery_power_mw - input.load_demand_mw) * 100) / 100
  const selfConsumption = input.load_demand_mw > 0
    ? Math.round((Math.min(input.pv_current_output_mw, input.load_demand_mw) / input.load_demand_mw) * 100 * 100) / 100
    : 0
  const gridIndependence = Math.round((1 - Math.abs(powerBalance) / (input.load_demand_mw || 1)) * 100 * 100) / 100

  const sellPrice = rng.nextFloat(0.08, 0.25)
  const revenue = Math.round(Math.max(0, -powerBalance) * sellPrice * 100) / 100
  const carbonReduction = Math.round(input.pv_current_output_mw * 0.5 * 100) / 100

  let operationalMode = ''
  if (powerBalance > 0.5) operationalMode = '余电上网'
  else if (powerBalance < -0.5) operationalMode = '电网补充'
  else operationalMode = '自发自用平衡'

  return {
    node_id: input.node_id,
    pv_status: {
      capacity_factor: capacityFactor,
      curtailment_risk: input.pv_current_output_mw > input.grid_connection_mw * 0.8,
      forecast_next_hour_mw: forecastNextHour,
      irradiance_wm2: irradiance,
    },
    battery_status: {
      state_of_health_pct: Math.round(rng.nextFloat(85, 98) * 100) / 100,
      cycles_today: rng.nextInt(1, 3),
      charge_discharge_mode: batteryMode,
      available_energy_kwh: Math.round(input.battery_capacity_mwh * input.battery_soc_pct / 100 * 10) / 10,
      remaining_life_years: Math.round(rng.nextFloat(5, 15) * 10) / 10,
    },
    grid_sync: {
      voltage_match: voltageMatch,
      frequency_match: frequencyMatch,
      phase_sync: phaseSync,
      sync_quality_score: syncQuality,
      islanding_risk: !voltageMatch || !frequencyMatch || !phaseSync,
    },
    power_balance_mw: powerBalance,
    self_consumption_pct: selfConsumption,
    grid_independence_pct: Math.max(0, Math.min(100, gridIndependence)),
    revenue_per_hour_usd: revenue,
    carbon_reduction_kg: carbonReduction,
    operational_mode: operationalMode,
  }
}

// --- Tool 4: Fault Location Isolation 分析 ---
function analyzeFaultLocation(input: FaultInput): FaultResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.feeder_id + input.fault_type + input.fault_current_ka
  ))

  const faultImpedance = input.fault_resistance_ohm + rng.nextFloat(0.5, 3.0)
  const estimatedDistance = Math.round((input.fault_current_ka * faultImpedance / 10) * rng.nextFloat(0.8, 1.2) * 100) / 100

  let sectionIdx = 0
  let acc = 0
  for (let i = 0; i < input.section_lengths_km.length; i++) {
    acc += input.section_lengths_km[i]
    if (acc >= estimatedDistance) { sectionIdx = i; break }
  }

  const causes: Record<string, string> = {
    'single_phase_ground': '雷击/绝缘子污闪/树枝碰线',
    'phase_to.phase': '外力施工/设备老化击穿',
    'three_phase': '倒杆断线/严重覆冰',
    'open_circuit': '导线断裂/接头过热熔断',
  }

  const confidence = Math.round(rng.nextFloat(72, 97) * 100) / 100

  const switchesToOpen = [sectionIdx + 1]
  const switchesToClose = input.smart_switch_count > 2 ? [sectionIdx + 2] : []
  const customersAffected = Math.round(input.downstream_load_mw * rng.nextFloat(50, 200))

  const priority: FaultResult['crew_dispatch_priority'] =
    input.fault_type === 'three_phase' ? 'emergency' :
    input.fault_type === 'single_phase_ground' ? 'urgent' : 'routine'

  const altFeeders = [`feeder-${rng.nextInt(100, 999)}`, `feeder-${rng.nextInt(100, 999)}`]
  const transferCapacity = Math.round(input.downstream_load_mw * rng.nextFloat(0.6, 0.9) * 10) / 10
  const recoveryTime = Math.round(rng.nextFloat(5, 45))

  return {
    feeder_id: input.feeder_id,
    fault_location: {
      estimated_section: sectionIdx + 1,
      distance_from_substation_km: estimatedDistance,
      confidence_pct: confidence,
      fault_resistance_estimated_ohm: Math.round(faultImpedance * 100) / 100,
      probable_cause: causes[input.fault_type] || '疑似设备绝缘老化',
    },
    isolation_plan: {
      switches_to_open: switchesToOpen,
      switches_to_close: switchesToClose,
      sections_isolated: [sectionIdx + 1],
      customers_affected: customersAffected,
      restoration_time_estimate_min: Math.round(rng.nextFloat(15, 90)),
    },
    self_healing: {
      alternative_feeders: altFeeders,
      load_transfer_mw: transferCapacity,
      reconfiguration_success_prob: Math.round(rng.nextFloat(0.75, 0.98) * 100) / 100,
      estimated_recovery_time_min: recoveryTime,
      steps: [
        '故障检测与定位确认',
        '断开故障段两侧开关',
        '闭合联络开关转供',
        '隔离故障段并派发抢修工单',
        '恢复供电后系统自检',
      ],
    },
    protection_coordination: input.upstream_protection_status === 'normal' ? '保护级差配合正常' : '需复核保护定值配合',
    safety_lockout_status: input.fault_type === 'three_phase',
    crew_dispatch_priority: priority,
  }
}

// --- Tool 5: Power Quality Monitor 分析 ---
function analyzePowerQuality(input: PowerQualityInput): PowerQualityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.monitoring_point_id + input.voltage_l1_v + input.current_l1_a
  ))

  const avgVoltage = (input.voltage_l1_v + input.voltage_l2_v + input.voltage_l3_v) / 3
  const maxDev = Math.max(
    Math.abs(input.voltage_l1_v - avgVoltage),
    Math.abs(input.voltage_l2_v - avgVoltage),
    Math.abs(input.voltage_l3_v - avgVoltage)
  )
  const unbalance = Math.round((maxDev / avgVoltage) * 100 * 100) / 100

  const currentPf = input.apparent_power_kva > 0
    ? Math.round((input.active_power_kw / input.apparent_power_kva) * 100) / 100
    : 0.92
  const targetPf = 0.95
  const deficitKvar = Math.round(input.active_power_kw * (Math.acos(targetPf) - Math.acos(currentPf)) / Math.acos(currentPf) * 10) / 10

  const h3 = Math.round(rng.nextFloat(1.0, 5.5) * 100) / 100
  const h5 = Math.round(rng.nextFloat(0.8, 4.0) * 100) / 100
  const h7 = Math.round(rng.nextFloat(0.5, 3.0) * 100) / 100
  const h11 = Math.round(rng.nextFloat(0.3, 2.0) * 100) / 100
  const h13 = Math.round(rng.nextFloat(0.2, 1.5) * 100) / 100
  const thdCalc = Math.round(Math.sqrt(h3*h3 + h5*h5 + h7*h7 + h11*h11 + h13*h13) * 100) / 100

  const pqIndex = Math.round((100 -
    (unbalance * 2) -
    (Math.abs(currentPf - 1) * 50) -
    (thdCalc * 3) -
    (input.thd_current_pct * 1.5)
  ) * 10) / 10

  let compensationAction = ''
  if (currentPf < 0.9) compensationAction = '立即投入3组电容器组，预计提升功率因数至0.95以上'
  else if (currentPf < 0.95) compensationAction = '投入1-2组电容器组进行微调补偿'
  else compensationAction = '功率因数达标，无需额外补偿'

  return {
    monitoring_point_id: input.monitoring_point_id,
    voltage_quality: {
      unbalance_pct: unbalance,
      sag_events: rng.nextInt(0, 3),
      swells_events: rng.nextInt(0, 2),
      flicker_pst: Math.round(rng.nextFloat(0.3, 1.2) * 100) / 100,
      compliance: unbalance < 2 && Math.abs(avgVoltage - 220) / 220 < 0.1 ? 'compliant' : 'marginal',
    },
    reactive_status: {
      current_pf: currentPf,
      target_pf: targetPf,
      deficit_kvar: deficitKvar > 0 ? deficitKvar : 0,
      compensation_required: currentPf < targetPf,
      suggested_capacitor_steps: deficitKvar > 50 ? 3 : deficitKvar > 20 ? 2 : 1,
    },
    harmonic_spectrum: {
      h3_pct: h3,
      h5_pct: h5,
      h7_pct: h7,
      h11_pct: h11,
      h13_pct: h13,
      thd_compliance: thdCalc < 8 ? 'pass' : 'fail',
    },
    overall_pq_index: Math.max(0, Math.min(100, pqIndex)),
    ieee_519_compliant: thdCalc < 5 && unbalance < 3,
    en_50160_compliant: unbalance < 2 && Math.abs(avgVoltage - 220) / 220 < 0.1,
    compensation_action: compensationAction,
  }
}

// --- Tool 6: Demand Response Coordinator 分析 ---
function analyzeDemandResponse(input: DemandResponseInput): DemandResponseResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vpp_id + input.event_type + input.electricity_price_per_mwh
  ))

  const resourceTypes = ['battery_storage', 'ev_charging', 'hvac_load', 'industrial_shift', 'cold_storage']
  const dispatches: ResourceDispatch[] = []
  let totalDispatched = 0

  const count = rng.nextInt(2, Math.min(4, input.available_resources.length || 3))
  for (let i = 0; i < count; i++) {
    const mw = Math.round(rng.nextFloat(0.5, input.target_reduction_mw * 0.4) * 10) / 10
    totalDispatched += mw
    dispatches.push({
      resource_type: resourceTypes[i % resourceTypes.length],
      dispatched_mw: mw,
      duration_min: rng.nextInt(30, 180),
      cost_per_mwh: Math.round(rng.nextFloat(20, 120) * 100) / 100,
      customer_count: rng.nextInt(10, 500),
    })
  }

  const actualReduction = Math.round(totalDispatched * rng.nextFloat(0.82, 0.97) * 10) / 10
  const performanceRatio = Math.round((actualReduction / (input.target_reduction_mw || 1)) * 100) / 100
  const revenue = Math.round(actualReduction * input.electricity_price_per_mwh * 100) / 100

  const peakPrice = Math.round(input.electricity_price_per_mwh * rng.nextFloat(1.5, 3.0))
  const offpeakPrice = Math.round(input.electricity_price_per_mwh * rng.nextFloat(0.3, 0.7))

  const eventStatus: DemandResponseResult['event_status'] =
    input.event_type === 'emergency' ? 'active' : rng.pick(['scheduled', 'active', 'completed'])

  return {
    vpp_id: input.vpp_id,
    dispatches,
    vpp_summary: {
      total_dispatchable_mw: Math.round(input.total_capacity_mw * rng.nextFloat(0.7, 0.95) * 10) / 10,
      committed_reduction_mw: Math.round(totalDispatched * 10) / 10,
      actual_reduction_mw: actualReduction,
      performance_ratio: performanceRatio,
      revenue_usd: revenue,
      customer_participation_pct: Math.round(rng.nextFloat(60, 92) * 100) / 100,
    },
    price_forecast: {
      clearing_price_per_mwh: Math.round(input.electricity_price_per_mwh * rng.nextFloat(0.9, 1.8) * 100) / 100,
      price_volatility: Math.round(rng.nextFloat(0.1, 0.4) * 100) / 100,
      peak_price_hour: rng.nextInt(18, 22),
      offpeak_price_hour: rng.nextInt(2, 6),
    },
    carbon_offset_tonnes: Math.round(actualReduction * 0.4 * 100) / 100,
    customer_incentives_usd: Math.round(actualReduction * rng.nextFloat(15, 40) * 100) / 100,
    grid_relief_pct: Math.round((actualReduction / (input.current_demand_mw || 1)) * 100 * 100) / 100,
    event_status: eventStatus,
  }
}

// --- Tool 7: Grid Asset Management 分析 ---
function analyzeAssetManagement(input: AssetInput): AssetResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.asset_id + input.asset_type + input.operating_years
  ))

  const ageFactor = Math.max(0, 1 - input.operating_years / 40)
  const loadFactor = Math.max(0, 1 - (input.load_factor_pct - 70) / 100)

  let conditionFactor = 0.85
  if (input.dissolved_gas_h2_ppm && input.dissolved_gas_h2_ppm > 100) conditionFactor -= 0.15
  if (input.dissolved_gas_ch4_ppm && input.dissolved_gas_ch4_ppm > 150) conditionFactor -= 0.1
  if (input.partial_discharge_pc && input.partial_discharge_pc > 500) conditionFactor -= 0.2
  if (input.oil_temp_c && input.oil_temp_c > 85) conditionFactor -= 0.1
  if (input.infrared_temp_c && input.infrared_temp_c > 60) conditionFactor -= 0.05
  conditionFactor = Math.max(0.1, conditionFactor)

  const overallScore = Math.round((ageFactor * 0.3 + loadFactor * 0.3 + conditionFactor * 0.4) * 100)
  const grade: HealthIndex['health_grade'] =
    overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 50 ? 'C' : overallScore >= 30 ? 'D' : 'E'

  const insulationLifeConsumed = Math.round((1 - ageFactor * conditionFactor) * 100 * 100) / 100
  const remainingLife = Math.round(Math.max(0, (1 - insulationLifeConsumed / 100) * 40) * 10) / 10
  const failureProb = Math.round((100 - overallScore) * rng.nextFloat(0.001, 0.005) * 10000) / 10000

  const degradationRate: DegradationAnalysis['degradation_rate'] =
    insulationLifeConsumed > 80 ? 'rapid' : insulationLifeConsumed > 60 ? 'accelerated' : insulationLifeConsumed > 40 ? 'moderate' : 'slow'

  let action = ''
  let priority: MaintenanceRecommendation['priority'] = 'routine'
  let urgency: AssetResult['replacement_urgency'] = 'none'

  if (grade === 'A' || grade === 'B') {
    action = '继续运行，按计划巡检'
    priority = 'routine'
    urgency = 'none'
  } else if (grade === 'C') {
    action = '安排预防性试验，缩短巡检周期'
    priority = 'planned'
    urgency = 'monitor'
  } else if (grade === 'D') {
    action = '制定检修计划，准备备品备件'
    priority = 'urgent'
    urgency = 'plan'
  } else {
    action = '立即停运检修或更换'
    priority = 'emergency'
    urgency = 'immediate'
  }

  const failureModes: string[] = []
  if (input.dissolved_gas_h2_ppm && input.dissolved_gas_h2_ppm > 100) failureModes.push('局部放电风险')
  if (input.oil_temp_c && input.oil_temp_c > 85) failureModes.push('绝缘油过热劣化')
  if (input.partial_discharge_pc && input.partial_discharge_pc > 500) failureModes.push('严重局部放电')
  if (input.vibration_mm_s && input.vibration_mm_s > 5) failureModes.push('机械振动异常')
  if (failureModes.length === 0) failureModes.push('暂无显著故障模式')

  return {
    asset_id: input.asset_id,
    health_index: {
      overall_score: overallScore,
      age_factor: Math.round(ageFactor * 100) / 100,
      load_factor: Math.round(loadFactor * 100) / 100,
      condition_factor: Math.round(conditionFactor * 100) / 100,
      health_grade: grade,
    },
    degradation: {
      insulation_life_consumed_pct: insulationLifeConsumed,
      remaining_useful_life_years: remainingLife,
      failure_probability_12mo: failureProb,
      degradation_rate: degradationRate,
    },
    maintenance: {
      action,
      priority,
      estimated_cost_usd: priority === 'emergency' ? rng.nextInt(50000, 200000) : priority === 'urgent' ? rng.nextInt(10000, 50000) : priority === 'planned' ? rng.nextInt(2000, 10000) : rng.nextInt(500, 2000),
      recommended_date: priority === 'emergency' ? '立即' : priority === 'urgent' ? '7日内' : priority === 'planned' ? '3个月内' : '年度检修',
      risk_if_deferred: grade <= 'C' ? '故障概率显著上升，可能导致非计划停运' : '风险可控，但建议按计划执行',
    },
    failure_mode_risks: failureModes,
    replacement_urgency: urgency,
    inspection_interval_months: grade === 'A' ? 12 : grade === 'B' ? 6 : grade === 'C' ? 3 : grade === 'D' ? 1 : 0,
  }
}

// --- Tool 8: Electricity Market Trader 分析 ---
function analyzeMarketTrading(input: MarketInput): MarketResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.market_id + input.participant_id + input.trading_date
  ))

  const avgPrice = input.historical_prices.length > 0
    ? input.historical_prices.reduce((a, b) => a + b, 0) / input.historical_prices.length
    : 50

  const pricePredictions: PricePrediction[] = []
  for (let h = 0; h < 24; h++) {
    const hourFactor = (h >= 8 && h <= 22) ? 1.3 + rng.nextFloat(-0.1, 0.2) : 0.7 + rng.nextFloat(-0.1, 0.1)
    const renewableImpact = 1 - input.renewable_share_pct / 100 * 0.3
    const predicted = Math.round(avgPrice * hourFactor * renewableImpact * rng.nextFloat(0.9, 1.1) * 100) / 100
    const margin = Math.round(predicted * rng.nextFloat(0.05, 0.15) * 100) / 100

    const drivers = ['负荷高峰', '新能源出力波动', '机组检修', '联络线约束', '燃料价格变动']
    pricePredictions.push({
      hour: h,
      predicted_price_per_mwh: predicted,
      confidence_interval_low: Math.round((predicted - margin) * 100) / 100,
      confidence_interval_high: Math.round((predicted + margin) * 100) / 100,
      price_driver: rng.pick(drivers),
    })
  }

  const maxPredicted = Math.max(...pricePredictions.map(p => p.predicted_price_per_mwh))
  const minPredicted = Math.min(...pricePredictions.map(p => p.predicted_price_per_mwh))
  const avgPredicted = pricePredictions.reduce((a, b) => a + b.predicted_price_per_mwh, 0) / 24

  let action: TradingSignal['action'] = 'hold'
  let strategy = ''
  if (avgPredicted > input.generation_cost_per_mwh * 1.2) {
    action = 'sell'
    strategy = '高价时段满发套利'
  } else if (avgPredicted < input.generation_cost_per_mwh * 0.8) {
    action = 'buy'
    strategy = '低价购电锁定利润'
  } else {
    strategy = '边际价格附近观望'
  }

  const volume = Math.round(input.generation_capacity_mw * rng.nextFloat(0.3, 0.9) * 10) / 10
  const expectedRevenue = action === 'sell'
    ? Math.round(volume * (avgPredicted - input.generation_cost_per_mwh) * 100) / 100
    : 0

  const var95 = Math.round(volume * avgPredicted * rng.nextFloat(0.05, 0.15) * 100) / 100
  const carbonExposure = Math.round(input.generation_capacity_mw * 0.5 * 24 * input.carbon_cost_per_tonne / 1000 * 100) / 100

  return {
    market_id: input.market_id,
    price_predictions: pricePredictions,
    trading_signal: {
      action,
      volume_mw: volume,
      target_price_per_mwh: Math.round(avgPredicted * 100) / 100,
      strategy,
      risk_score: Math.round(rng.nextFloat(0.2, 0.7) * 100) / 100,
    },
    risk_metrics: {
      var_95_pct: var95,
      cvar_95_pct: Math.round(var95 * 1.3 * 100) / 100,
      max_drawdown_pct: Math.round(rng.nextFloat(5, 20) * 100) / 100,
      sharpe_ratio: Math.round(rng.nextFloat(0.5, 2.5) * 100) / 100,
      exposure_mwh: Math.round(volume * 24 * 10) / 10,
    },
    expected_revenue_usd: expectedRevenue,
    market_clearing_probability: Math.round(rng.nextFloat(0.7, 0.98) * 100) / 100,
    regulatory_compliance: '符合《电力现货市场基本规则》及地方交易细则',
    carbon_exposure_tonnes: carbonExposure,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Load Forecasting 报告 ---
function formatLoadForecastReport(result: LoadForecastResult): string {
  const lines: string[] = []
  lines.push('## ⚡ 电力负荷预测与峰谷调节报告')
  lines.push('')
  lines.push(`区域: ${result.region_id} | 预测时长: ${result.forecast_points.length}h | MAPE: ${result.accuracy_mape_pct}%`)
  lines.push(`总电量: ${result.total_energy_mwh} MWh | 平均负荷: ${result.avg_load_mw} MW`)
  lines.push(`峰谷比: ${result.peak_valley.peak_valley_ratio} | 峰值: ${result.peak_valley.peak_load_mw} MW@${result.peak_valley.peak_hour}h | 谷值: ${result.peak_valley.valley_load_mw} MW@${result.peak_valley.valley_hour}h`)
  lines.push('')
  lines.push('### 🔗 负荷预测曲线')
  lines.push('')
  lines.push('```mermaid')
  lines.push('xychart-beta')
  lines.push('    title "24小时负荷预测 (MW)"')
  lines.push('    x-axis [' + result.forecast_points.map(p => p.hour).join(', ') + ']')
  lines.push('    y-axis "负荷 (MW)" ' + Math.round(result.min_load_mw * 0.9) + ' --> ' + Math.round(result.max_load_mw * 1.1))
  lines.push('    line [' + result.forecast_points.map(p => p.predicted_load_mw).join(', ') + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 逐时预测数据')
  lines.push('| 小时 | 预测负荷(MW) | 置信下限 | 置信上限 |')
  lines.push('|------|-------------|---------|---------|')
  for (const p of result.forecast_points) {
    lines.push(`| ${p.hour} | ${p.predicted_load_mw} | ${p.confidence_lower} | ${p.confidence_upper} |`)
  }
  lines.push('')

  lines.push('### 📋 峰谷分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 峰值时刻 | ${result.peak_valley.peak_hour}:00 |`)
  lines.push(`| 峰值负荷 | ${result.peak_valley.peak_load_mw} MW |`)
  lines.push(`| 谷值时刻 | ${result.peak_valley.valley_hour}:00 |`)
  lines.push(`| 谷值负荷 | ${result.peak_valley.valley_load_mw} MW |`)
  lines.push(`| 峰谷比 | ${result.peak_valley.peak_valley_ratio} |`)
  lines.push('')

  lines.push('### 📋 调度建议')
  lines.push(`- ${result.regulation_suggestion}`)
  lines.push('- 建议结合新能源出力预测优化机组组合')
  lines.push('- 峰时段预留旋转备用容量不低于最大负荷的5%')
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 本预测结果仅供调度参考，实际运行中应严格执行《电力安全工作规程》')
  lines.push('- 涉及倒闸操作须持票操作，一人监护一人执行')
  lines.push('- 负荷调整应防止线路过载和电压越限')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Load Forecasting Engine v0.1.0 • MAPE < 5%*')
  return lines.join('\n')
}

// --- Tool 2: Grid Stability 报告 ---
function formatGridStabilityReport(result: GridStabilityResult): string {
  const lines: string[] = []
  lines.push('## 🔌 电网稳定分析与谐波评估报告')
  lines.push('')
  lines.push(`电网区段: ${result.grid_segment_id} | 综合稳定评分: ${result.overall_stability_score}/100 | 风险等级: ${result.risk_level.toUpperCase()}`)
  lines.push(`频率偏差: ${result.frequency_deviation_mhz} Hz | 功率因数: ${result.power_factor}`)
  lines.push('')
  lines.push('### 🔗 稳定分析拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    GEN[发电机组] -->|P=' + result.overall_stability_score + '%| BUS[母线]')
  lines.push('    BUS -->|电压稳定| LOAD[负荷]')
  lines.push('    BUS -->|谐波评估| APF[有源滤波器]')
  lines.push('    BUS -->|暂态稳定[故障清除时间| PROT[继电保护]')
  lines.push('    PROT -->|CCT| RESULT[稳定判定: ' + result.risk_level + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 电压稳定')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 状态 | ${result.voltage_stability.status} |`)
  lines.push(`| 电压偏差 | ${result.voltage_stability.voltage_deviation_pct}% |`)
  lines.push(`| 电压崩溃裕度 | ${result.voltage_stability.margin_to_collapse_pct}% |`)
  lines.push('')

  lines.push('### 📋 谐波评估')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| THD | ${result.harmonic_assessment.thd_pct}% |`)
  lines.push(`| 主导谐波 | ${result.harmonic_assessment.dominant_harmonic}次 |`)
  lines.push(`| 合规状态 | ${result.harmonic_assessment.compliance_status} |`)
  lines.push(`| 参考标准 | ${result.harmonic_assessment.std_reference} |`)
  lines.push('')

  lines.push('### 📋 暂态稳定')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 临界清除时间 | ${result.transient_stability.critical_clearing_time_ms} ms |`)
  lines.push(`| 稳定裕度 | ${result.transient_stability.stability_margin_pct}% |`)
  lines.push(`| 振荡阻尼比 | ${result.transient_stability.oscillation_damping_ratio} |`)
  lines.push('')

  lines.push('### 📋 处置建议')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 电网稳定分析结果不能替代实时调度决策，运行人员应依据SCADA/EMS系统实时数据判断')
  lines.push('- 电压越限时须立即执行紧急控制措施，防止电压崩溃')
  lines.push('- 谐波超标可能引发电容器组谐振放大，投入补偿前须进行谐波校核')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Grid Stability Analyzer v0.1.0 • IEEE Std 1547*')
  return lines.join('\n')
}

// --- Tool 3: Distributed Energy 报告 ---
function formatDistEnergyReport(result: DistEnergyResult): string {
  const lines: string[] = []
  lines.push('## 🌞 分布式光伏/储能并网管理报告')
  lines.push('')
  lines.push(`节点: ${result.node_id} | 运行模式: ${result.operational_mode}`)
  lines.push(`自发自用率: ${result.self_consumption_pct}% | 电网独立率: ${result.grid_independence_pct}%`)
  lines.push(`功率平衡: ${result.power_balance_mw} MW | 碳减排: ${result.carbon_reduction_kg} kg/h`)
  lines.push('')
  lines.push('### 🔗 能量流拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    PV[光伏阵列] -->|DC/AC| INV[逆变器]')
  lines.push('    BAT[储能电池] -->|PCS| INV')
  lines.push('    INV -->|并网点| PCC[公共连接点]')
  lines.push('    PCC -->|供电| LOAD[本地负荷]')
  lines.push('    PCC <-->|余电上网/电网补充| GRID[配电网]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 光伏状态')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 容量因子 | ${result.pv_status.capacity_factor}% |`)
  lines.push(`| 辐照度 | ${result.pv_status.irradiance_wm2} W/m² |`)
  lines.push(`| 下时预测 | ${result.pv_status.forecast_next_hour_mw} MW |`)
  lines.push(`| 弃光风险 | ${result.pv_status.curtailment_risk ? '是' : '否'} |`)
  lines.push('')

  lines.push('### 📋 储能状态')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 健康度SOH | ${result.battery_status.state_of_health_pct}% |`)
  lines.push(`| 充放电模式 | ${result.battery_status.charge_discharge_mode} |`)
  lines.push(`| 可用电量 | ${result.battery_status.available_energy_kwh} kWh |`)
  lines.push(`| 今日循环 | ${result.battery_status.cycles_today} 次 |`)
  lines.push(`| 剩余寿命 | ${result.battery_status.remaining_life_years} 年 |`)
  lines.push('')

  lines.push('### 📋 并网同步')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 电压匹配 | ${result.grid_sync.voltage_match ? '是' : '否'} |`)
  lines.push(`| 频率匹配 | ${result.grid_sync.frequency_match ? '是' : '否'} |`)
  lines.push(`| 相位同步 | ${result.grid_sync.phase_sync ? '是' : '否'} |`)
  lines.push(`| 同步质量 | ${result.grid_sync.sync_quality_score} |`)
  lines.push(`| 孤岛风险 | ${result.grid_sync.islanding_risk ? '是' : '否'} |`)
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 分布式电源并网须满足《分布式电源接入电网技术规定》(Q/GDW 1480)')
  lines.push('- 储能系统应设置过充过放保护，BMS与PCS保护定值须配合整定')
  lines.push('- 孤岛运行风险存在时，反孤岛保护须在2秒内动作切除分布式电源')
  lines.push('- 检修时须断开光伏直流侧和交流侧开关，悬挂"禁止合闸"标示牌')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Distributed Energy Manager v0.1.0 • Q/GDW 1480*')
  return lines.join('\n')
}

// --- Tool 4: Fault Location 报告 ---
function formatFaultReport(result: FaultResult): string {
  const lines: string[] = []
  lines.push('## 🚨 故障定位隔离与自愈重构报告')
  lines.push('')
  lines.push(`馈线: ${result.feeder_id} | 故障类型: ${result.fault_location.probable_cause}`)
  lines.push(`定位区段: 第${result.fault_location.estimated_section}段 | 距离: ${result.fault_location.distance_from_substation_km} km | 置信度: ${result.fault_location.confidence_pct}%`)
  lines.push(`抢修优先级: ${result.crew_dispatch_priority.toUpperCase()} | 安全闭锁: ${result.safety_lockout_status ? '已激活' : '未激活'}`)
  lines.push('')
  lines.push('### 🔗 故障处理流程')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    DET[故障检测] --> LOC[故障定位]')
  lines.push('    LOC --> ISO[隔离故障段]')
  lines.push('    ISO --> TRA[负荷转供]')
  lines.push('    TRA --> REC[自愈重构]')
  lines.push('    REC --> DIS[派发抢修]')
  lines.push('    DIS --> RES[恢复供电]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 故障定位')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 估计区段 | 第${result.fault_location.estimated_section}段 |`)
  lines.push(`| 距离变电站 | ${result.fault_location.distance_from_substation_km} km |`)
  lines.push(`| 置信度 | ${result.fault_location.confidence_pct}% |`)
  lines.push(`| 估计过渡电阻 | ${result.fault_location.fault_resistance_estimated_ohm} Ω |`)
  lines.push(`| 可能原因 | ${result.fault_location.probable_cause} |`)
  lines.push('')

  lines.push('### 📋 隔离方案')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 断开开关 | [${result.isolation_plan.switches_to_open.join(', ')}] |`)
  lines.push(`| 闭合开关 | [${result.isolation_plan.switches_to_close.join(', ') || '无'}] |`)
  lines.push(`| 影响用户 | ${result.isolation_plan.customers_affected} 户 |`)
  lines.push(`| 预计恢复 | ${result.isolation_plan.restoration_time_estimate_min} 分钟 |`)
  lines.push('')

  lines.push('### 📋 自愈重构')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 备用馈线 | ${result.self_healing.alternative_feeders.join(', ')} |`)
  lines.push(`| 转供容量 | ${result.self_healing.load_transfer_mw} MW |`)
  lines.push(`| 重构成功率 | ${result.self_healing.reconfiguration_success_prob} |`)
  lines.push(`| 预计恢复时间 | ${result.self_healing.estimated_recovery_time_min} 分钟 |`)
  lines.push('')

  lines.push('### 📋 自愈步骤')
  for (const s of result.self_healing.steps) lines.push(`- ${s}`)
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 故障抢修须严格执行《电力事故调查规程》，确保"人身安全、电网安全、设备安全"')
  lines.push('- 操作前必须验电、装设接地线、悬挂标示牌和装设遮栏')
  lines.push('- 安全闭锁激活时，禁止远程操作，须现场人工确认后方可解锁')
  lines.push('- 故障段隔离后方可进行负荷转供，防止非同期合闸')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Fault Location & Isolation v0.1.0 • DL/T 721*')
  return lines.join('\n')
}

// --- Tool 5: Power Quality 报告 ---
function formatPowerQualityReport(result: PowerQualityResult): string {
  const lines: string[] = []
  lines.push('## 📊 电能质量监测与无功补偿报告')
  lines.push('')
  lines.push(`监测点: ${result.monitoring_point_id} | 电能质量指数: ${result.overall_pq_index}/100`)
  lines.push(`IEEE 519合规: ${result.ieee_519_compliant ? '是' : '否'} | EN 50160合规: ${result.en_50160_compliant ? '是' : '否'}`)
  lines.push('')
  lines.push('### 🔗 电能质量分析流程')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('   采样 --> 电压质量分析')
  lines.push('   采样 --> 谐波分析')
  lines.push('   采样 --> 无功分析')
  lines.push('   电压质量分析 --> 综合评估')
  lines.push('   谐波分析 --> 综合评估')
  lines.push('   无功分析 --> 综合评估')
  lines.push('   综合评估 --> 补偿策略')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 电压质量')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 三相不平衡度 | ${result.voltage_quality.unbalance_pct}% |`)
  lines.push(`| 电压暂降次数 | ${result.voltage_quality.sag_events} |`)
  lines.push(`| 电压暂升次数 | ${result.voltage_quality.swells_events} |`)
  lines.push(`| 闪变Pst | ${result.voltage_quality.flicker_pst} |`)
  lines.push(`| 合规状态 | ${result.voltage_quality.compliance} |`)
  lines.push('')

  lines.push('### 📋 无功补偿')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 当前功率因数 | ${result.reactive_status.current_pf} |`)
  lines.push(`| 目标功率因数 | ${result.reactive_status.target_pf} |`)
  lines.push(`| 无功缺额 | ${result.reactive_status.deficit_kvar} kvar |`)
  lines.push(`| 需补偿 | ${result.reactive_status.compensation_required ? '是' : '否'} |`)
  lines.push(`| 建议电容器组数 | ${result.reactive_status.suggested_capacitor_steps} 组 |`)
  lines.push('')

  lines.push('### 📋 谐波频谱')
  lines.push('| 谐波次数 | 含有率 |')
  lines.push('|---------|--------|')
  lines.push(`| 3次 | ${result.harmonic_spectrum.h3_pct}% |`)
  lines.push(`| 5次 | ${result.harmonic_spectrum.h5_pct}% |`)
  lines.push(`| 7次 | ${result.harmonic_spectrum.h7_pct}% |`)
  lines.push(`| 11次 | ${result.harmonic_spectrum.h11_pct}% |`)
  lines.push(`| 13次 | ${result.harmonic_spectrum.h13_pct}% |`)
  lines.push(`| THD判定 | ${result.harmonic_spectrum.thd_compliance} |`)
  lines.push('')

  lines.push('### 📋 补偿动作')
  lines.push(`- ${result.compensation_action}`)
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 电容器组投入和退出运行须遵守《并联电容器装置设计规范》(GB 50227)')
  lines.push('- 电容器组放电时间不少于5分钟，接触前须用放电棒充分放电')
  lines.push('- 谐波治理方案须避免与系统阻抗发生并联谐振')
  lines.push('- 无功补偿装置异常时须立即退出运行并汇报调度')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Power Quality Monitor v0.1.0 • IEEE 519 / EN 50160*')
  return lines.join('\n')
}

// --- Tool 6: Demand Response 报告 ---
function formatDemandResponseReport(result: DemandResponseResult): string {
  const lines: string[] = []
  lines.push('## 🏭 需求响应调度与虚拟电厂报告')
  lines.push('')
  lines.push(`VPP: ${result.vpp_id} | 事件状态: ${result.event_status} | 电网缓解: ${result.grid_relief_pct}%`)
  lines.push(`实际削减: ${result.vpp_summary.actual_reduction_mw} MW | 执行率: ${result.vpp_summary.performance_ratio} | 收入: $${result.vpp_summary.revenue_usd}`)
  lines.push('')
  lines.push('### 🔗 VPP调度拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    VPP[虚拟电厂平台] -->|调度指令| BAT[储能]')
  lines.push('    VPP -->|调度指令| EV[充电桩]')
  lines.push('    VPP -->|调度指令| HVAC[空调负荷]')
  lines.push('    VPP -->|调度指令| IND[工业可中断]')
  lines.push('    VPP -->|调度指令| COLD[冷库]')
  lines.push('    BAT -->|响应量| AGG[聚合响应]')
  lines.push('    EV -->|响应量| AGG')
  lines.push('    HVAC -->|响应量| AGG')
  lines.push('    IND -->|响应量| AGG')
  lines.push('    COLD -->|响应量| AGG')
  lines.push('    AGG -->|上报| DISP[调度中心]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 资源调度')
  lines.push('| 资源类型 | 调度量(MW) | 持续(min) | 成本($/MWh) | 参与用户 |')
  lines.push('|---------|-----------|----------|------------|---------|')
  for (const d of result.dispatches) {
    lines.push(`| ${d.resource_type} | ${d.dispatched_mw} | ${d.duration_min} | ${d.cost_per_mwh} | ${d.customer_count} |`)
  }
  lines.push('')

  lines.push('### 📋 VPP汇总')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 可调度容量 | ${result.vpp_summary.total_dispatchable_mw} MW |`)
  lines.push(`| 承诺削减 | ${result.vpp_summary.committed_reduction_mw} MW |`)
  lines.push(`| 实际削减 | ${result.vpp_summary.actual_reduction_mw} MW |`)
  lines.push(`| 执行率 | ${result.vpp_summary.performance_ratio} |`)
  lines.push(`| 用户参与率 | ${result.vpp_summary.customer_participation_pct}% |`)
  lines.push(`| 碳减排 | ${result.carbon_offset_tonnes} 吨 |`)
  lines.push('')

  lines.push('### 📋 价格预测')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 出清价格 | $${result.price_forecast.clearing_price_per_mwh}/MWh |`)
  lines.push(`| 价格波动率 | ${result.price_forecast.price_volatility} |`)
  lines.push(`| 峰时电价时刻 | ${result.price_forecast.peak_price_hour}:00 |`)
  lines.push(`| 谷时电价时刻 | ${result.price_forecast.offpeak_price_hour}:00 |`)
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 需求响应资源调度不得影响用户供电可靠性和电能质量')
  lines.push('- 储能参与响应时须保留足够SOC备用，防止影响应急供电能力')
  lines.push('- 工业可中断负荷须与用户签订协议，明确中断时长和补偿标准')
  lines.push('- VPP平台与调度主站通信须满足电力监控系统安全防护规定')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Demand Response Coordinator v0.1.0 • DL/T 1759*')
  return lines.join('\n')
}

// --- Tool 7: Asset Management 报告 ---
function formatAssetReport(result: AssetResult): string {
  const lines: string[] = []
  lines.push('## 🏗️ 输变电设备健康管理报告')
  lines.push('')
  lines.push(`设备: ${result.asset_id} | 健康等级: ${result.health_index.health_grade} | 综合评分: ${result.health_index.overall_score}/100`)
  lines.push(`剩余寿命: ${result.degradation.remaining_useful_life_years} 年 | 12月故障概率: ${result.degradation.failure_probability_12mo} | 更换紧迫性: ${result.replacement_urgency}`)
  lines.push('')
  lines.push('### 📋 健康指数')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 综合评分 | ${result.health_index.overall_score} |`)
  lines.push(`| 年龄因子 | ${result.health_index.age_factor} |`)
  lines.push(`| 负载因子 | ${result.health_index.load_factor} |`)
  lines.push(`| 状态因子 | ${result.health_index.condition_factor} |`)
  lines.push(`| 健康等级 | ${result.health_index.health_grade} |`)
  lines.push('')

  lines.push('### 📋 劣化分析')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 绝缘寿命消耗 | ${result.degradation.insulation_life_consumed_pct}% |`)
  lines.push(`| 剩余使用寿命 | ${result.degradation.remaining_useful_life_years} 年 |`)
  lines.push(`| 12月故障概率 | ${result.degradation.failure_probability_12mo} |`)
  lines.push(`| 劣化速率 | ${result.degradation.degradation_rate} |`)
  lines.push('')

  lines.push('### 📋 检修建议')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 建议动作 | ${result.maintenance.action} |`)
  lines.push(`| 优先级 | ${result.maintenance.priority} |`)
  lines.push(`| 预估费用 | $${result.maintenance.estimated_cost_usd} |`)
  lines.push(`| 建议日期 | ${result.maintenance.recommended_date} |`)
  lines.push(`| 延期风险 | ${result.maintenance.risk_if_deferred} |`)
  lines.push('')

  lines.push('### 📋 故障模式')
  for (const f of result.failure_mode_risks) lines.push(`- ${f}`)
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 设备健康管理数据不能替代预防性试验，停电试验周期须遵守《电力设备预防性试验规程》(DL/T 596)')
  lines.push('- 健康等级为D/E的设备须加强巡视，必要时安排停电检修')
  lines.push('- 变压器油色谱分析异常时须缩短跟踪周期，注意乙炔增长趋势')
  lines.push('- 检修和更换作业须执行工作票制度，落实停电、验电、接地措施')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Grid Asset Management v0.1.0 • DL/T 596 / IEC 60599*')
  return lines.join('\n')
}

// --- Tool 8: Electricity Market 报告 ---
function formatMarketReport(result: MarketResult): string {
  const lines: string[] = []
  lines.push('## 💰 电力市场交易与现货价格预测报告')
  lines.push('')
  lines.push(`市场: ${result.market_id} | 交易信号: ${result.trading_signal.action.toUpperCase()} | 策略: ${result.trading_signal.strategy}`)
  lines.push(`预期收益: $${result.expected_revenue_usd} | 市场出清概率: ${result.market_clearing_probability} | 风险评分: ${result.trading_signal.risk_score}`)
  lines.push('')
  lines.push('### 🔗 价格预测曲线')
  lines.push('')
  lines.push('```mermaid')
  lines.push('xychart-beta')
  lines.push('    title "24小时现货价格预测 ($/MWh)"')
  lines.push('    x-axis [' + result.price_predictions.map(p => p.hour).join(', ') + ']')
  lines.push('    y-axis "价格 ($/MWh)" ' + Math.round(Math.min(...result.price_predictions.map(p => p.confidence_interval_low)) * 0.9) + ' --> ' + Math.round(Math.max(...result.price_predictions.map(p => p.confidence_interval_high)) * 1.1))
  lines.push('    line [' + result.price_predictions.map(p => p.predicted_price_per_mwh).join(', ') + ']')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 逐时价格预测')
  lines.push('| 小时 | 预测价格($/MWh) | 置信下限 | 置信上限 | 价格驱动 |')
  lines.push('|------|----------------|---------|---------|---------|')
  for (const p of result.price_predictions) {
    lines.push(`| ${p.hour} | ${p.predicted_price_per_mwh} | ${p.confidence_interval_low} | ${p.confidence_interval_high} | ${p.price_driver} |`)
  }
  lines.push('')

  lines.push('### 📋 交易信号')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 操作 | ${result.trading_signal.action} |`)
  lines.push(`| 交易量 | ${result.trading_signal.volume_mw} MW |`)
  lines.push(`| 目标价格 | $${result.trading_signal.target_price_per_mwh}/MWh |`)
  lines.push(`| 策略 | ${result.trading_signal.strategy} |`)
  lines.push(`| 风险评分 | ${result.trading_signal.risk_score} |`)
  lines.push('')

  lines.push('### 📋 风险指标')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| VaR 95% | $${result.risk_metrics.var_95_pct} |`)
  lines.push(`| CVaR 95% | $${result.risk_metrics.cvar_95_pct} |`)
  lines.push(`| 最大回撤 | ${result.risk_metrics.max_drawdown_pct}% |`)
  lines.push(`| 夏普比率 | ${result.risk_metrics.sharpe_ratio} |`)
  lines.push(`| 风险敞口 | ${result.risk_metrics.exposure_mwh} MWh |`)
  lines.push(`| 碳成本暴露 | ${result.carbon_exposure_tonnes} 吨 |`)
  lines.push('')

  lines.push('### 📋 合规信息')
  lines.push(`- ${result.regulatory_compliance}`)
  lines.push('')

  lines.push('### ⚠️ 电气安全声明')
  lines.push('- 电力市场交易决策须遵守《电力监管条例》和电力市场运营规则')
  lines.push('- 交易报价不得操纵市场力，禁止串通报价和恶意竞标')
  lines.push('- 市场交易结果须服从调度机构的统一调度指令，保障电网安全运行')
  lines.push('- 本预测结果仅供交易参考，不构成投资建议，市场风险自担')
  lines.push('')
  lines.push('---')
  lines.push('*Power Grid Agent • Electricity Market Trader v0.1.0 • 电力现货市场基本规则*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Load Forecasting Engine — 电力负荷预测与峰谷调节
  tools.register(defineTool({
    name: 'load_forecasting_engine',
    description: '电力负荷预测与峰谷调节 | 基于气象数据和历史负荷的短期负荷预测，提供峰谷分析与调度建议 | Power load forecasting with peak-valley regulation based on weather and historical data.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: region_id, forecast_hours, historical_load_mw[], weather_temp_c, weather_humidity_pct, is_holiday, industrial_pct, residential_pct, commercial_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: LoadForecastInput = JSON.parse(args.input_data)
      return formatLoadForecastReport(analyzeLoadForecast(input))
    }
  }))

  // Tool 2: Grid Stability Analyzer — 电网稳定分析与谐波评估
  tools.register(defineTool({
    name: 'grid_stability_analyzer',
    description: '电网稳定分析与谐波评估 | 电压稳定、暂态稳定、谐波THD评估与风险分级 | Grid stability analysis with voltage, transient, and harmonic THD assessment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: grid_segment_id, base_voltage_kv, current_voltage_kv, frequency_hz, active_power_mw, reactive_power_mvar, harmonic_orders[], harmonic_distortion_pct[], short_capacity_mva'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GridStabilityInput = JSON.parse(args.input_data)
      return formatGridStabilityReport(analyzeGridStability(input))
    }
  }))

  // Tool 3: Distributed Energy Manager — 分布式光伏/储能并网管理
  tools.register(defineTool({
    name: 'distributed_energy_manager',
    description: '分布式光伏/储能并网管理 | 光伏出力预测、储能充放电管理、并网同步检测 | Distributed PV/storage grid integration with forecasting and sync detection.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: node_id, pv_capacity_mw, pv_current_output_mw, battery_capacity_mwh, battery_soc_pct, battery_power_mw, grid_connection_mw, load_demand_mw, inverter_efficiency_pct, grid_voltage_kv, grid_frequency_hz'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: DistEnergyInput = JSON.parse(args.input_data)
      return formatDistEnergyReport(analyzeDistEnergy(input))
    }
  }))

  // Tool 4: Fault Location Isolation — 故障定位隔离与自愈重构
  tools.register(defineTool({
    name: 'fault_location_isolation',
    description: '故障定位隔离与自愈重构 | 馈线故障区段定位、开关隔离方案、自愈转供策略 | Fault location/isolation with self-healing reconfiguration for distribution feeders.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: feeder_id, fault_type (single_phase_ground|phase_to_phase|three_phase|open_circuit), fault_current_ka, fault_resistance_ohm, line_length_km, section_lengths_km[], upstream_protection_status, downstream_load_mw, smart_switch_count'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FaultInput = JSON.parse(args.input_data)
      return formatFaultReport(analyzeFaultLocation(input))
    }
  }))

  // Tool 5: Power Quality Monitor — 电能质量监测与无功补偿
  tools.register(defineTool({
    name: 'power_quality_monitor',
    description: '电能质量监测与无功补偿 | 电压偏差、三相不平衡、谐波THD、功率因数与补偿策略 | Power quality monitoring with voltage, unbalance, harmonics, and reactive compensation.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: monitoring_point_id, voltage_l1_v, voltage_l2_v, voltage_l3_v, current_l1_a, current_l2_a, current_l3_a, active_power_kw, reactive_power_kvar, apparent_power_kva, frequency_hz, thd_voltage_pct, thd_current_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PowerQualityInput = JSON.parse(args.input_data)
      return formatPowerQualityReport(analyzePowerQuality(input))
    }
  }))

  // Tool 6: Demand Response Coordinator — 需求响应调度与虚拟电厂
  tools.register(defineTool({
    name: 'demand_response_coordinator',
    description: '需求响应调度与虚拟电厂 | VPP资源调度、需求响应执行、现货价格预测 | Demand response dispatch with virtual power plant resource coordination.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vpp_id, total_capacity_mw, enrolled_customers, current_demand_mw, target_reduction_mw, event_type (price_based|incentive_based|emergency), electricity_price_per_mwh, time_of_use_period, available_resources[], weather_forecast_temp_c'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: DemandResponseInput = JSON.parse(args.input_data)
      return formatDemandResponseReport(analyzeDemandResponse(input))
    }
  }))

  // Tool 7: Grid Asset Management — 输变电设备健康管理
  tools.register(defineTool({
    name: 'grid_asset_management',
    description: '输变电设备健康管理 | 健康指数评估、绝缘劣化分析、检修策略推荐 | Transmission/substation asset health management with degradation analysis.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: asset_id, asset_type (transformer|switchgear|cable|tower|breaker), installation_year, last_maintenance_date, operating_years, load_factor_pct, ambient_temp_c, oil_temp_c?, dissolved_gas_h2_ppm?, dissolved_gas_ch4_ppm?, partial_discharge_pc?, infrared_temp_c?, vibration_mm_s?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: AssetInput = JSON.parse(args.input_data)
      return formatAssetReport(analyzeAssetManagement(input))
    }
  }))

  // Tool 8: Electricity Market Trader — 电力市场交易与现货价格预测
  tools.register(defineTool({
    name: 'electricity_market_trader',
    description: '电力市场交易与现货价格预测 | 24小时价格预测、交易信号生成、风险指标计算 | Electricity market trading with 24h price prediction and risk analytics.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: market_id, trading_date, participant_id, generation_capacity_mw, generation_cost_per_mwh, contract_position_mw, historical_prices[], demand_forecast_mw, renewable_share_pct, fuel_cost_per_mmbtu, carbon_cost_per_tonne, market_type (day_ahead|real_time|futures|ancillary)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MarketInput = JSON.parse(args.input_data)
      return formatMarketReport(analyzeMarketTrading(input))
    }
  }))

  console.log(`[dsh-tool-powergridagent] Loaded v${VERSION} — 智能电网AI Agent, 8 tools active`)
  console.log('  Tools: load_forecasting_engine, grid_stability_analyzer, distributed_energy_manager, fault_location_isolation, power_quality_monitor, demand_response_coordinator, grid_asset_management, electricity_market_trader')
}
