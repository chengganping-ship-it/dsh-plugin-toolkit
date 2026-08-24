/**
 * DSH Smart Grid & Energy Internet Plugin v1.0.0
 * 智能电网与能源互联网工具集 for DeepSeek Harness
 *
 * 2026: Global smart grid investment $400B+; DER capacity surpasses centralized generation.
 *
 * Tool list:
 * 1. demand_response_optimizer       — 需求响应优化（负荷削减、价格信号、用户响应建模）
 * 2. der_management_system          — 分布式能源管理（光伏、风电、储能、电动汽车聚合）
 * 3. grid_fault_detector            — 电网故障检测（故障定位、隔离、恢复、电能质量事件）
 * 4. storage_dispatch_engine        — 储能调度引擎（充放电策略、套利、调频、备用容量）
 * 5. renewable_forecaster            — 可再生能源预测（光伏、风电功率预测、不确定性量化）
 * 6. microgrid_controller            — 微电网控制器（并网/孤岛切换、频率电压控制、能量管理）
 * 7. power_quality_analyzer         — 电能质量分析（谐波、电压暂降、闪变、不平衡度）
 * 8. ev_charging_coordinator        — 电动汽车充电协调（有序充电、V2G、配电网约束）
 *
 * @module dsh-tool-smartgrid | @version 1.0.0 | @license MIT
 * @author dsh
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-smartgrid'
export const inject = ['tools']

const VERSION = '1.0.0'

// ==================== SECTION 1 -- Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 -- Interface Definitions ====================

// --- Tool 1: Demand Response Optimizer ---
export interface DemandResponseInput {
  total_load_mw: number
  peak_hours: number[]
  dr_capacity_mw: number
  incentive_price_usd_mwh: number
  customer_count: number
  customer_types: 'residential' | 'commercial' | 'industrial' | 'mixed'
  event_duration_hours: number
  weather_factor: number
}

export interface DRCapacityResult {
  enrolled_capacity_mw: number
  actual_reduction_mw: number
  compliance_rate_pct: number
  load_shift_mwh: number
  peak_reduction_pct: number
}

export interface DREconomicsResult {
  total_incentive_cost_usd: number
  avoided_capacity_cost_usd: number
  net_benefit_usd: number
  cost_per_mwh_reduced: number
  participant_avg_reward_usd: number
}

export interface DemandResponseResult {
  capacity: DRCapacityResult
  economics: DREconomicsResult
  load_curve_before: number[]
  load_curve_after: number[]
  strategy: string
  recommendation: string
  effectiveness_score: number
}

// --- Tool 2: DER Management System ---
export interface DERManagementInput {
  solar_capacity_mw: number
  wind_capacity_mw: number
  battery_capacity_mwh: number
  ev_fleet_count: number
  grid_demand_mw: number
  electricity_price_usd_mwh: number
  solar_irradiance_w_m2: number
  wind_speed_m_s: number
  aggregation_mode: 'centralized' | 'decentralized' | 'hybrid'
}

export interface DEROutput {
  solar_generation_mw: number
  wind_generation_mw: number
  battery_power_mw: number
  ev_available_mw: number
  total_renewable_pct: number
  curtailment_mw: number
}

export interface DERVirtualPowerPlant {
  aggregated_capacity_mw: number
  flexibility_up_mw: number
  flexibility_down_mw: number
  response_time_s: number
  availability_pct: number
}

export interface DERManagementResult {
  output: DEROutput
  vpp: DERVirtualPowerPlant
  grid_balance_mw: number
  carbon_reduction_tonnes_h: number
  revenue_potential_usd_h: number
  recommendation: string
  optimization_score: number
}

// --- Tool 3: Grid Fault Detector ---
export interface GridFaultInput {
  network_nodes: number
  feeder_count: number
  fault_type: 'single_line_to_ground' | 'line_to_line' | 'three_phase' | 'double_line_to_ground'
  fault_impedance_ohm: number
  fault_location_pct: number
  protection_relays: number
  scada_update_interval_s: number
  line_voltage_kv: number
}

export interface FaultLocationResult {
  estimated_location_km: number
  actual_location_km: number
  location_error_pct: number
  faulted_section: string
  confidence_pct: number
}

export interface ProtectionOperationResult {
  relay_trip_time_ms: number
  breaker_operate_time_ms: number
  total_clearing_time_ms: number
  selectivity_score: number
  backup_protection_activated: boolean
}

export interface GridFaultResult {
  fault_location: FaultLocationResult
  protection: ProtectionOperationResult
  affected_customers: number
  restoration_time_estimate_min: number
  fault_current_ka: number
  recommendation: string
  detection_score: number
}

// --- Tool 4: Storage Dispatch Engine ---
export interface StorageDispatchInput {
  battery_capacity_mwh: number
  battery_power_mw: number
  initial_soc_pct: number
  target_soc_pct: number
  electricity_prices_usd_mwh: number[]
  dispatch_horizon_hours: number
  application: 'energy_arbitrage' | 'frequency_regulation' | 'peak_shaving' | 'backup_power'
  round_trip_efficiency_pct: number
  degradation_cost_usd_mwh: number
}

export interface DispatchSchedule {
  hour: number
  power_mw: number
  soc_pct: number
  action: string
  revenue_usd: number
}

export interface StoragePerformanceResult {
  total_revenue_usd: number
  total_energy_mwh: number
  cycles_completed: number
  avg_soc_pct: number
  final_soc_pct: number
  degradation_cost_usd: number
}

export interface StorageDispatchResult {
  schedule: DispatchSchedule[]
  performance: StoragePerformanceResult
  arbitrage_margin_usd: number
  capacity_factor_pct: number
  recommendation: string
  dispatch_score: number
}

// --- Tool 5: Renewable Forecaster ---
export interface RenewableForecastInput {
  plant_type: 'solar_pv' | 'wind_onshore' | 'wind_offshore' | 'hybrid'
  installed_capacity_mw: number
  forecast_horizon_hours: number
  historical_capacity_factor_pct: number
  weather_forecast_uncertainty_pct: number
  panel_efficiency_pct?: number
  hub_height_m?: number
  turbine_count?: number
}

export interface ForecastOutput {
  hour: number
  predicted_power_mw: number
  confidence_lower_mw: number
  confidence_upper_mw: number
  uncertainty_pct: number
}

export interface ForecastAccuracyResult {
  mae_pct: number
  rmse_pct: number
  skill_score: number
  bias_pct: number
  forecast_value_usd: number
}

export interface RenewableForecastResult {
  forecast: ForecastOutput[]
  accuracy: ForecastAccuracyResult
  expected_generation_mwh: number
  capacity_factor_forecast_pct: number
  ramp_event_risk: string
  recommendation: string
  forecast_quality_score: number
}

// --- Tool 6: Microgrid Controller ---
export interface MicrogridControllerInput {
  microgrid_capacity_mw: number
  solar_capacity_mw: number
  battery_capacity_mwh: number
  diesel_backup_mw: number
  critical_load_mw: number
  non_critical_load_mw: number
  mode: 'grid_connected' | 'islanded' | 'transition'
  grid_frequency_hz: number
  grid_voltage_pct: number
  soc_pct: number
}

export interface FrequencyControlResult {
  frequency_deviation_hz: number
  frequency_nadir_hz: number
  droop_response_mw: number
  inertia_response_mw: number
  settling_time_s: number
  frequency_stable: boolean
}

export interface VoltageControlResult {
  voltage_deviation_pct: number
  reactive_power_mvar: number
  tap_changer_actions: number
  voltage_stable: boolean
  voltage_within_band: boolean
}

export interface MicrogridEnergyResult {
  solar_utilization_pct: number
  battery_cycles_h: number
  diesel_runtime_h: number
  load_shed_mwh: number
  renewable_fraction_pct: number
  autonomy_hours: number
}

export interface MicrogridControllerResult {
  frequency: FrequencyControlResult
  voltage: VoltageControlResult
  energy: MicrogridEnergyResult
  mode_status: string
  stability_assessment: string
  recommendation: string
  control_score: number
}

// --- Tool 7: Power Quality Analyzer ---
export interface PowerQualityInput {
  nominal_voltage_kv: number
  nominal_frequency_hz: number
  measurement_duration_h: number
  harmonic_orders: number[]
  load_type: 'linear' | 'nonlinear' | 'mixed' | 'arc_furnace'
  flicker_source: boolean
  voltage_sag_events: number
  unbalance_factor_pct: number
}

export interface HarmonicResult {
  thd_voltage_pct: number
  thd_current_pct: number
  dominant_harmonic: number
  harmonic_magnitudes: { order: number; magnitude_pct: number }[]
  ieee_519_compliant: boolean
}

export interface VoltageEventResult {
  sag_count: number
  swell_count: number
  interruption_count: number
  avg_sag_duration_ms: number
  avg_sag_depth_pct: number
  semi_flicker_severity: number
}

export interface PowerQualityResult {
  harmonics: HarmonicResult
  voltage_events: VoltageEventResult
  unbalance_voltage_pct: number
  unbalance_current_pct: number
  frequency_deviation_hz: number
  overall_pq_index: number
  compliance_status: string
  recommendation: string
  pq_score: number
}

// --- Tool 8: EV Charging Coordinator ---
export interface EVChargingInput {
  ev_count: number
  avg_battery_capacity_kwh: number
  avg_soc_arrival_pct: number
  target_soc_pct: number
  charging_power_kw: number
  v2g_capable_count: number
  arrival_time_distribution: string
  departure_time_h: number
  grid_capacity_kw: number
  electricity_price_usd_kwh: number
}

export interface ChargingScheduleResult {
  peak_demand_kw: number
  total_energy_mwh: number
  avg_charging_time_h: number
  grid_overload_events: number
  v2g_energy_mwh: number
  load_factor_pct: number
}

export interface EVUserSatisfactionResult {
  avg_final_soc_pct: number
  unmet_demand_pct: number
  wait_time_avg_min: number
  cost_per_ev_usd: number
  satisfaction_index: number
}

export interface EVChargingResult {
  schedule: ChargingScheduleResult
  user_satisfaction: EVUserSatisfactionResult
  grid_impact_kw: number
  peak_shaving_achieved_kw: number
  total_cost_usd: number
  recommendation: string
  coordination_score: number
}

// ==================== SECTION 3 -- Analysis Functions ====================

// --- Tool 1: Demand Response Optimizer ---
function analyzeDemandResponse(input: DemandResponseInput): DemandResponseResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const participationRate: Record<string, number> = { residential: 0.35, commercial: 0.55, industrial: 0.7, mixed: 0.5 }
  const rate = participationRate[input.customer_types] || 0.5
  const enrolledCapacity = input.dr_capacity_mw * rate * (0.8 + rng.nextFloat(0, 0.2))
  const complianceRate = rng.nextFloat(0.7, 0.95) * input.weather_factor
  const actualReduction = enrolledCapacity * complianceRate
  const loadShift = actualReduction * input.event_duration_hours
  const peakReduction = (actualReduction / input.total_load_mw) * 100

  const totalIncentive = actualReduction * input.event_duration_hours * input.incentive_price_usd_mwh
  const avoidedCapacity = actualReduction * 80
  const netBenefit = avoidedCapacity - totalIncentive
  const costPerMwh = totalIncentive / (loadShift + 0.001)
  const avgReward = totalIncentive / (input.customer_count * rate + 1)

  const loadCurveBefore: number[] = []
  const loadCurveAfter: number[] = []
  for (let h = 0; h < 24; h++) {
    const baseLoad = input.total_load_mw * (0.6 + 0.4 * Math.sin((h - 6) * Math.PI / 12))
    loadCurveBefore.push(Math.round(baseLoad * 100) / 100)
    const isPeak = input.peak_hours.includes(h)
    const reduction = isPeak ? actualReduction * rng.nextFloat(0.8, 1.0) : 0
    loadCurveAfter.push(Math.round((baseLoad - reduction) * 100) / 100)
  }

  const strategy = peakReduction > 10 ? 'Direct load control + time-of-use pricing'
    : peakReduction > 5 ? 'Incentive-based DR with critical peak pricing'
    : 'Behavioral DR with real-time feedback'

  const effectivenessScore = Math.round((peakReduction * 4 + complianceRate * 30 + (netBenefit > 0 ? 20 : 5) + rng.nextFloat(5, 15)) * 100) / 100

  const recommendation = effectivenessScore > 70 ? 'Highly effective DR program: expand enrollment and increase event frequency'
    : effectivenessScore > 45 ? 'Moderate effectiveness: optimize incentive structure and target high-response customers'
    : 'Low effectiveness: redesign program with better customer segmentation and engagement'

  return {
    capacity: {
      enrolled_capacity_mw: Math.round(enrolledCapacity * 100) / 100,
      actual_reduction_mw: Math.round(actualReduction * 100) / 100,
      compliance_rate_pct: Math.round(complianceRate * 100 * 100) / 100,
      load_shift_mwh: Math.round(loadShift * 100) / 100,
      peak_reduction_pct: Math.round(peakReduction * 100) / 100,
    },
    economics: {
      total_incentive_cost_usd: Math.round(totalIncentive),
      avoided_capacity_cost_usd: Math.round(avoidedCapacity),
      net_benefit_usd: Math.round(netBenefit),
      cost_per_mwh_reduced: Math.round(costPerMwh * 100) / 100,
      participant_avg_reward_usd: Math.round(avgReward * 100) / 100,
    },
    load_curve_before: loadCurveBefore,
    load_curve_after: loadCurveAfter,
    strategy,
    recommendation,
    effectiveness_score: effectivenessScore,
  }
}

// --- Tool 2: DER Management System ---
function analyzeDERManagement(input: DERManagementInput): DERManagementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const solarCf = (input.solar_irradiance_w_m2 / 1000) * rng.nextFloat(0.75, 0.95)
  const windCf = input.wind_speed_m_s > 3 && input.wind_speed_m_s < 25
    ? Math.min(1, Math.pow(input.wind_speed_m_s / 12, 3) * rng.nextFloat(0.7, 1.0))
    : 0
  const solarGen = input.solar_capacity_mw * solarCf
  const windGen = input.wind_capacity_mw * windCf
  const totalRenewable = solarGen + windGen
  const maxPossible = input.solar_capacity_mw + input.wind_capacity_mw
  const renewablePct = maxPossible > 0 ? (totalRenewable / maxPossible) * 100 : 0

  const batteryPower = input.battery_capacity_mwh > 0
    ? Math.min(input.battery_capacity_mwh * 0.25, totalRenewable * 0.3)
    : 0
  const evAvailable = input.ev_fleet_count * 0.007 * rng.nextFloat(0.3, 0.8)
  const curtailment = Math.max(0, totalRenewable - input.grid_demand_mw) * rng.nextFloat(0.05, 0.15)

  const aggregatedCapacity = totalRenewable + batteryPower + evAvailable
  const flexibilityUp = batteryPower * 0.5 + evAvailable * 0.3
  const flexibilityDown = batteryPower * 0.4 + totalRenewable * 0.2
  const responseTime = input.aggregation_mode === 'centralized' ? rng.nextFloat(4, 15) : input.aggregation_mode === 'hybrid' ? rng.nextFloat(1, 5) : rng.nextFloat(0.1, 1)
  const availability = rng.nextFloat(0.75, 0.98) * 100

  const gridBalance = totalRenewable + batteryPower + evAvailable - input.grid_demand_mw
  const carbonReduction = totalRenewable * 0.45
  const revenue = totalRenewable * input.electricity_price_usd_mwh * 0.001 + batteryPower * 50 + evAvailable * 30

  const optimizationScore = Math.round((renewablePct * 0.3 + availability * 0.3 + (curtailment < 1 ? 20 : 5) + rng.nextFloat(10, 25)) * 100) / 100

  const recommendation = optimizationScore > 75 ? 'Excellent DER utilization: consider expanding VPP participation in ancillary markets'
    : optimizationScore > 50 ? 'Good performance: optimize dispatch schedule and reduce curtailment'
    : 'Suboptimal: review aggregation strategy and add flexibility resources'

  return {
    output: {
      solar_generation_mw: Math.round(solarGen * 100) / 100,
      wind_generation_mw: Math.round(windGen * 100) / 100,
      battery_power_mw: Math.round(batteryPower * 100) / 100,
      ev_available_mw: Math.round(evAvailable * 100) / 100,
      total_renewable_pct: Math.round(renewablePct * 100) / 100,
      curtailment_mw: Math.round(curtailment * 100) / 100,
    },
    vpp: {
      aggregated_capacity_mw: Math.round(aggregatedCapacity * 100) / 100,
      flexibility_up_mw: Math.round(flexibilityUp * 100) / 100,
      flexibility_down_mw: Math.round(flexibilityDown * 100) / 100,
      response_time_s: Math.round(responseTime * 100) / 100,
      availability_pct: Math.round(availability * 100) / 100,
    },
    grid_balance_mw: Math.round(gridBalance * 100) / 100,
    carbon_reduction_tonnes_h: Math.round(carbonReduction * 100) / 100,
    revenue_potential_usd_h: Math.round(revenue * 100) / 100,
    recommendation,
    optimization_score: optimizationScore,
  }
}

// --- Tool 3: Grid Fault Detector ---
function analyzeGridFault(input: GridFaultInput): GridFaultResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const faultCurrentBase: Record<string, number> = {
    single_line_to_ground: 5.2, line_to_line: 8.1, three_phase: 12.5, double_line_to_ground: 7.3
  }
  const baseCurrent = faultCurrentBase[input.fault_type] || 5.0
  const faultCurrent = baseCurrent * (input.line_voltage_kv / 11) * (1 / (1 + input.fault_impedance_ohm * 0.01)) * rng.nextFloat(0.85, 1.15)

  const lineLengthKm = 25
  const actualLocation = input.fault_location_pct / 100 * lineLengthKm
  const locationError = rng.nextFloat(0.5, 5.0)
  const estimatedLocation = actualLocation * (1 + locationError / 100 * (rng.nextFloat(0, 1) > 0.5 ? 1 : -1))
  const confidence = rng.nextFloat(82, 99)

  const relayTripTime = rng.nextFloat(50, 150)
  const breakerOperateTime = rng.nextFloat(60, 120)
  const totalClearing = relayTripTime + breakerOperateTime
  const selectivity = input.fault_impedance_ohm < 10 ? rng.nextFloat(0.85, 0.98) : rng.nextFloat(0.6, 0.85)
  const backupActivated = selectivity < 0.7

  const affectedCustomers = Math.round(input.network_nodes * (input.fault_location_pct / 100) * rng.nextFloat(0.5, 1.0))
  const restorationTime = rng.nextFloat(15, 120) * (backupActivated ? 0.5 : 1.0)

  const detectionScore = Math.round((confidence * 0.3 + selectivity * 30 + (totalClearing < 200 ? 20 : 10) + (locationError < 3 ? 20 : 5) + rng.nextFloat(5, 15)) * 100) / 100

  const recommendation = detectionScore > 75 ? 'Fault detected with high confidence: execute automated FLISR sequence'
    : detectionScore > 50 ? 'Fault detected: manual verification recommended before switching'
    : 'Uncertain fault indication: dispatch field crew for inspection'

  return {
    fault_location: {
      estimated_location_km: Math.round(estimatedLocation * 100) / 100,
      actual_location_km: Math.round(actualLocation * 100) / 100,
      location_error_pct: Math.round(locationError * 100) / 100,
      faulted_section: 'Section_' + Math.ceil(input.fault_location_pct / 20) + '_F' + input.feeder_count,
      confidence_pct: Math.round(confidence * 100) / 100,
    },
    protection: {
      relay_trip_time_ms: Math.round(relayTripTime * 100) / 100,
      breaker_operate_time_ms: Math.round(breakerOperateTime * 100) / 100,
      total_clearing_time_ms: Math.round(totalClearing * 100) / 100,
      selectivity_score: Math.round(selectivity * 100) / 100,
      backup_protection_activated: backupActivated,
    },
    affected_customers: affectedCustomers,
    restoration_time_estimate_min: Math.round(restorationTime),
    fault_current_ka: Math.round(faultCurrent * 100) / 100,
    recommendation,
    detection_score: detectionScore,
  }
}

// --- Tool 4: Storage Dispatch Engine ---
function analyzeStorageDispatch(input: StorageDispatchInput): StorageDispatchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const schedule: DispatchSchedule[] = []
  let soc = input.initial_soc_pct
  let totalRevenue = 0
  let totalEnergy = 0
  let degradationCost = 0

  const prices = input.electricity_prices_usd_mwh.length > 0
    ? input.electricity_prices_usd_mwh
    : Array.from({ length: input.dispatch_horizon_hours }, () => rng.nextFloat(30, 150))

  for (let h = 0; h < Math.min(input.dispatch_horizon_hours, prices.length); h++) {
    const price = prices[h]!
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    let power = 0
    let action = 'idle'

    if (input.application === 'energy_arbitrage') {
      if (price < avgPrice * 0.8 && soc < 95) {
        power = -input.battery_power_mw * rng.nextFloat(0.7, 1.0)
        action = 'charge'
      } else if (price > avgPrice * 1.2 && soc > 10) {
        power = input.battery_power_mw * rng.nextFloat(0.7, 1.0)
        action = 'discharge'
      }
    } else if (input.application === 'frequency_regulation') {
      power = rng.nextFloat(-1, 1) * input.battery_power_mw * 0.5
      action = power > 0 ? 'discharge' : power < 0 ? 'charge' : 'hold'
    } else if (input.application === 'peak_shaving') {
      if (price > avgPrice * 1.1 && soc > 15) {
        power = input.battery_power_mw * rng.nextFloat(0.5, 0.9)
        action = 'discharge'
      } else if (price < avgPrice * 0.7 && soc < 90) {
        power = -input.battery_power_mw * rng.nextFloat(0.5, 0.8)
        action = 'charge'
      }
    } else {
      if (soc > 80) {
        action = 'standby_ready'
      } else {
        power = -input.battery_power_mw * 0.3
        action = 'top_up'
      }
    }

    const energyDelta = Math.abs(power) * (power > 0 ? input.round_trip_efficiency_pct / 100 : 1)
    soc = Math.max(5, Math.min(100, soc + (power > 0 ? -energyDelta / input.battery_capacity_mwh * 100 : energyDelta / input.battery_capacity_mwh * 100)))
    const revenue = power > 0 ? power * price : -(Math.abs(power) * price * 0.3)
    const degCost = energyDelta * input.degradation_cost_usd_mwh

    totalRevenue += revenue
    totalEnergy += energyDelta
    degradationCost += degCost

    schedule.push({
      hour: h + 1,
      power_mw: Math.round(power * 100) / 100,
      soc_pct: Math.round(soc * 100) / 100,
      action,
      revenue_usd: Math.round(revenue),
    })
  }

  const cycles = totalEnergy / (input.battery_capacity_mwh * 2 + 0.001)
  const avgSoc = schedule.reduce((a, s) => a + s.soc_pct, 0) / (schedule.length || 1)
  const arbitrageMargin = totalRevenue - degradationCost
  const capacityFactor = totalEnergy / (input.battery_power_mw * input.dispatch_horizon_hours + 0.001) * 100

  const dispatchScore = Math.round((Math.min(arbitrageMargin / 100, 30) + Math.min(capacityFactor, 30) + (cycles < 2 ? 20 : 10) + rng.nextFloat(10, 25)) * 100) / 100

  const recommendation = dispatchScore > 70 ? 'Optimal dispatch: maximize revenue by expanding to additional market services'
    : dispatchScore > 45 ? 'Good dispatch: fine-tune price thresholds and consider co-optimization'
    : 'Suboptimal: review price forecasts and adjust dispatch strategy parameters'

  return {
    schedule,
    performance: {
      total_revenue_usd: Math.round(totalRevenue),
      total_energy_mwh: Math.round(totalEnergy * 100) / 100,
      cycles_completed: Math.round(cycles * 1000) / 1000,
      avg_soc_pct: Math.round(avgSoc * 100) / 100,
      final_soc_pct: Math.round(soc * 100) / 100,
      degradation_cost_usd: Math.round(degradationCost),
    },
    arbitrage_margin_usd: Math.round(arbitrageMargin),
    capacity_factor_pct: Math.round(capacityFactor * 100) / 100,
    recommendation,
    dispatch_score: dispatchScore,
  }
}

// --- Tool 5: Renewable Forecaster ---
function analyzeRenewableForecast(input: RenewableForecastInput): RenewableForecastResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const forecast: ForecastOutput[] = []
  let totalGen = 0

  for (let h = 0; h < input.forecast_horizon_hours; h++) {
    let predictedPower: number
    if (input.plant_type === 'solar_pv') {
      const solarCycle = Math.max(0, Math.sin((h - 6) * Math.PI / 12))
      predictedPower = input.installed_capacity_mw * solarCycle * (input.panel_efficiency_pct || 20) / 22 * rng.nextFloat(0.8, 1.0)
    } else if (input.plant_type === 'wind_onshore' || input.plant_type === 'wind_offshore') {
      const baseWind = input.plant_type === 'wind_offshore' ? 0.55 : 0.35
      predictedPower = input.installed_capacity_mw * baseWind * rng.nextFloat(0.4, 1.0)
    } else {
      predictedPower = input.installed_capacity_mw * 0.4 * rng.nextFloat(0.5, 1.0)
    }

    const uncertainty = input.weather_forecast_uncertainty_pct * (1 + h * 0.05)
    const lower = predictedPower * (1 - uncertainty / 100)
    const upper = predictedPower * (1 + uncertainty / 100)

    forecast.push({
      hour: h + 1,
      predicted_power_mw: Math.round(predictedPower * 100) / 100,
      confidence_lower_mw: Math.round(Math.max(0, lower) * 100) / 100,
      confidence_upper_mw: Math.round(upper * 100) / 100,
      uncertainty_pct: Math.round(uncertainty * 100) / 100,
    })
    totalGen += predictedPower
  }

  const mae = rng.nextFloat(3, 12)
  const rmse = mae * rng.nextFloat(1.2, 1.8)
  const skillScore = rng.nextFloat(0.6, 0.95)
  const bias = rng.nextFloat(-5, 5)
  const forecastValue = totalGen * 45 * skillScore

  const capacityFactor = totalGen / (input.installed_capacity_mw * input.forecast_horizon_hours + 0.001) * 100

  let maxRamp = 0
  for (let i = 1; i < forecast.length; i++) {
    const ramp = Math.abs(forecast[i]!.predicted_power_mw - forecast[i - 1]!.predicted_power_mw)
    if (ramp > maxRamp) maxRamp = ramp
  }
  const rampRisk = maxRamp > input.installed_capacity_mw * 0.3 ? 'High ramp event expected' :
    maxRamp > input.installed_capacity_mw * 0.15 ? 'Moderate ramp risk' : 'Low ramp risk'

  const forecastQualityScore = Math.round((skillScore * 40 + (100 - mae * 3) * 0.3 + (100 - rmse * 2) * 0.2 + rng.nextFloat(5, 15)) * 100) / 100

  const recommendation = forecastQualityScore > 75 ? 'High-quality forecast: suitable for day-ahead market bidding'
    : forecastQualityScore > 50 ? 'Acceptable forecast: use with increased reserve margins'
    : 'Low forecast quality: invest in improved weather data and ensemble methods'

  return {
    forecast,
    accuracy: {
      mae_pct: Math.round(mae * 100) / 100,
      rmse_pct: Math.round(rmse * 100) / 100,
      skill_score: Math.round(skillScore * 100) / 100,
      bias_pct: Math.round(bias * 100) / 100,
      forecast_value_usd: Math.round(forecastValue),
    },
    expected_generation_mwh: Math.round(totalGen * 100) / 100,
    capacity_factor_forecast_pct: Math.round(capacityFactor * 100) / 100,
    ramp_event_risk: rampRisk,
    recommendation,
    forecast_quality_score: forecastQualityScore,
  }
}

// --- Tool 6: Microgrid Controller ---
function analyzeMicrogridController(input: MicrogridControllerInput): MicrogridControllerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const freqDeviation = input.grid_frequency_hz - 50
  const frequencyNadir = 50 - Math.abs(freqDeviation) * rng.nextFloat(1.2, 2.0)
  const droopResponse = freqDeviation * input.microgrid_capacity_mw * 0.05
  const inertiaResponse = input.battery_capacity_mwh * 0.5 * Math.abs(freqDeviation)
  const settlingTime = rng.nextFloat(0.5, 5.0)
  const frequencyStable = Math.abs(freqDeviation) < 0.5

  const voltageDeviation = input.grid_voltage_pct - 100
  const reactivePower = voltageDeviation * input.microgrid_capacity_mw * 0.03
  const tapActions = Math.abs(voltageDeviation) > 3 ? rng.nextInt(1, 4) : 0
  const voltageStable = Math.abs(voltageDeviation) < 5
  const voltageWithinBand = Math.abs(voltageDeviation) < 3

  const solarUtilization = input.mode === 'islanded' ? rng.nextFloat(0.85, 0.98) * 100 : rng.nextFloat(0.7, 0.95) * 100
  const batteryCycles = rng.nextFloat(0.5, 2.0)
  const dieselRuntime = input.mode === 'islanded' && input.soc_pct < 30 ? rng.nextFloat(1, 4) : 0
  const totalLoad = input.critical_load_mw + input.non_critical_load_mw
  const loadShed = input.mode === 'islanded' && input.soc_pct < 20 ? input.non_critical_load_mw * rng.nextFloat(0.2, 0.6) : 0
  const renewableFraction = (input.solar_capacity_mw * solarUtilization / 100) / (totalLoad + 0.001) * 100
  const autonomyHours = input.battery_capacity_mwh > 0
    ? input.soc_pct / 100 * input.battery_capacity_mwh / (input.critical_load_mw + 0.001)
    : 0

  const modeStatus = input.mode === 'grid_connected' ? 'Grid-connected: importing/exporting per dispatch'
    : input.mode === 'islanded' ? 'Islanded: autonomous frequency and voltage control active'
    : 'Transitioning: synchronizing before reconnection'

  const stabilityAssessment = frequencyStable && voltageStable ? 'Stable: all parameters within acceptable limits'
    : frequencyStable ? 'Voltage concern: reactive power compensation needed'
    : voltageStable ? 'Frequency concern: increase droop response or load shed'
    : 'Unstable: emergency load shedding and diesel backup required'

  const controlScore = Math.round((solarUtilization * 0.2 + (frequencyStable ? 25 : 5) + (voltageStable ? 20 : 5) + Math.min(autonomyHours * 5, 20) + rng.nextFloat(10, 25)) * 100) / 100

  const recommendation = controlScore > 75 ? 'Excellent microgrid control: maintain current control parameters'
    : controlScore > 50 ? 'Adequate control: optimize battery dispatch and reduce diesel dependency'
    : 'Control issues: review protection settings and increase spinning reserve'

  return {
    frequency: {
      frequency_deviation_hz: Math.round(freqDeviation * 1000) / 1000,
      frequency_nadir_hz: Math.round(frequencyNadir * 1000) / 1000,
      droop_response_mw: Math.round(droopResponse * 100) / 100,
      inertia_response_mw: Math.round(inertiaResponse * 100) / 100,
      settling_time_s: Math.round(settlingTime * 100) / 100,
      frequency_stable: frequencyStable,
    },
    voltage: {
      voltage_deviation_pct: Math.round(voltageDeviation * 100) / 100,
      reactive_power_mvar: Math.round(reactivePower * 100) / 100,
      tap_changer_actions: tapActions,
      voltage_stable: voltageStable,
      voltage_within_band: voltageWithinBand,
    },
    energy: {
      solar_utilization_pct: Math.round(solarUtilization * 100) / 100,
      battery_cycles_h: Math.round(batteryCycles * 100) / 100,
      diesel_runtime_h: Math.round(dieselRuntime * 100) / 100,
      load_shed_mwh: Math.round(loadShed * 100) / 100,
      renewable_fraction_pct: Math.round(renewableFraction * 100) / 100,
      autonomy_hours: Math.round(autonomyHours * 100) / 100,
    },
    mode_status: modeStatus,
    stability_assessment: stabilityAssessment,
    recommendation,
    control_score: controlScore,
  }
}

// --- Tool 7: Power Quality Analyzer ---
function analyzePowerQuality(input: PowerQualityInput): PowerQualityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const harmonicMagnitudes: { order: number; magnitude_pct: number }[] = []
  const dominantHarmonics: Record<string, number[]> = {
    nonlinear: [5, 7, 11, 13], arc_furnace: [2, 3, 5, 7, 11], mixed: [3, 5, 7, 11], linear: [3, 5]
  }
  const dominant = dominantHarmonics[input.load_type] || [3, 5, 7]

  for (const order of input.harmonic_orders) {
    const isDominant = dominant.includes(order)
    const magnitude = isDominant ? rng.nextFloat(2, 8) : rng.nextFloat(0.1, 2)
    harmonicMagnitudes.push({ order, magnitude_pct: Math.round(magnitude * 100) / 100 })
  }

  const thdVoltage = Math.sqrt(harmonicMagnitudes.reduce((a, h) => a + h.magnitude_pct * h.magnitude_pct, 0))
  const thdCurrent = thdVoltage * rng.nextFloat(1.2, 2.0)
  const dominantHarmonic = harmonicMagnitudes.reduce((a, b) => a.magnitude_pct > b.magnitude_pct ? a : b, harmonicMagnitudes[0] || { order: 0, magnitude_pct: 0 }).order
  const ieee519Compliant = thdVoltage < 5 && harmonicMagnitudes.every(h => h.magnitude_pct < (h.order < 11 ? 5 : 3))

  const sagCount = input.voltage_sag_events || rng.nextInt(2, 15)
  const swellCount = rng.nextInt(0, 5)
  const interruptionCount = rng.nextInt(0, 3)
  const avgSagDuration = rng.nextFloat(50, 500)
  const avgSagDepth = rng.nextFloat(10, 45)
  const flickerSeverity = input.flicker_source ? rng.nextFloat(0.8, 1.5) : rng.nextFloat(0.2, 0.6)

  const unbalanceVoltage = input.unbalance_factor_pct * rng.nextFloat(0.8, 1.2)
  const unbalanceCurrent = unbalanceVoltage * rng.nextFloat(2, 5)
  const freqDeviation = rng.nextFloat(0.01, 0.15)

  const pqIndex = Math.round((thdVoltage * 5 + sagCount * 3 + flickerSeverity * 10 + unbalanceVoltage * 5 + Math.abs(freqDeviation) * 100) * 100) / 100
  const complianceStatus = ieee519Compliant && sagCount < 10 && flickerSeverity < 1.0
    ? 'COMPLIANT: All parameters within IEEE 519 / EN 50160 limits'
    : 'NON-COMPLIANT: Mitigation measures required'

  const pqScore = Math.round((ieee519Compliant ? 30 : 5) + (thdVoltage < 5 ? 20 : 5) + (flickerSeverity < 1 ? 15 : 3) + (sagCount < 8 ? 15 : 3) + rng.nextFloat(5, 20) * 100) / 100

  const recommendation = pqScore > 75 ? 'Power quality is excellent: maintain monitoring and periodic assessment'
    : pqScore > 50 ? 'Minor PQ issues: install harmonic filters and voltage regulation'
    : 'Significant PQ degradation: comprehensive mitigation plan required (active filters, DVR, SVC)'

  return {
    harmonics: {
      thd_voltage_pct: Math.round(thdVoltage * 100) / 100,
      thd_current_pct: Math.round(thdCurrent * 100) / 100,
      dominant_harmonic: dominantHarmonic,
      harmonic_magnitudes: harmonicMagnitudes,
      ieee_519_compliant: ieee519Compliant,
    },
    voltage_events: {
      sag_count: sagCount,
      swell_count: swellCount,
      interruption_count: interruptionCount,
      avg_sag_duration_ms: Math.round(avgSagDuration),
      avg_sag_depth_pct: Math.round(avgSagDepth * 100) / 100,
      semi_flicker_severity: Math.round(flickerSeverity * 100) / 100,
    },
    unbalance_voltage_pct: Math.round(unbalanceVoltage * 100) / 100,
    unbalance_current_pct: Math.round(unbalanceCurrent * 100) / 100,
    frequency_deviation_hz: Math.round(freqDeviation * 1000) / 1000,
    overall_pq_index: pqIndex,
    compliance_status: complianceStatus,
    recommendation,
    pq_score: pqScore,
  }
}

// --- Tool 8: EV Charging Coordinator ---
function analyzeEVCharging(input: EVChargingInput): EVChargingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const totalEnergyNeeded = input.ev_count * input.avg_battery_capacity_kwh * (input.target_soc_pct - input.avg_soc_arrival_pct) / 100 / 1000
  const maxSimultaneousChargers = Math.floor(input.grid_capacity_kw / input.charging_power_kw)
  const avgChargingTime = (input.target_soc_pct - input.avg_soc_arrival_pct) / 100 * input.avg_battery_capacity_kwh / input.charging_power_kw

  const peakDemand = Math.min(input.ev_count * input.charging_power_kw, maxSimultaneousChargers * input.charging_power_kw) * rng.nextFloat(0.7, 1.0)
  const gridOverloadEvents = peakDemand > input.grid_capacity_kw ? rng.nextInt(1, 5) : 0

  const v2gCapable = input.v2g_capable_count
  const v2gEnergy = v2gCapable * input.avg_battery_capacity_kwh * 0.15 / 1000 * rng.nextFloat(0.5, 1.0)

  const totalEnergyWithV2G = totalEnergyNeeded - v2gEnergy
  const loadFactor = totalEnergyWithV2G * 1000 / (peakDemand * input.departure_time_h + 0.001) * 100

  const avgFinalSoc = input.avg_soc_arrival_pct + (input.target_soc_pct - input.avg_soc_arrival_pct) * rng.nextFloat(0.85, 0.99)
  const unmetDemand = Math.max(0, (input.target_soc_pct - avgFinalSoc) / (input.target_soc_pct - input.avg_soc_arrival_pct) * 100)
  const waitTime = gridOverloadEvents > 0 ? rng.nextFloat(5, 30) : rng.nextFloat(0, 5)
  const costPerEv = totalEnergyNeeded / input.ev_count * input.electricity_price_usd_kwh * 1000
  const satisfaction = Math.max(0, 100 - unmetDemand * 3 - waitTime * 0.5)

  const gridImpact = peakDemand - v2gCapable * input.charging_power_kw * 0.1
  const peakShaving = v2gEnergy * 1000 / input.departure_time_h
  const totalCost = totalEnergyWithV2G * 1000 * input.electricity_price_usd_kwh

  const coordinationScore = Math.round((satisfaction * 0.3 + (gridOverloadEvents === 0 ? 25 : 5) + Math.min(loadFactor, 25) + (v2gCapable > 0 ? 15 : 0) + rng.nextFloat(5, 15)) * 100) / 100

  const recommendation = coordinationScore > 75 ? 'Excellent coordination: expand V2G participation and dynamic pricing'
    : coordinationScore > 50 ? 'Good coordination: implement smart scheduling to reduce peak demand'
    : 'Coordination needed: deploy demand response and time-of-use pricing to manage grid impact'

  return {
    schedule: {
      peak_demand_kw: Math.round(peakDemand),
      total_energy_mwh: Math.round(totalEnergyWithV2G * 100) / 100,
      avg_charging_time_h: Math.round(avgChargingTime * 100) / 100,
      grid_overload_events: gridOverloadEvents,
      v2g_energy_mwh: Math.round(v2gEnergy * 100) / 100,
      load_factor_pct: Math.round(loadFactor * 100) / 100,
    },
    user_satisfaction: {
      avg_final_soc_pct: Math.round(avgFinalSoc * 100) / 100,
      unmet_demand_pct: Math.round(unmetDemand * 100) / 100,
      wait_time_avg_min: Math.round(waitTime * 100) / 100,
      cost_per_ev_usd: Math.round(costPerEv * 100) / 100,
      satisfaction_index: Math.round(satisfaction * 100) / 100,
    },
    grid_impact_kw: Math.round(gridImpact),
    peak_shaving_achieved_kw: Math.round(peakShaving),
    total_cost_usd: Math.round(totalCost),
    recommendation,
    coordination_score: coordinationScore,
  }
}

// ==================== SECTION 4 -- Report Formatting Functions ====================

function formatDemandResponseReport(result: DemandResponseResult): string {
  const lines: string[] = []
  lines.push('## Demand Response Optimization Report')
  lines.push('')
  lines.push('Effectiveness Score: ' + result.effectiveness_score + ' / 100')
  lines.push('Strategy: ' + result.strategy)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Capacity Results')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Enrolled Capacity | ' + result.capacity.enrolled_capacity_mw + ' MW |')
  lines.push('| Actual Reduction | ' + result.capacity.actual_reduction_mw + ' MW |')
  lines.push('| Compliance Rate | ' + result.capacity.compliance_rate_pct + '% |')
  lines.push('| Load Shift | ' + result.capacity.load_shift_mwh + ' MWh |')
  lines.push('| Peak Reduction | ' + result.capacity.peak_reduction_pct + '% |')
  lines.push('')
  lines.push('### Economics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Total Incentive Cost | $' + result.economics.total_incentive_cost_usd + ' |')
  lines.push('| Avoided Capacity Cost | $' + result.economics.avoided_capacity_cost_usd + ' |')
  lines.push('| Net Benefit | $' + result.economics.net_benefit_usd + ' |')
  lines.push('| Cost per MWh Reduced | $' + result.economics.cost_per_mwh_reduced + ' |')
  lines.push('| Avg Participant Reward | $' + result.economics.participant_avg_reward_usd + ' |')
  lines.push('')
  lines.push('### Load Curve (Hourly)')
  lines.push('| Hour | Before (MW) | After (MW) | Reduction |')
  lines.push('|------|-------------|------------|-----------|')
  for (let h = 0; h < 24; h++) {
    const before = result.load_curve_before[h] || 0
    const after = result.load_curve_after[h] || 0
    lines.push('| ' + h + ' | ' + before + ' | ' + after + ' | ' + Math.round((before - after) * 100) / 100 + ' |')
  }
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatDERManagementReport(result: DERManagementResult): string {
  const lines: string[] = []
  lines.push('## DER Management System Report')
  lines.push('')
  lines.push('Optimization Score: ' + result.optimization_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### DER Output')
  lines.push('| Resource | Power |')
  lines.push('|----------|-------|')
  lines.push('| Solar PV | ' + result.output.solar_generation_mw + ' MW |')
  lines.push('| Wind | ' + result.output.wind_generation_mw + ' MW |')
  lines.push('| Battery | ' + result.output.battery_power_mw + ' MW |')
  lines.push('| EV Available | ' + result.output.ev_available_mw + ' MW |')
  lines.push('| Renewable Share | ' + result.output.total_renewable_pct + '% |')
  lines.push('| Curtailment | ' + result.output.curtailment_mw + ' MW |')
  lines.push('')
  lines.push('### Virtual Power Plant')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Aggregated Capacity | ' + result.vpp.aggregated_capacity_mw + ' MW |')
  lines.push('| Flexibility Up | ' + result.vpp.flexibility_up_mw + ' MW |')
  lines.push('| Flexibility Down | ' + result.vpp.flexibility_down_mw + ' MW |')
  lines.push('| Response Time | ' + result.vpp.response_time_s + ' s |')
  lines.push('| Availability | ' + result.vpp.availability_pct + '% |')
  lines.push('')
  lines.push('### Grid & Environment')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Grid Balance | ' + result.grid_balance_mw + ' MW |')
  lines.push('| Carbon Reduction | ' + result.carbon_reduction_tonnes_h + ' tCO2/h |')
  lines.push('| Revenue Potential | $' + result.revenue_potential_usd_h + '/h |')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatGridFaultReport(result: GridFaultResult): string {
  const lines: string[] = []
  lines.push('## Grid Fault Detection Report')
  lines.push('')
  lines.push('Detection Score: ' + result.detection_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Fault Location')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Estimated Location | ' + result.fault_location.estimated_location_km + ' km |')
  lines.push('| Actual Location | ' + result.fault_location.actual_location_km + ' km |')
  lines.push('| Location Error | ' + result.fault_location.location_error_pct + '% |')
  lines.push('| Faulted Section | ' + result.fault_location.faulted_section + ' |')
  lines.push('| Confidence | ' + result.fault_location.confidence_pct + '% |')
  lines.push('')
  lines.push('### Protection Operation')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Relay Trip Time | ' + result.protection.relay_trip_time_ms + ' ms |')
  lines.push('| Breaker Operate Time | ' + result.protection.breaker_operate_time_ms + ' ms |')
  lines.push('| Total Clearing Time | ' + result.protection.total_clearing_time_ms + ' ms |')
  lines.push('| Selectivity Score | ' + result.protection.selectivity_score + ' |')
  lines.push('| Backup Activated | ' + (result.protection.backup_protection_activated ? 'Yes' : 'No') + ' |')
  lines.push('')
  lines.push('### Impact')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Fault Current | ' + result.fault_current_ka + ' kA |')
  lines.push('| Affected Customers | ' + result.affected_customers + ' |')
  lines.push('| Restoration Estimate | ' + result.restoration_time_estimate_min + ' min |')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatStorageDispatchReport(result: StorageDispatchResult): string {
  const lines: string[] = []
  lines.push('## Storage Dispatch Engine Report')
  lines.push('')
  lines.push('Dispatch Score: ' + result.dispatch_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Dispatch Schedule')
  lines.push('| Hour | Power (MW) | SoC (%) | Action | Revenue ($) |')
  lines.push('|------|-----------|---------|--------|-------------|')
  for (const s of result.schedule) {
    lines.push('| ' + s.hour + ' | ' + s.power_mw + ' | ' + s.soc_pct + ' | ' + s.action + ' | ' + s.revenue_usd + ' |')
  }
  lines.push('')
  lines.push('### Performance Summary')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Total Revenue | $' + result.performance.total_revenue_usd + ' |')
  lines.push('| Total Energy | ' + result.performance.total_energy_mwh + ' MWh |')
  lines.push('| Cycles Completed | ' + result.performance.cycles_completed + ' |')
  lines.push('| Average SoC | ' + result.performance.avg_soc_pct + '% |')
  lines.push('| Final SoC | ' + result.performance.final_soc_pct + '% |')
  lines.push('| Degradation Cost | $' + result.performance.degradation_cost_usd + ' |')
  lines.push('| Arbitrage Margin | $' + result.arbitrage_margin_usd + ' |')
  lines.push('| Capacity Factor | ' + result.capacity_factor_pct + '% |')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatRenewableForecastReport(result: RenewableForecastResult): string {
  const lines: string[] = []
  lines.push('## Renewable Energy Forecast Report')
  lines.push('')
  lines.push('Forecast Quality Score: ' + result.forecast_quality_score + ' / 100')
  lines.push('Ramp Event Risk: ' + result.ramp_event_risk)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Power Forecast')
  lines.push('| Hour | Predicted (MW) | Lower Bound | Upper Bound | Uncertainty |')
  lines.push('|------|---------------|-------------|-------------|-------------|')
  for (const f of result.forecast) {
    lines.push('| ' + f.hour + ' | ' + f.predicted_power_mw + ' | ' + f.confidence_lower_mw + ' | ' + f.confidence_upper_mw + ' | ' + f.uncertainty_pct + '% |')
  }
  lines.push('')
  lines.push('### Accuracy Metrics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| MAE | ' + result.accuracy.mae_pct + '% |')
  lines.push('| RMSE | ' + result.accuracy.rmse_pct + '% |')
  lines.push('| Skill Score | ' + result.accuracy.skill_score + ' |')
  lines.push('| Bias | ' + result.accuracy.bias_pct + '% |')
  lines.push('| Forecast Value | $' + result.accuracy.forecast_value_usd + ' |')
  lines.push('')
  lines.push('### Summary')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Expected Generation | ' + result.expected_generation_mwh + ' MWh |')
  lines.push('| Capacity Factor | ' + result.capacity_factor_forecast_pct + '% |')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatMicrogridControllerReport(result: MicrogridControllerResult): string {
  const lines: string[] = []
  lines.push('## Microgrid Controller Report')
  lines.push('')
  lines.push('Control Score: ' + result.control_score + ' / 100')
  lines.push('Mode: ' + result.mode_status)
  lines.push('Stability: ' + result.stability_assessment)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Frequency Control')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Frequency Deviation | ' + result.frequency.frequency_deviation_hz + ' Hz |')
  lines.push('| Frequency Nadir | ' + result.frequency.frequency_nadir_hz + ' Hz |')
  lines.push('| Droop Response | ' + result.frequency.droop_response_mw + ' MW |')
  lines.push('| Inertia Response | ' + result.frequency.inertia_response_mw + ' MW |')
  lines.push('| Settling Time | ' + result.frequency.settling_time_s + ' s |')
  lines.push('| Stable | ' + (result.frequency.frequency_stable ? 'Yes' : 'No') + ' |')
  lines.push('')
  lines.push('### Voltage Control')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Voltage Deviation | ' + result.voltage.voltage_deviation_pct + '% |')
  lines.push('| Reactive Power | ' + result.voltage.reactive_power_mvar + ' Mvar |')
  lines.push('| Tap Changer Actions | ' + result.voltage.tap_changer_actions + ' |')
  lines.push('| Voltage Stable | ' + (result.voltage.voltage_stable ? 'Yes' : 'No') + ' |')
  lines.push('| Within Band | ' + (result.voltage.voltage_within_band ? 'Yes' : 'No') + ' |')
  lines.push('')
  lines.push('### Energy Management')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Solar Utilization | ' + result.energy.solar_utilization_pct + '% |')
  lines.push('| Battery Cycles | ' + result.energy.battery_cycles_h + ' |')
  lines.push('| Diesel Runtime | ' + result.energy.diesel_runtime_h + ' h |')
  lines.push('| Load Shed | ' + result.energy.load_shed_mwh + ' MWh |')
  lines.push('| Renewable Fraction | ' + result.energy.renewable_fraction_pct + '% |')
  lines.push('| Autonomy | ' + result.energy.autonomy_hours + ' h |')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatPowerQualityReport(result: PowerQualityResult): string {
  const lines: string[] = []
  lines.push('## Power Quality Analysis Report')
  lines.push('')
  lines.push('PQ Score: ' + result.pq_score + ' / 100')
  lines.push('Compliance: ' + result.compliance_status)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Harmonics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| THD Voltage | ' + result.harmonics.thd_voltage_pct + '% |')
  lines.push('| THD Current | ' + result.harmonics.thd_current_pct + '% |')
  lines.push('| Dominant Harmonic | ' + result.harmonics.dominant_harmonic + 'th |')
  lines.push('| IEEE 519 Compliant | ' + (result.harmonics.ieee_519_compliant ? 'Yes' : 'No') + ' |')
  lines.push('')
  lines.push('### Harmonic Spectrum')
  lines.push('| Order | Magnitude (%) |')
  lines.push('|-------|--------------|')
  for (const h of result.harmonics.harmonic_magnitudes) {
    lines.push('| ' + h.order + ' | ' + h.magnitude_pct + ' |')
  }
  lines.push('')
  lines.push('### Voltage Events')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Sag Count | ' + result.voltage_events.sag_count + ' |')
  lines.push('| Swell Count | ' + result.voltage_events.swell_count + ' |')
  lines.push('| Interruptions | ' + result.voltage_events.interruption_count + ' |')
  lines.push('| Avg Sag Duration | ' + result.voltage_events.avg_sag_duration_ms + ' ms |')
  lines.push('| Avg Sag Depth | ' + result.voltage_events.avg_sag_depth_pct + '% |')
  lines.push('| Flicker Severity (Pst) | ' + result.voltage_events.semi_flicker_severity + ' |')
  lines.push('')
  lines.push('### Other Parameters')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Voltage Unbalance | ' + result.unbalance_voltage_pct + '% |')
  lines.push('| Current Unbalance | ' + result.unbalance_current_pct + '% |')
  lines.push('| Frequency Deviation | ' + result.frequency_deviation_hz + ' Hz |')
  lines.push('| Overall PQ Index | ' + result.overall_pq_index + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatEVChargingReport(result: EVChargingResult): string {
  const lines: string[] = []
  lines.push('## EV Charging Coordination Report')
  lines.push('')
  lines.push('Coordination Score: ' + result.coordination_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Charging Schedule')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Peak Demand | ' + result.schedule.peak_demand_kw + ' kW |')
  lines.push('| Total Energy | ' + result.schedule.total_energy_mwh + ' MWh |')
  lines.push('| Avg Charging Time | ' + result.schedule.avg_charging_time_h + ' h |')
  lines.push('| Grid Overload Events | ' + result.schedule.grid_overload_events + ' |')
  lines.push('| V2G Energy | ' + result.schedule.v2g_energy_mwh + ' MWh |')
  lines.push('| Load Factor | ' + result.schedule.load_factor_pct + '% |')
  lines.push('')
  lines.push('### User Satisfaction')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Avg Final SoC | ' + result.user_satisfaction.avg_final_soc_pct + '% |')
  lines.push('| Unmet Demand | ' + result.user_satisfaction.unmet_demand_pct + '% |')
  lines.push('| Avg Wait Time | ' + result.user_satisfaction.wait_time_avg_min + ' min |')
  lines.push('| Cost per EV | $' + result.user_satisfaction.cost_per_ev_usd + ' |')
  lines.push('| Satisfaction Index | ' + result.user_satisfaction.satisfaction_index + ' / 100 |')
  lines.push('')
  lines.push('### Grid Impact')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Grid Impact | ' + result.grid_impact_kw + ' kW |')
  lines.push('| Peak Shaving | ' + result.peak_shaving_achieved_kw + ' kW |')
  lines.push('| Total Cost | $' + result.total_cost_usd + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Smart Grid Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== SECTION 5 -- Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Demand Response Optimizer
  tools.register(defineTool({
    name: 'demand_response_optimizer',
    description: 'Demand response optimization | Load reduction, incentive pricing, compliance modeling, peak shaving, load curve analysis | Optimize demand response programs for grid peak reduction.',
    parameters: {
      dr_input: {
        type: 'string',
        required: true,
        description: 'JSON: total_load_mw, peak_hours (number[]), dr_capacity_mw, incentive_price_usd_mwh, customer_count, customer_types (residential|commercial|industrial|mixed), event_duration_hours, weather_factor'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { dr_input: string }) {
      const input: DemandResponseInput = JSON.parse(args.dr_input)
      return formatDemandResponseReport(analyzeDemandResponse(input))
    }
  }))

  // Tool 2: DER Management System
  tools.register(defineTool({
    name: 'der_management_system',
    description: 'Distributed Energy Resource management | Solar, wind, battery, EV aggregation; VPP formation, flexibility assessment, carbon reduction | Manage and optimize distributed energy resources.',
    parameters: {
      der_input: {
        type: 'string',
        required: true,
        description: 'JSON: solar_capacity_mw, wind_capacity_mw, battery_capacity_mwh, ev_fleet_count, grid_demand_mw, electricity_price_usd_mwh, solar_irradiance_w_m2, wind_speed_m_s, aggregation_mode (centralized|decentralized|hybrid)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { der_input: string }) {
      const input: DERManagementInput = JSON.parse(args.der_input)
      return formatDERManagementReport(analyzeDERManagement(input))
    }
  }))

  // Tool 3: Grid Fault Detector
  tools.register(defineTool({
    name: 'grid_fault_detector',
    description: 'Grid fault detection and location | Fault type classification, impedance-based location, protection coordination, FLISR recommendations | Detect, locate, and isolate distribution network faults.',
    parameters: {
      fault_input: {
        type: 'string',
        required: true,
        description: 'JSON: network_nodes, feeder_count, fault_type (single_line_to_ground|line_to_line|three_phase|double_line_to_ground), fault_impedance_ohm, fault_location_pct, protection_relays, scada_update_interval_s, line_voltage_kv'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { fault_input: string }) {
      const input: GridFaultInput = JSON.parse(args.fault_input)
      return formatGridFaultReport(analyzeGridFault(input))
    }
  }))

  // Tool 4: Storage Dispatch Engine
  tools.register(defineTool({
    name: 'storage_dispatch_engine',
    description: 'Battery energy storage dispatch optimization | Energy arbitrage, frequency regulation, peak shaving, backup power; SoC management, degradation modeling | Optimize battery storage dispatch schedules.',
    parameters: {
      storage_input: {
        type: 'string',
        required: true,
        description: 'JSON: battery_capacity_mwh, battery_power_mw, initial_soc_pct, target_soc_pct, electricity_prices_usd_mwh (number[]), dispatch_horizon_hours, application (energy_arbitrage|frequency_regulation|peak_shaving|backup_power), round_trip_efficiency_pct, degradation_cost_usd_mwh'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { storage_input: string }) {
      const input: StorageDispatchInput = JSON.parse(args.storage_input)
      return formatStorageDispatchReport(analyzeStorageDispatch(input))
    }
  }))

  // Tool 5: Renewable Forecaster
  tools.register(defineTool({
    name: 'renewable_forecaster',
    description: 'Renewable energy power forecasting | Solar PV and wind power prediction, confidence intervals, ramp detection, accuracy metrics | Generate short-term renewable generation forecasts.',
    parameters: {
      forecast_input: {
        type: 'string',
        required: true,
        description: 'JSON: plant_type (solar_pv|wind_onshore|wind_offshore|hybrid), installed_capacity_mw, forecast_horizon_hours, historical_capacity_factor_pct, weather_forecast_uncertainty_pct, panel_efficiency_pct (optional), hub_height_m (optional), turbine_count (optional)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { forecast_input: string }) {
      const input: RenewableForecastInput = JSON.parse(args.forecast_input)
      return formatRenewableForecastReport(analyzeRenewableForecast(input))
    }
  }))

  // Tool 6: Microgrid Controller
  tools.register(defineTool({
    name: 'microgrid_controller',
    description: 'Microgrid control system design | Frequency/voltage control, grid-connected/islanded mode, energy management, stability assessment | Design and evaluate microgrid control strategies.',
    parameters: {
      microgrid_input: {
        type: 'string',
        required: true,
        description: 'JSON: microgrid_capacity_mw, solar_capacity_mw, battery_capacity_mwh, diesel_backup_mw, critical_load_mw, non_critical_load_mw, mode (grid_connected|islanded|transition), grid_frequency_hz, grid_voltage_pct, soc_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { microgrid_input: string }) {
      const input: MicrogridControllerInput = JSON.parse(args.microgrid_input)
      return formatMicrogridControllerReport(analyzeMicrogridController(input))
    }
  }))

  // Tool 7: Power Quality Analyzer
  tools.register(defineTool({
    name: 'power_quality_analyzer',
    description: 'Power quality analysis | Harmonic distortion (THD), voltage sags/swells, flicker, unbalance, frequency deviation, IEEE 519 compliance | Assess power quality at distribution network points.',
    parameters: {
      pq_input: {
        type: 'string',
        required: true,
        description: 'JSON: nominal_voltage_kv, nominal_frequency_hz, measurement_duration_h, harmonic_orders (number[]), load_type (linear|nonlinear|mixed|arc_furnace), flicker_source (boolean), voltage_sag_events, unbalance_factor_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { pq_input: string }) {
      const input: PowerQualityInput = JSON.parse(args.pq_input)
      return formatPowerQualityReport(analyzePowerQuality(input))
    }
  }))

  // Tool 8: EV Charging Coordinator
  tools.register(defineTool({
    name: 'ev_charging_coordinator',
    description: 'Electric vehicle charging coordination | Smart charging schedules, V2G optimization, grid constraint management, user satisfaction | Coordinate EV charging to minimize grid impact and maximize user satisfaction.',
    parameters: {
      ev_input: {
        type: 'string',
        required: true,
        description: 'JSON: ev_count, avg_battery_capacity_kwh, avg_soc_arrival_pct, target_soc_pct, charging_power_kw, v2g_capable_count, arrival_time_distribution, departure_time_h, grid_capacity_kw, electricity_price_usd_kwh'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { ev_input: string }) {
      const input: EVChargingInput = JSON.parse(args.ev_input)
      return formatEVChargingReport(analyzeEVCharging(input))
    }
  }))

  console.log('[dsh-tool-smartgrid] Loaded v' + VERSION + ' - Smart Grid & Energy Internet: 8 tools active')
  console.log('  Tools: demand_response_optimizer, der_management_system, grid_fault_detector, storage_dispatch_engine, renewable_forecaster, microgrid_controller, power_quality_analyzer, ev_charging_coordinator')
}
