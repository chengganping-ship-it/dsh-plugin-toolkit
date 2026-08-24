/**
 * DSH Energy Grid & Utilities Plugin v0.1.0
 *
 * Comprehensive energy grid optimization and utilities toolkit for DeepSeek Harness Agent.
 * Designed for grid operators, energy traders, utility managers, renewable energy engineers,
 * and energy storage planners.
 *
 * Features (v0.1.0):
 * 1. grid_optimization_engine       — Power flow optimization, loss minimization, Volt/VAR control
 * 2. demand_forecasting_modeler     — Multi-horizon demand forecasting with weather scenarios
 * 3. renewable_integration_planner  — Renewable grid integration, curtailment reduction, storage plan
 * 4. energy_trading_advisor         — Energy market trading, price signals, portfolio optimization
 * 5. outage_management_coordinator  — Outage detection, crew dispatch, restoration planning
 * 6. power_quality_analyzer         — Voltage, harmonics, flicker, power factor assessment
 * 7. energy_storage_optimizer       — Battery storage sizing, charge/discharge optimization
 * 8. utility_bill_analyzer          — Utility bill analysis, rate optimization, cost reduction
 *
 * @module dsh-tool-energygrid
 * @version 0.1.0
 * @license MIT
 *
 * Disclaimer: This analysis is based on AI model inference and simulated data.
 * It is for reference only and does not replace professional power system engineering,
 * energy trading, or utility operations advice.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-energygrid'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = 'Disclaimer: This analysis is based on AI model inference and simulated data. It is for reference only and does not replace professional power system engineering, energy trading, or utility operations advice.'

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

// ==================== SECTION 2 -- Types & Interfaces ====================

// --- Tool 1: Grid Optimization Engine ---
export interface GridOptimizationInput {
  grid_id: string
  topology: {
    buses: number
    branches: number
    generators: number
    loads: number
  }
  voltage_kv: number
  total_load_mw: number
  total_generation_mw: number
  renewable_generation_mw: number
  loss_target_pct: number
  var_devices: number
  tap_changers: number
  optimization_objective: 'loss_min' | 'voltage_profile' | 'reactive_power' | 'multi_objective'
}

export interface PowerFlowResult {
  bus_voltages: Array<{ bus_id: string; voltage_pu: number; angle_deg: number }>
  branch_flows: Array<{ branch_id: string; from_bus: string; to_bus: string; power_mw: number; losses_mw: number }>
  total_losses_mw: number
  losses_pct: number
  convergence_status: 'converged' | 'diverged' | 'max_iterations'
}

export interface VoltVarControl {
  device_id: string
  device_type: 'capacitor' | 'reactor' | 'svc' | 'statcom' | 'oltc'
  setting: number
  action: 'raise' | 'lower' | 'hold'
  impact_voltage_pu: number
}

export interface GridOptimizationResult {
  grid_id: string
  power_flow: PowerFlowResult
  volt_var_controls: VoltVarControl[]
  loss_reduction_potential_pct: number
  voltage_violations: number
  optimization_score: number
  recommendations: string[]
  reliability_assessment: string
}

// --- Tool 2: Demand Forecasting Modeler ---
export interface DemandForecastInput {
  region_id: string
  forecast_horizon_hours: number
  historical_load_mw: number[]
  temperature_c: number
  humidity_pct: number
  day_type: 'weekday' | 'weekend' | 'holiday'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  special_event?: string
  industrial_pct: number
  commercial_pct: number
  residential_pct: number
}

export interface DemandPoint {
  hour: number
  forecast_mw: number
  confidence_low: number
  confidence_high: number
}

export interface PeakValleyAnalysis {
  peak_hour: number
  peak_load_mw: number
  valley_hour: number
  valley_load_mw: number
  peak_valley_ratio: number
  load_factor_pct: number
}

export interface DemandForecastResult {
  region_id: string
  forecast_horizon_hours: number
  demand_points: DemandPoint[]
  peak_valley: PeakValleyAnalysis
  total_energy_mwh: number
  avg_load_mw: number
  max_load_mw: number
  min_load_mw: number
  mape_pct: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

// --- Tool 3: Renewable Integration Planner ---
export interface RenewableIntegrationInput {
  project_id: string
  solar_capacity_mw: number
  wind_capacity_mw: number
  current_renewable_mw: number
  grid_capacity_mw: number
  interconnection_limit_mw: number
  storage_existing_mwh: number
  storage_proposed_mwh: number
  curtailment_target_pct: number
  grid_flexibility: 'low' | 'medium' | 'high'
  technology: 'solar_pv' | 'wind_onshore' | 'wind_offshore' | 'hybrid' | 'csp'
}

export interface IntegrationCapacity {
  max_hosting_capacity_mw: number
  available_headroom_mw: number
  thermal_limit_mw: number
  voltage_rise_limit_mw: number
  short_circuit_limit_mw: number
  binding_constraint: string
}

export interface CurtailmentStrategy {
  strategy: string
  curtailment_reduction_pct: number
  implementation_cost_usd: number
  payback_years: number
}

export interface StoragePlan {
  recommended_capacity_mwh: number
  recommended_power_mw: number
  technology: string
  services: string[]
  annual_revenue_usd: number
  capital_cost_usd: number
}

export interface RenewableIntegrationResult {
  project_id: string
  renewable_penetration_pct: number
  integration_capacity: IntegrationCapacity
  curtailment_strategies: CurtailmentStrategy[]
  storage_plan: StoragePlan
  grid_impact_score: number
  carbon_reduction_tco2_per_year: number
  recommendations: string[]
}

// --- Tool 4: Energy Trading Advisor ---
export interface EnergyTradingInput {
  market_id: string
  participant_id: string
  trading_date: string
  market_type: 'day_ahead' | 'real_time' | 'forward' | 'ancillary' | 'capacity'
  portfolio_position_mwh: number
  generation_capacity_mw: number
  marginal_cost_per_mwh: number
  price_forecast_per_mwh: number[]
  price_volatility_pct: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  credit_limit_usd: number
  renewable_certificates: number
  carbon_allowance_t: number
}

export interface PriceForecast {
  hour: number
  predicted_price: number
  confidence_low: number
  confidence_high: number
  price_driver: string
}

export interface TradingRecommendation {
  action: 'buy' | 'sell' | 'hold'
  volume_mw: number
  target_price_per_mwh: number
  strategy: string
  expected_profit_usd: number
  risk_score: number
}

export interface PortfolioRisk {
  var_95_pct: number
  cvar_95_pct: number
  max_drawdown_pct: number
  sharpe_ratio: number
  exposure_mwh: number
}

export interface EnergyTradingResult {
  market_id: string
  price_forecasts: PriceForecast[]
  trading_recommendation: TradingRecommendation
  portfolio_risk: PortfolioRisk
  expected_revenue_usd: number
  market_clearing_probability: number
  regulatory_compliance: string
  renewable_certificate_position: string
  carbon_exposure: string
  recommendations: string[]
}

// --- Tool 5: Outage Management Coordinator ---
export interface OutageManagementInput {
  outage_id: string
  grid_segment_id: string
  fault_type: 'equipment_failure' | 'weather' | 'vegetation' | 'animal' | 'vehicle' | 'unknown'
  fault_location: { latitude: number; longitude: number }
  affected_customers: number
  detection_time: string
  crew_available: number
  weather_conditions: string
  priority_customers: string[]
  backup_feeders: string[]
  scada_status: 'online' | 'degraded' | 'offline'
}

export interface FaultIsolation {
  switches_to_operate: Array<{ switch_id: string; action: 'open' | 'close'; location: string }>
  isolated_sections: string[]
  customers_isolated: number
  isolation_time_estimate_min: number
}

export interface RestorationPlan {
  steps: Array<{ step: number; action: string; crew_required: number; duration_min: number }>
  total_restoration_time_min: number
  customers_restored_per_step: number[]
  priority_restoration: string[]
  mutual_aid_required: boolean
}

export interface CrewDispatch {
  crew_id: string
  crew_size: number
  estimated_arrival_min: number
  assigned_task: string
  travel_distance_km: number
  equipment_needed: string[]
}

export interface OutageManagementResult {
  outage_id: string
  fault_isolation: FaultIsolation
  restoration_plan: RestorationPlan
  crew_dispatches: CrewDispatch[]
  saifi_impact: number
  saidi_impact: number
  caidi_impact: number
  customer_minutes_interrupted: number
  priority_customers_restored: boolean
  recommendations: string[]
}

// --- Tool 6: Power Quality Analyzer ---
export interface PowerQualityInput {
  monitoring_point_id: string
  voltage_level_kv: number
  measurements: {
    voltage_l1_v: number
    voltage_l2_v: number
    voltage_l3_v: number
    current_l1_a: number
    current_l2_a: number
    current_l3_a: number
    active_power_kw: number
    reactive_power_kvar: number
    frequency_hz: number
  }
  harmonic_data: {
    h3_pct: number
    h5_pct: number
    h7_pct: number
    h9_pct: number
    h11_pct: number
    h13_pct: number
  }
  flicker_pst: number
  flicker_plt: number
  standard: 'ieee_519' | 'en_50160' | 'gb_t_12325' | 'iec_61000'
}

export interface VoltageAnalysis {
  avg_voltage_v: number
  unbalance_pct: number
  deviation_from_nominal_pct: number
  sag_count: number
  swell_count: number
  compliance: 'compliant' | 'marginal' | 'violation'
}

export interface HarmonicAnalysis {
  thd_voltage_pct: number
  thd_current_pct: number
  dominant_harmonic: number
  dominant_harmonic_pct: number
  resonance_risk: boolean
  compliance: 'compliant' | 'marginal' | 'violation'
  filter_recommendation: string
}

export interface PowerFactorAnalysis {
  power_factor: number
  displacement_pf: number
  distortion_pf: number
  target_pf: number
  penalty_risk: boolean
  compensation_kvar_needed: number
}

export interface PowerQualityResult {
  monitoring_point_id: string
  voltage_analysis: VoltageAnalysis
  harmonic_analysis: HarmonicAnalysis
  power_factor_analysis: PowerFactorAnalysis
  flicker_compliance: 'pass' | 'fail'
  overall_pq_index: number
  overall_compliance: 'compliant' | 'marginal' | 'violation'
  revenue_impact_usd: number
  recommendations: string[]
}

// --- Tool 7: Energy Storage Optimizer ---
export interface EnergyStorageInput {
  project_id: string
  storage_technology: 'lithium_ion' | 'flow_battery' | 'compressed_air' | 'pumped_hydro' | 'flywheel' | 'hydrogen'
  capacity_mwh: number
  power_rating_mw: number
  round_trip_efficiency_pct: number
  cycle_life: number
  dod_limit_pct: number
  services: string[]
  electricity_prices: Array<{ hour: number; price_per_mwh: number }>
  demand_charge_per_kw: number
  grid_service_market_prices: { frequency_regulation: number; spinning_reserve: number; capacity: number }
  capital_cost_per_kwh: number
  om_cost_per_kwh_year: number
}

export interface StorageSchedule {
  hour: number
  action: 'charge' | 'discharge' | 'idle'
  power_mw: number
  soc_pct: number
  service: string
  revenue_usd: number
}

export interface EconomicAnalysis {
  annual_revenue_usd: number
  annual_om_cost_usd: number
  net_annual_benefit_usd: number
  capital_cost_usd: number
  payback_period_years: number
  net_present_value_usd: number
  internal_rate_of_return_pct: number
  levelized_cost_per_mwh: number
}

export interface DegradationProfile {
  annual_capacity_fade_pct: number
  cycles_per_year: number
  expected_life_years: number
  replacement_threshold_pct: number
  replacement_year: number
}

export interface EnergyStorageResult {
  project_id: string
  optimal_capacity_mwh: number
  optimal_power_mw: number
  storage_schedule: StorageSchedule[]
  economic_analysis: EconomicAnalysis
  degradation_profile: DegradationProfile
  services_revenue_breakdown: Array<{ service: string; annual_revenue_usd: number; utilization_pct: number }>
  grid_benefit_score: number
  recommendations: string[]
}

// --- Tool 8: Utility Bill Analyzer ---
export interface UtilityBillInput {
  account_id: string
  utility_name: string
  facility_type: 'commercial' | 'industrial' | 'residential' | 'municipal' | 'data_center'
  billing_period_months: number
  consumption_kwh: number
  demand_kw: number
  peak_demand_kw: number
  off_peak_demand_kw: number
  current_rate_schedule: string
  energy_charges: number
  demand_charges: number
  fixed_charges: number
  taxes_and_fees: number
  total_bill_usd: number
  power_factor_penalty: number
  time_of_use: { peak_pct: number; off_peak_pct: number; shoulder_pct: number }
  alternative_rate_schedules: string[]
}

export interface RateAnalysis {
  current_effective_rate_per_kwh: number
  cost_per_sqft_usd: number
  energy_cost_per_unit_production: number
  utility_burden_pct: number
  year_over_year_change_pct: number
}

export interface RateComparison {
  rate_schedule: string
  estimated_annual_cost_usd: number
  annual_savings_usd: number
  savings_pct: number
  demand_response_compatible: boolean
  net_metering_compatible: boolean
}

export interface SavingsOpportunity {
  measure: string
  annual_savings_usd: number
  implementation_cost_usd: number
  payback_years: number
  co2_reduction_t: number
  priority: 'high' | 'medium' | 'low'
}

export interface UtilityBillResult {
  account_id: string
  current_bill_analysis: RateAnalysis
  rate_comparisons: RateComparison[]
  savings_opportunities: SavingsOpportunity[]
  total_potential_savings_usd: number
  total_potential_savings_pct: number
  co2_footprint_t: number
  benchmark_comparison: string
  billing_errors_detected: string[]
  recommendations: string[]
}

// ==================== SECTION 3 -- Analysis Functions ====================

// --- Tool 1: Grid Optimization Engine ---
function analyzeGridOptimization(input: GridOptimizationInput): GridOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const busVoltages: PowerFlowResult['bus_voltages'] = []
  for (let i = 1; i <= Math.min(input.topology.buses, 20); i++) {
    const baseVpu = 1.0
    const deviation = rng.nextFloat(-0.05, 0.05)
    busVoltages.push({
      bus_id: 'BUS_' + String(i).padStart(3, '0'),
      voltage_pu: Math.round((baseVpu + deviation) * 1000) / 1000,
      angle_deg: Math.round(rng.nextFloat(-15, 15) * 100) / 100,
    })
  }

  const branchFlows: PowerFlowResult['branch_flows'] = []
  let totalLosses = 0
  for (let i = 1; i <= Math.min(input.topology.branches, 15); i++) {
    const power = rng.nextFloat(0, input.total_load_mw / Math.max(input.topology.branches, 1))
    const losses = power * rng.nextFloat(0.01, 0.04)
    totalLosses += losses
    branchFlows.push({
      branch_id: 'BR_' + String(i).padStart(3, '0'),
      from_bus: 'BUS_' + String(rng.nextInt(1, Math.min(input.topology.buses, 20))).padStart(3, '0'),
      to_bus: 'BUS_' + String(rng.nextInt(1, Math.min(input.topology.buses, 20))).padStart(3, '0'),
      power_mw: Math.round(power * 100) / 100,
      losses_mw: Math.round(losses * 1000) / 1000,
    })
  }

  const lossesPct = Math.round((totalLosses / Math.max(input.total_generation_mw, 1)) * 10000) / 100
  const lossReductionPotential = Math.max(0, Math.round((lossesPct - input.loss_target_pct) * rng.nextFloat(0.6, 0.9) * 100) / 100)

  const voltVarControls: VoltVarControl[] = []
  const deviceTypes: VoltVarControl['device_type'][] = ['capacitor', 'reactor', 'svc', 'statcom', 'oltc']
  for (let i = 0; i < Math.min(input.var_devices, 8); i++) {
    const dtype = deviceTypes[i % deviceTypes.length]
    const action: VoltVarControl['action'] = rng.next() > 0.5 ? 'raise' : rng.next() > 0.3 ? 'lower' : 'hold'
    voltVarControls.push({
      device_id: 'VVC_' + String(i + 1).padStart(3, '0'),
      device_type: dtype,
      setting: Math.round(rng.nextFloat(0.9, 1.1) * 100) / 100,
      action,
      impact_voltage_pu: Math.round(rng.nextFloat(-0.03, 0.03) * 1000) / 1000,
    })
  }

  const voltageViolations = busVoltages.filter(v => v.voltage_pu < 0.95 || v.voltage_pu > 1.05).length
  const optimizationScore = Math.round(Math.max(0, Math.min(100, 100 - voltageViolations * 5 - lossesPct * 2 + rng.nextFloat(-5, 5))) * 100) / 100

  const recommendations: string[] = []
  if (lossReductionPotential > 0.5) {
    recommendations.push('Implement reactive power optimization to reduce losses by ' + lossReductionPotential.toFixed(2) + '%')
  }
  if (voltageViolations > 0) {
    recommendations.push('Address ' + voltageViolations + ' voltage violations via capacitor bank reconfiguration')
  }
  if (input.renewable_generation_mw / Math.max(input.total_generation_mw, 1) > 0.3) {
    recommendations.push('Deploy smart inverter Volt/VAR control for high renewable penetration areas')
  }
  if (input.var_devices < 3) {
    recommendations.push('Install additional reactive power compensation devices')
  }
  recommendations.push('Consider Conservation Voltage Reduction (CVR) for energy savings')
  recommendations.push('Implement advanced distribution management system (ADMS) for real-time optimization')

  return {
    grid_id: input.grid_id,
    power_flow: {
      bus_voltages: busVoltages,
      branch_flows: branchFlows,
      total_losses_mw: Math.round(totalLosses * 100) / 100,
      losses_pct: lossesPct,
      convergence_status: rng.next() > 0.9 ? 'max_iterations' : 'converged',
    },
    volt_var_controls: voltVarControls,
    loss_reduction_potential_pct: lossReductionPotential,
    voltage_violations: voltageViolations,
    optimization_score: optimizationScore,
    recommendations,
    reliability_assessment: voltageViolations === 0 && lossesPct < 5
      ? 'Grid operating within acceptable parameters'
      : voltageViolations <= 2 && lossesPct < 8
        ? 'Grid requires optimization to meet performance targets'
        : 'Grid requires immediate attention to address reliability concerns',
  }
}

// --- Tool 2: Demand Forecasting Modeler ---
function analyzeDemandForecast(input: DemandForecastInput): DemandForecastResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const avgHistorical = input.historical_load_mw.length > 0
    ? input.historical_load_mw.reduce((a, b) => a + b, 0) / input.historical_load_mw.length
    : 500

  const tempFactor = 1 + (input.temperature_c - 22) * 0.012
  const dayFactor = input.day_type === 'weekday' ? 1.0 : input.day_type === 'weekend' ? 0.82 : 0.65
  const seasonFactor = input.season === 'summer' ? 1.15 : input.season === 'winter' ? 1.1 : 0.95
  const humidityFactor = 1 + (input.humidity_pct - 50) * 0.0015

  const demandPoints: DemandPoint[] = []
  let totalEnergy = 0
  let peakLoad = 0, peakHour = 0
  let valleyLoad = Infinity, valleyHour = 0

  const hours = Math.min(input.forecast_horizon_hours, 48)
  for (let h = 0; h < hours; h++) {
    const hourFactor = (h >= 7 && h <= 22) ? 1.1 + rng.nextFloat(-0.08, 0.08) : 0.6 + rng.nextFloat(-0.05, 0.05)
    const baseLoad = avgHistorical * hourFactor * tempFactor * dayFactor * seasonFactor * humidityFactor
    const noise = rng.nextFloat(-0.04, 0.04)
    const forecast = Math.round(baseLoad * (1 + noise) * 10) / 10
    const margin = Math.round(forecast * rng.nextFloat(0.03, 0.07) * 10) / 10

    demandPoints.push({
      hour: h,
      forecast_mw: forecast,
      confidence_low: Math.round((forecast - margin) * 10) / 10,
      confidence_high: Math.round((forecast + margin) * 10) / 10,
    })

    totalEnergy += forecast
    if (forecast > peakLoad) { peakLoad = forecast; peakHour = h }
    if (forecast < valleyLoad) { valleyLoad = forecast; valleyHour = h }
  }

  const avgLoad = Math.round((totalEnergy / demandPoints.length) * 10) / 10
  const peakValleyRatio = peakLoad > 0 && valleyLoad > 0
    ? Math.round((peakLoad / Math.max(valleyLoad, 1)) * 100) / 100
    : 1
  const loadFactor = avgLoad > 0 && peakLoad > 0
    ? Math.round((avgLoad / peakLoad) * 10000) / 100
    : 0

  const riskLevel: DemandForecastResult['risk_level'] =
    peakValleyRatio > 3 ? 'critical' :
    peakValleyRatio > 2.5 ? 'high' :
    peakValleyRatio > 1.8 ? 'medium' : 'low'

  const recommendations: string[] = []
  if (peakValleyRatio > 2.5) {
    recommendations.push('Peak valley ratio (' + peakValleyRatio.toFixed(2) + ') indicates need for demand response programs')
  }
  if (loadFactor < 60) {
    recommendations.push('Low load factor (' + loadFactor.toFixed(1) + '%) suggests potential for load shifting')
  }
  recommendations.push('Deploy time-of-use pricing to incentivize off-peak consumption')
  recommendations.push('Consider battery storage for peak shaving applications')
  if (input.season === 'summer') {
    recommendations.push('Implement direct load control for HVAC systems during peak hours')
  }

  return {
    region_id: input.region_id,
    forecast_horizon_hours: input.forecast_horizon_hours,
    demand_points: demandPoints,
    peak_valley: {
      peak_hour: peakHour,
      peak_load_mw: Math.round(peakLoad * 10) / 10,
      valley_hour: valleyHour,
      valley_load_mw: Math.round(valleyLoad * 10) / 10,
      peak_valley_ratio: peakValleyRatio,
      load_factor_pct: loadFactor,
    },
    total_energy_mwh: Math.round(totalEnergy * 10) / 10,
    avg_load_mw: avgLoad,
    max_load_mw: Math.round(peakLoad * 10) / 10,
    min_load_mw: Math.round(valleyLoad * 10) / 10,
    mape_pct: Math.round(rng.nextFloat(1.5, 5.0) * 100) / 100,
    risk_level: riskLevel,
    recommendations,
  }
}

// --- Tool 3: Renewable Integration Planner ---
function analyzeRenewableIntegration(input: RenewableIntegrationInput): RenewableIntegrationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const totalRenewable = input.current_renewable_mw + input.solar_capacity_mw + input.wind_capacity_mw
  const renewablePenetration = Math.round((totalRenewable / Math.max(input.grid_capacity_mw, 1)) * 10000) / 100

  const thermalLimit = input.grid_capacity_mw * 1.2
  const voltageRiseLimit = input.grid_capacity_mw * 0.4
  const shortCircuitLimit = input.interconnection_limit_mw * 1.5

  const limits = [
    { name: 'Thermal', value: thermalLimit },
    { name: 'Voltage Rise', value: voltageRiseLimit },
    { name: 'Short Circuit', value: shortCircuitLimit },
  ].sort((a, b) => a.value - b.value)

  const binding = limits[0]
  const maxHostingCapacity = Math.round(binding.value * 100) / 100
  const availableHeadroom = Math.round((maxHostingCapacity - totalRenewable) * 100) / 100

  const expansionFactor = input.storage_proposed_mwh > 0 ? 1.3 : input.storage_existing_mwh > 0 ? 1.1 : 1.0
  const hostingBoosted = Math.round(maxHostingCapacity * expansionFactor * 100) / 100

  const curtailmentStrategies: CurtailmentStrategy[] = [
    {
      strategy: 'Energy storage shifting',
      curtailment_reduction_pct: Math.round(rng.nextFloat(15, 35) * 100) / 100,
      implementation_cost_usd: Math.round(input.curtailment_target_pct * 50000),
      payback_years: Math.round(rng.nextFloat(4, 8) * 10) / 10,
    },
    {
      strategy: 'Demand response activation',
      curtailment_reduction_pct: Math.round(rng.nextFloat(8, 20) * 100) / 100,
      implementation_cost_usd: Math.round(input.curtailment_target_pct * 20000),
      payback_years: Math.round(rng.nextFloat(2, 4) * 10) / 10,
    },
    {
      strategy: 'Grid-enhancing technologies',
      curtailment_reduction_pct: Math.round(rng.nextFloat(10, 25) * 100) / 100,
      implementation_cost_usd: Math.round(input.curtailment_target_pct * 35000),
      payback_years: Math.round(rng.nextFloat(3, 6) * 10) / 10,
    },
    {
      strategy: 'Dynamic line rating',
      curtailment_reduction_pct: Math.round(rng.nextFloat(5, 15) * 100) / 100,
      implementation_cost_usd: Math.round(input.curtailment_target_pct * 15000),
      payback_years: Math.round(rng.nextFloat(2, 5) * 10) / 10,
    },
  ]

  const storageCapacityRecommended = input.storage_proposed_mwh > 0 ? input.storage_proposed_mwh : Math.round((input.solar_capacity_mw + input.wind_capacity_mw) * rng.nextFloat(0.2, 0.5) * 100) / 100
  const storagePowerRecommended = Math.round(storageCapacityRecommended * rng.nextFloat(0.25, 0.5) * 100) / 100

  const storagePlan: StoragePlan = {
    recommended_capacity_mwh: storageCapacityRecommended,
    recommended_power_mw: storagePowerRecommended,
    technology: input.technology === 'wind_offshore' ? 'Compressed Air Energy Storage' : 'Lithium Iron Phosphate Battery',
    services: ['Energy arbitrage', 'Frequency regulation', 'Capacity firming', 'Transmission deferral'],
    annual_revenue_usd: Math.round(storageCapacityRecommended * 50000 * rng.nextFloat(0.8, 1.5)),
    capital_cost_usd: Math.round(storageCapacityRecommended * rng.nextFloat(200, 400) * 1000),
  }

  const gridImpactScore = Math.round(Math.max(0, Math.min(100, 80 - renewablePenetration * 0.5 + input.grid_flexibility === 'high' ? 15 : input.grid_flexibility === 'medium' ? 5 : -10 + rng.nextFloat(-5, 5))) * 100) / 100
  const carbonReduction = Math.round(totalRenewable * rng.nextFloat(0.35, 0.55) * 8760 / 1000 * 100) / 100

  return {
    project_id: input.project_id,
    renewable_penetration_pct: renewablePenetration,
    integration_capacity: {
      max_hosting_capacity_mw: hostingBoosted,
      available_headroom_mw: availableHeadroom,
      thermal_limit_mw: thermalLimit,
      voltage_rise_limit_mw: voltageRiseLimit,
      short_circuit_limit_mw: shortCircuitLimit,
      binding_constraint: binding.name,
    },
    curtailment_strategies: curtailmentStrategies,
    storage_plan: storagePlan,
    grid_impact_score: gridImpactScore,
    carbon_reduction_tco2_per_year: carbonReduction,
    recommendations: [
      renewablePenetration > 50 ? 'Renewable penetration exceeds 50% — invest in synchronous condensers for inertia' : 'Renewable penetration at manageable level — continue phased expansion',
      'Deploy advanced forecasting for renewable generation to reduce curtailment',
      'Consider grid-forming inverters for hosting capacity beyond 100% peak load',
      'Evaluate multi-terminal HVDC for offshore wind integration',
    ],
  }
}

// --- Tool 4: Energy Trading Advisor ---
function analyzeEnergyTrading(input: EnergyTradingInput): EnergyTradingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const priceForecasts: PriceForecast[] = []
  let totalPrice = 0
  const prices = input.price_forecast_per_mwh.length > 0
    ? input.price_forecast_per_mwh
    : Array.from({ length: 24 }, () => 40 + rng.nextFloat(-20, 60))

  for (let h = 0; h < 24; h++) {
    const base = prices[h % prices.length]
    const volatilityAdjusted = base * (1 + input.price_volatility_pct / 100 * rng.nextFloat(-1, 1))
    const predicted = Math.round(Math.max(0, volatilityAdjusted) * 100) / 100
    const spread = predicted * (0.05 + input.price_volatility_pct / 200)
    totalPrice += predicted

    priceForecasts.push({
      hour: h,
      predicted_price: predicted,
      confidence_low: Math.round(Math.max(0, predicted - spread) * 100) / 100,
      confidence_high: Math.round((predicted + spread) * 100) / 100,
      price_driver: h >= 8 && h <= 22 ? 'Peak demand' : h >= 12 && h <= 16 ? 'Solar midday surplus' : 'Off-peak baseload',
    })
  }

  const avgPrice = totalPrice / 24
  const marginPerMwh = avgPrice - input.marginal_cost_per_mwh

  let action: TradingRecommendation['action'] = 'hold'
  let volume = 0
  const strategy: string[] = []

  if (marginPerMwh > 10 && input.risk_tolerance !== 'conservative') {
    action = 'sell'
    volume = input.generation_capacity_mw
    strategy.push('Maximize generation output for merchant sales')
  } else if (marginPerMwh < -5) {
    action = 'buy'
    volume = Math.abs(input.portfolio_position_mwh) || input.generation_capacity_mw * 0.5
    strategy.push('Purchase from market vs. self-generation')
  } else {
    action = input.price_volatility_pct > 20 && input.risk_tolerance === 'aggressive' ? 'sell' : 'hold'
    volume = action === 'sell' ? input.generation_capacity_mw * 0.7 : 0
    strategy.push('Maintain current position with hedge')
  }

  if (input.renewable_certificates > 0) {
    strategy.push('Sell excess renewable energy certificates')
  }
  if (input.carbon_allowance_t < 0) {
    strategy.push('Purchase carbon allowances before compliance deadline')
  }

  const expectedProfit = Math.round(marginPerMwh * volume * rng.nextFloat(0.6, 0.95) * 100) / 100
  const riskScore = Math.round(Math.max(1, Math.min(10,
    (input.price_volatility_pct / 5) +
    (input.risk_tolerance === 'aggressive' ? 2 : input.risk_tolerance === 'moderate' ? 0 : -1) +
    rng.nextFloat(-1, 1)
  )) * 10) / 10

  return {
    market_id: input.market_id,
    price_forecasts: priceForecasts,
    trading_recommendation: {
      action,
      volume_mw: Math.round(volume * 100) / 100,
      target_price_per_mwh: Math.round((avgPrice * (action === 'sell' ? 1.05 : 0.95)) * 100) / 100,
      strategy: strategy.join('; '),
      expected_profit_usd: expectedProfit,
      risk_score: riskScore,
    },
    portfolio_risk: {
      var_95_pct: Math.round(Math.abs(expectedProfit) * rng.nextFloat(1.5, 3.0) * 100) / 100,
      cvar_95_pct: Math.round(Math.abs(expectedProfit) * rng.nextFloat(2.0, 4.0) * 100) / 100,
      max_drawdown_pct: Math.round(rng.nextFloat(5, 20) * 100) / 100,
      sharpe_ratio: Math.round(rng.nextFloat(0.5, 2.5) * 100) / 100,
      exposure_mwh: Math.round(Math.abs(input.portfolio_position_mwh) * rng.nextFloat(0.8, 1.2) * 100) / 100,
    },
    expected_revenue_usd: Math.round(expectedProfit + input.portfolio_position_mwh * avgPrice * 0.1),
    market_clearing_probability: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100,
    regulatory_compliance: input.market_type === 'day_ahead'
      ? 'Comply with FERC Order 2222 and state RPS requirements'
      : 'Follow NERC reliability standards and market rules',
    renewable_certificate_position: input.renewable_certificates > 0
      ? 'Long ' + input.renewable_certificates + ' RECs — consider selling excess'
      : 'No RECs held — evaluate purchase for compliance',
    carbon_exposure: input.carbon_allowance_t >= 0
      ? 'Carbon-neutral position maintained'
      : 'Carbon deficit of ' + Math.abs(input.carbon_allowance_t) + ' tonnes — purchase allowances',
    recommendations: [
      'Diversify trading across day-ahead and real-time markets',
      'Hedge price exposure with financial transmission rights (FTRs)',
      'Monintor ancillary service markets for additional revenue',
      'Implement automated trading algorithms for real-time optimization',
    ],
  }
}

// --- Tool 5: Outage Management Coordinator ---
function analyzeOutageManagement(input: OutageManagementInput): OutageManagementResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const switchesToOperate: FaultIsolation['switches_to_operate'] = []
  const sectionsIsolated: string[] = []
  let customersIsolated = Math.round(input.affected_customers * rng.nextFloat(0.3, 0.6))

  for (let i = 0; i < rng.nextInt(2, 5); i++) {
    const action: 'open' | 'close' = i % 2 === 0 ? 'open' : 'close'
    switchesToOperate.push({
      switch_id: 'SW_' + String(i + 1).padStart(3, '0'),
      action,
      location: 'Section_' + String.fromCharCode(65 + i),
    })
  }

  for (let i = 0; i < rng.nextInt(1, 4); i++) {
    sectionsIsolated.push('SEC_' + String.fromCharCode(65 + i))
  }

  const isolationTimeMin = Math.round(rng.nextFloat(2, 15) * (input.scada_status === 'online' ? 0.5 : 2))

  const restorationSteps: RestorationPlan['steps'] = []
  let remainingCustomers = input.affected_customers
  let stepNum = 1
  const customersRestoredPerStep: number[] = []

  while (remainingCustomers > 0 && stepNum <= 8) {
    const crewNeeded = rng.nextInt(1, input.crew_available)
    const duration = Math.round(rng.nextFloat(15, 60))
    const restored = Math.min(remainingCustomers, Math.round(remainingCustomers * rng.nextFloat(0.2, 0.5)))
    remainingCustomers -= restored
    customersRestoredPerStep.push(restored)

    restorationSteps.push({
      step: stepNum,
      action: stepNum <= 2
        ? 'Isolate fault and energize backup feeders'
        : stepNum <= 4
          ? 'Repair primary equipment'
          : 'Verify system integrity and restore remaining load',
      crew_required: crewNeeded,
      duration_min: duration,
    })
    stepNum++
  }

  const totalRestorationTime = restorationSteps.reduce((s, step) => s + step.duration_min, 0)

  const crewDispatches: CrewDispatch[] = []
  for (let i = 0; i < Math.min(input.crew_available, 4); i++) {
    crewDispatches.push({
      crew_id: 'CREW_' + String(i + 1).padStart(3, '0'),
      crew_size: rng.nextInt(2, 5),
      estimated_arrival_min: Math.round(rng.nextFloat(10, 45) * (input.weather_conditions === 'storm' ? 1.5 : 1)),
      assigned_task: i === 0 ? 'Fault assessment and isolation' : i === 1 ? 'Equipment repair' : i === 2 ? 'Switching operations' : 'Standby/support',
      travel_distance_km: Math.round(rng.nextFloat(2, 20) * 10) / 10,
      equipment_needed: ['Safety gear', i === 0 ? 'Fault locator' : 'Replacement parts', 'Communication radio'],
    })
  }

  const cmi = input.affected_customers * totalRestorationTime
  const saifi = Math.round((input.affected_customers / 10000) * 1000) / 1000
  const saidi = Math.round((cmi / 10000) * 10) / 10
  const caidi = Math.round((cmi / Math.max(input.affected_customers, 1)) * 10) / 10

  const priorityRestored = input.priority_customers.filter(() => rng.next() > 0.3)

  return {
    outage_id: input.outage_id,
    fault_isolation: {
      switches_to_operate: switchesToOperate,
      isolated_sections: sectionsIsolated,
      customers_isolated: customersIsolated,
      isolation_time_estimate_min: isolationTimeMin,
    },
    restoration_plan: {
      steps: restorationSteps,
      total_restoration_time_min: totalRestorationTime,
      customers_restored_per_step: customersRestoredPerStep,
      priority_restoration: priorityRestored.length > 0 ? priorityRestored : ['Hospital', 'Emergency services', 'Water treatment'],
      mutual_aid_required: input.affected_customers > 5000 && input.crew_available < 3,
    },
    crew_dispatches: crewDispatches,
    saifi_impact: saifi,
    saidi_impact: saidi,
    caidi_impact: caidi,
    customer_minutes_interrupted: cmi,
    priority_customers_restored: priorityRestored.length > 0,
    recommendations: [
      'Deploy fault circuit indicators to reduce patrol time',
      'Implement automated feeder restoration (AFS) for faster recovery',
      'Pre-position mobile substations for large outage scenarios',
      'Establish mutual aid agreements with neighboring utilities',
    ],
  }
}

// --- Tool 6: Power Quality Analyzer ---
function analyzePowerQuality(input: PowerQualityInput): PowerQualityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const m = input.measurements
  const avgVoltage = (m.voltage_l1_v + m.voltage_l2_v + m.voltage_l3_v) / 3
  const voltageDeviations = [
    Math.abs(m.voltage_l1_v - avgVoltage),
    Math.abs(m.voltage_l2_v - avgVoltage),
    Math.abs(m.voltage_l3_v - avgVoltage),
  ]
  const maxDeviation = Math.max(...voltageDeviations)
  const unbalancePct = Math.round((maxDeviation / Math.max(avgVoltage, 1)) * 10000) / 100
  const deviationPct = Math.round((avgVoltage - input.voltage_level_kv * 1000) / (input.voltage_level_kv * 1000) * 10000) / 100

  const nominalVoltage = input.voltage_level_kv * 1000
  const voltCompliance: VoltageAnalysis['compliance'] =
    Math.abs(deviationPct) > 10 || unbalancePct > 3 ? 'violation' :
    Math.abs(deviationPct) > 5 || unbalancePct > 2 ? 'marginal' : 'compliant'

  const h = input.harmonic_data
  const thdVoltage = Math.round(Math.sqrt(h.h3_pct ** 2 + h.h5_pct ** 2 + h.h7_pct ** 2 + h.h9_pct ** 2 + h.h11_pct ** 2 + h.h13_pct ** 2) * 100) / 100

  const harmonicValues = [
    { order: 3, value: h.h3_pct },
    { order: 5, value: h.h5_pct },
    { order: 7, value: h.h7_pct },
    { order: 9, value: h.h9_pct },
    { order: 11, value: h.h11_pct },
    { order: 13, value: h.h13_pct },
  ]
  const dominant = harmonicValues.reduce((max, cur) => cur.value > max.value ? cur : max, harmonicValues[0])

  const thdVoltageLimit = input.standard === 'ieee_519' ? 5 : input.standard === 'en_50160' ? 8 : 6
  const harmonicCompliance: HarmonicAnalysis['compliance'] =
    thdVoltage > thdVoltageLimit * 1.5 ? 'violation' :
    thdVoltage > thdVoltageLimit ? 'marginal' : 'compliant'

  const apparentPower = Math.sqrt(m.active_power_kw ** 2 + m.reactive_power_kvar ** 2)
  const powerFactor = Math.round((m.active_power_kw / Math.max(apparentPower, 1)) * 100) / 100
  const displacementPF = Math.round(Math.cos(Math.atan2(m.reactive_power_kvar, m.active_power_kw)) * 100) / 100
  const distortionPF = Math.round((1 / Math.sqrt(1 + (thdVoltage / 100) ** 2)) * 10000) / 10000
  const targetPF = 0.95
  const compensationNeeded = Math.round(Math.max(0, m.active_power_kw * (Math.tan(Math.acos(displacementPF)) - Math.tan(Math.acos(targetPF))) * 100)) / 100

  const flickerLimit = input.standard === 'en_50160' ? 1.0 : 0.9
  const flickerCompliance: PowerQualityResult['flicker_compliance'] =
    input.flicker_plt > flickerLimit ? 'fail' : 'pass'

  const overallPQIndex = Math.round(Math.max(0, Math.min(100,
    100 - (voltCompliance === 'violation' ? 30 : voltCompliance === 'marginal' ? 15 : 0)
    - (harmonicCompliance === 'violation' ? 25 : harmonicCompliance === 'marginal' ? 12 : 0)
    - (powerFactor < 0.9 ? 15 : powerFactor < 0.95 ? 8 : 0)
    - (flickerCompliance === 'fail' ? 10 : 0)
  )) * 100) / 100

  const overallCompliance: PowerQualityResult['overall_compliance'] =
    voltCompliance === 'violation' || harmonicCompliance === 'violation' ? 'violation' :
    voltCompliance === 'marginal' || harmonicCompliance === 'marginal' ? 'marginal' : 'compliant'

  const revenueImpact = overallCompliance === 'violation'
    ? Math.round(rng.nextFloat(5000, 50000))
    : overallCompliance === 'marginal'
      ? Math.round(rng.nextFloat(1000, 10000))
      : 0

  return {
    monitoring_point_id: input.monitoring_point_id,
    voltage_analysis: {
      avg_voltage_v: Math.round(avgVoltage * 10) / 10,
      unbalance_pct: unbalancePct,
      deviation_from_nominal_pct: deviationPct,
      sag_count: rng.nextInt(0, 5),
      swell_count: rng.nextInt(0, 3),
      compliance: voltCompliance,
    },
    harmonic_analysis: {
      thd_voltage_pct: thdVoltage,
      thd_current_pct: Math.round(thdVoltage * rng.nextFloat(1.5, 3.0) * 100) / 100,
      dominant_harmonic: dominant.order,
      dominant_harmonic_pct: dominant.value,
      resonance_risk: thdVoltage > thdVoltageLimit * 0.8 && dominant.order === 5,
      compliance: harmonicCompliance,
      filter_recommendation: harmonicCompliance === 'violation'
        ? 'Install active harmonic filter targeting ' + dominant.order + 'th harmonic'
        : harmonicCompliance === 'marginal'
          ? 'Consider detuned passive filter for future-proofing'
          : 'No immediate filter action required',
    },
    power_factor_analysis: {
      power_factor: powerFactor,
      displacement_pf: displacementPF,
      distortion_pf: distortionPF,
      target_pf: targetPF,
      penalty_risk: powerFactor < 0.9,
      compensation_kvar_needed: compensationNeeded,
    },
    flicker_compliance: flickerCompliance,
    overall_pq_index: overallPQIndex,
    overall_compliance: overallCompliance,
    revenue_impact_usd: revenueImpact,
    recommendations: [
      voltCompliance !== 'compliant' ? 'Adjust transformer taps to improve voltage profile' : 'Voltage profile within acceptable range',
      harmonicCompliance !== 'compliant' ? 'Install harmonic mitigation equipment' : 'Harmonic levels acceptable',
      powerFactor < 0.95 ? 'Install capacitor bank to achieve target PF of ' + targetPF : 'Power factor meets utility requirements',
      flickerCompliance === 'fail' ? 'Investigate arc furnace or large motor starting as flicker source' : 'Flicker within limits',
    ],
  }
}

// --- Tool 7: Energy Storage Optimizer ---
function analyzeEnergyStorage(input: EnergyStorageInput): EnergyStorageResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const prices = input.electricity_prices.length > 0
    ? input.electricity_prices
    : Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        price_per_mwh: h >= 10 && h <= 22 ? 60 + rng.nextFloat(-10, 30) : 30 + rng.nextFloat(-5, 10),
      }))

  const sortedPrices = [...prices].sort((a, b) => a.price_per_mwh - b.price_per_mwh)
  const lowestHours = sortedPrices.slice(0, Math.ceil(24 * 0.35))
  const highestHours = sortedPrices.slice(-Math.ceil(24 * 0.3))

  const storageSchedule: StorageSchedule[] = []
  let soc = 50
  let totalRevenue = 0

  for (const p of prices) {
    const isLowPeriod = lowestHours.some(h => h.hour === p.hour) && soc < (input.dod_limit_pct / 100 * 100 - 5)
    const isHighPeriod = highestHours.some(hour => hour.hour === p.hour) && soc > (100 - input.dod_limit_pct - 5)

    const action: StorageSchedule['action'] = isLowPeriod && soc < 95 ? 'charge' : isHighPeriod && soc > 15 ? 'discharge' : 'idle'
    const power = action === 'charge' ? input.power_rating_mw * 0.9 : action === 'discharge' ? input.power_rating_mw * 0.85 : 0
    const energy = power / input.capacity_mwh * 100

    if (action === 'charge') soc = Math.min(100, soc + energy)
    if (action === 'discharge') soc = Math.max(10, soc - energy)

    const revenue = action === 'discharge' ? power * p.price_per_mwh / 1000
      : action === 'charge' ? -power * p.price_per_mwh / 1000 * (2 - input.round_trip_efficiency_pct / 100)
      : 0
    totalRevenue += revenue

    storageSchedule.push({
      hour: p.hour,
      action,
      power_mw: Math.round(power * 100) / 100,
      soc_pct: Math.round(soc),
      service: action !== 'idle' ? 'Energy arbitrage' : 'Standby',
      revenue_usd: Math.round(revenue * 100) / 100,
    })
  }

  const cyclesPerYear = 300 + rng.nextInt(0, 100)
  const annualCapacityFade = rng.nextFloat(1.5, 3.5)
  const expectedLife = Math.round((100 - 80) / annualCapacityFade * 10) / 10
  const replacementYear = Math.round(expectedLife * 0.9)
  const demandChargeSavings = input.power_rating_mw * 1000 * input.demand_charge_per_kw

  const annualRevenue = Math.round(totalRevenue * 365 * (1 + input.grid_service_market_prices.frequency_regulation / 1000))
  const capitalCost = Math.round(input.capacity_mwh * input.capital_cost_per_kwh * 1000)
  const annualOMCost = Math.round(input.capacity_mwh * input.om_cost_per_kwh_year * 1000)
  const netAnnual = annualRevenue - annualOMCost

  const paybackPeriod = netAnnual > 0 ? Math.round(capitalCost / netAnnual * 10) / 10 : 99.9
  const npv = netAnnual > 0
    ? Math.round((netAnnual * Math.min(expectedLife, 15) - capitalCost) * (1 - rng.nextFloat(0, 0.2)))
    : -capitalCost

  const irr = netAnnual > 0
    ? Math.round((Math.pow(1 + netAnnual / Math.max(capitalCost, 1), 1 / Math.min(expectedLife, 15)) - 1) * 10000) / 100
    : 0

  const lcos = Math.round((capitalCost / Math.min(expectedLife, 15) + annualOMCost + input.capacity_mwh * 1000 * cyclesPerYear * 0.01) / (input.capacity_mwh * cyclesPerYear * input.round_trip_efficiency_pct / 100) * 100) / 100

  const servicesRevenue = [
    { service: 'Energy arbitrage', annual_revenue_usd: Math.round(annualRevenue * 0.45), utilization_pct: 70 },
    { service: 'Frequency regulation', annual_revenue_usd: Math.round(annualRevenue * 0.25), utilization_pct: 40 },
    { service: 'Demand charge reduction', annual_revenue_usd: Math.round(demandChargeSavings * 0.2 * 12), utilization_pct: 100 },
    { service: 'Capacity market', annual_revenue_usd: Math.round(input.power_rating_mw * input.grid_service_market_prices.capacity * 12), utilization_pct: 20 },
  ]

  const gridBenefitScore = Math.round(Math.min(100, Math.max(0,
    60 + (input.round_trip_efficiency_pct - 80) * 0.5 +
    (input.cycle_life / 100) * 0.3 +
    (expectedLife - 8) * 2 +
    rng.nextFloat(-5, 5)
  )) * 100) / 100

  return {
    project_id: input.project_id,
    optimal_capacity_mwh: input.capacity_mwh,
    optimal_power_mw: input.power_rating_mw,
    storage_schedule: storageSchedule,
    economic_analysis: {
      annual_revenue_usd: annualRevenue,
      annual_om_cost_usd: annualOMCost,
      net_annual_benefit_usd: netAnnual,
      capital_cost_usd: capitalCost,
      payback_period_years: paybackPeriod,
      net_present_value_usd: npv,
      internal_rate_of_return_pct: irr,
      levelized_cost_per_mwh: lcos,
    },
    degradation_profile: {
      annual_capacity_fade_pct: Math.round(annualCapacityFade * 100) / 100,
      cycles_per_year: cyclesPerYear,
      expected_life_years: expectedLife,
      replacement_threshold_pct: 80,
      replacement_year: replacementYear,
    },
    services_revenue_breakdown: servicesRevenue,
    grid_benefit_score: gridBenefitScore,
    recommendations: [
      paybackPeriod > 10 ? 'Payback period exceeds 10 years — consider alternative revenue streams' : 'Payback period of ' + paybackPeriod.toFixed(1) + ' years is financially viable',
      'Optimize dispatch strategy to capture highest-value service stacking',
      'Monitor SOH degradation and adjust dispatch depth annually',
      'Evaluate participation in wholesale capacity markets for additional revenue',
      'Consider second-life battery deployment after ' + expectedLife.toFixed(0) + ' years of grid service',
    ],
  }
}

// --- Tool 8: Utility Bill Analyzer ---
function analyzeUtilityBill(input: UtilityBillInput): UtilityBillResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const effectiveRate = input.total_bill_usd / Math.max(input.consumption_kwh, 1)
  const costPerSqft = input.facility_type === 'commercial' || input.facility_type === 'industrial'
    ? Math.round(effectiveRate * 12 * rng.nextFloat(0.5, 1.5) * 1000) / 1000
    : Math.round(effectiveRate * 12 * 1000) / 1000
  const yearOverYearChange = Math.round(rng.nextFloat(-8, 15) * 100) / 100
  const utilityBurden = Math.round((input.total_bill_usd / Math.max(input.consumption_kwh * 0.8, 1)) * 10000) / 100

  const rateComparisons: RateComparison[] = (input.alternative_rate_schedules.length > 0
    ? input.alternative_rate_schedules
    : ['TOU-1', 'TOU-2', 'Demand Response Rate', 'Real-Time Pricing']).map((schedule, idx) => {
    const savings = Math.round(input.total_bill_usd * rng.nextFloat(0.05, 0.25) * (idx + 1) / 4)
    return {
      rate_schedule: schedule,
      estimated_annual_cost_usd: Math.round(input.total_bill_usd * 12 - savings * 12),
      annual_savings_usd: savings * 12,
      savings_pct: Math.round((savings / input.total_bill_usd) * 10000) / 100,
      demand_response_compatible: schedule.includes('TOU') || schedule.includes('Demand'),
      net_metering_compatible: schedule.includes('Solar') || schedule.includes('Net'),
    }
  })

  const savingsOpportunities: SavingsOpportunity[] = [
    {
      measure: 'LED lighting upgrade',
      annual_savings_usd: Math.round(input.consumption_kwh * input.time_of_use.peak_pct / 100 * 0.05 * 0.12),
      implementation_cost_usd: Math.round(rng.nextFloat(5000, 25000)),
      payback_years: Math.round(rng.nextFloat(1.5, 3.5) * 10) / 10,
      co2_reduction_t: Math.round(input.consumption_kwh * 0.0005 * rng.nextFloat(5, 15)),
      priority: 'high',
    },
    {
      measure: 'HVAC optimization',
      annual_savings_usd: Math.round(input.consumption_kwh * input.time_of_use.peak_pct / 100 * 0.1 * 0.15),
      implementation_cost_usd: Math.round(rng.nextFloat(10000, 50000)),
      payback_years: Math.round(rng.nextFloat(2, 5) * 10) / 10,
      co2_reduction_t: Math.round(input.consumption_kwh * 0.0005 * rng.nextFloat(8, 20)),
      priority: 'high',
    },
    {
      measure: 'Power factor correction',
      annual_savings_usd: Math.round(input.power_factor_penalty * 12 + input.demand_charges * 0.05),
      implementation_cost_usd: Math.round(rng.nextFloat(3000, 15000)),
      payback_years: Math.round(rng.nextFloat(1, 3) * 10) / 10,
      co2_reduction_t: 0,
      priority: input.power_factor_penalty > 0 ? 'high' : 'low',
    },
    {
      measure: 'Solar PV installation',
      annual_savings_usd: Math.round(input.consumption_kwh * 0.2 * 0.12),
      implementation_cost_usd: Math.round(rng.nextFloat(50000, 200000)),
      payback_years: Math.round(rng.nextFloat(5, 10) * 10) / 10,
      co2_reduction_t: Math.round(input.consumption_kwh * 0.2 * 0.0005),
      priority: 'medium',
    },
    {
      measure: 'Battery storage for demand shaving',
      annual_savings_usd: Math.round(input.demand_charges * 0.15),
      implementation_cost_usd: Math.round(rng.nextFloat(20000, 100000)),
      payback_years: Math.round(rng.nextFloat(4, 8) * 10) / 10,
      co2_reduction_t: Math.round(input.consumption_kwh * 0.0001),
      priority: input.demand_charges > input.energy_charges * 0.3 ? 'high' : 'medium',
    },
    {
      measure: 'Energy management system (EMS)',
      annual_savings_usd: Math.round(input.total_bill_usd * rng.nextFloat(0.05, 0.12)),
      implementation_cost_usd: Math.round(rng.nextFloat(5000, 30000)),
      payback_years: Math.round(rng.nextFloat(1, 3) * 10) / 10,
      co2_reduction_t: Math.round(input.consumption_kwh * 0.0003 * rng.nextFloat(5, 12)),
      priority: 'medium',
    },
  ]

  const totalPotentialSavings = savingsOpportunities.reduce((s, o) => s + o.annual_savings_usd, 0)
  const totalBillAnnual = input.total_bill_usd * 12
  const totalSavingsPct = Math.round((totalPotentialSavings / Math.max(totalBillAnnual, 1)) * 10000) / 100

  const co2Footprint = Math.round(input.consumption_kwh * 0.0005 * 12 * 100) / 100

  const billingErrors: string[] = []
  if (input.demand_kw > input.peak_demand_kw * 1.1) {
    billingErrors.push('Billing demand exceeds peak demand recorded — verify meter data')
  }
  if (input.power_factor_penalty > input.energy_charges * 0.1) {
    billingErrors.push('Power factor penalty exceeds 10% of energy charges — investigate correction')
  }
  if (input.taxes_and_fees > input.total_bill_usd * 0.2) {
    billingErrors.push('Taxes and fees exceed 20% of total bill — verify jurisdictional rates')
  }

  const bestRate = rateComparisons.length > 0
    ? rateComparisons.reduce((best, cur) => cur.annual_savings_usd > best.annual_savings_usd ? cur : best)
    : null

  return {
    account_id: input.account_id,
    current_bill_analysis: {
      current_effective_rate_per_kwh: Math.round(effectiveRate * 10000) / 10000,
      cost_per_sqft_usd: costPerSqft,
      energy_cost_per_unit_production: Math.round(effectiveRate * 1000) / 1000,
      utility_burden_pct: utilityBurden,
      year_over_year_change_pct: yearOverYearChange,
    },
    rate_comparisons: rateComparisons,
    savings_opportunities: savingsOpportunities,
    total_potential_savings_usd: totalPotentialSavings,
    total_potential_savings_pct: totalSavingsPct,
    co2_footprint_t: co2Footprint,
    benchmark_comparison: yearOverYearChange > 10
      ? 'Utility costs increasing significantly — immediate audit recommended'
      : yearOverYearChange > 0
        ? 'Moderate cost increase — monitor and implement efficiency measures'
        : 'Costs stable or declining — current trajectory favorable',
    billing_errors_detected: billingErrors.length > 0 ? billingErrors : ['No obvious billing anomalies detected'],
    recommendations: [
      bestRate ? 'Switch to ' + bestRate.rate_schedule + ' for estimated annual savings of $' + bestRate.annual_savings_usd : 'Evaluate alternative rate schedules for potential savings',
      totalSavingsPct > 20 ? 'High savings potential (' + totalSavingsPct.toFixed(1) + '%) — prioritize implementation' : 'Moderate savings available through efficiency measures',
      'Install submetering to identify department-level consumption patterns',
      'Consider on-site generation to reduce demand charges and energy costs',
      'Enroll in utility demand response programs for bill credits',
    ],
  }
}

// ==================== SECTION 4 -- Report Formatting Functions ====================

function formatGridOptimizationReport(r: GridOptimizationResult): string {
  const lines: string[] = []
  lines.push('## Grid Optimization Engine Report')
  lines.push('')
  lines.push('Grid: ' + r.grid_id + ' | Optimization Score: ' + r.optimization_score + '/100 | Loss Potential Reduction: ' + r.loss_reduction_potential_pct + '%')
  lines.push('Total Losses: ' + r.power_flow.total_losses_mw + ' MW (' + r.power_flow.losses_pct + '%) | Voltage Violations: ' + r.voltage_violations + ' | Convergence: ' + r.power_flow.convergence_status)
  lines.push('')

  lines.push('### Power Flow Summary')
  lines.push('| Total Losses (MW) | Losses (%) | Voltage Violations | Convergence |')
  lines.push('|-------------------|-----------|-------------------|-------------|')
  lines.push('| ' + r.power_flow.total_losses_mw + ' | ' + r.power_flow.losses_pct + '% | ' + r.voltage_violations + ' | ' + r.power_flow.convergence_status + ' |')
  lines.push('')

  lines.push('### Volt/VAR Controls')
  lines.push('| Device | Type | Setting | Action | Impact (pu) |')
  lines.push('|--------|------|---------|--------|-----------|')
  for (const vvc of r.volt_var_controls) {
    lines.push('| ' + vvc.device_id + ' | ' + vvc.device_type + ' | ' + vvc.setting + ' | ' + vvc.action + ' | ' + vvc.impact_voltage_pu + ' |')
  }
  lines.push('')

  lines.push('### Reliability Assessment')
  lines.push('- ' + r.reliability_assessment)
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

function formatDemandForecastReport(r: DemandForecastResult): string {
  const lines: string[] = []
  lines.push('## Demand Forecasting Modeler Report')
  lines.push('')
  lines.push('Region: ' + r.region_id + ' | Horizon: ' + r.forecast_horizon_hours + 'h | MAPE: ' + r.mape_pct + '% | Risk: ' + r.risk_level)
  lines.push('Peak: ' + r.peak_valley.peak_load_mw + ' MW @ Hour ' + r.peak_valley.peak_hour + ' | Valley: ' + r.peak_valley.valley_load_mw + ' MW @ Hour ' + r.peak_valley.valley_hour)
  lines.push('Load Factor: ' + r.peak_valley.load_factor_pct + '% | Peak/Valley Ratio: ' + r.peak_valley.peak_valley_ratio)
  lines.push('')

  lines.push('### Demand Forecast')
  lines.push('| Hour | Forecast (MW) | Low (MW) | High (MW) |')
  lines.push('|------|--------------|---------|----------|')
  for (const dp of r.demand_points.slice(0, 30)) {
    lines.push('| ' + dp.hour + ' | ' + dp.forecast_mw + ' | ' + dp.confidence_low + ' | ' + dp.confidence_high + ' |')
  }
  if (r.demand_points.length > 30) {
    lines.push('| ... (' + (r.demand_points.length - 30) + ' more) |')
  }
  lines.push('')

  lines.push('### Aggregate Statistics')
  lines.push('| Total Energy (MWh) | Avg Load (MW) | Max (MW) | Min (MW) |')
  lines.push('|--------------------|---------------|---------|---------|')
  lines.push('| ' + r.total_energy_mwh + ' | ' + r.avg_load_mw + ' | ' + r.max_load_mw + ' | ' + r.min_load_mw + ' |')
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

function formatRenewableIntegrationReport(r: RenewableIntegrationResult): string {
  const lines: string[] = []
  lines.push('## Renewable Integration Planner Report')
  lines.push('')
  lines.push('Project: ' + r.project_id + ' | Renewable Penetration: ' + r.renewable_penetration_pct + '% | Grid Impact: ' + r.grid_impact_score + '/100')
  lines.push('Max Hosting Capacity: ' + r.integration_capacity.max_hosting_capacity_mw + ' MW | Available Headroom: ' + r.integration_capacity.available_headroom_mw + ' MW')
  lines.push('Binding Constraint: ' + r.integration_capacity.binding_constraint + ' | CO2 Reduction: ' + r.carbon_reduction_tco2_per_year + ' tCO2/year')
  lines.push('')

  lines.push('### Integration Capacity Limits')
  lines.push('| Limit Type | Capacity (MW) |')
  lines.push('|------------|--------------|')
  lines.push('| Thermal | ' + r.integration_capacity.thermal_limit_mw + ' |')
  lines.push('| Voltage Rise | ' + r.integration_capacity.voltage_rise_limit_mw + ' |')
  lines.push('| Short Circuit | ' + r.integration_capacity.short_circuit_limit_mw + ' |')
  lines.push('| Max Hosting | ' + r.integration_capacity.max_hosting_capacity_mw + ' |')
  lines.push('')

  lines.push('### Curtailment Reduction Strategies')
  lines.push('| Strategy | Reduction (%) | Cost (USD) | Payback (yr) |')
  lines.push('|----------|-------------|-----------|-------------|')
  for (const cs of r.curtailment_strategies) {
    lines.push('| ' + cs.strategy + ' | ' + cs.curtailment_reduction_pct + ' | $' + cs.implementation_cost_usd + ' | ' + cs.payback_years + ' |')
  }
  lines.push('')

  lines.push('### Storage Plan')
  lines.push('- Recommended: ' + r.storage_plan.recommended_capacity_mwh + ' MWh @ ' + r.storage_plan.recommended_power_mw + ' MW')
  lines.push('- Technology: ' + r.storage_plan.technology + ' | Services: ' + r.storage_plan.services.join(', '))
  lines.push('- Annual Revenue: $' + r.storage_plan.annual_revenue_usd + ' | Capital Cost: $' + r.storage_plan.capital_cost_usd)
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

function formatEnergyTradingReport(r: EnergyTradingResult): string {
  const lines: string[] = []
  lines.push('## Energy Trading Advisor Report')
  lines.push('')
  lines.push('Market: ' + r.market_id + ' | Action: ' + r.trading_recommendation.action.toUpperCase() + ' | Volume: ' + r.trading_recommendation.volume_mw + ' MW')
  lines.push('Target Price: $' + r.trading_recommendation.target_price_per_mwh + '/MWh | Expected Profit: $' + r.trading_recommendation.expected_profit_usd + ' | Risk Score: ' + r.trading_recommendation.risk_score + '/10')
  lines.push('')

  lines.push('### Price Forecast')
  lines.push('| Hour | Price ($/MWh) | Low | High | Driver |')
  lines.push('|------|--------------|-----|------|--------|')
  for (const pf of r.price_forecasts) {
    lines.push('| ' + pf.hour + ' | ' + pf.predicted_price + ' | ' + pf.confidence_low + ' | ' + pf.confidence_high + ' | ' + pf.price_driver + ' |')
  }
  lines.push('')

  lines.push('### Trading Signal')
  lines.push('| Field | Value |')
  lines.push('|-------|------|')
  lines.push('| Action | ' + r.trading_recommendation.action + ' |')
  lines.push('| Strategy | ' + r.trading_recommendation.strategy + ' |')
  lines.push('| Risk Score | ' + r.trading_recommendation.risk_score + ' |')
  lines.push('| Clearing Probability | ' + r.market_clearing_probability + ' |')
  lines.push('')

  lines.push('### Portfolio Risk')
  lines.push('| VaR 95% | CVaR 95% | Max Drawdown | Sharpe Ratio | Exposure (MWh) |')
  lines.push('|---------|----------|-------------|-------------|---------------|')
  lines.push('| $' + r.portfolio_risk.var_95_pct + ' | $' + r.portfolio_risk.cvar_95_pct + ' | ' + r.portfolio_risk.max_drawdown_pct + '% | ' + r.portfolio_risk.sharpe_ratio + ' | ' + r.portfolio_risk.exposure_mwh + ' |')
  lines.push('')

  lines.push('### Compliance & Environmental')
  lines.push('- ' + r.regulatory_compliance)
  lines.push('- REC Position: ' + r.renewable_certificate_position)
  lines.push('- Carbon: ' + r.carbon_exposure)
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

function formatOutageManagementReport(r: OutageManagementResult): string {
  const lines: string[] = []
  lines.push('## Outage Management Coordinator Report')
  lines.push('')
  lines.push('Outage: ' + r.outage_id + ' | Restoration Time: ' + r.restoration_plan.total_restoration_time_min + ' min | Customers Affected: ' + r.fault_isolation.customers_isolated)
  lines.push('Priority Customers Restored: ' + (r.priority_customers_restored ? 'Yes' : 'No') + ' | Mutual Aid: ' + (r.restoration_plan.mutual_aid_required ? 'Required' : 'Not Required'))
  lines.push('')

  lines.push('### Fault Isolation')
  lines.push('| Switch | Action | Location |')
  lines.push('|--------|--------|---------|')
  for (const sw of r.fault_isolation.switches_to_operate) {
    lines.push('| ' + sw.switch_id + ' | ' + sw.action + ' | ' + sw.location + ' |')
  }
  lines.push('- Isolated Sections: ' + r.fault_isolation.isolated_sections.join(', '))
  lines.push('- Isolation Time Estimate: ' + r.fault_isolation.isolation_time_estimate_min + ' min')
  lines.push('')

  lines.push('### Restoration Plan')
  lines.push('| Step | Action | Crew | Duration (min) |')
  lines.push('|------|--------|------|----------------|')
  for (const step of r.restoration_plan.steps) {
    lines.push('| ' + step.step + ' | ' + step.action + ' | ' + step.crew_required + ' | ' + step.duration_min + ' |')
  }
  lines.push('')

  lines.push('### Crew Dispatch')
  lines.push('| Crew | Size | Arrival (min) | Task | Distance (km) |')
  lines.push('|------|------|--------------|------|---------------|')
  for (const crew of r.crew_dispatches) {
    lines.push('| ' + crew.crew_id + ' | ' + crew.crew_size + ' | ' + crew.estimated_arrival_min + ' | ' + crew.assigned_task + ' | ' + crew.travel_distance_km + ' |')
  }
  lines.push('')

  lines.push('### Reliability Impact')
  lines.push('| SAIFI | SAIDI | CAIDI | Customer-Minutes |')
  lines.push('|--------|-------|-------|-----------------|')
  lines.push('| ' + r.saifi_impact + ' | ' + r.saidi_impact + ' | ' + r.caidi_impact + ' | ' + r.customer_minutes_interrupted + ' |')
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

function formatPowerQualityReport(r: PowerQualityResult): string {
  const lines: string[] = []
  lines.push('## Power Quality Analyzer Report')
  lines.push('')
  lines.push('Monitoring Point: ' + r.monitoring_point_id + ' | Overall PQ Index: ' + r.overall_pq_index + '/100 | Compliance: ' + r.overall_compliance)
  lines.push('Voltage: ' + r.voltage_analysis.compliance + ' | Harmonics: ' + r.harmonic_analysis.compliance + ' | Power Factor: ' + (r.power_factor_analysis.penalty_risk ? 'Below Target' : 'Acceptable') + ' | Flicker: ' + r.flicker_compliance.toUpperCase())
  lines.push('')

  lines.push('### Voltage Analysis')
  lines.push('| Avg Voltage (V) | Unbalance (%) | Deviation (%) | Sags | Swells | Status |')
  lines.push('|-----------------|--------------|---------------|------|--------|--------|')
  lines.push('| ' + r.voltage_analysis.avg_voltage_v + ' | ' + r.voltage_analysis.unbalance_pct + ' | ' + r.voltage_analysis.deviation_from_nominal_pct + ' | ' + r.voltage_analysis.sag_count + ' | ' + r.voltage_analysis.swell_count + ' | ' + r.voltage_analysis.compliance + ' |')
  lines.push('')

  lines.push('### Harmonic Analysis')
  lines.push('| THV V (%) | THD I (%) | Dominant | Resonance Risk | Status |')
  lines.push('|----------|----------|----------|---------------|--------|')
  lines.push('| ' + r.harmonic_analysis.thd_voltage_pct + ' | ' + r.harmonic_analysis.thd_current_pct + ' | ' + r.harmonic_analysis.dominant_harmonic + 'th (' + r.harmonic_analysis.dominant_harmonic_pct + '%) | ' + (r.harmonic_analysis.resonance_risk ? 'YES' : 'No') + ' | ' + r.harmonic_analysis.compliance + ' |')
  lines.push('- Filter Recommendation: ' + r.harmonic_analysis.filter_recommendation)
  lines.push('')

  lines.push('### Power Factor Analysis')
  lines.push('| PF | Displacement PF | Distortion PF | Target | Compensation (kVAR) |')
  lines.push('|----|-----------------|---------------|--------|---------------------|')
  lines.push('| ' + r.power_factor_analysis.power_factor + ' | ' + r.power_factor_analysis.displacement_pf + ' | ' + r.power_factor_analysis.distortion_pf + ' | ' + r.power_factor_analysis.target_pf + ' | ' + r.power_factor_analysis.compensation_kvar_needed + ' |')
  lines.push('')

  lines.push('### Revenue Impact')
  lines.push('- Estimated revenue impact of PQ issues: $' + r.revenue_impact_usd)
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

function formatEnergyStorageReport(r: EnergyStorageResult): string {
  const lines: string[] = []
  lines.push('## Energy Storage Optimizer Report')
  lines.push('')
  lines.push('Project: ' + r.project_id + ' | Capacity: ' + r.optimal_capacity_mwh + ' MWh | Power: ' + r.optimal_power_mw + ' MW')
  lines.push('Grid Benefit: ' + r.grid_benefit_score + '/100 | Payback: ' + r.economic_analysis.payback_period_years + ' years | NPV: $' + r.economic_analysis.net_present_value_usd)
  lines.push('')

  lines.push('### Storage Dispatch Schedule')
  lines.push('| Hour | Action | Power (MW) | SOC (%) | Service | Revenue ($) |')
  lines.push('|------|--------|-----------|---------|---------|------------|')
  for (const s of r.storage_schedule) {
    lines.push('| ' + s.hour + ' | ' + s.action + ' | ' + s.power_mw + ' | ' + s.soc_pct + ' | ' + s.service + ' | ' + s.revenue_usd + ' |')
  }
  lines.push('')

  lines.push('### Economic Analysis')
  lines.push('| Annual Revenue | Annual O&M | Net Benefit | Capital Cost | Payback (yr) | NPV | IRR (%) | LCOS ($/MWh) | ')
  lines.push('|-----------------|-----------|-------------|-------------|-------------|-----|---------|-------------|')
  lines.push('| $' + r.economic_analysis.annual_revenue_usd + ' | $' + r.economic_analysis.annual_om_cost_usd + ' | $' + r.economic_analysis.net_annual_benefit_usd + ' | $' + r.economic_analysis.capital_cost_usd + ' | ' + r.economic_analysis.payback_period_years + ' years | $' + r.economic_analysis.net_present_value_usd + ' | ' + r.economic_analysis.internal_rate_of_return_pct + '% | $' + r.economic_analysis.levelized_cost_per_mwh + ' |')
  lines.push('')

  lines.push('### Degradation Profile')
  lines.push('- Annual fade: ' + r.degradation_profile.annual_capacity_fade_pct + '% | Cycles/year: ' + r.degradation_profile.cycles_per_year)
  lines.push('- Expected life: ' + r.degradation_profile.expected_life_years + ' years | Replacement year: ' + r.degradation_profile.replacement_year)
  lines.push('')

  lines.push('### Service Revenue Breakdown')
  lines.push('| Service | Annual Revenue ($) | Utilization (%) |')
  lines.push('|---------|-------------------|----------------|')
  for (const s of r.services_revenue_breakdown) {
    lines.push('| ' + s.service + ' | $' + s.annual_revenue_usd + ' | ' + s.utilization_pct + '% |')
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

function formatUtilityBillReport(r: UtilityBillResult): string {
  const lines: string[] = []
  lines.push('## Utility Bill Analyzer Report')
  lines.push('')
  lines.push('Account: ' + r.account_id + ' | YoY Change: ' + r.current_bill_analysis.year_over_year_change_pct + '% | Utility Burden: ' + r.current_bill_analysis.utility_burden_pct + '%')
  lines.push('Annual Potential Savings: $' + r.total_potential_savings_usd + ' (' + r.total_potential_savings_pct + '%) | CO2 Footprint: ' + r.co2_footprint_t + ' tonnes')
  lines.push('')

  lines.push('### Current Bill Analysis')
  lines.push('| Effective Rate ($/kWh) | Cost/SqFt | YoY Change (%) | Trend |')
  lines.push('|----------------------|----------|----------------|-------|')
  lines.push('| $' + r.current_bill_analysis.current_effective_rate_per_kwh + ' | $' + r.current_bill_analysis.cost_per_sqft_usd + ' | ' + r.current_bill_analysis.year_over_year_change_pct + '% | ' + r.benchmark_comparison + ' |')
  lines.push('')

  lines.push('### Rate Comparisons')
  lines.push('| Rate Schedule | Est. Annual Cost | Annual Savings | Savings (%) | DR | Net Meter |')
  lines.push('|--------------|------------------|---------------|------------|-----|----------|')
  for (const rc of r.rate_comparisons) {
    lines.push('| ' + rc.rate_schedule + ' | $' + rc.estimated_annual_cost_usd + ' | $' + rc.annual_savings_usd + ' | ' + rc.savings_pct + '% | ' + (rc.demand_response_compatible ? 'Y' : 'N') + ' | ' + (rc.net_metering_compatible ? 'Y' : 'N') + ' |')
  }
  lines.push('')

  lines.push('### Savings Opportunities')
  lines.push('| Measure | Annual Savings ($) | Cost ($) | Payback (yr) | CO2 (t) | Priority |')
  lines.push('|---------|--------------------|----------|-------------|---------|----------|')
  for (const so of r.savings_opportunities) {
    lines.push('| ' + so.measure + ' | $' + so.annual_savings_usd + ' | $' + so.implementation_cost_usd + ' | ' + so.payback_years + ' | ' + so.co2_reduction_t + ' | ' + so.priority + ' |')
  }
  lines.push('')

  lines.push('### Billing Anomalies')
  for (const err of r.billing_errors_detected) {
    lines.push('- ' + err)
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ' + DISCLAIMER + '*')
  return lines.join('\n')
}

// ==================== SECTION 5 -- Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Grid Optimization Engine
  tools.register(defineTool({
    name: 'grid_optimization_engine',
    description: 'Power flow optimization, loss minimization, and Volt/VAR control for distribution and transmission grids | Grid optimization with convergence analysis and voltage profile management.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: grid_id, topology{buses,branches,generators,loads}, voltage_kv, total_load_mw, total_generation_mw, renewable_generation_mw, loss_target_pct, var_devices, tap_changers, optimization_objective (loss_min|voltage_profile|reactive_power|multi_objective)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GridOptimizationInput = JSON.parse(args.input_data)
      return formatGridOptimizationReport(analyzeGridOptimization(input))
    }
  }))

  // Tool 2: Demand Forecasting Modeler
  tools.register(defineTool({
    name: 'demand_forecasting_modeler',
    description: 'Multi-horizon demand forecasting with weather scenarios, day-type analysis, and peak-valley assessment | Demand forecasting based on historical load, temperature, humidity, and calendar effects.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: region_id, forecast_horizon_hours, historical_load_mw[], temperature_c, humidity_pct, day_type (weekday|weekend|holiday), season (spring|summer|autumn|winter), special_event?, industrial_pct, commercial_pct, residential_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: DemandForecastInput = JSON.parse(args.input_data)
      return formatDemandForecastReport(analyzeDemandForecast(input))
    }
  }))

  // Tool 3: Renewable Integration Planner
  tools.register(defineTool({
    name: 'renewable_integration_planner',
    description: 'Renewable grid integration planning, curtailment reduction strategies, and storage sizing | Solar/wind integration with hosting capacity analysis and multi-constraint evaluation.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: project_id, solar_capacity_mw, wind_capacity_mw, current_renewable_mw, grid_capacity_mw, interconnection_limit_mw, storage_existing_mwh, storage_proposed_mwh, curtailment_target_pct, grid_flexibility (low|medium|high), technology (solar_pv|wind_onshore|wind_offshore|hybrid|csp)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RenewableIntegrationInput = JSON.parse(args.input_data)
      return formatRenewableIntegrationReport(analyzeRenewableIntegration(input))
    }
  }))

  // Tool 4: Energy Trading Advisor
  tools.register(defineTool({
    name: 'energy_trading_advisor',
    description: 'Energy market trading signals, price forecasting, portfolio risk analytics, and REC/carbon management | Energy trading advisory with VaR, CVaR, and multi-market optimization.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: market_id, participant_id, trading_date, market_type (day_ahead|real_time|forward|ancillary|capacity), portfolio_position_mwh, generation_capacity_mw, marginal_cost_per_mwh, price_forecast_per_mwh[], price_volatility_pct, risk_tolerance (conservative|moderate|aggressive), credit_limit_usd, renewable_certificates, carbon_allowance_t'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EnergyTradingInput = JSON.parse(args.input_data)
      return formatEnergyTradingReport(analyzeEnergyTrading(input))
    }
  }))

  // Tool 5: Outage Management Coordinator
  tools.register(defineTool({
    name: 'outage_management_coordinator',
    description: 'Outage detection, fault isolation, crew dispatch, and restoration planning with reliability index calculation | Outage management with SAIFI/SAIDI/CAIDI impact assessment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: outage_id, grid_segment_id, fault_type (equipment_failure|weather|vegetation|animal|vehicle|unknown), fault_location{lat,lon}, affected_customers, detection_time, crew_available, weather_conditions, priority_customers[], backup_feeders[], scada_status (online|degraded|offline)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: OutageManagementInput = JSON.parse(args.input_data)
      return formatOutageManagementReport(analyzeOutageManagement(input))
    }
  }))

  // Tool 6: Power Quality Analyzer
  tools.register(defineTool({
    name: 'power_quality_analyzer',
    description: 'Power quality assessment including voltage analysis, harmonic THD, flicker, power factor, and multi-standard compliance | Power quality analysis per IEEE 519, EN 50160, GB/T 12325, IEC 61000.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: monitoring_point_id, voltage_level_kv, measurements{voltage_l1/l2/l3_v, current_l1/l2/l3_a, active_power_kw, reactive_power_kvar, frequency_hz}, harmonic_data{h3,h5,h7,h9,h11,h13}_pct, flicker_pst, flicker_plt, standard (ieee_519|en_50160|gb_t_12325|iec_61000)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PowerQualityInput = JSON.parse(args.input_data)
      return formatPowerQualityReport(analyzePowerQuality(input))
    }
  }))

  // Tool 7: Energy Storage Optimizer
  tools.register(defineTool({
    name: 'energy_storage_optimizer',
    description: 'Battery storage sizing, charge/discharge optimization, economic analysis, and service stacking revenue | Energy storage optimization with NPV, IRR, LCOS, and degradation modeling.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: project_id, storage_technology (lithium_ion|flow_battery|compressed_air|pumped_hydro|flywheel|hydrogen), capacity_mwh, power_rating_mw, round_trip_efficiency_pct, cycle_life, dod_limit_pct, services[], electricity_prices[{hour,price_per_mwh}], demand_charge_per_kw, grid_service_market_prices{frequency_regulation,spinning_reserve,capacity}, capital_cost_per_kwh, om_cost_per_kwh_year'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EnergyStorageInput = JSON.parse(args.input_data)
      return formatEnergyStorageReport(analyzeEnergyStorage(input))
    }
  }))

  // Tool 8: Utility Bill Analyzer
  tools.register(defineTool({
    name: 'utility_bill_analyzer',
    description: 'Utility bill analysis, rate schedule comparison, savings opportunity identification, and billing anomaly detection | Utility bill analysis with benchmarking, savings measures, and CO2 footprint.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: account_id, utility_name, facility_type (commercial|industrial|residential|municipal|data_center), billing_period_months, consumption_kwh, demand_kw, peak_demand_kw, off_peak_demand_kw, current_rate_schedule, energy_charges, demand_charges, fixed_charges, taxes_and_fees, total_bill_usd, power_factor_penalty, time_of_use{peak,off_peak,shoulder}_pct, alternative_rate_schedules[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: UtilityBillInput = JSON.parse(args.input_data)
      return formatUtilityBillReport(analyzeUtilityBill(input))
    }
  }))

  console.log('[dsh-tool-energygrid] Loaded v' + VERSION + ' -- Energy Grid & Utilities, 8 tools active')
  console.log('  Tools: grid_optimization_engine, demand_forecasting_modeler, renewable_integration_planner, energy_trading_advisor, outage_management_coordinator, power_quality_analyzer, energy_storage_optimizer, utility_bill_analyzer')
}
